
    // =========================================================================
    // STATION 20 · THE GATE OF A THOUSAND MASKS (Tower III, Stage Path · node 40)
    // Part I (journal + hall): Sheet 19B (already printed) draws twelve masks without letters; six are true and six hide a flaw
    // (a tear, a crack, a feather, a crack, an odd eye, a tassel: masks 2, 4, 5, 8, 10, 11 in reading order). In the hall the same
    // twelve hang as plain great masks in the middle of the wall, a letter on each forehead: the true ones spell SILVER, the
    // liars GOLDEN. 'Trust only what is reflected true.' The faces are only on the page, the letters only in the hall.
    // Part II (web only), The Missing Halves: three masks carved on one side only. Silvia draws the other
    // half, as a mirror would show it. The drawing is held to the mirror: it must cover every carved line
    // (coverage) without wandering off them (precision). After three tries the Mirror Speaker shows a guide.
    // Reward: Fragment I of the mirror of Tower III (the Living Mirror of Path III sets it).
    // =========================================================================
    (function initMasksGate() {
      const modal = document.getElementById('modal-masks-gate');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(a && a.sfx && a.sfx(kind, o)); };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const HOWTO_KEY = 'order_masks_howto', CINE_INTRO = 'order_masks_cine_intro';
      let lastScratch = 0;   // the pen's whisper on the glass, at most every 160 ms
      const scratch = () => { const t = performance.now(); if (t - lastScratch >= 160) { lastScratch = t; cue('step'); } };
      const KEYS = {
        awake: 'order_masks_gate_awake',
        done: 'order_masks_gate_completed',
        fails: 'order_masks_key_fails',
        hint: 'order_masks_hint',
        carved: 'order_masks_carved',
        drawFails: 'order_masks_draw_fails',
        drawHint: 'order_masks_draw_hint'
      };
      const WORD = 'SILVER', TRAP = 'GOLDEN';
      // the twelve great masks of the wall, in the order of the page (4 across, 3 down): true ones carry SILVER, liars GOLDEN
      const GREAT = ['S', 'G', 'I', 'O', 'L', 'L', 'V', 'D', 'E', 'E', 'N', 'R'];
      const NODE = 40;

      // ---- The masks: right halves in mask units (x ≥ 0 from the axis, y down from the centre) ----
      const W = 300, H = 380, AX = 150, CY = 196;
      function smooth(pts, n) {
        // Catmull-Rom through the control points, n samples per span
        const out = [], P = [pts[0]].concat(pts, [pts[pts.length - 1]]);
        for (let i = 1; i < P.length - 2; i++) {
          for (let k = 0; k < n; k++) {
            const t = k / n, t2 = t * t, t3 = t2 * t;
            out.push([0, 1].map((j) => 0.5 * (2 * P[i][j] + (-P[i - 1][j] + P[i + 1][j]) * t + (2 * P[i - 1][j] - 5 * P[i][j] + 4 * P[i + 1][j] - P[i + 2][j]) * t2 + (-P[i - 1][j] + 3 * P[i][j] - 3 * P[i + 1][j] + P[i + 2][j]) * t3)));
          }
        }
        out.push(pts[pts.length - 1]);
        return out;
      }
      const almond = (cx, cy, w, h) => {
        const pts = [];
        for (let i = 0; i <= 16; i++) pts.push([cx - w / 2 + w * i / 16, cy - h * 0.62 * Math.sin(Math.PI * i / 16)]);
        for (let i = 1; i <= 16; i++) pts.push([cx + w / 2 - w * i / 16, cy + h * 0.45 * Math.sin(Math.PI * i / 16)]);
        return pts;
      };
      const arc = (x0, x1, y, lift) => Array.from({ length: 15 }, (_, i) => [x0 + (x1 - x0) * i / 14, y - lift * Math.sin(Math.PI * i / 14)]);
      const VOLTO = smooth([[0, -150], [44, -147], [82, -133], [106, -106], [114, -64], [112, -17], [106, 27], [93, 70], [72, 106], [44, 131], [19, 145], [0, 149]], 5);
      const MOON = Array.from({ length: 31 }, (_, i) => [118 * Math.sin(Math.PI * i / 30), -140 * Math.cos(Math.PI * i / 30)]);
      const MASKS = [
        { name: 'the plain mask', strokes: [VOLTO, almond(44, -32, 50, 22), arc(14, 78, -58, 10)] },
        { name: 'the weeping mask', strokes: [VOLTO, almond(44, -32, 50, 22), arc(14, 78, -58, 10),
          [[0, 72], [9, 68], [18, 70], [38, 77]], [[38, 77], [22, 87], [0, 90]],
          [[48, 0], [54, 16], [56, 28], [48, 37], [40, 28], [42, 16], [48, 0]]] },
        { name: 'the feathered mask', strokes: [MOON, almond(42, -30, 48, 22), arc(12, 74, -56, 12),
          [[0, 74], [10, 70], [20, 72], [36, 78]], [[36, 78], [20, 88], [0, 91]],
          [[64, 26], [76, 44], [64, 62], [52, 44], [64, 26]],
          smooth([[58, -134], [74, -156], [96, -168], [124, -170]], 4),
          smooth([[58, -134], [86, -146], [112, -156], [124, -170]], 4)] }
      ];
      const TOL = 15;              // how far from a carved line the mirror forgives (mask units)
      const NEED_COVER = 0.72;     // share of the carved half the drawing must reach
      const NEED_EACH = 0.45;      // ... and of every single line (no missing eye)
      const NEED_PRECISE = 0.7;    // share of the drawing that must lie on a carved line

      const el = {
        close: $('btn-close-masks'), wordCard: $('masks-word-card'), keyInput: $('masks-key-input'), speak: $('btn-masks-speak'),
        keyFeedback: $('masks-key-feedback'), game: $('masks-draw-game'), inner: document.querySelector('#masks-draw-game .monolith-game-inner'),
        canvas: $('masks-canvas'), count: $('masks-draw-count'), lead: $('masks-draw-lead'), undo: $('btn-masks-undo'), clear: $('btn-masks-clear'),
        hold: $('btn-masks-hold'), helpRow: $('masks-help-row'), finish: $('btn-masks-finish'), drawFeedback: $('masks-draw-feedback'),
        hint: $('masks-hint'), victory: $('masks-victory'), victoryText: $('masks-victory-text'), fragment: $('masks-fragment-svg'),
        done: $('btn-masks-finish-station'), dispatch: $('masks-dispatch-text'),
        stage: $('masks3d-stage'), stage3d: $('masks3d-canvas'), subtitle: $('masks3d-subtitle'), fade: $('masks3d-fade'),
        status: $('masks3d-status'), howto: $('masks3d-howto'), help: $('btn-masks-howto'), glass: $('masks3d-glass')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const carved = () => (isDone() ? MASKS.length : Math.max(0, Math.min(MASKS.length, parseInt(get(KEYS.carved) || '0', 10) || 0)));
      const drawFails = () => parseInt(get(KEYS.drawFails) || '0', 10) || 0;
      // Hints climb three levels (hub/js/hint-ladder.js); level 2 is the older help of each part
      const hints = window.EclipseHints;
      const wordHints = hints.define({
        id: 's20-word', station: 'Station 20', title: 'the word of the gate', group: 'stage',
        anchor: el.keyFeedback, solved: isAwake, legacyKey: KEYS.hint,
        texts: [
          'The page gives you the rule, Silvia: some masks are cast in perfect symmetry, others hide a flaw, and you must trust only what is reflected true. In the middle of the wall the same twelve masks hang in the same order as on the page, each with a letter on its forehead.',
          'I wrote down how to catch a mask that lies. It is in Ask Hermes: "How do I find the masks that lie on the page “The Gate of a Thousand Masks”?"',
          'Let us do the first two together. Top left on the page: the laurel crown, both eyes and both sides alike. It is true, so the letter of the first great mask on the wall is the first of the word. The one beside it weeps from one eye only: it lies, so leave its letter out. Go on from the third mask, row by row.'
        ]
      });
      const halfHints = hints.define({
        id: 's20-halves', station: 'Station 20', title: 'the missing halves', group: 'stage',
        anchor: el.drawFeedback, solved: isDone, active: isAwake, legacyKey: KEYS.drawHint,
        texts: [
          'Do not copy the gold half as it is: the mirror turns it round. A curve that bends left on the gold side bends right on yours.',
          'The Mirror Speaker has breathed on the glass: a faint guide shows where the lines go. If your hand will not obey, she can carve the half for you.',
          'Start with the outline alone. Put your finger where the gold edge meets the dotted line at the top and go down on your side, always as far from the line as the gold edge is on its own. Then the eye, at the same height as the gold one. Then the brow.'
        ]
      });
      const guideShown = () => halfHints.level() >= 2;
      let strokes = [];       // Silvia's lines for the current mask, in mask units
      let current = null;     // the line being drawn
      let revealed = false;   // the current mask has just been carved true (shown for a moment)
      let justSet = false;    // Fragment I has just been won and the mirror has not shown it yet
      let revealIdx = -1;     // the mask being shown whole during a reveal (the saved count has already moved on)
      let activePointer = null; // the finger or mouse drawing now, or 'keys' for the keyboard pen
      let pen = null;           // where the keyboard pen stands, in mask units
      const maskIdx = () => Math.min(carved(), MASKS.length - 1);
      const shownIdx = () => (revealed && revealIdx >= 0 ? revealIdx : maskIdx());

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
      const letters = (s) => String(s || '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();

      // ---- Geometry: sample lines every few units, measure distances ----
      function resample(pts, step) {
        const out = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
          const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
          for (let k = 0; k < n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);
        }
        if (pts.length) out.push(pts[pts.length - 1]);
        return out;
      }
      const toCanvas = (sgn) => (p) => [AX + sgn * p[0], CY + p[1]];
      function nearAny(p, pts) {
        for (let i = 0; i < pts.length; i++) if (Math.hypot(pts[i][0] - p[0], pts[i][1] - p[1]) <= TOL) return true;
        return false;
      }
      // How well Silvia's half matches the mirror image of the carved half
      function judge(mask) {
        const drawn = [].concat(...strokes.map((s) => resample(s, 3)));
        if (drawn.length < 4) return { empty: true };
        const targets = mask.strokes.map((s) => resample(s.map(toCanvas(1)), 3));
        const all = [].concat(...targets);
        const each = targets.map((t) => t.filter((p) => nearAny(p, drawn)).length / t.length);
        const cover = all.filter((p) => nearAny(p, drawn)).length / all.length;
        const precise = drawn.filter((p) => nearAny(p, all)).length / drawn.length;
        return { cover, precise, worst: Math.min(...each), ok: cover >= NEED_COVER && precise >= NEED_PRECISE && Math.min(...each) >= NEED_EACH };
      }

      // ---- Drawing ----
      let ctx = null, scale = 1;
      function sizeCanvas() {
        if (!el.canvas) return;
        const r = el.canvas.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.max(1, Math.round((r.width || W) * dpr));
        el.canvas.width = w;
        el.canvas.height = Math.round(w * H / W);
        scale = w / W;
        ctx = el.canvas.getContext('2d');
        draw();
      }
      function path(pts, close) {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        if (close) ctx.closePath();
      }
      function draw() {
        if (!ctx) return;
        const mask = MASKS[shownIdx()];
        const solvedNow = revealed || isDone();
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, W, H);
        // the mirror: a pale glass on the right half
        const g = ctx.createLinearGradient(AX, 0, W, H);
        g.addColorStop(0, 'rgba(216, 180, 254, 0.10)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
        g.addColorStop(1, 'rgba(216, 180, 254, 0.12)');
        ctx.fillStyle = g;
        ctx.fillRect(AX, 0, W - AX, H);
        ctx.strokeStyle = 'rgba(247, 220, 140, 0.55)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1;
        path([[AX, 8], [AX, H - 8]]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // the carved half, in gold
        ctx.strokeStyle = '#f7dc8c';
        ctx.lineWidth = 3;
        mask.strokes.forEach((s) => { path(s.map(toCanvas(-1))); ctx.stroke(); });
        // the guide the Mirror Speaker shows after three tries
        if (guideShown() && !solvedNow) {
          ctx.strokeStyle = 'rgba(233, 213, 255, 0.45)';
          ctx.setLineDash([2, 7]);
          ctx.lineWidth = 2.5;
          mask.strokes.forEach((s) => { path(s.map(toCanvas(1))); ctx.stroke(); });
          ctx.setLineDash([]);
        }
        if (solvedNow) {
          // carved true: the mirror shows the whole face in gold
          ctx.shadowColor = 'rgba(247, 220, 140, 0.8)';
          ctx.shadowBlur = 10;
          ctx.strokeStyle = '#f7dc8c';
          ctx.lineWidth = 3;
          mask.strokes.forEach((s) => { path(s.map(toCanvas(1))); ctx.stroke(); });
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = '#e9e4f5';
          ctx.lineWidth = 3;
          strokes.concat(current ? [current] : []).forEach((s) => {
            if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0][0], s[0][1], 1.5, 0, 2 * Math.PI); ctx.fillStyle = '#e9e4f5'; ctx.fill(); return; }
            path(s); ctx.stroke();
          });
          // the keyboard pen: a ring while it hovers, filled while it draws
          if (pen && document.activeElement === el.canvas) {
            ctx.beginPath();
            ctx.arc(pen[0], pen[1], 5, 0, 2 * Math.PI);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#e9d5ff';
            ctx.stroke();
            if (activePointer === 'keys') { ctx.fillStyle = '#e9d5ff'; ctx.fill(); }
          }
        }
      }
      function pointAt(e) {
        const r = el.canvas.getBoundingClientRect();
        return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
      }
      const canDraw = () => isAwake() && !isDone() && !revealed;
      if (el.canvas) {
        el.canvas.addEventListener('pointerdown', (e) => {
          if (!canDraw() || activePointer !== null) return;   // one finger at a time
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          e.preventDefault();
          activePointer = e.pointerId;
          try { el.canvas.setPointerCapture(e.pointerId); } catch (err) {}
          current = [pointAt(e)];
          cue('tick', { f: 3400, v: 0.05 });
          draw();
        });
        el.canvas.addEventListener('pointermove', (e) => {
          if (!current || e.pointerId !== activePointer) return;
          const p = pointAt(e), last = current[current.length - 1];
          if (Math.hypot(p[0] - last[0], p[1] - last[1]) >= 1.5) { current.push(p); scratch(); draw(); }
        });
        const end = (e) => {
          if (!current || (e && e.pointerId !== activePointer)) return;
          strokes.push(current);
          current = null;
          activePointer = null;
          feedback(el.drawFeedback, '', null);
          render();
        };
        el.canvas.addEventListener('pointerup', end);
        el.canvas.addEventListener('pointercancel', end);

        // The keyboard draws too: the arrows move a pen (two at once for a slant, Shift for small steps) and
        // Space or Enter puts it down on the glass and lifts it. Its lines are judged like a finger's.
        const MOVES = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        const held = new Set();
        el.canvas.addEventListener('keydown', (e) => {
          if (MOVES[e.key]) {
            e.preventDefault();
            if (!canDraw() || (activePointer !== null && activePointer !== 'keys')) return;
            held.add(e.key);
            if (!pen) pen = [AX + 6, 30];
            const step = e.shiftKey ? 1 : 4;
            let dx = 0, dy = 0;
            held.forEach((k) => { dx += MOVES[k][0]; dy += MOVES[k][1]; });
            pen = [Math.max(0, Math.min(W, pen[0] + dx * step)), Math.max(0, Math.min(H, pen[1] + dy * step))];
            if (activePointer === 'keys') { current.push(pen); scratch(); }
            draw();
          } else if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            if (!canDraw()) return;
            if (activePointer === 'keys') { end(); return; }
            if (activePointer !== null) return;
            if (!pen) pen = [AX + 6, 30];
            activePointer = 'keys';
            current = [pen];
            cue('tick', { f: 3400, v: 0.05 });
            draw();
          }
        });
        el.canvas.addEventListener('keyup', (e) => held.delete(e.key));
        el.canvas.addEventListener('focus', draw);
        el.canvas.addEventListener('blur', () => { held.clear(); if (activePointer === 'keys') end(); else draw(); });
      }

      function holdToMirror() {
        if (!canDraw()) return;
        const mask = MASKS[maskIdx()];
        const res = judge(mask);
        if (res.ok) { carveTrue(); return; }
        set(KEYS.drawFails, String(drawFails() + 1));
        if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        let msg;
        if (res.empty) msg = 'The mirror shows nothing yet. Draw the missing half on the glass, to the right of the dotted line.';
        else if (res.precise < NEED_PRECISE) msg = 'The mirror shows lines the carved half does not have. Rub them out and follow the gold more closely.';
        else if (res.worst < NEED_EACH) msg = 'Something is missing: every line of the carved half needs its twin in the glass.';
        else msg = 'Close, but the face does not close yet. Reach a little further along each line.';
        feedback(el.drawFeedback, msg, 'error');
        sceneMiss(res);
        halfHints.fail();
        render();
      }
      function carveTrue() {
        const i = maskIdx(), n = i + 1;
        revealed = true;
        revealIdx = i;
        set(KEYS.drawFails, '0');
        // the mask turns on its nail; the last one also opens the niche (its victory bells come from completeStation)
        cue('groan', { dur: 0.9 });
        if (!(n >= MASKS.length ? cue('thud') : cue('shimmer', { deg: 10 + 3 * i })) && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback(el.drawFeedback, 'The mirror closes the face: ' + MASKS[i].name + ' is whole.', 'ok');
        sceneCarve(i, n >= MASKS.length);
        if (n >= MASKS.length) {
          completeStation();   // saved at once: a reload during the reveal must not strand the station
          setTimeout(() => { revealed = false; revealIdx = -1; render(); }, 1300);
          return;
        }
        set(KEYS.carved, String(n));
        render();
        const lines = [
          "One face whole, Silvia. The mask turned on its nail by itself, all the way round, and stopped facing the corridor. Aurelia says that means 'pass'.",
          "Two. That one wept on both sides, as it should. The candles along the corridor all leaned toward the glass at once, though there is no wind in here."
        ];
        say(lines[i]);
        setTimeout(() => {
          revealed = false;
          revealIdx = -1;
          strokes = [];
          feedback(el.drawFeedback, '', null);
          render();
          if (modal.style.display !== 'none' && el.hold && !el.hold.disabled) el.hold.focus({ preventScroll: true });   // keyboard users keep their place
        }, 1300);
      }
      // From hint level 2, anyone (a keyboard, a shaking hand) may let the Mirror Speaker carve the half
      function letSpeakerCarve() {
        if (!canDraw() || !guideShown()) return;
        strokes = MASKS[maskIdx()].strokes.map((s) => s.map(toCanvas(1)));
        carveTrue();
      }

      function completeStation() {
        set(KEYS.done, 'true');
        set(KEYS.carved, String(MASKS.length));
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        sceneEnd();
        applyVictory();
        render();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        if (modal.style.display !== 'none') {
          justSet = true;   // the mirror is refreshed once the modal closes, so its flash is seen
          if (el.done) setTimeout(() => el.done.focus({ preventScroll: true }), 60);
        } else {
          showMirror();     // the modal was closed during the reveal: show the mirror now
        }
        say("The third mask closed, and the whole wall breathed out, Silvia. Behind the last mask there was a little niche, and in it, wrapped in black velvet, a piece of mirror the size of my hand. Fragment I. There is a moon in it that is not in the sky. And in the glass beside us, for one moment, a woman in a grey gown raised her hand and drew a straight line in the air.");
      }
      function drawFragment() {
        const D = window.STAGE_MIRROR;
        if (!el.fragment || !D || el.fragment.childNodes.length) return;
        const pts = D.shards[0].points;
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        const x0 = Math.min(...xs), y0 = Math.min(...ys), s = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0);
        el.fragment.setAttribute('viewBox', (x0 - 6) + ' ' + (y0 - 6) + ' ' + (s + 12) + ' ' + (s + 12));
        const ns = 'http://www.w3.org/2000/svg';
        const mk = (tag, attrs, parent) => { const n = document.createElementNS(ns, tag); Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k])); (parent || el.fragment).appendChild(n); return n; };
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') + ' Z';
        const defs = mk('defs', {});
        const clip = mk('clipPath', { id: 'masks-frag-clip' }, defs);
        mk('path', { d }, clip);
        const grad = mk('linearGradient', { id: 'masks-frag-glass', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
        mk('stop', { offset: '0', 'stop-color': '#4a2a18' }, grad);
        mk('stop', { offset: '0.6', 'stop-color': '#2a1430' }, grad);
        mk('stop', { offset: '1', 'stop-color': '#120a1c' }, grad);
        mk('path', { d, fill: 'url(#masks-frag-glass)' });
        const lines = mk('g', { 'clip-path': 'url(#masks-frag-clip)', fill: 'none', stroke: '#f6e3b0', 'stroke-width': 2, 'stroke-linecap': 'round' });
        D.facade.forEach((pl) => mk('path', { d: pl.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') }, lines));
        mk('path', { d, fill: 'none', stroke: '#f7dc8c', 'stroke-width': 3 });
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = 'Silvia found the six true masks on the page “The Gate of a Thousand Masks”, read their letters on the wall and spoke their word, SILVER, and the wall of masks opened like a curtain. Inside, she gave three half-carved masks their missing halves, the way a mirror would. Behind the last one waited the first piece of the mirror of Tower III. On the same mask, someone had pinned a note sealed with ash.';
        }
        if (el.keyInput) { el.keyInput.value = WORD; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        drawFragment();
      }

      // ---- Part I: the word from Sheet 19B ----
      function speakWord() {
        if (isAwake()) return;
        const typed = letters(el.keyInput && el.keyInput.value);
        if (!typed) { feedback(el.keyFeedback, 'Type the six letters from the page “The Gate of a Thousand Masks”.', 'error'); return; }
        if (typed !== WORD) {
          set(KEYS.fails, String((parseInt(get(KEYS.fails) || '0', 10) || 0) + 1));
          if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, typed === TRAP
            ? 'GOLDEN... and every mask on the wall smiles at once. Those are the letters of the six that lie, Silvia: trust only what is reflected true.'
            : 'The masks stay still. Look again at the two halves of each mask on the page “The Gate of a Thousand Masks”, then read the letters of the true ones on the wall.', 'error');
          wordHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        sceneWord();
        cue('whoosh', { dur: 1.6 });   // the wall of masks opening like a curtain
        if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = WORD; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'SILVER. The wall of masks opens like a curtain.', 'ok');
        say("SILVER... and the whole wall moved, Silvia, every mask turning on its nail at once, like a theatre full of heads turning to look at us. Then it opened down the middle like a curtain. Inside: a corridor of mirrors, and three masks hanging in it, carved on one side only. The other side is smooth and blank, as if it were waiting. Aurelia says the house wants us to finish them.");
        render();
        if (el.hold) setTimeout(() => el.hold.focus({ preventScroll: true }), 60);
      }

      function render() {
        const awake = isAwake(), done = isDone(), n = carved();
        wordHints.refresh(); halfHints.refresh();
        if (el.count) el.count.textContent = done ? 'All three masks whole' : 'Mask ' + (shownIdx() + 1) + ' of ' + MASKS.length;
        [el.undo, el.clear].forEach((b) => { if (b) b.disabled = !awake || done || revealed || !strokes.length; });
        if (el.hold) el.hold.disabled = !awake || done || revealed;
        if (el.helpRow) el.helpRow.style.display = awake && !done && guideShown() ? '' : 'none';
        if (el.canvas) {
          el.canvas.classList.toggle('is-carved', done);
          const mask = MASKS[shownIdx()];
          el.canvas.setAttribute('aria-label', done
            ? 'Three masks made whole in the mirror.'
            : 'Mask ' + (shownIdx() + 1) + ' of 3, ' + mask.name + ': carved on its left half only, beside a mirror. Draw its right half as the mirror would show it: with a finger, the mouse, or the arrow keys, with Space to put the pen down and lift it. ' + strokes.length + (strokes.length === 1 ? ' line' : ' lines') + ' drawn.');
        }
        if (el.status) el.status.textContent = done ? '✦ The gate is open · Fragment I' : !awake ? 'The gate is shut' : 'Mask ' + (shownIdx() + 1) + ' of 3 · ' + n + ' whole';
        // the pane of glass stands in the scene only while there is a half to draw
        if (el.glass) {
          const hide = !awake || done;
          if (el.glass.hidden !== hide) { el.glass.hidden = hide; if (!hide) sizeCanvas(); }
        }
        if (el.game) el.game.classList.toggle('is-locked', !awake);
        if (el.inner) el.inner.inert = !awake;
        if (el.wordCard) el.wordCard.classList.toggle('is-collapsed', awake);
        if (awake && el.keyFeedback && !el.keyFeedback.textContent) feedback(el.keyFeedback, 'Word spoken: ' + WORD + ' ✓', 'ok');
        if (el.hint) {
          let hint = '';
          if (!done && awake && guideShown()) hint = '✦ Aurelia: fold the page in your mind along the dotted line. Every point of the gold half lands just as far on the other side, at the same height.';
          el.hint.style.display = hint ? '' : 'none';
          el.hint.textContent = hint;
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        draw();
        syncWorld();
        mood();
      }
      // the stage music fills with each mask made whole
      function mood() {
        const amb = window.EclipseAmbience;
        if (amb && amb.intensity) amb.intensity(isDone() ? 0.6 : isAwake() ? 0.35 + 0.08 * carved() : 0.3);
      }

      // ---- The gate of Tower III in 3D. The wall of masks stands at z = 0, facing +z; the corridor of mirrors runs to -z ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const GATE_W = 7.8, GATE_H = 6.4, COR_W = 3.4, COR_H = 4.2, COR_END = -15.2;
      const STATION_Z = [-4, -8, -12];   // where each half-carved mask hangs, before its own mirror
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const ease = (u) => u * u * (3 - 2 * u);
      const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, phase: '', wordT: 0, endT: 0, missT: 0, leanT: 0, turnT: [0, 0, 0], endTimers: [] };
      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden);

      // ---- A mask as a painted face: ivory, gold lines on the carved side, eyes cut through; the blank side smooth ----
      function faceCanvas(mask, sides, o) {
        o = o || {};
        const S = 2, cv = document.createElement('canvas');
        cv.width = W * S; cv.height = H * S;
        const g = cv.getContext('2d');
        g.scale(S, S);
        const outline = mask.strokes[0];
        const shape = outline.map(toCanvas(-1)).concat(outline.slice().reverse().map(toCanvas(1)));
        const trace = (pts, close) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath(); };
        // the face, lit from the upper left like the corridor's candles
        trace(shape, true);
        const gr = g.createRadialGradient(AX - 40, CY - 70, 10, AX, CY, 190);
        gr.addColorStop(0, o.tint || '#fbf6ea'); gr.addColorStop(0.65, o.mid || '#e8dcc4'); gr.addColorStop(1, o.edge || '#b8a582');
        g.fillStyle = gr; g.fill();
        g.save(); trace(shape, true); g.clip();
        if (!sides[1]) {   // the uncarved half: smooth and blank, a little paler, waiting
          g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(AX, 0, W - AX, H);
        }
        g.restore();
        g.lineCap = 'round'; g.lineJoin = 'round';
        [-1, 1].forEach((sgn, k) => {
          if (!sides[k]) return;
          // the eye is cut through the mask
          trace(mask.strokes[1].map(toCanvas(sgn)), true);
          g.fillStyle = '#1a0c10'; g.fill();
          mask.strokes.forEach((s, i) => {
            const pts = s.map(toCanvas(sgn));
            g.strokeStyle = 'rgba(70,40,10,0.55)'; g.lineWidth = 5.5; trace(pts.map((p) => [p[0] + 1, p[1] + 1.5])); g.stroke();
            g.strokeStyle = o.line || '#d9a640'; g.lineWidth = i ? 3.4 : 4.4; trace(pts); g.stroke();
            g.strokeStyle = 'rgba(255,240,190,0.7)'; g.lineWidth = 1.2; trace(pts.map((p) => [p[0] - 0.8, p[1] - 0.8])); g.stroke();
          });
        });
        return cv;
      }
      function maskGeometry(T, w) {
        const h = w * H / W, geo = new T.PlaneGeometry(w, h, 20, 24), p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const u = p.getX(i) / (w / 2), v = p.getY(i) / (h / 2);
          p.setZ(i, w * (0.16 * (1 - u * u) + 0.05 * (1 - v * v)) + w * 0.03 * Math.exp(-((u * 6) ** 2) - ((v + 0.15) * 3) ** 2));   // a brow ridge and a nose down the middle
        }
        geo.computeVertexNormals();
        return geo;
      }

      function buildWorld() {
        const T = window.THREE;
        if (!T || !P || !SC || !el.stage3d) return null;
        let renderer;
        try { renderer = new T.WebGLRenderer({ canvas: el.stage3d, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
        renderer.outputEncoding = T.sRGBEncoding;
        if (T.ReinhardToneMapping) { renderer.toneMapping = T.ReinhardToneMapping; renderer.toneMappingExposure = 1.08; }
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        const scene = new T.Scene();
        scene.background = new T.Color(0x05040c);
        scene.fog = new T.Fog(0x07050e, 12, 34);
        const camera = new T.PerspectiveCamera(50, 16 / 10, 0.05, 300);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const glow = (color, op) => new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op == null ? 0 : op, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        const solid = (geo, mat, x, y, z, parent) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; };
        const flameMap = SC.tex.flame();
        const flame = (x, y, z, s) => { const f = new T.Sprite(new T.SpriteMaterial({ map: flameMap, color: 0xffc070, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })); f.scale.set(0.09 * s, 0.18 * s, 1); f.position.set(x, y, z); scene.add(f); return f; };

        // ---- Night on the plateau: a cold moon, the gate's two braziers ----
        const hemi = new T.HemisphereLight(0x6a72a8, 0x1a0c10, 0.22);
        scene.add(hemi);
        const moon = new T.DirectionalLight(0xaab8ff, 0.45);
        moon.position.set(-6, 12, 10); moon.target.position.set(0, 0, 0);
        moon.castShadow = true; moon.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -3, near: 1, far: 40 });
        moon.shadow.bias = -0.0005;
        scene.add(moon); scene.add(moon.target);
        const stars = new T.BufferGeometry(), sp = [], sr = P.rng(2020);
        for (let i = 0; i < 900; i++) { const u = sr() * Math.PI * 2, v = sr() * 1.2; sp.push(Math.sin(v) * Math.cos(u) * 80, 10 + Math.cos(v) * 60, Math.sin(v) * Math.sin(u) * 80); }
        stars.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
        scene.add(new T.Points(stars, new T.PointsMaterial({ color: 0xe6e8ff, size: 0.3, sizeAttenuation: true, fog: false })));

        // the plateau before the gate, and the stage floor of the corridor
        const sand0 = SC.tex.sand(20), sand = { map: sand0.map.clone(), bump: sand0.bump.clone() };   // the textures are shared: clone before repeating
        [sand.map, sand.bump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(10, 10); });
        const ground = new T.Mesh(new T.PlaneGeometry(60, 40), paint({ map: sand.map, bumpMap: sand.bump, bumpScale: 0.6, color: 0x2e262c }));
        ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 18); ground.receiveShadow = true; scene.add(ground);
        const wood = SC.tex.wood(0x5a3424, 20).clone();
        wood.needsUpdate = true; wood.wrapS = wood.wrapT = T.RepeatWrapping; wood.repeat.set(2, 9);
        const boards = new T.Mesh(new T.PlaneGeometry(COR_W, -COR_END - 0.2), paint({ map: wood, color: 0x4a3028 }));
        boards.rotation.x = -Math.PI / 2; boards.position.set(0, 0.004, (COR_END - 0.4) / 2); boards.receiveShadow = true; scene.add(boards);

        // ---- The arch of the gate: two columns and a curved lintel of pale stone ----
        const stoneMat = paint({ map: SC.tex.strata(20), color: 0x5e5664 }, 0xb8c0ff, 0.12);
        [-1, 1].forEach((sd) => {
          const col = SC.props.column(paint, stoneMat, { height: GATE_H - 0.2, seed: 20 + sd });
          col.position.set(sd * (GATE_W / 2 + 0.45), 0, 0.2); col.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(col);
          // the wall goes on beyond the arch, out of the light
          solid(new T.BoxGeometry(12, GATE_H + 2.2, 1.2), stoneMat, sd * (GATE_W / 2 + 6.9), (GATE_H + 2.2) / 2, -0.4);
        });
        const lintel = solid(new T.TorusGeometry(GATE_W / 2 + 0.45, 0.32, 10, 40, Math.PI), stoneMat, 0, GATE_H - 1.2, 0.2);
        lintel.scale.y = 0.45;
        solid(new T.BoxGeometry(GATE_W + 3, 1.4, 1.2), stoneMat, 0, GATE_H + 0.9, -0.4);
        // two braziers burn before the gate (each has its own fire and light)
        const braziers = [];
        [-1, 1].forEach((sd) => {
          try {
            const b = SC.props.brazier(paint, { intensity: 1.1, range: 8 });
            b.position.set(sd * (GATE_W / 2 + 1.4), 0, 1.4); scene.add(b);
            braziers.push({ b, ph: sd * 2.1 });
          } catch (e) { /* the gate stands in moonlight alone */ }
        });

        // ---- The wall of masks: two halves that part like a curtain; every mask on its own nail ----
        const velvet = paint({ color: 0x1e050c });
        const halves = [-1, 1].map((sd) => {
          const half = new T.Group(); scene.add(half);
          solid(new T.BoxGeometry(GATE_W / 2, GATE_H - 0.2, 0.18), velvet, sd * GATE_W / 4, (GATE_H - 0.2) / 2, -0.12, half);
          return half;
        });
        const gateGeo = maskGeometry(T, 0.5);
        const kinds = [0, 1, 2].map((k) => {
          const tex = new T.CanvasTexture(faceCanvas(MASKS[k], [true, true], { tint: ['#fbf6ea', '#f4ecf8', '#fff1dc'][k] }));
          tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
          return paint({ map: tex, alphaTest: 0.5, side: T.DoubleSide }, 0xd8c8ff, 0.3);
        });
        const slots = [];
        const COLS = 12, ROWS = 9;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const x = -GATE_W / 2 + 0.33 + c * (GATE_W - 0.66) / (COLS - 1), y = 0.62 + r * 0.66;
            if (y > GATE_H - 0.9 - 0.9 * (Math.abs(x) / (GATE_W / 2)) ** 4) continue;   // the arch cuts the top corners
            if (Math.abs(x) < 2.1 && y > 1.6 && y < 5.3) continue;                          // room for the twelve great masks
            slots.push({ x, y, side: x < 0 ? 0 : 1, kind: (r * 5 + c * 3) % 3, delay: (Math.abs(x) * 0.12 + (ROWS - r) * 0.07) * (0.8 + 0.4 * ((r * 7 + c * 13) % 5) / 5), tilt: ((r * 11 + c * 7) % 7 - 3) * 0.03 });
          }
        }
        const inst = [];
        [0, 1].forEach((side) => [0, 1, 2].forEach((k) => {
          const list = slots.filter((s) => s.side === side && s.kind === k);
          if (!list.length) return;
          const m = new T.InstancedMesh(gateGeo, kinds[k], list.length);
          m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
          halves[side].add(m);
          inst.push({ m, list });
        }));
        const dummy = new T.Object3D();
        function poseMasks(turnT) {
          inst.forEach(({ m, list }) => {
            list.forEach((s, i) => {
              const u = turnT == null ? 0 : clamp((turnT - s.delay) / 1.1, 0, 1);
              dummy.position.set(s.x, s.y, 0.04);
              dummy.rotation.set(0, Math.PI * 2 * ease(u), s.tilt);
              dummy.updateMatrix();
              m.setMatrixAt(i, dummy.matrix);
            });
            m.instanceMatrix.needsUpdate = true;
          });
        }
        poseMasks(null);

        // ---- The twelve great masks, in the order of the page: plain faces (the flaws are only on paper), a letter on each brow ----
        const greatGeo = maskGeometry(T, 0.84);
        const great = GREAT.map((ch, i) => {
          const col = i % 4, row = Math.floor(i / 4), x = -1.44 + col * 0.96, y = 4.62 - row * 1.18;
          const cv = faceCanvas(MASKS[0], [true, true], { tint: '#fbf3e2' });
          const g = cv.getContext('2d');
          g.font = '700 84px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = 'rgba(255,248,230,0.9)'; g.fillRect(AX - 38, CY - 142, 76, 84);   // a smooth brow, the letter cut into it
          g.fillStyle = 'rgba(70,30,10,0.5)'; g.fillText(ch, AX + 2, CY - 98 + 3);
          g.fillStyle = '#8a1c12'; g.fillText(ch, AX, CY - 98);
          const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
          const mat = paint({ map: tex, alphaTest: 0.5, side: T.DoubleSide }, 0xffd9a0, 0.28);
          const m = new T.Mesh(greatGeo, mat); m.castShadow = true; m.receiveShadow = true;
          m.position.set(x, y, 0.05);
          halves[x < 0 ? 0 : 1].add(m);
          return { m, mat, x, y, delay: Math.abs(x) * 0.12 + (2 - row) * 0.1, ph: i * 1.7 };
        });
        // two lanterns hang before them; their light flickers on the letters
        const lanterns = [-1, 1].map((sd) => { const l = new T.PointLight(0xffb060, 0.9, 5.5, 1.6); l.position.set(sd * 1.0, 3.5, 1.4); scene.add(l); return l; });
        const poseGreat = (turnT, t) => great.forEach((gm) => {
          const u = turnT == null ? 0 : clamp((turnT - gm.delay) / 1.1, 0, 1);
          gm.m.rotation.y = Math.PI * 2 * ease(u);
          gm.mat.emissiveIntensity = 0.24 + 0.08 * Math.sin(t * 7.3 + gm.ph) * Math.sin(t * 2.9 + gm.ph * 0.5);
        });

        // ---- The corridor of mirrors: tall glass in gilt frames, candles between them ----
        const corridor = new T.Group(); scene.add(corridor);
        const plaster = paint({ color: 0x1a0a12 });
        const zF = -0.7, zB = COR_END - 0.2, cLen = zF - zB, cMid = (zF + zB) / 2;   // the corridor starts behind the curtain
        [-1, 1].forEach((sd) => solid(new T.BoxGeometry(0.2, COR_H, cLen), plaster, sd * (COR_W / 2 + 0.1), COR_H / 2, cMid, corridor));
        solid(new T.BoxGeometry(COR_W + 0.4, 0.2, cLen), paint({ color: 0x0e050a }), 0, COR_H + 0.1, cMid, corridor).castShadow = false;
        // the back of the stage behind the arch: dark wine-red plaster with a corridor-shaped door in it
        const sideW = GATE_W / 2 + 0.9 - COR_W / 2 - 0.2;
        [-1, 1].forEach((sd) => solid(new T.BoxGeometry(sideW, GATE_H + 0.6, 0.3), plaster, sd * (COR_W / 2 + 0.2 + sideW / 2), (GATE_H + 0.6) / 2, -0.55, corridor));
        solid(new T.BoxGeometry(COR_W + 0.4, GATE_H + 0.6 - COR_H, 0.3), plaster, 0, COR_H + (GATE_H + 0.6 - COR_H) / 2, -0.55, corridor);
        const gilt = paint({ color: 0xb8862e, metalness: 0.4, roughness: 0.38, emissive: 0x1a0e02 }, 0xffe0a0, 0.5);
        const glassTex = P.canvasTex(128, 256, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, w, h);
          gr.addColorStop(0, '#3a2c48'); gr.addColorStop(0.42, '#1c1426'); gr.addColorStop(0.5, '#5a4a6a'); gr.addColorStop(0.58, '#1c1426'); gr.addColorStop(1, '#2a1e34');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          const r = P.rng(77);
          for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(200,180,220,' + (r() * 0.05) + ')'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
        });
        const glassMat = new T.MeshStandardMaterial({ color: 0x8a7a9a, map: glassTex, roughness: 0.08, metalness: 0.2, emissive: 0xffffff, emissiveMap: glassTex, emissiveIntensity: 0.22 });
        function mirror(w, h, parent) {
          const g = new T.Group();
          solid(new T.PlaneGeometry(w, h), glassMat, 0, 0, 0, g).castShadow = false;
          [[0, h / 2 + 0.05, w + 0.2, 0.1], [0, -h / 2 - 0.05, w + 0.2, 0.1], [-w / 2 - 0.05, 0, 0.1, h], [w / 2 + 0.05, 0, 0.1, h]].forEach(([x, y, bw, bh]) => solid(new T.BoxGeometry(bw, bh, 0.08), gilt, x, y, 0.02, g));
          const crest = solid(new T.SphereGeometry(0.09, 12, 8), gilt, 0, h / 2 + 0.16, 0.02, g); crest.scale.set(1.6, 1, 0.5);
          (parent || scene).add(g);
          return g;
        }
        const candles = [];
        for (let k = 0; k < 8; k++) {
          const z = -1.4 - k * 1.75;
          [-1, 1].forEach((sd) => {
            const m = mirror(0.95, 2.5, corridor); m.position.set(sd * (COR_W / 2 - 0.01), 1.75, z - 0.85); m.rotation.y = -sd * Math.PI / 2;
            const stand = solid(new T.CylinderGeometry(0.03, 0.08, 1.2, 8), gilt, sd * (COR_W / 2 - 0.3), 0.6, z, corridor);
            stand.castShadow = false;
            solid(new T.CylinderGeometry(0.035, 0.035, 0.16, 10), paint({ color: 0xf2e8d4 }), sd * (COR_W / 2 - 0.3), 1.28, z, corridor);
            candles.push({ f: flame(sd * (COR_W / 2 - 0.3), 1.43, z, 1), sd, z, ph: k * 1.3 + sd });
          });
        }
        const corLights = [0, 1, 2].map(() => { const l = new T.PointLight(0xffb066, 0.7, 6, 1.8); scene.add(l); return l; });

        // ---- The three masks, each hanging on a nail before its own tall mirror, which swings open once the face is whole ----
        const hangGeo = maskGeometry(T, 0.62);
        const stations = STATION_Z.map((z, i) => {
          const frame = new T.Group(); frame.position.set(-0.8, 0, z - 0.25); scene.add(frame);   // the hinge is on the left
          const m = mirror(1.5, 2.9, frame); m.position.set(0.8, 1.6, 0);
          const nail = new T.Group(); nail.position.set(0.8, 2.05, 0.16); frame.add(nail);
          solid(new T.CylinderGeometry(0.004, 0.004, 0.2, 4), paint({ color: 0x2a1a10 }), 0, -0.1, 0, nail).castShadow = false;
          const half = new T.CanvasTexture(faceCanvas(MASKS[i], [true, false])); half.encoding = T.sRGBEncoding; half.anisotropy = 4;
          const whole = new T.CanvasTexture(faceCanvas(MASKS[i], [true, true])); whole.encoding = T.sRGBEncoding; whole.anisotropy = 4;
          const mat = paint({ map: half, alphaTest: 0.5, side: T.DoubleSide }, 0xffe0c0, 0.32);
          const face = new T.Mesh(hangGeo, mat); face.position.y = -0.48; face.castShadow = true; nail.add(face);
          const halo = glow(0xffd890); halo.scale.set(0.95, 1.15, 1); halo.position.set(0, -0.48, -0.05); nail.add(halo);
          return { z, frame, nail, face, mat, half, whole, halo, spin: 0, open: 0 };
        });

        // ---- The end wall: a niche lined with black velvet, and Fragment I in it ----
        solid(new T.BoxGeometry(COR_W + 0.4, COR_H, 0.3), plaster, 0, COR_H / 2, COR_END - 0.15);
        const niche = new T.Group(); niche.position.set(0, 1.45, COR_END + 0.02); scene.add(niche);
        solid(new T.BoxGeometry(0.9, 0.9, 0.06), paint({ color: 0x0a0408 }), 0, 0, 0.0, niche).castShadow = false;
        [[0, 0.5, 1.06, 0.1], [0, -0.5, 1.06, 0.1], [-0.5, 0, 0.1, 1.0], [0.5, 0, 0.1, 1.0]].forEach(([x, y, bw, bh]) => solid(new T.BoxGeometry(bw, bh, 0.12), gilt, x, y, 0.04, niche));
        const D = window.STAGE_MIRROR;
        let shard = null;
        if (D && D.shards && D.shards[0]) {
          const pts = D.shards[0].points, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
          const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, sc = 0.55 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
          const shape = new T.Shape(pts.map((p) => new T.Vector2((p[0] - cx) * sc, -(p[1] - cy) * sc)));
          const shardTex = P.canvasTex(256, 256, (g, w) => {
            const gr = g.createLinearGradient(0, 0, w, w); gr.addColorStop(0, '#4a2a18'); gr.addColorStop(0.6, '#2a1430'); gr.addColorStop(1, '#120a1c');
            g.fillStyle = gr; g.fillRect(0, 0, w, w);
            g.fillStyle = '#f6e3b0'; g.beginPath(); g.arc(w * 0.6, w * 0.38, w * 0.12, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#2a1430'; g.beginPath(); g.arc(w * 0.66, w * 0.34, w * 0.11, 0, Math.PI * 2); g.fill();
          });
          const geo = new T.ShapeGeometry(shape);
          const pos = geo.attributes.position, uv = new Float32Array(pos.count * 2);
          for (let i = 0; i < pos.count; i++) { uv[i * 2] = pos.getX(i) / 0.55 + 0.5; uv[i * 2 + 1] = pos.getY(i) / 0.55 + 0.5; }
          geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
          shard = new T.Mesh(geo, new T.MeshStandardMaterial({ map: shardTex, roughness: 0.1, metalness: 0.3, emissive: 0xffffff, emissiveMap: shardTex, emissiveIntensity: 0.35, side: T.DoubleSide }));
          shard.position.z = 0.06; niche.add(shard);
          const edge = new T.LineLoop(new T.BufferGeometry().setFromPoints(shape.getPoints().map((v) => new T.Vector3(v.x, v.y, 0.002))), new T.LineBasicMaterial({ color: 0xf7dc8c, toneMapped: false }));
          shard.add(edge);
        }
        const shardGlow = glow(0xf7dc8c); shardGlow.scale.set(1.3, 1.3, 1); shardGlow.position.set(0, 0, 0.12); niche.add(shardGlow);
        const shardLight = new T.PointLight(0xffe0a0, 0, 2.6, 1.8); shardLight.position.set(0, 0, 0.6); niche.add(shardLight);

        // ---- The Mirror Speaker: for a moment, in the last mirror of the left wall, a woman in a grey gown and the line she draws ----
        // she is never seen in the room, only in the glass: flattened against the last mirror of the right wall and cut to its frame
        const LAST_MZ = -1.4 - 7 * 1.75 - 0.85;   // the centre of that mirror (see the corridor above)
        renderer.localClippingEnabled = true;
        const inGlass = [new T.Plane(new T.Vector3(0, 0, 1), -(LAST_MZ - 0.475)), new T.Plane(new T.Vector3(0, 0, -1), LAST_MZ + 0.475),
          new T.Plane(new T.Vector3(0, 1, 0), -0.5), new T.Plane(new T.Vector3(0, -1, 0), 3.0)];
        let speaker = null;
        try {
          speaker = SC.chars.oracle(paint, { robe: 0x8a8a94, trim: 0xc8c8d0, mantle: 0x6a6a76, scale: 0.9 });
          speaker.userData.lift(1);
          speaker.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0; o.material.depthWrite = false; o.material.clippingPlanes = inGlass; o.castShadow = false; } });
          speaker.scale.z *= 0.3;
          speaker.position.set(COR_W / 2 - 0.07, 0.5, LAST_MZ); speaker.rotation.y = Math.PI / 2; speaker.visible = false; scene.add(speaker);
        } catch (e) { speaker = null; }
        const signLine = new T.Mesh(new T.BoxGeometry(0.02, 0.02, 0.8), new T.MeshBasicMaterial({ color: 0xe9d5ff, transparent: true, opacity: 0, toneMapped: false }));
        signLine.position.set(COR_W / 2 - 0.1, 2.25, LAST_MZ); scene.add(signLine);

        // ---- Hermes, and Aurelia with the lamp ----
        let HM = null;
        try {
          HM = P.buildHermes(T, glowTex);
          HM.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(HM.hermes);
        } catch (e) { HM = null; }
        let aurelia = null;
        const lampLight = new T.PointLight(0xffc27a, 1.0, 6, 1.6); scene.add(lampLight);
        try {
          aurelia = SC.chars.oracle(paint, { scale: 1.12 });
          aurelia.userData.lift(1);
          aurelia.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          const lamp = new T.Group();
          solid(new T.CylinderGeometry(0.05, 0.07, 0.1, 12), gilt, 0, 0, 0, lamp);
          solid(new T.SphereGeometry(0.06, 12, 8), new T.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0.7 }), 0, 0.09, 0, lamp).castShadow = false;
          const lf = glow(0xffc070, 0.8); lf.scale.set(0.3, 0.3, 1); lf.position.y = 0.09; lamp.add(lf);
          lamp.position.set(0, -0.02, 0.06);
          aurelia.userData.hold.add(lamp);
          aurelia.userData.lampAt = lf;
          scene.add(aurelia);
        } catch (e) { aurelia = null; }

        let fx = null, dust = null;
        try {
          if (window.EclipseFX) {
            fx = window.EclipseFX.kit(renderer, scene, HM, {
              look: { bloom: 0.8, threshold: 0.8, knee: 0.2, vignette: 0.5, grain: 0.035, ca: 0.14, sat: 1.04, contrast: 1.06, gain: [1.02, 0.98, 1.04], shade: 0.32, shadeColor: [0.5, 0.36, 0.62] },
              sandColor: 0x6a5a54, printsOn: false, scale: 1, wind: [0.1, 0, 0], ambient: null, sparkColor: 0xf7dc8c
            });
            dust = window.EclipseFX.particles(scene, { max: lowPower ? 140 : 260, additive: true, wind: [0.02, 0, 0] });
          }
        } catch (e) { fx = null; }

        return { T, renderer, scene, camera, lowPower, halves, poseMasks, poseGreat, great, lanterns, inst, stations, candles, corLights, braziers, niche, shard, shardGlow, shardLight,
          speaker, signLine, H: HM, hermes: HM && HM.hermes, aurelia, lampLight, fx, dust, dustAcc: 0, gateOpen: 0, turning: false,
          hMove: null, aMove: null, spot: null, cam: { yaw: 0, pitch: 0, dist: 1, tYaw: 0, tPitch: 0, tDist: 1, p: null, l: null } };
      }

      // ---- Keeping the scene in step with the game ----
      function shortTurn(a, b) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
      function moveTo(obj, x, z, dur, yaw) {
        if (dur <= 0 || reduced()) { obj.position.x = x; obj.position.z = z; if (yaw != null) obj.rotation.y = yaw; return null; }
        return { fx: obj.position.x, fz: obj.position.z, tx: x, tz: z, t: 0, dur, ry0: obj.rotation.y, ry1: yaw == null ? obj.rotation.y : yaw };
      }
      function stepMv(obj, mv, dt) {
        if (!mv) return null;
        mv.t += dt;
        const u = Math.min(1, mv.t / mv.dur), e = ease(u);
        obj.position.x = mv.fx + (mv.tx - mv.fx) * e;
        obj.position.z = mv.fz + (mv.tz - mv.fz) * e;
        obj.rotation.y = mv.ry0 + shortTurn(mv.ry0, mv.ry1) * Math.min(1, mv.t / Math.min(0.3, mv.dur));
        return u >= 1 ? null : mv;
      }
      // the mask that has just turned keeps the camera (and the two of them) while its mirror swings open
      function camIdx(now) {
        if (!reduced()) for (let i = 2; i >= 0; i--) if (view.turnT[i] && (now || performance.now()) - view.turnT[i] < 3400) return i;
        return shownIdx();
      }
      const turning = (now) => camIdx(now) !== shownIdx() || (isDone() && !reduced() && view.turnT[2] && (now || performance.now()) - view.turnT[2] < 3400);
      const opening = (now) => !!(view.wordT && !reduced() && (now || performance.now()) - view.wordT < 6200);
      // where the two of them stand: before the gate, then before the mask they are working on, then at the niche
      function spots(now) {
        if (!isAwake() || opening(now)) return { h: [1.5, 3.0], a: [-1.4, 3.3] };
        if (isDone() && !revealed && !turning(now)) return { h: [-0.35, COR_END + 2.6], a: [-1.1, COR_END + 1.8] };
        const z = STATION_Z[camIdx(now)];
        return { h: [-1.2, z + 1.05], a: [-0.3, z + 2.2] };
      }
      function steer(snap) {
        if (!G) return;
        const s = spots();
        const key = s.h.join() + '|' + s.a.join();
        if (!snap && G.spot === key) return;
        G.spot = key;
        const go = (obj, [x, z], face) => {
          if (!obj) return null;
          if (snap) { obj.position.set(x, 0.02, z); obj.rotation.y = face; return null; }
          const d = Math.hypot(x - obj.position.x, z - obj.position.z);
          return moveTo(obj, x, z, Math.min(5, d / 1.5), faceYaw(x - obj.position.x, z - obj.position.z));
        };
        G.hMove = go(G.hermes, s.h, 0);
        G.aMove = go(G.aurelia, s.a, 0);
      }
      // what they look at when they stand still: the gate, the mask before them, or the niche
      function lookYaw(obj) {
        const ph = view.phase;
        if (ph === 'mask') return faceYaw(0 - obj.position.x, STATION_Z[camIdx()] - obj.position.z);
        if (ph === 'end') return faceYaw(0 - obj.position.x, COR_END - obj.position.z);
        return 0;
      }
      function syncWorld() {
        if (!G) return;
        const snap = view.snapNext;
        if (snap) {
          G.gateOpen = isAwake() ? 1 : 0;
          G.poseMasks(null);
          G.halves.forEach((h, i) => { h.position.x = (i ? 1 : -1) * G.gateOpen * (GATE_W / 2 + 0.3); });
          G.stations.forEach((st, i) => { st.spin = 0; st.nail.rotation.y = 0; st.open = i < carved() ? 1 : 0; st.frame.rotation.y = st.open * 1.45; });
        }
        // a whole face, or the half still waiting
        G.stations.forEach((st, i) => {
          const whole = isDone() || i < carved() || (revealed && revealIdx === i);
          const want = whole ? st.whole : st.half;
          if (st.mat.map !== want) { st.mat.map = want; st.mat.needsUpdate = true; }
        });
        steer(snap);
        view.snapNext = false;
      }

      // ---- The camera: the wall of masks from the plateau, the gate opening, each mask close beside the glass, the niche ----
      function cameraPhase(now) {
        if (!isAwake()) return 'gate';
        if (opening(now)) return 'open';
        if (isDone() && !revealed && !turning(now)) return 'end';
        return 'mask';
      }
      function shotFor(ph) {
        if (ph === 'gate') return { p: [0.9, 2.2, 11.2], l: [0, 2.9, 0] };
        if (ph === 'open') return { p: [0.3, 2.2, 9.6], l: [0, 2.3, -2] };
        if (ph === 'end') return { p: [0.75, 1.72, COR_END + 5.0], l: [0.2, 1.45, COR_END] };
        // the mask sits left of centre: the pane of glass stands on the right of the picture
        const z = STATION_Z[camIdx()], narrow = el.stage && el.stage.clientWidth < 700;
        return narrow ? { p: [0, 1.7, z + 3.0], l: [0, 1.75, z] } : { p: [1.0, 1.72, z + 3.2], l: [0.62, 1.5, z] };
      }
      function placeCamera(dt, now, snap) {
        const cam = G.camera, c = G.cam;
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else {
          const ph = cameraPhase(now);
          if (ph !== view.phase) { view.phase = ph; c.tYaw = 0; c.tPitch = 0; c.tDist = 1; }
          const k = Math.min(1, dt * 4);
          c.yaw += (c.tYaw - c.yaw) * k; c.pitch += (c.tPitch - c.pitch) * k; c.dist += (c.tDist - c.dist) * k;
          const s = shotFor(ph);
          const ox = s.p[0] - s.l[0], oy = s.p[1] - s.l[1], oz = s.p[2] - s.l[2];
          const d0 = Math.hypot(ox, oy, oz), yaw0 = Math.atan2(ox, oz), pit0 = Math.asin(oy / d0);
          const yaw = yaw0 + c.yaw, pit = clamp(pit0 + c.pitch, -0.5, 1.1), d = d0 * c.dist;
          p = [s.l[0] + Math.sin(yaw) * Math.cos(pit) * d, s.l[1] + Math.sin(pit) * d, s.l[2] + Math.cos(yaw) * Math.cos(pit) * d];
          l = s.l.slice();
        }
        if (!c.p || snap) { c.p = p.slice(); c.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * 1.9);
          for (let i = 0; i < 3; i++) { c.p[i] += (p[i] - c.p[i]) * k; c.l[i] += (l[i] - c.l[i]) * k; }
        }
        cam.position.set(c.p[0], c.p[1], c.p[2]);
        cam.lookAt(c.l[0], c.l[1], c.l[2]);
      }
      function openingShots() {
        return [
          { from: { p: [-6, 6.5, 16], l: [0, 3, 0] }, to: { p: [-2.5, 4.2, 12], l: [0, 3, 0] }, dur: 5.5, kicker: 'STATION 20', title: 'THE GATE OF A THOUSAND MASKS', line: 'Eighteen hours east of Tower II, on a bare plateau, the third tower waits in the dark.' },
          { from: { p: [-3.2, 1.4, 2.4], l: [-1, 2.2, 0] }, to: { p: [2.6, 3.4, 2.2], l: [1, 3.2, 0] }, dur: 5.5, line: 'Its gate is not a door. It is a wall of masks, hundreds of them, all white, all staring.' },
          { from: { p: [2.6, 1.8, 7.5], l: [0, 1.5, 3.6] }, to: { p: [1.8, 1.75, 6.4], l: [0, 1.6, 3.7] }, dur: 5, line: 'Hermes and Aurelia stand before it with one lamp between them.' }
        ];
      }
      function bindPointer() {
        const c = el.stage3d;
        if (!c || c.__masksPointer) return;
        c.__masksPointer = true;
        c.style.touchAction = 'none';
        const pt = { down: false, x: 0, y: 0 };
        c.addEventListener('pointerdown', (e) => { pt.down = true; pt.x = e.clientX; pt.y = e.clientY; try { c.setPointerCapture(e.pointerId); } catch (err) {} });
        c.addEventListener('pointermove', (e) => {
          if (!pt.down || !G) return;
          G.cam.tYaw = clamp(G.cam.tYaw - (e.clientX - pt.x) * 0.003, -0.6, 0.6);
          G.cam.tPitch = clamp(G.cam.tPitch + (e.clientY - pt.y) * 0.003, -0.3, 0.4);
          pt.x = e.clientX; pt.y = e.clientY;
        });
        const up = () => { pt.down = false; };
        c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
        c.addEventListener('wheel', (e) => { if (!G) return; e.preventDefault(); G.cam.tDist = clamp(G.cam.tDist * Math.exp(e.deltaY * 0.0012), 0.6, 1.6); }, { passive: false });
      }

      // ---- The frame ----
      function drawFrame(now, dt) {
        if (!G) return;
        const t = now / 1000, rm = reduced(), done = isDone();
        // the wall: every mask turns once on its nail, then the two halves part like a curtain
        if (view.wordT && !rm) {
          const e = (now - view.wordT) / 1000;
          if (e < 3.4) { G.poseMasks(e); G.poseGreat(e, t); G.turning = true; }
          else if (G.turning) { G.poseMasks(null); G.poseGreat(null, t); G.turning = false; }
          const open = ease(clamp((e - 2.3) / 2.6, 0, 1));
          if (open > G.gateOpen) {
            G.gateOpen = open;
            if (G.fx && open < 1) { G.fx.shake.add(0.012); if (Math.random() < dt * 10) G.fx.puff({ x: (Math.random() - 0.5) * 2, y: 0.1, z: 0.3 }, 2, { color: 0x8a7a70, alpha: 0.25, size: [0.2, 0.4], up: [0.1, 0.4] }); }
          }
        } else if (isAwake()) G.gateOpen = 1;
        if (!G.turning) G.poseGreat(null, rm ? 0 : t);
        G.lanterns.forEach((l, i) => { l.intensity = (1 - G.gateOpen) * (rm ? 0.9 : 0.8 + 0.25 * Math.sin(t * 9.1 + i * 2) * Math.sin(t * 3.7 + i)); });
        G.halves.forEach((h, i) => { h.position.x = (i ? 1 : -1) * G.gateOpen * (GATE_W / 2 + 0.3); });
        // each mask made whole turns on its nail, and then its mirror swings open on the hinge
        G.stations.forEach((st, i) => {
          const tt = view.turnT[i];
          if (tt && !rm) {
            const e = (now - tt) / 1000;
            st.nail.rotation.y = Math.PI * 2 * ease(clamp(e / 1.2, 0, 1));
            st.halo.material.opacity = Math.max(0, 0.32 * Math.sin(clamp(e / 1.6, 0, 1) * Math.PI));
            st.open = Math.max(st.open, i < carved() || done ? ease(clamp((e - 1.0) / 1.6, 0, 1)) : 0);
          } else {
            st.halo.material.opacity = 0;
            if (i < carved() || done) st.open = 1;
          }
          st.frame.rotation.y = st.open * 1.45;
          // a failed try: the glass of the current mirror shivers
          if (!done && i === shownIdx() && view.missT && !rm) {
            const m = (now - view.missT) / 1000;
            st.frame.position.x = -0.8 + (m < 0.5 ? Math.sin(m * 60) * 0.01 * (1 - m / 0.5) : 0);
          }
        });
        // the two of them walk, and look at the mask (or at each other at the gate)
        steer(false);
        if (G.hermes) {
          if (G.hMove) G.hMove = stepMv(G.hermes, G.hMove, dt);
          else G.hermes.rotation.y += shortTurn(G.hermes.rotation.y, lookYaw(G.hermes)) * Math.min(1, dt * 4);
          G.hermes.position.y = 0.02;
        }
        if (G.aurelia) {
          if (G.aMove) G.aMove = stepMv(G.aurelia, G.aMove, dt);
          else G.aurelia.rotation.y += shortTurn(G.aurelia.rotation.y, lookYaw(G.aurelia)) * Math.min(1, dt * 4);
          G.aurelia.position.y = 0.02;
          if (G.aurelia.userData.update) G.aurelia.userData.update(t);
          if (G.aurelia.userData.lampAt) G.aurelia.userData.lampAt.getWorldPosition(G.lampLight.position);
          G.lampLight.intensity = 1.0 + (rm ? 0 : Math.sin(t * 9) * 0.06 + Math.sin(t * 23) * 0.03);
        }
        // the candles: they breathe; after the second mask they all lean toward the glass at once
        const lean = view.leanT && !rm ? Math.max(0, Math.sin(clamp((now - view.leanT) / 3500, 0, 1) * Math.PI)) : 0;
        G.candles.forEach((c) => {
          const fl = rm ? 1 : 1 + Math.sin(t * 9 + c.ph) * 0.08 + Math.sin(t * 21 + c.ph) * 0.04;
          c.f.scale.set(0.09 * (2 - fl), 0.18 * fl * (1 + 0.3 * lean), 1);
          c.f.material.rotation = c.sd * 0.6 * lean;
        });
        const zc = view.phase === 'end' ? COR_END + 2 : view.phase === 'mask' ? STATION_Z[camIdx(now)] : -1.4;
        G.corLights.forEach((l, i) => {
          l.position.set(i === 2 ? 0 : (i ? 1 : -1) * (COR_W / 2 - 0.35), i === 2 ? 3.4 : 1.6, zc + (i === 2 ? -0.6 : 0.9));
          l.intensity = (view.phase === 'gate' ? 0.2 : 0.7) * (rm ? 1 : 1 + Math.sin(t * 8 + i) * 0.06);
        });
        G.braziers.forEach((br) => { if (br.b.userData.update) br.b.userData.update(rm ? 0 : t, br.ph, 1); });
        // the end: the niche shines, and a woman in grey stands for a moment in the last mirror and draws a line in the air
        const e = view.endT ? (now - view.endT) / 1000 : (done ? 99 : -1);
        const shine = done ? (rm ? 1 : clamp((e - 2.5) / 1.6, 0, 1)) : 0;
        if (G.shard) G.shard.rotation.y = rm ? 0 : Math.sin(t * 0.8) * 0.25 * shine;
        G.shardGlow.material.opacity = 0.55 * shine * (rm ? 1 : 0.85 + 0.15 * Math.sin(t * 2.2));
        G.shardLight.intensity = 0.8 * shine;
        const ghost = view.endT && !rm ? Math.max(0, Math.min(1, (e - 5) / 1.2, (12.5 - e) / 1.5)) : 0;
        if (G.speaker) {
          G.speaker.visible = ghost > 0.01;
          if (G.speaker.visible) {
            G.speaker.traverse((o) => { if (o.isMesh) o.material.opacity = (o.userData.base == null ? (o.userData.base = 1) : o.userData.base) * 0.42 * ghost; });
            if (G.speaker.userData.update) G.speaker.userData.update(t);
          }
        }
        const line = done ? (view.endT && !rm ? clamp((e - 6.8) / 1.4, 0, 1) : 1) : 0;
        G.signLine.scale.z = Math.max(0.001, ease(line));
        G.signLine.material.opacity = 0.9 * line * (view.endT && !rm ? Math.max(0.25, Math.min(1, (14 - e) / 2)) : 0.25);
        // dust in the lamplight
        if (G.dust && !rm) {
          G.dustAcc += dt * (G.lowPower ? 5 : 10);
          const n = Math.floor(G.dustAcc); G.dustAcc -= n;
          for (let i = 0; i < n; i++) {
            G.dust.emit({ x: (Math.random() - 0.5) * 2.8, y: 0.3 + Math.random() * 3, z: zc + (Math.random() - 0.3) * 4 }, 1, { color: 0xffd8a8, size: [0.015, 0.04], speed: [0, 0.04], up: [-0.02, 0.04], gravity: 0, drag: 0.2, life: [3, 6], alpha: 0.4, fadeIn: 0.4, spread: 0.1 });
          }
        }
        if (G.fx) G.fx.frame(dt, G.camera);
        if (G.dust) G.dust.update(dt, G.camera, G.renderer);
        placeCamera(dt, now, false);
        if (G.fx) G.fx.render(G.scene, G.camera, dt); else G.renderer.render(G.scene, G.camera);
        if (G.adapt) G.adapt(dt); else if (P.fitSpeed) G.adapt = P.fitSpeed(G.renderer);
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

      // ---- The moments the scene acts out ----
      const react = (kind) => { if (G && G.fx && G.fx.gait) G.fx.gait.react(kind); };
      const aureliaDoes = (kind) => { if (G && G.aurelia && G.aurelia.userData.react) G.aurelia.userData.react(kind); };
      function sceneWord() {
        view.wordT = performance.now();
        react('wonder');
        // the glass she draws on comes once the curtain has parted
        if (el.glass && !reduced()) { el.glass.classList.add('is-arriving'); setTimeout(() => el.glass.classList.remove('is-arriving'), 6400); }
        subtitle('Every mask on the wall turns on its nail at once, like a theatre full of heads turning to look at them. Then the wall parts down the middle, like a curtain.', 6, 'act');
      }
      function sceneMiss(res) {
        view.missT = performance.now();
        react('worry');
        subtitle(res && res.empty ? 'The glass stays empty. Aurelia raises the lamp a little higher.' : 'The mirror shivers, and shows nothing it can close.', 3.2, 'act');
      }
      function sceneCarve(i, last) {
        view.turnT[i] = performance.now();
        if (i === 1) view.leanT = performance.now() + 900;
        aureliaDoes('nod');
        react('wonder');
        if (G && G.fx) {
          const p = new G.T.Vector3(); G.stations[i].face.getWorldPosition(p);
          G.fx.triumph({ x: p.x, y: p.y, z: p.z }, last ? 0.8 : 0.45);
        }
        const lines = [
          'The mask turns on its nail, all the way round, and stops. Its mirror swings open like a door.',
          'The weeping mask turns, and weeps on both sides now. Down the corridor every candle leans toward the glass.',
          'The last mask turns, and the last mirror opens on a little niche lined with black velvet.'
        ];
        subtitle(lines[i], 4.6, 'act');
      }
      function sceneEnd() {
        view.endT = performance.now();
        view.endTimers.forEach(clearTimeout);
        view.endTimers = [
          setTimeout(() => { if (modal.style.display !== 'none') subtitle('In the niche, wrapped in velvet: a piece of mirror the size of a hand. Fragment I. There is a moon in it that is not in the sky.', 5.5, 'act'); }, reduced() ? 100 : 4400),
          setTimeout(() => { if (modal.style.display !== 'none') subtitle('And in the glass beside them, for one moment, a woman in a grey gown raises her hand and draws a straight line in the air.', 6, 'act'); }, reduced() ? 6000 : 9800)
        ];
      }

      // ---- Controls ----
      if (el.speak) el.speak.addEventListener('click', speakWord);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakWord(); });
      if (el.undo) el.undo.addEventListener('click', () => { strokes.pop(); cue('tick', { f: 1800, v: 0.06 }); feedback(el.drawFeedback, '', null); render(); });
      if (el.clear) el.clear.addEventListener('click', () => { strokes = []; cue('paper'); feedback(el.drawFeedback, '', null); render(); });
      if (el.hold) el.hold.addEventListener('click', holdToMirror);
      if (el.finish) el.finish.addEventListener('click', letSpeakerCarve);

      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('masks3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('masks3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-masks-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
      }
      function focusTarget() {
        if (isDone()) return el.done;
        if (!isAwake()) return el.keyInput;
        return el.hold;
      }
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-masks-howto-back'), hn = $('btn-masks-howto-next'), hs = $('btn-masks-howto-skip');
      if (hb) hb.addEventListener('click', () => { if (howtoPage === 0) hideHowto(); else showHowto(howtoPage - 1); });
      if (hn) hn.addEventListener('click', () => { if (howtoPage >= 3) hideHowto(); else showHowto(howtoPage + 1); });
      if (hs) hs.addEventListener('click', hideHowto);

      // ---- Open / close ----
      const marchOver = () => typeof window.isMasksMarchOver === 'function' && window.isMasksMarchOver();
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        return get('order_oracle_horizon_completed') === 'true' && marchOver();
      }
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
        if (e.target === el.stage3d) return;
        e.preventDefault();   // the glass too: a finger drawing on it must never scroll the hub behind
      }
      function openMasksModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          const eta = typeof window.getMasksMarchEta === 'function' ? window.getMasksMarchEta() : '';
          if (get('order_oracle_horizon_completed') !== 'true') toast('✦ THE CURTAIN IS DOWN ✦ The Stage Path opens after the audience with the Oracle (Station 19).');
          else if (eta) toast('Hermes and Aurelia are crossing the plateau toward the third tower. Arrival in ' + eta + '. Keep the page “The Gate of a Thousand Masks” close.');
          else toast('Hermes and Aurelia will leave Tower II once you answer him on the wire: eighteen hours east to the third tower.');
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        lockHubScroll(true);
        modal.addEventListener('wheel', stopHubScroll, { passive: false });
        modal.addEventListener('touchmove', stopHubScroll, { passive: false });
        returnFocusTo = document.activeElement;
        if (!G && el.stage3d) G = buildWorld();
        bindPointer();
        if (G && !cine && el.stage && P.cinema) {
          cine = P.cinema(el.stage, {
            reduced,
            onShot: (i, sh) => { if (sh.line) subtitle(sh.line, sh.dur - 0.4); if (i === 0) cue('whoosh', { dur: 1.8 }); }
          });
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        if (G && 'ResizeObserver' in window && !el.stage.__masksFit) { el.stage.__masksFit = true; new ResizeObserver(fit).observe(el.stage); }
        if (el.glass && 'ResizeObserver' in window && !el.glass.__masksFit) {
          el.glass.__masksFit = true;
          new ResizeObserver(() => { if (modal.style.display !== 'none' && !el.glass.hidden) sizeCanvas(); }).observe(el.glass);
        }
        fit();
        view.snapNext = true; view.wordT = 0; view.endT = 0; view.missT = 0; view.leanT = 0; view.turnT = [0, 0, 0]; view.phase = '';
        if (el.glass) el.glass.classList.remove('is-arriving');
        if (G) { G.cam.p = null; G.spot = null; G.hMove = null; G.aMove = null; }
        if (el.fade) el.fade.classList.remove('is-on');
        if (isDone()) { applyVictory(); say("We sleep tonight behind the gate, Silvia, in the dressing rooms, on piles of old costumes. The masks have all turned back to face the corridor. Every one of them is smiling now."); }
        else if (!isAwake()) say("Silvia, we are at the gate of Tower III. It is not a door: it is a wall of masks, hundreds of them, from the ground to the top of the arch, all white, all staring. Aurelia says the old charts of the Sanctuary call it the Gate of a Thousand Masks. Six of these lie, she says, and the letter knew it. In the middle of the wall twelve great masks carry a letter each on the forehead. Find their page in your journal, please.");
        else say("The three masks are waiting, Silvia, each carved on one side only. Give each its other half. Aurelia is holding the lamp.");
        render();
        sizeCanvas();
        setTimeout(mood, 700);   // the bed starts on its next poll (600 ms) and resets the intensity to 0.5
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
      function closeMasksModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        current = null;
        if (cine && cine.active) cine.skip();
        view.endTimers.forEach(clearTimeout); view.endTimers = [];
        if (el.fade) el.fade.classList.remove('is-on');
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
        if (justSet) { justSet = false; showMirror(); }
      }
      // Path III on the Quest Map, with Fragment I flashing into its place
      function showMirror() {
        if (document.documentElement.dataset.mapPath !== 'stage' && typeof window.switchMapPath === 'function') window.switchMapPath('stage', true);
        else if (window.StageMirror && typeof window.StageMirror.refresh === 'function') window.StageMirror.refresh();
        const wrap = document.getElementById('stage-map-canvas-wrap');
        if (wrap && wrap.offsetParent) setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }), 260);
      }
      function finishStation() {
        justSet = true;
        closeMasksModal();
      }
      window.openMasksModal = openMasksModal;
      window.closeMasksModal = closeMasksModal;
      window.STAGE_OPENERS = window.STAGE_OPENERS || {};
      window.STAGE_OPENERS[NODE] = openMasksModal;
      if (el.close) el.close.addEventListener('click', closeMasksModal);
      if (el.done) el.done.addEventListener('click', finishStation);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeMasksModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeMasksModal();
      }, true);
      window.addEventListener('resize', () => { if (modal.style.display !== 'none') sizeCanvas(); });

      // ---- The card of the room on the Quest Map ----
      window.STAGE_CARDS = window.STAGE_CARDS || {};
      window.STAGE_CARDS[NODE] = () => {
        const thumb = './assets/thumbnails/masks_gate_preview.webp';
        if (isDone()) {
          return {
            badge: 'STATION 20 // FRAGMENT I',
            status: 'THE GATE OPENED ✓',
            statusClass: 'status-done-badge',
            title: 'The Gate of a Thousand Masks · Tower III',
            thumb,
            lore: 'Silvia found the six masks that tell the truth and spoke their word, and the wall of masks opened like a curtain. She gave three half-carved masks their missing halves, the way a mirror would, and the first piece of the mirror of Tower III was hers.',
            rewards: [
              { icon: '🪞', label: 'Fragment I', desc: 'Set in the mirror of Tower III' },
              { icon: '✉️', label: 'A Note Sealed in Ash', desc: 'Pinned on the last mask' }
            ],
            btnText: 'Revisit the Gate ➔',
            action: openMasksModal,
            hideReturnBtn: true
          };
        }
        const eta = typeof window.getMasksMarchEta === 'function' ? window.getMasksMarchEta() : '';
        const arrived = marchOver() || (typeof window.isAdminTester === 'function' && window.isAdminTester());
        return {
          badge: 'STATION 20 // STAGE PATH',
          status: arrived ? 'AT THE GATE OF TOWER III ✦' : (eta ? 'CROSSING THE PLATEAU ✦' : 'AT TOWER II, READY TO LEAVE ✦'),
          statusClass: 'status-live-badge',
          title: 'The Gate of a Thousand Masks · Tower III',
          thumb,
          lore: arrived
            ? 'The gate of Tower III is a wall of masks, and six of them lie. Solve the page of the same name in your journal and speak the word of the gate. Inside, three masks wait to be made whole.'
            : (eta
              ? 'Hermes and Aurelia are walking east across the plateau, after the raiders\' ruts. Arrival at the third tower in ' + eta + '. Keep its page in your journal close.'
              : 'Hermes and Aurelia will leave Tower II once you answer him on the wire: eighteen hours east to the third tower. Begin with the page “The Unsent Letter”.'),
          rewards: [
            { icon: '🎭', label: 'The Word of the Gate', desc: 'Your journal · twelve masks, six that lie' },
            { icon: '✍️', label: 'The Missing Halves', desc: 'A second trial, at the mirror' },
            { icon: '🪞', label: 'Fragment I', desc: 'One ninth of the mirror of Tower III' }
          ],
          btnText: arrived ? '✦ SPEAK AT THE GATE ➔' : 'Hermes is on his way',
          btnDisabled: !arrived,
          action: openMasksModal,
          hideReturnBtn: true
        };
      };

      // For the smoke tests: the state of the drawing, and a perfect or a wrong drawing on demand
      window.__masks = {
        carved, strokes: () => strokes.length,
        targets: () => MASKS[maskIdx()].strokes.map((s) => s.map(toCanvas(1))),
        size: [W, H],
        pen: () => pen,
        drawTrue: () => { strokes = MASKS[maskIdx()].strokes.map((s) => s.map(toCanvas(1))); render(); },
        setStrokes: (list) => { strokes = list; render(); },
        drawHalf: () => { strokes = [MASKS[maskIdx()].strokes[0].map(toCanvas(1))]; render(); },
        drawWrong: () => { strokes = MASKS[maskIdx()].strokes.map((s) => s.map(toCanvas(-1))); render(); },
        judge: () => judge(MASKS[maskIdx()]),
        gfx: () => G,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          return {
            gl: true, phase: view.phase, hermes: G.hermes ? [+G.hermes.position.x.toFixed(2), +G.hermes.position.z.toFixed(2)] : null,
            gate: +G.gateOpen.toFixed(2), open: G.stations.map((st) => +st.open.toFixed(2)),
            whole: G.stations.filter((st) => st.mat.map === st.whole).length, shard: +G.shardLight.intensity.toFixed(2),
            glass: el.glass ? !el.glass.hidden : null, post: !!(G.fx && G.fx.post)
          };
        },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) drawFrame(performance.now() + i * 33, 1 / 30); },
        settle: () => { view.wordT = 0; view.endT = 0; view.turnT = [0, 0, 0]; view.snapNext = true; syncWorld(); }
      };
    })();
