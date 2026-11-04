    // =========================================================================
    // Station 13 · "Transmit the Registry", noon at Camp VIII
    // =========================================================================
    // Hermes walks the ring. The heat lies; he cannot trust what he sees in the bowls.
    // Silvia has already solved the page “The Oasis Clepsydra”. At each well she transmits
    // one line of the Oasis Registry (seeker · relic · hour) using the page’s own words.
    // Four true transmissions set four counterweights. Then the Roman dial (XXX), then the
    // cold cleft under the falcon. Three hearts for the whole noon. No new letter.
    (function initOasisVisions() {
      const modal = document.getElementById('modal-oasis-visions');
      if (!modal) return;

      const $ = (id) => document.getElementById(id);
      const el = {
        stage: $('visions-stage'), canvas: $('visions-canvas'), subtitle: $('visions-subtitle'),
        clock: $('visions-clock'), hearts: $('visions-hearts'), fade: $('visions-fade'),
        voice: $('visions-voice'), where: $('visions-where'), controls: $('visions-controls'),
        lost: $('visions-lost'), done: $('visions-done'),
        howto: $('visions-howto'), close: $('btn-close-visions')
      };
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const drop = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
      const toast = (msg) => { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); };
      const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const WALK_KEY = 'order_clepsydra_visions';
      const ACT_KEY = 'order_clepsydra_act1';
      const DONE_KEY = 'order_oasis_clepsydra_completed';
      const HOWTO_KEY = 'order_clepsydra_howto';
      const HEARTS = 3;
      const NOON = 12 * 60;

      // Vocabulary taken literally from the printed Oasis Registry / grid on sheet 12B.
      const SEEKERS = ['Cartographer', 'Alchemist', 'Nomad', 'Astronomer'];
      const RELICS = ['Astrolabe', 'Scarab', 'Sandglass', 'Dagger'];
      const HOURS = ['III', 'VI', 'IX', 'XII'];

      // Ring order. Each well’s `ok` is the Registry line the page allows for that beast.
      const WELLS = [
        { id: 'jackal', name: 'the Well of the Jackal',
          ok: { seeker: 'Alchemist', relic: 'Sandglass', hour: 'III' } },
        { id: 'scarab', name: 'the Well of the Scarab',
          ok: { seeker: 'Cartographer', relic: 'Astrolabe', hour: 'VI' } },
        { id: 'falcon', name: 'the Well of the Falcon',
          ok: { seeker: 'Nomad', relic: 'Dagger', hour: 'IX' } },
        { id: 'serpent', name: 'the Well of the Serpent',
          ok: { seeker: 'Astronomer', relic: 'Scarab', hour: 'XII' } }
      ];
      const STAND = [
        { x: -1.05, z: 0.55 }, { x: 1.05, z: 0.55 },
        { x: -1.05, z: 2.35 }, { x: 1.05, z: 2.35 }
      ];
      const BASIN_XZ = [[-2.15, -0.2], [2.15, -0.2], [-2.15, 1.7], [2.15, 1.7]];
      const CRACKS = [
        { id: 'left', mark: 'A', title: 'Crack to the left', short: 'Left of the stone',
          text: 'A crack to the left of the stone. Dry sand, and warm against the finger.',
          ask: { edges: 'Warm stone, sand piled in the lips.', breath: 'No air. Dead heat.', sand: 'Loose, dry, runs like flour.' } },
        { id: 'beak', mark: 'B', title: 'Cleft under the beak', short: 'Under the falcon’s beak',
          text: 'A narrow cleft right under the falcon’s beak. The air coming out of it is cold.',
          ask: { edges: 'The lips are dark and damp.', breath: 'Cold air on my knuckles.', sand: 'Damp grit, not dust.' } },
        { id: 'behind', mark: 'C', title: 'Split behind', short: 'Behind the stone',
          text: 'A split behind the stone. It smells of dust, and the sand in it is loose.',
          ask: { edges: 'Sharp, dry, dusty.', breath: 'Still air. Dust only.', sand: 'Loose and dry.' } }
      ];
      const CRACK_OK = 1;
      const DIAL_MARKS = ['III', 'VI', 'IX', 'XII', 'XV', 'XVIII', 'XXI', 'XXIV', 'XXVII', 'XXX'];
      const DIAL_REST = DIAL_MARKS.indexOf('XV');
      const ASK = {
        edges: { mark: 'I', label: 'Look at the edges' },
        breath: { mark: 'II', label: 'Feel for cold air' },
        sand: { mark: 'III', label: 'Touch the sand' }
      };

      const keyHints = window.EclipseHints.define({
        id: 's13-key', station: 'Station 13', title: 'the clepsydra key', group: 'desert',
        anchor: () => el.controls,
        active: () => !!(S && S.phase === 'key'),
        solved: () => get(DONE_KEY) === 'true' || !!(S && (S.phase === 'cleft' || S.phase === 'won')),
        texts: [
          'The plate wants one engraving: the four hours you are holding, added together, written the Roman way. The bottom line of the page “The Oasis Clepsydra” is that sum.',
          'You are holding the third, the sixth, the ninth and the twelfth. Add those four on the page, in the blank that asks for the sum.',
          'The page asks for Roman numerals, not the ordinary total. Add the four hours first, then write that total the way the Romans did, in the blank at the foot of the page.'
        ]
      });

      const hints = window.EclipseHints.define({
        id: 's13-visions', station: 'Station 13', title: 'the oasis registry', group: 'desert',
        anchor: () => el.controls,
        solved: () => get(DONE_KEY) === 'true',
        texts: [
          'Work the five testimonies on the page “The Oasis Clepsydra” first. Fill The Oasis Registry on that page. Then, at each well, transmit the seeker, relic and hour you wrote for that well — using the same words as the grid.',
          'Each seeker has one well, one relic and one hour, and no two share any of them. The relic column on the page says Astrolabe, Scarab, Sandglass, Dagger. Match the beast Hermes stands at to the well you marked for that seeker.',
          'Let us take the fourth testimony together. The Astronomer carried the Scarab and reached the Well of the Serpent, and not before the ninth hour. When Hermes stands at the serpent, transmit Astronomer, Scarab, XII.'
        ]
      });

      let S = null;
      let G = null;
      let raf = 0;
      let howtoPage = 0;
      let dialIdx = DIAL_REST;
      let askedCrack = {};
      let walk = null;
      let drinkPulse = 0;
      let heatWobble = 0;
      let pickSeeker = SEEKERS[0];
      let pickRelic = RELICS[0];
      let pickHour = HOURS[0];

      function fresh() {
        return { phase: 'wells', well: 0, hearts: HEARTS, min: NOON, wrong: 0, tries: 1, lost: false, weights: 0 };
      }
      function load() {
        try {
          const saved = JSON.parse(get(WALK_KEY) || 'null');
          if (saved && saved.phase && saved.phase !== 'won') {
            const s = Object.assign(fresh(), saved);
            if (s.phase !== 'wells' && s.phase !== 'key' && s.phase !== 'cleft' && s.phase !== 'won') s.phase = 'wells';
            s.well = Math.max(0, Math.min(WELLS.length, s.well | 0));
            if (s.phase === 'wells' && s.well >= WELLS.length) s.well = 0;
            if (typeof s.weights !== 'number' || s.weights < 0) s.weights = Math.min(WELLS.length, s.well | 0);
            s.hearts = Math.max(0, Math.min(HEARTS, s.hearts | 0));
            if (s.hearts <= 0 && s.phase !== 'cleft') { s.lost = true; s.hearts = 0; }
            return s;
          }
        } catch (e) {}
        if (get(DONE_KEY) === 'true') return Object.assign(fresh(), { phase: 'won', well: WELLS.length, weights: WELLS.length });
        if (get(ACT_KEY) === 'true') return Object.assign(fresh(), { phase: 'key', well: WELLS.length, weights: WELLS.length });
        return fresh();
      }
      function save() {
        if (!S || S.phase === 'won') { drop(WALK_KEY); return; }
        put(WALK_KEY, JSON.stringify(S));
      }
      function wireReply() {
        try { return JSON.parse(get('order_chasm_wire') || '{}').reply5 !== undefined; } catch (e) { return false; }
      }
      const isTester = () => (typeof window.isAdminTester === 'function' && window.isAdminTester())
        || (typeof window.isCarlesTester === 'function' && window.isCarlesTester());
      function canOpen() {
        // Carles plays any station, in any order: no march, no wire, no lexicon gate.
        if (isTester()) return true;
        if (get(DONE_KEY) === 'true' || get(ACT_KEY) === 'true') return true;
        if (window.isNextAdventureHeld && window.isNextAdventureHeld()) {
          toast('✦ CAMP VII ✦ Hermes is resting. The road to Camp VIII is not open yet.');
          return false;
        }
        if (get('order_desert_lexicon_completed') !== 'true') {
          toast('✦ TERRA INCOGNITA ✦ The steles of Camp VII come first.');
          return false;
        }
        if (typeof window.isClepsydraMarchOver === 'function' && !window.isClepsydraMarchOver()) {
          const eta = typeof window.getClepsydraMarchEta === 'function' ? window.getClepsydraMarchEta() : '';
          toast(eta ? '✦ ON THE ERG ✦ Hermes reaches Camp VIII in ' + eta + '.' : '✦ ON THE ERG ✦ Hermes is still walking to Camp VIII.');
          return false;
        }
        if (!wireReply()) {
          toast('✦ THE FIELD WIRE ✦ Hermes is calling from the shade. Answer him before you stand at the wells.');
          if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
          return false;
        }
        return true;
      }

      function sameLine(a, b) {
        return a && b
          && String(a.seeker).toLowerCase() === String(b.seeker).toLowerCase()
          && String(a.relic).toLowerCase() === String(b.relic).toLowerCase()
          && String(a.hour).toUpperCase().replace(/^HR\s*/, '') === String(b.hour).toUpperCase().replace(/^HR\s*/, '');
      }
      function normalizeTransmit(seeker, relic, hour) {
        return {
          seeker: String(seeker || '').trim(),
          relic: String(relic || '').trim(),
          hour: String(hour || '').trim().toUpperCase().replace(/^HR\s*/, '')
        };
      }

      function clockText() {
        const h = Math.floor(S.min / 60) % 24;
        const m = S.min % 60;
        return '☀ ' + h + ':' + String(m).padStart(2, '0');
      }
      function paintChrome() {
        const won = S.phase === 'won';
        if (el.clock) el.clock.textContent = clockText();
        if (el.hearts) {
          el.hearts.innerHTML = [0, 1, 2].map((i) => '<i class="chasm3d-heart' + (i < S.hearts ? '' : ' is-lost') + '">♥</i>').join('');
          el.hearts.setAttribute('aria-label', S.hearts + ' of 3 hearts left');
        }
        if (el.where) {
          el.where.textContent = won
            ? 'The spring under the falcon is real'
            : S.lost
              ? 'The fever wins · attempt ' + S.tries
              : S.phase === 'key'
                ? 'The cylinder · turn the dial to the Roman sum'
                : S.phase === 'cleft'
                  ? 'The falcon stone · find the cold breath'
                  : 'Well ' + (S.well + 1) + ' of 4 · ' + WELLS[S.well].name
                    + (S.weights ? ' · ' + S.weights + ' weight' + (S.weights === 1 ? '' : 's') + ' set' : '');
        }
        if (el.subtitle) {
          el.subtitle.textContent = won ? '' : S.lost ? 'Shade.' : S.phase === 'key' ? 'The cylinder' : S.phase === 'cleft' ? 'The falcon' : WELLS[S.well].name;
        }
        if (el.lost) el.lost.hidden = !S.lost;
        if (el.done) el.done.style.display = won ? 'block' : 'none';
        if (el.controls) el.controls.style.display = (S.lost || won) ? 'none' : '';
        const help = $('btn-visions-howto');
        if (help) help.style.display = (S.lost || won) ? 'none' : '';
      }
      function say(text) { if (el.voice) el.voice.textContent = text; }
      function clearControls() { if (el.controls) el.controls.innerHTML = ''; }
      function button(html, onClick, opts) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chasm3d-btn' + (opts && opts.cls ? ' ' + opts.cls : '');
        b.innerHTML = html;
        if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
        if (opts && opts.disabled) b.disabled = true;
        b.addEventListener('click', onClick);
        el.controls.appendChild(b);
        return b;
      }

      function chipRow(label, values, current, onPick, opts) {
        const wrap = document.createElement('div');
        wrap.className = 'visions-reg-row';
        const lab = document.createElement('div');
        lab.className = 'visions-reg-label';
        lab.textContent = label;
        wrap.appendChild(lab);
        const chips = document.createElement('div');
        chips.className = 'visions-reg-chips' + (opts && opts.hours ? ' is-hours' : '');
        chips.setAttribute('role', 'group');
        chips.setAttribute('aria-label', label);
        values.forEach((v) => {
          const c = document.createElement('button');
          c.type = 'button';
          c.className = 'visions-reg-chip' + (v === current ? ' is-on' : '');
          c.textContent = v;
          c.setAttribute('aria-pressed', v === current ? 'true' : 'false');
          c.addEventListener('click', () => onPick(v));
          chips.appendChild(c);
        });
        wrap.appendChild(chips);
        el.controls.appendChild(wrap);
      }

      // ---- Act I · transmit one Registry line ----
      function renderWells(note) {
        clearControls();
        const well = WELLS[S.well];
        // note === false: quiet chip refresh (keep current Hermes line)
        if (note !== false) {
          say(note || ('I am at ' + well.name + '. The bowl is lying to me, Silvia. Read your Oasis Registry and transmit who belonged here — seeker, relic, and hour, as the page wrote them. When the line is true, I walk on to the next well.'));
        }
        chipRow('Seeker', SEEKERS, pickSeeker, (v) => { pickSeeker = v; renderWells(false); });
        chipRow('Relic', RELICS, pickRelic, (v) => { pickRelic = v; renderWells(false); });
        chipRow('Hour', HOURS, pickHour, (v) => { pickHour = v; renderWells(false); }, { hours: true });
        const preview = document.createElement('div');
        preview.className = 'visions-reg-preview';
        preview.setAttribute('aria-live', 'polite');
        preview.textContent = pickSeeker + ' · ' + pickRelic + ' · ' + pickHour;
        el.controls.appendChild(preview);
        button('Transmit to Hermes ➔', () => transmit(pickSeeker, pickRelic, pickHour), {
          cls: 'visions-transmit',
          aria: 'Transmit ' + pickSeeker + ', ' + pickRelic + ', ' + pickHour + ' for ' + well.name
        });
      }

      // ---- Act II · cylinder dial ----
      function renderKey(note) {
        clearControls();
        say(note || 'Four weights are set. The stone shows one mark at a time. Add the four hours on your page, write that sum the Roman way, and turn the stone until it shows it. I will not read the hours back to you.');
        const wrap = document.createElement('div');
        wrap.className = 'visions-dial';
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Turn the clepsydra stone. One mark shows at a time.');
        const face = document.createElement('div');
        face.className = 'visions-dial-face';
        face.id = 'visions-dial-face';
        const row = document.createElement('div');
        row.className = 'visions-dial-row';
        const ticks = document.createElement('div');
        ticks.className = 'visions-dial-ticks';
        ticks.setAttribute('aria-hidden', 'true');
        const syncDial = () => {
          face.textContent = DIAL_MARKS[dialIdx];
          ticks.querySelectorAll('i').forEach((n, i) => n.classList.toggle('is-on', i === dialIdx));
          paintDialStone();
        };
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'chasm3d-btn visions-dial-turn';
        prev.setAttribute('aria-label', 'Turn the stone back one mark');
        prev.textContent = '↺ Turn back';
        prev.addEventListener('click', () => { dialIdx = (dialIdx + DIAL_MARKS.length - 1) % DIAL_MARKS.length; syncDial(); });
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'chasm3d-btn visions-dial-turn';
        next.setAttribute('aria-label', 'Turn the stone on one mark');
        next.textContent = 'Turn on ↻';
        next.addEventListener('click', () => { dialIdx = (dialIdx + 1) % DIAL_MARKS.length; syncDial(); });
        row.appendChild(prev);
        row.appendChild(face);
        row.appendChild(next);
        wrap.appendChild(row);
        DIAL_MARKS.forEach(() => {
          const tick = document.createElement('i');
          ticks.appendChild(tick);
        });
        wrap.appendChild(ticks);
        el.controls.appendChild(wrap);
        syncDial();
        button('Engrave this mark', () => engrave(DIAL_MARKS[dialIdx]), { cls: 'visions-engrave' });
      }

      // ---- Act III · falcon cleft ----
      function cleftGroup(label) {
        const g = document.createElement('div');
        g.className = 'visions-cleft-group';
        const lab = document.createElement('div');
        lab.className = 'visions-reg-label';
        lab.textContent = label;
        g.appendChild(lab);
        el.controls.appendChild(g);
        return g;
      }
      function cleftBtn(mark, title, note, onClick, opts) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'visions-cleft-btn' + (opts && opts.cls ? ' ' + opts.cls : '');
        if (opts && opts.disabled) b.disabled = true;
        if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
        b.innerHTML = '<span class="visions-cleft-mark" aria-hidden="true">' + mark + '</span>'
          + '<span class="visions-cleft-copy"><strong>' + title + '</strong><small>' + note + '</small></span>';
        b.addEventListener('click', onClick);
        return b;
      }
      function renderCleft(note) {
        clearControls();
        say(note || 'The wells went out like a lamp. There is only the falcon, cut in the real stone, and three cracks around it. Ask me what I feel, or tell me which crack to trust.');
        const askBox = cleftGroup('Ask Hermes');
        Object.keys(ASK).forEach((kind) => {
          const q = ASK[kind];
          const done = !!askedCrack[kind];
          askBox.appendChild(cleftBtn(q.mark, q.label, done ? 'Asked' : 'Not yet', () => askCrack(kind), {
            cls: 'is-ask' + (done ? ' is-done' : ''),
            disabled: done,
            aria: done ? q.label + ': already asked' : 'Ask Hermes: ' + q.label
          }));
        });
        const crackBox = cleftGroup('Choose a crack');
        CRACKS.forEach((c, i) => {
          const known = Object.keys(askedCrack).map((k) => askedCrack[k][i]).filter(Boolean);
          const tag = known.length ? known.join(' · ') : 'Not yet read';
          crackBox.appendChild(cleftBtn(c.mark, c.title, tag, () => pickCrack(i), {
            cls: 'is-crack' + (known.length ? ' is-read' : ''),
            aria: c.short + '. ' + c.text + (known.length ? '. ' + tag : '')
          }));
        });
      }

      function render(note) {
        paintChrome();
        if (S.phase === 'won') {
          say(note || 'The cleft under the beak is running. The four skins are full, and both lines are on the card.');
        } else if (S.lost) {
          say(note || 'The heat has me, Silvia. The wells are running into each other. Let me sit until my head is my own, and we will begin this hour again.');
        } else if (S.phase === 'key') {
          renderKey(note);
        } else if (S.phase === 'cleft') {
          renderCleft(note);
        } else {
          renderWells(note);
        }
        hints.refresh();
        keyHints.refresh();
        syncWorld();
        if (S.phase === 'won') showReward();
      }

      // ---- The reward: a central card, as on the Salt and the Lexicon ----
      const reward = { box: null, back: null };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      function showReward() {
        const body = modal.querySelector('.chasm3d-body');
        if (!body || !S || S.phase !== 'won') return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward clep-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', 'Your reward for the Oasis Clepsydra');
          reward.box.hidden = true;
          body.appendChild(reward.box);
          reward.box.addEventListener('pointerdown', (e) => {
            if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast');
          });
        }
        const quiet = reduced();
        const mins = Math.max(0, (S.min | 0) - NOON);
        const time = Math.floor(mins / 60) + ' h ' + String(mins % 60).padStart(2, '0') + ' min';
        const rows = WELLS.map((w, i) => {
          const t = (0.55 + i * 0.28).toFixed(2);
          return '<li class="clep-line" style="--t:' + t + 's"><b>' + w.name.replace('the ', '') + '</b><span>' + w.ok.seeker + '</span><span>' + w.ok.relic + '</span><em>' + w.ok.hour + '</em></li>';
        }).join('');
        const flawless = (S.wrong | 0) === 0 && mins >= 0;
        reward.box.onclick = (e) => {
          const m = e.target.closest && e.target.closest('.clep-medal[data-relic]');
          if (m && typeof window.openItemAcquiredModal === 'function') window.openItemAcquiredModal({ id: m.getAttribute('data-relic') });
        };
        reward.box.innerHTML = '<div class="rw-rays" aria-hidden="true"></div>'
          + '<div class="rw-sparks" aria-hidden="true">' + Array.from({ length: 18 }, (_, i) => '<i style="--a:' + ((i * 360 / 18) | 0) + 'deg;--d:' + (120 + (i % 5) * 36) + 'px;--t:' + (0.9 + (i % 4) * 0.18).toFixed(1) + 's"></i>').join('') + '</div>'
          + '<div class="chasm3d-reward-card">'
          + '<div class="chasm3d-reward-kicker">Station 13 · The Oasis Clepsydra</div>'
          + '<h3 class="chasm3d-reward-title">The Spring Is Real</h3>'
          + '<p class="rw-sub">Four lines of the Oasis Registry held the heat still. The wells went out. Under the falcon, the cleft was cold.</p>'
          + '<div class="rw-grid">'
          + '<section class="rw-map clep-rw-page" aria-label="The Oasis Registry as you transmitted it">'
          + '<div class="rw-label">The Oasis Registry</div>'
          + '<ol class="clep-registry">' + rows + '</ol>'
          + '<div class="clep-key" aria-label="The Clepsydra Key, XXX">XXX</div>'
          + '<div class="clep-key-note">III + VI + IX + XII · thirty hours</div>'
          + (mins > 0 ? '<div class="chasm3d-reward-stats"><div><b data-count="' + mins + '" data-time="1">' + time + '</b><span>past noon</span></div><div><b data-count="' + (S.wrong | 0) + '">' + (S.wrong | 0) + '</b><span>false lines</span></div><div><b data-count="' + (S.tries | 1) + '">' + (S.tries | 1) + '</b><span>' + ((S.tries | 1) === 1 ? 'attempt' : 'attempts') + '</span></div></div>' : '')
          + (flawless && (S.tries | 1) === 1 ? '<div class="rw-flawless">✦ A lucid noon ✦</div>' : '')
          + '</section>'
          + '<section class="rw-loot">'
          + '<div class="clep-relics" aria-label="What Hermes carries now">'
          + '<button type="button" class="clep-medal" data-relic="water_skins" aria-label="The Four Water Skins: open the card"><img src="./assets/items/item_water_skins.png" alt="" loading="lazy"><span class="clep-medal-copy"><b>The Four Water Skins</b><small>full, in the satchel · tap for the card</small></span></button>'
          + '<button type="button" class="clep-medal is-brass" data-relic="falcon_weight" aria-label="The Falcon Weight: open the card"><img src="./assets/items/item_falcon_weight.png" alt="" loading="lazy"><span class="clep-medal-copy"><b>The Falcon Weight</b><small>brass, from the cache · tap for the card</small></span></button>'
          + '</div>'
          + '<div class="rw-ledger clep-rw-a">'
          + '<figure class="clep-seal" aria-hidden="true"><svg viewBox="0 0 48 56"><path d="M24 4l8 10H16z"/><path d="M8 22c8-5 24-5 32 0-3 10-8 18-16 26C16 40 11 32 8 22z"/></svg></figure>'
          + '<div class="rw-ledger-text">'
          + '<div class="rw-ledger-kicker">Scratched beside the falcon</div>'
          + '<div class="rw-ledger-title">Falcon Inscription</div>'
          + '<div class="rw-eq" aria-label="P minus A equals 14"><i>P</i><u>−</u><i>A</i><u>=</u><b>14</b></div>'
          + '<p>A check for your Cipher Ledger. No new letter: two you already hold, proved against each other.</p>'
          + '</div></div>'
          + '<div class="rw-ledger clep-rw-b">'
          + '<figure class="clep-seal is-water" aria-hidden="true"><svg viewBox="0 0 48 56"><path d="M24 6c8 10 14 16 14 26a14 14 0 0 1-28 0C10 22 16 16 24 6z"/></svg></figure>'
          + '<div class="rw-ledger-text">'
          + '<div class="rw-ledger-kicker">Cut under the cleft</div>'
          + '<div class="rw-ledger-title">The Line of the Cleft</div>'
          + '<div class="rw-eq" aria-label="Q plus Z equals 19"><i>Q</i><u>+</u><i>Z</i><u>=</u><b>19</b></div>'
          + '<p>A second check, smaller, under the first. Again no new letter. Both lines are in the Ledger now.</p>'
          + '</div></div>'
          + '<div class="rw-next">Next · the gates of Tower II</div>'
          + '</section></div>'
          + '<div class="chasm3d-reward-actions">'
          + '<button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>'
          + '<button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay in the shade</button>'
          + '</div></div>';
        if (!rewardOpen()) reward.back = document.activeElement;
        reward.box.hidden = false;
        reward.box.classList.remove('is-fast');
        reward.box.classList.remove('is-on');
        void reward.box.offsetWidth;
        reward.box.classList.add('is-on');
        const counters = [...reward.box.querySelectorAll('[data-count]')];
        const fmt = (b, v) => (b.dataset.time ? (Math.floor(v / 60) + ' h ' + String(v % 60).padStart(2, '0') + ' min') : String(v));
        if (!quiet) counters.forEach((b) => {
          const end = +b.dataset.count;
          const t0 = performance.now() + 2400;
          b.textContent = fmt(b, 0);
          const step = (now) => {
            const k = reward.box.classList.contains('is-fast') ? 1 : Math.max(0, Math.min(1, (now - t0) / 800));
            b.textContent = fmt(b, Math.round(end * (1 - Math.pow(1 - k, 3))));
            if (k < 1 && rewardOpen()) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        const wireBtn = reward.box.querySelector('.chasm3d-reward-wire');
        const stayBtn = reward.box.querySelector('.chasm3d-reward-stay');
        if (wireBtn) wireBtn.addEventListener('click', () => {
          hideReward(true);
          closeVisions();
          if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
        });
        if (stayBtn) stayBtn.addEventListener('click', () => hideReward());
        if (wireBtn) wireBtn.focus({ preventScroll: true });
      }
      function hideReward(quietly) {
        if (!rewardOpen()) return;
        reward.box.hidden = true;
        const back = reward.back;
        reward.back = null;
        if (quietly) return;
        if (back && document.contains(back) && back.focus) back.focus({ preventScroll: true });
      }

      function miss(base, who) {
        S.hearts -= 1;
        S.wrong += 1;
        S.min += who === 'key' ? 15 : who === 'cleft' ? 12 : 20;
        heatWobble = 1;
        if (who === 'key') keyHints.fail();
        else if (who === 'well') hints.fail();
        let note = '';
        if (S.hearts <= 0) {
          if (who === 'cleft') {
            S.hearts = HEARTS;
            note = 'Dry. The stone is real, and the fever does not come back. Look again for the cold breath.';
          } else {
            S.lost = true;
            S.hearts = 0;
          }
        } else {
          note = base;
          if (who !== 'cleft' && S.hearts === 1) note += ' One heart left, Silvia. One more and the fever wins.';
        }
        save();
        render(note);
      }

      function transmit(seeker, relic, hour) {
        if (!S || S.lost || S.phase !== 'wells') return;
        const line = normalizeTransmit(seeker, relic, hour);
        const well = WELLS[S.well];
        if (!sameLine(line, well.ok)) {
          miss('That line is not what your Registry holds for ' + well.name + '. Look at the page again.', 'well');
          return;
        }
        S.well += 1;
        S.weights = S.well;
        S.min += 4;
        drinkPulse = 1;
        let note = 'Yes. That matches the page. I drink, and I set a counterweight.';
        if (S.well >= WELLS.length) {
          S.phase = 'key';
          put(ACT_KEY, 'true');
          dialIdx = DIAL_REST;
          note = 'Four weights are set. The stone waits on a mark that is not the sum. Add the four hours on the page, and turn it until that total shows, the Roman way.';
          walk = null;
          save();
          snapHermes(2);
          render(note);
          return;
        }
        save();
        const nextLine = note + ' Next: ' + WELLS[S.well].name + '.';
        if (!G || reduced()) {
          snapHermes(S.well);
          render(nextLine);
        } else {
          clearControls();
          say(note + ' Walking on…');
          paintChrome();
          startWalk(S.well, () => {
            if (!S || S.phase !== 'wells') return;
            render(note + ' Walking on to ' + WELLS[S.well].name + '.');
          });
        }
      }

      function engrave(raw) {
        if (!S || S.lost || S.phase !== 'key') return;
        const clean = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean === 'XXX' || clean === '30') {
          S.phase = 'cleft';
          S.hearts = HEARTS;
          S.min += 6;
          askedCrack = {};
          walk = null;
          if (el.fade) {
            el.fade.classList.add('is-on');
            setTimeout(() => { if (el.fade) el.fade.classList.remove('is-on'); }, reduced() ? 120 : 700);
          }
          save();
          snapHermes(2);
          render('The four wells went out like a lamp. Only the falcon stone is left. Three cracks. One of them breathes cold.');
          return;
        }
        miss('The cylinder will not turn. Add the four hours, and set the dial to that total the Roman way.', 'key');
      }
      function askCrack(kind) {
        if (!S || S.lost || S.phase !== 'cleft' || askedCrack[kind]) return;
        askedCrack[kind] = CRACKS.map((c) => c.ask[kind]);
        S.min += 3;
        const lead = {
          edges: 'I crouch and sight along each crack.',
          breath: 'I hold my hand over each opening.',
          sand: 'I pinch a little sand from each lip.'
        }[kind];
        const told = CRACKS.map((c, i) => {
          const side = i === 0 ? 'Left' : i === 1 ? 'Under the beak' : 'Behind';
          return side + ': ' + c.ask[kind];
        }).join(' ');
        save();
        render(lead + ' ' + told);
      }
      function pickCrack(i) {
        if (!S || S.lost || S.phase !== 'cleft') return;
        if (i !== CRACK_OK) {
          miss('Dry. The cold breath is somewhere else on this stone.', 'cleft');
          return;
        }
        if (typeof window.addRelicToInventory === 'function') {
          window.addRelicToInventory('water_skins');
          window.addRelicToInventory('falcon_weight');
        }
        S.phase = 'won';
        put(DONE_KEY, 'true');
        if (typeof window.renderSatchel === 'function') window.renderSatchel(0);
        document.dispatchEvent(new CustomEvent('visions:cleared'));
        save();
        render('Cold water. The four skins fill. Beside the carving: [P] − [A] = 14, and under it [Q] + [Z] = 19. A brass falcon-weight was in the cache.');
      }

      function beginAgain() {
        const tries = (S && S.tries ? S.tries : 1) + 1;
        const wrong = S ? S.wrong : 0;
        S = fresh();
        S.tries = tries;
        S.wrong = wrong;
        askedCrack = {};
        dialIdx = DIAL_REST;
        pickSeeker = SEEKERS[0];
        pickRelic = RELICS[0];
        pickHour = HOURS[0];
        walk = null;
        hideReward(true);
        save();
        snapHermes(0);
        render();
      }
      function hearAgain() {
        const tries = (S && S.tries ? S.tries : 1) + 1;
        S = fresh();
        S.tries = tries;
        askedCrack = {};
        dialIdx = DIAL_REST;
        pickSeeker = SEEKERS[0];
        pickRelic = RELICS[0];
        pickHour = HOURS[0];
        walk = null;
        hideReward(true);
        save();
        snapHermes(0);
        render();
      }

      function standOf(n) {
        const i = Math.max(0, Math.min(STAND.length - 1, n));
        return STAND[i];
      }
      function snapHermes(n) {
        if (!G || !G.hermes) return;
        const p = standOf(n);
        G.hermes.position.set(p.x, 0, p.z);
        const b = BASIN_XZ[Math.min(n, 3)];
        G.hermes.rotation.y = Math.atan2(b[0] - p.x, b[1] - p.z);
        walk = null;
      }
      function startWalk(toWell, then) {
        if (!G || !G.hermes || reduced()) {
          snapHermes(toWell);
          if (then) then();
          return;
        }
        const to = standOf(toWell);
        const b = BASIN_XZ[toWell];
        const ry1 = Math.atan2(b[0] - to.x, b[1] - to.z);
        walk = {
          t: 0, dur: 0.95,
          fx: G.hermes.position.x, fz: G.hermes.position.z,
          tx: to.x, tz: to.z,
          ry0: G.hermes.rotation.y, ry1,
          then: then || null
        };
      }

      function buildWorld() {
        const T = window.THREE;
        const P = window.EclipsePaint;
        if (!T || !P || !el.canvas) return null;
        let renderer;
        try { renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' }); }
        catch (e) { return null; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputEncoding = T.sRGBEncoding;
        if (T.ReinhardToneMapping) {
          renderer.toneMapping = T.ReinhardToneMapping;
          renderer.toneMappingExposure = 1.08;
        }
        const scene = new T.Scene();
        scene.fog = new T.Fog(0xe8cfa8, 22, 72);
        const camera = new T.PerspectiveCamera(42, 16 / 10, 0.1, 260);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;

        const paint = (opts) => (P.toonSoft ? P.toonSoft(opts) : new T.MeshToonMaterial(opts));
        const SC = window.EclipseScenery;
        let camp = null;
        try { if (SC) camp = SC.desertCamp(scene, { paint: SC.paint(), cx: 0, cz: 0.75 }); } catch (e) { camp = null; }
        if (!camp) {
          scene.background = new T.Color(0xe8cfa8);
          const flat = new T.Mesh(new T.CircleGeometry(46, 48), paint({ color: 0xd9a56c }));
          flat.rotation.x = -Math.PI / 2;
          scene.add(flat);
        }

        const stoneTex = P.canvasTex(256, 256, (g, w, h) => {
          const base = g.createLinearGradient(0, 0, 0, h);
          base.addColorStop(0, '#e6c898');
          base.addColorStop(0.5, '#c4a574');
          base.addColorStop(1, '#a88458');
          g.fillStyle = base; g.fillRect(0, 0, w, h);
          const r = P.rng(21);
          for (let i = 0; i < 40; i++) {
            const x = r() * w, y = r() * h, rad = 10 + r() * 28;
            const gr = g.createRadialGradient(x, y, 0, x, y, rad);
            gr.addColorStop(0, 'rgba(90,52,24,0.22)');
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = gr;
            g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
          }
        });
        let stone = P.rim ? P.rim(paint({ map: stoneTex }), 0xffe6c0, 0.28) : paint({ map: stoneTex });
        if (SC) {
          const ms = SC.tex.masonry(14, 5, 6);
          ms.map.repeat.set(2, 1); ms.bump.repeat.set(2, 1);
          stone = SC.paint()({ map: ms.map, bumpMap: ms.bump, bumpScale: 1.8 }, 0xffe6c0, 0.28);
        }
        const basins = WELLS.map((well, i) => {
          const group = new T.Group();
          const plinth = new T.Mesh(new T.CylinderGeometry(1.18, 1.28, 0.16, 28), stone);
          plinth.position.y = 0.08;
          group.add(plinth);
          const drum = new T.Mesh(new T.CylinderGeometry(0.82, 1.02, 0.92, 28, 1), stone);
          drum.position.y = 0.54;
          group.add(drum);
          const bowl = new T.Mesh(new T.CylinderGeometry(0.62, 0.5, 0.16, 24), paint({ color: 0x6a4324 }));
          bowl.position.y = 0.94;
          group.add(bowl);
          const plaqueTex = P.canvasTex(256, 256, (g, w, h) => {
            const bg = g.createLinearGradient(0, 0, 0, h);
            bg.addColorStop(0, '#f0d7ae'); bg.addColorStop(1, '#c49a68');
            g.fillStyle = bg; g.fillRect(0, 0, w, h);
            g.strokeStyle = '#6b4322'; g.lineWidth = 10; g.strokeRect(18, 18, w - 36, h - 36);
            g.strokeStyle = 'rgba(253,230,138,0.55)'; g.lineWidth = 3; g.strokeRect(28, 28, w - 56, h - 56);
            g.fillStyle = '#3a2412';
            g.font = '700 40px Cinzel, Georgia, serif';
            g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(well.id.toUpperCase(), w / 2, h / 2 + 4);
          });
          // The name rests on a brass post above the well, its face turned up toward the sky and the walker
          const post = new T.Mesh(new T.CylinderGeometry(0.03, 0.04, 0.62, 8), paint({ color: 0xc9a15a }));
          post.position.set(0, 1.3, 0);
          group.add(post);
          const plaque = new T.Mesh(new T.PlaneGeometry(0.92, 0.92), paint({ map: plaqueTex, side: T.DoubleSide }));
          plaque.position.set(0, 1.66, 0);
          plaque.rotation.x = -(Math.PI / 2 - 0.62);
          group.add(plaque);
          const back = new T.Mesh(new T.PlaneGeometry(0.98, 0.98), paint({ color: 0x6b4322, side: T.DoubleSide }));
          back.position.copy(plaque.position);
          back.position.y -= 0.012;
          back.rotation.copy(plaque.rotation);
          group.add(back);
          const rimMat = paint({ color: 0xf2d48a, emissive: 0xffc46b, emissiveIntensity: 0.08 });
          const rim = new T.Mesh(new T.TorusGeometry(0.7, 0.07, 12, 32), rimMat);
          rim.rotation.x = Math.PI / 2;
          rim.position.y = 1.02;
          group.add(rim);
          const weight = new T.Mesh(
            new T.BoxGeometry(0.26, 0.16, 0.2),
            paint({ color: 0x8a6a3a, emissive: 0xc48a3a, emissiveIntensity: 0 })
          );
          weight.position.set(0.95, 0.12, 0.15);
          weight.visible = false;
          group.add(weight);
          const water = new T.Mesh(
            new T.CircleGeometry(0.55, 16),
            new T.MeshBasicMaterial({ color: 0x6ec8e8, transparent: true, opacity: 0 })
          );
          water.rotation.x = -Math.PI / 2;
          water.position.y = 1.0;
          group.add(water);
          group.position.set(BASIN_XZ[i][0], 0, BASIN_XZ[i][1]);
          group.userData = { rim, weight, water, rimMat };
          scene.add(group);
          return group;
        });

        const cylinder = new T.Group();
        const cylBody = new T.Mesh(new T.CylinderGeometry(0.5, 0.62, 0.78, 28), stone);
        cylBody.position.y = 0.39;
        cylinder.add(cylBody);
        const band = new T.Mesh(new T.TorusGeometry(0.56, 0.045, 10, 28), paint({ color: 0xc9a15a }));
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.72;
        cylinder.add(band);
        const dialCanvas = document.createElement('canvas');
        dialCanvas.width = 256; dialCanvas.height = 128;
        const dialTex = new T.CanvasTexture(dialCanvas);
        dialTex.encoding = T.sRGBEncoding;
        const dialFace = new T.Mesh(new T.PlaneGeometry(0.78, 0.4), paint({ map: dialTex }));
        dialFace.position.set(0, 0.55, 0.58);
        cylinder.add(dialFace);
        cylinder.position.set(0, 0, 0.7);
        cylinder.visible = false;
        scene.add(cylinder);

        let hermes = null;
        try {
          const glow = P.canvasTex(64, 64, (g, w) => {
            const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
            gr.addColorStop(0, 'rgba(255,244,214,1)');
            gr.addColorStop(1, 'rgba(255,244,214,0)');
            g.fillStyle = gr;
            g.fillRect(0, 0, w, w);
          });
          const H = P.buildHermes(T, glow);
          hermes = H && H.hermes;
          if (hermes) {
            hermes.scale.setScalar(1.18);
            hermes.position.set(STAND[0].x, 0, STAND[0].z);
            hermes.rotation.y = Math.PI;
            scene.add(hermes);
          }
        } catch (e) {}

        if (SC) SC.lights(scene, { keyI: 1.15, hemi: 0.52, amb: 0.16, backI: 0.5 });
        else if (P.championLight) P.championLight(T, scene, { keyI: 1.15, hemi: 0.52, amb: 0.16, backI: 0.5 });
        else {
          scene.add(new T.DirectionalLight(0xfff1d0, 1.05));
          scene.add(new T.AmbientLight(0xffe0b8, 0.38));
          scene.add(new T.HemisphereLight(0xfff6df, 0xc48a4a, 0.4));
        }

        [basins, [cylinder], hermes ? [hermes] : []].forEach((list) => list.forEach((o) => {
          o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
        }));
        return { renderer, scene, camera, basins, hermes, cylinder, dialCanvas, dialTex, camp, T };
      }

      function paintDialStone() {
        if (!G || !G.dialCanvas || !G.dialTex) return;
        const g = G.dialCanvas.getContext('2d');
        const w = G.dialCanvas.width, h = G.dialCanvas.height;
        g.clearRect(0, 0, w, h);
        const bg = g.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#3a2412');
        bg.addColorStop(1, '#1a0e06');
        g.fillStyle = bg;
        g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(232, 196, 120, 0.7)';
        g.lineWidth = 6;
        g.strokeRect(8, 8, w - 16, h - 16);
        g.fillStyle = '#f3d48a';
        g.font = '700 54px Cinzel, Georgia, serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(S && S.phase === 'key' ? DIAL_MARKS[dialIdx] : '', w / 2, h / 2);
        G.dialTex.needsUpdate = true;
      }
      function syncWorld() {
        if (!G || !S) return;
        const cleft = S.phase === 'cleft' || S.phase === 'won';
        const key = S.phase === 'key';
        G.basins.forEach((b, n) => {
          b.visible = !cleft || n === 2;
          const held = n < (S.weights | 0);
          b.userData.weight.visible = held && !cleft;
          b.userData.weight.material.emissiveIntensity = held ? 0.35 : 0;
          const hot = (!S.lost && S.phase === 'wells' && n === S.well) || (cleft && n === 2);
          b.userData.rim.material.emissiveIntensity = hot ? 0.75 : held ? 0.25 : 0.08;
        });
        if (G.cylinder) G.cylinder.visible = key;
        if (key) paintDialStone();
      }

      function fit() {
        if (!G || !el.stage) return;
        const w = el.stage.clientWidth || 800;
        const h = el.stage.clientHeight || 450;
        G.renderer.setSize(w, h, false);
        G.camera.aspect = w / Math.max(1, h);
        G.camera.updateProjectionMatrix();
      }

      // Hold and drag on the scene to look around (left/right turns, up/down tilts); a double tap brings the view back
      const orbit = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, down: false, x: 0, y: 0 };
      function bindOrbit() {
        const c = el.canvas;
        if (!c || c.__visionsOrbit) return;
        c.__visionsOrbit = true;
        c.style.touchAction = 'none';
        c.addEventListener('pointerdown', (e) => {
          orbit.down = true; orbit.x = e.clientX; orbit.y = e.clientY;
          try { c.setPointerCapture(e.pointerId); } catch (err) {}
        });
        c.addEventListener('pointermove', (e) => {
          if (!orbit.down) return;
          orbit.tYaw -= (e.clientX - orbit.x) * 0.006;
          orbit.tPitch += (e.clientY - orbit.y) * 0.004;
          orbit.tPitch = Math.max(-0.9, Math.min(1.0, orbit.tPitch));
          orbit.x = e.clientX; orbit.y = e.clientY;
        });
        const up = () => { orbit.down = false; };
        c.addEventListener('pointerup', up);
        c.addEventListener('pointercancel', up);
        c.addEventListener('dblclick', () => { orbit.tYaw = 0; orbit.tPitch = 0; });
      }

      let lastT = 0;
      function frame(t) {
        if (!G || modal.style.display === 'none') return;
        const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
        lastT = t;

        if (walk && G.hermes) {
          walk.t += dt;
          const u = Math.min(1, walk.t / walk.dur);
          const e = u * u * (3 - 2 * u);
          G.hermes.position.x = walk.fx + (walk.tx - walk.fx) * e;
          G.hermes.position.z = walk.fz + (walk.tz - walk.fz) * e;
          G.hermes.position.y = Math.sin(u * Math.PI) * 0.08;
          let dy = walk.ry1 - walk.ry0;
          while (dy > Math.PI) dy -= Math.PI * 2;
          while (dy < -Math.PI) dy += Math.PI * 2;
          G.hermes.rotation.y = walk.ry0 + dy * e;
          if (u >= 1) {
            const then = walk.then;
            walk = null;
            G.hermes.position.y = 0;
            if (then) then();
          }
        }

        if (drinkPulse > 0 && S && S.well > 0) {
          drinkPulse = Math.max(0, drinkPulse - dt * 1.2);
          const b = G.basins[Math.min(S.weights - 1, G.basins.length - 1)];
          if (b) b.userData.water.material.opacity = drinkPulse * 0.55;
        }
        if (heatWobble > 0) heatWobble = Math.max(0, heatWobble - dt * 0.8);
        if (G.camp) G.camp.update((t || 0) / 1000, dt, reduced());

        const cleft = S && (S.phase === 'cleft' || S.phase === 'won');
        const key = S && S.phase === 'key';
        const follow = walk && G.hermes
          ? { x: G.hermes.position.x, z: G.hermes.position.z }
          : (cleft
            ? { x: BASIN_XZ[2][0], z: BASIN_XZ[2][1] }
            : key
              ? { x: 0, z: 0.7 }
              : standOf(S ? S.well : 0));
        const wobble = reduced() ? 0 : Math.sin((t || 0) / 800) * 0.05 + heatWobble * Math.sin((t || 0) / 90) * 0.12;
        const camY = cleft ? 2.6 : key ? 3.0 : walk ? 3.1 : 3.2;
        const camZ = cleft ? 6.4 : key ? 7.6 : walk ? 8.2 : 8.4;
        const lookY = cleft ? 1.3 : 1.45;
        const ox = follow.x * 0.42 + wobble - follow.x, oz = camZ - (cleft ? 0 : 0.8), oy = camY - lookY;
        const rad = Math.hypot(ox, oz, oy);
        const horiz0 = Math.hypot(ox, oz);
        orbit.yaw += (orbit.tYaw - orbit.yaw) * Math.min(1, dt * 12);
        orbit.pitch += (orbit.tPitch - orbit.pitch) * Math.min(1, dt * 12);
        const elMin = Math.asin(Math.max(-1, Math.min(1, (0.55 - lookY) / rad)));
        const el0 = Math.atan2(oy, horiz0);
        const elev = Math.max(elMin, Math.min(1.35, el0 + orbit.pitch));
        const ang = Math.atan2(ox, oz) + orbit.yaw;
        G.camera.position.set(follow.x + Math.sin(ang) * rad * Math.cos(elev), lookY + rad * Math.sin(elev), follow.z + Math.cos(ang) * rad * Math.cos(elev));
        G.camera.lookAt(follow.x, lookY, follow.z);
        if (G.cylinder && key) G.cylinder.rotation.y = (t || 0) / 1800;

        syncWorld();
        G.renderer.render(G.scene, G.camera);
        raf = requestAnimationFrame(frame);
      }

      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('visions-howto-count');
        if (count) count.textContent = (howtoPage + 1) + ' of 3';
        const dots = $('visions-howto-dots');
        if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-visions-howto-next');
        if (next) next.textContent = howtoPage === 2 ? 'Begin' : 'Next →';
      }
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        put(HOWTO_KEY, 'seen');
      }

      let returnFocus = null;
      let scrollLockY = 0;
      function lockHubScroll(on) {
        const root = document.documentElement;
        const body = document.body;
        if (!root || !body) return;
        if (on) {
          scrollLockY = window.scrollY || window.pageYOffset || 0;
          root.classList.add('game-open');
          body.style.overflow = 'hidden';
          body.style.position = 'fixed';
          body.style.top = '-' + scrollLockY + 'px';
          body.style.left = '0';
          body.style.right = '0';
          body.style.width = '100%';
        } else {
          body.style.overflow = '';
          body.style.position = '';
          body.style.top = '';
          body.style.left = '';
          body.style.right = '';
          body.style.width = '';
          window.scrollTo(0, scrollLockY || 0);
        }
      }
      function stopHubScroll(e) {
        // The reward card and the side panel may scroll. The stage and the map behind must not.
        if (reward.box && !reward.box.hidden && reward.box.contains(e.target)) return;
        const panel = el.controls && el.controls.closest('.chasm3d-panel');
        if (panel && panel.contains(e.target) && panel.scrollHeight > panel.clientHeight + 1) return;
        e.preventDefault();
      }
      function openVisions() {
        if (!canOpen()) return;
        if (window.sfx && window.sfx.playMechanicalClick) window.sfx.playMechanicalClick();
        modal.style.display = 'flex';
        lockHubScroll(true);
        modal.addEventListener('wheel', stopHubScroll, { passive: false });
        modal.addEventListener('touchmove', stopHubScroll, { passive: false });
        returnFocus = document.activeElement;
        if (!G && el.canvas) G = buildWorld();
        orbit.yaw = orbit.tYaw = orbit.pitch = orbit.tPitch = 0;
        bindOrbit();
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        if (G && 'ResizeObserver' in window && !el.stage.__visionsFit) {
          el.stage.__visionsFit = true;
          new ResizeObserver(fit).observe(el.stage);
        }
        fit();
        S = load();
        askedCrack = {};
        if (S.phase !== 'key') dialIdx = DIAL_REST;
        pickSeeker = SEEKERS[0];
        pickRelic = RELICS[0];
        pickHour = HOURS[0];
        walk = null;
        const stand = S.phase === 'cleft' || S.phase === 'won' || S.phase === 'key' ? 2 : Math.min(S.well, 3);
        snapHermes(stand);
        render();
        if (get(HOWTO_KEY) !== 'seen' && S.phase === 'wells') showHowto(0);
        lastT = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
        if (el.close) el.close.focus();
      }
      function closeVisions() {
        modal.style.display = 'none';
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        hideReward(true);
        lockHubScroll(false);
        cancelAnimationFrame(raf);
        document.dispatchEvent(new CustomEvent('visions:closed'));
        if (returnFocus && returnFocus.focus) returnFocus.focus();
      }

      if (el.close) el.close.addEventListener('click', closeVisions);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeVisions(); });
      const again = $('btn-visions-again');
      if (again) again.addEventListener('click', beginAgain);
      const replay = $('btn-visions-replay');
      if (replay) replay.addEventListener('click', hearAgain);
      const finish = $('btn-visions-finish');
      if (finish) finish.addEventListener('click', () => {
        closeVisions();
        if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
      });
      const help = $('btn-visions-howto');
      if (help) help.addEventListener('click', () => showHowto(0));
      const back = $('btn-visions-howto-back');
      if (back) back.addEventListener('click', () => { if (howtoPage === 0) hideHowto(); else showHowto(howtoPage - 1); });
      const next = $('btn-visions-howto-next');
      if (next) next.addEventListener('click', () => { if (howtoPage >= 2) hideHowto(); else showHowto(howtoPage + 1); });
      const skip = $('btn-visions-howto-skip');
      if (skip) skip.addEventListener('click', hideHowto);

      window.openOasisVisions = openVisions;
      window.closeOasisVisions = closeVisions;
      window.__visions = {
        state: () => S ? {
          phase: S.lost ? 'lost' : S.phase,
          well: S.well, hearts: S.hearts, done: S.phase === 'won', lost: S.lost,
          tries: S.tries, wrong: S.wrong, gl: !!G, weights: S.weights | 0,
          ok: S.phase === 'cleft'
            ? CRACK_OK
            : (S.phase === 'wells' && S.well < WELLS.length ? Object.assign({}, WELLS[S.well].ok) : -1)
        } : null,
        transmit: (seeker, relic, hour) => {
          if (seeker && typeof seeker === 'object' && relic === undefined) {
            transmit(seeker.seeker, seeker.relic, seeker.hour);
          } else {
            transmit(seeker, relic, hour);
          }
          return window.__visions.state();
        },
        // Wrong attempts for smoke: pass a deliberately bad line without knowing ok.
        failOnce: () => {
          if (!S || S.phase !== 'wells') return window.__visions.state();
          const ok = WELLS[S.well].ok;
          const badSeeker = SEEKERS.find((s) => s !== ok.seeker) || SEEKERS[0];
          transmit(badSeeker, ok.relic, ok.hour);
          return window.__visions.state();
        },
        choose: (i) => { pickCrack(i); return window.__visions.state(); },
        engrave: (raw) => { engrave(raw); return window.__visions.state(); },
        ask: (kind) => { askCrack(kind); return window.__visions.state(); },
        again: () => { beginAgain(); return window.__visions.state(); },
        world: () => G,
        open: openVisions
      };
    })();
