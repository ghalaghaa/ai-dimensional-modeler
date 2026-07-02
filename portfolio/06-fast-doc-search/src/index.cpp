#include "docsearch/index.hpp"
#include "docsearch/tokenizer.hpp"

#include <algorithm>
#include <cmath>
#include <filesystem>
#include <fstream>
#include <sstream>

namespace docsearch {

namespace fs = std::filesystem;

std::size_t InvertedIndex::buildFromDirectory(const std::string& rootDir) {
    docPaths_.clear();
    postings_.clear();

    if (!fs::exists(rootDir) || !fs::is_directory(rootDir)) {
        return 0;
    }

    // Collect first, then sort, so document ids are stable/reproducible
    // regardless of filesystem iteration order.
    std::vector<fs::path> files;
    for (const auto& entry : fs::recursive_directory_iterator(rootDir)) {
        if (entry.is_regular_file() && entry.path().extension() == ".txt") {
            files.push_back(entry.path());
        }
    }
    std::sort(files.begin(), files.end());

    for (const auto& file : files) {
        std::ifstream in(file, std::ios::binary);
        if (!in) {
            continue;
        }
        std::ostringstream buffer;
        buffer << in.rdbuf();
        addDocument(file.string(), buffer.str());
    }

    return docPaths_.size();
}

void InvertedIndex::addDocument(const std::string& path, const std::string& content) {
    const int docId = static_cast<int>(docPaths_.size());
    docPaths_.push_back(path);

    std::unordered_map<std::string, int> termFreqInDoc;
    for (const auto& term : tokenize(content)) {
        ++termFreqInDoc[term];
    }

    for (const auto& [term, freq] : termFreqInDoc) {
        postings_[term].push_back(Posting{docId, freq});
    }
}

void InvertedIndex::save(const std::string& indexDir) const {
    fs::create_directories(indexDir);
    std::ofstream out(fs::path(indexDir) / "index.txt", std::ios::binary | std::ios::trunc);

    out << "DOCS " << docPaths_.size() << "\n";
    for (std::size_t i = 0; i < docPaths_.size(); ++i) {
        out << i << "\t" << docPaths_[i] << "\n";
    }

    out << "TERMS " << postings_.size() << "\n";
    for (const auto& [term, plist] : postings_) {
        out << term << "\t" << plist.size();
        for (const auto& p : plist) {
            out << " " << p.docId << ":" << p.termFreq;
        }
        out << "\n";
    }
}

bool InvertedIndex::load(const std::string& indexDir) {
    std::ifstream in(fs::path(indexDir) / "index.txt", std::ios::binary);
    if (!in) {
        return false;
    }

    std::vector<std::string> newDocPaths;
    std::unordered_map<std::string, std::vector<Posting>> newPostings;

    std::string line;
    if (!std::getline(in, line)) {
        return false;
    }
    {
        std::istringstream header(line);
        std::string tag;
        std::size_t docCount = 0;
        header >> tag >> docCount;
        if (tag != "DOCS" || !header) {
            return false;
        }
        newDocPaths.resize(docCount);
        for (std::size_t i = 0; i < docCount; ++i) {
            if (!std::getline(in, line)) {
                return false;
            }
            const auto tabPos = line.find('\t');
            if (tabPos == std::string::npos) {
                return false;
            }
            int id = 0;
            try {
                id = std::stoi(line.substr(0, tabPos));
            } catch (...) {
                return false;
            }
            if (id < 0 || static_cast<std::size_t>(id) >= docCount) {
                return false;
            }
            newDocPaths[static_cast<std::size_t>(id)] = line.substr(tabPos + 1);
        }
    }

    if (!std::getline(in, line)) {
        return false;
    }
    {
        std::istringstream header(line);
        std::string tag;
        std::size_t termCountVal = 0;
        header >> tag >> termCountVal;
        if (tag != "TERMS" || !header) {
            return false;
        }
        for (std::size_t i = 0; i < termCountVal; ++i) {
            if (!std::getline(in, line)) {
                return false;
            }
            std::istringstream ls(line);
            std::string term;
            std::size_t postingCount = 0;
            ls >> term >> postingCount;
            if (!ls) {
                return false;
            }
            std::vector<Posting> plist;
            plist.reserve(postingCount);
            for (std::size_t j = 0; j < postingCount; ++j) {
                std::string token;
                ls >> token;
                const auto colonPos = token.find(':');
                if (colonPos == std::string::npos) {
                    return false;
                }
                try {
                    Posting p;
                    p.docId = std::stoi(token.substr(0, colonPos));
                    p.termFreq = std::stoi(token.substr(colonPos + 1));
                    plist.push_back(p);
                } catch (...) {
                    return false;
                }
            }
            newPostings.emplace(std::move(term), std::move(plist));
        }
    }

    docPaths_ = std::move(newDocPaths);
    postings_ = std::move(newPostings);
    return true;
}

std::vector<SearchResult> InvertedIndex::search(const std::string& query, int topN) const {
    std::vector<SearchResult> results;
    if (docPaths_.empty()) {
        return results;
    }

    const auto queryTerms = tokenize(query);
    if (queryTerms.empty()) {
        return results;
    }

    const double totalDocs = static_cast<double>(docPaths_.size());
    std::unordered_map<int, double> scoreByDoc;

    for (const auto& term : queryTerms) {
        const auto it = postings_.find(term);
        if (it == postings_.end()) {
            continue;
        }
        const double docFreq = static_cast<double>(it->second.size());
        // Smoothed idf: always positive, terms in every document still get
        // a small positive weight instead of zeroing out.
        const double idf = std::log((totalDocs + 1.0) / (docFreq + 1.0)) + 1.0;

        for (const auto& posting : it->second) {
            const double tf = 1.0 + std::log(static_cast<double>(posting.termFreq));
            scoreByDoc[posting.docId] += tf * idf;
        }
    }

    results.reserve(scoreByDoc.size());
    for (const auto& [docId, score] : scoreByDoc) {
        results.push_back(SearchResult{docPaths_[static_cast<std::size_t>(docId)], score});
    }

    std::sort(results.begin(), results.end(), [](const SearchResult& a, const SearchResult& b) {
        if (a.score != b.score) {
            return a.score > b.score;
        }
        return a.path < b.path;
    });

    if (topN >= 0 && results.size() > static_cast<std::size_t>(topN)) {
        results.resize(static_cast<std::size_t>(topN));
    }

    return results;
}

} // namespace docsearch
