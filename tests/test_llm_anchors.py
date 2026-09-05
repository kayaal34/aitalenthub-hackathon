"""Missing quotes can be restored without inventing evidence or calling an API."""

import pytest

from tz_reviewer.analyzer import _anchor_empty_section_findings, review_document
from tz_reviewer.config import Settings
from tz_reviewer.document import split_sections
from tz_reviewer.llm import LLMClient
from tz_reviewer.models import Finding
from tz_reviewer.report import to_markdown


@pytest.mark.parametrize("location", [
    "Публикация результата",
    "1: Публикация результата",
    "Раздел 1: Публикация результата",
    "[Раздел 1: Публикация результата]",
])
def test_empty_section_finding_gets_actual_source_heading(monkeypatch, location):
    text = "## Публикация результата\n\n## Расписание\nЕжедневно."
    payload = {"findings": [{
        "category": "consistency", "section": location, "quote": "",
        "issue": "Раздел пуст.", "impact": "Не описана запись результата.",
        "recommendation": "Описать запись.",
        "question_for_analyst": "Как записывается результат?",
    }]}
    monkeypatch.setattr(LLMClient, "generate_json", lambda *args, **kwargs: payload)
    report = review_document(text, settings=Settings(provider="openai", api_key="test-only"))
    finding = next(f for f in report.findings if f.source == "llm")
    assert finding.quote == text.splitlines()[0]
    assert finding.section == "Публикация результата"
    assert finding.issue == payload["findings"][0]["issue"]
    assert f"> {finding.quote}" in to_markdown(report)
    assert not report.meta["llm_error"]


@pytest.mark.parametrize("text, location, quote, issue", [
    ("## Запись\nОписание есть.", "Запись", "", "Раздел пуст."),
    ("## Запись\nНе применимо.", "Запись", "", "Раздел пуст."),
    ("## Запись\n### Подшаг\nОписание есть.", "Запись", "", "Раздел пуст."),
    ("## Запись\n## Запись\n", "Запись", "", "Раздел пуст."),
    ("## Запись\n", "Несуществующий раздел", "", "Раздел пуст."),
    ("## Запись\n", "2: Запись", "", "Раздел пуст."),
    ("## Запись\n", "Запись", "Исходная цитата модели", "Раздел пуст."),
    ("## Запись\n", "Запись", "", "Противоречие в алгоритме."),
])
def test_uncertain_or_existing_evidence_is_not_replaced(text, location, quote, issue):
    finding = Finding(category="consistency", section=location, quote=quote, issue=issue)
    before = finding.model_dump()
    _anchor_empty_section_findings([finding], split_sections(text), text)
    assert finding.model_dump() == before
