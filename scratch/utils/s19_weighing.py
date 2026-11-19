"""One-off (19 Nov 2026): the last game of the Desert Path. In Station 19 the WHEN is no longer read off the disc in words: it is
weighed. Once the disc is set by the sky, Aurelia sings three riddles; each answer is a word (FEAR, LUX, ERA), and the weight of
each word in Silvia's own Cipher Ledger is a number of the date: 18, 20 and 12. A bronze balance stands on the altar, each weighing
brings back one of her memories, and the beam of light from the roof slowly leaves the altar. The page never shows a letter's value
that she has not written herself (Rule 9). Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

J = 'web/hub/js/stations/s19-oracle-horizon.js'
R(J, [
("""    // stars' positions, not guessed). Set true, the disc reads from the north, clockwise, rim to heart:
    // DECEMBER EIGHTEEN TO TWENTY (24 letters), the WHEN.""",
 """    // stars' positions, not guessed). The 24 sightings carry the 24 letters she can weigh by now (all but I and J).
    // Then the weighing, the last game of the Desert Path: the Oracle sings three riddles, each answer is a word, and the weight of
    // each word in Silvia's own Cipher Ledger is a number of the date: FEAR 18, LUX 20, ERA 12. The WHEN: 18 to 20 December."""),
("""      const WHEN_WORDS = 'DECEMBER EIGHTEEN TO TWENTY';
      const WHEN_LETTERS = WHEN_WORDS.replace(/ /g, '');   // 24 letters, one for each sighting
      const RINGS = [0, 1, 2].map((r) => Array.from({ length: 8 }, (_, k) => WHEN_LETTERS[3 * k + r]));""",
 """      // The 24 sightings carry the 24 letters of the Order she can weigh by now: every letter but I and J, which this station gives.
      // Set true, each ring reads in order from the north: A to H on the rim, K to R in the middle, S to Z at the heart.
      const RINGS = ['ABCDEFGH', 'KLMNOPQR', 'STUVWXYZ'].map((s) => s.split(''));
      // ---- The weighing: three riddles, three words, three numbers of the date ----
      // (the weights are what the words weigh in the true Ledger; the page only ever compares her answer with them)
      const RIDDLES = [
        { word: 'FEAR', weight: 18, name: 'the first day',
          verse: ['I walk beside the brave, and still they walk.', 'I am the cold in a man’s hands before a door.', 'Four letters. Take my first away, and what is left can hear.'],
          extra: 'The cartographer has carried me for fifty-five years. This morning he told you my name.',
          near: { EAR: 'She tilts her head: that is what is left of it when its first letter is gone.', AFRAID: 'Close. But she wants the thing itself, in four letters.', DREAD: 'Close. But four letters, and without its first it can hear.', FRIGHT: 'Close. But four letters, and without its first it can hear.', COLD: 'Cold is how it feels, not what it is.' },
          found: 'FEAR. Aurelia lays four bronze letters on the pan, and the balance leans.',
          hermes: "Fear, Silvia. The days begin with fear. The Order never wrote a date in words: it wrote the weight of a word. Weigh it: add its four letters, with the numbers of your own Cipher Ledger.",
          memory: '“Cold,” she says, and stops singing. “A terrace, high up. Cold brass under my hands.”',
          settled: "The balance settled, Silvia. The first day is the eighteenth. And she remembered something: a terrace, and the cold. I know that terrace." },
        { word: 'LUX', weight: 20, name: 'the last day',
          verse: ['I am what the lamp gives, and what the mirror sends on.', 'The founders wrote me in their old tongue, short as a spark.', 'Three letters. I end with the mark that shows where treasure lies.'],
          extra: 'They named the cartographer after me: the cartographer of the distant kind.',
          near: { LIGHT: 'Light, yes. But she wants it in the old tongue of the founders: three letters, and the last is the mark on a treasure map.', LUZ: 'Almost. The old tongue ends it with the mark on a treasure map.', SUN: 'Brighter than a lamp, but not her word: hers ends with the mark on a treasure map.', RAY: 'A ray is made of it. Her word is older, and ends with the mark on a treasure map.' },
          found: 'LUX. Light, in the old tongue. Three bronze letters on the pan.',
          hermes: "Lux, Silvia: light, as the founders wrote it. From fear to light. Weigh it: three letters this time.",
          memory: '“Fire,” she says. “Shelves burning, and rolls of paper in my arms. I would not let them go.”',
          settled: "Twenty, Silvia: the last day. From the eighteenth to the twentieth. And she remembered a fire, and charts in her arms. I was there. I could not reach her." },
        { word: 'ERA', weight: 12, name: 'the month',
          verse: ['I am longer than a year, and longer than any life.', 'Kings give me their names, and I bury every king.', 'Three letters. Turn me round, and you ARE.'],
          extra: 'I was hiding inside her first word, in another order, once its head was gone.',
          near: { ARE: 'The same three letters. Turn them the other way.', EAR: 'The same three letters, in another order.', AGE: 'An age, yes. But three other letters: turned round, they say ARE.', EPOCH: 'An age, yes. But three letters: turned round, they say ARE.', TIME: 'Time is what it is made of. Three letters: turned round, they say ARE.' },
          found: 'ERA. Three letters on the pan: the same three that fear was hiding.',
          hermes: "Era, Silvia. An age. One more weighing, and the balance will tell us the month.",
          memory: '“A voice,” she says. “Someone counting stars aloud, and getting them wrong.” She turns her veiled face toward Hermes.',
          settled: '' }
      ];"""),
])
R(J, [
("""        key: 'order_oracle_key',        // 'turned' (she handed Hermes the Servant's Key) or 'servant' (the old man opened the stair himself)""",
 """        weighStep: 'order_oracle_weigh_step',   // how many of the three riddles are weighed (0 to 3)
        weighWord: 'order_oracle_weigh_word',   // 'true' once the word of the current riddle is found
        wordFails: 'order_oracle_word_fails',   // wrong words for the current riddle (a fourth line at 3, the first letter at 6)
        weighFails: 'order_oracle_weigh_fails', // weighings that did not settle (all three riddles)
        weighHint: 'order_oracle_weigh_hint',
        beams: 'order_oracle_beams_lost',       // times the light left the altar before a word was weighed
        key: 'order_oracle_key',        // 'turned' (she handed Hermes the Servant's Key) or 'servant' (the old man opened the stair himself)"""),
("""          'Turn each ring until its star points the same way as that star in the sky. Then read from the north, rim to heart, and go clockwise. My longer note is in Ask Hermes: "How do I set the disc of 24 sightings?"',""",
 """          'Turn each ring until its star points the same way as that star in the sky. When all three are true, each ring reads its letters in order from the north. My longer note is in Ask Hermes: "How do I set the disc of 24 sightings?"',"""),
("""      const vowHints = hints.define({""", """      const weighHints = hints.define({
        id: 's19-weigh', station: 'Station 19', title: 'the weighing of the words', group: 'desert',
        anchor: el.discFeedback, solved: whenRead, active: () => isAwake() && discTrue(), legacyKey: KEYS.weighHint,
        texts: [
          'Each riddle hides one word, and each word weighs what its letters weigh together. Find the word first. Then open your Cipher Ledger, take the number of every letter of the word, and add them.',
          'I wrote down how the Oracle weighs a word. It is in Ask Hermes: "How do I set the disc of 24 sightings?"',
          'Let us do the first one together. Her first word is what I felt at her door this morning: FEAR. It has four letters: F, E, A and R. Find those four numbers in your Cipher Ledger and add them. If the balance still will not settle, one of the four is not what the desert taught you: go back to the lines of that letter.'
        ]
      });
      const vowHints = hints.define({"""),
("""      function turn(ring, dir) {
        if (!isAwake() || whenRead() || ring < 0 || ring > 2) return;""", """      function turn(ring, dir) {
        if (!isAwake() || whenRead() || discTrue() || ring < 0 || ring > 2) return;   // once it is true, the disc goes on the balance"""),
("""          say("Silvia... the jewel. Three short flashes, a pause, two long ones: the code I engraved in it, more than fifty years ago. And every sighting is lit. Read it the way I made it to be read: from the north, clockwise, each spoke from the rim to the heart.");
          pulseCode();
          if (el.whenInput) setTimeout(() => el.whenInput.focus({ preventScroll: true }), 60);""",
 """          say("Silvia... the jewel. Three short flashes, a pause, two long ones: the code I engraved in it, more than fifty years ago. Twenty-four sightings, twenty-four letters in their order, and it spells nothing. It was never written to be read. She has set it beside a bronze balance on the altar, in the beam of light, and she has begun to sing.");
          pulseCode();
          startWeighing();"""),
])
# readWhen() goes; the weighing takes its place
s = open(J).read()
a = s.index("      function readWhen() {")
b = s.index("      // ---- The vow ----\n      function drawTiles() {")
NEW = r'''      // ---- The weighing: her riddle, the word, its weight in Silvia's own Ledger ----
      const weighStep = () => (whenRead() ? RIDDLES.length : Math.max(0, Math.min(RIDDLES.length, parseInt(get(KEYS.weighStep) || '0', 10) || 0)));
      const riddle = () => RIDDLES[weighStep()] || null;
      const weighing = () => isAwake() && discTrue() && !whenRead();
      const wordFound = () => get(KEYS.weighWord) === 'true';
      const numOf = (k) => parseInt(get(k) || '0', 10) || 0;
      // the number she has written for a letter in her Cipher Ledger (never the true one): null when she has none yet
      function myNumber(ch) {
        const L = window.EclipseLedger;
        const v = L && typeof L.value === 'function' ? L.value(ch) : null;
        return typeof v === 'number' && v >= 1 && v <= 26 ? v : null;
      }
      // The beam of light from the opening in the roof crosses the altar while she weighs. When it has gone, nothing is lost:
      // the moon comes over the opening, and the word on the pan is weighed again.
      const LIGHT_MS = 240000, LIGHT_MS_LONG = 360000;
      const light = { left: LIGHT_MS, gone: false, moon: false, last: 0, timer: 0 };
      const lightTotal = () => (numOf(KEYS.beams) >= 2 ? LIGHT_MS_LONG : LIGHT_MS);
      const lightFrac = () => (light.gone ? 0 : Math.max(0, Math.min(1, light.left / lightTotal())));
      function lightTick() {
        if (!weighing() || light.gone || !modalOpen() || busyOverlay() || rewardOpen() || document.hidden) { light.last = 0; return; }
        const now = performance.now();
        if (light.last) light.left -= now - light.last;
        light.last = now;
        if (light.left <= 0) lightGone(); else drawLight();
      }
      function lightGone() {
        light.gone = true; light.left = 0; light.last = 0;
        set(KEYS.beams, String(numOf(KEYS.beams) + 1));
        cue('dusk');
        subtitle('The beam of light slides off the altar. Aurelia covers the balance with her sleeve, and waits.', 5.5, 'act');
        say("The light has left the altar, Silvia, and she will not weigh in the dark. Nothing is lost. The moon comes over the opening in a moment, and then we weigh this word again." + (numOf(KEYS.beams) === 2 ? " I will hold my cloak up to the draught: the light should stay with us longer." : ''));
        if (el.weightInput) el.weightInput.value = '';
        render();
        if (el.moonBtn) setTimeout(() => el.moonBtn.focus({ preventScroll: true }), 60);
      }
      function lightBack() {
        if (!light.gone) return;
        light.gone = false; light.moon = true; light.left = lightTotal(); light.last = 0;
        cue('shimmer', { deg: 6 });
        subtitle('Moonlight finds the opening in the roof and falls, cold and white, on the balance.', 5, 'act');
        say("The moon is over the opening, Silvia. She has uncovered the balance. Once more.");
        render();
        const t = wordFound() ? el.weightInput : el.wordInput;
        if (t) setTimeout(() => t.focus({ preventScroll: true }), 60);
      }
      function drawLight() {
        if (el.lightBar) el.lightBar.style.width = (lightFrac() * 100).toFixed(1) + '%';
        if (el.lightBox) { el.lightBox.classList.toggle('is-low', !light.gone && lightFrac() < 0.25); el.lightBox.classList.toggle('is-gone', light.gone); el.lightBox.classList.toggle('is-moon', light.moon && !light.gone); }
        if (el.lightLabel) el.lightLabel.textContent = light.gone ? 'The light has left the altar' : light.moon ? 'The moon on the altar' : 'The light on the altar';
      }
      // the bronze balance of the panel: her word on the left pan (with the numbers of her own Ledger), the day it weighs on the right
      const bal = { state: 'idle', t: 0 };   // 'idle' | 'loaded' | 'swing' | 'settled'
      function drawBalance() {
        const box = el.balance, r = riddle();
        if (!box) return;
        const word = r && wordFound() ? r.word : '';
        const tiles = word.split('').map((ch, i) => {
          const x = 44 - (word.length - 1) * 7.5 + i * 15, n = myNumber(ch);
          return '<g class="ob-tile"><rect x="' + (x - 6.5) + '" y="58" width="13" height="13" rx="2"/><text class="ob-letter" x="' + x + '" y="68">' + ch + '</text>'
            + '<text class="ob-mine' + (n === null ? ' is-none' : '') + '" x="' + x + '" y="81">' + (n === null ? '?' : n) + '</text></g>';
        }).join('');
        const solved = RIDDLES.slice(0, weighStep()).map((x, i) => '<circle class="ob-gold" cx="' + (148 + i * 9) + '" cy="67" r="3.6"/>').join('');
        box.className = 'oracle-balance is-' + bal.state;
        box.innerHTML = '<svg viewBox="0 0 200 92" role="img" aria-label="' + (word ? 'The bronze balance: the word ' + word + ' lies on the left pan' : 'The bronze balance of the Oracle, empty') + '">'
          + '<path class="ob-post" d="M100 16 L100 86 M82 88 L118 88"/><circle class="ob-pivot" cx="100" cy="16" r="3.4"/>'
          + '<g class="ob-beam"><path class="ob-arm" d="M44 16 L156 16"/><path class="ob-chain" d="M44 16 L28 56 M44 16 L60 56 M156 16 L140 56 M156 16 L172 56"/>'
          + '<path class="ob-pan" d="M24 56 Q44 68 64 56 Z"/><path class="ob-pan" d="M136 56 Q156 68 176 56 Z"/>'
          + (word ? '<g transform="translate(0 -16)">' + tiles + '</g>' : '') + '<g transform="translate(0 -15)">' + solved + '</g></g></svg>'
          + (word ? '<div class="ob-note">Under each letter: the number in <strong>your</strong> Cipher Ledger. A <b>?</b> means its lines are still waiting there.</div>' : '');
      }
      function setBalance(state) { bal.state = state; bal.t = performance.now(); drawBalance(); }
      function singRiddle() {
        const r = riddle();
        if (!r) return;
        const i = weighStep();
        if (!wordFound()) {
          say(i === 0 ? "She is singing a riddle, Silvia, in a voice like dry reeds. I think it is a rule of the Oracles: each riddle hides a word, and the word is weighed. Find her word."
            : i === 1 ? "She sings again, Silvia, a second riddle. The balance is empty and waiting. Find her word."
              : "The third riddle, Silvia, the last. She sings it more slowly, as if it cost her. Find her word.");
        } else say(r.hermes);
      }
      function startWeighing() {
        light.gone = false; light.moon = false; light.left = lightTotal(); light.last = 0;
        setBalance(wordFound() ? 'loaded' : 'idle');
        if (el.wordInput) setTimeout(() => { if (modalOpen()) el.wordInput.focus({ preventScroll: true }); }, 80);
      }
      function tryWord() {
        const r = riddle();
        if (!weighing() || !r || wordFound() || light.gone) return;
        const typed = letters(el.wordInput && el.wordInput.value);
        if (!typed) { feedback(el.discFeedback, 'Type the word her riddle hides.', 'error'); return; }
        if (typed !== r.word) {
          const fails = numOf(KEYS.wordFails) + 1;
          set(KEYS.wordFails, String(fails));
          weighHints.fail();
          cue('wrong'); oracleDoes('shake'); react('worry');
          feedback(el.discFeedback, r.near[typed] || (typed.length !== r.word.length
            ? 'She shakes her head. Count the letters her riddle asks for: ' + (r.word.length === 4 ? 'four' : 'three') + '.'
            : 'She shakes her head slowly, and sings the riddle again from the first line.'), 'error');
          if (fails === 3) subtitle('Aurelia adds a line she had left out: “' + r.extra + '”', 7, 'act');
          render();
          return;
        }
        set(KEYS.weighWord, 'true'); set(KEYS.wordFails, '0');
        if (el.wordInput) el.wordInput.value = '';
        if (!cue('shimmer', { deg: 12 + weighStep() * 2 }) && sfx && sfx.playChimeHover) sfx.playChimeHover();
        cue('click');
        oracleDoes('nod'); react('wonder');
        subtitle(r.found, 5, 'act');
        feedback(el.discFeedback, r.word + '. Now weigh it: add the numbers of its letters in your Cipher Ledger.', 'ok');
        say(r.hermes);
        setBalance('loaded');
        render();
        if (el.weightInput) setTimeout(() => el.weightInput.focus({ preventScroll: true }), 60);
      }
      function tryWeight() {
        const r = riddle();
        if (!weighing() || !r || !wordFound() || light.gone) return;
        const raw = String(el.weightInput && el.weightInput.value || '').trim();
        if (!/^\d{1,3}$/.test(raw)) { feedback(el.discFeedback, 'Type what the word weighs: one number.', 'error'); return; }
        if (parseInt(raw, 10) !== r.weight) {
          set(KEYS.weighFails, String(numOf(KEYS.weighFails) + 1));
          weighHints.fail();
          cue('wrong'); react('worry');
          setBalance('swing');
          setTimeout(() => { if (bal.state === 'swing') setBalance('loaded'); }, 1500);
          // (never which way: the balance does not say whether she is over or under)
          feedback(el.discFeedback, 'The balance swings, and will not settle. Add the letters of ' + r.word + ' again, each with its number in your Cipher Ledger.', 'error');
          render();
          return;
        }
        const i = weighStep();
        set(KEYS.weighStep, String(i + 1)); set(KEYS.weighWord, 'false'); set(KEYS.wordFails, '0');
        if (el.weightInput) el.weightInput.value = '';
        if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        cue('bell', { f: 392 * Math.pow(2, i / 6), v: 0.12, len: 3 });
        oracleDoes('nod'); react('wonder');
        sceneSettle(i);
        setBalance('settled');
        subtitle(r.memory, 7, 'act');
        if (i + 1 >= RIDDLES.length) { finishWhen(); return; }
        feedback(el.discFeedback, 'The balance settles: ' + r.name + ' is weighed.', 'ok');
        say(r.settled);
        light.left = lightTotal(); light.last = 0;   // a new word, and the whole beam again
        render();
        setTimeout(() => { if (weighing() && !wordFound()) { setBalance('idle'); singRiddle(); render(); if (el.wordInput && modalOpen()) el.wordInput.focus({ preventScroll: true }); } }, reduced() ? 600 : 5200);
      }
      // the three words are weighed: the first truth
      function finishWhen() {
        set(KEYS.when, 'true');
        stopPulse();
        sceneRead(true);
        feedback(el.discFeedback, 'From FEAR to LUX, in the twelfth month: 18 – 20 December. The first truth: the WHEN.', 'ok');
        say("Twelve, Silvia: the twelfth month. From fear to light, the eighteenth to the twentieth of December. The first truth, hidden in the weight of three words, and you carried every weight across this desert yourself. She remembered a voice. Now she is saying words through her veil, very softly, like someone looking for a song. Help me. I think I know which words they are." + (pebbleWaits() ? " And I am carrying something of hers." : ''));
        render();
        const first = el.tiles && el.tiles.querySelector('button');
        if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
      }

'''
s = s[:a] + NEW + s[b:]
open(J, 'w').write(s)

