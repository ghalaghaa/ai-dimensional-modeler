"""Interactive chat with the appointment agent.

Usage: python3 cli.py
"""
from __future__ import annotations

from agent.llm import GroqLLMClient
from agent.orchestrator import SYSTEM_PROMPT, AppointmentAgent

DB_PATH = "appointments.db"


def main():
    agent = AppointmentAgent(GroqLLMClient(), DB_PATH)
    history = [{"role": "system", "content": SYSTEM_PROMPT}]
    print("Appointment Agent — type 'quit' to exit.")
    while True:
        user_input = input("\nyou> ").strip()
        if user_input.lower() in {"quit", "exit"}:
            break
        reply, history = agent.run(user_input, history=history)
        print(f"agent> {reply}")


if __name__ == "__main__":
    main()
