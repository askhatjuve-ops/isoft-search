/*
 * Поиск расширенного каталога iSoft (/assortiment), 14.10.2026. Один файл, без зависимостей.
 * Грузится ТОЛЬКО на странице /assortiment (маленький загрузчик в T123 страницы). Движок — тот же, что на основном сайте
 * (createSearch из ish-search.js): опечатки, раскладка, партномер, единицы (16гб, 27 дюймов), синонимы.
 *
 * Как встраивается (код приложения каталога в Tilda НЕ меняется):
 *   приложение живёт в iframe#isoft-catalog-frame (srcdoc, тот же origin) и держит все 14 тыс. позиций в PRODUCTS.
 *   Мы из родительской страницы подменяем в окне приложения ровно три функции — renderCatalog (обёртка), filteredProducts (источник
 *   строк) — и дорисовываем: подсказки под строкой поиска, цену от–до, наличие, «Показать ещё», счётчики разделов по найденному.
 *   Строки таблицы, «В запрос» (корзина запроса), «Карточка на сайте» рисует и обрабатывает прежний код приложения.
 *
 * Страхи и откаты:
 *   - не загрузился движок / что-то бросило до активации — страница остаётся с прежним поиском (подстрока), ничего не подменено;
 *   - индекс не загрузился или устарел против данных страницы (сверка построчно) — индекс строится тут же из PRODUCTS страницы;
 *   - исключение в нашем коде при рендере — слой выключается сам, прежний поиск возвращается (restore());
 *   - выключатель: ?ishassort=0 в адресе, либо MODE = 'off' в этом файле (хостинг), либо localStorage 'ishassort'='0'.
 *   - окно ручного режима: ?ishassort=1 включает при MODE = 'flag'.
 *
 * Публичное: window.ISHAssort = { start(), state(), version, restore() }.
 */