R(J, [
("""          + '<div><b>' + num(KEYS.readFails) + '</b><span>misreadings</span></div>'""",
 """          + '<div><b>' + num(KEYS.weighFails) + '</b><span>unsettled weighings</span></div>'"""),
("""          + '<div class="oracle-rw-when">The First Truth · the WHEN<strong>18 – 20 December</strong></div>'""",
 """          + '<div class="oracle-rw-when">The First Truth · the WHEN<strong>18 – 20 December</strong></div>'
          + '<div class="drw-words oracle-rw-weighed" aria-label="Weighed on the balance: FEAR, LUX, ERA">' + RIDDLES.map((r, i) => '<span class="drw-word" style="--t:' + (3.5 + i * 0.2).toFixed(2) + 's">' + r.word + '</span>').join('<u aria-hidden="true">·</u>') + '</div>'"""),
("""        if (el.readPanel) el.readPanel.style.display = awake && dTrue && !wRead ? '' : 'none';""",
 """        // the weighing: her riddle, the balance, the word and its weight, and the light that is leaving
        const wg = awake && dTrue && !wRead, rd = riddle(), found = wordFound();
        if (el.weighPanel) el.weighPanel.style.display = wg ? '' : 'none';
        if (wg && rd) {
          if (el.verse) {
            el.verse.textContent = '';
            const head = document.createElement('div'); head.className = 'oracle-verse-head';
            head.textContent = ['I', 'II', 'III'][weighStep()] + ' · She sings of ' + rd.name;
            el.verse.appendChild(head);
            rd.verse.concat(numOf(KEYS.wordFails) >= 3 && !found ? [rd.extra] : []).forEach((ln) => { const p = document.createElement('p'); p.textContent = '“' + ln + '”'; el.verse.appendChild(p); });
            if (numOf(KEYS.wordFails) >= 6 && !found) { const p = document.createElement('p'); p.className = 'oracle-verse-help'; p.textContent = 'Hermes, under his breath: “It begins with ' + rd.word.charAt(0) + '.”'; el.verse.appendChild(p); }
          }
          if (el.wordRow) el.wordRow.style.display = found || light.gone ? 'none' : '';
          if (el.weightRow) el.weightRow.style.display = found && !light.gone ? '' : 'none';
          if (el.moonBtn) el.moonBtn.hidden = !light.gone;
          if (bal.state === 'idle' && found) bal.state = 'loaded';
          drawBalance();
          drawLight();
        }
        if (el.dateSlots) el.dateSlots.forEach((n, k) => { const ok = wRead || weighStep() > k; n.textContent = ok ? String(RIDDLES[k].weight) : '?'; n.classList.toggle('is-set', ok); });
        if (el.dateBox) el.dateBox.style.display = awake && dTrue && !wRead ? '' : 'none';"""),
("""        if (el.ringCtrls) el.ringCtrls.style.display = wRead ? 'none' : '';""",
 """        if (el.ringCtrls) el.ringCtrls.style.display = wRead || dTrue ? 'none' : '';"""),
("""          el.status.textContent = done ? '✦ She remembers' : !awake ? 'The door is shut' : wRead ? 'The vow' : dTrue ? 'The disc is true · read it' : n + ' of 3 stars true';""",
 """          el.status.textContent = done ? '✦ She remembers' : !awake ? 'The door is shut' : wRead ? 'The vow' : dTrue ? 'The weighing · ' + weighStep() + ' of 3 words' : n + ' of 3 stars true';"""),
("""        sigilHints.refresh(); discHints.refresh(); vowHints.refresh();""", """        sigilHints.refresh(); discHints.refresh(); weighHints.refresh(); vowHints.refresh();"""),
("""      if (el.read) el.read.addEventListener('click', readWhen);
      if (el.whenInput) el.whenInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') readWhen(); });""",
 """      if (el.wordBtn) el.wordBtn.addEventListener('click', tryWord);
      if (el.wordInput) el.wordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryWord(); });
      if (el.weighBtn) el.weighBtn.addEventListener('click', tryWeight);
      if (el.weightInput) el.weightInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryWeight(); });
      if (el.moonBtn) el.moonBtn.addEventListener('click', lightBack);"""),
("""        if (!whenRead()) return discTrue() ? el.whenInput : el.ringBtns[0][1];""",
 """        if (!whenRead()) return discTrue() ? (light.gone ? el.moonBtn : wordFound() ? el.weightInput : el.wordInput) : el.ringBtns[0][1];"""),
("""        read: (text) => { if (el.whenInput) el.whenInput.value = text; readWhen(); },""",
 """        riddles: RIDDLES.map((r) => ({ word: r.word, letters: r.word.length })),
        weighState: () => ({ step: weighStep(), word: wordFound(), light: +lightFrac().toFixed(3), gone: light.gone, moon: light.moon, balance: bal.state, beams: numOf(KEYS.beams) }),
        word: (w) => { if (el.wordInput) el.wordInput.value = w; tryWord(); },
        weigh: (n) => { if (el.weightInput) el.weightInput.value = String(n); tryWeight(); },
        expireLight: () => { if (weighing() && !light.gone) { light.left = 0; light.last = 0; lightGone(); } },
        moon: () => lightBack(),"""),
("""        disc: $('oracle-disc'), sky: $('oracle-sky'), readPanel: $('oracle-read-panel'), whenInput: $('oracle-when-input'), read: $('btn-oracle-read'),""",
 """        disc: $('oracle-disc'), sky: $('oracle-sky'), weighPanel: $('oracle-weigh-panel'), verse: $('oracle-verse'), balance: $('oracle-balance'),
        wordRow: $('oracle-word-row'), wordInput: $('oracle-word-input'), wordBtn: $('btn-oracle-word'),
        weightRow: $('oracle-weight-row'), weightInput: $('oracle-weight-input'), weighBtn: $('btn-oracle-weigh'), moonBtn: $('btn-oracle-moon'),
        lightBox: $('oracle-light'), lightBar: $('oracle-light-bar'), lightLabel: $('oracle-light-label'),
        dateBox: $('oracle-date'), dateSlots: Array.from(document.querySelectorAll('#oracle-date .oracle-date-slot')),"""),
# the scene: a bronze balance on the altar, the camera on it while she weighs, the beam fading
("""        const pestle = solid(new T.CylinderGeometry(0.03, 0.045, 0.32, 10), bowlMat, 0.62, 1.2, 0.2, altar); pestle.rotation.z = 0.7;""",
 """        const pestle = solid(new T.CylinderGeometry(0.03, 0.045, 0.32, 10), bowlMat, 0.62, 1.2, 0.2, altar); pestle.rotation.z = 0.7;
        // ---- The Oracle's balance, on the altar in the beam of light: a word on one pan, the day it weighs on the other ----
        const brassMat = new T.MeshStandardMaterial({ color: 0xb8893a, metalness: 0.78, roughness: 0.34, emissive: 0x2a1a04, emissiveIntensity: 0.6 });
        const goldMat = new T.MeshStandardMaterial({ color: 0xfde68a, metalness: 0.6, roughness: 0.3, emissive: 0xb07a1c, emissiveIntensity: 0.9 });
        const balance = new T.Group(); balance.position.set(-0.05, 1.02, -0.05); altar.add(balance);
        solid(new T.CylinderGeometry(0.16, 0.2, 0.05, 20), brassMat, 0, 0.025, 0, balance);
        solid(new T.CylinderGeometry(0.022, 0.03, 0.78, 10), brassMat, 0, 0.42, 0, balance);
        solid(new T.SphereGeometry(0.045, 12, 10), brassMat, 0, 0.83, 0, balance);
        const balBeam = new T.Group(); balBeam.position.set(0, 0.8, 0); balance.add(balBeam);
        const arm = solid(new T.CylinderGeometry(0.014, 0.014, 1.0, 8), brassMat, 0, 0, 0, balBeam); arm.rotation.z = Math.PI / 2;
        const balPans = [-1, 1].map((sd) => {
          const pan = new T.Group(); pan.position.set(sd * 0.5, 0, 0); balBeam.add(pan);   // hangs from the arm; kept level in the frame
          [[-0.11, 0], [0.11, 0], [0, 0.11], [0, -0.11]].forEach(([dx, dz]) => { const c = solid(new T.CylinderGeometry(0.004, 0.004, 0.36, 4), brassMat, dx / 2, -0.18, dz / 2, pan); c.rotation.z = -dx * 1.5; c.rotation.x = dz * 1.5; });
          solid(new T.CylinderGeometry(0.15, 0.1, 0.035, 20), brassMat, 0, -0.36, 0, pan);
          return pan;
        });
        const balBlocks = [0, 1, 2, 3].map((k) => { const m = solid(new T.BoxGeometry(0.055, 0.055, 0.055), brassMat, -0.09 + k * 0.06, -0.315, (k % 2 ? 0.03 : -0.03), balPans[0]); m.visible = false; return m; });
        const balGold = [0, 1, 2].map((k) => { const m = solid(new T.SphereGeometry(0.035, 12, 10), goldMat, -0.06 + k * 0.06, -0.31, 0, balPans[1]); m.visible = false; return m; });"""),
("""          beamPath, pool, ringAng: [0, 1, 2].map((r) => -rot[r] * Math.PI / 4), H, hermes: H && H.hermes, lamp, fx, motes, moteAcc: 0, altar,""",
 """          beamPath, pool, ringAng: [0, 1, 2].map((r) => -rot[r] * Math.PI / 4), H, hermes: H && H.hermes, lamp, fx, motes, moteAcc: 0, altar,
          balBeam, balPans, balBlocks, balGold, balTilt: 0,"""),
("""        if (!whenRead()) return 'disc';""", """        if (!whenRead()) return discTrue() ? 'weigh' : 'disc';"""),
("""        vow: { p: [3.3, 2.0, 1.5], l: [-0.1, 1.45, 0.0] },""", """        weigh: { p: [2.25, 2.05, 0.15], l: [0.05, 1.5, ALTAR[1] + 0.25] },   // the balance on the altar, the Oracle beside it
        vow: { p: [3.3, 2.0, 1.5], l: [-0.1, 1.45, 0.0] },"""),
("""        const warm = done ? (rm ? 1 : clamp((e - 1.2) / 3, 0, 1)) : (lit ? 0.35 : 0);
        G.beam.material.color.setRGB(0.6 + 0.4 * warm, 0.66 + 0.2 * warm, 0.85 - 0.35 * warm);
        G.beam.material.opacity = 0.14 + 0.1 * warm + (rm ? 0 : 0.015 * Math.sin(t * 0.7));
        G.beamLight.color.setRGB(0.72 + 0.28 * warm, 0.77 + 0.1 * warm, 0.91 - 0.4 * warm);
        G.beamLight.intensity = 1.5 + 0.8 * warm;
        G.pool.material.color.copy(G.beam.material.color); G.pool.material.opacity = 0.3 + 0.2 * warm;""",
 """        const warm = done ? (rm ? 1 : clamp((e - 1.2) / 3, 0, 1)) : (lit ? 0.35 : 0);
        // while she weighs, the beam is leaving the altar (and comes back white with the moon)
        const wgh = weighing(), lk = wgh ? (light.gone ? 0.08 : 0.3 + 0.7 * lightFrac()) : 1, cold = wgh && light.moon ? 1 : 0;
        G.beam.material.color.setRGB(0.6 + 0.4 * warm - 0.05 * cold, 0.66 + 0.2 * warm + 0.06 * cold, 0.85 - 0.35 * warm + 0.12 * cold);
        G.beam.material.opacity = (0.14 + 0.1 * warm + (rm ? 0 : 0.015 * Math.sin(t * 0.7))) * lk;
        G.beamLight.color.setRGB(0.72 + 0.28 * warm, 0.77 + 0.1 * warm, 0.91 - 0.4 * warm);
        G.beamLight.intensity = (1.5 + 0.8 * warm) * (0.35 + 0.65 * lk);
        G.pool.material.color.copy(G.beam.material.color); G.pool.material.opacity = (0.3 + 0.2 * warm) * lk;
        // the balance: it leans under a word, swings when the weight is wrong (never which way), and stands level when it settles
        if (G.balBeam) {
          const st = wgh ? bal.state : 'settled', age = (now - bal.t) / 1000;
          let want = st === 'loaded' ? 0.2 : 0, sway = 0;
          if (!rm) {
            if (st === 'idle') sway = 0.035 * Math.sin(t * 1.3);
            else if (st === 'loaded') sway = 0.03 * Math.sin(t * 1.7);
            else if (st === 'swing') { want = 0.2; sway = 0.42 * Math.exp(-age * 1.6) * Math.sin(age * 9); }
          }
          G.balTilt += (want - G.balTilt) * Math.min(1, dt * 3);
          G.balBeam.rotation.z = G.balTilt + sway;
          G.balPans.forEach((p) => { p.rotation.z = -G.balBeam.rotation.z; });
          const wlen = wgh && wordFound() && riddle() ? riddle().word.length : 0;
          G.balBlocks.forEach((m, k) => { m.visible = k < wlen; });
          G.balGold.forEach((m, k) => { m.visible = k < weighStep(); });
        }"""),
("""      function sceneRead(ok) {""", """      function sceneSettle(i) {
        if (!G || !G.fx || !G.balBeam) return;
        const p = new G.T.Vector3(); G.balBeam.getWorldPosition(p);
        G.fx.triumph({ x: p.x, y: p.y, z: p.z }, 0.3 + 0.15 * i);
      }
      function sceneRead(ok) {"""),
("""        if (ok) { subtitle('“December, the eighteenth to the twentieth.” She lowers the disc a little, and listens.', 4.5, 'act'); oracleDoes('nod'); react('wonder'); }""",
 """        if (ok) { setTimeout(() => { if (modalOpen()) subtitle('“December,” Hermes says. “The eighteenth to the twentieth.” She lowers the disc a little, and listens.', 5, 'act'); }, reduced() ? 200 : 6200); oracleDoes('nod'); react('wonder'); }"""),
("""        else if (!whenRead()) say("She is still holding the disc up for us, Silvia, patient as stone. Set the rings by the sky.");""",
 """        else if (!whenRead() && !discTrue()) say("She is still holding the disc up for us, Silvia, patient as stone. Set the rings by the sky.");
        else if (!whenRead()) { startWeighing(); singRiddle(); }"""),
])
# the light ticks while the window is open
R(J, [
("""        lastT = 0;
        cancelAnimationFrame(raf);
        if (G) raf = requestAnimationFrame(frame);
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {""",
 """        lastT = 0;
        cancelAnimationFrame(raf);
        if (G) raf = requestAnimationFrame(frame);
        clearInterval(light.timer); light.last = 0;
        light.timer = setInterval(lightTick, 250);
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {"""),
("""        stopPulse();
        hideReward(true);
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();""",
 """        stopPulse();
        hideReward(true);
        clearInterval(light.timer); light.last = 0;
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();"""),
])

