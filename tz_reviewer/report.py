"""Рендер отчёта предварительного ревью в Markdown / HTML / JSON."""

from __future__ import annotations

import html
import json

from .models import ReviewReport, Severity

_SEVERITY_ORDER = (Severity.blocker, Severity.major, Severity.minor)


def to_json(report: ReviewReport, *, indent: int = 2) -> str:
    return json.dumps(report.to_dict(), ensure_ascii=False, indent=indent)


def to_markdown(report: ReviewReport) -> str:
    m = report.meta
    stats = report.stats.get("by_severity", {})
    lines: list[str] = []
    lines.append(f"# Предварительное ревью ТЗ: {report.document_title}")
    lines.append("")
    lines.append(
        f"- **Замечаний:** {report.stats.get('total', len(report.findings))} — "
        f"🔴 блокеры: {stats.get('blocker', 0)}, "
        f"🟠 существенные: {stats.get('major', 0)}, "
        f"🟡 незначительные: {stats.get('minor', 0)}"
    )
    lines.append(f"- **Итог:** {report.verdict}")
    present = sum(1 for c in report.template_coverage if c.present)
    total_sections = len(report.template_coverage)
    lines.append(
        f"- **Покрытие шаблона:** {present} из {total_sections} разделов "
        f"(решение о готовности документа принимает аналитик)"
    )
    lines.append(f"- **Режим анализа:** {m.get('provider_label', m.get('provider', '—'))}")
    lines.append(f"- **Сформировано:** {m.get('generated_at', '')} · за {m.get('elapsed_sec', '—')} c")
    if m.get("llm_error"):
        lines.append(f"- ⚠️ **LLM-анализ не выполнен:** {m['llm_error']} (показаны эвристики)")
    lines.append("")
    lines.append("## Итог проверки")
    lines.append("")
    lines.append(report.summary)
    lines.append("")

    lines.append("## Замечания")
    lines.append("")
    if not report.findings:
        lines.append("_Замечаний не сформировано._")
        lines.append("")
    n = 0
    for severity in _SEVERITY_ORDER:
        bucket = report.by_severity(severity)
        if not bucket:
            continue
        lines.append(f"### {severity.icon} {severity.ru} ({len(bucket)})")
        lines.append("")
        for f in bucket:
            n += 1
            tag = "LLM" if f.source == "llm" else "правило"
            lines.append(f"#### {n}. [{f.category_title}] {f.section}  ·  _{tag}_")
            lines.append("")
            if f.quote:
                quoted = f.quote.replace("\n", " ")
                lines.append(f"> {quoted}")
                lines.append("")
            if f.issue:
                lines.append(f"- **Что неясно:** {f.issue}")
            if f.impact:
                lines.append(f"- **Почему важно для разработки:** {f.impact}")
            if f.recommendation:
                lines.append(f"- **Что уточнить или добавить:** {f.recommendation}")
            if f.question_for_analyst:
                lines.append(f"- **Вопрос аналитику:** {f.question_for_analyst}")
            lines.append("")

    lines.append("## Покрытие шаблона ТЗ")
    lines.append("")
    lines.append("| Раздел шаблона | Статус | Комментарий |")
    lines.append("| --- | :---: | --- |")
    for c in report.template_coverage:
        lines.append(f"| {c.section} | {c.status.icon} {c.status.ru} | {c.comment} |")
    lines.append("")

    lines.append("## Как читать отчёт")
    lines.append("")
    lines.append(
        "Инструмент выполняет **дополнительное** предварительное ревью и не заменяет "
        "аналитика. Он подсвечивает места, которые с высокой вероятностью вызовут "
        "вопросы у разработчика. Решение, что из этого действительно требует правки "
        "до передачи в разработку, принимает аналитик."
    )
    lines.append("")
    return "\n".join(lines)


_HTML_STYLE = """
:root { color-scheme: light dark; }
body { font: 15px/1.55 -apple-system, Segoe UI, Roboto, sans-serif; max-width: 900px;
       margin: 0 auto; padding: 32px 20px; }
h1 { font-size: 1.6rem; } h2 { margin-top: 2rem; border-bottom: 1px solid #8884; padding-bottom: .2rem; }
.meta { color: #7a7a7a; }
.badge { display:inline-block; padding:2px 8px; border-radius: 999px; font-size:.8rem; font-weight:600; }
.blocker { background:#f8d7da; color:#842029; } .major { background:#fff3cd; color:#664d03; }
.minor  { background:#e2e3e5; color:#41464b; }
.finding { border:1px solid #8883; border-radius:10px; padding:12px 16px; margin:12px 0; }
.finding blockquote { margin:.5rem 0; padding:.4rem .8rem; border-left:3px solid #8886; color:#555; background:#8881; }
table { border-collapse: collapse; width:100%; } td, th { border:1px solid #8883; padding:6px 10px; text-align:left; }
.score { font-size:2rem; font-weight:700; }
"""


