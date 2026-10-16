/* ish-design-p10.js  v2  (16.10.2026)  П10 «карточка товара: внешний слой» b2b.isoft-shop.kz
   Подключается строкой в HEAD/подвале ТОЛЬКО для страниц карточки (/tproduct/...). Блок 4055071703 (запас 251 знак) не правится.
   Ждёт, пока фрагмент v8p7 соберёт карточку (html.ishpg-on), и ДОБАВЛЯЕТ узлы с префиксом ishp10-. Чужих узлов не переписывает,
   «В корзину» не перекрашивает и не подменяет: все кнопки-двойники кликают ЧЕРЕЗ родную .ishpg-add (одно место добавления в корзину).
   Пункты: Т9 «Запросить КП» · Т10 предел и цифровая клавиатура · Т11/М6 кнопки −/+ 40×44 · Т13/М7 зебра (css) · Т16/Ик7 копирование артикула
           Т17 бренд ссылкой · Т18 умные крошки · Т19 «К разделу» скромнее · Т20 липкая панель на десктопе и для товара без цены
           Ик5 иконка ошибки у поля (css) · Ик6 лупа и просмотр фото · Фт4 без прыжка при загрузке фото (css).
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
  var TREE = /*TREE*/{"noutbuki":["Ноутбуки","kompyutery","Компьютеры"],"sistemnye-bloki":["Системные блоки","kompyutery","Компьютеры"],"monobloki":["Моноблоки","kompyutery","Компьютеры"],"mini-pk-i-rabochie-stancii":["Мини-ПК","kompyutery","Компьютеры"],"monitory":["Мониторы","monitory-i-ekrany","Мониторы и экраны"],"televizory":["Телевизоры","monitory-i-ekrany","Мониторы и экраны"],"proektory-i-paneli":["Проекторы","monitory-i-ekrany","Мониторы и экраны"],"kronshteyny-i-krepleniya":["Кронштейны для мониторов и ТВ","monitory-i-ekrany","Мониторы и экраны"],"processory":["Процессоры","komplektuyushchie","Комплектующие"],"materinskie-platy":["Материнские платы","komplektuyushchie","Комплектующие"],"operativnaya-pamyat":["Оперативная память","komplektuyushchie","Комплектующие"],"videokarty":["Видеокарты","komplektuyushchie","Комплектующие"],"ohlazhdenie":["Охлаждение","komplektuyushchie","Комплектующие"],"korpusa-i-bloki-pitaniya":["Корпуса","komplektuyushchie","Комплектующие"],"bloki-pitaniya":["Блоки питания","komplektuyushchie","Комплектующие"],"ssd-nakopiteli":["SSD-накопители","nakopiteli","Накопители"],"zhestkie-diski":["Жёсткие диски","nakopiteli","Накопители"],"fleshki-i-karty-pamyati":["USB-флешки","nakopiteli","Накопители"],"karty-pamyati":["Карты памяти","nakopiteli","Накопители"],"setevoe-oborudovanie":["Сетевое оборудование","set-i-servery","Сетевое оборудование"],"marshrutizatory":["Маршрутизаторы (роутеры)","set-i-servery","Сетевое оборудование"],"tochki-dostupa":["Точки доступа Wi-Fi","set-i-servery","Сетевое оборудование"],"setevye-karty":["Сетевые карты и адаптеры","set-i-servery","Сетевое оборудование"],"ibp-i-zashchita-pitaniya":["ИБП","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"servery-i-shd":["Системы хранения","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"printery-i-mfu":["Принтеры и МФУ","ofis-i-rabochee-mesto","Печать и сканирование"],"mfu-lazernye-cvetnye":["МФУ лазерные цветные","ofis-i-rabochee-mesto","Печать и сканирование"],"mfu-struynye-cvetnye":["МФУ струйные цветные","ofis-i-rabochee-mesto","Печать и сканирование"],"printery-lazernye-chb":["Принтеры лазерные ч/б","ofis-i-rabochee-mesto","Печать и сканирование"],"printery-lazernye-cvetnye":["Принтеры лазерные цветные","ofis-i-rabochee-mesto","Печать и сканирование"],"plottery":["Плоттеры","ofis-i-rabochee-mesto","Печать и сканирование"],"skanery-dokumentov":["Сканеры документов","ofis-i-rabochee-mesto","Печать и сканирование"],"klaviatury":["Клавиатуры","svyaz-i-videonablyudenie","Рабочее место"],"klaviatury-i-myshi":["Мыши","svyaz-i-videonablyudenie","Рабочее место"],"videonablyudenie":["Камеры видеонаблюдения","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"servery":["Серверы","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"mezhsetevye-ekrany":["Межсетевые экраны","set-i-servery","Сетевое оборудование"],"videoregistratory":["Видеорегистраторы","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"skud-i-turnikety":["СКУД и турникеты","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"domofony":["Домофоны","videonablyudenie-i-bezopasnost","Видеонаблюдение и безопасность"],"shkafy-i-stoyki":["Шкафы и стойки","servery-i-infrastruktura","Серверы и серверная инфраструктура"],"garnitury":["Гарнитуры для конференц-связи","svyaz-i-videonablyudenie","Рабочее место"],"konferenc-svyaz":["IP-телефоны","set-i-servery","Сетевое оборудование"],"naushniki":["Наушники","svyaz-i-videonablyudenie","Рабочее место"],"skanery-shtrihkoda":["Сканеры штрихкода","torgovoe-oborudovanie","Торговое оборудование"],"terminaly-sbora-dannyh":["Терминалы сбора данных","torgovoe-oborudovanie","Торговое оборудование"],"printery-etiketok":["Принтеры этикеток","torgovoe-oborudovanie","Торговое оборудование"]}/*ENDTREE*/;               /* slug раздела -> [имя, slug группы, имя группы]; из ДЕРЕВО_КАТАЛОГА.json 21.09 */

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

  /* сколько штук лежит в родной корзине Tilda (localStorage 'tcart'); по приросту видно, что «положить» сработало */
  function cartQ() {
    try { var c = JSON.parse(localStorage.getItem('tcart') || '{}'), n = 0; (c.products || []).forEach(function (p) { n += parseFloat(p.quantity) || 1; }); return n; } catch (e) { return 0; }
  }
  /* ── Т9: вторичное «Запросить КП» ── */
  function kp() {
    if (q('.ishp10-kp') || H.classList.contains('ishpg-nopr')) return;
    var main = q('.ishpg-add'), buy = q('.ishpg-buy'); if (!main || !buy) return;
    var ask = q('.ishpg3-ask'), a = mk('a', 'ishp10-kp', IC.doc + '<span>Запросить КП</span>');
    a.href = '/spec#kp'; a.setAttribute('title', 'Положим товар в корзину и откроем заявку на КП');
    if (ask && ask.parentNode) ask.parentNode.insertBefore(a, ask); else buy.parentNode.insertBefore(a, buy.nextSibling);
    a.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      var n0 = cartQ(), t0 = Date.now();
      main.click();                                    /* кладём через родную кнопку: те же проверки, то же окошко «Добавлено» */
      try { sessionStorage.setItem('ishp10_doc', 'kp'); } catch (x) {}
      (function wait() {                               /* общая корзина кладёт асинхронно: ждём прирост до 1,5 с */
        if (cartQ() > n0) { setTimeout(function () { location.href = '/spec#kp'; }, 200); return; }
        if (Date.now() - t0 > 1500) { location.href = ask ? ask.getAttribute('href') : '/podbor'; return; }
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
    q('small', el).textContent = nopr ? 'Наличие уточним по запросу' : 'Цена с НДС';
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
    function go() {
      if (!cssOk()) { H.classList.remove('ishp10-on'); return; }    /* css пуст или недоступен: ничего не строим */
      if (!isCard) { if (isSpec) step('spec', specKp); return; }
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
