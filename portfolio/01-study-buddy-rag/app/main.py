"""FastAPI app: upload notes, then generate a grounded quiz from them."""
from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel

from .llm import GroqLLMClient, LLMClient
from .quiz import QuizQuestion, generate_quiz
from .retrieval import Chunk, Retriever, chunk_text

app = FastAPI(title="Study Buddy RAG", version="1.0.0")

_documents: Dict[int, dict] = {}
_next_id = 1


class DocumentIn(BaseModel):
    title: str
    text: str


class DocumentOut(BaseModel):
    id: int
    title: str
    num_chunks: int


class QuizRequest(BaseModel):
    document_id: int
    topic: Optional[str] = None
    num_questions: int = 5


def get_llm_client() -> LLMClient:
    return GroqLLMClient()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/documents", response_model=DocumentOut)
def add_document(doc: DocumentIn) -> DocumentOut:
    global _next_id
    chunks: List[Chunk] = chunk_text(doc.text)
    if not chunks:
        raise HTTPException(400, "Document text is empty")
    doc_id = _next_id
    _next_id += 1
    _documents[doc_id] = {"title": doc.title, "chunks": chunks}
    return DocumentOut(id=doc_id, title=doc.title, num_chunks=len(chunks))


@app.get("/documents", response_model=List[DocumentOut])
def list_documents() -> List[DocumentOut]:
    return [
        DocumentOut(id=doc_id, title=d["title"], num_chunks=len(d["chunks"]))
        for doc_id, d in _documents.items()
    ]


@app.post("/quiz", response_model=List[QuizQuestion])
def create_quiz(req: QuizRequest, llm: LLMClient = Depends(get_llm_client)) -> List[QuizQuestion]:
    doc = _documents.get(req.document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    retriever = Retriever(doc["chunks"])
    try:
        return generate_quiz(retriever, llm, req.topic, req.num_questions)
    except RuntimeError as exc:
        raise HTTPException(400, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(502, f"LLM returned an unparsable response: {exc}") from exc
