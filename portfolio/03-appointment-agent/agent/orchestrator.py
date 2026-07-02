"""The agent loop: send the conversation + tool schemas to the LLM, execute
whatever tool calls it asks for, feed the results back, repeat until the
LLM answers in plain text instead of calling a tool."""
from __future__ import annotations

import json
from typing import List

from .llm import LLMClient
from .tools import TOOL_FUNCTIONS, TOOL_SCHEMAS

SYSTEM_PROMPT = (
    "You are a scheduling assistant for a small clinic. You can add, list, "
    "and cancel appointments using the provided tools. Always use a tool to "
    "check current appointments before cancelling. Confirm actions back to "
    "the user in plain, friendly language. Today's date context, if needed, "
    "should be inferred from the user's message; ask for clarification if "
    "a date or time is ambiguous or missing."
)


class AppointmentAgent:
    def __init__(self, llm: LLMClient, db_path: str, max_steps: int = 6):
        self.llm = llm
        self.db_path = db_path
        self.max_steps = max_steps

    def execute_tool(self, tool_call: dict) -> dict:
        name = tool_call["function"]["name"]
        arguments = json.loads(tool_call["function"]["arguments"] or "{}")
        func = TOOL_FUNCTIONS.get(name)
        if func is None:
            return {"error": f"Unknown tool: {name}"}
        return func(self.db_path, **arguments)

    def run(self, user_message: str, history: List[dict] | None = None) -> tuple[str, List[dict]]:
        messages = history or [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.append({"role": "user", "content": user_message})

        for _ in range(self.max_steps):
            assistant_msg = self.llm.chat(messages, tools=TOOL_SCHEMAS)
            messages.append(assistant_msg)

            tool_calls = assistant_msg.get("tool_calls")
            if not tool_calls:
                return assistant_msg.get("content") or "", messages

            for call in tool_calls:
                result = self.execute_tool(call)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": call["id"],
                        "content": json.dumps(result),
                    }
                )

        return "I couldn't complete that request in time — could you rephrase it?", messages
