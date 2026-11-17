(function () {
  const bar = document.querySelector('.hub-viewport-header');
  const deck = document.querySelector('#view-field-wire .messenger-reply-deck');
  const r = bar.getBoundingClientRect();
  bar.classList.add('demo-float');
  document.documentElement.style.setProperty('--demo-bar', r.height + 'px');
  const pill = document.createElement('button'); pill.className = 'demo-pill'; pill.textContent = '↓ Hermes is waiting for your answer';
  deck.parentNode.insertBefore(pill, deck);
  let last = window.scrollY;
  const upd = () => {
    const y = window.scrollY;
    if (y <= r.height) { bar.classList.remove('show'); document.body.classList.remove('demo-menu-on'); }
    else if (y < last - 2) { bar.classList.add('show'); document.body.classList.add('demo-menu-on'); }
    else if (y > last + 2) { bar.classList.remove('show'); document.body.classList.remove('demo-menu-on'); }
    last = y;
    pill.style.display = deck.getBoundingClientRect().top > innerHeight - 40 ? 'block' : 'none';
  };
  addEventListener('scroll', upd, { passive: true });
  window.__demoBottom = () => { scrollTo(0, document.documentElement.scrollHeight); last = scrollY; upd(); };
  window.__demoReadBack = () => { scrollTo(0, scrollY - 1400); last = scrollY; bar.classList.remove('show'); document.body.classList.remove('demo-menu-on'); pill.style.display = 'block'; };
  window.__demoTop = () => { scrollTo(0, scrollY - 120); upd(); };
})();
