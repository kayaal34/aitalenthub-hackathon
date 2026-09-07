/*
 * Demo Day питч — «ТЗ-Ревьюер» (кейс МТС, продукт NET).
 * 7 слайдов, кегль >= 24-30pt, заголовок = вывод.
 * Генерация: node build_pitch_deck.js
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.join(__dirname, "ТЗ-Ревьюер — питч Demo Day.pptx");
const SHOT_LLM = path.join(__dirname, "assets", "llm-output.png");

const P = {
  INK: "13223B", INK2: "1E3252", PAPER: "FFFFFF", MIST: "EEF2F7",
  STEEL: "3E5C76", SLATE: "566173", ACCENT: "E5534B", AMBER: "D98324",
  GREEN: "2E7D5B", GREY: "8A8F98", LINE: "D4DCE6",
};
const HEAD = "Cambria";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Команда 6";
pres.company = "AI Talent Hub — кейс МТС";

const MX = 0.62;
const CW = 13.3 - MX * 2;

const shadow = () => ({ type: "outer", color: "AAB4C0", blur: 10, offset: 3, angle: 90, opacity: 0.3 });

function head(s, title, dark) {
  s.addText(title, {
    x: MX, y: 0.5, w: CW, h: 1.0, isTextBox: true, margin: 0, valign: "top",
    fontFace: HEAD, fontSize: 33, bold: true, fit: "shrink",
    color: dark ? P.PAPER : P.INK, lineSpacingMultiple: 1.05,
  });
}

/* ============================================ 1. Продукт */
{
  const s = pres.addSlide();
  s.background = { color: P.INK };
  s.addText("AI TALENT HUB · КЕЙС МТС · КОМАНДА 6", {
    x: MX, y: 1.5, w: CW, h: 0.4, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 16, bold: true, charSpacing: 3, color: P.AMBER,
  });
  s.addText("ТЗ-Ревьюер", {
    x: MX, y: 2.0, w: CW, h: 1.2, isTextBox: true, margin: 0, valign: "top",
    fontFace: HEAD, fontSize: 60, bold: true, color: P.PAPER,
  });
  s.addText("AI-ревьюер технических заданий для аналитика продукта NET", {
    x: MX, y: 3.3, w: CW, h: 0.6, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 30, color: "D6DFEC",
  });
  s.addText("Находит в тексте места, которые разработчик поймёт неоднозначно, — до передачи задачи в разработку.", {
    x: MX, y: 4.0, w: CW * 0.86, h: 1.0, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 26, color: "9FB0C7", lineSpacingMultiple: 1.25, fit: "shrink",
  });
  s.addText("Кайаал Яхья · Караташоглу Фырат — AI Engineers", {
    x: MX, y: 6.4, w: CW, h: 0.4, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 18, color: P.GREY,
  });
  s.addNotes("0:00–0:30. Мы создали ТЗ-Ревьюер для аналитика продукта NET, который находит в техническом задании места, непонятные разработчику, — до передачи задачи в разработку.");
}

