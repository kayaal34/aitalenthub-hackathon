"""Streamlit-демо ТЗ-Ревьюера.

Запуск:  streamlit run app.py
"""

from __future__ import annotations

import tempfile
from pathlib import Path

import streamlit as st

from tz_reviewer.analyzer import review_document
from tz_reviewer.config import EXAMPLES_DIR, Settings
from tz_reviewer.document import load_text
from tz_reviewer.models import Severity
from tz_reviewer.report import to_markdown

st.set_page_config(page_title="ТЗ-Ревьюер", page_icon="🧾", layout="wide")

SEVERITY_COLOR = {
    Severity.blocker: "#e5534b",
    Severity.major: "#d98324",
    Severity.minor: "#8a8f98",
}


def _load_settings() -> Settings:
    s = Settings()
    with st.sidebar:
        st.header("Настройки анализа")
        provider = st.selectbox(
            "Провайдер",
            ["auto", "anthropic", "openai", "offline"],
            index=["auto", "anthropic", "openai", "offline"].index(s.provider if s.provider in {"auto", "anthropic", "openai", "offline"} else "auto"),
            help="auto — выбрать по наличию ключа. offline — только эвристики, без LLM.",
        )
        model = st.text_input("Модель", value=s.model, placeholder="claude-opus-5 / gpt-4o-mini / …")
        api_key = st.text_input("API-ключ", value=s.api_key, type="password",
                                help="Можно не вводить здесь, а задать через .env / переменные окружения.")
        base_url = st.text_input("Base URL (для OpenAI-совместимых)", value=s.base_url,
                                 placeholder="https://openrouter.ai/api/v1 · http://localhost:11434/v1 · …")
        s.provider = provider
        s.model = model.strip()
        s.api_key = api_key.strip()
        s.base_url = base_url.strip()
        st.caption(f"Итоговый режим: **{s.describe()}**")
        st.divider()
        st.caption(
            "Инструмент выполняет дополнительное предварительное ревью ТЗ и не "
            "заменяет аналитика. Решение о готовности документа принимает аналитик."
        )
    return s


def _example_files() -> list[Path]:
    if not EXAMPLES_DIR.exists():
        return []
    return sorted(p for p in EXAMPLES_DIR.iterdir() if p.suffix.lower() in {".md", ".txt", ".docx"})


def _get_input_text() -> tuple[str, str]:
    tab_paste, tab_upload, tab_example = st.tabs(["✍️ Вставить текст", "📎 Загрузить файл", "📁 Пример"])
    text, name = "", "ТЗ"
    with tab_paste:
        pasted = st.text_area("Текст технического задания", height=320,
                              placeholder="Вставьте сюда текст ТЗ…", key="pasted")
        if pasted.strip():
            text, name = pasted, "Вставленный текст"
    with tab_upload:
        up = st.file_uploader("Файл ТЗ", type=["md", "txt", "docx"])
        if up is not None:
            suffix = Path(up.name).suffix.lower()
            if suffix == ".docx":
                with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as fh:
                    fh.write(up.getvalue())
                    tmp = Path(fh.name)
                try:
                    text = load_text(tmp)
                finally:
                    tmp.unlink(missing_ok=True)
            else:
                text = up.getvalue().decode("utf-8", errors="replace")
            name = up.name
    with tab_example:
        files = _example_files()
        if files:
            pick = st.selectbox("Демонстрационное ТЗ", files, format_func=lambda p: p.name)
            if pick:
                preview = load_text(pick)
                st.code(preview[:1500] + ("\n…" if len(preview) > 1500 else ""), language="markdown")
                if st.button("Взять этот пример", key="take_example"):
                    st.session_state["example_text"] = preview
                    st.session_state["example_name"] = pick.name
        if st.session_state.get("example_text"):
            text = st.session_state["example_text"]
            name = st.session_state.get("example_name", "Пример")
    return text, name


def _severity_chip(sev: Severity) -> str:
    return (
        f"<span style='background:{SEVERITY_COLOR[sev]};color:#fff;"
        f"padding:2px 10px;border-radius:999px;font-size:.78rem;font-weight:600'>"
        f"{sev.ru}</span>"
    )


