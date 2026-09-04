"""ТЗ-Ревьюер — AI-инструмент для предварительного ревью технических заданий.

Пакет анализирует техническое задание на разработку нового потока или витрины
данных и возвращает перечень мест, которые могут быть непонятны разработчику или
требуют уточнения до передачи задачи в разработку.
"""

from .config import Settings
from .models import Finding, ReviewReport, Section, Severity, TemplateCoverageItem

__version__ = "0.1.0"

__all__ = [
    "Settings",
    "Finding",
    "ReviewReport",
    "Section",
    "Severity",
    "TemplateCoverageItem",
    "review_document",
    "__version__",
]


def review_document(text: str, *, settings: "Settings | None" = None, sources_note: str = ""):
    """Ленивая обёртка над :func:`tz_reviewer.analyzer.review_document`.

    Импорт отложен, чтобы `import tz_reviewer` не тянул тяжёлые зависимости
    (SDK провайдеров) до момента реального анализа.
    """
    from .analyzer import review_document as _impl

    return _impl(text, settings=settings, sources_note=sources_note)
