import numpy as np

from nn.features import TfidfVectorizer, tokenize


def test_tokenize_lowercases_and_drops_stopwords():
    tokens = tokenize("The Quick Brown Fox is in the garden")
    assert "the" not in tokens
    assert "is" not in tokens
    assert "quick" in tokens


def test_vectorizer_shape():
    docs = ["cats chase mice", "dogs chase cats", "mice hide from cats"]
    vec = TfidfVectorizer(max_features=10)
    X = vec.fit_transform(docs)
    assert X.shape[0] == 3
    assert X.shape[1] == len(vec.vocab_)


def test_common_word_gets_lower_idf_than_rare_word():
    docs = ["cats cats cats", "cats dogs birds", "cats fish"]
    vec = TfidfVectorizer(max_features=10).fit(docs)
    idf_cats = vec.idf_[vec.vocab_["cats"]]  # appears in all 3 docs
    idf_dogs = vec.idf_[vec.vocab_["dogs"]]  # appears in 1 doc
    assert idf_cats < idf_dogs


def test_from_dict_round_trip():
    docs = ["cats chase mice", "dogs bark loudly"]
    vec = TfidfVectorizer(max_features=10).fit(docs)
    restored = TfidfVectorizer.from_dict(vec.to_dict())
    assert np.allclose(vec.transform(docs), restored.transform(docs))
