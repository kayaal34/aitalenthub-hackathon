/*
 * Промежуточная защита — «ТЗ-Ревьюер» (кейс МТС, продукт NET).
 * Генерация: node build_intermediate_deck.js
 * Требует пакет pptxgenjs (npm i pptxgenjs).
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT =
  process.argv[2] ||
  path.join(__dirname, "ТЗ-Ревьюер — промежуточная защита.pptx");

const P = {
  INK: "13223B",
  INK2: "1E3252",
  PAPER: "FFFFFF",
  MIST: "EEF2F7",
  CARD: "F4F7FB",
  STEEL: "3E5C76",
  SLATE: "5B6B7C",
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
    x: MX, y: 0.44, w: CW, h: 0.32, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 12, bold: true, charSpacing: 3,
    color: dark ? P.AMBER : P.ACCENT,
  });
  slide.addText(title, {
    x: MX, y: 0.74, w: CW, h: 0.95, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 30, bold: true, fit: "shrink",
    color: dark ? P.PAPER : P.INK,
  });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || P.CARD },
    line: { color: opts.line || P.LINE, width: 1 },
    shadow: opts.shadow === false ? undefined : shadow(),
  });
}

function chip(slide, x, y, w, text, color) {
  slide.addShape("roundRect", {
    x, y, w, h: 0.42, rectRadius: 0.21,
    fill: { color }, line: { type: "none" },
  });
  slide.addText(text, {
    x, y, w, h: 0.42, isTextBox: true, margin: 0, align: "center",
    fontFace: BODY, fontSize: 11.5, bold: true, color: P.PAPER,
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
      fit: "shrink",
    }
  );
}

/* ---------------------------------------------------------------- Slide 1 */
{
  const s = pres.addSlide();
  bg(s, P.INK);
  s.addShape("roundRect", {
    x: MX, y: 1.5, w: 1.15, h: 1.15, rectRadius: 0.14,
    fill: { color: P.ACCENT }, line: { type: "none" },
  });
  s.addText("ТЗ", {
    x: MX, y: 1.5, w: 1.15, h: 1.15, isTextBox: true, margin: 0, align: "center",
    fontFace: HEAD, fontSize: 30, bold: true, color: P.PAPER,
  });
  s.addText("ТЗ-Ревьюер", {
    x: MX, y: 2.95, w: CW, h: 1.1, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 52, bold: true, color: P.PAPER,
  });
  s.addText("AI-инструмент для предварительного ревью технических заданий\nна разработку новых потоков и витрин данных", {
    x: MX, y: 4.05, w: CW, h: 0.95, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 17, color: "C6D2E2", lineSpacingMultiple: 1.15,
  });
  s.addShape("line", { x: MX, y: 5.35, w: 5.2, h: 0, line: { color: P.STEEL, width: 1.5 } });
  s.addText(
    [
      { text: "Кейс МТС · продукт NET", options: { breakLine: true, bold: true, color: P.PAPER } },
      { text: "Команда 6 · промежуточная защита", options: { breakLine: true, color: "9FB0C6" } },
      { text: "AI Engineer: Кайаал Яхья · Караташоглу Фырат", options: { color: "9FB0C6" } },
    ],
    { x: MX, y: 5.55, w: CW, h: 1.2, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13.5, paraSpaceAfter: 4 }
  );
  s.addNotes(
    "Промежуточная защита. Проект — AI-инструмент, который делает предварительное ревью ТЗ на потоки и витрины данных до передачи в разработку и показывает аналитику потенциально проблемные места."
  );
}

