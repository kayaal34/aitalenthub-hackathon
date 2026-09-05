/*
 * Финальная защита — «ТЗ-Ревьюер» (кейс МТС, продукт NET).
 * Генерация: node build_final_deck.js ["out.pptx"]
 * Требует пакет pptxgenjs (npm i pptxgenjs).
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT =
  process.argv[2] ||
  path.join(__dirname, "ТЗ-Ревьюер — финальная защита.pptx");
const SHOT = path.join(__dirname, "assets", "real-output.png");

const P = {
  INK: "13223B",
  INK2: "1E3252",
  PAPER: "FFFFFF",
  MIST: "EEF2F7",
  CARD: "F4F7FB",
  STEEL: "3E5C76",
  SLATE: "566173",
  ACCENT: "E5534B",
  AMBER: "D98324",
  GREY: "8A8F98",
  GREEN: "2E7D5B",
  LINE: "D4DCE6",
};
const HEAD = "Cambria";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Команда 6";
pres.company = "MTS Hackathon — AI-инструмент для анализа документации";

const MX = 0.55;
const CW = 13.3 - MX * 2;

function shadow() {
  return { type: "outer", color: "AAB4C0", blur: 9, offset: 3, angle: 90, opacity: 0.34 };
}
function bg(slide, color) {
  slide.background = { color };
}
function header(slide, kicker, title, opts = {}) {
  const dark = !!opts.dark;
  slide.addText(kicker.toUpperCase(), {
    x: MX, y: 0.42, w: CW, h: 0.32, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 12, bold: true, charSpacing: 3,
    color: dark ? P.AMBER : P.ACCENT,
  });
  slide.addText(title, {
    x: MX, y: 0.72, w: CW, h: 0.88, isTextBox: true, margin: 0, valign: "top",
    fontFace: HEAD, fontSize: 27, bold: true, fit: "shrink",
    color: dark ? P.PAPER : P.INK,
  });
  if (opts.sub) {
    slide.addText(opts.sub, {
      x: MX, y: 1.54, w: CW, h: 0.34, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 12.5, italic: true, color: dark ? "9FB0C6" : P.SLATE,
    });
  }
}
function card(slide, x, y, w, h, opts = {}) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || P.CARD },
    line: { color: opts.line || P.LINE, width: 1 },
    shadow: opts.shadow === false ? undefined : shadow(),
  });
}
function bullets(slide, items, x, y, w, h, opts = {}) {
  slide.addText(
    items.map((t, i) => ({
      text: t,
      options: {
        bullet: { characterCode: "2022", indent: 12 },
        breakLine: i !== items.length - 1,
        paraSpaceAfter: opts.gap ?? 7,
      },
    })),
    {
      x, y, w, h, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: opts.size ?? 14, color: opts.color || P.INK2,
      lineSpacingMultiple: opts.lsm ?? 1.0, fit: "shrink",
    }
  );
}

/* ---------------------------------------------------------------- Slide 1: Title */
{
  const s = pres.addSlide();
  bg(s, P.INK);
  s.addShape("roundRect", {
    x: MX, y: 1.4, w: 1.15, h: 1.15, rectRadius: 0.14,
    fill: { color: P.ACCENT }, line: { type: "none" },
  });
  s.addText("ТЗ", {
    x: MX, y: 1.4, w: 1.15, h: 1.15, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: HEAD, fontSize: 30, bold: true, color: P.PAPER,
  });
  s.addText("ТЗ-Ревьюер", {
    x: MX, y: 2.85, w: CW, h: 1.05, isTextBox: true, margin: 0, valign: "top",
    fontFace: HEAD, fontSize: 50, bold: true, color: P.PAPER,
  });
  s.addText(
    "AI-инструмент для предварительного ревью технических заданий\nна разработку новых потоков и витрин данных",
    { x: MX, y: 3.92, w: CW, h: 0.95, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 17, color: "C6D2E2", lineSpacingMultiple: 1.15 }
  );
  s.addShape("line", { x: MX, y: 5.2, w: 5.2, h: 0, line: { color: P.STEEL, width: 1.5 } });
  s.addText(
    [
      { text: "Кейс МТС · продукт NET", options: { breakLine: true, bold: true, color: P.PAPER } },
      { text: "Команда 6 · финальная защита", options: { breakLine: true, color: "9FB0C6" } },
      { text: "Проверено на реальных документах кейсодателя, вживую с LLM", options: { breakLine: true, color: "9FB0C6" } },
      { text: "AI Engineer: Кайаал Яхья · Караташоглу Фырат", options: { color: "9FB0C6" } },
    ],
    { x: MX, y: 5.4, w: CW, h: 1.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13.5, paraSpaceAfter: 4 }
  );
  s.addNotes("Финальная защита. С промежуточного этапа: интегрированы официальные критерии кейсодателя, решение протестировано на 3 реальных документах в офлайн- и LLM-режиме, найденные баги исправлены.");
}

