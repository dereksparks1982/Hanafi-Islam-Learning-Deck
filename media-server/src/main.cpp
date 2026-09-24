// Hanafi Learning Deck media server
//
// This is a deliberately small extraction of the HTTP byte-range streaming
// approach used by Nougat Media Plus's LAN Web Player.  It does not include
// Nougat's UI, Jellyfin integration, console/game systems, Live TV, security
// center, crawler, P2P, or other application layers.

#include <algorithm>
#include <atomic>
#include <cerrno>
#include <cctype>
#include <csignal>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <fcntl.h>
#include <fstream>
#include <iostream>
#include <map>
#include <memory>
#include <mutex>
#include <netinet/in.h>
#include <sstream>
#include <string>
#include <sys/select.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <thread>
#include <unistd.h>
#include <utility>
#include <vector>
#include <arpa/inet.h>

namespace {

constexpr std::size_t kMaxRequestBytes = 64U * 1024U;
constexpr int kMaxConcurrentClients = 16;
constexpr std::size_t kStreamBufferBytes = 128U * 1024U;

std::atomic<bool> g_running{true};

void handle_signal(int) {
    g_running.store(false);
}

std::string getenv_or(const char* name, const std::string& fallback) {
    const char* value = std::getenv(name);
    return value && *value ? std::string(value) : fallback;
}

std::string lower_ascii(std::string value) {
    for (char& c : value) {
        c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    }
    return value;
}

std::string extension_lower(const std::string& path) {
    const std::size_t slash = path.find_last_of('/');
    const std::size_t dot = path.find_last_of('.');
    if (dot == std::string::npos || (slash != std::string::npos && dot < slash)) return {};
    return lower_ascii(path.substr(dot));
}

std::string infer_media_type(const std::string& path) {
    const std::string extension = extension_lower(path);
    if (extension == ".mp4" || extension == ".m4v") return "video/mp4";
    if (extension == ".webm") return "video/webm";
    if (extension == ".ogv" || extension == ".ogg") return "video/ogg";
    if (extension == ".mov") return "video/quicktime";
    if (extension == ".mkv") return "video/x-matroska";
    if (extension == ".avi") return "video/x-msvideo";
    if (extension == ".ts" || extension == ".m2ts") return "video/mp2t";
    return "application/octet-stream";
}

bool regular_file(const std::string& path, struct stat& info) {
    return !path.empty() && stat(path.c_str(), &info) == 0 && S_ISREG(info.st_mode);
}

std::string trim_cr(std::string value) {
    if (!value.empty() && value.back() == '\r') value.pop_back();
    return value;
}

std::vector<std::string> split_tabs(const std::string& line) {
    std::vector<std::string> fields;
    std::size_t start = 0;
    while (start <= line.size()) {
        const std::size_t tab = line.find('\t', start);
        fields.push_back(line.substr(start, tab == std::string::npos ? std::string::npos : tab - start));
        if (tab == std::string::npos) break;
        start = tab + 1U;
    }
    return fields;
}

struct MediaItem {
    std::string id;
    std::string path;
    std::string content_type;
    std::string subtitle_path;
};

class MediaCatalog {
public:
    bool load(const std::string& manifest_path, std::string& error) {
        std::ifstream input(manifest_path);
        if (!input) {
            error = "Could not open media manifest: " + manifest_path;
            return false;
        }

        std::map<std::string, MediaItem> next;
        std::string line;
        std::size_t line_number = 0;
        while (std::getline(input, line)) {
            ++line_number;
            line = trim_cr(line);
            if (line.empty() || line[0] == '#') continue;

            const std::vector<std::string> fields = split_tabs(line);
            if (fields.size() < 2U || fields[0].empty() || fields[1].empty()) {
                error = "Invalid manifest row at line " + std::to_string(line_number) + ".";
                return false;
            }

            MediaItem item;
            item.id = fields[0];
            item.path = fields[1];
            item.content_type = fields.size() >= 3U && !fields[2].empty()
                ? fields[2]
                : infer_media_type(item.path);
            if (fields.size() >= 4U) item.subtitle_path = fields[3];

            if (next.find(item.id) != next.end()) {
                error = "Duplicate media id in manifest: " + item.id;
                return false;
            }
            next.emplace(item.id, std::move(item));
        }

        if (next.empty()) {
            error = "Media manifest contains no playable items.";
            return false;
        }

        std::lock_guard<std::mutex> lock(mutex_);
        items_ = std::move(next);
        return true;
    }

