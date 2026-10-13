/*
 * Поиск для интернет-магазина (прототип). Один файл, без зависимостей, ES2017.
 *   var S = createSearch(indexJson);          // indexJson — объект из search_index.json
 *   var r = S.query('asus ноутбук', {limit: 8, brands: ['ASUS'], priceMax: 500000});
 *   r = { total, matched, products[], categories[], brands[], queries[], facets{}, corrected, relaxed, fallback }
 * Нормализация токенов (prep/tokenize) обязана совпадать с build_index.py (проверяет test_queries.js).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { var f = factory(); root.createSearch = f.createSearch; root.ishQuickCats = f.quickCats; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- нормализация ----------
  var UNITS = { 'гбайт': 'gb', 'гб': 'gb', 'gb': 'gb', 'тб': 'tb', 'tb': 'tb', 'мб': 'mb', 'mb': 'mb', 'мгц': 'mhz', 'mhz': 'mhz',
    'ггц': 'ghz', 'ghz': 'ghz', 'гц': 'hz', 'hz': 'hz', 'вт': 'w', 'w': 'w', 'мп': 'mp', 'mp': 'mp' };
  var BIGGB = { '1000': '1tb', '1024': '1tb', '2000': '2tb', '2048': '2tb', '4000': '4tb', '4096': '4tb', '8000': '8tb', '8192': '8tb' };
  var TAIL = '(?=$|[^a-zа-я0-9]|x\\d)';
  var RE_INCH = new RegExp('(\\d+(?:p\\d+)?)\\s*(?:"|дюйм[а-я]*|inch(?:es)?|in' + TAIL + ')', 'g');
  var RE_UNIT = new RegExp('(\\d+(?:p\\d+)?)\\s*(гбайт|гб|gb|тб|tb|мб|mb|мгц|mhz|ггц|ghz|гц|hz|вт|w|мп|mp)' + TAIL, 'g');

  function prep(s) {
    s = String(s == null ? '' : s).toLowerCase().replace(/ё/g, 'е');
    s = s.replace(/[″”“]|''/g, '"');
    s = s.replace(/(\d)[.,]0+(?!\d)/g, '$1');
    s = s.replace(/(\d)[.,](\d)/g, '$1p$2');
    s = s.replace(RE_INCH, function (m, a) { return a + 'in '; });
    s = s.replace(RE_UNIT, function (m, a, u) { return a + UNITS[u] + ' '; });
    return s;
  }
  function tokenize(s) {
    var t = s.match(/[a-zа-я0-9]+/g) || [];
    for (var i = 0; i < t.length; i++) {
      var m = /^(\d+)gb$/.exec(t[i]);
      if (m && BIGGB[m[1]]) t[i] = BIGGB[m[1]];
    }
    return t;
  }
  function baseTokens(s) { return tokenize(prep(s)); }
  function compact(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, ''); }
  function isCyr(w) { return /^[а-я]+$/.test(w); }

  var SUF = ['иями', 'ями', 'ами', 'ов', 'ев', 'ей', 'ом', 'ем', 'ам', 'ям', 'ах', 'ях', 'ию', 'ью', 'ие', 'ые', 'ое', 'ый', 'ий', 'ой',
    'ых', 'их', 'ую', 'юю', 'ая', 'яя', 'ою', 'ею', 'ия', 'ья', 'а', 'я', 'ы', 'и', 'у', 'ю', 'е', 'о', 'ь', 'й']
    .sort(function (a, b) { return b.length - a.length; });
  function stem(w) {
    if (w.length <= 3 || !isCyr(w)) return w;
    for (var i = 0; i < SUF.length; i++) {
      var s = SUF[i];
      if (w.length - s.length >= 3 && w.slice(-s.length) === s) return w.slice(0, w.length - s.length);
    }
    return w;
  }
  // дополнительные формы токена: «rtx3060» -> rtx + 3060, «5070ti» -> 5070 + ti
  function forms(tok) {
    var f = [stem(tok)], m = /^([a-z]{2,5})(\d{2,5}[a-z]{0,2})$/.exec(tok);
    if (m) f.push(m[1], m[2]);
    else if ((m = /^(\d{3,5})([a-z]{1,2})$/.exec(tok))) f.push(m[1], m[2]);
    return f;
  }
  // склейки «wi-fi» -> wifi, «tp-link» -> tplink, «m.2» -> m2
  function joins(p) {
    var re = /(^|[^a-zа-я0-9])([a-z]{1,5})[-.]([a-z0-9]{1,5})(?![a-zа-я0-9])/g, m, out = [];
    while ((m = re.exec(p))) out.push(m[2] + m[3]);
    return out;
  }
  function unitLike(c) { return /^\d+(p\d+)?(gb|tb|mb|mhz|ghz|hz|w|mp|in)$/.test(c); }
  function pnEligible(c) { return c.length >= 5 && /\d/.test(c) && /[a-z]/.test(c) && !unitLike(c); }

  // ---------- раскладка / транслит / словари ----------
  var RU_ROW = 'йцукенгшщзхъфывапролджэячсмитьбю', EN_ROW = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,.';
  var R2E = {}, E2R = {};
  for (var ki = 0; ki < RU_ROW.length; ki++) { R2E[RU_ROW[ki]] = EN_ROW[ki]; E2R[EN_ROW[ki]] = RU_ROW[ki]; }
  R2E['ё'] = '`'; E2R['`'] = 'ё';
  function swapLayout(t) {
    var toEn = /[а-яё]/.test(t), mp = toEn ? R2E : E2R, o = '';
    for (var i = 0; i < t.length; i++) { var c = t[i]; o += mp[c] !== undefined ? mp[c] : c; }
    return o;
  }
  var TR = { 'а': ['a'], 'б': ['b'], 'в': ['v', 'w'], 'г': ['g'], 'д': ['d'], 'е': ['e', 'ye'], 'ё': ['e'], 'ж': ['zh', 'j'], 'з': ['z'],
    'и': ['i', 'y'], 'й': ['y', 'j', 'i'], 'к': ['k', 'c'], 'л': ['l'], 'м': ['m'], 'н': ['n'], 'о': ['o'], 'п': ['p'], 'р': ['r'],
    'с': ['s', 'c'], 'т': ['t'], 'у': ['u', 'y'], 'ф': ['f', 'ph'], 'х': ['h', 'kh', 'x'], 'ц': ['ts', 'c'], 'ч': ['ch'], 'ш': ['sh'],
    'щ': ['sch', 'sh'], 'ъ': [''], 'ы': ['y', 'i'], 'ь': [''], 'э': ['e'], 'ю': ['yu', 'u'], 'я': ['ya', 'a'] };
  function translitVariants(w) {
    var out = [], budget = 300;
    (function rec(i, acc) {
      if (out.length >= 48 || budget-- <= 0) return;
      if (i === w.length) { out.push(acc); return; }
      var alts = TR[w[i]] || [w[i]];
      for (var k = 0; k < alts.length; k++) rec(i + 1, acc + alts[k]);
    })(0, '');
    return out;
  }
  var LAT2RU = [['sch', 'щ'], ['sh', 'ш'], ['ch', 'ч'], ['zh', 'ж'], ['ts', 'ц'], ['yu', 'ю'], ['ya', 'я'], ['kh', 'х'], ['a', 'а'], ['b', 'б'], ['c', 'к'],
    ['d', 'д'], ['e', 'е'], ['f', 'ф'], ['g', 'г'], ['h', 'х'], ['i', 'и'], ['j', 'ж'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'],
    ['p', 'п'], ['q', 'к'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['v', 'в'], ['w', 'в'], ['x', 'кс'], ['y', 'и'], ['z', 'з']];
  function latToRu(w) {
    var o = '', i = 0;
    while (i < w.length) {
      var hit = false;
      for (var k = 0; k < LAT2RU.length; k++) {
        var p = LAT2RU[k][0];
        if (w.substr(i, p.length) === p) { o += LAT2RU[k][1]; i += p.length; hit = true; break; }
      }
      if (!hit) { o += w[i]; i++; }
    }
    return o;
  }
  // русское написание бренда, которое не получается механическим транслитом
  var ALIAS = { 'хуавей': 'huawei', 'хуавэй': 'huawei', 'хиквижн': 'hikvision', 'хиквижен': 'hikvision', 'хиквижн': 'hikvision', 'эйчпи': 'hp', 'хп': 'hp',
    'эйсер': 'acer', 'асер': 'acer', 'ейсер': 'acer', 'эльджи': 'lg', 'элджи': 'lg', 'эльжи': 'lg', 'тплинк': 'tplink', 'тп': 'tp', 'эмэсай': 'msi', 'мсай': 'msi',
    'гигабайт': 'gigabyte', 'логитек': 'logitech', 'логитех': 'logitech', 'ксиоми': 'xiaomi', 'сяоми': 'xiaomi', 'ксяоми': 'xiaomi', 'эпл': 'apple',
    'апл': 'apple', 'термалтейк': 'thermaltake', 'термалтэйк': 'thermaltake', 'сигейт': 'seagate', 'сеагейт': 'seagate', 'рязен': 'ryzen', 'райзен': 'ryzen',
    'джифорс': 'geforce', 'мерсусис': 'mercusys', 'тошиба': 'toshiba', 'делл': 'dell', 'дэлл': 'dell', 'леново': 'lenovo', 'асус': 'asus', 'эйсус': 'asus',
    'вайфай': 'wifi', 'вифи': 'wifi', 'нвме': 'nvme', 'хайпер': 'hyperx', 'хуавей': 'huawei', 'тплинк': 'tplink', 'дахуа': 'dahua', 'мс': 'ms' };
  delete ALIAS['мс'];
  // синонимы: ключ -> список слов индекса (слово* = префикс)
  var SYN_RAW = {
    'ноут': ['ноутбук'], 'лэптоп': ['ноутбук'], 'лептоп': ['ноутбук'], 'laptop': ['ноутбук'], 'notebook': ['ноутбук'],
    'комп': ['компьютер', 'пк', 'моноблок', 'системн*'], 'компьютер': ['пк', 'моноблок', 'системн*'], 'системник': ['системн*', 'корпус'],
    'мышка': ['мыш'], 'мышь': ['мыш'], 'мышки': ['мыш'], 'клава': ['клавиатур'], 'клавка': ['клавиатур'],
    'видюха': ['видеокарт'], 'видюшка': ['видеокарт'], 'видяха': ['видеокарт'], 'видеоадаптер': ['видеокарт'], 'гпу': ['видеокарт'], 'gpu': ['видеокарт'],
    'озу': ['оперативн', 'dimm', 'sodimm'], 'оперативка': ['оперативн', 'dimm', 'sodimm'], 'ram': ['оперативн', 'dimm', 'sodimm'], 'рам': ['оперативн', 'dimm'],
    'ссд': ['ssd', 'твердотельн'], 'хдд': ['hdd', 'жестк'], 'винт': ['hdd', 'жестк'], 'винчестер': ['hdd', 'жестк'], 'хард': ['hdd', 'жестк'],
    'роутер': ['маршрутизатор', 'роутер'], 'рутер': ['маршрутизатор', 'роутер'], 'маршрутизатор': ['роутер'],
    'свитч': ['коммутатор', 'switch'], 'свич': ['коммутатор', 'switch'], 'коммутатор': ['switch', 'свитч'],
    'флешка': ['флешк', 'flash'], 'флэшка': ['флешк', 'flash'], 'флеш': ['флешк', 'flash'], 'юсб': ['usb'],
    'кулер': ['охлажден', 'вентилятор'], 'вентилятор': ['кулер', 'охлажден'], 'радиатор': ['охлажден', 'кулер'],
    'бп': ['питан'], 'ибп': ['ups', 'бесперебойн*'], 'упс': ['ибп', 'ups'], 'бесперебойник': ['ибп', 'ups'], 'ups': ['ибп'],
    'камера': ['видеонаблюден'], 'видеокамера': ['камер', 'видеонаблюден'], 'cctv': ['видеонаблюден', 'камер'], 'видеонаблюдение': ['камер'],
    'дисплей': ['монитор'], 'экран': ['монитор'], 'моник': ['монитор'],
    'тв': ['телевизор'], 'телек': ['телевизор'], 'телик': ['телевизор'],
    'принтер': ['мфу'], 'мфу': ['принтер'],
    'уши': ['наушник'], 'гарнитура': ['наушник'], 'проц': ['процессор', 'cpu'], 'цп': ['процессор', 'cpu'], 'cpu': ['процессор'],
    'материнка': ['материнск'], 'мамка': ['материнск'], 'мать': ['материнск'], 'кейс': ['корпус'], 'вайфай': ['wifi', 'wi'],
    'нвме': ['nvme', 'm2'], 'интернет': []
  };
  var STOP = {};
  ('для и в на с по от к у из the a for купить цена цены цену недорого дешево магазин алматы астана казахстан интернет заказать оптом kz or of').split(' ')
    .forEach(function (w) { STOP[w] = 1; });

  // ---------- расстояние Дамерау-Левенштейна (OSA) с отсечкой ----------
  function osa(a, b, max) {
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    var p2 = null, p1 = new Array(lb + 1), cur = new Array(lb + 1), i, j;
    for (j = 0; j <= lb; j++) p1[j] = j;
    for (i = 1; i <= la; i++) {
      cur[0] = i;
      var rowMin = i;
      for (j = 1; j <= lb; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        var v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + cost);
        if (i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) v = Math.min(v, p2[j - 2] + 1);
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      p2 = p1; p1 = cur; cur = new Array(lb + 1);
    }
    return p1[lb];
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // слог адреса товара на сайте (как Tilda: транслит, без знаков, до 40 знаков); ТО ЖЕ делает build_index2.py
  var SLUG_TR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya' };
  function slugOf(t) {
    var s = String(t).toLowerCase().replace(/[а-яё]/g, function (ch) { return SLUG_TR[ch]; });
    s = s.replace(/[^a-z0-9 \-]+/g, '').replace(/[\s\-]+/g, '-').replace(/^-|-$/g, '');
    return s.slice(0, 40).replace(/-$/g, '');
  }

  // ---------- движок ----------
  function createSearch(idx) {
    var P = idx.P, B = idx.B, C = idx.C, G = idx.G || [], Q = idx.Q || [], N = P.length;
    var vocab = new Map(), words = [], df = [], pt = [], ps = [], pb = [], pc = [], pf = [];
    function wid(w) {
      var id = vocab.get(w);
      if (id === undefined) { id = words.length; vocab.set(w, id); words.push(w); df.push(0); pt.push(null); ps.push(null); pb.push(null); pc.push(null); pf.push(null); }
      return id;
    }
    function push(arr, id, d) { (arr[id] || (arr[id] = [])).push(d); }

    function fieldIds(text) {          // множество id слов (с доп. формами и склейками) для строки
      var p = prep(text), toks = tokenize(p), set = new Set(), i, j;
      for (i = 0; i < toks.length; i++) { var f = forms(toks[i]); for (j = 0; j < f.length; j++) set.add(wid(f[j])); }
      var jn = joins(p); for (i = 0; i < jn.length; i++) set.add(wid(jn[i]));
      return { ids: set, n: toks.length, toks: toks };
    }
    var brandIds = B.map(function (b) { return Array.from(fieldIds(b).ids); });
    var catIds = C.map(function (c) { return Array.from(fieldIds(c[0]).ids); });

    var lnorm = new Float32Array(N), pnList = new Array(N);
    for (var d = 0; d < N; d++) {
      var p = P[d], pp = prep(p[0]), toks = tokenize(pp), seen = new Set(), first = new Set(), seenAll = new Set(), i, j;
      for (i = 0; i < toks.length; i++) {
        var fs = forms(toks[i]);
        for (j = 0; j < fs.length; j++) {
          var id = wid(fs[j]);
          if (!seen.has(id)) { seen.add(id); push(pt, id, d); seenAll.add(id); }
          if (i < 3 && !first.has(id)) { first.add(id); push(pf, id, d); }
        }
      }
      var jn = joins(pp);
      for (i = 0; i < jn.length; i++) { var jid = wid(jn[i]); if (!seen.has(jid)) { seen.add(jid); push(pt, jid, d); seenAll.add(jid); } }
      if (p[1] >= 0) brandIds[p[1]].forEach(function (id) { push(pb, id, d); seenAll.add(id); });
      catIds[p[2]].forEach(function (id) { push(pc, id, d); seenAll.add(id); });
      if (p[7]) {
        var sp = p[7].split(' '), sseen = new Set();
        for (i = 0; i < sp.length; i++) {
          var sf = forms(sp[i]);
          for (j = 0; j < sf.length; j++) { var sid = wid(sf[j]); if (!sseen.has(sid)) { sseen.add(sid); push(ps, sid, d); seenAll.add(sid); } }
        }
      }
      seenAll.forEach(function (id) { df[id]++; });
      lnorm[d] = Math.max(0.55, Math.min(1, 1 / (1 + 0.02 * (toks.length - 8))));
      // партномера: куски названия с буквами+цифрами и доп. партномера
      var pl = [], chunks = p[0].split(/[\s,;()\[\]"<>|]+/);
      for (i = 0; i < chunks.length; i++) { var c = compact(chunks[i]); if (pnEligible(c) && pl.indexOf(c) < 0) pl.push(c); }
      if (p[6]) { var ex = p[6].split(' '); for (i = 0; i < ex.length; i++) if (ex[i].length >= 4 && pl.indexOf(ex[i]) < 0) pl.push(ex[i]); }
      pnList[d] = pl;
    }
    var V = words.length;
    var order = new Array(V); for (var oi = 0; oi < V; oi++) order[oi] = oi;
    order.sort(function (a, b) { return words[a] < words[b] ? -1 : words[a] > words[b] ? 1 : 0; });
    var sortedW = order.map(function (id) { return words[id]; });
    var idfArr = new Float32Array(V);
    for (var vi = 0; vi < V; vi++) idfArr[vi] = Math.log(1 + (N - df[vi] + 0.5) / (df[vi] + 0.5));
    var plainWords = { cyr: [], lat: [] };
    for (vi = 0; vi < V; vi++) { var w0 = words[vi]; if (/\d/.test(w0)) continue; (isCyr(w0) ? plainWords.cyr : plainWords.lat).push(vi); }
    var SYN = {};
    Object.keys(SYN_RAW).forEach(function (k) { SYN[stem(k)] = SYN_RAW[k].map(function (s) { return s.slice(-1) === '*' ? s : stem(s); }); SYN[k] = SYN[stem(k)]; });

    function prefixIds(pfx, limit) {
      var lo = 0, hi = sortedW.length;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (sortedW[mid] < pfx) lo = mid + 1; else hi = mid; }
      var out = [];
      for (var i = lo; i < sortedW.length && sortedW[i].lastIndexOf(pfx, 0) === 0; i++) out.push(order[i]);
      if (limit && out.length > limit) { out.sort(function (a, b) { return df[b] - df[a]; }); out.length = limit; }
      return out;
    }
    // ---- партномера ----
    function pnScores(c) {
      var arr = null;
      for (var d = 0; d < N; d++) {
        var l = pnList[d], best = 0;
        for (var k = 0; k < l.length; k++) {
          var e = l[k], s = 0;
          if (e === c) s = 100;
          else {
            var at = e.indexOf(c);
            if (at === 0) s = 40 + 30 * (c.length / e.length);
            else if (at > 0) s = 28 + 30 * (c.length / e.length);
          }
          if (s > best) best = s;
        }
        if (best) { if (!arr) arr = new Float32Array(N); arr[d] = best; }
      }
      return arr;
    }
    var pnCache = new Map();
    function pnArr(c) { if (!pnCache.has(c)) { if (pnCache.size > 300) pnCache.clear(); pnCache.set(c, pnScores(c)); } return pnCache.get(c); }

    // ---- разбор слова ----
    function resolveToken(tk, isLast, fuzzy) {
      var alts = new Map(), how = '', shown = null;
      function add(id, w, cap) { var o = alts.get(id); if (!o || w > o.w) alts.set(id, { id: id, w: w, cap: cap }); }
      var cyr = isCyr(tk), st = cyr ? stem(tk) : tk, e = vocab.get(st), exact = e !== undefined, isNum = /^\d+$/.test(tk);
      if (exact) add(e, isNum && tk.length <= 4 ? 0.85 : 1);
      var cap = exact ? idfArr[e] : undefined;
      if ((isLast && tk.length >= 2) || (!exact && tk.length >= 3)) {
        var pf2 = tk === st ? [tk] : [tk, st];
        for (var a = 0; a < pf2.length; a++) {
          var ids = prefixIds(pf2[a], 60);
          for (var b = 0; b < ids.length; b++) {
            if (ids[b] === e) continue;
            add(ids[b], (isLast ? 0.7 : 0.5) * (0.7 + 0.3 * Math.min(1, pf2[a].length / words[ids[b]].length)), cap);
          }
        }
        if (alts.size && !how) how = 'prefix';
      }
      var sy = SYN[st] || SYN[tk];
      if (sy) for (var s = 0; s < sy.length; s++) {
        var sw = sy[s];
        if (sw.slice(-1) === '*') prefixIds(sw.slice(0, -1), 60).forEach(function (id) { add(id, 0.8); });
        else { var sid = vocab.get(sw); if (sid !== undefined) add(sid, 0.85); }
      }
      if (cyr) {
        var al = ALIAS[tk];
        if (al) { var aid = vocab.get(al); if (aid !== undefined) { add(aid, 0.95); shown = al; } }
        if (!exact && !al) {
          var tv = translitVariants(tk);
          for (var t = 0; t < tv.length; t++) { var tid = vocab.get(tv[t]); if (tid !== undefined) { add(tid, 0.92); shown = shown || tv[t]; break; } }
          if (!shown && isLast && tv[0].length >= 3) prefixIds(tv[0], 40).forEach(function (id) { add(id, 0.6); shown = shown || words[id]; });
        }
        if (shown && !exact) how = 'translit';
      } else if (!exact && /^[a-z]+$/.test(tk) && tk.length >= 4) {
        var ru = stem(latToRu(tk)), rid = vocab.get(ru);
        if (rid !== undefined) { add(rid, 0.85); shown = ru; how = 'translit'; }
      }
      if (isNum && tk.length <= 5) {
        ['gb', 'tb', 'in', 'hz', 'mhz', 'ghz', 'w', 'mp'].forEach(function (u) {
          var nid = vocab.get(tk + u);
          if (nid !== undefined && !(u === 'tb' && +tk > 64)) add(nid, 0.9);
        });
      }
      if (!alts.size && fuzzy && !/\d/.test(tk) && tk.length >= 4) {
        var base = cyr ? st : tk, L = base.length, maxd = L <= 3 ? 0 : L <= 7 ? 1 : 2;
        var pool = cyr ? plainWords.cyr : plainWords.lat, bestD = maxd + 1, best = [];
        for (var q = 0; q < pool.length; q++) {
          var cw = words[pool[q]];
          if (Math.abs(cw.length - L) > maxd) continue;
          var dd = osa(base, cw, maxd);
          if (dd < bestD) { bestD = dd; best = [pool[q]]; } else if (dd === bestD && dd <= maxd) best.push(pool[q]);
        }
        if (best.length && bestD <= maxd) {
          best.sort(function (a2, b2) { return df[b2] - df[a2]; });
          best.slice(0, 6).forEach(function (id) { add(id, bestD === 1 ? 0.78 : 0.62); });
          shown = words[best[0]]; how = 'typo';
        } else if (cyr && L >= 5) {      // опечатка в русском написании бренда: сравниваем транслит с латиницей
          var tr0 = translitVariants(tk)[0], lb = [], mt = tr0.length >= 8 ? 2 : 1, bd = mt + 1;
          for (var q2 = 0; q2 < plainWords.lat.length; q2++) {
            var cw2 = words[plainWords.lat[q2]];
            if (Math.abs(cw2.length - tr0.length) > mt) continue;
            var d2 = osa(tr0, cw2, mt);
            if (d2 < bd) { bd = d2; lb = [plainWords.lat[q2]]; } else if (d2 === bd && d2 <= mt) lb.push(plainWords.lat[q2]);
          }
          if (lb.length && bd <= mt) {
            lb.sort(function (a2, b2) { return df[b2] - df[a2]; });
            lb.slice(0, 4).forEach(function (id) { add(id, 0.6); });
            shown = words[lb[0]]; how = 'typo';
          }
        }
      }
      if (!alts.size) return null;
      return { alts: Array.from(alts.values()), how: how, shown: shown, exact: exact };
    }

    function chunkResult(ch, isLastChunk, fuzzy) {
      var toks = tokenize(ch), parts = [], ok = true;
      for (var i = 0; i < toks.length; i++) {
        var tk = toks[i], isLast = isLastChunk && i === toks.length - 1;
        if (STOP[tk]) { parts.push({ tk: tk, stop: true }); continue; }
        var r = resolveToken(tk, isLast, fuzzy);
        if (!r && /[a-z]\d|\d[a-z]/.test(tk)) {      // «3060ti» -> 3060 + ti
          var sp = tk.match(/[a-z]+|\d+/g), sub = [];
          if (sp && sp.length >= 2 && sp.length <= 3) {
            for (var k = 0; k < sp.length; k++) { var rr = resolveToken(sp[k], isLast && k === sp.length - 1, false); if (!rr) { sub = null; break; } sub.push({ tk: sp[k], res: rr, last: isLast && k === sp.length - 1 }); }
            if (sub) { sub.forEach(function (x) { parts.push(x); }); continue; }
          }
        }
        parts.push({ tk: tk, res: r, last: isLast });
        if (!r) ok = false;
      }
      var c = compact(ch), pn = null;
      if (pnEligible(c) && pnArr(c)) pn = c;
      return { ch: ch, parts: parts, pn: pn, ok: ok || !!pn,
        exactAll: parts.every(function (x) { return x.stop || (x.res && x.res.exact); }) };
    }

    // «16/512» в запросе — это ОЗУ/накопитель, а не 16:9: превращаем в 16gb 512gb
    var RAM_OK = { 4: 1, 8: 1, 12: 1, 16: 1, 24: 1, 32: 1, 48: 1, 64: 1, 96: 1, 128: 1 };
    var SSD_OK = { 120: 1, 128: 1, 240: 1, 256: 1, 480: 1, 500: 1, 512: 1, 960: 1, 1000: 1, 1024: 1, 2000: 1, 2048: 1 };
    function ramSsd(s) {
      return s.replace(/(^|\s)(\d{1,3})\s*\/\s*(\d{3,4})(?=\s|$)/g, function (m, pre, a, b) {
        return RAM_OK[+a] && SSD_OK[+b] ? pre + a + 'gb ' + b + 'gb' : m;
      });
    }
    function parse(q, prefixMode) {
      var s = ramSsd(prep(q)), endsSpace = /\s$/.test(q), chunks = s.split(/\s+/).filter(Boolean), cr = [], changes = [];
      for (var i = 0; i < chunks.length; i++) {
        var ch = chunks[i], last = prefixMode && !endsSpace && i === chunks.length - 1;
        var isUnit = UNITS[ch] || /^\d+(p\d+)?$/.test(ch);
        var a = chunkResult(ch, last, false), chosen = a, swapped = null;
        if (!a.ok && !isUnit && ch.length >= 3 && /[a-zа-я]/.test(ch)) {
          swapped = swapLayout(ch);
          var b = chunkResult(swapped, last, false);
          if (b.ok && b.parts.length) { chosen = b; chosen.layout = ch; }
        }
        if (!chosen.ok) {
          var a2 = chunkResult(ch, last, true);
          if (a2.ok) chosen = a2;
          else if (swapped) { var b2 = chunkResult(swapped, last, true); if (b2.ok && b2.parts.length) { chosen = b2; chosen.layout = ch; } }
        }
        cr.push(chosen);
      }
      // склейка соседних кусков в партномер: «kf552 c40»
      for (i = 0; i < cr.length; i++) {
        if (cr[i].exactAll && (!cr[i + 1] || cr[i + 1].exactAll)) continue;
        for (var span = 2; span <= 3 && i + span <= cr.length; span++) {
          var c = compact(cr.slice(i, i + span).map(function (x) { return x.ch; }).join(' '));
          if (pnEligible(c) && pnArr(c)) {
            var merged = { ch: cr.slice(i, i + span).map(function (x) { return x.ch; }).join(' '), parts: [], pn: c, ok: true, merged: true, exactAll: false };
            cr.slice(i, i + span).forEach(function (x) { merged.parts = merged.parts.concat(x.parts); });
            cr.splice(i, span, merged); break;
          }
        }
      }
      var terms = [], shownWords = [];
      cr.forEach(function (c) {
        var real = c.parts.filter(function (x) { return !x.stop; });
        var subs = real.map(function (x) { return { text: x.tk, res: x.res || null, last: !!x.last }; });
        real.forEach(function (x) {
          var disp = x.res && x.res.shown && (x.res.how === 'typo' || x.res.how === 'translit') ? x.res.shown : null;
          if (c.layout) { if (x === real[0]) changes.push({ from: c.layout, to: c.ch, type: 'layout' }); }
          else if (disp) changes.push({ from: x.tk, to: disp, type: x.res.how });
        });
        if (!subs.length) return;
        if (c.pn && (subs.length > 1 || !subs[0].res)) terms.push({ text: c.ch, parts: subs, pn: c.pn });
        else if (subs.length > 1) subs.forEach(function (x) { terms.push(x); });
        else { if (c.pn) subs[0].pn = c.pn; terms.push(subs[0]); }
      });
      return { terms: terms, changes: changes, chunks: chunks };
    }

    // ---- оценка ----
    var FT = 3.0, FTF = 4.2, FB = 2.4, FC = 1.6, FS = 1.2;
    function altArr(alts) {
      var arr = new Float32Array(N);
      for (var a = 0; a < alts.length; a++) {
        var al = alts[a], id = al.id, idf = idfArr[id];
        if (al.cap !== undefined && al.cap < idf) idf = al.cap;
        var base = idf * al.w, l, k, v, dd;
        if ((l = ps[id])) for (k = 0; k < l.length; k++) { dd = l[k]; v = base * FS; if (v > arr[dd]) arr[dd] = v; }
        if ((l = pc[id])) for (k = 0; k < l.length; k++) { dd = l[k]; v = base * FC; if (v > arr[dd]) arr[dd] = v; }
        if ((l = pb[id])) for (k = 0; k < l.length; k++) { dd = l[k]; v = base * FB; if (v > arr[dd]) arr[dd] = v; }
        if ((l = pt[id])) for (k = 0; k < l.length; k++) { dd = l[k]; v = base * FT * lnorm[dd]; if (v > arr[dd]) arr[dd] = v; }
        if ((l = pf[id])) for (k = 0; k < l.length; k++) { dd = l[k]; v = base * FTF * lnorm[dd]; if (v > arr[dd]) arr[dd] = v; }
      }
      return arr;
    }
    function termArr(t) {
      var arr;
      if (t.parts) {
        arr = new Float32Array(N);
        var subs = t.parts.map(termArr), ok = subs.every(function (s) { return s; });
        if (ok) for (var d = 0; d < N; d++) { var sum = 0; for (var k = 0; k < subs.length; k++) { var v = subs[k][d]; if (!v) { sum = 0; break; } sum += v; } arr[d] = sum; }
      } else if (t.res) arr = altArr(t.res.alts);
      else arr = new Float32Array(N);
      if (t.pn) { var pa = pnArr(t.pn); if (pa) for (var e = 0; e < N; e++) if (pa[e] > arr[e]) arr[e] = pa[e]; }
      return arr;
    }
    function termIdf(t) {
      if (t.parts) { var m = 0; t.parts.forEach(function (x) { m = Math.max(m, termIdf(x)); }); return m; }
      if (!t.res) return -1;
      var mx = 0; t.res.alts.forEach(function (a) { var v = idfArr[a.id] * a.w; if (v > mx) mx = v; }); return mx;
    }
    function collectIds(t, set) { if (t.parts) t.parts.forEach(function (x) { collectIds(x, set); }); else if (t.res) t.res.alts.forEach(function (a) { set.add(a.id); }); }
    function collectWords(t, set) { var s = new Set(); collectIds(t, s); s.forEach(function (id) { set.add(words[id]); }); }

    // ---- подсветка ----
    function highlight(text, ctx) {
      var re = /[A-Za-zА-Яа-яЁё0-9]+/g, m, toks = [], marks = [], i;
      while ((m = re.exec(text))) toks.push({ s: m.index, e: m.index + m[0].length, t: m[0] });
      for (i = 0; i < toks.length; i++) {
        var t = toks[i], lw = t.t.toLowerCase().replace(/ё/g, 'е'), hit = false, k;
        if (/^\d+$/.test(lw) && i + 1 < toks.length && /^\s*$/.test(text.slice(t.e, toks[i + 1].s))) {
          var u = UNITS[toks[i + 1].t.toLowerCase()];
          if (u && ctx.words.has(lw + u)) { marks.push([t.s, toks[i + 1].e]); i++; continue; }
        }
        var fk = forms(lw);
        for (k = 0; k < fk.length && !hit; k++) if (ctx.words.has(fk[k])) hit = true;
        if (!hit) for (k = 0; k < ctx.prefs.length; k++) if (lw.lastIndexOf(ctx.prefs[k], 0) === 0) { hit = true; break; }
        if (!hit && ctx.pn.length) { var cc = compact(lw); for (k = 0; k < ctx.pn.length; k++) if (cc.length >= 3 && ctx.pn[k].indexOf(cc) >= 0 && cc.length >= Math.min(5, ctx.pn[k].length)) { hit = true; break; } else if (cc.indexOf(ctx.pn[k]) >= 0) { hit = true; break; } }
        if (hit) marks.push([t.s, t.e]);
      }
      var out = '', pos = 0;
      for (i = 0; i < marks.length; i++) { out += esc(text.slice(pos, marks[i][0])) + '<mark>' + esc(text.slice(marks[i][0], marks[i][1])) + '</mark>'; pos = marks[i][1]; }
      return out + esc(text.slice(pos));
    }

    function hexOf(b) { b = b.replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; var r = atob(b), o = '', i, h; for (i = 0; i < r.length; i++) { h = r.charCodeAt(i).toString(16); o += h.length < 2 ? '0' + h : h; } return o; }
    function unpackPhoto(ph) {   // индекс с флагом E=2: тип(s|t|S|T) + папка 19 знаков base64url + (хеш 22 знака | '/имя'); иначе путь как есть
      var k = ph.charAt(0), hashForm = idx.E === 2 && (k === 's' || k === 't') && ph.indexOf('/') < 0 && ph.length === 42,
          nameForm = idx.E === 2 && (k === 'S' || k === 'T') && ph.charAt(20) === '/';
      if (hashForm || nameForm) {
        var f = hexOf(ph.slice(1, 20)).slice(0, 28), pre = k.toLowerCase() === 's' ? 'stor' : 'tild', rest = hashForm ? hexOf(ph.slice(20)) : ph.slice(21);
        return pre + f.slice(0, 4) + '-' + f.slice(4, 8) + '-' + f.slice(8, 12) + '-' + f.slice(12, 16) + '-' + f.slice(16) + '/' + rest;
      }
      return ph;
    }
    function uidOf(dx) {
      var u = idx.I ? idx.I[dx] : null;
      if (u == null || !idx.E) return u;   // E>=1: uid в base36
      return u.charAt(0) === '!' ? u.slice(1) : String(parseInt(u, 36));
    }
    function photoUrls(ph) {
      if (!ph) return { photo: '', thumb: '' };
      ph = unpackPhoto(ph);
      var full = idx.U + ph + (/\.[a-z0-9]{3,4}$/i.test(ph) ? '' : '.jpg');
      var cut = full.lastIndexOf('/');
      return { photo: full, thumb: full.slice(0, cut) + '/-/resize/160x/' + full.slice(cut + 1) };
    }
    var PRICE_EDGES = [0, 20000, 50000, 100000, 250000, 500000, 1000000];
    var catCount = new Array(C.length).fill(0), brandCount = new Array(B.length).fill(0);
    P.forEach(function (p) { catCount[p[2]]++; if (p[1] >= 0) brandCount[p[1]]++; });
    var pairN = new Map(); Q.forEach(function (q) { pairN.set(q[0] + ':' + q[1], q[2]); });
    function catLabel(ci) { return G[C[ci][1]] ? G[C[ci][1]] + ' › ' + C[ci][0] : C[ci][0]; }
    function catShort(ci) { return C[ci][0].replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase(); }
    function topCats(n) { return C.map(function (c, i) { return { i: i, name: c[0], path: catLabel(i), n: catCount[i], url: c[2] || '' }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, n); }
    function nameToIdx(list, v) {
      if (typeof v === 'number') return v;
      var l = String(v).toLowerCase();
      for (var i = 0; i < list.length; i++) if ((Array.isArray(list[i]) ? list[i][0] : list[i]).toLowerCase() === l) return i;
      return -2;
    }

    // наш артикул IS… лежит первым в колонке партномеров (индекс v2)
    function skuOf(pr) { var m = pr[6] && /^is[0-9a-f]{10}$/.exec(pr[6].split(' ')[0]); return m ? m[0].toUpperCase() : ''; }
    // адрес карточки: /<сегмент раздела>/tproduct/<uid>-<слог>; без сегмента (индекс v1) адреса нет
    function productUrl(dx) {
      var pr = P[dx], c = C[pr[2]], uid = uidOf(dx);
      if (!uid || !c || !c[3]) return '';
      return '/' + c[3] + '/tproduct/' + uid + '-' + (pr[8] || slugOf(pr[0]));
    }
    function query(q, opts) {
      opts = opts || {};
      var limit = opts.limit == null ? 8 : opts.limit, offset = opts.offset || 0, prefixMode = opts.prefix !== false;
      var res = { query: q, total: 0, matched: 0, products: [], categories: [], brands: [], queries: [], facets: null, corrected: null, relaxed: null, fallback: null };
      var parsed = parse(String(q || ''), prefixMode), terms = parsed.terms.slice();
      if (!terms.length) {                       // пустой ввод: «популярное» (по числу товаров, журнала запросов нет)
        res.categories = topCats(6);
        res.brands = B.map(function (b, i) { return { i: i, name: b, n: brandCount[i], html: esc(b) }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
        res.queries = Q.slice(0, 6).map(function (x) { return { q: B[x[1]] + ' ' + catShort(x[0]), brand: x[1], cat: x[0], n: x[2], html: esc(B[x[1]] + ' ' + catShort(x[0])) }; });
        res.facets = { total: 0, brands: [], cats: [], price: { min: 0, max: 0, buckets: [] } };
        return res;
      }
      var arrs = terms.map(termArr), idfs = terms.map(termIdf);
      var active = terms.map(function (t, i) { return i; });
      function matchSet(act) {
        var out = [];
        for (var d = 0; d < N; d++) { var ok = true; for (var k = 0; k < act.length; k++) if (!arrs[act[k]][d]) { ok = false; break; } if (ok) out.push(d); }
        return out;
      }
      var M = matchSet(active), dropped = [];
      if (!M.length && active.length > 1) {
        // мягкий откат: сначала слова, которых нет в словаре, потом — то слово, без которого остаётся больше всего товаров
        active = active.filter(function (i) { if (idfs[i] < 0) { dropped.push(terms[i].text); return false; } return true; });
        M = active.length ? matchSet(active) : [];
        while (!M.length && active.length > 1) {
          var bestI = -1, bestM = null;
          for (var a = 0; a < active.length; a++) {
            var trial = active.filter(function (x, j) { return j !== a; }), mm = matchSet(trial);
            if (!bestM || mm.length > bestM.length || (mm.length === bestM.length && mm.length && idfs[active[a]] < idfs[active[bestI]])) { bestM = mm; bestI = a; }
          }
          dropped.push(terms[active[bestI]].text);
          active.splice(bestI, 1); M = bestM;
        }
        if (dropped.length && M.length) res.relaxed = { dropped: dropped, kept: active.map(function (i) { return terms[i].text; }) };
      } else if (!M.length && active.length === 1 && idfs[active[0]] < 0) { /* единственное слово не распознано */ }
      var actTerms = active.map(function (i) { return terms[i]; });
      // исправления
      if (parsed.changes.length) {
        var toTxt = parsed.chunks.slice();
        res.corrected = { from: q, to: parsed.changes.map(function (c) { return c.to; }).join(' '), changes: parsed.changes };
        var repl = parsed.changes.length === parsed.chunks.length ? null : toTxt;   // «to» — полная фраза с заменами
        var phrase = parsed.chunks.map(function (ch) {
          for (var k = 0; k < parsed.changes.length; k++) if (parsed.changes[k].from === ch || (parsed.changes[k].type !== 'layout' && ch.indexOf(parsed.changes[k].from) >= 0)) return parsed.changes[k].type === 'layout' ? parsed.changes[k].to : ch.replace(parsed.changes[k].from, parsed.changes[k].to);
          return ch;
        }).join(' ');
        res.corrected.to = phrase; void repl;
      }
      res.matched = M.length;
      // баллы
      var score = new Float64Array(N), ai;
      for (var m = 0; m < M.length; m++) {
        var dd = M[m], sc = 0;
        for (ai = 0; ai < active.length; ai++) sc += arrs[active[ai]][dd];
        var qty = P[dd][4];
        sc *= 1 + (qty > 0 ? 0.1 : 0) + 0.02 * Math.min(Math.log(1 + qty), 4);
        score[dd] = sc;
      }
      // фильтры и фасеты
      var fb = (opts.brands || []).map(function (v) { return nameToIdx(B, v); }), fc = (opts.cats || []).map(function (v) { return nameToIdx(C, v); });
      var pmin = opts.priceMin == null ? -Infinity : opts.priceMin, pmax = opts.priceMax == null ? Infinity : opts.priceMax, inSt = !!opts.inStock;
      function okB(p) { return !fb.length || fb.indexOf(p[1]) >= 0; }
      function okC(p) { return !fc.length || fc.indexOf(p[2]) >= 0; }
      function okP(p) { return p[3] >= pmin && p[3] <= pmax; }
      var list = [], fBr = new Map(), fCa = new Map(), buckets = new Array(PRICE_EDGES.length).fill(0), pmn = Infinity, pmx = 0, fcount = 0;
      for (m = 0; m < M.length; m++) {
        var dx = M[m], pr = P[dx];
        if (inSt && !(pr[4] > 0)) continue;
        var b1 = okB(pr), c1 = okC(pr), p1 = okP(pr);
        if (c1 && p1 && pr[1] >= 0) fBr.set(pr[1], (fBr.get(pr[1]) || 0) + 1);
        if (b1 && p1) fCa.set(pr[2], (fCa.get(pr[2]) || 0) + 1);
        if (b1 && c1) { var bi2 = 0; while (bi2 + 1 < PRICE_EDGES.length && pr[3] >= PRICE_EDGES[bi2 + 1]) bi2++; buckets[bi2]++; if (pr[3] < pmn) pmn = pr[3]; if (pr[3] > pmx) pmx = pr[3]; }
        if (b1 && c1 && p1) { list.push(dx); fcount++; }
      }
      list.sort(function (a, b) { return score[b] - score[a] || a - b; });
      res.total = fcount;
      res.facets = {
        total: fcount,
        brands: Array.from(fBr).map(function (x) { return { i: x[0], name: B[x[0]], n: x[1] }; }).sort(function (a, b) { return b.n - a.n; }),
        cats: Array.from(fCa).map(function (x) { return { i: x[0], name: C[x[0]][0], n: x[1] }; }).sort(function (a, b) { return b.n - a.n; }),
        price: { min: pmn === Infinity ? 0 : pmn, max: pmx, buckets: buckets.map(function (n, i) { return { lo: PRICE_EDGES[i], hi: i + 1 < PRICE_EDGES.length ? PRICE_EDGES[i + 1] : null, n: n }; }) }
      };
      // подсветка
      var ctx = { words: new Set(), prefs: [], pn: [] };
      actTerms.forEach(function (t) {
        collectWords(t, ctx.words);
        if (t.pn) ctx.pn.push(t.pn);
        (t.parts || [t]).forEach(function (x) { if (x.last && x.text && x.text.length >= 2) ctx.prefs.push(x.text); });
      });
      var out = list.slice(offset, offset + limit);
      res.products = out.map(function (dx) {
        var pr = P[dx], ph = photoUrls(pr[5]);
        return { i: dx, id: uidOf(dx), title: pr[0], html: highlight(pr[0], ctx), brand: pr[1] >= 0 ? B[pr[1]] : '', brandIdx: pr[1],
          cat: C[pr[2]][0], catIdx: pr[2], price: pr[3], qty: pr[4], photo: ph.photo, thumb: ph.thumb, score: Math.round(score[dx] * 100) / 100,
          sku: skuOf(pr), url: productUrl(dx) };
      });
      if (!M.length) { res.fallback = { categories: topCats(6), words: [] }; }
      else if (res.relaxed) res.fallback = { categories: [], words: [] };
      // отдельные блоки подсказок
      var idSet = new Set(); actTerms.forEach(function (t) { collectIds(t, idSet); });
      var catHits = [], brandHits = [];
      if (M.length) {
        var inM = new Map(), inMB = new Map();
        M.forEach(function (dx) { var pr = P[dx]; inM.set(pr[2], (inM.get(pr[2]) || 0) + 1); if (pr[1] >= 0) inMB.set(pr[1], (inMB.get(pr[1]) || 0) + 1); });
        C.forEach(function (c, ci) {
          var hit = 0; catIds[ci].forEach(function (id) { if (idSet.has(id)) hit++; });
          if (hit) catHits.push({ i: ci, name: c[0], path: catLabel(ci), n: inM.get(ci) || 0, hit: hit / catIds[ci].length, url: c[2] || '' });
        });
        B.forEach(function (b, bi) {
          var hit = 0; brandIds[bi].forEach(function (id) { if (idSet.has(id)) hit++; });
          if (hit) brandHits.push({ i: bi, name: b, n: inMB.get(bi) || 0, hit: hit / brandIds[bi].length });
        });
        catHits = catHits.filter(function (c) { return c.n > 0; }).sort(function (a, b) { return b.hit - a.hit || b.n - a.n; });
        brandHits = brandHits.filter(function (c) { return c.n > 0; }).sort(function (a, b) { return b.hit - a.hit || b.n - a.n; });
        var cat2 = catHits.slice(0, 5);
        if (cat2.length < 3) res.facets.cats.forEach(function (c) { if (cat2.length < 5 && !cat2.some(function (x) { return x.i === c.i; })) cat2.push({ i: c.i, name: c.name, path: catLabel(c.i), n: inM.get(c.i) || c.n, url: C[c.i][2] || '' }); });
        res.categories = cat2.map(function (c) { return { i: c.i, name: c.name, path: c.path, n: c.n, url: c.url || '', html: highlight(c.name, ctx), hit: !!c.hit }; });
        res.brands = brandHits.slice(0, 5).map(function (b) { return { i: b.i, name: b.name, n: b.n, html: highlight(b.name, ctx) }; });
        // готовые сочетания бренд + категория
        var qs = [];
        function pushQ(bi, ci, n) { qs.push({ q: B[bi] + ' ' + catShort(ci), brand: bi, cat: ci, n: n, html: esc(B[bi]) + ' ' + esc(catShort(ci)) }); }
        if (brandHits.length && catHits.length) {
          brandHits.slice(0, 2).forEach(function (b) { catHits.slice(0, 3).forEach(function (c) {
            var n = 0; M.forEach(function (dx) { if (P[dx][1] === b.i && P[dx][2] === c.i) n++; });
            if (n) pushQ(b.i, c.i, n);
          }); });
        } else if (brandHits.length) {
          var bsel = brandHits[0].i;
          Q.filter(function (x) { return x[1] === bsel; }).slice(0, 6).forEach(function (x) { pushQ(x[1], x[0], x[2]); });
        } else if (catHits.length) {
          var csel = catHits[0].i;
          Q.filter(function (x) { return x[0] === csel; }).slice(0, 6).forEach(function (x) { pushQ(x[1], x[0], x[2]); });
        }
        qs.sort(function (a, b) { return b.n - a.n; });
        res.queries = qs.slice(0, 6);
      } else {
        // ничего не нашли: ближайшие слова (расстояние до 2) для нераспознанных слов
        var near = [];
        terms.forEach(function (t) {
          if (t.res || t.parts) return;
          var base = isCyr(t.text) ? stem(t.text) : t.text, L = base.length;
          if (L < 4 || /\d/.test(base)) return;
          var pool = isCyr(base) ? plainWords.cyr : plainWords.lat, cand = [];
          pool.forEach(function (id) { var w = words[id]; if (Math.abs(w.length - L) <= 2) { var dd = osa(base, w, 2); if (dd <= 2) cand.push([dd, -df[id], w]); } });
          cand.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
          cand.slice(0, 3).forEach(function (c) { near.push(c[2]); });
        });
        if (res.fallback) res.fallback.words = near;
      }
      return res;
    }
    return { query: query, stats: { products: N, vocabulary: V }, _baseTokens: baseTokens, _prep: prep, _slugOf: slugOf };
  }
  // Быстрые подсказки разделов БЕЗ индекса товаров: list = [[имя, адрес, число товаров], …] (маленький список, зашит в ish-search.js).
  // Слова запроса — начала слов названия раздела; раскладка («yjen»), синонимы («ноут»), хвост слова («мониторы» -> «монитор»).
  function quickCats(list, q, limit) {
    var t = String(q || '').toLowerCase().replace(/ё/g, 'е').trim();
    if (t.length < 2) return [];
    var vars = [t];
    if (/^[a-z0-9 \[\];',.`-]+$/.test(t)) { var sw = swapLayout(t).replace(/ё/g, 'е'); if (sw !== t) vars.push(sw); }
    var out = [];
    list.forEach(function (c) {
      var nw = c[0].toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9]+/).filter(Boolean), best = 0;
      vars.forEach(function (v) {
        var ws = v.split(/\s+/).filter(Boolean), ok = ws.length > 0, sc = 0;
        ws.forEach(function (w) {
          var alts = [w].concat((SYN_RAW[w] || []).map(function (x) { return x.replace('*', ''); })), m = false;
          alts.forEach(function (a) {
            nw.forEach(function (n) {
              if (n.lastIndexOf(a, 0) === 0) m = true;
              else if (a.length >= 5) { for (var k = 1; k <= 2 && a.length - k >= 4; k++) if (n.lastIndexOf(a.slice(0, a.length - k), 0) === 0) m = true; }
            });
          });
          if (m) sc += w.length; else ok = false;
        });
        if (ok && sc > best) best = sc;
      });
      if (best) out.push({ name: c[0], url: c[1], n: c[2], score: best });
    });
    out.sort(function (a, b) { return b.score - a.score || b.n - a.n; });
    return out.slice(0, limit || 3);
  }
  return { createSearch: createSearch, quickCats: quickCats };
});
;
/* iSoft B2B — слой подсказок поиска в шапке (13.10.2026). Склеивается с search.js (движок) сборщиком пакет_собрать.py
 * в один файл ish-search.js. Подключается из блока шапки лениво, при первом фокусе в поле поиска.
 *
 *   ISHSearch.attach(поле, список, { index: 'https://…/search_index2.json?v=…'  | indexData: {…},
 *                                    all: function(q){ return '/katalog?…'; }, log: false })
 *
 * Пока индекс грузится (или не загрузился совсем) работают прежние подсказки шапки (по ДЕРЕВУ разделов) — ничего не ломается.
 * Когда движок готов, слой перерисовывает список после прежнего обработчика и перехватывает Enter без выбранной строки,
 * чтобы уйти в каталог с ИСПРАВЛЕННЫМ запросом (раскладка, опечатки), а не с сырым.
 */
