/* ish-design-p43.js  v1  (22.10.2026)  П43 подпись «Фото: Icecat» под галереей карточки  b2b.isoft-shop.kz
   Условие Icecat Open: указать источник фото. Грузится из ish-design-p4.js (строка P43V) только на /tproduct/. Ничего не пишет в Tilda:
   добавляет ОДНУ мелкую строку (id ishp43-cap) после блока галереи карточки. Только для uid из icecat_uids.json рядом
   (его ведёт ночь_галерея: карточки, получившие кадр с icecat.biz; файл едет в isoft-search шагом индекса поиска).
   Нет uid в списке / файл не пришёл / нет блока галереи - ничего не рисуется.
   Выключатели: window.ISH_P43_OFF = 1 или window.ISH_P4_NO_P43 = 1 (до загрузки p4); ?ishicecat=0 в адресе. Кэш: поменять P43V в p4. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P43_OFF || W.ISH_P4_NO_P43 || W.__ishP43) return;
  if (/[?&]ishicecat=0(&|$)/.test(location.search)) return;
  var uid = (/\/tproduct\/(\d+)/.exec(location.pathname) || [])[1];
  if (!uid) return;
  W.__ishP43 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p43.js"]');
  var src = tag && tag.src;
  if (!src) return;
  var BASE = src.replace(/ish-design-p43\.js.*$/, '');
  var VER = (/[?&]v=(\w+)/.exec(src) || [])[1] || '1';

  function put() {
    if (D.getElementById('ishp43-cap')) return true;
    var root = D.querySelector('.js-store-product') || D;
    var g = root.querySelector('.t-store__prod-popup__slider') || root.querySelector('.t-slds') || root.querySelector('.t-store__prod-popup__col-left');
    if (!g || !g.parentNode) return false;
    var p = D.createElement('div');
    p.id = 'ishp43-cap';
    p.style.cssText = 'margin:6px 0 0;font-size:11px;line-height:1.3;color:#8a8f9c;text-align:left';
    var a = D.createElement('a');
    a.href = 'https://icecat.biz'; a.target = '_blank'; a.rel = 'nofollow noopener';
    a.textContent = 'Icecat';
    a.style.cssText = 'color:inherit;text-decoration:underline';
    p.appendChild(D.createTextNode('Фото: '));
    p.appendChild(a);
    g.parentNode.insertBefore(p, g.nextSibling);
    return true;
  }

  function go() {
    var n = 0;
    (function t() { if (put() || ++n > 20) return; setTimeout(t, 500); })();
  }

  try {
    fetch(BASE + 'icecat_uids.json?v=' + VER, { cache: 'default' }).then(function (r) { return r.ok ? r.json() : []; })
      .then(function (l) { if (l && l.indexOf && l.indexOf(String(uid)) >= 0) go(); })
      .catch(function () {});
  } catch (e) {}
})();
