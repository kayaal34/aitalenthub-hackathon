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
    r"\b(varchar|char|text|string|int|integer|bigint|smallint|tinyint|long|short|byte|"
    r"numeric|decimal|number|float|double|"
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
_HDFS_PATH_HINT = re.compile(r"/[\w\-.]+(?:/[\w\-.]+)+")
_KAFKA_CLUSTER_HINT = re.compile(r"\bкластер\w*\b", re.IGNORECASE)
_NULLABLE_HINT = re.compile(
    r"\b(not\s*null|nullable|обязательн\w*|необязательн\w*|null\s*able)\b", re.IGNORECASE
)
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


_TABLE_HEADER_CELLS = (
    "поле", "атрибут", "параметр", "field", "attribute", "название", "наименование",
    "описание", "тип данных", "тип", "комментарий", "номер", "требование", "значение",
)


def _is_table_header_row(low_line: str) -> bool:
    if low_line.startswith(("|---", "| ---", "|--", "|===")):
        return True
    first_cell = low_line.strip("| ").split("|", 1)[0].strip()
    return first_cell in _TABLE_HEADER_CELLS


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
    acronym_counts: dict[str, int] = {}

    for section in sections:
        if _is_glossary(section):
            for ac in _ACRONYM.findall(section.body):
                defined_acronyms.add(ac.upper())

    for section in sections:
        head = section.heading
        missing_nullable_rows: list[str] = []
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
                if len(line) > 6 and not _is_table_header_row(low):
                    findings.append(_mk(
                        "data_types", Severity.major, head, _quote(line),
                        "У поля не указан тип данных (и, возможно, обязательность/формат).",
                        "Без типа разработчик выберет его сам — риск переполнения, потери "
                        "точности, несовместимости с приёмником.",
                        "Указать тип, длину/точность, обязательность и формат "
                        "(для дат — маску и часовой пояс).",
                        "Какой тип, размерность и обязательность у этого поля?",
                    ))

            if (
                _is_mapping_section(section)
                and low.startswith("|")
                and _TYPE_HINT.search(line)
                and not _NULLABLE_HINT.search(line)
                and not _is_table_header_row(low)
            ):
                missing_nullable_rows.append(_quote(line))

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
                if up in _ACRONYM_STOP or up in defined_acronyms:
                    continue
                acronym_counts[up] = acronym_counts.get(up, 0) + 1

        if missing_nullable_rows:
            n = len(missing_nullable_rows)
            findings.append(_mk(
                "data_types", Severity.major, head, missing_nullable_rows[0],
                f"В таблице {n} пол(е/я/ей) без признака обязательности "
                f"(NOT NULL / NULLABLE) — официальное требование кейсодателя к "
                f"описанию витрин. Пример: «{missing_nullable_rows[0]}»"
                + (f"; ещё {n - 1} строк(а/и) с той же проблемой." if n > 1 else "."),
                "Без явного NOT NULL/NULLABLE разработчик не знает, для каких полей "
                "нужно обрабатывать пустое значение, и это придётся выяснять по "
                "каждому полю отдельно.",
                "Проставить NOT NULL или NULLABLE у каждого поля таблицы (не только "
                "у одного примера).",
                "Для каких из перечисленных полей допустим NULL, а для каких — нет?",
            ))

    # Kafka/HDFS без конкретики — реальная проблема почти всегда одна на весь
    # документ (аналитик забыл указать кластер/путь везде одинаково), поэтому
    # фиксируем не более одного замечания на документ по каждому пункту, а не
    # по одному на каждый раздел, где мелькнуло слово «Kafka»/«HDFS».
    kafka_flagged = False
    hdfs_flagged = False

    for section in sections:
        head = section.heading
        low_head = head.lower()
        low_body = section.body.lower()

        if "data catalog" in low_head or "датакаталог" in low_head or "дата-каталог" in low_head:
            stripped = " ".join(section.body.split())
            if len(stripped) < 8 or stripped.lower() in {"ссылка", "-", "—", "тбд", "tbd"}:
                findings.append(_mk(
                    "data_catalog", Severity.major, head, _quote(section.body[:120] or head),
                    "Раздел Data Catalog присутствует, но реальная ссылка не указана "
                    "(пусто или плейсхолдер).",
                    "Разработчик и тестировщик не смогут свериться со схемой источника "
                    "через каталог — придётся спрашивать аналитика напрямую.",
                    "Вставить рабочую ссылку на карточку объекта в Data Catalog.",
                    "Какая ссылка на Data Catalog для этого источника/приёмника?",
                ))

        if not kafka_flagged and "kafka" in low_body and not _KAFKA_CLUSTER_HINT.search(section.body):
            kafka_flagged = True
            findings.append(_mk(
                "infra_params", Severity.major, head, _quote(next(
                    (ln for ln in section.body.splitlines() if "kafka" in ln.lower()), head
                )),
                "Kafka упоминается (возможно, в нескольких местах документа), но "
                "конкретный кластер не указан ни разу.",
                "Для потоковых источников/приёмников кластер Kafka — обязательный "
                "инфраструктурный параметр по требованиям кейсодателя; без него "
                "разработчик не знает, куда подключаться.",
                "Указать имя/адрес конкретного Kafka-кластера для каждого топика.",
                "На каком именно кластере Kafka находятся эти топики?",
            ))

        if not hdfs_flagged and "hdfs" in low_body and not _HDFS_PATH_HINT.search(section.body):
            hdfs_flagged = True
            findings.append(_mk(
                "infra_params", Severity.major, head, _quote(next(
                    (ln for ln in section.body.splitlines() if "hdfs" in ln.lower()), head
                )),
                "HDFS упоминается (возможно, в нескольких местах документа), но "
                "полный путь и формат хранения не приведены.",
                "Без полного пути и формата разработчик не может однозначно "
                "реализовать чтение/запись файлового хранилища.",
                "Указать полный путь в HDFS и формат хранения (ORC/Parquet/CSV/…).",
                "Какой полный путь в HDFS и в каком формате хранятся эти данные?",
            ))

    # Кириллическое слово в КАПС встречается в тексте всего один раз чаще всего
    # из-за акцента/эмфазы, а не потому что это реальная аббревиатура — считаем
    # его аббревиатурой только если оно повторяется. Латинские аббревиатуры
    # (ETL, SLA, IMSI...) доверяем и при одном упоминании.
    undefined = sorted(
        t for t, cnt in acronym_counts.items()
        if t not in defined_acronyms and t not in _ACRONYM_STOP and (cnt >= 2 or t.isascii())
    )
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
