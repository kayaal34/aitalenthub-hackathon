/*
 * Промежуточная защита — «ТЗ-Ревьюер» (кейс МТС, продукт NET).
 * Генерация: node build_intermediate_deck.js ["out.pptx"]
 * Требует пакет pptxgenjs (npm i pptxgenjs).
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT =
  process.argv[2] ||
  path.join(__dirname, "ТЗ-Ревьюер — промежуточная защита.pptx");
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
    fontFace: HEAD, fontSize: 29, bold: true, fit: "shrink",
    color: dark ? P.PAPER : P.INK,
  });
  if (opts.sub) {
    slide.addText(opts.sub, {
      x: MX, y: 1.56, w: CW, h: 0.32, isTextBox: true, margin: 0, valign: "top",
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

/* ---------------------------------------------------------------- Slide 1 */
{
  const s = pres.addSlide();
  bg(s, P.INK);
  s.addShape("roundRect", {
    x: MX, y: 1.5, w: 1.15, h: 1.15, rectRadius: 0.14,
    fill: { color: P.ACCENT }, line: { type: "none" },
  });
  s.addText("ТЗ", {
    x: MX, y: 1.5, w: 1.15, h: 1.15, isTextBox: true, margin: 0, align: "center", valign: "middle",
    fontFace: HEAD, fontSize: 30, bold: true, color: P.PAPER,
  });
  s.addText("ТЗ-Ревьюер", {
    x: MX, y: 2.95, w: CW, h: 1.05, isTextBox: true, margin: 0, valign: "top",
    fontFace: HEAD, fontSize: 52, bold: true, color: P.PAPER,
  });
  s.addText(
    "AI-инструмент для предварительного ревью технических заданий\nна разработку новых потоков и витрин данных",
    {
      x: MX, y: 4.02, w: CW, h: 0.95, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 17, color: "C6D2E2", lineSpacingMultiple: 1.15,
    }
  );
  s.addShape("line", { x: MX, y: 5.35, w: 5.2, h: 0, line: { color: P.STEEL, width: 1.5 } });
  s.addText(
    [
      { text: "Кейс МТС · продукт NET", options: { breakLine: true, bold: true, color: P.PAPER } },
      { text: "Команда 6 · промежуточная защита", options: { breakLine: true, color: "9FB0C6" } },
      { text: "AI Engineer: Кайаал Яхья · Караташоглу Фырат", options: { color: "9FB0C6" } },
    ],
    { x: MX, y: 5.55, w: CW, h: 1.2, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13.5, paraSpaceAfter: 4 }
  );
  s.addNotes(
    "Промежуточная защита. Проект — AI-инструмент предварительного ревью ТЗ на потоки и витрины данных: до передачи в разработку показывает аналитику потенциально проблемные места. Не заменяет аналитика и не выносит решение о готовности."
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
  s.addNotes(
    "Точной цифры в кейсе нет — показываем структуру издержек. Инструмент бьёт по первому множителю: снижает вероятность поздних циклов уточнения, перенося часть вопросов на этап до разработки."
  );
}

/* ---------------------------------------------------------------- Slide 3 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Пользователь и сценарий", "Второе мнение по ТЗ до передачи в разработку", {
    sub: "Основной пользователь — аналитик NET. Цель MVP: первичный проход по ТЗ за ≤ 2 минут (время замерим на реальных примерах).",
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
  s.addText("Дополнительное предварительное ревью, не замена аналитика", { x: MX + 0.3, y: 5.24, w: CW - 0.6, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 14, bold: true, color: P.INK });
  bullets(
    s,
    [
      "инструмент не выносит решение о готовности документа — это делает аналитик;",
      "вторичные пользователи: разработчик и тимлид — быстрый входной чек перед оценкой.",
    ],
    MX + 0.3, 5.62, CW - 0.6, 0.85, { size: 12.5, color: P.INK2, gap: 5 }
  );
  s.addNotes("Один основной пользователь — аналитик, который готовит ТЗ. Сценарий короткий, один экран. «≤ 2 минуты» — это цель MVP, не измеренный факт; замерим на реальных ТЗ к финалу.");
}

/* ---------------------------------------------------------------- Slide 4 */
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
  s.addText("Каждое замечание содержит дословную цитату из документа. Замечание без привязки к тексту отбрасывается.", {
    x: rx + 0.32, y: 4.55, w: rw - 0.64, h: 1.6, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13, color: "C6D2E2", lineSpacingMultiple: 1.2, fit: "shrink",
  });
  s.addNotes("Требования кейса. Главное отличие от «просто спросить LLM» — предметность и обязательная привязка к тексту.");
}

