"""Индекс готовности ТЗ и текстовый вердикт.

Оценка — вспомогательная и полностью объяснимая: 100 минус штрафы за замечания
и за отсутствующие разделы шаблона. Итоговое решение о готовности принимает
аналитик; инструмент лишь подсказывает.
"""

from __future__ import annotations

from .models import Finding, ReviewReport, Severity, TemplateCoverageItem

SEVERITY_WEIGHT = {Severity.blocker: 22, Severity.major: 9, Severity.minor: 3}
MISSING_SECTION_WEIGHT = 8


def score_document(
    findings: list[Finding], coverage: list[TemplateCoverageItem]
) -> tuple[int, str]:
    penalty = sum(SEVERITY_WEIGHT[f.severity] for f in findings)
    missing = [c for c in coverage if not c.present]
    penalty += MISSING_SECTION_WEIGHT * len(missing)
    score = max(0, min(100, 100 - penalty))

    has_blocker = any(f.severity == Severity.blocker for f in findings)
    if score >= 80 and not has_blocker:
        verdict = "Можно передавать в разработку после точечных уточнений"
    elif score >= 55 and not has_blocker:
        verdict = "Требуется доработка перед передачей в разработку"
    elif score >= 40:
        verdict = "Существенная доработка: есть блокирующие вопросы"
    else:
        verdict = "Не готово к передаче в разработку"
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

    lines = [
        f"Предварительная проверка ТЗ «{report_title}»: {verdict.lower()} "
        f"(индекс готовности {score}/100).",
        f"Найдено замечаний: {len(findings)} — из них блокирующих {n_block}, "
        f"существенных {n_major}, незначительных {n_minor}.",
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
