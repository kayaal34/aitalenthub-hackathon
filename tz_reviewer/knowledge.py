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
#
# Синхронизировано с официальным шаблоном МТС «Шаблоны документации» (раздан
# организаторами на хакатоне) — это структурные разделы, которые реально
# требует шаблон, а не наша доменная рубрика. Ключевые слова расширены под
# вариант шаблона для витрины-агрегата («Бизнес-требования», «Способ
# загрузки», «Регламент», «Глубина данных» и т.п. — синонимы тех же разделов).
#
# ключ раздела -> (человекочитаемое имя, ключевые слова для поиска в документе)
TEMPLATE_SECTIONS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Общие сведения", ("общие сведения", "краткое описание потока", "модуль обеспечивает", "общая информация")),
    ("Решаемая проблема / бизнес-требования", ("решаемая проблема", "бизнес-требования", "бизнес требования", "цель —", "цель -", "постановка")),
    ("Продуктовые метрики", ("продуктовые метрики", "метрики")),
    ("Заказчики", ("заказчик",)),
    (
        "Нефункциональные требования (объём, задержки, SLA, регламент, глубина)",
        ("нефункциональн", "способ загрузки", "регламент", "глубина данных", "задержк", "sla"),
    ),
    ("Системы-источники", ("система-источник", "системы-источники", "источник данных")),
    ("Data Catalog", ("data catalog", "дата-каталог", "датакаталог")),
    ("Исходники проекта (GitLab)", ("исходники проекта", "gitlab", "git lab", "исходный код")),
    ("Команда", ("команда", "po:", "techpm", "product owner")),
    ("JIRA", ("jira",)),
    ("Источники данных (таблица)", ("источники данных", "тип источника", "ссылка на источник")),
    ("Источники обогащения данных", ("источники обогащения", "обогащени")),
    ("Приёмники данных", ("приемники данных", "приёмники данных", "ссылка на каталог")),
    ("Схема потоков данных", ("схема потоков", "схема потока")),
    (
        "Алгоритм обработки потока / расчёта",
        ("алгоритм обработки", "алгоритм расчёта", "алгоритм расчета", "шаг 1", "фильтрация данных"),
    ),
    ("Формирование ключа (Kafka) / партиции (HDFS)", ("формирование ключа", "партици")),
    ("Структура данных", ("структура данных", "тип данных")),
    ("Пример данных", ("пример данных", "пример входных", "пример выходных", "пример строки")),
    ("DDL", ("ddl",)),
    ("FAQ", ("faq",)),
    ("История изменений", ("история изменений",)),
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
