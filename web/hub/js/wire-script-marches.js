// Field Wire: events on the march. While Hermes walks a long stretch between stations, a few small scenes reach Silvia as chat messages.
// window.WIRE_MARCH_EVENTS[leg] = [ { at: fraction of the march, pool: [ { id, beats, choices? } x 3 ] }, ... ]
// The engine picks one variant of each slot at random, once per march. These scenes add atmosphere and small decisions;
// they never advance the plot and never give a puzzle answer. Three of her choices open a note in Ask Hermes (W.hint), no more.
// Legs: 10 the Great Erg by night, 14 down the line of 168°, 18 the hardpan, 22 east to the Arch, 26 toward the smoke, 34 the plateau with Aurelia.
window.WIRE_MARCH_EVENTS = window.WIRE_MARCH_EVENTS || {};

(function () {
  'use strict';
  const K = (list) => list.filter(Boolean);
  const num = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };

  // =========================================================================================
  // LEG 10 · Across the Great Erg by night, from the gates of Tower II to the Sun Monolith (9 to 14 hours)
  // =========================================================================================
  window.WIRE_MARCH_EVENTS[10] = [
    { at: 0.2, pool: [
      { id: 'erg-fennec',
        beats: [
          'Silvia, I have a companion. A fennec fox, ears like two sails, has trotted along my left side for a quarter of an hour.',
          'It keeps ten paces off and stops when I stop. I think it has decided I am either very brave or very lost.',
          'It is not wrong on either count. I would share my supper, but I suspect it is a better hunter than I am.'
        ],
        choices: [
          { text: 'Give it a crumb from your pocket.',
            silviaMsg: 'Give it a crumb, Hermes. Company is worth a crumb.',
            reply: [
              'Done. I crouched, and it took the crumb with the manners of a duke and no thanks at all.',
              'Now it walks five paces off instead of ten. I call that a treaty.',
              'If it leads me into a ravine, you may say you warned me. You will not have warned me, but you may say it.'
            ] },
          { text: 'Leave it be. It is wild.',
            silviaMsg: 'Leave it alone, Hermes. It lives out there, and you are only passing through.',
            reply: [
              'You are right. A hand held out to a wild thing is a small kind of theft.',
              'I walked on without looking at it, which is harder than it sounds with those ears.',
              'For an hour it kept pace anyway, and at the crest of a dune it was gone. It had somewhere to be, and so do I.'
            ] }
        ] },
      { id: 'erg-singing-dune',
        beats: [
          'Silvia, the dune just spoke. I stepped onto the crest and the whole slope boomed under me, low and long, like an organ with a cold.',
          'It is only sand sliding grain over grain. I know that. My knees did not get the explanation in time.',
          'The sound rolled to the bottom of the hollow and came back. The old caravans thought it was a sleeping giant. Tonight I half believe them.',
          'I took the long way round, in the end. Old men and sleeping giants should both be left to their business.'
        ] },
      { id: 'erg-leaving',
        beats: (W) => K([
          'The gates are far behind me now, Silvia, and I still see the Servant on his top step, not waving.',
          W.flag('blessing')
            ? 'The red cord is on my wrist. Twelve knots. When the dark gets too wide I count them, like a man telling beads.'
            : (W.flag('gaveOil') || W.flag('lostOil'))
              ? 'My lamp is dry, so I walk by starlight alone. My feet have begun to read the sand better than my eyes ever did.'
              : 'My lamp stays wrapped in my coat. Out here a flame is not a light, it is a shout.',
          'I am not unhappy. Only small. The Erg has a way of making a man feel exactly his size.',
          String(W.hours() || 'Twelve') + ' hours is a long time to talk to oneself. It helps to know someone is on the other end of this wire.'
        ]) }
    ] },
    { at: 0.5, pool: [
      { id: 'erg-shooting-stars',
        beats: [
          'Look up if you can, Silvia. The sky has begun throwing stars at the Erg, one every minute, all out of the same corner.',
          'Each one draws a line of silver and is gone. I stopped walking to watch, and then I stopped pretending I was not watching.',
          'My old master said a shooting star is a letter that did not reach its address. I have never decided if that is poetry or bad mail.'
        ],
        choices: [
          { text: 'Make a wish, Hermes. Quickly.',
            silviaMsg: 'Make a wish, Hermes. Quickly, before the next one!',
            reply: [
              'I did. Fast and without words, the way it is meant to be done. If I say it aloud it will not count.',
              'I will tell you only this: it was not for me.',
              'Another one just fell. I used that one for the Servant. A man should spread his wishes about.'
            ] },
          { text: 'Note which corner they come from.',
            silviaMsg: 'Mark the corner they come from, Hermes. It is a free bearing for the night.',
            reply: [
              'Practical as ever. They all seem to fly out of the north-east, right over the road I need.',
              'I scratched the line on the lid of my compass with a pin, so I can check my feet against it.',
              'If the sky is going to hand me a bearing for nothing, the least I can do is write it down.'
            ] }
        ] },
      { id: 'erg-cold-wind',
        beats: [
          'The cold has arrived, Silvia. The sand gave up the day’s heat in an hour, and now it breathes out frost.',
          'A wind has risen from the north, thin as a knife and full of grit. It drags little snakes of sand across my boots.',
          'Ahead there is a hollow in the dunes, sheltered, with a flat stone for a seat. It is calling to me in a very persuasive voice.',
          'I gave in for ten minutes in the hollow and rose warm. The cold may keep the Erg, but it cannot have me.'
        ] },
      { id: 'erg-glass',
        beats: [
          'My boot struck something that was not sand, Silvia. I dug it out with my hands: a twisting tube of glass as long as my forearm.',
          'It is rough outside and smooth within, the colour of old bottles. I believe lightning made it: the bolt struck the sand, and the sand melted and set.',
          'So I am holding the shape of a thunderbolt, in a desert that has not seen rain for a year. I find that rather beautiful.',
          'I wrapped it in my spare scarf and it rides in the satchel. A thunderbolt for you, Silvia, to look at when the seals are home.'
        ] }
    ] },
    { at: 0.8, pool: [
      { id: 'erg-morning-star',
        beats: [
          'Trouble, Silvia. A reddish light has appeared very low in the east, just above the dunes, and it is not moving.',
          'A campfire, I think. Raiders’ scouts, or some old fool of a surveyor. I went flat on my belly in the sand, which at my age is a decision.',
          'I have been lying here for a while, and I am starting to suspect something about this fire.'
        ],
        choices: [
          { text: 'Check it with the spyglass.',
            silviaMsg: 'Use the spyglass, Hermes. Look before you crawl.',
            reply: [
              'Spyglass up, and it is a star. The morning star, big and orange, sitting on the horizon as if it had lost its way.',
              'I have just spent a quarter of an hour stalking a star, Silvia. It did not even try to run.',
              'If you ever hear that old Hermes was hunted down by the morning star, tell the story kindly.'
            ] },
          { text: 'Stay low and circle round it.',
            silviaMsg: 'Do not stand up yet, Hermes. Circle round it and keep the dunes between you.',
            reply: [
              'I crawled a wide arc through the troughs of the dunes, so my coat is now more sand than coat.',
              'At the far side I raised my head, and the fire had climbed a little higher in the sky. It was the morning star after all.',
              'No harm done, except to my dignity. Next time I will look first and crawl afterwards.'
            ] }
        ] },
      { id: 'erg-first-shadows',
        beats: [
          'The east is turning grey, Silvia. For the first time tonight I can see my own hands, and the dunes have come out of the dark like fish out of a pond.',
          'Every crest has grown a long shadow, thin and blue, leaning across the hollows. They are so long that I keep tripping over them.',
          'I have a feeling the Monolith will play the same game with its shadow, only much better.'
        ],
        choices: [
          { text: 'Watch how those shadows change.',
            silviaMsg: 'Watch those shadows, Hermes. Mark how they change as the sun climbs.',
            reply: [
              'Good. A shadow is a clock that never needs winding. I will sit on this crest and watch them as the sun lifts.',
              'They shorten as it climbs, and they swing round, slowly. Quite a performance for nothing.',
              'I have written a short note on it in Ask Hermes. It may help you with the sun at the Monolith.'
            ],
            onPick: (W) => { W.hint('s14-shadow', 1); } },
          { text: 'Keep walking. Reach the ridge while it is cool.',
            silviaMsg: 'Do not stop for shadows, Hermes. Get to the ridge while the morning is cool.',
            reply: [
              'Quite right. The morning is the only kind hour on the Erg, and I will not spend it on poetry.',
              'I shall leave the shadows to their own affairs and make for the ridge on a straight line.',
              'If any shadow is clever enough to wish to be admired, it can wait for me at the Monolith.'
            ] }
        ] },
      { id: 'erg-first-sight',
        beats: (W) => K([
          'Silvia, the horizon has grown a thorn. A thin dark finger stands on the far edge of the dunes, straight as a ruler.',
          'The Monolith. I knew it would be there, and I still stopped and took off my hat, as if it were a person.',
          'The first sun has touched the very top of it, in gold, while everything else is still blue night.',
          'After ' + String(W.hours() || 'Twelve').toLowerCase() + ' hours on foot I would forgive it for being smaller. It is not. A couple of hours more, I think.'
        ]) }
    ] }
  ];

  // =========================================================================================
  // LEG 14 · Down the line of 168° from the Monolith to the Southern Mouth of the Sandstone Labyrinth (6 hours)
  // =========================================================================================
  window.WIRE_MARCH_EVENTS[14] = [
    { at: 0.35, pool: [
      { id: 'shelf-lizard',
        beats: (W) => K([
          'Silvia, I have been challenged to a duel by a lizard. It sits on a hot stone shelf and bobs up and down, glaring at my boots.',
          W.event('erg-fennec') === 0
            ? 'I fed a fox on the Erg and now I am bargaining with lizards. A very small-animal week.'
            : 'It is the size of my hand, the colour of the rock, with a spiked tail like a tiny mace.',
          'I do not think it knows how large I am. I am the intruder on its shelf, and it is making very sure I know it.',
          'I bowed and went round, and it stopped bobbing as I passed. It has won, and it knows it. No road is worth a quarrel with the owner of the stone.'
        ]) },
      { id: 'shelf-ruts',
        beats: [
          'Silvia, I have crossed the raiders’ ruts. Two deep grooves cut straight across my line, in a patch of pale sand between two shelves.',
          'They are a day old, no more. Heavy wagons, and one pair deeper than the rest. In the middle of the track, somebody dropped a black glove.',
          'I did not step into the ruts. My boots would have said I was here, and sand has a long memory when it is told things.'
        ],
        choices: [
          { text: 'Pick up the glove. It may tell us something.',
            silviaMsg: 'Take the glove, Hermes. It might tell us something about them.',
            reply: [
              'Stiff leather, black with soot, and on the cuff a charred circle stitched on. The Ashes’ mark, Silvia.',
              'Nothing in the fingers but a burnt match and a thread. A poor prize, but a fine proof: they were here, in a hurry, and gone.',
              'It goes into the satchel. I will show it to the Servant, who will tell me I should have left it.'
            ] },
          { text: 'Leave it. Leave no trace.',
            silviaMsg: 'Do not touch anything, Hermes. Do not leave a trace for them to find.',
            reply: [
              'Then I left it lying in the ruts exactly as it was, and stepped over the whole lot from stone to stone.',
              'A glove nobody touched tells no tale. If they come back for it, they will think it was only ever the wind.',
              'I marked the spot in my log, so you may scold me if it turns out to matter.'
            ] }
        ] },
      { id: 'shelf-watchman',
        beats: [
          'This heat reminds me of my first posting, Silvia: night watch on the walls of the observatory at nineteen, with a lamp and many opinions.',
          'A watchman learns one thing above all. You walk a round, and the round has a rhythm: forty steps, a turn, a pause to look, forty steps back.',
          'The raiders’ sentries will be no different. Everyone who keeps watch becomes a clock, and a clock can be read.'
        ],
        choices: [
          { text: 'Teach me how to read a sentry’s round.',
            silviaMsg: 'Teach me how, Hermes. If the torches keep a round, I want to learn to read it.',
            reply: [
              'Gladly. Count the steps between each pause. The pauses are the weakness: a man who looks twice looks too long at one place.',
              'I have set down a note about it. You will find it in Ask Hermes, waiting for the hour the torches matter.',
              'Read a round once and you can walk through it. That is how I escaped three punishments at nineteen.'
            ],
            onPick: (W) => { W.hint('s15-torches', 1); } },
          { text: 'Did you ever get caught?',
            silviaMsg: 'Did you ever get caught sneaking past the watch, Hermes?',
            reply: [
              'Once. By the head librarian, who was fast asleep and woke only to inform me that I walked like a mule.',
              'Which is why I walk on stone shelves now. I keep the grace of the mule, only lighter.',
              'Ah, the follies of nineteen. I would give almost all five seals for an hour of them.'
            ] }
        ] }
    ] },
    { at: 0.7, pool: [
      { id: 'shelf-heat',
        beats: [
          'The heat has started to bend the world, Silvia. The plateau of the Arches of the West Wind is floating a hand’s width above the ground.',
          'Below it a silver pool glitters where nothing but stone lies. I know it is only air playing tricks. My throat does not.',
          'Every step I take, the pool takes one back. It is the best-mannered liar I have ever met.'
        ],
        choices: [
          { text: 'Rest in the shade until it passes.',
            silviaMsg: 'Find some shade, Hermes. Rest until the worst of the heat has passed.',
            reply: [
              'A rock overhang, a mouthful of water, ten minutes with my hat over my eyes. The pool shrank back into stone as the sun moved.',
              'Nothing is as honest as a rock with a roof.',
              'I drank less than I wanted and I walk better than I feared.'
            ] },
          { text: 'Trust the compass, not your eyes.',
            silviaMsg: 'Trust the compass, Hermes, not your eyes. The needle does not get thirsty.',
            reply: [
              'Compass in hand, nose to the line of 168°. The needle does not believe in pools.',
              'I walked straight through the silver, and it parted like a curtain of nothing. The stone beyond it was only stone.',
              'It is the same with most fears, I find. Walk at them with a compass.'
            ] }
        ] },
      { id: 'shelf-arches-hum',
        beats: [
          'I can hear the Arches, Silvia. A long low note drifts across the plateau, like someone blowing over the neck of a huge bottle.',
          'The wind goes through the stone gates up there and sings. From here the plateau does not look like much. It sounds like a cathedral with the roof off.',
          'The note rises and falls with the wind, and I keep catching myself humming along. Off-key, naturally.'
        ] },
      { id: 'shelf-scorpion',
        beats: [
          'If the Order ever awards a medal for composure, Silvia, I ask for it. I just shook out my boot in the shade of a rock, and a pale scorpion fell out.',
          'It had been in there since the Monolith, I think. It landed, looked at me, and walked off with great dignity, like a bishop who has been insulted.',
          'I have decided to check my boots for the rest of my life. And my hat. And possibly my coat.',
          'I emptied the satchel and shook every pocket, just in case. Not a guest. I now trust nothing that has a lid.'
        ] }
    ] }
  ];

  // =========================================================================================
  // LEG 18 · Across the hardpan by night and into the rocks by day, toward Cairn IV (18 hours)
  // =========================================================================================
  window.WIRE_MARCH_EVENTS[18] = [
    { at: 0.2, pool: [
      { id: 'hp-owl',
        beats: [
          'Silvia, I have an owl. A pale one, silent as a thought. It floats over the clay a few paces ahead and settles whenever I catch up.',
          'I think it hunts whatever my boots frighten out of the cracks. I am being used as a beater, and I have not been paid.',
          'It is hard to feel lonely in the dark beside something that looks at you like a very stern aunt.',
          'It kept me company as far as a dry thornbush, and there it turned into the dark. I raised my hat to it. One does.'
        ] },
      { id: 'hp-ticking',
        beats: [
          'The hardpan is talking, Silvia. As the night cools, the clay plates of the floor crack and tick, thousands of little knocks all around me.',
          'It sounds like a roomful of clocks, or a giant cracking his knuckles. Twice I stopped, sure that someone was walking beside me.',
          'And once, I swear, I heard five soft notes rising on the wind. The shepherd’s woman, or my tired ears. I could not say.'
        ],
        choices: [
          { text: 'Walk a little toward the notes.',
            silviaMsg: 'Go toward the notes, Hermes. Just a little, to be sure.',
            reply: [
              'I turned south-west for a hundred paces, and a hundred more. The notes were only wind through a split in a boulder.',
              'I came back to my line with sore feet and a small, stubborn disappointment, which I did not expect.',
              'I will not tell the shepherd. He would only be kind about it.'
            ] },
          { text: 'Ignore it. Stay on your line.',
            silviaMsg: 'Do not chase sounds, Hermes. Keep to the line and let the night talk.',
            reply: [
              'Firm of me, I thought, and then I thought of it for another hour. A voice you do not follow is the loudest of all.',
              'The clay kept ticking and my feet kept to the line. It is a good line. It leads exactly where I must go.',
              'If she sings, she will sing again. And if not, the wind is a fine poet.'
            ] }
        ] },
      { id: 'hp-ruts',
        beats: [
          'I have found the raiders’ ruts on the clay, Silvia. Three wagons side by side, going south-west, crisp as a ploughed field.',
          'They came this way at first light, as the shepherd said. One pair of wheels is much deeper than the others. That is the wagon under the oilcloth.',
          'On this crust the ruts make a smooth road, and a tired man’s feet are very eager for a smooth road.'
        ],
        choices: [
          { text: 'Walk in the ruts. It is faster.',
            silviaMsg: 'Use the ruts, Hermes. The ground is firm there, and you will save time.',
            reply: [
              'For an hour I walked in their tracks, and I must say it is lovely going. Flat, firm, no cracks to trip on.',
              'I felt like a man sneaking into a house by the front path. At the first stony patch I left the ruts and rubbed out my own prints with my coat.',
              'We saved an hour, and my conscience is almost clean.'
            ] },
          { text: 'Keep clear of the ruts.',
            silviaMsg: 'Stay off the ruts, Hermes. Every step in them is a step toward their camp.',
            reply: [
              'I walked parallel, forty paces off, on the broken crust. It is slow, like walking on biscuits.',
              'But nobody following those ruts will find my boots among them. A tired man makes a good hider: he has no spare energy for noise.',
              'It cost me an hour. I would have liked that hour. I would rather have my skin.'
            ] }
        ] }
    ] },
    { at: 0.5, pool: [
      { id: 'hp-storm',
        beats: [
          'Far to the south a storm is playing over the horizon. Lightning crawls inside the clouds and lights the hardpan like a floor of broken plates.',
          'It never comes to the ground. It only wants to be seen, and I am its entire audience.',
          'For a moment I can see the whole hardpan, and the mesa far ahead, black as a ship. Then the night closes again, and I see only violet blots.'
        ],
        choices: [
          { text: 'Count the seconds until the thunder.',
            silviaMsg: 'Count the seconds between the flash and the thunder, Hermes. It tells you how far the storm is.',
            reply: [
              'Flash. One, two, three... eleven, and then a low grumble, like a drum in another house. A long way off, then, and no danger to us.',
              'Sound takes its time to travel, Silvia, and a patient man can measure distance with it.',
              'I have written a note on counting echoes in Ask Hermes. It will serve you when the pillars of Cairn IV begin to call.'
            ],
            onPick: (W) => { W.hint('s16-song', 1); } },
          { text: 'Use the flashes to check your line.',
            silviaMsg: 'Use the flashes, Hermes. Check your line against the mesa each time.',
            reply: [
              'That is what I was doing, though I did not dare say it. Each flash, I fix the mesa on my line and walk toward the memory of it.',
              'Four flashes, four corrections. I had drifted a little to the left. Thanks to the storm, I am exactly where I should be.',
              'I never thought I would be grateful to lightning. The world is full of small surprises.'
            ] }
        ] },
      { id: 'hp-peg',
        beats: [
          'I have found a peg, Silvia. Bronze, as tall as my hand, driven into the clay so long ago that the clay has grown around it.',
          'On its head is the Order’s wind rose, eight points, green with age. Someone measured this hardpan before there were roads.',
          'I know that mark in my bones. The founders walked here with chains and poles, and left their pegs for the next fool to read.'
        ],
        choices: [
          { text: 'Look for the next peg.',
            silviaMsg: 'Look for the next peg, Hermes. A founder’s line would lead somewhere.',
            reply: [
              'I walked a hundred paces along the line of the peg, and there was the second, as if the founders had left me a trail of bread.',
              'A row of them runs toward the mesa. I followed it as one follows a banister in the dark.',
              'It is a strange comfort to follow men who have been dust for centuries. They were better surveyors than I am. Do not repeat that.'
            ] },
          { text: 'Leave it. It is not ours.',
            silviaMsg: 'Leave it, Hermes. It is the founders’ peg, not ours, and it is doing its job.',
            reply: [
              'You are right. Nobody ever drove a peg so that a stranger could pocket it.',
              'I laid a little stone beside it for the next traveller, to say that someone looked and was grateful.',
              'My satchel is for seals, not souvenirs. I only wish my heart were so tidy.'
            ] }
        ] },
      { id: 'hp-lonely',
        beats: [
          'Silvia, I will confess something. This is the loneliest hour of the night, and I would not mind a little talk.',
          'Not the cairns and not the raiders: ordinary talk. The wire is thin, but you are at the other end of it, and that is a great thing.',
          'Tell me anything. What are you doing right now? Or ask me anything you like, and I will answer as long as my breath holds.'
        ],
        choices: [
          { text: 'Tell me about the first star you saw.',
            silviaMsg: 'Tell me about the first star you ever really looked at, Hermes.',
            reply: [
              'The first one I truly saw was from my grandfather’s roof, in a town with one lamp. I was six, and I was convinced it had followed me home.',
              'I asked him its name. He said it had none, because nobody had needed it yet. I decided I would give it one.',
              'I never did. But I can still point to it without a map. Thank you for asking.'
            ] },
          { text: 'I am right here, at my desk.',
            silviaMsg: 'I am at my desk with the journal open and a cup of tea going cold, Hermes. I am not going anywhere.',
            reply: [
              'A cup of tea going cold. That is the most civilised thing I have heard all night.',
              'Keep it near, Silvia. I will pretend that I can smell it, and walk faster toward it.',
              'Now I am not a lone man in the dark. I am a man with a friend at the end of a copper wire. That is a different animal altogether.'
            ] }
        ] }
    ] },
    { at: 0.8, pool: [
      { id: 'hp-hoopoe',
        beats: [
          'I have found shade at last, Silvia: a leaning slab of rock with a crack at the back. The ground there is cool, almost kind.',
          'I was settling in when a bird landed on the slab above my head. A hoopoe, with a crest like a feather duster and a long curved beak.',
          'It looks at me, then at my hat, then at me again. It has opinions, and it is about to share them.',
          'I let it stay. Once it shrieked and I woke with my staff in hand, but it was only the shadow of a vulture, passing high.'
        ] },
      { id: 'hp-cracking-rocks',
        beats: [
          'I woke with a start, Silvia. A crack like a pistol shot rang off the rocks, and my hand went straight for my staff.',
          'It was only the stone. The rocks cooled all night and now the sun hits them, and they split with a bang every few minutes.',
          'It has happened four times since. I have now been shot at by geology, and I find it a humbling thing.',
          'I crept up and looked across a mile of empty clay. Nothing. I feel like a hen who swore there was a fox.'
        ] },
      { id: 'hp-veiled-woman',
        beats: [
          'Sleep will not come. The shepherd’s veiled woman keeps walking through my head with her milk and her dates.',
          'I know what an old man’s mind does at this hour: it makes ghosts out of stories, and then complains about the ghosts.',
          'But think, Silvia. Who sings to the stars year after year, with nobody to hear? Do you believe she is real?'
        ],
        choices: [
          { text: 'I think she is real.',
            silviaMsg: 'I think she is real, Hermes. People do not invent a custom for no one.',
            reply: [
              'Then I will believe it too, for the sake of company. A believer sleeps better than a doubter.',
              'If she is real, she has walked this desert longer than I have, and she knows its roads better than I do.',
              'I hope to hear her. I do not know whether I hope for the right thing, but I hope.'
            ] },
          { text: 'Maybe it is only a herders’ tale.',
            silviaMsg: 'Maybe it is only a herders’ tale, Hermes. Every desert has one. Do not let it spook you.',
            reply: [
              'Very likely. A herder alone with his goats needs stories as a goat needs salt.',
              'Then I will treat it as a tale, and my nerves can sleep the way stories do: on the other side of the fire.',
              'Still, I will not step on a flat stone out here without looking at it first. Old habit.'
            ] }
        ] }
    ] }
  ];

  // =========================================================================================
  // LEG 22 · From Cairn IV back east: the Natural Bridge, the Lower Wash and the dunes of Cairn V to the Arch (18 hours, no sleep)
  // =========================================================================================
  window.WIRE_MARCH_EVENTS[22] = [
    { at: 0.2, pool: [
      { id: 'ret-glint',
        beats: (W) => K([
          'Silvia, something glinted behind me, up on a ridge. Just once, a little white wink, and gone.',
          ({
            cross: 'The four on foot heard my stone fall at the bridge, and they are close behind me. I can feel it on the back of my neck.',
            hide: 'The four on foot went ahead of me, so a glint behind me should be nobody at all. I am not comforted.',
            trail: 'The four on foot are still chasing a strip of blue cloth, so it is probably the moon on a flake of mica. Probably.'
          })[W.bridge()] || 'I do not know where their men on foot are tonight. Only that they are not nowhere.',
          'A spyglass lens catches the moon in a way no stone does. I lay behind a boulder for a count of three hundred. Nothing moved.'
        ]),
        choices: [
          { text: 'Wait and watch a little longer.',
            silviaMsg: 'Wait a little longer, Hermes. Watch the ridge. If it is a man, he will move.',
            reply: [
              'I counted three hundred more. At the end of it a plain brown fox trotted along the ridge and sat down in the very spot of the glint.',
              'A fox with a bit of bottle in its mouth, of course. The desert has a way of mocking one’s fears.',
              'It cost ten minutes and a good deal of nerve. Worth it, to know it was only a fox.'
            ] },
          { text: 'Do not wait. Move on quickly.',
            silviaMsg: 'Do not wait, Hermes. Move on, quickly and quietly.',
            reply: [
              'Then I move, and I do not look back. A man who stops to check every glint never arrives anywhere.',
              'I took the long way through a field of boulders, hopping from stone to stone, so my boots left nothing behind.',
              'If it was a man, he will find only rock. If it was a flake of mica, I have lost nothing.'
            ] }
        ] },
      { id: 'ret-echo-steps',
        beats: [
          'I have caught myself counting, Silvia. My footsteps came back to me off the canyon walls, half a beat late, and my head began to count the echoes.',
          'The pillars have got into my bones. I hum the beats under my breath now, like a child who has learnt a rhyme and cannot lose it.',
          'It is a good habit for a surveyor. I only wish it came with a way to stop.'
        ] },
      { id: 'ret-bats',
        beats: [
          'Silvia, a crack in the cliff just poured out bats. A river of small black wings, so thick that I felt the wind of them on my face.',
          'They swept round my head in the dark, a thousand of them, and not one touched me. I have never been so thoroughly avoided.',
          'They are off to hunt over the wash. I stood there with my mouth open, a man in the middle of a whirlpool of wings.',
          'I stood like a post and felt each wing pass without a touch. A bat reads you with sound and goes round. I wish people did.'
        ] }
    ] },
    { at: 0.5, pool: [
      { id: 'ret-wrong-turn',
        beats: [
          'I have taken a wrong turn, Silvia. The Lower Wash is a maze of boulders as big as houses, and in this grey light every gap looks like the right one.',
          'I am standing in a dead-end pocket, rock on three sides and a faint smell of damp stone.',
          'Behind me, the way I came. Above me, a chimney in the rock that I could climb, if I were thirty years younger.'
        ],
        choices: [
          { text: 'Climb the chimney and look.',
            silviaMsg: 'Climb the chimney, Hermes. Get high and look for the way out.',
            reply: [
              'Up I went on hands and knees, with one regrettable noise from a knee. From the top I saw the true gap, forty paces east, past a rock like a sleeping cow.',
              'I came down faster than I went up. I will not discuss how.',
              'The lesson of the morning: when lost, get high. And let your knees file their complaints in writing.'
            ] },
          { text: 'Go back and try the next gap.',
            silviaMsg: 'Go back out and try the next gap, Hermes. Do not waste your strength on a climb.',
            reply: [
              'Back out, ten patient paces, and the next gap, and the one after. The third was the right one: old water marks on the stone told me.',
              'It cost a quarter of an hour but not a single scrape. Sometimes the slow road is simply the road.',
              'I am saving my knees for the dunes. They will need everything they have.'
            ] }
        ] },
      { id: 'ret-mist',
        beats: [
          'You will not believe this, Silvia. The wash is full of mist this morning, a thin white lake lying between the boulders and reaching my knees.',
          'It rises out of the cold stone at dawn once in a blue moon. I have walked the desert for fifty years and seen it three times.',
          'Every boulder is an island. My boots have vanished and I am wading like a heron, with a dripping coat and a ridiculous smile.',
          'I spread my coat on a boulder and wrung out a cup and a half of mist. It tasted of wool and wonder, and it was free.'
        ] },
      { id: 'ret-pebble',
        beats: [
          'I took out the pebble in the first light, Silvia, to look at it properly. The star is smaller than a lentil, and perfectly drawn.',
          'Eight points, each tipped with one stroke of white, so fine that the brush must have held a single hair.',
          'Somebody sat with this pebble and held their breath. I do not know why that moves me so much.'
        ],
        choices: [
          { text: 'Maybe it is a thank-you.',
            silviaMsg: 'Maybe it is not a warning, Hermes. Maybe it is a thank-you.',
            reply: [
              'A thank-you, from a painter I have never met, for a service I do not remember doing.',
              'I turned it over and over. It is the kindest thought I have had since the gates.',
              'I will keep it close. A man needs one object on the road that is not afraid of him.'
            ] },
          { text: 'Do not read too much into it yet.',
            silviaMsg: 'Do not read too much into it yet, Hermes. We only have a few clues, and we are guessing.',
            reply: [
              'Wise. A detective sees what he hopes to see, and so does an old surveyor.',
              'Back into the brass box with it, beside the grain of blue, lid shut and mind tidy.',
              'The pebble will say what it has to say when it is ready. They all do, in the end.'
            ] }
        ] }
    ] },
    { at: 0.8, pool: [
      { id: 'ret-dust-devil',
        beats: [
          'A dust devil has just crossed the dune in front of me, Silvia: a lazy brown spiral twice my height, spinning along the crest as if it owned it.',
          'It plucked my hat clean off my head and carried it away. My hat, which has survived fifty years, three deserts and one very rude goat.',
          'It is rolling down the far side of the dune rather happily, and I am standing in the noon sun with a bare head and a tired mind.'
        ],
        choices: [
          { text: 'Run after the hat!',
            silviaMsg: 'Run after it, Hermes! You need that hat in this sun.',
            reply: [
              'I ran. Ran, Silvia! Downhill in loose sand with a staff, at my age. I got the hat. I do not wish to speak of the rest.',
              'It sits on my head again, crushed and sandy, and I have never loved a piece of felt so much.',
              'My breath is filing a formal protest, but I look like myself again. A fair trade.'
            ] },
          { text: 'Let it go. Wrap your scarf.',
            silviaMsg: 'Let it go, Hermes. Wrap the scarf round your head. It is only a hat.',
            reply: [
              'It hurt more than I expected. It was a good hat, Silvia. It knew my head.',
              'But the scarf is wound on like a turban, and I look like a very tired and very learned pilgrim.',
              'The dunes may keep it. I hope some nomad finds it and wears it with dignity.'
            ] }
        ] },
      { id: 'ret-falcon',
        beats: [
          'A falcon has been circling over me for an hour, Silvia. Same height, same slow circle, wings flat as paper, always a little to the east.',
          'Do not tell me what a falcon means in the old books. I refuse to take omens from birds. I take them from compasses.',
          'But I admit it makes a very good arrow. It drifts ahead of me, the way I am walking, as if it knew the road.',
          'I tipped my head to it. It tilted a wing. I choose to believe the two events were related. One superstition per desert is allowed.'
        ] },
      { id: 'ret-sand-boots',
        beats: [
          'I have not slept in a day, Silvia, and the dunes are beginning to turn into other things. One just looked like a bed with a very large quilt.',
          'My boots are full of sand. I could build a small Monolith from what I pour out of them every hour.',
          'The staff is the only thing keeping me on two legs. I talk to it now. It is a good listener, and has never once corrected my arithmetic.',
          'I sat five minutes in the lee of a dune and shut my eyes. The desert went on without me. Then I emptied my boots and rose.'
        ] }
    ] }
  ];

  // =========================================================================================
  // LEG 26 · From the Arch of the Solstice toward Tower II, under the smoke (6 hours)
  // =========================================================================================
  window.WIRE_MARCH_EVENTS[26] = [
    { at: 0.35, pool: [
      { id: 'dry-smoke-colour',
        beats: [
          'Silvia, the smoke over Tower II has changed colour. At noon it was black as a column of ink. Now it is a dirty grey, and it leans east.',
          'Grey is good. Black means something is still burning, and grey means it has burned itself out. That is what I tell myself.',
          'It is thin enough now that I can see sky through it. The Sanctuary lies somewhere beneath, with a very stubborn old man.'
        ],
        choices: [
          { text: 'Do not read the smoke. Keep your pace.',
            silviaMsg: 'Do not read it, Hermes. Smoke cannot tell you anything you can fix from here. Just walk.',
            reply: [
              'You are right. A man who stares at a smoke trail walks like a man staring at a smoke trail: slowly, and into things.',
              'I put my eyes on the ground and my mind on my feet. One dune, then the next.',
              'We will know when we know. The smoke is not going anywhere. Neither, unfortunately, is my fear.'
            ] },
          { text: 'Describe it to me like a surveyor.',
            silviaMsg: 'Tell me what you see, Hermes. Colour, wind, how high. Describe it like a surveyor.',
            reply: [
              'As you wish. Pale grey and thin, rising straight for a while, then bending east at about the height of a tall tower.',
              'That means the wind high up is steady and the fire below is small. A big fire makes its own wind and fights it. This one has lost the fight.',
              'It does not tell me whether the Servant lives. But it tells me the Sanctuary is no longer burning, and that is already something.'
            ] }
        ] },
      { id: 'dry-vultures',
        beats: [
          'Two vultures, Silvia. They are wheeling to the north-east above the dry bed, very high and quite leisurely.',
          'I have been trying not to think about what they are interested in. I have failed completely, and my heart has gone down into my boots.',
          'A vulture has no opinions, only appetite. It would circle a dead goat and a dying king with the same patience.',
          'I went to look, staff in both hands. A dead goat, Silvia, very old, with a rope round its horns. Not the Servant. Only a goat.'
        ] },
      { id: 'dry-rehearsal',
        beats: (W) => K([
          'I have been rehearsing, Silvia. Out loud, to the dunes, which are an excellent audience. They never interrupt.',
          ({
            bold: 'I came through his gates like a gale. I have written three apologies for it in my head, and each one is worse than the last.',
            observer: 'At his gates I looked before I spoke, and he noticed. Now I must learn how to look at him if he is hurt.',
            humble: 'I bowed to him at his gates, and he opened them with his own hands. Now I must find words of thanks, and I only own words for maps.'
          })[W.road()] || 'I stood at his gates and he opened them with his own hands. Now I must find words of thanks, and I only own words for maps.',
          'If he is alive, I will say the simplest thing. I have noticed that the simplest thing is usually the hardest to say.'
        ]),
        choices: [
          { text: 'Just say, “I’m glad you’re alive.”',
            silviaMsg: 'Just say it, Hermes: “I’m glad you’re alive.” That is all he needs.',
            reply: [
              'Four words. I was trying to say thirty. I will try the four.',
              'He will probably tell me that I am late and the well needs cleaning. That is how the Servant says welcome.',
              'If I get through those words without a tremble, I will have done better than the last time.'
            ] },
          { text: 'Bring him a small gift.',
            silviaMsg: 'Bring him something small, Hermes. Words are cheap, but a gift is a hand held out.',
            reply: [
              'What have I got? A compass, a log and a hard biscuit. Not a gift in the lot. So I will find one on the way.',
              'Already found: a smooth red stone from the dry bed, with a hole worn clean through it, like a ring for a very small finger.',
              'He will say it is only a stone. Then he will put it in his pocket and never mention it again. That is how I will know.'
            ] }
        ] }
    ] },
    { at: 0.7, pool: [
      { id: 'dry-smell',
        beats: (W) => K([
          'The wind has turned, Silvia, and it carries the smell of the Sanctuary to me: cedar smoke, burnt oil and hot stone.',
          'Something big has burned, and not long ago. I tied my scarf over my nose. The dust is the colour of ash, and so is my mood.',
          W.choice(25) === 0 ? 'I keep to the dry bed and off the ridges, as you advised. A man on a skyline is a man in a spyglass.'
            : W.choice(25) === 2 ? 'No creeping about, as you said. Straight on, by the shortest way, and the smell grows with every step.'
            : 'I am walking as quietly as an old man can, which is not very, but I try.'
        ]) },
      { id: 'dry-silence',
        beats: [
          'It is too quiet here, Silvia. There was a cricket in the dry bed an hour ago, and a bird or two. Now there is nothing.',
          'I have known that kind of quiet before, and it never means rest. It means the world is listening.',
          'Even my boots sound too loud. I have taken to walking on my toes, like a thief or a cat.'
        ],
        choices: [
          { text: 'Stop and listen for a minute.',
            silviaMsg: 'Stop for a minute, Hermes. Hold your breath and listen.',
            reply: [
              'I stood still for a full minute with my breath held. I heard the wind, my own pulse, and, much farther off, a single dry clink, like a harness chain.',
              'Then nothing. But once is enough. Someone is still down there, and they are not asleep.',
              'Now I know how to walk the rest: slowly, and with my ears first.'
            ] },
          { text: 'Keep going, but quietly.',
            silviaMsg: 'Keep going, Hermes, but quietly. Lift the staff off the stones.',
            reply: [
              'Toes it is, and the staff held up off the ground so it cannot knock the stones.',
              'A quiet man in a quiet land is almost respectable. Nobody can hear me, and I can hear everything.',
              'At the next bend I will stop and look before I go round it. A bend is a good place to meet one’s mistakes.'
            ] }
        ] },
      { id: 'dry-arrow',
        beats: (W) => K([
          'On a flat rock beside the dry bed I found an arrow drawn in charcoal. It points straight at the Sanctuary, with the Ashes’ circle beside it.',
          'A signpost for stragglers. Someone wants whoever comes after to find the way without asking.',
          W.event('hp-ruts') === 0
            ? 'On the hardpan I followed their ruts because the going was easy. An arrow is the same temptation, so I stopped and thought.'
            : 'It is a very neat arrow. The Ashes draw better than they behave.'
        ]),
        choices: [
          { text: 'Rub the arrow out.',
            silviaMsg: 'Rub it out, Hermes. If it is gone, they will have to find their own way.',
            reply: [
              'Spat on my thumb and rubbed until the charcoal was a grey smear. A child could not read it now.',
              'A straggler will come to this rock, find nothing, and have to think. A man who has to think is a man who slows down.',
              'My thumb is black to the knuckle. I am proud of it.'
            ] },
          { text: 'Turn the stone round.',
            silviaMsg: 'Turn the stone round, Hermes. Let the arrow point somewhere else.',
            reply: [
              'It took both hands and a grunt. The stone is turned, and the arrow now points at nothing but a very large dune.',
              'Somewhere tonight a straggler will march confidently into the dunes. I feel a little sorry for him, and rather pleased with myself.',
              'I wiped my hands on my coat and went on, whistling inwardly. One does not whistle aloud in a quiet place like this.'
            ] }
        ] }
    ] }
  ];

  // =========================================================================================
  // LEG 34 · The plateau, from Tower II to the gate of Tower III, with Aurelia beside Hermes (18 hours)
  // =========================================================================================
  window.WIRE_MARCH_EVENTS[34] = [
    { at: 0.2, pool: [
      { id: 'plat-sketch',
        beats: [
          'Silvia, we have stopped four times already, and each time it was for a drawing. Aurelia sits on a rock and sketches anything that moves.',
          'A beetle, a bush, a cloud, and once again the back of my head. She draws with a stub of charcoal and her tongue between her teeth.',
          'The last was a horned viper, coiled in the shade. She drew it from three paces, calm as a clerk, while I stood behind her holding a stone.'
        ],
        choices: [
          { text: 'Ask her to draw something for me.',
            silviaMsg: 'Ask her to draw something for me, Hermes. Anything she likes.',
            reply: [
              'I asked. She tilted her head and said, ‘For the navigator? Then not a snake.’',
              'A few minutes later she handed me a page: the Monolith at dawn, very small, and at its foot a tiny figure in a hat much too big. It is meant to be me.',
              'I have tucked it into my log. You shall have it when this is over.'
            ] },
          { text: 'Keep her away from the viper!',
            silviaMsg: 'Hermes, get her away from that viper! Some things are not worth a sketch.',
            reply: [
              'I put a hand on her sleeve and said as much. She smiled and said, ‘He is only afraid because he is small.’',
              'It is exactly what she said about spiders at the observatory, fifty-five years ago, and I had to look away.',
              'We moved on, the viper unbothered, Aurelia a little amused, and my heart back on the right side of my chest.'
            ] }
        ] },
      { id: 'plat-hum',
        beats: [
          'She is humming again, Silvia: the tune with no words, rising and falling, the one the shepherd hummed on the hardpan.',
          'This time I caught myself finishing her phrase, a few notes before she did. I did not know I knew them.',
          'She stopped and looked at me. ‘You have heard it before,’ she said, not as a question. I said yes, long ago, and she nodded.'
        ],
        choices: [
          { text: 'Hum along with her.',
            silviaMsg: 'Hum along, Hermes. Even badly. Let it come back by itself.',
            reply: [
              'I did. My voice is about as musical as a gate, but she did not wince once.',
              'Halfway through the second phrase her voice and mine met on the same note, and she smiled without opening her eyes.',
              'We walked a mile like that. I do not know what we sounded like, but I know what it felt like.'
            ] },
          { text: 'Let her hum on her own.',
            silviaMsg: 'Let her hum on her own, Hermes. You promised not to push her.',
            reply: [
              'Good counsel. I closed my mouth and opened my ears.',
              'She hummed on, and the tune grew a new bar. Something in her has begun to remember it.',
              'I walked beside her and kept my eyes on the road. Some things come back only when nobody is looking.'
            ] }
        ] },
      { id: 'plat-feather-cloud',
        beats: [
          'A long thin cloud has drawn itself across the sky like a feather, Silvia, very high, where nothing else is.',
          'Aurelia stopped to read it. She says high feathers mean the wind will change by nightfall, and she is right three times out of four.',
          'She remembers weather perfectly and cannot recall her own birthday. I begin to see how a mind works: it keeps what it used.',
          'Cold tonight, she says, and a wind from the west. When an Oracle says cold, a sensible man finds his scarf.'
        ] }
    ] },
    { at: 0.5, pool: [
      { id: 'plat-last-camp',
        beats: (W) => K([
          'We found their last camp, Silvia, the one I told you about. Cold ashes, a trench of wheel marks, and a flat place where the animals were tethered.',
          'The ashes are cold, so they are a day ahead of us. On a flat rock somebody has scratched the same ugly mark: a circle with a line across it.',
          'Aurelia read the camp like a letter. She says they cooked in a hurry and left in a quarrel: three half-eaten bowls, boot marks pointing three ways.',
          num(W.seals()) >= 5
            ? 'Let the Ashes keep their camp. I carry all five seals sewn in my coat, and a woman who reads camps like letters.'
            : 'Let the Ashes keep their camp. I carry what I have sewn in my coat, and a woman who reads camps like letters.'
        ]),
        choices: [
          { text: 'Rest in the shade of their camp.',
            silviaMsg: 'Rest there, Hermes. Their camp has the best shade, and they are a day ahead.',
            reply: [
              'We did. We spread our coats in the shade of the rock they had used, with the ash circle a respectful distance away.',
              'I slept two hours and dreamed of nothing at all, which is the best of dreams. Aurelia sat beside me and drew the whole camp.',
              'When I woke she handed me the page: the ash circle, the fire pits, and me asleep with my mouth open. She says that is not how I look. She is lying.'
            ] },
          { text: 'Sleep a hundred paces away.',
            silviaMsg: 'Do not sleep in their camp, Hermes. Go a little way off. You never know who comes back.',
            reply: [
              'A sensible woman and a sensible man. We found a split in the rock a hundred paces north, hidden from the track.',
              'It was a poorer shade, and the stone was hard, but I slept with one eye open and Aurelia slept with both closed.',
              'Nobody came. But I woke easier for having a rock between me and their mark.'
            ] }
        ] },
      { id: 'plat-lapis-evening',
        beats: [
          'At the rest she asked me, out of nowhere, what we used to do on summer evenings. I said: we ground blue for the charts, and quarrelled about north.',
          'She laughed, and the laugh was exactly the same. I have not heard it for fifty-five years, and my chest felt like a door opening.',
          'Then she went quiet, and said she could smell lapis and cedar, and see a table with a lamp. Nothing more. But it is more than yesterday.'
        ],
        choices: [
          { text: 'Tell her about your first chart together.',
            silviaMsg: 'Tell her about the first chart you drew together, Hermes. One small story at a time.',
            reply: [
              'I told her. It was a map of the observatory roof, drawn on a napkin, and we spent the evening arguing about where to put the chimney.',
              'She said the chimney should have been on the left. She is right. I have the napkin still, somewhere, in some trunk in some attic.',
              'She added that I was probably the kind of man who keeps napkins. I am. It is a pity to be so easy to read.'
            ] },
          { text: 'Let her rest. No more stories today.',
            silviaMsg: 'Let her rest now, Hermes. The stories will come when she wants them.',
            reply: [
              'I think you are right. She closed her eyes with the smell of lapis still in the air, and was asleep within a minute.',
              'I sat guard with my staff across my knees and watched the sun move over the rock.',
              'There is a particular joy in guarding someone’s sleep when you have missed fifty-five years of it. I would not trade it for a story.'
            ] }
        ] },
      { id: 'plat-mirage',
        beats: [
          'At the heat of the day the plateau turned into a lake, Silvia. A perfect one, with a row of palm trees standing upside down on the water.',
          'Aurelia said a mirage is only the sky’s own mirror: hot air near the ground bends the light, and the sky is reflected on the sand.',
          'She said it so simply, so calmly, that I could have wept. She is explaining light to me, who once explained it to her.',
          'She drew it in the sand: a ray going down, curving, and coming up again, as if it had bounced. Mirrors will matter where we are going.'
        ] }
    ] },
    { at: 0.8, pool: [
      { id: 'plat-stars',
        beats: [
          'The stars are out, Silvia, and Aurelia has taken charge of the sky. She names them as we walk, one after another, without a pause.',
          'She knows every name, every story, even the star the old charts forgot. But if I ask her what day she was born, she shakes her head and laughs.',
          'I think that is how it should be. The sky is a more reliable memory than a person.'
        ],
        choices: [
          { text: 'Ask which star is her favourite.',
            silviaMsg: 'Ask her which star is her favourite, Hermes.',
            reply: [
              'She did not even think. ‘The one that rises last,’ she said, ‘because it comes when everyone has gone to sleep, and still looks cheerful.’',
              'I asked what it is called. She said it will tell me itself, in time.',
              'That is Aurelia, Silvia. Always a story where a fact should be. I would not change a word.'
            ] },
          { text: 'Ask her to teach you a new star.',
            silviaMsg: 'Ask her to teach you a star you do not know, Hermes. You cannot know them all.',
            reply: [
              '‘Dear me,’ she said, ‘a cartographer who does not know his stars!’ She was delighted.',
              'She showed me a faint one just above the horizon, small and dim, with a smug twin beside it. She called the twin ‘the neighbour’.',
              'I will remember it, and when I forget, she will remind me. It will be the first time in fifty-five years that someone has had to.'
            ] }
        ] },
      { id: 'plat-glass-bells',
        beats: [
          'Do you hear that, Silvia? Of course not, you cannot. A thin sound comes down the wind, like a tinkling of very small bells made of glass.',
          'It stops when the wind stops and returns when it rises. Aurelia says she has heard it before, but not where. It makes her think of velvet.',
          'I do not like riddles I cannot see the face of. But I like this one better than most.'
        ],
        choices: [
          { text: 'Follow the sound a little.',
            silviaMsg: 'Follow the sound a little, Hermes. See where it gets louder.',
            reply: [
              'We turned half a point to the north, and the tinkling grew. Then the wind shifted and it died, as if someone had shut a door.',
              'We lost nothing but a few minutes, and gained a direction. Aurelia says we were right to follow it.',
              'Keep your pages near, Silvia. Something at the end of this road is trying to speak to us in small voices.'
            ] },
          { text: 'Ignore it. Keep to the ruts.',
            silviaMsg: 'Ignore it, Hermes. Keep to the raiders’ ruts and keep your minds on the road.',
            reply: [
              'A sound that does not want to be followed is best left alone. We kept to the ruts, and the sound kept to the wind.',
              'But Aurelia walked a little faster after that, as if she were listening for it under her own feet.',
              'I did not ask her. Some questions grow better when they are not watered.'
            ] }
        ] },
      { id: 'plat-pigeon',
        beats: [
          'A pigeon of the Order found us at the last rise, Silvia, grey, with a little brass ring on its leg. It landed on my staff and refused to leave.',
          'A note was tied to its leg, in the Servant’s square little hand: ‘Hands better. Eat properly. Do not let her carry your pack.’',
          'I have not been scolded so efficiently by anyone in years. Aurelia read it over my shoulder and laughed until she had to sit down.'
        ],
        choices: [
          { text: 'Write back. Thank him.',
            silviaMsg: 'Write back, Hermes. Tell him thank you, and tell him to rest his hands.',
            reply: [
              'I wrote three words on the back: ‘Thank you. Rest.’ Meaning him, of course.',
              'The pigeon looked at it with disdain, took off in a flurry, and headed west like a small grey arrow.',
              'He will pretend he did not read it. But he will keep it. He keeps everything.'
            ] },
          { text: 'Let Aurelia write the reply.',
            silviaMsg: 'Let Aurelia write the reply, Hermes. He will want to hear from her.',
            reply: [
              'She took the pencil, thought a moment, and wrote: ‘Eating. Walking. Remembering. Be well.’',
              'I did not know a man could be so proud of a note he did not write.',
              'The pigeon flew off with it, west toward the Sanctuary and the little lamp the Servant keeps lit at the top.'
            ] }
        ] }
    ] }
  ];
})();
