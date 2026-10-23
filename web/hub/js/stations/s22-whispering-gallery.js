    // =========================================================================
    // STATION 22 · THE WHISPERING GALLERY (Tower III, Stage Path · node 42)
    // An elliptical hall laid out with two pins and a string: a whisper at one pin (a focus) is heard at the other,
    // and nowhere else. The raiders whisper at the east focus. Sheet 20B draws the gallery and its string but not
    // the pins: Silvia finds them with a ruler (3 varas from the middle: 3, 4, 5) and moves Hermes to the west one.
    // Near it the whisper comes through in stereo, clearer at every step; at the focus the raiders' words are clear,
    // and the tune the niche played for them comes across the hall. They played it back note for note and it stayed
    // shut: the gallery is a mirror for sound, so Silvia plays it from its last note to its first.
    // Without sound every whisper is written and every bell glows as it rings.
    // The plan comes from web/assets/js/whisper-gallery-data.js (scripts/journal/whisper_gallery.py), the same
    // geometry as the sheet. Reward: Fragment III of the mirror of Tower III, and the Ledger line [J] × 2 = [T].
    // =========================================================================
    (function initWhisperingGallery() {
      const modal = document.getElementById('modal-whispering-gallery');
      const G = window.WHISPER_GALLERY;
      if (!modal || !G) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const KEYS = {
        done: 'order_whispering_gallery_completed',
        focus: 'order_whispering_gallery_focus'
      };
      const NODE = 42;
      const NS = 'http://www.w3.org/2000/svg';
      const K = 90;                                 // pixels of the plan per vara
      const STEP = 0.5;                             // Hermes moves half a vara at a time
      const START = [0, -3.5];                      // just inside the door
      const HEAR = 1.5;                             // how far from the focus a whisper still reaches the ear
      const CLEAR = 0.5;                            // and where it is clear
      const ASH = 1;                                // how close to the raiders Hermes dares to go
      const listenAt = G.foci[G.raiders === 'east' ? 'west' : 'east'];
      const raidersAt = G.foci[G.raiders];
      // The five bells of the niche, the biggest (lowest) first; the tune the niche plays, and its mirror
      const BELLS = [523.25, 587.33, 659.25, 783.99, 880.0];
      const BELL_NAMES = ['the biggest bell', 'the second bell', 'the middle bell', 'the fourth bell', 'the smallest bell'];
      const TUNE = [0, 2, 4, 3, 1, 2];
      const MIRROR = TUNE.slice().reverse();
      const NOTE_S = 0.62;
      const WHISPER = 'It played its tune for us again. We played it back to it, note for note, and the niche stayed shut. Then it is not a tune. It is a reflection. Leave it. She will come.';

      const el = {
        close: $('btn-close-gallery'), speaker: $('gallery-speaker'), plan: $('gallery-plan'), where: $('gallery-where'),
        heard: $('gallery-heard'), listen: $('btn-gallery-listen'), focusFeedback: $('gallery-focus-feedback'),
        bellsCard: $('gallery-bells-card'), bells: $('gallery-bells'), played: $('gallery-played'), again: $('btn-gallery-again'),
        restart: $('btn-gallery-restart'), echoFeedback: $('gallery-echo-feedback'), sound: $('gallery-sound'), hint: $('gallery-hint'),
        victory: $('gallery-victory'), victoryText: $('gallery-victory-text'), fragment: $('gallery-fragment-svg'),
        done: $('btn-gallery-finish-station'), dispatch: $('gallery-dispatch-text'),
        tFocus: $('gallery-telem-focus'), tNiche: $('gallery-telem-niche'), tFragment: $('gallery-telem-fragment')
      };

      const isDone = () => get(KEYS.done) === 'true';
      const atFocus = () => isDone() || get(KEYS.focus) === 'true';
      const soundOn = () => !(window.EclipseAmbience && window.EclipseAmbience.state().muted);

      // Hints climb three levels (hub/js/hint-ladder.js), one ladder for each half of the room
      const focusHints = window.EclipseHints.define({
        id: 's22-focus', station: 'Station 22', title: 'where the pins stood', group: 'stage',
        anchor: el.focusFeedback, solved: atFocus,
        texts: [
          'Look at the page “The Whispering Gallery”, Silvia: Aurelia drew the gallery with two pins and a string, and a whisper at one pin is heard at the other. The pins are gone. Where did they stand?',
          'Look at the little drawing of the string: pulled tight to the top of the short axis, each half of the string runs to a pin. The string is ten varas, so each half is five. Measure five varas from the top of the short axis down to the long axis.',
          'Let us measure together. Open your ruler to five varas on the scale printed on the page “The Whispering Gallery”, put one end on the top of the short axis, and swing the other down until it touches the long axis, on the west side. A pin stood where it touches. Then read on the plan how far that is from the middle.'
        ]
      });
      const echoHints = window.EclipseHints.define({
        id: 's22-echo', station: 'Station 22', title: 'the tune of the niche', group: 'stage',
        anchor: el.echoFeedback, solved: isDone, active: atFocus,
        texts: [
          'The raiders played the tune back note for note, and the niche stayed shut. They said it themselves: it is not a tune, it is a reflection.',
          'In a mirror the last thing comes first. Play the six bells from the last note you heard to the first.',
          'Listen once more and write the bells down as they ring, the biggest bell as 1 and the smallest as 5. Then play your list from its end: the last bell you wrote is the first you play.'
        ]
      });

      // ---- the plan ----
      let pos = START.slice();
      let drawn = false;
      const mk = (tag, attrs, parent) => {
        const n = document.createElementNS(NS, tag);
        Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
        if (parent) parent.appendChild(n);
        return n;
      };
      const X = (x) => x * K, Y = (y) => -y * K;
      let hermes = null, waves = null;
      function drawPlan() {
        if (drawn || !el.plan) return;
        drawn = true;
        mk('ellipse', { cx: 0, cy: 0, rx: G.a * K + 14, ry: G.b * K + 14, class: 'gallery-wall-out' }, el.plan);
        mk('ellipse', { cx: 0, cy: 0, rx: G.a * K, ry: G.b * K, class: 'gallery-floor' }, el.plan);
        mk('line', { x1: X(-G.a), y1: 0, x2: X(G.a), y2: 0, class: 'gallery-axis' }, el.plan);
        mk('line', { x1: 0, y1: Y(G.b), x2: 0, y2: Y(-G.b), class: 'gallery-axis' }, el.plan);
        G.columns.forEach((c) => mk('circle', { cx: X(c[0]), cy: Y(c[1]), r: G.column_r * K, class: 'gallery-column' }, el.plan));
        mk('rect', { x: -0.45 * K, y: Y(-G.b) - 10, width: 0.9 * K, height: 24, class: 'gallery-door' }, el.plan);
        const label = (t, x, y, anchor) => { const n = mk('text', { x, y, class: 'gallery-label', 'text-anchor': anchor || 'middle' }, el.plan); n.textContent = t; };
        label('W', X(-G.a) - 34, 8); label('E', X(G.a) + 34, 8); label('N', 0, Y(G.b) - 26); label('door', 0, Y(-G.b) + 46);
        // the scale, as on Sheet 20B
        const sy = Y(-G.b) + 36, sx = -540;
        for (let i = 0; i < 5; i++) mk('rect', { x: sx + i * K, y: sy, width: K, height: 8, class: 'gallery-scale' + (i % 2 ? ' is-odd' : '') }, el.plan);
        label('0', sx, sy - 8, 'start'); label('5 varas', sx + 5 * K, sy - 8, 'end');
        waves = mk('g', { class: 'gallery-waves' }, el.plan);
        hermes = mk('g', { class: 'gallery-hermes' }, el.plan);
        mk('circle', { r: 22, class: 'gallery-hermes-ring' }, hermes);
        mk('circle', { r: 9, class: 'gallery-hermes-dot' }, hermes);
        el.plan.addEventListener('pointerdown', (e) => { if (!atFocus()) { e.preventDefault(); dragging = e.pointerId; try { el.plan.setPointerCapture(e.pointerId); } catch (err) {} moveToPointer(e); el.plan.focus(); } });
        el.plan.addEventListener('pointermove', (e) => { if (dragging === e.pointerId) moveToPointer(e); });
        const end = (e) => { if (dragging === e.pointerId) dragging = null; };
        el.plan.addEventListener('pointerup', end);
        el.plan.addEventListener('pointercancel', end);
        el.plan.addEventListener('keydown', (e) => {
          if (atFocus()) return;
          const moves = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, STEP], ArrowDown: [0, -STEP] };
          if (moves[e.key]) { e.preventDefault(); moveTo(pos[0] + moves[e.key][0], pos[1] + moves[e.key][1]); }
          else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); listenHere(); }
        });
      }
      let dragging = null;
      function moveToPointer(e) {
        const pt = el.plan.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const m = el.plan.getScreenCTM();
        if (!m) return;
        const p = pt.matrixTransform(m.inverse());
        moveTo(p.x / K, -p.y / K);
      }
      const snap = (v) => Math.round(v / STEP) * STEP;
      const inside = (x, y) => (x * x) / Math.pow(G.a - 0.45, 2) + (y * y) / Math.pow(G.b - 0.45, 2) <= 1.0001;
      const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
      function moveTo(x, y) {
        if (atFocus()) return false;
        x = snap(x); y = snap(y);
        if (!inside(x, y) || (x === pos[0] && y === pos[1])) return false;
        if (dist([x, y], raidersAt) <= ASH) {
          focusFeedback('Ash, very close, and someone breathing in the dark just ahead. Hermes holds his breath and steps back.', 'error');
          return false;
        }
        pos = [x, y];
        if (el.focusFeedback && el.focusFeedback.classList.contains('is-error')) focusFeedback('', '');
        paintHermes();
        hearing();
        return true;
      }

      // ---- what reaches the ear where Hermes stands ----
      const clarity = () => Math.max(0, 1 - dist(pos, listenAt) / HEAR);
      const clear = () => dist(pos, listenAt) <= CLEAR + 1e-9;
      function whereText() {
        const ew = pos[0] === 0 ? 'on the short axis' : Math.abs(pos[0]) + ' varas ' + (pos[0] < 0 ? 'west' : 'east');
        const ns = pos[1] === 0 ? 'on the long axis' : Math.abs(pos[1]) + ' varas ' + (pos[1] < 0 ? 'south' : 'north');
        return 'Hermes stands ' + (pos[0] === 0 && pos[1] === 0 ? 'in the middle of the gallery' : ew + ', ' + ns) + '.';
      }
      // The whisper as it reaches the ear: the farther, the more of it is lost (always the same letters for the same place)
      function garble(c) {
        let out = '', n = 0;
        for (let i = 0; i < WHISPER.length; i++) {
          const ch = WHISPER[i];
          if (!/[A-Za-z]/.test(ch)) { out += ch; continue; }
          n = (n * 31 + i * 17 + 7) % 101;
          out += n / 101 < c ? ch : '·';
        }
        return out;
      }
      function side() {
        const dx = listenAt[0] - pos[0], dy = listenAt[1] - pos[1];
        const parts = [];
        if (Math.abs(dx) >= STEP) parts.push(dx < 0 ? 'from your left' : 'from your right');
        if (Math.abs(dy) >= STEP) parts.push(dy > 0 ? 'from the far wall' : 'from behind you, toward the door');
        return parts.join(' and ');
      }
      function hearing() {
        if (el.where) el.where.textContent = whereText();
        const c = clarity();
        if (el.plan) el.plan.setAttribute('aria-valuetext', whereText());
        if (el.heard) {
          if (atFocus()) el.heard.textContent = '“' + WHISPER + '”';
          else if (c <= 0) el.heard.textContent = 'Nothing but your own breath and the hiss of the dark. No whisper reaches here.';
          else if (clear()) el.heard.textContent = 'Clear as a bell, ' + (side() || 'from all around') + ': “' + WHISPER.split('. ')[0] + '…”';
          else el.heard.textContent = (c < 0.4 ? 'A faint murmur' : 'Whispering, almost words') + (side() ? ', ' + side() : '') + ': “' + garble(c).slice(0, 64) + '…”';
          el.heard.classList.toggle('is-faint', c > 0 && !clear() && !atFocus());
        }
        whisperSound(atFocus() ? 0 : c);
        paintWaves(atFocus() ? 1 : c);
      }
      function paintHermes() {
        if (hermes) hermes.setAttribute('transform', 'translate(' + X(pos[0]) + ' ' + Y(pos[1]) + ')');
      }
      function paintWaves(c) {
        if (!waves) return;
        waves.textContent = '';
        if (c <= 0) return;
        for (let i = 1; i <= 3; i++) mk('circle', { cx: X(pos[0]), cy: Y(pos[1]), r: 24 + i * 14, class: 'gallery-wave', style: 'opacity:' + (c * (1 - i * 0.22)).toFixed(2) }, waves);
      }

      // ---- sound: a whisper of filtered noise, panned toward where it comes from; bells for the tune ----
      let audio = null;
      function ensureAudio() {
        if (!soundOn()) return null;
        try {
          if (!audio) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            const ctx = new Ctx();
            const master = ctx.createGain();
            master.gain.value = 0.9;
            master.connect(ctx.destination);
            audio = { ctx, master, whisper: null };
          }
          if (audio.ctx.state !== 'running') Promise.resolve(audio.ctx.resume()).catch(() => {});
          return audio;
        } catch (e) { return null; }
      }
      function whisperSound(c) {
        const a = c > 0 && modal.style.display !== 'none' ? ensureAudio() : audio;
        if (!a) return;
        const { ctx } = a;
        if (!a.whisper && c > 0) {
          const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          const src = ctx.createBufferSource();
          src.buffer = buf; src.loop = true;
          const band = ctx.createBiquadFilter();
          band.type = 'bandpass'; band.Q.value = 1.4; band.frequency.value = 2600;
          const syll = ctx.createGain();              // syllables: the noise breathes four or five times a second
          syll.gain.value = 0.5;
          const lfo = ctx.createOscillator(), depth = ctx.createGain();
          lfo.frequency.value = 4.6; depth.gain.value = 0.45;
          lfo.connect(depth); depth.connect(syll.gain);
          const level = ctx.createGain();
          level.gain.value = 0;
          const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          src.connect(band); band.connect(syll); syll.connect(level);
          if (pan) { level.connect(pan); pan.connect(a.master); } else level.connect(a.master);
          src.start(); lfo.start();
          a.whisper = { src, lfo, level, band, pan };
        }
        if (!a.whisper) return;
        const t = ctx.currentTime, w = a.whisper;
        w.level.gain.cancelScheduledValues(t);
        w.level.gain.setTargetAtTime(soundOn() ? 0.5 * c * c : 0, t, 0.15);
        w.band.frequency.setTargetAtTime(1400 + 1800 * c, t, 0.15);
        if (w.pan) w.pan.pan.setTargetAtTime(Math.max(-1, Math.min(1, (listenAt[0] - pos[0]) / 1.5)), t, 0.15);
      }
      function hush() {
        if (!audio || !audio.whisper) return;
        const w = audio.whisper;
        audio.whisper = null;
        try { w.level.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.08); } catch (e) {}
        setTimeout(() => { try { w.src.stop(); w.lfo.stop(); } catch (e) {} }, 400);
      }
      function bell(i, at, pan) {
        const a = ensureAudio();
        if (!a) return;
        const { ctx } = a;
        const t = at || ctx.currentTime;
        const out = ctx.createGain();
        out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(0.32, t + 0.01);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        let tail = out;
        if (ctx.createStereoPanner && pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; out.connect(p); tail = p; }
        tail.connect(a.master);
        [[1, 1], [2.0, 0.35], [2.76, 0.18], [5.4, 0.06]].forEach(([m, g]) => {
          const o = ctx.createOscillator(), og = ctx.createGain();
          o.type = 'sine'; o.frequency.value = BELLS[i] * m; og.gain.value = g;
          o.connect(og); og.connect(out);
          o.start(t); o.stop(t + 1.7);
        });
      }

      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
      function feedbackTo(node, text, kind) {
        if (!node) return;
        node.textContent = text;
        node.classList.toggle('is-error', kind === 'error');
        node.classList.toggle('is-ok', kind === 'ok');
      }
      const focusFeedback = (t, k) => feedbackTo(el.focusFeedback, t, k);
      const echoFeedback = (t, k) => feedbackTo(el.echoFeedback, t, k);

      // ---- the first half: stand where a pin stood ----
      function listenHere() {
        if (atFocus()) return;
        if (clear()) {
          set(KEYS.focus, 'true');
          pos = listenAt.slice();
          paintHermes();
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          focusFeedback('Here: where the west pin stood. Every word from the east pin arrives at once, from all the walls together.', 'ok');
          say("Silvia, I can hear them as if they were at my shoulder. Two of the Ashes, at the far end of the gallery, and they have no idea that the walls carry every word to me. Listen. And under my feet a bronze plate rings hollow: there is a frame of five little bells beside it, and a niche in the wall behind them, shut tight.");
          render();
          setTimeout(playTune, 1400);
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        focusFeedback(clarity() > 0 ? 'Words, almost, but they slip away. Not quite where the pin stood.' : 'Hermes holds still and listens. Nothing reaches him here.', 'error');
        focusHints.fail();
        render();
      }

      // ---- the second half: play the tune back as a mirror does ----
      let playing = false, entered = [];
      function playTune() {
        if (playing || isDone() || !atFocus()) return;
        playing = true;
        entered = [];
        paintEntered();
        render();
        const a = ensureAudio();
        const t0 = a ? a.ctx.currentTime + 0.1 : 0;
        echoFeedback('From the east end of the gallery, the niche plays its tune for the raiders. Six bells.', '');
        TUNE.forEach((b, k) => {
          if (a) bell(b, t0 + k * NOTE_S, 0.55);
          setTimeout(() => glow(b), 100 + k * NOTE_S * 1000);
        });
        setTimeout(() => { playing = false; echoFeedback('Six bells, from the east. Now answer from here.', ''); render(); }, 200 + TUNE.length * NOTE_S * 1000);
      }
      function glow(b) {
        const btn = el.bells && el.bells.children[b];
        if (!btn) return;
        btn.classList.add('is-ringing');
        setTimeout(() => btn.classList.remove('is-ringing'), NOTE_S * 1000 - 80);
      }
      function strike(b) {
        if (playing || isDone() || !atFocus()) return;
        bell(b, 0, 0);
        glow(b);
        entered.push(b);
        paintEntered();
        if (entered.length < TUNE.length) return;
        const got = entered.join(',');
        entered = [];
        if (got === MIRROR.join(',')) { setTimeout(completeStation, 500); return; }
        setTimeout(paintEntered, 700);
        echoFeedback(got === TUNE.join(',') ? 'Note for note, exactly as the raiders played it. The niche stays shut, as it did for them.' : 'The bells answer, but the niche stays shut.', 'error');
        echoHints.fail();
        render();
      }
      function paintEntered() {
        if (!el.played) return;
        el.played.textContent = '';
        for (let k = 0; k < TUNE.length; k++) {
          const dot = document.createElement('span');
          dot.className = 'gallery-played-dot' + (k < entered.length ? ' is-on' : '');
          el.played.appendChild(dot);
        }
        el.played.setAttribute('aria-label', entered.length ? 'Played so far: ' + entered.map((b) => 'bell ' + (b + 1)).join(', ') : 'No bell played yet');
      }

      function completeStation() {
        set(KEYS.done, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        echoFeedback('The tune, mirrored. The bronze plate sinks a finger’s width and the niche in the wall swings open.', 'ok');
        hush();
        applyVictory();
        render();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        if (modal.style.display !== 'none') {
          justSet = true;   // the mirror is refreshed once the modal closes, so its flash is seen
          if (el.done) setTimeout(() => el.done.focus(), 60);
        } else {
          showMirror();
        }
        say("It opened, Silvia. Backwards, the way a mirror would sing it. In the niche, on a bed of velvet gone grey with dust, lay Fragment III. In it there is an arch, and the edge of a balcony, and nothing in this tower looks like either. And scratched into the inside of the little door, in Aurelia's old hand, one line for your Ledger: [J] × 2 = [T]. She traced it with her finger and did not say a word.");
      }
      let justSet = false;
      function drawFragment() {
        const D = window.STAGE_MIRROR;
        if (!el.fragment || !D || el.fragment.childNodes.length) return;
        const pts = D.shards[2].points;
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        const x0 = Math.min(...xs), y0 = Math.min(...ys), s = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0);
        el.fragment.setAttribute('viewBox', (x0 - 6) + ' ' + (y0 - 6) + ' ' + (s + 12) + ' ' + (s + 12));
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') + ' Z';
        const defs = mk('defs', {}, el.fragment);
        mk('path', { d }, mk('clipPath', { id: 'gallery-frag-clip' }, defs));
        const grad = mk('linearGradient', { id: 'gallery-frag-glass', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
        mk('stop', { offset: '0', 'stop-color': '#4a2a18' }, grad);
        mk('stop', { offset: '0.6', 'stop-color': '#2a1430' }, grad);
        mk('stop', { offset: '1', 'stop-color': '#120a1c' }, grad);
        mk('path', { d, fill: 'url(#gallery-frag-glass)' }, el.fragment);
        const lines = mk('g', { 'clip-path': 'url(#gallery-frag-clip)', fill: 'none', stroke: '#f6e3b0', 'stroke-width': 2, 'stroke-linecap': 'round' }, el.fragment);
        D.facade.forEach((pl) => mk('path', { d: pl.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') }, lines));
        mk('path', { d, fill: 'none', stroke: '#f7dc8c', 'stroke-width': 3 }, el.fragment);
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = 'Silvia found on the page “The Whispering Gallery” where the pins of the gallery had stood, sent Hermes to the west one, and heard every word the raiders whispered at the east one. They had played the niche its own tune and it stayed shut; Silvia played it back the way a mirror would, from the last bell to the first, and the third piece of the mirror of Tower III was hers.';
        }
        drawFragment();
      }

      function render() {
        const done = isDone(), focus = atFocus();
        focusHints.refresh();
        echoHints.refresh();
        if (el.tFocus) el.tFocus.textContent = focus ? 'THE WEST PIN ✓' : '[ SEARCHING ]';
        if (el.tNiche) el.tNiche.textContent = done ? 'OPEN ✓' : focus ? '[ SHUT ]' : '[ UNHEARD ]';
        if (el.tFragment) el.tFragment.textContent = done ? 'SET ✓' : '[ MISSING ]';
        if (el.listen) { el.listen.disabled = focus; el.listen.style.display = focus ? 'none' : ''; }
        if (el.plan) el.plan.setAttribute('aria-disabled', focus ? 'true' : 'false');
        if (el.bellsCard) el.bellsCard.style.display = focus && !done ? '' : 'none';
        if (el.bells) Array.prototype.forEach.call(el.bells.children, (b) => { b.disabled = playing || done; });
        if (el.again) el.again.disabled = playing;
        if (el.restart) el.restart.disabled = playing || !entered.length;
        if (el.sound) el.sound.textContent = soundOn() ? '🔊 Use headphones if you can: the whispers come from the left or the right.' : '🔇 The sound is off (speaker button): every whisper is written below, and each bell glows as it rings.';
        if (el.hint) {
          const hint = done ? '' : !focus && focusHints.level() >= 2 ? '✦ Aurelia: the string never stretched. From the top of the short axis to a pin is half of it.'
            : focus && echoHints.level() >= 2 ? '✦ Aurelia: a mirror gives everything back, but the last thing first.' : '';
          el.hint.style.display = hint ? '' : 'none';
          el.hint.textContent = hint;
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        hearing();
      }

      // ---- the bells ----
      if (el.bells) {
        BELLS.forEach((hz, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'gallery-bell';
          b.style.setProperty('--size', String(1 - i * 0.13));
          b.setAttribute('aria-label', 'Bell ' + (i + 1) + ', ' + BELL_NAMES[i]);
          b.innerHTML = '<svg viewBox="0 0 60 70" aria-hidden="true"><path d="M30 6 C18 6 14 18 14 32 C14 44 10 50 6 56 H54 C50 50 46 44 46 32 C46 18 42 6 30 6 Z"/><circle cx="30" cy="62" r="5"/></svg><span>' + (i + 1) + '</span>';
          b.addEventListener('click', () => strike(i));
          el.bells.appendChild(b);
        });
      }
      if (el.listen) el.listen.addEventListener('click', listenHere);
      if (el.again) el.again.addEventListener('click', playTune);
      if (el.restart) el.restart.addEventListener('click', () => { entered = []; paintEntered(); echoFeedback('Start again from the first bell of your answer.', ''); render(); });

      // ---- Open / close ----
      const pause = () => (window.EclipseStagePause ? window.EclipseStagePause.remaining(NODE) : 0);
      const sealFace = () => (window.EclipseSheetSeals ? window.EclipseSheetSeals.missing(NODE) : '');
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        return get('order_camera_obscura_completed') === 'true' && !pause() && !sealFace();
      }
      let returnFocusTo = null;
      function openGalleryModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          const wait = window.EclipseStagePause ? window.EclipseStagePause.opensIn(NODE) : '';
          if (get('order_camera_obscura_completed') !== 'true') toast('✦ THE DOOR IS SHUT ✦ The Whispering Gallery opens after the Camera Obscura (Station 21).');
          else if (wait) toast('The candles of Tower III are still burning down. The Whispering Gallery opens in ' + wait + '.');
          else toast('The door of the Whispering Gallery opens with the seal printed on ' + (window.EclipseSheetSeals && window.EclipseSheetSeals.page ? window.EclipseSheetSeals.page(NODE) : 'the page “The Whispering Gallery”') + ': scan it with your camera.');
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        drawPlan();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        returnFocusTo = document.activeElement;
        if (el.speaker && window.EclipseMirrorSpeaker) window.EclipseMirrorSpeaker.render(NODE, el.speaker);
        entered = [];
        paintEntered();
        if (atFocus()) pos = listenAt.slice();
        else pos = START.slice();
        paintHermes();
        if (isDone()) { applyVictory(); say("We sleep tonight by the west pin, Silvia, wrapped in our coats on the cold floor. Every now and then Aurelia whispers something toward the east end, and it comes back to us, small and clear. She will not tell me what she says."); }
        else if (atFocus()) say("I am still standing on the west pin, Silvia, and the bells are still waiting. The raiders played the tune note for note and the niche stayed shut. Ring them for me.");
        else say("Silvia, the second stair ended in a hall with no corners at all: a long oval of columns, cold as a church. Somewhere in the dark at the far end two of the Ashes are whispering, and I cannot hear a word. Aurelia says the Order laid this gallery out with two pins and a string, and that a whisper at one pin is heard at the other. Open the page “The Whispering Gallery”, please. Tell me where to stand.");
        render();
        const target = isDone() ? el.done : atFocus() ? (el.bells && el.bells.children[0]) : el.plan;
        if (target) setTimeout(() => target.focus(), 60);
      }
      function closeGalleryModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        hush();
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
        if (justSet) { justSet = false; showMirror(); }
      }
      // Path III on the Quest Map, with Fragment III flashing into its place
      function showMirror() {
        if (document.documentElement.dataset.mapPath !== 'stage' && typeof window.switchMapPath === 'function') window.switchMapPath('stage', true);
        else if (window.StageMirror && typeof window.StageMirror.refresh === 'function') window.StageMirror.refresh();
        const wrap = document.getElementById('stage-map-canvas-wrap');
        if (wrap && wrap.offsetParent) setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }), 260);
      }
      function finishStation() {
        justSet = true;
        closeGalleryModal();
      }
      window.openWhisperingGalleryModal = openGalleryModal;
      window.closeWhisperingGalleryModal = closeGalleryModal;
      window.STAGE_OPENERS = window.STAGE_OPENERS || {};
      window.STAGE_OPENERS[NODE] = openGalleryModal;
      if (el.close) el.close.addEventListener('click', closeGalleryModal);
      if (el.done) el.done.addEventListener('click', finishStation);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeGalleryModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeGalleryModal(); });

      // ---- The card of the room on the Quest Map ----
      window.STAGE_CARDS = window.STAGE_CARDS || {};
      window.STAGE_CARDS[NODE] = () => {
        const thumb = './assets/thumbnails/whispering_gallery_preview.webp';
        if (isDone()) {
          return {
            badge: 'STATION 22 // FRAGMENT III',
            status: 'THE NICHE IS OPEN ✓',
            statusClass: 'status-done-badge',
            title: 'The Whispering Gallery · Tower III',
            thumb,
            lore: 'Silvia found where the pins of the gallery had stood and heard every word the raiders whispered at the far end. They had played the niche its tune note for note; she played it back the way a mirror would, and the third piece of the mirror of Tower III was hers.',
            rewards: [
              { icon: '🪞', label: 'Fragment III', desc: 'Set in the mirror of Tower III' },
              { icon: '📐', label: 'The Line of the Echo', desc: '[J] × 2 = [T] · in the Cipher Ledger' }
            ],
            btnText: 'Revisit the gallery ➔',
            action: openGalleryModal,
            hideReturnBtn: true
          };
        }
        return {
          badge: 'STATION 22 // STAGE PATH',
          status: 'THE GALLERY IS OPEN ✦',
          statusClass: 'status-live-badge',
          title: 'The Whispering Gallery · Tower III',
          thumb,
          lore: 'A hall with no corners, laid out with two pins and a string. A whisper at one pin is heard at the other, and the raiders are whispering. The journal page of the same name shows where the string ran: find where the pins stood, and listen.',
          rewards: [
            { icon: '👂', label: 'The Two Pins', desc: 'Your journal · measure, move, listen' },
            { icon: '🔔', label: 'The Tune of the Niche', desc: 'Answer it the way a mirror would' },
            { icon: '🪞', label: 'Fragment III', desc: 'One ninth of the mirror of Tower III' }
          ],
          btnText: '✦ ENTER THE GALLERY ➔',
          action: openGalleryModal,
          hideReturnBtn: true
        };
      };

      // For the smoke tests: where Hermes stands, a way to move him and to ring without the mouse, and the tune
      window.__gallery = {
        pos: () => pos.slice(), moveTo, listen: listenHere, strike, playing: () => playing, entered: () => entered.slice(),
        clarity, atFocus, tune: TUNE.slice(), mirror: MIRROR.slice(), listenAt: listenAt.slice(), raidersAt: raidersAt.slice()
      };
    })();
