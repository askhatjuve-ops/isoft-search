/* ish-design-p31.js  v2.1  (26.10: «Подобрать технику» и «Написать, что нужно» -> одна «Прислать список»; v2.0: кандидат 17.10.2026; НЕ выложено на Pages)  П31 v2 «текстовые страницы в стиле главной C2 и раздела П35»  b2b.isoft-shop.kz
   Грузится загрузчиком П4 (ish-design-p4.js, строка P31V; в кандидате P31V = '2') только на текстовых страницах (.вн-верх / .вн-тело). Сам подключает ish-design-p31.css рядом с собой.
   Что делает (родные узлы Tilda не переписывает - переставляет и добавляет узлы с префиксом ishp31-):
   1) верх: тёмная индиго-шапка со скруглением 28 («NN / РАЗДЕЛ», H1 белым, подпись из .вн-лид, справа линейный знак крупно) + белая полоса фактов внахлёст;
   2) тело: белые карточки, шаги-ступени 01/02/03 (как в одобренном П31), аккуратные таблицы условий, кобальтовая плита вместо первой боковой карточки с главной кнопкой;
   3) низ (на страницах, где уместно): индиго «Подбор техники» и «Не нашли нужное? Пришлите список».
   Список/карточку (отвергнуты владельцем) не трогает. Окно Tilda, фильтры и «Список/Плитка» (p6) не затрагивает.
   Выключатели: window.ISH_P4_NO_P31 (до загрузчика) или window.ISH_P31_OFF. prefers-reduced-motion: без движения.
   Ошибка / не загрузился - сайт как был. */
