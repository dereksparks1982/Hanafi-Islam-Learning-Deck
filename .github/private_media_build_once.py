from pathlib import Path

PAGE = Path("web-viewer/advanced-library/index.html")
BRIDGE = Path("media-server/jellyfin_bridge.py")

page = PAGE.read_text(encoding="utf-8")
approved_background = 'background-image: url("../assets/hanafi-advanced-library-background-approved.png?rev=20260924a");'
lock_guard = 'sessionStorage.getItem("hanafi-advanced-library-unlocked") !== "1"'
if approved_background not in page:
    raise SystemExit("STOP: approved Private Library background is not the expected source")
if lock_guard not in page:
    raise SystemExit("STOP: accepted Private Library lock guard is not present")

css_start_marker = "    .private-movies[hidden],.library-shelf-shell[hidden]{display:none!important}"
css_start = page.index(css_start_marker)
css_end = page.index("</style>", css_start)
new_css = '''    .private-movies[hidden],.library-shelf-shell[hidden]{display:none!important}
    .private-movies{position:fixed;top:72px;bottom:0;left:50%;z-index:21;width:min(1120px,calc(100% - 2rem));transform:translateX(-50%);overflow:auto;padding:0 0 3rem;border:0!important;border-radius:0!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
    .private-media-header{padding:1.2rem 0 .35rem}
    .private-media-eyebrow{margin:0 0 .35rem;color:#d8b560;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:.78rem}
    .private-media-header h1{margin:0;max-width:18ch;font-family:Georgia,"Times New Roman",serif;font-size:clamp(2.2rem,8vw,4.8rem);line-height:.95;color:#f7f1df}
    .private-library-head{display:flex;justify-content:space-between;align-items:end;gap:1rem;flex-wrap:wrap;margin:1rem 0}
    .private-library-head h2{font-family:Georgia,"Times New Roman",serif;font-size:1.5rem;margin:0;color:#f4f1e8}
    .private-library-head p{margin:.35rem 0 0;color:#d8d2c2}
    .private-view-toggle{display:flex;gap:.4rem}
    .private-view-toggle button{border:1px solid rgba(216,181,96,.35);background:#111;color:#eee;border-radius:9px;padding:.6rem .85rem;cursor:pointer}
    .private-view-toggle button[aria-pressed="true"]{background:#d8b560;color:#111}
    .private-movie-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1rem}
    .private-movie-card{display:block;text-decoration:none;color:inherit;border:1px solid rgba(216,181,96,.28);border-radius:16px;overflow:hidden;background:#101412;transition:transform .15s,border-color .15s}
    .private-movie-card:hover{transform:translateY(-2px);border-color:#d8b560}
    .private-movie-link{display:block;text-decoration:none;color:inherit}
    .private-movie-poster{aspect-ratio:2/3;position:relative;background:linear-gradient(160deg,#17271f,#050706 70%);overflow:hidden}
    .private-movie-poster img{width:100%;height:100%;object-fit:cover;display:block;transform:scaleX(var(--art-scale-x,var(--art-scale,1))) scaleY(var(--art-scale-y,var(--art-scale,1)));transform-origin:center var(--art-y,50%);object-position:center var(--art-y,50%)}
    .private-movie-fallback{position:absolute;inset:0;display:grid;place-items:end start;padding:1rem;font-size:1.2rem;font-weight:800;color:#f4f1e8}
    .private-card-info{padding:.7rem .8rem}
    .private-card-info h2{font-size:1rem;margin:0}
    .private-movie-grid.list{display:flex;flex-direction:column;gap:.55rem}
    .private-movie-grid.list .private-movie-card{display:grid;grid-template-columns:1fr auto;align-items:center}
    .private-movie-grid.list .private-movie-link{display:grid!important;grid-template-columns:72px 1fr;align-items:center}
    .private-movie-grid.list .private-movie-poster{aspect-ratio:2/3;width:54px;height:80px;min-height:0;padding:0}
    .private-movie-grid.list .private-card-info{display:block}
    .private-tech-credit{text-align:center;color:#8f938d;font-size:.72rem;margin-top:2rem}
    @media(max-width:520px){.private-movie-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}.private-movie-poster{font-size:1rem}.private-movie-grid.list .private-card-info{display:block}}
'''
page = page[:css_start] + new_css + page[css_end:]