/* ---------------------------------------------------------------- Slide 2: Problem */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Проблематика", "Часть проблем в ТЗ находится уже на разработке");

  const pains = [
    ["Объём ручной вычитки", "Аналитики и разработчики вручную вычитывают объёмные ТЗ перед постановкой задачи."],
    ["Неоднозначность и пробелы", "Расплывчатые формулировки и недостающие требования не всегда видны при чтении."],
    ["Нет единого ревью", "Проверка зависит от опыта и загрузки конкретного человека."],
  ];
  const pw = (CW - 0.6) / 3;
  pains.forEach((p, i) => {
    const x = MX + i * (pw + 0.3);
    card(s, x, 1.8, pw, 1.95);
    s.addText(p[0], { x: x + 0.22, y: 1.98, w: pw - 0.44, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 15, bold: true, color: P.INK });
    s.addText(p[1], { x: x + 0.22, y: 2.42, w: pw - 0.44, h: 1.15, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12.5, color: P.SLATE, lineSpacingMultiple: 1.12, fit: "shrink" });
  });

  s.addText("Когда проблема всплывает поздно — запускается цикл повторной работы:", {
    x: MX, y: 4.05, w: CW, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 14, bold: true, color: P.INK2,
  });
  const loop = ["Аналитик правит ТЗ", "Разработчик переделывает реализацию", "Тестировщик перепроверяет сценарии"];
  const lw = (CW - 1.2) / 3;
  loop.forEach((t, i) => {
    const x = MX + i * (lw + 0.6);
    s.addShape("roundRect", { x, y: 4.5, w: lw, h: 0.95, rectRadius: 0.08, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
    s.addText(t, { x: x + 0.15, y: 4.5, w: lw - 0.3, h: 0.95, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 12.5, color: P.INK2 });
    if (i < 2) s.addText("→", { x: x + lw + 0.06, y: 4.5, w: 0.48, h: 0.95, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 20, bold: true, color: P.ACCENT });
  });

  s.addShape("roundRect", { x: MX, y: 5.8, w: CW, h: 1.0, rectRadius: 0.08, fill: { color: P.INK }, line: { type: "none" } });
  s.addText(
    [
      { text: "Цена проблемы  ", options: { bold: true, color: P.AMBER } },
      { text: "= число поздних уточнений на одно ТЗ  ×  трудоёмкость цикла уточнения  ×  число ТЗ в квартал", options: { color: P.PAPER } },
    ],
    { x: MX + 0.3, y: 5.8, w: CW - 0.6, h: 1.0, isTextBox: true, margin: 0, valign: "middle", fontFace: BODY, fontSize: 13, fit: "shrink" }
  );
  s.addNotes("Точной цифры в кейсе нет — показываем структуру издержек. Инструмент бьёт по первому множителю.");
}

/* ---------------------------------------------------------------- Slide 3: User & scenario */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Пользователь и сценарий", "Второе мнение по ТЗ до передачи в разработку", {
    sub: "Основной пользователь — аналитик NET. Дополнительное ревью, не замена аналитика и не вердикт о готовности.",
  });

  const steps = [
    ["1", "Готовит ТЗ", "Word / Markdown / текст"],
    ["2", "Загружает ТЗ", "и запускает проверку"],
    ["3", "Получает замечания", "с привязкой к тексту"],
    ["4", "Отбирает значимые", "решает, что править"],
    ["5", "Дорабатывает ТЗ", "и отдаёт в разработку"],
  ];
  const sw = (CW - 4 * 0.3) / 5;
  steps.forEach((st, i) => {
    const x = MX + i * (sw + 0.3);
    card(s, x, 2.15, sw, 2.4);
    s.addShape("ellipse", { x: x + sw / 2 - 0.28, y: 2.34, w: 0.56, h: 0.56, fill: { color: P.INK }, line: { type: "none" } });
    s.addText(st[0], { x: x + sw / 2 - 0.28, y: 2.34, w: 0.56, h: 0.56, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: HEAD, fontSize: 16, bold: true, color: P.PAPER });
    s.addText(st[1], { x: x + 0.12, y: 3.02, w: sw - 0.24, h: 0.6, isTextBox: true, margin: 0, align: "center", valign: "top", fontFace: BODY, fontSize: 13, bold: true, color: P.INK, fit: "shrink" });
    s.addText(st[2], { x: x + 0.12, y: 3.62, w: sw - 0.24, h: 0.8, isTextBox: true, margin: 0, align: "center", valign: "top", fontFace: BODY, fontSize: 11, color: P.SLATE, fit: "shrink" });
    if (i < 4) s.addText("›", { x: x + sw + 0.02, y: 2.15, w: 0.28, h: 2.4, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 20, bold: true, color: P.GREY });
  });

  s.addShape("roundRect", { x: MX, y: 5.05, w: CW, h: 1.55, rectRadius: 0.08, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
  s.addText("Проверено не только на синтетике, но и на реальных ТЗ кейсодателя", { x: MX + 0.3, y: 5.24, w: CW - 0.6, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 14, bold: true, color: P.INK });
  bullets(
    s,
    [
      "весь сценарий прогнан на 3 реальных документах МТС в офлайн- и LLM-режиме;",
      "вторичные пользователи: разработчик и тимлид — быстрый входной чек перед оценкой задачи.",
    ],
    MX + 0.3, 5.62, CW - 0.6, 0.85, { size: 12.5, color: P.INK2, gap: 5 }
  );
  s.addNotes("Один основной пользователь — аналитик. Сценарий короткий, один экран, полностью реализован.");
}

/* ---------------------------------------------------------------- Slide 4: Task */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Постановка задачи", "Что должно делать решение");

  card(s, MX, 1.9, CW * 0.58 - 0.15, 4.5, { fill: P.PAPER });
  bullets(
    s,
    [
      "находить конкретные фрагменты, непонятные разработчику;",
      "определять недостающую и неоднозначную информацию;",
      "объяснять, почему фрагмент требует внимания;",
      "предлагать, что уточнить или дополнить;",
      "показывать, к какому разделу ТЗ относится замечание;",
      "формировать общий результат проверки документа.",
    ],
    MX + 0.35, 2.2, CW * 0.58 - 0.85, 3.9, { size: 14.5, gap: 15 }
  );

  const rx = MX + CW * 0.58 + 0.05;
  const rw = CW * 0.42 - 0.05;
  s.addShape("roundRect", { x: rx, y: 1.9, w: rw, h: 4.5, rectRadius: 0.08, fill: { color: P.INK }, line: { type: "none" } });
  s.addText("КЛЮЧЕВОЙ ПРИНЦИП", { x: rx + 0.32, y: 2.25, w: rw - 0.64, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 2, color: P.AMBER });
  s.addText("Замечание привязано к конкретному фрагменту ТЗ, а не является общим советом.", {
    x: rx + 0.32, y: 2.7, w: rw - 0.64, h: 1.7, isTextBox: true, margin: 0, valign: "top", fontFace: HEAD, fontSize: 19, bold: true, color: P.PAPER, lineSpacingMultiple: 1.18, fit: "shrink",
  });
  s.addText("Подтверждено на практике: на реальных документах кейсодателя абсолютное большинство замечаний LLM-режима содержали дословную цитату.", {
    x: rx + 0.32, y: 4.55, w: rw - 0.64, h: 1.6, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13, color: "C6D2E2", lineSpacingMultiple: 1.2, fit: "shrink",
  });
  s.addNotes("Требования кейса. Главное отличие от «просто спросить LLM» — предметность и обязательная привязка к тексту, проверено не только в теории.");
}

