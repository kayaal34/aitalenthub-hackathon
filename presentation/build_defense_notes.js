/*
 * Заметки к защите — Русский + Türkçe.
 * Генерация: node build_defense_notes.js
 * Требует пакет docx (npm i docx).
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, Numbering, LevelFormat,
} = require("docx");

const OUT = path.join(__dirname, "Заметки к защите — RU+TR.docx");

const slides = [
  {
    n: 1, title: "Титул",
    ru: "Здравствуйте! Мы — Команда 6, кейс МТС. Представляем «ТЗ-Ревьюер» — AI-инструмент предварительного ревью технических заданий на потоки и витрины данных перед передачей в разработку. Мы протестировали решение не только на своих примерах, а на реальных документах кейсодателя, вживую с моделью — расскажем по порядку.",
    tr: "Merhaba! Biz MTS kejsinde Takım 6'yız. «ТЗ-Ревьюер»'i sunuyoruz — veri akışları ve vitrinleri için teknik şartnamelerin geliştirmeye gönderilmeden önce ön incelemesini yapan bir yapay zeka aracı. Çözümü sadece kendi örneklerimizde değil, kejsodatelin gerçek belgelerinde, canlı bir modelle test ettik — sırayla anlatacağız.",
  },
  {
    n: 2, title: "Проблематика",
    ru: "Сейчас аналитик готовит ТЗ, разработчик и тестировщик вручную его вычитывают — но часть неточностей всё равно всплывает уже во время разработки. Тогда запускается дорогой цикл: аналитик правит документ, разработчик переделывает реализацию, тестировщик перепроверяет сценарии заново. Точных цифр в кейсе нет, но мы показываем структуру издержек — и целимся именно в этот цикл.",
    tr: "Şu anda analist ТЗ'yi hazırlıyor, geliştirici ve test uzmanı onu elle kontrol ediyor — ama bazı belirsizlikler yine de geliştirme sırasında ortaya çıkıyor. O zaman pahalı bir döngü başlıyor: analist belgeyi düzeltiyor, geliştirici uygulamayı yeniden yapıyor, test uzmanı senaryoları tekrar kontrol ediyor. Case'te kesin rakam yok ama biz maliyet yapısını gösteriyoruz — ve hedefimiz tam olarak bu döngü.",
  },
  {
    n: 3, title: "Пользователь и сценарий",
    ru: "Основной пользователь — аналитик. Сценарий короткий: загружает ТЗ, запускает проверку, получает список замечаний, привязанных к тексту, сам решает, что дорабатывать. Мы намеренно не выносим вердикт «готово / не готово» — решение остаётся за человеком. И весь этот сценарий реально прогнан на трёх настоящих документах кейсодателя, не только на придуманных.",
    tr: "Ana kullanıcı analist. Senaryo kısa: ТЗ'yi yükler, kontrolü başlatır, metne bağlı bulgular listesini alır, neyi düzelteceğine kendisi karar verir. Bilerek \"hazır / hazır değil\" diye bir karar vermiyoruz — karar insanda kalıyor. Ve bu senaryonun tamamı, uydurma değil, kejsodatelin 3 gerçek belgesinde gerçekten denendi.",
  },
  {
    n: 4, title: "Постановка задачи",
    ru: "Кейс требует шесть вещей — от поиска фрагментов до общего результата, но главное требование одно: каждое замечание должно ссылаться на конкретный фрагмент ТЗ, а не быть общим советом. Мы это проверили на практике — на реальных документах почти все замечания LLM содержали дословную цитату.",
    tr: "Case 6 şey istiyor — parça bulmaktan genel sonuca kadar — ama en önemli gereksinim tek: her bulgu ТЗ'nin somut bir parçasına referans vermeli, genel bir tavsiye olmamalı. Bunu pratikte doğruladık — gerçek belgelerde LLM bulgularının neredeyse hepsi birebir alıntı içeriyordu.",
  },
  {
    n: 5, title: "Техническое решение",
    ru: "Пайплайн из пяти шагов: разбор документа → проверка покрытия официального шаблона МТС → LLM-ревью по рубрике из 23 категорий → простые правила без LLM как страховка → структурированный отчёт. В рубрику мы включили официальные критерии, которые кейсодатель прислал уже после старта — сериализацию, Data Catalog, NOT NULL, Kafka-кластер, HDFS-путь. И решение не привязано к одному провайдеру: проверили и на Anthropic-совместимом контракте, и вживую на Google Gemini — без единой правки кода.",
    tr: "5 adımlı bir işlem hattı: belge ayrıştırma → MTS'in resmi şablonuna uygunluk kontrolü → 23 kategorilik rubrik üzerinden yapay zeka incelemesi → yapay zekasız basit kurallar (güvence olarak) → yapılandırılmış rapor. Rubriğe, kejsodatelin başladıktan sonra gönderdiği resmi kriterleri ekledik — serileştirme (sериализация), Data Catalog, NOT NULL, Kafka-cluster, HDFS-yolu. Ve çözüm tek bir sağlayıcıya bağlı değil: hem Anthropic-uyumlu sözleşmede, hem canlı olarak Google Gemini'de, kodda tek bir değişiklik yapmadan test ettik.",
  },
  {
    n: 6, title: "Проверка на реальных данных",
    ru: "Организаторы прислали три настоящих документа МТС: поток геолокации, поток обработки звонков и витрину-агрегат по устройствам — последнюю прямо назвали образцом для финального теста. Мы прогнали инструмент на всех трёх и в офлайн-режиме, и с реальной LLM — оба раза без единого сбоя. На экране — настоящий вывод инструмента, не макет.",
    tr: "Organizatörler 3 gerçek MTS belgesi gönderdi: geolokasyon akışı, arama işleme akışı ve cihazlara göre vitrin-agregat — sonuncusunu doğrudan final testi için örnek olarak belirttiler. Aracı üçünde de hem offline modda hem gerçek LLM ile çalıştırdık — ikisinde de tek bir hata olmadı. Ekrandaki, aracın gerçek çıktısı, maket değil.",
  },
  {
    n: 7, title: "Пример находки",
    ru: "Конкретный пример из реального документа: один раздел говорит «задержка меньше минуты», другой — «задержка около нуля секунд». Прямое противоречие внутри одного документа, которое легко упустить при обычном чтении, но которое станет проблемой на разработке. Модель нашла это сама, привела обе цитаты и сформулировала вопрос аналитику. Это ровно то, ради чего всё делалось.",
    tr: "Gerçek bir belgeden somut bir örnek: bir bölüm \"gecikme 1 dakikadan az\" diyor, diğeri \"gecikme sıfıra yakın\" diyor. Aynı belgenin içinde doğrudan bir çelişki — normal okumada kolayca kaçırılır ama geliştirmede soruna dönüşür. Model bunu kendi buldu, her iki alıntıyı da gösterdi ve analiste soru sordu. İşte tüm bunları yapma sebebimiz tam olarak bu.",
  },
  {
    n: 8, title: "Что показало тестирование",
    ru: "Тестирование на реальных данных — не формальность. Мы нашли и исправили четыре конкретных бага: например, LLM и наше простое правило иногда независимо находили одну и ту же проблему, и она попадала в отчёт дважды — исправили дедупликацией. Все четыре проблемы проявились только на реальных документах, а не на наших синтетических примерах.",
    tr: "Gerçek verilerle test etmek bir formalite değil. 4 somut bug bulup düzelttik: örneğin LLM ile basit kuralımız bazen aynı sorunu birbirinden bağımsız buluyor ve rapora 2 kere giriyordu — bunu tekilleştirme (dedupe) ile düzelttik. Bu 4 sorunun hepsi sadece gerçek belgelerde ortaya çıktı, kendi sentetik örneklerimizde değil.",
  },
  {
    n: 9, title: "Качество и риски",
    ru: "Подтвердилось: привязка к цитате, провайдер-независимость, находит не только механику, но и содержательные противоречия. Честно показываем и то, что осталось: качество проверено вручную, но не переведено в точные цифры precision/recall — для этого нужна размеченная экспертом выборка, которой пока нет. Справа — риски и как мы их снижаем.",
    tr: "Doğrulanan: alıntıya bağlılık, sağlayıcı bağımsızlığı, sadece mekanik değil içerik çelişkilerini de bulması. Kalanı da dürüstçe gösteriyoruz: kalite elle kontrol edildi ama precision/recall gibi kesin rakamlara çevrilmedi — bunun için uzman tarafından etiketlenmiş bir örneklem gerekiyor, o henüz yok. Sağda riskler ve onları nasıl azalttığımız var.",
  },
  {
    n: 10, title: "Ограничения и планы",
    ru: "Ограничения не скрываем: работаем с текстом, не со сканами; проверка покрытия шаблона — по ключевым словам, может ошибаться на нестандартных формулировках; нет эталонного датасета для точных метрик. План до пилота: реальные корректировки NET, проверка цитат, измерение метрик, пилот с 2–3 аналитиками. Главный вывод — гипотеза подтвердилась на реальных данных.",
    tr: "Kısıtları saklamıyoruz: metinle çalışıyoruz, taranmış belgeyle değil; şablon kapsamı kontrolü anahtar kelimeye dayalı, standart dışı ifadelerde hata yapabilir; kesin metrikler için referans veri seti yok. Pilota kadar plan: NET'ten gerçek düzeltmeler, alıntı doğrulaması, metrik ölçümü, 2–3 analistle pilot. Ana sonuç — hipotez gerçek verilerde doğrulandı.",
  },
  {
    n: 11, title: "Команда",
    ru: "Работали вдвоём, оба AI Engineer, 50 на 50. [Твоё имя] — рубрика, промпты, тестирование на реальных документах и поиск багов, документация и презентация. Фырат — архитектура, разбор документа, провайдер-независимый клиент и независимая проверка — развернул и прогнал весь проект с нуля на отдельной машине. Спасибо, готовы к вопросам.",
    tr: "İkimiz çalıştık, ikimiz de AI Engineer, %50-%50. [Adın] — rubrik, promptlar, gerçek belgelerle test ve bug bulma, dokümantasyon ve sunum. Fırat — mimari, belge ayrıştırma, sağlayıcı bağımsız istemci ve bağımsız doğrulama — tüm projeyi ayrı bir makinede sıfırdan kurup çalıştırdı. Teşekkürler, sorulara hazırız.",
  },
];

const qaSections = [
  {
    title: "Технические / Teknik",
    items: [
      {
        qRu: "Как вы измеряли качество — есть цифры precision/recall?",
        qTr: "Kaliteyi nasıl ölçtünüz — precision/recall rakamları var mı?",
        aRu: "Нет, не численно. Мы вручную прочитали все отчёты на трёх реальных документах и оценили релевантность находок — почти все обоснованы. Для точных цифр нужна выборка с размеченным экспертом эталоном, которой у нас пока нет. Это в плане на пилот.",
        aTr: "Hayır, sayısal olarak değil. 3 gerçek belgedeki tüm raporları elle okuduk ve bulguların ilgi düzeyini değerlendirdik — neredeyse hepsi gerekçeliydi. Kesin rakamlar için uzman tarafından etiketlenmiş bir örneklem gerekiyor, o henüz yok. Bu pilot planında.",
      },
      {
        qRu: "Как проверяете, что цитата реально есть в тексте, а не выдумана моделью?",
        qTr: "Alıntının gerçekten metinde olduğunu, modelin uydurmadığını nasıl kontrol ediyorsunuz?",
        aRu: "Сейчас — только визуально при тестировании, автоматической проверки нет. Это честно указано как ограничение и стоит в плане: пост-проверка дословного совпадения цитаты с текстом.",
        aTr: "Şu an sadece test sırasında gözle kontrol ediyoruz, otomatik doğrulama yok. Bu dürüstçe bir kısıt olarak belirtildi ve planda var: alıntının metinle birebir eşleştiğini kontrol eden bir son-kontrol adımı.",
      },
      {
        qRu: "Чем это лучше, чем просто спросить ChatGPT напрямую?",
        qTr: "Bu doğrudan ChatGPT'ye sormaktan neden daha iyi?",
        aRu: "У нас не голый промпт — есть структурированная рубрика из 23 доменных категорий, официальный шаблон и чек-лист от самого кейсодателя, few-shot примеры, дедупликация похожих находок и офлайн-режим на случай недоступности модели. Голый промпт этого не даёт.",
        aTr: "Bizde çıplak bir prompt yok — 23 alan-özel kategoriden oluşan yapılandırılmış bir rubrik, kejsodatelin kendi resmi şablonu ve checklist'i, few-shot örnekleri, benzer bulguların tekilleştirilmesi ve model erişilemezse offline mod var. Çıplak bir prompt bunları vermez.",
      },
      {
        qRu: "Что если LLM недоступен или упадёт API?",
        qTr: "LLM erişilemezse ya da API çökerse ne olur?",
        aRu: "Инструмент не падает — есть офлайн-режим на простых правилах и проверке шаблона, он всегда даёт результат, просто менее глубокий.",
        aTr: "Araç çökmez — basit kurallar ve şablon kontrolüne dayanan bir offline modu var, her zaman bir sonuç verir, sadece daha yüzeysel.",
      },
      {
        qRu: "Почему Streamlit, а не полноценный сайт?",
        qTr: "Neden Streamlit, tam bir web sitesi değil?",
        aRu: "Для MVP это быстрее всего дало рабочее демо. Ядро анализа отделено от интерфейса и может быть обёрнуто в API/сайт без переделки логики.",
        aTr: "MVP için en hızlı şekilde çalışan bir demo verdi. Analiz çekirdeği arayüzden ayrık, mantığı değiştirmeden bir API/siteye sarılabilir.",
      },
      {
        qRu: "Какую модель использовали и почему?",
        qTr: "Hangi modeli kullandınız ve neden?",
        aRu: "Тестировали на Google Gemini 2.5 Flash через OpenAI-совместимый эндпоинт — просто был доступ к ключу. Архитектура провайдер-независимая: так же работает с Anthropic, OpenAI, локальными моделями.",
        aTr: "Google Gemini 2.5 Flash'ı OpenAI-uyumlu bir uç nokta üzerinden test ettik — sadece o anahtara erişimimiz vardı. Mimari sağlayıcıdan bağımsız: Anthropic, OpenAI, yerel modellerle de aynı şekilde çalışır.",
      },
      {
        qRu: "Не уйдут ли конфиденциальные данные во внешний API?",
        qTr: "Gizli veriler dış API'ye gitmez mi?",
        aRu: "Мы использовали только обезличенные примеры кейсодателя. Для реального контура предусмотрены локальные эндпоинты и полностью офлайн-режим — данные никуда не уходят.",
        aTr: "Sadece kejsodatelin anonimleştirilmiş örneklerini kullandık. Gerçek ortam için yerel uç noktalar ve tamamen offline mod öngörüldü — veriler hiçbir yere gitmiyor.",
      },
      {
        qRu: "Сколько времени занимает одна проверка?",
        qTr: "Bir kontrol ne kadar sürüyor?",
        aRu: "В наших тестах — около 40–50 секунд с LLM на документ среднего размера, офлайн-режим — почти мгновенно.",
        aTr: "Testlerimizde, orta boy bir belge için LLM ile yaklaşık 40–50 saniye; offline mod neredeyse anında.",
      },
    ],
  },
  {
    title: "Продуктовые / Ürün",
    items: [
      {
        qRu: "Почему убрали числовую оценку готовности?",
        qTr: "Sayısal hazırlık puanını neden kaldırdınız?",
        aRu: "Кейс явно требует, чтобы решение о готовности оставалось за аналитиком. Сначала у нас была цифра «индекс готовности», но по фидбэку поняли, что она читается как автоматический вердикт — убрали, оставили только факты: сколько замечаний и какое покрытие шаблона.",
        aTr: "Case, hazırlık kararının analistte kalmasını açıkça istiyor. Başta bir \"hazırlık endeksi\" rakamımız vardı ama geri bildirimle bunun otomatik bir karar gibi okunduğunu anladık — kaldırdık, sadece gerçekleri bıraktık: kaç bulgu var ve şablon kapsamı ne kadar.",
      },
      {
        qRu: "В чём именно бизнес-ценность, есть ли цифры экономии?",
        qTr: "İş değeri tam olarak ne, tasarruf rakamı var mı?",
        aRu: "Точных денег в кейсе не задано, мы построили формулу издержек (число поздних уточнений × трудоёмкость × количество ТЗ) — но не считали в рублях. Ценность измеряем через снижение числа поздних уточнений, это и будем проверять на пилоте.",
        aTr: "Case'te kesin bir para rakamı verilmedi, biz bir maliyet formülü kurduk (geç netleştirme sayısı × emek × ТЗ sayısı) ama rubleye çevirmedik. Değeri, geç netleştirme sayısındaki azalma üzerinden ölçeceğiz, bunu pilotta test edeceğiz.",
      },
      {
        qRu: "Что если аналитик просто проигнорирует все замечания?",
        qTr: "Analist tüm bulguları görmezden gelirse ne olur?",
        aRu: "Это его право — инструмент не принудительный и не блокирует передачу в разработку, так и задумано по требованию кейса.",
        aTr: "Bu onun hakkı — araç zorunlu değil ve geliştirmeye gönderimi engellemiyor, case'in isteği doğrultusunda böyle tasarlandı.",
      },
      {
        qRu: "Как масштабируется на другие типы ТЗ, не только потоки/витрины?",
        qTr: "Sadece akış/vitrin dışındaki ТЗ tiplerine nasıl ölçeklenir?",
        aRu: "Рубрика и шаблон сейчас настроены именно под этот домен. Для другого типа документов нужно поменять базу знаний (шаблон, чек-лист) — архитектура это позволяет, но мы это не тестировали.",
        aTr: "Rubrik ve şablon şu an tam olarak bu alana göre ayarlı. Başka belge tipleri için bilgi tabanını (şablon, checklist) değiştirmek gerekir — mimari buna izin veriyor ama bunu test etmedik.",
      },
    ],
  },
  {
    title: "«На подвох» и командные / Zor sorular ve takım",
    items: [
      {
        qRu: "Как вы разделили работу и почему поровну?",
        qTr: "İşi nasıl böldünüz ve neden eşit?",
        aRu: "[Кратко — своими словами; см. слайд 11 и docs/project-description-final.md]",
        aTr: "[Kısaca — kendi cümlelerinle; bkz. slayt 11 ve docs/project-description-final.md]",
      },
      {
        qRu: "Вы уверены, что инструмент вообще нужен — может, проще научить аналитиков внимательнее читать?",
        qTr: "Aracın gerçekten gerekli olduğuna emin misiniz — belki analistlere daha dikkatli okumayı öğretmek daha kolaydır?",
        aRu: "Ручное внимание не масштабируется и зависит от опыта конкретного человека — именно это и есть проблема из кейса. Инструмент не заменяет внимательность, а даёт второе, независимое мнение за секунды.",
        aTr: "Elle dikkat ölçeklenmez ve kişinin tecrübesine bağlıdır — case'in tam olarak belirttiği sorun bu. Araç dikkati yerine geçmiyor, saniyeler içinde ikinci, bağımsız bir görüş veriyor.",
      },
      {
        qRu: "Что было самым сложным на хакатоне?",
        qTr: "Hackathonda en zor şey neydi?",
        aRu: "[Честно, своими словами — например: тестирование на реальных документах вскрыло баги, которых не было видно на синтетике; пришлось несколько раз чинить дедупликацию и распознавание типов данных.]",
        aTr: "[Dürüstçe, kendi cümlelerinle — örneğin: gerçek belgelerle test etmek sentetik verilerde görünmeyen bugları ortaya çıkardı; dedupe ve veri tipi tanımayı birkaç kez düzeltmek gerekti.]",
      },
      {
        qRu: "Если бы у вас была ещё неделя — что бы сделали в первую очередь?",
        qTr: "Bir hafta daha olsaydı ilk önce ne yapardınız?",
        aRu: "Получили бы от NET реальные корректировки разработчиков и прогнали метрики на размеченной выборке — это единственное, что реально нельзя сделать без данных кейсодателя.",
        aTr: "NET'ten geliştiricilerin gerçek düzeltmelerini alır ve etiketlenmiş bir örneklemde metrikleri çalıştırırdık — kejsodatelin verisi olmadan gerçekten yapılamayan tek şey bu.",
      },
    ],
  },
];

const RU_COLOR = "1A1A1A";
const TR_COLOR = "6B7280";

function ruPara(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, color: RU_COLOR, size: 22, bold: !!opts.bold })],
  });
}
function trPara(text) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text, italics: true, color: TR_COLOR, size: 20 })],
  });
}
function hr() {
  return new Paragraph({
    spacing: { before: 40, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D4DCE6" } },
    children: [],
  });
}

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [new TextRun({ text: "ТЗ-Ревьюер — Заметки к защите", bold: true })],
  }),
  new Paragraph({
    spacing: { after: 300 },
    children: [new TextRun({ text: "Savunma Notları (RU + TR) — kişisel çalışma dosyası, resmi teslim değil", italics: true, color: TR_COLOR })],
  }),

  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Речь по слайдам / Slayt Konuşma Metinleri")] }),
];

slides.forEach((s) => {
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(`Слайд ${s.n} — ${s.title}`)],
  }));
  children.push(ruPara(s.ru));
  children.push(trPara(s.tr));
});

children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Вопросы и ответы / Soru-Cevap")], pageBreakBefore: true }));

qaSections.forEach((sec) => {
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(sec.title)] }));
  sec.items.forEach((it) => {
    children.push(ruPara("В: " + it.qRu, { bold: true }));
    children.push(trPara("S: " + it.qTr));
    children.push(ruPara("О: " + it.aRu));
    children.push(trPara("C: " + it.aTr));
    children.push(hr());
  });
});

const doc = new Document({
  sections: [{ properties: {}, children }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("Готово:", OUT);
});