/* ---------------------------------------------------------------- Slide 5 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Техническое решение", "Пайплайн предварительного ревью");

  const stages = [
    ["Разбор документа", ".md / .txt / .docx с таблицами → разбивка на разделы"],
    ["Покрытие шаблона", "каких разделов канонического шаблона ТЗ не хватает"],
    ["LLM-ревью по рубрике", "19 доменных категорий + few-shot на реальных правках"],
    ["Эвристики (без LLM)", "заглушки, «и т.д.», поле без типа, расчёт без формулы"],
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
  s.addText("ПРОВАЙДЕР-НЕЗАВИСИМОСТЬ", { x: rx + 0.3, y: 2.2, w: rw - 0.6, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 1.5, color: P.AMBER });
  bullets(
    s,
    [
      "Anthropic API (Claude);",
      "OpenAI-совместимый: OpenRouter, локальный Ollama / vLLM, контур МТС;",
      "офлайн-режим — эвристики без внешних вызовов.",
    ],
    rx + 0.3, 2.62, rw - 0.6, 2.3, { size: 12, color: "D6DFEC", gap: 13, lsm: 1.08 }
  );
  s.addShape("line", { x: rx + 0.3, y: 4.55, w: rw - 0.6, h: 0, line: { color: P.STEEL, width: 1 } });
  s.addText("В КАЖДОМ ЗАМЕЧАНИИ", { x: rx + 0.3, y: 4.78, w: rw - 0.6, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1, color: P.AMBER });
  s.addText("раздел · цитата · критичность · что неясно · почему важно · что уточнить · вопрос аналитику", {
    x: rx + 0.3, y: 5.12, w: rw - 0.6, h: 1.7, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12.5, color: "D6DFEC", lineSpacingMultiple: 1.45, fit: "shrink",
  });
  s.addNotes("Ядро (пакет tz_reviewer) не зависит от интерфейса: для MVP выбрали Streamlit ради скорости демо, ядро можно обернуть в API/FastAPI позже. Стек: Python, Streamlit, CLI, pydantic-схема ответа.");
}

/* ---------------------------------------------------------------- Slide 6 */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Пример работы", "Формат замечания (структура вывода)");

  const lw = CW * 0.62 - 0.15;
  card(s, MX, 1.95, lw, 4.75, { fill: P.PAPER });
  const rows = [
    ["Раздел", "4. Логика загрузки"],
    ["Критичность", "blocker — без этого нельзя начинать разработку"],
    ["Цитата", "«Данные грузятся инкрементально по дате.»"],
    ["Что неясно", "Не указано поле-приращение и обработка опоздавших записей."],
    ["Почему важно", "Разработчик выберет поле сам — риск потери строк или дублей."],
    ["Что уточнить", "Поле watermark, окно перекрытия, поведение при повторном запуске."],
    ["Вопрос аналитику", "По какому полю считаем приращение и на сколько назад перечитываем?"],
  ];
  let y = 2.2;
  rows.forEach((r) => {
    s.addText(r[0].toUpperCase(), { x: MX + 0.28, y, w: 1.85, h: 0.62, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 9.5, bold: true, charSpacing: 1, color: P.ACCENT });
    s.addText(r[1], { x: MX + 2.2, y, w: lw - 2.5, h: 0.62, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, color: P.INK2, fit: "shrink" });
    y += 0.64;
  });

  const rx = MX + lw + 0.3;
  const rw = CW - lw - 0.3;
  card(s, rx, 1.95, rw, 2.3, { fill: P.MIST });
  s.addText("СВОДКА ПО ДОКУМЕНТУ (пример)", { x: rx + 0.26, y: 2.16, w: rw - 0.52, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.5, bold: true, charSpacing: 0.5, color: P.SLATE });
  s.addText(
    [
      { text: "🔴 3   ·   🟠 6   ·   🟡 4", options: { bold: true, color: P.INK, breakLine: true } },
      { text: "замечания по критичности", options: { color: P.SLATE } },
    ],
    { x: rx + 0.26, y: 2.56, w: rw - 0.52, h: 1.0, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13, lineSpacingMultiple: 1.3, paraSpaceAfter: 5 }
  );
  s.addText("Итог: есть блокирующие вопросы — рекомендуется уточнение. Инструмент не оценивает готовность ТЗ.", {
    x: rx + 0.26, y: 3.5, w: rw - 0.52, h: 0.7, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.5, italic: true, color: P.SLATE, fit: "shrink",
  });

  card(s, rx, 4.45, rw, 2.25, { fill: P.INK });
  s.addText("ОФЛАЙН-РЕЖИМ", { x: rx + 0.26, y: 4.66, w: rw - 0.52, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1, color: P.AMBER });
  s.addText("Без API-ключа инструмент всё равно даёт отчёт: эвристики и покрытие шаблона. Подходит для закрытого контура.", {
    x: rx + 0.26, y: 5.04, w: rw - 0.52, h: 1.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, color: "C6D2E2", lineSpacingMultiple: 1.22, fit: "shrink",
  });
  s.addNotes("Структура вывода — то, что инструмент реально формирует по каждому замечанию. Числа в сводке иллюстративные (для полного прогона с LLM). На демо: сырое ТЗ → замечания; доработанное ТЗ → меньше замечаний.");
}

