"""One-off (19 Nov 2026): Station 17 gets the animated reward of the other cairns (after the ceremony of the five seals): the courtyard
with the four rays of the dawn in gold, the code of the night signal, the seal and the mirror, both Ledger lines, and the oil it burnt.
Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)
J = 'web/hub/js/stations/s17-solstice-arch.js'
R(J, [
("""        mirrorRaised: 'order_cairn5_mirror_raised'  // she handed Hermes the Signal Mirror for the night signal""",
 """        mirrorRaised: 'order_cairn5_mirror_raised', // she handed Hermes the Signal Mirror for the night signal
        rays: 'order_cairn5_rays'                   // the road of each of the four rays that closed a lock, for the reward"""),
("""      const dawn = { running: false, step: 0, locks: 0, deadline: 0, raf: null };""",
 """      const dawn = { running: false, step: 0, locks: 0, deadline: 0, raf: null, rays: [] };"""),
("""        if (trace(COURT.entries[dawn.step]).end !== 'altar') return;
        dawn.locks++;""", """        const hit = trace(COURT.entries[dawn.step]);
        if (hit.end !== 'altar') return;
        dawn.rays[dawn.step] = hit.pts.map((p) => p.slice());
        dawn.locks++;"""),
("""          set(KEYS.dawnDone, 'true');
          sceneDawnDone();""", """          set(KEYS.dawnDone, 'true');
          set(KEYS.rays, JSON.stringify(dawn.rays));
          sceneDawnDone();"""),
