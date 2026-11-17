(function () {
  const win = document.querySelector('#view-field-wire .messenger-app-window');
  const stream = document.getElementById('wire-messages-stream');
  const deck = document.querySelector('#view-field-wire .messenger-reply-deck');
  const t = (document.getElementById('wire-completed-bar') || {}).innerText || '';
  const pct = (t.match(/(\d+)%/) || [, '80'])[1], eta = (t.match(/IN ([\dH ]+MIN)/i) || [, '3 h 39 min'])[1];
  const n = document.querySelectorAll('#wire-choices-grid button, #wire-choices-grid .messenger-choice-btn').length || 2;
  const fold = document.createElement('div'); fold.className = 'demo-fold';
  fold.innerHTML = `<span class="df-dot"></span><span class="df-wait">Hermes is waiting · ${n} replies</span>`
    + `<span class="df-trip">🧭 CAIRN IV · ${pct}% · ${eta.toLowerCase()}</span><span class="df-bar"><i style="width:${pct}%"></i></span><span class="df-go">↓ Answer</span>`;
  deck.appendChild(fold);
  const upd = () => deck.classList.toggle('demo-collapsed', stream.scrollHeight - stream.scrollTop - stream.clientHeight > 120);
  stream.addEventListener('scroll', upd);
  window.__demoBottom = () => { win.scrollIntoView({ block: 'end' }); stream.scrollTop = stream.scrollHeight; upd(); };
  window.__demoReadBack = () => { stream.scrollTop -= 900; upd(); };
  window.__demoTop = () => { window.scrollTo(0, 0); };
})();
