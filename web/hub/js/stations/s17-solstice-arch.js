
    // =========================================================================
    // 🌓 STATION 17 · THE ARCH OF THE SOLSTICE & CAIRN V (SHEET 16B)
    // Part I (journal): the eight-letter sigil of the midsummer ray opens the courtyard.
    // Part II (web only), The Autumn Dawn: in October the sun rises further south, so the ray enters the
    // arch at another place and keeps sliding west as the sun climbs (four steps). Silvia turns the bronze
    // mirrors so each ray reaches the brass ring of the altar before the sun moves on. The courtyard was
    // checked offline: every step has exactly one route, no setting lights two consecutive steps, and the
    // next step is 2 to 4 turns away.
    // Part III (web only), The Night Signal: a light on Tower II flashes patterns; Silvia answers with
    // Hermes's mirror (short and long flashes). The last pattern is the code of the brass disc.
    // Reward: the Seal of Cairn V (the fifth), two Ledger equations and the Signal Mirror.
    // =========================================================================
    (function initSolsticeArch() {
      const modal = document.getElementById('modal-solstice-arch');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const KEYS = {
        awake: 'order_cairn5_awake',
        done: 'order_arch_solstice_completed',
        fails: 'order_cairn5_key_fails',
        hint: 'order_cairn5_hint',
        mirrors: 'order_cairn5_mirrors',
        dawnDone: 'order_cairn5_dawn_done',
        dawnFails: 'order_cairn5_dawn_fails',
        dawnHint: 'order_cairn5_dawn_hint',
        round: 'order_cairn5_signal_round',
        signalFails: 'order_cairn5_signal_fails',
        signalHint: 'order_cairn5_signal_hint'
      };
      const SIGIL = 'DAYBREAK';
      const HINT_AFTER_FAILS = 3;

      // ---- The courtyard: 9 × 9 flagstones, the arch above row 0 ----
      // Mirrors: 'f' is a forward slash (/), 'b' a backslash (\). Every mirror can be turned.
      const COURT = {
        cols: 9,
        rows: 9,
        entries: [6, 5, 3, 2],   // where the ray enters the arch at each step of the October dawn
        altar: [3, 8],
        mirrors: [[1, 1], [2, 1], [3, 1], [5, 1], [2, 2], [3, 2], [0, 4], [6, 4], [0, 5], [2, 5], [2, 6], [6, 8]],
        start: 'bbbbbbbffbbf',
        pillars: [[5, 2], [7, 4], [2, 8], [8, 3], [0, 8]]
      };
      const STEP_MS = 30000, STEP_MS_HINTED = 45000;
      const REFLECT = {
        f: { '0,1': [-1, 0], '0,-1': [1, 0], '1,0': [0, -1], '-1,0': [0, 1] },
        b: { '0,1': [1, 0], '0,-1': [-1, 0], '1,0': [0, 1], '-1,0': [0, -1] }
      };
      const cellKey = (x, y) => x + ',' + y;
      const mirrorIndex = new Map(COURT.mirrors.map(([x, y], i) => [cellKey(x, y), i]));
      const pillarSet = new Set(COURT.pillars.map(([x, y]) => cellKey(x, y)));

      // ---- The night signal: what the light on Tower II asks; S is a short flash, L a long one ----
      const ROUNDS = ['SS', 'SLS', 'LLSS', 'SSSLL'];
      const FLASH_MS = { S: 220, L: 760 }, GAP_MS = 380, PAUSE_MS = 1100, LONG_PRESS_MS = 380;
      const ROUND_DISPATCH = [
        "It answered, Silvia! It repeats our flashes back to us, and asks for more. Whoever is up there is testing us.",
        "Again. Longer this time. My hands are steadier than my heart.",
        "One more. Silvia... I think I know the next one before it comes."
      ];
      const LOCK_DISPATCH = [
        "The ring took the light! One lock closed. But the sun is moving, Silvia, and the ray is already sliding west along the arch.",
        "Two locks! Quickly, it slides again.",
        "Three. One more ray, and the sun will be too high."
      ];

      const el = {
        close: $('btn-close-solstice'), sigilCard: $('solstice-sigil-card'), keyInput: $('solstice-key-input'), speak: $('btn-solstice-speak'),
        keyFeedback: $('solstice-key-feedback'), dawnGame: $('solstice-dawn-game'), dawnInner: document.querySelector('#solstice-dawn-game .monolith-game-inner'),
        court: $('solstice-court'), clock: $('solstice-clock-bar'), dawnBtn: $('btn-solstice-dawn'), locks: document.querySelectorAll('.solstice-locks b'),
        dawnFeedback: $('solstice-dawn-feedback'), nightGame: $('solstice-night-game'), nightInner: document.querySelector('#solstice-night-game .monolith-game-inner'),
        night: $('solstice-night'), watch: $('btn-solstice-watch'), roundLabel: $('solstice-round-label'), flash: $('btn-solstice-flash'),
        pulses: $('solstice-pulses'), clear: $('btn-solstice-clear'), send: $('btn-solstice-send'), message: $('solstice-message'),
        signalFeedback: $('solstice-signal-feedback'), hint: $('solstice-hint'), victory: $('solstice-victory'), victoryText: $('solstice-victory-text'),
        finish: $('btn-solstice-finish'), dispatch: $('solstice-dispatch-text'),
        tSigil: $('solstice-telem-sigil'), tDawn: $('solstice-telem-dawn'), tSignal: $('solstice-telem-signal'), tSeal: $('solstice-telem-seal')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const dawnDone = () => isDone() || get(KEYS.dawnDone) === 'true';
      const roundsDone = () => (isDone() ? ROUNDS.length : Math.max(0, Math.min(ROUNDS.length - 1, parseInt(get(KEYS.round) || '0', 10) || 0)));

      let mirrors = (() => {
        const saved = get(KEYS.mirrors);
        return saved && /^[fb]{12}$/.test(saved) ? saved.split('') : COURT.start.split('');
      })();
      const dawn = { running: false, step: 0, locks: 0, deadline: 0, raf: null };
      let pulses = [];
      let playing = null;   // timers of the light on Tower II
      let finale = false;

      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
      function feedback(node, text, kind) {
        if (!node) return;
        node.textContent = text;
        node.classList.toggle('is-error', kind === 'error');
        node.classList.toggle('is-ok', kind === 'ok');
      }
      const svgEl = (tag, attrs) => {
        const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
        return n;
      };

      // ---- The ray ----
      function trace(col) {
        let x = col, y = 0, dx = 0, dy = 1;
        const pts = [[x, y]];
        for (let i = 0; i < 200; i++) {
          if (x < 0 || y < 0 || x >= COURT.cols || y >= COURT.rows) { pts.push([x - dx, y - dy]); return { pts, end: 'out', dir: [dx, dy] }; }
          const k = cellKey(x, y);
          if (x === COURT.altar[0] && y === COURT.altar[1]) { pts.push([x, y]); return { pts, end: 'altar' }; }
          if (pillarSet.has(k)) { pts.push([x, y]); return { pts, end: 'pillar' }; }
          if (mirrorIndex.has(k)) {
            [dx, dy] = REFLECT[mirrors[mirrorIndex.get(k)]][dx + ',' + dy];
            pts.push([x, y]);
          }
          x += dx; y += dy;
        }
        return { pts, end: 'loop' };
      }

      // ---- Drawing the courtyard ----
      const C = 10, cx = (x) => x * C + C / 2, cy = (y) => y * C + C / 2;
      function drawCourt() {
        const svg = el.court;
        if (!svg) return;
        svg.textContent = '';
        svg.classList.toggle('is-dawn', dawn.running);
        const W = COURT.cols * C, H = COURT.rows * C;
        svg.appendChild(svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: 'rgba(59, 42, 23, 0.55)', stroke: '#8a6d3b', 'stroke-width': 0.6 }));
        for (let i = 1; i < COURT.cols; i++) svg.appendChild(svgEl('line', { x1: i * C, y1: 0, x2: i * C, y2: H, stroke: '#5c4524', 'stroke-width': 0.25 }));
        for (let j = 1; j < COURT.rows; j++) svg.appendChild(svgEl('line', { x1: 0, y1: j * C, x2: W, y2: j * C, stroke: '#5c4524', 'stroke-width': 0.25 }));
        // the arch, the sun's track over it and the four places where the ray will enter
        svg.appendChild(svgEl('path', { d: `M 14 0 L 14 -8 Q 45 -20 76 -8 L 76 0`, fill: 'none', stroke: '#d4a853', 'stroke-width': 1.2 }));
        COURT.entries.forEach((col, k) => {
          const past = dawnDone() || k < dawn.locks;
          svg.appendChild(svgEl('path', { d: `M ${cx(col) - 2} -3 L ${cx(col) + 2} -3 L ${cx(col)} 0 Z`, fill: past ? '#86efac' : (dawn.running && k === dawn.step ? '#fde68a' : '#7a6a52') }));
        });
        if (dawn.running) {
          const col = COURT.entries[dawn.step];
          svg.appendChild(svgEl('circle', { cx: cx(col), cy: -15, r: 4.5, fill: '#fbbf24', stroke: '#fff7d6', 'stroke-width': 0.6 }));
          const ray = trace(col);
          const pts = [[cx(col), -11]].concat(ray.pts.map(([x, y]) => [cx(x), cy(y)]));
          if (ray.end === 'out') {
            // the ray leaves the courtyard: carry it on past the wall in the direction it was going
            const [lx, ly] = ray.pts[ray.pts.length - 1];
            pts.push([cx(lx) + ray.dir[0] * 9, cy(ly) + ray.dir[1] * 9]);
          }
          const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
          svg.appendChild(svgEl('path', { d, fill: 'none', stroke: 'rgba(253, 230, 138, 0.28)', 'stroke-width': 4, 'stroke-linejoin': 'round' }));
          svg.appendChild(svgEl('path', { d, fill: 'none', stroke: '#fde68a', 'stroke-width': 1.1, 'stroke-linejoin': 'round' }));
        }
        // fallen pillars
        COURT.pillars.forEach(([x, y]) => {
          svg.appendChild(svgEl('circle', { cx: cx(x), cy: cy(y), r: 3.6, fill: '#3b2a17', stroke: '#8a6d3b', 'stroke-width': 0.6 }));
          svg.appendChild(svgEl('line', { x1: cx(x) - 2.6, y1: cy(y) + 1.6, x2: cx(x) + 2.6, y2: cy(y) - 1.6, stroke: '#8a6d3b', 'stroke-width': 0.6 }));
        });
        // the Solar Altar and the four locks of its brass ring
        const [ax, ay] = COURT.altar;
        const locks = dawnDone() ? 4 : dawn.locks;
        svg.appendChild(svgEl('circle', { cx: cx(ax), cy: cy(ay), r: 4.2, fill: '#2b1b0d', stroke: '#b8a07a', 'stroke-width': 0.6 }));
        for (let i = 0; i < 4; i++) {
          const a0 = -Math.PI / 2 + i * Math.PI / 2 + 0.12, a1 = a0 + Math.PI / 2 - 0.24, rr = 4.2;
          svg.appendChild(svgEl('path', { d: `M ${cx(ax) + rr * Math.cos(a0)} ${cy(ay) + rr * Math.sin(a0)} A ${rr} ${rr} 0 0 1 ${cx(ax) + rr * Math.cos(a1)} ${cy(ay) + rr * Math.sin(a1)}`, fill: 'none', stroke: i < locks ? '#fde68a' : '#5c4524', 'stroke-width': 1.4 }));
        }
        // the bronze mirrors
        COURT.mirrors.forEach(([x, y], i) => {
          const g = svgEl('g', { class: 'solstice-mirror', tabindex: '0', role: 'button', 'data-i': String(i), 'aria-label': 'Bronze mirror, row ' + (y + 1) + ', column ' + (x + 1) + ', ' + (mirrors[i] === 'f' ? 'facing up and right' : 'facing down and right') });
          g.appendChild(svgEl('rect', { x: x * C + 0.6, y: y * C + 0.6, width: C - 1.2, height: C - 1.2, rx: 1, fill: 'rgba(212, 168, 83, 0.06)', stroke: 'rgba(212, 168, 83, 0.25)', 'stroke-width': 0.4 }));
          const f = mirrors[i] === 'f';
          g.appendChild(svgEl('line', { x1: x * C + 1.8, y1: f ? y * C + 8.2 : y * C + 1.8, x2: x * C + 8.2, y2: f ? y * C + 1.8 : y * C + 8.2, stroke: '#d97706', 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
          svg.appendChild(g);
        });
      }

      function turnMirror(i) {
        if (!isAwake() || dawnDone() || i < 0 || i >= mirrors.length) return;
        mirrors[i] = mirrors[i] === 'f' ? 'b' : 'f';
        set(KEYS.mirrors, mirrors.join(''));
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        const hadFocus = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-i') === String(i);
        checkRay();
        drawCourt();
        if (hadFocus) { const g = el.court.querySelector('[data-i="' + i + '"]'); if (g) g.focus(); }
      }

      // ---- The dawn ----
      const stepMs = () => (get(KEYS.dawnHint) === 'true' ? STEP_MS_HINTED : STEP_MS);
      function startDawn() {
        if (!isAwake() || dawnDone() || dawn.running) return;
        dawn.running = true; dawn.step = 0; dawn.locks = 0;
        dawn.deadline = performance.now() + stepMs();
        feedback(el.dawnFeedback, 'The first ray slips under the arch.', '');
        say("Dawn, Silvia. There it is: the first ray, coming under the arch at an angle the founders never planned for. Turn the mirrors before the sun climbs.");
        checkRay();
        tick();
        render();
      }
      function tick() {
        if (!dawn.running) return;
        const left = dawn.deadline - performance.now();
        if (el.clock) el.clock.style.width = Math.max(0, Math.min(100, (left / stepMs()) * 100)).toFixed(1) + '%';
        if (left <= 0) { dawnSpent(); return; }
        dawn.raf = requestAnimationFrame(tick);
      }
      let pausedLeft = null;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cancelPress();
          if (dawn.running) { pausedLeft = dawn.deadline - performance.now(); if (dawn.raf) cancelAnimationFrame(dawn.raf); dawn.raf = null; }
        } else if (dawn.running && pausedLeft !== null) {
          dawn.deadline = performance.now() + Math.max(0, pausedLeft);
          pausedLeft = null;
          tick();
        }
      });
      function stopDawn() {
        dawn.running = false;
        if (dawn.raf) cancelAnimationFrame(dawn.raf);
        dawn.raf = null;
        if (el.clock) el.clock.style.width = '0%';
      }
      function checkRay() {
        if (!dawn.running) return;
        if (trace(COURT.entries[dawn.step]).end !== 'altar') return;
        dawn.locks++;
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (dawn.locks >= COURT.entries.length) {
          stopDawn();
          set(KEYS.dawnDone, 'true');
          feedback(el.dawnFeedback, 'The fourth lock closes. The altar opens.', 'ok');
          say("Four locks! The brass ring turned, Silvia, and the altar opened like a flower: the Seal of Cairn V is in my hand. The fifth one. I am going to sit down for a moment. Then I will wait for the night here, under the arch: from up here I can see Tower II.");
          render();
          return;
        }
        say(LOCK_DISPATCH[dawn.locks - 1]);
        feedback(el.dawnFeedback, 'Lock ' + dawn.locks + ' of 4 closed. The sun moves on.', 'ok');
        dawn.step = dawn.locks;
        dawn.deadline = performance.now() + stepMs();
        checkRay();
      }
      function dawnSpent() {
        stopDawn();
        const fails = (parseInt(get(KEYS.dawnFails) || '0', 10) || 0) + 1;
        set(KEYS.dawnFails, String(fails));
        if (fails >= HINT_AFTER_FAILS) set(KEYS.dawnHint, 'true');
        dawn.locks = 0; dawn.step = 0;
        feedback(el.dawnFeedback, 'The sun climbed past the arch. The dawn is spent; the ring only takes a dawn ray.', 'error');
        say("Too high, Silvia. The courtyard is in plain daylight and the ring has let go of its locks. Tomorrow the sun will rise again, and the mirrors will still be where you left them." + (get(KEYS.dawnHint) === 'true' ? " I have counted my breaths: tomorrow each ray will wait longer for us." : ''));
        render();
      }

      // ---- The night signal ----
      function lightOn(on) {
        const dot = el.night && el.night.querySelector('.solstice-light');
        if (dot) dot.setAttribute('r', on ? '3.4' : '0.9');
        const glow = el.night && el.night.querySelector('.solstice-light-glow');
        if (glow) glow.setAttribute('opacity', on ? '0.9' : '0');
      }
      function drawNight(fire) {
        const svg = el.night;
        if (!svg) return;
        svg.textContent = '';
        for (let i = 0; i < 40; i++) {
          const sx = (i * 47) % 200, sy = (i * 29) % 46;
          svg.appendChild(svgEl('circle', { cx: sx, cy: sy + 2, r: i % 7 === 0 ? 0.7 : 0.35, fill: '#e7e5e4', opacity: 0.6 }));
        }
        svg.appendChild(svgEl('path', { d: 'M0 70 Q 40 58 80 66 T 160 62 T 200 66 L 200 90 L 0 90 Z', fill: '#140f0a' }));
        // Tower II on the horizon
        svg.appendChild(svgEl('path', { d: 'M128 64 L128 42 L131 38 L134 42 L134 36 L138 31 L142 36 L142 42 L145 38 L148 42 L148 64 Z', fill: '#0b0806', stroke: '#3b2a17', 'stroke-width': 0.5 }));
        if (fire) {
          svg.appendChild(svgEl('ellipse', { cx: 138, cy: 63, rx: 22, ry: 6, fill: 'rgba(220, 38, 38, 0.45)' }));
          svg.appendChild(svgEl('path', { d: 'M132 60 C 128 48, 140 46, 136 30 C 146 42, 150 30, 146 18', fill: 'none', stroke: 'rgba(120, 113, 108, 0.6)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
        }
        svg.appendChild(svgEl('circle', { class: 'solstice-light-glow', cx: 138, cy: 33, r: 9, fill: 'rgba(253, 230, 138, 0.35)', opacity: 0 }));
        svg.appendChild(svgEl('circle', { class: 'solstice-light', cx: 138, cy: 33, r: fire ? 0 : 0.9, fill: '#fde68a' }));
        // Hermes's mirror, under the arch in the foreground
        svg.appendChild(svgEl('circle', { class: 'solstice-own', cx: 30, cy: 80, r: 2, fill: '#b8a07a' }));
      }
      function stopLight() {
        if (playing) playing.forEach((t) => clearTimeout(t));
        playing = null;
        lightOn(false);
      }
      function playPattern(pattern, done) {
        stopLight();
        playing = [];
        let t = 400;
        pattern.split('').forEach((p, i) => {
          if (pattern === ROUNDS[3] && i === 3) t += PAUSE_MS - GAP_MS;
          playing.push(setTimeout(() => lightOn(true), t));
          t += FLASH_MS[p];
          playing.push(setTimeout(() => lightOn(false), t));
          t += GAP_MS;
        });
        playing.push(setTimeout(() => { playing = null; if (done) done(); }, t));
      }
      function watchLight() {
        if (!dawnDone() || isDone() || finale) return;
        const r = roundsDone();
        feedback(el.signalFeedback, '', '');
        playPattern(ROUNDS[r], () => {
          if (get(KEYS.signalHint) === 'true') showHint();
        });
      }
      function renderPulses() {
        if (!el.pulses) return;
        el.pulses.textContent = pulses.map((p) => (p === 'S' ? '·' : '—')).join(' ') || ' ';
      }
      let pressAt = 0, pressPointer = null;
      function cancelPress() {
        pressAt = 0; pressPointer = null;
        if (el.flash) el.flash.classList.remove('is-down');
        const own = el.night && el.night.querySelector('.solstice-own');
        if (own) { own.setAttribute('fill', '#b8a07a'); own.setAttribute('r', '2'); }
      }
      function pressStart(e) {
        if (!dawnDone() || isDone() || finale || pressAt) return;
        if (e) e.preventDefault();
        pressPointer = e && e.pointerId !== undefined ? e.pointerId : null;
        pressAt = performance.now();
        if (el.flash) el.flash.classList.add('is-down');
        const own = el.night && el.night.querySelector('.solstice-own');
        if (own) { own.setAttribute('fill', '#fff7d6'); own.setAttribute('r', '4'); }
      }
      function pressEnd(e) {
        if (!pressAt) return;
        if (e && e.pointerId !== undefined && pressPointer !== null && e.pointerId !== pressPointer) return;
        if (e) e.preventDefault();
        pressPointer = null;
        const held = performance.now() - pressAt;
        pressAt = 0;
        if (el.flash) el.flash.classList.remove('is-down');
        const own = el.night && el.night.querySelector('.solstice-own');
        if (own) { own.setAttribute('fill', '#b8a07a'); own.setAttribute('r', '2'); }
        if (pulses.length >= 8) return;
        pulses.push(held >= LONG_PRESS_MS ? 'L' : 'S');
        renderPulses();
      }
      function sendSignal() {
        if (!dawnDone() || isDone() || finale || !pulses.length) return;
        const r = roundsDone();
        if (pulses.join('') !== ROUNDS[r]) {
          const fails = (parseInt(get(KEYS.signalFails) || '0', 10) || 0) + 1;
          set(KEYS.signalFails, String(fails));
          if (fails >= HINT_AFTER_FAILS) set(KEYS.signalHint, 'true');
          feedback(el.signalFeedback, 'The light on Tower II waits, then asks again.', 'error');
          pulses = []; renderPulses();
          render();
          return;
        }
        pulses = []; renderPulses();
        set(KEYS.round, String(r + 1));
        if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        if (r + 1 >= ROUNDS.length) { runFinale(); return; }
        feedback(el.signalFeedback, 'The light answers.', 'ok');
        say(ROUND_DISPATCH[r]);
        render();
        setTimeout(watchLight, 1200);
      }
      function showHint() {
        if (!el.hint) return;
        const r = roundsDone();
        el.hint.style.display = '';
        el.hint.textContent = '✦ Hermes wrote the last flashes in his log: ' + ROUNDS[Math.min(r, ROUNDS.length - 1)].split('').map((p) => (p === 'S' ? '·' : '—')).join(' ');
      }
      function runFinale() {
        finale = true;
        feedback(el.signalFeedback, '', '');
        say("Three short, a pause, two long. Silvia... I made that code for one person, more than fifty years ago. And the light up there has just answered it. Now it is spelling something, slowly, in the old light-code of the Order. I am writing it down.");
        const lines = ['[Y] − [O] = 2', '[L] + [G] = 23'];
        const burst = 'SLSSLLSLSSLSLLSS';
        let shown = '';
        playPattern(burst, () => {
          if (el.message) el.message.textContent = lines.join('   ·   ');
          drawNight(true);
          say("And then the light went out. Not slowly, Silvia: all at once. There is a red glow at the foot of Tower II now, and the wind smells of smoke. The wagons. They have reached the Sanctuary.");
          setTimeout(completeStation, 1800);
        });
        lines.forEach((line, i) => setTimeout(() => {
          shown += (shown ? '   ·   ' : '') + line;
          if (el.message) el.message.textContent = shown;
        }, 2600 + i * 3200));
        render();
      }
      function completeStation() {
        set(KEYS.done, 'true');
        finale = false;
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('signal_mirror');
        if (typeof window.grantCairnSeal === 'function') window.grantCairnSeal(5);
        else set('order_seal_cairn_5', 'true');
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "On the fourth ray of an October dawn the brass ring closed its locks and the altar gave up the Seal of Cairn V, the last of the five. That night a light on Tower II answered Hermes's mirror in a code he made for one person only, and spelled two lines in the old light-code of the Order. Then it went out. At dawn, smoke rose over the Sanctuary. He will tell you on the wire.";
        }
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        if (el.message) el.message.textContent = '[Y] − [O] = 2   ·   [L] + [G] = 23';
      }

      // ---- Part I: the sigil from Sheet 16B ----
      function speakSigil() {
        if (isAwake()) return;
        const typed = (el.keyInput ? el.keyInput.value : '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
        if (!typed) { feedback(el.keyFeedback, 'Type the eight letters from Sheet 16B.', 'error'); return; }
        if (typed !== SIGIL) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          if (fails >= HINT_AFTER_FAILS && get(KEYS.hint) !== 'true') {
            set(KEYS.hint, 'true');
            feedback(el.keyFeedback, 'The altar stays closed. Hermes left you a note in Ask Hermes about following the ray.', 'error');
          } else {
            feedback(el.keyFeedback, 'The altar stays closed. Follow the midsummer ray of Sheet 16B again.', 'error');
          }
          return;
        }
        set(KEYS.awake, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'DAYBREAK. The brass ring of the altar wakes, waiting for its light.', 'ok');
        say("DAYBREAK... and the ring of the altar unlocked its four catches, Silvia. But it wants a ray of light to close them, and this courtyard was built for a midsummer sun. In October the sun rises further south: its ray will come under the arch at the wrong place. We must turn the mirrors for an autumn dawn. Set them tonight, if you like; at dawn, be quick.");
        render();
        if (el.dawnBtn) setTimeout(() => el.dawnBtn.focus(), 60);
      }

      function render() {
        const awake = isAwake(), done = isDone(), dDone = dawnDone(), r = roundsDone();
        drawCourt();
        if (!finale && el.night && (!el.night.firstChild || done)) drawNight(done);
        if (el.locks) el.locks.forEach((b, i) => b.classList.toggle('is-on', i < (dDone ? 4 : dawn.locks)));
        if (el.dawnBtn) {
          el.dawnBtn.disabled = !awake || dDone || dawn.running;
          el.dawnBtn.textContent = dDone ? '☀ The altar is open' : (dawn.running ? '☀ Dawn · step ' + (dawn.step + 1) + ' of 4' : '☀ Await the dawn');
        }
        if (el.roundLabel) el.roundLabel.textContent = done ? 'The light has gone out.' : 'Signal ' + Math.min(r + 1, ROUNDS.length) + ' of ' + ROUNDS.length;
        [el.flash, el.clear, el.send, el.watch].forEach((b) => { if (b) b.disabled = !dDone || done || finale; });
        if (el.tSigil) el.tSigil.textContent = awake ? SIGIL + ' ✓' : '[ 8 LETTERS ]';
        if (el.tDawn) el.tDawn.textContent = dDone ? '4 / 4 LOCKS ✓' : (dawn.running ? 'RAY ' + (dawn.step + 1) + ' · ' + dawn.locks + ' / 4' : '[ NIGHT ]');
        if (el.tSignal) el.tSignal.textContent = done ? 'ANSWERED ✓' : (dDone ? r + ' / ' + ROUNDS.length : '[ DARK ]');
        if (el.tSeal) el.tSeal.textContent = done ? 'CAIRN V ✓' : (dDone ? 'IN HERMES\'S HAND' : '[ SEALED ]');
        if (el.dawnGame) el.dawnGame.classList.toggle('is-locked', !awake);
        if (el.dawnInner) el.dawnInner.inert = !awake;
        if (el.nightGame) el.nightGame.classList.toggle('is-locked', !dDone);
        if (el.nightInner) el.nightInner.inert = !dDone;
        if (el.sigilCard) el.sigilCard.classList.toggle('is-collapsed', awake);
        if (awake && el.keyFeedback && !el.keyFeedback.textContent) feedback(el.keyFeedback, 'Sigil spoken: ' + SIGIL + ' ✓', 'ok');
        if (el.hint && !done) {
          if (get(KEYS.dawnHint) === 'true' && !dDone) {
            el.hint.style.display = '';
            el.hint.textContent = '✦ Hermes counts his breaths: each ray now waits ' + (STEP_MS_HINTED / 1000) + ' seconds.';
          } else if (!(get(KEYS.signalHint) === 'true' && dDone)) {
            el.hint.style.display = 'none';
          }
        } else if (el.hint) {
          el.hint.style.display = 'none';
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
      }

      // ---- Controls ----
      if (el.court) {
        const pick = (e) => {
          const g = e.target.closest && e.target.closest('.solstice-mirror');
          if (g) turnMirror(parseInt(g.getAttribute('data-i'), 10));
        };
        el.court.addEventListener('click', pick);
        el.court.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } });
      }
      if (el.dawnBtn) el.dawnBtn.addEventListener('click', startDawn);
      if (el.watch) el.watch.addEventListener('click', watchLight);
      if (el.flash) {
        el.flash.addEventListener('pointerdown', pressStart);
        el.flash.addEventListener('pointerup', pressEnd);
        el.flash.addEventListener('pointercancel', pressEnd);
        el.flash.addEventListener('pointerleave', pressEnd);
        el.flash.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) pressStart(e); else if (e.key === ' ' || e.key === 'Enter') e.preventDefault(); });
        el.flash.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') pressEnd(e); });
        el.flash.addEventListener('click', (e) => e.preventDefault());
        el.flash.addEventListener('blur', cancelPress);
      }
      if (el.clear) el.clear.addEventListener('click', () => { pulses = []; renderPulses(); });
      if (el.send) el.send.addEventListener('click', sendSignal);
      if (el.speak) el.speak.addEventListener('click', speakSigil);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakSigil(); });

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_cairn_iv_completed') !== 'true') return false;
        return typeof window.isSolsticeMarchOver === 'function' ? window.isSolsticeMarchOver() : false;
      }
      let returnFocusTo = null;
      function openSolsticeModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          if (get('order_cairn_iv_completed') !== 'true') {
            toast('✦ TERRA INCOGNITA ✦ Wake the Sentry of the Canyon (Station 16) before the road to the Arch of the Solstice opens.');
          } else if (typeof window.getSolsticeMarchEta === 'function' && window.getSolsticeMarchEta()) {
            toast('Hermes is walking to the Arch of the Solstice. Arrival in ' + window.getSolsticeMarchEta() + '.');
          } else {
            toast('Hermes is still at Cairn IV. Open the Cliffside Workshop: he will wire you before he sets out.');
          }
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        returnFocusTo = document.activeElement;
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I am under the Arch of the Solstice. The courtyard behind it is paved with bronze mirrors and fallen pillars, and the Solar Altar waits on its terrace with a brass ring. From here I can see the dunes where Cairn V stands guard. Sheet 16B, please: the sigil first.");
        else if (!dawnDone()) say("The mirrors are where you left them. Set them as you think best, and call the dawn when you are ready.");
        else say("Night again. Watch the light on Tower II, and answer it with my mirror.");
        render();
        const focusTarget = isDone() ? el.finish : (!isAwake() ? el.keyInput : (dawnDone() ? el.watch : el.dawnBtn));
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
      }
      function closeSolsticeModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (dawn.running) { stopDawn(); dawn.locks = 0; dawn.step = 0; feedback(el.dawnFeedback, 'Hermes looked away and the dawn went by.', ''); }
        if (!finale) stopLight();
        cancelPress();
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openSolsticeModal = openSolsticeModal;
      window.closeSolsticeModal = closeSolsticeModal;
      if (el.close) el.close.addEventListener('click', closeSolsticeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeSolsticeModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeSolsticeModal(); });
      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeSolsticeModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof window.showDesertToast === 'function') {
            let seals = 0;
            for (let i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) === 'true') seals++;
            window.showDesertToast('✦ Seal of Cairn V secured (' + seals + ' of 5) ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
          }
        });
      }

      // ---- The five seals come home (called by grantCairnSeal the first time all five are in the satchel) ----
      const overlay = $('five-seals-overlay');
      const ring = $('five-seals-ring');
      window.showFiveSealsCeremony = function () {
        if (!overlay || !ring) return;
        ring.textContent = '';
        ['I', 'II', 'III', 'IV', 'V'].forEach((roman, i) => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
          const seal = document.createElement('div');
          seal.className = 'five-seal';
          seal.textContent = roman;
          seal.style.left = (50 + 36 * Math.cos(a)).toFixed(2) + '%';
          seal.style.top = (50 + 36 * Math.sin(a)).toFixed(2) + '%';
          seal.style.setProperty('--fx', (Math.cos(a) * 160).toFixed(0) + 'px');
          seal.style.setProperty('--fy', (Math.sin(a) * 160).toFixed(0) + 'px');
          seal.style.animationDelay = (0.35 + i * 0.35) + 's';
          ring.appendChild(seal);
        });
        ceremonyReturnFocus = document.activeElement;
        overlay.style.display = 'flex';
        if (sfx && sfx.playCelestialChime) setTimeout(() => sfx.playCelestialChime(), 2100);
        const btn = $('btn-five-seals-close');
        if (btn) setTimeout(() => btn.focus(), 80);
      };
      let ceremonyReturnFocus = null;
      const closeCeremony = () => {
        if (overlay) overlay.style.display = 'none';
        if (ceremonyReturnFocus && document.contains(ceremonyReturnFocus) && typeof ceremonyReturnFocus.focus === 'function') ceremonyReturnFocus.focus();
        ceremonyReturnFocus = null;
      };
      if ($('btn-five-seals-close')) $('btn-five-seals-close').addEventListener('click', closeCeremony);
      document.addEventListener('keydown', (e) => {
        if (!overlay || overlay.style.display === 'none') return;
        if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); closeCeremony(); }
        else if (e.key === 'Tab') { e.preventDefault(); const btn = $('btn-five-seals-close'); if (btn) btn.focus(); }   // the ceremony holds the focus
      }, true);

      // Test hook for scripts/audit/web_smoke.py: the courtyard and signals (they are in this source anyway) and the controls
      window.__cairn5 = {
        court: JSON.parse(JSON.stringify(COURT)),
        rounds: ROUNDS.slice(),
        mirrors: () => mirrors.join(''),
        turn: (i) => turnMirror(i),
        startDawn: () => startDawn(),
        state: () => ({ running: dawn.running, step: dawn.step, locks: dawn.locks, dawnDone: dawnDone(), round: roundsDone(), finale }),
        expireStep: () => { if (dawn.running) dawn.deadline = performance.now() - 1; },
        flash: (p) => { pulses.push(p === 'L' ? 'L' : 'S'); renderPulses(); },
        send: () => sendSignal()
      };

      // A save that answered the last signal but was closed before the light finished speaking: finish it now
      if (!isDone() && dawnDone() && (parseInt(get(KEYS.round) || '0', 10) || 0) >= ROUNDS.length) completeStation();
      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