old_section = '''    <section id="privateMovies" class="private-movies" hidden aria-label="Private movie collection">
      <div id="privateMovieGrid" class="private-movie-grid"></div>
    </section>'''
new_section = '''    <section id="privateMovies" class="private-movies" hidden aria-label="Private Media">
      <header class="private-media-header">
        <p class="private-media-eyebrow">Hanafi Learning Deck</p>
        <h1>Private Media</h1>
      </header>
      <div class="private-library-head">
        <div>
          <h2>Films</h2>
          <p>Choose a film to view editions, subtitles, details and sources.</p>
        </div>
        <div class="private-view-toggle" aria-label="Private Media view">
          <button id="privateCards" type="button" aria-pressed="true">Cards</button>
          <button id="privateList" type="button" aria-pressed="false">List</button>
        </div>
      </div>
      <section id="privateMovieGrid" class="private-movie-grid" aria-label="Private films"></section>
      <p class="private-tech-credit">DK Media · Nougat Media Core</p>
    </section>'''
if old_section not in page:
    raise SystemExit("STOP: current Private Movies section was not found")
page = page.replace(old_section, new_section, 1)

old_declarations = '''      const privateMovies = document.getElementById("privateMovies");
      const privateMovieGrid = document.getElementById("privateMovieGrid");
      let privateMoviesLoaded = false;'''
new_declarations = '''      const privateMovies = document.getElementById("privateMovies");
      const privateMovieGrid = document.getElementById("privateMovieGrid");
      const privateCards = document.getElementById("privateCards");
      const privateList = document.getElementById("privateList");
      let privateMoviesLoaded = false;'''
if old_declarations not in page:
    raise SystemExit("STOP: current Private Movies bindings were not found")
page = page.replace(old_declarations, new_declarations, 1)

old_show_books = '''      const showBooks = () => {
        document.querySelector(".library-shelf-shell").hidden = false;
        privateMovies.hidden = true;
        booksMode.setAttribute("aria-pressed","true");
        moviesMode.setAttribute("aria-pressed","false");
        history.replaceState({ privateLibraryMode:"books" }, "", location.pathname + location.search);
      };'''
new_show_books = '''      const showBooks = () => {
        document.querySelector(".library-shelf-shell").hidden = false;
        privateMovies.hidden = true;
        booksMode.setAttribute("aria-pressed","true");
        moviesMode.setAttribute("aria-pressed","false");
        document.title = "Advanced Learner Library";
        history.replaceState({ privateLibraryMode:"books" }, "", location.pathname + location.search);
      };'''
if old_show_books not in page:
    raise SystemExit("STOP: current Books mode function was not found")
page = page.replace(old_show_books, new_show_books, 1)

old_show_movies = '''      const showMovies = () => {
        document.querySelector(".library-shelf-shell").hidden = true;
        privateMovies.hidden = false;
        booksMode.setAttribute("aria-pressed","false");
        moviesMode.setAttribute("aria-pressed","true");
        loadPrivateMovies();
        history.replaceState({ privateLibraryMode:"movies" }, "", location.pathname + location.search + "#movies");
      };'''
new_show_movies = '''      const showMovies = () => {
        document.querySelector(".library-shelf-shell").hidden = true;
        privateMovies.hidden = false;
        booksMode.setAttribute("aria-pressed","false");
        moviesMode.setAttribute("aria-pressed","true");
        document.title = "Private Media · Hanafi Learning Deck";
        loadPrivateMovies();
        history.replaceState({ privateLibraryMode:"movies" }, "", location.pathname + location.search + "#movies");
      };'''
if old_show_movies not in page:
    raise SystemExit("STOP: current Movies mode function was not found")
page = page.replace(old_show_movies, new_show_movies, 1)

