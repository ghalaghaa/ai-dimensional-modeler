#pragma once

#include <cstddef>
#include <string>
#include <unordered_map>
#include <vector>

namespace docsearch {

// One occurrence record: document `docId` contains the term `termFreq` times.
struct Posting {
    int docId = 0;
    int termFreq = 0;
};

// A single ranked search hit.
struct SearchResult {
    std::string path;
    double score = 0.0;
};

// An in-memory inverted index (term -> postings list) with simple TF-IDF
// style scoring, plus a plain-text serialization format so that `index`
// (build once, slow) and `search` (load + query, fast) can run as separate
// CLI invocations without re-scanning the source documents.
class InvertedIndex {
public:
    // Recursively scans `rootDir` for files ending in ".txt", tokenizes each
    // one, and adds it to the index. Returns the number of documents indexed.
    // Existing in-memory contents are cleared first. Returns 0 (with an
    // empty index) if `rootDir` does not exist or is not a directory.
    std::size_t buildFromDirectory(const std::string& rootDir);

    // Adds a single document identified by `path` with raw text `content`.
    // Documents are assigned sequential ids in insertion order.
    void addDocument(const std::string& path, const std::string& content);

    // Writes the index to `indexDir/index.txt` (directory created if needed).
    void save(const std::string& indexDir) const;

    // Loads a previously-saved index from `indexDir/index.txt`, replacing any
    // in-memory contents. Returns false (index left empty) on any read error.
    bool load(const std::string& indexDir);

    // Tokenizes `query`, scores every document that shares at least one term
    // with it using a TF-IDF style formula, and returns up to `topN` results
    // sorted by descending score (ties broken by path). Returns an empty
    // vector if the index is empty or no query term matches anything.
    std::vector<SearchResult> search(const std::string& query, int topN) const;

    std::size_t documentCount() const { return docPaths_.size(); }
    std::size_t termCount() const { return postings_.size(); }
    const std::string& documentPath(int docId) const { return docPaths_.at(static_cast<std::size_t>(docId)); }

private:
    std::vector<std::string> docPaths_;
    std::unordered_map<std::string, std::vector<Posting>> postings_;
};

} // namespace docsearch
