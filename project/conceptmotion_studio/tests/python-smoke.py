from pathlib import Path
import json
import tempfile
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "python"))
from conceptmotion import table_window_scene

scene = table_window_scene()
payload = scene.to_dict()
assert payload["version"] == "1"
assert payload["renderer"] == "window"
assert "data" in payload and payload["data"]["rows"]
assert payload["frames"][-1]["codeFocus"] == [1, 2]
with tempfile.TemporaryDirectory() as tmp:
    path = scene.write(Path(tmp) / "scene.json")
    loaded = json.loads(path.read_text(encoding="utf-8"))
    assert loaded == payload
print(f"python smoke: {scene.id} · {len(scene.frames)} frames · canonical nested data")
