window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};
// Field Wire script, steps 17 to 24 (docs/DESERT_ODYSSEY_BIBLE.md, "Estándar del chat del Field Wire"): the shepherd and the veiled woman
// at the edge of the hardpan (17, 18), the debrief of Cairn IV (19, 20), dusk at Cairn IV (21, 22) and the debrief of the Arch of the Solstice (23, 24).
// Texts are beats (an array of short messages); a function (W) => beats reads what she chose before (see hub-core.js, window.WireScript).
// An { ask: [...] } inside a list of beats is a quick interjection: Silvia taps one of two or three lines, and Hermes answers in a beat or two.
(function () {
  const S = window.WIRE_SCRIPT;
  const ls = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  // The seals as Hermes counted them at the time he spoke (mirrors sealsAtGates, sealsAtAltar and sealsPhrase of hub-core.js),
  // so a replay never rewrites what he said, and the words match the telemetry line under each ending.
  const gateSeals = () => { const s = ls('order_monolith_gate_seal1'); return (s !== null ? s === 'true' : ls('order_seal_cairn_1') === 'true') ? 1 : 0; };
  const altarSeals = () => { const n = parseInt(ls('order_cairn5_seals_at_altar') || '', 10); return n >= 1 && n <= 5 ? n : Math.min(5, gateSeals() + 4); };
  const sealsWord = (n) => (['No', 'One', 'Two', 'Three', 'Four', 'Five'][n] || String(n)) + (n === 1 ? ' seal' : ' seals');
  const by = (list, i) => (typeof i === 'number' && list[i] != null ? list[i] : null);
  const beats = (list) => list.filter(Boolean);
  const ask = (W, step, part, i) => (typeof W.ask === 'function' ? W.ask(step, part, i) : null);

  // ---- 17 · Dusk at the edge of the hardpan: the shepherd, the veiled woman, the raiders' wagons ----
  S[17] = {
    hermesInitial: (W) => {
      // what she answered at the end of the dream of 1998 stays with him
      const echo = { hands: 'I woke with river stone on my hands, Silvia, and for once I know whose work they have been doing.', never: 'I woke as the last surveyor of the Order, Silvia, and it sits on me more lightly than I feared.', finish: 'I woke with a meridian to finish, Silvia: two cairns never fell, and tonight I start walking toward the first of them.' }[W.dream('end')];
      return beats([
        echo,
        'Dusk, Silvia. The hardpan begins at the last rocks, and an old shepherd with twelve black goats has shared his water with me.',
        'While I drank, the oldest of his goats ate a corner of my log and looked me in the eye. I think it was a review.',
        'He says one night takes you across it, if you walk toward the singing: the pillars of Cairn IV, heard from the Natural Bridge.',
        { ask: [
          { text: 'Drink, and fill every flask.', silviaMsg: 'Drink up, Hermes, and fill every flask you own. The hardpan has no springs.', reply: ['Two cups, and every flask to the brim. The seep gives slowly, and the shepherd waited without a word.', 'He says the cracked clay drinks a man’s water by midnight. I believe him.'] },
          { text: 'Can you trust him?', silviaMsg: 'Can you trust him, Hermes? Nobody just hands water to a stranger.', reply: ['I watched his hands. He never looked at my satchel, only at my boots.', 'A man with a plan stares at the bag. He asked for nothing, and that unsettles me more.'] },
          { text: 'And how are the goats?', silviaMsg: 'And the goats, Hermes? Did they approve of you?', reply: ['The oldest one kept an eye on my log for the rest of the evening, in case I wrote anything worth eating.', 'The rest ignored me. Goats judge character very well.'] }
        ] },
        'Then he told me something I cannot shake off: every autumn, on clear nights, a veiled woman comes down from the sandstone and sings to the stars.',
        'The herders leave her milk and dates on a flat stone. Nobody has ever seen her face.',
        { ask: [
          { text: 'Do not go near her.', silviaMsg: 'Stay away from her song, Hermes. We do not know who she is.', reply: ['Agreed. The herders leave her food and keep away, and so will I.', 'Some kindnesses are best left on a flat stone.'] },
          { text: 'Maybe she needs help.', silviaMsg: 'What if she is alone out there, Hermes? Maybe she needs help.', reply: ['Veiled, alone, singing in the cold? I wondered the same.', 'If I hear her, I will stop and listen with my lamp dark. I will not frighten her.'] },
          { text: 'Singing to the stars? Like you.', silviaMsg: 'Singing to the stars? Hermes, that sounds like someone I know.', reply: ['I only talk to them, Silvia, and mostly to complain.', 'But I will admit it: I like her already.'] }
        ] },
        'The raiders’ wagons came by at first light, he says: south-west, in a hurry. What do I ask him before I lose the light?'
      ]);
    },
    choices: [
      {
        text: 'Ask him about the veiled woman.',
        silviaMsg: 'Ask him about the veiled woman, Hermes. What does she sing?',
        hermesReply: (W) => beats([
          'He hummed it for me, in a voice like a dry hinge: five or six notes that rise and fall, the way you sing to a child who cannot sleep.',
          'The goats go quiet when she sings, he says. All of them at once. I wrote the notes in my log, and my hand shook, and I do not know why.',
          by([
            'My last dates go on her flat stone, from a distance. The desert keeps accounts.',
            'My last dates go on her flat stone, and I will wait a while in case she comes.',
            'My last dates go on her flat stone. A fellow stargazer deserves a snack.'
          ], ask(W, 17, 'i', 1)) || 'My last dates go on her flat stone. The desert keeps accounts.'
        ])
      },
      {
        text: 'Ask him the way over the Natural Bridge.',
        silviaMsg: 'Ask him the safest way over the Natural Bridge, Hermes. The page “The Natural Bridge of the Sentinel Mesa” shows switchbacks on the east side.',
        hermesReply: [
          '‘The cart track crosses the bridge on its back,’ he says, ‘but the switchbacks below are too tight for a wagon. Men, yes. Wagons, never.’',
          'He drew them in the dust, turn by turn, and it matches your page “The Eastern Buttress & Lower Wash”. The second turn is the one that eats wagons.',
          'So I keep off the cart track and go through the rocks. A road good for wagons is good for raiders.'
        ]
      },
      {
        text: 'Ask how many raiders he saw.',
        silviaMsg: 'Ask him how many raiders he saw, Hermes, and whether they had the Astrolabe with them.',
        hermesReply: [
          'Three wagons and a dozen men, with ash on their sleeves. One wagon is covered with oilcloth and guarded day and night.',
          'He never saw what is under it. I did not need him to.',
          'A dozen men cannot watch a whole hardpan, but a lamp can be seen for miles. Tonight I walk without mine.'
        ]
      }
    ]
  };

  // ---- 18 · Setting out across the hardpan (18 h) ----
  S[18] = {
    hermesFinal: (W) => {
      const g = gateSeals();
      return beats([
        by([
          'The dates are on her stone. Now I walk toward the singing, and I will listen for her as well as for the pillars.',
          'The second turn is marked in my log. If a wagon is going to stick anywhere, it will be there.',
          'My lamp is wrapped in my coat. Give my eyes an hour and I will see like one of his goats.'
        ], W.choice(17)) || 'The shepherd has gone back to his goats, and I am going now.',
        (by([
          'Every flask is full. ',
          'I have not let go of the satchel once. ',
          'A goat ate a corner of my log. '
        ], ask(W, 17, 'i', 0)) || '') + 'Eighteen hours: the hardpan by night, the Natural Bridge, the gorge of Cairn IV. I sleep when the sun is high.',
        'Keep the page “Cairn IV: Sentry of the Canyon” close: the survey log of the seven echoes. ' + sealsWord(g + 2) + ' with me, ' + sealsWord(3 - g).toLowerCase() + ' to find.'
      ]);
    }
  };

  // ---- 19 · Debrief of Cairn IV: the pillars sang the disc's code, the pebble, and the dawn on the Natural Bridge ----
  S[19] = {
    hermesInitial: (W) => {
      const b = W.bridge();
      const split = {
        cross: 'And what we saw through the glass is what happened: the raiders split. The four on foot heard my stone fall in the gorge and are on my tracks.',
        hide: 'And what we saw through the glass is what happened: the raiders split. The four on foot, one limping, walked over my head and found nothing.',
        trail: 'And what we saw through the glass is what happened: the raiders split. The four on foot still hunt the blue cloth, and it will not fool them long.'
      }[b] || 'Yesterday at dawn, from the Natural Bridge, I saw the raiders stuck at the switchbacks. They split, and a few men on foot follow my tracks.';
      return beats([
        'Silvia, I have barely slept. I am sitting between the singing pillars of Cairn IV.',
        'Cairn IV never fell: its reeds are the founders’ own. SUN, ECHO, STONE: the cairns are instruments, and the Order measured the desert with them.',
        'The last verse stopped my heart: three short calls, a pause, two long. Aurelia’s disc code, and the blink I saw in the desert in 2016.',
        { ask: [
          { text: 'Listen again, to be sure.', silviaMsg: 'Listen once more, Hermes. Make sure it is not just the wind playing tricks.', reply: ['I waited for the next gust and counted. Three short, a pause, two long. The same, every time.', 'No wind keeps a pause that careful. It sings like a door asking for its key.'] },
          { text: 'Are you all right? Sit down.', silviaMsg: 'Are you all right, Hermes? Sit down and breathe.', reply: ['I am sitting. I am also shaking like a leaf, and I have eaten nothing since the seep.', 'But I have never felt so awake. Ask me again after I sleep.'] },
          { text: 'Is it exactly the same rhythm?', silviaMsg: 'Is it exactly the same rhythm as the one you saw in 2016, Hermes? Down to the pause?', reply: ['I checked my notebook of that autumn. Same count, same pause, as if copied by a careful hand.', 'In ten years I never met anyone who could know that rhythm. Until today.'] }
        ] },
        'And wedged in the throat of the Left pillar, a river pebble with a small gold star on blue. Someone tuned this canyon for me.',
        split,
        'The wagons, and the one under oilcloth, turned back north-east. Toward Tower II.'
      ]);
    },
    choices: [
      {
        text: 'Keep the pebble. It’s a message.',
        silviaMsg: 'Keep that pebble safe, Hermes. Nobody tunes a canyon by accident: it’s a message, and it’s meant for you.',
        hermesReply: (W) => beats([
          'It rides in the brass box now, beside the grain of blue from Cairn II. Blue, then a gold star in the labyrinth, now the same star on a pebble.',
          'A river pebble in a canyon that has never seen a river. Somebody carried it here on purpose.',
          (W.chose(15, 0) || W.chose(15, 2))
            ? 'I told you I would look for the next star, Silvia. I did not expect it so small, or a message I fear to read to the end.'
            : 'I used to ask who walks ahead of me. Tonight I ask what they want me to find, and I am afraid to read it to the end.'
        ])
      },
      {
        text: 'The Sanctuary is in danger. Hurry.',
        silviaMsg: 'If the wagons are heading to Tower II, the Sanctuary is in danger. The Servant is alone there. You have to hurry.',
        hermesReply: [
          'You are right. A gate with one old man behind it is not a gate. It is a hope.',
          'So I sleep through the worst of the heat, and not a minute past dusk. Then I walk until my legs refuse, and a little further.',
          'The Servant would say a hurried man walks into traps. I intend to hurry with my eyes open.'
        ]
      },
      {
        text: 'The cairns are instruments...',
        silviaMsg: 'Sun, echo, stone... the cairns are instruments. Then the Astrolabe was never meant to work alone, was it?',
        hermesReply: [
          'No. I think the Astrolabe reads what the cairns measure, the way a musician reads a score.',
          'Alone it knows six master stars, and the rest it must be told. Without the five seals it is only brass.',
          'That is why the raiders wait for me to open the cairns, not break them. The seals are pages of a score, and none leaves my coat.'
        ]
      }
    ]
  };

  // ---- 20 · The Seal of Cairn IV and the road to the last cairn ----
  S[20] = {
    hermesFinal: (W) => {
      const g = gateSeals();
      return beats([
        sealsWord(g + 3) + ' of five, Silvia. The reed of Cairn IV gives your Cipher Ledger two lines: [U] + [Z] = 9 and [S] + [U] = 17.',
        by([
          'The pebble is back in its brass box, and I keep opening the lid to look at it, like a man checking a letter he cannot read.',
          'My pack is already by the door of the chamber, and I will sleep with my boots on.',
          'The reeds still sing in my head, SUN, ECHO, STONE, like a score I cannot stop reading.'
        ], W.choice(19)) || 'The pillars have gone quiet, and I miss them already.',
        (g ? 'One cairn left: ' : 'One cairn left on this road: ') + 'Cairn V, above the Arch of the Solstice (Station 17). Its seal sleeps in the Solar Altar, on the raiders’ road.'
      ]);
    }
  };

  // ---- 21 · Dusk at Cairn IV: the midsummer line, and a November sun ----
  S[21] = {
    hermesInitial: [
      'Dusk again, Silvia, and I am leaving the pillars behind. Before the light went I read the page “Arch of the Solstice & The Solar Altar” once more.',
      '‘At midsummer dawn, the sun’s first ray slips beneath the arch.’ That line will not let me go.',
      'The founders built the Courtyard of Rays for the longest day of the year. It is November, Silvia.',
      { ask: [
        { text: 'Ask the Servant what to do.', silviaMsg: 'Could you ask the Servant, Hermes? He must know how the courtyard works in autumn.', reply: ['He would know in one sentence. But no wire reaches Tower II, and I will not flash a light at the very men I am avoiding.', 'The answer will have to come from the Arch itself.'] },
        { text: 'We could wait until June.', silviaMsg: 'Fine, we wait until June. I will bring snacks.', reply: ['Splendid. I will bring a chair and a very long book.', 'The raiders, on the other hand, bring wagons, and they do not read.'] },
        { text: 'Will the seal stay locked?', silviaMsg: 'Hermes, will the last seal really stay locked? What if there is no way?', reply: ['The Order never built a lock without a key, Silvia, only keys that wait for the right hand.', 'And you have solved several of them. I trust that more than any calendar.'] }
      ] },
      'The autumn sun rises far to the south, so its first ray falls elsewhere. If the courtyard stays blind, the last seal waits until June.',
      'I do not have until June. And the raiders’ ruts on the road east are fresh: eighteen hours to the Arch, and no sleep.',
      { ask: [
        { text: 'Rest an hour first, please.', silviaMsg: 'Eighteen hours with no sleep, Hermes? Please rest an hour first.', reply: ['An hour is what the raiders need to gain a day on me.', 'I will rest at the Arch, once the mirrors are set and I have earned it.'] },
        { text: 'Eat and drink as you go.', silviaMsg: 'Eat and drink as you walk, Hermes. Do not forget.', reply: ['Water at every ridge, dates in my left pocket, and a cloth over my mouth against the dust. The shepherd taught me.', 'Do not worry. I have been rationing water since before you could walk.'] },
        { text: 'How fresh are the ruts?', silviaMsg: 'How fresh are those ruts, Hermes? Hours? A day?', reply: ['Sharp edges, no wind on them yet: a day old, no more, I would say.', 'They do not wander, Silvia. The raiders know this road, and they are not exploring.'] }
      ] },
      'I count three problems: the courtyard, the Sanctuary, and the men on my heels. Which one keeps you awake?'
    ],
    choices: [
      {
        text: 'Then we’ll turn the mirrors for an autumn sun.',
        silviaMsg: 'Then we’ll turn the mirrors ourselves, Hermes. If the founders aimed them for June, we can aim them for November.',
        hermesReply: [
          'Turn the founders’ mirrors... A year ago I would have called that sacrilege.',
          'Tonight it sounds like the only sensible thing anyone has said to me. Bronze can be turned.',
          'And I need not wait for dawn to begin. I will set what can be set in the dark, and write every turn in my notes for you.'
        ],
        onPick: (W) => { W.hint('s17-dawn', 1); }
      },
      {
        text: 'Can you see Tower II from the Arch?',
        silviaMsg: 'Will you be able to see Tower II from the Arch? I want to know what’s happening at the Sanctuary.',
        hermesReply: [
          'From the terrace of the altar, yes. At the Natural Bridge it was a grain of rice on the horizon. From the Arch, a thumbnail.',
          'If the wagons are there, I will see their fires. If something else is there, I will see that too.',
          'I will sit up on the terrace tonight with the spyglass and wire you whatever moves.'
        ]
      },
      {
        text: 'Watch your back. They’re still following you.',
        silviaMsg: 'Watch your back, Hermes. The ones on foot are still following you.',
        hermesReply: (W) => beats([
          'I walk on stone and stop at every ridge to look back. Twice already I have seen a glint behind me: spyglasses.',
          ({
            cross: 'They heard my stone fall at the bridge, and they have not forgotten it.',
            hide: 'The one who limps slows them down. I am counting on his foot.',
            trail: 'They swallowed the blue cloth once. A man does not swallow it twice.'
          })[W.bridge()] || 'They know my road, Silvia. They only do not know my hour.',
          'They want me to open the last cairn for them. Tonight I walk on bare rock, brush my tracks away, and lose them in the Lower Wash.'
        ])
      }
    ]
  };

  // ---- 22 · East to the Arch of the Solstice (18 h, no sleep) ----
  S[22] = {
    hermesFinal: (W) => {
      const g = gateSeals();
      return beats([
        (by([
          'I will turn bronze mirrors in my head all the way. ',
          'I will glance north-east at every ridge, in case a fire rises at Tower II. ',
          'My back has carried heavier things than a few men on foot. '
        ], W.choice(21)) || '') + sealsWord(g + 3) + ' with me; the seal of Cairn V waits under the Arch.',
        'Eighteen hours east without sleep: the Natural Bridge, the Lower Wash, then the dunes of Cairn V at 163°. Noon at the Arch, and a night to spare.',
        'Keep the page “Arch of the Solstice & The Solar Altar” close: the midsummer ray and its eight sun-stones.'
      ]);
    }
  };

  // ---- 23 · Debrief of the Arch of the Solstice: the night signal, the code of Aurelia, the smoke ----
  S[23] = {
    hermesInitial: [
      'Silvia, it is dawn again and I have not slept. The courtyard lit at yesterday’s sunrise, and the Altar opened.',
      'Inside lay the Seal of Cairn V and a small bronze mirror, polished by a recent hand.',
      'Last night a light flashed on Tower II, far to the north-east. I answered with the mirror, and it asked again.',
      { ask: [
        { text: 'What did it say?', silviaMsg: 'What did it say, Hermes? Could you read it?', reply: ['Nothing I could read at first. Long and short flashes, over and over, like a man knocking and waiting for the door.'] },
        { text: 'Weren’t you afraid to answer?', silviaMsg: 'Weren’t you afraid to answer, Hermes? You did not know who it was.', reply: ['Terrified. My hands would not keep the mirror still.', 'But a light that asks in the dark must be answered. It is the oldest rule of the desert.'] },
        { text: 'It could be a trap, Hermes.', silviaMsg: 'It could be a trap, Hermes. Maybe someone wanted you looking at Tower II.', reply: ['It could. So I answered from behind the altar stones, and swept the dunes behind me twice.', 'Nothing moved. Whoever it was wanted only me.'] }
      ] },
      'Then three short flashes, a pause, two long: the code I made for Aurelia. Nobody else in the world knew it.',
      'And then it spoke in the old light-code of the Order, slow as a teacher at a blackboard: the two lines you now have. Then it went out.',
      'At grey light I saw the smoke. The wagons stand at the foot of the Sanctuary steps, and there is no sign of the Servant.'
    ],
    choices: [
      {
        text: 'Go now. The Servant is alone.',
        silviaMsg: 'Go now, Hermes. The Servant is alone up there, and whoever answered your light is in danger.',
        hermesReply: (W) => beats([
          altarSeals() >= 5
            ? 'Five seals, Silvia. The gates of Tower II can no longer refuse me, if there are still gates to open.'
            : 'Four seals, and the first still sleeps by the dry wash. The Servant will want it, if he lives to want it.',
          ({
            humble: 'I bowed to him at his gates, and he bowed back. A debt like that is paid on his steps, not over a wire.',
            bold: 'I came through his gates like a gale, and he answered in kind. If he lives, I owe him an apology. If he does not, I owe him more.',
            observer: 'At his gates I looked before I spoke, and he noticed. This time I will not look from a distance.'
          })[W.road()] || 'I owe him a debt, and it is paid on his steps, not over a wire.',
          W.flag('coin')
            ? 'I still have his coin. ‘If ever you cannot find me, listen for stone that knocks,’ he said. I think he knew.'
            : 'The seals go into the lining of my coat, where nobody will look. Give me an hour to sew, and another to find my legs.'
        ])
      },
      {
        text: 'Who else could know Aurelia’s code?',
        silviaMsg: 'Hermes... who else could know Aurelia’s code? Think. Anyone you told, anything you wrote down?',
        hermesReply: (W) => beats([
          'No one, Silvia. I never said it aloud to anyone but her, and I wrote it down only once: on her disc.',
          W.dream('why') === 'grief'
            ? 'In the dream you said I raised those stones for her. I did. And today the dead seem to be answering.'
            : 'I used to tap it on the glass of the lower observatory, so she would know it was me at the door and not the night watch.',
          'So either someone has held that disc, or... I will not say the rest aloud until I am sure.'
        ])
      },
      {
        text: 'Keep the mirror. You may need to answer again.',
        silviaMsg: 'Keep that mirror close, Hermes. If the light comes back, I want you to be able to answer it.',
        hermesReply: (W) => beats([
          W.flag('blessing')
            ? 'It hangs on a cord around my neck, by the brass box with the blue and the pebble. The Servant’s red cord stays on my wrist.'
            : 'It hangs on a cord around my neck, next to the brass box with the blue and the pebble.',
          'Blue at Cairn II, gold in the labyrinth, a painted pebble at Cairn IV, and now a polished mirror. I think they are one message.',
          'The mirror is trained on Tower II. Nothing yet, only the smoke, thinner than at dawn. If the light returns, I will answer.'
        ])
      }
    ]
  };

  // ---- 24 · The Seal of Cairn V, the two lines of light, and the road to Tower II ----
  S[24] = {
    hermesFinal: (W) => beats([
      sealsWord(altarSeals()) + ' of five, Silvia, and two lines that came to us in light: [Y] − [O] = 2 and [L] + [G] = 23. They are in your Cipher Ledger now.',
      by([
        'The seals are sewn into my coat. Now I only have to persuade my legs.',
        'I am still turning that question over, Silvia. It will walk with me.',
        'The mirror is warm against my chest. I keep expecting it to flash.'
      ], W.choice(23)) || 'My legs have not agreed yet, but my boots are on.',
      'Now Tower II. If the Servant stands, his last trial waits: Station 18, the page “The Polybius Stele”. If not, we learn what the raiders came for.'
    ])
  };
})();