(function (root) {
  'use strict';
  /* подставляет пакет_собрать.py: версия индекса и режим. Режим меняется выкладкой нового файла на хостинг, блок Tilda не трогается:
   *   off  — слой не включается (мгновенный откат);  flag — только у тех, кто открыл сайт с ?ishsearch=1 (запоминается в браузере);  all — у всех */
  var VER = '90566f4e', MODE = 'flag';
  var SECTIONS = [["Мини-ПК","/mini-pk-i-rabochie-stancii",15],["Моноблоки","/monobloki",55],["Ноутбуки","/noutbuki",312],["Системные блоки","/sistemnye-bloki",38],["Кронштейны для мониторов и ТВ","/kronshteyny-i-krepleniya",54],["Мониторы","/monitory",394],["Проекторы","/proektory-i-paneli",24],["Телевизоры","/televizory",48],["Блоки питания","/bloki-pitaniya",275],["Видеокарты","/videokarty",78],["Корпуса","/korpusa-i-bloki-pitaniya",354],["Материнские платы","/materinskie-platy",230],["Оперативная память","/operativnaya-pamyat",138],["Охлаждение","/ohlazhdenie",277],["Процессоры","/processory",110],["SSD-накопители","/ssd-nakopiteli",164],["USB-флешки","/fleshki-i-karty-pamyati",64],["Жёсткие диски","/zhestkie-diski",73],["Карты памяти","/karty-pamyati",44],["ИБП","/ibp-i-zashchita-pitaniya",249],["Серверы","/servery",8],["Системы хранения","/servery-i-shd",42],["Шкафы и стойки","/shkafy-i-stoyki",25],["IP-телефоны","/konferenc-svyaz",25],["Маршрутизаторы (роутеры)","/marshrutizatory",207],["Межсетевые экраны","/mezhsetevye-ekrany",5],["Сетевое оборудование","/setevoe-oborudovanie",474],["Сетевые карты и адаптеры","/setevye-karty",71],["Точки доступа Wi-Fi","/tochki-dostupa",156],["МФУ лазерные цветные","/mfu-lazernye-cvetnye",28],["МФУ струйные цветные","/mfu-struynye-cvetnye",17],["Плоттеры","/plottery",11],["Принтеры и МФУ","/printery-i-mfu",48],["Принтеры лазерные цветные","/printery-lazernye-cvetnye",14],["Принтеры лазерные ч/б","/printery-lazernye-chb",18],["Сканеры документов","/skanery-dokumentov",24],["Гарнитуры для конференц-связи","/garnitury",19],["Клавиатуры","/klaviatury",174],["Мыши","/klaviatury-i-myshi",343],["Наушники","/naushniki",64],["Видеорегистраторы","/videoregistratory",96],["Домофоны","/domofony",47],["Камеры видеонаблюдения","/videonablyudenie",228],["СКУД и турникеты","/skud-i-turnikety",77],["Принтеры этикеток","/printery-etiketok",11],["Сканеры штрихкода","/skanery-shtrihkoda",15],["Терминалы сбора данных","/terminaly-sbora-dannyh",8]];   // [[имя, адрес, число товаров], …] из индекса: разделы показываются сразу, пока грузится индекс товаров
  var SRC = (document.currentScript && document.currentScript.src) || '';
  var BASE = SRC.replace(/[^\/]*(\?.*)?$/, '');
  function включён() {
    if (MODE === 'all') return true;
    if (MODE !== 'flag') return false;
    try {
      if (/[?&]ishsearch=1(&|$)/.test(location.search)) { localStorage.setItem('ishsearch', '1'); return true; }
      if (/[?&]ishsearch=0(&|$)/.test(location.search)) { localStorage.removeItem('ishsearch'); return false; }
      return localStorage.getItem('ishsearch') === '1';
    } catch (e) { return /[?&]ishsearch=1(&|$)/.test(location.search); }
  }
  /* прежний предпоиск Tilda (блок 3584163803, меню .ishsg, position:fixed, z-index 9600) цепляется к полю по тексту подсказки и рисует поверх
     нашего списка свой «Загружаем список товаров» и «Показать все результаты — ещё N». Пока работает наш слой — прячем его целиком;
     не загрузился индекс — стиль снимается, и прежние подсказки возвращаются. */
  var HIDE_OLD = '.ishsg{display:none!important}';
  var CSS = '' +
    '.нш-подсказки.нш-умный{max-height:min(72vh,560px)}' +
    '.нш-гр{padding:8px 10px 4px;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--mut,#6b7080);font-weight:600}' +
    '.нш-испр{padding:8px 10px;font-size:13px;color:var(--mut,#6b7080)}.нш-испр b{color:var(--ink,#171923)}' +
    '.нш-подсказка.нш-раздел b{font-weight:700}' +
    '.нш-подсказка mark,.нш-товар mark{background:rgba(255,196,0,.35);color:inherit;border-radius:3px;padding:0 1px}' +
    '.нш-товар{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:8px;cursor:pointer;text-decoration:none;color:var(--ink,#171923)}' +
    '.нш-товар:hover,.нш-товар.нш-вкл{background:var(--cobalt-soft,#eef2ff)}' +
    '.нш-товар img{width:44px;height:44px;object-fit:contain;flex:none;border-radius:6px;background:#fff}' +
    '.нш-товар .нш-фото-нет{width:44px;height:44px;flex:none;border-radius:6px;background:var(--line,#e6e8ef)}' +
    '.нш-товар .нш-т{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}' +
    '.нш-товар .нш-т b{font-weight:500;font-size:13.5px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '.нш-товар .нш-т i{font-style:normal;font-size:12px;color:var(--mut,#6b7080);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.нш-товар .нш-ц{flex:none;font-weight:700;font-size:14px;white-space:nowrap}' +
    '.нш-пусто{padding:12px 10px;font-size:13.5px;color:var(--mut,#6b7080)}';

  // индекс начинает грузиться сразу при выполнении скрипта (а не на первой букве); attach берёт тот же запрос
  var INDEX_URL = BASE + 'search_index2.json?v=' + VER, prefetch = null;
  function preload(url) {
    if (!prefetch || prefetch.url !== (url || INDEX_URL)) {
      var u = url || INDEX_URL;
      prefetch = { url: u, p: fetch(u, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }) };
      prefetch.p.catch(function () {});
    }
    return prefetch.p;
  }
  try { if (SRC && включён()) preload(); } catch (e) {}

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }

  function attach(input, list, opts) {
    opts = opts || {};
    if (!input || !list || input.__ishSearch) return;
    if (!opts.indexData && !включён()) return;
    input.__ishSearch = true;
    if (!opts.index && !opts.indexData) opts.index = BASE + 'search_index2.json?v=' + VER;
    var S = null, log = opts.log ? function () { try { console.log.apply(console, arguments); } catch (e) {} } : function () {};
    var st = document.createElement('style'); st.textContent = CSS + HIDE_OLD; document.head.appendChild(st);
    var failed = false;

    function ready(idx) {
      try { S = root.createSearch(idx); } catch (e) { log('ish-search: движок не поднялся', e); return; }
      root.ISH_SEARCH_READY = true;
      log('ish-search: готов', S.stats);
      if (document.activeElement === input && input.value.trim().length > 1) render();
    }
    if (opts.indexData) ready(opts.indexData);
    else if (opts.index) {
      preload(opts.index).then(ready).catch(function (e) {
        failed = true; st.textContent = CSS;   // индекс не загрузился: возвращаем прежние подсказки
        log('ish-search: индекс не загрузился, работают прежние подсказки', e);
      });
    }

    function allUrl(q) { return opts.all ? opts.all(q) : '/katalog?q=' + encodeURIComponent(q); }

    function quick(q) {   // индекс ещё грузится: разделы из встроенного списка, строка про загрузку, ссылка «искать в каталоге»
      var cs = []; try { cs = root.ishQuickCats ? root.ishQuickCats(SECTIONS, q, 3) : []; } catch (e) {}
      var h = '';
      if (cs.length) {
        h += '<div class="нш-гр">Разделы</div>';
        cs.forEach(function (c) { h += '<a class="нш-подсказка нш-раздел" href="' + esc(c.url) + '"><b>' + esc(c.name) + '</b><span>' + c.n + '</span></a>'; });
      }
      h += '<div class="нш-пусто">Подбираем товары…</div>';
      h += '<a class="нш-подсказки-низ" href="' + esc(allUrl(q)) + '">Искать «' + esc(q) + '» в каталоге</a>';
      list.innerHTML = h;
      list.classList.add('нш-видно', 'нш-умный');
    }

    function render() {
      var q = input.value.trim();
      if (q.length < 2) return;
      if (!S) { if (!failed) quick(q); return; }
      var r;
      try { r = S.query(q, { limit: 6 }); } catch (e) { log('ish-search: ошибка запроса', e); return; }
      var h = '', shown = (r.corrected && r.corrected.to) || '';
      if (shown) h += '<div class="нш-испр">Показано для «<b>' + esc(shown) + '</b>»</div>';
      var cats = (r.categories || []).filter(function (c) { return c.url && c.n > 0 && c.hit; }).slice(0, 3);   // только разделы, чьё название совпало со словами запроса
      if (cats.length) {
        h += '<div class="нш-гр">Разделы</div>';
        cats.forEach(function (c) {
          h += '<a class="нш-подсказка нш-раздел" href="' + esc(c.url) + '"><b>' + (c.html || esc(c.name)) + '</b><span>' + esc(c.path.split(' › ')[0] === c.name ? '' : c.path.split(' › ')[0] + ' · ') + c.n + '</span></a>';
        });
      }
      if (r.products && r.products.length) {
        h += '<div class="нш-гр">Товары</div>';
        r.products.forEach(function (p) {
          var img = p.thumb ? '<img loading="lazy" alt="" src="' + esc(p.thumb) + '" onerror="this.onerror=null;this.src=\'' + esc(p.photo) + '\'">' : '<span class="нш-фото-нет"></span>';
          h += '<a class="нш-товар" href="' + esc(p.url || allUrl(p.title)) + '">' + img +
               '<span class="нш-т"><b>' + p.html + '</b><i>' + (p.sku ? esc(p.sku) + ' · ' : '') + esc(p.brand || p.cat) + '</i></span>' +
               '<span class="нш-ц">' + money(p.price) + '</span></a>';
        });
      } else if (!cats.length) {
        h += '<div class="нш-пусто">Ничего не нашли по «' + esc(q) + '».' +
             (r.fallback && r.fallback.words && r.fallback.words.length ? ' Возможно: ' + r.fallback.words.map(esc).join(', ') + '.' : '') + '</div>';
        (r.fallback && r.fallback.categories || []).filter(function (c) { return c.url; }).slice(0, 4).forEach(function (c) {
          h += '<a class="нш-подсказка нш-раздел" href="' + esc(c.url) + '"><b>' + esc(c.name) + '</b><span>' + c.n + '</span></a>';
        });
      }
      var total = r.total || 0;
      h += '<a class="нш-подсказки-низ" href="' + esc(allUrl(shown || q)) + '">' +
           (total ? 'Показать все результаты (' + total + ') по «' + esc(shown || q) + '»' : 'Искать «' + esc(q) + '» в каталоге') + '</a>';
      list.innerHTML = h;
      list.classList.add('нш-видно', 'нш-умный');
    }

    // после прежнего обработчика input: он выставил свой список, мы его заменяем
    input.addEventListener('input', render);
    input.addEventListener('focus', function () { if (input.value.trim().length > 1) render(); });
    // Enter без выбранной строки: уходим с исправленным запросом
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !S) return;
      if (list.querySelector('.нш-вкл')) return;          // выбрана строка — прежний обработчик перейдёт по ссылке
      var q = input.value.trim(); if (!q) return;
      var r; try { r = S.query(q, { limit: 1 }); } catch (err) { return; }
      var to = (r.corrected && r.corrected.to) || q;
      e.preventDefault(); e.stopImmediatePropagation();
      window.location.assign(allUrl(to));
    }, true);
  }
  root.ISHSearch = { attach: attach };
})(typeof window !== 'undefined' ? window : this);
