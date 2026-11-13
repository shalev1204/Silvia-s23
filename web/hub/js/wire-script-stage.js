window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};
// Field Wire script, steps 33 to 44: the morning of departure from Tower II, the Stage Path of Tower III
// (Station 20, the Gate of a Thousand Masks; Station 21, the Camera Obscura; Station 22, the Whispering Gallery).
// Format: see hub/js/hub-core.js, "The script of the Field Wire". Hermes writes short beats; each of Silvia's three choices gets its own reply.
(function () {
  'use strict';
  const S = window.WIRE_SCRIPT;
  const clean = (list) => list.filter(Boolean);

  // =========================================================================================
  // 33 · Tower II, dawn: the letter nobody sent and the eight new pages
  // =========================================================================================
  S[33] = {
    hermesInitial: (W) => {
      const c = W.choice(31), b = W.bridge();
      return clean([
        "Dawn at the Sanctuary, Silvia. Boots on, coat buttoned, and behind me the best day I have had since 1971.",
        c === 0 ? "You told me to stay, so I stayed. She showed me her charts, and I watched her hands."
          : c === 1 ? "I watched her remember, a little more with every hour: cedar smoke, a tune, my voice. Not the bridge. Not yet, and I do not push."
          : c === 2 ? "You wanted the raiders chased at once. Aurelia kept me one more day, and I will confess I was glad of it."
          : "She showed me her charts, and I watched her hands.",
        "But the raiders have a day’s start and the Astrolabe, and their ruts run east across the plateau.",
        "East is where Tower III stands: the Stage Tower, where the Mirror Speaker keeps the second truth. The WHERE.",
        b === 'trail' ? "I wonder if the four who chased my blue cloak to the survey stone are still looking for the rest of it."
          : b === 'hide' ? "Since the bridge I have walked behind my own hunters, and they have never once looked back."
          : b === 'cross' ? "Since the bridge they have been on my tracks, and I have never stopped listening for them."
          : null,
        "The Servant stays behind to guard the Sanctuary. He packed us bread, dates and a lamp, and would not hear a word of thanks.",
        "Aurelia brought me one more thing from the cedar chest: a letter an Oracle of long ago wrote to the Mirror Speaker of Tower III, and never sent.",
        "It is written backwards, the way a mirror sees.",
        "And this morning a pigeon of the Order landed on the stair with a packet for you: eight new pages for your journal.",
        "Open the page “The Unsent Letter”, Silvia, and find a mirror. Then tell me when you are ready to walk."
      ]);
    },
    choices: [
      {
        text: "I have the pages. Let’s go to the third tower.",
        silviaMsg: "I have the new pages, Hermes, and a mirror. The page “The Unsent Letter” is in front of me. Let’s go to the third tower.",
        hermesReply: [
          "Good. Then we do not waste the cool of the morning.",
          "Eighteen hours to the gate of Tower III, if the plateau is kind. I have measured it twice on the old chart, and it has not shrunk.",
          "Aurelia is already ten paces ahead. She says I have grown slow. She is right.",
          "Keep the pages within reach, Silvia. I have a feeling this tower will want you before it wants me."
        ]
      },
      {
        text: "How is Aurelia this morning?",
        silviaMsg: "How is Aurelia this morning, Hermes? Is she strong enough for a long road?",
        hermesReply: (W) => clean([
          "Better than I deserve. She hums when she walks, and she stops to draw things: a lizard, a cloud, the back of my head.",
          "At the well she asked if we used to argue. I said yes, about the stars. She laughed and said she was probably right. She was.",
          W.flag('blessing') ? "She asked about the red cord on my wrist, too, and smiled when I told her who tied it." : null,
          "Then, very quietly, she asked if I had missed her. I said, for fifty-five years. She took my arm, and she has not let go.",
          "She is steadier than I am, Silvia. The desert kept her well. It is I who will need the walking stick."
        ])
      },
      {
        text: "What does the letter say?",
        silviaMsg: "What does the letter say, Hermes? Have you read it?",
        hermesReply: [
          "Aurelia read it to me in the lid of my compass, slowly, and then she was quiet for a long time.",
          "It asks forgiveness, Silvia. It tells how the Oracle and the Mirror Speaker broke the mirror of Tower III into nine pieces, so that no one could turn the Astrolabe alone.",
          "And it warns about the Ashes. Older than the Order, it says. Older than anything we have a name for.",
          "Read it yourself, in the mirror. Then tell me what you make of the last line. I have been turning it over since the Sanctuary."
        ]
      }
    ]
  };

  S[34] = {
    hermesFinal: (W) => {
      const c = W.choice(33);
      return clean([
        "East, then. We set out at first light, the raiders’ ruts in front of us and the sun in our eyes.",
        "Eighteen hours across the plateau to the third tower, with a short sleep at noon in the shade of their last camp.",
        c === 0 ? "No dawdling, then. Aurelia has set the pace, and I keep up out of pure pride."
          : c === 1 ? "Aurelia is humming again, a tune with no words. I would walk eighteen hours more just to hear it."
          : c === 2 ? "You have the letter; I have the road. Between us we should arrive in one piece."
          : "Aurelia has set the pace, and I keep up out of pure pride.",
        "She has studied the old charts of the Sanctuary. They draw the gate of Tower III as a wall of masks.",
        "And the last line of the letter is about that gate: ‘Only the one who sees what is not equal will find it.’",
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
      const praise = W.flag('lieCaught') ? "You caught the Servant in a lie at the gates of Tower II, so I should have known six lying masks would not fool you."
        : road === 'bold' ? "You sent me straight at the Servant at the gates of Tower II, and it worked. Nerve in front of a face is a skill."
        : road === 'observer' ? "You made me look before I spoke at the gates of Tower II. Twelve masks were never going to fool that eye."
        : "You had me bow at the gates of Tower II, and it worked. Patience in front of a face is a skill.";
      return [
        "SILVER. The word was SILVER, Silvia, and the wall of masks opened like a curtain.",
        praise,
        "Inside it is dark and warm, with a smell of candle wax and old velvet: a long corridor of mirrors.",
        "In every one of them, behind our own reflections, a woman in a grey gown walks beside us. When I turn round, there is no one there.",
        "She has not said a word. She drew a line in the air, straight and flat as a horizon. Aurelia says that is how the Mirror Speaker signs.",
        "Then you gave three masks their missing halves, and the mirrors swung open one by one.",
        "At the end, in a niche lined with black velvet, lay Fragment I: cold and heavy, with a little moon in it that is not in the sky.",
        "There is one more thing. On the last mask, someone had pinned a note.",
        "Not hers: the paper smells of smoke, and it is sealed with ash. A circle, with a line across it.",
        "Two prizes and one pair of hands, Silvia. Where shall I look first?"
      ];
    },
    choices: [
      {
        text: "What does the note say?",
        silviaMsg: "Read the note to me, Hermes. Every word.",
        hermesReply: [
          "Three words, in a fine and careful hand: ‘Let her through.’ Then the seal.",
          "Her, Silvia. Not us.",
          "Aurelia went pale. She says the Ashes have a leader, and that in all the years she knows of, he has never written to anyone.",
          "He has just written about you.",
          "A man who wanted you stopped would not write that. Either he is a fool, or he is a step ahead of us, and I do not think he is a fool.",
          "The note goes inside my coat, and nobody touches it but me."
        ]
      },
      {
        text: "The Mirror Speaker: is she real?",
        silviaMsg: "The Mirror Speaker... is she real, Hermes? Or only a reflection?",
        hermesReply: [
          "Real enough to cast a reflection, Silvia, which is more than I can say for some people I have met.",
          "Aurelia says the Mirror Speakers never show themselves: only their reflection, and only to those who come in peace.",
          "So I did something foolish. I bowed to the glass. In the mirror, she bowed back, a heartbeat late.",
          "I turned round. Nobody. Only the empty corridor, and my own old face.",
          "She drew her line again, in the glass beside me. I think she is listening to us. Mind your jokes, Silvia."
        ]
      },
      {
        text: "Keep the fragment safe.",
        silviaMsg: "Fragment first, Hermes. Wrap it well and keep it close.",
        hermesReply: (W) => [
          "It is wrapped in my scarf, inside my coat, against my chest. It is cold even through the wool.",
          "When I tilted it to the lamp there was a stage inside, lit by candles, and a small figure standing on it. Rather like me. I do not know whether to be flattered.",
          W.chose(33, 2)
            ? "You know why from the letter: nine pieces, so that no one could turn the Astrolabe alone. Eight more, Silvia."
            : "Aurelia says the mirror was broken in nine pieces so that no one could ever turn the Astrolabe alone. Eight more, Silvia.",
          "Every room of this theatre keeps one, and every room has its own trick."
        ]
      }
    ]
  };

  S[36] = {
    hermesFinal: (W) => {
      const c = W.choice(35);
      const knew = "Whoever wrote it knew you were coming, Silvia.";
      return clean([
        "We sleep behind the gate, in the old dressing rooms, on piles of costumes. Aurelia found a crown of paper stars and put it on my head.",
        c === 1 ? "Before I lay down I said goodnight to the glass. In the mirror at the end of the corridor, the grey gown drew her line once more."
          : c === 2 ? "I am keeping Fragment I under my head, in its scarf. Aurelia says a hard pillow makes honest dreams."
          : null,
        c === 0 ? "I have read the note a dozen times, and it still says the same three words. " + knew
          : "The note sealed with ash is in my coat. " + knew,
        "Let us find out what they want before they find out what we have.",
        "Fragment I is set in the mirror. Look at Path III on your map: the glass has begun to remember.",
        "The next room opens when the candles burn down, not before. I will call you then."
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
        "Silvia, are you awake? Nobody sleeps in this theatre for long.",
        c === 0 ? "I slept badly. The note is still in my coat, and I keep hearing it: ‘Let her through.’"
          : c === 1 ? "I slept badly. Each time I woke, the grey gown stood in the glass at the end of the corridor, still as a painting."
          : c === 2 ? "I slept badly. Fragment I kept me company all night, cold as a coin from the bottom of a well."
          : "I slept badly, which at my age is practically a hobby.",
        "The candles along the dressing rooms burned down all together, as if someone had counted them.",
        "At the end of the corridor, in the glass, the grey gown stood beside a door that was not there before.",
        "She drew her line on it, and it opened on a stair going down.",
        "Aurelia has already gone ahead. I can hear her counting the steps.",
        "Before I follow: the page “The Camera Obscura”, Silvia. It is the city of the third tower, drawn upside down.",
        "Aurelia says it is not a map. It is a memory: the city as it stood yesterday.",
        "Have it ready. Whatever waits down there, I think it needs your eyes more than mine."
      ];
    },
    choices: [
      {
        text: "I have the page “The Camera Obscura”. Go down.",
        silviaMsg: "I have the page “The Camera Obscura” in front of me, Hermes, upside down. Go down the stair.",
        hermesReply: [
          "Then down we go. Thirty-one steps, by Aurelia’s count.",
          "The air gets colder at every one of them, and the walls sweat as if the stone itself were nervous.",
          "My lamp turns the stairwell gold, and Aurelia’s shadow walks ahead of her, twice her size.",
          "Keep the page in front of you. When I reach the bottom, I will need you to tell me what I am looking at."
        ]
      },
      {
        text: "Why is the city upside down?",
        silviaMsg: "Why is the city on the page “The Camera Obscura” upside down, Hermes?",
        onPick: (W) => W.hint('s21-city', 1),
        hermesReply: [
          "Aurelia says it is not a mistake. It is the whole point.",
          "She will not say more. She smiled at the page like someone who has done this before, a long time ago.",
          "When I started to guess, she put a finger to my lips. She wants you to see it with your own eyes.",
          "She did tell me one thing: the page shows the city as it stood yesterday, and down there it will show it as it stands today.",
          "Four things will have changed. I wrote down what I could in Ask Hermes, so you can find it again."
        ]
      },
      {
        text: "Be careful on the stair.",
        silviaMsg: "Be careful on the stair, Hermes. Hold the rail.",
        hermesReply: [
          "There is no rail. There is Aurelia’s hand, and she has not let go of mine since the gate.",
          "I tested each step with my stick before I put my weight on it. The fourth is cracked clean through.",
          "Aurelia stepped over it without looking down. She has walked this stair before, Silvia. Long ago.",
          "I did not ask. She had the look of someone listening to a song from the next room."
        ]
      }
    ]
  };

  S[38] = {
    hermesFinal: (W) => {
      const c = W.choice(37);
      return clean([
        "We are at the bottom, and there is no light anywhere.",
        "A door, with a hole in it no bigger than a coin. That is all there is.",
        c === 1 ? "I am keeping my guesses to myself, on Aurelia’s orders. It is harder than the stair." : null,
        c === 2 ? "Aurelia has finally let go of my hand, but only to put it over my lamp. In a moment my eyes will learn the dark."
          : "Aurelia has put her hand over my lamp. In a moment my eyes will learn the dark.",
        "When they have, I will tell you what is on the wall. Open Path III on your Quest Map, Silvia, and look with me.",
        "You have the page. I have a hole in a wall."
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
        "You saw it first on the wall: a chimney that was cold on your page and smoking in the dark.",
        "So we went up into the city, to the narrow house behind the market.",
        "Fragment II was in the chimney, wrapped in a cloth that smelled of old smoke.",
        c === 1 ? "Now I see why the city was upside down: that room was built to let someone underground watch the streets." : null,
        "The Ashes had been there. The hearth was still warm.",
        "Their sign was scratched all over the walls, the circle with the line across it, over and over. They left in a hurry.",
        "Aurelia stood in the street a long time, looking up at the chimney.",
        "She says a fire like that is not lit by people who want to hide. It was lit so that someone would look.",
        "So tell me, Silvia: who were they hoping would look?"
      ]);
    },
    choices: [
      {
        text: "What was in the house?",
        silviaMsg: "What else was in the house, Hermes?",
        hermesReply: [
          "Nothing but ash, a stool and a broom with no bristles.",
          "And a floorboard that lifts. Under it, a hollow, empty, the dust still soft where something heavy lay.",
          "Whatever the raiders carried out of this house, they carried it quickly. But carefully: nothing was dragged.",
          "I do not like it, Silvia. Thieves in a hurry leave a mess. These left a room that looks tidied for guests."
        ]
      },
      {
        text: "Is Fragment II safe?",
        silviaMsg: "Is Fragment II safe, Hermes? Is it wrapped?",
        hermesReply: [
          "In my scarf, next to the first one. I wrapped them in separate cloths, and I might as well not have.",
          "The moment they touch, they hum, Silvia, like two glasses on a table when someone runs a wet finger round the rim.",
          "Aurelia says it is only the cold. I do not think she believes it herself.",
          "I held them apart: silence. Together: the hum. I have decided they like each other, and I shall treat them accordingly."
        ]
      },
      {
        text: "Where did the raiders go?",
        silviaMsg: "Where did the raiders go, Hermes?",
        hermesReply: [
          "Deeper into the theatre. The cellar has a second stair, and I could not see the bottom of it.",
          "From down there comes a sound like a great many people whispering at once. Aurelia says the next room is made of whispers.",
          "I would go down this minute if I were twenty. I am not, so we sleep first.",
          "Besides, a stair that whispers has opinions. I want to be rested before I hear them."
        ]
      }
    ]
  };

  S[40] = {
    hermesFinal: (W) => {
      const c = W.choice(39);
      return clean([
        "We rest in the cellar of the narrow house, with the hearth for company and the dust of the Ashes on everything.",
        "Aurelia has drawn the picture on the wall, upside down, in the margin of her sketchbook, so that she will not forget it.",
        c === 0 ? "I cannot stop thinking about the empty hollow under the floorboard. I would give a great deal to know what lay in it."
          : c === 1 ? "The two fragments are humming in my scarf. I have stopped telling them to be quiet."
          : c === 2 ? "The whispering has not stopped. It comes up the second stair like a draught, and I sleep with one ear open."
          : null,
        "Fragment II is set in the mirror. Look at Path III on your map: two pieces now, and in the second there is a window with a candle in it.",
        "The next door opens when the hearth burns low, not before. I will call you then."
      ]);
    }
  };

  // =========================================================================================
  // 41 · Station 22: the hearth goes out and the second stair leads down to the whispers
  // =========================================================================================
  S[41] = {
    hermesInitial: (W) => [
      "Silvia, the hearth has gone out, and the whispering under the floor has not stopped all night.",
      "I slept on stone, and I feel every year of it.",
      "In the black window of the cellar the grey gown stood a moment by the second stair, and drew her line across it.",
      "Aurelia is already lacing her boots. She says the room below was built by the Order to keep secrets, and that it keeps them very badly.",
      W.chose(39, 2)
        ? "You asked where the raiders went, and now we know: down that stair, toward the murmur."
        : "The raiders’ tracks end at the head of that stair, and the whispering comes up from below.",
      "The page “The Whispering Gallery”, Silvia: a hall shaped like an egg, two pins pulled out long ago, and a rose on the floor that listens.",
      "Have it ready. I will not pretend to be calm: I would rather face the Ashes than a hall that remembers every footstep."
    ],
    choices: [
      {
        text: "I have the page “The Whispering Gallery” ready.",
        silviaMsg: "I have the page “The Whispering Gallery” in front of me, Hermes. Go down.",
        hermesReply: [
          "Then down we go, as quietly as two old people can.",
          "Aurelia has taken off her boots after all. She says the floor below remembers footsteps.",
          "I took mine off too. The stone is as cold as a river, and I can already hear my own knees.",
          "Stay on the wire, Silvia. Whatever happens, I would rather have your voice than my courage."
        ]
      },
      {
        text: "What is the rose on the floor?",
        silviaMsg: "There is a rose drawn on the floor of the page “The Whispering Gallery”, Hermes. What is it?",
        onPick: (W) => W.hint('s22-focus', 1),
        hermesReply: [
          "Aurelia says the Order set a bronze rose in the floor where the western pin stood.",
          "It is the listener’s place: whoever came to hear the whispers would know where to stand.",
          "But the hall is dark, Silvia, and I will not see a rose under my own boots. You will have to tell me where it is.",
          "The page is your lantern. Find the rose on the plan, and walk me to it.",
          "I put down what I know in my notes, in Ask Hermes. Read them while I find my boots."
        ]
      },
      {
        text: "Be very quiet down there.",
        silviaMsg: "Be very quiet down there, Hermes. If you can hear them, they can hear you.",
        hermesReply: [
          "Only at the right place, Aurelia says. Everywhere else the gallery swallows every sound.",
          "But there is a catch. At the right place a whisper carries all the way to the far pin, and I suspect the Ashes are standing at the far pin.",
          "So I will say nothing aloud there. I will whisper to you from the stair, and nowhere else."
        ]
      }
    ]
  };

  S[42] = {
    hermesFinal: (W) => {
      const c = W.choice(41);
      return clean([
        "We are at the foot of the stair, at the door of a long hall with no corners.",
        "Columns all round it, and the dark in the middle.",
        c === 0 ? "Boots in my hand. The floor has not noticed us yet."
          : c === 1 ? "The floor here is polished by a thousand listeners. Somewhere in that dark a rose of bronze is waiting for you to find it."
          : c === 2 ? "I am whispering to you from the stair, as I said, and from nowhere else."
          : null,
        "At the far end two voices are whispering, and I cannot make out one word.",
        "Open Path III on your Quest Map, Silvia, and stand with me in the gallery. You have the page. I have two ears, and they are not as young as yours."
      ]);
    }
  };

  // =========================================================================================
  // 43 · Station 22 debrief: the words of the Ashes, the mirrored tune, Fragment III and the Line of the Echo
  // =========================================================================================
  S[43] = {
    hermesInitial: (W) => [
      "Fragment III is in my scarf with the other two, Silvia.",
      "They do not hum any more when they touch. They sing, very softly, the tune of the niche, backwards.",
      W.chose(41, 1)
        ? "You asked about the rose, and then you found it for me in the dark. I stood on it, and the whole hall poured its whispers into my ear."
        : "You walked me out to the rose, and the whole hall poured its whispers into my ear. I have never heard anything so clearly in my life.",
      "The Ashes were at the far pin, over a bowl of embers. They had played the tune of the niche back, note for note, and the niche stayed shut for them.",
      "You played it from the last note to the first, the way a mirror would. And a little door opened in the wall.",
      "Then I heard their last words, Silvia: ‘Leave it. She will come.’",
      "I have been turning those five words over ever since. They are not hunting us. They are waiting for you.",
      "Inside the door, scratched in Aurelia’s own old hand, there was a line for your Ledger: [J] × 2 = [T].",
      "Three questions, Silvia, and only one of me. Pick."
    ],
    choices: [
      {
        text: "Who is ‘she’?",
        silviaMsg: "Who did they mean, Hermes? ‘She will come.’",
        hermesReply: [
          "You, Silvia. I would give a great deal for it to be someone else, but there is no one else on this wire.",
          "Think of the gate: ‘Let her through.’ Now the gallery: ‘She will come.’ A note, then a whisper, and both about you.",
          "Someone has been laying out a carpet for you since the plateau.",
          "What I cannot see is why. Nobody waits for you who wants you stopped. So they are either a friend, or very, very sure of themselves.",
          "Aurelia has said nothing. She is holding the lid of my compass shut, as if the answer might get out."
        ]
      },
      {
        text: "I will solve the line.",
        silviaMsg: "I will put [J] × 2 = [T] in my Ledger and solve it, Hermes.",
        hermesReply: [
          "Twice J is T. And T you found long ago, in the desert.",
          "There is only one way this line can go, and it is yours to walk. I could do the sum on my fingers, and I will not. This one is yours.",
          "Aurelia says the Order liked its echoes exact: a sound that comes back twice as strong is not an echo. It is an answer."
        ]
      },
      {
        text: "What did Aurelia whisper?",
        silviaMsg: "What was Aurelia whispering toward the east end, Hermes?",
        hermesReply: [
          "She will not tell me. Something short, always the same, and it comes back across the hall small and clear.",
          "Once I thought it was my name. Then I thought it was a date. I am too old to ask twice.",
          "But she knew every column by touch, Silvia. She has been in this hall before. I would bet my compass on it.",
          "I will not push. The Servant said it comes back like water into a dry well: slowly, and from below."
        ]
      }
    ]
  };

  S[44] = {
    hermesFinal: (W) => {
      const c = W.choice(43);
      return clean([
        "We sleep by the west pin, wrapped in our coats on the cold floor.",
        "Every sound in the gallery comes to us here, and none of it is the Ashes any more: only drops of water, and the columns settling.",
        c === 0 ? "‘She will come.’ I fall asleep on those words, and I wake up on them."
          : c === 1 ? "The line is in your Ledger, and I will not peek at the sum. I will only lie here and guess, badly, until I sleep."
          : c === 2 ? "Aurelia is whispering toward the east end again, very softly, in her sleep. It comes back to me clear as a bell."
          : null,
        "Fragment III is set in the mirror. Look at Path III on your map: three pieces now, and in the third there is an arch, and the edge of a balcony.",
        "The Mirror Speaker has not opened the next door yet. When she does, I will call you."
      ]);
    }
  };
})();
