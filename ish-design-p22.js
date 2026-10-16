/* ish-design-p22.js  v2  (16.10.2026)  П22 «WhatsApp-консультант» (Д16) b2b.isoft-shop.kz
   Плавающая круглая кнопка WhatsApp справа внизу на всех страницах. Номер тот же, что в шапке (wa.me/77758818531).
   Подключается из ish-design-p4.js (функция p22, строка описана в README); сам подтягивает ish-design-p22.css с того же адреса.
   Текст сообщения: карточка товара - название, артикул, адрес; раздел каталога - название раздела; прочее - «Вопрос по сайту iSoft».
   Не перекрывает: плашку мини-корзины (.ishk-bar), нижнюю панель телефона (.таб), липкие панели карточки (.ishp10-sticky, .ishpg3-sticky), плашку сравнения П25 (.ishp25-bar; v2) -
   поднимается над ними; при открытой мини-корзине/шторке, окне Tilda, замке меню, открытой форме на /spec - прячется.
   Ничего в чужих блоках не меняет: добавляет один узел #ishp22 в body. Вне часов 9-18 (Asia/Almaty) в подписи «Ответим утром».
   Выключатель: window.ISH_P22_OFF = true (до загрузки). Не загрузился CSS или нет адреса скрипта - кнопки нет, сайт как был. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P22_OFF || W.__ishP22) return;
  W.__ishP22 = 1;
  var NUM = '77758818531';
  var TXT = 'Написать в WhatsApp';
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p22.js"]');
  var base = tag && tag.src ? tag.src.replace(/ish-design-p22\.js.*$/, '') : '';
  if (!base) return;

  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function txt(sel) { var e = D.querySelector(sel); return e ? clean(e.textContent) : ''; }

  /* ───────── текст сообщения ───────── */
  function message() {
    var path = location.pathname || '/';
    if (/\/tproduct\//.test(path)) {
      var n = txt('.js-store-prod-name') || clean((D.querySelector('meta[property="og:title"]') || {}).content) || txt('h1');
      var a = txt('.js-store-prod-sku');
      var u = location.origin + path;
      if (n) return 'Здравствуйте! Вопрос по товару: ' + n + (a ? ' (арт. ' + a + ')' : '') + ', ' + u;
    } else if (path !== '/' && path.indexOf('/spec') !== 0 && D.querySelector('.t-store__card, .t-store__filter, .t-store')) {
      var s = txt('h1') || clean(D.title).split(/\s[|—–-]\s/)[0];
      if (s) return 'Здравствуйте! Вопрос по разделу ' + s;
    }
    return 'Здравствуйте! Вопрос по сайту iSoft';
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

  /* ───────── узел ───────── */
  var el, tip, last = {};
  var SVG = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">' +
    '<path stroke-width="1.7" d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2z"/>' +
    '<path stroke-width="1.15" transform="translate(6.5 6.4) scale(.46)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

  function build() {
    if (D.getElementById('ishp22')) return;
    el = D.createElement('a');
    el.id = 'ishp22'; el.className = 'ishp22';
    el.target = '_blank'; el.rel = 'noopener noreferrer';
    el.innerHTML = SVG + '<span class="ishp22-tip" role="tooltip"><b>' + TXT + '</b><i></i></span>';
    tip = el.querySelector('i');
    D.body.appendChild(el);
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

  function refresh() {
    if (!el) return;
    try {
      var href = 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(message());
      if (href !== last.href) { el.setAttribute('href', href); last.href = href; }
      var open = inHours();
      if (open !== last.open) {
        last.open = open;
        tip.textContent = open ? '' : 'Ответим утром';
        tip.style.display = open ? 'none' : 'block';
        el.setAttribute('aria-label', open ? TXT : TXT + '. Ответим утром');
        el.classList.toggle('ishp22-off', !open);
      }
      var hide = mustHide();
      if (hide !== last.hide) { last.hide = hide; el.classList.toggle('ishp22-hide', hide); el.setAttribute('aria-hidden', hide ? 'true' : 'false'); el.tabIndex = hide ? -1 : 0; }
      var mob = W.innerWidth <= 760;
      var b = Math.max(mob ? 14 : 20, hide ? 0 : (function () { var l = lift(); return l ? l + 12 : 0; })());
      if (b !== last.b) { last.b = b; el.style.setProperty('--p22-b', b + 'px'); }
    } catch (e) {}
  }

  /* CSS: тот же адрес, что у скрипта; без стиля узел не создаётся */
  function start() {
    if (D.getElementById('ishp22-css')) { build(); return; }
    var l = D.createElement('link');
    l.id = 'ishp22-css'; l.rel = 'stylesheet'; l.href = base + 'ish-design-p22.css?v=1';
    l.onload = function () { if (D.body) build(); else D.addEventListener('DOMContentLoaded', build); };
    D.head.appendChild(l);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
