// Field Wire script: window.WIRE_SCRIPT[step] (see hub/js/hub-core.js, "The script of the Field Wire"). Filled in chapter by chapter.
window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};

// Steps 10 to 16: Hermes crosses the Great Erg to the Sun Monolith (Station 14), the debrief at the niche of Cairn II, first light and the walk
// down to the Sandstone Labyrinth (Station 15), and the debrief of the labyrinth (the raiders' camp and the gold star).
(function () {
  var WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];
  function seals(n) { return (WORDS[n] || String(n)) + (n === 1 ? ' seal' : ' seals'); }
  // 1 if Hermes carried the Seal of Cairn I to the gates of Tower II (the same rule hub-core.js keeps, so a replay says what he said then)
  function gateSeal() {
    var saved = null, now = false;
    try { saved = localStorage.getItem('order_monolith_gate_seal1'); now = localStorage.getItem('order_seal_cairn_1') === 'true'; } catch (e) {}
    return (saved !== null ? saved === 'true' : now) ? 1 : 0;
  }
  function marchKind() { return window.GatesRoad && window.GatesRoad.marchKind ? window.GatesRoad.marchKind() : 'steady'; }

  // ---- Step 10: Hermes leaves the gates (or, if she answers late, he has already reached the Ridge of the Sun) ----
  window.WIRE_SCRIPT[10] = {
    hermesFinal: function (W) {
      var g = gateSeal(), out;
      if (window.wire10Arrived && window.wire10Arrived()) {
        out = [
          'I am not at the gates any more, Silvia. The night is behind me.',
          W.hours() + ' hours across the Great Erg by starlight, and now the Ridge of the Sun is under my boots.'
        ];
        if (W.flag('blessing')) out.push('The red cord stayed on my wrist all night. It did not warm me, but it reminded me who waits.');
        out.push(
          'Keep the page “The Sun Monolith & Cairn II” close, Silvia. Its seven noons are your work.',
          seals(5 - g) + ' to find. One is waiting under the Sun.'
        );
        return out;
      }
      var kind = marchKind(), road = W.road();
      out = [
        'I am setting out now, Silvia. North-north-east across the Great Erg, by night, with the stars for a compass.',
        W.hours() + (kind === 'shortcut' ? ' hours to the Ridge of the Sun, thanks to the Servant’s dry channel under the red dune.'
          : kind === 'storm' ? ' hours to the Ridge of the Sun. The wind is turning, and a storm from the south will cost me time.'
          : ' hours on foot to the Ridge of the Sun.'),
        road === 'bold' ? 'The Servant watched me go from the top step until the dark took him. He did not wave. I came to his gates hard, and I cannot blame him.'
          : road === 'observer' ? 'The Servant watched me go from the top step until the dark took him. I think I earned his respect by looking before I spoke.'
          : 'The Servant watched me go from the top step until the dark took him. I think my bow won me that much.'
      ];
      if (W.flag('blessing')) out.push('The red cord is on my wrist, and it is staying there.');
      else if (W.flag('gaveOil') || W.flag('lostOil')) out.push('My lamp is almost dry, so the first half of the night will be walked half blind.');
      out.push(
        'Keep the page “The Sun Monolith & Cairn II” close, Silvia. When I reach the Monolith, its seven noons will be your work.',
        seals(5 - g) + ' to find. One is waiting under the Sun.'
      );
      return out;
    }
  };

  // ---- Steps 11 and 12: the niche of Cairn II and its smear of cobalt blue ----
  window.WIRE_SCRIPT[11] = {
    hermesInitial: [
      'Silvia, the sun is down at last. The Monolith is quiet, and the Seal of Cairn II is in my satchel.',
      'Now that the light is soft I can finally look at the niche properly.',
      'You saw the iron scars on the rim, the raiders’ work. That is not what I am looking at.',
      'On the inner rim, right where the Seal was resting, there is a smear of blue.',
      'Not dust. Not stone. Pigment. Cobalt blue, ground so fine it shines like the night sky.',
      'I have seen that blue exactly once in my life. Aurelia ground her lapis like this, by the fire, for her star charts.',
      'It cannot be. Fifty-five years. The Order had other painters, and the sand keeps everything. Tired men see ghosts.',
      'But think, Silvia. The raiders came with iron and failed. Whoever left this blue never touched the lock.',
      'Someone who did not force the stone. Someone who knew how to wait for the sun.',
      'So what do we do with it? I am not sure I trust my own eyes tonight.'
    ],
    choices: [
      {
        text: 'Keep a little of the blue. We’ll find out at Tower II.',
        silviaMsg: 'Keep a little of that blue, Hermes. Whatever it is, we’ll find out at the gates of Tower II.',
        hermesReply: [
          'A grain, then. No bigger than a flea.',
          'I scraped it into the brass box where I keep my compass. It weighs nothing at all, and it is the heaviest thing I carry.',
          'From now on I look at the rim of every cairn I open, Silvia. If this blue has a cousin, I will find it.'
        ]
      },
      {
        text: 'Could another painter of the Order use the same lapis?',
        silviaMsg: 'Could another painter of the Order have used the same lapis?',
        hermesReply: [
          'Perhaps. The founders painted their charts with the same stone for centuries. That is the sensible answer.',
          'I am trying very hard to be sensible. But a painter who wants a mark seen puts it on the outside.',
          'This was under the lid, where only the one who opens the cairn would ever look.',
          'Not a mark for raiders, then. A mark for whoever opens the stone properly.',
          'I scraped a grain into the brass box with my compass anyway. Sensible men keep their evidence.'
        ]
      },
      {
        text: 'The raiders know about the seals. We have to be faster.',
        silviaMsg: 'Forget the ghosts for now, Hermes. The raiders know about the seals. We have to be faster.',
        hermesReply: [
          'You are right, and I hate that you are right.',
          'The iron marks are days old, no more. If they cannot open the cairns, they will follow the man who can.',
          'So: no fire tonight, no lamp, and I rub out my tracks before I leave.',
          'The blue comes with me all the same. A grain of it, in the brass box with my compass. I could not leave it all behind.'
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[12] = {
    hermesFinal: function (W) {
      var g = gateSeal(), c = W.choice(11);
      return [
        seals(g + 1) + ' of five, Silvia. The Seal of Cairn II is in my satchel' + (g ? ', next to the Seal of Cairn I.' : '.'),
        'The two lines cut inside the lid belong in your Cipher Ledger: [D] + [F] = 24 and [C] − [T] = 8.',
        c === 0 ? 'The grain of blue rides in the brass box beside my compass. At the gates of Tower II we will find out whose it is.'
          : c === 1 ? 'I am still trying to be sensible about that blue. The grain in my brass box is not helping.'
          : c === 2 ? 'No fire tonight, as agreed, and I will brush out my tracks before I go. The grain of blue stays in the brass box.'
          : 'The grain of blue is in my brass box now, beside the compass.',
        'Next is Cairn III, beyond the Arches of the West Wind, inside the Sandstone Labyrinth (Station 15).',
        'I will rest under the Monolith tonight and wire you at first light, before I set out.'
      ];
    }
  };

  // ---- Steps 13 and 14: first light at the Monolith, and the walk down to the labyrinth ----
  window.WIRE_SCRIPT[13] = {
    hermesInitial: function (W) {
      var c = W.choice(11), out = [
        'First light, Silvia. The cold woke me before the sun did, and the Monolith is turning gold above me.'
      ];
      if (c === 0) out.push('The grain of blue is still in the brass box. I checked it first thing, like a man checking his pulse.');
      else if (c === 1) out.push('I argued with that blue half the night and lost. The grain is still in the brass box.');
      else if (c === 2) out.push('No fire last night, and my tracks are brushed out. The grain of blue is still in the brass box.');
      return out.concat([
        'From the foot of the Monolith I can see the plateau of the Arches of the West Wind. Under it lies the Sandstone Labyrinth, and Cairn III.',
        'It lies south-south-east of here, on the old line of 348° that the founders cut into Cairn III to point back at this very stone.',
        'The line is on the page “The Five Geodetic Cairns”, if you want to check me.',
        'You may have noticed that the page “The Sandstone Labyrinth & Cairn III” says ‘North of the Sun Monolith’. That one is my doing.',
        'I copied the line from the founders’ survey, and it puzzled me for years. Last night, under the Monolith, I remembered how they drew their charts.',
        'South at the top, like the caravan cartographers. Their north is our south. The ground does not lie; only the paper turns.',
        'One more thing. There are fresh wheel ruts in the sand, going the same way.',
        'The BC Ashes fled into that labyrinth with their wagons once before. I would not be surprised to find them there again.'
      ]);
    },
    choices: [
      {
        text: 'Walk the reverse of the 348° groove.',
        silviaMsg: 'Use the page “The Five Geodetic Cairns”, Hermes. If Cairn III points at the Monolith on 348°, walk the reverse: 168°, south-south-east.',
        hermesReply: [
          'One hundred and sixty-eight degrees. You turn the founders’ compass faster than I do.',
          'I will keep the Monolith exactly behind my back all the way down. A straight line is a comfort in a land that likes to move.',
          'They cut that groove so that someone, some day, could walk it backwards. I am glad it is you reading the chart.'
        ]
      },
      {
        text: 'Keep off the ruts. Don’t let them see you.',
        silviaMsg: 'Keep away from those ruts, Hermes. Walk on rock where you can, and don’t let them see you coming.',
        hermesReply: [
          'Agreed. Wheels leave ruts, and men in a hurry follow ruts. I will walk the stone shelves, where the sand cannot remember me.',
          'If they are inside, I want to see their fires before they see my lamp.',
          'Every sentry walks a round, and torches are no different. I only have to watch long enough to learn it.',
          'I have jotted a note on it. If the torches ever give you trouble, look in Ask Hermes.'
        ],
        onPick: function (W) { W.hint('s15-torches', 1); }
      },
      {
        text: 'Copy the Tablet at the Mouth before you go in.',
        silviaMsg: 'Copy the tablet at the Mouth before you go in, Hermes. I’ll trace the true road on the page “The Sandstone Labyrinth & Cairn III”.',
        hermesReply: [
          'It is already in my log, from the founders’ survey: eight stone arches stand upon the one true road, each bearing a single letter.',
          'Find me those eight letters, Silvia, and I will speak them at the cairn.',
          'Start from the Southern Mouth, not from the cairn. A road is easier to read from where it begins.',
          'My first note on it is waiting in Ask Hermes, for the hour you need it.'
        ],
        onPick: function (W) { W.hint('s15-sigil', 1); }
      }
    ]
  };

  window.WIRE_SCRIPT[14] = {
    hermesFinal: function (W) {
      var g = gateSeal(), c = W.choice(13), out = [
        'I am going down now, Silvia. Six hours to the Southern Mouth of the labyrinth.'
      ];
      if (c === 0) out.push('Down the line of 168°, the Monolith dead behind me, then round the eastern rim. If the founders could cut a groove that straight, I can walk it.');
      else if (c === 1) out.push('Down the line of 168°, but on the stone shelves, away from every rut. I will look for their fires before I look for the cairn.');
      else if (c === 2) out.push('Down the line of 168°, then round the eastern rim. At the Mouth I copy the Tablet first, and then I wait for the dark.');
      else out.push('Down the line of 168°, then round the eastern rim, keeping to the rock.');
      return out.concat([
        'I reach the Mouth at noon, but I will not go in before dark. The labyrinth is an oven by day, and at night their torches will tell me where they are.',
        'Trace the true road on the page “The Sandstone Labyrinth & Cairn III” while I walk. Only one road reaches Cairn III, and eight arches stand upon it.',
        seals(g + 1) + ' in my satchel, Silvia. ' + seals(4 - g) + ' still sleeping in the stone.'
      ]);
    }
  };

  // ---- Steps 15 and 16: out of the labyrinth, with the Seal of Cairn III, the raiders' camp and a star of gold leaf ----
  window.WIRE_SCRIPT[15] = {
    hermesInitial: function (W) {
      var c = W.choice(11), out = [
        'I am out, Silvia. Through the Western Cleft and into the rocks at the edge of the hardpan.',
        'The Seal of Cairn III is wrapped in my scarf, and they never saw my face. You walked me past every torch.',
        'My hands are still shaking, so forgive the rush. Two things followed me out of that labyrinth.',
        'The first is their camp. Cold ashes, a broken wagon wheel, and the charred circle of the BC Ashes scratched on the rock.',
        'They have been sleeping in that labyrinth for days, waiting for someone to open the cairn for them. Now they know someone did.',
        'The second is a star. On the wall of a fissure: eight points painted in gold leaf over a ground of blue, and the gold still bright.',
        'Aurelia gilded her stars exactly like that. The blue first, so the gold would seem to burn in the night.'
      ];
      if (c === 0) out.push('That grain in my brass box has company now. The star sits on a ground of what I would swear is the same blue.');
      else if (c === 1) out.push('I told you a painter of the Order could have used that lapis. A sensible painter does not gild stars under raiders’ noses.');
      else if (c === 2) out.push('You told me to forget the ghosts for now. I tried, Silvia. The ghosts did not get the message.');
      return out.concat([
        'First the blue at Cairn II, now this. Either the sun is cooking my mind, or someone walks these cairns ahead of me.',
        'Someone who knows the old way of painting the sky. What do you make of it?'
      ]);
    },
    choices: [
      {
        text: 'Someone is marking the way for you.',
        silviaMsg: 'Hermes, that’s no accident. Someone is marking the way for you. The blue at Cairn II, the gold in the labyrinth...',
        hermesReply: [
          'Or marking it for someone else, and I happen to be walking it.',
          'Either way, it looks like one mark for each cairn. Blue at the second, gold at the third.',
          'I copied the star into my log, point by point. Eight points, like the wind rose of the Order.',
          'At Cairn IV I will look at the ground before I look at the stone. If there is a mark, I will find it.'
        ]
      },
      {
        text: 'Lose the raiders before Cairn IV.',
        silviaMsg: 'The raiders will follow you now. Lose them before Cairn IV, whatever it takes.',
        hermesReply: [
          'They will, the moment they find an empty labyrinth and a missing seal.',
          'The canyon of Cairn IV is far to the south-west, across the open hardpan. There is no cover out there, Silvia, but there is night.',
          'I cross it in the dark. No fire, and no tracks where sand can be avoided.',
          'Let them search the labyrinth for a man who is no longer in it.'
        ]
      },
      {
        text: 'Tell me about Aurelia’s stars.',
        silviaMsg: 'Tell me about Aurelia’s stars, Hermes. How did she paint them?',
        hermesReply: [
          'With a brush of squirrel hair, holding her breath so the gold leaf would not fly away.',
          'A ground of lapis first. Then the gold. Then one stroke of white at the tip of each point.',
          'I never saw anyone else do it. I never saw anyone else need to.',
          'You ask about her as if she were still painting somewhere. Nobody has asked me that in a long time.',
          'I saw the star in the labyrinth by torchlight and never looked at its tips. If there is another, I look at the tips first.'
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[16] = {
    hermesFinal: function (W) {
      var g = gateSeal(), c = W.choice(15);
      return [
        seals(g + 2) + ' of five, Silvia. The Seal of Cairn III is in my satchel now, next to the Seal of Cairn II.',
        'The two lines carved under the copper plate belong in your Cipher Ledger: [W] + [A] = 26 and [N] − [E] = 9.',
        c === 0 ? 'The gold star is in my log, point by point. If Cairn IV has a mark for me, I will find it.'
          : c === 1 ? 'I brushed out my own tracks at the Cleft as I left. Let them hunt the labyrinth for a ghost.'
          : c === 2 ? 'I keep seeing Aurelia’s hands over the lapis, Silvia. It is a long march, and I will need all of it to get sensible again.'
          : 'The gold star is in my log, point by point.',
        'The fourth cairn stands far to the south-west, where the canyon narrows: Cairn IV, the Sentry of the Canyon (Station 16).',
        'I will sleep in the rocks through tomorrow’s heat and wire you at dusk, before I cross the hardpan.'
      ];
    }
  };
})();
