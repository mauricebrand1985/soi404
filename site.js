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
  const LINE_URL = 'https://line.me/ti/p/vducauPc_4', WA_URL = 'https://wa.me/66968122442', TEL = 'tel:+66968122442', MAIL = 'mailto:hello@soi404.com';
  // Server-side email delivery for the contact form (no backend needed).
  // Web3Forms emails submissions straight to your inbox. Get a free access key
  // at https://web3forms.com (enter hello@soi404.com), then paste it below.
  const FORM_ACCESS_KEY = '845c304b-adf2-45c6-aa3e-d18c4b2dd530';
  const FORM_ENDPOINT = 'https://api.web3forms.com/submit';

  /* ---------- i18n dictionary (chrome only; page copy uses data-th/en) ---------- */
  let LANG = 'th';
  const T = {
    home: { th: 'หน้าแรก', en: 'Home' }, services: { th: 'บริการ', en: 'Services' },
    work: { th: 'ผลงาน', en: 'Work' }, about: { th: 'เกี่ยวกับเรา', en: 'About' },
    contact: { th: 'ติดต่อ', en: 'Contact' }, start: { th: 'เริ่มโปรเจกต์', en: 'Start a project' },
    tagline: { th: 'เว็บไซต์ แบรนด์ดิ้งและ\nแอปพาคุณขึ้นนำ', en: 'Websites, branding, and apps to take the lead.' },
    line: { th: 'ไลน์', en: 'LINE' }, call: { th: 'โทรหาเรา', en: 'Call us' }, wa: { th: 'วอทส์แอป', en: 'WhatsApp' },
    fcontact: { th: 'ติดต่อ', en: 'Contact' }, fnav: { th: 'เมนู', en: 'Navigate' },
    rights: { th: 'สงวนลิขสิทธิ์', en: 'All rights reserved' },
    based: { th: 'สตูดิโอออกแบบในกรุงเทพฯ', en: 'Design studio · Bangkok' },
  };
  const t = k => (T[k] && T[k][LANG]) || k;

  /* ---------- icons ---------- */
  const IC = {
    line: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C6.8 3 2.6 6.43 2.6 10.66c0 3.79 3.33 6.96 7.83 7.56.3.07.72.2.83.46.1.24.06.6.03.84l-.13.8c-.04.24-.19.93.81.51 1-.42 5.4-3.18 7.37-5.45h0c1.36-1.49 2.01-3 2.01-4.72C21.35 6.43 17.2 3 12 3Z"/><text x="12" y="12.8" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="5.7" letter-spacing=".08" fill="#fff7e8">LINE</text></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 20.6l1.3-4.6a8.2 8.2 0 1 1 3.1 3.05L3.4 20.6Z"/><path fill="currentColor" stroke="none" d="M9 8.5c-.15-.35-.32-.36-.5-.36h-.45c-.16 0-.42.06-.63.3-.22.24-.83.8-.83 1.97 0 1.17.85 2.3.97 2.46.12.16 1.67 2.65 4.1 3.6 2.02.78 2.43.63 2.87.59.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12l-.76.94c-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.64-1.2-1.42-1.34-1.66-.14-.24-.01-.37.11-.49l.36-.42c.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42L9 8.5Z"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  };

  const PAGE = document.body.dataset.page || 'home';
  const NAVITEMS = [['home', '/'], ['services', 'services.html'], ['work', 'work.html'], ['about', 'about.html'], ['contact', 'contact.html']];

  /* ---------- build chrome ---------- */
  function chrome() {
    // atmosphere + canvas + spine (behind everything)
    const at = el('div', 'atmos');
    at.innerHTML = '<div class="atmos__grain"></div><div class="atmos__scan"></div><div class="atmos__vign"></div>';
    document.body.prepend(at);
    const cv = document.createElement('canvas'); cv.id = 'fx-canvas'; at.after(cv);
    // spark-burst overlay — same size/pos, but above the chrome (see base.css)
    const cvTop = document.createElement('canvas'); cvTop.id = 'fx-canvas-top'; cv.after(cvTop);

    const spine = el('div', 'spine');
    spine.innerHTML = '<div class="spine__track"></div><div class="spine__fill"></div>' +
      [0, .25, .5, .75, 1].map(a => `<div class="spine__node" data-at="${a}" style="top:${a * 100}%"></div>`).join('');
    cv.after(spine);

    // NAV
    const nav = el('header', 'nav'); nav.id = 'nav';
    nav.innerHTML = `
      <div class="nav__inner">
        <a class="nav__logo" href="/" aria-label="SOI 404 home"><img src="${LOGO}" alt="SOI 404"></a>
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
        <a href="/"><img src="${LOGO}" alt="SOI 404"></a>
        <p class="foot__tag" data-k="tagline">${t('tagline')}</p>
      </div>
      <div class="foot__col"><h4 data-k="fnav">${t('fnav')}</h4>
        ${NAVITEMS.map(([k, h]) => `<a href="${h}" data-k="${k}">${t(k)}</a>`).join('')}</div>
      <div class="foot__col"><h4 data-k="fcontact">${t('fcontact')}</h4>
        <a href="${LINE_URL}">LINE</a><a href="${WA_URL}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="${TEL}">096-812-2442</a><a href="${MAIL}">hello@soi404.com</a></div>
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
    try { localStorage.setItem('soi404_lang', l); } catch (e) {}
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
      // Hover sparks ONLY on devices that truly hover (mouse / trackpad).
      // On a touchscreen, the first tap fires a synthetic `mouseenter`; drawing
      // sparks inside it mutates the page, so iOS Safari reads the tap as
      // "revealing a hover state" and SWALLOWS the click — forcing a second tap
      // before any link/button navigates. Gating on `(hover: hover)` keeps the
      // effect on desktop while letting a single tap activate links on mobile.
      const HOVER = matchMedia('(hover: hover)').matches;

      // every button: spark bursts along its edges on hover (visible on any bg)
      document.querySelectorAll('.btn,.cbtn').forEach(b => {
        if (HOVER) b.addEventListener('mouseenter', () => {
          if (!window.SOI) return;
          const r = b.getBoundingClientRect();
          window.SOI.spark(r.left + 7, r.top + r.height / 2, { count: 9, power: 4 });
          window.SOI.spark(r.right - 7, r.top + r.height / 2, { count: 9, power: 4 });
          window.SOI.spark(r.left + r.width / 2, r.top + 5, { count: 7, power: 4 });
        });
        // click discharge stays on every device — it fires on the tap that
        // navigates, so it never blocks the first tap.
        b.addEventListener('click', () => window.SOI && window.SOI.sparkEl(b, { count: 22, power: 6 }));
      });
      if (HOVER) document.querySelectorAll('.fab__btn,.playlink,.disc,.proj').forEach(b => {
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
    f.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      let ok = true;
      f.querySelectorAll('[required]').forEach(inp => {
        const fl = inp.closest('.field');
        let bad = !inp.value.trim();
        if (inp.type === 'email' && inp.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)) bad = true;
        if (bad) { fl.classList.add('err'); ok = false; } else fl.classList.remove('err');
      });
      if (!ok) { if (!REDUCED && window.SOI) window.SOI.sparkEl(f, { count: 10, cold: true }); return; }

      const g = (n) => { const el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      const btn = f.querySelector('[type="submit"]');
      const success = () => {
        const r = f.getBoundingClientRect();
        if (!REDUCED && window.SOI) { window.SOI.spark(r.left + r.width / 2, r.top + 80, { count: 30, power: 7 }); window.SOI.surge(1); }
        f.innerHTML = `<div class="form__success live" style="border-radius:14px;--bw:1.5px">
          <h3 data-th="ส่งข้อความแล้ว — เดี๋ยวเราติดต่อกลับ" data-en="Message sent — we'll be in touch">${LANG === 'th' ? 'ส่งข้อความแล้ว — เดี๋ยวเราติดต่อกลับ' : "Message sent — we'll be in touch"}</h3>
          <p style="color:var(--muted)" data-th="ขอบคุณที่เลี้ยวเข้าซอย 404" data-en="Thanks for taking the wrong turn into Soi 404.">${LANG === 'th' ? 'ขอบคุณที่เลี้ยวเข้าซอย 404' : 'Thanks for taking the wrong turn into Soi 404.'}</p></div>`;
      };
      const fail = () => {
        if (!REDUCED && window.SOI) window.SOI.sparkEl(f, { count: 12, cold: true });
        if (btn) { btn.disabled = false; btn.textContent = LANG === 'th' ? 'ลองส่งอีกครั้ง' : 'Try again'; }
        // last-resort fallback so a message is never lost
        const subject = encodeURIComponent('New project inquiry — ' + (g('name') || 'SOI 404'));
        const body = encodeURIComponent('Name: ' + g('name') + '\nEmail: ' + g('email') + '\nCompany: ' + g('company') + '\nPhone: ' + g('phone') + '\n\nMessage:\n' + g('message'));
        window.location.href = 'mailto:hello@soi404.com?subject=' + subject + '&body=' + body;
      };

      // No key configured yet → fall back to the visitor's mail app.
      if (!FORM_ACCESS_KEY || FORM_ACCESS_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') { fail(); return; }

      if (btn) { btn.disabled = true; btn.textContent = LANG === 'th' ? 'กำลังส่ง…' : 'Sending…'; }
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: FORM_ACCESS_KEY,
            subject: 'New project inquiry — ' + (g('name') || 'SOI 404'),
            from_name: 'SOI 404 website',
            name: g('name'), email: g('email'), company: g('company'),
            phone: g('phone'), message: g('message')
          })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) success(); else fail();
      } catch (e) { fail(); }
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

  /* ---------- nav logo glitch (site-wide) ----------
     Clean ~14s, then a hard 1s burst that re-randomizes the distortion
     rapidly (erratic stutter). Writes only CSS custom props on .nav__logo,
     so the navbar never reflows. Disabled under reduced-motion. */
  function logoGlitch() {
    if (REDUCED) return;
    const logo = document.querySelector('.nav__logo');
    if (!logo) return;

    const CLEAN = 14000, BURST = 1000;      // 14s steady + 1s glitch = 15s loop
    const rnd = (a, b) => a + Math.random() * (b - a);
    const band = () => {
      const top = (Math.random() * 78) | 0, h = 8 + (Math.random() * 22 | 0);
      return `inset(${top}% 0 ${Math.max(0, 100 - top - h)}% 0)`;
    };
    const clean = () => { logo.style.cssText = ''; };   // back to base state
    function shock() {
      logo.style.setProperty('--gx', rnd(-5, 5).toFixed(1) + 'px');
      logo.style.setProperty('--gy', rnd(-3, 3).toFixed(1) + 'px');
      logo.style.setProperty('--gf',
        `drop-shadow(${rnd(2,6).toFixed(1)}px 0 rgba(255,${(70+Math.random()*40)|0},25,.88)) ` +
        `drop-shadow(-${rnd(2,6).toFixed(1)}px 0 rgba(60,230,255,.8)) brightness(${rnd(.65,1.95).toFixed(2)}) contrast(1.35)`);
      logo.style.setProperty('--sa-op', rnd(.7, .95).toFixed(2));
      logo.style.setProperty('--sa-clip', band());
      logo.style.setProperty('--sa-x', rnd(-11, 11).toFixed(1) + 'px');
      logo.style.setProperty('--sb-op', rnd(.7, .9).toFixed(2));
      logo.style.setProperty('--sb-clip', band());
      logo.style.setProperty('--sb-x', rnd(-11, 11).toFixed(1) + 'px');
    }

    let bursting = false, burstEnd = 0, lastShock = 0;
    function loop(now) {
      if (bursting) {
        if (now >= burstEnd) { bursting = false; clean(); }
        else if (now - lastShock >= rnd(26, 56)) { shock(); lastShock = now; }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    setInterval(() => {
      if (document.hidden) return;
      bursting = true; burstEnd = performance.now() + BURST; lastShock = 0;
    }, CLEAN + BURST);
  }

  /* ---------- boot ---------- */
  chrome();
  // restore the visitor's language choice across pages (defaults to Thai)
  let startLang = 'th';
  try { const s = localStorage.getItem('soi404_lang'); if (s === 'en' || s === 'th') startLang = s; } catch (e) {}
  setLang(startLang);
  wire();   // sets up observer + reveals above-the-fold immediately (canvas not yet running)
  form();
  hero();
  logoGlitch();   // site-wide nav logo glitch burst
  // Start the electricity AFTER the first reveals get clean frames, so the
  // canvas rAF never starves above-the-fold content into staying invisible.
  const startFx = () => { if (window.__initElectric) window.__initElectric(); };
  requestAnimationFrame(() => requestAnimationFrame(startFx));
})();
