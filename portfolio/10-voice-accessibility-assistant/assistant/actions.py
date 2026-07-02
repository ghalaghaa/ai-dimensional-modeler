"""Executors that turn a parsed Command into an actual effect.

Two backends: a DryRunExecutor (default, safe anywhere — records what it
*would* do) and a PyAutoGUIExecutor (real mouse/keyboard control, needs a
graphical display). Keeping them behind the same interface is what makes
the intent-parsing logic testable without touching real hardware.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Protocol

from .intent_parser import Command


class ActionExecutor(Protocol):
    def execute(self, command: Command) -> str: ...


@dataclass
class ExecutedAction:
    command: Command
    result: str


class DryRunExecutor:
    def __init__(self):
        self.history: List[ExecutedAction] = []

    def execute(self, command: Command) -> str:
        if command.action == "OPEN_APP":
            result = f"Would open application: {command.target}"
        elif command.action == "CLICK":
            result = f"Would click: {command.target}"
        elif command.action == "MOVE_MOUSE":
            result = f"Would move mouse to: {command.target}"
        elif command.action == "SCROLL":
            result = f"Would scroll {command.params.get('direction')}"
        elif command.action == "READ_SCREEN":
            result = "Would read the screen contents aloud"
        elif command.action == "TYPE_TEXT":
            result = f"Would type: {command.params.get('text')!r}"
        elif command.action == "STOP":
            result = "Stopped"
        else:
            result = f"Sorry, I didn't understand: {command.raw_text!r}"
        self.history.append(ExecutedAction(command, result))
        return result


class PyAutoGUIExecutor:
    """Real backend for a live desktop session. Requires the optional
    `pyautogui` dependency and a graphical DISPLAY — not usable headless,
    which is exactly why automated tests exercise DryRunExecutor instead."""

    def __init__(self):
        import pyautogui  # noqa: local import so this class can exist without the dep

        self._gui = pyautogui

    def execute(self, command: Command) -> str:
        gui = self._gui
        if command.action == "CLICK":
            gui.click()
            return f"Clicked: {command.target}"
        if command.action == "SCROLL":
            amount = 300 if command.params.get("direction") == "up" else -300
            gui.scroll(amount)
            return f"Scrolled {command.params.get('direction')}"
        if command.action == "TYPE_TEXT":
            gui.typewrite(command.params.get("text", ""))
            return f"Typed: {command.params.get('text')!r}"
        if command.action == "MOVE_MOUSE":
            return f"Move-to-named-zone is not implemented for live control: {command.target}"
        return f"Live control not implemented for action: {command.action}"
