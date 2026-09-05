"""Модели данных для отчёта предварительного ревью."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class Severity(str, Enum):
    blocker = "blocker"
    major = "major"
    minor = "minor"

    @property
    def ru(self) -> str:
        return {
            Severity.blocker: "Блокер",
            Severity.major: "Существенное",
            Severity.minor: "Незначительное",
        }[self]

    @property
    def icon(self) -> str:
        return {Severity.blocker: "🔴", Severity.major: "🟠", Severity.minor: "🟡"}[self]

    @property
    def rank(self) -> int:
        return {Severity.blocker: 0, Severity.major: 1, Severity.minor: 2}[self]

    @classmethod
    def coerce(cls, value: Any) -> "Severity":
        if isinstance(value, Severity):
            return value
        text = str(value or "").strip().lower()
        mapping = {
            "blocker": cls.blocker,
            "critical": cls.blocker,
            "high": cls.blocker,
            "блокер": cls.blocker,
            "критично": cls.blocker,
            "major": cls.major,
            "medium": cls.major,
            "существенное": cls.major,
            "среднее": cls.major,
            "minor": cls.minor,
            "low": cls.minor,
            "незначительное": cls.minor,
            "низкое": cls.minor,
        }
        return mapping.get(text, cls.major)


class Section(BaseModel):
    """Раздел и координаты в тексте, возвращённом load_text (не страницы Word).

    end_line — последняя строка до следующего заголовка, без вложенных
    разделов. body_start_line указывает на первую строку непустого body.
    """

    number: str = ""
    title: str = ""
    body: str = ""
    start_line: int = 0
    end_line: int = 0
    body_start_line: int | None = None
    level: int = 0
    parent_start_line: int | None = None

    @property
    def heading(self) -> str:
        return f"{self.number} {self.title}".strip() or "Документ в целом"


class Finding(BaseModel):
    """Одно замечание предварительного ревью."""

    id: str = ""
    category: str = "consistency"
    category_title: str = ""
    severity: Severity = Severity.major
    section: str = "Документ в целом"
    quote: str = ""
    issue: str = ""
    impact: str = ""
    recommendation: str = ""
    question_for_analyst: str = ""
    source: str = "llm"  # llm | rule

    def key(self) -> tuple[str, str]:
        """Ключ для дедупликации: категория + нормализованная цитата/суть."""

        anchor = (self.quote or self.issue).lower()
        anchor = " ".join(anchor.split())[:120]
        return (self.category, anchor)


class TemplateCoverageItem(BaseModel):
    section: str
    present: bool
    comment: str = ""


class ReviewReport(BaseModel):
    document_title: str = "Техническое задание"
    verdict: str = ""
    readiness_score: int = 0
    summary: str = ""
    findings: list[Finding] = Field(default_factory=list)
    template_coverage: list[TemplateCoverageItem] = Field(default_factory=list)
    stats: dict[str, Any] = Field(default_factory=dict)
    meta: dict[str, Any] = Field(default_factory=dict)

    # ------------------------------------------------------------------ helpers
    def by_severity(self, severity: Severity) -> list[Finding]:
        return [f for f in self.findings if f.severity == severity]

    @property
    def missing_sections(self) -> list[str]:
        return [c.section for c in self.template_coverage if not c.present]

    def to_dict(self) -> dict[str, Any]:
        return self.model_dump(mode="json")
