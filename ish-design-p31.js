/* ish-design-p31.js  v1.0  (подготовка 17.10.2026; НЕ выложено на Pages)  П31 «внутренние страницы в духе главной C2» b2b.isoft-shop.kz
   Грузится загрузчиком П4 (ish-design-p4.js, строка P31V) только на текстовых страницах (.вн-верх / .вн-тело). Сам подключает ish-design-p31.css рядом с собой.
   Что делает: ставит html.ishp31-on и класс text; плавное появление блоков (только блоки НИЖЕ первого экрана);
   счётчик цифр с накруткой (для узлов .ishp31-n, сейчас на страницах не используется);
   текстовые: кобальтовая плита вместо первой боковой карточки с главной кнопкой.
   Родные узлы Tilda не переписывает; добавляет только узлы с префиксом ishp31-. Окно-попап Tilda, фильтры и «Список/Плитка» (p6) не трогает.
   Выключатели: window.ISH_P4_NO_P31 (до загрузчика) или window.ISH_P31_OFF. prefers-reduced-motion: без движения, цифры сразу итоговые.
   Ошибка / не загрузился - сайт как был. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P4_NO_P31 || W.ISH_P31_OFF || W.ISH_P31) return;
  W.ISH_P31 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p31.js"]');
  var RM = false, FINE = false;
  try { RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var HAS_IO = 'IntersectionObserver' in W;
  var LOGO = "<g transform=\"translate(48 825) scale(1 -1)\"><path d=\"M151 0Q129 0 114.5 14.5Q100 29 100 51V496Q100 519 114.5 533.0Q129 547 151 547Q174 547 188.0 533.0Q202 519 202 496V51Q202 29 188.0 14.5Q174 0 151 0ZM151 636Q124 636 104.5 655.5Q85 675 85 702Q85 729 104.5 748.5Q124 768 151 768Q178 768 197.5 748.5Q217 729 217 702Q217 675 197.5 655.5Q178 636 151 636Z\"/></g> <g transform=\"translate(710 825) scale(1 -1)\"><path d=\"M289 -4Q219 -4 159.5 17.5Q100 39 67 72Q52 88 54.5 108.5Q57 129 74 142Q94 158 113.5 155.5Q133 153 147 138Q164 119 201.5 102.5Q239 86 285 86Q343 86 373.5 105.0Q404 124 405 154Q406 184 376.5 206.0Q347 228 269 242Q168 262 122.5 302.0Q77 342 77 400Q77 451 107.0 484.5Q137 518 184.0 534.5Q231 551 282 551Q348 551 399.0 530.0Q450 509 480 472Q494 456 493.0 438.5Q492 421 476 409Q460 398 438.0 402.0Q416 406 401 420Q376 444 347.0 453.0Q318 462 280 462Q236 462 205.5 447.0Q175 432 175 403Q175 385 184.5 370.5Q194 356 222.0 344.5Q250 333 304 322Q379 307 422.5 284.0Q466 261 485.0 230.5Q504 200 504 160Q504 114 479.5 77.0Q455 40 407.5 18.0Q360 -4 289 -4Z\"/></g> <g transform=\"translate(1313 825) scale(1 -1)\"><path d=\"M338 -4Q257 -4 194.95454545454544 31.636363636363633Q132.9090909090909 67.27272727272727 97.45454545454545 129.63636363636363Q62 192 62 272.99378881987576Q62 355 97.45454545454545 417.3636363636364Q132.9090909090909 479.72727272727275 194.95454545454544 515.3636363636364Q257 551 337.5 551Q418 551 479.8654822335025 515.3636363636364Q541.730964467005 479.72727272727275 577.3654822335025 417.3636363636364Q613 355 613 272.99378881987576Q613 192 578.0 129.5Q543 67 481.0 31.5Q419 -4 338 -4ZM338 86Q390 86 429.93055555555554 110.08108108108108Q469.8611111111111 134.16216216216216 492.43055555555554 176.0810810810811Q515 218 515 273Q515 328 492.43055555555554 370.3993288590604Q469.8611111111111 412.7986577181208 429.93055555555554 436.8993288590604Q390 461 338 461Q286 461 246.02758620689656 436.8993288590604Q206.05517241379312 412.7986577181208 183.02758620689656 370.3993288590604Q160 328 160 273Q160 218 183.02758620689656 176.0810810810811Q206.05517241379312 134.16216216216216 246.02758620689656 110.08108108108108Q286 86 338 86Z\"/></g> <g transform=\"translate(2048 825) scale(1 -1)\"><path d=\"M149 0Q130 0 115.0 14.0Q100 28 100 51V544Q100 616 128.5 669.0Q157 722 208.0 751.5Q259 781 326 781Q348 781 362.5 768.0Q377 755 377 735Q377 716 362.5 702.5Q348 689 326 689Q289 689 261.0 672.0Q233 655 217.5 625.0Q202 595 202 554V51Q202 28 188.0 14.0Q174 0 149 0ZM57 441Q36 441 23.0 453.0Q10 465 10 483Q10 503 23.0 515.0Q36 527 57 527H304Q325 527 338.0 515.0Q351 503 351 483Q351 465 338.0 453.0Q325 441 304 441Z\"/></g> <g transform=\"translate(2475 825) scale(1 -1)\"><path d=\"M289 0Q239 0 199.0 25.5Q159 51 136.0 95.0Q113 139 113 194V671Q113 693 127.0 707.0Q141 721 163 721Q185 721 199.0 707.0Q213 693 213 671V194Q213 154 235.0 127.0Q257 100 289 100H323Q341 100 353.5 86.0Q366 72 366 50Q366 28 349.5 14.0Q333 0 307 0ZM67 441Q46 441 33.0 453.0Q20 465 20 483Q20 503 33.0 515.0Q46 527 67 527H298Q319 527 332.0 515.0Q345 503 345 483Q345 465 332.0 453.0Q319 441 298 441Z\"/></g> <rect x=\"2351\" y=\"298\" width=\"192\" height=\"86\"/> <circle cx=\"514.57\" cy=\"538.48\" r=\"101.94\" fill=\"{{D}}\"/>";
  var H = D.documentElement;

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

  function logoUri(col, dot) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2924 873" fill="' + col + '">' + LOGO.replace('{{D}}', dot || col) + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  function kind() {
    var k = [];
    if (D.querySelector('.вн-верх') && !D.querySelector('.вн-а__об')) k.push('text');
    return k;
  }

  /* ───── появление при прокрутке: метим только то, что стоит НИЖЕ первого экрана (видимое остаётся видимым, без вспышки) ───── */
  var io = null;
  function reveal(sel) {
    if (RM || !HAS_IO) return;
    if (!io) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    }
    var vh = W.innerHeight || 800, ys = W.pageYOffset || 0;
    var list = D.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (n.__ishp31) continue;
      var r = n.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      n.__ishp31 = 1;
      if (r.top > vh * 0.92 && r.left < (W.innerWidth || 1200)) {   /* ниже первого экрана и не за правым краем горизонтальной ленты */
        H.classList.add('ishp31-js');
        n.classList.add('ishp31-rv');
        io.observe(n);
      }
    }
  }

  /* ───── цифры с накруткой ───── */
  var cio = null;
  function counters() {
    var els = D.querySelectorAll('.ishp31-n:not([data-done])');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        if (RM || !HAS_IO) { el.setAttribute('data-done', '1'); return; }
        if (!cio) cio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { cio.unobserve(e.target); run(e.target); } });
        }, { threshold: 0.4 });
        cio.observe(el);
      })(els[i]);
    }
  }
  function run(el) {
    if (el.getAttribute('data-done')) return;
    el.setAttribute('data-done', '1');
    var to = parseFloat(el.getAttribute('data-to')) || 0, suf = el.getAttribute('data-suf') || '';
    var t0 = null, dur = 1100;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) W.requestAnimationFrame(step); else el.textContent = to + suf;
    }
    el.textContent = '0' + suf;
    W.requestAnimationFrame(step);
  }

  /* ───── текстовые страницы ───── */
  function cta() {
    var бок = D.querySelector('.вн-бок');
    if (!бок) return;
    var карты = бок.querySelectorAll('.вн-карта');
    for (var i = 0; i < карты.length; i++) {
      if (карты[i].classList.contains('ishp31-cta')) return;
      if (карты[i].querySelector('a.вн-кноп_гл')) { карты[i].classList.add('ishp31-cta'); return; }
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
        var kk = kind(), sel = [];
        kk.forEach(function (x) { H.classList.add('ishp31-' + x); });
        if (kk.indexOf('text') > -1) { cta(); sel.push('.вн-карта', '.вн-шаг'); }
        if (sel.length) reveal(sel.join(','));
        counters();
      } catch (e) {}
    }
    pass();
    /* Tilda дорисовывает список и карточку позже: наблюдаем за появлением узлов, без бесконечных опросов */
    if (W.MutationObserver) {
      var t = 0;
      new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; pass(); }, 250); })
        .observe(D.body, { childList: true, subtree: true });
    }
    return true;
  }
  /* контент рисуется скриптами блоков: пробуем до ~10 с, пока не появится признак нужной страницы */
  (function wait(n) {
    var ok = false;
    try { ok = start(); } catch (e) {}
    if (!ok && n < 40) setTimeout(function () { wait(n + 1); }, 250);
  })(0);
})();
