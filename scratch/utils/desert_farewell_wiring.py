"""One-off (19 Nov 2026): the end of the Desert Path moves after Hermes's last talk from Tower II. Station 19 now leads to the Field
Wire; closing Chapter III first plays the farewell at the gates, the road walked and the curtain (desert-farewell.js); the old card
"From the Desert to the Stage" is gone; the Stage Path appears on the map when the farewell is done. Run from the repo root."""
import re
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

F = 'web/hub/js/desert-farewell.js'
R(F, [
("      var box = null, backFocus = null;\n", "      var box = null;\n"),
("        backFocus = document.activeElement;\n        box.hidden = false;", "        box.hidden = false;"),
("        setTimeout(function () { try { go.focus({ preventScroll: true }); } catch (e) {} }, 80);\n        if (fast()) setTimeout(function () { if (!go.disabled) go.click(); }, 60);\n",
 "        setTimeout(function () { try { go.focus({ preventScroll: true }); } catch (e) {} }, 80);\n"),
])

# ---- the Field Wire: closing Chapter III plays the farewell first ----
H = 'web/hub/js/hub-core.js'
R(H, [
("""          if (mapB) mapB.hidden = true;
          if (tx) tx.textContent = 'Close the chapter ➔';
          if (cerB) {
            cerB.hidden = false;
            cerB.onclick = () => {
              if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
              cerB.disabled = true;
              window.WireCeremony.open(step, wireCeremonyContext(step), () => { cerB.disabled = false; wireCloseChapter(step); renderWireChoices(); });
            };
          }""", """          if (mapB) mapB.hidden = true;
          // The Desert Path ends with a scene of its own before the book of the chapter closes (hub/js/desert-farewell.js)
          const farewell = step === 33 && window.DesertFarewell && window.DesertFarewell.pending();
          if (farewell) showWaypointBar('Dawn at the gates of Tower II', 'Hermes and Aurelia leave for the third tower at first light, and the Servant has come to the bronze doors. Be there to say goodbye.', wireCurrentStep);
          if (tx) tx.textContent = farewell ? '🌅 Dawn at the gates ➔' : 'Close the chapter ➔';
          if (cerB) {
            cerB.hidden = false;
            cerB.onclick = () => {
              if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
              const ceremony = () => { cerB.disabled = true; window.WireCeremony.open(step, wireCeremonyContext(step), () => { cerB.disabled = false; wireCloseChapter(step); renderWireChoices(); }); };
              if (step === 33 && window.DesertFarewell && window.DesertFarewell.pending()) window.DesertFarewell.open(ceremony);
              else ceremony();
            };
          }"""),
("""                'order_oracle_howto', 'order_oracle_cine_intro', 'order_oracle_cine_outro', 'order_oracle_key', 'order_oracle_lamp', 'order_oracle_coin', 'order_oracle_pebble']);""",
 """                'order_oracle_howto', 'order_oracle_cine_intro', 'order_oracle_cine_outro', 'order_oracle_key', 'order_oracle_lamp', 'order_oracle_coin', 'order_oracle_pebble',
                'order_desert_farewell', 'order_desert_farewell_pending']);"""),
("""                if (get('order_oracle_coin') === 'set') RU.unspend('servant_coin', true);""",
 """                if (get('order_oracle_coin') === 'set') RU.unspend('servant_coin', true);
                if (/"flint":true/.test(get('order_desert_farewell') || '')) RU.unspend('flint_tinder', true);"""),
])

# ---- the map: Path III waits for the farewell ----
R('web/hub/js/stations/s10-desert-map-and-chasm.js', [
("""        const stageOpen = done('order_oracle_horizon_completed');""",
 """        // (a journey that won Station 19 with the farewell still to come sees it only once Hermes and Aurelia have left Tower II)
        const stageOpen = done('order_oracle_horizon_completed') && !(window.DesertFarewell && window.DesertFarewell.pending());"""),
])