/* ============================================ 2. Проблема */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "Неточность в ТЗ находят уже на разработке — и цикл начинается заново");

  const steps = ["Аналитик\nпишет ТЗ", "Передача\nв разработку", "Вопрос или\nнеоднозначность", "Возврат\nаналитику", "Пересогласование\nи переделка"];
  const gap = 0.26;
  const bw = (CW - gap * (steps.length - 1)) / steps.length;
  steps.forEach((t, i) => {
    const x = MX + i * (bw + gap);
    const hot = i >= 2;
    s.addShape("roundRect", {
      x, y: 2.35, w: bw, h: 1.5, rectRadius: 0.1,
      fill: { color: hot ? "FBE9E7" : P.MIST },
      line: { color: hot ? P.ACCENT : P.LINE, width: hot ? 1.5 : 1 },
    });
    s.addText(t, {
      x: x + 0.1, y: 2.35, w: bw - 0.2, h: 1.5, isTextBox: true, margin: 0,
      align: "center", valign: "middle", fontFace: BODY, fontSize: 17, bold: true,
      color: hot ? "8C2F27" : P.INK2, lineSpacingMultiple: 1.15, fit: "shrink",
    });
    if (i < steps.length - 1) {
      s.addText("›", {
        x: x + bw, y: 2.35, w: gap, h: 1.5, isTextBox: true, margin: 0,
        align: "center", valign: "middle", fontFace: BODY, fontSize: 22, bold: true, color: P.GREY,
      });
    }
  });

  s.addText("Каждое такое возвращение — это пересогласование требований, переделка реализации и повторное тестирование.", {
    x: MX, y: 4.35, w: CW, h: 0.9, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 28, color: P.INK2, lineSpacingMultiple: 1.25, fit: "shrink",
  });
  s.addText("Ручное ревью помогает, но зависит от опыта и загрузки конкретного человека.", {
    x: MX, y: 5.45, w: CW, h: 0.7, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 24, italic: true, color: P.SLATE, fit: "shrink",
  });
  s.addNotes("0:30–0:50. Сейчас ТЗ вычитывают вручную. Часть неточностей всё равно доходит до разработки, и тогда запускается дорогой цикл: возврат, пересогласование, переделка, повторное тестирование.");
}

/* ============================================ 3. Демо-сценарий */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "Один сценарий: от документа до конкретного замечания");

  const flow = [
    ["ВХОД", "Аналитик открывает\nготовое ТЗ"],
    ["ДЕЙСТВИЕ", "Загружает файл\nи нажимает «Проверить»"],
    ["СИСТЕМА", "Разбор → шаблон МТС\n→ LLM-ревью"],
    ["РЕЗУЛЬТАТ", "Список замечаний\nс цитатами из текста"],
  ];
  const gap = 0.3;
  const bw = (CW - gap * 3) / 4;
  flow.forEach((f, i) => {
    const x = MX + i * (bw + gap);
    const last = i === 3;
    s.addShape("roundRect", {
      x, y: 2.3, w: bw, h: 2.0, rectRadius: 0.12,
      fill: { color: last ? "E8F3EE" : P.MIST },
      line: { color: last ? P.GREEN : P.LINE, width: last ? 1.5 : 1 },
    });
    s.addText(f[0], {
      x: x + 0.18, y: 2.5, w: bw - 0.36, h: 0.35, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 14, bold: true, charSpacing: 2,
      color: last ? P.GREEN : P.ACCENT,
    });
    s.addText(f[1], {
      x: x + 0.18, y: 2.95, w: bw - 0.36, h: 1.2, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 20, bold: true, color: P.INK2, lineSpacingMultiple: 1.2, fit: "shrink",
    });
    if (i < 3) {
      s.addText("›", {
        x: x + bw, y: 2.3, w: gap, h: 2.0, isTextBox: true, margin: 0,
        align: "center", valign: "middle", fontFace: BODY, fontSize: 24, bold: true, color: P.GREY,
      });
    }
  });

  s.addShape("roundRect", { x: MX, y: 4.7, w: CW, h: 1.5, rectRadius: 0.12, fill: { color: P.INK }, line: { type: "none" } });
  s.addText("Каждое замечание: дословная цитата → что неясно → почему важно для разработки → вопрос аналитику", {
    x: MX + 0.4, y: 4.7, w: CW - 0.8, h: 1.5, isTextBox: true, margin: 0, valign: "middle",
    fontFace: BODY, fontSize: 28, color: P.PAPER, lineSpacingMultiple: 1.2, fit: "shrink",
  });
  s.addNotes("1:00–3:10 — живое демо. Показать: берём реальный документ кейсодателя, нажимаем «Проверить ТЗ», получаем список замечаний. Раскрыть одно замечание целиком. План Б — скриншоты со следующего слайда.");
}

