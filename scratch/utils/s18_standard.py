"""One-off (18 Nov 2026): Station 18 is brought to the standard of Stations 15 to 17. It gets the animated reward screen, the
printed page inside the game, shorter lines from Hermes, the Hub's mute, an opening film that is not lost when she closes during it,
and two uses of the satchel: the Servant's coin is shown before the stele, and the Falcon Weight lifts the hatch of the well.
Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

J = 'web/hub/js/stations/s18-polybius-stele.js'
R(J, [
("""        sound: 'order_stele_sound'
      };""", """        sound: 'order_stele_sound',
        coin: 'order_stele_coin',       // 'shown': she handed Hermes the Servant's coin before the stele
        falcon: 'order_stele_falcon',   // 'used' (the Falcon Weight lifted the hatch) or 'no' (Hermes heaved it alone)
        trail: 'order_stele_trail'      // the road he took across the fire, for the reward: { p: [[x, y], ...], t: turns }
      };"""),
("""        "WHO. He asks who is up here, in the grid of his own stele. My name will not do: the raiders know it by now. Silvia... the proverb. 'Those WHO SEEK truth.' He has knocked the first half of a password. Answer him: it is your stanza now.",
        "A long scrape under the stone, and then quick, light knocks, like a man laughing. He understood, Silvia! Wait... he is knocking again. Slowly.",
        "WELL. The old well of the atrium! The founders cut a cistern under this floor, and its hatch is in the far corner, past the burning mats. He went down into the dark and pulled the hatch shut over his head. Listen: one more stanza.",
        "ASH. Not the raiders, Silvia: the ash. Where the fire has passed, it cannot burn twice. He is telling me how to cross. The smoke is pouring into the well, and he cannot hold on for long. Guide me to the hatch."
      ];""", """        "WHO. He asks who is up here. My name will not do: the raiders know it. The proverb, Silvia: 'those WHO SEEK truth.' He knocked half a password. The next word is yours.",
        "A long scrape, then quick, light knocks, like a man laughing. He understood, Silvia! Wait. He is knocking again, slowly.",
        "WELL. The old well of the atrium! Its hatch is in the far corner, past the burning mats. He went down and pulled it shut over his head. One more stanza.",
        "ASH. Where the fire has passed, it cannot burn twice: he is telling me how to cross. Smoke is pouring into the well, and he cannot hold on for long. Guide me to the hatch."
      ];"""),
("""      const soundOn = () => get(KEYS.sound) !== 'off';""",
 """      const soundOn = () => get(KEYS.sound) !== 'off' && get('order_ambience_muted') !== 'true';   // the Hub's speaker button silences the knocks too"""),
("""      let run = null;        // the crossing of the atrium: { x, y, t } (lives only while the page is open)""",
 """      let run = null;        // the crossing of the atrium: { x, y, t, trail } (lives only while the page is open)
      let cineClosed = false; // she closed the station while the opening film played: it will play again next time
      let justWon = false;    // the Servant's Key gets its own card when she leaves right after the hatch
      let hatchPending = false; // Hermes is at the hatch and the satchel's tray is open"""),
("""      const newRun = () => ({ x: ATRIUM.start[0], y: ATRIUM.start[1], t: 0 });""",
 """      const newRun = () => ({ x: ATRIUM.start[0], y: ATRIUM.start[1], t: 0, trail: [ATRIUM.start.slice()] });"""),
("""        if (!fireOpen() || isDone() || !run || modal.style.display === 'none') return;
        const nx = run.x + dx, ny = run.y + dy;""", """        if (!fireOpen() || isDone() || !run || hatchPending || modal.style.display === 'none') return;
        const nx = run.x + dx, ny = run.y + dy;"""),
("""        run.x = nx; run.y = ny; run.t++;
        if (turnCueOk()) {""", """        run.x = nx; run.y = ny; run.t++;
        if (run.trail) run.trail.push([nx, ny]);
        if (turnCueOk()) {"""),
