/* ish-design-p36.js  v1.0  (кандидат 17.10.2026; НЕ выложено)  П36 «карточка товара в духе главной C2»
   Грузится загрузчиком П4 (строка P36V, как P31) только на странице товара (.ishpg-row). Сам подключает ish-design-p36.css рядом с собой.
   Что делает: ставит html.ishp36-on; в панели покупки оборачивает цену/наличие/кнопки в индиго-блок (.ishp36-bb), КП и «Уточнить» в одну строку;
   подписи доверия по решению владельца; финальный блок «Не нашли нужное?» после «Вам может подойти».
   Узлы блока Tilda не переписывает и не удаляет: только переносит внутри панели и добавляет свои (префикс ishp36-). Селекторы p9/p10/p25 (потомки) работают.
   Выключатели: window.ISH_P4_NO_P36 (до загрузчика) или window.ISH_P36_OFF. Ошибка / не загрузился - сайт как был. */
(function () {
  'use strict';
  var W = window, D = document, H = D.documentElement;
  if (W.ISH_P4_NO_P36 || W.ISH_P36_OFF || W.ISH_P36) return;
  W.ISH_P36 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p36.js"]');

  (function css() {
    if (D.getElementById('ishp36-css')) return;
    var src = tag && tag.src; if (!src) return;
    var l = D.createElement('link'); l.id = 'ishp36-css'; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-p36\.js.*$/, 'ish-design-p36.css' + (v ? '?v=' + v[1] : ''));
    D.head.appendChild(l);
  })();

  var TRUST = [
    [/гаранти/i, 'Гарантия от производителя'],
    [/доставк/i, 'Бесплатная доставка'],
    [/расч[её]т|безнал/i, 'Безналичный расчёт'],
    [/возврат/i, 'Индивидуальный подход']
  ];

  function q(s, r) { return (r || D).querySelector(s); }


  /* ── сравнение: один источник правды p25 (localStorage 'ishp25-cmp-v1', ключ = раздел из адреса; тот же, что у списка раздела и плашки «Сравнить (N)») ── */
  var K_CMP = 'ishp25-cmp-v1';
  function sec() { var p = location.pathname.replace(/^\/+|\/+$/g, '').split('/'), i = p.indexOf('tproduct'); return i > 0 ? p[i - 1] : (p[0] || ''); }
  function cmpN() { try { var v = JSON.parse(W.localStorage.getItem(K_CMP) || '{}')[sec()]; return v && v.length ? v.length : 0; } catch (e) { return 0; } }
  function cmpSync() {
    var w = q('.ishp36-cmpw'), nat = q('.ishp25-addcmp'); if (!w || !nat) return;
    var on = nat.classList.contains('ishp25-addcmp_on') || nat.getAttribute('aria-pressed') === 'true', n = cmpN();
    var inp = q('input', w); if (inp.checked !== on) inp.checked = on;
    w.classList.toggle('ishp36-cmp_on', on);
    q('.ishp36-cmp__t', w).textContent = on ? 'В сравнении \u2713' : 'Сравнить';
    var a = q('.ishp36-cmp__open', w);
    a.hidden = n < 1; a.textContent = 'Открыть сравнение (' + n + ')';
    a.setAttribute('aria-disabled', n < 2 ? 'true' : 'false');
    a.title = n < 2 ? 'Добавьте ещё один товар из этого раздела' : 'Открыть таблицу сравнения';
  }
  function cmpInit(bb) {
    var nat = q('.ishp25-addcmp'), buy = q('.ishp36-links', bb);
    if (!buy) { buy = D.createElement('div'); buy.className = 'ishp36-links'; bb.appendChild(buy); }
    if (!nat || q('.ishp36-cmpw', buy)) { cmpSync(); return; }
    var w = D.createElement('div'); w.className = 'ishp36-cmpw';
    w.innerHTML = '<label class="ishp36-cmp"><input type="checkbox"><span class="ishp36-cmp__box"></span><span class="ishp36-cmp__t">Сравнить</span></label><a href="#" class="ishp36-cmp__open" hidden></a>';
    buy.appendChild(w);
    q('input', w).addEventListener('change', function () { nat.click(); cmpSync(); });   /* то же действие, что у родной кнопки; при пределе товаров p25 покажет своё сообщение, галка вернётся */
    q('.ishp36-cmp__open', w).addEventListener('click', function (e) {
      e.preventDefault();
      try { if (cmpN() >= 2 && W.ISH_P25_API) W.ISH_P25_API.открыть(); } catch (x) {}
    });
    if (W.MutationObserver) new MutationObserver(cmpSync).observe(nat, { attributes: true, attributeFilter: ['class', 'aria-pressed'] });
    W.addEventListener('storage', function (e) { if (e.key === K_CMP) cmpSync(); });
    cmpSync();
  }

  function pass() {
    var row = q('.ishpg-row');
    if (!row) return false;
    H.classList.add('ishp36-on');
    var panel = q('.ishpg3-panel', row);
    if (panel && !q('.ishp36-bb', panel)) {
      var price = q('.js-store-price-wrapper', panel), buy = q('.ishpg-buy', panel);
      if (price && buy) {
        var bb = D.createElement('div'); bb.className = 'ishp36-bb';
        panel.insertBefore(bb, price);
        ['.js-store-price-wrapper', '.ishpg3-avail', '.ishpg-buy', '.ishp25-addcmp'].forEach(function (s) {
          var n = q(s, panel); if (n && n.parentNode === panel) bb.appendChild(n);
        });
      }
    }
    var bb2 = q('.ishp36-bb', panel || D);
    if (bb2) {
      /* кнопка сравнения могла дорисоваться позже: подтянуть в блок */
      var cmp = q('.ishp25-addcmp', panel);
      if (cmp && cmp.parentNode === panel) bb2.appendChild(cmp);
      var kp = q('.ishp10-kp', panel), ask = q('.ishpg3-ask', panel), lw = q('.ishp36-links', bb2);
      if ((kp || ask) && !lw) { lw = D.createElement('div'); lw.className = 'ishp36-links'; bb2.appendChild(lw); }
      if (lw) {
        if (kp && kp.parentNode !== lw) lw.appendChild(kp);
        if (ask && ask.parentNode !== lw) lw.appendChild(ask);
      }
    }
    /* сравнение: родная кнопка p25 (.ishp25-addcmp) остаётся источником правды и скрыта; наш чекбокс только нажимает её и повторяет её состояние */
    if (bb2) cmpInit(bb2);
    /* доверие: тексты владельца; значок остаётся родным */
    var items = D.querySelectorAll('.ishpg3-trust li');
    for (var i = 0; i < items.length; i++) {
      var li = items[i], sp = li.querySelector('span'); if (!sp) continue;
      for (var j = 0; j < TRUST.length; j++) {
        if (TRUST[j][0].test(sp.textContent)) { if (sp.textContent !== TRUST[j][1]) sp.textContent = TRUST[j][1]; break; }
      }
    }
    /* финал: «Не нашли нужное?» после полки */
    var p2 = q('.ishpg-p2');
    if (p2 && !q('.ishp36-nf') && p2.parentNode) {
      var nf = D.createElement('section'); nf.className = 'ishp36-nf'; nf.setAttribute('aria-label', 'Не нашли нужное');
      nf.innerHTML = '<div><h3>Не нашли нужное? Пришлите список</h3><p>Проработаем и ответим в день обращения.</p></div>' +
        '<div class="ishp36-nfb"><span class="ishp36-nfw"><a class="p" href="/spec#kp">Написать, что нужно</a></span>' +
        '<a class="s" href="/assortiment">Расширенный ассортимент 14000+ →</a></div>';
      p2.parentNode.insertBefore(nf, p2.nextSibling);
    }
    return true;
  }

  var done = false;
  function tick() {
    var ok = false;
    try { ok = pass(); } catch (e) {}
    if (ok && !done) {
      done = true;
      try { setTimeout(function () { W.dispatchEvent(new Event('resize')); }, 300); } catch (e) {} /* слайдер Tilda пересчитает высоту под новую ширину фото */
    }
    return ok;
  }
  (function wait(n) { if (!tick() && n < 40) setTimeout(function () { wait(n + 1); }, 250); })(0);
  if (W.MutationObserver) {
    var t = 0;
    new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; try { pass(); } catch (e) {} }, 250); })
      .observe(D.body, { childList: true, subtree: true });
  }
})();
