/* ish-design-p39.js  v1.1  (19.10.2026, кандидат)  П39 «счётчик списка, шапка-убегайка, стекло»  b2b.isoft-shop.kz
   По разбору BI Group (Дизайн_2026/BI_GROUP_РАЗБОР_18.10.md). Внешний слой: блоки Tilda не переписывает, только ДОБАВЛЯЕТ классы ishp39-* и узлы ishp39-*; подключает ish-design-p39.css рядом с собой.
   v1.1: часть «lanes» (ленты главной на телефоне, лента разделов на компьютере) УДАЛЕНА из кода и css по решению Асхата 19.10 (главная переделана: ленты её сломали бы). Блоки #ishp8-a/-b/-c/-bt и «Три шага» модуль не трогает.
   Выключатель: window.ISH_P39_OFF = 1 (весь модуль) или window.ISH_P4_NO_P39 = 1 (в загрузчике p4); по частям - window.ISH_P39_SKIP = 'count,hdr,glass' (подстрока: что названо, то ВЫКЛЮЧЕНО). Всё - до загрузки файла.
   Что делает (идемпотентно; нет элементов - молчит; ошибка в одной части другую не останавливает):
     count  «Показано N из M» + полоса прогресса над «Показать ещё» Tilda в разделе каталога (.t-store__card-list). Карточки не прячет и не двигает: p6/p9/p35 видят список как раньше.
            Фильтр включён - пишет «Показано N» без «из» и без полосы (общее число при фильтре неизвестно).
     hdr    Шапка #ishВерх уходит вверх при прокрутке вниз и возвращается при прокрутке вверх (только телефон). Не прячется при открытом поиске/меню; при prefers-reduced-motion не работает.
     glass  Стекло (нижняя панель, липкая панель карточки, вторая кнопка героя, стрелки галереи) - только в p39.css, через @supports; включается классом html.ishp39-glass, который ставит этот файл. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P39_OFF || W.__ishP39) return;
  W.__ishP39 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p39.js"]');
  var SKIP = String(W.ISH_P39_SKIP || '');
  function on(x) { return SKIP.indexOf(x) < 0; }
  var H = D.documentElement;
  var RM = false;
  try { RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* стили рядом с собой, один раз */
  (function () {
    if (D.getElementById('ishp39-css')) return;
    var src = tag && tag.src;
    if (!src) return;
    var l = D.createElement('link');
    l.id = 'ishp39-css'; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-p39\.js.*$/, 'ish-design-p39.css' + (v ? '?v=' + v[1] : ''));
    D.head.appendChild(l);
  })();
  H.classList.add('ishp39-on');
  if (on('glass')) H.classList.add('ishp39-glass');

  function safe(f) { try { f(); } catch (e) { if (W.console && console.warn) console.warn('[p39]', e); } }
  function raf(f) { (W.requestAnimationFrame || setTimeout)(f, 16); }

  /* ───────── «Показано N из M» ───────── */
  var staticN = -1;
  function totalN() {
    if (staticN < 0) {
      var m = /Все товары раздела\s*\((\d+)\)/.exec(D.body ? D.body.textContent : '');
      staticN = (m && +m[1] > 0) ? +m[1] : D.querySelectorAll('details.кат-все .кат-список li').length;
      if (!staticN) { staticN = -1; return 0; }   /* ещё не пришло - спросим позже */
    }
    return staticN;
  }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ' '); }
  function filtered() {
    var q = (location.search + '&' + location.hash.replace(/^#/, '')).split('&');
    for (var i = 0; i < q.length; i++) {   /* сортировка, вид и раздел - не фильтры; всё остальное tfc_* - фильтр */
      var k = decodeURIComponent(q[i].split('=')[0] || '');
      if (/^tfc_/.test(k) && !/^tfc_(sort|div|quantity|storepartuid)/.test(k)) return true;
    }
    return !!D.querySelector('.t-store__filter__chosen-val, .t-store__filter__chosen-val-wrapper .t-store__filter__chosen-val');
  }
  var prog = null;
  function count() {
    var list = D.querySelector('.t-store__card-list');
    if (!list) return;
    var wrapBtn = D.querySelector('.t-store__load-more-btn-wrap');
    if (!prog || !prog.isConnected) {
      prog = D.createElement('div');
      prog.className = 'ishp39-prog'; prog.setAttribute('role', 'status'); prog.setAttribute('aria-live', 'polite');
      prog.innerHTML = '<p class="ishp39-prog__t"></p><div class="ishp39-prog__bar"><i></i></div>';
      var host = wrapBtn || list.parentNode;
      if (wrapBtn) wrapBtn.parentNode.insertBefore(prog, wrapBtn); else host.appendChild(prog);
    } else if (wrapBtn && prog.nextElementSibling !== wrapBtn && wrapBtn.parentNode === prog.parentNode) {
      wrapBtn.parentNode.insertBefore(prog, wrapBtn);
    }
    var n = list.querySelectorAll(':scope > .js-product').length || list.querySelectorAll('.t-store__card').length;
    var N = totalN(), f = filtered();
    var t = prog.firstChild, bar = prog.lastChild;
    if (!n) { if (!prog.hidden) prog.hidden = true; return; }
    if (prog.hidden) prog.hidden = false;
    var html, full = !f && N && n <= N;
    html = full ? 'Показано <b>' + num(n) + '</b> из <b>' + num(N) + '</b>' : 'Показано <b>' + num(n) + '</b>';
    if (t.innerHTML !== html) t.innerHTML = html;   /* без лишней записи: наблюдатель не зацикливается */
    if (bar.hidden === full) bar.hidden = !full;
    if (full) { var w = Math.min(100, Math.round(n / N * 1000) / 10) + '%'; if (bar.firstChild.style.width !== w) bar.firstChild.style.width = w; }
  }

  /* ───────── шапка-убегайка (телефон) ───────── */
  function hdr() {
    if (RM) return;
    H.classList.add('ishp39-hdr');
    var mq = W.matchMedia('(max-width:640px)');
    var last = W.pageYOffset || 0, hidden = false, tick = 0, acc = 0;
    function blocked() {
      var top = D.getElementById('ishВерх');
      if (!top) return true;
      if (top.contains(D.activeElement) && /^(INPUT|TEXTAREA)$/.test(D.activeElement.tagName)) return true;
      var bo = D.body && getComputedStyle(D.body).overflowY;
      if (bo === 'hidden' || bo === 'clip') return true;
      if (H.className.indexOf('--open') > -1 || H.className.indexOf('ishd-hold') > -1) return true;
      return false;
    }
    function set(v) { if (v !== hidden) { hidden = v; H.classList.toggle('ishp39-hdr-off', v); } }
    function step() {
      tick = 0;
      var y = Math.max(0, W.pageYOffset || 0), d = y - last;
      last = y;
      if (!mq.matches || blocked()) { set(false); acc = 0; return; }
      if (y < 80) { set(false); acc = 0; return; }
      if ((d > 0) === (acc > 0)) acc += d; else acc = d;   /* копим ход в одну сторону: дрожь пальца не считается */
      if (acc > 14) set(true);
      else if (acc < -8) set(false);
    }
    W.addEventListener('scroll', function () { if (!tick) tick = raf(step) || 1; }, { passive: true });
    W.addEventListener('resize', function () { if (!mq.matches) set(false); });
    D.addEventListener('focusin', function (e) { var top = D.getElementById('ishВерх'); if (top && top.contains(e.target)) set(false); });
  }

  /* ───────── запуск ───────── */
  var tries = 0;
  function pass() {
    if (on('count')) safe(count);
  }
  function boot() {
    pass();
    var root = D.getElementById('allrecords') || D.body;
    if (W.MutationObserver && root) {
      var t = 0;
      new MutationObserver(function () { if (!t) t = raf(function () { t = 0; pass(); }) || 1; }).observe(root, { childList: true, subtree: true });
    }
    var iv = setInterval(function () { pass(); if (++tries > 30) clearInterval(iv); }, 500);
    if (on('hdr')) safe(hdr);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
