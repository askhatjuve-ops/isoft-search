/* ish-design-p4.js  v6.17  (24.10.2026: P22V 10->11 ссылка на бота в карточке; прежняя v6.16: 23.10.2026: P10V 19->20 кнопка файла; прежняя v6.15: 22.10.2026: P22V 9->10 p22 ISH_TG_BOT; P22V 8->9 текст WhatsApp с товаром и ссылкой; прежняя v6.14: 22.10.2026: P25V 10->11 слияние фильтров, состав сравнения ОЗУ; прежняя v6.13: P8V=55, p8 v2.8 родное поле Файл вместо обходного шага; прежняя v6.12: + подгрузка ish-design-p43.js подпись «Фото: Icecat» на /tproduct/, P43V=1, ISH_P43_OFF / ISH_P4_NO_P43; прежняя v6.11: + подгрузка ish-design-p42.js «Скачать» (реквизиты PDF, прайс XLSX, условия коротко) на /details и /delivery, P42V=1, ISH_P42_OFF / ISH_P4_NO_P42, P28V=5 цели download_price/download_details; прежняя v6.10: + подгрузка ish-design-p41.js/.css «С этим покупают» на /tproduct/, P41V=1, ISH_P41_OFF / ISH_P4_NO_P41 / ?ishcompanion=0, P28V=4 цель companion_add; прежняя v6.9: P28V=3 цели Метрики/GA4; 21.10.2026: вкладка «Заявка» в нижней панели телефона -> /podbor; ISH_P4_NO_TABREQ; P6V=7 живые бренды, P9V=3 подпись сортировки, P19V=7 форма /spec, P21V=5 значок корзины, P35V=34 живое «Найдено», подсветка «Каталог» на телефоне)  [было v6.5 18.10.2026]  П4 «шапка и меню» + Г1 «кнопки в hero» b2b.isoft-shop.kz
   Подключается из блока шапки 3263300503 строкой <script src=... defer data-m="header,hero">. Не загрузился - сайт как был.
   Модули (атрибут data-m, по умолчанию оба): header - Ш14 полоса, Ш5 кнопка, Ш13 трубка; hero - Г1 две кнопки (с v2 включается и при data-m="header").
   v2: + подгрузка ish-design-p6.js на страницах каталога. Выключатели: window.ISH_P4_NO_HERO, window.ISH_P4_NO_P6.
   v3: + подгрузка ish-design-p8.js (блоки главной ниже первого экрана) только на главной, по признаку #лента .слайд. Выключатель: window.ISH_P4_NO_P8.
   v4: + подгрузка ish-design-p9.js (списки, карточка, ряды главной; выключатель window.ISH_P9_OFF) и ish-design-p10.js (/tproduct/, /spec, /podbor; выключатель window.ISH_P10_OFF); текст полосы с «Доставка бесплатно».
   v5: + подгрузка ish-design-p19.js (формы Tilda, /spec, сетка товаров; выключатель window.ISH_P19_OFF) и ish-design-p20.js (короткие подписи меню, «Смежные разделы»; выключатель window.ISH_P20_OFF).
   v5.1: + подключается и из общего HEAD проекта (страницы карточек /tproduct/ не содержат блок шапки 3263300503). Охранник window.__ishP4 стоит первой строкой кода: второй запуск (HEAD + блок шапки) сразу выходит, ничего не вставляет. + если на странице нет <link> на ish-design-p4.css (карточка), модуль добавляет его сам с того же адреса. + над скрытой шапкой (карточка v8: #t-header скрыт) полоса и кнопка «Запросить КП/счёт» не вставляются.
   v6: + подгрузки ish-design-p21.js (номер заявки, список из Excel; ISH_P21_OFF), p22.js (кнопка WhatsApp; ISH_P22_OFF), p23.js (квиз «Подбор техники»; ISH_P23_OFF), p24.js (мега-меню «Каталог»; ISH_P24_OFF), p25.js (сравнение и таблица; ISH_P25_OFF). P9V=1.2, P10V=2, P22V=2, P24V=2, P25V=2. v6.1 (П27): P8V=2, P23V=2 (тексты главной и приглашения квиза). v6.2: + подгрузка ish-design-p28.js (события GA4/Метрика, БИН/ИИН; ISH_P28_OFF), p22 -> v4 (Telegram). v6.3 (Т4): P10V=3 (p10 v3: данные товара из «Уточнить по этому товару» заполняют форму /podbor).
   v6.4 (П38): + подгрузка ish-design-p38.js/.css (единый формат цены, alt у фото товаров, «Цены обновлены сегодня»; ISH_P38_OFF, ISH_P38_SKIP). P38V=1.
   v6.5 (П39): + подгрузка ish-design-p39.js/.css («Показано N из M» в разделе, шапка-убегайка на телефоне, стекло; ISH_P39_OFF, ISH_P4_NO_P39, ISH_P39_SKIP). P39V=1.
   v6.6 (П40, 20.10): + подгрузка ish-design-p40.js/.css (панель фильтров Ф3 «Стеклянные плитки», только разделы со списком товаров; ISH_P40_OFF, ISH_P4_NO_P40). P40V=1.
   v6.x (П40): + подгрузка ish-design-vn.css (общий каркас текстовых страниц .вн; ISH_VN_OFF / ISH_P4_NO_VN). VNV=1.
   Ничего не переписывает в чужих блоках: только ДОБАВЛЯЕТ узлы с префиксом ishp-, каждый раз проверяя, что такого ещё нет.
   Оболочка телефона перерисовывает #ishВерх целиком - трубку возвращает MutationObserver. Ошибка в одном модуле другой не останавливает. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.__ishP4) return;
  W.__ishP4 = 1;
  /* СКС (20.10): ЕДИНЫЙ ВЫКЛЮЧАТЕЛЬ нового раздела «Кабельные системы (СКС)». 0 - ссылок на новые страницы нет нигде (меню, плитки, крошки, поиск, подвал). Поставить 1 ТОЛЬКО после создания 6 страниц разделов (страницы-узла /kabelnye-sistemy-sks не будет). Можно и из блока до загрузки: window.ISH_SKS_ON = 1. */
  var СКС_ВКЛ = 1; if (W.ISH_SKS_ON === undefined) W.ISH_SKS_ON = СКС_ВКЛ;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p4.js"]');
  var mods = ((tag && tag.getAttribute('data-m')) || 'header,hero').split(',');
  function has(x) { return mods.indexOf(x) > -1; }
  /* v5.1: стили p4 обычно подключает блок шапки (<link>); на карточках блока нет - добавляем сами, один раз (defer-скрипт идёт после разбора страницы, ссылка блока уже в DOM) */
  (function () {
    var src = tag && tag.src;
    if (!src || D.querySelector('link[href*="ish-design-p4.css"]')) return;
    var l = D.createElement('link');
    l.rel = 'stylesheet'; l.id = 'ishp-p4-css';
    l.href = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p4.css?v=2');
    D.head.appendChild(l);
  })();
  /* ───────── П40: общий каркас текстовых страниц .вн (ish-design-vn.css с того же адреса, один раз) ─────────
     Признак: на странице есть элемент .вн (/goszakupki, /obrazovanie, /delivery, /s-nds, /po-schetu, /dlya-organizacij, /details). На остальных страницах файл не грузится.
     В блоках Tilda осталась копия правил в @layer ishvn_crit: пока файл не пришёл, страница выглядит как раньше; пришёл - его правила сильнее копии.
     Выключатель: window.ISH_VN_OFF = 1 или window.ISH_P4_NO_VN = 1 (до загрузки p4). Кэш: поменять VNV. */
  var VNV = '2';
  (function () {
    function vn() {
      if (W.ISH_P4_NO_VN || W.ISH_VN_OFF || D.getElementById('ishp-vn-css') || D.querySelector('link[href*="ish-design-vn.css"]')) return true;
      if (!D.querySelector('.вн')) return false;
      var src = tag && tag.src;
      if (!src) return true;
      var l = D.createElement('link');
      l.rel = 'stylesheet'; l.id = 'ishp-vn-css';
      l.href = src.replace(/ish-design-p4\.js.*$/, 'ish-design-vn.css?v=' + VNV);
      D.head.appendChild(l);
      return true;
    }
    try { if (!vn() && D.readyState === 'loading') D.addEventListener('DOMContentLoaded', vn); } catch (e) {}
  })();
  var TEL = '+77758818531';          // как в живой шапке (.нш-телефон href) и в подвале
  var REQ = '/podbor';               // страница заявки списком (стр. 232998703, форма с полями li_nm); корзина - /spec

  /* повторять fn, пока не вернёт true (узлы блоков появляются не одновременно), не дольше ~8 с */
  function until(fn) {
    var n = 0;
    (function step() { var ok = false; try { ok = fn(); } catch (e) {} if (!ok && ++n < 32) setTimeout(step, 250); })();
  }
  /* v5.1: на карточке товара v8 родную шапку прячет само правило страницы (html.ishpg-on #t-header {display:none}); полосу и кнопку над скрытой шапкой не вставляем */
  function headerHidden() {
    var h = D.getElementById('t-header');
    return !!h && W.getComputedStyle(h).display === 'none';
  }
  function el(html) { var d = D.createElement('div'); d.innerHTML = html; return d.firstChild; }
  var PIN = '<svg class="ishp-pin" viewBox="0 0 14 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 15s5.5-5 5.5-9A5.5 5.5 0 0 0 1.5 6c0 4 5.5 9 5.5 9Z"/><circle cx="7" cy="6" r="2"/></svg>';
  var STRIP = '<span>Доставка бесплатно</span><span class="ishp-city">' + PIN + 'Астана · пн–вс 9:00–18:00</span><span class="ishp-telw"><a class="ishp-tel" href="tel:' + TEL + '">+7 775 881 85 31</a></span>';  /* 17.10: полоса = доставка + город и часы (город убран из шапки, см. p4.css) */

  /* ───────── Ш14 + Ш5 (десктоп) ───────── */
  function desktop() {
    var шапка = D.querySelector('.нш-шапка');
    var право = шапка && шапка.querySelector('.нш-шапка-право');
    if (!шапка || !право) return false;
    if (headerHidden()) return true;
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
      var b = el('<a class="ishp-btn" href="' + REQ + '">Запросить счёт | КП</a>');
      var корзина = право.querySelector('.нш-корзина');
      право.insertBefore(b, корзина || null);
    }
    return true;
  }

  /* ───────── Ш14 (телефон): полоса в потоке под верхней строкой ───────── */
  function mobileStrip() {
    var все = D.getElementById('allrecords');
    if (!все) return false;
    if (headerHidden()) return true;
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
      /* data-д - штатный делегированный обработчик главной: «запрос» открывает окно запроса;
         href - запасной путь, если обработчика нет. «Смотреть каталог» убрана 19.10 (Асхат): каталог в шапке и ряды сразу под баннером */
      к.innerHTML = '<a class="кн ishp-cta ishp-cta--main" href="' + REQ + '" data-д="запрос">Запросить цену' + СТРЕЛКА + '</a>';
      с.setAttribute('data-ishp', '1');
    }
    return true;
  }

  /* ───────── П6: фильтры и «Список / Плитка» на страницах каталога (грузит ish-design-p6.js с того же адреса, один раз) ───────── */
  var P6V = '7';
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
  var P8V = '55';   /* 22.10: p8 v2.8 родное поле Файл; пред.: 54 */ /* 21.10: кнопка слайда «14 000+» ведёт на /assortiment (p8); пред.: 53 */ /* 21.10: шаг «отправьте файл» в окне запроса (p8, ISH_P8_FILE_OFF); пред.: 52 */ /* 21.10: листок вынесен в ish-design-list-anim.js; пред.: 48 */ /* 21.10: вернули прежний блок «Не нашли нужное? Пришлите список» (листок, КП готово), связка и карточка выбора убраны; пред.: 47 */ /*    /* 20.10 печать 7→4: подпись плитки */   /* 21.10: p8 css v2.8 - карточка «выбрать / список» тёмный индиго; пред.: 44 */ /* 21.10: p8 v2.6 + css v2.7 - блок «выбрать / список» одной карточкой с переключателем (вариант Г); пред.: 43 */ /* 20.10: баннер - кнопка в одном месте, подпись на телефоне (p8.css v2.6); пред.: 20.10: p8 v+СКС (подпись плитки «Сетевое оборудование», за ISH_SKS_ON) */
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

  /* ───────── П9: списки разделов, карточка, ряды главной (ish-design-p9.js с того же адреса, один раз) ───────── */
  var P9V = '3';
  function p9() {
    if (W.ISH_P9_OFF || W.ISH_P9 || D.getElementById('ishp-p9-js')) return true;
    if (!D.querySelector('.t-store__card-list, .js-store-product, .раздел-загол')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p9-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p9.js?v=' + P9V);
    D.head.appendChild(s);
    return true;
  }
  function p9wait() {
    if (W.ISH_P9_OFF) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p9(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П19: формы и корзина (ish-design-p19.js с того же адреса, один раз) ─────────
     Грузим там, где есть форма Tilda, корзина /spec или сетка товаров: сам p19 в пустой странице ничего не делает.
     Выключатель: window.ISH_P19_OFF = 1 (до загрузки p4). Кэш: поменять P19V. */
  var P19V = '7';
  function p19() {
    if (W.ISH_P19_OFF || W.ISH_P19 || D.getElementById('ishp-p19-js')) return true;
    if (!(D.querySelector('.t-form') || D.getElementById('specRoot') || D.querySelector('.js-store-grid-cont'))) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p19-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p19.js?v=' + P19V);
    D.head.appendChild(s);
    return true;
  }
  function p19wait() {
    var n = 0;
    (function step() { var ok = false; try { ok = p19(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П20: короткие подписи меню и «Смежные разделы» (ish-design-p20.js, один раз) ─────────
     Признак: на странице есть меню/лента разделов (ish-nav, подвал, боковая колонка раздела, рубрикатор/панель главной, лента Tilda).
     p20 сам опрашивает DOM и наблюдает за ним, от порядка загрузки с ish-nav.js не зависит. Выключатель: window.ISH_P20_OFF = 1
     (собственные выключатели p20: window.ISH_P20 = {короткие:false, низ:false} читаются самим p20). Кэш: поменять P20V. */
  var P20V = '5';   /* 20.10: подпись «Коннекторы и инструмент» без сокращения; пред.: 20.10: подписи СКС без узла */
  function p20() {
    if (W.ISH_P20_OFF || W.__ishP20 || D.getElementById('ishp-p20-js')) return true;
    if (!D.querySelector('.isoft-nav, .isoft-foot, #вн-бок, .рубрикатор, .панель-сетка, .t-catalog__parts-above-item')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p20-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p20.js?v=' + P20V);
    D.head.appendChild(s);
    return true;
  }
  function p20wait() {
    if (W.ISH_P20_OFF) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p20(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П21: номер заявки (Кр3) и загрузка списка из Excel (Кр8) (ish-design-p21.js/.css с того же адреса, один раз) ─────────
     Грузим там, где есть форма корзины Tilda (form3238938703) или корзина /spec (#specRoot). В остальных страницах p21 не нужен.
     Выключатель: window.ISH_P21_OFF = 1 (до загрузки p4); по частям: window.ISH_P21_SKIP = 'num' или 'xls'. Кэш: поменять P21V. */
  var P21V = '5';
  function p21() {
    if (W.ISH_P21_OFF || W.ISH_P21 || D.getElementById('ishp-p21-js')) return true;
    if (!(D.getElementById('form3238938703') || D.getElementById('specRoot'))) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p21-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p21.js?v=' + P21V);
    D.head.appendChild(s);
    return true;
  }
  function p21wait() {
    var n = 0;
    (function step() { var ok = false; try { ok = p21(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П23: квиз «Подбор техники» (Г17) (ish-design-p23.js/.css с того же адреса, один раз) ─────────
     Грузим там, где есть форма «Отправить готовый список» (поле «Список позиций…» + Комментарий + Phone) - квиз отправляет заявку через неё.
     Выключатель: window.ISH_P23_OFF = 1 (до загрузки p4). Кэш: поменять P23V. */
  var P23V = '9';
  function p23() {
    if (W.ISH_P23_OFF || W.ISH_P23 || D.getElementById('ishp-p23-js')) return true;
    if (!D.querySelector('form [name^="Список позиций"]')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p23-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p23.js?v=' + P23V);
    D.head.appendChild(s);
    return true;
  }
  function p23wait() {
    var n = 0;
    (function step() { var ok = false; try { ok = p23(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П24: мега-меню «Каталог» (Ш9): ish-design-p24.js (+ .css рядом), один раз ─────────
     Признак: десктоп (>=981) и есть блок шапки .нш-шапка с .нш-шапка-право; на телефоне и на карточке v8 (html.ishpg-on) не грузим.
     p24 сам строит кнопку и панель. Выключатель: window.ISH_P24_OFF = 1. Кэш: поменять P24V. */
  var P24V = '11';   /* 21.10 группы 21.10: меню */   /* 20.10 печать 7→4: меню */   /* 20.10: то же; пред.: 20.10: СКС подзаголовком + 6 пунктов, без узла, за ISH_SKS_ON */
  function p24() {
    if (W.ISH_P24_OFF || W.__ishP24 || D.getElementById('ishp-p24-js')) return true;
    if (!(W.matchMedia && W.matchMedia('(min-width:981px)').matches)) return true;
    if (D.documentElement.classList.contains('ishpg-on')) return true;
    if (!D.querySelector('.нш-шапка .нш-шапка-право')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p24-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p24.js?v=' + P24V);
    D.head.appendChild(s);
    return true;
  }
  function p24wait() {
    if (W.ISH_P24_OFF) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p24(); } catch (e) {} if (!ok && ++n < 32) setTimeout(step, 250); })();
  }

  /* ───────── П25: сравнение моделей (К19) и таблица однотипных товаров (К21) (ish-design-p25.js/.css с того же адреса, один раз) ─────────
     Признак: список товаров (.t-store__card[data-ish13]) или карточка товара (/tproduct/). Выключатель: window.ISH_P25_OFF = 1. Кэш: поменять P25V. */
  var P25V = '11'; /* 22.10: состав сравнения ОЗУ, слияние фильтров;  20.10: p25 v6 - карточки выдачи поиска (.ir-card) в том же сравнении */
  function p25() {
    if (W.ISH_P25_OFF || W.__ishP25 || D.getElementById('ishp-p25-js')) return true;
    var карт = /\/tproduct\//.test(location.pathname);
    if (!карт && !D.querySelector('.t-store__card[data-ish13], .вн-т[data-product-uid], .ir-card[data-product-uid]')) return false;   /* + родительская, + выдача поиска /katalog */
    var src = tag && tag.src; if (!src) return true;
    var s = D.createElement('script'); s.id = 'ishp-p25-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p25.js?v=' + P25V); D.head.appendChild(s); return true;
  }
  function p25wait() {
    if (W.ISH_P25_OFF || !(D.querySelector('.t-store, .вн-гр[data-gruppa], #ish-results') ||/\/tproduct\//.test(location.pathname))) return;
    var n = 0; (function step() { var ok = false; try { ok = p25(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П31: внутренние страницы в духе главной C2 (ish-design-p31.js/.css с того же адреса, один раз) ─────────
     Признак: только текстовая страница (.вн-верх/.вн-тело); список и карточка не затрагиваются. На главной (#лента) не грузим - там П8.
     Выключатель: window.ISH_P31_OFF = 1 или window.ISH_P4_NO_P31 = 1 (до загрузки p4). Кэш: поменять P31V. */
  var P31V = '17';
  function p31() {
    if (W.ISH_P4_NO_P31 || W.ISH_P31_OFF || W.ISH_P31 || D.getElementById('ishp-p31-js')) return true;
    if (D.getElementById('лента')) return true;
    if (!D.querySelector('.вн-верх, .вн-тело')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p31-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p31.js?v=' + P31V);
    D.head.appendChild(s);
    return true;
  }
  function p31wait() {
    if (W.ISH_P4_NO_P31 || W.ISH_P31_OFF) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p31(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П35: раздел каталога в палитре главной (ish-design-p35.js/.css с того же адреса, один раз) ─────────
     Признак: страница со списком товаров (.t-store__card-list). Выключатель: window.ISH_P35_OFF = 1 или window.ISH_P4_NO_P35 = 1 (до загрузки p4). Кэш: поменять P35V. */
  var P35V = '34';   /* 21.10 v3.6: плитка - цена в одну строку, одно «в наличии» */   /* 21.10 группы 21.10: плитки группы */   /* 20.10 печать 7→4: плитки группы */   /* 20.10: фото 6 разделов СКС в плитках группы (p35.js v3.4); пред.: 20.10: p35.css v3.5 - цены списка на одной вертикали */
  function p35() {
    if (W.ISH_P4_NO_P35 || W.ISH_P35_OFF || W.ISH_P35 || D.getElementById('ishp-p35-js')) return true;
    if (D.getElementById('лента')) return true;
    if (!D.querySelector('.t-store__card-list, .вн-гр[data-gruppa]')) return false;   /* v3: раздел (список Tilda) или группа (свой список .вн-гр) */
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p35-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p35.js?v=' + P35V);
    D.head.appendChild(s);
    return true;
  }
  function p35wait() {
    if (W.ISH_P4_NO_P35 || W.ISH_P35_OFF || !D.querySelector('.t-store, .вн-гр[data-gruppa]')) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p35(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── П36: карточка товара в духе главной C2 (ish-design-p36.js/.css с того же адреса, один раз) ─────────
     Признак: блок покупки карточки (.ishpg-row, его строят p9/p10, поэтому ждём). Выключатель: window.ISH_P36_OFF = 1 или window.ISH_P4_NO_P36 = 1 (до загрузки p4). Кэш: поменять P36V. */
  var P36V = '19';   /* 21.10: широкие/узкие фото (w/h>1.6 или <0.62) целиком, остальные cover; 18:  кнопка «Написать, что нужно» открывает своё окно запроса (WhatsApp), не корзину; 16: «Не нашли нужное?» - вторая кнопка «Расширенный ассортимент 14000+ →» вместо «Подобрать технику»; пред.: 14 */ /*    /* 21.10: верх карточки в один экран на ноутбуке (≥901); 20.10: 20.10: главное фото карточки целиком, contain (p36.css) */
  function p36() {
    if (W.ISH_P4_NO_P36 || W.ISH_P36_OFF || W.ISH_P36 || D.getElementById('ishp-p36-js')) return true;
    if (!D.querySelector('.ishpg-row')) return false;
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p36-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p36.js?v=' + P36V);
    D.head.appendChild(s);
    return true;
  }
  function p36wait() {
    if (W.ISH_P4_NO_P36 || W.ISH_P36_OFF) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p36(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  }

  /* ───────── Поиск и сравнение в стиле главной (ish-design-poisk.css + ish-poisk-decor.js с того же адреса, на всех страницах) ─────────
     Идут ПОСЛЕ ish-search.js, p25.css и мини-корзины: подключаем на событии load (и не раньше). Выключатель: window.ISH_POISK_OFF = 1. Кэш: поменять POISKV. */
  var POISKV = '2';   /* 20.10: ish-design-poisk.css без правил карточки/колонки выдачи (их несёт ish-search.js), ish-poisk-decor.js без второго баннера «Поиск: …» */
  (function () {
    if (W.ISH_POISK_OFF || D.getElementById('ishp-poisk-js')) return;
    var src = tag && tag.src;
    if (!src) return;
    function go() {
      if (W.ISH_POISK_OFF || D.getElementById('ishp-poisk-js')) return;
      var l = D.createElement('link');
      l.id = 'ishp-poisk-css'; l.rel = 'stylesheet';
      l.href = src.replace(/ish-design-p4\.js.*$/, 'ish-design-poisk.css?v=' + POISKV);
      D.head.appendChild(l);
      /* p25.css подгружает p25.js позже (по признаку страницы): наш css должен остаться ПОСЛЕ него в каскаде (равная специфичность) */
      if (W.MutationObserver) {
        var mo = new MutationObserver(function () {
          var p = D.getElementById('ishp25-css'), me = D.getElementById('ishp-poisk-css');
          if (p && me && (p.compareDocumentPosition(me) & 2)) D.head.appendChild(me);
        });
        mo.observe(D.head, { childList: true });
        setTimeout(function () { mo.disconnect(); }, 30000);
      }
      var s = D.createElement('script');
      s.id = 'ishp-poisk-js'; s.defer = true;
      s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-poisk-decor.js?v=' + POISKV);
      D.head.appendChild(s);
    }
    if (D.readyState === 'complete') setTimeout(go, 0); else W.addEventListener('load', function () { setTimeout(go, 0); });
  })();

  /* ───────── П37: хвосты в стиле главной - мега-меню, мобильное меню, мессенджеры, шторка фильтров, /assortiment (ish-design-p37.js/.css/p37a.css с того же адреса, на всех страницах) ─────────
     Выключатель: window.ISH_P37_OFF = 1 или window.ISH_P4_NO_P37 = 1 (до загрузки p4). Кэш: поменять P37V. */
  var P37V = '22';   /* 21.10 группы 21.10: фото плиток */   /* 20.10 печать 7→4: фото плиток */   /* 20.10: фото СКС в мега-меню и мобильном меню; 6 СКС в выезжающей панели главной (ДЕРЕВО); пред.: 20.10: + ISH_КАРТА: 6 разделов СКС на клиенте (за ISH_SKS_ON); p37a v2.1: /assortiment на телефоне */
  (function () {
    if (W.ISH_P4_NO_P37 || W.ISH_P37_OFF || W.__ishP37 || D.getElementById('ishp-p37-js')) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p37-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p37.js?v=' + P37V);
    D.head.appendChild(s);
  })();

  /* ───────── П38: мелочи показа - единый формат цены «471 000 ₸», alt у фото товаров, «Цены обновлены сегодня» (ish-design-p38.js/.css с того же адреса, на всех страницах; сам молчит, если нечего править)
     Выключатели: window.ISH_P38_OFF = 1 или window.ISH_P4_NO_P38 = 1 (до загрузки p4); по частям - window.ISH_P38_SKIP = 'price,alt,date'. Кэш: поменять P38V. */
  var P38V = '6';
  (function () {
    if (W.ISH_P4_NO_P38 || W.ISH_P38_OFF || W.__ishP38 || D.getElementById('ishp-p38-js')) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p38-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p38.js?v=' + P38V);
    D.head.appendChild(s);
  })();

  /* ───────── П39 v1.1 (ленты удалены 19.10): «Показано N из M» в разделе каталога, шапка-убегайка, стекло (ish-design-p39.js/.css с того же адреса, на всех страницах; сам молчит, если нечего править)
     Выключатели: window.ISH_P39_OFF = 1 или window.ISH_P4_NO_P39 = 1 (до загрузки p4); по частям - window.ISH_P39_SKIP = 'count,hdr,glass'. Кэш: поменять P39V. */
  var P39V = '4';
  (function () {
    if (W.ISH_P4_NO_P39 || W.ISH_P39_OFF || W.__ishP39 || D.getElementById('ishp-p39-js')) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p39-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p39.js?v=' + P39V);
    D.head.appendChild(s);
  })();

  /* ───────── П40 v1 (20.10): панель фильтров Ф3 «Стеклянные плитки» на разделах со списком товаров (ish-design-p40.js/.css с того же адреса, один раз; после p6 и p35)
     Признак: список товаров .t-store__card-list. Карточки и список не трогает. Выключатель: window.ISH_P40_OFF = 1 или window.ISH_P4_NO_P40 = 1 (до загрузки p4). Кэш: поменять P40V. */
  var P40V = '7';
  var P40_ВЫКЛ = 0;   /* 20.10: Асхат «убого» - П40 выключен до переделки */
  function p40() {
    if (P40_ВЫКЛ || W.ISH_P4_NO_P40 || W.ISH_P40_OFF || W.ISH_P40 || D.getElementById('ishp-p40-js')) return true;
    if (D.getElementById('лента')) return true;
    if (!D.querySelector('.t-store__card-list, .вн-гр[data-gruppa], .t-store__filter')) return false;   /* разделы, группы (свой фильтр .вн-ф) и /katalog */
    var src = tag && tag.src;
    if (!src) return true;
    var s = D.createElement('script');
    s.id = 'ishp-p40-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p40.js?v=' + P40V);
    D.head.appendChild(s);
    return true;
  }
  (function () {
    if (W.ISH_P4_NO_P40 || W.ISH_P40_OFF) return;
    var n = 0;
    (function step() { var ok = false; try { ok = p40(); } catch (e) {} if (!ok && ++n < 80) setTimeout(step, 250); })();
  })();

  /* ───────── П41 v1 (22.10): «С этим покупают» на карточке товара /tproduct/ (ish-design-p41.js/.css с того же адреса, один раз; данные companions.json рядом)
     Выключатели: window.ISH_P41_OFF = 1 или window.ISH_P4_NO_P41 = 1 (до загрузки p4); ?ishcompanion=0 в адресе. Кэш: поменять P41V. */
  var P41V = '1';
  (function () {
    if (W.ISH_P4_NO_P41 || W.ISH_P41_OFF || W.__ishP41 || D.getElementById('ishp-p41-js')) return;
    if (!/\/tproduct\/\d/.test(location.pathname) || /[?&]ishcompanion=0(&|$)/.test(location.search)) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p41-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p41.js?v=' + P41V);
    D.head.appendChild(s);
  })();

  /* ───────── П42 v1 (22.10): «Скачать» для закупщика на /details и /delivery (ish-design-p42.js с того же адреса, один раз; файлы rekvizity-isoft.pdf, price-isoft.xlsx рядом)
     Выключатели: window.ISH_P42_OFF = 1 или window.ISH_P4_NO_P42 = 1 (до загрузки p4). Кэш: поменять P42V. */
  var P42V = '1';
  (function () {
    if (W.ISH_P4_NO_P42 || W.ISH_P42_OFF || W.__ishP42 || D.getElementById('ishp-p42-js')) return;
    if (!/^\/(details|delivery)\/?$/.test(location.pathname)) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p42-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p42.js?v=' + P42V);
    D.head.appendChild(s);
  })();

  /* ───────── П43 v1 (22.10): подпись «Фото: Icecat» под галереей карточки /tproduct/ (ish-design-p43.js с того же адреса, один раз; список uid - icecat_uids.json рядом)
     Выключатели: window.ISH_P43_OFF = 1 или window.ISH_P4_NO_P43 = 1 (до загрузки p4); ?ishicecat=0. Кэш: поменять P43V. */
  var P43V = '1';
  (function () {
    if (W.ISH_P4_NO_P43 || W.ISH_P43_OFF || W.__ishP43 || D.getElementById('ishp-p43-js')) return;
    if (!/\/tproduct\//.test(location.pathname)) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p43-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p43.js?v=' + P43V);
    D.head.appendChild(s);
  })();

  /* ───────── П22: кнопка WhatsApp (грузит ish-design-p22.js с того же адреса; она сама подтянет ish-design-p22.css; выключатель window.ISH_P22_OFF) ───────── */
  var P22V = '11';
  (function () {
    if (W.ISH_P22_OFF || W.__ishP22 || D.getElementById('ishp-p22-js')) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p22-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p22.js?v=' + P22V);
    D.head.appendChild(s);
  })();

  /* ───────── П28: события аналитики (GA4 + Метрика) и проверка БИН/ИИН (ish-design-p28.js/.css с того же адреса, один раз; выключатель window.ISH_P28_OFF) ───────── */
  var P28V = '5';
  (function () {
    if (W.ISH_P28_OFF || W.__ishP28 || D.getElementById('ishp-p28-js')) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p28-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p28.js?v=' + P28V);
    D.head.appendChild(s);
  })();

  /* ───────── П10: карточка товара (/tproduct/), а на /spec и /podbor - только css и выбор «КП» ───────── */
  var P10V = '20';   /* 23.10: кнопка файла Uploadcare по-русски, контурная (p10 v5.2); пред.: 19 */   /* 21.10 группы 21.10: крошки */   /* 20.10 печать 7→4: крошки */   /* 20.10: крошки СКС без узла */
  function p10() {
    if (W.ISH_P10_OFF || D.getElementById('ishp-p10-js')) return;
    var p = location.pathname;
    if (!(p.indexOf('/tproduct/') > -1 || p === '/spec' || p === '/podbor')) return;
    var src = tag && tag.src;
    if (!src) return;
    var s = D.createElement('script');
    s.id = 'ishp-p10-js'; s.defer = true;
    s.src = src.replace(/ish-design-p4\.js.*$/, 'ish-design-p10.js?v=' + P10V);
    D.head.appendChild(s);
  }

  if (has('header')) {
    until(desktop);
    until(mobileStrip);
    until(call);
  }
  /* Г1: и при data-m="header" (решение владельца 16.10); выключатель window.ISH_P4_NO_HERO; на странице без слайдера hero() ничего не делает */
  if ((has('hero') || has('header')) && !W.ISH_P4_NO_HERO) until(hero);
  /* 19.10: подвал - убрать колонку «Покупателям», «Документы и условия» -> «Покупателям», текст под логотипом короче.
     Родной блок Tilda не правим (потребовал бы переопубликовать все страницы): подмена DOM после загрузки.
     Охранник: меняем, только если тексты и ссылки совпали с ожидаемыми. Два подвала: десктоп .нп-подвал-верх (h5, >=981) и мобильный .isoft-foot__in (h4, <=980). */
  function footerFix() {
    var roots = D.querySelectorAll('.нп-подвал-верх, .isoft-foot__in');
    if (!roots.length) return false;
    var OKH = { '/#catalog': 1, '/dlya-organizacij': 1, '/podbor': 1 };
    function low(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      if (root.getAttribute('data-ishfoot') === '1') continue;
      var buy = null, doc = null, hh = root.querySelectorAll('h4, h5');
      for (var i = 0; i < hh.length; i++) {
        var tx = low(hh[i].textContent), col = hh[i].parentNode;
        if (col.parentNode !== root && !(col.parentNode && col.parentNode.parentNode === root)) continue;
        if (tx === 'покупателям' && !buy) buy = hh[i];
        else if (tx === 'документы и условия' && !doc) doc = hh[i];
      }
      if (!buy || !doc) continue;                     /* уже правили или разметка другая - не трогаем */
      var links = buy.parentNode.querySelectorAll('a'), safe = links.length > 0;
      for (var k = 0; k < links.length; k++) if (!OKH[links[k].getAttribute('href')]) safe = false;
      if (!safe) continue;
      buy.parentNode.parentNode.removeChild(buy.parentNode);
      var nodes = doc.childNodes;
      for (var n = 0; n < nodes.length; n++) {
        if (nodes[n].nodeType === 3 && low(nodes[n].nodeValue) === 'документы и условия') { nodes[n].nodeValue = 'Покупателям'; break; }
      }
      root.setAttribute('data-ishfoot', '1');
    }
    var about = D.querySelectorAll('.нп-подвал-о');
    for (var a = 0; a < about.length; a++) {
      if (low(about[a].textContent) === 'компьютерная и офисная техника для юрлиц и ип: счёт на почту, бесплатная доставка по всему казахстану.')
        about[a].textContent = 'Компьютерная и офисная техника для юрлиц, бесплатная доставка по всему Казахстану.';
    }
    return true;
  }
  until(footerFix);
  /* 20.10: подвал на телефоне (<=980) - семь групп каталога (.isoft-foot__cat) сворачиваются в одну строку «Каталог»:
     слово ведёт на /katalog, стрелка раскрывает группы (как в превью главной, ish-design-p8). Компьютерный подвал (>=981) не трогаем.
     Охранник: сворачиваем, только если в блоке ровно семь ожидаемых групп; пометка data-ishcat на .isoft-foot__cat, повторный вызов ничего не делает. Tilda-блок не правим. */
  function footerCatFold() {
    var cat = D.querySelector('.isoft-foot__cat'), inn = cat && cat.querySelector('.isoft-foot__cat-in');
    if (!cat || !inn) return false;
    if (cat.getAttribute('data-ishcat') === '1') return true;
    var WANT = ['компьютеры', 'мониторы и экраны', 'комплектующие', 'накопители', 'сеть и хранение данных', 'печать и сканирование', 'рабочее место и видеонаблюдение'];
    var gn = inn.querySelectorAll('.isoft-foot__gname'), got = [];
    for (var i = 0; i < gn.length; i++) got.push(String(gn[i].textContent || '').replace(/\s+/g, ' ').trim().toLowerCase());
    if (W.ISH_SKS_ON && got.length === WANT.length + 1 && got.indexOf('кабельные системы (скс)') > -1) WANT.push('кабельные системы (скс)');   /* СКС 20.10, вариант Б (отдельная группа в подвале): свёртка работает и с восьмой группой; вариант А (ссылка внутри «Сеть и хранение данных») групп не меняет */
    if (got.length !== WANT.length) return true;      /* чужая разметка - не трогаем (и не ждём) */
    for (var k = 0; k < WANT.length; k++) if (got.indexOf(WANT[k]) < 0) return true;
    if (!D.getElementById('ishp-footcat-css')) {
      var st = D.createElement('style'); st.id = 'ishp-footcat-css';
      st.textContent =
        '.ishp-fcat{display:none}' +
        '@media (max-width:980px){' +
        'html body .isoft-foot__cat[data-ishcat] .ishp-fcat{display:flex;align-items:stretch;justify-content:space-between;min-height:48px;margin:0;padding:0 16px;box-sizing:border-box;border-bottom:1px solid rgba(255,255,255,.12)}' +
        'html body .isoft-foot__cat[data-ishcat] .ishp-fcat a{flex:1 1 auto;display:flex;align-items:center;color:#fff;text-decoration:none;font:600 13px/1.2 TildaSans,Arial,sans-serif;letter-spacing:.7px;text-transform:uppercase}' +
        'html body .isoft-foot__cat[data-ishcat] .ishp-fcat button{flex:0 0 48px;display:flex;align-items:center;justify-content:flex-end;margin:0;padding:0;background:none;border:0;color:#fff;cursor:pointer}' +
        'html body .isoft-foot__cat[data-ishcat] .ishp-fcat svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s}' +
        'html body .isoft-foot__cat[data-ishcat="1"] .isoft-foot__cat-in{display:none}' +
        'html body .isoft-foot__cat[data-ishcat="1"][data-ishopen="1"] .isoft-foot__cat-in{display:block}' +
        'html body .isoft-foot__cat[data-ishcat][data-ishopen="1"] .ishp-fcat svg{transform:rotate(180deg)}' +
        '}';
      D.head.appendChild(st);
    }
    var row = D.createElement('div'); row.className = 'ishp-fcat';
    row.innerHTML = '<a href="/katalog">Каталог</a><button type="button" aria-expanded="false" aria-label="Показать разделы каталога"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>';
    var btn = row.querySelector('button');
    btn.addEventListener('click', function () {
      var o = cat.getAttribute('data-ishopen') === '1';
      if (o) cat.removeAttribute('data-ishopen'); else cat.setAttribute('data-ishopen', '1');
      btn.setAttribute('aria-expanded', o ? 'false' : 'true');
    });
    cat.insertBefore(row, inn);
    cat.setAttribute('data-ishcat', '1');
    return true;
  }
  until(footerCatFold);
  /* 20.10 (СКС, решение координатора): подвал - 6 ссылок на разделы СКС в группу «Сеть и хранение данных» (/set-i-servery) без записи в блок Tilda
     (запись подвала требует переопубликовать все страницы). Только за выключателем ISH_SKS_ON (СКС_ВКЛ). Охранник: ссылки добавляем, только если
     группа найдена, в списке нет ни одной из них и в нём есть ожидаемый пункт /servery-i-shd; пометка data-ishsks на ul, повтор ничего не делает. */
  function footerSks() {
    if (!W.ISH_SKS_ON) return true;
    var gn = D.querySelectorAll('.isoft-foot__gname[href="/set-i-servery"]');
    if (!gn.length) return false;
    var L = [['/kabel-vitaya-para', 'Кабель витая пара'], ['/rozetki-i-moduli', 'Розетки и модули'], ['/patch-paneli', 'Патч-панели'],
             ['/patch-kordy', 'Патч-корды'], ['/kabel-kanaly-i-koroba', 'Кабель-каналы и короба'], ['/konnektory-i-instrument', 'Коннекторы и инструмент']];
    for (var g = 0; g < gn.length; g++) {
      var ul = gn[g].parentNode && gn[g].parentNode.querySelector('ul');
      if (!ul || ul.getAttribute('data-ishsks') === '1') continue;
      if (!ul.querySelector('a[href="/servery-i-shd"]') || ul.querySelector('a[href="/kabel-vitaya-para"]')) continue;
      for (var i = 0; i < L.length; i++) {
        var li = D.createElement('li'), a = D.createElement('a');
        a.setAttribute('href', L[i][0]); a.textContent = L[i][1]; li.appendChild(a); ul.appendChild(li);
      }
      ul.setAttribute('data-ishsks', '1');
    }
    return true;
  }
  until(footerSks);
  /* 20.10: на 404 (/stranica-ne-naydena) убрана полоса контактов перед подвалом (блок T123 rec4039445703, класс .ish404-contacts) по просьбе владельца. Только CSS, только этот путь. */
  if (/^\/stranica-ne-naydena\/?$/.test(location.pathname) && !D.getElementById('ishp-404-css')) {
    var st404 = D.createElement('style'); st404.id = 'ishp-404-css';
    st404.textContent = 'html body .ish404-contacts,html body #rec4039445703 .ish404-contacts{display:none!important}';
    D.head.appendChild(st404);
  }
  /* 19.10 (вечер): компоновка десктопного подвала. Пять колонок в одну линию: логотип+текст+иконки | Разделы каталога | Покупателям | Связаться | Офисы.
     Работает на живой разметке Tilda (офисы внутри «Связаться») и на правленной руками (заголовок «Наши офисы:» без h5, иконки в «Связаться»).
     Охранник: колонки узнаём по тексту h5; не нашли «Разделы каталога» и «Связаться» - ничего не трогаем. Телефон (#isoftFoot) не затрагивается. */
  function footerLayout() {
    var root = D.querySelector('.нп-подвал-верх');
    if (!root) return false;
    if (root.getAttribute('data-ishlay') === '1') return true;
    if (!D.getElementById('ishp-foot-css')) {
      var st = D.createElement('style'); st.id = 'ishp-foot-css';
      st.textContent =
        '@media (min-width:981px){' +
        'html body .нп-подвал-верх[data-ishlay]{display:grid!important;grid-template-columns:minmax(200px,1fr) auto auto auto auto!important;gap:28px 36px!important;align-items:start!important}' +
        'html body .нп-подвал-верх[data-ishlay]>div{min-width:0;margin:0!important;padding:0!important}' +
        'html body .нп-подвал-верх[data-ishlay]>.ish-fc1{order:1}html body .нп-подвал-верх[data-ishlay]>.ish-fc2{order:2}html body .нп-подвал-верх[data-ishlay]>.ish-fc3{order:3}html body .нп-подвал-верх[data-ishlay]>.ish-fc4{order:4}html body .нп-подвал-верх[data-ishlay]>.ish-fc5{order:5}' +
        'html body .нп-подвал-верх[data-ishlay] h5{margin:0 0 14px!important;font:700 12px/16px TildaSans,Arial,sans-serif!important;letter-spacing:.07em!important;text-transform:uppercase!important;color:#fff!important}' +
        'html body .нп-подвал-верх[data-ishlay] .нп-подвал-лого{height:16px;margin:0 0 14px;display:flex;align-items:flex-start;overflow:visible}' +
        'html body .нп-подвал-верх[data-ishlay] .нп-подвал-лого img{margin:0!important;display:block;height:24px}' +
        'html body .нп-подвал-верх[data-ishlay] .нп-подвал-о{max-width:300px}' +
        'html body .нп-подвал-верх[data-ishlay] .нп-подвал-связь{margin-top:16px}' +
        'html body .нп-подвал-верх[data-ishlay] .нп-подвал-тел{white-space:nowrap;margin:0 0 6px}' +
        'html body .нп-подвал-верх[data-ishlay] .ish-fhours{margin:0 0 14px!important;white-space:nowrap}' +
        'html body .нп-подвал-верх[data-ishlay] li{white-space:nowrap}' +
        'html body .нп-подвал-верх[data-ishlay] li{line-height:1.45}' +
        '}' +
        '@media (min-width:981px) and (max-width:1100px){' +
        'html body .нп-подвал-верх[data-ishlay]{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:28px 28px!important}' +
        'html body .нп-подвал-верх[data-ishlay] li,html body .нп-подвал-верх[data-ishlay] .ish-fhours{white-space:normal}' +
        'html body .нп-подвал-верх[data-ishlay]>.ish-fc1,html body .нп-подвал-верх[data-ishlay]>.ish-fc2,html body .нп-подвал-верх[data-ishlay]>.ish-fc3{grid-column:span 2}' +
        'html body .нп-подвал-верх[data-ishlay]>.ish-fc4,html body .нп-подвал-верх[data-ishlay]>.ish-fc5{grid-column:span 3}' +
        '}';
      D.head.appendChild(st);
    }
    function low(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
    var kids = [].slice.call(root.children), c = {};
    kids.forEach(function (k) {
      var h = k.querySelector('h5'), t = h ? low(h.textContent) : '';
      if (k.querySelector('.нп-подвал-лого')) c[1] = k;
      else if (t === 'разделы каталога') c[2] = k;
      else if (t === 'покупателям') c[3] = k;
      else if (t === 'связаться') c[4] = k;
      else if (t === 'офисы') c[5] = k;
    });
    if (!c[2] || !c[4]) return false;                /* разметка не наша - не трогаем */
    var ul = c[4].querySelector('ul'), i, li;
    /* иконки мессенджеров - под текст у логотипа */
    var ic = root.querySelector('.нп-подвал-связь');
    if (ic && c[1] && !c[1].contains(ic)) c[1].appendChild(ic);
    /* офисы - отдельная колонка с заголовком «ОФИСЫ» */
    if (!c[5] && ul) {
      var addr = [], lis = [].slice.call(ul.children);
      for (i = 0; i < lis.length; i++) {
        var tl = low(lis[i].textContent);
        if (/^наши офисы/.test(tl)) { lis[i].parentNode.removeChild(lis[i]); }
        else if (/^(астана|алматы|актобе)\s*,/.test(tl)) addr.push(lis[i]);
      }
      if (addr.length) {
        c[5] = D.createElement('div');
        var h = D.createElement('h5'); h.textContent = 'Офисы';
        var u2 = D.createElement('ul');
        addr.forEach(function (a) { u2.appendChild(a); });
        c[5].appendChild(h); c[5].appendChild(u2);
        root.appendChild(c[5]);
      }
    }
    /* «Наши офисы:» отдельным элементом без h5 (правка руками): заменяем на h5 «Офисы» */
    if (c[5] && !c[5].querySelector('h5')) {
      var first = c[5].firstElementChild;
      if (first && /^наши офисы:?$/.test(low(first.textContent))) {
        var h6 = D.createElement('h5'); h6.textContent = 'Офисы'; c[5].replaceChild(h6, first);
      }
    }
    /* строка «Отдел продаж · …» - метка для отступа */
    var dv = c[4].querySelectorAll(':scope > div');
    for (i = 0; i < dv.length; i++) if (/отдел продаж/.test(low(dv[i].textContent))) dv[i].classList.add('ish-fhours');
    for (i = 1; i <= 5; i++) if (c[i]) c[i].classList.add('ish-fc' + i);
    root.setAttribute('data-ishlay', '1');
    return true;
  }
  until(footerLayout);
  p6wait();
  p8wait();
  p9wait();
  p19wait();
  p20wait();
  p21wait();
  p23wait();
  p24wait();
  p25wait();
  p31wait();
  p35wait();
  p36wait();
  /* v6.7 (21.10): телефон, нижняя панель оболочки. На странице раздела/карточки оболочка считает экран «home» и подсвечивает «Главная».
     Оболочка живёт в блоке Tilda (не правим): после её отрисовки переносим подсветку на «Каталог». Выключатель: window.ISH_P4_NO_TABFIX. */
  function tabFix() {
    if (W.ISH_P4_NO_TABFIX) return;
    function нужно() {
      var p = String(location.pathname).replace(/\/+$/, '');
      if (!p || p === '/spec' || p === '/podbor') return false;
      return /\/tproduct\//.test(p) || !!D.querySelector('.t-store__card-list, .t-store .js-store-grid-cont');
    }
    function правка() {
      var t = D.getElementById('ishТаб');
      if (!t || !нужно()) return;
      var home = t.querySelector('[data-таб="home"]'), cat = t.querySelector('[data-таб="catalog"]');
      if (!home || !cat || !home.classList.contains('вкл')) return;
      home.classList.remove('вкл'); home.removeAttribute('aria-current');
      cat.classList.add('вкл'); cat.setAttribute('aria-current', 'page');
    }
    var n = 0, obs = false;
    (function go() {
      var t = D.getElementById('ishТаб');
      if (t && !obs && W.MutationObserver) { obs = true; new MutationObserver(function () { правка(); }).observe(t, { childList: true }); }
      правка();
      if (++n < 40) setTimeout(go, obs ? 1500 : 500);
    })();
  }
  try { tabFix(); } catch (e) {}
  /* v6.8 (21.10): телефон, нижняя панель. Десктопная залитая кнопка «Запросить счёт | КП» в шапку телефона не влезает (одна залитая на экран) -
     добавляем четвёртую вкладку «Заявка» (->/podbor) между «Каталог» и «Корзина». Оболочка перерисовывает #ishТаб целиком - вкладку возвращает MutationObserver.
     На /podbor подсветка переходит с «Главная» на «Заявка». Выключатель: window.ISH_P4_NO_TABREQ. */
  function tabReq() {
    if (W.ISH_P4_NO_TABREQ) return;
    if (!D.getElementById('ishp-tabreq-css')) {
      var st = D.createElement('style'); st.id = 'ishp-tabreq-css';
      st.textContent = 'html body #ishТаб:has(button[data-ishp-req]){grid-template-columns:repeat(4,minmax(0,1fr))!important}html body #ishТаб button[data-ishp-req]{flex:1 1 0;min-width:0}html body #ishТаб button[data-ishp-req] svg{width:22px;height:22px;display:block}';
      D.head.appendChild(st);
    }
    var ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>';
    function правка() {
      var t = D.getElementById('ishТаб');
      if (!t) return;
      var on = String(location.pathname).replace(/\/+$/, '') === '/podbor';
      var b = t.querySelector('[data-ishp-req]');
      if (!b) {
        var cart = t.querySelector('[data-таб="cart"]');
        if (!cart) return;
        b = D.createElement('button'); b.type = 'button'; b.setAttribute('data-ishp-req', '1');
        b.innerHTML = '<span class="обёртка">' + ICO + '</span><span>Заявка</span>';
        t.insertBefore(b, cart);
      }
      if (on) {
        var act = t.querySelectorAll('button.вкл');
        for (var i = 0; i < act.length; i++) if (act[i] !== b) { act[i].classList.remove('вкл'); act[i].removeAttribute('aria-current'); }
        b.classList.add('вкл'); b.setAttribute('aria-current', 'page');
      } else if (b.classList.contains('вкл')) { b.classList.remove('вкл'); b.removeAttribute('aria-current'); }
    }
    D.addEventListener('click', function (e) {
      var x = e.target && e.target.closest && e.target.closest('#ishТаб [data-ishp-req]');
      if (!x) return;
      e.preventDefault(); e.stopPropagation();
      if (String(location.pathname).replace(/\/+$/, '') !== '/podbor') location.assign(REQ);
    }, true);
    var n = 0, obs = false;
    (function go() {
      var t = D.getElementById('ishТаб');
      if (t && !obs && W.MutationObserver) { obs = true; new MutationObserver(function () { правка(); }).observe(t, { childList: true }); }
      правка();
      if (++n < 40) setTimeout(go, obs ? 1500 : 500);
    })();
  }
  try { tabReq(); } catch (e) {}
  try { p10(); } catch (e) {}
})();