(function (root) {
  'use strict';
  if (root.ISHAssort) return;
  var VERSION = '1';
  var MODE = 'on';                 // 'on' — всем; 'flag' — только с ?ishassort=1; 'off' — выключено
  var STEP = 25;
  var FRAME_ID = 'isoft-catalog-frame';
  var DEFAULT_BASE = 'https://askhatjuve-ops.github.io/isoft-search';
  var BASE = DEFAULT_BASE;
  try {
    var cs = document.currentScript;
    if (cs && cs.src) BASE = cs.src.replace(/[?#].*$/, '').replace(/\/[^\/]*$/, '');
  } catch (e) {}

  var A = null;                    // состояние слоя после активации
  var started = false;

  function param(name) { try { return new URL(root.location.href).searchParams.get(name); } catch (e) { return null; } }
  function enabled() {
    if (param('ishassort') === '0') return false;
    try { if (root.localStorage && root.localStorage.getItem('ishassort') === '0') return false; } catch (e) {}
    if (MODE === 'off') return false;
    try { if (root.ISHSearch && typeof root.ISHSearch.enabled === 'function' && !root.ISHSearch.enabled()) return false; } catch (e) {}   // полный ish-search.js уже на странице и слой поиска выключен — общий выключатель
    if (MODE === 'flag') return param('ishassort') === '1';
    return true;
  }
  function log() { try { root.console && console.warn.apply(console, ['[ish-assort]'].concat([].slice.call(arguments))); } catch (e) {} }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function compact(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, ''); }
  function num(v) { v = String(v == null ? '' : v).replace(/\s+/g, '').replace(',', '.'); if (v === '') return null; var n = parseFloat(v); return isFinite(n) && n >= 0 ? n : null; }
  function plural(n, a, b, c) { var m = n % 100, k = n % 10; return (m > 10 && m < 15) ? c : k === 1 ? a : (k > 1 && k < 5) ? b : c; }
  function fmt(n) { return new Intl.NumberFormat('ru-RU').format(n); }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.async = true; s.src = src;
      s.onload = function () { res(); }; s.onerror = function () { rej(new Error('не загрузился ' + src)); };
      document.head.appendChild(s);
    });
  }
  function fetchJson(url, ms) {
    return new Promise(function (res, rej) {
      var done = false, t = setTimeout(function () { if (!done) { done = true; rej(new Error('таймаут ' + url)); } }, ms || 15000);
      fetch(url, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) { if (!done) { done = true; clearTimeout(t); res(j); } })
        .catch(function (e) { if (!done) { done = true; clearTimeout(t); rej(e); } });
    });
  }
  function engineFactory() { return root.createSearch || (root.ISHSearch && root.ISHSearch.createSearch) || null; }
  // движок: уже на странице (createSearch) -> лёгкая копия search.js рядом с индексом (ish-assort-core.js) -> полный ish-search.js основного сайта
  function loadEngine() {
    if (engineFactory()) return Promise.resolve(engineFactory());
    return loadScript(BASE + '/ish-core.js?v=' + VERSION).catch(function (e) {   // ish-core.js — ядро основного поиска (линия поиска, одна сборка с ish-search.js)
      log('лёгкий движок не загрузился, беру ish-search.js:', e.message);
      return loadScript(BASE + '/ish-search.js?v=' + VERSION);
    }).then(function () {
      var f = engineFactory(); if (!f) throw new Error('нет createSearch'); return f;
    });
  }

  // ---------- индекс из данных самой страницы (запасной путь и сверка) ----------
  function indexFromProducts(W, prods) {
    var groups = {}; try { groups = W.eval('CATEGORY_GROUPS'); } catch (e) {}
    var gnames = Object.keys(groups), gof = {};
    gnames.forEach(function (g, gi) { groups[g].forEach(function (c) { gof[c] = gi; }); });
    var other = gnames.length, hasOther = false;
    var bset = {}, cset = {};
    prods.forEach(function (p) { bset[p.brand] = 1; cset[p.category] = 1; });
    var B = Object.keys(bset).sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; });
    var C = Object.keys(cset).sort(function (a, b) { var ga = gof[a] == null ? other : gof[a], gb = gof[b] == null ? other : gof[b]; return ga - gb || (a < b ? -1 : 1); });
    var bi = {}, ci = {}; B.forEach(function (b, i) { bi[b] = i; }); C.forEach(function (c, i) { ci[c] = i; if (gof[c] == null) hasOther = true; });
    var G = gnames.slice(); if (hasOther) G.push('Прочее');
    var P = prods.map(function (p) {
      var art = compact(p.article), pn = art.length >= 4 && compact(p.name).indexOf(art) < 0 ? art : '';
      return [p.name, bi[p.brand], ci[p.category], p.price, p.on_site ? 1 : 0, '', pn, '', '', 0, 0];
    });
    return { v: 2, G: G, B: B, C: C.map(function (c) { return [c, gof[c] == null ? other : gof[c], '', '']; }), P: P, Q: [], U: '', S: [], T: { u: 'page', n: P.length, site: 0 } };
  }
  function aligned(idx, prods) {
    if (!idx || !idx.P || !idx.B || !idx.C || idx.P.length !== prods.length) return false;
    for (var i = 0; i < prods.length; i++) {
      var r = idx.P[i], p = prods[i];
      if (r[0] !== p.name || idx.B[r[1]] !== p.brand || !idx.C[r[2]] || idx.C[r[2]][0] !== p.category || r[3] !== p.price) return false;
    }
    return true;
  }

  // ---------- оформление (внутри iframe) ----------
  var CSS = [
    '.search-panel{position:relative}',
    'mark{background:#FFE9A8;color:inherit;border-radius:3px;padding:0 1px}',
    '.ia-price{display:inline-flex;gap:6px;align-items:center}',
    '.ia-price input{width:118px;min-height:40px;border:1px solid var(--line);border-radius:9px;background:var(--paper);padding:0 10px;color:var(--text)}',
    '.ia-price input:focus,.filter-row select:focus{outline:2px solid var(--blue2);border-color:var(--blue)}',
    '.ia-reset{min-height:40px;border:0;background:transparent;color:var(--blue);padding:0 6px;font-size:13px}',
    '.ia-reset[hidden]{display:none}',
    '.ia-note{padding:2px 4px 8px;font-size:12px;color:var(--muted)}',
    '.ia-note:empty{display:none}',
    '.pagination:has(.ia-more){flex-direction:column;align-items:stretch}.pages:has(.ia-more){width:100%;justify-content:center}',
    '.ia-lbl{font-size:12px;color:var(--muted);white-space:nowrap}',
    '.ia-more{display:block;white-space:nowrap;margin:6px auto;min-height:44px;padding:0 26px;border:1px solid var(--blue);border-radius:10px;background:var(--paper);color:var(--blue);font-weight:600}',
    '.ia-more:hover{background:var(--blue2)}',
    '.ia-dd{position:absolute;left:13px;right:13px;top:70px;z-index:30;background:var(--paper);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);max-height:min(70vh,520px);overflow:auto;padding:6px}',
    '.ia-dd[hidden]{display:none}',
    '.ia-h{padding:8px 10px 4px;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}',
    '.ia-fix{padding:8px 10px;font-size:12px;color:var(--muted)}',
    '.ia-i{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--text)}',
    '.ia-i:hover,.ia-i[aria-selected=true]{background:var(--blue2)}',
    '.ia-i b{color:var(--muted);font-weight:500;font-size:12px;white-space:nowrap}',
    '.ia-i .ia-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ia-i .ia-p{white-space:nowrap;font-weight:600}',
    '.ia-sug{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;justify-content:center}',
    '.ia-sug button{border:1px solid var(--line);border-radius:999px;background:var(--paper);padding:6px 12px;color:var(--blue)}',
    '.category.ia-zero{opacity:.45}',
    '.search-panel{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px}',
    '.search-panel .main-search{flex:1 1 100%;min-width:0;width:auto}',
    '.search-panel .filter-row{display:flex;flex:1 1 100%;flex-wrap:wrap;align-items:center;gap:8px;margin:0;min-width:0}',
    '.search-panel .filter-row select{width:auto;flex:1 1 140px;min-width:0;min-height:40px;font-size:13px}',
    '.search-panel .filter-row .ia-price{flex:1.6 1 270px;min-width:0}',
    '.ia-price .ia-lbl{flex:none}',
    '.ia-price input{flex:1 1 0;min-width:0;width:auto;font-size:13px}',
    '.search-panel #downloadCatalogXlsx{flex:0 0 auto;margin-left:auto;min-height:40px;padding:0 20px;border:0;border-radius:10px;background:var(--blue);color:#fff;font-size:14px;font-weight:700;white-space:nowrap;cursor:pointer}',
    '.search-panel #downloadCatalogXlsx:hover{background:var(--blue);color:#fff;filter:brightness(1.12)}',
    '@media(max-width:680px){.search-panel .filter-row select{flex:1 1 45%}.search-panel .filter-row .ia-price{flex:1 1 100%}.search-panel #downloadCatalogXlsx{flex:1 1 100%;min-height:44px;margin-left:0}}',
    '@media(max-width:680px){.ia-price{display:flex;width:100%}.ia-price input{flex:1;min-width:0;width:auto}.ia-dd{left:8px;right:8px}}'
  ].join('\n');

  // ---------- ядро ----------
  function Layer(W, S, idx, built) {
    var D = W.document, st = W.eval('state');
    var prods = W.eval('PRODUCTS'), ct = W.eval('CATEGORY_TOTALS'), gt = W.eval('GROUP_TOTALS'), gi = W.eval('GROUP_ITEMS');
    var byId = new Map(); prods.forEach(function (p) { byId.set(p.id, p); });
    var me = {
      W: W, D: D, S: S, idx: idx, built: built, st: st, prods: prods, byId: byId, last: null, rows: null, hl: new Map(),
      pmin: null, pmax: null, origTotals: null, active: true, gi: gi,
      origRender: W.renderCatalog, origFiltered: W.filteredProducts, errors: 0
    };
    me.origTotals = { ct: JSON.parse(JSON.stringify(ct)), gt: JSON.parse(JSON.stringify(gt)) };
    var allBrands = null;

    function cats() {
      if (st.category === 'Все товары') return null;
      var g = gi[st.category]; return g ? g.slice() : [st.category];
    }
    function ownFilter(cs) {
      var set = cs ? new Set(cs) : null, b = st.brand, s = st.status, pm = me.pmin, px = me.pmax;
      var rows = prods.filter(function (p) {
        return (!set || set.has(p.category)) && (!b || p.brand === b) && (!s || (s === 'site' ? p.on_site : !p.on_site)) &&
          (pm == null || p.price >= pm) && (px == null || p.price <= px);
      });
      rows.sort(function (a, c) {
        return st.sort === 'priceAsc' ? a.price - c.price : st.sort === 'priceDesc' ? c.price - a.price : a.name.localeCompare(c.name, 'ru');
      });
      return rows;
    }
    function compute() {
      var q = String(st.query || '').trim(), cs = cats(), res = null, rows;
      me.hl = new Map();
      if (q) {
        var need = st.status === 'order' || st.sort === 'name';
        var o = { limit: need ? 20000 : Math.max(STEP, st.pageSize || STEP), brands: st.brand ? [st.brand] : [], cats: cs || [], inStock: st.status === 'site' };
        if (me.pmin != null) o.priceMin = me.pmin;
        if (me.pmax != null) o.priceMax = me.pmax;
        if (st.sort === 'priceAsc') o.sort = 'price_asc'; else if (st.sort === 'priceDesc') o.sort = 'price_desc';
        res = S.query(q, o);
        var list = [];
        res.products.forEach(function (r) {
          var p = prods[r.i]; if (!p) return;
          list.push(p); me.hl.set(p.id, r.html);
        });
        if (st.status === 'order') list = list.filter(function (p) { return !p.on_site; });
        if (st.sort === 'name') list.sort(function (a, c) { return a.name.localeCompare(c.name, 'ru'); });
        rows = list;
        var total = need ? list.length : res.total;
        if (rows.length < total) rows.length = total;     // хвост пустой: рисуется только срез первых st.pageSize
      } else rows = ownFilter(cs);
      me.last = res; me.rows = rows;
      return res;
    }
    function applyCounts(res) {
      var key;
      if (res && res.facets) {
        var sum = 0, cc = {};
        res.facets.cats.forEach(function (c) { cc[c.name] = c.n; sum += c.n; });
        for (key in ct) if (key !== 'Все товары') ct[key] = cc[key] || 0;
        ct['Все товары'] = sum;
        Object.keys(gi).forEach(function (g) { gt[g] = gi[g].reduce(function (s, n) { return s + (ct[n] || 0); }, 0); });
      } else {
        for (key in me.origTotals.ct) ct[key] = me.origTotals.ct[key];
        for (key in me.origTotals.gt) gt[key] = me.origTotals.gt[key];
      }
    }
    me.compute = compute;

    function brandOptions(res) {
      var sel = D.getElementById('brandFilter'); if (!sel) return;
      var list;
      if (res && res.facets) list = res.facets.brands.map(function (b) { return [b.name, b.n]; });
      else {
        if (!allBrands) { var m = {}; prods.forEach(function (p) { m[p.brand] = (m[p.brand] || 0) + 1; }); allBrands = Object.keys(m).sort(function (a, b) { return a.localeCompare(b, 'ru'); }).map(function (b) { return [b, m[b]]; }); }
        list = allBrands;
      }
      var cur = st.brand;
      if (cur && !list.some(function (x) { return x[0] === cur; })) list = [[cur, 0]].concat(list);
      var sig = list.length + '|' + cur + '|' + (list[0] || [''])[0] + '|' + (list[list.length - 1] || [''])[0] + '|' + (res ? res.total : '');
      if (sel.getAttribute('data-ia') === sig) return;
      sel.setAttribute('data-ia', sig);
      sel.innerHTML = '<option value="">Все бренды</option>' + list.map(function (x) {
        return '<option value="' + esc(x[0]) + '"' + (x[0] === cur ? ' selected' : '') + '>' + esc(x[0] === '-' ? 'Без бренда' : x[0]) + (res ? ' (' + x[1] + ')' : '') + '</option>';
      }).join('');
      sel.value = cur || '';
    }

    function post(res) {
      var q = String(st.query || '').trim(), rows = me.rows || [], total = rows.length;
      D.querySelectorAll('#tableBox tr[data-id]').forEach(function (tr) {
        var id = tr.getAttribute('data-id'), p = byId.get(id); if (!p) return;
        var s = tr.querySelector('.status');
        if (s) { s.className = 'status ' + (p.on_site ? 'available' : 'order'); s.textContent = p.on_site ? 'В продаже на сайте' : 'Под заказ'; }
        var n = tr.querySelector('.product-name'), h = me.hl.get(id);
        if (n && h) n.innerHTML = h;
      });
      var pg = D.getElementById('pages');
      if (pg) pg.innerHTML = total > st.pageSize ? '<button type="button" class="ia-more" data-ia-more="1">Показать ещё ' + Math.min(STEP, total - st.pageSize) + '</button>' : '';
      var note = D.getElementById('ia-note'), h = '';
      if (res && res.corrected && res.corrected.to) h += 'Показано для «<b>' + esc(res.corrected.to) + '</b>». ';
      if (res && res.relaxed && res.relaxed.dropped && res.relaxed.dropped.length) h += 'Нет позиций со словами «' + res.relaxed.dropped.map(esc).join(' ') + '» — показано по «<b>' + res.relaxed.kept.map(esc).join(' ') + '</b>». ';
      if (note) note.innerHTML = h;
      var title = D.getElementById('resultTitle');
      if (title && q) title.textContent = 'Поиск: «' + (String(st.rawQuery || q)) + '»' + (st.category !== 'Все товары' ? ' · ' + st.category : '');
      if (!total && q) {
        var words = (res && res.fallback && res.fallback.words) || [], fc = (res && res.fallback && res.fallback.categories) || [];
        var box = D.getElementById('tableBox');
        if (box) box.innerHTML = '<div class="empty"><strong>По запросу «' + esc(q) + '» ничего не нашли</strong>' +
          (st.brand || st.status || me.pmin != null || me.pmax != null || st.category !== 'Все товары' ? 'Попробуйте снять фильтры. ' : '') +
          'Не нашли нужное? <a href="/podbor" target="_top">Пришлите список — подберём</a>.' +
          ((words.length || fc.length) ? '<div class="ia-sug">' + words.map(function (w) { return '<button type="button" data-ia-q="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') +
            fc.slice(0, 5).map(function (c) { return '<button type="button" data-ia-cat="' + esc(c.name) + '">' + esc(c.name) + '</button>'; }).join('') + '</div>' : '') + '</div>';
      }
      D.querySelectorAll('#categories [data-category]').forEach(function (b) {
        var c = b.querySelector('b'); b.classList.toggle('ia-zero', !!c && c.textContent.replace(/\s/g, '') === '0' && b.getAttribute('data-category') !== 'Все товары');
      });
      D.querySelectorAll('#categories [data-group]').forEach(function (b) {
        var c = b.querySelector('b'); b.classList.toggle('ia-zero', !!c && c.textContent.replace(/\s/g, '') === '0');
      });
      var rs = D.getElementById('ia-reset');
      if (rs) rs.hidden = !(q || st.brand || st.status || me.pmin != null || me.pmax != null || st.category !== 'Все товары' || st.sort !== 'rel');
      brandOptions(res);
    }

    W.filteredProducts = function () { return me.rows || me.origFiltered(); };
    W.renderCatalog = function () {
      if (!me.active) return me.origRender();
      var res = null;
      try { st.page = 1; res = compute(); applyCounts(res); } catch (e) { return fail(e); }
      me.origRender();
      try { post(res); } catch (e) { log('post', e); me.errors++; if (me.errors > 3) fail(e); }
    };
    function fail(e) {
      log('слой выключен, возвращён прежний поиск:', e && e.message || e);
      restore();
      return W.renderCatalog();
    }
    function restore() {
      me.active = false;
      W.renderCatalog = me.origRender; W.filteredProducts = me.origFiltered;
      applyCounts(null);
      try {
        if (me.origUI) { D.getElementById('sort').innerHTML = me.origUI.sort; D.getElementById('statusFilter').innerHTML = me.origUI.stat; D.getElementById('brandFilter').removeAttribute('data-ia'); }
        D.getElementById('sort').value = 'name'; st.sort = 'name'; st.status = ''; st.pageSize = STEP; st.brand = ''; D.getElementById('brandFilter').value = '';
        D.getElementById('search').setAttribute('placeholder', me.origUI ? me.origUI.ph : '');
      } catch (e) {}
      ['ia-price', 'ia-reset', 'ia-note', 'ia-dd', 'ia-style'].forEach(function (id) { var el = D.getElementById(id); if (el && el.parentNode) el.parentNode.removeChild(el); });
    }
    me.restore = restore;
    me.fail = fail;
    return me;
  }

  // ---------- интерфейс ----------
  function buildUI(me) {
    var W = me.W, D = me.D, st = me.st;
    var style = D.createElement('style'); style.id = 'ia-style'; style.textContent = CSS; D.head.appendChild(style);
    var input = D.getElementById('search'), panel = D.querySelector('.search-panel'), row = D.querySelector('.filter-row');
    var sort = D.getElementById('sort'), stat = D.getElementById('statusFilter');
    input.setAttribute('placeholder', 'Название, бренд или артикул — например, ноутбук asus, 9T5B2AA, ssd 512');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', 'ia-dd');
    me.origUI = { sort: sort.innerHTML, stat: stat.innerHTML, ph: input.getAttribute('placeholder') || '' };
    stat.innerHTML = '<option value="">Любое наличие</option><option value="site">В продаже на сайте</option><option value="order">Только под заказ</option>';
    stat.value = '';
    sort.insertAdjacentHTML('afterbegin', '<option value="rel">По релевантности</option>');
    sort.value = 'rel'; st.sort = 'rel'; st.pageSize = STEP;
    var price = D.createElement('span'); price.className = 'ia-price'; price.id = 'ia-price';
    price.innerHTML = '<span class="ia-lbl">Цена, ₸</span><input id="ia-p1" type="number" min="0" inputmode="numeric" placeholder="Цена от, ₸" aria-label="Цена от"><input id="ia-p2" type="number" min="0" inputmode="numeric" placeholder="до, ₸" aria-label="Цена до">';
    row.insertBefore(price, sort);
    var reset = D.createElement('button'); reset.type = 'button'; reset.className = 'ia-reset'; reset.id = 'ia-reset'; reset.hidden = true; reset.textContent = 'Сбросить всё';
    row.insertBefore(reset, row.querySelector('#downloadCatalogXlsx') || null);
    var note = D.createElement('div'); note.className = 'ia-note'; note.id = 'ia-note'; note.setAttribute('aria-live', 'polite');
    var meta = D.querySelector('.results-meta'); meta.parentNode.insertBefore(note, meta.nextSibling);
    var dd = D.createElement('div'); dd.className = 'ia-dd'; dd.id = 'ia-dd'; dd.setAttribute('role', 'listbox'); dd.hidden = true;
    panel.appendChild(dd);

    var cur = -1;
    function items() { return [].slice.call(dd.querySelectorAll('.ia-i')); }
    function close() { dd.hidden = true; cur = -1; input.setAttribute('aria-expanded', 'false'); }
    function open() { dd.hidden = false; input.setAttribute('aria-expanded', 'true'); }
    function mark(i) {
      var it = items(); it.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      cur = it.length ? (i + it.length) % it.length : -1;
      if (cur >= 0) { it[cur].setAttribute('aria-selected', 'true'); input.setAttribute('aria-activedescendant', it[cur].id); if (it[cur].scrollIntoView) it[cur].scrollIntoView({ block: 'nearest' }); }
    }
    var seq = 0;
    function renderDD() {
      var q = String(st.query || '').trim(), res = me.last, h = '', n = 0;
      function it(attrs, left, right, cls) { return '<div class="ia-i" role="option" id="ia-o' + (++n) + '" aria-selected="false" ' + attrs + '><span class="ia-t">' + left + '</span>' + (right ? '<b class="' + (cls || '') + '">' + right + '</b>' : '') + '</div>'; }
      if (q.length < 2 || !res) {
        var pop = Object.keys(me.origTotals.ct).filter(function (k) { return k !== 'Все товары'; }).sort(function (a, b) { return me.origTotals.ct[b] - me.origTotals.ct[a]; }).slice(0, 6);
        h += '<div class="ia-h">Популярные разделы</div>' + pop.map(function (c) { return it('data-ia-cat="' + esc(c) + '"', esc(c), fmt(me.origTotals.ct[c] || 0)); }).join('');
      } else {
        if (res.corrected && res.corrected.to) h += '<div class="ia-fix">Ищем «<b>' + esc(res.corrected.to) + '</b>» вместо «' + esc(q) + '»</div>';
        if (res.categories && res.categories.length) h += '<div class="ia-h">Разделы</div>' + res.categories.slice(0, 4).map(function (c) { return it('data-ia-cat="' + esc(c.name) + '"', c.html || esc(c.name), fmt(c.n)); }).join('');
        if (res.brands && res.brands.length) h += '<div class="ia-h">Бренды</div>' + res.brands.slice(0, 4).map(function (b) { return it('data-ia-brand="' + esc(b.name) + '"', b.html || esc(b.name), fmt(b.n)); }).join('');
        var rows = (me.rows || []).slice(0, 5).filter(Boolean);
        if (rows.length) h += '<div class="ia-h">Товары</div>' + rows.map(function (p) {
          return it('data-ia-prod="' + esc(p.name) + '"', me.hl.get(p.id) || esc(p.name), fmt(p.price) + ' ₸', 'ia-p');
        }).join('');
        if (!rows.length && !(res.categories && res.categories.length)) h += '<div class="ia-fix">Ничего не нашли. Попробуйте другое слово или артикул.</div>';
        else h += it('data-ia-all="1"', 'Показать все ' + fmt(me.rows ? me.rows.length : 0) + ' ' + plural(me.rows ? me.rows.length : 0, 'результат', 'результата', 'результатов'), '↵');
      }
      dd.innerHTML = h; cur = -1; open();
    }
    function render() { W.renderCatalog(); }
    function syncUrl() {
      try {
        var u = new URL(root.location.href), q = String(st.rawQuery || '').trim();
        if (q) u.searchParams.set('q', q); else u.searchParams.delete('q');
        root.history.replaceState(null, '', u.toString());
      } catch (e) {}
    }
    var urlT = 0;
    function resetPaging() { st.pageSize = STEP; st.page = 1; }

    // сброс «показать ещё» при смене условий — в фазе захвата, раньше обработчиков приложения
    D.addEventListener('input', function (e) { if (e.target.id === 'search') { st.rawQuery = e.target.value.trim(); resetPaging(); } }, true);
    D.addEventListener('change', function (e) { var id = e.target.id; if (id === 'brandFilter' || id === 'statusFilter' || id === 'sort') resetPaging(); }, true);
    D.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#categories')) resetPaging(); }, true);

    input.addEventListener('input', function () { clearTimeout(urlT); urlT = setTimeout(syncUrl, 400); renderDD(); });
    input.addEventListener('focus', function () { if (me.active) renderDD(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { if (dd.hidden) renderDD(); mark(cur + 1); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { if (!dd.hidden) { mark(cur - 1); e.preventDefault(); } }
      else if (e.key === 'Escape') { if (!dd.hidden) { close(); e.preventDefault(); } }     // первый Esc закрывает подсказки, не стирая запрос (type=search стёр бы его сам)
      else if (e.key === 'Enter') { var it = items()[cur]; if (it) { pick(it); e.preventDefault(); } else close(); }
    });
    D.addEventListener('mousedown', function (e) { if (!dd.hidden && !dd.contains(e.target) && e.target !== input) close(); });
    var blurT = 0;
    input.addEventListener('blur', function () { clearTimeout(blurT); blurT = setTimeout(function () { if (D.activeElement !== input && !dd.contains(D.activeElement)) close(); }, 150); });
    input.addEventListener('focus', function () { clearTimeout(blurT); });
    input.addEventListener('input', function () { clearTimeout(blurT); });
    dd.addEventListener('mousedown', function (e) { e.preventDefault(); });
    dd.addEventListener('click', function (e) { var it = e.target.closest('.ia-i'); if (it) pick(it); });

    function groupOf(name) { var gi = me.gi, k; for (k in gi) if (gi[k].indexOf(name) >= 0) return k; return ''; }
    function setQuery(v) { input.value = v; st.rawQuery = v; st.query = v.trim().toLowerCase(); clearTimeout(urlT); syncUrl(); }
    function pick(it) {
      var a;
      resetPaging();
      if ((a = it.getAttribute('data-ia-cat')) != null) { st.category = a; st.expandedGroup = groupOf(a) || st.expandedGroup; }
      else if ((a = it.getAttribute('data-ia-brand')) != null) { st.brand = a; }
      else if ((a = it.getAttribute('data-ia-prod')) != null) { setQuery(a); }
      close(); render();
    }
    // «показать ещё», подсказки пустой выдачи, сброс
    D.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target : null; if (!t) return;
      if (t.closest('[data-ia-more]')) { st.pageSize += STEP; render(); return; }
      var b = t.closest('[data-ia-q]'); if (b) { resetPaging(); setQuery(b.getAttribute('data-ia-q')); render(); return; }
      b = t.closest('#tableBox [data-ia-cat]'); if (b) { resetPaging(); st.category = b.getAttribute('data-ia-cat'); st.expandedGroup = groupOf(st.category) || st.expandedGroup; render(); return; }
      if (t.closest('#ia-reset')) {
        resetPaging(); setQuery(''); st.category = 'Все товары'; st.expandedGroup = ''; st.brand = ''; st.status = ''; st.sort = 'rel';
        me.pmin = me.pmax = null; D.getElementById('ia-p1').value = ''; D.getElementById('ia-p2').value = '';
        stat.value = ''; sort.value = 'rel'; D.getElementById('brandFilter').removeAttribute('data-ia'); render();
      }
    });
    function onPrice() {
      var a = num(D.getElementById('ia-p1').value), b = num(D.getElementById('ia-p2').value);
      if (a != null && b != null && a > b) { var x = a; a = b; b = x; D.getElementById('ia-p1').value = a; D.getElementById('ia-p2').value = b; }
      if (a === me.pmin && b === me.pmax) return;       // значение не изменилось (change при уходе фокуса) — не перерисовываем: клик по разделу не должен теряться
      me.pmin = a; me.pmax = b; resetPaging(); render();
    }
    var priceT = 0;
    ['ia-p1', 'ia-p2'].forEach(function (id) {
      var el = D.getElementById(id);
      el.addEventListener('change', onPrice);
      el.addEventListener('input', function () { clearTimeout(priceT); priceT = setTimeout(onPrice, 600); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(priceT); onPrice(); } });
    });
    me.ui = { input: input, dd: dd, close: close, renderDD: renderDD };
  }

  // ---------- запуск ----------
  function frameReady() {
    var f = document.getElementById(FRAME_ID), W = f && f.contentWindow;
    try { if (W && W.document && W.document.getElementById('tableBox') && W.eval('typeof PRODUCTS!=="undefined"&&PRODUCTS.length>0&&typeof state!=="undefined"')) return W; } catch (e) {}
    return null;
  }
  function waitFrame(ms) {
    return new Promise(function (res, rej) {
      var t0 = Date.now();
      (function tick() { var W = frameReady(); if (W) return res(W); if (Date.now() - t0 > ms) return rej(new Error('приложение каталога не поднялось')); setTimeout(tick, 250); })();
    });
  }
  function start() {
    if (started) return started;
    if (!enabled()) { log('выключено (режим/выключатель)'); return (started = Promise.resolve(false)); }
    started = waitFrame(70000).then(function (W) {
      var prods = W.eval('PRODUCTS');
      return Promise.all([loadEngine(), fetchJson(BASE + '/assort_index.json?v=' + VERSION, 20000).catch(function (e) { log('индекс не загрузился, строю из данных страницы:', e.message); return null; })])
        .then(function (r) {
          var make = r[0], idx = r[1], built = false;
          if (!aligned(idx, prods)) { if (idx) log('индекс не совпал с данными страницы (устарел) — строю из данных страницы'); idx = indexFromProducts(W, prods); built = true; }
          var S = make(idx);
          var me = Layer(W, S, idx, built);
          A = me;
          buildUI(me);
          var q = param('q');
          if (q) { me.ui.input.value = q; me.st.rawQuery = q.trim(); me.st.query = q.trim().toLowerCase(); }
          W.renderCatalog();
          root.ISH_ASSORT_READY = true;
          return true;
        });
    }).catch(function (e) { log('поиск расширенного каталога не поднялся, работает прежний:', e && e.message || e); return false; });
    return started;
  }

  root.ISHAssort = { start: start, version: VERSION, state: function () { return A; }, restore: function () { if (A) A.restore(); }, _aligned: aligned, _indexFromProducts: indexFromProducts };

  // автозапуск: как только поднялось приложение — в простое; раньше — по первому касанию строки поиска
  try {
    if (/^\/assortiment\/?$/.test(root.location.pathname) || param('ishassort_force') === '1') {
      var go = function () { start(); };
      if (param('q')) go();
      else {
        var idle = function () { (root.requestIdleCallback || function (f) { setTimeout(f, 800); })(go); };
        if (document.readyState === 'complete') idle(); else root.addEventListener('load', idle);
        document.addEventListener('pointerdown', go, { once: true, capture: true });
        document.addEventListener('focusin', go, { once: true, capture: true });
      }
    }
  } catch (e) {}
})(typeof window !== 'undefined' ? window : this);

