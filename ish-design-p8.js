/* ish-design-p8.js  v1  (16.10.2026)  П8 «блоки главной ниже первого экрана» b2b.isoft-shop.kz
   Грузится загрузчиком П4 (ish-design-p4.js v3) только на главной, по признаку «#лента .слайд». Сам подключает ish-design-p8.css рядом с собой.
   Что делает (только ДОБАВЛЯЕТ узлы с префиксом ishp8-, каждый раз проверяя, что такого ещё нет; родные узлы блока 4204120903 не переписывает):
     Г12  полоса преимуществ перед «Как оформить заказ»
     Г8   плитки разделов каталога после «Как оформить заказ»
     Г11  «Для кого», Г21 цифры, Г18 «Почему мы», Г20 бренды текстом - после рядов товаров, перед «Не нашли нужное?»
     Г9/Г10 (вид существующих трёх шагов) и Г13/Г14/М10 (один призыв вместо повторов) делает CSS: класс html.ishp8-on.
   Выключатели: window.ISH_P4_NO_P8 (до загрузчика) или window.ISH_P8_OFF. Не загрузился / ошибка - сайт как был.
   Тексты - только подтверждённые факты (решения 15-16.10, тексты_доверия.md). Числа «25 лет» и «14 000+» - верны по решению владельца 15.10;
   других чисел руками нет. Список бренд-названий - текстом, не логотипы и не заявление о партнёрстве. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P4_NO_P8 || W.ISH_P8_OFF || W.ISH_P8) return;
  W.ISH_P8 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p8.js"]');

  /* стили: рядом с собой, один раз */
  (function () {
    if (D.getElementById('ishp8-css')) return;
    var src = tag && tag.src;
    if (!src) return;
    var l = D.createElement('link');
    l.id = 'ishp8-css'; l.rel = 'stylesheet';
    l.href = src.replace(/ish-design-p8\.js.*$/, 'ish-design-p8.css' + (/[?&]v=(\w+)/.exec(src) ? '?v=' + /[?&]v=(\w+)/.exec(src)[1] : ''));
    D.head.appendChild(l);
  })();

  function until(fn, max) {
    var n = 0;
    (function step() { var ok = false; try { ok = fn(); } catch (e) {} if (!ok && ++n < (max || 48)) setTimeout(step, 250); })();
  }
  function el(html) { var d = D.createElement('div'); d.innerHTML = html; return d.firstChild; }

  /* ───────── данные ───────── */
  /* Разделы: имена и адреса = Скрипты_сайт\tilda\ДЕРЕВО_КАТАЛОГА.json (закон дерева 21.09) и ДЕРЕВО в живом блоке главной.
     [название, адрес, [разделы для подписи], значок]. Адрес группы, где своей страницы нет, = её первый живой раздел. */
  var ЗНАЧКИ = {
    комп: '<rect x="2" y="3.5" width="14" height="9" rx="1.5"/><path d="M.5 15h17l-1.5-2.5H2Z"/>',
    мон: '<rect x="1.5" y="3" width="15" height="10" rx="1.5"/><path d="M6 16h6M9 13v3"/>',
    чип: '<rect x="4.5" y="4.5" width="9" height="9" rx="1.5"/><path d="M7 4.5V2M11 4.5V2M7 13.5V16M11 13.5V16M4.5 7H2M4.5 11H2M13.5 7H16M13.5 11H16"/>',
    диск: '<rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M5 7.5h5M5 10.5h8"/>',
    сервер: '<rect x="3" y="2" width="12" height="14" rx="1.5"/><path d="M3 7h12M3 11.5h12M6 4.5h.01M6 9.2h.01M6 13.7h.01"/>',
    сеть: '<rect x="2" y="2.5" width="14" height="5" rx="1.2"/><rect x="2" y="10.5" width="14" height="5" rx="1.2"/><path d="M5 5h.01M5 13h.01"/>',
    печать: '<path d="M5.5 3h7v3.5h-7z"/><rect x="2.5" y="6.5" width="13" height="6" rx="1.5"/><path d="M5.5 12.5h7V16h-7z"/>',
    место: '<rect x="1.5" y="5" width="15" height="8" rx="1.5"/><path d="M4 8h.01M6.5 8h.01M9 8h.01M11.5 8h.01M14 8h.01M5 10.5h8"/>',
    видео: '<rect x="1.5" y="4.5" width="10" height="6" rx="1.5"/><path d="M11.5 6.5l5-2v7l-5-2M6.5 10.5V14M4 15h5"/>',
    торг: '<path d="M2 4.5V2h2.5M16 4.5V2h-2.5M2 13.5V16h2.5M16 13.5V16h-2.5"/><path d="M5 5.5v7M7.5 5.5v7M10 5.5v7M13 5.5v7"/>'
  };
  var РАЗДЕЛЫ = [
    ['Компьютеры', '/kompyutery', 'Ноутбуки · Системные блоки · Моноблоки', 'комп'],
    ['Мониторы и экраны', '/monitory-i-ekrany', 'Мониторы · Телевизоры · Проекторы', 'мон'],
    ['Комплектующие', '/komplektuyushchie', 'Процессоры · Видеокарты · Память', 'чип'],
    ['Накопители', '/nakopiteli', 'SSD · Жёсткие диски · Карты памяти', 'диск'],
    ['Серверы и серверная инфраструктура', '/servery', 'Серверы · Системы хранения · ИБП', 'сервер'],
    ['Сетевое оборудование', '/set-i-servery', 'Роутеры · Точки доступа Wi-Fi · Сетевые карты', 'сеть'],
    ['Печать и сканирование', '/ofis-i-rabochee-mesto', 'Принтеры и МФУ · Плоттеры · Сканеры', 'печать'],
    ['Рабочее место', '/svyaz-i-videonablyudenie', 'Клавиатуры · Мыши · Гарнитуры', 'место'],
    ['Видеонаблюдение и безопасность', '/videonablyudenie', 'Камеры · Видеорегистраторы · СКУД', 'видео'],
    ['Торговое оборудование', '/torgovoe-oborudovanie', 'Сканеры штрихкода · ТСД · Принтеры этикеток', 'торг']
  ];
  /* самые частые бренды каталога (ответ магазина 15.10): названия текстом */
  var БРЕНДЫ = ['ASUS', 'Dahua', 'Hikvision', 'TP-Link', 'Dell', 'HP', 'Gigabyte', 'Acer', 'Kingston', 'Logitech', 'MikroTik', 'Lenovo'];

  var СТР = '<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m1 1 6 6-6 6"/></svg>';

  /* ───────── Г12: полоса преимуществ ───────── */
  function html_strip() {
    var пункты = [
      ['<path d="M14 3 5 6.5v7c0 5.5 3.8 9.4 9 11.5 5.2-2.1 9-6 9-11.5v-7z"/><path d="m10 14 3 3 5-6"/>', 'Гарантия не меньше 12 месяцев', 'по гарантии производителя'],
      ['<path d="M2.5 7h14v11h-14zM16.5 11h5l4 4v3h-9z"/><circle cx="7" cy="20" r="2"/><circle cx="21" cy="20" r="2"/>', 'Бесплатная доставка по всему Казахстану', 'в другие города транспортной компанией'],
      ['<path d="M6 3.5h12l4 4V24.5H6z"/><path d="M18 3.5v4h4M10 13h8M10 17h8M10 21h5"/>', 'Безнал, счёт с НДС 16%', 'договор, накладная, счёт-фактура'],
      ['<path d="M14 25s-8-7-8-13a8 8 0 0 1 16 0c0 6-8 13-8 13z"/><circle cx="14" cy="12" r="3"/>', 'Самовывоз: Астана, Алматы, Актобе', 'три адреса, подробности в «Доставке»']
    ];
    return '<div class="ishp8-strip" role="list">' + пункты.map(function (п) {
      return '<div class="ishp8-strip__i" role="listitem"><svg viewBox="0 0 28 28" aria-hidden="true">' + п[0] + '</svg><p><b>' + п[1] + '</b><span>' + п[2] + '</span></p></div>';
    }).join('') + '</div>';
  }

  /* ───────── Г8: плитки разделов ───────── */
  function html_tiles() {
    return '<div class="ishp8-eb">Каталог</div><h2 class="ishp8-h">Разделы каталога</h2><div class="ishp8-tiles">' +
      РАЗДЕЛЫ.map(function (р) {
        return '<a class="ishp8-tile" href="' + р[1] + '"><span class="ishp8-tile__im"><svg viewBox="0 0 18 18" aria-hidden="true">' + ЗНАЧКИ[р[3]] + '</svg></span>' +
               '<span class="ishp8-tile__tt"><b>' + р[0] + '</b><span>' + р[2] + '</span></span></a>';
      }).join('') + '</div>';
  }

  /* ───────── Г11 «Для кого» ───────── */
  function html_who() {
    var к = [
      ['<rect x="4" y="9" width="26" height="19" rx="2"/><path d="M12 9V6h10v3M4 17h26"/>', 'Бизнес',
       'Счёт с НДС 16%, договор, накладная и счёт-фактура. Цены видны сразу, без регистрации. Пришлите список — ответим в день обращения.',
       'Запросить цену', '/podbor', ' data-д="запрос"'],
      ['<path d="M5 28h24M7 28V14M27 28V14M13 28V14M21 28V14M4 14 17 6l13 8z"/>', 'Госзакупки',
       'Работаем через goszakup.gov.kz. Безналичный расчёт по счёту, договор поставки и закрывающие документы.',
       'Для госорганов', '/goszakupki', ''],
      ['<path d="m2 13 15-7 15 7-15 7z"/><path d="M8 16v7c0 2 4 4 9 4s9-2 9-4v-7M30 13v9"/>', 'Образование',
       'Компьютеры, мониторы и печать для школ и вузов. Выберите в каталоге или пришлите список потребности.',
       'Для школ и вузов', '/obrazovanie', '']
    ];
    return '<div class="ishp8-eb">Для кого</div><h2 class="ishp8-h">Покупателям по-разному: выберите свой путь</h2><div class="ishp8-who">' +
      к.map(function (c) {
        return '<div class="ishp8-wc"><svg viewBox="0 0 34 34" aria-hidden="true">' + c[0] + '</svg><b>' + c[1] + '</b><p>' + c[2] + '</p>' +
               '<a class="ishp8-go" href="' + c[4] + '"' + c[5] + '>' + c[3] + '</a></div>';
      }).join('') + '</div>';
  }

  /* ───────── Г21 цифры ───────── */
  function html_nums() {
    return '<div class="ishp8-eb">В цифрах</div><h2 class="ishp8-h">Коротко о нас</h2><div class="ishp8-nums">' +
      '<div class="ishp8-num"><b>25</b><span>лет на рынке техники</span></div>' +
      '<a class="ishp8-num ishp8-num--a" href="/assortiment"><b>14 000+</b><span>позиций в расширенном ассортименте</span></a>' +
      '<div class="ishp8-num"><b>3</b><span>города самовывоза: Астана, Алматы, Актобе</span></div></div>';
  }

  /* ───────── Г18 «Почему мы» (bento) ───────── */
  function html_bento() {
    return '<div class="ishp8-eb">Почему мы</div><h2 class="ishp8-h">Как мы работаем с юридическими лицами</h2><div class="ishp8-bento">' +
      '<div class="ishp8-bc ishp8-bc--big"><b>Цены видны сразу, без регистрации</b><span>Каталог открыт: смотрите цену до звонка и заявки.</span></div>' +
      '<div class="ishp8-bc"><b>Ответ в день обращения</b><span>Наличие, срок, цена, аналог</span></div>' +
      '<div class="ishp8-bc"><b>Весь пакет документов</b><span>Счёт, договор, накладная, счёт-фактура</span></div>' +
      '<div class="ishp8-bc ishp8-bc--wide"><b>Пришлите список, не ищите по карточкам</b><span>Ответ придёт на почту с ценами и сроками. Доставка по Казахстану бесплатная, для крупных заказов — индивидуальная цена.</span></div></div>';
  }

  /* ───────── Г20 бренды текстом ───────── */
  function html_brands() {
    return '<div class="ishp8-eb">Бренды в каталоге</div><h2 class="ishp8-h">Бренды на сайте</h2><ul class="ishp8-brands">' +
      БРЕНДЫ.map(function (б) { return '<li>' + б + '</li>'; }).join('') + '</ul>' +
      '<p class="ishp8-note">Самые частые бренды каталога по числу позиций. Полный список — в фильтре «Бренд» в каждом разделе.</p>';
  }

  /* ───────── вставка ───────── */
  function sec(id, cls, inner) {
    var s = D.createElement('section');
    s.id = id; s.className = 'ishp8-sec ' + cls;
    s.innerHTML = inner;
    return s;
  }
  function вставить() {
    var полоса = D.getElementById('полоса');
    var запрос = D.getElementById('запросБлок');
    if (!полоса || !запрос || !полоса.parentNode || запрос.parentNode !== полоса.parentNode) return false;
    if (!полоса.querySelector('.в73')) return false;               // шаги ещё не нарисованы
    var родитель = полоса.parentNode;
    var ряды = D.getElementById('ряды');
    /* Г12 - перед «Как оформить заказ»; Г8 - сразу после него */
    if (!D.getElementById('ishp8-a')) родитель.insertBefore(sec('ishp8-a', 'ishp8-sec--strip', html_strip()), полоса);
    if (!D.getElementById('ishp8-b')) родитель.insertBefore(sec('ishp8-b', 'ishp8-sec--tiles', html_tiles()), полоса.nextSibling);
    /* остальное - после рядов товаров, перед «Не нашли нужное?» */
    if (!D.getElementById('ishp8-c')) {
      var опора = запрос;
      [['ishp8-c', 'ishp8-sec--who', html_who], ['ishp8-d', 'ishp8-sec--nums', html_nums],
       ['ishp8-e', 'ishp8-sec--bento', html_bento], ['ishp8-f', 'ishp8-sec--brands', html_brands]].forEach(function (x) {
        родитель.insertBefore(sec(x[0], x[1], x[2]()), опора);
      });
    }
    D.documentElement.classList.add('ishp8-on');
    return true;
  }
  until(вставить, 80);
})();
