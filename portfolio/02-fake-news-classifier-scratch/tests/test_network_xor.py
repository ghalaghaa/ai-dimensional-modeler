"""XOR is not linearly separable, so a network that solves it proves the
hidden layer + backprop implementation is actually correct."""
import numpy as np

from nn.network import NeuralNetwork


def test_network_learns_xor():
    X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
    y = np.array([[0], [1], [1], [0]], dtype=float)

    net = NeuralNetwork(n_features=2, n_hidden=8, seed=0)
    for _ in range(3000):
        net.train_step(X, y, lr=0.5)

    predictions = net.predict(X)
    assert np.array_equal(predictions, y.astype(int))
