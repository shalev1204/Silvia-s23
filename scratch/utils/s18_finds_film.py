"""One-off (19 Nov 2026): Station 18 gets three hidden finds in the burning atrium (checked by
scratch/verifications/s18_finds/finds_solver.py), a way back through the fire for the ones she missed, a closing film before the
reward, and lines on the Field Wire that remember what Hermes found. Run from the repo root."""
import re
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

J = 'web/hub/js/stations/s18-polybius-stele.js'
# 1. while she sends him back through the fire, the station is "not over" for everything that draws or moves the crossing
s = open(J).read()
lines = s.split('\n')
MARKS = ["const showTurns = get(KEYS.fireHint)", "const st = isDone() ? (IGNITE.has", "fill: isDone() ? '#0d0805'", "              if (!isDone()) {",
         "const hx = run && fireOpen() && !isDone()", "const hy = run && fireOpen() && !isDone()", "const where = fireOpen() && !isDone() && run",
         "if (!fireOpen() || isDone() || !run || hatchPending", "const awake = isAwake(), done = isDone(), k = knocksDone(), open = fireOpen();",
         "        if (isDone()) k = 0.6;", "const canWalk = () =>", "        if (isDone()) return view.endFireT;",
         "if (isDone()) return e < 0.7 ?", "hintOn = get(KEYS.fireHint) === 'true' && fireOpen() && !isDone();",
         "const on = canWalk() || (run && fireOpen() && !isDone() && busyOverlay());", "        if (isDone() || view.ending) return 'end';",
         "const t = now / 1000, rm = reduced(), done = isDone(), lp", "if (modal.style.display === 'none' || !fireOpen() || isDone() || busyOverlay()) return;",
         "if (e.key === ' ' && modal.style.display !== 'none' && fireOpen() && !isDone()", "          if (!run || !fireOpen() || isDone()) return;",
         "        if (isDone()) return el.finish;"]
for m in MARKS:
    hit = [i for i, l in enumerate(lines) if m in l]
    assert len(hit) == 1, (m, len(hit))
    lines[hit[0]] = lines[hit[0]].replace('isDone()', 'over()')
open(J, 'w').write('\n'.join(lines))

