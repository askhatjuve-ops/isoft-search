/* ish-design-p42.js  v1  (22.10.2026)  П42 «Скачать» для закупщика на /details и /delivery  b2b.isoft-shop.kz
   Грузится загрузчиком П4 (ish-design-p4.js, строка P42V) только на /details и /delivery. Родные узлы Tilda не переписывает:
   добавляет по одной карточке (.вн-карта, id ishp42-card) ПОСЛЕ карточки «Документы» (якорь - заголовок «Документы»). Нет якоря - ничего не делает.
   /details  : карточка «Скачать»: реквизиты (PDF) и прайс (XLSX), кнопки контурные (.вн-кноп_вт; залитая кнопка на странице одна - «Перейти в каталог»).
   /delivery : карточка «Условия коротко» (оплата, документы, доставка, гарантия, госзакупки, реквизиты, прайс) + те же две кнопки.
   Файлы лежат рядом (rekvizity-isoft.pdf, price-isoft.xlsx); прайс собирает ежедневный шаг индекса поиска (дата выгрузки - в первой строке файла).
   Цели Метрики/GA4: download_details, download_price (через ISHP28.goal из p28, запасной путь ym/gtag напрямую). Без параметров.
   Выключатели: window.ISH_P42_OFF = 1 или window.ISH_P4_NO_P42 = 1 (до загрузки p4). Ошибка - сайт как был. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P4_NO_P42 || W.ISH_P42_OFF || W.__ishP42) return;
  W.__ishP42 = 1;
  var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
  var DET = path === '/details', DEL = path === '/delivery';
  if (!DET && !DEL) return;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p42.js"]');
  var BASE = tag && tag.src ? tag.src.replace(/ish-design-p42\.js.*$/, '') : 'https://askhatjuve-ops.github.io/isoft-search/';
  var YM_FALLBACK = 111859133;
  var PDF = BASE + 'rekvizity-isoft.pdf', XLS = BASE + 'price-isoft.xlsx';

  function css() {
    if (D.getElementById('ishp42-css')) return;
    var s = D.createElement('style'); s.id = 'ishp42-css';
    s.textContent =
      '.ishp42-ряд{display:flex;flex-wrap:wrap;gap:10px}' +
      '.вн a.ishp42-кн{min-height:46px;padding:0 18px;gap:10px}' +
      '.ishp42-кн svg{width:20px;height:20px;flex:none;stroke:#2B44C7;fill:none;stroke-width:1.6}' +
      '.ishp42-кн small{font-size:12px;color:var(--tih,#646B7D);font-weight:500;margin-left:2px}' +
      '.ishp42-табл td:first-child{width:27%;font-weight:600;white-space:nowrap}' +
      '@media(max-width:640px){.ishp42-табл td:first-child{white-space:normal;width:34%}.ishp42-ряд a{width:100%}}';
    D.head.appendChild(s);
  }
  var ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></svg>';
  function btn(href, goal, text, ext) {
    return '<a class="вн-кноп вн-кноп_вт ishp42-кн" href="' + href + '" target="_blank" rel="noopener" data-ishp42="' + goal + '">' + ICO + text + ' <small>' + ext + '</small></a>';
  }
  function buttons() {
    return '<div class="ishp42-ряд">' + btn(PDF, 'download_details', 'Реквизиты', 'PDF') + btn(XLS, 'download_price', 'Прайс-лист', 'XLSX') + '</div>';
  }

  function goal(name) {
    try { if (W.ISHP28 && typeof W.ISHP28.goal === 'function') { W.ISHP28.goal(name); return; } } catch (e) {}
    try { if (typeof W.gtag === 'function') W.gtag('event', name, { page_path: path }); } catch (e) {}
    try { if (typeof W.ym === 'function') W.ym(Number(W.mainMetrikaId) || YM_FALLBACK, 'reachGoal', name); } catch (e) {}
  }
  D.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-ishp42]') : null;
    if (a) goal(a.getAttribute('data-ishp42'));
  }, true);

  function якорь() {
    var hs = D.querySelectorAll('.вн-карта h2, .вн-карта h3');
    for (var i = 0; i < hs.length; i++) {
      if ((hs[i].textContent || '').replace(/\s+/g, ' ').trim() === 'Документы') return hs[i].closest('.вн-карта');
    }
    return null;
  }

  function вставить() {
    if (D.getElementById('ishp42-card')) return true;
    var a = якорь();
    if (!a) return false;
    css();
    var c = D.createElement('div'); c.className = 'вн-карта'; c.id = 'ishp42-card';
    if (DET) {
      c.innerHTML = '<h3 style="margin-bottom:10px">Скачать</h3>' +
        '<p class="вн-тихо" style="margin:0 0 12px">Файлы для договора и закупки. Дата выгрузки прайса указана в первой строке файла.</p>' + buttons();
    } else {
      c.innerHTML = '<div class="вн-карта__шапка"><h2>Условия коротко</h2><span class="вн-тихо">для договора и закупки</span></div>' +
        '<table class="вн-табл ishp42-табл"><tr><th>Тема</th><th>Как у нас</th></tr>' +
        '<tr><td>Оплата</td><td>Безналичный расчёт по счёту на юридическое лицо или ИП. Счёт выставляется с НДС. <a href="/po-schetu">Покупка по счёту</a></td></tr>' +
        '<tr><td>Документы</td><td>Договор поставки: счёт на оплату, накладная и электронная счёт-фактура (ЭСФ).</td></tr>' +
        '<tr><td>Доставка</td><td>Бесплатная по Казахстану; самовывоз в Астане, Алматы и Актобе. Срок называем при оформлении счёта.</td></tr>' +
        '<tr><td>Гарантия</td><td>От производителя; срок и условия по гарантии производителя. <a href="#garantiya">Гарантия и возврат</a></td></tr>' +
        '<tr><td>Госзаказчикам и образованию</td><td>По договору поставки, в том числе через goszakup.gov.kz. <a href="/goszakupki">Госзакупки</a>, <a href="/obrazovanie">образование</a></td></tr>' +
        '<tr><td>Реквизиты</td><td><a href="/details">Реквизиты и контакты</a> · <a href="' + PDF + '" target="_blank" rel="noopener" data-ishp42="download_details">скачать PDF</a></td></tr>' +
        '<tr><td>Прайс-лист</td><td>Все товары, которые сейчас на сайте, цены с НДС. <a href="' + XLS + '" target="_blank" rel="noopener" data-ishp42="download_price">Скачать XLSX</a></td></tr>' +
        '</table><div style="margin-top:14px">' + buttons() + '</div>';
    }
    a.parentNode.insertBefore(c, a.nextSibling);
    return true;
  }

  function go() {
    var n = 0;
    (function step() { var ok = false; try { ok = вставить(); } catch (e) {} if (!ok && ++n < 24) setTimeout(step, 400); })();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
})();