function_start = page.index("      function loadPrivateMovies() {")
function_end = page.index("      booksMode.addEventListener", function_start)
new_loader = '''      function loadPrivateMovies() {
        if (privateMoviesLoaded) return;
        privateMovieGrid.replaceChildren();
        for (const item of privateMovieCatalog) {
          const card = document.createElement("article");
          card.className = "private-movie-card";
          const href = "../media/movie.html?private=1&return=private-movies&media=" + encodeURIComponent(item.id) + "&title=" + encodeURIComponent(item.title);
          card.innerHTML = '<a class="private-movie-link" href="' + href + '"><div class="private-movie-poster"><span class="private-movie-fallback">' + item.title + '</span></div><div class="private-card-info"><h2>' + item.title + '</h2></div></a>';
          const poster = card.querySelector(".private-movie-poster");
          const fallback = card.querySelector(".private-movie-fallback");
          if (window.HanafiArtworkManager) {
            window.HanafiArtworkManager.resolve(item).then(resolved => {
              if (!resolved?.url) return;
              const img = new Image();
              img.alt = item.title + " poster";
              img.style.setProperty("--art-scale", resolved.crop?.scale || 1);
              img.style.setProperty("--art-scale-x", resolved.crop?.scaleX || resolved.crop?.scale || 1);
              img.style.setProperty("--art-scale-y", resolved.crop?.scaleY || resolved.crop?.scale || 1);
              img.style.setProperty("--art-y", resolved.crop?.y || "50%");
              img.style.objectPosition = (resolved.crop?.x || "50%") + " " + (resolved.crop?.y || "50%");
              exactPosterArtwork(resolved.url).then(exactUrl => {
                img.onload = () => { poster.appendChild(img); fallback.hidden = true; };
                img.src = exactUrl;
              }).catch(() => {
                img.onload = () => { poster.appendChild(img); fallback.hidden = true; };
                img.src = resolved.url;
              });
            }).catch(() => {});
          }
          privateMovieGrid.appendChild(card);
        }
        privateMoviesLoaded = true;
      }

      const setPrivateView = view => {
        privateMovieGrid.classList.toggle("list", view === "list");
        privateCards.setAttribute("aria-pressed", view === "cards" ? "true" : "false");
        privateList.setAttribute("aria-pressed", view === "list" ? "true" : "false");
      };
      privateCards.addEventListener("click", () => setPrivateView("cards"));
      privateList.addEventListener("click", () => setPrivateView("list"));

'''
page = page[:function_start] + new_loader + page[function_end:]

if approved_background not in page or lock_guard not in page:
    raise SystemExit("STOP: background or lock changed unexpectedly")
if "4 private movies" in page or "privateMovieStatus" in page:
    raise SystemExit("STOP: private movie count/status text remains")
if '<h1>Private Media</h1>' not in page or 'id="privateCards"' not in page or 'id="privateList"' not in page:
    raise SystemExit("STOP: Private Media structure was not created")
PAGE.write_text(page, encoding="utf-8")

bridge = BRIDGE.read_text(encoding="utf-8")
old_private_route = '''        if parsed.path == '/nougat/v1/private/media':
            item = private_items().get(media_id)
            if not item:
                self.json_response(404, {'ok': False, 'error': 'Unknown private media id.'}, head)
                return
            # Private Library accepts arbitrary source containers/codecs.
            # Always normalize playback through FFmpeg to browser-safe H.264/AAC MP4
            # instead of assuming that a .webm/.mp4 container is browser-decodable.
            self.stream_ffmpeg(item, head)
            return
'''
new_private_route = '''        if parsed.path == '/nougat/v1/private/media':
            item = private_items().get(media_id)
            if not item:
                self.json_response(404, {'ok': False, 'error': 'Unknown private media id.'}, head)
                return
            # Kingdom of Heaven is already a browser-safe H.264/AAC MP4.
            # Serve that finished file with normal byte ranges instead of live transcoding.
            # Other private titles retain their current behavior until separately approved.
            if media_id == 'kingdom-of-heaven-2005':
                self.stream_local_file(item, head)
            else:
                self.stream_ffmpeg(item, head)
            return
'''
if old_private_route not in bridge:
    raise SystemExit("STOP: current private media route was not found")
bridge = bridge.replace(old_private_route, new_private_route, 1)
BRIDGE.write_text(bridge, encoding="utf-8")
