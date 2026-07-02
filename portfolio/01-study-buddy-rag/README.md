# Study Buddy RAG

Turns your own study notes into a multiple-choice quiz using
Retrieval-Augmented Generation: your notes are chunked and ranked with
TF-IDF, and only the most relevant chunks are sent to an LLM to generate
questions — so answers stay grounded in what you actually wrote instead
of the model's general knowledge.

**Who it's for:** students who want to turn lecture notes into practice
quizzes without manually writing questions.

## How it works

1. `POST /documents` — upload a note as plain text, it gets chunked.
2. `POST /quiz` — pick a document (and optional topic), the retriever
   finds the most relevant chunks with TF-IDF + cosine similarity, and
   the LLM is asked to generate questions **only** from that context.
3. The LLM must respond with strict JSON; the response is parsed and
   validated with Pydantic before being returned.

## Stack

Python, FastAPI, scikit-learn (TF-IDF retrieval), Groq API (Llama 3.3,
OpenAI-compatible — swap `GROQ_BASE_URL`/`GROQ_MODEL` for any other
OpenAI-compatible provider).

## Setup

```bash
cd 01-study-buddy-rag
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your free Groq API key (console.groq.com)
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs for interactive API docs.

## Try it

```bash
# 1. Upload notes (or just use the /docs UI to paste text)
python3 -c "
import json, requests
text = open('sample_notes/biology.txt').read()
r = requests.post('http://localhost:8000/documents', json={'title': 'Biology 101', 'text': text})
print(r.json())
"

# 2. Generate a quiz (use the id returned above)
curl -X POST localhost:8000/quiz \
  -H "Content-Type: application/json" \
  -d '{"document_id": 1, "topic": "mitochondria", "num_questions": 3}'
```

## Tests

Retrieval ranking and quiz JSON-parsing are tested directly; API tests
inject a fake LLM client via FastAPI's dependency overrides, so the full
suite runs **without needing an API key**:

```bash
pytest -v
```
