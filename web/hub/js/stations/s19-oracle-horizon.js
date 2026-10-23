
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
        tSigil: $('oracle-telem-sigil'), tDisc: $('oracle-telem-disc'), tWhen: $('oracle-telem-when'), tOracle: $('oracle-telem-oracle'),
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
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (rot.every((r) => r === 0)) {
          feedback(el.discFeedback, 'The three stars point true. The jewel of the disc wakes.', 'ok');
          say("Silvia... the jewel. Three short flashes, a pause, two long ones: the code I engraved in it, more than fifty years ago. And every sighting is lit. Read it the way I made it to be read: from the north, clockwise, each spoke from the rim to the heart.");
          pulseCode();
          if (el.whenInput) setTimeout(() => el.whenInput.focus(), 60);
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
          feedback(el.discFeedback, 'Hermes frowns: that is not what the disc says. Start at the north spoke, read rim, middle, heart, then go clockwise.', 'error');
          render();
          return;
        }
        set(KEYS.when, 'true');
        stopPulse();
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback(el.discFeedback, 'DECEMBER EIGHTEEN TO TWENTY. The first truth: the WHEN.', 'ok');
        say("December, the eighteenth to the twentieth. The hour and the season, Silvia: the first truth, written on a disc I made with my own hands, and I never knew what it would say. She is holding it out to you. And now she is looking at me through her veil, and she is saying words, very softly, as if she were trying to remember a song. Help me, Silvia. I think I know which words they are.");
        render();
        const first = el.tiles && el.tiles.querySelector('button');
        if (first) setTimeout(() => first.focus(), 60);
      }

      // ---- The vow ----
      function drawTiles() {
        if (el.tiles) {
          el.tiles.textContent = '';
          TILES.forEach((w, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'monolith-btn oracle-tile';
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
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        render();
        const next = el.tiles && el.tiles.querySelector('button:not([disabled])');
        if (next) next.focus();
      }
      function unsay() {
        if (isDone() || !said.length) return;
        said.pop();
        render();
      }
      function speakVow() {
        if (!whenRead() || isDone()) return;
        if (!said.length) { feedback(el.vowFeedback, 'Choose the words first.', 'error'); return; }
        const words = said.map((i) => TILES[i]);
        if (words.join(' ') !== VOW.join(' ')) {
          set(KEYS.vowFails, String((parseInt(get(KEYS.vowFails) || '0', 10) || 0) + 1));
          vowHints.fail();
          const full = words.join(' ') === 'YOU WERE NEVER ONLY THE SEEKER';
          feedback(el.vowFeedback, full
            ? 'She tilts her head: those words are true, but they are only the first half. They were never the words he said to her.'
            : 'She listens, and shakes her head slowly. Close, but not hers.', 'error');
          said = [];
          render();
          return;
        }
        completeStation();
        if (el.finish) setTimeout(() => el.finish.focus(), 60);
        say("I said it, Silvia. 'You were always the treasure.' And her hands let go of the disc, and she lifted the veil herself. It is her. It is Aurelia. Older, with a white streak in her hair and lapis blue under her nails, and her eyes are exactly the same. She does not remember everything. She remembers my voice, and the fire, and the cold of the terrace. She said her own name slowly, like a word in a language she used to speak. I cannot write any more right now.");
      }
      function completeStation() {
        set(KEYS.done, 'true');
        set(KEYS.when, 'true');
        stopPulse();
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
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
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The door stays shut. Send the eight beacons across the mirrors on the page “The Oracle\'s Horizon” again.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'OVERTURE. The horizon is sealed, and the door of the inner chamber opens.', 'ok');
        say("OVERTURE... and the door opened, Silvia. The chamber is round, with an opening in the roof and a beam of grey light on a stone altar. She is there. Veiled, in a worn hooded robe, standing very still. She has not said a word. She is holding up a brass disc, Silvia. My disc. Twenty-four sightings, three rings. She turns it toward me as if she wanted me to read it, and its rings are all crooked.");
        render();
        const b = el.ringBtns[0] && el.ringBtns[0][1];
        if (b) setTimeout(() => b.focus(), 60);
      }

      function render() {
        const awake = isAwake(), done = isDone(), wRead = whenRead(), dTrue = discTrue();
        sigilHints.refresh(); discHints.refresh(); vowHints.refresh();
        drawDisc();
        drawSky();
        drawTiles();
        el.ringBtns.forEach((pair) => pair.forEach((b) => { if (b) b.disabled = !awake || wRead; }));
        el.ringLabels.forEach((n, ring) => { if (n) n.textContent = STARS[ring].ring + ' · ' + STARS[ring].name + (awake ? ' → ' + SPOKE_NAMES[starSpoke(ring)] : ''); });
        if (el.readPanel) el.readPanel.style.display = awake && dTrue && !wRead ? '' : 'none';
        if (el.when) el.when.style.display = wRead ? '' : 'none';
        if (el.unsay) el.unsay.disabled = !wRead || done || !said.length;
        if (el.vow) el.vow.disabled = !wRead || done;
        if (el.tSigil) el.tSigil.textContent = awake ? SIGIL + ' ✓' : '[ 8 LETTERS ]';
        if (el.tDisc) el.tDisc.textContent = dTrue && awake ? 'SET TRUE ✓' : (awake ? 'CROOKED' : '[ DARK ]');
        if (el.tWhen) el.tWhen.textContent = wRead ? '18 – 20 DECEMBER ✓' : '[ SEALED ]';
        if (el.tOracle) el.tOracle.textContent = done ? 'SHE REMEMBERS ✓' : (awake ? 'VEILED, LISTENING' : '[ VEILED ]');
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
      let returnFocusTo = null;
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
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        returnFocusTo = document.activeElement;
        if (isDone()) { applyVictory(); say("She is grinding lapis by the altar, Silvia, and humming. Every now and then she looks up at me as if to check that I am still here. I am."); }
        else if (!isAwake()) say("Silvia, I am at the bottom of the inner stair, with the Servant's key in my hand. The door is a slab of sandstone carved with a horizon: three mirrors and eight small sockets. The Servant says it opens only for the sigil of the Oracle. Open the page “The Oracle's Horizon”, please. I can hear someone humming behind it.");
        else if (!whenRead()) say("She is still holding the disc up for us, Silvia, patient as stone. Set the rings by the sky.");
        else say("She is waiting, Silvia, with her lips moving on words she cannot quite find. Give them back to her.");
        render();
        const focusTarget = isDone() ? el.finish : (!isAwake() ? el.keyInput : (!whenRead() ? (discTrue() ? el.whenInput : el.ringBtns[0][1]) : el.tiles && el.tiles.querySelector('button:not([disabled])')));
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
      }
      function closeOracleModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopPulse();
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openOracleModal = openOracleModal;
      window.closeOracleModal = closeOracleModal;
      if (el.close) el.close.addEventListener('click', closeOracleModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeOracleModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeOracleModal(); });

      // ---- From the desert to the stage (once) ----
      let passageReturnFocus = null;
      function showStagePassage() {
        if (!el.passage) return;
        passageReturnFocus = document.activeElement;
        el.passage.style.display = 'flex';
        set(KEYS.passage, 'true');
        if (sfx && sfx.playCelestialChime) setTimeout(() => sfx.playCelestialChime(), 1600);
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
        vow: () => speakVow()
      };

      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
