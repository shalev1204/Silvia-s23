// The Cipher Ledger complete (docs/GAME_MASTER_GUIDE.md §5.0, A-01 and A-03). The Desert Path ends with the last two letters, I and J,
// and Silvia must hold all 26 numbers by then. When every letter of her Ledger carries its number and every line of the Ledger holds,
// Aurelia and Hermes speak a short scene, once. It never shows a number: it only reads the Ledger through window.EclipseLedger.
// State: order_ledger_complete_seen = 'true'. window.EclipseLedgerComplete.complete() / .play() are for the tester and the smoke.
window.EclipseLedgerComplete = (function () {
  'use strict';
  var KEY = 'order_ledger_complete_seen';
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var LINE_MS = 2300;
  var LINES = [
    { who: 'Aurelia', text: 'I scratched the first of those lines on the back of a disc, in a winter when I believed no one would ever read them.' },
    { who: 'Hermes', text: 'I only ever handed you the shapes of the letters, Silvia. You found the weight of every one.' },
    { who: 'Aurelia', text: 'Do not say the numbers aloud, not even to us. An alphabet like this is not a message. It is a key.' },
    { who: 'Hermes', text: 'A key to a lock I have not seen since 1971. I begin to think I was always meant to carry it to you.' },
    { who: 'Aurelia', text: 'Keep it safe. Walk east. The mirror is waiting.' }
  ];
  var timer = null, shown = false;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  // All 26 letters carry a distinct whole number from 1 to 26 and every line of the Ledger holds. The values are never stored here.
  function complete() {
    var L = window.EclipseLedger;
    if (!L || get('order_oracle_horizon_completed') !== 'true') return false;
    var taken = {};
    for (var i = 0; i < ABC.length; i++) {
      var v = L.value(ABC.charAt(i));
      if (typeof v !== 'number' || v % 1 !== 0 || v < 1 || v > 26 || taken[v]) return false;
      taken[v] = true;
    }
    var eqs = L.equations();
    if (!eqs.some(function (e) { return e.id === 'oracle-ij'; })) return false;
    return eqs.every(function (e) {
      var a = L.value(e.l1), b = L.value(e.l2);
      if (e.op === 'x2') return a * 2 === b;
      return (e.op === '-' ? a - b : a + b) === e.target;
    });
  }

  function play() {
    if (shown) return;
    shown = true;
    set(KEY, 'true');
    var root = document.createElement('div');
    root.className = 'ledger-complete-overlay';
    root.id = 'ledger-complete-overlay';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'ledger-complete-title');
    root.innerHTML =
      '<div class="ledger-complete-card">' +
        '<div class="ledger-complete-seal" aria-hidden="true">26<small>/ 26</small></div>' +
        '<h2 class="ledger-complete-title" id="ledger-complete-title">The Alphabet Is Whole</h2>' +
        '<p class="ledger-complete-sub">Twenty-six letters. Twenty-six numbers. Every one of them found by you.</p>' +
        '<div class="ledger-complete-lines" aria-live="polite"></div>' +
        '<button type="button" class="ledger-complete-close" id="btn-ledger-complete-close">✦ Close the Ledger</button>' +
      '</div>';
    document.body.appendChild(root);
    var box = root.querySelector('.ledger-complete-lines');
    var btn = root.querySelector('#btn-ledger-complete-close');
    var i = 0;
    function next() {
      if (i >= LINES.length) { timer = null; return; }
      var l = LINES[i++];
      var p = document.createElement('p');
      p.className = 'lc-line lc-' + l.who.toLowerCase();
      var who = document.createElement('span');
      who.className = 'lc-who'; who.textContent = l.who;
      p.appendChild(who); p.appendChild(document.createTextNode(' ' + l.text));
      box.appendChild(p);
      timer = i < LINES.length ? setTimeout(next, LINE_MS) : null;
    }
    function skipToEnd() { if (timer) { clearTimeout(timer); timer = null; } while (i < LINES.length) next(); }
    function close() {
      if (timer) { clearTimeout(timer); timer = null; }
      document.removeEventListener('keydown', onKey);
      if (root.parentNode) root.parentNode.removeChild(root);
      shown = false;
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    btn.addEventListener('click', close);
    root.querySelector('.ledger-complete-card').addEventListener('click', function (e) { if (e.target !== btn) skipToEnd(); });
    document.addEventListener('keydown', onKey);
    if (reduced()) skipToEnd(); else next();
    btn.focus();
  }

  var pending = null;
  function check() {
    if (get(KEY) === 'true' || shown) return;
    if (complete()) play();
  }
  document.addEventListener('ledger:changed', function () {
    if (pending) clearTimeout(pending);
    pending = setTimeout(check, 1200);   // she may still be typing the last digits
  });
  return { complete: complete, play: play };
})();