R(J, [
("""      const HOWTO_KEY = 'order_stele_howto', CINE_INTRO = 'order_stele_cine_intro';""",
 """      const HOWTO_KEY = 'order_stele_howto', CINE_INTRO = 'order_stele_cine_intro', CINE_OUTRO = 'order_stele_cine_outro';"""),
("""        trail: 'order_stele_trail'      // the road he took across the fire, for the reward: { p: [[x, y], ...], t: turns }""",
 """        trail: 'order_stele_trail',     // the road he took across the fire, for the reward: { p: [[x, y], ...], t: turns }
        finds: 'order_stele_finds'      // what he picked up in the atrium: ids of FINDS"""),
("""      const COLS = 9, ROWS = 9;""", """      const COLS = 9, ROWS = 9;
      // Three things the fire has not taken lie on the flagstones, each under a glint. None is needed to save the Servant.
      // scratch/verifications/s18_finds/finds_solver.py checks them: the spectacles are on every shortest crossing (13 turns),
      // the watch-book and the fire-pot each cost the two spare turns (15), and no crossing can take both: the third needs a second crossing.
      const FINDS = [
        { id: 'glasses', at: [4, 1], icon: '👓', name: 'The Servant’s spectacles', where: 'the bare stone between the columns',
          sub: 'On the bare stone, a pair of round spectacles, one lens cracked.',
          say: 'Spectacles, Silvia, on the bare stone, one lens cracked. He ran this way, then, toward the well. They are in my pocket.' },
        { id: 'watchbook', at: [3, 0], icon: '📓', name: 'The Servant’s watch-book', where: 'the ash under the north wall',
          sub: 'Under the ash, a small iron box, warm to the touch. Inside it, a watch-book in a tiny hand.',
          say: 'An iron box under the ash, Silvia, and in it his watch-book: fifty years of dawns in a tiny hand. I opened it at one page. October 1998: “A surveyor on the north ridge at dusk. He did not come down. He will.”' },
        { id: 'firepot', at: [8, 1], icon: '🏺', name: 'The Ashes’ fire-pot', where: 'the corner beyond the well',
          sub: 'In the corner, an iron pot of pitch that never broke. A ring is burnt into its side.',
          say: 'An iron pot of pitch, Silvia, still corked: it rolled into this corner and never broke. A ring is burnt into its side, the mark of the Ashes. They brought this fire with them.' }
      ];"""),
("""      let hatchPending = false; // Hermes is at the hatch and the satchel's tray is open""",
 """      let hatchPending = false; // Hermes is at the hatch and the satchel's tray is open
      let replay = false;       // she sent him back through the fire for what he missed
      const over = () => isDone() && !replay;
      const readFinds = () => { try { const l = JSON.parse(get(KEYS.finds) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
      const hasFind = (id) => readFinds().indexOf(id) >= 0;
      const findAt = (x, y) => FINDS.find((f) => f.at[0] === x && f.at[1] === y) || null;"""),
# the 2D map: a glint on every find still lying there
("""        const where = fireOpen() && !over() && run ? 'Hermes is on row '""", """        if (fireOpen() && !over()) FINDS.forEach((f) => {
          if (hasFind(f.id)) return;
          const g = svgEl('text', { class: 'stele-glint', x: cx(f.at[0]), y: cy(f.at[1]) + 1.6, 'text-anchor': 'middle', 'font-size': 5, fill: '#fde68a' });
          g.textContent = '✧';
          svg.appendChild(g);
        });
        const where = fireOpen() && !over() && run ? 'Hermes is on row '"""),
("""        if (run.x === ATRIUM.hatch[0] && run.y === ATRIUM.hatch[1]) { reachHatch(); return; }""",
 """        pickUp();
        if (run.x === ATRIUM.hatch[0] && run.y === ATRIUM.hatch[1]) { if (replay) endReplay(true); else reachHatch(); return; }"""),
("""      function lose(why) {
        const fails = (parseInt(get(KEYS.fireFails) || '0', 10) || 0) + 1;""", """      function pickUp() {
        const f = findAt(run.x, run.y);
        if (!f || hasFind(f.id)) return false;
        const list = readFinds(); list.push(f.id);
        set(KEYS.finds, JSON.stringify(list));
        cue('bell', { f: 659.25 * Math.pow(2, list.length / 12), v: 0.09, len: 2.4 });
        cue('shimmer', { deg: 10 + list.length * 3 });
        say(f.say);
        subtitle(f.sub, 6, 'act');
        if (G && G.fx) { G.fx.triumph({ x: wx(run.x), y: 0.8, z: wz(run.y) }, 0.5); if (G.fx.gait) G.fx.gait.react('wonder'); }
        feedback(el.moveFeedback, '✧ ' + f.name + ' (' + list.length + ' of ' + FINDS.length + ')', 'ok');
        return true;
      }
      function lose(why) {
        if (replay) {   // a second crossing costs nothing: no fail is counted and no note is opened
          syncWorld();
          sceneLose(why);
          run = newRun();
          cue(why === 'fire' ? 'crack' : 'dusk', { v: 0.28 });
          feedback(el.moveFeedback, why === 'fire' ? 'The fire reached Hermes. He fell back to the side door.' : 'The smoke is too thick. Hermes went back to the side door for air.', 'error');
          say(why === 'fire' ? "Singed again, Silvia. The fire runs the same channels as before: once more." : "No air left in here, Silvia. I am back at the side door. Once more, and faster.");
          render();
          return;
        }
        const fails = (parseInt(get(KEYS.fireFails) || '0', 10) || 0) + 1;"""),
# the closing film, then the reward
("""        justWon = true;
        // the reward rises once the Servant has come up out of the well
        clearTimeout(reward.timer);
        reward.timer = setTimeout(showReward, G && !reduced() ? 9600 : 700);
      }""", """        justWon = true;
        // once the Servant has come up out of the well, a short film closes the night (the first time), and then the reward rises
        clearTimeout(reward.timer);
        const film = !!(G && cine && !reduced() && get(CINE_OUTRO) !== 'seen');
        reward.timer = setTimeout(() => { if (film) outro(showReward); else showReward(); }, G && !reduced() ? 9600 : 700);
      }
      function endingShots() {
        return [
          { from: { p: [HATCH.x - 3.4, 2.3, HATCH.z + 4.6], l: [HATCH.x - 0.3, 1.1, HATCH.z + 0.9] }, to: { p: [HATCH.x - 2.3, 1.8, HATCH.z + 3.4], l: [HATCH.x - 0.2, 1.15, HATCH.z + 0.9] }, dur: 5,
            kicker: 'STATION 18', title: 'THE WELL OF TOWER II', line: 'On the rim of the old well the Servant holds the charts against his chest, and breathes.' },
          { from: { p: [0, 24, 20], l: [0, 0, -1] }, to: { p: [-2, 33, 13], l: [-2, 0, 0] }, dur: 6, line: 'Behind them the library burns down to its stone shelves. By morning the fire will have nothing left to eat.' },
          { from: { p: [STELE.x - 3.8, 2.9, STELE.z + 5.8], l: [STELE.x, 1.7, STELE.z] }, to: { p: [STELE.x - 2.1, 2.2, STELE.z + 4.1], l: [STELE.x, 1.65, STELE.z] }, dur: 5.5,
            line: 'And the stele stands where the founders set it, black with soot and whole, its back to the room: 348°, north-north-west.' }
        ];
      }
      function outro(then) {
        if (modal.style.display === 'none' || modal.classList.contains('closing') || !isDone()) return;
        set(CINE_OUTRO, 'seen');
        cue('whoosh', { dur: 1.6 });
        cine.start(endingShots(), () => {
          if (el.subtitle) el.subtitle.classList.remove('is-on');
          view.snapNext = true;
          if (modal.style.display !== 'none' && !modal.classList.contains('closing')) then();
        }, { fade: true });
      }

      // ---- Back through the fire, for what he missed (after the Servant is safe) ----
      function startReplay() {
        if (!isDone() || replay || (cine && cine.active)) return;
        hideReward(true);
        replay = true; hatchPending = false;
        view.ending = 0; view.endFireT = null; view.freeze = false; view.snapNext = true;
        view.endTimers.forEach(clearTimeout); view.endTimers = [];
        run = newRun();
        if (G) { G.cam.p = null; G.hGoal = null; G.hMove = null; }
        const left = FINDS.filter((f) => !hasFind(f.id));
        say(left.length ? 'Back through the side door, Silvia. The draught has thrown the fire over the mats again, and it runs the same channels. Somewhere in there is still ' + left.map((f) => f.where).join(', and ') + '.'
          : 'Back through the side door, Silvia, for the pleasure of beating it once more. The fire runs the same channels.');
        subtitle('The Servant is safe by the well. Hermes ties his scarf over his mouth and goes back to the side door.', 5, 'act');
        feedback(el.moveFeedback, 'Hermes stands at the side door again. A glint shows what the fire has not taken.', '');
        render();
        if (el.pad.up) setTimeout(() => el.pad.up.focus({ preventScroll: true }), 60);
      }
      function endReplay(reached) {
        if (!replay) return;
        replay = false; hatchPending = false;
        view.ending = 0; view.endFireT = null; view.freeze = false; view.snapNext = true;
        const got = FINDS.filter((f) => hasFind(f.id)).length;
        if (reached) { cue('whoosh', { dur: 1.2 }); if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime(); }
        say(got === FINDS.length ? 'Back at the well, Silvia, and the fire has nothing left to give: all three finds are in my pockets.'
          : reached ? 'Back at the well, Silvia. He counted my fingers, to see that I had come back with all of them.' : 'Enough fire for one night, Silvia. I am back at the well.');
        feedback(el.moveFeedback, '', '');
        render();
        clearTimeout(reward.timer);
        reward.timer = setTimeout(showReward, reached ? 900 : 250);
      }"""),
# the reward: the finds on the map and in a strip, and the way back for the missing ones
("""          + '<text class="stele-rw-mark" x="' + cx(sx) + '" y="' + (cy(sy) + 1.6) + '">S</text>'""",
 """          + FINDS.map((f) => '<text class="stele-rw-find' + (hasFind(f.id) ? ' is-have' : '') + '" x="' + cx(f.at[0]) + '" y="' + (cy(f.at[1]) + 1.9) + '">' + (hasFind(f.id) ? '✦' : '✧') + '</text>').join('')
          + '<text class="stele-rw-mark" x="' + cx(sx) + '" y="' + (cy(sy) + 1.6) + '">S</text>'"""),
("""        const falcon = get(KEYS.falcon) === 'used';""", """        const got = FINDS.filter((f) => hasFind(f.id));
        const findRows = FINDS.map((f, i) => {
          const have = hasFind(f.id);
          return '<li style="--t:' + (5.5 + i * 0.2).toFixed(2) + 's"><div class="drw-find ' + (have ? 'is-have' : 'is-missing') + '"><span class="drw-find-icon" aria-hidden="true">' + (have ? f.icon : '✧') + '</span>'
            + '<span><b>' + (have ? f.name : 'Still in the fire') + '</b><small>' + (have ? f.sub : 'Somewhere on ' + f.where + '.') + '</small></span></div></li>';
        }).join('');
        const falcon = get(KEYS.falcon) === 'used';"""),
("""          + '<div class="rw-next">Next · Hermes on the Field Wire</div>'
          + '</section></div>'
          + '<div class="chasm3d-reward-actions">'
          + '<button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>'
          + '<button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay in the atrium</button>'
          + '</div></div>';""", """          + '<div class="rw-next">Next · Hermes on the Field Wire</div>'
          + '</section></div>'
          + '<div class="rw-label drw-label">What the fire did not take · ' + got.length + '/' + FINDS.length + '</div>'
          + '<ul class="drw-finds">' + findRows + '</ul>'
          + '<div class="chasm3d-reward-actions">'
          + '<button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>'
          + (got.length < FINDS.length ? '<button type="button" class="chasm3d-btn drw-again">✧ Back through the fire for what is missing</button>' : '')
          + '<button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay in the atrium</button>'
          + '</div></div>';"""),
("""        if (stayBtn) stayBtn.addEventListener('click', () => hideReward());
        if (wireBtn) wireBtn.focus({ preventScroll: true });
      }""", """        if (stayBtn) stayBtn.addEventListener('click', () => hideReward());
        const againBtn = reward.box.querySelector('.drw-again');
        if (againBtn) againBtn.addEventListener('click', startReplay);
        if (wireBtn) wireBtn.focus({ preventScroll: true });
      }"""),
("""        if (el.breath) el.breath.textContent = done ? 'The Servant is safe.' : (open && run ? 'The Servant can hold on: '""",
 """        if (el.replayEnd) el.replayEnd.hidden = !replay;
        if (el.breath) el.breath.textContent = done ? 'The Servant is safe.' : (open && run ? (replay ? 'Hermes can hold his breath: ' : 'The Servant can hold on: ')"""),
("""        if (c !== 'f') return { text: dir + ' · bare stone: it never burns', ring: 'gold' };
        const st = fuelState(x, y, t);
        if (st === 'ash') return { text: dir + ' · ash: it cannot burn again', ring: 'gold' };""",
 """        const fd = findAt(x, y), glint = fd && !hasFind(fd.id) ? ' · ✧ something glints there' : '';
        if (c !== 'f') return { text: dir + ' · bare stone: it never burns' + glint, ring: 'gold' };
        const st = fuelState(x, y, t);
        if (st === 'ash') return { text: dir + ' · ash: it cannot burn again' + glint, ring: 'gold' };"""),
("""        // the chalk and the rings of every knock
        drawChalk();""", """        // a glint over every find still lying in the atrium
        if (G.fx && G.fx.sparks && fireOpen() && !over() && !rm && now - (G.glintT || 0) > 700) {
          G.glintT = now;
          FINDS.forEach((f) => { if (!hasFind(f.id)) G.fx.sparks.emit({ x: wx(f.at[0]), y: 0.25, z: wz(f.at[1]) }, 3, { color: 0xfff1c4, size: [0.04, 0.08], speed: [0.05, 0.25], up: [0.5, 1.1], life: [0.6, 1.1], alpha: 0.95, gravity: -0.2, spread: 0.5 }); });
        }
        // the chalk and the rings of every knock
        drawChalk();"""),
("""        hatchPending = false;
        if (G) { G.cam.p = null; G.hGoal = null; G.hMove = null; G.chalkKey = null;""", """        hatchPending = false; replay = false;
        if (G) { G.cam.p = null; G.hGoal = null; G.hMove = null; G.chalkKey = null;"""),
("""        stopKnocks(true);
        hideReward(true);
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();   // (at the hatch this lets Hermes heave it alone)""",
 """        stopKnocks(true);
        hideReward(true);
        clearTimeout(reward.timer);
        replay = false;
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();   // (at the hatch this lets Hermes heave it alone)"""),
("""      if (el.rewardBtn) el.rewardBtn.addEventListener('click', showReward);
      if (window.RelicUse) {""", """      if (el.rewardBtn) el.rewardBtn.addEventListener('click', showReward);
      if (el.replayEnd) el.replayEnd.addEventListener('click', () => endReplay(false));
      if (window.RelicUse) {"""),
("""        rewardBtn: $('btn-stele-reward'), coinBtn: $('btn-stele-coin'),""", """        rewardBtn: $('btn-stele-reward'), coinBtn: $('btn-stele-coin'), replayEnd: $('btn-stele-replay-end'),"""),
("""        showReward: () => showReward(), rewardOpen: () => rewardOpen(),""", """        showReward: () => showReward(), rewardOpen: () => rewardOpen(),
        finds: FINDS.map((f) => ({ id: f.id, at: f.at.slice() })), found: () => readFinds(), replay: () => startReplay(), replaying: () => replay,"""),
])
# closing: the film is cut before the reward could rise over a closing window
s = open(J).read()
a = "        if (cine && cine.active) { cineClosed = true; cine.skip(); }\n        clearTimeout(view.freezeTimer);"
assert s.count(a) == 1
open(J, 'w').write(s)

