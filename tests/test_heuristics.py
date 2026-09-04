"""Тесты офлайн-эвристик и разбора документа."""

from __future__ import annotations

from tz_reviewer.document import split_sections
from tz_reviewer.heuristics import run_heuristics
from tz_reviewer.models import Severity


def _cats(findings):
    return {f.category for f in findings}


def test_placeholder_is_blocker():
    sections = split_sections("## Логика\nПорядок повторов TODO уточнить у архитектора.")
    findings = run_heuristics(sections)
    assert any(f.severity == Severity.blocker and f.category == "consistency" for f in findings)


def test_vague_wording_flagged():
    sections = split_sections("## Расчёт\nОкругляем стандартным образом и грузим по необходимости.")
    findings = run_heuristics(sections)
    assert any(f.category == "consistency" for f in findings)
    assert all(f.quote for f in findings)


def test_calc_without_formula_flagged():
    text = "## Логика трансформации\nПоказатель рассчитывается на основе выручки и числа услуг."
    findings = run_heuristics(split_sections(text))
    assert "transform_logic" in _cats(findings)


def test_calc_with_formula_not_flagged():
    text = "## Логика трансформации\nПоказатель рассчитывается как revenue / services_count."
    findings = run_heuristics(split_sections(text))
    assert "transform_logic" not in _cats(findings)


def test_field_without_type_in_mapping_section():
    text = "## Маппинг полей\n- abonent_id\n- service_name\n- price"
    findings = run_heuristics(split_sections(text))
    assert "data_types" in _cats(findings)


def test_field_with_type_not_flagged():
    text = "## Маппинг полей\n- abonent_id (bigint, обязательное)\n- price (numeric(12,2))"
    findings = run_heuristics(split_sections(text))
    assert "data_types" not in _cats(findings)


def test_undefined_acronyms_reported_once():
    text = "## Раздел\nИспользуем ABC и XYZ, затем QWE и ABC снова, ещё RTY."
    findings = run_heuristics(split_sections(text))
    terminology = [f for f in findings if f.category == "terminology"]
    assert len(terminology) == 1


def test_glossary_suppresses_acronym_finding():
    text = (
        "## Глоссарий\nABC — справочник абонентов. XYZ — система событий. QWE — витрина.\n"
        "## Логика\nСобираем ABC и XYZ в QWE."
    )
    findings = run_heuristics(split_sections(text))
    assert "terminology" not in _cats(findings)


def test_sections_split_on_numbered_headings():
    text = "1. Цель\nТекст цели.\n2. Источник\nТекст источника."
    sections = split_sections(text)
    titles = [s.title for s in sections]
    assert "Цель" in titles and "Источник" in titles