/* ISH_SLA: ОДНО место для обещаний срока (часы работы пн–вс 9:00–18:00, время Астаны UTC+5). Копия в каждом файле, кому нужна; первая загруженная создаёт window.ISH_SLA. Менять часы/тексты - здесь (во всех копиях одинаково). Проверка: window.ISH_SLA_NOW = мс. */
(function (W) { if (W.ISH_SLA) return; var O = 9, C = 18; function ok() { var h = new Date((W.ISH_SLA_NOW || Date.now()) + 5 * 36e5).getUTCHours(); return h >= O && h < C; }
  W.ISH_SLA = { open: ok, reply: function () { return ok() ? 'Ответим сегодня' : 'Ответим утром, с 9:00'; }, replyLc: function () { return ok() ? 'ответим сегодня' : 'ответим утром, с 9:00'; },
    inv: function (em) { return ok() ? 'Счёт придёт на почту ' + (em ? em + ' ' : '') + 'в течение 15 минут' : 'Сейчас нерабочее время — счёт пришлём утром, с 9:00' + (em ? ' на почту ' + em : ''); } }; })(window);
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P4_NO_P31 || W.ISH_P31_OFF || W.ISH_P31) return;
  W.ISH_P31 = 2;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p31.js"]');
  var RM = false;
  try { RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var HAS_IO = 'IntersectionObserver' in W;
  var LOGO = "<g transform=\"translate(48 825) scale(1 -1)\"><path d=\"M151 0Q129 0 114.5 14.5Q100 29 100 51V496Q100 519 114.5 533.0Q129 547 151 547Q174 547 188.0 533.0Q202 519 202 496V51Q202 29 188.0 14.5Q174 0 151 0ZM151 636Q124 636 104.5 655.5Q85 675 85 702Q85 729 104.5 748.5Q124 768 151 768Q178 768 197.5 748.5Q217 729 217 702Q217 675 197.5 655.5Q178 636 151 636Z\"/></g> <g transform=\"translate(710 825) scale(1 -1)\"><path d=\"M289 -4Q219 -4 159.5 17.5Q100 39 67 72Q52 88 54.5 108.5Q57 129 74 142Q94 158 113.5 155.5Q133 153 147 138Q164 119 201.5 102.5Q239 86 285 86Q343 86 373.5 105.0Q404 124 405 154Q406 184 376.5 206.0Q347 228 269 242Q168 262 122.5 302.0Q77 342 77 400Q77 451 107.0 484.5Q137 518 184.0 534.5Q231 551 282 551Q348 551 399.0 530.0Q450 509 480 472Q494 456 493.0 438.5Q492 421 476 409Q460 398 438.0 402.0Q416 406 401 420Q376 444 347.0 453.0Q318 462 280 462Q236 462 205.5 447.0Q175 432 175 403Q175 385 184.5 370.5Q194 356 222.0 344.5Q250 333 304 322Q379 307 422.5 284.0Q466 261 485.0 230.5Q504 200 504 160Q504 114 479.5 77.0Q455 40 407.5 18.0Q360 -4 289 -4Z\"/></g> <g transform=\"translate(1313 825) scale(1 -1)\"><path d=\"M338 -4Q257 -4 194.95454545454544 31.636363636363633Q132.9090909090909 67.27272727272727 97.45454545454545 129.63636363636363Q62 192 62 272.99378881987576Q62 355 97.45454545454545 417.3636363636364Q132.9090909090909 479.72727272727275 194.95454545454544 515.3636363636364Q257 551 337.5 551Q418 551 479.8654822335025 515.3636363636364Q541.730964467005 479.72727272727275 577.3654822335025 417.3636363636364Q613 355 613 272.99378881987576Q613 192 578.0 129.5Q543 67 481.0 31.5Q419 -4 338 -4ZM338 86Q390 86 429.93055555555554 110.08108108108108Q469.8611111111111 134.16216216216216 492.43055555555554 176.0810810810811Q515 218 515 273Q515 328 492.43055555555554 370.3993288590604Q469.8611111111111 412.7986577181208 429.93055555555554 436.8993288590604Q390 461 338 461Q286 461 246.02758620689656 436.8993288590604Q206.05517241379312 412.7986577181208 183.02758620689656 370.3993288590604Q160 328 160 273Q160 218 183.02758620689656 176.0810810810811Q206.05517241379312 134.16216216216216 246.02758620689656 110.08108108108108Q286 86 338 86Z\"/></g> <g transform=\"translate(2048 825) scale(1 -1)\"><path d=\"M149 0Q130 0 115.0 14.0Q100 28 100 51V544Q100 616 128.5 669.0Q157 722 208.0 751.5Q259 781 326 781Q348 781 362.5 768.0Q377 755 377 735Q377 716 362.5 702.5Q348 689 326 689Q289 689 261.0 672.0Q233 655 217.5 625.0Q202 595 202 554V51Q202 28 188.0 14.0Q174 0 149 0ZM57 441Q36 441 23.0 453.0Q10 465 10 483Q10 503 23.0 515.0Q36 527 57 527H304Q325 527 338.0 515.0Q351 503 351 483Q351 465 338.0 453.0Q325 441 304 441Z\"/></g> <g transform=\"translate(2475 825) scale(1 -1)\"><path d=\"M289 0Q239 0 199.0 25.5Q159 51 136.0 95.0Q113 139 113 194V671Q113 693 127.0 707.0Q141 721 163 721Q185 721 199.0 707.0Q213 693 213 671V194Q213 154 235.0 127.0Q257 100 289 100H323Q341 100 353.5 86.0Q366 72 366 50Q366 28 349.5 14.0Q333 0 307 0ZM67 441Q46 441 33.0 453.0Q20 465 20 483Q20 503 33.0 515.0Q46 527 67 527H298Q319 527 332.0 515.0Q345 503 345 483Q345 465 332.0 453.0Q319 441 298 441Z\"/></g> <rect x=\"2351\" y=\"298\" width=\"192\" height=\"86\"/> <circle cx=\"514.57\" cy=\"538.48\" r=\"101.94\" fill=\"{{D}}\"/>";
  var H = D.documentElement;
  var REQ = '/spec';

  /* стили рядом с собой, один раз */
  (function () {
    if (D.getElementById('ishp31-css')) return;
    var src = tag && tag.src;
    if (!src) return;
    var l = D.createElement('link');
    l.id = 'ishp31-css'; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-p31\.js.*$/, 'ish-design-p31.css' + (v ? '?v=' + v[1] : ''));
    D.head.appendChild(l);
  })();

  function el(t, c, h) { var e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function svg28(p) { return '<svg viewBox="0 0 28 28" aria-hidden="true">' + p + '</svg>'; }
  function logo(cls, fill, dot) {
    return '<svg class="' + cls + '" viewBox="0 0 2924 873" role="img" aria-label="iSoft" fill="' + fill + '">' + LOGO.replace('{{D}}', dot || fill) + '</svg>';
  }
  function logoUri(col, dot) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2924 873" fill="' + col + '">' + LOGO.replace('{{D}}', dot || col) + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* линейные знаки (сетка 28, как в p35) */
  var IC = {
    org: '<rect x="5" y="3.5" width="18" height="21" rx="2"/><path d="M10 8.5h2.5M15.5 8.5H18M10 13h2.5M15.5 13H18M11.5 24.5v-5h5v5"/>',
    inv: '<path d="M6 3.5h12l4 4V24.5H6z"/><path d="M18 3.5v4h4M10 13h8M10 17h8M10 21h5"/>',
    truck: '<path d="M2.5 7h14v11h-14zM16.5 11h5l4 4v3h-9z"/><circle cx="7" cy="20" r="2"/><circle cx="21" cy="20" r="2"/>',
    shield: '<path d="M14 3 5 6.5v7c0 5.5 3.8 9.4 9 11.5 5.2-2.1 9-6 9-11.5v-7z"/><path d="m10 14 3 3 5-6"/>',
    gov: '<path d="M3.5 10 14 4l10.5 6zM6 10v10M11 10v10M17 10v10M22 10v10M4 20.5h20M3 24h22"/>',
    cap: '<path d="M2.5 11 14 5l11.5 6L14 17z"/><path d="M7 14v5c0 1.6 3.2 3.5 7 3.5s7-1.9 7-3.5v-5M25.5 11v7"/>',
    pct: '<path d="M6 3.5h12l4 4V24.5H6z"/><path d="M18 3.5v4h4"/><path d="m10.5 19 7-7"/><circle cx="11" cy="12.5" r="1.4"/><circle cx="17" cy="18.5" r="1.4"/>',
    card: '<rect x="3" y="6" width="22" height="16" rx="2.5"/><circle cx="10" cy="12.5" r="2.4"/><path d="M6.5 18.5c.6-2 2-3 3.5-3s2.9 1 3.5 3M16 11.5h6M16 15h6M16 18.5h3.5"/>',
    clock: '<circle cx="14" cy="14" r="10"/><path d="M14 8v6l4 2.5"/>',
    pin: '<path d="M14 25s8-7 8-13.2A8 8 0 0 0 6 11.8C6 18 14 25 14 25z"/><circle cx="14" cy="12" r="2.8"/>',
    lock: '<rect x="5" y="12" width="18" height="12.5" rx="2.5"/><path d="M9 12V9a5 5 0 0 1 10 0v3M14 17v3"/>',
    doc: '<path d="M6 3.5h12l4 4V24.5H6z"/><path d="M18 3.5v4h4M10 12h8M10 16h8M10 20h8"/>',
    ruble: '<rect x="3" y="7" width="22" height="14" rx="2.5"/><path d="M3 12h22M7 17h5"/>',
    mail: '<rect x="3.5" y="6" width="21" height="16" rx="2.5"/><path d="m4.5 8 9.5 7.5L23.5 8"/>',
    check: '<circle cx="14" cy="14" r="10"/><path d="m9.5 14.4 3.2 3.2 6-6.6"/>',
    search: '<circle cx="12.5" cy="12.5" r="7.5"/><path d="m24 24-5.8-5.8M9.5 12.5h6"/>'
  };

  /* страницы: номер, знак в шапке, полоса фактов, нужны ли низ-блоки */
  var PAGES = {
    '/dlya-organizacij': { n: '01', big: 'org', pod: 1, fin: 1, facts: [['inv', 'Счёт для юрлиц и ИП'], ['ruble', 'Безналичный расчёт'], ['doc', 'Закрывающие документы'], ['truck', 'Бесплатная доставка']] },
    '/goszakupki':       { n: '01', big: 'gov', pod: 1, fin: 1, facts: [['gov', 'Через goszakup.gov.kz'], ['doc', 'Договор поставки'], ['inv', 'Счёт с НДС'], ['truck', 'Бесплатная доставка']] },
    '/obrazovanie':      { n: '01', big: 'cap', pod: 1, fin: 1, facts: [['gov', 'Через goszakup.gov.kz'], ['doc', 'Договор поставки'], ['inv', 'Счёт с НДС'], ['truck', 'Бесплатная доставка']] },
    '/delivery':         { n: '01', big: 'truck', pod: 1, fin: 1, facts: [['truck', 'Бесплатная доставка'], ['pin', 'Самовывоз в 3 городах'], ['inv', 'Счёт с НДС'], ['shield', 'Гарантия от производителя']] },
    '/po-schetu':        { n: '01', big: 'inv', pod: 1, fin: 1, facts: [['org', 'Для юрлиц и ИП'], ['ruble', 'Безналичная оплата'], ['mail', 'Счёт на почту'], ['doc', 'Накладная и счёт-фактура']] },
    '/s-nds':            { n: '01', big: 'pct', pod: 1, fin: 1, facts: [['check', 'Плательщик НДС'], ['inv', 'Цены с НДС'], ['doc', 'НДС выделен в счёте'], ['doc', 'Счёт-фактура на отгрузку']] },
    '/details':          { n: '01', big: 'card', pod: 0, fin: 1, facts: [['org', 'ТОО «ISOFT Казахстан»'], ['doc', 'БИН 130240003176'], ['check', 'Плательщик НДС'], ['clock', 'Пн–Вс, 9:00–18:00']] },
    '/policy':           { n: '01', big: 'lock', pod: 0, fin: 0, facts: null }
  };
  /* 19.10: на /obrazovanie и /goszakupki убрана карточка «Как мы работаем» (#kak, родной блок Tilda; прячет правило html.ishp31-nokak #kak в p31.css); на /obrazovanie H1 = «Компьютерная техника для школ и вузов» */
  var CUR = (W.location.pathname || '/').replace(/\/+$/, '').toLowerCase();
  if (CUR === '/obrazovanie' || CUR === '/goszakupki') H.classList.add('ishp31-nokak');
  var H1_TXT = { '/obrazovanie': 'Компьютерная техника для школ и вузов' };
  var LID_TXT = { '/obrazovanie': 'Техника для компьютерных классов. Работаем через портал goszakup.gov.kz' };
  /* 19.10: на этих страницах низ-блоки «Подбор техники» и «Не нашли нужное?» не рисуем (Асхат) */
  /* 20.10: и на /delivery, /details, /dlya-organizacij, /po-schetu, /s-nds (Асхат) */
  var NOLOW = ['/obrazovanie', '/goszakupki', '/delivery', '/details', '/dlya-organizacij', '/po-schetu', '/s-nds'].indexOf(CUR) >= 0;

  function pageCfg() {
    var p = (W.location.pathname || '/').replace(/\/+$/, '').toLowerCase();
    return PAGES[p] || null;
  }

  function kind() {
    var k = [];
    if (D.querySelector('.вн-верх') && !D.querySelector('.вн-а__об')) k.push('text');
    return k;
  }

  /* ───── верх: тёмная карточка-шапка + полоса фактов ───── */
  function top() {
    var верх = D.querySelector('.вн-верх');
    if (!верх || верх.getAttribute('data-p31')) return !!верх;
    var об = верх.querySelector('.вн-об'), h1 = об && об.querySelector('h1');
    if (!h1) return false;
    верх.setAttribute('data-p31', '1');
    if (H1_TXT[CUR]) h1.textContent = H1_TXT[CUR];
    var cfg = pageCfg() || { n: '01', big: 'doc', pod: 0, fin: 0, facts: null };
    var над = об.querySelector('.вн-над'), лид = об.querySelector('.вн-лид'), ряд = об.querySelector('.вн-ряд');
    var hero = el('section', 'ishp31-hero' + (лид ? '' : ' ishp31-hero--nolid'));
    hero.setAttribute('aria-label', 'Раздел сайта');
    var t = el('div', 'ishp31-hero__t');
    if (над) { над.setAttribute('data-n', cfg.n); t.appendChild(над); }
    t.appendChild(h1);
    if (лид && LID_TXT[CUR]) лид.textContent = LID_TXT[CUR];
    if (лид) { лид.classList.add('ishp31-hero__s'); t.appendChild(лид); }
    if (ряд) { ряд.classList.add('ishp31-hero__r'); t.appendChild(ряд); }
    hero.appendChild(t);
    hero.appendChild(el('div', 'ishp31-hero__p', '<i class="ishp31-ring ishp31-ring--a"></i><i class="ishp31-ring ishp31-ring--b"></i><span class="ishp31-tile">' + svg28(IC[cfg.big]) + '</span>'));
    об.appendChild(hero);
    if (cfg.facts) {
      var strip = el('div', 'ishp31-strip');
      strip.setAttribute('role', 'list');
      cfg.facts.forEach(function (x) {
        var i = el('div', 'ishp31-strip__i', svg28(IC[x[0]]) + '<p><b>' + x[1] + '</b></p>');
        i.setAttribute('role', 'listitem');
        strip.appendChild(i);
      });
      hero.appendChild(strip);
      hero.classList.add('ishp31-hero--strip');
    }
    return true;
  }

  /* ───── низ: «Подбор техники» (индиго) и «Не нашли нужное? Пришлите список» ───── */
  function low() {
    var cfg = pageCfg();
    var тело = D.querySelector('.вн-тело');
    if (!cfg || !тело || D.getElementById('ishp31-low')) return !!D.getElementById('ishp31-low');
    if (NOLOW || (!cfg.pod && !cfg.fin)) return true;
    var showPod = cfg.pod && !cfg.fin;   /* 26.10: две кнопки в /podbor на одной странице - оставляем одну («Прислать список» в «Не нашли нужное?») */
    var s = el('div', 'ishp31-low');
    s.id = 'ishp31-low';
    var h = '';
    if (showPod) h += '<section class="ishp31-pod" aria-label="Подбор техники"><div class="ishp31-pod__t">' +
      '<h2>Нужна помощь в выборе?</h2>' +
      '</div>' +
      '<a class="ishp31-pod__b" href="' + REQ + '">Прислать список</a></section>';
    if (cfg.fin) h += '<section class="ishp31-nf" aria-label="Не нашли нужное?"><span class="ishp31-nf__l">' + logo('ishp31-nf__lg', '#272B36', '#2B44C7') + '</span>' +
      '<div class="ishp31-nf__t"><h3>Не нашли нужное? Пришлите список</h3><p>Проработаем и ' + ISH_SLA.replyLc() + '.</p></div>' +
      '<div class="ishp31-ls" aria-hidden="true"><span>Ноутбук 15.6″ — 10 шт</span><span>Монитор 24″ — 10 шт</span><span>МФУ A4 — 2 шт</span><i class="ishp31-ok"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#1FA971"/><path d="m5.6 10.4 3 3 5.8-6.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>КП готово</i></div>' +
      '<div class="ishp31-nf__b"><span class="ishp31-nf__w"><a class="ishp31-b ishp31-b--main" href="' + REQ + '">Прислать список</a></span>' +
      '<a class="ishp31-b" href="/assortiment">Расширенный ассортимент 14000+</a></div></section>';
    s.innerHTML = h;
    тело.appendChild(s);   /* внутри сетки .вн-тело на всю ширину: те же края, что у карточек и шапки */
    return true;
  }

  /* ───── появление при прокрутке: метим только то, что стоит НИЖЕ первого экрана ───── */
  var io = null;
  function reveal(sel) {
    if (RM || !HAS_IO) return;
    if (!io) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    }
    var vh = W.innerHeight || 800;
    var list = D.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (n.__ishp31) continue;
      var r = n.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      n.__ishp31 = 1;
      if (r.top > vh * 0.92 && r.left < (W.innerWidth || 1200)) {
        H.classList.add('ishp31-js');
        n.classList.add('ishp31-rv');
        io.observe(n);
      }
    }
  }

  function cta() {
    var бок = D.querySelector('.вн-бок');
    if (!бок) return;
    var карты = бок.querySelectorAll('.вн-карта');
    for (var i = 0; i < карты.length; i++) {
      if (карты[i].classList.contains('ishp31-cta')) return;
      if (карты[i].querySelector('a.вн-кноп_гл')) { карты[i].classList.add('ishp31-cta'); return; }
    }
  }

  /* 20.10 (Асхат «всё свернуть»): /katalog - текстовая шапка p31 плюс родной магазин Tilda. Список разделов (~70 кнопок) и ряды фильтров (~50 строк) по умолчанию свёрнуты.
     Компьютер: одна панель в строку по краям контента - «Разделы», «Фильтры», поиск (тянется), «Порядок», «Список / Плитка» (копия переключателя p6, клик уходит в родной - он скрыт); чип бренда «-» скрыт.
     Телефон: только портянка разделов -> одна кнопка «Разделы» (фильтры там за родной кнопкой Tilda, не трогаем). Выключатель: window.ISH_P31_FOLD_OFF = 1 */
  function foldBtn(txt, tgt) {
    var b = el('button', 'ishp31-fb', '<span>' + txt + '</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg>');
    b.type = 'button'; b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', function () {
      var on = !tgt.classList.contains('ishp31-open');
      tgt.classList.toggle('ishp31-open', on); b.classList.toggle('is-on', on); b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    return b;
  }
  function foldKat() {
    if (W.ISH_P31_FOLD_OFF) return;
    var parts = D.querySelector('.t-store__parts-switch-wrapper');
    if (!parts) return;
    /* телефон: одна кнопка «Разделы» вместо портянки (CSS показывает её только до 980) */
    if (!parts.getAttribute('data-p31m') && parts.parentNode) {
      parts.setAttribute('data-p31m', '1');
      H.classList.add('ishp31-foldm');
      var mb = el('div', 'ishp31-mbar');
      mb.appendChild(foldBtn('Разделы', parts));
      parts.parentNode.insertBefore(mb, parts);
    }
    var ctl = D.querySelector('.t-store__filter__controls-wrapper');
    if (!ctl) return;
    var opts = ctl.querySelector('.t-store__filter__options'), srt = ctl.querySelector('.t-store__filter__search-and-sort');
    if (opts && srt && !ctl.getAttribute('data-p31f')) {
      ctl.setAttribute('data-p31f', '1');
      H.classList.add('ishp31-fold');
      var row = el('div', 'ishp31-fbar');
      row.appendChild(foldBtn('Разделы', parts)); row.appendChild(foldBtn('Фильтры', opts));
      ctl.insertBefore(row, ctl.firstChild);
    }
    if (!ctl.getAttribute('data-p31f')) return;
    /* метки на поиск и порядок внутри родной обёртки: селекторов Tilda на поиск мало, берём по полю ввода и по .t-store__filter__sort */
    for (var i = 0; i < srt.children.length; i++) {
      var ch = srt.children[i];
      if (ch.classList.contains('ishp31-s') || ch.classList.contains('ishp31-o')) continue;
      if (ch.querySelector('input') || ch.tagName === 'INPUT') ch.classList.add('ishp31-s');
      else if (ch.classList.contains('t-store__filter__sort') || ch.querySelector('.t-store__filter__sort,.ishp9-sort,select')) ch.classList.add('ishp31-o');
    }
    /* «Список / Плитка»: копия в панели; родная полоса p6 остаётся в DOM скрытой, клик копии = клик по родной кнопке */
    var nat = D.querySelector('.ishd-view');
    var cl = ctl.querySelector('.ishp31-view');
    if (nat && !cl) {
      cl = el('div', 'ishp31-view', '');
      var seg = nat.querySelector('.ishd-seg');
      if (seg) {
        cl.appendChild(seg.cloneNode(true));
        cl.addEventListener('click', function (e) {
          var bb = e.target && e.target.closest ? e.target.closest('button[data-v]') : null;
          if (!bb) return;
          var o = D.querySelector('.ishd-view button[data-v="' + bb.getAttribute('data-v') + '"]');
          if (o) o.click();
        });
        ctl.appendChild(cl);
      }
    }
    if (cl && nat) {
      var ob = nat.querySelectorAll('button[data-v]'), cb = cl.querySelectorAll('button[data-v]');
      for (var j = 0; j < cb.length; j++) for (var k = 0; k < ob.length; k++)
        if (ob[k].getAttribute('data-v') === cb[j].getAttribute('data-v') && cb[j].getAttribute('aria-pressed') !== ob[k].getAttribute('aria-pressed'))
          cb[j].setAttribute('aria-pressed', ob[k].getAttribute('aria-pressed'));
      cl.hidden = !!nat.hidden;
    }
    /* пустой бренд: чип «-» в строке брендов */
    var chips = D.querySelectorAll('.ishp9-bc[data-v]');
    for (var c = 0; c < chips.length; c++) {
      var v = (chips[c].getAttribute('data-v') || '').replace(/\s+/g, '');
      if ((v === '-' || v === '') && !chips[c].classList.contains('ishp31-nochip')) chips[c].classList.add('ishp31-nochip');
    }
  }

  function start() {
    var k = kind();
    if (!k.length) return false;
    H.classList.add('ishp31-on');
    k.forEach(function (x) { H.classList.add('ishp31-' + x); });
    try { H.style.setProperty('--ishp31-logo', logoUri('#2B44C7')); H.style.setProperty('--ishp31-logo-w', logoUri('#FFFFFF')); } catch (e) {}
    function pass() {
      try {
        var kk = kind();
        kk.forEach(function (x) { H.classList.add('ishp31-' + x); });
        if (kk.indexOf('text') > -1) { top(); low(); cta(); foldKat(); reveal('.вн-карта,.вн-шаг,.ishp31-pod,.ishp31-nf'); }
      } catch (e) {}
    }
    pass();
    if (W.MutationObserver) {
      var t = 0;
      new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; pass(); }, 250); })
        .observe(D.body, { childList: true, subtree: true });
    }
    return true;
  }
  (function wait(n) {
    var ok = false;
    try { ok = start(); } catch (e) {}
    if (!ok && n < 40) setTimeout(function () { wait(n + 1); }, 250);
  })(0);
})();
