window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};
// Field Wire script, steps 17 to 24 (docs/DESERT_ODYSSEY_BIBLE.md, "Estándar del chat del Field Wire"): the shepherd and the veiled woman
// at the edge of the hardpan (17, 18), the debrief of Cairn IV (19, 20), dusk at Cairn IV (21, 22) and the debrief of the Arch of the Solstice (23, 24).
// Texts are beats (an array of short messages); a function (W) => beats reads what she chose before (see hub-core.js, window.WireScript).
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

  // ---- 17 · Dusk at the edge of the hardpan: the shepherd, the veiled woman, the raiders' wagons ----
  S[17] = {
    hermesInitial: (W) => {
      // what she answered at the end of the dream of 1998 stays with him
      const echo = { hands: 'I woke with river stone on my hands, Silvia, and for once I know whose work they have been doing.', never: 'I woke as the last surveyor of the Order, Silvia, and it sits on me more lightly than I feared.', finish: 'I woke with a meridian to finish, Silvia: two cairns never fell, and tonight I start walking toward the first of them.' }[W.dream('end')];
      return beats([
        echo,
        'Dusk, Silvia. The rocks are still warm, and the hardpan begins at their feet: a night of cracked clay, with Cairn IV at the far end.',
        'I am not alone. At the seep under the last rocks sits an old shepherd with a dozen black goats. He shared his water and asked me nothing.',
        'It is the desert’s way of being kind.',
        'He says the hardpan can be crossed in one night, if you walk toward the singing.',
        'When the night wind blows, the pillars of Cairn IV can be heard from the Natural Bridge of the Sentinel Mesa.',
        'Then he said something I cannot shake off.',
        'Every autumn, on the clear nights, a veiled woman comes down from the sandstone and sings to the stars.',
        'The herders leave her milk and dates on a flat stone. Nobody has ever seen her face.',
        'The raiders’ wagons came by here at first light, he says. South-west, in a hurry.',
        'One more question before I lose the light, Silvia. What do I ask him?'
      ]);
    },
    choices: [
      {
        text: 'Ask him about the veiled woman.',
        silviaMsg: 'Ask him about the veiled woman, Hermes. What does she sing?',
        hermesReply: [
          'He hummed it for me, in a voice like a dry hinge.',
          'No words. Five or six notes that rise and fall, the way you sing to a child who cannot sleep.',
          'He says the goats go quiet when she sings. All of them at once, as if someone had given an order.',
          'I wrote the notes in my log. My hand was shaking, and I could not tell you why.',
          'Thirst, probably. An old man’s hands shake for many reasons.',
          'Before I go I will leave my last dates on her flat stone. The desert keeps accounts.'
        ]
      },
      {
        text: 'Ask him the way over the Natural Bridge.',
        silviaMsg: 'Ask him the safest way over the Natural Bridge, Hermes. The pages “The Natural Bridge of the Sentinel Mesa” and “The Eastern Buttress & Lower Wash” show switchbacks on the eastern side.',
        hermesReply: [
          'He laughed, which I took for a good sign.',
          '‘The old cart track crosses the bridge on its back,’ he said, ‘but the switchbacks below are too tight for a loaded wagon.’',
          '‘Men on foot, yes. Wagons, never.’',
          'So if the raiders try them, Silvia, they will have to choose between their wagons and their road.',
          'He drew the eastern side in the dust with his stick, turn by turn. It matches your two pages. The second turn is the one that eats wagons.',
          'I will come to the bridge through the rocks and keep off the cart track. A road that is good for wagons is good for raiders.'
        ]
      },
      {
        text: 'Ask how many raiders he saw.',
        silviaMsg: 'Ask him how many raiders he saw, Hermes, and whether they had the Astrolabe with them.',
        hermesReply: [
          'Three wagons and perhaps a dozen men, with ash on their sleeves.',
          'One wagon was covered with oilcloth and guarded day and night. He never saw what was under it.',
          'I did not need him to.',
          'A dozen men cannot watch a whole hardpan, Silvia. But a lamp can be seen for miles.',
          'So tonight I walk without mine, and let the stars do their job.'
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
          'I left the dates. Now I walk toward the singing, and I will listen for her as well as for the pillars.',
          'I have marked the second turn in my log. If a wagon is going to stick anywhere, it will be there.',
          'My lamp is wrapped in my coat. Give my eyes an hour and I will see like one of his goats.'
        ], W.choice(17)) || 'The shepherd has gone back to his goats, and I have filled every flask I own.',
        'I am going now, Silvia.',
        'Eighteen hours: across the hardpan by night, then over the Natural Bridge of the Sentinel Mesa.',
        'Then down to the southern mouth of the gorge, where Cairn IV stands guard. I will sleep in the shade of the rocks when the sun is high.',
        'Keep the page “Cairn IV: Sentry of the Canyon” close: the survey log of the seven echoes.',
        sealsWord(g + 2) + ' in my satchel; ' + sealsWord(3 - g).toLowerCase() + ' still to find.'
      ]);
    }
  };

  // ---- 19 · Debrief of Cairn IV: the pillars sang the disc's code, the pebble, and the dawn on the Natural Bridge ----
  S[19] = {
    hermesInitial: (W) => {
      const b = W.bridge();
      const foot = {
        cross: 'The four on foot heard the stone I sent into the gorge, and they are behind me on my tracks.',
        hide: 'The four on foot walked over my head and on to the Mesa. One of them limped. They found nothing, and they will come back along their own prints.',
        trail: 'The four on foot are still hunting a strip of blue cloth along the eastern rim. They will not be fooled for long.'
      }[b];
      return beats([
        'Silvia, I have not slept. I am sitting between the pillars with the pebble in my hand.',
        'The chamber of Cairn IV opened with the founders’ own mechanism: bronze reeds inside the pillars, untouched since before the first road was cut.',
        'This cairn never fell. SUN, ECHO, STONE: the cairns are instruments, Silvia, and the Order measured the whole desert with them.',
        'But the last verse stopped my heart: three short calls, a pause, two long ones. The code I engraved on Aurelia’s brass disc.',
        'The very rhythm of the light I saw through my telescope in the autumn of 2016, blinking far out in the desert.',
        'And wedged in the throat of the Left pillar, a river pebble. Painted with a small gold star on blue.',
        'Someone tuned this canyon to sing that code. Someone who wanted me to hear it.',
        foot ? 'And one more thing: what we saw through the glass yesterday at dawn. The raiders gave up the switchbacks and split.'
             : 'And one more thing. Yesterday at dawn, from the Natural Bridge, I saw the raiders stuck at the switchbacks. They split.',
        foot || 'A few men on foot are following my tracks.',
        'The wagons, and the one under oilcloth, turned back north-east. Toward Tower II.'
      ]);
    },
    choices: [
      {
        text: 'Keep the pebble. It’s a message.',
        silviaMsg: 'Keep that pebble safe, Hermes. Nobody tunes a canyon by accident: it’s a message, and it’s meant for you.',
        hermesReply: (W) => beats([
          'It is in the brass box now, beside the grain of blue from Cairn II.',
          'Blue at Cairn II. A gold star in the labyrinth. Now this pebble, with the same star on the same blue.',
          W.chose(15, 0) ? 'I told you I would look for the next star, Silvia. I did not expect it so small.' : null,
          'A river pebble, in a canyon that has never seen a river. Somebody carried it here on purpose.',
          'I keep asking who walks ahead of me. Tonight I am starting to ask what they want me to find.',
          'If it is a message, I am afraid to read it to the end.'
        ])
      },
      {
        text: 'The Sanctuary is in danger. Hurry.',
        silviaMsg: 'If the wagons are heading to Tower II, the Sanctuary is in danger. The Servant is alone there. You have to hurry.',
        hermesReply: [
          'You are right. A gate with one old man behind it is not a gate. It is a hope.',
          'So I sleep through the worst of the heat, and not a minute past dusk.',
          'Then I walk until my legs refuse, and a little further.',
          'The Servant would say a hurried man walks into traps. I intend to hurry with my eyes open.'
        ]
      },
      {
        text: 'The cairns are instruments...',
        silviaMsg: 'Sun, echo, stone... the cairns are instruments. Then the Astrolabe was never meant to work alone, was it?',
        hermesReply: [
          'No. I think the Astrolabe reads what the cairns measure, the way a musician reads a score.',
          'Alone it knows six master stars, and the rest it has to be told. Without the five seals it is only brass.',
          'That is why the raiders want the seals, and why they wait for me to open the cairns instead of breaking them.',
          'A broken cairn is a lost note. They need every note, Silvia, and they need me to play them.',
          'So I stop thinking of the seals as keys. They are the pages of a score, and not one of them leaves my coat.'
        ]
      }
    ]
  };

  // ---- 20 · The Seal of Cairn IV and the road to the last cairn ----
  S[20] = {
    hermesFinal: (W) => {
      const g = gateSeals();
      return beats([
        sealsWord(g + 3) + ' of five, Silvia. The Seal of Cairn IV rests with the others.',
        'The two lines engraved on the bronze reed belong in your Cipher Ledger: [S] + [U] = 17 and [S] − [U] = 9.',
        'Two unknowns, two lines: you know the trick.',
        by([
          'The pebble is back in its brass box, and I keep opening the lid to look at it, like a man checking a letter he cannot read.',
          'My pack is already by the door of the chamber, and I will sleep with my boots on.',
          'The reeds are still singing in my head, SUN, ECHO, STONE, like a score I cannot stop reading.'
        ], W.choice(19)),
        'One cairn left: it watches from the dunes above the Arch of the Solstice (Station 17).',
        'Its seal sleeps in the Solar Altar, not far from the Sanctuary.',
        'The raiders’ wagons are on the same road. I will wire you before I set out.'
      ]);
    }
  };

  // ---- 21 · Dusk at Cairn IV: the midsummer line, and an October sun ----
  S[21] = {
    hermesInitial: [
      'Dusk again, Silvia, and I am leaving the pillars behind.',
      'Before the light went I read the page “Arch of the Solstice & The Solar Altar” one more time. One line will not let me go.',
      '‘At midsummer dawn, the sun’s first ray slips beneath the arch.’',
      'Midsummer, Silvia. The founders built the Courtyard of Rays for the longest day of the year.',
      'We are in October. The sun rises far to the south of where it rose for them, so its first ray will strike the arch at another place.',
      'If the courtyard is blind in autumn, the last seal stays locked until June. I do not have until June.',
      'And the ruts of the raiders’ wagons are fresh on the road east. Eighteen hours to the Arch, and I will not stop to sleep.',
      'I count three problems: the courtyard, the Sanctuary, and the men on my heels. Which one keeps you awake?'
    ],
    choices: [
      {
        text: 'Then we’ll turn the mirrors for an autumn sun.',
        silviaMsg: 'Then we’ll turn the mirrors ourselves, Hermes. If the founders aimed them for June, we can aim them for October.',
        hermesReply: [
          'Turn the founders’ mirrors... A year ago I would have called that sacrilege.',
          'Tonight it sounds like the only sensible thing anyone has said to me. Bronze can be turned.',
          'And the sun is not the only thing that can turn it. We need not wait for dawn to begin.',
          'I will use the night before the dawn to set what can be set in the dark. I am writing it down in my notes for you.',
          'Let us hope the sun waits for us.'
        ],
        onPick: (W) => { W.hint('s17-dawn', 1); }
      },
      {
        text: 'Can you see Tower II from the Arch?',
        silviaMsg: 'Will you be able to see Tower II from the Arch? I want to know what’s happening at the Sanctuary.',
        hermesReply: [
          'From the terrace of the altar, yes. The Sanctuary is a few hours further on.',
          'At the Natural Bridge it was a grain of rice on the horizon. From the Arch it should be a thumbnail.',
          'If the wagons are there, I will see their fires. If something else is there, I will see that too.',
          'I will sit up on the terrace tonight with the spyglass and wire you whatever moves.'
        ]
      },
      {
        text: 'Watch your back. They’re still following you.',
        silviaMsg: 'Watch your back, Hermes. The ones on foot are still following you.',
        hermesReply: (W) => beats([
          'I walk on stone and stop at every ridge to look back.',
          'Twice already I have seen a glint behind me. Spyglasses.',
          ({
            cross: 'They heard my stone fall at the bridge, and they have not forgotten it.',
            hide: 'The one who limps slows them down. I am counting on his foot.',
            trail: 'They swallowed the blue cloth once. A man does not swallow it twice.'
          })[W.bridge()] || 'They know my road, Silvia. They only do not know my hour.',
          'They want me to open the last cairn for them, like the others. They will be disappointed.',
          'So tonight I walk on bare rock and brush my tracks away with my coat.',
          'The Lower Wash is full of boulders the size of houses. I will lose them there.'
        ])
      }
    ]
  };

  // ---- 22 · East to the Arch of the Solstice (18 h, no sleep) ----
  S[22] = {
    hermesFinal: (W) => {
      const g = gateSeals();
      return beats([
        by([
          'I will turn bronze mirrors in my head all the way. Eighteen hours is a long time to plan a courtyard.',
          'I will glance north-east at every ridge. If there is a fire at Tower II, I want to be the first to know.',
          'Do not worry about my back, Silvia. It has carried heavier things than a few men on foot.'
        ], W.choice(21)),
        'I am going, Silvia. Eighteen hours east, without sleep.',
        'Back across the Natural Bridge, along the Lower Wash and over the dunes where Cairn V stands guard at 163°.',
        'I should reach the Arch of the Solstice tomorrow at noon, with a night to spare before the dawn we need.',
        'Keep the page “Arch of the Solstice & The Solar Altar” close: the midsummer ray and its eight sun-stones.',
        sealsWord(g + 3) + ' in my satchel. The fifth is waiting under the Arch.'
      ]);
    }
  };

  // ---- 23 · Debrief of the Arch of the Solstice: the night signal, the code of Aurelia, the smoke ----
  S[23] = {
    hermesInitial: (W) => beats([
      'Silvia, it is dawn again and I have not slept. Let me tell it in order, or I will not tell it at all.',
      'Yesterday at sunrise the courtyard lit and the Altar opened. The Seal of Cairn V lay inside, beside a small bronze mirror, polished by a recent hand.',
      'Last night a light began to flash on Tower II, far to the north-east. It asked, and I answered with the mirror. It asked again.',
      'Then it sent three short flashes, a pause, two long ones: the code I made for Aurelia when we were young. Nobody else in the world knew it.',
      'My hands shook so much I could hardly send it back.',
      'And then the light spoke, Silvia. Not in my code.',
      'In the old light-code of the Order, it spelled out the two lines you now have, slowly, the way a teacher writes on a blackboard.',
      'Then it went out, all at once. When the sky turned grey, I saw the smoke.',
      'The wagons are at the foot of the Sanctuary steps, and there is no sign of the Servant.',
      W.flag('coin') ? 'I still have the Servant’s coin, the one he told me to show to whoever finds him if fire ever rises over his tower. I think he knew.' : null,
      altarSeals() >= 5
        ? 'Five seals, Silvia. Five. The gates of Tower II can no longer refuse me, if there are still gates to open.'
        : 'Four seals of five. The first still sleeps by the dry wash, and the Servant will want it. But first the Servant has to be alive to want it.'
    ]),
    choices: [
      {
        text: 'Go now. The Servant is alone.',
        silviaMsg: 'Go now, Hermes. The Servant is alone up there, and whoever answered your light is in danger.',
        hermesReply: (W) => beats([
          'I will go as soon as my legs obey me.',
          'First the seals go into the lining of my coat, where nobody will look.',
          'If the raiders want them, they will have to take the coat off a very stubborn old man.',
          ({
            humble: 'I bowed to him at his gates, and he opened them with his own hands. A debt like that is paid on his steps, not over a wire.',
            bold: 'I came through his gates like a gale, and he answered in kind. If he lives, I owe him an apology. If he does not, I owe him more.',
            observer: 'At his gates I looked before I spoke, and he noticed. This time I will not look from a distance.'
          })[W.road()],
          W.flag('blessing') ? 'The red cord is still on my wrist. ‘It will remind you who waits,’ he said. It is reminding me quite loudly.' : null,
          'Give me an hour to sew, and another to find my legs.'
        ])
      },
      {
        text: 'Who else could know Aurelia’s code?',
        silviaMsg: 'Hermes... who else could know Aurelia’s code? Think. Anyone you told, anything you wrote down?',
        hermesReply: (W) => beats([
          'No one, Silvia. I never said it aloud to anyone but her, and I wrote it down only once: on her disc.',
          'I used to tap it on the glass of the lower observatory, so she would know it was me at the door and not the night watch.',
          W.dream('why') === 'grief' ? 'In the dream you said I raised those stones for her. I did. And today the dead seem to be answering.' : null,
          'So either someone has held that disc, or...',
          'I have been asking myself the rest since the light answered. Every answer I find frightens me more than the smoke.',
          'I will not say it aloud until I am sure.'
        ])
      },
      {
        text: 'Keep the mirror. You may need to answer again.',
        silviaMsg: 'Keep that mirror close, Hermes. If the light comes back, I want you to be able to answer it.',
        hermesReply: [
          'It hangs on a cord around my neck, next to the brass box with the blue and the pebble.',
          'Three small things, Silvia: a grain of blue at Cairn II, a painted star at Cairn IV, a mirror polished by a recent hand at Cairn V.',
          'I am beginning to think they are one message.',
          'I have trained the mirror on Tower II. If the light comes back, I will answer before I have time to be afraid.',
          'Nothing so far. Only the smoke, thinner than at dawn.'
        ]
      }
    ]
  };

  // ---- 24 · The Seal of Cairn V, the two lines of light, and the road to Tower II ----
  S[24] = {
    hermesFinal: (W) => beats([
      sealsWord(altarSeals()) + ' of five, Silvia, and two lines that came to us in light: [Y] − [O] = 2 and [L] + [G] = 23.',
      'Write them in your Cipher Ledger. I wrote them on my sleeve.',
      by([
        'The seals are sewn into my coat. Now I only have to persuade my legs.',
        'I am still turning that question over, Silvia. It will walk with me.',
        'The mirror is warm against my chest. I keep expecting it to flash.'
      ], W.choice(23)),
      'Now Tower II. If the Servant still stands, his last trial waits in the atrium: Station 18, the page “The Polybius Stele”.',
      'If he does not... then we will learn what the raiders came for.',
      'I will wire you from under the Arch before I set out.'
    ])
  };
})();
