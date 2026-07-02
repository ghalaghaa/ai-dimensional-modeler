"""Classify a headline using the trained from-scratch model.

Usage: python3 predict.py "SHOCKING: scientists confirm secret cure"
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from nn.features import TfidfVectorizer
from nn.network import NeuralNetwork

ROOT = Path(__file__).parent


def load_model(model_dir: Path):
    with open(model_dir / "vocab.json") as f:
        data = json.load(f)
    vectorizer = TfidfVectorizer.from_dict(data)
    net = NeuralNetwork.load(str(model_dir / "weights.npz"), n_features=len(vectorizer.vocab_), n_hidden=data["n_hidden"])
    return net, vectorizer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("text", help="Headline text to classify")
    parser.add_argument("--model", default=str(ROOT / "model"))
    args = parser.parse_args()

    net, vectorizer = load_model(Path(args.model))
    X = vectorizer.transform([args.text])
    proba = float(net.predict_proba(X)[0, 0])
    label = "FAKE" if proba >= 0.5 else "REAL"
    print(f"{label}  (fake probability: {proba:.3f})")


if __name__ == "__main__":
    main()
