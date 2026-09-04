"""Офлайн-эвристики: дешёвые правила поверх текста ТЗ.

Работают без LLM. Их две задачи:

* дать осмысленный результат, когда ключа к модели нет вовсе;
* повысить полноту (recall) — подсветить механические вещи (заглушки, «и т.д.»,
  поле без типа), которые LLM иногда пропускает, экономя внимание на крупном.

Каждое правило возвращает Finding с ``source="rule"`` и точной цитатой строки.
"""

from __future__ import annotations

import re

from .models import Finding, Section, Severity
from .rubric import RUBRIC_BY_KEY

_MAX_QUOTE = 240

VAGUE_TERMS = [
    "по необходимости", "при необходимости", "по возможности", "при возможности",
    "и т.д.", "и т. д.", "и т.п.", "и т. п.", "и др.", "и прочее", "прочие случаи",
    "как обычно", "стандартным образом", "стандартно", "обычным способом",
    "по аналогии", "аналогичным образом", "аналогично остальным",
    "оптимальным образом", "разумное значение", "адекватно",
    "корректно обрабатывается", "обрабатывается корректно", "правильно обрабатывается",
    "достаточно быстро", "в приемлемые сроки", "в удобном формате",
    "минимально необходимый", "по усмотрению разработчика", "на усмотрение разработки",
    "очевидным образом", "интуитивно понятно", "не требует пояснений",
]

PLACEHOLDER_TERMS = [
    "todo", "tbd", "т.б.д.", "xxx", "???", "??", "<...>", "<>", "[...]",
    "уточнить", "уточняется", "будет уточнено", "будет позже", "будет добавлено",
    "дополнить позже", "заглушка", "placeholder", "дописать", "нужно описание",
    "здесь будет", "requires clarification",
]

_FIELD_LINE = re.compile(r"^\s*([*\-•]|\|)\s*[A-Za-zА-Яа-яЁё_][\w .\-]{1,60}")
_TYPE_HINT = re.compile(
    r"\b(varchar|char|text|int|integer|bigint|smallint|numeric|decimal|number|float|double|"
    r"real|bool|boolean|date|datetime|timestamp|time|uuid|json|array|"
    r"строк\w*|числ\w*|текст\w*|дат\w*|врем\w*|целое|булев\w*|логическ\w*|флаг)\b",
    re.IGNORECASE,
)
_CALC_TRIGGER = re.compile(
    r"\b(рассчит\w+|расчёт|расчет|вычисл\w+|агрегир\w+|суммир\w+|усредн\w+|"
    r"нормализ\w+|пересчит\w+|формул\w+)\b",
    re.IGNORECASE,
)
_FORMULA_HINT = re.compile(r"[=/*]|\bsum\s*\(|\bcount\s*\(|\bavg\s*\(|\bmax\s*\(|\bmin\s*\(", re.IGNORECASE)
_ACRONYM = re.compile(r"\b[A-ZА-ЯЁ]{2,6}(?:[- ]?\d+)?\b")
_ACRONYM_STOP = {
    "ТЗ", "SCD", "SLA", "ETL", "ELT", "DDL", "DML", "NULL", "JSON", "CSV", "API",
    "UTC", "MSK", "ID", "PK", "FK", "UUID", "МТС", "NET", "ПДн", "БД", "КХД", "DWH",
}


def _quote(line: str) -> str:
    line = " ".join(line.split())
    return line if len(line) <= _MAX_QUOTE else line[:_MAX_QUOTE].rstrip() + "…"


def _mk(category: str, severity: Severity, section: str, quote: str, issue: str,
        impact: str, recommendation: str, question: str) -> Finding:
    item = RUBRIC_BY_KEY.get(category)
    return Finding(
        category=category,
        category_title=item.title if item else category,
        severity=severity,
        section=section or "Документ в целом",
        quote=quote,
        issue=issue,
        impact=impact,
        recommendation=recommendation,
        question_for_analyst=question,
        source="rule",
    )


def _is_glossary(section: Section) -> bool:
    t = section.heading.lower()
    return any(w in t for w in ("глоссар", "термин", "сокращ", "определени", "обознач"))


