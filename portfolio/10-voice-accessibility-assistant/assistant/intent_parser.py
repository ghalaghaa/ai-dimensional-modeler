"""Rule-based natural-language-to-command parser.

Turns a transcribed utterance like "open the browser" or "scroll down"
into a structured Command the executor layer can act on. Kept
independent of speech-to-text and of the executor so it's testable as
plain text-in / Command-out logic.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Callable, List, Optional, Tuple


@dataclass
class Command:
    action: str
    target: Optional[str] = None
    params: dict = field(default_factory=dict)
    raw_text: str = ""


_RULES: List[Tuple["re.Pattern[str]", Callable[["re.Match[str]", str], Command]]] = []


def _rule(pattern: str):
    compiled = re.compile(pattern, re.IGNORECASE)

    def decorator(func: Callable[["re.Match[str]", str], Command]):
        _RULES.append((compiled, func))
        return func

    return decorator


@_rule(r"^\s*(?:stop|cancel|never\s*mind)\s*$")
def _stop(match, text) -> Command:
    return Command(action="STOP", raw_text=text)


@_rule(r"^\s*(?:read|speak)\s+(?:the\s+)?screen\s*$")
def _read_screen(match, text) -> Command:
    return Command(action="READ_SCREEN", raw_text=text)


@_rule(r"^\s*scroll\s+(up|down|left|right)\s*$")
def _scroll(match, text) -> Command:
    return Command(action="SCROLL", params={"direction": match.group(1).lower()}, raw_text=text)


@_rule(r"^\s*(?:move|go)\s+(?:the\s+)?(?:mouse|cursor)?\s*to\s+(.+)$")
def _move(match, text) -> Command:
    return Command(action="MOVE_MOUSE", target=match.group(1).strip(), raw_text=text)

@_rule(r"^\s*(?:click|press|select)\s+(?:on\s+)?(.+)$")
def _click(match, text) -> Command:
    return Command(action="CLICK", target=match.group(1).strip(), raw_text=text)


@_rule(r"^\s*(?:type|dictate|write)\s+(.+)$")
def _type_text(match, text) -> Command:
    return Command(action="TYPE_TEXT", params={"text": match.group(1).strip()}, raw_text=text)


@_rule(r"^\s*(?:open|launch|start)\s+(.+)$")
def _open_app(match, text) -> Command:
    return Command(action="OPEN_APP", target=match.group(1).strip(), raw_text=text)


def parse_command(text: str) -> Command:
    """Match against the rule list in registration order (most specific
    first) and fall back to UNKNOWN so callers can handle it gracefully
    instead of crashing on an unrecognized utterance."""
    normalized = text.strip()
    for pattern, handler in _RULES:
        match = pattern.match(normalized)
        if match:
            return handler(match, normalized)
    return Command(action="UNKNOWN", raw_text=normalized)