# ---- index.html: the weighing panel, the how-to and the laws ----
R('web/index.html', [
("""              <div id="oracle-read-panel" style="display: none;">
                <div class="stele-answer-row oracle-read-row">
                  <label class="monolith-sr-only" for="oracle-when-input">What the disc says</label>
                  <input type="text" class="mon3d-input oracle-text-input" id="oracle-when-input" maxlength="64" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Read the 24 sightings">
                  <button type="button" class="chasm3d-btn is-way" id="btn-oracle-read">✦ Read it aloud</button>
                </div>
              </div>""",
 """              <div class="oracle-date" id="oracle-date" style="display: none;" aria-label="The date, as far as it is weighed: first day, last day, month">
                <span class="oracle-date-slot" title="The first day">?</span><u aria-hidden="true">–</u><span class="oracle-date-slot" title="The last day">?</span><u aria-hidden="true">·</u><small>month</small><span class="oracle-date-slot" title="The month">?</span>
              </div>
              <div id="oracle-weigh-panel" style="display: none;">
                <div class="oracle-light" id="oracle-light"><i id="oracle-light-bar"></i><span id="oracle-light-label">The light on the altar</span></div>
                <div class="oracle-verse" id="oracle-verse" aria-live="polite"></div>
                <div class="oracle-balance" id="oracle-balance"></div>
                <div class="stele-answer-row oracle-read-row" id="oracle-word-row">
                  <label class="monolith-sr-only" for="oracle-word-input">The word her riddle hides</label>
                  <input type="text" class="mon3d-input oracle-text-input" id="oracle-word-input" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Her word">
                  <button type="button" class="chasm3d-btn is-way" id="btn-oracle-word">✦ Say the word</button>
                </div>
                <div class="stele-answer-row oracle-read-row" id="oracle-weight-row" style="display: none;">
                  <label class="monolith-sr-only" for="oracle-weight-input">What the word weighs, as one number</label>
                  <input type="text" inputmode="numeric" class="mon3d-input oracle-text-input" id="oracle-weight-input" maxlength="3" autocomplete="off" placeholder="Its weight">
                  <button type="button" class="chasm3d-btn is-way" id="btn-oracle-weigh">⚖ Weigh it</button>
                </div>
                <button type="button" class="chasm3d-btn relic-ask-btn" id="btn-oracle-moon" hidden>🌙 Wait for the moon</button>
              </div>"""),
("""              <div class="chasm3d-where">II · The disc of 24 sightings: turn each ring until its star points where that star stands in the sky</div>""",
 """              <div class="chasm3d-where">II · The disc of 24 sightings: set it by the sky, then weigh the three words of the Oracle</div>"""),
("""            <p>Part I opens the door with a sigil from your journal. Part II reads a brass disc she holds up. Part III gives her back some words she has lost.</p>""",
 """            <p>Part I opens the door with a sigil from your journal. Part II sets a brass disc by the sky and weighs three words on her balance. Part III gives her back some words she has lost.</p>"""),
("""              <li>When all three are true, the jewel wakes. Read from the north, clockwise, each spoke from the rim to the heart, and type what it says.</li>
            </ol>""", """              <li>When all three are true, the jewel wakes and the disc goes on <strong>the Oracle's balance</strong>. She sings a riddle: find the <strong>word</strong> it hides and say it.</li>
              <li>Then <strong>weigh the word</strong>: add the numbers of its letters in your own <strong>Cipher Ledger</strong> (the balance shows them under each letter) and type the sum. Three words, three numbers: the first day, the last day and the month.</li>
              <li>The beam of light is slowly leaving the altar. If it goes, nothing is lost: wait for the moon and weigh that word again.</li>
            </ol>"""),
("""              <li>When all three point true, the disc answers. Hermes engraved it to be read from the north, clockwise: each spoke from the rim to the heart, three letters a spoke.</li>""",
 """              <li>When all three point true, the disc goes on the Oracle's balance. It was never written to be read: it is written to be weighed.</li>
              <li>She sings three riddles. Each hides a word, and each word weighs what its letters weigh together in your Cipher Ledger: the first day, the last day and the month of the first truth.</li>
              <li>The balance never says whether you are over or under. It only settles for the true weight.</li>"""),
])

# ---- Ask Hermes: the note on the disc also explains the weighing ----
R('web/hub/js/hub-core.js', [
("""When all three point true, the jewel answers. Then read it the way I engraved it: start at the north spoke, read rim, middle, heart, then move clockwise to the next spoke. Three letters a spoke, eight spokes.\"""",
 """When all three point true, the jewel answers and each ring reads its letters in order from the north. Then comes the weighing. The Oracle sings a riddle that hides one word. Say the word, and she lays it on her balance. A word weighs what its letters weigh together: take the number of each letter from your own Cipher Ledger and add them. The balance never says whether you are over or under; it only settles for the true weight. Three words, three numbers: the first day, the last day and the month.\""""),
("""                'order_desert_farewell', 'order_desert_farewell_pending']);""",
 """                'order_desert_farewell', 'order_desert_farewell_pending',
                'order_oracle_weigh_step', 'order_oracle_weigh_word', 'order_oracle_word_fails', 'order_oracle_weigh_fails', 'order_oracle_weigh_hint', 'order_oracle_beams_lost']);"""),
])
print('done')