R('web/index.html', [
("""              <div class="monolith-feedback" id="stele-move-feedback" role="status" aria-live="polite"></div>
            </div>
            <div class="monolith-lock-note">Understand the Servant's four stanzas first.</div>""",
 """              <div class="monolith-feedback" id="stele-move-feedback" role="status" aria-live="polite"></div>
              <button type="button" class="chasm3d-btn relic-ask-btn" id="btn-stele-replay-end" hidden>↩ Back to the well</button>
            </div>
            <div class="monolith-lock-note">Understand the Servant's four stanzas first.</div>"""),
("""            <p>Reach the hatch of the well, in the far corner, before the Servant runs out of breath. Drag to look around, scroll to come closer. Hints wait under <em>Ask Hermes</em>.</p>""",
 """            <p>Reach the hatch of the well, in the far corner, before the Servant runs out of breath. Drag to look around, scroll to come closer. Hints wait under <em>Ask Hermes</em>.</p>
            <p>A <strong>✧ glint</strong> on a flagstone is something the fire has not taken yet: step on it and Hermes picks it up. There are three, and none is needed to save the Servant.</p>"""),
])

R('web/hub/css/stations/desert-reward.css', [
("""/* Station 19: the disc set true, and the first truth */""", """.stele-rw-find { font: 700 5px 'Cinzel', serif; fill: rgba(122, 74, 24, 0.55); text-anchor: middle; }
.stele-rw-find.is-have { fill: #b45309; }
.stele-atrium .stele-glint { animation: stele-glint 1.2s ease-in-out infinite alternate; }
@keyframes stele-glint { from { opacity: 0.45; } to { opacity: 1; } }

/* optional finds, in a strip under the two columns: what she has, and what is still out there */
.drw-finds { list-style: none; margin: 0 0 12px; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; text-align: left; }
.chasm3d-reward.is-on .drw-finds li { animation: chasm-rise 0.45s ease var(--t) both; }
.drw-find { display: flex; align-items: center; gap: 10px; height: 100%; padding: 8px 10px; border-radius: 12px; background: rgba(20, 12, 6, 0.55); border: 1.5px solid rgba(212, 168, 83, 0.4); }
.drw-find.is-have { border-color: rgba(253, 230, 138, 0.7); box-shadow: 0 0 12px rgba(253, 230, 138, 0.18); }
.drw-find.is-missing { opacity: 0.66; border-style: dashed; }
.drw-find-icon { font-size: 1.5rem; line-height: 1; }
.drw-find b { display: block; font: 700 0.8rem 'Cinzel', serif; letter-spacing: 0.04em; color: #fde68a; }
.drw-find small { display: block; font-size: 0.86rem; line-height: 1.3; color: #d6c3a0; }
@media (max-width: 720px) { .drw-finds { grid-template-columns: 1fr; } }

/* Station 19: the disc set true, and the first truth */"""),
("""  .chasm3d-reward.is-on .oracle-rw-when strong { animation: none !important; }""",
 """  .chasm3d-reward.is-on .oracle-rw-when strong, .chasm3d-reward.is-on .drw-finds li, .stele-atrium .stele-glint { animation: none !important; }"""),
])

