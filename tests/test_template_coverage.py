"""Покрытие официального шаблона: структура важнее случайного упоминания."""

from __future__ import annotations

import pytest

from tz_reviewer.analyzer import check_template_coverage, review_document
from tz_reviewer.config import Settings
from tz_reviewer.document import split_sections
from tz_reviewer.models import TemplateCoverageStatus


def _item(text: str, name: str):
    sections = split_sections(text)
    return next(item for item in check_template_coverage(sections, text) if item.section == name)


def test_complete_section_counts_only_when_heading_and_content_exist():
    item = _item("## Data Catalog\nhttps://catalog.example/object/42", "Data Catalog")
    assert item.status == TemplateCoverageStatus.complete
    assert item.present is True


def test_empty_heading_is_not_covered():
    item = _item("## Data Catalog\n\n## DDL\nCREATE TABLE target (id bigint);", "Data Catalog")
    assert item.status == TemplateCoverageStatus.empty
    assert item.present is False
    assert "не содержит" in item.comment


def test_explicit_not_applicable_counts_as_covered():
    item = _item("## Источники обогащения данных\nНе применимо", "Источники обогащения данных")
    assert item.status == TemplateCoverageStatus.not_applicable
    assert item.present is True


def test_topic_mentioned_in_body_does_not_replace_required_section():
    item = _item("## Общие сведения\nФильтрация данных не требуется.", "Алгоритм обработки потока / расчёта")
    assert item.status == TemplateCoverageStatus.mentioned
    assert item.present is False


def test_child_steps_fill_their_parent_algorithm_section():
    item = _item("## Алгоритм обработки потока\n### Шаг 1\nНе применимо", "Алгоритм обработки потока / расчёта")
    assert item.status == TemplateCoverageStatus.complete
    assert item.present is True


@pytest.mark.parametrize("body", [
    "Если раздел не нужен, напишите «не применимо».",
    "Обработка выполняется ежедневно. Это ограничение не применимо к архиву.",
    "```text\nНе применимо\n```",
])
def test_mentions_of_not_applicable_are_not_section_declarations(body):
    item = _item(f"## Источники обогащения данных\n{body}", "Источники обогащения данных")
    assert item.status == TemplateCoverageStatus.complete


@pytest.mark.parametrize("body", ["Не применимо.", "**Не применимо.**", "НЕ ПРИМЕНИМО", "Не применимо — дополнительные источники не используются."])
def test_standalone_not_applicable_declaration_is_accepted(body):
    item = _item(f"## Источники обогащения данных\n{body}", "Источники обогащения данных")
    assert item.status == TemplateCoverageStatus.not_applicable
    assert item.present


def test_mixed_child_steps_do_not_make_whole_algorithm_not_applicable():
    item = _item(
        "## Алгоритм обработки потока\n### Чтение\nЧитаем данные.\n"
        "### Обогащение\nНе применимо.",
        "Алгоритм обработки потока / расчёта",
    )
    assert item.status == TemplateCoverageStatus.complete


def test_sibling_declaration_does_not_fill_empty_section():
    item = _item("## FAQ\nНе применимо.\n## Data Catalog", "Data Catalog")
    assert item.status == TemplateCoverageStatus.empty


@pytest.mark.parametrize("table", [
    "| Источник | Ссылка |\n| --- | --- |",
    "| Name | URL |\n| :--- | ---: |\n|  |  |",
    "| Name | URL |\n| --- | --- |\n| <br> |  |",
])
def test_table_header_without_data_is_empty_and_creates_finding(table):
    name = "Источники обогащения данных"
    text = f"## {name}\n{table}"
    report = review_document(text, settings=Settings(provider="offline", api_key=""))
    item = next(item for item in report.template_coverage if item.section == name)
    assert item.status == TemplateCoverageStatus.empty
    assert not item.present
    finding = next(f for f in report.findings if f.category == "consistency" and name in f.issue)
    assert finding.quote in text


@pytest.mark.parametrize("content", [
    "| Источник | Ссылка |\n| --- | --- |\n| dictionary_alpha | https://catalog.example/object/42 |",
    "Справочники перечислены в приложении.\n| Источник | Ссылка |\n| --- | --- |",
    "| A | B |\n| --- | --- |\n\n| C | D |\n| --- | --- |\n| dictionary_beta | 42 |",
])
def test_real_content_alongside_table_headers_is_preserved(content):
    item = _item(f"## Источники обогащения данных\n{content}", "Источники обогащения данных")
    assert item.status == TemplateCoverageStatus.complete


def test_real_mart_partition_reference_is_mentioned_not_a_section():
    from pathlib import Path

    path = Path(__file__).resolve().parents[1] / "examples" / "case_3_device_agg_vitrina.md"
    text = path.read_text(encoding="utf-8")
    item = _item(text, "Формирование ключа (Kafka) / партиции (HDFS)")
    assert item.status == TemplateCoverageStatus.mentioned
    assert item.present is False
    assert item.evidence_section == "Требования к агрегату"
    assert item.evidence_quote == "| Поле партиционирования | FIELD_BIZ_DATE |"


def test_empty_or_mentioned_sections_create_anchored_rule_findings():
    text = (
        "## Общие сведения\nФормирование партиции выполняется по business_date.\n"
        "## Data Catalog\n"
    )
    report = review_document(text, settings=Settings(provider="offline", api_key=""))
    coverage_findings = [
        finding for finding in report.findings
        if finding.category == "consistency" and "раздел" in finding.issue.lower()
    ]
    assert len(coverage_findings) == 2
    assert all(finding.source == "rule" and finding.quote for finding in coverage_findings)
    assert {finding.section for finding in coverage_findings} == {"Общие сведения", "Data Catalog"}


def test_real_mart_shows_partition_section_gap_as_finding():
    from pathlib import Path

    text = (Path(__file__).resolve().parents[1] / "examples" / "case_3_device_agg_vitrina.md").read_text(
        encoding="utf-8"
    )
    report = review_document(text, settings=Settings(provider="offline", api_key=""))
    finding = next(
        finding for finding in report.findings
        if "Формирование ключа" in finding.issue
    )
    assert finding.section == "Требования к агрегату"
    assert finding.quote == "| Поле партиционирования | FIELD_BIZ_DATE |"
