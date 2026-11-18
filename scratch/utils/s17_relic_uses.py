"""One-off (18 Nov 2026): Station 17 uses two relics. The lamp oil lights the mirrors by night (or the first ray waits
longer), and the Signal Mirror, found under the seal at dawn, is handed to Hermes to answer Tower II. Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

S17 = 'web/hub/js/stations/s17-solstice-arch.js'
R(S17, [
("""        signalHint: 'order_cairn5_signal_hint'
      };""", """        signalHint: 'order_cairn5_signal_hint',
        lamp: 'order_cairn5_lamp',                  // 'lit' (the lamp oil burnt by night) or 'dark' (no light: the first ray waits longer)
        mirrorRaised: 'order_cairn5_mirror_raised'  // she handed Hermes the Signal Mirror for the night signal
      };"""),
("""        texts: [
          'Do not wait for the sun to turn the mirrors, Silvia. The first ray can be set in the dark: turn the mirrors before you call the dawn, and save your haste for the other three.',
          'I have learnt to breathe slowly: now each ray waits longer. My note on working backwards from the altar is in Ask Hermes: "How do I aim the mirrors for a November dawn?"',
          'Let us set the first ray together, in the dark. Light can reach the altar from straight above it, or from the east along the bottom row. Try the first way: follow its column up to the first mirror, it must catch the light from the west and drop it down, so it leans like \\\\. Now look west of that mirror: the one there must send the light toward it. Ask the same question there, and walk back until you reach the arch.'
        ]
      });""", """        texts: dawnTexts()
      });
      // with the lamp lit the first ray can be set in the dark; without it, the moonlight still shows where it will fall
      function dawnTexts() {
        const dark = () => get(KEYS.lamp) === 'dark';
        const t = [];
        Object.defineProperty(t, 0, { enumerable: true, get: () => (dark()
          ? 'We have no light for the pins, Silvia, but the moon still shows where each ray will fall. Plan your turns by moonlight before you call the dawn: the first ray will wait longer for us.'
          : 'Do not wait for the sun to turn the mirrors, Silvia. With the lamp lit, the first ray can be set in the dark: turn the mirrors before you call the dawn, and save your haste for the other three.') });
        t[1] = 'I have learnt to breathe slowly: now each ray waits longer. My note on working backwards from the altar is in Ask Hermes: "How do I aim the mirrors for a November dawn?"';
        Object.defineProperty(t, 2, { enumerable: true, get: () => 'Let us set the first ray together' + (dark() ? ', by moonlight' : ', in the dark') + '. Light can reach the altar from straight above it, or from the east along the bottom row. Try the first way: follow its column up to the first mirror, it must catch the light from the west and drop it down, so it leans like \\\\. Now look west of that mirror: the one there must send the light toward it. Ask the same question there, and walk back until you reach the arch.' });
        return t;
      }"""),
("""      function turnMirror(i) {
        if (!isAwake() || dawnDone() || i < 0 || i >= mirrors.length) return;
""", """      function turnMirror(i) {
        if (!isAwake() || dawnDone() || i < 0 || i >= mirrors.length) return;
        // by night the pins of the mirrors cannot be seen without a light
        if (!dawn.running && get(KEYS.lamp) !== 'lit') { askLamp(); return; }
"""),
("""      // ---- The dawn ----
      const stepMs = () => (get(KEYS.dawnHint) === 'true' ? STEP_MS_HINTED : STEP_MS);""", """      // ---- The lamp: Hermes asks for a light to set the mirrors by night ----
      const RU = () => window.RelicUse;
      function askLamp() {
        const ru = RU();
        if (!ru) { set(KEYS.lamp, 'lit'); return; }
        if (ru.isOpen()) return;
        if (get(KEYS.lamp) === 'dark' && !ru.has('lamp_oil')) {
          feedback(el.dawnFeedback, '🌙 Too dark to find the pins. The mirrors turn in the light of the dawn.', '');
          return;
        }
        ru.ask({
          ask: 'The moon shows me where the rays will fall, Silvia, but not the pins that turn the mirrors. I need a light. What do we have?',
          want: 'lamp_oil',
          wrong: {
            flint_tinder: 'A spark lasts a blink. I need a flame that stays.',
            spyglass_lens: 'The lens makes the dark bigger, not lighter.',
            founders_lamp: 'Empty: I poured its oil into my own lamp in the labyrinth.'
          },
          cancel: 'We have no light',
          onRight: () => {
            set(KEYS.lamp, 'lit');
            ru.spend('lamp_oil', { tag: 'BURNT UNDER THE ARCH', lore: 'The last of the nomads’ oil. It burnt down under the Arch of the Solstice while Hermes set the mirrors for the dawn.' }, () => {
              cue('flame', { dur: 1.6 });
              say('Lit. The last of the oil, Silvia: it will not last until morning, but it shows me every pin. Set the first ray now, while we can see.');
              feedback(el.dawnFeedback, '🪔 The lamp is lit. Turn the mirrors before you call the dawn.', 'ok');
              render();
            });
          },
          onCancel: () => {
            if (get(KEYS.lamp) === 'lit') return;
            if (!get(KEYS.lamp)) {
              set(KEYS.lamp, 'dark');
              say('No light, then. We wait for the dawn and turn them by its light. I will count my breaths: the first ray will wait longer for us.');
            }
            feedback(el.dawnFeedback, '🌙 Too dark to find the pins. The mirrors turn in the light of the dawn.', '');
            render();
          }
        });
      }

      // ---- The dawn ----
      // each ray has 30 seconds; 45 once Hermes has learnt to breathe slowly, or for the first ray when there was no light by night
      const stepMs = () => ((get(KEYS.dawnHint) === 'true' || (dawn.step === 0 && get(KEYS.lamp) === 'dark')) ? STEP_MS_HINTED : STEP_MS);"""),
("""          say("Four locks! The brass ring turned, Silvia, and the altar opened like a flower: the Seal of Cairn V is in my hand. The fifth one. Under it lay a small bronze hand mirror, freshly polished, with the Order's mark on its rim. I am going to sit down for a moment. Then I will wait for the night here, under the arch: from up here I can see Tower II.");
          render();""", """          say("Four locks! The brass ring turned, Silvia, and the altar opened like a flower: the Seal of Cairn V is in my hand. The fifth one. Under it lay a small bronze hand mirror, freshly polished, with the Order's mark on its rim. I am going to sit down for a moment. Then I will wait for the night here, under the arch: from up here I can see Tower II.");
          if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('signal_mirror');
          render();"""),
("""      function watchLight() {
        if (!dawnDone() || isDone() || finale || modal.style.display === 'none') return;""", """      // ---- The Signal Mirror: she hands it to Hermes before he can answer the tower ----
      const mirrorRaised = () => isDone() || get(KEYS.mirrorRaised) === 'true';
      function askMirror() {
        const ru = RU();
        if (!ru) { raiseMirror(); return; }
        if (ru.isOpen() || mirrorRaised()) return;
        ru.ask({
          ask: 'The light on Tower II is awake, Silvia, and it is waiting. My lamp is spent. Hand me something that can answer it.',
          want: 'signal_mirror',
          wrong: {
            spyglass_lens: 'The lens can watch the light. It cannot answer it.',
            lamp_oil: 'Oil makes a flame, and a flame cannot blink. I need something that throws light back.',
            flint_tinder: 'Sparks will not carry that far.',
            tuning_pebble: 'Not the pebble. That one I keep for someone.'
          },
          onRight: () => raiseMirror()
        });
      }
      function raiseMirror() {
        if (mirrorRaised() || !dawnDone()) return;
        set(KEYS.mirrorRaised, 'true');
        cue('shimmer', { deg: 8 });
        if (G && G.fx && G.fx.gait) G.fx.gait.react('cheer');
        say('The little mirror from under the altar. Of course: it catches even the starlight. Watch the tower first, Silvia, then tell me what to send.');
        render();
        setTimeout(watchLight, 900);
      }
      if (window.RelicUse) {
        // the Use button of the satchel: the mirror answers the tower; the lens looks at it
        const nightOpen = () => modal.style.display !== 'none' && dawnDone() && !isDone() && view.ending === 0;
        window.RelicUse.register('signal_mirror', () => { if (!nightOpen() || mirrorRaised()) return false; raiseMirror(); return true; });
        window.RelicUse.register('spyglass_lens', () => {
          if (!nightOpen()) return false;
          say('Through the lens the light on Tower II is a lantern in a high window, and something passes in front of it, again and again. Not a fire, Silvia. Someone is moving that lantern by hand.');
          return true;
        });
      }
      function watchLight() {
        if (!dawnDone() || isDone() || finale || modal.style.display === 'none') return;
        if (!mirrorRaised()) { askMirror(); return; }"""),
("""      function pressStart(e) {
        if (!dawnDone() || isDone() || finale || pressAt) return;""", """      function pressStart(e) {
        if (!dawnDone() || isDone() || finale || pressAt || !mirrorRaised()) return;"""),
("""      function sendSignal() {
        if (!dawnDone() || isDone() || finale || !pulses.length) return;""", """      function sendSignal() {
        if (!dawnDone() || isDone() || finale || !pulses.length || !mirrorRaised()) return;"""),
("""We must turn the mirrors for an autumn dawn. Set them tonight, if you like; at dawn, be quick.");""", """We must turn the mirrors for an autumn dawn. Set them tonight, if we have a light; at dawn, be quick.");"""),
("""        [el.flash, el.clear, el.send, el.watch].forEach((b) => { if (b) b.disabled = !dDone || done || finale; });""", """        const raised = mirrorRaised();
        [el.flash, el.clear, el.send].forEach((b) => { if (b) b.disabled = !dDone || done || finale || !raised; });
        if (el.watch) el.watch.disabled = !dDone || done || finale;
        if (el.raise) el.raise.hidden = !dDone || done || raised;"""),
("""        night: $('solstice-night'), watch: $('btn-solstice-watch'),""", """        night: $('solstice-night'), watch: $('btn-solstice-watch'), raise: $('btn-solstice-raise'),"""),
("""        state: () => ({ running: dawn.running, step: dawn.step, locks: dawn.locks, dawnDone: dawnDone(), round: roundsDone(), finale }),""", """        state: () => ({ running: dawn.running, step: dawn.step, locks: dawn.locks, dawnDone: dawnDone(), round: roundsDone(), finale, stepMs: stepMs(), lamp: get(KEYS.lamp), raised: mirrorRaised() }),
        lamp: (v) => set(KEYS.lamp, v),
        raiseMirror: () => raiseMirror(),"""),
])
R('web/index.html', [
("""              <div class="solstice-tower-trace" id="solstice-tower-trace" aria-live="polite"></div>
              <div class="pillars-row">
                <button type="button" class="chasm3d-btn" id="btn-solstice-watch">👁 Watch the light</button>""", """              <div class="solstice-tower-trace" id="solstice-tower-trace" aria-live="polite"></div>
              <button type="button" class="chasm3d-btn is-way" id="btn-solstice-raise" hidden>🎒 Hand Hermes something to answer the light</button>
              <div class="pillars-row">
                <button type="button" class="chasm3d-btn" id="btn-solstice-watch">👁 Watch the light</button>"""),
])
R('web/hub/js/hub-core.js', [
("""        if (localStorage.getItem('order_arch_solstice_completed') === 'true' && !list.includes('signal_mirror')) list.push('signal_mirror');""",
 """        // the Signal Mirror lies under the Seal of Cairn V: it is hers from the dawn on
        if ((localStorage.getItem('order_arch_solstice_completed') === 'true' || localStorage.getItem('order_cairn5_dawn_done') === 'true') && !list.includes('signal_mirror')) list.push('signal_mirror');"""),
])
R(S17, [("      if (el.watch) el.watch.addEventListener('click', watchLight);\n", "      if (el.watch) el.watch.addEventListener('click', watchLight);\n      if (el.raise) el.raise.addEventListener('click', askMirror);\n")])  # applied by hand on 18 Nov
print('done')
