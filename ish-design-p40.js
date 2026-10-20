/* ish-design-p40.js · П40 «панель фильтров Ф3: стеклянные плитки» · 20.10.2026
   Новый слой поверх p6 и p35 (их не меняет). Только панель фильтров раздела каталога; карточки и список товаров не трогаются.
   Что делает js: (1) подгружает ish-design-p40.css с того же адреса, (2) ставит html.ishp40-on, (3) пишет в заголовок свёрнутой
   группы подпись выбранного в data-ishp40-sel («ASUS, HP, +1»; у цены «от X до Y»), её рисует css (::before заголовка).
   p6 пишет в data-ishd-n число вариантов группы, а не выбранное; его кружки с числом css этого слоя скрывает.
   Выключатель: window.ISH_P40_OFF = 1 или window.ISH_P4_NO_P40 = 1 (до загрузки p4). Нет js - нет css - панель как была (p6 + p35). */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P40_OFF || W.ISH_P4_NO_P40 || W.ISH_P40) return;
  W.ISH_P40 = { версия: 'ishp40-1' };
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p40"]');
  var H = D.documentElement;
  (function () {
    if (D.getElementById('ishp40-css')) return;
    var src = tag && tag.src;
    if (!src) return;
    var l = D.createElement('link');
    l.id = 'ishp40-css'; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-p40\.js.*$/, 'ish-design-p40.css' + (v ? '?v=' + v[1] : ''));
    D.head.appendChild(l);
  })();
  H.classList.add('ishp40-on');

  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function txt(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim(); }
  function цифры(x) { return parseInt(String(x || '').replace(/\D/g, ''), 10); }

  function подписьЦены(it) {
    var a = it.querySelector('.js-store-filter-pricemin'), b = it.querySelector('.js-store-filter-pricemax');
    if (!a || !b) return '';
    var аМин = a.getAttribute('data-min-val'), бМакс = b.getAttribute('data-max-val');
    var от = a.value && цифры(a.value) > (аМин ? цифры(аМин) : 0);
    var до = b.value && бМакс && цифры(b.value) < цифры(бМакс);
    if (от && до) return 'от ' + a.value.trim() + ' до ' + b.value.trim();
    if (от) return 'от ' + a.value.trim();
    if (до) return 'до ' + b.value.trim();
    return '';
  }
  function подписьГруппы(it) {
    if (it.classList.contains('t-store__filter__item_price')) return подписьЦены(it);
    var имена = qa('.js-store-filter-opt-chb:checked', it).map(function (c) {
      var л = c.closest('label'), t = л && л.querySelector('.t-store__filter__title');
      return txt(t || л || c);
    }).filter(Boolean);
    if (!имена.length) return '';
    return имена.length > 2 ? имена[0] + ', ' + имена[1] + ', +' + (имена.length - 2) : имена.join(', ');
  }
  function обновить() {
    qa('.t-store .t-store__filter__item').forEach(function (it) {
      var з = it.querySelector(':scope > .t-store__filter__item-title');
      if (!з) return;
      var п = подписьГруппы(it);
      if (п) { if (з.getAttribute('data-ishp40-sel') !== п) з.setAttribute('data-ishp40-sel', п); }
      else if (з.hasAttribute('data-ishp40-sel')) з.removeAttribute('data-ishp40-sel');
    });
  }
  var таймер = 0;
  function запуск() { clearTimeout(таймер); таймер = setTimeout(function () { try { обновить(); } catch (e) {} }, 80); }

  D.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('.t-store__filter')) { запуск(); setTimeout(запуск, 400); }
  }, true);
  D.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.classList && (t.classList.contains('js-store-filter-pricemin') || t.classList.contains('js-store-filter-pricemax'))) запуск();
  }, true);
  D.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('.t-store__filter')) { setTimeout(запуск, 120); setTimeout(запуск, 700); }
  }, true);

  var n = 0;
  (function старт() {
    var корень = D.querySelector('.t-store');
    if (!корень) { if (++n < 80) setTimeout(старт, 250); return; }
    запуск();
    if (W.MutationObserver) new MutationObserver(запуск).observe(корень, { childList: true, subtree: true });
    [600, 2000, 5000].forEach(function (ms) { setTimeout(запуск, ms); });   /* фильтры, восстановленные из адреса, приходят позже построения */
  })();
})();
