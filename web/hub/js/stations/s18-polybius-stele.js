
    // =========================================================================
    // 🔥 STATION 18 · THE POLYBIUS STELE · TOWER II IN FLAMES (SHEET 17A)
    // Part I (journal): the proverb of the six stanzas turns the stele; its back bears 348° NNW.
    // Part II (web only), The Knocks in the Stone: the Servant, hiding in the old well under the atrium,
    // knocks in the grid of the stele (a group for the row, a pause, a group for the column) and keeps the
    // Law of the Inverted Mirage: the stanzas count across both sides of the talk, and the even ones swap
    // the two groups. WHO (his) · SEEK (Silvia's answer: the next word of the proverb) · WELL · ASH.
    // Part III (web only), The Burning Atrium: turn by turn the fire spreads from the library through the
    // mats, scrolls and beams; a flagstone burns for three turns and then is ash. Checked offline (seed 53268
    // of the Station 18 fire search): the shortest crossing takes 13 turns and the Servant holds on for 15;
    // every crossing in time walks on ash, and both a fire-blind route and "step toward the hatch, else
    // wait" fail.
    // Reward: two Ledger equations, the Servant's Key and the bearing of the stele.
    // =========================================================================
    (function initPolybiusStele() {
      const modal = document.getElementById('modal-polybius-stele');
      if (!modal) return;
      const sfx = window.sfx || null;
      // The game's own Sound switch silences these too (the old generic sounds then play as before)
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(soundOn() && a && a.sfx && a.sfx(kind, o)); };
      // A held arrow key takes turns faster than their sounds should play
      let lastTurnCue = 0;
      const turnCueOk = () => { const n = Date.now(); if (n - lastTurnCue < 80) return false; lastTurnCue = n; return true; };
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const HOWTO_KEY = 'order_stele_howto', CINE_INTRO = 'order_stele_cine_intro';
      const KEYS = {
        awake: 'order_stele_awake',
        done: 'order_polybius_stele_completed',
        fails: 'order_stele_key_fails',
        hint: 'order_stele_hint',
        knocks: 'order_stele_knocks',
        knockFails: 'order_stele_knock_fails',
        knockHint: 'order_stele_knock_hint',
        fireFails: 'order_stele_fire_fails',
        fireHint: 'order_stele_fire_hint',
        sound: 'order_stele_sound'
      };
      const PROVERB = 'STARS GUIDE THOSE WHO SEEK TRUTH';
      const PROVERB_LETTERS = PROVERB.replace(/ /g, '');

      // ---- The founders' grid of Sheet 17A: PHOENIX first, then the rest of the alphabet (no J) ----
      const GRID = 'PHOENIXABCDFGKLMQRSTUVWYZ';
      const STANZAS = [
        { by: 'servant', word: 'WHO' },    // I · sun: row, then column
        { by: 'silvia', word: 'SEEK' },    // II · moon: column, then row
        { by: 'servant', word: 'WELL' },   // III · sun
        { by: 'servant', word: 'ASH' }     // IV · moon
      ];
      const ROMAN = ['I', 'II', 'III', 'IV'];
      const isMoon = (i) => i % 2 === 1;
      function knocksOf(word, moon) {
        const groups = [];
        word.split('').forEach((ch) => {
          const k = GRID.indexOf(ch);
          const row = Math.floor(k / 5) + 1, col = (k % 5) + 1;
          groups.push(moon ? col : row, moon ? row : col);
        });
        return groups;
      }
      function wordOf(groups, moon) {
        let w = '';
        for (let i = 0; i + 1 < groups.length; i += 2) {
          const row = moon ? groups[i + 1] : groups[i], col = moon ? groups[i] : groups[i + 1];
          w += row >= 1 && row <= 5 && col >= 1 && col <= 5 ? GRID[(row - 1) * 5 + col - 1] : '?';
        }
        return w;
      }
      const KNOCK_MS = 270, GROUP_PAUSE_MS = 900, LETTER_PAUSE_MS = 1750;
      const STANZA_DISPATCH = [
        "WHO. He asks who is up here, in the grid of his own stele. My name will not do: the raiders know it by now. Silvia... the proverb. 'Those WHO SEEK truth.' He has knocked the first half of a password. Answer him: it is your stanza now.",
        "A long scrape under the stone, and then quick, light knocks, like a man laughing. He understood, Silvia! Wait... he is knocking again. Slowly.",
        "WELL. The old well of the atrium! The founders cut a cistern under this floor, and its hatch is in the far corner, past the burning mats. He went down into the dark and pulled the hatch shut over his head. Listen: one more stanza.",
        "ASH. Not the raiders, Silvia: the ash. Where the fire has passed, it cannot burn twice. He is telling me how to cross. The smoke is pouring into the well, and he cannot hold on for long. Guide me to the hatch."
      ];

      // ---- The atrium: 9 × 9 flagstones, north at the top ----
      // '#' a column (the stele stands in the middle), '.' bare stone, 'f' mats, scrolls and fallen beams,
      // 'L' the library on the west wall (it burns all night), 'S' the side door, 'H' the hatch of the well.
      const ATRIUM = {
        map: ['..fffffHf', 'Lff#.ffff', 'Lf#.ff#ff', 'Lff#fffff', 'Lfff#ffff', '..fff.ff.', '.f#fff#.f', '.f.ff....', '.ff.Sffff'],
        start: [4, 8],
        hatch: [7, 0],
        stele: [4, 4],
        burn: 3,
        breath: 15
      };
      const COLS = 9, ROWS = 9;
      const cellAt = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS ? null : ATRIUM.map[y][x]);
      // A fuel flagstone catches one turn after a burning neighbour: its turn is its distance from the library
      const IGNITE = (() => {
        const ig = new Map(), queue = [];
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (cellAt(x, y) === 'L') { ig.set(x + ',' + y, 0); queue.push([x, y]); }
        for (let q = 0; q < queue.length; q++) {
          const [x, y] = queue[q];
          [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
            const k = (x + dx) + ',' + (y + dy);
            if (cellAt(x + dx, y + dy) === 'f' && !ig.has(k)) { ig.set(k, ig.get(x + ',' + y) + 1); queue.push([x + dx, y + dy]); }
          });
        }
        return ig;
      })();
      function burningAt(x, y, t) {
        const c = cellAt(x, y);
        if (c === 'L') return true;
        if (c !== 'f') return false;
        const ig = IGNITE.get(x + ',' + y);
        return ig !== undefined && t >= ig && t < ig + ATRIUM.burn;
      }
      function fuelState(x, y, t) {
        const ig = IGNITE.get(x + ',' + y);
        if (ig === undefined || t < ig - 1) return 'fuel';
        if (t === ig - 1) return 'glow';
        return t < ig + ATRIUM.burn ? 'fire' : 'ash';
      }

      const el = {
        close: $('btn-close-stele'), proverbCard: $('stele-proverb-card'), keyInput: $('stele-key-input'), speak: $('btn-stele-speak'),
        keyFeedback: $('stele-key-feedback'), knockGame: $('stele-knock-game'), knockInner: document.querySelector('#stele-knock-game .monolith-game-inner'),
        stanzaLabel: $('stele-stanza-label'), tape: $('stele-tape'), readPanel: $('stele-read-panel'),
        listen: $('btn-stele-listen'), sound: $('btn-stele-sound'), wordInput: $('stele-word-input'), read: $('btn-stele-read'),
        replyPanel: $('stele-reply-panel'), replyTape: $('stele-reply-tape'), knock: $('btn-stele-knock'), pause: $('btn-stele-pause'),
        clear: $('btn-stele-clear'), send: $('btn-stele-send'), knockFeedback: $('stele-knock-feedback'),
        fireGame: $('stele-fire-game'), fireInner: document.querySelector('#stele-fire-game .monolith-game-inner'), atrium: $('stele-atrium'),
        breath: $('stele-breath'), turnLabel: $('stele-turn-label'), moveFeedback: $('stele-move-feedback'),
        pad: { up: $('btn-stele-up'), down: $('btn-stele-down'), left: $('btn-stele-left'), right: $('btn-stele-right'), wait: $('btn-stele-wait') },
        hint: $('stele-hint'), victory: $('stele-victory'), victoryText: $('stele-victory-text'), finish: $('btn-stele-finish'),
        dispatch: $('stele-dispatch-text'),
        stage: $('stele3d-stage'), canvas: $('stele3d-canvas'), subtitle: $('stele3d-subtitle'), fade: $('stele3d-fade'), aim: $('stele3d-aim'),
        howto: $('stele3d-howto'), help: $('btn-stele-howto'), breathBox: $('stele3d-breath'), breathBar: $('stele3d-breath-bar'), mapWrap: $('stele3d-map-wrap')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const knocksDone = () => (isDone() ? STANZAS.length : Math.max(0, Math.min(STANZAS.length, parseInt(get(KEYS.knocks) || '0', 10) || 0)));
      const fireOpen = () => knocksDone() >= STANZAS.length;
      const soundOn = () => get(KEYS.sound) !== 'off';

      // Hints climb three levels (hub/js/hint-ladder.js); level 2 is the older help of each part
      const hints = window.EclipseHints;
      const proverbHints = hints.define({
        id: 's18-proverb', station: 'Station 18', title: 'the proverb of the stele', group: 'desert',
        anchor: el.keyFeedback, solved: isAwake, legacyKey: KEYS.hint,
        texts: [
          'Every pair of numbers in the six stanzas on the page “The Polybius Stele” points to one square of the grid above them. One square, one letter.',
          'I wrote down how to read the stanzas, and how the mirage turns some of them round. It is in Ask Hermes: "How do I read the stanzas of the page “The Polybius Stele”?"',
          'Let us read the first letter together. Stanza I is a solar stanza, so its first pair, (IV, IV), means row IV, then column IV: that square holds S. Go on along stanza I, and when you reach stanza II, remember that its first number is the column.'
        ]
      });
      const knockHints = hints.define({
        id: 's18-knocks', station: 'Station 18', title: 'the knocks in the stone', group: 'desert',
        anchor: el.knockFeedback, solved: fireOpen, active: isAwake, legacyKey: KEYS.knockHint,
        texts: [
          'Count every group of knocks; the chalk on the floor keeps the count for you. Two groups make one letter, in the same grid as the stanzas on the page “The Polybius Stele”.',
          'I copied the Law from the page “The Polybius Stele” beside the stone, and my longer note is in Ask Hermes: "How do I read the Servant\'s knocks?"',
          'Let us read his first letter together. In stanza I he knocked five, then three. Stanza I is solar: row V, column III, and that square holds W. Read the next two letters the same way. When the stanza is yours, it is stanza II, lunar: knock the column first.'
        ]
      });
      const fireHints = hints.define({
        id: 's18-fire', station: 'Station 18', title: 'the burning atrium', group: 'desert',
        anchor: el.moveFeedback, solved: isDone, active: fireOpen, legacyKey: KEYS.fireHint,
        texts: [
          'Watch the fire, not only the hatch. Glowing flagstones catch on the next turn, bare stone never burns, and a flagstone that has burnt out is ash.',
          'Now every flagstone shows in how many turns it will catch. My longer note is in Ask Hermes: "How do I cross the burning atrium?"',
          'Let us take the first steps together. From the side door, without waiting, go up three flagstones, then one to the right: that one is bare stone, and the fire cannot reach you there. From it, look further north for the next bare stone, and remember that the last stretch to the hatch is walked on ash.'
        ]
      });

      let heard = [];        // the groups chalked on the floor, as they are knocked
      let reply = [];        // Silvia's answer: groups of knocks
      let replyOpen = false; // is the last group of the answer still open?
      let playing = null;    // timers of the knocks being played
      let afterPlaying = null; // what to do once they end (judging Silvia's answer must never be lost)
      let lastAdvanceAt = -1e9; // when the last stanza was understood (a double click must not read the next one)
      let run = null;        // the crossing of the atrium: { x, y, t } (lives only while the page is open)

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
      const letters = (s) => String(s || '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();

      // ---- Sound: stone knocking on stone ----
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
            master.gain.value = 0.8;
            master.connect(ctx.destination);
            const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
            const data = noise.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            audio = { ctx, master, noise };
          }
          return audio;
        } catch (e) { return null; }
      }
      function knockSound(fromBelow) {
        const a = ensureAudio();
        if (!a) return;
        try {
          const { ctx, master, noise } = a;
          const at = ctx.currentTime + 0.01;
          // the dull body of the slab
          const o = ctx.createOscillator(), og = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(fromBelow ? 130 : 170, at);
          o.frequency.exponentialRampToValueAtTime(fromBelow ? 62 : 80, at + 0.12);
          og.gain.setValueAtTime(0.0001, at);
          og.gain.exponentialRampToValueAtTime(fromBelow ? 0.5 : 0.6, at + 0.004);
          og.gain.exponentialRampToValueAtTime(0.0001, at + 0.17);
          o.connect(og); og.connect(master);
          o.start(at); o.stop(at + 0.2);
          // the click of stone on stone, muffled when it comes up through the floor
          const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
          n.buffer = noise;
          bp.type = 'bandpass'; bp.frequency.value = fromBelow ? 650 : 1100; bp.Q.value = 1.3;
          ng.gain.setValueAtTime(0.0001, at);
          ng.gain.exponentialRampToValueAtTime(fromBelow ? 0.22 : 0.35, at + 0.002);
          ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
          n.connect(bp); bp.connect(ng); ng.connect(master);
          n.start(at, Math.random() * 0.3, 0.07);
        } catch (e) {}
      }

      // ---- The chalked knocks (in the atrium, every knock rings the dust: sceneKnock) ----
      const ripple = (fromBelow) => sceneKnock(fromBelow);
      function renderTape(node, groups, open) {
        if (!node) return;
        node.textContent = '';
        for (let i = 0; i < groups.length; i += 2) {
          const letter = document.createElement('span');
          letter.className = 'stele-letter';
          [groups[i], groups[i + 1]].forEach((count, j) => {
            if (count === undefined) return;
            const g = document.createElement('span');
            g.className = 'stele-group' + (open && i + j === groups.length - 1 ? ' is-open' : '');
            for (let k = 0; k < count; k++) g.appendChild(document.createElement('b'));
            letter.appendChild(g);
          });
          node.appendChild(letter);
        }
        // The same knocks as text, for screen readers (the dots are only drawn)
        const counts = [];
        for (let i = 0; i < groups.length; i += 2) counts.push(groups[i] + (groups[i + 1] !== undefined ? ' and ' + groups[i + 1] : ''));
        if (counts.length && !(playing && node === el.tape)) {   // read out once the knocking ends, not knock by knock
          const said = document.createElement('span');
          said.className = 'monolith-sr-only';
          said.textContent = 'Knocks: ' + counts.join(', then ') + '.';
          node.appendChild(said);
        }
      }
      // Stops the knocks at once; `finish` still runs what was waiting for them (Silvia's answer gets judged)
      function stopKnocks(finish) {
        if (playing) playing.forEach((t) => clearTimeout(t));
        playing = null;
        const then = afterPlaying;
        afterPlaying = null;
        if (finish && then) then();
      }
      // Plays a run of groups: from below (the Servant) or from above (Hermes knocking Silvia's answer)
      function playKnocks(groups, fromBelow, done) {
        stopKnocks(true);
        playing = [];
        afterPlaying = done || null;
        if (fromBelow) { heard = []; renderTape(el.tape, heard, false); }
        let t = 350;
        groups.forEach((count, gi) => {
          if (gi > 0) t += gi % 2 ? GROUP_PAUSE_MS - KNOCK_MS : LETTER_PAUSE_MS - KNOCK_MS;
          for (let k = 0; k < count; k++) {
            playing.push(setTimeout(() => {
              knockSound(fromBelow);
              ripple(fromBelow);
              if (fromBelow) {
                if (heard.length <= gi) heard.push(0);
                heard[gi]++;
                renderTape(el.tape, heard, false);
              }
            }, t));
            t += KNOCK_MS;
          }
        });
        playing.push(setTimeout(() => {
          playing = null; afterPlaying = null;
          if (fromBelow) renderTape(el.tape, heard, false);
          render();
          if (done) done();
        }, t + 200));
        render();
      }
      function listen() {
        const i = knocksDone();
        if (!isAwake() || i >= STANZAS.length || playing || modal.style.display === 'none') return;
        // During Silvia's own stanza the Servant repeats his question
        const s = STANZAS[i].by === 'servant' ? i : i - 1;
        playKnocks(knocksOf(STANZAS[s].word, isMoon(s)), true);
      }

      function knockFail() {
        const fails = (parseInt(get(KEYS.knockFails) || '0', 10) || 0) + 1;
        set(KEYS.knockFails, String(fails));
        knockHints.fail();
        sceneWorry();
        if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
      }
      function readWord() {
        const i = knocksDone();
        if (!isAwake() || i >= STANZAS.length || STANZAS[i].by !== 'servant') return;
        const typed = letters(el.wordInput && el.wordInput.value);
        if (!typed) {
          if (performance.now() - lastAdvanceAt < 1500) return;
          feedback(el.knockFeedback, 'Type the word you read in his knocks.', 'error');
          return;
        }
        if (typed !== STANZAS[i].word) {
          knockFail();
          const mirage = wordOf(knocksOf(STANZAS[i].word, isMoon(i)), !isMoon(i));
          feedback(el.knockFeedback, typed === mirage
            ? 'That is the other reading. Stanza ' + ROMAN[i] + ' is ' + (isMoon(i) ? 'an even stanza: the mirage swaps the groups.' : 'an odd stanza: row first, then column.')
            : 'Hermes shakes his head: that is not what the stone said. Listen again, and count.', 'error');
          render();
          return;
        }
        advance(i);
      }
      function knock() {
        if (!replyActive() || playing) return;
        if (reply.length >= 40) return;
        if (!replyOpen || !reply.length) { reply.push(1); replyOpen = true; } else reply[reply.length - 1]++;
        knockSound(false);
        ripple(false);
        renderTape(el.replyTape, reply, replyOpen);
      }
      function pauseKnock() {
        if (!replyActive() || playing || !replyOpen) return;
        replyOpen = false;
        renderTape(el.replyTape, reply, false);
      }
      function clearReply() { reply = []; replyOpen = false; renderTape(el.replyTape, reply, false); }
      const replyActive = () => isAwake() && knocksDone() < STANZAS.length && STANZAS[knocksDone()].by === 'silvia';
      function sendReply(instant) {
        if (!replyActive() || playing || !reply.length) return;
        const i = knocksDone();
        const sent = reply.slice();
        clearReply();
        const judge = () => {
          const want = knocksOf(STANZAS[i].word, isMoon(i));
          if (sent.join(',') === want.join(',')) { advance(i); return; }
          knockFail();
          const sunReading = knocksOf(STANZAS[i].word, !isMoon(i)).join(',') === sent.join(',');
          feedback(el.knockFeedback, sunReading
            ? 'Silence under the stone. Then, slower, the same question again: he heard the right word, but not in the order he expects. Which stanza is yours?'
            : 'Silence under the stone. Then, slower, the same question again. He wants a word that only a friend of the stele would know.', 'error');
          render();
          if (!instant) setTimeout(listen, 1400);
        };
        if (instant) { judge(); return; }
        feedback(el.knockFeedback, 'Hermes kneels and knocks your answer on the floor.', '');
        playKnocks(sent, false, judge);
      }
      function advance(i) {
        stopKnocks();   // a word read before its knocks end: the next stanza starts clean
        lastAdvanceAt = performance.now();
        set(KEYS.knocks, String(i + 1));
        if (!cue('shimmer', { deg: 10 + i * 2 }) && sfx && sfx.playChimeHover) sfx.playChimeHover();
        if (el.wordInput) el.wordInput.value = '';
        say(STANZA_DISPATCH[i]);
        sceneStanza(i);
        feedback(el.knockFeedback, i === 0 ? 'WHO. Now it is your stanza.' : (i === 1 ? 'He understood your answer.' : STANZAS[i].word + '.'), 'ok');
        if (i + 1 >= STANZAS.length) {
          run = newRun();
          feedback(el.moveFeedback, 'Hermes stands at the side door. The hatch of the well is in the far corner.', '');
          render();
          const focus = el.pad.up;
          if (focus) setTimeout(() => focus.focus({ preventScroll: true }), 60);
          return;
        }
        render();
        if (STANZAS[i + 1].by === 'servant') setTimeout(() => { if (modal.style.display !== 'none' && knocksDone() === i + 1) listen(); }, 1600);
        else if (el.knock) setTimeout(() => el.knock.focus(), 60);
      }

      // ---- The burning atrium ----
      const newRun = () => ({ x: ATRIUM.start[0], y: ATRIUM.start[1], t: 0 });
      const C = 10, cx = (x) => x * C + C / 2, cy = (y) => y * C + C / 2;
      function drawAtrium() {
        const svg = el.atrium;
        if (!svg) return;
        svg.textContent = '';
        const t = run ? run.t : 0;
        const showTurns = get(KEYS.fireHint) === 'true' && fireOpen() && !isDone();
        svg.appendChild(svgEl('rect', { x: -0.6, y: -0.6, width: COLS * C + 1.2, height: ROWS * C + 1.2, fill: '#1c130b', stroke: '#8a6d3b', 'stroke-width': 0.8 }));
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            const c = cellAt(x, y), X = x * C, Y = y * C;
            svg.appendChild(svgEl('rect', { x: X + 0.3, y: Y + 0.3, width: C - 0.6, height: C - 0.6, fill: (x + y) % 2 ? '#2a1d12' : '#2f2115', stroke: '#4a3520', 'stroke-width': 0.3 }));
            if (c === 'f') {
              const st = isDone() ? (IGNITE.has(x + ',' + y) ? 'ash' : 'fuel') : fuelState(x, y, t);
              if (st === 'ash') {
                svg.appendChild(svgEl('rect', { x: X + 0.8, y: Y + 0.8, width: C - 1.6, height: C - 1.6, rx: 1, fill: '#3f3a36' }));
                [[2.5, 3], [6.5, 2.4], [4.4, 6.8], [7.4, 7.2]].forEach(([a, b]) => svg.appendChild(svgEl('circle', { cx: X + a, cy: Y + b, r: 0.55, fill: '#78716c' })));
              } else if (st === 'fire') {
                svg.appendChild(svgEl('rect', { x: X + 0.6, y: Y + 0.6, width: C - 1.2, height: C - 1.2, rx: 1, fill: '#4a1a07' }));
                const left = (IGNITE.get(x + ',' + y) + ATRIUM.burn) - t;   // turns until it is ash
                const h = 3 + left * 1.6;
                svg.appendChild(svgEl('path', { class: 'stele-flame', d: `M${X + 5} ${Y + 9} C ${X + 1.4} ${Y + 7.6}, ${X + 3} ${Y + 9 - h * 0.6}, ${X + 4.2} ${Y + 9 - h} C ${X + 5.4} ${Y + 9 - h * 0.6}, ${X + 8.8} ${Y + 7}, ${X + 5} ${Y + 9} Z`, fill: '#f97316' }));
                svg.appendChild(svgEl('path', { class: 'stele-flame is-b', d: `M${X + 5.2} ${Y + 9} C ${X + 3.6} ${Y + 8}, ${X + 4.6} ${Y + 9 - h * 0.45}, ${X + 5.6} ${Y + 9 - h * 0.7} C ${X + 6.2} ${Y + 8.2}, ${X + 7} ${Y + 8.4}, ${X + 5.2} ${Y + 9} Z`, fill: '#fde68a' }));
              } else {
                const v = (x * 7 + y * 3) % 3;
                if (v === 0) {        // a rush mat
                  svg.appendChild(svgEl('rect', { x: X + 1.2, y: Y + 1.6, width: C - 2.4, height: C - 3.2, rx: 0.6, fill: '#6b4a22' }));
                  for (let k = 0; k < 4; k++) svg.appendChild(svgEl('line', { x1: X + 1.6, y1: Y + 2.6 + k * 1.6, x2: X + C - 1.6, y2: Y + 2.6 + k * 1.6, stroke: '#8a6334', 'stroke-width': 0.4 }));
                } else if (v === 1) { // fallen scrolls
                  [[2.6, 3.4, 20], [6.2, 5.4, -25], [3.8, 7.2, 5]].forEach(([a, b, r]) => svg.appendChild(svgEl('rect', { x: X + a - 2, y: Y + b - 0.7, width: 4, height: 1.4, rx: 0.7, fill: '#c8b089', stroke: '#8a6d3b', 'stroke-width': 0.25, transform: `rotate(${r} ${X + a} ${Y + b})` })));
                } else {              // a fallen beam
                  svg.appendChild(svgEl('rect', { x: X + 0.9, y: Y + 4, width: C - 1.8, height: 2.4, rx: 0.5, fill: '#5a3a1a', stroke: '#3b2410', 'stroke-width': 0.3, transform: `rotate(-28 ${X + 5} ${Y + 5.2})` }));
                }
                if (st === 'glow') svg.appendChild(svgEl('rect', { class: 'stele-ember', x: X + 0.7, y: Y + 0.7, width: C - 1.4, height: C - 1.4, rx: 1, fill: 'rgba(249, 115, 22, 0.2)', stroke: '#f97316', 'stroke-width': 0.8 }));
                if (showTurns && IGNITE.has(x + ',' + y)) {   // fuel cut off by bare stone never catches
                  const left = IGNITE.get(x + ',' + y) - t;
                  const tag = svgEl('text', { x: X + 8.6, y: Y + 3.2, 'text-anchor': 'end', 'font-size': 2.8, 'font-family': 'Cinzel, serif', fill: '#fdba74' });
                  tag.textContent = String(left);
                  svg.appendChild(tag);
                }
              }
            } else if (c === 'L') {   // the burning shelves of the library
              svg.appendChild(svgEl('rect', { x: X + 0.6, y: Y + 0.6, width: C - 1.2, height: C - 1.2, fill: '#2b1206', stroke: '#7c2d12', 'stroke-width': 0.4 }));
              for (let k = 0; k < 3; k++) svg.appendChild(svgEl('line', { x1: X + 1, y1: Y + 3 + k * 2.6, x2: X + C - 1, y2: Y + 3 + k * 2.6, stroke: '#5a2a0e', 'stroke-width': 0.5 }));
              svg.appendChild(svgEl('path', { class: 'stele-flame', d: `M${X + 5} ${Y + 9.4} C ${X + 0.8} ${Y + 7}, ${X + 3.6} ${Y + 4}, ${X + 3.6} ${Y + 0.8} C ${X + 6.6} ${Y + 3.4}, ${X + 9.2} ${Y + 6.6}, ${X + 5} ${Y + 9.4} Z`, fill: '#ea580c' }));
              svg.appendChild(svgEl('path', { class: 'stele-flame is-b', d: `M${X + 5} ${Y + 9.4} C ${X + 3.4} ${Y + 8}, ${X + 4.6} ${Y + 5.6}, ${X + 5.2} ${Y + 4} C ${X + 6.4} ${Y + 6}, ${X + 7} ${Y + 8}, ${X + 5} ${Y + 9.4} Z`, fill: '#fde68a' }));
            } else if (c === '#') {
              if (x === ATRIUM.stele[0] && y === ATRIUM.stele[1]) {   // the stele
                svg.appendChild(svgEl('path', { d: `M${X + 2} ${Y + 9} L${X + 2} ${Y + 2.6} Q${X + 5} ${Y + 0.4} ${X + 8} ${Y + 2.6} L${X + 8} ${Y + 9} Z`, fill: '#4a3a2a', stroke: '#d4a853', 'stroke-width': 0.5 }));
                for (let k = 1; k < 3; k++) {
                  svg.appendChild(svgEl('line', { x1: X + 2.6, y1: Y + 3 + k * 2, x2: X + 7.4, y2: Y + 3 + k * 2, stroke: '#a8916f', 'stroke-width': 0.25 }));
                  svg.appendChild(svgEl('line', { x1: X + 2 + k * 2, y1: Y + 3.2, x2: X + 2 + k * 2, y2: Y + 8.6, stroke: '#a8916f', 'stroke-width': 0.25 }));
                }
              } else {   // a fluted column
                svg.appendChild(svgEl('circle', { cx: cx(x), cy: cy(y), r: 3.9, fill: '#6b5a45', stroke: '#a8916f', 'stroke-width': 0.5 }));
                svg.appendChild(svgEl('circle', { cx: cx(x), cy: cy(y), r: 2.6, fill: 'none', stroke: '#8a7559', 'stroke-width': 0.35, 'stroke-dasharray': '0.8 0.6' }));
              }
            } else if (c === 'H') {   // the bronze hatch of the well
              svg.appendChild(svgEl('circle', { cx: cx(x), cy: cy(y), r: 3.8, fill: isDone() ? '#0d0805' : '#7c5a2a', stroke: '#d4a853', 'stroke-width': 0.6 }));
              if (!isDone()) {
                svg.appendChild(svgEl('line', { x1: cx(x) - 2.6, y1: cy(y), x2: cx(x) + 2.6, y2: cy(y), stroke: '#d4a853', 'stroke-width': 0.4 }));
                svg.appendChild(svgEl('line', { x1: cx(x), y1: cy(y) - 2.6, x2: cx(x), y2: cy(y) + 2.6, stroke: '#d4a853', 'stroke-width': 0.4 }));
              }
            } else if (c === 'S') {   // the side door
              svg.appendChild(svgEl('path', { d: `M${X + 2} ${Y + C} L${X + 2} ${Y + 6} Q${X + 5} ${Y + 3.4} ${X + 8} ${Y + 6} L${X + 8} ${Y + C}`, fill: 'none', stroke: '#b8a07a', 'stroke-width': 0.6 }));
            }
          }
        }
        const label = (x, y, text, anchor, rotate) => {
          const n = svgEl('text', { x, y, 'text-anchor': anchor || 'middle', 'font-size': 2.9, 'font-family': 'Cinzel, serif', 'letter-spacing': 0.3, fill: '#b8a07a' });
          if (rotate) n.setAttribute('transform', `rotate(-90 ${x} ${y})`);
          n.textContent = text;
          svg.appendChild(n);
        };
        label(-2.4, 25, 'LIBRARY', 'middle', true);
        label(cx(ATRIUM.hatch[0]), -2.6, 'THE WELL');
        label(cx(ATRIUM.start[0]), ROWS * C + 4.2, 'SIDE DOOR');
        // Hermes and the glow of his lamp
        const hx = run && fireOpen() && !isDone() ? run.x : (isDone() ? ATRIUM.hatch[0] : ATRIUM.start[0]);
        const hy = run && fireOpen() && !isDone() ? run.y : (isDone() ? ATRIUM.hatch[1] : ATRIUM.start[1]);
        if (fireOpen()) {
          svg.appendChild(svgEl('circle', { cx: cx(hx), cy: cy(hy), r: 6.5, fill: 'rgba(253, 230, 138, 0.13)' }));
          svg.appendChild(svgEl('circle', { cx: cx(hx), cy: cy(hy), r: 2.7, fill: '#fde68a', stroke: '#7c2d12', 'stroke-width': 0.6 }));
        }
        const where = fireOpen() && !isDone() && run ? 'Hermes is on row ' + (run.y + 1) + ', column ' + (run.x + 1) + ', turn ' + run.t + '.' : '';
        svg.setAttribute('aria-label', 'The atrium of Tower II seen from above. The library on the west wall is burning, and the fire spreads across the mats and scrolls. The side door is at the bottom, the hatch of the well at the top right. ' + where);
      }
      function takeTurn(dx, dy) {
        if (!fireOpen() || isDone() || !run || modal.style.display === 'none') return;
        const nx = run.x + dx, ny = run.y + dy;
        if (dx || dy) {
          const c = cellAt(nx, ny);
          if (!c || c === '#') { if (turnCueOk()) cue('thud'); }
          else if (c === 'L' || (burningAt(nx, ny, run.t) && burningAt(nx, ny, run.t + 1))) { if (turnCueOk()) cue('flame', { dur: 0.6 }); }
          if (!c || c === '#' || c === 'L' || (burningAt(nx, ny, run.t) && burningAt(nx, ny, run.t + 1))) sceneBump(nx, ny, c);
          if (!c) { feedback(el.moveFeedback, 'The wall of the atrium.', 'error'); return; }
          if (c === '#') { feedback(el.moveFeedback, nx === ATRIUM.stele[0] && ny === ATRIUM.stele[1] ? 'The stele stands in the way.' : 'A column stands in the way.', 'error'); return; }
          if (c === 'L') { feedback(el.moveFeedback, 'The library is a wall of fire.', 'error'); return; }
          if (burningAt(nx, ny, run.t) && burningAt(nx, ny, run.t + 1)) { feedback(el.moveFeedback, 'That flagstone is burning. Wait for its ash, or go round.', 'error'); return; }
        }
        run.x = nx; run.y = ny; run.t++;
        if (turnCueOk()) {
          if (!cue(dx || dy ? 'step' : 'tick', { f: 900, v: 0.05 }) && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          // the fire takes its turn too: flagstones catching, and burnt-out beams giving way to ash
          let caught = 0, spent = 0;
          IGNITE.forEach((ig) => { if (ig === run.t) caught++; else if (ig + ATRIUM.burn === run.t) spent++; });
          if (caught) cue('flame', { dur: 0.6 + Math.min(caught, 4) * 0.15 });
          if (spent) cue('crack', { v: 0.12 });
        }
        if (run.x === ATRIUM.hatch[0] && run.y === ATRIUM.hatch[1]) { reachHatch(); return; }
        if (burningAt(run.x, run.y, run.t)) { lose('fire'); return; }
        if (run.t >= ATRIUM.breath) { lose('breath'); return; }
        feedback(el.moveFeedback, dx || dy ? '' : 'Hermes holds still and lets the fire take its turn.', '');
        render();
      }
      function lose(why) {
        const fails = (parseInt(get(KEYS.fireFails) || '0', 10) || 0) + 1;
        set(KEYS.fireFails, String(fails));
        const before = fireHints.level();
        fireHints.fail();
        const hinted = before < 2 && fireHints.level() >= 2;
        syncWorld();   // the scene takes the fatal step before it holds the moment
        sceneLose(why);
        run = newRun();
        cue(why === 'fire' ? 'crack' : 'dusk', { v: 0.28 });
        if (el.fireInner) { el.fireInner.classList.remove('laby-flash'); void el.fireInner.offsetWidth; el.fireInner.classList.add('laby-flash'); }
        feedback(el.moveFeedback, why === 'fire'
          ? 'The fire reached Hermes\'s flagstone. He fell back to the side door, coughing, his sleeve smouldering.'
          : 'Too slow: the knocks from the well are growing faint. Hermes went back to the side door to find a quicker way.', 'error');
        say((why === 'fire' ? "I am all right, Silvia, only singed. " : "He is still knocking, Silvia, but fainter. ") + "Fire is like water: it always runs down the same channels, in the same order. Watch the glowing flagstones and try again." + (hinted ? " I have been reading the fire: now every flagstone shows the turn it catches." : ''));
        render();
      }
      function reachHatch() {
        sceneHatch();
        completeStation();
        feedback(el.moveFeedback, 'Hermes lifts the bronze hatch of the well.', 'ok');
        say("I lifted the hatch and he came up out of the dark, Silvia: the Servant, alive, black with smoke, a wet cloth over his mouth and a roll of charts in his arms. He took my wrists in his burnt hands and did not let go. And on the underside of the hatch, in the firelight, two lines cut by the founders. Write them down. I will tell you the rest on the wire, when he can breathe.");
      }
      function completeStation() {
        set(KEYS.done, 'true');
        stopKnocks();
        cue('groan', { dur: 1.2 });
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('servant_key');
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "The stele turned for the proverb on the page “The Polybius Stele” and showed its back: 348° north-north-west, the bearing of Cairn III. Under the floor, the Servant answered in the founders' grid, and Silvia answered him back. Then Hermes crossed the burning atrium on the ash and lifted the hatch of the well: the Servant is alive, and so are the Oracle's charts.";
        }
        if (el.keyInput) { el.keyInput.value = PROVERB; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
      }

      // ---- Part I: the proverb of Sheet 17A ----
      function speakProverb() {
        if (isAwake()) return;
        const typed = letters(el.keyInput && el.keyInput.value);
        if (!typed) { feedback(el.keyFeedback, 'Type the six words of the proverb from the page “The Polybius Stele”.', 'error'); return; }
        if (typed !== PROVERB_LETTERS) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The stele does not move. Read the six stanzas on the page “The Polybius Stele” again, and mind the mirage.', 'error');
          proverbHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        sceneProverb();
        cue('stone', { dur: 1.6 });
        if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = PROVERB; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'STARS GUIDE THOSE WHO SEEK TRUTH. The stele turns on its base. On its back: 348° NNW.', 'ok');
        say("I said it aloud, every word, and the stele turned on its base, Silvia, stone grinding on stone. On its back, cut deep: 348°, north-north-west. The bearing of Cairn III. And then, under my feet... knocking. Someone is knocking on the underside of the floor. Groups of knocks, and pauses. He heard the proverb, and he is answering in the grid of the stele. Listen, and read him with the page “The Polybius Stele”.");
        render();
        setTimeout(() => { if (modal.style.display !== 'none' && knocksDone() === 0) listen(); }, 1800);
      }

      function render() {
        const awake = isAwake(), done = isDone(), k = knocksDone(), open = fireOpen();
        const stanza = k < STANZAS.length ? STANZAS[k] : null;
        if (el.stanzaLabel) {
          el.stanzaLabel.textContent = done || !stanza
            ? 'Four stanzas, four answers.'
            : 'Stanza ' + ROMAN[k] + (stanza.by === 'servant' ? ' · the Servant knocks' : ' · your answer: knock it to him');
        }
        if (el.readPanel) el.readPanel.style.display = stanza && stanza.by === 'servant' ? '' : 'none';
        if (el.replyPanel) el.replyPanel.style.display = stanza && stanza.by === 'silvia' ? '' : 'none';
        [el.knock, el.pause, el.clear, el.send].forEach((b) => { if (b) b.disabled = !replyActive() || !!playing; });
        if (el.listen) el.listen.disabled = !awake || !stanza || !!playing;
        if (el.read) el.read.disabled = !awake || !stanza || stanza.by !== 'servant';
        if (el.sound) { el.sound.setAttribute('aria-pressed', String(soundOn())); el.sound.textContent = soundOn() ? '🔊 Sound' : '🔈 Sound off'; }
        Object.values(el.pad).forEach((b) => { if (b) b.disabled = !open || done; });
        drawAtrium();
        if (el.breath) el.breath.textContent = done ? 'The Servant is safe.' : (open && run ? 'The Servant can hold on: ' + Math.max(0, ATRIUM.breath - run.t) + (ATRIUM.breath - run.t === 1 ? ' turn' : ' turns') : '');
        if (el.turnLabel) el.turnLabel.textContent = done ? '✦ The Servant lives' : !awake ? 'The stele sleeps' : !open ? 'Stanza ' + ROMAN[k] + ' of IV' : 'Turn ' + (run ? run.t : 0);
        // how long the Servant can hold on, over the scene while Hermes crosses
        if (el.breathBox) {
          const on = !!(open && !done && run);
          el.breathBox.classList.toggle('is-on', on);
          if (on) {
            const left = Math.max(0, ATRIUM.breath - run.t);
            if (el.breathBar) el.breathBar.style.width = (100 * left / ATRIUM.breath).toFixed(1) + '%';
            el.breathBox.classList.toggle('is-late', left <= 4);
          }
        }
        if (el.knockGame) el.knockGame.classList.toggle('is-locked', !awake);
        if (el.knockInner) el.knockInner.inert = !awake;
        if (el.fireGame) el.fireGame.classList.toggle('is-locked', !open);
        if (el.fireInner) el.fireInner.inert = !open;
        if (el.proverbCard) el.proverbCard.classList.toggle('is-collapsed', awake);
        if (awake && el.keyFeedback && !el.keyFeedback.textContent) feedback(el.keyFeedback, 'Proverb spoken ✓ · on the back of the stele: 348° NNW', 'ok');
        if (el.hint) {
          let hint = '';
          if (!done && open && get(KEYS.fireHint) === 'true') hint = '✦ Hermes reads the fire: every flagstone that has not caught yet shows in how many turns it will.';
          else if (!done && awake && !open && get(KEYS.knockHint) === 'true') hint = '✦ Hermes copied the Law from the page “The Polybius Stele”: stanzas I and III are knocked row first, then column; stanzas II and IV column first, then row. Each letter is two groups.';
          el.hint.style.display = hint ? '' : 'none';
          el.hint.textContent = hint;
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        // the panel shows the part she is in; the scene shows the rest
        if (el.knockGame) el.knockGame.style.display = open ? 'none' : '';
        if (el.fireGame) el.fireGame.style.display = (!awake || done) ? 'none' : '';
        if (el.mapWrap) el.mapWrap.hidden = !(open && !done);
        syncWorld();
        setMood();
        proverbHints.refresh(); knockHints.refresh(); fireHints.refresh();
      }
      // The flames bed has no music, so this only nudges it; it rises with the stanzas and the crossing
      function setMood() {
        const amb = window.EclipseAmbience;
        if (!amb || !amb.intensity) return;
        let k;
        if (isDone()) k = 0.6;
        else if (fireOpen()) k = 0.45 + 0.15 * Math.min(1, (run ? run.t : 0) / ATRIUM.breath);
        else k = isAwake() ? 0.32 + 0.03 * knocksDone() : 0.3;
        amb.intensity(k);
      }

      // ---- The atrium of Tower II in 3D. One flagstone is S units; east is +x, north is -z; Hermes faces -z at yaw 0 ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const S = 2.4, WALL_H = 6.2, HALF = (COLS / 2) * S;
      const wx = (x) => (x - (COLS - 1) / 2) * S;
      const wz = (y) => (y - (ROWS - 1) / 2) * S;
      const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const KNEEL = [5, 5];   // the bare flagstone beside the stele where Hermes listens
      const CRACK = { x: wx(5) - 0.55, z: wz(5) - 0.6 };
      const HATCH = { x: wx(ATRIUM.hatch[0]), z: wz(ATRIUM.hatch[1]) };
      const STELE = { x: wx(ATRIUM.stele[0]), z: wz(ATRIUM.stele[1]) };
      const SIDE_SPOT = [HATCH.x - 1.05, HATCH.z + 0.95], OUT_SPOT = [HATCH.x + 0.4, HATCH.z + 1.15];
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, ending: 0, endT: 0, endFireT: null, sigilT: 0, hover: null, freeze: false, freezeTimer: 0, endTimers: [], phase: '' };
      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden);
      const canWalk = () => !!(run && fireOpen() && !isDone() && !view.freeze && !busyOverlay() && modal.style.display !== 'none');

      // the turn the scene shows: the crossing's own turn, the turn it was won on, or the first turn before it starts
      // (null: the fire has passed everywhere it could, all ash)
      function shownT() {
        if (isDone()) return view.endFireT;
        return fireOpen() && run ? run.t : 0;
      }
      const cellState = (x, y, t) => (t === null ? (IGNITE.has(x + ',' + y) ? 'ash' : 'fuel') : fuelState(x, y, t));

      // carved stone: grooves in dark with a lit lower lip, and the same grooves in white for the glow when it wakes
      function carving(draw) {
        const paintIt = (glow) => P.canvasTex(256, 512, (g, w, h) => {
          g.clearRect(0, 0, w, h);
          const cut = (fn) => {
            if (glow) { g.strokeStyle = '#fff'; g.fillStyle = '#fff'; fn(0, 0); return; }
            g.strokeStyle = 'rgba(255,236,200,0.35)'; g.fillStyle = 'rgba(255,236,200,0.35)'; fn(0, 2);
            g.strokeStyle = 'rgba(28,16,8,0.88)'; g.fillStyle = 'rgba(28,16,8,0.88)'; fn(0, 0);
          };
          draw(g, w, h, cut);
        });
        return { map: paintIt(false), glow: paintIt(true) };
      }
      function steleTextures() {
        const front = carving((g, w, h, cut) => {
          // the founders' grid, five by five, its letters worn past reading; the page in the journal keeps them
          const x0 = 38, y0 = 150, cell = 36;
          cut((dx, dy) => {
            g.lineWidth = 4;
            for (let i = 0; i <= 5; i++) {
              g.beginPath(); g.moveTo(x0 + dx, y0 + i * cell + dy); g.lineTo(x0 + cell * 5 + dx, y0 + i * cell + dy); g.stroke();
              g.beginPath(); g.moveTo(x0 + i * cell + dx, y0 + dy); g.lineTo(x0 + i * cell + dx, y0 + cell * 5 + dy); g.stroke();
            }
            g.lineWidth = 2.4;
            const r = P.rng(1818);
            for (let k = 0; k < 25; k++) {
              const cx0 = x0 + (k % 5) * cell + cell / 2, cy0 = y0 + Math.floor(k / 5) * cell + cell / 2;
              g.beginPath(); g.moveTo(cx0 - 7 + r() * 4 + dx, cy0 - 8 + dy); g.lineTo(cx0 + 2 + r() * 5 + dx, cy0 + 7 + dy); g.stroke();
              if (r() > 0.4) { g.beginPath(); g.moveTo(cx0 - 6 + dx, cy0 + 2 + r() * 3 + dy); g.lineTo(cx0 + 7 + dx, cy0 - 1 + dy); g.stroke(); }
            }
            // a sun over the grid, and six short lines of stanzas under it
            g.lineWidth = 3.5;
            g.beginPath(); g.arc(128 + dx, 92 + dy, 22, 0, Math.PI * 2); g.stroke();
            for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(128 + Math.cos(a) * 30 + dx, 92 + Math.sin(a) * 30 + dy); g.lineTo(128 + Math.cos(a) * 40 + dx, 92 + Math.sin(a) * 40 + dy); g.stroke(); }
            g.lineWidth = 3;
            for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(46 + dx, 352 + i * 22 + dy); g.lineTo(210 - (i % 3) * 18 + dx, 352 + i * 22 + dy); g.stroke(); }
          });
        });
        const back = carving((g, w, h, cut) => {
          cut((dx, dy) => {
            // a compass rose with its needle on 348°, and the bearing cut deep under it
            g.lineWidth = 4;
            g.beginPath(); g.arc(128 + dx, 150 + dy, 78, 0, Math.PI * 2); g.stroke();
            g.lineWidth = 2;
            for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16, l = i % 4 ? 8 : 16; g.beginPath(); g.moveTo(128 + Math.cos(a) * 78 + dx, 150 + Math.sin(a) * 78 + dy); g.lineTo(128 + Math.cos(a) * (78 - l) + dx, 150 + Math.sin(a) * (78 - l) + dy); g.stroke(); }
            const a = (348 - 90) * Math.PI / 180;
            g.beginPath(); g.moveTo(128 + Math.cos(a) * 62 + dx, 150 + Math.sin(a) * 62 + dy);
            g.lineTo(128 + Math.cos(a + 2.7) * 14 + dx, 150 + Math.sin(a + 2.7) * 14 + dy);
            g.lineTo(128 + Math.cos(a - 2.7) * 14 + dx, 150 + Math.sin(a - 2.7) * 14 + dy); g.closePath(); g.fill();
            g.textAlign = 'center'; g.textBaseline = 'middle';
            g.font = 'bold 26px Cinzel, Georgia, serif'; g.fillText('N', 128 + dx, 58 + dy);
            g.font = 'bold 74px Cinzel, Georgia, serif'; g.fillText('348°', 128 + dx, 300 + dy);
            g.font = 'bold 54px Cinzel, Georgia, serif'; g.fillText('NNW', 128 + dx, 372 + dy);
            g.lineWidth = 3; g.beginPath(); g.moveTo(52 + dx, 420 + dy); g.lineTo(204 + dx, 420 + dy); g.stroke();
          });
        });
        return { front, back };
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
        scene.background = new T.Color(0x070405);
        scene.fog = new T.Fog(0x120806, 26, 72);
        const camera = new T.PerspectiveCamera(50, 16 / 10, 0.2, 400);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const glow = (color, extra) => new T.Sprite(new T.SpriteMaterial(Object.assign({ map: glowTex, color, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }, extra || {})));

        // ---- The light: the library burning on the west wall, a cold glimmer from the broken roof ----
        const hemi = new T.HemisphereLight(0x5a4a7a, 0x140904, 0.22);
        scene.add(hemi);
        const fireKey = new T.DirectionalLight(0xff9a4a, 0.7);
        fireKey.position.set(-26, 15, 4);
        fireKey.target.position.set(3, 0, 0);
        fireKey.castShadow = true;
        fireKey.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(fireKey.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 70 });
        fireKey.shadow.bias = -0.0008;
        scene.add(fireKey); scene.add(fireKey.target);
        const roofLight = new T.DirectionalLight(0x8a9cff, 0.2);
        roofLight.position.set(8, 30, -12);
        scene.add(roofLight);
        const libLight = new T.PointLight(0xff7a2a, 3.2, 18, 1.6);
        libLight.position.set(wx(0) + 0.8, 2.4, wz(2.5));
        scene.add(libLight);
        const fireLights = [0, 1, 2].map(() => { const l = new T.PointLight(0xff8a3a, 0, 9, 1.8); l.position.set(0, 1.2, 0); scene.add(l); return { l, want: 0, x: 0, z: 0 }; });

        // ---- The floor: flagstones of the atrium, and the sand outside the fallen south wall ----
        const sand = SC.tex.sand(18), sandMap = sand.map.clone(), sandBump = sand.bump.clone();
        [sandMap, sandBump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(30, 30); });
        const outer = new T.Shape();
        outer.moveTo(-150, -150); outer.lineTo(150, -150); outer.lineTo(150, 150); outer.lineTo(-150, 150); outer.lineTo(-150, -150);
        const hole = new T.Path();
        hole.moveTo(-HALF - 0.2, -HALF - 0.2); hole.lineTo(-HALF - 0.2, HALF + 0.2); hole.lineTo(HALF + 0.2, HALF + 0.2); hole.lineTo(HALF + 0.2, -HALF - 0.2); hole.lineTo(-HALF - 0.2, -HALF - 0.2);
        outer.holes.push(hole);
        const groundGeo = new T.ShapeGeometry(outer);
        groundGeo.rotateX(-Math.PI / 2);
        const groundUv = groundGeo.attributes.uv;
        for (let i = 0; i < groundUv.count; i++) groundUv.setXY(i, groundUv.getX(i) / 300 + 0.5, groundUv.getY(i) / 300 + 0.5);
        const ground = new T.Mesh(groundGeo, paint({ map: sandMap, bumpMap: sandBump, bumpScale: 0.6, color: 0x4a3a32 }));
        ground.position.y = -0.04; ground.receiveShadow = true; scene.add(ground);
        // worn flagstones: a mottled face, darker at the joints (each stone tints it with its own colour)
        const flagTex = P.canvasTex(128, 128, (g, w) => {
          g.fillStyle = '#bdb2a4'; g.fillRect(0, 0, w, w);
          const r = P.rng(611);
          for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '60,50,40' : '230,220,200') + ',' + (0.05 + r() * 0.12) + ')'; g.beginPath(); g.arc(r() * w, r() * w, 1 + r() * 6, 0, Math.PI * 2); g.fill(); }
          g.strokeStyle = 'rgba(40,30,22,0.5)'; g.lineWidth = 1.2;
          for (let i = 0; i < 3; i++) { g.beginPath(); let x = r() * w, y = r() * w; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); }
          const e = g.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(30,20,14,0.5)'); e.addColorStop(0.08, 'rgba(30,20,14,0)'); e.addColorStop(0.92, 'rgba(30,20,14,0)'); e.addColorStop(1, 'rgba(30,20,14,0.5)');
          g.fillStyle = e; g.fillRect(0, 0, w, w);
          const f = g.createLinearGradient(0, 0, 0, w); f.addColorStop(0, 'rgba(30,20,14,0.5)'); f.addColorStop(0.08, 'rgba(30,20,14,0)'); f.addColorStop(0.92, 'rgba(30,20,14,0)'); f.addColorStop(1, 'rgba(30,20,14,0.5)');
          g.fillStyle = f; g.fillRect(0, 0, w, w);
        });
        const floorMat = paint({ map: flagTex, color: 0xffffff });
        const tiles = [];
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (cellAt(x, y) !== 'H') tiles.push([x, y]);
        const floor = new T.InstancedMesh(new T.BoxGeometry(S * 0.985, 0.12, S * 0.985), floorMat, tiles.length);
        floor.receiveShadow = true;
        const dummy = new T.Object3D(), tcol = new T.Color(), fr = P.rng(1818);
        tiles.forEach(([x, y], i) => {
          dummy.position.set(wx(x), -0.01 + (fr() - 0.5) * 0.02, wz(y)); dummy.rotation.set(0, (fr() - 0.5) * 0.02, 0); dummy.updateMatrix();
          floor.setMatrixAt(i, dummy.matrix);
          floor.setColorAt(i, tcol.setHSL(0.06 + fr() * 0.03, 0.16 + fr() * 0.1, 0.2 + fr() * 0.07));
        });
        scene.add(floor);

        // ---- The walls of the atrium: tall on three sides, the south wall fallen low, the side door in its middle ----
        const mas = SC.tex.masonry(5, 6, 4), wallMap = mas.map.clone(), wallBump = mas.bump.clone();
        [wallMap, wallBump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(7, 2.2); });
        const wallMat = paint({ map: wallMap, bumpMap: wallBump, bumpScale: 0.9, color: 0x5e4a3e }, 0xff9a5a, 0.08);
        const stoneMat = paint({ map: SC.tex.strata(9), color: 0x7a6452 }, 0xff9a5a, 0.1);
        const solid = (w, h, d, x, y, z, mat) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat || wallMat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
        solid(HALF * 2 + 1.2, WALL_H, 0.6, 0, WALL_H / 2, -HALF - 0.3);
        solid(0.6, WALL_H, HALF * 2, HALF + 0.3, WALL_H / 2, 0);
        solid(0.6, WALL_H, HALF * 2, -HALF - 0.3, WALL_H / 2, 0);
        const wr = P.rng(77);
        [[-HALF - 0.6, -1.15], [1.15, HALF + 0.6]].forEach(([a, b]) => {
          const n = 5;
          for (let i = 0; i < n; i++) {
            const u0 = a + (b - a) * i / n, u1 = a + (b - a) * (i + 1) / n, h = 0.6 + wr() * 1.1;
            solid(u1 - u0 + 0.02, h, 0.6, (u0 + u1) / 2, h / 2, HALF + 0.3);
          }
        });
        // the side door: two jambs and a lintel, nothing more
        [-1.05, 1.05].forEach((x) => solid(0.42, 3.1, 0.74, x, 1.55, HALF + 0.3, stoneMat));
        solid(2.6, 0.42, 0.8, 0, 3.3, HALF + 0.3, stoneMat);
        // three narrow windows in the north wall, the night blue behind them
        const winMat = new T.MeshBasicMaterial({ color: 0x04060c, fog: false });
        [-6, 0, 6].forEach((x) => { const m = new T.Mesh(new T.PlaneGeometry(0.7, 2.2), winMat); m.position.set(x, 3.8, -HALF + 0.005); scene.add(m); });
        // the roof burnt away long ago: the night is open over the atrium
        const woodTex = SC.tex.wood(0x3a2414, 5);

        // ---- The columns of the atrium (fluted, the founders' way) ----
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            if (cellAt(x, y) !== '#' || (x === ATRIUM.stele[0] && y === ATRIUM.stele[1])) continue;
            const col = SC.props.column(paint, stoneMat, { height: WALL_H - 0.7, seed: x * 9 + y });
            col.children.slice(2).forEach((ch) => col.remove(ch));   // no loose chunks on the flagstones she walks
            const cap = new T.Mesh(new T.BoxGeometry(1.0, 0.36, 1.0), stoneMat); cap.position.y = WALL_H - 0.32; cap.castShadow = true; col.add(cap);
            col.position.set(wx(x), 0, wz(y)); col.rotation.y = (x + y) * 0.7;
            scene.add(col);
          }
        }

        // ---- The stele: a plinth, and the slab that turns on it ----
        const tex = steleTextures();
        const outline = new T.Shape();
        outline.moveTo(-0.66, 0); outline.lineTo(0.66, 0); outline.lineTo(0.66, 2.3); outline.absarc(0, 2.3, 0.66, 0, Math.PI, false); outline.lineTo(-0.66, 0);
        const slabGeo = new T.ExtrudeGeometry(outline, { depth: 0.36, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 24 });
        slabGeo.translate(0, 0, -0.18);
        const stele = new T.Group();
        const plinthA = new T.Mesh(new T.BoxGeometry(2.0, 0.3, 1.3), stoneMat); plinthA.position.y = 0.15; plinthA.castShadow = plinthA.receiveShadow = true; stele.add(plinthA);
        const plinthB = new T.Mesh(new T.BoxGeometry(1.7, 0.24, 1.05), stoneMat); plinthB.position.y = 0.42; plinthB.castShadow = plinthB.receiveShadow = true; stele.add(plinthB);
        const pivot = new T.Group(); pivot.position.y = 0.54; stele.add(pivot);
        const slab = new T.Mesh(slabGeo, paint({ map: SC.tex.strata(13), color: 0xa89078 }, 0xffb070, 0.18)); slab.castShadow = slab.receiveShadow = true; pivot.add(slab);
        const faceGeo = new T.ShapeGeometry(outline, 24);
        const faceMat = (t) => {
          t.map.repeat.set(1 / 1.32, 1 / 2.96); t.map.offset.set(0.5, 0); t.glow.repeat.copy(t.map.repeat); t.glow.offset.copy(t.map.offset);
          return new T.MeshStandardMaterial({ map: t.map, transparent: true, roughness: 0.9, emissive: 0xffc060, emissiveMap: t.glow, emissiveIntensity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
        };
        const frontFace = new T.Mesh(faceGeo, faceMat(tex.front)); frontFace.position.z = 0.215; pivot.add(frontFace);
        const backFace = new T.Mesh(faceGeo, faceMat(tex.back)); backFace.position.z = -0.215; backFace.rotation.y = Math.PI; pivot.add(backFace);
        stele.position.set(STELE.x, 0, STELE.z);
        scene.add(stele);

        // ---- Where the knocks come up: a crack in the flagstone, chalk beside it, rings in the dust ----
        const crackTex = P.canvasTex(128, 128, (g, w) => {
          g.clearRect(0, 0, w, w);
          g.strokeStyle = 'rgba(10,6,4,0.9)'; g.lineWidth = 3; g.lineJoin = 'round';
          g.beginPath(); g.moveTo(8, 70); g.lineTo(30, 60); g.lineTo(44, 72); g.lineTo(66, 56); g.lineTo(84, 66); g.lineTo(120, 48); g.stroke();
          g.lineWidth = 1.6; g.beginPath(); g.moveTo(44, 72); g.lineTo(52, 96); g.moveTo(84, 66); g.lineTo(96, 84); g.stroke();
        });
        const crack = new T.Mesh(new T.PlaneGeometry(1.5, 1.5), new T.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
        crack.rotation.x = -Math.PI / 2; crack.rotation.z = 0.6; crack.position.set(CRACK.x, 0.062, CRACK.z); crack.renderOrder = 2; scene.add(crack);
        const chalkCv = document.createElement('canvas'); chalkCv.width = 512; chalkCv.height = 128;
        const chalkTex = new T.CanvasTexture(chalkCv); chalkTex.encoding = T.sRGBEncoding;
        const chalk = new T.Mesh(new T.PlaneGeometry(2.3, 0.575), new T.MeshBasicMaterial({ map: chalkTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, toneMapped: false }));
        chalk.rotation.x = -Math.PI / 2; chalk.position.set(wx(KNEEL[0]) - 0.05, 0.064, wz(KNEEL[1]) + 0.78); chalk.renderOrder = 2; scene.add(chalk);
        const knockGeo = new T.RingGeometry(0.22, 0.3, 36); knockGeo.rotateX(-Math.PI / 2);
        const knockRings = Array.from({ length: 6 }, () => {
          const m = new T.Mesh(knockGeo, new T.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          m.userData.life = 0; m.renderOrder = 3; scene.add(m);
          return m;
        });

        // ---- The library on the west wall: shelves of scrolls, all of it alight ----
        const shelfMat = paint({ map: woodTex, color: 0x2a1a10 }, 0xff6a2a, 0.3);
        const emberWood = new T.MeshStandardMaterial({ color: 0x1c100a, roughness: 0.95, emissive: 0xff4a10, emissiveIntensity: 0.7 });
        const libZ0 = wz(1) - S / 2, libZ1 = wz(4) + S / 2, libX = -HALF + 0.55;
        const libLen = libZ1 - libZ0;
        solid(1.0, 0.2, libLen, libX, 0.1, (libZ0 + libZ1) / 2, shelfMat);
        for (let k = 0; k < 5; k++) solid(1.0, 0.14, libLen, libX, 0.8 + k * 0.7, (libZ0 + libZ1) / 2, shelfMat);
        for (let k = 0; k <= 8; k++) solid(1.0, 3.8, 0.14, libX, 1.9, libZ0 + k * libLen / 8, shelfMat);
        const lr = P.rng(4242);
        const scrollGeo = new T.CylinderGeometry(0.07, 0.07, 0.8, 7); scrollGeo.rotateX(Math.PI / 2); scrollGeo.rotateY(Math.PI / 2);
        const libScrolls = new T.InstancedMesh(scrollGeo, emberWood, 120);
        for (let i = 0; i < 120; i++) {
          const k = i % 5, z = libZ0 + 0.2 + lr() * (libLen - 0.4);
          dummy.position.set(libX + (lr() - 0.5) * 0.1, 0.95 + k * 0.7 + Math.floor(lr() * 2) * 0.13, z); dummy.rotation.set(0, (lr() - 0.5) * 0.4, 0); dummy.updateMatrix();
          libScrolls.setMatrixAt(i, dummy.matrix);
        }
        scene.add(libScrolls);
        const libCells = [];
        for (let y = 0; y < ROWS; y++) if (cellAt(0, y) === 'L') libCells.push(y);
        const libFlames = libCells.map((y) => [0, 1, 2].map((k) => { const s = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.flame(), color: 0xffb070, transparent: true, opacity: 0.78, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })); s.position.set(libX + 0.3, 1.3 + k * 1.1, wz(y) + (k - 1) * 0.6); s.userData.ph = y * 3 + k; scene.add(s); return s; })).flat();

        // ---- The fuel on the floor: rush mats, fallen scrolls, beams down from the roof; each burns, then is ash ----
        const matTex = P.canvasTex(128, 128, (g, w) => {
          g.fillStyle = '#6e4a22'; g.fillRect(0, 0, w, w);
          for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#8a6232' : '#5e3e1c'; g.fillRect(0, i * 8, w, 6); }
          g.strokeStyle = '#3a2410'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, w - 4);
        });
        const scrollTex = P.canvasTex(64, 64, (g, w) => { g.fillStyle = '#d6c094'; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(90,60,30,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(6, 8 + i * 9, 40 + (i % 3) * 6, 2); });
        const matMat = paint({ map: matTex, color: 0xd0b090 }, 0xff9a5a, 0.15);
        const scrollMat = paint({ map: scrollTex, color: 0xe0d0b0 }, 0xffb070, 0.2);
        const beamMat = paint({ map: woodTex, color: 0x8a6040 }, 0xff9a5a, 0.15);
        const ashMat = new T.MeshStandardMaterial({ color: 0x2c2724, roughness: 1 });
        const ashBedMat = new T.MeshStandardMaterial({ color: 0x4a4440, roughness: 1, transparent: true, opacity: 0.85 });
        const charMat = new T.MeshStandardMaterial({ color: 0x1c120c, roughness: 0.95, emissive: 0xff4a10, emissiveIntensity: 0.6 });
        const emberTex = P.canvasTex(128, 128, (g, w) => {
          g.clearRect(0, 0, w, w);
          const gr = g.createRadialGradient(w / 2, w / 2, 6, w / 2, w / 2, w * 0.62);
          gr.addColorStop(0, 'rgba(255,170,70,0.95)'); gr.addColorStop(0.6, 'rgba(240,90,20,0.55)'); gr.addColorStop(1, 'rgba(200,50,10,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
          const r = P.rng(99); g.fillStyle = 'rgba(255,230,160,0.9)';
          for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(10 + r() * 108, 10 + r() * 108, 1 + r() * 2, 0, Math.PI * 2); g.fill(); }
        });
        const emberGeo = new T.PlaneGeometry(S * 0.94, S * 0.94); emberGeo.rotateX(-Math.PI / 2);
        const numCache = {};
        const numTex = (n) => numCache[n] || (numCache[n] = P.canvasTex(64, 64, (g, w) => {
          g.clearRect(0, 0, w, w);
          g.fillStyle = 'rgba(20,8,4,0.78)'; g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(253,186,116,0.9)'; g.lineWidth = 3; g.stroke();
          g.fillStyle = '#fed7aa'; g.font = 'bold 30px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 32, 34);
        }));
        const cells = [];
        const pr = P.rng(5353);
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            if (cellAt(x, y) !== 'f') continue;
            const v = (x * 7 + y * 3) % 3, g = new T.Group(), props = [];
            const add = (geo, mat, px, py, pz, ry, rz) => { const m = new T.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.set(0, ry || 0, rz || 0); m.castShadow = true; m.receiveShadow = true; m.userData.mat = mat; g.add(m); props.push(m); return m; };
            if (v === 0) add(new T.BoxGeometry(S * 0.8, 0.05, S * 0.62), matMat, 0, 0.085, 0, (pr() - 0.5) * 0.5);
            else if (v === 1) {
              for (let k = 0; k < 4; k++) { const sg = new T.CylinderGeometry(0.075, 0.075, 0.62, 8); sg.rotateZ(Math.PI / 2); add(sg, scrollMat, (pr() - 0.5) * 1.3, 0.13, (pr() - 0.5) * 1.3, pr() * Math.PI); }
              add(new T.BoxGeometry(0.9, 0.06, 0.5), beamMat, (pr() - 0.5) * 0.6, 0.09, (pr() - 0.5) * 0.6, pr() * 3);
            } else add(new T.BoxGeometry(S * 0.96, 0.24, 0.28), beamMat, 0, 0.2, 0, -0.5 + (pr() - 0.5) * 0.3, 0.08);
            const ash = new T.Mesh(new T.CylinderGeometry(0.5 + pr() * 0.15, 0.78, 0.04, 11), ashBedMat);
            ash.position.y = 0.06; ash.scale.set(1, 1, 0.6 + pr() * 0.35); ash.rotation.y = pr() * 3; ash.receiveShadow = true; ash.visible = false; g.add(ash);
            const ember = new T.Mesh(emberGeo, new T.MeshBasicMaterial({ map: emberTex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
            ember.position.y = 0.075; ember.rotation.y = pr() * 6; ember.renderOrder = 2; g.add(ember);
            const flames = [0, 1].map((k) => { const s = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.flame(), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })); s.position.set((k - 0.5) * 0.5, 0.6, (pr() - 0.5) * 0.4); g.add(s); return s; });
            const num = new T.Sprite(new T.SpriteMaterial({ map: numTex(0), transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
            num.scale.set(0.62, 0.62, 1); num.position.set(0.62, 0.75, -0.62); num.visible = false; num.renderOrder = 8; g.add(num);
            g.position.set(wx(x), 0, wz(y));
            scene.add(g);
            cells.push({ x, y, ig: IGNITE.get(x + ',' + y), g, props, ash, ember, flames, num, numShown: -1, state: '', acc: 0, smokeAcc: 0, after: 0, ph: pr() * 6 });
          }
        }

        // ---- The hatch of the well in the far corner: a bronze lid on a stone ring, the dark under it ----
        const well = new T.Group();
        const slabShape = new T.Shape();
        slabShape.moveTo(-S / 2 * 0.985, -S / 2 * 0.985); slabShape.lineTo(S / 2 * 0.985, -S / 2 * 0.985); slabShape.lineTo(S / 2 * 0.985, S / 2 * 0.985); slabShape.lineTo(-S / 2 * 0.985, S / 2 * 0.985); slabShape.lineTo(-S / 2 * 0.985, -S / 2 * 0.985);
        const wellHole = new T.Path(); wellHole.absarc(0, 0, 0.92, 0, Math.PI * 2, true); slabShape.holes.push(wellHole);
        const wellSlabGeo = new T.ExtrudeGeometry(slabShape, { depth: 0.12, bevelEnabled: false, curveSegments: 32 });
        wellSlabGeo.rotateX(Math.PI / 2); wellSlabGeo.translate(0, 0.05, 0);
        const wellSlab = new T.Mesh(wellSlabGeo, paint({ map: flagTex, color: 0x4a3a2e })); wellSlab.receiveShadow = true; well.add(wellSlab);
        const ringStone = new T.Mesh(new T.TorusGeometry(0.98, 0.13, 8, 36), stoneMat); ringStone.rotation.x = Math.PI / 2; ringStone.position.y = 0.08; ringStone.castShadow = true; well.add(ringStone);
        const shaft = new T.Mesh(new T.CylinderGeometry(0.92, 0.92, 3.4, 28, 1, true), new T.MeshStandardMaterial({ color: 0x2a1c14, roughness: 1, side: T.BackSide }));
        shaft.position.y = -1.66; well.add(shaft);
        const wellFloor = new T.Mesh(new T.CircleGeometry(0.92, 28), new T.MeshBasicMaterial({ color: 0x050302 })); wellFloor.rotation.x = -Math.PI / 2; wellFloor.position.y = -3.3; well.add(wellFloor);
        const bronze = paint({ color: 0x8a6430, metalness: 0.45, roughness: 0.42, emissive: 0x1a0e04 }, 0xffd08a, 0.4);
        const hinge = new T.Group(); hinge.position.set(0, 0.12, -0.92); well.add(hinge);
        const lid = new T.Group(); lid.position.z = 0.92; hinge.add(lid);
        const lidDisc = new T.Mesh(new T.CylinderGeometry(0.94, 0.94, 0.08, 32), bronze); lidDisc.castShadow = true; lid.add(lidDisc);
        [0, Math.PI / 2].forEach((r) => { const bar = new T.Mesh(new T.BoxGeometry(1.7, 0.06, 0.12), bronze); bar.position.y = 0.06; bar.rotation.y = r; lid.add(bar); });
        const lidRing = new T.Mesh(new T.TorusGeometry(0.16, 0.035, 6, 16), bronze); lidRing.rotation.x = Math.PI / 2; lidRing.position.set(0, 0.1, 0.62); lid.add(lidRing);
        const wellGlow = glow(0xffd890); wellGlow.scale.set(3.2, 3.2, 1); wellGlow.position.y = 0.5; well.add(wellGlow);
        const wellLight = new T.PointLight(0xffc878, 0, 8, 1.5); wellLight.position.y = 0.4; well.add(wellLight);
        well.position.set(HATCH.x, 0, HATCH.z);
        scene.add(well);

        // ---- The Servant, down in the dark until the hatch opens ----
        let servant = null;
        try {
          servant = SC.chars.elder(paint, { robe: 0x5c2c1a, trim: 0xd4a345, mantle: 0x2c180e });
          servant.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          servant.visible = false; scene.add(servant);
        } catch (e) { servant = null; }

        // ---- Hermes and his lamp ----
        let H = null;
        try {
          H = P.buildHermes(T, glowTex);
          H.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(H.hermes);
        } catch (e) { H = null; }
        const lamp = new T.PointLight(0xffc27a, 1.2, 6, 1.6); scene.add(lamp);

        // ---- Where she can send him: rings on the flagstones next to him, and one on his own for holding still ----
        const ringGeo = new T.RingGeometry(0.62, 0.8, 40); ringGeo.rotateX(-Math.PI / 2);
        const selfGeo = new T.RingGeometry(0.46, 0.56, 40); selfGeo.rotateX(-Math.PI / 2);
        const rings = [0, 1, 2, 3, 4].map((i) => {
          const m = new T.Mesh(i === 4 ? selfGeo : ringGeo, new T.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
          m.position.y = 0.2; m.renderOrder = 6; m.visible = false; scene.add(m);
          return m;
        });

        // ---- The feel: a hot lens, sparks and smoke of its own, a body for Hermes ----
        let fx = null, flames = null, smoke = null;
        try {
          if (window.EclipseFX) {
            fx = window.EclipseFX.kit(renderer, scene, H, {
              look: { bloom: 0.9, threshold: 0.8, knee: 0.18, vignette: 0.42, grain: 0.034, ca: 0.14, sat: 1.06, contrast: 1.06, gain: [1.04, 0.98, 0.92], shade: 0.22, shadeColor: [0.5, 0.42, 0.7] },
              sandColor: 0x6a5a4e, printsOn: false, scale: 1, wind: [0.25, 0, -0.15], blowColor: 0x5a1a04, sparkColor: 0xffc070,
              ambient: () => ({ x: 0, z: 0 }), ambientRadius: 10, ambientAlpha: 0.05, ambientColor: 0x5a4a44, ambientEvery: 0.18
            });
            flames = window.EclipseFX.particles(scene, { max: lowPower ? 700 : 1400, additive: true, wind: [0.2, 0, -0.12] });
            smoke = window.EclipseFX.particles(scene, { max: lowPower ? 320 : 600, wind: [0.35, 0, -0.25], renderOrder: 4 });
          }
        } catch (e) { fx = null; }

        return { T, renderer, scene, camera, lowPower, hemi, fireKey, libLight, fireLights, floor, stele, pivot, frontFace, backFace, crack, chalk, chalkCv, chalkTex, knockRings, knockNext: 0,
          libFlames, libScrolls, emberWood, charMat, ashMat, cells, numTex, well, hinge, wellGlow, wellLight, servant, H, hermes: H && H.hermes, lamp, rings, fx, flames, smoke,
          ray: new T.Raycaster(), floorPlane: new T.Plane(new T.Vector3(0, 1, 0), -0.06), hMove: null, hGoal: null, steleAngle: 0, lidOpen: 0, servantRise: 0, chalkKey: null, libAcc: 0,
          cam: { yaw: 0, pitch: 0.9, dist: 18, tYaw: 0, tPitch: 0.9, tDist: 18, yaw0: 0, dist0: 18, p: null, l: null } };
      }

      // ---- Keeping the scene in step with the game ----
      const ease = (u) => u * u * (3 - 2 * u);
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
        obj.rotation.y = mv.ry0 + shortTurn(mv.ry0, mv.ry1) * Math.min(1, mv.t / Math.min(0.22, mv.dur));
        return u >= 1 ? null : mv;
      }
      // where Hermes belongs now, and which way he looks when he gets there
      function hermesSpot() {
        const e = view.ending === 1 ? (performance.now() - view.endT) / 1000 : 99;
        if (isDone()) return e < 0.7 ? { at: [HATCH.x, HATCH.z] } : { at: SIDE_SPOT, face: [OUT_SPOT[0] - SIDE_SPOT[0], OUT_SPOT[1] - SIDE_SPOT[1]] };
        if (fireOpen() && run) return { at: [wx(run.x), wz(run.y)] };
        if (isAwake()) return { at: [wx(KNEEL[0]) + 0.3, wz(KNEEL[1]) + 0.1], face: [CRACK.x - wx(KNEEL[0]) - 0.3, CRACK.z - wz(KNEEL[1]) - 0.1] };
        return { at: [STELE.x + 1.35, STELE.z + 1.55], face: [-1.35, -1.55] };
      }
      function steerHermes(snap) {
        if (!G || !G.hermes) return;
        const h = G.hermes, want = hermesSpot();
        G.hFace = want.face || null;
        const [x, z] = want.at;
        if (!snap && G.hGoal && Math.abs(G.hGoal[0] - x) + Math.abs(G.hGoal[1] - z) < 0.01) return;
        G.hGoal = [x, z];
        if (G.hMove) { stepMv(h, G.hMove, 99); G.hMove = null; }
        const dx = x - h.position.x, dz = z - h.position.z, d = Math.hypot(dx, dz);
        if (snap) { h.position.set(x, 0.05, z); if (want.face) h.rotation.y = faceYaw(want.face[0], want.face[1]); return; }
        if (d < 0.01) return;
        G.hMove = moveTo(h, x, z, d <= S * 1.1 ? 0.34 : Math.min(4, d / 2.2), faceYaw(dx, dz));
      }
      function applyCell(c, st, animate) {
        const was = c.state;
        c.state = st;
        const burning = st === 'fire';
        // what the fire leaves: the same mats and beams, charred grey on a bed of ash
        c.props.forEach((m) => { m.material = burning ? G.charMat : st === 'ash' ? G.ashMat : m.userData.mat; });
        c.ash.visible = st === 'ash';
        if (!animate || !was || was === st || !G.fx) { if (st === 'ash' && !animate) c.after = 0; return; }
        const at = { x: wx(c.x), y: 0.3, z: wz(c.y) };
        if (st === 'glow') G.fx.sparks.emit(at, 6, { color: 0xff9a40, size: [0.05, 0.1], speed: [0.1, 0.4], up: [0.4, 1.0], life: [0.5, 1], alpha: 0.9, gravity: -0.4, spread: 1.4 });
        else if (st === 'fire' && G.flames) G.flames.emit(at, 22, { color: 0xff8a2a, size: [0.4, 0.8], grow: 0.4, speed: [0.2, 0.8], up: [1.6, 3.0], gravity: 1.2, drag: 1.4, life: [0.4, 0.8], alpha: 0.85, fadeIn: 0.05, spread: 1.6, tint: 0.15 });
        else if (st === 'ash') {
          c.after = 1;
          G.fx.puff({ x: at.x, y: 0.15, z: at.z }, 10, { color: 0x4a4440, alpha: 0.35, size: [0.3, 0.6], up: [0.3, 0.8] });
          G.fx.sparks.emit(at, 8, { color: 0xffb060, size: [0.04, 0.08], speed: [0.2, 0.6], up: [0.6, 1.4], life: [0.6, 1.2], alpha: 0.9, gravity: -0.6, spread: 1.2 });
        }
      }
      function syncWorld() {
        if (!G || view.freeze) return;
        const snap = view.snapNext;
        const t = shownT(), hintOn = get(KEYS.fireHint) === 'true' && fireOpen() && !isDone();
        G.cells.forEach((c) => {
          applyCell(c, cellState(c.x, c.y, t), !snap);
          const show = hintOn && c.ig !== undefined && (c.state === 'fuel' || c.state === 'glow');
          c.num.visible = show;
          if (show) { const n = c.ig - t; if (n !== c.numShown) { c.numShown = n; c.num.material.map = numTexOf(n); c.num.material.needsUpdate = true; } }
        });
        steerHermes(snap);
        placeRings();
        view.snapNext = false;
      }
      const numTexOf = (n) => G.numTex(n);
      // what a flagstone means for Hermes this turn: its words, and the colour of its ring (null: he cannot go)
      function cellWords(x, y) {
        if (!run) return null;
        const t = run.t, dx = x - run.x, dy = y - run.y;
        if (dx === 0 && dy === 0) return burningAt(x, y, t + 1) ? { text: '⏸ Hold still · the fire reaches this flagstone next turn', ring: 'amber' } : { text: '⏸ Hold still · the fire takes a turn', ring: 'gold' };
        const dir = dy < 0 ? '▲ North' : dy > 0 ? '▼ South' : dx < 0 ? '◀ West' : '▶ East';
        const c = cellAt(x, y);
        if (!c) return { text: dir + ' · the wall of the atrium', ring: null };
        if (c === '#') return { text: dir + ' · ' + (x === ATRIUM.stele[0] && y === ATRIUM.stele[1] ? 'the stele' : 'a column') + ' stands in the way', ring: null };
        if (c === 'L') return { text: dir + ' · the library is a wall of fire', ring: null };
        if (c === 'H') return { text: dir + ' · ✦ the hatch of the well', ring: 'gold' };
        if (c !== 'f') return { text: dir + ' · bare stone: it never burns', ring: 'gold' };
        const st = fuelState(x, y, t);
        if (st === 'ash') return { text: dir + ' · ash: it cannot burn again', ring: 'gold' };
        if (st === 'fire') return burningAt(x, y, t + 1) ? { text: dir + ' · burning: wait for its ash, or go round', ring: 'red' } : { text: dir + ' · its last flames: ash as he steps in', ring: 'gold' };
        if (st === 'glow') return { text: dir + ' · glowing: it catches next turn', ring: 'amber' };
        return { text: dir + ' · mats and scrolls: they will burn', ring: 'gold' };
      }
      const RING_COL = { gold: 0xfde68a, amber: 0xf59e0b, red: 0xef4444 };
      function placeRings() {
        const on = canWalk() || (run && fireOpen() && !isDone() && busyOverlay());
        [[0, -1], [1, 0], [0, 1], [-1, 0], [0, 0]].forEach(([dx, dy], i) => {
          const m = G.rings[i], x = run ? run.x + dx : 0, y = run ? run.y + dy : 0;
          const w = on ? cellWords(x, y) : null;
          m.visible = !!(w && w.ring);
          if (!m.visible) { m.userData.cell = null; return; }
          m.position.x = wx(x); m.position.z = wz(y);
          m.material.color.setHex(RING_COL[w.ring]);
          m.userData.cell = [x, y]; m.userData.kind = w.ring;
        });
        setHover(view.hover);
      }
      function setHover(cell) {
        view.hover = cell || null;
        let words = null;
        if (view.hover && canWalk()) {
          const dx = view.hover[0] - run.x, dy = view.hover[1] - run.y;
          if (Math.abs(dx) + Math.abs(dy) <= 1) words = cellWords(view.hover[0], view.hover[1]);
        }
        if (el.canvas) el.canvas.style.cursor = words && words.ring ? 'pointer' : '';
        if (!el.aim) return;
        if (words) {
          el.aim.textContent = words.text;
          el.aim.classList.add('is-on');
          el.aim.classList.toggle('is-warn', words.ring === 'amber');
          el.aim.classList.toggle('is-bad', !words.ring || words.ring === 'red');
        } else el.aim.classList.remove('is-on');
      }

      // ---- The camera: each part has its own view; she can turn it, raise it and come closer ----
      function bindPointer() {
        const c = el.canvas;
        if (!c || c.__stelePointer) return;
        c.__stelePointer = true;
        c.style.touchAction = 'none';
        const pt = { down: false, x: 0, y: 0, moved: 0 };
        c.addEventListener('pointerdown', (e) => { pt.down = true; pt.x = e.clientX; pt.y = e.clientY; pt.moved = 0; try { c.setPointerCapture(e.pointerId); } catch (err) {} });
        c.addEventListener('pointermove', (e) => {
          if (pt.down) {
            const dx = e.clientX - pt.x, dy = e.clientY - pt.y;
            pt.moved += Math.abs(dx) + Math.abs(dy);
            if (G && pt.moved > 4) {
              G.cam.tYaw = clamp(G.cam.tYaw - dx * 0.004, G.cam.yaw0 - 0.8, G.cam.yaw0 + 0.8);
              G.cam.tPitch = clamp(G.cam.tPitch + dy * 0.004, 0.15, 1.35);
            }
            pt.x = e.clientX; pt.y = e.clientY;
          } else setHover(cellUnder(e));
        });
        const up = (e) => {
          if (!pt.down) return;
          pt.down = false;
          if (pt.moved > 6 || !G) return;
          const cell = cellUnder(e);
          if (cell && canWalk()) {
            const dx = cell[0] - run.x, dy = cell[1] - run.y;
            if (Math.abs(dx) + Math.abs(dy) <= 1) takeTurn(dx, dy);
          }
        };
        c.addEventListener('pointerup', up);
        c.addEventListener('pointercancel', () => { pt.down = false; });
        c.addEventListener('pointerleave', () => setHover(null));
        c.addEventListener('wheel', (e) => { if (!G) return; e.preventDefault(); G.cam.tDist = clamp(G.cam.tDist * Math.exp(e.deltaY * 0.0012), G.cam.dist0 * 0.5, G.cam.dist0 * 1.6); }, { passive: false });
        c.addEventListener('dblclick', () => { if (G) { view.phase = ''; } });
      }
      function cellUnder(e) {
        if (!G) return null;
        const r = el.canvas.getBoundingClientRect();
        const ndc = new G.T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        G.ray.setFromCamera(ndc, G.camera);
        const p = new G.T.Vector3();
        if (!G.ray.ray.intersectPlane(G.floorPlane, p)) return null;
        const x = Math.round(p.x / S + (COLS - 1) / 2), y = Math.round(p.z / S + (ROWS - 1) / 2);
        return x >= 0 && y >= 0 && x < COLS && y < ROWS ? [x, y] : null;
      }
      // each part of the station frames its own corner of the atrium
      function cameraPhase() {
        if (isDone() || view.ending) return 'end';
        if (!isAwake() || (view.sigilT && performance.now() - view.sigilT < 3400)) return 'stele';
        if (!fireOpen()) return 'knocks';
        return 'fire';
      }
      const PHASES = {
        stele: { yaw: 0.45, pitch: 0.32, dist: 7.6 },
        knocks: { yaw: -0.3, pitch: 0.6, dist: 9.5 },
        fire: { yaw: 0, pitch: 0.98, dist: 20 },
        end: { yaw: 0.1, pitch: 0.5, dist: 8.2 }
      };
      function placeCamera(dt, snap) {
        const cam = G.camera, c = G.cam;
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else {
          const ph = cameraPhase();
          if (ph !== view.phase) {
            view.phase = ph;
            const d = PHASES[ph];
            c.tYaw = c.yaw0 = d.yaw; c.tPitch = d.pitch; c.tDist = c.dist0 = d.dist;
          }
          const k = Math.min(1, dt * 4);
          c.yaw += (c.tYaw - c.yaw) * k; c.pitch += (c.tPitch - c.pitch) * k; c.dist += (c.tDist - c.dist) * k;
          let tx, ty, tz;
          if (ph === 'stele') { tx = STELE.x; ty = 1.5; tz = STELE.z; }
          else if (ph === 'knocks') { tx = STELE.x + 0.9; ty = 0.9; tz = STELE.z + 0.9; }
          else if (ph === 'end') { tx = HATCH.x - 0.4; ty = 0.9; tz = HATCH.z + 0.9; }
          else { const h = G.hermes ? G.hermes.position : { x: 0, z: HALF }; tx = h.x * 0.5; ty = 0; tz = h.z * 0.5 - 0.4; }
          const cp = Math.cos(c.pitch);
          p = [tx + Math.sin(c.yaw) * cp * c.dist, ty + Math.sin(c.pitch) * c.dist, tz + Math.cos(c.yaw) * cp * c.dist];
          l = [tx, ty, tz];
        }
        if (!c.p || snap) { c.p = p.slice(); c.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * 3.4);
          for (let i = 0; i < 3; i++) { c.p[i] += (p[i] - c.p[i]) * k; c.l[i] += (l[i] - c.l[i]) * k; }
        }
        cam.position.set(c.p[0], c.p[1], c.p[2]);
        cam.lookAt(c.l[0], c.l[1], c.l[2]);
      }
      function openingShots() {
        return [
          { from: { p: [0, 30, 26], l: [0, 0, -1] }, to: { p: [0, 21, 18], l: [0, 0, -2] }, dur: 6, kicker: 'STATION 18', title: 'THE POLYBIUS STELE', line: 'Tower II is burning. The library along the west wall has been alight since dusk.' },
          { from: { p: [wx(2), 2.6, wz(7)], l: [wx(0), 2, wz(1)] }, to: { p: [wx(2.6), 3.4, wz(6)], l: [wx(0), 1.6, wz(2)] }, dur: 5.5, line: 'The raiders lit it and went back to their wagons, to let the fire do their work for them.' },
          { from: { p: [STELE.x + 4.6, 3, STELE.z + 6], l: [STELE.x, 1.6, STELE.z] }, to: { p: [STELE.x + 2.7, 2.2, STELE.z + 4.3], l: [STELE.x, 1.6, STELE.z] }, dur: 5.5, line: 'In the middle of it all, untouched, the stele of the founders. And Hermes, who came in by a side door.' }
        ];
      }

      // ---- The frame ----
      function drawChalk() {
        const key = heard.join(',');
        if (key === G.chalkKey) return;
        G.chalkKey = key;
        const g = G.chalkCv.getContext('2d'), W = G.chalkCv.width, Hh = G.chalkCv.height;
        g.clearRect(0, 0, W, Hh);
        g.strokeStyle = 'rgba(244,240,228,0.85)'; g.lineCap = 'round'; g.lineWidth = 6;
        const r = P.rng(heard.length * 31 + 7);
        let x = 18;
        heard.forEach((n, i) => {
          if (i > 0) x += i % 2 ? 22 : 46;   // a short gap between the two groups, a long one between letters
          for (let k = 0; k < n; k++) {
            g.beginPath(); g.moveTo(x + (r() - 0.5) * 3, 26 + r() * 6); g.lineTo(x + (r() - 0.5) * 5, 96 + r() * 8); g.stroke();
            x += 15;
          }
        });
        G.chalkTex.needsUpdate = true;
      }
      function drawFrame(now, dt) {
        if (!G) return;
        const t = now / 1000, rm = reduced(), done = isDone(), lp = G.lowPower ? 0.6 : 1;
        // Hermes: walks where the part needs him, turns to what he is doing (and stays where the fire caught him)
        if (!view.freeze) steerHermes(false);
        if (G.hermes) {
          if (G.hMove) G.hMove = stepMv(G.hermes, G.hMove, dt);
          else if (G.hFace) G.hermes.rotation.y += shortTurn(G.hermes.rotation.y, faceYaw(G.hFace[0], G.hFace[1])) * Math.min(1, dt * 5);
          G.hermes.position.y = 0.05;
          if (G.H && G.H.flame) G.H.flame.getWorldPosition(G.lamp.position); else G.lamp.position.set(G.hermes.position.x, 1.4, G.hermes.position.z);
          G.lamp.intensity = 1.2 + (rm ? 0 : Math.sin(t * 11) * 0.08);
        }
        // the stele turns on its base for the proverb, grinding and shedding dust; its carving glows a moment
        const want = isAwake() ? Math.PI : 0;
        const before = G.steleAngle;
        G.steleAngle += rm ? want - G.steleAngle : clamp(want - G.steleAngle, -dt * 1.35, dt * 1.35);
        G.pivot.rotation.y = G.steleAngle;
        if (Math.abs(G.steleAngle - before) > 1e-4 && G.fx && Math.random() < dt * 12) {
          G.fx.puff({ x: STELE.x + (Math.random() - 0.5) * 1.4, y: 0.55, z: STELE.z + (Math.random() - 0.5) * 1.0 }, 3, { color: 0x8a7660, alpha: 0.3, size: [0.2, 0.4], up: [0.2, 0.5] });
          G.fx.shake.add(0.012);
        }
        const sk = view.sigilT ? Math.max(0, 1 - (now - view.sigilT) / 3600) : 0;
        G.backFace.material.emissiveIntensity = sk * 1.6 + (isAwake() ? 0.12 : 0);
        G.frontFace.material.emissiveIntensity = isAwake() ? 0 : 0.05 + (rm ? 0 : 0.04 * Math.sin(t * 1.6));
        // the chalk and the rings of every knock
        drawChalk();
        G.knockRings.forEach((m) => {
          if (m.userData.life <= 0) { m.material.opacity = 0; return; }
          m.userData.life = Math.max(0, m.userData.life - dt * 1.5);
          const u = 1 - m.userData.life;
          m.scale.setScalar(1 + u * 4.5);
          m.material.opacity = m.userData.life * 0.9;
        });
        // the fuel on the floor: embers breathe, flames dance and shrink as they burn out, ash cools
        G.cells.forEach((c) => {
          const at = { x: wx(c.x), y: 0.15, z: wz(c.y) };
          if (c.state === 'glow') c.ember.material.opacity = rm ? 0.5 : 0.38 + 0.24 * Math.sin(t * 4 + c.ph);
          else if (c.state === 'fire') c.ember.material.opacity = 0.85;
          else if (c.state === 'ash') { c.after = Math.max(0, c.after - dt * 0.35); c.ember.material.opacity = c.after * 0.45; }
          else c.ember.material.opacity = 0;
          const left = c.state === 'fire' ? Math.max(1, (c.ig + ATRIUM.burn) - (shownT() === null ? 99 : shownT())) : 0;
          const k = left / ATRIUM.burn;
          c.flames.forEach((s, i) => {
            if (!left) { s.material.opacity = 0; return; }
            const fl = rm ? 1 : 1 + Math.sin(t * (9 + i * 3) + c.ph) * 0.1 + Math.sin(t * 23 + c.ph * 2) * 0.05;
            const h = (0.9 + 1.5 * k) * fl, w = (0.7 + 0.6 * k) * (2 - fl);
            s.scale.set(w, h, 1); s.position.y = h * 0.42; s.material.opacity = 0.9;
          });
          if (left && (G.flames || G.smoke)) {
            c.acc += dt * (5 + 9 * k) * lp;
            const n = Math.floor(c.acc); c.acc -= n;
            if (n && G.flames) G.flames.emit(at, n, { color: 0xff8a2a, size: [0.25, 0.55].map((v) => v * (0.6 + k * 0.6)), grow: 0.35, speed: [0, 0.25], up: [1.0, 2.0], gravity: 0.9, drag: 1.2, life: [0.45, 0.85], alpha: 0.75, fadeIn: 0.05, spread: 1.2, tint: 0.15 });
            c.smokeAcc += dt * 1.1 * lp;
            if (c.smokeAcc >= 1 && G.smoke) { c.smokeAcc -= 1; G.smoke.emit({ x: at.x, y: 1.2 + k, z: at.z }, 1, { color: 0x2a2522, size: [0.9, 1.5], grow: 2.6, speed: [0.05, 0.25], up: [0.7, 1.2], gravity: 0.2, drag: 0.4, life: [2.6, 4.2], alpha: 0.32, fadeIn: 0.2, spread: 0.8, rise: 0.6 }); }
          }
        });
        // the library: tall flames that never die down, embers flying up the wall
        G.libFlames.forEach((s) => {
          const fl = rm ? 1 : 1 + Math.sin(t * 8 + s.userData.ph) * 0.12 + Math.sin(t * 21 + s.userData.ph * 3) * 0.06;
          s.scale.set(1.5 * (2 - fl), 2.4 * fl, 1);
        });
        G.emberWood.emissiveIntensity = rm ? 0.7 : 0.6 + 0.2 * Math.sin(t * 3.1) + 0.1 * Math.sin(t * 11);
        G.charMat.emissiveIntensity = rm ? 0.6 : 0.5 + 0.2 * Math.sin(t * 5.3);
        if (G.flames) {
          G.libAcc += dt * 26 * lp;
          const n = Math.floor(G.libAcc); G.libAcc -= n;
          for (let i = 0; i < n; i++) {
            const z = wz(1) - S / 2 + Math.random() * S * 4;
            G.flames.emit({ x: -HALF + 0.9, y: 0.3 + Math.random() * 3.2, z }, 1, { color: 0xff7a22, size: [0.4, 0.8], grow: 0.35, speed: [0, 0.3], up: [1.2, 2.4], gravity: 1.0, drag: 1.1, life: [0.5, 1.0], alpha: 0.8, fadeIn: 0.05, spread: 0.6, tint: 0.15 });
            if (G.smoke && Math.random() < 0.18) G.smoke.emit({ x: -HALF + 1.2, y: 3.6, z }, 1, { color: 0x221c1a, size: [1.2, 2.0], grow: 2.4, speed: [0.1, 0.3], up: [0.6, 1.0], gravity: 0.15, drag: 0.3, life: [3.5, 5.5], alpha: 0.38, fadeIn: 0.2, spread: 0.8 });
          }
          if (G.fx && Math.random() < dt * 3) G.fx.sparks.emit({ x: -HALF + 1, y: 1 + Math.random() * 2.5, z: wz(1) + Math.random() * S * 3 }, 2, { color: 0xffb050, size: [0.04, 0.08], speed: [0.2, 0.8], up: [1.2, 2.6], life: [1.2, 2.2], alpha: 0.95, gravity: 0.15, drag: 0.6, spread: 0.6 });
        }
        // the light of the fire: the library always, and three lights that follow the flagstones burning nearest Hermes
        G.libLight.intensity = rm ? 3.2 : 3.0 + Math.sin(t * 13) * 0.25 + Math.sin(t * 5.1) * 0.3;
        G.fireKey.intensity = rm ? 0.85 : 0.8 + Math.sin(t * 9.7) * 0.06 + Math.sin(t * 3.3) * 0.06;
        const hp = G.hermes ? G.hermes.position : { x: 0, z: 0 };
        const near = G.cells.filter((c) => c.state === 'fire').sort((a, b) => Math.hypot(wx(a.x) - hp.x, wz(a.y) - hp.z) - Math.hypot(wx(b.x) - hp.x, wz(b.y) - hp.z));
        G.fireLights.forEach((f, i) => {
          const c = near[i];
          if (c) { if (f.want === 0) { f.x = wx(c.x); f.z = wz(c.y); } f.want = 2.2; f.x += (wx(c.x) - f.x) * Math.min(1, dt * 4); f.z += (wz(c.y) - f.z) * Math.min(1, dt * 4); }
          else f.want = 0;
          f.l.position.set(f.x, 1.3, f.z);
          const goal = f.want * (rm ? 1 : 1 + Math.sin(t * 17 + i * 2) * 0.12);
          f.l.intensity += (goal - f.l.intensity) * Math.min(1, dt * 6);
        });
        // the rings where she can send him
        G.rings.forEach((m) => {
          if (!m.visible) return;
          const c = m.userData.cell, hot = c && view.hover && c[0] === view.hover[0] && c[1] === view.hover[1];
          m.material.opacity = hot ? 0.95 : 0.42 + (rm ? 0 : 0.16 * Math.sin(t * 3.4));
          m.scale.setScalar(hot ? 1.16 : 1);
        });
        // the well: the hatch lifts, light comes up, and then the Servant
        const e = view.ending === 1 ? (now - view.endT) / 1000 : (done ? 99 : -1);
        const lid = done ? clamp((e - 1.2) / 1.5, 0, 1) : 0;
        G.lidOpen = rm && done ? 1 : lid;
        G.hinge.rotation.x = ease(G.lidOpen) * 1.95;
        G.wellGlow.material.opacity = G.lidOpen * (0.7 + (rm ? 0 : 0.15 * Math.sin(t * 2.2)));
        G.wellLight.intensity = G.lidOpen * 2.4;
        if (G.servant) {
          const rise = done ? (rm ? 1 : clamp((e - 2.4) / 2.2, 0, 1)) : 0;
          const out = done ? (rm ? 1 : clamp((e - 4.8) / 1.2, 0, 1)) : 0;
          G.servant.visible = done && (rise > 0 || rm);
          G.servantRise = rise;
          G.servant.position.set(HATCH.x + (OUT_SPOT[0] - HATCH.x) * ease(out), -2.6 + 2.65 * ease(rise), HATCH.z + (OUT_SPOT[1] - HATCH.z) * ease(out));
          if (G.hermes) G.servant.rotation.y = faceYaw(G.hermes.position.x - G.servant.position.x, G.hermes.position.z - G.servant.position.z);
          if (G.servant.userData.update) G.servant.userData.update(t);
        }
        if (view.ending === 1 && e > 10) view.ending = 0;
        if (G.fx) G.fx.frame(dt, G.camera);
        if (G.flames) G.flames.update(dt, G.camera, G.renderer);
        if (G.smoke) G.smoke.update(dt, G.camera, G.renderer);
        placeCamera(dt, false);
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
      function sceneKnock(fromBelow) {
        if (!G) return;
        const h = G.hermes ? G.hermes.position : null;
        const at = fromBelow || !h ? CRACK : { x: h.x - 0.4, z: h.z - 0.35 };
        const r = G.knockRings[G.knockNext++ % G.knockRings.length];
        r.position.set(at.x, 0.075, at.z); r.userData.life = 1; r.scale.setScalar(1);
        r.material.color.setHex(fromBelow ? 0xfde68a : 0xfdba74);
        if (G.fx) {
          G.fx.puff({ x: at.x, y: 0.1, z: at.z }, fromBelow ? 4 : 3, { color: 0x6a5a4a, alpha: 0.3, size: [0.15, 0.3], up: [0.2, 0.6], speed: [0.1, 0.4] });
          G.fx.shake.add(fromBelow ? 0.04 : 0.025);
        }
        if (!fromBelow) react('nod');
      }
      function sceneProverb() {
        view.sigilT = performance.now();
        if (G && G.fx) G.fx.triumph({ x: STELE.x, y: 2.2, z: STELE.z }, 0.6);
        subtitle('The stele turns on its base, stone grinding on stone. On its back, cut deep: 348°, north-north-west.', 5.2, 'act');
      }
      function sceneStanza(i) {
        const lines = [
          ['WHO, knocks the stone. He wants to know who is up here. The next word of the proverb is the answer, and the stanza is yours.', 'nod'],
          ['A long scrape under the stone, then quick, light knocks, like a man laughing. He understood.', 'cheer'],
          ['WELL. The old well of the atrium: its hatch is in the far corner, past the burning mats.', 'wonder'],
          ['ASH. Where the fire has passed, it cannot burn twice. Hermes ties his scarf over his mouth and goes back to the side door.', 'nod']
        ];
        const [line, kind] = lines[i] || lines[0];
        subtitle(line, 5.5, 'act');
        react(kind);
        if (i === 1 && G && G.fx) G.fx.triumph({ x: CRACK.x, y: 0.3, z: CRACK.z }, 0.5);
      }
      function sceneWorry() { react('worry'); }
      function sceneBump(nx, ny, c) {
        if (!G || !G.fx) return;
        G.fx.shake.add(0.04);
        if (c === 'L' || c === 'f') react('flinch');
      }
      function sceneLose(why) {
        if (!G) return;
        const h = G.hermes ? G.hermes.position : null;
        const at = h ? { x: h.x, y: 0.4, z: h.z } : null;
        if (G.fx) G.fx.blow(at, why === 'fire' ? 0.7 : 0.4);
        if (why === 'fire' && G.flames && at) G.flames.emit(at, 30, { color: 0xff8a2a, size: [0.4, 0.8], grow: 0.4, speed: [0.4, 1.2], up: [1.4, 2.6], gravity: 1.0, life: [0.4, 0.8], alpha: 0.85, spread: 0.8 });
        if (el.stage) { el.stage.classList.remove('stele3d-flash'); void el.stage.offsetWidth; el.stage.classList.add('stele3d-flash'); }
        subtitle(why === 'fire' ? 'The fire reaches Hermes. He beats at his smouldering sleeve and falls back to the side door.' : 'The knocks from the well grow faint. Hermes turns back to the side door, to find a quicker way.', 4.6, 'act');
        if (reduced() || !el.fade || modal.style.display === 'none') { view.snapNext = true; return; }
        // the scene holds the moment, then fades and starts the crossing again from the side door
        view.freeze = true;
        clearTimeout(view.freezeTimer);
        view.freezeTimer = setTimeout(() => {
          el.fade.classList.add('is-on');
          view.freezeTimer = setTimeout(() => { view.freeze = false; view.snapNext = true; syncWorld(); el.fade.classList.remove('is-on'); }, 450);
        }, 650);
      }
      function sceneHatch() {
        view.ending = 1; view.endT = performance.now(); view.endFireT = run ? run.t : null;
        subtitle('Hermes drops to his knees at the bronze hatch, takes the ring in both hands, and heaves.', 4, 'act');
        view.endTimers.forEach(clearTimeout);
        view.endTimers = [
          setTimeout(() => { if (modal.style.display !== 'none') subtitle('Out of the dark comes the Servant: alive, black with smoke, a wet cloth over his mouth and a roll of charts in his arms.', 6, 'act'); }, reduced() ? 300 : 3000),
          setTimeout(() => { if (G && G.fx && modal.style.display !== 'none') G.fx.triumph({ x: HATCH.x, y: 1.2, z: HATCH.z + 0.6 }, 1.2); }, reduced() ? 400 : 5600)
        ];
      }

      // ---- Controls ----
      if (el.speak) el.speak.addEventListener('click', speakProverb);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakProverb(); });
      if (el.listen) el.listen.addEventListener('click', listen);
      if (el.read) el.read.addEventListener('click', readWord);
      if (el.wordInput) el.wordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') readWord(); });
      if (el.sound) el.sound.addEventListener('click', () => { set(KEYS.sound, soundOn() ? 'off' : 'on'); render(); });
      if (el.knock) el.knock.addEventListener('click', knock);
      if (el.pause) el.pause.addEventListener('click', pauseKnock);
      if (el.clear) el.clear.addEventListener('click', clearReply);
      if (el.send) el.send.addEventListener('click', () => sendReply(false));
      const STEPS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], wait: [0, 0] };
      Object.keys(STEPS).forEach((k) => { if (el.pad[k]) el.pad[k].addEventListener('click', () => takeTurn(STEPS[k][0], STEPS[k][1])); });
      const KEYMAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'wait' };
      const press = (k) => { const b = el.pad[k]; if (!b) return; b.classList.add('is-pressed'); setTimeout(() => b.classList.remove('is-pressed'), 130); };
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'none' || !fireOpen() || isDone() || busyOverlay()) return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const k = KEYMAP[e.key];
        if (!k) return;
        if (k === 'wait' && e.target && e.target.tagName === 'BUTTON' && !modal.contains(e.target)) return;
        e.preventDefault();
        press(k);
        takeTurn(STEPS[k][0], STEPS[k][1]);
      });
      document.addEventListener('keyup', (e) => {
        if (e.key === ' ' && modal.style.display !== 'none' && fireOpen() && !isDone() && e.target && e.target.tagName === 'BUTTON' && modal.contains(e.target)) e.preventDefault();
      });
      if (el.atrium) {
        el.atrium.addEventListener('click', (e) => {
          if (!run || !fireOpen() || isDone()) return;
          const ctm = el.atrium.getScreenCTM();
          if (!ctm) return;
          const pt = el.atrium.createSVGPoint();
          pt.x = e.clientX; pt.y = e.clientY;
          const p = pt.matrixTransform(ctm.inverse());
          const x = Math.floor(p.x / C), y = Math.floor(p.y / C);
          const dx = x - run.x, dy = y - run.y;
          if (Math.abs(dx) + Math.abs(dy) <= 1) takeTurn(dx, dy);
        });
      }

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_arch_solstice_completed') !== 'true') return false;
        return typeof window.isSteleMarchOver === 'function' ? window.isSteleMarchOver() : false;
      }
      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('stele3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('stele3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-stele-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
        if (G) placeRings();
      }
      function focusTarget() {
        if (isDone()) return el.finish;
        if (!isAwake()) return el.keyInput;
        if (fireOpen()) return el.pad.up;
        return STANZAS[knocksDone()].by === 'silvia' ? el.knock : el.listen;
      }
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        if (G) placeRings();
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-stele-howto-back'), hn = $('btn-stele-howto-next'), hs = $('btn-stele-howto-skip');
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
        if (panel && panel.contains(e.target) && panel.scrollHeight > panel.clientHeight + 1) return;
        if (el.howto && el.howto.contains(e.target)) return;
        if (e.target === el.canvas) return;
        e.preventDefault();
      }
      // The Servant's coin (Silvia caught his lie at the gates): he scratched the first line of the proverb on its rim
      function coinNote() {
        const f = window.GatesRoad ? window.GatesRoad.flags() : {};
        if (!f.coin) return '';
        if (hints && hints.grant) hints.grant('s18-proverb', 1);
        return " I almost forgot: the coin the Servant gave me has letters on its rim. He told me to read the stele the way I read a coin: by the pairs.";
      }
      function openSteleModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          if (get('order_arch_solstice_completed') !== 'true') {
            toast('✦ TERRA INCOGNITA ✦ Light the Solar Altar under the Arch of the Solstice (Station 17) before the road to Tower II opens.');
          } else if (typeof window.getSteleMarchEta === 'function' && window.getSteleMarchEta()) {
            toast('Hermes is walking to Tower II, toward the smoke. Arrival in ' + window.getSteleMarchEta() + '.');
          } else {
            toast('Hermes is still under the Arch. Open the Cliffside Workshop: he will wire you before he sets out.');
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
        if (fireOpen() && !run) run = newRun();
        if (!G && el.canvas) G = buildWorld();
        bindPointer();
        if (G && !cine && el.stage && P.cinema) {
          cine = P.cinema(el.stage, {
            reduced,
            onShot: (i, sh) => { if (sh.line) subtitle(sh.line, sh.dur - 0.4); if (i === 0) cue('whoosh', { dur: 1.8 }); }
          });
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        if (G && 'ResizeObserver' in window && !el.stage.__steleFit) { el.stage.__steleFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        view.snapNext = true; view.ending = 0; view.endFireT = null; view.sigilT = 0; view.freeze = false; view.phase = ''; view.hover = null;
        if (G) { G.cam.p = null; G.hGoal = null; G.hMove = null; G.chalkKey = null; G.steleAngle = isAwake() ? Math.PI : 0; }
        if (el.fade) el.fade.classList.remove('is-on');
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I am inside. I came in by a side door the raiders never found: they are out by the wagons, waiting for the fire to do their work for them. The library of the atrium is burning, the roof is full of smoke, and in the middle of it all the stele stands untouched. The Servant is nowhere. Open the page “The Polybius Stele”, please: what does the stele say?" + coinNote());
        else if (!fireOpen()) say("He is still under the floor, Silvia, waiting for us. Listen to him again whenever you need to, and read him with the page “The Polybius Stele”.");
        else say("The fire is still spreading. The hatch of the well is in the far corner. Guide me, one flagstone at a time.");
        renderTape(el.tape, heard, false);
        renderTape(el.replyTape, reply, replyOpen);
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
      function closeSteleModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopKnocks(true);
        if (cine && cine.active) cine.skip();
        clearTimeout(view.freezeTimer);
        view.endTimers.forEach(clearTimeout); view.endTimers = [];
        view.freeze = false; view.ending = 0;
        if (el.fade) el.fade.classList.remove('is-on');
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
        render();
      }
      window.openSteleModal = openSteleModal;
      window.closeSteleModal = closeSteleModal;
      if (el.close) el.close.addEventListener('click', closeSteleModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeSteleModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeSteleModal();
      }, true);
      document.addEventListener('visibilitychange', () => { if (document.hidden && playing) { stopKnocks(true); render(); } });
      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeSteleModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ The Servant is safe ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
        });
      }

      // Test hook for scripts/audit/web_smoke.py: the atrium and the stanzas (they are in this source anyway) and the controls
      window.__stele = {
        atrium: JSON.parse(JSON.stringify(ATRIUM)),
        grid: GRID,
        stanzas: STANZAS.map((s) => ({ by: s.by, word: s.word })),
        knocksOf: (word, moon) => knocksOf(word, !!moon),
        state: () => ({ knocks: knocksDone(), run: run ? { x: run.x, y: run.y, t: run.t } : null, playing: !!playing, done: isDone() }),
        read: (w) => { if (el.wordInput) el.wordInput.value = w; readWord(); },
        answer: (groups) => { clearReply(); reply = groups.slice(); sendReply(true); },
        move: (dx, dy) => takeTurn(dx, dy),
        stop: () => { stopKnocks(true); render(); },
        gfx: () => G,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          const n = (st) => G.cells.filter((c) => c.state === st).length;
          return {
            gl: true, hermes: G.hermes ? [+G.hermes.position.x.toFixed(2), +G.hermes.position.z.toFixed(2)] : null,
            fire: n('fire'), glow: n('glow'), ash: n('ash'), fuel: n('fuel'), stele: +G.steleAngle.toFixed(2), lid: +G.lidOpen.toFixed(2),
            servant: !!(G.servant && G.servant.visible), rise: +G.servantRise.toFixed(2), rings: G.rings.filter((m) => m.visible).map((m) => m.userData.kind),
            numbers: G.cells.filter((c) => c.num.visible).length, phase: view.phase, freeze: view.freeze, post: !!(G.fx && G.fx.post)
          };
        },
        aimAt: (dx, dy) => {
          // where a flagstone next to Hermes is on the screen, so a test can click it like she would
          if (!G || !run) return null;
          const v = new G.T.Vector3(wx(run.x + dx), 0.06, wz(run.y + dy));
          v.project(G.camera);
          const r = el.canvas.getBoundingClientRect();
          return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
        },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) drawFrame(performance.now() + i * 33, 1 / 30); },
        settle: () => { clearTimeout(view.freezeTimer); view.freeze = false; view.snapNext = true; syncWorld(); if (el.fade) el.fade.classList.remove('is-on'); }
      };

      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = PROVERB; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
