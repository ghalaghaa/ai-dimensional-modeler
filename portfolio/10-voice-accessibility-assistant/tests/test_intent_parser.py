from assistant.intent_parser import parse_command


def test_open_app():
    cmd = parse_command("open the browser")
    assert cmd.action == "OPEN_APP"
    assert cmd.target == "the browser"


def test_launch_and_start_are_synonyms_for_open():
    assert parse_command("launch spotify").action == "OPEN_APP"
    assert parse_command("start the calculator").action == "OPEN_APP"


def test_click_target():
    cmd = parse_command("click on the submit button")
    assert cmd.action == "CLICK"
    assert cmd.target == "the submit button"


def test_click_without_on():
    cmd = parse_command("press the login button")
    assert cmd.action == "CLICK"
    assert cmd.target == "the login button"


def test_move_mouse_to_zone():
    cmd = parse_command("move the mouse to top right corner")
    assert cmd.action == "MOVE_MOUSE"
    assert cmd.target == "top right corner"


def test_scroll_direction():
    cmd = parse_command("scroll down")
    assert cmd.action == "SCROLL"
    assert cmd.params["direction"] == "down"


def test_scroll_rejects_invalid_direction_as_unknown():
    cmd = parse_command("scroll sideways")
    assert cmd.action == "UNKNOWN"


def test_read_screen():
    assert parse_command("read the screen").action == "READ_SCREEN"
    assert parse_command("speak screen").action == "READ_SCREEN"


def test_type_text_preserves_full_dictated_content():
    cmd = parse_command("type hello, how are you today?")
    assert cmd.action == "TYPE_TEXT"
    assert cmd.params["text"] == "hello, how are you today?"


def test_dictate_is_synonym_for_type():
    cmd = parse_command("dictate meeting notes for today")
    assert cmd.action == "TYPE_TEXT"
    assert cmd.params["text"] == "meeting notes for today"


def test_stop_and_cancel():
    assert parse_command("stop").action == "STOP"
    assert parse_command("cancel").action == "STOP"
    assert parse_command("never mind").action == "STOP"


def test_case_insensitive_and_whitespace_tolerant():
    cmd = parse_command("   OPEN   Settings  ")
    assert cmd.action == "OPEN_APP"


def test_unrecognized_command_returns_unknown_with_raw_text():
    cmd = parse_command("what's the weather like today")
    assert cmd.action == "UNKNOWN"
    assert cmd.raw_text == "what's the weather like today"


def test_empty_input_returns_unknown():
    cmd = parse_command("")
    assert cmd.action == "UNKNOWN"