("""        say((why === 'fire' ? "I am all right, Silvia, only singed. " : "He is still knocking, Silvia, but fainter. ") + "Fire is like water: it always runs down the same channels, in the same order. Watch the glowing flagstones and try again." + (hinted ? " I have been reading the fire: now every flagstone shows the turn it catches." : ''));""",
 """        say((why === 'fire' ? "Only singed, Silvia. " : "He is still knocking, Silvia, but fainter. ") + "Fire is like water: it runs down the same channels, in the same order. Watch the glowing flagstones and try again." + (hinted ? " I have been reading the fire: now every flagstone shows the turn it catches." : ''));"""),
("""      function reachHatch() {
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
      }""", """      // ---- The satchel (relic-use.js): the Servant's coin before the stele, the Falcon Weight at the hatch ----
      const RU = () => window.RelicUse || null;
      const coinWaits = () => { const ru = RU(); return !!ru && !isAwake() && get(KEYS.coin) !== 'shown' && ru.has('servant_coin'); };
      function showCoin() {
        if (get(KEYS.coin) === 'shown') return;
        set(KEYS.coin, 'shown');
        if (hints && hints.grant) hints.grant('s18-proverb', 1);
        cue('shimmer', { deg: 9 });
        react('nod');
        say("The Servant's coin, of course. There are letters scratched on its rim, two by two. 'Read my stele the way you read a coin,' he said: 'by the pairs.' I will keep it, Silvia. He said it has more work to do.");
        render();
      }
      function askCoin() {
        const ru = RU();
        if (!ru || ru.isOpen() || !coinWaits()) return;
        ru.ask({
          ask: 'The old man gave me something at his gates, Silvia, for the day I stood before his stele. Which was it?',
          want: 'servant_coin',
          wrong: {
            red_cord: 'The cord was his blessing, not his hint.',
            statue_seal: 'That came from the stone keepers, not from him.',
            falcon_weight: 'Too heavy for a hint, Silvia. Keep the falcon ready, though.'
          },
          onRight: showCoin
        });
      }
      // The hatch of the well has lost its counterweight. The Falcon Weight can take its place, unless it is owed to the stone keepers.
      function reachHatch() {
        const ru = RU();
        const offer = !!ru && !get(KEYS.falcon) && ru.has('falcon_weight') && !(window.GatesRoad && window.GatesRoad.canPayKeepers());
        if (!offer) { openHatch(false); return; }
        hatchPending = true;
        feedback(el.moveFeedback, 'Hermes is at the hatch. Its counterweight chain hangs empty.', '');
        subtitle('Hermes drops to his knees at the bronze hatch. The chain of its counterweight hangs empty.', 4, 'act');
        ru.ask({
          ask: 'The hatch is solid bronze, Silvia, and its counterweight is gone from the chain. What have we got that is heavy?',
          want: 'falcon_weight',
          wrong: {
            water_skins: 'Empty skins weigh nothing. I need brass, or stone.',
            tuning_pebble: 'Not the pebble. And it is far too light.',
            founders_lamp: 'A lamp of thin brass will not pull a hatch of bronze.',
            servant_coin: 'One coin, against a bronze hatch? No.'
          },
          cancel: 'Heave, Hermes!',
          onRight: () => { set(KEYS.falcon, 'used'); ru.spend('falcon_weight', { silent: true }); openHatch(true); },
          onCancel: () => { set(KEYS.falcon, 'no'); openHatch(false); }
        });
      }
      function openHatch(falcon) {
        hatchPending = false;
        sceneHatch(falcon);
        completeStation();
        feedback(el.moveFeedback, falcon ? 'The brass falcon drops on its chain, and the bronze hatch swings up.' : 'Hermes lifts the bronze hatch of the well.', 'ok');
        say((falcon
          ? "I hooked the falcon on the chain, Silvia, and the hatch rose like a feather. "
          : "I heaved the hatch open, Silvia. ")
          + "He came up out of the dark: the Servant, alive, black with smoke, a roll of charts in his arms. He took my wrists in his burnt hands and did not let go. Under the hatch, two lines cut by the founders. Write them down.");
      }
      function completeStation() {
        // the key first: once the station is done the inventory counts it from that flag and would never mark it new
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('servant_key');
        set(KEYS.done, 'true');
        if (run && run.trail) set(KEYS.trail, JSON.stringify({ p: run.trail, t: run.t }));
        stopKnocks();
        cue('groan', { dur: 1.2 });
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        justWon = true;
        // the reward rises once the Servant has come up out of the well
        clearTimeout(reward.timer);
        reward.timer = setTimeout(showReward, G && !reduced() ? 9600 : 700);
      }

      // ---- The reward: the atrium with the road he took, the four words, the key, the Ledger lines, what the satchel gave ----
      const reward = { box: null, back: null, timer: 0 };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      function rewardMap() {
        let trail = null;
        try { trail = JSON.parse(get(KEYS.trail) || 'null'); } catch (e) { trail = null; }
        const pts = trail && Array.isArray(trail.p) && trail.p.length > 1 ? trail.p : null;
        let cells = '';
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
          const c = cellAt(x, y);
          const kind = c === 'L' ? 'is-lib' : c === '#' ? 'is-col' : c === 'f' ? 'is-fuel' : 'is-stone';
          cells += '<rect class="stele-rw-cell ' + kind + '" x="' + (x * C) + '" y="' + (y * C) + '" width="' + C + '" height="' + C + '"/>';
        }
        const line = pts ? pts.map((p) => cx(p[0]) + ',' + cy(p[1])).join(' ') : '';
        const dd = pts ? Math.min(3.2, 0.5 + pts.length * 0.16).toFixed(2) : '0';
        const [hx, hy] = ATRIUM.hatch, [sx, sy] = ATRIUM.start, [tx, ty] = ATRIUM.stele;
        return '<svg viewBox="-2 -2 ' + (COLS * C + 4) + ' ' + (ROWS * C + 4) + '" role="img" aria-label="The atrium of Tower II from above: the road Hermes took from the side door to the hatch of the well' + (pts ? ', in ' + trail.t + ' turns' : '') + '">'
          + '<rect class="stele-rw-floor" x="-1" y="-1" width="' + (COLS * C + 2) + '" height="' + (ROWS * C + 2) + '" rx="2"/>'
          + cells
          + '<text class="stele-rw-mark" x="' + cx(tx) + '" y="' + (cy(ty) + 1.6) + '" style="fill:#fde68a">▮</text>'
          + (pts ? '<polyline class="rw-road-glow" pathLength="1" style="--dd:' + dd + 's;--d0:0.7s" points="' + line + '"/><polyline class="rw-road" pathLength="1" style="--dd:' + dd + 's;--d0:0.7s" points="' + line + '"/>' : '')
          + '<text class="stele-rw-mark" x="' + cx(sx) + '" y="' + (cy(sy) + 1.6) + '">S</text>'
          + '<g class="stele-rw-hatch" style="--t:' + (0.9 + Number(dd)).toFixed(2) + 's"><circle cx="' + cx(hx) + '" cy="' + cy(hy) + '" r="4"/><text class="stele-rw-mark" x="' + cx(hx) + '" y="' + (cy(hy) + 1.5) + '" style="fill:#fff7d6">W</text></g>'
          + '</svg>';
      }
      function showReward() {
        clearTimeout(reward.timer);
        const body = modal.querySelector('.chasm3d-body');
        if (!body || !isDone() || modal.style.display === 'none') return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward stele-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', 'Your reward for the Polybius Stele');
          reward.box.hidden = true;
          body.appendChild(reward.box);
          reward.box.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast'); });
          reward.box.addEventListener('click', (e) => {
            const relic = e.target.closest && e.target.closest('[data-relic]');
            if (relic && typeof window.openItemAcquiredModal === 'function') { justWon = false; relic.classList.remove('is-new'); window.openItemAcquiredModal({ id: relic.getAttribute('data-relic') }); }
          });
        }
        const num = (k) => parseInt(get(k) || '0', 10) || 0;
        const burnt = num(KEYS.fireFails), falseKnocks = num(KEYS.knockFails), tries = num(KEYS.fails) + 1;
        let turns = '–';
        try { const tr = JSON.parse(get(KEYS.trail) || 'null'); if (tr && tr.t) turns = String(tr.t); } catch (e) {}
        const words = STANZAS.map((s, i) => '<span class="drw-word" style="--t:' + (3.6 + i * 0.3).toFixed(2) + 's">' + s.word + '</span>').join('<u aria-hidden="true">·</u>');
        const falcon = get(KEYS.falcon) === 'used';
        const spent = falcon ? '<div class="rw-label drw-label">The satchel gave</div><ul class="drw-spent"><li><img src="./assets/items/item_falcon_weight.png" alt=""><span><b>The Falcon Weight</b>It hangs on the chain of the well and holds the hatch open.</span></li></ul>' : '';
        reward.box.innerHTML = '<div class="rw-rays" aria-hidden="true"></div>'
          + '<div class="rw-sparks" aria-hidden="true">' + Array.from({ length: 18 }, (_, i) => '<i style="--a:' + ((i * 360 / 18) | 0) + 'deg;--d:' + (120 + (i % 5) * 36) + 'px;--t:' + (0.9 + (i % 4) * 0.2).toFixed(2) + 's"></i>').join('') + '</div>'
          + '<div class="chasm3d-reward-card">'
          + '<div class="chasm3d-reward-kicker">Station 18 · The Polybius Stele</div>'
          + '<h3 class="chasm3d-reward-title">The Servant Lives</h3>'
          + '<p class="rw-sub">The stele turned for the proverb, the stone answered in knocks, and Hermes crossed the fire on the ash.</p>'
          + '<div class="rw-grid">'
          + '<section class="rw-map stele-rw-map" aria-label="The crossing of the burning atrium">'
          + '<div class="rw-label">The road across the fire</div>'
          + rewardMap()
          + '<div class="rw-ends"><span>S · the side door</span><span>W · the well</span></div>'
          + '<div class="drw-words" aria-label="WHO, SEEK, WELL, ASH">' + words + '</div>'
          + '<div class="chasm3d-reward-stats">'
          + '<div><b>' + turns + '</b><span>turns</span></div>'
          + '<div><b>' + burnt + '</b><span>times the fire won</span></div>'
          + '<div><b>' + falseKnocks + '</b><span>false knocks</span></div>'
          + '<div><b>' + tries + '</b><span>proverb tries</span></div>'
          + '</div>'
          + (burnt === 0 ? '<div class="rw-flawless">✦ Across the fire at the first try ✦</div>' : '')
          + '</section>'
          + '<section class="rw-loot">'
          + '<div class="drw-relics">'
          + '<button type="button" class="drw-relic' + (justWon ? ' is-new' : '') + '" data-relic="servant_key" aria-label="The Servant\\'s Key: open the card"><span class="drw-pic"><img src="./assets/items/item_servant_key.webp" alt="" width="140" height="140"></span><span class="drw-name"><b>The Servant’s Key</b><small>For the inner stair of Tower II</small></span></button>'
          + '</div>'
          + '<div class="drw-eqs">'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Cut under the hatch of the well</div><div class="rw-ledger-title">The First Line</div><div class="rw-eq" aria-label="H minus U equals 16"><i>H</i><u>−</u><i>U</i><u>=</u><b>16</b></div><p>A line for your Cipher Ledger.</p></div></div>'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Cut beneath it</div><div class="rw-ledger-title">The Second Line</div><div class="rw-eq" aria-label="M plus T equals 25"><i>M</i><u>+</u><i>T</i><u>=</u><b>25</b></div><p>Both lines are now in your Ledger.</p></div></div>'
          + '</div>'
          + '<div class="rw-label drw-label">On the back of the stele</div>'
          + '<ul class="drw-lines"><li style="--t:5.2s">348°, north-north-west: the bearing of Cairn III.</li></ul>'
          + spent
          + '<div class="rw-next">Next · Hermes on the Field Wire</div>'
          + '</section></div>'
          + '<div class="chasm3d-reward-actions">'
          + '<button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>'
          + '<button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay in the atrium</button>'
          + '</div></div>';
        if (!rewardOpen()) reward.back = document.activeElement;
        reward.box.hidden = false;
        reward.box.scrollTop = 0;
        reward.box.classList.remove('is-fast', 'is-on');
        void reward.box.offsetWidth;
        reward.box.classList.add('is-on');
        if (!cue('shimmer', { deg: 21 }) && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        const wireBtn = reward.box.querySelector('.chasm3d-reward-wire'), stayBtn = reward.box.querySelector('.chasm3d-reward-stay');
        if (wireBtn) wireBtn.addEventListener('click', () => { hideReward(true); leaveForWire(); });
        if (stayBtn) stayBtn.addEventListener('click', () => hideReward());
        if (wireBtn) wireBtn.focus({ preventScroll: true });
      }
      function hideReward(quietly) {
        clearTimeout(reward.timer);
        if (!rewardOpen()) return;
        reward.box.hidden = true;
        const back = reward.back; reward.back = null;
        if (quietly) return;
        const to = back && document.contains(back) && back.offsetParent ? back : el.rewardBtn;
        if (to && to.focus) to.focus({ preventScroll: true });
      }
      // as at Stations 15 and 16: the new relic's card first, then straight to Hermes on the Field Wire
      function leaveForWire() {
        closeSteleModal();
        const go = () => {
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          const wireTab = document.querySelector('[data-view="view-field-wire"]');
          if (wireTab) wireTab.click();
          if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ The Servant is safe ✦ Hermes is waiting for you on the Field Wire.');
        };
        if (justWon && typeof window.openItemAcquiredModal === 'function') { justWon = false; setTimeout(() => window.openItemAcquiredModal({ id: 'servant_key' }, go), 260); }
        else go();
      }"""),
