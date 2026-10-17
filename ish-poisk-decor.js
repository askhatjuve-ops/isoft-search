/* ish-poisk-decor.js v1 · КАНДИДАТ (волна 1, задача Г, 17.10.2026) · НЕ выложено
   Допиливает разметку, которую рисует ish-search.js (его не меняем): чипы разделов, бренд капсом в строке товара, «Все результаты →» + «Не нашли? Пришлите список»,
   кнопка в пустом результате, «Поиск: …» в шапке /katalog, мета-бренд в карточке. Идемпотентно; ничего не читает из сети. Откат: убрать подключение. */
(function () {
  'use strict';
  if (window.__ishPoiskDecor) return; window.__ishPoiskDecor = true;
  var D = document, LIST = '/podbor';
  function qa(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function mk(h) { var d = D.createElement('div'); d.innerHTML = h; return d.firstChild; }
  function drop(box) {
    if (box.__ps) return; box.__ps = 1;
    // 1. чипы разделов: подряд идущие .нш-раздел -> один контейнер
    qa('.нш-подсказка.нш-раздел', box).forEach(function (a) {
      if (a.parentNode.classList.contains('ishps-chips')) return;
      var w = mk('<div class="ishps-chips"></div>'); a.parentNode.insertBefore(w, a);
      var n = a; while (n && n.classList && n.classList.contains('нш-раздел')) { var nx = n.nextElementSibling; w.appendChild(n); n = nx; }
    });
    // 2. товар: «артикул · бренд» -> бренд капсом над названием, артикул мелко под
    qa('.нш-товар .нш-т i:not(.ishps-br)', box).forEach(function (i) {
      var t = i.textContent, p = t.split(' · '), br = p.length > 1 ? p[p.length - 1] : t, sku = p.length > 1 ? p.slice(0, -1).join(' · ') : '';
      i.className = 'ishps-br'; i.textContent = br;
      if (sku) { var s = D.createElement('s'); s.textContent = sku; i.parentNode.appendChild(s); }
    });
    // 3. низ: «Все результаты →» и ссылка на список
    var all = box.querySelector('[data-ish-all]');
    if (all && !all.parentNode.classList.contains('ishps-foot')) {
      var m = /\((\d+)\)/.exec(all.textContent);
      all.textContent = m ? 'Все результаты (' + m[1] + ') →' : 'Искать в каталоге →';
      var f = mk('<div class="ishps-foot"></div>'); all.parentNode.insertBefore(f, all); f.appendChild(all);
      f.appendChild(mk('<a class="ishps-list" href="' + LIST + '">Не нашли? Пришлите список</a>'));
    }
    // 4. пустой результат: понятный текст + кнопка
    var e = box.querySelector('.нш-пусто');
    if (e && !box.querySelector('.ishps-ask')) {
      e.parentNode.insertBefore(mk('<div class="ishps-ask"><p>Пришлите список — подберём и ответим в течение дня.<span>Можно текстом или файлом, артикулы и названия как есть.</span></p><a href="' + LIST + '">Пришлите список</a></div>'), e.nextSibling);
    }
    box.__ps = 0;
  }
  function res() {
    var h = D.querySelector('#ish-results .ir-head'); if (!h) return;
    var q = D.querySelector('#ir-q'), v = q ? q.value.trim() : '';
    var t = h.querySelector('.ishps-h1');
    if (!t) { t = D.createElement('h1'); t.className = 'ishps-h1'; h.insertBefore(t, h.firstChild); }
    var s = 'Поиск: ' + v; if (t.__s !== s) { t.__s = s; t.textContent = ''; t.appendChild(D.createTextNode('Поиск: ')); var sp = D.createElement('span'); sp.textContent = v; t.appendChild(sp); }
    qa('.ir-meta:not([data-ps])').forEach(function (m) {
      m.setAttribute('data-ps', '1');
      var c = m.cloneNode(true), parts = m.textContent.split(' · '); if (parts.length < 2) return;
      var br = parts[parts.length - 2]; if (!br || /^Артикул/.test(br) || br.length > 24) return;
      m.innerHTML = '<span class="ishps-br">' + br.replace(/</g, '&lt;') + '</span>' + parts.slice(0, -2).join(' · ').replace(/</g, '&lt;') + (parts.length > 2 ? ' · ' : '') + parts[parts.length - 1].replace(/</g, '&lt;');
      if (parts.slice(0, -2).length === 0) m.innerHTML = '<span class="ishps-br">' + br.replace(/</g, '&lt;') + '</span>' + parts[parts.length - 1].replace(/</g, '&lt;');
      void c;
    });
    var em = D.querySelector('#ir-empty .ir-empty');
    if (em && !em.querySelector('.ishps-btn')) { var a = em.querySelector('a[href="/podbor"]'); if (a) a.className = 'ishps-btn'; }
  }
  function run() { qa('.нш-подсказки, .нш-мс').forEach(drop); res(); }
  var mo = new MutationObserver(function () { mo.disconnect(); try { run(); } catch (e) {} mo.observe(D.documentElement, { childList: true, subtree: true }); });
  function start() { try { run(); } catch (e) {} mo.observe(D.documentElement, { childList: true, subtree: true }); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
  window.ISH_POISK_DECOR = run;
})();
