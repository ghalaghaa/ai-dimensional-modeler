# fast-doc-search

A fast, fully offline full-text search tool for a personal folder of `.txt`
documents. No cloud calls, no internet connection needed, no external
libraries — just a C++ CLI built on the standard library and a real
inverted index.

## Who it's for

Anyone sitting on a growing pile of personal notes, meeting minutes,
recipes, book notes, journal entries, or exported docs and who wants
instant keyword search without shipping that content to a cloud service
or installing a heavyweight search engine. Point it at a folder, index
it once, then search it as many times as you like — entirely on your own
machine.

## Why an inverted index instead of `grep`

`grep -r` re-reads and re-scans every file on every single query — fine
for a handful of files, painfully slow once you have thousands of notes,
and it gives you no notion of *relevance*, only "matched" or "didn't
match."

This tool separates the two concerns:

- **`index`** does the expensive work exactly once: it walks the
  directory tree, tokenizes every document, and builds an inverted index
  (`term -> list of (document, term frequency)`), then serializes it to
  disk under `.index/`.
- **`search`** loads that saved index (a lightweight, already-parsed data
  structure) and looks each query term up directly — no file I/O on the
  document contents at all — then ranks matches with a TF-IDF-style
  score so the most relevant documents surface first, not just the first
  ones found.

The result: indexing cost is paid once per update to your notes folder,
while every subsequent search is effectively instant and ranked, which is
exactly the trade-off a personal search tool used many times a day wants.

## Project layout

```
06-fast-doc-search/
├── CMakeLists.txt
├── README.md
├── .gitignore
├── include/docsearch/
│   ├── tokenizer.hpp     # text -> lowercase, punctuation-free tokens
│   └── index.hpp         # InvertedIndex: build / save / load / search
├── src/
│   ├── tokenizer.cpp
│   ├── index.cpp
│   └── main.cpp          # CLI: `docsearch index ...` / `docsearch search ...`
├── tests/
│   └── test_main.cpp     # assert-free, self-contained PASS/FAIL harness
└── sample_docs/          # 7 short demo .txt files (recipes, meeting
                           # notes, travel itinerary, book & gardening notes)
```

`docsearch_lib` (the tokenizer + inverted index) is a plain static library
with zero CLI or I/O-formatting concerns baked in, so it's linked by both
the `docsearch` executable and the `docsearch_tests` executable — the
tests exercise the indexing and ranking logic directly, not through the
CLI.

## Building

Requires CMake 3.16+ and a C++17 compiler (developed with g++ 13.3, no
external dependencies).

```bash
cmake -B build
cmake --build build
```

This produces two binaries under `build/`:

- `build/docsearch` — the CLI tool
- `build/docsearch_tests` — the test suite

## Running the tests

```bash
./build/docsearch_tests
```

