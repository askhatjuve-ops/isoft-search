/* ish-design-p38.js  v1.1  (18.10.2026, кандидат)  П38 «мелочи показа: цена, alt, дата цен, наличие, название в списке»  b2b.isoft-shop.kz
   Внешний слой. Блоки Tilda не пишет, в сеть не ходит (дата берётся из индекса поиска, который страница уже грузит). Подключает ish-design-p38.css рядом с собой.
   Выключатели: window.ISH_P38_OFF = 1 - весь модуль; window.ISH_P38_SKIP = 'price,alt,date,stock,name' (любая подстрока) - только названные функции. Всё - до загрузки файла.
   Что делает (идемпотентно, метки data-p38; нет элементов - молчит; ошибка в одной функции другую не останавливает):
     price  К9   единый показ цены «471 000 ₸»: тысячи и ₸ через неразрывный пробел (U+00A0), без «,00», «тг.», «тенге», «KZT».
                Правит ТОЛЬКО видимые текстовые узлы: число+знак валюты в любом месте страницы (список, карточка, похожие, .ishk-bar, /spec, сравнение, поиск)
                и «голые» числа в узлах цены Tilda (.js-product-price, .t-store__card__price-value, .sp-money…). Атрибуты, data-product-price*, meta itemprop, value полей не трогает.
                Знак валюты в отдельном узле Tilda (.t-store__*__price-currency) заменяется на «₸», его пробел и отступы не меняются.
     alt    Фт3  у фото товара без alt / с пустым / мусорным alt (имя файла, «image», «IMG_123») - alt = название товара из ближайшей карточки;
                у фоновых картинок товара (background-image) - role="img" и aria-label. Логотипы, иконки, svg, не-товарные картинки - не трогает.
     date   Г19  «Цены обновлены сегодня» / «Цены обновлены 17 октября» (по Астане, UTC+5): дописывается к подписи под списком (.ishp19-note) и в карточке под «Цена с НДС» (.ishpg3-vat).
                Дата - снимок индекса поиска (search_index2.json, поле T['снимок']); старше 3 дней или даты нет - ничего не показываем.
                Источник: ISHSearch.preload() (тот же запрос, что уже сделал ish-search - второго нет); если ISHSearch нет / выключен / ISH_NO_PRELOAD / завис >6 с - сам грузит search_index2.json (адрес ISHSearch.indexUrl() или каталог этого файла), один раз на страницу; запасной - window.ISH_INDEX_DATE и localStorage ish38d (последняя виденная дата).
     stock  К7   в карточках списка (.t-store__card) бейдж «● В наличии» / «● В наличии 50+» (qty из индекса: P[i][4], ключ - data-product-uid = uid индекса; qty=50 в индексе - «50+»).
                «N шт» и «под заказ» не пишем; товара нет в индексе - бейджа нет; если в карточке уже есть .ishpg3-avail - не дублируем. Данные только из ISHSearch.preload() (второго скачивания нет).
     name   К5   в списке РАЗДЕЛА (адрес вида /noutbuki, одна часть пути; смешанные группы и 'katalog' не трогаем) слово типа («Ноутбук», «Монитор», «ИБП»…) скрывается визуально
                (<span class="ishp38-tw"> внутри названия: textContent и data-ish13-имя целы, читатели названия получают полный текст), полный текст - в title. Словарь «раздел -> слово типа»
                строится из индекса на лету: первое слово названий >=60% товаров раздела (если и второе слово у >=60% из них - тип из двух слов: «Блок питания», «Материнская плата»).
                Не трогаем: названия, где после типа идёт слово с маленькой буквы («Монитор игровой …»), карточку товара, поиск, сравнение, корзину. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P38_OFF || W.__ishP38) return;
  W.__ishP38 = 'v1.1';
  var SKIP = String(W.ISH_P38_SKIP || '');
  function on(n) { return SKIP.indexOf(n) < 0; }
  var SELF_BASE = '';                            /* каталог, из которого загружен этот файл */
  var IDX = null, QTY = null, DICT = null;   /* индекс поиска и производные: uid -> [qty, раздел], раздел -> тип */
  var NB = ' ';

  /* стили рядом с собой, один раз */
  (function () {
    if (D.getElementById('ishp38-css')) return;
    var tag = D.currentScript || D.querySelector('script[src*="ish-design-p38.js"]'), src = tag && tag.src;
    if (!src) return;
    SELF_BASE = src.replace(/[^\/]*(\?.*)?$/, '');
    var l = D.createElement('link'); l.id = 'ishp38-css'; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-p38\.js.*$/, 'ish-design-p38.css' + (v ? '?v=' + v[1] : ''));
    (D.head || D.documentElement).appendChild(l);
  })();

  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function safe(fn) { try { fn(); } catch (e) { /* слой необязательный */ } }
  function txt(e) { return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function closest(e, s) { try { return e && e.closest ? e.closest(s) : null; } catch (x) { return null; } }

  /* ═══════════════ price ═══════════════ */
  var VAL = '.js-product-price, .js-store-prod-price-val, .js-store-prod-price-old-val, .t-store__card__price-value, .t-store__prod-popup__price-value, .вн-т__цена b, .sp-money, .t706__cartwin-prodamount, .t706__cartwin-totalamount';
  var CUR = '[class*="price-currency"]';
  var SKIPT = 'script,style,textarea,noscript,select,option,code,pre,[data-p38-skip],[contenteditable="true"]';
  /* число (группы по 3 через пробел/nbsp/узкий nbsp или слитно) + необязательные копейки + знак валюты */
  var RX = /(^|[^\d.,])(\d{1,3}(?:[   ]\d{3})+|\d+)(?:[.,](\d{1,2}))?[   ]*(₸|тг\.?|тенге|KZT)(?![A-Za-zА-Яа-яЁё])/g;
  var RXT = /(₸|тг|тенге|KZT)/;
  function group(digits) { return digits.replace(/\B(?=(\d{3})+(?!\d))/g, NB); }
  function dec(d) { return d && !/^0+$/.test(d) ? ',' + d : ''; }
  function fixText(s) {
    return s.replace(RX, function (m, pre, num, d) { return pre + group(num.replace(/\D/g, '')) + dec(d) + NB + '₸'; });
  }
  function setText(node, v) { if (node.nodeValue !== v) node.nodeValue = v; }
  /* узел цены Tilda: «471000,00» / «471 000» -> «471 000» (знак валюты в соседнем узле) */
  function fixValue(e) {
    if (!e || e.children.length) return;
    var m = /^(\s*)(\d[\d   ]*)(?:[.,](\d+))?(\s*)$/.exec(e.textContent || '');
    if (!m) return;
    var v = group(m[2].replace(/\D/g, '')) + dec(m[3]);
    if (e.textContent !== v) {
      if (e.childNodes.length === 1 && e.firstChild.nodeType === 3) e.firstChild.nodeValue = v; else e.textContent = v;
    }
    if (e.getAttribute('data-p38') !== 'p') e.setAttribute('data-p38', 'p');
  }
  function fixCurrency(e) {
    if (!e || e.children.length) return;
    var m = /^(\s*)(тг\.?|тенге|KZT|₸)(\s*)$/.exec(e.textContent || '');
    if (!m || m[2] === '₸') return;
    e.textContent = m[1] + '₸' + m[3];
  }
  function walkText(root) {
    if (!D.createTreeWalker) return;
    var w = D.createTreeWalker(root, 4 /* SHOW_TEXT */, null, false), n, list = [];
    while ((n = w.nextNode())) { if (RXT.test(n.nodeValue)) list.push(n); }
    list.forEach(function (t) {
      var p = t.parentNode;
      if (!p || closest(p, SKIPT)) return;
      setText(t, fixText(t.nodeValue));
    });
  }
  function priceScan(el) {
    if (!el) return;
    if (el.nodeType === 3) { var p = el.parentNode; if (!p || closest(p, SKIPT)) return; setText(el, fixText(el.nodeValue)); el = p; if (!el) return; }
    if (el.nodeType !== 1) return;
    var v = closest(el, VAL); if (v) fixValue(v);
    var c = closest(el, CUR); if (c) fixCurrency(c);
    qa(VAL, el).forEach(fixValue);
    qa(CUR, el).forEach(fixCurrency);
    if (!closest(el, SKIPT)) walkText(el);
  }

  /* ═══════════════ alt ═══════════════ */
  /* [контейнер товара, где искать название] */
  var CARDS = [
    ['.t-store__card', '.js-store-prod-name, .t-store__card__title'],
    ['.t-store__prod-popup, .t-store__prod-snippet__container, .t-popup[data-tooltip-hook], .t-popup', '.js-store-prod-name, .t-store__prod-popup__name'],
    ['.вн-т', '.js-store-prod-name, [class*="назв"], b'],
    ['.ir-card', '.ir-name'],
    ['.нш-товар', '.нш-т b'],
    ['.ishk-row', '.ishk-nm b'],
    ['.ishp25-ct', '.ishp25-ct__n'],
    ['[data-product-uid]', '.js-store-prod-name, .t-store__card__title, .t-store__prod-popup__name']
  ];
  var CARD_SEL = CARDS.map(function (c) { return c[0]; }).join(',');
  var NOT_PHOTO = /(^|[\s_-])(logo|icon|ico|badge|flag|arrow|sprite|avatar|qr|pay|brand)([\s_-]|$)/i;
  function badAlt(a) {
    a = (a || '').trim();
    if (!a) return true;
    if (/\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(a)) return true;
    if (/^(image|img|photo|picture|pic|фото|изображение|картинка|untitled|noname|no[-_ ]?image)[\s_-]*\d*$/i.test(a)) return true;
    if (/^(tild|img_|dsc|dscn|screenshot)[\w-]*$/i.test(a) && !/\s/.test(a)) return true;
    if (/^[\d_-]+$/.test(a)) return true;
    return false;
  }
  function nameOf(el) {
    for (var i = 0; i < CARDS.length; i++) {
      var box = closest(el, CARDS[i][0]);
      if (!box) continue;
      var n = box.querySelector(CARDS[i][1]);
      var t = txt(n);
      if (t && t.length > 2) return t.length > 200 ? t.slice(0, 200) : t;
    }
    return '';
  }
  function bgOf(e) {
    var s = (e.getAttribute('style') || '');
    return /background-image\s*:\s*url/i.test(s) || e.hasAttribute('data-original') || (e.getAttribute('data-original-lazy') != null);
  }
  function altScan(root) {
    if (!root || root.nodeType !== 1) return;
    var imgs = qa('img', root);
    if (root.tagName === 'IMG') imgs.push(root);
    imgs.forEach(function (im) {
      var cur = im.getAttribute('alt'), mine = im.getAttribute('data-p38') === 'a';
      if (!mine && !badAlt(cur)) return;
      if (im.getAttribute('role') === 'presentation' || /\.svg(\?|$)/i.test(im.getAttribute('src') || '')) return;
      if (NOT_PHOTO.test((im.className || '') + ' ' + (im.getAttribute('src') || '').split('/').pop())) return;
      if (closest(im, '#t-header, header, footer, .t-menu, .t456, .t228, [data-record-type="257"], .ishp-strip')) return;
      var n = nameOf(im);
      if (!n) return;
      if (cur !== n) im.setAttribute('alt', n);
      im.setAttribute('data-p38', 'a');
    });
    var bgs = qa('.t-bgimg, .js-product-img, .t-store__card__bgimg, .t-slds__bgimg, .ishp25-ct__img, [data-original], [style*="background-image"]', root);
    if (root.matches && root.matches('.t-bgimg, .js-product-img, .t-store__card__bgimg, .t-slds__bgimg, .ishp25-ct__img, [data-original], [style*="background-image"]')) bgs.push(root);
    bgs.forEach(function (e) {
      if (e.tagName === 'IMG' || !bgOf(e)) return;
      if (e.getAttribute('aria-hidden') === 'true' || txt(e)) return;
      var cur = e.getAttribute('aria-label'), mine = e.getAttribute('data-p38') === 'a';
      if (cur && !mine) return;
      if (closest(e, '#t-header, header, footer, .t-menu')) return;
      var n = nameOf(e);
      if (!n) return;
      if (e.getAttribute('role') !== 'img') e.setAttribute('role', 'img');
      if (cur !== n) e.setAttribute('aria-label', n);
      e.setAttribute('data-p38', 'a');
    });
  }

  /* ═══════════════ date ═══════════════ */
  var MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var snap = '';                                  /* строка «ГГГГ-ММ-ДД ЧЧ:ММ:СС» из индекса */
  function lsGet(k) { try { return W.localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { W.localStorage.setItem(k, v); } catch (e) {} }
  function setSnap(s) {
    s = String(s || '');
    if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return;
    if (s > snap) { snap = s; lsSet('ish38d', s); }
    dateScan();
  }
  /* текст подписи по Астане (UTC+5) или '' (нет даты / старше 3 дней / дата из будущего) */
  function dateWord() {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(snap);
    if (!m) return '';
    var a = new Date(Date.now() + 5 * 3600e3), today = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
    var diff = Math.round((today - Date.UTC(+m[1], +m[2] - 1, +m[3])) / 864e5);
    if (diff < 0 || diff > 3) return '';
    return diff === 0 ? 'сегодня' : (+m[3]) + ' ' + MON[+m[2] - 1];
  }
  function putDate(host, tagName, text, lead) {
    var d = host.querySelector(':scope > .ishp38-date');
    if (!text) { if (d) d.parentNode.removeChild(d); return; }
    if (!d) {
      d = D.createElement(tagName); d.className = 'ishp38-date'; d.setAttribute('data-p38', 'd');
      host.appendChild(d);
    }
    if (d.textContent !== text) d.textContent = text;
  }
  function dateScan() {
    var w = dateWord(), s = w ? 'Цены обновлены ' + w : '';
    qa('.ishp19-note').forEach(function (n) { putDate(n, 'span', s ? ' ' + s + '.' : '', 1); });
    qa('.ishpg3-vat').forEach(function (v) { putDate(v, 'small', s, 0); });
  }
  function findDate() {
    if (W.ISH_INDEX_DATE) setSnap(W.ISH_INDEX_DATE);
    setSnap(lsGet('ish38d'));                      /* сразу из памяти браузера, потом уточнит свежий индекс */
  }
  /* индекс поиска: один общий промис ISHSearch.preload() (второго скачивания нет); нужен для date, stock, name */
  function findIndex() {
    var n = 0, done = false;
    function got(idx) { if (done || !idx || !idx.P) return; done = true; safe(function () { onIndex(idx); }); }
    function own() {                               /* запасной путь: сами, лениво, один раз на страницу (общий промис на window) */
      if (done) return;
      var S = W.ISHSearch, url = '';
      try { url = S && S.indexUrl ? S.indexUrl() : ''; } catch (e) {}
      url = url || SELF_BASE + 'search_index2.json';  /* адрес ish-search, если он есть; иначе тот же каталог, что у этого файла */
      if (!W.__ishP38idx) {
        W.__ishP38idx = W.__ishP6Idx || (W.__ishP6Idx = W.fetch ? W.fetch(url + (url.indexOf('?') < 0 ? '?v=7551c0ab' : ''), { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }) : Promise.reject(new Error('fetch')));  /* общий промис с p6 (__ishP6Idx) и тот же ?v, что у p6/ish-search - одно скачивание */
        W.__ishP38idx.catch(function () { W.__ishP38idx = null; });
      }
      W.__ishP38idx.then(got, function () {});
    }
    (function step() {
      if (done) return;
      var S = W.ISHSearch, ok = false;
      try { ok = !!(S && S.enabled && S.preload && !W.ISH_NO_PRELOAD && S.enabled()); } catch (e) {}
      if (ok) {
        S.preload().then(got, function () { own(); });
        setTimeout(own, 6000);                      /* промис завис - не ждём дольше 6 с */
        return;
      }
      if (++n < 6) setTimeout(step, 500);           /* ish-search ещё не загружен: ждём ~3 с, дальше качаем сами */
      else own();
    })();
  }
  function onIndex(idx) {
    if (!idx || !idx.P) return;
    IDX = idx;
    if (idx.T && idx.T['снимок'] && on('date')) setSnap(idx.T['снимок']);
    if (on('stock') || on('name')) buildMaps(idx);
    if (on('stock')) safe(function () { stockScan(D.body); });
    if (on('name')) safe(function () { nameScan(D.body); });
  }

  /* ═══════════════ индекс -> карты ═══════════════ */
  function uidOf(idx, i) {
    var u = idx.I ? idx.I[i] : null;
    if (u == null) return '';
    if (!idx.E) return String(u);
    return u.charAt(0) === '!' ? u.slice(1) : String(parseInt(u, 36));
  }
  var WORD = /^[a-zа-яё]{2,}$/i;                   /* тип - чистое слово: «IP», «Wi-Fi», «16-inch» типом не считаем */
  function buildMaps(idx) {
    var P = idx.P, C = idx.C || [], i, p, slug, by = {};
    QTY = {}; DICT = {};
    for (i = 0; i < P.length; i++) {
      p = P[i]; slug = C[p[2]] ? C[p[2]][3] : '';
      var u = uidOf(idx, i);
      if (u) QTY[u] = [+p[4] || 0, slug];
      if (slug && slug !== 'katalog') (by[slug] || (by[slug] = [])).push(String(p[0] || '').toLowerCase().replace(/\s+/g, ' ').trim().split(' '));
    }
    function top(list, k) {
      var c = {}, best = '', bn = 0;
      list.forEach(function (w) { var x = w[k]; if (!x) return; c[x] = (c[x] || 0) + 1; if (c[x] > bn) { bn = c[x]; best = x; } });
      return [best, bn];
    }
    var brand = {}; (idx.B || []).forEach(function (b) { brand[String(b).toLowerCase()] = 1; });
    Object.keys(by).forEach(function (sl) {
      var l = by[sl], t = top(l, 0);
      if (!t[0] || t[1] < 0.6 * l.length || !WORD.test(t[0])) return;
      var sub = l.filter(function (w) { return w[0] === t[0]; }), t2 = top(sub, 1), ph = t[0];
      if (t2[0] && t2[1] >= 0.6 * sub.length && WORD.test(t2[0]) && !brand[t2[0]]) ph += ' ' + t2[0];   /* второе слово - не марка («Телевизор Samsung») */
      DICT[sl] = { p: ph, share: Math.round(100 * t[1] / l.length) };
    });
    W.__ishP38dict = DICT;                          /* для проверки в консоли */
  }

  /* ═══════════════ stock ═══════════════ */
  var CARD_UID = /\/tproduct\/(\d+)-/;
  function uidOfCard(c) {
    if (!c) return '';
    var u = c.getAttribute('data-product-uid') || c.getAttribute('data-product-lid') || '';
    if (u) return u;
    var a = c.querySelector('a[href*="/tproduct/"]'), m = a && CARD_UID.exec(a.getAttribute('href') || '');
    return m ? m[1] : '';
  }
  function cardsIn(root, sel) {
    var scope = root.nodeType === 1 || root.nodeType === 9 ? root : (root.parentNode || D);
    var list = qa(sel, scope);
    if (scope.nodeType === 1 && scope.matches && scope.matches(sel) && list.indexOf(scope) < 0) list.push(scope);
    var up = closest(scope, sel); if (up && list.indexOf(up) < 0) list.push(up);
    return list;
  }
  function stockScan(root) {
    if (!QTY || !root) return;
    cardsIn(root, '.t-store__card').forEach(function (c) {
      var mine = c.querySelector('.ishp38-stock');
      if (!mine && c.querySelector('.ishpg3-avail')) return;                 /* статус уже показан родным блоком */
      var rec = QTY[uidOfCard(c)];
      if (!rec || !(rec[0] >= 1)) { if (mine) mine.parentNode.removeChild(mine); return; }
      var t = rec[0] >= 50 ? 'В наличии 50+' : 'В наличии';
      if (mine) { var sp = mine.lastChild; if (sp && sp.textContent !== t) sp.textContent = t; return; }
      var host = c.querySelector('.t-store__card__textwrapper');
      if (!host) return;
      var d = D.createElement('div'); d.className = 'ishp38-stock'; d.setAttribute('data-p38', 's');
      d.innerHTML = '<i></i><span></span>'; d.lastChild.textContent = t;
      host.appendChild(d);
    });
  }

  /* ═══════════════ name ═══════════════ */
  function sectionSlug() {
    var m = /^\/([a-z0-9-]+)\/?$/i.exec(W.location.pathname || '');
    return m ? m[1].toLowerCase() : '';
  }
  function nameScan(root) {
    if (!DICT || !QTY || !root) return;
    var sl = sectionSlug(), t = sl && DICT[sl];
    if (!t) return;
    cardsIn(root, '.t-store__card__title').forEach(function (el) {
      var card = closest(el, '.t-store__card');
      if (!card || closest(el, '.t-store__prod-popup, .ishp25-ct, .ir-card, .t706')) return;
      if (el.querySelector(':scope > .ishp38-tw')) return;                     /* уже сделано */
      if (!el.children.length) el.normalize();                                  /* текст мог прийти кусками */
      var f = el.firstChild;
      if (!f || f.nodeType !== 3) return;
      var u = QTY[uidOfCard(card)];
      if (!u || u[1] !== sl) return;                                           /* товар не из этого раздела по индексу */
      var v = f.nodeValue, lead = /^\s*/.exec(v)[0].length, pl = t.p;
      if (v.toLowerCase().indexOf(pl, lead) !== lead) return;
      var after = v.slice(lead + pl.length);
      if (!/^\s+\S/.test(after)) return;
      var rest = after.replace(/^\s+/, '');
      if (rest.length < 4 || /^[а-яё]/.test(rest)) return;                      /* «Монитор игровой …» - тип остаётся */
      if (!el.getAttribute('title')) el.setAttribute('title', txt(el));
      var sp = D.createElement('span'); sp.className = 'ishp38-tw'; sp.setAttribute('data-p38', 'n');
      sp.textContent = v.slice(0, v.length - rest.length);
      var tn = D.createTextNode(rest);
      el.replaceChild(tn, f); el.insertBefore(sp, tn);
      el.setAttribute('data-p38n', '1');
    });
  }

  /* ═══════════════ запуск и наблюдатель ═══════════════ */
  var pending = [], timer = 0, mo = null, busy = false;
  function runAll(roots) {
    busy = true;
    try {
      roots.forEach(function (r) {
        if (on('price')) safe(function () { priceScan(r); });
        if (on('alt')) safe(function () { altScan(r.nodeType === 1 ? r : r.parentNode); });
      });
      if (on('date')) safe(dateScan);
      roots.forEach(function (r) {
        if (on('stock')) safe(function () { stockScan(r); });
        if (on('name')) safe(function () { nameScan(r); });
      });
    } finally {
      busy = false;
      if (mo) mo.takeRecords();                    /* свои правки наблюдателю не показываем */
    }
  }
  function flush() {
    timer = 0;
    var roots = pending; pending = [];
    var seen = [];
    roots = roots.filter(function (r) { if (!r || !r.parentNode && r.nodeType !== 9 || seen.indexOf(r) > -1) return false; seen.push(r); return true; });
    if (roots.length) runAll(roots);
  }
  function sched(list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'characterData') pending.push(m.target);
      else for (var j = 0; j < m.addedNodes.length; j++) { var a = m.addedNodes[j]; if (a.nodeType === 1 || a.nodeType === 3) pending.push(a); }
    }
    if (pending.length > 400) pending = [D.body];
    if (!timer && pending.length) timer = setTimeout(flush, 150);
  }
  function start() {
    if (!D.body) return;
    runAll([D.body]);
    if (on('date')) safe(findDate);
    if (on('date') || on('stock') || on('name')) safe(findIndex);
    if (W.MutationObserver) {
      mo = new MutationObserver(function (list) { if (!busy) sched(list); });
      mo.observe(D.body, { childList: true, subtree: true, characterData: true });
    } else setInterval(function () { runAll([D.body]); }, 1500);
    /* Tilda дорисовывает карточки после load */
    setTimeout(function () { runAll([D.body]); }, 1200);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