    bool find(const std::string& id, MediaItem& item) const {
        std::lock_guard<std::mutex> lock(mutex_);
        const auto found = items_.find(id);
        if (found == items_.end()) return false;
        item = found->second;
        return true;
    }

    std::vector<MediaItem> all() const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<MediaItem> result;
        result.reserve(items_.size());
        for (const auto& pair : items_) result.push_back(pair.second);
        return result;
    }

private:
    mutable std::mutex mutex_;
    std::map<std::string, MediaItem> items_;
};

std::string json_escape(const std::string& value) {
    std::string out;
    out.reserve(value.size() + 16U);
    for (const unsigned char c : value) {
        switch (c) {
        case '\\': out += "\\\\"; break;
        case '"': out += "\\\""; break;
        case '\b': out += "\\b"; break;
        case '\f': out += "\\f"; break;
        case '\n': out += "\\n"; break;
        case '\r': out += "\\r"; break;
        case '\t': out += "\\t"; break;
        default:
            if (c < 0x20U) {
                static constexpr char hex[] = "0123456789abcdef";
                out += "\\u00";
                out.push_back(hex[(c >> 4U) & 0x0fU]);
                out.push_back(hex[c & 0x0fU]);
            } else {
                out.push_back(static_cast<char>(c));
            }
            break;
        }
    }
    return out;
}

std::string percent_decode(const std::string& value) {
    std::string out;
    out.reserve(value.size());
    for (std::size_t i = 0; i < value.size(); ++i) {
        if (value[i] == '%' && i + 2U < value.size()) {
            const auto hex_value = [](char c) -> int {
                if (c >= '0' && c <= '9') return c - '0';
                if (c >= 'a' && c <= 'f') return c - 'a' + 10;
                if (c >= 'A' && c <= 'F') return c - 'A' + 10;
                return -1;
            };
            const int hi = hex_value(value[i + 1U]);
            const int lo = hex_value(value[i + 2U]);
            if (hi >= 0 && lo >= 0) {
                out.push_back(static_cast<char>((hi << 4) | lo));
                i += 2U;
                continue;
            }
        }
        out.push_back(value[i] == '+' ? ' ' : value[i]);
    }
    return out;
}

std::map<std::string, std::string> query_values(const std::string& query) {
    std::map<std::string, std::string> values;
    std::size_t start = 0;
    while (start <= query.size()) {
        const std::size_t amp = query.find('&', start);
        const std::string pair = query.substr(
            start, amp == std::string::npos ? std::string::npos : amp - start);
        const std::size_t equal = pair.find('=');
        if (equal == std::string::npos) values[percent_decode(pair)] = {};
        else values[percent_decode(pair.substr(0, equal))] = percent_decode(pair.substr(equal + 1U));
        if (amp == std::string::npos) break;
        start = amp + 1U;
    }
    return values;
}

bool send_all(int client, const char* data, std::size_t bytes) {
    std::size_t sent = 0;
    while (sent < bytes) {
        const ssize_t amount = send(client, data + sent, bytes - sent, MSG_NOSIGNAL);
        if (amount <= 0) return false;
        sent += static_cast<std::size_t>(amount);
    }
    return true;
}

bool send_all(int client, const std::string& data) {
    return send_all(client, data.data(), data.size());
}

std::string cors_headers(const std::string& allowed_origin) {
    std::ostringstream out;
    out << "Access-Control-Allow-Origin: " << allowed_origin << "\r\n"
        << "Access-Control-Allow-Methods: GET, HEAD, OPTIONS\r\n"
        << "Access-Control-Allow-Headers: Range, Content-Type\r\n"
        << "Access-Control-Expose-Headers: Accept-Ranges, Content-Range, Content-Length\r\n"
        << "Vary: Origin\r\n";
    return out.str();
}

