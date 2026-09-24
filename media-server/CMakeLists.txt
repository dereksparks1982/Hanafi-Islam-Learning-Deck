cmake_minimum_required(VERSION 3.16)
project(HanafiNougatMediaServer VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(Threads REQUIRED)

add_executable(hanafi-nougat-media-server
    src/main.cpp
)

target_compile_options(hanafi-nougat-media-server PRIVATE -Wall -Wextra -Werror)
target_link_libraries(hanafi-nougat-media-server PRIVATE Threads::Threads)

install(TARGETS hanafi-nougat-media-server RUNTIME DESTINATION bin)
