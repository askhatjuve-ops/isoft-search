/* ish-design-p37.js  v1.1 (19.10: быстрый доступ - 2 тонкие строки)  v1.0  (кандидат 17.10.2026, волна 3 «хвосты» C2; НЕ выложено)  П37 «хвосты в стиле главной»
   Внешний слой. Блоки Tilda НЕ пишет. Подгружает ish-design-p37.css с того же адреса. Выключатель до загрузки: window.ISH_P37_OFF = 1.
   Что делает (вид - в css, здесь только то, чего css не умеет):
     1. Мобильное меню (оболочка, экран «Каталог товаров», #ishЭкран): над списком разделов - 4 быстрых пункта со значками в кобальтовых квадратах,
        под списком - карточка «телефон + WhatsApp + Telegram». Узлы с классами .ishp37-*; чужую разметку не трогает; оболочка перерисует экран - дорисуем заново.
     2. Шторка фильтров на телефоне: на кнопку «Показать товары» (.вн-моб-пок) пишет «Показать N», если число известно надёжно (иначе текст не меняется).
     3. Мега-меню: поверх разметки p24 строит «слева группы, справа разделы мини-плитками с фото» (разметка p24 остаётся, прячется только сетка колонок).
     4. /assortiment: в iframe#isoft-catalog-frame (тот же origin) подключает ish-design-p37a.css - оформление приложения в стиле главной. Приложение и ish-assort.js не меняются.
   Мега-меню и кнопки WhatsApp/Telegram - только css (разметка p24/p22 как есть). */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P37_OFF || W.__ishP37) return;
  W.__ishP37 = 'v1';
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p37.js"]');
  var BASE = (tag && tag.src) ? tag.src.replace(/ish-design-p37\.js.*$/, '') : 'https://askhatjuve-ops.github.io/isoft-search/';
  var VQ = (tag && tag.src && (tag.src.match(/\?.*$/) || [''])[0]) || '';
  var PHONE = '+7 775 881 85 31', TEL = '+77758818531';

  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function link(id, href) {
    if (D.getElementById(id)) return;
    var l = D.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = href; D.head.appendChild(l);
  }
  link('ishp37-css', BASE + 'ish-design-p37.css' + VQ);

  /* ───────── 1. мобильное меню ───────── */
  var IC = {
    kp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    as: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.9-3.9M11 8.5v5M8.5 11h5"/></svg>',
    org: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 9h4l4 3v4h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    ch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
    ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.3-1.3-2-1-1 .7a3.6 3.6 0 0 1-1.9-1.9l.7-1-1-2z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2.8 2.9 10.1c-.8.3-.8 1.4 0 1.7l4.6 1.6 1.8 5.6c.2.7 1 .8 1.5.3l2.5-2.4 4.7 3.5c.6.4 1.4.1 1.6-.6L22.9 4.2c.2-.8-.6-1.7-1.4-1.4z"/><path d="m9.5 13.4 8.2-6.2-6.4 7.3"/></svg>'
  };
  /* 19.10.2026 (Асхат): из 4 быстрых пунктов оставлены 2 тонкие строки - КП/счёт и расширенный ассортимент;
     «Для организаций» и «Доставка и оплата» повторяют меню и главную - убраны. */
  var БЫСТРО = [
    ['Нужно КП или счёт?', 'Ответим в день обращения', '/podbor'],
    ['Расширенный ассортимент', '14 000+ позиций под заказ', '/assortiment']
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function quickHtml() {
    var h = '<div class="ishp37-q ishp37-q--thin">';
    БЫСТРО.forEach(function (r) {
      h += '<a href="' + esc(r[2]) + '"><span><b>' + esc(r[0]) + '</b> ' + esc(r[1]) + '</span><span class="ishp37-qs">' + IC.ch + '</span></a>';
    });
    return h + '</div><div class="ishp37-sub"><b>01</b> / Разделы каталога</div>';
  }
  function contactHtml() {
    return '<a class="ishp37-tel" href="tel:' + TEL + '"><b>' + PHONE + '</b><span>Пн–Вс 9:00–18:00 · звонок и счёт в день обращения</span></a>' +
      '<a class="ishp37-m" href="https://wa.me/77758818531" target="_blank" rel="noopener" aria-label="Написать в WhatsApp">' + IC.wa + '</a>' +
      '<a class="ishp37-m" href="https://t.me/+77758818531" target="_blank" rel="noopener" aria-label="Написать в Telegram">' + IC.tg + '</a>';
  }
  var busy = false;
  function menu() {
    var ek = D.getElementById('ishЭкран');
    if (!ek || busy) return;
    var list = q('.список', ek);
    if (!list || !q('.строка[data-группа]', list)) return;          /* только экран со списком групп каталога */
    busy = true;
    try {
      if (!q('.ishp37-q', ek)) {
        var w = D.createElement('div'); w.className = 'ishp37-top'; w.innerHTML = quickHtml();
        list.parentNode.insertBefore(w, list);
      }
      if (!q('.ishp37-ct', ek)) {
        var c = D.createElement('div'); c.className = 'ishp37-ct'; c.innerHTML = contactHtml();
        list.parentNode.insertBefore(c, list.nextSibling);
      }
    } catch (e) {}
    busy = false;
  }

  /* ───────── 2. «Показать N» в шторке фильтров ───────── */
  function numFromVar() {
    try {
      var v = W.getComputedStyle(D.documentElement).getPropertyValue('--p35-n') || '';
      var m = /(\d[\d\s ]*)/.exec(v);
      return m ? parseInt(m[1].replace(/\D/g, ''), 10) : 0;
    } catch (e) { return 0; }
  }
  function sheet() {
    var b = q('.вн-моб-пок');
    if (!b || !D.body.classList.contains('вн-моб-ф')) return;
    var chosen = qa('.вн-моб-откр .t-store__filter__checkbox input:checked').length;
    var n = 0;
    if (!chosen) n = numFromVar();                                            /* фильтров нет - число моделей раздела */
    else if (!q('.t-store__load-more-btn') ) n = qa('.t-store__card').filter(function (c) { return c.offsetParent !== null; }).length;   /* всё загружено - считаем видимые */
    var t = n > 0 ? 'Показать ' + String(n).replace(/\B(?=(\d{3})+$)/g, ' ') : 'Показать товары';
    if (b.textContent !== t) b.textContent = t;
  }

  /* ───────── 3. /assortiment: оформление приложения внутри iframe ───────── */
  function assort() {
    var f = D.getElementById('isoft-catalog-frame');
    if (!f) return false;
    var d; try { d = f.contentDocument; } catch (e) { return true; }
    if (!d || !d.head || !d.body || !d.querySelector('.catalog-layout')) return false;
    if (!d.getElementById('ishp37a-css')) {
      var l = d.createElement('link'); l.id = 'ishp37a-css'; l.rel = 'stylesheet'; l.href = BASE + 'ish-design-p37a.css' + VQ; d.head.appendChild(l);
    }
    return true;
  }

  /* ───────── 4. мега-меню каталога: слева группы (как левое меню главной), справа разделы мини-плитками с фото (как «Разделы группы» П35) ─────────
     Разметку p24 не удаляем: прячем только сетку колонок, ссылки и клавиатурная логика p24 остаются. Фото разделов - те же, что в словаре p35. */
  var IMG = {"/noutbuki":"tild3833-6239-4834-b965-343537663563/368960946504.jpg","/sistemnye-bloki":"stor3037-3138-4535-b938-613165663336/1a64377ab24797c5f9ed3732f51339f7.png","/monobloki":"tild6365-6535-4038-b734-616537613362/350866631334.jpg","/mini-pk-i-rabochie-stancii":"tild6539-6333-4731-a535-626439313133/117009453914.jpg","/monitory":"tild3465-3636-4232-a463-663262626462/IS0C1A4341CC.jpg","/televizory":"stor3766-3566-4938-b539-626438313732/175d50cacf9712418ee197d6bfa8e409.jpg","/proektory-i-paneli":"stor3335-3861-4439-b966-373538336663/d834be5eff5f7a3d54b9d62ff97668ac.jpg","/kronshteyny-i-krepleniya":"stor3535-3031-4634-b836-323261356663/87b1e65cb88081a7e8e36bed25ec8888.jpg","/processory":"stor6566-6366-4433-a536-343433346538/1d257a1dbb75e98b3d0a090a77712134.jpg","/materinskie-platy":"stor3338-6161-4863-a264-373830336566/41fc8bf32e59378fbc6939e64f770441.png","/operativnaya-pamyat":"stor6665-3162-4263-a163-303834666639/6b5f2cd5cdca2fdbdf5c40b3ec668e8b.jpg","/videokarty":"stor6636-3034-4664-b036-346638613339/be2f8b1cd68a69600b0d4aa024fa071f.jpg","/ohlazhdenie":"stor3439-6130-4133-a266-386364393137/fc751b368f07ee4ed4f036ebe5cc41f4.jpg","/korpusa-i-bloki-pitaniya":"stor3432-3463-4566-b764-326233316635/b93702f148ec483363b4a0baa2db5939.jpg","/bloki-pitaniya":"stor3039-3738-4230-b262-373031663161/5c9907970882f1243e21afeb9a0ab85a.jpg","/ssd-nakopiteli":"tild3539-6532-4665-b732-313339306166/826568586694.jpg","/zhestkie-diski":"tild3438-3333-4162-b038-646564333135/314133187724.jpg","/fleshki-i-karty-pamyati":"tild6231-3438-4932-a435-376335353164/191064673814.jpg","/karty-pamyati":"stor6661-6231-4135-a436-393532386134/c7e362f1a9b30afa98d2672bd308ab84.jpg","/ibp-i-zashchita-pitaniya":"stor6465-3265-4065-b062-356134376137/3e7dc4af46341fe351d0cd2521fd11d4.jpg","/servery-i-shd":"stor6365-6164-4261-b265-643462393630/214a3c0f954c500d3e4bb28dfa364962.jpg","/setevoe-oborudovanie":"stor6137-6334-4031-b637-653536336563/8fa61c0c0c3f52028e329caf0d38d383.jpg","/marshrutizatory":"stor3535-3335-4364-a635-353532346536/bb620a7f61abdb9f40b0afe8b401d659.jpg","/tochki-dostupa":"stor3839-3032-4330-a339-306563643365/3bc212fc8c480aa1bb070fb2104580a2.jpg","/setevye-karty":"stor3362-3063-4632-b662-383762333963/797ec653583696c8d04285746c599de5.jpg","/printery-i-mfu":"stor6362-6466-4634-b636-643362323832/a254d88583b0b21bb0a88014f64f2c72.jpg","/mfu-lazernye-cvetnye":"stor3764-3531-4538-b335-643634613939/29593373b28e24b177165f3be571c3b1.jpg","/mfu-struynye-cvetnye":"stor6163-3734-4434-b135-646666383131/176d5bb13ef9a237d912d3bd182add79.jpg","/printery-lazernye-chb":"stor6465-6363-4631-b832-366332333733/a390f3cbcfc0a72556aa6110781bfd91.jpg","/printery-lazernye-cvetnye":"stor6130-6564-4832-b166-623665316134/be3225eb00afa27d39109b3750abf5b8.jpg","/plottery":"stor6462-6433-4837-a564-393239353365/efff2b2a8adb42ed9207704f347218de.jpg","/skanery-dokumentov":"stor6133-3366-4564-b032-373964326131/23179543146d6660da881db3d6a9a068.png","/klaviatury":"tild6239-3037-4231-a661-383533356636/502231423034.jpg","/klaviatury-i-myshi":"tild3537-3438-4361-b739-376638643730/IS8DB0A2A8DA.jpg","/videonablyudenie":"stor6333-3133-4939-a565-643734343036/a210f190f9f598923494f6fca5d2d2da.jpg","/skanery-shtrihkoda":"stor3430-3466-4031-b237-393038643432/a9fa4d3e853bbc28af599d2aabf34a43.jpg","/terminaly-sbora-dannyh":"stor3232-6664-4339-b466-306639333663/ed9976d2d5a862ddbfcd211bc5ed6578.jpg","/printery-etiketok":"tild3265-6239-4735-a661-313332653034/ISDA26B90847.jpg"};
  var TILDA = 'https://static.tildacdn.com/';
  function megaBuild(inn) {
    var groups = qa('.ishp24-g', inn);
    if (!groups.length || q('.ishp37-mm', inn)) return;
    var L = '', R = '';
    groups.forEach(function (g, gi) {
      var h = q('.ishp24-gh', g); if (!h) return;
      var gh = h.getAttribute('href'), nm = (q('.ishp24-gn', h) || h).textContent, ic = q('.ishp24-ic', h);
      L += '<a class="ishp37-r' + (gi === 0 ? ' ishp37-on' : '') + '" href="' + esc(gh) + '" data-i="' + gi + '"><span class="ishp37-ri">' + (ic ? ic.outerHTML : '') + '</span><span class="ishp37-rn">' + esc(nm) + '</span><span class="ishp37-rc">' + IC.ch + '</span></a>';
      var T = '';
      qa('a.ishp24-l', g).forEach(function (a) {
        var href = a.getAttribute('href'), ph = IMG[href] || '';
        T += '<a class="ishp37-t" href="' + esc(href) + '"><span class="ishp37-ts' + (ph ? '' : ' ishp37-noimg') + '">' + (ph ? '<img src="' + TILDA + esc(ph) + '" alt="" loading="lazy" decoding="async">' : '') + '</span><b>' + esc(a.textContent) + '</b></a>';
      });
      R += '<div class="ishp37-p' + (gi === 0 ? ' ishp37-on' : '') + '" data-i="' + gi + '"><div class="ishp37-ph"><h3>' + esc(nm) + '</h3><a href="' + esc(gh) + '">Все разделы группы</a></div><div class="ishp37-tg">' + T + '</div></div>';
    });
    var w = D.createElement('div'); w.className = 'ishp37-mm';
    w.innerHTML = '<div class="ishp37-l">' + L + '</div><div class="ishp37-rt">' + R + '</div>';
    inn.insertBefore(w, inn.firstChild);
    inn.classList.add('ishp37-on');
    function act(i) {
      qa('.ishp37-r,.ishp37-p', w).forEach(function (e) { e.classList.toggle('ishp37-on', e.getAttribute('data-i') === String(i)); });
    }
    qa('.ishp37-r', w).forEach(function (r) {
      var i = r.getAttribute('data-i');
      r.addEventListener('mouseenter', function () { act(i); });
      r.addEventListener('focus', function () { act(i); });
    });
  }
  function mega() {
    var inn = q('#ishp24-panel .ishp24-in');
    if (inn && q('.ishp24-grid', inn)) megaBuild(inn);
  }

  function tick() { try { menu(); } catch (e) {} try { sheet(); } catch (e) {} try { mega(); } catch (e) {} }
  var mo = null;
  function watch() {
    if (!W.MutationObserver) { setInterval(tick, 700); return; }
    var t = null;
    mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(tick, 60); });
    mo.observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    tick();
  }
  function init() {
    watch();
    if (/\/assortiment\/?$/.test(location.pathname)) {
      var n = 0, iv = setInterval(function () { var ok = false; try { ok = assort(); } catch (e) {} if (ok || ++n > 80) clearInterval(iv); }, 250);
    }
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
