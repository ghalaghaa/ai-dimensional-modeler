import json

import pytest

from app.quiz import generate_quiz, parse_questions
from app.retrieval import Retriever, chunk_text


class FakeLLM:
    def __init__(self, response: str):
        self.response = response
        self.last_call = None

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        self.last_call = (system_prompt, user_prompt)
        return self.response


def make_retriever():
    text = "The French Revolution began in 1789 and ended the monarchy in France."
    return Retriever(chunk_text(text))


def test_parse_questions_extracts_json_even_with_surrounding_prose():
    raw = 'Sure, here it is:\n[{"question": "Q1?", "choices": ["a", "b"], "answer_index": 0}]\nHope this helps!'
    questions = parse_questions(raw)
    assert len(questions) == 1
    assert questions[0].answer_index == 0


def test_parse_questions_raises_on_missing_json():
    with pytest.raises(ValueError):
        parse_questions("Sorry, I can't help with that.")


def test_generate_quiz_grounds_prompt_in_retrieved_context():
    fake_response = json.dumps(
        [{"question": "When did the French Revolution begin?", "choices": ["1789", "1900", "1600", "2000"], "answer_index": 0}]
    )
    llm = FakeLLM(fake_response)
    retriever = make_retriever()

    questions = generate_quiz(retriever, llm, topic="French Revolution", num_questions=1)

    assert len(questions) == 1
    assert questions[0].answer_index == 0
    system_prompt, user_prompt = llm.last_call
    assert "French Revolution" in user_prompt
    assert "1789" in user_prompt  # retrieved context made it into the prompt