def to_html(report: ReviewReport) -> str:
    def esc(x: str) -> str:
        return html.escape(x or "")

    m = report.meta
    stats = report.stats.get("by_severity", {})
    out: list[str] = []
    out.append("<!doctype html><meta charset='utf-8'>")
    out.append(f"<title>Ревью ТЗ — {esc(report.document_title)}</title>")
    out.append(f"<style>{_HTML_STYLE}</style>")
    out.append(f"<h1>Предварительное ревью ТЗ: {esc(report.document_title)}</h1>")
    out.append(
        f"<p class='meta'>Режим: {esc(m.get('provider_label', ''))} · "
        f"{esc(m.get('generated_at', ''))} · разделов: {m.get('sections_found', '—')}</p>"
    )
    out.append(
        f"<p>Замечаний: <b>{report.stats.get('total', 0)}</b> — "
        f"<span class='badge blocker'>блокеры {stats.get('blocker', 0)}</span> "
        f"<span class='badge major'>существенные {stats.get('major', 0)}</span> "
        f"<span class='badge minor'>незначительные {stats.get('minor', 0)}</span></p>"
    )
    out.append(f"<p><b>Итог:</b> {esc(report.verdict)}</p>")
    present = sum(1 for c in report.template_coverage if c.present)
    total_sections = len(report.template_coverage)
    out.append(
        f"<p class='meta'>Покрытие шаблона: <b>{present} из {total_sections}</b> разделов "
        f"— решение о готовности документа принимает аналитик.</p>"
    )
    if m.get("llm_error"):
        out.append(f"<p class='meta'>⚠️ LLM-анализ не выполнен: {esc(m['llm_error'])}</p>")
    out.append("<h2>Итог проверки</h2>")
    out.append(f"<p>{esc(report.summary)}</p>")

    out.append("<h2>Замечания</h2>")
    n = 0
    for severity in _SEVERITY_ORDER:
        bucket = report.by_severity(severity)
        if not bucket:
            continue
        out.append(f"<h3>{severity.ru} ({len(bucket)})</h3>")
        for f in bucket:
            n += 1
            out.append("<div class='finding'>")
            out.append(
                f"<div><span class='badge {f.severity.value}'>{f.severity.ru}</span> "
                f"<b>{n}. [{esc(f.category_title)}]</b> {esc(f.section)} "
                f"<span class='meta'>· {'LLM' if f.source == 'llm' else 'правило'}</span></div>"
            )
            if f.quote:
                out.append(f"<blockquote>{esc(f.quote)}</blockquote>")
            if f.issue:
                out.append(f"<p><b>Что неясно:</b> {esc(f.issue)}</p>")
            if f.impact:
                out.append(f"<p><b>Почему важно:</b> {esc(f.impact)}</p>")
            if f.recommendation:
                out.append(f"<p><b>Что уточнить:</b> {esc(f.recommendation)}</p>")
            if f.question_for_analyst:
                out.append(f"<p><b>Вопрос аналитику:</b> {esc(f.question_for_analyst)}</p>")
            out.append("</div>")

    out.append("<h2>Покрытие шаблона ТЗ</h2>")
    out.append("<table><tr><th>Раздел</th><th>Статус</th><th>Комментарий</th></tr>")
    for c in report.template_coverage:
        out.append(
            f"<tr><td>{esc(c.section)}</td><td>{c.status.icon} {esc(c.status.ru)}</td>"
            f"<td>{esc(c.comment)}</td></tr>"
        )
    out.append("</table>")
    out.append(
        "<h2>Как читать отчёт</h2><p>Инструмент выполняет дополнительное "
        "предварительное ревью и не заменяет аналитика. Решение о готовности "
        "документа принимает аналитик.</p>"
    )
    return "\n".join(out)


RENDERERS = {"md": to_markdown, "markdown": to_markdown, "html": to_html, "json": to_json}


def render(report: ReviewReport, fmt: str = "md") -> str:
    return RENDERERS.get(fmt.lower(), to_markdown)(report)
