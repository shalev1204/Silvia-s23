"""One-off (19 Nov 2026): Station 19 closes with a short film (the two of them, the light turning gold, the stair) before its reward.
Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)
J = 'web/hub/js/stations/s19-oracle-horizon.js'
R(J, [
("""      const HOWTO_KEY = 'order_oracle_howto', CINE_INTRO = 'order_oracle_cine_intro';""",
 """      const HOWTO_KEY = 'order_oracle_howto', CINE_INTRO = 'order_oracle_cine_intro', CINE_OUTRO = 'order_oracle_cine_outro';"""),
("""        justWon = true;
        // the reward rises once she has lifted the veil
        clearTimeout(reward.timer);
        reward.timer = setTimeout(showReward, G && !reduced() ? 11600 : 700);
      }""", """        justWon = true;
        // once she has lifted the veil, a short film closes the Desert Path (the first time), and then the reward rises
        clearTimeout(reward.timer);
        const film = !!(G && cine && !reduced() && get(CINE_OUTRO) !== 'seen');
        reward.timer = setTimeout(() => { if (film) outro(showReward); else showReward(); }, G && !reduced() ? 11600 : 700);
      }
      function endingShots() {
        return [
          { from: { p: [2.7, 1.9, 2.5], l: [0, 1.5, 0.1] }, to: { p: [1.8, 1.75, 1.7], l: [0, 1.55, -0.2] }, dur: 5.5,
            kicker: 'STATION 19', title: 'THE FIRST TRUTH', line: 'Fifty-five years. For a long time, neither of them says a word.' },
          { from: { p: [0.4, 1.4, 3.6], l: [0, 2.2, ALTAR[1]] }, to: { p: [0.2, 2.5, 2.7], l: [0, WALL_H + 2, ALTAR[1]] }, dur: 6,
            line: 'Above the altar the grey light turns to gold. The first truth is told: the eighteenth to the twentieth of December.' },
          { from: { p: [0, 2.1, -1.4], l: [0, 1.6, RAD] }, to: { p: [0, 2.5, 0.5], l: [0, 1.5, RAD + 2] }, dur: 5.5,
            line: 'At the top of the inner stair the Servant puts out his lamp. In the east, the ruts of the wagons run toward the Stage.' }
        ];
      }
      function outro(then) {
        if (!modalOpen() || modal.classList.contains('closing') || !isDone()) return;
        set(CINE_OUTRO, 'seen');
        cue('whoosh', { dur: 1.6 });
        cine.start(endingShots(), () => {
          if (el.subtitle) el.subtitle.classList.remove('is-on');
          view.snapNext = true;
          if (modalOpen() && !modal.classList.contains('closing')) then();
        }, { fade: true });
      }"""),
])
R('web/hub/js/hub-core.js', [
("""                'order_oracle_howto', 'order_oracle_cine_intro', 'order_oracle_key', 'order_oracle_lamp', 'order_oracle_coin', 'order_oracle_pebble']);""",
 """                'order_oracle_howto', 'order_oracle_cine_intro', 'order_oracle_cine_outro', 'order_oracle_key', 'order_oracle_lamp', 'order_oracle_coin', 'order_oracle_pebble']);"""),
])
print('done')
