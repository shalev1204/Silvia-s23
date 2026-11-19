"""One-off (18 Nov 2026): Station 19 is brought to the standard of Stations 15 to 17. It gets the animated reward screen (which
leads into the passage to the Stage), the printed page inside the game, shorter lines from Hermes, an opening film that is not lost
when she closes during it, and four uses of the satchel: the Servant's Key and the Founders' Lamp on the inner stair, the Servant's
coin in the Oracle's door, and the Tuning Pebble given back to her. Run from the repo root."""
import re
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

J = 'web/hub/js/stations/s19-oracle-horizon.js'
R(J, [
("""        passage: 'order_stage_passage_seen'
      };""", """        passage: 'order_stage_passage_seen',
        key: 'order_oracle_key',        // 'turned' (she handed Hermes the Servant's Key) or 'servant' (the old man opened the stair himself)
        lamp: 'order_oracle_lamp',      // 'lit' (the Founders' Lamp burns on the stair) or 'dark'
        coin: 'order_oracle_coin',      // 'set': the Servant's coin is in the hollow disc of the slab
        pebble: 'order_oracle_pebble'   // 'given': the Tuning Pebble is back in her hands
      };"""),
("""      let said = [];   // indexes into TILES
      let pulsing = null;""", """      let said = [];   // indexes into TILES
      let pulsing = null;
      let cineClosed = false;   // she closed the station while the opening film played: it will play again next time
      let justWon = false;      // the Gilded Star gets its own card when she leaves right after the vow"""),
("""        say("December, the eighteenth to the twentieth. The hour and the season, Silvia: the first truth, written on a disc I made with my own hands, and I never knew what it would say. She is holding it out to you. And now she is looking at me through her veil, and she is saying words, very softly, as if she were trying to remember a song. Help me, Silvia. I think I know which words they are.");""",
 """        say("December, the eighteenth to the twentieth, Silvia: the first truth, on a disc I made with my own hands and never understood. She holds it out to you. And through her veil she is saying words, very softly, like someone remembering a song. Help me. I think I know which words they are." + (pebbleWaits() ? " And I am carrying something of hers." : ''));"""),
("""            b.className = 'chasm3d-btn oracle-tile';""",
 """            b.className = 'chasm3d-btn oracle-tile' + (w === 'ALWAYS' && get(KEYS.pebble) === 'given' && !isDone() ? ' is-recalled' : '');"""),
("""        say("I said it, Silvia. 'You were always the treasure.' And her hands let go of the disc, and she lifted the veil herself. It is her. It is Aurelia. Older, with a white streak in her hair and lapis blue under her nails, and her eyes are exactly the same. She does not remember everything. She remembers my voice, and the fire, and the cold of the terrace. She said her own name slowly, like a word in a language she used to speak. I cannot write any more right now.");
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
      }""", """        say("I said it, Silvia: 'You were always the treasure.' She let go of the disc and lifted the veil herself. It is Aurelia. Older, a white streak in her hair, lapis blue under her nails, and the same eyes. She remembers my voice, the fire, the cold of the terrace. Not everything. She said her own name slowly, like a word in a language she used to speak. I cannot write any more right now.");
      }
      function completeStation() {
        // the star first: once the station is done the inventory counts it from that flag and would never mark it new
        if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory('gilded_star');
        set(KEYS.done, 'true');
        set(KEYS.when, 'true');
        stopPulse();
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        justWon = true;
        // the reward rises once she has lifted the veil
        clearTimeout(reward.timer);
        reward.timer = setTimeout(showReward, G && !reduced() ? 11600 : 700);
      }

      // ---- The satchel (relic-use.js): the key and the lamp on the inner stair, the coin in the door, the pebble for her ----
      const RU = () => window.RelicUse || null;
      const modalOpen = () => modal.style.display !== 'none';
      const stairDone = () => isAwake() || (!!get(KEYS.key) && !!get(KEYS.lamp));
      const ARRIVE = "I am at the bottom of the inner stair, Silvia. The door is a slab of sandstone carved with a horizon: three mirrors and eight small sockets. It opens only for the sigil of the Oracle. Open your page “The Oracle's Horizon”, please. Someone is humming behind it.";
      // The way down, once: the locked door of the stair (the Servant's Key), then the dark (the Founders' Lamp, if she found it)
      function stairChain() {
        const ru = RU();
        if (isAwake() || !modalOpen() || busyOverlay()) return;
        if (!ru) { set(KEYS.key, 'turned'); set(KEYS.lamp, 'dark'); render(); return; }
        if (ru.isOpen()) return;
        if (!get(KEYS.key)) {
          if (!ru.has('servant_key')) { set(KEYS.key, 'servant'); stairChain(); return; }
          ru.ask({
            ask: 'The door of the inner stair is locked, Silvia, and the old man is watching my hands. What opens it?',
            want: 'servant_key',
            wrong: {
              servant_coin: 'Not the coin. I think its turn comes further down.',
              founders_lamp: 'A lamp for the dark, yes. First the lock.',
              tuning_pebble: 'Not the pebble. That one I keep for someone.',
              gilded_feather: 'A feather will not turn a lock of bronze, Silvia.'
            },
            cancel: 'Let the Servant open it',
            onRight: () => {
              set(KEYS.key, 'turned'); ru.spend('servant_key', { silent: true });
              cue('click'); react('nod');
              subtitle('The bronze key turns in the lock of the inner stair, as if it had been waiting. The Servant takes it back with a nod.', 4.6, 'act');
              setTimeout(stairChain, reduced() ? 300 : 2400);
            },
            onCancel: () => {
              set(KEYS.key, 'servant'); ru.spend('servant_key', { silent: true });
              subtitle('The Servant opens the door with his own ring of keys, and holds out his palm for the one he lent.', 4.6, 'act');
              setTimeout(stairChain, reduced() ? 300 : 2400);
            }
          });
          return;
        }
        if (!get(KEYS.lamp)) {
          if (!ru.has('founders_lamp')) { set(KEYS.lamp, 'dark'); say(ARRIVE + coinLine()); render(); return; }
          ru.ask({
            ask: 'The stair goes down into the dark, Silvia, and his lamp lights only the first steps. Have we still got a lamp of our own?',
            want: 'founders_lamp',
            wrong: {
              flint_tinder: 'A spark, and nothing to feed it.',
              signal_mirror: 'A mirror needs a light to throw. Down there, there is none.',
              spyglass_lens: 'There is nothing to see down there yet. That is the trouble.'
            },
            cancel: 'Go down by his light',
            onRight: () => {
              set(KEYS.lamp, 'lit'); ru.spend('founders_lamp', { silent: true });
              if (hints && hints.grant) hints.grant('s19-disc', 1);
              cue('flame', { dur: 1.4 }); react('wonder');
              subtitle('The Servant tips a little oil from his own lamp into the founders’ lamp. It catches at once.', 4.6, 'act');
              say("The founders' lamp burns again, Silvia. By its light the whole stair is painted: three gold stars on blue, Polaris at the top, then Capella, then Aldebaran. I left it burning on the last step. Now the door: a slab of sandstone carved with a horizon, three mirrors and eight sockets. It opens only for the sigil of the Oracle. Open your page “The Oracle's Horizon”. Someone is humming behind it." + coinLine());
              render();
            },
            onCancel: () => { set(KEYS.lamp, 'dark'); say(ARRIVE + coinLine()); render(); }
          });
        }
      }
      // The Servant's coin has the half-lit disc on one face, and the slab has the same disc, hollow, over its sockets
      const coinWaits = () => { const ru = RU(); return !!ru && !isAwake() && stairDone() && get(KEYS.coin) !== 'set' && ru.has('servant_coin'); };
      const coinLine = () => (coinWaits() ? " And there is a small hollow disc cut over the sockets, the size of my thumb." : '');
      function setCoin() {
        const ru = RU();
        if (get(KEYS.coin) === 'set') return;
        set(KEYS.coin, 'set');
        if (ru) ru.spend('servant_coin', { silent: true });
        if (hints && hints.grant) hints.grant('s19-sigil', 1);
        cue('click'); cue('shimmer', { deg: 10 }); react('nod');
        subtitle('The coin clicks into the hollow disc. For a breath, a thread of light runs from each beacon across the three mirrors.', 5, 'act');
        say("It fits, Silvia. And I remember the old man's last word about it: 'Do not read a beacon where it stands.' Each one has to cross the three mirrors first.");
        render();
      }
      function askCoin() {
        const ru = RU();
        if (!ru || ru.isOpen() || !coinWaits()) return;
        ru.ask({
          ask: 'There is a half-lit disc cut into the slab, Silvia, hollow, the size of my thumb. What have we got that would fit?',
          want: 'servant_coin',
          wrong: {
            order_wax_seal: 'The Order’s sign, yes, but wax would crumble in stone.',
            statue_seal: 'Too wide. That seal belongs to the stone keepers.',
            tuning_pebble: 'Not the pebble. That one I keep for someone.',
            signal_mirror: 'Too big for the hollow, and I will not leave my mirror in a door.'
          },
          onRight: setCoin
        });
      }
      // The pebble she once hid in the pillar of Cairn IV: back in her hands it brings one word of the song
      const pebbleWaits = () => { const ru = RU(); return !!ru && get(KEYS.when) === 'true' && !isDone() && get(KEYS.pebble) !== 'given' && ru.has('tuning_pebble'); };
      function givePebble() {
        const ru = RU();
        if (get(KEYS.pebble) === 'given') return;
        set(KEYS.pebble, 'given');
        if (ru) ru.spend('tuning_pebble', { silent: true });
        vowHints.grant ? vowHints.grant(1) : (hints && hints.grant && hints.grant('s19-vow', 1));
        cue('shimmer', { deg: 14 }); oracleDoes('nod'); react('wonder');
        subtitle('She takes the painted pebble in both hands and holds it to her ear, like a shell. Then, very softly: “…always…”', 6, 'act');
        say("She knew it at once, Silvia. She held it to her ear and said one word: 'always'. It is one of the words she is looking for.");
        render();
      }
      function askPebble() {
        const ru = RU();
        if (!ru || ru.isOpen() || !pebbleWaits()) return;
        ru.ask({
          ask: 'She is reaching for a song she has lost, Silvia. I am carrying something of hers. Which is it?',
          want: 'tuning_pebble',
          who: 'Hermes asks',
          wrong: {
            gilded_feather: 'Gold, yes. But that one came from the Alps, not from her hands.',
            red_cord: 'The cord is the Servant’s blessing. Not hers.',
            signal_mirror: 'The mirror answered her light. It is not what she lost.',
            surveyor_compass: 'My compass, Silvia. She would only tell me it is two degrees off.'
          },
          onRight: givePebble
        });
      }

      // ---- The reward: the disc set true and the first truth, the vow, the star, the Ledger lines and glyphs, what the satchel gave ----
      const reward = { box: null, back: null, timer: 0 };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      function rewardDisc() {
        let out = '';
        [52, 40, 28, 16].forEach((r) => { out += '<circle class="oracle-rw-ring" cx="0" cy="0" r="' + r + '"/>'; });
        for (let k = 0; k < 8; k++) { const [x1, y1] = at(k + 0.5, 16), [x2, y2] = at(k + 0.5, 52); out += '<line class="oracle-rw-spoke" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>'; }
        for (let k = 0; k < 8; k++) for (let ring = 0; ring < 3; ring++) {
          const [x, y] = at(k, R[ring]);
          out += '<text class="oracle-rw-letter" style="--t:' + (0.8 + (k * 3 + ring) * 0.09).toFixed(2) + 's" x="' + x.toFixed(1) + '" y="' + (y + 2.2).toFixed(1) + '">' + RINGS[ring][k] + '</text>';
        }
        return '<svg viewBox="-58 -58 116 116" role="img" aria-label="The brass disc of 24 sightings set true: December eighteen to twenty">' + out + '<circle class="oracle-rw-jewel" cx="0" cy="0" r="7"/></svg>';
      }
      function showReward() {
        clearTimeout(reward.timer);
        const body = modal.querySelector('.chasm3d-body');
        if (!body || !isDone() || !modalOpen()) return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward oracle-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', "Your reward for the Oracle's Horizon");
          reward.box.hidden = true;
          body.appendChild(reward.box);
          reward.box.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast'); });
          reward.box.addEventListener('click', (e) => {
            const relic = e.target.closest && e.target.closest('[data-relic]');
            if (relic && typeof window.openItemAcquiredModal === 'function') { justWon = false; relic.classList.remove('is-new'); window.openItemAcquiredModal({ id: relic.getAttribute('data-relic') }); }
          });
        }
        const num = (k) => parseInt(get(k) || '0', 10) || 0;
        const vowFails = num(KEYS.vowFails);
        const words = VOW.map((w, i) => '<span class="drw-word" style="--t:' + (3.9 + i * 0.28).toFixed(2) + 's">' + w + '</span>').join(' ');
        const gave = [];
        if (get(KEYS.key)) gave.push(['item_servant_key.webp', "The Servant's Key", get(KEYS.key) === 'turned' ? 'It turned in the lock of the inner stair.' : 'Back on the old man’s ring.']);
        if (get(KEYS.lamp) === 'lit') gave.push(['item_founders_lamp.png', "The Founders' Lamp", 'It burns on the last step of the inner stair.']);
        if (get(KEYS.coin) === 'set') gave.push(['item_servant_coin.png', "The Servant's Coin", 'Set in the Oracle’s door.']);
        if (get(KEYS.pebble) === 'given') gave.push(['item_tuning_pebble.png', 'The Tuning Pebble', 'Back in her hands.']);
        const spent = gave.length ? '<div class="rw-label drw-label">The satchel gave</div><ul class="drw-spent">' + gave.map((g) => '<li><img src="./assets/items/' + g[0] + '" alt=""><span><b>' + g[1] + '</b>' + g[2] + '</span></li>').join('') + '</ul>' : '';
        const glyphs = $('oracle-glyph-src');
        reward.box.innerHTML = '<div class="rw-rays" aria-hidden="true"></div>'
          + '<div class="rw-sparks" aria-hidden="true">' + Array.from({ length: 18 }, (_, i) => '<i style="--a:' + ((i * 360 / 18) | 0) + 'deg;--d:' + (120 + (i % 5) * 36) + 'px;--t:' + (0.9 + (i % 4) * 0.2).toFixed(2) + 's"></i>').join('') + '</div>'
          + '<div class="chasm3d-reward-card">'
          + "<div class=\\"chasm3d-reward-kicker\\">Station 19 · The Oracle's Horizon</div>"
          + '<h3 class="chasm3d-reward-title">The Oracle Remembers</h3>'
          + '<p class="rw-sub">The horizon was sealed, the disc told the first truth, and Hermes said the vow. She lifted the veil herself: Aurelia, alive.</p>'
          + '<div class="rw-grid">'
          + '<section class="rw-map oracle-rw-map" aria-label="The disc of 24 sightings, set true">'
          + '<div class="rw-label">The disc of 24 sightings</div>'
          + rewardDisc()
          + '<div class="oracle-rw-when">The First Truth · the WHEN<strong>18 – 20 December</strong></div>'
          + '<div class="drw-words" aria-label="You were always the treasure">' + words + '</div>'
          + '<div class="chasm3d-reward-stats">'
          + '<div><b>' + num(KEYS.turns) + '</b><span>turns of the rings</span></div>'
          + '<div><b>' + num(KEYS.readFails) + '</b><span>misreadings</span></div>'
          + '<div><b>' + (vowFails + 1) + '</b><span>tries at the vow</span></div>'
          + '<div><b>' + (num(KEYS.fails) + 1) + '</b><span>sigil tries</span></div>'
          + '</div>'
          + (vowFails === 0 ? '<div class="rw-flawless">✦ The vow, at the first breath ✦</div>' : '')
          + '</section>'
          + '<section class="rw-loot">'
          + '<div class="drw-relics">'
          + '<button type="button" class="drw-relic' + (justWon ? ' is-new' : '') + '" data-relic="gilded_star" aria-label="The Gilded Star: open the card"><span class="drw-pic"><img src="./assets/items/item_gilded_star.webp" alt="" width="140" height="140"></span><span class="drw-name"><b>The Gilded Star</b><small>She painted it for you</small></span></button>'
          + '</div>'
          + '<div class="drw-eqs">'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Scratched on the back of the disc</div><div class="rw-ledger-title">In a hand Hermes knows</div><div class="rw-eq" aria-label="I plus E equals 12"><i>I</i><u>+</u><i>E</i><u>=</u><b>12</b></div><p>A line for your Cipher Ledger.</p></div></div>'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Beneath it, the same hand</div><div class="rw-ledger-title">The Shared Cell</div><div class="rw-eq" aria-label="I plus J equals 18"><i>I</i><u>+</u><i>J</i><u>=</u><b>18</b></div><p>Both lines are now in your Ledger.</p></div></div>'
          + '</div>'
          + '<div class="rw-label drw-label">Two new glyphs for your alphabet</div>'
          + '<div class="oracle-rw-glyphs">' + (glyphs ? glyphs.innerHTML : '') + '</div>'
          + spent
          + '<div class="rw-next">Next · From the Desert to the Stage</div>'
          + '</section></div>'
          + '<div class="chasm3d-reward-actions">'
          + '<button type="button" class="chasm3d-reward-wire">✦ From the Desert to the Stage</button>'
          + '<button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay with them</button>'
          + '</div></div>';
        if (!rewardOpen()) reward.back = document.activeElement;
        reward.box.hidden = false;
        reward.box.scrollTop = 0;
        reward.box.classList.remove('is-fast', 'is-on');
        void reward.box.offsetWidth;
        reward.box.classList.add('is-on');
        if (!cue('shimmer', { deg: 21 }) && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        const goBtn = reward.box.querySelector('.chasm3d-reward-wire'), stayBtn = reward.box.querySelector('.chasm3d-reward-stay');
        if (goBtn) goBtn.addEventListener('click', () => { hideReward(true); leaveForStage(); });
        if (stayBtn) stayBtn.addEventListener('click', () => hideReward());
        if (goBtn) goBtn.focus({ preventScroll: true });
      }
      function hideReward(quietly) {
        clearTimeout(reward.timer);
        if (!rewardOpen()) return;
        reward.box.hidden = true;
        const back = reward.back; reward.back = null;
        if (quietly) return;
        const to = back && document.contains(back) && back.offsetParent ? back : el.rewardBtn;
        if (to && to.focus) to.focus({ preventScroll: true });
      }"""),
("""        say("OVERTURE... and the door opened, Silvia. The chamber is round, with an opening in the roof and a beam of grey light on a stone altar. She is there. Veiled, in a worn hooded robe, standing very still. She has not said a word. She is holding up a brass disc, Silvia. My disc. Twenty-four sightings, three rings. She turns it toward me as if she wanted me to read it, and its rings are all crooked.");""",
 """        say("OVERTURE, and the door sank into the floor, Silvia. A round chamber, a beam of grey light on a stone altar. She is there: veiled, hooded, very still, without a word. She is holding up a brass disc. My disc: twenty-four sightings, three rings. She turns it toward me to be read, and its rings are all crooked.");"""),
("""        if (el.victory) el.victory.style.display = done ? '' : 'none';
        // the panel shows the part she is in; the scene shows the rest
        if (el.discGame) el.discGame.style.display = done ? 'none' : '';""", """        if (el.victory) el.victory.style.display = done ? '' : 'none';
        if (el.coinBtn) el.coinBtn.hidden = !coinWaits();
        if (el.pebbleBtn) el.pebbleBtn.hidden = !pebbleWaits();
        // the sigil waits until Hermes has come down the inner stair
        if (el.keyInput && !awake) el.keyInput.disabled = !stairDone();
        if (el.speak && !awake) el.speak.disabled = !stairDone();
        if (el.stairBtn) el.stairBtn.hidden = awake || stairDone();
        // the panel shows the part she is in; the scene shows the rest
        if (el.discGame) el.discGame.style.display = done ? 'none' : '';"""),
("""      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden);""",
 """      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden) || !!(window.RelicUse && window.RelicUse.isOpen());"""),
("""      if (el.unsay) el.unsay.addEventListener('click', unsay);
      if (el.vow) el.vow.addEventListener('click', speakVow);""", """      if (el.unsay) el.unsay.addEventListener('click', unsay);
      if (el.vow) el.vow.addEventListener('click', speakVow);
      if (el.coinBtn) el.coinBtn.addEventListener('click', askCoin);
      if (el.pebbleBtn) el.pebbleBtn.addEventListener('click', askPebble);
      if (el.stairBtn) el.stairBtn.addEventListener('click', stairChain);
      if (el.rewardBtn) el.rewardBtn.addEventListener('click', showReward);
      if (window.RelicUse) {
        // the Use button of the satchel
        window.RelicUse.register('servant_coin', () => { if (!modalOpen() || !coinWaits()) return false; setCoin(); return true; });
        window.RelicUse.register('tuning_pebble', () => { if (!modalOpen() || !pebbleWaits()) return false; givePebble(); return true; });
      }"""),
("""      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }""", """      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
        if (!stairDone()) setTimeout(stairChain, 500);
      }"""),
("""          else toast('Hermes is waiting for dawn by the inner stair. Open the Cliffside Workshop: he will wire you before he goes down.');
          return;
        }""", """          else toast('Hermes is waiting for dawn by the inner stair. Open the Cliffside Workshop: he will wire you before he goes down.');
          return;
        }
        if (modalOpen()) return;"""),
("""        else if (!isAwake()) say("Silvia, I am at the bottom of the inner stair, with the Servant's key in my hand. The door is a slab of sandstone carved with a horizon: three mirrors and eight small sockets. The Servant says it opens only for the sigil of the Oracle. Open the page “The Oracle's Horizon”, please. I can hear someone humming behind it." + coinNote());""",
 """        else if (!isAwake() && !stairDone()) say(get(KEYS.key)
          ? "The door is open, Silvia, and the stair goes down into the dark. The Servant's lamp lights only the first steps."
          : "Silvia, the Servant has led me to a door at the back of the atrium: the inner stair. It is locked, and he is watching my hands.");
        else if (!isAwake()) say(ARRIVE + (RU() ? coinLine() : coinNote()));"""),
("""          if (get(HOWTO_KEY) !== 'seen' && !isDone()) { showHowto(0); return; }
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
        if (cine && cine.active) cine.skip();""", """          if (get(HOWTO_KEY) !== 'seen' && !isDone()) { showHowto(0); return; }
          const target = focusTarget();
          if (target) setTimeout(() => { if (modal.style.display !== 'none') target.focus({ preventScroll: true }); }, 60);
          if (!stairDone()) setTimeout(stairChain, 900);
        };
        lastT = 0;
        cancelAnimationFrame(raf);
        if (G) raf = requestAnimationFrame(frame);
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          cineClosed = false;
          cine.start(openingShots(), () => { if (!cineClosed) set(CINE_INTRO, 'seen'); finishOpen(); });
        } else finishOpen();
      }
      // The passage to the Stage plays once, however she leaves the chamber after the vow
      function closeOracleModal(opts) {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        stopPulse();
        hideReward(true);
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();
        if (isDone() && get(KEYS.passage) !== 'true' && !(opts && opts.noPassage)) setTimeout(showStagePassage, 300);
        if (cine && cine.active) { cineClosed = true; cine.skip(); }"""),
("""      if (el.close) el.close.addEventListener('click', closeOracleModal);""",
 """      if (el.close) el.close.addEventListener('click', () => closeOracleModal());"""),
("""        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeOracleModal();
      }, true);""", """        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        if (rewardOpen() && (!$('modal-item-acquired') || $('modal-item-acquired').style.display === 'none')) { e.stopImmediatePropagation(); hideReward(); return; }
        closeOracleModal();
      }, true);"""),
("""      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeOracleModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (get(KEYS.passage) !== 'true') showStagePassage();
          else if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ The Desert Path is complete ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
        });
      }""", """      // the Gilded Star's card first (when she has just won it), then the passage to the Stage, once
      function leaveForStage() {
        closeOracleModal({ noPassage: true });
        const go = () => {
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (get(KEYS.passage) !== 'true') showStagePassage();
          else if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ The Desert Path is complete ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
        };
        if (justWon && typeof window.openItemAcquiredModal === 'function') { justWon = false; setTimeout(() => window.openItemAcquiredModal({ id: 'gilded_star' }, go), 260); }
        else go();
      }
      if (el.finish) el.finish.addEventListener('click', leaveForStage);"""),
("""        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          return {
            gl: true, phase: view.phase,""", """        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        showReward: () => showReward(), rewardOpen: () => rewardOpen(),
        relics: () => ({ key: get(KEYS.key), lamp: get(KEYS.lamp), coin: get(KEYS.coin), pebble: get(KEYS.pebble), stairDone: stairDone() }),
        stair: () => stairChain(),
        world: () => {
          if (!G) return { gl: false };
          return {
            gl: true, phase: view.phase,"""),
("""        hint: $('oracle-hint'), victory: $('oracle-victory'), victoryText: $('oracle-victory-text'), finish: $('btn-oracle-finish'), dispatch: $('oracle-dispatch-text'),""",
 """        hint: $('oracle-hint'), victory: $('oracle-victory'), victoryText: $('oracle-victory-text'), finish: $('btn-oracle-finish'), dispatch: $('oracle-dispatch-text'),
        rewardBtn: $('btn-oracle-reward'), coinBtn: $('btn-oracle-coin'), pebbleBtn: $('btn-oracle-pebble'), stairBtn: $('btn-oracle-stair'),"""),
])

