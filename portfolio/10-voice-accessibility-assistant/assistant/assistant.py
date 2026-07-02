"""Wires speech-to-text -> intent parsing -> action execution together."""
from __future__ import annotations

from typing import Optional

from .actions import ActionExecutor
from .intent_parser import parse_command
from .stt import SpeechToText


class VoiceAssistant:
    def __init__(self, stt: SpeechToText, executor: ActionExecutor):
        self.stt = stt
        self.executor = executor

    def step(self) -> str:
        text = self.stt.listen()
        command = parse_command(text)
        return self.executor.execute(command)

    def run(self, max_steps: Optional[int] = None) -> int:
        steps = 0
        while max_steps is None or steps < max_steps:
            try:
                result = self.step()
            except StopIteration:
                break
            print(result)
            steps += 1
            if result == "Stopped":
                break
        return steps
