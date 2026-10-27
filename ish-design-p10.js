/* ish-design-p10.js  v5.4  (26.10.2026: липкая панель без «Цена с НДС»; v5.3: «Получить КП и счёт» всегда ведёт на /spec#kp, корзина читается из window.tcart; никогда не /podbor; прежняя v5.2 23.10.2026: поле файла Uploadcare по-русски, контурная кнопка; ISH_P10_FILEBTN_OFF; прежняя v5.1 22.10.2026: ?code= на /podbor, ISH_PODBOR_CODE_OFF; прежняя v5 18.10.2026)  П10 «карточка товара: внешний слой» b2b.isoft-shop.kz
   Подключается строкой в HEAD/подвале ТОЛЬКО для страниц карточки (/tproduct/...). Блок 4055071703 (запас 251 знак) не правится.
   Ждёт, пока фрагмент v8p7 соберёт карточку (html.ishpg-on), и ДОБАВЛЯЕТ узлы с префиксом ishp10-. Чужих узлов не переписывает,
   «В корзину» не перекрашивает и не подменяет: все кнопки-двойники кликают ЧЕРЕЗ родную .ishpg-add (одно место добавления в корзину).
   Пункты: Т9 «Запросить КП» · Т10 предел и цифровая клавиатура · Т11/М6 кнопки −/+ 40×44 · Т13/М7 зебра (css) · Т16/Ик7 копирование артикула
           Т17 бренд ссылкой · Т18 умные крошки · Т19 «К разделу» скромнее · Т20 липкая панель на десктопе и для товара без цены
           Ик5 иконка ошибки у поля (css) · Ик6 лупа и просмотр фото · Фт4 без прыжка при загрузке фото (css).
   v5: «Тема запроса» не теряет текст, дописанный сразу за меткой; тема «Подбор техники» -> «Документ» = «Подбор» и свой текст успеха (см. docPodbor).
   v4 (Фр6/Фр8): на /podbor БИН необязателен (с поля снимаются data-tilda-req / aria-required, подпись «БИН/ИИН — 12 цифр (необязательно)»; имя поля li_nm и маска/правило «только цифры» остаются) и «Тема запроса» чипами («Подбор техники», «Счёт по списку», «Госзакупка», «Другое»): выбор пишется ОДНОЙ строкой в НАЧАЛО поля «Комментарий» («Тема запроса: X · текст»), нового поля Tilda нет. Выключатели: window.ISH_P10_SKIP='form' (оба), 'bin' (только БИН), 'topic' (только тема).
   v3 (Т4): «Уточнить по этому товару» / «Запросить КП» (запасной путь на /podbor) кладут название, артикул и цену в sessionStorage 'ishp10_ask'; на /podbor пустое поле «Список позиций» (иначе «Комментарий») получает «Уточнить по товару: <название>, Арт. iSoft <арт>, <цена>». Нет данных или формы - ничего не делает. Частично: SKIP 'ask'.
   Откат: пустой файл на Pages (ничего не делает) или window.ISH_P10_OFF=1 до загрузки. Пустой/недоступный .css: интерфейс не строится.
   Частично: window.ISH_P10_SKIP='kp,qty,copy,brand,crumbs,back,bar,zoom' (без пробелов). Страница /spec#kp (если файл подгружен и там): выбирает «КП». */