def _is_mapping_section(section: Section) -> bool:
    t = section.heading.lower()
    return any(w in t for w in ("маппинг", "поля", "атрибут", "структур", "mapping", "состав витрин"))


def _is_logic_section(section: Section) -> bool:
    t = section.heading.lower()
    return any(w in t for w in ("логик", "трансформац", "расч", "преобразован", "витрин", "агрегац"))


def run_heuristics(sections: list[Section]) -> list[Finding]:
    findings: list[Finding] = []
    defined_acronyms: set[str] = set()
    seen_acronyms: set[str] = set()

    for section in sections:
        if _is_glossary(section):
            for ac in _ACRONYM.findall(section.body):
                defined_acronyms.add(ac.upper())

    for section in sections:
        head = section.heading
        for raw in section.body.splitlines():
            line = raw.strip()
            if not line:
                continue
            low = line.lower()

            for term in PLACEHOLDER_TERMS:
                if term in low:
                    findings.append(_mk(
                        "consistency", Severity.blocker, head, _quote(line),
                        f"В тексте осталась незаполненная часть или пометка «{term}».",
                        "Разработчик не сможет реализовать место, которое ещё не описано; "
                        "задача уйдёт в разработку неполной.",
                        "Заполнить фрагмент конкретикой либо явно вынести его в раздел "
                        "«Открытые вопросы» с указанием ответственного и срока.",
                        f"Что должно быть на месте пометки «{term}»?",
                    ))
                    break

            for term in VAGUE_TERMS:
                if term in low:
                    findings.append(_mk(
                        "consistency", Severity.major, head, _quote(line),
                        f"Формулировка «{term}» допускает несколько прочтений.",
                        "Каждый разработчик поймёт такое место по-своему — вероятны "
                        "расхождение с ожиданиями аналитика и переделка.",
                        "Заменить на проверяемое условие: конкретные значения, формулу, "
                        "порог, ссылку на справочник или пример.",
                        f"Что конкретно означает «{term}» в этом месте?",
                    ))
                    break

            if _is_mapping_section(section) and _FIELD_LINE.match(raw) and not _TYPE_HINT.search(line):
                if len(line) > 6 and not low.startswith(("|---", "| ---")):
                    findings.append(_mk(
                        "data_types", Severity.major, head, _quote(line),
                        "У поля не указан тип данных (и, возможно, обязательность/формат).",
                        "Без типа разработчик выберет его сам — риск переполнения, потери "
                        "точности, несовместимости с приёмником.",
                        "Указать тип, длину/точность, обязательность и формат "
                        "(для дат — маску и часовой пояс).",
                        "Какой тип, размерность и обязательность у этого поля?",
                    ))

            if _is_logic_section(section) and _CALC_TRIGGER.search(low) and not _FORMULA_HINT.search(line):
                findings.append(_mk(
                    "transform_logic", Severity.major, head, _quote(line),
                    "Расчёт описан словами, без явной формулы.",
                    "Словесное описание расчёта почти всегда допускает разные реализации "
                    "(округление, порядок операций, обработка пустых слагаемых).",
                    "Привести формулу через имена полей, правило округления и поведение "
                    "при делении на ноль / отсутствии данных.",
                    "Как выглядит точная формула этого показателя?",
                ))

            for ac in _ACRONYM.findall(line):
                up = ac.upper()
                if up in _ACRONYM_STOP or up in defined_acronyms or up in seen_acronyms:
                    continue
                seen_acronyms.add(up)

    undefined = sorted(seen_acronyms - defined_acronyms - _ACRONYM_STOP)
    if len(undefined) >= 3:
        findings.append(_mk(
            "terminology", Severity.minor, "Документ в целом",
            ", ".join(undefined[:15]) + ("…" if len(undefined) > 15 else ""),
            "В тексте есть аббревиатуры без расшифровки и без глоссария.",
            "Разработчик может понять сокращение неверно или потратит время на выяснение.",
            "Добавить раздел «Глоссарий» или расшифровывать сокращения при первом "
            "упоминании.",
            "Что означают перечисленные сокращения?",
        ))

    return findings
