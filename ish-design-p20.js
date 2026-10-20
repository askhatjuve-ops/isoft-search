/* ish-design-p20.js v1.1 · П20, 16.10.2026. v1.1 (19.10, кандидат): в панели главной (.панель) короткая подпись раздела (обёртка .ishp20-сл) попадала под правило блока «.панель a span» (12px, серый) и выглядела мельче соседей - теперь наследует размер и цвет ссылки. Внешний слой поверх живой вёрстки; блоки Tilda НЕ пишутся.
   Ш7 - короткие/ровные ПОДПИСИ пунктов меню (адреса и textContent не меняются).
   К24 - внизу раздела каталога блок «Смежные разделы и помощь» (копии карточек из боковой колонки #вн-бок).
   Подключение (одна строка, после ish-nav.js): <script src=".../ish-design-p20.js?v=1" charset="utf-8" defer></script>
   Выключатели до загрузки: window.ISH_P20 = {короткие:false, низ:false}. */
(function () {
  'use strict';
  if (window.__ishP20) return;
  window.__ishP20 = 'v1.1';
  var ВКЛ = window.ISH_P20 || {};

  /* Ш7: полное имя (как в дереве) -> короткая подпись. ПРЕДЛОЖЕНИЕ, утверждает Асхат; ключ ищется после норм().
     Правило: не длиннее 22 знаков, без союзов и общих слов группы; пары-соседи остаются парой. */
  var КОРОТКО = {
    'Серверы и серверная инфраструктура': 'Серверное оборудование',
    'Видеонаблюдение и безопасность': 'Видеонаблюдение и СКУД',
    'Кронштейны для мониторов и ТВ': 'Кронштейны',
    'Гарнитуры для конференц-связи': 'Конференц-гарнитуры',
    'Сетевые карты и адаптеры': 'Сетевые карты',
    'Маршрутизаторы (роутеры)': 'Роутеры',
    'Кабельные системы (СКС)': 'Кабельные системы СКС',   /* 20.10: СКС - подписи короче 22 знаков; страниц ещё нет, подпись сама ничего не показывает */
    'Коннекторы и инструмент': 'Коннекторы, инструмент'
  };
  /* Намеренно НЕ сокращены: пара «Принтеры лазерные цветные / ч/б» (25/21) и «Терминалы сбора данных» (22; «ТСД» непонятно
     покупателю) - решает Асхат. Остальные разделы <=20 знаков. Подписи только отображаются: адреса, textContent и title страниц не меняются. */

  function норм(t) { return String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim().toLowerCase(); }
  var КАРТА = {};
  Object.keys(КОРОТКО).forEach(function (k) { КАРТА[норм(k)] = КОРОТКО[k]; });

  var СЕЛ = '.isoft-nav .t-catalog__parts-above-item a, .isoft-nav__ghead > span, .isoft-foot a, .isoft-foot__gname,' +
    ' .вн-бок__п, .вн-смежн__п,' +
    ' .рубрикатор .группа > span, .панель h4, .панель-сетка a';

  var CSS =
    '.ishp20-полн{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;' +
    'clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important}' +
    '.ishp20-сл[data-ish-short]::after{content:attr(data-ish-short)}' +
    '.панель a>.ishp20-сл{font-size:inherit;color:inherit}' +
    '.ishp20-низ{box-sizing:border-box;max-width:min(1440px,calc(100% - 40px));margin:8px auto 40px;padding:20px 0 0;' +
    'border-top:1px solid #E3DFD6;font-family:TildaSans,Arial,sans-serif;color:#171923}' +
    '.ishp20-низ__заг{margin:0 0 14px;font-size:20px;line-height:1.3;font-weight:700}' +
    '.ishp20-низ__сетка{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}' +
    '.ishp20-низ .вн-бок__карта{margin:0!important;position:static!important;max-width:none!important;width:auto!important;box-sizing:border-box}' +
    '@media(max-width:760px){.ishp20-низ__сетка{grid-template-columns:1fr}.ishp20-низ__заг{font-size:18px}}' +
    'html.ishp20-есть-низ #вн-бок .вн-смежн,html.ishp20-есть-низ #вн-бок .вн-помощь{display:none!important}';

  function стиль() {
    if (document.getElementById('ishp20-css')) return;
    var s = document.createElement('style');
    s.id = 'ishp20-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---- Ш7 ---- */
  function короткие() {
    if (ВКЛ.короткие === false) return;
    var уз = document.querySelectorAll(СЕЛ);
    for (var i = 0; i < уз.length; i++) {
      var э = уз[i];
      for (var n = э.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) {
          var к = КАРТА[норм(n.nodeValue)];
          if (!к) continue;
          /* textContent узла не меняется (nav-логика и ключи иконок сравнивают по нему): тот же текст кладём в обёртку,
             визуально прячем его, а короткий рисуем ::after; читалка экрана читает полное имя */
          var об = document.createElement('span');
          об.className = 'ishp20-сл';
          об.setAttribute('data-ish-short', к);
          var пол = document.createElement('span');
          пол.className = 'ishp20-полн';
          пол.textContent = n.nodeValue;
          об.appendChild(пол);
          э.replaceChild(об, n);
          n = об;
        }
      }
    }
  }

  /* ---- К24 ---- */
  function низ() {
    if (ВКЛ.низ === false) return;
    if (document.getElementById('ishp20-низ')) return;
    var бок = document.getElementById('вн-бок');
    if (!бок) return;
    var смеж = бок.querySelector('.вн-смежн'), пом = бок.querySelector('.вн-помощь');
    if (!смеж && !пом) return;
    var сетка = document.querySelector('.js-store-grid-cont');
    var рек = сетка && сетка.closest('.t-rec');
    if (!рек || !рек.parentNode) return;
    var к = document.createElement('section');
    к.id = 'ishp20-низ';
    к.className = 'ishp20-низ';
    к.setAttribute('aria-label', 'Смежные разделы и помощь');
    var з = document.createElement('h2');
    з.className = 'ishp20-низ__заг';
    з.textContent = 'Смежные разделы и помощь';
    var с = document.createElement('div');
    с.className = 'ishp20-низ__сетка';
    [смеж, пом].forEach(function (x) {
      if (!x) return;
      var к2 = x.cloneNode(true);
      /* в копии нет id; ссылки - те же настоящие <a href> */
      к2.removeAttribute('id');
      с.appendChild(к2);
    });
    к.appendChild(з);
    к.appendChild(с);
    рек.parentNode.insertBefore(к, рек.nextSibling);
    document.documentElement.classList.add('ishp20-есть-низ');
    короткие();
  }

  var т = null;
  function круг() {
    if (т) return;
    т = setTimeout(function () {
      т = null;
      try { короткие(); низ(); } catch (e) {}
    }, 150);
  }

  стиль();
  var n = 0;
  var ти = setInterval(function () { круг(); if (++n > 60) clearInterval(ти); }, 500);
  if (window.MutationObserver) {
    var go = function () {
      new MutationObserver(function () { try { короткие(); } catch (e) {} круг(); }).observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
  круг();
})();