/* ---------------------------------------------------------------- Slide 2 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Проблематика", "Часть проблем в ТЗ находится уже на разработке");

  const pains = [
    ["Объём ручной вычитки", "Аналитики и разработчики вручную вычитывают объёмные ТЗ перед постановкой задачи."],
    ["Неоднозначность и пробелы", "Расплывчатые формулировки и недостающие требования не всегда видны при чтении."],
    ["Нет единого ревью", "Проверка зависит от опыта и загрузки конкретного человека — подход не единообразный."],
  ];
  const pw = (CW - 0.6) / 3;
  pains.forEach((p, i) => {
    const x = MX + i * (pw + 0.3);
    card(s, x, 1.85, pw, 1.9);
    s.addText(p[0], { x: x + 0.22, y: 2.02, w: pw - 0.44, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 14.5, bold: true, color: P.INK });
    s.addText(p[1], { x: x + 0.22, y: 2.42, w: pw - 0.44, h: 1.2, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 11.8, color: P.SLATE, lineSpacingMultiple: 1.12, fit: "shrink" });
  });

  s.addText("Когда проблема всплывает поздно — запускается цикл повторной работы:", {
    x: MX, y: 4.05, w: CW, h: 0.4, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13.5, bold: true, color: P.INK2,
  });
  const loop = ["Аналитик уточняет и правит ТЗ", "Разработчик переделывает реализацию", "Тестировщик перепроверяет сценарии"];
  const lw = (CW - 1.2) / 3;
  loop.forEach((t, i) => {
    const x = MX + i * (lw + 0.6);
    s.addShape("roundRect", { x, y: 4.5, w: lw, h: 0.95, rectRadius: 0.08, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
    s.addText(t, { x: x + 0.15, y: 4.5, w: lw - 0.3, h: 0.95, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 12, color: P.INK2 });
    if (i < 2) s.addText("→", { x: x + lw + 0.06, y: 4.5, w: 0.48, h: 0.95, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 20, bold: true, color: P.ACCENT });
  });

  s.addShape("roundRect", { x: MX, y: 5.75, w: CW, h: 1.0, rectRadius: 0.08, fill: { color: P.INK }, line: { type: "none" } });
  s.addText(
    [
      { text: "Цена проблемы  ", options: { bold: true, color: P.AMBER } },
      { text: "= число поздних уточнений на одно ТЗ  ×  трудоёмкость цикла уточнения  ×  число ТЗ в квартал", options: { color: P.PAPER } },
    ],
    { x: MX + 0.3, y: 5.75, w: CW - 0.6, h: 1.0, isTextBox: true, margin: 0, valign: "middle", fontFace: BODY, fontSize: 13, fit: "shrink" }
  );
  s.addNotes("Точной цифры в кейсе нет — показываем структуру издержек. Инструмент бьёт по первому множителю: переносит часть уточнений на этап до разработки, где правка стоит минуты.");
}

/* ---------------------------------------------------------------- Slide 3 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Пользователь и сценарий", "Аналитик NET получает второе мнение за 1–2 минуты");

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
    card(s, x, 1.95, sw, 2.5);
    s.addShape("ellipse", { x: x + sw / 2 - 0.28, y: 2.15, w: 0.56, h: 0.56, fill: { color: P.INK }, line: { type: "none" } });
    s.addText(st[0], { x: x + sw / 2 - 0.28, y: 2.15, w: 0.56, h: 0.56, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: HEAD, fontSize: 16, bold: true, color: P.PAPER });
    s.addText(st[1], { x: x + 0.12, y: 2.85, w: sw - 0.24, h: 0.7, isTextBox: true, margin: 0, align: "center", fontFace: BODY, fontSize: 12.5, bold: true, color: P.INK, fit: "shrink" });
    s.addText(st[2], { x: x + 0.12, y: 3.5, w: sw - 0.24, h: 0.85, isTextBox: true, margin: 0, align: "center", fontFace: BODY, fontSize: 10.8, color: P.SLATE, fit: "shrink" });
    if (i < 4) s.addText("›", { x: x + sw + 0.02, y: 1.95, w: 0.28, h: 2.5, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 20, bold: true, color: P.LINE });
  });

  s.addShape("roundRect", { x: MX, y: 5.0, w: CW, h: 1.5, rectRadius: 0.08, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
  s.addText("Инструмент — дополнительное предварительное ревью", { x: MX + 0.3, y: 5.18, w: CW - 0.6, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 14, bold: true, color: P.INK });
  bullets(
    s,
    [
      "не заменяет аналитика и не выносит решение о готовности документа;",
      "вторичные пользователи — разработчик и тимлид: быстрый входной чек перед оценкой задачи.",
    ],
    MX + 0.3, 5.56, CW - 0.6, 0.85, { size: 12.5, color: P.INK2, gap: 5 }
  );
  s.addNotes("Основной пользователь один — аналитик, который готовит ТЗ. Сценарий короткий, на минуты, single-screen.");
}

/* ---------------------------------------------------------------- Slide 4 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Постановка задачи", "Что должно делать решение");

  card(s, MX, 1.9, CW * 0.6 - 0.2, 4.3, { fill: P.PAPER });
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
    MX + 0.35, 2.25, CW * 0.6 - 0.9, 3.6, { size: 14, gap: 14 }
  );

  const rx = MX + CW * 0.6 + 0.1;
  const rw = CW * 0.4 - 0.1;
  s.addShape("roundRect", { x: rx, y: 1.9, w: rw, h: 4.3, rectRadius: 0.08, fill: { color: P.INK }, line: { type: "none" } });
  s.addText("Ключевой принцип", { x: rx + 0.3, y: 2.2, w: rw - 0.6, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 2, color: P.AMBER });
  s.addText("Замечание привязано к конкретному содержанию ТЗ, а не является общим советом.", {
    x: rx + 0.3, y: 2.66, w: rw - 0.6, h: 1.5, isTextBox: true, margin: 0, valign: "top", fontFace: HEAD, fontSize: 18, bold: true, color: P.PAPER, lineSpacingMultiple: 1.15, fit: "shrink",
  });
  s.addText("Каждое замечание содержит дословную цитату из документа. Замечание без привязки к тексту отбрасывается.", {
    x: rx + 0.3, y: 4.35, w: rw - 0.6, h: 1.6, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12.5, color: "C6D2E2", lineSpacingMultiple: 1.15, fit: "shrink",
  });
  s.addNotes("Требования кейса. Главное отличие от «просто спросить LLM» — предметность и привязка к тексту.");
}

/* ---------------------------------------------------------------- Slide 5 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Техническое решение", "Пайплайн предварительного ревью");

  const stages = [
    ["Разбор документа", ".md / .txt / .docx (с таблицами) → разделы по заголовкам и нумерации"],
    ["Покрытие шаблона", "сверка с каноническим шаблоном ТЗ — каких разделов не хватает"],
    ["LLM-ревью по рубрике", "19 доменных категорий + few-shot на паттернах корректировок разработчиков"],
    ["Эвристики", "заглушки, «и т.д.», поле без типа, расчёт без формулы — работают и без LLM"],
    ["Структурированный отчёт", "замечания + критичность + индекс готовности + вопросы аналитику"],
  ];
  const bh = 0.92;
  stages.forEach((st, i) => {
    const y = 1.95 + i * (bh + 0.12);
    s.addShape("roundRect", { x: MX, y, w: CW * 0.62, h: bh, rectRadius: 0.07, fill: { color: i % 2 ? P.CARD : P.MIST }, line: { color: P.LINE, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.18, y: y + bh / 2 - 0.2, w: 0.4, h: 0.4, fill: { color: P.ACCENT }, line: { type: "none" } });
    s.addText(String(i + 1), { x: MX + 0.18, y: y + bh / 2 - 0.2, w: 0.4, h: 0.4, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: BODY, fontSize: 11, bold: true, color: P.PAPER });
    s.addText(st[0], { x: MX + 0.75, y: y + 0.1, w: CW * 0.62 - 0.95, h: 0.34, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 13.5, bold: true, color: P.INK });
    s.addText(st[1], { x: MX + 0.75, y: y + 0.42, w: CW * 0.62 - 0.95, h: 0.44, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 10.5, color: P.SLATE, fit: "shrink" });
  });

  const rx = MX + CW * 0.62 + 0.3;
  const rw = CW * 0.38 - 0.3;
  s.addShape("roundRect", { x: rx, y: 1.95, w: rw, h: 5.12, rectRadius: 0.08, fill: { color: P.INK }, line: { type: "none" } });
  s.addText("Провайдер-независимость", { x: rx + 0.28, y: 2.18, w: rw - 0.56, h: 0.36, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1.5, color: P.AMBER });
  bullets(
    s,
    [
      "Anthropic API (Claude);",
      "OpenAI-совместимый эндпоинт: OpenRouter, локальный vLLM / Ollama, внутренний контур МТС;",
      "офлайн-режим — эвристики без внешних вызовов.",
    ],
    rx + 0.28, 2.62, rw - 0.56, 2.0, { size: 11.5, color: "D6DFEC", gap: 10 }
  );
  s.addShape("line", { x: rx + 0.28, y: 4.72, w: rw - 0.56, h: 0, line: { color: P.STEEL, width: 1 } });
  s.addText("В каждом замечании", { x: rx + 0.28, y: 4.92, w: rw - 0.56, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1, color: P.AMBER });
  s.addText("раздел · цитата · критичность · что неясно · почему важно · что уточнить · вопрос аналитику", {
    x: rx + 0.28, y: 5.24, w: rw - 0.56, h: 1.2, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, color: "D6DFEC", lineSpacingMultiple: 1.25, fit: "shrink",
  });
  s.addText("Стек: Python · Streamlit (демо) · CLI · pydantic-схема ответа", {
    x: rx + 0.28, y: 6.5, w: rw - 0.56, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.5, italic: true, color: "9FB0C6", fit: "shrink",
  });
  s.addNotes("Ядро (пакет tz_reviewer) не зависит от интерфейса: для MVP выбрали Streamlit ради скорости демо, ядро можно обернуть в API/FastAPI позже.");
}

/* ---------------------------------------------------------------- Slide 6 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Пример работы", "Формат одного замечания");

  card(s, MX, 1.95, CW * 0.62 - 0.2, 4.9, { fill: P.PAPER });
  const rows = [
    ["Раздел", "4. Логика загрузки"],
    ["Критичность", "blocker  —  без этого нельзя начинать разработку"],
    ["Цитата", "«Данные грузятся инкрементально по дате.»"],
    ["Что неясно", "Не указано поле-приращение и обработка опоздавших записей."],
    ["Почему важно", "Разработчик выберет поле сам — риск потери строк или дублей."],
    ["Что уточнить", "Поле watermark, окно перекрытия, поведение при повторном запуске."],
    ["Вопрос аналитику", "По какому полю считаем приращение и на сколько назад перечитываем?"],
  ];
  let y = 2.2;
  rows.forEach((r) => {
    s.addText(r[0].toUpperCase(), { x: MX + 0.3, y, w: 1.9, h: 0.6, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 9.5, bold: true, charSpacing: 1, color: P.ACCENT, valign: "top" });
    s.addText(r[1], { x: MX + 2.3, y, w: CW * 0.62 - 2.75, h: 0.62, isTextBox: true, margin: 0, fontFace: BODY, fontSize: 11.5, color: P.INK2, valign: "top", fit: "shrink" });
    y += 0.65;
  });

  const rx = MX + CW * 0.62 + 0.3;
  const rw = CW * 0.38 - 0.3;
  card(s, rx, 1.95, rw, 2.35, { fill: P.MIST });
  s.addText("Сводка по документу", { x: rx + 0.25, y: 2.18, w: rw - 0.5, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, color: P.INK });
  s.addText([
    { text: "Индекс готовности: ", options: { color: P.SLATE } },
    { text: "63 / 100", options: { bold: true, color: P.INK, breakLine: true } },
    { text: "Блокеры 3 · Существенные 6 · Незначительные 4", options: { color: P.INK2 } },
  ], { x: rx + 0.25, y: 2.62, w: rw - 0.5, h: 1.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, lineSpacingMultiple: 1.25, paraSpaceAfter: 6 });

  card(s, rx, 4.5, rw, 2.35, { fill: P.INK });
  s.addText("Офлайн-режим", { x: rx + 0.25, y: 4.72, w: rw - 0.5, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, color: P.AMBER });
  s.addText("Без API-ключа инструмент всё равно даёт отчёт: эвристики и покрытие шаблона. Подходит для закрытого контура.", {
    x: rx + 0.25, y: 5.14, w: rw - 0.5, h: 1.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, color: "C6D2E2", lineSpacingMultiple: 1.2, fit: "shrink",
  });
  s.addNotes("На демо показываем: сырое ТЗ → отчёт с блокерами; доработанное ТЗ → меньше замечаний, выше индекс; тот же прогон в офлайн-режиме.");
}

/* ---------------------------------------------------------------- Slide 7 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Качество и риски", "Как оцениваем и что может пойти не так");

  s.addText("Критерии успеха", { x: MX, y: 1.9, w: CW / 2 - 0.3, h: 0.36, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13, bold: true, color: P.INK });
  bullets(
    s,
    [
      "замечания указывают на места, которые реально стоит уточнить;",
      "каждое замечание привязано к фрагменту ТЗ (доля с валидной цитатой → ~100%);",
      "по замечанию видно: где, что не так, что дописать, какой вопрос задать;",
      "нет советов, не связанных с этим ТЗ.",
    ],
    MX, 2.32, CW / 2 - 0.3, 2.1, { size: 12, gap: 10 }
  );

  s.addText("Прокси-метрики (тест без эталона)", { x: MX, y: 4.55, w: CW / 2 - 0.3, h: 0.36, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13, bold: true, color: P.INK });
  const metrics = [["Precision@отчёт", "≥ 0.7"], ["Recall по известным правкам", "≥ 0.6"], ["Доля валидных цитат", "≥ 0.95"], ["Стабильность двух прогонов", "≥ 0.7"]];
  metrics.forEach((m, i) => {
    const y = 5.0 + i * 0.46;
    s.addShape("line", { x: MX, y: y + 0.42, w: CW / 2 - 0.3, h: 0, line: { color: P.LINE, width: 1 } });
    s.addText(m[0], { x: MX, y, w: CW / 2 - 1.4, h: 0.4, isTextBox: true, margin: 0, valign: "middle", fontFace: BODY, fontSize: 11.5, color: P.INK2 });
    s.addText(m[1], { x: MX + CW / 2 - 1.4, y, w: 1.1, h: 0.4, isTextBox: true, margin: 0, align: "right", valign: "middle", fontFace: BODY, fontSize: 11.5, bold: true, color: P.GREEN });
  });

  const rx = MX + CW / 2 + 0.3;
  const rw = CW / 2 - 0.3;
  s.addShape("roundRect", { x: rx, y: 1.9, w: rw, h: 4.95, rectRadius: 0.08, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
  s.addText("Ключевые риски AI-решения", { x: rx + 0.3, y: 2.15, w: rw - 0.6, h: 0.36, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13, bold: true, color: P.INK });
  const risks = [
    ["Ложноположительные замечания", "критичность + сортировка + фильтр; few-shot на реальных правках"],
    ["Слишком общие советы", "обязательная цитата в схеме; отбрасывание замечаний без привязки"],
    ["Пропуск важной проблемы", "эвристики поверх LLM; покрытие шаблона; «не заменяет аналитика»"],
    ["Данные не должны уходить наружу", "локальный эндпоинт / офлайн-режим; ключи только через окружение"],
  ];
  let ry = 2.68;
  risks.forEach((r) => {
    s.addText(r[0], { x: rx + 0.3, y: ry, w: rw - 0.6, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, bold: true, color: P.INK2 });
    s.addText("→ " + r[1], { x: rx + 0.3, y: ry + 0.34, w: rw - 0.6, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.3, color: P.SLATE, fit: "shrink" });
    ry += 1.05;
  });
  s.addNotes("Порогов в кейсе нет — метрики это ориентиры для разговора с кейсодателем на финале.");
}

/* ---------------------------------------------------------------- Slide 8 */
{
  const s = pres.addSlide();
  bg(s, P.INK);
  header(s, "Команда и план", "Команда 6 — распределение задач", { dark: true });

  const people = [
    ["Кайаал Яхья", "AI Engineer", ["ядро анализа: LLM-пайплайн, промпты, структурированный вывод", "доменная рубрика и категории замечаний", "Streamlit-демо, сценарий демонстрации", "тестирование качества"]],
    ["Караташоглу Фырат", "AI Engineer", ["архитектура решения и сборка MVP", "модуль разбора документа, эвристики, покрытие шаблона", "интеграция провайдеров LLM (в т.ч. OpenAI-совместимые)", "подготовка примеров ТЗ и прогоны"]],
  ];
  const pw = (CW - 0.4) / 2;
  people.forEach((p, i) => {
    const x = MX + i * (pw + 0.4);
    s.addShape("roundRect", { x, y: 1.9, w: pw, h: 3.05, rectRadius: 0.08, fill: { color: P.INK2 }, line: { color: P.STEEL, width: 1 } });
    s.addText(p[0], { x: x + 0.28, y: 2.12, w: pw - 0.56, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: HEAD, fontSize: 17, bold: true, color: P.PAPER });
    s.addText(p[1] + "  ·  участие 50%", { x: x + 0.28, y: 2.52, w: pw - 0.56, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, color: P.AMBER });
    bullets(s, p[2], x + 0.28, 2.92, pw - 0.56, 1.9, { size: 10.8, color: "CBD6E5", gap: 8 });
  });

  s.addShape("roundRect", { x: MX, y: 5.25, w: CW, h: 1.3, rectRadius: 0.08, fill: { color: P.INK2 }, line: { type: "none" } });
  s.addText("До финала", { x: MX + 0.3, y: 5.42, w: 2.0, h: 0.36, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2, color: P.AMBER });
  s.addText(
    "прогон на примерах кейсодателя  ·  пост-проверка цитат  ·  подсветка фрагмента в тексте  ·  доработка промптов и few-shot  ·  замер метрик  ·  финальная демонстрация и презентация",
    { x: MX + 0.3, y: 5.76, w: CW - 0.6, h: 0.7, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, color: "D6DFEC", lineSpacingMultiple: 1.12, fit: "shrink" }
  );
  s.addText("Архитектурные решения принимаются совместно.", { x: MX, y: 6.75, w: CW, h: 0.3, isTextBox: true, margin: 0, align: "center", valign: "top", fontFace: BODY, fontSize: 10.5, italic: true, color: "8FA0B6" });
  s.addNotes("50/50, работа совместная. Совместно принимаем архитектурные решения, обсуждаем продуктовый сценарий, тестируем качество.");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("Готово:", f));
