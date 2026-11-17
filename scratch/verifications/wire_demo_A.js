(function () {
  const win = document.querySelector('#view-field-wire .messenger-app-window');
  const stream = document.getElementById('wire-messages-stream');
  const deck = document.querySelector('#view-field-wire .messenger-reply-deck');
  stream.appendChild(deck);
  const pill = document.createElement('button'); pill.className = 'demo-pill'; pill.textContent = '↓ Hermes is waiting for your answer';
  win.appendChild(pill);
  const upd = () => { pill.style.display = (stream.scrollHeight - stream.scrollTop - stream.clientHeight > 260) ? 'block' : 'none'; };
  stream.addEventListener('scroll', upd);
  window.__demoBottom = () => { win.scrollIntoView({ block: 'end' }); stream.scrollTop = stream.scrollHeight; upd(); };
  window.__demoReadBack = () => { stream.scrollTop -= 1100; upd(); };
  window.__demoTop = () => { window.scrollTo(0, 0); };
})();
