/* ish-nav.js v1 · вынесено из общего HEAD проекта (П20, 16.10.2026) побайтно; логика не менялась. Подключение: синхронный <script src> на месте прежнего inline-блока. */
/* ish_internal: метка «наш браузер» для GA4/Метрики вместо фильтра по IP (24.10.2026). ?ish_internal=1 - включить, =0 - снять; хранится в localStorage. Без метки ничего не делает. */
function ishInternalMark(W) {
  try {
    if (W.__ishInternalDone) return !!W.__ishInternal;
    W.__ishInternalDone = 1;
    var f = false, m = /[?&]ish_internal=([01])(?:&|#|$)/.exec(W.location.search || '');
    try {
      if (m) { if (m[1] === '1') W.localStorage.setItem('ish_internal', '1'); else W.localStorage.removeItem('ish_internal'); }
      f = W.localStorage.getItem('ish_internal') === '1';
    } catch (e) { f = !!(m && m[1] === '1'); }
    if (!f) return false;
    W.__ishInternal = 1;
    W.dataLayer = W.dataLayer || [];
    var dl = W.dataLayer, mk = function () { return arguments; };
    try {                                            /* до первого config, если gtag.js ещё не разобрал очередь: тогда помечен и page_view */
      for (var i = 0; i < dl.length; i++) {
        if (dl[i] && dl[i][0] === 'config') { dl.splice(i, 0, mk('set', { traffic_type: 'internal' })); break; }
      }
    } catch (e) {}
    dl.push(mk('set', { traffic_type: 'internal' }));  /* и в конец: помечает все последующие события, даже если очередь уже разобрана */
    return true;
  } catch (e) { return false; }
}
ishInternalMark(window);
(function () {
  'use strict';
  if (window.__isoftNav) return;
  window.__isoftNav = true;
  function ГРУППЫ_СП() {
    var к = window.ISH_КАРТА;
    if (!к || !к.группы) return null;
    return к.группы.map(function (г) {
      return [г.имя, г.кат.map(function (x) { return x.имя; })];
    });
  }
  var ШЕВРОН = '<svg class="isoft-nav__chev" width="16" height="16" viewBox="0 0 16 16" ' +
    'fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ШЕВРОН_ФОН = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
    "width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' " +
    "stroke='%23646B7D' stroke-width='1.6' stroke-linecap='round' " +
    "stroke-linejoin='round'/%3E%3C/svg%3E\")";
  var ШИРОКО = '(min-width:961px)';
  var ПОЛОСЫ = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
    '<path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round"/></svg>';
  var КРЕСТ = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
    '<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round"/></svg>';
  function правила(к) {
    return [
      '.isoft-nav{--k:#2B44C7;--kl:#E9ECFC;--t:#171923;--d:#646B7D;--l:#E3DFD6;--c:#928A79;',
      '--f:var(--isoft-f,TildaSans,Arial,sans-serif);color:var(--t);font-family:var(--f)}',
      '.isoft-nav *{font-family:var(--f)}',
      '.isoft-mobbtn,.isoft-mobbtn *{--f:var(--isoft-f,TildaSans,Arial,sans-serif);',
      'font-family:var(--f)}',
      '.isoft-nav__head{display:flex;align-items:center;justify-content:space-between;',
      'padding:14px 2px 12px;font-size:16px;font-weight:600;border-bottom:1px solid var(--l);',
      'background:#FFF;position:sticky;top:0;z-index:2}',
      '.isoft-nav__close{min-width:44px;min-height:44px;display:flex;align-items:center;',
      'justify-content:center;border:0;background:none;color:var(--t);cursor:pointer;border-radius:8px}',
      '.isoft-nav__close:hover{background:var(--kl)}',
      '.isoft-nav__ghead{display:flex;align-items:center;justify-content:space-between;gap:8px;',
      'width:100%;box-sizing:border-box;padding:11px 10px;background:none;border:0;cursor:pointer;',
      'font:inherit;font-size:14px;font-weight:600;color:var(--d);text-align:left;border-radius:6px}',
      '.isoft-nav__ghead:hover{background:var(--kl)}',
      '.isoft-nav__ghead[aria-expanded="true"]{color:var(--t)}',
      '.isoft-nav__chev{flex:0 0 auto;transition:transform .18s ease}',
      '.isoft-nav__ghead[aria-expanded="true"] .isoft-nav__chev{transform:rotate(180deg)}',
      '.isoft-nav__glist{display:none;padding:0 0 6px}',
      '.isoft-nav__group.is-open>.isoft-nav__glist{display:block}',
      '.isoft-nav__group{border-top:1px solid var(--l)}',
      '.isoft-nav__all-slot{padding-bottom:4px}',
      k1(к, '.isoft-nav .t-catalog__parts-above-item'),
      '{width:auto!important;max-width:none!important;min-height:0!important;margin:0!important;',
      'display:block!important;float:none!important;padding:0!important}',
      k1(к, '.isoft-nav .t-catalog__parts-above-item a'),
      '{display:block!important;padding:8px 10px 8px 22px!important;border-radius:6px!important;',
      'font-family:var(--f)!important;',
      'font-size:14px!important;font-weight:400!important;line-height:1.35!important;',
      'color:var(--t)!important;background:none!important;border:0!important;',
      'white-space:normal!important;text-align:left!important;min-height:0!important;',
      'width:100%!important;box-sizing:border-box!important;text-decoration:none!important}',
      k1(к, '.isoft-nav .isoft-nav__all-slot a'),
      '{padding:11px 10px!important;font-size:14px!important;font-weight:600!important;',
      'font-family:var(--f)!important;',
      'color:var(--d)!important;border:0!important;border-radius:6px!important;',
      'text-align:left!important;width:100%!important;box-sizing:border-box!important;',
      'background:none!important;margin:0!important}',
      k1(к, '.isoft-nav .t-catalog__parts-above-item a:hover'),
      '{background:var(--kl)!important}',
      k1(к, '.isoft-nav .t-catalog__parts-above-item a.t-active') + ',',
      k1(к, '.isoft-nav .t-catalog__parts-above-item a.t-catalog__parts-current'),
      '{background:var(--kl)!important;color:var(--k)!important;font-weight:600!important}',
      '.isoft-nav a:focus-visible,.isoft-nav__ghead:focus-visible,',
      '.isoft-nav__close:focus-visible,.isoft-mobbtn:focus-visible{',
      'outline:2px solid #2B44C7;outline-offset:1px}',
      '.isoft-side{display:none;margin-top:6px;padding-top:14px;',
      'border-top:1px solid var(--l);--k:#2B44C7;--kl:#E9ECFC;--t:#171923;',
      '--d:#646B7D;--l:#E3DFD6;--f:var(--isoft-f,TildaSans,Arial,sans-serif)}',
      '.isoft-side.is-on{display:block}',
      '.isoft-side *{font-family:var(--f)}',
      '.isoft-side__title{padding:6px 16px 10px;font-size:12px;',
      'font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:var(--d);',
      'font-family:Arial,sans-serif}',
      '.isoft-top:empty{display:none}',
      k1(к, '.isoft-side .t-catalog__filter'),
      '{display:block!important;width:100%!important;max-width:none!important;',
      'margin:0!important;padding:0!important;border:0!important;background:none!important;',
      'box-shadow:none!important;min-height:0!important;position:static!important}',
      k1(к, '.isoft-side .t-catalog__filter__controls-wrapper') + ',',
      k1(к, '.isoft-side .t-catalog__filter__options'),
      '{display:block!important;width:100%!important;max-width:none!important;',
      'flex:none!important;margin:0!important;padding:0!important;',
      'justify-content:flex-start!important}',
      k1(к, '.isoft-side .t-catalog__filter__item'),
      '{display:block!important;width:100%!important;max-width:none!important;',
      'margin:0!important;padding:0!important;position:static!important;',
      'border-top:1px solid var(--l)!important}',
      k1(к, '.isoft-side .t-catalog__filter__options > .t-catalog__filter__item:first-child'),
      '{border-top:0!important}',
      k1(к, '.isoft-side .t-catalog__filter__item_sort-mobile'),
      '{display:none!important}',
      k1(к, '.isoft-side .t-catalog__filter__item-title'),
      '{display:block!important;position:relative!important;width:100%!important;',
      'box-sizing:border-box!important;margin:0!important;',
      'padding:11px 30px 11px 10px!important;border:0!important;background:none!important;',
      'font-family:var(--f)!important;font-size:14px!important;font-weight:600!important;',
      'line-height:1.35!important;color:var(--d)!important;text-align:left!important;',
      'white-space:normal!important;border-radius:6px!important;cursor:pointer!important}',
      k1(к, '.isoft-side .t-catalog__filter__item-title:hover'),
      '{background:var(--kl)!important;color:var(--t)!important}',
      k1(к, '.isoft-side .t-catalog__filter__item-title::after'),
      '{content:""!important;position:absolute!important;right:8px!important;',
      'top:50%!important;width:16px!important;height:16px!important;margin-top:-8px!important;',
      'background-image:' + ШЕВРОН_ФОН + '!important;background-repeat:no-repeat!important;',
      'transition:transform .18s ease!important;transform-origin:50% 50%!important}',
      k1(к, '.isoft-side .t-catalog__filter__item.active > .t-catalog__filter__item-title'),
      '{color:var(--t)!important}',
      k1(к, '.isoft-side .t-catalog__filter__item.active > .t-catalog__filter__item-title::after'),
      '{transform:rotate(180deg)!important}',
      k1(к, '.isoft-side .t-catalog__filter__item-controls-wrap'),
      '{position:static!important;display:none!important;width:100%!important;',
      'min-width:0!important;max-width:none!important;box-sizing:border-box!important;',
      'margin:0!important;padding:0 10px 10px!important;border:0!important;',
      'border-radius:0!important;box-shadow:none!important;background:none!important;',
      'max-height:none!important;overflow:visible!important;',
      'transform:none!important;inset:auto!important}',
      k1(к, '.isoft-side .t-catalog__filter__item.active > .t-catalog__filter__item-controls-wrap'),
      '{display:block!important}',
      k1(к, '.isoft-side .t-catalog__filter__item-controls-container'),
      '{display:block!important;width:100%!important;max-width:none!important;',
      'padding:0!important;margin:0!important;max-height:260px!important}',
      k1(к, '.isoft-side .t-catalog__filter__item_price > .t-catalog__filter__item-price-box'),
      '{display:none!important}',
      k1(к, '.isoft-side .t-catalog__filter__item_price.active' +
            ' > .t-catalog__filter__item-price-box'),
      '{display:flex!important}',
      k1(к, '.isoft-side .t-catalog__filter__checkbox'),
      '{display:flex!important;align-items:center!important;width:100%!important;',
      'box-sizing:border-box!important;margin:0!important;padding:5px 0!important;',
      'font-size:14px!important;line-height:1.3!important;color:var(--t)!important}',
      k1(к, '.isoft-side .t-catalog__filter__item-price-box'),
      '{display:flex!important;flex-wrap:wrap!important;gap:8px!important}',
      k1(к, '.isoft-side .t-catalog__filter__item-price-box input'),
      '{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}',
      k1(к, '.isoft-side .t-catalog__filter__chosen-wrapper'),
      '{display:block!important;width:100%!important;box-sizing:border-box!important;',
      'padding:10px 10px 0!important;margin:6px 0 0!important;',
      'border-top:1px solid var(--l)!important}',
      k1(к, '.isoft-side .t-catalog__filter__reset'),
      '{display:inline-block!important;margin:0!important;font-family:var(--f)!important;',
      'font-size:13px!important;color:var(--d)!important;cursor:pointer!important}',
      k1(к, '.isoft-side .t-catalog__filter__reset:hover'),
      '{color:var(--k)!important}',
      k1(к, '.isoft-side.is-all .t-catalog__filter__item[data-isoft-char="1"]' +
            ':not([data-isoft-on="1"])'),
      '{display:none!important}',
      '.isoft-side .t-catalog__filter__item-title:focus-visible{',
      'outline:2px solid #2B44C7;outline-offset:1px}',
      '.isoft-top{display:flex;align-items:center;justify-content:flex-end;',
      'flex-wrap:wrap;gap:12px;margin:0 0 14px}',
      k1(к, '.isoft-top .t-catalog__filter__search-and-sort'),
      '{margin-left:auto!important;margin-right:0!important;display:flex!important;',
      'align-items:center!important;justify-content:flex-end!important}',
      '.isoft-mobbtn,.isoft-mobrow{display:none}',
      '@media screen and (max-width:960px){',
      '.isoft-mobrow{display:block;box-sizing:border-box;max-width:100%}',
      '.isoft-mobbtn{display:inline-flex;align-items:center;gap:8px;min-height:44px;',
      'max-width:100%;box-sizing:border-box;',
      'padding:10px 14px;border:1px solid #928A79;border-radius:8px;background:#FFF;',
      'font-family:var(--f);font-size:14px;font-weight:600;color:#171923;',
      'cursor:pointer;margin:0 0 12px}',
      '.isoft-mobbtn__cur{color:#646B7D;max-width:40vw;overflow:hidden;text-overflow:ellipsis;',
      'white-space:nowrap}',
      'body.isoft-nav-on ' + k1(к, '.t-catalog-parts-above__container'),
      '{position:fixed!important;left:0;right:0;bottom:0;top:auto;z-index:100000;background:#FFF;',
      'max-height:84vh;overflow-y:auto;overflow-x:hidden;box-sizing:border-box!important;',
      'border-radius:14px 14px 0 0;box-shadow:0 -8px 28px rgba(23,25,35,.18);',
      'transform:translateY(101%);transition:transform .22s ease;padding:0 12px 24px;',
      'width:100%!important;max-width:100%!important;margin:0!important}',
      'body.isoft-nav-on ' + k1(к, '.t-catalog-parts-above__container *'),
      '{max-width:100%;box-sizing:border-box}',
      'body.isoft-nav-on ' + k1(к, '.t-catalog-parts-above__container > *') + ',',
      'body.isoft-nav-on ' + k1(к, '.t-catalog-parts-above__container .isoft-nav') + ',',
      'body.isoft-nav-on ' + k1(к, '.t-catalog-parts-above__container .t-catalog__parts-switch-wrapper'),
      '{width:100%!important;max-width:100%!important;margin:0!important;padding:0!important;',
      'float:none!important}',
      'body.isoft-nav-open ' + k1(к, '.t-catalog-parts-above__container'),
      '{transform:translateY(0)}',
      '.isoft-nav__ghead{min-height:48px;font-size:15px}',
      k1(к, '.isoft-nav .t-catalog__parts-above-item a'),
      '{min-height:44px!important;font-size:15px!important;display:flex!important;',
      'align-items:center!important}',
      k1(к, '.isoft-nav .isoft-nav__all-slot a'),
      '{min-height:48px!important;font-size:15px!important;display:flex!important;',
      'align-items:center!important}',
      '.isoft-backdrop{position:fixed;inset:0;background:rgba(23,25,35,.32);z-index:99999;',
      'opacity:0;pointer-events:none;transition:opacity .2s ease}',
      'body.isoft-nav-open .isoft-backdrop{opacity:1;pointer-events:auto}',
      'body.isoft-nav-open{overflow:hidden}',
      '.isoft-side{display:none!important}',
      '}',
      '@media screen and (min-width:961px){.isoft-nav__head{display:none}}'
    ].join('');
  }
  function k1(к, сел) { return к ? (к + ' ' + сел) : сел; }
  function стиль(к) {
    var s = document.getElementById('isoft-nav-css');
    if (s && s.getAttribute('data-корень') === (к || '')) return;
    if (!s) {
      s = document.createElement('style');
      s.id = 'isoft-nav-css';
      (document.head || document.documentElement).appendChild(s);
    }
    s.setAttribute('data-корень', к || '');
    s.textContent = правила(к);
  }
  function норм(t) {
    return String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function гарнитура() {
    var э = document.querySelector('.js-catalog-filter-search') ||
      document.querySelector('.js-catalog-load-more-btn');
    var ф = э && getComputedStyle(э).fontFamily;
    if (ф && !/times/i.test(ф)) {
      document.documentElement.style.setProperty('--isoft-f', ф);
    }
  }
  var замков = 0;
  function замок(дело) {
    замков++;
    try { дело(); } finally { setTimeout(function () { замков--; }, 0); }
  }
  var сборок = 0;
  var ПРЕДЕЛ_СБОРОК = 30;
  function собрать() {
    var конт = document.querySelector('.t-catalog__parts-switch-wrapper');
    if (!конт) return false;
    if (!ГРУППЫ_СП()) return false;
    var панель = конт.querySelector('.isoft-nav');
    if (панель) { подобрать_отставших(конт, панель); return true; }
    if (сборок >= ПРЕДЕЛ_СБОРОК) return true;
    var пункты = конт.querySelectorAll('.t-catalog__parts-above-item');
    if (пункты.length < 5) return false;
    var по_имени = {}, всё = null;
    Array.prototype.forEach.call(пункты, function (п) {
      var a = п.querySelector('a');
      if (a && a.className.indexOf('parts-switch-btn-all') >= 0) { всё = п; return; }
      по_имени[норм(п.textContent)] = п;
    });
    if (!всё) return false;
    var ненайдено = [], разложено = 0, нав;
    замок(function () {
      нав = document.createElement('div');
      нав.className = 'isoft-nav';
      нав.id = 'isoft-nav';
      var шапка = document.createElement('div');
      шапка.className = 'isoft-nav__head';
      шапка.innerHTML = '<span>Категории</span>' +
        '<button type="button" class="isoft-nav__close" aria-label="Закрыть">' + КРЕСТ + '</button>';
      нав.appendChild(шапка);
      шапка.querySelector('.isoft-nav__close').addEventListener('click', закрыть);
      var слот = document.createElement('div');
      слот.className = 'isoft-nav__all-slot';
      слот.appendChild(всё);                       // родной пункт «Все», не подделка
      нав.appendChild(слот);
      ГРУППЫ_СП().forEach(function (г, i) {
        var есть = [];
        г[1].forEach(function (имя) {
          if (по_имени[норм(имя)]) есть.push(имя); else ненайдено.push(имя);
        });
        if (!есть.length) return;
        var гр = document.createElement('div');
        гр.className = 'isoft-nav__group';
        гр.setAttribute('data-isoft-group', String(i));
        var h = document.createElement('button');
        h.type = 'button';
        h.className = 'isoft-nav__ghead';
        h.setAttribute('aria-expanded', 'false');
        h.innerHTML = '<span>' + г[0] + '</span>' + ШЕВРОН;
        h.addEventListener('click', function () {
          var было = гр.classList.contains('is-open');
          замок(function () {
            закрыть_все_группы(нав);
            if (!было) открыть_группу(гр);
          });
        });
        var сп = document.createElement('div');
        сп.className = 'isoft-nav__glist';
        есть.forEach(function (имя) { сп.appendChild(по_имени[норм(имя)]); разложено++; });
        гр.appendChild(h);
        гр.appendChild(сп);
        нав.appendChild(гр);
      });
      if (разложено) конт.appendChild(нав);
      else конт.appendChild(всё);
    });
    if (!разложено) { return false; }
    нав.addEventListener('click', function (e) {
      if (e.target.closest('.t-catalog__parts-above-item')) setTimeout(закрыть, 140);
    });
    сборок++;
    гарнитура();
    document.body.classList.add('isoft-nav-on');
    window.__isoftNavНенайдено = ненайдено;
    window.__isoftNavСборок = сборок;
    прошлый_выбор = null;
    подсветить(true);
    мобкнопка();
    следить(нав);
    собрать_фильтры();
    return true;
  }
  function подобрать_отставших(конт, панель) {
    var отставшие = [];
    конт.querySelectorAll('.t-catalog__parts-above-item').forEach(function (п) {
      if (!панель.contains(п)) отставшие.push(п);
    });
    if (!отставшие.length) return;
    замок(function () {
      отставшие.forEach(function (п) {
        var имя = норм(п.textContent);
        var есть = null;
        панель.querySelectorAll('.t-catalog__parts-above-item').forEach(function (x) {
          if (норм(x.textContent) === имя) есть = x;
        });
        if (есть) { п.remove(); return; }
        var куда = null;
        (ГРУППЫ_СП() || []).forEach(function (г, i) {
          г[1].forEach(function (n) {
            if (норм(n) === имя) куда = панель.querySelector('[data-isoft-group="' + i + '"] .isoft-nav__glist');
          });
        });
        (куда || панель).appendChild(п);
      });
    });
  }
  function бок() {
    var конт = document.querySelector('.t-catalog__parts-switch-wrapper');
    var нав = конт && конт.querySelector('.isoft-nav');
    if (!нав) return null;                       // панели нет — ничего не трогаем
    var б = конт.querySelector('.isoft-side');
    if (!б) {
      б = document.createElement('div');
      б.className = 'isoft-side';
      var з = document.createElement('div');
      з.className = 'isoft-side__title';
      з.textContent = 'Фильтры';
      // 30.08: подсказка «Выберите категорию, чтобы увидеть технические
      // фильтры» убрана совсем. Она объясняла пустое место, а объяснять его
      // не нужно: разделы стоят прямо над фильтрами, и выбор очевиден.
      б.appendChild(з);
      конт.appendChild(б);
    }
    return б;
  }
  function верх() {
    var об = document.querySelector('.js-catalog-parts-select-container');
    if (!об) return null;
    var в = об.querySelector('.isoft-top');
    if (!в) {
      в = document.createElement('div');
      в.className = 'isoft-top';
      об.appendChild(в);
    }
    return в;
  }
  function широко() {
    return window.matchMedia && window.matchMedia(ШИРОКО).matches;
  }
  function пометить_пункты(б) {
    б.querySelectorAll('.t-catalog__filter__item').forEach(function (п) {
      var т = п.querySelector('.t-catalog__filter__item-title');
      var имя = т ? (т.getAttribute('data-filter-name') || '') : '';
      var хар = имя.indexOf('charact:') === 0 ? '1' : '0';
      if (п.getAttribute('data-isoft-char') !== хар) п.setAttribute('data-isoft-char', хар);
      var скр = п.querySelector('.js-catalog-filter-opt');
      var вкл = (скр && String(скр.value || '').trim()) ? '1' : '0';
      if (п.getAttribute('data-isoft-on') !== вкл) п.setAttribute('data-isoft-on', вкл);
      if (т && т.getAttribute('tabindex') === null) т.setAttribute('tabindex', '0');
    });
  }
  function собрать_фильтры() {
    var б = бок();
    if (!б) return;
    var в = верх();
    var об = document.querySelector('.js-catalog-parts-select-container');
    if (!об) return;
    if (!широко()) {
      var свой = б.querySelector('.t-catalog__filter');
      if (свой) {
        замок(function () {
          var сс = в && в.querySelector('.t-catalog__filter__search-and-sort');
          var обёртка = свой.querySelector('.t-catalog__filter__controls-wrapper');
          if (сс && обёртка) обёртка.appendChild(сс);
          об.appendChild(свой);
          var выб = б.querySelector('.t-catalog__filter__chosen-wrapper');
          var бар = document.querySelector('.t-catalog__filter__chosen-bar');
          if (выб && бар) бар.appendChild(выб);
        });
      }
      б.classList.remove('is-on');
      return;
    }
    var свежий = null;
    document.querySelectorAll('.t-catalog__filter').forEach(function (ф) {
      if (!б.contains(ф)) свежий = ф;              // тот, что Tilda нарисовала заново
    });
    if (свежий) {
      замок(function () {
        б.querySelectorAll('.t-catalog__filter').forEach(function (с) { с.remove(); });
        б.appendChild(свежий);
      });
    }
    var ф = б.querySelector('.t-catalog__filter');
    if (!ф) return;
    var сс = ф.querySelector('.t-catalog__filter__search-and-sort');
    if (в && сс) {
      var лишние = [];
      в.querySelectorAll('.t-catalog__filter__search-and-sort').forEach(function (с) {
        if (с !== сс) лишние.push(с);
      });
      if (лишние.length || сс.parentElement !== в) {
        замок(function () {
          лишние.forEach(function (с) { с.remove(); });
          if (сс.parentElement !== в) в.appendChild(сс);
        });
      }
    }
    var свежий_выбор = null;
    document.querySelectorAll('.t-catalog__filter__chosen-wrapper').forEach(function (в2) {
      if (!б.contains(в2)) свежий_выбор = в2;
    });
    if (свежий_выбор) {
      замок(function () {
        б.querySelectorAll('.t-catalog__filter__chosen-wrapper').forEach(function (с) {
          с.remove();
        });
        б.appendChild(свежий_выбор);
      });
    }
    пометить_пункты(б);
    if (!б.classList.contains('is-on')) б.classList.add('is-on');
    var акт = document.querySelector('.isoft-nav .isoft-nav__group a.t-active,' +
      '.isoft-nav .isoft-nav__group a.t-catalog__parts-current');
    var все = !акт;
    if (б.classList.contains('is-all') !== все) б.classList.toggle('is-all', все);
  }
  function закрыть_все_группы(нав) {
    нав.querySelectorAll('.isoft-nav__group').forEach(function (x) {
      x.classList.remove('is-open');
      var b = x.querySelector('.isoft-nav__ghead');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  function открыть_группу(гр) {
    гр.classList.add('is-open');
    var b = гр.querySelector('.isoft-nav__ghead');
    if (b) b.setAttribute('aria-expanded', 'true');
  }
  var прошлый_выбор = null;
  function подсветить(принудительно) {
    var нав = document.querySelector('.isoft-nav');
    if (!нав) return;
    var акт = нав.querySelector('a.t-active, a.t-catalog__parts-current');
    var пункт = акт ? акт.closest('.t-catalog__parts-above-item') : null;
    var ключ = пункт ? (пункт.getAttribute('data-storepart-uid') || пункт.textContent.trim()) : '';
    var сменилось = ключ !== прошлый_выбор;
    прошлый_выбор = ключ;
    if (сменилось || принудительно) {
      var группа = пункт ? пункт.closest('.isoft-nav__group') : null;
      if (группа) замок(function () { закрыть_все_группы(нав); открыть_группу(группа); });
    }
    var с = document.querySelector('.isoft-mobbtn__cur');
    if (с) {
      var т = пункт && пункт.closest('.isoft-nav__group') ? пункт.textContent.trim() : 'Все товары';
      if (с.textContent !== т) с.textContent = т;
    }
    собрать_фильтры();
  }
  function закрыть() { document.body.classList.remove('isoft-nav-open'); }
  function открыть() { document.body.classList.add('isoft-nav-open'); }
  function мобкнопка() {
    if (document.querySelector('.isoft-mobbtn')) return;
    var фильтр = document.querySelector('.t-catalog__filter');
    if (!фильтр || !фильтр.parentElement) return;
    var строка = document.createElement('div');
    строка.className = 'isoft-mobrow';
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'isoft-mobbtn';
    b.setAttribute('aria-haspopup', 'true');
    b.setAttribute('aria-expanded', 'false');
    b.innerHTML = ПОЛОСЫ + '<span>Категории</span><span class="isoft-mobbtn__cur"></span>';
    b.addEventListener('click', открыть);
    строка.appendChild(b);
    фильтр.parentElement.insertBefore(строка, фильтр);
    if (!document.querySelector('.isoft-backdrop')) {
      var f = document.createElement('div');
      f.className = 'isoft-backdrop';
      f.addEventListener('click', закрыть);
      document.body.appendChild(f);
    }
    подсветить();
  }
  function следить(нав) {
    var ждём = null;
    new MutationObserver(function (записи) {
      if (замков || ждём) return;
      var от_tilda = записи.some(function (з) { return з.target.tagName === 'A'; });
      if (!от_tilda) return;
      ждём = setTimeout(function () { ждём = null; подсветить(); }, 120);
    }).observe(нав, { attributes: true, attributeFilter: ['class'], subtree: true });
  }
  var попыток = 0;
  var т = setInterval(function () {
    попыток++;
    стиль(корень());
    следить_за_списком();
    if (собрать() && document.querySelector('.isoft-nav')) clearInterval(т);
    else if (попыток > 40) clearInterval(т);
  }, 400);
  function корень() {
    var к = document.querySelector('.t-catalog__parts-switch-wrapper') ||
      document.querySelector('.t-catalog-parts-above__container');
    var б = к && к.closest('[id^="rec"]');
    return б && б.id ? '#' + б.id : '';
  }
  стиль(корень());
  собрать();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') закрыть(); });
  window.addEventListener('popstate', закрыть);
  var ждём2 = null;
  function следить_за_списком() {
    var к = document.querySelector('.t-catalog-parts-above__container');
    if (!к || к.__isoftСледим) return;
    к.__isoftСледим = true;
    new MutationObserver(function () {
      if (замков || ждём2) return;
      ждём2 = setTimeout(function () {
        ждём2 = null;
        стиль(корень());
        собрать();
      }, 400);
    }).observe(к, { childList: true, subtree: true });
    new MutationObserver(function () {
      var b = document.querySelector('.isoft-mobbtn');
      if (b) b.setAttribute('aria-expanded',
        document.body.classList.contains('isoft-nav-open') ? 'true' : 'false');
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    var тов = document.querySelector('.js-catalog-cont-w-filter');
    if (тов && !тов.__isoftСледимФ) {
      тов.__isoftСледимФ = true;
      var ждём3 = null;
      new MutationObserver(function () {
        if (замков || ждём3) return;
        ждём3 = setTimeout(function () { ждём3 = null; собрать_фильтры(); }, 250);
      }).observe(тов, { childList: true, subtree: true });
    }
  }
  следить_за_списком();
  if (window.matchMedia) {
    var мк = window.matchMedia(ШИРОКО);
    var поворот = function () { собрать_фильтры(); };
    if (мк.addEventListener) мк.addEventListener('change', поворот);
    else if (мк.addListener) мк.addListener(поворот);
  }
})();
