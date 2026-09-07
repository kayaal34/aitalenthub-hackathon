/*
 * Demo Day питч — «ТЗ-Ревьюер» (кейс МТС, продукт NET).
 * 8 слайдов, минимум текста, максимум реальных скриншотов.
 * Генерация: node build_pitch_deck.js
 */
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.join(__dirname, "ТЗ-Ревьюер — питч Demo Day.pptx");
const A = (n) => path.join(__dirname, "assets", n);

const P = {
  INK: "0E1B2E",
  INK2: "1B2E4A",
  PAPER: "FFFFFF",
  MIST: "F4F7FA",
  ACCENT: "E5534B",
  AMBER: "C8791A",
  GOLD: "C9A227",
  SLATE: "5A6678",
  GREEN: "2E7D5B",
  LINE: "E2E8F0",
  DIM: "9FB0C7",
};
const HEAD = "Cambria";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Команда 6";
pres.company = "AI Talent Hub — кейс МТС";

const MX = 0.72;
const CW = 13.3 - MX * 2;
const shadow = () => ({ type: "outer", color: "8FA0B5", blur: 14, offset: 4, angle: 90, opacity: 0.28 });

let pageNo = 0;
function chrome(s, dark) {
  pageNo += 1;
  if (pageNo === 1) return;
  s.addText(String(pageNo).padStart(2, "0"), {
    x: 13.3 - MX - 0.6, y: 0.6, w: 0.6, h: 0.32, isTextBox: true, margin: 0,
    align: "right", valign: "top", fontFace: BODY, fontSize: 12,
    charSpacing: 1, color: dark ? "4A6280" : "C3CDD9",
  });
}

function head(s, kicker, title, dark) {
  if (kicker) {
    s.addText(kicker.toUpperCase(), {
      x: MX, y: 0.62, w: CW, h: 0.3, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 4,
      color: dark ? P.GOLD : P.ACCENT,
    });
  }
  s.addText(title, {
    x: MX, y: kicker ? 1.0 : 0.7, w: CW, h: 1.0, isTextBox: true, margin: 0, valign: "top",
    fontFace: HEAD, fontSize: 32, bold: true, fit: "shrink",
    color: dark ? P.PAPER : P.INK, lineSpacingMultiple: 1.06,
  });
}

function shot(s, file, ratio, opts) {
  const w = opts.w;
  const h = w / ratio;
  const x = opts.x !== undefined ? opts.x : (13.3 - w) / 2;
  const y = opts.y;
  s.addShape("roundRect", {
    x: x - 0.05, y: y - 0.05, w: w + 0.1, h: h + 0.1, rectRadius: 0.05,
    fill: { color: P.PAPER }, line: { color: P.LINE, width: 1 }, shadow: shadow(),
  });
  s.addImage({ path: A(file), x, y, w, h });
  return y + h;
}

/* ===================================================== 1 · Титул */
{
  const s = pres.addSlide();
  s.background = { color: P.INK };

  s.addShape("rect", { x: 0, y: 0, w: 13.3, h: 0.09, fill: { color: P.GOLD }, line: { type: "none" } });

  s.addText("AI TALENT HUB  ·  КЕЙС МТС  ·  ПРОДУКТ NET", {
    x: MX, y: 1.55, w: CW, h: 0.35, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 13, bold: true, charSpacing: 4, color: P.GOLD,
  });

  s.addText("ТЗ-Ревьюер", {
    x: MX, y: 2.15, w: CW, h: 1.35, isTextBox: true, margin: 0, valign: "top",
    fontFace: HEAD, fontSize: 66, bold: true, color: P.PAPER,
  });

  s.addText("AI-ревьюер технических заданий для аналитика", {
    x: MX, y: 3.55, w: CW, h: 0.55, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 27, color: P.DIM,
  });

  s.addShape("rect", { x: MX, y: 4.65, w: 2.0, h: 0.03, fill: { color: P.GOLD }, line: { type: "none" } });

  s.addText("КОМАНДА 6", {
    x: MX, y: 5.0, w: CW, h: 0.3, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 12, bold: true, charSpacing: 3, color: "6E8299",
  });
  s.addText(
    [
      { text: "Кайаал Яхья", options: { bold: true, color: P.PAPER, fontSize: 24 } },
      { text: "   AI Engineer", options: { color: P.DIM, fontSize: 18 } },
    ],
    { x: MX, y: 5.4, w: CW, h: 0.42, isTextBox: true, margin: 0, valign: "top", fontFace: BODY }
  );
  s.addText(
    [
      { text: "Караташоглу Фырат", options: { bold: true, color: P.PAPER, fontSize: 24 } },
      { text: "   AI Engineer", options: { color: P.DIM, fontSize: 18 } },
    ],
    { x: MX, y: 5.9, w: CW, h: 0.42, isTextBox: true, margin: 0, valign: "top", fontFace: BODY }
  );
  chrome(s, true);
  s.addNotes("0:00–0:30. Здравствуйте! Мы создали ТЗ-Ревьюер для аналитика продукта NET — инструмент, который находит в техническом задании места, непонятные разработчику, ещё до передачи задачи в разработку.");
}

