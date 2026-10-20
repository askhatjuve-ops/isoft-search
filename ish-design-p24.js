/* ish-design-p24.js v2.1 (20.10: +СКС за выключателем ISH_SKS_ON) · v2 · П24 «Мега-меню» (Ш9), 16.10.2026. Внешний слой поверх живой вёрстки; блоки Tilda НЕ пишутся.
   Кнопка «Каталог» в десктопной шапке (.нш-шапка, блок 4204502203) раскрывает панель: 10 групп, 47 разделов.
   v2: на ширине 981-1279 кнопка - только значок (aria-label «Каталог» остаётся), на >=1280 значок + слово.
   Подгружается из ish-design-p4.js (десктоп >=981 и есть .нш-шапка). Стили - ish-design-p24.css (рядом, тот же адрес).
   Выключатель до загрузки: window.ISH_P24_OFF = true. На телефоне (<981), на карточке товара v8 (html.ishpg-on) ничего не делает.
   ДАННЫЕ ниже собраны собрать_П24.py из Скрипты_сайт\tilda\ДЕРЕВО_КАТАЛОГА.json; руками не править. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P24_OFF || W.__ishP24) return;
  W.__ishP24 = 'v2';
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p24.js"]');

  /* [группа, адрес группы, [[раздел, адрес], ...]] - порядок как в меню сайта */
  var ДЕРЕВО = [["Компьютеры","/kompyutery",[["Ноутбуки","/noutbuki"],["Системные блоки","/sistemnye-bloki"],["Моноблоки","/monobloki"],["Мини-ПК","/mini-pk-i-rabochie-stancii"]]],["Мониторы и экраны","/monitory-i-ekrany",[["Мониторы","/monitory"],["Телевизоры","/televizory"],["Проекторы","/proektory-i-paneli"],["Кронштейны для мониторов и ТВ","/kronshteyny-i-krepleniya"]]],["Комплектующие","/komplektuyushchie",[["Процессоры","/processory"],["Материнские платы","/materinskie-platy"],["Оперативная память","/operativnaya-pamyat"],["Видеокарты","/videokarty"],["Охлаждение","/ohlazhdenie"],["Корпуса","/korpusa-i-bloki-pitaniya"],["Блоки питания","/bloki-pitaniya"]]],["Накопители","/nakopiteli",[["SSD-накопители","/ssd-nakopiteli"],["Жёсткие диски","/zhestkie-diski"],["USB-флешки","/fleshki-i-karty-pamyati"],["Карты памяти","/karty-pamyati"]]],["Серверы и серверная инфраструктура","/servery-i-infrastruktura",[["ИБП","/ibp-i-zashchita-pitaniya"],["Системы хранения","/servery-i-shd"],["Серверы","/servery"],["Шкафы и стойки","/shkafy-i-stoyki"]]],["Сетевое оборудование","/set-i-servery",[["Сетевое оборудование","/setevoe-oborudovanie"],["Маршрутизаторы (роутеры)","/marshrutizatory"],["Точки доступа Wi-Fi","/tochki-dostupa"],["Сетевые карты и адаптеры","/setevye-karty"],["Межсетевые экраны","/mezhsetevye-ekrany"],["IP-телефоны","/konferenc-svyaz"]]],["Печать и сканирование","/ofis-i-rabochee-mesto",[["Принтеры и МФУ","/printery-i-mfu"],["МФУ лазерные цветные","/mfu-lazernye-cvetnye"],["МФУ струйные цветные","/mfu-struynye-cvetnye"],["Принтеры лазерные ч/б","/printery-lazernye-chb"],["Принтеры лазерные цветные","/printery-lazernye-cvetnye"],["Плоттеры","/plottery"],["Сканеры документов","/skanery-dokumentov"]]],["Рабочее место","/svyaz-i-videonablyudenie",[["Клавиатуры","/klaviatury"],["Мыши","/klaviatury-i-myshi"],["Гарнитуры для конференц-связи","/garnitury"],["Наушники","/naushniki"]]],["Видеонаблюдение и безопасность","/videonablyudenie-i-bezopasnost",[["Камеры видеонаблюдения","/videonablyudenie"],["Видеорегистраторы","/videoregistratory"],["СКУД и турникеты","/skud-i-turnikety"],["Домофоны","/domofony"]]],["Торговое оборудование","/torgovoe-oborudovanie",[["Сканеры штрихкода","/skanery-shtrihkoda"],["Терминалы сбора данных","/terminaly-sbora-dannyh"],["Принтеры этикеток","/printery-etiketok"]]]];
  /* СКС (20.10, НЕ включено): страницы-узла нет. Шесть новых разделов идут обычными пунктами группы «Сетевое оборудование» под подзаголовком «Кабельные системы (СКС)» (без ссылки); «Шкафы и стойки» остаются на месте. Включает window.ISH_SKS_ON (константа СКС_ВКЛ в ish-design-p4.js). */
  if (W.ISH_SKS_ON) ДЕРЕВО.forEach(function (г) { if (г[1] === '/set-i-servery' && !г[2].some(function (р) { return р[1] === '/patch-paneli'; })) { г[2].push(['Кабельные системы (СКС)', '']); [['Кабель витая пара', '/kabel-vitaya-para'],['Розетки и модули', '/rozetki-i-moduli'],['Патч-панели', '/patch-paneli'],['Патч-корды', '/patch-kordy'],['Кабель-каналы и короба', '/kabel-kanaly-i-koroba'],['Коннекторы и инструмент', '/konnektory-i-instrument']].forEach(function (р) { г[2].push(р); }); } });

  /* короткие подписи: как в ish-design-p20.js (Ш7); адреса и полные имена (title) не меняются */
  var КОРОТКО = {
    'Серверы и серверная инфраструктура': 'Серверное оборудование',
    'Видеонаблюдение и безопасность': 'Видеонаблюдение и СКУД',
    'Кронштейны для мониторов и ТВ': 'Кронштейны',
    'Гарнитуры для конференц-связи': 'Конференц-гарнитуры',
    'Сетевые карты и адаптеры': 'Сетевые карты',
    'Маршрутизаторы (роутеры)': 'Роутеры'
  };
  /* значки групп: те же, что в левой колонке главной (ВИД в блоке главной): [фон, цвет, path] */
  var ВИД = {
    'Компьютеры': ['#E9ECFC', '#2B44C7', '<rect x="2" y="3.5" width="14" height="9" rx="1.5"/><path d="M.5 15h17l-1.5-2.5H2Z"/>'],
    'Мониторы и экраны': ['#E4F2EF', '#0E7C66', '<rect x="1.5" y="3" width="15" height="10" rx="1.5"/><path d="M6 16h6M9 13v3"/>'],
    'Комплектующие': ['#F1EBFB', '#6B3FD4', '<rect x="4.5" y="4.5" width="9" height="9" rx="1.5"/><path d="M7 4.5V2M11 4.5V2M7 13.5V16M11 13.5V16M4.5 7H2M4.5 11H2M13.5 7H16M13.5 11H16"/>'],
    'Накопители': ['#E8EEF6', '#2E6BA8', '<rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M5 7.5h5M5 10.5h8"/>'],
    'Сетевое оборудование': ['#FAF0E4', '#9A6417', '<rect x="2" y="2.5" width="14" height="5" rx="1.2"/><rect x="2" y="10.5" width="14" height="5" rx="1.2"/><path d="M5 5h.01M5 13h.01"/>'],
    'Печать и сканирование': ['#FDEAE4', '#C0441F', '<path d="M5.5 3h7v3.5h-7z"/><rect x="2.5" y="6.5" width="13" height="6" rx="1.5"/><path d="M5.5 12.5h7V16h-7z"/>'],
    'Рабочее место': ['#F6E9F2', '#9A3B77', '<path d="M3 6.5V5.2A2 2 0 0 1 5 3.2h8a2 2 0 0 1 2 2v1.3"/><rect x="1.5" y="7.5" width="5" height="4.5" rx="1.2"/><rect x="11.5" y="7.5" width="5" height="4.5" rx="1.2"/><path d="M4 12v2.5M14 12v2.5"/>'],
    'Серверы и серверная инфраструктура': ['#EEF1F4', '#3E5466', '<rect x="3" y="2" width="12" height="14" rx="1.5"/><path d="M3 7h12M3 11.5h12M6 4.5h.01M6 9.2h.01M6 13.7h.01"/>'],
    'Видеонаблюдение и безопасность': ['#EAF5EA', '#2E7D4F', '<rect x="1.5" y="4.5" width="10" height="6" rx="1.5"/><path d="M11.5 6.5l5-2v7l-5-2M6.5 10.5V14M4 15h5"/>'],
    'Торговое оборудование': ['#E9ECFC', '#2B44C7', '<path d="M2 4.5V2h2.5M16 4.5V2h-2.5M2 13.5V16h2.5M16 13.5V16h-2.5"/><path d="M5 5.5v7M7.5 5.5v7M10 5.5v7M13 5.5v7"/>']
  };
  /* нижняя строка панели: [адрес, подпись, главная?] - адреса уже есть в шапке сайта */
  var ЕЩЁ = [['/katalog', 'Весь каталог', 1], ['/assortiment', 'Расширенный ассортимент 14000+', 0], ['/podbor', 'Запросить счёт | КП', 0]];

  var BURGER = '<svg class="ishp24-brg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path class="l1" d="M3 5h12"/><path class="l2" d="M3 9h12"/><path class="l3" d="M3 13h12"/></svg>';
  var CHEV = '<svg class="ishp24-chev" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg>';
  var DELAY = 150;

  function wide() { return W.matchMedia ? W.matchMedia('(min-width:981px)').matches : W.innerWidth >= 981; }
  function hoverOk() { return W.matchMedia ? W.matchMedia('(hover:hover)').matches : true; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function имя(п) { return КОРОТКО[п] || п; }

  function разметка() {
    var h = '<button type="button" class="ishp24-btn" id="ishp24-btn" aria-label="Каталог" aria-expanded="false" aria-controls="ishp24-panel" aria-haspopup="true">' +
            BURGER + '<span class="ishp24-bt">Каталог</span>' + CHEV + '</button>' +
            '<nav class="ishp24-panel" id="ishp24-panel" aria-label="Каталог" hidden><div class="ishp24-in"><div class="ishp24-grid">';
    ДЕРЕВО.forEach(function (г) {
      var в = ВИД[г[0]] || ['#E9ECFC', '#2B44C7', ''];
      h += '<section class="ishp24-g"><a class="ishp24-gh" href="' + esc(г[1]) + '" title="' + esc(г[0]) + '">' +
           '<span class="ishp24-ic" style="background:' + в[0] + ';color:' + в[1] + '"><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + в[2] + '</svg></span>' +
           '<span class="ishp24-gn">' + esc(имя(г[0])) + '</span></a><ul>';
      г[2].forEach(function (р) {
        if (!р[1]) { h += '<li class="ishp24-sub" style="padding:10px 0 2px 40px;font:600 11px/1.3 TildaSans,Arial,sans-serif;letter-spacing:.6px;text-transform:uppercase;color:#6B7280">' + esc(р[0]) + '</li>'; return; }
        h += '<li><a class="ishp24-l" href="' + esc(р[1]) + '" title="' + esc(р[0]) + '">' + esc(имя(р[0])) + '</a></li>';
      });
      h += '</ul></section>';
    });
    h += '</div><div class="ishp24-foot">';
    ЕЩЁ.forEach(function (е) { h += '<a class="ishp24-f' + (е[2] ? ' ishp24-f--main' : '') + '" href="' + esc(е[0]) + '">' + esc(е[1]) + '</a>'; });
    return h + '</div></div></nav>';
  }

  function собрать() {
    var шапка = D.querySelector('.нш-шапка');
    var право = шапка && шапка.querySelector('.нш-шапка-право');
    if (!право) return false;
    if (право.querySelector('.ishp24')) return true;
    if (D.documentElement.classList.contains('ishpg-on')) return true;      /* карточка v8: шапка скрыта, меню не нужно */
    if (!ДЕРЕВО || !ДЕРЕВО.length) return true;

    var обёртка = D.createElement('div');
    обёртка.className = 'ishp24';
    обёртка.innerHTML = разметка();
    право.insertBefore(обёртка, право.firstChild);

    var кн = обёртка.querySelector('.ishp24-btn'), пн = обёртка.querySelector('.ishp24-panel');
    var открыта = false, закреплена = false, тО = 0, тЗ = 0;

    function поле() { return D.querySelector('.нш-поиск'); }
    function показать(закрепить) {
      clearTimeout(тО); clearTimeout(тЗ);
      if (!открыта) {
        var а = D.activeElement, п = поле();
        if (а && п && п.contains(а)) {                                       /* подсказки поиска не должны лежать под панелью: Escape (его понимает ish-search.js) + снять фокус */
          try { а.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true })); } catch (e) {}
          if (а.blur) а.blur();
        }
        пн.hidden = false; открыта = true;
        кн.setAttribute('aria-expanded', 'true'); обёртка.classList.add('ishp24--open');
      }
      закреплена = !!закрепить;
    }
    function скрыть(вернуть) {
      clearTimeout(тО); clearTimeout(тЗ);
      if (!открыта) return;
      пн.hidden = true; открыта = false; закреплена = false;
      кн.setAttribute('aria-expanded', 'false'); обёртка.classList.remove('ishp24--open');
      if (вернуть) кн.focus();
    }

    /* наведение: открытие и закрытие с задержкой 150 мс; пока курсор над кнопкой или панелью, закрытие отменяется */
    обёртка.addEventListener('mouseenter', function () {
      clearTimeout(тЗ);
      if (!hoverOk() || !wide() || открыта) return;
      clearTimeout(тО); тО = setTimeout(function () { показать(false); }, DELAY);
    });
    обёртка.addEventListener('mouseleave', function () {
      clearTimeout(тО);
      if (!открыта || закреплена) return;
      clearTimeout(тЗ); тЗ = setTimeout(function () { скрыть(false); }, DELAY);
    });
    /* клик / Enter / Space: открытое по наведению - закрепить; закреплённое - закрыть */
    кн.addEventListener('click', function (e) {
      e.preventDefault();
      if (открыта && закреплена) скрыть(false);
      else показать(true);
    });
    кн.addEventListener('keydown', function (e) {
      if ((e.key === 'ArrowDown' || e.key === 'Down') && !e.altKey) {
        e.preventDefault(); показать(true);
        var п = пн.querySelector('a'); if (п) п.focus();
      }
    });
    пн.addEventListener('keydown', function (e) {
      var к = e.key;
      if (к !== 'ArrowDown' && к !== 'ArrowUp') return;
      var все = [].slice.call(пн.querySelectorAll('a')), i = все.indexOf(D.activeElement);
      if (i < 0) return;
      e.preventDefault();
      все[к === 'ArrowDown' ? Math.min(все.length - 1, i + 1) : Math.max(0, i - 1)].focus();
    });
    D.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && открыта) скрыть(обёртка.contains(D.activeElement));
    });
    D.addEventListener('click', function (e) { if (открыта && !обёртка.contains(e.target)) скрыть(false); }, true);
    D.addEventListener('focusin', function (e) {
      if (!открыта) return;
      var п = поле();
      if (!обёртка.contains(e.target) || (п && п.contains(e.target))) скрыть(false);   /* Tab ушёл дальше или фокус в поиске */
    });
    /* ушли на телефонную ширину - закрыть (кнопка и панель скрыты в CSS) */
    var mq = W.matchMedia && W.matchMedia('(min-width:981px)');
    if (mq) {
      var при = function () { if (!mq.matches) скрыть(false); };
      if (mq.addEventListener) mq.addEventListener('change', при); else if (mq.addListener) mq.addListener(при);
    }
    return true;
  }

  function until(fn) {
    var n = 0;
    (function step() { var ok = false; try { ok = fn(); } catch (e) {} if (!ok && ++n < 32) setTimeout(step, 250); })();
  }

  /* CSS: рядом с этим файлом. Без стилей кнопку не строим (иначе мелькнёт голая кнопка). */
  function старт() {
    if (!wide()) return;
    var ссылка = D.getElementById('ishp24-css');
    var ждать = function () { until(собрать); };
    if (ссылка) { ждать(); return; }
    var src = tag && tag.src;
    if (!src) return;
    ссылка = D.createElement('link');
    ссылка.id = 'ishp24-css'; ссылка.rel = 'stylesheet';
    ссылка.href = src.replace(/ish-design-p24\.js.*$/, 'ish-design-p24.css' + ((src.match(/\?.*$/) || [''])[0]));
    ссылка.onload = ждать;
    D.head.appendChild(ссылка);
  }

  /* страница открыта на узком экране и потом расширена (поворот, окно): строим, когда стало >=981 */
  if (wide()) старт();
  else if (W.matchMedia) {
    var m0 = W.matchMedia('(min-width:981px)');
    var ждём = function () { if (m0.matches) { if (m0.removeEventListener) m0.removeEventListener('change', ждём); старт(); } };
    if (m0.addEventListener) m0.addEventListener('change', ждём);
  }
})();
