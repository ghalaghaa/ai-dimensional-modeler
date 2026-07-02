"""A minimal feed-forward neural network (1 hidden layer) trained with
manually-derived backpropagation and mini-batch gradient descent.

No autograd, no ML framework — every gradient here is derived and coded
by hand, which is the point of this project.
"""
from __future__ import annotations

import numpy as np

from .layers import Dense, relu, relu_grad, sigmoid


def binary_cross_entropy(y_true: np.ndarray, y_pred: np.ndarray, eps: float = 1e-9) -> float:
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return float(-np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred)))


class NeuralNetwork:
    def __init__(self, n_features: int, n_hidden: int = 16, seed: int = 42):
        rng = np.random.default_rng(seed)
        self.n_features = n_features
        self.n_hidden = n_hidden
        self.dense1 = Dense(n_features, n_hidden, rng)
        self.dense2 = Dense(n_hidden, 1, rng)
        self._z1 = None
        self._a1 = None

    def forward(self, X: np.ndarray) -> np.ndarray:
        self._z1 = self.dense1.forward(X)
        self._a1 = relu(self._z1)
        z2 = self.dense2.forward(self._a1)
        return sigmoid(z2)

    def backward(self, y_true: np.ndarray, y_pred: np.ndarray) -> None:
        n = y_true.shape[0]
        # d(BCE)/d(z2) simplifies to (y_pred - y_true)/n when the output
        # activation is sigmoid and the loss is binary cross-entropy.
        d_z2 = (y_pred - y_true) / n
        d_a1 = self.dense2.backward(d_z2)
        d_z1 = d_a1 * relu_grad(self._z1)
        self.dense1.backward(d_z1)

    def step(self, lr: float) -> None:
        self.dense1.step(lr)
        self.dense2.step(lr)

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float) -> float:
        y_pred = self.forward(X)
        self.backward(y, y_pred)
        self.step(lr)
        return binary_cross_entropy(y, y_pred)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.forward(X)

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        return (self.predict_proba(X) >= threshold).astype(int)

    def save(self, path: str) -> None:
        np.savez(path, W1=self.dense1.W, b1=self.dense1.b, W2=self.dense2.W, b2=self.dense2.b)

    @classmethod
    def load(cls, path: str, n_features: int, n_hidden: int) -> "NeuralNetwork":
        data = np.load(path)
        net = cls(n_features, n_hidden)
        net.dense1.W, net.dense1.b = data["W1"], data["b1"]
        net.dense2.W, net.dense2.b = data["W2"], data["b2"]
        return net
