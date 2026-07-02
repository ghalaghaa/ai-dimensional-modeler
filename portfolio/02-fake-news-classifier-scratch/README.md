# Fake News Classifier — Neural Network From Scratch

A binary text classifier where the **model itself is hand-built**: no
PyTorch, no TensorFlow, no scikit-learn classifier. Forward pass,
backpropagation, gradient descent, and even the TF-IDF vectorizer are
implemented from first principles using only NumPy.

**Who it's for:** demonstrates understanding of how neural networks
actually learn, not just how to call `.fit()`.

## What's implemented from scratch

- `nn/layers.py` — a `Dense` layer with manually derived forward/backward passes
- `nn/network.py` — a 2-layer MLP (ReLU → Sigmoid) trained with mini-batch
  gradient descent; the backprop math is derived and commented, not autograd
- `nn/features.py` — a bag-of-words TF-IDF vectorizer (no scikit-learn)

## Correctness proof, not just accuracy

`tests/test_layers.py` checks the analytic gradient against a
finite-difference numerical gradient — the standard way to verify a
backprop implementation is actually correct, independent of whether the
final model happens to perform well.

`tests/test_network_xor.py` trains the network on XOR, which is **not
linearly separable** — a network that solves it proves the hidden layer
and backprop are wired correctly.

## Data

`data/headlines.csv` is a synthetic, template-generated dataset (see
`data/generate_dataset.py`) so the project runs end-to-end without any
download. Swap in a real corpus (e.g. LIAR or FakeNewsNet) for
production use — the pipeline doesn't change, only the CSV.

## Setup & run

```bash
cd 02-fake-news-classifier-scratch
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python3 train.py                # trains and saves model/
python3 predict.py "SHOCKING: scientists confirm secret cure doctors hate"
python3 predict.py "Ministry of Health releases quarterly statistics report"
```

## Tests

```bash
pytest -v
```

11 tests covering layer gradients (numerical gradient check), the XOR
sanity check, the TF-IDF vectorizer, and end-to-end training accuracy.
