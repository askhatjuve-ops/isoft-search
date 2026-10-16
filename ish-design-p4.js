/* ish-design-p4.js  v3  (16.10.2026)  П4 «шапка и меню» + Г1 «кнопки в hero» b2b.isoft-shop.kz
   Подключается из блока шапки 3263300503 строкой <script src=... defer data-m="header,hero">. Не загрузился - сайт как был.
   Модули (атрибут data-m, по умолчанию оба): header - Ш14 полоса, Ш5 кнопка, Ш13 трубка; hero - Г1 две кнопки (с v2 включается и при data-m="header").
   v2: + подгрузка ish-design-p6.js на страницах каталога. Выключатели: window.ISH_P4_NO_HERO, window.ISH_P4_NO_P6.
   v3: + подгрузка ish-design-p8.js (блоки главной ниже первого экрана) только на главной, по признаку #лента .слайд. Выключатель: window.ISH_P4_NO_P8.
   Ничего не переписывает в чужих блоках: только ДОБАВЛЯЕТ узлы с префиксом ishp-, каждый раз проверяя, что такого ещё нет.
   Оболочка телефона перерисовывает #ishВерх целиком - трубку возвращает MutationObserver. Ошибка в одном модуле другой не останавливает. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.__ishP4) return;
  W.__ishP4 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p4.js"]');
  var mods = ((tag && tag.getAttribute('data-m')) || 'header,hero').split(',');
  function has(x) { return mods.indexOf(x) > -1; }
  var TEL = '+77758818531';          // как в живой шапке (.нш-телефон href) и в подвале
  var REQ = '/podbor';               // страница заявки списком (стр. 232998703, форма с полями li_nm); корзина - /spec

  /* повторять fn, пока не вернёт true (узлы блоков появляются не одновременно), не дольше ~8 с */
  function until(fn) {
    var n = 0;
    (function step() { var ok = false; try { ok = fn(); } catch (e) {} if (!ok && ++n < 32) setTimeout(step, 250); })();
  }
  function el(html) { var d = D.createElement('div'); d.innerHTML = html; return d.firstChild; }
  var STRIP = '<span>Безнал</span><span>НДС 16%</span><span>Счёт</span>';

  /* ───────── Ш14 + Ш5 (десктоп) ───────── */
  function desktop() {
    var шапка = D.querySelector('.нш-шапка');
    var право = шапка && шапка.querySelector('.нш-шапка-право');
    if (!шапка || !право) return false;
    if (!D.querySelector('.ishp-strip--d')) {
      var s = el('<div class="ishp-strip ishp-strip--d" role="note">' + STRIP + '</div>');
      D.body.insertBefore(s, D.body.firstChild);
      D.documentElement.classList.add('ishp-on');
      var busy = false;
      function ведёт() {
        busy = false;
        var top = Math.max(0, 30 - (W.pageYOffset || D.documentElement.scrollTop || 0));
        D.documentElement.style.setProperty('--ishp-top', top + 'px');
      }
      W.addEventListener('scroll', function () { if (!busy) { busy = true; (W.requestAnimationFrame || setTimeout)(ведёт); } }, { passive: true });
      ведёт();
    }
    if (!право.querySelector('.ishp-btn')) {
      var b = el('<a class="ishp-btn" href="' + REQ + '">Запросить КП/счёт</a>');
      var корзина = право.querySelector('.нш-корзина');
      право.insertBefore(b, корзина || null);
    }
    return true;
  }

  /* ───────── Ш14 (телефон): полоса в потоке под верхней строкой ───────── */
  function mobileStrip() {
    var все = D.getElementById('allrecords');
    if (!все) return false;
    if (!все.querySelector('.ishp-strip--m')) {
      все.insertBefore(el('<div class="ishp-strip ishp-strip--m" role="note">' + STRIP + '</div>'), все.firstChild);
    }
    return true;
  }

  /* ───────── Ш13: трубка в #ishВерх (телефон) ───────── */
  var PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  function call() {
    var верх = D.getElementById('ishВерх');
    if (!верх) return false;
    function поставить() {
      if (!верх.querySelector('.ishp-call')) {
        var a = el('<a class="ishp-call" href="tel:' + TEL + '" aria-label="Позвонить: +7 775 881 85 31">' + PHONE + '</a>');
        верх.appendChild(a);
      }
      верх.classList.add('ishp-call-on');
      var q = D.getElementById('ishМобQ');          // подпись короче: рядом с трубкой поля остаётся меньше места
      if (q && q.getAttribute('placeholder') === 'Название, модель или артикул') q.setAttribute('placeholder', 'Название, артикул');
    }
    поставить();
    if (W.MutationObserver) {
      new MutationObserver(function () {
        if (!верх.querySelector('.ishp-call') || (D.getElementById('ishМобQ') || {}).placeholder === 'Название, модель или артикул') поставить();
      }).observe(верх, { childList: true });
    }
    return true;
  }

  /* ───────── Г1: две кнопки в hero ───────── */
  var СТРЕЛКА = '<svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m1 1 6 6-6 6"/></svg>';
  function hero() {
    var лента = D.getElementById('лента');
    if (!лента) return false;
    var слайды = лента.querySelectorAll('.слайд');
    if (!слайды.length) return false;
    for (var i = 0; i < слайды.length; i++) {
      var с = слайды[i];
      if (с.getAttribute('data-ishp')) continue;
      var текст = с.querySelector('.слайд-текст');
      if (!текст) continue;
      var к = текст.querySelector('.кнопки');
      if (!к) { к = D.createElement('div'); к.className = 'кнопки'; текст.appendChild(к); }
      /* data-д - штатный делегированный обработчик главной: «запрос» открывает окно запроса, «каталог» прокручивает к рядам;
         href - запасной путь, если обработчика нет */
      к.innerHTML = '<a class="кн ishp-cta ishp-cta--main" href="' + REQ + '" data-д="запрос">Запросить цену' + СТРЕЛКА + '</a>' +
                    '<a class="кн втор ishp-cta ishp-cta--alt" href="#ряды" data-д="каталог">Смотреть каталог</a>';
      с.setAttribute('data-ishp', '1');
    }
    return true;
  }

  /* ───────── П6: фильтры и «Список / Плитка» на страницах каталога (грузит ish-design-p6.js с того же адреса, один раз) ───────── */
  var P6V = '3';
  function p6() {
    if (W.ISH_P4_NO_P6 || W.ISH_P6 || D.getElementById('ishp-p6-js')) return true;
    if (!D.querySelector('.t-store__card[data-ish13], .t-store__filter__item, .t-store__filter')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p6-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p6.js?v=' + P6V);
    D.head.appendChild(s);
    return true;
  }
  /* опрос дольше обычного (~20 с): список Tilda рисуется после загрузки; ждём только если на странице есть контейнер .t-store */
  function p6wait() {
    if (W.ISH_P4_NO_P6 || !D.querySelector('.t-store')) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p6(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П8: блоки главной ниже первого экрана (грузит ish-design-p8.js с того же адреса, один раз; только где есть слайдер главной) ───────── */
  var P8V = '1';
  function p8() {
    if (W.ISH_P4_NO_P8 || W.ISH_P8 || D.getElementById('ishp-p8-js')) return true;
    if (!D.querySelector('#лента .слайд')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p8-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p8.js?v=' + P8V);
    D.head.appendChild(s);
    return true;
  }
  /* слайдер главной рисуется скриптом блока после загрузки; ждём ~20 с, только если на странице есть узел #лента */
  function p8wait() {
    if (W.ISH_P4_NO_P8 || !D.getElementById('лента')) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p8(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  if (has('header')) {
    until(desktop);
    until(mobileStrip);
    until(call);
  }
  /* Г1: и при data-m="header" (решение владельца 16.10); выключатель window.ISH_P4_NO_HERO; на странице без слайдера hero() ничего не делает */
  if ((has('hero') || has('header')) && !W.ISH_P4_NO_HERO) until(hero);
  p6wait();
  p8wait();
})();
