"""Pluggable LLM client with OpenAI-style tool/function calling.

Defaults to Groq's OpenAI-compatible endpoint. Any provider that speaks
the same `tools` / `tool_calls` message format works by changing
GROQ_BASE_URL / GROQ_MODEL.
"""
from __future__ import annotations

import os
from typing import List, Protocol

import requests


class LLMClient(Protocol):
    def chat(self, messages: List[dict], tools: List[dict]) -> dict: ...


class GroqLLMClient:
    def __init__(self, api_key: str | None = None, model: str | None = None, base_url: str | None = None):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.model = model or os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.base_url = base_url or os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

    def chat(self, messages: List[dict], tools: List[dict]) -> dict:
        if not self.api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Copy .env.example to .env and add your key "
                "(free at https://console.groq.com)."
            )
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": self.model,
                "messages": messages,
                "tools": tools,
                "temperature": 0.2,
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]
