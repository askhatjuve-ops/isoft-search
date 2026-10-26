/* ish-kp-pdf.js  v4 (26.10.2026: кнопка «Выставить счёт» = /spec#kp=номер~позиции (счёт открывается на любом устройстве без корзины); прежняя v3: + подпись и печать в блоке «Исполнитель» (ish-kp-sign.png, ish-kp-stamp.png; позиции как в кп_бланк.py); v2: (26.10.2026: макет как у фирменного КП кп_бланк.py, логотип ish-kp-logo.png, ссылки WhatsApp/бот/звонок/каталог; v1  КП в PDF прямо в браузере для страницы /spec b2b.isoft-shop.kz
   Грузится по требованию из ish-design-p44.js (по нажатию «Получить КП»), сам ничего не делает.
   API: window.ishKpPdf.build({items:[{name,sku,qty,price}], num, date}) -> Promise<{blob, url, filename, total, vat}>
   Библиотека jsPDF 2.5.1 (MIT) лежит рядом: ish-kp-jspdf.min.js. Шрифт - подмножество DejaVu Sans (свободная лицензия, кириллица, ₸):
   ish-kp-sans.ttf / ish-kp-sans-b.ttf (переименованы, т.к. подмножество). Сеть наружу не нужна, всё с того же адреса.
   Данные КП не уходят никуда: PDF собирается в памяти страницы. Выключатель: window.ISH_KP_PDF_OFF = 1. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ishKpPdf) return;
  var tag = D.currentScript;
  var BASE = (tag && tag.src ? tag.src : (W.__ishKpBase || '')).replace(/ish-kp-pdf\.js.*$/, '');
  var VER = (tag && /[?&]v=([^&]*)/.exec(tag.src || '') || [0, '1'])[1];
  var ISP = 'ТОО «ISOFT Казахстан»', BIN = '130240003176', TEL = '+7 775 881 85 31', MAIL = 'astana@i-soft.kz', SITE = 'b2b.isoft-shop.kz';

  function loadScript(src) {
    return new Promise(function (ok, no) {
      var s = D.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { no(new Error('не загрузился ' + src)); };
      D.head.appendChild(s);
    });
  }
  function fontB64(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('шрифт ' + r.status); return r.arrayBuffer(); }).then(function (b) {
      var a = new Uint8Array(b), s = '', i, n = 0x8000;
      for (i = 0; i < a.length; i += n) s += String.fromCharCode.apply(null, a.subarray(i, i + n));
      return btoa(s);
    });
  }
  var ready = null;
  function init() {
    if (ready) return ready;
    ready = Promise.all([
      W.jspdf ? 0 : loadScript(BASE + 'ish-kp-jspdf.min.js?v=' + VER),
      fontB64(BASE + 'ish-kp-sans.ttf?v=' + VER), fontB64(BASE + 'ish-kp-sans-b.ttf?v=' + VER)
    ]).then(function (r) { return { reg: r[1], bold: r[2] }; });
    ready.catch(function () { ready = null; });
    return ready;
  }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function dstr(d) { return p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + d.getFullYear(); }
  function plusWork(d, n) {                     /* +n банковских дней (пн-пт; праздников не знаем, как и в письме КП) */
    var x = new Date(d.getTime());
    while (n > 0) { x.setDate(x.getDate() + 1); var w = x.getDay(); if (w !== 0 && w !== 6) n--; }
    return x;
  }
  function cleanName(s, sku) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (sku) s = s.split('(' + sku + ')').join(' ').split('[' + sku + ']').join(' ');
    return s.replace(/\s*\([A-Z0-9]{6,}\)\s*$/, '').replace(/\s{2,}/g, ' ').trim();
  }

  function loadImg(name) {                                /* картинка -> data URL + размеры; нет файла - null, КП всё равно собираем */
    return fetch(BASE + name + '?v=' + VER).then(function (r) { if (!r.ok) throw new Error(name); return r.blob(); }).then(function (b) {
      return new Promise(function (ok, no) {
        var fr = new FileReader(); fr.onerror = no;
        fr.onload = function () { var im = new Image(); im.onload = function () { ok({ d: fr.result, w: im.naturalWidth, h: im.naturalHeight }); }; im.onerror = no; im.src = fr.result; };
        fr.readAsDataURL(b);
      });
    }).catch(function () { return null; });
  }
  var logo = null, stamp = null, sign = null;
  function loadLogo() {                                   /* логотип ISOFT (тот же файл, что в фирменном КП ноутбука) */
    if (!logo) logo = loadImg('ish-kp-logo.png');
    return logo;
  }
  function loadStamp() { if (!stamp) stamp = loadImg('ish-kp-stamp.png'); return stamp; }
  function loadSign() { if (!sign) sign = loadImg('ish-kp-sign.png'); return sign; }
  /* Ссылка «Выставить счёт»: SITE_URL/spec#kp=<номер>~<поз>~<поз>..., поз = sku_qty_цена_имя_uid; каждое поле через encodeURIComponent
     («_» и «~» в полях экранируются), длина всей ссылки <= LINK_MAX: сначала короче имена, потом без имён (sku_qty_цена), потом sku_qty.
     Читает ish-design-p44.js (разбор #kp=) - формат менять только вместе с ним. */
  var LINK_MAX = 1800;
  function fenc(v) { return encodeURIComponent(String(v == null ? '' : v)).replace(/[_~()!*']/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); }); }
  function specLink(items, num) {
    var base = SITE_URL + '/spec#kp=' + fenc(num || '');
    function mk(cut, mode) {
      return items.map(function (it) {
        var q = Math.max(1, Math.round(Number(it.qty) || 1)), p = Math.max(0, Math.round(Number(it.price) || 0)), sku = String(it.sku || '');
        var nm = cleanName(it.name, sku).replace(/[<>"&`]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cut && nm.length > cut) nm = nm.slice(0, cut).trim();
        var f = mode === 3 ? [sku, q] : mode === 2 ? [sku, q, p] : mode === 1 ? [sku, q, p, nm] : [sku, q, p, nm, it.uid || ''];
        if (mode === 0 && !f[4]) f.pop();
        return f.map(fenc).join('_');
      });
    }
    var tries = [[0, 0], [60, 1], [40, 1], [24, 1], [12, 1], [0, 2], [0, 3]], i, u;
    for (i = 0; i < tries.length; i++) {
      u = base + (items.length ? '~' : '') + mk(tries[i][0], tries[i][1]).join('~');
      if (u.length <= LINK_MAX) return u;
    }
    return SITE_URL + '/spec';                              /* не влезло даже sku_qty: обычная ссылка, как раньше */
  }
  var WA = 'https://wa.me/77758818531', BOT = 'https://t.me/isoft_b2b_kz_bot', SITE_URL = 'https://b2b.isoft-shop.kz', TEL_URL = 'tel:+77758818531';

  function build(o) {
    return Promise.all([init(), loadLogo(), loadStamp(), loadSign()]).then(function (r) {
      var f = r[0], lg = r[1], st = r[2], sg = r[3];
      var J = W.jspdf.jsPDF, doc = new J({ unit: 'mm', format: 'a4', compress: true });
      doc.addFileToVFS('S.ttf', f.reg); doc.addFont('S.ttf', 'S', 'normal');
      doc.addFileToVFS('SB.ttf', f.bold); doc.addFont('SB.ttf', 'S', 'bold');
      doc.setProperties({ title: 'Коммерческое предложение КП № ' + o.num, author: ISP, subject: 'Коммерческое предложение', creator: 'iSoft КП (сайт)' });
      var date = o.date || new Date(), until = plusWork(date, 3), items = o.items || [];
      var PW = 210, M = 15, R = PW - M, Wd = R - M, y;
      /* палитра и макет - из фирменного КП ноутбука (кп_бланк.py) */
      var KB = [43, 68, 199], INK = [23, 25, 35], SEC = [86, 93, 112], LINE = [221, 225, 236], ZEB = [245, 247, 252], CARD = [244, 246, 252], WHITE = [255, 255, 255];
      function txt(s, x, yy, size, bold, color, align) {
        doc.setFont('S', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor.apply(doc, color || INK);
        doc.text(String(s), x, yy, align ? { align: align } : undefined);
      }
      function box(x, yy, w, h, fill, stroke, r) {
        doc.setFillColor.apply(doc, fill); if (stroke) { doc.setDrawColor.apply(doc, stroke); doc.setLineWidth(0.25); }
        doc.roundedRect(x, yy, w, h, r || 2.5, r || 2.5, stroke ? 'FD' : 'F');
      }
      function btn(t, url, x, yy, w, h, main, size) {
        if (main) box(x, yy, w, h, KB, null, 2); else box(x, yy, w, h, WHITE, [197, 203, 218], 2);
        txt(t, x + w / 2, yy + h / 2 + size * 0.14, size, true, main ? WHITE : INK, 'center');
        doc.link(x, yy, w, h, { url: url });
      }
      function card(x, yy, w, h, label, rows) {
        box(x, yy, w, h, CARD, LINE, 3);
        txt(label, x + 4, yy + 5.5, 7, true, SEC);
        var ty = yy + 10.5; rows.forEach(function (r) { txt(r[0], x + 4, ty, r[2], r[1], r[3]); ty += 4.6; });
      }
      /* 1) шапка: логотип слева, справа полоска, «КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ», номер, дата */
      y = 11;
      if (lg) { var lw = 40, lh = lw * lg.h / lg.w; doc.addImage(lg.d, 'PNG', M, y, lw, lh); }
      else txt(ISP, M, y + 8, 14, true, KB);
      box(R - 14, y + 0.2, 14, 1.3, KB, null, 0.6);
      txt('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', R, y + 6, 7.5, true, SEC, 'right');
      txt('КП № ' + o.num, R, y + 13.5, 19, true, INK, 'right');
      txt('от ' + dstr(date), R, y + 18.5, 9, false, SEC, 'right');
      y += 24;
      /* 2) КОМУ / ОТ */
      var w1 = (Wd - 4) / 2;
      card(M, y, w1, 22, 'КОМУ', [['Клиент сайта', true, 10.5, INK], [o.phone || '', false, 9, SEC]]);
      card(M + w1 + 4, y, w1, 22, 'ОТ', [[ISP, true, 10.5, INK], ['БИН ' + BIN, false, 9, SEC], [SITE, false, 9, KB]]);
      doc.link(M + w1 + 8, y + 15.5, 40, 5, { url: SITE_URL });
      y += 26;
      /* 3) итог + главная кнопка */
      var total = 0, noPrice = 0;
      items.forEach(function (it) { var pr = Number(it.price) || 0; total += pr * (Number(it.qty) || 1); if (!(pr > 0)) noPrice++; });
      var vat = Math.round(total * 16 / 116 * 100) / 100;
      box(M, y, Wd, 30, WHITE, LINE, 3);
      txt('ИТОГО К ОПЛАТЕ', M + 5, y + 6, 7, true, SEC);
      txt(money(total) + ' ₸', M + 5, y + 17.5, 26, true, KB);
      txt('в том числе НДС 16%: ' + money(vat) + ' ₸', M + 5, y + 23.5, 8.5, false, SEC);
      txt('Действительно до ' + dstr(until) + ' (3 банковских дня)', M + 5, y + 27.6, 8.5, true, INK);
      var bw = 62, bh = 13, bx = R - bw - 5, by = y + 5;
      btn('Выставить счёт', specLink(items, o.num), bx, by, bw, bh, true, 12);
      txt('на странице заказа или в Telegram-боте', bx + bw / 2, by + bh + 4, 7.5, false, SEC, 'center');
      txt('Предложение не является счётом', bx + bw / 2, by + bh + 7.4, 7.5, false, SEC, 'center');
      y += 33;
      /* 4) вторичные кнопки */
      var ws3 = Wd - 38 * 2 - 48 - 9, bxx = M;
      [['WhatsApp', WA + '?text=' + encodeURIComponent('КП № ' + o.num), 38], ['Telegram-бот', BOT, 38], ['Позвонить ' + TEL, TEL_URL, 48], ['Каталог на сайте', SITE_URL, ws3]].forEach(function (b) {
        btn(b[0], b[1], bxx, y, b[2], 8.5, false, 7.8); bxx += b[2] + 3;
      });
      y += 8.5 + 6;
      /* 5) таблица в кобальтовой шапке */
      var cx = { n: M + 4.5, name: M + 9 + 4, price: R - 32 - 4, sum: R - 4 }, qtyC = R - 32 - 29 - 18 / 2;
      var nameW = Wd - 9 - 18 - 29 - 32 - 8;
      function th() {
        box(M, y, Wd, 8, KB, null, 2.5); doc.setFillColor.apply(doc, KB); doc.rect(M, y + 4, Wd, 4, 'F');
        var ty = y + 5.3;
        txt('№', cx.n, ty, 8.5, true, WHITE, 'center'); txt('Наименование', cx.name, ty, 8.5, true, WHITE);
        txt('Кол-во', qtyC, ty, 8.5, true, WHITE, 'center'); txt('Цена, ₸', cx.price, ty, 8.5, true, WHITE, 'right'); txt('Сумма, ₸', cx.sum, ty, 8.5, true, WHITE, 'right');
        y += 8;
      }
      th();
      items.forEach(function (it, i) {
        var nm = cleanName(it.name, it.sku), lines = doc.setFont('S', 'bold').setFontSize(9).splitTextToSize(nm, nameW), h = lines.length * 4.4 + (it.sku ? 4 : 0) + 6;
        if (y + h > 255) { doc.addPage(); y = 15; th(); }
        if (i % 2) { doc.setFillColor.apply(doc, ZEB); doc.rect(M, y, Wd, h, 'F'); }
        var price = Number(it.price) || 0, qty = Number(it.qty) || 1, ty = y + 6;
        txt(i + 1, cx.n, ty, 9, false, INK, 'center');
        doc.setFont('S', 'bold').setFontSize(9).setTextColor.apply(doc, INK); doc.text(lines, cx.name, ty);
        if (it.sku) txt('арт. ' + it.sku, cx.name, ty + lines.length * 4.4 - 0.4, 7.8, false, SEC);
        txt(qty + ' шт.', qtyC, ty, 9, false, INK, 'center');
        txt(price > 0 ? money(price) : 'по запросу', cx.price, ty, 9, false, INK, 'right');
        txt(price > 0 ? money(price * qty) : '—', cx.sum, ty, 9, true, INK, 'right');
        y += h; doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.2); doc.line(M, y, R, y);
      });
      y += 7;
      /* 6) условия (формулировки кп_общее.УСЛОВИЯ; пункт про счёт - для КП с сайта) */
      if (y > 232) { doc.addPage(); y = 18; }
      txt('Условия', M, y, 9, true, INK); y += 5;
      var cond = [
        'Предложение действительно 3 банковских дня — до ' + dstr(until) + '.',
        'Предложение не является счётом на оплату.',
        'Счёт: на странице заказа ' + SITE + '/spec или в Telegram-боте.',
        'Цены в тенге, с НДС 16%.',
        noPrice ? 'Позиции «по запросу» в итог не входят: цену пришлёт менеджер.' : '',
        'Доставка по Казахстану бесплатна. Гарантию обслуживаем сами.'
      ].filter(Boolean);
      cond.forEach(function (c) { doc.setFont('S', 'normal').setFontSize(9).setTextColor.apply(doc, INK); var ls = doc.splitTextToSize(c, Wd - 5); doc.text('•', M, y); doc.text(ls, M + 4, y); y += ls.length * 4.3 + 1; });
      y += 12;
      if (y > 262) { doc.addPage(); y = 30; }
      txt('Исполнитель', M, y, 9, true, INK); doc.setDrawColor.apply(doc, INK); doc.setLineWidth(0.3); doc.line(M + 26, y + 0.8, M + 96, y + 0.8); txt(ISP, M + 99, y, 7.5, false, SEC);
      /* подпись (32 мм, на 35 % линии) и печать (30 мм по центру линии) поверх, как в кп_бланк.py */
      try {
        if (sg) { var sw = 32, sh = sw * sg.h / sg.w; doc.addImage(sg.d, 'PNG', M + 26 + 70 * 0.35 - sw / 2, y + 0.8 - 1 - sh / 2, sw, sh); }
        if (st) { var tw = 30, th = tw * st.h / st.w; doc.addImage(st.d, 'PNG', M + 61 - tw / 2, y + 0.8 - 1 - th / 2, tw, th); }
      } catch (e) {}
      /* 7) подвал каждой страницы */
      var pages = doc.getNumberOfPages(), i, y0 = 274;
      for (i = 1; i <= pages; i++) {
        doc.setPage(i); doc.setDrawColor.apply(doc, LINE); doc.setLineWidth(0.25); doc.line(M, y0 - 4, R, y0 - 4);
        txt(SITE, M, y0 + 1, 9, true, KB); doc.link(M, y0 - 2.5, 38, 5, { url: SITE_URL });
        txt('WhatsApp и Telegram: ' + TEL, M, y0 + 6, 7.8, false, INK);
        txt('Телефон: ' + TEL + '  ·  ' + MAIL, M, y0 + 10, 7.8, false, INK);
        txt(ISP + ' · БИН ' + BIN, R, y0 + 1, 7.5, false, SEC, 'right');
        txt('Цены в тенге, с НДС 16%', R, y0 + 5.5, 7.5, false, SEC, 'right');
        txt('стр. ' + i + '/' + pages, R, y0 + 10, 7.5, true, SEC, 'right');
      }
      var blob = doc.output('blob'), filename = 'KP-iSoft-' + String(o.num).replace(/[^0-9A-Za-zА-Яа-я-]/g, '') + '.pdf';
      return { blob: blob, url: URL.createObjectURL(blob), filename: filename, total: total, vat: vat, until: dstr(until) };
    });
  }
  W.ishKpPdf = { build: build, init: init, plusWork: plusWork, specLink: specLink };
})();
