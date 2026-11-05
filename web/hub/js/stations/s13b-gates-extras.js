// At the Gates of Tower II · the long scenes: the riddle duel, the statues' riddle and the Servant's one lie.
// Loaded before s13b-gates-tower-ii.js, which hands over its dialogue helpers and merges what this returns:
//   GatesExtras(ctx) -> { choices, menu(stage) -> ids | null, add(stage) -> ids, returnLines() -> lines }
// The second half is the return: five seals home, the bronze doors open (stage 'ret'; Station 19 launches it).
// Everything here only talks through ctx (the scene's state `ds`, its line builders and its 3D hooks); it never touches the DOM.
(function () {
  'use strict';

  window.GatesExtras = function (c) {
    var ds = c.ds, nar = c.nar, H = c.sayH, S = c.sayS, V = c.sayV, look = c.look, R = c.R;

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
        nar('He presses a small bronze coin into Hermes’s palm. It is cut with a half-lit disc and a notch like a keyhole.', { fx: function () { c.giveRelic('servant_coin'); } }),
        S('Keep it. If ever you cannot find me, listen for stone that knocks.'),
        H('A coin for a caught lie. I will keep it close, elder.')
      ];
    }
    // a wrong challenge: he said it truly, and he does not forgive being called a liar for it
    function wrongChallenge(why) {
      return [
        H('Elder... Silvia doubts your word.'),
        nar('The iron staff strikes the step once. The braziers flinch.'),
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
          nar('Hermes crosses to the niches and wipes the dust from two worn plinths.', { fx: look('statues') }),
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
          nar('Dust trickles from the stone hands. The left hollow glows faintly, where a falcon would sit. Then the right.'),
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
          nar('The old man’s eyebrows rise. For a long moment only the braziers speak.'),
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
          nar('He plants the iron staff. The star-sight catches the last of the light.', { fx: look('staff') }),
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
          nar('He takes the little flask from Hermes’s belt and empties it into his dying fire.', { fx: function () { c.fireBurst(1.5); } }),
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
    function reset() { pendingRound = 0; }

    function menu(stage) {
      var f = ds.flags, out = [], seen = ds.seen;
      if (stage === 'lie_pick') return ['lc_oracle', 'lc_dusk', 'lc_servant', 'lc_back'];
      if (stage === 'ret') return returnMenu();
      if (stage === 'ret_done') return [];
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
        nar('Dawn. Tower II is the colour of a ripe peach, and the bronze doors are still shut. The old man is already on the top step, as if he had never left it.'),
        H('Silvia, I am at the gates again. Five seals in my coat. He is not looking at me. He is looking at the coat.')
      ];
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

    function fitLines() {
      var out = [nar('Hermes climbs the steps. The first seal still glows in its socket, high in the arch, where he fitted it at dusk.')];
      [2, 3, 4, 5].forEach(function (i) {
        out.push(nar('The seal of ' + SEAL_NAMES[i] + ' goes into its socket and turns.', { fx: function () { c.fitSeals(i); } }));
      });
      out.push(
        S('Five. The arch has not held five since the earthquake.'),
        nar('All five sockets burn the same amber, and the whole arch hums like a struck bell.'),
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

    function keepersLines() {
      return [
        nar('Hermes carries the brass falcon to the left niche and sets it in the round hollow. It fits with a small, dry click.'),
        nar('The brass ibis goes into the right. For a moment both stone keepers seem to breathe.', { fx: function () { c.fireBurst(1.2); } }),
        S('Who read their plinths? They have asked for those two figures for fifty years. No one ever looked at the stone.'),
        nar('A stone disc slides from the base of the niches: a falcon and an ibis, face to face under a rising sun.', { fx: function () { c.giveRelic('statue_seal'); } }),
        H('A sixth seal, Silvia. It opens nothing the five did not. But look at his face.')];
    }

    // how the bronze doors open, by what the road was
    function openingLines(ending) {
      var open = function () { c.openDoors(1); };
      var out;
      if (ending === 'keepers') out = [
        nar('Before the old man can lift his staff, the two stone keepers turn their heads toward the doors. The brass falcon and the brass ibis begin to glow.', { fx: function () { c.fireBurst(1.4); } }),
        nar('On each bronze leaf a half of the Order’s sign slides toward the middle. They meet. The half-lit disc is whole at last.', { fx: open }),
        S('I have kept these doors a long time. I have never seen them open like this.'),
        H('We were right to read the plinths, Silvia.')];
      else if (ending === 'trusted') out = [
        nar('The old man does not touch the great doors. He opens a small wicket cut into the left leaf, and holds it.', { fx: open }),
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
        nar('The old man comes down from the top step for the first time, and bows to Hermes. Then he lays both hands on the leaves.', { fx: open }),
        S('Enter, travellers. This house is yours.'),
        H('He bowed first, Silvia.')];
      if (ds.flags.coin && ending !== 'keepers') out.push(S('The coin has done its work. Keep it as a memory.'));
      out.push(
        nar('Beyond the doors lies the burned atrium, and at the back of it a short stair cut down into the rock.'),
        S('Come. The inner stair is this way.'),
        H('Tell me when the page “The Oracle’s Horizon” is open, Silvia.'));
      return out;
    }

    var returnChoices = {
      rt_seals: {
        icon: '🗝️', label: 'Fit the five seals into the arch.', say: 'Hermes, the five seals. Fit them into the arch, one by one.',
        lines: fitLines, after: function () { ds.ret.sealed = true; c.setMission('The five seals are home'); }
      },
      rt_ask: {
        icon: '💬', label: 'Ask why the doors stayed shut for so long.', say: 'Ask him, Hermes: why did the doors stay shut for so long?',
        lines: whyShutLines, after: function () { ds.ret.asked = true; }
      },
      rt_keepers: {
        icon: '🗿', label: 'Pay the two stone keepers.', say: 'Hermes, the stone keepers. They asked for a falcon and an ibis. Pay them.',
        lines: keepersLines, after: function () { ds.ret.keepers = true; }
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

    return { choices: choices, menu: menu, add: add, reset: reset, lintel: LINTEL, returnLines: returnLines };
  };
})();
