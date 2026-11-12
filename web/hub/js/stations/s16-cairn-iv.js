
    // =========================================================================
    // 🗿 STATION 16 · CAIRN IV, SENTRY OF THE CANYON (THE SONG OF THE PILLARS · SHEET 15A)
    // Part I (journal): the seven-letter sigil wakes the pillars.
    // Part II (web only): the night wind plays three verses. Each call leaves a pillar and comes back from a
    // fissure of its own cliff after one beat per 5 paces (Sheet 15A). Silvia marks, in order, the fissure
    // of every echo, by ear (real Web Audio, panned left and right) or by the chronograph tape.
    // Every verse was checked offline to decode in exactly one way (verse III overlaps its echoes;
    // the length of each echo tells them apart). Reward: the Seal of Cairn IV, two Ledger equations
    // and the Tuning Pebble.
    // It is played in 3D: the gorge by moonlight, the twin pillars and the sixteen fissures in the cliffs.
    // The scene shows each call and each echo at its pillar, never the fissure that answered: that stays
    // for her ears and the tape.
    // =========================================================================
    (function initSongOfThePillars() {
      const modal = document.getElementById('modal-cairn-four');
      if (!modal) return;
      const sfx = window.sfx || null;
      // The game's own Sound switch silences these too (the old generic sounds then play as before)
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(soundOn() && a && a.sfx && a.sfx(kind, o)); };
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const KEYS = {
        awake: 'order_cairn4_awake',
        done: 'order_cairn_iv_completed',
        verses: 'order_cairn4_verses',
        fails: 'order_cairn4_key_fails',
        hint: 'order_cairn4_hint',
        songFails: 'order_cairn4_song_fails',
        countHint: 'order_cairn4_count_hint',
        sound: 'order_cairn4_sound'
      };
      const HOWTO_KEY = 'order_cairn4_howto', CINE_INTRO = 'order_cairn4_cine_intro';
      const SIGIL = 'RESOUND';
      const PACES_PER_BEAT = 5;

      // The carved letters of Sheet 15A, by cliff and distance in paces
      const WALLS = {
        L: { 25: 'T', 30: 'S', 35: 'A', 40: 'M', 45: 'U', 50: 'L', 55: 'E', 60: 'C' },
        R: { 25: 'N', 30: 'B', 35: 'G', 40: 'R', 45: 'P', 50: 'D', 55: 'H', 60: 'O' }
      };
      const RINGS = [25, 30, 35, 40, 45, 50, 55, 60];
      const SIDE_NAME = { L: 'Left', R: 'Right' };
      // Three verses: when each call leaves (beat), from which pillar, how long, and which fissure answers
      const VERSES = [
        { word: 'SUN', beatMs: 560, calls: [
          { t: 0, side: 'L', len: 'short', d: 30 }, { t: 8, side: 'L', len: 'short', d: 45 }, { t: 19, side: 'R', len: 'short', d: 25 }] },
        { word: 'ECHO', beatMs: 470, calls: [
          { t: 0, side: 'L', len: 'short', d: 55 }, { t: 13, side: 'L', len: 'short', d: 60 }, { t: 27, side: 'R', len: 'short', d: 55 }, { t: 40, side: 'R', len: 'short', d: 60 }] },
        // the night wind: three short calls, a pause, two long ones, and the echoes overlap the calls
        { word: 'STONE', beatMs: 440, calls: [
          { t: 0, side: 'L', len: 'short', d: 30 }, { t: 2, side: 'L', len: 'short', d: 25 }, { t: 4, side: 'R', len: 'short', d: 60 },
          { t: 8, side: 'R', len: 'long', d: 25 }, { t: 11, side: 'L', len: 'long', d: 55 }] }
      ];
      const LEN_BEATS = { short: 0.5, long: 2 };
      const fissureId = (side, d) => side + d;
      VERSES.forEach((v) => { v.answer = v.calls.map((c) => fissureId(c.side, c.d)); });

      const FOUNDERS = [
        'We tuned these stones before the first road was cut, and we never let them fall silent.',
        'The sun measures the day; the echo measures the distance;',
        'and the stone remembers them both. SUN · ECHO · STONE: so the Order measures the world.'
      ];
      const VERSE_DISPATCH = [
        "SUN. The first verse is ours, Silvia, and where the cliffs answered, a line of the founders is carved into the rock. The pillars are breathing faster now.",
        "ECHO. Eleven beats, twelve beats... you heard a difference my old ears could not. The wind is rising for the last verse: it will not wait for one echo before it calls again."
      ];

      const el = {
        close: $('btn-close-pillars'), sigilCard: $('pillars-sigil-card'), keyInput: $('pillars-key-input'), speak: $('btn-pillars-speak'),
        keyFeedback: $('pillars-key-feedback'), game: $('pillars-game'), gameInner: document.querySelector('#pillars-game .monolith-game-inner'),
        tabs: $('pillars-verse-tabs'), sound: $('btn-pillars-sound'), plan: $('pillars-plan'), tape: $('pillars-tape'), tapeWrap: $('pillars-tape-wrap'),
        tapeStatus: $('pillars-tape-status'), play: $('btn-pillars-play'), modeMark: $('btn-pillars-mode-mark'), modeCall: $('btn-pillars-mode-call'),
        slots: $('pillars-slots'), undo: $('btn-pillars-undo'), sing: $('btn-pillars-sing'), songFeedback: $('pillars-song-feedback'),
        hint: $('pillars-hint'), words: $('pillars-words'), fragments: $('pillars-fragments'), victory: $('pillars-victory'),
        victoryText: $('pillars-victory-text'), finish: $('btn-pillars-finish'), dispatch: $('pillars-dispatch-text'),
        stage: $('pillars3d-stage'), canvas: $('pillars3d-canvas'), subtitle: $('pillars3d-subtitle'), fade: $('pillars3d-fade'),
        aim: $('pillars3d-aim'), versesLabel: $('pillars3d-verses'), howto: $('pillars3d-howto'), help: $('btn-pillars-howto')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const versesSung = () => (isDone() ? VERSES.length : Math.max(0, Math.min(VERSES.length, parseInt(get(KEYS.verses) || '0', 10) || 0)));
      const countHintOn = () => get(KEYS.countHint) === 'true';
      const soundOn = () => get(KEYS.sound) !== 'off';

      // Hints climb three levels (hub/js/hint-ladder.js); level 2 is the older help of each part
      const hints = window.EclipseHints;
      const sigilHints = hints.define({
        id: 's16-sigil', station: 'Station 16', title: 'the sigil of the seven echoes', group: 'desert',
        anchor: el.keyFeedback, solved: isAwake, legacyKey: KEYS.hint,
        texts: [
          'Every echo in the log on the page “Cairn IV: Sentry of the Canyon” gives one letter. Its pillar tells you which cliff to look at, and its beats tell you how far.',
          'I wrote down how an echo becomes a letter. It is in Ask Hermes, under the question about turning the echoes into letters.',
          'Let us take the first echo of the log together: the Right pillar, 8 beats. Right pillar, right cliff. Each beat is 5 paces, so 8 beats are 40 paces. On the right cliff, at the ring of 40 paces, the carved letter is R. Now the second echo, the same way.'
        ]
      });
      const songHints = hints.define({
        id: 's16-song', station: 'Station 16', title: 'the song of the pillars', group: 'desert',
        anchor: el.songFeedback, solved: isDone, active: isAwake, legacyKey: KEYS.countHint,
        texts: [
          'Every call comes back from a fissure of its own cliff. Count the beats from the moment a pillar calls until its voice comes back, and every beat is 5 paces.',
          'I have numbered the beats on the tape for you. My note on counting by ear is in Ask Hermes: "How do I count an echo by ear?"',
          'Let us take the first call of the first verse together. The Left pillar calls on beat 0, and its echo comes back on beat 6: six beats are 30 paces, so the first fissure is Left, 30. Go on call by call. When echoes cross, remember that a long call comes back long.'
        ],
        onLevel: (n) => { if (n >= 2 && tape) drawTape(tape.raf ? 0 : Infinity); }
      });

      let verseIdx = Math.min(versesSung(), VERSES.length - 1);
      let mode = 'mark';
      let slots = [];

      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
      function feedback(node, text, kind) {
        if (!node) return;
        node.textContent = text;
        node.classList.toggle('is-error', kind === 'error');
        node.classList.toggle('is-ok', kind === 'ok');
      }
      function subtitle(text, secs, kind) {
        if (!el.subtitle) return;
        el.subtitle.textContent = text;
        el.subtitle.classList.toggle('is-act', kind === 'act');
        el.subtitle.classList.add('is-on');
        clearTimeout(subtitle.t);
        subtitle.t = setTimeout(() => el.subtitle.classList.remove('is-on'), (secs || 4.5) * 1000);
      }
      const svgEl = (tag, attrs) => {
        const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
        return n;
      };
      const svgText = (x, y, text, attrs) => {
        const t = svgEl('text', Object.assign({ x, y, 'text-anchor': 'middle' }, attrs || {}));
        t.textContent = text;
        return t;
      };

      // ---- Sound: each pillar has its own voice; echoes come back quieter and more muffled from far away ----
      const VOICE_HZ = { L: 196.0, R: 293.66 };   // G3 and D4
      let audio = null;
      function ensureAudio() {
        if (!soundOn()) return null;
        try {
          if (sfx && typeof sfx.init === 'function') sfx.init();
          let ctx = sfx && sfx.ctx;
          if (!ctx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            ctx = (audio && audio.ctx) || new Ctx();
          }
          if (ctx.state !== 'running' && typeof ctx.resume === 'function') Promise.resolve(ctx.resume()).catch(() => {});
          if (!audio || audio.ctx !== ctx) {
            const master = ctx.createGain();
            master.gain.value = 0.9;
            master.connect(ctx.destination);
            const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            const data = noise.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            audio = { ctx, master, noise, live: [] };
          }
          return audio;
        } catch (e) { return null; }
      }
      function voice(at, side, seconds, distance) {
        const { ctx, master, noise } = audio;
        const far = distance ? (distance - 25) / 35 : 0;
        const level = distance ? 0.2 - 0.1 * far : 0.42;   // an echo is at least 6 dB softer than its call
        const out = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = distance ? 1200 - 800 * far : 6000;   // and duller, the farther the fissure
        let tail = lp;
        if (ctx.createStereoPanner) {
          const pan = ctx.createStereoPanner();
          pan.pan.value = (side === 'L' ? -1 : 1) * (distance ? 0.9 : 0.6);
          lp.connect(pan);
          tail = pan;
        }
        tail.connect(master);
        out.connect(lp);
        const release = distance ? 0.55 : 0.25;
        out.gain.setValueAtTime(0.0001, at);
        out.gain.exponentialRampToValueAtTime(level, at + 0.03);
        out.gain.setValueAtTime(level, at + Math.max(0.04, seconds - 0.05));
        out.gain.exponentialRampToValueAtTime(0.0001, at + seconds + release);
        const f = VOICE_HZ[side];
        [[f, 'sine', 1], [f * 2, 'triangle', 0.22], [f * 3.01, 'sine', 0.08]].forEach(([hz, type, g]) => {
          const o = ctx.createOscillator();
          const og = ctx.createGain();
          o.type = type;
          o.frequency.setValueAtTime(hz, at);
          og.gain.value = g;
          o.connect(og); og.connect(out);
          o.start(at); o.stop(at + seconds + release + 0.05);
          audio.live.push(o);
        });
        // the breath of the wind in the call
        const n = ctx.createBufferSource();
        n.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = f * 4; bp.Q.value = 3;
        const ng = ctx.createGain(); ng.gain.value = distance ? 0.05 : 0.16;
        n.connect(bp); bp.connect(ng); ng.connect(out);
        n.start(at); n.stop(at + seconds + release);
        audio.live.push(n);
      }
      function tickSound(at) {
        const { ctx, master } = audio;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = 1900;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.07, at + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
        o.connect(g); g.connect(master);
        o.start(at); o.stop(at + 0.05);
        audio.live.push(o);
      }
      function silence() {
        if (!audio) return;
        audio.live.forEach((n) => { try { n.stop(); } catch (e) {} });
        audio.live = [];
      }

      // ---- The chronograph tape (along the top of the scene) ----
      const BEAT_PX = 14, TAPE_PAD = 12, TAPE_H = 96;
      let tape = null;   // { events, beats, beatMs, label, start, raf, beatNow }
      function eventsOf(calls) {
        const evs = [];
        calls.forEach((c, i) => {
          evs.push({ beat: c.t, kind: 'call', side: c.side, len: c.len, n: i + 1, d: c.d });
          evs.push({ beat: c.t + c.d / PACES_PER_BEAT, kind: 'echo', side: c.side, len: c.len, d: c.d });
        });
        return evs.sort((a, b) => a.beat - b.beat);
      }
      function drawTape(nowBeat) {
        const svg = el.tape;
        if (!svg) return;
        svg.textContent = '';
        const beats = tape ? tape.beats : 24;
        const width = TAPE_PAD * 2 + beats * BEAT_PX;
        svg.setAttribute('viewBox', `0 0 ${width} ${TAPE_H}`);
        svg.setAttribute('width', String(width));
        const xb = (b) => TAPE_PAD + b * BEAT_PX;
        svg.appendChild(svgEl('line', { x1: 0, y1: TAPE_H / 2, x2: width, y2: TAPE_H / 2, stroke: '#8a6d3b', 'stroke-width': 0.6 }));
        for (let b = 0; b <= beats; b++) {
          svg.appendChild(svgEl('line', { x1: xb(b), y1: TAPE_H / 2 - 5, x2: xb(b), y2: TAPE_H / 2 + 5, stroke: '#5c4524', 'stroke-width': 0.8 }));
          if (countHintOn()) svg.appendChild(svgText(xb(b), TAPE_H / 2 + 13, String(b), { 'font-size': 11, fill: '#7c5a32' }));
        }
        if (!tape) return;
        tape.events.forEach((ev) => {
          if (nowBeat !== Infinity && ev.beat > nowBeat) return;
          const top = ev.side === 'L';
          const y = top ? 10 : TAPE_H - 30;
          const w = Math.max(5, LEN_BEATS[ev.len] * BEAT_PX);
          const color = top ? '#b45309' : '#0f766e';
          if (ev.kind === 'call') {
            svg.appendChild(svgEl('rect', { x: xb(ev.beat), y, width: w, height: 20, rx: 2, fill: color }));
            if (tape.events.length > 2) svg.appendChild(svgText(xb(ev.beat) + w / 2, y + 28, String(ev.n), { 'font-size': 11, fill: color, 'font-weight': 700 }));
          } else {
            svg.appendChild(svgEl('rect', { x: xb(ev.beat), y: y + 2, width: w, height: 16, rx: 2, fill: 'none', stroke: color, 'stroke-width': 1.6 }));
          }
        });
        if (nowBeat !== Infinity) svg.appendChild(svgEl('line', { x1: xb(nowBeat), y1: 2, x2: xb(nowBeat), y2: TAPE_H - 2, stroke: '#dc2626', 'stroke-width': 1 }));
      }
      let record = null;   // the last verse heard to the end: a test call plays over it, then gives it back
      function stopTape() {
        const unfinished = !!(tape && tape.raf);
        if (unfinished) cancelAnimationFrame(tape.raf);
        silence();
        if (unfinished) {
          tape.raf = null;
          tape = record;   // what was never heard is not on the tape
          if (el.tapeStatus) el.tapeStatus.textContent = record ? record.label + ' · recorded' : 'Stopped';
          drawTape(Infinity);
          setMood();
        }
        if (G) G.orbs.forEach((o) => { o.on = false; o.m.visible = false; });
      }
      function playCalls(calls, beatMs, label, isTest) {
        stopTape();
        const events = eventsOf(calls);
        const last = events.reduce((m, ev) => Math.max(m, ev.beat + LEN_BEATS[ev.len]), 0);
        tape = { events, beats: Math.ceil(last) + 2, beatMs, label, isTest: !!isTest, raf: null, start: performance.now() + 120, audio: null, seen: -1, beatSeen: -1 };
        const a = ensureAudio();
        if (a) {
          const t0 = a.ctx.currentTime + 0.12;
          const beatSec = beatMs / 1000;
          for (let b = 0; b <= tape.beats; b++) tickSound(t0 + b * beatSec);
          events.forEach((ev) => voice(t0 + ev.beat * beatSec, ev.side, LEN_BEATS[ev.len] * beatSec, ev.kind === 'echo' ? ev.d : 0));
          tape.audio = { ctx: a.ctx, t0, beatSec };
        }
        if (el.tapeStatus) el.tapeStatus.textContent = label + ' · playing…';
        // The cursor follows the sound itself (audio clock minus output latency, e.g. Bluetooth), or the page clock when muted
        const cur = tape;
        cur.beatNow = () => {
          const au = cur.audio;
          if (au && au.ctx.state === 'running') return (au.ctx.currentTime - au.t0 - (au.ctx.outputLatency || 0)) / au.beatSec;
          return (performance.now() - cur.start) / cur.beatMs;
        };
        const frame = () => {
          const beat = cur.beatNow();
          drawTape(Math.max(0, beat));
          if (el.tapeWrap) {
            const x = TAPE_PAD + beat * BEAT_PX - el.tapeWrap.clientWidth * 0.6;
            if (x > el.tapeWrap.scrollLeft) el.tapeWrap.scrollLeft = x;
          }
          if (beat < cur.beats) { cur.raf = requestAnimationFrame(frame); return; }
          cur.raf = null;
          drawTape(Infinity);
          setMood();
          if (el.tapeStatus) el.tapeStatus.textContent = label + ' · recorded';
          if (!cur.isTest) { record = cur; return; }
          // a test call stays on the tape for a moment, then the verse's record comes back
          setTimeout(() => {
            if (tape !== cur || !record) return;
            tape = record;
            drawTape(Infinity);
            if (el.tapeStatus) el.tapeStatus.textContent = record.label + ' · recorded';
          }, 2500);
        };
        if (el.tapeWrap) el.tapeWrap.scrollLeft = 0;
        cur.raf = requestAnimationFrame(frame);
        setMood();
      }
      function playVerse() {
        if (!isAwake()) return;
        const v = VERSES[verseIdx];
        playCalls(v.calls, v.beatMs, 'Verse ' + ['I', 'II', 'III'][verseIdx]);
        subtitle('The night wind finds the pillars. Count the beats from each call to its echo.', 3.5, 'act');
      }
      function testCall(side, d) {
        playCalls([{ t: 1, side, len: 'short', d }], VERSES[verseIdx].beatMs, 'Test call · ' + SIDE_NAME[side] + ' cliff, ' + d + ' paces', true);
        subtitle('Hermes shouts at the ' + SIDE_NAME[side].toLowerCase() + ' cliff, ' + d + ' paces away, and counts.', 3, 'act');
      }

      // ---- The canyon plan (in the panel, for the keyboard and for a quick look) ----
      const PLAN = { wallL: 14, wallR: 106, baseY: 128 };
      const ringY = (d) => PLAN.baseY - (d - 20) * 2.6;
      function revealed() {
        const ids = new Set();
        VERSES.slice(0, versesSung()).forEach((v) => v.answer.forEach((id) => ids.add(id)));
        return ids;
      }
      function drawPlan() {
        const svg = el.plan;
        if (!svg) return;
        svg.textContent = '';
        const shown = revealed();
        svg.appendChild(svgEl('path', { d: `M${PLAN.wallL} 6 L${PLAN.wallL} 136`, stroke: '#d4a853', 'stroke-width': 1.6 }));
        svg.appendChild(svgEl('path', { d: `M${PLAN.wallR} 6 L${PLAN.wallR} 136`, stroke: '#d4a853', 'stroke-width': 1.6 }));
        RINGS.forEach((d) => {
          const y = ringY(d);
          svg.appendChild(svgEl('path', { d: `M${PLAN.wallL} ${y + 7} Q 60 ${y - 9} ${PLAN.wallR} ${y + 7}`, fill: 'none', stroke: '#b8a07a', 'stroke-opacity': 0.45, 'stroke-width': 0.5 }));
          svg.appendChild(svgText(60, y - 3.6, String(d), { 'font-size': 4.2, fill: '#d6c3a0' }));
        });
        [['L', 50], ['R', 70]].forEach(([side, x]) => {
          svg.appendChild(svgEl('rect', { x: x - 4, y: PLAN.baseY, width: 8, height: 8, fill: '#3b2a17', stroke: side === 'L' ? '#f59e0b' : '#2dd4bf', 'stroke-width': 0.9 }));
          svg.appendChild(svgText(x, 142, SIDE_NAME[side], { 'font-size': 3.8, fill: '#d6c3a0' }));
        });
        ['L', 'R'].forEach((side) => {
          RINGS.forEach((d) => {
            const id = fissureId(side, d);
            const y = ringY(d) + 7;
            const x = side === 'L' ? PLAN.wallL : PLAN.wallR;
            const g = svgEl('g', { class: 'pillars-fissure', tabindex: '0', role: 'button', 'data-id': id, 'aria-label': SIDE_NAME[side] + ' cliff, ' + d + ' paces' + (shown.has(id) ? ', letter ' + WALLS[side][d] : '') });
            g.appendChild(svgEl('path', { d: `M${x} ${y - 3} l${side === 'L' ? 3 : -3} 1.5 l${side === 'L' ? -3 : 3} 1.5 l${side === 'L' ? 3 : -3} 1.5`, fill: 'none', stroke: '#0b0704', 'stroke-width': 1.2 }));
            const tx = side === 'L' ? x - 8 : x + 8;
            g.appendChild(svgEl('rect', { class: 'pillars-tag', x: tx - 4.5, y: y - 4.5, width: 9, height: 9, rx: 1, fill: shown.has(id) ? 'rgba(134, 239, 172, 0.18)' : '#1a120a', stroke: side === 'L' ? '#f59e0b' : '#2dd4bf', 'stroke-width': 0.5 }));
            g.appendChild(svgText(tx, y + 1.8, shown.has(id) ? WALLS[side][d] : '?', { 'font-size': 5, fill: shown.has(id) ? '#86efac' : '#b8a07a' }));
            g.appendChild(svgEl('rect', { x: side === 'L' ? 0 : x - 10, y: y - 6.4, width: side === 'L' ? x + 10 : 120 - x + 10, height: 12.8, fill: 'transparent' }));
            svg.appendChild(g);
          });
        });
      }

      // ---- The gorge in 3D. The pillars stand at the origin; north (up the gorge) is -z; a pace is PACE units ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const PACE = 0.5, CW = 6.2, CLIFF_H = 15, PILLAR_X = 2.5, PILLAR_H = 6.4;
      const fz = (d) => -d * PACE;
      const sideX = (side) => (side === 'L' ? -1 : 1);
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, ending: 0, overview: false, hover: null, sigilT: 0, dawn: 0, opened: 0 };

      function cliffGeometry(T, side) {
        // a rock face, its bands of sandstone, and a deep crack wherever a fissure answers
        const len = 56, z0 = 8, segZ = 224, segY = 30, s = sideX(side), rnd = P.rng(side === 'L' ? 1601 : 1602);
        const noise = (SC.noise && SC.noise.fbm) ? SC.noise.fbm : null;
        const geo = new T.PlaneGeometry(len, CLIFF_H + 2, segZ, segY);
        const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
        const cracks = RINGS.map((d) => fz(d));
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i), v = pos.getY(i);
          const z = z0 - (u + len / 2), y = v + (CLIFF_H + 2) / 2 - 1;
          const n1 = noise ? noise(z * 0.18, y * 0.22, side === 'L' ? 7 : 13, 4) : Math.sin(z * 0.7) * 0.5 + 0.5;
          const n2 = noise ? noise(z * 0.9, y * 0.9, side === 'L' ? 21 : 29, 2) : 0.5;
          let x = CW + (n1 - 0.5) * 1.6 + (n2 - 0.5) * 0.35 + Math.max(0, y - CLIFF_H * 0.7) * 0.18 + (y < 0.6 ? (0.6 - y) * 0.5 : 0);
          let shade = 0.82 + (n2 - 0.5) * 0.3;
          cracks.forEach((cz) => {
            const k = Math.max(0, 1 - Math.abs(z - cz) / 0.62);
            if (k > 0 && y < 10.5) {
              const top = Math.min(1, (10.5 - y) / 1.6);
              x += 2.4 * k * k * top;
              shade *= 1 - 0.85 * k * top;
            }
          });
          pos.setXYZ(i, s * x, y, z);
          col[i * 3] = shade; col[i * 3 + 1] = shade * 0.97; col[i * 3 + 2] = shade * 0.98;
        }
        geo.setAttribute('color', new T.BufferAttribute(col, 3));
        // the face looks into the gorge
        if (side === 'R') { const idx = geo.index.array; for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; } }
        geo.computeVertexNormals();
        return geo;
      }
      function plaqueTex(T, side, d, known) {
        return P.canvasTex(128, 160, (g, w, h) => {
          g.clearRect(0, 0, w, h);
          g.fillStyle = known ? 'rgba(60,36,12,0.92)' : 'rgba(26,18,12,0.85)';
          g.strokeStyle = known ? '#fcd34d' : (side === 'L' ? 'rgba(245,158,11,0.75)' : 'rgba(45,212,191,0.75)');
          g.lineWidth = 6;
          g.beginPath(); g.moveTo(10, 8); g.lineTo(w - 10, 8); g.lineTo(w - 4, h - 44); g.lineTo(4, h - 44); g.closePath(); g.fill(); g.stroke();
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = known ? '#fff2b0' : '#c9b48a';
          g.font = '700 70px Georgia, serif';
          g.fillText(known ? WALLS[side][d] : '?', w / 2, (h - 44) / 2 + 6);
          g.fillStyle = 'rgba(14,10,8,0.8)'; g.fillRect(24, h - 38, w - 48, 34);
          g.fillStyle = '#e8dcc0'; g.font = '700 26px Georgia, serif';
          g.fillText(d + ' paces', w / 2, h - 20);
        });
      }
      function numberTex(n, color) {
        return P.canvasTex(64, 64, (g, w) => {
          g.clearRect(0, 0, w, w);
          g.fillStyle = color; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 3, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#fff7d6'; g.lineWidth = 3; g.stroke();
          g.fillStyle = '#1a120a'; g.font = '700 34px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(String(n), w / 2, w / 2 + 2);
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
        const NIGHT = { top: new T.Color(0x060a1c), mid: new T.Color(0x14204a), low: new T.Color(0x2a3260), fog: new T.Color(0x0c1230) };
        const DAWN = { top: new T.Color(0x1c2a5a), mid: new T.Color(0x6a5a8a), low: new T.Color(0xe89a6a), fog: new T.Color(0x4a4060) };
        scene.fog = new T.Fog(NIGHT.fog.getHex(), 30, 92);
        const camera = new T.PerspectiveCamera(46, 16 / 10, 0.3, 800);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });

        // ---- The sky: a dome from deep blue overhead to a paler band low in the north, stars, the moon ----
        const skyGeo = new T.SphereGeometry(400, 32, 18);
        const skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
        skyGeo.setAttribute('color', new T.BufferAttribute(skyCol, 3));
        const sky = new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
        sky.renderOrder = -10;
        scene.add(sky);
        const paintSky = (k) => {
          const p = skyGeo.attributes.position, c = new T.Color(), a = new T.Color(), b = new T.Color();
          for (let i = 0; i < p.count; i++) {
            const y = p.getY(i) / 400, north = Math.max(0, -p.getZ(i) / 400);
            const h = Math.max(0, y);
            a.copy(NIGHT.low).lerp(DAWN.low, k * (0.4 + 0.6 * north));
            b.copy(NIGHT.mid).lerp(DAWN.mid, k);
            c.copy(NIGHT.top).lerp(DAWN.top, k);
            const out = h < 0.25 ? a.clone().lerp(b, h / 0.25) : b.clone().lerp(c, Math.min(1, (h - 0.25) / 0.6));
            skyCol[i * 3] = out.r; skyCol[i * 3 + 1] = out.g; skyCol[i * 3 + 2] = out.b;
          }
          skyGeo.attributes.color.needsUpdate = true;
          scene.fog.color.copy(NIGHT.fog).lerp(DAWN.fog, k);
        };
        paintSky(0);
        const starsV = new Float32Array(1600 * 3), sr = P.rng(1616);
        for (let i = 0; i < 1600; i++) {
          const a = sr() * Math.PI * 2, y = 0.12 + Math.pow(sr(), 0.7) * 0.88, rr = Math.sqrt(1 - y * y);
          starsV.set([Math.cos(a) * rr * 330, y * 330, Math.sin(a) * rr * 330], i * 3);
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
        moon.scale.set(64, 64, 1); moon.position.set(-90, 150, -260);
        scene.add(moon);
        const hemi = new T.HemisphereLight(0x6a7cc8, 0x1a1626, 0.3);
        scene.add(hemi);
        const moonLight = new T.DirectionalLight(0xbccbff, 0.62);
        moonLight.position.set(-14, 40, -26);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(moonLight.shadow.camera, { left: -26, right: 26, top: 30, bottom: -30, near: 1, far: 120 });
        moonLight.shadow.bias = -0.0008;
        moonLight.target.position.set(0, 0, -16);
        scene.add(moonLight); scene.add(moonLight.target);

        // ---- The floor of the gorge, the cliffs, and the mesa tops beyond them ----
        const sand = SC.tex.sand(16), sandMap = sand.map.clone(), sandBump = sand.bump.clone();
        [sandMap, sandBump].forEach((t) => { t.needsUpdate = true; t.repeat.set(5, 18); });
        const floor = new T.Mesh(new T.PlaneGeometry(CW * 2 + 4, 70), paint({ map: sandMap, bumpMap: sandBump, bumpScale: 0.8, color: 0x6c6474 }));
        floor.rotation.x = -Math.PI / 2; floor.position.z = -26; floor.receiveShadow = true; scene.add(floor);
        const outside = new T.Mesh(new T.PlaneGeometry(500, 500), paint({ color: 0x241e2e }));
        outside.rotation.x = -Math.PI / 2; outside.position.y = -0.05; outside.receiveShadow = true; scene.add(outside);
        const strata = SC.tex.strata(16).clone();
        strata.needsUpdate = true; strata.wrapS = strata.wrapT = T.RepeatWrapping; strata.repeat.set(6, 1.2);
        const cliffMat = paint({ map: strata, vertexColors: true, color: 0x7a6e82, side: T.DoubleSide }, 0x8ea0ff, 0.1);
        const cliffs = ['L', 'R'].map((side) => {
          const m = new T.Mesh(cliffGeometry(T, side), cliffMat);
          m.castShadow = true; m.receiveShadow = true; scene.add(m);
          return m;
        });
        ['L', 'R'].forEach((side) => {
          const top = new T.Mesh(new T.PlaneGeometry(60, 60), paint({ color: 0x1e1a28 }));
          top.rotation.x = -Math.PI / 2; top.position.set(sideX(side) * (CW + 1.2 + 30), CLIFF_H + 0.9, -20); top.receiveShadow = true; scene.add(top);
        });
        // the gorge closes far to the north in a jumble of fallen rock
        const rockMat = paint({ map: SC.tex.strata(9), color: 0x6a6074 }, 0x8ea0ff, 0.1);
        const fallen = new T.Group();
        const rr = P.rng(166);
        for (let i = 0; i < 14; i++) {
          const s = 1.2 + rr() * 2.6;
          const r = new T.Mesh(new T.DodecahedronGeometry(s, 0), rockMat);
          r.position.set((rr() - 0.5) * CW * 2, s * 0.45, -38 - rr() * 8); r.rotation.set(rr() * 3, rr() * 3, 0); r.castShadow = true; r.receiveShadow = true; fallen.add(r);
        }
        scene.add(fallen);

        // ---- The pace rings: a line of small stones across the gorge every 5 paces, a cut number at the centre ----
        const pebbleGeo = new T.DodecahedronGeometry(0.11, 0);
        const ringStones = new T.InstancedMesh(pebbleGeo, paint({ color: 0x9a92a0 }), RINGS.length * 24);
        const dmy = new T.Object3D(), pr = P.rng(1617);
        let ni = 0;
        RINGS.forEach((d) => {
          for (let i = 0; i < 24; i++) {
            const x = -CW + 0.8 + (i / 23) * (CW * 2 - 1.6);
            if (Math.abs(x) < 0.7) continue;
            dmy.position.set(x, 0.06, fz(d) + (pr() - 0.5) * 0.12); dmy.rotation.set(pr() * 3, pr() * 3, 0); dmy.scale.setScalar(0.7 + pr() * 0.6); dmy.updateMatrix();
            ringStones.setMatrixAt(ni++, dmy.matrix);
          }
        });
        ringStones.count = ni; ringStones.receiveShadow = true; scene.add(ringStones);
        const ringLabels = RINGS.map((d) => {
          const m = new T.Mesh(new T.PlaneGeometry(1.1, 0.55), new T.MeshBasicMaterial({ map: P.canvasTex(128, 64, (g, w, h) => {
            g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(20,14,10,0.55)'; g.fillRect(8, 6, w - 16, h - 12);
            g.fillStyle = '#e8dcc0'; g.font = '700 34px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d), w / 2, h / 2 + 2);
          }), transparent: true, depthWrite: false }));
          m.rotation.x = -Math.PI / 2; m.position.set(0, 0.08, fz(d)); scene.add(m);
          return m;
        });

        // ---- The sixteen fissures: a carved plaque above each crack, and an invisible target for her clicks ----
        const fissures = [];
        const hitMat = new T.MeshBasicMaterial({ visible: false });
        ['L', 'R'].forEach((side) => {
          RINGS.forEach((d) => {
            const s = sideX(side), z = fz(d);
            const id = fissureId(side, d);
            const plaque = new T.Mesh(new T.PlaneGeometry(1.05, 1.31), new T.MeshBasicMaterial({ map: plaqueTex(T, side, d, false), transparent: true, depthWrite: false, toneMapped: false }));
            plaque.position.set(s * (CW - 0.95), 3.9, z + 0.95);
            plaque.rotation.y = -s * Math.PI / 2 * 0.72;
            scene.add(plaque);
            const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: side === 'L' ? 0xffb35a : 0x5ef0d8, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
            glow.scale.set(2.2, 6, 1); glow.position.set(s * (CW + 0.6), 3.2, z); scene.add(glow);
            // the targets tile the cliff face without overlapping, so a slanting look still picks the right one
            const hit = new T.Mesh(new T.BoxGeometry(0.5, 8, PACE * 5 * 0.98), hitMat);
            hit.position.set(s * (CW - 0.5), 4, z); hit.userData.id = id; scene.add(hit);
            fissures.push({ id, side, d, plaque, glow, hit, known: false, flash: 0 });
          });
        });

        // ---- The twin pillars: hollow, taller than three men, a throat open to the north, the bronze plate between ----
        const pillarMat = paint({ map: SC.tex.strata(4), color: 0x8e8090, side: T.DoubleSide }, 0x8ea0ff, 0.14);
        const pillars = {};
        ['L', 'R'].forEach((side) => {
          const g = new T.Group();
          const shaft = new T.Mesh(new T.CylinderGeometry(0.95, 1.2, PILLAR_H, 18, 6, true), pillarMat);
          shaft.position.y = PILLAR_H / 2; shaft.castShadow = true; shaft.receiveShadow = true; g.add(shaft);
          const inner = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 0.3, 18, 1, true), paint({ color: 0x120c10, side: T.DoubleSide }));
          inner.position.y = PILLAR_H - 0.12; g.add(inner);
          const lip = new T.Mesh(new T.TorusGeometry(0.8, 0.17, 6, 20), pillarMat); lip.rotation.x = Math.PI / 2; lip.position.y = PILLAR_H; lip.castShadow = true; g.add(lip);
          [1.2, 3.6].forEach((y) => { const band = new T.Mesh(new T.TorusGeometry(1.12 - y * 0.03, 0.07, 5, 24), paint({ color: 0x8a6a40 })); band.rotation.x = Math.PI / 2; band.position.y = y; g.add(band); });
          // the throat: a dark mouth facing up the gorge, where the wind goes in
          const throat = new T.Mesh(new T.CircleGeometry(0.42, 18), new T.MeshBasicMaterial({ color: 0x05030a }));
          throat.scale.set(0.8, 1.6, 1); throat.position.set(0, 4.7, -1.06); throat.rotation.y = Math.PI; throat.rotation.x = -0.08; g.add(throat);
          const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: side === 'L' ? 0xffb35a : 0x5ef0d8, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          glow.scale.set(2.6, 3.6, 1); glow.position.set(0, 4.7, -1.2); g.add(glow);
          const light = new T.PointLight(side === 'L' ? 0xffa64a : 0x4ae8d0, 0, 12, 1.6); light.position.set(0, 4.7, -1.6); g.add(light);
          g.position.set(sideX(side) * PILLAR_X, 0, 0);
          scene.add(g);
          pillars[side] = { g, glow, light, level: 0, target: 0 };
        });
        const plinth = new T.Mesh(new T.BoxGeometry(1.5, 0.9, 0.7), pillarMat); plinth.position.set(0, 0.45, 0.2); plinth.castShadow = true; plinth.receiveShadow = true; scene.add(plinth);
        const bronzeMat = new T.MeshStandardMaterial({ color: 0xa8743a, metalness: 0.75, roughness: 0.38, emissive: 0xff9a40, emissiveIntensity: 0.06 });
        const plate = new T.Mesh(new T.BoxGeometry(1.1, 0.62, 0.06), bronzeMat); plate.position.set(0, 0.62, 0.58); plate.rotation.x = -0.25; scene.add(plate);
        const beatLamp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffe2a0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        beatLamp.scale.set(0.8, 0.8, 1); beatLamp.position.set(0, 1.05, 0.62); scene.add(beatLamp);
        const chamberLight = new T.PointLight(0xffc06a, 0, 8, 1.6); chamberLight.position.set(0, 1.2, 0.4); scene.add(chamberLight);
        const seal = new T.Sprite(new T.SpriteMaterial({ map: P.canvasTex(128, 128, (g, w) => {
          g.clearRect(0, 0, w, w);
          const gr = g.createRadialGradient(w / 2, w / 2, 6, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,230,160,1)'); gr.addColorStop(0.45, 'rgba(255,200,110,0.6)'); gr.addColorStop(1, 'rgba(255,180,80,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
          g.fillStyle = '#7a4a1a'; g.beginPath(); g.arc(w / 2, w / 2, 22, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#ffe8b0'; g.font = '700 26px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('IV', w / 2, w / 2 + 1);
        }), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
        seal.scale.set(1.2, 1.2, 1); seal.position.set(0, 1.1, 0.4); scene.add(seal);
        const pebble = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xfff0b0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        pebble.scale.set(0.7, 0.7, 1); pebble.position.set(-PILLAR_X + 0.15, 4.5, -1.15); scene.add(pebble);

        // ---- The voice made visible: rings that spread over the sand when a pillar calls, fainter when its echo comes home ----
        const ringGeo = new T.RingGeometry(0.92, 1, 72); ringGeo.rotateX(-Math.PI / 2);
        const waves = Array.from({ length: 14 }, () => {
          const m = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          m.position.y = 0.1; m.visible = false; m.renderOrder = 3; scene.add(m);
          return { m, t: 0, life: 1, max: 1, alpha: 1, on: false };
        });
        // a test call: a spark flies from the pillar to the chosen fissure and back
        const orbs = Array.from({ length: 2 }, () => {
          const m = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          m.scale.set(0.9, 0.9, 1); m.visible = false; scene.add(m);
          return { m, on: false };
        });
        // her marks: a numbered token at the foot of each fissure she names
        const markers = [];
        const markerTex = {};

        // ---- Hermes, his lamp turned low ----
        let H = null;
        try {
          H = P.buildHermes(T, glowTex);
          H.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          H.hermes.position.set(0, 0, 2.4);
          scene.add(H.hermes);
        } catch (e) { H = null; }
        const lamp = new T.PointLight(0xffc27a, 1.4, 7, 1.6); scene.add(lamp);

        let fx = null;
        try {
          if (window.EclipseFX) fx = window.EclipseFX.kit(renderer, scene, H, {
            look: { bloom: 0.66, threshold: 0.86, knee: 0.16, vignette: 0.36, grain: 0.03, ca: 0.14, sat: 1.02, contrast: 1.04, gain: [0.98, 1.0, 1.05], shade: 0.22, shadeColor: [0.5, 0.58, 0.95] },
            sandColor: 0x8a8090, printColor: 0x2a2234, printLife: 30, scale: 1, wind: [0.2, 0, 1.4],
            ambient: () => ({ x: 0, z: -14 }), ambientRadius: 12, ambientAlpha: 0.06, ambientColor: 0x9a9ab8, ambientEvery: 0.18
          });
        } catch (e) { fx = null; }

        return { T, renderer, scene, camera, lowPower, sky, paintSky, stars, moon, hemi, moonLight, cliffs, fissures, pillars, plate, bronzeMat, beatLamp, chamberLight,
          seal, pebble, waves, orbs, markers, markerTex, ringLabels, H, hermes: H && H.hermes, lamp, fx,
          ray: new T.Raycaster(), hits: fissures.map((f) => f.hit),
          cam: { yaw: 0, pitch: 0.46, dist: 30, tYaw: 0, tPitch: 0.46, tDist: 30, p: null, l: null }, dawnShown: -1 };
      }

      // ---- Keeping the scene in step with the game ----
      function syncWorld() {
        if (!G) return;
        const shown = revealed();
        G.fissures.forEach((f) => {
          const known = shown.has(f.id);
          if (known !== f.known) {
            f.known = known;
            const old = f.plaque.material.map;
            f.plaque.material.map = plaqueTex(G.T, f.side, f.d, known);
            f.plaque.material.needsUpdate = true;
            if (old) old.dispose();
            if (known && !view.snapNext) f.flash = 1;
          }
        });
        placeMarkers();
        view.snapNext = false;
      }
      function placeMarkers() {
        if (!G) return;
        const T = G.T, counts = {};
        G.markers.forEach((m) => { m.visible = false; });
        if (!isAwake() || isDone()) return;
        slots.forEach((id, i) => {
          const f = G.fissures.find((x) => x.id === id);
          if (!f) return;
          let m = G.markers[i];
          if (!m) {
            m = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthWrite: false, toneMapped: false }));
            m.scale.set(0.75, 0.75, 1);
            G.scene.add(m);
            G.markers[i] = m;
          }
          const key = (f.side) + (i + 1);
          if (!G.markerTex[key]) G.markerTex[key] = numberTex(i + 1, f.side === 'L' ? '#f59e0b' : '#2dd4bf');
          if (m.material.map !== G.markerTex[key]) { m.material.map = G.markerTex[key]; m.material.needsUpdate = true; }
          const n = counts[id] = (counts[id] || 0) + 1;
          m.position.set(sideX(f.side) * (CW - 1.3 - (n - 1) * 0.8), 0.6, fz(f.d) + 0.2);
          if (m.visible === false && !m.userData.born) m.userData.born = performance.now();
          m.visible = true;
        });
      }
      function wave(side, strength, echo) {
        if (!G) return;
        const w = G.waves.find((x) => !x.on) || G.waves[0];
        w.on = true; w.t = 0; w.life = echo ? 1.1 : 1.8; w.max = echo ? 4 : 11; w.alpha = echo ? 0.32 : 0.7 * strength;
        w.m.material.color.setHex(side === 'L' ? 0xffb35a : 0x5ef0d8);
        w.m.position.x = sideX(side) * PILLAR_X; w.m.position.z = echo ? -0.6 : -0.9;
        w.m.visible = true;
      }
      // the scene follows the tape, beat by beat: the plate's lamp on each beat, the pillar's throat on each call and echo
      function followTape() {
        if (!G || !tape || !tape.raf || !tape.beatNow) return;
        const beat = tape.beatNow();
        const whole = Math.floor(beat);
        if (whole > tape.beatSeen && whole >= 0) { tape.beatSeen = whole; G.beatFlash = 1; }
        tape.events.forEach((ev, i) => {
          if (ev.beat > beat || (tape.fired && tape.fired[i])) return;
          (tape.fired || (tape.fired = []))[i] = true;
          const p = G.pillars[ev.side];
          if (ev.kind === 'call') { p.burst = 1; p.hold = LEN_BEATS[ev.len] * tape.beatMs / 1000; wave(ev.side, 1, false); if (G.fx && G.fx.gait && i === 0 && !tape.isTest) G.fx.gait.react('wonder'); }
          else { p.echo = 1; p.echoHold = LEN_BEATS[ev.len] * tape.beatMs / 1000; wave(ev.side, 0.5, true); }
          if (tape.isTest && ev.kind === 'call') {
            const o = G.orbs[0];
            o.on = true; o.from = { x: sideX(ev.side) * PILLAR_X, y: 4.7, z: -1.2 }; o.to = { x: sideX(ev.side) * (CW - 0.2), y: 3.4, z: fz(ev.d) };
            o.t0 = ev.beat; o.t1 = ev.beat + ev.d / PACES_PER_BEAT; o.m.material.color.setHex(ev.side === 'L' ? 0xffc27a : 0x7ef5e2); o.m.visible = true;
          }
        });
        G.orbs.forEach((o) => {
          if (!o.on) return;
          const u = (beat - o.t0) / (o.t1 - o.t0);
          if (u >= 1) { o.on = false; o.m.visible = false; return; }
          const k = u < 0.5 ? u * 2 : (1 - u) * 2, e = k * k * (3 - 2 * k);
          o.m.position.set(o.from.x + (o.to.x - o.from.x) * e, o.from.y + (o.to.y - o.from.y) * e + Math.sin(e * Math.PI) * 1.2, o.from.z + (o.to.z - o.from.z) * e);
          if (u >= 0.5 && !o.bounced) { o.bounced = true; const f = G.fissures.find((x) => x.side === (o.to.x < 0 ? 'L' : 'R') && Math.abs(fz(x.d) - o.to.z) < 0.01); if (f) f.flash = Math.max(f.flash, 0.7); }
          if (u < 0.5) o.bounced = false;
        });
      }

      // ---- The camera: from behind the pillars, up the gorge; she can turn it a little, raise it, come closer ----
      function bindPointer() {
        const c = el.canvas;
        if (!c || c.__pillarsPointer) return;
        c.__pillarsPointer = true;
        c.style.touchAction = 'none';
        const pt = { down: false, x: 0, y: 0, moved: 0 };
        c.addEventListener('pointerdown', (e) => { pt.down = true; pt.x = e.clientX; pt.y = e.clientY; pt.moved = 0; try { c.setPointerCapture(e.pointerId); } catch (err) {} });
        c.addEventListener('pointermove', (e) => {
          if (pt.down) {
            const dx = e.clientX - pt.x, dy = e.clientY - pt.y;
            pt.moved += Math.abs(dx) + Math.abs(dy);
            if (G && pt.moved > 4) {
              G.cam.tYaw = Math.max(-0.55, Math.min(0.55, G.cam.tYaw - dx * 0.004));
              G.cam.tPitch = Math.max(0.1, Math.min(1.1, G.cam.tPitch + dy * 0.004));
            }
            pt.x = e.clientX; pt.y = e.clientY;
          } else setHover(fissureUnder(e));
        });
        c.addEventListener('pointerup', (e) => {
          if (!pt.down) return;
          pt.down = false;
          if (pt.moved > 6 || !G) return;
          const f = fissureUnder(e);
          if (f && isAwake() && !isDone() && !busyOverlay()) chooseFissure(f.id);
        });
        c.addEventListener('pointercancel', () => { pt.down = false; });
        c.addEventListener('pointerleave', () => setHover(null));
        c.addEventListener('wheel', (e) => { if (!G) return; e.preventDefault(); G.cam.tDist = Math.max(12, Math.min(44, G.cam.tDist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
        c.addEventListener('dblclick', () => { if (G) { G.cam.tYaw = 0; G.cam.tPitch = 0.46; G.cam.tDist = 30; } });
      }
      function fissureUnder(e) {
        if (!G || !isAwake() || isDone()) return null;
        const r = el.canvas.getBoundingClientRect();
        const ndc = new G.T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        G.ray.setFromCamera(ndc, G.camera);
        const hit = G.ray.intersectObjects(G.hits, false)[0];
        return hit ? G.fissures.find((f) => f.id === hit.object.userData.id) : null;
      }
      function setHover(f) {
        view.hover = f || null;
        if (el.canvas) el.canvas.style.cursor = f ? 'pointer' : '';
        if (!el.aim) return;
        if (f) {
          el.aim.textContent = (mode === 'call' ? '📣 Test call: ' : '✎ Mark: ') + SIDE_NAME[f.side] + ' cliff, ' + f.d + ' paces' + (f.known ? ' · ' + WALLS[f.side][f.d] : '');
          el.aim.classList.add('is-on');
        } else el.aim.classList.remove('is-on');
      }
      function placeCamera(dt, snap) {
        const cam = G.camera, c = G.cam;
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else if (!isAwake()) { p = [3.4, 4.2, 8.2]; l = [0, 1.6, -0.5]; }
        // the end: first the chamber between the pillars, then the gorge at first light with the pillars in front
        else if (view.ending === 1) { p = [3.2, 2.8, 6.4]; l = [0, 1.7, 0]; }
        else if (isDone()) { p = [0, 8.5, 15]; l = [0, 3, -12]; }
        else {
          const k = Math.min(1, dt * 5);
          c.yaw += (c.tYaw - c.yaw) * k; c.pitch += (c.tPitch - c.pitch) * k; c.dist += (c.tDist - c.dist) * k;
          const tx = 0, ty = 2.6, tz = -17;
          p = [tx + Math.sin(c.yaw) * Math.cos(c.pitch) * c.dist, ty + Math.sin(c.pitch) * c.dist, tz + Math.cos(c.yaw) * Math.cos(c.pitch) * c.dist];
          l = [tx, ty, tz];
        }
        if (!c.p || snap) { c.p = p.slice(); c.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * (view.ending === 1 ? 2.2 : isDone() ? 0.8 : 3.2));
          for (let i = 0; i < 3; i++) { c.p[i] += (p[i] - c.p[i]) * k; c.l[i] += (l[i] - c.l[i]) * k; }
        }
        cam.position.set(c.p[0], c.p[1], c.p[2]);
        cam.lookAt(c.l[0], c.l[1], c.l[2]);
      }
      function openingShots() {
        return [
          { from: { p: [0, 40, 30], l: [0, 0, -18] }, to: { p: [0, 30, 16], l: [0, 0, -20] }, dur: 6, kicker: 'STATION 16', title: 'CAIRN IV', line: 'Midnight at the southern mouth of the gorge. The night wind comes down between the cliffs.' },
          { from: { p: [3.5, 5, -10], l: [-CW, 3.5, -22] }, to: { p: [2.5, 4.5, -18], l: [-CW, 3.5, -30] }, dur: 5.5, line: 'Sixteen dark fissures in the rock. Each one answers a call, after its own count of beats.' },
          { from: { p: [0.5, 9, -7], l: [0, 4, 0] }, to: { p: [2.6, 3.4, 6.5], l: [0, 2, 0] }, dur: 5.5, line: 'Two hollow pillars, taller than three men, and the wind already humming inside them.' }
        ];
      }

      // ---- The frame ----
      function tick(now, dt) {
        if (!G) return;
        const t = now / 1000, rm = reduced();
        followTape();
        ['L', 'R'].forEach((side) => {
          const p = G.pillars[side];
          if (p.hold > 0) p.hold -= dt; else p.burst = Math.max(0, (p.burst || 0) - dt * 3);
          if (p.echoHold > 0) p.echoHold -= dt; else p.echo = Math.max(0, (p.echo || 0) - dt * 2.4);
          const hum = isAwake() && !isDone() ? 0.08 + (rm ? 0 : 0.04 * Math.sin(t * 1.3 + (side === 'L' ? 0 : 2))) : isDone() ? 0.18 : 0;
          const lvl = Math.max(hum, (p.burst || 0), (p.echo || 0) * 0.45);
          p.glow.material.opacity = Math.min(1, lvl * 1.1);
          p.glow.scale.set(2.6 * (1 + 0.3 * (p.burst || 0)), 3.6 * (1 + 0.3 * (p.burst || 0)), 1);
          p.light.intensity = lvl * 3.2;
        });
        G.beatFlash = Math.max(0, (G.beatFlash || 0) - dt * 5);
        G.beatLamp.material.opacity = (G.beatFlash || 0) * 0.95;
        G.waves.forEach((w) => {
          if (!w.on) return;
          w.t += dt;
          const u = w.t / w.life;
          if (u >= 1) { w.on = false; w.m.visible = false; return; }
          const s = 1 + (w.max - 1) * (1 - Math.pow(1 - u, 2));
          w.m.scale.set(s, 1, s);
          w.m.material.opacity = w.alpha * (1 - u);
        });
        G.fissures.forEach((f) => {
          const hot = view.hover === f;
          f.flash = Math.max(0, f.flash - dt * 0.5);
          f.glow.material.opacity = Math.min(0.9, f.flash * 0.9 + (hot ? 0.35 : 0) + (f.known ? 0.12 + (rm ? 0 : 0.05 * Math.sin(t * 2 + f.d)) : 0));
          const sc = 1 + (hot ? 0.12 : 0) + f.flash * 0.2;
          f.plaque.scale.set(sc, sc, 1);
        });
        G.markers.forEach((m) => {
          if (!m.visible) return;
          const age = m.userData.born ? (now - m.userData.born) / 1000 : 1;
          const pop = rm ? 1 : Math.min(1, age * 4);
          m.scale.setScalar(0.75 * (pop < 1 ? 1 + Math.sin(pop * Math.PI) * 0.4 : 1));
          m.position.y = 0.6 + (rm ? 0 : Math.sin(t * 2.4 + m.position.z) * 0.05);
        });
        // the end: the plate sinks into the plinth, the chamber glows, the seal rises, the pebble shines, and dawn comes
        const done = isDone();
        const ok = done ? Math.min(1, (view.opened || 0) + dt / (rm ? 0.01 : 2.4)) : 0;
        view.opened = ok;
        G.plate.position.y = 0.62 - 0.55 * ok;
        G.chamberLight.intensity = 2.6 * ok;
        G.seal.material.opacity = ok;
        G.seal.position.y = 1.1 + 0.9 * ok + (rm ? 0 : Math.sin(t * 1.6) * 0.06 * ok);
        G.pebble.material.opacity = done ? (0.45 + (rm ? 0 : 0.35 * Math.sin(t * 3.1))) * ok : 0;
        G.bronzeMat.emissiveIntensity = isAwake() ? 0.12 + (view.sigilT ? Math.max(0, 1 - (now - view.sigilT) / 2200) * 0.8 : 0) : 0.06 + (rm ? 0 : 0.04 * Math.sin(t * 2));
        const dawnTarget = done ? Math.min(1, versesSung() / 3) * 0.75 : versesSung() * 0.08;
        view.dawn += (dawnTarget - view.dawn) * Math.min(1, dt * (rm ? 50 : 0.35));
        if (Math.abs(view.dawn - G.dawnShown) > 0.004) {
          G.dawnShown = view.dawn;
          G.paintSky(view.dawn);
          G.stars.material.opacity = 0.9 * (1 - view.dawn * 0.85);
          G.hemi.intensity = 0.3 + view.dawn * 0.45;
          G.moonLight.color.setHex(0xbccbff).lerp(new G.T.Color(0xffd0b0), view.dawn * 0.6);
        }
        if (G.hermes) {
          if (G.H && G.H.flame) G.H.flame.getWorldPosition(G.lamp.position); else G.lamp.position.set(G.hermes.position.x, 1.4, G.hermes.position.z);
          G.lamp.intensity = 1.3 + (rm ? 0 : Math.sin(t * 11) * 0.08);
          G.hermes.rotation.y = !isAwake() ? Math.PI * 0.08 : 0;
        }
        if (G.fx) G.fx.frame(dt, G.camera);
        placeCamera(dt, false);
        if (G.fx) G.fx.render(G.scene, G.camera, dt); else G.renderer.render(G.scene, G.camera);
        if (G.adapt) G.adapt(dt); else if (P.fitSpeed) G.adapt = P.fitSpeed(G.renderer);
      }
      function frame(t) {
        if (!G || modal.style.display === 'none') return;
        const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
        lastT = t;
        tick(t, dt);
        raf = requestAnimationFrame(frame);
      }
      function fit() {
        if (!G || !el.stage) return;
        const w = el.stage.clientWidth || 800, h = el.stage.clientHeight || 450;
        G.renderer.setSize(w, h, false);
        G.camera.aspect = w / Math.max(1, h);
        G.camera.updateProjectionMatrix();
      }

      // ---- Marking and singing back ----
      function chooseFissure(id) {
        if (!isAwake() || isDone()) return;
        const side = id[0], d = parseInt(id.slice(1), 10);
        if (mode === 'call') { testCall(side, d); return; }
        const need = VERSES[verseIdx].answer.length;
        if (slots.length >= need) { feedback(el.songFeedback, 'This verse has ' + need + ' echoes. Remove one (⌫) or sing it back.', 'error'); return; }
        slots.push(id);
        // A short echo on the fissure's ring; only a tick while a verse plays, so the real echoes stay clear
        const marked = tape && tape.raf ? cue('tick', { f: 1600, v: 0.06 }) : cue('echo', { deg: RINGS.indexOf(d) + (side === 'L' ? 3 : 7), n: 1, v: 0.05 });
        if (!marked && sfx && sfx.playChimeHover) sfx.playChimeHover();
        feedback(el.songFeedback, '', '');
        if (G) { const f = G.fissures.find((x) => x.id === id); if (f) f.flash = Math.max(f.flash, 0.45); }
        renderSlots();
      }
      function renderSlots() {
        if (el.slots) {
          el.slots.textContent = '';
          const need = VERSES[verseIdx].answer.length;
          for (let i = 0; i < need; i++) {
            const div = document.createElement('div');
            const id = slots[i];
            div.className = 'pillars-slot' + (id ? ' is-filled' : '');
            div.textContent = id ? SIDE_NAME[id[0]][0] + ' · ' + id.slice(1) : 'Call ' + (i + 1);
            el.slots.appendChild(div);
          }
          if (el.sing) el.sing.disabled = slots.length !== need || isDone();
          if (el.undo) el.undo.disabled = !slots.length;
        }
        placeMarkers();
      }
      function singBack() {
        if (!isAwake() || isDone()) return;
        const v = VERSES[verseIdx];
        if (slots.length !== v.answer.length) return;
        if (verseIdx < versesSung()) { feedback(el.songFeedback, 'The pillars already know this verse. Choose the next one.', ''); return; }
        const right = slots.filter((id, i) => id === v.answer[i]).length;
        if (right !== v.answer.length) {
          const fails = (parseInt(get(KEYS.songFails) || '0', 10) || 0) + 1;
          set(KEYS.songFails, String(fails));
          songHints.fail();
          if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.songFeedback, 'The pillars fall silent. ' + right + ' of ' + v.answer.length + ' echoes rang true.', 'error');
          if (G && G.fx) G.fx.blow(null, 0.25);
          subtitle('The pillars fall silent. ' + right + ' of ' + v.answer.length + ' echoes rang true.', 3);
          render();
          return;
        }
        set(KEYS.verses, String(verseIdx + 1));
        slots = [];
        stopTape();
        tape = null; record = null;
        drawTape(Infinity);
        if (el.tapeStatus) el.tapeStatus.textContent = '';
        if (!cue('shimmer', { deg: 14 + verseIdx * 2 }) && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback(el.songFeedback, v.word + '. The verse rings true.', 'ok');
        if (G) {
          if (G.fx) G.fx.triumph({ x: 0, y: 4, z: -1 }, 0.7);
          ['L', 'R'].forEach((s) => { G.pillars[s].burst = 1; G.pillars[s].hold = 0.6; wave(s, 1, false); });
        }
        subtitle('“' + FOUNDERS[verseIdx] + '”', 6, 'act');
        if (verseIdx + 1 >= VERSES.length) { completeStation(); return; }
        say(VERSE_DISPATCH[verseIdx]);
        verseIdx++;
        render();
      }

      function completeStation() {
        set(KEYS.done, 'true');
        cue('stone', { dur: 2.2 });
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.grantCairnSeal === 'function') window.grantCairnSeal(4);
        else set('order_seal_cairn_4', 'true');
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('tuning_pebble');
        say("STONE... and listen, Silvia. Listen to how the wind played that last verse: three short calls, a pause, two long ones. That is the code I engraved on Aurelia's disc. The same light I saw from the cliffs in 2016. And in the throat of the Left pillar there is a pebble that the river never put there.");
        if (G && !reduced()) {
          view.ending = 1; view.opened = 0;
          setTimeout(() => { if (G && G.fx) G.fx.triumph({ x: 0, y: 1.6, z: 0.4 }, 1); }, 900);
          setTimeout(() => { view.ending = 0; }, 4200);
          setTimeout(() => { subtitle('In the throat of the Left pillar, a river pebble painted with a gold star on blue.', 5, 'act'); }, 6200);
        }
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        if (el.finish) setTimeout(() => el.finish.focus({ preventScroll: true }), 60);
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "Cairn IV never fell: the bronze reeds inside the pillars are the founders' own, and the chamber between them opened the old way, with a song. The Seal of Cairn IV was waiting inside. But the last verse was not the founders' alone. Wedged in the throat of the Left pillar, where it bends the wind into three short calls and two long ones, Hermes found a river pebble painted with a small gold star on blue. He will tell you on the wire.";
        }
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
      }

      // ---- Part I: the sigil from Sheet 15A ----
      function speakSigil() {
        if (isAwake()) return;
        const typed = (el.keyInput ? el.keyInput.value : '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
        if (!typed) { feedback(el.keyFeedback, 'Type the seven letters from the page “Cairn IV: Sentry of the Canyon”.', 'error'); return; }
        if (typed !== SIGIL) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          if (G && G.fx) G.fx.blow(null, 0.2);
          feedback(el.keyFeedback, 'The pillars stay mute. Count the seven echoes on the page “Cairn IV: Sentry of the Canyon” again.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        cue('whoosh', { dur: 1.6 });
        if (!cue('echo', { deg: 7, n: 3, v: 0.08 }) && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'RESOUND. The wind finds its way into the pillars.', 'ok');
        say("RESOUND... and the pillars are singing, Silvia! Not a hum: calls, one pillar and then the other, and the cliffs answering. This cairn never fell; its voice is still whole. It sings its verses and wants them sung back. Count the echoes; I will mark the fissures you name.");
        subtitle('The bronze plate warms under his hand, and the pillars begin to sing.', 4.5, 'act');
        if (G) {
          view.sigilT = performance.now();
          ['L', 'R'].forEach((s, i) => setTimeout(() => { if (!G) return; G.pillars[s].burst = 1; G.pillars[s].hold = 0.5; wave(s, 1, false); }, i * 500));
          if (G.fx) G.fx.triumph({ x: 0, y: 1, z: 0.6 }, 0.6);
        }
        render();
        if (el.play) setTimeout(() => el.play.focus({ preventScroll: true }), 60);
      }

      function render() {
        const awake = isAwake(), done = isDone(), sung = versesSung();
        if (el.tabs) {
          el.tabs.textContent = '';
          VERSES.forEach((v, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chasm3d-btn pillars3d-tab' + (i < sung ? ' is-sung' : '');
            b.textContent = 'Verse ' + ['I', 'II', 'III'][i];
            b.setAttribute('aria-pressed', String(i === verseIdx));
            b.disabled = i > sung;
            b.addEventListener('click', () => {
              if (i === verseIdx) return;
              stopTape();
              tape = null; record = null;
              drawTape(Infinity);
              if (el.tapeStatus) el.tapeStatus.textContent = '';
              verseIdx = i; slots = []; render();
            });
            el.tabs.appendChild(b);
          });
        }
        if (el.sound) { el.sound.textContent = soundOn() ? '🔊 Sound' : '🔇 Sound off'; el.sound.setAttribute('aria-pressed', String(soundOn())); }
        if (el.modeMark) el.modeMark.setAttribute('aria-pressed', String(mode === 'mark'));
        if (el.modeCall) el.modeCall.setAttribute('aria-pressed', String(mode === 'call'));
        drawPlan();
        if (!tape || !tape.raf) drawTape(Infinity);
        renderSlots();
        if (el.words) {
          el.words.textContent = '';
          VERSES.forEach((v, i) => {
            const span = document.createElement('span');
            span.className = 'pillars-word' + (i < sung ? ' is-sung' : '');
            span.textContent = i < sung ? v.word : v.word.replace(/./g, '·');
            el.words.appendChild(span);
          });
        }
        if (el.fragments) {
          el.fragments.textContent = '';
          FOUNDERS.forEach((line, i) => {
            const div = document.createElement('div');
            div.className = 'monolith-fragment' + (i < sung ? '' : ' is-sealed');
            div.textContent = i < sung ? '“' + line + '”' : 'A line of the founders, still silent in the rock.';
            el.fragments.appendChild(div);
          });
        }
        if (el.versesLabel) el.versesLabel.textContent = done ? '✦ The chamber is open' : 'Verses ' + sung + ' / ' + VERSES.length;
        if (el.game) el.game.classList.toggle('is-locked', !awake);
        if (el.gameInner) el.gameInner.inert = !awake;
        if (el.game) el.game.style.display = done ? 'none' : '';
        if (el.sigilCard) el.sigilCard.classList.toggle('is-collapsed', awake);
        const spoken = 'Sigil spoken: ' + SIGIL + ' ✓';
        if (awake && el.keyFeedback && !el.keyFeedback.textContent) feedback(el.keyFeedback, spoken, 'ok');
        if (el.play) el.play.textContent = '▶ Let the wind play verse ' + ['I', 'II', 'III'][verseIdx];
        if (el.hint) el.hint.style.display = countHintOn() && !done ? '' : 'none';
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        if (el.stage) el.stage.classList.toggle('is-calling', mode === 'call');
        if (done || !awake) setHover(null);
        if (el.stage) el.stage.classList.toggle('no-tape', !awake || done);
        syncWorld();
        setMood();
        sigilHints.refresh(); songHints.refresh();
      }
      // The canyon music fills verse by verse, and thins right down while a verse plays so the echoes can be counted
      function setMood() {
        const amb = window.EclipseAmbience;
        if (!amb || !amb.intensity) return;
        if (amb.hush) amb.hush(!!(tape && tape.raf));
        if (tape && tape.raf) { amb.intensity(0.1); return; }
        amb.intensity(isDone() ? 0.6 : !isAwake() ? 0.3 : 0.35 + 0.08 * versesSung());
      }

      // ---- Controls ----
      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden);
      if (el.plan) {
        const pick = (e) => {
          const g = e.target.closest && e.target.closest('.pillars-fissure');
          if (g) chooseFissure(g.getAttribute('data-id'));
        };
        el.plan.addEventListener('click', pick);
        el.plan.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } });
      }
      if (el.play) el.play.addEventListener('click', playVerse);
      if (el.sound) el.sound.addEventListener('click', () => { set(KEYS.sound, soundOn() ? 'off' : 'on'); if (!soundOn()) silence(); render(); });
      if (el.modeMark) el.modeMark.addEventListener('click', () => { mode = 'mark'; render(); });
      if (el.modeCall) el.modeCall.addEventListener('click', () => { mode = 'call'; render(); });
      if (el.undo) el.undo.addEventListener('click', () => { if (slots.length) cue('tick', { f: 1300, v: 0.06 }); slots.pop(); renderSlots(); });
      if (el.sing) el.sing.addEventListener('click', singBack);
      if (el.speak) el.speak.addEventListener('click', speakSigil);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakSigil(); });

      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('pillars3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('pillars3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-pillars-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
      }
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = isDone() ? el.finish : isAwake() ? el.play : el.keyInput;
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-pillars-howto-back'), hn = $('btn-pillars-howto-next'), hs = $('btn-pillars-howto-skip');
      if (hb) hb.addEventListener('click', () => { if (howtoPage === 0) hideHowto(); else showHowto(howtoPage - 1); });
      if (hn) hn.addEventListener('click', () => { if (howtoPage >= 3) hideHowto(); else showHowto(howtoPage + 1); });
      if (hs) hs.addEventListener('click', hideHowto);

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_sandstone_labyrinth_completed') !== 'true') return false;
        return typeof window.isCairnFourMarchOver === 'function' ? window.isCairnFourMarchOver() : false;
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
        if (el.tapeWrap && el.tapeWrap.contains(e.target)) return;
        if (e.target === el.canvas) return;
        e.preventDefault();
      }
      function openCairnFourModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          if (get('order_sandstone_labyrinth_completed') !== 'true') {
            toast('✦ TERRA INCOGNITA ✦ Get Hermes out of the Sandstone Labyrinth (Station 15) before the road to Cairn IV opens.');
          } else if (typeof window.getCairnFourMarchEta === 'function' && window.getCairnFourMarchEta()) {
            toast('Hermes is crossing the hardpan toward Cairn IV. Arrival in ' + window.getCairnFourMarchEta() + '.');
          } else {
            toast('Hermes is hiding in the rocks until dark. Open the Cliffside Workshop: he will wire you before he sets out.');
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
        // without WebGL the plan from above is the game: open it
        if (!G && el.plan && el.plan.closest('details')) el.plan.closest('details').open = true;
        if (G && 'ResizeObserver' in window && !el.stage.__pillarsFit) { el.stage.__pillarsFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        view.snapNext = true; view.ending = 0; view.sigilT = 0;
        view.opened = isDone() ? 1 : 0;
        view.dawn = isDone() ? 0.75 : versesSung() * 0.08;
        if (G) { G.cam.p = null; G.dawnShown = -1; }
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I am at the southern mouth of the gorge. Two hollow pillars, taller than three men, and the wind already hums inside them. The bronze plate between them asks for the sigil of the seven echoes, the ones on the page “Cairn IV: Sentry of the Canyon” of your journal.");
        else say("The pillars are still singing. Let the wind play, count the echoes, and sing the verse back.");
        render();
        // The bed starts at its own level when the modal appears; set ours once it has
        setTimeout(setMood, 700);
        const finishOpen = () => {
          if (get(HOWTO_KEY) !== 'seen' && !isDone()) { showHowto(0); return; }
          const focusTarget = isDone() ? el.finish : isAwake() ? el.play : el.keyInput;
          if (focusTarget) setTimeout(() => { if (modal.style.display !== 'none') focusTarget.focus({ preventScroll: true }); }, 60);
        };
        lastT = 0;
        cancelAnimationFrame(raf);
        if (G) raf = requestAnimationFrame(frame);
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          set(CINE_INTRO, 'seen');
          cine.start(openingShots(), finishOpen);
        } else finishOpen();
      }
      function closeCairnFourModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopTape();
        if (cine && cine.active) cine.skip();
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openCairnFourModal = openCairnFourModal;
      window.closeCairnFourModal = closeCairnFourModal;
      if (el.close) el.close.addEventListener('click', closeCairnFourModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeCairnFourModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeCairnFourModal();
      }, true);
      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeCairnFourModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof window.showDesertToast === 'function') {
            let seals = 0;
            for (let i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) === 'true') seals++;
            window.showDesertToast('✦ Seal of Cairn IV secured (' + seals + ' of 5) ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
          }
        });
      }

      // Test hook for scripts/audit/web_smoke.py: the verses (they are in this source anyway), the controls and the scene
      window.__cairn4 = {
        verses: VERSES.map((v) => ({ word: v.word, beatMs: v.beatMs, calls: v.calls.map((c) => Object.assign({}, c)) })),
        letters: JSON.parse(JSON.stringify(WALLS)),
        verse: () => verseIdx,
        mark: (id) => chooseFissure(id),
        sing: () => singBack(),
        play: () => playVerse(),
        gfx: () => G,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          return {
            gl: true, fissures: G.fissures.length, known: G.fissures.filter((f) => f.known).map((f) => f.id).sort(),
            markers: G.markers.filter((m) => m.visible).length, waves: G.waves.filter((w) => w.on).length,
            glowL: +G.pillars.L.glow.material.opacity.toFixed(2), glowR: +G.pillars.R.glow.material.opacity.toFixed(2),
            opened: +(view.opened || 0).toFixed(2), dawn: +view.dawn.toFixed(2), post: !!(G.fx && G.fx.post)
          };
        },
        aimAt: (id) => {
          // where a fissure is on the screen, so a test can click it like she would
          if (!G) return null;
          const f = G.fissures.find((x) => x.id === id);
          if (!f) return null;
          const v = f.hit.position.clone().project(G.camera), r = el.canvas.getBoundingClientRect();
          return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
        },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) tick(performance.now() + i * 33, 1 / 30); }
      };

      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