/* ============================================ 4. Доказательство */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "Нашёл противоречие внутри одного документа");

  const iw = 11.0;
  const ih = iw * (497 / 1316);
  const ix = (13.3 - iw) / 2;
  const iy = 1.8;
  s.addShape("roundRect", { x: ix - 0.07, y: iy - 0.07, w: iw + 0.14, h: ih + 0.14, rectRadius: 0.08, fill: { color: P.PAPER }, line: { color: P.LINE, width: 1 }, shadow: shadow() });
  s.addImage({ path: SHOT_LLM, x: ix, y: iy, w: iw, h: ih });

  s.addText("Настоящий вывод на документе кейсодателя, режим LLM. Два раздела одного ТЗ требуют разной задержки — при чтении это легко пропустить.", {
    x: MX, y: 6.15, w: CW, h: 1.0, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 22, color: P.INK2, lineSpacingMultiple: 1.25,
  });
  s.addNotes("Ключевое доказательство. Это не общий совет, а конкретное место в тексте: инструмент привёл цитату, объяснил риск и сформулировал вопрос аналитику.");
}

/* ============================================ 5. Архитектура */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "Три слоя — и LLM только один из них");

  const layers = [
    ["1 · РАЗБОР ДОКУМЕНТА", "Word и Markdown →\nразделы и таблицы", "код"],
    ["2 · КРИТЕРИИ МТС", "21 раздел шаблона +\n8 требований кейсодателя", "код"],
    ["3 · LLM-РЕВЬЮ", "23 категории,\nобязательная цитата", "модель"],
  ];
  const gap = 0.3;
  const bw = (CW - gap * 2) / 3;
  layers.forEach((l, i) => {
    const x = MX + i * (bw + gap);
    const isLlm = i === 2;
    s.addShape("roundRect", {
      x, y: 2.1, w: bw, h: 2.5, rectRadius: 0.12,
      fill: { color: isLlm ? "FDF3E3" : P.MIST },
      line: { color: isLlm ? P.AMBER : P.LINE, width: isLlm ? 1.5 : 1 },
    });
    s.addText(l[0], {
      x: x + 0.22, y: 2.32, w: bw - 0.44, h: 0.4, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 14, bold: true, charSpacing: 1.5, color: isLlm ? "7A4B00" : P.ACCENT,
    });
    s.addText(l[1], {
      x: x + 0.22, y: 2.8, w: bw - 0.44, h: 1.05, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 21, bold: true, color: P.INK2, lineSpacingMultiple: 1.18,
    });
    s.addText(l[2] === "код" ? "детерминированно" : "смысл и формулировки", {
      x: x + 0.22, y: 4.02, w: bw - 0.44, h: 0.35, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 15, italic: true, color: P.SLATE,
    });
  });

  s.addShape("roundRect", { x: MX, y: 4.95, w: CW, h: 1.7, rectRadius: 0.12, fill: { color: P.INK }, line: { type: "none" } });
  s.addText(
    [
      { text: "Почему так: ", options: { bold: true, color: P.AMBER } },
      { text: "структуру и критерии проверяет код, LLM отвечает только за смысл. Без доступа к модели инструмент продолжает работать. Ограничение: текст, не сканы.", options: { color: "D6DFEC" } },
    ],
    { x: MX + 0.4, y: 4.95, w: CW - 0.8, h: 1.7, isTextBox: true, margin: 0, valign: "middle", fontFace: BODY, fontSize: 23, lineSpacingMultiple: 1.22 }
  );
  s.addNotes("3:10–4:10. Два слоя из трёх — обычный код, они детерминированы и воспроизводимы. LLM отвечает только за смысловые вещи. Это же даёт страховку: если модели нет, первые два слоя работают.");
}

