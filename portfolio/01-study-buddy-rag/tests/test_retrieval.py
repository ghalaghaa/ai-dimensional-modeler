from app.retrieval import Retriever, chunk_text


def test_chunk_text_splits_on_paragraphs_and_respects_max_words():
    text = ("word " * 80).strip() + "\n\n" + ("term " * 80).strip()
    chunks = chunk_text(text, max_words=100)
    assert len(chunks) == 2
    assert all(len(c.text.split()) <= 100 for c in chunks)


def test_chunk_text_empty_returns_no_chunks():
    assert chunk_text("   \n\n  ") == []


def test_retriever_ranks_relevant_chunk_first():
    chunks = chunk_text(
        "Photosynthesis converts light energy into chemical energy in plants.\n\n"
        "The mitochondria is the powerhouse of the cell.\n\n"
        "Stock markets fluctuate based on supply and demand."
    )
    retriever = Retriever(chunks)
    top = retriever.top_k("How do plants use sunlight?", k=1)
    assert "Photosynthesis" in top[0].text


def test_retriever_top_k_caps_at_available_chunks():
    chunks = chunk_text("Only one paragraph here about cats.")
    retriever = Retriever(chunks)
    assert len(retriever.top_k("cats", k=5)) == 1
