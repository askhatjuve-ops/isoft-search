/* ish-design-p19.js  v3-кандидат (19.10.2026: убраны плитки «Или начните с раздела» в пустой корзине) | прежняя v2-кандидат (17.10.2026, волна 1 В: + модуль cart)  [v1 16.10.2026]  П19 «формы и корзина» b2b.isoft-shop.kz
   Внешний слой. Грузится из ish-design-p4.js (строка в README). Ничего не пишет в Tilda, блоки не правит.
   Модули (выключатели: window.ISH_P19_OFF = 1 - всё; window.ISH_P19_SKIP = 'forms,doc,sec,print,names,cart,notes' - по частям):
     forms  Фр3  свои тексты ошибок форм вместо «Обязательное поле» (после того как Tilda сама показала ошибку; её проверку не трогаем)
     sec    Кр4  вторичные кнопки рядом с итогом корзины (/spec): Скачать / Печать / Скопировать (нажимают родные кнопки блока)
     doc    Кр5  подпись под переключателем «Счёт на оплату / Коммерческое предложение» (/spec)
     print  Кр6  срок действия цен в печатной форме и в тексте «Скопировать для согласования» (/spec)
     names  Кр9  единые слова: кнопка отправки «Отправить заявку» (вместо «Отправить спецификацию»)
     cart   В1  корзина и форма заявки в стиле главной C2: ступени 01/02/03, доверие, итог у кнопки отправки, пустая корзина, «спасибо» (17.10)
     notes  Т26  сноска про НДС и бесплатную доставку под сеткой товаров в разделе
   Имена полей (li_nm), подписи, атрибуты data-tilda-*, обработчики отправки НЕ меняются: меняется только ТЕКСТ внутри .t-input-error и .t-form__errorbox-item.
   Фр4 («* - обязательные поля») здесь НЕ делается: строку уже даёт ish-design.css (П1/Фр9); дубль не нужен. */
/* ISH_SLA: ОДНО место для обещаний срока (часы работы пн–вс 9:00–18:00, время Астаны UTC+5). Копия в каждом файле, кому нужна; первая загруженная создаёт window.ISH_SLA. Менять часы/тексты - здесь (во всех копиях одинаково). Проверка: window.ISH_SLA_NOW = мс. */
(function (W) { if (W.ISH_SLA) return; var O = 9, C = 18; function ok() { var h = new Date((W.ISH_SLA_NOW || Date.now()) + 5 * 36e5).getUTCHours(); return h >= O && h < C; }
  W.ISH_SLA = { open: ok, reply: function () { return ok() ? 'Ответим сегодня' : 'Ответим утром, с 9:00'; }, replyLc: function () { return ok() ? 'ответим сегодня' : 'ответим утром, с 9:00'; },
    inv: function (em) { return ok() ? 'Счёт придёт на почту ' + (em ? em + ' ' : '') + 'в течение 15 минут' : 'Сейчас нерабочее время — счёт пришлём утром, с 9:00' + (em ? ' на почту ' + em : ''); } }; })(window);
