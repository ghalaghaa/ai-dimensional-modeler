// Self-contained test harness (no external test framework required).
// Each check() prints PASS/FAIL; main() returns nonzero if anything failed.

#include "docsearch/index.hpp"
#include "docsearch/tokenizer.hpp"

#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

namespace {

int g_failures = 0;

void check(bool condition, const std::string& name) {
    if (condition) {
        std::cout << "[PASS] " << name << "\n";
    } else {
        std::cout << "[FAIL] " << name << "\n";
        ++g_failures;
    }
}

// ---- Tokenizer tests -------------------------------------------------

void testTokenizeBasicPunctuationAndCase() {
    const auto tokens = docsearch::tokenize("Hello, World!!");
    check(tokens.size() == 2, "tokenize: basic punctuation yields 2 tokens");
    check(tokens.size() == 2 && tokens[0] == "hello", "tokenize: lowercases 'Hello' -> 'hello'");
    check(tokens.size() == 2 && tokens[1] == "world", "tokenize: strips '!!' from 'World!!'");
}

void testTokenizeEmptyString() {
    const auto tokens = docsearch::tokenize("");
    check(tokens.empty(), "tokenize: empty string yields no tokens");
}

void testTokenizePunctuationOnly() {
    const auto tokens = docsearch::tokenize("!!! ... ,,, ---");
    check(tokens.empty(), "tokenize: punctuation-only input yields no tokens");
}

void testTokenizeWhitespaceVariants() {
    const auto tokens = docsearch::tokenize("multi   space\ttabs\nnewlines");
    check(tokens.size() == 4, "tokenize: mixed whitespace splits into 4 tokens");
    check(tokens.size() == 4 && tokens[0] == "multi" && tokens[1] == "space" &&
              tokens[2] == "tabs" && tokens[3] == "newlines",
          "tokenize: mixed whitespace tokens are correct and in order");
}

void testTokenizeNumbersAndApostrophes() {
    // Apostrophes are stripped as punctuation, splitting contractions in two.
    const auto tokens = docsearch::tokenize("It's the year 2026 now.");
    const std::vector<std::string> expected = {"it", "s", "the", "year", "2026", "now"};
    check(tokens == expected, "tokenize: numbers kept as tokens, apostrophe splits contraction");
}

// ---- InvertedIndex tests ----------------------------------------------

void testSingleDocTermRanksHighest() {
    docsearch::InvertedIndex index;
    index.addDocument("doc0.txt", "apple banana apple");
    index.addDocument("doc1.txt", "banana cherry");
    index.addDocument("doc2.txt", "cherry cherry cherry grape");

    // "apple" only occurs in doc0 -> doc0 must be the (only) top result.
    const auto appleResults = index.search("apple", 10);
    check(!appleResults.empty(), "search: 'apple' query returns at least one result");
    check(!appleResults.empty() && appleResults.front().path == "doc0.txt",
          "search: term unique to one doc ranks that doc first");
    check(appleResults.size() == 1, "search: term unique to one doc yields exactly one match");

    // "cherry" appears in doc1 (x1) and doc2 (x3) -> doc2 should outrank doc1.
    const auto cherryResults = index.search("cherry", 10);
    check(cherryResults.size() == 2, "search: 'cherry' matches the two docs containing it");
    check(!cherryResults.empty() && cherryResults.front().path == "doc2.txt",
          "search: higher term frequency ranks first among docs sharing a term");
}

void testEmptyAndNoMatchQueriesDoNotCrash() {
    docsearch::InvertedIndex index;
    index.addDocument("doc0.txt", "some ordinary content about gardening");

    const auto emptyQuery = index.search("", 10);
    check(emptyQuery.empty(), "search: empty query string returns no results");

    const auto punctuationOnlyQuery = index.search("!!!", 10);
    check(punctuationOnlyQuery.empty(), "search: punctuation-only query returns no results");

    const auto noMatchQuery = index.search("zzznonexistentword", 10);
    check(noMatchQuery.empty(), "search: term absent from every doc returns no results");

    docsearch::InvertedIndex emptyIndex;
    const auto queryOnEmptyIndex = emptyIndex.search("anything", 10);
    check(queryOnEmptyIndex.empty(), "search: querying an index with zero documents returns no results");
}

void testTopNLimitsResults() {
    docsearch::InvertedIndex index;
    for (int i = 0; i < 5; ++i) {
        index.addDocument("doc" + std::to_string(i) + ".txt", "shared term repeated repeated");
    }
    const auto results = index.search("shared", 2);
    check(results.size() == 2, "search: topN caps the number of returned results");
}

void testSaveAndLoadRoundTrip() {
    namespace fs = std::filesystem;
    const fs::path tempRoot = fs::temp_directory_path() / "docsearch_test_scratch";
    const fs::path docsDir = tempRoot / "docs";
    const fs::path indexDir = tempRoot / "index";

    std::error_code ec;
    fs::remove_all(tempRoot, ec);
    fs::create_directories(docsDir);

    {
        std::ofstream f(docsDir / "alpha.txt");
        f << "The quick brown fox jumps over the lazy dog.";
    }
    {
        std::ofstream f(docsDir / "beta.txt");
        f << "Foxes and dogs are both common in idioms about foxes.";
    }
    {
        // Non-.txt files must be ignored by the directory scan.
        std::ofstream f(docsDir / "ignore.md");
        f << "fox fox fox";
    }

    docsearch::InvertedIndex built;
    const std::size_t indexed = built.buildFromDirectory(docsDir.string());
    check(indexed == 2, "buildFromDirectory: indexes only .txt files (2 of 3)");

    built.save(indexDir.string());
    check(fs::exists(indexDir / "index.txt"), "save: writes index.txt to the target directory");

    docsearch::InvertedIndex loaded;
    const bool ok = loaded.load(indexDir.string());
    check(ok, "load: successfully reads a previously saved index");
    check(loaded.documentCount() == built.documentCount(),
          "load: document count matches the saved index");

    const auto originalResults = built.search("fox", 10);
    const auto loadedResults = loaded.search("fox", 10);
    check(originalResults.size() == loadedResults.size() && !loadedResults.empty(),
          "load: search results after round-trip match the in-memory index");
    if (!originalResults.empty() && !loadedResults.empty()) {
        check(originalResults.front().path == loadedResults.front().path,
              "load: top-ranked result is preserved across save/load");
    }

    fs::remove_all(tempRoot, ec);
}

void testLoadMissingIndexFails() {
    docsearch::InvertedIndex index;
    const bool ok = index.load("/path/that/definitely/does/not/exist/anywhere");
    check(!ok, "load: returns false for a missing index directory instead of crashing");
}

} // namespace

int main() {
    std::cout << "Running docsearch test suite\n";
    std::cout << "-----------------------------\n";

    testTokenizeBasicPunctuationAndCase();
    testTokenizeEmptyString();
    testTokenizePunctuationOnly();
    testTokenizeWhitespaceVariants();
    testTokenizeNumbersAndApostrophes();

    testSingleDocTermRanksHighest();
    testEmptyAndNoMatchQueriesDoNotCrash();
    testTopNLimitsResults();
    testSaveAndLoadRoundTrip();
    testLoadMissingIndexFails();

    std::cout << "-----------------------------\n";
    if (g_failures == 0) {
        std::cout << "All checks passed.\n";
        return 0;
    }
    std::cout << g_failures << " check(s) FAILED.\n";
    return 1;
}
