/* ============================================================
   SOI 404 — electric.js
   ONE shared canvas, ONE rAF loop. Ambient circuit pulses,
   capped forked lightning, on-demand spark bursts.
   Pauses when tab hidden. Honors prefers-reduced-motion.
   Exposes window.SOI = { spark(x,y), bolt(...), surge() }
   Call window.__initElectric() AFTER chrome (canvas) is injected.
   ============================================================ */
window.__initElectric = function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = matchMedia('(max-width: 760px)').matches;

  const cv = document.getElementById('fx-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d', { alpha: true });
  let W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);

  // theme-aware palette so the circuit current reads on white pages too
  const LIGHT = document.body.dataset.theme === 'light';
  const C = LIGHT ? {
    trace: '150,106,14', tA0: .16, tA1: .12, pulse: '150,106,14',
    headIn: 'rgba(150,106,14,.95)', headMid: 'rgba(168,120,20,.5)', headOut: 'rgba(150,106,14,0)',
    sparkHot: '#7a5408', sparkWarm: '#9a6e10'
  } : {
    trace: '240,180,41', tA0: .05, tA1: .06, pulse: '240,184,55',
    headIn: 'rgba(255,242,196,.95)', headMid: 'rgba(240,180,41,.5)', headOut: 'rgba(240,180,41,0)',
    sparkHot: '#fffdf3', sparkWarm: '#ffd877'
  };

  function resize() {
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  /* ---------- pools ---------- */
  const sparks = [];          // small bright particles
  const bolts = [];           // forked lightning
  const pulses = [];          // ambient traveling dots
  const MAX_BOLTS = MOBILE ? 2 : 3;
  const MAX_SPARKS = MOBILE ? 70 : 160;

  /* ambient circuit traces (faint polylines) — generated once */
  const traces = [];
  (function buildTraces() {
    const n = MOBILE ? 5 : 9;
    for (let i = 0; i < n; i++) {
      const pts = [];
      let x = Math.random() * W, y = Math.random() * H;
      const steps = 4 + (Math.random() * 4 | 0);
      for (let s = 0; s < steps; s++) {
        pts.push({ x, y });
        // 90° circuit-style turns
        if (Math.random() < .5) x += (Math.random() - .5) * 320;
        else y += (Math.random() - .5) * 320;
      }
      traces.push(pts);
    }
  })();

  function lineLen(p) { let L = 0; for (let i = 1; i < p.length; i++)L += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); return L; }
  function pointAt(p, t) {
    const total = lineLen(p); let d = t * total;
    for (let i = 1; i < p.length; i++) {
      const seg = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
      if (d <= seg) { const k = d / seg; return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * k, y: p[i - 1].y + (p[i].y - p[i - 1].y) * k }; }
      d -= seg;
    }
    return p[p.length - 1];
  }

  /* ---------- spawners ---------- */
  function spark(x, y, opts = {}) {
    const count = opts.count || (MOBILE ? 8 : 14);
    const cold = opts.cold;
    for (let i = 0; i < count && sparks.length < MAX_SPARKS; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * (opts.power || 4);
      sparks.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
        life: 1, decay: .015 + Math.random() * .03,
        r: 1.3 + Math.random() * 2.3, cold: cold && Math.random() < .25
      });
    }
  }

  // forked bolt between two points via midpoint displacement
  function makeBolt(x1, y1, x2, y2, disp) {
    let pts = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    let d = disp || Math.hypot(x2 - x1, y2 - y1) * .22;
    for (let it = 0; it < 5; it++) {
      const np = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const nx = -(b.y - a.y), ny = (b.x - a.x);
        const len = Math.hypot(nx, ny) || 1;
        const off = (Math.random() - .5) * d;
        np.push(a, { x: mx + nx / len * off, y: my + ny / len * off, fork: Math.random() < .22 });
      }
      np.push(pts[pts.length - 1]);
      pts = np; d *= .55;
    }
    return pts;
  }
  function bolt(x1, y1, x2, y2, o = {}) {
    if (bolts.length >= MAX_BOLTS) return;
    const main = makeBolt(x1, y1, x2, y2);
    const forks = [];
    main.forEach((p, i) => {
      if (p.fork && i > 2 && i < main.length - 2) {
        const ang = Math.random() * Math.PI * 2, len = 40 + Math.random() * 90;
        forks.push(makeBolt(p.x, p.y, p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len, 22));
      }
    });
    bolts.push({ main, forks, life: 1, decay: .06 + Math.random() * .05, cold: o.cold, w: o.w || 1.6 });
    if (o.spark !== false) spark(x2, y2, { count: 8, power: 3, cold: o.cold });
  }

  // ambient lightning in dark/empty top area
  let nextAmbient = 900;
  function ambientBolt() {
    const x1 = W * (.2 + Math.random() * .6), y1 = -10;
    const x2 = x1 + (Math.random() - .5) * 240, y2 = H * (.15 + Math.random() * .3);
    bolt(x1, y1, x2, y2, { w: 1.3, spark: false });
  }

  // ambient circuit pulse
  function spawnPulse() {
    if (!traces.length) return;
    const tr = traces[Math.random() * traces.length | 0];
    pulses.push({ tr, t: 0, sp: .004 + Math.random() * .006, life: 1 });
  }

  /* ---------- public surge (used on section enter) ---------- */
  let intensity = 0; // 0..1, rises with scroll velocity / events
  function surge(amount = .5) { intensity = Math.min(1, intensity + amount); }

  /* ---------- main loop ---------- */
  let last = performance.now(), paused = false, ambientClock = 0, pulseClock = 0;
  function frame(now) {
    if (paused) return;
    const dt = Math.min(40, now - last); last = now;
    ctx.clearRect(0, 0, W, H);
    intensity *= .96;

    // faint static traces
    ctx.lineWidth = 1;
    for (const p of traces) {
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
      ctx.strokeStyle = 'rgba(' + C.trace + ',' + (C.tA0 + intensity * C.tA1) + ')';
      ctx.stroke();
    }

    // ambient circuit current — glowing golden packets travel the traces
    pulseClock += dt;
    if (pulseClock > 560) { pulseClock = 0; if (pulses.length < 18) spawnPulse(); }
    ctx.lineCap = 'round';
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pu = pulses[i]; pu.t += pu.sp * (dt / 16) * (1 + intensity);
      if (pu.t >= 1) { pulses.splice(i, 1); continue; }
      const head = pointAt(pu.tr, pu.t);
      const tailT = Math.max(0, pu.t - .08);
      const steps = 5;
      for (let s = 0; s < steps; s++) {
        const a = pointAt(pu.tr, tailT + (pu.t - tailT) * (s / steps));
        const b = pointAt(pu.tr, tailT + (pu.t - tailT) * ((s + 1) / steps));
        ctx.strokeStyle = 'rgba(' + C.pulse + ',' + (.55 * (s / steps) * (1 + intensity * .5)) + ')';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 7);
      g.addColorStop(0, C.headIn); g.addColorStop(.5, C.headMid); g.addColorStop(1, C.headOut);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(head.x, head.y, 7, 0, 7); ctx.fill();
    }

    // bolts
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]; b.life -= b.decay * (dt / 16);
      if (b.life <= 0) { bolts.splice(i, 1); continue; }
      const flick = .6 + Math.random() * .4;
      const draw = (pts, wMul) => {
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
        // halo
        ctx.strokeStyle = b.cold ? 'rgba(150,220,255,' + (.25 * b.life * flick) + ')' : 'rgba(240,180,41,' + (.32 * b.life * flick) + ')';
        ctx.lineWidth = b.w * 4 * wMul; ctx.stroke();
        // core
        ctx.strokeStyle = 'rgba(255,253,243,' + (b.life * flick) + ')';
        ctx.lineWidth = b.w * wMul; ctx.stroke();
      };
      draw(b.main, 1);
      b.forks.forEach(f => draw(f, .6));
    }

    // sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.vy += .12; s.x += s.vx * (dt / 16); s.y += s.vy * (dt / 16); s.life -= s.decay * (dt / 16);
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.cold ? '#bfe6ff' : (s.life > .6 ? C.sparkHot : C.sparkWarm);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  /* ---------- lifecycle ---------- */
  function start() { if (!paused) return; paused = false; last = performance.now(); requestAnimationFrame(frame); }
  function stop() { paused = true; }
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  window.SOI = window.SOI || {};
  Object.assign(window.SOI, {
    spark, bolt, surge,
    // spark at element center (for button discharges)
    sparkEl(el, opts) { const r = el.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height / 2, opts); },
    boltToEl(el) { const r = el.getBoundingClientRect(); bolt(r.left + Math.random() * r.width, r.top - 60, r.left + Math.random() * r.width, r.top, { w: 1.2 }); }
  });

  if (!REDUCED) { paused = true; start(); }
  else {
    // static single glow frame
    ctx.clearRect(0, 0, W, H);
    for (const p of traces) { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++)ctx.lineTo(p[i].x, p[i].y); ctx.strokeStyle = 'rgba(240,180,41,.05)'; ctx.stroke(); }
  }

  /* ---------- SPINE charge on scroll ---------- */
  const fill = document.querySelector('.spine__fill');
  const nodes = [...document.querySelectorAll('.spine__node')];
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      if (fill) fill.style.setProperty('--charge', (p * 100).toFixed(1) + '%');
      nodes.forEach(n => {
        const np = parseFloat(n.dataset.at || '0');
        n.classList.toggle('lit', p >= np - .01);
      });
      if (!REDUCED) surge(Math.min(.25, Math.abs(p - (onScroll._last || 0)) * 6));
      onScroll._last = p;
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};