bool send_response(int client,
                   int status,
                   const char* reason,
                   const std::string& content_type,
                   const std::string& body,
                   const std::string& allowed_origin,
                   bool head_only = false,
                   const std::vector<std::pair<std::string, std::string>>& extra_headers = {}) {
    std::ostringstream header;
    header << "HTTP/1.1 " << status << ' ' << reason << "\r\n"
           << "Server: Hanafi-Nougat-Media/0.1\r\n"
           << "Content-Type: " << content_type << "\r\n"
           << "Content-Length: " << body.size() << "\r\n"
           << "Cache-Control: no-store\r\n"
           << "X-Content-Type-Options: nosniff\r\n"
           << cors_headers(allowed_origin)
           << "Connection: close\r\n";
    for (const auto& item : extra_headers) {
        header << item.first << ": " << item.second << "\r\n";
    }
    header << "\r\n";
    if (!send_all(client, header.str())) return false;
    return head_only || body.empty() || send_all(client, body);
}

bool send_json_error(int client,
                     int status,
                     const char* reason,
                     const std::string& message,
                     const std::string& allowed_origin) {
    return send_response(client, status, reason, "application/json; charset=utf-8",
                         "{\"ok\":false,\"error\":\"" + json_escape(message) + "\"}",
                         allowed_origin);
}

struct ByteRange {
    bool requested = false;
    bool valid = false;
    off_t first = 0;
    off_t last = 0;
};

ByteRange parse_range(const std::string& value, off_t size) {
    ByteRange range;
    if (value.empty()) return range;
    range.requested = true;
    if (size <= 0 || value.rfind("bytes=", 0U) != 0U) return range;
    const std::string spec = value.substr(6U);
    if (spec.find(',') != std::string::npos) return range;
    const std::size_t dash = spec.find('-');
    if (dash == std::string::npos) return range;

    const std::string first_text = spec.substr(0, dash);
    const std::string last_text = spec.substr(dash + 1U);
    try {
        if (first_text.empty()) {
            if (last_text.empty()) return range;
            const long long suffix = std::stoll(last_text);
            if (suffix <= 0) return range;
            const off_t count = static_cast<off_t>(std::min<long long>(suffix, size));
            range.first = size - count;
            range.last = size - 1;
        } else {
            const long long parsed_first = std::stoll(first_text);
            if (parsed_first < 0 || parsed_first >= size) return range;
            range.first = static_cast<off_t>(parsed_first);
            if (last_text.empty()) {
                range.last = size - 1;
            } else {
                const long long parsed_last = std::stoll(last_text);
                if (parsed_last < parsed_first) return range;
                range.last = static_cast<off_t>(std::min<long long>(parsed_last, size - 1));
            }
        }
    } catch (...) {
        return range;
    }

    range.valid = range.first >= 0 && range.last >= range.first && range.last < size;
    return range;
}

std::string request_header_value(const std::string& request, const std::string& wanted) {
    const std::string lower_wanted = lower_ascii(wanted);
    std::size_t line_start = request.find("\r\n");
    if (line_start == std::string::npos) return {};
    line_start += 2U;
    while (line_start < request.size()) {
        const std::size_t line_end = request.find("\r\n", line_start);
        if (line_end == std::string::npos || line_end == line_start) break;
        const std::string line = request.substr(line_start, line_end - line_start);
        const std::size_t colon = line.find(':');
        if (colon != std::string::npos && lower_ascii(line.substr(0, colon)) == lower_wanted) {
            std::size_t value_start = colon + 1U;
            while (value_start < line.size() &&
                   std::isspace(static_cast<unsigned char>(line[value_start])) != 0) {
                ++value_start;
            }
            return line.substr(value_start);
        }
        line_start = line_end + 2U;
    }
    return {};
}

std::string read_text_file(const std::string& path) {
    std::ifstream input(path, std::ios::binary);
    if (!input) return {};
    std::ostringstream out;
    out << input.rdbuf();
    return out.str();
}

