/* ish-design-p21.js  v3-кандидат (19.10.2026: плашка Excel «Есть готовый список в Excel?» по умолчанию выключена, вернуть: window.ISH_P21_XLS = 1) | прежняя v2-кандидат (17.10.2026, волна 1 В: номер заявки крупно)  [v1 16.10.2026]  П21 «номер заявки» и «список из Excel в корзину»  b2b.isoft-shop.kz
   Внешний слой. Грузится из ish-design-p4.js (строка в README). Ничего не пишет в Tilda, блоки не правит.
   Модули (выключатели: window.ISH_P21_OFF = 1 - всё; window.ISH_P21_SKIP = 'num,xls' - по частям):
     num  Кр3  номер заявки ISH-ДДММ-NNNN: делается в браузере при отправке корзины, дописывается В НАЧАЛО поля «Комментарий»
               (строка «Номер заявки: ISH-…», нового поля нет), показывается на экране успеха.
     xls  Кр8  /spec: «Загрузить список (Excel/CSV)» + «Скачать шаблон»; разбор в браузере (SheetJS 0.18.5 с cdnjs только для xlsx/xls,
               CSV - без библиотек); сопоставление по индексу поиска (search_index2.json с Pages): артикул iSoft IS…, партномер, название;
               найденные кладутся в корзину Tilda через window.ishKorzina.add (тот же путь, что у поиска и расширенного каталога);
               ненайденные - списком + «Отправить список менеджеру как есть» (в Комментарий).
   Имена полей формы (li_nm), подписи, атрибуты data-tilda-*, обработчики отправки НЕ меняются. Меняется только ЗНАЧЕНИЕ поля
   «Комментарий» в момент отправки (и ничего больше). Договор линий §3 соблюдён. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P21_OFF || W.__ishP21) return;
  W.__ishP21 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p21.js"]');
  var SKIP = ',' + String(W.ISH_P21_SKIP || '').replace(/\s+/g, '') + ',';
  function on(m) { return SKIP.indexOf(',' + m + ',') < 0; }
  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var BASE = (tag && tag.src) ? tag.src.replace(/ish-design-p21\.js.*$/, '') : '';
  var CART_FORM = 'form3238938703';

  /* css рядом с js (тот же адрес); без css всё работает, только без оформления */
  (function css() {
    if (!BASE || D.getElementById('ishp21-css')) return;
    var l = D.createElement('link');
    l.id = 'ishp21-css'; l.rel = 'stylesheet'; l.href = BASE + 'ish-design-p21.css' + ((tag.src.match(/\?.*$/) || [''])[0]);
    D.head.appendChild(l);
  })();
  D.documentElement.classList.add('ishp21-on');

  /* поле значения: родной сеттер + события, как при вводе (Tilda следит за input/change) */
  function setVal(el, v) {
    var proto = el.tagName === 'TEXTAREA' ? W.HTMLTextAreaElement.prototype : W.HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(el, v); else el.value = v;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
  }

  /* ════════════════ Кр3: номер заявки ════════════════ */
  var NUM_KEY = 'ishp21_num', NUM_TTL = 6 * 3600 * 1000;
  var NUM_RE = /Номер заявки:\s*ISH-\d{4}-\d{4}/;
  var NUM_STRIP = /Номер заявки:\s*ISH-\d{4}-\d{4}\s*(?:·\s*)?/g;
  var sent = null;   /* {n, email, injected} последней отправки */

  function genNum() {
    var d = new Date(), r;
    try { var a = new Uint32Array(1); W.crypto.getRandomValues(a); r = a[0] % 9000; } catch (e) { r = Math.floor(Math.random() * 9000); }
    return 'ISH-' + pad(d.getDate()) + pad(d.getMonth() + 1) + '-' + String(1000 + r);
  }
  function numGet() {                 /* номер текущей попытки: одна заявка = один номер, даже если Tilda просила исправить поля */
    var n = null;
    try {
      var o = JSON.parse(W.sessionStorage.getItem(NUM_KEY) || 'null');
      if (o && o.n && Date.now() - o.t < NUM_TTL) n = o.n;
    } catch (e) {}
    if (!n) { n = genNum(); try { W.sessionStorage.setItem(NUM_KEY, JSON.stringify({ n: n, t: Date.now() })); } catch (e) {} }
    return n;
  }
  function numDrop() { try { W.sessionStorage.removeItem(NUM_KEY); } catch (e) {} }

  /* Значение комментария с номером. Форма значения подобрана под разбор письма (Скрипты_1с\заявка_из_почты.py):
       без метки:  «Номер заявки: ISH-… · текст клиента»     (одна строка: разбор берёт ТОЛЬКО первую строку значения)
       с меткой:   «[Документ: КП] Номер заявки: ISH-…\nтекст»  (метка остаётся в первой строке; текст ниже - как и было)
     ⚠ отдельной строкой «Номер заявки: …» НЕЛЬЗЯ: строка вида «слово: значение» обрывает сбор текста клиента. */
  function withNumber(val, num) {
    val = String(val == null ? '' : val);
    var m = /^\s*(\[Документ:[^\]]*\])\s*/.exec(val), head = '', rest = val;
    if (m) { head = m[1]; rest = val.slice(m[0].length); }
    rest = rest.replace(NUM_STRIP, '').replace(/^[\s·]+/, '').replace(/[\s·]+$/, '');
    var label = 'Номер заявки: ' + num;
    if (head) return head + ' ' + label + (rest ? '\n' + rest : '');
    return label + (rest ? ' · ' + rest : '');
  }

  function cartFormOf(f) {
    if (f && f.jquery) f = f[0];
    if (!f || f.tagName !== 'FORM') return null;
    if (f.id === CART_FORM || q('input[name="tildaspec-formname"][value="Cart"]', f)) return f;
    return null;
  }
  function inject(f) {
    f = cartFormOf(f);
    if (!f) return null;
    var k = q('[name^="Комментарий"]', f);
    if (!k) { sent = null; return null; }              /* поля нет - номер в заявку не кладём и на экране его не обещаем */
    var n = numGet(), before = k.value, after = withNumber(before, n);
    if (after !== before) setVal(k, after);
    var em = q('[name="Email"]', f);
    sent = { n: n, email: em ? String(em.value || '').trim() : '', injected: k.value.indexOf('Номер заявки: ' + n) >= 0 };
    /* вернуть поле, как было, если отправка не состоялась (форма осталась на экране); успешная уходит с номером уже в письме */
    setTimeout(function () { if (k.value === after && before !== after) setVal(k, before); }, 1500);
    return sent;
  }

  function wrapSend() {
    var t = W.tildaForm;
    if (!t || typeof t.send !== 'function' || t.send.__ishp21) return !!(t && t.send && t.send.__ishp21);
    var orig = t.send;
    var w = function (formNode) {
      try { inject(formNode); } catch (e) { if (W.console) console.warn('[ishp21] номер заявки:', e && e.message); }
      return orig.apply(this, arguments);
    };
    w.__ishp21 = 1; w.__orig = orig;
    t.send = w;
    return true;
  }
  function untilWrapped() {
    var n = 0;
    (function go() { var ok = false; try { ok = wrapSend(); } catch (e) {} if (!ok && ++n < 240) setTimeout(go, 500); })();
  }

  /* экран успеха: «Заявка № … принята» внутри блока Tilda (страница /spec перерисовывает его через innerHTML, поэтому следим) */
  function showNumber() {
    if (!sent || !sent.injected) return;
    var f = D.getElementById(CART_FORM), sb = f && q('.js-successbox', f);
    if (!sb) return;
    var cs = W.getComputedStyle(sb);
    if (cs.display === 'none' || cs.visibility === 'hidden' || !String(sb.textContent || '').trim()) return;
    if (q('.ishp21-num', sb)) return;
    var host = q('.ish15-успех', sb) || sb;
    if (host === sb && !q('.ish15-успех', sb) && D.getElementById('specRoot') && !W.__ishp21Late) return;   /* на /spec подождать, пока страница дорисует свой экран успеха */
    var p = D.createElement('p');
    p.className = 'ishp21-num';
    p.setAttribute('role', 'status');
    /* v2 (волна 1 В, 17.10): номер крупно отдельной строкой; текст тот же, слово «принята» убрано - его говорит заголовок экрана */
    p.innerHTML = '<b class="ishp21-num__n"><small>Заявка №</small> ' + esc(sent.n) + '</b>' +
      '<span class="ishp21-num__t">' + (sent.email ? 'Счёт или КП придёт на ' + esc(sent.email) + '. ' : 'Счёт или КП придёт на указанную почту. ') +
      'Назовите этот номер, если позвоните или напишете нам.</span>';
    var h = q('.ish15-успех__h', host);
    if (h && h.nextSibling) h.parentNode.insertBefore(p, h.nextSibling); else host.insertBefore(p, host.firstChild);
  }
  function watchSuccess() {
    var t0 = Date.now();
    W.__ishp21Late = false;
    setTimeout(function () { W.__ishp21Late = true; }, 1600);
    var iv = setInterval(function () {
      try { showNumber(); } catch (e) {}
      if (Date.now() - t0 > 20000) clearInterval(iv);
    }, 350);
    try { showNumber(); } catch (e) {}
  }

  function initNum() {
    untilWrapped();
    /* запасной путь и защита от подмены send: перед отправкой на самой кнопке формы корзины (после обработчика страницы /spec: он ставит метку КП) */
    D.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('#' + CART_FORM + ' [type="submit"]') : null;
      if (b) { try { wrapSend(); } catch (x) {} }
    }, true);
    D.addEventListener('tildaform:aftersuccess', function (e) {
      if (!e.target || e.target.id !== CART_FORM) return;
      if (sent) watchSuccess();
      numDrop();
    });
  }

  /* ════════════════ Кр8: список из Excel/CSV в корзину ════════════════ */
  var XLSX_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  var XLSX_SRI = 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw';
  var MAX_ROWS = 500, MAX_BYTES = 5 * 1024 * 1024, MAX_QTY = 9999, REC = '4204437703';
  var INDEX_URL = W.ISH_P21_INDEX || (BASE + 'search_index2.json');
  var lib = null, index = null, indexP = null, lastNotFound = [];

  function loadLib() {
    if (W.XLSX) return Promise.resolve(W.XLSX);
    if (lib) return lib;
    lib = new Promise(function (ok, bad) {
      var s = D.createElement('script');
      s.src = W.ISH_P21_XLSX || XLSX_URL; s.async = true;
      if (!W.ISH_P21_XLSX) { s.integrity = XLSX_SRI; s.crossOrigin = 'anonymous'; }
      s.onload = function () { W.XLSX ? ok(W.XLSX) : bad(new Error('xlsx')); };
      s.onerror = function () { lib = null; bad(new Error('xlsx')); };
      D.head.appendChild(s);
    });
    return lib;
  }

  /* ---- разбор файла в строки-массивы ---- */
  function decodeText(buf) {
    var u8 = new Uint8Array(buf);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(u8).replace(/^﻿/, ''); }
    catch (e) { try { return new TextDecoder('windows-1251').decode(u8); } catch (e2) { return ''; } }
  }
  function parseCsv(text) {
    var first = text.split(/\r?\n/).slice(0, 5).join('\n'), best = ';', bn = -1;
    [';', '\t', ','].forEach(function (d) { var n = first.split(d).length; if (n > bn) { bn = n; best = d; } });
    var rows = [], row = [], cell = '', inq = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text.charAt(i);
      if (inq) {
        if (c === '"') { if (text.charAt(i + 1) === '"') { cell += '"'; i++; } else inq = false; } else cell += c;
      } else if (c === '"') inq = true;
      else if (c === best) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text.charAt(i + 1) === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function readRows(file) {
    return new Promise(function (ok, bad) {
      var r = new FileReader();
      r.onerror = function () { bad(new Error('read')); };
      r.onload = function () {
        var buf = r.result, u8 = new Uint8Array(buf.slice(0, 4));
        var zip = u8[0] === 0x50 && u8[1] === 0x4B, ole = u8[0] === 0xD0 && u8[1] === 0xCF;
        if (zip || ole || /\.xlsx?$/i.test(file.name)) {
          loadLib().then(function (X) {
            var wb = X.read(buf, { type: 'array' }), ws = wb.Sheets[wb.SheetNames[0]];
            ok(X.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }));
          }, function () { bad(new Error('lib')); });
        } else ok(parseCsv(decodeText(buf)));
      };
      r.readAsArrayBuffer(file);
    });
  }

  /* ---- колонки ---- */
  var RE_ART = /(артикул|^арт\b|код|sku|part|парт|p\/n|^pn$|модель|номер)/i;
  var RE_NAME = /(наимен|назван|товар|позици|описан|name|item|оборудован)/i;
  var RE_QTY = /(^кол|кол-во|количеств|qty|quantity|шт\b|штук|count)/i;
  function s(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
  function isInt(v) { return /^\d{1,5}([.,]0+)?$/.test(s(v)); }
  function detect(rows) {
    var h = -1, cols = { art: [], name: [], qty: -1 }, i, j;
    for (i = 0; i < Math.min(rows.length, 10) && h < 0; i++) {
      var hit = 0, c = { art: [], name: [], qty: -1 };
      for (j = 0; j < rows[i].length; j++) {
        var t = s(rows[i][j]);
        if (!t || t.length > 40 || /^\d+$/.test(t)) continue;
        var a = RE_ART.test(t), n = RE_NAME.test(t), k = RE_QTY.test(t);
        if (k && !a && !n) { if (c.qty < 0) c.qty = j; hit++; }
        else if (a && n) { c.art.push(j); c.name.push(j); hit++; }
        else if (a) { c.art.push(j); hit++; }
        else if (n) { c.name.push(j); hit++; }
      }
      if (hit >= 1 && (c.art.length || c.name.length)) { h = i; cols = c; }
    }
    if (h >= 0) { cols.start = h + 1; return cols; }
    /* без заголовка: количество - последний столбец, где все значения целые; остальное - текст (1-й столбец - код/название, 2-й - название) */
    var w = 0; rows.forEach(function (r) { if (r.length > w) w = r.length; });
    var qty = -1;
    if (w >= 2) {
      var last = w - 1, okq = true, any = false;
      rows.forEach(function (r) { if (s(r[last]) !== '') { any = true; if (!isInt(r[last])) okq = false; } });
      if (okq && any) qty = last;
    }
    var text = []; for (j = 0; j < w; j++) if (j !== qty) text.push(j);
    return { art: text.length > 1 ? [text[0]] : text.slice(0, 1), name: text.length > 1 ? [text[1]] : text.slice(0, 1), qty: qty, start: 0 };
  }
  function toItems(rows) {
    var c = detect(rows), out = [], i;
    for (i = c.start; i < rows.length; i++) {
      var r = rows[i], arts = c.art.map(function (j) { return s(r[j]); }).filter(Boolean),
          names = c.name.map(function (j) { return s(r[j]); }).filter(Boolean);
      if (!arts.length && !names.length) continue;
      var qn = c.qty >= 0 ? parseFloat(s(r[c.qty]).replace(',', '.')) : 1;
      if (!(qn > 0)) qn = 1;
      qn = Math.min(MAX_QTY, Math.max(1, Math.round(qn)));
      out.push({ line: i + 1, art: arts.join(' '), name: names.join(' '), qty: qn });
    }
    return out;
  }

  /* ---- индекс поиска ---- */
  function compact(x) { return String(x || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-z0-9а-я]+/g, ''); }
  function hexOf(b) { b = b.replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; var r = atob(b), o = '', i, h; for (i = 0; i < r.length; i++) { h = r.charCodeAt(i).toString(16); o += h.length < 2 ? '0' + h : h; } return o; }
  function unpackPhoto(ph, E) {      /* как в ish-search.js */
    var k = ph.charAt(0), hashForm = E === 2 && (k === 's' || k === 't') && ph.indexOf('/') < 0 && ph.length === 42,
        nameForm = E === 2 && (k === 'S' || k === 'T') && ph.charAt(20) === '/';
    if (hashForm || nameForm) {
      var f = hexOf(ph.slice(1, 20)).slice(0, 28), pre = k.toLowerCase() === 's' ? 'stor' : 'tild', rest = hashForm ? hexOf(ph.slice(20)) : ph.slice(21);
      return pre + f.slice(0, 4) + '-' + f.slice(4, 8) + '-' + f.slice(8, 12) + '-' + f.slice(12, 16) + '-' + f.slice(16) + '/' + rest;
    }
    return ph;
  }
  var TR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya' };
  function slugOf(t) {
    var x = String(t).toLowerCase().replace(/[а-яё]/g, function (ch) { return TR[ch]; });
    x = x.replace(/[^a-z0-9 \-]+/g, '').replace(/[\s\-]+/g, '-').replace(/^-|-$/g, '');
    return x.slice(0, 40).replace(/-$/g, '');
  }
  function buildIndex(d) {
    var P = d.P || [], I = d.I || [], C = d.C || [], E = d.E || 0, U = d.U || '';
    var byIs = new Map(), byPn = new Map(), hay = new Array(P.length);
    function put(map, key, dx) { var a = map.get(key); if (!a) map.set(key, [dx]); else if (a.indexOf(dx) < 0) a.push(dx); }
    P.forEach(function (pr, dx) {
      var toks = String(pr[6] || '').split(' ').filter(Boolean);
      if (toks.length && /^is[0-9a-f]{10}$/.test(toks[0])) { byIs.set(toks[0].toUpperCase(), dx); toks = toks.slice(1); }
      toks.forEach(function (t) { var k = compact(t); if (k.length >= 4) put(byPn, k, dx); });
      if (toks.length > 1) { var j = compact(toks.join('')); if (j.length >= 4) put(byPn, j, dx); }
      hay[dx] = (String(pr[0]).toLowerCase().replace(/ё/g, 'е') + ' ' + String(pr[6] || '')).replace(/[^a-z0-9а-я ]+/g, ' ');
    });
    function uidOf(dx) { var u = I[dx]; if (u == null) return null; if (!E) return u; return u.charAt(0) === '!' ? u.slice(1) : String(parseInt(u, 36)); }
    function product(dx) {
      var pr = P[dx], c = C[pr[2]], uid = uidOf(dx), toks = String(pr[6] || '').split(' '), sku = /^is[0-9a-f]{10}$/.test(toks[0]) ? toks[0].toUpperCase() : '';
      var ph = pr[5] ? unpackPhoto(pr[5], E) : '', img = ph ? U + ph + (/\.[a-z0-9]{3,4}$/i.test(ph) ? '' : '.jpg') : '';
      var url = (uid && c && c[3]) ? '/' + c[3] + '/tproduct/' + uid + '-' + (pr[8] || slugOf(pr[0])) : '';
      return { uid: uid, title: pr[0], price: Number(pr[3]) || 0, sku: sku, img: img, url: url };
    }
    return { P: P, byIs: byIs, byPn: byPn, hay: hay, product: product };
  }
  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (indexP) return indexP;
    indexP = fetch(INDEX_URL, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('index ' + r.status); return r.json(); })
      .then(function (d) { index = buildIndex(d); return index; }, function (e) { indexP = null; throw e; });
    return indexP;
  }

  /* ---- сопоставление: артикул iSoft → партномер → название (только однозначное совпадение) ---- */
  var STOP = { 'для': 1, 'и': 1, 'с': 1, 'на': 1, 'шт': 1, 'мм': 0 };
  function matchOne(ix, it) {
    var strings = [it.art, it.name].filter(Boolean), i, j, why = '';
    for (i = 0; i < strings.length; i++) {                                   /* 1. артикул iSoft */
      var m = strings[i].toUpperCase().match(/IS[0-9A-F]{10}/g);
      if (m) for (j = 0; j < m.length; j++) if (ix.byIs.has(m[j])) return { dx: ix.byIs.get(m[j]), how: 'артикул iSoft' };
    }
    for (i = 0; i < strings.length; i++) {                                   /* 2. партномер производителя: вся строка или любой её «кусок» */
      var parts = [strings[i]].concat(strings[i].split(/[\s;,|\/]+/));
      for (j = 0; j < parts.length; j++) {
        var k = compact(parts[j]);
        if (k.length < 4 || !/\d/.test(k)) continue;
        var hit = ix.byPn.get(k);
        if (hit && hit.length === 1) return { dx: hit[0], how: 'партномер' };
        if (hit && hit.length > 1) why = 'партномер у нескольких товаров (' + hit.length + ')';
      }
    }
    for (i = strings.length - 1; i >= 0; i--) {                              /* 3. название: все слова должны быть в названии товара; подходит ровно один (или один «точнее всех») */
      var t = strings[i].toLowerCase().replace(/ё/g, 'е').replace(/[^a-z0-9а-я ]+/g, ' ').split(' ').filter(function (w) { return w && !STOP[w] && (w.length >= 2 || /\d/.test(w)); });
      if (t.length < 2 && !(t.length === 1 && /\d/.test(t[0]) && t[0].length >= 4)) continue;
      var found = [];
      for (j = 0; j < ix.hay.length && found.length < 12; j++) {
        var h = ' ' + ix.hay[j] + ' ', all = true, z;
        for (z = 0; z < t.length; z++) if (t[z].length <= 2 ? h.indexOf(' ' + t[z] + ' ') < 0 : h.indexOf(t[z]) < 0) { all = false; break; }
        if (all) found.push(j);
      }
      if (found.length === 1) return { dx: found[0], how: 'название' };
      if (found.length > 1) {                                                 /* из нескольких берём того, чьё название целиком покрыто словами запроса (лишних слов 0) - если он один */
        var qs = {}; t.forEach(function (w) { qs[w] = 1; });
        var exact = found.filter(function (dx) {
          return ix.P[dx][0].toLowerCase().replace(/ё/g, 'е').replace(/[^a-z0-9а-я ]+/g, ' ').split(' ').filter(Boolean).every(function (w) { return qs[w] || STOP[w]; });
        });
        if (exact.length === 1) return { dx: exact[0], how: 'название' };
        why = 'подходит несколько товаров (' + (found.length >= 12 ? '12+' : found.length) + '), нужно уточнить';
      }
    }
    return { dx: -1, why: why || 'в каталоге не нашли' };
  }

  /* ---- корзина ---- */
  function addAll(list) {                    /* строго по очереди: параллельные записи в tcart затирают друг друга */
    var done = [], fail = [];
    return list.reduce(function (p, x) {
      return p.then(function () {
        return Promise.resolve(W.ishKorzina.add(x.item, x.qty)).then(function (ok) { (ok ? done : fail).push(x); }, function () { fail.push(x); });
      });
    }, Promise.resolve()).then(function () { return { done: done, fail: fail }; });
  }

  /* ---- интерфейс ---- */
  var bar, status, result, fileInput, busy = false;
  var TEMPLATE_HEAD = ['Артикул или партномер', 'Наименование', 'Количество'];
  var TEMPLATE_ROWS = [['', 'Пример: ноутбук 15.6 дюймов (замените строку на свою позицию)', 3], ['', '', '']];

  function mkBar() {
    var b = D.createElement('section');
    b.id = 'ishp21-bar'; b.className = 'ishp21-bar';
    b.setAttribute('aria-label', 'Загрузка списка из файла');
    b.innerHTML =
      '<div class="ishp21-row">' +
        '<div class="ishp21-txt"><b>Есть готовый список в Excel?</b><span>Загрузите файл — найдём позиции в каталоге и положим в корзину.</span></div>' +
        '<div class="ishp21-btns">' +
          '<button type="button" class="ishp21-btn ishp21-btn_main" data-p21="pick">Загрузить список (Excel/CSV)</button>' +
          '<button type="button" class="ishp21-btn" data-p21="tpl">Скачать шаблон</button>' +
        '</div>' +
      '</div>' +
      '<input class="ishp21-file" type="file" accept=".xlsx,.xls,.csv,.txt,text/csv" aria-label="Файл со списком" tabindex="-1">' +
      '<div class="ishp21-st" role="status" aria-live="polite"></div>' +
      '<div class="ishp21-res"></div>';
    fileInput = q('.ishp21-file', b); status = q('.ishp21-st', b); result = q('.ishp21-res', b);
    b.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-p21]') : null;
      if (!t) return;
      var a = t.getAttribute('data-p21');
      if (a === 'pick') { if (!busy) fileInput.click(); }
      else if (a === 'tpl') template();
      else if (a === 'send') sendToManager();
      else if (a === 'hide') { result.innerHTML = ''; status.textContent = ''; }
    });
    fileInput.addEventListener('change', function () { var f = fileInput.files && fileInput.files[0]; if (f) handle(f); fileInput.value = ''; });
    ['dragenter', 'dragover'].forEach(function (n) { b.addEventListener(n, function (e) { e.preventDefault(); b.classList.add('ishp21-drop'); }); });
    ['dragleave', 'drop'].forEach(function (n) { b.addEventListener(n, function (e) { e.preventDefault(); b.classList.remove('ishp21-drop'); }); });
    b.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f && !busy) handle(f); });
    return b;
  }
  function say(t, kind) { status.textContent = t; status.className = 'ishp21-st' + (kind ? ' ishp21-st_' + kind : ''); }

  function download(name, blob) {
    var a = D.createElement('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = name; D.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1500);
  }
  function template() {
    var rows = [TEMPLATE_HEAD].concat(TEMPLATE_ROWS);
    loadLib().then(function (X) {
      var ws = X.utils.aoa_to_sheet(rows), wb = X.utils.book_new();
      ws['!cols'] = [{ wch: 26 }, { wch: 60 }, { wch: 12 }];
      X.utils.book_append_sheet(wb, ws, 'Список');
      var out = X.write(wb, { bookType: 'xlsx', type: 'array' });
      download('Шаблон_списка_iSoft.xlsx', new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    }, function () {                         /* без библиотеки - CSV с BOM и «;» (Excel открывает по-русски) */
      var csv = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
      download('Шаблон_списка_iSoft.csv', new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    });
  }

  function plural(n, a, b, c) { var m = n % 100, d = n % 10; return (m > 10 && m < 15) ? c : d === 1 ? a : (d >= 2 && d <= 4) ? b : c; }

  function handle(file) {
    busy = true; bar.classList.add('ishp21-busy'); result.innerHTML = '';
    if (!W.ishKorzina || typeof W.ishKorzina.add !== 'function') { say('Корзина сейчас недоступна — обновите страницу и повторите.', 'bad'); finish(); return; }
    if (file.size > MAX_BYTES) { say('Файл больше 5 МБ. Разбейте список на части или пришлите его в разделе «Прислать список».', 'bad'); finish(); return; }
    say('Читаю файл…');
    readRows(file).then(function (rows) {
      var items = toItems(rows);
      if (!items.length) { say('В файле не нашли строк со списком. Проверьте столбцы: «Артикул или партномер», «Наименование», «Количество» — или скачайте шаблон.', 'bad'); return null; }
      var over = items.length > MAX_ROWS;
      if (over) items = items.slice(0, MAX_ROWS);
      say('Нашли ' + items.length + ' ' + plural(items.length, 'строку', 'строки', 'строк') + '. Ищу в каталоге…');
      return loadIndex().then(function (ix) {
        var merged = new Map(), miss = [];
        items.forEach(function (it) {
          var m = matchOne(ix, it);
          if (m.dx < 0) { miss.push({ it: it, why: m.why }); return; }
          var p = ix.product(m.dx);
          if (!p.uid) { miss.push({ it: it, why: 'нет карточки на сайте' }); return; }
          var key = String(p.uid), cur = merged.get(key);
          if (cur) cur.qty = Math.min(MAX_QTY, cur.qty + it.qty);
          else merged.set(key, { qty: it.qty, how: m.how, p: p, src: it, item: { uid: String(p.uid), name: p.title, sku: p.sku, price: p.price, img: p.img, url: p.url ? location.origin + p.url : location.origin + '/katalog', recid: REC } });
        });
        var list = Array.from(merged.values());
        say('Кладу в корзину…');
        return addAll(list).then(function (r) {
          r.fail.forEach(function (x) { miss.push({ it: x.src, why: 'не удалось положить в корзину' }); });
          report(items.length, r.done, miss, over);
        });
      });
    }).catch(function (e) {
      var m = String(e && e.message);
      say(m === 'lib' ? 'Не удалось загрузить разбор Excel. Сохраните файл как CSV (в Excel: «Сохранить как» → CSV) и загрузите его.' :
          /^index/.test(m) || m === 'Failed to fetch' ? 'Не удалось получить каталог для сопоставления. Попробуйте ещё раз чуть позже.' :
          'Не удалось прочитать файл. Проверьте, что это Excel или CSV.', 'bad');
      if (W.console) console.warn('[ishp21]', e);
    }).then(finish);
  }
  function finish() { busy = false; bar.classList.remove('ishp21-busy'); }

  function report(total, done, miss, over) {
    lastNotFound = miss.map(function (x) { return { name: x.it.name || x.it.art, art: x.it.art && x.it.name ? x.it.art : '', qty: x.it.qty, why: x.why }; });
    var h = '';
    if (done.length) {
      h += '<div class="ishp21-ok"><b>В корзину добавлено: ' + done.length + ' ' + plural(done.length, 'позиция', 'позиции', 'позиций') + '</b><ul>' +
        done.map(function (x) { return '<li><span>' + esc(x.p.title) + '</span><em>' + x.qty + ' шт · ' + esc(x.how) + '</em></li>'; }).join('') + '</ul></div>';
    }
    if (miss.length) {
      h += '<div class="ishp21-miss"><b>Не нашли в каталоге: ' + miss.length + ' — добавим вручную</b><ul>' +
        lastNotFound.map(function (x) { return '<li><span>' + esc(x.name) + (x.art ? ' <i>' + esc(x.art) + '</i>' : '') + '</span><em>' + x.qty + ' шт · ' + esc(x.why) + '</em></li>'; }).join('') + '</ul>' +
        '<div class="ishp21-btns"><button type="button" class="ishp21-btn ishp21-btn_main" data-p21="send">Прислать список</button></div>' +
        '<p class="ishp21-note" data-p21note></p></div>';
    }
    if (over) h += '<p class="ishp21-note">В файле больше ' + MAX_ROWS + ' строк — обработали первые ' + MAX_ROWS + '. Остальное пришлите отдельным файлом.</p>';
    h += '<div class="ishp21-btns"><button type="button" class="ishp21-btn" data-p21="hide">Скрыть результат</button></div>';
    result.innerHTML = h;
    say(done.length ? 'Готово: ' + done.length + ' из ' + total + ' ' + plural(total, 'строки', 'строк', 'строк') + ' уже в корзине' + (miss.length ? ', ' + miss.length + ' — без совпадения.' : '.') :
        'Ничего не нашли в каталоге — ' + total + ' ' + plural(total, 'строка', 'строки', 'строк') + ' без совпадения.', done.length ? 'ok' : 'bad');
    try { if (done.length && W.ishKorzina.refresh) W.ishKorzina.refresh(); } catch (e) {}
  }

  /* «как есть»: одна строка в Комментарий формы корзины (разбор письма берёт первую строку значения; номер заявки встанет перед ней при отправке) */
  var LIST_RE = /Список от клиента \(не нашли в каталоге\):[^\n]*/;
  function listLine() {
    var parts = lastNotFound.map(function (x) { return (x.name + (x.art ? ' [' + x.art + ']' : '') + ' × ' + x.qty).replace(/\s+/g, ' '); }), line = 'Список от клиента (не нашли в каталоге): ', i;
    for (i = 0; i < parts.length; i++) {
      if ((line + parts[i]).length > 1300) { line += '…и ещё ' + (parts.length - i) + ' ' + plural(parts.length - i, 'позиция', 'позиции', 'позиций'); break; }
      line += (i ? '; ' : '') + parts[i];
    }
    return line;
  }
  function visible(el) { return !!(el && el.offsetParent !== null && W.getComputedStyle(el).display !== 'none'); }
  function sendToManager() {
    var note = q('[data-p21note]', result), f = D.getElementById(CART_FORM), k = f && q('[name^="Комментарий"]', f);
    if (!lastNotFound.length) return;
    var line = listLine();
    if (k && visible(k)) {
      var cur = String(k.value || ''), m = /^(\s*\[Документ:[^\]]*\]\s*)?/.exec(cur), head = m && m[1] ? m[1] : '';
      var rest = cur.slice(head.length).replace(LIST_RE, '').replace(NUM_STRIP, '').replace(/^[\s·]+/, '').replace(/[\s·]+$/, '');
      setVal(k, head + line + (rest ? ' · ' + rest : ''));
      try { k.scrollIntoView({ block: 'center', behavior: 'smooth' }); k.focus({ preventScroll: true }); } catch (e) {}
      if (note) note.textContent = 'Список вписан в комментарий к заявке. Заполните контакты и нажмите «Отправить» — счёт придёт на почту в течение 15 минут в рабочее время.';
      return;
    }
    /* корзина пуста - формы на странице нет: кладём текст в буфер и ведём в «Отправить готовый список» */
    var txt = lastNotFound.map(function (x) { return x.name + (x.art ? ' [' + x.art + ']' : '') + ' — ' + x.qty + ' шт'; }).join('\n');
    var go = function (copied) {
      if (note) note.innerHTML = (copied ? 'Список скопирован. ' : '') + 'Корзина пуста, поэтому форма заявки здесь скрыта: <a href="/spec">откройте «Прислать список»</a> и вставьте его в поле позиций.';
    };
    try { W.navigator.clipboard.writeText(txt).then(function () { go(true); }, function () { go(false); }); } catch (e) { go(false); }
  }

  function place() {
    var body = D.getElementById('spBody');
    if (!body || !body.parentNode) return false;
    if (!bar) bar = mkBar();
    if (bar.nextElementSibling !== body || bar.parentNode !== body.parentNode) body.parentNode.insertBefore(bar, body);
    var f = D.getElementById(CART_FORM), sb = f && q('.js-successbox', f), done = false;
    if (sb) { var cs = W.getComputedStyle(sb); done = cs.display !== 'none' && !!String(sb.textContent || '').trim(); }
    bar.hidden = done;                        /* после отправки заявки блок загрузки не нужен */
    return true;
  }
  function initXls() {
    if (!D.getElementById('specRoot')) return;
    var n = 0;
    (function go() { var ok = false; try { ok = place(); } catch (e) {} if (++n < 400) setTimeout(go, ok ? 900 : 250); })();   /* /spec перерисовывает #spBody: следим, чтобы блок оставался на месте */
  }

  /* ════════════════ 21.10: значок корзины в шапке после заказа ════════════════
     После успешной отправки формы заказа корзина Tilda пуста, а счётчик шапки (.нш-счёт, берёт число из .t706__carticon-counter, запасной путь - tcart
     из localStorage) оставался «1»: родной значок не перерисовывался. Теперь после tildaform:aftersuccess формы заказа ~25 с сверяем состав корзины
     (память tcart и localStorage); пуста - перерисовываем родной значок и гасим оба счётчика. Выключатель: window.ISH_P21_NO_BADGE = 1. */
  function cartQty() {
    var n = 0, c = null, ok = false;
    try { if (W.tcart && Array.isArray(W.tcart.products)) { c = W.tcart.products; ok = true; } } catch (e) {}
    if (!ok) { try { c = (JSON.parse(W.localStorage.getItem('tcart') || '{}').products) || []; ok = true; } catch (e) {} }
    if (!ok) return -1;
    c.forEach(function (p) { n += parseFloat(p.quantity) || 1; });
    return n;
  }
  function fixBadge() {
    if (cartQty() !== 0) return false;
    try { if (typeof W.tcart__reDrawCartIcon === 'function') W.tcart__reDrawCartIcon(); } catch (e) {}
    qa('.t706__carticon-counter').forEach(function (x) { x.textContent = ''; });
    qa('.t706__carticon').forEach(function (x) { x.classList.add('t706__carticon_empty'); });
    qa('.нш-счёт').forEach(function (x) { x.textContent = ''; x.style.display = 'none'; });
    return true;
  }
  function initBadge() {
    if (W.ISH_P21_NO_BADGE) return;
    D.addEventListener('tildaform:aftersuccess', function (e) {
      if (!e.target || e.target.id !== CART_FORM) return;
      var t0 = Date.now(), iv = setInterval(function () { try { fixBadge(); } catch (x) {} if (Date.now() - t0 > 25000) clearInterval(iv); }, 500);
    });
  }
  initBadge();

  if (on('num')) initNum();
  if (on('xls') && W.ISH_P21_XLS) {
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', initXls); else initXls();
  }
  W.ISHP21 = { version: 1, withNumber: withNumber, parseCsv: parseCsv, toItems: toItems, detect: detect, buildIndex: buildIndex, matchOne: matchOne };
})();