("""        say("I said it aloud, every word, and the stele turned on its base, Silvia, stone grinding on stone. On its back, cut deep: 348°, north-north-west. The bearing of Cairn III. And then, under my feet... knocking. Someone is knocking on the underside of the floor. Groups of knocks, and pauses. He heard the proverb, and he is answering in the grid of the stele. Listen, and read him with the page “The Polybius Stele”.");""",
 """        say("The stele turned on its base, Silvia, stone grinding on stone. On its back: 348°, north-north-west, the bearing of Cairn III. And now, under my feet, knocking: groups of knocks, and pauses. He heard the proverb, and he answers in the grid of the stele. Read him with your page.");"""),
("""        if (el.sound) { el.sound.setAttribute('aria-pressed', String(soundOn())); el.sound.textContent = soundOn() ? '🔊 Sound' : '🔈 Sound off'; }""",
 """        if (el.sound) { el.sound.setAttribute('aria-pressed', String(soundOn())); el.sound.textContent = soundOn() ? '🔊 Sound' : '🔈 Sound off'; }
        if (el.coinBtn) el.coinBtn.hidden = !coinWaits();"""),
("""      function sceneHatch() {
        view.ending = 1; view.endT = performance.now(); view.endFireT = run ? run.t : null;
        subtitle('Hermes drops to his knees at the bronze hatch, takes the ring in both hands, and heaves.', 4, 'act');""",
 """      function sceneHatch(falcon) {
        view.ending = 1; view.endT = performance.now(); view.endFireT = run ? run.t : null;
        subtitle(falcon ? 'Hermes hooks the brass falcon on the empty chain. It drops into the dark, and the bronze hatch swings up by itself.'
          : 'Hermes drops to his knees at the bronze hatch, takes the ring in both hands, and heaves.', 4, 'act');
        if (falcon) cue('click');"""),
