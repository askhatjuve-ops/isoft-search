/* ish-design-p23.js  v1.2  (кандидат 17.10.2026, волна 3: ступени 01-05 вместо полосы, финал на индиго-карточке; логика и поля формы НЕ менялись; v1.1: П27 тексты приглашения)  П23 «Квиз Подбор техники» (Г17)  b2b.isoft-shop.kz
   Внешний слой. Грузится из ish-design-p4.js (строка в README). Ничего не пишет в Tilda, блоки не правит.
   Выключатель: window.ISH_P23_OFF = 1.   Открыть из любого места: window.ISHP23.open()  или  ссылка/кнопка с  data-ishp23-open  или  адрес  #kviz.
   Что делает:
     1. Ставит секцию-приглашение «Подобрать технику за 1 минуту» после блока «Для кого» (П8, #ishp8-c); нет П8 - перед блоком формы.
     2. Окно поверх страницы (на телефоне на весь экран): 4 вопроса + контакт. В каждом вопросе есть «Другое» со своим текстом.
     3. Отправка - ЧЕРЕЗ РОДНУЮ ФОРМУ TILDA на странице («Отправить готовый список», поля li_nm: Компания, БИН, Name, Phone, Email, Список позиций, Комментарий):
        квиз заполняет её поля и нажимает её родную кнопку «Отправить» (проверка, капча, письмо, колбэки - всё Tilda). Новых полей и имён li_nm нет.
        Ответы идут ОДНОЙ строкой в НАЧАЛО поля «Комментарий»: «Номер заявки: ISH-ДДММ-NNNN · Квиз подбора: для чего=…; штук=…; бюджет=…; срок=…; свои ответы: …»
        (одна строка и номер в начале - как у П21: разбор письма Скрипты_1с\заявка_из_почты.py берёт из значения только первую строку). */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P23_OFF || W.__ishP23) return;
  W.__ishP23 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p23.js"]');
  var BASE = (tag && tag.src) ? tag.src.replace(/ish-design-p23\.js.*$/, '') : '';
  var VQ = (tag && tag.src && (tag.src.match(/\?.*$/) || [''])[0]) || '';
  var PHONE_TXT = '+7 775 881 85 31';

  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function until(fn, max, step) { var n = 0; (function go() { var ok = false; try { ok = fn(); } catch (e) {} if (!ok && ++n < (max || 40)) setTimeout(go, step || 250); })(); }

  (function css() {
    if (!BASE || D.getElementById('ishp23-css')) return;
    var l = D.createElement('link');
    l.id = 'ishp23-css'; l.rel = 'stylesheet'; l.href = BASE + 'ish-design-p23.css' + VQ;
    D.head.appendChild(l);
  })();
  D.documentElement.classList.add('ishp23-on');

  /* ─────────────── вопросы ───────────────
     o: готовые варианты; t: варианты с полем текста (key: other - «Другое», tender - «Тендер»); multi - можно несколько.
     req - текст обязателен, если вариант выбран. */
  var STEPS = [
    { k: 'task', short: 'для чего', q: 'Для чего нужна техника?', hint: 'Можно выбрать несколько вариантов.', multi: true,
      o: ['Офис', 'Бухгалтерия / 1С', 'Дизайн и графика', 'Учебный класс', 'Сервер / хранение'],
      t: [{ key: 'other', label: 'Другое', ph: 'Опишите задачу своими словами', req: true }] },
    { k: 'cnt', short: 'штук', q: 'Сколько штук нужно?', hint: 'Примерно, точное число назовёте менеджеру.',
      o: ['1', '2–5', '6–20', 'Больше 20'],
      t: [{ key: 'other', label: 'Другое', ph: 'Например: 150 или «пока не знаю»', req: true }] },
    { k: 'bud', short: 'бюджет', q: 'Бюджет на одну единицу', hint: 'С НДС. Если не знаете, выберите последний вариант.',
      o: ['до 200 тыс. ₸', '200–400 тыс. ₸', '400–700 тыс. ₸', 'от 700 тыс. ₸'],
      t: [{ key: 'other', label: 'Другое / не знаю', ph: 'Например: подскажите по моей задаче', req: false }] },
    { k: 'when', short: 'срок', q: 'Когда нужно?', hint: '',
      o: ['Срочно', 'В течение месяца'],
      t: [{ key: 'tender', label: 'Тендер', ph: 'Номер тендера', req: false, lab: 'Укажите номер тендера' },
          { key: 'other', label: 'Другое', ph: 'Например: к 1 декабря', req: true }] }
  ];
  var N = STEPS.length + 1;      /* + шаг контактов */

  var state = null, step = 0, opened = false, trap = null, lastFocus = null, sending = false, pushed = false, done = null;
  function fresh() {
    state = { ans: {}, txt: {}, name: '', company: '', phone: '', email: '', note: '', agree: false };
    STEPS.forEach(function (s) { state.ans[s.k] = []; state.txt[s.k] = {}; });
    step = 0; done = null; sending = false;
  }
  fresh();

  /* ─────────────── сборка комментария ─────────────── */
  function clean(s, n) {                 /* одна строка; [ ] -> ( ): иначе «[Документ: …]» в тексте клиента разбор письма принял бы за метку */
    return String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').replace(/[\[\]]/g, function (c) { return c === '[' ? '(' : ')'; })
      .replace(/[«»"]/g, '').replace(/\s+/g, ' ').trim().slice(0, n || 200);
  }
  function stepValue(s) {                /* значение шага для строки «k=…» */
    return state.ans[s.k].map(function (a) {
      var t = s.t.filter(function (x) { return x.label === a; })[0];
      if (t && t.key === 'tender') { var n = clean(state.txt[s.k][a], 60); return n ? 'Тендер №' + n.replace(/^№\s*/, '') : 'Тендер'; }
      return a;
    }).join(', ');
  }
  function ownAnswers() {
    var out = [];
    STEPS.forEach(function (s) {
      s.t.forEach(function (t) {
        if (t.key !== 'other' || state.ans[s.k].indexOf(t.label) < 0) return;
        var x = clean(state.txt[s.k][t.label], 200);
        if (x) out.push(s.short + ' «' + x + '»');
      });
    });
    return out.join('; ');
  }
  function quizLine() {
    var p = STEPS.map(function (s) { return s.short + '=' + (stepValue(s) || 'не указано'); });
    return 'Квиз подбора: ' + p.join('; ') + '; свои ответы: ' + (ownAnswers() || 'нет');
  }
  function listLine() {                  /* обязательное поле «Список позиций *» формы: короткое человеческое описание */
    var t = stepValue(STEPS[0]) || 'не указано';
    return clean('Подбор техники (квиз): ' + t + '; ' + (stepValue(STEPS[1]) || '?') + ' шт.; ' + (stepValue(STEPS[2]) || 'бюджет не назван') + '; срок: ' + (stepValue(STEPS[3]) || '?'), 400);
  }
  var NUM_KEY = 'ishp23_num', NUM_TTL = 6 * 3600 * 1000;
  function genNum() {                    /* формат П21: ISH-ДДММ-NNNN */
    var d = new Date(), r;
    try { var a = new Uint32Array(1); W.crypto.getRandomValues(a); r = a[0] % 9000; } catch (e) { r = Math.floor(Math.random() * 9000); }
    return 'ISH-' + pad(d.getDate()) + pad(d.getMonth() + 1) + '-' + String(1000 + r);
  }
  function numGet() {                    /* одна заявка = один номер, даже если Tilda просила исправить поля */
    var n = null;
    try { var o = JSON.parse(W.sessionStorage.getItem(NUM_KEY) || 'null'); if (o && o.n && Date.now() - o.t < NUM_TTL) n = o.n; } catch (e) {}
    if (!n) { n = genNum(); try { W.sessionStorage.setItem(NUM_KEY, JSON.stringify({ n: n, t: Date.now() })); } catch (e) {} }
    return n;
  }
  function numDrop() { try { W.sessionStorage.removeItem(NUM_KEY); } catch (e) {} }
  function commentValue(num) {           /* «Номер заявки: ISH-… · Квиз подбора: …; свои ответы: … · Комментарий клиента: …» - ОДНА строка */
    var body = quizLine(), note = clean(state.note, 400);
    if (note) body += ' · Комментарий клиента: ' + note;
    if (W.ISHP21 && typeof W.ISHP21.withNumber === 'function') { try { return W.ISHP21.withNumber(body, num); } catch (e) {} }
    return 'Номер заявки: ' + num + ' · ' + body;
  }

  /* ─────────────── родная форма ─────────────── */
  function findForm() {
    var fs = qa('form.t-form, form.js-form-proccess'), i;
    for (i = 0; i < fs.length; i++) {
      var f = fs[i];
      if (q('[name^="Список позиций"]', f) && q('[name^="Комментарий"]', f) && q('[name="Phone"]', f) && q('[name="Email"]', f)) return f;
    }
    return null;
  }
  function setVal(el, v) {
    var proto = el.tagName === 'TEXTAREA' ? W.HTMLTextAreaElement.prototype : W.HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(el, v); else el.value = v;
    ['input', 'keyup', 'change'].forEach(function (n) { try { el.dispatchEvent(new Event(n, { bubbles: true })); } catch (e) {} });
  }
  function field(f, name) { return q('[name="' + name + '"]', f) || q('[name^="' + name + '"]', f); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function national(s) {                 /* 10 цифр без кода страны или '' */
    var d = digits(s);
    if (d.length === 11 && (d.charAt(0) === '7' || d.charAt(0) === '8')) d = d.slice(1);
    return d.length === 10 ? d : '';
  }
  function setPhone(f, nat) {
    var g = q('[data-field-name="Phone"]', f) || f;
    var hid = q('input[name="Phone"]', g), parts = qa('[name="tildaspec-phone-part[]"]', g);
    var vis = parts.length ? parts[parts.length - 1] : hid;
    var pretty = '(' + nat.slice(0, 3) + ') ' + nat.slice(3, 6) + '-' + nat.slice(6, 8) + '-' + nat.slice(8);
    setVal(vis, parts.length ? nat : '+7' + nat);
    try { vis.dispatchEvent(new Event('blur', { bubbles: true })); } catch (e) {}
    if (hid && digits(hid.value).length < 11) {       /* маска не пересчитала скрытое поле - ставим сами то же значение, что собрала бы она */
      setVal(hid, '+7' + pretty.replace(/\D/g, ''));
      if (digits(hid.value).length < 11) setVal(hid, '+7' + nat);
    }
    return digits(hid ? hid.value : vis.value);
  }

  /* ─────────────── отправка ─────────────── */
  var okH = null, errH = null, tmo = null, relaxed = null;
  function unlisten() {
    if (okH) { D.removeEventListener('tildaform:aftersuccess', okH); okH = null; }
    if (errH) { D.removeEventListener('tildaform:aftererror', errH); errH = null; }
    clearTimeout(tmo);
  }
  function restoreBin() {
    if (!relaxed) return;
    relaxed.forEach(function (x) { if (x.v != null) x.el.setAttribute(x.a, x.v); });
    relaxed = null;
  }
  function fail(msg) {
    sending = false; unlisten(); restoreBin();
    render(msg || ('Не получилось отправить заявку. Проверьте телефон и почту или позвоните ' + PHONE_TXT + '.'));
  }
  function send() {
    var f = findForm();
    if (!f) { fail('Форма заявки на этой странице недоступна. Позвоните ' + PHONE_TXT + ' или откройте раздел «Запросить цену».'); return; }
    var btn = q('.t-submit', f) || q('[type="submit"]', f);
    if (!btn) { fail(); return; }
    var num = numGet(), nat = national(state.phone);
    sending = true; render();
    var comp = clean(state.company, 120) || 'Не указана', nm = clean(state.name, 80) || 'Не указано';
    setVal(field(f, 'Компания'), comp);
    setVal(field(f, 'Name'), nm);
    setVal(field(f, 'Email'), String(state.email).trim());
    var lst = field(f, 'Список позиций'); if (lst) setVal(lst, listLine());
    var com = field(f, 'Комментарий'); setVal(com, commentValue(num));
    var ph = setPhone(f, nat);
    var cb = q('input[type="checkbox"]', f);
    if (cb && !cb.checked) { cb.checked = true; try { cb.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {} }
    /* БИН нужен только для счёта; в квизе его нет. Пока поле пустое, на время нажатия снимаем с него «обязательное» (проверка Tilda смотрит атрибуты в момент клика); затем возвращаем */
    var bin = q('[name^="БИН"]', f);
    if (bin && !String(bin.value || '').trim()) {
      relaxed = ['data-tilda-req', 'aria-required', 'data-tilda-rule'].map(function (a) { var v = bin.getAttribute(a); if (v != null) bin.removeAttribute(a); return { el: bin, a: a, v: v }; });
    }
    var email = String(state.email).trim();
    okH = function (e) {
      if (e.target !== f) return;
      unlisten(); sending = false; numDrop();
      done = { num: num, email: email };
      render();
    };
    errH = function (e) { if (e.target === f) fail(); };
    D.addEventListener('tildaform:aftersuccess', okH);
    D.addEventListener('tildaform:aftererror', errH);
    tmo = setTimeout(function () { fail(); }, 30000);
    try { btn.click(); } catch (e) { fail(); return; }
    restoreBin();                                      /* проверка Tilda и вызов отправки - синхронно внутри click */
    /* Tilda проверила и показала ошибку на самой форме (aftererror мог не прийти) */
    setTimeout(function () {
      if (!sending) return;
      var bad = qa('.t-input-error', f).some(function (e) { return (e.textContent || '').trim() && W.getComputedStyle(e).display !== 'none'; });
      var st = btn.tildaSendingStatus;
      if (bad && !(st && st >= 1)) fail('Форма не приняла данные. Проверьте телефон (+7 700 000 00 00) и почту и нажмите «Отправить заявку» ещё раз.');
    }, 700);
  }

  /* ─────────────── окно ─────────────── */
  var root = null;
  function build() {
    root = D.createElement('div');
    root.className = 'ishp23-ov'; root.id = 'ishp23-ov'; root.hidden = true;
    root.innerHTML = '<div class="ishp23-dlg" role="dialog" aria-modal="true" aria-labelledby="ishp23-ttl" tabindex="-1">' +
      '<div class="ishp23-top"><div class="ishp23-brand" id="ishp23-ttl">Подбор техники<span>около минуты</span></div>' +
      '<button type="button" class="ishp23-x" data-p23="close" aria-label="Закрыть">×</button></div>' +
      '<div class="ishp23-main" data-p23-main></div></div>';
    D.body.appendChild(root);
    root.addEventListener('click', function (e) {
      if (e.target === root) { close(); return; }
      var b = e.target.closest ? e.target.closest('[data-p23]') : null;
      if (!b) return;
      act(b.getAttribute('data-p23'), b);
    });
    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {                                                /* фокус не уходит за окно */
        var f = qa('button:not([disabled]), input:not([disabled]), textarea, a[href]', root).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function chip(s, label, on, withText) {
    return '<button type="button" class="ishp23-chip' + (on ? ' ishp23-on' : '') + '" data-p23="pick" data-label="' + esc(label) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(label) + '</button>';
  }
  function stepHtml(s) {
    var sel = state.ans[s.k], h = '<h2 class="ishp23-q">' + esc(s.q) + '</h2>';
    if (s.hint) h += '<p class="ishp23-hint">' + esc(s.hint) + '</p>';
    h += '<div class="ishp23-chips" role="group" aria-label="' + esc(s.q) + '">';
    s.o.forEach(function (o) { h += chip(s, o, sel.indexOf(o) >= 0); });
    s.t.forEach(function (t) { h += chip(s, t.label, sel.indexOf(t.label) >= 0); });
    h += '</div>';
    s.t.forEach(function (t) {
      if (sel.indexOf(t.label) < 0) return;
      var v = state.txt[s.k][t.label] || '';
      h += '<label class="ishp23-lab" for="ishp23-t-' + s.k + '-' + t.key + '">' + esc(t.lab || (t.req ? t.label + ': напишите свой вариант' : t.label + ': можно уточнить')) + '</label>' +
        '<input class="ishp23-inp" id="ishp23-t-' + s.k + '-' + t.key + '" type="text" maxlength="200" data-p23-txt="' + esc(t.label) + '" placeholder="' + esc(t.ph) + '" value="' + esc(v) + '">';
    });
    return h + '<div class="ishp23-err" id="ishp23-er" role="alert"></div>';
  }
  function contactHtml(msg) {
    return '<h2 class="ishp23-q">Куда прислать подборку?</h2><p class="ishp23-hint">Подберём 2–3 варианта и пришлём КП. Поля со звёздочкой обязательны.</p>' +
      '<div class="ishp23-grid">' +
      '<div><label class="ishp23-lab" for="ishp23-nm">Имя</label><input class="ishp23-inp" id="ishp23-nm" data-p23-f="name" type="text" autocomplete="name" maxlength="80" placeholder="Как к вам обращаться" value="' + esc(state.name) + '"></div>' +
      '<div><label class="ishp23-lab" for="ishp23-co">Компания</label><input class="ishp23-inp" id="ishp23-co" data-p23-f="company" type="text" autocomplete="organization" maxlength="120" placeholder="ТОО «Название» или ФИО" value="' + esc(state.company) + '"></div>' +
      '<div><label class="ishp23-lab" for="ishp23-ph">Телефон *</label><input class="ishp23-inp" id="ishp23-ph" data-p23-f="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+7 700 000 00 00" value="' + esc(state.phone) + '"></div>' +
      '<div><label class="ishp23-lab" for="ishp23-em">Почта *</label><input class="ishp23-inp" id="ishp23-em" data-p23-f="email" type="email" autocomplete="email" placeholder="name@company.kz" value="' + esc(state.email) + '"></div>' +
      '</div>' +
      '<label class="ishp23-lab" for="ishp23-nt">Комментарий</label><textarea class="ishp23-inp ishp23-ta" id="ishp23-nt" data-p23-f="note" rows="2" maxlength="400" placeholder="Что ещё важно: модель, доставка, документы">' + esc(state.note) + '</textarea>' +
      '<label class="ishp23-agree"><input type="checkbox" id="ishp23-agree" data-p23-f="agree"' + (state.agree ? ' checked' : '') + '><span>Согласен на обработку персональных данных *</span></label>' +
      '<div class="ishp23-err" id="ishp23-er" role="alert">' + esc(msg || '') + '</div>';
  }
  function doneHtml() {
    return '<div class="ishp23-ok"><div class="ishp23-okic" aria-hidden="true">✓</div>' +
      '<h2 class="ishp23-q" role="status">Заявка № ' + esc(done.num) + ' принята</h2>' +
      '<p class="ishp23-hint">Подберём 2–3 варианта и пришлём КП на ' + esc(done.email) + '. Назовите этот номер, если позвоните или напишете нам: ' + esc(PHONE_TXT) + '.</p>' +
      '<div class="ishp23-nav"><span></span><button type="button" class="ishp23-btn" data-p23="finish">Готово</button></div></div>';
  }
  function stairs() {                    /* ступени 01..05, как «Три шага» главной: пройденные светлые, текущая кобальтовая и выше, дальние белые */
    var h = '';
    for (var i = 0; i < N; i++) {
      h += '<li class="' + (i < step ? 'ishp23-sd' : i === step ? 'ishp23-sc' : '') + '"><b>' + pad(i + 1) + '</b><i>' + esc(i === N - 1 ? 'связь' : STEPS[i].short) + '</i></li>';
    }
    return h;
  }
  function render(msg) {
    var m = q('[data-p23-main]', root), h;
    if (done) { m.innerHTML = doneHtml(); focusMain(); return; }
    var last = step === N - 1;
    h = '<div class="ishp23-prog" role="progressbar" aria-label="Шаг ' + (step + 1) + ' из ' + N + '" aria-valuemin="1" aria-valuemax="' + N + '" aria-valuenow="' + (step + 1) + '">' +
      '<span class="ishp23-st"><b>' + pad(step + 1) + '</b> / ' + esc(String(last ? 'контакты' : STEPS[step].short).toUpperCase()) + '</span>' +
      '<ol class="ishp23-stairs" aria-hidden="true">' + stairs() + '</ol></div>' +
      '<div class="ishp23-body">' + (last ? contactHtml(msg) : stepHtml(STEPS[step])) + '</div>' +
      '<div class="ishp23-nav"><button type="button" class="ishp23-btn ishp23-btn_ghost" data-p23="back"' + (step && !sending ? '' : ' disabled') + '>Назад</button>' +
      (last ? '<button type="button" class="ishp23-btn" data-p23="send"' + (sending ? ' disabled' : '') + '>' + (sending ? 'Отправляем…' : 'Отправить заявку') + '</button>'
            : '<button type="button" class="ishp23-btn" data-p23="next"' + (stepOk(step) ? '' : ' disabled') + '>Далее</button>') + '</div>';
    m.innerHTML = h;
    if (msg && !last) { var er = q('#ishp23-er', root); if (er) er.textContent = msg; }
  }
  function focusMain() { var d = q('.ishp23-dlg', root); if (d) { try { d.focus({ preventScroll: true }); } catch (e) {} } }

  function stepOk(i) {                    /* можно ли идти дальше */
    var s = STEPS[i], sel = state.ans[s.k];
    if (!sel.length) return false;
    return s.t.every(function (t) { return !(t.req && sel.indexOf(t.label) >= 0 && !clean(state.txt[s.k][t.label], 200)); });
  }
  function onInput(e) {
    var t = e.target, s = STEPS[step];
    if (t.hasAttribute('data-p23-txt') && s) {
      state.txt[s.k][t.getAttribute('data-p23-txt')] = t.value;
      var nx = q('[data-p23="next"]', root); if (nx) nx.disabled = !stepOk(step);
      return;
    }
    var f = t.getAttribute && t.getAttribute('data-p23-f');
    if (!f) return;
    state[f] = f === 'agree' ? t.checked : t.value;
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }
  function act(a, b) {
    if (a === 'close' || a === 'finish') { close(); return; }
    if (sending) return;
    if (a === 'pick') {
      var s = STEPS[step], lab = b.getAttribute('data-label'), arr = state.ans[s.k], i = arr.indexOf(lab);
      if (s.multi) { if (i >= 0) arr.splice(i, 1); else arr.push(lab); }
      else state.ans[s.k] = i >= 0 ? [] : [lab];
      var wasText = s.t.some(function (t) { return t.label === lab; });
      render();
      if (wasText && state.ans[s.k].indexOf(lab) >= 0) { var inp = q('[data-p23-txt="' + lab.replace(/"/g, '\\"') + '"]', root); if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) {} } }
    } else if (a === 'next') { if (stepOk(step)) { step++; render(); focusMain(); } }
    else if (a === 'back') { if (step > 0) { step--; render(); focusMain(); } }
    else if (a === 'send') {
      var er = q('#ishp23-er', root);
      function bad(m, id) { if (er) er.textContent = m; var x = q(id, root); if (x) x.focus(); }
      if (!national(state.phone)) return bad('Проверьте телефон: нужно 10 цифр после +7, например +7 700 000 00 00', '#ishp23-ph');
      if (!validEmail(state.email)) return bad('Проверьте почту: адрес вида name@company.kz', '#ishp23-em');
      if (!state.agree) return bad('Отметьте согласие на обработку персональных данных', '#ishp23-agree');
      if (er) er.textContent = '';
      send();
    }
  }

  /* ─────────────── открыть / закрыть ─────────────── */
  function open() {
    if (opened) return;
    if (!root) build();
    lastFocus = D.activeElement;
    opened = true; root.hidden = false;
    D.documentElement.classList.add('ishp23-lock');
    render();
    try { if (!/#kviz$/.test(location.hash)) { W.history.pushState({ ishp23: 1 }, '', location.pathname + location.search + '#kviz'); pushed = true; } } catch (e) {}
    setTimeout(focusMain, 30);
    D.addEventListener('keydown', onKey, true);
  }
  function close(fromPop) {
    if (!opened) return;
    opened = false; root.hidden = true;
    D.documentElement.classList.remove('ishp23-lock');
    D.removeEventListener('keydown', onKey, true);
    if (sending) { sending = false; unlisten(); restoreBin(); }
    if (done) fresh();
    if (pushed && !fromPop) { pushed = false; try { W.history.back(); } catch (e) {} } else pushed = false;
    try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  W.addEventListener('popstate', function () { if (opened) close(true); else if (/#kviz$/.test(location.hash) && findForm()) open(); });

  /* ─────────────── приглашение на странице ─────────────── */
  function ctaHtml() {
    return '<div class="ishp23-cta__in"><div class="ishp23-cta__t"><div class="ishp23-eb">Подбор техники</div>' +
      '<h2 class="ishp23-cta__h">Не знаете, что выбрать?</h2>' +
      '</div>' +
      '<button type="button" class="ishp23-cta__b" data-ishp23-open>Подобрать технику за 1 минуту</button></div>';
  }
  function place() {
    /* 19.10.2026: на /podbor (это и есть форма заявки) приглашение в квиз лишнее и ложилось во всю ширину экрана */
    if (/^\/podbor\/?$/.test(location.pathname)) return true;
    var f = findForm();
    if (!f) return false;
    var s = D.getElementById('ishp23-cta');
    if (!s) { s = D.createElement('section'); s.id = 'ishp23-cta'; s.className = 'ishp23-cta'; s.setAttribute('aria-label', 'Подбор техники'); s.innerHTML = ctaHtml(); }
    var who = D.getElementById('ishp8-c');
    if (who && who.parentNode) { if (s.previousElementSibling !== who) who.parentNode.insertBefore(s, who.nextSibling); return true; }
    if (placeWait.n < 28) return false;                                         /* П8 ещё может дорисовать «Для кого» */
    var rec = f.closest('.t-rec') || f;
    if (s.nextElementSibling !== rec && rec.parentNode) rec.parentNode.insertBefore(s, rec);
    return true;
  }
  var placeWait = { n: 0 };
  function startPlace() {
    var iv = setInterval(function () {
      placeWait.n++;
      var ok = false; try { ok = place(); } catch (e) {}
      if ((ok && D.getElementById('ishp23-cta') && (D.getElementById('ishp8-c') ? D.getElementById('ishp23-cta').previousElementSibling === D.getElementById('ishp8-c') : placeWait.n >= 28)) || placeWait.n > 120) clearInterval(iv);
    }, 250);
  }

  D.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-ishp23-open], a[href="#kviz"]') : null;
    if (!b) return;
    e.preventDefault(); open();
  });

  function init() {
    startPlace();
    if (/#kviz$/.test(location.hash)) until(function () { if (findForm()) { open(); return true; } return false; }, 60, 250);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();

  W.ISHP23 = { version: 1, open: open, close: close, _line: function () { return commentValue('ISH-0000-0000'); }, _state: function () { return state; } };
})();
