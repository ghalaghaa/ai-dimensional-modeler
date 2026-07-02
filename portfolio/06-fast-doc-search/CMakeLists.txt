cmake_minimum_required(VERSION 3.16)
project(fast_doc_search CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

add_compile_options(-Wall -Wextra -Wpedantic)

# ---- Library: indexing + search logic -------------------------------------
add_library(docsearch_lib
  src/tokenizer.cpp
  src/index.cpp
)
target_include_directories(docsearch_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

# ---- CLI executable ---------------------------------------------------------
add_executable(docsearch src/main.cpp)
target_link_libraries(docsearch PRIVATE docsearch_lib)

# ---- Tests -------------------------------------------------------------------
enable_testing()
add_executable(docsearch_tests tests/test_main.cpp)
target_link_libraries(docsearch_tests PRIVATE docsearch_lib)
add_test(NAME docsearch_tests COMMAND docsearch_tests)
