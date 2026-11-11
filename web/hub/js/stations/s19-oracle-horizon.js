
    // =========================================================================
    // 🏛️ STATION 19 · THE ORACLE'S HORIZON · THE AUDIENCE IN TOWER II (SHEET 18A)
    // Part I (journal): the sigil OVERTURE (eight beacons across the three mirrors) opens the inner chamber.
    // Part II (web only), The Disc of 24 Sightings: the veiled Oracle raises the brass disc Hermes engraved
    // for Aurelia. Three rings of eight letters; each ring carries a star (Aldebaran, Capella, Polaris) that
    // must point where that star stands before dawn in late October at 30° N (W, NW, N: worked out from the
    // stars' positions, not guessed). Set true, the disc reads from the north, clockwise, rim to heart:
    // DECEMBER EIGHTEEN TO TWENTY (24 letters), the WHEN.
    // Part III (web only), The Vow: she half remembers some words; Silvia orders them into the vow,
    // YOU WERE ALWAYS THE TREASURE, and Hermes says it. The veil comes off; her memory comes back in part.
    // Reward: the WHEN, two Ledger equations, the Gilded Star, and the passage to the Stage Path.
    // =========================================================================
    (function initOracleHorizon() {
      const modal = document.getElementById('modal-oracle-horizon');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(a && a.sfx && a.sfx(kind, o)); };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const HOWTO_KEY = 'order_oracle_howto', CINE_INTRO = 'order_oracle_cine_intro';
      const KEYS = {
        awake: 'order_oracle_awake',
        done: 'order_oracle_horizon_completed',
        fails: 'order_oracle_key_fails',
        hint: 'order_oracle_hint',
        disc: 'order_oracle_disc',
        turns: 'order_oracle_disc_turns',
        discHint: 'order_oracle_disc_hint',
        when: 'order_oracle_when_read',
        readFails: 'order_oracle_read_fails',
        vowFails: 'order_oracle_vow_fails',
        vowHint: 'order_oracle_vow_hint',
        passage: 'order_stage_passage_seen'
      };
      const SIGIL = 'OVERTURE';
      const TURNS_PER_MISS = 15;   // turning the rings with no result counts as a miss every 15 turns

      // ---- The disc: spoke k (0 = north, clockwise) reads outer, middle, inner ----
      const WHEN_WORDS = 'DECEMBER EIGHTEEN TO TWENTY';
      const WHEN_LETTERS = WHEN_WORDS.replace(/ /g, '');   // 24 letters, one for each sighting
      const RINGS = [0, 1, 2].map((r) => Array.from({ length: 8 }, (_, k) => WHEN_LETTERS[3 * k + r]));
      // Where each ring's star is engraved (its spoke when the ring is set true) and where that star stands in the sky
      const STARS = [
        { name: 'Aldebaran', ring: 'Outer ring', spoke: 6, where: 'west' },
        { name: 'Capella', ring: 'Middle ring', spoke: 7, where: 'north-west' },
        { name: 'Polaris', ring: 'Inner ring', spoke: 0, where: 'north' }
      ];
      const START = [3, 6, 2];   // how the Oracle holds the disc when she raises it
      const SPOKE_NAMES = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
      const R = [46, 34, 22];   // radius of each ring of letters

      // ---- The vow ----
      const VOW = ['YOU', 'WERE', 'ALWAYS', 'THE', 'TREASURE'];
      const TILES = ['ALWAYS', 'SEEKER', 'YOU', 'THE', 'NEVER', 'TREASURE', 'WERE', 'ONLY'];

      const el = {
        close: $('btn-close-oracle'), sigilCard: $('oracle-sigil-card'), keyInput: $('oracle-key-input'), speak: $('btn-oracle-speak'),
        keyFeedback: $('oracle-key-feedback'), discGame: $('oracle-disc-game'), discInner: document.querySelector('#oracle-disc-game .monolith-game-inner'),
        disc: $('oracle-disc'), sky: $('oracle-sky'), readPanel: $('oracle-read-panel'), whenInput: $('oracle-when-input'), read: $('btn-oracle-read'),
        when: $('oracle-when'), discFeedback: $('oracle-disc-feedback'), vowGame: $('oracle-vow-game'), vowInner: document.querySelector('#oracle-vow-game .monolith-game-inner'),
        said: $('oracle-said'), tiles: $('oracle-tiles'), unsay: $('btn-oracle-unsay'), vow: $('btn-oracle-vow'), vowFeedback: $('oracle-vow-feedback'),
        hint: $('oracle-hint'), victory: $('oracle-victory'), victoryText: $('oracle-victory-text'), finish: $('btn-oracle-finish'), dispatch: $('oracle-dispatch-text'),
        stage: $('oracle3d-stage'), canvas: $('oracle3d-canvas'), subtitle: $('oracle3d-subtitle'), fade: $('oracle3d-fade'), aim: $('oracle3d-aim'),
        status: $('oracle3d-status'), howto: $('oracle3d-howto'), help: $('btn-oracle-howto'), ringCtrls: document.querySelector('#oracle-disc-game .oracle-ring-ctrls'),
        ringBtns: [0, 1, 2].map((r) => [$('btn-oracle-r' + r + '-l'), $('btn-oracle-r' + r + '-r')]),
        ringLabels: [0, 1, 2].map((r) => $('oracle-r' + r + '-label')),
        passage: $('stage-passage-overlay'), passageClose: $('btn-stage-passage-close')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const whenRead = () => isDone() || get(KEYS.when) === 'true';
      // Hints climb three levels (hub/js/hint-ladder.js); level 2 is the older help of each part
      const hints = window.EclipseHints;
      const sigilHints = hints.define({
        id: 's19-sigil', station: 'Station 19', title: 'the sigil of the three mirrors', group: 'desert',
        anchor: el.keyFeedback, solved: isAwake, legacyKey: KEYS.hint,
        texts: [
          'Do not read the eight beacons where they stand, Silvia. Each one has to travel across the chart first, through the three mirrors, and only the square where it lands gives a letter.',
          'I wrote down how a beacon crosses the mirrors. It is in Ask Hermes: "How do the three mirrors of the page “The Oracle\'s Horizon” work?"',
          'Let us send the first beacon together. It starts in column 2, Row A. Mirror I, on column 4, sends it to column 6, still on Row A. In column 6 Mirror II lies on Row D: Row A is three rows above it, so it lands three rows below, on Row G. Mirror III, on column 10, sends column 6 to column 14. Read the letter in column 14, Row G: that is the first letter of the sigil. Now beacon 2.'
        ]
      });
      const discHints = hints.define({
        id: 's19-disc', station: 'Station 19', title: 'the disc of 24 sightings', group: 'desert',
        anchor: el.discFeedback, solved: whenRead, active: isAwake, legacyKey: KEYS.discHint,
        texts: [
          'Look for the little gold star on each ring, and then at the sky drawn beside the disc. The disc and the sky have to agree before the jewel answers.',
          'Turn each ring until its star points the same way as that star in the sky. Then read from the north, rim to heart, and go clockwise. My longer note is in Ask Hermes: "How do I set the disc of 24 sightings?"',
          'Start with the inner ring: its star is Polaris, the star that never leaves the north. Turn the inner ring until that star points straight up, to the north. Then find Capella and Aldebaran in the sky beside the disc and do the same with their rings.'
        ]
      });
      const vowHints = hints.define({
        id: 's19-vow', station: 'Station 19', title: 'the vow', group: 'desert',
        anchor: el.vowFeedback, solved: isDone, active: whenRead, legacyKey: KEYS.vowHint,
        texts: [
          'These are not new words, Silvia. You have written them to me before.',
          'They are the words you sent me from the cliffs, the night the storm began. Only the last five. My note is in Ask Hermes: "Which words does she remember?"',
          'The vow has five words. It begins like the prophecy, YOU WERE, but it does not go on with NEVER. Think of the five words you sent me that night and say them in the same order.'
        ]
      });
      let rot = (() => {
        const saved = get(KEYS.disc);
        return saved && /^[0-7]{3}$/.test(saved) ? saved.split('').map(Number) : START.slice();
      })();
      const discTrue = () => isDone() || get(KEYS.when) === 'true' || rot.every((r) => r === 0);
      let said = [];   // indexes into TILES
      let pulsing = null;

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
      const at = (spoke, r) => [r * Math.sin(spoke * Math.PI / 4), -r * Math.cos(spoke * Math.PI / 4)];
      const letterAt = (ring, spoke) => RINGS[ring][((spoke - rot[ring]) % 8 + 8) % 8];
      const starSpoke = (ring) => (STARS[ring].spoke + rot[ring]) % 8;
      function starPath(x, y, r) {
        let d = '';
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
          d += (i ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(2) + ' ' + (y + rr * Math.sin(a)).toFixed(2) + ' ';
        }
        return d + 'Z';
      }

      // ---- Drawing the disc and the sky ----
      function drawDisc() {
        const svg = el.disc;
        if (!svg) return;
        svg.textContent = '';
        const lit = discTrue();
        svg.appendChild(svgEl('circle', { class: 'oracle-glow', cx: 0, cy: 0, r: 57, fill: 'rgba(253, 230, 138, 0.18)' }));
        svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 54, fill: '#6b4a22', stroke: '#d4a853', 'stroke-width': 1.2 }));
        for (let i = 0; i < 48; i++) {   // the bevelled rim
          const [x1, y1] = at(i / 6 + 0.5, 52.5), [x2, y2] = at(i / 6 + 0.5, i % 6 === 0 ? 50 : 51.5);   // ticks sit between the letters
          svg.appendChild(svgEl('line', { x1, y1, x2, y2, stroke: '#3b2410', 'stroke-width': i % 6 === 0 ? 0.9 : 0.4 }));
        }
        svg.appendChild(svgEl('path', { d: 'M0 -58 L3 -52 L-3 -52 Z', fill: '#fde68a' }));   // north
        [40, 28, 16].forEach((r, i) => svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r, fill: i % 2 ? '#7c5a2a' : '#8a6334', stroke: '#3b2410', 'stroke-width': 0.5 })));
        [52, 40, 28, 16].forEach((r) => svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r, fill: 'none', stroke: '#d4a853', 'stroke-width': 0.35 })));
        for (let k = 0; k < 8; k++) {   // the spokes
          const [x1, y1] = at(k + 0.5, 16), [x2, y2] = at(k + 0.5, 52);
          svg.appendChild(svgEl('line', { x1, y1, x2, y2, stroke: '#3b2410', 'stroke-width': 0.35 }));
        }
        for (let ring = 0; ring < 3; ring++) {
          for (let k = 0; k < 8; k++) {
            const [x, y] = at(k, R[ring]);
            const t = svgEl('text', { x, y: y + 2.4, 'text-anchor': 'middle', 'font-size': 7, 'font-family': 'Cinzel, serif', 'font-weight': 700, fill: lit ? '#fff7d6' : '#2b1b0d' });
            t.textContent = letterAt(ring, k);
            svg.appendChild(t);
          }
          const [sx, sy] = at(starSpoke(ring), R[ring] - 5.6);   // on its letter's spoke, just inside the glyph
          svg.appendChild(svgEl('path', { d: starPath(sx, sy, 1.9), fill: '#fde68a', stroke: '#7c2d12', 'stroke-width': 0.3 }));
        }
        svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 7, fill: lit ? '#fde68a' : '#3b2410', stroke: '#d4a853', 'stroke-width': 0.8 }));
        svg.appendChild(svgEl('path', { d: starPath(0, 0, 4.5), fill: lit ? '#b45309' : '#8a6334' }));
        const desc = [0, 1, 2].map((ring) => STARS[ring].ring + ': its star points ' + SPOKE_NAMES[starSpoke(ring)] + '; reading from the north: ' + Array.from({ length: 8 }, (_, k) => letterAt(ring, k)).join(' ')).join('. ');
        svg.setAttribute('aria-label', 'The brass disc of 24 sightings, north at the top. ' + desc + '.' + (lit ? ' The disc is shining.' : ''));
      }
      function drawSky() {
        const svg = el.sky;
        if (!svg || svg.firstChild) return;
        svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 54, fill: 'none', stroke: '#3b4a6b', 'stroke-width': 0.8 }));
        for (let i = 0; i < 34; i++) {   // faint background stars, scattered by a fixed hash so they never form lines
          const a = (Math.sin(i * 12.9898) * 43758.5453) % 1, d = (Math.sin(i * 78.233) * 12345.678) % 1;
          const ang = Math.abs(a) * Math.PI * 2, rad = 6 + Math.abs(d) * 44;
          svg.appendChild(svgEl('circle', { cx: rad * Math.cos(ang), cy: rad * Math.sin(ang), r: i % 5 === 0 ? 0.7 : 0.4, fill: '#94a3b8', opacity: 0.7 }));
        }
        [['N', 0], ['E', 2], ['S', 4], ['W', 6]].forEach(([l, k]) => {
          const [x, y] = at(k, 48);
          const t = svgEl('text', { x, y: y + 2.4, 'text-anchor': 'middle', 'font-size': 7, 'font-family': 'Cinzel, serif', fill: '#b8a07a' });
          t.textContent = l;
          svg.appendChild(t);
        });
        STARS.forEach((s) => {
          const [x, y] = at(s.spoke, 32);
          svg.appendChild(svgEl('path', { d: starPath(x, y, 4), fill: '#fde68a' }));
          const t = svgEl('text', { x, y: y + 10, 'text-anchor': 'middle', 'font-size': 5.4, 'font-family': 'Cinzel, serif', fill: '#e7e5e4' });
          t.textContent = s.name;
          svg.appendChild(t);
        });
        svg.appendChild(svgEl('circle', { cx: 0, cy: 0, r: 1.6, fill: '#e7e5e4' }));
      }

      // ---- Turning the rings ----
      function turn(ring, dir) {
        if (!isAwake() || whenRead() || ring < 0 || ring > 2) return;
        rot[ring] = (rot[ring] + dir + 8) % 8;
        set(KEYS.disc, rot.join(''));
        const turns = (parseInt(get(KEYS.turns) || '0', 10) || 0) + 1;
        set(KEYS.turns, String(turns));
        if (turns % TURNS_PER_MISS === 0) discHints.fail();
        // a notch per turn; a ring whose star points true chimes higher the more rings are true
        const trueRings = rot.filter((r) => r === 0).length;
        const played = trueRings === 3 ? cue('reveal') : rot[ring] === 0 ? cue('shimmer', { deg: 10 + 2 * trueRings }) : cue('tick', { f: 2600 - 400 * ring });
        if (!played && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        sceneTurn(ring, rot[ring] === 0, trueRings === 3);
        if (rot.every((r) => r === 0)) {
          feedback(el.discFeedback, 'The three stars point true. The jewel of the disc wakes.', 'ok');
          say("Silvia... the jewel. Three short flashes, a pause, two long ones: the code I engraved in it, more than fifty years ago. And every sighting is lit. Read it the way I made it to be read: from the north, clockwise, each spoke from the rim to the heart.");
          pulseCode();
          if (el.whenInput) setTimeout(() => el.whenInput.focus({ preventScroll: true }), 60);
        } else {
          feedback(el.discFeedback, STARS[ring].ring + ': ' + STARS[ring].name + ' points ' + SPOKE_NAMES[starSpoke(ring)] + '.', '');
        }
        render();
      }
      // three short, a pause, two long: the code of the disc
      function pulseCode() {
        stopPulse();
        if (!el.disc) return;
        pulsing = [];
        let t = 200;
        [220, 220, 220, 0, 700, 700].forEach((len) => {
          if (!len) { t += 600; return; }
          pulsing.push(setTimeout(() => el.disc.classList.add('is-pulse'), t));
          t += len;
          pulsing.push(setTimeout(() => el.disc.classList.remove('is-pulse'), t));
          t += 260;
        });
      }
      function stopPulse() {
        if (pulsing) pulsing.forEach((x) => clearTimeout(x));
        pulsing = null;
        if (el.disc) el.disc.classList.remove('is-pulse');
      }
      function readWhen() {
        if (!isAwake() || whenRead() || !discTrue()) return;
        const typed = letters(el.whenInput && el.whenInput.value);
        const raw = String(el.whenInput && el.whenInput.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        if (!typed && !/\d/.test(raw)) { feedback(el.discFeedback, 'Type the 24 letters of the disc, spoke by spoke.', 'error'); return; }
        const asWords = typed === WHEN_LETTERS;
        // ...or as a date: the days 18 and 20 (in figures or words) and December (by name, or 12 as a month)
        const spelled = raw.replace(/EIGHTEENTH|EIGHTEEN|DIECIOCHO/g, ' 18 ').replace(/TWENTIETH|TWENTY|VEINTE/g, ' 20 ');
        const nums = spelled.match(/\d+/g) || [];
        const month = /\b(DEC|DECEMBER|DIC|DICIEMBRE)\b/.test(spelled.replace(/[^A-Z0-9]+/g, ' ')) || nums.filter((n) => n === '12').length > 0;
        const asDate = month && nums.includes('18') && nums.includes('20');
        if (!asWords && !asDate) {
          set(KEYS.readFails, String((parseInt(get(KEYS.readFails) || '0', 10) || 0) + 1));
          discHints.fail();
          cue('wrong');
          sceneRead(false);
          feedback(el.discFeedback, 'Hermes frowns: that is not what the disc says. Start at the north spoke, read rim, middle, heart, then go clockwise.', 'error');
          render();
          return;
        }
        set(KEYS.when, 'true');
        stopPulse();
        sceneRead(true);
        if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback(el.discFeedback, 'DECEMBER EIGHTEEN TO TWENTY. The first truth: the WHEN.', 'ok');
        say("December, the eighteenth to the twentieth. The hour and the season, Silvia: the first truth, written on a disc I made with my own hands, and I never knew what it would say. She is holding it out to you. And now she is looking at me through her veil, and she is saying words, very softly, as if she were trying to remember a song. Help me, Silvia. I think I know which words they are.");
        render();
        const first = el.tiles && el.tiles.querySelector('button');
        if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
      }

      // ---- The vow ----
      function drawTiles() {
        if (el.tiles) {
          el.tiles.textContent = '';
          TILES.forEach((w, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chasm3d-btn oracle-tile';
            b.textContent = w;
            b.setAttribute('aria-pressed', String(said.includes(i)));
            b.disabled = !whenRead() || isDone() || said.includes(i);
            b.addEventListener('click', () => sayWord(i));
            el.tiles.appendChild(b);
          });
        }
        if (el.said) {
          el.said.textContent = '';
          (isDone() ? VOW.map((w) => TILES.indexOf(w)) : said).forEach((i) => {
            const s = document.createElement('span');
            s.className = 'monolith-equation';
            s.textContent = TILES[i];
            el.said.appendChild(s);
          });
        }
      }
      function sayWord(i) {
        if (!whenRead() || isDone() || said.includes(i) || said.length >= TILES.length) return;
        said.push(i);
        sceneWord(TILES[i]);
        // each word sung a step higher, like the song she is trying to remember
        if (!cue('echo', { deg: 5 + said.length, n: 1, v: 0.05 }) && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        render();
        const next = el.tiles && el.tiles.querySelector('button:not([disabled])');
        if (next) next.focus({ preventScroll: true });
      }
      function unsay() {
        if (isDone() || !said.length) return;
        said.pop();
        cue('tick', { f: 1600, v: 0.06 });
        render();
      }
      function speakVow() {
        if (!whenRead() || isDone()) return;
        if (!said.length) { feedback(el.vowFeedback, 'Choose the words first.', 'error'); return; }
        const words = said.map((i) => TILES[i]);
        if (words.join(' ') !== VOW.join(' ')) {
          set(KEYS.vowFails, String((parseInt(get(KEYS.vowFails) || '0', 10) || 0) + 1));
          vowHints.fail();
          cue('wrong');
          const full = words.join(' ') === 'YOU WERE NEVER ONLY THE SEEKER';
          feedback(el.vowFeedback, full
            ? 'She tilts her head: those words are true, but they are only the first half. They were never the words he said to her.'
            : 'She listens, and shakes her head slowly. Close, but not hers.', 'error');
          said = [];
          sceneVowWrong();
          render();
          return;
        }
        sceneVow();
        completeStation();
        if (el.finish) setTimeout(() => el.finish.focus({ preventScroll: true }), 60);
        say("I said it, Silvia. 'You were always the treasure.' And her hands let go of the disc, and she lifted the veil herself. It is her. It is Aurelia. Older, with a white streak in her hair and lapis blue under her nails, and her eyes are exactly the same. She does not remember everything. She remembers my voice, and the fire, and the cold of the terrace. She said her own name slowly, like a word in a language she used to speak. I cannot write any more right now.");
      }
      function completeStation() {
        set(KEYS.done, 'true');
        set(KEYS.when, 'true');
        stopPulse();
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('gilded_star');
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "The horizon was sealed with OVERTURE and the inner chamber opened. The veiled Oracle raised a brass disc of 24 sightings; set to the sky before dawn, it gave the first truth, the WHEN. Then Hermes said the vow, and the Oracle lifted her veil: Aurelia, alive, remembering the fire, the terrace and his voice, though not yet everything. At dawn the raiders left east with the Astrolabe, toward the Stage.";
        }
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
      }

      // ---- Part I: the sigil from Sheet 18A ----
      function speakSigil() {
        if (isAwake()) return;
        const typed = letters(el.keyInput && el.keyInput.value);
        if (!typed) { feedback(el.keyFeedback, 'Type the eight letters from the page “The Oracle\'s Horizon”.', 'error'); return; }
        if (typed !== SIGIL) {
          set(KEYS.fails, String((parseInt(get(KEYS.fails) || '0', 10) || 0) + 1));
          if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The door stays shut. Send the eight beacons across the mirrors on the page “The Oracle\'s Horizon” again.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        sceneSigil();
        cue('stone', { dur: 2.6 });   // the sandstone door of the inner chamber
        if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'OVERTURE. The horizon is sealed, and the door of the inner chamber opens.', 'ok');
        say("OVERTURE... and the door opened, Silvia. The chamber is round, with an opening in the roof and a beam of grey light on a stone altar. She is there. Veiled, in a worn hooded robe, standing very still. She has not said a word. She is holding up a brass disc, Silvia. My disc. Twenty-four sightings, three rings. She turns it toward me as if she wanted me to read it, and its rings are all crooked.");
        render();
        const b = el.ringBtns[0] && el.ringBtns[0][1];
        if (b) setTimeout(() => b.focus({ preventScroll: true }), 60);
      }

      function render() {
        const awake = isAwake(), done = isDone(), wRead = whenRead(), dTrue = discTrue();
        sigilHints.refresh(); discHints.refresh(); vowHints.refresh();
        drawDisc();
        drawSky();
        drawTiles();
        el.ringBtns.forEach((pair) => pair.forEach((b) => { if (b) b.disabled = !awake || wRead; }));
        el.ringLabels.forEach((n, ring) => {
          if (!n) return;
          n.textContent = STARS[ring].ring + ' · ' + STARS[ring].name + (awake ? ' → ' + SPOKE_NAMES[starSpoke(ring)] : '') + (awake && rot[ring] === 0 ? ' ✓' : '');
          n.classList.toggle('is-true', awake && rot[ring] === 0);
        });
        if (el.readPanel) el.readPanel.style.display = awake && dTrue && !wRead ? '' : 'none';
        if (el.when) el.when.style.display = wRead ? '' : 'none';
        if (el.unsay) el.unsay.disabled = !wRead || done || !said.length;
        if (el.vow) el.vow.disabled = !wRead || done;
        if (el.status) {
          const n = rot.filter((r) => r === 0).length;
          el.status.textContent = done ? '✦ She remembers' : !awake ? 'The door is shut' : wRead ? 'The vow' : dTrue ? 'The disc is true · read it' : n + ' of 3 stars true';
        }
        if (el.discGame) el.discGame.classList.toggle('is-locked', !awake);
        if (el.discInner) el.discInner.inert = !awake;
        if (el.vowGame) el.vowGame.classList.toggle('is-locked', !wRead);
        if (el.vowInner) el.vowInner.inert = !wRead;
        if (el.sigilCard) el.sigilCard.classList.toggle('is-collapsed', awake);
        if (awake && el.keyFeedback && !el.keyFeedback.textContent) feedback(el.keyFeedback, 'Sigil spoken: ' + SIGIL + ' ✓', 'ok');
        if (el.hint) {
          let hint = '';
          if (!done && wRead && get(KEYS.vowHint) === 'true') hint = '✦ Hermes: they are the words you sent me from the cliffs, the night the storm began. Only the last five.';
          else if (!done && awake && !wRead && get(KEYS.discHint) === 'true') hint = '✦ Hermes: turn each ring until its little star points the same way as that star in the sky beside it. Then read north first, rim to heart, and go clockwise.';
          el.hint.style.display = hint ? '' : 'none';
          el.hint.textContent = hint;
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        // the panel shows the part she is in; the scene shows the rest
        if (el.discGame) el.discGame.style.display = done ? 'none' : '';
        if (el.ringCtrls) el.ringCtrls.style.display = wRead ? 'none' : '';
        if (el.vowGame) el.vowGame.style.display = awake && !done ? '' : 'none';
        syncWorld();
        mood();
      }
      // the sanctum music fills as the disc comes true and the vow is found
      function mood() {
        const amb = window.EclipseAmbience;
        if (!amb || !amb.intensity) return;
        const awake = isAwake(), wRead = whenRead();
        amb.intensity(isDone() ? 0.6 : wRead ? 0.5 + 0.02 * said.length : awake ? 0.35 + 0.04 * rot.filter((r) => r === 0).length : 0.3);
      }

      // ---- The inner chamber of Tower II in 3D. North is -z; the door is in the south wall; Hermes faces -z at yaw 0 ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const RAD = 6.4, WALL_H = 6.6, DOOR_W = 2.4, DOOR_H = 3.3, DR = 0.36;
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const ease = (u) => u * u * (3 - 2 * u);
      const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
      const SPOT_OUT = [-0.55, RAD + 1.6], SPOT_IN = [0, 1.25], ORACLE = [0, -1.0], ALTAR = [0, -2.7];
      const RING_R = [[0.7, 0.98], [0.46, 0.7], [0.22, 0.46]];   // each ring's band, as a share of the disc's radius
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, phase: '', sigilT: 0, endT: 0, hover: -1, endTimers: [] };
      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden);
      const ringTrue = (r) => rot[r] === 0;

      // ---- The engraved rings: brass with dark letters, and the same letters in white for when the disc shines ----
      function ringTextures(ring) {
        const draw = (glow) => P.canvasTex(512, 512, (g, w) => {
          g.clearRect(0, 0, w, w);
          const c = w / 2, [r0, r1] = RING_R[ring].map((f) => f * c), fs = [44, 38, 30][ring], mid = (r0 + r1) / 2 + fs * 0.3;
          if (!glow) {
            const gr = g.createRadialGradient(c, c, r0, c, c, r1);
            const tone = ['#9a7434', '#8a6630', '#a27a38'][ring];
            gr.addColorStop(0, '#5a4018'); gr.addColorStop(0.12, tone); gr.addColorStop(0.88, tone); gr.addColorStop(1, '#4a3412');
            g.fillStyle = gr; g.beginPath(); g.arc(c, c, r1, 0, Math.PI * 2); g.arc(c, c, r0, 0, Math.PI * 2, true); g.fill();
            g.strokeStyle = 'rgba(40,24,8,0.85)'; g.lineWidth = 3;
            [r0 + 1.5, r1 - 1.5].forEach((r) => { g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke(); });
            g.lineWidth = 1.6;
            for (let k = 0; k < 8; k++) {   // the spokes run between the letters
              const a = (k + 0.5) * Math.PI / 4;
              g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1); g.stroke();
            }
          }
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + fs + 'px Cinzel, Georgia, serif';
          for (let k = 0; k < 8; k++) {
            const a = k * Math.PI / 4;
            g.save(); g.translate(c + Math.sin(a) * mid, c - Math.cos(a) * mid);
            if (!glow) { g.fillStyle = 'rgba(255,230,170,0.4)'; g.fillText(RINGS[ring][k], 0, 2); }
            g.fillStyle = glow ? '#fff' : '#24160a'; g.fillText(RINGS[ring][k], 0, 0);
            g.restore();
          }
          // the ring's star, gilded on its letter's own spoke, just inside the letter
          const rs = [12, 11, 10][ring], a = STARS[ring].spoke * Math.PI / 4, sr = r0 + rs + 4;
          g.save(); g.translate(c + Math.sin(a) * sr, c - Math.cos(a) * sr);
          if (!glow) { const halo = g.createRadialGradient(0, 0, 0, 0, 0, rs * 1.6); halo.addColorStop(0, 'rgba(255,240,170,0.9)'); halo.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = halo; g.beginPath(); g.arc(0, 0, rs * 1.6, 0, Math.PI * 2); g.fill(); }
          g.beginPath();
          for (let i = 0; i < 10; i++) { const b = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? rs * 0.42 : rs; g.lineTo(rr * Math.cos(b), rr * Math.sin(b)); }
          g.closePath(); g.fillStyle = glow ? '#fff' : '#ffd84a'; g.fill();
          if (!glow) { g.strokeStyle = '#5a1c04'; g.lineWidth = 2; g.stroke(); }
          g.restore();
        });
        return { map: draw(false), glow: draw(true) };
      }
      // the door of the inner chamber: a horizon, three mirrors standing on it, eight sockets along the bottom
      function doorTexture() {
        return P.canvasTex(512, 704, (g, w, h) => {
          g.fillStyle = '#b08a62'; g.fillRect(0, 0, w, h);
          const r = P.rng(1919);
          for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '90,60,36' : '230,200,160') + ',' + (0.05 + r() * 0.1) + ')'; g.fillRect(r() * w, r() * h, 2 + r() * 18, 1 + r() * 3); }
          const cut = (fn) => { g.strokeStyle = 'rgba(255,236,200,0.4)'; fn(2); g.strokeStyle = 'rgba(40,22,10,0.9)'; fn(0); };
          g.lineCap = 'round';
          cut((d) => { g.lineWidth = 6; g.strokeRect(24 + d, 24 + d, w - 48, h - 48); });
          // the half-lit disc of the Oracle over the horizon
          cut((d) => { g.lineWidth = 5; g.beginPath(); g.arc(w / 2 + d, 150 + d, 62, 0, Math.PI * 2); g.stroke(); });
          g.fillStyle = 'rgba(40,22,10,0.55)'; g.beginPath(); g.arc(w / 2, 150, 60, Math.PI / 2, Math.PI * 1.5); g.fill();
          cut((d) => { g.lineWidth = 5; g.beginPath(); g.moveTo(48 + d, 330 + d); g.lineTo(w - 48 + d, 330 + d); g.stroke(); });
          // three mirrors standing on the horizon, at their slants
          [[150, -0.5], [256, 0.45], [362, -0.35]].forEach(([x, a]) => cut((d) => {
            g.lineWidth = 9; g.beginPath(); g.moveTo(x + Math.sin(a) * -70 + d, 330 - Math.cos(a) * 70 + d - 70); g.lineTo(x + Math.sin(a) * 30 + d, 330 - Math.cos(a) * -30 + d - 70); g.stroke();
          }));
          // rays of the eight beacons crossing from west to east
          g.setLineDash([10, 12]);
          cut((d) => { g.lineWidth = 2.5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(52 + d, 400 + k * 30 + d); g.lineTo(w - 52 + d, 380 + k * 34 + d); g.stroke(); } });
          g.setLineDash([]);
          // the eight sockets (their stones are lit by the sigil)
          cut((d) => { g.lineWidth = 4; for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(80 + k * 50.3 + d, 600 + d, 17, 0, Math.PI * 2); g.stroke(); } });
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
        scene.background = new T.Color(0x03040a);
        scene.fog = new T.Fog(0x05060c, 14, 40);
        const camera = new T.PerspectiveCamera(50, 16 / 10, 0.05, 300);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const glow = (color) => new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        const solid = (geo, mat, x, y, z, parent) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; };

        // ---- Light: the grey hour before dawn falls through the opening in the roof; oil lamps burn in the niches ----
        const hemi = new T.HemisphereLight(0x5a6a9a, 0x140c08, 0.2);
        scene.add(hemi);
        const holeY = WALL_H + RAD * Math.cos(0.22) * 0.5;
        const A = new T.Vector3(ALTAR[0], 1.0, ALTAR[1]), Hh = new T.Vector3(0, holeY, 0), up = Hh.clone().sub(A);
        const beamLight = new T.SpotLight(0xb8c4e8, 1.5, 24, 0.2, 0.55, 1.2);
        beamLight.position.copy(Hh).addScaledVector(up, 0.25);
        beamLight.target.position.copy(A).addScaledVector(up, -0.1);
        beamLight.castShadow = true;
        beamLight.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        beamLight.shadow.bias = -0.0006;
        scene.add(beamLight); scene.add(beamLight.target);
        const lamps = [1, 3, 6, 8].map((k, i) => {
          const a = (k + 0.5) * Math.PI * 2 / 10 + Math.PI, x = Math.sin(a) * (RAD - 0.3), z = Math.cos(a) * (RAD - 0.3);
          const l = new T.PointLight(0xffa654, 0.9, 7, 1.8); l.position.set(x, 1.95, z); scene.add(l);
          const f = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.flame(), color: 0xffc070, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          f.scale.set(0.16, 0.3, 1); f.position.set(x, 1.86, z); scene.add(f);
          return { l, f, ph: i * 1.7, x, z };
        });

        // ---- The round chamber: paved floor, a brass compass let into it, sandstone walls, a low dome with its opening ----
        const flagTex = P.canvasTex(128, 128, (g, w) => {
          g.fillStyle = '#b8aa98'; g.fillRect(0, 0, w, w);
          const r = P.rng(919);
          for (let i = 0; i < 240; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '60,50,40' : '230,220,200') + ',' + (0.05 + r() * 0.12) + ')'; g.beginPath(); g.arc(r() * w, r() * w, 1 + r() * 6, 0, Math.PI * 2); g.fill(); }
          g.strokeStyle = 'rgba(36,26,18,0.7)'; g.lineWidth = 3; g.strokeRect(0, 0, w, w);
        });
        flagTex.wrapS = flagTex.wrapT = T.RepeatWrapping; flagTex.repeat.set(7, 7);
        const floor = new T.Mesh(new T.CircleGeometry(RAD + 0.2, 64), paint({ map: flagTex, color: 0x6a5a4c }));
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
        const roseTex = P.canvasTex(256, 256, (g, w) => {
          g.clearRect(0, 0, w, w);
          const c = w / 2;
          g.strokeStyle = '#d9b060'; g.fillStyle = '#d9b060'; g.lineWidth = 3;
          g.beginPath(); g.arc(c, c, 110, 0, Math.PI * 2); g.stroke();
          g.lineWidth = 1.5; g.beginPath(); g.arc(c, c, 96, 0, Math.PI * 2); g.stroke();
          for (let k = 0; k < 8; k++) {
            const a = k * Math.PI / 4, l = k % 2 ? 60 : 92;
            g.beginPath(); g.moveTo(c + Math.sin(a) * l, c - Math.cos(a) * l); g.lineTo(c + Math.sin(a + 0.3) * 14, c - Math.cos(a + 0.3) * 14); g.lineTo(c + Math.sin(a - 0.3) * 14, c - Math.cos(a - 0.3) * 14); g.closePath();
            g.globalAlpha = k === 0 ? 1 : 0.55; g.fill(); g.globalAlpha = 1;
          }
          g.font = 'bold 26px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', c, 18);
        });
        const rose = new T.Mesh(new T.PlaneGeometry(2.4, 2.4), paint({ map: roseTex, transparent: true, color: 0xffffff }, 0xffe0a0, 0.3));
        rose.rotation.x = -Math.PI / 2; rose.position.set(0, 0.012, 0.15); rose.renderOrder = 1; rose.receiveShadow = true; scene.add(rose);
        const stoneMat = paint({ map: SC.tex.strata(19), color: 0x8a7462 }, 0xffb878, 0.12);
        const mas = SC.tex.masonry(19, 6, 4), wallMap = mas.map.clone(), wallBump = mas.bump.clone();
        [wallMap, wallBump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(14, 2.2); });
        const wallMat = paint({ map: wallMap, bumpMap: wallBump, bumpScale: 0.8, color: 0x6a5446, side: T.BackSide }, 0xffb878, 0.08);
        const gap = DOOR_W / RAD;
        const wall = new T.Mesh(new T.CylinderGeometry(RAD, RAD, WALL_H, 72, 1, true, gap / 2, Math.PI * 2 - gap), wallMat);
        wall.position.y = WALL_H / 2; wall.receiveShadow = true; scene.add(wall);
        const over = new T.Mesh(new T.CylinderGeometry(RAD, RAD, WALL_H - DOOR_H, 6, 1, true, -gap / 2, gap), wallMat);
        over.position.y = DOOR_H + (WALL_H - DOOR_H) / 2; scene.add(over);
        const domeMap = mas.map.clone(); domeMap.needsUpdate = true; domeMap.wrapS = domeMap.wrapT = T.RepeatWrapping; domeMap.repeat.set(16, 3);
        const dome = new T.Mesh(new T.SphereGeometry(RAD, 64, 18, 0, Math.PI * 2, 0.22, Math.PI / 2 - 0.22), paint({ map: domeMap, color: 0x4a3c34, side: T.BackSide }));
        dome.scale.y = 0.5; dome.position.y = WALL_H; scene.add(dome);
        const cornice = solid(new T.TorusGeometry(RAD - 0.05, 0.12, 6, 72), stoneMat, 0, WALL_H, 0); cornice.rotation.x = Math.PI / 2; cornice.castShadow = false;
        // niches round the wall, each with an oil lamp; lapis-blue stars painted on the plaster above them
        const nicheMat = new T.MeshStandardMaterial({ color: 0x1a120c, roughness: 1 });
        for (let k = 0; k < 10; k++) {
          const a = (k + 0.5) * Math.PI * 2 / 10 + Math.PI;
          if (Math.abs(Math.sin(a / 2)) < 0.2) continue;   // none by the door
          const n = new T.Mesh(new T.PlaneGeometry(0.8, 1.3), nicheMat);
          n.position.set(Math.sin(a) * (RAD - 0.02), 2.2, Math.cos(a) * (RAD - 0.02)); n.lookAt(0, 2.2, 0); scene.add(n);
          const sill = solid(new T.BoxGeometry(0.9, 0.08, 0.36), stoneMat, Math.sin(a) * (RAD - 0.16), 1.55, Math.cos(a) * (RAD - 0.16)); sill.rotation.y = a;
          const pot = solid(new T.SphereGeometry(0.09, 12, 8), paint({ color: 0x7a4a2a }), Math.sin(a) * (RAD - 0.3), 1.66, Math.cos(a) * (RAD - 0.3)); pot.scale.set(1.3, 0.6, 0.9);
        }
        // the sky beyond the opening: deep blue, and stars
        const skyGeo = new T.BufferGeometry(), sp = [], sr = P.rng(4040);
        for (let i = 0; i < 700; i++) { const u = sr() * Math.PI * 2, v = sr() * 0.9; sp.push(Math.sin(v) * Math.cos(u) * 60, Math.cos(v) * 60, Math.sin(v) * Math.sin(u) * 60); }
        skyGeo.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
        scene.add(new T.Points(skyGeo, new T.PointsMaterial({ color: 0xdfe6ff, size: 0.35, sizeAttenuation: true, fog: false })));
        const skyDome = new T.Mesh(new T.SphereGeometry(70, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshBasicMaterial({ color: 0x0a1230, side: T.BackSide, fog: false }));
        scene.add(skyDome);
        // the shaft of light from the opening to the altar
        const beamTex = P.canvasTex(32, 256, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.15, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0.25)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
        });
        const beamH = up.length() + 0.4;
        const beam = new T.Mesh(new T.CylinderGeometry(1.1, 1.0, beamH, 32, 1, true), new T.MeshBasicMaterial({ map: beamTex, color: 0x9aa8d8, transparent: true, opacity: 0.16, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped: false }));
        beam.position.copy(A).addScaledVector(up, 0.5); beam.position.y -= 0.2;
        beam.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), up.clone().normalize()); beam.renderOrder = 5; scene.add(beam);
        const beamPath = { a: A.clone().setY(0.3), d: up.clone().multiplyScalar(1.05).add(new T.Vector3(0, 0.7, 0)) };
        // the patch of light on the altar and the floor around it
        const pool = new T.Mesh(new T.CircleGeometry(1.25, 40), new T.MeshBasicMaterial({ map: glowTex, color: 0x8e9cc8, transparent: true, opacity: 0.35, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        pool.rotation.x = -Math.PI / 2; pool.position.set(ALTAR[0], 0.02, ALTAR[1] + 0.3); pool.scale.set(1.5, 1, 1); pool.renderOrder = 2; scene.add(pool);

        // ---- The altar under the light: a drum of stone, the Oracle's pigments on it (lapis blue) ----
        const altar = new T.Group(); altar.position.set(ALTAR[0], 0, ALTAR[1]); scene.add(altar);
        const altarTex = flagTex.clone(); altarTex.needsUpdate = true; altarTex.repeat.set(1.5, 1.5);
        const altarMat = paint({ map: altarTex, color: 0x8a7c6c }, 0xffd8a8, 0.12);
        solid(new T.CylinderGeometry(0.9, 1.0, 0.9, 32), stoneMat, 0, 0.45, 0, altar);
        solid(new T.CylinderGeometry(1.06, 1.06, 0.12, 32), altarMat, 0, 0.96, 0, altar);
        const lapis = new T.MeshStandardMaterial({ color: 0x1e3a9a, roughness: 0.8, emissive: 0x0a1440, emissiveIntensity: 0.4 });
        const bowlMat = paint({ color: 0x8a6a4a }, 0xffd0a0, 0.2);
        [[0.55, 0.25], [0.35, -0.45], [-0.55, 0.15]].forEach(([x, z], i) => {
          solid(new T.CylinderGeometry(0.16, 0.1, 0.1, 16), bowlMat, x, 1.07, z, altar);
          const p = new T.Mesh(new T.SphereGeometry(0.13, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), i ? lapis : paint({ color: 0xb8862a })); p.scale.y = 0.35; p.position.set(x, 1.1, z); altar.add(p);
        });
        const pestle = solid(new T.CylinderGeometry(0.03, 0.045, 0.32, 10), bowlMat, 0.62, 1.2, 0.2, altar); pestle.rotation.z = 0.7;

        // ---- The vestibule outside the door, and the stair Hermes came down ----
        const vest = new T.Group(); scene.add(vest);
        const vMap = mas.map.clone(); vMap.needsUpdate = true; vMap.wrapS = vMap.wrapT = T.RepeatWrapping; vMap.repeat.set(2.5, 2);
        const vMat = paint({ map: vMap, color: 0x3a2e26 });
        solid(new T.BoxGeometry(DOOR_W + 0.4, 0.1, 4.4), paint({ map: flagTex, color: 0x4a3e34 }), 0, -0.05, RAD + 2.1, vest);
        [-1, 1].forEach((sd) => solid(new T.BoxGeometry(0.4, DOOR_H + 0.4, 4.4), vMat, sd * (DOOR_W / 2 + 0.2), (DOOR_H + 0.4) / 2, RAD + 2.1, vest));
        solid(new T.BoxGeometry(DOOR_W + 0.8, 0.4, 4.4), vMat, 0, DOOR_H + 0.4, RAD + 2.1, vest);
        for (let k = 0; k < 6; k++) solid(new T.BoxGeometry(DOOR_W, 0.24, 0.5), stoneMat, 0, 0.12 + k * 0.24, RAD + 3.1 + k * 0.42, vest);
        // the door itself: a slab of sandstone, its eight sockets
        const door = new T.Group(); door.position.set(0, 0, RAD + 0.1); scene.add(door);
        const slab = solid(new T.BoxGeometry(DOOR_W, DOOR_H, 0.34), [stoneMat, stoneMat, stoneMat, stoneMat, paint({ map: doorTexture(), color: 0xc8a882 }, 0xffd0a0, 0.15), stoneMat], 0, DOOR_H / 2, 0, door);
        const sockGeo = new T.SphereGeometry(0.06, 14, 10);
        const sockets = Array.from({ length: 8 }, (_, k) => {
          const m = new T.Mesh(sockGeo, new T.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.5, emissive: 0xffc860, emissiveIntensity: 0 }));
          m.position.set(-DOOR_W / 2 + (80 + k * 50.3) / 512 * DOOR_W, DOOR_H * (1 - 600 / 704), 0.17); slab.add(m);
          return m;
        });
        sockets.forEach((m) => { m.position.y -= DOOR_H / 2; });
        const doorGlow = glow(0xffd890); doorGlow.scale.set(3.2, 1.2, 1); doorGlow.position.set(0, 0.55, 0.3); door.add(doorGlow);

        // ---- The Oracle, with the disc in her hands ----
        let oracle = null;
        try {
          oracle = SC.chars.oracle ? SC.chars.oracle(paint, { scale: 1.12 }) : SC.chars.elder(paint, { robe: 0x2e3552, trim: 0xb08a4a, mantle: 0x1c2034 });
          oracle.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          oracle.position.set(ORACLE[0], 0, ORACLE[1]); oracle.rotation.y = Math.PI; scene.add(oracle);
        } catch (e) { oracle = null; }
        const brass = paint({ color: 0xb88a3c, metalness: 0.35, roughness: 0.42, emissive: 0x1a0e04 }, 0xffe0a0, 0.45);
        const disc = new T.Group();
        const discBase = new T.Mesh(new T.CylinderGeometry(DR * 1.04, DR * 1.04, 0.035, 64), brass); discBase.rotation.x = Math.PI / 2; discBase.castShadow = true; disc.add(discBase);
        const rings = [0, 1, 2].map((r) => {
          const t = ringTextures(r);
          const m = new T.Mesh(new T.CircleGeometry(DR, 64), new T.MeshStandardMaterial({ map: t.map, transparent: true, metalness: 0.3, roughness: 0.45, emissive: 0xffd890, emissiveMap: t.glow, emissiveIntensity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 - r }));
          m.position.z = 0.019 + r * 0.002; m.renderOrder = 6 + r; disc.add(m);
          return m;
        });
        const north = new T.Mesh(new T.ConeGeometry(0.03, 0.07, 3), brass); north.position.set(0, DR * 1.04 + 0.03, 0.005); disc.add(north);
        const jewel = new T.Mesh(new T.SphereGeometry(DR * 0.15, 20, 14), new T.MeshStandardMaterial({ color: 0x5a3a10, roughness: 0.25, metalness: 0.2, emissive: 0xffc860, emissiveIntensity: 0 }));
        jewel.position.z = 0.03; jewel.scale.z = 0.5; disc.add(jewel);
        const jewelGlow = glow(0xffd890); jewelGlow.scale.set(0.9, 0.9, 1); jewelGlow.position.z = 0.06; disc.add(jewelGlow);
        const jewelLight = new T.PointLight(0xffd890, 0, 3, 1.6); jewelLight.position.z = 0.25; disc.add(jewelLight);
        const hover = new T.Mesh(new T.RingGeometry(DR * 0.7, DR * 0.98, 64), new T.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        hover.position.z = 0.026; hover.renderOrder = 10; disc.add(hover);
        if (oracle && oracle.userData.hold) { disc.rotation.set(0.12, Math.PI, 0); oracle.userData.hold.add(disc); }
        else { disc.position.set(ORACLE[0], 1.24, ORACLE[1] + 0.46); disc.rotation.x = -0.12; scene.add(disc); }

        // ---- Hermes and his lamp ----
        let H = null;
        try {
          H = P.buildHermes(T, glowTex);
          H.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(H.hermes);
        } catch (e) { H = null; }
        const lamp = new T.PointLight(0xffc27a, 1.1, 6, 1.6); scene.add(lamp);

        // ---- The feel: a cool lens, dust in the light, a body for Hermes ----
        let fx = null, motes = null;
        try {
          if (window.EclipseFX) {
            fx = window.EclipseFX.kit(renderer, scene, H, {
              look: { bloom: 0.75, threshold: 0.82, knee: 0.2, vignette: 0.48, grain: 0.03, ca: 0.12, sat: 1.02, contrast: 1.05, gain: [0.98, 1.0, 1.05], shade: 0.3, shadeColor: [0.42, 0.46, 0.7] },
              sandColor: 0x7a6a5a, printsOn: false, scale: 1, wind: [0, 0, 0], ambient: null, sparkColor: 0xffe0a0
            });
            motes = window.EclipseFX.particles(scene, { max: lowPower ? 160 : 320, additive: true, wind: [0.03, 0, 0.02] });
          }
        } catch (e) { fx = null; }

        scene.updateMatrixWorld(true);
        const dp = disc.getWorldPosition(new T.Vector3());
        return { T, renderer, scene, camera, discAt: [dp.x, dp.y, dp.z], lowPower, beam, beamLight, hemi, lamps, door, slab, sockets, doorGlow, oracle, disc, rings, hover, jewel, jewelGlow, jewelLight,
          beamPath, pool, ringAng: [0, 1, 2].map((r) => -rot[r] * Math.PI / 4), H, hermes: H && H.hermes, lamp, fx, motes, moteAcc: 0, altar,
          ray: new T.Raycaster(), hMove: null, hGoal: null, discPlaced: 0, discFrom: null,
          cam: { yaw: 0, pitch: 0, dist: 1, tYaw: 0, tPitch: 0, tDist: 1, p: null, l: null } };
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
      // the door stands until the sigil, then sinks into the floor; inside, Hermes waits before the Oracle
      const doorOpen = (now) => (!isAwake() ? 0 : !view.sigilT || reduced() ? 1 : clamp(((now || performance.now()) - view.sigilT - 1700) / 2600, 0, 1));
      function steerHermes(snap) {
        if (!G || !G.hermes) return;
        const inside = isAwake() && doorOpen() >= 0.6;
        const [x, z] = inside ? SPOT_IN : SPOT_OUT;
        if (!snap && G.hGoal && G.hGoal[0] === x && G.hGoal[1] === z) return;
        G.hGoal = [x, z];
        const h = G.hermes;
        if (snap || !G.hGoal0) { h.position.set(x, 0.02, z); h.rotation.y = 0; G.hGoal0 = true; G.hMove = null; return; }
        const d = Math.hypot(x - h.position.x, z - h.position.z);
        G.hMove = moveTo(h, x, z, Math.min(4.5, d / 1.7), faceYaw(x - h.position.x, z - h.position.z));
      }
      function syncWorld() {
        if (!G) return;
        const snap = view.snapNext;
        // each ring turns the short way to where it now stands
        [0, 1, 2].forEach((r) => {
          let goal = -rot[r] * Math.PI / 4;
          while (goal - G.ringAng[r] > Math.PI) goal -= Math.PI * 2;
          while (goal - G.ringAng[r] < -Math.PI) goal += Math.PI * 2;
          G.rings[r].userData.goal = goal;
          if (snap) G.ringAng[r] = goal;
        });
        if (snap) {
          G.discPlaced = isDone() ? 1 : 0;
          if (G.discPlaced) placeDisc(1);
        }
        steerHermes(snap);
        view.snapNext = false;
      }
      // after the vow she lays the disc on the altar, face up in the light
      function placeDisc(k) {
        const T = G.T, d = G.disc;
        if (!G.discFrom) {
          G.scene.updateMatrixWorld(true);
          const p = new T.Vector3(), q = new T.Quaternion();
          d.getWorldPosition(p); d.getWorldQuaternion(q);
          G.scene.attach(d);
          G.discFrom = { p, q };
          G.discTo = { p: new T.Vector3(ALTAR[0] - 0.05, 1.07, ALTAR[1] + 0.35), q: new T.Quaternion().setFromEuler(new T.Euler(-Math.PI / 2, 0, 0)) };
        }
        const e = ease(k);
        d.position.lerpVectors(G.discFrom.p, G.discTo.p, e);
        d.position.y += Math.sin(e * Math.PI) * 0.35;
        d.quaternion.copy(G.discFrom.q).slerp(G.discTo.q, e);
      }

      // ---- The disc under the pointer: which ring, and what a click does ----
      function ringUnder(e) {
        if (!G || !el.canvas) return -1;
        const r = el.canvas.getBoundingClientRect();
        const ndc = new G.T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        G.ray.setFromCamera(ndc, G.camera);
        const hit = G.ray.intersectObject(G.rings[0], false)[0];
        if (!hit) return -1;
        const local = G.rings[0].worldToLocal(hit.point.clone());
        const f = Math.hypot(local.x, local.y) / DR;
        return RING_R.findIndex(([a, b]) => f >= a && f < b);
      }
      const canTurn = () => !!(G && isAwake() && !whenRead() && !busyOverlay() && view.phase === 'disc' && modal.style.display !== 'none');
      function setHover(ring) {
        view.hover = canTurn() ? ring : -1;
        if (el.canvas) el.canvas.style.cursor = view.hover >= 0 ? 'pointer' : '';
        if (!el.aim) return;
        if (view.hover >= 0) {
          const s = STARS[view.hover];
          el.aim.textContent = s.ring + ' · ' + s.name + ' points ' + SPOKE_NAMES[starSpoke(view.hover)] + (ringTrue(view.hover) ? ' ✓' : '') + ' · click ⟳, right-click ⟲';
          el.aim.classList.add('is-on');
          el.aim.classList.toggle('is-true', ringTrue(view.hover));
        } else el.aim.classList.remove('is-on');
      }
      function bindPointer() {
        const c = el.canvas;
        if (!c || c.__oraclePointer) return;
        c.__oraclePointer = true;
        c.style.touchAction = 'none';
        const pt = { down: false, x: 0, y: 0, moved: 0, button: 0 };
        c.addEventListener('contextmenu', (e) => e.preventDefault());
        c.addEventListener('pointerdown', (e) => { pt.down = true; pt.x = e.clientX; pt.y = e.clientY; pt.moved = 0; pt.button = e.button; try { c.setPointerCapture(e.pointerId); } catch (err) {} });
        c.addEventListener('pointermove', (e) => {
          if (pt.down) {
            const dx = e.clientX - pt.x, dy = e.clientY - pt.y;
            pt.moved += Math.abs(dx) + Math.abs(dy);
            if (G && pt.moved > 4) { G.cam.tYaw = clamp(G.cam.tYaw - dx * 0.003, -0.5, 0.5); G.cam.tPitch = clamp(G.cam.tPitch + dy * 0.003, -0.3, 0.45); }
            pt.x = e.clientX; pt.y = e.clientY;
          } else setHover(ringUnder(e));
        });
        c.addEventListener('pointerup', (e) => {
          if (!pt.down) return;
          pt.down = false;
          if (pt.moved > 6 || !canTurn()) return;
          const ring = ringUnder(e);
          if (ring >= 0) { turn(ring, pt.button === 2 || e.shiftKey ? -1 : 1); setHover(ring); }
        });
        c.addEventListener('pointercancel', () => { pt.down = false; });
        c.addEventListener('pointerleave', () => setHover(-1));
        c.addEventListener('wheel', (e) => { if (!G) return; e.preventDefault(); G.cam.tDist = clamp(G.cam.tDist * Math.exp(e.deltaY * 0.0012), 0.6, 1.7); }, { passive: false });
      }

      // ---- The camera: the door from the stair, the disc close in her hands, the two of them, the whole chamber ----
      function cameraPhase() {
        if (isDone()) return 'end';
        if (!isAwake() || (view.sigilT && performance.now() - view.sigilT < 5200)) return 'door';
        if (!whenRead()) return 'disc';
        return 'vow';
      }
      const SHOTS = {
        door: { p: [0.85, 2.5, RAD + 5.4], l: [0.05, 1.55, RAD] },
        disc: { p: [0.16, 1.42, 0.6], l: [0, 1.28, ORACLE[1] + 0.48] },
        vow: { p: [3.3, 2.0, 1.5], l: [-0.1, 1.45, 0.0] },
        end: { p: [-3.4, 2.4, 3.2], l: [0, 1.3, -1.2] }
      };
      function shotFor(ph) {
        if (ph !== 'disc' || !G.discAt) return SHOTS[ph];
        const [x, y, z] = G.discAt;
        return { p: [x + 0.18, y + 0.12, z + 1.25], l: [x, y, z] };
      }
      function placeCamera(dt, snap) {
        const cam = G.camera, c = G.cam;
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else {
          const ph = cameraPhase();
          if (ph !== view.phase) { view.phase = ph; c.tYaw = 0; c.tPitch = 0; c.tDist = 1; setHover(-1); }
          const k = Math.min(1, dt * 4);
          c.yaw += (c.tYaw - c.yaw) * k; c.pitch += (c.tPitch - c.pitch) * k; c.dist += (c.tDist - c.dist) * k;
          const s = shotFor(ph);
          // orbit the shot's own point by her drag, and come closer or further with the wheel
          const ox = s.p[0] - s.l[0], oy = s.p[1] - s.l[1], oz = s.p[2] - s.l[2];
          const d0 = Math.hypot(ox, oy, oz), yaw0 = Math.atan2(ox, oz), pit0 = Math.asin(oy / d0);
          const yaw = yaw0 + c.yaw, pit = clamp(pit0 + c.pitch, -0.6, 1.2), d = d0 * c.dist;
          p = [s.l[0] + Math.sin(yaw) * Math.cos(pit) * d, s.l[1] + Math.sin(pit) * d, s.l[2] + Math.cos(yaw) * Math.cos(pit) * d];
          l = s.l.slice();
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
        return [
          { from: { p: [0, 4.6, RAD + 7.5], l: [0, 1.4, RAD] }, to: { p: [0, 2.6, RAD + 5.2], l: [0, 1.6, RAD] }, dur: 5.5, kicker: 'STATION 19', title: "THE ORACLE'S HORIZON", line: 'The inner stair of Tower II goes down a long way, into the cool and the dark.' },
          { from: { p: [0.6, WALL_H + 2.6, 1.2], l: [0, 0.6, -1.6] }, to: { p: [0.4, WALL_H, 2.4], l: [0, 0.8, -1.8] }, dur: 5.5, line: 'Behind its door, a round chamber with an opening in the roof. Grey light falls on an altar.' },
          { from: { p: [1.7, 1.7, 1.4], l: [0, 1.6, ORACLE[1]] }, to: { p: [1.0, 1.65, 0.7], l: [0, 1.65, ORACLE[1]] }, dur: 5.5, line: 'And beside it, someone standing very still: veiled, humming a song with no words.' }
        ];
      }

      // ---- The frame ----
      function drawFrame(now, dt) {
        if (!G) return;
        const t = now / 1000, rm = reduced(), done = isDone(), lit = discTrue() && isAwake();
        // Hermes walks in once the door is down, and looks up at her
        steerHermes(false);
        if (G.hermes) {
          if (G.hMove) G.hMove = stepMv(G.hermes, G.hMove, dt);
          else G.hermes.rotation.y += shortTurn(G.hermes.rotation.y, 0) * Math.min(1, dt * 4);
          G.hermes.position.y = 0.02;
          if (G.H && G.H.flame) G.H.flame.getWorldPosition(G.lamp.position); else G.lamp.position.set(G.hermes.position.x, 1.4, G.hermes.position.z);
          G.lamp.intensity = 1.1 + (rm ? 0 : Math.sin(t * 11) * 0.07);
        }
        // the door: its sockets light one by one for the sigil, then it sinks, grinding, into the floor
        const sockN = !isAwake() ? 0 : !view.sigilT || rm ? 8 : clamp(Math.floor((now - view.sigilT) / 190), 0, 8);
        G.sockets.forEach((m, k) => { m.material.emissiveIntensity = k < sockN ? 1.6 : 0; });
        G.doorGlow.material.opacity = sockN && doorOpen(now) < 1 ? 0.35 * (1 - doorOpen(now)) : 0;
        const open = doorOpen(now), was = G.door.position.y;
        G.door.position.y = -ease(open) * (DOOR_H + 0.05);
        G.door.visible = open < 1;
        if (Math.abs(G.door.position.y - was) > 1e-4 && G.fx) {
          G.fx.shake.add(0.02);
          if (Math.random() < dt * 14) G.fx.puff({ x: (Math.random() - 0.5) * DOOR_W, y: 0.1, z: RAD + 0.4 }, 3, { color: 0x9a8a72, alpha: 0.3, size: [0.2, 0.45], up: [0.2, 0.6] });
        }
        // the rings turn to where she set them; the hovered one lights a little
        G.rings.forEach((m, r) => {
          const goal = m.userData.goal == null ? G.ringAng[r] : m.userData.goal;
          G.ringAng[r] += rm ? goal - G.ringAng[r] : (goal - G.ringAng[r]) * Math.min(1, dt * 9);
          m.rotation.z = G.ringAng[r];
          const want = lit ? 1.1 : (view.hover === r ? 0.22 : 0);
          m.material.emissiveIntensity += (want - m.material.emissiveIntensity) * Math.min(1, dt * 6);
        });
        if (view.hover >= 0 && !lit) {
          if (G.hover.userData.ring !== view.hover) {
            const [a, b] = RING_R[view.hover];
            G.hover.userData.ring = view.hover;
            G.hover.geometry.dispose(); G.hover.geometry = new G.T.RingGeometry(DR * a, DR * b, 64);
          }
          G.hover.material.opacity = 0.08 + (rm ? 0 : 0.04 * Math.sin(t * 5));
        } else G.hover.material.opacity = 0;
        // the jewel: dark, then three short flashes and two long ones, then a steady glow
        const pulse = el.disc && el.disc.classList.contains('is-pulse');
        const jw = !lit ? 0 : pulse ? 3.2 : 1.1 + (rm ? 0 : 0.2 * Math.sin(t * 2));
        G.jewel.material.emissiveIntensity += (jw - G.jewel.material.emissiveIntensity) * Math.min(1, dt * 18);
        G.jewelGlow.material.opacity = G.jewel.material.emissiveIntensity * 0.28;
        G.jewelLight.intensity = G.jewel.material.emissiveIntensity * 0.9;
        // the end: the disc goes down on the altar, the veil comes up, the grey light turns gold
        const e = view.endT ? (now - view.endT) / 1000 : (done ? 99 : -1);
        if (done) {
          const k = rm ? 1 : clamp(e / 1.8, 0, 1);
          if (k > G.discPlaced || !G.discFrom) { G.discPlaced = k; placeDisc(k); }
        }
        const veil = done ? (rm ? 1 : clamp((e - 1.6) / 2.2, 0, 1)) : 0;
        if (G.oracle) {
          if (G.oracle.userData.lift) G.oracle.userData.lift(veil);
          if (G.oracle.userData.look && G.hermes) G.oracle.userData.look({ x: G.hermes.position.x, y: 1.6, z: G.hermes.position.z });
          if (G.oracle.userData.update) G.oracle.userData.update(t);
        }
        const warm = done ? (rm ? 1 : clamp((e - 1.2) / 3, 0, 1)) : (lit ? 0.35 : 0);
        G.beam.material.color.setRGB(0.6 + 0.4 * warm, 0.66 + 0.2 * warm, 0.85 - 0.35 * warm);
        G.beam.material.opacity = 0.14 + 0.1 * warm + (rm ? 0 : 0.015 * Math.sin(t * 0.7));
        G.beamLight.color.setRGB(0.72 + 0.28 * warm, 0.77 + 0.1 * warm, 0.91 - 0.4 * warm);
        G.beamLight.intensity = 1.5 + 0.8 * warm;
        G.pool.material.color.copy(G.beam.material.color); G.pool.material.opacity = 0.3 + 0.2 * warm;
        // dust turning slowly in the light, oil lamps breathing in the niches
        if (G.motes && !rm) {
          G.moteAcc += dt * (G.lowPower ? 8 : 16);
          const n = Math.floor(G.moteAcc); G.moteAcc -= n;
          for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.95, u = Math.random() * 0.8, bp = G.beamPath;
            G.motes.emit({ x: bp.a.x + bp.d.x * u + Math.cos(a) * r, y: bp.a.y + bp.d.y * u, z: bp.a.z + bp.d.z * u + Math.sin(a) * r }, 1, { color: warm > 0.5 ? 0xffe2a0 : 0xd8e0ff, size: [0.02, 0.05], speed: [0, 0.05], up: [-0.03, 0.05], gravity: 0, drag: 0.2, life: [3, 6], alpha: 0.5, fadeIn: 0.4, spread: 0.1 });
          }
        }
        G.lamps.forEach((lp) => {
          const fl = rm ? 1 : 1 + Math.sin(t * 9 + lp.ph) * 0.08 + Math.sin(t * 23 + lp.ph) * 0.04;
          lp.l.intensity = 0.9 * fl; lp.f.scale.set(0.16 * (2 - fl), 0.3 * fl, 1);
        });
        if (G.fx) G.fx.frame(dt, G.camera);
        if (G.motes) G.motes.update(dt, G.camera, G.renderer);
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
      const oracleDoes = (kind) => { if (G && G.oracle && G.oracle.userData.react) G.oracle.userData.react(kind); };
      function sceneSigil() {
        view.sigilT = performance.now();
        if (G && G.fx) G.fx.triumph({ x: 0, y: 0.8, z: RAD + 0.4 }, 0.5);
        subtitle('One by one the eight sockets of the door glow. Then the whole slab sinks into the floor, grinding, and the grey light of the chamber spills out.', 5.5, 'act');
      }
      function sceneTurn(ring, trueNow, allTrue) {
        if (!G || !G.fx) return;
        if (allTrue) {
          const p = new G.T.Vector3(); G.jewel.getWorldPosition(p);
          G.fx.triumph({ x: p.x, y: p.y, z: p.z }, 0.35);
          subtitle('The three stars point true. Every sighting on the disc lights up, and the jewel at its heart begins to flash.', 5, 'act');
          oracleDoes('nod');
        } else if (trueNow) {
          const p = new G.T.Vector3(); G.rings[ring].getWorldPosition(p);
          G.fx.sparks.emit({ x: p.x, y: p.y, z: p.z + 0.05 }, 8, { color: 0xffe0a0, size: [0.015, 0.03], speed: [0.1, 0.4], up: [0.1, 0.4], life: [0.4, 0.8], alpha: 0.9, gravity: -0.6, spread: 0.4 });
        }
      }
      function sceneRead(ok) {
        if (ok) { subtitle('“December, the eighteenth to the twentieth.” She lowers the disc a little, and listens.', 4.5, 'act'); oracleDoes('nod'); react('wonder'); }
        else react('worry');
      }
      function sceneWord(word) {
        subtitle('Hermes, very softly: “' + word.charAt(0) + word.slice(1).toLowerCase() + '…”', 2.4, 'act');
        if (G && G.H && G.hermes) react('nod');
      }
      function sceneVowWrong() { subtitle('She listens with her head tilted, and slowly shakes it.', 3.4, 'act'); oracleDoes('shake'); react('worry'); }
      function sceneVow() {
        view.endT = performance.now();
        react('wonder');
        subtitle('“You were always the treasure.”', 3, 'act');
        view.endTimers.forEach(clearTimeout);
        view.endTimers = [
          setTimeout(() => { if (modal.style.display !== 'none') subtitle('Her hands let go of the disc. Then she lifts the veil herself.', 4.5, 'act'); }, reduced() ? 200 : 2600),
          setTimeout(() => {
            if (modal.style.display === 'none') return;
            subtitle('It is Aurelia: older, a white streak in her grey hair, lapis blue under her nails. Her eyes are exactly the same.', 6.5, 'act');
            oracleDoes('bow');
            if (G && G.fx && G.oracle) G.fx.triumph({ x: ORACLE[0], y: 1.9, z: ORACLE[1] }, 0.9);
          }, reduced() ? 400 : 4600)
        ];
      }

      // ---- Controls ----
      el.ringBtns.forEach((pair, ring) => {
        if (pair[0]) pair[0].addEventListener('click', () => turn(ring, -1));
        if (pair[1]) pair[1].addEventListener('click', () => turn(ring, 1));
      });
      if (el.speak) el.speak.addEventListener('click', speakSigil);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakSigil(); });
      if (el.read) el.read.addEventListener('click', readWhen);
      if (el.whenInput) el.whenInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') readWhen(); });
      if (el.unsay) el.unsay.addEventListener('click', unsay);
      if (el.vow) el.vow.addEventListener('click', speakVow);

      // ---- Open / close ----
      const fiveSeals = () => [1, 2, 3, 4, 5].every((i) => get('order_seal_cairn_' + i) === 'true');
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_polybius_stele_completed') !== 'true' || !fiveSeals()) return false;
        return typeof window.isOracleStairOver === 'function' ? window.isOracleStairOver() : false;
      }
      // The Servant's coin (a caught lie at the gates) has the half-lit disc on one face: the Oracle's sign. Hermes holds it up to the slab.
      function coinNote() {
        const f = window.GatesRoad ? window.GatesRoad.flags() : {};
        if (!f.coin) return '';
        if (hints && hints.grant) hints.grant('s19-sigil', 1);
        return " The Servant's coin has the half-lit disc on one face, and the slab has the same disc over the sockets. The Servant's last word about it: “do not read a beacon where it stands”.";
      }
      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('oracle3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('oracle3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-oracle-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
        setHover(-1);
      }
      function focusTarget() {
        if (isDone()) return el.finish;
        if (!isAwake()) return el.keyInput;
        if (!whenRead()) return discTrue() ? el.whenInput : el.ringBtns[0][1];
        return el.tiles && el.tiles.querySelector('button:not([disabled])');
      }
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-oracle-howto-back'), hn = $('btn-oracle-howto-next'), hs = $('btn-oracle-howto-skip');
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
      function openOracleModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          if (get('order_polybius_stele_completed') !== 'true') toast('✦ TERRA INCOGNITA ✦ Save the Servant of Tower II (Station 18) before the inner stair opens.');
          else if (!fiveSeals()) {
            // The Servant leads the seeker back to Cairn I (and lifts its lock: four seals are more than enough)
            if (typeof window.checkServantCairnRequirement === 'function' && window.checkServantCairnRequirement()) return;
            toast("'She receives no one until the five seals are home.' The first seal still sleeps by the dry wash, at Cairn I.");
          }
          else toast('Hermes is waiting for dawn by the inner stair. Open the Cliffside Workshop: he will wire you before he goes down.');
          return;
        }
        // With five seals home, the bronze doors of the gates open first (once), and the welcome depends on the road taken
        if (!isDone() && fiveSeals() && window.GatesRoad && window.GatesRoad.needsReturn() && typeof window.openGatesTowerIIModal === 'function') {
          window.openGatesTowerIIModal({ mode: 'return', onDone: openOracleModal });
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
        if (G && 'ResizeObserver' in window && !el.stage.__oracleFit) { el.stage.__oracleFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        view.snapNext = true; view.sigilT = 0; view.endT = 0; view.phase = ''; view.hover = -1;
        if (G) { G.cam.p = null; G.hGoal = null; G.hGoal0 = false; G.hMove = null; }
        if (el.fade) el.fade.classList.remove('is-on');
        if (isDone()) { applyVictory(); say("She is grinding lapis by the altar, Silvia, and humming. Every now and then she looks up at me as if to check that I am still here. I am."); }
        else if (!isAwake()) say("Silvia, I am at the bottom of the inner stair, with the Servant's key in my hand. The door is a slab of sandstone carved with a horizon: three mirrors and eight small sockets. The Servant says it opens only for the sigil of the Oracle. Open the page “The Oracle's Horizon”, please. I can hear someone humming behind it." + coinNote());
        else if (!whenRead()) say("She is still holding the disc up for us, Silvia, patient as stone. Set the rings by the sky.");
        else say("She is waiting, Silvia, with her lips moving on words she cannot quite find. Give them back to her.");
        render();
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
      function closeOracleModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopPulse();
        if (cine && cine.active) cine.skip();
        view.endTimers.forEach(clearTimeout); view.endTimers = [];
        setHover(-1);
        if (el.fade) el.fade.classList.remove('is-on');
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openOracleModal = openOracleModal;
      window.closeOracleModal = closeOracleModal;
      if (el.close) el.close.addEventListener('click', closeOracleModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeOracleModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (el.passage && el.passage.style.display !== 'none' && el.passage.style.display !== '') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeOracleModal();
      }, true);

      // ---- From the desert to the stage (once) ----
      let passageReturnFocus = null;
      function showStagePassage() {
        if (!el.passage) return;
        passageReturnFocus = document.activeElement;
        el.passage.style.display = 'flex';
        set(KEYS.passage, 'true');
        setTimeout(() => { if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime(); }, 1600);
        if (el.passageClose) setTimeout(() => el.passageClose.focus(), 80);
      }
      function closeStagePassage() {
        if (!el.passage || el.passage.style.display === 'none') return;
        el.passage.style.display = 'none';
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        if (typeof window.switchMapPath === 'function') window.switchMapPath('stage', true);   // the curtain rises on Path III
        const tab = document.getElementById('btn-tab-path-stage');
        const back = tab && tab.offsetParent ? tab : passageReturnFocus;
        if (back && document.contains(back) && typeof back.focus === 'function') back.focus();
        passageReturnFocus = null;
      }
      window.showStagePassage = showStagePassage;
      if (el.passageClose) el.passageClose.addEventListener('click', closeStagePassage);
      document.addEventListener('keydown', (e) => {
        if (!el.passage || el.passage.style.display === 'none') return;
        if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); closeStagePassage(); }
        else if (e.key === 'Tab') { e.preventDefault(); if (el.passageClose) el.passageClose.focus(); }   // the passage holds the focus
      }, true);
      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeOracleModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (get(KEYS.passage) !== 'true') showStagePassage();
          else if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ The Desert Path is complete ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
        });
      }

      // Test hook for scripts/audit/web_smoke.py: the disc and the vow (they are in this source anyway) and the controls
      window.__oracle = {
        rings: RINGS.map((r) => r.join('')),
        stars: STARS.map((s) => ({ name: s.name, spoke: s.spoke })),
        tiles: TILES.slice(),
        rot: () => rot.slice(),
        letterAt: (ring, spoke) => letterAt(ring, spoke),
        turn: (ring, dir) => turn(ring, dir),
        read: (text) => { if (el.whenInput) el.whenInput.value = text; readWhen(); },
        say: (i) => sayWord(i),
        vow: () => speakVow(),
        gfx: () => G,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          return {
            gl: true, phase: view.phase, hermes: G.hermes ? [+G.hermes.position.x.toFixed(2), +G.hermes.position.z.toFixed(2)] : null,
            door: +(-G.door.position.y).toFixed(2), sockets: G.sockets.filter((m) => m.material.emissiveIntensity > 0).length,
            rings: G.ringAng.map((a) => +a.toFixed(2)), jewel: +G.jewel.material.emissiveIntensity.toFixed(2),
            onAltar: !!(G.discFrom && G.disc.parent === G.scene), veil: !!G.oracle, post: !!(G.fx && G.fx.post)
          };
        },
        aimRing: (ring) => {
          // where a ring of the disc is on the screen (its south letter), so a test can click it like she would
          if (!G) return null;
          G.scene.updateMatrixWorld(true);
          const [a, b] = RING_R[ring];
          const v = G.rings[0].localToWorld(new G.T.Vector3(0, -DR * (a + b) / 2, 0));
          v.project(G.camera);
          const r = el.canvas.getBoundingClientRect();
          return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
        },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) drawFrame(performance.now() + i * 33, 1 / 30); },
        settle: () => { view.sigilT = 0; view.endT = 0; view.snapNext = true; syncWorld(); }
      };

      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
