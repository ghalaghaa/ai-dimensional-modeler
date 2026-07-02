#include "docsearch/tokenizer.hpp"

#include <cctype>

namespace docsearch {

std::vector<std::string> tokenize(const std::string& text) {
    std::vector<std::string> tokens;
    std::string current;

    auto flush = [&]() {
        if (!current.empty()) {
            tokens.push_back(current);
            current.clear();
        }
    };

    for (unsigned char ch : text) {
        if (std::isalnum(ch)) {
            current.push_back(static_cast<char>(std::tolower(ch)));
        } else {
            flush();
        }
    }
    flush();

    return tokens;
}

} // namespace docsearch