("""      if (el.sound) el.sound.addEventListener('click', () => { set(KEYS.sound, soundOn() ? 'off' : 'on'); render(); });""",
 """      if (el.sound) el.sound.addEventListener('click', () => {
        // with the Hub speaker off, this button turns the sound back on for everything (it would do nothing otherwise)
        if (get('order_ambience_muted') === 'true') { if (window.EclipseAmbience && window.EclipseAmbience.setMuted) window.EclipseAmbience.setMuted(false); else set('order_ambience_muted', 'false'); set(KEYS.sound, 'on'); }
        else set(KEYS.sound, soundOn() ? 'off' : 'on');
        if (!soundOn()) stopKnocks(true);
        render();
      });
      document.addEventListener('click', (e) => { if (modal.style.display !== 'none' && e.target.closest && e.target.closest('#ambience-toggle')) setTimeout(() => { if (!soundOn()) stopKnocks(true); render(); }, 0); });
      if (el.coinBtn) el.coinBtn.addEventListener('click', askCoin);
      if (el.rewardBtn) el.rewardBtn.addEventListener('click', showReward);
      if (window.RelicUse) {
        // the Use button of the satchel: the coin before the stele, the falcon at the hatch
        window.RelicUse.register('servant_coin', () => { if (modal.style.display === 'none' || !coinWaits()) return false; showCoin(); return true; });
      }"""),