std::string srt_to_webvtt(std::string text) {
    if (text.size() >= 3U &&
        static_cast<unsigned char>(text[0]) == 0xefU &&
        static_cast<unsigned char>(text[1]) == 0xbbU &&
        static_cast<unsigned char>(text[2]) == 0xbfU) {
        text.erase(0, 3U);
    }

    std::istringstream input(text);
    std::ostringstream output;
    output << "WEBVTT\n\n";
    std::string line;
    while (std::getline(input, line)) {
        line = trim_cr(line);
        if (line.find(" --> ") != std::string::npos) {
            std::replace(line.begin(), line.end(), ',', '.');
        }
        output << line << '\n';
    }
    return output.str();
}

struct SharedState {
    std::shared_ptr<MediaCatalog> catalog;
    std::string allowed_origin;
    std::atomic<int> active_clients{0};
};

bool send_catalog(int client, const SharedState& state, bool head_only) {
    const std::vector<MediaItem> items = state.catalog->all();
    std::ostringstream json;
    json << "{\"ok\":true,\"service\":\"Hanafi Nougat Media\",\"count\":"
         << items.size() << ",\"items\":[";
    for (std::size_t i = 0; i < items.size(); ++i) {
        if (i != 0U) json << ',';
        json << "{\"id\":\"" << json_escape(items[i].id)
             << "\",\"type\":\"" << json_escape(items[i].content_type)
             << "\",\"subtitles\":" << (items[i].subtitle_path.empty() ? "false" : "true")
             << '}';
    }
    json << "]}";
    return send_response(client, 200, "OK", "application/json; charset=utf-8",
                         json.str(), state.allowed_origin, head_only);
}

bool send_media(int client,
                const SharedState& state,
                const std::string& id,
                const std::string& range_header,
                bool head_only) {
    MediaItem item;
    if (!state.catalog->find(id, item)) {
        return send_json_error(client, 404, "Not Found", "Unknown media id.", state.allowed_origin);
    }

    struct stat info{};
    if (!regular_file(item.path, info)) {
        return send_json_error(client, 404, "Not Found", "Media file is unavailable.", state.allowed_origin);
    }

    const ByteRange range = parse_range(range_header, info.st_size);
    if (range.requested && !range.valid) {
        return send_response(client, 416, "Range Not Satisfiable", "text/plain; charset=utf-8", {},
                             state.allowed_origin, head_only,
                             {{"Content-Range", "bytes */" + std::to_string(static_cast<long long>(info.st_size))}});
    }

    const off_t first = range.valid ? range.first : 0;
    const off_t last = range.valid ? range.last : info.st_size - 1;
    const unsigned long long content_length = info.st_size > 0
        ? static_cast<unsigned long long>(last - first + 1)
        : 0ULL;

    std::ostringstream header;
    header << "HTTP/1.1 " << (range.valid ? 206 : 200)
           << (range.valid ? " Partial Content\r\n" : " OK\r\n")
           << "Server: Hanafi-Nougat-Media/0.1\r\n"
           << "Content-Type: " << item.content_type << "\r\n"
           << "Content-Length: " << content_length << "\r\n"
           << "Accept-Ranges: bytes\r\n"
           << "Cache-Control: public, max-age=3600\r\n"
           << "X-Content-Type-Options: nosniff\r\n"
           << cors_headers(state.allowed_origin);
    if (range.valid) {
        header << "Content-Range: bytes " << static_cast<long long>(first) << '-'
               << static_cast<long long>(last) << '/'
               << static_cast<long long>(info.st_size) << "\r\n";
    }
    header << "Connection: close\r\n\r\n";

    if (!send_all(client, header.str()) || head_only || content_length == 0ULL) return true;

    const int file = open(item.path.c_str(), O_RDONLY);
    if (file < 0) return false;
    if (lseek(file, first, SEEK_SET) < 0) {
        close(file);
        return false;
    }

    unsigned long long remaining = content_length;
    std::vector<char> buffer(kStreamBufferBytes);
    bool ok = true;
    while (remaining > 0ULL && g_running.load()) {
        const std::size_t wanted = static_cast<std::size_t>(
            std::min<unsigned long long>(remaining, buffer.size()));
        const ssize_t amount = read(file, buffer.data(), wanted);
        if (amount <= 0) {
            ok = amount == 0;
            break;
        }
        if (!send_all(client, buffer.data(), static_cast<std::size_t>(amount))) {
            ok = false;
            break;
        }
        remaining -= static_cast<unsigned long long>(amount);
    }
    close(file);
    return ok && remaining == 0ULL;
}

