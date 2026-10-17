/* ish-design-p6.js · П6 «вид фильтров» + К1 «Список / Плитка» · 15.10.2026
   Внешний файл на Pages. Одна строка в HEAD:  <script defer src="https://askhatjuve-ops.github.io/isoft-search/ish-design-p6.js?v=1"></script>
   Сам подключает ish-design-p6.css (рядом с собой). Не загрузился — сайт как был.
   Что делает (всё идемпотентно, на любую ошибку молчит; родные узлы Tilda не переносит и не переписывает):
     К1  переключатель «Список / Плитка» над списком раздела; выбор — в localStorage (try/catch), по умолчанию список;
         включает класс ishd-tile на <html>, остальное делает CSS. Только где есть карточки .t-store__card[data-ish13].
     Ф2  пишет число вариантов группы в data-ishd-n заголовка (рисует CSS).
     Ф3  счётчики у значений ТОЛЬКО если страница дала window.ISH_P6_COUNTS = {"Бренд":{"ASUS":44}} (в DOM Tilda чисел нет).
         18.10: не дала — считаем сами по индексу поиска (ISHSearch.preload(): тот же файл и тот же запрос, второго скачивания нет)
         и только «Бренд» текущего раздела: число = товаров с этим брендом в разделе, значение должно совпасть с индексом буква в букву.
         Бренды, которые индекс склеил (DELL / Dell / Dell Technologies), и всё без точного числа — без цифры. Нулей не рисуем.
         Характеристики (память, диагональ…) по индексу НЕ считаем: у индекса свои, укрупнённые значения, числа расходятся с Tilda.
         Выключатель: window.ISH_P6_NO_COUNTS = true.
     Ф5  кнопка цены «OK» → «Применить», подписи полей для экранного диктора.
     Ф6  счётчик выбранного на кнопке «Фильтры» (телефон).
     Ф8  «Сбросить всё» в шапке панели + запасные чипы, если ishpe-1410 чипов не нарисовал (телефон). Не дублирует ishpe.
   Не трогает window.ISH, не пишет в Tilda, не ходит в сеть. */
