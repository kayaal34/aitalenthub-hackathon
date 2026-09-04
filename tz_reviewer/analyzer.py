"""Оркестрация предварительного ревью ТЗ.

Пайплайн:
1. загрузка текста и разбиение на разделы;
2. проверка покрытия шаблона (детерминированно);
3. LLM-ревью по рубрике (если доступен провайдер);
4. офлайн-эвристики (всегда);
5. дедупликация и сортировка замечаний;
6. индекс проработанности и текстовый итог (не вердикт о готовности);
7. сборка ReviewReport.
"""

from __future__ import annotations

import time
import uuid

from .config import Settings
from .document import guess_title, numbered_document, split_sections
from .heuristics import run_heuristics
from .knowledge import TEMPLATE_SECTIONS, load_knowledge
from .llm import LLMClient, LLMError
from .models import Finding, ReviewReport, Section, Severity, TemplateCoverageItem
from .prompts import REPAIR_HINT, SYSTEM_PROMPT, build_user_prompt
from .rubric import RUBRIC_BY_KEY, RUBRIC_KEYS
from .scoring import apply_scoring, compose_fallback_summary


def check_template_coverage(sections: list[Section], full_text: str) -> list[TemplateCoverageItem]:
    haystack = " \n ".join(s.heading + " " + s.body for s in sections).lower()
    headings = " \n ".join(s.heading for s in sections).lower()
    items: list[TemplateCoverageItem] = []
    for name, keywords in TEMPLATE_SECTIONS:
        in_heading = any(k in headings for k in keywords)
        in_body = any(k in haystack for k in keywords)
        if in_heading:
            comment = "раздел присутствует"
        elif in_body:
            comment = "тема упомянута в тексте, но нет отдельного раздела"
        else:
            comment = "не найдено — проверьте, нужен ли раздел для этого ТЗ"
        items.append(TemplateCoverageItem(section=name, present=in_heading or in_body, comment=comment))
    return items


def _coerce_findings(payload: dict) -> list[Finding]:
    raw = payload.get("findings")
    if not isinstance(raw, list):
        return []
    out: list[Finding] = []
    for entry in raw:
        if not isinstance(entry, dict):
            continue
        category = str(entry.get("category", "") or "").strip().lower()
        if category not in RUBRIC_KEYS:
            category = _guess_category(entry) or "consistency"
        item = RUBRIC_BY_KEY.get(category)
        try:
            finding = Finding(
                category=category,
                category_title=item.title if item else category,
                severity=Severity.coerce(entry.get("severity")),
                section=str(entry.get("section") or "Документ в целом").strip()[:200],
                quote=str(entry.get("quote") or "").strip()[:600],
                issue=str(entry.get("issue") or "").strip(),
                impact=str(entry.get("impact") or "").strip(),
                recommendation=str(entry.get("recommendation") or "").strip(),
                question_for_analyst=str(entry.get("question_for_analyst") or "").strip(),
                source="llm",
            )
        except Exception:  # noqa: BLE001 - не роняем весь анализ из-за одной строки
            continue
        if finding.issue or finding.quote:
            out.append(finding)
    return out


def _guess_category(entry: dict) -> str | None:
    blob = " ".join(str(entry.get(k, "")) for k in ("category", "issue", "recommendation")).lower()
    for key, item in RUBRIC_BY_KEY.items():
        if item.title.lower() in blob:
            return key
    return None


def _dedupe(findings: list[Finding]) -> list[Finding]:
    seen: dict[tuple[str, str], Finding] = {}
    for f in findings:
        key = f.key()
        if key not in seen:
            seen[key] = f
            continue
        # приоритет LLM-замечанию (в нём есть impact/вопрос); критичность — максимум
        kept = seen[key]
        if kept.source == "rule" and f.source == "llm":
            if f.severity.rank > kept.severity.rank:
                f.severity = kept.severity
            seen[key] = f
        elif f.severity.rank < kept.severity.rank:
            kept.severity = f.severity
    return list(seen.values())


def _sort(findings: list[Finding]) -> list[Finding]:
    order = {k: i for i, k in enumerate(RUBRIC_KEYS)}
    return sorted(
        findings,
        key=lambda f: (f.severity.rank, order.get(f.category, 99), f.section.lower()),
    )


def review_document(
    text: str,
    *,
    settings: Settings | None = None,
    sources_note: str = "",
) -> ReviewReport:
    settings = settings or Settings()
    started = time.time()

    sections = split_sections(text)
    title = guess_title(text)
    knowledge = load_knowledge(settings.knowledge_dir)
    coverage = check_template_coverage(sections, text)

    findings: list[Finding] = []
    summary = ""
    llm_error: str | None = None
    provider = settings.resolve_provider()
    llm_meta: dict = {}

    if provider != "offline":
        client = LLMClient(settings)
        user_prompt = build_user_prompt(
            numbered_document(sections), sections, knowledge, sources_note=sources_note
        )
        try:
            payload = client.generate_json(SYSTEM_PROMPT, user_prompt, repair_hint=REPAIR_HINT)
            findings.extend(_coerce_findings(payload))
            summary = str(payload.get("summary") or "").strip()
            llm_meta = payload.get("_meta", {})
        except LLMError as exc:
            llm_error = str(exc)
        except Exception as exc:  # noqa: BLE001
            llm_error = f"неожиданная ошибка LLM-анализа: {exc}"

    findings.extend(run_heuristics(sections))
    findings = _sort(_dedupe(findings))
    for f in findings:
        f.id = f.id or uuid.uuid4().hex[:8]

    report = ReviewReport(
        document_title=title,
        summary=summary,
        findings=findings,
        template_coverage=coverage,
    )
    apply_scoring(report)

    if not report.summary:
        report.summary = compose_fallback_summary(
            title, report.verdict, report.readiness_score, findings, coverage, llm_error
        )

    report.meta = {
        "provider": provider,
        "provider_label": settings.describe(),
        "model": llm_meta.get("model") or settings.resolve_model(),
        "llm_used": provider != "offline" and llm_error is None,
        "llm_error": llm_error,
        "usage": llm_meta.get("usage", {}),
        "elapsed_sec": round(time.time() - started, 1),
        "sections_found": len(sections),
        "chars": len(text),
        "generated_at": time.strftime("%Y-%m-%d %H:%M"),
    }
    return report