/* ---------------------------------------------------------------- Slide 7  (NEW: статус) */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Статус", "Что уже работает");

  const lw = CW * 0.55;
  const blocks = [
    ["ГОТОВО", P.GREEN,
      "ядро и пайплайн · разбор .md / .txt / .docx · покрытие шаблона · рубрика 19 категорий · эвристики · офлайн-режим · отчёт md / html / json · Streamlit-демо · CLI · 12 автотестов"],
    ["В РАБОТЕ", P.AMBER,
      "прогон на реальном LLM (нужен доступ / ключ) · прогон на примерах ТЗ кейсодателя"],
    ["ДО ФИНАЛА", P.SLATE,
      "пост-проверка цитат · подсветка фрагмента в тексте · доработка промптов и few-shot · замер прокси-метрик · финальная демонстрация"],
  ];
  const hs = [1.8, 1.4, 1.6];
  let by = 1.95;
  blocks.forEach((b, i) => {
    s.addShape("roundRect", { x: MX, y: by, w: lw, h: hs[i], rectRadius: 0.08, fill: { color: i === 0 ? P.MIST : P.CARD }, line: { color: P.LINE, width: 1 } });
    s.addShape("ellipse", { x: MX + 0.26, y: by + 0.26, w: 0.16, h: 0.16, fill: { color: b[1] }, line: { type: "none" } });
    s.addText(b[0], { x: MX + 0.54, y: by + 0.16, w: lw - 0.8, h: 0.34, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 13, bold: true, charSpacing: 1.5, color: b[1] });
    s.addText(b[2], { x: MX + 0.54, y: by + 0.54, w: lw - 0.85, h: hs[i] - 0.68, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, color: P.INK2, lineSpacingMultiple: 1.32, fit: "shrink" });
    by += hs[i] + 0.22;
  });

  const rx = MX + lw + 0.35;
  const rw = CW - lw - 0.35;
  const ih = rw / (2000 / 1416);
  s.addShape("roundRect", { x: rx - 0.06, y: 1.89, w: rw + 0.12, h: ih + 0.12, rectRadius: 0.06, fill: { color: P.INK }, line: { type: "none" }, shadow: shadow() });
  s.addImage({ path: SHOT, x: rx, y: 1.95, w: rw, h: ih });
  s.addText("Реальный вывод инструмента: офлайн-режим, демо-ТЗ «поток загрузки услуг». Полный прогон с LLM даёт и блокеры.", {
    x: rx, y: 1.95 + ih + 0.2, w: rw, h: 1.2, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, italic: true, color: P.SLATE, lineSpacingMultiple: 1.25, fit: "shrink",
  });
  s.addNotes("Отвечает на вопрос жюри «что уже реально сделано». Скриншот — настоящий вывод cli.py --format html в офлайн-режиме, не макет.");
}

