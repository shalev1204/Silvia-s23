
    // =========================================================================
    // STATION 20 · THE GATE OF A THOUSAND MASKS (Tower III, Stage Path · node 40)
    // Part I (journal): six of the twelve masks of Sheet 19B lie; their forehead letters spell SILVER.
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
      const KEYS = {
        awake: 'order_masks_gate_awake',
        done: 'order_masks_gate_completed',
        fails: 'order_masks_key_fails',
        hint: 'order_masks_hint',
        carved: 'order_masks_carved',
        drawFails: 'order_masks_draw_fails',
        drawHint: 'order_masks_draw_hint'
      };
      const WORD = 'SILVER';
      const HINT_AFTER_FAILS = 3;
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
        tWord: $('masks-telem-word'), tMasks: $('masks-telem-masks'), tFragment: $('masks-telem-fragment')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const carved = () => (isDone() ? MASKS.length : Math.max(0, Math.min(MASKS.length, parseInt(get(KEYS.carved) || '0', 10) || 0)));
      const drawFails = () => parseInt(get(KEYS.drawFails) || '0', 10) || 0;
      const guideShown = () => drawFails() >= HINT_AFTER_FAILS;
      let strokes = [];       // Silvia's lines for the current mask, in mask units
      let current = null;     // the line being drawn
      let revealed = false;   // the current mask has just been carved true (shown for a moment)
      let justSet = false;    // Fragment I has just been won and the mirror has not shown it yet
      let revealIdx = -1;     // the mask being shown whole during a reveal (the saved count has already moved on)
      let activePointer = null;
      const maskIdx = () => Math.min(carved(), MASKS.length - 1);
      const shownIdx = () => (revealed && revealIdx >= 0 ? revealIdx : maskIdx());

      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
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
          draw();
        });
        el.canvas.addEventListener('pointermove', (e) => {
          if (!current || e.pointerId !== activePointer) return;
          const p = pointAt(e), last = current[current.length - 1];
          if (Math.hypot(p[0] - last[0], p[1] - last[1]) >= 1.5) { current.push(p); draw(); }
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
      }

      function holdToMirror() {
        if (!canDraw()) return;
        const mask = MASKS[maskIdx()];
        const res = judge(mask);
        if (res.ok) { carveTrue(); return; }
        const fails = drawFails() + 1;
        set(KEYS.drawFails, String(fails));
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        let msg;
        if (res.empty) msg = 'The mirror shows nothing yet. Draw the missing half on the glass, to the right of the dotted line.';
        else if (res.precise < NEED_PRECISE) msg = 'The mirror shows lines the carved half does not have. Rub them out and follow the gold more closely.';
        else if (res.worst < NEED_EACH) msg = 'Something is missing: every line of the carved half needs its twin in the glass.';
        else msg = 'Close, but the face does not close yet. Reach a little further along each line.';
        if (fails === HINT_AFTER_FAILS) {
          set(KEYS.drawHint, 'true');
          msg += ' The Mirror Speaker has breathed on the glass: a faint guide shows where the lines go.';
        }
        feedback(el.drawFeedback, msg, 'error');
        render();
      }
      function carveTrue() {
        const i = maskIdx(), n = i + 1;
        revealed = true;
        revealIdx = i;
        set(KEYS.drawFails, '0');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback(el.drawFeedback, 'The mirror closes the face: ' + MASKS[i].name + ' is whole.', 'ok');
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
          if (modal.style.display !== 'none' && el.hold && !el.hold.disabled) el.hold.focus();   // keyboard users keep their place
        }, 1300);
      }
      // After three tries, anyone (a keyboard, a shaking hand) may let the Mirror Speaker carve the half
      function letSpeakerCarve() {
        if (!canDraw() || !guideShown()) return;
        strokes = MASKS[maskIdx()].strokes.map((s) => s.map(toCanvas(1)));
        carveTrue();
      }

      function completeStation() {
        set(KEYS.done, 'true');
        set(KEYS.carved, String(MASKS.length));
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        applyVictory();
        render();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        if (modal.style.display !== 'none') {
          justSet = true;   // the mirror is refreshed once the modal closes, so its flash is seen
          if (el.done) setTimeout(() => el.done.focus(), 60);
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
          el.victoryText.textContent = 'Silvia found the six masks that lie on Sheet 19B and spoke their word, SILVER, and the wall of masks opened like a curtain. Inside, she gave three half-carved masks their missing halves, the way a mirror would. Behind the last one waited the first piece of the mirror of Tower III. On the same mask, someone had pinned a note sealed with ash.';
        }
        if (el.keyInput) { el.keyInput.value = WORD; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        drawFragment();
      }

      // ---- Part I: the word from Sheet 19B ----
      function speakWord() {
        if (isAwake()) return;
        const typed = letters(el.keyInput && el.keyInput.value);
        if (!typed) { feedback(el.keyFeedback, 'Type the six letters from Sheet 19B.', 'error'); return; }
        if (typed !== WORD) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          if (fails >= HINT_AFTER_FAILS && get(KEYS.hint) !== 'true') {
            set(KEYS.hint, 'true');
            feedback(el.keyFeedback, 'The masks stay still. Hermes left you a note in Ask Hermes about the masks that lie.', 'error');
          } else {
            feedback(el.keyFeedback, 'The masks stay still. Look again at the two halves of each mask on Sheet 19B.', 'error');
          }
          return;
        }
        set(KEYS.awake, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = WORD; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'SILVER. The wall of masks opens like a curtain.', 'ok');
        say("SILVER... and the whole wall moved, Silvia, every mask turning on its nail at once, like a theatre full of heads turning to look at us. Then it opened down the middle like a curtain. Inside: a corridor of mirrors, and three masks hanging in it, carved on one side only. The other side is smooth and blank, as if it were waiting. Aurelia says the house wants us to finish them.");
        render();
        if (el.hold) setTimeout(() => el.hold.focus(), 60);
      }

      function render() {
        const awake = isAwake(), done = isDone(), n = carved();
        if (el.count) el.count.textContent = done ? 'All three masks whole' : 'Mask ' + (shownIdx() + 1) + ' of ' + MASKS.length;
        [el.undo, el.clear].forEach((b) => { if (b) b.disabled = !awake || done || revealed || !strokes.length; });
        if (el.hold) el.hold.disabled = !awake || done || revealed;
        if (el.helpRow) el.helpRow.style.display = awake && !done && guideShown() ? '' : 'none';
        if (el.canvas) {
          el.canvas.classList.toggle('is-carved', done);
          const mask = MASKS[shownIdx()];
          el.canvas.setAttribute('aria-label', done
            ? 'Three masks made whole in the mirror.'
            : 'Mask ' + (shownIdx() + 1) + ' of 3, ' + mask.name + ': carved on its left half only, beside a mirror. Draw its right half as the mirror would show it. ' + strokes.length + (strokes.length === 1 ? ' line' : ' lines') + ' drawn.');
        }
        if (el.tWord) el.tWord.textContent = awake ? WORD + ' ✓' : '[ 6 LETTERS ]';
        if (el.tMasks) el.tMasks.textContent = done ? '3 / 3 ✓' : '[ ' + n + ' / 3 ]';
        if (el.tFragment) el.tFragment.textContent = done ? 'SET ✓' : '[ MISSING ]';
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
      }

      // ---- Controls ----
      if (el.speak) el.speak.addEventListener('click', speakWord);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakWord(); });
      if (el.undo) el.undo.addEventListener('click', () => { strokes.pop(); feedback(el.drawFeedback, '', null); render(); });
      if (el.clear) el.clear.addEventListener('click', () => { strokes = []; feedback(el.drawFeedback, '', null); render(); });
      if (el.hold) el.hold.addEventListener('click', holdToMirror);
      if (el.finish) el.finish.addEventListener('click', letSpeakerCarve);

      // ---- Open / close ----
      const marchOver = () => typeof window.isMasksMarchOver === 'function' && window.isMasksMarchOver();
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        return get('order_oracle_horizon_completed') === 'true' && marchOver();
      }
      let returnFocusTo = null;
      function openMasksModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          const eta = typeof window.getMasksMarchEta === 'function' ? window.getMasksMarchEta() : '';
          if (get('order_oracle_horizon_completed') !== 'true') toast('✦ THE CURTAIN IS DOWN ✦ The Stage Path opens after the audience with the Oracle (Station 19).');
          else if (eta) toast('Hermes and Aurelia are crossing the plateau toward the third tower. Arrival in ' + eta + '. Keep Sheet 19B close.');
          else toast('Hermes and Aurelia will leave Tower II once you answer him on the wire: eighteen hours east to the third tower.');
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        returnFocusTo = document.activeElement;
        if (isDone()) { applyVictory(); say("We sleep tonight behind the gate, Silvia, in the dressing rooms, on piles of old costumes. The masks have all turned back to face the corridor. Every one of them is smiling now."); }
        else if (!isAwake()) say("Silvia, we are at the gate of Tower III. It is not a door: it is a wall of masks, hundreds of them, from the ground to the top of the arch, all white, all staring. Aurelia says the old charts of the Sanctuary call it the Gate of a Thousand Masks. Six of these lie, she says, and the letter knew it. Sheet 19B, please.");
        else say("The three masks are waiting, Silvia, each carved on one side only. Give each its other half. Aurelia is holding the lamp.");
        sizeCanvas();
        render();
        const focusTarget = isDone() ? el.done : (!isAwake() ? el.keyInput : el.hold);
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
      }
      function closeMasksModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        current = null;
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
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
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeMasksModal(); });
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
            lore: 'Silvia found the six masks that lie and spoke their word, and the wall of masks opened like a curtain. She gave three half-carved masks their missing halves, the way a mirror would, and the first piece of the mirror of Tower III was hers.',
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
            ? 'The gate of Tower III is a wall of masks, and six of them lie. Solve Sheet 19B of your journal and speak the word of the gate. Inside, three masks wait to be made whole.'
            : (eta
              ? 'Hermes and Aurelia are walking east across the plateau, after the raiders\' ruts. Arrival at the third tower in ' + eta + '. Keep Sheet 19B close.'
              : 'Hermes and Aurelia will leave Tower II once you answer him on the wire: eighteen hours east to the third tower. Begin with Sheet 19A.'),
          rewards: [
            { icon: '🎭', label: 'The Word of the Gate', desc: 'Sheet 19B · twelve masks, six that lie' },
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
        drawTrue: () => { strokes = MASKS[maskIdx()].strokes.map((s) => s.map(toCanvas(1))); render(); },
        setStrokes: (list) => { strokes = list; render(); },
        drawHalf: () => { strokes = [MASKS[maskIdx()].strokes[0].map(toCanvas(1))]; render(); },
        drawWrong: () => { strokes = MASKS[maskIdx()].strokes.map((s) => s.map(toCanvas(-1))); render(); },
        judge: () => judge(MASKS[maskIdx()])
      };
    })();