("""        return " I almost forgot: the coin the Servant gave me has letters on its rim. He told me to read the stele the way I read a coin: by the pairs.";
      }""", """        return " I almost forgot: the coin the Servant gave me has letters on its rim. He told me to read the stele the way I read a coin: by the pairs.";
      }
      // with the satchel's tray she hands him the coin herself; Hermes only feels that he is forgetting something
      const coinLine = () => (RU() ? (coinWaits() ? " And I keep feeling that I am forgetting something in the satchel." : '') : coinNote());"""),
("""            toast('Hermes is still under the Arch. Open the Cliffside Workshop: he will wire you before he sets out.');""",
 """            toast('Hermes is still under the Arch. Open the Field Wire: he will wire you before he sets out.');"""),
("""        view.snapNext = true; view.ending = 0; view.endFireT = null; view.sigilT = 0; view.freeze = false; view.phase = ''; view.hover = null;""",
 """        view.snapNext = true; view.ending = 0; view.endFireT = null; view.sigilT = 0; view.freeze = false; view.phase = ''; view.hover = null;
        hatchPending = false;"""),
("""        else if (!isAwake()) say("Silvia, I am inside. I came in by a side door the raiders never found: they are out by the wagons, waiting for the fire to do their work for them. The library of the atrium is burning, the roof is full of smoke, and in the middle of it all the stele stands untouched. The Servant is nowhere. Open the page “The Polybius Stele”, please: what does the stele say?" + coinNote());
        else if (!fireOpen()) say("He is still under the floor, Silvia, waiting for us. Listen to him again whenever you need to, and read him with the page “The Polybius Stele”.");""",
 """        else if (!isAwake()) say("Silvia, I am inside, by a side door the raiders never found. They wait by their wagons for the fire to do their work. The library is burning, the roof is full of smoke, and in the middle the stele stands untouched. The Servant is nowhere. Open your page “The Polybius Stele”: what does the stele say?" + coinLine());
        else if (!fireOpen()) say("He is still under the floor, Silvia, waiting for us. Listen again whenever you need to, and read him with your page “The Polybius Stele”.");"""),