("""        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
      }
      function applyVictory() {
        if (el.victoryText) {""", """        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        // the reward rises after the ceremony of the five seals (closeCeremony), or by itself when there is no ceremony
        clearTimeout(reward.timer);
        reward.timer = setTimeout(() => { const c = $('five-seals-overlay'); if (!c || c.style.display === 'none') showReward(); }, 2600);
      }

      // ---- The reward: the courtyard with the four rays of the dawn, the code of the night, the seal, the mirror and the Ledger lines ----
      const reward = { box: null, back: null, timer: 0 };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      const sealCount = () => { let n = 0; for (let i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) === 'true') n++; return n; };
      function rewardMap() {
        let rays = null;
        try { rays = JSON.parse(get(KEYS.rays) || 'null'); } catch (e) { rays = null; }
        if (!Array.isArray(rays) || rays.length !== COURT.entries.length || rays.some((r) => !Array.isArray(r))) rays = [null, null, null, trace(COURT.entries[COURT.entries.length - 1]).pts];
        const W = COURT.cols * C, H = COURT.rows * C, ROMAN = ['I', 'II', 'III', 'IV'];
        let out = '<rect class="arch-rw-floor" x="-1" y="-1" width="' + (W + 2) + '" height="' + (H + 2) + '" rx="2"/>';
        for (let y = 0; y < COURT.rows; y++) for (let x = 0; x < COURT.cols; x++) out += '<rect class="arch-rw-cell" x="' + (x * C) + '" y="' + (y * C) + '" width="' + C + '" height="' + C + '"/>';
        COURT.pillars.forEach(([x, y]) => { out += '<circle class="arch-rw-pillar" cx="' + cx(x) + '" cy="' + cy(y) + '" r="3.4"/>'; });
        rays.forEach((pts, k) => {
          if (!pts) return;
          const line = [[COURT.entries[k], -1]].concat(pts).map((p) => cx(p[0]) + ',' + cy(p[1])).join(' ');
          const d0 = (0.7 + k * 0.75).toFixed(2);
          out += '<polyline class="rw-road-glow" pathLength="1" style="--dd:0.7s;--d0:' + d0 + 's" points="' + line + '"/><polyline class="rw-road" pathLength="1" style="--dd:0.7s;--d0:' + d0 + 's" points="' + line + '"/>';
        });
        COURT.mirrors.forEach(([x, y], i) => {
          const f = mirrors[i] === 'f';
          out += '<line class="arch-rw-mirror" x1="' + (x * C + 2) + '" y1="' + (f ? y * C + 8 : y * C + 2) + '" x2="' + (x * C + 8) + '" y2="' + (f ? y * C + 2 : y * C + 8) + '"/>';
        });
        COURT.entries.forEach((col, k) => { out += '<text class="arch-rw-entry" x="' + cx(col) + '" y="-3.2">' + ROMAN[k] + '</text>'; });
        const [ax, ay] = COURT.altar;
        out += '<g class="arch-rw-altar" style="--t:3.9s"><circle cx="' + cx(ax) + '" cy="' + cy(ay) + '" r="4.2"/><text x="' + cx(ax) + '" y="' + (cy(ay) + 1.8) + '">☀</text></g>';
        return '<svg viewBox="-2 -9 ' + (W + 4) + ' ' + (H + 11) + '" role="img" aria-label="The Courtyard of Rays from above: the four rays of the November dawn, each from its place under the arch to the brass ring of the altar">' + out + '</svg>';
      }
      function showReward() {
        clearTimeout(reward.timer);
        const body = modal.querySelector('.chasm3d-body');
        if (!body || !isDone() || modal.style.display === 'none') return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward arch-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', 'Your reward for the Arch of the Solstice');
          reward.box.hidden = true;
          body.appendChild(reward.box);
          reward.box.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast'); });
          reward.box.addEventListener('click', (e) => {
            const relic = e.target.closest && e.target.closest('[data-relic]');
            if (relic && typeof window.openItemAcquiredModal === 'function') { relic.classList.remove('is-new'); window.openItemAcquiredModal({ id: relic.getAttribute('data-relic') }); }
          });
        }
        const num = (k) => parseInt(get(k) || '0', 10) || 0;
        const lost = num(KEYS.dawnFails), wrong = num(KEYS.signalFails);
        const code = (p) => p.split('').map((ch) => (ch === 'S' ? '·' : '—')).join(' ');
        const signals = ROUNDS.map((r, i) => '<span class="arch-rw-signal' + (i === ROUNDS.length - 1 ? ' is-last' : '') + '" style="--t:' + (4.2 + i * 0.25).toFixed(2) + 's">' + code(r) + '</span>').join('');
        const lit = get(KEYS.lamp) === 'lit';
        const spent = lit ? '<div class="rw-label drw-label">The satchel gave</div><ul class="drw-spent"><li><img src="./assets/items/item_lamp_oil_half.png" alt=""><span><b>The Lamp Oil</b>Burnt under the arch, to set the first ray by night.</span></li></ul>' : '';
        reward.box.innerHTML = '<div class="rw-rays" aria-hidden="true"></div>'
          + '<div class="rw-sparks" aria-hidden="true">' + Array.from({ length: 18 }, (_, i) => '<i style="--a:' + ((i * 360 / 18) | 0) + 'deg;--d:' + (120 + (i % 5) * 36) + 'px;--t:' + (0.9 + (i % 4) * 0.2).toFixed(2) + 's"></i>').join('') + '</div>'
          + '<div class="chasm3d-reward-card">'
          + '<div class="chasm3d-reward-kicker">Station 17 · The Arch of the Solstice, Cairn V</div>'
          + '<h3 class="chasm3d-reward-title">The Last Seal</h3>'
          + '<p class="rw-sub">Four rays of a November dawn closed the brass ring. That night a light on Tower II answered in a code Hermes made for one person only.</p>'
          + '<div class="rw-grid">'
          + '<section class="rw-map arch-rw-map" aria-label="The four rays of the dawn">'
          + '<div class="rw-label">The four rays of the dawn</div>'
          + rewardMap()
          + '<div class="rw-label arch-rw-night">The light on Tower II, and your answers</div>'
          + '<div class="arch-rw-signals" aria-label="The four signals of the night; the last is three short and two long">' + signals + '</div>'
          + '<div class="chasm3d-reward-stats">'
          + '<div><b>4/4</b><span>locks</span></div>'
          + '<div><b>' + lost + '</b><span>dawns lost</span></div>'
          + '<div><b>' + wrong + '</b><span>wrong answers</span></div>'
          + '<div><b>' + (num(KEYS.fails) + 1) + '</b><span>sigil tries</span></div>'
          + '</div>'
          + (lost === 0 ? '<div class="rw-flawless">✦ The altar opened at the first dawn ✦</div>' : '')
          + '</section>'
          + '<section class="rw-loot">'
          + '<div class="drw-relics">'
          + '<button type="button" class="drw-relic" data-relic="seal_cairn_5" aria-label="The Seal of Cairn V: open the card"><span class="drw-pic"><img src="./assets/items/item_seal_cairn_5.svg" alt="" width="140" height="140"></span><span class="drw-name"><b>The Seal of Cairn V</b><small>Sacred Seal · ' + sealCount() + ' of 5</small></span></button>'
          + '<button type="button" class="drw-relic" data-relic="signal_mirror" aria-label="The Signal Mirror: open the card"><span class="drw-pic"><img src="./assets/items/item_signal_mirror.webp" alt="" width="140" height="140"></span><span class="drw-name"><b>The Signal Mirror</b><small>Found under the seal</small></span></button>'
          + '</div>'
          + '<div class="drw-eqs">'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Spelled in light from Tower II</div><div class="rw-ledger-title">The First Line</div><div class="rw-eq" aria-label="Y minus O equals 2"><i>Y</i><u>−</u><i>O</i><u>=</u><b>2</b></div><p>A line for your Cipher Ledger.</p></div></div>'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Then, before the light went out</div><div class="rw-ledger-title">The Second Line</div><div class="rw-eq" aria-label="L plus G equals 23"><i>L</i><u>+</u><i>G</i><u>=</u><b>23</b></div><p>Both lines are now in your Ledger.</p></div></div>'
          + '</div>'
          + spent
          + '<div class="rw-next">Next · Hermes on the Field Wire</div>'
          + '</section></div>'
          + '<div class="chasm3d-reward-actions">'
          + '<button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>'
          + '<button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay under the Arch</button>'
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
      // as at the other cairns: straight to Hermes on the Field Wire
      function leaveForWire() {
        closeSolsticeModal();
        if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        const wireTab = document.querySelector('[data-view="view-field-wire"]');
        if (wireTab) wireTab.click();
        if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ Seal of Cairn V secured (' + sealCount() + ' of 5) ✦ Hermes is waiting for you on the Field Wire.');
      }
      function applyVictory() {
        if (el.victoryText) {"""),
