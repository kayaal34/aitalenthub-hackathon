"""Индекс проработанности ТЗ и текстовый итог проверки.

Индекс — вспомогательный и полностью объяснимый: 100 минус штрафы за замечания
и за отсутствующие разделы шаблона. Это НЕ оценка готовности документа к
разработке: инструмент не выносит вердикт «готово / не готово», такое решение
принимает аналитик. Итоговая строка описывает объём найденных замечаний, а не
пригодность ТЗ.
"""

from __future__ import annotations

from .models import Finding, ReviewReport, Severity, TemplateCoverageItem

SEVERITY_WEIGHT = {Severity.blocker: 22, Severity.major: 9, Severity.minor: 3}
# Официальный шаблон МТС длиннее нашего первого приближения (21 раздел), и не
# каждый документ обязан заполнять каждый раздел содержательно (некоторые
# закрываются пометкой «не применимо») — вес снижен, чтобы не «обнулять»
# индекс только за длину шаблона.
MISSING_SECTION_WEIGHT = 5


def score_document(
    findings: list[Finding], coverage: list[TemplateCoverageItem]
) -> tuple[int, str]:
    penalty = sum(SEVERITY_WEIGHT[f.severity] for f in findings)
    missing = [c for c in coverage if not c.present]
    penalty += MISSING_SECTION_WEIGHT * len(missing)
    score = max(0, min(100, 100 - penalty))

    has_blocker = any(f.severity == Severity.blocker for f in findings)
    n_block = sum(1 for f in findings if f.severity == Severity.blocker)
    if not findings:
        verdict = "Замечаний не найдено — просмотрите покрытие шаблона"
    elif score >= 80 and not has_blocker:
        verdict = "Замечаний немного, в основном точечные уточнения"
    elif not has_blocker:
        verdict = "Есть замечания — стоит просмотреть до передачи в разработку"
    elif n_block <= 2:
        verdict = f"Есть блокирующие вопросы ({n_block}) — рекомендуется уточнение"
    else:
        verdict = f"Много замечаний, включая блокирующие вопросы ({n_block})"
    return score, verdict


def build_stats(
    findings: list[Finding], coverage: list[TemplateCoverageItem]
) -> dict:
    by_severity = {s.value: 0 for s in Severity}
    by_category: dict[str, int] = {}
    by_source = {"llm": 0, "rule": 0}
    for f in findings:
        by_severity[f.severity.value] += 1
        by_category[f.category_title or f.category] = by_category.get(f.category_title or f.category, 0) + 1
        by_source[f.source] = by_source.get(f.source, 0) + 1
    return {
        "total": len(findings),
        "by_severity": by_severity,
        "by_category": dict(sorted(by_category.items(), key=lambda kv: -kv[1])),
        "by_source": by_source,
        "sections_expected": len(coverage),
        "sections_missing": [c.section for c in coverage if not c.present],
    }


def compose_fallback_summary(
    report_title: str,
    verdict: str,
    score: int,
    findings: list[Finding],
    coverage: list[TemplateCoverageItem],
    llm_error: str | None,
) -> str:
    n_block = sum(1 for f in findings if f.severity == Severity.blocker)
    n_major = sum(1 for f in findings if f.severity == Severity.major)
    n_minor = sum(1 for f in findings if f.severity == Severity.minor)
    missing = [c.section for c in coverage if not c.present]
    present_count = len(coverage) - len(missing)

    lines = [
        f"Предварительная проверка ТЗ «{report_title}». Найдено замечаний: "
        f"{len(findings)} — из них блокирующих {n_block}, существенных {n_major}, "
        f"незначительных {n_minor}. Покрытие шаблона: {present_count} из "
        f"{len(coverage)} разделов.",
    ]
    if missing:
        lines.append(
            "Разделы шаблона, которые не удалось найти в документе: "
            + ", ".join(missing[:6])
            + ("…" if len(missing) > 6 else "")
            + "."
        )
    top = [f for f in findings if f.severity == Severity.blocker][:3]
    if top:
        lines.append("В первую очередь стоит закрыть: " + "; ".join(f.issue.rstrip(".") for f in top) + ".")
    if llm_error:
        lines.append(
            "LLM-анализ не выполнен (" + llm_error + "), показан результат эвристик и "
            "проверки покрытия шаблона."
        )
    lines.append(
        "Итоговое решение о готовности документа принимает аналитик; ниже — места, "
        "на которые стоит обратить внимание."
    )
    return " ".join(lines)


def apply_scoring(report: ReviewReport) -> ReviewReport:
    score, verdict = score_document(report.findings, report.template_coverage)
    report.readiness_score = score
    report.verdict = verdict
    report.stats = build_stats(report.findings, report.template_coverage)
    return report