def main() -> None:
    st.title("🧾 ТЗ-Ревьюер")
    st.caption(
        "Предварительное ревью технического задания на новый поток или витрину "
        "данных: где разработчику будет неоднозначно и что стоит уточнить."
    )
    settings = _load_settings()
    text, name = _get_input_text()

    run = st.button("🔍 Проверить ТЗ", type="primary", disabled=not text.strip())
    if not run:
        st.info("Вставьте текст, загрузите файл или выберите пример — затем нажмите «Проверить ТЗ».")
        return

    with st.spinner("Анализируем…"):
        report = review_document(text, settings=settings)

    m = report.meta
    sev = report.stats.get("by_severity", {})
    present = sum(1 for c in report.template_coverage if c.present)
    total_sections = len(report.template_coverage)
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("🔴 Блокеры", sev.get("blocker", 0))
    c2.metric("🟠 Существенные", sev.get("major", 0))
    c3.metric("🟡 Незначительные", sev.get("minor", 0))
    c4.metric(
        "Покрытие шаблона",
        f"{present}/{total_sections}",
        help="Сколько разделов шаблона содержит текст или явную пометку «не применимо». "
        "Наличие текста не гарантирует полноту требований. "
        "Не оценка готовности ТЗ — решение о передаче в разработку принимает аналитик.",
    )

    st.subheader(report.verdict)
    if m.get("llm_error"):
        st.warning(f"LLM-анализ не выполнен: {m['llm_error']}. Показаны эвристики и покрытие шаблона.")
    st.write(report.summary)
    st.caption(
        f"Режим: {m.get('provider_label')} · разделов: {m.get('sections_found')} · "
        f"{m.get('elapsed_sec')} c · инструмент не заменяет аналитика и не выносит "
        f"решение о готовности документа"
    )

    findings_tab, coverage_tab = st.tabs(["Замечания", "Покрытие шаблона"])
    with findings_tab:
        st.subheader(f"Замечания ({len(report.findings)})")
        cats = ["все"] + sorted({f.category_title for f in report.findings})
        pick_cat = st.selectbox("Категория", cats, label_visibility="collapsed")
        for i, f in enumerate(report.findings, 1):
            if pick_cat != "все" and f.category_title != pick_cat:
                continue
            with st.expander(f"{f.severity.icon} {i}. [{f.category_title}] {f.section}", expanded=f.severity == Severity.blocker):
                st.markdown(_severity_chip(f.severity) + f"&nbsp; <code>{f.source}</code>", unsafe_allow_html=True)
                if f.quote:
                    st.markdown(f"> {f.quote}")
                if f.issue:
                    st.markdown(f"**Что неясно:** {f.issue}")
                if f.impact:
                    st.markdown(f"**Почему важно для разработки:** {f.impact}")
                if f.recommendation:
                    st.markdown(f"**Что уточнить или добавить:** {f.recommendation}")
                if f.question_for_analyst:
                    st.markdown(f"**Вопрос аналитику:** {f.question_for_analyst}")
    with coverage_tab:
        st.subheader("Покрытие шаблона")
        st.caption(
            "Заполнен — есть содержимое; не применимо — явное заявление в этом разделе. "
            "Пустой — нет содержимого; упомянут вне раздела — тема найдена без нужного заголовка."
        )
        st.dataframe(
            {
                "Раздел": [c.section for c in report.template_coverage],
                "Статус": [f"{c.status.icon} {c.status.ru}" for c in report.template_coverage],
                "Комментарий": [c.comment for c in report.template_coverage],
            },
            hide_index=True,
            use_container_width=True,
        )

    md = to_markdown(report)
    st.download_button("⬇️ Скачать отчёт (Markdown)", md, file_name=f"review_{Path(name).stem}.md")
    with st.expander("Показать отчёт целиком (Markdown)"):
        st.code(md, language="markdown")


if __name__ == "__main__":
    main()
