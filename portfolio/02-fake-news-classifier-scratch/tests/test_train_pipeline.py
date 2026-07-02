from pathlib import Path

from train import load_dataset, train

DATA_PATH = Path(__file__).parent.parent / "data" / "headlines.csv"


def test_train_pipeline_achieves_reasonable_accuracy_on_real_dataset():
    texts, labels = load_dataset(DATA_PATH)
    _, _, test_acc = train(texts, labels, epochs=200, lr=0.5, hidden=16, verbose=False)
    assert test_acc >= 0.85


def test_train_pipeline_separates_obviously_distinct_classes():
    fake = [f"SHOCKING secret {i} doctors hate this trick" for i in range(30)]
    real = [f"Ministry reports quarterly statistics update {i}" for i in range(30)]
    texts = fake + real
    labels = [1] * len(fake) + [0] * len(real)

    _, _, test_acc = train(texts, labels, epochs=150, lr=0.5, hidden=8, verbose=False)
    assert test_acc >= 0.9