("""        cancelPress();
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();""", """        cancelPress();
        hideReward(true);
        if (window.RelicUse && window.RelicUse.isOpen()) window.RelicUse.close();"""),
("""        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeSolsticeModal();
      }, true);
      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeSolsticeModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof window.showDesertToast === 'function') {
            let seals = 0;
            for (let i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) === 'true') seals++;
            window.showDesertToast('✦ Seal of Cairn V secured (' + seals + ' of 5) ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
          }
        });
      }""", """        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        if (rewardOpen() && (!$('modal-item-acquired') || $('modal-item-acquired').style.display === 'none')) { e.stopImmediatePropagation(); hideReward(); return; }
        closeSolsticeModal();
      }, true);
      if (el.finish) el.finish.addEventListener('click', leaveForWire);
      if (el.rewardBtn) el.rewardBtn.addEventListener('click', showReward);"""),
("""      const closeCeremony = () => {
        if (overlay) overlay.style.display = 'none';""", """      const closeCeremony = () => {
        const was = overlay && overlay.style.display !== 'none';
        if (overlay) overlay.style.display = 'none';
        // under the Arch, the reward of Cairn V follows the ceremony
        if (was && modal.style.display !== 'none' && isDone() && !rewardOpen()) { clearTimeout(reward.timer); reward.timer = setTimeout(showReward, 350); }"""),
("""        raiseMirror: () => raiseMirror(),""", """        raiseMirror: () => raiseMirror(),
        showReward: () => showReward(), rewardOpen: () => rewardOpen(),"""),
])
# the element of the new button
s = open(J).read()
import re
m = re.search(r"victory: \$\('solstice-victory'\)", s)
assert m, 'el.victory'
s = s[:m.start()] + "rewardBtn: $('btn-solstice-reward'), " + s[m.start():]
open(J, 'w').write(s)

