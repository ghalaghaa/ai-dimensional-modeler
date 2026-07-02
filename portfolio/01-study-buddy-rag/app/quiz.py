"""Retrieval-augmented quiz generation."""
from __future__ import annotations

import json
import re
from typing import List, Optional

from pydantic import BaseModel, Field

from .llm import LLMClient
from .retrieval import Retriever


class QuizQuestion(BaseModel):
    question: str
    choices: List[str] = Field(min_length=2)
    answer_index: int


SYSTEM_PROMPT = (
    "You are a study assistant. Generate multiple-choice quiz questions strictly "
    "grounded in the given study notes; never invent facts that are not present. "
    "Respond ONLY with a JSON array (no prose, no markdown fences). Each item must "
    'have: "question" (string), "choices" (array of 4 strings), '
    '"answer_index" (0-based integer index of the correct choice).'
)


def build_user_prompt(context: str, num_questions: int, topic: Optional[str]) -> str:
    topic_line = f"Focus specifically on: {topic}\n" if topic else ""
    return (
        f'{topic_line}Study notes:\n"""\n{context}\n"""\n\n'
        f"Generate exactly {num_questions} multiple-choice questions as a JSON array."
    )


def parse_questions(raw: str) -> List[QuizQuestion]:
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if not match:
        raise ValueError("LLM response did not contain a JSON array")
    data = json.loads(match.group(0))
    return [QuizQuestion(**item) for item in data]


def generate_quiz(
    retriever: Retriever,
    llm: LLMClient,
    topic: Optional[str],
    num_questions: int = 5,
    top_k: int = 4,
) -> List[QuizQuestion]:
    query = topic or "key concepts summary"
    relevant_chunks = retriever.top_k(query, k=top_k)
    context = "\n\n".join(c.text for c in relevant_chunks)
    raw = llm.generate(SYSTEM_PROMPT, build_user_prompt(context, num_questions, topic))
    return parse_questions(raw)