/* ---------------------------------------------------------------- Slide 5: Solution */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Техническое решение", "Пайплайн предварительного ревью");

  const stages = [
    ["Разбор документа", ".md / .txt / .docx с таблицами → разбивка на разделы"],
    ["Покрытие шаблона", "официальный шаблон МТС, 21 раздел — что не найдено в ТЗ"],
    ["LLM-ревью по рубрике", "23 категории, включая 4 по официальным критериям МТС"],
    ["Эвристики (без LLM)", "заглушки, «и т.д.», поле без типа/NOT NULL, Kafka без кластера"],
    ["Структурированный отчёт", "замечания, критичность, вопросы аналитику, покрытие шаблона"],
  ];
  const bw = CW * 0.6;
  const bh = 0.9;
  stages.forEach((st, i) => {
    const y = 1.95 + i * (bh + 0.14);
    s.addShape("roundRect", { x: MX + 0.05, y, w: bw, h: bh, rectRadius: 0.07, fill: { color: i % 2 ? P.CARD : P.MIST }, line: { color: P.LINE, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.25, y: y + bh / 2 - 0.21, w: 0.42, h: 0.42, fill: { color: P.ACCENT }, line: { type: "none" } });
    s.addText(String(i + 1), { x: MX + 0.25, y: y + bh / 2 - 0.21, w: 0.42, h: 0.42, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 12, bold: true, color: P.PAPER });
    s.addText(st[0], { x: MX + 0.85, y: y + 0.13, w: bw - 1.1, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 14.5, bold: true, color: P.INK });
    s.addText(st[1], { x: MX + 0.85, y: y + 0.47, w: bw - 1.1, h: 0.36, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, color: P.SLATE, fit: "shrink" });
  });

  const rx = MX + bw + 0.35;
  const rw = CW - bw - 0.35;
  s.addShape("roundRect", { x: rx, y: 1.95, w: rw, h: 5.13, rectRadius: 0.08, fill: { color: P.INK }, line: { type: "none" } });
  s.addText("ОФИЦИАЛЬНЫЕ КРИТЕРИИ МТС", { x: rx + 0.3, y: 2.2, w: rw - 0.6, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 1.5, color: P.AMBER });
  bullets(
    s,
    [
      "спецификация сериализации входа/выхода;",
      "прямая ссылка на Data Catalog;",
      "NOT NULL / NULLABLE по каждому полю;",
      "Kafka-кластер и полный путь в HDFS;",
      "перечень используемых справочников (НСИ).",
    ],
    rx + 0.3, 2.62, rw - 0.6, 2.5, { size: 11.5, color: "D6DFEC", gap: 9, lsm: 1.06 }
  );
  s.addShape("line", { x: rx + 0.3, y: 5.05, w: rw - 0.6, h: 0, line: { color: P.STEEL, width: 1 } });
  s.addText("ПРОВАЙДЕР-НЕЗАВИСИМОСТЬ", { x: rx + 0.3, y: 5.24, w: rw - 0.6, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1, color: P.AMBER });
  s.addText("Anthropic · любой OpenAI-совместимый (OpenAI, Gemini, OpenRouter, локальные модели) · офлайн-режим. Проверено вживую на 2 провайдерах.", {
    x: rx + 0.3, y: 5.56, w: rw - 0.6, h: 1.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, color: "D6DFEC", lineSpacingMultiple: 1.3, fit: "shrink",
  });
  s.addNotes("Эти 8 официальных критериев прислали организаторы отдельным файлом уже после старта работы — интегрированы в рубрику как приоритетные категории.");
}

