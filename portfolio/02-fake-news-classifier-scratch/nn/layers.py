"""Building blocks of the network, implemented with raw NumPy only."""
from __future__ import annotations

import numpy as np


class Dense:
    """A fully-connected layer with manual forward and backward passes."""

    def __init__(self, n_in: int, n_out: int, rng: np.random.Generator):
        limit = np.sqrt(6 / (n_in + n_out))  # Xavier/Glorot uniform init
        self.W = rng.uniform(-limit, limit, size=(n_in, n_out))
        self.b = np.zeros((1, n_out))
        self._x = None
        self.dW = None
        self.db = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        self._x = x
        return x @ self.W + self.b

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        self.dW = self._x.T @ grad_output
        self.db = grad_output.sum(axis=0, keepdims=True)
        return grad_output @ self.W.T

    def step(self, lr: float) -> None:
        self.W -= lr * self.dW
        self.b -= lr * self.db


def relu(x: np.ndarray) -> np.ndarray:
    return np.maximum(0, x)


def relu_grad(x: np.ndarray) -> np.ndarray:
    return (x > 0).astype(x.dtype)


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
