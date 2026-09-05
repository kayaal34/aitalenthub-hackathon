"""Загрузка ТЗ и разбиение на разделы.

Поддерживаются форматы: .md, .txt, .docx (аналитики чаще всего пишут в Word).
Таблицы из .docx разворачиваются в Markdown-таблицы — в ТЗ на данные таблицы
несут ключевую информацию (маппинг полей), терять их нельзя.
"""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import quote

from .models import Section

_HEADING_MD = re.compile(r"^(#{1,6})\s+(.+?)\s*#*$")
_HEADING_NUM = re.compile(r"^(\d+(?:\.\d+){0,3})[.)]?\s+(.{3,120})$")
_HEADING_UPPER = re.compile(r"^[A-ZА-ЯЁ0-9][A-ZА-ЯЁ0-9 \-/,()«»\"]{5,80}$")
_NUM_PREFIX = re.compile(r"^(\d+(?:\.\d+){0,3})[.)]?\s+(.*)$")


def load_text(path: str | Path) -> str:
    """Возвращает плоский текст документа независимо от формата."""

    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Файл не найден: {p}")
    suffix = p.suffix.lower()
    if suffix == ".docx":
        return _read_docx(p)
    if suffix in {".md", ".markdown", ".txt", ".text", ""}:
        return p.read_text(encoding="utf-8", errors="replace")
    # прочие расширения пробуем прочитать как текст
    return p.read_text(encoding="utf-8", errors="replace")


def _read_docx(p: Path) -> str:
    try:
        import docx  # python-docx
        from docx.document import Document as _Document
        from docx.oxml.table import CT_Tbl
        from docx.oxml.text.paragraph import CT_P
        from docx.oxml.ns import qn
        from docx.table import Table, _Cell
        from docx.text.paragraph import Paragraph
        from docx.text.run import Run
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError(
            "Чтение .docx требует python-docx. Установите: pip install python-docx"
        ) from exc

    def iter_blocks(parent):
        if isinstance(parent, _Document):
            parent_elm = parent.element.body
        elif isinstance(parent, _Cell):
            parent_elm = parent._tc
        else:  # pragma: no cover
            parent_elm = parent._element
        for child in parent_elm.iterchildren():
            if isinstance(child, CT_P):
                yield Paragraph(child, parent)
            elif isinstance(child, CT_Tbl):
                yield Table(child, parent)

    def paragraph_text(paragraph):
        # paragraph.text сохраняет подпись ссылки, но теряет её URL.
        parts: list[str] = []
        for child in paragraph._p:
            if child.tag == qn("w:r"):
                parts.append(Run(child, paragraph).text)
            elif child.tag == qn("w:hyperlink"):
                label = "".join(Run(run, paragraph).text for run in child.findall(qn("w:r")))
                rel_id = child.get(qn("r:id"))
                rel = paragraph.part.rels.get(rel_id) if rel_id else None
                target = rel.target_ref if rel is not None and rel.is_external else ""
                anchor = child.get(qn("w:anchor"))
                if anchor:
                    target = target + "#" + anchor
                if target:
                    safe_target = quote(target, safe="/:#?&=@%+;,!$'()*-._~")
                    safe_label = label.replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")
                    parts.append(f"[{safe_label or safe_target}](<{safe_target}>)")
                else:
                    parts.append(label)
        return "".join(parts)

    def render_blocks(parent):
        out: list[str] = []
        for block in iter_blocks(parent):
            if isinstance(block, Paragraph):
                text = paragraph_text(block).rstrip()
                style = (block.style.name or "").lower() if block.style else ""
                if text and style.startswith("heading"):
                    level = "".join(ch for ch in style if ch.isdigit()) or "2"
                    out.append(f"{'#' * min(int(level), 6)} {text}")
                else:
                    out.append(text)
            else:  # Table, включая вложенные таблицы в ячейках
                rows = [
                    ["\n".join(render_blocks(cell)).strip().replace("|", "\\|")
                     .replace("\n", "<br>") for cell in row.cells]
                    for row in block.rows
                ]
                if not rows:
                    continue
                width = max(len(r) for r in rows)
                rows = [r + [""] * (width - len(r)) for r in rows]
                out.append("")
                out.append("| " + " | ".join(rows[0]) + " |")
                out.append("| " + " | ".join(["---"] * width) + " |")
                for row in rows[1:]:
                    out.append("| " + " | ".join(row) + " |")
                out.append("")
        return out

    return "\n".join(render_blocks(docx.Document(str(p))))


