#pragma once

#include <string>
#include <vector>

namespace docsearch {

// Tokenizes free text into lowercase, punctuation-stripped words.
//
// Rules:
//   - Any run of alphanumeric characters becomes one token.
//   - Everything else (whitespace, punctuation, symbols) is a separator.
//   - Letters are lowercased.
//
// Examples:
//   tokenize("Hello, World!!")   -> {"hello", "world"}
//   tokenize("  multi   space")  -> {"multi", "space"}
//   tokenize("...")              -> {}
//   tokenize("")                 -> {}
std::vector<std::string> tokenize(const std::string& text);

} // namespace docsearch
