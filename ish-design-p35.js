/* ish-design-p35.js  v2.0  (кандидат 17.10.2026; НЕ выложено)  П35 «раздел каталога: компоненты главной»
   Только страница раздела (есть .t-store__card-list и верх .вн-а). Ставит html.ishp35-on, подгружает рядом ish-design-p35.css и ish-design-p8.css
   (готовые компоненты главной: полоса фактов, плитки разделов, кобальтовые бренды, индиго-плашка «Подбор техники»), добавляет свои узлы:
   тёмная шапка раздела, единая строка-панель над списком, индиго-плита после 12-й строки, экран «ничего не найдено», низ страницы
   (смежные разделы, «Подбор техники», бренды раздела, «Не нашли нужное?»). Родные узлы Tilda не заменяет (h1, сортировку, «Вид» переносит).
   Выключатель: window.ISH_P35_OFF = 1 или window.ISH_P4_NO_P35 = 1 (до загрузки p4). Откат: пустой css/js на Pages. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P35_OFF || W.ISH_P4_NO_P35 || W.ISH_P35) return;
  W.ISH_P35 = {};
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p35"]');
  function css(id, name) {
    if (D.getElementById(id)) return;
    var src = tag && tag.src;
    if (!src) return;
    var l = D.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    var v = /[?&]v=(\w+)/.exec(src);
    l.href = src.replace(/ish-design-p35\.js.*$/, name + (v ? '?v=' + v[1] : ''));
    D.head.appendChild(l);
  }
  css('ishp8-css-from35', 'ish-design-p8.css');   /* компоненты главной: .ishp8-strip / .ishp8-tile / .ishp8-bk / .ishp23-cta */
  css('ishp35-css', 'ish-design-p35.css');
  var REQ = '/podbor', T = 'https://static.tildacdn.com/';
  var H = D.documentElement;
  var SI = {"lenovo": "M21.044 12.288c0 .5-.343.867-.815.867-.464 0-.827-.38-.827-.867 0-.51.343-.868.815-.868.464 0 .827.381.827.868zm-14.305-.92a.787.787 0 0 0-.651.307.991.991 0 0 0-.172.738l1.479-.614a.708.708 0 0 0-.656-.43zm6.963.052c-.472 0-.816.358-.816.868 0 .486.364.867.828.867.472 0 .815-.368.815-.867 0-.487-.363-.868-.827-.868zM24 7.997v8.006H0V7.997h24zM5.01 13.05H3.088V9.825H2.23v4.003h2.78v-.777zm1.137-.094l2.163-.897a1.667 1.667 0 0 0-.37-.86c-.284-.33-.704-.505-1.216-.505-.931 0-1.633.686-1.633 1.593 0 .93.704 1.593 1.726 1.593.572 0 1.158-.272 1.432-.589l-.535-.411c-.357.264-.56.326-.885.326-.292 0-.52-.09-.682-.25zm5.57-1.039c0-.709-.507-1.223-1.252-1.223a1.28 1.28 0 0 0-1.005.494v-.442h-.846v3.081h.846v-1.753c0-.316.245-.651.698-.651.35 0 .712.243.712.651v1.753h.847v-1.91zm3.647.37c0-.904-.725-1.593-1.65-1.593-.933 0-1.663.7-1.663 1.593 0 .903.726 1.592 1.651 1.592.932 0 1.662-.7 1.662-1.592zm2.066 1.54l1.268-3.081h-.967l-.765 2.099-.765-2.1h-.966l1.268 3.081h.927zm4.449-1.54c0-.904-.725-1.593-1.65-1.593-.932 0-1.662.7-1.662 1.593 0 .903.725 1.592 1.65 1.592.932 0 1.662-.7 1.662-1.592z", "hp": "M12.0069 24h-.3572l2.459-6.7453h3.3796c.5907 0 1.2364-.4533 1.4424-1.0166l2.6652-7.3085c.4396-1.1952-.2473-2.1706-1.525-2.1706h-4.6983l-3.929 10.798-2.2255 6.127C3.929 22.434 0 17.6806 0 12.007 0 6.498 3.7092 1.8546 8.7647.4396L6.4705 6.759 2.6514 17.2547h2.5415L8.4488 8.339h1.9095l-3.2558 8.9158H9.644l3.0223-8.3251c.4396-1.1952-.2473-2.1706-1.525-2.1706h-2.143l2.459-6.7453C11.636 0 11.8145 0 11.9931 0 18.6285 0 24 5.3715 24 12.007c.0137 6.6216-5.3578 11.993-11.9931 11.993zM19.2742 8.325h-1.9096l-2.6789 7.336h1.9096l2.6789-7.336z", "dell": "M17.963 14.6V9.324h1.222v4.204h2.14v1.07h-3.362zm-9.784-3.288l2.98-2.292c.281.228.56.458.841.687l-2.827 2.14.611.535 2.827-2.216c.281.228.56.458.841.688a295.83 295.83 0 0 1-2.827 2.216l.61.536 2.83-2.295-.001-1.986h1.223v4.204h2.216v1.07h-3.362v-1.987c-.995.763-1.987 1.529-2.981 2.292l-2.981-2.292c-.144.729-.653 1.36-1.312 1.694-.285.147-.597.24-.915.276-.183.022-.367.017-.551.017H3.516V9.325H5.69a2.544 2.544 0 0 1 1.563.557c.454.36.778.872.927 1.43m-3.516-.917v3.21l.953-.001a1.377 1.377 0 0 0 1.036-.523 1.74 1.74 0 0 0 .182-1.889 1.494 1.494 0 0 0-.976-.766c-.166-.04-.338-.03-.507-.032h-.688zM11.82 0h.337a11.94 11.94 0 0 1 5.405 1.373 12.101 12.101 0 0 1 4.126 3.557A11.93 11.93 0 0 1 24 11.82v.36a11.963 11.963 0 0 1-3.236 8.033A11.967 11.967 0 0 1 12.182 24h-.361a11.993 11.993 0 0 1-4.145-.806 12.04 12.04 0 0 1-4.274-2.836A12.057 12.057 0 0 1 .576 15.67 12.006 12.006 0 0 1 0 12.181v-.361a11.924 11.924 0 0 1 1.992-6.396 12.211 12.211 0 0 1 4.71-4.172A11.875 11.875 0 0 1 11.82 0m-.153 1.23a10.724 10.724 0 0 0-6.43 2.375 10.78 10.78 0 0 0-3.319 4.573 10.858 10.858 0 0 0 .193 8.12 10.788 10.788 0 0 0 3.546 4.421 10.698 10.698 0 0 0 4.786 1.946c1.456.209 2.955.124 4.376-.26a10.756 10.756 0 0 0 5.075-3.062 10.742 10.742 0 0 0 2.686-5.28 10.915 10.915 0 0 0-.122-4.682 10.77 10.77 0 0 0-7.098-7.626 10.78 10.78 0 0 0-3.693-.525z", "asus": "M23.904 10.788V9.522h-4.656c-.972 0-1.41.6-1.482 1.182v.018-1.2h-1.368v1.266h1.362zm-6.144.456l-1.368-.078v1.458c0 .456-.228.594-1.02.594H14.28c-.654 0-.93-.186-.93-.594v-1.596l-1.386-.102v1.812h-.03c-.078-.528-.276-1.14-1.596-1.23L6 11.22c0 .666.474 1.062 1.218 1.14l3.024.306c.24.018.414.09.414.288 0 .216-.18.24-.456.24H5.946V11.22l-1.386-.09v3.348h5.646c1.26 0 1.662-.654 1.722-1.2h.03c.156.864.912 1.2 2.19 1.2h1.41c1.494 0 2.202-.456 2.202-1.524zm4.398.258l-4.338-.258c0 .666.438 1.11 1.182 1.17l3.09.24c.24.018.384.078.384.276 0 .186-.168.258-.516.258h-4.212v1.29h4.302c1.356 0 1.95-.474 1.95-1.554 0-.972-.534-1.338-1.842-1.422zm-10.194-1.98h1.386v1.266h-1.386zM3.798 11.07l-1.506-.15L0 14.478h1.686zm7.914-1.548h-4.23c-.984 0-1.416.612-1.518 1.2v-1.2H3.618c-.33 0-.486.102-.642.33l-.648.936h9.384Z", "acer": "M23.943 9.364c-.085-.113-.17-.198-.595-.226-.113 0-.453-.029-1.048-.029-1.56 0-2.636.482-3.175 1.417.142-.935-.765-1.417-2.749-1.417-2.324 0-3.798.935-4.393 2.834-.226.709-.226 1.276-.056 1.73h-.567c-.425.027-.992.056-1.36.056-.85 0-1.39-.142-1.588-.425-.17-.255-.17-.737.057-1.446.368-1.162 1.247-1.672 2.664-1.672.737 0 1.445.085 1.445.085.085 0 .142-.113.142-.198l-.028-.085-.057-.397c-.028-.255-.227-.397-.567-.453-.311-.029-.567-.029-.907-.029h-.028c-1.842 0-3.146.624-3.854 1.814.255-1.219-.596-1.814-2.551-1.814-1.105 0-1.9.029-2.353.085-.368.057-.595.199-.68.454l-.17.51c-.028.085.029.142.142.142.085 0 .425-.057.992-.086a24.816 24.816 0 0 1 1.672-.085c1.077 0 1.559.284 1.389.822-.029.114-.114.199-.255.227-1.02.17-1.842.284-2.438.369-1.7.226-2.692.736-2.947 1.587-.369 1.162.538 1.728 2.72 1.728 1.078 0 2.013-.056 2.75-.198.425-.085.652-.17.737-.453l.396-1.304c-.028 1.304.85 1.955 2.721 1.955.794 0 1.559-.028 1.927-.085.369-.056.567-.141.652-.425l.085-.396c.397.623 1.276.935 2.608.935 1.417 0 2.239-.029 2.465-.114a.523.523 0 0 0 .369-.311l.028-.085.17-.539c.029-.085-.028-.142-.142-.142l-.906.057c-.596.029-1.077.057-1.418.057-.651 0-1.076-.057-1.332-.142-.368-.142-.538-.397-.51-.822l2.863-.368c1.275-.17 2.154-.567 2.579-1.19l-.992 3.315c-.028.057 0 .114.028.142.029.028.085.057.199.057h1.19c.198 0 .283-.114.312-.199l1.048-3.656c.142-.481.567-.708 1.36-.708.71 0 1.22 0 1.56.028h.028c.057 0 .17-.028.255-.17l.17-.51c0-.085 0-.17-.057-.227zM4.841 13.73c-.368.057-.907.085-1.587.085-1.219 0-1.729-.255-1.587-.737.113-.34.425-.567.935-.624l2.75-.368zm12.669-2.95c-.114.369-.652.624-1.616.766l-2.295.311.056-.198c.199-.624.454-1.02.794-1.247.34-.227.907-.34 1.7-.34 1.05.028 1.503.255 1.36.708Z"};
  var LOGO = "<g transform=\"translate(48 825) scale(1 -1)\"><path d=\"M151 0Q129 0 114.5 14.5Q100 29 100 51V496Q100 519 114.5 533.0Q129 547 151 547Q174 547 188.0 533.0Q202 519 202 496V51Q202 29 188.0 14.5Q174 0 151 0ZM151 636Q124 636 104.5 655.5Q85 675 85 702Q85 729 104.5 748.5Q124 768 151 768Q178 768 197.5 748.5Q217 729 217 702Q217 675 197.5 655.5Q178 636 151 636Z\"/></g> <g transform=\"translate(710 825) scale(1 -1)\"><path d=\"M289 -4Q219 -4 159.5 17.5Q100 39 67 72Q52 88 54.5 108.5Q57 129 74 142Q94 158 113.5 155.5Q133 153 147 138Q164 119 201.5 102.5Q239 86 285 86Q343 86 373.5 105.0Q404 124 405 154Q406 184 376.5 206.0Q347 228 269 242Q168 262 122.5 302.0Q77 342 77 400Q77 451 107.0 484.5Q137 518 184.0 534.5Q231 551 282 551Q348 551 399.0 530.0Q450 509 480 472Q494 456 493.0 438.5Q492 421 476 409Q460 398 438.0 402.0Q416 406 401 420Q376 444 347.0 453.0Q318 462 280 462Q236 462 205.5 447.0Q175 432 175 403Q175 385 184.5 370.5Q194 356 222.0 344.5Q250 333 304 322Q379 307 422.5 284.0Q466 261 485.0 230.5Q504 200 504 160Q504 114 479.5 77.0Q455 40 407.5 18.0Q360 -4 289 -4Z\"/></g> <g transform=\"translate(1313 825) scale(1 -1)\"><path d=\"M338 -4Q257 -4 194.95454545454544 31.636363636363633Q132.9090909090909 67.27272727272727 97.45454545454545 129.63636363636363Q62 192 62 272.99378881987576Q62 355 97.45454545454545 417.3636363636364Q132.9090909090909 479.72727272727275 194.95454545454544 515.3636363636364Q257 551 337.5 551Q418 551 479.8654822335025 515.3636363636364Q541.730964467005 479.72727272727275 577.3654822335025 417.3636363636364Q613 355 613 272.99378881987576Q613 192 578.0 129.5Q543 67 481.0 31.5Q419 -4 338 -4ZM338 86Q390 86 429.93055555555554 110.08108108108108Q469.8611111111111 134.16216216216216 492.43055555555554 176.0810810810811Q515 218 515 273Q515 328 492.43055555555554 370.3993288590604Q469.8611111111111 412.7986577181208 429.93055555555554 436.8993288590604Q390 461 338 461Q286 461 246.02758620689656 436.8993288590604Q206.05517241379312 412.7986577181208 183.02758620689656 370.3993288590604Q160 328 160 273Q160 218 183.02758620689656 176.0810810810811Q206.05517241379312 134.16216216216216 246.02758620689656 110.08108108108108Q286 86 338 86Z\"/></g> <g transform=\"translate(2048 825) scale(1 -1)\"><path d=\"M149 0Q130 0 115.0 14.0Q100 28 100 51V544Q100 616 128.5 669.0Q157 722 208.0 751.5Q259 781 326 781Q348 781 362.5 768.0Q377 755 377 735Q377 716 362.5 702.5Q348 689 326 689Q289 689 261.0 672.0Q233 655 217.5 625.0Q202 595 202 554V51Q202 28 188.0 14.0Q174 0 149 0ZM57 441Q36 441 23.0 453.0Q10 465 10 483Q10 503 23.0 515.0Q36 527 57 527H304Q325 527 338.0 515.0Q351 503 351 483Q351 465 338.0 453.0Q325 441 304 441Z\"/></g> <g transform=\"translate(2475 825) scale(1 -1)\"><path d=\"M289 0Q239 0 199.0 25.5Q159 51 136.0 95.0Q113 139 113 194V671Q113 693 127.0 707.0Q141 721 163 721Q185 721 199.0 707.0Q213 693 213 671V194Q213 154 235.0 127.0Q257 100 289 100H323Q341 100 353.5 86.0Q366 72 366 50Q366 28 349.5 14.0Q333 0 307 0ZM67 441Q46 441 33.0 453.0Q20 465 20 483Q20 503 33.0 515.0Q46 527 67 527H298Q319 527 332.0 515.0Q345 503 345 483Q345 465 332.0 453.0Q319 441 298 441Z\"/></g> <rect x=\"2351\" y=\"298\" width=\"192\" height=\"86\"/> <circle cx=\"514.57\" cy=\"538.48\" r=\"101.94\" fill=\"{{D}}\"/>";
  function el(t, c, h) { var e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function svg28(p) { return '<svg viewBox="0 0 28 28" aria-hidden="true">' + p + '</svg>'; }
  function logo(cls, fill, dot) {
    return '<svg class="' + cls + '" viewBox="0 0 2924 873" role="img" aria-label="iSoft" fill="' + fill + '">' + LOGO.replace('{{D}}', dot || fill) + '</svg>';
  }
  var IC = {
    org: '<rect x="5" y="3.5" width="18" height="21" rx="2"/><path d="M10 8.5h2.5M15.5 8.5H18M10 13h2.5M15.5 13H18M11.5 24.5v-5h5v5"/>',
    inv: '<path d="M6 3.5h12l4 4V24.5H6z"/><path d="M18 3.5v4h4M10 13h8M10 17h8M10 21h5"/>',
    truck: '<path d="M2.5 7h14v11h-14zM16.5 11h5l4 4v3h-9z"/><circle cx="7" cy="20" r="2"/><circle cx="21" cy="20" r="2"/>',
    shield: '<path d="M14 3 5 6.5v7c0 5.5 3.8 9.4 9 11.5 5.2-2.1 9-6 9-11.5v-7z"/><path d="m10 14 3 3 5-6"/>',
    search: '<circle cx="12.5" cy="12.5" r="7.5"/><path d="m24 24-5.8-5.8M9.5 12.5h6"/>'
  };
  var HERO_IMG = T + 'stor3761-6264-4162-b266-646337356566/f1e622a0312466f3ef1b71f3fde3f412.jpg';  /* фото плитки «Компьютеры» с главной */
  var NEAR = {   /* смежные разделы: фото ближайшего по цене товара раздела (из индекса поиска) */
    '/sistemnye-bloki': T + 'stor3630-6532-4037-a532-303830313063/194e00788fc1ad4c05ede028bd94a18f.jpg',
    '/monobloki': T + 'tild3434-6265-4138-a563-353364313333/337717353254.jpg',
    '/mini-pk-i-rabochie-stancii': T + 'tild3935-3933-4632-b431-663636626663/IS2A37538357.png'
  };
  var BRAND_KEY = { lenovo: 'lenovo', hp: 'hp', dell: 'dell', 'dell technologies': 'dell', asus: 'asus', acer: 'acer' };
  var BRAND_NAME = { lenovo: 'Lenovo', hp: 'HP', dell: 'Dell', asus: 'ASUS', acer: 'Acer' };

  function total() {
    var m = /Все товары раздела\s*\((\d+)\)/.exec(D.body ? D.body.textContent : '');
    return m ? +m[1] : 0;
  }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ' '); }
  function tail(n, a, b, c) { var m = n % 100, d = n % 10; return (m > 10 && m < 20) ? c : d === 1 ? a : (d > 1 && d < 5) ? b : c; }

  /* ───── верх раздела: тёмная карточка (как «Торговое оборудование» главной) + отдельная полоса фактов ───── */
  function top() {
    var об = D.querySelector('.вн-а__об');
    if (!об || об.getAttribute('data-p35')) return !!об;
    var h1 = об.querySelector('h1');
    if (!h1) return false;
    об.setAttribute('data-p35', '1');
    var N = total();
    var hero = el('section', 'ishp35-hero');
    hero.setAttribute('aria-label', 'Раздел каталога');
    var t = el('div', 'ishp35-hero__t', '<div class="ishp35-eb"><b>01</b> / КАТАЛОГ</div>');
    t.appendChild(h1);
    t.appendChild(el('p', 'ishp35-hero__s', (N ? num(N) + ' ' + tail(N, 'модель', 'модели', 'моделей') + ' · ' : '') + 'цены с НДС<span class="ishp35-hide-m"> · обновлено сегодня</span>'));
    hero.appendChild(t);
    var fc = D.querySelector('.t-store__card-list .js-product[data-product-img]');
    var himg = (fc && fc.getAttribute('data-product-img')) || HERO_IMG;   /* фото первой модели списка; нет - фото плитки «Компьютеры» */
    hero.appendChild(el('div', 'ishp35-hero__p', '<img src="' + himg + '" alt="" decoding="async">'));
    var strip = el('div', 'ishp8-strip ishp35-strip');
    strip.setAttribute('role', 'list');
    [['org', 'Для юрлиц и ИП'], ['inv', 'Счёт с НДС'], ['truck', 'Бесплатная доставка'], ['shield', 'Гарантия от производителя']].forEach(function (x) {
      strip.appendChild(el('div', 'ishp8-strip__i', svg28(IC[x[0]]) + '<p><b>' + x[1] + '</b></p>'));
      strip.lastChild.setAttribute('role', 'listitem');
    });
    об.appendChild(hero);
    об.appendChild(strip);
    return true;
  }

  /* ───── единая строка-панель над списком: «Найдено N», сортировка, «Список / Плитка».
     Родные узлы (.вн-верх, .ishd-view) НЕ переносим (p6 возвращает «Вид» на своё место): панель - пустой узел, три узла лежат в одной ячейке сетки .t-store ───── */
  function bar() {
    var st = D.querySelector('.t-store.вн-сетка') || D.querySelector('.t-store');
    if (!st) return false;
    var N = total();
    H.style.setProperty('--p35-n', '"' + (N ? 'Найдено ' + num(N) : 'Список') + '"');
    var sort = st.querySelector(':scope > .вн-верх');
    if (!sort) return false;
    if (!st.querySelector('.ishp35-bar')) {
      var b = el('div', 'ishp35-bar');
      b.setAttribute('aria-hidden', 'true');
      st.insertBefore(b, sort);
    }
    return true;
  }

  /* ───── индиго-плита «Пришлите список» после 12-й строки ───── */
  function plate() {
    var s = el('section', 'ishp35-plate');
    s.setAttribute('aria-label', 'Пришлите список');
    s.innerHTML = '<div class="ishp35-plate__t"><b class="ishp35-plate__h">Пришлите список — подберём позиции</b>' +
      '<p>Назовите модели или задачу — ответим по каждой позиции в рабочий день.</p></div>' +
      '<a class="ishp35-plate__b" href="' + REQ + '">Прислать список</a>';
    return s;
  }
  var mid = plate();
  var empty = el('section', 'ishp35-empty');
  empty.setAttribute('aria-live', 'polite');
  empty.hidden = true;
  empty.innerHTML = '<span class="ishp35-empty__i">' + svg28(IC.search) + '</span><div class="ishp35-empty__t"><b>Нет моделей с такими параметрами</b>' +
    '<p>Сбросьте часть фильтров или пришлите список — подберём подходящие позиции вручную.</p></div>' +
    '<div class="ishp35-empty__b"><button type="button" class="ishp35-btn" data-ishp35="reset">Сбросить фильтры</button>' +
    '<a class="ishp35-btn ishp35-btn--2" href="' + REQ + '">Пришлите список</a></div>';
  function reset() {
    var b = D.querySelector('.ishd-reset:not([hidden]), .js-store-filter-reset, .t-store__filter__btn-reset, [class*="filter-reset"]');
    if (b) { b.click(); return; }
    location.href = location.pathname;
  }
  D.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-ishp35="reset"]');
    if (t) { e.preventDefault(); reset(); }
    var br = e.target.closest && e.target.closest('[data-ishp35-brand]');
    if (br) {
      e.preventDefault();
      var v = br.getAttribute('data-ishp35-brand').toLowerCase();
      var chip = [].filter.call(D.querySelectorAll('.ishp9-bc:not(.ishp9-bc--more)'), function (c) { return (c.getAttribute('data-v') || '').toLowerCase() === v; })[0];
      if (chip) chip.click();
      var tg = D.querySelector('.ishp35-bar') || list;
      if (tg && tg.scrollIntoView) tg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ───── низ страницы ───── */
  function eb(n, t) { return '<div class="ishp35-eb"><b>' + n + '</b> / ' + t + '</div>'; }
  function tiles() {
    var links = [].slice.call(D.querySelectorAll('.вн-текст__рядом a[href]')).map(function (a) { return [a.textContent.trim(), a.getAttribute('href')]; });
    if (!links.length) links = [].slice.call(D.querySelectorAll('.ishp20-низ a.вн-смежн__п')).map(function (a) { return [a.textContent.trim(), a.getAttribute('href')]; });
    links.push(['Все компьютеры', '/kompyutery']);
    var h = '';
    links.forEach(function (l, i) {
      var img = l[1] === '/kompyutery' ? HERO_IMG : NEAR[l[1]];
      h += '<div class="ishp8-tw"><a class="ishp8-ti ishp8-tile" href="' + l[1] + '"><span class="ishp8-ix">' + ('0' + (i + 1)).slice(-2) + '</span>' +
        '<span class="ishp8-stage">' + (img ? '<img src="' + img + '" alt="" loading="lazy" decoding="async">' : '') + '</span>' +
        '<span class="ishp8-tt"><b>' + l[0] + '</b></span></a></div>';
    });
    return h;
  }
  function low() {
    if (D.getElementById('ishp35-low')) return true;
    var anchor = D.getElementById('ishp20-низ') || D.querySelector('#allrecords > .t-rec:has(.t-store__card-list)');
    if (!anchor) return false;
    var s = el('div', 'ishp35-low');
    s.id = 'ishp35-low';
    s.innerHTML = '<div class="ishp35-wrap"><section class="ishp35-sec">' + eb('02', 'СМЕЖНЫЕ РАЗДЕЛЫ') + '<div class="ishp35-tiles">' + tiles() + '</div></section>' +
      '<section class="ishp23-cta ishp35-cta" aria-label="Подбор техники"><div class="ishp23-cta__in"><div class="ishp23-cta__t"><div class="ishp23-eb">Подбор техники</div>' +
      '<h2 class="ishp23-cta__h">Не знаете, что выбрать? Опишите задачу</h2>' +
      '<p class="ishp23-cta__p">Четыре вопроса: задача, количество, бюджет и срок. Название модели знать не нужно — подберём 2–3 варианта и пришлём КП.</p></div>' +
      '<button type="button" class="ishp23-cta__b" data-ishp23-open>Подобрать технику за 1 минуту</button></div></section></div>';
    if (anchor.id === 'ishp20-низ') anchor.parentNode.insertBefore(s, anchor); else anchor.after(s);
    /* подбор: если квиз П23 не подключён - ведём в заявку */
    var cb = s.querySelector('[data-ishp23-open]');
    cb.addEventListener('click', function () { setTimeout(function () { if (!D.querySelector('.ishp23-m, .ishp23-modal, [class*="ishp23-ov"]') && !W.ISH_P23) location.href = REQ; }, 400); });
    return true;
  }
  function seo() {
    var c = D.querySelector('.вн-текст__карта');
    if (!c || c.getAttribute('data-p35')) return;
    c.setAttribute('data-p35', '1');
    c.parentNode.insertBefore(el('div', 'ishp35-eb ishp35-eb--seo', '<b>03</b> / О РАЗДЕЛЕ'), c);
  }
  /* «Все товары раздела (N)» - внутрь карточки «О разделе» (ссылки на карточки остаются в HTML, нужны роботу) */
  function allLinks() {
    var c = D.querySelector('.вн-текст__карта'), d = D.querySelector('details.кат-все');
    if (!c || !d || d.getAttribute('data-p35')) return !!(d && d.getAttribute('data-p35'));
    d.setAttribute('data-p35', '1');
    var w = d.closest('.вн-тело_одна');
    c.appendChild(d);
    if (w) w.classList.add('ishp35-gone');
    return true;
  }
  /* подпись под списком рисует p19 («НДС 16%»): после П32 - без 16%; охранник - только родная фраза */
  function noteFix() {
    var p = D.querySelector('.ishp19-note');
    if (!p || p.getAttribute('data-p35')) return;
    if (/^Цены указаны с НДС 16%\. Доставка бесплатная в любую точку Казахстана\.$/.test(p.textContent.trim())) {
      p.setAttribute('data-p35', '1');
      p.textContent = 'Цены указаны с НДС. Доставка бесплатная в любую точку Казахстана.';
    }
  }
  function brandsAndEnd() {
    if (D.getElementById('ishp35-end')) return true;
    var foot = D.getElementById('t-footer');
    var host = foot || D.getElementById('allrecords');
    if (!host) return false;
    var names = {}, other = [];
    var bt = D.querySelector('.t-store__filter [data-filter-name="brand"]'), bi = bt && bt.closest('.t-store__filter__item');
    [].forEach.call(bi ? bi.querySelectorAll('.t-store__filter__checkbox .t-store__filter__title') : [], function (x) {
      var n = x.textContent.trim(); if (!n) return; var k = BRAND_KEY[n.toLowerCase()];
      if (k) names[k] = 1; else if (other.indexOf(n) < 0) other.push(n);
    });
    if (!Object.keys(names).length) [].forEach.call(D.querySelectorAll('.ishp9-bc:not(.ishp9-bc--more)'), function (x) { var k = BRAND_KEY[(x.getAttribute('data-v') || '').toLowerCase()]; if (k) names[k] = 1; });
    var keys = ['lenovo', 'hp', 'dell', 'asus', 'acer'].filter(function (k) { return names[k]; });
    var tl = keys.map(function (k) {
      return '<li class="ishp8-bk md"><a class="ishp35-bk" href="#" data-ishp35-brand="' + BRAND_NAME[k] + '" title="' + BRAND_NAME[k] + '"><span class="ishp8-bm"><svg viewBox="0 0 24 24" role="img" aria-label="' + BRAND_NAME[k] + '"><path d="' + SI[k] + '"/></svg></span></a></li>';
    }).join('');
    var e = el('div', 'ishp35-end');
    e.id = 'ishp35-end';
    e.innerHTML = '<div class="ishp35-wrap">' +
      (tl ? '<section class="ishp35-sec">' + eb('04', 'БРЕНДЫ РАЗДЕЛА') + '<ul class="ishp35-bt">' + tl + '</ul>' +
        (other.length ? '<p class="ishp35-bo">Также в разделе: ' + other.slice(0, 12).join(' · ') + '</p>' : '') + '</section>' : '') +
      '<section class="ishp35-nf" aria-label="Не нашли нужное?"><span class="ishp35-nf__l">' + logo('ishp35-nf__lg', '#272B36', '#2B44C7') + '</span>' +
      '<div class="ishp35-nf__t"><h3>Не нашли нужное? Пришлите список</h3><p>Проработаем и ответим в день обращения.</p></div>' +
      '<div class="ishp35-ls" aria-hidden="true"><span>Ноутбук 15.6″ — 10 шт</span><span>Монитор 24″ — 10 шт</span><span>МФУ A4 — 2 шт</span><i class="ishp35-ok"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#1FA971"/><path d="m5.6 10.4 3 3 5.8-6.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>КП готово</i></div>' +
      '<div class="ishp35-nf__b"><span class="ishp35-nf__w"><a class="ishp35-b ishp35-b--main" href="' + REQ + '">Написать, что нужно</a></span>' +
      '<a class="ishp35-b" href="/assortiment">Посмотреть расширенный ассортимент iSoft</a></div></section></div>';
    if (foot) foot.parentNode.insertBefore(e, foot); else host.appendChild(e);
    /* знаки брендов: viewBox по габариту пути (как на главной) */
    [].forEach.call(e.querySelectorAll('.ishp8-bm svg'), function (v) {
      try { var p = v.querySelector('path'), bb = p.getBBox(); if (bb.width && bb.height) v.setAttribute('viewBox', bb.x + ' ' + bb.y + ' ' + bb.width + ' ' + bb.height); } catch (x) {}
    });
    return true;
  }

  var list, seen = false, demo = false;
  function visibleCards() {
    var a = [], c = list.querySelectorAll(':scope > .js-product');
    for (var i = 0; i < c.length; i++) if (c[i].offsetParent !== null || c[i].getClientRects().length) a.push(c[i]);
    return a;
  }
  function place() {
    if (!list) return;
    var cards = visibleCards(), n = cards.length;
    if (n) seen = true;
    var wantEmpty = demo || (seen && n === 0);
    empty.hidden = !wantEmpty;
    H.classList.toggle('ishp35-empty-on', wantEmpty);
    if (n > 12 && !demo) {
      var t = cards[11];
      var pv = mid.previousElementSibling;
      if (mid.parentNode !== list || (pv !== t && !(pv && pv.classList.contains('t-clear') && pv.previousElementSibling === t))) t.after(mid);
      mid.hidden = false;
    } else { mid.hidden = true; }
    var anchor = D.querySelector('.t-store__grid-cont, .js-store-grid-cont') || list.parentNode;
    if (empty.parentNode !== list.parentNode || empty.nextElementSibling !== list) list.parentNode.insertBefore(empty, list);
  }
  W.ISH_P35.demoEmpty = function (on) { demo = on !== false; place(); };

  /* ───── телефон: круги WhatsApp/Telegram лежали на «В корзину». Скрыты, пока читают список; выезжают при прокрутке вверх (3 с) и в конце страницы. ───── */
  var lastY = 0, ticking = false, fabT = 0;
  H.classList.add('ishp35-fab-hide');
  function fabs() {
    var y = W.pageYOffset || 0, d = y - lastY;
    if (Math.abs(d) > 6) {
      var nearEnd = (D.documentElement.scrollHeight - y - W.innerHeight) < 600;
      clearTimeout(fabT);
      if ((d < 0 && y > 240) || nearEnd) {
        H.classList.remove('ishp35-fab-hide');
        if (!nearEnd) fabT = setTimeout(function () { H.classList.add('ishp35-fab-hide'); }, 3000);
      } else H.classList.add('ishp35-fab-hide');
      lastY = y;
    }
    ticking = false;
  }
  W.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(fabs); } }, { passive: true });

  var tries = 0, started = false, done = {};
  (function step() {
    list = D.querySelector('.t-store__card-list');
    if (list && D.querySelector('.вн-а__об')) {
      if (!started) {
        started = true;
        H.classList.add('ishp35-on');
        list.parentNode.insertBefore(empty, list);
        var mo = function () { clearTimeout(step.t); step.t = setTimeout(place, 60); };
        new MutationObserver(mo).observe(list, { childList: true });
        new MutationObserver(mo).observe(list, { attributes: true, subtree: true, attributeFilter: ['style', 'hidden', 'class'] });
      }
      var hasCards = !!list.querySelector('.js-product');
      if (!done.top) done.top = top();
      if (hasCards) {
        if (!done.bar) done.bar = bar();
        if (!done.bar && tries > 20) done.bar = true;   /* на телефоне .вн-верх нет: хватает «Найдено N» у переключателя вида */
        if (!done.low) done.low = low();
        seo();
        allLinks();
        noteFix();
        if (!done.end) done.end = brandsAndEnd();
        place();
        if (done.top && done.bar && done.low && done.end) return;
      }
    }
    if (++tries < 100) setTimeout(step, 250);
  })();
})();