R('web/index.html', [
("""          <div class="chasm-victory-card" id="solstice-victory" style="display: none;">
            <div class="chasm-victory-title"><span>🌓</span><span>The Last Seal</span></div>
            <div class="chasm-victory-text" id="solstice-victory-text"></div>
            <div class="laby3d-eqs">
              <span class="monolith-equation">[Y] − [O] = 2</span>
              <span class="monolith-equation">[L] + [G] = 23</span>
            </div>
            <p class="laby3d-eq-note">Spelled out in light from Tower II. Both lines are now in your Cipher Ledger.</p>
            <p class="laby3d-eq-note">🪞 <strong>The Signal Mirror</strong> is in Hermes's satchel.</p>
            <button type="button" class="btn-chasm-finish" id="btn-solstice-finish"><span>🗺️ Back to the Grand Desert Map ➔</span></button>
          </div>""", """          <div class="drw-done" id="solstice-victory" style="display: none;">
            <div class="drw-done-title">✦ The last seal</div>
            <button type="button" class="chasm3d-btn chasm3d-again" id="btn-solstice-reward">🏆 See your reward</button>
            <button type="button" class="btn-chasm-finish" id="btn-solstice-finish"><span>📻 To Hermes on the Field Wire ➔</span></button>
          </div>"""),
])
R('web/hub/css/stations/desert-reward.css', [
("""/* Station 19: the disc set true, and the first truth */""", """/* Station 17: the Courtyard of Rays from above, the four rays of the dawn, and the code of the night */
.arch-rw-map svg { max-width: 270px; aspect-ratio: 94 / 101; }
.arch-rw-floor { fill: #cdb07a; stroke: #7a4a18; stroke-width: 0.5; }
.arch-rw-cell { fill: rgba(255, 248, 225, 0.22); stroke: rgba(92, 52, 18, 0.25); stroke-width: 0.25; }
.arch-rw-pillar { fill: #5c3412; }
.arch-rw-mirror { stroke: #7c2d12; stroke-width: 1.5; stroke-linecap: round; }
.arch-rw-map .rw-road { stroke-width: 1.1; }
.arch-rw-map .rw-road-glow { stroke-width: 3; }
.arch-rw-entry { font: 700 4.4px 'Cinzel', serif; fill: #7a4a18; text-anchor: middle; }
.arch-rw-altar circle { fill: #fde68a; stroke: #92400e; stroke-width: 0.7; }
.arch-rw-altar text { font-size: 5px; fill: #92400e; text-anchor: middle; }
.arch-rw-altar { transform-box: fill-box; transform-origin: center; }
.chasm3d-reward.is-on .arch-rw-altar { animation: rw-pop 0.55s cubic-bezier(.2, .9, .3, 1.6) var(--t) both; }
.arch-rw-night { margin-top: 8px; }
.arch-rw-signals { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 14px; margin: 4px 0 8px; font: 700 1.05rem 'Space Mono', monospace; color: #7c2d12; }
.arch-rw-signal { display: inline-block; padding: 1px 8px; border-radius: 999px; border: 1px solid rgba(122, 74, 24, 0.4); }
.arch-rw-signal.is-last { background: #7c2d12; color: #fde68a; border-color: #7c2d12; }
.chasm3d-reward.is-on .arch-rw-signal { animation: chasm-stamp 0.5s cubic-bezier(.2, .9, .3, 1.6) var(--t) both; }

/* Station 19: the disc set true, and the first truth */"""),
("""  .chasm3d-reward.is-on .oracle-rw-when strong, .chasm3d-reward.is-on .drw-finds li, .stele-atrium .stele-glint { animation: none !important; }""",
 """  .chasm3d-reward.is-on .oracle-rw-when strong, .chasm3d-reward.is-on .drw-finds li, .stele-atrium .stele-glint,
  .chasm3d-reward.is-on .arch-rw-altar, .chasm3d-reward.is-on .arch-rw-signal { animation: none !important; }"""),
])
R('web/hub/js/hub-core.js', [
("""'order_five_seals_celebrated', 'order_cairn5_seals_at_altar', 'order_cairn5_lamp', 'order_cairn5_mirror_raised']);""",
 """'order_five_seals_celebrated', 'order_cairn5_seals_at_altar', 'order_cairn5_lamp', 'order_cairn5_mirror_raised', 'order_cairn5_rays']);"""),
])
print('done')
