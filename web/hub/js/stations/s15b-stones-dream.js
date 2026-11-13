// =========================================================================
// 🕰️ THE MEMORY OF THE STONES · a dream of the autumn of 1998, between Cairn III and the hardpan
// The printed page “The Five Geodetic Cairns”, lived. Hermes sleeps through the heat in the rocks at the edge of the
// hardpan and dreams of his first expedition: three mounds of dry stone raised along the wash, a copper benchmark at
// 112°, and (what he never knew) the Order's own foundations under his hands. He tells Silvia the dream and she lives it:
// three old photographic plates, blurred. She touches the lights in them (fragments of the memory) and each one comes
// clear; at the end of each plate she answers him, and the plate develops.
// It is not a game: nothing can be lost. What she answers is remembered (order_stones_dream) and comes back on the wire.
// Canon (docs/DESERT_ODYSSEY_BIBLE.md, “Historia de los Cairns”): in 1998 Hermes was fifty-four; “a young traveler” is
// the old Servant's point of view. Cairns I, II and III fell in 1971; IV and V never fell and he has never seen them.
// The Field Wire opens this scene once, after the Station 15 debrief (hub-core.js: needsStonesDream / openStonesDreamModal).
// =========================================================================
(function initStonesDream() {
  'use strict';
  var modal = document.getElementById('modal-stones-dream');
  if (!modal) return;
  var T = window.THREE, P = window.EclipsePaint, SC = window.EclipseScenery;
  var sfx = window.sfx || {};
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var $ = function (id) { return document.getElementById(id); };

  var canvas = $('dream-canvas'), stage = $('dream-stage'), logEl = $('dream-log'), choicesBox = $('dream-choices');
  var subtitle = $('dream-subtitle'), closeBtn = $('btn-close-dream'), finishCard = $('dream-finish-card'), finishBtn = $('btn-dream-finish');
  var finishBody = $('dream-finish-body'), platesEl = $('dream-plates'), hudTime = $('dream-hud-time'), fiveEl = $('dream-five');

  var KEY = 'order_stones_dream';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function saved() { try { var o = JSON.parse(get(KEY) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; } }
  function isDone() { return !!saved().done; }
  function cue(kind, o) { try { if (window.EclipseAmbience && window.EclipseAmbience.sfx) window.EclipseAmbience.sfx(kind, o); } catch (e) {} }

  // ---------------------------------------------------------------------
  // 1. THE STORY
  // ---------------------------------------------------------------------
  var CAST = {
    hermes: { name: 'Hermes', role: 'Cartographer', icon: '🧭' },
    silvia: { name: 'Silvia', role: 'on the field wire', icon: '📡' }
  };
  // stage: idle | intro | plate (touch the fragments) | asking | develop | outro | done
  var ns = { stage: 'idle', busy: false, plate: 0, found: {}, answers: {}, onDone: null, replay: false, idleAt: 0 };
  var S3 = null;   // the 3D scene's hooks (null when WebGL is missing: the fragments become a list)
  var speaking = null;

  var chat = window.EclipseChat.create({
    log: logEl, cast: CAST, subtitle: subtitle, stage: stage,
    onSpeak: function (who) { speaking = who; }
  });
  if (logEl) logEl.addEventListener('click', function () { if (ns.busy && !window.__dreamFast) { chat.fast = true; setTimeout(function () { if (!window.__dreamFast) chat.fast = false; }, 400); } });

  var H = function (t, x) { var o = { who: 'hermes', say: t }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var nar = function (t, x) { var o = { narr: t }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var fx = function (name) { var a = [].slice.call(arguments, 1); return function () { if (S3 && S3.fx[name]) S3.fx[name].apply(null, a); }; };
  function setMission(t) { var m = $('dream-mission-text'); if (m) m.textContent = t; }

  // Three plates. Each: its fragments (touched in any order), then what Hermes asks, then her answers.
  var PLATES = [
    {
      id: 'wash', roman: 'I', title: 'The Wash', time: 'AUTUMN 1998 · PLATE I OF III',
      enter: 'Autumn, 1998. A dry riverbed between red walls, and a man alone in it.',
      fragments: {
        stones: { name: 'the ring of stones', lines: function () { return [
          nar('River stones lie in a rough ring, half buried in the gravel.', { fx: fx('act', 'stones') }),
          H('Stones lying in a ring. I thought the river had left them so. Rivers do not leave rings, Silvia.')
        ]; } },
        radio: { name: 'the box that hisses', lines: function () { return [
          nar('On a flat rock, a wooden box with a dial hisses quietly to itself.', { fx: fx('act', 'radio') }),
          H('My valve receiver. I listened to that hiss for weeks, down in the gorge, hoping for one sound that was not the wind.'),
          H('There was never anything. Not then.')
        ]; } },
        hands: { name: 'his hands', lines: function () { return [
          nar('The man lifts a stone, turns it once, and sets it down exactly where it belongs.', { fx: fx('act', 'hands') }),
          H('My hands knew where each stone went before I chose it. I told myself it was a surveyor’s habit.')
        ]; } }
      },
      ask: function () { return [H('The first mound is standing. Why did I build it, Silvia? I have asked myself for twenty-eight years.')]; },
      mission: 'Why did he build it?', key: 'why',
      choices: {
        seeker: { icon: '🧭', label: 'For whoever would come after you.', say: 'For whoever came after you, Hermes. You wrote it yourself: for the seeker who may one day follow your steps.',
          lines: function () { return [H('For the seeker who may one day follow my steps. I wrote that, and I did not know it would be you.')]; } },
        thread: { icon: '🪢', label: 'So you could find your own way back.', say: 'So you could find your way back. A man alone in a desert leaves himself a thread.',
          lines: function () { return [H('A thread, yes. Three knots in it, heading south-south-east. I never thought anyone else would pull on it.')]; } },
        grief: { icon: '🕯️', label: 'Because you could not leave her without a marker.', say: 'Because you could not leave that gorge without a marker for her. I think you built it for Aurelia.',
          lines: function () { return [H('...Yes. I believed she lay under forty metres of sand, and I had no name to carve. So I stacked stones, and called it surveying.')]; } }
      },
      developed: 'The plate comes clear: a cone of river stones in a dry wash, and a man walking away from it, south-south-east.'
    },
    {
      id: 'ridge', roman: 'II', title: 'The Ridge', time: 'AUTUMN 1998 · PLATE II OF III',
      enter: 'Night. He has camped in the shadow of a tall standing stone.',
      fragments: {
        monolith: { name: 'the standing stone', lines: function () { return [
          nar('A single stone stands against the stars, taller than a house, straight as a plumb line.', { fx: fx('act', 'monolith') }),
          H('I camped under a great standing stone and never asked who had raised it. I measured its shadow for my own amusement.')
        ]; } },
        steps: { name: 'the three steps', lines: function () { return [
          nar('Under his second mound, the ground is cut in steps, square as a table.', { fx: fx('act', 'steps') }),
          H('Three steps of dressed rock under my boots. I wrote “natural ledges” in the log. Natural! With corners.')
        ]; } },
        log: { name: 'the field log', lines: function () { return [
          nar('By the fire, he writes the day into his field log, and signs it.', { fx: fx('act', 'log') }),
          H('« The Cartographer ». I had not used my own name in twenty-seven years.')
        ]; } }
      },
      ask: function () { return [
        nar('The receiver crackles. For one breath, the hiss has a shape.', { fx: fx('radioWakes') }),
        H('And here the dream does something the night of 1998 never did, Silvia. The receiver crackles, and I think... I think it is you.'),
        H('Twenty-eight years too early, on a wire that did not exist yet. What do you say to that man by the fire?')
      ]; },
      mission: 'Speak to the man by the fire', key: 'radio',
      choices: {
        alone: { icon: '🤝', label: '“You are not alone out here.”', say: 'You are not alone out here, Hermes. I’m at the other end of this wire, even if it takes me twenty-eight years to arrive.',
          lines: function () { return [
            nar('The man by the fire lifts his head, and looks straight at the box.', { fx: fx('pastReact', 'wonder') }),
            H('I remember it now. One night the receiver crackled, and I sat up beside it until dawn. I wrote it down as weather.')
          ]; } },
        under: { icon: '🪨', label: '“Look under the stones.”', say: 'Look under the stones, Hermes. You are standing on something much older than you think.',
          lines: function () { return [
            nar('The man by the fire looks down at the three steps, and lays his hand flat on the rock.', { fx: fx('pastReact', 'kneel') }),
            H('He almost understood, Silvia. He felt the corners under his palm... and then he went back to his log. I was a stubborn man at fifty-four.')
          ]; } },
        walk: { icon: '👣', label: '“Keep walking. Someone will follow.”', say: 'Keep walking, Hermes. Raise the third one. Someone will follow you, I promise.',
          lines: function () { return [
            nar('The man by the fire banks the embers, and packs his instruments before the sun is up.', { fx: fx('pastReact', 'nod') }),
            H('He did not hear the words. But he woke with his mind made up, and I never knew why until tonight.')
          ]; } }
      },
      developed: 'The plate comes clear: a mound on three square steps, a fire, and a standing stone against the stars.'
    },
    {
      id: 'plateau', roman: 'III', title: 'The Plateau', time: 'AUTUMN 1998 · PLATE III OF III',
      enter: 'Morning, a day further south-south-east. A plateau of bare rock above deep fissures.',
      fragments: {
        theodolite: { name: 'the brass instrument', lines: function () { return [
          nar('A brass theodolite stands on its tripod, levelled to a hair.', { fx: fx('act', 'theodolite') }),
          H('One bearing, taken three times: 112 degrees east, to the old watchtower on the rim. Outer Watchtower VI.')
        ]; } },
        plate: { name: 'the plate of copper', lines: function () { return [
          nar('He hammers the bearing into a plate of copper, and lays it under the foundation stones.', { fx: fx('act', 'plate') }),
          H('The first copper benchmark. I buried it under the third mound, for the seeker who might one day follow my steps.')
        ]; } },
        groove: { name: 'the line in the rock', lines: function () { return [
          nar('Where he brushes the sand from the bedrock, a straight line is cut into it, as old as the rock is old.', { fx: fx('act', 'groove') }),
          H('A groove under my hand, pointing north-north-west. 348 degrees. I took it for a crack, and built on top of it.'),
          H('It points at the Sun Monolith, Silvia. At the stone I had slept under.')
        ]; } },
        watcher: { name: 'someone on the ridge', late: true, lines: function () { return [
          nar('A hooded man with a staff, as still as the rock he stands on.', { fx: fx('act', 'watcher') }),
          H('The Servant of the Sanctuary. He watched me raise three of his Order’s cairns with my bare hands, and he said nothing for twenty-eight years.'),
          H('At the gates of Tower II he told me: “A stone remembers the hand that raises it.” I took it for a proverb.')
        ]; } }
      },
      ask: function () { return [H('So that is the whole of it. I was never marking my own trail. What do I do with a thing like that, Silvia?')]; },
      mission: 'Answer him', key: 'end',
      choices: {
        hands: { icon: '✋', label: 'Your hands remembered before you did.', say: 'Your hands remembered before you did, Hermes. That’s why you knew the stones of the riverbed before you ever touched them.',
          lines: function () { return [H('That is what the Servant said: “That is why your fingers knew the rocks in the riverbed.” A hunch, I called it. It was my own work, calling me back.')]; } },
        never: { icon: '🧭', label: 'You were never lost. You were surveying.', say: 'Then you were never lost out here, Hermes. Not in 1998 and not now. You were surveying for the Order the whole time.',
          lines: function () { return [H('Fifty-four years old, alone, and without knowing it the last surveyor of the Eclipse Order. I think I can carry that, Silvia. It is lighter than what I carried before.')]; } },
        finish: { icon: '🌗', label: 'Then finish what you began.', say: 'Then finish what you began. Two cairns never fell: walk the whole meridian, Hermes.',
          lines: function () { return [H('“The desert yields its seals only to the one who walks the complete meridian.” Cairn IV and Cairn V, far in the southern gorges. They never fell, and I have never seen them.')]; } }
      },
      developed: 'The plate comes clear: a pyramid of flat stones, a copper plate at its foot, and a watcher on the ridge.'
    }
  ];
  function plate() { return PLATES[ns.plate]; }
  function fragIds(p) { return Object.keys((p || plate()).fragments); }
  function openIds() { var p = plate(), early = fragIds(p).filter(function (id) { return !p.fragments[id].late; }), allEarly = early.every(function (id) { return ns.found[p.id + ':' + id]; }); return fragIds(p).filter(function (id) { return !ns.found[p.id + ':' + id] && (!p.fragments[id].late || allEarly); }); }
  function foundCount() { var p = plate(); return fragIds(p).filter(function (id) { return ns.found[p.id + ':' + id]; }).length; }

  function persist(extra) {
    if (ns.replay) return;
    var o = saved();
    o.found = Object.keys(ns.found);
    for (var k in ns.answers) o[k] = ns.answers[k];
    if (extra) for (var e in extra) o[e] = extra[e];
    set(KEY, JSON.stringify(o));
  }

  // without WebGL the fragments are a list of buttons under the chat (and the smoke test uses the same door)
  function renderFragmentList() {
    var box = $('dream-fragments'); if (!box) return;
    box.innerHTML = '';
    var ids = ns.stage === 'plate' && !ns.busy ? openIds() : [];
    box.hidden = !!S3 || !ids.length;
    if (S3) return;
    ids.forEach(function (id) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'gates-choice-btn'; b.id = 'dream-frag-' + id;
      b.innerHTML = '<span>✦ Touch ' + plate().fragments[id].name + '</span>';
      b.addEventListener('click', function () { find(id); });
      box.appendChild(b);
    });
  }
  function progressText() { var p = plate(), n = fragIds(p).filter(function (id) { return !p.fragments[id].late; }).length; return 'Plate ' + p.roman + ' · ' + Math.min(foundCount(), n) + ' of ' + n + ' fragments'; }

  // she touched a light: that piece of the memory comes clear
  async function find(id) {
    var p = plate(), f = p.fragments[id];
    if (!f || ns.busy || ns.stage !== 'plate' || ns.found[p.id + ':' + id] || openIds().indexOf(id) < 0) return false;
    var token = chat.token;
    ns.busy = true; ns.found[p.id + ':' + id] = true; ns.idleAt = performance.now();
    cue('shimmer', { deg: 4 + foundCount() * 2 });
    if (S3) S3.touched(id);
    renderFragmentList();
    if (window.EclipseAmbience) window.EclipseAmbience.intensity(Math.min(1, 0.25 + 0.07 * Object.keys(ns.found).length));
    var ok = await chat.play(f.lines(), token);
    if (!ok) return false;
    persist();
    ns.busy = false; speaking = null;
    var left = openIds();
    if (left.length) {
      // the one on the ridge only shows once the rest of the plate is clear
      if (left.length === 1 && p.fragments[left[0]].late) {
        ns.busy = true;
        ok = await chat.play([nar('And high on the ridge behind him, where he never once looked, someone is standing.', { fx: fx('watcherComes') })], token);
        if (!ok) return false;
        ns.busy = false; speaking = null;
      }
      setMission(progressText()); renderFragmentList();
      if (S3) S3.motes();
      return true;
    }
    return askPlate(token);
  }
  async function askPlate(token) {
    var p = plate();
    ns.busy = true; ns.stage = 'asking';
    if (S3) S3.motes();
    var ok = await chat.play(p.ask(), token);
    if (!ok) return false;
    ns.busy = false; speaking = null;
    setMission(p.mission);
    renderChoices();
    return true;
  }
  function renderChoices() {
    choicesBox.innerHTML = '';
    var box = choicesBox.parentNode, ids = ns.stage === 'asking' && !ns.busy ? Object.keys(plate().choices) : [];
    box.style.display = ids.length ? '' : 'none';
    ids.forEach(function (id) {
      var c = plate().choices[id], b = document.createElement('button');
      b.type = 'button'; b.className = 'gates-choice-btn'; b.id = 'dream-choice-' + id;
      b.innerHTML = '<span>' + c.icon + ' ' + c.label + '</span>';
      b.addEventListener('click', function () { pick(id); });
      choicesBox.appendChild(b);
    });
    if (ids.length) { var f = choicesBox.querySelector('button'); if (f) f.focus(); }
  }
  async function pick(id) {
    if (ns.busy || ns.stage !== 'asking') return;
    var p = plate(), c = p.choices[id], token = chat.token;
    if (!c) return;
    ns.busy = true; ns.answers[p.key] = id;
    choicesBox.innerHTML = ''; choicesBox.parentNode.style.display = 'none';
    if (sfx.playMechanicalClick) sfx.playMechanicalClick();
    if (p.key === 'radio' && S3) S3.fx.radioSpeaks();
    await chat.say('silvia', [c.say], token);
    if (token !== chat.token) return;
    var ok = await chat.play(c.lines(), token);
    if (!ok) return;
    persist();
    // the plate develops
    ns.stage = 'develop';
    ok = await chat.play([nar(p.developed, { fx: function () { develop(); }, hold: 900 })], token);
    if (!ok) return;
    if (ns.plate < PLATES.length - 1) { ns.plate++; return enterPlate(token); }
    return wake(token);
  }
  // the shutter: the scene comes sharp, a flash, and a small photograph joins the others in the panel
  function develop() {
    var p = plate();
    cue('lens'); setTimeout(function () { cue('reveal'); }, 260);
    var shot = S3 ? S3.develop() : null;
    if (platesEl) {
      var fig = document.createElement('figure'); fig.className = 'dream-plate'; fig.id = 'dream-plate-' + p.id;
      fig.innerHTML = (shot ? '<img alt="" src="' + shot + '">' : '<div class="dream-plate-blank" aria-hidden="true">' + p.roman + '</div>') + '<figcaption>' + p.roman + ' · ' + p.title + '</figcaption>';
      platesEl.appendChild(fig); platesEl.hidden = false;
    }
  }
  async function enterPlate(token) {
    var p = plate();
    ns.stage = 'plate'; ns.busy = true;
    if (hudTime) hudTime.textContent = p.time;
    setMission(progressText());
    var ok = await chat.play([nar(p.enter, { fx: fx('plate', ns.plate), hold: 700 })], token);
    if (!ok) return false;
    ns.busy = false; speaking = null; ns.idleAt = performance.now();
    renderFragmentList();
    if (S3) S3.motes();
    window.EclipseChat.subtitle.act(subtitle, S3 ? 'Touch the lights in the dream: each one is a piece of the memory.' : 'Choose a piece of the memory.');
    return true;
  }
  function sealsOf() { var n = []; for (var i = 1; i <= 5; i++) n.push(get('order_seal_cairn_' + i) === 'true'); return n; }
  async function wake(token) {
    ns.stage = 'outro'; ns.busy = true;
    setMission('The dream lets go');
    if (hudTime) hudTime.textContent = 'TODAY · DUSK AT THE HARDPAN';
    var ok = await chat.play([
      nar('The three plates lie side by side, and the dream lets go. The colour comes back into the world.', { fx: fx('wake'), hold: 1800 }),
      H('I am awake, Silvia. The sun is almost down, and my hands smell of river stone.'),
      nar('Five cairns to measure a desert. Three fell in the autumn of 1971, and one man raised them again in 1998. Two never fell.', { fx: function () { showFive(); if (S3) S3.fx.five(); }, hold: 1400 }),
      H('I have stood at three of them now, and I built all three without knowing it. The fourth is waiting across the hardpan, where the canyon narrows.')
    ], token);
    if (!ok) return false;
    finish();
    return true;
  }
  // the silhouettes of the page “The Five Geodetic Cairns”: gold where the seal is already in the satchel
  function showFive() {
    if (!fiveEl) return;
    var seals = sealsOf();
    var SHAPES = [
      '<path d="M8 46 Q14 30 22 22 Q30 8 32 6 Q36 12 42 22 Q50 32 56 46 Z"/><circle cx="24" cy="38" r="4"/><circle cx="34" cy="34" r="4.4"/><circle cx="42" cy="40" r="3.6"/><circle cx="31" cy="24" r="3.6"/>',
      '<rect x="8" y="38" width="48" height="8"/><rect x="14" y="30" width="36" height="8"/><rect x="20" y="12" width="24" height="18"/><rect x="18" y="8" width="28" height="4"/><rect x="26" y="16" width="5" height="10"/><rect x="33" y="16" width="5" height="10"/>',
      '<path d="M8 46 L32 6 L56 46 Z"/><circle cx="32" cy="34" r="5"/>',
      '<rect x="14" y="8" width="12" height="38"/><rect x="38" y="8" width="12" height="38"/><rect x="12" y="6" width="16" height="3"/><rect x="36" y="6" width="16" height="3"/><rect x="19" y="18" width="2" height="12"/><rect x="43" y="18" width="2" height="12"/>',
      '<rect x="14" y="14" width="8" height="32"/><rect x="42" y="14" width="8" height="32"/><rect x="10" y="4" width="44" height="10"/><rect x="12" y="44" width="12" height="3"/><rect x="40" y="44" width="12" height="3"/>'
    ];
    var NOTE = ['fell 1971 · raised 1998', 'fell 1971 · raised 1998', 'fell 1971 · raised 1998', 'never fell', 'never fell'];
    fiveEl.innerHTML = '<div class="dream-five-title">THE FIVE GEODETIC CAIRNS</div><div class="dream-five-row">' + SHAPES.map(function (s, i) {
      return '<div class="dream-five-cairn' + (seals[i] ? ' has-seal' : '') + (i > 2 ? ' is-standing' : '') + '" style="--i:' + i + '"><svg viewBox="0 0 64 52" aria-hidden="true">' + s + '</svg><b>Cairn ' + ['I', 'II', 'III', 'IV', 'V'][i] + '</b><small>' + NOTE[i] + (seals[i] ? ' · seal ✦' : '') + '</small></div>';
    }).join('') + '</div>';
    fiveEl.hidden = false;
    cue('shimmer', { deg: 10 });
  }
  function finish() {
    ns.stage = 'done'; ns.busy = false; speaking = null;
    persist({ done: true });
    setMission('Dusk at the edge of the hardpan');
    var a = ns.answers;
    var radio = { alone: ' In the dream, a voice on the receiver told him he was not alone.', under: ' In the dream, a voice on the receiver told him to look under the stones.', walk: ' In the dream, a voice on the receiver told him to keep walking.' }[a.radio] || '';
    if (finishBody) finishBody.textContent = 'Hermes dreamed the autumn of 1998 from end to end: three mounds raised on the Order’s own foundations, a copper plate at 112°, and a watcher on the ridge.' + radio;
    if (finishCard) finishCard.style.display = 'flex';
    if (finishBtn) { finishBtn.querySelector('span').textContent = ns.onDone ? '📡 Back to the Field Wire ➔' : '✦ Close the dream'; finishBtn.focus(); }
    if (window.EclipseAmbience) window.EclipseAmbience.intensity(0.4);
    if (sfx.playCelestialChime) sfx.playCelestialChime();
  }

  async function start() {
    var token = chat.reset();
    ns.stage = 'intro'; ns.busy = true; ns.plate = 0; ns.found = {}; ns.answers = {};
    logEl.innerHTML = '';
    choicesBox.innerHTML = ''; choicesBox.parentNode.style.display = 'none';
    if (finishCard) finishCard.style.display = 'none';
    if (platesEl) { platesEl.innerHTML = ''; platesEl.hidden = true; }
    if (fiveEl) { fiveEl.innerHTML = ''; fiveEl.hidden = true; }
    setMission('A dream of the autumn of 1998');
    if (hudTime) hudTime.textContent = 'AUTUMN 1998 · A DREAM';
    if (S3) S3.reset();
    renderFragmentList();
    window.EclipseChat.subtitle.reset(subtitle, 'Hermes sleeps in the rocks at the edge of the hardpan.');

    chat.card('📖 Where we are', [
      'Hermes slept through the heat in the rocks at the edge of the hardpan.',
      'He woke with a dream of the autumn of 1998 still in his hands, and he is telling it to you: the page “The Five Geodetic Cairns”.',
      'The dream is blurred. Touch the lights in it, and it will come clear. Nothing here can be lost.'
    ]);
    await chat.sleep(1500);
    var ok = await chat.play([
      H('Silvia, I slept, and I dreamed of the autumn of 1998. I was fifty-four years old, and I had come down into this desert with a theodolite, a valve receiver and no hope at all.'),
      H('It is slipping away already. Help me hold it: touch what you see, and I will tell you what it was.')
    ], token);
    if (!ok) return;
    enterPlate(token);
  }

  // ---------------------------------------------------------------------
  // 2. THE SCENE (three.js): one riverbed, dressed three times, seen through an old photograph
  // ---------------------------------------------------------------------
  var renderer = null, scene = null, camera = null, orbitCtl = null, animId = null, clock = { t: 0, last: 0 }, efx = null;
  var film = null, motesBox = null, moteEls = {};
  function lcg(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function buildFilm() {
    if (film || !stage) return;
    var d = document.createElement('div'); d.className = 'dream-film';
    d.innerHTML = '<i class="df-leak"></i><i class="df-burn"></i><i class="df-scratch"></i><i class="df-specks"></i><i class="df-hair"></i><i class="df-flick"></i><i class="df-flash"></i><i class="df-corner df-tl"></i><i class="df-corner df-tr"></i><i class="df-corner df-bl"></i><i class="df-corner df-br"></i>';
    stage.appendChild(d);
    motesBox = document.createElement('div'); motesBox.className = 'dream-motes'; stage.appendChild(motesBox);
    film = { box: d, flash: d.querySelector('.df-flash') };
  }

  function setup3D() {
    if (!canvas || !T || !SC || !P) return;
    if (renderer) return;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { console.warn('WebGL not supported for the Memory of the Stones:', e); renderer = null; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    scene = new T.Scene();
    var HORIZON = 0xe8c9a0;
    scene.fog = new T.Fog(HORIZON, 30, 120);
    var aspect = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    camera = new T.PerspectiveCamera(44, aspect, 0.1, 320);
    var paint = SC.paint(), fbm = SC.noise.fbm, U = SC.util;
    buildFilm();

    var skyObj = SC.sky(scene, { zenith: 0x7fa6c8, mid: 0xe9d2ae, horizon: HORIZON, glow: 0xffd9a0, sun: [0.5, 0.42, -0.5], cloudK: 0.5 });
    // the stars of the night on the ridge (they only show on plate II)
    var rs = lcg(77), SN = 700, sp = new Float32Array(SN * 3);
    for (var si = 0; si < SN; si++) { var sy = 0.06 + Math.pow(rs(), 0.8) * 0.92, sph = rs() * Math.PI * 2, srr = Math.sqrt(1 - sy * sy); sp[si * 3] = Math.cos(sph) * srr * 110; sp[si * 3 + 1] = sy * 110; sp[si * 3 + 2] = Math.sin(sph) * srr * 110; }
    var sgeo = new T.BufferGeometry(); sgeo.setAttribute('position', new T.BufferAttribute(sp, 3));
    var stars = new T.Points(sgeo, new T.PointsMaterial({ size: 2.6, sizeAttenuation: false, color: 0xfff4dc, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false }));
    stars.material.color.setRGB(2.6, 2.5, 2.2);   // brighter than white: the night is printed dark, and they must still burn through
    stars.frustumCulled = false; stars.renderOrder = -90; scene.add(stars);
    // the Milky Way over the ridge: a band of small stars across the sky, and a paleness behind them
    var MW = 1400, mp = new Float32Array(MW * 3), mwAxis = new T.Vector3(0.55, 0.62, 0.56).normalize(), mu = new T.Vector3(0, 1, 0).cross(mwAxis).normalize(), mv = new T.Vector3().crossVectors(mwAxis, mu), mq = new T.Vector3();
    for (var mi = 0; mi < MW; mi++) {
      var ma = rs() * Math.PI * 2, off = (rs() + rs() + rs() - 1.5) * 0.2;
      mq.copy(mu).multiplyScalar(Math.cos(ma)).addScaledVector(mv, Math.sin(ma)).addScaledVector(mwAxis, off).normalize();
      if (mq.y < 0.04) mq.y = 0.04 + rs() * 0.5;
      mp[mi * 3] = mq.x * 109; mp[mi * 3 + 1] = mq.y * 109; mp[mi * 3 + 2] = mq.z * 109;
    }
    var mgeo = new T.BufferGeometry(); mgeo.setAttribute('position', new T.BufferAttribute(mp, 3));
    var milky = new T.Points(mgeo, new T.PointsMaterial({ size: 1.5, sizeAttenuation: false, color: 0xe6ecff, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false }));
    milky.material.color.setRGB(1.5, 1.6, 1.9);
    milky.frustumCulled = false; milky.renderOrder = -91; scene.add(milky);
    var milkGlow = [];
    for (var gi = 0; gi < 9; gi++) {
      var ga = -1.2 + gi * 0.42; mq.copy(mu).multiplyScalar(Math.cos(ga)).addScaledVector(mv, Math.sin(ga)).normalize();
      if (mq.y < 0.1) continue;
      var gsp = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xaab8e8, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: T.AdditiveBlending }));
      gsp.position.copy(mq).multiplyScalar(104); gsp.scale.set(58, 30, 1); gsp.renderOrder = -92; scene.add(gsp); milkGlow.push(gsp);
    }
    var ground = SC.terrain(scene, paint, { seed: 87, flatRadius: 15, size: 180, segments: 110 });
    var ridgeMeshes = SC.ridges(scene, { horizon: HORIZON }) || [];
    SC.scatter(scene, paint, ground.heightAt, { cx: 0, cz: 0, clear: 5, pebbles: 520, tufts: 190, scrub: 26, seed: 31 });
    // the red walls of the wash: one close behind him, a higher one far back, and a shoulder on either side
    var wall = SC.cliffWall(paint, { width: 130, height: 30, seed: 19, z: -24, flat: 4, minTop: 14, tint: 0xf0d8c0 });
    scene.add(wall);
    var walls = [wall];
    var wallFar = SC.cliffWall(paint, { width: 240, height: 58, seed: 43, z: 0, flat: 2, minTop: 34, tint: 0xd6bfae, cols: 120, rows: 40 });
    wallFar.position.z = -50; scene.add(wallFar); walls.push(wallFar);
    [[-1, 23], [1, 61]].forEach(function (sd) { var w2 = SC.cliffWall(paint, { width: 96, height: 26, seed: sd[1], z: 0, flat: 2, minTop: 12, tint: 0xe6cdb6, cols: 90, rows: 36 }); w2.rotation.y = sd[0] * -1.15; w2.position.set(sd[0] * 44, 0, -4); scene.add(w2); walls.push(w2); });
    [[-9, -7, 1.1, 1.5], [9.5, -9, 2.4, 1.3], [-12.5, 4, 0.3, 1.1], [11, 5.5, 4.0, 0.9], [-17, -14, 2.0, 2.4], [16, -16, 0.7, 2.8], [4, -19, 1.4, 2.0], [-6, -20, 3.0, 1.7], [-15, 9, 1.0, 0.8], [14, 11, 2.2, 0.7]].forEach(function (f) { var rk = SC.props.rocks(paint, { seed: 7 + Math.abs(f[0] * 3 | 0), scale: f[3], count: 3 + (Math.abs(f[1]) % 2) }); rk.position.set(f[0], ground.heightAt(f[0], f[1]), f[1]); rk.rotation.y = f[2]; rk.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(rk); });

    // ---- the dry riverbed: a darker channel of cracked mud winding past the camp, river cobbles and gravel along it ----
    function bedZ(x) { return 4.3 + Math.sin(x * 0.21 + 0.6) * 1.5 + Math.sin(x * 0.07) * 1.1; }
    var bedTex = P.canvasTex(1024, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var r = lcg(91), i;
      // the damp of the last flood, feathered at its edges
      for (i = 0; i < 520; i++) { var x = r() * w, y = h / 2 + (r() + r() - 1) * h * 0.36, rad = 14 + r() * 34, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(92,62,40,0.20)'); gr.addColorStop(1, 'rgba(92,62,40,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      // cracked mud: plates with dark seams
      g.strokeStyle = 'rgba(46,28,16,0.55)'; g.lineWidth = 1.3;
      for (i = 0; i < 230; i++) { var cx = r() * w, cy = h / 2 + (r() + r() - 1) * h * 0.26, n = 5 + (r() * 3 | 0), rr = 9 + r() * 14; g.beginPath(); for (var k = 0; k <= n; k++) { var a = k / n * Math.PI * 2 + r() * 0.5, q = rr * (0.7 + r() * 0.5); if (k) g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.6); else g.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.6); } g.stroke(); }
      for (i = 0; i < 1500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,236,200,0.10)' : 'rgba(40,24,12,0.14)'; g.fillRect(r() * w, h / 2 + (r() + r() - 1) * h * 0.4, 1 + r() * 2, 1 + r() * 2); }
    });
    (function () {
      var N = 48, pos = [], uv = [], idx = [];
      for (var i = 0; i <= N; i++) { var x = -22 + 44 * i / N, zc = bedZ(x), wd = 2.3 + Math.sin(x * 0.33) * 0.5; pos.push(x, ground.heightAt(x, zc - wd) + 0.035, zc - wd, x, ground.heightAt(x, zc + wd) + 0.035, zc + wd); uv.push(i / N * 3, 1, i / N * 3, 0); if (i) { var k = i * 2; idx.push(k - 2, k - 1, k, k, k - 1, k + 1); } }
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      bedTex.wrapS = T.RepeatWrapping;
      var bed = new T.Mesh(geo, new T.MeshLambertMaterial({ map: bedTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bed.receiveShadow = true; bed.renderOrder = 1; scene.add(bed);
    })();
    // river cobbles, water-worn and of many greys and rusts: one draw for six hundred of them
    function instanced(geo, mat, count, place) {
      var im = new T.InstancedMesh(geo, mat, count), d = new T.Object3D(), c = new T.Color();
      for (var i = 0; i < count; i++) { place(i, d, c); d.updateMatrix(); im.setMatrixAt(i, d.matrix); if (im.setColorAt) im.setColorAt(i, c); }
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); return im;
    }
    var cobGeo = new T.IcosahedronGeometry(1, 1), cpa = cobGeo.attributes.position;
    for (var ci = 0; ci < cpa.count; ci++) { var cxx = cpa.getX(ci), cyy = cpa.getY(ci), czz = cpa.getZ(ci), cn = 0.85 + 0.3 * fbm(cxx * 1.6 + 2, cyy * 1.6 + czz, 5, 2, 0, 0); cpa.setXYZ(ci, cxx * cn, cyy * 0.6 * cn, czz * cn * 0.86); }
    cobGeo.computeVertexNormals();
    var rc = lcg(53), COB_TINT = [0x8f7a62, 0x7c6a56, 0x9c846a, 0x6e5e50, 0x86705a, 0x94806c];
    instanced(cobGeo, paint({ color: 0xffffff }, 0xffe0b0, 0.14), 620, function (i, d, c) {
      var x = -21 + rc() * 42, zc = bedZ(x), z = zc + (rc() + rc() + rc() - 1.5) * 2.6, s = 0.04 + Math.pow(rc(), 2.6) * 0.2;
      if (Math.hypot(x, z) < 1.7) { x += 2.2; z += 1.6; }   // never under the mound
      d.position.set(x, ground.heightAt(x, z) + s * 0.32, z); d.rotation.set(rc() * 0.5, rc() * 6.3, rc() * 0.5); d.scale.set(s * (0.9 + rc() * 0.5), s, s * (0.8 + rc() * 0.5));
      c.setHex(COB_TINT[(rc() * COB_TINT.length) | 0]).multiplyScalar(0.85 + rc() * 0.3);
    });
    // and the gravel between them
    instanced(new T.IcosahedronGeometry(1, 0), paint({ color: 0xffffff }), 900, function (i, d, c) {
      var x = -22 + rc() * 44, z = bedZ(x) + (rc() + rc() - 1) * 3.4, s = 0.018 + rc() * 0.035;
      d.position.set(x, ground.heightAt(x, z) + s * 0.4, z); d.rotation.set(rc() * 3, rc() * 6, 0); d.scale.set(s * 1.3, s * 0.7, s);
      c.setHex(COB_TINT[(rc() * COB_TINT.length) | 0]).multiplyScalar(0.7 + rc() * 0.4);
    });
    // tamarisk along the banks: grey-green feathers on thin red twigs, and the bare ones the drought has killed
    function bushTex(dead) {
      return P.canvasTex(256, 256, function (g, w, h) {
        g.clearRect(0, 0, w, h);
        var r = lcg(dead ? 71 : 37);
        for (var i = 0; i < (dead ? 26 : 44); i++) {
          var a = -Math.PI / 2 + (r() - 0.5) * 1.9, len = h * (0.45 + r() * 0.5), x = w / 2 + (r() - 0.5) * 14, y = h - 2, bend = (r() - 0.5) * 0.9;
          g.strokeStyle = dead ? 'rgba(96,76,58,0.95)' : 'rgba(110,62,44,0.95)'; g.lineWidth = dead ? 2.2 - r() : 1.6; g.beginPath(); g.moveTo(x, y);
          var px = x, py = y, seg = 9;
          for (var k = 1; k <= seg; k++) {
            var t = k / seg, aa = a + bend * t; px = x + Math.cos(aa) * len * t; py = y + Math.sin(aa) * len * t; g.lineTo(px, py);
            if (!dead && k > 2) { g.save(); g.fillStyle = 'rgba(' + (112 + r() * 40 | 0) + ',' + (128 + r() * 36 | 0) + ',' + (92 + r() * 30 | 0) + ',0.85)'; for (var q = 0; q < 5; q++) { g.beginPath(); g.ellipse(px + (r() - 0.5) * 16, py + (r() - 0.5) * 14, 5 + r() * 5, 1.6, r() * 3, 0, Math.PI * 2); g.fill(); } g.restore(); }
            else if (dead && k > 3 && r() < 0.5) { g.moveTo(px, py); g.lineTo(px + (r() - 0.5) * 26, py - r() * 22); g.moveTo(px, py); }
          }
          g.stroke();
        }
      });
    }
    var bushMatA = new T.MeshLambertMaterial({ map: bushTex(false), alphaTest: 0.45, side: T.DoubleSide }), bushMatB = new T.MeshLambertMaterial({ map: bushTex(true), alphaTest: 0.45, side: T.DoubleSide });
    var bushGeo = new T.PlaneGeometry(1, 1); bushGeo.translate(0, 0.5, 0);
    var bushes = [];
    [[-6.2, 6.6, 1.9, 0], [-9.5, 2.2, 1.5, 0], [7.4, 7.2, 2.2, 0], [10.6, 1.4, 1.6, 1], [-3.4, 8.4, 1.2, 1], [4.2, -6.8, 1.8, 0], [-11.5, -4.5, 2.1, 0], [12.8, -6.5, 1.7, 1], [-14, 6.5, 1.4, 0], [1.2, 9.6, 1.1, 0], [15.5, 5.2, 1.9, 0], [-7.6, -10.5, 1.6, 1], [8.8, -12.5, 2.0, 0], [-17.5, -1.5, 1.8, 0]].forEach(function (b, n) {
      var g = new T.Group();
      for (var k = 0; k < 3; k++) { var m = new T.Mesh(bushGeo, b[3] ? bushMatB : bushMatA); m.rotation.y = k * Math.PI / 3 + n; m.scale.set(b[2] * 1.15, b[2], 1); m.castShadow = true; g.add(m); }
      g.position.set(b[0], ground.heightAt(b[0], b[1]) - 0.03, b[1]); g.userData.ph = n * 1.3; scene.add(g); bushes.push(g);
    });
    // dust in the light: slow motes over the camp (they are what makes a shaft of sun, and the grain of an old plate)
    var DM = 260, dmp = new Float32Array(DM * 3), dmr = lcg(15);
    for (var di = 0; di < DM; di++) { dmp[di * 3] = (dmr() - 0.5) * 26; dmp[di * 3 + 1] = 0.2 + dmr() * 5.5; dmp[di * 3 + 2] = (dmr() - 0.5) * 20 + 1; }
    var dmg = new T.BufferGeometry(); dmg.setAttribute('position', new T.BufferAttribute(dmp, 3));
    var motesDust = new T.Points(dmg, new T.PointsMaterial({ map: SC.tex.soft(), size: 0.075, color: 0xfff0d0, transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true, blending: T.AdditiveBlending }));
    motesDust.frustumCulled = false; scene.add(motesDust);
    // the shadow a heap of stones lays on the ground it sits on: it grows as the mound grows
    var shTex = P.canvasTex(128, 128, function (g, w) { var gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(30,16,8,0.62)'); gr.addColorStop(0.55, 'rgba(30,16,8,0.3)'); gr.addColorStop(1, 'rgba(30,16,8,0)'); g.clearRect(0, 0, w, w); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
    var moundShadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: shTex, transparent: true, opacity: 0, depthWrite: false }));
    moundShadow.rotation.x = -Math.PI / 2; moundShadow.position.set(0.1, 0.045, 0.15); moundShadow.renderOrder = 2; scene.add(moundShadow);
    var L = SC.lights(scene, { key: 0xfff0d4, keyI: 1.15, kx: 8, ky: 12, kz: 4, tx: 0, tz: 0, hemi: 0.55, amb: 0.16, shadowExtent: 17, shadowSize: 2048 });
    var lampLight = new T.PointLight(0xffb868, 0, 11, 1.7); scene.add(lampLight);
    var fire = SC.props.brazier(paint, { height: 0.7, intensity: 1.5, range: 12 });
    fire.position.set(2.5, 0, 1.9); scene.add(fire);

    // ---- stones that fly to their places: a mound is a list of stones, each with where it lay and where it belongs ----
    var stoneTex = P.canvasTex(128, 128, function (g, w, h) { g.fillStyle = '#c8c0b4'; g.fillRect(0, 0, w, h); var r = lcg(63); for (var i = 0; i < 1400; i++) { var v = r(); g.fillStyle = v < 0.5 ? 'rgba(255,250,240,0.16)' : 'rgba(40,30,22,0.16)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); } g.strokeStyle = 'rgba(50,36,26,0.25)'; for (var k = 0; k < 9; k++) { g.lineWidth = 0.6 + r(); g.beginPath(); var x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 60); g.stroke(); } });
    stoneTex.wrapS = stoneTex.wrapT = T.RepeatWrapping;
    function tints(list) { return list.map(function (c) { return paint({ map: stoneTex, color: c }, 0xffe0b0, 0.14); }); }
    var cobbleMats = tints([0xb09474, 0x9a8266, 0xbfa283, 0x8e7a66, 0xa98b6c]), blockMats = tints([0xa07c5c, 0x94705a, 0xae8a68, 0x8a6a52]), slabMats = tints([0xa88664, 0x9a7a5e, 0xb49270, 0x8c7058]);
    var cobbleMat = cobbleMats, blockMat = blockMats, slabMat = slabMats[0];
    function stoneGeo(kind, r) {
      var g = kind === 'cobble' ? new T.IcosahedronGeometry(1, 1) : new T.BoxGeometry(1.7, kind === 'slab' ? 0.5 : 1.0, 1.25, 2, 1, 2);
      var pa = g.attributes.position;
      for (var i = 0; i < pa.count; i++) { var x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), n = 0.86 + 0.3 * fbm(x * 1.7 + r * 9, y * 1.7 + z + r * 5, 3, 2, 0, 0); pa.setXYZ(i, x * n, y * (kind === 'cobble' ? 0.72 : 1) * (0.9 + 0.2 * n), z * n); }
      g.computeVertexNormals(); return g;
    }
    function buildMound(kind, layers, radii, y0, dy, size, seed, mat, scatterR) {
      var g = new T.Group(), r = lcg(seed), stones = [];
      layers.forEach(function (n, k) {
        for (var i = 0; i < n; i++) {
          var a = (i / n) * Math.PI * 2 + k * 0.7 + r() * 0.3, rad = radii[k] * (0.92 + r() * 0.16), s = size * (1 - k * 0.07) * (0.85 + r() * 0.3);
          var m = new T.Mesh(stoneGeo(kind, r()), Array.isArray(mat) ? mat[(r() * mat.length) | 0] : mat);
          m.scale.setScalar(s); m.castShadow = true; m.receiveShadow = true;
          var to = new T.Vector3(Math.cos(a) * rad, y0 + k * dy, Math.sin(a) * rad), sa = r() * Math.PI * 2, sr = scatterR[0] + r() * (scatterR[1] - scatterR[0]);
          var from = new T.Vector3(Math.cos(sa) * sr, s * 0.32, Math.sin(sa) * sr * 0.8 + 0.4);
          var st = { m: m, from: from, to: to, rf: new T.Euler(r() * 3, r() * 6, r() * 3), rt: new T.Euler((r() - 0.5) * 0.3, a + r(), (r() - 0.5) * 0.3), t: 0, go: false, delay: 0 };
          m.position.copy(from); m.rotation.copy(st.rf); g.add(m); stones.push(st);
        }
      });
      g.userData = { stones: stones, placed: 0 };
      scene.add(g); return g;
    }
    // I: a cone of river cobbles · II: squared blocks on three cut steps · III: a pyramid of flat slabs
    var mound1 = buildMound('cobble', [7, 6, 4, 3, 1], [0.78, 0.58, 0.4, 0.2, 0], 0.2, 0.3, 0.3, 11, cobbleMat, [1.5, 2.8]);
    var mound2 = buildMound('block', [5, 4, 3, 1], [0.5, 0.36, 0.2, 0], 1.15, 0.33, 0.24, 23, blockMat, [2.0, 3.2]);
    var mound3 = buildMound('slab', [6, 5, 4, 3, 2, 1], [0.86, 0.68, 0.5, 0.34, 0.18, 0], 0.16, 0.25, 0.3, 37, slabMats, [1.8, 3.0]);
    var mounds = [mound1, mound2, mound3];
    function placeStones(g, upTo, quick) {   // send the next stones home, a breath apart
      var st = g.userData.stones, d = 0;
      for (var i = g.userData.placed; i < Math.min(st.length, upTo); i++) { st[i].go = true; st[i].delay = quick ? 0 : d; d += 0.14; if (quick) st[i].t = 1; }
      g.userData.placed = Math.max(g.userData.placed, Math.min(st.length, upTo));
    }
    function resetMound(g) { g.userData.placed = 0; g.userData.stones.forEach(function (s) { s.t = 0; s.go = false; s.wob = 0; s.m.position.copy(s.from); s.m.rotation.copy(s.rf); }); }

    // ---- the three dressings ----
    var D = [new T.Group(), new T.Group(), new T.Group()];
    D.forEach(function (g) { scene.add(g); });
    var brassMat = new T.MeshStandardMaterial({ color: 0xc9973a, metalness: 0.8, roughness: 0.35 }), darkWood = paint({ color: 0x4a3220 });
    // the valve receiver: a wooden box, a dial, two knobs, a wire aerial, and a glow behind the dial when it wakes
    function buildRadio() {
      var g = new T.Group();
      var box = new T.Mesh(new T.BoxGeometry(0.62, 0.4, 0.3), darkWood); box.position.y = 0.2; box.castShadow = true; g.add(box);
      var dialTex = P.canvasTex(128, 96, function (c, w, h) { c.fillStyle = '#e8d9b0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a2a18'; c.lineWidth = 2; c.beginPath(); c.arc(w / 2, h * 0.92, h * 0.72, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); for (var i = 0; i < 9; i++) { var a = Math.PI * (1.15 + 0.7 * i / 8); c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * h * 0.72, h * 0.92 + Math.sin(a) * h * 0.72); c.lineTo(w / 2 + Math.cos(a) * h * 0.6, h * 0.92 + Math.sin(a) * h * 0.6); c.stroke(); } c.strokeStyle = '#8a2a1a'; c.beginPath(); c.moveTo(w / 2, h * 0.92); c.lineTo(w / 2 + 16, h * 0.3); c.stroke(); });
      var dialMat = new T.MeshBasicMaterial({ map: dialTex, color: 0x9a8f78 });
      var dial = new T.Mesh(new T.PlaneGeometry(0.3, 0.2), dialMat); dial.position.set(-0.1, 0.24, 0.152); g.add(dial);
      [0.14, 0.24].forEach(function (x) { var k = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.04, 10), brassMat); k.rotation.x = Math.PI / 2; k.position.set(x, 0.16, 0.16); g.add(k); });
      var aer = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 1.3, 5), brassMat); aer.position.set(0.26, 1.0, -0.1); aer.rotation.z = -0.12; g.add(aer);
      var glow = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); glow.position.set(-0.1, 0.3, 0.3); glow.scale.set(1.6, 1.6, 1); g.add(glow);
      var light = new T.PointLight(0xffb060, 0, 5, 2); light.position.set(-0.1, 0.4, 0.5); g.add(light);
      g.userData = { glow: glow, light: light, dialMat: dialMat, k: 0, on: 0 };
      return g;
    }
    function flatRock(x, z, s, seed) {   // a low water-worn boulder with a flat back: something to set an instrument on
      var g = new T.IcosahedronGeometry(1, 2), pa = g.attributes.position;
      for (var i = 0; i < pa.count; i++) { var px = pa.getX(i), py = pa.getY(i), pz = pa.getZ(i), n = 0.84 + 0.34 * fbm(px * 1.2 + seed * 3, py * 1.2 + pz + seed, 7, 3, 0, 0); pa.setXYZ(i, px * n, Math.min(py * n, 0.52) * 0.62, pz * n * 0.82); }
      g.computeVertexNormals();
      var m = new T.Mesh(g, slabMats[seed % slabMats.length]); m.scale.setScalar(s * 0.86); m.position.set(x, s * 0.12, z); m.rotation.y = seed; m.castShadow = m.receiveShadow = true; return m;
    }
    // plate I: the wash
    var radio1 = buildRadio(); radio1.position.set(2.7, 0.38, 0.7); radio1.rotation.y = -0.5; D[0].add(flatRock(2.7, 0.7, 1.0, 3), radio1);
    // plate II: the standing stone, three cut steps, the fire, the log
    var mono = new T.Mesh(new T.CylinderGeometry(0.75, 1.15, 13, 4, 6), paint({ map: SC.tex.strata(7), color: 0xd9b090 }, 0xffe0b0, 0.2)); mono.position.set(-5.5, 6.5, -9.5); mono.rotation.y = 0.6; mono.castShadow = true;
    var masonry = SC.tex.masonry ? SC.tex.masonry(5, 2, 3) : null; masonry = masonry && masonry.isTexture ? masonry : masonry && masonry.map && masonry.map.isTexture ? masonry.map : stoneTex;
    var steps = new T.Group(), stepMat = paint({ map: masonry, color: 0xb89878 }, 0xffe0b0, 0.15);
    [[2.7, 0], [2.1, 0.34], [1.5, 0.68]].forEach(function (s, i) { var m = new T.Mesh(new T.BoxGeometry(s[0], 0.34, s[0], 6, 1, 6), stepMat); (function (pa) { for (var q = 0; q < pa.count; q++) { var e = fbm(pa.getX(q) * 2.2 + i * 5, pa.getZ(q) * 2.2, 9, 2, 0, 0) - 0.5; pa.setXYZ(q, pa.getX(q) + e * 0.05, pa.getY(q) + (pa.getY(q) > 0 ? e * 0.035 : 0), pa.getZ(q) + e * 0.05); } m.geometry.computeVertexNormals(); })(m.geometry.attributes.position); m.position.y = s[1] + 0.17; m.rotation.y = 0.2; m.castShadow = m.receiveShadow = true; steps.add(m); });
    var radio2 = buildRadio(); radio2.position.set(3.5, 0.33, 0.5); radio2.rotation.y = -0.8;
    var logBook = new T.Group();
    var cover = new T.Mesh(new T.BoxGeometry(0.44, 0.05, 0.32), paint({ color: 0x5a2f1c })); var pages = new T.Mesh(new T.BoxGeometry(0.4, 0.04, 0.28), new T.MeshBasicMaterial({ color: 0xe9dcc0 })); pages.position.y = 0.04; logBook.add(cover, pages);
    logBook.position.set(1.5, 0.37, 2.9); logBook.rotation.y = 0.5;
    D[1].add(mono, steps, flatRock(3.5, 0.5, 0.86, 5), radio2, flatRock(1.5, 2.9, 0.95, 8), logBook);
    // plate III: the theodolite, the copper plate, the founders' groove, the watcher's rock
    var theo = new T.Group();
    [0, 1, 2].forEach(function (i) { var a = i * Math.PI * 2 / 3, leg = new T.Mesh(new T.CylinderGeometry(0.022, 0.03, 1.5, 6), darkWood); leg.position.set(Math.cos(a) * 0.3, 0.7, Math.sin(a) * 0.3); leg.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); leg.castShadow = true; theo.add(leg); });
    var head = new T.Group(); head.position.y = 1.42;
    var base = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.05, 16), brassMat), ringV = new T.Mesh(new T.TorusGeometry(0.15, 0.014, 6, 24), brassMat), scope = new T.Mesh(new T.CylinderGeometry(0.035, 0.045, 0.5, 10), brassMat);
    ringV.position.y = 0.2; scope.rotation.z = Math.PI / 2; scope.position.y = 0.2; head.add(base, ringV, scope); theo.add(head);
    // the horizontal circle with its vernier, three levelling screws, the eyepiece, a spirit level, and the plumb bob under it
    var circleH = new T.Mesh(new T.TorusGeometry(0.17, 0.012, 6, 32), brassMat); circleH.rotation.x = Math.PI / 2; circleH.position.y = 0.04; head.add(circleH);
    [0, 1, 2].forEach(function (i) { var a = i * Math.PI * 2 / 3 + 0.5, sc = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 0.09, 8), brassMat); sc.position.set(Math.cos(a) * 0.11, -0.06, Math.sin(a) * 0.11); head.add(sc); });
    var eyepiece = new T.Mesh(new T.CylinderGeometry(0.022, 0.03, 0.1, 10), brassMat); eyepiece.rotation.z = Math.PI / 2; eyepiece.position.set(-0.29, 0.2, 0); head.add(eyepiece);
    var level = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.16, 8), new T.MeshStandardMaterial({ color: 0xbfe8d0, metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.8 })); level.rotation.z = Math.PI / 2; level.position.set(0, 0.29, 0); head.add(level);
    var yokes = [-0.06, 0.06].map(function (z) { var y = new T.Mesh(new T.BoxGeometry(0.03, 0.2, 0.012), brassMat); y.position.set(0, 0.12, z); head.add(y); return y; });
    var bobLine = new T.Mesh(new T.CylinderGeometry(0.003, 0.003, 1.0, 4), darkWood); bobLine.position.y = 0.88; theo.add(bobLine);
    var bob = new T.Mesh(new T.ConeGeometry(0.035, 0.1, 10), brassMat); bob.rotation.x = Math.PI; bob.position.y = 0.34; theo.add(bob);
    var theoGlint = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xfff2c4, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); theoGlint.position.set(0.27, 0.2, 0); theoGlint.scale.set(0.5, 0.5, 1); head.add(theoGlint);
    theo.scale.setScalar(1.18);
    theo.position.set(2.5, 0, 1.3);
    head.rotation.y = (90 - 112) * Math.PI / 180;   // the scope's axis lies along x: turned to a bearing of 112° (north is -z)
    var plateTex = P.canvasTex(128, 128, function (c, w) {
      c.fillStyle = '#b8683a'; c.beginPath(); c.arc(w / 2, w / 2, 60, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#6a3418'; c.lineWidth = 3; c.beginPath(); c.arc(w / 2, w / 2, 52, 0, Math.PI * 2); c.stroke();
      c.save(); c.translate(w / 2, w / 2); c.rotate(112 * Math.PI / 180); c.beginPath(); c.moveTo(0, 30); c.lineTo(0, -40); c.moveTo(-9, -28); c.lineTo(0, -42); c.lineTo(9, -28); c.stroke(); c.restore();
      c.fillStyle = '#5a2c14'; c.font = '700 20px Cinzel, Georgia, serif'; c.textAlign = 'center'; c.fillText('112°', w / 2 - 18, w / 2 + 34);
    });
    var copper = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.03, 24), [paint({ color: 0xb8683a }), new T.MeshStandardMaterial({ map: plateTex, metalness: 0.7, roughness: 0.32, emissive: 0x4a2008, emissiveIntensity: 0.5 }), paint({ color: 0x8a4a26 })]);
    var copperGlint = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xffc890, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); copperGlint.scale.set(0.9, 0.9, 1); copperGlint.position.y = 0.08; copper.add(copperGlint);
    var COPPER_FROM = new T.Vector3(1.3, 0.22, 2.3), COPPER_TO = new T.Vector3(0.1, 0.05, 1.12);
    copper.position.copy(COPPER_FROM); copper.castShadow = true;
    var grooveMat = new T.MeshBasicMaterial({ color: 0x2a1a10, transparent: true, opacity: 0, depthWrite: false });
    var groove = new T.Mesh(new T.PlaneGeometry(0.085, 7.5), grooveMat); groove.rotation.x = -Math.PI / 2; groove.rotation.z = 12 * Math.PI / 180; groove.position.set(0, 0.05, 0.2); groove.renderOrder = 4;   // 348°: twelve degrees west of north
    // where his hand has brushed the sand away the bedrock shows paler, and the cut in it reads dark
    var brushTex = P.canvasTex(64, 512, function (g, w, h) { g.clearRect(0, 0, w, h); var r = lcg(27); for (var i = 0; i < 300; i++) { var y = r() * h, x = w / 2 + (r() + r() - 1) * w * 0.42, rad = 5 + r() * 12, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(236,214,186,0.5)'); gr.addColorStop(1, 'rgba(236,214,186,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); } });
    var brushMat = new T.MeshBasicMaterial({ map: brushTex, transparent: true, opacity: 0, depthWrite: false });
    var brushed = new T.Mesh(new T.PlaneGeometry(0.75, 7.5), brushMat); brushed.rotation.copy(groove.rotation); brushed.position.set(0, 0.042, 0.2); brushed.renderOrder = 3;
    // the ridge he stands on: a crag of piled rock, higher than the camp, with its own scree
    var watchRock = new T.Group();
    [[0, 0, 0, 4.4, 5], [1.8, 0, 1.6, 2.6, 9], [-2.2, 0, 1.2, 2.2, 13], [0.3, 3.4, -0.2, 2.5, 17], [-0.9, 0, 3.0, 1.3, 21]].forEach(function (q) { var rk = SC.props.rocks(paint, { seed: q[4], scale: q[3], count: 4 }); rk.position.set(q[0], q[1], q[2]); rk.rotation.y = q[4]; rk.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); watchRock.add(rk); });
    watchRock.position.set(-10.5, 0, -17);
    var watcher = SC.chars.elder(paint, {}); watcher.position.set(-10.2, 6.6, -16.6); watcher.rotation.y = Math.PI + 0.55; watcher.scale.setScalar(1.35); watcher.visible = false;
    var plateRock = flatRock(1.3, 2.3, 0.42, 6);
    D[2].add(theo, plateRock, copper, brushed, groove, watchRock, watcher);

    // ---- the man of 1998 (the same hands, twenty-eight years younger) ----
    var Hh = P.buildHermes(T, SC.tex.soft()), hermes = Hh.hermes;
    hermes.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(hermes);
    var HOME = [{ x: -1.5, z: 1.3 }, { x: -1.6, z: 1.5 }, { x: -1.5, z: 1.4 }];

    efx = null;
    try {
      if (window.EclipseFX) efx = window.EclipseFX.kit(renderer, scene, Hh, {
        look: { bloom: 0.5, threshold: 0.84, knee: 0.2, vignette: 0.6, grain: 0.085, ca: 0.3, sat: 0.1, contrast: 1.08, gain: [1.14, 1.0, 0.78], lift: [0.05, 0.035, 0.0] },
        printsOn: true, printLife: 40, sandColor: 0xdcbb8c, scale: 1, idle: 0.0014, heightAt: ground.heightAt
      });
    } catch (e) { efx = null; }
    var pp = efx && efx.post ? efx.post.params : null;
    var SEPIA = { sat: 0.1, vig: 0.6, grain: 0.085, gain: [1.14, 1.0, 0.78], lift: [0.05, 0.035, 0.0], bloom: 0.95 }, DAY = { sat: 1.04, vig: 0.34, grain: 0.03, gain: [1.06, 1.0, 0.93], lift: [0.012, 0.004, 0.0], bloom: 0.6 };

    var narrow = Math.max(1, 1.2 / aspect);
    orbitCtl = SC.orbit(canvas, camera, { dist: Math.min(22, 10.5 * narrow), minDist: 4, maxDist: 20, pitch: 0.17, minPitch: 0.02, maxPitch: 0.9, yawLimit: 1.1, yaw: 0.32, x: 0.4, y: 1.3, z: 0.3, groundY: 0.4 });
    function frame(x, y, z, d, yaw, pitch) { orbitCtl.setTarget(x, y, z); orbitCtl.state.tDist = Math.min(22, d * narrow); if (yaw != null) orbitCtl.state.tYaw = yaw; if (pitch != null) orbitCtl.state.tPitch = pitch; }

    // ---- the state of the dream ----
    var W = { plate: 0, blur: 5.5, tBlur: 5.5, dark: 0.62, tDark: 0.62, grade: 0, tGrade: 0, night: 0, tNight: 0, filter: '', radioOn: 0, coppered: 0, flashAt: -9, awake: false, gust: 3 };
    var walks = [], timers = [];
    function later(sec, fn) { timers.push({ t: sec, fn: fn }); }
    function adiff(a, b) { return ((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI; }
    function walkTo(x, z, face, then) { walks = [{ x: x, z: z, face: face == null ? null : face, then: then || null }]; }
    function faceXZ(x, z) { return Math.atan2(-(x - hermes.position.x), -(z - hermes.position.z)); }
    function gait(k) { if (efx && efx.gait && efx.gait.react) efx.gait.react(k); }
    var BLUR = [[5.5, 3.7, 2.1, 0.9], [5.5, 3.7, 2.1, 0.9], [5.5, 4.2, 2.9, 1.7, 0.8]];
    // where each fragment floats (world space, in its plate's dressing)
    var ANCHOR = {
      stones: [1.0, 0.55, 1.9], radio: [2.7, 1.25, 0.7], hands: [-1.35, 1.55, 1.15],
      monolith: [-5.5, 7.4, -9.5], steps: [0.95, 0.7, 1.35], log: [1.5, 0.95, 2.9],
      theodolite: [2.5, 2.05, 1.3], plate: [1.3, 0.7, 2.3], groove: [0.55, 0.3, 2.5], watcher: [-10.2, 9.7, -16.6]
    };
    function setPlate(i, quick) {
      W.plate = i;
      D.forEach(function (g, k) { g.visible = k === i; });
      mounds.forEach(function (g, k) { g.visible = k === i; if (k === i) resetMound(g); });
      fire.visible = i === 1; fire.userData.on = i === 1;
      walls.forEach(function (w) { w.visible = i !== 1; });   // the ridge stands above the wash: nothing behind the standing stone but the sky
      W.tNight = i === 1 ? 1 : 0; if (quick) W.night = W.tNight;
      W.tBlur = BLUR[i][0]; W.tDark = 0.62; if (quick) { W.blur = W.tBlur; W.dark = W.tDark; }
      W.radioOn = 0; W.coppered = 0; copper.position.copy(COPPER_FROM); copper.rotation.set(0, 0, 0); grooveMat.opacity = 0; grooveMat.userData.show = false; watcher.visible = false;
      hermes.visible = true; hermes.position.set(HOME[i].x, 0, HOME[i].z); hermes.rotation.y = faceXZ(0, 0);
      Hh.flame.visible = i === 1;
      walks = []; timers = [];
      var sun = i === 0 ? [0.55, 0.36, -0.4] : i === 1 ? [-0.5, 0.5, -0.7] : [0.7, 0.3, 0.3];
      skyObj.uniforms.uSun.value.set(sun[0], sun[1], sun[2]);
      L.key.position.set(sun[0] * 20, sun[1] * 20 + 4, sun[2] * 20 + 6);
      if (i === 0) frame(0.5, 1.2, 0.4, 10.5, 0.32, 0.17); else if (i === 1) frame(0.2, 1.9, -0.6, 12.5, 0.5, 0.1); else frame(0.4, 1.3, 0.4, 11, -0.3, 0.2);
      if (quick) { orbitCtl.state.dist = orbitCtl.state.tDist; orbitCtl.state.yaw = orbitCtl.state.tYaw; orbitCtl.state.pitch = orbitCtl.state.tPitch; }
    }
    function flash() { if (!film) return; film.flash.classList.remove('is-on'); void film.flash.offsetWidth; film.flash.classList.add('is-on'); }
    function stonesFor(i, n) { var g = mounds[i], total = g.userData.stones.length, parts = Object.keys(PLATES[i].fragments).length + 1; return Math.round(total * n / parts); }

    // ---- the lights she touches: buttons that float over the scene, each tied to a place in it ----
    function buildMotes() {
      motesBox.innerHTML = ''; moteEls = {};
      if (ns.stage !== 'plate' || ns.busy) return;
      openIds().forEach(function (id) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'dream-mote'; b.id = 'dream-mote-' + id;
        b.setAttribute('aria-label', 'A fragment of the memory: ' + plate().fragments[id].name);
        b.innerHTML = '<i></i><span>' + plate().fragments[id].name + '</span>';
        b.addEventListener('click', function (e) { e.stopPropagation(); find(id); });
        motesBox.appendChild(b); moteEls[id] = b;
      });
    }
    var tmpV = new T.Vector3();
    function placeMotes(t) {
      var Wd = canvas.clientWidth, Ht = canvas.clientHeight;
      for (var id in moteEls) {
        var a = ANCHOR[id], el = moteEls[id];
        tmpV.set(a[0], a[1] + (reducedMotion ? 0 : Math.sin(t * 1.3 + a[0] * 3) * 0.08), a[2]).project(camera);
        if (tmpV.z > 1) { el.style.opacity = '0'; continue; }
        var x = Math.max(28, Math.min(Wd - 28, (tmpV.x * 0.5 + 0.5) * Wd)), y = Math.max(64, Math.min(Ht - 84, (-tmpV.y * 0.5 + 0.5) * Ht));
        el.style.opacity = ''; el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
        // one that has waited a long time breathes a little brighter
        el.classList.toggle('is-calling', performance.now() - ns.idleAt > 30000);
      }
    }

    S3 = {
      motes: buildMotes,
      reset: function () { W.awake = false; W.grade = W.tGrade = 0; setPlate(0, true); buildMotes(); if (film) film.box.classList.remove('is-awake'); stage.classList.remove('is-awake'); },
      // the piece she touched comes clear: the blur lifts a step, and stones fly to the mound
      touched: function (id) {
        var n = foundCount();
        W.tBlur = BLUR[W.plate][Math.min(BLUR[W.plate].length - 1, n)]; W.tDark = Math.min(1, 0.62 + 0.09 * n);
        if (moteEls[id]) { var el = moteEls[id]; el.classList.add('is-burst'); el.disabled = true; setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700); delete moteEls[id]; }
        for (var k in moteEls) { moteEls[k].disabled = true; moteEls[k].classList.add('is-waiting'); }
        if (efx) efx.sparks.emit({ x: ANCHOR[id][0], y: ANCHOR[id][1], z: ANCHOR[id][2] }, 22, { color: 0xffe2a8, size: [0.07, 0.16], grow: 0.3, speed: [0.3, 1.4], up: [0.4, 1.6], life: [0.8, 1.6], alpha: 0.95, gravity: -0.6, drag: 0.6, spread: 0.5 });
        placeStones(mounds[W.plate], stonesFor(W.plate, n));
        // a memory hurried past still happens: the copper plate goes under the mound even if he was called away from it
        if (W.plate === 2 && id !== 'plate' && ns.found['plateau:plate'] && W.coppered === 0) W.coppered = 0.0001;
      },
      // the shutter: sharp, a flash, and the picture taken
      develop: function () {
        placeStones(mounds[W.plate], 999);
        if (W.plate === 2) { W.coppered = 1; copper.position.copy(COPPER_TO); copper.rotation.x = -0.5; grooveMat.opacity = 0.85; }
        W.tBlur = 0; W.blur = 0; W.tDark = 1; W.dark = 1; W.filter = ''; canvas.style.filter = '';
        flash();
        var url = null;
        try {
          if (efx) efx.render(scene, camera, 0); else renderer.render(scene, camera);
          var c = document.createElement('canvas'), k = 300 / Math.max(1, canvas.width); c.width = 300; c.height = Math.round(canvas.height * k);
          c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
          url = c.toDataURL('image/jpeg', 0.72);
        } catch (e) { url = null; }
        return url;
      },
      state: function () {
        return { scene: W.plate, blur: +W.blur.toFixed(2), tBlur: W.tBlur, grade: +W.grade.toFixed(2), night: +W.night.toFixed(2), tNight: W.tNight, awake: W.awake, placed: mounds.map(function (g) { return g.userData.placed; }), stones: mounds.map(function (g) { return g.userData.stones.length; }),
          motes: Object.keys(moteEls), watcher: watcher.visible, copper: +W.coppered.toFixed(2), hermes: [+hermes.position.x.toFixed(2), +hermes.position.z.toFixed(2)], sat: pp ? +pp.sat.toFixed(2) : null };
      },
      gfx: function () { return { T: T, scene: scene, camera: camera, renderer: renderer, hermes: hermes, mounds: mounds }; },
      // for looking at the set while it is being painted (not used by the story)
      debug: { plate: function (i) { setPlate(i, true); }, clear: function () { W.tBlur = W.blur = 0; W.tDark = W.dark = 1; }, grade: function (k) { W.tGrade = W.grade = k; }, frame: frame, build: function (i) { placeStones(mounds[i], 999, true); mounds[i].userData.stones.forEach(function (q) { q.m.position.copy(q.to); q.m.rotation.copy(q.rt); }); } },
      frames: function (n, dt) { for (var i = 0; i < (n || 1); i++) { clock.t += dt || 1 / 30; scene.userData.updaters.forEach(function (u) { u(clock.t, dt || 1 / 30); }); } },
      fx: {
        plate: function (i) { flash(); cue('paper'); setPlate(i, true); buildMotes(); },
        // what the man of 1998 does while Hermes tells it
        act: function (id) {
          if (id === 'stones') { walkTo(0.9, 1.7, faceXZ(0, 0), function () { gait('kneel'); cue('stone', { dur: 1.2 }); }); frame(0.5, 0.9, 0.9, 8.5); }
          else if (id === 'radio') { walkTo(1.9, 1.3, null, function () { hermes.rotation.y = faceXZ(2.7, 0.7); gait('listen'); }); W.radioOn = 0.35; frame(1.6, 1.1, 0.8, 8); }
          else if (id === 'hands') { walkTo(-1.2, 1.1, faceXZ(0, 0), function () { gait('offer'); later(1.4, function () { gait('offer'); }); }); frame(0, 1.2, 0.4, 8.5); }
          else if (id === 'monolith') { hermes.rotation.y = faceXZ(-5.5, -9.5); gait('wonder'); frame(-2.2, 3.6, -3.5, 16, 0.5, 0.02); later(5.5, function () { frame(0.2, 1.9, -0.6, 12.5, 0.5, 0.1); }); }
          else if (id === 'steps') { walkTo(-1.5, 1.6, faceXZ(0, 0), function () { gait('kneel'); }); frame(0.2, 0.9, 0.6, 8); }
          else if (id === 'log') { walkTo(1.2, 2.2, null, function () { hermes.rotation.y = faceXZ(1.5, 2.9); gait('kneel'); cue('paper'); }); frame(1.4, 0.9, 2.0, 7.5); }
          else if (id === 'theodolite') { walkTo(2.0, 2.0, null, function () { hermes.rotation.y = faceXZ(2.5, 1.3); gait('listen'); cue('lens'); }); frame(2.0, 1.4, 1.4, 8); }
          else if (id === 'plate') { walkTo(0.9, 1.9, faceXZ(0.1, 1.0), function () { gait('kneel'); [0.5, 0.9, 1.3].forEach(function (d) { later(d, function () { cue('tick', { f: 1500, v: 0.1 }); }); }); later(1.7, function () { W.coppered = 0.0001; cue('thud'); }); }); frame(0.5, 0.7, 1.4, 7.5); }
          else if (id === 'groove') { walkTo(0.9, 2.6, faceXZ(0.3, 1.5), function () { gait('kneel'); cue('stone', { dur: 0.9 }); }); grooveMat.userData.show = true; frame(0.3, 0.6, 1.6, 8, -0.15, 0.42); }
          else if (id === 'watcher') { hermes.rotation.y = faceXZ(0, 0); frame(-5.5, 5.6, -9, 15, -0.42, 0.06); if (watcher.userData.react) watcher.userData.react('nod'); later(7, function () { frame(0.4, 1.3, 0.4, 11, -0.3, 0.2); }); }
        },
        watcherComes: function () { flash(); watcher.visible = true; frame(-4.5, 4.8, -8, 16, -0.4, 0.05); cue('dusk'); later(4.2, function () { frame(0.4, 1.3, 0.4, 11, -0.3, 0.2); buildMotes(); }); },
        radioWakes: function () { W.radioOn = 1; cue('crack', { v: 0.25 }); later(0.5, function () { cue('shimmer', { deg: 3 }); }); walkTo(2.4, 1.2, null, function () { hermes.rotation.y = faceXZ(3.5, 0.5); }); frame(2.4, 1.0, 0.8, 7.5, 0.55, 0.12); },
        radioSpeaks: function () { W.radioOn = 1.6; cue('bell', { f: 660, v: 0.07, len: 2.4 }); },
        pastReact: function (k) { gait(k === 'nod' ? 'nod' : k); if (k === 'kneel') hermes.rotation.y = faceXZ(0, 0); later(3, function () { W.radioOn = 0.2; }); },
        // the dream lets go: the colour comes back; dusk at the edge of the hardpan, today
        wake: function () {
          W.awake = true; W.tGrade = 1; W.tNight = 0; W.tBlur = 0; W.tDark = 1;
          if (film) film.box.classList.add('is-awake'); stage.classList.add('is-awake');
          flash(); D.forEach(function (g) { g.visible = false; }); mounds.forEach(function (g) { g.visible = false; });
          watcher.visible = false; Hh.flame.visible = true;
          skyObj.uniforms.uSun.value.set(-0.78, 0.1, 0.25);
          L.key.position.set(-19, 4.2, 6);
          walkTo(-0.6, 1.0, null, function () { gait('wonder'); });
          frame(-0.4, 1.4, 0.8, 9.5, 0.2, 0.14);
          cue('reveal');
        },
        five: function () { frame(0.2, 1.7, 0.4, 12, 0.1, 0.16); }
      }
    };

    var c0 = new T.Color(), c1 = new T.Color();
    var updaters = [function (t, dt) {
      skyObj.uniforms.uTime.value = t;
      // the timeline (what is due is taken out first: a step may clear or refill the list)
      var due = [];
      timers = timers.filter(function (q) { q.t -= dt; if (q.t <= 0) { due.push(q.fn); return false; } return true; });
      due.forEach(function (f) { f(); });
      // he walks where the memory sends him
      if (walks.length) {
        var w = walks[0], dx = w.x - hermes.position.x, dz = w.z - hermes.position.z, d = Math.hypot(dx, dz);
        if (d > 0.05) { var step = Math.min(d, 1.5 * dt); hermes.position.x += dx / d * step; hermes.position.z += dz / d * step; hermes.rotation.y += adiff(Math.atan2(-dx, -dz), hermes.rotation.y) * Math.min(1, dt * 5); }
        else if (w.face != null && Math.abs(adiff(w.face, hermes.rotation.y)) > 0.04) hermes.rotation.y += adiff(w.face, hermes.rotation.y) * Math.min(1, dt * 5);
        else { walks.shift(); if (w.then) w.then(); }
      }
      hermes.position.y = ground.heightAt(hermes.position.x, hermes.position.z);
      // stones on their way home: a low arc, a turn, and a small knock when each one lands
      var g = mounds[W.plate], landed = false;
      g.userData.stones.forEach(function (s) {
        if (!s.go || s.t >= 1) return;
        if (s.delay > 0) { s.delay -= dt; return; }
        s.t = Math.min(1, s.t + dt / 0.85);
        var e = s.t * s.t * (3 - 2 * s.t);
        s.m.position.lerpVectors(s.from, s.to, e); s.m.position.y += Math.sin(Math.PI * s.t) * 0.9;
        s.m.rotation.set(s.rf.x + (s.rt.x - s.rf.x) * e, s.rf.y + (s.rt.y - s.rf.y) * e, s.rf.z + (s.rt.z - s.rf.z) * e);
        if (s.t >= 1) {
          landed = true; s.wob = 1;
          if (efx && !reducedMotion) efx.dust.emit({ x: s.to.x, y: s.to.y, z: s.to.z }, 4, { size: [0.16, 0.34], speed: [0.25, 0.7], up: [0.1, 0.45], life: [0.6, 1.2], alpha: 0.34, gravity: -0.5, spread: 0.2, color: 0xdcbb8c });
        }
      });
      // a stone just set down rocks once or twice before it lies still
      g.userData.stones.forEach(function (s) {
        if (!(s.wob > 0)) return;
        s.wob = Math.max(0, s.wob - dt * 2.4);
        var k = reducedMotion ? 0 : Math.sin((1 - s.wob) * 17) * 0.1 * s.wob * s.wob;
        s.m.rotation.set(s.rt.x + k, s.rt.y, s.rt.z - k * 0.7); s.m.position.y = s.to.y + Math.abs(k) * 0.12;
      });
      if (landed) cue('tick', { f: 420 + Math.random() * 160, v: 0.07 });
      // its shadow on the ground grows with it
      var frac = g.userData.stones.length ? g.userData.stones.filter(function (q) { return q.t >= 1; }).length / g.userData.stones.length : 0;
      var shS = (W.plate === 1 ? 4.6 : 3.3) * (0.55 + 0.45 * frac);
      moundShadow.scale.set(shS, shS, 1); moundShadow.material.opacity += ((g.visible ? 0.25 + 0.6 * frac : 0) * (1 - 0.5 * W.night) - moundShadow.material.opacity) * Math.min(1, dt * 3);
      // the copper plate slides under the foundation stones
      if (W.coppered > 0 && W.coppered < 1) { W.coppered = Math.min(1, W.coppered + dt / 1.2); var ce = W.coppered * W.coppered * (3 - 2 * W.coppered); copper.position.lerpVectors(COPPER_FROM, COPPER_TO, ce); copper.position.y += Math.sin(Math.PI * W.coppered) * 0.35; copper.rotation.x = -0.5 * ce; }
      if (grooveMat.userData.show && W.plate === 2) grooveMat.opacity = Math.min(0.9, grooveMat.opacity + dt * 0.5); else if (W.plate !== 2) grooveMat.userData.show = false;
      brushMat.opacity = Math.min(0.75, grooveMat.opacity * 0.85);
      // brass and copper catch the low sun now and then
      theoGlint.material.opacity = W.plate === 2 && !W.awake ? Math.max(0, Math.sin(t * 0.9) * Math.sin(t * 2.3)) * 0.85 : 0;
      copperGlint.material.opacity = W.plate === 2 ? (W.coppered > 0 && W.coppered < 1 ? 0.8 : Math.max(0, Math.sin(t * 1.3 + 1)) * 0.3) : 0;
      bob.rotation.z = reducedMotion ? 0 : Math.sin(t * 1.9) * 0.05; bobLine.rotation.z = bob.rotation.z;
      // the receiver: a faint glow behind its dial; brighter when the dream speaks through it
      [radio1, radio2].forEach(function (r) { var u = r.userData; u.k += (W.radioOn - u.k) * Math.min(1, dt * 3); var fl = 0.8 + 0.2 * Math.sin(t * 17) * Math.sin(t * 5.3); u.glow.material.opacity = Math.min(0.9, u.k * 0.5 * fl); u.light.intensity = u.k * 0.9 * fl; u.dialMat.color.setRGB(0.6 + 0.4 * Math.min(1, u.k), 0.56 + 0.3 * Math.min(1, u.k), 0.47); });
      if (fire.visible) {
        fire.userData.update(t, 0.7, 1);
        // sparks that climb and die, and a thin smoke leaning with the night air
        if (efx && !reducedMotion) {
          if (Math.random() < dt * 9) efx.sparks.emit({ x: 2.5 + (Math.random() - 0.5) * 0.2, y: 1.0, z: 1.9 }, 1, { color: 0xffb060, size: [0.03, 0.07], grow: 0.1, speed: [0.05, 0.3], up: [0.9, 2.2], life: [0.9, 2.2], alpha: 0.95, gravity: 0.25, drag: 0.5, spread: 0.12 });
          if (Math.random() < dt * 5) efx.dust.emit({ x: 2.5, y: 1.25, z: 1.9 }, 1, { size: [0.22, 0.4], grow: 1.3, speed: [0.05, 0.2], up: [0.5, 0.9], life: [2.2, 3.6], alpha: 0.16, gravity: 0.1, drag: 0.3, spread: 0.1, fadeIn: 0.3, color: 0x8a8078 });
        }
      }
      // dust in the light: the motes drift and turn; a gust lifts the sand of the wash now and then
      if (!reducedMotion) {
        var da = motesDust.geometry.attributes.position.array;
        for (var dk = 0; dk < da.length; dk += 3) { da[dk] += dt * (0.12 + 0.05 * Math.sin(t * 0.5 + dk)); da[dk + 1] += Math.sin(t * 0.7 + dk * 1.3) * dt * 0.05; if (da[dk] > 13) da[dk] -= 26; }
        motesDust.geometry.attributes.position.needsUpdate = true;
        W.gust -= dt;
        if (W.gust <= 0 && efx) {
          W.gust = 5 + Math.random() * 7;
          var gz = -6 + Math.random() * 13;
          for (var gk = 0; gk < 12; gk++) efx.dust.emit({ x: -13 + gk * 1.1 + Math.random(), y: 0.12, z: gz + Math.sin(gk * 0.7) * 1.2 }, 2, { size: [0.3, 0.7], grow: 1.2, speed: [1.2, 2.4], up: [0.05, 0.3], life: [1.4, 2.6], alpha: 0.2, gravity: -0.05, drag: 0.25, spread: 0.5, fadeIn: 0.3, color: 0xdcbb8c });
        }
        bushes.forEach(function (bq) { bq.rotation.z = Math.sin(t * 1.1 + bq.userData.ph) * 0.025 + Math.sin(t * 2.7 + bq.userData.ph) * 0.012; });
      }
      motesDust.material.opacity = 0.5 * (1 - 0.75 * W.night);
      if (watcher.visible && watcher.userData.update) { watcher.userData.update(t); watcher.userData.look({ x: hermes.position.x, y: 1.5, z: hermes.position.z }); }
      // night on the ridge, day elsewhere; and at the end the dusk of today
      W.night += (W.tNight - W.night) * Math.min(1, dt * 1.6);
      var nk = W.night;
      L.key.intensity = (1.15 - 0.95 * nk) * (W.awake ? 1.05 : 1); L.hemi.intensity = (0.55 - 0.45 * nk) * (W.awake ? 0.8 : 1); L.amb.intensity = 0.16 - 0.13 * nk;
      c0.setHex(W.awake ? 0xffb070 : 0xfff0d4); c1.setHex(0x8fa8ff); L.key.color.copy(c0).lerp(c1, nk);
      stars.material.opacity = nk * (0.85 + 0.1 * Math.sin(t * 1.7));
      ridgeMeshes.forEach(function (m) { m.material.color.setRGB(1 - 0.9 * nk, 1 - 0.88 * nk, 1 - 0.8 * nk); });   // far mesas: only a darker dark under the stars
      mono.material.color.setHex(0xd9b090).multiplyScalar(1 - 0.62 * nk);   // the standing stone: a dark shape against the stars
      milky.material.opacity = nk * 0.62; milkGlow.forEach(function (q, qi) { q.material.opacity = nk * (0.2 + 0.03 * Math.sin(t * 0.3 + qi)); });
      // the lamp he carries: lit at night by the fire, and at dusk when he wakes
      Hh.lamp.getWorldPosition(tmpV); lampLight.position.copy(tmpV);
      lampLight.intensity += (((nk > 0.5 || W.awake) ? 1.25 + 0.15 * Math.sin(t * 11) : 0) - lampLight.intensity) * Math.min(1, dt * 2);
      c0.setHex(W.awake ? 0x5a6fa8 : 0x7fa6c8); c1.setHex(0x05081c); skyObj.uniforms.uZenith.value.copy(c0).lerp(c1, nk);
      c0.setHex(W.awake ? 0xf0a878 : 0xe9d2ae); c1.setHex(0x101a3a); skyObj.uniforms.uMid.value.copy(c0).lerp(c1, nk);
      c0.setHex(W.awake ? 0xf4b480 : HORIZON); c1.setHex(0x1a2244); skyObj.uniforms.uHorizon.value.copy(c0).lerp(c1, nk); scene.fog.color.copy(skyObj.uniforms.uHorizon.value);
      // at night the clouds go dark and the low glow of the day is only a paleness in the west
      skyObj.uniforms.uCloudK.value = 0.5 - 0.44 * nk; c0.setHex(0xffd9a0); c1.setHex(0x1c2a55); skyObj.uniforms.uGlow.value.copy(c0).lerp(c1, nk);
      // the grade: an old photograph, until he wakes
      W.grade += (W.tGrade - W.grade) * Math.min(1, dt * 0.55);
      if (pp) {
        var gk = W.grade;
        pp.bloom = SEPIA.bloom + (DAY.bloom - SEPIA.bloom) * gk;
        pp.sat = SEPIA.sat + (DAY.sat - SEPIA.sat) * gk; pp.vignette = SEPIA.vig + (DAY.vig - SEPIA.vig) * gk; pp.grain = SEPIA.grain + (DAY.grain - SEPIA.grain) * gk;
        // the night on the ridge is printed dark (and, were it in colour, blue): the fire and the stars are all its light
        var NIGHT = [0.5 - 0.04 * gk, 0.54, 0.6 + 0.14 * gk];
        pp.gain = [0, 1, 2].map(function (i) { return (SEPIA.gain[i] + (DAY.gain[i] - SEPIA.gain[i]) * gk) * (1 + (NIGHT[i] - 1) * W.night); });
        pp.contrast = 1.08 + 0.1 * W.night;
        pp.lift = [0, 1, 2].map(function (i) { return SEPIA.lift[i] + (DAY.lift[i] - SEPIA.lift[i]) * gk; });
      }
      // the blur of a plate not yet developed
      W.blur += (W.tBlur - W.blur) * Math.min(1, dt * 1.6); W.dark += (W.tDark - W.dark) * Math.min(1, dt * 1.6);
      var b = Math.round(W.blur * 4) / 4, dk = Math.round(W.dark * 50) / 50;
      var f = (b > 0.1 ? 'blur(' + b + 'px) ' : '') + (dk < 0.99 ? 'brightness(' + dk + ')' : '') + (!pp && W.grade < 0.5 ? ' sepia(0.85) saturate(0.7)' : '');
      if (f !== W.filter) { W.filter = f; canvas.style.filter = f; }
      if (efx) {
        if (efx.gait) { efx.gait.speak(false); efx.gait.look(W.radioOn > 0.9 ? { x: 3.5, y: 0.6, z: 0.5 } : walks.length ? null : { x: 0, y: 0.9, z: 0 }); }
        efx.frame(dt, camera);
      }
      placeMotes(t);
    }];
    scene.userData.updaters = updaters;

    setPlate(0, true);
    startLoop();
  }

  function startLoop() { if (animId || !renderer) return; clock.last = performance.now(); loop(); }
  function stopLoop() { if (animId) cancelAnimationFrame(animId); animId = null; }
  function loop() {
    if (!renderer || !scene || !camera) return;
    animId = requestAnimationFrame(loop);
    var now = performance.now(), dt = Math.min(0.05, (now - clock.last) / 1000);
    clock.last = now; clock.t += dt;
    scene.userData.updaters.forEach(function (u) { u(clock.t, dt); });
    if (orbitCtl) orbitCtl.update(dt, !reducedMotion);
    if (efx) efx.render(scene, camera, dt); else renderer.render(scene, camera);
  }
  function handleResize() {
    if (!renderer || !camera || !canvas) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', function () { if (modal.style.display !== 'none') handleResize(); });

  // ---------------------------------------------------------------------
  // 3. OPEN / CLOSE
  // ---------------------------------------------------------------------
  var returnFocusTo = null;
  function open(onDone, opts) {
    ns.onDone = typeof onDone === 'function' ? onDone : null;
    ns.replay = !!(opts && opts.replay) || isDone();
    if (sfx.playMechanicalClick) sfx.playMechanicalClick();
    returnFocusTo = document.activeElement;
    modal.style.display = 'flex';
    modal.classList.remove('closing');
    setup3D();
    handleResize();
    startLoop();
    start();
  }
  function close(andContinue) {
    if (modal.style.display === 'none') return;
    chat.reset();
    ns.busy = false; speaking = null; ns.stage = ns.stage === 'done' ? 'done' : 'idle';
    if (motesBox) motesBox.innerHTML = '';
    if (sfx.playMechanicalClick) sfx.playMechanicalClick();
    modal.classList.add('closing');
    setTimeout(function () { modal.style.display = 'none'; modal.classList.remove('closing'); stopLoop(); }, 220);
    if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
    returnFocusTo = null;
    var cb = andContinue ? ns.onDone : null;
    ns.onDone = null;
    if (cb) setTimeout(cb, 260);
  }
  if (closeBtn) closeBtn.addEventListener('click', function () { close(ns.stage === 'done'); });
  if (finishBtn) finishBtn.addEventListener('click', function () { close(true); });
  function onTop() { var el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2); return !el || modal.contains(el); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.style.display !== 'none' && onTop()) close(ns.stage === 'done'); });

  // The Field Wire asks: has the dream been lived yet? (Only once Cairn III is behind him.)
  window.needsStonesDream = function () { return get('order_sandstone_labyrinth_completed') === 'true' && !isDone(); };
  window.openStonesDreamModal = open;
  window.StonesDream = { KEY: KEY, saved: saved, done: isDone, answer: function (k) { return saved()[k] || null; } };
  window.__stonesDream = {
    plates: PLATES.map(function (p) { return { id: p.id, fragments: Object.keys(p.fragments), choices: Object.keys(p.choices), key: p.key }; }),
    fast: function () { chat.fast = true; window.__dreamFast = true; }, slow: function () { chat.fast = false; window.__dreamFast = false; },
    find: function (id) { return find(id); }, pick: function (id) { return pick(id); }, open: function () { return openIds(); },
    state: function () { return Object.assign({ stage: ns.stage, busy: ns.busy, plate: ns.plate, found: Object.keys(ns.found), answers: Object.assign({}, ns.answers), replay: ns.replay, gl: !!S3, photos: platesEl ? platesEl.querySelectorAll('img').length : 0 }, S3 ? S3.state() : {}); },
    gfx: function () { return S3 ? S3.gfx() : null; }, frames: function (n, dt) { if (S3) S3.frames(n, dt); },
    debug: function () { return S3 ? S3.debug : null; }, fx: function (name) { if (S3 && S3.fx[name]) S3.fx[name].apply(null, [].slice.call(arguments, 1)); }
  };
})();
