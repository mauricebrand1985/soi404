/* ============================================================
   SOI 404 — site.js
   Injects shared chrome, Thai-first i18n, mobile nav,
   scroll reveals, electric discharges, contact form.
   In-memory state only.
   ============================================================ */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LOGO = document.body.dataset.theme === 'light' ? 'logo-sign-black.png' : 'logo-sign.png';
  // contact endpoints — swap for real ones
  const LINE_URL = '#', WA_URL = 'https://wa.me/66000000000', TEL = 'tel:+66000000000', MAIL = 'mailto:hello@soi404.studio';

  /* ---------- i18n dictionary (chrome only; page copy uses data-th/en) ---------- */
  let LANG = 'th';
  const T = {
    home: { th: 'หน้าแรก', en: 'Home' }, services: { th: 'บริการ', en: 'Services' },
    work: { th: 'ผลงาน', en: 'Work' }, about: { th: 'เกี่ยวกับเรา', en: 'About' },
    contact: { th: 'ติดต่อ', en: 'Contact' }, start: { th: 'เริ่มโปรเจกต์', en: 'Start a project' },
    tagline: { th: 'เลี้ยวผิดซอย…เจอที่ใช่', en: 'Wrong turn. Right studio.' },
    line: { th: 'ไลน์', en: 'LINE' }, call: { th: 'โทรหาเรา', en: 'Call us' }, wa: { th: 'วอทส์แอป', en: 'WhatsApp' },
    fcontact: { th: 'ติดต่อ', en: 'Contact' }, fnav: { th: 'เมนู', en: 'Navigate' },
    rights: { th: 'สงวนลิขสิทธิ์', en: 'All rights reserved' },
    based: { th: 'สตูดิโอออกแบบในกรุงเทพฯ', en: 'Design studio · Bangkok' },
  };
  const t = k => (T[k] && T[k][LANG]) || k;

  /* ---------- icons ---------- */
  const IC = {
    line: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C6.8 3 2.6 6.43 2.6 10.66c0 3.79 3.33 6.96 7.83 7.56.3.07.72.2.83.46.1.24.06.6.03.84l-.13.8c-.04.24-.19.93.81.51 1-.42 5.4-3.18 7.37-5.45h0c1.36-1.49 2.01-3 2.01-4.72C21.35 6.43 17.2 3 12 3Z"/><text x="12" y="12.6" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="5.4" letter-spacing=".1" fill="#100b06">LINE</text></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.6-4.2A8 8 0 1 1 8 19.4L3 21Z"/><path d="M8.5 8.2c-.2-.5-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.3.9 2.5 1 2.7.2.2 1.9 3 4.7 4 .8.3 1.4.5 1.9.4.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.3.2-1.5l-.5-.3-1.6-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.3 0-.4.1-.5l.5-.5c.1-.2.1-.3.2-.5v-.5l-.6-1.5Z"/></svg>',
    call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h3l1.5 5-2 1.5a13 13 0 0 0 5.5 5.5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  };

  const PAGE = document.body.dataset.page || 'home';
  const NAVITEMS = [['home', 'index.html'], ['services', 'services.html'], ['work', 'work.html'], ['about', 'about.html'], ['contact', 'contact.html']];

  /* ---------- build chrome ---------- */
  function chrome() {
    // atmosphere + canvas + spine (behind everything)
    const at = el('div', 'atmos');
    at.innerHTML = '<div class="atmos__grain"></div><div class="atmos__scan"></div><div class="atmos__vign"></div>';
    document.body.prepend(at);
    const cv = document.createElement('canvas'); cv.id = 'fx-canvas'; at.after(cv);

    const spine = el('div', 'spine');
    spine.innerHTML = '<div class="spine__track"></div><div class="spine__fill"></div>' +
      [0, .25, .5, .75, 1].map(a => `<div class="spine__node" data-at="${a}" style="top:${a * 100}%"></div>`).join('');
    cv.after(spine);

    // NAV
    const nav = el('header', 'nav'); nav.id = 'nav';
    nav.innerHTML = `
      <div class="nav__inner">
        <a class="nav__logo" href="index.html" aria-label="SOI 404 home"><img src="${LOGO}" alt="SOI 404"></a>
        <nav class="nav__links" aria-label="Primary">
          ${NAVITEMS.map(([k, h]) => `<a href="${h}" data-k="${k}" ${PAGE === k ? 'aria-current="page"' : ''}>${t(k)}</a>`).join('')}
        </nav>
        <div class="nav__right">
          <div class="lang" role="group" aria-label="Language">
            <button data-lang="th" aria-pressed="true">ไทย</button><button data-lang="en" aria-pressed="false">EN</button>
          </div>
          <a class="btn btn--ghost live" href="contact.html" data-k="start" style="border-radius:8px">${t('start')} ${IC.arrow}</a>
          <button class="nav__burger" aria-label="Menu" aria-expanded="false"><span></span></button>
        </div>
      </div>
      <span class="nav__rail"></span>`;
    document.body.appendChild(nav);

    // DRAWER
    const dr = el('div', 'drawer'); dr.id = 'drawer';
    dr.innerHTML = NAVITEMS.map(([k, h]) => `<a href="${h}" data-k="${k}">${t(k)}</a>`).join('') +
      `<div class="drawer__meta"><a class="btn btn--solid" href="contact.html" data-k="start" style="font-size:.8rem">${t('start')}</a></div>`;
    document.body.appendChild(dr);

    // FAB
    const fab = el('div', 'fab'); fab.id = 'fab';
    fab.innerHTML = `
      <a class="fab__btn" href="${LINE_URL}" aria-label="LINE">${IC.line}<span class="tip" data-k="line">${t('line')}</span></a>
      <a class="fab__btn" href="${WA_URL}" target="_blank" rel="noopener" aria-label="WhatsApp">${IC.wa}<span class="tip" data-k="wa">${t('wa')}</span></a>
      <a class="fab__btn" href="${TEL}" aria-label="Call">${IC.call}<span class="tip" data-k="call">${t('call')}</span></a>`;
    document.body.appendChild(fab);

    // FOOTER
    const f = el('footer', 'foot');
    f.innerHTML = `<span class="foot__rail"></span><div class="wrap foot__grid">
      <div class="foot__brand">
        <a href="index.html"><img src="${LOGO}" alt="SOI 404"></a>
        <p class="foot__tag" data-k="tagline">${t('tagline')}</p>
      </div>
      <div class="foot__col"><h4 data-k="fnav">${t('fnav')}</h4>
        ${NAVITEMS.map(([k, h]) => `<a href="${h}" data-k="${k}">${t(k)}</a>`).join('')}</div>
      <div class="foot__col"><h4 data-k="fcontact">${t('fcontact')}</h4>
        <a href="${LINE_URL}">LINE</a><a href="${WA_URL}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="${TEL}">+66 (0)00 000 0000</a><a href="${MAIL}">hello@soi404.studio</a></div>
    </div>
    <div class="wrap foot__bot">
      <span>© ${new Date().getFullYear()} SOI 404 — <span data-k="based">${t('based')}</span></span>
      <span data-k="rights">${t('rights')}</span>
    </div>`;
    document.body.appendChild(f);
  }

  function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }

  /* ---------- language ---------- */
  function setLang(l) {
    LANG = l; document.documentElement.lang = l;
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
    // chrome strings
    document.querySelectorAll('[data-k]').forEach(n => {
      const k = n.dataset.k;
      if (k === 'start') { n.innerHTML = t('start') + ' ' + IC.arrow; }
      else if (T[k]) n.textContent = t(k);
    });
    // page content
    document.querySelectorAll('[data-th]').forEach(n => {
      const v = l === 'th' ? n.dataset.th : (n.dataset.en ?? n.dataset.th);
      if (n.dataset.html !== undefined) n.innerHTML = v; else n.textContent = v;
    });
    document.querySelectorAll('[data-th-ph]').forEach(n => {
      n.setAttribute('placeholder', l === 'th' ? n.dataset.thPh : (n.dataset.enPh ?? n.dataset.thPh));
    });
  }

  /* ---------- interactions ---------- */
  function wire() {
    // language buttons
    document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

    // nav shrink
    const nav = document.getElementById('nav');
    addEventListener('scroll', () => nav.classList.toggle('shrink', scrollY > 40), { passive: true });

    // burger / drawer
    const burger = document.querySelector('.nav__burger'), drawer = document.getElementById('drawer');
    if (burger) burger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer && drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('open'); document.body.style.overflow = ''; burger.setAttribute('aria-expanded', false);
    }));

    // every button gets the live-current border so the electricity-on-hover
    // (traveling gold edge + spark) is consistent across all templates
    document.querySelectorAll('.btn').forEach(b => {
      b.classList.add('live');
      if (!b.style.getPropertyValue('--bw')) b.style.setProperty('--bw', '1.5px');
    });

    // electric discharges on buttons (attach regardless of SOI init order;
    // each handler checks window.SOI at call time)
    if (!REDUCED) {
      // every button: spark bursts along its edges on hover (visible on any bg)
      document.querySelectorAll('.btn,.cbtn').forEach(b => {
        b.addEventListener('mouseenter', () => {
          if (!window.SOI) return;
          const r = b.getBoundingClientRect();
          window.SOI.spark(r.left + 7, r.top + r.height / 2, { count: 9, power: 4 });
          window.SOI.spark(r.right - 7, r.top + r.height / 2, { count: 9, power: 4 });
          window.SOI.spark(r.left + r.width / 2, r.top + 5, { count: 7, power: 4 });
        });
        b.addEventListener('click', () => window.SOI && window.SOI.sparkEl(b, { count: 22, power: 6 }));
      });
      document.querySelectorAll('.fab__btn,.playlink,.disc,.proj').forEach(b => {
        b.addEventListener('mouseenter', () => window.SOI && window.SOI.sparkEl(b, { count: 8, power: 3 }));
      });
    }

    // scroll reveals + section arc
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          if (!REDUCED && window.SOI && e.target.dataset.arc !== undefined) {
            window.SOI.surge(.6);
          }
          io.unobserve(e.target);
        }
      });
    }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
    const risers = [...document.querySelectorAll('.rise')];
    risers.forEach(n => io.observe(n));
    // Immediate reveal for anything already on-screen — never wait on the
    // async observer (which can be delayed while the canvas rAF runs).
    const revealVisible = () => {
      risers.forEach(n => {
        if (n.classList.contains('in')) return;
        const r = n.getBoundingClientRect();
        if (r.top < innerHeight * 0.95 && r.bottom > 0) { n.classList.add('in'); io.unobserve(n); }
      });
    };
    revealVisible();
    requestAnimationFrame(revealVisible);
    // Safety net: nothing stays invisible if the observer ever misbehaves.
    setTimeout(() => risers.forEach(n => {
      const r = n.getBoundingClientRect();
      if (r.top < innerHeight) n.classList.add('in');
    }), 1500);

    // glitch elements: fire when seen
    const gio = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('go'); gio.unobserve(e.target); } });
    }, { threshold: .4 });
    document.querySelectorAll('.glitch').forEach(n => gio.observe(n));
  }

  /* ---------- contact form ---------- */
  function form() {
    const f = document.getElementById('contactForm'); if (!f) return;
    f.querySelectorAll('.field').forEach(fl => {
      const inp = fl.querySelector('input,textarea,select');
      if (!inp) return;
      inp.addEventListener('focus', () => { fl.classList.add('focused'); if (!REDUCED && window.SOI) window.SOI.sparkEl(fl, { count: 5, power: 2 }); });
      inp.addEventListener('blur', () => fl.classList.remove('focused'));
      inp.addEventListener('input', () => fl.classList.remove('err'));
    });
    f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      let ok = true;
      f.querySelectorAll('[required]').forEach(inp => {
        const fl = inp.closest('.field');
        let bad = !inp.value.trim();
        if (inp.type === 'email' && inp.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)) bad = true;
        if (bad) { fl.classList.add('err'); ok = false; } else fl.classList.remove('err');
      });
      if (!ok) { if (!REDUCED && window.SOI) window.SOI.sparkEl(f, { count: 10, cold: true }); return; }
      // build an email to the studio inbox with the form data
      const g = (n) => { const el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      const subject = encodeURIComponent('New project inquiry — ' + (g('name') || 'SOI 404'));
      const body = encodeURIComponent(
        'Name: ' + g('name') + '\nEmail: ' + g('email') + '\nCompany: ' + g('company') +
        '\nPhone: ' + g('phone') + '\n\nMessage:\n' + g('message'));
      window.location.href = 'mailto:mauricebrand@gmail.com?subject=' + subject + '&body=' + body;
      // success
      const r = f.getBoundingClientRect();
      if (!REDUCED && window.SOI) { window.SOI.spark(r.left + r.width / 2, r.top + 80, { count: 30, power: 7 }); window.SOI.surge(1); }
      f.innerHTML = `<div class="form__success live" style="border-radius:14px;--bw:1.5px">
        <h3 data-th="ส่งข้อความแล้ว — เดี๋ยวเราติดต่อกลับ" data-en="Message sent — we'll be in touch">${LANG === 'th' ? 'ส่งข้อความแล้ว — เดี๋ยวเราติดต่อกลับ' : "Message sent — we'll be in touch"}</h3>
        <p style="color:var(--muted)" data-th="ขอบคุณที่เลี้ยวเข้าซอย 404" data-en="Thanks for taking the wrong turn into Soi 404.">${LANG === 'th' ? 'ขอบคุณที่เลี้ยวเข้าซอย 404' : 'Thanks for taking the wrong turn into Soi 404.'}</p></div>`;
    });
  }

  /* ---------- home hero reveal ---------- */
  function hero() {
    const h = document.querySelector('.hero'); if (!h) return;
    const img = h.querySelector('.hero__img');
    if (img) {
      const show = () => img.classList.add('loaded');
      if (img.complete) show(); else img.addEventListener('load', show);
    }
    // orchestrated charge-in: a spark settles at the street sign (no sky lightning)
    if (!REDUCED && window.SOI) {
      setTimeout(() => { window.SOI.spark(innerWidth * .82, innerHeight * .34, { count: 18, power: 4 }); window.SOI.surge(.8); }, 720);
    }
  }

  /* ---------- boot ---------- */
  chrome();
  setLang('th');
  wire();   // sets up observer + reveals above-the-fold immediately (canvas not yet running)
  form();
  hero();
  // Start the electricity AFTER the first reveals get clean frames, so the
  // canvas rAF never starves above-the-fold content into staying invisible.
  const startFx = () => { if (window.__initElectric) window.__initElectric(); };
  requestAnimationFrame(() => requestAnimationFrame(startFx));
})();
