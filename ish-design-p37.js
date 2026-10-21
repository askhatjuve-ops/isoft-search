/* ish-design-p37.js  v1.3 (19.10: ISH_ФОТО меню на всех страницах)  v1.2 (19.10: один блок «связь» - телефон, режим, «Не нашли нужное? Отправьте список →»; значки WhatsApp/Telegram убраны, строка оболочки скрыта)  v1.1 (19.10: быстрый доступ - 2 тонкие строки)  v1.0  (кандидат 17.10.2026, волна 3 «хвосты» C2; НЕ выложено)  П37 «хвосты в стиле главной»
   Внешний слой. Блоки Tilda НЕ пишет. Подгружает ish-design-p37.css с того же адреса. Выключатель до загрузки: window.ISH_P37_OFF = 1.
   Что делает (вид - в css, здесь только то, чего css не умеет):
     1. Мобильное меню (оболочка, экран «Каталог товаров», #ishЭкран): над списком разделов - 4 быстрых пункта со значками в кобальтовых квадратах,
        под списком - один блок «связь»: телефон (tel:), режим работы и внутренняя строка «Не нашли нужное? Отправьте список →» (нативная строка оболочки .действие[data-список] прячется css, её текст берём оттуда; клик идёт тем же data-список). Узлы с классами .ishp37-*; чужую разметку не трогает; оболочка перерисует экран - дорисуем заново.
     2. Шторка фильтров на телефоне: на кнопку «Показать товары» (.вн-моб-пок) пишет «Показать N», если число известно надёжно (иначе текст не меняется).
     3. Мега-меню: поверх разметки p24 строит «слева группы, справа разделы мини-плитками с фото» (разметка p24 остаётся, прячется только сетка колонок).
     4. /assortiment: в iframe#isoft-catalog-frame (тот же origin) подключает ish-design-p37a.css - оформление приложения в стиле главной. Приложение и ish-assort.js не меняются.
   Мега-меню и кнопки WhatsApp/Telegram - только css (разметка p24/p22 как есть). */
