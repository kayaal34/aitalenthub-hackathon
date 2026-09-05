"""Покрытие официального шаблона: структура важнее случайного упоминания."""

from __future__ import annotations

from tz_reviewer.analyzer import check_template_coverage
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
    assert item.status == TemplateCoverageStatus.not_applicable
    assert item.present is True


def test_real_mart_partition_reference_is_mentioned_not_a_section():
    from pathlib import Path

    path = Path(__file__).resolve().parents[1] / "examples" / "case_3_device_agg_vitrina.md"
    text = path.read_text(encoding="utf-8")
    item = _item(text, "Формирование ключа (Kafka) / партиции (HDFS)")
    assert item.status == TemplateCoverageStatus.mentioned
    assert item.present is False
