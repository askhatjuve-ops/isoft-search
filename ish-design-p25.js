/* ish-design-p25.js  v3  (16.10.2026)  П25 «Сравнение моделей» (К19) + «Таблица однотипных товаров» (К21), b2b.isoft-shop.kz
   Внешний файл на Pages. Грузится из ish-design-p4.js (строка в README) на страницах со списком товаров (.t-store__card[data-ish13])
   и на карточке товара (/tproduct/). Сам подключает ish-design-p25.css рядом с собой. Не загрузился - сайт как был.
   Не пишет в Tilda, не правит родные узлы: добавляет свои с префиксом ishp25-. «В корзину» не перекрашивает и не подменяет:
   кнопки сравнения и таблицы кликают ЧЕРЕЗ родную a.ish13-buy (список) / .ishpg-add (карточка) - одно место добавления в корзину.
   Данные: DOM карточек списка (название, цена, артикул, пять характеристик столбиком .ish13-крат i). Полные характеристики
   (только для 2-4 сравниваемых товаров, только по клику «Сравнить», с кэшем в sessionStorage) - из того же getproduct,
   что читает сам виджет Tilda. Нет ответа - сравниваем по тем пяти, что есть в карточке, и пишем об этом.
   v2: плашка «Сравнить (N)» поднимается над нижней панелью телефона (.таб, .нш-мт), мини-корзиной (.ishk-bar) и липкими панелями карточки (.ishp10-sticky, .ishpg3-sticky), если они пересекаются с ней по горизонтали.
   v3: таблица (К21) получает нижний отступ = высоте видимой нижней панели телефона (.таб, .нш-мт) + 16 px, чтобы последние строки и липкий первый столбец не оставались под панелью (пересчёт при resize).
   Выключатели: window.ISH_P25_OFF=1 (всё) · window.ISH_P25={сравнение:false, таблица:false} (по частям; латиницей: compare, table). */
