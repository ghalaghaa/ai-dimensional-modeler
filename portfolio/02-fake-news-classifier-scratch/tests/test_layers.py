import numpy as np

from nn.layers import Dense, relu, relu_grad, sigmoid


def test_dense_forward_shape():
    rng = np.random.default_rng(0)
    layer = Dense(4, 3, rng)
    x = rng.normal(size=(5, 4))
    out = layer.forward(x)
    assert out.shape == (5, 3)


def test_dense_backward_matches_numerical_gradient():
    """Classic from-scratch backprop check: compare the analytic gradient
    against a finite-difference numerical gradient."""
    rng = np.random.default_rng(1)
    layer = Dense(3, 2, rng)
    x = rng.normal(size=(4, 3))

    out = layer.forward(x)
    grad_output = np.ones_like(out)
    layer.backward(grad_output)
    analytic_dW = layer.dW.copy()

    eps = 1e-5
    numeric_dW = np.zeros_like(layer.W)
    for i in range(layer.W.shape[0]):
        for j in range(layer.W.shape[1]):
            original = layer.W[i, j]

            layer.W[i, j] = original + eps
            loss_plus = layer.forward(x).sum()

            layer.W[i, j] = original - eps
            loss_minus = layer.forward(x).sum()

            layer.W[i, j] = original
            numeric_dW[i, j] = (loss_plus - loss_minus) / (2 * eps)

    assert np.allclose(analytic_dW, numeric_dW, atol=1e-3)


def test_relu_and_grad():
    x = np.array([[-2.0, 0.0, 3.0]])
    assert np.array_equal(relu(x), [[0.0, 0.0, 3.0]])
    assert np.array_equal(relu_grad(x), [[0.0, 0.0, 1.0]])


def test_sigmoid_bounds_and_stability():
    x = np.array([-1000.0, 0.0, 1000.0])
    out = sigmoid(x)
    assert np.all(out >= 0) and np.all(out <= 1)
    assert np.isclose(out[1], 0.5)
