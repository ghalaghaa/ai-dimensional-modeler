import json

from fastapi.testclient import TestClient

from app.main import app, get_llm_client


class FakeLLM:
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        return json.dumps(
            [
                {
                    "question": "What is the powerhouse of the cell?",
                    "choices": ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"],
                    "answer_index": 1,
                }
            ]
        )


app.dependency_overrides[get_llm_client] = lambda: FakeLLM()
client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_full_flow_add_document_then_generate_quiz():
    resp = client.post(
        "/documents",
        json={"title": "Biology 101", "text": "The mitochondria is the powerhouse of the cell."},
    )
    assert resp.status_code == 200
    doc = resp.json()
    assert doc["num_chunks"] == 1

    resp = client.get("/documents")
    assert any(d["id"] == doc["id"] for d in resp.json())

    resp = client.post("/quiz", json={"document_id": doc["id"], "num_questions": 1})
    assert resp.status_code == 200
    questions = resp.json()
    assert len(questions) == 1
    assert questions[0]["answer_index"] == 1


def test_quiz_for_missing_document_returns_404():
    resp = client.post("/quiz", json={"document_id": 999999, "num_questions": 1})
    assert resp.status_code == 404


def test_empty_document_rejected():
    resp = client.post("/documents", json={"title": "Empty", "text": "   "})
    assert resp.status_code == 400
