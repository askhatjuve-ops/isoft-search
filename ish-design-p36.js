/* ish-design-p36.js  v1.1  (26.10.2026: убраны «Цена с НДС», «В наличии», «в т.ч. НДС», «Цены обновлены»; КП и «Сравнить» в одну строку; кандидат 17.10.2026)  П36 «карточка товара в духе главной C2»
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

  /* знак iSoft слева и листок со списком между текстом и кнопками - общий модуль ish-design-list-anim.js (как на главной); нет модуля - блок остаётся без них */
  function лист_в_блок(nf) {
    function вставить() {
      if (!W.ISHLA || nf.querySelector('.ishla')) return !!W.ISHLA;
      var з = D.createElement('div'); з.className = 'ishp36-nfl'; з.innerHTML = W.ISHLA.лого('ishp36-nfg', '#272B36', '#2B44C7');
      var т = nf.firstChild; т.className = 'ishp36-nft'; var w = D.createElement('div'); w.className = 'ishp36-nfs'; w.innerHTML = W.ISHLA.лист();
      nf.insertBefore(з, т); nf.insertBefore(w, nf.lastChild);
      W.ISHLA.пуск(w.firstChild);
      return true;
    }
    if (вставить()) return;
    if (!D.getElementById('ishla-js') && tag && tag.src) {
      var sc = D.createElement('script'), v = /[?&]v=(\w+)/.exec(tag.src);
      sc.id = 'ishla-js'; sc.defer = true;
      sc.src = tag.src.replace(/ish-design-p36\.js.*$/, 'ish-design-list-anim.js' + (v ? '?v=' + v[1] : ''));
      D.head.appendChild(sc);
    }
    var n = 0; (function ж() { if (!вставить() && ++n < 80) setTimeout(ж, 100); })();
  }

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

  /* 21.10: адаптивное окно фото. Tilda ставит cover: у очень широких/узких фото (патч-панель 1U ~5:1) видна увеличенная середина.
     По naturalWidth/Height: w/h > 1.6 или < 0.62 - показать целиком (contain, data-ishar="x"), остальные как были (cover). Главное фото и миниатюры. */
  var ARC = {};
  function arUrl(n) {
    var u = n.getAttribute('data-original') || n.getAttribute('data-image-url') || '';
    if (!u) { var m = /url\(["']?([^"')]+)/.exec(n.getAttribute('style') || ''); u = m ? m[1] : ''; }
    return /^data:/.test(u) ? '' : u;
  }
  function arOne(n) {
    var u = arUrl(n); if (!u) return;
    if (n.getAttribute('data-ishar-u') === u) return;
    n.setAttribute('data-ishar-u', u);
    var set = function (r) { try { if (r > 1.6 || r < 0.62) n.setAttribute('data-ishar', 'x'); else n.removeAttribute('data-ishar'); } catch (e) {} };
    if (ARC[u]) return set(ARC[u]);
    var im = new Image();
    im.onload = function () { if (im.naturalWidth && im.naturalHeight) { ARC[u] = im.naturalWidth / im.naturalHeight; set(ARC[u]); } };
    im.src = u;
  }
  function arAll() { var a = D.querySelectorAll('.ishpg-row .t-slds__bgimg'); for (var i = 0; i < a.length; i++) arOne(a[i]); }
  /* 26.10 решение владельца: в блоке цены нет «Цена с НДС», «в т.ч. НДС 16%: N», «Цены обновлены …» (строку .ishpg3-vat рисует фрагмент v8p7, p38 дописывал дату);
     то же в липкой панели телефона (.ishpg3-sp span: «Цена с НДС · В наличии» -> «В наличии»). Число цены и микроразметка (itemprop) не трогаются. */
  var стик_наблюдатель = 0;
  function стик_текст() {
    var sp = q('.ishpg3-sticky .ishpg3-sp span'); if (!sp) return;
    var t = sp.textContent, n = t.replace(/^\s*Цена с НДС\s*(·\s*)?/, '').replace(/^\s*В наличии\s*$/, '');
    if (n !== t) sp.textContent = n;
  }
  function убрать_ндс() {
    var v = D.querySelectorAll('.ishpg3-vat');
    for (var i = 0; i < v.length; i++) if (v[i].parentNode) v[i].parentNode.removeChild(v[i]);
    var av = D.querySelectorAll('.ishpg3-avail:not(.ishpg3-no)');   /* «В наличии» убрано (26.10); «Нет в наличии» / «Наличие уточним» остаются */
    for (var k = 0; k < av.length; k++) if (av[k].parentNode) av[k].parentNode.removeChild(av[k]);
    стик_текст();
    var sp = q('.ishpg3-sticky .ishpg3-sp span');
    if (sp && !стик_наблюдатель && W.MutationObserver) { стик_наблюдатель = 1; new MutationObserver(стик_текст).observe(sp, { childList: true, characterData: true, subtree: true }); }
  }
  function pass() {
    var row = q('.ishpg-row');
    if (!row) return false;
    try { arAll(); } catch (e) {}
    H.classList.add('ishp36-on');
    убрать_ндс();
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
      nf.innerHTML = '<div><h3>Не нашли нужное? Пришлите список</h3><p>Проработаем и ' + ((W.ISH_SLA && W.ISH_SLA.replyLc) ? W.ISH_SLA.replyLc() : 'ответим в рабочее время') + '.</p></div>' +
        '<div class="ishp36-nfb"><span class="ishp36-nfw"><a class="p" href="#zapros" role="button" data-ishp36-ask="1">Написать, что нужно</a></span>' +
        '<a class="s" href="/assortiment">Расширенный ассортимент 14000+ →</a></div>';
      p2.parentNode.insertBefore(nf, p2.nextSibling);
      лист_в_блок(nf);
    }
    return true;
  }

  /* окно запроса «Написать, что нужно»: на карточке нет главного окна (ish15м) - лёгкое своё; отправка в WhatsApp (как запасной путь главной); корзину не открываем никогда */
  var WA36 = '77758818531';
  function cl(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function zapros() {
    var n = cl((q('.js-store-prod-name') || {}).textContent) || cl((D.querySelector('meta[property="og:title"]') || {}).content) || cl((q('h1') || {}).textContent);
    var a = cl((q('.js-store-prod-sku') || {}).textContent).replace(/^(арт\.?|артикул)\s*:?\s*/i, '');
    var pre = n ? n + (a ? ' (арт. ' + a + ')' : '') + ' — нужно: ' : 'Нужно: ';
    var ov = q('.ishp36-zo');
    if (!ov) {
      ov = D.createElement('div'); ov.className = 'ishp36-zo'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Запрос на подбор');
      ov.innerHTML = '<div class="ishp36-zb"><button type="button" class="ishp36-zx" aria-label="Закрыть">×</button><h3>Что вам нужно?</h3>' +
        '<p>Напишите список или одну позицию — ' + ((W.ISH_SLA && W.ISH_SLA.replyLc) ? W.ISH_SLA.replyLc() : 'ответим в рабочее время') + '.</p>' +
        '<textarea class="ishp36-zt" rows="5" aria-label="Список"></textarea>' +
        '<input class="ishp36-zc" type="text" placeholder="Телефон или почта для ответа" aria-label="Контакт">' +
        '<button type="button" class="ishp36-zs">Отправить в WhatsApp</button>' +
        '<button type="button" class="ishp36-zs ishp36-zs2">Отправить в Telegram</button>' +
        '<p class="ishp36-zh" role="status" aria-live="polite"></p></div>';
      D.body.appendChild(ov);
      var close = function () { ov.classList.remove('on'); H.classList.remove('ishp36-zlock'); };
      ov.addEventListener('click', function (e) { if (e.target === ov || e.target.className === 'ishp36-zx') close(); });
      D.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      var сбор = function () {
        var t = q('.ishp36-zt', ov).value.trim();
        if (!t) { q('.ishp36-zt', ov).focus(); return ''; }
        var c = q('.ishp36-zc', ov).value.trim();
        return 'Здравствуйте! ' + t + (c ? '\nКонтакт: ' + c : '') + '\n' + location.origin + location.pathname;
      };
      q('.ishp36-zs', ov).addEventListener('click', function () {
        var msg = сбор(); if (!msg) return;
        W.open('https://wa.me/' + WA36 + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        close();
      });
      /* Telegram по номеру текст подставить не умеет: копируем в буфер, подсказка, открываем чат */
      q('.ishp36-zs2', ov).addEventListener('click', function () {
        var msg = сбор(); if (!msg) return;
        var h = q('.ishp36-zh', ov);
        var открыть = function (ok) {
          h.textContent = ok ? 'Текст скопирован — вставьте в чат.' : 'Не удалось скопировать — выделите текст и вставьте в чат вручную.';
          setTimeout(function () { W.open('https://t.me/+' + WA36, '_blank', 'noopener'); }, ok ? 700 : 0);
        };
        var запас = function () {
          var ta = D.createElement('textarea'); ta.value = msg; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
          D.body.appendChild(ta); ta.select(); var ok = false;
          try { ok = D.execCommand('copy'); } catch (e) {}
          D.body.removeChild(ta); открыть(ok);
        };
        if (W.navigator && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(function () { открыть(true); }, запас);
        else запас();
      });
    }
    q('.ishp36-zt', ov).value = pre;
    ov.classList.add('on'); H.classList.add('ishp36-zlock');
    var t = q('.ishp36-zt', ov); t.focus(); try { t.setSelectionRange(t.value.length, t.value.length); } catch (e) {}
  }
  D.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-ishp36-ask]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    zapros();
  }, true);

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
  (function arPoll(n) { try { arAll(); } catch (e) {} if (n < 20) setTimeout(function () { arPoll(n + 1); }, 700); })(0); /* ленивая подстановка фона Tilda - без события */
  (function wait(n) { if (!tick() && n < 40) setTimeout(function () { wait(n + 1); }, 250); })(0);
  if (W.MutationObserver) {
    var t = 0;
    new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; try { pass(); } catch (e) {} }, 250); })
      .observe(D.body, { childList: true, subtree: true });
  }
})();
