import tempfile
from pathlib import Path

import pytest

from agent.tools import add_appointment, cancel_appointment, list_appointments


@pytest.fixture
def db_path():
    with tempfile.TemporaryDirectory() as tmp:
        yield str(Path(tmp) / "appointments.db")


def test_add_appointment_returns_new_id(db_path):
    result = add_appointment(db_path, patient_name="Sara", date="2026-07-10", time="09:00", reason="checkup")
    assert result["status"] == "scheduled"
    assert result["id"] == 1


def test_list_appointments_filters_by_date(db_path):
    add_appointment(db_path, patient_name="Sara", date="2026-07-10", time="09:00")
    add_appointment(db_path, patient_name="Omar", date="2026-07-11", time="10:00")

    result = list_appointments(db_path, date="2026-07-10")
    assert len(result["appointments"]) == 1
    assert result["appointments"][0]["patient_name"] == "Sara"


def test_list_appointments_without_date_returns_all(db_path):
    add_appointment(db_path, patient_name="Sara", date="2026-07-10", time="09:00")
    add_appointment(db_path, patient_name="Omar", date="2026-07-11", time="10:00")

    result = list_appointments(db_path)
    assert len(result["appointments"]) == 2


def test_cancel_appointment_marks_cancelled_and_hides_from_list(db_path):
    created = add_appointment(db_path, patient_name="Sara", date="2026-07-10", time="09:00")
    result = cancel_appointment(db_path, appointment_id=created["id"])
    assert result["status"] == "cancelled"

    remaining = list_appointments(db_path)
    assert remaining["appointments"] == []


def test_cancel_unknown_appointment_returns_not_found(db_path):
    result = cancel_appointment(db_path, appointment_id=999)
    assert result["status"] == "not_found"
