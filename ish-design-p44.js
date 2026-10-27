/* ish-design-p44.js  v3 (27.10.2026: пустая корзина = поле «Список позиций» + «Выбрать файл» + те же две карточки (КП: телефон и почта; счёт: БИН, почта, название); отдельной страницы /podbor больше нет, она переходит на /spec; список уходит в «Комментарий» родной формы строкой «Тема запроса: Подбор техники · Просили: КП|Счёт · Список: …»; v2: 26.10.2026: #kp=номер~позиции из ссылки PDF-КП -> пустая корзина Tilda заполняется этими позициями; v1)  П44 «КП и счёт просто» на /spec b2b.isoft-shop.kz
   Решение владельца 26.10: путь «КП и счёт» из карточки и корзины = «Ваш заказ» + телефон + [Получить КП] и ниже БИН + почта + [Выставить счёт].
   Без темы запроса, контактного лица, комментария, файла, списка текстом, вкладок «Счёт/КП» и галочки (вместо неё строка про политику).
   /podbor (27.10) ведёт сюда же: p4 делает переход, данные «Уточнить по товару» (sessionStorage ishp10_ask, ?code=, ?model=&art=) падают в поле списка.
   Как устроено: Tilda и её блок T123 НЕ правятся. Родную форму корзины 3238938703 прячем за край экрана (не display:none),
   свою панель #ishp44 строим под списком позиций, а при нажатии заполняем скрытые поля родной формы и жмём её родную «Отправить».
   Так письмо/вебхук Tilda, номер заказа и позиции идут прежним путём. Лид «телефон + состав КП» помечен [Документ: Лид КП] (разбор на ноутбуке).
   КП в PDF собирается в браузере (ish-kp-pdf.js, по нажатию); корзина после «Получить КП» НЕ очищается (счёт можно выставить следом).
   Пока в Tilda эти поля обязательны (Компания, Email, Телефон, Согласие), недостающие заполняются служебными заглушками, которые ноутбук
   считает «пусто»: компания «—», почта …@bez-pochty.invalid, телефон (000) 000-00-00. Когда поля в Tilda станут необязательными, заглушки не нужны.
   Выключатель: window.ISH_P44_OFF = 1 (до загрузки p4). Кэш: поменять P44V в p4. */
/* ISH_SLA: ОДНО место для обещаний срока (часы работы пн–вс 9:00–18:00, время Астаны UTC+5). Копия в каждом файле, кому нужна; первая загруженная создаёт window.ISH_SLA. Менять часы/тексты - здесь (во всех копиях одинаково). Проверка: window.ISH_SLA_NOW = мс. */
(function (W) { if (W.ISH_SLA) return; var O = 9, C = 18; function ok() { var h = new Date((W.ISH_SLA_NOW || Date.now()) + 5 * 36e5).getUTCHours(); return h >= O && h < C; }
  W.ISH_SLA = { open: ok, reply: function () { return ok() ? 'Ответим сегодня' : 'Ответим утром, с 9:00'; }, replyLc: function () { return ok() ? 'ответим сегодня' : 'ответим утром, с 9:00'; },
    inv: function (em) { return ok() ? 'Счёт придёт на почту ' + (em ? em + ' ' : '') + 'в течение 15 минут' : 'Сейчас нерабочее время — счёт пришлём утром, с 9:00' + (em ? ' на почту ' + em : ''); } }; })(window);
