/* Cardora concept: sign-in and create-account pages. Preview only: nothing typed here is sent anywhere. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const motion = !!window.gsap && !reduce;
  if (!motion) root.classList.remove('js-motion');

  /* theme toggle (shares the store's saved choice) */
  const themeBtn = $('#themeBtn'), themeMeta = $('meta[name="theme-color"]');
  const sync = () => {
    const light = root.dataset.theme === 'light';
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    themeMeta.content = light ? '#fbf9f3' : '#05090f';
  };
  sync();
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    const apply = () => { if (next === 'light') root.dataset.theme = 'light'; else delete root.dataset.theme; sync(); };
    try { localStorage.setItem('cardora-concept-theme', next); } catch (e) {}
    if (!document.startViewTransition || reduce) { apply(); return; }
    const r = themeBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
  });

  /* sign in: preview only */
  const signIn = $('#signInBtn');
  if (signIn) signIn.addEventListener('click', () => { $('#status').textContent = 'Preview only. On the live site this signs you in and opens your orders.'; });

  /* create account: walk through the three steps of Cardora's real flow */
  const panes = $$('.pane'), flow = $$('.flow li');
  const go = n => {
    panes.forEach((p, i) => { p.hidden = i !== n; });
    flow.forEach((li, i) => li.classList.toggle('on', i <= n));
    const h = panes[n] && panes[n].querySelector('h1,h2,button,a'); if (h && n > 0) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  };
  $$('[data-go]').forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));

  if (!motion) return;
  const EXPO = 'expo.out';
  gsap.timeline({ defaults: { ease: EXPO }, delay: .1 })
    .from('.auth-brand', { opacity: 0, scale: .97, duration: 1.1 }, 0)
    .fromTo('.line>span', { yPercent: 115, opacity: 1 }, { yPercent: 0, duration: 1.1, stagger: .1 }, .15)
    .fromTo('[data-in]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .9, stagger: .06 }, .3)
    .fromTo('.gc-wrap.xb .gc', { opacity: 0, y: 140, rotationZ: 36 }, { opacity: 1, y: 0, rotationZ: 12, duration: 1.4 }, .3)
    .fromTo('.gc-wrap.ps .gc', { opacity: 0, y: 170, rotationZ: -36 }, { opacity: 1, y: 0, rotationZ: -9, duration: 1.4 }, .42)
    .fromTo('.gc', { '--sheen': '110%' }, { '--sheen': '-10%', duration: 1.6, ease: 'power2.inOut', stagger: .15, clearProps: '--sheen' }, .9);
  gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut', duration: 3.6 } })
    .to('.gc-wrap.xb', { y: -12, rotationZ: 1.5 }, 0).to('.gc-wrap.ps', { y: 10, rotationZ: -1.5 }, 0);

  const area = $('.auth-brand'), target = $('.auth-tilt');
  if (fine && target) {
    const rx = gsap.quickTo(target, 'rotationX', { duration: .7, ease: 'power3' }), ry = gsap.quickTo(target, 'rotationY', { duration: .7, ease: 'power3' });
    area.addEventListener('pointermove', e => {
      const r = area.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      ry(px * 16); rx(-py * 16); target.style.setProperty('--sheen', (100 - (px + .5) * 100) + '%');
    });
    area.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
})();
