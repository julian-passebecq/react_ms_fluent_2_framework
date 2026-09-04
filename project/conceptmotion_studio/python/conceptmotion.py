"""Small dependency-free authoring helpers for ConceptMotion Studio scene JSON.

Canonical v1 output keeps renderer-specific payload under ``data``. The browser
runtime also accepts the older flat bundled-scene form during migration.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from json import dump, dumps
from pathlib import Path
from typing import Any

@dataclass
class Frame:
    caption: str
    operation: str
    state: dict[str, Any] = field(default_factory=dict)
    code_focus: list[int] = field(default_factory=list)
    duration: int | None = None
    hold: int | None = None

    def to_dict(self) -> dict[str, Any]:
        out = {"caption": self.caption, "operation": self.operation, **self.state}
        if self.code_focus:
            out["codeFocus"] = self.code_focus
        if self.duration is not None:
            out["duration"] = self.duration
        if self.hold is not None:
            out["hold"] = self.hold
        return out

@dataclass
class Scene:
    id: str
    title: str
    renderer: str
    subtitle: str = ""
    data: dict[str, Any] = field(default_factory=dict)
    code: list[str] = field(default_factory=list)
    frames: list[Frame] = field(default_factory=list)
    version: str = "1"

    def add_frame(
        self,
        caption: str,
        operation: str,
        *,
        code_focus: list[int] | None = None,
        duration: int | None = None,
        hold: int | None = None,
        **state: Any,
    ) -> "Scene":
        self.frames.append(Frame(
            caption=caption,
            operation=operation,
            state=state,
            code_focus=code_focus or [],
            duration=duration,
            hold=hold,
        ))
        return self

    def to_dict(self) -> dict[str, Any]:
        return {
            "version": self.version,
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle,
            "renderer": self.renderer,
            "data": self.data,
            "code": self.code,
            "frames": [f.to_dict() for f in self.frames],
        }

    def json(self, *, indent: int = 2) -> str:
        return dumps(self.to_dict(), indent=indent, ensure_ascii=False)

    def write(self, path: str | Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as fh:
            dump(self.to_dict(), fh, indent=2, ensure_ascii=False)
        return path


def table_window_scene() -> Scene:
    scene = Scene(
        id="rolling-window-demo",
        title="Rolling 3-row sum",
        renderer="window",
        subtitle="Python-generated scene",
        data={
            "columns": ["month", "revenue"],
            "rows": [["Jan", 120], ["Feb", 180], ["Mar", 90], ["Apr", 210]],
        },
        code=[
            "SUM(revenue) OVER (",
            "  ORDER BY month",
            "  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW",
            ")",
        ],
    )
    scene.add_frame("Only Jan exists in the first frame.", "FRAME Jan", cursor=0, active=[0], metric=120, code_focus=[2])
    scene.add_frame("The frame expands to Jan-Feb.", "FRAME Jan-Feb", cursor=1, active=[0, 1], metric=300, code_focus=[2])
    scene.add_frame("Three rows now fit.", "FRAME Jan-Mar", cursor=2, active=[0, 1, 2], metric=390, code_focus=[2])
    scene.add_frame("Jan exits and Apr enters.", "SLIDE", cursor=3, active=[1, 2, 3], metric=480, code_focus=[1, 2])
    return scene
