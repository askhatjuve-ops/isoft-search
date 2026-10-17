/*
 * Строка «ещё N в расширенном каталоге (под заказ) →» для основного сайта (14.10.2026).
 * Грузит маленький «словарь» assort_dict.json (~12 КБ gzip; НЕ 14 тысяч позиций): одна строка = пара (бренд, раздел) с числом позиций,
 * которых нет на основном сайте. Считает тем же движком (createSearch из ish-search.js), поэтому опечатки и раскладка работают так же.
 * Грузится лениво, по первому вызову (или ISHAssortHint.preload()).
 *
 *   ISHAssortHint.get(query, mainTotal).then(function (h) { if (h) …; });
 *     h = { n: число (нижняя граница) | null, url: '/assortiment?q=…', text: 'ещё 12+ в расширенном каталоге (под заказ) →', html: '<a …>…</a>' }  или null (показывать нечего)
 *   n === null — запрос не свёлся к брендам/разделам (в нём есть слова, которых нет в словаре: модель, артикул); строка с текстом
 *   «Поискать в расширенном каталоге (под заказ) →» выдаётся только когда на основном сайте ничего не нашлось (mainTotal === 0).
 *   ISHAssortHint.getSync(query, mainTotal) — то же без ожидания, если словарь уже загружен (иначе null и запускается загрузка).
 *   ISHAssortHint.url(query) — только адрес.
 */
(function (root) {
  'use strict';
  if (root.ISHAssortHint) return;
  var DEFAULT_BASE = 'https://askhatjuve-ops.github.io/isoft-search', BASE = DEFAULT_BASE, VERSION = '1', PAGE = '/assortiment';
  try { var cs = document.currentScript; if (cs && cs.src) BASE = cs.src.replace(/[?#].*$/, '').replace(/\/[^\/]*$/, ''); } catch (e) {}
  var S = null, loading = null, failed = false;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmt(n) { return new Intl.NumberFormat('ru-RU').format(n); }
  function url(q) { return PAGE + '?q=' + encodeURIComponent(String(q || '').trim()); }
  function factory() { return root.createSearch || (root.ISHSearch && root.ISHSearch.createSearch) || null; }

  function preload() {
    if (S) return Promise.resolve(S);
    if (failed) return Promise.reject(new Error('словарь расширенного каталога недоступен'));
    if (loading) return loading;
    loading = new Promise(function (res, rej) {
      var f = factory();
      if (!f) { failed = true; return rej(new Error('нет движка поиска')); }
      var done = false, t = setTimeout(function () { if (!done) { done = true; failed = true; rej(new Error('таймаут словаря')); } }, 10000);
      fetch(BASE + '/assort_dict.json?v=' + VERSION, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) { if (done) return; done = true; clearTimeout(t); S = f(j); res(S); })
        .catch(function (e) { if (done) return; done = true; clearTimeout(t); failed = true; rej(e); });
    });
    loading.catch(function () {});
    return loading;
  }

  // Число позиций «только под заказ» по запросу. Словарь знает лишь ходовые слова названий, бренды и разделы, а синонимы и
  // приставочный поиск у него уже, чем у полного индекса страницы, поэтому число — НИЖНЯЯ граница (на странице будет столько же
  // или больше): в тексте оно выдаётся как «N+». null — в запросе есть слово, которого словарь не знает (модель, артикул).
  function known(w) { var r = S.query(w, { limit: 1 }); return r.matched > 0; }
  function tokensRaw(s) { return S._baseTokens ? S._baseTokens(s) : String(s).toLowerCase().split(/\s+/); }
  function tokensOf(s) { return (S._baseTokens ? S._baseTokens(s) : String(s).toLowerCase().split(/\s+/)).filter(function (w, i, a) { return w.length > 1 && a.indexOf(w) === i; }); }
  function count(q) {
    q = String(q || '').trim();
    if (!S || q.length < 2) return 0;
    var r = S.query(q, { limit: 8000 }), ch = (r.corrected && r.corrected.changes) || [];
    if (ch.some(function (c) { return c.type !== 'layout'; })) return null;      // исправление опечатки/транслита по малому словарю ненадёжно
    var ws = tokensOf(ch.length ? r.corrected.to : q);                            // раскладку движок уже перевёл
    if (!ws.length) return 0;
    if (ch.length && S._hasWord && tokensRaw(q).some(function (w) { return /\d/.test(w) && !S._hasWord(w); })) return null;   // 17.10: «45х45» движок переводит раскладкой в «45[45» и рвёт на части
    var all = tokensRaw(ch.length ? r.corrected.to : q), lastW = all.length ? all[all.length - 1] : '';
    for (var i = 0; i < ws.length; i++) {
      if (!known(ws[i])) return null;                                             // слово вне словаря — числа нет
      // 17.10: не последнее слово малый словарь растягивает приставкой («gam» -> «gaming»), а полный индекс держит точным -> число
      // выходило бы выше истины; такое слово должно быть в словаре целиком, иначе числа нет
      if (ws[i] !== lastW && S._hasWord && !S._hasWord(ws[i])) return null;
      if (ws[i] === lastW && S._hasWord && !S._hasWord(ws[i]) && /\d/.test(ws[i])) return null;   // последнее слово с цифрой, которого нет целиком («45х45»), словарь рвёт на части
    }
    if (!r.matched || !r.products.length) return 0;
    if (r.relaxed && r.relaxed.dropped && r.relaxed.dropped.length) return null;
    var n = 0; r.products.forEach(function (p) { n += p.qty || 0; });
    return n;
  }
  function off() { try { return !!(root.ISHSearch && typeof root.ISHSearch.enabled === 'function' && !root.ISHSearch.enabled()); } catch (e) { return false; } }   // общий выключатель поиска
  function make(q, mainTotal) {
    if (off()) return null;
    var n = count(q);
    if (n === 0) return null;
    if (n === null && mainTotal !== 0) return null;
    var text = n === null ? 'Поискать в расширенном каталоге (под заказ) →' : 'ещё ' + fmt(n) + '+ в расширенном каталоге (под заказ) →';
    return { n: n, url: url(q), text: text, html: '<a class="ish-assort-row" href="' + esc(url(q)) + '">' + esc(text) + '</a>' };
  }
  function get(q, mainTotal) { return preload().then(function () { return make(q, mainTotal); }, function () { return null; }); }
  function getSync(q, mainTotal) { if (!S) { preload().catch(function () {}); return null; } return make(q, mainTotal); }

  root.ISHAssortHint = { get: get, getSync: getSync, preload: preload, url: url, version: VERSION, _count: count };
})(typeof window !== 'undefined' ? window : this);
