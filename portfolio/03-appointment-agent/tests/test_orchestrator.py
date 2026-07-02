import json
import tempfile
from pathlib import Path

import pytest

from agent.orchestrator import AppointmentAgent
from agent.tools import list_appointments


class ScriptedLLM:
    """Replays a fixed sequence of assistant messages, ignoring the real
    prompt — lets us test the tool-calling loop without hitting a real API."""

    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def chat(self, messages, tools):
        self.calls.append(messages)
        return self.responses.pop(0)


def tool_call_message(call_id: str, name: str, arguments: dict) -> dict:
    return {
        "role": "assistant",
        "content": None,
        "tool_calls": [
            {
                "id": call_id,
                "type": "function",
                "function": {"name": name, "arguments": json.dumps(arguments)},
            }
        ],
    }


def final_message(text: str) -> dict:
    return {"role": "assistant", "content": text}


@pytest.fixture
def db_path():
    with tempfile.TemporaryDirectory() as tmp:
        yield str(Path(tmp) / "appointments.db")


def test_agent_executes_tool_call_then_returns_final_answer(db_path):
    llm = ScriptedLLM(
        [
            tool_call_message("call_1", "add_appointment", {
                "patient_name": "Sara", "date": "2026-07-10", "time": "09:00", "reason": "checkup",
            }),
            final_message("Done! Sara is booked for 2026-07-10 at 09:00."),
        ]
    )
    agent = AppointmentAgent(llm, db_path)

    reply, history = agent.run("Book Sara for a checkup on July 10 2026 at 9am")

    assert "Sara is booked" in reply
    stored = list_appointments(db_path)
    assert len(stored["appointments"]) == 1
    assert stored["appointments"][0]["patient_name"] == "Sara"

    # the tool result must have been fed back to the LLM as a "tool" message
    tool_messages = [m for m in history if m.get("role") == "tool"]
    assert len(tool_messages) == 1
    assert json.loads(tool_messages[0]["content"])["status"] == "scheduled"


def test_agent_stops_after_max_steps_if_llm_keeps_calling_tools(db_path):
    always_call = tool_call_message("call_x", "list_appointments", {})
    llm = ScriptedLLM([always_call] * 3)
    agent = AppointmentAgent(llm, db_path, max_steps=3)

    reply, _ = agent.run("What appointments do I have?")

    assert "couldn't complete" in reply.lower()
    assert len(llm.calls) == 3


def test_agent_handles_unknown_tool_gracefully(db_path):
    llm = ScriptedLLM(
        [
            tool_call_message("call_1", "delete_everything", {}),
            final_message("Sorry, I can't do that."),
        ]
    )
    agent = AppointmentAgent(llm, db_path)

    reply, history = agent.run("Delete everything")

    assert "can't do that" in reply
    tool_messages = [m for m in history if m.get("role") == "tool"]
    assert "error" in json.loads(tool_messages[0]["content"])