# index.html: the page pill, the tray buttons, the small done row, and the glyphs kept for the reward
p = 'web/index.html'
s = open(p).read()
m = re.search(r'            <div class="laby3d-eqs oracle-glyphs">\n(.*?)\n            </div>\n', s, re.S)
assert m, 'glyphs'
glyphs = m.group(1)
a = s.index('          <div class="chasm-victory-card" id="oracle-victory" style="display: none;">')
b = s.index('          <button type="button" class="chasm3d-btn chasm3d-help" id="btn-oracle-howto"')
new = """          <div class="drw-done" id="oracle-victory" style="display: none;">
            <div class="drw-done-title">✦ She remembers</div>
            <div class="oracle-when">The First Truth · the WHEN<strong>18 – 20 December</strong></div>
            <button type="button" class="chasm3d-btn chasm3d-again" id="btn-oracle-reward">🏆 See your reward</button>
            <button type="button" class="btn-chasm-finish" id="btn-oracle-finish"><span>✦ From the Desert to the Stage ➔</span></button>
          </div>
          <!-- the two glyphs she wins here, drawn once: the reward screen shows them (s19-oracle-horizon.js showReward) -->
          <div id="oracle-glyph-src" hidden>
""" + glyphs + """
          </div>
"""
s = s[:a] + new + s[b:]
open(p, 'w').write(s)
R(p, [
("""          <div class="laby3d-sigil" id="oracle-sigil-card">
            <div class="chasm3d-where">I · The sigil of the Oracle: send the eight beacons across the three mirrors of the page “The Oracle's Horizon”</div>""",
 """          <div class="laby3d-sigil" id="oracle-sigil-card">
            <div class="station-page-pill">Your page: <span class="journal-ref-pill" role="button" tabindex="0" data-sheet="18A" data-open="page" aria-haspopup="dialog" title="See the printed page The Oracle's Horizon"><span class="pill-icon">📖</span> The Oracle's Horizon</span></div>
            <div class="chasm3d-where">I · The sigil of the Oracle: send the eight beacons across the three mirrors of the page “The Oracle's Horizon”</div>"""),
("""            <button type="button" class="chasm3d-btn is-way" id="btn-oracle-speak">✦ Speak the Sigil</button>""",
 """            <button type="button" class="chasm3d-btn is-way" id="btn-oracle-speak">✦ Speak the Sigil</button>
            <button type="button" class="chasm3d-btn relic-ask-btn" id="btn-oracle-stair" hidden>🎒 Help Hermes down the inner stair</button>
            <button type="button" class="chasm3d-btn relic-ask-btn" id="btn-oracle-coin" hidden>🎒 Hand Hermes something for the hollow disc</button>"""),
("""                <button type="button" class="chasm3d-btn is-way" id="btn-oracle-vow">✦ Let Hermes say it</button>
              </div>""", """                <button type="button" class="chasm3d-btn is-way" id="btn-oracle-vow">✦ Let Hermes say it</button>
              </div>
              <button type="button" class="chasm3d-btn relic-ask-btn" id="btn-oracle-pebble" hidden>🎒 Give her something of hers</button>"""),
])
print('done')
