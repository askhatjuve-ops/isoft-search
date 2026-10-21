/* ish-design-list-anim.js  v1.0 (21.10): общий листок «Ноутбук 15.6" - 10 шт ... КП готово» с анимацией набора + знак iSoft.
   Общий модуль для главной (ish-design-p8.js) и карточки товара (ish-design-p36.js). Классы только ishla-*, от html.ishp8-on не зависит.
   API: window.ISHLA = { ЛОГО (внутренность svg), лого(класс, цвет, точка, класс_точки), лист() -> html, пуск(узел .ishla) }. Стили - ish-design-list-anim.css. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISHLA) return;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-list-anim.js"]');
  (function css() {
    if (D.getElementById('ishla-css')) return;
    var src = tag && tag.src; if (!src) return;
    var l = D.createElement('link'); l.id = 'ishla-css'; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-list-anim\.js.*$/, 'ish-design-list-anim.css' + (v ? '?v=' + v[1] : ''));
    D.head.appendChild(l);
  })();
  var ЛОГО = "<g transform=\"translate(48 825) scale(1 -1)\"><path d=\"M151 0Q129 0 114.5 14.5Q100 29 100 51V496Q100 519 114.5 533.0Q129 547 151 547Q174 547 188.0 533.0Q202 519 202 496V51Q202 29 188.0 14.5Q174 0 151 0ZM151 636Q124 636 104.5 655.5Q85 675 85 702Q85 729 104.5 748.5Q124 768 151 768Q178 768 197.5 748.5Q217 729 217 702Q217 675 197.5 655.5Q178 636 151 636Z\"/></g> <g transform=\"translate(710 825) scale(1 -1)\"><path d=\"M289 -4Q219 -4 159.5 17.5Q100 39 67 72Q52 88 54.5 108.5Q57 129 74 142Q94 158 113.5 155.5Q133 153 147 138Q164 119 201.5 102.5Q239 86 285 86Q343 86 373.5 105.0Q404 124 405 154Q406 184 376.5 206.0Q347 228 269 242Q168 262 122.5 302.0Q77 342 77 400Q77 451 107.0 484.5Q137 518 184.0 534.5Q231 551 282 551Q348 551 399.0 530.0Q450 509 480 472Q494 456 493.0 438.5Q492 421 476 409Q460 398 438.0 402.0Q416 406 401 420Q376 444 347.0 453.0Q318 462 280 462Q236 462 205.5 447.0Q175 432 175 403Q175 385 184.5 370.5Q194 356 222.0 344.5Q250 333 304 322Q379 307 422.5 284.0Q466 261 485.0 230.5Q504 200 504 160Q504 114 479.5 77.0Q455 40 407.5 18.0Q360 -4 289 -4Z\"/></g> <g transform=\"translate(1313 825) scale(1 -1)\"><path d=\"M338 -4Q257 -4 194.95454545454544 31.636363636363633Q132.9090909090909 67.27272727272727 97.45454545454545 129.63636363636363Q62 192 62 272.99378881987576Q62 355 97.45454545454545 417.3636363636364Q132.9090909090909 479.72727272727275 194.95454545454544 515.3636363636364Q257 551 337.5 551Q418 551 479.8654822335025 515.3636363636364Q541.730964467005 479.72727272727275 577.3654822335025 417.3636363636364Q613 355 613 272.99378881987576Q613 192 578.0 129.5Q543 67 481.0 31.5Q419 -4 338 -4ZM338 86Q390 86 429.93055555555554 110.08108108108108Q469.8611111111111 134.16216216216216 492.43055555555554 176.0810810810811Q515 218 515 273Q515 328 492.43055555555554 370.3993288590604Q469.8611111111111 412.7986577181208 429.93055555555554 436.8993288590604Q390 461 338 461Q286 461 246.02758620689656 436.8993288590604Q206.05517241379312 412.7986577181208 183.02758620689656 370.3993288590604Q160 328 160 273Q160 218 183.02758620689656 176.0810810810811Q206.05517241379312 134.16216216216216 246.02758620689656 110.08108108108108Q286 86 338 86Z\"/></g> <g transform=\"translate(2048 825) scale(1 -1)\"><path d=\"M149 0Q130 0 115.0 14.0Q100 28 100 51V544Q100 616 128.5 669.0Q157 722 208.0 751.5Q259 781 326 781Q348 781 362.5 768.0Q377 755 377 735Q377 716 362.5 702.5Q348 689 326 689Q289 689 261.0 672.0Q233 655 217.5 625.0Q202 595 202 554V51Q202 28 188.0 14.0Q174 0 149 0ZM57 441Q36 441 23.0 453.0Q10 465 10 483Q10 503 23.0 515.0Q36 527 57 527H304Q325 527 338.0 515.0Q351 503 351 483Q351 465 338.0 453.0Q325 441 304 441Z\"/></g> <g transform=\"translate(2475 825) scale(1 -1)\"><path d=\"M289 0Q239 0 199.0 25.5Q159 51 136.0 95.0Q113 139 113 194V671Q113 693 127.0 707.0Q141 721 163 721Q185 721 199.0 707.0Q213 693 213 671V194Q213 154 235.0 127.0Q257 100 289 100H323Q341 100 353.5 86.0Q366 72 366 50Q366 28 349.5 14.0Q333 0 307 0ZM67 441Q46 441 33.0 453.0Q20 465 20 483Q20 503 33.0 515.0Q46 527 67 527H298Q319 527 332.0 515.0Q345 503 345 483Q345 465 332.0 453.0Q319 441 298 441Z\"/></g> <rect x=\"2351\" y=\"298\" width=\"192\" height=\"86\"/> <circle cx=\"514.57\" cy=\"538.48\" r=\"101.94\" fill=\"{{D}}\"/>";
  var ЛИСТ = [['Ноутбук 15.6"', '10 шт'], ['Монитор 24"', '10 шт'], ['МФУ A4', '2 шт']];
  var RM = false;
  try { RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function лого(кл, цвет, точка, дот) {
    return '<svg class="' + кл + '" viewBox="0 0 2924 873" role="img" aria-label="iSoft" fill="' + цвет + '">' + ЛОГО.replace('<circle ', '<circle class="' + (дот || 'ishla-dot') + '" ').replace('{{D}}', точка || цвет) + '</svg>';
  }
  function лист() {
    return '<div class="ishla" aria-hidden="true">' + ЛИСТ.map(function (с) { return '<div class="ishla-lr" data-t="' + с[0].replace(/"/g, '&quot;') + ' — ' + с[1] + '"><span></span></div>'; }).join('') +
      '<div class="ishla-ok"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#1FA971"/><path d="m5.6 10.4 3 3 5.8-6.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>КП готово</div></div>';
  }
  function виден(el, fn, порог) {
    if (!('IntersectionObserver' in W)) { fn(true); return; }
    new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }, { threshold: порог || .3 }).observe(el);
  }
  function пуск(ls) {
    if (RM || !ls || ls.getAttribute('data-ishla')) return;
    ls.setAttribute('data-ishla', '1');
    var рр = [].slice.call(ls.querySelectorAll('.ishla-lr')), tk = 0, tm = [];
    var cur = D.createElement('i'); cur.className = 'ishla-cur';
    var стоп = function () { tk++; tm.forEach(clearTimeout); tm = []; };
    var ждать = function (ms, f, my) { tm.push(setTimeout(function () { if (my === tk) f(); }, ms)); };
    var цикл = function () {
      var my = ++tk; tm.forEach(clearTimeout); tm = [];
      ls.className = 'ishla'; рр.forEach(function (r) { r.firstChild.textContent = ''; r.className = 'ishla-lr'; });
      if (cur.parentNode) cur.parentNode.removeChild(cur);
      var t0 = 500;
      рр.forEach(function (r) {
        var s = r.getAttribute('data-t'), sp = r.firstChild;
        ждать(t0, function () { r.classList.add('on'); r.appendChild(cur); }, my);
        for (var k = 1; k <= s.length; k++) (function (k) { ждать(t0 + 150 + k * 52, function () { sp.textContent = s.slice(0, k); }, my); })(k);
        t0 += 150 + s.length * 52 + 350;
      });
      ждать(t0 + 300, function () { if (cur.parentNode) cur.parentNode.removeChild(cur); ls.classList.add('fold'); }, my);
      ждать(t0 + 1000, function () { ls.classList.add('done'); }, my);
      ждать(t0 + 4400, function () { ls.classList.remove('done'); }, my);
      ждать(t0 + 4900, function () { ls.classList.remove('fold'); }, my);
      ждать(t0 + 5400, цикл, my);
    };
    виден(ls, function (v) { if (v) цикл(); else стоп(); }, .35);
  }
  W.ISHLA = { ЛОГО: ЛОГО, лого: лого, лист: лист, пуск: пуск };
})();