/* ===================================================== 2 · Проблема */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "проблема", "Неточность в ТЗ находят уже на разработке");

  const steps = ["ТЗ готово", "Разработка", "Неоднозначность", "Возврат", "Переделка"];
  const gap = 0.28;
  const bw = (CW - gap * 4) / 5;
  steps.forEach((t, i) => {
    const x = MX + i * (bw + gap);
    const hot = i >= 2;
    s.addShape("roundRect", {
      x, y: 2.75, w: bw, h: 1.35, rectRadius: 0.1,
      fill: { color: hot ? "FCEDEB" : P.MIST },
      line: { color: hot ? P.ACCENT : P.LINE, width: hot ? 1.5 : 1 },
    });
    s.addText(t, {
      x: x + 0.08, y: 2.75, w: bw - 0.16, h: 1.35, isTextBox: true, margin: 0,
      align: "center", valign: "middle", fontFace: BODY, fontSize: 19, bold: true,
      color: hot ? "8C2F27" : P.INK2, fit: "shrink",
    });
    if (i < 4) {
      s.addText("›", {
        x: x + bw, y: 2.75, w: gap, h: 1.35, isTextBox: true, margin: 0,
        align: "center", valign: "middle", fontFace: BODY, fontSize: 24, bold: true, color: "C3CDD9",
      });
    }
  });

  s.addText("Каждый возврат — это пересогласование, переделка и повторное тестирование.", {
    x: MX, y: 4.75, w: CW, h: 0.8, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 26, color: P.SLATE, lineSpacingMultiple: 1.2,
  });
  chrome(s);
  s.addNotes("0:30–1:00. Сейчас техзадание вычитывают вручную. Часть неточностей всё равно доходит до разработки — и тогда документ возвращают аналитику, требования пересогласовывают, реализацию переделывают. Наш инструмент показывает эти места раньше, пока документ ещё у аналитика.");
}

/* ===================================================== 3 · Интерфейс (вход) */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "интерфейс", "Один экран: настройки слева, документ справа");
  shot(s, "full-input.png", 3000 / 1480, { w: 10.6, y: 1.95 });
  chrome(s);
  s.addNotes("Слева выбирается провайдер, модель, ключ и base URL — инструмент не привязан к одной модели. Справа три способа подать ТЗ: вставить текст, загрузить файл, взять пример.");
}

/* ===================================================== 4 · Сценарий */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "демо", "Загрузил ТЗ — получил замечания с цитатами");

  const flow = ["Аналитик\nзагружает ТЗ", "Нажимает\n«Проверить»", "Разбор → шаблон\n→ LLM", "Замечания\nс цитатами"];
  const gap = 0.3;
  const bw = (CW - gap * 3) / 4;
  flow.forEach((t, i) => {
    const x = MX + i * (bw + gap);
    const last = i === 3;
    s.addShape("roundRect", {
      x, y: 2.25, w: bw, h: 1.35, rectRadius: 0.1,
      fill: { color: last ? "E9F4EF" : P.MIST },
      line: { color: last ? P.GREEN : P.LINE, width: last ? 1.5 : 1 },
    });
    s.addText(t, {
      x: x + 0.1, y: 2.25, w: bw - 0.2, h: 1.35, isTextBox: true, margin: 0,
      align: "center", valign: "middle", fontFace: BODY, fontSize: 18, bold: true,
      color: last ? "1F5C44" : P.INK2, lineSpacingMultiple: 1.15, fit: "shrink",
    });
    if (i < 3) {
      s.addText("›", {
        x: x + bw, y: 2.25, w: gap, h: 1.35, isTextBox: true, margin: 0,
        align: "center", valign: "middle", fontFace: BODY, fontSize: 24, bold: true, color: "C3CDD9",
      });
    }
  });

  shot(s, "ui-result.png", 2160 / 620, { w: 11.4, y: 4.1 });
  chrome(s);
  s.addNotes("1:00–3:10 — живое демо. План Б: этот и следующие слайды содержат настоящие экраны инструмента.");
}

/* ===================================================== 4 · Находка-герой */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "что находит · 1", "Противоречие внутри одного документа");
  shot(s, "llm-output.png", 1316 / 497, { w: 11.4, y: 2.2 });
  chrome(s);
  s.addNotes("Ключевое доказательство: два раздела одного ТЗ требуют разной задержки. Инструмент привёл обе цитаты и задал вопрос аналитику.");
}

/* ===================================================== 5 · Блокеры */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "интерфейс", "Каждое замечание раскрывается до цитаты и вопроса");
  shot(s, "ui-findings.png", 2120 / 990, { w: 10.6, y: 2.2 });
  chrome(s);
  s.addNotes("Настоящий экран инструмента: список замечаний с фильтром по категории, раскрытое замечание с цитатой, объяснением и вопросом аналитику.");
}