(function () {
  'use strict';
  var W = window, D = document, H = D.documentElement;
  if (W.__ishP10 || W.ISH_P10_OFF) return;
  var path = location.pathname.replace(/\/+$/, '');
  var isCard = path.indexOf('/tproduct/') > -1, isSpec = path === '/spec', isForm = isSpec || path === '/podbor';
  if (!isCard && !isForm) return;      /* /spec и /podbor: только css (Ик5 ошибки полей) и выбор «КП» по #kp */
  W.__ishP10 = 'v1';
  var ME = D.currentScript;
  var SKIP = ',' + String(W.ISH_P10_SKIP || '') + ',';
  function off(n) { return SKIP.indexOf(',' + n + ',') > -1; }
  var MAX = 999;                                  /* Т10: предел количества в одной позиции */
  var TREE = /*TREE*/{"noutbuki":["Ноутбуки","kompyutery","Компьютеры"],"sistemnye-bloki":["Системные блоки","kompyutery","Компьютеры"],"monobloki":["Моноблоки","kompyutery","Компьютеры"],"mini-pk-i-rabochie-stancii":["Мини-ПК","kompyutery","Компьютеры"],"monitory":["Мониторы","monitory-i-ekrany","Мониторы и экраны"],"televizory":["Телевизоры","monitory-i-ekrany","Мониторы и экраны"],"proektory-i-paneli":["Проекторы","monitory-i-ekrany","Мониторы и экраны"],"kronshteyny-i-krepleniya":["Кронштейны для мониторов и ТВ","monitory-i-ekrany","Мониторы и экраны"],"processory":["Процессоры","komplektuyushchie","Комплектующие"],"materinskie-platy":["Материнские платы","komplektuyushchie","Комплектующие"],"operativnaya-pamyat":["Оперативная память","komplektuyushchie","Комплектующие"],"videokarty":["Видеокарты","komplektuyushchie","Комплектующие"],"ohlazhdenie":["Охлаждение","komplektuyushchie","Комплектующие"],"korpusa-i-bloki-pitaniya":["Корпуса","komplektuyushchie","Комплектующие"],"bloki-pitaniya":["Блоки питания","komplektuyushchie","Комплектующие"],"ssd-nakopiteli":["SSD-накопители","nakopiteli","Накопители"],"zhestkie-diski":["Жёсткие диски","nakopiteli","Накопители"],"fleshki-i-karty-pamyati":["USB-флешки","nakopiteli","Накопители"],"karty-pamyati":["Карты памяти","nakopiteli","Накопители"],"setevoe-oborudovanie":["Сетевое оборудование","set-i-servery","Сетевое оборудование"],"marshrutizatory":["Маршрутизаторы (роутеры)","set-i-servery","Сетевое оборудование"],"tochki-dostupa":["Точки доступа Wi-Fi","set-i-servery","Сетевое оборудование"],"setevye-karty":["Сетевые карты и адаптеры","set-i-servery","Сетевое оборудование"],"ibp-i-zashchita-pitaniya":["ИБП","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"servery-i-shd":["Системы хранения","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"printery":["Принтеры","ofis-i-rabochee-mesto","Печать и сканирование"],"mfu":["МФУ","ofis-i-rabochee-mesto","Печать и сканирование"],"plottery":["Плоттеры","ofis-i-rabochee-mesto","Печать и сканирование"],"skanery-dokumentov":["Сканеры документов","ofis-i-rabochee-mesto","Печать и сканирование"],"klaviatury":["Клавиатуры","svyaz-i-videonablyudenie","Рабочее место"],"klaviatury-i-myshi":["Мыши","svyaz-i-videonablyudenie","Рабочее место"],"videonablyudenie":["Камеры видеонаблюдения","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"servery":["Серверы","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"mezhsetevye-ekrany":["Межсетевые экраны","set-i-servery","Сетевое оборудование"],"videoregistratory":["Видеорегистраторы","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"skud-i-turnikety":["СКУД и турникеты","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"domofony":["Домофоны","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"shkafy-i-stoyki":["Шкафы и стойки","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"konferenc-svyaz":["IP-телефоны","set-i-servery","Сетевое оборудование"],"naushniki-i-garnitury":["Наушники и гарнитуры","svyaz-i-videonablyudenie","Рабочее место"],"skanery-shtrihkoda":["Сканеры штрихкода","torgovoe-oborudovanie","Торговое оборудование"],"terminaly-sbora-dannyh":["Терминалы сбора данных","torgovoe-oborudovanie","Торговое оборудование"],"printery-etiketok":["Принтеры этикеток","torgovoe-oborudovanie","Торговое оборудование"]}/*ENDTREE*/;               /* slug раздела -> [имя, slug группы, имя группы]; из ДЕРЕВО_КАТАЛОГА.json 21.09 */
  /* СКС (20.10, НЕ включено): крошки карточки - Каталог › Сетевое оборудование › раздел (страницы-узла нет). Включает window.ISH_SKS_ON. */
  if (W.ISH_SKS_ON) { var СКС_Д = {"kabel-vitaya-para":["Кабель витая пара","set-i-servery","Сетевое оборудование"],"rozetki-i-moduli":["Розетки и модули","set-i-servery","Сетевое оборудование"],"patch-paneli":["Патч-панели","set-i-servery","Сетевое оборудование"],"patch-kordy":["Патч-корды","set-i-servery","Сетевое оборудование"],"kabel-kanaly-i-koroba":["Кабель-каналы и короба","set-i-servery","Сетевое оборудование"],"konnektory-i-instrument":["Коннекторы и инструмент","set-i-servery","Сетевое оборудование"]}; Object.keys(СКС_Д).forEach(function (k) { if (!TREE[k]) TREE[k] = СКС_Д[k]; }); }

  function step(n, f) { try { f(); } catch (e) { if (W.console) console.warn('ishp10 ' + n + ':', e && e.message); } }
  function until(fn, max, every) {
    var i = 0;
    (function go() { var ok = false; try { ok = fn(); } catch (e) { ok = false; } if (!ok && ++i < (max || 48)) setTimeout(go, every || 250); })();
  }
  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function txt(e) { return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function mk(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function money(n) { return String(Math.round(parseFloat(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
  function priceOf() {
    var e = q('.ishpg3-panel .js-store-prod-price-val') || q('.t-store__prod-popup__info .js-store-prod-price-val');
    return parseFloat(String(e ? e.textContent : '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  }
  var SVG = function (p) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; };
  var IC = {
    copy: SVG('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    ok: SVG('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    doc: SVG('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'),
    zoom: SVG('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M11 8v6M8 11h6"/>'),
    cart: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M1 1h2.2l2 10.5h9.3l1.8-7.5H4.4"/><circle cx="6.5" cy="15.5" r="1.3"/><circle cx="13.5" cy="15.5" r="1.3"/></svg>',
    x: SVG('<path d="M6 6l12 12M18 6 6 18"/>'),
    l: SVG('<path d="M15 5l-7 7 7 7"/>'),
    r: SVG('<path d="M9 5l7 7-7 7"/>')
  };

  /* ── уведомление (одно на страницу) ── */
  var toastT = 0;
  function toast(t) {
    var e = q('.ishp10-toast');
    if (!e) { e = mk('div', 'ishp10-toast'); e.setAttribute('role', 'status'); e.setAttribute('aria-live', 'polite'); D.body.appendChild(e); }
    e.textContent = t; e.classList.add('ishp10-on');
    clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('ishp10-on'); }, 2600);
  }

  /* ── Т10 + Т11: количество ── */
  function qty() {
    var box = q('.ishpg-qty'); if (!box || box.getAttribute('data-ishp10')) return;
    box.setAttribute('data-ishp10', '1');
    var inp = q('input', box), bs = qa('button', box); if (!inp || bs.length < 2) return;
    inp.setAttribute('inputmode', 'numeric'); inp.setAttribute('pattern', '[0-9]*'); inp.setAttribute('min', '1'); inp.setAttribute('max', String(MAX));
    inp.setAttribute('enterkeyhint', 'done'); inp.setAttribute('autocomplete', 'off');
    function val() { var v = parseInt(inp.value, 10); return v >= 1 ? v : 1; }
    function sync() { var v = val(); bs[0].disabled = v <= 1; bs[1].disabled = v >= MAX; }
    function lim() { if (parseInt(inp.value, 10) > MAX) { inp.value = MAX; toast('Не больше ' + MAX + ' шт. в одной позиции. Для большой партии запросите КП.'); } }
    inp.addEventListener('input', function () { var d = inp.value.replace(/\D/g, '').slice(0, 4); if (d !== inp.value) inp.value = d; lim(); sync(); });
    inp.addEventListener('blur', function () { lim(); inp.value = val(); sync(); });
    inp.addEventListener('focus', function () { try { inp.select(); } catch (e) {} });
    bs[0].addEventListener('click', sync);
    bs[1].addEventListener('click', function () { lim(); sync(); });
    sync();
  }

  /* сколько штук лежит в родной корзине Tilda. 26.10: сначала живой объект window.tcart (он обновляется сразу, как у блока /spec),
     localStorage - запасной: он пишется позже и в закрытом режиме браузера недоступен совсем */
  function cartObj() {
    var c = W.tcart;
    if (!c || !c.products) { try { c = JSON.parse(localStorage.getItem('tcart') || '{}'); } catch (e) { c = {}; } }
    return c && c.products ? c : { products: [] };
  }
  function cartQ() {
    var n = 0; try { cartObj().products.forEach(function (p) { if (p && p.deleted !== 'yes') n += parseFloat(p.quantity) || 1; }); } catch (e) {}
    return n;
  }
  function cartHas(uid) {
    if (!uid) return false;
    try { return cartObj().products.some(function (p) { return p && p.deleted !== 'yes' && String(p.uid) === String(uid); }); } catch (e) { return false; }
  }
  /* ── Т4: данные товара для формы /podbor (sessionStorage 'ishp10_ask', живёт 1 час; запасной источник - ?model=&art= из ссылки) ── */
  var ASK_KEY = 'ishp10_ask', ASK_TTL = 3600 * 1000;
  function askSave() {
    try {
      var n = txt(q('.js-store-prod-name')), a = txt(q('.t-store__prod-popup__sku .js-store-prod-sku') || q('.js-store-prod-sku'));
      if (!n && !a) return;
      sessionStorage.setItem(ASK_KEY, JSON.stringify({ n: n, a: a, p: priceOf(), t: Date.now() }));
    } catch (e) {}
  }
  function askLine(d) {
    if (d.c) return 'Код подбора: ' + d.c;      /* 22.10: ?code= из бота (ISH_PODBOR_CODE_OFF) */
    var parts = [];
    if (d.n) parts.push(d.n);
    if (d.a) parts.push(/^арт/i.test(d.a) ? d.a : 'Арт. iSoft ' + d.a);
    if (d.p > 0) parts.push(money(d.p));
    return parts.length ? 'Уточнить по товару: ' + parts.join(', ') : '';
  }
  function askRead() {
    var d = null;
    if (!W.ISH_PODBOR_CODE_OFF) {      /* 22.10: /podbor?code=А12 -> «Код подбора: А12» в Список позиций/Комментарий (Tilda сама параметры в поле не кладёт) */
      try {
        var c = /[?&]code=([^&#]*)/.exec(location.search);
        if (c) { c = decodeURIComponent(c[1].replace(/\+/g, ' ')).replace(/[^0-9A-Za-zА-Яа-яЁё_-]/g, '').slice(0, 24); if (c) return { c: c }; }
      } catch (e) {}
    }
    try { d = JSON.parse(sessionStorage.getItem(ASK_KEY) || 'null'); } catch (e) {}
    if (d && d.t && Date.now() - d.t < ASK_TTL) return d;
    try {
      var m = /[?&]model=([^&]*)/.exec(location.search), a = /[?&]art=([^&]*)/.exec(location.search);
      if (m || a) return { n: m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '', a: a ? decodeURIComponent(a[1].replace(/\+/g, ' ')) : '', p: 0 };
    } catch (e) {}
    return null;
  }
  function askSetVal(el, v) {
    var proto = el.tagName === 'TEXTAREA' ? W.HTMLTextAreaElement.prototype : W.HTMLInputElement.prototype;
    var ds = Object.getOwnPropertyDescriptor(proto, 'value');
    if (ds && ds.set) ds.set.call(el, v); else el.value = v;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
  }
  function askFill() {
    var d = askRead(), line = d && askLine(d); if (!line) return;
    until(function () {
      var f = q('form.t-form, form.js-form-proccess'); if (!f) return false;
      var el = q('[name^="Список позиций"]', f) || q('[name^="Комментарий"]', f);
      if (!el) return false;
      if (String(el.value || '').trim() === '') askSetVal(el, line);      /* чужой текст не затираем */
      try { sessionStorage.removeItem(ASK_KEY); } catch (e) {}
      return true;
    }, 40, 250);
  }
  function askBind() {
    D.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('.ishpg3-ask') : null;
      if (t) askSave();
    }, true);
  }

  /* ── Фр6/Фр8: форма /podbor — БИН необязателен + тема запроса чипами ── */
  var TOPICS = ['Подбор техники', 'Счёт по списку', 'Госзакупка', 'Другое'];
  var TOPIC_PRE = 'Тема запроса: ';
  var TOPIC_RE = /^Тема запроса:\s*(?:Подбор техники|Счёт по списку|Госзакупка|Другое)(?:\s*·\s*|\s*\n\s*|\s+|$)/;   /* v5: метка кончается на названии темы - текст, дописанный сразу за ней без «·», не становится частью темы */
  function topicSplit(v) {                          /* → {t: тема|'', rest: текст без метки} */
    v = String(v || '');
    var m = TOPIC_RE.exec(v), t = '';
    if (m) { t = m[0].replace(/^Тема запроса:\s*/, '').replace(/\s*(?:·|\n)\s*$/, '').trim(); v = v.slice(m[0].length); }
    return { t: t, rest: v.replace(/^\s+/, '') };
  }
  function topicJoin(t, rest) { return t ? (TOPIC_PRE + t + (rest ? ' · ' + rest.replace(/\s*\n+\s*/g, ' ') : '')) : rest; }
  function binOptional(f) {
    var inp = q('[name^="БИН"]', f); if (!inp) return;
    ['data-tilda-req', 'aria-required'].forEach(function (a) { if (inp.hasAttribute(a)) inp.removeAttribute(a); });
    if (!inp.hasAttribute('data-tilda-rule-minlength')) inp.setAttribute('data-tilda-rule-minlength', '12');   /* без req пустое поле проходит, а короткое (1-11 цифр) штатный валидатор Tilda по-прежнему останавливает */
    var g = inp.closest ? inp.closest('.t-input-group') : null;
    var lab = g && q('.t-input-title, label', g);
    if (lab && !lab.children.length) { lab.textContent = 'БИН/ИИН — 12 цифр (необязательно)'; lab.__ishp28 = 1; }   /* __ishp28: п28 больше не вернёт звёздочку */
    if (!inp.getAttribute('data-ishp10-ph')) { inp.setAttribute('placeholder', '12 цифр, если нужен счёт'); inp.setAttribute('data-ishp10-ph', '1'); }
  }
  /* v5: тема «Подбор техники» -> скрытое «Документ» = «Подбор» и свой текст успеха (автоматического счёта у подбора нет).
     Слушатель на самой форме (capture): срабатывает ПОСЛЕ блока «Счёт/КП» на document (он ставит «Счёт»/свой текст) и ДО обработчика Tilda на кнопке.
     КП не трогаем: если выбрано «Коммерческое предложение», значение и текст остаются его. */
  var OK_PODBOR = 'Мы получили ваш список. Менеджер подберёт технику и пришлёт предложение на указанную почту. Если письма нет — проверьте папку «Спам» или позвоните +7 775 881 85 31.';
  function docPodbor(f, com) {
    if (f.__ishp10doc) return; f.__ishp10doc = 1;
    f.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[type="submit"]') : null; if (!b) return;
      if (topicSplit(com.value).t !== 'Подбор техники') return;
      var d = q('input[name="Документ"]', f);
      if (d && d.value === 'Счёт') d.value = 'Подбор';
      var sb = q('.js-successbox', f);
      if (sb && /Счёт придёт/.test(sb.getAttribute('data-success-message') || '')) sb.setAttribute('data-success-message', OK_PODBOR);
    }, true);
  }
  function topicChips(f) {
    if (q('.ishp10-topic', f)) return;
    var com = q('[name^="Комментарий"]', f) || q('[name^="Список позиций"]', f); if (!com) return;
    var first = q('.t-input-group', f); if (!first || !first.parentNode) return;
    var box = mk('div'); box.className = 'ishp10-topic';
    box.innerHTML = '<div class="ishp10-topic__t" id="ishp10-topic-t">Тема запроса <span>необязательно</span></div><div class="ishp10-topic__r" role="radiogroup" aria-labelledby="ishp10-topic-t"></div>';
    var row = q('.ishp10-topic__r', box), btns = [];
    TOPICS.forEach(function (name) {
      var b = mk('button'); b.type = 'button'; b.className = 'ishp10-chip'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
      b.setAttribute('data-topic', name); b.textContent = name; row.appendChild(b); btns.push(b);
    });
    function mark(t) { btns.forEach(function (b) { var on = b.getAttribute('data-topic') === t; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.classList.toggle('is-on', on); }); }
    function apply(t) {
      var cur = topicSplit(com.value), nv = topicJoin(t, cur.rest);
      if (nv !== com.value) askSetVal(com, nv);
      mark(t);
    }
    box.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.ishp10-chip') : null; if (!b) return;
      var t = b.getAttribute('data-topic'), cur = topicSplit(com.value).t;
      apply(cur === t ? '' : t);                        /* повторный клик снимает выбор */
    });
    first.parentNode.insertBefore(box, first);
    docPodbor(f, com);
    mark(topicSplit(com.value).t);
    ['input', 'change'].forEach(function (ev) { com.addEventListener(ev, function () { mark(topicSplit(com.value).t); }); });   /* чип следует за полем: стёр метку - выбор снят */
  }
  /* ── v5.2 (23.10): поле «Приложить файл» (Uploadcare Tilda): надписи по-русски и контурная кнопка, как чипы темы. Выключатель: window.ISH_P10_FILEBTN_OFF.
     Tilda сама ставит UPLOADCARE_LOCALE="" и строит виджет, поэтому локаль ru только пробуем (до инициализации), а надписи переписываем наблюдателем.
     Стиль кнопки ставим inline с !important: родной блок задаёт цвет и рамку правилом по id блока (со своим !important), css-файлом его не перебить. ── */
  var UC_RU = { 'Choose a file': 'Выбрать файл', 'Choose files': 'Выбрать файлы', 'Drop a file here': 'Перетащите файл сюда', 'Drop files here': 'Перетащите файлы сюда', 'Cancel': 'Отмена', 'Remove': 'Удалить', 'Loading...': 'Загрузка...', 'Loading…': 'Загрузка…', 'Uploading...': 'Загрузка...', 'Uploading…': 'Загрузка…', 'Uploaded': 'Загружено', 'File uploaded': 'Файл загружен', 'Uploading failed': 'Не удалось загрузить' };
  function ucRu(t) {
    var x = String(t || '').replace(/^\s+|\s+$/g, ''); if (!x) return t;
    if (UC_RU[x]) return UC_RU[x];
    var m = /^(Uploading\.\.\.|Uploading…)\s*(\d+%?)?$/.exec(x); if (m) return 'Загрузка… ' + (m[2] || '');
    m = /^(\d+)\s+files?$/.exec(x); if (m) return m[1] + ' ' + (m[1] === '1' ? 'файл' : 'файлов');
    return t;
  }
  function ucStyle(b) {
    var st = {
      'background': '#fff', 'background-color': '#fff', 'color': '#2B44C7', 'border': '1px solid #2B44C7', 'border-style': 'solid', 'border-width': '1px',
      'border-radius': '22px', 'box-shadow': 'none', 'min-height': '44px', 'height': '44px', 'padding': '0 18px', 'font': '500 15px/1.2 ' + (getComputedStyle(H).getPropertyValue('--f') || 'TildaSans,Arial,sans-serif'),
      'cursor': 'pointer'
    };
    for (var k in st) b.style.setProperty(k, st[k], 'important');
  }
  function fileBtn() {
    var seen = 0;
    function pass() {
      qa('.t-uploadcare .uploadcare--widget').forEach(function (w) {
        qa('.uploadcare--widget__dragndrop-area, .uploadcare--widget__text, .uploadcare--widget__button', w).forEach(function (n) {
          n.childNodes.forEach(function (c) { if (c.nodeType === 3) { var r = ucRu(c.nodeValue); if (r !== c.nodeValue) c.nodeValue = r; } });
        });
        var o = q('.uploadcare--widget__button_type_open', w);
        if (o && !o.__ishp10uc) { o.__ishp10uc = 1; ucStyle(o); o.classList.add('ishp10-filebtn'); }
        ['cancel', 'remove'].forEach(function (k) {
          var b = q('.uploadcare--widget__button_type_' + k, w);
          if (b && !b.__ishp10uc) { b.__ishp10uc = 1; b.classList.add('ishp10-filelink'); }
        });
        w.classList.add('ishp10-uc'); seen = 1;
      });
    }
    pass();
    var box = q('.t-uploadcare') && q('.t-uploadcare').closest ? q('.t-uploadcare').closest('form') : null;
    if (W.MutationObserver) new MutationObserver(function () { try { pass(); } catch (e) {} }).observe(box || D.body, { childList: true, subtree: true, characterData: true });
  }
  function podborForm() {
    until(function () {
      var f = q('form.t-form, form.js-form-proccess'); if (!f || !q('[name^="Комментарий"], [name^="Список позиций"]', f)) return false;
      if (!off('bin')) step('bin', function () { binOptional(f); });
      if (!off('topic')) step('topic', function () { topicChips(f); });
      if (!off('filebtn') && !W.ISH_P10_FILEBTN_OFF) step('filebtn', fileBtn);
      return true;
    }, 40, 250);
  }

  /* ── Т9: вторичное «Запросить КП» ── */
  function kp() {
    if (q('.ishp10-kp') || H.classList.contains('ishpg-nopr')) return;
    var main = q('.ishpg-add'), buy = q('.ishpg-buy'); if (!main || !buy) return;
    var ask = q('.ishpg3-ask'), a = mk('a', 'ishp10-kp', IC.doc + '<span>Получить КП и счёт</span>');
    a.href = '/spec#kp'; a.setAttribute('title', 'Положим товар в корзину и откроем заявку на КП');
    if (ask && ask.parentNode) ask.parentNode.insertBefore(a, ask); else buy.parentNode.insertBefore(a, buy.nextSibling);
    a.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      var n0 = cartQ(), t0 = Date.now(), pr = q('[data-product-uid]'), uid = pr ? pr.getAttribute('data-product-uid') : '';
      main.click();                                    /* кладём через родную кнопку: те же проверки, то же окошко «Добавлено» */
      try { sessionStorage.setItem('ishp10_doc', 'kp'); } catch (x) {}
      /* 26.10: на /spec ведём ВСЕГДА. Раньше, если за 1,5 с количество в localStorage не выросло, уводило на /podbor с текстом «Уточнить по товару»
         (живой тест 26.10: товар в корзину лёг, а открылась форма подбора). Теперь признак - товар уже лежит в корзине (живой window.tcart),
         рост количества или тайм-аут; корзину на /spec читает сама страница, в крайнем случае там будет пусто и ссылка в каталог. */
      (function wait() {
        if (cartQ() > n0 || cartHas(uid) || Date.now() - t0 > 1500) { setTimeout(function () { location.href = '/spec#kp'; }, 200); return; }
        setTimeout(wait, 100);
      })();
    });
  }

  /* ── Т16 + Ик7: копирование артикула ── */
  function copyText(t) {
    if (W.navigator && navigator.clipboard && W.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, no) {
      try {
        var a = mk('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        D.body.appendChild(a); a.select(); var r = D.execCommand('copy'); D.body.removeChild(a); r ? ok() : no();
      } catch (e) { no(e); }
    });
  }
  function copy() {
    var wrap = q('.t-store__prod-popup__sku'), sp = wrap && q('.js-store-prod-sku', wrap);
    if (!sp || q('.ishp10-copy', wrap)) return;
    qa('.ishp9-cp', wrap).forEach(function (n) { n.parentNode.removeChild(n); });   /* одна иконка: кнопку П9 убираем */
    var sku = txt(sp); if (!sku) return;
    var b = mk('button', 'ishp10-copy', IC.copy); b.type = 'button';
    b.setAttribute('aria-label', 'Скопировать артикул ' + sku); b.title = 'Скопировать артикул';
    wrap.classList.add('ishp10-skuw'); sp.parentNode.insertBefore(b, sp.nextSibling);
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      copyText(sku).then(function () {
        b.innerHTML = IC.ok; b.classList.add('ishp10-done'); toast('Артикул ' + sku + ' скопирован');
        setTimeout(function () { b.innerHTML = IC.copy; b.classList.remove('ishp10-done'); }, 1600);
      }, function () { toast('Не удалось скопировать. Артикул: ' + sku); });
    });
  }

  /* ── Т17: бренд обычной ссылкой ──
     Адреса фильтра бренда на карточке нет (id каталога раздела с карточки не виден), есть общий поиск сайта /?q=…#catalog
     (тот же адрес строит шапка). Когда линия фильтров даст адрес — поменять только эту функцию. */
  function brandHref(b) { return '/?q=' + encodeURIComponent(b) + '#catalog'; }
  function brand() {
    var sp = q('.t-store__prod-popup__brand .js-product-brand'); if (!sp || sp.parentNode.classList.contains('ishp10-brand')) return;
    var b = txt(sp); if (!b || /^(без бренда|нет|no ?brand|-+)$/i.test(b)) return;
    var a = mk('a', 'ishp10-brand'); a.href = brandHref(b); a.title = 'Найти товары бренда ' + b;
    sp.parentNode.insertBefore(a, sp); a.appendChild(sp);
  }

  /* ── Т18 + Т19: крошки и скромная «К разделу» ── */
  function crumbs() {
    var top = q('.ishpg-top'); if (!top || q('.ishp10-crumbs', top)) return;
    var slug = (/^\/([^\/?#]+)\/tproduct\//.exec(location.pathname) || [])[1] || '', t = TREE[slug], items = [];
    items.push(['Каталог', '/#catalog']);
    if (t) {
      var gl = qa('a[href="/' + t[1] + '"]').filter(function (x) { return !x.closest('.ishp10-crumbs'); })[0];
      items.push([t[2], gl ? '/' + t[1] : '']);
      items.push([t[0], '/' + slug]);
    } else {
      var l = slug && qa('a[href="/' + slug + '"]').filter(function (x) { return !x.closest('.ishpg-top,.ishpg-p2,.ishp10-crumbs') && txt(x) && txt(x).length < 45; })[0];
      if (!l) return;
      items.push([txt(l), '/' + slug]);
    }
    var name = txt(q('.t-store__prod-popup__info .js-store-prod-name'));
    if (name) items.push([name, '']);
    var nav = mk('nav', 'ishp10-crumbs'); nav.setAttribute('aria-label', 'Навигация по каталогу');
    var ol = mk('ol'); nav.appendChild(ol);
    items.forEach(function (it, i) {
      var li = mk('li'), last = i === items.length - 1;
      if (it[1] && !last) { var a = mk('a'); a.href = it[1]; a.textContent = it[0]; li.appendChild(a); }
      else { var s = mk('span'); s.textContent = it[0]; if (last) { s.setAttribute('aria-current', 'page'); s.title = it[0]; } li.appendChild(s); }
      ol.appendChild(li);
    });
    top.appendChild(nav);
  }
  function back() {
    var sp = q('.ishpg-back span'); if (sp && txt(sp) === 'Назад') sp.textContent = 'К разделу';
  }

  /* ── Т20: липкая панель на десктопе и для товара без цены ── */
  function bar() {
    if (q('.ishp10-sticky')) return;
    var main = q('.ishpg-add'); if (!main) return;
    var nopr = H.classList.contains('ishpg-nopr'), pr = priceOf();
    if (!nopr && !(pr > 0)) return;
    /* на телефоне (<=700) у товара С ЦЕНОЙ работает родная панель v8p7 (.ishpg3-sticky): наша там не показывается. Без цены - наша, если родная не видна. */
    function nativeOn() { var n = q('.ishpg3-sticky'); return !!n && (n.classList.contains('ishpg3-show') || (getComputedStyle(n).visibility !== 'hidden' && n.getBoundingClientRect().top < W.innerHeight - 1)); }
    var label = txt(q('span', main)) || (nopr ? 'Запросить цену' : 'В корзину');
    var name = txt(q('.t-store__prod-popup__info .js-store-prod-name'));
    var el = mk('div', 'ishp10-sticky' + (nopr ? ' ishp10-nopr' : ''),
      '<div class="ishp10-sn"><span class="ishp10-sname"></span><span class="ishp10-sp"><b></b><small></small></span></div>' +
      '<button type="button" class="ishp10-sbtn" tabindex="-1">' + IC.cart + '<span></span></button>');
    q('.ishp10-sname', el).textContent = name;
    q('b', el).textContent = nopr ? 'Цена по запросу' : money(pr);
    q('small', el).textContent = nopr ? 'Цена по запросу' : '';   /* 26.10: «Цена с НДС» убрано (решение владельца) */
    var btn = q('.ishp10-sbtn', el), bl = q('span', btn); bl.textContent = label;
    el.setAttribute('aria-hidden', 'true'); D.body.appendChild(el);
    var wide = W.matchMedia ? W.matchMedia('(min-width:701px)') : null, raf = 0;
    function isWide() { return wide ? wide.matches : W.innerWidth > 700; }
    function upd() {
      raf = 0;
      var r = main.getBoundingClientRect(), gone = isWide() ? r.bottom < 64 : (r.bottom <= 0 || r.top >= W.innerHeight);
      var show = (isWide() || (nopr && !(priceOf() > 0) && !nativeOn())) && gone && !q('.ishp10-lb');
      el.classList.toggle('ishp10-show', show); el.setAttribute('aria-hidden', show ? 'false' : 'true'); btn.tabIndex = show ? 0 : -1;
      H.classList.toggle('ishp10-pad', nopr || isWide());
      var t = q('.нш-мт'), off = 0;
      if (t && !isWide()) { var k = t.getBoundingClientRect(); if (k.height > 0 && k.bottom >= W.innerHeight - 2) off = Math.round(k.height); }
      el.style.bottom = off + 'px';
    }
    function sched() { if (!raf) raf = W.requestAnimationFrame ? W.requestAnimationFrame(upd) : setTimeout(upd, 16); }
    W.addEventListener('scroll', sched, { passive: true }); W.addEventListener('resize', sched);
    try {
      var mo = new MutationObserver(sched);
      mo.observe(D.body, { childList: true });
      (function watch() { var n = q('.ishpg3-sticky'); if (n) mo.observe(n, { attributes: true, attributeFilter: ['class', 'style'] }); else setTimeout(watch, 600); })();
    } catch (e) {}
    if (wide) { if (wide.addEventListener) wide.addEventListener('change', sched); else if (wide.addListener) wide.addListener(sched); }
    btn.addEventListener('click', function (e) {
      e.preventDefault(); var n0 = cartQ(), t0 = Date.now(); main.click();
      (function wait() {
        if (cartQ() > n0 || (nopr && main.classList.contains('ishpg-ok'))) {
          btn.classList.add('ishp10-ok'); bl.textContent = 'Добавлено ✓';
          setTimeout(function () { btn.classList.remove('ishp10-ok'); bl.textContent = label; }, 1400);
        } else if (Date.now() - t0 < 1500) setTimeout(wait, 100);
      })();
    });
    upd();
  }

  /* ── Ик6: лупа и просмотр фото крупно (родного zoom на этой галерее нет, см. README) ── */
  function slides() {
    var out = [], seen = {}, act = 0;
    qa('.ishpg-row .t-slds__item').forEach(function (it) {
      var n = q('.t-slds__bgimg', it) || q('img', it); if (!n) return;
      var u = n.getAttribute('data-original') || n.getAttribute('data-image-url') || n.getAttribute('data-img-zoom-url') || '';
      if (!u) { var m = /url\(["']?([^"')]+)/.exec(n.getAttribute('style') || ''); u = m ? m[1] : (n.getAttribute('src') || ''); }
      if (!u || /^data:/.test(u) || seen[u]) return;
      seen[u] = 1; if (it.classList.contains('t-slds__item_active')) act = out.length; out.push(u);
    });
    return { list: out, at: act };
  }
  function lightbox(list, at) {
    if (q('.ishp10-lb')) return;
    var prev = D.activeElement, i = at || 0, alt = txt(q('.t-store__prod-popup__info .js-store-prod-name'));
    var lb = mk('div', 'ishp10-lb'); lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Фото товара');
    lb.innerHTML = '<button type="button" class="ishp10-lbx" aria-label="Закрыть">' + IC.x + '</button>' +
      (list.length > 1 ? '<button type="button" class="ishp10-lbp" aria-label="Предыдущее фото">' + IC.l + '</button><button type="button" class="ishp10-lbn" aria-label="Следующее фото">' + IC.r + '</button>' : '') +
      '<img class="ishp10-lbi" alt=""><div class="ishp10-lbc"></div>';
    var im = q('.ishp10-lbi', lb), cn = q('.ishp10-lbc', lb); im.alt = alt;
    function show(k) { i = (k + list.length) % list.length; im.src = list[i]; cn.textContent = list.length > 1 ? (i + 1) + ' / ' + list.length : ''; }
    function close() { D.removeEventListener('keydown', key, true); if (lb.parentNode) lb.parentNode.removeChild(lb); H.classList.remove('ishp10-lock'); try { prev && prev.focus && prev.focus(); } catch (e) {} }
    function key(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft' && list.length > 1) show(i - 1);
      else if (e.key === 'ArrowRight' && list.length > 1) show(i + 1);
      else if (e.key === 'Tab') { var f = qa('button', lb); if (!f.length) return; var a = D.activeElement, k = f.indexOf(a); e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
    }
    lb.addEventListener('click', function (e) {
      var t = e.target;
      if (t === lb || t.classList.contains('ishp10-lbx') || t.closest('.ishp10-lbx')) close();
      else if (t.closest('.ishp10-lbp')) show(i - 1);
      else if (t.closest('.ishp10-lbn')) show(i + 1);
    });
    D.addEventListener('keydown', key, true);
    H.classList.add('ishp10-lock'); D.body.appendChild(lb); show(i); q('.ishp10-lbx', lb).focus();
  }
  function vis(e) {
    if (!e) return false;
    var cs = getComputedStyle(e), r = e.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0 && r.width > 0 && r.height > 0;
  }
  function zoom() {
    var col = q('.ishpg-row > .t-store__prod-popup__slider'); if (!col || q('.ishp10-zoom', col)) return;
    var b = mk('button', 'ishp10-zoom', IC.zoom); b.type = 'button'; b.setAttribute('aria-label', 'Смотреть фото крупно'); b.title = 'Смотреть фото крупно';
    col.appendChild(b);
    b.addEventListener('click', function (e) {
      e.preventDefault(); var s = slides();
      if (!s.list.length) { toast('Фото ещё загружается'); return; }
      /* Сначала родной просмотр Tilda (у фото класс t-zoomable): тот же, что открывается кликом по самому фото.
         Не открылся за 0,6 с (нет скрипта/стилей zoom) — наш просмотр. ISH_P10_ZOOM='own' — сразу наш. */
      var z = W.ISH_P10_ZOOM !== 'own' && (q('.ishpg-row .t-slds__item_active .t-zoomable') || q('.ishpg-row .t-zoomable')), zw = q('.t-zoomer__wrapper'), before = vis(zw);
      if (z) {
        try { z.click(); } catch (x) {}
        setTimeout(function () { if (q('.ishp10-lb')) return; var zw2 = q('.t-zoomer__wrapper'); if (!before && vis(zw2)) return; lightbox(s.list, s.at); }, 600);
      } else lightbox(s.list, s.at);
    });
  }

  /* ── /spec#kp: выбрать «Коммерческое предложение» (работает, только если файл подгружен и на /spec) ── */
  function specKp() {
    if (location.hash !== '#kp') return;
    until(function () { var b = q('#spDoc [data-d="kp"]'); if (!b) return false; b.click(); return true; }, 40, 250);
  }

  /* ── запуск: ждём css (признак — переменная --ishp10), потом карточку ── */
  function cssOk() { try { return getComputedStyle(H).getPropertyValue('--ishp10').trim() === '1'; } catch (e) { return false; } }
  function boot() {
    H.classList.add('ishp10-on');
    var me = ME || q('script[src*="ish-design-p10"]'), src = me && me.src ? me.src : '';
    var href = src ? src.replace(/ish-design-p10(\.src)?\.js/, 'ish-design-p10.css') : 'https://askhatjuve-ops.github.io/isoft-search/ish-design-p10.css?v=1';
    /* 18.10: Safari на onload иногда ещё не применил css (--ishp10 пуст) — ждём до 3 с, только потом сдаёмся */
    function go() {
      var n = 0;
      (function wait() {
        if (cssOk()) { run(); return; }
        if (++n < 30) { setTimeout(wait, 100); return; }
        H.classList.remove('ishp10-on');                           /* css пуст или недоступен: ничего не строим */
      })();
    }
    function run() {
      if (!isCard) { if (isSpec) step('spec', specKp); else { if (!off('ask')) step('ask', askFill); if (!off('form')) step('form', podborForm); } return; }
      if (!off('ask')) step('askbind', askBind);
      function mods() {
        if (!off('qty')) step('qty', qty);
        if (!off('kp')) step('kp', kp);
        if (!off('copy')) step('copy', copy);
        if (!off('brand')) step('brand', brand);
        if (!off('back')) step('back', back);
        if (!off('crumbs')) step('crumbs', crumbs);
        if (!off('bar')) step('bar', bar);
        if (!off('zoom')) step('zoom', zoom);
      }
      until(function () { if (!(H.classList.contains('ishpg-on') && q('.ishpg-buy') && q('.ishpg-add'))) return false; mods(); return true; }, 60, 250);
      /* узлы фрагмента v8p7 дорисовываются позже цены: добираем идемпотентно */
      [1500, 4000].forEach(function (ms) { setTimeout(function () { if (H.classList.contains('ishpg-on')) mods(); }, ms); });
    }
    if (q('link#ishd-p10')) { go(); return; }
    var l = mk('link'); l.id = 'ishd-p10'; l.rel = 'stylesheet'; l.href = href;
    var done = 0; function fin() { if (done) return; done = 1; go(); }
    l.onload = fin; l.onerror = fin; setTimeout(fin, 4000);
    D.head.appendChild(l);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