(function () {
  'use strict';
  var W = window, D = document;
  if (W.ISH_P19_OFF || W.__ishP19) return;
  W.__ishP19 = 1;
  var tag = D.currentScript || D.querySelector('script[src*="ish-design-p19.js"]');
  var SKIP = ',' + String(W.ISH_P19_SKIP || '').replace(/\s+/g, '') + ',';
  function on(m) { return SKIP.indexOf(',' + m + ',') < 0; }
  function q(s, r) { return (r || D).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function tx(e) { return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function until(fn, max, step) {            /* повторять, пока fn не вернёт true */
    var n = 0;
    (function go() { var ok = false; try { ok = fn(); } catch (e) {} if (!ok && ++n < (max || 40)) setTimeout(go, step || 250); })();
  }

  /* css рядом с js (тот же адрес, ?v=); без css тексты всё равно работают */
  (function css() {
    var src = tag && tag.src;
    if (!src || D.getElementById('ishp19-css')) return;
    var l = D.createElement('link');
    l.id = 'ishp19-css'; l.rel = 'stylesheet';
    l.href = src.replace(/ish-design-p19\.js/, 'ish-design-p19.css');
    D.head.appendChild(l);
  })();
  D.documentElement.classList.add('ishp19-on');

  /* ───────── Фр3: тексты ошибок ───────── */
  function режим() {                          /* только на /spec: счёт / кп / запрос цены */
    var b = q('#spDoc [aria-checked="true"]');
    if (tx(q('#spKick')) === 'Запрос цены') return 'ask';
    return b ? b.getAttribute('data-d') : '';
  }
  function цифры(s) { return String(s || '').replace(/\D/g, ''); }
  /* Поле опознаём по группе Tilda (data-field-name = li_nm), а не по первому input: после инициализации маски телефона в группе
     появляются служебные tildaspec-phone-part[] (страна и номер), а имя Phone уходит в скрытое поле. */
  function ключ(g, inp) { return g.getAttribute('data-field-name') || (inp && inp.getAttribute('name')) || ''; }
  function значение(g, inp, к) {
    if (к === 'Phone') {
      var ч = q('[name="tildaspec-phone-part[]"]', g) || q('[name="Phone"]', g);
      return String((ч && ч.value) || (inp && inp.value) || '').trim();
    }
    return String((inp && inp.value) || '').trim();
  }
  function главныйВвод(g) {
    return q('input[type="checkbox"]', g) || q('input.t-input:not([type="hidden"]):not([name^="tildaspec"]), textarea', g) ||
           q('input:not([type="hidden"]):not([name^="tildaspec"])', g) || q('input[name="Phone"]', g) || q('[name="tildaspec-phone-part[]"]', g);
  }
  function текстПоля(g, inp) {
    var name = ключ(g, inp), тип = inp && (inp.type || '').toLowerCase(), v = значение(g, inp, name);
    if (тип === 'checkbox') return inp.checked ? '' : 'Отметьте согласие на обработку персональных данных — без него заявку не отправить';
    if (/^БИН/.test(name)) {
      var n = цифры(v).length;
      if (!n) return 'Укажите БИН — 12 цифр, он нужен для счёта';
      return 'Проверьте БИН: нужно 12 цифр, сейчас ' + n;
    }
    if (name === 'Phone') {
      if (цифры(v).length <= 1) return 'Укажите телефон для связи по заявке';
      return 'Проверьте номер телефона: +7 700 000 00 00';
    }
    if (name === 'Email') {
      if (!v) {
        var м = режим();
        return м === 'kp' ? 'Укажите почту — на неё придёт КП' : (м === 'inv' ? 'Укажите почту — на неё придёт счёт' : 'Укажите почту — на неё придёт ответ');
      }
      return 'Проверьте почту: адрес вида name@company.kz';
    }
    if (/^Компания/.test(name)) return 'Укажите название компании или ФИО — оно нужно для документа';
    if (name === 'Name') return 'Укажите имя и фамилию контактного лица';
    if (/^Список/.test(name)) return 'Впишите список позиций — по нему мы посчитаем заявку';
    if (inp && inp.getAttribute('data-tilda-req') && !v) return 'Заполните это поле';
    return '';                                /* незнакомое поле: оставляем текст Tilda */
  }
  var ОБЩИЕ = {
    'Пожалуйста, заполните все обязательные поля': 'Заполните поля, отмеченные звёздочкой *',
    'Укажите, пожалуйста, корректный email': 'Проверьте адрес почты',
    'Укажите, пожалуйста, корректный номер телефона': 'Проверьте номер телефона',
    'Укажите, пожалуйста, имя': 'Укажите имя и фамилию',
    'Укажите, пожалуйста, корректный номер': 'Проверьте БИН: только цифры, всего 12',
    'Слишком короткое значение': 'Проверьте БИН и телефон: не хватает цифр',
    'Ни одно поле не заполнено': 'Заполните форму, пожалуйста'
  };
  function поправить(f) {
    qa('.t-input-group', f).forEach(function (g) {
      var e = q('.t-input-error', g);
      if (!e) return;
      var cur = tx(e);
      if (!cur) return;
      var inp = главныйВвод(g);
      if (!inp) return;
      var want = текстПоля(g, inp);
      if (want && cur !== want) e.textContent = want;
    });
    qa('.t-form__errorbox-item, .js-rule-error', f).forEach(function (e) {
      var cur = tx(e), want = ОБЩИЕ[cur];
      if (want) e.textContent = want;
    });
  }
  /* 26.10: серверная ошибка отправки: телефон и WhatsApp настоящими ссылками рядом с ошибкой (проверка полей этого не касается) */
  var СВЯЗЬ = 'Не получается отправить? Позвоните <a href="tel:+77758818531">+7 775 881 85 31</a> · <a href="https://wa.me/77758818531" target="_blank" rel="noopener">WhatsApp</a>';
  function связь(f) {
    if (!f || q('.ishp19-ct', f)) return;
    var host = q('.t-form__errorbox-middle', f) || q('.t-form__errorbox-wrapper', f) || f;
    var p = D.createElement('p'); p.className = 'ishp19-ct'; p.setAttribute('role', 'status'); p.innerHTML = СВЯЗЬ;
    host.appendChild(p);
  }
  function серверная(f) {
    if (q('.ishp19-ct', f)) return;
    qa('.t-form__errorbox-item, .js-rule-error', f).forEach(function (e) {
      var t = tx(e);
      if (t && /сервер|server|network|сети|позже|later|попробуйте ещё|не удалось/i.test(t) && e.offsetParent !== null) связь(f);
    });
  }
  D.addEventListener('tildaform:aftererror', function (e) { var f = e.target && e.target.closest ? e.target.closest('form') || e.target : null; if (f && f.tagName === 'FORM') связь(f); });
  function привязать(f) {
    if (f.__ishp19) return;
    f.__ishp19 = 1;
    var busy = false;
    new MutationObserver(function () {
      if (busy) return;
      busy = true;
      try { поправить(f); серверная(f); } finally { busy = false; }   /* свои правки тоже вызовут колбэк - он ничего не найдёт менять */
    }).observe(f, {subtree: true, childList: true, characterData: true});
    поправить(f);
  }
  function формы() {
    qa('form.t-form, form.js-form-proccess').forEach(привязать);
  }

  /* ───────── Кр9: единые слова ───────── */
  function слова() {
    qa('.t-submit .t-btnflex__text, .t-submit').forEach(function (b) {
      if (!b.children.length && tx(b) === 'Отправить спецификацию') b.textContent = 'Отправить заявку';
    });
    var h = q('.t706__cartwin-heading');
    if (h && tx(h) === 'Спецификация') h.textContent = 'Корзина';
  }

  /* ───────── /spec: Кр4, Кр5, Кр6 ───────── */
  var ДАТА = function () {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
  };
  var СРОК_КП = 'КП действительно 3 банковских дня';
  function спец() {
    if (on('sec')) {
      var ит = q('.sp-итоги');
      if (ит && !q('.ishp19-sec', ит)) {
        var s = D.createElement('div');
        s.className = 'ishp19-sec';
        s.setAttribute('role', 'group');
        s.setAttribute('aria-label', 'Документ для согласования');
        s.innerHTML = '<span class="ishp19-sec__t">Для согласования внутри компании</span>' +
          '<button type="button" data-src="spCsv">Скачать спецификацию</button>' +
          '<button type="button" data-src="spPrint">Печать</button>' +
          '<button type="button" data-src="spCopy">Скопировать для согласования</button>';
        ит.appendChild(s);
        s.addEventListener('click', function (e) {
          var b = e.target.closest ? e.target.closest('button[data-src]') : null;
          if (!b) return;
          var src = D.getElementById(b.getAttribute('data-src'));
          if (!src) return;
          src.click();                         /* обработчики блока /spec - те же, что у меню «Действия» */
          if (b.getAttribute('data-src') === 'spCopy') {
            var t0 = b.textContent;
            b.textContent = 'Скопировано';
            setTimeout(function () { b.textContent = t0; }, 1500);
          }
        });
      }
    }
    if (on('doc')) {
      var dd = q('#spDoc');
      if (dd && !q('#ishp19Cap')) {
        var p = D.createElement('p');
        p.id = 'ishp19Cap';
        p.className = 'ishp19-cap';
        p.textContent = 'Счёт — для оплаты. КП — для согласования.';
        dd.parentNode.insertBefore(p, dd.nextSibling);
        dd.setAttribute('aria-describedby', 'ishp19Cap');
      }
    }
    if (on('print')) {
      var pr = q('.sp-печать');
      if (pr) {
        var sp = q('.ishp19-prn', pr);
        if (!sp) {
          sp = D.createElement('span');
          sp.className = 'ishp19-prn';
          pr.appendChild(D.createElement('br'));
          pr.appendChild(sp);
        }
        var т = 'Цены указаны с НДС на дату формирования: ' + ДАТА() + '. ' + СРОК_КП + '.';
        if (sp.textContent !== т) sp.textContent = т;     /* без записи «то же самое»: иначе наблюдатель зациклится */
      }
    }
  }
  function копирование() {                     /* текст «Скопировать для согласования» собирает блок /spec; срок дописываем при записи в буфер */
    try {
      var c = W.navigator && W.navigator.clipboard;
      if (!c || c.__ishp19) return;
      var o = c.writeText;
      if (typeof o !== 'function') return;
      c.writeText = function (t) {
        if (typeof t === 'string' && t.indexOf('Спецификация iSoft B2B') === 0 && t.indexOf('действительно') < 0)
          t += '\nЦены указаны с НДС на дату формирования. ' + СРОК_КП + '.';
        return o.call(c, t);
      };
      c.__ishp19 = 1;
    } catch (e) {}
  }

  /* ───────── Т26: сноска под сеткой товаров ───────── */
  function сноска() {
    if (location.pathname.indexOf('/tproduct/') > -1) return true;   /* на карточке НДС и доставку уже показывает П7 */
    var g = q('.js-store-grid-cont');
    if (!g) return false;
    if (!q('.ishp19-note')) {
      var p = D.createElement('p');
      p.className = 'ishp19-note';
      p.textContent = 'Цены указаны с НДС. Доставка бесплатная в любую точку Казахстана.';
      g.parentNode.insertBefore(p, g.nextSibling);
    }
    return true;
  }

  /* ───────── cart (волна 1 В, 17.10): корзина и форма заявки в стиле главной C2 ─────────
     Только ДОБАВЛЯЕТ свои узлы (.ishp19c-*) и классы; поля формы, name, data-field-name, data-tilda-*, кнопку отправки и обработчики не трогает.
     Что делает: ступени 01/02/03 вверху; блок доверия под итогом; «Итого» внутри индиго-карточки у кнопки отправки;
     плитки разделов на пустой корзине; экран «спасибо» (галочка, 01-02-03, «В каталог» + WhatsApp).
     Выключатель: window.ISH_P19_SKIP = 'cart'. Всё остальное - css (раздел «волна 1 В» в ish-design-p19.css). */
  var WA_PHONE = '77758818531';
  var ICO = {
    doc: '<path d="M5 2.5h6l3 3v10H5z"/><path d="M11 2.5v3h3M7.5 9h5M7.5 12h5"/>',
    truck: '<path d="M2 5.5h9v7H2zM11 8.5h3l2 2.2v1.8h-5"/><circle cx="5.2" cy="14" r="1.3"/><circle cx="13" cy="14" r="1.3"/>',
    shield: '<path d="M9 2l6 2v5c0 3.4-2.5 5.9-6 7-3.5-1.1-6-3.6-6-7V4z"/><path d="M6.4 9l2 2 3.4-4"/>',
    clock: '<circle cx="9" cy="9" r="6.5"/><path d="M9 5.2V9l2.6 1.6"/>'
  };
  function svg18(k) { return '<svg viewBox="0 0 18 18" aria-hidden="true">' + ICO[k] + '</svg>'; }
  function node(html) { var t = D.createElement('div'); t.innerHTML = html; return t.firstElementChild; }
  function видно(e) {
    if (!e) return false;
    var cs = W.getComputedStyle(e);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }
  function успехВиден() {
    if (q('.ish15-успех')) return true;
    var sb = q('.t706__cartwin .js-successbox');
    return !!(sb && видно(sb) && tx(sb));
  }
  function формаВидна() {
    var f = q('.t706__cartwin');
    if (f && f.contains(D.activeElement) && D.activeElement.tagName !== 'BODY') return true;
    var h = q('#spFormHead');
    if (!h || !видно(h)) return false;
    var r = h.getBoundingClientRect();
    return r.top < W.innerHeight * 0.6 && r.bottom > 0;
  }
  function ступени() {
    var wrap = q('.вн-верх .вн-об');
    if (!wrap) return;
    var ol = q('.ishp19c-steps', wrap);
    if (!ol) {
      ol = node('<ol class="ishp19c-steps" aria-label="Путь заявки">' +
        '<li><span class="n">01</span><span class="t"><b>Товары</b><i>проверьте позиции</i></span></li>' +
        '<li><span class="n">02</span><span class="t"><b>Реквизиты</b><i>компания и БИН</i></span></li>' +
        '<li><span class="n">03</span><span class="t"><b>Готово</b><i>счёт придёт на почту</i></span></li></ol>');
      wrap.appendChild(ol);
    }
    var s = успехВиден() ? 3 : (формаВидна() ? 2 : 1);
    D.body.classList.toggle('ishp19c-step2', s === 2);        /* на шаге 02 нижняя полоса «Заполнить реквизиты» телефона не нужна */
    qa('li', ol).forEach(function (li, i) {
      var n = i + 1, c = n === s ? 'is-on' : (n < s ? 'is-done' : '');
      if (li.className !== c) li.className = c;
      if (n === s) { if (li.getAttribute('aria-current') !== 'step') li.setAttribute('aria-current', 'step'); }
      else if (li.hasAttribute('aria-current')) li.removeAttribute('aria-current');
    });
  }
  function доверие() {
    var бок = q('.вн-бок');
    if (!бок) return;
    qa('.вн-карта', бок).forEach(function (c) {              /* «Как дальше» теперь говорят ступени 01/02/03 вверху */
      var h = q('h3', c);
      if (h && tx(h) === 'Как дальше' && !c.classList.contains('ishp19c-hide')) c.classList.add('ishp19c-hide');
    });
    if (q('.ishp19c-trust', бок)) return;
    var ит = [['doc', 'Счёт с НДС', 'для юрлиц и ИП, безналично'], ['truck', 'Бесплатная доставка', 'в любую точку Казахстана'],
              ['shield', 'Гарантия от производителя', ''], ['clock', ISH_SLA.reply(), 'цена, срок']];
    бок.appendChild(node('<div class="ishp19c-trust" role="list">' + ит.map(function (x) {
      return '<div class="ishp19c-trust__i" role="listitem"><span class="ishp19c-sq">' + svg18(x[0]) + '</span><p><b>' + x[1] + '</b>' + (x[2] ? '<span>' + x[2] + '</span>' : '') + '</p></div>';
    }).join('') + '</div>'));
  }
  function итогФормы() {                                       /* «Итого» рядом с кнопкой отправки: число берём из своей нижней полосы, форму не трогаем */
    var sb = q('.t706__cartwin .t-form__submit');
    if (!sb) return;
    var sum = tx(q('#spBarSum')), sub = tx(q('#spBarSub')) || 'Итого';
    var ft = q('.ishp19c-ft', sb);
    if (!ft) { ft = node('<div class="ishp19c-ft"><span></span><b></b></div>'); sb.insertBefore(ft, sb.firstChild); }
    var a = q('span', ft), b = q('b', ft);
    if (a.textContent !== sub) a.textContent = sub;
    if (b.textContent !== sum) b.textContent = sum;
    ft.hidden = !sum || sum === '—';
  }
  var ПЛИТКИ = [
    ['Компьютеры', '/kompyutery', 'stor3761-6264-4162-b266-646337356566/f1e622a0312466f3ef1b71f3fde3f412.jpg'],
    ['Мониторы и экраны', '/monitory-i-ekrany', 'tild3963-3338-4962-a232-386664663531/ISE6D646CEC2.jpg'],
    ['Комплектующие', '/komplektuyushchie', 'stor3961-3939-4130-b931-623231306631/a0c21314158e83e4ac85cef31a89717d.jpg'],
    ['Накопители', '/nakopiteli', 'stor3135-3663-4731-a231-303731623939/58e82550701e3940898516e57992dd1f.jpg'],
    ['Сетевое оборудование', '/set-i-servery', 'stor6164-3733-4538-b233-613239663964/141a321f108a700000b476634e76e701.jpg'],
    ['Печать и сканирование', '/ofis-i-rabochee-mesto', 'tild3234-6165-4262-b837-666635633064/298696424884.jpg']
  ];
  function пустая() {
    if (!W.ISH_P19_TILES) return;               /* 19.10: плитки «Или начните с раздела» убраны (Асхат: «зачем усложнять»); вернуть: window.ISH_P19_TILES = 1 */
    var п = q('.вн-пусто');
    if (!п || q('.ishp19c-tiles', п)) return;
    п.appendChild(node('<div class="ishp19c-tiles"><p class="ishp19c-tiles__t">Или начните с раздела</p><div class="ishp19c-grid">' +
      ПЛИТКИ.map(function (x) {
        return '<a class="ishp19c-tile" href="' + x[1] + '"><span class="ishp19c-ph"><img src="https://static.tildacdn.com/' + x[2] + '" alt="" loading="lazy" decoding="async"></span><b>' + x[0] + '</b></a>';
      }).join('') + '</div></div>'));
  }
  function спасибо() {
    var у = q('.ish15-успех');
    if (!у || у.getAttribute('data-ishp19c')) return;
    у.setAttribute('data-ishp19c', '1');
    var ok = node('<div class="ishp19c-ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5.5 12.8l4.2 4.2L18.5 8"/></svg></div>');
    у.insertBefore(ok, у.firstChild);
    var нт = node('<ol class="ishp19c-next" aria-label="Что будет дальше">' +
      '<li><span class="n">01</span><b>Сформируем КП и счёт</b><i>по заявке</i></li>' +
      '<li><span class="n">02</span><b>Пришлём счёт или КП</b><i>на почту, которую вы указали</i></li>' +
      '<li><span class="n">03</span><b>Оплата и доставка</b><i>безналично, доставка бесплатная</i></li></ol>');
    var кн = q('a.ish15-btn', у);
    var ряд = node('<div class="ishp19c-acts"></div>');
    if (кн) {
      кн.textContent = 'В каталог';
      кн.parentNode.insertBefore(нт, кн);
      кн.parentNode.insertBefore(ряд, кн);
      ряд.appendChild(кн);
    } else { у.appendChild(нт); у.appendChild(ряд); }
    var wa = node('<a class="ishp19c-wa" target="_blank" rel="noopener" href="https://wa.me/' + WA_PHONE + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2a8.7 8.7 0 0 0-7.5 13.1L3.3 20.7l4.5-1.2A8.7 8.7 0 1 0 12 3.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8.3c-.3.6-.4 1.3.2 2.4.9 1.7 2.3 2.9 4 3.5.8.3 1.5.1 1.9-.5l.3-.6-1.7-.9-.6.6c-.8-.3-1.9-1.4-2.2-2.2l.6-.6-.8-1.7z" fill="currentColor"/></svg>Написать в WhatsApp</a>');
    ряд.appendChild(wa);
    wa.addEventListener('click', function () {              /* номер заявки приходит от П21 чуть позже карточки - читаем в момент нажатия */
      var n = q('.ishp21-num__n'), m = n && /ISH-\d{4}-\d{4}/.exec(n.textContent || '');
      wa.href = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent('Здравствуйте! ' + (m ? 'Моя заявка ' + m[0] + '.' : 'Отправил(а) заявку на сайте.'));
    });
  }
  function корзинаC2() {
    ступени(); доверие(); итогФормы(); пустая(); спасибо();
  }
  function стартКорзины() {
    корзинаC2();
    setInterval(function () { try { корзинаC2(); } catch (e) {} }, 800);
    W.addEventListener('scroll', function () { try { ступени(); } catch (e) {} }, {passive: true});
    D.addEventListener('focusin', function () { try { ступени(); } catch (e) {} });
  }

  /* ───────── запуск ───────── */
  function старт() {
    if (on('forms')) { формы(); until(function () { формы(); return false; }, 60, 500); D.addEventListener('click', формы, true); }
    if (on('names')) until(function () { слова(); return false; }, 24, 500);
    if (q('#specRoot') || location.pathname === '/spec') {
      if (on('print')) копирование();
      var пл = false;
      var пуск = function () {
        if (пл) return;
        пл = true;
        (W.requestAnimationFrame || setTimeout)(function () { пл = false; try { спец(); } catch (e) {} });
      };
      if (on('cart')) стартКорзины();
      спец();
      new MutationObserver(пуск).observe(D.body, {childList: true, subtree: true});
      W.addEventListener('beforeprint', function () { try { спец(); } catch (e) {} });
    }
    if (on('notes')) until(сноска, 40, 500);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', старт);
  else старт();
})();