/* ===================================================== 6 · Покрытие */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "второй результат", "Проверка структуры по официальному шаблону МТС");
  shot(s, "ui-coverage.png", 2120 / 780, { w: 11.0, y: 2.4 });
  chrome(s);
  s.addNotes("Кроме замечаний инструмент детерминированно проверяет 21 раздел шаблона: заполнен, пустой, помечен «не применимо», упомянут вне раздела или не найден.");
}

/* ===================================================== 7 · Архитектура */
{
  const s = pres.addSlide();
  s.background = { color: P.PAPER };
  head(s, "архитектура", "Три слоя — и LLM только один из них");

  const layers = [
    ["01", "Разбор документа", "Word и Markdown →\nразделы и таблицы", false],
    ["02", "Критерии МТС", "21 раздел шаблона +\n8 требований кейса", false],
    ["03", "LLM-ревью", "23 категории,\nобязательная цитата", true],
  ];
  const gap = 0.34;
  const bw = (CW - gap * 2) / 3;
  layers.forEach((l, i) => {
    const x = MX + i * (bw + gap);
    s.addShape("roundRect", {
      x, y: 2.3, w: bw, h: 2.35, rectRadius: 0.1,
      fill: { color: l[3] ? "FBF3E4" : P.MIST },
      line: { color: l[3] ? P.AMBER : P.LINE, width: l[3] ? 1.5 : 1 },
    });
    s.addText(l[0], {
      x: x + 0.28, y: 2.52, w: bw - 0.56, h: 0.42, isTextBox: true, margin: 0, valign: "top",
      fontFace: HEAD, fontSize: 22, bold: true, color: l[3] ? P.AMBER : "B9C4D2",
    });
    s.addText(l[1], {
      x: x + 0.28, y: 3.0, w: bw - 0.56, h: 0.4, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 21, bold: true, color: P.INK,
    });
    s.addText(l[2], {
      x: x + 0.28, y: 3.48, w: bw - 0.56, h: 0.95, isTextBox: true, margin: 0, valign: "top",
      fontFace: BODY, fontSize: 17, color: P.SLATE, lineSpacingMultiple: 1.2,
    });
  });

  s.addText("Структуру и критерии проверяет код. Без доступа к модели инструмент продолжает работать.", {
    x: MX, y: 5.25, w: CW, h: 0.85, isTextBox: true, margin: 0, valign: "top",
    fontFace: BODY, fontSize: 24, color: P.INK2, lineSpacingMultiple: 1.2,
  });
  chrome(s);
  s.addNotes("3:10–4:10. Первые два слоя — обычный код, детерминированы и воспроизводимы. LLM отвечает только за смысл, и каждое его замечание обязано содержать дословную цитату, иначе отбрасывается. Провайдера меняли на живой Gemini без единой правки кода.");
}

/* ===================================================== 8 · Итог */
{
  const s = pres.addSlide();
  s.background = { color: P.INK };
  head(s, "готовность", "Прототип работает — следующий шаг пилот", true);

  const cols = [
    ["ИЗМЕРЕНО", ["3 реальных ТЗ", "20 замечаний с цитатой", "73 автотеста"], P.GREEN],
    ["ПОКА ГИПОТЕЗА", ["precision / recall", "эффект на уточнениях"], P.AMBER],
    ["СЛЕДУЮЩИЙ ШАГ", ["правки от NET", "пилот с аналитиками"], P.GOLD],
  ];
  const gap = 0.34;
  const bw = (CW - gap * 2) / 3;
  cols.forEach((c, i) => {
    const x = MX + i * (bw + gap);
    s.addShape("roundRect", { x, y: 2.25, w: bw, h: 2.3, rectRadius: 0.1, fill: { color: P.INK2 }, line: { color: "27405F", width: 1 } });
    s.addText(c[0], { x: x + 0.28, y: 2.48, w: bw - 0.56, h: 0.35, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 12.5, bold: true, charSpacing: 2.5, color: c[2] });
    s.addText(
      c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.28, y: 2.95, w: bw - 0.56, h: 1.45, isTextBox: true, margin: 0, valign: "top", fontFace: BODY, fontSize: 18, color: "D6DFEC", lineSpacingMultiple: 1.18, paraSpaceAfter: 8 }
    );
  });

  s.addShape("roundRect", { x: MX, y: 5.0, w: CW, h: 1.5, rectRadius: 0.1, fill: { color: "162944" }, line: { color: P.GOLD, width: 1.5 } });
  s.addText("Мы находим в реальных ТЗ противоречия, которые люди пропускают. Чтобы измерить эффект, нужны реальные правки NET — и мы готовы к пилоту.", {
    x: MX + 0.45, y: 5.0, w: CW - 0.9, h: 1.5, isTextBox: true, margin: 0, valign: "middle",
    fontFace: BODY, fontSize: 22, bold: true, color: P.PAPER, lineSpacingMultiple: 1.22,
  });
  chrome(s, true);
  s.addNotes("4:10–5:00. Финальная фраза читается дословно, 12–15 секунд.");
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("Готово:", f));