# the Field Wire remembers what he found (step 27, by the well)
W = 'web/hub/js/wire-script-tower.js'
R(W, [
("""  const keep = (list) => list.filter(Boolean);
""", """  const keep = (list) => list.filter(Boolean);
  // what Hermes picked up in the burning atrium (Station 18, s18-polybius-stele.js FINDS)
  const steleFound = (id) => { try { const l = JSON.parse(ls('order_stele_finds') || '[]'); return Array.isArray(l) && l.indexOf(id) >= 0; } catch (e) { return false; } };
"""),
("""      "The library is embers. The stele still stands in the atrium, black with soot and whole.",
      { ask: [
        { text: "Is he badly hurt?",""", """      "The library is embers. The stele still stands in the atrium, black with soot and whole.",
      steleFound('glasses') ? "I gave him back his spectacles, one lens cracked. He put them on and looked at me for a long time." : null,
      steleFound('glasses') ? "'Older,' he said. 'So am I.'" : null,
      steleFound('firepot') ? "I showed him the pot of pitch with the ring burnt into it. 'Three of those came through the roof-light at dusk,' he said. 'I counted them. Then I stopped counting and ran.'" : null,
      steleFound('watchbook') ? "And his watch-book was under the ash, in an iron box. October 1998: 'A surveyor on the north ridge at dusk. He did not come down. He will.'" : null,
      steleFound('watchbook') ? "He saw me, Silvia. Twenty-eight years ago, on that ridge, and he wrote me down." : null,
      { ask: [
        { text: "Is he badly hurt?","""),
])

R('web/hub/js/hub-core.js', [
("""                'order_stele_howto', 'order_stele_cine_intro', 'order_stele_coin', 'order_stele_falcon', 'order_stele_trail']);""",
 """                'order_stele_howto', 'order_stele_cine_intro', 'order_stele_coin', 'order_stele_falcon', 'order_stele_trail', 'order_stele_finds', 'order_stele_cine_outro']);"""),
])
print('done')
