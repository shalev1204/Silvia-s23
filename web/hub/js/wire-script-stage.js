window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};
// Field Wire script, steps 33 to 44: the morning of departure from Tower II, the Stage Path of Tower III
// (Station 20, the Gate of a Thousand Masks; Station 21, the Camera Obscura; Station 22, the Whispering Gallery).
// Format: see hub/js/hub-core.js, "The script of the Field Wire". Short beats, a few quick asks from Silvia, and a different reply for each of her three choices.
(function () {
  'use strict';
  const S = window.WIRE_SCRIPT;
  const clean = (list) => list.filter(Boolean);

  // =========================================================================================
  // 33 · Tower II, dawn: the letter nobody sent and the eight new pages
  // =========================================================================================
  S[33] = {
    hermesInitial: (W) => {
      const c = W.choice(31);
      return clean([
        "Dawn at the Sanctuary, Silvia. Boots on, coat buttoned, and behind me the best day I have had since 1971.",
        c === 0 ? "You told me to stay, so I stayed. She showed me her charts, and I watched her hands."
          : c === 1 ? "I watched her remember, a little more each hour: cedar smoke, a tune, my voice. Not the bridge, and I do not push."
          : c === 2 ? "You wanted us on the raiders’ road. Aurelia kept me one more day, and I was glad of it."
          : "She showed me her charts, and I watched her hands.",
        "The raiders have a day’s start and the Astrolabe, and their ruts run east, to Tower III: the Stage Tower, and the Mirror Speaker’s truth. The WHERE.",
        { ask: [
          { text: "Did you sleep at all?", silviaMsg: "Did you actually sleep, old man, or did you stare at charts all night?",
            reply: ["Eleven hours, in a real bed. I feel indecently young.", "Aurelia says she has never seen me so quiet before midnight."] },
          { text: "Can we catch the raiders?", silviaMsg: "Can we catch them, Hermes? They have a day’s start.",
            reply: (W) => clean([
              "A heavy prize slows even villains. If they stop to quarrel over it, we gain an hour.",
              W.bridge() === 'trail' ? "And somewhere out there four men are still hunting the rest of my blue cloak. Let them."
                : W.bridge() === 'hide' ? "Since the bridge I have walked behind my own hunters, and they have never once looked back."
                : W.bridge() === 'cross' ? "Since the bridge I have never stopped listening for the ones on my tracks. Let us hurry."
                : null
            ]) },
          { text: "What will the Speaker want?", silviaMsg: "What will the Mirror Speaker want from us?",
            reply: ["Nobody knows. She never shows herself, only her reflection.", "Aurelia says she asks nothing and sees everything. I find that worse."] }
        ] },
        "Aurelia found a letter in the cedar chest, written by an Oracle to the Mirror Speaker, and never sent. It is written backwards.",
        "A pigeon of the Order has just landed with eight new pages for you. The Servant stays on guard, and packed us bread, dates and a lamp.",
        "Open the page “The Unsent Letter”, Silvia, and find a mirror. Then tell me when you are ready to walk."
      ]);
    },
    choices: [
      {
        text: "I have the pages. Let’s go to the third tower.",
        silviaMsg: "I have the pages and a mirror, Hermes. The page “The Unsent Letter” is open. Let’s go.",
        hermesReply: (W) => clean([
          W.ask(33, 'i', 0) === 1 ? "Good. If we are to catch them, we do not waste the cool of the morning."
            : "Good. We do not waste the cool of the morning.",
          "Eighteen hours to the gate of Tower III, if the plateau is kind. Aurelia is already ten paces ahead; she says I have grown slow. She is right.",
          "Keep the pages within reach, Silvia. I have a feeling this tower will want you before it wants me."
        ])
      },
      {
        text: "How is Aurelia this morning?",
        silviaMsg: "How is Aurelia this morning? Strong enough for a long road?",
        hermesReply: (W) => clean([
          "Better than I deserve. She hums when she walks, and stops to draw things: a lizard, a cloud, the back of my head.",
          W.flag('blessing') ? "At the well she asked if we used to argue. I said yes, about the stars. She asked about the red cord on my wrist, too, and smiled at the answer."
            : "At the well she asked if we used to argue. I said yes, about the stars. She laughed and said she was probably right. She was.",
          { ask: [
            { text: "Does she remember you?", silviaMsg: "Does she remember you, Hermes? Really?",
              reply: ["In pieces: cedar smoke, a tune, the sound of my voice. She is still missing the bridge.", "I do not push. Memories come back faster when nobody chases them."] },
            { text: "Look after her, Hermes.", silviaMsg: "Look after her, Hermes. And yourself.",
              reply: ["I will. Though it is she who looks after me: the desert kept her better than the years kept me.", "I am the one who will need the walking stick."] }
          ] },
          "Then, very quietly, she asked if I had missed her. I said, for fifty-five years. She took my arm, and she has not let go."
        ])
      },
      {
        text: "What does the letter say?",
        silviaMsg: "What does the letter say? Have you read it?",
        hermesReply: [
          "Aurelia read it to me in the lid of my compass, and then she was quiet for a long time.",
          "The Oracle asks forgiveness. Together they broke the mirror of Tower III into nine pieces, so no one could turn the Astrolabe alone.",
          "And it warns about the Ashes: older than the Order, it says. Read it in the mirror, and tell me what you make of the last line."
        ]
      }
    ]
  };

  S[34] = {
    hermesFinal: (W) => {
      const c = W.choice(33);
      return clean([
        c === 1 ? "East, then, with Aurelia humming a tune without words: eighteen hours, and a short sleep at noon in the raiders’ last camp."
          : c === 2 ? "East, then, and no more delays: eighteen hours, with a short sleep at noon in the shade of the raiders’ last camp."
          : "East, then, at Aurelia’s pace: eighteen hours, with a short sleep at noon in the shade of the raiders’ last camp.",
        "The charts draw the gate as a wall of masks. The letter’s last line: ‘Only the one who sees what is not equal will find it.’",
        "Keep the page “The Gate of a Thousand Masks” close, Silvia. I will call when the wall comes in sight."
      ]);
    }
  };

  // =========================================================================================
  // 35 · Station 20 debrief: inside the gate, the Mirror Speaker's reflection, Fragment I and a note sealed with ash
  // =========================================================================================
  S[35] = {
    hermesInitial: (W) => {
      const road = W.road();
      const praise = W.flag('lieCaught') ? "You caught the Servant in a lie at Tower II. Six lying masks were never going to fool you."
        : road === 'bold' ? "You sent me straight at the Servant at Tower II, and it worked. Nerve in front of a face is a skill."
        : road === 'observer' ? "You made me look before I spoke at Tower II. Twelve masks were never going to fool that eye."
        : "You had me bow at the gates of Tower II, and it worked. Patience in front of a face is a skill.";
      return [
        "SILVER, Silvia. The word was SILVER, and the wall of masks opened like a curtain.",
        praise,
        "Inside, a corridor of mirrors, and in each a woman in a grey gown beside us. I turn: nobody. She signs with a straight line, Aurelia says.",
        { ask: [
          { text: "Bow to her. Politely.", silviaMsg: "Bow to her, Hermes. Politely. We are guests.",
            reply: ["I bowed to the glass. In the mirror, she bowed back, a heartbeat late.", "I turned round again. Only the empty corridor, and my own old face."] },
          { text: "Does she say anything?", silviaMsg: "Does she say anything at all?",
            reply: ["Not one word. She tilts her head, as if I were the one who owed her an explanation.", "Aurelia looked at me that way in 1970. I learned then when to be quiet."] },
          { text: "Ask her where the fragment is.", silviaMsg: "Ask her where Fragment I is, Hermes. Politely.",
            reply: ["I did. She turned and walked ahead of us, in the glass only, and we followed her reflections.", "It is like following a rumour. Very tidy, and no explanations."] }
        ] },
        "Three masks got their missing halves, the mirrors swung open, and in a velvet niche lay Fragment I, with a moon inside that is not in the sky.",
        "There is one more thing. On the last mask someone had pinned a note: paper that smells of smoke, sealed with ash. A circle, with a line across it.",
        "Two prizes and one pair of hands, Silvia. Where shall I look first?"
      ];
    },
    choices: [
      {
        text: "What does the note say?",
        silviaMsg: "Read me the note, Hermes. Every word.",
        hermesReply: [
          "Three words, in a fine and careful hand: ‘Let her through.’ Then the seal.",
          "Her, Silvia. Not us. Aurelia went pale: she says the Ashes have a leader, and in all the years she knows of he has never written to anyone.",
          { ask: [
            { text: "Could it be a trap?", silviaMsg: "Could it be a trap, Hermes?",
              reply: ["Perhaps. Paper that polite usually is. But a trap says ‘come here’, and this says ‘let her through’: a door held open."] },
            { text: "Burn it, Hermes.", silviaMsg: "Burn it, Hermes. We do not need it.",
              reply: ["Not yet. A burnt note cannot be compared with the next one.", "It goes inside my coat, and nobody touches it but me."] },
            { text: "Look at the seal closely.", silviaMsg: "Look at the seal closely. What is it made of?",
              reply: ["Grey ash, pressed hard into the wax. It left a smudge on my thumb that will not wash off.", "Someone burned something to make this. I would like to know what."] }
          ] },
          "He has written about you, Silvia. A man who wanted you stopped would not. He is either a fool or a step ahead of us, and he is no fool."
        ]
      },
      {
        text: "The Mirror Speaker: is she real?",
        silviaMsg: "The Mirror Speaker… is she real, Hermes? Or only a reflection?",
        hermesReply: [
          "Real enough to cast a reflection, Silvia, which is more than I can say for some people I have met.",
          "Aurelia says the Mirror Speakers never show themselves: only their reflection, and only to those who come in peace.",
          "She has just drawn her line again, in the glass beside me. I think she is listening to us. Mind your jokes, Silvia."
        ]
      },
      {
        text: "Keep the fragment safe.",
        silviaMsg: "Fragment first, Hermes. Wrap it well and keep it close.",
        hermesReply: (W) => [
          "It is wrapped in my scarf, inside my coat, against my chest. Cold even through the wool.",
          "Tilted to the lamp, it shows a candlelit stage with a small figure on it. Rather like me. I do not know whether to be flattered.",
          W.chose(33, 2)
            ? "You know why from the letter: nine pieces, so that no one could turn the Astrolabe alone. Eight more, Silvia, and every room keeps one."
            : "Aurelia says the mirror was broken in nine pieces so that no one could turn the Astrolabe alone. Eight more, Silvia, and every room keeps one."
        ]
      }
    ]
  };

  S[36] = {
    hermesFinal: (W) => {
      const c = W.choice(35);
      const bowed = W.ask(35, 'i', 0) === 0;
      return clean([
        c === 1 ? "We sleep behind the gate, among the costumes. I said goodnight to the glass, and the grey gown drew her line once more."
          : c === 2 ? "We sleep behind the gate among the costumes, Fragment I under my head. Aurelia says a hard pillow makes honest dreams."
          : bowed ? "We sleep behind the gate among the costumes. Aurelia put a crown of paper stars on my head, and I bowed to her. Nobody bowed back."
          : "We sleep behind the gate, in the old dressing rooms. Aurelia found a crown of paper stars and put it on my head.",
        c === 0 ? "I have read the note a dozen times, and it still says three words. Whoever wrote it knew you were coming, Silvia."
          : "The note sealed with ash is in my coat. Whoever wrote it knew you were coming, Silvia.",
        "Fragment I is set in the mirror: look at Path III on your map. The next room opens when the candles burn down, not before."
      ]);
    }
  };

  // =========================================================================================
  // 37 · Station 21: the candles burn down and the Mirror Speaker opens a door onto a stair
  // =========================================================================================
  S[37] = {
    hermesInitial: (W) => {
      const c = W.choice(35);
      return [
        "Silvia, are you awake? The candles in the dressing rooms burned down all together, as if someone had counted them.",
        c === 0 ? "I slept badly. The note is still in my coat, and I keep hearing it: ‘Let her through.’"
          : c === 1 ? "I slept badly. Each time I woke, the grey gown stood in the glass at the end of the corridor, still as a painting."
          : c === 2 ? "I slept badly. Fragment I kept me company all night, cold as a coin from the bottom of a well."
          : "I slept badly, which at my age is practically a hobby.",
        "In the glass at the end of the corridor, the grey gown stood by a door that was not there before. She drew her line, and it opened on a stair.",
        { ask: [
          { text: "Is she still there?", silviaMsg: "Is she still there, Hermes? The grey gown?",
            reply: ["The glass is empty now. Only me, in a coat two sizes too big, and a door standing open.", "She has gone, and she wanted us to see that she has gone."] },
          { text: "Wait for me before going down!", silviaMsg: "Wait for me before you go down! I want to see the page first.",
            reply: ["I will wait for your eyes, Silvia, not for my courage.", "But Aurelia will not wait for either. Be quick."] },
          { text: "Any dragons down there?", silviaMsg: "Any dragons down there? Be honest.",
            reply: ["No dragons. A draught, and the smell of wet stone. In a theatre that is worse."] }
        ] },
        "Aurelia has already gone ahead. I can hear her counting the steps.",
        "Before I follow: the page “The Camera Obscura”. Aurelia says it is no map, but the third tower’s city as it stood yesterday, upside down.",
        "Have it ready. Down there I think it will need your eyes more than mine."
      ];
    },
    choices: [
      {
        text: "I have the page “The Camera Obscura”. Go down.",
        silviaMsg: "I have the page “The Camera Obscura”, upside down, in front of me. Go down the stair.",
        hermesReply: [
          "Then down we go. Thirty-one steps, by Aurelia’s count, and colder at every one.",
          "My lamp turns the stairwell gold, and Aurelia’s shadow walks ahead of her, twice her size.",
          "Keep the page in front of you. At the bottom I will need you to tell me what I am looking at."
        ]
      },
      {
        text: "Why is the city upside down?",
        silviaMsg: "Why is the city on the page “The Camera Obscura” upside down?",
        onPick: (W) => W.hint('s21-city', 1),
        hermesReply: [
          "Aurelia says it is not a mistake. It is the whole point. She smiled at the page like someone who has done this before, a long time ago.",
          "When I started to guess, she put a finger to my lips. She wants you to see it with your own eyes.",
          "Only this: the page shows the city of yesterday, and down there it will show today’s. Four things will have changed. My notes are in Ask Hermes."
        ]
      },
      {
        text: "Be careful on the stair.",
        silviaMsg: "Be careful on the stair, Hermes. Hold the rail.",
        hermesReply: [
          "There is no rail. Aurelia came back up for me, took my hand, and has not let go.",
          "I test each step with my stick. The fourth is cracked clean through, and Aurelia stepped over it without looking down.",
          "She has walked this stair before, Silvia, long ago. I did not ask. She had the look of someone listening to a song from the next room."
        ]
      }
    ]
  };

  S[38] = {
    hermesFinal: (W) => {
      const c = W.choice(37);
      return clean([
        "At the bottom, no light anywhere. A door, with a hole in it no bigger than a coin. That is all there is.",
        c === 1 ? "Aurelia has put her hand over my lamp, and I am keeping my guesses to myself on her orders. It is harder than the stair."
          : c === 2 ? "Aurelia has finally let go of my hand, but only to cover my lamp. In a moment my eyes will learn the dark."
          : "Aurelia has put her hand over my lamp. In a moment my eyes will learn the dark.",
        "Open Path III on your Quest Map, Silvia, and look with me. You have the page. I have a hole in a wall."
      ]);
    }
  };

  // =========================================================================================
  // 39 · Station 21 debrief: the narrow house, the warm ashes and Fragment II
  // =========================================================================================
  S[39] = {
    hermesInitial: (W) => {
      const c = W.choice(37);
      return clean([
        "Fragment II is in my hands, Silvia, and my hands are black to the wrists.",
        "You spotted it on the wall: a chimney cold on your page, smoking in the dark. We found the fragment on the hearth below it, in a cloth that smelled of old smoke.",
        { ask: [
          { text: "Are you hurt?", silviaMsg: "Black to the wrists? Are you hurt, Hermes?",
            reply: ["Only soot and pride. I knelt in the hearth to lift it, and the hearth won.", "Aurelia says soot suits me."] },
          { text: "What does it look like?", silviaMsg: "What does Fragment II look like?",
            reply: ["Smaller than the first, and warmer, as if someone held it a long time. Inside it there is a little window with a candle in it."] },
          { text: "Soot suits you.", silviaMsg: "Aurelia is right. Soot suits you.",
            reply: ["She drew me with it. I now exist in her sketchbook as a chimney sweep.", "I have decided to be flattered."] }
        ] },
        "In the narrow house behind the market the hearth was still warm, and the Ashes’ sign was scratched on every wall. They left in a hurry.",
        c === 1 ? "Now I see why the city was upside down: that room was built to let someone underground watch the streets." : null,
        "Aurelia stood in the street a long time, looking up at the chimney. She says a fire like that is not lit by people who want to hide.",
        "It was lit so that someone would look. So tell me, Silvia: who were they hoping would look?"
      ]);
    },
    choices: [
      {
        text: "What was in the house?",
        silviaMsg: "What else was in the house?",
        hermesReply: [
          "Nothing but ash, a stool and a broom with no bristles.",
          "And a floorboard that lifts. Under it, a hollow, empty, the dust still soft where something heavy lay.",
          "Whatever they took, they took it quickly but carefully: nothing was dragged. Thieves in a hurry leave a mess; these tidied for guests."
        ]
      },
      {
        text: "Is Fragment II safe?",
        silviaMsg: "Is Fragment II safe? Is it wrapped?",
        hermesReply: [
          "In my scarf beside the first one, each in its own cloth, and I might as well not have bothered.",
          "The moment they touch they hum, Silvia, like two glasses on a table when someone runs a wet finger round the rim. Aurelia says it is only the cold.",
          "Apart: silence. Together: the hum. I have decided they like each other, and I shall treat them accordingly."
        ]
      },
      {
        text: "Where did the raiders go?",
        silviaMsg: "Where did the raiders go?",
        hermesReply: [
          "Deeper into the theatre. The cellar has a second stair, and from the bottom comes a sound like a great many people whispering at once.",
          "Aurelia says the next room is made of whispers. I would go down this minute if I were twenty.",
          { ask: [
            { text: "Then go down now!", silviaMsg: "Then go now, Hermes! They are ahead of us!",
              reply: ["Do not tempt me. But I went down one stair in the dark tonight, and my knees remember every step of it.", "At dawn, Silvia. A stair that whispers has opinions, and I want to be rested before I hear them."] },
            { text: "Rest first, old man.", silviaMsg: "Sleep first, old man. The whispers will keep.",
              reply: ["Thank you. I was hoping someone sensible would say it.", "Aurelia is already making a bed of her coat. I shall dream of stairs."] }
          ] }
        ]
      }
    ]
  };

  S[40] = {
    hermesFinal: (W) => {
      const c = W.choice(39);
      return clean([
        "We rest in the cellar of the narrow house. Aurelia has drawn the city upside down in her sketchbook, so she will not forget it.",
        c === 0 ? "I cannot stop thinking about the empty hollow under the floorboard. I would give a great deal to know what lay in it."
          : c === 1 ? "The two fragments are humming in my scarf. I have stopped telling them to be quiet."
          : c === 2 ? "The whispering comes up the second stair like a draught, and I sleep with one ear open."
          : null,
        "Fragment II is set in the mirror: on Path III the second piece shows a window with a candle. The next door opens when the hearth burns low."
      ]);
    }
  };

  // =========================================================================================
  // 41 · Station 22: the hearth goes out and the second stair leads down to the whispers
  // =========================================================================================
  S[41] = {
    hermesInitial: (W) => [
      "Silvia, the hearth has gone out, and the whispering under the floor never stopped all night.",
      "In the black window of the cellar the grey gown stood by the second stair, and drew her line across it.",
      W.chose(39, 2)
        ? "You asked where the raiders went, and now we know: down that stair, toward the murmur."
        : "The raiders’ tracks end at the head of that stair, and the whispering comes up from below.",
      { ask: [
        { text: "Can you hear words?", silviaMsg: "Can you hear any words yet?",
          reply: ["Not words. A murmur, rising and falling like a crowd behind a door.", "At least two voices, Aurelia thinks."] },
        { text: "How are your knees?", silviaMsg: "How are your knees this morning, Hermes?",
          reply: ["Like two walnuts in a sock. I shall take the stair slowly and complain loudly."] },
        { text: "Turn back if it feels wrong.", silviaMsg: "Turn back if it feels wrong, Hermes. Promise me.",
          reply: ["I promise. But Aurelia is already lacing her boots, and I will not be the one who stays behind."] }
      ] },
      "Aurelia says the room below was built by the Order to keep secrets, and that it keeps them very badly.",
      "The page “The Whispering Gallery”, Silvia: a hall shaped like an egg, two pins pulled out long ago, and a rose on the floor that listens.",
      "Have it ready. I would rather face the Ashes than a hall that remembers every footstep."
    ],
    choices: [
      {
        text: "I have the page “The Whispering Gallery” ready.",
        silviaMsg: "I have the page “The Whispering Gallery” in front of me. Go down.",
        hermesReply: [
          "Then down we go, as quietly as two old people can.",
          "Aurelia has taken off her boots after all: the floor below remembers footsteps. I took mine off too. The stone is cold as a river.",
          "Stay on the wire, Silvia. Whatever happens, I would rather have your voice than my courage."
        ]
      },
      {
        text: "What is the rose on the floor?",
        silviaMsg: "There is a rose on the floor of the page “The Whispering Gallery”. What is it?",
        onPick: (W) => W.hint('s22-focus', 1),
        hermesReply: [
          "Aurelia says the Order set a bronze rose in the floor where the western pin stood: the listener’s place.",
          "But the hall is dark, and I will not see a rose under my own boots. You will have to tell me where it is.",
          "The page is your lantern. Find the rose on the plan and walk me to it. My notes are in Ask Hermes."
        ]
      },
      {
        text: "Be very quiet down there.",
        silviaMsg: "Be very quiet down there, Hermes. If you can hear them, they can hear you.",
        hermesReply: [
          "Only at the right place, Aurelia says. Everywhere else the gallery swallows every sound.",
          "But at the right place a whisper carries all the way to the far pin, and I suspect the Ashes are standing at the far pin.",
          "So I will say nothing aloud there. I will whisper to you from the stair, and nowhere else."
        ]
      }
    ]
  };

  S[42] = {
    hermesFinal: (W) => {
      const c = W.choice(41);
      return clean([
        "We are at the foot of the stair, at the door of a long hall with no corners: columns all round, and the dark in the middle.",
        c === 0 ? "Boots in my hand. The floor has not noticed us yet."
          : c === 1 ? "The floor is polished by a thousand listeners. Somewhere in that dark a bronze rose is waiting for you to find it."
          : c === 2 ? "I am whispering to you from the stair, as I said, and from nowhere else."
          : W.ask(41, 'i', 0) === 0 ? "Still no words, only the murmur, and now it comes from the far end."
          : null,
        "At the far end two voices are whispering, and I cannot make out one word. Open Path III on your Quest Map and stand with me, Silvia."
      ]);
    }
  };

  // =========================================================================================
  // 43 · Station 22 debrief: the words of the Ashes, the mirrored tune, Fragment III and the Line of the Echo
  // =========================================================================================
  S[43] = {
    hermesInitial: (W) => [
      "Fragment III is in my scarf with the other two, Silvia. When the three touch, they sing: the tune of the niche, backwards.",
      W.chose(41, 1)
        ? "You found the rose for me in the dark. I stood on it, and the whole hall poured its whispers into my ear."
        : "You walked me out to the rose, and the whole hall poured its whispers into my ear. I have never heard so clearly in my life.",
      "The Ashes were at the far pin, over a bowl of embers. They played the tune of the niche note for note, and the niche stayed shut for them.",
      { ask: [
        { text: "What did they look like?", silviaMsg: "What did they look like, Hermes?",
          reply: ["Two shadows over a bowl of embers, hoods up. One tall.", "I did not stay to learn more."] },
        { text: "Did they see you?", silviaMsg: "Did they see you, Hermes? Did they hear you?",
          reply: ["No. The hall carries whispers, not light.", "But I held my breath so long I saw colours."] },
        { text: "Were they good musicians?", silviaMsg: "Were they at least good musicians?",
          reply: ["Dreadful. Every note correct, and not one note of feeling. Aurelia winced twice."] }
      ] },
      "Before they left I heard their last words: ‘Leave it. She will come.’ They are not hunting us, Silvia. They are waiting for you.",
      "You played it from the last note to the first, the way a mirror would, and a little door opened in the wall.",
      "Inside the door, scratched in Aurelia’s own old hand, there was a line for your Ledger: [J] × 2 = [T]. Three questions, and only one of me. Pick."
    ],
    choices: [
      {
        text: "Who is ‘she’?",
        silviaMsg: "Who did they mean, Hermes? ‘She will come.’",
        hermesReply: [
          "You, Silvia. I would give a great deal for it to be someone else, but there is no one else on this wire.",
          "At the gate: ‘Let her through.’ In the gallery: ‘She will come.’ Someone has been laying a carpet for you since the plateau.",
          "Nobody waits for someone they want stopped. So they are a friend, or very sure of themselves."
        ]
      },
      {
        text: "I will solve the line.",
        silviaMsg: "I will put [J] × 2 = [T] in my Ledger and solve it.",
        hermesReply: [
          "Twice J is T. And you found T long ago, before the sand.",
          "I could do the sum on my fingers, and I will not. This one is yours.",
          "Aurelia says the Order liked its echoes exact: a sound that comes back twice as strong is not an echo. It is an answer."
        ]
      },
      {
        text: "What did Aurelia whisper?",
        silviaMsg: "What was Aurelia whispering toward the east end?",
        hermesReply: [
          "She will not tell me. Something short, always the same, and it comes back across the hall small and clear.",
          "Once I thought it was my name. Then I thought it was a date. But she knew every column by touch, Silvia: she has been in this hall before.",
          "I will not push. What comes back on its own comes back to stay."
        ]
      }
    ]
  };

  S[44] = {
    hermesFinal: (W) => {
      const c = W.choice(43);
      return clean([
        "We sleep by the west pin, in our coats on the cold floor. Only drops of water now, and the columns settling.",
        c === 0 ? "‘She will come.’ I fall asleep on those words, and I wake up on them."
          : c === 1 ? "The line is in your Ledger, and I will not peek at the sum. I will only lie here and guess, badly, until I sleep."
          : c === 2 ? "Aurelia is whispering toward the east end again, very softly, in her sleep. It comes back to me clear as a bell."
          : W.ask(43, 'i', 0) === 2 ? "I keep hearing the Ashes’ dreadful notes, every one correct, and none of them felt."
          : null,
        "Fragment III is set in the mirror: in the third piece, an arch and the edge of a balcony. When the next door opens, I will call you."
      ]);
    }
  };
})();
