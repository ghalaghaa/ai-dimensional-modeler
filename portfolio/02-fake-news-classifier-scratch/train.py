"""Train the from-scratch neural network on the headline dataset.

Usage: python3 train.py [--epochs 300] [--lr 0.5] [--hidden 16]
"""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np

from nn.features import TfidfVectorizer
from nn.network import NeuralNetwork

ROOT = Path(__file__).parent


def load_dataset(path: Path):
    texts, labels = [], []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row["text"])
            labels.append(int(row["label"]))
    return texts, labels


def split(texts, labels, test_size=0.2, seed=42):
    rng = np.random.default_rng(seed)
    idx = rng.permutation(len(texts))
    cut = int(len(texts) * (1 - test_size))
    train_idx, test_idx = idx[:cut], idx[cut:]
    return (
        [texts[i] for i in train_idx], [labels[i] for i in train_idx],
        [texts[i] for i in test_idx], [labels[i] for i in test_idx],
    )


def accuracy(y_true, y_pred) -> float:
    return float(np.mean(np.array(y_true).reshape(-1, 1) == y_pred))


def train(texts, labels, epochs: int, lr: float, hidden: int, verbose: bool = True):
    X_train_text, y_train, X_test_text, y_test = split(texts, labels)

    vectorizer = TfidfVectorizer(max_features=300).fit(X_train_text)
    X_train = vectorizer.transform(X_train_text)
    X_test = vectorizer.transform(X_test_text)
    y_train_arr = np.array(y_train).reshape(-1, 1)

    net = NeuralNetwork(n_features=X_train.shape[1], n_hidden=hidden)
    for epoch in range(epochs):
        loss = net.train_step(X_train, y_train_arr, lr=lr)
        if verbose and (epoch + 1) % 50 == 0:
            train_acc = accuracy(y_train, net.predict(X_train))
            print(f"epoch {epoch + 1:4d}  loss={loss:.4f}  train_acc={train_acc:.3f}")

    test_acc = accuracy(y_test, net.predict(X_test))
    return net, vectorizer, test_acc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default=str(ROOT / "data" / "headlines.csv"))
    parser.add_argument("--epochs", type=int, default=300)
    parser.add_argument("--lr", type=float, default=0.5)
    parser.add_argument("--hidden", type=int, default=16)
    parser.add_argument("--out", default=str(ROOT / "model"))
    args = parser.parse_args()

    texts, labels = load_dataset(Path(args.data))
    net, vectorizer, test_acc = train(texts, labels, args.epochs, args.lr, args.hidden)
    print(f"\nTest accuracy: {test_acc:.3f}")

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    net.save(str(out_dir / "weights.npz"))
    with open(out_dir / "vocab.json", "w") as f:
        json.dump({**vectorizer.to_dict(), "n_hidden": args.hidden}, f)
    print(f"Saved model artifacts to {out_dir}/")


if __name__ == "__main__":
    main()