(function () {
  'use strict';
  var W = window, D = document;
  /* 19.10.2026: фото разделов/обложек мобильного меню. Таблица window.ISH_ФОТО задаётся только блоком главной
     (3204331703, упёрся в потолок размера) - на прочих страницах меню было без фото. Дополняем недостающие ключи
     (живые значения главнее). Источник: ISH_ФОТО главной + 11 ключей из IMG p37/GRP p35. */
  (function () { var Ф = W.ISH_ФОТО = W.ISH_ФОТО || {}, В = {"noutbuki":"https://static.tildacdn.com/tild6138-3762-4366-a538-643939316164/noutbuki.jpg","pk-i-monobloki":"https://static.tildacdn.com/tild6461-3666-4636-b732-346137636436/pk-i-monobloki.jpg","processory":"https://static.tildacdn.com/tild3961-3333-4562-b464-393634356633/processory.jpg","materinskie-platy":"https://static.tildacdn.com/tild6562-3232-4238-b335-623037363664/materinskie-platy.jpg","operativnaya-pamyat":"https://static.tildacdn.com/tild3237-3432-4139-a637-623431396463/operativnaya-pamyat.jpg","videokarty":"https://static.tildacdn.com/tild3830-3131-4733-b835-323037646133/videokarty.jpg","ssd-nakopiteli":"https://static.tildacdn.com/tild3430-3930-4164-b765-333364646334/ssd-nakopiteli.jpg","zhestkie-diski":"https://static.tildacdn.com/tild3064-6132-4263-a461-353135643665/zhestkie-diski.jpg","inye-komplektuyushchie":"https://static.tildacdn.com/tild3530-3562-4361-a635-323764396165/inye-komplektuyushch.jpg","monitory":"https://static.tildacdn.com/tild6664-6537-4630-a431-376435653739/monitory.jpg","periferiya":"https://static.tildacdn.com/tild3363-3161-4664-a466-336238666261/periferiya.jpg","aksessuary":"https://static.tildacdn.com/tild3233-6261-4162-a530-356664373364/aksessuary.jpg","ofisnaya-i-pechatayushchaya-tehnika":"https://static.tildacdn.com/tild3936-6137-4738-a261-333930343266/ofisnaya-i-pechatayu.jpg","krepleniya-monitorov-i-tv":"https://static.tildacdn.com/tild6238-6231-4535-a533-356264356664/krepleniya-monitorov.jpg","setevoe-oborudovanie":"https://static.tildacdn.com/tild3761-3036-4137-b864-356235666163/setevoe-oborudovanie.jpg","korporativnaya-set":"https://static.tildacdn.com/tild3761-3036-4533-b930-346466643563/korporativnaya-set.jpg","svyaz-i-peregovornye":"https://static.tildacdn.com/tild3061-3661-4464-a335-373863386138/svyaz-i-peregovornye.jpg","servery-i-hranenie":"https://static.tildacdn.com/tild3831-3131-4430-a334-636338636331/servery-i-hranenie.jpg","ibp-i-pitanie":"https://static.tildacdn.com/tild6632-3165-4063-b733-653931346462/ibp-i-pitanie.jpg","shkafy-i-stoyki":"https://static.tildacdn.com/tild3932-3561-4039-b165-656166663638/shkafy-i-stoyki.jpg","videonablyudenie":"https://static.tildacdn.com/tild6436-6363-4066-b534-363139326663/videonablyudenie.jpg","paneli-i-proektory":"https://static.tildacdn.com/tild6431-3534-4131-a661-366635316437/paneli-i-proektory.jpg","licenzii-i-po":"https://static.tildacdn.com/tild3530-3030-4134-b464-663561323231/licenzii-i-po.jpg","sistemnye-bloki":"https://static.tildacdn.com/tild6461-3666-4636-b732-346137636436/pk-i-monobloki.jpg","monobloki":"https://static.tildacdn.com/tild6461-3666-4636-b732-346137636436/pk-i-monobloki.jpg","mini-pk-i-rabochie-stancii":"https://static.tildacdn.com/stor6337-3938-4930-b934-366531643932/9393ecb615c1bd97addd656f14a7f5a7.png","televizory":"https://static.tildacdn.com/stor3765-6537-4762-a165-646537633531/ee08c00b4809b28564beed8705c8c410.jpg","korpusa-i-bloki-pitaniya":"https://static.tildacdn.com/stor6161-3230-4537-b337-646531633133/71f9cdcbcec53eb3dd5f6f972a9bca3f.jpg","fleshki-i-karty-pamyati":"https://static.tildacdn.com/stor6564-3835-4162-b065-343132333939/a03a426e29802465ddf8c5f30c73c306.jpg","optika-i-sks":"https://static.tildacdn.com/stor6436-6237-4132-b431-626431613332/70d3a9a23c4f9534c418c011aaa2182f.jpg","karty-pamyati":"https://static.tildacdn.com/stor3339-6432-4462-a135-346265623932/9530b6b2b5fc97e0ceb3a4c857cfaf99.jpg","klaviatury":"https://static.tildacdn.com/stor3430-6632-4038-b763-373837393564/3fb1c91ef4ba734ec50e292266a092e0.jpg","marshrutizatory":"https://static.tildacdn.com/stor3634-6338-4436-a634-613563353861/a3a32244e1cc328c66e34b055d72106e.jpg","mfu":"https://static.tildacdn.com/stor3736-3266-4961-b863-333737633966/7534f1e1df659e4ce5349a6a1396b6a2.jpg","plottery":"https://static.tildacdn.com/stor3161-3235-4561-a631-666363326238/4ca326b3251b35516c511dc3f49811b7.jpg","printery":"https://static.tildacdn.com/stor3632-3865-4830-b836-303234306336/2c71a0268bbb19f3fe4c7d2150e3d639.jpg","setevye-karty":"https://static.tildacdn.com/stor6133-3964-4462-a436-613863646639/f8ae0b7ff5fa58e69b86a786c21822cc.jpg","skanery-dokumentov":"https://static.tildacdn.com/stor6534-6230-4766-a639-643862396161/5384e679f8e8d6b49523ca1a82c8dd3b.jpg","tochki-dostupa":"https://static.tildacdn.com/stor6331-3932-4230-b061-396436396534/64eaee526cd2483e9293ad7235fc926f.jpg","bloki-pitaniya":"https://static.tildacdn.com/stor3039-3738-4230-b262-373031663161/5c9907970882f1243e21afeb9a0ab85a.jpg","servery":"https://static.tildacdn.com/tild6234-6134-4463-b639-313434323965/397607473664.jpg","mezhsetevye-ekrany":"https://static.tildacdn.com/tild6361-3433-4364-b866-346630373330/395779320864.jpg","naushniki-i-garnitury":"https://static.tildacdn.com/stor3733-6434-4134-b430-663136363665/5dc80c65956c85126d83f3344ea049f9.jpg","videoregistratory":"https://static.tildacdn.com/stor3939-3036-4562-a337-613961613830/287a3be6b9ea388f9865890d80be9d9a.jpg","skud-i-turnikety":"https://static.tildacdn.com/stor3464-3536-4634-a134-656536336334/321c4989f5ccf2e88a4c418bdd976136.jpg","domofony":"https://static.tildacdn.com/stor6231-6239-4162-b430-626462326363/c0f5d1c223881e18346fe8a060008031.jpg","torgovoe-oborudovanie":"https://static.tildacdn.com/stor3938-6362-4135-b834-306437306430/e6cd0535605dadd5f08486385fa38ba7.jpg","skanery-shtrihkoda":"https://static.tildacdn.com/stor3430-3466-4031-b237-393038643432/a9fa4d3e853bbc28af599d2aabf34a43.jpg","terminaly-sbora-dannyh":"https://static.tildacdn.com/stor3232-6664-4339-b466-306639333663/ed9976d2d5a862ddbfcd211bc5ed6578.jpg","printery-etiketok":"https://static.tildacdn.com/tild3265-6239-4735-a661-313332653034/ISDA26B90847.jpg"};
    for (var к in В) if (!Ф[к]) Ф[к] = В[к]; })();
  (function () { var Ф = W.ISH_ФОТО = W.ISH_ФОТО || {}, Т = 'https://static.tildacdn.com/', С = {"kabel-vitaya-para": "stor3934-3866-4966-a366-303136646239/3e703982cacc571b9df8b0286281e112.jpg", "rozetki-i-moduli": "stor3231-3862-4164-a433-656331663063/cc37ccb4d0754eda438ae913e00deee2.jpg", "patch-paneli": "stor3234-3537-4237-b634-363534353461/db52d91a50da0b8f1e15849602474a05.jpg", "patch-kordy": "stor3030-3537-4737-b031-663962383139/f0db7d0a770a2215e87824eb564ba98b.jpg", "kabel-kanaly-i-koroba": "stor6232-6666-4732-a430-396332316234/a5f66aa37991813b72c93c2132ac1aa3.jpg", "konnektory-i-instrument": "stor3966-3232-4235-a664-656363663835/993817d497eb79ff4dc9ac9c2f0157a3.jpg"}; for (var к in С) if (!Ф[к]) Ф[к] = Т + С[к]; })();   /* 20.10: фото 6 разделов СКС (мобильное меню) */
  /* 20.10.2026 (СКС): мобильное меню берёт группы из window.ISH_КАРТА (блок главной 3204331703, упёрся в потолок размера - дописать туда нельзя).
     Дополняем на клиенте шестью разделами СКС в группу «set-i-servery» - только за выключателем ISH_SKS_ON (p4: СКС_ВКЛ), по имени, без дублей.
     Карта ещё может не существовать (на прочих страницах её нет) - тогда ничего. Повтор безопасен. */
  (function () {
    if (!W.ISH_SKS_ON) return;
    var N = [['Кабель витая пара', '154472711814', 'kabel-vitaya-para'], ['Розетки и модули', '323347597754', 'rozetki-i-moduli'],
             ['Патч-панели', '830436853714', 'patch-paneli'], ['Патч-корды', '177508312494', 'patch-kordy'],
             ['Кабель-каналы и короба', '362160635844', 'kabel-kanaly-i-koroba'], ['Коннекторы и инструмент', '413683996174', 'konnektory-i-instrument']];
    function доп() {
      var К = W.ISH_КАРТА;
      if (!К || !К.группы) return false;
      for (var i = 0; i < К.группы.length; i++) {
        var г = К.группы[i];
        if (г.ид !== 'set-i-servery' || !г.кат) continue;
        for (var j = 0; j < N.length; j++) {
          var есть = false;
          for (var k = 0; k < г.кат.length; k++) if (г.кат[k].имя === N[j][0]) { есть = true; break; }
          if (!есть) г.кат.push({ 'имя': N[j][0], 'uid': N[j][1], 'клк': N[j][2], 'есть': true, 'адрес': N[j][2] });
        }
      }
      return true;
    }
    /* 20.10: выезжающая панель левой колонки главной читает глобальный ДЕРЕВО (группа: [имя, число, адрес, [[раздел, число, адрес], ...]]) при наведении - дописываем туда те же 6 разделов (число - видимых карточек на 20.10). */
    var Ч = { 'kabel-vitaya-para': 24, 'rozetki-i-moduli': 88, 'patch-paneli': 12, 'patch-kordy': 103, 'kabel-kanaly-i-koroba': 40, 'konnektory-i-instrument': 11 };
    function дерево() {
      var Д = W['ДЕРЕВО'];
      if (!Д || !Д.length) return false;
      for (var i = 0; i < Д.length; i++) {
        var г = Д[i];
        if (!г || г[2] !== '/set-i-servery' || !г[3]) continue;
        for (var j = 0; j < N.length; j++) {
          var а = '/' + N[j][2], есть = false;
          for (var k = 0; k < г[3].length; k++) if (г[3][k][2] === а) { есть = true; break; }
          if (!есть) г[3].push([N[j][0], Ч[N[j][2]], а]);
        }
      }
      return true;
    }
    var д1 = доп(), д2 = дерево();
    if (д1 && д2) return;
    var n = 0, t = setInterval(function () { var a = д1 || доп(), b = д2 || дерево(); д1 = a; д2 = b; if ((a && b) || ++n > 40) clearInterval(t); }, 250);
  })();
  if (W.ISH_P37_OFF || W.__ishP37) return;
  W.__ishP37 = 'v1';
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p37.js"]');
  var BASE = (tag && tag.src) ? tag.src.replace(/ish-design-p37\.js.*$/, '') : 'https://askhatjuve-ops.github.io/isoft-search/';
  var VQ = (tag && tag.src && (tag.src.match(/\?.*$/) || [''])[0]) || '';
  var PHONE = '+7 775 881 85 31', TEL = '+77758818531';

  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function link(id, href) {
    if (D.getElementById(id)) return;
    var l = D.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = href; D.head.appendChild(l);
  }
  link('ishp37-css', BASE + 'ish-design-p37.css' + VQ);

  /* ───────── 1. мобильное меню ───────── */
  var IC = {
    kp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    as: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.9-3.9M11 8.5v5M8.5 11h5"/></svg>',
    org: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 9h4l4 3v4h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    ch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
    ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  };
  /* 19.10.2026 (Асхат): из 4 быстрых пунктов оставлены 2 тонкие строки - КП/счёт и расширенный ассортимент;
     «Для организаций» и «Доставка и оплата» повторяют меню и главную - убраны. */
  var БЫСТРО = [
    /* 19.10 (Асхат): «Нужен счёт или КП?» убрана */
    ['Расширенный ассортимент 14000+', 'под заказ', '/assortiment']
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function quickHtml() {
    var h = '<div class="ishp37-q ishp37-q--thin">';
    БЫСТРО.forEach(function (r) {
      h += '<a href="' + esc(r[2]) + '"><span><b>' + esc(r[0]) + '</b> ' + esc(r[1]) + '</span><span class="ishp37-qs">' + IC.ch + '</span></a>';
    });
    return h + '</div><div class="ishp37-sub"><b>01</b> / Разделы каталога</div>';
  }
  /* вариант компоновки блока «связь»: 1 (по умолчанию) - телефон сверху, строка-ссылка под линией; 2 - телефон + кобальтовая кнопка-трубка, строка плиткой; 3 - компактно, «СВЯЗЬ», стрелка в тексте */
  var CT_VAR = parseInt(W.ISH_P37_CT_VAR, 10) || 1;
  function origText(ek) {
    /* текст и цель берём у строки оболочки .действие[data-список]; её саму не удаляем (скрыта css) */
    var o = q('.действие[data-список]', ek), t = o && q('.т', o), b = t && q('b', t), l1 = '', l2 = '';
    if (t) { l1 = (t.firstChild && t.firstChild.nodeType === 3 ? t.firstChild.nodeValue : '').replace(/\s+/g, ' ').trim(); l2 = b ? b.textContent.trim() : ''; }
    return [l1 || 'Не нашли нужное?', l2 || 'Отправьте список'];
  }
  function contactHtml(ek) {
    var o = origText(ek), v = CT_VAR;
    var tel = '<a class="ishp37-tel" href="tel:' + TEL + '"><b>' + PHONE + '</b><span>Пн–Вс 9:00–18:00 · звонок и счёт в день обращения</span></a>';
    var ls = '<button type="button" class="ishp37-ls" data-список="1"><span class="ishp37-lt">' + esc(o[0]) + ' <b>' + esc(o[1]) + (v === 3 ? ' →' : '') + '</b></span>' +
      (v === 3 ? '' : '<span class="ishp37-qs">' + IC.ch + '</span>') + '</button>';
    if (v === 2) return '<div class="ishp37-hd">' + tel + '<a class="ishp37-call" href="tel:' + TEL + '" aria-label="Позвонить">' + IC.ph + '</a></div>' + ls;
    if (v === 3) return '<div class="ishp37-kick">Связь</div>' + tel + ls;
    return tel + ls;
  }
  var busy = false;
  function menu() {
    var ek = D.getElementById('ishЭкран');
    if (!ek || busy) return;
    var list = q('.список', ek);
    if (!list || !q('.строка[data-группа]', list)) return;          /* только экран со списком групп каталога */
    busy = true;
    try {
      if (!q('.ishp37-q', ek)) {
        var w = D.createElement('div'); w.className = 'ishp37-top'; w.innerHTML = quickHtml();
        list.parentNode.insertBefore(w, list);
      }
      if (!q('.ishp37-ct', ek)) {
        var c = D.createElement('div'); c.className = 'ishp37-ct ishp37-ct--v' + CT_VAR; c.innerHTML = contactHtml(ek);
        list.parentNode.insertBefore(c, list.nextSibling);
      }
    } catch (e) {}
    busy = false;
  }

  /* ───────── 2. «Показать N» в шторке фильтров ───────── */
  function numFromVar() {
    try {
      var v = W.getComputedStyle(D.documentElement).getPropertyValue('--p35-n') || '';
      var m = /(\d[\d\s ]*)/.exec(v);
      return m ? parseInt(m[1].replace(/\D/g, ''), 10) : 0;
    } catch (e) { return 0; }
  }
  function sheet() {
    var b = q('.вн-моб-пок');
    if (!b || !D.body.classList.contains('вн-моб-ф')) return;
    var chosen = qa('.вн-моб-откр .t-store__filter__checkbox input:checked').length;
    var n = 0;
    if (!chosen) n = numFromVar();                                            /* фильтров нет - число моделей раздела */
    else if (!q('.t-store__load-more-btn') ) n = qa('.t-store__card').filter(function (c) { return c.offsetParent !== null; }).length;   /* всё загружено - считаем видимые */
    var t = n > 0 ? 'Показать ' + String(n).replace(/\B(?=(\d{3})+$)/g, ' ') : 'Показать товары';
    if (b.textContent !== t) b.textContent = t;
  }

  /* ───────── 3. /assortiment: оформление приложения внутри iframe ───────── */
  function assort() {
    var f = D.getElementById('isoft-catalog-frame');
    if (!f) return false;
    var d; try { d = f.contentDocument; } catch (e) { return true; }
    if (!d || !d.head || !d.body || !d.querySelector('.catalog-layout')) return false;
    if (!d.getElementById('ishp37a-css')) {
      var l = d.createElement('link'); l.id = 'ishp37a-css'; l.rel = 'stylesheet'; l.href = BASE + 'ish-design-p37a.css' + VQ; d.head.appendChild(l);
    }
    return true;
  }

  /* ───────── 4. мега-меню каталога: слева группы (как левое меню главной), справа разделы мини-плитками с фото (как «Разделы группы» П35) ─────────
     Разметку p24 не удаляем: прячем только сетку колонок, ссылки и клавиатурная логика p24 остаются. Фото разделов - те же, что в словаре p35. */
  var IMG = {"/noutbuki":"tild3833-6239-4834-b965-343537663563/368960946504.jpg","/sistemnye-bloki":"stor3037-3138-4535-b938-613165663336/1a64377ab24797c5f9ed3732f51339f7.png","/monobloki":"tild6365-6535-4038-b734-616537613362/350866631334.jpg","/mini-pk-i-rabochie-stancii":"tild6539-6333-4731-a535-626439313133/117009453914.jpg","/monitory":"tild3465-3636-4232-a463-663262626462/IS0C1A4341CC.jpg","/televizory":"stor3766-3566-4938-b539-626438313732/175d50cacf9712418ee197d6bfa8e409.jpg","/proektory-i-paneli":"stor3335-3861-4439-b966-373538336663/d834be5eff5f7a3d54b9d62ff97668ac.jpg","/kronshteyny-i-krepleniya":"stor3535-3031-4634-b836-323261356663/87b1e65cb88081a7e8e36bed25ec8888.jpg","/processory":"stor6566-6366-4433-a536-343433346538/1d257a1dbb75e98b3d0a090a77712134.jpg","/materinskie-platy":"stor3338-6161-4863-a264-373830336566/41fc8bf32e59378fbc6939e64f770441.png","/operativnaya-pamyat":"stor6665-3162-4263-a163-303834666639/6b5f2cd5cdca2fdbdf5c40b3ec668e8b.jpg","/videokarty":"stor6636-3034-4664-b036-346638613339/be2f8b1cd68a69600b0d4aa024fa071f.jpg","/ohlazhdenie":"stor3439-6130-4133-a266-386364393137/fc751b368f07ee4ed4f036ebe5cc41f4.jpg","/korpusa-i-bloki-pitaniya":"stor3432-3463-4566-b764-326233316635/b93702f148ec483363b4a0baa2db5939.jpg","/bloki-pitaniya":"stor3039-3738-4230-b262-373031663161/5c9907970882f1243e21afeb9a0ab85a.jpg","/ssd-nakopiteli":"tild3539-6532-4665-b732-313339306166/826568586694.jpg","/zhestkie-diski":"tild3438-3333-4162-b038-646564333135/314133187724.jpg","/fleshki-i-karty-pamyati":"tild6231-3438-4932-a435-376335353164/191064673814.jpg","/karty-pamyati":"stor6661-6231-4135-a436-393532386134/c7e362f1a9b30afa98d2672bd308ab84.jpg","/ibp-i-zashchita-pitaniya":"stor6465-3265-4065-b062-356134376137/3e7dc4af46341fe351d0cd2521fd11d4.jpg","/servery-i-shd":"stor6365-6164-4261-b265-643462393630/214a3c0f954c500d3e4bb28dfa364962.jpg","/setevoe-oborudovanie":"stor6137-6334-4031-b637-653536336563/8fa61c0c0c3f52028e329caf0d38d383.jpg","/marshrutizatory":"stor3535-3335-4364-a635-353532346536/bb620a7f61abdb9f40b0afe8b401d659.jpg","/tochki-dostupa":"stor3839-3032-4330-a339-306563643365/3bc212fc8c480aa1bb070fb2104580a2.jpg","/setevye-karty":"stor3362-3063-4632-b662-383762333963/797ec653583696c8d04285746c599de5.jpg","/printery":"stor6362-6466-4634-b636-643362323832/a254d88583b0b21bb0a88014f64f2c72.jpg","/mfu":"stor3764-3531-4538-b335-643634613939/29593373b28e24b177165f3be571c3b1.jpg","/plottery":"stor6462-6433-4837-a564-393239353365/efff2b2a8adb42ed9207704f347218de.jpg","/skanery-dokumentov":"stor6133-3366-4564-b032-373964326131/23179543146d6660da881db3d6a9a068.png","/klaviatury":"tild6239-3037-4231-a661-383533356636/502231423034.jpg","/klaviatury-i-myshi":"tild3537-3438-4361-b739-376638643730/IS8DB0A2A8DA.jpg","/videonablyudenie":"stor6333-3133-4939-a565-643734343036/a210f190f9f598923494f6fca5d2d2da.jpg","/skanery-shtrihkoda":"stor3430-3466-4031-b237-393038643432/a9fa4d3e853bbc28af599d2aabf34a43.jpg","/terminaly-sbora-dannyh":"stor3232-6664-4339-b466-306639333663/ed9976d2d5a862ddbfcd211bc5ed6578.jpg","/printery-etiketok":"tild3265-6239-4735-a661-313332653034/ISDA26B90847.jpg","/servery":"tild6234-6134-4463-b639-313434323965/397607473664.jpg","/shkafy-i-stoyki":"tild3062-6262-4239-a135-316532323033/139147686754.jpg","/mezhsetevye-ekrany":"tild6361-3433-4364-b866-346630373330/395779320864.jpg","/konferenc-svyaz":"stor6262-3166-4264-b734-366461326161/e9912a11601c29336ffbb6d63bef21d2.jpg","/naushniki-i-garnitury":"stor3733-6434-4134-b430-663136363665/5dc80c65956c85126d83f3344ea049f9.jpg","/videoregistratory":"stor3939-3036-4562-a337-613961613830/287a3be6b9ea388f9865890d80be9d9a.jpg","/skud-i-turnikety":"stor3464-3536-4634-a134-656536336334/321c4989f5ccf2e88a4c418bdd976136.jpg","/domofony":"stor6231-6239-4162-b430-626462326363/c0f5d1c223881e18346fe8a060008031.jpg"};
  var TILDA = 'https://static.tildacdn.com/';
  (function () { var С = {"kabel-vitaya-para": "stor3934-3866-4966-a366-303136646239/3e703982cacc571b9df8b0286281e112.jpg", "rozetki-i-moduli": "stor3231-3862-4164-a433-656331663063/cc37ccb4d0754eda438ae913e00deee2.jpg", "patch-paneli": "stor3234-3537-4237-b634-363534353461/db52d91a50da0b8f1e15849602474a05.jpg", "patch-kordy": "stor3030-3537-4737-b031-663962383139/f0db7d0a770a2215e87824eb564ba98b.jpg", "kabel-kanaly-i-koroba": "stor6232-6666-4732-a430-396332316234/a5f66aa37991813b72c93c2132ac1aa3.jpg", "konnektory-i-instrument": "stor3966-3232-4235-a664-656363663835/993817d497eb79ff4dc9ac9c2f0157a3.jpg"}; for (var к in С) if (!IMG['/' + к]) IMG['/' + к] = С[к]; })();   /* 20.10: фото 6 разделов СКС (мега-меню) */
  function megaBuild(inn) {
    var groups = qa('.ishp24-g', inn);
    if (!groups.length || q('.ishp37-mm', inn)) return;
    var L = '', R = '';
    groups.forEach(function (g, gi) {
      var h = q('.ishp24-gh', g); if (!h) return;
      var gh = h.getAttribute('href'), nm = (q('.ishp24-gn', h) || h).textContent, ic = q('.ishp24-ic', h);
      L += '<a class="ishp37-r' + (gi === 0 ? ' ishp37-on' : '') + '" href="' + esc(gh) + '" data-i="' + gi + '"><span class="ishp37-ri">' + (ic ? ic.outerHTML : '') + '</span><span class="ishp37-rn">' + esc(nm) + '</span><span class="ishp37-rc">' + IC.ch + '</span></a>';
      var T = '';
      qa('a.ishp24-l', g).forEach(function (a) {
        var href = a.getAttribute('href'), ph = IMG[href] || '';
        T += '<a class="ishp37-t" href="' + esc(href) + '"><span class="ishp37-ts' + (ph ? '' : ' ishp37-noimg') + '">' + (ph ? '<img src="' + TILDA + esc(ph) + '" alt="" loading="lazy" decoding="async">' : '') + '</span><b>' + esc(a.textContent) + '</b></a>';
      });
      R += '<div class="ishp37-p' + (gi === 0 ? ' ishp37-on' : '') + '" data-i="' + gi + '"><div class="ishp37-ph"><h3>' + esc(nm) + '</h3><a href="' + esc(gh) + '">Все разделы группы</a></div><div class="ishp37-tg">' + T + '</div></div>';
    });
    var w = D.createElement('div'); w.className = 'ishp37-mm';
    w.innerHTML = '<div class="ishp37-l">' + L + '</div><div class="ishp37-rt">' + R + '</div>';
    inn.insertBefore(w, inn.firstChild);
    inn.classList.add('ishp37-on');
    function act(i) {
      qa('.ishp37-r,.ishp37-p', w).forEach(function (e) { e.classList.toggle('ishp37-on', e.getAttribute('data-i') === String(i)); });
    }
    qa('.ishp37-r', w).forEach(function (r) {
      var i = r.getAttribute('data-i');
      r.addEventListener('mouseenter', function () { act(i); });
      r.addEventListener('focus', function () { act(i); });
    });
  }
  function mega() {
    var inn = q('#ishp24-panel .ishp24-in');
    if (inn && q('.ishp24-grid', inn)) megaBuild(inn);
  }

  function tick() { try { menu(); } catch (e) {} try { sheet(); } catch (e) {} try { mega(); } catch (e) {} }
  var mo = null;
  function watch() {
    if (!W.MutationObserver) { setInterval(tick, 700); return; }
    var t = null;
    mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(tick, 60); });
    mo.observe(D.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    tick();
  }
  function init() {
    watch();
    if (/\/assortiment\/?$/.test(location.pathname)) {
      var n = 0, iv = setInterval(function () { var ok = false; try { ok = assort(); } catch (e) {} if (ok || ++n > 80) clearInterval(iv); }, 250);
    }
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
