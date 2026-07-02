"""A bag-of-words TF-IDF vectorizer implemented from scratch (no sklearn)."""
from __future__ import annotations

import math
import re
from collections import Counter
from typing import Dict, List

import numpy as np

TOKEN_RE = re.compile(r"[a-zA-Z']+")

STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "to", "of", "in", "on",
    "for", "and", "or", "that", "this", "it", "as", "at", "by", "with",
    "be", "has", "have", "had", "its", "will", "from",
}


def tokenize(text: str) -> List[str]:
    return [t.lower() for t in TOKEN_RE.findall(text) if t.lower() not in STOPWORDS]


class TfidfVectorizer:
    def __init__(self, max_features: int = 300):
        self.max_features = max_features
        self.vocab_: Dict[str, int] = {}
        self.idf_: np.ndarray | None = None

    def fit(self, documents: List[str]) -> "TfidfVectorizer":
        doc_freq: Counter = Counter()
        term_freq_total: Counter = Counter()
        tokenized_docs = [tokenize(d) for d in documents]
        for tokens in tokenized_docs:
            term_freq_total.update(tokens)
            doc_freq.update(set(tokens))

        vocab_terms = [w for w, _ in term_freq_total.most_common(self.max_features)]
        self.vocab_ = {w: i for i, w in enumerate(vocab_terms)}

        n_docs = len(documents)
        self.idf_ = np.array(
            [math.log((n_docs + 1) / (doc_freq[w] + 1)) + 1 for w in vocab_terms]
        )
        return self

    def transform(self, documents: List[str]) -> np.ndarray:
        if self.idf_ is None:
            raise RuntimeError("Vectorizer must be fit before calling transform")
        X = np.zeros((len(documents), len(self.vocab_)))
        for row, doc in enumerate(documents):
            tokens = tokenize(doc)
            counts = Counter(tokens)
            total = len(tokens) or 1
            for term, count in counts.items():
                idx = self.vocab_.get(term)
                if idx is not None:
                    tf = count / total
                    X[row, idx] = tf * self.idf_[idx]
        return X

    def fit_transform(self, documents: List[str]) -> np.ndarray:
        return self.fit(documents).transform(documents)

    def to_dict(self) -> dict:
        return {"vocab": list(self.vocab_.keys()), "idf": self.idf_.tolist()}

    @classmethod
    def from_dict(cls, data: dict) -> "TfidfVectorizer":
        vec = cls(max_features=len(data["vocab"]))
        vec.vocab_ = {w: i for i, w in enumerate(data["vocab"])}
        vec.idf_ = np.array(data["idf"])
        return vec