/* ============================================ 6. Метрики */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "Что измерено, а что пока гипотеза");

  const colW = (CW - 0.4) / 2;

  s.addShape("roundRect", { x: MX, y: 2.05, w: colW, h: 3.75, rectRadius: 0.12, fill: { color: "E8F3EE" }, line: { color: P.GREEN, width: 1.5 } });
  s.addText("ИЗМЕРЕНО", { x: MX + 0.35, y: 2.3, w: colW - 0.7, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 16, bold: true, charSpacing: 2, color: P.GREEN });
  s.addText(
    [
      { text: "3 реальных ТЗ — без сбоев", options: { bullet: true, breakLine: true } },
      { text: "20 замечаний, все с цитатой", options: { bullet: true, breakLine: true } },
      { text: "смена провайдера без правок кода", options: { bullet: true, breakLine: true } },
      { text: "73 автотеста проходят", options: { bullet: true } },
    ],
    { x: MX + 0.35, y: 2.85, w: colW - 0.7, h: 2.75, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 21, color: P.INK2, lineSpacingMultiple: 1.15, paraSpaceAfter: 9 }
  );

  const rx = MX + colW + 0.4;
  s.addShape("roundRect", { x: rx, y: 2.05, w: colW, h: 3.75, rectRadius: 0.12, fill: { color: "FDF3E3" }, line: { color: P.AMBER, width: 1.5 } });
  s.addText("ПОКА ГИПОТЕЗА", { x: rx + 0.35, y: 2.3, w: colW - 0.7, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 16, bold: true, charSpacing: 2, color: "7A4B00" });
  s.addText(
    [
      { text: "precision / recall — нужна разметка", options: { bullet: true, breakLine: true } },
      { text: "снижение поздних уточнений — нужен пилот", options: { bullet: true, breakLine: true } },
      { text: "качество проверено вручную, не в цифрах", options: { bullet: true } },
    ],
    { x: rx + 0.35, y: 2.85, w: colW - 0.7, h: 2.75, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 21, color: P.INK2, lineSpacingMultiple: 1.15, paraSpaceAfter: 9 }
  );

  s.addText("Мы честно разделяем проверенное и непроверенное — и знаем, чем закрыть вторую колонку.", {
    x: MX, y: 6.1, w: CW, h: 0.7, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 22, italic: true, color: P.SLATE,
  });
  s.addNotes("Разделяем измеренное и гипотезу. Для точных метрик нужна размеченная экспертом выборка и реальные правки разработчиков NET.");
}

/* ============================================ 7. Финал */
{
  const s = pres.addSlide();
  s.background = { color: P.INK };
  head(s, "Прототип работает — следующий шаг пилот на реальных правках NET", true);

  const cols = [
    ["СДЕЛАНО", ["инструмент: веб и CLI", "3 документа кейсодателя", "код открыт, тесты зелёные"]],
    ["ПРОВЕРЕНО", ["все замечания с цитатой", "смена провайдера без правок", "офлайн-режим как страховка"]],
    ["СЛЕДУЮЩИЙ ШАГ", ["10–15 реальных ТЗ от NET", "измерить precision", "тест с 2–3 аналитиками"]],
  ];
  const gap = 0.3;
  const bw = (CW - gap * 2) / 3;
  cols.forEach((c, i) => {
    const x = MX + i * (bw + gap);
    const accent = i === 2 ? P.AMBER : "8FA8C2";
    s.addShape("roundRect", { x, y: 2.15, w: bw, h: 2.6, rectRadius: 0.12, fill: { color: P.INK2 }, line: { color: i === 2 ? P.AMBER : "2E4767", width: 1 } });
    s.addText(c[0], { x: x + 0.25, y: 2.36, w: bw - 0.5, h: 0.4, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 15, bold: true, charSpacing: 2, color: accent });
    s.addText(
      c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.25, y: 2.84, w: bw - 0.5, h: 1.75, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 18, color: "D6DFEC", lineSpacingMultiple: 1.15, paraSpaceAfter: 7 }
    );
  });

  s.addShape("roundRect", { x: MX, y: 5.05, w: CW, h: 1.6, rectRadius: 0.12, fill: { color: "20385C" }, line: { color: P.AMBER, width: 1.5 } });
  s.addText("ТЗ-Ревьюер уже находит в реальных ТЗ противоречия, которые люди пропускают при чтении. Чтобы измерить эффект, нам нужны реальные правки разработчиков NET — и мы готовы к пилоту.", {
    x: MX + 0.4, y: 5.05, w: CW - 0.8, h: 1.6, isTextBox: true, margin: 0, valign: "middle",
    fontFace: BODY, fontSize: 22, bold: true, color: P.PAPER, lineSpacingMultiple: 1.2,
  });
  s.addNotes("4:10–5:00. Финальная фраза читается дословно, 12–15 секунд. Ценность + что доказано + следующий шаг + запрос.");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("Готово:", f));
