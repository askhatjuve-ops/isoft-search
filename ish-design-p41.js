/* ish-design-p41.js  v1  (22.10.2026)  П41 «С этим покупают» на карточке ноутбука, моноблока, мини-ПК, системного блока  b2b.isoft-shop.kz
   Внешний слой. Грузится из ish-design-p4.js только на /tproduct/. Ничего не пишет в Tilda, чужие блоки не правит: ДОБАВЛЯЕТ один узел .ishp41 с префиксом ishp41-.
   Данные: companions.json рядом с этим файлом (его делает ежедневный круг, поиск_новый\сопутствующие.py): {i:{uid:[название,цена,фото,путь]}, s:{uid источника:[uid,...]}}.
   Нет uid карточки в s / файл не пришёл / пустой список - блока нет, страница как была.
   Место: сразу под основным блоком карточки (.js-store-product), выше «Вам может подойти» (.ishpg-p2).
   Кнопка плитки - контурная (не залитая), чтобы не спорить с главной кнопкой карточки. «В корзину» = window.ishKorzina.add (общий путь сайта);
   «✓ В корзине» - по localStorage.tcart. Цель Метрики/GA4 companion_add - через ISHP28.goal (p28), запасной путь ym напрямую.
   Выключатели: ?ishcompanion=0 в адресе, window.ISH_P41_OFF = 1 или window.ISH_P4_NO_P41 = 1 (до загрузки p4). Откат: убрать подключение в p4 или файл. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P41_OFF || W.ISH_P4_NO_P41 || W.__ishP41) return;
  if (/[?&]ishcompanion=0(&|$)/.test(location.search)) return;
  var uid = (/\/tproduct\/(\d+)/.exec(location.pathname) || [])[1];
  if (!uid) return;
  W.__ishP41 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p41.js"]');
  var src = tag && tag.src;
  if (!src) return;
  var BASE = src.replace(/ish-design-p41\.js.*$/, '');
  var VER = (/[?&]v=(\w+)/.exec(src) || [])[1] || '1';
  var YM_FALLBACK = 111859133;

  (function () {
    if (D.getElementById('ishp41-css')) return;
    var l = D.createElement('link');
    l.id = 'ishp41-css'; l.rel = 'stylesheet';
    l.href = BASE + 'ish-design-p41.css?v=' + VER;
    D.head.appendChild(l);
  })();

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { n = Math.round(parseFloat(n) || 0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
  function thumb(u) {   /* как в «Вам может подойти»: сжатая копия Tilda для плитки; в корзину уходит исходный адрес */
    var m = /^https:\/\/static\.tildacdn\.([a-z]+)\/([^\/]+)\/([^\/?#]+)$/i.exec(u || '');
    return m ? 'https://optim.tildacdn.' + m[1] + '/' + m[2] + '/-/contain/400x400/center/center/-/format/webp/' + m[3] + '.webp' : u;
  }
  function dateAst() {
    var d = new Date(Date.now() + 5 * 3600000), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate());
  }
  function inCart(id) {
    try {
      var c = JSON.parse(W.localStorage.getItem('tcart') || 'null'), n = 0;
      ((c && c.products) || []).forEach(function (p) { if (p && String(p.uid) === String(id)) n += parseInt(p.quantity, 10) || 0; });
      return n;
    } catch (e) { return 0; }
  }
  function goal() {
    try { if (W.ISHP28 && typeof W.ISHP28.goal === 'function') { W.ISHP28.goal('companion_add'); return; } } catch (e) {}
    try { if (typeof W.gtag === 'function') W.gtag('event', 'companion_add', { page_path: (location.pathname || '/').slice(0, 120) }); } catch (e) {}
    try { if (typeof W.ym === 'function') W.ym(Number(W.mainMetrikaId) || YM_FALLBACK, 'reachGoal', 'companion_add'); } catch (e) {}
  }

  var DATA = null, box = null;

  function tile(id, it) {
    var h = '<div class="ishp41-k" data-id="' + esc(id) + '">' +
      '<a class="ishp41-ph" href="' + esc(it[3]) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(thumb(it[2])) + '" alt="" loading="lazy" decoding="async"></a>' +
      '<a class="ishp41-nm" href="' + esc(it[3]) + '" title="' + esc(it[0]) + '">' + esc(it[0]) + '</a>' +
      '<div class="ishp41-pr">' + money(it[1]) + '</div>' +
      '<button type="button" class="ishp41-add" data-id="' + esc(id) + '">В корзину</button></div>';
    return h;
  }

  function mark() {
    if (!box) return;
    [].forEach.call(box.querySelectorAll('.ishp41-add'), function (b) {
      if (b.getAttribute('data-busy') || b.getAttribute('data-s') === 'err') return;
      var on = inCart(b.getAttribute('data-id')) > 0;
      if (on) { if (b.getAttribute('data-s') !== 'in') { b.setAttribute('data-s', 'in'); b.textContent = '✓ В корзине'; } }
      else if (b.getAttribute('data-s')) { b.removeAttribute('data-s'); b.textContent = 'В корзину'; }
    });
  }

  function onClick(e) {
    var b = e.target && e.target.closest ? e.target.closest('.ishp41-add') : null;
    if (!b || !box || !box.contains(b)) return;
    e.preventDefault();
    var id = b.getAttribute('data-id'), it = DATA.i[id];
    if (!it || b.getAttribute('data-busy')) return;
    if (inCart(id) > 0) { if (W.ishKorzina && typeof W.ishKorzina.open === 'function') W.ishKorzina.open(); else location.href = '/spec'; return; }
    var K = W.ishKorzina;
    if (!K || typeof K.add !== 'function') { location.href = it[3]; return; }   /* общей корзины нет - открываем карточку товара */
    b.setAttribute('data-busy', '1'); b.disabled = true; b.textContent = 'Добавляем…';
    var item = { uid: String(id), gen_uid: String(id), lid: String(id), sku: '', name: it[0], price: it[1], img: it[2], url: location.origin + it[3] };
    Promise.resolve(K.add(item, 1)).then(function (ok) {
      b.removeAttribute('data-busy'); b.disabled = false;
      if (ok) {
        goal();
        try { if (typeof K.added === 'function') K.added({ uid: String(id), name: it[0], price: it[1], img: it[2] }); } catch (x) {}
        mark();
        if (!b.getAttribute('data-s')) { b.setAttribute('data-s', 'in'); b.textContent = '✓ В корзине'; }
      } else {
        b.setAttribute('data-s', 'err'); b.textContent = 'Не удалось';
        setTimeout(function () { b.removeAttribute('data-s'); b.textContent = 'В корзину'; mark(); }, 2200);
      }
    }, function () {
      b.removeAttribute('data-busy'); b.disabled = false; b.textContent = 'В корзину';
    });
  }

  function place() {
    var cont = D.querySelector('.t-store__prod-snippet__container');
    if (!cont) return false;
    var prod = cont.querySelector('.js-store-product');
    if (!prod || !D.documentElement.classList.contains('ishpg-on')) return false;
    var ids = ((DATA.s || {})[uid] || []).filter(function (x) { return DATA.i[x] && String(x) !== String(uid); }).slice(0, 6);
    if (ids.length < 3) return true;     /* меньше трёх - блока нет */
    if (!box) {
      box = D.createElement('section');
      box.className = 'ishp41'; box.setAttribute('aria-label', 'С этим покупают');
      box.innerHTML = '<div class="ishp41-hd"><h3>С этим покупают</h3></div><div class="ishp41-row">' +
        ids.map(function (x) { return tile(x, DATA.i[x]); }).join('') + '</div>';
      box.addEventListener('click', onClick);
      W.addEventListener('storage', function (e) { if (!e.key || e.key === 'tcart') mark(); });
    }
    /* сразу под основным блоком, выше «Вам может подойти» (.ishpg-p2 вставляется позже тем же местом - переставляем) */
    var p2 = cont.querySelector('.ishpg-p2');
    if (p2 && p2.parentNode === cont) { if (box.nextSibling !== p2) cont.insertBefore(box, p2); }
    else if (box.parentNode !== cont || box.previousSibling !== prod) cont.insertBefore(box, prod.nextSibling);
    mark();
    return true;
  }

  function start() {
    var n = 0;
    (function step() {
      var ok = false; try { ok = place(); } catch (e) {}
      if (!ok && ++n < 60) setTimeout(step, 250);
      else { [800, 2500, 6000].forEach(function (ms) { setTimeout(function () { try { place(); } catch (e) {} }, ms); }); }
    })();
    setInterval(function () { try { mark(); } catch (e) {} }, 1500);
  }

  try {
    var x = new XMLHttpRequest();
    x.open('GET', BASE + 'companions.json?d=' + dateAst(), true);
    x.timeout = 12000;
    x.onload = function () {
      if (x.status !== 200) return;
      try { DATA = JSON.parse(x.responseText); } catch (e) { return; }
      if (!DATA || !DATA.i || !DATA.s || !DATA.s[uid]) return;     /* для этой карточки списка нет - дальше ничего не делаем */
      start();
    };
    x.send();
  } catch (e) {}
})();
