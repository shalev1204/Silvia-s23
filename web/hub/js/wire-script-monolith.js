// Field Wire script: window.WIRE_SCRIPT[step] (see hub/js/hub-core.js, "The script of the Field Wire"). Filled in chapter by chapter.
window.WIRE_SCRIPT = window.WIRE_SCRIPT || {};

// Steps 10 to 16: Hermes crosses the Great Erg to the Sun Monolith (Station 14), the debrief at the niche of Cairn II, first light and the walk
// down to the Sandstone Labyrinth (Station 15), and the debrief of the labyrinth (the raiders' camp and the gold star).
// Written as a quick chat: Silvia speaks every few messages (the "ask" objects), and her three main choices decide the replies.
(function () {
  var WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];
  function seals(n) { return (WORDS[n] || String(n)) + (n === 1 ? ' seal' : ' seals'); }
  // 1 if Hermes carried the Seal of Cairn I to the gates of Tower II (the same rule hub-core.js keeps, so a replay says what he said then)
  function gateSeal() {
    var saved = null, now = false;
    try { saved = localStorage.getItem('order_monolith_gate_seal1'); now = localStorage.getItem('order_seal_cairn_1') === 'true'; } catch (e) {}
    return (saved !== null ? saved === 'true' : now) ? 1 : 0;
  }
  // What the dark of the labyrinth gave up (Station 15): the finds she sent him to, and the raiders' voices he overheard
  function labyList(key) {
    try { var v = JSON.parse(localStorage.getItem(key) || '[]'); return Object.prototype.toString.call(v) === '[object Array]' ? v : []; } catch (e) { return []; }
  }
  function labyFound(id) { return labyList('order_labyrinth_finds').indexOf(id) >= 0; }
  function labyHeard(i) { return labyList('order_labyrinth_overheard').indexOf(i) >= 0; }
  function marchKind() { return window.GatesRoad && window.GatesRoad.marchKind ? window.GatesRoad.marchKind() : 'steady'; }
  // the option she took in an ask (0/1/2), or null if it never came up (W.ask may not exist in an older hub-core.js)
  function asked(W, step, part, i) {
    try { var v = W.ask ? W.ask(step, part, i) : null; return typeof v === 'number' ? v : null; } catch (e) { return null; }
  }

  // ---- Step 10: Hermes leaves the gates (or, if she answers late, he has already reached the Ridge of the Sun) ----
  window.WIRE_SCRIPT[10] = {
    hermesFinal: function (W) {
      var g = gateSeal(), out;
      if (window.wire10Arrived && window.wire10Arrived()) {
        out = ['I am not at the gates any more, Silvia. ' + W.hours() + ' hours across the Great Erg by starlight, and the Ridge of the Sun is under my boots.'];
        if (W.flag('blessing')) out.push('The red cord stayed on my wrist all night. It did not warm me, but it reminded me who waits.');
        out.push('Keep the page “The Sun Monolith & Cairn II” close: its seven noons are your work. ' + seals(5 - g) + ' to find, and one waits under the Sun.');
        return out;
      }
      var kind = marchKind(), road = W.road(), flavor;
      if (W.flag('blessing')) flavor = 'The red cord is on my wrist, and it is staying there.';
      else if (W.flag('gaveOil') || W.flag('lostOil')) flavor = 'My lamp is almost dry, so half the night is walked blind.';
      else if (road === 'bold') flavor = 'The Servant did not wave me off. I came to his gates hard.';
      else if (road === 'observer') flavor = 'The Servant watched me go. Looking before I spoke earned his respect.';
      else flavor = 'The Servant watched me go. I think my bow won me that much.';
      return [
        'I am setting out now, Silvia, north-north-east across the Great Erg. ' + flavor,
        W.hours() + ' hours by starlight to the Ridge of the Sun' + (kind === 'shortcut' ? ', thanks to the Servant’s dry channel under the red dune.'
          : kind === 'storm' ? ': the wind is turning, and a storm from the south will cost me time.' : '.'),
        'Keep the page “The Sun Monolith & Cairn II” close: its seven noons will be your work. ' + seals(5 - g) + ' to find; one waits under the Sun.'
      ];
    }
  };

  // ---- Steps 11 and 12: the niche of Cairn II and its smear of cobalt blue ----
  window.WIRE_SCRIPT[11] = {
    hermesInitial: [
      'Silvia, the sun is down and the Seal of Cairn II is in my satchel. Now I can finally look at the niche properly.',
      'On the inner rim, right where the Seal was resting, there is a smear of blue.',
      'Cobalt blue, ground so fine it shines like the night sky. Pigment, not dust.',
      { ask: [
        {
          text: 'Touch it. Carefully.',
          silviaMsg: 'Touch it, but gently. Tell me what it feels like.',
          reply: ['Dry and chalky, with a faint smell of crushed stone.', 'Somebody ground this slowly, Silvia. With patience.']
        },
        {
          text: 'Could it be a trap?',
          silviaMsg: 'Careful, Hermes. Could it be a trap?',
          reply: ['I looked for a needle, a wire, a dusting of poison. Nothing.', 'It does not feel like a trap, which is almost worse.']
        },
        {
          text: 'A bored painter lives out here?',
          silviaMsg: 'Maybe a very bored painter lives out here, Hermes.',
          reply: ['In the middle of the Great Erg? He would need a patient audience.', 'Still, I would rather believe in a painter than a ghost.']
        }
      ] },
      'I have seen that blue exactly once, Silvia. Aurelia ground her lapis like this, by the fire, for her star charts.',
      'It cannot be. Fifty-five years, and the sand keeps everything. Tired men see ghosts.',
      { ask: [
        {
          text: 'Maybe it is not a ghost.',
          silviaMsg: 'Maybe it is not a ghost, Hermes. Maybe someone who knew her is still out there.',
          reply: ['Do not say that to a man alone in the dark. Hope is the sharpest thing I carry.', 'Evidence first, then. I will note the hour and the place in my log.']
        },
        {
          text: 'You are tired. Look again later.',
          silviaMsg: 'You are tired, Hermes. Look again in daylight, when the lapis cannot play tricks.',
          reply: ['You sound like Aurelia. She said the same about my sums.', 'I will look again at first light. Even a ghost keeps better hours than I do.']
        },
        {
          text: 'Describe the smear exactly.',
          silviaMsg: 'Describe the smear exactly, Hermes. How big, which way does it run?',
          reply: ['The length of my thumb, thick at one end and thin at the other. Brushed, not rubbed.', 'A brush means a steady hand and a reason. Nobody paints by accident.']
        }
      ] },
      'The raiders came with iron and failed. Whoever left this blue never forced the lock. They knew how to wait for the sun. So what do we do with it?'
    ],
    choices: [
      {
        text: 'Keep a little of the blue. We’ll find out at Tower II.',
        silviaMsg: 'Keep a little of that blue, Hermes. Whatever it is, we’ll find out at the gates of Tower II.',
        hermesReply: function (W) {
          return [
            asked(W, 11, 'i', 0) === 0 ? 'My fingertip is already blue, so I might as well keep some on purpose. A grain, no bigger than a flea, into the brass box beside my compass.'
              : 'A grain, then, no bigger than a flea. I scrape it into the brass box beside my compass.',
            'It weighs nothing at all, and it is the heaviest thing I carry.',
            'From now on I read the rim of every cairn before I touch the stone. If this blue has a cousin, I will find it.'
          ];
        }
      },
      {
        text: 'Could another painter of the Order use the same lapis?',
        silviaMsg: 'Could another painter of the Order have used the same lapis?',
        hermesReply: function (W) {
          return [
            'Perhaps. The founders painted their charts with the same stone for centuries. That is the sensible answer.',
            'But a painter who wants a mark seen puts it on the outside. This was under the lid, where only the one who opens the cairn would look.',
            asked(W, 11, 'i', 1) === 0 ? 'You said it may not be a ghost, and I cannot unhear it. I scraped a grain into the brass box. Sensible men keep their evidence.'
              : 'So it was left for whoever opens the stone properly. I scraped a grain into the brass box. Sensible men keep their evidence.'
          ];
        }
      },
      {
        text: 'The raiders know about the seals. We have to be faster.',
        silviaMsg: 'Forget the ghosts for now, Hermes. The raiders know about the seals. We have to be faster.',
        hermesReply: [
          'You are right, and I hate that you are right. The iron marks are days old, no more.',
          'If they cannot open the cairns, they will follow the man who can. So: no fire, no lamp, and I rub out my tracks before I leave.',
          'The blue comes with me all the same: one grain, in the brass box with my compass.'
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[12] = {
    hermesFinal: function (W) {
      var g = gateSeal(), c = W.choice(11);
      return [
        seals(g + 1) + ' of five, Silvia, with the Seal of Cairn II in my satchel. For your Cipher Ledger: [D] + [F] = 24 and [C] − [T] = 8.',
        c === 0 ? 'The grain of blue rides beside my compass. At the gates of Tower II we will find out whose it is.'
          : c === 1 ? 'I am still trying to be sensible about that blue. The grain in my brass box is not helping.'
          : c === 2 ? 'No fire tonight, as agreed, and I brush out my tracks before I go. The grain of blue stays in the box.'
          : 'The grain of blue is in my brass box now, beside the compass.',
        'Next is Cairn III, in the Sandstone Labyrinth (Station 15). I will sleep under the Monolith and wire you at first light.'
      ];
    }
  };

  // ---- Steps 13 and 14: first light at the Monolith, and the walk down to the labyrinth ----
  window.WIRE_SCRIPT[13] = {
    hermesInitial: function (W) {
      var c = W.choice(11), ghost = asked(W, 11, 'i', 1) === 0, first;
      if (c === 1) first = ' I argued with the blue half the night and lost.';
      else if (ghost) first = ' “Maybe it is not a ghost,” you said, and I slept badly.';
      else if (c === 0) first = ' I checked the grain of blue first, like a man checking his pulse.';
      else if (c === 2) first = ' No fire, no tracks, and the grain of blue still in its box.';
      else first = ' The grain of blue is still in its box.';
      return [
        'First light, Silvia, and the Monolith is turning gold above me.' + first,
        'Under the Arches of the West Wind lies the Sandstone Labyrinth and Cairn III, south-south-east of here.',
        'The founders cut a 348° line into Cairn III, pointing back at this stone. It is on the page “The Five Geodetic Cairns”.',
        { ask: [
          {
            text: 'How sure are you of that line?',
            silviaMsg: 'How sure are you of that line, Hermes?',
            reply: ['As sure as the stone it is cut in. The founders measured it twice.', 'It is my own hand I distrust. Last night I read my own notes upside down.']
          },
          {
            text: 'Did you sleep at all?',
            silviaMsg: 'Did you sleep at all, Hermes? You sounded awful last night.',
            reply: ['An hour. The Monolith is a good wall against the wind, but a poor pillow.']
          },
          {
            text: 'Can you see Cairn III from there?',
            silviaMsg: 'Can you see Cairn III from where you are?',
            reply: ['Only the Arches: a row of grey teeth on the horizon, with the heat already shaking over them.']
          }
        ] },
        'The page “The Sandstone Labyrinth & Cairn III” says ‘North of the Sun Monolith’. That is my doing: I copied the founders’ survey.',
        'The founders drew their charts with the south at the top, like caravan maps. Their north is our south. The ground never lies; only the paper turns.',
        { ask: [
          {
            text: 'Is the old paper wrong elsewhere?',
            silviaMsg: 'Is the old paper wrong anywhere else, Hermes? I should know before I trust it.',
            reply: ['A few places. The survey is old, and the printers were only human.', 'If a line on your page ever looks backwards, trust the ground and ask me.']
          },
          {
            text: 'So the founders drew upside down?',
            silviaMsg: 'So the founders drew everything upside down? Wonderful.',
            reply: ['Upside down and proud of it. A caravan guide would say the same of us.', 'Pity they never wrote it in the margin.']
          },
          {
            text: 'Does the line still hold?',
            silviaMsg: 'Does the line still hold, though? Tell me the truth.',
            reply: ['It holds. Only the printed word is turned, never the cairn.']
          }
        ] },
        'There are fresh wheel ruts in the sand, going the same way. The BC Ashes hid in that labyrinth once before.'
      ];
    },
    choices: [
      {
        text: 'Walk the reverse of the 348° groove.',
        silviaMsg: 'If Cairn III points at the Monolith on 348°, Hermes, walk the reverse: 168°, south-south-east.',
        hermesReply: [
          'One hundred and sixty-eight degrees. You turn the founders’ compass faster than I do.',
          'I keep the Monolith dead behind my back all the way down. A straight line is a comfort in a land that likes to move.',
          'The price is a straight track the ruts can see from far away. I will have to be quiet at the end of it.'
        ]
      },
      {
        text: 'Keep off the ruts. Don’t let them see you.',
        silviaMsg: 'Keep away from those ruts, Hermes. Walk on rock where you can, and don’t let them see you coming.',
        hermesReply: [
          'Agreed. Wheels leave ruts, and men in a hurry follow ruts. I will walk the stone shelves, where the sand forgets me.',
          'If they are inside, I want to see their fires before they see my lamp. Every sentry walks a round, and torches are no different.',
          'I jotted a note about that. If the torches ever give you trouble, look in Ask Hermes.'
        ],
        onPick: function (W) { W.hint('s15-torches', 1); }
      },
      {
        text: 'Copy the Tablet at the Mouth before you go in.',
        silviaMsg: 'Copy the tablet at the Mouth before you go in, Hermes. I’ll trace the true road on the page “The Sandstone Labyrinth & Cairn III”.',
        hermesReply: [
          'It is already in my log, from the founders’ survey: eight stone arches stand upon the one true road, each bearing a single letter.',
          'Find me those eight letters, Silvia, and I will speak them at the cairn. Start from the Southern Mouth: a road reads best from where it begins.',
          'My first note on it is waiting in Ask Hermes, for the hour you need it.'
        ],
        onPick: function (W) { W.hint('s15-sigil', 1); }
      }
    ]
  };

  window.WIRE_SCRIPT[14] = {
    hermesFinal: function (W) {
      var c = W.choice(13), way;
      if (c === 0) way = 'Down the line of 168°, the Monolith dead behind me.';
      else if (c === 1) way = 'Down the line of 168°, but on the stone shelves, away from every rut.';
      else if (c === 2) way = 'Down the line of 168°, and at the Mouth I copy the Tablet first.';
      else way = 'Down the line of 168°, then round the eastern rim, keeping to the rock.';
      return [
        'I am going down now, Silvia: six hours to the Southern Mouth. ' + way,
        'I reach the Mouth at noon, but I go in only after dark. By day the labyrinth is an oven; by night their torches tell me where they are.',
        'Trace the true road on the page “The Sandstone Labyrinth & Cairn III” while I walk: only one road reaches Cairn III, with eight arches on it.'
      ];
    }
  };

  // ---- Steps 15 and 16: out of the labyrinth, with the Seal of Cairn III, the raiders' camp and a star of gold leaf ----
  window.WIRE_SCRIPT[15] = {
    hermesInitial: function (W) {
      var c = W.choice(11), end;
      if (c === 0) end = ' The ground is the same blue as the grain in my brass box.';
      else if (c === 1) end = ' A sensible painter does not gild stars under raiders’ noses.';
      else if (c === 2) end = ' You told me to forget the ghosts. They did not get the message.';
      else end = '';
      return [
        'I am out, Silvia. Through the Western Cleft, with the Seal of Cairn III in my scarf, and they never saw my face.',
        'You walked me past every torch. My hands are still shaking, so forgive me if I rush.',
        { ask: [
          {
            text: 'Are you hurt?',
            silviaMsg: 'Are you hurt, Hermes? Tell me the truth.',
            reply: ['A scraped palm and a bruised pride. The Cleft is narrow, and I am not.']
          },
          {
            text: 'Did you see their faces?',
            silviaMsg: 'Did you see any of their faces?',
            reply: [labyList('order_labyrinth_overheard').length ? 'Only shapes behind the torches. I heard their voices, low and bored, and that frightened me more than shouting would.' : 'Only shapes behind the torches. Nobody spoke, which frightened me more than shouting would.']
          },
          {
            text: 'We make a good team.',
            silviaMsg: 'We make a good team, you and I. Admit it, Hermes.',
            reply: ['I admit it. I will write it in my log: “Silvia walked me past the torches.” Underlined twice.']
          }
        ] },
        'First, their camp: cold ashes, a broken wagon wheel, and a phoenix over three flames, the mark of the BC Ashes, cut into the rock.',
        'They had slept there for days, waiting for someone to open the cairn for them. Now they know someone did.'
      ].concat(labyHeard(1) ? ['And one of them talked, two turns from me: their chief wants the Order to open the cairns, and then to take the seals out of our hands.'] : [])
       .concat(labyFound('survey') ? ['By the Mouth they had dropped an iron bar with a copy of the founders’ survey tied round it, all five cairns ringed in soot. Now I know how they found the seals. I do not know who copied it for them.'] : [])
       .concat([
        'Second, a star on the wall of a fissure: eight points in gold leaf over a ground of blue, the gold still bright.',
        { ask: [
          {
            text: 'What did it look like?',
            silviaMsg: 'Describe the star, Hermes. What did it look like?',
            reply: ['Eight points, like a wind rose, and so bright I thought a torch had caught it.', 'Gold dulls fast out here. Somebody painted it recently, Silvia.']
          },
          {
            text: 'Maybe the raiders painted it.',
            silviaMsg: 'Maybe the raiders painted it, Hermes. To mock us.',
            reply: ['Raiders carry iron and soot, not gold leaf. It costs more than their wagons.', 'No. This was laid by someone who cared about the work.']
          },
          {
            text: 'Leave it. Just get out of there.',
            silviaMsg: 'Leave it, Hermes. Just get out of there.',
            reply: ['I was already leaving. One long look, and no more.', 'Though I stood a moment too long, and it nearly cost me the Cleft.']
          }
        ] },
        'Aurelia gilded her stars exactly like that: blue first, so the gold seems to burn.' + end
      ]).concat(labyFound('chalk') ? ['One more thing, Silvia. In a dead end near the cairn, my own chalk: an arrow, and “H · 98”. I had forgotten I was ever down there.'] : []);
    },
    choices: [
      {
        text: 'Someone is marking the way for you.',
        silviaMsg: 'Hermes, that’s no accident. Blue at Cairn II, gold in the labyrinth. Someone is marking the way for you.',
        hermesReply: [
          'Or marking it for someone else, and I happen to be walking it.',
          'One mark for each cairn, then: blue at the second, gold at the third. I copied the star into my log, eight points like the wind rose of the Order.',
          'At Cairn IV I will read the ground before I read the stone.'
        ]
      },
      {
        text: 'Lose the raiders before Cairn IV.',
        silviaMsg: 'The raiders will follow you now, Hermes. Lose them before Cairn IV, whatever it takes.',
        hermesReply: [
          'They will, the moment they find an empty labyrinth and a missing seal.',
          'Cairn IV lies far south-west, across the open hardpan. No cover out there, but there is night: I cross in the dark, with no fire.',
          'Let them search the labyrinth for a man who is no longer in it.'
        ]
      },
      {
        text: 'Tell me about Aurelia’s stars.',
        silviaMsg: 'Tell me about Aurelia’s stars, Hermes. How did she paint them?',
        hermesReply: [
          'A squirrel-hair brush, and a held breath so the gold leaf would not fly: blue first, then gold, then one stroke of white at each tip.',
          'You ask as if she were still painting somewhere. Nobody has asked me that in years.',
          'I never looked at the tips of the star tonight. At the next one, I look at the tips first.'
        ]
      }
    ]
  };

  window.WIRE_SCRIPT[16] = {
    hermesFinal: function (W) {
      var g = gateSeal(), c = W.choice(15), note;
      if (c === 0) note = asked(W, 15, 'i', 1) === 1 ? 'The star is in my log. You wondered if raiders painted it; I do not think a raider owns that much gold.'
        : 'The star is in my log now, and the grain of blue in its box. Two clues, and still no culprit.';
      else if (c === 1) note = 'I brushed out my own tracks at the Cleft as I left. Let them hunt the labyrinth for a ghost.';
      else if (c === 2) note = 'I keep seeing Aurelia’s hands over the lapis. It is a long march, and I will need all of it to get sensible again.';
      else note = 'The gold star is in my log, point by point.';
      var extra = [];
      if (labyFound('lamp')) extra.push('The founders’ lamp rides in my satchel. Three steps of light instead of two: in the dark, that is a fortune.');
      if (labyFound('chalk')) extra.push('That chalk arrow will not leave me alone. Tonight, I think, I will dream of 1998.');
      return [
        seals(g + 2) + ' of five, Silvia, with the Seal of Cairn III in my satchel. For your Cipher Ledger: [W] + [A] = 26 and [N] − [E] = 9.',
        note
      ].concat(extra).concat([
        'Next is Cairn IV, the Sentry of the Canyon (Station 16), far south-west. I sleep through tomorrow’s heat and wire you at dusk.'
      ]);
    }
  };
})();
