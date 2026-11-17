    // =========================================================================
    // ⚖ THE SURVEYOR'S BALANCE · Unified Live Brass Scale (Station 11 reward)
    // Before Salt Playa is crossed, the section stays "Coordinate Equations" and
    // this instrument stays hidden. Once order_salt_playa_completed === 'true',
    // the card becomes "The Surveyor's Balance" with the Da Vinci brass balance
    // reacting live to whichever formula Silvia focuses or edits.
    // Rule 9: it NEVER computes or fills in any letter's value for Silvia.
    // =========================================================================
    (function initSurveyorsBalance() {
      'use strict';
      const mount = document.getElementById('balance-stage-host');
      const titleText = document.getElementById('sanctuary-title-text');
      const titleIcon = document.getElementById('sanctuary-title-icon');
      const emblemEl = document.getElementById('sanctuary-emblem');
      const loreSub = document.getElementById('balance-lore-sub');
      const ledger = window.EclipseLedger;
      if (!mount || !ledger) return;

      const UNLOCK_KEY = 'order_salt_playa_completed';
      const PX = 280, PY = 92, ARM = 176;
      const MINUS = '−';
      const SVG_NS = 'http://www.w3.org/2000/svg';

      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const isValidNum = (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 26;
      const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

      function pan(side) {
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

          <g class="sb-construct" filter="url(#sb-rough)">
            <path d="M34 ${PY} H526"/>
            <path d="M${PX} 14 V304"/>
            <path d="M109.2 49.4 A176 176 0 0 0 109.2 134.6"/>
            <path d="M450.8 49.4 A176 176 0 0 1 450.8 134.6"/>
            <circle cx="${PX}" cy="${PY}" r="34"/>
            <path d="M168 300 L${PX} ${PY} L392 300"/>
            <circle cx="104" cy="${PY}" r="4"/><circle cx="456" cy="${PY}" r="4"/>
          </g>

          <g class="sb-stand" filter="url(#sb-rough)">
            <ellipse cx="${PX}" cy="301" rx="128" ry="8" fill="url(#sb-hatch-x)"/>
            <path class="sb-ink-thin" d="M52 302 C150 298 410 305 508 300"/>
            <path class="sb-ink-thin sb-faint" d="M78 307 C180 304 380 309 482 306"/>

            <path class="sb-brass-line" d="M268 116 C250 92 250 52 262.5 31.5"/>
            <path class="sb-brass-line" d="M292 116 C310 92 310 52 297.5 31.5"/>
            <path class="sb-index" d="M262.5 31.5 A62 62 0 0 1 297.5 31.5"/>
            <path class="sb-ink-thin" d="${TICKS}"/>
            <path class="sb-brass sb-ink" d="M${PX} 6 C276 12 274 18 ${PX} 26 C286 18 284 12 ${PX} 6 Z"/>
            <circle class="sb-brass sb-ink" cx="${PX}" cy="28" r="3"/>

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

            <path class="sb-ink" fill="url(#sb-brass-h)" d="M270 250 L272 126 L288 126 L290 250 Z"/>
            <path class="sb-ink-thin sb-faint" d="M276 132 V244 M280 132 V244 M284 132 V244"/>
            <path class="sb-hatch-fill" d="M285 126 L288 126 L290 250 L286 250 Z"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="263" y="242" width="34" height="9" rx="3.5"/>
            <ellipse class="sb-ink" fill="url(#sb-brass-h)" cx="${PX}" cy="196" rx="15" ry="10"/>
            <path class="sb-hatch-fill" d="M286 188 Q296 196 286 205 Z"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="266" y="208" width="28" height="5" rx="2.5"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="266" y="180" width="28" height="5" rx="2.5"/>
            <rect class="sb-ink" fill="url(#sb-brass-h)" x="266" y="148" width="28" height="5" rx="2.5"/>

            <path class="sb-brass sb-ink" d="M260 127 L300 127 L295 117 L265 117 Z"/>
            <path class="sb-ink sb-volute" d="M265 127 c-5 0 -8 -3 -8 -6 c0 -3 3 -5 5 -5 c3 0 4 2 4 4 c0 1.5 -1 2.5 -2.5 2.5"/>
            <path class="sb-ink sb-volute" d="M295 127 c5 0 8 -3 8 -6 c0 -3 -3 -5 -5 -5 c-3 0 -4 2 -4 4 c0 1.5 1 2.5 2.5 2.5"/>
            <path class="sb-brass sb-ink" d="M268 117 L292 117 L284 104 L276 104 Z"/>
          </g>

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

      mount.innerHTML = `
        <div class="sb-bench-live">
          <div class="sb-stage" id="sb-stage">
            ${DRAWING}
            <div class="sb-plaques">
              <div class="sb-plaque">
                <div class="sb-plaque-pan" id="sb-plaque-l-pan">Left Pan</div>
                <div class="sb-plaque-val" id="sb-plaque-l-val">—</div>
              </div>
              <div class="sb-plaque">
                <div class="sb-plaque-pan" id="sb-plaque-r-pan">Right Pan</div>
                <div class="sb-plaque-val" id="sb-plaque-r-val">—</div>
              </div>
            </div>
          </div>
          <div class="sb-readout">
            <div class="sb-readout-top">
              <span class="sb-readout-kicker" id="sb-readout-kicker">On the Brass Beam</span>
              <h4 class="sb-readout-title" id="sb-readout-title">—</h4>
              <div class="sb-readout-formula" id="sb-readout-formula">—</div>
              <p class="sb-readout-verdict is-waiting" id="sb-readout-verdict" role="status" aria-live="polite">
                Select or edit any formula below to weigh it on the balance.
              </p>
            </div>
            <div class="sb-readout-foot">
              <p class="sb-readout-note">Focus or click any equation below to weigh your letters on the beam. The balance reads only numbers you place in your Ledger.</p>
            </div>
          </div>
        </div>
      `;

      const stage = mount.querySelector('#sb-stage');
      const beamG = stage.querySelector('#sb-beam');
      const panL = stage.querySelector('#sb-pan-left');
      const panR = stage.querySelector('#sb-pan-right');
      const plLPan = mount.querySelector('#sb-plaque-l-pan');
      const plLVal = mount.querySelector('#sb-plaque-l-val');
      const plRPan = mount.querySelector('#sb-plaque-r-pan');
      const plRVal = mount.querySelector('#sb-plaque-r-val');
      const rKicker = mount.querySelector('#sb-readout-kicker');
      const rTitle = mount.querySelector('#sb-readout-title');
      const rFormula = mount.querySelector('#sb-readout-formula');
      const rVerdict = mount.querySelector('#sb-readout-verdict');

      const beam = { angle: -3, vel: 0, target: -3, raf: 0, last: 0 };
      let activeEqId = null;

      function drawBeam() {
        const a = beam.angle * Math.PI / 180;
        const dx = ARM * Math.cos(a);
        const dy = ARM * Math.sin(a);
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
          beam.angle = beam.target;
          beam.vel = 0;
          beam.raf = 0;
          drawBeam();
          return;
        }
        drawBeam();
        beam.raf = requestAnimationFrame(tick);
      }

      function moveBeam(target, kick) {
        beam.target = target;
        if (reduceMotion() || mount.hidden) {
          if (beam.raf) cancelAnimationFrame(beam.raf);
          beam.raf = 0;
          beam.angle = target;
          beam.vel = 0;
          drawBeam();
          return;
        }
        if (kick) beam.vel += kick;
        if (!beam.raf) {
          beam.last = performance.now();
          beam.raf = requestAnimationFrame(tick);
        }
      }

      function syncUnlockHeader(unlocked) {
        mount.hidden = !unlocked;
        if (loreSub) loreSub.hidden = !unlocked;
        if (emblemEl) emblemEl.toggleAttribute('hidden', !unlocked);
        if (titleIcon) titleIcon.hidden = unlocked;
        if (titleText) titleText.textContent = unlocked ? "The Surveyor's Balance" : 'Coordinate Equations';
      }

      function pickEquation(eqs) {
        if (!eqs || eqs.length === 0) return null;
        if (activeEqId) {
          const found = eqs.find((e) => e.id === activeEqId);
          if (found) return found;
        }
        const firstPending = eqs.find((e) => {
          const card = document.getElementById(`eq-item-${e.id}`);
          return card && !card.classList.contains('is-resolved');
        });
        return firstPending || eqs[0];
      }

      function formulaDisplay(eq, v1, v2) {
        const has1 = isValidNum(v1);
        const has2 = isValidNum(v2);
        const s1 = has1 ? `${eq.l1}=${v1}` : `[${eq.l1}]`;
        const s2 = has2 ? `${eq.l2}=${v2}` : `[${eq.l2}]`;
        if (eq.op === 'x2') return `${s1} × 2 = ${s2}`;
        const op = eq.op === '-' ? MINUS : '+';
        return `${s1} ${op} ${s2} = ${eq.target}${eq.unit || ''}`;
      }

      function hasDuplicate(val, ownChar) {
        if (!isValidNum(val)) return false;
        const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < abc.length; i++) {
          const ch = abc.charAt(i);
          if (ch !== ownChar && ledger.value(ch) === val) return ch;
        }
        return false;
      }

      function renderBalance() {
        const unlocked = get(UNLOCK_KEY) === 'true';
        syncUnlockHeader(unlocked);
        if (!unlocked) {
          document.dispatchEvent(new CustomEvent('ledger:balance-active', { detail: null }));
          return;
        }

        const eqs = ledger.equations() || [];
        const eq = pickEquation(eqs);
        if (!eq) {
          document.dispatchEvent(new CustomEvent('ledger:balance-active', { detail: null }));
          return;
        }
        activeEqId = eq.id;
        document.dispatchEvent(new CustomEvent('ledger:balance-active', { detail: eq.id }));

        const v1 = ledger.value(eq.l1);
        const v2 = ledger.value(eq.l2);
        const has1 = isValidNum(v1);
        const has2 = isValidNum(v2);

        panL.querySelector('.sb-weight-letter').textContent = eq.l1;
        panR.querySelector('.sb-weight-letter').textContent = eq.l2;
        panL.classList.toggle('is-weighed', has1);
        panL.classList.toggle('is-missing', !has1);
        panR.classList.toggle('is-weighed', has2);
        panR.classList.toggle('is-missing', !has2);

        plLPan.textContent = `Left Pan · ${eq.l1}`;
        plLVal.textContent = has1 ? `${eq.l1} = ${v1}` : 'Unassigned';
        plRPan.textContent = `Right Pan · ${eq.l2}`;
        plRVal.textContent = has2 ? `${eq.l2} = ${v2}` : 'Unassigned';

        rKicker.textContent = eq.station;
        rTitle.textContent = eq.name;
        rFormula.textContent = formulaDisplay(eq, v1, v2);

        let targetAngle = 0;
        let kick = 0;
        let verdictClass = 'is-waiting';
        let verdictText = '';
        let level = false;

        if (has1 && has2) {
          const dup1 = hasDuplicate(v1, eq.l1);
          const dup2 = hasDuplicate(v2, eq.l2);
          const diff = eq.op === 'x2'
            ? (v1 * 2 - v2)
            : ((eq.op === '-' ? v1 - v2 : v1 + v2) - Number(eq.target));
          if (diff === 0) {
            level = true;
            targetAngle = 0;
            if (dup1 || dup2) {
              verdictClass = 'is-tilted';
              verdictText = `Level numerically, but ${dup1 ? `${eq.l1}=${v1} duplicates ${dup1}` : `${eq.l2}=${v2} duplicates ${dup2}`}.`;
            } else {
              verdictClass = 'is-level';
              verdictText = eq.op === 'x2'
                ? `Level · ${v1} × 2 = ${v2}. Both pans rest true.`
                : `Level · ${v1} ${eq.op === '-' ? MINUS : '+'} ${v2} = ${eq.target}${eq.unit || ''}. Both pans rest true.`;
            }
          } else {
            targetAngle = diff > 0 ? -7.5 : 7.5;
            kick = diff > 0 ? -12 : 12;
            verdictClass = 'is-tilted';
            const computed = eq.op === 'x2' ? v1 * 2 : (eq.op === '-' ? v1 - v2 : v1 + v2);
            const expectStr = eq.op === 'x2' ? v2 : `${eq.target}${eq.unit || ''}`;
            verdictText = diff > 0
              ? `Tilted left (heavy) · ${computed} exceeds ${expectStr}.`
              : `Tilted right (light) · ${computed} falls short of ${expectStr}.`;
          }
        } else if (has1) {
          targetAngle = -5.5;
          verdictText = `Assign a value to ${eq.l2} below to balance against ${eq.l1} = ${v1}.`;
        } else if (has2) {
          targetAngle = 5.5;
          verdictText = `Assign a value to ${eq.l1} below to balance against ${eq.l2} = ${v2}.`;
        } else {
          targetAngle = -2.5;
          verdictText = `Enter numbers for ${eq.l1} and ${eq.l2} in the card below to test the beam.`;
        }

        stage.classList.toggle('is-level', level);
        stage.setAttribute('data-beam-angle', String(targetAngle));
        rVerdict.className = `sb-readout-verdict ${verdictClass}`;
        rVerdict.textContent = verdictText;
        moveBeam(targetAngle, kick);
      }

      document.addEventListener('ledger:focus-eq', (e) => {
        if (e && e.detail) {
          activeEqId = e.detail;
          renderBalance();
        }
      });
      document.addEventListener('ledger:changed', renderBalance);
      window.addEventListener('storage', (e) => {
        if (!e.key || e.key === UNLOCK_KEY) renderBalance();
      });
      new MutationObserver(() => {
        if (document.body.getAttribute('data-active-view') === 'view-cipher') renderBalance();
      }).observe(document.body, { attributes: true, attributeFilter: ['data-active-view'] });

      drawBeam();
      renderBalance();
    })();
