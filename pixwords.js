/* ============================================================
   SOI 404 — pixwords.js
   Any inline element tagged .pixword sheds small gold pixel blocks
   that float to the right (the motif borrowed from the 404 number).
   Re-injects whenever the i18n rebuilds the host heading (language
   toggle), so the effect survives ไทย / EN switching.
   Load AFTER site.js.
   ============================================================ */
(function () {
  const SMALL = matchMedia('(max-width:760px)').matches;

  function buildField(word) {
    word.querySelectorAll(':scope > .pixspray').forEach(e => e.remove());
    word.style.position = 'relative';
    const f = document.createElement('span');
    f.className = 'pixspray';
    const N = SMALL ? 10 : 16;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('i');
      const sz = 3 + Math.random() * 5;                      // 3–8px blocks
      s.style.width = s.style.height = sz + 'px';
      s.style.left = (Math.pow(Math.random(), 1.7) * 82) + '%';   // denser near the word
      s.style.top = (Math.random() * 100) + '%';
      s.style.setProperty('--dx', (14 + Math.random() * 38) + 'px');
      s.style.setProperty('--dy', ((Math.random() - .5) * 22) + 'px');
      s.style.setProperty('--dur', (2.2 + Math.random() * 2.4) + 's');
      s.style.setProperty('--del', (Math.random() * 3) + 's');
      f.appendChild(s);
    }
    word.appendChild(f);
  }

  function init() {
    // group .pixword targets by the heading whose innerHTML the i18n swaps
    const hosts = new Set();
    document.querySelectorAll('.pixword').forEach(w => {
      hosts.add(w.closest('[data-html],[data-th]') || w.parentElement || w);
    });
    hosts.forEach(host => {
      let obs;
      function inject() {
        if (obs) obs.disconnect();
        host.querySelectorAll('.pixword').forEach(buildField);
        if (obs) obs.observe(host, { childList: true, subtree: true });
      }
      obs = new MutationObserver(inject);
      inject();
    });
  }

  init();
})();
