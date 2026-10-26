/* ish-design-p22.js  v8 (26.10.2026: «Вопрос по товару: WhatsApp · Telegram» вместо одиночной ссылки Telegram, десктоп и телефон; css ?v=10)  v7.3 (24.10.2026: на компьютере ссылка «Спросить в Telegram →» с иконкой стоит в строке ссылок карточки (.ishp36-links) рядом с «Запросить КП» и «Уточнить», нижняя ссылка убрана, на телефоне без изменений; css ?v=9)  v7.2 (24.10.2026: на карточке товара под блоком покупки текстовая ссылка «Спросить в Telegram-боте» -> t.me/isoft_b2b_kz_bot?start=АРТИКУЛ (только A-Za-z0-9_-, как разбирает бот); выключатель window.ISH_P22_BOTLINK_OFF)  v7.1 (+ Telegram-бот: window.ISH_TG_BOT или TG_BOT, t.me/бот?start=SKU, пусто - как раньше; 22.10.2026: текст WhatsApp «Пишу с сайта... Интересует: товар (арт.) — ссылка», раздел, /podbor; выключатель window.ISH_WA_TEXT_OFF)  v6 (20.10.2026: /assortiment на телефоне - кнопки прячутся при прокрутке вниз)  v5  (18.10.2026: на телефоне /podbor и /spec кнопки скрыты, в карточке только WhatsApp)  v4  (16.10.2026)  П22 «WhatsApp + Telegram» (Д16) b2b.isoft-shop.kz
   Плавающая круглая кнопка WhatsApp справа внизу на всех страницах. Номер тот же, что в шапке (wa.me/77758818531).
   v4: НАД WhatsApp стопкой - меньшая круглая кнопка Telegram (#ishp22t, тот же адрес, что в шапке: t.me/+77758818531). Подъём, прятание и сдвиг от .вн-бок общие для обеих (стопка считается целиком). Выключатель только Telegram: window.ISH_P22_TG_OFF = true.
   Подключается из ish-design-p4.js (функция p22, строка описана в README); сам подтягивает ish-design-p22.css с того же адреса.
   Текст сообщения: карточка товара - название, артикул, адрес; раздел каталога - название раздела; прочее - «Вопрос по сайту iSoft».
   Не перекрывает: плашку мини-корзины (.ishk-bar), нижнюю панель телефона (.таб), липкие панели карточки (.ishp10-sticky, .ishpg3-sticky), плашку сравнения П25 (.ishp25-bar; v2) -
   поднимается над ними; при открытой мини-корзине/шторке, окне Tilda, замке меню, открытой форме на /spec - прячется.
   v3: боковая панель .вн-бок (fixed/sticky у правого края) - если перекрывает кнопку, кнопка сдвигается ЛЕВЕЕ панели (--p22-r); панель, стоящая слева, кнопку не касается.
   Ничего в чужих блоках не меняет: добавляет один узел #ishp22 в body. Вне часов 9-18 (Asia/Almaty) в подписи «Ответим утром».
   Выключатель: window.ISH_P22_OFF = true (до загрузки). Не загрузился CSS или нет адреса скрипта - кнопки нет, сайт как был. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P22_OFF || W.__ishP22) return;
  W.__ishP22 = 9;
  var NUM = '77758818531';
  var TXT = 'Написать в WhatsApp';
  var TG_BOT = '';   /* имя клиентского бота без @ (или window.ISH_TG_BOT); пусто - старая ссылка */
  var TG_HREF = 'https://t.me/+77758818531', TG_TXT = 'Написать в Telegram';
  var GAP = 12;                                                          /* зазор между кнопками; размеры: WA 56/48, TG 44/40 */
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p22.js"]');
  var base = tag && tag.src ? tag.src.replace(/ish-design-p22\.js.*$/, '') : '';
  if (!base) return;

  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function txt(sel) { var e = D.querySelector(sel); return e ? clean(e.textContent) : ''; }

  /* ───────── текст сообщения ───────── */
  function cleanUrl() {
    var u = location.origin + (location.pathname || '/');
    return u;                                                              /* v9: без utm, ?query и #hash */
  }
  function message() {
    var path = location.pathname || '/';
    var OLD = !!W.ISH_WA_TEXT_OFF;
    var HEAD = OLD ? 'Здравствуйте! ' : 'Здравствуйте! Пишу с сайта b2b.isoft-shop.kz. ';
    if (/\/tproduct\//.test(path)) {
      var n = txt('.js-store-prod-name') || clean((D.querySelector('meta[property="og:title"]') || {}).content) || txt('h1');
      var a = txt('.js-store-prod-sku').replace(/^\s*(артикул|арт\.?|sku)\s*:?\s*/i, '');
      if (n) {
        if (OLD) return HEAD + 'Вопрос по товару: ' + n + (a ? ' (арт. ' + a + ')' : '') + ', ' + location.origin + path;
        return HEAD + 'Интересует: ' + n + (a ? ' (арт. ' + a + ')' : '') + ' — ' + cleanUrl();
      }
    } else if (path !== '/' && path.indexOf('/spec') !== 0 && D.querySelector('.t-store__card, .t-store__filter, .t-store')) {
      var s = txt('h1') || clean(D.title).split(/\s[|—–-]\s/)[0];
      if (s) return OLD ? 'Здравствуйте! Вопрос по разделу ' + s : HEAD + 'Интересует раздел ' + s + ' — ' + cleanUrl();
    } else if (!OLD && path.indexOf('/podbor') === 0) {
      return HEAD + 'Интересует подбор техники — ' + cleanUrl();
    }
    return OLD ? 'Здравствуйте! Вопрос по сайту iSoft' : HEAD + 'Есть вопрос.';
  }

  /* ───────── часы работы: Пн-Вс 9-18, Asia/Almaty ───────── */
  function inHours() {
    var h;
    try {
      h = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', hour: 'numeric', hourCycle: 'h23' }).format(new Date()), 10);
    } catch (e) { h = (new Date().getUTCHours() + 5) % 24; }
    if (isNaN(h)) h = (new Date().getUTCHours() + 5) % 24;
    return h >= 9 && h < 18;
  }

  /* ───────── видимость и подъём ───────── */
  function shown(e) {
    if (!e || e.hidden) return null;
    var cs = W.getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null;
    var r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r : null;
  }
  function anyShown(sel) {
    var l = D.querySelectorAll(sel);
    for (var i = 0; i < l.length; i++) if (shown(l[i])) return true;
    return false;
  }
  function mustHide() {
    if (anyShown('.ishk-mini, .ishk-sheet')) return true;                 /* открыта мини-корзина / шторка */
    if (anyShown('.t706__cartwin_showed, .t-popup_show')) return true;     /* окно Tilda */
    if (D.body && D.body.classList.contains('ишЗамок')) return true;       /* меню телефона открыто */
    if ((location.pathname || '').indexOf('/spec') === 0 && anyShown('.t706__orderform')) return true; /* форма заявки на /spec */
    return false;
  }
  var OBST = ['.ishk-bar', '.ishp25-bar', '.ishp10-sticky', '.ishpg3-sticky', '.таб', '.нш-мт'];
  function lift() {
    var vh = W.innerHeight, vw = W.innerWidth, m = 0;
    OBST.forEach(function (s) {
      var l = D.querySelectorAll(s);
      for (var i = 0; i < l.length; i++) {
        var r = shown(l[i]);
        if (!r || r.top >= vh - 1 || r.bottom < vh - 150) continue;     /* v2: у нижнего края: плашка корзины в 16 px от края, плашка сравнения П25 поднята над нижней панелью и корзиной (до ~140 px) */
        if (r.right < vw - 90) continue;                                 /* слева, нас не касается */
        m = Math.max(m, vh - r.top);
      }
    });
    return m;
  }

  /* v3: боковая панель у правого края: кнопка уходит левее неё (поднять нельзя - панель тянется до низа окна) */
  function shiftR(b, mob) {
    var vw = W.innerWidth, vh = W.innerHeight, sz = (mob ? 48 : 56) + (tg ? GAP + (mob ? 40 : 44) : 0), base = mob ? 14 : 20, x = base;   /* v4: высота стопки */
    var l = D.querySelectorAll('.вн-бок');
    for (var i = 0; i < l.length; i++) {
      var r = shown(l[i]); if (!r) continue;
      var pos = W.getComputedStyle(l[i]).position;
      if (pos !== 'fixed' && pos !== 'sticky') continue;
      if (r.top >= vh - b || r.bottom <= vh - b - sz) continue;           /* по вертикали не касается кнопки */
      if (r.right <= vw - base - sz || r.left >= vw - base) continue;      /* по горизонтали не касается */
      x = Math.max(x, vw - r.left + 12);
    }
    return x;
  }

  /* ───────── узел ───────── */
  var el, tip, tg, last = {};
  var SVG = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke-width="1.7" d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2z"/>' +
    '<path stroke-width="1.15" transform="translate(6.5 6.4) scale(.46)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

  var SVG_TG = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2.8 2.9 10.1c-.8.3-.8 1.4 0 1.7l4.6 1.6 1.8 5.6c.2.7 1 .8 1.5.3l2.5-2.4 4.7 3.5c.6.4 1.4.1 1.6-.6L22.9 4.2c.2-.8-.6-1.7-1.4-1.4z"/><path d="m9.5 13.4 8.2-6.2-6.4 7.3"/></svg>';

  function build() {
    if (D.getElementById('ishp22')) return;
    el = D.createElement('a');
    el.id = 'ishp22'; el.className = 'ishp22';
    el.target = '_blank'; el.rel = 'noopener noreferrer';
    el.innerHTML = SVG + '<span class="ishp22-tip" role="tooltip"><b>' + TXT + '</b><i></i></span>';
    tip = el.querySelector('i');
    D.body.appendChild(el);
    if (!W.ISH_P22_TG_OFF && !D.getElementById('ishp22t')) {
      tg = D.createElement('a');
      tg.id = 'ishp22t'; tg.className = 'ishp22t';
      tg.target = '_blank'; tg.rel = 'noopener noreferrer'; tg.href = TG_HREF; tg.setAttribute('aria-label', TG_TXT);
      tg.innerHTML = SVG_TG + '<span class="ishp22-tip" role="tooltip"><b>' + TG_TXT + '</b></span>';
      D.body.appendChild(tg);
    }
    refresh();
    var raf = 0;
    function soon() { if (raf) return; raf = W.requestAnimationFrame(function () { raf = 0; refresh(); }); }
    W.addEventListener('scroll', soon, { passive: true });
    W.addEventListener('resize', soon);
    el.addEventListener('pointerdown', refresh);
    el.addEventListener('focus', refresh);
    el.addEventListener('mouseenter', refresh);
    setInterval(function () { if (!D.hidden) refresh(); }, 400);
  }

  /* v8 (26.10.2026): под «В корзину» - «Получить КП и счёт →» (p10) и строка «Вопрос по товару: WhatsApp · Telegram» (десктоп и телефон). «Уточнить по этому товару» скрыта css (ссылка и форма /podbor остаются). Выключатель: window.ISH_P22_BOTLINK_OFF */
  var BOT_LINK = 'isoft_b2b_kz_bot';
  var IC_WA = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.4A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.18-3.1.83.83-3.03-.2-.32A8.1 8.1 0 0 1 12.04 3.8zM8.6 7.3c-.2 0-.5.07-.75.35-.25.27-.97.95-.97 2.3s1 2.7 1.13 2.88c.14.18 1.95 3.1 4.8 4.2 2.37.93 2.85.75 3.36.7.52-.05 1.66-.68 1.9-1.33.23-.65.23-1.2.16-1.33-.07-.12-.25-.18-.52-.32-.27-.14-1.6-.8-1.85-.88-.25-.1-.43-.14-.6.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.6.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.6-1.5-.84-2.05-.2-.48-.44-.5-.6-.5z"/></svg>';
  var IC_TG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 2.6 11.7c-.9.4-.9 1.1-.2 1.3l4.9 1.5 1.9 5.8c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.8L23 5.6c.3-1.3-.5-1.9-1.1-1.3zM8.5 13.9l9.7-6.1c.5-.3.9-.1.5.2l-8.1 7.3-.3 3.4-1.8-4.8z"/></svg>';
  function botLink() {
    if (W.ISH_P22_BOTLINK_OFF || (location.pathname || '').indexOf('/tproduct/') < 0) return;
    var sk = txt('.js-store-prod-sku').replace(/^\s*(артикул|арт\.?|sku)\s*:?\s*/i, '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
    var nm = txt('.js-store-prod-name') || clean((D.querySelector('meta[property="og:title"]') || {}).content) || txt('h1');
    if (!sk && !nm) return;
    var th = 'https://t.me/' + BOT_LINK + (sk ? '?start=' + sk : '');
    var art = txt('.js-store-prod-sku').replace(/^\s*(артикул|арт\.?|sku)\s*:?\s*/i, '');
    var wh = 'https://wa.me/' + NUM + '?text=' + encodeURIComponent('Здравствуйте! Вопрос по товару: ' + nm + (art ? ' (' + art + ')' : '') + ' ' + cleanUrl());
    /* старые элементы v7.x - убрать */
    var old = D.getElementById('ishp22tg'); if (old && old.parentNode) old.parentNode.removeChild(old);
    var ow = D.querySelector('.ishp22bot-wrap'); if (ow && ow.parentNode) ow.parentNode.removeChild(ow);
    var row = D.getElementById('ishp22q');
    if (row && D.body.contains(row)) {
      var a1 = row.querySelector('.ishp22-qwa'), a2 = row.querySelector('.ishp22-qtg');
      if (a1.getAttribute('href') !== wh) a1.setAttribute('href', wh);
      if (a2.getAttribute('href') !== th) a2.setAttribute('href', th);
      return;
    }
    var links = D.querySelector('.ishp36-links');
    if (!links && !W.ISH_P36_OFF && D.querySelector('.ishpg-row')) {
      if (!W.__ishp22t0) W.__ishp22t0 = Date.now();
      if (Date.now() - W.__ishp22t0 < 6000) return;    /* ждём, пока p36 соберёт блок ссылок (до 6 с) */
    }
    var host = links || D.querySelector('.js-product-controls-wrapper') || D.querySelector('.js-store-price-wrapper');
    if (!host) return;
    row = D.createElement('div'); row.id = 'ishp22q'; row.className = 'ishp22-q';
    row.innerHTML = '<span class="ishp22-ql">Вопрос по товару:</span>' +
      '<a class="ishp22-qa ishp22-qwa" target="_blank" rel="noopener noreferrer" title="Написать в WhatsApp">' + IC_WA + '<span>WhatsApp</span></a>' +
      '<a class="ishp22-qa ishp22-qtg" target="_blank" rel="noopener noreferrer" title="Цена, наличие, статус заявки">' + IC_TG + '<span>Telegram</span></a>';
    row.querySelector('.ishp22-qwa').setAttribute('href', wh);
    row.querySelector('.ishp22-qtg').setAttribute('href', th);
    if (links) links.appendChild(row); else host.parentNode.insertBefore(row, host.nextSibling);
  }

  function refresh() {
    if (!el) return;
    try { botLink(); } catch (e0) {}
    try {
      var href = 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(message());
      if (href !== last.href) { el.setAttribute('href', href); last.href = href; }
      if (tg) {
        var bot = String(W.ISH_TG_BOT || TG_BOT || '').replace(/^@/, ''), th = TG_HREF;
        if (bot) { var sk = txt('.js-store-prod-sku').replace(/^\s*(артикул|арт\.?|sku)\s*:?\s*/i, '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64); th = 'https://t.me/' + bot + (sk ? '?start=' + sk : ''); }
        if (th !== last.tg) { tg.setAttribute('href', th); last.tg = th; }
      }
      var open = inHours();
      if (open !== last.open) {
        last.open = open;
        tip.textContent = open ? '' : 'Ответим утром';
        tip.style.display = open ? 'none' : 'block';
        el.setAttribute('aria-label', open ? TXT : TXT + '. Ответим утром');
        el.classList.toggle('ishp22-off', !open);
      }
      var hide = mustHide();
      if (hide !== last.hide) {
        last.hide = hide;
        [el, tg].forEach(function (a) { if (!a) return; a.classList.toggle('ishp22-hide', hide); a.setAttribute('aria-hidden', hide ? 'true' : 'false'); a.tabIndex = hide ? -1 : 0; });
      }
      var mob = W.innerWidth <= 760;
      var b = Math.max(mob ? 14 : 20, hide ? 0 : (function () { var l = lift(); return l ? l + 12 : 0; })());
      if (b !== last.b) { last.b = b; el.style.setProperty('--p22-b', b + 'px'); if (tg) tg.style.setProperty('--p22-b', b + 'px'); }
      var x = shiftR(b, mob);
      if (x !== last.x) { last.x = x; el.style.setProperty('--p22-r', x + 'px'); if (tg) tg.style.setProperty('--p22-r', x + 'px'); }
    } catch (e) {}
  }

  /* v6: /assortiment (приложение в iframe той же высоты - листается страница-родитель): вниз - кнопки уходят вправо, вверх или у верха - возвращаются. Только css-класс, на десктопе правил нет */
  function asrScroll() {
    var y0 = W.pageYOffset || 0, away = false, raf = 0;
    function tick() {
      raf = 0;
      var y = W.pageYOffset || 0, d = y - y0, next = away;
      if (y < 80 || d < -6) next = false; else if (d > 6) next = true;
      if (Math.abs(d) > 6 || y < 80) y0 = y;
      if (next !== away) { away = next; D.documentElement.classList.toggle('ishp22-away', away); }
    }
    W.addEventListener('scroll', function () { if (!raf) raf = W.requestAnimationFrame(tick); }, { passive: true });
  }

  /* CSS: тот же адрес, что у скрипта; без стиля узел не создаётся */
  function start() {
    try {                                                                /* v5: страницы, где кнопки прячутся/уменьшаются (правила в css, телефон <=640) */
      var pp = location.pathname || '/';
      if (pp === '/podbor' || pp.indexOf('/spec') === 0) D.documentElement.classList.add('ishp22-form');
      else if (pp.indexOf('/tproduct/') > -1) D.documentElement.classList.add('ishp22-card');
      else if (/^\/assortiment\/?$/.test(pp)) { D.documentElement.classList.add('ishp22-asr'); asrScroll(); }   /* v6: расширенный ассортимент, телефон: прячутся при прокрутке вниз */
    } catch (e) {}
    if (D.getElementById('ishp22-css')) { build(); return; }
    var l = D.createElement('link');
    l.id = 'ishp22-css'; l.rel = 'stylesheet'; l.href = base + 'ish-design-p22.css?v=10';
    l.onload = function () { if (D.body) build(); else D.addEventListener('DOMContentLoaded', build); };
    D.head.appendChild(l);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