bool send_subtitle(int client,
                   const SharedState& state,
                   const std::string& id,
                   bool head_only) {
    MediaItem item;
    if (!state.catalog->find(id, item)) {
        return send_json_error(client, 404, "Not Found", "Unknown media id.", state.allowed_origin);
    }
    if (item.subtitle_path.empty()) {
        return send_json_error(client, 404, "Not Found", "No subtitle track is configured for this item.",
                               state.allowed_origin);
    }

    struct stat info{};
    if (!regular_file(item.subtitle_path, info)) {
        return send_json_error(client, 404, "Not Found", "Subtitle file is unavailable.", state.allowed_origin);
    }

    std::string body = read_text_file(item.subtitle_path);
    if (body.empty() && info.st_size > 0) {
        return send_json_error(client, 500, "Internal Server Error", "Subtitle file could not be read.",
                               state.allowed_origin);
    }

    if (extension_lower(item.subtitle_path) == ".srt") body = srt_to_webvtt(std::move(body));
    return send_response(client, 200, "OK", "text/vtt; charset=utf-8", body,
                         state.allowed_origin, head_only,
                         {{"Cache-Control", "public, max-age=3600"}});
}

void handle_client(int client, const std::shared_ptr<SharedState>& state) {
    struct Guard {
        std::shared_ptr<SharedState> state;
        ~Guard() { state->active_clients.fetch_sub(1); }
    } guard{state};

    timeval receive_timeout{5, 0};
    timeval send_timeout{30, 0};
    setsockopt(client, SOL_SOCKET, SO_RCVTIMEO, &receive_timeout, sizeof(receive_timeout));
    setsockopt(client, SOL_SOCKET, SO_SNDTIMEO, &send_timeout, sizeof(send_timeout));

    std::string request;
    char buffer[4096];
    while (request.size() < kMaxRequestBytes && request.find("\r\n\r\n") == std::string::npos) {
        const ssize_t amount = recv(client, buffer, sizeof(buffer), 0);
        if (amount <= 0) break;
        request.append(buffer, static_cast<std::size_t>(amount));
    }

    if (request.find("\r\n\r\n") == std::string::npos) {
        send_json_error(client, 400, "Bad Request", "Incomplete HTTP request.", state->allowed_origin);
        close(client);
        return;
    }

    const std::size_t line_end = request.find("\r\n");
    std::istringstream first_line(request.substr(0, line_end));
    std::string method;
    std::string target;
    std::string protocol;
    first_line >> method >> target >> protocol;

    if (method == "OPTIONS") {
        send_response(client, 204, "No Content", "text/plain; charset=utf-8", {},
                      state->allowed_origin, true);
        close(client);
        return;
    }

    const bool head_only = method == "HEAD";
    if ((method != "GET" && !head_only) || target.empty() || protocol.rfind("HTTP/", 0U) != 0U) {
        send_json_error(client, 405, "Method Not Allowed", "Only GET, HEAD, and OPTIONS are supported.",
                        state->allowed_origin);
        close(client);
        return;
    }

    std::string path = target;
    std::string query;
    const std::size_t question = target.find('?');
    if (question != std::string::npos) {
        path = target.substr(0, question);
        query = target.substr(question + 1U);
    }
    const auto query_map = query_values(query);
    const auto id_it = query_map.find("id");
    const std::string id = id_it == query_map.end() ? std::string{} : id_it->second;

    if (path == "/nougat/v1/health") {
        send_response(client, 200, "OK", "application/json; charset=utf-8",
                      "{\"ok\":true,\"product\":\"Hanafi Learning Deck\",\"service\":\"Nougat Media Core\",\"version\":\"0.1.0\"}",
                      state->allowed_origin, head_only);
    } else if (path == "/nougat/v1/catalog") {
        send_catalog(client, *state, head_only);
    } else if (path == "/nougat/v1/media") {
        send_media(client, *state, id, request_header_value(request, "range"), head_only);
    } else if (path == "/nougat/v1/subtitle") {
        send_subtitle(client, *state, id, head_only);
    } else if (path == "/robots.txt") {
        send_response(client, 200, "OK", "text/plain; charset=utf-8",
                      "User-agent: *\nDisallow: /\n", state->allowed_origin, head_only);
    } else {
        send_json_error(client, 404, "Not Found", "Unknown route.", state->allowed_origin);
    }

    close(client);
}

