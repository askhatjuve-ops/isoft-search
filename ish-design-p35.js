/* ish-design-p35.js  v3.4  (20.10: фото 6 разделов СКС) v3.3  (кандидат 19.10.2026; НЕ выложено; v3.3: лента и на страницах разделов; v3.2: на телефоне в группе плашка «Для юрлиц и ИП…» заменена стеклянной бегущей лентой внутри низа шапки)  П35 «раздел и группа каталога: компоненты главной»
   Режимы (определяются сами):
     раздел  - есть .t-store__card-list и верх .вн-а (список Tilda);
     группа  - есть .вн-гр[data-gruppa] и #вн-гр-список (родительская страница: свой список из getproductslist, без блока t-store).
   Ставит html.ishp35-on (+ ishp35-grp в группе), подгружает рядом ish-design-p35.css и ish-design-p8.css (готовые компоненты главной), добавляет свои узлы:
   тёмная шапка, полоса фактов, (группа: плитки разделов с фото), единая панель над списком, индиго-плита после 12-й строки, низ страницы
   (смежные разделы/группы, «Подбор техники», бренды, «Не нашли нужное?»). Родные узлы Tilda не заменяет.
   v3: фото шапки - плитка группы с главной (запасное: фото первой модели; нет - шапка без фото); смежные разделы - из текста страницы, иначе из дерева (соседи по группе)
       + плитка группы; фото плиток - таблица SEC из индекса поиска; бренды - все из фильтра (знаки 5 брендов, остальные текстом), блок не показывается, если брендов <2;
       число моделей - несколько источников, нет числа - без слова «Найдено»; нумерация подписей 01..NN по факту; длинные слова H1 не режутся.
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
  /* ───── данные: разделы (из индекса поиска на 17.10) и группы (дерево p24 + фото плиток главной p8) ─────
     SEC[адрес] = {n имя, g адрес группы, i фото (путь на static.tildacdn.com; товар с фото ближе всего к медиане цены), b бренды по числу товаров, e:1 - в индексе товаров нет}
     GRP[адрес] = {n имя, i фото плитки главной, s адреса разделов} */
  var SEC = {"/noutbuki":{"n":"Ноутбуки","g":"/kompyutery","i":"tild3833-6239-4834-b965-343537663563/368960946504.jpg","b":["ASUS","DELL","HP","Lenovo","Acer","MSI"]},"/sistemnye-bloki":{"n":"Системные блоки","g":"/kompyutery","i":"stor3466-6662-4339-b930-633564313563/52b6c7954535a744f77ecb341e9a3b0b.png","b":["DELL","Acer","HP","Supermicro","Logycom"]},"/monobloki":{"n":"Моноблоки","g":"/kompyutery","i":"tild6365-6535-4038-b734-616537613362/350866631334.jpg","b":["HP","ASUS","Acer","DELL","XG","PHILIPS"]},"/mini-pk-i-rabochie-stancii":{"n":"Мини-ПК","g":"/kompyutery","i":"tild6539-6333-4731-a535-626439313133/117009453914.jpg","b":["ASUS","APPLE","Logitech","Acer","DELL","HP"]},"/monitory":{"n":"Мониторы","g":"/monitory-i-ekrany","i":"tild3465-3636-4232-a463-663262626462/IS0C1A4341CC.jpg","b":["DELL","LG","Acer","Samsung","ASUS","iiyama"]},"/televizory":{"n":"Телевизоры","g":"/monitory-i-ekrany","i":"stor3766-3566-4938-b539-626438313732/175d50cacf9712418ee197d6bfa8e409.jpg","b":["Samsung","Dahua","Yandex"]},"/proektory-i-paneli":{"n":"Проекторы","g":"/monitory-i-ekrany","i":"stor3335-3861-4439-b966-373538336663/d834be5eff5f7a3d54b9d62ff97668ac.jpg","b":["Wanbo","Acer","Epson","Byintek","Xiaomi"]},"/kronshteyny-i-krepleniya":{"n":"Кронштейны для мониторов и ТВ","g":"/monitory-i-ekrany","i":"stor3535-3031-4634-b836-323261356663/87b1e65cb88081a7e8e36bed25ec8888.jpg","b":["XG","Brateck","Logitech","Samsung","Hikvision","DELL"]},"/processory":{"n":"Процессоры","g":"/komplektuyushchie","i":"stor6566-6366-4433-a536-343433346538/1d257a1dbb75e98b3d0a090a77712134.jpg","b":["Intel","AMD","HP","DELL"]},"/materinskie-platy":{"n":"Материнские платы","g":"/komplektuyushchie","i":"stor6261-3135-4162-b265-373438663632/e3570ef7eec9a3b497908a77fae2b0b9.jpg","b":["Gigabyte","ASUS","ASRock","MAXSUN","MSI","Supermicro"]},"/operativnaya-pamyat":{"n":"Оперативная память","g":"/komplektuyushchie","i":"stor6665-3162-4263-a163-303834666639/6b5f2cd5cdca2fdbdf5c40b3ec668e8b.jpg","b":["Kingston","Apacer","HIKSEMI","CORSAIR","Team_Group","Lexar"]},"/videokarty":{"n":"Видеокарты","g":"/komplektuyushchie","i":"stor6636-3034-4664-b036-346638613339/be2f8b1cd68a69600b0d4aa024fa071f.jpg","b":["Gigabyte","Palit","ASUS","AFOX","MAXSUN","ZOTAC"]},"/ohlazhdenie":{"n":"Охлаждение","g":"/komplektuyushchie","i":"stor3733-6332-4431-b935-396366616238/ae973f5c50af87e6d8337aa38d2ae3e1.jpg","b":["Deepcool","ID-COOLING","Thermaltake","1STPLAYER","ASUS","ARCTIC"]},"/korpusa-i-bloki-pitaniya":{"n":"Корпуса","g":"/komplektuyushchie","i":"stor3265-3764-4664-b635-663562343231/e70df967bb3476118fe0b149b981832e.jpg","b":["Thermaltake","Deepcool","Gamemax","1STPLAYER","Aerocool","FSP"]},"/bloki-pitaniya":{"n":"Блоки питания","g":"/komplektuyushchie","i":"stor3039-3738-4230-b262-373031663161/5c9907970882f1243e21afeb9a0ab85a.jpg","b":["Gamemax","Gamerstorm","CHIEFTEC","Thermaltake","FSP","Aerocool"]},"/ssd-nakopiteli":{"n":"SSD-накопители","g":"/nakopiteli","i":"tild3539-6532-4665-b732-313339306166/826568586694.jpg","b":["Kingston","NETAC","Samsung","HIKSEMI","SILICON POWER","Apacer"]},"/zhestkie-diski":{"n":"Жёсткие диски","g":"/nakopiteli","i":"tild3438-3333-4162-b038-646564333135/314133187724.jpg","b":["Apacer","SEAGATE","Synology","Toshiba","Huawei","WESTERN DIGITAL"]},"/fleshki-i-karty-pamyati":{"n":"USB-флешки","g":"/nakopiteli","i":"tild6231-3438-4932-a435-376335353164/191064673814.jpg","b":["Kingston","Apacer","NETAC","Lexar","HIKSEMI","CORSAIR"]},"/karty-pamyati":{"n":"Карты памяти","g":"/nakopiteli","i":"stor6661-6231-4135-a436-393532386134/c7e362f1a9b30afa98d2672bd308ab84.jpg","b":["Kingston","Apacer","NETAC","HIKSEMI","SILICON POWER","Lexar"]},"/ibp-i-zashchita-pitaniya":{"n":"ИБП","g":"/servery-i-infrastruktura","i":"stor3432-3562-4636-b132-303330383437/4fb5bc2c083476b321e5e07980dce410.jpg","b":["APC","SVC","CyberPower","Eaton","FSP","Ippon"]},"/servery-i-shd":{"n":"Системы хранения","g":"/servery-i-infrastruktura","i":"stor6365-6164-4261-b265-643462393630/214a3c0f954c500d3e4bb28dfa364962.jpg","b":["Synology","Asustor","Huawei","HPE","Ubiquiti","HUAWEI eKit"]},"/servery":{"n":"Серверы","g":"/servery-i-infrastruktura","i":"tild6662-3432-4236-b161-313263656265/983710912534.jpg","b":["Acer","DELL","HPE"]},"/shkafy-i-stoyki":{"n":"Шкафы и стойки","g":"/servery-i-infrastruktura","i":"tild3062-6262-4239-a135-316532323033/139147686754.jpg","b":["Lider Team","Lanmaster"]},"/setevoe-oborudovanie":{"n":"Сетевое оборудование","g":"/set-i-servery","i":"stor6137-6334-4031-b637-653536336563/8fa61c0c0c3f52028e329caf0d38d383.jpg","b":["TP-Link","Hikvision","H3C","Dahua","D-Link","BDCOM"]},"/marshrutizatory":{"n":"Маршрутизаторы (роутеры)","g":"/set-i-servery","i":"stor3535-3335-4364-a635-353532346536/bb620a7f61abdb9f40b0afe8b401d659.jpg","b":["TP-Link","MikroTik","Ubiquiti","ASUS","Mercusys","D-Link"]},"/tochki-dostupa":{"n":"Точки доступа Wi-Fi","g":"/set-i-servery","i":"stor3839-3032-4330-a339-306563643365/3bc212fc8c480aa1bb070fb2104580a2.jpg","b":["TP-Link","MikroTik","Grandstream","Ubiquiti","Hikvision","H3C"]},"/setevye-karty":{"n":"Сетевые карты и адаптеры","g":"/set-i-servery","i":"stor3362-3063-4632-b662-383762333963/797ec653583696c8d04285746c599de5.jpg","b":["TP-Link","GEMBIRD","ASUS","D-Link","UGREEN","Dahua"]},"/mezhsetevye-ekrany":{"n":"Межсетевые экраны","g":"/set-i-servery","i":"tild6361-3433-4364-b866-346630373330/395779320864.jpg","b":["H3C","Fortinet","DPtech"]},"/konferenc-svyaz":{"n":"IP-телефоны","g":"/set-i-servery","i":"stor3537-6438-4339-b365-313637383262/2755c48aff8582d9ab4ac94900262f5f.jpg","b":["Grandstream"]},"/printery":{"n":"Принтеры","g":"/ofis-i-rabochee-mesto","i":"stor3035-6161-4635-b539-613935396635/68cda26f8a3f60a9c37005da031288e1.jpg","b":["HP","Canon","Xerox","KYOCERA","PANTUM"]},"/mfu":{"n":"МФУ","g":"/ofis-i-rabochee-mesto","i":"stor3764-3531-4538-b335-643634613939/29593373b28e24b177165f3be571c3b1.jpg","b":["HP","Canon","Xerox","Epson","Lexmark","PANTUM","KYOCERA"]},"/plottery":{"n":"Плоттеры","g":"/ofis-i-rabochee-mesto","i":"stor6462-6433-4837-a564-393239353365/efff2b2a8adb42ed9207704f347218de.jpg","b":["Canon","HP"]},"/skanery-dokumentov":{"n":"Сканеры документов","g":"/ofis-i-rabochee-mesto","i":"stor6133-3366-4564-b032-373964326131/23179543146d6660da881db3d6a9a068.png","b":["Canon","HP","Epson"]},"/klaviatury":{"n":"Клавиатуры","g":"/svyaz-i-videonablyudenie","i":"tild6239-3037-4231-a661-383533356636/502231423034.jpg","b":["Logitech","Varmilo","AJAZZ","ATTACK SHARK","DEFENDER","Glorious"]},"/klaviatury-i-myshi":{"n":"Мыши","g":"/svyaz-i-videonablyudenie","i":"tild3537-3438-4361-b739-376638643730/IS8DB0A2A8DA.jpg","b":["Logitech","Genius","HP","Rapoo","ASUS","Acer"]},"/naushniki-i-garnitury":{"n":"Наушники и гарнитуры","g":"/svyaz-i-videonablyudenie","i":"stor6362-3938-4739-b632-336665666537/0adfedf63c4b4e70f34463273503c5a4.jpg","b":["Razer","HyperX","Logitech","APPLE","Jabra"]},"/videonablyudenie":{"n":"Камеры видеонаблюдения","g":"/videonablyudenie-i-bezopasnost","i":"stor6333-3133-4939-a565-643734343036/a210f190f9f598923494f6fca5d2d2da.jpg","b":["Dahua","Hikvision","TP-Link","HiLook","Canon","Imou"]},"/videoregistratory":{"n":"Видеорегистраторы","g":"/videonablyudenie-i-bezopasnost","i":"stor3939-3036-4562-a337-613961613830/287a3be6b9ea388f9865890d80be9d9a.jpg","b":["Dahua","Hikvision","HiLook","TP-Link"]},"/skud-i-turnikety":{"n":"СКУД и турникеты","g":"/videonablyudenie-i-bezopasnost","i":"stor3464-3536-4634-a134-656536336334/321c4989f5ccf2e88a4c418bdd976136.jpg","b":["Hikvision","Dahua","IronLogic"]},"/domofony":{"n":"Домофоны","g":"/videonablyudenie-i-bezopasnost","i":"stor6231-6239-4162-b430-626462326363/c0f5d1c223881e18346fe8a060008031.jpg","b":["Dahua","Hikvision"]},"/skanery-shtrihkoda":{"n":"Сканеры штрихкода","g":"/torgovoe-oborudovanie","i":"stor3430-3466-4031-b237-393038643432/a9fa4d3e853bbc28af599d2aabf34a43.jpg","b":["Honeywell","SVC"]},"/terminaly-sbora-dannyh":{"n":"Терминалы сбора данных","g":"/torgovoe-oborudovanie","i":"stor3232-6664-4339-b466-306639333663/ed9976d2d5a862ddbfcd211bc5ed6578.jpg","b":["Honeywell"]},"/printery-etiketok":{"n":"Принтеры этикеток","g":"/torgovoe-oborudovanie","i":"tild3265-6239-4735-a661-313332653034/ISDA26B90847.jpg","b":["Honeywell","Europrint","Xprinter"]}};
  var GRP = {"/kompyutery":{"n":"Компьютеры","i":"stor3761-6264-4162-b266-646337356566/f1e622a0312466f3ef1b71f3fde3f412.jpg","s":["/noutbuki","/sistemnye-bloki","/monobloki","/mini-pk-i-rabochie-stancii"],"h":"/kompyutery"},"/monitory-i-ekrany":{"n":"Мониторы и экраны","i":"tild3963-3338-4962-a232-386664663531/ISE6D646CEC2.jpg","s":["/monitory","/televizory","/proektory-i-paneli","/kronshteyny-i-krepleniya"],"h":"/monitory-i-ekrany"},"/komplektuyushchie":{"n":"Комплектующие","i":"stor3961-3939-4130-b931-623231306631/a0c21314158e83e4ac85cef31a89717d.jpg","s":["/processory","/materinskie-platy","/operativnaya-pamyat","/videokarty","/ohlazhdenie","/korpusa-i-bloki-pitaniya","/bloki-pitaniya"],"h":"/komplektuyushchie"},"/nakopiteli":{"n":"Накопители","i":"stor3135-3663-4731-a231-303731623939/58e82550701e3940898516e57992dd1f.jpg","s":["/ssd-nakopiteli","/zhestkie-diski","/fleshki-i-karty-pamyati","/karty-pamyati"],"h":"/nakopiteli"},"/servery-i-infrastruktura":{"n":"Серверы и серверная инфраструктура","i":"tild6365-3034-4766-b337-343265306465/827211892244.jpg","s":["/ibp-i-zashchita-pitaniya","/servery-i-shd","/servery","/shkafy-i-stoyki"],"h":"/servery"},"/set-i-servery":{"n":"Сетевое оборудование","i":"stor6164-3733-4538-b233-613239663964/141a321f108a700000b476634e76e701.jpg","s":["/setevoe-oborudovanie","/marshrutizatory","/tochki-dostupa","/setevye-karty","/mezhsetevye-ekrany","/konferenc-svyaz"],"h":"/set-i-servery"},"/ofis-i-rabochee-mesto":{"n":"Печать и сканирование","i":"tild3234-6165-4262-b837-666635633064/298696424884.jpg","s":["/printery","/mfu","/plottery","/skanery-dokumentov"],"h":"/ofis-i-rabochee-mesto"},"/svyaz-i-videonablyudenie":{"n":"Рабочее место","i":"stor3166-6566-4338-b031-313337613233/2fec9b0bf204f7fb214c097139a06de0.jpg","s":["/klaviatury","/klaviatury-i-myshi","/naushniki-i-garnitury"],"h":"/svyaz-i-videonablyudenie"},"/videonablyudenie-i-bezopasnost":{"n":"Видеонаблюдение и безопасность","i":"stor3566-3536-4830-a165-623765666434/327cdef9c6bb0513fcaa0be8546c882f.jpg","s":["/videonablyudenie","/videoregistratory","/skud-i-turnikety","/domofony"],"h":"/videonablyudenie"},"/torgovoe-oborudovanie":{"n":"Торговое оборудование","i":"stor3938-6362-4135-b834-306437306430/e6cd0535605dadd5f08486385fa38ba7.jpg","s":["/skanery-shtrihkoda","/terminaly-sbora-dannyh","/printery-etiketok"],"h":"/torgovoe-oborudovanie"}};
  /* СКС (20.10, НЕ включено): страницы-узла нет; 6 новых разделов - обычные разделы группы «Сетевое оборудование» (рядом со «Шкафами и стойками», они в своей группе остаются). Фото "i" пусто: плитка без фото. Включает window.ISH_SKS_ON. */
  if (W.ISH_SKS_ON) {
    var СКС_С = {"/kabel-vitaya-para":{"n":"Кабель витая пара","g":"/set-i-servery","i":"stor3934-3866-4966-a366-303136646239/3e703982cacc571b9df8b0286281e112.jpg","b":[]},"/rozetki-i-moduli":{"n":"Розетки и модули","g":"/set-i-servery","i":"stor3231-3862-4164-a433-656331663063/cc37ccb4d0754eda438ae913e00deee2.jpg","b":[]},"/patch-paneli":{"n":"Патч-панели","g":"/set-i-servery","i":"stor3234-3537-4237-b634-363534353461/db52d91a50da0b8f1e15849602474a05.jpg","b":[]},"/patch-kordy":{"n":"Патч-корды","g":"/set-i-servery","i":"stor3030-3537-4737-b031-663962383139/f0db7d0a770a2215e87824eb564ba98b.jpg","b":[]},"/kabel-kanaly-i-koroba":{"n":"Кабель-каналы и короба","g":"/set-i-servery","i":"stor6232-6666-4732-a430-396332316234/a5f66aa37991813b72c93c2132ac1aa3.jpg","b":[]},"/konnektory-i-instrument":{"n":"Коннекторы и инструмент","g":"/set-i-servery","i":"stor3966-3232-4235-a664-656363663835/993817d497eb79ff4dc9ac9c2f0157a3.jpg","b":[]}};
    Object.keys(СКС_С).forEach(function (k) { if (!SEC[k]) SEC[k] = СКС_С[k]; if (GRP["/set-i-servery"] && GRP["/set-i-servery"].s.indexOf(k) < 0) GRP["/set-i-servery"].s.push(k); });
  }
  function norm(h) { return String(h || '').replace(/[?#].*$/, '').replace(/^https?:\/\/[^\/]+/, '').replace(/\/+$/, '') || '/'; }
  var PATH = norm(location.pathname);
  function imgUrl(p) { return p ? (/^https?:/.test(p) ? p : T + p) : ''; }
  function el(t, c, h) { var e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function svg28(p) { return '<svg viewBox="0 0 28 28" aria-hidden="true">' + p + '</svg>'; }
  function logo(cls, fill, dot) {
    return '<svg class="' + cls + '" viewBox="0 0 2924 873" role="img" aria-label="iSoft" fill="' + fill + '">' + LOGO.replace('{{D}}', dot || fill) + '</svg>';
  }
  var IC = {
    org: '<rect x="5" y="3.5" width="18" height="21" rx="2"/><path d="M10 8.5h2.5M15.5 8.5H18M10 13h2.5M15.5 13H18M11.5 24.5v-5h5v5"/>',
    inv: '<path d="M6 3.5h12l4 4V24.5H6z"/><path class="ln" d="M18 3.5v4h4M10 13h8M10 17h8M10 21h5"/>',
    truck: '<path d="M2.5 7h14v11h-14zM16.5 11h5l4 4v3h-9z"/><circle cx="7" cy="20" r="2"/><circle cx="21" cy="20" r="2"/>',
    shield: '<path d="M14 3 5 6.5v7c0 5.5 3.8 9.4 9 11.5 5.2-2.1 9-6 9-11.5v-7z"/><path class="ln" d="m10 14 3 3 5-6"/>',
    search: '<circle cx="12.5" cy="12.5" r="7.5"/><path class="ln" d="m24 24-5.8-5.8M9.5 12.5h6"/>'
  };
  var HERO_IMG = T + 'stor3761-6264-4162-b266-646337356566/f1e622a0312466f3ef1b71f3fde3f412.jpg';  /* фото плитки «Компьютеры» с главной (для плитки «Весь каталог») */
  var BRAND_KEY = { lenovo: 'lenovo', hp: 'hp', dell: 'dell', 'dell technologies': 'dell', asus: 'asus', acer: 'acer' };
  var BRAND_NAME = { lenovo: 'Lenovo', hp: 'HP', dell: 'Dell', asus: 'ASUS', acer: 'Acer' };
  var MODE = '', list = null, GL = null;

  function grpOf() {
    if (GRP[PATH]) return GRP[PATH];
    var s = SEC[PATH];
    return (s && GRP[s.g]) || null;
  }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ' '); }
  function tail(n, a, b, c) { var m = n % 100, d = n % 10; return (m > 10 && m < 20) ? c : d === 1 ? a : (d > 1 && d < 5) ? b : c; }

  /* число моделей: «Все товары раздела (N)» (один раз) -> число ссылок в этом списке -> группа: все загруженные товары (приходит позже).
     Нет надёжного числа - 0: слово «Найдено» не пишем. */
  var staticN = -1;
  function total() {
    if (staticN < 0) {
      var m = /Все товары раздела\s*\((\d+)\)/.exec(D.body ? D.body.textContent : '');
      staticN = (m && +m[1] > 0) ? +m[1] : 0;
      if (!staticN) staticN = D.querySelectorAll('details.кат-все .кат-список li').length;
    }
    if (staticN) return staticN;
    var g = W.ВН_ГР && W.ВН_ГР.итог && W.ВН_ГР.итог.товаров;
    return g > 0 ? +g : 0;
  }
  function subText(N) {
    return (N ? num(N) + ' ' + tail(N, 'модель', 'модели', 'моделей') + ' · ' : '') + 'цены с НДС<span class="ishp35-hide-m"> · обновлено сегодня</span>';
  }

  /* ───── верх: тёмная карточка (как «Торговое оборудование» главной) + отдельная полоса фактов ───── */
  var heroEl = null, subEl = null;
  /* v3.2: бесконечная лента преимуществ (телефон, группа). Два одинаковых ряда, сдвиг на -50%; каждый ряд из двух наборов, чтобы не было просвета на широком экране.
     Пауза на касание (класс is-p); при prefers-reduced-motion лента стоит и листается пальцем (css). Читается один набор, копии aria-hidden. */
  function ribbon() {
    var items = [['org', 'Для юрлиц и ИП'], ['inv', 'Счёт с НДС'], ['truck', 'Бесплатная доставка'], ['shield', 'Гарантия от производителя']];
    function set(copy) {
      return items.map(function (x) {
        return '<span class="ishp35-rb__i' + (copy ? ' ishp35-rb__i--c' : '') + '"' + (copy ? ' aria-hidden="true"' : ' role="listitem"') + '>' + svg28(IC[x[0]]) + x[1] + '</span>';
      }).join('');
    }
    var r = el('div', 'ishp35-rb', '<div class="ishp35-rb__t"><div class="ishp35-rb__g" role="list" aria-label="Преимущества">' + set(0) + set(1) + '</div><div class="ishp35-rb__g" aria-hidden="true">' + set(1) + set(1) + '</div></div>');
    var tm;
    ['touchstart', 'pointerdown', 'mouseenter'].forEach(function (n) { r.addEventListener(n, function () { clearTimeout(tm); r.classList.add('is-p'); }, { passive: true }); });
    ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseleave'].forEach(function (n) { r.addEventListener(n, function () { tm = setTimeout(function () { r.classList.remove('is-p'); }, 1200); }); });
    return r;
  }
  function top() {
    var об = D.querySelector('.вн-а__об');
    if (!об || об.getAttribute('data-p35')) return !!об;
    var h1 = об.querySelector('h1');
    if (!h1) return false;
    об.setAttribute('data-p35', '1');
    var N = total();
    var hero = el('section', 'ishp35-hero');
    hero.setAttribute('aria-label', MODE === 'grp' ? 'Группа каталога' : 'Раздел каталога');
    var t = el('div', 'ishp35-hero__t', '<div class="ishp35-eb"><b>01</b> / КАТАЛОГ</div>');
    t.appendChild(h1);
    subEl = el('p', 'ishp35-hero__s', subText(N));
    cntT = N;
    t.appendChild(subEl);
    hero.appendChild(t);
    var L = 0;
    String(h1.textContent || '').split(/[\s\-–—]+/).forEach(function (w) { if (w.length > L) L = w.length; });
    /* слово заголовка не должно резаться: размер шрифта по длине самого длинного слова (с запасом на широкий запасной шрифт).
       --p35-hf  телефон, две колонки (текст + фото 120)   --p35-hm  телефон, одна колонка (фото скрыто)   --p35-hf2  планшет */
    var f = function (w, k) { return Math.floor(w / (L * 0.74)) < k[0] ? k[0] : Math.min(k[1], Math.floor(w / (L * 0.74))); };
    hero.style.setProperty('--p35-hf', f(214, [20, 30]) + 'px');
    hero.style.setProperty('--p35-hm', f(318, [22, 30]) + 'px');
    hero.style.setProperty('--p35-hf2', f(360, [24, 42]) + 'px');
    if (f(214, [0, 30]) < 24) hero.classList.add('ishp35-hero--long');   /* «Комплектующие», «Видеорегистраторы»: на телефоне одна колонка без фото */
    heroEl = hero;
    heroPhoto();   /* фото: первой модели списка (как на утверждённом /noutbuki) -> плитка группы с главной -> нет фото */
    var strip = el('div', 'ishp8-strip ishp35-strip');
    strip.setAttribute('role', 'list');
    [['org', 'Для юрлиц и ИП'], ['inv', 'Счёт с НДС'], ['truck', 'Бесплатная доставка'], ['shield', 'Гарантия от производителя']].forEach(function (x) {
      strip.appendChild(el('div', 'ishp8-strip__i', svg28(IC[x[0]]) + '<p><b>' + x[1] + '</b></p>'));
      strip.lastChild.setAttribute('role', 'listitem');
    });
    hero.appendChild(ribbon());   /* v3.3: и в группе, и в разделе. v3.2: лента внутри низа шапки; видна только на телефоне (css), полоса strip там скрыта */
    hero.appendChild(strip);   /* П2 (19.10): полоса фактов стеклом внутри тёмной шапки */
    об.appendChild(hero);
    if (MODE === 'grp') об.appendChild(subs());
    return true;
  }
  /* фото шапки раздела: 1) первая модель списка (как на утверждённом /noutbuki); 2) плитка группы с главной; 3) без фото (одна колонка).
     В группе - плитка группы, запасное - первая строка. Фото, которое не загрузилось, не повторяем. */
  var cardBad = false, grpBad = false;
  function cardImg() {
    var c = MODE === 'grp' ? D.querySelector('#вн-гр-список .вн-т__фото img') : D.querySelector('.t-store__card-list .js-product[data-product-img]');
    return c ? (c.getAttribute('data-product-img') || c.getAttribute('src') || '') : '';
  }
  function addHeroPhoto(src, kind) {
    if (!heroEl) return;
    var old = heroEl.querySelector('.ishp35-hero__p');
    if (old) old.parentNode.removeChild(old);
    heroEl.appendChild(el('div', 'ishp35-hero__p', '<img src="' + esc(src) + '" alt="" decoding="async">'));
    heroEl.setAttribute('data-ph', kind);
    heroEl.classList.remove('ishp35-hero--nop');
  }
  function heroPhoto() {
    if (!heroEl) return;
    var g = grpOf(), gi = g && !grpBad ? imgUrl(g.i) : '', ci = !cardBad ? cardImg() : '', kind = heroEl.getAttribute('data-ph') || '';
    var first = MODE === 'grp' ? gi || ci : ci || gi;
    var kfirst = first && first === gi ? 'grp' : 'card';
    if (first && kind !== kfirst && (!kind || (MODE === 'sec' && kfirst === 'card'))) addHeroPhoto(first, kfirst);
    else if (!kind && !first) heroEl.classList.add('ishp35-hero--nop');
  }
  function fixHeroPhoto() { heroPhoto(); }
  /* битая картинка: шапка - без фото, плитка - без картинки (вёрстка остаётся) */
  D.addEventListener('error', function (e) {
    var i = e.target;
    if (!i || i.tagName !== 'IMG' || !i.closest) return;
    var p = i.closest('.ishp35-hero__p');
    if (p) {
      var hh = p.parentNode, k = hh.getAttribute('data-ph');
      hh.removeChild(p); hh.removeAttribute('data-ph'); hh.classList.add('ishp35-hero--nop');
      if (k === 'card') cardBad = true; else grpBad = true;
      heroPhoto();
      return;
    }
    var s = i.closest('.ishp35-tiles .ishp8-stage');
    if (s) { s.classList.add('ishp35-noimg'); i.style.display = 'none'; }
  }, true);

  /* ───── плитки (как «Разделы каталога» главной): раздел/группа, название, фото ───── */
  function tileHtml(i, name, href, img, sub) {
    return '<div class="ishp8-tw"><a class="ishp8-ti ishp8-tile" href="' + esc(href) + '"><span class="ishp8-ix">' + ('0' + (i + 1)).slice(-2) + '</span>' +
      '<span class="ishp8-stage' + (img ? '' : ' ishp35-noimg') + '">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">' : '') + '</span>' +
      '<span class="ishp8-tt"><b>' + esc(name) + '</b>' + (sub ? '<span class="ishp35-tsub">' + esc(sub) + '</span>' : '') + '</span></a></div>';
  }
  function secImg(href) { var s = SEC[norm(href)]; return s ? imgUrl(s.i) : ''; }
  /* смежные разделы: ссылки из текста страницы -> копия из боковой колонки -> соседи по группе (дерево) */
  function nearLinks() {
    var links = [].slice.call(D.querySelectorAll('.вн-текст__рядом a[href]')).map(function (a) { return [a.textContent.trim(), a.getAttribute('href')]; });
    if (!links.length) links = [].slice.call(D.querySelectorAll('.ishp20-низ a.вн-смежн__п')).map(function (a) { return [a.textContent.trim(), a.getAttribute('href')]; });
    var seen = {}; seen[PATH] = 1;
    links = links.filter(function (l) { var k = norm(l[1]); if (!l[0] || seen[k]) return false; seen[k] = 1; return true; });
    if (!links.length) {
      var g = SEC[PATH] && GRP[SEC[PATH].g];
      if (g) (g.s || []).forEach(function (a) { if (a !== PATH && SEC[a] && !SEC[a].e && !seen[a]) { seen[a] = 1; links.push([SEC[a].n, a]); } });
    }
    return links.slice(0, 7);
  }
  function secTiles() {
    var links = nearLinks(), g = SEC[PATH] && GRP[SEC[PATH].g], h = '', i = 0;
    links.forEach(function (l) { h += tileHtml(i++, l[0], l[1], secImg(l[1])); });
    if (g) h += tileHtml(i++, g.n, SEC[PATH].g, imgUrl(g.i), 'Вся группа');
    return i >= 2 ? h : '';   /* одна плитка не блок: не показываем */
  }
  function grpTiles() {
    var keys = Object.keys(GRP), at = keys.indexOf(PATH), h = '', i = 0;
    var order = at < 0 ? keys : keys.slice(at + 1).concat(keys.slice(0, at));
    order.slice(0, 7).forEach(function (k) { h += tileHtml(i++, GRP[k].n, k, imgUrl(GRP[k].i)); });
    h += tileHtml(i++, 'Весь каталог', '/katalog', HERO_IMG);
    return h;
  }
  /* группа: плитки разделов с фото сверху (как «Разделы каталога» главной); меньше двух разделов - блока нет */
  function subs() {
    var g = GRP[PATH], h = '', i = 0;
    ((g && g.s) || []).forEach(function (a) { if (SEC[a] && !SEC[a].e) h += tileHtml(i++, SEC[a].n, a, imgUrl(SEC[a].i)); });
    var s = el('section', 'ishp35-subs ishp35-sec', i >= 2 ? eb('02', 'РАЗДЕЛЫ ГРУППЫ') + '<div class="ishp35-tiles">' + h + '</div>' : '');
    s.setAttribute('aria-label', 'Разделы группы');
    s.hidden = i < 2;
    return s;
  }

  /* ───── единая строка-панель над списком раздела: «Найдено N», сортировка, «Список / Плитка» ───── */
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
  /* группа: в верхней строке уже есть «Фильтры» (телефон), порядок и «Товаров: N» (живое число); добавляем «Список / Плитка» (тот же ключ памяти, что у разделов) */
  var VK = 'ishd-view';
  function viewGet() { try { return W.localStorage.getItem(VK) === 'tile' ? 'tile' : 'list'; } catch (e) { return 'list'; } }
  function viewSet(v) { try { W.localStorage.setItem(VK, v); } catch (e) {} }
  function viewApply(v) {
    H.classList.toggle('ishd-tile', v === 'tile');
    [].forEach.call(D.querySelectorAll('.ishp35-gv button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v ? 'true' : 'false'); });
  }
  function grpBar() {
    var v = D.querySelector('.вн-гр__верх');
    if (!v) return false;
    if (!v.querySelector('.ishp35-gv')) {
      var g = el('div', 'ishp35-gv', '<div class="ishd-seg" role="group" aria-label="Вид товаров"><button type="button" data-v="list" aria-pressed="true">Список</button><button type="button" data-v="tile" aria-pressed="false">Плитка</button></div>');
      v.appendChild(g);
      g.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button[data-v]'); if (!b) return; var x = b.getAttribute('data-v'); viewSet(x); viewApply(x); });
      viewApply(viewGet());
    }
    return true;
  }

  /* ───── индиго-плита «Пришлите список» после 12-й строки ───── */
  function plate() {
    var s = el('section', 'ishp35-plate');
    s.setAttribute('aria-label', 'Пришлите список');
    s.innerHTML = '<div class="ishp35-plate__t"><b class="ishp35-plate__h">Пришлите список — подберём позиции</b>' +
      '</div>' +
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
    var b = D.querySelector('#вн-гр-сброс.is-on, .ishd-reset:not([hidden]), .js-store-filter-reset, .t-store__filter__btn-reset, [class*="filter-reset"]');
    if (b) { b.click(); return; }
    location.href = location.pathname;
  }
  /* клик по знаку/названию бренда: включить этот бренд (чип над списком -> галка фильтра раздела -> галка в панели группы). Варианты написания (Dell / DELL / Dell Technologies) - все */
  function brandMatch(v, s) {
    v = String(v || '').toLowerCase(); s = String(s || '').trim().toLowerCase();
    return s === v || (!!BRAND_KEY[v] && BRAND_KEY[s] === BRAND_KEY[v]);
  }
  function selectBrand(v) {
    var hit = 0;
    if (MODE === 'grp') {
      [].forEach.call(D.querySelectorAll('#вн-ф-бренд label'), function (l) {
        var sp = l.querySelector('span'), inp = l.querySelector('input');
        if (sp && inp && brandMatch(v, sp.textContent) && !inp.checked) { inp.click(); hit++; }
      });
      return hit;
    }
    [].forEach.call(D.querySelectorAll('.ishp9-bc:not(.ishp9-bc--more)'), function (c) {
      if (brandMatch(v, c.getAttribute('data-v')) && c.getAttribute('aria-pressed') !== 'true') { c.click(); hit++; }
    });
    if (hit) return hit;
    var bt = D.querySelector('.t-store__filter [data-filter-name="brand"]'), bi = bt && bt.closest('.t-store__filter__item');
    [].forEach.call(bi ? bi.querySelectorAll('.t-store__filter__checkbox') : [], function (c) {
      var x = c.querySelector('.t-store__filter__title'), inp = c.querySelector('input');
      if (x && brandMatch(v, x.textContent) && !(inp && inp.checked)) { (inp || c).click(); hit++; }
    });
    return hit;
  }
  D.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-ishp35="reset"]');
    if (t) { e.preventDefault(); reset(); }
    var br = e.target.closest && e.target.closest('[data-ishp35-brand]');
    if (br) {
      e.preventDefault();
      selectBrand(br.getAttribute('data-ishp35-brand'));
      var tg = D.querySelector('.ishp35-bar') || D.querySelector('.вн-гр__верх') || list || GL;
      if (tg && tg.scrollIntoView) tg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ───── низ страницы ───── */
  function eb(n, t) { return '<div class="ishp35-eb"><b>' + n + '</b> / ' + t + '</div>'; }
  function low() {
    if (D.getElementById('ishp35-low')) return true;
    var anchor, before = null;
    if (MODE === 'grp') anchor = D.querySelector('.вн-гр[data-gruppa]');
    else {
      anchor = D.getElementById('ishp20-низ') || D.querySelector('#allrecords > .t-rec:has(.t-store__card-list)') || (list && list.closest && list.closest('.t-rec'));
      if (anchor && anchor.id === 'ishp20-низ') before = anchor;
    }
    if (!anchor) return false;
    var th = MODE === 'grp' ? grpTiles() : secTiles();
    var head = MODE === 'grp' ? 'ДРУГИЕ ГРУППЫ КАТАЛОГА' : 'СМЕЖНЫЕ РАЗДЕЛЫ';
    var s = el('div', 'ishp35-low');
    s.id = 'ishp35-low';
    s.innerHTML = '<div class="ishp35-wrap">' + (th ? '<section class="ishp35-sec">' + eb('02', head) + '<div class="ishp35-tiles">' + th + '</div></section>' : '') +
      '</div>';
    if (before) before.parentNode.insertBefore(s, before); else anchor.after(s);
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
  /* группа: подпись под списком (в разделе её рисует p19 по .js-store-grid-cont; в группе такого узла нет) */
  function grpNote() {
    if (D.querySelector('.ishp35-note')) return true;
    var b = D.getElementById('вн-гр-ещё');
    if (!b) return false;
    b.after(el('p', 'ishp19-note ishp35-note', 'Цены указаны с НДС. Доставка бесплатная в любую точку Казахстана.'));
    return true;
  }
  /* нумерация подписей «NN / …» по факту: пропущенный блок не оставляет дырку */
  function renum() {
    var n = 0;
    [].forEach.call(D.querySelectorAll('.ishp35-eb'), function (e) {
      if (e.closest('[hidden]')) return;
      var b = e.querySelector('b');
      if (b) b.textContent = ('0' + (++n)).slice(-2);
    });
  }

  /* ───── бренды: все из панели фильтра; знаки у пяти (Lenovo, HP, Dell, ASUS, Acer), остальные - названием на такой же плитке ───── */
  function brandNames() {
    var out = [], seen = {};
    function add(n) {
      n = String(n || '').trim();
      if (!n || /^[-–—\s]*$/.test(n)) return;
      var k = BRAND_KEY[n.toLowerCase()] || n.toLowerCase();
      if (seen[k]) return;
      seen[k] = 1; out.push(n);
    }
    if (MODE === 'grp') [].forEach.call(D.querySelectorAll('#вн-ф-бренд label span'), function (x) { add(x.textContent); });
    else {
      var bt = D.querySelector('.t-store__filter [data-filter-name="brand"]'), bi = bt && bt.closest('.t-store__filter__item');
      [].forEach.call(bi ? bi.querySelectorAll('.t-store__filter__checkbox .t-store__filter__title') : [], function (x) { add(x.textContent); });
      if (!out.length) [].forEach.call(D.querySelectorAll('.ishp9-bc:not(.ishp9-bc--more)'), function (x) { add(x.getAttribute('data-v')); });
    }
    return out;
  }
  function rank(n) {   /* место бренда по числу товаров раздела в индексе поиска; нет в индексе - в конец */
    var s = SEC[PATH], b = (s && s.b) || [], v = n.toLowerCase();
    for (var i = 0; i < b.length; i++) if (b[i].toLowerCase() === v) return i;
    return 99;
  }
  function fillBrands() {
    var host = D.querySelector('#ishp35-end .ishp35-brands');
    if (!host) return false;
    var names = brandNames();
    if (names.length < 2) return false;   /* панель брендов рисуется позже списка: вызывающий повторит; брендов меньше двух - блока нет */
    var logos = [], texts = [];
    names.forEach(function (n) { (BRAND_KEY[n.toLowerCase()] ? logos : texts).push(n); });
    texts.sort(function (a, b) { return rank(a) - rank(b) || a.localeCompare(b, 'ru'); });
    var room = Math.max(0, 12 - logos.length), shown = texts.slice(0, room), rest = texts.slice(room);
    var tl = logos.map(function (n) {
      var k = BRAND_KEY[n.toLowerCase()];
      return '<li class="ishp8-bk md"><a class="ishp35-bk" href="#" data-ishp35-brand="' + BRAND_NAME[k] + '" title="' + BRAND_NAME[k] + '"><span class="ishp8-bm"><svg viewBox="0 0 24 24" role="img" aria-label="' + BRAND_NAME[k] + '"><path d="' + SI[k] + '"/></svg></span></a></li>';
    }).join('') + shown.map(function (n) {
      return '<li class="ishp8-bk md ishp35-bkt"><a class="ishp35-bk" href="#" data-ishp35-brand="' + esc(n) + '" title="' + esc(n) + '"><span class="ishp35-bn">' + esc(n) + '</span></a></li>';
    }).join('');
    host.innerHTML = eb('04', 'БРЕНДЫ РАЗДЕЛА') + '<ul class="ishp35-bt">' + tl + '</ul>' +
      (rest.length ? '<p class="ishp35-bo">Также в разделе: ' + rest.slice(0, 16).map(esc).join(' · ') + (rest.length > 16 ? ' и ещё ' + (rest.length - 16) : '') + '</p>' : '');
    host.hidden = false;
    /* знаки брендов: viewBox по габариту пути (как на главной) */
    [].forEach.call(host.querySelectorAll('.ishp8-bm svg'), function (v) {
      try { var p = v.querySelector('path'), bb = p.getBBox(); if (bb.width && bb.height) v.setAttribute('viewBox', bb.x + ' ' + bb.y + ' ' + bb.width + ' ' + bb.height); } catch (x) {}
    });
    renum();
    return true;
  }
  /* 21.10: баннер «Не нашли нужное?» - отдельный узел сразу после списка/«Загрузить ещё»/подписи, до смежных разделов (#ishp35-low) */
  function nf() {
    if (D.getElementById('ishp35-nf')) return true;
    var low = D.getElementById('ishp35-low');
    if (!low) return false;
    var n = el('div', 'ishp35-nfw');
    n.id = 'ishp35-nf';
    n.innerHTML = '<div class="ishp35-wrap">' +
      '<section class="ishp35-nf" aria-label="Не нашли нужное?"><span class="ishp35-nf__l">' + logo('ishp35-nf__lg', '#272B36', '#2B44C7') + '</span>' +
      '<div class="ishp35-nf__t"><h3>Не нашли нужное? Пришлите список</h3><p>Проработаем и ответим в день обращения.</p></div>' +
      '<div class="ishp35-ls" aria-hidden="true"><span>Ноутбук 15.6″ — 10 шт</span><span>Монитор 24″ — 10 шт</span><span>МФУ A4 — 2 шт</span><i class="ishp35-ok"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#1FA971"/><path d="m5.6 10.4 3 3 5.8-6.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>КП готово</i></div>' +
      '<div class="ishp35-nf__b"><span class="ishp35-nf__w"><a class="ishp35-b ishp35-b--main" href="' + REQ + '">Написать, что нужно</a></span>' +
      '<a class="ishp35-b" href="/assortiment">Расширенный ассортимент 14000+</a></div></section></div>';
    low.parentNode.insertBefore(n, low);
    H.classList.add('ishp35-nfon');
    return true;
  }
  function end() {
    if (D.getElementById('ishp35-end')) return true;
    var foot = D.getElementById('t-footer');
    var host = foot || D.getElementById('allrecords');
    if (!host) return false;
    var e = el('div', 'ishp35-end');
    e.id = 'ishp35-end';
    e.innerHTML = '<div class="ishp35-wrap"><section class="ishp35-sec ishp35-brands" hidden></section></div>';
    if (foot) foot.parentNode.insertBefore(e, foot); else host.appendChild(e);
    return true;
  }

  /* ───── список: плита после 12-й строки, пустой экран, число ───── */
  var seen = false, demo = false, cntT = 0;
  function rows() { return MODE === 'grp' ? GL.querySelectorAll(':scope > .вн-т') : list.querySelectorAll(':scope > .js-product'); }
  function visibleCards() {
    var a = [], c = rows();
    for (var i = 0; i < c.length; i++) if (c[i].offsetParent !== null || c[i].getClientRects().length) a.push(c[i]);
    return a;
  }
  function counts() {   /* число в шапке: в группе оно приходит после загрузки всех частей */
    var N = total();
    if (N && subEl && N !== cntT) { cntT = N; subEl.innerHTML = subText(N); }
  }
  function place() {
    var host = MODE === 'grp' ? GL : list;
    if (!host) return;
    var cards = visibleCards(), n = cards.length;
    if (n) seen = true;
    if (MODE === 'sec') {
      var wantEmpty = demo || (seen && n === 0);
      empty.hidden = !wantEmpty;
      H.classList.toggle('ishp35-empty-on', wantEmpty);
      if (empty.parentNode !== list.parentNode || empty.nextElementSibling !== list) list.parentNode.insertBefore(empty, list);
    }
    if (n > 12 && !demo) {
      var t = cards[11], pv = mid.previousElementSibling;
      if (mid.parentNode !== host || (pv !== t && !(pv && pv.classList.contains('t-clear') && pv.previousElementSibling === t))) t.after(mid);
      mid.hidden = false;
    } else { mid.hidden = true; }
    counts();
    fixHeroPhoto();
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

  /* 20.10: /katalog (шапка p31, не p35) - не включаем ishp35-on (он перекрасил бы шапку p31 и .вн-текст), а ставим отдельный ishp35-kat: на него расширены только правила карточек списка, кнопки «Загрузить ещё» и цены. */
  if (((W.location.pathname || '/').replace(/\/+$/, '').toLowerCase()) === '/katalog') H.classList.add('ishp35-kat');
  var tries = 0, started = false, done = {};
  (function step() {
    list = D.querySelector('.t-store__card-list');
    GL = D.getElementById('вн-гр-список');
    if (!MODE) MODE = list ? 'sec' : (GL && D.querySelector('.вн-гр[data-gruppa]') ? 'grp' : '');
    if (MODE && D.querySelector('.вн-а__об')) {
      var host = MODE === 'grp' ? GL : list;
      if (!started) {
        started = true;
        H.classList.add('ishp35-on');
        if (MODE === 'grp') H.classList.add('ishp35-grp');
        else list.parentNode.insertBefore(empty, list);
        var mo = function () { clearTimeout(step.t); step.t = setTimeout(place, 60); };
        new MutationObserver(mo).observe(host, { childList: true });
        if (MODE === 'sec') new MutationObserver(mo).observe(list, { attributes: true, subtree: true, attributeFilter: ['style', 'hidden', 'class'] });
      }
      if (!done.top) done.top = top();   /* шапка не ждёт карточек: число и фото берутся не из них */
      counts();
      var hasCards = MODE === 'grp' ? !!GL.querySelector('.вн-т') : !!list.querySelector('.js-product');
      if (hasCards) {
        if (!done.bar) done.bar = MODE === 'grp' ? grpBar() : bar();
        if (!done.bar && tries > 20) done.bar = true;   /* на телефоне .вн-верх нет: хватает «Найдено N» у переключателя вида */
        if (MODE === 'grp' && !done.note) done.note = grpNote();
        if (!done.low) done.low = low();
        seo();
        if (MODE === 'sec') { allLinks(); noteFix(); }
        if (!done.nf) done.nf = nf();
        if (!done.end) done.end = end();
        if (done.end && !done.br) done.br = fillBrands() || tries > 80;   /* панель брендов рисуется позже карточек: повторяем до ~20 с */
        place();
        renum();
        if (done.top && done.bar && done.low && done.nf && done.end && done.br && (MODE === 'sec' || (cntT && done.note))) return;
      }
    }
    if (++tries < 110) setTimeout(step, 250);
  })();
})();

/* ═══════════════ П35-строки v1: бренд капсом и «в наличии» в строке товара (волна 1, задача А, 17.10.2026) ═══════════════
   Чистая надстройка: ничего не пишет на сайт, только добавляет в карточку списка <div class="ishp35r-br"> (бренд + точка «в наличии»).
   Бренд берётся из значений фильтра «Бренд» этой страницы (совпадение со словом названия), запасной список - ниже. Наличие - data-product-inv > 0.
   Откат: window.ISH_P35R_OFF=1 до загрузки - скрипт ничего не делает (без блока .ishp35r-br CSS строки остаётся рабочим). */
(function () {
  'use strict';
  if (window.ISH_P35R_OFF || window.ISH_P35R) return; window.ISH_P35R = 1;
  var D = document;
  var ЗАПАС = ['ASUS','Acer','Lenovo','HP','Dell','MSI','Apple','Huawei','Tecno','Infinix','Xiaomi','Honor','Gigabyte','Samsung','Chuwi','Machenike','Realme','Haier','Thunderobot','LG','Philips','AOC','ViewSonic','BenQ','Dream Machines','Aorus','Razer'];
  function бренды() {
    var сп = [], seen = {};
    var эл = D.querySelectorAll('.t-store__filter__item');
    for (var i = 0; i < эл.length; i++) {
      var t = эл[i].querySelector('.t-store__filter__item-title');
      if (!t || !/^\s*(бренд|brand)\s*$/i.test(t.textContent.replace(/\d+/g, '').trim())) continue;
      var т = эл[i].querySelectorAll('.t-store__filter__title');
      for (var j = 0; j < т.length; j++) { var s = т[j].textContent.replace(/\s*\(\d+\)\s*$/, '').trim(); if (s && !seen[s.toLowerCase()]) { seen[s.toLowerCase()] = 1; сп.push(s); } }
    }
    ЗАПАС.forEach(function (s) { if (!seen[s.toLowerCase()]) { seen[s.toLowerCase()] = 1; сп.push(s); } });
    сп.sort(function (a, b) { return b.length - a.length; });   // длинные раньше: «Dream Machines» до «Dell»
    return сп;
  }
  function норм(s) { return ' ' + s.toLowerCase().replace(/[^a-zа-я0-9]+/g, ' ').trim() + ' '; }
  function найти(имя, сп) {
    var n = норм(имя);
    for (var i = 0; i < сп.length; i++) { var b = норм(сп[i]); if (b.length > 3 && n.indexOf(b) > -1) return сп[i]; }
    return '';
  }
  var СV = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M1 1h2.2l2 10.5h9.3l1.8-7.5H4.4"/><circle cx="6.5" cy="15.5" r="1.3"/><circle cx="13.5" cy="15.5" r="1.3"/></svg>';
  /* страница группы: строки .вн-т рисует её собственный скрипт (без data-ish13, без остатка). Бренд - по названию (список фильтра «Бренд» группы + запас), кнопке добавляем значок корзины. Наличия в разметке строки нет - не рисуем. */
  function группа() {
    var к = D.querySelectorAll('.вн-т:not([data-ishp35r])');
    if (!к.length) return;
    var сп = [], seen = {}, эл = D.querySelectorAll('#вн-ф-бренд label');
    for (var q = 0; q < эл.length; q++) { var s0 = эл[q].textContent.replace(/\s*\(?\d+\)?\s*$/, '').trim(); if (s0 && !seen[s0.toLowerCase()]) { seen[s0.toLowerCase()] = 1; сп.push(s0); } }
    ЗАПАС.forEach(function (s) { if (!seen[s.toLowerCase()]) { seen[s.toLowerCase()] = 1; сп.push(s); } });
    сп.sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < к.length; i++) {
      var c = к[i], tw = c.querySelector('.вн-т__текст'), ti = c.querySelector('.вн-т__имя'), кн = c.querySelector('.вн-т__кн');
      c.setAttribute('data-ishp35r', '1');
      if (кн && !кн.querySelector('svg')) кн.insertAdjacentHTML('afterbegin', СV);
      if (!tw || !ti) continue;
      var бр = найти(ti.getAttribute('title') || ti.textContent || '', сп), нал = parseFloat(c.getAttribute('data-product-inv')) > 0;   /* 20.10: остаток кладёт генератор группы */
      if (!бр && !нал) continue;
      var d = D.createElement('div'); d.className = 'ishp35r-br';
      if (бр) { var s = D.createElement('span'); s.textContent = бр; d.appendChild(s); }
      if (нал) { var a = D.createElement('span'); a.className = 'ishp35r-av'; a.textContent = 'в наличии'; d.appendChild(a); }
      tw.insertBefore(d, ti);
    }
  }
  function проход() {
    группа();
    /* карточки без data-product-inv (/katalog): наличие берём из бейджа П38 (.ishp38-stock), он приходит позже карточки */
    var ст = D.querySelectorAll('.t-store__card[data-ishp35r] .ishp38-stock');
    for (var z = 0; z < ст.length; z++) {
      var cc = ст[z].closest('.t-store__card'); if (!cc || cc.querySelector('.ishp35r-av')) continue;
      var bb = cc.querySelector('.ishp35r-br'), tw2 = cc.querySelector('.t-store__card__textwrapper'), ti2 = cc.querySelector('.t-store__card__title');
      if (!tw2 || !ti2) continue;
      if (!bb) { bb = D.createElement('div'); bb.className = 'ishp35r-br'; tw2.insertBefore(bb, ti2); }
      var a2 = D.createElement('span'); a2.className = 'ishp35r-av'; a2.textContent = 'в наличии'; bb.appendChild(a2);
    }
    var к = D.querySelectorAll('.t-store__card[data-ish13]:not([data-ishp35r])');
    if (!к.length) return;
    var сп = бренды();
    for (var i = 0; i < к.length; i++) {
      var c = к[i], tw = c.querySelector('.t-store__card__textwrapper'), ti = c.querySelector('.t-store__card__title');
      c.setAttribute('data-ishp35r', '1');
      if (!tw || !ti) continue;
      var имя = ti.getAttribute('data-ish13-имя') || ti.textContent || '';
      var бр = найти(имя, сп), нал = parseFloat(c.getAttribute('data-product-inv')) > 0;
      if (!бр && !нал) continue;
      var d = D.createElement('div'); d.className = 'ishp35r-br';
      if (бр) { var s = D.createElement('span'); s.textContent = бр; d.appendChild(s); }
      if (нал) { var a = D.createElement('span'); a.className = 'ishp35r-av'; a.textContent = 'в наличии'; d.appendChild(a); }
      tw.insertBefore(d, ti);
    }
  }
  var t = 0;
  function отл() { clearTimeout(t); t = setTimeout(проход, 120); }
  function старт() {
    проход();
    var корень = D.getElementById('allrecords') || D.body;
    try { new MutationObserver(отл).observe(корень, { childList: true, subtree: true }); } catch (e) { setInterval(проход, 1500); }
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', старт); else старт();
})();

/* ═══════════════ П35 «Найдено N» живое (21.10.2026) ═════════
   Строка «Найдено N» над списком (и у переключателя вида на телефоне) берёт число из CSS-переменной --p35-n, а p35 ставит туда статичное
   «Все товары раздела (N)». После фильтра число не менялось, а рядом Tilda показывала своё «Найдено: 32». Теперь: пока у Tilda есть число
   фильтра (js-store-filters-prodsnumber, строка видна) - в --p35-n живое число; фильтр сброшен - возвращаем прежнее. Родная строка Tilda
   скрыта в css (одна строка, одно число). Откат: window.ISH_P35LIVE_OFF=1. */
(function () {
  'use strict';
  if (window.ISH_P35LIVE_OFF || window.__ishP35Live) return; window.__ishP35Live = 1;
  var D = document, H = D.documentElement, base = null, last = '';
  function num(n) { return String(n).replace(/\B(?=(\d{3})+$)/g, ' '); }
  function тик() {
    var sp = D.querySelector('.js-store-filters-prodsnumber');
    if (!sp || !H.classList.contains('ishp35-on')) return;
    var w = sp.closest ? sp.closest('.js-store-filters-prodsnumber-wrap') : null;
    var n = (sp.textContent || '').replace(/\D/g, '');
    var on = !!n && !!w && w.style.display !== 'none';
    if (on) {
      if (base === null) base = H.style.getPropertyValue('--p35-n');
      var v = '"Найдено ' + num(n) + '"';
      if (H.style.getPropertyValue('--p35-n') !== v) H.style.setProperty('--p35-n', v);
    } else if (base !== null) {
      H.style.setProperty('--p35-n', base); base = null;
    }
  }
  setInterval(тик, 400);
})();
