window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};
// Field Wire script, steps 25 to 32: noon under the Arch (Station 18), the Servant by the well, dawn at the inner stair (Station 19),
// Aurelia and the first truth. See docs/DESERT_ODYSSEY_BIBLE.md, "Estándar del chat del Field Wire".
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
        "You told me to go at once, and I tried. I stood up three times and sat down three times.",
        "All night I turned over your question: who else knew Aurelia's code? I never found an answer I liked.",
        "I sat up half the night with the mirror in my hand, waiting for the light to speak again. It never did."
      ][W.choice(23)] || "I sat up half the night watching Tower II for another light. None came.";
      return [
        "Noon, Silvia. I meant to leave at dawn, and my legs said no.",
        night,
        "In the end I slept two hours in the shade of the Arch, with the seals sewn into my coat.",
        "When I woke, the smoke was still standing over Tower II like a black tree.",
        "The Sanctuary is six hours from here, along the dry bed under the dunes. Leave now and I reach the foot of its steps after dark.",
        "From the terrace I can see the glint of harness down there. The wagons have not moved.",
        "And in the atrium waits the Servant's last trial: the stele, your page “The Polybius Stele”.",
        "Whoever is inside that tower tonight, I think we will need it. So, Silvia: how do I walk in?"
      ];
    },
    choices: [
      {
        text: "Arrive in the dark. Stay out of their sight.",
        silviaMsg: "Use the dark, Hermes. Go round the wagons and get in where nobody's watching.",
        hermesReply: [
          "Then the dark it is. I keep to the dry bed and stay off the ridges: a man on a skyline is a man in a spyglass.",
          "The Sanctuary is cut into the cliff, and no house of the Order was ever built with only one door.",
          "I will find the other one before they find me.",
          "And after the last dune I will not send a word. If the Wire goes quiet, Silvia, it means the Ashes are close, not that I am dead."
        ]
      },
      {
        text: "I'll have the page “The Polybius Stele” open and ready.",
        silviaMsg: "I've got the page “The Polybius Stele” open on my desk. Whatever it says, I'll read it with you.",
        hermesReply: [
          "Then I walk lighter. Two heads on the stele are better than one tired old one.",
          "Keep the founders' grid under one hand and the Law of the Inverted Mirage under the other.",
          "The Servant never chose a word by accident in his life, so I will not guess at it alone.",
          "I will send you every line exactly as it is carved. You read; I will watch the door."
        ]
      },
      {
        text: "If the Servant is alive, find him first.",
        silviaMsg: "Find the Servant first, Hermes. The stele can wait. He can't.",
        hermesReply: [
          "He made me wait at his gates until I had five seals. I would give all five to find him alive.",
          "The last I saw of him, he stood on the top step and watched me go until the dark took him.",
          "So no creeping about. Straight to the atrium by the shortest way, and the stele can wait: it has waited since the founders.",
          "If the Ashes see me, then they see me. I am going now, Silvia."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[26] = {
    hermesFinal: [
      "Six hours to Tower II, Silvia, along the dry bed under the dunes, straight toward the smoke.",
      "I will reach the foot of the Sanctuary steps after dark.",
      "Keep the page “The Polybius Stele” close: the stele of the Servant and its Law of the Inverted Mirage.",
      seals(atAltar()) + " sewn into my coat." + (atAltar() < 5 ? " The first still sleeps by the dry wash." : "")
    ]
  };

  // ---- Step 27 · Station 18 debrief: the Servant is alive, and what he said about the light ----
  window.WIRE_SCRIPT[27] = {
    hermesInitial: (W) => keep([
      "Silvia, he is alive. He is sitting next to me on the rim of the well, with a wet cloth round his hands.",
      [
        "The side door in the cliff let me in, as I hoped. After that it was your work and his.",
        "You read the stele and his knocks like a Servant of the Order yourself.",
        "You were right to send me to him first. Everything else could burn."
      ][W.choice(25)] || null,
      "The library is embers. The stele still stands in the middle of the atrium, black with soot and whole.",
      "The Ashes came at dusk and asked for the Oracle and her charts. He said no.",
      "So they burned the library to smoke out whoever was hiding.",
      "He went down into the old well with the charts in his arms and pulled the hatch shut over his head.",
      "The Oracle is safe, he says. Deeper in the rock than any fire can reach.",
      "Then I asked what I cannot stop asking. Who answered my light? Who knows the code I made for Aurelia?",
      "He looked at me for a long time, Silvia. Then he said: 'She came from the edge of the sky with a disc in her arms and no name.'",
      "That was all. Not one word more."
    ]),
    choices: [
      {
        text: "A disc in her arms... Ask him more.",
        silviaMsg: "A disc in her arms, Hermes... Ask him more. Please.",
        hermesReply: [
          "I asked. I asked three ways, Silvia, and one of them was rude.",
          "He only bowed his head and said: 'The rest is hers to tell.'",
          "Hers. Not his. So there is a she, under this rock, and she knows my code.",
          "A disc. A gold star painted on blue. A smear of lapis in a niche. I lay them side by side the way I lay out charts, and the picture frightens me.",
          "My hands are shaking again, and this time I know why. I do not dare to say it."
        ]
      },
      {
        text: "What did the raiders want with the charts?",
        silviaMsg: "Why the charts? What did the raiders want with them?",
        hermesReply: [
          "The Oracle's charts are the earth half of the Astrolabe: the measures of sand and stone the stars need to point at anything.",
          "The Ashes asked for them by name. They burned a whole library for a roll of maps that was under their feet.",
          "They did not find them. So the Astrolabe in their wagon is half blind: it has the stars, and no earth to aim at.",
          "It also means they will not stop at one fire. They will come back for whoever keeps those charts.",
          "I will sleep with my back against the hatch tonight, and the Servant will not argue."
        ]
      },
      {
        text: "Is he hurt? Take care of him.",
        silviaMsg: "Is he hurt? Take care of him, Hermes. Water, rest, and don't let him argue.",
        hermesReply: [
          "Burnt hands and smoke in his chest: nothing that water and a night's sleep will not mend.",
          "I washed the burns and wrapped them in my spare shirt. He called it a waste of good linen.",
          "He laughed at me for fussing. 'You walked the whole desert,' he said, 'and now you worry about my hands.'",
          "Then he let me carry the charts to the dry cellar, armful after armful of rolls in oilcloth, not one corner scorched.",
          "In all the years he has kept them, nobody else has touched them. I think that is how he says thank you."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[28] = {
    hermesFinal: (W) => {
      const n = atWell();
      const trust = (W.flag('regard') || 0) >= 3 ? "He gave it without a word. At his gates he would have made me earn it." : null;
      return keep([
        "Two lines were cut under the hatch of the well, Silvia: [H] − [U] = 16 and [M] + [T] = 25.",
        "Into your Cipher Ledger with them.",
        "And on the back of the stele, a bearing: 348° north-north-west. The same as Cairn III. It is on my sleeve with the others.",
        "Then the Servant put his key into my hand: the bronze key of the inner stair, its eye cut in a tiny grid of five by five.",
        trust
      ].concat(n >= 5
        ? [
          "'At dawn,' he said, 'with the five seals, she will receive you.'",
          "Station 19, Silvia: the page “The Oracle's Horizon”."
        ]
        : [
          "But he counted the seals in my coat, and there are " + seals(n).toLowerCase() + ". 'She receives no one until the five seals are home.'",
          "The first still sleeps by the dry wash. Station 19, the page “The Oracle's Horizon”, waits for it."
        ]));
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
      "He walked me to a door at the back of the atrium that I had never noticed: the inner stair, cut down into the rock.",
      "Before we went down, I climbed the steps to look outside. The Ashes' fires at the foot of the Sanctuary are cold.",
      "Their wagons are gone. The ruts run east, toward the sunrise. The one under the oilcloth went with them.",
      "At the bottom of the stair there is a second door: a slab of sandstone carved with a horizon, three mirrors and eight small sockets.",
      "It is your page “The Oracle's Horizon”, cut in stone.",
      "And behind it, someone is humming.",
      W.choice(17) === 0
        ? "The same tune the shepherd hummed for me on the hardpan."
        : "No words, only notes rising and falling. The shepherd said a veiled woman sings to the stars. I have not forgotten.",
      "I would rather not open it alone. Are you ready?"
    ]),
    choices: [
      {
        text: "I'm ready. Let's seal the horizon.",
        silviaMsg: "I'm ready, Hermes. The page “The Oracle's Horizon” is open. Let's seal the horizon together.",
        hermesReply: [
          "Together, then. I have climbed down a thousand stairs in my life, and never one this short.",
          "My knees are shaking like a schoolboy's.",
          "Eight sockets, three mirrors: this is a door made for two.",
          "I will read you every socket and every mirror as it is carved, and you tell me where each beacon goes."
        ]
      },
      {
        text: "Are you all right, Hermes?",
        silviaMsg: "Before you go down: are you all right, Hermes? Really?",
        hermesReply: (W) => [
          "No. And yes.",
          "I have been afraid of the wrong things for fifty-five years, Silvia: the dark, the sand, being forgotten.",
          W.flag('blessing')
            ? "I touch the red cord on my wrist, twelve knots, worn grey by the road. It helps a little."
            : "I hold the mirror on its cord against my chest. It helps a little.",
          "This morning I am only afraid of a door. Stay on the wire."
        ]
      },
      {
        text: "And the raiders? The Astrolabe?",
        silviaMsg: "And the raiders? They still have the Astrolabe, Hermes.",
        hermesReply: [
          "They do, and they took it east, toward the dawn, on ruts a child could follow.",
          "I keep asking myself why they left with the charts still under the rock. An Ash does not leave a job half done.",
          "Either they gave up, or they have a reason to go east that I do not know.",
          "One thing at a time, Silvia. Whatever is behind this door has waited longer than they have."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[30] = {
    hermesFinal: (W) => [
      "Down the inner stair, then.",
      "The Servant stays at the top with a lamp. He says this door is not his to open.",
      "The page “The Oracle's Horizon”, Silvia: eight beacons sent east across the three mirrors of the horizon, and the eight letters where they land.",
      "When the horizon is sealed, the door will open.",
      seals(W.seals()) + " in my coat, and the key in my hand."
    ]
  };

  // ---- Step 31 · Station 19 debrief: Aurelia, the first truth and the raiders gone east ----
  window.WIRE_SCRIPT[31] = {
    hermesInitial: (W) => keep([
      "Silvia. I have been sitting beside her for an hour, and I still cannot believe my own eyes.",
      [
        "You said you were ready at the door. I was not. Nobody could be.",
        "You asked at the door if I was all right. Now I can answer: I do not know the word for this.",
        "You asked about the Ashes at the door. Forgive me: for an hour I forgot them entirely."
      ][W.choice(29)] || null,
      "She did not die in 1971.",
      "A deep dune at the foot of the cliff caught her. Days later the Servant found her in the dry wash, with no name and no memory, the disc held to her chest.",
      "The Oracle before her had died in the same earthquake. She took the veil, and she has kept this desert ever since.",
      "The charts. The songs. The light on the tower. The gold stars, the lapis blue, the pebble in the pillar: it was her, all of it, all along.",
      "She remembers pieces: the fire in the observatory, the cold of the terrace, my voice. Not the bridge. Not yet.",
      "When she says my name she says it carefully, the way you carry something full to the brim.",
      "And the disc gave you the first truth, Silvia: the WHEN. December, the eighteenth to the twentieth.",
      "I waited fifty-five years for this hour, and I do not know what to do with it. Tell me."
    ]),
    choices: [
      {
        text: "Stay with her, Hermes. The rest can wait.",
        silviaMsg: "Stay with her, Hermes. The raiders, the Astrolabe, the next tower: all of it can wait a day.",
        hermesReply: [
          "A day, then. The Ashes have the road, but Aurelia has fifty-five years of things to show me.",
          "She wants me to see her charts. I want to watch her hands. She still grinds the lapis exactly as she did by our fire.",
          "I will not ask her one question about 1971. If she wants to tell me, she will, and if not we will talk about stars.",
          "An hour ago we argued about a meridian, Silvia. She won. I have not been so happy since I was twenty-four."
        ]
      },
      {
        text: "Will her memory come back?",
        silviaMsg: "Will her memory come back, Hermes? All of it?",
        hermesReply: [
          "The Servant says it comes back like water into a dry well: slowly, and from below.",
          "She remembered the vow the moment she heard it. She says the rest is waiting somewhere high and cold.",
          "I think I know where. I am afraid to say it aloud, in case it is not true.",
          "The Servant asked me one thing: not to say the word 'bridge' until she does. It will be the hardest promise I have ever kept."
        ]
      },
      {
        text: "Then we follow the raiders to the Stage.",
        silviaMsg: "Then we follow them, Hermes. The Astrolabe is going to the third tower, and so are we.",
        hermesReply: [
          "East, toward the Stage Tower, where the Mirror Speaker keeps the second truth. Those ruts lead nowhere else.",
          "They have the Astrolabe, the wagons and a day's start. We have the five seals, the charts and the first truth.",
          "And this time, Silvia, I am not going alone.",
          "But not today. She has not slept in two nights, and neither have I. At dawn."
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[32] = {
    hermesFinal: [
      "Two lines were scratched on the back of the disc, Silvia, under my old engraving, in a hand I would know anywhere: [Z] + [D] = 23 and [I] + [E] = 12.",
      "Into your Cipher Ledger with them.",
      "And she sent you something: a star of gold leaf on a card of lapis blue, painted while we talked. 'For the navigator who brought him back,' she said.",
      "One day of rest here, and at dawn we go east, Aurelia and I.",
      "The Desert Path is done. The first truth is yours: the WHEN, the eighteenth to the twentieth of December.",
      "The second waits at the Stage Tower, with the Mirror Speaker. The road ends where the curtain rises."
    ]
  };
})();