/* ---------------------------------------------------------------- Slide 6: Real testing */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Проверка на реальных данных", "3 документа кейсодателя, 2 режима анализа");

  const lw = CW * 0.42;
  const docs = [
    ["Поток геолокации", "модуль реального времени, 2 источника, 5 целевых таблиц"],
    ["Поток CDR", "prepaid-звонки/SMS, фильтрация и коррекция часового пояса"],
    ["Витрина-агрегат", "ежемесячная сводка по устройствам — образец финального теста"],
  ];
  let dy = 1.95;
  docs.forEach((d) => {
    s.addShape("roundRect", { x: MX, y: dy, w: lw, h: 1.05, rectRadius: 0.07, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
    s.addText(d[0], { x: MX + 0.24, y: dy + 0.12, w: lw - 0.48, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13.5, bold: true, color: P.INK });
    s.addText(d[1], { x: MX + 0.24, y: dy + 0.46, w: lw - 0.48, h: 0.52, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.5, color: P.SLATE, lineSpacingMultiple: 1.15, fit: "shrink" });
    dy += 1.2;
  });

  s.addShape("roundRect", { x: MX, y: dy + 0.05, w: lw, h: 1.75, rectRadius: 0.08, fill: { color: P.INK }, line: { type: "none" } });
  s.addText("2 РЕЖИМА, ОБА БЕЗ СБОЕВ", { x: MX + 0.26, y: dy + 0.26, w: lw - 0.52, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1, color: P.AMBER });
  s.addText("Офлайн (эвристики + покрытие шаблона) и живая LLM — Google Gemini 2.5 Flash через OpenAI-совместимый эндпоинт, без единой правки кода.", {
    x: MX + 0.26, y: dy + 0.6, w: lw - 0.52, h: 1.1, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, color: "D6DFEC", lineSpacingMultiple: 1.28, fit: "shrink",
  });

  const rx = MX + lw + 0.35;
  const rw = CW - lw - 0.35;
  const MAX_IH = 4.5; // оставляет место под подпись и нижний отступ слайда
  const ih = Math.min(MAX_IH, rw / (1200 / 2200));
  const iw = ih * (1200 / 2200);
  s.addShape("roundRect", { x: rx - 0.06, y: 1.89, w: iw + 0.12, h: ih + 0.12, rectRadius: 0.06, fill: { color: P.INK }, line: { type: "none" }, shadow: shadow() });
  s.addImage({ path: SHOT, x: rx, y: 1.95, w: iw, h: ih });
  s.addText("Реальный вывод: офлайн-режим, поток геолокации (настоящий документ кейсодателя).", {
    x: rx, y: 1.95 + ih + 0.16, w: Math.max(iw, 2.6), h: 0.55, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.5, italic: true, color: P.SLATE, lineSpacingMultiple: 1.2, fit: "shrink",
  });
  s.addNotes("Скриншот — настоящий HTML-отчёт инструмента (cli.py --format html), не макет. LLM-режим на этих же документах нашёл более глубокие содержательные проблемы — см. следующий слайд.");
}

/* ---------------------------------------------------------------- Slide 7: Real finding example */
{
  const s = pres.addSlide();
  bg(s, P.INK);
  header(s, "Пример находки", "Реальное противоречие в документе кейсодателя", { dark: true });

  card(s, MX, 1.9, CW, 1.7, { fill: P.INK2, line: P.STEEL });
  s.addText("«Модуль потоковой геолокации абонентов»", { x: MX + 0.3, y: 2.06, w: CW - 0.6, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 1, color: P.AMBER });
  s.addText(
    [
      { text: "Раздел «Продуктовые метрики»:  ", options: { bold: true, color: P.PAPER } },
      { text: "«Задержка: < 1 мин»", options: { color: "FFB4AE", italic: true, breakLine: true } },
      { text: "Раздел «Нефункциональные требования»:  ", options: { bold: true, color: P.PAPER } },
      { text: "«Стриминг в реальном времени (задержка ≈ 0 сек)»", options: { color: "FFB4AE", italic: true } },
    ],
    { x: MX + 0.3, y: 2.42, w: CW - 0.6, h: 1.05, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13.5, lineSpacingMultiple: 1.35, paraSpaceAfter: 6, fit: "shrink" }
  );

  const rows = [
    ["Категория", "Противоречия и неоднозначные формулировки"],
    ["Критичность", "blocker"],
    ["Что неясно", "Два раздела одного документа дают разные требования к задержке потока."],
    ["Почему важно", "Неоднозначность в целевом SLA может привести к неверному выбору архитектурных решений."],
    ["Вопрос аналитику", "Какое точное требование к задержке потока данных?"],
  ];
  let y = 3.85;
  rows.forEach((r) => {
    s.addText(r[0].toUpperCase(), { x: MX, y, w: 2.6, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10, bold: true, charSpacing: 1, color: P.ACCENT });
    s.addText(r[1], { x: MX + 2.7, y, w: CW - 2.7, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12.5, color: "D6DFEC", fit: "shrink" });
    y += 0.53;
  });
  s.addText("Найдено автоматически, LLM-режим (Google Gemini). Найти такое при беглом чтении объёмного ТЗ — легко упустить; на разработке — уже поздно.", {
    x: MX, y: 6.65, w: CW, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, italic: true, color: "9FB0C6", fit: "shrink",
  });
  s.addNotes("Живой пример из реального документа кейсодателя, не придуманный. Показывает, что инструмент ловит содержательные, а не только механические проблемы.");
}

/* ---------------------------------------------------------------- Slide 8: What testing found & fixed */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Что показало тестирование", "Реальные данные вскрыли реальные баги — все исправлены");

  const items = [
    ["Дублирующиеся находки", "LLM и офлайн-правило независимо находили один и тот же пробел (Kafka/HDFS/Data Catalog) — попадали в отчёт дважды.", "Дедупликация по теме находки, а не только по точной цитате."],
    ["Нераспознанные типы данных", "Поля типа string/long/tinyint ложно помечались как «тип не указан».", "Список распознаваемых типов расширен по реальным данным."],
    ["Спам одинаковой находкой", "«Нет NOT NULL» повторялось до 20 раз — по одной находке на строку таблицы.", "Одна сводная находка на таблицу вместо N одинаковых."],
    ["Ложные срабатывания", "Заголовок таблицы принимался за «поле без типа»; КАПС-слово — за аббревиатуру.", "Распознавание заголовков таблиц; аббревиатура — только при повторе в тексте."],
  ];
  const colW = (CW - 0.4) / 2;
  const rowH = 2.1;
  items.forEach((it, i) => {
    const x = MX + (i % 2) * (colW + 0.4);
    const y = 1.95 + Math.floor(i / 2) * (rowH + 0.25);
    card(s, x, y, colW, rowH);
    s.addText(it[0], { x: x + 0.24, y: y + 0.16, w: colW - 0.48, h: 0.36, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13.5, bold: true, color: P.INK });
    s.addText("Найдено:  " + it[1], { x: x + 0.24, y: y + 0.56, w: colW - 0.48, h: 0.78, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.8, color: P.SLATE, lineSpacingMultiple: 1.2, fit: "shrink" });
    s.addText("Исправлено:  " + it[2], { x: x + 0.24, y: y + 1.4, w: colW - 0.48, h: 0.6, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.8, color: P.GREEN, bold: false, lineSpacingMultiple: 1.2, fit: "shrink" });
  });
  s.addText("Тестирование на реальных документах — не формальность: все 4 проблемы отсутствовали на синтетических примерах и проявились только на реальных данных кейсодателя.", {
    x: MX, y: 6.55, w: CW, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, italic: true, color: P.SLATE, fit: "shrink",
  });
  s.addNotes("Показывает зрелость инженерного процесса жюри: не просто «прогнали и вроде работает», а нашли и закрыли конкретные дефекты по итогам реальных прогонов.");
}

