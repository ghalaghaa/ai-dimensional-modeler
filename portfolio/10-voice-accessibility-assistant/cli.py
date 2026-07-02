"""Run the voice assistant.

Default mode is safe anywhere: type commands instead of speaking, and
see what the assistant *would* do (dry run) instead of actually
controlling the mouse/keyboard.

  python3 cli.py           # typed input, dry run (safe everywhere)
  python3 cli.py --mic      # real microphone via Vosk (needs a model, see README)
  python3 cli.py --live     # actually control mouse/keyboard via pyautogui (needs a display)
"""
from __future__ import annotations

import argparse

from assistant.actions import DryRunExecutor, PyAutoGUIExecutor
from assistant.assistant import VoiceAssistant
from assistant.stt import TypedInputSTT


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mic", action="store_true", help="Use a real microphone via Vosk instead of typed input")
    parser.add_argument("--model", default="model", help="Path to the Vosk model directory (only used with --mic)")
    parser.add_argument("--live", action="store_true", help="Actually control mouse/keyboard instead of a dry run")
    args = parser.parse_args()

    if args.mic:
        from assistant.stt import VoskSTT

        stt = VoskSTT(args.model)
    else:
        stt = TypedInputSTT()

    executor = PyAutoGUIExecutor() if args.live else DryRunExecutor()

    print("Voice Accessibility Assistant — say/type 'stop' to exit.")
    print("Try: 'open browser', 'click submit button', 'scroll down', 'type hello there', 'read screen'\n")
    VoiceAssistant(stt, executor).run()


if __name__ == "__main__":
    main()
