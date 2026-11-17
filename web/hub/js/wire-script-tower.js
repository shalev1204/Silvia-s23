window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};
// Field Wire script, steps 25 to 32: noon under the Arch (Station 18), the Servant by the well, dawn at the inner stair (Station 19),
// Aurelia and the first truth. Quick chat standard: short beats, Silvia speaks every few messages (asks). See docs/DESERT_ODYSSEY_BIBLE.md, "Estándar del chat del Field Wire".
(function () {
  // Seals in Hermes's coat at the altar and by the well: the same rules as sealsAtAltar / sealsAtWell in hub-core.js (saved once, so replays keep what he said)
  const ls = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const atGates = () => { const s = ls('order_monolith_gate_seal1'); return s !== null ? (s === 'true' ? 1 : 0) : (ls('order_seal_cairn_1') === 'true' ? 1 : 0); };
  const atAltar = () => { const n = parseInt(ls('order_cairn5_seals_at_altar') || '', 10); return n >= 1 && n <= 5 ? n : Math.min(5, atGates() + 4); };
  const atWell = () => { const n = parseInt(ls('order_stele_seals_at_well') || '', 10); return n >= 1 && n <= 5 ? n : atAltar(); };
  const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];
  const seals = (n) => (WORDS[n] || String(n)) + (n === 1 ? ' seal' : ' seals');
  const keep = (list) => list.filter(Boolean);

  // ---- Step 25 · Under the Arch at noon: the smoke over Tower II (Station 18 next) ----
  window.WIRE_SCRIPT[25] = {
    hermesInitial: (W) => {
      const night = [
        "You told me to go at once. I stood up three times and sat down three times.",
        "All night I turned over your question: who else knew Aurelia's code? I found no answer I liked.",
        "I sat up with the mirror in my hand, waiting for the light to speak again. It never did."
      ][W.choice(23)] || "I sat up half the night watching Tower II for another light. None came.";
      return [
        "Noon, Silvia. I meant to leave at dawn, and my legs said no.",
        night,
        "I slept two hours in the shade of the Arch, and woke to the smoke still standing over Tower II like a black tree.",
        { ask: [
          { text: "Is the fire still burning?", silviaMsg: "Is the fire still burning down there, Hermes?",
            reply: ["Only smoke now, thick and slow. Something big burned all night.", "I fear it was the Servant's library."] },
          { text: "Eat something first.", silviaMsg: "Before anything else, eat something. A hero on an empty stomach is just a man with a stick.",
            reply: ["Half a loaf and a handful of dates, standing up. The bread won.", "And I patted the seals in my coat twice. All still there."] },
          { text: "Could that smoke be a signal?", silviaMsg: "Hermes, could that smoke be a signal? A message?",
            reply: ["Smoke that tall can be read a day's ride away.", "I only hope it was written for us, and not against us."] }
        ] },
        "The Sanctuary is six hours from here, along the dry bed under the dunes. Leave now and I reach its steps after dark.",
        "I can see the glint of harness from the terrace. The wagons have not moved.",
        { ask: [
          { text: "Could the Servant be inside?", silviaMsg: "Hermes... could the Servant still be inside that tower?",
            reply: ["He has not left his post in fifty years.", "If he is in there, he is hiding. Or he is not. I did not finish that thought, and I will not finish it for you."] },
          { text: "How many men are down there?", silviaMsg: "Wagons mean men. How many, Hermes?",
            reply: ["Three wagons, one under oilcloth. A dozen riders would fit round them.", "I do not like those odds in the dark."] },
          { text: "A burning tower. Of course.", silviaMsg: "So you are walking into a burning tower. Of course you are. Promise me it will not become a habit.",
            reply: ["It is my first burning tower, Silvia, and I mean it to be my last.", "Though I will admit the smoke has a certain flair."] }
        ] },
        "And in the atrium waits the Servant's last trial: the stele, your page “The Polybius Stele”. So, how do I walk in?"
      ];
    },
    choices: [
      {
        text: "Arrive in the dark. Stay out of their sight.",
        silviaMsg: "Use the dark, Hermes. Go round the wagons and get in where nobody's watching.",
        hermesReply: [
          "Then the dark it is. I keep to the dry bed and off the ridges: a man on a skyline is a man in a spyglass.",
          "The Sanctuary is cut into the cliff, and no house of the Order was ever built with only one door. I will find the other one.",
          { ask: [
            { text: "What if both doors are guarded?", silviaMsg: "And if both doors are guarded?",
              reply: ["Then I wait for the moon to set and the guards to nod. Patience is the one thing I have plenty of."] },
            { text: "Flash your mirror to distract them.", silviaMsg: "Use your mirror. One flash on the wrong ridge, and they all look the other way.",
              reply: ["It might work. It would also tell the whole valley where I am.", "One flash, then, and not a second more."] },
            { text: "Take notes. I'm grading you.", silviaMsg: "Take notes on the way in. I am grading you.",
              reply: ["Door found: eight out of ten. Door found unguarded: full marks.", "I will try for full marks, Silvia. It is better for my knees."] }
          ] },
          "And past the last dune I send nothing. If the Wire goes quiet, it means the Ashes are close, not that I am dead."
        ]
      },
      {
        text: "I'll have the page “The Polybius Stele” open and ready.",
        silviaMsg: "I've got the page “The Polybius Stele” open on my desk. Whatever it says, I'll read it with you.",
        hermesReply: [
          "Then I walk lighter. Two heads on the stele are better than one tired old one.",
          "Keep the founders' grid under one hand and the Law of the Inverted Mirage under the other.",
          "I will send you every line as it is carved. You read; I watch the door."
        ]
      },
      {
        text: "If the Servant is alive, find him first.",
        silviaMsg: "Find the Servant first, Hermes. The stele can wait. He can't.",
        hermesReply: (W) => [
          W.ask(25, 'i', 1) === 0
            ? "You asked if he is inside, and I cannot stop asking it myself. I would give every seal I carry to find him alive."
            : "He made me wait at his gates until I had five seals. I would give every seal I carry to find him alive.",
          "The last I saw of him, he stood on the top step and watched me go until the dark took him.",
          "So no creeping about. Straight to the atrium by the shortest way: the stele has waited since the founders, and it can wait for me. Going now, Silvia."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[26] = {
    hermesFinal: [
      "Six hours along the dry bed, straight toward the smoke. I reach the steps of the Sanctuary after dark.",
      "Keep the page “The Polybius Stele” close: the Servant's stele and its Law of the Inverted Mirage.",
      seals(atAltar()) + " sewn into my coat." + (atAltar() < 5 ? " The first still sleeps by the dry wash." : "")
    ]
  };

  // ---- Step 27 · Station 18 debrief: the Servant is alive, and what he said about the light ----
  window.WIRE_SCRIPT[27] = {
    hermesInitial: (W) => keep([
      "Silvia, he is alive. He is sitting next to me on the rim of the well, with a wet cloth round his hands.",
      [
        "The dark did its work. The side door in the cliff let me in, and nobody saw me.",
        "I found a side door in the cliff and slipped in. After that it was your work and his: you read that stele like a Servant yourself.",
        "You were right to send me to him first. Everything else could burn, and nearly did."
      ][W.choice(25)] || null,
      "The library is embers. The stele still stands in the atrium, black with soot and whole.",
      { ask: [
        { text: "Is he badly hurt?", silviaMsg: "Is he badly hurt, Hermes? Tell me the truth.",
          reply: ["Burnt palms and a cough. He says he has had worse from a bad stew.", "That is why the wet cloth."] },
        { text: "What did he say when he saw you?", silviaMsg: "What did he say when he saw you?",
          reply: ["'You are late.' Then he gave me his own cup of water, with hands that would not stop shaking."] },
        { text: "Did he ask for his seals back?", silviaMsg: "Did he ask for his seals back? I would have.",
          reply: ["He counted them first. Of course he did.", "Then he said nothing, which is his way of saying well done."] }
      ] },
      "The Ashes came in the night, while the light was still speaking, and asked for the Oracle and her charts. He said no, so they burned the library.",
      "He went down the old well with the charts in his arms and pulled the hatch shut. The Oracle is safe, he says, deeper in the rock than fire can reach.",
      { ask: [
        { text: "Have you ever seen the Oracle?", silviaMsg: "Have you ever seen the Oracle, Hermes?",
          reply: ["Never. She is a voice and a veil, and the Order keeps her faceless.", "In 1998 I mistook a bearded old man for her. I have not forgiven myself."] },
        { text: "Is she really safe down there?", silviaMsg: "Is she really safe down there?",
          reply: ["The Servant would stake his life on it. Tonight he very nearly did."] },
        { text: "Take me to her. Now.", silviaMsg: "Then take me to her, Hermes. Now.",
          reply: ["Not yet. She receives at dawn, and only with the five seals.", "At dawn, if he allows it."] }
      ] },
      "Then I asked who answered my light. He said: 'She came from the edge of the sky with a disc in her arms and no name.'"
    ]),
    choices: [
      {
        text: "A disc in her arms... Ask him more.",
        silviaMsg: "A disc in her arms, Hermes... Ask him more. Please.",
        hermesReply: [
          "I asked three ways, Silvia, and one of them was rude. He only bowed his head: 'The rest is hers to tell.'",
          "Hers. So there is a she under this rock, and she knows my code.",
          "A disc. A gold star on blue. A smear of lapis in a niche. Side by side, they frighten me. My hands are shaking again, and I do not dare say why."
        ]
      },
      {
        text: "What did the raiders want with the charts?",
        silviaMsg: "Why the charts? What did the raiders want with them?",
        hermesReply: [
          "The Oracle's charts are the earth half of the Astrolabe: the measures of sand and stone the stars need to point at anything.",
          "The Ashes burned a library for a roll of maps that lay under their feet. Their Astrolabe is half blind: it has the stars, and no earth to aim at.",
          { ask: [
            { text: "They'll be back for the charts.", silviaMsg: "They will come back for those charts, Hermes.",
              reply: ["They will. So tonight I sleep with my back against the hatch, and the Servant will not argue."] },
            { text: "Can the charts be hidden?", silviaMsg: "Can the charts be hidden somewhere else?",
              reply: ["The Servant has hidden them under this rock for decades. The hiding place is sound.", "The danger is the one man who knows it."] },
            { text: "Half blind is good. Keep it that way.", silviaMsg: "Half blind is good. Whatever you do, don't give them the other half.",
              reply: ["Never. If I must choose between the charts and my skin, my skin goes first.", "The Servant would say the charts go first. We are a stubborn pair."] }
          ] }
        ]
      },
      {
        text: "Is he hurt? Take care of him.",
        silviaMsg: "Is he hurt? Take care of him, Hermes. Water, rest, and don't let him argue.",
        hermesReply: (W) => [
          W.ask(27, 'i', 0) === 0
            ? "As I said: burnt palms, a cough, nothing a night's sleep will not mend. I washed the burns and wrapped them in my spare shirt."
            : "Burnt hands and smoke in his chest: nothing a night's sleep will not mend. I washed the burns and wrapped them in my spare shirt.",
          "He called it a waste of good linen, then laughed at me. 'You walked the whole desert,' he said, 'and now you worry about my hands.'",
          "Then he let me carry the charts to the dry cellar, not one corner scorched. In all his years nobody else touched them: his way of saying thanks."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[28] = {
    hermesFinal: (W) => {
      const n = atWell();
      const trust = (W.flag('regard') || 0) >= 3;
      return [
        "Two lines were cut under the hatch of the well: [H] − [U] = 16 and [M] + [T] = 25. Into your Ledger. The stele's back: 348° NNW, as at Cairn III.",
        trust
          ? "The Servant gave me the bronze key of the inner stair without a word, its eye a tiny grid. At his gates he would have made me earn it."
          : "The Servant put the bronze key of the inner stair in my hand, its eye cut in a tiny grid of five by five.",
        n >= 5
          ? "'At dawn,' he said, 'with the five seals, she will receive you.' Station 19, Silvia: the page “The Oracle's Horizon”."
          : "But he counted " + seals(n).toLowerCase() + " in my coat. 'She receives no one until the five seals are home.' The first still sleeps by the dry wash."
      ];
    }
  };

  // ---- Step 29 · Station 19: dawn at the inner stair of Tower II ----
  window.WIRE_SCRIPT[29] = {
    hermesInitial: (W) => keep([
      "Dawn, Silvia. The Servant woke me before first light with a cup of mint tea and the bronze key.",
      [
        "I slept badly, thinking of the words he would not say.",
        "I slept with my back to the hatch, as I said. The charts are safe.",
        "His hands are better this morning. He refuses to admit it."
      ][W.choice(27)] || null,
      "From the top step I looked out. The Ashes' fires are cold and their wagons gone. The ruts run east, and the one under the oilcloth went with them.",
      { ask: [
        { text: "Why would they just leave?", silviaMsg: "Gone? Why would they just leave, Hermes?",
          reply: ["That is what bothers me. They left the charts under the rock.", "Either they gave up, or something in the east pulls harder than the charts."] },
        { text: "Did they leave anyone behind?", silviaMsg: "Did they leave anyone behind? A watcher?",
          reply: ["I walked the terrace twice. No men, no camels. Only cold ash and a bent wagon wheel."] },
        { text: "Good riddance, then.", silviaMsg: "Good riddance. Let them go and let us breathe.",
          reply: ["A man who burns a library is not a nuisance, Silvia. But yes.", "I let myself breathe for one whole minute."] }
      ] },
      "Then the Servant led me to a door at the back of the atrium I had never noticed: the inner stair, cut down into the rock.",
      "At the bottom, a second door: sandstone carved with a horizon, three mirrors and eight small sockets. Your page “The Oracle's Horizon”, in stone.",
      { ask: [
        { text: "What do the sockets look like?", silviaMsg: "What do the eight sockets look like?",
          reply: ["Round and smooth, each the size of my thumb, with a little flame cut above it.", "Eight beacons, I think. The mirrors above shine like water."] },
        { text: "Is it safe to touch?", silviaMsg: "Is it safe to touch, Hermes?",
          reply: ["I laid my palm on the slab. Warm, and faintly humming.", "Alive, in a way stones should not be."] },
        { text: "Knock first, Hermes.", silviaMsg: "Knock first. Manners, Hermes.",
          reply: ["I knocked. The humming stopped.", "A long breath later it began again. Whoever is behind it heard me."] }
      ] },
      W.choice(17) === 0
        ? "Behind it, someone is humming: the same tune the shepherd hummed for me on the hardpan. Are you ready?"
        : "Behind it, someone is humming, no words. The shepherd said a veiled woman sings to the stars. Are you ready?"
    ]),
    choices: [
      {
        text: "I'm ready. Let's seal the horizon.",
        silviaMsg: "I'm ready, Hermes. The page “The Oracle's Horizon” is open. Let's seal the horizon together.",
        hermesReply: (W) => keep([
          "Together, then. I have climbed down a thousand stairs in my life, and never one this short. My knees shake like a schoolboy's.",
          "Eight sockets, three mirrors: a door made for two. I read you each one as it is carved, and you tell me where each beacon goes.",
          W.ask(29, 'i', 1) === 2 ? "And I knock once more before I touch anything. You taught me manners." : null
        ])
      },
      {
        text: "Are you all right, Hermes?",
        silviaMsg: "Before you go down: are you all right, Hermes? Really?",
        hermesReply: (W) => [
          "No. And yes. I was afraid of the wrong things for fifty-five years, Silvia: the dark, the sand, being forgotten.",
          { ask: [
            { text: "Then I'll hold the door with you.", silviaMsg: "Then I'll hold the door with you, Hermes. Every step.",
              reply: ["That is all I ask. Hold it."] },
            { text: "A door can't hurt you.", silviaMsg: "A door can't hurt you, Hermes. It is wood. Or rock. Whatever.",
              reply: ["The door, no. What waits behind it, and whether it knows my name."] },
            { text: "What scares you most?", silviaMsg: "Tell me what scares you most. Plainly.",
              reply: ["That she knows me and I do not know her.", "Or worse: that she knows me, and I do not know her face."] }
          ] },
          W.flag('blessing')
            ? "I touch the red cord on my wrist, twelve knots worn grey by the road. It helps a little."
            : "I hold the mirror on its cord against my chest. It helps a little.",
          "This morning I am only afraid of a door. Stay on the wire."
        ]
      },
      {
        text: "And the raiders? The Astrolabe?",
        silviaMsg: "And the raiders? They still have the Astrolabe, Hermes.",
        hermesReply: (W) => [
          "They do, and they took it east, toward the dawn, on ruts a child could follow.",
          W.ask(29, 'i', 0) === 0
            ? "You asked why they left. I still have no answer, only that east is where the road goes."
            : "I do not like how easily they left. An Ash never leaves a job half done.",
          "One thing at a time, Silvia. Whatever is behind this door has waited longer than they have."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[30] = {
    hermesFinal: (W) => [
      "Then I go in. The Servant stays at the top with a lamp: this door is not his to open.",
      "The page “The Oracle's Horizon”, Silvia: eight beacons sent east across three mirrors, and eight letters where they land. Seal it, and the door opens.",
      seals(W.seals()) + " in my coat, and the key in my hand."
    ]
  };

  // ---- Step 31 · Station 19 debrief: Aurelia, the first truth and the raiders gone east ----
  window.WIRE_SCRIPT[31] = {
    hermesInitial: (W) => keep([
      "Silvia. I have sat beside her for an hour, and I still cannot believe my eyes.",
      [
        "You said you were ready, at the door. I was not. Nobody could be.",
        "You asked at the door if I was all right. Now I can answer: I do not know the word for this.",
        "You asked about the Ashes at the door. Forgive me: I forgot them entirely for an hour."
      ][W.choice(29)] || null,
      "She did not die in 1971.",
      { ask: [
        { text: "I knew it.", silviaMsg: "I knew it, Hermes. I knew it.",
          reply: ["You believed it before I did. I owe this desert an apology for doubting it."] },
        { text: "Hermes... are you crying?", silviaMsg: "Hermes... are you crying?",
          reply: ["Yes. Do not tell the Servant.", "He came down when the door opened, and has pretended not to see ever since."] },
        { text: "How? Tell me everything.", silviaMsg: "How? Tell me everything, from the start.",
          reply: ["From the very beginning, then. Slowly, or I will tell it wrong."] }
      ] },
      "A deep dune at the foot of the cliff caught her. Days later the Servant found her in the dry wash, with no name, no memory, the disc to her chest.",
      "The Oracle before her died in the same earthquake. She took the veil and kept this desert since: the charts, the songs, the light on the tower.",
      { ask: [
        { text: "Does she remember you?", silviaMsg: "Does she remember you, Hermes?",
          reply: ["Pieces: the fire in the observatory, the cold of the terrace, my voice. Not the bridge. Not yet.", "She says my name carefully, the way you carry something full to the brim."] },
        { text: "What is she like?", silviaMsg: "What is she like, Hermes? Truly.",
          reply: ["Small, straight-backed, hands stained blue to the wrist. Dry as sand, and kind under it.", "She corrected my star chart within a minute."] },
        { text: "Does she know about me?", silviaMsg: "Does she know about me?",
          reply: ["She calls you 'the navigator'. She said it before I said a word about you.", "I did not ask how."] }
      ] },
      "The gold stars, the lapis blue, the pebble in the pillar: hers too. I waited fifty-five years for this hour, and I do not know what to do with it."
    ]),
    choices: [
      {
        text: "Stay with her, Hermes. The rest can wait.",
        silviaMsg: "Stay with her, Hermes. The raiders, the Astrolabe, the next tower: all of it can wait a day.",
        hermesReply: [
          "A day, then. The Ashes have the road, but Aurelia has fifty-five years of things to show me.",
          "She grinds her lapis exactly as she did by our fire. I will not ask her one question about 1971. If she wants to tell me, she will.",
          "An hour ago we argued about a meridian. She won. I have not been so happy since I was twenty-four."
        ]
      },
      {
        text: "Will her memory come back?",
        silviaMsg: "Will her memory come back, Hermes? All of it?",
        hermesReply: [
          "The Servant says it comes back like water into a dry well: slowly, and from below.",
          "She knew the vow the moment she heard it. She says the rest waits somewhere high and cold. I think I know where, and I am afraid to say it.",
          "The Servant asked me one thing: not to say the word 'bridge' until she does. It will be the hardest promise I have ever kept."
        ]
      },
      {
        text: "Then we follow the raiders to the Stage.",
        silviaMsg: "Then we follow them, Hermes. The Astrolabe is going to the third tower, and so are we.",
        hermesReply: [
          "East, toward the Stage Tower, where the Mirror Speaker keeps the second truth. Those ruts lead nowhere else.",
          "They have the Astrolabe, the wagons and a day's start. We have the five seals, the charts and the first truth. And this time I am not going alone.",
          { ask: [
            { text: "Is she strong enough to travel?", silviaMsg: "Is she strong enough for a journey like that?",
              reply: ["She laughed at me. She has walked this desert for fifty-five years, Silvia. I am the one who limps."] },
            { text: "Take the charts with you.", silviaMsg: "Take the charts with you, Hermes. All of them.",
              reply: ["Already rolled in oilcloth. The Servant did it himself, and would not let me help."] },
            { text: "Promise me you'll be careful.", silviaMsg: "Promise me you will be careful. Both of you.",
              reply: ["I promise to be careful, and to be seen being careful. That is the best I do."] }
          ] },
          "But not today. She has not slept in two nights, and I have slept one. At dawn."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[32] = {
    hermesFinal: (W) => [
      "On the back of the disc, under my old engraving, in a hand I would know anywhere: [I] + [E] = 12 and [I] + [J] = 18. Into your Cipher Ledger.",
      "And she sent you a star of gold leaf on a card of lapis blue, painted while we talked. 'For the navigator who brought him back,' she said.",
      { ask: [
        { text: "Thank her for me.", silviaMsg: "Thank her for me, Hermes. Properly.",
          reply: ["I will. She will say it was nothing, and look pleased for an hour."] },
        { text: "Why a star?", silviaMsg: "Why a gold star, Hermes?",
          reply: ["It is how she signed her charts.", "Every gold star I found in this desert was hers, and now you hold a sister of them."] },
        { text: "Is she really coming east?", silviaMsg: "Is she really coming east with you?",
          reply: ["At dawn, with her charts under her arm. She did not ask; she informed me.", "The second truth waits at the Stage Tower, with the Mirror Speaker. The road ends where the curtain rises."] }
      ] },
      (W.choice(31) === 0
        ? "Staying a day, as you said, then east at dawn with her. "
        : "One day of rest, then east at dawn, Aurelia and I. ") +
        "The Desert Path is done. The WHEN is yours: the eighteenth to the twentieth of December."
    ]
  };
})();
