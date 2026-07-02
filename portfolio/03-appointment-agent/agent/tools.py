"""The tools the agent is allowed to call. Each one is a plain, directly
testable Python function; the LLM only ever chooses *which* to call and
*with what arguments* — it never touches the database itself."""
from __future__ import annotations

from typing import Optional

from .db import connect, init_db

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "add_appointment",
            "description": "Schedule a new appointment for a patient.",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_name": {"type": "string"},
                    "date": {"type": "string", "description": "YYYY-MM-DD"},
                    "time": {"type": "string", "description": "HH:MM, 24h format"},
                    "reason": {"type": "string", "description": "Reason for the visit"},
                },
                "required": ["patient_name", "date", "time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_appointments",
            "description": "List scheduled appointments, optionally filtered by date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "string", "description": "YYYY-MM-DD, omit for all"},
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_appointment",
            "description": "Cancel an existing appointment by its id.",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {"type": "integer"},
                },
                "required": ["appointment_id"],
            },
        },
    },
]


def add_appointment(db_path: str, patient_name: str, date: str, time: str, reason: str = "") -> dict:
    init_db(db_path)
    with connect(db_path) as conn:
        cur = conn.execute(
            "INSERT INTO appointments (patient_name, date, time, reason) VALUES (?, ?, ?, ?)",
            (patient_name, date, time, reason),
        )
        conn.commit()
        return {"id": cur.lastrowid, "status": "scheduled", "patient_name": patient_name, "date": date, "time": time}


def list_appointments(db_path: str, date: Optional[str] = None) -> dict:
    init_db(db_path)
    with connect(db_path) as conn:
        if date:
            rows = conn.execute(
                "SELECT * FROM appointments WHERE date = ? AND status != 'cancelled' ORDER BY time",
                (date,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM appointments WHERE status != 'cancelled' ORDER BY date, time"
            ).fetchall()
        return {"appointments": [dict(r) for r in rows]}


def cancel_appointment(db_path: str, appointment_id: int) -> dict:
    init_db(db_path)
    with connect(db_path) as conn:
        cur = conn.execute(
            "UPDATE appointments SET status = 'cancelled' WHERE id = ? AND status != 'cancelled'",
            (appointment_id,),
        )
        conn.commit()
        if cur.rowcount == 0:
            return {"status": "not_found", "appointment_id": appointment_id}
        return {"status": "cancelled", "appointment_id": appointment_id}


TOOL_FUNCTIONS = {
    "add_appointment": add_appointment,
    "list_appointments": list_appointments,
    "cancel_appointment": cancel_appointment,
}
