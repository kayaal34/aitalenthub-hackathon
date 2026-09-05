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
import re

from .config import Settings
from .document import guess_title, numbered_document, split_sections
from .heuristics import run_heuristics
from .knowledge import TEMPLATE_SECTIONS, load_knowledge
from .llm import LLMClient, LLMError
from .models import (
    Finding,
    ReviewReport,
    Section,
    Severity,
    TemplateCoverageItem,
    TemplateCoverageStatus,
)
from .prompts import REPAIR_HINT, SYSTEM_PROMPT, build_user_prompt
from .rubric import RUBRIC_BY_KEY, RUBRIC_KEYS
from .scoring import apply_scoring, compose_fallback_summary


_NOT_APPLICABLE = re.compile(r"\bне\s+применим[оаы]\b", re.IGNORECASE)


def _section_scope(section: Section, all_sections: list[Section]) -> list[Section]:
    """Возвращает раздел и его потомков, не смешивая соседние ветви."""

    descendants: list[Section] = []
    pending = [section.start_line]
    while pending:
        parent_line = pending.pop()
        children = [s for s in all_sections if s.parent_start_line == parent_line]
        descendants.extend(children)
        pending.extend(s.start_line for s in children)
    return [section, *descendants]


def _coverage_item(
    name: str, keywords: tuple[str, ...], sections: list[Section], body_text: str
) -> TemplateCoverageItem:
    matched_headings = [
        section for section in sections
        if any(keyword in section.heading.lower() for keyword in keywords)
    ]
    if not matched_headings:
        if any(keyword in body_text for keyword in keywords):
            return TemplateCoverageItem(
                section=name,
                status=TemplateCoverageStatus.mentioned,
                comment="тема упомянута в тексте, но обязательный отдельный раздел не найден",
            )
        return TemplateCoverageItem(
            section=name,
            status=TemplateCoverageStatus.missing,
            comment="обязательный раздел не найден",
        )

    scoped_text = "\n".join(
        child.body for heading in matched_headings for child in _section_scope(heading, sections)
    ).strip()
    if _NOT_APPLICABLE.search(scoped_text):
        return TemplateCoverageItem(
            section=name,
            present=True,
            status=TemplateCoverageStatus.not_applicable,
            comment="раздел сохранён и явно помечен «не применимо»",
        )
    if scoped_text:
        return TemplateCoverageItem(
            section=name,
            present=True,
            status=TemplateCoverageStatus.complete,
            comment="раздел присутствует и заполнен",
        )
    return TemplateCoverageItem(
        section=name,
        status=TemplateCoverageStatus.empty,
        comment="раздел присутствует, но не содержит описания или «не применимо»",
    )


def check_template_coverage(sections: list[Section], full_text: str) -> list[TemplateCoverageItem]:
    """Проверяет структуру, а не только факт упоминания слов из шаблона.

    Упоминание темы в другом разделе полезно для аналитика, но не заменяет
    обязательный раздел: оно получает отдельный статус ``mentioned``.
    """

    del full_text  # API сохранён для обратной совместимости с внешними вызовами.
    body_text = "\n".join(section.body for section in sections).lower()
    items: list[TemplateCoverageItem] = []
    for name, keywords in TEMPLATE_SECTIONS:
        items.append(_coverage_item(name, keywords, sections, body_text))
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


# Категории, которые LLM и офлайн-эвристики проверяют по одному и тому же
# официальному критерию (Kafka-кластер, HDFS-путь, Data Catalog) — здесь LLM и
# правило нередко указывают один и тот же пробел, но цитируют разные строки и
# разные разделы документа. Дедуплицируем такие находки по теме, а не по
# точной цитате/разделу, иначе одна и та же проблема попадает в отчёт дважды.
_TOPIC_DEDUPE_CATEGORIES = {"infra_params", "data_catalog"}


def _topic_tag(f: Finding) -> str:
    # Намеренно берём только issue/recommendation (не quote): цитата — сырой
    # фрагмент документа и может упоминать и Kafka, и HDFS в одной строке
    # (например, в шапке таблицы), а issue — это уже собственная формулировка
    # находки, которая называет ровно ту проблему, которую она описывает.
    blob = f"{f.issue} {f.recommendation}".lower()
    has_kafka = "kafka" in blob or "кафка" in blob or "кластер" in blob
    has_hdfs = "hdfs" in blob or ("путь" in blob and "формат хранения" in blob)
    if has_kafka and not has_hdfs:
        return "kafka"
    if has_hdfs and not has_kafka:
        return "hdfs"
    if "data catalog" in blob or "датакаталог" in blob or "дата-каталог" in blob:
        return "data_catalog"
    return ""


def _dedupe_key(f: Finding) -> tuple[str, str]:
    if f.category in _TOPIC_DEDUPE_CATEGORIES:
        tag = _topic_tag(f)
        if tag:
            return (f.category, tag)
    return f.key()


def _dedupe(findings: list[Finding]) -> list[Finding]:
    seen: dict[tuple[str, str], Finding] = {}
    for f in findings:
        key = _dedupe_key(f)
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