/* ---------------------------------------------------------------- Slide 9: Quality & risks */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Качество и риски", "Что подтвердилось, что осталось риском");

  s.addText("ПОДТВЕРДИЛОСЬ НА ТЕСТАХ", { x: MX, y: 1.9, w: CW / 2 - 0.3, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1, color: P.GREEN });
  bullets(
    s,
    [
      "замечания привязаны к цитате — на всех 3 реальных ТЗ;",
      "провайдер-независимость — переключение на Gemini без правок кода;",
      "находит содержательные противоречия, не только механику;",
      "офлайн-режим даёт полезный результат без LLM.",
    ],
    MX, 2.3, CW / 2 - 0.3, 2.1, { size: 12.5, gap: 11, color: P.INK2 }
  );

  s.addText("ОСТАЁТСЯ РИСКОМ / НЕ ИЗМЕРЕНО", { x: MX, y: 4.3, w: CW / 2 - 0.3, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1, color: P.AMBER });
  bullets(
    s,
    [
      "нет пост-проверки, что цитата дословно есть в тексте;",
      "precision/recall не измерены на размеченной выборке;",
      "few-shot построен на обобщённом опыте, не на реальных правках NET.",
    ],
    MX, 4.7, CW / 2 - 0.3, 1.7, { size: 12.5, gap: 11, color: P.INK2 }
  );

  const rx = MX + CW / 2 + 0.3;
  const rw = CW / 2 - 0.3;
  s.addShape("roundRect", { x: rx, y: 1.9, w: rw, h: 4.95, rectRadius: 0.08, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
  s.addText("КЛЮЧЕВЫЕ РИСКИ AI-РЕШЕНИЯ", { x: rx + 0.3, y: 2.14, w: rw - 0.6, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1, color: P.INK });
  const risks = [
    ["Ложные/дублирующиеся находки", "критичность и сортировка; дедупликация по теме (проверено и исправлено на реальных данных)"],
    ["AI выносит вердикт о готовности", "числовая оценка убрана из вывода; отчёт показывает только факты"],
    ["Зависимость от одного провайдера", "провайдер-независимый клиент; офлайн-режим как страховка"],
    ["Закрытый контур / чувствительные данные", "локальные эндпоинты и офлайн-режим поддержаны архитектурно"],
  ];
  let ry = 2.62;
  risks.forEach((r) => {
    s.addText(r[0], { x: rx + 0.3, y: ry, w: rw - 0.6, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, color: P.INK2 });
    s.addText("→ " + r[1], { x: rx + 0.3, y: ry + 0.32, w: rw - 0.6, h: 0.55, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.5, color: P.SLATE, lineSpacingMultiple: 1.14, fit: "shrink" });
    ry += 1.05;
  });
  s.addNotes("Раньше эти риски были умозрительными; теперь у большинства пунктов есть подтверждение или опровержение по итогам прогонов на реальных данных.");
}

/* ---------------------------------------------------------------- Slide 10: Limitations & next steps */
{
  const s = pres.addSlide();
  bg(s, P.INK);
  header(s, "Ограничения и планы", "Что дальше — по пути к пилоту", { dark: true });

  s.addText("ОГРАНИЧЕНИЯ", { x: MX, y: 1.95, w: CW / 2 - 0.3, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1.5, color: P.AMBER });
  bullets(
    s,
    [
      "ТЗ подаётся как связный текст (Word/Markdown), не скан;",
      "покрытие шаблона — по ключевым словам заголовков, возможны ложные срабатывания на нестандартных формулировках;",
      "нет обученного эталонного датасета для точных числовых метрик качества.",
    ],
    MX, 2.35, CW / 2 - 0.3, 2.4, { size: 12.5, color: "D6DFEC", gap: 12, lsm: 1.15 }
  );

  const rx = MX + CW / 2 + 0.3;
  const rw = CW / 2 - 0.3;
  s.addText("СЛЕДУЮЩИЙ ШАГ К ПИЛОТУ", { x: rx, y: 1.95, w: rw, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1.5, color: P.AMBER });
  const steps = ["Собрать реальные корректировки NET → обновить базу паттернов", "Пост-проверка цитат + подсветка фрагмента в тексте", "Измерить прокси-метрики на размеченной выборке", "API-сервис вокруг ядра для встраивания в процесс", "Слепой пилот с 2–3 аналитиками NET на 1–2 спринтах"];
  let sy = 2.35;
  steps.forEach((t, i) => {
    s.addShape("ellipse", { x: rx, y: sy + 0.03, w: 0.32, h: 0.32, fill: { color: P.ACCENT }, line: { type: "none" } });
    s.addText(String(i + 1), { x: rx, y: sy + 0.03, w: 0.32, h: 0.32, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 11, bold: true, color: P.PAPER });
    s.addText(t, { x: rx + 0.45, y: sy, w: rw - 0.45, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, color: "D6DFEC", lineSpacingMultiple: 1.15, fit: "shrink" });
    sy += 0.56;
  });

  s.addShape("roundRect", { x: MX, y: 5.35, w: CW, h: 1.25, rectRadius: 0.08, fill: { color: P.INK2 }, line: { type: "none" } });
  s.addText("ВЫВОД ХАКАТОНА", { x: MX + 0.3, y: 5.53, w: CW - 0.6, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2, color: P.AMBER });
  s.addText("Гипотеза подтвердилась на реальных данных: инструмент находит содержательные, а не только механические проблемы, и делает это одинаково надёжно на разных LLM-провайдерах.", {
    x: MX + 0.3, y: 5.68, w: CW - 0.6, h: 0.75, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12.5, color: P.PAPER, lineSpacingMultiple: 1.25, fit: "shrink",
  });
  s.addNotes("Ограничения — честно, без приукрашивания. План — конкретный, с приоритетом на реальные данные NET как главный недостающий кусок.");
}

/* ---------------------------------------------------------------- Slide 11: Team */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Команда", "Команда 6 — распределение задач");

  const people = [
    ["Кайаал Яхья", [
      "рубрика ревью (23 категории) и промпты, включая интеграцию официальных критериев МТС",
      "структурированный вывод и сборка отчёта",
      "тестирование на 3 реальных документах в офлайн- и LLM-режиме, диагностика и исправление найденных багов",
      "проектная документация и презентация",
    ]],
    ["Караташоглу Фырат", [
      "архитектура решения и сборка MVP",
      "разбор документа, первая версия эвристик и проверки шаблона",
      "провайдер-независимый клиент LLM",
      "независимое развёртывание и полный прогон проекта с нуля на отдельной машине (проверка воспроизводимости)",
    ]],
  ];
  const pw = (CW - 0.4) / 2;
  people.forEach((p, i) => {
    const x = MX + i * (pw + 0.4);
    card(s, x, 1.95, pw, 4.2);
    s.addText(p[0], { x: x + 0.3, y: 2.16, w: pw - 0.6, h: 0.42, isTextBox: true, margin: 0, valign: "top", fontFace: HEAD, fontSize: 18, bold: true, color: P.INK });
    s.addText("AI Engineer · участие 50%", { x: x + 0.3, y: 2.58, w: pw - 0.6, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, bold: true, color: P.ACCENT });
    bullets(s, p[1], x + 0.3, 3.05, pw - 0.6, 3.0, { size: 12, color: P.INK2, gap: 11, lsm: 1.12 });
  });

  s.addText("Архитектурные решения и оценка качества — совместно, компоненты интегрированы в общий пайплайн.", {
    x: MX, y: 6.35, w: CW, h: 0.4, isTextBox: true, margin: 0, align: "center", valign: "top", fontFace: BODY, fontSize: 11.5, italic: true, color: P.SLATE, fit: "shrink",
  });
  s.addNotes("Оба Fırat и Yahya — AI Engineer, 50/50. Роли разделены по факту выполненной работы, а не формально.");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("Готово:", f));
