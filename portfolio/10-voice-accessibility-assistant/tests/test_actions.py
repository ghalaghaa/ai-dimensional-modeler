from assistant.actions import DryRunExecutor
from assistant.intent_parser import Command


def test_dry_run_open_app():
    executor = DryRunExecutor()
    result = executor.execute(Command(action="OPEN_APP", target="browser", raw_text="open browser"))
    assert "browser" in result
    assert len(executor.history) == 1
    assert executor.history[0].result == result


def test_dry_run_click_and_scroll_and_type():
    executor = DryRunExecutor()
    assert "submit" in executor.execute(Command(action="CLICK", target="submit", raw_text="click submit"))
    assert "down" in executor.execute(Command(action="SCROLL", params={"direction": "down"}, raw_text="scroll down"))
    assert "hello" in executor.execute(Command(action="TYPE_TEXT", params={"text": "hello"}, raw_text="type hello"))


def test_dry_run_stop_returns_exact_stopped_sentinel():
    executor = DryRunExecutor()
    result = executor.execute(Command(action="STOP", raw_text="stop"))
    assert result == "Stopped"


def test_dry_run_unknown_action_reports_it_did_not_understand():
    executor = DryRunExecutor()
    result = executor.execute(Command(action="UNKNOWN", raw_text="banana"))
    assert "didn't understand" in result
    assert "banana" in result


def test_history_accumulates_across_multiple_calls():
    executor = DryRunExecutor()
    executor.execute(Command(action="READ_SCREEN", raw_text="read screen"))
    executor.execute(Command(action="STOP", raw_text="stop"))
    assert len(executor.history) == 2