("""        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          set(CINE_INTRO, 'seen');
          cine.start(openingShots(), finishOpen);
        } else finishOpen();
      }
      function closeSteleModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopKnocks(true);
        if (cine && cine.active) cine.skip();""", """        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          cineClosed = false;
          cine.start(openingShots(), () => { if (!cineClosed) set(CINE_INTRO, 'seen'); finishOpen(); });
        } else finishOpen();
      }
      function closeSteleModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopKnocks(true);
        hideReward(true);
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();   // (at the hatch this lets Hermes heave it alone)
        if (cine && cine.active) { cineClosed = true; cine.skip(); }"""),
("""        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeSteleModal();
      }, true);""", """        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        if (rewardOpen() && (!$('modal-item-acquired') || $('modal-item-acquired').style.display === 'none')) { e.stopImmediatePropagation(); hideReward(); return; }
        closeSteleModal();
      }, true);"""),
("""      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeSteleModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ The Servant is safe ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
        });
      }""", """      if (el.finish) el.finish.addEventListener('click', leaveForWire);"""),
("""        state: () => ({ knocks: knocksDone(), run: run ? { x: run.x, y: run.y, t: run.t } : null, playing: !!playing, done: isDone() }),""",
 """        state: () => ({ knocks: knocksDone(), run: run ? { x: run.x, y: run.y, t: run.t } : null, playing: !!playing, done: isDone(), falcon: get(KEYS.falcon), coin: get(KEYS.coin), hatchPending }),
        showReward: () => showReward(), rewardOpen: () => rewardOpen(),"""),
("""        hint: $('stele-hint'), victory: $('stele-victory'), victoryText: $('stele-victory-text'), finish: $('btn-stele-finish'),""",
 """        hint: $('stele-hint'), victory: $('stele-victory'), victoryText: $('stele-victory-text'), finish: $('btn-stele-finish'),
        rewardBtn: $('btn-stele-reward'), coinBtn: $('btn-stele-coin'),"""),
])

