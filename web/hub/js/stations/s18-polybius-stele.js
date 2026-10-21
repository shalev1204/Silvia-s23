
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
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
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
        floor: $('stele-floor'), stanzaLabel: $('stele-stanza-label'), tape: $('stele-tape'), readPanel: $('stele-read-panel'),
        listen: $('btn-stele-listen'), sound: $('btn-stele-sound'), wordInput: $('stele-word-input'), read: $('btn-stele-read'),
        replyPanel: $('stele-reply-panel'), replyTape: $('stele-reply-tape'), knock: $('btn-stele-knock'), pause: $('btn-stele-pause'),
        clear: $('btn-stele-clear'), send: $('btn-stele-send'), knockFeedback: $('stele-knock-feedback'),
        fireGame: $('stele-fire-game'), fireInner: document.querySelector('#stele-fire-game .monolith-game-inner'), atrium: $('stele-atrium'),
        breath: $('stele-breath'), turnLabel: $('stele-turn-label'), moveFeedback: $('stele-move-feedback'),
        pad: { up: $('btn-stele-up'), down: $('btn-stele-down'), left: $('btn-stele-left'), right: $('btn-stele-right'), wait: $('btn-stele-wait') },
        hint: $('stele-hint'), victory: $('stele-victory'), victoryText: $('stele-victory-text'), finish: $('btn-stele-finish'),
        dispatch: $('stele-dispatch-text'),
        tProverb: $('stele-telem-proverb'), tKnocks: $('stele-telem-knocks'), tFire: $('stele-telem-fire'), tServant: $('stele-telem-servant')
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
          'Every pair of numbers in the six stanzas of Sheet 17A points to one square of the grid above them. One square, one letter.',
          'I wrote down how to read the stanzas, and how the mirage turns some of them round. It is in Ask Hermes: "How do I read the stanzas of Sheet 17A?"',
          'Let us read the first letter together. Stanza I is a solar stanza, so its first pair, (IV, IV), means row IV, then column IV: that square holds S. Go on along stanza I, and when you reach stanza II, remember that its first number is the column.'
        ]
      });
      const knockHints = hints.define({
        id: 's18-knocks', station: 'Station 18', title: 'the knocks in the stone', group: 'desert',
        anchor: el.knockFeedback, solved: fireOpen, active: isAwake, legacyKey: KEYS.knockHint,
        texts: [
          'Count every group of knocks; the chalk on the floor keeps the count for you. Two groups make one letter, in the same grid as the stanzas of Sheet 17A.',
          'I copied the Law of Sheet 17A beside the stone, and my longer note is in Ask Hermes: "How do I read the Servant\'s knocks?"',
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

      // ---- The floor of the atrium and the chalked knocks ----
      function drawFloor() {
        const svg = el.floor;
        if (!svg) return;
        svg.textContent = '';
        for (let i = 0; i < 6; i++) svg.appendChild(svgEl('rect', { x: i * 34 - 4, y: 44, width: 33, height: 40, fill: i % 2 ? '#2a1d12' : '#251910', stroke: '#4a3520', 'stroke-width': 0.5 }));
        // the stele, its grid cut into the face
        svg.appendChild(svgEl('path', { d: 'M86 46 L86 14 Q100 4 114 14 L114 46 Z', fill: '#4a3a2a', stroke: '#a8916f', 'stroke-width': 0.8 }));
        for (let i = 1; i < 5; i++) {
          svg.appendChild(svgEl('line', { x1: 88, y1: 16 + i * 5.6, x2: 112, y2: 16 + i * 5.6, stroke: '#7a6a52', 'stroke-width': 0.35 }));
          svg.appendChild(svgEl('line', { x1: 88 + i * 4.8, y1: 16, x2: 88 + i * 4.8, y2: 44, stroke: '#7a6a52', 'stroke-width': 0.35 }));
        }
        // the crack where the knocks come up, and smoke from the library
        svg.appendChild(svgEl('path', { d: 'M40 62 L52 58 L60 64 L74 60 L82 66', fill: 'none', stroke: '#0d0805', 'stroke-width': 1.4 }));
        svg.appendChild(svgEl('path', { d: 'M12 44 C 6 30, 20 26, 14 12 C 26 22, 30 10, 24 2', fill: 'none', stroke: 'rgba(120, 113, 108, 0.45)', 'stroke-width': 4, 'stroke-linecap': 'round' }));
        svg.appendChild(svgEl('ellipse', { cx: 14, cy: 46, rx: 16, ry: 4, fill: 'rgba(234, 88, 12, 0.35)' }));
      }
      function ripple(fromBelow) {
        if (!el.floor) return;
        const r = svgEl('circle', { class: 'stele-ripple', cx: fromBelow ? 60 : 150, cy: fromBelow ? 62 : 66, r: 5, fill: 'none', stroke: fromBelow ? '#fde68a' : '#fdba74', 'stroke-width': 1.2 });
        el.floor.appendChild(r);
        setTimeout(() => r.remove(), 800);
      }
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
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
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
        if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        if (el.wordInput) el.wordInput.value = '';
        say(STANZA_DISPATCH[i]);
        feedback(el.knockFeedback, i === 0 ? 'WHO. Now it is your stanza.' : (i === 1 ? 'He understood your answer.' : STANZAS[i].word + '.'), 'ok');
        if (i + 1 >= STANZAS.length) {
          run = newRun();
          feedback(el.moveFeedback, 'Hermes stands at the side door. The hatch of the well is in the far corner.', '');
          render();
          const focus = el.pad.up;
          if (focus) setTimeout(() => focus.focus(), 60);
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
          if (!c) { feedback(el.moveFeedback, 'The wall of the atrium.', 'error'); return; }
          if (c === '#') { feedback(el.moveFeedback, nx === ATRIUM.stele[0] && ny === ATRIUM.stele[1] ? 'The stele stands in the way.' : 'A column stands in the way.', 'error'); return; }
          if (c === 'L') { feedback(el.moveFeedback, 'The library is a wall of fire.', 'error'); return; }
          if (burningAt(nx, ny, run.t) && burningAt(nx, ny, run.t + 1)) { feedback(el.moveFeedback, 'That flagstone is burning. Wait for its ash, or go round.', 'error'); return; }
        }
        run.x = nx; run.y = ny; run.t++;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
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
        run = newRun();
        if (el.fireInner) { el.fireInner.classList.remove('laby-flash'); void el.fireInner.offsetWidth; el.fireInner.classList.add('laby-flash'); }
        feedback(el.moveFeedback, why === 'fire'
          ? 'The fire reached Hermes\'s flagstone. He fell back to the side door, coughing, his sleeve smouldering.'
          : 'Too slow: the knocks from the well are growing faint. Hermes went back to the side door to find a quicker way.', 'error');
        say((why === 'fire' ? "I am all right, Silvia, only singed. " : "He is still knocking, Silvia, but fainter. ") + "Fire is like water: it always runs down the same channels, in the same order. Watch the glowing flagstones and try again." + (hinted ? " I have been reading the fire: now every flagstone shows the turn it catches." : ''));
        render();
      }
      function reachHatch() {
        completeStation();
        feedback(el.moveFeedback, 'Hermes lifts the bronze hatch of the well.', 'ok');
        say("I lifted the hatch and he came up out of the dark, Silvia: the Servant, alive, black with smoke, a wet cloth over his mouth and a roll of charts in his arms. He took my wrists in his burnt hands and did not let go. And on the underside of the hatch, in the firelight, two lines cut by the founders. Write them down. I will tell you the rest on the wire, when he can breathe.");
      }
      function completeStation() {
        set(KEYS.done, 'true');
        stopKnocks();
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('servant_key');
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "The stele turned for the proverb of Sheet 17A and showed its back: 348° north-north-west, the bearing of Cairn III. Under the floor, the Servant answered in the founders' grid, and Silvia answered him back. Then Hermes crossed the burning atrium on the ash and lifted the hatch of the well: the Servant is alive, and so are the Oracle's charts.";
        }
        if (el.keyInput) { el.keyInput.value = PROVERB; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
      }

      // ---- Part I: the proverb of Sheet 17A ----
      function speakProverb() {
        if (isAwake()) return;
        const typed = letters(el.keyInput && el.keyInput.value);
        if (!typed) { feedback(el.keyFeedback, 'Type the six words of the proverb from Sheet 17A.', 'error'); return; }
        if (typed !== PROVERB_LETTERS) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The stele does not move. Read the six stanzas of Sheet 17A again, and mind the mirage.', 'error');
          proverbHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = PROVERB; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'STARS GUIDE THOSE WHO SEEK TRUTH. The stele turns on its base. On its back: 348° NNW.', 'ok');
        say("I said it aloud, every word, and the stele turned on its base, Silvia, stone grinding on stone. On its back, cut deep: 348°, north-north-west. The bearing of Cairn III. And then, under my feet... knocking. Someone is knocking on the underside of the floor. Groups of knocks, and pauses. He heard the proverb, and he is answering in the grid of the stele. Listen, and read him on Sheet 17A.");
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
        if (el.turnLabel) el.turnLabel.textContent = 'Turn ' + (open && run && !done ? run.t : 0);
        if (el.tProverb) el.tProverb.textContent = awake ? 'SPOKEN · 348° NNW ✓' : '[ 6 WORDS ]';
        if (el.tKnocks) el.tKnocks.textContent = k >= STANZAS.length ? '4 / 4 ✓' : (awake ? k + ' / 4' : '[ SILENCE ]');
        if (el.tFire) el.tFire.textContent = done ? 'CROSSED ✓' : (open && run ? 'TURN ' + run.t + ' / ' + ATRIUM.breath : '[ BURNING ]');
        if (el.tServant) el.tServant.textContent = done ? 'SAFE ✓' : (k >= 3 ? 'IN THE WELL' : (k >= 1 ? 'UNDER THE FLOOR' : '[ MISSING ]'));
        if (el.knockGame) el.knockGame.classList.toggle('is-locked', !awake);
        if (el.knockInner) el.knockInner.inert = !awake;
        if (el.fireGame) el.fireGame.classList.toggle('is-locked', !open);
        if (el.fireInner) el.fireInner.inert = !open;
        if (el.proverbCard) el.proverbCard.classList.toggle('is-collapsed', awake);
        if (awake && el.keyFeedback && !el.keyFeedback.textContent) feedback(el.keyFeedback, 'Proverb spoken ✓ · on the back of the stele: 348° NNW', 'ok');
        if (el.hint) {
          let hint = '';
          if (!done && open && get(KEYS.fireHint) === 'true') hint = '✦ Hermes reads the fire: every flagstone that has not caught yet shows in how many turns it will.';
          else if (!done && awake && !open && get(KEYS.knockHint) === 'true') hint = '✦ Hermes copied the Law of Sheet 17A: stanzas I and III are knocked row first, then column; stanzas II and IV column first, then row. Each letter is two groups.';
          el.hint.style.display = hint ? '' : 'none';
          el.hint.textContent = hint;
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        proverbHints.refresh(); knockHints.refresh(); fireHints.refresh();
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
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'none' || !fireOpen() || isDone()) return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const k = KEYMAP[e.key];
        if (!k) return;
        if (k === 'wait' && e.target && e.target.tagName === 'BUTTON' && !modal.contains(e.target)) return;
        e.preventDefault();
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
      let returnFocusTo = null;
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
        returnFocusTo = document.activeElement;
        if (fireOpen() && !run) run = newRun();
        drawFloor();
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I am inside. I came in by a side door the raiders never found: they are out by the wagons, waiting for the fire to do their work for them. The library of the atrium is burning, the roof is full of smoke, and in the middle of it all the stele stands untouched. The Servant is nowhere. Sheet 17A, please: what does the stele say?");
        else if (!fireOpen()) say("He is still under the floor, Silvia, waiting for us. Listen to him again whenever you need to, and read him on Sheet 17A.");
        else say("The fire is still spreading. The hatch of the well is in the far corner. Guide me, one flagstone at a time.");
        renderTape(el.tape, heard, false);
        renderTape(el.replyTape, reply, replyOpen);
        render();
        const k = knocksDone();
        const focusTarget = isDone() ? el.finish : (!isAwake() ? el.keyInput : (fireOpen() ? el.pad.up : (STANZAS[k].by === 'silvia' ? el.knock : el.listen)));
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
      }
      function closeSteleModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopKnocks(true);
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
        render();
      }
      window.openSteleModal = openSteleModal;
      window.closeSteleModal = closeSteleModal;
      if (el.close) el.close.addEventListener('click', closeSteleModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeSteleModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeSteleModal(); });
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
        stop: () => { stopKnocks(true); render(); }
      };

      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = PROVERB; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      drawFloor();
      render();
    })();
