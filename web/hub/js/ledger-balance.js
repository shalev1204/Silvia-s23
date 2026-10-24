    // =========================================================================
    // ⚖ THE SURVEYOR'S BALANCE · the reward of Station 11 (the Salt Playa)
    // A brass balance of the Order, found in the marker on the south shore of the Salt Playa. It sits in the
    // Cipher Ledger and walks Silvia through the lines that come in pairs: a sum and a difference of the same
    // two letters (K + G = 48 and K − G = 4). Three steps, every number typed by her and checked:
    //   I.   add the two totals;   II.  halve it: the heavier letter;   III. take it from the sum: the lighter one.
    // Rule 9: it never shows a letter's value she has not worked out herself. The only numbers on screen are the
    // totals printed on her lines, what she typed, and (to warn of a clash) nothing from her Ledger but its verdict.
    // It reads and writes the Ledger only through window.EclipseLedger (hub-core.js) and redraws on `ledger:changed`.
    // Her open pair and her steps are kept per seeker in localStorage `order_balance_state`.
    // =========================================================================
    (function initSurveyorsBalance() {
      'use strict';
      const mount = document.getElementById('surveyors-balance');
      const ledger = window.EclipseLedger;
      if (!mount || !ledger) return;

      const STATE_KEY = 'order_balance_state';
      const UNLOCK_KEY = 'order_salt_playa_completed';
      const SALT_LINE = 'playa-ta';
      const TILT = [-9, -6, -3, 0];            // the beam's lean in degrees (left pan down) after 0, 1, 2 and 3 steps
      const PX = 280, PY = 92, ARM = 176;      // the pivot and the half-length of the beam, in the drawing's units
      const MINUS = '−';
      const NUMERALS = ['I', 'II', 'III'];

      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const seeker = () => String(window.currentSeeker || get('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
      const has = (v) => v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v));
      const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const chime = () => { try { if (window.sfx && typeof window.sfx.playChimeHover === 'function') window.sfx.playChimeHover(); } catch (e) {} };
      const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
      const lineText = (eq) => `${eq.l1} ${eq.op === '-' ? MINUS : '+'} ${eq.l2} = ${eq.target}`;
      const both = (pair) => `${pair.big} and ${pair.small}`;

      // ---- The pairs: a '+' line and a '−' line over the same two letters (either order) ----
      function findPairs() {
        const lines = (ledger.equations() || []).filter((eq) => (eq.op === '+' || eq.op === '-') && eq.l1 && eq.l2
          && eq.l1 !== eq.l2 && Number.isFinite(Number(eq.target)));
        const key = (eq) => [eq.l1, eq.l2].sort().join('');
        const pairs = [];
        lines.filter((eq) => eq.op === '+').forEach((sum) => {
          lines.filter((eq) => eq.op === '-' && key(eq) === key(sum)).forEach((diff) => {
            // the letter written first in the difference is the heavier one
            pairs.push({ id: `${sum.id}|${diff.id}`, sum, diff, big: diff.l1, small: diff.l2,
              sumT: Number(sum.target), diffT: Number(diff.target) });
          });
        });
        return pairs;
      }

      // What each step must weigh, from the line totals and her own earlier answers only
      function expected(pair, step, entries) {
        if (step === 0) return pair.sumT + pair.diffT;
        if (step === 1) return entries[0] / 2;
        return pair.sumT - entries[1];
      }

      // ---- Her progress: { [seeker]: { open: pairId, pairs: { [pairId]: { step, entries } } } } ----
      function readAll() {
        try { const all = JSON.parse(get(STATE_KEY) || '{}'); return (all && typeof all === 'object') ? all : {}; } catch (e) { return {}; }
      }
      function mine() {
        const s = readAll()[seeker()];
        return (s && typeof s === 'object') ? s : {};
      }
      function saveMine(s) {
        const all = readAll();
        all[seeker()] = s;
        put(STATE_KEY, JSON.stringify(all));
      }
      // A saved run is kept only as far as it still weighs true (a line may have changed since)
      function progressOf(pair) {
        const saved = ((mine().pairs || {})[pair.id]) || {};
        const entries = Array.isArray(saved.entries) ? saved.entries.map(Number) : [];
        let step = 0;
        while (step < 3 && step < Number(saved.step || 0) && entries[step] === expected(pair, step, entries)) step++;
        return { step, entries: entries.slice(0, step) };
      }
      function saveProgress(pair, prog) {
        const s = mine();
        s.open = pair ? pair.id : null;
        s.pairs = s.pairs || {};
        if (pair) s.pairs[pair.id] = { step: prog.step, entries: prog.entries.slice(0, prog.step) };
        saveMine(s);
      }

      // =====================================================================
      // The drawing: a brass balance in a master's notebook (sepia ink on parchment, hatching, construction lines)
      // =====================================================================
      const SVG_NS = 'http://www.w3.org/2000/svg';
      function pan(side) {
        // drawn around its hook (0, 0); the beam carries it, it always hangs level
        return `
          <g class="sb-pan sb-pan-${side}" id="sb-pan-${side}">
            <circle class="sb-ink-thin" cx="0" cy="6" r="3.6" fill="none"/>
            <path class="sb-chain" d="M0 9 L0 97"/>
            <path class="sb-chain" d="M0 9 L-55 105"/>
            <path class="sb-chain" d="M0 9 L55 105"/>
            <ellipse class="sb-pan-inside" cx="0" cy="106" rx="58" ry="9"/>
            <g class="sb-piece sb-piece-line">
              <rect class="sb-scroll" x="-34" y="93" width="38" height="11" rx="5.5"/>
              <ellipse class="sb-scroll-end" cx="4" cy="98.5" rx="3" ry="5.5"/>
              <path class="sb-ink-thin" d="M-28 96.5 H-4 M-28 100.5 H-8"/>
              <path class="sb-seal" d="M-15 104 l-2 5 l2 -1.5 l2 1.5 z"/>
            </g>
            <g class="sb-piece sb-piece-letter">
              <path class="sb-weight" d="M7 107 L12.5 86 Q22 79 31.5 86 L37 107 Z"/>
              <circle class="sb-weight" cx="22" cy="79" r="4"/>
              <path class="sb-hatch-fill" d="M26 84 Q31 85 31.5 86 L37 107 L29 107 Z"/>
              <text class="sb-weight-letter" x="21" y="102" text-anchor="middle"></text>
            </g>
            <path class="sb-bowl" d="M-58 106 A58 9 0 0 0 58 106 Q50 130 0 133 Q-50 130 -58 106 Z"/>
            <path class="sb-hatch-fill" clip-path="url(#sb-clip-shade)" d="M-58 106 A58 9 0 0 0 58 106 Q50 130 0 133 Q-50 130 -58 106 Z"/>
            <path class="sb-ink-thin sb-faint" d="M-46 112 Q0 124 46 112"/>
            <ellipse class="sb-foot" cx="0" cy="134" rx="13" ry="3"/>
          </g>`;
      }
      const RAYS = Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30) * Math.PI / 180, r1 = 21, r2 = i % 2 ? 30 : 38;
        return `M${(PX + r1 * Math.cos(a)).toFixed(1)} ${(PY + r1 * Math.sin(a)).toFixed(1)} L${(PX + r2 * Math.cos(a)).toFixed(1)} ${(PY + r2 * Math.sin(a)).toFixed(1)}`;
      }).join(' ');
      const TICKS = [-12, -6, 0, 6, 12].map((d) => {
        const a = d * Math.PI / 180, r1 = d === 0 ? 54 : 57, r2 = 65;
        return `M${(PX + r1 * Math.sin(a)).toFixed(1)} ${(PY - r1 * Math.cos(a)).toFixed(1)} L${(PX + r2 * Math.sin(a)).toFixed(1)} ${(PY - r2 * Math.cos(a)).toFixed(1)}`;
      }).join(' ');
      const DRAWING = `
        <svg class="sb-svg" viewBox="0 0 560 320" xmlns="${SVG_NS}" aria-hidden="true" focusable="false">
          <defs>
            <pattern id="sb-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(42)">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#3a2510" stroke-width="0.8" stroke-opacity="0.55"/>
            </pattern>
            <pattern id="sb-hatch-x" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#3a2510" stroke-width="0.7" stroke-opacity="0.45"/>
              <line x1="0" y1="0" x2="6" y2="0" stroke="#3a2510" stroke-width="0.5" stroke-opacity="0.3"/>
            </pattern>
            <linearGradient id="sb-brass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#f7dfa0"/><stop offset="0.45" stop-color="#d9ac5a"/><stop offset="1" stop-color="#9a6b2c"/>
            </linearGradient>
            <linearGradient id="sb-brass-h" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#f5d98f"/><stop offset="0.5" stop-color="#d4a853"/><stop offset="1" stop-color="#8a5f22"/>
            </linearGradient>
            <radialGradient id="sb-pan-in" cx="0.4" cy="0.35" r="0.8">
              <stop offset="0" stop-color="#f9e7b4"/><stop offset="1" stop-color="#b98a43"/>
            </radialGradient>
            <clipPath id="sb-clip-shade" clipPathUnits="userSpaceOnUse"><rect x="6" y="100" width="60" height="40"/></clipPath>
            <filter id="sb-rough" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7"/>
              <feDisplacementMap in="SourceGraphic" scale="1.8"/>
            </filter>
          </defs>

          <!-- the master's construction lines: level, plumb, the swing of each arm, the triangle of the stand -->
          <g class="sb-construct" filter="url(#sb-rough)">
            <path d="M34 ${PY} H526"/>
            <path d="M${PX} 14 V304"/>
            <path d="M109.2 49.4 A176 176 0 0 0 109.2 134.6"/>
            <path d="M450.8 49.4 A176 176 0 0 1 450.8 134.6"/>
            <circle cx="${PX}" cy="${PY}" r="34"/>
            <path d="M168 300 L${PX} ${PY} L392 300"/>
            <circle cx="104" cy="${PY}" r="4"/><circle cx="456" cy="${PY}" r="4"/>
          </g>

          <!-- ground and the stand -->
          <g class="sb-stand" filter="url(#sb-rough)">
            <ellipse cx="${PX}" cy="301" rx="128" ry="8" fill="url(#sb-hatch-x)"/>
            <path class="sb-ink-thin" d="M52 302 C150 298 410 305 508 300"/>
            <path class="sb-ink-thin sb-faint" d="M78 307 C180 304 380 309 482 306"/>

            <!-- the stand's index: a brass arc with five marks, the tongue of the beam reads it -->
            <path class="sb-brass-line" d="M268 116 C250 92 250 52 262.5 31.5"/>
            <path class="sb-brass-line" d="M292 116 C310 92 310 52 297.5 31.5"/>
            <path class="sb-index" d="M262.5 31.5 A62 62 0 0 1 297.5 31.5"/>
            <path class="sb-ink-thin" d="${TICKS}"/>
            <path class="sb-brass sb-ink" d="M${PX} 6 C276 12 274 18 ${PX} 26 C286 18 284 12 ${PX} 6 Z"/>
            <circle class="sb-brass sb-ink" cx="${PX}" cy="28" r="3"/>

            <!-- plinth: two steps, a torus, scroll feet and an acanthus leaf -->
            <path class="sb-brass sb-ink" d="M176 297 L384 297 L377 284 L183 284 Z"/>
            <path class="sb-hatch-fill" d="M300 284 L377 284 L384 297 L300 297 Z"/>
            <rect class="sb-brass sb-ink" x="190" y="274" width="180" height="10" rx="5"/>
            <path class="sb-ink-thin sb-faint" d="M198 279 H362"/>
            <path class="sb-brass sb-ink" d="M206 274 L354 274 L345 252 L215 252 Z"/>
            <path class="sb-hatch-fill" d="M300 252 L345 252 L354 274 L300 274 Z"/>
            <path class="sb-leaf sb-ink" d="M${PX} 272 C268 267 264 259 271 254 C273 260 277 262 ${PX} 256 C283 262 287 260 289 254 C296 259 292 267 ${PX} 272 Z"/>
            <path class="sb-ink-thin" d="M${PX} 270 V258 M${PX} 266 L274 259 M${PX} 266 L286 259"/>
            <path class="sb-ink sb-volute" d="M190 292 c-7 0 -11 -4 -11 -9 c0 -5 4 -8 8 -8 c4 0 6 3 6 6 c0 3 -2 5 -5 5 c-2 0 -3 -1.5 -3 -3"/>
            <path class="sb-ink sb-volute" d="M370 292 c7 0 11 -4 11 -9 c0 -5 -4 -8 -8 -8 c-4 0 -6 3 -6 6 c0 3 2 5 5 5 c2 0 3 -1.5 3 -3"/>

            <!-- the column: tapered, fluted, a turned baluster and rings -->
            <path class="sb-ink" fill="url(#sb-brass-h)" d="M270 250 L272 126 L288 126 L290 250 Z"/>
            <path class="sb-ink-thin sb-faint" d="M276 132 V244 M280 132 V244 M284 132 V244"/>
            <path class="sb-hatch-fill" d="M285 126 L288 126 L290 250 L286 250 Z"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="263" y="242" width="34" height="9" rx="3.5"/>
            <ellipse class="sb-ink" fill="url(#sb-brass-h)" cx="${PX}" cy="196" rx="15" ry="10"/>
            <path class="sb-hatch-fill" d="M286 188 Q296 196 286 205 Z"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="266" y="208" width="28" height="5" rx="2.5"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="266" y="180" width="28" height="5" rx="2.5"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="266" y="148" width="28" height="5" rx="2.5"/>

            <!-- capital with volutes and the knife-edge saddle the beam rests on -->
            <path class="sb-brass sb-ink" d="M260 127 L300 127 L295 117 L265 117 Z"/>
            <path class="sb-ink sb-volute" d="M265 127 c-5 0 -8 -3 -8 -6 c0 -3 3 -5 5 -5 c3 0 4 2 4 4 c0 1.5 -1 2.5 -2.5 2.5"/>
            <path class="sb-ink sb-volute" d="M295 127 c5 0 8 -3 8 -6 c0 -3 -3 -5 -5 -5 c-3 0 -4 2 -4 4 c0 1.5 1 2.5 2.5 2.5"/>
            <path class="sb-brass sb-ink" d="M268 117 L292 117 L284 104 L276 104 Z"/>
          </g>

          <!-- the beam (turns about the pivot) -->
          <g class="sb-beam" id="sb-beam">
            <path class="sb-brass sb-ink" d="M${PX - 2.5} 88 L${PX} 36 L${PX + 2.5} 88 Z"/>
            <path class="sb-ink" fill="url(#sb-brass)" d="M104 89 Q192 84 ${PX} 83 Q368 84 456 89 L456 95 Q368 100 ${PX} 103 Q192 100 104 95 Z"/>
            <path class="sb-hatch-fill" d="M110 94.5 Q192 99 ${PX} 102 Q368 99 450 94.5 L450 95.4 Q368 100 ${PX} 103 Q192 100 110 95.4 Z"/>
            <path class="sb-ink-thin sb-faint" d="M116 91.5 Q${PX} 89.5 444 91.5"/>
            <path class="sb-ink-thin sb-faint" d="M150 88 c8 -3 14 3 22 0 M410 88 c-8 -3 -14 3 -22 0"/>
            <circle class="sb-brass sb-ink" cx="101" cy="${PY}" r="6"/>
            <circle class="sb-brass sb-ink" cx="459" cy="${PY}" r="6"/>
            <path class="sb-brass sb-ink" d="M95 ${PY} L85 ${PY - 4} L85 ${PY + 4} Z"/>
            <path class="sb-brass sb-ink" d="M465 ${PY} L475 ${PY - 4} L475 ${PY + 4} Z"/>
            ${[-120, -60, 60, 120].map((dx) => `<circle class="sb-rivet" cx="${PX + dx}" cy="${PY}" r="2.6"/><path class="sb-ink-thin" d="M${PX + dx - 1.8} ${PY} H${PX + dx + 1.8}"/>`).join('')}
            <path class="sb-rays" d="${RAYS}"/>
            <g class="sb-emblem" id="sb-emblem">
              <circle class="sb-brass sb-ink" cx="${PX}" cy="${PY}" r="15.5"/>
              <path fill="#17110a" d="M${PX} ${PY - 12} A12 12 0 0 0 ${PX} ${PY + 12} Z"/>
              <path fill="#f7f0dd" d="M${PX} ${PY - 12} A12 12 0 0 1 ${PX} ${PY + 12} Z"/>
              <circle class="sb-ink-thin" cx="${PX}" cy="${PY}" r="12" fill="none"/>
              <circle class="sb-brass sb-ink" cx="${PX}" cy="${PY}" r="2"/>
            </g>
          </g>
          ${pan('left')}
          ${pan('right')}
        </svg>`;

      // =====================================================================
      // The card: a header, the pairs, then the bench (the balance and the three steps)
      // =====================================================================
      mount.innerHTML = '';
      mount.setAttribute('aria-labelledby', 'sb-title');
      mount.setAttribute('role', 'region');

      const head = el('header', 'sb-head');
      head.innerHTML = `
        <svg class="sb-head-emblem" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle cx="24" cy="24" r="21" fill="url(#sb-head-brass)" stroke="#3b280a" stroke-width="1.5"/>
          <defs><linearGradient id="sb-head-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe099"/><stop offset="1" stop-color="#8a5f22"/></linearGradient></defs>
          <path d="M24 9 A15 15 0 0 0 24 39 Z" fill="#17110a"/>
          <path d="M24 9 A15 15 0 0 1 24 39 Z" fill="#f7f0dd"/>
          <circle cx="24" cy="24" r="15" fill="none" stroke="#3b280a" stroke-width="1.2"/>
        </svg>`;
      const headText = el('div', 'sb-head-text');
      const title = el('h3', 'sb-title', "The Surveyor's Balance");
      title.id = 'sb-title';
      const lore = el('p', 'sb-lore', 'Found in the marker on the south shore of the Salt Playa: a brass balance of the Order, with the half-black, half-white circle set on its beam.');
      const how = el('p', 'sb-how');
      how.append(el('span', 'sb-how-label', 'How it works'),
        document.createTextNode(' Choose two lines that hold the same two letters, one adding them and one taking one from the other. Lay both on the beam, and three small sums of your own give you each letter.'));
      headText.append(title, lore, how);
      head.append(headText);

      const pairsWrap = el('section', 'sb-pairs-wrap');
      pairsWrap.setAttribute('aria-labelledby', 'sb-pairs-title');
      const pairsTitle = el('h4', 'sb-sub', 'Lines that come in pairs');
      pairsTitle.id = 'sb-pairs-title';
      const pairsList = el('div', 'sb-pairs');
      const pairsEmpty = el('p', 'sb-empty', 'No two lines of your Ledger share the same two letters yet. When one adds them and another takes one from the other, they will wait for you here.');
      pairsEmpty.hidden = true;
      pairsWrap.append(pairsTitle, pairsList, pairsEmpty);

      const bench = el('div', 'sb-bench');
      bench.hidden = true;
      const stage = el('div', 'sb-stage');
      stage.innerHTML = DRAWING;
      const plaques = el('div', 'sb-plaques');
      const plaqueL = el('div', 'sb-plaque sb-plaque-left');
      const plaqueR = el('div', 'sb-plaque sb-plaque-right');
      plaques.append(plaqueL, plaqueR);
      stage.append(plaques);

      const work = el('div', 'sb-work');
      const stepsList = el('ol', 'sb-steps');
      const feedback = el('p', 'sb-feedback');
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      const finish = el('div', 'sb-finish');
      finish.hidden = true;
      const finishSay = el('p', 'sb-finish-say');
      const conflict = el('p', 'sb-conflict');
      conflict.hidden = true;
      const actions = el('div', 'sb-actions');
      const btnWrite = el('button', 'sb-btn sb-btn-primary');
      btnWrite.type = 'button';
      const btnSalt = el('button', 'sb-btn', 'Check with The Line of the Salt');
      btnSalt.type = 'button';
      const btnAgain = el('button', 'sb-btn sb-btn-quiet', 'Weigh this pair again');
      btnAgain.type = 'button';
      actions.append(btnWrite, btnSalt, btnAgain);
      const confirmBox = el('div', 'sb-confirm');
      confirmBox.hidden = true;
      confirmBox.setAttribute('role', 'group');
      confirmBox.setAttribute('aria-label', 'Replace a letter in your Ledger');
      const confirmSay = el('p', 'sb-confirm-say');
      const btnReplace = el('button', 'sb-btn sb-btn-primary', 'Replace it with the balance');
      btnReplace.type = 'button';
      const btnKeep = el('button', 'sb-btn sb-btn-quiet', 'Keep my Ledger as it is');
      btnKeep.type = 'button';
      const confirmRow = el('div', 'sb-actions');
      confirmRow.append(btnReplace, btnKeep);
      confirmBox.append(confirmSay, confirmRow);
      const saltSay = el('p', 'sb-salt');
      saltSay.hidden = true;
      saltSay.setAttribute('aria-live', 'polite');
      finish.append(finishSay, conflict, actions, confirmBox, saltSay);
      work.append(stepsList, feedback, finish);
      bench.append(stage, work);

      mount.append(head, pairsWrap, bench);

      const svg = stage.querySelector('svg');
      const beamG = svg.querySelector('#sb-beam');
      const panL = svg.querySelector('#sb-pan-left');
      const panR = svg.querySelector('#sb-pan-right');
      const emblem = svg.querySelector('#sb-emblem');

      // =====================================================================
      // The beam: a damped spring toward the lean of the current step; a wrong weight sets it rocking
      // =====================================================================
      const beam = { angle: TILT[0], vel: 0, target: TILT[0], raf: 0, last: 0 };
      function drawBeam() {
        const a = beam.angle * Math.PI / 180, dx = ARM * Math.cos(a), dy = ARM * Math.sin(a);
        beamG.setAttribute('transform', `rotate(${beam.angle.toFixed(3)} ${PX} ${PY})`);
        panL.setAttribute('transform', `translate(${(PX - dx).toFixed(2)} ${(PY - dy).toFixed(2)})`);
        panR.setAttribute('transform', `translate(${(PX + dx).toFixed(2)} ${(PY + dy).toFixed(2)})`);
      }
      function tick(t) {
        const dt = Math.min(0.033, Math.max(0.001, (t - beam.last) / 1000));
        beam.last = t;
        beam.vel += (-55 * (beam.angle - beam.target) - 4.6 * beam.vel) * dt;
        beam.angle += beam.vel * dt;
        if (Math.abs(beam.angle - beam.target) < 0.02 && Math.abs(beam.vel) < 0.08) {
          beam.angle = beam.target; beam.vel = 0; beam.raf = 0; drawBeam(); return;
        }
        drawBeam();
        beam.raf = requestAnimationFrame(tick);
      }
      function moveBeam(target, kick) {
        beam.target = target;
        if (reduceMotion() || mount.hidden || bench.hidden) {
          if (beam.raf) cancelAnimationFrame(beam.raf);
          beam.raf = 0; beam.angle = target; beam.vel = 0; drawBeam(); return;
        }
        if (kick) beam.vel += kick;
        if (!beam.raf) { beam.last = performance.now(); beam.raf = requestAnimationFrame(tick); }
      }
      function flash(node, cls, ms) {
        node.classList.remove(cls);
        void node.getBoundingClientRect();
        node.classList.add(cls);
        clearTimeout(node['_sb_' + cls]);
        node['_sb_' + cls] = setTimeout(() => node.classList.remove(cls), ms);
      }

      // =====================================================================
      // State on screen
      // =====================================================================
      let pairs = [];
      let open = null;          // the pair on the beam
      let prog = { step: 0, entries: [] };
      let shownKey = '';        // seeker + pair the steps were built for

      function isUnlocked() { return get(UNLOCK_KEY) === 'true'; }

      function renderPairs() {
        const sig = pairs.map((p) => p.id).join(',');
        if (pairsList.dataset.sig !== sig) {
          pairsList.dataset.sig = sig;
          pairsList.innerHTML = '';
          pairs.forEach((pair) => {
            const chip = el('button', 'sb-chip');
            chip.type = 'button';
            chip.dataset.pair = pair.id;
            const rows = el('span', 'sb-chip-rows');
            [pair.sum, pair.diff].forEach((eq) => {
              const row = el('span', 'sb-chip-row');
              row.append(el('span', 'sb-chip-name', eq.name), el('span', 'sb-chip-expr', lineText(eq)));
              rows.append(row);
            });
            const done = el('span', 'sb-chip-done');
            done.append(el('span', 'sb-chip-tick', '✓'), el('span', 'sb-sr', ` ${both(pair)} are already in your Ledger`));
            chip.append(rows, done);
            chip.addEventListener('click', () => openPair(pair.id, true));
            pairsList.append(chip);
          });
        }
        pairsEmpty.hidden = pairs.length > 0;
        pairsList.querySelectorAll('.sb-chip').forEach((chip) => {
          const pair = pairs.find((p) => p.id === chip.dataset.pair);
          const inLedger = !!pair && has(ledger.value(pair.big)) && has(ledger.value(pair.small));
          chip.classList.toggle('is-known', inLedger);
          chip.querySelector('.sb-chip-done').hidden = !inLedger;
          const on = !!open && open.id === chip.dataset.pair;
          chip.setAttribute('aria-pressed', on ? 'true' : 'false');
          chip.classList.toggle('is-open', on);
        });
      }

      function renderPlaques() {
        const fill = (node, side, eq) => {
          node.innerHTML = '';
          node.append(el('span', 'sb-plaque-side', side), el('span', 'sb-plaque-name', eq.name), el('span', 'sb-plaque-expr', lineText(eq)));
        };
        fill(plaqueL, 'Left pan · sum', open.sum);
        fill(plaqueR, 'Right pan · difference', open.diff);
        panL.querySelector('.sb-weight-letter').textContent = open.big;
        panR.querySelector('.sb-weight-letter').textContent = open.small;
      }

      function placePieces(animate) {
        const set = (node, on) => {
          if (!animate) node.classList.add('no-anim');
          node.classList.toggle('is-placed', on);
          if (!animate) { void node.getBoundingClientRect(); node.classList.remove('no-anim'); }
        };
        set(panL.querySelector('.sb-piece-line'), prog.step >= 1);
        set(panR.querySelector('.sb-piece-line'), prog.step >= 1);
        set(panL.querySelector('.sb-piece-letter'), prog.step >= 2);
        set(panR.querySelector('.sb-piece-letter'), prog.step >= 3);
      }

      // The three steps: what she does, in words; the sum she fills in, with her own earlier numbers
      function stepWords(i) {
        if (i === 0) return 'Lay both lines on the beam: add the two totals.';
        if (i === 1) return `Halve it: that is the heavier letter, ${open.big}.`;
        return `Take it from the sum: what is left is the lighter letter, ${open.small}.`;
      }
      function stepSum(i) {
        const e = prog.entries;
        if (i === 0) return `${open.sumT} + ${open.diffT} =`;
        if (i === 1) return `${open.big} = ${prog.step >= 1 ? e[0] : '…'} ÷ 2 =`;
        return `${open.small} = ${open.sumT} ${MINUS} ${prog.step >= 2 ? e[1] : open.big} =`;
      }
      function stepLabel(i) {
        if (i === 0) return `The two totals added: ${open.sumT} plus ${open.diffT}`;
        if (i === 1) return `${open.big}, half of your total`;
        return `${open.small}, the sum ${open.sumT} take away ${open.big}`;
      }
      function hintWords(i) {
        if (i === 0) return `Not quite. Put the two totals side by side and add them: the total of ${open.sum.name} and the total of ${open.diff.name}.`;
        if (i === 1) return `Not quite. Split the number you found in step I into two equal halves; one half is ${open.big}.`;
        return `Not quite. Start from the total of the sum line, ${open.sum.name}, and take away the ${open.big} you just found; what is left is ${open.small}.`;
      }
      function rightWords(i) {
        if (i === 0) return 'Both lines lie on the beam. It still leans toward the sum.';
        if (i === 1) return `${open.big} is weighed. The beam begins to rise.`;
        return `${open.small} is weighed. The beam comes level.`;
      }

      function renderSteps(focusStep) {
        stepsList.innerHTML = '';
        for (let i = 0; i < 3; i++) {
          const li = el('li', 'sb-step');
          const state = i < prog.step ? 'done' : (i === prog.step ? 'now' : 'later');
          li.classList.add('is-' + state);
          const say = el('p', 'sb-step-say');
          say.id = `sb-step-say-${i}`;
          say.append(el('span', 'sb-step-num', NUMERALS[i]), el('span', 'sb-step-words', stepWords(i)));
          li.append(say);
          if (state === 'done') {
            // her answer, kept in ink: no longer a field to type in
            const row = el('div', 'sb-step-form');
            row.append(el('span', 'sb-step-sum', stepSum(i)), el('span', 'sb-input sb-input-done', String(prog.entries[i])),
              el('span', 'sb-step-ok', '✓'));
            li.append(row);
            stepsList.append(li);
            continue;
          }
          const form = el('form', 'sb-step-form');
          form.noValidate = true;
          const label = el('label', 'sb-step-sum', stepSum(i));
          label.htmlFor = `sb-in-${i}`;
          const input = el('input', 'sb-input');
          input.id = `sb-in-${i}`;
          input.type = 'text';
          input.inputMode = 'numeric';
          input.autocomplete = 'off';
          input.spellcheck = false;
          input.maxLength = 4;
          input.setAttribute('aria-label', stepLabel(i));
          input.setAttribute('aria-describedby', say.id);
          const btn = el('button', 'sb-btn sb-btn-weigh', 'Weigh it');
          btn.type = 'submit';
          if (state === 'later') { input.disabled = true; btn.disabled = true; }
          form.append(label, input, btn);
          form.addEventListener('submit', (ev) => { ev.preventDefault(); weigh(i, input, form); });
          li.append(form);
          stepsList.append(li);
        }
        if (focusStep != null) {
          const target = stepsList.querySelector(`#sb-in-${focusStep}`);
          if (target && !target.disabled) target.focus({ preventScroll: false });
        }
      }

      function weigh(i, input, form) {
        if (!open || i !== prog.step) return;
        const raw = String(input.value || '').trim();
        if (!/^-?\d+$/.test(raw)) {
          say(raw === '' ? 'Write a number in the box first, then weigh it.' : 'Only whole numbers fit on this beam.', 'hint');
          flash(form, 'is-shake', 500);
          input.focus();
          return;
        }
        const n = Number(raw);
        if (n !== expected(open, i, prog.entries)) {
          say(hintWords(i), 'hint');
          flash(form, 'is-shake', 500);
          input.setAttribute('aria-invalid', 'true');
          moveBeam(TILT[prog.step], (prog.step % 2 ? -1 : 1) * 70);
          input.select();
          return;
        }
        prog.entries[i] = n;
        prog.step = i + 1;
        saveProgress(open, prog);
        chime();
        if (i !== 2) flash(panL, 'is-glow', 1300);
        if (i !== 1) flash(panR, 'is-glow', 1300);
        placePieces(true);
        moveBeam(TILT[prog.step], 0);
        say(rightWords(i), 'good');
        renderSteps(prog.step < 3 ? prog.step : null);
        const li = stepsList.children[i];
        if (li) flash(li, 'is-right', 900);
        renderFinish(prog.step === 3);
        if (prog.step === 3) {
          flash(emblem, 'is-turn', 1600);
          flash(svg, 'is-level', 1800);
          setTimeout(() => { if (!finish.hidden) btnWrite.focus({ preventScroll: true }); }, 50);
        }
      }

      function say(text, tone) {
        feedback.textContent = text;
        feedback.classList.remove('is-good', 'is-hint');
        if (tone) feedback.classList.add('is-' + tone);
        flash(feedback, 'is-new', 600);
      }

      // ---- The end: write her letters, warn of a clash, try the Line of the Salt ----
      function herValues() {
        return { [open.big]: prog.entries[1], [open.small]: prog.entries[2] };
      }
      function clashes() {
        const vals = herValues();
        return [open.big, open.small].filter((ch) => has(ledger.value(ch)) && Number(ledger.value(ch)) !== vals[ch]);
      }
      function saltLine() {
        return (ledger.equations() || []).find((eq) => eq.id === SALT_LINE) || null;
      }

      function renderFinish(fresh) {
        if (!open || prog.step < 3) { finish.hidden = true; return; }
        finish.hidden = false;
        if (fresh) flash(finish, 'is-arrive', 900);
        const vals = herValues();
        finishSay.textContent = `The beam rests level. By your own reckoning, ${open.big}\u00a0=\u00a0${vals[open.big]} and ${open.small}\u00a0=\u00a0${vals[open.small]}.`;
        const clash = clashes();
        const agree = [open.big, open.small].every((ch) => has(ledger.value(ch)) && Number(ledger.value(ch)) === vals[ch]);
        if (clash.length) {
          conflict.hidden = false;
          conflict.textContent = clash.length === 2
            ? `Your Ledger has different values for ${open.big} and ${open.small}.`
            : `Your Ledger has a different value for ${clash[0]}.`;
        } else {
          conflict.hidden = true;
          confirmBox.hidden = true;
        }
        btnWrite.textContent = agree ? `${both(open)} are in your Ledger ✓` : `Write ${both(open)} in my Ledger`;
        btnWrite.disabled = agree;
        btnWrite.classList.toggle('is-written', agree);
        const salt = saltLine();
        btnSalt.hidden = !(salt && [open.big, open.small].some((ch) => ch === salt.l1 || ch === salt.l2));
        if (btnSalt.hidden) saltSay.hidden = true;
      }

      function writeLetters(force) {
        if (!open || prog.step < 3) return;
        const clash = clashes();
        if (clash.length && !force) {
          confirmSay.textContent = clash.length === 2
            ? `Your Ledger has different values for ${open.big} and ${open.small}. Replace them with the ones you weighed here?`
            : `Your Ledger has a different value for ${clash[0]}. Replace it with the one you weighed here?`;
          btnReplace.textContent = clash.length === 2 ? 'Replace them with the balance' : 'Replace it with the balance';
          confirmBox.hidden = false;
          flash(confirmBox, 'is-arrive', 900);
          btnKeep.focus();
          return;
        }
        const vals = herValues();
        confirmBox.hidden = true;
        [open.big, open.small].forEach((ch) => {
          if (!has(ledger.value(ch)) || Number(ledger.value(ch)) !== vals[ch]) ledger.set(ch, vals[ch]);
        });
        chime();
        say(`${both(open)} are written in your Ledger, in your own numbers.`, 'good');
        renderFinish(false);
        renderPairs();
        btnWrite.focus({ preventScroll: true });
      }

      function checkSalt() {
        const eq = saltLine();
        if (!eq) return;
        const a = ledger.value(eq.l1), b = ledger.value(eq.l2);
        saltSay.hidden = false;
        saltSay.classList.remove('is-good', 'is-hint');
        if (!has(a) || !has(b)) {
          const missing = [eq.l1, eq.l2].filter((ch) => !has(ledger.value(ch)));
          saltSay.textContent = `The Line of the Salt, ${eq.l1} ${MINUS} ${eq.l2} = ${eq.target}, needs both letters from your Ledger. ` +
            (missing.length === 2 ? `Neither ${eq.l1} nor ${eq.l2} is written there yet.` : `${missing[0]} is not written there yet.`);
          saltSay.classList.add('is-hint');
        } else {
          const r = Number(a) - Number(b);
          if (r === Number(eq.target)) {
            saltSay.textContent = `${eq.l1} ${MINUS} ${eq.l2} = ${a} ${MINUS} ${b} = ${r}. The Line of the Salt holds: your ${eq.l1} and ${eq.l2} agree with the marker on the south shore.`;
            saltSay.classList.add('is-good');
            chime();
          } else {
            saltSay.textContent = `${eq.l1} ${MINUS} ${eq.l2} = ${a} ${MINUS} ${b} = ${r}, but the Line of the Salt asks for ${eq.target}. One of these two letters in your Ledger needs another look.`;
            saltSay.classList.add('is-hint');
          }
        }
        flash(saltSay, 'is-arrive', 900);
      }

      btnWrite.addEventListener('click', () => writeLetters(false));
      btnReplace.addEventListener('click', () => writeLetters(true));
      btnKeep.addEventListener('click', () => {
        confirmBox.hidden = true;
        say('Your Ledger stays as it was. The balance keeps your numbers here if you change your mind.', 'hint');
        btnWrite.focus({ preventScroll: true });
      });
      btnSalt.addEventListener('click', checkSalt);
      btnAgain.addEventListener('click', () => {
        if (!open) return;
        prog = { step: 0, entries: [] };
        saveProgress(open, prog);
        confirmBox.hidden = true;
        saltSay.hidden = true;
        placePieces(false);
        renderSteps(0);
        renderFinish(false);
        moveBeam(TILT[0], 30);
        say(`The pans are empty again. Lay ${open.sum.name} and ${open.diff.name} on the beam.`, null);
      });

      function openPair(id, byHand) {
        const pair = pairs.find((p) => p.id === id) || null;
        open = pair;
        bench.hidden = !pair;
        if (!pair) { renderPairs(); return; }
        prog = progressOf(pair);
        saveProgress(pair, prog);
        shownKey = seeker() + '|' + pair.id;
        confirmBox.hidden = true;
        saltSay.hidden = true;
        renderPlaques();
        placePieces(false);
        renderSteps(byHand && prog.step < 3 ? prog.step : null);
        renderFinish(false);
        renderPairs();
        if (byHand) {
          flash(bench, 'is-arrive', 900);
          say(prog.step === 0 ? `${pair.sum.name} goes on the left pan, ${pair.diff.name} on the right.`
            : (prog.step < 3 ? `You left this pair at step ${NUMERALS[prog.step]}. The beam remembers.` : 'This pair already rests level.'), null);
          beam.angle = TILT[0] - 3; beam.vel = 0;
          moveBeam(TILT[prog.step], 0);
          if (prog.step === 3) btnWrite.focus({ preventScroll: true });
        } else {
          feedback.textContent = '';
          moveBeam(TILT[prog.step], 0);
          if (reduceMotion()) drawBeam();
        }
      }

      // Everything comes back from the Ledger and her saved progress (load, profile switch, a new line, a new letter)
      function refresh() {
        const unlocked = isUnlocked();
        mount.hidden = !unlocked;
        if (!unlocked) return;
        pairs = findPairs();
        const saved = mine().open;
        const wanted = pairs.some((p) => p.id === saved) ? saved : '';
        const key = seeker() + '|' + wanted;
        if (key !== shownKey) {
          shownKey = key;
          openPair(wanted || null, false);
        } else {
          renderFinish(false);
        }
        renderPairs();
      }

      drawBeam();
      refresh();
      document.addEventListener('ledger:changed', refresh);
      window.addEventListener('storage', (e) => { if (!e.key || e.key === UNLOCK_KEY) refresh(); });
      new MutationObserver(() => {
        if (document.body.getAttribute('data-active-view') === 'view-cipher') refresh();
      }).observe(document.body, { attributes: true, attributeFilter: ['data-active-view'] });
    })();
