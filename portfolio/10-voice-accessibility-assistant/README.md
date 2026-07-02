# Voice Accessibility Assistant

A voice-controlled computer assistant designed for people with motor
impairments who find a mouse and keyboard difficult or impossible to use:
speak a command like *"click the login button"* or *"scroll down"* and it
gets carried out — no hands required once set up.

**Who it's for:** users with limited hand mobility who need an
alternative way to operate a computer.

## Architecture

The pipeline has three independently swappable stages, connected only by
plain interfaces:

```
Speech-to-Text  ─▶  Intent Parser  ─▶  Action Executor
 (audio → text)     (text → Command)   (Command → real effect)
```

- **`assistant/stt.py`** — `TypedInputSTT` (type instead of speak — a
  real accessibility fallback for users who can't/don't want to talk, and
  also what makes this whole project runnable without a microphone),
  `VoskSTT` (real offline speech recognition), `ScriptedSTT` (fixed
  transcripts, used in tests).
- **`assistant/intent_parser.py`** — rule-based NLU. No ML model needed;
  a small registry of regex patterns turns free-form phrasing ("open the
  browser", "launch spotify", "start calculator") into a structured
  `Command`.
- **`assistant/actions.py`** — `DryRunExecutor` (default; safe anywhere,
  records what it *would* do) and `PyAutoGUIExecutor` (real mouse/keyboard
  control, needs a graphical display).

Because the STT and executor are behind interfaces, the intent-parsing
logic — the actual "brain" of the assistant — is fully unit-tested
without a microphone, speakers, or display.

## Setup & run

```bash
cd 10-voice-accessibility-assistant
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python3 cli.py
```

```
Voice Accessibility Assistant — say/type 'stop' to exit.
Try: 'open browser', 'click submit button', 'scroll down', 'type hello there', 'read screen'

you> open the browser
Would open application: the browser
you> scroll down
Would scroll down
you> stop
Stopped
```

### Using a real microphone

Install the optional speech dependencies and download a small Vosk
model (offline, no cloud API):

```bash
pip install vosk pyaudio
curl -LO https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip -d model
python3 cli.py --mic --model model/vosk-model-small-en-us-0.15
```

### Live desktop control

```bash
pip install pyautogui
python3 cli.py --live   # actually clicks/scrolls/types — requires a display
```

## Tests

All 22 tests run without a microphone, speakers, or display — they cover
the intent parser (many phrasings, synonyms, edge cases like unknown
commands and empty input), the dry-run executor, and the full
STT → parser → executor pipeline via `ScriptedSTT`:

```bash
pytest -v
```
