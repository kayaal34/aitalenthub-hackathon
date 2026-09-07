/*
 * Питч — что говорить (5 минут). Word-файл.
 * node build_pitch_script.js   (требует пакет docx)
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
} = require("docx");

const OUT = path.join(__dirname, "Питч — что говорить (5 минут).docx");
const ACCENT = "1F4E79";
const AMBER = "A85E00";
const GRAY = "6B7280";

const blocks = [
  {
    time: "0:00 – 0:30",
    title: "Продукт",
    slide: "Слайд 1 · Титул",
    cue: "формула: продукт → пользователь → проблема",
    lines: [
      "Здравствуйте! Мы создали ТЗ-Ревьюер для аналитика продукта NET — инструмент, который находит в техническом задании места, непонятные разработчику, ещё до передачи задачи в разработку.",
    ],
  },
  {
    time: "0:30 – 1:00",
    title: "Ценность",
    slide: "Слайд 2 · Проблема",
    cue: "что меняется в процессе",
    lines: [
      "Сейчас техзадание вычитывают вручную. Часть неточностей всё равно доходит до разработки — и тогда документ возвращают аналитику, требования пересогласовывают, реализацию переделывают, тесты проходят заново.",
      "Наш инструмент показывает эти места раньше — пока документ ещё у аналитика.",
    ],
  },
  {
    time: "1:00 – 3:10",
    title: "Демо — один сценарий",
    slide: "Слайды 3–6 · Экран, находка, интерфейс, покрытие",
    cue: "самая большая часть питча — 2 минуты 10 секунд",
    demo: [
      ["[открываю приложение]", "Вот интерфейс. Аналитик берёт готовое ТЗ — возьмём настоящий документ кейсодателя, поток геолокации абонентов."],
      ["[нажимаю «Проверить ТЗ»]", "Загружаю и запускаю проверку."],
      ["[пока идёт анализ]", "Сейчас инструмент разбирает документ на разделы, сверяет структуру с официальным шаблоном МТС и отправляет текст в модель."],
      ["[результат появился]", "Готово. Двадцать замечаний: шесть блокирующих, одиннадцать существенных. И отдельно — покрытие шаблона: каких обязательных разделов не хватает."],
      ["[раскрываю замечание о задержке]", "Вот главное. В одном разделе документа написано «задержка меньше минуты». В другом — «стриминг в реальном времени, задержка около нуля секунд». Это противоречие внутри одного ТЗ. Инструмент привёл обе цитаты, объяснил риск — неоднозначный SLA ведёт к неверному выбору архитектуры — и сформулировал вопрос аналитику: какое требование верное."],
      ["[возвращаюсь к списку]", "Каждое замечание устроено одинаково: дословная цитата, что неясно, почему это важно для разработки и какой вопрос задать. Это не общий совет — это конкретное место в тексте."],
      ["[кнопка выгрузки]", "Отчёт выгружается в Markdown — аналитик вставляет его в задачу и правит документ до передачи в разработку."],
    ],
  },
  {
    time: "3:10 – 4:10",
    title: "Техника",
    slide: "Слайд 7 · Архитектура",
    cue: "защищаем выбор решения, а не перечисляем стек",
    lines: [
      "Внутри три слоя. Первый — разбор документа: Word и Markdown превращаются в разделы и таблицы. Второй — проверка по официальным критериям: двадцать один раздел шаблона МТС и восемь требований, которые прислал кейсодатель. Третий — LLM-ревью по двадцати трём доменным категориям.",
      "Важно: первые два слоя — обычный код, они детерминированы и воспроизводимы. LLM отвечает только за смысл, и промпт требует к каждому замечанию дословную цитату из документа — в наших прогонах её содержали все двадцать.",
      "Это же даёт страховку: если доступа к модели нет, первые два слоя продолжают работать. Провайдера мы меняли на живой Gemini без единой правки кода.",
    ],
  },
  {
    time: "4:10 – 5:00",
    title: "Финал",
    slide: "Слайд 8 · Готовность",
    cue: "разделяем измеренное и гипотезу, потом финальная фраза",
    lines: [
      "Что измерено: три реальных документа кейсодателя пройдены в двух режимах без сбоев, двадцать замечаний — все с цитатой, семьдесят три автотеста проходят.",
      "Что пока гипотеза: точные precision и recall мы не считали — для этого нужна размеченная экспертом выборка и реальные правки разработчиков NET. Мы честно это разделяем.",
    ],
    final:
      "ТЗ-Ревьюер уже находит в реальных технических заданиях противоречия, которые люди пропускают при чтении. Чтобы измерить эффект, нам нужны реальные правки разработчиков NET — и мы готовы к пилоту. Спасибо!",
  },
];

const qa = [
  ["Почему нет точных precision / recall?",
   "Качество проверили вручную — прочитали все отчёты и оценили релевантность. Для цифр нужна выборка с эталонной разметкой и реальные правки NET. Это первый шаг пилота."],
  ["Как проверяете, что цитата не выдумана моделью?",
   "Сейчас — визуально при тестировании. Автоматическая сверка цитаты с текстом в плане. Это указано как ограничение."],
  ["Чем лучше, чем просто спросить ChatGPT?",
   "Два слоя из трёх — детерминированный код: структура шаблона и официальные критерии кейсодателя. Плюс обязательная цитата и офлайн-режим. Голый промпт этого не даёт."],
  ["Что если LLM недоступен?",
   "Инструмент не падает: разбор и проверка шаблона работают без модели и всё равно дают результат."],
  ["Какую модель использовали?",
   "Gemini 2.5 Flash через OpenAI-совместимый эндпоинт — был доступ к ключу. Архитектура провайдер-независимая: Anthropic, OpenAI, локальные модели."],
  ["Данные не утекут во внешний API?",
   "Использовали только обезличенные примеры. Для закрытого контура есть локальные эндпоинты и полностью офлайн-режим."],
  ["Как разделили работу?",
   "Поровну. Один — рубрика, промпты, продуктовая часть, тестирование. Второй — архитектура, разбор документа, провайдер-независимый клиент, независимая проверка проекта с нуля."],
];

const children = [];

children.push(
  new Paragraph({
    heading: HeadingLevel.TITLE,
    spacing: { after: 60 },
    children: [new TextRun({ text: "Питч — что говорить", bold: true })],
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({
      text: "5 минут · цель закончить за 4:40–4:50 · один спикер · 3 минуты на вопросы",
      italics: true, color: GRAY, size: 21,
    })],
  })
);

// Таблица тайминга
const timeRows = [["0:00–0:30", "Продукт"], ["0:30–1:00", "Ценность"], ["1:00–3:10", "Демо"], ["3:10–4:10", "Техника"], ["4:10–5:00", "Финал"]];
children.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  columnWidths: [2200, 7000],
  rows: timeRows.map(([t, n], i) => new TableRow({
    children: [
      new TableCell({
        width: { size: 2200, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: i === 2 ? "FDF3E3" : "F2F5F9" },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 21, color: ACCENT })] })],
      }),
      new TableCell({
        width: { size: 7000, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: i === 2 ? "FDF3E3" : "FFFFFF" },
        children: [new Paragraph({ children: [new TextRun({ text: n + (i === 2 ? "  ← самая большая часть" : ""), size: 21 })] })],
      }),
    ],
  })),
}));
children.push(new Paragraph({ spacing: { after: 300 }, children: [] }));

blocks.forEach((b) => {
  children.push(new Paragraph({
    spacing: { before: 300, after: 30 },
    children: [
      new TextRun({ text: b.time + "   ", bold: true, size: 25, color: AMBER }),
      new TextRun({ text: b.title, bold: true, size: 27, color: ACCENT }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { after: 140 },
    children: [new TextRun({ text: b.slide + " · " + b.cue, italics: true, size: 19, color: GRAY })],
  }));

  (b.lines || []).forEach((t) => {
    children.push(new Paragraph({
      spacing: { after: 120, line: 300 },
      children: [new TextRun({ text: t, size: 23 })],
    }));
  });

  (b.demo || []).forEach(([act, t]) => {
    children.push(new Paragraph({
      spacing: { before: 130, after: 20 },
      children: [new TextRun({ text: act, bold: true, size: 20, color: AMBER })],
    }));
    children.push(new Paragraph({
      spacing: { after: 60, line: 300 },
      children: [new TextRun({ text: t, size: 23 })],
    }));
  });

  if (b.final) {
    children.push(new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [new TextRun({ text: "ФИНАЛЬНАЯ ФРАЗА — читается дословно, 12–15 секунд", bold: true, size: 19, color: AMBER })],
    }));
    children.push(new Paragraph({
      spacing: { after: 120, line: 320 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: AMBER },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: AMBER },
        left: { style: BorderStyle.SINGLE, size: 6, color: AMBER },
        right: { style: BorderStyle.SINGLE, size: 6, color: AMBER },
      },
      children: [new TextRun({ text: "  " + b.final + "  ", bold: true, size: 24, color: "13223B" })],
    }));
  }
});

children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  pageBreakBefore: true,
  children: [new TextRun("Вопросы — ответ за 30 секунд")],
}));
children.push(new Paragraph({
  spacing: { after: 200 },
  children: [new TextRun({
    text: "Короткий прямой ответ → один факт → ограничение или следующий шаг. Не знаете — честно назовите гипотезу и способ проверки.",
    italics: true, size: 20, color: GRAY,
  })],
}));

qa.forEach(([q, a], i) => {
  children.push(new Paragraph({
    spacing: { before: 180, after: 30 },
    children: [new TextRun({ text: `${i + 1}. ${q}`, bold: true, size: 22, color: ACCENT })],
  }));
  children.push(new Paragraph({
    spacing: { after: 80, line: 290 },
    children: [new TextRun({ text: a, size: 22 })],
  }));
});

children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 380 },
  children: [new TextRun("Перед выходом")],
}));
[
  "Приложение уже запущено, документ выбран, ключ Gemini введён и проверен.",
  "План Б: если демо не отвечает — слайд 4, там настоящий вывод со всеми цитатами.",
  "Один спикер на весь питч. Переходы между людьми съедают время.",
  "После каждой ключевой мысли — пауза. Аббревиатуры расшифровывать при первом упоминании.",
  "Финальную фразу не импровизировать — читать как написано.",
].forEach((t) => {
  children.push(new Paragraph({
    spacing: { after: 90, line: 290 },
    bullet: { level: 0 },
    children: [new TextRun({ text: t, size: 22 })],
  }));
});

Packer.toBuffer(new Document({ sections: [{ properties: {}, children }] })).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("Готово:", OUT);
});
