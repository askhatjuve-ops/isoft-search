/*
 * Поиск для интернет-магазина (прототип). Один файл, без зависимостей, ES2017.
 *   var S = createSearch(indexJson);          // indexJson — объект из search_index.json
 *   var r = S.query('asus ноутбук', {limit: 8, brands: ['ASUS'], priceMax: 500000});
 *   r = { total, matched, products[], categories[], brands[], queries[], facets{}, corrected, relaxed, fallback }
 * Нормализация токенов (prep/tokenize) обязана совпадать с build_index.py (проверяет test_queries.js).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { var f = factory(); root.createSearch = f.createSearch; root.ishQuickCats = f.quickCats; root.ishParsePrice = f.parsePrice; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Порядок выдачи: true — внутри уровня релевантности сначала дешёвые (Асхат 13.10); false — прежний (по баллам). Откат одной правкой.
  var SORT_CHEAP_FIRST = true;

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
    else if ((m = /^(\d{3,4})x(\d{3,4})$/.exec(tok))) f.push(m[1], m[2]);      // 14.10: разрешение «2560x1440» -> 2560 и 1440 (как из характеристики «2560×1440»)
    return f;
  }
  // склейки «wi-fi» -> wifi, «tp-link» -> tplink, «m.2» -> m2; 16.10: цепочка из трёх букв-частей «plug-and-play» -> plugandplay (и plugand, как было у пары)
  function joins(p) {
    var re = /(^|[^a-zа-я0-9])([a-z]{1,5})(?:[-.]([a-z]{1,6}))?[-.]([a-z0-9]{1,5})(?![a-zа-я0-9])/g, m, out = [];
    while ((m = re.exec(p))) {
      if (m[3] !== undefined) { out.push(m[2] + m[3]); out.push(m[2] + m[3] + m[4]); }
      else out.push(m[2] + m[4]);
    }
    return out;
  }
  // 16.10: слитное написание из РАЗДЕЛЬНЫХ слов («wi fi» -> wifi, «type c» -> typec, «plug and play»): возвращает склейки соседних токенов 2-3 шт.,
  // которые есть в словаре как самостоятельное слово (known). Части - латинские буквы (последняя может быть 1-2 цифры: «rj 45»), длина склейки от 4:
  // «hp e» не даёт hpe, а «usb c» даёт usbc, только если usbc где-то в каталоге уже есть словом.
  function spaceJoins(toks, known) {
    var out = [], n = toks.length, i, k, j, w, ok;
    for (i = 0; i + 1 < n; i++) {
      if (!/^[a-z]+$/.test(toks[i])) continue;
      w = toks[i];
      for (k = 1; k <= 2 && i + k < n; k++) {
        var t = toks[i + k];
        ok = /^[a-z]+$/.test(t) || (k === 1 && /^\d{1,2}$/.test(t));
        if (!ok) break;
        w += t;
        if (w.length >= 4 && known.has(w)) out.push(w);
        if (!/^[a-z]+$/.test(t)) break;
      }
    }
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
    'патч-корд': ['патч*', 'корд*'], 'патч-корды': ['патч*', 'корд*'], 'патч-панель': ['патч*', 'панел*'], 'скс': ['utp', 'ftp', 'патч*', 'rj45', 'keystone', 'витая*'], 'sks': ['utp', 'ftp', 'патч*', 'rj45', 'keystone'], 'витая': ['utp', 'ftp'], 'пара': ['utp', 'ftp'], 'патчкорд': ['патч*', 'корд*'], 'патч': ['патч*'], 'нвме': ['nvme', 'm2'], 'usbc': ['typec'], 'typec': ['usbc'], 'интернет': []
  };
  var STOP = {};
  ('для и в на с по от к у из the a for купить цена цены цену недорого дешево магазин алматы астана казахстан интернет заказать оптом kz or of').split(' ')
    .forEach(function (w) { STOP[w] = 1; });


  // ---------- 14.10: разбор запроса (только со стороны запроса, индекс не затрагивает; паритет с build_index не нарушается) ----------
  // «1 терабайт» -> «1 тб», «27-дюймовый» -> «27 дюймовый», «1920х1080» -> «1920x1080», «ватт» -> «вт»
  function qnorm(s) {
    return String(s)
      .replace(/(\d)\s*[-‑]\s*(?=дюйм)/g, '$1 ')
      .replace(/(\d)\s*тера\s?байт[а-я]*/g, '$1 тб').replace(/(\d)\s*гига\s?байт[а-я]*/g, '$1 гб').replace(/(\d)\s*мега\s?байт[а-я]*/g, '$1 мб')
      .replace(/(\d)\s*тбайт[а-я]*/g, '$1 тб')
      .replace(/(\d)\s*мега\s?герц[а-я]*/g, '$1 мгц').replace(/(\d)\s*гига\s?герц[а-я]*/g, '$1 ггц').replace(/(\d)\s*герц[а-я]*/g, '$1 гц')
      .replace(/(\d)\s*ватт[а-я]*/g, '$1 вт').replace(/(\d)\s*мега\s?пиксел[а-я]*/g, '$1 мп')
      .replace(/(\d{3,4})\s*[хx×*]\s*(\d{3,4})/g, '$1x$2');
  }
  // Цена в тексте запроса: «до 300000», «до 300 тыс», «до 300к», «дешевле 1.5 млн», «от 100000 до 200000», «100-200 тыс», «дороже 50000».
  // Число с единицей измерения («до 32 гб», «от 6000 мгц») — не цена; цена не меньше 1000 ₸. Возвращает { text: запрос без фразы цены, price: {min,max,label}|null }
  var P_NUM = '(\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d+(?:[.,]\\d+)?)', P_SUF = '(тыс(?:яч[а-я]*)?\\.?|к|k|млн\\.?|миллион[а-я]*|тг\\.?|тенге|₸|т(?![a-zа-я]))?';
  var P_TAIL = '(?![a-zа-я0-9"″])(?!\\s*(?:гб|тб|мб|гбайт|тбайт|мгц|ггц|гц|вт|мп|mhz|ghz|gb|tb|mb|hz|w(?![a-z])|mp|дюйм|"|″|inch|in(?![a-z])|мм|см|ват|ач|mah|мач|ядер|шт|штук|порт|ом|дб))';
  var RE_PMAX = new RegExp('(^|\\s)(?:до|дешевле|не дороже|не более|не больше|меньше|максимум|макс\\.?|<=?)\\s*' + P_NUM + '\\s*' + P_SUF + P_TAIL);
  var RE_PMIN = new RegExp('(^|\\s)(?:от|дороже|не дешевле|не менее|не меньше|минимум|мин\\.?|>=?)\\s*' + P_NUM + '\\s*' + P_SUF + P_TAIL);
  var RE_PRNG = new RegExp('(^|\\s)(от\\s*)?' + P_NUM + '\\s*' + P_SUF + '\\s*(?:до|-|–|—)\\s*' + P_NUM + '\\s*' + P_SUF + P_TAIL);
  function priceVal(n, suf) {
    var v = parseFloat(String(n).replace(/[  ]/g, '').replace(',', '.'));
    if (!isFinite(v)) return NaN;
    var m = 1; if (suf) { if (/^(тыс|к$|k$)/.test(suf)) m = 1000; else if (/^(млн|миллион)/.test(suf)) m = 1e6; }
    return Math.round(v * m);
  }
  function fmtMoney(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
  function parsePriceQuery(q) {
    var t = String(q == null ? '' : q).toLowerCase().replace(/ё/g, 'е'), m, lo = null, hi = null, cut = null;
    if ((m = RE_PRNG.exec(t))) {
      var s2 = m[6] || '', s1 = m[4] || s2, a = priceVal(m[3], s1), b = priceVal(m[5], s2);
      var keyOk = !!m[2] || !!m[6] || (a >= 10000 && b >= 10000);
      if (keyOk && a >= 1000 && b >= a) { lo = a; hi = b; cut = m; }
    }
    if (!cut && (m = RE_PMAX.exec(t))) { var v = priceVal(m[2], m[3]); if (v >= 1000) { hi = v; cut = m; } }
    if (!cut && (m = RE_PMIN.exec(t))) { var v2 = priceVal(m[2], m[3]); if (v2 >= 1000) { lo = v2; cut = m; } }
    if (!cut) return { text: t, price: null };
    var text = (t.slice(0, cut.index) + ' ' + t.slice(cut.index + cut[0].length)).replace(/\s+/g, ' ').trim();
    var label = lo != null && hi != null ? fmtMoney(lo) + ' – ' + fmtMoney(hi) : hi != null ? 'до ' + fmtMoney(hi) : 'от ' + fmtMoney(lo);
    return { text: text, price: { min: lo, max: hi, label: label } };
  }

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
    var P = idx.P, B = idx.B, C = idx.C, G = idx.G || [], Q = idx.Q || [], N = P.length, A = idx.A || [];   // A: [[имя признака, [значения]], …]; у товара P[i][9] = [признак, значение, …]
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

    // 16.10: слова, которые встречаются в каталоге самостоятельно (токены названий и склейки через дефис) - по ним решаем, склеивать ли «wi fi» в wifi
    var known = new Set(), ppAll = new Array(N), tokAll = new Array(N);
    for (var kd = 0; kd < N; kd++) {
      var kp = prep(P[kd][0]), kt = tokenize(kp), kj = joins(kp), ki;
      ppAll[kd] = kp; tokAll[kd] = kt;
      for (ki = 0; ki < kt.length; ki++) known.add(kt[ki]);
      for (ki = 0; ki < kj.length; ki++) known.add(kj[ki]);
    }
    var lnorm = new Float32Array(N), pnList = new Array(N);
    for (var d = 0; d < N; d++) {
      var p = P[d], pp = ppAll[d], toks = tokAll[d], seen = new Set(), first = new Set(), seenAll = new Set(), i, j;
      for (i = 0; i < toks.length; i++) {
        var fs = forms(toks[i]);
        for (j = 0; j < fs.length; j++) {
          var id = wid(fs[j]);
          if (!seen.has(id)) { seen.add(id); push(pt, id, d); seenAll.add(id); }
          if (i < 3 && !first.has(id)) { first.add(id); push(pf, id, d); }
        }
      }
      var jn = joins(pp).concat(spaceJoins(toks, known));
      for (i = 0; i < jn.length; i++) { var jid = wid(jn[i]); if (!seen.has(jid)) { seen.add(jid); push(pt, jid, d); seenAll.add(jid); } }
      if (p[1] >= 0) brandIds[p[1]].forEach(function (id) { push(pb, id, d); seenAll.add(id); });
      catIds[p[2]].forEach(function (id) { push(pc, id, d); seenAll.add(id); });
      if (p[7]) {
        var sp = p[7].split(' '), sseen = new Set();
        sp = sp.concat(spaceJoins(sp, known));      // 16.10: «wi fi» в характеристиках -> и wifi
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
    // слова как пишут люди (названия товаров, бренды, разделы) — для дописывания слова в подсказке: «ноут» -> «ноутбук»
    var surf = new Map();
    function addSurf(text, w) { var m = String(text).toLowerCase().replace(/ё/g, 'е').match(/[a-zа-я]{3,}/g); if (m) for (var i = 0; i < m.length; i++) surf.set(m[i], (surf.get(m[i]) || 0) + w); }
    for (var sd = 0; sd < N; sd++) addSurf(P[sd][0], 1);
    B.forEach(function (b) { addSurf(b, 20); }); C.forEach(function (c) { addSurf(c[0], 20); });
    var surfKeys = Array.from(surf.keys()).filter(function (k) { return surf.get(k) >= 3; }).sort();
    // признаки: пары (признак, значение) у товаров, нумерация значений внутри признака
    var prAttr = new Array(N);
    for (var ad = 0; ad < N; ad++) { var ap = P[ad][9]; prAttr[ad] = ap && ap.length ? ap : null; }
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
    function parse(q, prefixMode, raw) {
      var s = ramSsd(prep(qnorm(q))), endsSpace = /\s$/.test(q), chunks = s.split(/\s+/).filter(Boolean), cr = [], changes = [];
      for (var i = 0; i < chunks.length; i++) {
        var ch = chunks[i], last = prefixMode && !endsSpace && i === chunks.length - 1;
        var isUnit = UNITS[ch] || /^\d+(p\d+)?$/.test(ch);
        var a = chunkResult(ch, last, false), chosen = a, swapped = null;
        if (!raw && !a.ok && !isUnit && ch.length >= 3 && /[a-zа-я]/.test(ch)) {
          swapped = swapLayout(ch);
          var b = chunkResult(swapped, last, false);
          if (b.ok && b.parts.length) { chosen = b; chosen.layout = ch; }
        }
        if (!chosen.ok && !raw) {
          var a2 = chunkResult(ch, last, true);
          if (a2.ok) chosen = a2;
          else if (swapped) { var b2 = chunkResult(swapped, last, true); if (b2.ok && b2.parts.length) { chosen = b2; chosen.layout = ch; } }
        }
        chosen.lastChunk = last; cr.push(chosen);
      }
      // 16.10 (составное слово): «wi-fi», «wi fi» и «wifi» - одно слово. Кусок с дефисом/точкой и соседние слова из букв получают вторую форму - слитную
      // (wifi, typec, plugandplay, rj45), если она есть в словаре; выдача = части вместе ИЛИ слитное слово (объединение, а не пересечение).
      function plainParts(c) { return c.parts.filter(function (x) { return !x.stop; }); }
      for (i = 0; i < cr.length; i++) {
        var cc0 = cr[i];
        if (cc0.layout || cc0.merged || cc0.alt || !/^[a-z]+(?:[-.][a-z]+)*[-.][a-z0-9]+$/.test(cc0.ch)) continue;
        var jw = cc0.ch.replace(/[-.]/g, '');
        if (jw.length >= 2 && plainParts(cc0).length > 1) { var jr = resolveToken(jw, !!cc0.lastChunk, false); if (jr && jr.exact) cc0.alt = { text: jw, res: jr }; }
      }
      for (i = 0; i + 1 < cr.length; i++) {
        for (var jspan = 3; jspan >= 2; jspan--) {
          if (i + jspan > cr.length) continue;
          var seg = cr.slice(i, i + jspan), okSeg = true, jw2 = '';
          seg.forEach(function (x, ix) {
            var one = !x.layout && !x.merged && !x.alt && !x.pn && x.parts.length === 1 && !x.parts[0].stop;
            if (!(one && (/^[a-z]+$/.test(x.ch) || (ix === 1 && jspan === 2 && /^\d{1,2}$/.test(x.ch))))) okSeg = false;
            jw2 += x.ch;
          });
          if (!okSeg || jw2.length < 4) continue;
          var jr2 = resolveToken(jw2, !!seg[seg.length - 1].lastChunk, false);
          if (jr2 && jr2.exact) {
            var parts2 = []; seg.forEach(function (x) { parts2 = parts2.concat(x.parts); });
            cr.splice(i, jspan, { ch: seg.map(function (x) { return x.ch; }).join(' '), parts: parts2, pn: null, ok: true, alt: { text: jw2, res: jr2 }, exactAll: false, lastChunk: seg[seg.length - 1].lastChunk });
            break;
          }
        }
      }
      // 16.10 (аудит, поиск с дефисом): «i7 14650HX» и «i7-14650HX» - один запрос. Дефис держал два слова одним куском, и этот кусок получал
      // партномерный балл (compact = i714650hx) у карточек, где в названии модель с дефисом; с пробелом баллом обделялись ровно они, и порядок
      // выдачи расходился. Теперь два соседних куска запроса, в каждом из которых есть цифра, склеиваются так же, как склеил бы дефис, - но только
      // если такой партномер есть в индексе (pnArr), так что «16 гб 512 гб» и подобное не затрагивается.
      for (i = 0; i + 1 < cr.length; i++) {
        if (cr[i].merged || cr[i + 1].merged || !/\d/.test(cr[i].ch) || !/\d/.test(cr[i + 1].ch)) continue;
        var c2 = compact(cr[i].ch + cr[i + 1].ch);
        if (/[a-z]/.test(c2) && pnEligible(c2) && pnArr(c2)) {
          cr.splice(i, 2, { ch: cr[i].ch + ' ' + cr[i + 1].ch, parts: cr[i].parts.concat(cr[i + 1].parts), pn: c2, ok: true, merged: true, exactAll: false });
        }
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
        if (c.alt && subs.length > 1) terms.push({ text: c.ch, parts: subs, pn: c.pn || undefined, alt: c.alt });
        else if (c.pn && (subs.length > 1 || !subs[0].res)) terms.push({ text: c.ch, parts: subs, pn: c.pn });
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
      if (t.alt) {      // слитное написание: балл выравниваем под сумму частей, чтобы «WIFI» не проигрывал «Wi-Fi» только из-за числа слов
        var aa = altArr(t.alt.res.alts), pi = 0, ai2 = termIdf({ res: t.alt.res }), f = 1, ee;
        t.parts.forEach(function (x) { pi += Math.max(0, termIdf(x)); });
        if (ai2 > 0 && pi > ai2) f = Math.min(3, 0.95 * pi / ai2);
        for (ee = 0; ee < N; ee++) { var av = aa[ee] * f; if (av > arr[ee]) arr[ee] = av; }
      }
      if (t.pn) { var pa = pnArr(t.pn); if (pa) for (var e = 0; e < N; e++) if (pa[e] > arr[e]) arr[e] = pa[e]; }
      return arr;
    }
    function termIdf(t) {
      if (t.parts) { var m = 0; t.parts.forEach(function (x) { m = Math.max(m, termIdf(x)); }); if (t.alt) m = Math.max(m, termIdf({ res: t.alt.res })); return m; }
      if (!t.res) return -1;
      var mx = 0; t.res.alts.forEach(function (a) { var v = idfArr[a.id] * a.w; if (v > mx) mx = v; }); return mx;
    }
    function collectIds(t, set) { if (t.alt) t.alt.res.alts.forEach(function (a) { set.add(a.id); }); if (t.parts) t.parts.forEach(function (x) { collectIds(x, set); }); else if (t.res) t.res.alts.forEach(function (a) { set.add(a.id); }); }
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
    // 20.10: пары «подпись/значение» для строки карточки в выдаче. P[10] = [номер подписи в idx.L, значение, ...] (до 5, правила строки раздела);
    // нет P[10] (старый индекс) - запасной путь из P[9] (признаки фильтров): линейка процессора, память, накопитель, ОС, диагональ.
    var LBL = idx.L || [], SPEC_FB = { 'Линейка процессора': ['Процессор', 1], 'Оперативная память': ['Оперативная память', 2], 'Накопитель': ['Накопитель', 3], 'Операционная система': ['Операционная система', 4], 'Диагональ': ['Диагональ', 5], 'Разрешение': ['Разрешение', 6], 'Частота обновления': ['Частота обновления', 7] };
    function specsOf(pr) {
      var a = pr[10], o = [], k;
      if (a && a.length) { for (k = 0; k + 1 < a.length; k += 2) if (LBL[a[k]]) o.push([LBL[a[k]], String(a[k + 1])]); return o; }
      a = pr[9];
      if (!a || !a.length || !A.length) return o;
      var t = [];
      for (k = 0; k + 1 < a.length; k += 2) { var at = A[a[k]], f = at && SPEC_FB[at[0]]; if (f) t.push([f[1], f[0], at[1][a[k + 1]]]); }
      t.sort(function (x, y) { return x[0] - y[0]; });
      return t.slice(0, 5).map(function (x) { return [x[1], String(x[2])]; });
    }
    function skuOf(pr) { var m = pr[6] && /^is[0-9a-f]{10}$/.exec(pr[6].split(' ')[0]); return m ? m[0].toUpperCase() : ''; }
    // адрес карточки: /<сегмент раздела>/tproduct/<uid>-<слог>; без сегмента (индекс v1) адреса нет
    function productUrl(dx) {
      var pr = P[dx], c = C[pr[2]], uid = uidOf(dx);
      if (!uid || !c || !c[3]) return '';
      return '/' + c[3] + '/tproduct/' + uid + '-' + (pr[8] || slugOf(pr[0]));
    }
    // быстрые фильтры по характеристикам: какие признаки показать для текущей выдачи (покрытие, разнообразие значений, порядок из индекса)
    function attrGroups(aCnt, aSize, aCov, fa, maxGroups, fcount) {
      var out = [];
      for (var a = 0; a < A.length; a++) {
        var sel = fa[a] || null, size = aSize[a], cov = aCov[a];
        if (!size) continue;
        var vals = [], mx = 0, tot = 0;
        aCnt[a].forEach(function (n, v) { vals.push({ i: v, name: A[a][1][v], n: n, on: !!(sel && sel[v]) }); tot += n; if (n > mx) mx = n; });
        if (sel) Object.keys(sel).forEach(function (v) { if (!aCnt[a].has(+v)) vals.push({ i: +v, name: A[a][1][+v], n: 0, on: true }); });
        if (!sel && (vals.length < 2 || size < 6 || cov / size < 0.35 || mx / tot > 0.9)) continue;
        var score = (cov / size) * (1 - 0.5 * (tot ? mx / tot : 1)) + 0.3 * (1 - a / A.length) + (sel ? 2 : 0);
        vals.sort(function (x, y) { return (y.on - x.on) || y.n - x.n || x.i - y.i; });
        var keep = vals.slice(0, 14).sort(function (x, y) { return x.i - y.i; });
        out.push({ i: a, name: A[a][0], n: cov, size: size, selected: !!sel, score: score, values: keep, more: Math.max(0, vals.length - keep.length) });
      }
      out.sort(function (x, y) { return y.score - x.score; });
      var RED = { 'Размер экрана': 'Диагональ', 'Тип накопителя': 'Накопитель' };   // «второй» признак дублирует «первый» — не показываем оба
      out = out.filter(function (g) { return g.selected || !RED[g.name] || !out.some(function (h) { return h.name === RED[g.name]; }); });
      var sels = out.filter(function (g) { return g.selected; }), rest = out.filter(function (g) { return !g.selected; });
      return sels.concat(rest.slice(0, Math.max(0, maxGroups - sels.length))).sort(function (x, y) { return y.score - x.score; });
    }
    function query(q, opts) {
      opts = opts || {};
      var limit = opts.limit == null ? 8 : opts.limit, offset = opts.offset || 0, prefixMode = opts.prefix !== false;
      var res = { query: q, total: 0, matched: 0, products: [], categories: [], brands: [], queries: [], facets: null, corrected: null, relaxed: null, fallback: null, completions: [], price: null, suggestion: null };
      var raw = !!opts.raw, pq = raw ? { text: String(q || ''), price: null } : parsePriceQuery(q);
      res.price = pq.price;                       // фраза цены из запроса («до 300000») — убрана из текста и применяется как фильтр, если цену не задали явно
      var parsed = parse(pq.text, prefixMode, raw), terms = parsed.terms.slice();
      if (!terms.length) {                       // пустой ввод: «популярное» (по числу товаров, журнала запросов нет)
        res.categories = topCats(6);
        res.brands = B.map(function (b, i) { return { i: i, name: b, n: brandCount[i], html: esc(b) }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
        res.queries = Q.slice(0, 6).map(function (x) { return { q: B[x[1]] + ' ' + catShort(x[0]), brand: x[1], cat: x[0], n: x[2], html: esc(B[x[1]] + ' ' + catShort(x[0])) }; });
        res.facets = { total: 0, brands: [], cats: [], attrs: [], price: { min: 0, max: 0, buckets: [] } };
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
      if (parsed.changes.length && !raw) {
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
      var pmin = opts.priceMin == null ? -Infinity : opts.priceMin, pmax = opts.priceMax == null ? Infinity : opts.priceMax, inSt = !!opts.inStock || opts.stock === 'in', outSt = opts.stock === 'out';   // stock: 'in' | 'out' (14.10)
      if (res.price && !opts.ignoreQueryPrice && opts.priceMin == null && opts.priceMax == null) {            // цена из текста запроса — по умолчанию (явные границы страницы важнее)
        if (res.price.min != null) pmin = res.price.min;
        if (res.price.max != null) pmax = res.price.max;
        res.price.applied = true;
      } else if (res.price) res.price.applied = false;
      // признаки (фасеты по характеристикам): opts.attrs = { 'Диагональ': ['27"', '32"'], 0: [3] } — имя или номер признака, значения именем или номером
      var fa = {}, faN = 0;
      if (opts.attrs && A.length) Object.keys(opts.attrs).forEach(function (k) {
        var ai = /^\d+$/.test(k) ? +k : -1;
        if (ai < 0) for (var x = 0; x < A.length; x++) if (A[x][0].toLowerCase() === String(k).toLowerCase()) { ai = x; break; }
        if (ai < 0 || ai >= A.length) return;
        var set = {}, n = 0;
        [].concat(opts.attrs[k]).forEach(function (v) {
          var vi = typeof v === 'number' ? v : A[ai][1].indexOf(v);
          if (vi >= 0) { set[vi] = 1; n++; }
        });
        if (n) { fa[ai] = set; faN++; }
      });
      var faKeys = Object.keys(fa).map(Number);
      function okB(p) { return !fb.length || fb.indexOf(p[1]) >= 0; }
      function okC(p) { return !fc.length || fc.indexOf(p[2]) >= 0; }
      function okP(p) { return p[3] >= pmin && p[3] <= pmax; }
      var wantAttrs = A.length && opts.attrFacets !== false;
      var aCnt = [], aSize = [], aCov = [];
      if (wantAttrs) for (var an = 0; an < A.length; an++) { aCnt.push(new Map()); aSize.push(0); aCov.push(0); }
      var list = [], fBr = new Map(), fCa = new Map(), buckets = new Array(PRICE_EDGES.length).fill(0), pmn = Infinity, pmx = 0, fcount = 0, stockYes = 0, stockNo = 0;
      for (m = 0; m < M.length; m++) {
        var dx = M[m], pr = P[dx];
        if (pr[4] > 0) stockYes++; else stockNo++;
        if ((inSt && !(pr[4] > 0)) || (outSt && pr[4] > 0)) continue;
        var b1 = okB(pr), c1 = okC(pr), p1 = okP(pr), at = prAttr[dx], am = 0, ama = -1;
        for (var fk2 = 0; fk2 < faKeys.length; fk2++) {            // сколько выбранных признаков товар НЕ проходит и какой именно (для счётчиков «без собственного признака»)
          var fai = faKeys[fk2], okA = false;
          if (at) for (var q2 = 0; q2 < at.length; q2 += 2) if (at[q2] === fai && fa[fai][at[q2 + 1]]) { okA = true; break; }
          if (!okA) { am++; ama = fai; }
        }
        var a0 = am === 0;
        if (c1 && p1 && a0 && pr[1] >= 0) fBr.set(pr[1], (fBr.get(pr[1]) || 0) + 1);
        if (b1 && p1 && a0) fCa.set(pr[2], (fCa.get(pr[2]) || 0) + 1);
        if (b1 && c1 && a0) { var bi2 = 0; while (bi2 + 1 < PRICE_EDGES.length && pr[3] >= PRICE_EDGES[bi2 + 1]) bi2++; buckets[bi2]++; if (pr[3] < pmn) pmn = pr[3]; if (pr[3] > pmx) pmx = pr[3]; }
        if (wantAttrs && b1 && c1 && p1 && am <= 1) {
          for (var an2 = 0; an2 < A.length; an2++) if (am === 0 || ama === an2) aSize[an2]++;
          if (at) for (var q3 = 0; q3 < at.length; q3 += 2) { var ax = at[q3]; if (am === 0 || ama === ax) { aCov[ax]++; aCnt[ax].set(at[q3 + 1], (aCnt[ax].get(at[q3 + 1]) || 0) + 1); } }
        }
        if (b1 && c1 && p1 && a0) { list.push(dx); fcount++; }
      }
      if (SORT_CHEAP_FIRST && list.length > 1) {
        // «сначала дешёвые» внутри уровня релевантности (13.10). Уровни: 0 точный артикул; 1 раздел совпал с запросом
        // (если такой есть, иначе — балл >= 85% лучшего); 2 сильное совпадение (балл >= 50% лучшего); 3 слабое.
        var idS = new Set(); actTerms.forEach(function (t) { collectIds(t, idS); });
        var cHit = C.map(function (c, ci) { var h = 0; catIds[ci].forEach(function (id) { if (idS.has(id)) h++; }); return catIds[ci].length ? h / catIds[ci].length : 0; });
        var topHit = 0, topSc = 0, li;
        for (li = 0; li < list.length; li++) { var ch = cHit[P[list[li]][2]]; if (ch > topHit) topHit = ch; if (score[list[li]] > topSc) topSc = score[list[li]]; }
        var qc = compact(q), isArt = /^[a-z0-9]{6,}$/.test(qc) && /[0-9]/.test(qc) && /[a-z]/.test(qc);
        var tier = new Map();
        list.forEach(function (dx) {
          var pr = P[dx], t;
          if (isArt && (pr[6] ? pr[6].split(' ') : []).concat(pr[0].split(/\s+/)).some(function (w) { return compact(w) === qc; })) t = 0;
          else if (topHit > 0 ? cHit[pr[2]] >= topHit : score[dx] >= 0.85 * topSc) t = 1;
          else t = score[dx] >= 0.5 * topSc ? 2 : 3;
          tier.set(dx, t);
        });
        list.sort(function (a, b) {
          var ta = tier.get(a), tb = tier.get(b);
          if (ta !== tb) return ta - tb;
          if (ta === 0) return score[b] - score[a] || a - b;
          var pa = P[a][3] > 0 ? P[a][3] : Infinity, pb2 = P[b][3] > 0 ? P[b][3] : Infinity;
          if (pa !== pb2) return pa < pb2 ? -1 : 1;
          return ((P[b][4] > 0) - (P[a][4] > 0)) || score[b] - score[a] || a - b;
        });
      } else list.sort(function (a, b) { return score[b] - score[a] || a - b; });
      // страница результатов (13.10): явная сортировка по цене поверх уровней; цена 0 / нет — всегда в конце
      if ((opts.sort === 'price_asc' || opts.sort === 'price_desc') && list.length > 1) {
        var dsc = opts.sort === 'price_desc';
        list.sort(function (a, b) {
          var pa = P[a][3] > 0 ? P[a][3] : null, pb3 = P[b][3] > 0 ? P[b][3] : null;
          if (pa === null || pb3 === null) { if (pa === pb3) return score[b] - score[a] || a - b; return pa === null ? 1 : -1; }
          if (pa !== pb3) return dsc ? pb3 - pa : pa - pb3;
          return score[b] - score[a] || a - b;
        });
      }
      // 14.10: сортировка по названию (поверх релевантности, без учёта регистра, ё = е)
      if (opts.sort === 'title' && list.length > 1) {
        var tk = function (d) { return P[d][0].toLowerCase().replace(/ё/g, 'е'); };
        list.sort(function (a, b) { var x = tk(a), y = tk(b); return x < y ? -1 : x > y ? 1 : a - b; });
      }
      if (opts.ids) res.ids = list.slice();      // индексы всех совпавших после фильтров и сортировки (без html); products — только страница offset/limit (limit: 0 — без карточек)
      res.total = fcount;
      res.facets = {
        total: fcount,
        brands: Array.from(fBr).map(function (x) { return { i: x[0], name: B[x[0]], n: x[1] }; }).sort(function (a, b) { return b.n - a.n; }),
        cats: Array.from(fCa).map(function (x) { return { i: x[0], name: C[x[0]][0], n: x[1] }; }).sort(function (a, b) { return b.n - a.n; }),
        price: { min: pmn === Infinity ? 0 : pmn, max: pmx, buckets: buckets.map(function (n, i) { return { lo: PRICE_EDGES[i], hi: i + 1 < PRICE_EDGES.length ? PRICE_EDGES[i + 1] : null, n: n }; }) },
        stock: { yes: stockYes, no: stockNo },     // сколько совпавших «в наличии» (qty>0) и нет; no = 0 -> фильтр «в наличии» не нужен
        attrs: wantAttrs ? attrGroups(aCnt, aSize, aCov, fa, opts.attrGroups == null ? 4 : opts.attrGroups, fcount) : []
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
          sku: skuOf(pr), url: productUrl(dx), specs: specsOf(pr) };
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
        var near = [], bestFor = {};
        terms.forEach(function (t) {
          if (t.res || t.parts) return;
          var base = isCyr(t.text) ? stem(t.text) : t.text, L = base.length;
          if (L < 4 || /\d/.test(base)) return;
          var pool = isCyr(base) ? plainWords.cyr : plainWords.lat, cand = [];
          pool.forEach(function (id) { var w = words[id]; if (Math.abs(w.length - L) <= 2) { var dd = osa(base, w, 2); if (dd <= 2) cand.push([dd, -df[id], w]); } });
          cand.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
          cand.filter(function (c) { return c[0] <= (L >= 8 ? 2 : 1); }).slice(0, 3).forEach(function (c) { var sw = surfaceOf(c[2]); if (near.indexOf(sw) < 0) near.push(sw); });
          if (cand.length && cand[0][0] <= (L >= 8 ? 2 : 1)) bestFor[t.text] = surfaceOf(cand[0][2]); else bestFor[t.text] = null;
        });
        if (res.fallback) res.fallback.words = near;
        // «Возможно, вы искали»: целая фраза с подставленными ближайшими словами, если по ней что-то находится
        var bfKeys = Object.keys(bestFor), bfOk = bfKeys.length > 0 && bfKeys.every(function (k) { return bestFor[k]; });
        if (!opts.noSuggest && bfOk) {
          var sph = parsed.chunks.map(function (ch) { return bestFor[ch] || ch; }).join(' ');
          if (sph !== parsed.chunks.join(' ')) { var sr = query(sph, { limit: 0, noSuggest: true, completions: false, attrFacets: false }); if (sr.total > 0) res.suggestion = { q: sph, total: sr.total }; }
        }
      }
      if (prefixMode && !raw && !res.price && opts.completions !== false) res.completions = completionsFor(pq.text);
      return res;
    }
    // слово индекса (у русских — основа без окончания) -> самое частое полное написание из названий: «жестк» -> «жесткий»
    function surfaceOf(w) {
      var lo = 0, hi = surfKeys.length;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (surfKeys[mid] < w) lo = mid + 1; else hi = mid; }
      var best = null, bn = 0;
      for (var i = lo; i < surfKeys.length && surfKeys[i].lastIndexOf(w, 0) === 0 && i < lo + 80; i++) { var n = surf.get(surfKeys[i]); if (n > bn) { bn = n; best = surfKeys[i]; } }
      return best || w;
    }
    // дописывание последнего слова: «asus ro» -> «asus rog», «ноут» -> «ноутбук»
    function completionsFor(text) {
      if (!text || /\s$/.test(text)) return [];
      var ch = text.toLowerCase().replace(/ё/g, 'е').split(/\s+/).filter(Boolean);
      if (!ch.length) return [];
      var last = ch[ch.length - 1];
      if (last.length < 2 || !/^[a-zа-я]+$/.test(last)) return [];
      var lo = 0, hi = surfKeys.length;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (surfKeys[mid] < last) lo = mid + 1; else hi = mid; }
      var cand = [];
      for (var i = lo; i < surfKeys.length && surfKeys[i].lastIndexOf(last, 0) === 0 && cand.length < 60; i++) if (surfKeys[i] !== last) cand.push(surfKeys[i]);
      cand.sort(function (a, b) { return surf.get(b) - surf.get(a) || a.length - b.length; });
      var head = ch.slice(0, -1).join(' '), seenSt = {}, own = stem(last);
      cand = cand.filter(function (w) { var k = stem(w); if (seenSt[k] || k === own) return false; seenSt[k] = 1; return true; });   // падежи одного слова не предлагаем: «ноутбук», а не «ноутбуки», «ноутбука»
      return cand.slice(0, 4).map(function (w) { return { q: (head ? head + ' ' : '') + w, html: esc(head ? head + ' ' : '') + esc(last) + '<b>' + esc(w.slice(last.length)) + '</b>' }; });
    }
    // 17.10 — слово есть в словаре индекса как отдельное (после основы), без приставочного поиска; для оценки числа по малому словарю
    function hasWord(w) { w = String(w || ''); return vocab.has(isCyr(w) ? stem(w) : w); }
    return { query: query, stats: { products: N, vocabulary: V }, _baseTokens: baseTokens, _hasWord: hasWord, _prep: prep, _slugOf: slugOf,
      // 14.10 — справка для страниц, которые строят свой интерфейс на движке (расширенный каталог): разделы, бренды, признаки, разбор цены
      parsePrice: parsePriceQuery,
      meta: function () {
        return { snapshot: (idx.T && idx.T['снимок']) || '', products: N,
          categories: C.map(function (c, i) { return { i: i, name: c[0], group: G[c[1]] || '', url: c[2] || '', n: catCount[i] }; }),
          brands: B.map(function (b, i) { return { i: i, name: b, n: brandCount[i] }; }),
          attrs: A.map(function (a, i) { return { i: i, name: a[0], values: a[1].slice() }; }) };
      } };
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
  return { createSearch: createSearch, quickCats: quickCats, parsePrice: parsePriceQuery, qnorm: qnorm };
});
;
/* iSoft B2B — слой подсказок поиска в шапке (13.10.2026, дополнен 14.10.2026). Склеивается с search.js (движок) сборщиком пакет_собрать.py
 * в один файл ish-search.js. Подключается из блока шапки лениво, при первом фокусе в поле поиска.
 *
 *   ISHSearch.attach(поле, список, { index: 'https://…/search_index2.json?v=…'  | indexData: {…},
 *                                    all: function(q){ return '/katalog?…'; }, log: false })
 *
 * Пока индекс грузится (или не загрузился совсем) работают прежние подсказки шапки (по ДЕРЕВУ разделов) — ничего не ломается.
 * Когда движок готов, слой перерисовывает список после прежнего обработчика и перехватывает Enter без выбранной строки,
 * чтобы уйти в каталог с ИСПРАВЛЕННЫМ запросом (раскладка, опечатки), а не с сырым.
 *
 * 14.10: история запросов и «Часто ищут» при пустом поле, бренды и дописывание слова в подсказке, «искать как ввели»,
 * цена в запросе («до 300000»), голосовой ввод, «/» — фокус в поиск, aria (combobox/listbox), события GA4 (только gtag, без своих серверов).
 * Публичное API — см. API.md рядом с файлом (attach, watch, enabled, preload, engine, engineFor, track, history, voice, …).
 */
(function (root) {
  'use strict';
  if (root.ISHSearch) return;   // файл подключён дважды (загрузчик шапки и загрузчик страницы /katalog) — второй раз молчим
  /* подставляет пакет_собрать.py: версия индекса и режим. Режим меняется выкладкой нового файла на хостинг, блок Tilda не трогается:
   *   off  — слой не включается (мгновенный откат);  flag — только у тех, кто открыл сайт с ?ishsearch=1 (запоминается в браузере);  all — у всех */
  var VER = '170aa3d9', MODE = 'all';
  var SECTIONS = [["Мини-ПК","/mini-pk-i-rabochie-stancii",15],["Моноблоки","/monobloki",54],["Ноутбуки","/noutbuki",294],["Системные блоки","/sistemnye-bloki",112],["Кронштейны для мониторов и ТВ","/kronshteyny-i-krepleniya",32],["Мониторы","/monitory",388],["Проекторы","/proektory-i-paneli",24],["Телевизоры","/televizory",46],["Блоки питания","/bloki-pitaniya",267],["Видеокарты","/videokarty",101],["Корпуса","/korpusa-i-bloki-pitaniya",280],["Материнские платы","/materinskie-platy",231],["Оперативная память","/operativnaya-pamyat",138],["Охлаждение","/ohlazhdenie",315],["Процессоры","/processory",103],["SSD-накопители","/ssd-nakopiteli",157],["USB-флешки","/fleshki-i-karty-pamyati",59],["Жёсткие диски","/zhestkie-diski",76],["Карты памяти","/karty-pamyati",43],["ИБП","/ibp-i-zashchita-pitaniya",284],["Серверы","/servery",6],["Системы хранения","/servery-i-shd",33],["Шкафы и стойки","/shkafy-i-stoyki",71],["IP-телефоны","/konferenc-svyaz",32],["Кабель витая пара","/kabel-vitaya-para",36],["Кабель-каналы и короба","/kabel-kanaly-i-koroba",40],["Коннекторы и инструмент","/konnektory-i-instrument",12],["Маршрутизаторы (роутеры)","/marshrutizatory",222],["Межсетевые экраны","/mezhsetevye-ekrany",10],["Патч-корды","/patch-kordy",157],["Патч-панели","/patch-paneli",13],["Розетки и модули","/rozetki-i-moduli",91],["Сетевое оборудование","/setevoe-oborudovanie",527],["Сетевые карты и адаптеры","/setevye-karty",99],["Точки доступа Wi-Fi","/tochki-dostupa",161],["МФУ","/mfu",88],["Плоттеры","/plottery",12],["Принтеры","/printery",33],["Сканеры документов","/skanery-dokumentov",22],["Клавиатуры","/klaviatury",319],["Мыши","/klaviatury-i-myshi",526],["Наушники и гарнитуры","/naushniki-i-garnitury",268],["Видеорегистраторы","/videoregistratory",99],["Домофоны","/domofony",49],["Камеры видеонаблюдения","/videonablyudenie",246],["СКУД и турникеты","/skud-i-turnikety",81],["Принтеры этикеток","/printery-etiketok",11],["Сканеры штрихкода","/skanery-shtrihkoda",15],["Терминалы сбора данных","/terminaly-sbora-dannyh",7]];   // [[имя, адрес, число товаров], …] из индекса: разделы показываются сразу, пока грузится индекс товаров
  /* СКС (20.10, НЕ включено): адреса новых разделов прячутся из подсказок, пока window.ISH_SKS_ON не включён (задаёт ish-design-p4.js, константа СКС_ВКЛ) (страницы-узла нет) */
  var СКС_АДРЕСА = { '/kabel-vitaya-para': 1, '/rozetki-i-moduli': 1, '/patch-paneli': 1, '/patch-kordy': 1, '/kabel-kanaly-i-koroba': 1, '/konnektory-i-instrument': 1 };
  function sksOk(c) { return !СКС_АДРЕСА[c.url] || !!window.ISH_SKS_ON; }
  function sksList(L) { var on = !!window.ISH_SKS_ON, out = [], sum = 0; L.forEach(function (c) { if (СКС_АДРЕСА[c[1]]) { if (!on) return; sum += c[2] | 0; } out.push(c); }); return out; }
  var SRC = (document.currentScript && document.currentScript.src) || '';
  var BASE = SRC.replace(/[^\/]*(\?.*)?$/, '');
  var RAW_PARAM = 'ish_raw=1';    // «искать как ввели»: выдача без исправлений и без разбора цены
  // «Часто ищут» при пустом поле: берутся только те, что дают товары. Список правится здесь (журнала запросов на сайте нет — это ориентиры закупщика, не статистика).
  var POPULAR = ['ноутбук', 'монитор 27', 'ssd 1 тб', 'оперативная память ddr5', 'роутер wifi 6', 'ибп', 'видеокарта rtx', 'мышь беспроводная', 'блок питания 750 вт'];
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
    '.нш-гр{padding:8px 10px 4px;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--mut,#6b7080);font-weight:600;display:flex;justify-content:space-between;align-items:center}' +
    '.нш-гр button{border:0;background:none;color:var(--mut,#6b7080);font:inherit;text-transform:none;letter-spacing:0;cursor:pointer;text-decoration:underline;padding:0}' +
    '.нш-испр{padding:8px 10px;font-size:13px;color:var(--mut,#6b7080)}.нш-испр b{color:var(--ink,#171923)}.нш-испр a{color:var(--cobalt,#2B44C7);text-decoration:underline;white-space:nowrap}' +
    '.нш-подсказка.нш-раздел b{font-weight:700}' +
    '.нш-подсказка mark,.нш-товар mark{background:rgba(255,196,0,.35);color:inherit;border-radius:3px;padding:0 1px}' +
    '.нш-подсказка.нш-запрос b{font-weight:400}.нш-подсказка.нш-запрос b b{font-weight:700}' +
    '.нш-ряд{position:relative}.нш-ряд>.нш-ист-x{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:6px;background:none;color:var(--mut,#6b7080);font-size:18px;line-height:1;cursor:pointer}' +
    '.нш-ряд>.нш-ист-x:hover{background:var(--cobalt-soft,#eef2ff)}.нш-ряд>.нш-подсказка{padding-right:40px}' +
    '.нш-чипы{display:flex;flex-wrap:wrap;gap:6px;padding:4px 10px 8px}' +
    '.нш-чипы a{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border:1px solid var(--line,#e6e8ef);border-radius:16px;font-size:13px;text-decoration:none;color:var(--ink,#171923);background:#fff}' +
    '.нш-чипы a:hover,.нш-чипы a.нш-вкл{border-color:var(--cobalt,#2B44C7);background:var(--cobalt-soft,#eef2ff)}.нш-чипы a span{color:var(--mut,#6b7080);font-size:12px}' +
    '.нш-мик{display:inline-flex;align-items:center;gap:8px;margin:6px 10px;min-height:36px;padding:0 14px;border:1px solid var(--line,#e6e8ef);border-radius:18px;background:#fff;color:var(--ink,#171923);font:500 13px/1 inherit;font-family:inherit;cursor:pointer}' +
    '.нш-мик svg{width:16px;height:16px;flex:none}.нш-мик:hover{border-color:var(--cobalt,#2B44C7)}.нш-мик[data-on="1"]{background:#fdeaea;border-color:#e9a793;color:#b43a36}' +
    '.нш-товар{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:8px;cursor:pointer;text-decoration:none;color:var(--ink,#171923)}' +
    '.нш-товар:hover,.нш-товар.нш-вкл{background:var(--cobalt-soft,#eef2ff)}' +
    '.нш-товар img{width:44px;height:44px;object-fit:contain;flex:none;border-radius:6px;background:#fff}' +
    '.нш-товар .нш-фото-нет{width:44px;height:44px;flex:none;border-radius:6px;background:var(--line,#e6e8ef)}' +
    '.нш-товар .нш-т{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}' +
    '.нш-товар .нш-т b{font-weight:500;font-size:13.5px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '.нш-товар .нш-т i{font-style:normal;font-size:12px;color:var(--mut,#6b7080);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.нш-товар .нш-ц{flex:none;font-weight:700;font-size:14px;white-space:nowrap}' +
    '.нш-пусто{padding:12px 10px;font-size:13.5px;color:var(--mut,#6b7080)}' +
    '.нш-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
  var MIC_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';

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
  try { if (SRC && включён() && !root.ISH_NO_PRELOAD) preload(); } catch (e) {}   // ISH_NO_PRELOAD = true до загрузки файла: индекс сам не тянем (расширенный каталог берёт ish-core.js)

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }

  /* ───────────── общий движок на страницу: один createSearch на один индекс (подсказки, страница результатов, каталог) ───────────── */
  var engines = [];
  function engineFor(idx) {
    for (var i = 0; i < engines.length; i++) if (engines[i].idx === idx) return engines[i].S;
    var S = root.createSearch(idx);
    engines.push({ idx: idx, S: S });
    return S;
  }
  function engine(url) { return preload(url).then(engineFor); }   // Promise<движок>; ISHSearch.engine().then(function (S) { S.query('ноут', {limit: 5}) })

  /* ───────────── строка «ещё N+ в расширенном каталоге (под заказ) →»: ish-assort-hint.js и его словарь грузятся лениво, при первом показе ───────────── */
  var hintP = null;
  function loadHint() {
    if (root.ISHAssortHint) return Promise.resolve();
    if (hintP) return hintP;
    hintP = new Promise(function (res) {
      if (!SRC) { res(); return; }
      var s = document.createElement('script'); s.async = true; s.src = BASE + 'ish-assort-hint.js?v=' + VER;
      s.onload = function () { res(); }; s.onerror = function () { res(); };
      document.head.appendChild(s);
    });
    return hintP;
  }
  // Promise<null | { n, url, text, html }>; null — показывать нечего (слой выключен, нет файла, ноль позиций)
  function assortHint(q, total) {
    return loadHint().then(function () { return root.ISHAssortHint ? root.ISHAssortHint.get(q, total) : null; }).catch(function () { return null; });
  }
  var ASSORT_CSS = '.ish-assort-row{display:block;padding:10px;border-radius:8px;color:var(--cobalt,#2B44C7);font-size:14px;font-weight:600;text-decoration:none}.ish-assort-row:hover{background:var(--cobalt-soft,#eef2ff)}';

  /* ───────────── аналитика: события GA4 через gtag сайта (G-H4F0PMTSKB), без своих серверов ─────────────
   * search            — запрос ушёл на выдачу (Enter, «показать все», выдача открыта): search_term, results, source
   * ish_suggest       — человек остановился в поле с подсказками >=1,2 с: ish_term, results
   * ish_search_zero   — «искали и не нашли» (подсказки или выдача): ish_term, source -> список для закупа
   * select_item       — клик по товару в подсказке/выдаче: item_list_name, items[{item_id,item_name,index,…}]
   * ish_search_add    — «в корзину» из выдачи;  ish_search_filter — фильтр/сортировка в выдаче;  ish_search_voice — голосовой ввод
   * Запросы с «@» и телефонами в GA4 не отправляются. Последние события лежат в ISHSearch.trackLog() (для проверки без GA). */
  var TRACK_LOG = [];
  function clean(t) { t = String(t == null ? '' : t).replace(/\s+/g, ' ').trim().slice(0, 100); return /@|\d[\d\s()+-]{9,}\d/.test(t) ? '' : t; }
  function track(name, params) {
    params = params || {};
    try {
      var p = {}, k;
      for (k in params) if (params[k] != null && params[k] !== '') p[k] = params[k];
      if ('search_term' in p) { p.search_term = clean(p.search_term); if (!p.search_term) return; }
      if ('ish_term' in p) { p.ish_term = clean(p.ish_term); if (!p.ish_term) return; }
      p.ish_search = 1;
      TRACK_LOG.push({ t: Date.now(), name: name, params: p });
      if (TRACK_LOG.length > 200) TRACK_LOG.shift();
      if (typeof root.gtag === 'function') root.gtag('event', name, p);
      else if (root.dataLayer && typeof root.dataLayer.push === 'function') root.dataLayer.push((function () { return arguments; })('event', name, p));
    } catch (e) {}
  }
  // «Искали и не нашли» на ВСТРОЕННЫХ измерениях GA4: событие search с search_term = «НЕТ · <запрос>» (одно на запрос за открытую страницу); обычные запросы — просто запрос
  var NO_PREFIX = 'НЕТ · ', zeroSent = {};
  function trackZero(term, source) {
    var k = String(term).toLowerCase(); if (zeroSent[k]) return; zeroSent[k] = 1;
    track('search', { search_term: NO_PREFIX + term, results: 0, source: source });
    track('ish_search_zero', { ish_term: term, source: source });
  }
  function itemOf(p, pos, list) {
    return { item_id: p.sku || String(p.id || ''), item_name: p.title, item_brand: p.brand || undefined, item_category: p.cat, price: p.price, index: pos, item_list_name: list };
  }

  /* ───────────── история запросов (localStorage этого браузера) и журнал «не нашли» этого браузера ───────────── */
  var HK = 'ishHist', ZK = 'ishZero', HMAX = 8;
  function lsGet(k) { try { var v = JSON.parse(root.localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function lsSet(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var history = {
    get: function () { return lsGet(HK).slice(0, HMAX); },
    add: function (q) {
      q = String(q || '').replace(/\s+/g, ' ').trim();
      if (q.length < 2 || q.length > 80) return;
      var l = lsGet(HK).filter(function (x) { return String(x).toLowerCase() !== q.toLowerCase(); });
      l.unshift(q); lsSet(HK, l.slice(0, HMAX));
    },
    remove: function (q) { lsSet(HK, lsGet(HK).filter(function (x) { return String(x).toLowerCase() !== String(q).toLowerCase(); })); },
    clear: function () { lsSet(HK, []); }
  };
  function zeroNote(q) { var l = lsGet(ZK).filter(function (x) { return x.q !== q; }); l.unshift({ q: q, t: Date.now() }); lsSet(ZK, l.slice(0, 50)); }

  /* ───────────── голосовой ввод (Web Speech API; где браузер не умеет — кнопки нет) ───────────── */
  function SR() { return root.SpeechRecognition || root.webkitSpeechRecognition || null; }
  var voice = {
    supported: function () { return !!SR(); },
    // start(onText(текст, финальный), onEnd(ошибка|null)) -> { stop() } | null
    start: function (onText, onEnd, lang) {
      var C = SR(); if (!C) return null;
      var rec = new C(), done = false;
      rec.lang = lang || 'ru-RU'; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
      rec.onresult = function (e) {
        var t = '', fin = false;
        for (var i = 0; i < e.results.length; i++) { t += e.results[i][0].transcript; if (e.results[i].isFinal) fin = true; }
        try { onText && onText(t.trim(), fin); } catch (x) {}
      };
      function end(err) { if (done) return; done = true; try { onEnd && onEnd(err || null); } catch (x) {} }
      rec.onerror = function (e) { end((e && e.error) || 'error'); };
      rec.onend = function () { end(null); };
      try { rec.start(); } catch (e) { end('start'); return null; }
      return { stop: function () { try { rec.stop(); } catch (e) {} } };
    }
  };

  function attach(input, list, opts) {
    opts = opts || {};
    if (!input || !list || input.__ishSearch) return;
    if (!opts.indexData && !включён()) return;
    input.__ishSearch = true;
    if (!opts.index && !opts.indexData) opts.index = BASE + 'search_index2.json?v=' + VER;
    var S = null, log = opts.log ? function () { try { console.log.apply(console, arguments); } catch (e) {} } : function () {};
    var st = document.createElement('style'); st.textContent = CSS + ASSORT_CSS + HIDE_OLD; document.head.appendChild(st);
    var failed = false, idleT = 0, lastIdle = '', recog = null, popMemo = null, hintTok = 0;
    a11yInit(input, list);

    function ready(idx) {
      try { S = engineFor(idx); } catch (e) { log('ish-search: движок не поднялся', e); return; }
      root.ISH_SEARCH_READY = true;
      log('ish-search: готов', S.stats);
      if (document.activeElement === input) render();
    }
    if (opts.indexData) ready(opts.indexData);
    else if (opts.index) {
      preload(opts.index).then(ready).catch(function (e) {
        failed = true; st.textContent = CSS + ASSORT_CSS;   // индекс не загрузился: возвращаем прежние подсказки
        log('ish-search: индекс не загрузился, работают прежние подсказки', e);
      });
    }

    // «Показать все» и Enter: каталог сразу «сначала дешёвые» (tfc_sort Tilda); адрес собирает блок шапки (opts.all), сортировку дописываем здесь
    var SORT = 'tfc_sort%5B4204437703%5D=price:asc';
    function allUrl(q, raw) {
      var u = opts.all ? opts.all(q) : '/katalog?tfc_query%5B4204437703%5D=' + encodeURIComponent(q) + '&tfc_div=:::';
      if (typeof u !== 'string' || u.indexOf('?') < 0) return u;
      if (u.indexOf('tfc_sort') < 0) u += '&' + SORT;
      if (raw && u.indexOf(RAW_PARAM) < 0) u += '&' + RAW_PARAM;
      return u;
    }

    function quick(q) {   // индекс ещё грузится: разделы из встроенного списка, строка про загрузку, ссылка «искать в каталоге»
      var cs = []; try { cs = root.ishQuickCats ? root.ishQuickCats(sksList(SECTIONS), q, 3) : []; } catch (e) {}
      var h = '';
      if (cs.length) {
        h += '<div class="нш-гр">Разделы</div>';
        cs.forEach(function (c) { h += '<a class="нш-подсказка нш-раздел" href="' + esc(c.url) + '"><b>' + esc(c.name) + '</b><span>' + c.n + '</span></a>'; });
      }
      h += '<div class="нш-пусто">Подбираем товары…</div>';
      h += '<a class="нш-подсказки-низ" href="' + esc(allUrl(q)) + '">Искать «' + esc(q) + '» в каталоге</a>';
      show(h);
    }
    function show(h, msg) {
      list.innerHTML = h;
      list.classList.add('нш-видно', 'нш-умный');
      a11yAfter(list, msg);
    }
    function micRow() {
      return voice.supported() ? '<button type="button" class="нш-мик" data-ish-mic="1" aria-label="Голосовой поиск">' + MIC_SVG + '<span>Сказать запрос</span></button>' : '';
    }

    // пустое поле: история этого браузера, «Часто ищут» (только то, что даёт товары), топ-разделы
    function renderEmpty() {
      if (!S) return;
      var h = '', hs = history.get();
      if (hs.length) {
        h += '<div class="нш-гр">Вы искали <button type="button" data-ish-hclear="1">Очистить</button></div>';
        hs.slice(0, 5).forEach(function (q) {
          h += '<div class="нш-ряд"><a class="нш-подсказка нш-ист" href="' + esc(allUrl(q)) + '" data-q="' + esc(q) + '"><b>' + esc(q) + '</b></a>' +
               '<button type="button" class="нш-ист-x" data-ish-hdel="' + esc(q) + '" aria-label="Убрать «' + esc(q) + '» из истории">×</button></div>';
        });
      }
      if (!popMemo) { popMemo = []; POPULAR.forEach(function (q) { try { if (popMemo.length < 8 && S.query(q, { limit: 0, attrFacets: false, completions: false }).total > 0) popMemo.push(q); } catch (e) {} }); }
      var pop = popMemo;
      if (pop.length) {
        h += '<div class="нш-гр">Часто ищут</div><div class="нш-чипы">';
        pop.forEach(function (q) { h += '<a href="' + esc(allUrl(q)) + '" data-q="' + esc(q) + '">' + esc(q) + '</a>'; });
        h += '</div>';
      }
      var r0 = S.query('', { limit: 0 }), cs = (r0.categories || []).filter(function (c) { return c.url && sksOk(c); }).slice(0, 6);
      if (cs.length) {
        h += '<div class="нш-гр">Разделы</div>';
        cs.forEach(function (c) { h += '<a class="нш-подсказка нш-раздел" href="' + esc(c.url) + '"><b>' + esc(c.name) + '</b><span>' + c.n + '</span></a>'; });
      }
      h = micRow() + h;
      if (h) show(h, 'Подсказки: история и популярные запросы');
    }

    function render() {
      var q = input.value.trim();
      if (!q.length) { renderEmpty(); return; }
      if (q.length < 2) return;
      if (!S) { if (!failed) quick(q); return; }
      var r;
      try { r = S.query(q, { limit: 6, attrFacets: false }); } catch (e) { log('ish-search: ошибка запроса', e); return; }
      var h = '', shown = (r.corrected && r.corrected.to) || '', total = r.total || 0;
      if (shown) h += '<div class="нш-испр">Показано для «<b>' + esc(shown) + '</b>». <a href="' + esc(allUrl(q, true)) + '" data-q="' + esc(q) + '" data-ish-raw="1">Искать «' + esc(q) + '»</a></div>';
      if (r.price && r.price.applied) h += '<div class="нш-испр">Цена: <b>' + esc(r.price.label) + '</b></div>';
      // дописывание слова: «ноут» -> «ноутбук»
      var comp = (r.completions || []).slice(0, 3);
      if (comp.length && total) {
        h += '<div class="нш-гр">Запросы</div>';
        comp.forEach(function (c) { h += '<a class="нш-подсказка нш-запрос" href="' + esc(allUrl(c.q)) + '" data-q="' + esc(c.q) + '"><b>' + c.html + '</b></a>'; });
      }
      var cats = (r.categories || []).filter(function (c) { return c.url && c.n > 0 && c.hit && sksOk(c); }).slice(0, 3);   // только разделы, чьё название совпало со словами запроса
      if (cats.length) {
        h += '<div class="нш-гр">Разделы</div>';
        cats.forEach(function (c) {
          h += '<a class="нш-подсказка нш-раздел" href="' + esc(c.url) + '"><b>' + (c.html || esc(c.name)) + '</b><span>' + esc(c.path.split(' › ')[0] === c.name ? '' : c.path.split(' › ')[0] + ' · ') + c.n + '</span></a>';
        });
      }
      // бренды: названный в запросе — отдельной строкой; иначе — бренды раздела, чтобы уточнить («ноутбук» -> «ноутбук asus»)
      var bchips = [];
      if (total) {
        var named = (r.brands || []).slice(0, 3);
        if (named.length) named.forEach(function (b) { bchips.push({ q: b.name, name: b.name, n: b.n }); });
        else if (cats.length || r.facets) ((r.facets && r.facets.brands) || []).slice(0, 4).forEach(function (b) { bchips.push({ q: (shown || q) + ' ' + b.name, name: b.name, n: b.n }); });
      }
      if (bchips.length) {
        h += '<div class="нш-гр">Бренды</div><div class="нш-чипы">';
        bchips.forEach(function (b) { h += '<a href="' + esc(allUrl(b.q)) + '" data-q="' + esc(b.q) + '">' + esc(b.name) + ' <span>' + b.n + '</span></a>'; });
        h += '</div>';
      }
      if (r.products && r.products.length) {
        h += '<div class="нш-гр">Товары</div>';
        r.products.forEach(function (p, pos) {
          var img = p.thumb ? '<img loading="lazy" decoding="async" alt="" src="' + esc(p.thumb) + '" onerror="this.onerror=null;this.src=\'' + esc(p.photo) + '\'">' : '<span class="нш-фото-нет"></span>';
          h += '<a class="нш-товар" href="' + esc(p.url || allUrl(p.title)) + '" data-pos="' + (pos + 1) + '" data-pi="' + p.i + '">' + img +
               '<span class="нш-т"><b>' + p.html + '</b><i>' + (p.sku ? esc(p.sku) + ' · ' : '') + esc(p.brand || p.cat) + '</i></span>' +
               '<span class="нш-ц">' + money(p.price) + '</span></a>';
        });
      } else if (!cats.length) {
        var sg = r.suggestion;
        h += '<div class="нш-пусто">Ничего не нашли по «' + esc(q) + '».' +
             (sg ? ' Возможно, вы искали: <b><a href="' + esc(allUrl(sg.q)) + '" data-q="' + esc(sg.q) + '">' + esc(sg.q) + '</a></b> (' + sg.total + ').' :
              r.fallback && r.fallback.words && r.fallback.words.length ? ' Возможно: ' + r.fallback.words.map(esc).join(', ') + '.' : '') + '</div>';
        (r.fallback && r.fallback.categories || []).filter(function (c) { return c.url; }).slice(0, 4).forEach(function (c) {
          h += '<a class="нш-подсказка нш-раздел" href="' + esc(c.url) + '"><b>' + esc(c.name) + '</b><span>' + c.n + '</span></a>';
        });
        h += micRow();
      }
      h += '<a class="нш-подсказки-низ" href="' + esc(allUrl(shown || q)) + '" data-q="' + esc(shown || q) + '" data-ish-all="1">' +
           (total ? 'Показать все результаты (' + total + ') по «' + esc(shown || q) + '»' : 'Искать «' + esc(q) + '» в каталоге') + '</a>';
      show(h, total ? 'Найдено ' + total + ' по запросу ' + (shown || q) : 'По запросу ' + q + ' ничего не найдено');
      idle(q, total);
      // «ещё N+ в расширенном каталоге (под заказ) →» перед «Показать все результаты»; не задерживает подсказку, устаревший ответ отбрасывается
      var tok = ++hintTok;
      assortHint(shown || q, total).then(function (x) {
        if (!x || tok !== hintTok || input.value.trim() !== q) return;
        var low = list.querySelector ? list.querySelector('[data-ish-all]') : null;
        if (!low || (list.querySelector('[data-ish-assort]'))) return;
        low.insertAdjacentHTML('beforebegin', x.html.replace('class="ish-assort-row"', 'class="нш-подсказки-низ ish-assort-row" data-ish-assort="1" data-n="' + (x.n == null ? '' : x.n) + '"'));
        a11yAfter(list);
      });
    }

    // человек остановился в поле: событие «подсказки показаны» / «не нашли»
    function idle(q, total) {
      clearTimeout(idleT);
      if (q.length < 3) return;
      idleT = setTimeout(function () {
        if (q === lastIdle || input.value.trim() !== q) return;
        lastIdle = q;
        if (total === 0) { zeroNote(q); trackZero(q, 'suggest'); }
        else track('ish_suggest', { ish_term: q, results: total });
      }, 1200);
    }
    function commit(q, source, total, hq) {
      history.add(hq || q);                       // в историю — то, что реально искали (с исправлением), в GA4 — то, что ввели
      if (total === 0) { zeroNote(q); trackZero(q, source); } else track('search', { search_term: q, results: total, source: source });
    }

    // после прежнего обработчика input: он выставил свой список, мы его заменяем
    input.addEventListener('input', render);
    input.addEventListener('focus', function () { render(); });
    // уйти в каталог с исправленным запросом; false — движок ещё не готов, пусть работает прежний путь
    input.__ishGo = function () {
      if (!S) return false;
      var q = input.value.trim(); if (!q) return false;
      var r; try { r = S.query(q, { limit: 1, attrFacets: false, completions: false }); } catch (err) { return false; }
      var to = (r.corrected && r.corrected.to) || q;
      commit(q, 'enter', r.total || 0, to);
      window.location.assign(allUrl(to));
      return true;
    };
    // Enter без выбранной строки: уходим с исправленным запросом
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !S) return;
      if (list.querySelector('.нш-вкл')) return;          // выбрана строка — прежний обработчик перейдёт по ссылке
      if (!input.value.trim()) return;
      if (input.__ishGo()) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    input.__ishRender = render;

    // клики по списку: история, события, «убрать из истории», голос
    list.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target : null;
      if (!t) return;
      var del = t.closest('[data-ish-hdel]');
      if (del) { e.preventDefault(); history.remove(del.getAttribute('data-ish-hdel')); render(); return; }
      if (t.closest('[data-ish-hclear]')) { e.preventDefault(); history.clear(); render(); return; }
      var mic = t.closest('[data-ish-mic]');
      if (mic) { e.preventDefault(); toggleVoice(mic); return; }
      var a = t.closest('a');
      if (!a) return;
      if (a.getAttribute('data-ish-assort')) { track('ish_assort_link', { search_term: input.value.trim(), results: a.getAttribute('data-n') || undefined, source: 'suggest' }); return; }
      var pos = a.getAttribute('data-pos');
      if (pos) {
        var pq = input.value.trim(), pr;
        try { pr = S && S.query(pq, { limit: 6, attrFacets: false, completions: false }).products[+pos - 1]; } catch (x) {}
        if (pr) track('select_item', { item_list_name: 'Поиск: подсказки', search_term: pq, items: [itemOf(pr, +pos, 'Поиск: подсказки')] });
        history.add(pq);
      } else if (a.getAttribute('data-q')) {
        var qq = a.getAttribute('data-q'), tt = -1;
        try { tt = S ? S.query(qq, { limit: 0, attrFacets: false, completions: false }).total : -1; } catch (x) {}
        commit(qq, a.getAttribute('data-ish-raw') ? 'as_typed' : a.getAttribute('data-ish-all') ? 'show_all' : 'suggest_link', tt);
      }
    });
    function toggleVoice(btn) {
      if (recog) { recog.stop(); return; }
      btn.setAttribute('data-on', '1'); var lab = btn.querySelector('span'); if (lab) lab.textContent = 'Слушаю… нажмите, чтобы остановить';
      var got = '';
      recog = voice.start(function (text, fin) {
        got = text; input.value = text; render();
      }, function (err) {
        recog = null; var sp = list.querySelector('[data-ish-mic] span'); if (sp) sp.textContent = err && err !== 'no-speech' && err !== 'aborted' ? 'Не удалось распознать — повторите' : 'Сказать запрос';
        var b = list.querySelector('[data-ish-mic]'); if (b) b.removeAttribute('data-on');
        if (got) { track('ish_search_voice', { ish_term: got }); render(); try { input.focus(); } catch (x) {} }
      });
      if (!recog) { btn.removeAttribute('data-on'); if (lab) lab.textContent = 'Голос недоступен'; }
    }
  }

  /* ───────────── доступность: combobox/listbox, активная строка, «живая» строка для скринридера ───────────── */
  var liveEl = null, listN = 0;
  function liveRegion() {
    if (liveEl || !document.body) return liveEl;
    liveEl = document.createElement('div');
    liveEl.className = 'нш-sr'; liveEl.setAttribute('role', 'status'); liveEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveEl);
    return liveEl;
  }
  function a11yInit(input, list) {
    try {
      if (!list.id) list.id = 'ish-list-' + (++listN);
      list.setAttribute('role', 'listbox');
      input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-haspopup', 'listbox');
      input.setAttribute('aria-controls', list.id); input.setAttribute('aria-expanded', 'false');
      if (typeof MutationObserver === 'function') {
        new MutationObserver(function () {
          var open = list.classList.contains('нш-видно'), cur = list.querySelector('.нш-вкл');
          input.setAttribute('aria-expanded', open ? 'true' : 'false');
          [].forEach.call(list.querySelectorAll('[role=option]'), function (o) { o.setAttribute('aria-selected', o === cur ? 'true' : 'false'); });
          if (cur && cur.id) input.setAttribute('aria-activedescendant', cur.id); else input.removeAttribute('aria-activedescendant');
        }).observe(list, { attributes: true, attributeFilter: ['class'], subtree: true });
      }
    } catch (e) {}
  }
  function a11yAfter(list, msg) {
    try {
      var n = 0;
      [].forEach.call(list.querySelectorAll('a'), function (a) { a.setAttribute('role', 'option'); if (!a.id) a.id = list.id + '-o' + n; n++; });
      var lr = liveRegion(); if (lr && msg) lr.textContent = msg;
    } catch (e) {}
  }

  /* ── поля СТАРОЙ оболочки сайта (13.10): #ishМобQ (телефон, рисуется заново при смене экрана оболочки) и #ishQ (761–980 px) ──
     Блок шапки грузит этот файл при первом фокусе в такое поле и зовёт watch(). Список — отдельный fixed-узел в body (форма оболочки
     overflow:hidden, внутри неё список обрезался бы). Enter и кнопку «искать» перехватываем на window в фазе захвата — раньше обработчиков
     оболочки (go()) и прежнего предпоиска (.ishsg); пока индекс не готов, их работа не нарушается. */
  var SHELL_IDS = { 'ishМобQ': 1, 'ishQ': 1 }, shellN = 0;
  var SHELL_CSS = '.нш-мс{display:none;position:fixed;z-index:9650;left:8px;right:8px;top:0;max-height:60vh;overflow:auto;-webkit-overflow-scrolling:touch;' +
    'background:#fff;border:1px solid #E3DFD6;border-radius:12px;box-shadow:0 12px 32px rgba(23,25,35,.18);padding:6px;font-family:TildaSans,Arial,sans-serif;color:#171923;box-sizing:border-box}' +
    '.нш-мс *{box-sizing:border-box}.нш-мс.нш-видно{display:block}' +
    '.нш-мс .нш-гр{padding:8px 10px 4px;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:#6b7080;font-weight:600}' +
    '.нш-мс .нш-подсказка{display:flex;justify-content:space-between;gap:12px;padding:10px;border-radius:8px;font-size:14px;text-decoration:none;color:#171923}' +
    '.нш-мс .нш-подсказка.нш-вкл,.нш-мс .нш-подсказки-низ.нш-вкл{background:#eef2ff}' +
    '.нш-мс .нш-подсказка span{color:#646B7D;font-size:12.5px;white-space:nowrap}' +
    '.нш-мс .нш-подсказки-низ{display:block;padding:12px 10px;border-radius:8px;color:#2B44C7;font-size:14px;font-weight:600;text-decoration:none}';
  function attachShell(input) {
    if (!input || input.__ishSearch || !включён()) return;
    var list = document.createElement('div');
    list.className = 'нш-мс'; list.id = 'ish-мс-' + (++shellN);
    document.body.appendChild(list);
    if (!document.getElementById('ish-мс-css')) { var st = document.createElement('style'); st.id = 'ish-мс-css'; st.textContent = SHELL_CSS; document.head.appendChild(st); }
    function place() {
      var f = input.closest ? (input.closest('form') || input) : input, r = f.getBoundingClientRect(), vv = window.visualViewport;
      var vh = vv ? vv.height : window.innerHeight, w = window.innerWidth;
      list.style.top = Math.round(r.bottom + 6) + 'px';
      list.style.maxHeight = Math.max(160, Math.round(vh - r.bottom - 14)) + 'px';
      if (w > 760) { list.style.left = Math.max(8, Math.round(r.left)) + 'px'; list.style.right = 'auto'; list.style.width = Math.min(560, w - 16) + 'px'; }
      else { list.style.left = '8px'; list.style.right = '8px'; list.style.width = 'auto'; }
    }
    attach(input, list, {});
    if (!input.__ishSearch) { if (list.parentNode) list.parentNode.removeChild(list); return; }
    input.__ishShell = list;
    var obs = new MutationObserver(function () { if (list.classList.contains('нш-видно')) place(); });
    obs.observe(list, { attributes: true, attributeFilter: ['class'] });
    function hide() { list.classList.remove('нш-видно'); }
    input.addEventListener('blur', function () { setTimeout(hide, 250); });
    // клавиатура у телефонного/узкого поля оболочки (у десктопной шапки её ведёт её собственный код): стрелки, Enter по выбранной строке, Esc
    var cur = -1;
    function items() { return [].slice.call(list.querySelectorAll('a')); }
    function mark(n) { var it = items(); it.forEach(function (x, i) { x.classList.toggle('нш-вкл', i === n); }); cur = n; if (it[n] && it[n].scrollIntoView) it[n].scrollIntoView({ block: 'nearest' }); }
    input.addEventListener('keydown', function (e) {
      var it = items(), k = e.key;
      if (!list.classList.contains('нш-видно')) return;
      if (k === 'ArrowDown' && it.length) { e.preventDefault(); mark(cur + 1 >= it.length ? 0 : cur + 1); }
      else if (k === 'ArrowUp' && it.length) { e.preventDefault(); mark(cur <= 0 ? it.length - 1 : cur - 1); }
      else if (k === 'Escape') { hide(); cur = -1; }
      else if (k === 'Enter' && cur >= 0 && it[cur]) { e.preventDefault(); e.stopImmediatePropagation(); it[cur].click(); }
    }, true);
    input.addEventListener('input', function () { cur = -1; });
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    window.addEventListener('resize', function () { if (list.classList.contains('нш-видно')) place(); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { if (list.classList.contains('нш-видно')) place(); });
    window.addEventListener('scroll', function () { if (list.classList.contains('нш-видно')) place(); }, { passive: true });
    if (document.activeElement === input && input.__ishRender) input.__ishRender();
  }
  var watching = false;
  function watch() {
    if (!включён()) return;
    function tryAttach(t) { if (t && t.tagName === 'INPUT' && SHELL_IDS[t.id] && !t.__ishSearch) attachShell(t); }
    tryAttach(document.activeElement);                     // скрипт догрузился, когда поле уже в фокусе
    if (watching) return;
    watching = true;
    document.addEventListener('focusin', function (e) { tryAttach(e.target); }, true);
    function shellInput(el) { return el && el.tagName === 'INPUT' && SHELL_IDS[el.id] && el.__ishGo ? el : null; }
    window.addEventListener('keydown', function (e) {
      var i = shellInput(e.target);
      if (!i || e.key !== 'Enter' || !i.value.trim()) return;
      if (i.__ishGo()) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    window.addEventListener('submit', function (e) {         // кнопка «искать» / отправка формы оболочки
      var f = e.target, i = f && f.querySelector ? (f.querySelector('#ishМобQ') || f.querySelector('#ishQ')) : null;
      if (!shellInput(i) || !i.value.trim()) return;
      if (i.__ishGo()) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
  }

  /* ── «/» — фокус в поиск (как на GitHub, Amazon, Ozon-десктопе). Живёт отдельно от attach: срабатывает до первого фокуса в поле ── */
  var FOCUS_IDS = ['нш-ishQ', 'нш-мобQ', 'ishQ', 'ishМобQ'];
  function slashFocus() {
    if (typeof document.addEventListener !== 'function' || !включён()) return;
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      for (var i = 0; i < FOCUS_IDS.length; i++) {
        var el = document.getElementById(FOCUS_IDS[i]);
        if (el && el.offsetParent !== null && !el.disabled) { e.preventDefault(); el.focus(); try { el.select(); } catch (x) {} return; }
      }
    });
  }
  try { slashFocus(); } catch (e) {}

  root.ISHSearch = {
    attach: attach, watch: watch, enabled: включён, preload: preload, base: BASE, version: VER, indexUrl: function () { return INDEX_URL; },
    // 14.10 — для страницы результатов и расширенного каталога
    engine: engine, engineFor: engineFor, assortHint: assortHint, track: track, trackZero: trackZero, trackLog: function () { return TRACK_LOG.slice(); }, itemOf: itemOf,
    history: history, voice: voice, zeroLog: function () { return lsGet(ZK); }, popular: POPULAR.slice(),
    parsePrice: function (q) { return root.ishParsePrice ? root.ishParsePrice(q) : { text: String(q || ''), price: null }; },
    rawParam: RAW_PARAM, esc: esc, money: money
  };
})(typeof window !== 'undefined' ? window : this);
;
/* iSoft B2B — страница результатов поиска /katalog на нашем движке (13.10.2026). Склеивается сборщиком пакет_собрать.py
 * в ish-search.js после search.js (движок) и ish-search-ui.js (подсказки); отдельно не подключается.
 *
 * Включается ТОЛЬКО на адресе /katalog с запросом tfc_query[4204437703]=… и только когда слой поиска включён для посетителя
 * (режим all, либо flag + ?ishsearch=1) — те же off/flag/all, что и у подсказок. /katalog без запроса не трогается.
 * Родной каталог магазина (#rec4204437703) не удаляется: пока наш слой работает, он скрыт классом html.ish-res-on;
 * не загрузился индекс / ошибка / таймаут 8 с — класс снимается и виден родной каталог (как раньше).
 *
 * Выдача: те же правила, что в подсказках (search.js: уровни релевантности, внутри уровня дешёвые сначала, точный артикул первым,
 * исправление запроса), разделы со счётчиками (клик фильтрует), фильтры Цена от–до и Бренд, сортировка, карточки списком,
 * «показать ещё» по 30. 14.10: быстрые фильтры по характеристикам (диагональ, память, процессор…), «в наличии» (если есть что фильтровать),
 * цена из запроса («до 300000»), «искать как ввели» (&ish_raw=1), «возможно, вы искали», поле поиска с голосом, события GA4 через ISHSearch.track. «В корзину» — тот же путь, что у кода каталога на этой странице (блок 4204439103): родной
 * tcart__addProduct из tilda-cart-1.1.min.js, заглушка .t706, проверка по localStorage и запись в формате Tilda, если родной не положил.
 */
(function (root) {
  'use strict';
  if (root.ISHResults) return;                       // файл подключён дважды (шапкой и страницей) — второй раз молчим
  var REC = '4204437703', STEP = 30, WAIT_MS = 8000;
  var CART_JS = 'https://static.tildacdn.pro/js/tilda-cart-1.1.min.js';
  var CURRENCY = { 'data-project-currency': 'тг.', 'data-project-currency-side': 'r', 'data-project-currency-sep': ',', 'data-project-currency-dec': '' };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
  function plural(n, a, b, c) { var m = n % 100, d = n % 10; return (m > 10 && m < 15) ? c : d === 1 ? a : (d >= 2 && d <= 4) ? b : c; }
  function queryFromUrl(search) {
    var s = search == null ? (root.location && root.location.search) || '' : search, m = /[?&]tfc_query(?:%5B|\[)4204437703(?:%5D|\])=([^&]*)/i.exec(s);
    if (!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')).trim(); } catch (e) { return m[1].trim(); }
  }
  function katalogUrl(q, raw) { if (typeof root.ISH_URLFOR === 'function') return root.ISH_URLFOR(q, !!raw);   // свой адрес выдачи (превью, расширенный каталог): window.ISH_URLFOR = function (q, raw) { return '…'; }
    return '/katalog?tfc_query%5B' + REC + '%5D=' + encodeURIComponent(q) + '&tfc_div=:::' + (raw ? '&ish_raw=1' : ''); }
  function rawFromUrl(search) { var s = search == null ? (root.location && root.location.search) || '' : search; return /[?&]ish_raw=1(&|$)/.test(s); }
  function track(name, params) { try { if (root.ISHSearch && root.ISHSearch.track) root.ISHSearch.track(name, params); } catch (e) {} }
  function sortedKeys(o) { return Object.keys(o || {}); }
  var MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';

  var CSS = '' +
    'html.ish-res-on #rec4204437703{display:none!important}' +
    'html.ish-res-on .вн-верх,html.ish-res-on .ishp31-hero{display:none!important}' +
    '.ir{--k:#2B44C7;--kh:#2036A8;--kbs:#E8EBFB;--lav:#E8EBFB;--lav2:#EEF0FC;--ink:#1F2336;--mut:#646B7D;--lin:#E3DFD6;--ok:#1FA463;--grad:linear-gradient(135deg,#3550D6,#2B44C7 55%,#2B2F6B);--f:TildaSans,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;font-family:var(--f);color:var(--ink);font-size:15px;line-height:1.45;max-width:1240px;margin:0 auto;padding:6px 20px 48px;-webkit-font-smoothing:antialiased}' +
    '.ir *{box-sizing:border-box}.ir a{color:inherit}.ir [hidden]{display:none!important}' +
    '.ir button{font-family:inherit}' +
    '.ir-wait{display:flex;align-items:center;gap:12px;padding:40px 4px;color:var(--mut);font-size:15px}' +
    '.ir-wait i{width:18px;height:18px;border-radius:50%;border:2px solid var(--lin);border-top-color:var(--k);animation:ir-spin .7s linear infinite}' +
    '@keyframes ir-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.ir-wait i{animation:none}}' +
    '.ir-hero{position:relative;overflow:hidden;margin:12px 0 22px;padding:26px 30px 28px;border-radius:24px;color:#fff;background:radial-gradient(520px 260px at 88% 10%,rgba(90,110,235,.55),transparent 70%),linear-gradient(120deg,#2B2F6B,#1B1F4F 60%,#161A45)}' +
    '.ir-eye{margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:.14em;color:#B9C4FF}' +
    '.ir-h1{margin:0;font-size:34px;line-height:1.15;font-weight:600;color:#fff;overflow-wrap:anywhere}' +
    '.ir-h1 span{font-weight:400;color:#C9D2FF;font-size:22px;margin-left:10px}' +
    '.ir-sform{display:flex;margin:18px 0 0;max-width:760px;background:#fff;border-radius:14px;padding:5px;box-shadow:0 10px 30px rgba(10,14,60,.35)}' +
    '.ir-sform input[type=search]{flex:1 1 auto;min-width:0;border:0;outline:0;background:none;font:400 16px var(--f);color:var(--ink);padding:0 14px;height:46px;-webkit-appearance:none}' +
    '.ir-sform button{flex:none;height:46px;border:0;cursor:pointer;display:grid;place-items:center}' +
    '.ir-sform #ir-mic{width:44px;background:none;color:var(--mut)}' +
    '.ir-sform #ir-mic[data-on="1"]{background:#FDEAE4;color:#B43A36;border-radius:10px}' +
    '.ir-sform .ir-go{width:54px;border-radius:10px;background:var(--grad);color:#fff}' +
    '.ir-sform .ir-go:hover{filter:brightness(1.08)}' +
    '.ir-sform svg{width:20px;height:20px}' +
    '.ir-hint{margin:12px 0 0;font-size:14px;color:#C9D2FF}.ir-hint a{color:#fff;text-decoration:underline;text-underline-offset:3px}' +
    '.ir-note{margin:10px 0 0;font-size:14px;color:#C9D2FF}.ir-note b{color:#fff;font-weight:600}.ir-note a{color:#fff;text-decoration:underline;text-underline-offset:2px}' +
    '.ir-mob{display:none}' +
    '.ir-grid{display:grid;grid-template-columns:300px minmax(0,1fr);gap:28px;align-items:start}' +
    '.ir-main{min-width:0}' +
    '.ir-fh{display:flex;align-items:center;gap:10px;margin:0;padding:2px 0 14px;font:500 20px/1.2 var(--f);color:#2A2F45}' +
    '.ir-fh svg{width:18px;height:18px;flex:none}' +
    '.ir-reset{margin-left:auto;padding:0;border:0;background:none;color:var(--k);font:400 13px var(--f);text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
    '.ir-fx,.ir-fbar{display:none}' +
    '.ir-fl{display:flex;flex-direction:column;gap:8px}' +
    '.ir-tile{border:1px solid rgba(255,255,255,.95);border-radius:16px;background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(14px) saturate(1.3);backdrop-filter:blur(14px) saturate(1.3);box-shadow:0 1px 2px rgba(23,25,35,.05);padding:0 14px}' +
    '.ir-tile[open]{background:rgba(255,255,255,.86);border-color:rgba(43,68,199,.18);box-shadow:0 1px 2px rgba(23,25,35,.05),inset 0 1px 0 #fff}' +
    '.ir-tt{display:flex;align-items:center;min-height:48px;font:400 14px var(--f);color:var(--ink);cursor:pointer;list-style:none;user-select:none}' +
    '.ir-tt::-webkit-details-marker{display:none}' +
    '.ir-tile[open]>.ir-tt{font-weight:500}' +
    '.ir-tt em{font-style:normal;margin:0 10px 0 auto;color:var(--k);font-weight:300;font-size:12.5px}' +
    '.ir-tt:after{content:"";flex:none;width:6px;height:6px;border:solid #5A5F70;border-width:0 1px 1px 0;transform:rotate(45deg);margin:-3px 3px 0 auto}' +
    '.ir-tt em+:after,.ir-tt:has(em):after{margin-left:0}' +
    '.ir-tile[open]>.ir-tt:after{transform:rotate(225deg);margin-top:3px}' +
    '.ir-tb{padding:0 0 12px}' +
    '.ir-row{position:relative;display:flex;align-items:center;gap:10px;width:100%;min-height:34px;margin:0;padding:0;border:0;background:none;font:400 14px var(--f);color:var(--ink);text-align:left;cursor:pointer}' +
    '.ir-row input{position:absolute;opacity:0;width:18px;height:18px;margin:0;left:0}' +
    '.ir-row i{flex:none;width:18px;height:18px;border:1.4px solid #8F98E6;border-radius:5px;background:#fff}' +
    '.ir-row input:checked+i,.ir-row[aria-pressed=true] i{background:var(--k);border-color:var(--k);box-shadow:inset 0 0 0 3px #fff}' +
    '.ir-row input:focus-visible+i,.ir-row:focus-visible i{outline:2px solid var(--k);outline-offset:2px}' +
    '.ir-row b{margin-left:auto;font-weight:400;font-size:12.5px;color:#9096A8}' +
    '.ir-moret{display:block;margin:4px 0 0;padding:0;border:0;background:none;font:400 13px var(--f);color:var(--k);cursor:pointer}' +
    '.ir-pr{display:flex;align-items:center;gap:8px}' +
    '.ir-pr input{flex:1 1 0;min-width:0;height:40px;border:1px solid transparent;border-radius:10px;background:var(--lav2);font:400 14px var(--f);color:var(--ink);padding:0 12px}' +
    '.ir-pr input:focus{outline:2px solid var(--k);outline-offset:1px;background:#fff}' +
    '.ir-apply{display:grid;place-items:center;width:100%;height:44px;margin-top:10px;border:0;border-radius:12px;background:var(--grad);color:#fff;font:500 14px var(--f);cursor:pointer}' +
    '.ir-ac{display:flex;flex-wrap:wrap;gap:6px}' +
    '.ir-ac button{display:inline-flex;align-items:center;gap:5px;padding:7px 11px;border:1px solid #D9DDF3;border-radius:12px;background:#fff;font:400 13.5px/1.2 var(--f);color:var(--ink);cursor:pointer}' +
    '.ir-ac button span{color:#9096A8;font-size:11.5px}.ir-ac button:hover{border-color:#B3BBEA}' +
    '.ir-ac button[aria-pressed=true]{background:var(--k);border-color:var(--k);color:#fff}.ir-ac button[aria-pressed=true] span{color:#D6DCFF}' +
    '.ir-panel{display:flex;align-items:center;gap:16px;background:#fff;border:1px solid var(--lin);border-radius:18px;padding:10px 12px 10px 24px;box-shadow:0 2px 10px rgba(43,68,199,.06)}' +
    '.ir-count{margin:0;font-weight:600;font-size:15px;white-space:nowrap}' +
    '.ir-panel select{min-width:220px;height:46px;padding:0 12px;border:1px solid #D5D2C8;border-radius:12px;background:#fff;color:var(--ink);font:400 14.5px var(--f)}' +
    '.ir-seg{margin-left:auto;display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--lav2)}' +
    '.ir-seg button{height:42px;padding:0 20px;border:0;border-radius:10px;background:transparent;color:#3A3F52;font:500 14px var(--f);cursor:pointer}' +
    '.ir-seg button:hover:not([aria-pressed=true]){background:var(--lav)}' +
    '.ir-seg button[aria-pressed=true]{background:#fff;color:var(--k)}' +
    '.ir-seg button:focus-visible,.ir-panel select:focus-visible{outline:2px solid var(--k);outline-offset:2px}' +
    '.ir-sec{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:18px 0 14px}' +
    '.ir-sec>span{margin-right:6px;font-size:12px;font-weight:600;letter-spacing:.1em;color:var(--mut)}' +
    '.ir-sec .ir-chip{display:inline-flex;align-items:center;gap:5px;padding:9px 16px;border:1px solid var(--lin);border-radius:14px;background:#fff;color:var(--ink);font:400 14.5px/1.2 var(--f);cursor:pointer}' +
    '.ir-sec .ir-chip small{color:#9096A8;font-size:12px}' +
    '.ir-sec .ir-chip:hover{border-color:#B3BBEA}' +
    '.ir-sec .ir-chip[aria-pressed=true]{background:var(--k);border-color:var(--k);color:#fff}.ir-sec .ir-chip[aria-pressed=true] small{color:#D6DCFF}' +
    '.ir-sec .ir-chip:focus-visible{outline:2px solid var(--k);outline-offset:2px}' +
    '.ir-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}' +
    '.ir-card{position:relative;display:grid;grid-template-columns:200px minmax(0,1fr);gap:24px;background:#fff;border:1px solid var(--lin);border-radius:16px;padding:16px;box-shadow:0 2px 10px rgba(23,25,35,.04);transition:border-color .15s}' +
    '.ir-card:hover{border-color:rgba(43,68,199,.4)}' +
    '.ir-ph{display:grid;place-items:center;width:200px;height:160px;border-radius:14px;background:var(--lav2);overflow:hidden}' +
    '.ir-ph img{max-width:84%;max-height:84%;object-fit:contain;mix-blend-mode:multiply}' +
    '.ir-main2{min-width:0;display:flex;flex-direction:column}' +
    '.ir-top{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--k);text-transform:uppercase}' +
    '.ir-top s{display:inline-flex;align-items:center;gap:6px;text-decoration:none;text-transform:none;letter-spacing:0;font-weight:400;font-size:11.5px;color:var(--mut)}' +
    '.ir-top s:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--ok)}' +
    '.ir-name{display:block;margin:6px 0 8px;font-size:17px;line-height:1.3;font-weight:500;color:var(--ink);text-decoration:none;overflow-wrap:anywhere}' +
    '.ir-name:hover{color:var(--k)}.ir-name mark{background:none;color:inherit;font-weight:inherit}' +
    '.ir-sp{display:grid;grid-template-columns:170px minmax(0,1fr);gap:4px 8px;font-size:14px;line-height:1.35;margin:0 0 10px}' +
    '.ir-sp dt{color:var(--mut)}.ir-sp dd{margin:0}' +
    '.ir-bt{display:grid;grid-template-columns:minmax(0,1fr) 118px 164px 160px;align-items:center;column-gap:14px;margin-top:auto}' +
    '.ir-art{min-width:0;font-size:12.5px;line-height:1.35;color:var(--mut)}.ir-art b{display:block;white-space:nowrap;font-weight:400;color:#4F566B;overflow-wrap:anywhere}' +
    '.ir-cp{display:inline-grid;place-items:center;width:24px;height:24px;margin:0 0 0 4px;padding:0;border:0;border-radius:6px;background:none;color:var(--mut);cursor:pointer;vertical-align:-6px}' +
    '.ir-cp:hover{background:var(--lav2);color:var(--k)}.ir-cp svg{width:14px;height:14px}' +
    '.ir-cmp{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:118px;height:34px;border:1px solid var(--lin);border-radius:10px;background:#fff;font:500 13.5px/1 var(--f);color:#3A3F52;cursor:pointer;transition:border-color .15s,background .15s}' +
    '.ir-cmp input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}' +
    '.ir-cmp i{flex:none;width:16px;height:16px;border:1.4px solid #B7BCCB;border-radius:5px;background:#fff;position:relative}' +
    '.ir-cmp:hover{border-color:rgba(43,68,199,.4);background:#F7F8FE}' +
    '.ir-cmp:has(input:checked){border-color:var(--k);background:var(--lav2);color:var(--k)}' +
    '.ir-cmp input:checked+i{background:var(--k);border-color:var(--k)}' +
    '.ir-cmp input:checked+i:after{content:"";position:absolute;left:4.5px;top:1px;width:4px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}' +
    '.ir-cmp:has(input:disabled){opacity:.5;cursor:not-allowed}' +
    '.ir-cmp:has(input:focus-visible){outline:2px solid var(--k);outline-offset:2px}' +
    '.ir-price{justify-self:end;text-align:right;white-space:nowrap;font-size:24px;line-height:1.2;font-weight:600;font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}' +
    '.ir-price small{font-size:20px;margin-left:6px}' +
    '.ir-price.ir-ask0{font-size:14px;font-weight:400;color:var(--mut)}' +
    '.ir-add,.ir-ask{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:160px;height:46px;padding:0;border:0;border-radius:12px;background:var(--lav);color:var(--k);font:500 15px var(--f);cursor:pointer;text-decoration:none;transition:background .15s}' +
    '.ir-add svg{width:18px;height:18px;flex:none}' +
    '.ir-add:hover,.ir-ask:hover{background:#DCE1FA}' +
    '.ir-add[data-s=in],.ir-add[data-s=in]:hover{background:#DCEFE6;color:#14704A}' +
    '.ir-add[data-s=err]{background:#FDEAE4;color:#B43A36}' +
    '.ir-add[disabled]{opacity:.7;cursor:default}' +
    '.ir-add:focus-visible,.ir-ask:focus-visible,.ir-more:focus-visible,.ir-reset:focus-visible,.ir-moret:focus-visible,.ir-apply:focus-visible{outline:2px solid var(--k);outline-offset:2px}' +
    '.ir-tile-v .ir-list,.ir-list.ir-tl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}' +
    '.ir-tl .ir-card{display:flex;flex-direction:column;gap:0;padding:12px}' +
    '.ir-tl .ir-ph{width:100%;height:200px}' +
    '.ir-tl .ir-main2{flex:1;padding:12px 4px 4px}' +
    '.ir-tl .ir-name{margin:6px 0 12px;font-size:15px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
    '.ir-tl .ir-sp{display:none}' +
    '.ir-tl .ir-bt{grid-template-columns:minmax(0,1fr) auto;row-gap:10px}' +
    '.ir-tl .ir-art{display:none}' +
    '.ir-tl .ir-cmp{grid-column:1;grid-row:1;width:112px;justify-self:start}' +
    '.ir-tl .ir-price{grid-column:2;grid-row:1;font-size:21px}.ir-tl .ir-price small{font-size:17px}' +
    '.ir-tl .ir-add,.ir-tl .ir-ask{grid-column:1/-1;grid-row:2;width:100%}' +
    '.ir-moreb{display:flex;justify-content:center;margin:22px 0 14px}' +
    '.ir-more{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:50px;padding:0 30px;border:0;border-radius:14px;background:var(--lav);color:var(--k);font:500 15px var(--f);cursor:pointer}' +
    '.ir-more:hover{background:#DCE1FA}' +
    '.ir-assort:empty{display:none}.ir-assort{margin:0 0 40px}' +
    '.ir-assort .ish-assort-row{display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 22px;border:1px dashed rgba(43,68,199,.35);border-radius:16px;background:rgba(255,255,255,.62);color:var(--k);font-weight:500;font-size:15px;text-decoration:none}' +
    '.ir-assort .ish-assort-row:hover{background:rgba(255,255,255,.9)}' +
    '.ir-empty{margin:24px 0 0;padding:22px;background:var(--lav2);border:1px solid #D5DCF7;border-radius:20px}.ir-empty h3{margin:0 0 8px;font-size:18px}' +
    '.ir-empty p{margin:0 0 10px;color:var(--mut)}.ir-empty a{color:var(--k)}.ir-sug{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 12px}' +
    '.ir-sug a{display:inline-flex;align-items:center;min-height:38px;padding:0 14px;border:1px solid #D5DCF7;border-radius:12px;background:#fff;text-decoration:none;color:var(--ink);font-size:14px}' +
    '.ir-toast{position:fixed;z-index:9700;left:50%;bottom:22px;transform:translateX(-50%) translateY(20px);opacity:0;pointer-events:none;display:flex;gap:14px;align-items:center;padding:12px 18px;background:var(--ink);color:#fff;border-radius:16px;font-size:14px;box-shadow:0 12px 32px rgba(23,25,35,.3);transition:opacity .2s,transform .2s;max-width:calc(100vw - 24px)}' +
    '.ir-toast.on{opacity:1;transform:translateX(-50%);pointer-events:auto}.ir-toast a{color:#B9C4FF;font-weight:600;white-space:nowrap}' +
    '.ir-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '/* сайт красит все ссылки страницы (синий цвет, подчёркивание рамкой): свои ссылки закрепляем по id, чтобы вид не зависел от стилей Tilda */' +
    '#ish-results a.ir-name,#ish-results a.ir-ph,#ish-results a.ir-ask,#ish-results .ir-sug a,#ish-results .ir-assort a{border:0!important;box-shadow:none!important;text-decoration:none!important}' +
    '#ish-results a.ir-name{color:var(--ink)!important;display:block}' +
    '#ish-results a.ir-name:hover{color:var(--k)!important}' +
    '#ish-results .ir-hint a,#ish-results .ir-note a{color:#fff!important;text-decoration:underline!important;text-underline-offset:3px;border:0!important}' +
    '#ish-results a.ir-ask{color:var(--k)!important}' +
    '#ish-results .ir-sug a{color:var(--ink)!important;border:1px solid #D5DCF7!important}' +
    '#ish-results .ir-assort a{color:var(--k)!important}' +
    '#ish-results .ir-assort a.ish-assort-row{border:1px dashed rgba(43,68,199,.35)!important}' +
    '#ish-results .ir-empty a{color:var(--k)}' +
    '#ish-results .ir-toast a{color:#B9C4FF}' +
    '@media(max-width:1100px){.ir-tl{grid-template-columns:repeat(2,minmax(0,1fr))}.ir-list.ir-tl{grid-template-columns:repeat(2,minmax(0,1fr))}.ir-sp{grid-template-columns:140px minmax(0,1fr)}}' +
    '@media(max-width:900px){' +
    '.ir-grid{display:block}' +
    '.ir-mob{display:block}' +
    '.ir-fbtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:50px;margin:0 0 12px;border:1px solid #C9CFF2;border-radius:16px;background:linear-gradient(90deg,rgba(160,172,240,.35),rgba(255,255,255,.7));color:var(--k);font:500 15px var(--f);cursor:pointer}' +
    '.ir-fbtn svg{width:18px;height:18px}' +
    '.ir-side{display:none}' +
    '.ir.ir-dr .ir-side{display:flex;flex-direction:column;position:fixed;inset:0;z-index:99990;padding:16px 14px 88px;overflow:auto;background:#F4F5FD;-webkit-overflow-scrolling:touch}' +
    '.ir.ir-dr .ir-fh{font-size:22px}.ir.ir-dr .ir-reset{display:none}' +
    '.ir.ir-dr .ir-fx{display:grid;place-items:center;margin-left:auto;width:44px;height:44px;border:0;border-radius:50%;background:#fff;font-size:22px;line-height:1;color:var(--ink);cursor:pointer}' +
    '.ir.ir-dr .ir-fbar{display:flex;gap:12px;position:fixed;left:0;right:0;bottom:0;z-index:99991;padding:14px;background:#fff;border-radius:22px 22px 0 0;box-shadow:0 -8px 24px rgba(43,68,199,.12)}' +
    '.ir-fbar button{height:50px;border:0;cursor:pointer;font:500 16px var(--f)}' +
    '.ir-fres{flex:1;background:none;color:var(--mut)}' +
    '.ir-fshow{flex:1.5;border-radius:14px;background:var(--grad);color:#fff}' +
    '.ir-tile{background:rgba(255,255,255,.9)}' +
    '}' +
    '@media(max-width:640px){' +
    '.ir{padding:2px 14px 40px}' +
    '.ir-hero{padding:20px 18px;margin:12px 0 16px;border-radius:20px}' +
    '.ir-h1{font-size:25px}.ir-h1 span{display:block;margin:4px 0 0;font-size:16px}' +
    '.ir-sform{margin-top:14px}.ir-sform input[type=search]{padding:0 8px}.ir-hint{font-size:13px}' +
    '.ir-panel{padding:8px 10px 8px 16px;gap:10px;border-radius:16px;flex-wrap:wrap}' +
    '.ir-count{flex:1 1 100%;font-size:14px}' +
    '.ir-panel select{min-width:0;flex:1;height:42px;font-size:13.5px}' +
    '.ir-seg{margin:0}.ir-seg button{height:36px;padding:0 12px}' +
    '.ir-sec{flex-wrap:nowrap;overflow-x:auto;margin:14px -14px 12px;padding:0 14px;scrollbar-width:none}.ir-sec::-webkit-scrollbar{display:none}.ir-sec>span{display:none}.ir-sec .ir-chip{flex:none;padding:8px 13px;font-size:13.5px}' +
    '.ir-card{grid-template-columns:104px minmax(0,1fr);gap:4px 14px;padding:12px;border-radius:14px}' +
    '.ir-ph{width:104px;height:104px;border-radius:12px;grid-row:1}' +
    '.ir-main2{display:contents}' +
    '.ir-hd{grid-column:2;min-width:0}' +
    '.ir-name{font-size:14.5px;margin:4px 0 0}' +
    '.ir-sp{grid-column:1/-1;grid-template-columns:128px minmax(0,1fr);font-size:13px;margin:6px 0 4px}' +
    '.ir-sp dt:nth-of-type(n+4),.ir-sp dd:nth-of-type(n+4){display:none}' +
    '.ir-bt{grid-column:1/-1;grid-template-columns:auto minmax(0,1fr);row-gap:10px;column-gap:10px}' +
    '.ir-art{grid-column:1/-1}' +
    '.ir-cmp{grid-column:1;grid-row:2}.ir-price{grid-column:2;grid-row:2;font-size:21px}' +
    '.ir-add,.ir-ask{grid-column:1/-1;grid-row:3;width:100%}' +
    '.ir-moreb .ir-more{width:100%}' +
    '.ir-assort .ish-assort-row{font-size:14px;padding:0 16px;height:52px}' +
    '.ir-list.ir-tl{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}' +
    '.ir-tl .ir-card{display:flex;padding:8px;border-radius:14px}' +
    '.ir-tl .ir-ph{width:100%;height:132px;grid-row:auto}' +
    '.ir-tl .ir-main2{display:flex;padding:8px 2px 2px}' +
    '.ir-tl .ir-name{font-size:13.5px}' +
    '.ir-tl .ir-bt{grid-template-columns:1fr;row-gap:8px}' +
    '.ir-tl .ir-cmp{grid-column:1;grid-row:2;width:100%}.ir-tl .ir-price{grid-column:1;grid-row:1;justify-self:start;font-size:17px}.ir-tl .ir-price small{font-size:14px}' +
    '.ir-tl .ir-add,.ir-tl .ir-ask{grid-row:3;height:40px;font-size:14px}' +
    '.ir-tl .ir-add svg{display:none}' +
    '}';

  var st = null;      // состояние текущей выдачи
  var S = null, box = null, started = false, cartLoading = null, toastEl = null, toastT = 0, items = {};

  /* ───────────── корзина (тот же путь, что у кода каталога на странице, блок 4204439103) ───────────── */
  function lbl(b, t) { var x = b.querySelector('.ir-al'); if (t == null) return (x || b).textContent; (x || b).textContent = t; }
  function onCartMark(b, on) {          // «✓ В корзине» ⇄ «В корзину» по составу корзины (tcart.products[].uid = String(p.id))
    if (on) { if (b.getAttribute('data-s') !== 'in') b.setAttribute('data-s', 'in'); if (lbl(b) !== '✓ В корзине') lbl(b, '✓ В корзине'); }
    else if (b.getAttribute('data-s') === 'in') { b.removeAttribute('data-s'); lbl(b, 'В корзину'); }
  }
  function markCart() {
    if (!box) return;
    [].forEach.call(box.querySelectorAll('.ir-add'), function (b) {
      if (b.disabled || b.getAttribute('data-s') === 'err') return;
      var p = items[b.getAttribute('data-i')]; onCartMark(b, !!p && inCart(p.id) > 0);
    });
  }
  function stored() { try { return JSON.parse(root.localStorage.getItem('tcart') || 'null'); } catch (e) { return null; } }
  function inCart(uid) { var c = stored(), n = 0; ((c && c.products) || []).forEach(function (p) { if (p && String(p.uid) === String(uid)) n += parseInt(p.quantity, 10) || 0; }); return n; }
  function cartScript() {
    if (typeof root.tcart__addProduct === 'function') return Promise.resolve();
    if (cartLoading) return cartLoading;
    cartLoading = new Promise(function (ok) {
      var s = document.createElement('script'); s.src = CART_JS; s.async = true; s.onload = function () { ok(); }; s.onerror = function () { ok(); };
      (document.head || document.documentElement).appendChild(s); setTimeout(ok, WAIT_MS);
    });
    return cartLoading;
  }
  function cartPrepare() {
    var stub = false;
    if (document.body && !document.querySelector('.t706')) {
      var z = document.createElement('div'); z.className = 't706 ish-t706-stub'; z.setAttribute('data-opencart-onorder', 'no');
      for (var k in CURRENCY) z.setAttribute(k, CURRENCY[k]);
      z.style.cssText = 'display:none!important'; z.setAttribute('aria-hidden', 'true'); document.body.appendChild(z); stub = true;
    }
    if (!root.tcart || typeof root.tcart !== 'object' || !root.tcart.products) {
      try { if (typeof root.t_cart__loadCartData === 'function') root.tcart = root.t_cart__loadCartData(); } catch (e) {}
    }
    if (!root.tcart || !root.tcart.products) {
      root.tcart = { products: [], prodamount: 0, amount: 0, total: 0, system: 'none', settings: {}, currency: 'тг.', currency_txt: 'тг.', currency_txt_l: '', currency_txt_r: ' тг.', currency_side: 'r', currency_sep: ',', currency_dec: '' };
    }
    return stub;
  }
  // возвращает Promise<boolean>: лежит ли товар в корзине после вызова (проверка по хранилищу, а не по коду возврата)
  function addToCart(p, qty) {
    qty = qty || 1;
    return cartScript().then(function () {
      cartPrepare();
      var was = inCart(p.id), abs = (root.location && root.location.origin) || '';
      var item = { uid: String(p.id), gen_uid: String(p.id), lid: '', sku: p.sku || '', name: esc(p.title), price: p.price, img: p.photo || '', url: p.url ? abs + p.url : abs + '/katalog',
                   recid: REC, part_uids: [], pack_label: 'lwh', pack_m: '0', pack_x: '0', pack_y: '0', pack_z: '0', quantity: qty };
      var bubble = root.tcart__showBubble;
      if (typeof bubble === 'function') root.tcart__showBubble = function () {};
      try { if (typeof root.tcart__addProduct === 'function') root.tcart__addProduct(item); }
      catch (e) { if (root.console) console.warn('[ish] корзина Tilda споткнулась:', e && e.message); }
      if (typeof bubble === 'function') root.tcart__showBubble = bubble;
      if (inCart(p.id) <= was) {                       // родной не положил — пишем сами, в формате Tilda (как код каталога на странице)
        var total = was + qty, rest = (root.tcart.products || []).filter(function (x) { return x && String(x.uid) !== String(p.id); });
        rest.push({ uid: String(p.id), id: String(p.id), name: item.name, price: String(p.price), quantity: total, sku: item.sku, url: item.url, img: item.img,
                    amount: Math.round(p.price * total * 100) / 100, ts: Math.floor(Date.now() / 1000) });
        var sh = 0, sum = 0; rest.forEach(function (x) { sh += parseInt(x.quantity, 10) || 0; sum += parseFloat(x.amount) || 0; });
        root.tcart.products = rest; root.tcart.total = sh; root.tcart.prodamount = root.tcart.amount = Math.round(sum * 100) / 100;
        try { root.localStorage.setItem('tcart', JSON.stringify(root.tcart)); } catch (e) {}
      }
      try { if (typeof root.tcart__reDrawCartIcon === 'function') root.tcart__reDrawCartIcon(); } catch (e) {}
      return inCart(p.id) > was;
    });
  }
  function toast(html) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ir-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = html; toastEl.classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  /* ───────────── запрос и отрисовка ───────────── */
  function run(offset, limit) {
    return S.query(st.q, { limit: limit, offset: offset, brands: st.brands, cats: st.cat >= 0 ? [st.cat] : [], priceMin: st.pmin, priceMax: st.pmax, sort: st.sort === 'rel' ? undefined : st.sort,
      attrs: st.attrs, inStock: st.inStock, raw: st.raw, ignoreQueryPrice: true, attrGroups: 4, completions: false });
  }
  function $(sel) { return box.querySelector(sel); }
  function saveState() { try { root.sessionStorage.setItem('ish_res', JSON.stringify({ q: st.q0 || st.q, cat: st.cat, brands: st.brands, pmin: st.pmin, pmax: st.pmax, sort: st.sort, attrs: st.attrs, inStock: st.inStock, raw: st.raw, view: st.view, shown: st.shown, y: root.pageYOffset || 0 })); } catch (e) {} }
  function loadState(q) { try { var o = JSON.parse(root.sessionStorage.getItem('ish_res') || 'null'); return o && o.q === q ? o : null; } catch (e) { return null; } }
  function numOrNull(v) { v = String(v == null ? '' : v).replace(/[^\d.,]/g, '').replace(',', '.'); if (!v) return null; var n = parseFloat(v); return isFinite(n) ? n : null; }

  function skeleton() {
    box.innerHTML = '<div class="ir-wait" role="status"><i></i>Ищем по каталогу…</div>';
  }
  var LUPA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
  var CARTIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>';
  var COPYIC = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 10.5V4a1 1 0 0 1 1-1h6.5"/></svg>';
  var FILTIC = '<svg viewBox="0 0 16 16" fill="none" stroke="#2B2F6B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h12l-4.6 5.4V13l-2.8-1.4V8.4z"/></svg>';
  var EAGER = 8, SHORT = 6;     // первые 8 карточек без loading=lazy; в плитках «Бренд»/«Раздел» первые 6 строк, остальное по «Показать ещё»

  function frame() {
    var voice = root.ISHSearch && root.ISHSearch.voice && root.ISHSearch.voice.supported();
    box.innerHTML = '<section class="ir-hero"><p class="ir-eye">ПОИСК ПО КАТАЛОГУ</p><h1 class="ir-h1" id="ir-h1"></h1>' +
        '<form class="ir-sform" id="ir-sform" role="search" action="#"><input type="search" id="ir-q" aria-label="Поиск по каталогу" autocomplete="off" enterkeyhint="search">' +
        (voice ? '<button type="button" id="ir-mic" aria-label="Голосовой поиск" title="Голосовой поиск">' + MIC + '</button>' : '') +
        '<button type="submit" class="ir-go" aria-label="Найти">' + LUPA + '</button></form>' +
        '<p class="ir-hint">Не нашли нужное? Пришлите список — <a href="/podbor">подберём</a></p><p class="ir-note" id="ir-note"></p></section>' +
      '<div class="ir-mob"><button type="button" class="ir-fbtn" id="ir-fopen">' + FILTIC + 'Фильтры <span id="ir-fcnt"></span></button></div>' +
      '<div class="ir-grid"><aside class="ir-side" id="ir-side" aria-label="Фильтры"><h3 class="ir-fh">' + FILTIC + 'Фильтры<button type="button" class="ir-reset" id="ir-reset" hidden>Сбросить всё</button><button type="button" class="ir-fx" id="ir-fclose" aria-label="Закрыть фильтры">×</button></h3>' +
        '<div class="ir-fl" id="ir-fl"></div><div class="ir-fbar"><button type="button" class="ir-fres" id="ir-fres2">Сбросить</button><button type="button" class="ir-fshow" id="ir-fshow">Показать</button></div></aside>' +
      '<main class="ir-main"><div class="ir-panel" aria-live="polite"><span class="ir-count" id="ir-count"></span>' +
        '<select id="ir-sort" aria-label="Порядок"><option value="rel">По релевантности</option><option value="price_asc">Сначала дешёвые</option><option value="price_desc">Сначала дорогие</option></select>' +
        '<div class="ir-seg" role="group" aria-label="Вид списка"><button type="button" data-v="list" aria-pressed="true">Список</button><button type="button" data-v="tile" aria-pressed="false">Плитка</button></div></div>' +
      '<div class="ir-sec" id="ir-chips" role="group" aria-label="Разделы"></div>' +
      '<ul class="ir-list" id="ir-list"></ul><div class="ir-moreb" id="ir-moreb"></div><div id="ir-empty"></div><div class="ir-assort" id="ir-assort"></div></main></div>';
    $('#ir-sort').value = st.sort; $('#ir-q').value = st.q0 || st.q;
    applyView();
  }
  function applyView() {
    var tl = st.view === 'tile', l = $('#ir-list'); if (l) l.classList.toggle('ir-tl', tl);
    [].forEach.call(box.querySelectorAll('.ir-seg button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === (tl ? 'tile' : 'list'))); });
  }
  function cardHtml(p, k) {
    var url = p.url || katalogUrl(p.title), th = p.photo ? p.photo.replace(/\/([^\/?#]+)$/, '/-/resize/400x/$1') : '';
    var ph = th ? '<img ' + ((k || 0) < EAGER ? 'loading="eager" ' : 'loading="lazy" ') + 'decoding="async" width="200" height="160" alt="" src="' + esc(th) + '" onerror="this.onerror=null;this.src=\'' + esc(p.photo) + '\'">' : '<i></i>';
    var sp = (p.specs || []).map(function (x) { return '<dt>' + esc(x[0]) + ':</dt><dd>' + esc(x[1]) + '</dd>'; }).join('');
    var art = p.sku ? '<span class="ir-art">Артикул: <b>Арт. iSoft ' + esc(p.sku) + '<button type="button" class="ir-cp" data-cp="' + esc(p.sku) + '" aria-label="Скопировать артикул" title="Скопировать артикул">' + COPYIC + '</button></b></span>' : '<span class="ir-art"></span>';
    var money0 = p.price > 0 ? String(Math.round(p.price)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
    var buy = p.price > 0
      ? '<span class="ir-price" data-product-price-def="' + Math.round(p.price) + '">' + money0 + '<small>₸</small></span><button type="button" class="ir-add" data-i="' + p.i + '"' + (inCart(p.id) > 0 ? ' data-s="in">' + CARTIC + '<span class="ir-al">✓ В корзине</span>' : '>' + CARTIC + '<span class="ir-al">В корзину</span>') + '</button>'
      : '<span class="ir-price ir-ask0">Цена по запросу</span><a class="ir-ask" href="' + esc(url) + '">Уточнить цену</a>';
    return '<li class="ir-card" data-i="' + p.i + '" data-product-uid="' + esc(p.id) + '" data-product-url="' + esc(url) + '"><a class="ir-ph" href="' + esc(url) + '" tabindex="-1" aria-hidden="true">' + ph + '</a>' +
      '<div class="ir-main2"><div class="ir-hd"><div class="ir-top">' + esc(p.brand || p.cat) + (p.qty > 0 ? '<s>в наличии</s>' : '') + '</div><a class="ir-name" href="' + esc(url) + '">' + esc(p.title) + '</a></div>' +
      (sp ? '<dl class="ir-sp">' + sp + '</dl>' : '') +
      '<div class="ir-bt">' + art + '<label class="ir-cmp"><input type="checkbox" aria-label="Сравнить: ' + esc(p.title) + '"><i></i><span>Сравнить</span></label>' + buy + '</div></div></li>';
  }
  function catsOf(r) {
    var cats = ((r.facets && r.facets.cats) || []).slice(), has = false;
    cats.forEach(function (c) { if (c.i === st.cat) has = true; });
    if (st.cat >= 0 && !has) cats.push({ i: st.cat, name: st.catName || 'Раздел', n: 0 });
    return cats;
  }
  function fillChips(r) {
    var cats = catsOf(r), all = 0, h = '<span>РАЗДЕЛ</span>';
    cats.forEach(function (c) { all += c.n; });
    h += '<button type="button" class="ir-chip" data-cat="-1" aria-pressed="' + (st.cat < 0) + '">Все <small>' + all + '</small></button>';
    cats.forEach(function (c) { if (c.n > 0 || c.i === st.cat) h += '<button type="button" class="ir-chip" data-cat="' + c.i + '" data-name="' + esc(c.name) + '" aria-pressed="' + (st.cat === c.i) + '">' + esc(c.name) + ' <small>' + c.n + '</small></button>'; });
    $('#ir-chips').innerHTML = h;
    return all;
  }
  function tile(key, title, badge, body, def) {
    var o = st.open && (key in st.open) ? st.open[key] : def;
    return '<details class="ir-tile" data-k="' + esc(key) + '"' + (o ? ' open' : '') + '><summary class="ir-tt">' + esc(title) + (badge ? '<em>' + badge + '</em>' : '') + '</summary><div class="ir-tb">' + body + '</div></details>';
  }
  function moreRow(key, total, shown) { return total > shown ? '<button type="button" class="ir-moret" data-more="' + key + '">Показать ещё ' + (total - shown) + '</button>' : (st[key] && total > SHORT ? '<button type="button" class="ir-moret" data-more="' + key + '">Свернуть</button>' : ''); }
  // левая колонка: стеклянные плитки. Значения те же, что у прежних фильтров (st.cat / st.brands / pmin / pmax / inStock / attrs), обработчики общие
  function fillSide(r) {
    var cats = catsOf(r).filter(function (c) { return c.n > 0 || c.i === st.cat; }), h = '', pr = r.facets && r.facets.price;
    var vis = st.catAll ? cats : cats.filter(function (c, i) { return i < SHORT || c.i === st.cat; });
    h += tile('cat', 'Раздел', st.cat >= 0 ? '1' : '', vis.map(function (c) {
      var on = st.cat === c.i;
      return '<button type="button" class="ir-chip ir-row" data-cat="' + (on ? -1 : c.i) + '" data-name="' + esc(on ? '' : c.name) + '" aria-pressed="' + on + '"><i></i>' + esc(c.name) + '<b>' + c.n + '</b></button>';
    }).join('') + moreRow('catAll', cats.length, vis.length), true);
    // бренды: склеиваем по регистру (ASUS/Asus, Dell/DELL) - один ряд, фильтр по всем номерам
    var bs = ((r.facets && r.facets.brands) || []).slice(), names = {};
    bs.forEach(function (b) { names[b.i] = 1; });
    st.brandNames = st.brandNames || {};
    bs.forEach(function (b) { st.brandNames[b.i] = b.name; });
    st.brands.forEach(function (i) { if (!names[i]) bs.push({ i: i, name: st.brandNames[i] || 'Бренд', n: 0 }); });
    var gr = {}, ord = [];
    bs.forEach(function (b) {
      var k = String(b.name).toLowerCase().replace(/\s+/g, ' ').trim();
      if (!gr[k]) { gr[k] = { name: b.name, ids: [], n: 0 }; ord.push(gr[k]); }
      gr[k].ids.push(b.i); gr[k].n += b.n;
    });
    ord.forEach(function (g) { g.on = g.ids.every(function (i) { return st.brands.indexOf(i) >= 0; }); });
    var bv = st.brAll ? ord : ord.filter(function (g, i) { return i < SHORT || g.on; });
    h += tile('brand', 'Бренд', st.brands.length ? String(ord.filter(function (g) { return g.on; }).length) : '', '<div id="ir-bl">' + (bv.map(function (g) {
      return '<label class="ir-row"><input type="checkbox" value="' + g.ids.join(',') + '"' + (g.on ? ' checked' : '') + '><i></i>' + esc(g.name) + '<b>' + g.n + '</b></label>';
    }).join('') || '<p>Брендов нет</p>') + '</div>' + moreRow('brAll', ord.length, bv.length), true);
    var p1 = st.pmin == null ? '' : String(st.pmin), p2 = st.pmax == null ? '' : String(st.pmax);
    h += tile('price', 'Цена, ₸', (st.pmin != null || st.pmax != null) ? '1' : '', '<div class="ir-pr"><input type="text" inputmode="numeric" id="ir-p1" aria-label="Цена от" autocomplete="off" value="' + esc(p1) + '" placeholder="' + (pr && pr.max > 0 ? 'от ' + Math.round(pr.min) : 'от') + '"><input type="text" inputmode="numeric" id="ir-p2" aria-label="Цена до" autocomplete="off" value="' + esc(p2) + '" placeholder="' + (pr && pr.max > 0 ? 'до ' + Math.round(pr.max) : 'до') + '"></div><button type="button" class="ir-apply" id="ir-apply">Применить</button>', true);
    var stk = r.facets && r.facets.stock;
    if ((stk && stk.no > 0) || st.inStock) h += tile('stock', 'Наличие', st.inStock ? '1' : '', '<label class="ir-row ir-stock"><input type="checkbox" id="ir-stock"' + (st.inStock ? ' checked' : '') + '><i></i>Только в наличии</label>', true);
    ((r.facets && r.facets.attrs) || []).forEach(function (g, k) {
      var sel = (st.attrs && st.attrs[g.name]) || [], b = '';
      g.values.forEach(function (v) {
        var on = sel.indexOf(v.name) >= 0;
        if (v.n > 0 || on) b += '<button type="button" data-a="' + esc(g.name) + '" data-v="' + esc(v.name) + '" aria-pressed="' + on + '">' + esc(v.name) + ' <span>' + v.n + '</span></button>';
      });
      if (b) h += tile('a:' + g.name, g.name, sel.length ? String(sel.length) : '', '<div class="ir-ac">' + b + '</div>', k < 1);
    });
    $('#ir-fl').innerHTML = h;
  }
  function nFilters() { return (st.cat >= 0 ? 1 : 0) + (st.brands.length ? 1 : 0) + (st.pmin != null || st.pmax != null ? 1 : 0) + (st.inStock ? 1 : 0) + sortedKeys(st.attrs).length; }
  function anyFilter() { return st.cat >= 0 || st.brands.length || st.pmin != null || st.pmax != null || st.sort !== 'rel' || st.inStock || sortedKeys(st.attrs).length; }
  function head(r, all) {
    var n = r.total || 0;
    $('#ir-count').textContent = n ? 'Найдено ' + n : 'Ничего не найдено';
    $('#ir-h1').innerHTML = 'Поиск: «' + esc(st.q0 || st.q) + '»<span>' + (all ? 'найдено ' + all + ' ' + plural(all, 'товар', 'товара', 'товаров') : 'ничего не найдено') + '</span>';
    var note = '';
    if (st.raw) note += 'Показано точно по запросу «<b>' + esc(st.q) + '</b>». <a href="' + esc(katalogUrl(st.q, false)) + '">Исправить автоматически</a>. ';
    else if (r.corrected && r.corrected.to) note += 'Показано для «<b>' + esc(r.corrected.to) + '</b>». <a href="' + esc(katalogUrl(st.q, true)) + '">Искать «' + esc(st.q) + '»</a>. ';
    if (st.priceNote) note += 'Цена из запроса: <b>' + esc(st.priceNote) + '</b> (можно изменить в фильтре «Цена»). ';
    if (r.suggestion && r.total < 10) note += 'Возможно, вы искали «<a href="' + esc(katalogUrl(r.suggestion.q)) + '">' + esc(r.suggestion.q) + '</a>». ';
    if (r.relaxed && r.relaxed.dropped && r.relaxed.dropped.length) note += 'Нет товаров со словами «' + r.relaxed.dropped.map(esc).join(' ') + '» — показано по «<b>' + r.relaxed.kept.map(esc).join(' ') + '</b>». ';
    $('#ir-note').innerHTML = note; $('#ir-note').style.display = note ? '' : 'none';
    $('#ir-reset').hidden = !anyFilter();
    $('#ir-fshow').textContent = 'Показать ' + n;
    var nf = nFilters(); $('#ir-fcnt').textContent = nf ? '· ' + nf : '';
  }
  function empty(r) {
    var h = '<div class="ir-empty"><h3>По запросу «' + esc(st.q) + '» ничего не нашли</h3>';
    if (anyFilter()) h += '<p>Попробуйте снять фильтры.</p>';
    if (r.suggestion) h += '<p>Возможно, вы искали: <a href="' + esc(katalogUrl(r.suggestion.q)) + '"><b>' + esc(r.suggestion.q) + '</b></a> (' + r.suggestion.total + ')</p>';
    if (st.raw) h += '<p><a href="' + esc(katalogUrl(st.q, false)) + '">Искать с исправлением опечаток и раскладки</a></p>';
    var w = (r.fallback && r.fallback.words) || [];
    if (w.length) { h += '<p>Возможно, вы искали:</p><div class="ir-sug">' + w.map(function (x) { return '<a href="' + esc(katalogUrl(x)) + '">' + esc(x) + '</a>'; }).join('') + '</div>'; }
    var cs = ((r.fallback && r.fallback.categories) || []).filter(function (c) { return c.url && (window.ISH_SKS_ON || !/^\/(kabel-vitaya-para|rozetki-i-moduli|patch-paneli|patch-kordy|kabel-kanaly-i-koroba|konnektory-i-instrument)$/.test(c.url)); }).slice(0, 6);
    if (cs.length) { h += '<p>Разделы каталога:</p><div class="ir-sug">' + cs.map(function (c) { return '<a href="' + esc(c.url) + '">' + esc(c.name) + '</a>'; }).join('') + '</div>'; }
    h += '<p>Не нашли нужное? Пришлите список — подберём. <a href="/podbor">Оставить запрос на подбор</a></p></div>';
    $('#ir-empty').innerHTML = h;
  }
  function more(r) {
    var left = (r.total || 0) - st.shown;
    $('#ir-moreb').innerHTML = left > 0 ? '<button type="button" class="ir-more" id="ir-more">Показать ещё ' + Math.min(STEP, left) + ' <span class="ir-sr">из ' + left + '</span></button>' : '';
  }
  // полная перерисовка выдачи (смена запроса, фильтра, сортировки); shown — сколько карточек показать сразу
  function renderAll(shown) {
    var lim = Math.max(STEP, shown || STEP), r = run(0, lim);
    items = {}; r.products.forEach(function (p) { items[p.i] = p; });
    lastR = r;
    st.shown = r.products.length;
    $('#ir-empty').innerHTML = '';
    var all = fillChips(r); head(r, all); fillSide(r); applyView();
    $('#ir-list').innerHTML = r.products.map(function (p, k) { return cardHtml(p, k); }).join('');
    more(r);
    if (!r.total) empty(r);
    var htok = ++hintTok;           // строка «ещё N+ в расширенном каталоге (под заказ) →»; и под выдачей, и в пустой выдаче («Поискать в расширенном каталоге →»)
    try {
      if (root.ISHSearch && root.ISHSearch.assortHint) root.ISHSearch.assortHint(st.q, r.total).then(function (x) {
        var box2 = box && box.querySelector('#ir-assort');
        if (box2 && htok === hintTok) box2.innerHTML = x ? x.html : '';
      });
    } catch (e) {}
    if (!st.tracked) {          // один раз за открытие страницы: запрос, а если ничего — «искали и не нашли»
      st.tracked = true;
      if (!r.total && root.ISHSearch && root.ISHSearch.trackZero) root.ISHSearch.trackZero(st.q0 || st.q, 'results');   // search_term «НЕТ · запрос» (встроенное измерение GA4)
      else track('search', { search_term: st.q0 || st.q, results: r.total, source: 'results' });
      try { if (root.ISHSearch && root.ISHSearch.history) root.ISHSearch.history.add(st.q0 || st.q); } catch (e) {}
    }
    return r;
  }
  function renderMore() {
    var r = run(st.shown, STEP);
    r.products.forEach(function (p) { items[p.i] = p; });
    var k0 = st.shown;
    $('#ir-list').insertAdjacentHTML('beforeend', r.products.map(function (p, k) { return cardHtml(p, k0 + k); }).join(''));
    st.shown += r.products.length;
    more(r);
  }

  function filterEvent(type, value) { track('ish_search_filter', { search_term: st.q0 || st.q, filter_type: type, filter_value: String(value).slice(0, 60) }); }
  function onClick(e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var vb = t.closest('.ir-seg button');
    if (vb) { st.view = vb.getAttribute('data-v') === 'tile' ? 'tile' : 'list'; applyView(); filterEvent('view', st.view); saveState(); return; }
    var mr = t.closest('.ir-moret');
    if (mr) { var mk = mr.getAttribute('data-more'); st[mk] = !st[mk]; if (lastR) fillSide(lastR); return; }
    if (t.closest('#ir-fopen')) { setDrawer(true); return; }
    if (t.closest('#ir-fclose') || t.closest('#ir-fshow')) { setDrawer(false); return; }
    if (t.closest('#ir-apply')) { onChange({ target: $('#ir-p1') }); return; }
    var cp = t.closest('.ir-cp');
    if (cp) {
      var sk = cp.getAttribute('data-cp');
      try { if (root.navigator.clipboard) root.navigator.clipboard.writeText(sk); } catch (e) {}
      toast('Артикул ' + esc(sk) + ' скопирован'); return;
    }
    var chip = t.closest('.ir-chip');
    if (chip) { st.cat = parseInt(chip.getAttribute('data-cat'), 10); st.catName = chip.getAttribute('data-name') || ''; filterEvent('section', st.catName || 'все'); renderAll(STEP); saveState(); return; }
    var ab = t.closest('.ir-ac button');
    if (ab) {
      var an = ab.getAttribute('data-a'), av = ab.getAttribute('data-v'), cur = (st.attrs[an] || []).slice(), ix = cur.indexOf(av);
      if (ix >= 0) cur.splice(ix, 1); else cur.push(av);
      if (cur.length) st.attrs[an] = cur; else delete st.attrs[an];
      filterEvent(an, av); renderAll(STEP); saveState(); return;
    }
    if (t.closest('#ir-mic')) { toggleVoice(t.closest('#ir-mic')); return; }
    var add = t.closest('.ir-add');
    if (add) {
      var p = items[add.getAttribute('data-i')]; if (!p || add.disabled) return;
      if (add.getAttribute('data-s') === 'in' || inCart(p.id) > 0) {   // уже в корзине: второй раз не кладём, открываем корзину
        if (root.ishKorzina && typeof root.ishKorzina.open === 'function') root.ishKorzina.open(); else root.location.href = '/spec';
        markCart(); return;
      }
      add.disabled = true; lbl(add, 'Добавляем…');
      try { track('ish_search_add', { search_term: st.q0 || st.q, items: [root.ISHSearch.itemOf(p, 0, 'Поиск: выдача')] }); } catch (e) {}
      addToCart(p, 1).then(function (okk) {
        add.disabled = false;
        if (okk) { add.removeAttribute('data-s'); markCart(); if (root.ishKorzina && typeof root.ishKorzina.added === 'function') root.ishKorzina.added({ uid: String(p.id), name: p.title, price: p.price, img: p.photo || '' }); else toast('Товар добавлен в корзину <a href="/spec">Перейти в корзину</a>'); }
        else { add.setAttribute('data-s', 'err'); lbl(add, 'Не удалось'); toast('Не удалось добавить. <a href="' + esc(p.url || '/katalog') + '">Открыть карточку</a>'); }
        if (!okk) setTimeout(function () { if (add.getAttribute('data-s') === 'err') { add.removeAttribute('data-s'); lbl(add, 'В корзину'); markCart(); } }, 2200);
      });
      return;
    }
    if (t.closest('#ir-more')) { renderMore(); saveState(); return; }
    if (t.closest('#ir-reset') || t.closest('#ir-fres2')) { st.cat = -1; st.brands = []; st.pmin = st.pmax = null; st.sort = 'rel'; st.attrs = {}; st.inStock = false; st.priceNote = ''; $('#ir-p1').value = $('#ir-p2').value = ''; $('#ir-sort').value = 'rel'; renderAll(STEP); saveState(); return; }
    var asa = t.closest('.ir-assort a');
    if (asa) { track('ish_assort_link', { search_term: st.q0 || st.q, source: 'results' }); return; }
    if (t.closest('.ir-card a')) {
      var card = t.closest('.ir-card'), pi = card && items[card.getAttribute('data-i')];
      if (pi) { var lis = [].slice.call(box.querySelectorAll('.ir-card')); track('select_item', { item_list_name: 'Поиск: выдача', search_term: st.q0 || st.q, items: [root.ISHSearch.itemOf(pi, lis.indexOf(card) + 1, 'Поиск: выдача')] }); }
      saveState();
    }                // уходим на карточку: запомнить фильтры и прокрутку для «назад»
  }
  function onChange(e) {
    var t = e.target;
    if (t.id === 'ir-sort') { st.sort = t.value; filterEvent('sort', t.value); renderAll(STEP); saveState(); }
    else if (t.id === 'ir-stock') { st.inStock = !!t.checked; filterEvent('in_stock', st.inStock ? 'yes' : 'no'); renderAll(STEP); saveState(); }
    else if (t.closest && t.closest('#ir-bl')) {
      st.brands = []; [].forEach.call($('#ir-bl').querySelectorAll('input:checked'), function (x) { String(x.value).split(',').forEach(function (v) { v = parseInt(v, 10); if (isFinite(v) && st.brands.indexOf(v) < 0) st.brands.push(v); }); });
      filterEvent('brand', st.brands.length); renderAll(STEP); saveState();
    } else if (t.id === 'ir-p1' || t.id === 'ir-p2') {
      st.pmin = numOrNull($('#ir-p1').value); st.pmax = numOrNull($('#ir-p2').value);
      if (st.pmin != null && st.pmax != null && st.pmin > st.pmax) { var x = st.pmin; st.pmin = st.pmax; st.pmax = x; $('#ir-p1').value = st.pmin; $('#ir-p2').value = st.pmax; }
      st.priceNote = ''; filterEvent('price', (st.pmin == null ? '' : st.pmin) + '-' + (st.pmax == null ? '' : st.pmax)); renderAll(STEP); saveState();
    }
  }
  var recog = null, hintTok = 0, lastR = null;
  function setDrawer(on) {
    if (!box) return;
    box.classList.toggle('ir-dr', !!on);
    try { document.documentElement.style.overflow = on ? 'hidden' : ''; } catch (e) {}
    if (on) { var x = $('#ir-fclose'); if (x) x.focus(); }
  }
  function stem(s) {
    return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim().split(' ').map(function (w) { return w.replace(/(ами|ыми|ов|ев|ей|ых|их|ам|ям|ы|и|а|я|ь|й|е|у|ю|о)$/, ''); }).join(' ');
  }
  // запрос совпадает с названием раздела («Ноутбук» -> «Ноутбуки») и раздел держит >=80% выдачи: раздел выбран заранее, «Все» остаётся в один клик
  function preselect() {
    if (st.cat >= 0 || st.brands.length || st.raw) return;
    var r = run(0, 1), cats = (r.facets && r.facets.cats) || [], tot = 0, qs = stem(st.q0 || st.q);
    cats.forEach(function (c) { tot += c.n; });
    if (!tot || !qs) return;
    cats.forEach(function (c) { if (c.n >= 0.8 * tot && stem(c.name) === qs) { st.cat = c.i; st.catName = c.name; } });
  }
  function toggleVoice(btn) {
    if (recog) { recog.stop(); return; }
    var V = root.ISHSearch && root.ISHSearch.voice, inp = $('#ir-q');
    if (!V || !V.supported()) return;
    btn.setAttribute('data-on', '1');
    var got = '';
    recog = V.start(function (text) { got = text; inp.value = text; }, function () {
      recog = null; btn.removeAttribute('data-on');
      if (got) { track('ish_search_voice', { ish_term: got }); goSearch(got); }
    });
    if (!recog) btn.removeAttribute('data-on');
  }
  function goSearch(q) {
    q = String(q || '').trim(); if (!q) return;
    try { if (root.ISHSearch && root.ISHSearch.history) root.ISHSearch.history.add(q); } catch (e) {}
    root.location.assign(katalogUrl(q, false));
  }
  function onSubmit(e) { if (e.target && e.target.id === 'ir-sform') { e.preventDefault(); goSearch($('#ir-q').value); } }
  function onKey(e) { if (e.key === 'Enter' && (e.target.id === 'ir-p1' || e.target.id === 'ir-p2')) { e.preventDefault(); onChange(e); } }

  function place() {
    var native = document.getElementById('rec' + REC), host = native && native.parentNode;
    if (!host) { var t123 = document.getElementById('rec4304542303'); if (t123) { host = t123.parentNode; native = t123.nextSibling; } }
    if (!host) { host = document.getElementById('allrecords') || document.body; native = host.firstChild; }
    host.insertBefore(box, native || null);
  }
  function fail(why) {
    document.documentElement.classList.remove('ish-res-on');
    if (box && box.parentNode) box.parentNode.removeChild(box);
    started = false;
    if (root.console) console.warn('[ish] выдача на нашем движке не поднялась, показан родной каталог:', why);
  }

  function start(o) {
    o = o || {};
    var q = o.q != null ? o.q : queryFromUrl();
    if (!q || started) return false;
    if (!o.force && !(root.ISHSearch && root.ISHSearch.enabled && root.ISHSearch.enabled())) return false;
    started = true;
    var s = document.createElement('style'); s.id = 'ir-css'; s.textContent = CSS; document.head.appendChild(s);
    box = document.createElement('section'); box.className = 'ir'; box.id = 'ish-results'; box.setAttribute('aria-label', 'Результаты поиска');
    var prev = loadState(q);
    var raw = o.raw != null ? !!o.raw : rawFromUrl(), pp = !raw && root.ishParsePrice ? root.ishParsePrice(q) : null, hasP = !!(pp && pp.price);
    st = { q: hasP && pp.text ? pp.text : q, q0: q, raw: raw, cat: prev ? prev.cat : -1, catName: '', brands: prev ? prev.brands : [],
           pmin: prev ? prev.pmin : (hasP ? pp.price.min : null), pmax: prev ? prev.pmax : (hasP ? pp.price.max : null), sort: prev ? prev.sort : 'rel',
           attrs: prev && prev.attrs ? prev.attrs : {}, inStock: prev ? !!prev.inStock : false, priceNote: !prev && hasP ? pp.price.label : '', shown: 0, tracked: false, view: prev && prev.view === 'tile' ? 'tile' : 'list', open: {}, brAll: false, catAll: false };
    document.documentElement.classList.add('ish-res-on');
    skeleton();
    var tries = 0;
    (function put() { if (document.getElementById('rec' + REC) || tries++ > 12 || document.readyState === 'complete') place(); else setTimeout(put, 250); })();
    var timer = setTimeout(function () { fail('таймаут ' + WAIT_MS + ' мс'); }, o.timeout || WAIT_MS);
    var idxP = o.indexData ? Promise.resolve(o.indexData) : (root.ISHSearch && root.ISHSearch.preload ? root.ISHSearch.preload() : Promise.reject(new Error('нет загрузчика индекса')));
    idxP.then(function (idx) {
      if (!started) return;
      clearTimeout(timer);
      S = root.ISHSearch && root.ISHSearch.engineFor ? root.ISHSearch.engineFor(idx) : root.createSearch(idx);
      frame();
      if (!box.parentNode) place();
      box.addEventListener('click', onClick); box.addEventListener('change', onChange); box.addEventListener('keydown', onKey); box.addEventListener('submit', onSubmit);
      document.addEventListener('click', function (e) { var d = $('#ir-br'); if (d && d.open && !d.contains(e.target)) d.open = false; });   // список брендов закрывается кликом вне и Esc
      box.addEventListener('keydown', function (e) { var d = $('#ir-br'); if (e.key === 'Escape' && d && d.open) { d.open = false; var s = $('#ir-sum'); if (s) s.focus(); } });
      if (!prev) preselect();
      box.addEventListener('toggle', function (e) { var d = e.target; if (d && d.classList && d.classList.contains('ir-tile')) st.open[d.getAttribute('data-k')] = d.open; }, true);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box && box.classList.contains('ir-dr')) setDrawer(false); });
      renderAll(prev && prev.shown ? prev.shown : STEP);
      root.ISH_RESULTS_READY = true;
      if (prev && prev.y) setTimeout(function () { root.scrollTo(0, prev.y); }, 60);
      root.addEventListener('pagehide', saveState);
      var lastCart = null; try { lastCart = root.localStorage.getItem('tcart'); } catch (e) {}
      root.addEventListener('storage', function (e) { if (!e.key || e.key === 'tcart') markCart(); });
      setInterval(function () { var c = null; try { c = root.localStorage.getItem('tcart'); } catch (e) {} if (c !== lastCart) { lastCart = c; markCart(); } }, 1000);   // корзину правят и в модуле (в этом же окне storage не приходит)
    }).catch(function (e) { clearTimeout(timer); fail(e && e.message || e); });
    return true;
  }

  root.ISHResults = { start: start, stem: stem, queryFromUrl: queryFromUrl, _addToCart: addToCart, _cssText: CSS };
  // автозапуск: страница результатов поиска (/katalog с запросом) — ТОЛЬКО когда файл подтянул загрузчик страницы (script#ish-search-js из T123).
  // Файл, загруженный шапкой по фокусу в поле поиска, страницу не подменяет: выдача не должна меняться на глазах у человека.
  try {
    if (document.currentScript && document.currentScript.id === 'ish-search-js' && /^\/katalog\/?$/.test(root.location.pathname) && queryFromUrl()) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { start(); }); else start();
    }
  } catch (e) {}
})(typeof window !== 'undefined' ? window : this);
