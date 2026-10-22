/* ish-design-p28.js  v2  (22.10.2026: + цели Метрики/GA4 с короткими именами form_invoice, form_kp, form_podbor, form_request, click_whatsapp, click_telegram, open_request, search_assortiment - без параметров формы, см. goal())  [v1 16.10.2026]  П28 «события аналитики + проверка БИН/ИИН» b2b.isoft-shop.kz
   Внешний слой. Грузится из ish-design-p4.js (строка в README). В Tilda ничего не пишет, чужие обработчики не заменяет.
   Выключатели: window.ISH_P28_OFF = 1 - всё; window.ISH_P28_SKIP = 'events,bin' - по частям.

   events  События в Google Analytics 4 (gtag('event', имя, параметры)) и Яндекс.Метрику (ym(N,'reachGoal', имя, параметры)).
           Только если функция есть, каждый вызов в try/catch, новых внешних скриптов нет. Номер Метрики: window.mainMetrikaId (его ставит
           сайт в head), запасной 111859133. Параметры: page_path (без ?query и #), page_type, place, item_name / section / form_id - без телефонов,
           почт, БИН и вообще значений полей. Список событий - README.
   bin     Поле формы с li_nm «БИН …»: подпись «БИН/ИИН — 12 цифр», подсказка под полем и мягкая ошибка своим текстом на уходе из поля
           (не блокирует отправку; пустое поле ошибки не даёт - обязательность и тексты после отправки ведут Tilda и П19).
           li_nm (name / data-field-name) НЕ меняется: меняется только видимый текст подписи. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P28_OFF || W.__ishP28) return;
  W.__ishP28 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p28.js"]');
  var SKIP = ',' + String(W.ISH_P28_SKIP || '').replace(/\s+/g, '') + ',';
  function on(m) { return SKIP.indexOf(',' + m + ',') < 0; }
  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function tx(e) { return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function cut(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) : s; }
  function closest(e, sel) { try { return e && e.closest ? e.closest(sel) : null; } catch (x) { return null; } }

  (function css() {
    var src = tag && tag.src;
    if (!src || D.getElementById('ishp28-css')) return;
    var l = D.createElement('link');
    l.id = 'ishp28-css'; l.rel = 'stylesheet';
    l.href = src.replace(/ish-design-p28\.js/, 'ish-design-p28.css');
    D.head.appendChild(l);
  })();

  /* ═════════ события ═════════ */
  var YM_FALLBACK = 111859133, last = {};

  function pageType() {
    var p = location.pathname || '/';
    if (p === '/') return 'home';
    if (/\/tproduct\//.test(p)) return 'product';
    if (p.indexOf('/spec') === 0) return 'spec';
    if (p.indexOf('/podbor') === 0) return 'podbor';
    if (q('.t-store__card, .t-store__filter, .t-store')) return 'section';
    return 'page';
  }
  function section() {
    return cut(tx(q('h1')) || cut(D.title, 80).split(/\s[|—–-]\s/)[0], 80);
  }
  function productName(scope) {
    var s = scope || D;
    var e = q('.js-store-prod-name', s) || q('.t-store__card__title', s) || q('[class*="title"]', s);
    return cut(tx(e) || (scope ? '' : tx(q('h1'))), 100);
  }
  function base(place) {
    var p = { page_path: (location.pathname || '/').slice(0, 120), page_type: pageType() };
    if (place) p.place = place;
    return p;
  }
  function clean(p) {                       /* только простые значения, без пустых */
    var o = {};
    Object.keys(p).forEach(function (k) {
      var v = p[k];
      if (v === '' || v == null) return;
      o[k] = typeof v === 'number' ? v : String(v);
    });
    return o;
  }
  function send(name, extra, dedupeMs) {
    var p = clean(extra || {}), key = name + '|' + (p.place || '') + '|' + (p.item_name || '') + '|' + (p.form_id || '') + '|' + (p.request || '');
    var now = Date.now(), gap = dedupeMs == null ? 700 : dedupeMs;
    if (last[key] && now - last[key] < gap) return;
    last[key] = now;
    try { if (typeof W.gtag === 'function') W.gtag('event', name, p); } catch (e) {}
    try { if (typeof W.ym === 'function') W.ym(Number(W.mainMetrikaId) || YM_FALLBACK, 'reachGoal', name, p); } catch (e) {}
  }
  /* 22.10: цели для Метрики/GA4 - короткие имена, БЕЗ параметров (только путь страницы в GA4). Никаких значений полей формы. */
  var GOALS = { form_invoice: 1, form_kp: 1, form_podbor: 1, form_request: 1, click_whatsapp: 1, click_telegram: 1, open_request: 1, search_assortiment: 1 };
  function goal(name, gap) {
    if (!GOALS[name]) return;
    var k = 'g|' + name, now = Date.now(), g = gap == null ? 1500 : gap;
    if (last[k] && now - last[k] < g) return;
    last[k] = now;
    try { if (typeof W.gtag === 'function') W.gtag('event', name, { page_path: (location.pathname || '/').slice(0, 120) }); } catch (e) {}
    try { if (typeof W.ym === 'function') W.ym(Number(W.mainMetrikaId) || YM_FALLBACK, 'reachGoal', name); } catch (e) {}
  }
  function formGoal(form) {
    var doc = '';
    try { var d = form && form.querySelector ? form.querySelector('input[name="Документ"]') : null; doc = d ? String(d.value || '').toLowerCase() : ''; } catch (e) {}
    var path = location.pathname || '/';
    if (closest(form, '#rec3523869303')) return 'form_request';
    if (/сч[её]т/.test(doc)) return 'form_invoice';
    if (/кп|коммерч/.test(doc)) return 'form_kp';
    if (/подбор/.test(doc) || path.indexOf('/podbor') === 0) return 'form_podbor';
    if (closest(form, '.t706') || path.indexOf('/spec') === 0) return 'form_invoice';
    return '';
  }
  W.ISHP28 = { send: send, goal: goal };               /* для других слоёв и для проверки */

  function placeOf(a) {
    if (closest(a, '#ishp22, #ishp22t')) return 'float';
    if (closest(a, '.нш-шапка, .нш-мт, .таб, header, .ishp-strip')) return 'header';
    if (closest(a, '.isoft-foot, .нп-подвал-тел, footer')) return 'footer';
    if (closest(a, '.isoft-order, .t706, .sp-итоги, #spec')) return 'order';
    return 'page';
  }
  function labelOf(b) { return cut(tx(b), 40).toLowerCase(); }
  function cardScope(b) { return closest(b, '.t-store__card, .js-product, .ishpg3, .ishp10, [data-product-lid]'); }

  function onClick(e) {
    var t = e.target; if (!t || !t.closest) return;
    /* ссылки: WhatsApp / Telegram / телефон */
    var a = closest(t, 'a[href]');
    if (a) {
      var h = a.getAttribute('href') || '';
      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(h)) { send('whatsapp_click', base(placeOf(a))); goal('click_whatsapp'); return; }
      if (/^https?:\/\/(t\.me|telegram\.me)\//i.test(h) || /^tg:/i.test(h)) { send('telegram_click', base(placeOf(a))); goal('click_telegram'); return; }
      if (/^tel:/i.test(h)) { send('phone_click', base(placeOf(a))); return; }
    }
    /* 22.10: открытие окна «Напишите, что нужно» и поиск «Найти» в /assortiment */
    if (closest(t, '[data-д="запрос"], [data-ishp-req], a[href="#rec3523869303"]')) goal('open_request');
    if (closest(t, '#ia-go')) goal('search_assortiment', 3000);
    /* Excel П21 */
    var x = closest(t, '[data-p21]');
    if (x) {
      var d = x.getAttribute('data-p21');
      if (d === 'tpl') send('excel_template', base('spec'));
      else if (d === 'send') send('excel_send_as_is', base('spec'));
    }
    /* кнопки по тексту: «В корзину», «Запросить цену / КП» */
    var b = closest(t, 'a, button, [role="button"], .t-btn');
    if (!b) return;
    var lab = labelOf(b);
    if (!lab || lab.length > 30) return;
    if (/^напи(шите|сать),?\s+что\s+нужно/.test(lab)) goal('open_request');
    var sc = cardScope(b);
    if (/^в корзину/.test(lab) || /^добавить в корзину/.test(lab)) {
      var ex = base(sc ? 'list' : (pageType() === 'product' ? 'product' : 'page'));
      ex.item_name = productName(sc);
      ex.section = section();
      send('add_to_cart', ex);
    } else if (/^запросить\s+(цену|кп|счёт|счет)/.test(lab) || /^запрос цены/.test(lab) || /^получить кп/.test(lab)) {
      var ey = base(sc ? 'list' : (closest(b, '.нш-шапка, header') ? 'header' : 'page'));
      ey.request = /кп/.test(lab) ? 'kp' : (/сч[её]т/.test(lab) ? 'invoice' : 'price');
      ey.item_name = productName(sc);
      send('request_quote', ey);
    }
  }
  /* Excel: файл выбран */
  function onChange(e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('ishp21-file') && t.files && t.files[0]) {
      var m = /\.([a-z0-9]{2,5})$/i.exec(t.files[0].name || '');
      send('excel_upload', { page_path: base().page_path, page_type: pageType(), place: 'spec', file_type: m ? m[1].toLowerCase() : '' });
    }
  }
  /* успешная отправка формы Tilda: событие tildaform:aftersuccess + запасной путь по видимому t-form__successbox */
  function quizOpen() { return D.documentElement.classList.contains('ishp23-lock'); }
  function formDone(form) {
    var id = form && form.id ? String(form.id).slice(0, 40) : '';
    var fg = formGoal(form); if (fg) goal(fg, 4000);
    if (quizOpen()) { send('quiz_submit', base('quiz'), 4000); return; }
    var kind = closest(form, '.t706') ? 'cart' : (pageType() === 'podbor' ? 'list' : 'other');
    var ex = base(); ex.form_id = id; ex.form_kind = kind;
    send('form_submit', ex, 4000);
  }
  function onSuccess(e) { try { formDone(e.target && e.target.closest ? (e.target.closest('form') || e.target) : e.target); } catch (x) {} }

  function watchDom() {
    var seenBox = typeof WeakSet === 'function' ? new WeakSet() : null;
    function boxVisible(el) {
      var cs = W.getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetWidth > 0;
    }
    var mo = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i], t = m.target;
        if (t === D.documentElement && m.attributeName === 'class') {
          var c = D.documentElement.classList;
          var q23 = c.contains('ishp23-lock'), q25 = c.contains('ishp25-lock');
          if (q23 && !last.__q23) send('quiz_open', base('quiz'), 1500);
          if (q25 && !last.__q25) send('compare_open', base('compare'), 1500);
          last.__q23 = q23; last.__q25 = q25;
          continue;
        }
        if (m.attributeName === 'aria-expanded' && t.id === 'ishp24-btn') {
          var open = t.getAttribute('aria-expanded') === 'true';
          if (open && !last.__mm) send('megamenu_open', base('header'), 1200);
          last.__mm = open;
          continue;
        }
        if (t.classList && t.classList.contains('t-form__successbox') && boxVisible(t) && (!seenBox || !seenBox.has(t))) {
          if (seenBox) seenBox.add(t);
          try { formDone(closest(t, 'form') || t.parentNode); } catch (x) {}
        } else if (seenBox && t.classList && t.classList.contains('t-form__successbox') && !boxVisible(t)) { seenBox['delete'](t); }
      }
    });
    mo.observe(D.documentElement, { attributes: true, subtree: true, attributeFilter: ['class', 'style', 'aria-expanded', 'hidden'] });
    last.__q23 = quizOpen(); last.__q25 = D.documentElement.classList.contains('ishp25-lock');
  }

  /* ═════════ БИН / ИИН ═════════ */
  var BIN_LABEL = 'БИН/ИИН — 12 цифр';
  var BIN_HINT = 'БИН/ИИН — 12 цифр';
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function binText(v) {
    v = String(v || '').trim();
    if (!v) return '';
    if (/[^\d\s\-]/.test(v)) return 'Проверьте БИН/ИИН: только цифры, всего 12';
    var n = digits(v).length;
    if (n === 12) return '';
    return 'Проверьте БИН/ИИН: нужно 12 цифр, сейчас ' + n;
  }
  function binGroup(g) {
    var inp = q('input[name^="БИН"]', g) || q('input.t-input:not([type="hidden"])', g);
    if (!inp) return;
    /* 1. подпись: только видимый текст, звёздочку обязательности сохраняем */
    var lab = q('.t-input-title, label', g);
    if (lab && !lab.__ishp28 && !lab.children.length) {
      var star = /\*\s*$/.test(tx(lab)) ? ' *' : '';
      var want = BIN_LABEL + star;
      if (tx(lab) !== want) lab.textContent = want;
      lab.__ishp28 = 1;
    }
    if (g.__ishp28) return;
    g.__ishp28 = 1;
    try { if (!inp.getAttribute('inputmode')) inp.setAttribute('inputmode', 'numeric'); } catch (e) {}
    /* 2. подсказка под полем */
    var blk = q('.t-input-block', g) || inp.parentNode;
    /* 21.10: группа уже несёт подсказку/ошибку (повторный проход, перерисовка формы) - старые убираем, чтобы не было дубля */
    [].slice.call(g.querySelectorAll('.ishp28-hint,.ishp28-err')).forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
    var hint = D.createElement('div');
    hint.className = 'ishp28-hint'; hint.textContent = BIN_HINT;
    hint.setAttribute('role', 'note');
    blk.parentNode.insertBefore(hint, blk.nextSibling);
    var err = D.createElement('div');
    err.className = 'ishp28-err'; err.setAttribute('role', 'alert'); err.hidden = true;
    hint.parentNode.insertBefore(err, hint.nextSibling);
    var touched = false;
    function tildaErr() { var e = q('.t-input-error', g); return !!tx(e); }
    function check(final) {
      var m = binText(inp.value);
      var show = !!m && (final || touched) && !tildaErr();   /* Tilda/П19 уже показали свой текст - второй не нужен */
      err.hidden = !show; err.textContent = show ? m : '';
      g.classList.toggle('ishp28-bad', show);
      hint.hidden = show;
      if (show) inp.setAttribute('aria-describedby', (inp.getAttribute('aria-describedby') || '').replace(/\s*ishp28-e\d+/, '') + ' ishp28-e' + ids); else inp.removeAttribute('aria-describedby');
    }
    var ids = ++binN; err.id = 'ishp28-e' + ids;
    inp.addEventListener('blur', function () { touched = true; check(true); });
    inp.addEventListener('input', function () { if (touched) check(false); });
    inp.addEventListener('change', function () { check(true); });
    /* Tilda показала свою ошибку - прячем нашу (без наблюдателя за всей формой: следим только за блоком ошибки группы) */
    var te = q('.t-input-error', g);
    if (te) new MutationObserver(function () { if (tildaErr()) { err.hidden = true; g.classList.remove('ishp28-bad'); hint.hidden = false; } }).observe(te, { childList: true, characterData: true, subtree: true });
    if (inp.value) check(false);
  }
  var binN = 0, binSoon = 0;
  function binScan() {
    binSoon = 0;
    qa('.t-input-group[data-field-name^="БИН"]').forEach(function (g) { try { binGroup(g); } catch (e) {} });
  }
  function binWatch() {
    binScan();
    new MutationObserver(function (list) {
      if (binSoon) return;
      for (var i = 0; i < list.length; i++) if (list[i].addedNodes && list[i].addedNodes.length) { binSoon = setTimeout(binScan, 120); return; }
    }).observe(D.body, { childList: true, subtree: true });
    var n = 0, iv = setInterval(function () { binScan(); if (++n > 20) clearInterval(iv); }, 1000);   /* формы Tilda рисуются позже загрузки */
  }

  function start() {
    try {
      if (on('events')) {
        D.addEventListener('click', onClick, true);
        D.addEventListener('change', onChange, true);
        D.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.id === 'search' && /^\/assortiment/.test(location.pathname)) goal('search_assortiment', 3000); }, true);
        D.addEventListener('tildaform:aftersuccess', onSuccess, true);
        watchDom();
      }
      if (on('bin')) binWatch();
    } catch (e) {}
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
