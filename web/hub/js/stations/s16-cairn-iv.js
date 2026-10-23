
    // =========================================================================
    // 🗿 STATION 16 · CAIRN IV, SENTRY OF THE CANYON (THE SONG OF THE PILLARS · SHEET 15A)
    // Part I (journal): the seven-letter sigil wakes the pillars.
    // Part II (web only): the wind plays three verses. Each call leaves a pillar and comes back from a
    // fissure of its own cliff after one beat per 5 paces (Sheet 15A). Silvia marks, in order, the fissure
    // of every echo, by ear (real Web Audio, panned left and right) or by the chronograph tape.
    // Every verse was checked offline to decode in exactly one way (verse III overlaps its echoes;
    // the length of each echo tells them apart). Reward: the Seal of Cairn IV, two Ledger equations
    // and the Tuning Pebble.
    // =========================================================================
    (function initSongOfThePillars() {
      const modal = document.getElementById('modal-cairn-four');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
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
        tSigil: $('pillars-telem-sigil'), tVerses: $('pillars-telem-verses'), tSeal: $('pillars-telem-seal')
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
      function tick(at) {
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

      // ---- The chronograph tape ----
      const BEAT_PX = 14, TAPE_PAD = 12, TAPE_H = 96;
      let tape = null;   // { events, beats, beatMs, label, start, raf }
      function eventsOf(calls) {
        const evs = [];
        calls.forEach((c, i) => {
          evs.push({ beat: c.t, kind: 'call', side: c.side, len: c.len, n: i + 1 });
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
          if (countHintOn()) svg.appendChild(svgText(xb(b), TAPE_H / 2 + 13, String(b), { 'font-size': 7, fill: '#7c5a32' }));
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
            if (tape.events.length > 2) svg.appendChild(svgText(xb(ev.beat) + w / 2, y + 28, String(ev.n), { 'font-size': 7, fill: color, 'font-weight': 700 }));
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
          tape = record;   // what was never heard is not on the tape
          if (el.tapeStatus) el.tapeStatus.textContent = record ? record.label + ' · recorded' : 'Stopped';
          drawTape(Infinity);
        }
      }
      function playCalls(calls, beatMs, label, isTest) {
        stopTape();
        const events = eventsOf(calls);
        const last = events.reduce((m, ev) => Math.max(m, ev.beat + LEN_BEATS[ev.len]), 0);
        tape = { events, beats: Math.ceil(last) + 2, beatMs, label, isTest: !!isTest, raf: null, start: performance.now() + 120, audio: null };
        const a = ensureAudio();
        if (a) {
          const t0 = a.ctx.currentTime + 0.12;
          const beatSec = beatMs / 1000;
          for (let b = 0; b <= tape.beats; b++) tick(t0 + b * beatSec);
          events.forEach((ev) => voice(t0 + ev.beat * beatSec, ev.side, LEN_BEATS[ev.len] * beatSec, ev.kind === 'echo' ? ev.d : 0));
          tape.audio = { ctx: a.ctx, t0, beatSec };
        }
        if (el.tapeStatus) el.tapeStatus.textContent = label + ' · playing…';
        // The cursor follows the sound itself (audio clock minus output latency, e.g. Bluetooth), or the page clock when muted
        const beatNow = () => {
          const au = tape.audio;
          if (au && au.ctx.state === 'running') return (au.ctx.currentTime - au.t0 - (au.ctx.outputLatency || 0)) / au.beatSec;
          return (performance.now() - tape.start) / tape.beatMs;
        };
        const frame = () => {
          const beat = beatNow();
          drawTape(Math.max(0, beat));
          if (el.tapeWrap) {
            const x = TAPE_PAD + beat * BEAT_PX - el.tapeWrap.clientWidth * 0.6;
            if (x > el.tapeWrap.scrollLeft) el.tapeWrap.scrollLeft = x;
          }
          if (beat < tape.beats) { tape.raf = requestAnimationFrame(frame); return; }
          tape.raf = null;
          drawTape(Infinity);
          if (el.tapeStatus) el.tapeStatus.textContent = label + ' · recorded';
          if (!tape.isTest) { record = tape; return; }
          // a test call stays on the tape for a moment, then the verse's record comes back
          const heard = tape;
          setTimeout(() => {
            if (tape !== heard || !record) return;
            tape = record;
            drawTape(Infinity);
            if (el.tapeStatus) el.tapeStatus.textContent = record.label + ' · recorded';
          }, 2500);
        };
        if (el.tapeWrap) el.tapeWrap.scrollLeft = 0;
        tape.raf = requestAnimationFrame(frame);
      }
      function playVerse() {
        if (!isAwake()) return;
        const v = VERSES[verseIdx];
        playCalls(v.calls, v.beatMs, 'Verse ' + ['I', 'II', 'III'][verseIdx]);
      }
      function testCall(side, d) {
        playCalls([{ t: 1, side, len: 'short', d }], VERSES[verseIdx].beatMs, 'Test call · ' + SIDE_NAME[side] + ' cliff, ' + d + ' paces', true);
      }

      // ---- The canyon plan ----
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
        // cliffs
        svg.appendChild(svgEl('path', { d: `M${PLAN.wallL} 6 L${PLAN.wallL} 136`, stroke: '#d4a853', 'stroke-width': 1.6 }));
        svg.appendChild(svgEl('path', { d: `M${PLAN.wallR} 6 L${PLAN.wallR} 136`, stroke: '#d4a853', 'stroke-width': 1.6 }));
        // rings of paces
        RINGS.forEach((d) => {
          const y = ringY(d);
          svg.appendChild(svgEl('path', { d: `M${PLAN.wallL} ${y + 7} Q 60 ${y - 9} ${PLAN.wallR} ${y + 7}`, fill: 'none', stroke: '#b8a07a', 'stroke-opacity': 0.45, 'stroke-width': 0.5 }));
          svg.appendChild(svgText(60, y - 3.6, String(d), { 'font-size': 4.2, fill: '#d6c3a0' }));
        });
        // the twin pillars
        [['L', 50], ['R', 70]].forEach(([side, x]) => {
          svg.appendChild(svgEl('rect', { x: x - 4, y: PLAN.baseY, width: 8, height: 8, fill: '#3b2a17', stroke: side === 'L' ? '#f59e0b' : '#2dd4bf', 'stroke-width': 0.9 }));
          svg.appendChild(svgText(x, 142, SIDE_NAME[side], { 'font-size': 3.8, fill: '#d6c3a0' }));
        });
        // the sixteen fissures
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

      // ---- Marking and singing back ----
      function chooseFissure(id) {
        if (!isAwake() || isDone()) return;
        const side = id[0], d = parseInt(id.slice(1), 10);
        if (mode === 'call') { testCall(side, d); return; }
        const need = VERSES[verseIdx].answer.length;
        if (slots.length >= need) { feedback(el.songFeedback, 'This verse has ' + need + ' echoes. Remove one (⌫) or sing it back.', 'error'); return; }
        slots.push(id);
        if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        feedback(el.songFeedback, '', '');
        renderSlots();
      }
      function renderSlots() {
        if (!el.slots) return;
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
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.songFeedback, 'The pillars fall silent. ' + right + ' of ' + v.answer.length + ' echoes rang true.', 'error');
          render();
          return;
        }
        set(KEYS.verses, String(verseIdx + 1));
        slots = [];
        stopTape();
        tape = null; record = null;
        drawTape(Infinity);
        if (el.tapeStatus) el.tapeStatus.textContent = '';
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback(el.songFeedback, v.word + '. The verse rings true.', 'ok');
        if (verseIdx + 1 >= VERSES.length) { completeStation(); return; }
        say(VERSE_DISPATCH[verseIdx]);
        verseIdx++;
        render();
      }

      function completeStation() {
        set(KEYS.done, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.grantCairnSeal === 'function') window.grantCairnSeal(4);
        else set('order_seal_cairn_4', 'true');
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('tuning_pebble');
        say("STONE... and listen, Silvia. Listen to how the wind played that last verse: three short calls, a pause, two long ones. That is the code I engraved on Aurelia's disc. The same light I saw from the cliffs in 2016. And in the throat of the Left pillar there is a pebble that the river never put there.");
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        if (el.finish) setTimeout(() => el.finish.focus(), 60);
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
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The pillars stay mute. Count the seven echoes on the page “Cairn IV: Sentry of the Canyon” again.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'RESOUND. The wind finds its way into the pillars.', 'ok');
        say("RESOUND... and the pillars are singing, Silvia! Not a hum: calls, one pillar and then the other, and the cliffs answering. This cairn never fell; its voice is still whole. It sings its verses and wants them sung back. Count the echoes; I will mark the fissures you name.");
        render();
        if (el.play) setTimeout(() => el.play.focus(), 60);
      }

      function render() {
        const awake = isAwake(), done = isDone(), sung = versesSung();
        if (el.tabs) {
          el.tabs.textContent = '';
          VERSES.forEach((v, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'monolith-btn' + (i < sung ? ' is-sung' : '');
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
        if (el.tSigil) el.tSigil.textContent = awake ? SIGIL + ' ✓' : '[ 7 LETTERS ]';
        if (el.tVerses) el.tVerses.textContent = sung + ' / ' + VERSES.length;
        if (el.tSeal) el.tSeal.textContent = done ? 'CAIRN IV ✓' : '[ SEALED ]';
        if (el.game) el.game.classList.toggle('is-locked', !awake);
        if (el.gameInner) el.gameInner.inert = !awake;
        if (el.sigilCard) el.sigilCard.classList.toggle('is-collapsed', awake);
        const spoken = 'Sigil spoken: ' + SIGIL + ' ✓';
        if (awake && el.keyFeedback && !el.keyFeedback.textContent) feedback(el.keyFeedback, spoken, 'ok');
        if (el.play) el.play.textContent = '▶ Let the wind play verse ' + ['I', 'II', 'III'][verseIdx];
        if (el.hint) el.hint.style.display = countHintOn() && !done ? '' : 'none';
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        sigilHints.refresh(); songHints.refresh();
      }

      // ---- Controls ----
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
      if (el.undo) el.undo.addEventListener('click', () => { slots.pop(); renderSlots(); });
      if (el.sing) el.sing.addEventListener('click', singBack);
      if (el.speak) el.speak.addEventListener('click', speakSigil);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakSigil(); });

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_sandstone_labyrinth_completed') !== 'true') return false;
        return typeof window.isCairnFourMarchOver === 'function' ? window.isCairnFourMarchOver() : false;
      }
      let returnFocusTo = null;
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
        returnFocusTo = document.activeElement;
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I am at the southern mouth of the gorge. Two hollow pillars, taller than three men, and the wind already hums inside them. The bronze plate between them asks for the sigil of the seven echoes, the ones on the page “Cairn IV: Sentry of the Canyon” of your journal.");
        else say("The pillars are still singing. Let the wind play, count the echoes, and sing the verse back.");
        render();
        const focusTarget = isDone() ? el.finish : isAwake() ? el.play : el.keyInput;
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
      }
      function closeCairnFourModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopTape();
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openCairnFourModal = openCairnFourModal;
      window.closeCairnFourModal = closeCairnFourModal;
      if (el.close) el.close.addEventListener('click', closeCairnFourModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeCairnFourModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeCairnFourModal(); });
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

      // Test hook for scripts/audit/web_smoke.py: the verses (they are in this source anyway) and the controls
      window.__cairn4 = {
        verses: VERSES.map((v) => ({ word: v.word, beatMs: v.beatMs, calls: v.calls.map((c) => Object.assign({}, c)) })),
        letters: JSON.parse(JSON.stringify(WALLS)),
        verse: () => verseIdx,
        mark: (id) => chooseFissure(id),
        sing: () => singBack(),
        play: () => playVerse()
      };

      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