/* ───────────── 15.10.2026 · ОДНА КОРЗИНА В РАСШИРЕННОМ КАТАЛОГЕ (/assortiment) ─────────────
 * Отдельный слой, от поиска не зависит (MODE/enabled() не смотрит). Нужен window.ishKorzina из служебного подвала сайта (блок 4204513403):
 * нет его на странице — слой ничего не меняет, остаётся прежний «В запрос» / «Мой запрос».
 * Что делает в окне приложения (iframe#isoft-catalog-frame, тот же origin; код приложения в Tilda НЕ меняется):
 *   — кнопка строки «В запрос» → «В корзину»: кладёт позицию в общую корзину Tilda (ishKorzina.add → tcart__addProduct) с выбранным
 *     количеством (минимум 1), показывает общее подтверждение (мини-корзина / нижняя панель) и сбрасывает счётчик строки;
 *   — «Мой запрос» в шапке приложения и полоса «Выбрано: … Оформить запрос» прячутся; ссылка «Уже есть готовый список?» (/podbor) остаётся;
 *   — форма запроса страницы (#rec4465413003 → блок формы с textarea «Список позиций *») прячется;
 *   — позиция без цены: price 0, в корзине помечается «цена по запросу» и в итог не входит.
 * Выключатель: ?ishassortcart=0 в адресе или localStorage.ishassortcart = '0'. Откат всем: убрать этот кусок из файла и выложить.
 */