# ---- Station 19: out to the Field Wire; the passage card is gone ----
J = 'web/hub/js/stations/s19-oracle-horizon.js'
s = open(J).read()
a = s.index("      // ---- From the desert to the stage (once) ----")
b = s.index("      // the Gilded Star's card first (when she has just won it), then the passage to the Stage, once")
s = s[:a] + s[b:]
open(J, 'w').write(s)
R(J, [
("""      // the Gilded Star's card first (when she has just won it), then the passage to the Stage, once
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
      if (el.finish) el.finish.addEventListener('click', leaveForStage);""",
 """      // the Gilded Star's card first (when she has just won it), then straight to Hermes on the Field Wire:
      // the Desert Path ends there, with the farewell at the gates (hub/js/desert-farewell.js)
      function leaveForWire() {
        closeOracleModal();
        const go = () => {
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          const wireTab = document.querySelector('[data-view="view-field-wire"]');
          if (wireTab) wireTab.click();
          if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ The first truth is yours ✦ Hermes is waiting for you on the Field Wire.');
        };
        if (justWon && typeof window.openItemAcquiredModal === 'function') { justWon = false; setTimeout(() => window.openItemAcquiredModal({ id: 'gilded_star' }, go), 260); }
        else go();
      }
      if (el.finish) el.finish.addEventListener('click', leaveForWire);"""),
("""      // The passage to the Stage plays once, however she leaves the chamber after the vow
      function closeOracleModal(opts) {""", """      function closeOracleModal() {"""),
("""        if (isDone() && get(KEYS.passage) !== 'true' && !(opts && opts.noPassage)) setTimeout(showStagePassage, 300);
""", ""),
("""        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (el.passage && el.passage.style.display !== 'none' && el.passage.style.display !== '') return;
""", """        if (e.key !== 'Escape' || modal.style.display === 'none') return;
"""),
("""        justWon = true;
        // once she has lifted the veil, a short film closes the Desert Path (the first time), and then the reward rises""",
 """        justWon = true;
        // the Desert Path is not over yet: its last scene, the farewell at the gates, waits behind Hermes's talk on the Field Wire
        if (window.DesertFarewell) window.DesertFarewell.markPending();
        // once she has lifted the veil, a short film closes the station (the first time), and then the reward rises"""),
("""          + '<div class="rw-next">Next · From the Desert to the Stage</div>'""", """          + '<div class="rw-next">Next · Hermes on the Field Wire</div>'"""),
("""          + '<button type="button" class="chasm3d-reward-wire">✦ From the Desert to the Stage</button>'""",
 """          + '<button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>'"""),
("""        if (goBtn) goBtn.addEventListener('click', () => { hideReward(true); leaveForStage(); });""",
 """        if (goBtn) goBtn.addEventListener('click', () => { hideReward(true); leaveForWire(); });"""),
("""        passage: 'order_stage_passage_seen',
""", ""),
])
s = open(J).read()
s2 = re.sub(r",?\n        passage: \$\('stage-passage-overlay'\), passageClose: \$\('btn-stage-passage-close'\)", "", s)
assert s2 != s, 'el.passage'
s2 = s2.replace("    // Reward: the WHEN, two Ledger equations, the Gilded Star, and the passage to the Stage Path.", "    // Reward: the WHEN, two Ledger equations and the Gilded Star. The Desert Path ends afterwards, on the Field Wire (desert-farewell.js).")
open(J, 'w').write(s2)

# ---- index.html: the new files, the button of Station 19, and no passage card ----
p = 'web/index.html'
s = open(p).read()
a = s.index("  <!-- From the desert to the stage (shown once, after the audience with the Oracle) -->")
b = s.index("  <!-- The five seals come home (shown once, whenever the fifth seal joins the satchel) -->")
s = s[:a] + s[b:]
open(p, 'w').write(s)
R(p, [
("""            <button type="button" class="btn-chasm-finish" id="btn-oracle-finish"><span>✦ From the Desert to the Stage ➔</span></button>""",
 """            <button type="button" class="btn-chasm-finish" id="btn-oracle-finish"><span>📻 To Hermes on the Field Wire ➔</span></button>"""),
("""  <link rel="stylesheet" href="./hub/css/relic-use.css">""", """  <link rel="stylesheet" href="./hub/css/relic-use.css">
  <link rel="stylesheet" href="./hub/css/desert-farewell.css">"""),
("""  <script src="./hub/js/relic-use.js"></script>
""", """  <script src="./hub/js/relic-use.js"></script>
  <script src="./hub/js/desert-farewell.js"></script>
"""),
])

# ---- the words around it ----
R('web/hub/js/wire-ceremony.js', [
("""          'Then came the inner stair, the five seals laid in their places, and a name the desert had not heard since 1971.',""",
 """          'At dawn the five seals went home in the arch, the inner stair opened, and the desert heard a name it had not heard since 1971.',"""),
])
R('web/hub/js/wire-script-tower.js', [
("""      "The gold stars, the lapis blue, the pebble in the pillar: hers too. I waited fifty-five years for this hour, and I do not know what to do with it.\"""",
 """      (ls('order_oracle_pebble') === 'given'
        ? "The gold stars, the lapis blue, the pebble you gave back to her: all hers."
        : "The gold stars, the lapis blue, the pebble in the pillar: hers too.") + " I waited fifty-five years for this hour, and I do not know what to do with it.\""""),
])
R('web/hub/js/wire-script-stage.js', [
("""  const clean = (list) => list.filter(Boolean);
""", """  const clean = (list) => list.filter(Boolean);
  // how she had them say goodbye at the gates of Tower II (hub/js/desert-farewell.js): { veil, cord, compass, flint }
  const farewell = () => { try { return JSON.parse(localStorage.getItem('order_desert_farewell') || '{}') || {}; } catch (e) { return {}; } };
"""),
("""        "The raiders have a day’s start and the Astrolabe, and their ruts run east, to Tower III: the Stage Tower, and the Mirror Speaker’s truth. The WHERE.",
        { ask: [
          { text: "Did you sleep at all?",""", """        farewell().veil ? "Aurelia walks bare-headed this morning. The veil is folded in the Servant’s hands, and she has not once looked back for it." : null,
        farewell().compass ? "And my compass reads true for the first time in twenty-eight years. I keep taking it out to look." : null,
        "The raiders have a day’s start and the Astrolabe, and their ruts run east, to Tower III: the Stage Tower, and the Mirror Speaker’s truth. The WHERE.",
        { ask: [
          { text: "Did you sleep at all?","""),
])
print('done')
