"""Смоук-тест полного пайплайна в офлайн-режиме (без обращения к LLM)."""

from __future__ import annotations

from pathlib import Path

import pytest

from tz_reviewer.analyzer import review_document
from tz_reviewer.config import Settings
from tz_reviewer.report import to_html, to_json, to_markdown

EXAMPLES = Path(__file__).resolve().parent.parent / "examples"


@pytest.fixture
def offline_settings() -> Settings:
    s = Settings()
    s.provider = "offline"
    s.api_key = ""
    return s


def test_offline_review_of_raw_example(offline_settings):
    text = (EXAMPLES / "tz_flow_raw.md").read_text(encoding="utf-8")
    report = review_document(text, settings=offline_settings)

    assert report.meta["provider"] == "offline"
    assert report.meta["llm_used"] is False
    assert report.findings, "офлайн-режим должен находить хотя бы эвристические замечания"
    assert all(f.source == "rule" for f in report.findings)
    assert 0 <= report.readiness_score <= 100
    assert report.verdict
    assert report.summary
    assert any(not c.present for c in report.template_coverage), (
        "в сыром ТЗ часть разделов шаблона должна отсутствовать"
    )


def test_renderers_produce_output(offline_settings):
    text = (EXAMPLES / "tz_datamart_raw.md").read_text(encoding="utf-8")
    report = review_document(text, settings=offline_settings)

    md = to_markdown(report)
    assert md.startswith("# Предварительное ревью ТЗ")
    assert "Покрытие шаблона" in md

    html = to_html(report)
    assert "<h1>" in html and "Замечания" in html

    payload = to_json(report)
    assert '"findings"' in payload and '"readiness_score"' in payload


def test_improved_example_scores_higher_than_raw(offline_settings):
    raw = review_document((EXAMPLES / "tz_flow_raw.md").read_text(encoding="utf-8"), settings=offline_settings)
    improved = review_document(
        (EXAMPLES / "tz_flow_improved.md").read_text(encoding="utf-8"), settings=offline_settings
    )
    assert improved.readiness_score >= raw.readiness_score
    assert len(improved.missing_sections) <= len(raw.missing_sections)
