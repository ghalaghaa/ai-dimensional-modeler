# Appointment Scheduling Agent

An LLM **agent**, not just a chatbot: it decides which tools to call
(add / list / cancel an appointment), the tools execute against a real
SQLite database, and the results are fed back to the LLM until it has
enough information to answer the user in plain language.

**Who it's for:** small clinics or businesses that want a natural-language
front end for scheduling instead of a rigid form.

## How it's different from a plain chatbot

The LLM never touches the database directly. It's given a set of tool
schemas (`agent/tools.py: TOOL_SCHEMAS`) and must respond with a
structured tool call; the orchestrator (`agent/orchestrator.py`) executes
the real Python function, and the result is appended back to the
conversation as a `tool` message before the loop continues. This is the
same tool-calling pattern used by production agent frameworks, built
directly on top of the raw API so the mechanics stay visible.

## Stack

Python, SQLite, Groq API (Llama 3.3, OpenAI-compatible tool calling —
swap `GROQ_BASE_URL`/`GROQ_MODEL` for any other OpenAI-compatible
provider that supports tools).

## Setup & run

```bash
cd 03-appointment-agent
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your free Groq API key (console.groq.com)

python3 cli.py
```

Example session:

```
you> Book Sara for a checkup tomorrow at 9am
agent> Done! Sara is booked for 2026-07-03 at 09:00 (checkup).

you> What appointments do I have?
agent> You have 1 appointment: Sara on 2026-07-03 at 09:00 (checkup).

you> Cancel it
agent> Cancelled Sara's appointment on 2026-07-03.
```

## Tests

`tests/test_tools.py` tests the database tools directly (no LLM
involved). `tests/test_orchestrator.py` scripts a fake LLM that returns a
fixed sequence of tool calls to verify the agent loop — execute tool,
feed result back, stop at a final text answer, and bail out after
`max_steps` if the LLM never stops calling tools. The full suite runs
**without needing an API key**:

```bash
pytest -v
```
