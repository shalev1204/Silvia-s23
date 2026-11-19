"""One-off (18 Nov 2026): the return to the gates of Tower II uses the satchel. The five seals are handed to Hermes one by one
and stay in the arch, the falcon and the ibis are paid to the stone keepers, and the raiders' copy of the survey is shown to the
Servant (a former copyist of the Order made it). The return also remembers how far it got. Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:70], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

X = 'web/hub/js/stations/s13b-gates-extras.js'
R(X, [
# --- the greeting: the night in the well came first ---
("""        nar('Dawn. Tower II is the colour of a ripe peach, and the bronze doors are still shut. The old man is already on the top step, as if he had never left it.'),
        H('Silvia, I am at the gates again. Five seals in my coat. He is not looking at me. He is looking at the coat.')
      ];""", """        nar('Dawn. The old man will not let Hermes touch the Oracle’s door yet. He leads him out by the side door and round to the front of Tower II, where the bronze doors are still shut.'),
        nar('He climbs to the top step, his burnt hands wrapped in linen, and stands as if he had never left it.'),
        H('Silvia, I am at the gates again. Five seals in my coat. “She receives no one until the five are home,” he says. He is not looking at me. He is looking at the coat.')
      ];
      // a return that was left half done: the arch already holds what she handed over
      if (ds.ret.sealed) return [
        nar('Dawn, still. The five seals burn in the arch of Tower II, and the old man waits on the top step.'),
        H('The seals are home, Silvia. Only the doors are left.')];"""),
("""      out.push(H('The five sockets in the arch, Silvia. He is waiting for the seals.'));
      return out;
    }

    function fitLines() {
      var out = [nar('Hermes climbs the steps. The first seal still glows in its socket, high in the arch, where he fitted it at dusk.', { hold: 1000, fx: function () { look('arch')(); var a = A(); if (a) a.walk('hermes', -1.0, 1.35, { speed: 1.0, face: a.faceTo('hermes', -0.6, -2) }); } })];
      [2, 3, 4, 5].forEach(function (i) {
        out.push(nar('The seal of ' + SEAL_NAMES[i] + ' goes into its socket and turns.', { fx: function () { react('hermes', 'offer'); c.fitSeals(i); } }));
      });
      out.push(""", """      out.push(H('The five sockets in the arch, Silvia. He is waiting for the seals.'));
      return out;
    }

    // ---- The seals go home through the satchel: she hands them to Hermes one by one (relic-use.js) ----
    var RU = function () { return window.RelicUse || null; };
    var sealId = function (i) { return 'seal_cairn_' + i; };
    // the seals still in the satchel (Seal I went into the arch at dusk, the day Hermes first stood here)
    function sealsLeft() {
      var ru = RU(), out = [];
      for (var i = 1; i <= 5; i++) if (!ru || !ru.isSpent(sealId(i))) out.push(i);
      return out;
    }
    function toArch() { look('arch')(); var a = A(); if (a) a.walk('hermes', -1.0, 1.35, { speed: 1.0, face: a.faceTo('hermes', -0.6, -2) }); }
    function fitOne(i, silent) {
      var ru = RU();
      if (ru) ru.spend(sealId(i), { silent: true });
      react('hermes', 'offer');
      c.fitSeals(5 - sealsLeft().length);
    }
    var COUNT = ['', 'One more, Silvia. The last socket.', 'Two to go.', 'Three to go. The arch is waking.', 'Four to go.'];
    function askSeals() {
      var ru = RU(), left = sealsLeft();
      if (!ru || !left.length) { c.pick('rt_seals_go'); return; }
      ru.ask({
        ask: left.length >= 4 ? 'The arch has five sockets, Silvia. Hand me the seals, one by one.' : COUNT[left.length],
        want: left.map(sealId),
        wrong: {
          statue_seal: 'A seal, yes, but the keepers’ own. The arch wants the five of the cairns.',
          servant_key: 'Not the key. The arch has sockets, not a lock.',
          falcon_weight: 'The falcon is for the stone keepers. First the seals.',
          ibis_figure: 'The ibis is for the stone keepers. First the seals.'
        },
        cancel: 'Fit the rest yourself, Hermes',
        onRight: function (id) {
          fitOne(parseInt(id.slice(-1), 10));
          if (sealsLeft().length) setTimeout(askSeals, 650); else setTimeout(function () { c.pick('rt_seals_go'); }, 500);
        },
        onCancel: function () { c.pick('rt_seals_go'); }
      });
    }

    function fitLines() {
      var left = sealsLeft(), out = [];
      if (left.length) out.push(nar(left.length === 5 ? 'Hermes climbs the steps to the arch.' : 'Hermes takes the rest from his coat.', { hold: 800, fx: toArch }));
      left.forEach(function (i) {
        out.push(nar('The seal of ' + SEAL_NAMES[i] + ' goes into its socket and turns.', { fx: function () { fitOne(i); } }));
      });
      out.push("""),
# --- the keepers are paid from the satchel ---
("""    function keepersLines() {
      return [""", """    var keepersGiven = {};
    function askKeepers() {
      var ru = RU();
      if (!ru) { c.pick('rt_keepers_go'); return; }
      var want = ['falcon_weight', 'ibis_figure'].filter(function (id) { return !keepersGiven[id]; });
      if (!want.length) { c.pick('rt_keepers_go'); return; }
      ru.ask({
        ask: want.length === 2 ? 'The keepers’ hands are empty, Silvia. A falcon for the left, an ibis for the right. Have we got them?'
          : (keepersGiven.falcon_weight ? 'The falcon is in my hand. And for the right-hand keeper?' : 'The ibis is in my hand. And for the left-hand keeper?'),
        want: want,
        wrong: {
          statue_seal: 'That is what they give, Silvia, not what they ask.',
          servant_coin: 'They are stone. They do not take coin.',
          raiders_survey: 'That one is for the old man, not for the keepers.'
        },
        onRight: function (id) {
          keepersGiven[id] = true;
          react('hermes', 'offer');
          setTimeout(askKeepers, 500);
        },
        onCancel: function () { keepersGiven = {}; }
      });
    }
    function payKeepers() {
      var ru = RU();
      if (!ru) return;
      ru.spend('falcon_weight', { silent: true });
      ru.spend('ibis_figure', { silent: true });
    }

    // the raiders' copy of the founders' survey (a find of the Labyrinth): the Servant knows the hand that drew it
    function surveyLines() {
      return [
        H('One more thing, elder. The raiders dropped this in the labyrinth: a copy of the founders’ survey.', { fx: function () { react('hermes', 'offer'); } }),
        nar('The old man unfolds the sheet with his wrapped hands. He does not read the map. He reads the handwriting.', { hold: 1400 }),
        S('I know this hand. The long tails on the sevens, the dot inside every circle. I taught it.'),
        S('A copyist of the Order. He sat at my table for six years. One winter he took his pens and walked out to the Ashes.'),
        H('So that is how they knew where every cairn stood, Silvia.'),
        S('He copied the map well. He never copied what the cairns ask. Leave it with me: the Order keeps its own mistakes.')];
    }

    function keepersLines() {
      return ["""),
("""      if (ds.flags.coin && ending !== 'keepers') out.push(S('The coin has done its work. Keep it as a memory.'));""",
 """      if (ds.flags.coin && ending !== 'keepers' && !(RU() && RU().isSpent('servant_coin'))) out.push(S('The coin has not finished its work. Keep it close on the stair.'));"""),
("""      rt_seals: {
        icon: '🗝️', label: 'Fit the five seals into the arch.', say: 'Hermes, the five seals. Fit them into the arch, one by one.',
        lines: fitLines, after: function () { ds.ret.sealed = true; c.setMission('The five seals are home'); }
      },""", """      // she hands the seals over from the satchel; the reply goes to the Servant only when the arch is full (or she lets Hermes finish)
      rt_seals: {
        icon: '🎒', label: 'Hand Hermes the seals for the arch.',
        opens: function () { toArch(); askSeals(); }
      },
      rt_seals_go: {
        icon: '🗝️', label: 'Fit the five seals into the arch.', say: 'Hermes, the five seals. Fit them into the arch, one by one.',
        lines: fitLines, after: function () { ds.ret.sealed = true; Road.saveReturn({ sealed: true }); c.setMission('The five seals are home'); }
      },"""),
("""        lines: whyShutLines, after: function () { ds.ret.asked = true; }
      },
      rt_keepers: {
        icon: '🗿', label: 'Pay the two stone keepers.', say: 'Hermes, the stone keepers. They asked for a falcon and an ibis. Pay them.',
        lines: keepersLines, after: function () { ds.ret.keepers = true; }
      },""", """        lines: whyShutLines, after: function () { ds.ret.asked = true; Road.saveReturn({ asked: true }); }
      },
      rt_keepers: {
        icon: '🎒', label: 'Pay the two stone keepers.',
        opens: function () { askKeepers(); }
      },
      rt_keepers_go: {
        icon: '🗿', label: 'Pay the two stone keepers.', say: 'Hermes, the stone keepers. They asked for a falcon and an ibis. Pay them.',
        lines: keepersLines, after: function () { ds.ret.keepers = true; payKeepers(); Road.saveReturn({ keepers: true }); }
      },
      rt_survey: {
        icon: '📜', label: 'Show him the raiders’ copy of the survey.', say: 'Hermes, the copy the raiders dropped in the labyrinth. Show it to him.',
        lines: surveyLines,
        after: function () {
          ds.ret.survey = true; Road.saveReturn({ survey: true });
          var ru = RU();
          if (ru) ru.spend('raiders_survey', { tag: 'KEPT BY THE SERVANT', lore: 'The Servant knew the hand at once: a copyist of the Order who left for the Ashes. He keeps the copy now. The Order keeps its own mistakes.' });
        }
      },"""),
("""      if (!ds.ret.sealed) return ['rt_seals', 'rt_ask'].filter(function (id) { return !(id === 'rt_ask' && ds.ret.asked); });
      if (!ds.ret.asked) out.push('rt_ask');
      if (!ds.ret.keepers && Road.canPayKeepers(ds.flags)) out.push('rt_keepers');
      return out.concat(['rt_open']);""", """      if (!ds.ret.sealed) return ['rt_seals', 'rt_ask'].filter(function (id) { return !(id === 'rt_ask' && ds.ret.asked); });
      if (!ds.ret.asked) out.push('rt_ask');
      if (!ds.ret.keepers && Road.canPayKeepers(ds.flags)) out.push('rt_keepers');
      if (!ds.ret.survey && RU() && RU().has('raiders_survey')) out.push('rt_survey');
      return out.concat(['rt_open']);"""),
("""    function reset() { pendingRound = 0; }""", """    function reset() { pendingRound = 0; keepersGiven = {}; }"""),
])
# the Use button of the satchel during the return
R(X, [("""    return { choices: choices, menu: menu, add: add, reset: reset, lintel: LINTEL, returnLines: returnLines };""",
"""    if (window.RelicUse) {
      var inReturn = function () { return ds.mode === 'return' && ds.stage === 'ret' && !ds.busy; };
      window.RelicUse.register('raiders_survey', function () { if (!inReturn() || !ds.ret.sealed || ds.ret.survey) return false; c.pick('rt_survey'); return true; });
      [1, 2, 3, 4, 5].forEach(function (i) { window.RelicUse.register(sealId(i), function () { if (!inReturn() || ds.ret.sealed) return false; toArch(); fitOne(i); if (sealsLeft().length) askSeals(); else c.pick('rt_seals_go'); return true; }); });
    }

    return { choices: choices, menu: menu, add: add, reset: reset, lintel: LINTEL, returnLines: returnLines };""")])

T = 'web/hub/js/stations/s13b-gates-tower-ii.js'
R(T, [
("""    fitSeals: fitSeals, openDoors: openDoors, finishReturn: showReturnCard,""",
 """    fitSeals: fitSeals, openDoors: openDoors, finishReturn: showReturnCard, pick: function (id) { return pick(id); },"""),
("""    ds.ret = { sealed: false, asked: false, keepers: false };
    ds.retSeals = 1; ds.away = false;""", """    // what was done at an earlier visit is remembered; Seal I has been in the arch since the dusk Hermes first stood here
    var was = Road ? Road.returnState() : {}, RU = window.RelicUse || null;
    if (RU && getLs('order_monolith_gate_seal1') === 'true') RU.spend('seal_cairn_1', { silent: true });
    ds.ret = { sealed: !!was.sealed, asked: !!was.asked, keepers: !!was.keepers, survey: !!was.survey };
    ds.retSeals = ds.ret.sealed ? 5 : RU ? [1, 2, 3, 4, 5].filter(function (i) { return RU.isSpent('seal_cairn_' + i); }).length : 1;
    ds.away = false;"""),
("""    setMission('Fit the five seals');
    renderChoices();""", """    setMission(ds.ret.sealed ? 'The five seals are home' : 'Fit the five seals');
    renderChoices();"""),
])

R('web/hub/js/gates-road.js', [
("""  function owns(id) {
    if (id === 'falcon_weight'""", """  function owns(id) {
    if (root.RelicUse && root.RelicUse.isSpent(id)) return false;   // used for good (relic-use.js)
    if (id === 'falcon_weight'"""),
])
print('done')