R('web/index.html', [
("""          <div class="laby3d-sigil" id="stele-proverb-card">
            <div class="chasm3d-where">I · The proverb of the stele: read the six stanzas through the founders' grid, and mind the mirage</div>""",
 """          <div class="laby3d-sigil" id="stele-proverb-card">
            <div class="station-page-pill">Your page: <span class="journal-ref-pill" role="button" tabindex="0" data-sheet="17A" data-open="page" aria-haspopup="dialog" title="See the printed page The Polybius Stele"><span class="pill-icon">📖</span> The Polybius Stele</span></div>
            <div class="chasm3d-where">I · The proverb of the stele: read the six stanzas through the founders' grid, and mind the mirage</div>"""),
("""            <button type="button" class="chasm3d-btn is-way" id="btn-stele-speak">✦ Speak the Proverb</button>
            <div class="monolith-feedback" id="stele-key-feedback" role="status" aria-live="polite"></div>""",
 """            <button type="button" class="chasm3d-btn is-way" id="btn-stele-speak">✦ Speak the Proverb</button>
            <button type="button" class="chasm3d-btn relic-ask-btn" id="btn-stele-coin" hidden>🎒 Hand Hermes something from the satchel</button>
            <div class="monolith-feedback" id="stele-key-feedback" role="status" aria-live="polite"></div>"""),
("""          <div class="chasm-victory-card" id="stele-victory" style="display: none;">
            <div class="chasm-victory-title"><span>🗝️</span><span>The Servant Lives</span></div>
            <div class="chasm-victory-text" id="stele-victory-text"></div>
            <div class="laby3d-eqs">
              <span class="monolith-equation">[H] − [U] = 16</span>
              <span class="monolith-equation">[M] + [T] = 25</span>
            </div>
            <p class="laby3d-eq-note">Cut by the founders under the hatch of the well. Both lines are now in your Cipher Ledger.</p>
            <p class="laby3d-eq-note">🗝️ <strong>The Servant's Key</strong> is in Hermes's satchel. On the back of the stele: <strong>348° NNW</strong>.</p>
            <button type="button" class="btn-chasm-finish" id="btn-stele-finish"><span>🗺️ Back to the Grand Desert Map ➔</span></button>
          </div>""", """          <div class="drw-done" id="stele-victory" style="display: none;">
            <div class="drw-done-title">✦ The Servant lives</div>
            <button type="button" class="chasm3d-btn chasm3d-again" id="btn-stele-reward">🏆 See your reward</button>
            <button type="button" class="btn-chasm-finish" id="btn-stele-finish"><span>📻 To Hermes on the Field Wire ➔</span></button>
          </div>"""),
("""  <link rel="stylesheet" href="./hub/css/relic-use.css">""", """  <link rel="stylesheet" href="./hub/css/stations/desert-reward.css">
  <link rel="stylesheet" href="./hub/css/relic-use.css">"""),
])

R('web/hub/js/hub-core.js', [
("""        '17A': { title: 'The Polybius Stele', note: "The Servant's trial: the founders' 5 × 5 grid, keyed with PHOENIX, and six stanzas carved in the atrium of Tower II.", thumb:""",
 """        '17A': { title: 'The Polybius Stele', note: "The Servant's trial: the founders' 5 × 5 grid, keyed with PHOENIX, and six stanzas carved in the atrium of Tower II.", page: './assets/journal_pages/page_17a_polybius_stele.webp', thumb:"""),
("""        '18A': { title: "The Oracle's Horizon", note: 'Eight beacons sent east across the three mirrors of the horizon: the sigil of the Oracle, and the first truth.', thumb:""",
 """        '18A': { title: "The Oracle's Horizon", note: 'Eight beacons sent east across the three mirrors of the horizon: the sigil of the Oracle, and the first truth.', page: './assets/journal_pages/page_18a_oracle_horizon.webp', thumb:"""),
])

# the tray holds the keyboard while it is open: Escape must not reach the station under it
R('web/hub/js/relic-use.js', [
("""      function wants(id) { return !!pending && pending.want.indexOf(id) >= 0; }""",
 """      // (stations listen for Escape on the document, in the capture phase: this listener was added before theirs, so it runs first)
      document.addEventListener('keydown', function (e) {
        if (!tray || tray.hidden || e.key !== 'Escape') return;
        e.preventDefault(); e.stopImmediatePropagation();
        close(true);
      }, true);
      function wants(id) { return !!pending && pending.want.indexOf(id) >= 0; }"""),
])
print('done')
