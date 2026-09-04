#!/usr/bin/env python3
"""CLI для предварительного ревью ТЗ.

Примеры:
    python cli.py examples/tz_flow_raw.md
    python cli.py examples/tz_flow_raw.md --format html --out out/review.html
    python cli.py path/to/ТЗ.docx --provider openai --model gpt-4o-mini
    python cli.py examples/tz_flow_raw.md --offline
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from tz_reviewer.analyzer import review_document
from tz_reviewer.config import OUTPUT_DIR, Settings
from tz_reviewer.document import load_text
from tz_reviewer.report import render


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="tz-reviewer",
        description="Предварительное ревью технического задания на поток/витрину данных.",
    )
    p.add_argument("path", help="Путь к ТЗ (.md, .txt или .docx)")
    p.add_argument("--format", "-f", default="md", choices=["md", "html", "json"], help="Формат отчёта")
    p.add_argument("--out", "-o", help="Файл для сохранения отчёта (по умолчанию — stdout)")
    p.add_argument("--provider", choices=["auto", "anthropic", "openai", "offline"], help="Провайдер LLM")
    p.add_argument("--model", help="Идентификатор модели (переопределяет TZR_MODEL)")
    p.add_argument("--offline", action="store_true", help="Только эвристики, без обращения к LLM")
    p.add_argument("--per-section", action="store_true", help="Зарезервировано: детальный проход по разделам")
    p.add_argument("--note", default="", help="Замечание аналитика к контексту (передаётся модели)")
    p.add_argument("--quiet", "-q", action="store_true", help="Не печатать статус в stderr")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    settings = Settings()
    if args.provider:
        settings.provider = args.provider
    if args.offline:
        settings.provider = "offline"
    if args.model:
        settings.model = args.model
    if args.per_section:
        settings.per_section = True

    try:
        text = load_text(args.path)
    except (FileNotFoundError, RuntimeError) as exc:
        print(f"Ошибка: {exc}", file=sys.stderr)
        return 2

    if not args.quiet:
        print(f"[i] Документ: {args.path} ({len(text)} символов)", file=sys.stderr)
        print(f"[i] Режим анализа: {settings.describe()}", file=sys.stderr)

    report = review_document(text, settings=settings, sources_note=args.note)
    rendered = render(report, args.format)

    if args.out:
        out_path = Path(args.out)
        if not out_path.is_absolute() and not out_path.parent.exists() and out_path.parent != Path():
            out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(rendered, encoding="utf-8")
        if not args.quiet:
            print(f"[✓] Отчёт сохранён: {out_path}", file=sys.stderr)
    else:
        print(rendered)

    if not args.quiet:
        s = report.stats.get("by_severity", {})
        print(
            f"[✓] Готовность {report.readiness_score}/100 · "
            f"блокеры {s.get('blocker', 0)}, существенные {s.get('major', 0)}, "
            f"незначительные {s.get('minor', 0)} · {report.verdict}",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
