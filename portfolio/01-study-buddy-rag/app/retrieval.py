"""Chunking + TF-IDF retrieval over a document's text.

This is the "R" in RAG: given a study document, split it into
overlapping-free chunks and rank them against a query so the LLM only
ever sees the passages that are actually relevant.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@dataclass
class Chunk:
    id: int
    text: str


def chunk_text(text: str, max_words: int = 120) -> List[Chunk]:
    """Split text into paragraph-aware chunks of at most `max_words` words."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    if not paragraphs:
        return []

    chunks: List[Chunk] = []
    buffer: List[str] = []

    def flush() -> None:
        if buffer:
            chunks.append(Chunk(id=len(chunks), text=" ".join(buffer)))
            buffer.clear()

    for paragraph in paragraphs:
        words = paragraph.split()
        if len(buffer) + len(words) > max_words and buffer:
            flush()
        buffer.extend(words)
    flush()
    return chunks


class Retriever:
    """TF-IDF cosine-similarity retriever over a fixed set of chunks."""

    def __init__(self, chunks: List[Chunk]):
        if not chunks:
            raise ValueError("Cannot build a retriever with zero chunks")
        self.chunks = chunks
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = self.vectorizer.fit_transform([c.text for c in chunks])

    def top_k(self, query: str, k: int = 3) -> List[Chunk]:
        k = max(1, min(k, len(self.chunks)))
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.matrix)[0]
        ranked_indices = sorted(range(len(self.chunks)), key=lambda i: scores[i], reverse=True)
        return [self.chunks[i] for i in ranked_indices[:k]]
