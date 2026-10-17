/* ish-design-p19.js  v1  (16.10.2026)  П19 «формы и корзина» b2b.isoft-shop.kz
   Внешний слой. Грузится из ish-design-p4.js (строка в README). Ничего не пишет в Tilda, блоки не правит.
   Модули (выключатели: window.ISH_P19_OFF = 1 - всё; window.ISH_P19_SKIP = 'forms,doc,sec,print,names,notes' - по частям):
     forms  Фр3  свои тексты ошибок форм вместо «Обязательное поле» (после того как Tilda сама показала ошибку; её проверку не трогаем)
     sec    Кр4  вторичные кнопки рядом с итогом корзины (/spec): Скачать / Печать / Скопировать (нажимают родные кнопки блока)
     doc    Кр5  подпись под переключателем «Счёт на оплату / Коммерческое предложение» (/spec)
     print  Кр6  срок действия цен в печатной форме и в тексте «Скопировать для согласования» (/spec)
     names  Кр9  единые слова: кнопка отправки «Отправить заявку» (вместо «Отправить спецификацию»)
     notes  Т26  сноска про НДС и бесплатную доставку под сеткой товаров в разделе
   Имена полей (li_nm), подписи, атрибуты data-tilda-*, обработчики отправки НЕ меняются: меняется только ТЕКСТ внутри .t-input-error и .t-form__errorbox-item.
   Фр4 («* - обязательные поля») здесь НЕ делается: строку уже даёт ish-design.css (П1/Фр9); дубль не нужен. */
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
  function привязать(f) {
    if (f.__ishp19) return;
    f.__ishp19 = 1;
    var busy = false;
    new MutationObserver(function () {
      if (busy) return;
      busy = true;
      try { поправить(f); } finally { busy = false; }   /* свои правки тоже вызовут колбэк - он ничего не найдёт менять */
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
      спец();
      new MutationObserver(пуск).observe(D.body, {childList: true, subtree: true});
      W.addEventListener('beforeprint', function () { try { спец(); } catch (e) {} });
    }
    if (on('notes')) until(сноска, 40, 500);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', старт);
  else старт();
})();