(function () {
  'use strict';
  try {
    if (window.ISH_P6) return;
    window.ISH_P6 = { версия: 'ishp6-1810' };

    /* ── подключаем CSS рядом со скриптом ── */
    (function css() {
      if (document.getElementById('ishd-p6-css')) return;
      var s = document.currentScript, src = s && s.src;
      if (!src) {
        var all = document.getElementsByTagName('script');
        for (var i = 0; i < all.length; i++) if (/ish-design-p6\.js/.test(all[i].src || '')) { src = all[i].src; break; }
      }
      if (!src) return;
      var l = document.createElement('link');
      l.id = 'ishd-p6-css'; l.rel = 'stylesheet';
      l.href = src.replace(/ish-design-p6\.js/, 'ish-design-p6.css');
      document.head.appendChild(l);
    })();

    var KEY = 'ishd-view', таймер = 0;
    function q(s, r) { return (r || document).querySelector(s); }
    function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function ls(get, v) {
      try { return get ? window.localStorage.getItem(KEY) : window.localStorage.setItem(KEY, v); } catch (e) { return null; }
    }
    function экр(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

    /* ═══════════ К1 · переключатель вида ═══════════ */
    var ИК_СПИСОК = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5H14M5.5 8H14M5.5 12.5H14M2 3.5h.01M2 8h.01M2 12.5h.01"/></svg>';
    var ИК_ПЛИТКА = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>';
    var вид = ls(true) === 'tile' ? 'tile' : 'list';

    function применитьВид(v, сохранить) {
      вид = v === 'tile' ? 'tile' : 'list';
      document.documentElement.classList.toggle('ishd-tile', вид === 'tile');
      var кн = qa('.ishd-seg button');
      for (var i = 0; i < кн.length; i++) кн[i].setAttribute('aria-pressed', кн[i].getAttribute('data-v') === вид ? 'true' : 'false');
      if (сохранить) ls(false, вид);
    }

    function переключатель() {
      var карт = q('.t-store__card[data-ish13]');
      var бар = q('.ishd-view');
      if (!карт) { if (бар) бар.hidden = true; document.documentElement.classList.remove('ishd-tile'); return; }
      var список = карт.parentNode, якорь = список, st = q('.t-store');
      while (якорь.parentNode && якорь.parentNode !== st && якорь.parentNode !== document.body) якорь = якорь.parentNode;
      if (!бар) {
        бар = document.createElement('div');
        бар.className = 'ishd-view';
        бар.innerHTML = '<span class="ishd-view__lbl">Вид</span><div class="ishd-seg" role="group" aria-label="Вид товаров">' +
          '<button type="button" data-v="list" aria-pressed="true">' + ИК_СПИСОК + 'Список</button>' +
          '<button type="button" data-v="tile" aria-pressed="false">' + ИК_ПЛИТКА + 'Плитка</button></div>';
        бар.addEventListener('click', function (e) {
          var б = e.target && e.target.closest ? e.target.closest('button[data-v]') : null;
          if (б) применитьВид(б.getAttribute('data-v'), true);
        });
      }
      бар.hidden = false;
      if (бар.nextElementSibling !== якорь || бар.parentNode !== якорь.parentNode) якорь.parentNode.insertBefore(бар, якорь);
      применитьВид(вид, false);
    }

    /* ═══════════ фильтры ═══════════ */
    function числоВыбрано() {
      var n = qa('.t-store .js-store-filter-opt-chb:checked').length;
      var пц = q('.t-store .t-store__filter__item_price');
      if (пц) {
        var a = q('.js-store-filter-pricemin', пц), b = q('.js-store-filter-pricemax', пц);
        function ц(x) { return parseInt(String(x || '').replace(/\D/g, ''), 10); }
        if (a && b && a.getAttribute('data-min-val') && b.getAttribute('data-max-val') &&
            (ц(a.value) > ц(a.getAttribute('data-min-val')) || ц(b.value) < ц(b.getAttribute('data-max-val')))) n++;
      }
      return n;
    }

    function группы() {
      var эл = qa('.t-store .t-store__filter__item');
      for (var i = 0; i < эл.length; i++) {
        var з = q(':scope > .t-store__filter__item-title', эл[i]);
        if (!з) continue;
        var n = qa('label.t-store__filter__checkbox', эл[i]).length;       // Ф2: число вариантов
        if (n) { if (з.getAttribute('data-ishd-n') !== String(n)) з.setAttribute('data-ishd-n', String(n)); }
        else if (з.hasAttribute('data-ishd-n')) з.removeAttribute('data-ishd-n');
        if (n) {
          var имя = з.textContent.replace(/\s+/g, ' ').trim();
          if (з.getAttribute('aria-label') !== имя + ', вариантов: ' + n) з.setAttribute('aria-label', имя + ', вариантов: ' + n);
        }
      }
    }

    /* Ф3 сама: бренды раздела по индексу поиска. Ничего не качаем сами — берём промис ISHSearch.preload() (файл уже качает ish-search.js) */
    var авто = null, запросили = false, ждали = 0;
    function ключБренда(т) { return String(т).toLowerCase().replace(/[^a-zа-яё0-9]+/g, ' ').replace(/^\s+|\s+$/g, '').split(' ')[0]; }

    function брендыРаздела(idx) {                                          // {бренд из индекса: число товаров} для раздела по адресу страницы
      var путь = location.pathname.replace(/\/+$/, '').toLowerCase(), c = -1, n = {};
      for (var i = 0; i < (idx.C || []).length; i++) if (String(idx.C[i][2]).toLowerCase() === путь) { c = i; break; }
      if (c < 0 || !idx.P || !idx.B) return null;                          // не страница раздела (главная, поиск, «для организаций») — чисел нет
      for (var j = 0; j < idx.P.length; j++) {
        if (idx.P[j][2] !== c) continue;
        var б = idx.B[idx.P[j][1]];
        if (б) n[б] = (n[б] || 0) + 1;
      }
      return n;
    }

    function бренд() {                                                     // группа «Бренд» в панели Tilda
      var эл = qa('.t-store .t-store__filter__item_checkbox');
      for (var i = 0; i < эл.length; i++) {
        var з = q('.t-store__filter__item-title', эл[i]);
        if (з && з.textContent.replace(/\s+/g, ' ').trim() === 'Бренд') return { эл: эл[i], з: з };
      }
      return null;
    }

    function данныеАвто() {
      if (!авто) return null;
      var г = бренд();
      if (!г) return null;
      var я = qa('label.t-store__filter__checkbox input', г.эл), зн = [], кл = {}, гр = {}, есть = false;
      for (var i = 0; i < я.length; i++) {
        var v = я[i].getAttribute('data-filter-value');
        if (v == null || v === '') continue;
        зн.push(v); кл[ключБренда(v)] = (кл[ключБренда(v)] || 0) + 1;
      }
      for (var k = 0; k < зн.length; k++) {
        if (кл[ключБренда(зн[k])] > 1) continue;                           // DELL / Dell / Dell Technologies: индекс склеил — точного числа нет
        if (Object.prototype.hasOwnProperty.call(авто, зн[k]) && авто[зн[k]] > 0) { гр[зн[k]] = авто[зн[k]]; есть = true; }
      }
      return есть ? { 'Бренд': гр } : null;
    }

    function запроситьИндекс() {                                           // лениво: только когда панель с брендами реально на экране
      if (авто || запросили) return;
      var г = бренд();
      if (!г || !(г.з.offsetWidth || г.з.offsetHeight || (г.з.getClientRects && г.з.getClientRects().length))) return;
      var S = window.ISHSearch;
      if (!S || typeof S.preload !== 'function') {                         // ish-search.js ещё не подгрузился — подождём немного (до ~15 с), сами индекс не качаем
        if (++ждали < 10) setTimeout(запуск, 1500);
        return;
      }
      запросили = true;
      try {
        S.preload().then(function (idx) { try { авто = брендыРаздела(idx) || {}; } catch (e) { авто = {}; } запуск(); }, function () {});
      } catch (e) {}
    }

    function счётчики() {                                                  // Ф3: только при наличии данных
      if (window.ISH_P6_NO_COUNTS) return;
      var D = window.ISH_P6_COUNTS;
      if (!D || typeof D !== 'object') { запроситьИндекс(); D = данныеАвто(); }
      if (!D) return;
      var эл = qa('.t-store .t-store__filter__item_checkbox');
      for (var i = 0; i < эл.length; i++) {
        var з = q('.t-store__filter__item-title', эл[i]);
        var гр = з && D[з.textContent.replace(/\s+/g, ' ').trim()];
        if (!гр) continue;
        var я = qa('label.t-store__filter__checkbox', эл[i]);
        for (var j = 0; j < я.length; j++) {
          var инп = q('input', я[j]), знач = инп && инп.getAttribute('data-filter-value');
          if (знач == null || !Object.prototype.hasOwnProperty.call(гр, знач)) continue;
          var c = q('.ishd-ct', я[j]);
          if (!c) { c = document.createElement('span'); c.className = 'ishd-ct'; я[j].appendChild(c); }
          if (c.textContent !== String(гр[знач])) c.textContent = String(гр[знач]);
          я[j].classList.toggle('ishd-z', +гр[знач] === 0 && !(инп && инп.checked));
        }
      }
    }

    function цена() {                                                      // Ф5
      var пц = q('.t-store .t-store__filter__item_price');
      if (!пц) return;
      var a = q('.js-store-filter-pricemin', пц), b = q('.js-store-filter-pricemax', пц), к = q('.js-store-filter-price-btn', пц);
      if (a && !a.getAttribute('aria-label')) a.setAttribute('aria-label', 'Цена от, ₸');
      if (b && !b.getAttribute('aria-label')) b.setAttribute('aria-label', 'Цена до, ₸');
      if (к && /^\s*(ok|ок)\s*$/i.test(к.textContent)) к.textContent = 'Применить';
    }

    function кнопкаТелефон() {                                             // Ф6
      var к = q('.t-store .t-store__filter__opts-mob-btn');
      if (!к) return;
      var н = q(':scope > .ishd-n', к), чис = числоВыбрано();
      if (!н) { н = document.createElement('b'); н.className = 'ishd-n'; н.hidden = true; к.appendChild(н); }
      if (н.textContent !== String(чис)) н.textContent = String(чис);
      н.hidden = !чис;
    }

    var сброс = null;
    function нативныйСброс() {
      var р = q('.t-store .js-store-filter-reset');
      if (р) { р.click(); return; }
      qa('.t-store .js-store-filter-opt-chb:checked').forEach(function (x) { x.click(); });
    }

    function шапкаПанели() {                                               // Ф8: «Сбросить всё» в шапке панели
      var з = q('.вн-бок__фильтры > .вн-бок__заг');
      if (!з) return;
      var к = q('.ishd-reset', з);
      if (!к) {
        к = document.createElement('button');
        к.type = 'button'; к.className = 'ishd-reset'; к.textContent = 'Сбросить всё'; к.hidden = true;
        к.addEventListener('click', function (e) { e.preventDefault(); нативныйСброс(); запуск(); });
        з.appendChild(к);
      }
      к.hidden = !числоВыбрано();
    }

    function запасныеЧипы() {                                              // Ф8: только если ishpe чипов нет
      var выбр = qa('.t-store .js-store-filter-opt-chb:checked');
      var своя = q('.ishd-chips');
      var есть = qa('.ishpe-chip').length > 0;
      if (!выбр.length || есть) { if (своя) { своя.innerHTML = ''; своя.classList.remove('ishd-on'); } return; }
      var карт = q('.t-store__card[data-ish13]'), св = q('.t-store__card-list') || (карт && карт.parentNode);
      if (!св) return;
      var st = q('.t-store'), якорь = св;
      while (якорь.parentNode && якорь.parentNode !== st && якорь.parentNode !== document.body) якорь = якорь.parentNode;
      if (!своя) {
        своя = document.createElement('div'); своя.className = 'ishd-chips';
        своя.addEventListener('click', function (e) {
          var б = e.target && e.target.closest ? e.target.closest('button') : null;
          if (!б) return;
          e.preventDefault();
          if (б.classList.contains('ishd-rs')) нативныйСброс();
          else { var х = qa('.t-store .js-store-filter-opt-chb:checked')[+б.getAttribute('data-i')]; if (х) х.click(); }
          setTimeout(запуск, 150);
        });
      }
      var бар = q('.ishd-view');
      var куда = бар && бар.parentNode === якорь.parentNode ? бар : якорь;
      if (своя.nextElementSibling !== куда) куда.parentNode.insertBefore(своя, куда);
      var ч = '', КР = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      for (var i = 0; i < выбр.length; i++) {
        var я = выбр[i].closest ? выбр[i].closest('label') : null;
        var нз = я && q('.t-store__filter__title', я);
        var т = (нз ? нз.textContent : я ? я.textContent : выбр[i].getAttribute('data-filter-value')) || '';   // подпись без нашего числа .ishd-ct
        т = т.replace(/\s+/g, ' ').trim();
        if (!т) continue;
        ч += '<span class="ishd-chip">' + экр(т) + '<button type="button" data-i="' + i + '" aria-label="Убрать: ' + экр(т) + '">' + КР + '</button></span>';
      }
      var html = ч + '<button type="button" class="ishd-rs">Сбросить всё</button>';
      if (своя.getAttribute('data-sig') !== html) { своя.innerHTML = html; своя.setAttribute('data-sig', html); }
      своя.classList.add('ishd-on');
    }

    function работа() {
      таймер = 0;
      try { переключатель(); } catch (e) {}
      try { группы(); счётчики(); цена(); кнопкаТелефон(); шапкаПанели(); запасныеЧипы(); } catch (e) {}
    }
    function запуск() { if (таймер) clearTimeout(таймер); таймер = setTimeout(работа, 150); }

    function старт() {
      работа();
      var корень = q('.t-store') || document.body;
      if (window.MutationObserver) {
        new MutationObserver(function (з) {
          for (var i = 0; i < з.length; i++) {
            var ц = з[i].target;
            if (ц && ц.nodeType === 1 && ц.closest && (ц.closest('.ishd-view') || ц.closest('.ishd-chips'))) continue;   // свои правки не гоняем по кругу
            запуск(); return;
          }
        }).observe(корень, { childList: true, subtree: true });
      }
      document.addEventListener('change', function (e) {
        if (e.target && e.target.classList && e.target.classList.contains('js-store-filter-opt-chb')) запуск();
      }, true);
      /* тап по крестику/«Показать товары» шторки: на 0,7 с трубка tel: под крестиком скрыта (visibility:hidden, см. css) — защита от «клика сквозь» закрывающийся слой */
      var держим = 0;
      function держать(e) {
        var ц = e.target && e.target.closest ? e.target : null;
        if (!ц || !ц.closest('.вн-моб-закр, .вн-моб-пок')) return;
        document.documentElement.classList.add('ishd-hold');
        clearTimeout(держим);
        держим = setTimeout(function () { document.documentElement.classList.remove('ishd-hold'); }, 700);
      }
      document.addEventListener('pointerdown', держать, true);
      document.addEventListener('touchstart', держать, true);
      document.addEventListener('click', держать, true);
      document.addEventListener('click', function (e) {
        var ц = e.target && e.target.closest ? e.target : null;
        if (!ц || ц.closest('.вн-моб-шап, .вн-моб-низ')) return;       // крестик, «Сбросить», «Показать товары» шторки — не наши, не трогаем
        if (ц.closest('.t-store__filter, .ishpe-chips, .ishd-chips')) запуск();
      }, true);
    }

    /* ждём, пока Tilda нарисует список/фильтры (до ~30 с), и ничего не делаем на страницах без каталога */
    var шагов = 0, ждать = setInterval(function () {
      if (q('.t-store .t-store__filter__item') || q('.t-store__card[data-ish13]')) { clearInterval(ждать); старт(); }
      else if (++шагов > 100) clearInterval(ждать);
    }, 300);
  } catch (e) { /* ничего не ломаем */ }
})();
