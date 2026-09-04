"""Загрузка базы знаний: шаблон ТЗ, чек-лист, паттерны корректировок, few-shot.

Файлы лежат в каталоге ``knowledge/``. Все они опциональны: если файла нет,
подставляется пустая строка, а анализ опирается на встроенную рубрику.
Именно эти материалы отвечают за то, что замечания получаются предметными,
а не «общими советами».
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from .config import KNOWLEDGE_DIR

# Канонический перечень разделов шаблона ТЗ (для проверки покрытия).
# ключ раздела -> (человекочитаемое имя, ключевые слова для поиска в документе)
TEMPLATE_SECTIONS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Общая информация и статус", ("общая информация", "паспорт", "версия", "статус", "автор")),
    ("Бизнес-контекст и цель", ("бизнес-контекст", "цель", "назначение", "постановка", "зачем")),
    ("Глоссарий терминов и сокращений", ("глоссарий", "термины", "сокращения", "определения")),
    ("Источники данных", ("источник", "система-источник", "источники данных")),
    ("Целевой объект (структура, гранулярность)", ("целевой объект", "целевая таблица", "витрина", "структура витрины", "ddl", "гранулярность")),
    ("Маппинг полей", ("маппинг", "соответствие полей", "mapping", "поле-источник")),
    ("Логика трансформации и расчётов", ("логика", "трансформац", "расчёт", "расчет", "преобразовани", "агрегаци")),
    ("Историчность (SCD), обновления и удаления", ("историчность", "scd", "история изменений", "удалени", "обновлени задним")),
    ("Стратегия загрузки и инкремент", ("стратегия загрузки", "инкремент", "watermark", "водяной знак", "перезаливка", "reload")),
    ("Дедупликация", ("дедупликац", "дубли", "дубликат")),
    ("Обработка NULL и некорректных значений", ("null", "значения по умолчанию", "пустые значения", "некорректны")),
    ("Контроли качества данных", ("контроль качества", "качество данных", "data quality", "проверки", "dq")),
    ("Расписание, SLA и зависимости", ("расписание", "sla", "периодичность", "зависимости", "запуск по")),
    ("Объёмы и нагрузка", ("объём", "объем данных", "прирост", "нагрузка", "количество строк")),
    ("Доступы, ПДн и безопасность", ("доступ", "пдн", "персональн", "безопасн", "маскирован")),
    ("Примеры данных", ("пример данных", "пример входных", "пример выходных", "sample", "пример строки")),
    ("Открытые вопросы", ("открытые вопросы", "вопросы к", "требует уточнения", "todo")),
)


@dataclass
class Knowledge:
    template: str = ""
    checklist: str = ""
    corrections: str = ""
    few_shot: list[dict] = field(default_factory=list)

    def few_shot_prompt_block(self, limit: int = 6) -> str:
        if not self.few_shot:
            return ""
        rows: list[str] = []
        for ex in self.few_shot[:limit]:
            fragment = str(ex.get("fragment", "")).strip()
            finding = ex.get("finding", {})
            rows.append(
                "Фрагмент ТЗ:\n"
                f"  «{fragment}»\n"
                "Ожидаемое замечание:\n"
                f"  категория: {finding.get('category', '')}\n"
                f"  критичность: {finding.get('severity', '')}\n"
                f"  что неясно: {finding.get('issue', '')}\n"
                f"  почему важно: {finding.get('impact', '')}\n"
                f"  что уточнить: {finding.get('recommendation', '')}\n"
                f"  вопрос аналитику: {finding.get('question_for_analyst', '')}"
            )
        return "\n\n".join(rows)


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def load_knowledge(knowledge_dir: str | Path | None = None) -> Knowledge:
    base = Path(knowledge_dir) if knowledge_dir else KNOWLEDGE_DIR
    few_shot: list[dict] = []
    fs_path = base / "few_shot_examples.json"
    if fs_path.exists():
        try:
            payload = json.loads(fs_path.read_text(encoding="utf-8"))
            if isinstance(payload, list):
                few_shot = [x for x in payload if isinstance(x, dict)]
        except (json.JSONDecodeError, OSError):
            few_shot = []
    return Knowledge(
        template=_read(base / "template.md"),
        checklist=_read(base / "checklist.md"),
        corrections=_read(base / "correction_patterns.md"),
        few_shot=few_shot,
    )