def guess_title(text: str) -> str:
    for raw in text.splitlines():
        line = raw.strip().lstrip("#").strip()
        if len(line) >= 4:
            return line[:160]
    return "Техническое задание"


def _match_heading(line: str) -> tuple[str, str] | None:
    m = _HEADING_MD.match(line)
    if m:
        title = m.group(2).strip()
        num = ""
        nm = _NUM_PREFIX.match(title)
        if nm:
            num, title = nm.group(1), nm.group(2).strip()
        return num, title or line
    m = _HEADING_NUM.match(line)
    if m and not line.endswith((".", ":")) or (m and len(line) <= 90):
        # строка вида "3.2 Логика загрузки" — заголовок; "3.2. приходит 100 строк." — нет
        title = m.group(2).strip()
        if title and title[0].isupper() and not title.endswith("."):
            return m.group(1), title
    if _HEADING_UPPER.match(line) and len(line.split()) <= 10:
        return "", line.strip()
    return None


def split_sections(text: str) -> list[Section]:
    """Сохраняет пустые разделы и иерархию, не дублируя текст дочерних разделов."""

    lines = text.splitlines()
    sections: list[Section] = []
    cur = Section(title="Вводная часть", start_line=1)
    buf: list[str] = []
    parents: list[Section] = []
    body_line = 1
    fence_char = ""
    fence_size = 0

    def flush(end_line: int) -> None:
        first = next((i for i, line in enumerate(buf) if line.strip()), len(buf))
        last = len(buf)
        while last > first and not buf[last - 1].strip():
            last -= 1
        # Убираем только пустые края; отступы и содержимое цитат сохраняются.
        cur.body = "\n".join(buf[first:last])
        cur.body_start_line = body_line + first if cur.body else None
        cur.end_line = end_line
        if cur.level or cur.body:
            sections.append(cur)

    for i, line in enumerate(lines, 1):
        fence = re.match(r"^\s{0,3}(`{3,}|~{3,})(.*)$", line)
        if fence_char:
            buf.append(line)
            if (fence and fence.group(1)[0] == fence_char
                    and len(fence.group(1)) >= fence_size and not fence.group(2).strip()):
                fence_char = ""
            continue
        if fence:
            fence_char, fence_size = fence.group(1)[0], len(fence.group(1))
            buf.append(line)
            continue
        heading = _match_heading(line.strip())
        if heading is not None:
            flush(i - 1)
            number, title = heading
            md_heading = _HEADING_MD.match(line.strip())
            level = len(md_heading.group(1)) if md_heading else number.count(".") + 1
            while parents and parents[-1].level >= level:
                parents.pop()
            cur = Section(
                number=number, title=title, start_line=i, level=level,
                parent_start_line=parents[-1].start_line if parents else None,
            )
            parents.append(cur)
            buf = []
            body_line = i + 1
        else:
            buf.append(line)
    flush(len(lines))

    if not sections:
        sections = [Section(title="Документ", start_line=1, end_line=len(lines))]
    return sections


def numbered_document(sections: list[Section]) -> str:
    """Собирает текст с явными маркерами разделов для передачи в LLM."""

    parts: list[str] = []
    for idx, s in enumerate(sections, 1):
        parts.append(f"[Раздел {idx}: {s.heading}]")
        parts.append(s.body)
        parts.append("")
    return "\n".join(parts).strip()
