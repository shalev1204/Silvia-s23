
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
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(a && a.sfx && a.sfx(kind, o)); };
      // A held key turns mirrors faster than the ticks should sound
      let lastTurnCue = 0;
      const turnCue = () => { const n = Date.now(); if (n - lastTurnCue < 80) return true; lastTurnCue = n; return cue('tick', { f: 1700, v: 0.08 }); };
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
      const HOWTO_KEY = 'order_cairn5_howto', CINE_INTRO = 'order_cairn5_cine_intro';
      const SIGIL = 'DAYBREAK';

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
        "We answered it, Silvia, flash for flash, and it has sent another at once. Whoever is up there is testing us.",
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
        tSigil: $('solstice-telem-sigil'), tDawn: $('solstice-telem-dawn'), tSignal: $('solstice-telem-signal'), tSeal: $('solstice-telem-seal'),
        stage: $('solstice3d-stage'), canvas: $('solstice3d-canvas'), subtitle: $('solstice3d-subtitle'), fade: $('solstice3d-fade'), aim: $('solstice3d-aim'),
        status: $('solstice3d-status'), sun: $('solstice3d-sun'), sunLabel: $('solstice3d-sun-label'), howto: $('solstice3d-howto'), help: $('btn-solstice-howto'),
        courtBox: document.querySelector('.solstice3d-court-box')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const dawnDone = () => isDone() || get(KEYS.dawnDone) === 'true';
      const roundsDone = () => (isDone() ? ROUNDS.length : Math.max(0, Math.min(ROUNDS.length - 1, parseInt(get(KEYS.round) || '0', 10) || 0)));

      // Hints climb three levels (hub/js/hint-ladder.js); level 2 is the older help of each part
      const hints = window.EclipseHints;
      const sigilHints = hints.define({
        id: 's17-sigil', station: 'Station 17', title: 'the sigil of the midsummer ray', group: 'desert',
        anchor: el.keyFeedback, solved: isAwake, legacyKey: KEYS.hint,
        texts: [
          'Do not read every sun-stone on the page “Arch of the Solstice & The Solar Altar”, Silvia. Follow the ray from the arrow under the arch: only the stones it crosses count, in the order it crosses them.',
          'I wrote down how the ray bounces off the mirrors. It is in Ask Hermes: "How do I follow the ray on the page “Arch of the Solstice & The Solar Altar”?"',
          'Let us follow it together. From the arrow the ray goes straight down, and on the third flagstone it meets a mirror leaning like \\, which sends it to the right. Two flagstones further on it crosses the first sun-stone: D. Keep following it, mirror by mirror, until it reaches the altar.'
        ]
      });
      const dawnHints = hints.define({
        id: 's17-dawn', station: 'Station 17', title: 'the autumn dawn', group: 'desert',
        anchor: el.dawnFeedback, solved: dawnDone, active: isAwake, legacyKey: KEYS.dawnHint,
        texts: [
          'Do not wait for the sun to turn the mirrors, Silvia. The first ray can be set in the dark: turn the mirrors before you call the dawn, and save your haste for the other three.',
          'I have learnt to breathe slowly: now each ray waits longer. My note on working backwards from the altar is in Ask Hermes: "How do I aim the mirrors for an October dawn?"',
          'Let us set the first ray together, in the dark. Light can reach the altar from straight above it, or from the east along the bottom row. Try the first way: follow its column up to the first mirror, it must catch the light from the west and drop it down, so it leans like \\. Now look west of that mirror: the one there must send the light toward it. Ask the same question there, and walk back until you reach the arch.'
        ]
      });
      const signalHints = hints.define({
        id: 's17-signal', station: 'Station 17', title: 'the night signal', group: 'desert',
        anchor: el.signalFeedback, solved: isDone, active: dawnDone, legacyKey: KEYS.signalHint,
        texts: [
          'Watch the whole pattern before you touch the mirror. Some flashes are short and some are long, and the order matters as much as the count.',
          'I wrote the last pattern in my log for you, under the night sky. My note is in Ask Hermes: "How do I answer the light on Tower II?"',
          'Let us answer together. Touch the mirror and let go at once for a short flash; for a long one, hold it while you count one, two. Copy the flashes from my log one at a time, check the dots and dashes under the mirror, then send. A pause in the light is not a flash: leave it out.'
        ]
      });

      let mirrors = (() => {
        const saved = get(KEYS.mirrors);
        return saved && /^[fb]{12}$/.test(saved) ? saved.split('') : COURT.start.split('');
      })();
      const dawn = { running: false, step: 0, locks: 0, deadline: 0, raf: null };
      let pulses = [];
      let playing = null;   // timers of the light on Tower II
      let towerOn = false;  // the light on Tower II is burning this instant
      let finale = false;

      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
      function subtitle(text, secs, kind) {
        if (!el.subtitle) return;
        el.subtitle.textContent = text;
        el.subtitle.classList.toggle('is-act', kind === 'act');
        el.subtitle.classList.add('is-on');
        clearTimeout(subtitle.t);
        subtitle.t = setTimeout(() => el.subtitle.classList.remove('is-on'), (secs || 4.5) * 1000);
      }
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
        if (!turnCue() && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        const hadFocus = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-i') === String(i);
        checkRay();
        drawCourt();
        syncWorld();
        if (hadFocus) { const g = el.court.querySelector('[data-i="' + i + '"]'); if (g) g.focus(); }
      }

      // ---- The dawn ----
      const stepMs = () => (get(KEYS.dawnHint) === 'true' ? STEP_MS_HINTED : STEP_MS);
      function startDawn() {
        if (!isAwake() || dawnDone() || dawn.running) return;
        dawn.running = true; dawn.step = 0; dawn.locks = 0;
        dawn.deadline = performance.now() + stepMs();
        cue('whoosh', { dur: 1.4 });
        feedback(el.dawnFeedback, 'The first ray slips under the arch.', '');
        subtitle('The sun comes up behind the arch. Its first ray slips in at the bronze notch, low and gold.', 5, 'act');
        if (G && G.fx && G.fx.gait) G.fx.gait.react('wonder');
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
        const last = dawn.locks >= COURT.entries.length;
        sceneLock(dawn.locks, last, COURT.entries[dawn.step]);
        // each lock rings a step higher; the last one opens the altar
        if (last) cue('stone', { dur: 2 });
        if (!cue(last ? 'reveal' : 'shimmer', { deg: 12 + dawn.locks * 2 }) && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        setMood();
        if (dawn.locks >= COURT.entries.length) {
          stopDawn();
          set(KEYS.dawnDone, 'true');
          sceneDawnDone();
          subtitle('The fourth lock closes. The brass ring turns, and the altar opens like a flower.', 5.2, 'act');
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
        dawnHints.fail();
        cue('dusk');
        sceneSpent();
        dawn.locks = 0; dawn.step = 0;
        feedback(el.dawnFeedback, 'The sun climbed past the arch. The dawn is spent; the ring only takes a dawn ray.', 'error');
        say("Too high, Silvia. The courtyard is in plain daylight and the ring has let go of its locks. Tomorrow the sun will rise again, and the mirrors will still be where you left them." + (get(KEYS.dawnHint) === 'true' ? " I have counted my breaths: tomorrow each ray will wait longer for us." : ''));
        render();
      }

      // ---- The night signal ----
      function lightOn(on) {
        towerOn = !!on;
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
          // a high bell rings with each flash of the far light, longer for a long flash
          playing.push(setTimeout(() => { lightOn(true); cue('bell', { f: 1318.5, v: 0.04, len: p === 'L' ? 1.4 : 0.45 }); }, t));
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
        cue('bell', { f: 880, v: 0.04, len: held >= LONG_PRESS_MS ? 1.4 : 0.45 });
        pulses.push(held >= LONG_PRESS_MS ? 'L' : 'S');
        view.pulseT = performance.now();
        renderPulses();
      }
      function sendSignal() {
        if (!dawnDone() || isDone() || finale || !pulses.length) return;
        const r = roundsDone();
        if (pulses.join('') !== ROUNDS[r]) {
          const fails = (parseInt(get(KEYS.signalFails) || '0', 10) || 0) + 1;
          set(KEYS.signalFails, String(fails));
          signalHints.fail();
          cue('wrong');
          if (G && G.fx && G.fx.gait) G.fx.gait.react('worry');
          feedback(el.signalFeedback, 'The light on Tower II waits, then asks again.', 'error');
          pulses = []; renderPulses();
          render();
          return;
        }
        pulses = []; renderPulses();
        set(KEYS.round, String(r + 1));
        if (!cue('shimmer', { deg: 10 + r * 2 }) && sfx && sfx.playChimeHover) sfx.playChimeHover();
        if (r + 1 >= ROUNDS.length) { runFinale(); return; }
        feedback(el.signalFeedback, 'The light answers.', 'ok');
        if (G && G.fx && G.fx.gait) G.fx.gait.react('cheer');
        subtitle('Far away, the light on Tower II answers.', 3.2, 'act');
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
        say("Three short, a pause, two long. Silvia... I made that code for one person, more than fifty years ago, and the light up there has just sent it to us. We sent it back. Now it is spelling something, slowly, in the old light-code of the Order. I am writing it down.");
        const lines = ['[Y] − [O] = 2', '[L] + [G] = 23'];
        const burst = 'SLSSLLSLSSLSLLSS';
        let shown = '';
        playPattern(burst, () => {
          if (el.message) el.message.textContent = lines.join('   ·   ');
          drawNight(true);
          if (G && G.fx) { G.fx.shake.add(0.25); if (G.fx.gait) G.fx.gait.react('flinch'); }
          subtitle('The light on Tower II goes out, all at once. A red glow rises at its foot.', 5.5, 'act');
          cue('thud');
          cue('flame', { dur: 2.4 });
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
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
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
        if (!typed) { feedback(el.keyFeedback, 'Type the eight letters from the page “Arch of the Solstice & The Solar Altar”.', 'error'); return; }
        if (typed !== SIGIL) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The altar stays closed. Follow the midsummer ray across the page “Arch of the Solstice & The Solar Altar” again.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        cue('tick', { f: 2600, v: 0.08 });
        if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        view.sigilT = performance.now();
        if (G && G.fx) { const [ax, ay] = COURT.altar; G.fx.triumph({ x: colX(ax), y: BEAM_Y, z: rowZ(ay) }, 0.7); }
        subtitle('The carved sun on the arch glows. The brass ring of the altar unlocks its four catches.', 4.8, 'act');
        feedback(el.keyFeedback, 'DAYBREAK. The brass ring of the altar wakes, waiting for its light.', 'ok');
        say("DAYBREAK... and the ring of the altar unlocked its four catches, Silvia. But it wants a ray of light to close them, and this courtyard was built for a midsummer sun. In October the sun rises further south: its ray will come under the arch at the wrong place. We must turn the mirrors for an autumn dawn. Set them tonight, if you like; at dawn, be quick.");
        render();
        if (el.dawnBtn) setTimeout(() => el.dawnBtn.focus({ preventScroll: true }), 60);
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
        // the panel shows the part she is in; the scene shows the rest
        if (el.dawnGame) el.dawnGame.style.display = dDone ? 'none' : '';
        if (el.nightGame) el.nightGame.style.display = (!dDone || done) ? 'none' : '';
        if (el.status) el.status.textContent = done ? '✦ The last seal' : !awake ? 'The altar sleeps' : !dDone ? 'Locks ' + (dawn.running ? dawn.locks : 0) + ' / 4' : 'Signal ' + Math.min(r + 1, ROUNDS.length) + ' of ' + ROUNDS.length;
        if (el.stage) el.stage.classList.toggle('is-night', nightMode());
        setHover(view.hover !== null && awake && !dDone ? view.hover : null);
        syncWorld();
        placeHermes(false);
        setMood();
        sigilHints.refresh(); dawnHints.refresh(); signalHints.refresh();
      }
      // The courtyard's music fills with each lock at dawn and each answered signal at night
      function setMood() {
        const amb = window.EclipseAmbience;
        if (!amb || !amb.intensity) return;
        let k;
        if (isDone() || finale) k = 0.6;
        else if (dawnDone()) k = 0.4 + 0.05 * roundsDone();
        else if (dawn.running) k = 0.42 + 0.04 * dawn.locks;
        else k = isAwake() ? 0.35 : 0.3;
        amb.intensity(k);
      }

      // ---- The courtyard in 3D. Column x runs east (+X), row y runs south (+Z); the arch stands north of row 0 ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const S = 2.2, BEAM_Y = 1.2, ARCH_Z = -(COURT.rows / 2) * S - 0.75, ARCH_R = 7.3, PIER_H = 2.4;
      const colX = (x) => (x - (COURT.cols - 1) / 2) * S;
      const rowZ = (y) => (y - (COURT.rows - 1) / 2) * S;
      const TOWER = { x: 14, z: -125, h: 40 };
      const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, ending: 0, hover: null, sigilT: 0, sky: 0, spentT: 0, pulseT: 0, lockT: 0, opened: 0, fire: 0, rayCol: -1, endTimer: 0, holdCol: -1, holdT: 0, holdFx: null };
      const nightMode = () => dawnDone() && view.ending === 0;

      function discTex() {
        return P.canvasTex(256, 256, (g, w) => {
          const gr = g.createRadialGradient(w * 0.42, w * 0.38, 4, w / 2, w / 2, w / 2);
          gr.addColorStop(0, '#f6d38a'); gr.addColorStop(0.55, '#c08a3e'); gr.addColorStop(1, '#6a4416');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
          g.strokeStyle = 'rgba(70, 40, 10, 0.55)'; g.lineWidth = 3;
          [0.44, 0.36].forEach((r) => { g.beginPath(); g.arc(w / 2, w / 2, w * r, 0, Math.PI * 2); g.stroke(); });
          // a small engraved sun in the middle
          g.lineWidth = 4; g.beginPath(); g.arc(w / 2, w / 2, w * 0.07, 0, Math.PI * 2); g.stroke();
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6;
            g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * w * 0.1, w / 2 + Math.sin(a) * w * 0.1); g.lineTo(w / 2 + Math.cos(a) * w * 0.16, w / 2 + Math.sin(a) * w * 0.16); g.stroke();
          }
        });
      }
      function sealTex(T) {
        return P.canvasTex(128, 128, (g, w) => {
          g.clearRect(0, 0, w, w);
          const gr = g.createRadialGradient(w / 2, w / 2, 6, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,230,160,1)'); gr.addColorStop(0.45, 'rgba(255,200,110,0.6)'); gr.addColorStop(1, 'rgba(255,180,80,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
          g.fillStyle = '#7a4a1a'; g.beginPath(); g.arc(w / 2, w / 2, 22, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#ffe8b0'; g.font = '700 30px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('V', w / 2, w / 2 + 1);
        });
      }

      function buildWorld() {
        const T = window.THREE;
        if (!T || !P || !SC || !el.canvas) return null;
        let renderer;
        try { renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
        renderer.outputEncoding = T.sRGBEncoding;
        if (T.ReinhardToneMapping) { renderer.toneMapping = T.ReinhardToneMapping; renderer.toneMappingExposure = 1.08; }
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        const scene = new T.Scene();
        const PAL = {
          night: { top: new T.Color(0x05081a), mid: new T.Color(0x121c44), low: new T.Color(0x26305a), fog: new T.Color(0x0c1230) },
          dawn: { top: new T.Color(0x23305e), mid: new T.Color(0x8a6a8a), low: new T.Color(0xffa060), fog: new T.Color(0x6a5060) },
          day: { top: new T.Color(0x3a74c0), mid: new T.Color(0x86b2dc), low: new T.Color(0xf0dcb8), fog: new T.Color(0xc8b8a0) }
        };
        scene.fog = new T.Fog(PAL.night.fog.getHex(), 40, 230);
        const camera = new T.PerspectiveCamera(46, 16 / 10, 0.3, 900);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const glow = (color, sx, sy, extra) => new T.Sprite(new T.SpriteMaterial(Object.assign({ map: glowTex, color, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }, extra || {})));

        // ---- The sky: night, then a warm band low in the north at dawn, then plain day ----
        const skyGeo = new T.SphereGeometry(500, 36, 18);
        const skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
        skyGeo.setAttribute('color', new T.BufferAttribute(skyCol, 3));
        const sky = new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
        sky.renderOrder = -10;
        scene.add(sky);
        const ca = new T.Color(), cb = new T.Color(), cc = new T.Color(), lo = new T.Color(), mi = new T.Color(), to = new T.Color();
        const mixPal = (key, s, out) => {
          if (s <= 0.5) return out.copy(PAL.night[key]).lerp(PAL.dawn[key], s / 0.5);
          return out.copy(PAL.dawn[key]).lerp(PAL.day[key], (s - 0.5) / 0.5);
        };
        const paintSky = (s) => {
          const p = skyGeo.attributes.position;
          mixPal('low', s, lo); mixPal('mid', s, mi); mixPal('top', s, to);
          const warm = Math.max(0, 1 - Math.abs(s - 0.5) * 2);
          for (let i = 0; i < p.count; i++) {
            const y = p.getY(i) / 500, north = Math.max(0, -p.getZ(i) / 500);
            const h = Math.max(0, y);
            ca.copy(lo).lerp(mi, 0.55 * (1 - north) * warm);
            if (h < 0.22) cc.copy(ca).lerp(mi, h / 0.22); else cc.copy(mi).lerp(to, Math.min(1, (h - 0.22) / 0.6));
            skyCol[i * 3] = cc.r; skyCol[i * 3 + 1] = cc.g; skyCol[i * 3 + 2] = cc.b;
          }
          skyGeo.attributes.color.needsUpdate = true;
          mixPal('fog', s, scene.fog.color);
        };
        paintSky(0);
        const starsV = new Float32Array(1800 * 3), sr = P.rng(1717);
        for (let i = 0; i < 1800; i++) {
          const a = sr() * Math.PI * 2, y = 0.1 + Math.pow(sr(), 0.7) * 0.9, rr = Math.sqrt(1 - y * y);
          starsV.set([Math.cos(a) * rr * 420, y * 420, Math.sin(a) * rr * 420], i * 3);
        }
        const starsG = new T.BufferGeometry(); starsG.setAttribute('position', new T.BufferAttribute(starsV, 3));
        const stars = new T.Points(starsG, new T.PointsMaterial({ color: 0xe8ecff, size: 2.3, sizeAttenuation: false, map: glowTex, transparent: true, opacity: 0.9, fog: false, depthWrite: false, blending: T.AdditiveBlending }));
        scene.add(stars);
        const moon = new T.Sprite(new T.SpriteMaterial({ map: P.canvasTex(256, 256, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, w * 0.16, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(220,232,255,0.6)'); gr.addColorStop(1, 'rgba(160,180,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
          g.fillStyle = '#f4f1e6'; g.beginPath(); g.arc(w / 2, w / 2, w * 0.16, 0, Math.PI * 2); g.fill();
          g.fillStyle = 'rgba(180,176,160,0.35)'; g.beginPath(); g.arc(w * 0.46, w * 0.47, w * 0.04, 0, Math.PI * 2); g.arc(w * 0.55, w * 0.55, w * 0.03, 0, Math.PI * 2); g.fill();
        }), fog: false, depthWrite: false, transparent: true, toneMapped: false }));
        moon.scale.set(70, 70, 1); moon.position.set(-160, 190, 260);
        scene.add(moon);
        const sun = new T.Sprite(new T.SpriteMaterial({ map: P.canvasTex(256, 256, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(0.16, 'rgba(255,236,170,1)'); gr.addColorStop(0.22, 'rgba(255,190,110,0.55)'); gr.addColorStop(1, 'rgba(255,140,60,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        }), fog: false, depthWrite: false, transparent: true, opacity: 0, toneMapped: false }));
        sun.scale.set(60, 60, 1); sun.position.set(0, -20, -300);
        scene.add(sun);
        const hemi = new T.HemisphereLight(0x6a7cc8, 0x1a1626, 0.3);
        scene.add(hemi);
        // one light casts the shadows: the moon by night, the sun at dawn and by day
        const key = new T.DirectionalLight(0xbccbff, 0.55);
        key.castShadow = true;
        key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(key.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 140 });
        key.shadow.bias = -0.0008;
        key.target.position.set(0, 0, 0);
        scene.add(key); scene.add(key.target);

        // ---- The ground: sand all round, the flagstones of the courtyard, the low broken walls ----
        const sand = SC.tex.sand(17), sandMap = sand.map.clone(), sandBump = sand.bump.clone();
        [sandMap, sandBump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(40, 40); });
        const ground = new T.Mesh(new T.PlaneGeometry(700, 700), paint({ map: sandMap, bumpMap: sandBump, bumpScale: 0.7, color: 0x8a7a6a }));
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
        // low dunes on the horizon, so the sky has an edge
        const duneMat = paint({ color: 0x6a5a4e });
        const dr = P.rng(1718);
        for (let i = 0; i < 22; i++) {
          const a = (i / 22) * Math.PI * 2 + dr() * 0.2, r = 120 + dr() * 60, s = 18 + dr() * 26;
          const d = new T.Mesh(new T.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), duneMat);
          d.scale.set(s * 1.8, s * 0.22, s); d.position.set(Math.cos(a) * r, -0.4, Math.sin(a) * r); d.rotation.y = dr() * 3;
          scene.add(d);
        }
        const stoneMap = sand.map.clone(), stoneBump = sand.bump.clone();
        [stoneMap, stoneBump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(0.18, 0.18); });
        const stoneMat = paint({ bumpMap: stoneBump, bumpScale: 0.25, color: 0x9a8268 }, 0x8ea0ff, 0.1);
        const flagGeo = new T.BoxGeometry(S * 0.95, 0.26, S * 0.95);
        const flags = new T.InstancedMesh(flagGeo, paint({ bumpMap: stoneBump, bumpScale: 0.25, color: 0xffffff }), COURT.cols * COURT.rows);
        const dmy = new T.Object3D(), fr = P.rng(1719), fc = new T.Color();
        let fi = 0;
        for (let y = 0; y < COURT.rows; y++) for (let x = 0; x < COURT.cols; x++) {
          dmy.position.set(colX(x), 0.1 + (fr() - 0.5) * 0.04, rowZ(y)); dmy.rotation.set((fr() - 0.5) * 0.02, 0, (fr() - 0.5) * 0.02); dmy.updateMatrix();
          flags.setMatrixAt(fi, dmy.matrix);
          fc.setHSL(0.07 + fr() * 0.03, 0.28 + fr() * 0.1, 0.4 + fr() * 0.08); flags.setColorAt(fi, fc);
          fi++;
        }
        flags.receiveShadow = true; scene.add(flags);
        const walls = new T.Group();
        const addWall = (x0, z0, x1, z1, seed) => {
          const r = P.rng(seed), len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.6));
          for (let i = 0; i < n; i++) {
            if (r() < 0.14) continue;   // a gap where the wall has fallen
            const u = (i + 0.5) / n, h = 0.5 + r() * 1.1;
            const b = new T.Mesh(new T.BoxGeometry(len / n * 0.98, h, 0.7), stoneMat);
            b.position.set(x0 + (x1 - x0) * u, h / 2, z0 + (z1 - z0) * u);
            b.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);
            b.castShadow = true; b.receiveShadow = true; walls.add(b);
          }
        };
        const E = (COURT.cols / 2) * S + 0.5;
        addWall(-E, ARCH_Z, -E, E, 171); addWall(E, ARCH_Z, E, E, 172);
        addWall(-E, E, colX(2) + S * 0.5, E, 173); addWall(colX(4) + S * 0.6, E, E, E, 174);   // the south wall opens behind the altar
        addWall(-E, ARCH_Z, -ARCH_R - 1.3, ARCH_Z, 175); addWall(ARCH_R + 1.3, ARCH_Z, E, ARCH_Z, 176);
        scene.add(walls);

        // ---- The Arch of the Solstice: a wall of sandstone with a great round opening, a carved sun on its keystone ----
        const outerW = ARCH_R + 1.3, outerH = PIER_H + ARCH_R + 1.4;
        const shape = new T.Shape();
        shape.moveTo(-outerW, 0); shape.lineTo(-outerW, outerH); shape.lineTo(outerW, outerH); shape.lineTo(outerW, 0); shape.lineTo(ARCH_R, 0);
        shape.lineTo(ARCH_R, PIER_H); shape.absarc(0, PIER_H, ARCH_R, 0, Math.PI, false); shape.lineTo(-ARCH_R, 0); shape.lineTo(-outerW, 0);
        const archGeo = new T.ExtrudeGeometry(shape, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 2, curveSegments: 40 });
        archGeo.translate(0, 0, -0.8);
        const archStrata = SC.tex.strata(23).clone(); archStrata.needsUpdate = true; archStrata.wrapS = archStrata.wrapT = T.RepeatWrapping; archStrata.repeat.set(0.08, 0.08);
        const arch = new T.Mesh(archGeo, paint({ map: archStrata, color: 0xc8b49a }, 0xffc890, 0.12));
        arch.position.set(0, 0, ARCH_Z); arch.castShadow = true; arch.receiveShadow = true; scene.add(arch);
        const cornice = new T.Mesh(new T.BoxGeometry(outerW * 2 + 0.8, 0.5, 2.2), stoneMat);
        cornice.position.set(0, outerH + 0.25, ARCH_Z); cornice.castShadow = true; scene.add(cornice);
        const keySun = new T.Mesh(new T.CircleGeometry(0.9, 24), new T.MeshStandardMaterial({ map: discTex(), metalness: 0.6, roughness: 0.4, emissive: 0xffa040, emissiveIntensity: 0.1 }));
        keySun.position.set(0, PIER_H + ARCH_R + 0.65, ARCH_Z + 0.95); scene.add(keySun);
        // the four bronze notches in the threshold, where the October rays come in
        const notchMat = () => new T.MeshStandardMaterial({ color: 0x8a6430, metalness: 0.6, roughness: 0.45, emissive: 0x000000 });
        const notches = COURT.entries.map((col) => {
          const m = new T.Mesh(new T.ConeGeometry(0.34, 0.6, 3), notchMat());
          m.rotation.x = Math.PI / 2; m.position.set(colX(col), 0.32, rowZ(0) - S * 0.75); scene.add(m);
          return m;
        });

        // ---- The fallen pillars: a broken stump and its drums in the dust ----
        const pillarMat = stoneMat;
        const pr = P.rng(1720);
        COURT.pillars.forEach(([x, y]) => {
          const g = new T.Group();
          const h = 1.5 + pr() * 1.2;
          const stump = new T.Mesh(new T.CylinderGeometry(0.55, 0.62, h, 16), pillarMat);
          stump.position.y = h / 2; stump.castShadow = true; stump.receiveShadow = true; g.add(stump);
          const top = new T.Mesh(new T.CylinderGeometry(0.5, 0.55, 0.2, 7), pillarMat); top.position.y = h + 0.05; top.rotation.set(0.15, pr() * 3, 0.1); g.add(top);
          const drum = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.9, 14), pillarMat);
          drum.rotation.set(0, pr() * 3, Math.PI / 2); drum.position.set((pr() - 0.5) * 0.6, 0.5, 0.65); drum.castShadow = true; g.add(drum);
          const base = new T.Mesh(new T.BoxGeometry(1.5, 0.3, 1.5), pillarMat); base.position.y = 0.3; base.receiveShadow = true; g.add(base);
          g.position.set(colX(x), 0, rowZ(y)); g.rotation.y = pr() * Math.PI;
          scene.add(g);
        });
        const pillarSpark = glow(0xffd27a); pillarSpark.scale.set(1.6, 1.6, 1); scene.add(pillarSpark);

        // ---- The bronze mirrors: a disc on a pivot over a stone pedestal ----
        const discMap = discTex();
        const mirrorObjs = COURT.mirrors.map(([x, y], i) => {
          const g = new T.Group();
          const ped = new T.Mesh(new T.CylinderGeometry(0.4, 0.5, 0.22, 12), stoneMat); ped.position.y = 0.11; ped.castShadow = true; g.add(ped);
          const pivot = new T.Group(); pivot.position.y = BEAM_Y - 0.22; g.add(pivot);
          const mat = new T.MeshStandardMaterial({ map: discMap, color: 0xffffff, metalness: 0.55, roughness: 0.32, emissive: 0xffb050, emissiveIntensity: 0.12 });
          const disc = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 0.08, 32), mat);
          disc.rotation.x = Math.PI / 2; disc.castShadow = true; pivot.add(disc);
          const rim = new T.Mesh(new T.TorusGeometry(0.64, 0.05, 6, 32), new T.MeshStandardMaterial({ color: 0x6a4416, metalness: 0.7, roughness: 0.4, emissive: 0xffd27a, emissiveIntensity: 0 }));
          pivot.add(rim);
          const yokeMat = new T.MeshStandardMaterial({ color: 0x8a6430, metalness: 0.3, roughness: 0.5 });
          [-1, 1].forEach((s) => { const post = new T.Mesh(new T.BoxGeometry(0.08, 0.8, 0.08), yokeMat); post.position.set(s * 0.72, -0.36, 0); pivot.add(post); });
          const foot = new T.Mesh(new T.BoxGeometry(1.52, 0.07, 0.14), yokeMat); foot.position.y = -0.74; pivot.add(foot);
          const ang = mirrors[i] === 'f' ? Math.PI / 4 : -Math.PI / 4;
          pivot.rotation.y = ang;
          const hit = new T.Mesh(new T.BoxGeometry(S * 0.92, 2.4, S * 0.92), new T.MeshBasicMaterial({ visible: false }));
          hit.position.y = 1.2; hit.userData.i = i; g.add(hit);
          const flare = glow(0xffe6a0); flare.scale.set(2.4, 2.4, 1); flare.position.y = BEAM_Y - 0.22; g.add(flare);
          g.position.set(colX(x), 0.22, rowZ(y));
          scene.add(g);
          return { g, pivot, mat, rim, hit, flare, angle: ang, target: ang, lit: 0, kick: 0 };
        });

        // ---- The Solar Altar: a drum on its terrace, and the brass ring of four locks standing up to face the light ----
        const [ax, ay] = COURT.altar;
        const altar = new T.Group();
        const terrace = new T.Mesh(new T.BoxGeometry(S * 1.1, 0.3, S * 1.1), stoneMat); terrace.position.y = 0.05; terrace.receiveShadow = true; terrace.castShadow = true; altar.add(terrace);
        const drum = new T.Mesh(new T.CylinderGeometry(0.6, 0.7, 1.0, 20), stoneMat); drum.position.set(0, 0.7, 0.75); drum.castShadow = true; drum.receiveShadow = true; altar.add(drum);
        const lid = new T.Mesh(new T.CylinderGeometry(0.66, 0.64, 0.14, 20), new T.MeshStandardMaterial({ color: 0xb08040, metalness: 0.3, roughness: 0.45, emissive: 0x3a2008, emissiveIntensity: 0.3 }));
        lid.position.set(0, 1.26, 0.75); altar.add(lid);
        // the ring stands at the height of the ray, facing north, on two bronze posts
        const RING_Y = BEAM_Y - 0.1;
        const ringGroup = new T.Group(); ringGroup.position.set(0, RING_Y, 0); altar.add(ringGroup);
        const lockArcs = [];
        for (let i = 0; i < 4; i++) {
          const m = new T.MeshStandardMaterial({ color: 0xc89048, metalness: 0.3, roughness: 0.4, emissive: 0xffc860, emissiveIntensity: 0 });
          const arc = new T.Mesh(new T.TorusGeometry(0.62, 0.08, 8, 24, Math.PI / 2 - 0.24), m);
          arc.rotation.z = Math.PI / 2 + i * Math.PI / 2 + 0.12; arc.castShadow = true;
          ringGroup.add(arc); lockArcs.push(m);
        }
        const postMat = new T.MeshStandardMaterial({ color: 0x8a6430, metalness: 0.3, roughness: 0.5 });
        [-1, 1].forEach((sx) => { const p2 = new T.Mesh(new T.BoxGeometry(0.1, RING_Y - 0.2, 0.1), postMat); p2.position.set(sx * 0.74, (RING_Y - 0.2) / 2 + 0.2, 0); altar.add(p2); });
        const ringGlow = glow(0xffd27a); ringGlow.scale.set(2.6, 2.6, 1); ringGlow.position.set(0, RING_Y, 0); altar.add(ringGlow);
        const altarLight = new T.PointLight(0xffc06a, 0, 9, 1.6); altarLight.position.set(0, RING_Y + 0.6, 0.4); altar.add(altarLight);
        const seal = new T.Sprite(new T.SpriteMaterial({ map: sealTex(T), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
        seal.scale.set(1.1, 1.1, 1); seal.position.set(0, RING_Y, 0); altar.add(seal);
        altar.position.set(colX(ax), 0.1, rowZ(ay));
        scene.add(altar);

        // ---- The ray: a gold core and a soft sheath, one piece per straight run, drawn out from the arch ----
        const segGeo = new T.BoxGeometry(1, 1, 1);
        const beam = Array.from({ length: 18 }, () => {
          const core = new T.Mesh(segGeo, new T.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          const sheath = new T.Mesh(segGeo, new T.MeshBasicMaterial({ color: 0xffb040, transparent: true, opacity: 0.22, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          core.visible = sheath.visible = false; core.renderOrder = sheath.renderOrder = 4;
          scene.add(core); scene.add(sheath);
          return { core, sheath };
        });
        // the shaft of morning light that comes down past the arch to where the ray enters
        const shaft = new T.Mesh(segGeo, new T.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, fog: false }));
        shaft.renderOrder = 3; scene.add(shaft);
        const entryGlow = glow(0xffd890); entryGlow.scale.set(2.2, 2.2, 1); scene.add(entryGlow);
        const tipGlow = glow(0xfff0c0); tipGlow.scale.set(1.3, 1.3, 1); scene.add(tipGlow);

        // ---- Tower II on the northern horizon, seen through the arch: its light, and later the fire ----
        const towerMat = paint({ color: 0x241c22 });
        const tower = new T.Group();
        [[0, 0, 7, 0.62], [0, 0.62, 4.6, 0.3], [0, 0.92, 2.6, 0.08]].forEach(([x, y0, w, hk]) => {
          const b = new T.Mesh(new T.BoxGeometry(w, TOWER.h * hk, w), towerMat); b.position.set(x, TOWER.h * (y0 + hk / 2), 0); tower.add(b);
        });
        [-1, 1].forEach((s) => { const t = new T.Mesh(new T.BoxGeometry(1.8, TOWER.h * 0.5, 1.8), towerMat); t.position.set(s * 4.4, TOWER.h * 0.25, 0); tower.add(t); });
        tower.position.set(TOWER.x, 0, TOWER.z); scene.add(tower);
        const towerLight = glow(0xfff2c0, 1, 1, { fog: false }); towerLight.scale.set(22, 22, 1); towerLight.position.set(TOWER.x, TOWER.h + 1, TOWER.z + 4); scene.add(towerLight);
        const towerSpark = glow(0xffffff, 1, 1, { fog: false }); towerSpark.scale.set(3, 3, 1); towerSpark.position.copy(towerLight.position); scene.add(towerSpark);
        const fireGlow = glow(0xff3a1a, 1, 1, { fog: false }); fireGlow.scale.set(60, 18, 1); fireGlow.position.set(TOWER.x, 3, TOWER.z + 4); scene.add(fireGlow);
        const smokeTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(120,112,108,0.75)'); gr.addColorStop(1, 'rgba(120,112,108,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const smoke = Array.from({ length: 16 }, (u, i) => {
          const m = new T.Sprite(new T.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
          m.userData.t = i / 16; scene.add(m);
          return m;
        });

        // ---- Hermes, his lamp, and the signal mirror he flashes at night ----
        let H = null;
        try {
          H = P.buildHermes(T, glowTex);
          H.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(H.hermes);
        } catch (e) { H = null; }
        const lamp = new T.PointLight(0xffc27a, 1.3, 7, 1.6); scene.add(lamp);
        const glare = glow(0xfff6d0); glare.scale.set(1.6, 1.6, 1); scene.add(glare);
        const glareBeam = new T.Mesh(segGeo, new T.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, fog: false }));
        scene.add(glareBeam);

        let fx = null;
        try {
          if (window.EclipseFX) fx = window.EclipseFX.kit(renderer, scene, H, {
            look: { bloom: 0.7, threshold: 0.84, knee: 0.16, vignette: 0.34, grain: 0.03, ca: 0.12, sat: 1.04, contrast: 1.04, gain: [1.0, 1.0, 1.03], shade: 0.18, shadeColor: [0.5, 0.58, 0.95] },
            sandColor: 0xb8a48c, printColor: 0x5a4a3a, printLife: 30, scale: 1, wind: [0.4, 0, 0.6],
            ambient: () => (dawn.running ? { x: 0, z: 0 } : null), ambientRadius: 10, ambientAlpha: 0.08, ambientColor: 0xffd8a0, ambientEvery: 0.1
          });
        } catch (e) { fx = null; }

        return { T, renderer, scene, camera, lowPower, sky, paintSky, stars, moon, sun, hemi, key, notches, mirrors: mirrorObjs, altar, lockArcs, ringGlow, altarLight, seal,
          beam, shaft, entryGlow, tipGlow, pillarSpark, keySun, tower, towerLight, towerSpark, fireGlow, smoke, H, hermes: H && H.hermes, lamp, glare, glareBeam, fx,
          ray: new T.Raycaster(), hits: mirrorObjs.map((m) => m.hit), skyShown: -1, rayKey: '', reveal: 0, rayLen: 0, rayPts: [],
          cam: { yaw: 0, pitch: 0.86, dist: 31, tYaw: 0, tPitch: 0.86, tDist: 31, p: null, l: null }, hermesAt: null };
      }

      // ---- The ray in the scene: where it runs, how far it has come, what it touches ----
      function rayPoints(col) {
        const r = trace(col);
        const pts = [[colX(col), ARCH_Z - 2.4]].concat(r.pts.map(([x, y]) => [colX(x), rowZ(y)]));
        if (r.end === 'out') {
          const [lx, ly] = r.pts[r.pts.length - 1];
          pts.push([colX(lx) + r.dir[0] * S * 0.9, rowZ(ly) + r.dir[1] * S * 0.9]);
        }
        // a stone or the altar stops it at its near face, not in its middle
        if (r.end === 'pillar' || r.end === 'altar') {
          const a = pts[pts.length - 2], b = pts[pts.length - 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          const cut = r.end === 'pillar' ? 0.62 : 0;
          pts[pts.length - 1] = [b[0] - (b[0] - a[0]) / d * cut, b[1] - (b[1] - a[1]) / d * cut];
        }
        // only the corners matter for drawing
        const out = [pts[0]];
        for (let i = 1; i < pts.length - 1; i++) {
          const a = out[out.length - 1], b = pts[i], c = pts[i + 1];
          const straight = (Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(b[0] - c[0]) < 1e-6) || (Math.abs(a[1] - b[1]) < 1e-6 && Math.abs(b[1] - c[1]) < 1e-6);
          if (!straight) out.push(b);
        }
        out.push(pts[pts.length - 1]);
        return { pts: out, end: r.end, cells: r.pts };
      }
      function updateBeam(dt, now) {
        const holding = view.holdCol >= 0 && now - view.holdT < 1300;
        if (!holding && view.holdCol >= 0) { view.holdCol = -1; if (view.holdFx) { view.holdFx(); view.holdFx = null; } }
        const showRay = dawn.running || view.ending === 1;
        const col = holding ? view.holdCol : dawn.running ? COURT.entries[dawn.step] : view.rayCol;
        G.beam.forEach((b) => { b.core.visible = b.sheath.visible = false; });
        G.mirrors.forEach((m) => { m.lit = Math.max(0, m.lit - dt * 3); });
        if (!showRay || col < 0) {
          G.rayKey = ''; G.reveal = 0;
          G.shaft.material.opacity = Math.max(0, G.shaft.material.opacity - dt * 2);
          G.entryGlow.material.opacity = 0; G.tipGlow.material.opacity = 0; G.pillarSpark.material.opacity = 0;
          return;
        }
        const r = rayPoints(col);
        const keyNow = col + ':' + r.pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(';');
        if (keyNow !== G.rayKey) {
          // the ray keeps what it shares with the old one and draws out only the new part
          let shared = 0;
          const old = G.rayPts;
          if (old.length && old[0][0] === r.pts[0][0]) {
            for (let i = 1; i < Math.min(old.length, r.pts.length); i++) {
              const a = old[i], b = r.pts[i];
              const prev = r.pts[i - 1];
              if (Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6) shared += Math.hypot(b[0] - prev[0], b[1] - prev[1]);
              else {
                // the old and the new run leave the same corner: they share up to that corner
                break;
              }
            }
          }
          G.reveal = Math.min(G.reveal, shared);
          G.rayKey = keyNow; G.rayPts = r.pts; G.rayEnd = r.end;
        }
        let total = 0;
        for (let i = 1; i < r.pts.length; i++) total += Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1]);
        G.rayLen = total;
        G.reveal = reduced() ? total : Math.min(total, G.reveal + dt * 60);
        let left = G.reveal, tip = r.pts[0];
        for (let i = 1; i < r.pts.length && i - 1 < G.beam.length; i++) {
          const a = r.pts[i - 1], b = r.pts[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (left <= 0) break;
          const use = Math.min(len, left);
          left -= use;
          const ux = (b[0] - a[0]) / (len || 1), uz = (b[1] - a[1]) / (len || 1);
          const e = [a[0] + ux * use, a[1] + uz * use];
          tip = e;
          const s = G.beam[i - 1];
          const mx = (a[0] + e[0]) / 2, mz = (a[1] + e[1]) / 2, yaw = Math.atan2(ux, uz);
          const flick = reduced() ? 1 : 1 + Math.sin(now / 90 + i) * 0.08;
          s.core.position.set(mx, BEAM_Y, mz); s.core.rotation.set(0, yaw, 0); s.core.scale.set(0.09 * flick, 0.09 * flick, use + 0.09);
          s.sheath.position.set(mx, BEAM_Y, mz); s.sheath.rotation.set(0, yaw, 0); s.sheath.scale.set(0.42, 0.42, use + 0.3);
          s.core.visible = s.sheath.visible = true;
          // a mirror the ray has reached shines
          if (use >= len - 1e-3 && i < r.pts.length - 1) {
            const mi = mirrorIndex.get(cellKey(Math.round(b[0] / S + (COURT.cols - 1) / 2), Math.round(b[1] / S + (COURT.rows - 1) / 2)));
            if (mi !== undefined) G.mirrors[mi].lit = 1;
          }
        }
        const arrived = G.reveal >= total - 1e-3;
        // the caught ray: once it is seen to reach the ring, the lock closes in the scene and the next ray comes
        if (holding && arrived && now - view.holdT > 250) { view.holdT = now - 1300; }
        G.tipGlow.position.set(tip[0], BEAM_Y, tip[1]);
        G.tipGlow.material.opacity = arrived ? (r.end === 'out' ? 0 : 0.85) : 0.95;
        G.pillarSpark.material.opacity = arrived && r.end === 'pillar' ? 0.7 + (reduced() ? 0 : 0.25 * Math.sin(now / 70)) : 0;
        if (arrived && r.end === 'pillar') G.pillarSpark.position.set(tip[0], BEAM_Y, tip[1]);
        G.entryGlow.position.set(r.pts[0][0], BEAM_Y, rowZ(0) - S * 0.75);
        G.entryGlow.material.opacity = 0.9;
        // the shaft: from the sun, down past the arch, to where the ray comes in
        const sp = G.sun.position, ex = r.pts[0][0], ez = r.pts[0][1];
        const dx = ex - sp.x * 0.25, dy = BEAM_Y - (sp.y * 0.25), dz = ez - (sp.z * 0.25);
        const L = Math.hypot(dx, dy, dz);
        G.shaft.position.set(ex - dx / 2, BEAM_Y - dy / 2, ez - dz / 2);
        G.shaft.lookAt(ex, BEAM_Y, ez);
        G.shaft.scale.set(1.4, 1.4, L);
        G.shaft.material.opacity = Math.min(0.12, G.shaft.material.opacity + dt * 0.2);
      }

      // ---- Keeping the scene in step with the game ----
      function syncWorld() {
        if (!G) return;
        G.mirrors.forEach((m, i) => {
          const want = mirrors[i] === 'f' ? Math.PI / 4 : -Math.PI / 4;
          // turn it the short way, a quarter at a time, whichever way it last went
          let d = want - m.target;
          d = ((d % Math.PI) + Math.PI * 1.5) % Math.PI - Math.PI / 2;
          if (Math.abs(d) > 1e-3) { m.target += Math.abs(d) < Math.PI / 2 - 1e-3 ? d : Math.PI / 2; if (!view.snapNext) m.kick = 1; }
          if (view.snapNext) m.angle = m.target;
        });
        view.snapNext = false;
      }
      function placeHermes(snap) {
        if (!G || !G.hermes) return;
        let at, face;
        const [ax, ay] = COURT.altar;
        if (nightMode()) { at = [0.9, 0.2]; face = [TOWER.x - 0.9, TOWER.z - 0.2]; }
        else if (!isAwake()) { at = [colX(ax) + 1.6, rowZ(ay) + 0.5]; face = [-1.6, -0.5]; }
        else { at = [colX(ax) + 1.25, rowZ(ay) + S * 0.95]; face = [-0.6, -1]; }
        if (snap || !G.hermesAt) { G.hermesAt = at.slice(); }
        G.hermesGoal = at; G.hermesFace = face;
      }

      // ---- The camera: over the courtyard from the south; she can turn it, raise it, come closer ----
      function bindPointer() {
        const c = el.canvas;
        if (!c || c.__solsticePointer) return;
        c.__solsticePointer = true;
        c.style.touchAction = 'none';
        const pt = { down: false, x: 0, y: 0, moved: 0, flash: false };
        c.addEventListener('pointerdown', (e) => {
          // at night the whole scene is Hermes's mirror: press and hold to flash
          if (nightMode() && !isDone() && !finale && !busyOverlay()) { pt.flash = true; pressStart(e); return; }
          pt.down = true; pt.x = e.clientX; pt.y = e.clientY; pt.moved = 0; try { c.setPointerCapture(e.pointerId); } catch (err) {}
        });
        c.addEventListener('pointermove', (e) => {
          if (pt.down) {
            const dx = e.clientX - pt.x, dy = e.clientY - pt.y;
            pt.moved += Math.abs(dx) + Math.abs(dy);
            if (G && pt.moved > 4) {
              G.cam.tYaw = Math.max(-0.7, Math.min(0.7, G.cam.tYaw - dx * 0.004));
              G.cam.tPitch = Math.max(0.45, Math.min(1.3, G.cam.tPitch + dy * 0.004));
            }
            pt.x = e.clientX; pt.y = e.clientY;
          } else if (!pt.flash) setHover(mirrorUnder(e));
        });
        const up = (e) => {
          if (pt.flash) { pt.flash = false; pressEnd(e); return; }
          if (!pt.down) return;
          pt.down = false;
          if (pt.moved > 6 || !G) return;
          const m = mirrorUnder(e);
          if (m !== null && !busyOverlay()) turnMirror(m);
        };
        c.addEventListener('pointerup', up);
        c.addEventListener('pointercancel', (e) => { if (pt.flash) { pt.flash = false; pressEnd(e); } pt.down = false; });
        c.addEventListener('pointerleave', (e) => { if (pt.flash) { pt.flash = false; pressEnd(e); } setHover(null); });
        c.addEventListener('wheel', (e) => { if (!G) return; e.preventDefault(); G.cam.tDist = Math.max(13, Math.min(44, G.cam.tDist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
        c.addEventListener('dblclick', () => { if (G) { G.cam.tYaw = 0; G.cam.tPitch = 0.86; G.cam.tDist = 31; } });
      }
      function mirrorUnder(e) {
        if (!G || !isAwake() || dawnDone()) return null;
        const r = el.canvas.getBoundingClientRect();
        const ndc = new G.T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        G.ray.setFromCamera(ndc, G.camera);
        const hit = G.ray.intersectObjects(G.hits, false)[0];
        return hit ? hit.object.userData.i : null;
      }
      function setHover(i) {
        view.hover = i === null || i === undefined ? null : i;
        if (el.canvas) el.canvas.style.cursor = view.hover !== null ? 'pointer' : (nightMode() && !isDone() ? 'crosshair' : '');
        if (!el.aim) return;
        if (view.hover !== null) {
          const [x, y] = COURT.mirrors[view.hover];
          el.aim.textContent = '⟲ Turn this mirror · row ' + (y + 1) + ', column ' + (x + 1);
          el.aim.classList.add('is-on');
        } else if (nightMode() && !isDone() && dawnDone()) {
          el.aim.textContent = '🪞 Press and hold on the scene to flash the mirror';
          el.aim.classList.add('is-on');
        } else el.aim.classList.remove('is-on');
      }
      function placeCamera(dt, snap) {
        const cam = G.camera, c = G.cam;
        let p, l;
        const [ax, ay] = COURT.altar;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else if (!isAwake()) { p = [colX(ax) - 1.8, 3.2, rowZ(ay) + 6.2]; l = [colX(ax) + 0.6, 1.2, rowZ(ay) - 1.4]; }
        else if (view.ending === 1) { p = [colX(ax) + 3.2, 2.9, rowZ(ay) + 4.4]; l = [colX(ax), 1.6, rowZ(ay)]; }
        else if (nightMode()) {
          // behind Hermes in the middle of the courtyard, the arch framing Tower II far to the north
          const back = isDone() ? 2.5 : 0;
          p = [-1.7, 3.9 + back * 0.3, 9.6 + back]; l = [4.6, 6.4, -150];
        } else {
          const k = Math.min(1, dt * 5);
          c.yaw += (c.tYaw - c.yaw) * k; c.pitch += (c.tPitch - c.pitch) * k; c.dist += (c.tDist - c.dist) * k;
          const tx = 0, ty = 0, tz = 1.2;
          p = [tx + Math.sin(c.yaw) * Math.cos(c.pitch) * c.dist, ty + Math.sin(c.pitch) * c.dist, tz + Math.cos(c.yaw) * Math.cos(c.pitch) * c.dist];
          l = [tx, ty, tz - 1.8];
        }
        if (!c.p || snap) { c.p = p.slice(); c.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * (view.ending === 1 ? 2.2 : 3.2));
          for (let i = 0; i < 3; i++) { c.p[i] += (p[i] - c.p[i]) * k; c.l[i] += (l[i] - c.l[i]) * k; }
        }
        cam.position.set(c.p[0], c.p[1], c.p[2]);
        cam.lookAt(c.l[0], c.l[1], c.l[2]);
      }
      function openingShots() {
        const [ax, ay] = COURT.altar;
        return [
          { from: { p: [0, 34, 30], l: [0, 2, -4] }, to: { p: [0, 22, 20], l: [0, 2, -2] }, dur: 6, kicker: 'STATION 17', title: 'THE ARCH OF THE SOLSTICE', line: 'Night under the Arch of the Solstice. A courtyard of bronze mirrors, built to catch one sun a year.' },
          { from: { p: [-9.5, 2.2, -3], l: [4, 1, -4] }, to: { p: [-8, 2.4, 4], l: [4, 1, 3] }, dur: 5.5, line: 'Twelve bronze mirrors on their pivots, and five fallen pillars that stop the light.' },
          { from: { p: [colX(ax) + 6, 4.2, rowZ(ay) + 5], l: [colX(ax), 1.5, rowZ(ay)] }, to: { p: [colX(ax) + 3, 2.7, rowZ(ay) + 4], l: [colX(ax), 1.7, rowZ(ay)] }, dur: 5.5, line: 'The Solar Altar, and its brass ring of four locks. It only takes a ray of the dawn.' }
        ];
      }

      // ---- The frame ----
      function drawFrame(now, dt) {
        if (!G) return;
        const t = now / 1000, rm = reduced();
        const night = nightMode(), done = isDone();
        // the sky: night, a dawn that warms ray by ray, the day when it is spent or won
        let target = 0, frac = 0;
        if (dawn.running) {
          frac = Math.max(0, Math.min(1, 1 - (dawn.deadline - performance.now()) / stepMs()));
          target = 0.3 + 0.12 * (dawn.step + frac);
        } else if (view.ending === 1) target = 0.82;
        else if (!night && view.spentT && now - view.spentT < 2600) target = 1;
        view.sky += (target - view.sky) * Math.min(1, dt * (rm ? 50 : 1.1));
        if (Math.abs(view.sky - G.skyShown) > 0.003) {
          G.skyShown = view.sky;
          const s = view.sky;
          G.paintSky(s);
          G.stars.material.opacity = 0.9 * Math.max(0, 1 - s * 2.2);
          G.moon.material.opacity = Math.max(0, 1 - s * 2);
          G.hemi.intensity = 0.3 + s * 0.5;
          G.hemi.color.setHex(0x6a7cc8).lerp(new G.T.Color(0xffe8c8), Math.min(1, s * 1.4));
          G.hemi.groundColor.setHex(0x1a1626).lerp(new G.T.Color(0x6a5040), s);
        }
        // the sun: low behind the arch, sliding west and climbing with every ray
        const s = view.sky;
        const col = dawn.running ? COURT.entries[dawn.step] : (view.rayCol >= 0 ? view.rayCol : COURT.entries[0]);
        const climb = dawn.running ? dawn.step + frac : (view.ending === 1 ? 4 : 5);
        G.sun.position.set(colX(col) * 6 - frac * S * 3, 14 + climb * 16, -300);
        G.sun.material.opacity = Math.min(1, Math.max(0, (s - 0.18) * 3));
        const kd = Math.min(1, s * 2);
        const moonDir = [-14, 40, 30], sunDir = [G.sun.position.x * 0.12, G.sun.position.y * 0.12, -36];
        G.key.position.set(moonDir[0] + (sunDir[0] - moonDir[0]) * kd, moonDir[1] + (sunDir[1] - moonDir[1]) * kd, moonDir[2] + (sunDir[2] - moonDir[2]) * kd);
        G.key.color.setHex(0xbccbff).lerp(new G.T.Color(s > 0.6 ? 0xfff0dc : 0xffc890), kd);
        G.key.intensity = 0.55 + kd * (s > 0.6 ? 0.95 : 0.7);
        // the mirrors turn on their pivots with a little overshoot, and shine where the ray strikes them
        G.mirrors.forEach((m, i) => {
          const d = m.target - m.angle;
          m.angle += rm ? d : d * Math.min(1, dt * 11);
          m.kick = Math.max(0, m.kick - dt * 2.4);
          m.pivot.rotation.y = m.angle + (rm ? 0 : Math.sin(m.kick * Math.PI * 3) * m.kick * 0.08);
          const hot = view.hover === i;
          m.mat.emissiveIntensity = 0.12 + m.lit * 0.75 + (hot ? 0.18 : 0);
          m.rim.material.emissiveIntensity = (hot ? 0.9 : 0) + m.kick * 0.6 + m.lit * 0.3;
          m.flare.material.opacity = m.lit * (0.65 + (rm ? 0 : 0.2 * Math.sin(t * 9 + i)));
        });
        updateBeam(dt, now);
        // the threshold notches: gold for the ray to come, green for a ray already caught
        const locks = dawnDone() ? 4 : dawn.locks;
        G.notches.forEach((n, k) => {
          const past = k < locks, cur = dawn.running && k === dawn.step;
          n.material.emissive.setHex(past ? 0x22c55e : cur ? 0xffc040 : 0x000000);
          n.material.emissiveIntensity = past ? 0.6 : cur ? 0.8 + (rm ? 0 : 0.4 * Math.sin(t * 6)) : 0;
        });
        // the ring: a lock lights for each ray it took; a fresh lock flares
        const flare = view.lockT ? Math.max(0, 1 - (now - view.lockT) / 900) : 0;
        G.lockArcs.forEach((m, i) => { m.emissiveIntensity = i < locks ? 0.9 + flare * 1.2 : (isAwake() ? 0.12 : 0.03); });
        const ringOn = (dawn.running && G.rayEnd === 'altar' && G.reveal >= G.rayLen - 1e-3) || view.ending === 1;
        G.ringGlow.material.opacity = Math.min(1, flare + (ringOn ? 0.7 : 0) + (dawnDone() && !night ? 0.4 : 0));
        G.altarLight.intensity = 2.4 * Math.min(1, flare + (ringOn ? 0.6 : 0)) + (view.opened || 0) * 1.6;
        const opening = dawnDone() ? Math.min(1, (view.opened || 0) + dt / (rm ? 0.01 : 2.4)) : 0;
        view.opened = opening;
        G.seal.material.opacity = view.ending === 1 ? opening : 0;
        G.seal.position.y = BEAM_Y - 0.1 + 1.5 * opening + (rm ? 0 : Math.sin(t * 1.6) * 0.06 * opening);
        G.keySun.material.emissiveIntensity = 0.1 + (view.sigilT ? Math.max(0, 1 - (now - view.sigilT) / 2200) * 1.4 : 0) + s * 0.3;
        // Tower II: its light when it speaks, the glow of Hermes's mirror when she flashes, the fire at the end
        const lv = towerOn ? 1 : 0;
        G.towerLight.material.opacity = night ? lv * 1.0 + 0.04 : 0;
        G.towerSpark.material.opacity = night ? lv : 0;
        const fireOn = done ? 1 : 0;
        view.fire += (fireOn - view.fire) * Math.min(1, dt * (rm ? 50 : 0.5));
        G.fireGlow.material.opacity = night ? view.fire * (0.75 + (rm ? 0 : 0.15 * Math.sin(t * 3.3))) : 0;
        G.smoke.forEach((m, i) => {
          m.userData.t = (m.userData.t + dt * 0.05) % 1;
          const u = m.userData.t;
          m.position.set(TOWER.x + Math.sin(u * 5 + i) * 3 + u * 22, TOWER.h * 0.6 + u * 70, TOWER.z - u * 6);
          m.scale.setScalar(10 + u * 40);
          m.material.opacity = night ? view.fire * 0.55 * Math.sin(u * Math.PI) : 0;
        });
        // Hermes: walks where the scene needs him, faces his work, holds the mirror up at night
        if (G.hermes) {
          if (!G.hermesGoal) placeHermes(true);
          const a = G.hermesAt, b = G.hermesGoal;
          const dx = b[0] - a[0], dz = b[1] - a[1], dist = Math.hypot(dx, dz);
          const step = Math.min(dist, dt * 1.6);
          let faceTo = G.hermesFace;
          if (dist > 0.02) { a[0] += dx / dist * step; a[1] += dz / dist * step; faceTo = [dx, dz]; }
          G.hermes.position.set(a[0], 0.22, a[1]);
          const want = faceYaw(faceTo[0], faceTo[1]);
          let dy = want - G.hermes.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
          G.hermes.rotation.y += dy * Math.min(1, dt * 6);
          if (G.H && G.H.flame) G.H.flame.getWorldPosition(G.lamp.position); else G.lamp.position.set(a[0], 1.4, a[1]);
          G.lamp.intensity = (night ? 0.7 : 1.3) * (1 - s * 0.7) + (rm ? 0 : Math.sin(t * 11) * 0.06);
          // the signal mirror: a glint in front of him while she holds it, a thread of light toward the tower
          const holding = night && !done && pressAt ? 1 : 0;
          const pulse = view.pulseT ? Math.max(0, 1 - (now - view.pulseT) / 400) : 0;
          const gx = a[0] + 0.25, gy = 1.55, gz = a[1] - 0.5;
          G.glare.position.set(gx, gy, gz);
          G.glare.material.opacity = night && !done ? Math.max(holding, pulse * 0.6) * (0.9 + (rm ? 0 : 0.1 * Math.sin(t * 30))) : 0;
          G.glare.scale.setScalar(1.6 + holding * 1.4);
          const tx = TOWER.x, ty = TOWER.h + 1, tz = TOWER.z;
          const L = Math.hypot(tx - gx, ty - gy, tz - gz);
          G.glareBeam.position.set((gx + tx) / 2, (gy + ty) / 2, (gz + tz) / 2);
          G.glareBeam.lookAt(tx, ty, tz);
          G.glareBeam.scale.set(0.05 + holding * 0.05, 0.05 + holding * 0.05, L);
          G.glareBeam.material.opacity = holding * 0.35 + pulse * 0.15;
        }
        if (G.fx) G.fx.frame(dt, G.camera);
        placeCamera(dt, false);
        if (G.fx) G.fx.render(G.scene, G.camera, dt); else G.renderer.render(G.scene, G.camera);
        if (G.adapt) G.adapt(dt); else if (P.fitSpeed) G.adapt = P.fitSpeed(G.renderer);
        // the clock of the sun, over the scene
        if (el.sun) {
          el.sun.classList.toggle('is-on', dawn.running);
          if (dawn.running && el.sunLabel) {
            const secs = Math.max(0, Math.ceil((dawn.deadline - performance.now()) / 1000));
            const txt = '☀ Ray ' + (dawn.step + 1) + ' of 4 · ' + secs + ' s';
            if (el.sunLabel.textContent !== txt) el.sunLabel.textContent = txt;
            el.sun.classList.toggle('is-late', secs <= 8);
          }
        }
      }
      function frame(t) {
        if (!G || modal.style.display === 'none') return;
        const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
        lastT = t;
        drawFrame(t, dt);
        raf = requestAnimationFrame(frame);
      }
      function fit() {
        if (!G || !el.stage) return;
        const w = el.stage.clientWidth || 800, h = el.stage.clientHeight || 450;
        G.renderer.setSize(w, h, false);
        G.camera.aspect = w / Math.max(1, h);
        G.camera.updateProjectionMatrix();
      }
      // the moments the scene acts out
      function sceneLock(n, last, col) {
        const fire = () => {
          view.lockT = performance.now();
          if (!G || !G.fx) return;
          const [ax, ay] = COURT.altar;
          G.fx.triumph({ x: colX(ax), y: BEAM_Y, z: rowZ(ay) }, last ? 1.2 : 0.6);
          G.fx.shake.add(last ? 0.3 : 0.12);
        };
        if (!G || last || reduced()) { fire(); return; }
        // the scene keeps the caught ray on screen until it has reached the ring, then the lock flares
        if (view.holdFx) view.holdFx();
        view.holdCol = col; view.holdT = performance.now(); view.holdFx = fire;
      }
      function sceneDawnDone() {
        view.rayCol = COURT.entries[COURT.entries.length - 1];
        view.ending = 1; view.opened = 0;
        clearTimeout(view.endTimer);
        // the altar opens in the morning light; then the day goes by, and Hermes waits under the arch for the night
        view.endTimer = setTimeout(() => toNight(), reduced() ? 600 : 5600);
      }
      function toNight() {
        const go = () => { view.ending = 0; view.rayCol = -1; view.sky = 0; if (G) G.skyShown = -1; placeHermes(true); if (G) G.cam.p = null; render(); };
        if (!G || reduced() || !el.fade || modal.style.display === 'none') { go(); return; }
        el.fade.classList.add('is-on');
        setTimeout(() => { go(); subtitle('Night again. Far to the north, through the arch, a light burns on top of Tower II.', 5, 'act'); el.fade.classList.remove('is-on'); }, 700);
      }
      function sceneSpent() {
        view.spentT = performance.now();
        if (G && G.fx) G.fx.blow(null, 0.35);
      }

      // ---- Controls ----
      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden);
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
      if (el.clear) el.clear.addEventListener('click', () => { if (pulses.length) cue('tick', { f: 1300, v: 0.06 }); pulses = []; renderPulses(); });
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
      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('solstice3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('solstice3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-solstice-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
      }
      function focusTarget() { return isDone() ? el.finish : (!isAwake() ? el.keyInput : (dawnDone() ? el.watch : el.dawnBtn)); }
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-solstice-howto-back'), hn = $('btn-solstice-howto-next'), hs = $('btn-solstice-howto-skip');
      if (hb) hb.addEventListener('click', () => { if (howtoPage === 0) hideHowto(); else showHowto(howtoPage - 1); });
      if (hn) hn.addEventListener('click', () => { if (howtoPage >= 3) hideHowto(); else showHowto(howtoPage + 1); });
      if (hs) hs.addEventListener('click', hideHowto);

      let returnFocusTo = null, scrollLockY = 0;
      function lockHubScroll(on) {
        const root = document.documentElement, body = document.body;
        if (!root || !body) return;
        if (on) {
          scrollLockY = window.scrollY || window.pageYOffset || 0;
          root.classList.add('game-open');
          body.style.overflow = 'hidden'; body.style.position = 'fixed'; body.style.top = '-' + scrollLockY + 'px';
          body.style.left = '0'; body.style.right = '0'; body.style.width = '100%';
        } else {
          body.style.overflow = ''; body.style.position = ''; body.style.top = ''; body.style.left = ''; body.style.right = ''; body.style.width = '';
          window.scrollTo(0, scrollLockY || 0);
        }
      }
      function stopHubScroll(e) {
        const panel = el.dispatch && el.dispatch.closest('.chasm3d-panel');
        if (panel && panel.contains(e.target) && (panel.scrollHeight > panel.clientHeight + 1 || panel.parentElement.scrollHeight > panel.parentElement.clientHeight + 1)) return;
        if (el.howto && el.howto.contains(e.target)) return;
        if (e.target === el.canvas) return;
        e.preventDefault();
      }
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
        lockHubScroll(true);
        modal.addEventListener('wheel', stopHubScroll, { passive: false });
        modal.addEventListener('touchmove', stopHubScroll, { passive: false });
        returnFocusTo = document.activeElement;
        if (!G && el.canvas) G = buildWorld();
        bindPointer();
        if (G && !cine && el.stage && P.cinema) {
          cine = P.cinema(el.stage, {
            reduced,
            onShot: (i, sh) => { if (sh.line) subtitle(sh.line, sh.dur - 0.4); if (i === 0) cue('whoosh', { dur: 1.8 }); }
          });
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        // without WebGL the courtyard from above is the game: open it
        if (!G && el.courtBox) el.courtBox.open = true;
        if (G && 'ResizeObserver' in window && !el.stage.__solsticeFit) { el.stage.__solsticeFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        view.snapNext = true; view.ending = 0; view.sigilT = 0; view.rayCol = -1; view.holdCol = -1; view.holdFx = null;
        view.opened = dawnDone() ? 1 : 0;
        view.sky = 0; view.fire = isDone() ? 1 : 0;
        if (G) { G.cam.p = null; G.skyShown = -1; G.hermesGoal = null; }
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I am under the Arch of the Solstice. The courtyard behind it is paved with bronze mirrors and fallen pillars, and the Solar Altar waits on its terrace with a brass ring. From here I can see the dunes where Cairn V stands guard. Open the page “Arch of the Solstice & The Solar Altar”, please: the sigil first.");
        else if (!dawnDone()) say("The mirrors are where you left them. Set them as you think best, and call the dawn when you are ready.");
        else say("Night again. Watch the light on Tower II, and answer it with my mirror.");
        render();
        // The bed starts at its own level when the modal appears; set ours once it has
        setTimeout(setMood, 700);
        const finishOpen = () => {
          if (get(HOWTO_KEY) !== 'seen' && !isDone()) { showHowto(0); return; }
          const target = focusTarget();
          if (target) setTimeout(() => { if (modal.style.display !== 'none') target.focus({ preventScroll: true }); }, 60);
        };
        lastT = 0;
        cancelAnimationFrame(raf);
        if (G) raf = requestAnimationFrame(frame);
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          set(CINE_INTRO, 'seen');
          cine.start(openingShots(), finishOpen);
        } else finishOpen();
      }
      function closeSolsticeModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (dawn.running) { stopDawn(); dawn.locks = 0; dawn.step = 0; feedback(el.dawnFeedback, 'Hermes looked away and the dawn went by.', ''); }
        if (!finale) stopLight();
        cancelPress();
        if (cine && cine.active) cine.skip();
        clearTimeout(view.endTimer);
        if (view.holdFx) { view.holdFx(); view.holdFx = null; }
        view.ending = 0; view.holdCol = -1;
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
        render();
      }
      window.openSolsticeModal = openSolsticeModal;
      window.closeSolsticeModal = closeSolsticeModal;
      if (el.close) el.close.addEventListener('click', closeSolsticeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeSolsticeModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        // the five-seal ceremony over the courtyard answers its own Escape
        const ceremony = $('five-seals-overlay');
        if (ceremony && ceremony.style.display !== 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeSolsticeModal();
      }, true);
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
        setTimeout(() => { if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime(); }, 2100);
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
        send: () => sendSignal(),
        gfx: () => G,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          return {
            gl: true, mirrors: G.mirrors.length, beam: G.beam.filter((b) => b.core.visible).length, rayEnd: G.rayEnd || null,
            locks: G.lockArcs.filter((m) => m.emissiveIntensity > 0.5).length, sky: +view.sky.toFixed(2), night: nightMode(), ending: view.ending,
            tower: +G.towerLight.material.opacity.toFixed(2), fire: +view.fire.toFixed(2), seal: +G.seal.material.opacity.toFixed(2),
            angles: G.mirrors.map((m) => +m.angle.toFixed(2)), post: !!(G.fx && G.fx.post)
          };
        },
        aimAt: (i) => {
          // where a mirror is on the screen, so a test can click it like she would
          if (!G || !G.mirrors[i]) return null;
          const v = new G.T.Vector3(); G.mirrors[i].g.getWorldPosition(v); v.y += BEAM_Y - 0.22;
          v.project(G.camera);
          const r = el.canvas.getBoundingClientRect();
          return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
        },
        toNight: () => { clearTimeout(view.endTimer); toNight(); },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) drawFrame(performance.now() + i * 33, 1 / 30); }
      };

      // A save that answered the last signal but was closed before the light finished speaking: finish it now
      if (!isDone() && dawnDone() && (parseInt(get(KEYS.round) || '0', 10) || 0) >= ROUNDS.length) completeStation();
      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
