/* ish-design-p9.js  v1  (16.10.2026)  П9 «доводка списка товаров и главной» b2b.isoft-shop.kz
   Внешний файл на Pages. Сам подключает ish-design-p9.css рядом с собой. Не загрузился / ошибка - сайт как был.
   Выключатели: window.ISH_P9_OFF (до загрузки) · пустой файл на Pages.
   Что делает (идемпотентно; родные узлы Tilda не переносит и не переписывает; в сеть не ходит; в Tilda не пишет):
     К14/Ик7  у каждого артикула (.js-store-prod-sku) подпись «Арт. iSoft» и кнопка «копировать»; клик - буфер + toast «Скопировано»
     К15      вместо нативного select сортировки - свой список (select остаётся в DOM скрытым; выбор = select.value + событие change)
     К18      чипы брендов над сеткой из значений фильтра «Бренд» (клик = клик по галке фильтра); «Ещё бренды» открывает группу
     К16      если на странице есть крошки - html.ishp9-crumbs (CSS прячет «Вернуться в каталог»); window.ISH_P9_HIDE_BACK=1 - прятать всегда
     К2       название товара кобальтовое по умолчанию (решение владельца 29.09); window.ISH_P9_TITLE_DARK=1 - тёмное (чернила, кобальт на hover)
   Всё остальное (К2, К6, К12, К23, Г15, Г22, Тп4, М9) делает CSS. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P9_OFF || W.ISH_P9) return;
  W.ISH_P9 = { версия: 'ishp9-1610' };
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p9.js"]');

  /* стили: рядом с собой, один раз */
  (function () {
    if (D.getElementById('ishp9-css')) return;
    var src = tag && tag.src;
    if (!src) {
      var all = D.getElementsByTagName('script');
      for (var i = 0; i < all.length; i++) if (/ish-design-p9\.js/.test(all[i].src || '')) { src = all[i].src; break; }
    }
    if (!src) return;
    var l = D.createElement('link');
    l.id = 'ishp9-css'; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-p9\.js.*$/, 'ish-design-p9.css' + (v ? '?v=' + v[1] : ''));
    D.head.appendChild(l);
  })();

  var root = D.documentElement;
  root.classList.add('ishp9-on');
  if (W.ISH_P9_TITLE_DARK) root.classList.add('ishp9-title-d');

  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function el(html) { var d = D.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function safe(fn) { try { fn(); } catch (e) { /* молчим: слой необязательный */ } }

  var ИК_КОПИЯ = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2"/><path d="M10.5 3.5v-.2A1.8 1.8 0 0 0 8.7 1.5H3.8A1.8 1.8 0 0 0 2 3.3v4.9a1.8 1.8 0 0 0 1.8 1.8h.2"/></svg>';
  var ИК_ГАЛКА = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';
  var ИК_ШЕВРОН = '<svg class="ishp9-sort__chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';

  /* ── toast ── */
  var toastT = 0;
  function toast(text) {
    var t = D.getElementById('ishp9-toast');
    if (!t) {
      t = el('<div id="ishp9-toast" class="ishp9-toast" role="status" aria-live="polite"></div>');
      D.body.appendChild(t);
    }
    t.innerHTML = ИК_ГАЛКА + '<span>' + esc(text) + '</span>';
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('is-on'); }, 1800);
  }

  /* ── К14 / Ик7: артикул ── */
  function копировать(текст, кнопка) {
    function готово() {
      toast('Скопировано');
      if (кнопка) { кнопка.classList.add('is-ok'); setTimeout(function () { кнопка.classList.remove('is-ok'); }, 1400); }
    }
    function запас() {
      var ta = D.createElement('textarea');
      ta.value = текст; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      D.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = D.execCommand('copy'); } catch (e) {}
      D.body.removeChild(ta);
      if (ok) готово();
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(текст).then(готово, запас);
      else запас();
    } catch (e) { запас(); }
  }

  function артикулы() {
    qa('.js-store-prod-sku').forEach(function (v) {
      if (v.closest('.ishpg-к, .ishsg__sku') || v.getAttribute('data-ishp9')) return;
      var текст = (v.textContent || '').replace(/\s+/g, ' ').trim();
      var p = v.parentNode;
      if (!текст || !p) return;
      v.setAttribute('data-ishp9', '1');
      var lab = el('<span class="ishp9-lab">Арт. iSoft</span>');
      p.insertBefore(lab, v);
      var b = el('<span class="ishp9-cp" role="button" tabindex="0" title="Скопировать артикул" aria-label="Скопировать артикул ' + esc(текст) + '">' + ИК_КОПИЯ + '</span>');
      v.parentNode.insertBefore(b, v.nextSibling);
      function жми(e) {
        e.preventDefault(); e.stopPropagation();           /* артикул может лежать внутри ссылки карточки */
        копировать((v.textContent || '').replace(/\s+/g, ' ').trim(), b);
      }
      b.addEventListener('click', жми);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') жми(e); });
    });
  }

  /* ── К15: своя сортировка ── */
  function сортировка() {
    var sel = q('.t-store__filter__sort select.js-store-sort-select, .t-store__filter__sort select.t-store__sort-select, .t-store__filter__sort select');
    if (!sel || sel.getAttribute('data-ishp9')) return;
    var box = sel.closest('.t-store__filter__sort');
    if (!box || !sel.options || !sel.options.length) return;
    sel.setAttribute('data-ishp9', '1');
    var wrap = el('<div class="ishp9-sort"><button type="button" class="ishp9-sort__btn" aria-haspopup="listbox" aria-expanded="false">' +
      '<span class="ishp9-sort__val"></span>' + ИК_ШЕВРОН + '</button><ul class="ishp9-sort__list" role="listbox" tabindex="-1"></ul></div>');
    var btn = q('.ishp9-sort__btn', wrap), val = q('.ishp9-sort__val', wrap), ul = q('.ishp9-sort__list', wrap);
    var опции = [];
    function собрать() {
      ul.innerHTML = ''; опции = [];
      for (var i = 0; i < sel.options.length; i++) {
        (function (o, i) {
          if (o.disabled && !o.value) return;
          var li = el('<li class="ishp9-sort__opt" role="option" data-v="' + esc(o.value) + '"><span>' + esc(o.text) + '</span>' + ИК_ГАЛКА + '</li>');
          li.addEventListener('click', function () { выбрать(o.value); закрыть(true); });
          li.addEventListener('mousemove', function () { пом(i); });
          ul.appendChild(li); опции.push({ li: li, v: o.value });
        })(sel.options[i], i);
      }
      показать();
    }
    function показать() {
      var cur = sel.options[sel.selectedIndex];
      val.textContent = cur ? cur.text : 'Сортировка';
      опции.forEach(function (o) { o.li.setAttribute('aria-selected', o.v === sel.value ? 'true' : 'false'); });
    }
    function выбрать(v) {
      if (sel.value === v) return;
      sel.value = v;
      var e;
      try { e = new Event('change', { bubbles: true }); } catch (x) { e = D.createEvent('Event'); e.initEvent('change', true, true); }
      sel.dispatchEvent(e);
      показать();
    }
    var ix = -1;
    function пом(i) { ix = i; опции.forEach(function (o, k) { o.li.classList.toggle('is-cur', k === i); }); }
    function открыть() {
      wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      var i = 0; опции.forEach(function (o, k) { if (o.v === sel.value) i = k; }); пом(i);
      D.addEventListener('mousedown', снаружи, true); D.addEventListener('touchstart', снаружи, true);
    }
    function закрыть(фокус) {
      wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); пом(-1);
      D.removeEventListener('mousedown', снаружи, true); D.removeEventListener('touchstart', снаружи, true);
      if (фокус) btn.focus();
    }
    function снаружи(e) { if (!wrap.contains(e.target)) закрыть(false); }
    btn.addEventListener('click', function () { wrap.classList.contains('is-open') ? закрыть(false) : открыть(); });
    wrap.addEventListener('keydown', function (e) {
      var открыто = wrap.classList.contains('is-open');
      if (e.key === 'Escape' && открыто) { e.preventDefault(); закрыть(true); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!открыто) return открыть();
        пом(Math.max(0, Math.min(опции.length - 1, ix + (e.key === 'ArrowDown' ? 1 : -1))));
      } else if ((e.key === 'Enter' || e.key === ' ') && открыто && ix >= 0 && e.target !== btn) {
        e.preventDefault(); выбрать(опции[ix].v); закрыть(true);
      } else if ((e.key === 'Enter' || e.key === ' ') && открыто && e.target === btn && ix >= 0) {
        e.preventDefault(); выбрать(опции[ix].v); закрыть(true);
      }
    });
    sel.addEventListener('change', показать);
    box.appendChild(wrap);
    root.classList.add('ishp9-sort-on');
    собрать();
  }

  /* ── К18: чипы брендов над сеткой ── */
  var брСписок = '';
  function группаБренд() {
    var т = qa('.js-store-filter-item-title').filter(function (x) {
      var n = (x.getAttribute('data-filter-name') || x.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      return n === 'бренд' || n === 'brand';
    })[0];
    return т ? т.closest('.js-store-filter-item') : null;
  }
  function бренды() {
    var grp = группаБренд();
    var list = q('.t-store__card-list') || q('.js-store-grid-cont');
    if (!grp || !list || !list.parentNode) return;
    var inputs = qa('input.js-store-filter-opt-chb', grp);
    var зн = inputs.map(function (i) {
      var lab = i.closest('label'), t = q('.t-store__filter__title', lab);
      return { i: i, v: i.getAttribute('data-filter-value') || (t ? t.textContent.trim() : '') };
    }).filter(function (x) { return x.v; });
    if (зн.length < 2) { var старый = q('.ishp9-brands'); if (старый) старый.parentNode.removeChild(старый); брСписок = ''; return; }
    var LIM = 8;
    var видимые = зн.slice(0, LIM);
    зн.forEach(function (x) { if (x.i.checked && видимые.indexOf(x) < 0) видимые.push(x); });
    var ключ = видимые.map(function (x) { return x.v; }).join('|') + '#' + зн.length;
    var бар = q('.ishp9-brands');
    if (!бар || ключ !== брСписок) {
      брСписок = ключ;
      if (бар) бар.parentNode.removeChild(бар);
      бар = el('<div class="ishp9-brands" role="group" aria-label="Бренды"><span class="ishp9-brands__cap">Бренд</span></div>');
      видимые.forEach(function (x) {
        var b = el('<button type="button" class="ishp9-bc" aria-pressed="false" data-v="' + esc(x.v) + '">' + esc(x.v) + '</button>');
        b.addEventListener('click', function () { x.i.click(); setTimeout(синхр, 60); });
        бар.appendChild(b);
      });
      if (зн.length > видимые.length) {
        var m = el('<button type="button" class="ishp9-bc ishp9-bc--more">Ещё бренды</button>');
        m.addEventListener('click', function () {
          var mob = q('.js-store-filter-mob-btn');
          if (mob && mob.offsetParent !== null && !grp.offsetParent) mob.click();          /* телефон: шторка */
          setTimeout(function () {
            var t = q('.js-store-filter-item-title', grp);
            if (!grp.classList.contains('active') && t) t.click();
            try { grp.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { grp.scrollIntoView(); }
          }, 80);
        });
        бар.appendChild(m);
      }
      list.parentNode.insertBefore(бар, q('.js-store-grid-cont', list.parentNode) || list);
    }
    function синхр() {
      qa('.ishp9-bc[data-v]', бар).forEach(function (b) {
        var x = зн.filter(function (z) { return z.v === b.getAttribute('data-v'); })[0];
        b.setAttribute('aria-pressed', x && x.i.checked ? 'true' : 'false');
      });
    }
    синхр();
  }

  /* ── К16: крошки ── */
  function крошки() {
    var есть = !!W.ISH_P9_HIDE_BACK;
    if (!есть) {
      есть = qa('.вн-крошки, .t-store__breadcrumbs, .t-breadcrumb__list, .t-breadcrumbs, nav[aria-label*="рошк"], .ishp-crumbs, .isoft-crumbs, .breadcrumbs').some(function (e) {
        return e.offsetWidth > 0 && e.offsetHeight > 0 && (e.textContent || '').trim().length > 0;
      });
    }
    root.classList.toggle('ishp9-crumbs', есть);
  }

  /* ── запуск: идемпотентно, по изменению страницы (подгрузка карточек, фильтры) ── */
  function прогон() {
    safe(артикулы); safe(сортировка); safe(бренды); safe(крошки);
  }
  var таймер = 0;
  function отложить() { clearTimeout(таймер); таймер = setTimeout(прогон, 200); }
  function старт() {
    прогон();
    try { new MutationObserver(отложить).observe(D.body, { childList: true, subtree: true }); } catch (e) { setInterval(прогон, 1500); }
    D.addEventListener('change', function (e) { if (e.target && e.target.classList && e.target.classList.contains('js-store-filter-opt-chb')) setTimeout(прогон, 80); }, true);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', старт); else старт();
})();
