#include "docsearch/index.hpp"

#include <iostream>
#include <string>
#include <vector>

namespace {

void printUsage() {
    std::cerr
        << "fast-doc-search: offline full-text search over a folder of .txt files\n\n"
        << "Usage:\n"
        << "  docsearch index <directory> [--index-dir <path>]\n"
        << "      Recursively scans <directory> for .txt files, builds an inverted\n"
        << "      index in memory, and saves it (default location: ./.index).\n\n"
        << "  docsearch search <query words...> [--index-dir <path>] [--top N]\n"
        << "      Loads a previously saved index and prints the top N matching\n"
        << "      files ranked by TF-IDF relevance (default N: 10).\n\n"
        << "Examples:\n"
        << "  docsearch index sample_docs\n"
        << "  docsearch search chicken rice\n"
        << "  docsearch search \"flight itinerary\" --top 3\n";
}

int runIndex(int argc, char** argv) {
    if (argc < 3) {
        printUsage();
        return 1;
    }
    const std::string directory = argv[2];
    std::string indexDir = ".index";

    for (int i = 3; i < argc; ++i) {
        const std::string arg = argv[i];
        if (arg == "--index-dir" && i + 1 < argc) {
            indexDir = argv[++i];
        } else {
            std::cerr << "Unknown argument: " << arg << "\n";
            printUsage();
            return 1;
        }
    }

    docsearch::InvertedIndex index;
    const std::size_t docCount = index.buildFromDirectory(directory);
    if (docCount == 0) {
        std::cerr << "Warning: no .txt files found under '" << directory << "'.\n";
    }
    index.save(indexDir);

    std::cout << "Indexed " << docCount << " document(s) from '" << directory << "'.\n";
    std::cout << "Unique terms: " << index.termCount() << "\n";
    std::cout << "Index saved to: " << indexDir << "\n";
    return 0;
}

int runSearch(int argc, char** argv) {
    if (argc < 3) {
        printUsage();
        return 1;
    }

    std::string indexDir = ".index";
    int topN = 10;
    std::vector<std::string> queryParts;

    for (int i = 2; i < argc; ++i) {
        const std::string arg = argv[i];
        if (arg == "--index-dir" && i + 1 < argc) {
            indexDir = argv[++i];
        } else if (arg == "--top" && i + 1 < argc) {
            try {
                topN = std::stoi(argv[++i]);
            } catch (...) {
                std::cerr << "Invalid --top value.\n";
                return 1;
            }
        } else {
            queryParts.push_back(arg);
        }
    }

    if (queryParts.empty()) {
        std::cerr << "Error: no query terms given.\n";
        printUsage();
        return 1;
    }

    std::string query;
    for (const auto& part : queryParts) {
        if (!query.empty()) {
            query += " ";
        }
        query += part;
    }

    docsearch::InvertedIndex index;
    if (!index.load(indexDir)) {
        std::cerr << "Failed to load index from '" << indexDir
                  << "'. Run 'docsearch index <directory>' first.\n";
        return 1;
    }

    const auto results = index.search(query, topN);
    if (results.empty()) {
        std::cout << "No matches found for query: \"" << query << "\"\n";
        return 0;
    }

    std::cout << "Results for \"" << query << "\" (" << results.size() << " match"
              << (results.size() == 1 ? "" : "es") << "):\n";
    int rank = 1;
    for (const auto& result : results) {
        std::cout << "  " << rank++ << ". " << result.path << "  (score: " << result.score << ")\n";
    }
    return 0;
}

} // namespace

int main(int argc, char** argv) {
    if (argc < 2) {
        printUsage();
        return 1;
    }

    const std::string command = argv[1];
    if (command == "index") {
        return runIndex(argc, argv);
    }
    if (command == "search") {
        return runSearch(argc, argv);
    }
    if (command == "-h" || command == "--help") {
        printUsage();
        return 0;
    }

    std::cerr << "Unknown command: " << command << "\n";
    printUsage();
    return 1;
}
