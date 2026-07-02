from assistant.actions import DryRunExecutor
from assistant.assistant import VoiceAssistant
from assistant.stt import ScriptedSTT


def test_full_pipeline_from_transcript_to_recorded_action():
    stt = ScriptedSTT(["open the browser", "click the login button", "stop"])
    executor = DryRunExecutor()
    assistant = VoiceAssistant(stt, executor)

    steps = assistant.run()

    assert steps == 3
    assert executor.history[0].command.action == "OPEN_APP"
    assert executor.history[1].command.action == "CLICK"
    assert executor.history[2].command.action == "STOP"


def test_stops_gracefully_when_transcripts_run_out_without_a_stop_command():
    stt = ScriptedSTT(["scroll down", "scroll up"])
    executor = DryRunExecutor()
    assistant = VoiceAssistant(stt, executor)

    steps = assistant.run()

    assert steps == 2
    assert len(executor.history) == 2


def test_max_steps_caps_the_loop():
    stt = ScriptedSTT(["scroll down"] * 10)
    executor = DryRunExecutor()
    assistant = VoiceAssistant(stt, executor)

    steps = assistant.run(max_steps=3)

    assert steps == 3