/* ---------------------------------------------------------------- Slide 8  (Качество и риски) */
{
  const s = pres.addSlide();
  bg(s, P.PAPER);
  header(s, "Качество и риски", "Как оцениваем и что может пойти не так");

  s.addText("КРИТЕРИИ УСПЕХА", { x: MX, y: 1.9, w: CW / 2 - 0.3, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1, color: P.INK });
  bullets(
    s,
    [
      "замечания указывают на места, которые реально стоит уточнить;",
      "каждое замечание привязано к фрагменту ТЗ (валидная цитата → ~100%);",
      "по замечанию видно: где, что не так, что дописать, какой вопрос задать;",
      "нет советов, не связанных с этим ТЗ.",
    ],
    MX, 2.3, CW / 2 - 0.3, 2.0, { size: 12.5, gap: 11 }
  );

  s.addText("ПРОКСИ-МЕТРИКИ — ЦЕЛЬ MVP (в кейсе порогов нет)", { x: MX, y: 4.15, w: CW / 2 - 0.3, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1, color: P.INK });
  const metrics = [
    ["Precision выдачи", "≥ 0.7"],
    ["Recall по известным правкам", "≥ 0.6"],
    ["Доля валидных цитат", "≥ 0.95"],
    ["Стабильность двух прогонов", "≥ 0.7"],
  ];
  metrics.forEach((m, i) => {
    const yy = 4.62 + i * 0.5;
    s.addShape("line", { x: MX, y: yy + 0.44, w: CW / 2 - 0.3, h: 0, line: { color: P.LINE, width: 1 } });
    s.addText(m[0], { x: MX, y: yy, w: CW / 2 - 1.4, h: 0.42, isTextBox: true, margin: 0, valign: "middle", fontFace: BODY, fontSize: 12, color: P.INK2 });
    s.addText(m[1], { x: MX + CW / 2 - 1.4, y: yy, w: 1.1, h: 0.42, isTextBox: true, margin: 0, align: "right", valign: "middle", fontFace: BODY, fontSize: 12, bold: true, color: P.GREEN });
  });

  const rx = MX + CW / 2 + 0.3;
  const rw = CW / 2 - 0.3;
  s.addShape("roundRect", { x: rx, y: 1.9, w: rw, h: 4.95, rectRadius: 0.08, fill: { color: P.MIST }, line: { color: P.LINE, width: 1 } });
  s.addText("КЛЮЧЕВЫЕ РИСКИ AI-РЕШЕНИЯ", { x: rx + 0.3, y: 2.14, w: rw - 0.6, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, charSpacing: 1, color: P.INK });
  const risks = [
    ["Ложноположительные замечания", "критичность, сортировка, фильтр; few-shot на реальных правках"],
    ["Слишком общие советы", "обязательная цитата в схеме; отбрасывание замечаний без привязки"],
    ["Пропуск важной проблемы", "эвристики поверх LLM; покрытие шаблона; «не заменяет аналитика»"],
    ["Данные не должны уходить наружу", "локальный эндпоинт / офлайн-режим; ключи только через окружение"],
  ];
  let ry = 2.62;
  risks.forEach((r) => {
    s.addText(r[0], { x: rx + 0.3, y: ry, w: rw - 0.6, h: 0.3, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12, bold: true, color: P.INK2 });
    s.addText("→ " + r[1], { x: rx + 0.3, y: ry + 0.32, w: rw - 0.6, h: 0.5, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 10.5, color: P.SLATE, lineSpacingMultiple: 1.12, fit: "shrink" });
    ry += 1.05;
  });
  s.addNotes("Порогов в кейсе нет — метрики это наши целевые ориентиры MVP для разговора с кейсодателем на финале.");
}

/* ---------------------------------------------------------------- Slide 9  (Команда и план) */
{
  const s = pres.addSlide();
  bg(s, P.INK);
  header(s, "Команда и план", "Команда 6 — распределение задач", { dark: true });

  const people = [
    ["Кайаал Яхья", ["LLM-пайплайн, промпты, структурированный вывод", "доменная рубрика и категории замечаний", "Streamlit-демо и сценарий демонстрации", "тестирование качества"]],
    ["Караташоглу Фырат", ["архитектура и сборка MVP", "разбор документа, эвристики, покрытие шаблона", "интеграция провайдеров LLM", "примеры ТЗ, прогоны, автотесты"]],
  ];
  const pw = (CW - 0.4) / 2;
  people.forEach((p, i) => {
    const x = MX + i * (pw + 0.4);
    s.addShape("roundRect", { x, y: 2.0, w: pw, h: 2.7, rectRadius: 0.08, fill: { color: P.INK2 }, line: { color: P.STEEL, width: 1 } });
    s.addText(p[0], { x: x + 0.3, y: 2.24, w: pw - 0.6, h: 0.42, isTextBox: true, margin: 0, valign: "top", fontFace: HEAD, fontSize: 18, bold: true, color: P.PAPER });
    s.addText("AI Engineer · участие 50%", { x: x + 0.3, y: 2.66, w: pw - 0.6, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11.5, bold: true, color: P.AMBER });
    bullets(s, p[1], x + 0.3, 3.1, pw - 0.6, 1.5, { size: 12.5, color: "CBD6E5", gap: 10 });
  });

  s.addShape("roundRect", { x: MX, y: 5.05, w: CW, h: 1.5, rectRadius: 0.08, fill: { color: P.INK2 }, line: { type: "none" } });
  s.addText("ДО ФИНАЛА", { x: MX + 0.3, y: 5.26, w: 2.4, h: 0.32, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2, color: P.AMBER });
  s.addText(
    "прогон на примерах кейсодателя · пост-проверка цитат · подсветка фрагмента в тексте · доработка промптов · замер метрик · финальная демонстрация",
    { x: MX + 0.3, y: 5.62, w: CW - 0.6, h: 0.8, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12.5, color: "D6DFEC", lineSpacingMultiple: 1.25, fit: "shrink" }
  );
  s.addText("Архитектурные решения и оценка качества — совместно.", { x: MX, y: 6.75, w: CW, h: 0.3, isTextBox: true, margin: 0, align: "center", valign: "top", fontFace: BODY, fontSize: 10.5, italic: true, color: "8FA0B6" });
  s.addNotes("50/50, работа совместная. Распределение уточните под реальный вклад — меняется в одном месте (этот слайд и docs/project-description.md).");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("Готово:", f));
