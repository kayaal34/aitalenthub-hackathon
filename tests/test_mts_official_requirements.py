"""Регрессии по трём материалам, выданным МТС для хакатона.

Источники:
* «Основные моменты документации.pdf» — восемь приоритетных критериев;
* «Шаблоны документации.pdf» — обязательная структура ТЗ;
* «Тестовые данные для Хакатона.pdf» — три обезличенных примера.

Тесты не фиксируют имена таблиц/топиков как правила продукта. Они проверяют,
что критерии остаются в базе знаний и что офлайн-проход выявляет известные
пропуски именно в предоставленных организаторами документах.
"""

from __future__ import annotations

from pathlib import Path

from tz_reviewer.analyzer import check_template_coverage
from tz_reviewer.document import split_sections
from tz_reviewer.heuristics import run_heuristics
from tz_reviewer.knowledge import TEMPLATE_SECTIONS
from tz_reviewer.rubric import RUBRIC_BY_KEY


ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "examples"
KNOWLEDGE = ROOT / "knowledge"


def _findings(case_name: str):
    text = (EXAMPLES / case_name).read_text(encoding="utf-8")
    return run_heuristics(split_sections(text))


def test_official_mts_categories_are_available_to_the_llm():
    expected_keys = {
        "serialization",
        "data_catalog",
        "data_types",
        "filters",
        "infra_params",
        "reference_data",
    }
    assert expected_keys <= RUBRIC_BY_KEY.keys()


def test_official_mts_rules_remain_in_the_knowledge_base():
    corrections = " ".join(
        (KNOWLEDGE / "correction_patterns.md").read_text(encoding="utf-8").lower().split()
    )
    expected_phrases = {
        "сериализации/десериализации",
        "data catalog",
        "not null / nullable",
        "типовые фильтры",
        "не применимо",
        "кластер kafka",
        "полный путь в hdfs",
        "перечень используемых справочников",
    }
    assert all(phrase in corrections for phrase in expected_phrases)


def test_canonical_template_keeps_all_sections_from_official_pdf():
    names = {name for name, _ in TEMPLATE_SECTIONS}
    expected = {
        "Общие сведения",
        "Продуктовые метрики",
        "Заказчики",
        "Data Catalog",
        "Команда",
        "JIRA",
        "Источники обогащения данных",
        "Схема потоков данных",
        "Структура данных",
        "Пример данных",
        "DDL",
        "FAQ",
        "История изменений",
    }
    assert expected <= names


def test_offline_rules_detect_known_kafka_hdfs_and_nullable_gaps():
    geo_categories = {finding.category for finding in _findings("case_1_geo_stream.md")}
    cdr_categories = {finding.category for finding in _findings("case_2_mscp_cdr_flow.md")}
    mart_categories = {finding.category for finding in _findings("case_3_device_agg_vitrina.md")}

    assert {"infra_params", "data_types"} <= geo_categories
    assert {"infra_params", "data_types"} <= cdr_categories
    assert "data_types" in mart_categories


def test_mart_example_still_reports_missing_canonical_sections():
    text = (EXAMPLES / "case_3_device_agg_vitrina.md").read_text(encoding="utf-8")
    coverage = check_template_coverage(split_sections(text), text)
    missing = {item.section for item in coverage if not item.present}
    assert {"Data Catalog", "Приёмники данных", "Пример данных", "DDL"} <= missing