The harness has no dependency on GTest/Catch2 — it's a small `check(bool,
name)` helper that prints `[PASS]`/`[FAIL]` per assertion and returns a
nonzero exit code if anything failed. It covers:

- Tokenizer edge cases (punctuation stripped, case folded, whitespace
  variants, empty input, numbers, apostrophes splitting contractions).
- That a term appearing in only one document ranks that document highest
  (and that a term shared by several documents ranks the one with higher
  term frequency first).
- That empty queries, punctuation-only queries, and queries against an
  empty index all return zero results without crashing.
- `topN` truncation.
- A full `save()` / `load()` round trip against real temp files, including
  confirming non-`.txt` files are skipped during directory scanning.
- Loading a nonexistent index directory fails gracefully (`false`, no
  exception).

Actual output from this repo (25/25 checks passing):

```
Running docsearch test suite
-----------------------------
[PASS] tokenize: basic punctuation yields 2 tokens
[PASS] tokenize: lowercases 'Hello' -> 'hello'
[PASS] tokenize: strips '!!' from 'World!!'
[PASS] tokenize: empty string yields no tokens
[PASS] tokenize: punctuation-only input yields no tokens
[PASS] tokenize: mixed whitespace splits into 4 tokens
[PASS] tokenize: mixed whitespace tokens are correct and in order
[PASS] tokenize: numbers kept as tokens, apostrophe splits contraction
[PASS] search: 'apple' query returns at least one result
[PASS] search: term unique to one doc ranks that doc first
[PASS] search: term unique to one doc yields exactly one match
[PASS] search: 'cherry' matches the two docs containing it
[PASS] search: higher term frequency ranks first among docs sharing a term
[PASS] search: empty query string returns no results
[PASS] search: punctuation-only query returns no results
[PASS] search: term absent from every doc returns no results
[PASS] search: querying an index with zero documents returns no results
[PASS] search: topN caps the number of returned results
[PASS] buildFromDirectory: indexes only .txt files (2 of 3)
[PASS] save: writes index.txt to the target directory
[PASS] load: successfully reads a previously saved index
[PASS] load: document count matches the saved index
[PASS] load: search results after round-trip match the in-memory index
[PASS] load: top-ranked result is preserved across save/load
[PASS] load: returns false for a missing index directory instead of crashing
-----------------------------
All checks passed.
```

## Example usage against `sample_docs/`

Build the index once:

```bash
$ ./build/docsearch index sample_docs
Indexed 7 document(s) from 'sample_docs'.
Unique terms: 667
Index saved to: .index
```

Then search it as many times as you like — no re-scanning of the source
files happens on `search`, it only reads the saved `.index/index.txt`:

```bash
$ ./build/docsearch search chicken curry
Results for "chicken curry" (1 match):
  1. sample_docs/recipe_chicken_curry.txt  (score: 12.4538)

$ ./build/docsearch search search improvement project --top 3
Results for "search improvement project" (3 matches):
  1. sample_docs/meeting_notes_q3_planning.txt  (score: 13.8917)
  2. sample_docs/meeting_notes_standup_recap.txt  (score: 3.35384)
  3. sample_docs/book_notes_atomic_habits.txt  (score: 1.98083)

$ ./build/docsearch search kyoto temple
Results for "kyoto temple" (1 match):
  1. sample_docs/travel_itinerary_japan.txt  (score: 9.04825)

$ ./build/docsearch search zzzznomatchxyz
No matches found for query: "zzzznomatchxyz"
```

Note how the second query, "search improvement project", correctly ranks
the Q3 planning meeting notes (which discuss a "search improvement
project" directly) above the standup recap (which only mentions "search"
in the context of a document search tool) above the Atomic Habits notes
(which only match "improvement" tangentially) — that ranking is exactly
what plain `grep -l` cannot give you, since it only reports matches, not
relevance.

### CLI reference

```
docsearch index <directory> [--index-dir <path>]
    Recursively scans <directory> for .txt files, builds an inverted
    index in memory, and saves it (default location: ./.index).

docsearch search <query words...> [--index-dir <path>] [--top N]
    Loads a previously saved index and prints the top N matching
    files ranked by TF-IDF relevance (default N: 10).
```

## Implementation notes

- **Tokenization**: lowercases text and splits on any run of
  non-alphanumeric characters, so `"Hello, World!!"` becomes `["hello",
  "world"]`.
- **Index format**: a simple, human-readable text format
  (`.index/index.txt`) — a `DOCS` section mapping document id to file
  path, followed by a `TERMS` section mapping each term to its posting
  list (`docId:termFreq` pairs). Easy to inspect with `cat` while
  debugging.
- **Scoring**: for each query term, `idf = ln((N + 1) / (df + 1)) + 1`
  (smoothed so it's always positive) combined with a log-scaled term
  frequency (`1 + ln(tf)`) per matching document; scores are summed
  across query terms and results sorted descending, ties broken
  alphabetically by path.
- **Modern C++**: RAII throughout (`std::ifstream`/`std::ofstream`,
  `std::filesystem` for directory scanning), no raw owning pointers,
  standard containers (`std::vector`, `std::unordered_map`) for both the
  in-memory index and the postings lists.