std::uint16_t parse_port(const std::string& text) {
    try {
        const unsigned long parsed = std::stoul(text);
        if (parsed == 0UL || parsed > 65535UL) return 0;
        return static_cast<std::uint16_t>(parsed);
    } catch (...) {
        return 0;
    }
}

}  // namespace

int main() {
    std::signal(SIGTERM, handle_signal);
    std::signal(SIGINT, handle_signal);
    std::signal(SIGHUP, handle_signal);

    const std::string bind_address = getenv_or("HANAFI_MEDIA_BIND", "127.0.0.1");
    const std::uint16_t port = parse_port(getenv_or("HANAFI_MEDIA_PORT", "8096"));
    const std::string manifest = getenv_or("HANAFI_MEDIA_MANIFEST", "media.tsv");
    const std::string allowed_origin = getenv_or(
        "HANAFI_MEDIA_CORS_ORIGIN", "https://dereksparks1982.github.io");

    if (port == 0) {
        std::cerr << "Invalid HANAFI_MEDIA_PORT.\n";
        return 2;
    }

    auto catalog = std::make_shared<MediaCatalog>();
    std::string catalog_error;
    if (!catalog->load(manifest, catalog_error)) {
        std::cerr << catalog_error << '\n';
        return 2;
    }

    const int listener = socket(AF_INET, SOCK_STREAM, 0);
    if (listener < 0) {
        std::cerr << "Could not create server socket: " << std::strerror(errno) << '\n';
        return 2;
    }

    int enabled = 1;
    setsockopt(listener, SOL_SOCKET, SO_REUSEADDR, &enabled, sizeof(enabled));

    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_port = htons(port);
    if (inet_pton(AF_INET, bind_address.c_str(), &address.sin_addr) != 1) {
        std::cerr << "Invalid HANAFI_MEDIA_BIND IPv4 address.\n";
        close(listener);
        return 2;
    }

    if (bind(listener, reinterpret_cast<sockaddr*>(&address), sizeof(address)) != 0 ||
        listen(listener, 32) != 0) {
        std::cerr << "Could not bind " << bind_address << ':' << port << ": "
                  << std::strerror(errno) << '\n';
        close(listener);
        return 2;
    }

    auto state = std::make_shared<SharedState>();
    state->catalog = std::move(catalog);
    state->allowed_origin = allowed_origin;

    std::cout << "Hanafi Nougat Media Core listening on http://" << bind_address << ':' << port << '\n'
              << "Manifest: " << manifest << '\n'
              << "Allowed web origin: " << allowed_origin << '\n';

    while (g_running.load()) {
        fd_set read_set;
        FD_ZERO(&read_set);
        FD_SET(listener, &read_set);
        timeval timeout{0, 250000};
        const int ready = select(listener + 1, &read_set, nullptr, nullptr, &timeout);
        if (ready < 0) {
            if (errno == EINTR) continue;
            break;
        }
        if (ready == 0) continue;

        sockaddr_in peer{};
        socklen_t peer_length = sizeof(peer);
        const int client = accept(listener, reinterpret_cast<sockaddr*>(&peer), &peer_length);
        if (client < 0) continue;

        const int active = state->active_clients.fetch_add(1) + 1;
        if (active > kMaxConcurrentClients) {
            state->active_clients.fetch_sub(1);
            send_json_error(client, 503, "Service Unavailable", "Media server is busy.", allowed_origin);
            close(client);
            continue;
        }
        std::thread(handle_client, client, state).detach();
    }

    ::shutdown(listener, SHUT_RDWR);
    close(listener);

    while (state->active_clients.load() > 0) {
        std::this_thread::sleep_for(std::chrono::milliseconds(25));
    }

    std::cout << "Hanafi Nougat Media Core stopped.\n";
    return 0;
}
