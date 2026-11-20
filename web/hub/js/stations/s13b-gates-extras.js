// At the Gates of Tower II · the long scenes: the riddle duel, the statues' riddle and the Servant's one lie.
// Loaded before s13b-gates-tower-ii.js, which hands over its dialogue helpers and merges what this returns:
//   GatesExtras(ctx) -> { choices, menu(stage) -> ids | null, add(stage) -> ids, returnLines() -> lines }
// The second half is the return: five seals home, the bronze doors open (stage 'ret'; Station 19 launches it).
// Everything here only talks through ctx (the scene's state `ds`, its line builders and its 3D hooks); it never touches the DOM.
(function () {
  'use strict';

  window.GatesExtras = function (c) {
    var ds = c.ds, nar = c.nar, H = c.sayH, S = c.sayS, V = c.sayV, AU = c.sayA, look = c.look, R = c.R;
    // the people on the stairs (walk, bow, hand over): a no-op when the scene has no 3D
    function A() { return (c.act && c.act()) || null; }
    function react(who, kind) { var a = A(); if (a) a.react(who, kind); }

    // The Servant's truth, cut in the lintel of every Order gate (what makes his "dawn" a lie)
    var LINTEL = 'OPEN AT THE SETTING OF THE SUN';
    var ROUND_NAMES = ['', 'Round 1 of 3 · Count the fires', 'Round 2 of 3 · Read the ground', 'Round 3 of 3 · Name the lie'];

    // a look-around choice offered from inside a duel round: same lines and camera as the stage 'look' version
    function alias(from, label, say) {
      return {
        icon: '🔍', label: label, say: say,
        lines: function () { return c.CHOICES[from].lines(); },
        after: function () { c.CHOICES[from].after(); }
      };
    }

    function nextRound(n) { ds.duel.round = n; c.setMission('Duel · ' + ROUND_NAMES[n]); }
    function point(ok) { if (ok) ds.duel.score++; ds.duel.log.push(!!ok); }

    // the Servant is not a stranger once someone has caught him
    function confess() {
      return [
        nar('The old man says nothing for a long breath. Then, slowly, he smiles.'),
        S('Dusk. Yes. The founders cut it over every door.'),
        S('The Oracle’s keepers must tell every visitor one lie. Most nod, and thank me.'),
        S('You did not. You looked.'),
        nar('He presses a small bronze coin into Hermes’s palm. It is cut with a half-lit disc and a notch like a keyhole.', { hold: 1500, fx: function () { c.giveRelic('servant_coin'); if (c.handOver) c.handOver(); } }),
        S('Keep it. If ever you cannot find me, listen for stone that knocks.'),
        H('A coin for a caught lie. I will keep it close, elder.')
      ];
    }
    // a wrong challenge: he said it truly, and he does not forgive being called a liar for it
    function wrongChallenge(why) {
      return [
        H('Elder... Silvia doubts your word.'),
        nar('The iron staff strikes the step once. The braziers flinch.', { fx: function () { react('servant', 'startle'); if (c.cue) c.cue('thud'); if (c.shake) c.shake(0.5); c.fireBurst(0.5); } }),
        S(why),
        S('You call a true thing false. I will not be called a liar twice.'),
        H('Silvia... that was a mistake. He has turned his back on us.')
      ];
    }
    function angered() {
      ds.flags.angered = true; ds.flags.lieLost = true; R(-3);
      ds.stage = ds.backStage || 'after';
      c.setMission('He turned away · earn back the road');
    }
    function catchEffects() { ds.flags.lieCaught = true; ds.flags.coin = true; R(2); }

    var choices = {
      // ---- the Servant's one lie, caught afterwards by whoever checks his word ----
      // The button sends nothing: it opens three reasons to challenge him. One is the lie; two are things he said truly,
      // and a wrong challenge angers him for good.
      lie_catch: {
        icon: '⚖️', label: 'Challenge him.',
        opens: function () { ds.backStage = ds.stage; ds.stage = 'lie_pick'; c.setMission('Why do you challenge him?'); }
      },
      lc_oracle: {
        icon: '👁️', label: '“The Oracle will not receive us.”', say: 'Hermes, tell him: the Oracle will never receive us.',
        lines: function () { return wrongChallenge('The Oracle will receive whoever comes with five seals. That is the rule, and it is no lie.'); },
        after: function () { angered(); }
      },
      lc_dusk: {
        icon: '🌇', label: '“The doors open at dusk, not dawn.”', say: 'Wait. That is not true. The doors open at dusk, not dawn. Hermes, tell him.',
        lines: function () {
          var out = [H('Elder... the lintel above the doors says “' + LINTEL + '”. Not dawn.')];
          return out.concat(confess());
        },
        after: function () { catchEffects(); ds.stage = ds.backStage || 'after'; }
      },
      lc_servant: {
        icon: '🏛️', label: '“You are no true Servant of the Oracle.”', say: 'Hermes, tell him: he is no true Servant of the Oracle.',
        lines: function () { return wrongChallenge('I keep this door for the Oracle. I said so when you asked, and I say so now.'); },
        after: function () { angered(); }
      },
      lc_back: {
        icon: '↩️', label: 'Never mind. Not now.',
        opens: function () { ds.stage = ds.backStage || 'after'; c.setMission('Four seals to go · pick the next road'); }
      },

      // ---- the statues' riddle (observer road) ----
      statue_read: {
        icon: '🗿', label: 'Read the plinths of the stone keepers.', say: 'Hermes, look at the foot of the statues. Is anything written there?',
        lines: function () { return [
          nar('Hermes crosses to the niches and wipes the dust from two worn plinths.', { hold: 1500, fx: function () { look('statues')(); var a = A(); if (a) a.walk('hermes', -3.85, 1.25, { speed: 1.1, face: a.faceTo('hermes', -4.7, 0.2), then: function () { react('hermes', 'kneel'); } }); } }),
          H('Two hollows in the stone, round, empty. And words, very faint.'),
          nar('Left plinth: “I weigh the noon. When the shadow is shortest, I stand guard.”'),
          nar('Right plinth: “I write the hour at the water’s edge, on a bill like a pen. Wading, I wait.”'),
          nar('Between them, in a smaller hand: “Bring us home when the five are told. A sixth door will open.”'),
          H('They want figures in their hollows. Which two, Silvia?')
        ]; },
        after: function () { ds.stage = 'statue'; c.setMission('Answer the stone keepers'); }
      },
      sr_fj: {
        icon: '🦅', label: 'The Falcon and the Jackal.', say: 'The falcon and the jackal.',
        lines: function () { return statueWrong(); }
      },
      sr_fi: {
        icon: '🪶', label: 'The Falcon and the Ibis.', say: 'The falcon, for noon. And the ibis, who writes the hour. The falcon and the ibis.',
        lines: function () { return [
          nar('Dust trickles from the stone hands. The left hollow glows faintly, where a falcon would sit. Then the right.', { fx: function () { c.fireBurst(0.6); if (c.cue) c.cue('reveal'); } }),
          nar('The statues do not move. But something in the stone has woken.', { fx: look('statues') }),
          H('The falcon is in my satchel already: the brass weight from the spring.'),
          H('The ibis... I have never held one. We will need it when we return with five seals.'),
          S('The stone is pleased. It is not easily pleased.')
        ]; },
        after: function () { ds.flags.statues = 'riddle'; R(1); ds.stage = 'hub'; c.focusThing('overview'); c.setMission('The stone keepers are waiting for two figures'); }
      },
      sr_ss: {
        icon: '🐍', label: 'The Scarab and the Serpent.', say: 'The scarab and the serpent.',
        lines: function () { return statueWrong(); }
      },
      statue_back: {
        icon: '↩️', label: 'Step back from the statues.', say: 'Come back, Hermes. We will think on it.',
        lines: function () { return [nar('Hermes steps back from the niches.')]; },
        after: function () { ds.stage = 'hub'; c.focusThing('overview'); c.setMission(ds.knows ? 'Earn the Servant’s trust' : 'Find out who he is'); }
      },

      // ---- the riddle duel (bold road) ----
      duel_open: {
        icon: '⚖️', label: 'Challenge him to a riddle duel instead.', say: 'Hermes, tell him I will not take his test. I challenge him: riddle for riddle.',
        lines: function () { return [
          H('Elder... my companion refuses your question. She asks for a duel instead.'),
          nar('The old man’s eyebrows rise. For a long moment only the braziers speak.', { fx: function () { react('servant', 'startle'); } }),
          S('A duel. Nobody has asked in thirty years.'),
          S('Three riddles. Win two, and you skip my test. I will even answer one thing, truly.'),
          S('And if I win?'),
          nar('His eyes rest on the little flask at Hermes’s belt.', { fx: look('fire') }),
          H('My lamp oil. All of it. It is all that lights the night walk.'),
          H('Silvia... do we accept the wager?')
        ]; },
        after: function () { ds.stage = 'duel_pact'; c.setMission('Accept the wager, or take his test'); }
      },
      duel_yes: {
        icon: '🤝', label: 'Accept the wager: the lamp oil.', say: 'We accept. Tell him, Hermes.',
        lines: function () { return [
          H('We accept, elder.'),
          S('Then we begin.'),
          nar('He plants the iron staff. The star-sight catches the last of the light.', { fx: function () { look('staff')(); if (c.cue) c.cue('stone'); } }),
          S('First riddle. I have iron bowls and I drink oil. I wear tongues of fire.'),
          S('Count the tongues on my landing: how many of me burn?', { fx: look('fire') })
        ]; },
        after: function () { ds.duel = { round: 1, score: 0, log: [] }; ds.flags.duelOpened = true; ds.stage = 'duel'; c.setMission('Duel · ' + ROUND_NAMES[1]); }
      },
      duel_no: {
        icon: '↩️', label: 'Withdraw. Take his test.', say: 'No. Hermes, we take his test after all.',
        lines: function () { return [
          H('Forgive us, elder. We will take your test.'),
          S('Wiser than bold, perhaps.'),
          S(c.STAFF_Q, { fx: look('staff') })
        ]; },
        after: function () { ds.flags.duelDeclined = true; ds.stage = 'test'; c.setMission('Answer his question'); }
      },

      dl_fire: alias('look_fire', 'Ask Hermes to count the fires.', 'Hermes, count the fires on the landing. Carefully.'),
      dl_tracks: alias('look_tracks', 'Ask Hermes to read the ground.', 'Hermes, read the ground at the foot of the stairs.'),
      dl_arch: alias('look_arch', 'Ask Hermes to study the arch.', 'Hermes, study the arch above the doors.'),
      dl_staff: alias('look_staff', 'Ask Hermes to count the points on the staff.', 'Hermes, count the points on his staff.'),

      d1_3: roundAnswer('3️⃣', 'Three.', 'Three burn.', false, function () { return [S('Three? Is the fourth dead, then? It breathes. Look again next time.')]; }, nextTwo),
      d1_4: roundAnswer('4️⃣', 'Four.', 'Four. Even the dying one burns.', true, function () { return [S('Four. You counted the dying one. Most forget the dying.')]; }, nextTwo),
      d1_2: roundAnswer('2️⃣', 'Two.', 'Two.', false, function () { return [S('Two? You did not look.')]; }, nextTwo),

      d2_1: roundAnswer('1️⃣', 'One.', 'One.', false, function () { return [S('One? The sand keeps better count than you.')]; }, nextThree),
      d2_2: roundAnswer('2️⃣', 'Two.', 'Two.', true, function () { return [S('Two. The sand remembers well, and so do you.')]; }, nextThree),
      d2_6: roundAnswer('6️⃣', 'Six.', 'Six.', false, function () { return [S('Six? You count shadows, not feet.')]; }, nextThree),

      d3_a: roundAnswer('☝️', '“Five sockets wait in this arch” is the lie.', 'The lie is “five sockets wait in this arch”.', false, function () { return [S('Five. Count them yourself: the arch does not lie.')]; }, endDuel),
      d3_b: roundAnswer('☀️', '“The doors open only at dawn” is the lie.', 'The lie is “the doors open only at dawn”. They open at dusk.', true, function () { return [H('Elder, the lintel says “' + LINTEL + '”.')]; }, endDuel, true),
      d3_c: roundAnswer('⭐', '“The star on the staff has eight points” is the lie.', 'The lie is “eight points on the star”.', false, function () { return [S('Eight. I carved it myself, in a bad winter.')]; }, endDuel),

      dp_raiders: {
        icon: '🐪', label: 'Ask who came before us.', say: 'My question: who stood on your stairs before us?',
        lines: function () { return [
          S('Riders with camels, two nights ago. They asked after my charts.'),
          S('And after the well under the atrium. I told them I keep no well.'),
          S('Those who ask for charts do not want to read them.'),
          H('Raiders. The same ones who took the Astrolabe, Silvia.')
        ]; },
        after: function () { ds.flags.warned = true; finishPrize(); }
      },
      dp_oracle: {
        icon: '👁️', label: 'Ask what the Oracle values most.', say: 'My question: what does the Oracle value most?',
        lines: function () { return [
          S('A true answer, so I give you one.'),
          S('She listens longer than she speaks.'),
          S('When you stand before her, do the same.'),
          H('I will remember that. So will Silvia.')
        ]; },
        after: function () { ds.flags.secret = true; finishPrize(); }
      }
    };

    function statueWrong() {
      ds.statueMiss = (ds.statueMiss || 0) + 1;
      return [
        nar('Nothing. The stone does not stir.'),
        H(ds.statueMiss > 1 ? 'Still nothing. Read it again, Silvia: noon, and the one who writes.' : 'No... read it again, Silvia. One keeps the noon. One writes the hour.')
      ];
    }

    // One round of the duel: Silvia's line, the Servant's verdict, then the next riddle comes in the same breath
    function roundAnswer(icon, label, say, right, verdict, next, isLie) {
      return {
        icon: icon, label: label, say: say, duel: true,
        lines: function () {
          point(right);
          var out = verdict();
          if (isLie && right) { out = out.concat(confess()); }
          else if (isLie && !right) { out.push(S('You trusted a word over your eyes.')); }
          return out.concat(next(right));
        },
        after: function () { if (isLie && right) catchEffects(); apply(); }
      };
    }
    function nextTwo() {
      nextRoundLater(2);
      return [
        nar('The old man lets the answer settle.'),
        S('Second riddle. Before you came, others stood on my stairs and left before dawn.'),
        S('Count what the sand remembers: how many four-legged travellers carried them?', { fx: look('tracks') })
      ];
    }
    function nextThree() {
      nextRoundLater(3);
      return [
        nar('The braziers hiss. The old man turns his iron staff slowly in his hands.'),
        S('Now you judge me. I tell you three things about my gates. One is a lie.'),
        S('Five sockets wait in this arch.', { fx: look('arch') }),
        S('The bronze doors open only at dawn.'),
        S('The star on my staff has eight points.', { fx: look('staff') }),
        H('One of those is false, Silvia. Which?')
      ];
    }
    // the round counter moves once the lines have played (ds.duel.round is read by the menu)
    var pendingRound = 0;
    function nextRoundLater(n) { pendingRound = n; }
    function endDuel() { pendingRound = 4; return finalVerdict(); }

    function finalVerdict() {
      var s = ds.duel.score, won = s >= 2, out = [];
      if (won) {
        out.push(nar('The old man lowers his staff. The braziers seem to burn a little higher.'),
          S((s === 3 ? 'Three of three.' : 'Two of three.') + ' The test is waived. And a true answer is owed.'),
          H('Well fought, Silvia. Ask him anything.'));
      } else {
        out.push(nar('The old man lowers his staff, almost kindly.'),
          S('Two wins were the price. You have ' + (s === 1 ? 'one' : 'none') + '.'),
          nar('He takes the little flask from Hermes’s belt and empties it into his dying fire.', { hold: 2200, fx: function () { if (c.feedFire) c.feedFire('servant'); else c.fireBurst(1.5); } }),
          S('The oil is mine. Now the test, as it was always going to be.'),
          S(c.STAFF_Q, { fx: look('staff') }),
          H('My lantern is gone, Silvia. The night walk will be black.'));
      }
      return out;
    }
    function finishPrize() { ds.stage = 'hub'; c.focusThing('overview'); c.setMission('You won the duel · show him the seal'); }

    // Once a round's lines have played: move to the next round, or settle the wager after the last one
    function apply() {
      var p = pendingRound;
      pendingRound = 0;
      if (p === 4) {
        var won = ds.duel.score >= 2;
        ds.flags.duel = won ? 'won' : 'lost';
        ds.flags.duelDone = true;
        if (won) { ds.flags.testPassed = true; R(3); ds.stage = 'duel_prize'; c.setMission('Choose your one true answer'); }
        else { ds.flags.lostOil = true; R(-1); ds.stage = 'test'; c.setMission('Answer his question'); }
      } else if (p) nextRound(p);
    }
    function reset() { pendingRound = 0; keepersGiven = {}; }

    function menu(stage) {
      var f = ds.flags, out = [], seen = ds.seen;
      if (stage === 'lie_pick') return ['lc_oracle', 'lc_dusk', 'lc_servant', 'lc_back'];
      if (stage === 'ret') return returnMenu();
      if (stage === 'ret_done' || stage === 'fw_done') return [];
      if (stage === 'fw') return farewellMenu();
      if (stage === 'duel_pact') return ['duel_yes', 'duel_no'];
      if (stage === 'statue') return ['sr_fj', 'sr_fi', 'sr_ss', 'statue_back'];
      if (stage === 'duel_prize') return ['dp_raiders', 'dp_oracle'];
      if (stage === 'duel') {
        var r = ds.duel.round;
        if (r === 1) { out = ['d1_3', 'd1_4', 'd1_2']; if (!seen.fire) out.push('dl_fire'); }
        else if (r === 2) { out = ['d2_1', 'd2_2', 'd2_6']; if (!seen.tracks) out.push('dl_tracks'); }
        else { out = ['d3_a', 'd3_b', 'd3_c']; if (!seen.arch) out.push('dl_arch'); if (!seen.staff) out.push('dl_staff'); }
        return out;
      }
      return null;
    }


    // =====================================================================
    // THE RETURN · the five seals are home and the bronze doors open (stage 'ret')
    // Each road is received differently; the doors open in one of five ways (GatesRoad.ending).
    // =====================================================================
    var Road = window.GatesRoad;
    var SEAL_NAMES = ['', 'the River Wash', 'the Sun Monolith', 'the Sandstone Labyrinth', 'the Canyon Sentry', 'the Solar Altar Arch'];

    // how the Servant greets whoever comes back with five seals: the tone of the first meeting, then what each choice left behind
    function returnLines() {
      var f = ds.flags, out = [
        nar('Dawn. The old man will not let Hermes touch the Oracle’s door yet. He leads him out by the side door and round to the front of Tower II, where the bronze doors are still shut.'),
        nar('He climbs to the top step, his burnt hands wrapped in linen, and stands as if he had never left it.'),
        H('Silvia, I am at the gates again. Five seals in my coat. “She receives no one until the five are home,” he says. He is not looking at me. He is looking at the coat.')
      ];
      // a return that was left half done: the arch already holds what she handed over
      if (ds.ret.sealed) return [
        nar('Dawn, still. The five seals burn in the arch of Tower II, and the old man waits on the top step.'),
        H('The seals are home, Silvia. Only the doors are left.')];
      if (ds.tone === 'bold') out.push(S('The one who came hard. I wondered if the desert would soften you. A little, I see.'));
      else if (ds.tone === 'observer') out.push(S('The one who looked before he spoke. You have been looking all the way here, I think.'));
      else out.push(S('You bowed to me once, at dusk, with a single seal. Now you stand here with five.'));
      if (f.duel === 'won') out.push(S('And you beat me at my own riddles. I have told no one. Keep it so.'));
      else if (f.duel === 'lost') out.push(S('I took your oil, and I do not apologise. I hear the night was dark.'));
      else if (f.gaveOil) out.push(S('Your oil still burns in my column. It has not gone out once.'));
      if (f.blessing) out.push(nar('The red cord still hangs from Hermes’s staff, twelve knots, worn grey by the road.'), S('You kept the cord. Good.'));
      if (f.coin) out.push(nar('Hermes holds up the small bronze coin. The old man glances at it and nods once.'));
      if (f.angered) out.push(S('You once called me a liar for a true word. I remember that, too.'));
      if (f.warned) out.push(S('I doubled the watch on the tower after your warning about the riders. They came. They went back.'));
      out.push(H('The five sockets in the arch, Silvia. He is waiting for the seals.'));
      return out;
    }

    // ---- The seals go home through the satchel: she hands them to Hermes one by one (relic-use.js) ----
    var RU = function () { return window.RelicUse || null; };
    var sealId = function (i) { return 'seal_cairn_' + i; };
    // the seals still in the satchel (Seal I went into the arch at dusk, the day Hermes first stood here)
    function sealsLeft() {
      var ru = RU(), out = [];
      for (var i = ru ? 1 : 2; i <= 5; i++) if (!ru || !ru.isSpent(sealId(i))) out.push(i);
      return out;
    }
    function toArch() { look('arch')(); var a = A(); if (a) a.walk('hermes', -1.0, 1.35, { speed: 1.0, face: a.faceTo('hermes', -0.6, -2) }); }
    function fitOne(i) {
      var ru = RU();
      if (ru) ru.spend(sealId(i), { silent: true });
      react('hermes', 'offer');
      c.fitSeals(ru ? 5 - sealsLeft().length : i);
    }
    var COUNT = ['', 'One more, Silvia. The last socket.', 'Two to go.', 'Three to go. The arch is waking.', 'Four to go.'];
    function askSeals() {
      var ru = RU(), left = sealsLeft();
      if (!ru || !left.length) { c.pick('rt_seals_go'); return; }
      if (ru.isOpen()) return;
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
      out.push(
        S('Five. The arch has not held five since the earthquake.'),
        nar('All five sockets burn the same amber, and the whole arch hums like a struck bell.', { fx: function () { c.fireBurst(1.0); if (c.cue) { c.cue('altarOpen'); c.cue('bell', { f: 196, v: 0.4, len: 5 }); } } }),
        H('The doors have not moved yet, Silvia.'));
      return out;
    }

    function whyShutLines() {
      var f = ds.flags;
      if (f.lieCaught) return [
        H('Elder, you told me one lie once, and Silvia caught it.'),
        S('Every keeper tells every visitor one lie. In all my years, six have noticed. You are the sixth.'),
        S('The lintel says dusk. I said dawn. The doors never cared which. They open for the five.')];
      if (f.lieHeard) return [
        H('You told me the doors open at dawn, elder.'),
        S('It was my lie, the one every keeper tells. The lintel above you says “' + LINTEL + '”, and no one reads it.'),
        H('No harm done. Silvia reads the whole page, as a rule.'),
        S('Then she will read the next one, too.')];
      return [
        H('Why did the doors stay shut for so long?'),
        S('Because they open when the five are home. Not for hurry, and not for hunger.')];
    }

    var keepersGiven = {};
    function askKeepers() {
      var ru = RU();
      if (!ru) { c.pick('rt_keepers_go'); return; }
      var want = ['falcon_weight', 'ibis_figure'].filter(function (id) { return !keepersGiven[id]; });
      if (!want.length) { c.pick('rt_keepers_go'); return; }
      if (ru.isOpen()) return;
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
      return [
        nar('Hermes carries the brass falcon to the left niche and sets it in the round hollow. It fits with a small, dry click.', { hold: 1200, fx: function () { var a = A(); if (a) a.walk('hermes', -3.85, 1.25, { speed: 1.1, face: a.faceTo('hermes', -4.7, 0.2), then: function () { react('hermes', 'offer'); if (c.cue) c.cue('click'); } }); } }),
        nar('The brass ibis goes into the right. For a moment both stone keepers seem to breathe.', { hold: 1600, fx: function () { var a = A(); if (a) a.walk('hermes', 0.95, 2.35, { speed: 1.3, then: function () { a.walk('hermes', 3.85, 1.25, { speed: 1.3, face: a.faceTo('hermes', 4.7, 0.2), then: function () { react('hermes', 'offer'); c.fireBurst(1.2); if (c.cue) c.cue('click'); } }); } }); else c.fireBurst(1.2); } }),
        S('Who read their plinths? They have asked for those two figures for fifty years. No one ever looked at the stone.'),
        nar('A stone disc slides from the base of the niches: a falcon and an ibis, face to face under a rising sun.', { fx: function () { c.giveRelic('statue_seal'); } }),
        H('A sixth seal, Silvia. It opens nothing the five did not. But look at his face.', { fx: function () { var a = A(); if (a) a.walk('hermes', 0.95, 2.35, { speed: 1.2, then: function () { a.walk('hermes', -1.0, 1.38, { speed: 1.2, face: a.faceTo('hermes', -0.6, -2) }); } }); } })];
    }

    // how the bronze doors open, by what the road was
    function openingLines(ending) {
      // each road opens the doors its own way (see openDoors in s13b-gates-tower-ii.js); the humble road is a little
      // ceremony: he comes down to Hermes, bows, goes back up and opens the leaves with his own hands
      var open = function () {
        var a = A();
        if (ending === 'humble' && a) {
          var h = a.where('hermes');
          a.walk('servant', h.x + 0.95, h.z - 0.35, { speed: 0.85, face: function () { var w = a.where('hermes'), me = a.where('servant'); return Math.atan2(-(w.x - me.x), -(w.z - me.z)); }, then: function () {
            react('servant', 'bow'); a.later(0.7, function () { react('hermes', 'bow'); });
            a.later(2.4, function () { a.walk('servant', 0.15, 0.55, { speed: 0.85, face: 0, then: function () { react('servant', 'offer'); c.openDoors('humble'); a.later(2.2, function () { a.walk('servant', 1.5, 0.75, { speed: 0.8, face: 2.6 }); }); } }); });
          } });
        } else if (ending === 'trusted' && a) {
          // Hermes steps back to the right so the little door is seen; the old man opens it and holds it, beside it
          a.walk('hermes', 0.55, 1.75, { speed: 1.0, face: a.faceTo('hermes', -1.1, 0.3) });
          a.walk('servant', -0.45, 0.7, { speed: 0.9, face: 0, then: function () { react('servant', 'offer'); c.openDoors('trusted'); a.later(1.6, function () { a.walk('servant', -0.25, 0.85, { speed: 0.7, face: a.faceTo('servant', 0.55, 1.75) }); }); } });
        } else if (ending === 'bold') { react('servant', 'startle'); c.openDoors('bold'); }
        else if (ending === 'observer') { react('servant', 'offer'); c.openDoors('observer'); }
        else c.openDoors(ending === 'humble' || ending === 'trusted' ? ending : 'keepers');
      };
      var out;
      if (ending === 'keepers') out = [
        nar('Before the old man can lift his staff, the two stone keepers turn their heads toward the doors. The brass falcon and the brass ibis begin to glow.', { fx: function () { react('servant', 'startle'); c.fireBurst(1.4); } }),
        nar('On each bronze leaf a half of the Order’s sign slides toward the middle. They meet. The half-lit disc is whole at last.', { fx: open }),
        S('I have kept these doors a long time. I have never seen them open like this.'),
        H('We were right to read the plinths, Silvia.')];
      else if (ending === 'trusted') out = [
        nar('The old man does not touch the great doors. He opens a small wicket cut into the left leaf, and holds it.', { hold: 1500, fx: open }),
        S('Those who hear a secret use the small door. The founders cut it for the ones who are trusted.'),
        H('A little door, Silvia, and a whole life behind it.')];
      else if (ending === 'bold') out = [
        nar('The old man strikes the stone with his iron staff. The doors fly open with a boom, and a cloud of pigeons bursts from the cornice.', { fx: open }),
        S('You came hard. Go in hard. The Oracle prefers it to dithering.'),
        H('I think he is enjoying himself, Silvia.')];
      else if (ending === 'observer') out = [
        nar('The old man says nothing. He lifts one finger, and the doors part without a sound, exactly as far as a person needs.', { fx: open }),
        S('You looked at everything before you spoke. Look at this.'),
        H('A long hall of mirrors and morning light, Silvia. And the stone keepers follow me with their eyes.')];
      else out = [
        nar('The old man comes down from the top step for the first time, and bows to Hermes. Then he lays both hands on the leaves.', { hold: 3500, fx: open }),
        S('Enter, travellers. This house is yours.'),
        H('He bowed first, Silvia.')];
      if (ds.flags.coin && ending !== 'keepers' && !(RU() && RU().isSpent('servant_coin'))) out.push(S('The coin has not finished its work. Keep it close on the stair.'));
      out.push(
        nar('Beyond the doors lies the burned atrium, and at the back of it a short stair cut down into the rock.'),
        S('Come. The inner stair is this way.'),
        H('Tell me when the page “The Oracle’s Horizon” is open, Silvia.'));
      return out;
    }

    // =====================================================================
    // THE FAREWELL · dawn at the gates, the last scene of the Desert Path (stage 'fw'; desert-farewell.js launches it)
    // Hermes and Aurelia leave for Tower III. Silvia chooses the gestures of the goodbye; then the doors close and the seals burn.
    // =====================================================================
    function fwHas(id) { var ru = RU(); return ru ? ru.has(id) : false; }
    function farewellLines() {
      return [
        nar('Dawn. The bronze doors of Tower II stand open, and for the first time in fifty-five years Aurelia walks out through them.', { hold: 1400, fx: function () { react('aurelia', 'wonder'); } }),
        nar('She stops on the top step, bare-faced in the cold light, and looks at the desert as if someone had moved it in the night.'),
        AU('It is bigger than I drew it.'),
        H('We are on the steps, Silvia, with the road east at our feet. The Servant has come to see us off. He is pretending he has not.'),
        S('I came to shut the doors. Someone has to.')];
    }
    function veilLines() {
      return [
        H('Silvia asks about your veil, Aurelia.'),
        nar('Aurelia unpins the grey veil from her shoulder, folds it in four, and lays it in the old man’s wrapped hands.', { hold: 1500, fx: function () { react('aurelia', 'offer'); var a = A(); if (a) a.later(0.9, function () { react('servant', 'bow'); }); } }),
        AU('Keep it, old friend. The desert can do without an Oracle for one winter.'),
        S('And if someone comes to ask the Oracle a question?'),
        AU('Tell them she has gone to ask one of her own.')];
    }
    function cordLines() {
      return [
        nar('Hermes holds out his staff. The red cord hangs from it, twelve knots, worn grey by the road.', { fx: function () { react('hermes', 'offer'); } }),
        nar('The old man takes it in his burnt fingers and, slowly, ties one more.', { hold: 1700, fx: function () { react('servant', 'offer'); if (c.cue) c.cue('click'); } }),
        S('Twelve knots for the road you walked. One for the road you have not.'),
        H('The thirteenth, Silvia. He pulled it tighter than all the others.')];
    }
    function compassLines() {
      return [
        nar('Aurelia takes the brass compass from Hermes, taps the glass, and turns the little screw on its back with her thumbnail.', { hold: 1600, fx: function () { react('hermes', 'offer'); var a = A(); if (a) a.later(0.8, function () { react('aurelia', 'nod'); }); } }),
        AU('Two degrees east. It has been two degrees east since the day it was made.'),
        H('Two degrees, Silvia. It lay in a rock shelf for twenty-eight years, I walked this whole desert by it, and nobody told me.'),
        AU('I am telling you now.')];
    }
    function flintLines() {
      return [
        nar('Hermes lays his flint and tinder on the rim of the bronze brazier.', { fx: function () { if (c.feedFire) c.feedFire('hermes'); else react('hermes', 'offer'); } }),
        H('For your lamp, elder. Mine has had its share of fire.'),
        S('I will light it at dusk. Every dusk, until you are back.')];
    }
    function eastLines() {
      var fw = ds.fw || {};
      var out = [
        nar('They go down the steps together, Aurelia a pace ahead. Behind them the old man lays both hands on the bronze leaves, and closes them.', { hold: 3200, fx: function () {
          var a = A();
          if (a) {
            a.walk('aurelia', -0.6, 3.9, { speed: 0.9, face: Math.PI });
            a.walk('hermes', -1.5, 3.4, { speed: 0.9, face: a.faceTo('hermes', 0.2, 0.4) });
            a.walk('servant', 0.15, 0.6, { speed: 0.8, face: 0, then: function () { react('servant', 'offer'); c.openDoors('shut'); if (c.cue) c.cue('stone'); } });
          } else c.openDoors('shut');
        } }),
        nar('In the arch the five seals catch the first sun, one after the other, and burn like five small suns.', { hold: 2200, fx: function () { look('arch')(); c.sealGlow(); c.fireBurst(1.2); if (c.cue) { c.cue('starAlign', { count: 3, all: true }); c.cue('bell', { f: 196, v: 0.4, len: 5 }); } } }),
        S('As long as they burn, the house is kept. Go.', { fx: function () { var a = A(); if (a) a.walk('servant', 0.95, 0.95, { speed: 0.8, face: 2.44 }); } })];
      if (fw.veil) out.push(nar('He stands on the top step with the folded veil against his chest, and does not go in.'));
      out.push(
        H('Five lights in the arch, Silvia. I can still see them from the road. You put every one of them there.', { fx: function () { look('overview')(); react('hermes', 'bow'); } }),
        AU('Come along, surveyor. The east will not wait for a man who looks back.'));
      return out;
    }
    var farewellChoices = {
      fw_veil: {
        icon: '🕊', label: 'Ask Aurelia about the Oracle’s veil.', say: 'Hermes, ask her about the veil. Is she taking it?',
        lines: veilLines, after: function () { ds.fw.veil = true; }
      },
      fw_cord: {
        icon: '🧶', label: 'Show the Servant his red cord.', say: 'The red cord, Hermes. Show him you kept it all the way.',
        lines: cordLines, after: function () { ds.fw.cord = true; }
      },
      fw_compass: {
        icon: '🧭', label: 'Let Aurelia see the compass.', say: 'Give Aurelia your compass for a moment, Hermes. She corrected your chart in a minute.',
        lines: compassLines, after: function () { ds.fw.compass = true; }
      },
      fw_flint: {
        icon: '🔥', label: 'Leave the flint with the Servant.', say: 'Leave him your flint and tinder, Hermes. For his lamp.',
        lines: flintLines,
        after: function () { ds.fw.flint = true; var ru = RU(); if (ru) ru.spend('flint_tinder', { silent: true }); }
      },
      fw_go: {
        icon: '🌅', label: 'East, Hermes. The road is waiting.', say: 'East, Hermes. Both of you. The road is waiting, and so am I.',
        lines: eastLines,
        after: function () { ds.stage = 'fw_done'; c.setMission('The road east'); c.finishFarewell(ds.fw); }
      }
    };
    for (var fk in farewellChoices) choices[fk] = farewellChoices[fk];
    function farewellMenu() {
      var fw = ds.fw || {}, out = [];
      if (!fw.veil) out.push('fw_veil');
      if (!fw.cord && fwHas('red_cord')) out.push('fw_cord');
      if (!fw.compass && fwHas('surveyor_compass')) out.push('fw_compass');
      if (!fw.flint && fwHas('flint_tinder')) out.push('fw_flint');
      return out.concat(['fw_go']);
    }

    var returnChoices = {
      // she hands the seals over from the satchel; the reply goes to the Servant only when the arch is full (or she lets Hermes finish)
      rt_seals: {
        icon: '🎒', label: 'Hand Hermes the seals for the arch.',
        opens: function () { toArch(); askSeals(); }
      },
      rt_seals_go: {
        icon: '🗝️', label: 'Fit the five seals into the arch.', say: 'Hermes, the five seals. Fit them into the arch, one by one.',
        lines: fitLines, after: function () { ds.ret.sealed = true; Road.saveReturn({ sealed: true }); c.setMission('The five seals are home'); }
      },
      rt_ask: {
        icon: '💬', label: 'Ask why the doors stayed shut for so long.', say: 'Ask him, Hermes: why did the doors stay shut for so long?',
        lines: whyShutLines, after: function () { ds.ret.asked = true; Road.saveReturn({ asked: true }); }
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
      },
      rt_open: {
        icon: '🚪', label: 'Ask him to open the bronze doors.', say: 'Elder, the five seals are home. Open the doors.',
        lines: function () { return openingLines(Road.ending(ds.flags, ds.tone, ds.ret.keepers)); },
        after: function () {
          var ending = Road.ending(ds.flags, ds.tone, ds.ret.keepers);
          Road.saveReturn({ done: true, ending: ending, keepers: !!ds.ret.keepers });
          ds.stage = 'ret_done';
          c.finishReturn(ending, !!ds.ret.keepers);
        }
      }
    };
    for (var rk in returnChoices) choices[rk] = returnChoices[rk];

    function returnMenu() {
      var out = [];
      if (!ds.ret.sealed) return ['rt_seals', 'rt_ask'].filter(function (id) { return !(id === 'rt_ask' && ds.ret.asked); });
      if (!ds.ret.asked) out.push('rt_ask');
      if (!ds.ret.keepers && Road.canPayKeepers(ds.flags)) out.push('rt_keepers');
      if (!ds.ret.survey && RU() && RU().has('raiders_survey')) out.push('rt_survey');
      return out.concat(['rt_open']);
    }

    // extra replies to slot into the scene's own menus
    function add(stage) {
      var f = ds.flags, out = [];
      if (stage === 'test' && ds.tone === 'bold' && !f.duelOpened && !f.duelDeclined) out.push('duel_open');
      if ((stage === 'hub' || stage === 'after') && ds.tone === 'observer' && ds.seen.statues && !f.statues) out.push('statue_read');
      if (stage === 'after' && f.lieHeard && !f.lieCaught && !f.lieLost && (ds.seen.arch || ds.asked.diary)) out.push('lie_catch');
      return out;
    }

    if (window.RelicUse) {
      var inReturn = function () { return ds.mode === 'return' && ds.stage === 'ret' && !ds.busy; };
      window.RelicUse.register('raiders_survey', function () { if (!inReturn() || !ds.ret.sealed || ds.ret.survey) return false; c.pick('rt_survey'); return true; });
      [1, 2, 3, 4, 5].forEach(function (i) { window.RelicUse.register(sealId(i), function () { if (!inReturn() || ds.ret.sealed) return false; toArch(); fitOne(i); if (sealsLeft().length) askSeals(); else c.pick('rt_seals_go'); return true; }); });
    }

    return { choices: choices, menu: menu, add: add, reset: reset, lintel: LINTEL, returnLines: returnLines, farewellLines: farewellLines };
  };
})();