(function () {
  'use strict';
  var W = window, D = document, H = D.documentElement;
  if (W.ISH_P44_OFF || W.__ishP44) return;
  if (String(location.pathname).replace(/\/+$/, '') !== '/spec') return;
  W.__ishP44 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p44.js"]');
  var BASE = tag && tag.src ? tag.src.replace(/ish-design-p44\.js.*$/, '') : '';
  var VER = (tag && /[?&]v=([^&]*)/.exec(tag.src || '') || [0, '1'])[1];
  var FID = 'form3238938703';
  var PH_EMAIL = 'kp@bez-pochty.invalid', PH_PHONE = '(000) 000-00-00', PH_COMPANY = '—';
  /* быстрая связь: телефон и WhatsApp - настоящие ссылки; в текстах ошибок пишем {CT} */
  var CT = '<a class="ishp44__tel" href="tel:+77758818531">+7 775 881 85 31</a> · <a class="ishp44__tel" href="https://wa.me/77758818531" target="_blank" rel="noopener">WhatsApp</a>';
  function ct(m) { return esc(m).replace(/\{CT\}/g, CT); }
  var state = { busy: false, done: '', pdf: null, num: '', kpLink: '' };
  function listMode() { return !items().length && !state.done; }   /* корзина пуста: вместо заказа поле списка */

  function q(s, r) { return (r || D).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
  function until(fn, max, step) { var n = 0; (function go() { var ok = false; try { ok = fn(); } catch (e) {} if (!ok && ++n < (max || 60)) setTimeout(go, step || 250); })(); }
  function track(n, p) { try { if (typeof W.gtag === 'function') W.gtag('event', n, p); } catch (e) {} }

  /* css рядом */
  (function () {
    if (!BASE || D.getElementById('ishp44-css')) return;
    var l = D.createElement('link'); l.id = 'ishp44-css'; l.rel = 'stylesheet'; l.href = BASE + 'ish-design-p44.css?v=' + VER; D.head.appendChild(l);
  })();
  H.classList.add('ishp44');

  /* ── корзина ── */
  function cart() {
    var c = W.tcart;
    if (!c || !c.products) { try { c = JSON.parse(localStorage.getItem('tcart') || '{}'); } catch (e) { c = {}; } }
    return c && c.products ? c : { products: [] };
  }
  function items() {
    var r = [];
    (cart().products || []).forEach(function (p) {
      if (!p || typeof p !== 'object' || p.deleted === 'yes' || !(Number(p.quantity) > 0) || (!p.name && !p.uid)) return;
      r.push({ name: String(p.name || ''), sku: String(p.sku || ''), qty: Number(p.quantity), price: Number(p.price) || 0, uid: String(p.uid || '') });
    });
    return r;
  }
  function totals() {
    var it = items(), sum = 0, n = 0, np = 0;
    it.forEach(function (x) { sum += x.price * x.qty; n += x.qty; if (!(x.price > 0)) np++; });
    return { it: it, sum: sum, n: n, noPrice: np };
  }

  /* ── проверки ── */
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function phone10(s) { var d = digits(s); if (d.length === 11 && (d[0] === '7' || d[0] === '8')) d = d.slice(1); return d.slice(0, 10); }
  function phoneFmt(d) {
    var o = '+7'; if (!d) return '';
    o += ' ' + d.slice(0, 3); if (d.length > 3) o += ' ' + d.slice(3, 6); if (d.length > 6) o += ' ' + d.slice(6, 8); if (d.length > 8) o += ' ' + d.slice(8, 10);
    return o;
  }
  function binOk(s) {
    if (!/^\d{12}$/.test(s) || /^(\d)\1{11}$/.test(s)) return false;
    var d = s.split('').map(Number), a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], b = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2], t = 0, i;
    for (i = 0; i < 11; i++) t += d[i] * a[i];
    var k = t % 11;
    if (k === 10) { t = 0; for (i = 0; i < 11; i++) t += d[i] * b[i]; k = t % 11; if (k === 10) return false; }
    return k === d[11];
  }
  var EMAIL = /^[^\s@<>()]+@[^\s@<>()]+\.[A-Za-z]{2,}$/;

  /* ── запись в родное поле Tilda ── */
  function setVal(el, v) {
    if (!el) return;
    var proto = el.tagName === 'TEXTAREA' ? W.HTMLTextAreaElement.prototype : W.HTMLInputElement.prototype;
    var ds = Object.getOwnPropertyDescriptor(proto, 'value');
    if (ds && ds.set) ds.set.call(el, v); else el.value = v;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: false })); } catch (e) {}
  }
  function nativePhone(f) { return q('.t-input-phonemask', f) || q('[name="tildaspec-phone-part[]"]', f); }
  function setPhone(f, ten) {
    var el = nativePhone(f); if (!el) return;
    var v = ten ? '(' + ten.slice(0, 3) + ') ' + ten.slice(3, 6) + '-' + ten.slice(6, 8) + '-' + ten.slice(8, 10) : PH_PHONE;
    el.focus && el.focus(); setVal(el, v);
  }
  function setMode(m) {      /* родные кнопки «Счёт / КП» скрыты нашим css, но в разметке есть: блок T123 сам перерисует поля */
    var b = q('#spDoc [data-d="' + m + '"]'); if (b) b.click();
  }

  /* ── панель ── */
  function html() {
    return '' +
      '<div class="вн-об ishp44__wrap">' +
      '<p class="ishp44__empty" id="ishp44empty" hidden>Или позвоните: ' + CT + '</p>' +
      '<div class="ishp44__sum" id="ishp44sum"></div>' +
      '<section class="ishp44__card ishp44__list" id="ishp44list" aria-labelledby="ishp44listH" hidden>' +
        '<h2 id="ishp44listH">Позиции</h2>' +
        '<p class="ishp44__lead" id="ishp44listL"></p>' +
        '<label class="ishp44__f" for="ishp44tx"><span>Список позиций</span><textarea id="ishp44tx" rows="6" placeholder="Название, модель или артикул и количество — каждая позиция с новой строки"></textarea></label>' +
        '<div class="ishp44__file"><button type="button" class="ishp44__btn ishp44__btn_ghost" id="ishp44fb">Выбрать файл</button><span class="ishp44__fn" id="ishp44fn">ТЗ, спецификация: PDF, Excel, Word или фото — необязательно</span><button type="button" class="ishp44__x" id="ishp44fx" hidden>Убрать</button></div>' +
        '<div class="ishp44__err" id="ishp44listE" role="alert"></div>' +
      '</section>' +
      '<div class="ishp44__grid" id="ishp44grid">' +
        '<section class="ishp44__card" id="ishp44kp" aria-labelledby="ishp44kpH">' +
          '<h2 id="ishp44kpH">Получить КП</h2>' +
          '<p class="ishp44__lead" id="ishp44kpL">Коммерческое предложение в PDF откроется сразу. Менеджер перезвонит и уточнит наличие.</p>' +
          '<label class="ishp44__f" for="ishp44ph"><span>Телефон</span><input id="ishp44ph" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 ___ ___ __ __" maxlength="17"></label>' +
          '<label class="ishp44__f" id="ishp44kpEmW" for="ishp44kpEm" hidden><span>Почта</span><input id="ishp44kpEm" type="email" inputmode="email" autocomplete="email" placeholder="name@company.kz"></label>' +
          '<div class="ishp44__err" id="ishp44kpE" role="alert"></div>' +
          '<button type="button" class="ishp44__btn" id="ishp44kpB">Получить КП</button>' +
          '<div class="ishp44__ok" id="ishp44kpOk" hidden></div>' +
        '</section>' +
        '<section class="ishp44__card ishp44__card_inv" id="ishp44inv" aria-labelledby="ishp44invH">' +
          '<h2 id="ishp44invH">Нужен счёт на оплату?</h2>' +
          '<p class="ishp44__lead" id="ishp44invL">Укажите БИН и почту. ' + ISH_SLA.inv() + '.</p>' +
          '<div class="ishp44__two">' +
            '<label class="ishp44__f" for="ishp44bin"><span>БИН / ИИН</span><input id="ishp44bin" type="text" inputmode="numeric" autocomplete="off" placeholder="12 цифр" maxlength="14"></label>' +
            '<label class="ishp44__f" for="ishp44em"><span>Почта</span><input id="ishp44em" type="email" inputmode="email" autocomplete="email" placeholder="name@company.kz"></label>' +
          '</div>' +
          '<label class="ishp44__f" for="ishp44co"><span>Название компании или ФИО</span><input id="ishp44co" type="text" autocomplete="organization" placeholder="ТОО «Название»"></label>' +
          '<div class="ishp44__err" id="ishp44invE" role="alert"></div>' +
          '<button type="button" class="ishp44__btn ishp44__btn_inv" id="ishp44invB">Выставить счёт</button>' +
        '</section>' +
      '</div>' +
      '<div class="ishp44__fin" id="ishp44fin" hidden></div>' +
      '<p class="ishp44__pd">Нажимая кнопку, вы соглашаетесь с <a href="/policy" target="_blank" rel="noopener">политикой обработки персональных данных</a>.</p>' +
      '</div>';
  }
  function render() {
    var t = totals(), s = q('#ishp44sum'); if (!s) return;
    var lm = listMode();
    var ls = q('#ishp44list'); if (ls) ls.hidden = !lm;
    var ew = q('#ishp44kpEmW'); if (ew) ew.hidden = !lm;
    var ll = q('#ishp44listL'); if (ll) ll.textContent = 'Название, модель или артикул — по одной позиции в строке. Проработаем и ' + ISH_SLA.replyLc() + '.';
    var kl = q('#ishp44kpL'); if (kl) kl.textContent = lm ? 'Подготовим коммерческое предложение по списку и пришлём на почту. Менеджер уточнит наличие.' : 'Коммерческое предложение в PDF откроется сразу. Менеджер перезвонит и уточнит наличие.';
    var kbt = q('#ishp44kpB'); if (kbt) { var kw = lm ? 'Прислать список на КП' : 'Получить КП'; if (kbt.textContent !== kw) kbt.textContent = kw; }
    var em0 = q('#ishp44empty'); if (em0) em0.hidden = !!(!lm || state.done);
    if (!t.it.length) { s.innerHTML = ''; }
    else if (state.done !== 'inv') s.innerHTML = '<span class="ishp44__sum-t">Итого по заказу</span><span class="ishp44__sum-n">' + t.it.length + ' поз. · ' + t.n + ' шт.</span>' +
      '<span class="ishp44__sum-v"><small>Итого с НДС</small><b>' + (t.noPrice ? 'без позиций «по запросу» ' : '') + money(t.sum) + '</b></span>';
    var inv = q('#ishp44invB'), L = q('#ishp44invL');
    if (inv) { inv.disabled = state.busy || !!t.noPrice; }
    if (L) L.textContent = lm ? 'Укажите БИН, почту и название. Подберём позиции и выставим счёт. ' + ISH_SLA.reply() + '.' : (t.noPrice ? 'В заказе есть позиция без цены: счёт выставим после того, как менеджер пришлёт цену.' : 'Укажите БИН и почту. ' + ISH_SLA.inv() + '.');
    var kb = q('#ishp44kpB'); if (kb) kb.disabled = state.busy;
    var fx = q('#ishp44fn'); if (fx) fileSync();
  }
  function err(which, msg) { var e = q(which === 'kp' ? '#ishp44kpE' : which === 'list' ? '#ishp44listE' : '#ishp44invE'); if (e) e.innerHTML = msg ? ct(msg) : ''; }

  /* ── пустая корзина: список позиций и файл ── */
  var FILE_FALLBACK = 'Файл (ТЗ, спецификацию) можно прислать в WhatsApp или на почту.';
  function nativeFile() { var f = form(); return f ? q('input[name="Файл"]', f) : null; }
  function fileVal() { var i = nativeFile(); return i ? String(i.value || '').trim() : ''; }
  function fileSync() {
    var n = q('#ishp44fn'), x = q('#ishp44fx'), b = q('#ishp44fb'); if (!n) return;
    var f = form(), w = f && q('.uploadcare--widget__button_type_open', f), v = fileVal();
    if (!w && !v) {          /* виджет файла не загрузился (Tilda подгружает его лениво): честный запасной путь */
      if (b) b.hidden = true; n.innerHTML = ct(FILE_FALLBACK + ' {CT}'); if (x) x.hidden = true; return;
    }
    if (b) b.hidden = false;
    if (v) { n.textContent = 'Файл прикреплён'; if (x) x.hidden = false; }
    else { var t = 'ТЗ, спецификация: PDF, Excel, Word или фото — необязательно'; if (n.textContent !== t) n.textContent = t; if (x) x.hidden = true; }
  }
  function fileOpen() {
    var f = form(), w = f && q('.uploadcare--widget__button_type_open', f);
    if (w) { try { w.click(); } catch (e) {} } else fileSync();
  }
  function fileDrop() {
    var f = form(), r = f && q('.uploadcare--widget__button_type_remove', f);
    if (r) { try { r.click(); } catch (e) {} }
    setTimeout(fileSync, 150);
  }
  /* «Уточнить по товару» из карточки (sessionStorage ishp10_ask), ?code= из бота, ?model=&art= - в поле списка, чужой текст не затираем */
  function askPrefill() {
    var tx = q('#ishp44tx'); if (!tx || tx.value.trim()) return;
    var d = null, line = '';
    try { var c = /[?&]code=([^&#]*)/.exec(location.search); if (c) { c = decodeURIComponent(c[1].replace(/\+/g, ' ')).replace(/[^0-9A-Za-zА-Яа-яЁё_-]/g, '').slice(0, 24); if (c) line = 'Код подбора: ' + c; } } catch (e) {}
    if (!line) {
      try { d = JSON.parse(sessionStorage.getItem('ishp10_ask') || 'null'); } catch (e) {}
      if (!(d && d.t && Date.now() - d.t < 3600 * 1000)) d = null;
      if (!d) { try { var m = /[?&]model=([^&]*)/.exec(location.search), a = /[?&]art=([^&]*)/.exec(location.search); if (m || a) d = { n: m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '', a: a ? decodeURIComponent(a[1].replace(/\+/g, ' ')) : '', p: 0 }; } catch (e) {} }
      if (d) {
        var parts = []; if (d.n) parts.push(d.n);
        if (d.a) parts.push(/^арт/i.test(d.a) ? d.a : 'Арт. iSoft ' + d.a);
        if (d.p > 0) parts.push(money(d.p));
        if (parts.length) line = 'Уточнить по товару: ' + parts.join(', ');
      }
    }
    if (!line) return;
    tx.value = line;
    try { sessionStorage.removeItem('ishp10_ask'); } catch (e) {}
  }
  /* общая проверка списка: текст или файл */
  function listCheck() {
    var tx = q('#ishp44tx'), txt = tx ? tx.value.replace(/[ \t]+/g, ' ').trim() : '';
    if (!txt && !fileVal()) { mark('ishp44tx', true); err('list', 'Напишите список позиций или приложите файл'); if (tx) tx.focus(); return null; }
    return txt;
  }
  function listComment(kind, txt, num) {      /* одна строка: разбор заявки читает «Тема запроса» первой строкой комментария, переносы в списке он теряет */
    var one = txt.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean).join(' / ').slice(0, 3000);
    return 'Тема запроса: Подбор техники · Просили: ' + (kind === 'kp' ? 'КП' : 'счёт') + ' · Заявка ' + num + (one ? ' · Список: ' + one : ' · Список во вложенном файле');
  }
  function showListFin(kind, em) {
    var g = q('#ishp44grid'), f = q('#ishp44fin'), l = q('#ishp44list'); if (!f) return;
    state.done = 'list';
    if (g) g.hidden = true;
    if (l) l.hidden = true;
    f.innerHTML = '<div class="ishp44__fin-ic" aria-hidden="true">✓</div><h2>Список принят</h2><p>Менеджер подберёт позиции и пришлёт ' + (kind === 'kp' ? 'КП' : 'счёт') + ' на <b>' + esc(em) + '</b>. ' + ISH_SLA.reply() + '. Если письма нет, проверьте папку «Спам» или позвоните ' + CT + '.</p>' +
      '<a class="ishp44__btn ishp44__btn_ghost" href="/#catalog">Вернуться в каталог</a>';
    f.hidden = false; render();
  }
  function listSend(kind) {
    err('list', ''); err('kp', ''); err('inv', ''); mark('ishp44tx', false);
    var txt = listCheck(); if (txt === null) return;
    var num = kpNum(), vals;
    if (kind === 'kp') {
      mark('ishp44ph', false); mark('ishp44kpEm', false);
      var ten = phone10(q('#ishp44ph').value), em = q('#ishp44kpEm').value.trim();
      if (ten.length !== 10) { mark('ishp44ph', true); err('kp', 'Укажите телефон: +7 700 000 00 00'); q('#ishp44ph').focus(); return; }
      if (!EMAIL.test(em)) { mark('ishp44kpEm', true); err('kp', 'Проверьте почту: адрес вида name@company.kz'); q('#ishp44kpEm').focus(); return; }
      vals = { phone: ten, email: em, comment: listComment('kp', txt, num) };
    } else {
      ['ishp44bin', 'ishp44em', 'ishp44co'].forEach(function (i) { mark(i, false); });
      var bin = digits(q('#ishp44bin').value), em2 = q('#ishp44em').value.trim(), co = q('#ishp44co').value.replace(/\s+/g, ' ').trim();
      if (bin.length !== 12) { mark('ishp44bin', true); err('inv', 'БИН или ИИН — 12 цифр, сейчас ' + bin.length); q('#ishp44bin').focus(); return; }
      if (!binOk(bin)) { mark('ishp44bin', true); err('inv', 'Проверьте БИН: последняя цифра не сходится'); q('#ishp44bin').focus(); return; }
      if (!EMAIL.test(em2)) { mark('ishp44em', true); err('inv', 'Проверьте почту: адрес вида name@company.kz'); q('#ishp44em').focus(); return; }
      if (co.length < 2) { mark('ishp44co', true); err('inv', 'Укажите название компании или ФИО: оно нужно для счёта'); q('#ishp44co').focus(); return; }
      var t2 = phone10(q('#ishp44ph').value);
      vals = { company: co, bin: bin, email: em2, phone: t2.length === 10 ? t2 : '', comment: listComment('inv', txt, num) };
    }
    var where = kind === 'kp' ? 'kp' : 'inv', em9 = vals.email;
    busy(true); guardClear(false);
    submit(kind, vals, function () {
      busy(false); showListFin(kind, em9); track('ish_p44_list_' + (kind === 'kp' ? 'kp' : 'invoice'), { items: txt ? txt.split(/\n/).filter(function (x) { return x.trim(); }).length : 0, file: fileVal() ? 1 : 0 });
    }, function (m) { busy(false); err(where, m || 'Не удалось отправить. Позвоните {CT}.'); });
  }
  function mark(id, bad) { var e = q('#' + id); if (e) { e.classList.toggle('ishp44__bad', !!bad); e.setAttribute('aria-invalid', bad ? 'true' : 'false'); } }

  /* ── отправка через родную форму Tilda ── */
  function form() { return D.getElementById(FID); }
  function guardClear(on) {
    /* Tilda после успеха стирает корзину (tildaForm.clearTCart). После «Получить КП» корзина нужна для счёта: на это время гасим очистку. */
    try {
      var tf = W.tildaForm; if (!tf) return;
      if (!tf.__ishp44) { tf.__ishp44 = tf.clearTCart; tf.clearTCart = function () { if (W.__ishp44keep) return; return tf.__ishp44.apply(this, arguments); }; }
      W.__ishp44keep = on ? 1 : 0;
    } catch (e) {}
  }
  function consent(f) {
    var cb = q('input[type="checkbox"]', f);
    if (cb && !cb.checked) { cb.click(); if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); } }
  }
  function nativeErrors(f) {
    var m = [];
    [].forEach.call(f.querySelectorAll('.t-input-error, .t-form__errorbox-item, .js-rule-error'), function (e) {
      var s = (e.textContent || '').replace(/\s+/g, ' ').trim();
      if (s && e.offsetParent !== null || (s && getComputedStyle(e).display !== 'none')) m.push(s);
    });
    return m.filter(function (x, i) { return m.indexOf(x) === i; }).slice(0, 2);
  }
  function submit(kind, vals, onOk, onFail) {
    var f = form();
    if (!f) { onFail('Форма не загрузилась. Обновите страницу или позвоните {CT}.'); return; }
    var done = false, timer;
    function ok() { if (done) return; done = true; clearTimeout(timer); D.removeEventListener('tildaform:aftersuccess', h); onOk(); }
    function h(e) { if (e.target && e.target.id === FID) ok(); }
    D.addEventListener('tildaform:aftersuccess', h);
    setMode(kind === 'kp' ? 'kp' : 'inv');
    setTimeout(function () {
      var F = form(); if (!F) { onFail('Форма не загрузилась. Позвоните {CT}.'); return; }
      var set = function (sel, v) { var el = q(sel, F); if (el) setVal(el, v); };
      set('[name^="Компания"]', vals.company || PH_COMPANY);
      set('[name="Email"]', vals.email || PH_EMAIL);
      setPhone(F, vals.phone);
      var bin = q('[name^="БИН"]', F); if (bin) { setVal(bin, vals.bin || ''); }
      var nm = q('[name="Name"]', F); if (nm) { nm.removeAttribute('data-tilda-req'); nm.removeAttribute('aria-required'); }
      var cm = q('[name^="Комментарий"]', F); if (cm) setVal(cm, vals.comment || '');
      consent(F);
      var sb = q('[type="submit"]', F) || q('.t-submit', F);
      if (!sb) { onFail('Кнопка отправки не найдена. Позвоните {CT}.'); return; }
      sb.click();
      var n = 0;
      (function watch() {                /* 25 с: успех придёт событием; ошибки проверки Tilda рисует в скрытой форме - переносим текст */
        if (done) return;
        n++;
        var e = nativeErrors(F);
        if (e.length && n > 2) { done = true; D.removeEventListener('tildaform:aftersuccess', h); onFail(e.join(' · ') + ' Не получается? Позвоните {CT}.'); return; }
        if (n > 100) { done = true; D.removeEventListener('tildaform:aftersuccess', h); onFail('Нет ответа от сервера. Проверьте интернет и повторите или позвоните {CT}.'); return; }
        timer = setTimeout(watch, 250);
      })();
    }, 450);
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function kpNum() {      /* короткий номер КП с сайта: «С-ДДЧЧММ» (кириллическая С); вторая за ту же минуту в этом браузере - «-2», «-3» */
    var d = new Date(), base = 'С-' + pad2(d.getDate()) + pad2(d.getHours()) + pad2(d.getMinutes()), n = 1, last = '';
    try { last = localStorage.getItem('ishp44_kpn') || ''; } catch (e) {}
    if (last === base) n = 2; else if (last.indexOf(base + '-') === 0) n = (parseInt(last.slice(base.length + 1), 10) || 1) + 1;
    var num = n > 1 ? base + '-' + n : base;
    try { localStorage.setItem('ishp44_kpn', num); } catch (e) {}
    return num;
  }
  function busy(on) { state.busy = on; render(); var b = q('#ishp44kpB'), c = q('#ishp44invB'); [b, c].forEach(function (x) { if (x) x.classList.toggle('ishp44__wait', on); }); }

  function doKp() {
    if (listMode()) { listSend('kp'); return; }
    err('kp', ''); mark('ishp44ph', false);
    var t = totals(); if (!t.it.length) { err('kp', 'В заказе нет позиций. Добавьте товар из каталога.'); return; }
    var ten = phone10(q('#ishp44ph').value);
    if (ten.length !== 10) { mark('ishp44ph', true); err('kp', 'Укажите телефон: +7 700 000 00 00'); q('#ishp44ph').focus(); return; }
    busy(true);
    var num = kpNum(); state.num = num;
    var pdfP = new Promise(function (ok, no) {      /* модуль грузится заранее; если ещё нет - ждём до 4 с */
      var n = 0; (function w() { if (W.ishKpPdf) return ok(); if (++n > 40) return no(new Error('нет модуля КП')); setTimeout(w, 100); })();
    }).then(function () { return W.ishKpPdf.build({ items: t.it, num: num, phone: phoneFmt(ten) }); });
    pdfP.then(function (pdf) {
      state.pdf = pdf;
      guardClear(true);
      submit('kp', { phone: ten, comment: '[Документ: Лид КП] ' + num }, function () {
        state.done = 'kp'; busy(false); showKpOk(pdf); track('ish_p44_kp', { value: t.sum, items: t.it.length, currency: 'KZT' });
      }, function (m) { busy(false); showKpOk(pdf, m); });
    }, function () {
      /* PDF не собрался (нет сети до файлов): заявку всё равно отправляем, менеджер пришлёт КП сам */
      guardClear(true);
      submit('kp', { phone: ten, comment: '[Документ: Лид КП] ' + num + ' (PDF на сайте не собрался)' }, function () {
        state.done = 'kp'; busy(false); showKpOk(null);
      }, function (m) { busy(false); err('kp', m || 'Не удалось отправить. Позвоните {CT}.'); });
    });
  }
  function showKpOk(pdf, warn) {
    var o = q('#ishp44kpOk'); if (!o) return;
    var a = pdf ? '<a class="ishp44__lnk" href="' + pdf.url + '" target="_blank" rel="noopener">Открыть КП (PDF)</a><a class="ishp44__lnk ishp44__lnk_2" href="' + pdf.url + '" download="' + esc(pdf.filename) + '">Скачать</a>' : '';
    o.innerHTML = '<b>' + (warn ? 'КП готово, но заявка не ушла' : (pdf ? 'КП готово' : 'Заявка принята')) + '</b>' +
      '<span>' + (warn ? ct((warn.indexOf('{CT}') < 0 ? warn + ' Позвоните {CT}.' : warn) + ' Скачайте КП.') : (pdf ? 'Менеджер скоро позвонит. Счёт можно выставить ниже.' : 'Менеджер скоро позвонит и пришлёт КП.')) + '</span>' + a;
    o.hidden = false; o.classList.toggle('ishp44__ok_warn', !!warn);
    if (pdf && !warn) { try { var l = o.querySelector('[download]'); if (l) l.click(); } catch (e) {} }   /* скачивание сразу; ссылки остаются на экране */
  }

  function doInv() {
    if (listMode()) { listSend('inv'); return; }
    err('inv', ''); ['ishp44bin', 'ishp44em', 'ishp44co'].forEach(function (i) { mark(i, false); });
    var t = totals(); if (!t.it.length) { err('inv', 'В заказе нет позиций. Добавьте товар из каталога.'); return; }
    if (t.noPrice) { err('inv', 'В заказе есть позиция без цены: счёт выставим после ответа менеджера.'); return; }
    var bin = digits(q('#ishp44bin').value), em = q('#ishp44em').value.trim(), co = q('#ishp44co').value.replace(/\s+/g, ' ').trim();
    if (bin.length !== 12) { mark('ishp44bin', true); err('inv', 'БИН или ИИН — 12 цифр, сейчас ' + bin.length); q('#ishp44bin').focus(); return; }
    if (!binOk(bin)) { mark('ishp44bin', true); err('inv', 'Проверьте БИН: последняя цифра не сходится'); q('#ishp44bin').focus(); return; }
    if (!EMAIL.test(em)) { mark('ishp44em', true); err('inv', 'Проверьте почту: адрес вида name@company.kz'); q('#ishp44em').focus(); return; }
    if (co.length < 2) { mark('ishp44co', true); err('inv', 'Укажите название компании или ФИО: оно нужно для счёта'); q('#ishp44co').focus(); return; }
    var ten = phone10(q('#ishp44ph').value);
    busy(true); guardClear(false);
    submit('inv', { company: co, bin: bin, email: em, phone: ten.length === 10 ? ten : '', comment: state.kpLink ? '[Основание: КП № ' + state.kpLink + ']' : '' }, function () {
      state.done = 'inv'; busy(false); showInvOk(em); track('ish_p44_invoice', { value: t.sum, items: t.it.length, currency: 'KZT' });
    }, function (m) { busy(false); err('inv', m || 'Не удалось отправить. Позвоните {CT}.'); });
  }
  function showInvOk(em) {
    var g = q('#ishp44grid'), f = q('#ishp44fin'); if (!f) return;
    if (g) g.hidden = true;
    f.innerHTML = '<div class="ishp44__fin-ic" aria-hidden="true">✓</div><h2>Счёт выставляем</h2><p>' + ISH_SLA.inv('<b>' + esc(em) + '</b>') + '. Если письма нет, проверьте папку «Спам» или позвоните ' + CT + '.</p>' +
      '<a class="ishp44__btn ishp44__btn_ghost" href="/#catalog">Вернуться в каталог</a>';
    f.hidden = false;
    var s = q('#ishp44sum'); if (s) s.innerHTML = '';
  }

  /* ── сборка ── */
  function build() {
    var root = D.getElementById('specRoot'), body = D.getElementById('spBody');
    if (!root || !body) return false;
    if (D.getElementById('ishp44')) return true;
    var p = D.createElement('div'); p.id = 'ishp44'; p.className = 'ishp44'; p.innerHTML = html();
    body.parentNode.insertBefore(p, body.nextSibling);
    var ph = q('#ishp44ph');
    ph.addEventListener('input', function () { var d = phone10(ph.value); ph.value = phoneFmt(d); mark('ishp44ph', false); err('kp', ''); });
    ph.addEventListener('focus', function () { if (!ph.value) ph.value = '+7 '; });
    ph.addEventListener('blur', function () { if (ph.value === '+7 ' || ph.value === '+7') ph.value = ''; });
    var bn = q('#ishp44bin'); bn.addEventListener('input', function () { bn.value = digits(bn.value).slice(0, 12); mark('ishp44bin', false); err('inv', ''); });
    ['ishp44em', 'ishp44co'].forEach(function (i) { q('#' + i).addEventListener('input', function () { mark(i, false); err('inv', ''); }); });
    q('#ishp44tx').addEventListener('input', function () { mark('ishp44tx', false); err('list', ''); });
    q('#ishp44kpEm').addEventListener('input', function () { mark('ishp44kpEm', false); err('kp', ''); });
    q('#ishp44fb').addEventListener('click', fileOpen);
    q('#ishp44fx').addEventListener('click', fileDrop);
    askPrefill();
    q('#ishp44kpB').addEventListener('click', doKp);
    q('#ishp44invB').addEventListener('click', doInv);
    [['ishp44ph', doKp], ['ishp44kpEm', doKp], ['ishp44bin', doInv], ['ishp44em', doInv], ['ishp44co', doInv]].forEach(function (x) {
      q('#' + x[0]).addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); x[1](); } });
    });
    /* заголовок страницы: «Ваш заказ», лишние подписи убираем css; сам h1 меняем текстом */
    fixH1();
    /* КП из корзины: подгружаем PDF-модуль заранее, чтобы после нажатия не ждать */
    if (BASE && !W.ISH_KP_PDF_OFF && !q('#ishp44-pdf')) {
      var s = D.createElement('script'); s.id = 'ishp44-pdf'; s.defer = true; s.src = BASE + 'ish-kp-pdf.js?v=' + VER; D.head.appendChild(s);
    }
    render();
    return true;
  }
  function fixH1() {      /* «Корзина» -> «Ваш заказ»; пустая корзина -> «Пришлите список» */
    var h = q('#specRoot h1'); if (!h) return;
    var cur = h.textContent.trim(), want = listMode() ? 'Пришлите список' : 'Ваш заказ';
    if ((cur === 'Корзина' || cur === 'Ваш заказ' || cur === 'Пришлите список') && cur !== want) h.textContent = want;
  }
  function fixNote() {     /* сноска под списком блока T123 дописывает «КП/счёт придёт на почту…» по режиму - оставляем только про цены */
    [].forEach.call(D.querySelectorAll('#spBody p.вн-тихо'), function (e) {
      if (/^Цены указаны с НДС/.test(e.textContent) && e.textContent.length > 60) e.textContent = 'Цены указаны с НДС и действуют на момент отображения.';
    });
  }
  until(build, 80, 250);
  setInterval(function () { try { fixH1(); render(); fixNote(); } catch (e) {} }, 900);
  /* #kp=номер~поз~поз (ссылка «Выставить счёт» из PDF-КП, формат - ish-kp-pdf.js specLink): поз = sku_qty[_цена[_имя[_uid]]], поля через encodeURIComponent.
     Корзина Tilda пуста (другое устройство, бухгалтер) -> кладём позиции в неё через tcart__addProduct: дальше всё как обычно (список, итог, форма счёта).
     Корзина не пуста -> не трогаем. Данные из ссылки чужие: числа в рамках, имя без разметки. */
  function kpParse(h) {
    var m = /^#kp=(.+)$/.exec(h || ''); if (!m) return null;
    var P = m[1].split('~'), dec = function (x) { try { return decodeURIComponent(x); } catch (e) { return ''; } }, num = dec(P[0]).slice(0, 30), out = [];
    P.slice(1, 101).forEach(function (r) {
      var f = r.split('_').map(dec), sku = (f[0] || '').slice(0, 40), qty = Math.round(Number(f[1])), price = Math.round(Number(f[2])) || 0;
      if (!sku || !(qty >= 1 && qty <= 9999) || !(price >= 0 && price < 1e9)) return;
      var name = (f[3] || '').replace(/[<>"&`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || sku;
      out.push({ sku: sku, qty: qty, price: price, name: name, uid: (f[4] || '').slice(0, 60) || 'kp_' + sku });
    });
    return out.length ? { num: num, it: out } : null;
  }
  function kpFill() {
    var d = kpParse(location.hash); if (!d) return false;
    var tries = 0;
    (function go() {
      var ready = typeof W.tcart__addProduct === 'function' && D.getElementById('ishp44');
      if (!ready) { if (++tries < 60) return setTimeout(go, 250); return; }
      var ls = 0; try { ls = (JSON.parse(localStorage.getItem('tcart') || '{}').products || []).filter(function (p) { return p && p.deleted !== 'yes' && Number(p.quantity) > 0; }).length; } catch (e) {}
      if (items().length || ls) return;                       /* корзина не пуста: ничего не трогаем */
      d.it.forEach(function (x) {
        try { W.tcart__addProduct({ name: x.name, price: String(x.price), quantity: x.qty, amount: x.price * x.qty, sku: x.sku, uid: x.uid, single: 'y' }); } catch (e) {}
      });
      state.kpLink = d.num || 'без номера';
      var p = D.getElementById('ishp44'), w = q('.ishp44__wrap', p);
      if (w && !q('#ishp44src')) { var n = D.createElement('p'); n.id = 'ishp44src'; n.className = 'ishp44__lead'; n.textContent = 'Позиции из КП' + (d.num ? ' № ' + d.num : '') + '. Укажите БИН и почту, и мы выставим счёт.'; w.insertBefore(n, w.firstChild); }
      setTimeout(function () { render(); try { typeof W.tcart__reDrawProducts === 'function' && W.tcart__reDrawProducts(); typeof W.tcart__updateTotalProductsinCartObj === 'function' && W.tcart__updateTotalProductsinCartObj(); } catch (e) {} try { p.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 400);
    })();
    return true;
  }
  if (/^#kp=/.test(location.hash)) kpFill();
  /* #kp в адресе (из карточки): прокрутить к панели, когда она появится */
  if (location.hash === '#kp') until(function () { var p = D.getElementById('ishp44'); if (!p || !items().length) return false; setTimeout(function () { try { var ph = q('#ishp44ph'); p.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 700); return true; }, 40, 250);
})();
