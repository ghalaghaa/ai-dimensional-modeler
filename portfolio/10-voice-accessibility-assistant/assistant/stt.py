"""Speech-to-text backends, all behind the same tiny interface.

TypedInputSTT is both a genuine accessibility fallback (not everyone can
or wants to speak commands) and what makes the rest of the pipeline
runnable/testable without a microphone. VoskSTT is the real offline
speech backend for live use.
"""
from __future__ import annotations

from typing import List, Protocol


class SpeechToText(Protocol):
    def listen(self) -> str: ...


class TypedInputSTT:
    def __init__(self, prompt: str = "you> "):
        self.prompt = prompt

    def listen(self) -> str:
        return input(self.prompt)


class ScriptedSTT:
    """Replays a fixed list of transcripts — used in tests/demos."""

    def __init__(self, transcripts: List[str]):
        self._transcripts = list(transcripts)

    def listen(self) -> str:
        if not self._transcripts:
            raise StopIteration("No more scripted transcripts")
        return self._transcripts.pop(0)


class VoskSTT:
    """Offline speech-to-text using Vosk + a local microphone.

    Requires the optional `vosk` and `pyaudio` packages plus a downloaded
    language model (see README) — not exercised in automated tests since
    it needs a real audio input device.
    """

    def __init__(self, model_path: str, sample_rate: int = 16000):
        import json

        import pyaudio
        import vosk

        self._json = json
        self._model = vosk.Model(model_path)
        self._recognizer = vosk.KaldiRecognizer(self._model, sample_rate)
        self._pyaudio = pyaudio.PyAudio()
        self._stream = self._pyaudio.open(
            format=pyaudio.paInt16, channels=1, rate=sample_rate, input=True, frames_per_buffer=8000
        )

    def listen(self) -> str:
        self._stream.start_stream()
        while True:
            data = self._stream.read(4000, exception_on_overflow=False)
            if self._recognizer.AcceptWaveform(data):
                result = self._json.loads(self._recognizer.Result())
                text = result.get("text", "").strip()
                if text:
                    return text