(function (root) {
  'use strict';
  try {
    if (root.__ishAssortCart) return;
    if (!/^\/assortiment\/?$/.test(root.location.pathname)) return;
    var off = false;
    try { off = new URL(root.location.href).searchParams.get('ishassortcart') === '0' || root.localStorage.getItem('ishassortcart') === '0'; } catch (e) {}
    if (off) return;
    root.__ishAssortCart = 1;
    var FRAME = 'isoft-catalog-frame', REC = '4465413003', NOTE = 1400;
    var CSSX = '#headerRequest,.request-bar{display:none!important}.add-button{min-width:104px}.add-button.ishk-done{background:#14704A!important;border-color:#14704A!important;color:#fff!important}';
    var added = {}, W = null, D = null, obs = null;

    function byId() {
      if (!W.__ishkIdx) { var m = {}; try { W.eval('PRODUCTS').forEach(function (p) { m[p.id] = p; }); } catch (e) {} W.__ishkIdx = m; }
      return W.__ishkIdx;
    }
    function itemOf(p) {
      var m = /\/tproduct\/(\d+)/.exec(p.product_url || '');
      var site = !!(p.on_site && p.product_url);
      return { uid: m && site ? m[1] : String(p.id), name: p.name, sku: p.article || '', price: Number(p.price) > 0 ? Number(p.price) : 0, img: '',
               url: site ? p.product_url : root.location.origin + '/assortiment', recid: REC, code: p.source_code || '' };
    }
    function relabel() {
      if (!D) return;
      [].forEach.call(D.querySelectorAll('button[data-add]'), function (b) {
        var row = b.closest('[data-id]'), id = row && row.getAttribute('data-id');
        var done = id && added[id] && Date.now() - added[id] < NOTE;
        var want = done ? 'Добавлено ✓' : 'В корзину';
        b.classList.remove('added');
        b.classList.toggle('ishk-done', !!done);
        if (b.textContent !== want) b.textContent = want;
      });
    }
    function resetRow(id) {
      try { W.eval('(function(){delete state.cart[' + JSON.stringify(id) + '];save();renderCatalog();})()'); } catch (e) {}
    }
    function onClick(e) {
      var t = e.target; if (!t || !t.closest) return;
      var b = t.closest('button[data-add]'); if (!b) return;
      var row = b.closest('[data-id]'), id = row && row.getAttribute('data-id'), p = id && byId()[id];
      if (!p || !root.ishKorzina) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      var o = row.querySelector('.qty output'), q = Math.max(1, parseInt(o && o.textContent, 10) || 1), it = itemOf(p);
      if (b.__busy) return; b.__busy = 1;
      root.ishKorzina.add(it, q).then(function (ok) {
        b.__busy = 0;
        if (ok) { added[id] = Date.now(); resetRow(id); relabel(); setTimeout(relabel, NOTE + 60); root.ishKorzina.added(it); }
        else { b.textContent = 'Не удалось'; setTimeout(relabel, 1800); }
      });
    }
    function start() {
      var f = D0();
      if (!f) return false;
      W = f.contentWindow; D = W.document;
      var st = D.createElement('style'); st.id = 'ishk-assort-css'; st.textContent = CSSX; D.head.appendChild(st);
      try { W.eval('state.cart={};save();'); } catch (e) {}            // прежний «Мой запрос» больше не живёт: счётчики строк с нуля
      D.addEventListener('click', onClick, true);
      var box = D.getElementById('tableBox');
      if (box && root.MutationObserver) { obs = new MutationObserver(relabel); obs.observe(box, { childList: true, subtree: true }); }
      relabel();
      try { W.eval('renderCatalog()'); } catch (e) {}
      var ar = root.document.querySelector('textarea[name="Список позиций *"]'), rec = ar && ar.closest('.r');
      if (rec && rec.id !== 'rec' + REC) rec.style.setProperty('display', 'none', 'important');   // форма запроса страницы
      root.document.documentElement.classList.add('ishk-assort');
      return true;
    }
    function D0() {
      var f = root.document.getElementById(FRAME);
      try { if (f && f.contentWindow && f.contentWindow.document.getElementById('tableBox') && f.contentWindow.eval('typeof PRODUCTS!=="undefined"&&PRODUCTS.length>0&&typeof state!=="undefined"&&typeof changeQty==="function"')) return f; } catch (e) {}
      return null;
    }
    var n = 0, iv = setInterval(function () {
      if (++n > 280) { clearInterval(iv); return; }
      if (!root.ishKorzina) return;
      if (start()) clearInterval(iv);
    }, 250);
  } catch (e) { /* ничего не ломаем */ }
})(typeof window !== 'undefined' ? window : this);
