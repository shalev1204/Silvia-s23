    // =========================================================================
    // STATION 22 · THE WHISPERING GALLERY (Tower III, Stage Path · node 42)
    // An elliptical hall laid out with two pins and a string: a whisper at one pin (a focus) is heard at the other,
    // and nowhere else. The raiders whisper at the east focus. Sheet 20B (already printed) draws the gallery and marks
    // the west pin with the listening rose (3 varas from the middle: 3, 4, 5); the hall is dark, so Silvia reads it there and walks Hermes to it,
    // in a 3D hall with a little plan in its corner. Only within a vara of it does the whisper come through (the side
    // it comes from only once the hints say so), so the page, not the hall, finds the pin; at the focus the words are clear,
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
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(a && a.sfx && a.sfx(kind, o)); };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const HOWTO_KEY = 'order_gallery_howto', CINE_INTRO = 'order_gallery_cine_intro';
      // a drag can cross several half-varas in one frame: one footstep per 120 ms, one held breath per 700 ms
      let lastStep = 0, lastBreath = 0;
      const every = (last, ms) => performance.now() - last >= ms;
      const KEYS = {
        done: 'order_whispering_gallery_completed',
        focus: 'order_whispering_gallery_focus'
      };
      const NODE = 42;
      const NS = 'http://www.w3.org/2000/svg';
      const K = 90;                                 // pixels of the plan per vara
      const STEP = 0.5;                             // Hermes moves half a vara at a time
      const START = [0, -3.5];                      // just inside the door
      const HEAR = 1;                               // how far from the focus a whisper still reaches the ear
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
        stage: $('gallery3d-stage'), stage3d: $('gallery3d-canvas'), subtitle: $('gallery3d-subtitle'), fade: $('gallery3d-fade'),
        status: $('gallery3d-status'), howto: $('gallery3d-howto'), help: $('btn-gallery-howto')
      };

      const isDone = () => get(KEYS.done) === 'true';
      const atFocus = () => isDone() || get(KEYS.focus) === 'true';
      const soundOn = () => !(window.EclipseAmbience && window.EclipseAmbience.state().muted);

      // Hints climb three levels (hub/js/hint-ladder.js), one ladder for each half of the room
      const focusHints = window.EclipseHints.define({
        id: 's22-focus', station: 'Station 22', title: 'where the pins stood', group: 'stage',
        anchor: el.focusFeedback, solved: atFocus,
        texts: [
          'Look at the plan on the page “The Whispering Gallery”, Silvia: on the west side of the floor there is a rose, the listening rose. The western pin stood there. The hall is too dark for Hermes to see it, so find it on the page and walk him to it.',
          'The rose lies on the long axis, the line that runs through the middle of the hall from west to east. Walk Hermes along that line toward the west and compare where he stands on the little plan with where the rose is on the page.',
          'Let us measure together. The string is ten varas, five on each side: from the top of the short axis, four varas above the middle, five varas reach the long axis three varas from the middle. So the rose is three varas west of the middle, on the long axis. Bring Hermes there and listen.'
        ]
      });
      const echoHints = window.EclipseHints.define({
        id: 's22-echo', station: 'Station 22', title: 'the tune of the niche', group: 'stage',
        anchor: el.echoFeedback, solved: isDone, active: atFocus,
        texts: [
          'The raiders played the tune back note for note, and the niche stayed shut. They said it themselves: it is not a tune, it is a reflection.',
          'In a mirror the last thing comes first. Play its six notes on the bells, from the last note you heard to the first.',
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
        label('W', X(-G.a) - 30, 12); label('E', X(G.a) + 30, 12); label('N', 0, Y(G.b) - 24); label('door', 0, Y(-G.b) + 52);
        waves = mk('g', { class: 'gallery-waves' }, el.plan);
        hermes = mk('g', { class: 'gallery-hermes' }, el.plan);
        mk('circle', { r: 22, class: 'gallery-hermes-ring' }, hermes);
        mk('circle', { r: 9, class: 'gallery-hermes-dot' }, hermes);
        el.plan.addEventListener('pointerdown', (e) => { if (!atFocus()) { e.preventDefault(); dragging = e.pointerId; try { el.plan.setPointerCapture(e.pointerId); } catch (err) {} moveToPointer(e); el.plan.focus(); } });
        el.plan.addEventListener('pointermove', (e) => { if (dragging === e.pointerId) moveToPointer(e); });
        const end = (e) => { if (dragging === e.pointerId) dragging = null; };
        el.plan.addEventListener('pointerup', end);
        el.plan.addEventListener('pointercancel', end);
        const keys = (e) => {
          if (atFocus() || (cine && cine.active)) return;
          const moves = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, STEP], ArrowDown: [0, -STEP] };
          if (moves[e.key]) { e.preventDefault(); moveTo(pos[0] + moves[e.key][0], pos[1] + moves[e.key][1]); }
          else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); listenHere(); }
        };
        el.plan.addEventListener('keydown', keys);
        if (el.stage) el.stage.addEventListener('keydown', (e) => { if (e.target === el.stage) keys(e); });
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
          if (every(lastBreath, 700)) { lastBreath = performance.now(); cue('heart'); }
          focusFeedback('Ash, very close, and someone breathing in the dark just ahead. Hermes holds his breath and steps back.', 'error');
          return false;
        }
        const wasClear = clear();
        pos = [x, y];
        if (el.focusFeedback && el.focusFeedback.classList.contains('is-error')) focusFeedback('', '');
        // stepping into the clear zone, the whisper comes round the walls; otherwise a footstep
        if (!wasClear && clear()) cue('echo', { deg: 9, n: 2, v: 0.05 });
        else if (every(lastStep, 120)) { lastStep = performance.now(); cue('step'); }
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
        if (focusHints.level() < 2) return '';   // the hall does not say where the pin is until the hints do
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
        mood();
        statusLine();
      }
      // the stage music leans in as the whisper clears, and falls silent while the bells must be heard
      function mood() {
        const amb = window.EclipseAmbience;
        if (amb && amb.intensity) amb.intensity(isDone() ? 0.6 : atFocus() ? 0.15 : 0.3 + 0.15 * clarity());
        if (amb && amb.hush) amb.hush(atFocus() && !isDone());
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
      function statusLine() {
        if (!el.status) return;
        el.status.textContent = isDone() ? '✦ The niche is open · Fragment III'
          : atFocus() ? 'On the west pin ✓ · ' + (playing ? 'the tune is playing' : entered.length + ' of 6 notes played')
          : 'Searching for the west pin · ' + Math.abs(pos[0]) + (pos[0] < 0 ? ' W' : pos[0] > 0 ? ' E' : '') + ', ' + Math.abs(pos[1]) + (pos[1] < 0 ? ' S' : pos[1] > 0 ? ' N' : '');
      }
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
          // pitchless on purpose: the niche's tune follows in 1.4 s and must be heard alone
          if (!cue('whoosh', { dur: 0.9 }) && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          focusFeedback('Here: where the west pin stood. Every word from the east pin arrives at once, from all the walls together.', 'ok');
          sceneFocus();
          say("Silvia, I can hear them as if they were at my shoulder. Two of the Ashes, at the far end of the gallery, and they have no idea that the walls carry every word to me. Listen. And under my feet a bronze plate rings hollow. Against the wall ahead stands a frame of five little bells, and behind them a niche in the wall, shut tight.");
          render();
          setTimeout(playTune, 1400);
          return;
        }
        if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        focusFeedback(clarity() > 0 ? 'Words, almost, but they slip away. Not quite where the pin stood.' : 'Hermes holds still and listens. Nothing reaches him here.', 'error');
        sceneMiss();
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
        echoFeedback('From the east end of the gallery, the niche plays its tune for the raiders: six notes on its five bells.', '');
        sceneTune();
        TUNE.forEach((b, k) => {
          if (a) bell(b, t0 + k * NOTE_S, 0.55);
          setTimeout(() => { glow(b); sceneBell(b, true); }, 100 + k * NOTE_S * 1000);
        });
        setTimeout(() => { playing = false; echoFeedback('Six notes, from the east. Now answer from here, on the bells beside Hermes.', ''); render(); }, 200 + TUNE.length * NOTE_S * 1000);
      }
      function glow(b) {
        const btn = el.bells && el.bells.children[b];
        if (!btn) return;
        Array.prototype.forEach.call(el.bells.children, (o) => o.classList.remove('is-ringing'));   // one bell glows at a time, however late the timers run
        btn.classList.add('is-ringing');
        setTimeout(() => btn.classList.remove('is-ringing'), NOTE_S * 1000 - 80);
      }
      function strike(b) {
        if (playing || isDone() || !atFocus()) return;
        bell(b, 0, 0);
        glow(b);
        sceneBell(b, false);
        entered.push(b);
        paintEntered();
        statusLine();
        if (entered.length < TUNE.length) return;
        const got = entered.join(',');
        entered = [];
        if (got === MIRROR.join(',')) { setTimeout(completeStation, 500); return; }
        setTimeout(paintEntered, 700);
        setTimeout(() => cue('wrong'), 400);   // after the sixth bell has spoken
        echoFeedback(got === TUNE.join(',') ? 'Note for note, exactly as the raiders played it. The niche stays shut, as theirs did for them.' : 'The bells answer, but the niche stays shut.', 'error');
        sceneMiss();
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
        cue('stone', { dur: 1.6 });   // the bronze plate sinks and the niche swings open
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        echoFeedback('The tune, mirrored. The bronze plate sinks a finger’s width and the niche in the wall swings open.', 'ok');
        sceneWin();
        hush();
        applyVictory();
        render();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        if (modal.style.display !== 'none') {
          justSet = true;   // the mirror is refreshed once the modal closes, so its flash is seen
          if (el.done) setTimeout(() => el.done.focus({ preventScroll: true }), 60);
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
        if (window.EclipseAureliaLetters && typeof window.EclipseAureliaLetters.render === 'function') { try { window.EclipseAureliaLetters.render(); } catch (e) {} }
      }

      function render() {
        const done = isDone(), focus = atFocus();
        focusHints.refresh();
        echoHints.refresh();
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
        // once the niche is open, the search is over: only the whisper, the victory and the voice stay in the panel
        [el.where, $('gallery-lead')].forEach((n) => { if (n) n.style.display = focus ? 'none' : ''; });
        [el.sound, el.focusFeedback].forEach((n) => { if (n) n.style.display = done ? 'none' : ''; });
        hearing();
        syncWorld();
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
      if (el.restart) el.restart.addEventListener('click', () => { entered = []; cue('tick', { f: 1800, v: 0.06 }); paintEntered(); echoFeedback('Start again from the first bell of your answer.', ''); render(); });

      // ---- The gallery in 3D. One vara is U metres; the plan's x (east) is the world's x, the plan's y (north) is -z ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const U = 1.15, WH = 4.3, NICHE_Y = 2.1;
      const AW = G.a * U, BW = G.b * U;                      // the half-axes of the floor, in metres
      const wx = (x) => x * U, wz = (y) => -y * U;
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const ease = (u) => u * u * (3 - 2 * u);
      const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
      // the two little shrines of bells: each a frame of five bells against the wall before a niche, one at each end, mirrored
      // (they stand by the wall on purpose: nothing in the hall points at the pins, which only the page can find)
      const NICHE_T = Math.PI;                               // the niches sit at the two ends of the long axis, between two columns
      function shrineAt(side) {
        const f = side < 0 ? listenAt : raidersAt;
        const p = [side * Math.abs(G.a * Math.cos(NICHE_T)), G.b * Math.sin(NICHE_T)];   // the niche, on the wall (varas)
        const n = [p[0] / (G.a * G.a), p[1] / (G.b * G.b)], nl = Math.hypot(n[0], n[1]);     // the wall's normal there
        const inward = [-n[0] / nl, n[1] / nl], niche = [wx(p[0]), wz(p[1])];
        const frame = [niche[0] + inward[0] * 0.85, niche[1] + inward[1] * 0.85];              // the frame of bells, before it
        const focus = [wx(f[0]), wz(f[1])], tl = Math.hypot(frame[0] - focus[0], frame[1] - focus[1]);
        return { niche, inward, frame, focus, toFrame: [(frame[0] - focus[0]) / tl, (frame[1] - focus[1]) / tl] };
      }
      const WEST = shrineAt(-1), EAST = shrineAt(1);
      let W = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, phase: '', focusT: 0, tuneT: 0, winT: 0, endTimers: [], hits: [] };

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
        scene.background = new T.Color(0x030305);
        scene.fog = new T.Fog(0x030305, 14, 30);
        const camera = new T.PerspectiveCamera(45, 16 / 10, 0.05, 100);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const glow = (color, op) => new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op == null ? 0 : op, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        const solid = (geo, mat, x, y, z, parent) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; };

        // ---- Night: a breath of blue from the high windows, the raiders' little fire, the lamps of the two of them ----
        scene.add(new T.HemisphereLight(0x46507a, 0x0c0808, 0.22));
        const moon = new T.DirectionalLight(0x8090c0, 0.28);
        moon.position.set(-4, 12, -6); moon.target.position.set(0, 0, 0);
        moon.castShadow = true; moon.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(moon.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
        moon.shadow.bias = -0.0006;
        scene.add(moon); scene.add(moon.target);

        // ---- The hall: a floor of worn flags with the two axes inlaid in brass, an oval wall, a dark vault ----
        const flags0 = SC.tex.masonry(22, 8, 8), flags = { map: flags0.map.clone(), bump: flags0.bump.clone() };
        [flags.map, flags.bump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3.2, 2.6); });
        const floor = new T.Mesh(new T.CircleGeometry(1, 96), paint({ map: flags.map, bumpMap: flags.bump, bumpScale: 0.4, color: 0x4a4440 }));
        floor.scale.set(AW + 0.35, BW + 0.35, 1); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
        const brass = paint({ color: 0xa8803a, metalness: 0.5, roughness: 0.35, emissive: 0x140a02 }, 0xffe0a0, 0.35);
        solid(new T.BoxGeometry(AW * 2, 0.006, 0.035), brass, 0, 0.004, 0).castShadow = false;
        solid(new T.BoxGeometry(0.035, 0.006, BW * 2), brass, 0, 0.004, 0).castShadow = false;
        const stone0 = SC.tex.masonry(23, 7, 4), stone = { map: stone0.map.clone(), bump: stone0.bump.clone() };
        [stone.map, stone.bump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(9, 1.6); });
        const wallMat = paint({ map: stone.map, bumpMap: stone.bump, bumpScale: 0.6, color: 0x3e3846, side: T.BackSide });
        const wall = new T.Mesh(new T.CylinderGeometry(1, 1, WH, 96, 1, true), wallMat);
        wall.scale.set(AW + 0.35, 1, BW + 0.35); wall.position.y = WH / 2; wall.receiveShadow = true; scene.add(wall);
        const vault = new T.Mesh(new T.SphereGeometry(1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), paint({ color: 0x14101a, side: T.BackSide }));
        vault.scale.set(AW + 0.35, 2.6, BW + 0.35); vault.position.y = WH; scene.add(vault);
        // the door in the middle of the south side, onto the stair, a little moonlight on its steps
        const doorZ = BW + 0.33;
        solid(new T.BoxGeometry(0.9 * U, 2.7, 0.06), new T.MeshBasicMaterial({ color: 0x0a0c16 }), 0, 1.35, doorZ).castShadow = false;
        [-1, 1].forEach((sd) => solid(new T.BoxGeometry(0.16, 2.9, 0.3), paint({ color: 0x5a5060 }), sd * (0.45 * U + 0.08), 1.45, doorZ - 0.1));
        solid(new T.BoxGeometry(0.9 * U + 0.48, 0.2, 0.3), paint({ color: 0x5a5060 }), 0, 2.9, doorZ - 0.1);
        const doorGlow = glow(0x7088c0, 0.18); doorGlow.scale.set(1.6, 2.8, 1); doorGlow.position.set(0, 1.3, doorZ - 0.2); scene.add(doorGlow);

        // ---- The colonnade: seventeen columns, as on the page ----
        const colMat = paint({ map: stone.map, bumpMap: stone.bump, bumpScale: 0.5, color: 0x6a6070 });
        const capMat = paint({ color: 0x3a3442 });
        G.columns.forEach((c) => {
          const x = wx(c[0]), z = wz(c[1]), r = G.column_r * U;
          solid(new T.CylinderGeometry(r, r * 1.08, WH - 0.7, 18), colMat, x, (WH - 0.7) / 2 + 0.25, z);
          solid(new T.BoxGeometry(r * 2.6, 0.25, r * 2.6), capMat, x, 0.125, z);
          solid(new T.BoxGeometry(r * 2.4, 0.22, r * 2.4), capMat, x, WH - 0.33, z);
        });

        // ---- The two shrines: a frame of five bells, a bronze plate on the pin, a niche in the wall with a little door ----
        const bellMat = paint({ color: 0x9a6a2a, metalness: 0.7, roughness: 0.32, emissive: 0x120802 }, 0xffd890, 0.35);
        const woodMat = paint({ map: SC.tex.wood(0x3a2418, 22), color: 0x5a3a26 });
        function shrine(S, west) {
          const g = new T.Group(); scene.add(g);
          // the frame stands across the line from the pin to the niche, its biggest bell on the left as you face the niche
          const fwd = [-S.inward[0], -S.inward[1]], right = [-fwd[1], fwd[0]];
          const frame = new T.Group(); frame.position.set(S.frame[0], 0, S.frame[1]); frame.rotation.y = faceYaw(fwd[0], fwd[1]); g.add(frame);
          [-1, 1].forEach((sd) => solid(new T.BoxGeometry(0.07, 1.7, 0.07), woodMat, sd * 0.78, 0.85, 0, frame));
          solid(new T.BoxGeometry(1.7, 0.08, 0.09), woodMat, 0, 1.68, 0, frame);
          const bells = [0, 1, 2, 3, 4].map((i) => {
            const s = 1 - i * 0.13, pivot = new T.Group();
            pivot.position.set(-0.6 + i * 0.3, 1.62, 0); frame.add(pivot);
            const shape = [[0, 0], [0.05, 0], [0.09, -0.04], [0.11, -0.14], [0.14, -0.22], [0.15, -0.25], [0, -0.25]].map(([x, y]) => new T.Vector2(x * s * 1.25, y * s * 1.25));
            const bell = solid(new T.LatheGeometry(shape, 20), bellMat, 0, -0.04, 0, pivot);
            solid(new T.CylinderGeometry(0.006, 0.006, 0.06, 4), woodMat, 0, -0.01, 0, pivot).castShadow = false;
            const tongue = solid(new T.SphereGeometry(0.025 * s + 0.01, 8, 6), bellMat, 0, -0.27 * s * 1.25, 0, pivot); tongue.castShadow = false;
            const halo = glow(0xffd890); halo.scale.set(0.5 * s + 0.2, 0.5 * s + 0.2, 1); halo.position.y = -0.18 * s; pivot.add(halo);
            bell.userData.bell = west ? i : -1;
            return { pivot, bell, halo, swing: 0, t: -9 };
          });
          // the bronze plate on the pin
          const plate = solid(new T.CylinderGeometry(0.34, 0.36, 0.04, 40), paint({ color: 0x8a6a34, metalness: 0.55, roughness: 0.4, emissive: 0x0c0602 }, 0xffe0a0, 0.3), S.focus[0], 0.02, S.focus[1]);
          plate.castShadow = false; plate.visible = false;   // under the dust until a boot rings it hollow
          // the niche: a recess in the wall, a little door on a hinge, and (in the west one) Fragment III
          const niche = new T.Group(); niche.position.set(S.niche[0] + S.inward[0] * 0.05, NICHE_Y, S.niche[1] + S.inward[1] * 0.05);
          niche.rotation.y = faceYaw(-S.inward[0], -S.inward[1]); g.add(niche);
          // the recess: a dark back and four sides, open toward the hall
          const recess = paint({ color: 0x0c080e });
          solid(new T.PlaneGeometry(0.62, 0.78), recess, 0, 0, -0.22, niche).castShadow = false;
          [[0, 0.39, 0.62, 0.01, 0.24], [0, -0.39, 0.62, 0.01, 0.24], [-0.31, 0, 0.01, 0.78, 0.24], [0.31, 0, 0.01, 0.78, 0.24]].forEach(([x, y, bw, bh, bd]) => solid(new T.BoxGeometry(bw, bh, bd), recess, x, y, -0.1, niche).castShadow = false);
          [[0, 0.44, 0.8, 0.1], [0, -0.44, 0.8, 0.1], [-0.36, 0, 0.1, 0.98], [0.36, 0, 0.1, 0.98]].forEach(([x, y, bw, bh]) => solid(new T.BoxGeometry(bw, bh, 0.12), brass, x, y, 0.02, niche).castShadow = false);
          const hinge = new T.Group(); hinge.position.set(-0.3, 0, 0.07); niche.add(hinge);
          const planks = (c, w, h) => {
            c.fillStyle = '#4a2c18'; c.fillRect(0, 0, w, h);
            c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3;
            for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(k * w / 4, 0); c.lineTo(k * w / 4, h); c.stroke(); }
          };
          const outTex = P.canvasTex(256, 320, planks);
          const inTex = P.canvasTex(256, 320, (c, w, h) => {
            planks(c, w, h);
            if (west) {   // only on its inner side, scratched in Aurelia's old hand: the line for the Ledger
              c.fillStyle = 'rgba(255,236,190,0.92)'; c.font = 'italic 600 34px Georgia, serif'; c.textAlign = 'center';
              c.fillText('[J] × 2 = [T]', w / 2, h * 0.52);
            }
          });
          const outMat = paint({ map: outTex, color: 0xffffff }), inMat = paint({ map: inTex, color: 0xffffff });
          const door = solid(new T.BoxGeometry(0.6, 0.76, 0.04), [outMat, outMat, outMat, outMat, outMat, inMat], 0.3, 0, 0, hinge);
          let shard = null;
          if (west) {
            const D = window.STAGE_MIRROR;
            if (D && D.shards && D.shards[2]) {
              const pts = D.shards[2].points, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
              const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, sc = 0.42 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
              const shape = new T.Shape(pts.map((p) => new T.Vector2((p[0] - cx) * sc, -(p[1] - cy) * sc)));
              const shardTex = P.canvasTex(256, 256, (c, w) => {
                const gr = c.createLinearGradient(0, 0, w, w); gr.addColorStop(0, '#4a2a18'); gr.addColorStop(0.6, '#2a1430'); gr.addColorStop(1, '#120a1c');
                c.fillStyle = gr; c.fillRect(0, 0, w, w);
                c.strokeStyle = '#f6e3b0'; c.lineWidth = 6;   // an arch, and the edge of a balcony
                c.beginPath(); c.moveTo(w * 0.28, w * 0.8); c.lineTo(w * 0.28, w * 0.42); c.arc(w * 0.5, w * 0.42, w * 0.22, Math.PI, 0); c.lineTo(w * 0.72, w * 0.8); c.stroke();
                c.beginPath(); c.moveTo(w * 0.12, w * 0.3); c.lineTo(w * 0.88, w * 0.3); c.stroke();
                for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(w * (0.16 + k * 0.11), w * 0.3); c.lineTo(w * (0.16 + k * 0.11), w * 0.2); c.stroke(); }
              });
              const geo = new T.ShapeGeometry(shape);
              const pos = geo.attributes.position, uv = new Float32Array(pos.count * 2);
              for (let i = 0; i < pos.count; i++) { uv[i * 2] = pos.getX(i) / 0.42 + 0.5; uv[i * 2 + 1] = pos.getY(i) / 0.42 + 0.5; }
              geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
              shard = new T.Mesh(geo, new T.MeshStandardMaterial({ map: shardTex, roughness: 0.1, metalness: 0.3, emissive: 0xffffff, emissiveMap: shardTex, emissiveIntensity: 0.35, side: T.DoubleSide }));
              shard.position.z = -0.12; niche.add(shard);
              shard.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(shape.getPoints().map((v) => new T.Vector3(v.x, v.y, 0.002))), new T.LineBasicMaterial({ color: 0xf7dc8c, toneMapped: false })));
            }
          }
          const nicheGlow = glow(0xf7dc8c); nicheGlow.scale.set(0.9, 0.9, 1); nicheGlow.position.set(0, 0, -0.2); niche.add(nicheGlow);
          const nicheLight = new T.PointLight(0xffe0a0, 0, 3, 1.8); nicheLight.position.set(0, 0, 0.6); niche.add(nicheLight);
          return { g, frame, bells, plate, niche, hinge, door, shard, nicheGlow, nicheLight, fwd, right };
        }
        const west = shrine(WEST, true), east = shrine(EAST, false);

        // ---- The raiders: two of the Ashes, grey with ash, by a bowl of embers near the east pin ----
        const ember = new T.Group(); ember.position.set(EAST.focus[0] + 0.55, 0, EAST.focus[1] + 0.15); scene.add(ember);
        solid(new T.CylinderGeometry(0.2, 0.12, 0.16, 16), paint({ color: 0x2a2220 }), 0, 0.08, 0, ember);
        const coals = glow(0xff6a2a, 0.9); coals.scale.set(0.55, 0.4, 1); coals.position.y = 0.2; ember.add(coals);
        const emberLight = new T.PointLight(0xff7a3a, 1.6, 6, 1.7); emberLight.position.set(0, 0.5, 0); ember.add(emberLight);
        const raiders = [[0.35, -0.75, 31], [0.85, 0.7, 37]].map(([dx, dz, seed], n) => {
          let body = null;
          try { body = SC.chars.raider(paint, { robe: n ? 0x4a4440 : 0x3a3634, wrap: 0x1c1a1a, sash: 0x5a1e14, seed }); } catch (e) { body = null; }
          const g = body || new T.Group();
          g.position.set(EAST.focus[0] + dx, 0.02, EAST.focus[1] + dz);
          g.rotation.y = faceYaw(ember.position.x - g.position.x, ember.position.z - g.position.z);
          g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(g);
          return { g, home: [g.position.x, g.position.z], ph: n * 2.1 };
        });
        raiders.forEach((r) => r.g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; } }));

        // ---- Hermes with his lantern, and Aurelia with her lamp shaded under her cloak ----
        let HM = null;
        try {
          HM = P.buildHermes(T, glowTex);
          HM.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(HM.hermes);
        } catch (e) { HM = null; }
        const hermesLight = new T.PointLight(0xffc27a, 1.1, 5.5, 1.6); scene.add(hermesLight);
        let aurelia = null;
        const lampLight = new T.PointLight(0xffc27a, 0.7, 4.5, 1.6); scene.add(lampLight);
        try {
          aurelia = SC.chars.oracle(paint, { scale: 1.12 });
          aurelia.userData.lift(1);
          aurelia.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          const lamp = new T.Group();
          solid(new T.CylinderGeometry(0.05, 0.07, 0.1, 12), brass, 0, 0, 0, lamp);
          const lf = glow(0xffc070, 0.7); lf.scale.set(0.3, 0.3, 1); lf.position.y = 0.09; lamp.add(lf);
          lamp.position.set(0, -0.02, 0.06);
          if (aurelia.userData.hold) aurelia.userData.hold.add(lamp);
          aurelia.userData.lampAt = lf;
          scene.add(aurelia);
        } catch (e) { aurelia = null; }

        // ---- What she hears, made visible: rings on the floor round Hermes; once on the pin, the whisper's paths ----
        const ringMat = () => new T.MeshBasicMaterial({ color: 0x9cc8e6, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, side: T.DoubleSide });
        const rings = [0, 1, 2].map(() => { const m = new T.Mesh(new T.RingGeometry(0.92, 1, 48), ringMat()); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; scene.add(m); return m; });
        // every path from one pin bounces once off the wall and runs to the other pin: that is why the gallery whispers
        const NR = lowPower ? 90 : 160;
        const rayPos = new Float32Array(NR * 3), rays = [];
        for (let i = 0; i < NR; i++) rays.push({ th: Math.random() * Math.PI * 2, u: Math.random(), sp: 0.22 + Math.random() * 0.12, y: 1.2 + Math.random() * 0.6 });
        const rayGeo = new T.BufferGeometry(); rayGeo.setAttribute('position', new T.BufferAttribute(rayPos, 3));
        const rayMat = new T.PointsMaterial({ map: glowTex, color: 0xbfe0ff, size: 0.07, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false });
        const rayPts = new T.Points(rayGeo, rayMat); rayPts.frustumCulled = false; scene.add(rayPts);

        let fx = null, dust = null;
        try {
          if (window.EclipseFX) {
            fx = window.EclipseFX.kit(renderer, scene, HM, {
              look: { bloom: 0.8, threshold: 0.8, knee: 0.2, vignette: 0.55, grain: 0.045, ca: 0.1, sat: 0.95, contrast: 1.06, gain: [0.98, 1.0, 1.04], shade: 0.38, shadeColor: [0.3, 0.32, 0.5] },
              sandColor: 0x5a5460, printsOn: false, scale: 1, wind: [0, 0, 0], ambient: null, sparkColor: 0xffe0a0
            });
            dust = window.EclipseFX.particles(scene, { max: lowPower ? 120 : 240, additive: true, wind: [0.01, 0, 0] });
          }
        } catch (e) { fx = null; }

        return { T, renderer, scene, camera, lowPower, west, east, raiders, ember, coals, emberLight, rings, rays, rayPos, rayGeo, rayMat, rayK: 0, rayBurst: 0, rayDir: 1, rayGold: 0,
          H: HM, hermes: HM && HM.hermes, hermesLight, aurelia, lampLight, fx, dust, dustAcc: 0, aMove: null, aSpot: null, plateSink: 0, doorOpen: 0, gone: 0,
          cam: { p: null, l: null, dist: 1, tDist: 1 } };
      }

      // ---- Keeping the scene in step with the game ----
      function shortTurn(a, b) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
      const sinceWin = (now) => (view.winT && !reduced() ? ((now || performance.now()) - view.winT) / 1000 : (isDone() ? 99 : -1));
      // Aurelia: at the door with her lamp while he searches; beside him at the bells; at the niche when it opens
      function aureliaSpot(now) {
        const e = sinceWin(now);
        const d = WEST.toFrame;
        if (e >= 0 && e < 99 && e > 6.5 && e < 14) return [WEST.frame[0] + d[1] * 1.15 - d[0] * 0.05, WEST.frame[1] - d[0] * 1.15 - d[1] * 0.05];
        if (atFocus()) return [WEST.focus[0] + d[0] * 0.55 + d[1] * 1.0, WEST.focus[1] + d[1] * 0.55 - d[0] * 1.0];
        return [0.9, wz(START[1]) + 0.35];
      }
      function steerAurelia(snap, now) {
        if (!W || !W.aurelia) return;
        const s = aureliaSpot(now), key = s.join();
        if (!snap && W.aSpot === key) return;
        W.aSpot = key;
        const a = W.aurelia;
        if (snap || reduced()) { a.position.set(s[0], 0.02, s[1]); W.aMove = null; return; }
        const d = Math.hypot(s[0] - a.position.x, s[1] - a.position.z);
        W.aMove = d < 0.01 ? null : { fx: a.position.x, fz: a.position.z, tx: s[0], tz: s[1], t: 0, dur: Math.min(4, d / 1.3), ry0: a.rotation.y, ry1: faceYaw(s[0] - a.position.x, s[1] - a.position.z) };
      }
      function stepAurelia(dt) {
        const mv = W.aMove, a = W.aurelia;
        if (!mv) return;
        mv.t += dt;
        const u = Math.min(1, mv.t / mv.dur), e = ease(u);
        a.position.x = mv.fx + (mv.tx - mv.fx) * e; a.position.z = mv.fz + (mv.tz - mv.fz) * e;
        a.rotation.y = mv.ry0 + shortTurn(mv.ry0, mv.ry1) * Math.min(1, mv.t / 0.4);
        if (u >= 1) W.aMove = null;
      }
      function syncWorld() {
        if (!W) return;
        if (view.snapNext && W.hermes) {
          W.hermes.position.set(wx(pos[0]), 0.02, wz(pos[1]));
          W.hermes.rotation.y = atFocus() ? faceYaw(WEST.frame[0] - WEST.focus[0], WEST.frame[1] - WEST.focus[1]) : 0;
          W.plateSink = isDone() ? 1 : 0; W.doorOpen = isDone() ? 1 : 0; W.gone = isDone() ? 1 : 0;
        }
        steerAurelia(view.snapNext);
        view.snapNext = false;
      }

      // ---- The camera: the whole gallery from above the door while she measures; the bells; the niche when it opens ----
      function cameraPhase(now) {
        const e = sinceWin(now);
        if (e >= 0.8 && e < 14) return 'niche';
        return atFocus() ? 'bells' : 'hall';
      }
      function shotFor(ph) {
        const asp = W.camera.aspect || 1.6, tv = Math.tan(W.camera.fov * Math.PI / 360);
        if (ph === 'hall') {
          // far enough that the whole oval fits, seen at about fifty degrees, leaning a little toward Hermes
          const d = Math.max((AW + 1.0) / (tv * asp), (BW + 1.0) / tv * 0.9);
          const hx = W.hermes ? W.hermes.position.x : 0;
          return { p: [hx * 0.1, d * 0.88, 0.4 + d * 0.48], l: [hx * 0.06, 0, 0.35] };
        }
        if (ph === 'niche') {
          const n = WEST.niche, k = WEST.inward;
          return { p: [n[0] + k[0] * 3.1 + k[1] * 0.9, 2.05, n[1] + k[1] * 3.1 - k[0] * 0.9], l: [n[0] + k[0] * 0.2, NICHE_Y - 0.1, n[1] + k[1] * 0.2] };
        }
        // the bells: from behind Hermes's shoulder, the frame and the niche ahead
        const f = WEST.focus, d = WEST.toFrame, sd = [-d[1], d[0]], back = 2.6 / Math.min(1.2, Math.max(0.75, asp * 0.75));
        return { p: [f[0] - d[0] * back + sd[0] * 0.7, 2.75, f[1] - d[1] * back + sd[1] * 0.7], l: [(f[0] + WEST.frame[0]) / 2 + d[0] * 0.5, 1.35, (f[1] + WEST.frame[1]) / 2 + d[1] * 0.5] };
      }
      function placeCamera(dt, now, snap) {
        const cam = W.camera, c = W.cam;
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else {
          const ph = cameraPhase(now);
          if (ph !== view.phase) view.phase = ph;
          c.dist += (c.tDist - c.dist) * Math.min(1, dt * 4);
          const s = shotFor(ph);
          p = s.p.slice(); l = s.l.slice();
          for (let i = 0; i < 3; i++) p[i] = l[i] + (p[i] - l[i]) * c.dist;
          if (!reduced()) { const t = now / 1000; p[0] += Math.sin(t * 0.19) * 0.05; p[1] += Math.sin(t * 0.23) * 0.03; }
        }
        if (!c.p || snap) { c.p = p.slice(); c.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * 2.2);
          for (let i = 0; i < 3; i++) { c.p[i] += (p[i] - c.p[i]) * k; c.l[i] += (l[i] - c.l[i]) * k; }
        }
        cam.position.set(c.p[0], c.p[1], c.p[2]);
        cam.lookAt(c.l[0], c.l[1], c.l[2]);
      }
      function openingShots() {
        const dz = BW + 0.33;
        return [
          { from: { p: [0, 1.65, dz - 0.35], l: [0, 1.7, -3] }, to: { p: [0, 2.0, dz - 2.6], l: [0, 1.4, -3] }, dur: 5.5, kicker: 'STATION 22', title: 'THE WHISPERING GALLERY', line: 'The second stair ends in a hall with no corners: a long oval of columns, cold as a church.' },
          { from: { p: [0.8, 1.3, 1.4], l: [EAST.focus[0] + 0.6, 1.2, 0] }, to: { p: [1.8, 1.25, 0.9], l: [EAST.focus[0] + 0.6, 1.1, 0] }, dur: 5.5, line: 'At the far end, two of the Ashes whisper over a bowl of embers. From the door, not one word can be heard.' },
          { from: { p: [0, 13, 2.5], l: [0, 0, 0.2] }, to: { p: [0, 10, 7.5], l: [0, 0, 0.5] }, dur: 6, line: 'The Order laid this hall out with two pins and a string. A whisper at one pin is heard at the other, and nowhere else.' }
        ];
      }

      // ---- Pointing: the floor (Hermes walks there), or a bell once he stands on the pin ----
      function bindPointer() {
        const c = el.stage3d;
        if (!c || c.__galleryPointer) return;
        c.__galleryPointer = true;
        let down = null;
        const hit = (e) => {
          const T = W.T, r = c.getBoundingClientRect();
          const ray = new T.Raycaster();
          ray.setFromCamera(new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), W.camera);
          return ray;
        };
        const toFloor = (e) => {
          const ray = hit(e), o = ray.ray.origin, d = ray.ray.direction;
          if (Math.abs(d.y) < 1e-4) return null;
          const t = -o.y / d.y;
          return t > 0 ? [(o.x + d.x * t) / U, -(o.z + d.z * t) / U] : null;
        };
        c.addEventListener('pointerdown', (e) => {
          if (!W || (cine && cine.active)) return;
          if (atFocus()) {
            if (isDone() || playing) return;
            const found = hit(e).intersectObjects(W.west.bells.map((b) => b.bell), false)[0];
            if (found) { e.preventDefault(); strike(found.object.userData.bell); }
            return;
          }
          const p = toFloor(e);
          if (!p) return;
          e.preventDefault();
          down = e.pointerId;
          try { c.setPointerCapture(e.pointerId); } catch (err) {}
          moveTo(p[0], p[1]);
          if (el.stage) el.stage.focus({ preventScroll: true });
        });
        c.addEventListener('pointermove', (e) => {
          if (down !== e.pointerId || !W || atFocus()) return;
          const p = toFloor(e);
          if (p) moveTo(p[0], p[1]);
        });
        const end = (e) => { if (down === e.pointerId) down = null; };
        c.addEventListener('pointerup', end);
        c.addEventListener('pointercancel', end);
        c.addEventListener('wheel', (e) => { if (!W || (el.howto && el.howto.contains(e.target))) return; e.preventDefault(); W.cam.tDist = clamp(W.cam.tDist * Math.exp(e.deltaY * 0.001), 0.7, 1.15); }, { passive: false });
      }

      // ---- The frame ----
      function rayPoint(th, u, dir, out) {
        // from one pin to the wall at angle th and on to the other pin; dir 1 runs east to west, -1 west to east
        const from = dir > 0 ? EAST.focus : WEST.focus, to = dir > 0 ? WEST.focus : EAST.focus;
        const px = AW * Math.cos(th), pz = BW * Math.sin(th);
        const l1 = Math.hypot(px - from[0], pz - from[1]), l2 = Math.hypot(to[0] - px, to[1] - pz), s = u * (l1 + l2);
        if (s < l1) { out[0] = from[0] + (px - from[0]) * s / l1; out[1] = from[1] + (pz - from[1]) * s / l1; }
        else { const k = (s - l1) / l2; out[0] = px + (to[0] - px) * k; out[1] = pz + (to[1] - pz) * k; }
        return out;
      }
      function drawFrame(now, dt) {
        if (!W) return;
        const t = now / 1000, rm = reduced(), focus = atFocus(), done = isDone();
        // Hermes walks to where she sends him, half a vara at a time on the plan
        if (W.hermes) {
          const h = W.hermes, tx = wx(pos[0]), tz = wz(pos[1]);
          const dx = tx - h.position.x, dz = tz - h.position.z, d = Math.hypot(dx, dz);
          if (d > 0.01 && !rm) {
            const stepLen = Math.min(d, dt * 1.9);
            h.position.x += dx / d * stepLen; h.position.z += dz / d * stepLen;
            h.rotation.y += shortTurn(h.rotation.y, faceYaw(dx, dz)) * Math.min(1, dt * 9);
          } else {
            h.position.x = tx; h.position.z = tz;
            // standing still he turns his ear to the whisper, or faces the bells
            const want = focus ? faceYaw(WEST.frame[0] - h.position.x, WEST.frame[1] - h.position.z) : clarity() > 0 ? faceYaw(EAST.focus[0] - h.position.x, EAST.focus[1] - h.position.z) : 0;
            h.rotation.y += shortTurn(h.rotation.y, want) * Math.min(1, dt * 3);
          }
          h.position.y = 0.02 - (focus ? 0.03 * W.plateSink : 0);
          const lp = new W.T.Vector3(0.35, 1.2, -0.25).applyMatrix4(h.matrixWorld);
          W.hermesLight.position.copy(lp);
        }
        if (W.aurelia) {
          steerAurelia(false, now);
          stepAurelia(dt);
          if (!W.aMove) {
            const e = sinceWin(now);
            const look = e > 6.5 && e < 14 ? WEST.niche : focus ? WEST.frame : W.hermes ? [W.hermes.position.x, W.hermes.position.z] : [0, 0];
            W.aurelia.rotation.y += shortTurn(W.aurelia.rotation.y, faceYaw(look[0] - W.aurelia.position.x, look[1] - W.aurelia.position.z)) * Math.min(1, dt * 3);
          }
          W.aurelia.position.y = 0.02;
          if (W.aurelia.userData.update) W.aurelia.userData.update(t);
          if (W.aurelia.userData.lampAt) { W.aurelia.userData.lampAt.getWorldPosition(W.lampLight.position); }
          W.lampLight.intensity = focus ? 0.8 : 0.45;   // shaded under her cloak while the raiders might see it
        }
        // the rings: how much of the whisper reaches him
        const c = focus ? 0 : clarity();
        W.rings.forEach((r, i) => {
          const k = rm ? (i + 1) / 3 : ((t * 0.6 + i / 3) % 1);
          const s = 0.35 + k * 1.1;
          r.scale.set(s, s, s);
          if (W.hermes) r.position.set(W.hermes.position.x, 0.03, W.hermes.position.z);
          r.material.opacity = c * (1 - k) * 0.75;
        });
        // the paths of the whisper, only once he stands on the pin; a burst of gold for each bell
        W.rayBurst = Math.max(0, W.rayBurst - dt * 0.55);
        const base = focus && !done ? 0.28 : 0;
        const want = rm ? 0 : Math.min(1, base + W.rayBurst);
        W.rayK += (want - W.rayK) * Math.min(1, dt * 3);
        W.rayMat.opacity = W.rayK;
        W.rayGold = Math.max(0, W.rayGold - dt * 0.6);
        W.rayMat.color.setRGB(0.75 + 0.25 * W.rayGold, 0.88 - 0.02 * W.rayGold, 1 - 0.45 * W.rayGold);
        if (W.rayK > 0.01) {
          const o = [0, 0];
          W.rays.forEach((r, i) => {
            r.u += dt * r.sp;
            if (r.u > 1) { r.u -= 1; r.th = Math.random() * Math.PI * 2; }
            rayPoint(r.th, r.u, W.rayDir, o);
            W.rayPos[i * 3] = o[0]; W.rayPos[i * 3 + 1] = r.y; W.rayPos[i * 3 + 2] = o[1];
          });
          W.rayGeo.attributes.position.needsUpdate = true;
        }
        // the bells swing when they ring
        [W.west, W.east].forEach((sh) => sh.bells.forEach((b) => {
          const a = (now - b.t) / 1000;
          b.pivot.rotation.x = a >= 0 && a < 1.6 && !rm ? Math.sin(a * 14) * 0.32 * Math.exp(-a * 2.6) : 0;
          b.halo.material.opacity = a >= 0 && a < 1.2 ? 0.8 * Math.exp(-a * 3) : 0;
        }));
        // the win: the plate sinks, the little door swings open on Fragment III, the Ashes slip away
        const e = sinceWin(now);
        W.plateSink += ((done ? 1 : 0) - W.plateSink) * Math.min(1, dt * 2);
        W.west.plate.position.y = 0.02 - 0.03 * W.plateSink;
        W.west.plate.visible = focus;
        const open = done ? (e >= 99 ? 1 : clamp((e - 1.2) / 1.6, 0, 1)) : 0;
        W.doorOpen = open;
        W.west.hinge.rotation.y = -ease(open) * 1.9;
        const shine = done ? clamp((e - 1.8) / 1.4, 0, 1) : 0;
        W.west.nicheGlow.material.opacity = 0.4 * shine * (rm ? 1 : 0.85 + 0.15 * Math.sin(t * 2.2));
        W.west.nicheLight.intensity = 1.1 * shine;
        if (W.west.shard) W.west.shard.rotation.y = rm ? 0 : Math.sin(t * 0.8) * 0.22 * shine;
        const gone = done ? (e >= 99 ? 1 : clamp((e - 5) / 3, 0, 1)) : 0;
        W.raiders.forEach((r, i) => {
          const g = r.g;
          g.visible = gone < 0.999;
          if (!g.visible) return;
          if (gone > 0) {
            // they turn toward the sound, and walk off into the dark beyond the east columns
            const out = [AW + 0.6, (i ? 1.6 : -1.6)];
            g.position.x = r.home[0] + (out[0] - r.home[0]) * gone; g.position.z = r.home[1] + (out[1] - r.home[1]) * gone;
            g.rotation.y += shortTurn(g.rotation.y, faceYaw(out[0] - r.home[0], out[1] - r.home[1])) * Math.min(1, dt * 4);
            g.traverse((o) => { if (o.isMesh) o.material.opacity = 1 - gone; });
          } else if (!rm) {
            g.rotation.z = Math.sin(t * 0.9 + r.ph) * 0.025;   // bent over the embers, murmuring
          }
        });
        W.coals.material.opacity = (0.75 + (rm ? 0 : 0.2 * Math.sin(t * 7) * Math.sin(t * 3.1))) * (1 - 0.8 * gone);
        W.emberLight.intensity = (1.5 + (rm ? 0 : 0.35 * Math.sin(t * 6.3))) * (1 - 0.8 * gone);
        // a little dust in the lamplight
        if (W.dust && !rm) {
          W.dustAcc += dt * (W.lowPower ? 5 : 10);
          const n = Math.floor(W.dustAcc); W.dustAcc -= n;
          for (let i = 0; i < n; i++) {
            const x = (Math.random() - 0.5) * AW * 1.6, z = (Math.random() - 0.5) * BW * 1.6;
            W.dust.emit({ x, y: 0.4 + Math.random() * 2.6, z }, 1, { color: 0xd8d0e0, size: [0.01, 0.025], speed: [0, 0.03], up: [-0.01, 0.02], gravity: 0, drag: 0.2, life: [3, 6], alpha: 0.3, fadeIn: 0.6, spread: 0.05 });
          }
        }
        if (W.fx) W.fx.frame(dt, W.camera);
        if (W.dust) W.dust.update(dt, W.camera, W.renderer);
        placeCamera(dt, now, false);
        if (W.fx) W.fx.render(W.scene, W.camera, dt); else W.renderer.render(W.scene, W.camera);
        if (W.adapt) W.adapt(dt); else if (P.fitSpeed) W.adapt = P.fitSpeed(W.renderer);
      }
      function frame(ts) {
        if (!W || modal.style.display === 'none') return;
        const dt = lastT ? Math.min(0.05, (ts - lastT) / 1000) : 0.016;
        lastT = ts;
        drawFrame(ts, dt);
        raf = requestAnimationFrame(frame);
      }
      function fit() {
        if (!W || !el.stage) return;
        const w = el.stage.clientWidth || 800, h = el.stage.clientHeight || 450;
        W.renderer.setSize(w, h, false);
        W.camera.aspect = w / Math.max(1, h);
        W.camera.updateProjectionMatrix();
      }

      // ---- The moments the scene acts out ----
      const react = (kind) => { if (W && W.fx && W.fx.gait) W.fx.gait.react(kind); };
      const aureliaDoes = (kind) => { if (W && W.aurelia && W.aurelia.userData.react) W.aurelia.userData.react(kind); };
      function subtitle(text, secs, kind) {
        if (!el.subtitle) return;
        el.subtitle.textContent = text;
        el.subtitle.classList.toggle('is-act', kind === 'act');
        el.subtitle.classList.add('is-on');
        clearTimeout(subtitle.t);
        subtitle.t = setTimeout(() => el.subtitle.classList.remove('is-on'), (secs || 4.5) * 1000);
      }
      function sceneFocus() {
        view.focusT = performance.now();
        react('wonder');
        if (W) { W.rayDir = 1; W.rayBurst = 1.4; W.rayGold = 0; }
        aureliaDoes('nod');
        subtitle('Hermes stops on a bronze plate that rings hollow. From every wall at once, the raiders\' words arrive at his ear.', 5, 'act');
      }
      function sceneBell(i, fromEast) {
        if (!W) return;
        const b = (fromEast ? W.east : W.west).bells[i];
        if (b) b.t = performance.now();
        W.rayDir = fromEast ? 1 : -1;
        W.rayBurst = Math.min(1.2, W.rayBurst + 0.55);
        W.rayGold = 1;
      }
      function sceneTune() {
        subtitle('Across the hall the bells by the raiders ring by themselves: six notes, and the gallery carries every one of them to Hermes.', 5, 'act');
      }
      function sceneMiss() {
        react('worry');
        aureliaDoes('shake');
      }
      function sceneWin() {
        view.winT = performance.now();
        react('wonder');
        if (W) { W.rayDir = -1; W.rayBurst = 1.6; W.rayGold = 1; if (W.fx) W.fx.shake.add(0.02); }
        subtitle('The last bell fades. Under Hermes\'s boots the bronze plate sinks a finger\'s width, and the little door in the wall swings open.', 4.8, 'act');
        setTimeout(() => {
          if (!W || modal.style.display === 'none') return;
          const n = WEST.niche;
          if (W.fx) W.fx.triumph({ x: n[0] + WEST.inward[0] * 0.3, y: NICHE_Y, z: n[1] + WEST.inward[1] * 0.3 }, 0.7);
        }, reduced() ? 0 : 2200);
        view.endTimers.forEach(clearTimeout);
        view.endTimers = [
          setTimeout(() => { if (modal.style.display !== 'none') subtitle('Far across the hall, the two Ashes lift their heads toward the sound, and slip away into the dark.', 4.6, 'act'); }, reduced() ? 4800 : 5000),
          setTimeout(() => { if (modal.style.display !== 'none') { aureliaDoes('offer'); subtitle('Inside the little door, in Aurelia\'s old hand, one line for the Ledger. She traces it with her finger and says nothing.', 5.5, 'act'); } }, reduced() ? 9800 : 9800)
        ];
      }


      // ---- Open / close ----
      const pause = () => (window.EclipseStagePause ? window.EclipseStagePause.remaining(NODE) : 0);
      const sealFace = () => (window.EclipseSheetSeals ? window.EclipseSheetSeals.missing(NODE) : '');
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        return get('order_camera_obscura_completed') === 'true' && !pause() && !sealFace();
      }
      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('gallery3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('gallery3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-gallery-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
      }
      const focusTarget = () => (isDone() ? el.done : atFocus() ? (el.bells && el.bells.children[0]) : el.plan);
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-gallery-howto-back'), hn = $('btn-gallery-howto-next'), hs = $('btn-gallery-howto-skip');
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
        e.preventDefault();
      }
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
        lockHubScroll(true);
        modal.addEventListener('wheel', stopHubScroll, { passive: false });
        modal.addEventListener('touchmove', stopHubScroll, { passive: false });
        returnFocusTo = document.activeElement;
        if (!W && el.stage3d) W = buildWorld();
        if (W) bindPointer();
        if (W && !cine && el.stage && P.cinema) {
          cine = P.cinema(el.stage, {
            reduced,
            onShot: (i, sh) => { if (sh.line) subtitle(sh.line, sh.dur - 0.4); if (i === 0) cue('whoosh', { dur: 1.8 }); }
          });
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !W);
        if (W && 'ResizeObserver' in window && !el.stage.__galleryFit) { el.stage.__galleryFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        view.snapNext = true; view.phase = ''; view.focusT = 0; view.winT = 0;
        view.endTimers.forEach(clearTimeout); view.endTimers = [];
        if (W) { W.cam.p = null; W.cam.dist = W.cam.tDist = 1; W.aSpot = null; W.aMove = null; W.rayBurst = 0; }
        if (el.fade) el.fade.classList.remove('is-on');
        if (el.speaker && window.EclipseMirrorSpeaker) window.EclipseMirrorSpeaker.render(NODE, el.speaker);
        entered = [];
        paintEntered();
        pos = atFocus() ? listenAt.slice() : START.slice();
        paintHermes();
        if (isDone()) { applyVictory(); say("We sleep tonight by the west pin, Silvia, wrapped in our coats on the cold floor. Every now and then Aurelia whispers something toward the east end, and it comes back to us, small and clear. She will not tell me what she says."); }
        else if (atFocus()) say("I am still standing on the west pin, Silvia, and the bells are still waiting. The raiders played the tune note for note and their niche stayed shut. Ring them for me.");
        else say("Silvia, the second stair ended in a hall with no corners at all: a long oval of columns, cold as a church. Somewhere in the dark at the far end two of the Ashes are whispering, and I cannot hear a word. Aurelia says the Order laid this gallery out with two pins and a string, and that a whisper at one pin is heard at the other. Open the page “The Whispering Gallery”, please. Tell me where to stand.");
        render();
        syncWorld();
        setTimeout(mood, 700);   // the bed starts on its next poll (600 ms) and resets the intensity to 0.5
        const finishOpen = () => {
          if (get(HOWTO_KEY) !== 'seen' && !isDone()) { showHowto(0); return; }
          const target = focusTarget();
          if (target) setTimeout(() => { if (modal.style.display !== 'none') target.focus({ preventScroll: true }); }, 60);
        };
        lastT = 0;
        cancelAnimationFrame(raf);
        if (W) raf = requestAnimationFrame(frame);
        if (W && cine && !reduced() && !isDone() && !atFocus() && get(CINE_INTRO) !== 'seen') {
          set(CINE_INTRO, 'seen');
          cine.start(openingShots(), finishOpen);
        } else finishOpen();
      }
      function closeGalleryModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (cine && cine.active) cine.skip();
        hush();
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
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeGalleryModal();
      }, true);


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
        clarity, atFocus, tune: TUNE.slice(), mirror: MIRROR.slice(), listenAt: listenAt.slice(), raidersAt: raidersAt.slice(),
        gfx: () => W,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!W) return { gl: false };
          const r2 = (v) => +v.toFixed(2);
          return {
            gl: true, phase: view.phase, post: !!(W.fx && W.fx.post),
            hermes: W.hermes ? [r2(W.hermes.position.x), r2(W.hermes.position.z)] : null,
            aurelia: W.aurelia ? [r2(W.aurelia.position.x), r2(W.aurelia.position.z)] : null,
            rays: r2(W.rayK), plate: W.west.plate.visible, door: r2(W.doorOpen),
            raiders: W.raiders.filter((r) => r.g.visible).length, ghost: false
          };
        },
        // where a 3D point of the hall lies on the screen (for the smoke to click the floor and the bells)
        screenOf: (x, y, z) => {
          if (!W) return null;
          W.camera.updateMatrixWorld();
          const v = new W.T.Vector3(x, y, z).project(W.camera), r = el.stage.getBoundingClientRect();
          return [Math.round(r.left + (v.x + 1) / 2 * r.width), Math.round(r.top + (1 - v.y) / 2 * r.height)];
        },
        bellAt: (i) => { if (!W) return null; const p = new W.T.Vector3(); W.west.bells[i].bell.getWorldPosition(p); return [p.x, p.y - 0.12, p.z]; },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) drawFrame(performance.now() + i * 33, 1 / 30); },
        settle: () => { view.focusT = 0; view.winT = 0; view.snapNext = true; syncWorld(); if (W) { W.cam.p = null; W.aMove = null; } }
      };
    })();