(function () {
  'use strict';
  var W = window, D = document, H = D.documentElement;
  if (W.__ishP25 || W.ISH_P25_OFF) return;
  var CF = (W.ISH_P25 && typeof W.ISH_P25 === 'object') ? W.ISH_P25 : {};
  var ON_CMP = !(CF['сравнение'] === false || CF.compare === false);
  var ON_TBL = !(CF['таблица'] === false || CF.table === false);
  if (!ON_CMP && !ON_TBL) return;
  W.__ishP25 = 'v1';

  /* ── CSS рядом со скриптом ── */
  (function css() {
    if (D.getElementById('ishp25-css')) return;
    var s = D.currentScript, src = s && s.src;
    if (!src) { var all = D.getElementsByTagName('script'); for (var i = 0; i < all.length; i++) if (/ish-design-p25\.js/.test(all[i].src || '')) { src = all[i].src; break; } }
    if (!src) return;
    var l = D.createElement('link'); l.id = 'ishp25-css'; l.rel = 'stylesheet';
    l.href = src.replace(/ish-design-p25\.js/, 'ish-design-p25.css'); D.head.appendChild(l);
  })();

  /* ══ настройки ══ */
  var MAX = 4;                                   /* К19: предел товаров в сравнении (один раздел) */
  /* К21: разделы, где товары однотипны. Ключ - адрес раздела из ДЕРЕВО_КАТАЛОГА.json; значение - предпочтительные столбцы
     (имена характеристик как их кладёт ish13 в карточку) или null - тогда 4 самых частых имени характеристик из карточек.
     Хотя бы 2 из предпочтительных должны встретиться в карточках раздела, иначе работает автоподбор. */
  var ТАБЛИЦЫ = {
    'ssd-nakopiteli': ['Ёмкость', 'Интерфейс', 'Форм-фактор', 'Скорость чтения', 'Скорость записи'],
    'zhestkie-diski': ['Ёмкость', 'Интерфейс', 'Форм-фактор', 'Скорость вращения', 'Кэш-память'],
    'operativnaya-pamyat': ['Тип памяти', 'Объём', 'Объём комплекта', 'Частота', 'Форм-фактор'],
    'fleshki-i-karty-pamyati': null,
    'karty-pamyati': null
  };
  var K_CMP = 'ishp25-cmp-v1', K_VIEW = 'ishp25-view', K_FULL = 'ishp25-full:';

  /* ══ утилиты ══ */
  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function mk(t, c, h) { var e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function txt(e) { return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function money(n) { return n > 0 ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸' : 'по запросу'; }
  function step(n, f) { try { f(); } catch (e) { if (W.console) console.warn('ishp25 ' + n + ':', e && e.message); } }
  function until(fn, max, every) {
    var i = 0; (function go() { var ok = false; try { ok = fn(); } catch (e) { ok = false; } if (!ok && ++i < (max || 80)) setTimeout(go, every || 250); })();
  }
  var mem = {};
  function lsGet(k) { try { return W.localStorage.getItem(k); } catch (e) { return mem[k] == null ? null : mem[k]; } }
  function lsSet(k, v) { try { W.localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  function lsDel(k) { try { W.localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  function ssGet(k) { try { return W.sessionStorage.getItem(k); } catch (e) { return mem['s' + k] == null ? null : mem['s' + k]; } }
  function ssSet(k, v) { try { W.sessionStorage.setItem(k, v); } catch (e) { mem['s' + k] = v; } }
  function json(s, d) { try { var v = JSON.parse(s); return v == null ? d : v; } catch (e) { return d; } }
  var ICON = {
    cart: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M1 1h2.2l2 10.5h9.3l1.8-7.5H4.4"/><circle cx="6.5" cy="15.5" r="1.3"/><circle cx="13.5" cy="15.5" r="1.3"/></svg>',
    x: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
    cmp: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 2v12M11 2v12M2 5h3M2 11h3M11 5h3M11 11h3"/></svg>',
    tbl: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 6.5h12M2 10h12M6.5 6.5V13"/></svg>',
    list: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5H14M5.5 8H14M5.5 12.5H14M2 3.5h.01M2 8h.01M2 12.5h.01"/></svg>'
  };

  /* ══ раздел ══ */
  function раздел() {
    var p = location.pathname.replace(/^\/+|\/+$/g, '').split('/'), i = p.indexOf('tproduct');
    if (i > 0) return p[i - 1];
    return i === 0 ? '' : (p[0] || '');
  }
  var SEC = раздел(), ЭТО_КАРТОЧКА = location.pathname.indexOf('/tproduct/') > -1;

  /* ══ данные карточки списка ══ */
  function inPopup(e) { return !!(e.closest && e.closest('.t-store__prod-popup, .t-popup, .t-catalog__product-popup')); }
  function карточки() {
    return qa('.t-store__card[data-product-uid], .вн-т[data-product-uid]').filter(function (c) { return !inPopup(c); });   /* кандидат: + строки родительской (.вн-т) */
  }
  function числоЦены(c) {
    var e = q('.js-store-prod-price-val, .js-product-price, .вн-т__цена b', c);
    var v = e ? (e.getAttribute('data-product-price-def') || txt(e)) : '';
    return parseFloat(String(v).replace(/[^\d.]/g, '')) || 0;
  }
  function парыИзКарточки(c) {
    return qa('.ish13-крат i', c).map(function (i) {
      var b = q('b', i), k = txt(b).replace(/[:\s]+$/, ''), full = txt(i), v = txt(i);
      if (b) v = full.slice(txt(b).length).replace(/^[:\s]+/, '');
      return [k, v];
    }).filter(function (p) { return p[0] && p[1]; });
  }
  function картинка(c) {
    var im = q('.вн-т__фото img', c); if (im) return im.getAttribute('src') || '';
    var b = q('.t-store__card__bgimg, [data-original]', c), u = '';
    if (b) {
      u = b.getAttribute('data-original') || '';
      if (!u) { var m = /url\((['"]?)(.*?)\1\)/.exec(b.getAttribute('style') || ''); u = m ? m[2] : ''; }
    }
    return u;
  }
  function снять(c) {
    var ne = q('.js-store-prod-name, .t-store__card__title, .вн-т__имя', c), a = q('a[href]', c);
    return {
      u: c.getAttribute('data-product-uid'),
      n: ne ? txt(ne) : '',
      p: числоЦены(c),
      l: c.getAttribute('data-product-url') || (a ? a.getAttribute('href') : '') || '',
      i: картинка(c),
      a: txt(q('.js-store-prod-sku, .t-store__card__sku, .вн-т__арт', c)).replace(/^Артикул:?\s*/i, ''),
      c: парыИзКарточки(c)
    };
  }
  function родная(uid) {                           /* родная кнопка «В корзину» этого товара: в списке или на его карточке */
    uid = String(uid).replace(/[^\w-]/g, '');
    var k = q('.t-store__card[data-product-uid="' + uid + '"] a.ish13-buy');
    if (k) return k;
    if (ЭТО_КАРТОЧКА) {
      var pu = q('.t-store__prod-popup [data-product-uid], .js-store-product[data-product-uid], [data-product-uid]');
      if (pu && pu.getAttribute('data-product-uid') === uid) return q('.ishpg-add') || q('.t-store__prod-popup__btn');
    }
    return null;
  }

  /* ══ К19: хранилище выбора ══ */
  function читатьВсё() { return json(lsGet(K_CMP), {}); }
  function выбор() { var a = читатьВсё()[SEC]; return a && a.length ? a : []; }
  function писать(список) { var v = читатьВсё(); if (список.length) v[SEC] = список; else delete v[SEC]; lsSet(K_CMP, JSON.stringify(v)); }
  function ищи(u) { var s = выбор(); for (var i = 0; i < s.length; i++) if (s[i].u === u) return i; return -1; }
  function переключить(сн, вкл) {
    var s = выбор(), i = ищи(сн.u);
    if (вкл && i < 0) { if (s.length >= MAX) return false; s.push(сн); }
    if (!вкл && i > -1) s.splice(i, 1);
    писать(s); обновить(); return true;
  }
  function очистить() { писать([]); обновить(); }

  /* ══ К19: чекбоксы в списке ══ */
  function чекбоксы() {
    if (!ON_CMP) return;
    var s = выбор(), полно = s.length >= MAX;
    карточки().forEach(function (c) {
      if (!c.hasAttribute('data-ish13') && !c.classList.contains('вн-т')) return;
      var uid = c.getAttribute('data-product-uid'), л = q(':scope > .ishp25-cmp', c);
      if (!л) {
        л = mk('label', 'ishp25-cmp', '<input type="checkbox"><span class="ishp25-cmp__box"></span><span class="ishp25-cmp__t">Сравнить</span>');
        л.addEventListener('click', function (e) { e.stopPropagation(); });
        q('input', л).addEventListener('change', function (e) {
          var inp = e.target, ok = переключить(снять(c), inp.checked);
          if (!ok) { inp.checked = false; мигнуть('Можно сравнить не больше ' + MAX + ' товаров'); }
        });
        c.appendChild(л);
      }
      var inp = q('input', л), on = ищи(uid) > -1;
      if (inp.checked !== on) inp.checked = on;
      inp.disabled = полно && !on;
      л.classList.toggle('ishp25-cmp_on', on);
      л.classList.toggle('ishp25-cmp_dis', inp.disabled);
      л.setAttribute('title', inp.disabled ? 'Уже ' + MAX + ' товара: уберите один, чтобы добавить этот' : 'Добавить к сравнению');
      var nm = q('.js-store-prod-name, .t-store__card__title, .вн-т__имя', c);
      inp.setAttribute('aria-label', 'Сравнить: ' + txt(nm));
    });
  }

  /* ══ плашка ══ */
  var плашка = null, сообщ = null, сообщТ = 0;
  function мигнуть(т) {
    if (!сообщ) { сообщ = mk('div', 'ishp25-toast'); сообщ.setAttribute('role', 'status'); D.body.appendChild(сообщ); }
    сообщ.textContent = т; сообщ.classList.add('ishp25-toast_on');
    clearTimeout(сообщТ); сообщТ = setTimeout(function () { сообщ.classList.remove('ishp25-toast_on'); }, 2600);
  }
  var ПРЕПЯТСТВИЯ = ['.ishk-bar', '.ishp10-sticky', '.ishpg3-sticky', '.таб', '.нш-мт'], подъёмТ = 0;
  function подъём() {                              /* v2: плашка стоит выше нижних панелей, с которыми пересекается по горизонтали */
    if (!плашка || !плашка.classList.contains('ishp25-bar_on')) return;
    var vh = W.innerHeight, pr = плашка.getBoundingClientRect(), m = 0;
    ПРЕПЯТСТВИЯ.forEach(function (s) {
      var л = D.querySelectorAll(s);
      for (var i = 0; i < л.length; i++) {
        var cs = W.getComputedStyle(л[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        var r = л[i].getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0 || r.top >= vh - 1 || r.bottom < vh - 40) continue;
        if (r.left >= pr.right || r.right <= pr.left) continue;
        m = Math.max(m, vh - r.top);
      }
    });
    var b = m ? (m + 12) + 'px' : '';
    if (плашка.style.getPropertyValue('--p25-b') !== b) { if (b) плашка.style.setProperty('--p25-b', b); else плашка.style.removeProperty('--p25-b'); }
  }
  function плашкаОбн() {
    if (!ON_CMP) return;
    var n = выбор().length;
    if (!плашка) {
      плашка = mk('div', 'ishp25-bar', '<span class="ishp25-bar__th" aria-hidden="true"></span><button type="button" class="ishp25-bar__go" data-a="open">' + ICON.cmp + '<span></span></button>' +
        '<button type="button" class="ishp25-bar__clr" data-a="clear">Очистить</button>');
      плашка.setAttribute('role', 'region'); плашка.setAttribute('aria-label', 'Сравнение товаров');
      плашка.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button[data-a]') : null; if (!b) return;
        if (b.getAttribute('data-a') === 'clear') очистить();
        else if (выбор().length >= 2) открыть(); else мигнуть('Отметьте ещё хотя бы один товар');
      });
      D.body.appendChild(плашка);
      W.addEventListener('resize', подъём);
      W.addEventListener('scroll', function () { clearTimeout(подъёмТ); подъёмТ = setTimeout(подъём, 60); }, { passive: true });
      setInterval(function () { if (!D.hidden) подъём(); }, 400);
    }
    q('.ishp25-bar__go span', плашка).textContent = 'Сравнить (' + n + ')';
    var тх = q('.ishp25-bar__th', плашка); if (тх) тх.innerHTML = выбор().slice(0, 4).map(function (it) { return '<i style="' + (it.i ? 'background-image:url(\'' + esc(it.i).replace(/'/g, '%27') + '\')' : '') + '"></i>'; }).join('');   /* волна1: миниатюры выбранных */
    q('.ishp25-bar__go', плашка).setAttribute('aria-disabled', n < 2 ? 'true' : 'false');
    плашка.classList.toggle('ishp25-bar_on', n > 0 && !окно);
    подъём();
  }

  /* ══ окно сравнения ══ */
  var окно = null, толькоОтл = false, последнийФокус = null;
  function норм(v) { return v == null || v === '' ? '' : String(v).replace(/\s+/g, ' ').trim().toLowerCase(); }
  function разобрать(д) {                          /* ответ getproduct -> [[имя, значение]] */
    var о = json(д, null), сп = о && (о.characteristics || (о.product && о.product.characteristics) || (о.products && о.products[0] && о.products[0].characteristics));
    var из = [], видел = {};
    (сп || []).forEach(function (t) {
      var k = txt({ textContent: t && t.title }), v = txt({ textContent: t && t.value });
      if (!k || !v || k === 'Город' || k === 'НДС' || видел[k]) return;
      видел[k] = 1; из.push([k, v]);
    });
    return из;
  }
  function добрать(список, готово) {               /* только выбранные 2-4, по одному, с кэшем; ничего не рушит при ошибке */
    var i = 0;
    (function дальше() {
      if (i >= список.length) { готово(); return; }
      var it = список[i++];
      if (it.f) { дальше(); return; }
      var кэш = json(ssGet(K_FULL + it.u), null);
      if (кэш && кэш.length) { it.f = кэш; дальше(); return; }
      var x = new XMLHttpRequest(), done = false;
      function конец(ok, d) {
        if (done) return; done = true;
        if (ok) { var p = разобрать(d); if (p.length) { it.f = p; ssSet(K_FULL + it.u, JSON.stringify(p)); } }
        дальше();
      }
      try {
        x.open('GET', 'https://store.tildaapi.pro/api/getproduct/?productuid=' + encodeURIComponent(it.u), true);
        x.timeout = 6000;
        x.onload = function () { конец(x.status >= 200 && x.status < 300, x.responseText); };
        x.onerror = x.ontimeout = function () { конец(false); };
        x.send();
      } catch (e) { конец(false); }
    })();
  }
  function пары(it) { return it.f && it.f.length ? it.f : it.c; }
  function строкиСравнения(s) {
    var имена = [], вид = {};
    s.forEach(function (it) { it.c.forEach(function (p) { if (!вид[p[0]]) { вид[p[0]] = 1; имена.push(p[0]); } }); });
    s.forEach(function (it) { пары(it).forEach(function (p) { if (!вид[p[0]]) { вид[p[0]] = 1; имена.push(p[0]); } }); });
    return имена.map(function (k) {
      var зн = s.map(function (it) { var v = ''; пары(it).forEach(function (p) { if (p[0] === k && !v) v = p[1]; }); return v; });
      var нз = зн.map(норм), разн = нз.some(function (v) { return v !== нз[0]; });
      return { k: k, v: зн, d: разн };
    });
  }
  function кнопкаТовара(it) {
    var k = родная(it.u);
    return k ? '<button type="button" class="ishp25-buy" data-buy="' + esc(it.u) + '">' + ICON.cart + '<span>В корзину</span></button>'
             : '<a class="ishp25-buy ishp25-buy_link" href="' + esc(it.l) + '">' + ICON.cart + '<span>Открыть товар</span></a>';
  }
  function рисоватьОкно() {
    if (!окно) return;
    var s = выбор();
    if (s.length < 2) { закрыть(); return; }
    var строки = строкиСравнения(s), видно = строки.filter(function (r) { return !толькоОтл || r.d; });
    var h = '<thead><tr><th class="ishp25-ct__c0" scope="col"><span>Модель</span></th>';
    s.forEach(function (it) {
      h += '<th scope="col" class="ishp25-ct__p"><button type="button" class="ishp25-ct__rm" data-rm="' + esc(it.u) + '" aria-label="Убрать из сравнения: ' + esc(it.n) + '">' + ICON.x + '</button>' +
        (it.i ? '<span class="ishp25-ct__img" style="background-image:url(\'' + esc(it.i).replace(/'/g, '%27') + '\')"></span>' : '<span class="ishp25-ct__img"></span>') +
        '<a class="ishp25-ct__n" href="' + esc(it.l) + '">' + esc(it.n) + '</a>' +
        (it.a ? '<span class="ishp25-ct__sku">' + esc(it.a) + '</span>' : '') +
        '<b class="ishp25-ct__price">' + money(it.p) + '</b>' + кнопкаТовара(it) + '</th>';
    });
    h += '</tr></thead><tbody>';
    видно.forEach(function (r) {
      h += '<tr class="' + (r.d ? 'ishp25-d' : '') + '"><th scope="row">' + esc(r.k) + '</th>';
      r.v.forEach(function (v) { h += '<td' + (r.d ? ' class="ishp25-d"' : '') + '>' + (v ? esc(v) : '<span class="ishp25-nil">нет данных</span>') + '</td>'; });
      h += '</tr>';
    });
    if (!видно.length) h += '<tr><td colspan="' + (s.length + 1) + '" class="ishp25-same">Отличий нет: все характеристики совпадают</td></tr>';
    h += '</tbody>';
    q('.ishp25-ct', окно).innerHTML = h;
    q('.ishp25-ct', окно).style.setProperty('--n', s.length);
    q('.ishp25-hd small', окно).textContent = s.length + ' из ' + MAX + (строки.some(function (r) { return r.d; }) ? ' · отличий: ' + строки.filter(function (r) { return r.d; }).length : ' · отличий нет');
    var од = q('[data-a=diff]', окно); од.setAttribute('aria-pressed', толькоОтл ? 'true' : 'false'); од.textContent = толькоОтл ? 'Показать все' : 'Только отличия';
    var не = s.some(function (it) { return !(it.f && it.f.length); });
    q('.ishp25-note', окно).hidden = !не;
  }
  function открыть() {
    if (окно || выбор().length < 2) return;
    последнийФокус = D.activeElement;
    окно = mk('div', 'ishp25-ov', '<div class="ishp25-win" role="dialog" aria-modal="true" aria-label="Сравнение моделей" tabindex="-1">' +
      '<div class="ishp25-hd"><h2>Сравнение<small></small></h2><div class="ishp25-hd__t">' +
      '<button type="button" class="ishp25-btn" data-a="diff" aria-pressed="false">Только отличия</button>' +
      '<button type="button" class="ishp25-btn" data-a="clear">Очистить</button>' +
      '<button type="button" class="ishp25-x" data-a="close" aria-label="Закрыть сравнение">' + ICON.x + '</button></div></div>' +
      '<p class="ishp25-note" hidden>Показаны основные характеристики из карточек: полный список загрузить не удалось.</p>' +
      '<div class="ishp25-scr"><table class="ishp25-ct"></table></div></div>');
    окно.addEventListener('click', function (e) {
      var t = e.target;
      if (t === окно) { закрыть(); return; }
      var b = t.closest ? t.closest('[data-a],[data-rm],[data-buy]') : null; if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'close') закрыть();
      else if (a === 'clear') { очистить(); закрыть(); }
      else if (a === 'diff') { толькоОтл = !толькоОтл; рисоватьОкно(); }
      else if (b.hasAttribute('data-rm')) { var u = b.getAttribute('data-rm'), s = выбор(), i = ищи(u); if (i > -1) { s.splice(i, 1); писать(s); обновить(); } }
      else if (b.hasAttribute('data-buy')) купитьИз(b);
    });
    D.body.appendChild(окно); H.classList.add('ishp25-lock');
    if (плашка) плашка.classList.remove('ishp25-bar_on');
    рисоватьОкно();
    var w = q('.ishp25-win', окно); if (w) w.focus();
    var рабочий = выбор();
    добрать(рабочий, function () {
      var тек = выбор();                           /* полные данные кладём в сохранённый выбор по uid (пока окно жило, выбор мог измениться) */
      тек.forEach(function (it) { рабочий.forEach(function (r) { if (r.u === it.u && r.f) it.f = r.f; }); });
      if (тек.length) писать(тек);
      if (окно) рисоватьОкно();
    });
  }
  function закрыть() {
    if (!окно) return;
    окно.parentNode && окно.parentNode.removeChild(окно); окно = null; H.classList.remove('ishp25-lock');
    плашкаОбн();
    try { if (последнийФокус && последнийФокус.focus) последнийФокус.focus(); } catch (e) {}
  }
  function купитьИз(b) {                           /* родная кнопка: тот же обработчик, что у карточки */
    var k = родная(b.getAttribute('data-buy'));
    if (!k) { мигнуть('Откройте товар, чтобы добавить его в корзину'); return; }
    k.click();
    [400, 1200, 2600].forEach(function (ms) { setTimeout(синхрКорзины, ms); });
  }
  function синхрКорзины() {
    qa('.ishp25-buy[data-buy]').forEach(function (b) {
      var k = родная(b.getAttribute('data-buy')), в = !!(k && /\bishk-in\b/.test(k.className)), s = q('span', b);
      b.classList.toggle('ishp25-buy_in', в); if (s) s.textContent = в ? 'В корзине' : 'В корзину';
    });
  }
  D.addEventListener('keydown', function (e) {
    if (!окно) return;
    if (e.key === 'Escape') { e.preventDefault(); закрыть(); return; }
    if (e.key === 'Tab') {                         /* фокус остаётся внутри окна */
      var f = qa('button,a[href],input,[tabindex="0"]', окно).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      var a = D.activeElement, p = f[0], l = f[f.length - 1];
      if (!окно.contains(a)) { e.preventDefault(); p.focus(); }
      else if (e.shiftKey && (a === p || a === q('.ishp25-win', окно))) { e.preventDefault(); l.focus(); }
      else if (!e.shiftKey && a === l) { e.preventDefault(); p.focus(); }
    }
  }, true);

  /* ══ карточка товара: «Добавить к сравнению» (рядом с кнопками, П10 не трогаем) ══ */
  function снятьСоСтраницы() {
    var корень = q('.t-store__prod-popup [data-product-uid]') || q('.js-store-product[data-product-uid]') || q('[data-product-uid]');
    if (!корень) return null;
    var пары2 = [], видел = {};
    qa('.js-store-prod-all-charcs p, .js-store-prod-all-charcs div').forEach(function (p) {
      var т = txt(p), k = т.indexOf(':'); if (k < 1) return;
      var n = т.slice(0, k).trim(), v = т.slice(k + 1).trim();
      if (!n || !v || n === 'Город' || n === 'НДС' || видел[n]) return; видел[n] = 1; пары2.push([n, v]);
    });
    var цена = q('.ishpg3-panel .js-store-prod-price-val') || q('.js-store-prod-price-val'), og = q('meta[property="og:image"]');
    var им = q('.t-store__prod-popup__info .js-store-prod-name') || q('.js-store-prod-name') || q('h1');
    return { u: корень.getAttribute('data-product-uid'), n: txt(им), p: parseFloat(txt(цена).replace(/[^\d.]/g, '')) || 0,
      l: location.pathname, i: og ? og.getAttribute('content') : '', a: txt(q('.js-store-prod-sku')).replace(/^Артикул:?\s*/i, ''),
      c: пары2.slice(0, 5), f: пары2.length > 5 ? пары2 : null };
  }
  function кнопкаКарточки() {
    if (!ON_CMP || !ЭТО_КАРТОЧКА) return true;
    var main = q('.ishpg-add'), buy = q('.ishpg-buy');
    if (!(H.classList.contains('ishpg-on') && main && buy)) return false;
    var сн = снятьСоСтраницы(); if (!сн || !сн.u || !сн.n) return false;
    var б = q('.ishp25-addcmp');
    if (!б) {
      б = mk('button', 'ishp25-addcmp', ICON.cmp + '<span></span>'); б.type = 'button';
      var после = q('.ishp10-kp') || buy;
      после.parentNode.insertBefore(б, после.nextSibling);
      б.addEventListener('click', function () {
        var текущий = снятьСоСтраницы(); if (!текущий) return;
        var в = ищи(текущий.u) > -1;
        if (!переключить(текущий, !в)) мигнуть('Можно сравнить не больше ' + MAX + ' товаров');
      });
    }
    var в = ищи(сн.u) > -1;
    q('span', б).textContent = в ? 'В сравнении · убрать' : 'Добавить к сравнению';
    б.classList.toggle('ishp25-addcmp_on', в); б.setAttribute('aria-pressed', в ? 'true' : 'false');
    return true;
  }

  /* ══ К21: таблица ══ */
  var таб = null, обёртка = null, видТаб = false, сорт = { k: '', d: 1 }, поиск = '', подпись = '', колонкиКэш = null;
  function чис(v) {
    var s = String(v == null ? '' : v).replace(/ /g, ' ').replace(/(\d)\s(?=\d{3}(\D|$))/g, '$1');
    var m = /(\d+(?:[.,]\d+)?)\s*(ТБ|TB|ГБ|GB|МБ|MB|КБ|KB|ГГц|GHz|МГц|MHz)?/i.exec(s); if (!m) return NaN;
    var n = parseFloat(m[1].replace(',', '.')), u = (m[2] || '').toLowerCase();
    if (u === 'тб' || u === 'tb' || u === 'ггц' || u === 'ghz') n *= 1000; else if (u === 'мб' || u === 'mb' || u === 'кб' || u === 'kb') n *= (u === 'кб' || u === 'kb') ? 0.000001 : 0.001;
    return n;
  }
  function данныеТаблицы() {
    var ср = карточки().map(function (c) { var d = снять(c); d.c2 = {}; d.c.forEach(function (p) { if (!(p[0] in d.c2)) d.c2[p[0]] = p[1]; }); d.el = c; return d; });
    var N = ср.length, cnt = {}, ord = [];
    ср.forEach(function (d) { d.c.forEach(function (p) { if (!cnt[p[0]]) { cnt[p[0]] = 0; ord.push(p[0]); } cnt[p[0]]++; }); });
    var порог = Math.max(1, Math.ceil(N * 0.3)), pref = ТАБЛИЦЫ[SEC], cols = [];
    if (pref) cols = pref.filter(function (n) { return cnt[n] >= порог; });
    if (cols.length < 2) {
      cols = ord.slice().sort(function (a, b) { return cnt[b] - cnt[a] || ord.indexOf(a) - ord.indexOf(b); }).filter(function (n) { return cnt[n] >= порог; }).slice(0, 4);
    }
    return { rows: ср, cols: cols.slice(0, 5) };
  }
  function подписьДанных(Д) { return Д.rows.map(function (d) { return d.u + ':' + d.p + ':' + d.n.length + ':' + d.c.length; }).join('|') + '#' + Д.cols.join(','); }
  function рисоватьТаблицу() {
    if (!таб || !видТаб) return;
    var Д = данныеТаблицы(), п = подписьДанных(Д);
    if (п !== подпись) {
      подпись = п;
      var h = '<tr><th scope="col" data-k="__n" class="ishp25-tb__name"><button type="button">Товар<i></i></button></th>';
      Д.cols.forEach(function (k, j) { h += '<th scope="col" data-k="' + esc(k) + '"><button type="button">' + esc(k) + '<i></i></button></th>'; });
      h += '<th scope="col" data-k="__p" class="ishp25-tb__num"><button type="button">Цена<i></i></button></th><th scope="col" class="ishp25-tb__act"><span class="ishp25-vh">Корзина</span></th></tr>';
      q('thead', таб).innerHTML = h;
      колонкиКэш = Д;
    }
    var строки = Д.rows.filter(function (d) {
      if (!поиск) return true;
      var s = (d.n + ' ' + d.a + ' ' + d.c.map(function (p) { return p[1]; }).join(' ')).toLowerCase();
      return поиск.split(/\s+/).every(function (w) { return s.indexOf(w) > -1; });
    });
    if (сорт.k) {
      var ч = строки.filter(function (d) { return !isNaN(сорт.k === '__p' ? d.p : чис(d.c2[сорт.k])); }).length;
      var число = сорт.k === '__p' || (сорт.k !== '__n' && ч >= строки.length * 0.7);
      строки = строки.slice().sort(function (a, b) {
        var x, y;
        if (сорт.k === '__p') { x = a.p || Infinity * сорт.d; y = b.p || Infinity * сорт.d; }
        else if (сорт.k === '__n') { return a.n.localeCompare(b.n, 'ru') * сорт.d; }
        else if (число) { x = чис(a.c2[сорт.k]); y = чис(b.c2[сорт.k]); if (isNaN(x)) x = Infinity * сорт.d; if (isNaN(y)) y = Infinity * сорт.d; }
        else { return String(a.c2[сорт.k] || '').localeCompare(String(b.c2[сорт.k] || ''), 'ru', { numeric: true }) * сорт.d; }
        return x === y ? 0 : (x < y ? -1 : 1) * сорт.d;
      });
    }
    var b = '';
    строки.forEach(function (d) {
      b += '<tr><th scope="row" class="ishp25-tb__name"><a href="' + esc(d.l) + '"><span class="ishp25-tb__img"' + (d.i ? ' style="background-image:url(\'' + esc(d.i).replace(/'/g, '%27') + '\')"' : '') + '></span>' +
        '<span class="ishp25-tb__t"><b>' + esc(d.n) + '</b>' + (d.a ? '<small>' + esc(d.a) + '</small>' : '') + '</span></a></th>';
      Д.cols.forEach(function (k) { b += '<td>' + (d.c2[k] ? esc(d.c2[k]) : '<span class="ishp25-nil">—</span>') + '</td>'; });
      b += '<td class="ishp25-tb__num"><b>' + (d.p > 0 ? esc(money(d.p)) : '<span class="ishp25-nil">по запросу</span>') + '</b></td>' +
        '<td class="ishp25-tb__act">' + (q('a.ish13-buy', d.el) ? '<button type="button" class="ishp25-buy" data-buy="' + esc(d.u) + '">' + ICON.cart + '<span>В корзину</span></button>' :
        '<a class="ishp25-buy ishp25-buy_link" href="' + esc(d.l) + '"><span>Открыть</span></a>') + '</td></tr>';
    });
    if (!строки.length) b = '<tr><td colspan="' + (Д.cols.length + 3) + '" class="ishp25-same">Ничего не найдено</td></tr>';
    q('tbody', таб).innerHTML = b;
    qa('th[data-k]', таб).forEach(function (th) {
      var on = th.getAttribute('data-k') === сорт.k;
      th.setAttribute('aria-sort', on ? (сорт.d > 0 ? 'ascending' : 'descending') : 'none');
      q('i', th).textContent = on ? (сорт.d > 0 ? '▲' : '▼') : '';
    });
    q('.ishp25-tb__cnt', обёртка).textContent = 'Показано ' + строки.length + ' из ' + Д.rows.length;
    синхрКорзины();
  }
  function собратьТаблицу() {
    if (таб) return;
    var wrap = mk('div', 'ishp25-tb', '<div class="ishp25-tb__bar"><input type="search" class="ishp25-tb__q" placeholder="Поиск по таблице, например 512 или NVMe" aria-label="Поиск по таблице"><span class="ishp25-tb__cnt" role="status"></span></div>' +
      '<div class="ishp25-tb__scr" tabindex="0" role="region" aria-label="Таблица товаров раздела"><table class="ishp25-tbl"><thead></thead><tbody></tbody></table></div>');
    wrap.hidden = true;
    таб = q('table', wrap); обёртка = wrap;
    function подушка() {                         /* v3: отступ снизу = высота нижней панели телефона */
      var vh = W.innerHeight, m = 0;
      ['.таб', '.нш-мт'].forEach(function (s) {
        var l = D.querySelectorAll(s);
        for (var i = 0; i < l.length; i++) {
          var cs = W.getComputedStyle(l[i]);
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position !== 'fixed') continue;
          var r = l[i].getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0 || r.top >= vh - 1 || r.bottom < vh - 40) continue;
          m = Math.max(m, vh - r.top);
        }
      });
      wrap.style.marginBottom = m ? (m + 16) + 'px' : '';
    }
    подушка(); W.addEventListener('resize', подушка); W.addEventListener('orientationchange', подушка); setTimeout(подушка, 600);
    q('.ishp25-tb__q', wrap).addEventListener('input', function (e) { поиск = norm2(e.target.value); рисоватьТаблицу(); });
    wrap.addEventListener('click', function (e) {
      var th = e.target.closest ? e.target.closest('th[data-k]') : null;
      if (th) { var k = th.getAttribute('data-k'); if (сорт.k === k) сорт.d = -сорт.d; else { сорт.k = k; сорт.d = 1; } рисоватьТаблицу(); return; }
      var b = e.target.closest ? e.target.closest('button[data-buy]') : null;
      if (b) купитьИз(b);
    });
  }
  function norm2(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function выключитьТаблицу() { видТаб = false; H.classList.remove('ishp25-on'); if (обёртка) обёртка.hidden = true; кнопкиВида(); }
  function включитьТаблицу(сохр) {
    if (!(SEC in ТАБЛИЦЫ)) return;
    собратьТаблицу();
    var сп = карточки()[0];
    if (!сп) return;
    var список = сп.parentNode, w = обёртка;
    if (w.parentNode !== список.parentNode || w.previousSibling !== список) список.parentNode.insertBefore(w, список.nextSibling);   /* после списка: П6 держит свой переключатель прямо перед списком */
    w.hidden = false; видТаб = true; H.classList.add('ishp25-on'); подпись = '';
    рисоватьТаблицу(); кнопкиВида();
    if (сохр) { var v = json(lsGet(K_VIEW), {}); v[SEC] = 'table'; lsSet(K_VIEW, JSON.stringify(v)); }
  }
  function забытьВыбор() { var v = json(lsGet(K_VIEW), {}); if (SEC in v) { delete v[SEC]; lsSet(K_VIEW, JSON.stringify(v)); } }
  function кнопкиВида() {
    var к = q('.ishp25-vbtn'); if (!к) return;
    к.setAttribute('aria-pressed', видТаб ? 'true' : 'false');
    H.classList.toggle('ishp25-on', видТаб);
  }
  var начальноПрименено = false, T0 = Date.now();
  function переключательТаблицы() {
    if (!ON_TBL) return;
    var есть = (SEC in ТАБЛИЦЫ) && карточки().some(function (c) { return c.hasAttribute('data-ish13'); });
    var к = q('.ishp25-vbtn');
    if (!есть) { if (к && к.parentNode) к.parentNode.removeChild(к); var о = q('.ishp25-own'); if (о && о.parentNode) о.parentNode.removeChild(о); if (видТаб) выключитьТаблицу(); return; }
    var сег = q('.ishd-view .ishd-seg');
    if (!к) {
      к = mk('button', 'ishp25-vbtn', ICON.tbl + 'Таблица'); к.type = 'button'; к.setAttribute('data-v25', 'table'); к.setAttribute('aria-pressed', 'false');
      к.addEventListener('click', function (e) { e.stopPropagation(); if (видТаб) return; включитьТаблицу(true); });
    }
    if (сег) {
      var св = q('.ishp25-own'); if (св && св.parentNode) св.parentNode.removeChild(св);
      if (к.parentNode !== сег) сег.appendChild(к);
      if (!сег.__p25) {                            /* список/плитка выключают таблицу; родной обработчик П6 остаётся как был */
        сег.__p25 = 1;
        сег.addEventListener('click', function (e) {
          var b = e.target.closest ? e.target.closest('button[data-v]') : null;
          if (b && видТаб) { выключитьТаблицу(); }
          if (b) забытьВыбор();
        }, true);
      }
    } else if (!q('.ishp25-own') && !q('.ishd-view') && Date.now() - T0 > 6000) {   /* П6 не пришёл за 6 с: свой переключатель рядом со списком */
      var сп = карточки()[0]; if (!сп) return;
      var б = mk('div', 'ishp25-own', '<span class="ishp25-own__l">Вид</span><div class="ishp25-own__seg" role="group" aria-label="Вид товаров"><button type="button" data-o="list" aria-pressed="true">' + ICON.list + 'Список</button></div>');
      q('.ishp25-own__seg', б).appendChild(к);
      q('[data-o=list]', б).addEventListener('click', function () { if (видТаб) выключитьТаблицу(); забытьВыбор(); q('[data-o=list]', б).setAttribute('aria-pressed', 'true'); });
      var список = сп.parentNode; список.parentNode.insertBefore(б, список);
    }
    if (!начальноПрименено) {                      /* по умолчанию список; таблица только по явному выбору покупателя */
      начальноПрименено = true;
      if (json(lsGet(K_VIEW), {})[SEC] === 'table') включитьТаблицу(false);
    }
    кнопкиВида();
  }

  /* ══ обновление всего ══ */
  var т = 0, наблюдатель = null;
  function обновить() {
    step('чекбоксы', чекбоксы); step('плашка', плашкаОбн); step('карточка', кнопкаКарточки);
    if (окно) step('окно', рисоватьОкно);
  }
  function цикл() {
    step('чекбоксы', чекбоксы); step('плашка', плашкаОбн);
    step('переключатель', переключательТаблицы);
    if (видТаб) step('таблица', рисоватьТаблицу);
  }
  function позже() { clearTimeout(т); т = setTimeout(цикл, 120); }

  function старт() {
    if (!ЭТО_КАРТОЧКА) {
      until(function () {
        if (!q('.t-store__card[data-ish13], .вн-т[data-product-uid]')) return false;
        цикл();
        var с = карточки()[0], список = document.getElementById('вн-гр-список') || (с && с.parentNode);
        if (список && W.MutationObserver && !наблюдатель) {
          наблюдатель = new MutationObserver(позже); наблюдатель.observe(список, { childList: true, subtree: true });
        }
        /* П6 мог дорисовать переключатель позже нас */
        [600, 1800, 4000, 6500].forEach(function (ms) { setTimeout(позже, ms); });
        return true;
      }, 100, 250);
    } else if (ON_CMP) {
      until(function () { return кнопкаКарточки(); }, 80, 250);
      [1500, 4000].forEach(function (ms) { setTimeout(function () { step('карточка', кнопкаКарточки); }, ms); });
      плашкаОбн();
    }
    W.addEventListener('storage', function (e) { if (e.key === K_CMP) { обновить(); } });
  }
  W.ISH_P25_API = { открыть: открыть, закрыть: закрыть, версия: 'ishp25-1610' };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', старт); else старт();
})();
