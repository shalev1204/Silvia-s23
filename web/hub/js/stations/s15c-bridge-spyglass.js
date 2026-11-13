// =========================================================================
// 🔭 THE SPYGLASS ON THE NATURAL BRIDGE · between the hardpan and Cairn IV (Station 16's overture)
// The two printed pages “The Natural Bridge of the Sentinel Mesa” and “The Eastern Buttress & Lower Wash”, lived.
// Dawn. Hermes lies at the lip of the stone span, 380 varas above the Lower Wash, and hands Silvia his spyglass:
// she drags a brass lens over the gorge and holds it still on what matters; Hermes tells her what he sees.
// It is not a game: nothing can be lost. What she finds, and what she tells him to do when four raiders climb back
// toward the bridge, is remembered (order_bridge_spyglass) and comes back on the Field Wire and at Cairn IV.
//   · the pillars heard through the glass   -> the first note of “the song of the pillars” (EclipseHints.grant)
//   · hiding under the lip of the bridge    -> the first note of “the sigil of the seven echoes”
// Station 16 opens this scene once, on arrival (s16-cairn-iv.js: needsBridgeSpyglass / openBridgeSpyglassModal).
// One unit is about one vara. North is -z, east is +x; the gorge runs north to south under the bridge.
// =========================================================================
(function initBridgeSpyglass() {
  'use strict';
  var modal = document.getElementById('modal-bridge-spyglass');
  if (!modal) return;
  var T = window.THREE, P = window.EclipsePaint, SC = window.EclipseScenery;
  var sfx = window.sfx || {};
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var $ = function (id) { return document.getElementById(id); };

  var canvas = $('spy-canvas'), stage = $('spy-stage'), logEl = $('spy-log'), choicesBox = $('spy-choices');
  var subtitle = $('spy-subtitle'), closeBtn = $('btn-close-spy'), finishCard = $('spy-finish-card'), finishBtn = $('btn-spy-finish');
  var finishBody = $('spy-finish-body'), sightsEl = $('spy-sights'), sightsCount = $('spy-sights-count'), hintBtn = $('btn-spy-hint');
  var hudTime = $('spy-hud-time');

  var KEY = 'order_bridge_spyglass';
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
  // stage: idle | intro | glass (free sweep) | event (the shout: look at the second turn) | split (it plays) | asking | outro | done
  var ns = { stage: 'idle', busy: false, seen: {}, order: [], boon: [], onDone: null, replay: false, choice: null, hintAt: null, hintN: 0, eventDue: false, lastFind: 0 };
  var S3 = null;   // the 3D scene's hooks (null when WebGL is missing: the glass becomes a list of things to look at)
  var speaking = null;

  var chat = window.EclipseChat.create({
    log: logEl, cast: CAST, subtitle: subtitle, stage: stage,
    onSpeak: function (who) { speaking = who; }
  });
  // a click on the words hurries the line in flight (never the whole scene)
  if (logEl) logEl.addEventListener('click', function () { if (ns.busy && !window.__spyFast) { chat.fast = true; setTimeout(function () { if (!window.__spyFast) chat.fast = false; }, 400); } });

  var H = function (t, x) { var o = { who: 'hermes', say: t }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var nar = function (t, x) { var o = { narr: t }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var fx = function (name) { var a = [].slice.call(arguments, 1); return function () { if (S3 && S3.fx[name]) S3.fx[name].apply(null, a); }; };
  function setMission(t) { var m = $('spy-mission-text'); if (m) m.textContent = t; }
  function grant(id, n) { if (ns.replay) return; if (window.EclipseHints && window.EclipseHints.grant && window.EclipseHints.grant(id, n)) ns.boon.push(id); }

  // What the glass can find. dir is filled by the scene (where it lies from Hermes's eye); zoom is the least
  // magnification that shows it (0, 1, 2); r the half-angle (degrees) inside which the lens is "on" it.
  var SIGHTS = {
    wagons: {
      icon: '🛞', name: 'The wedged wagon', zoom: 0, r: 2.6, where: 'the terraces under us, a little east of south',
      lines: function () { return [
        H('Three wagons on the terraces, Silvia, and the first is wedged across the second turn. One wheel hangs over the drop.'),
        H('The shepherd said it, and your page says it: the turns are too tight for a loaded wagon.')
      ]; }
    },
    oilcloth: {
      icon: '🔥', name: 'The mark on the oilcloth', zoom: 1, r: 1.7, where: 'the last wagon, higher up the same terrace',
      lines: function () { return [
        H('The last wagon is covered with oilcloth, and two men guard it with their backs to the others.'),
        H('There is a mark burned into the cloth: a bird with its wings up, rising out of three flames. The BC Ashes.'),
        H('I know what lies under that cloth, Silvia. I mended it with my own hands.')
      ]; }
    },
    stone: {
      icon: '◐', name: 'Survey stone 980', zoom: 1, r: 1.6, where: 'the eastern rim, to the north-east',
      lines: function () { return [
        H('On the eastern rim, a survey stone of the founders: the half-lit disc of the Order, and under it 980.'),
        H('Nine hundred and eighty varas, the height of the Mesa behind me. They levelled this whole gorge by eye, and my brass and glass can find no fault in it.')
      ]; }
    },
    boulders: {
      icon: '🪨', name: 'The boulders of 1971', zoom: 0, r: 4.5, where: 'straight down, in the Lower Wash',
      lines: function () { return [
        H('Straight down: 380 varas of air, and the Lower Wash full of boulders. Each one is the size of a house.', { fx: fx('vertigo') }),
        H('They fell in the autumn of 1971. The same earthquake that broke the hanging bridge at my Observatory.'),
        nar('Hermes lowers the glass for a moment. Then he lifts it again.', { fx: fx('breath') })
      ]; }
    },
    tower: {
      icon: '🏛️', name: 'Tower II, far away', zoom: 1, r: 1.5, where: 'the horizon, exactly north-east',
      lines: function () { return [
        H('North-east, on the edge of the world: the Sandstone Sanctuary. From here it is no bigger than a grain of rice.'),
        H('The Servant is alone in there, by his brazier, waiting for five seals.')
      ]; }
    },
    pillars: {
      icon: '🎶', name: 'The pillars of Cairn IV', zoom: 2, r: 1.1, where: 'the far end of the gorge, due south',
      lines: function () { return [
        nar('Far to the south, where the gorge opens, two pale columns stand in the first light. The wind carries a low note up the canyon, and then a higher one.', { fx: fx('pillarsSing') }),
        H('Cairn IV. The twin pillars, still standing. And listen, Silvia: one pillar calls, and a moment later the cliff answers it.'),
        H('The longer the silence between the call and the answer, the farther away the fissure that sings back. I will count it in beats when I get there.')
      ]; },
      done: function () { grant('s16-song', 1); }
    },
    hairpin: {
      icon: '👣', name: 'Four men on foot', zoom: 1, r: 2.4, event: true, where: 'the second turn of the terraces, where the wagon is wedged',
      lines: function () { return [
        nar('Their leader points at the wheel over the drop, then up at the rim. Four men shoulder their packs.', { fx: fx('splitStart') }),
        H('They are giving up the terraces. Four of them are coming back up on foot. Up here, Silvia. Toward the bridge.'),
        nar('Below them, the drivers back the wagons out of the turn, one by one, and point their camels north-east.', { fx: fx('wagonsTurn') }),
        H('And the wagons are turning round, the covered one in the middle. North-east: that road leads to Tower II.'),
        H('Four men, and one bridge with no cover on it. They will reach the rim before the sun clears it. What do I do?')
      ]; }
    },
    blue: {
      icon: '💙', name: 'A smear of blue', zoom: 2, r: 0.9, secret: true, where: '',
      lines: function () { return [
        H('Wait. On the survey stone of the western abutment... a smear of blue, no wider than my thumb.'),
        H('The same blue as the rim of the niche at Cairn II. Somebody crossed this bridge before me, Silvia, and wanted it known.')
      ]; }
    }
  };
  var ORDER = ['wagons', 'oilcloth', 'hairpin', 'stone', 'boulders', 'tower', 'pillars'];   // the tracker (the secret adds itself)
  var HINT_ORDER = ['wagons', 'oilcloth', 'stone', 'boulders', 'tower', 'pillars'];

  var CHOICES = {
    cross: {
      icon: '🏃', label: 'Cross now, before they reach the rim.', say: 'Go now, Hermes. Cross while they are still climbing.',
      lines: function () { return [
        nar('Hermes shuts the spyglass and steps out onto the bare back of the bridge.', { fx: fx('crossStart') }),
        nar('He crosses bent low, with 380 varas of dawn air on either side. Halfway over, a stone turns under his boot and rattles down into the gorge.', { fx: fx('crossFar'), hold: 1800 }),
        H('I am over, Silvia. I am on the Mesa, behind the first rocks. They did not see me.', { fx: fx('crossEnd') }),
        H('But they heard the stone, and they will find my tracks at the eastern end. Let them follow: I have the head start, and the pillars are singing me the way.')
      ]; },
      epilogue: 'Hermes crossed the bridge in the open while the four raiders were still climbing. They are behind him now, on his tracks.'
    },
    hide: {
      icon: '🫥', label: 'Hide under the lip of the bridge. Let them pass.', say: 'Don’t move from there, Hermes. Get under the lip of the bridge and let them pass over you.',
      lines: function () { return [
        nar('Hermes slides down to a ledge under the lip of the span and presses his back to the stone.', { fx: fx('hideStart') }),
        nar('Boots pass over his head, close enough to count: four men, and one of them limps.', { fx: fx('bootsPass'), hold: 2600 }),
        H('They stopped right above me, Silvia. They found my prints in the dust and could not agree where they led.'),
        nar('While he waits, the wind brings the song of the pillars up the gorge: a call, a silence, an answer.', { fx: fx('pillarsSing') }),
        H('I had nothing to do but listen. Each pillar calls, and its echo comes home from its own side of the gorge. Count the beats in between, and you know how far the cliff is.'),
        H('They have gone on across, toward the Mesa. I will walk behind my own hunters. It is the last place they will look.', { fx: fx('hideEnd') })
      ]; },
      done: function () { grant('s16-sigil', 1); },
      epilogue: 'Hermes lay under the lip of the bridge while four raiders walked over his head. Now he walks behind them.'
    },
    trail: {
      icon: '👣', label: 'Lay a false trail along the rim.', say: 'Fool them, Hermes. Leave them a trail along the eastern rim, toward the survey stone, and cross on bare rock.',
      lines: function () { return [
        nar('Hermes walks to the survey stone with heavy steps, pressing every boot into the dust. He leaves a strip of his blue cloak under a pebble on top of it.', { fx: fx('trailStart'), hold: 1500 }),
        nar('Then he comes back along the bare rock, where nothing takes a print, and lies down behind the fallen blocks.', { fx: fx('trailBack') }),
        nar('The four men reach the rim, find the prints, and follow them north along the edge, away from the bridge.', { fx: fx('trailFooled'), hold: 2200 }),
        H('They are walking to the stone 980, Silvia, after a man who is not there. I am crossing now, quietly, behind their backs.', { fx: fx('crossQuiet') }),
        H('I owe my cloak a patch. It was worth it.')
      ]; },
      epilogue: 'Hermes sent four raiders north along the rim after a strip of blue cloth, and crossed the bridge behind their backs.'
    }
  };

  // ---- the tracker: what the glass has found ----
  function renderSights() {
    if (!sightsEl) return;
    sightsEl.innerHTML = '';
    var list = ORDER.slice(); if (ns.seen.blue) list.push('blue');
    var n = 0;
    list.forEach(function (id) {
      var s = SIGHTS[id], on = !!ns.seen[id];
      if (on && !s.secret) n++;
      var el = document.createElement(S3 || on ? 'span' : 'button');
      el.className = 'spy-chip' + (on ? ' is-found' : '') + (s.secret ? ' is-secret' : '') + (ns.hintAt === id && !on ? ' is-hinted' : '');
      el.id = 'spy-chip-' + id;
      el.textContent = on ? s.icon + ' ' + s.name : (s.event && !ns.eventDue ? '· · ·' : '?');
      // without WebGL there is no lens: the things to look at are buttons, and Hermes still tells what he sees
      if (!S3 && !on) {
        el.type = 'button';
        el.textContent = s.event && ns.stage !== 'event' ? '· · ·' : '🔭 ' + (s.event ? 'The second turn' : s.name);
        el.disabled = ns.busy || (s.event ? ns.stage !== 'event' : !(ns.stage === 'glass' || ns.stage === 'event'));
        el.addEventListener('click', function () { discover(id); });
      }
      sightsEl.appendChild(el);
    });
    if (sightsCount) sightsCount.textContent = n + ' / ' + ORDER.length + (ns.seen.blue ? ' ✦' : '');
    if (hintBtn) hintBtn.hidden = !(ns.stage === 'glass' || ns.stage === 'event') || !S3;
  }

  function persist(extra) {
    if (ns.replay) return;
    var o = saved();
    o.seen = Object.keys(ns.seen);
    if (ns.boon.length) o.boons = (o.boons || []).concat(ns.boon.filter(function (b) { return (o.boons || []).indexOf(b) < 0; }));
    if (extra) for (var k in extra) o[k] = extra[k];
    set(KEY, JSON.stringify(o));
  }

  // the lens rested on something: Hermes says what it is
  async function discover(id) {
    var s = SIGHTS[id];
    if (!s || ns.seen[id] || ns.busy) return false;
    if (s.event ? ns.stage !== 'event' : !(ns.stage === 'glass' || ns.stage === 'event')) return false;
    var token = chat.token;
    ns.busy = true; ns.seen[id] = true; ns.order.push(id); ns.hintAt = null; ns.lastFind = performance.now();
    if (s.event) ns.stage = 'split';
    renderSights();
    cue(s.secret ? 'reveal' : 'lens');
    if (S3) S3.found(id);
    if (window.EclipseAmbience) window.EclipseAmbience.intensity(Math.min(1, 0.35 + 0.09 * ns.order.length));
    var ok = await chat.play(s.lines(), token);
    if (!ok) return false;
    if (s.done) s.done();
    persist();
    ns.busy = false; speaking = null;
    if (s.event) { askChoice(); return true; }
    // enough has been seen: the shout from the terraces
    if (ns.stage === 'glass' && !ns.eventDue && eventReady()) startEvent();
    else { renderSights(); setMission(missionText()); }
    return true;
  }
  // the shout waits until she has had a good look: five of the six things in the gorge, or four long minutes
  function eventReady() {
    var n = HINT_ORDER.filter(function (k) { return ns.seen[k]; }).length;
    return !!ns.seen.wagons && (n >= 5 || performance.now() - ns.glassSince > 240000);
  }
  function missionText() {
    var left = ORDER.filter(function (id) { return !ns.seen[id] && !SIGHTS[id].event; }).length;
    return left ? 'Sweep the gorge with the spyglass' : 'Hold the glass on the second turn';
  }

  async function startEvent() {
    var token = chat.token;
    ns.eventDue = true; ns.busy = true; ns.stage = 'event';
    setMission('Something is happening at the second turn');
    if (S3) S3.fx.shout();
    var ok = await chat.play([
      nar('A shout echoes off the eastern wall. On the terraces, the men have stopped heaving.'),
      H('Something is happening at the second turn, where the wagon is wedged. Quick, the glass!')
    ], token);
    if (!ok) return;
    ns.busy = false; speaking = null; ns.hintAt = 'hairpin';
    if (S3) S3.point('hairpin');
    renderSights();
  }

  function askChoice() {
    ns.stage = 'asking'; ns.busy = false; speaking = null;
    setMission('Decide what Hermes does');
    if (S3) S3.lower();
    renderSights(); renderChoices();
  }
  function renderChoices() {
    choicesBox.innerHTML = '';
    var box = choicesBox.parentNode, ids = ns.stage === 'asking' ? Object.keys(CHOICES) : [];
    box.style.display = ids.length ? '' : 'none';
    ids.forEach(function (id) {
      var c = CHOICES[id], b = document.createElement('button');
      b.type = 'button'; b.className = 'gates-choice-btn'; b.id = 'spy-choice-' + id;
      b.innerHTML = '<span>' + c.icon + ' ' + c.label + '</span>';
      b.addEventListener('click', function () { pick(id); });
      choicesBox.appendChild(b);
    });
    if (ids.length) { var f = choicesBox.querySelector('button'); if (f) f.focus(); }
  }
  async function pick(id) {
    if (ns.busy || ns.stage !== 'asking') return;
    var c = CHOICES[id], token = chat.token;
    ns.busy = true; ns.stage = 'outro'; ns.choice = id;
    choicesBox.innerHTML = ''; choicesBox.parentNode.style.display = 'none';
    if (sfx.playMechanicalClick) sfx.playMechanicalClick();
    if (window.EclipseAmbience) window.EclipseAmbience.intensity(1);
    await chat.say('silvia', [c.say], token);
    if (token !== chat.token) return;
    var ok = await chat.play(c.lines(), token);
    if (!ok) return;
    if (c.done) c.done();
    finish(id);
  }
  function finish(id) {
    ns.stage = 'done'; ns.busy = false; speaking = null;
    persist({ done: true, choice: id });
    setMission('The southern mouth of the gorge');
    var found = ORDER.filter(function (k) { return ns.seen[k]; }).length;
    if (finishBody) finishBody.textContent = CHOICES[id].epilogue + ' The glass found ' + found + ' of ' + ORDER.length + ' things in the gorge' + (ns.seen.blue ? ', and a smear of blue that was not on any page' : '') + '.' + (ns.boon.length ? ' ✦ A new note is waiting for you at Cairn IV.' : '');
    if (finishCard) finishCard.style.display = 'flex';
    if (finishBtn) { finishBtn.querySelector('span').textContent = ns.onDone ? '🗿 Go to Cairn IV ➔' : '✦ Close the spyglass'; finishBtn.focus(); }
    if (window.EclipseAmbience) window.EclipseAmbience.intensity(0.4);
    if (sfx.playCelestialChime) sfx.playCelestialChime();
    renderSights();
  }

  // 🧭 Where should I look? Hermes names a place; asked again, he turns the glass himself.
  function hint() {
    if (ns.busy || !(ns.stage === 'glass' || ns.stage === 'event') || !S3) return;
    var id = ns.stage === 'event' ? 'hairpin' : HINT_ORDER.filter(function (k) { return !ns.seen[k]; })[0];
    if (!id) return;
    var s = SIGHTS[id], again = ns.hintAt === id;
    ns.hintAt = id; ns.hintN++; ns.lastFind = performance.now();
    S3.point(id, again);
    var need = s.zoom > S3.zoom() ? ' Bring it closer with ＋.' : '';
    window.EclipseChat.subtitle.act(subtitle, again ? 'Hermes turns the glass himself: ' + s.where + '.' + need : 'Hermes: “Try ' + s.where + '.”' + need);
    cue('tick', { f: 700, v: 0.05 });
    renderSights();
  }
  if (hintBtn) hintBtn.addEventListener('click', hint);

  async function start() {
    var token = chat.reset();
    ns.stage = 'intro'; ns.busy = true; ns.seen = {}; ns.order = []; ns.boon = []; ns.choice = null; ns.hintAt = null; ns.hintN = 0; ns.eventDue = false;
    logEl.innerHTML = '';
    choicesBox.innerHTML = ''; choicesBox.parentNode.style.display = 'none';
    if (finishCard) finishCard.style.display = 'none';
    setMission('Dawn on the Natural Bridge');
    if (hudTime) hudTime.textContent = '06:10 · FIRST LIGHT';
    if (S3) S3.reset();
    window.EclipseChat.subtitle.reset(subtitle, 'Dawn on the Natural Bridge of the Sentinel Mesa.');
    renderSights();

    chat.card('📖 Where we are', [
      'Hermes walked the hardpan all night, toward the singing of the pillars.',
      'At dawn he reached the Natural Bridge: the two pages of your journal, side by side.',
      'He has his spyglass. You have the pages. Nothing here can be lost: look, and decide.'
    ]);
    await chat.sleep(1500);
    var ok = await chat.play([
      nar('Dawn. A span of red sandstone crosses the gorge, 380 varas above the Lower Wash.', { fx: fx('shotPrint'), hold: 1200 }),
      H('Silvia, I am at the eastern end of the Natural Bridge. It is exactly as I drew it: the old cart track runs over its back to the Sentinel Mesa.'),
      nar('Voices rise out of the gorge. Wheels grind on stone.', { fx: fx('shotTerraces') }),
      H('And I am not the first one here. There are men on the switchback terraces below me, and wagons.'),
      nar('Hermes crawls out along the lip of the bridge, behind a line of fallen blocks, and draws out his brass spyglass.', { fx: fx('shotHermes') }),
      H('They have not seen me. Take the glass, Silvia: drag it across the gorge, and hold it still on anything that matters. I will tell you what I see.')
    ], token);
    if (!ok) return;
    ns.stage = 'glass'; ns.busy = false; speaking = null; ns.lastFind = ns.glassSince = performance.now();
    setMission(missionText());
    if (S3) S3.raise();
    renderSights();
    window.EclipseChat.subtitle.act(subtitle, S3 ? 'Drag to move the glass · ＋ and − bring things closer · hold it still on what you find' : 'Choose what Hermes turns the glass to.');
  }

  // ---------------------------------------------------------------------
  // 2. THE SCENE (three.js): the gorge at true size, and a lens to read it with
  // ---------------------------------------------------------------------
  var renderer = null, scene = null, camera = null, animId = null, clock = { t: 0, last: 0 }, efx = null;
  var lens = null;   // the DOM of the spyglass (built once)

  function lcg(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var DEG = Math.PI / 180;
  var EYE = { x: 105, y: 0.95, z: 10.4 };          // where the glass is: the southern lip of the span, east of the middle
  var FOVS = [20, 8.2, 3.4];                       // the three draws of the brass tube
  var TRACK = [[151, 0, 30], [131, -45, 232], [113, -95, 48], [95, -145, 226], [77, -195, 58], [59, -245, 216], [41, -297, 92]];

  function buildLens() {
    if (lens || !stage) return;
    var d = document.createElement('div');
    d.className = 'spy-lens'; d.hidden = true;
    d.innerHTML =
      '<div class="sl-shade"></div><div class="sl-glass"></div><div class="sl-ring"></div>' +
      '<svg class="sl-reticle" viewBox="-100 -100 200 200" aria-hidden="true">' +
        '<g class="sl-cross"><line x1="-92" y1="0" x2="-14" y2="0"/><line x1="14" y1="0" x2="92" y2="0"/><line x1="0" y1="-92" x2="0" y2="-14"/><line x1="0" y1="14" x2="0" y2="92"/>' +
        [-70, -50, -30, 30, 50, 70].map(function (v) { return '<line x1="' + v + '" y1="-3" x2="' + v + '" y2="3"/><line x1="-3" y1="' + v + '" x2="3" y2="' + v + '"/>'; }).join('') + '</g>' +
        '<circle class="sl-dot" r="1.6"/><circle class="sl-focus-bg" r="9"/><circle class="sl-focus" r="9" transform="rotate(-90)"/></svg>' +
      '<div class="sl-bearing"><i class="sl-tape"></i><b id="spy-bearing">180° · S</b></div>' +
      '<div class="sl-note" id="spy-note" role="status" aria-live="polite"></div>' +
      '<div class="sl-found" id="spy-found"></div>' +
      '<div class="sl-arrow" id="spy-arrow" hidden>➤</div>' +
      '<div class="sl-zoom"><button type="button" id="btn-spy-out" aria-label="Push the spyglass in: see wider">−</button><span class="sl-pips"><i></i><i></i><i></i></span><button type="button" id="btn-spy-in" aria-label="Draw the spyglass out: see closer">＋</button></div>';
    stage.appendChild(d);
    var fade = document.createElement('div'); fade.className = 'spy-fade'; stage.appendChild(fade);
    lens = { box: d, fade: fade, focus: d.querySelector('.sl-focus'), bearing: d.querySelector('#spy-bearing'), tape: d.querySelector('.sl-tape'), note: d.querySelector('#spy-note'),
      found: d.querySelector('#spy-found'), arrow: d.querySelector('#spy-arrow'), pips: [].slice.call(d.querySelectorAll('.sl-pips i')), zin: d.querySelector('#btn-spy-in'), zout: d.querySelector('#btn-spy-out') };
    lens.focus.style.strokeDasharray = String(2 * Math.PI * 9);
    lens.zin.addEventListener('click', function (e) { e.stopPropagation(); if (S3) S3.setZoom(S3.zoom() + 1); });
    lens.zout.addEventListener('click', function (e) { e.stopPropagation(); if (S3) S3.setZoom(S3.zoom() - 1); });
  }
  function fadeTo(k, ms) { if (!lens) return; lens.fade.style.transitionDuration = (ms == null ? 500 : ms) + 'ms'; lens.fade.style.opacity = String(k); }
  var NAMES16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

  function setup3D() {
    if (!canvas || !T || !SC || !P) return;
    if (renderer) return;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { console.warn('WebGL not supported for the Spyglass on the Natural Bridge:', e); renderer = null; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    scene = new T.Scene();
    var HORIZON = 0xf0c9a4;
    scene.fog = new T.Fog(HORIZON, 260, 3400);
    var aspect = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    camera = new T.PerspectiveCamera(46, aspect, 1.6, 7000);
    camera.rotation.order = 'YXZ';
    var paint = SC.paint(), fbm = SC.noise.fbm, U = SC.util;
    buildLens();

    // ---- the sun of a clear autumn dawn: twenty degrees up in the south-east, raking down the gorge ----
    var SUN = new T.Vector3(0.60, 0.33, 0.73).normalize();
    var skyObj = SC.sky(scene, { zenith: 0x4f83c4, mid: 0xf3c9a2, horizon: HORIZON, glow: 0xffb86a, sun: [SUN.x, SUN.y, SUN.z], cloudA: new T.Color(1.0, 0.7, 0.6), cloudB: new T.Color(1.0, 0.9, 0.8), cloudK: 0.55 });
    skyObj.mesh.scale.setScalar(45);
    var skyBits = new T.Group(); scene.add(skyBits);   // what hangs in the sky rides with the camera
    var glare = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xffd9a0, transparent: true, opacity: 0.55, depthWrite: false, depthTest: false, blending: T.AdditiveBlending, fog: false }));
    glare.position.copy(SUN).multiplyScalar(4200); glare.scale.set(2300, 2300, 1); glare.renderOrder = -85; skyBits.add(glare);
    // the old moon going down in the west, pale in the growing light
    var moonTex = P.canvasTex(128, 128, function (g, w) {
      g.clearRect(0, 0, w, w);
      var gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2 - 4); gr.addColorStop(0, 'rgba(248,244,236,1)'); gr.addColorStop(0.92, 'rgba(236,232,226,1)'); gr.addColorStop(1, 'rgba(236,232,226,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(170,176,196,0.5)'; [[46, 44, 15], [74, 60, 11], [56, 80, 13], [84, 38, 7]].forEach(function (m) { g.beginPath(); g.arc(m[0], m[1], m[2], 0, Math.PI * 2); g.fill(); });
    });
    var moon = new T.Sprite(new T.SpriteMaterial({ map: moonTex, transparent: true, opacity: 0.5, depthWrite: false, depthTest: false, fog: false }));
    moon.position.set(-0.84, 0.2, -0.5).normalize().multiplyScalar(4300); moon.scale.set(210, 210, 1); moon.renderOrder = -84; skyBits.add(moon);

    // ---- textures: bedded sandstone, a fine grain to multiply over it, sand, the dust of the cart track ----
    // The sandstone is drawn already "lit": every bed has a dark seam and a pale lip under it, joints run down the face
    // and rain has left long streaks. The great bands of colour and the light of the dawn are baked into the vertices.
    var strata = P.canvasTex(512, 1024, function (g, w, h) {
      var r = lcg(19), y = 0, pal = ['#b8693f', '#c27a4c', '#ad5f3a', '#c98a5a', '#b9714a', '#a85a38', '#cf9466', '#b26440', '#be7448', '#a6563a'];
      while (y < h) {
        var bh = 4 + Math.floor(Math.pow(r(), 1.6) * 34); g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(0, y, w, bh);
        // cross-bedding inside a thick bed: fine slanting lines
        if (bh > 16) { g.strokeStyle = 'rgba(80,40,24,0.16)'; g.lineWidth = 1; var sl = (r() - 0.5) * 0.5; for (var cx = -40; cx < w + 40; cx += 9 + r() * 8) { g.beginPath(); g.moveTo(cx, y + 1); g.lineTo(cx + bh * (1.8 + sl), y + bh - 1); g.stroke(); } }
        // the seam between two beds: a dark line, and the lip of the bed below catching the light
        g.fillStyle = 'rgba(52,24,14,' + (0.35 + r() * 0.4) + ')'; g.fillRect(0, y, w, 1 + (r() < 0.25 ? 1 : 0));
        g.fillStyle = 'rgba(255,224,186,0.22)'; g.fillRect(0, y + 2, w, 1);
        y += bh;
      }
      // joints: cracks that run down across the beds, with small offsets
      for (var k = 0; k < 34; k++) {
        var x = r() * w, y0 = r() * h, len = 80 + r() * 420; g.strokeStyle = 'rgba(44,20,12,' + (0.25 + r() * 0.35) + ')'; g.lineWidth = 1 + r() * 1.4; g.beginPath(); g.moveTo(x, y0);
        for (var yy = y0; yy < y0 + len; yy += 14) { x += (r() - 0.5) * 7; g.lineTo(x, yy % h); if ((yy % h) < 14) g.moveTo(x, 0); } g.stroke();
      }
      // desert varnish and the pale wash of rain, running down
      for (var q = 0; q < 90; q++) { var sx = r() * w, slen = 90 + r() * 520, sy = r() * h, sw = 1 + r() * 7; g.fillStyle = r() < 0.6 ? 'rgba(48,22,14,0.10)' : 'rgba(255,226,190,0.09)'; g.fillRect(sx, sy, sw, slen); if (sy + slen > h) g.fillRect(sx, 0, sw, sy + slen - h); }
      for (var i = 0; i < 9000; i++) { var v = r(); g.fillStyle = v < 0.5 ? 'rgba(255,214,170,0.10)' : 'rgba(60,28,16,0.10)'; g.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 2); }
      // pocks where pebbles have fallen out
      for (var p2 = 0; p2 < 240; p2++) { var px = r() * w, py = r() * h, pr = 1 + r() * 2.6; g.fillStyle = 'rgba(46,22,12,0.4)'; g.beginPath(); g.ellipse(px, py, pr * 1.5, pr, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,226,190,0.25)'; g.fillRect(px - pr, py + pr, pr * 2, 1); }
    });
    strata.wrapS = strata.wrapT = T.RepeatWrapping; strata.anisotropy = 8;
    // the grain: mid grey with pits and hairline cracks, multiplied over everything at a finer scale (so stone is still
    // stone when the tube is drawn right out)
    var grain = P.canvasTex(256, 256, function (g, w, h) {
      g.fillStyle = 'rgb(136,136,136)'; g.fillRect(0, 0, w, h);
      var r = lcg(41);
      for (var i = 0; i < 5200; i++) { var v = 96 + Math.floor(r() * 84); g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',0.5)'; g.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 1.6); }
      for (var k = 0; k < 26; k++) { g.strokeStyle = 'rgba(70,70,70,0.45)'; g.lineWidth = 0.8; g.beginPath(); var x = r() * w, y = r() * h; g.moveTo(x, y); for (var s2 = 0; s2 < 6; s2++) { x += (r() - 0.5) * 26; y += (r() - 0.3) * 22; g.lineTo(x, y); } g.stroke(); }
      for (var p2 = 0; p2 < 90; p2++) { var px = r() * w, py = r() * h; g.fillStyle = 'rgba(64,64,64,0.5)'; g.beginPath(); g.arc(px, py, 0.8 + r() * 1.8, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(196,196,196,0.4)'; g.fillRect(px - 1, py + 1.6, 2.4, 1); }
    });
    grain.wrapS = grain.wrapT = T.RepeatWrapping; grain.anisotropy = 4;
    var sandTex = P.canvasTex(512, 512, function (g, w, h) {
      g.fillStyle = '#dcb98c'; g.fillRect(0, 0, w, h);
      var r = lcg(29); for (var i = 0; i < 9000; i++) { var v = r(); g.fillStyle = v < 0.5 ? 'rgba(255,236,200,0.16)' : 'rgba(120,80,48,0.14)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); }
      // wind ripples: a pale crest and a shadow under it
      for (var k = 0; k < 110; k++) { var y = r() * h, a = 3 + r() * 7, ph = r() * 6; g.lineWidth = 1; ['rgba(128,88,54,0.06)', 'rgba(255,240,208,0.05)'].forEach(function (c, n) { g.strokeStyle = c; g.beginPath(); for (var x = 0; x <= w; x += 8) { var yy = y + n * 2 + Math.sin(x * 0.03 + ph) * a; if (x) g.lineTo(x, yy); else g.moveTo(x, yy); } g.stroke(); }); }
      for (var p2 = 0; p2 < 160; p2++) { g.fillStyle = 'rgba(' + (120 + r() * 60 | 0) + ',' + (84 + r() * 40 | 0) + ',' + (56 + r() * 30 | 0) + ',0.55)'; g.beginPath(); g.ellipse(r() * w, r() * h, 1 + r() * 2.4, 0.8 + r() * 1.6, r() * 3, 0, Math.PI * 2); g.fill(); }
    });
    sandTex.wrapS = sandTex.wrapT = T.RepeatWrapping; sandTex.anisotropy = 8;
    var dustTex = P.canvasTex(64, 256, function (g, w, h) {
      g.fillStyle = '#d9b78c'; g.fillRect(0, 0, w, h);
      var r = lcg(5); for (var i = 0; i < 500; i++) { g.fillStyle = 'rgba(' + (150 + r() * 70 | 0) + ',' + (115 + r() * 50 | 0) + ',' + (80 + r() * 40 | 0) + ',0.35)'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 3); }
      g.fillStyle = 'rgba(96,64,40,0.5)'; g.fillRect(w * 0.22, 0, 5, h); g.fillRect(w * 0.7, 0, 5, h);
      g.fillStyle = 'rgba(255,236,200,0.25)'; g.fillRect(w * 0.22 + 5, 0, 2, h); g.fillRect(w * 0.7 + 5, 0, 2, h);
    });
    dustTex.wrapS = dustTex.wrapT = T.RepeatWrapping;
    // A material that takes no light of its own: what it shows is its texture, times the grain, times the light that was
    // baked into its vertices (sun, the shadow of the gorge, how much sky each point sees).
    function baked(map, grainScale, extra) {
      var o = { map: map, vertexColors: true, side: T.DoubleSide }; if (extra) for (var k in extra) o[k] = extra[k];
      var m = new T.MeshBasicMaterial(o);
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uGrain = { value: grain }; sh.uniforms.uGrainK = { value: grainScale || 6 };
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uGrain; uniform float uGrainK;')
          .replace('#include <map_fragment>', '#include <map_fragment>\n  #ifdef USE_MAP\n    diffuseColor.rgb *= texture2D( uGrain, vUv * uGrainK ).rgb * 1.9;\n  #endif');
      };
      return m;
    }
    var rockMat = baked(strata, 6.3), sandMat = baked(sandTex, 4.7), trackMat = baked(dustTex, 3.1), deckMat = baked(sandTex, 3.9);

    // ---- the shape of the gorge ----
    var sm = U.smooth, lerp = U.lerp, clamp = U.clamp;
    var Z0 = -1700, Z1 = 2100, FLOOR = -300;
    // the gorge opens like a funnel toward its southern mouth (where Cairn IV stands) and closes a little to the north
    function flare(z) { return sm(300, 720, z) * 380 + sm(720, 1100, z) * 360 + sm(-500, -1500, z) * -30; }
    // the eastern wall leans back into terraces south of the bridge: that is where the cart track goes down
    function terr(z) { return sm(14, 40, z) * (1 - sm(244, 300, z)); }
    // A wall is never a plane. From the rim down it falls in cliffs and steps out in benches (so the gorge is narrower
    // at its floor than at its rim); it stands in buttresses from top to bottom; it bulges; and at its foot the scree of
    // ten thousand years leans out into the wash. inward(z, y): how far the face stands in from the rim line.
    function inward(z, y, seed, bench) {
      var d = -y, st = d / 56, step = Math.floor(st) + sm(0.62, 1, st % 1);
      return step * 8.5 * bench                                                             // cliffs and benches
        + (fbm(z * 0.034, 0.5, seed + 2, 3, 0, 0) - 0.5) * -40                               // buttresses and alcoves, rim to foot
        + (fbm(z * 0.011, y * 0.017, seed, 4, 0, 0) - 0.4) * -30                             // the great bulges
        + (fbm(z * 0.085, y * 0.1, seed + 6, 3, 0, 0) - 0.5) * -6                            // broken faces, blocks, hollows
        + sm(-212, -300, y) * (34 + fbm(z * 0.02, 0.1, seed + 4, 2, 0, 0) * 30);             // the scree at the foot
    }
    function eastX(z, y) { var m = terr(z); return 150 + flare(z) - inward(z, y, 23, 1 - m) * (1 - 0.8 * m) - m * 0.4 * (-y); }
    function westX(z, y) { return -(150 + flare(z) - inward(z, y, 11, 1)); }
    // the Sentinel Mesa proper: a second wall set back on the western shelf, a hundred varas higher
    function mesaX(z, y) { return -(232 + fbm(z * 0.008, y * 0.03, 31, 4, 0, 0) * 44 + flare(z) * 0.7 + (fbm(z * 0.05, y * 0.06, 33, 3, 0, 0) - 0.5) * 9 - (Math.floor(y / 24) + sm(0.7, 1, (y / 24) % 1)) * 3.4); }
    function mesaTop(z) { return 84 + fbm(z * 0.004, 0.3, 37, 3, 0, 0) * 60; }
    function bedX(z) { return Math.sin(z * 0.006) * 34 + Math.sin(z * 0.017 + 1) * 10 - 6; }
    function floorY(x, z) { return FLOOR + fbm(x * 0.02, z * 0.02, 17, 3, 0, 0) * 7 - 3 - sm(26, 0, Math.abs(x - bedX(z))) * 2.4; }
    // the Natural Bridge: one span of stone, flat on its back, an arch 276 varas high under it (a little east of the middle)
    function underY(x) { var a = Math.abs(x - 6); return a < 138 ? FLOOR + 276 * Math.pow(1 - (a / 138) * (a / 138), 0.47) : FLOOR - 4; }
    function halfW(x) { return 7.6 + fbm(x * 0.03, 0.2, 51, 3, 0, 0) * 2.6 + 10 * sm(112, 172, Math.abs(x)) + 1.6 * sm(0, 110, Math.abs(x)); }

    // The same shape, kept in tables: light is baked by walking rays through the gorge, and a ray cannot afford the noise.
    var PZN = 381, PYN = 39, PE = new Float32Array(PZN * PYN), PW = new Float32Array(PZN * PYN), PMN = 17, PM = new Float32Array(PZN * PMN), PMT = new Float32Array(PZN);
    for (var pi = 0; pi < PZN; pi++) {
      var pz0 = Z0 + pi * 10;
      for (var pj = 0; pj < PYN; pj++) { var py0 = FLOOR - 4 + pj * 8; PE[pi * PYN + pj] = eastX(pz0, py0); PW[pi * PYN + pj] = westX(pz0, py0); }
      for (var pm = 0; pm < PMN; pm++) PM[pi * PMN + pm] = mesaX(pz0, pm * 10);
      PMT[pi] = mesaTop(pz0);
    }
    function prof(tab, n, z, v) {   // v: the row, as a real number
      var zi = clamp((z - Z0) / 10, 0, PZN - 1.001), i0 = zi | 0, fz = zi - i0, j0 = clamp(v, 0, n - 1.001) | 0, fv = clamp(v, 0, n - 1.001) - j0, a = i0 * n + j0;
      return (tab[a] * (1 - fv) + tab[a + 1] * fv) * (1 - fz) + (tab[a + n] * (1 - fv) + tab[a + n + 1] * fv) * fz;
    }
    var HWT = new Float32Array(186), UYT = new Float32Array(186);
    for (var hx = 0; hx < 186; hx++) { HWT[hx] = halfW(-184 + hx * 2); UYT[hx] = underY(-184 + hx * 2); }
    // is this point inside rock?
    function solid(x, y, z) {
      if (y < FLOOR - 1) return true;
      if (y < 0) {
        var v = (y - FLOOR + 4) / 8;
        if (x >= prof(PE, PYN, z, v) || x <= prof(PW, PYN, z, v)) return true;
        if (x <= -184 || x >= 184) return false;
        var bi2 = Math.round((x + 184) / 2);
        return Math.abs(z) < HWT[bi2] && y > UYT[bi2];
      }
      if (y > 150) return false;
      return x < prof(PM, PMN, z, y / 10) && y < PMT[clamp(Math.round((z - Z0) / 10), 0, PZN - 1)];
    }
    // does the sun reach this point? (one ray toward it, steps that lengthen)
    function sunRay(x, y, z) {
      var s = 5;
      for (var i = 0; i < 46; i++) { x += SUN.x * s; y += SUN.y * s; z += SUN.z * s; if (y > 152) return 1; if (solid(x, y, z)) return 0; s *= 1.085; }
      return 1;
    }
    var SPX = SUN.z, SPZ = -SUN.x, SPL = Math.hypot(SPX, SPZ); SPX /= SPL; SPZ /= SPL;   // across the sun, level
    function sunAt(x, y, z) { return (sunRay(x, y, z) + sunRay(x + SPX * 7, y + 2, z + SPZ * 7) + sunRay(x - SPX * 7, y - 2, z - SPZ * 7)) / 3; }   // a soft edge
    // how much sky does it see? (five short rays in the half-space of its normal)
    var AOD = [9, 15, 24, 38];
    function skyAt(x, y, z, nx, ny, nz) {
      var open = 0, tot = 0;
      for (var k = 0; k < 5; k++) {
        var dx = nx + (k === 1 ? 0.9 : k === 2 ? -0.9 : 0), dy = ny + (k === 0 ? 0.9 : 0.25), dz = nz + (k === 3 ? 0.9 : k === 4 ? -0.9 : 0), l = Math.hypot(dx, dy, dz) || 1, px = x, py = y, pz = z, hit = 0;
        dx /= l; dy /= l; dz /= l;
        for (var i = 0; i < 4; i++) { px += dx * AOD[i]; py += dy * AOD[i]; pz += dz * AOD[i]; if (solid(px, py, pz)) { hit = 1 - i * 0.2; break; } }
        open += 1 - hit; tot += 1;
      }
      return open / tot;
    }
    // The light of this dawn on a point of the world with this normal: a low gold sun where it reaches, the blue of the
    // sky where it does not, and a little warmth thrown back by the lit wall across the gorge.
    var SUNC = [2.7, 1.95, 1.2], SKYC = [0.62, 0.72, 1.02], BOUNCE = [0.7, 0.44, 0.28];
    function lightAt(x, y, z, nx, ny, nz, out) {
      var ax = x + nx * 5, ay = y + ny * 5, az = z + nz * 5;   // off the face: the tables are coarser than the stone
      var ndl = Math.max(0, (nx * SUN.x + ny * SUN.y + nz * SUN.z + 0.12) / 1.12), lit = ndl > 0.001 ? sunAt(ax, ay, az) * ndl : 0;
      var sky = skyAt(ax, ay, az, nx, ny, nz), up = 0.62 + 0.38 * ny, deep = y < 0 ? sm(-300, -60, y) : 1;   // the floor of the gorge is far from the sky
      var a = (0.2 + 0.56 * sky) * up * (0.74 + 0.26 * deep), b = 0.16 * sky * (1 - 0.5 * ny) * (y < 0 ? 1 : 0.4);
      out[0] = SUNC[0] * lit + SKYC[0] * a + BOUNCE[0] * b; out[1] = SUNC[1] * lit + SKYC[1] * a + BOUNCE[1] * b; out[2] = SUNC[2] * lit + SKYC[2] * a + BOUNCE[2] * b;
      return lit;
    }
    // the colour of the stone itself: the great beds, the varnish running down, a paler rim
    function tintAt(x, y, z, out) {
      var n = fbm(x * 0.006 + 3, z * 0.006 + y * 0.003, 5, 3, 0, 0);
      var band = 0.88 + 0.13 * Math.sin(y * 0.047 + n * 6) + 0.06 * Math.sin(y * 0.19 + 1.7);
      var streak = 0.9 + 0.2 * fbm(x * 0.09 + z * 0.09, y * 0.006, 13, 3, 0, 0);
      var c = clamp(band * streak * (0.86 + 0.26 * n), 0.5, 1.2), pale = sm(-22, 0, y) * 0.1;
      out[0] = c + pale; out[1] = c * 0.95 + pale; out[2] = c * 0.9 + pale;
    }
    function topTint(x, y, z, c) { var n = fbm(x * 0.02, z * 0.02, 9, 3, 0, 0), k = 0.92 + 0.2 * n; c[0] = k; c[1] = k * 0.95; c[2] = k * 0.88; }
    function washTint(x, y, z, c) { var d = Math.abs(x - bedX(z)), k = 0.74 + 0.3 * sm(6, 52, d) + (fbm(x * 0.05, z * 0.05, 19, 2, 0, 0) - 0.5) * 0.2; c[0] = k * 1.02; c[1] = k * 0.95; c[2] = k * 0.84; }
    // bake the light into a geometry that already has positions and normals in world space
    function bakeLight(geo, tint, opts) {
      var pa = geo.attributes.position, na = geo.attributes.normal, col = new Float32Array(pa.count * 3), c = [1, 1, 1], l = [1, 1, 1], flip = opts && opts.flip;
      for (var i = 0; i < pa.count; i++) {
        var x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), nx = na.getX(i), ny = na.getY(i), nz = na.getZ(i);
        if (flip === 'air' && solid(x + nx * 3, y + ny * 3, z + nz * 3)) { nx = -nx; ny = -ny; nz = -nz; }   // the normal that looks into the air
        tint(x, y, z, c); lightAt(x, y, z, nx, ny, nz, l);
        col[i * 3] = c[0] * l[0]; col[i * 3 + 1] = c[1] * l[1]; col[i * 3 + 2] = c[2] * l[2];
      }
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
    }
    // a skin stretched over fn(u, v) -> [x, y, z], lit by the dawn
    function sheet(nu, nv, fn, o) {
      o = o || {};
      var N = (nu + 1) * (nv + 1), pos = new Float32Array(N * 3), uv = new Float32Array(N * 2), idx = [], p = [0, 0, 0], k = 0, S = o.uvScale || 52;
      for (var i = 0; i <= nu; i++) for (var j = 0; j <= nv; j++) {
        fn(i / nu, j / nv, p);
        pos[k * 3] = p[0]; pos[k * 3 + 1] = p[1]; pos[k * 3 + 2] = p[2];
        uv[k * 2] = (o.flat ? p[0] : o.uAxis === 'x' ? p[0] : p[2]) / S; uv[k * 2 + 1] = (o.flat ? p[2] : p[1]) / S;
        k++;
      }
      for (var a = 0; a < nu; a++) for (var b = 0; b < nv; b++) { var i0 = a * (nv + 1) + b, i1 = i0 + nv + 1; idx.push(i0, i0 + 1, i1, i1, i0 + 1, i1 + 1); }
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
      geo.setIndex(idx); geo.computeVertexNormals();
      bakeLight(geo, o.tint || tintAt, { flip: 'air' });
      var m = new T.Mesh(geo, o.mat || rockMat);
      m.frustumCulled = false; scene.add(m);
      return m;
    }
    // columns are spent where the eye is: close to the bridge and the terraces, thin toward the far ends of the gorge
    function zOf(u) { return u < 0.13 ? lerp(Z0, -330, u / 0.13) : u < 0.74 ? lerp(-330, 470, (u - 0.13) / 0.61) : lerp(470, Z1, (u - 0.74) / 0.26); }
    sheet(250, 44, function (u, v, p) { var z = zOf(u), y = lerp(FLOOR - 4, 0, v); p[0] = westX(z, y); p[1] = y; p[2] = z; });
    sheet(270, 44, function (u, v, p) { var z = zOf(u), y = lerp(FLOOR - 4, 0, v); p[0] = eastX(z, y); p[1] = y; p[2] = z; });
    sheet(150, 18, function (u, v, p) { var z = zOf(u), y = lerp(-2, mesaTop(z), v); p[0] = mesaX(z, y); p[1] = y; p[2] = z; });
    // the tops: the western shelf, the Mesa, the eastern plateau (pale, wind-swept rock under a skin of sand)
    sheet(110, 8, function (u, v, p) { var z = zOf(u); p[0] = lerp(westX(z, 0) + 1.5, mesaX(z, 0) - 2, v); p[1] = fbm(p[0] * 0.05, z * 0.05, 3, 2, 0, 0) * 0.5 - 0.25; p[2] = z; }, { tint: topTint, flat: true, mat: sandMat, uvScale: 24 });
    sheet(70, 10, function (u, v, p) { var z = zOf(u); p[0] = lerp(mesaX(z, mesaTop(z)) + 2, -1900, v * v); p[1] = mesaTop(z) + fbm(p[0] * 0.01, z * 0.01, 41, 3, 0, 0) * 22 * v; p[2] = z; }, { tint: topTint, flat: true, mat: sandMat, uvScale: 24 });
    sheet(120, 16, function (u, v, p) { var z = zOf(u); p[0] = lerp(eastX(z, 0) - 1.5, 2600, v * v); p[1] = fbm(p[0] * 0.012, z * 0.012, 43, 3, 0, 0) * 14 * sm(0.2, 0.7, v) - 0.2; p[2] = z; }, { tint: topTint, flat: true, mat: sandMat, uvScale: 24 });
    // the Lower Wash: a dry bed of pale sand and gravel, darker where the last water ran
    sheet(150, 40, function (u, v, p) { var z = u > 0.985 ? Z1 + 600 : zOf(u / 0.985), w = 190 + flare(z) + (z > Z1 ? 800 : 0); p[0] = lerp(-w, w, v); p[2] = z; p[1] = floorY(p[0], z) + sm(120, 200, Math.abs(p[0]) - flare(z)) * 26; }, { flat: true, uvScale: 22, mat: sandMat, tint: washTint });
    // the open desert beyond the southern mouth and under everything, so no edge of the world ever shows
    var far = new T.Mesh(new T.PlaneGeometry(16000, 16000), new T.MeshBasicMaterial({ color: 0xd9ab7c })); far.rotation.x = -Math.PI / 2; far.position.y = FLOOR - 90; far.frustumCulled = false; scene.add(far);   // well below the wash: the depth of a far view is coarse

    // ---- the Natural Bridge ----
    sheet(210, 46, function (u, v, p) {
      var x = lerp(-184, 184, u), th = v * Math.PI * 2, cz = Math.cos(th), sy = Math.sin(th);
      var und = underY(x), mid = und / 2, half = -und / 2;
      var z = halfW(x) * Math.sign(cz) * Math.pow(Math.abs(cz), 0.42), y = mid + half * Math.sign(sy) * Math.pow(Math.abs(sy), 0.42);
      var side = 1 - sm(0.82, 0.98, sy);   // the back of the bridge stays flat for the track; its flanks and belly are rough
      z *= 1 + side * ((fbm(x * 0.045, y * 0.045, 53, 4, 0, 0) - 0.45) * 0.34 + (fbm(x * 0.2, y * 0.2, 54, 2, 0, 0) - 0.5) * 0.12);
      y -= side * sm(0.2, 1, -sy) * (fbm(x * 0.06, z * 0.2, 57, 3, 0, 0) - 0.3) * 7;
      p[0] = x + side * (fbm(y * 0.05, z * 0.1, 59, 2, 0, 0) - 0.5) * 3; p[1] = y; p[2] = z;
    }, { uAxis: 'x' });

    // ---- ribbons of dust: the back of the bridge, the old cart track on it, the terraces of the switchbacks ----
    function ribbon(pts, width, mat, skirt) {
      var pos = [], uv = [], idx = [], L2 = 0, n = pts.length;
      for (var i = 0; i < n; i++) {
        var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
        if (i) L2 += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
        var w = width / 2, q = pts[i];
        pos.push(q[0] + nx * w, q[1], q[2] + nz * w, q[0] - nx * w, q[1], q[2] - nz * w);
        uv.push(0, L2 / 9, 1, L2 / 9);
        if (i) { var k = i * 2; idx.push(k - 2, k - 1, k, k, k - 1, k + 1); }
      }
      function build(P2, UV2, I2, material, tint) {
        var geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(P2, 3)); if (UV2) geo.setAttribute('uv', new T.Float32BufferAttribute(UV2, 2));
        geo.setIndex(I2); geo.computeVertexNormals();
        bakeLight(geo, tint, { flip: 'air' });
        var m = new T.Mesh(geo, material); m.frustumCulled = false; scene.add(m); return m;
      }
      var m = build(pos, uv, idx, mat, function (x, y, z, c) { c[0] = 1.02; c[1] = 0.98; c[2] = 0.92; });
      // a terrace has a face: the cut rock under its outer edge
      if (skirt) {
        var sp = [], su = [], si = [];
        for (var j = 0; j < n; j++) {
          var e = [pos[j * 6 + 3], pos[j * 6 + 4], pos[j * 6 + 5]], e2 = [pos[j * 6], pos[j * 6 + 1], pos[j * 6 + 2]], out = e[0] < e2[0] ? e : e2;   // the side toward the gorge
          sp.push(out[0], out[1], out[2], out[0] + 2.5, out[1] - skirt, out[2]);
          su.push(out[2] / 52, out[1] / 52, out[2] / 52, (out[1] - skirt) / 52);
          if (j) { var k2 = j * 2; si.push(k2 - 2, k2 - 1, k2, k2, k2 - 1, k2 + 1); }
        }
        build(sp, su, si, rockMat, tintAt);
      }
      return m;
    }
    var deckPts = []; for (var dx0 = -260; dx0 <= 420; dx0 += 10) deckPts.push([dx0, 0.12, dx0 > 170 ? -(dx0 - 170) * 0.22 : 0]);
    ribbon(deckPts.filter(function (q) { return Math.abs(q[0]) <= 180; }).map(function (q) { return [q[0], 0.05, q[2]]; }), 15.5, deckMat);
    ribbon(deckPts, 5.2, trackMat);
    // the switchback terraces: six legs down the leaning wall, each a shelf cut into it (the knots are heights and
    // places along the gorge; the shelf follows the wall)
    TRACK = [[0, 30], [-45, 232], [-95, 48], [-145, 226], [-195, 58], [-245, 216], [-297, 92]].map(function (k) { return [eastX(k[1], k[0]) - 3.6, k[0], k[1]]; });
    function trackAt(s) {   // s in varas along the cart track from the rim; returns [x, y, z, heading]
      var left = s;
      for (var i = 0; i < TRACK.length - 1; i++) {
        var a = TRACK[i], b = TRACK[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        if (left <= l || i === TRACK.length - 2) { var k = Math.max(0, Math.min(1, left / l)), y = lerp(a[1], b[1], k), z = lerp(a[2], b[2], k); return [eastX(z, y) - 3.6, y, z, Math.atan2(-(b[0] - a[0]), -(b[2] - a[2]))]; }
        left -= l;
      }
      return TRACK[0].concat([0]);
    }
    var LEG1 = Math.hypot(TRACK[1][0] - TRACK[0][0], TRACK[1][1] - TRACK[0][1], TRACK[1][2] - TRACK[0][2]);
    for (var li = 0; li < TRACK.length - 1; li++) {
      var A = TRACK[li], B = TRACK[li + 1], seg = [];
      for (var q = 0; q <= 22; q++) { var kq = q / 22, ty = lerp(A[1], B[1], kq), tz = lerp(A[2], B[2], kq); seg.push([eastX(tz, ty) - 3.6, ty + 0.25, tz]); }
      ribbon(seg, 6.8, trackMat, 11);
    }
    ribbon([[168, 0.14, 4], [162, 0.14, 14], [(TRACK[0][0] + 162) / 2, 0.14, 23], [TRACK[0][0], 0.2, 30]], 5.2, trackMat);

    // ---- stones ----
    // one great stone, shaped by noise and lit where it lies
    var boulderMat = baked(sandTex, 2.3, { color: 0xd9966a });
    function boulder(x, y, z, s, seed, tint, lit3d) {
      var r = lcg(seed), geo = new T.IcosahedronGeometry(1, 2), pa = geo.attributes.position, c = [1, 1, 1], l = [1, 1, 1], colr = new Float32Array(pa.count * 3), sq = 0.6 + r() * 0.3;
      for (var i = 0; i < pa.count; i++) {
        var px = pa.getX(i), py = pa.getY(i), pz = pa.getZ(i), n = 0.74 + 0.56 * fbm(px * 1.3 + seed, py * 1.3 + pz, seed, 3, 0, 0), fl = Math.max(-0.55, py * n * sq);   // flat where it rests
        pa.setXYZ(i, px * n, fl, pz * n);
      }
      geo.computeVertexNormals();
      var na = geo.attributes.normal;
      for (var j = 0; j < pa.count; j++) {
        var wx = x + pa.getX(j) * s, wy = y + pa.getY(j) * s, wz = z + pa.getZ(j) * s;
        tintAt(wx, wy * 3, wz, c);
        if (lit3d === false) { l[0] = l[1] = l[2] = 1; } else lightAt(wx, wy, wz, na.getX(j), na.getY(j), na.getZ(j), l);
        var ground = 0.62 + 0.38 * sm(-0.55, 0.1, pa.getY(j));   // dark where it meets the ground
        colr[j * 3] = c[0] * l[0] * ground * (tint || 1); colr[j * 3 + 1] = c[1] * l[1] * ground * (tint || 1); colr[j * 3 + 2] = c[2] * l[2] * ground * (tint || 1);
      }
      geo.setAttribute('color', new T.BufferAttribute(colr, 3));
      var m = new T.Mesh(geo, boulderMat); m.position.set(x, y, z); m.scale.setScalar(s);
      scene.add(m); return m;
    }
    var rb = lcg(71);
    for (var bi = 0; bi < 30; bi++) {   // the great fall of 1971, under and south of the arch
      var bs = 7 + Math.pow(rb(), 2) * 20, bx = bedX(60) - 46 + rb() * 100, bz = -24 + rb() * 190;
      boulder(bx, floorY(bx, bz) + bs * 0.42, bz, bs, 100 + bi, 0.98);
    }
    // (to the west of Hermes and behind him: nothing stands between the glass and the gorge)
    var blocks = [[100.0, 0.75, 7.7, 1.7, 11], [97.8, 0.55, 5.3, 1.3, 12], [101.6, 0.42, 4.4, 1.0, 13], [103.3, 0.36, 5.9, 0.8, 14], [96.4, 0.36, 8.6, 0.9, 15], [-178.5, 1.0, -6.5, 2.4, 16], [-181, 0.7, -1.5, 1.7, 17], [-176.5, 0.5, -8.6, 1.2, 18]];
    blocks.forEach(function (b) { boulder(b[0], b[1], b[2], b[3], b[4], 1.02); });
    // the ledge under the lip, where a man can lie out of sight
    var ledge = boulder(110.2, -5.5, 12.4, 1, 21, 0.9); ledge.scale.set(4.4, 1.3, 2.6); ledge.rotation.set(0, 0.15, 0);

    // rubble by the thousand: one drawing for all of it, each stone with the light of the place where it lies
    var rubbleGeo = (function () {
      var g = new T.IcosahedronGeometry(1, 1), pa = g.attributes.position, col = new Float32Array(pa.count * 3);
      for (var i = 0; i < pa.count; i++) { var px = pa.getX(i), py = pa.getY(i), pz = pa.getZ(i), n = 0.7 + 0.6 * fbm(px * 1.9 + 4, py * 1.9 + pz, 7, 2, 0, 0); pa.setXYZ(i, px * n, Math.max(-0.4, py * n * 0.7), pz * n); }
      g.computeVertexNormals();
      for (var j = 0; j < pa.count; j++) { var k = 0.55 + 0.5 * sm(-0.4, 0.6, pa.getY(j)) + 0.1 * g.attributes.normal.getX(j); col[j * 3] = k; col[j * 3 + 1] = k; col[j * 3 + 2] = k; }
      g.setAttribute('color', new T.BufferAttribute(col, 3));
      return g;
    })();
    var RUB = 1500, rubble = new T.InstancedMesh(rubbleGeo, new T.MeshBasicMaterial({ map: sandTex, vertexColors: true }), RUB), dummy = new T.Object3D(), rc = new T.Color(), rl = [1, 1, 1], rt = [1, 1, 1], ri = 0;
    rubble.frustumCulled = false;
    var KEEP = [[216, -72, 9], [-157, 9.5, 7], [105, 9, 8]];   // nothing is strewn round the survey stones or where Hermes lies
    function kept(x, z) { return KEEP.some(function (k) { return Math.hypot(x - k[0], z - k[1]) < k[2]; }); }
    function stone(x, y, z, s, flat) {
      if (ri >= RUB || kept(x, z)) return;
      dummy.position.set(x, y + s * 0.25, z); dummy.rotation.set(rb() * 0.6, rb() * 6.3, rb() * 0.6); dummy.scale.set(s * (0.8 + rb() * 0.5), s * (flat || (0.6 + rb() * 0.5)), s * (0.8 + rb() * 0.5)); dummy.updateMatrix();
      rubble.setMatrixAt(ri, dummy.matrix);
      tintAt(x, y * 3 + rb() * 40, z, rt); lightAt(x, y + s * 0.5, z, 0, 1, 0, rl);
      var v = 0.86 + rb() * 0.3;
      rubble.setColorAt(ri, rc.setRGB(rt[0] * rl[0] * v * 0.82, rt[1] * rl[1] * v * 0.68, rt[2] * rl[2] * v * 0.56)); ri++;
    }
    // scree along the feet of both walls; stones in the dry bed; fallen blocks on the terraces and along the rims
    for (var si2 = 0; si2 < 620; si2++) {
      var gz = rb() < 0.75 ? lerp(-260, 480, rb()) : lerp(Z0 + 400, 950, rb()), side = rb() < 0.5 ? -1 : 1, yy = FLOOR + 6 + Math.pow(rb(), 1.7) * 70;
      var gx = side > 0 ? eastX(gz, yy) - 1.5 - rb() * 3 : westX(gz, yy) + 1.5 + rb() * 3;
      stone(gx, yy - 2.5, gz, 1.2 + Math.pow(rb(), 3) * 7);
    }
    for (var sj = 0; sj < 380; sj++) { var wz = lerp(-300, 620, rb()), wx = bedX(wz) + (rb() - 0.5) * (rb() < 0.6 ? 60 : 150); stone(wx, floorY(wx, wz), wz, 0.5 + Math.pow(rb(), 3) * 3.4, 0.5); }
    for (var sk = 0; sk < 230; sk++) { var s3 = rb() * LEG1 * 5.6, tp = trackAt(s3), inn = rb() < 0.7; stone(tp[0] + (inn ? 2.6 + rb() * 1.2 : -3.2 + rb() * 0.6), tp[1] + 0.2, tp[2] + (rb() - 0.5) * 3, 0.14 + Math.pow(rb(), 2) * 0.5); }
    for (var sl = 0; sl < 270; sl++) { var rz = lerp(-420, 520, rb()), east = rb() < 0.6, rx = east ? eastX(rz, 0) + 2 + Math.pow(rb(), 2) * 60 : westX(rz, 0) - 2 - Math.pow(rb(), 2) * 46; if (Math.abs(rz) < 16 && Math.abs(rx) < 200) continue; stone(rx, 0, rz, 0.3 + Math.pow(rb(), 3) * 2.2); }
    rubble.count = ri; rubble.instanceMatrix.needsUpdate = true; if (rubble.instanceColor) rubble.instanceColor.needsUpdate = true;
    scene.add(rubble);

    // ---- what grows here: saltbush and dry thorn on the rims, in the wash and on the terraces (two crossed leaves of
    // painted twigs for each bush, one drawing for all of them) ----
    var bushTex = P.canvasTex(128, 128, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var r = lcg(63);
      for (var i = 0; i < 46; i++) {
        var x = w / 2 + (r() - 0.5) * 14, y = h - 2, a = -Math.PI / 2 + (r() - 0.5) * 1.9, len = 26 + r() * 58;
        g.strokeStyle = r() < 0.5 ? 'rgba(96,84,52,0.95)' : 'rgba(128,112,70,0.95)'; g.lineWidth = 1 + r() * 1.6; g.beginPath(); g.moveTo(x, y);
        for (var s2 = 0; s2 < 5; s2++) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * len / 5; y += Math.sin(a) * len / 5; g.lineTo(x, y); if (r() < 0.8) { g.fillStyle = r() < 0.6 ? 'rgba(138,140,92,0.9)' : 'rgba(170,160,110,0.9)'; g.fillRect(x - 2, y - 2, 3 + r() * 4, 2 + r() * 3); } }
        g.stroke();
      }
    });
    var bushGeo = (function () {
      var a = new T.PlaneGeometry(1, 1), b = new T.PlaneGeometry(1, 1); a.translate(0, 0.5, 0); b.translate(0, 0.5, 0); b.rotateY(Math.PI / 2);
      var g = new T.BufferGeometry(), pos = [], uv = [], idx = [];
      [a, b].forEach(function (q, n) { for (var i = 0; i < 4; i++) { pos.push(q.attributes.position.getX(i), q.attributes.position.getY(i), q.attributes.position.getZ(i)); uv.push(q.attributes.uv.getX(i), q.attributes.uv.getY(i)); } [0, 2, 1, 2, 3, 1].forEach(function (k) { idx.push(k + n * 4); }); });
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
      return g;
    })();
    var BUSH = 620, bushes = new T.InstancedMesh(bushGeo, new T.MeshBasicMaterial({ map: bushTex, alphaTest: 0.5, side: T.DoubleSide }), BUSH), bn = 0;
    bushes.frustumCulled = false;
    function bush(x, y, z, s) {
      if (bn >= BUSH || kept(x, z)) return;
      dummy.position.set(x, y - 0.05, z); dummy.rotation.set(0, rb() * 3.1, (rb() - 0.5) * 0.2); dummy.scale.set(s * (1 + rb() * 0.6), s, s * (1 + rb() * 0.6)); dummy.updateMatrix();
      bushes.setMatrixAt(bn, dummy.matrix); lightAt(x, y + s * 0.5, z, 0, 1, 0, rl);
      var v = 0.8 + rb() * 0.4; bushes.setColorAt(bn, rc.setRGB(rl[0] * v, rl[1] * v, rl[2] * v * 0.92)); bn++;
    }
    for (var b1 = 0; b1 < 330; b1++) { var bz2 = lerp(-520, 640, rb()), be = rb() < 0.6, bx2 = be ? eastX(bz2, 0) + 3 + Math.pow(rb(), 1.6) * 150 : westX(bz2, 0) - 3 - Math.pow(rb(), 1.6) * 60; if (Math.abs(bz2) < 12) continue; bush(bx2, be ? fbm(bx2 * 0.012, bz2 * 0.012, 43, 3, 0, 0) * 14 * sm(0.2, 0.7, Math.sqrt(Math.max(0, bx2 - eastX(bz2, 0)) / 2450)) - 0.2 : 0, bz2, 0.7 + rb() * 1.5); }
    for (var b2 = 0; b2 < 210; b2++) { var bz3 = lerp(-300, 640, rb()), bx3 = bedX(bz3) + (rb() < 0.5 ? -1 : 1) * (14 + rb() * 70); bush(bx3, floorY(bx3, bz3), bz3, 1.2 + rb() * 2.6); }
    for (var b3 = 0; b3 < 70; b3++) { var tq = trackAt(rb() * LEG1 * 5.6); bush(tq[0] + 2.8 + rb(), tq[1] + 0.2, tq[2] + (rb() - 0.5) * 2, 0.5 + rb() * 0.8); }
    bushes.count = bn; bushes.instanceMatrix.needsUpdate = true; if (bushes.instanceColor) bushes.instanceColor.needsUpdate = true;
    scene.add(bushes);

    // ---- far country: buttes and mesas standing on the plateau, and the rim of the world in layers ----
    function butte(x, z, r0, h, seed) {
      var seg = 22, rows = 9, pos = [], uv = [], idx = [];
      for (var j = 0; j <= rows; j++) {
        var v = j / rows, yy = h * (v < 0.45 ? v * 0.8 : 0.36 + (v - 0.45) * 1.164), taper = v < 0.45 ? 1 - 0.56 * Math.pow(v / 0.45, 0.7) : 0.44 - 0.05 * sm(0.45, 1, v);   // a wide skirt of scree, then the tower of cliff, then a flat top
        for (var i = 0; i <= seg; i++) { var a = i / seg * Math.PI * 2, rr = r0 * taper * (0.7 + 0.6 * fbm(Math.cos(a) * 2.2 + seed, Math.sin(a) * 2.2 + (v > 0.45 ? 0.6 : v), seed, 3, 0, 0)); pos.push(x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr * 0.8); uv.push(a * r0 / 52, yy / 52); }
      }
      for (var b = 0; b < rows; b++) for (var c2 = 0; c2 < seg; c2++) { var i0 = b * (seg + 1) + c2, i1 = i0 + seg + 1; idx.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1); }
      var top = pos.length / 3; pos.push(x, h, z); uv.push(0, 0);
      for (var t2 = 0; t2 < seg; t2++) idx.push(rows * (seg + 1) + t2, top, rows * (seg + 1) + t2 + 1);
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      var pa = geo.attributes.position, na = geo.attributes.normal, col = new Float32Array(pa.count * 3), c = [1, 1, 1];
      for (var q = 0; q < pa.count; q++) {   // out in the open: the sun, the sky, no gorge to shade it
        var nx = na.getX(q), ny = na.getY(q), nz = na.getZ(q), ndl = Math.max(0, (nx * SUN.x + ny * SUN.y + nz * SUN.z + 0.12) / 1.12), am = 0.5 + 0.2 * ny;
        tintAt(pa.getX(q), pa.getY(q) - 200, pa.getZ(q), c);
        col[q * 3] = c[0] * (SUNC[0] * ndl + SKYC[0] * am); col[q * 3 + 1] = c[1] * (SUNC[1] * ndl + SKYC[1] * am); col[q * 3 + 2] = c[2] * (SUNC[2] * ndl + SKYC[2] * am);
      }
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
      var m = new T.Mesh(geo, rockMat); m.frustumCulled = false; scene.add(m); return m;
    }
    [[980, -560, 230, 130, 3], [1350, 240, 300, 150, 5], [1180, -1350, 200, 190, 7], [1900, -640, 360, 170, 9], [900, 1000, 210, 100, 11], [1700, 1250, 320, 160, 13], [2250, 330, 260, 210, 15],
     [-820, -900, 190, 230, 17], [-1250, 420, 260, 250, 19], [-760, 1300, 160, 200, 21], [420, 1650, 110, 90, 23], [-300, 2300, 240, 130, 25]].forEach(function (b) { butte(b[0], b[1], b[2], b[3], b[4]); });
    SC.ridges(scene, { horizon: HORIZON, rings: [
      { R: 2700, h: 190, seed: 6, col: U.hex(0xc98860), haze: 0.55 },
      { R: 3300, h: 320, seed: 13, col: U.hex(0xb08a86), haze: 0.75 }
    ] });

    // ---- the air of the gorge: night mist still lying in its depths, shafts of the first sun over the eastern rim ----
    var mistTex = P.canvasTex(256, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var r = lcg(81);
      for (var i = 0; i < 60; i++) { var x = w * (0.2 + r() * 0.6), y = h * (0.3 + r() * 0.4), rr = 22 + r() * 60, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    });
    var mists = [];
    for (var mi = 0; mi < 22; mi++) {
      var mz = lerp(-520, 700, rb()), mx = bedX(mz) + (rb() - 0.5) * 80, my = FLOOR + 22 + rb() * 120, ms = 150 + rb() * 220, lit = sunAt(mx, my, mz);
      var sp = new T.Sprite(new T.SpriteMaterial({ map: mistTex, color: new T.Color().setRGB(lerp(0.62, 1.0, lit), lerp(0.7, 0.86, lit), lerp(0.95, 0.7, lit)), transparent: true, opacity: 0, depthWrite: false }));
      sp.position.set(mx, my, mz); sp.scale.set(ms * 1.8, ms * 0.6, 1); scene.add(sp);
      mists.push({ s: sp, x: mx, z: mz, y: my, ph: rb() * 6.3, k: 0.12 + rb() * 0.16 + lit * 0.1, v: 1.2 + rb() * 2.2 });
    }
    var shaftTex = P.canvasTex(64, 256, function (g, w, h) { var im = g.createImageData(w, h), d = im.data; for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var u = Math.abs(x / (w - 1) - 0.5) * 2, a = Math.pow(1 - u, 2) * sm(0, 0.12, y / (h - 1)) * (1 - sm(0.45, 1, y / (h - 1))), q = (y * w + x) * 4; d[q] = 255; d[q + 1] = 214; d[q + 2] = 150; d[q + 3] = a * 255; } g.putImageData(im, 0, 0); });
    var shafts = [];
    // each shaft starts where the sun comes over the eastern rim and falls down its own direction into the shade
    var shaftQ = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, -1, 0), SUN.clone().multiplyScalar(-1));
    for (var sh = 0; sh < 9; sh++) {
      var sz = lerp(60, 520, sh / 8) + rb() * 30, sx0 = eastX(sz, 0) - 4, len = 330 + rb() * 120, wd = 26 + rb() * 44;
      var pl = new T.Mesh(new T.PlaneGeometry(wd, len), new T.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.1, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }));
      pl.geometry.translate(0, -len / 2, 0); pl.quaternion.copy(shaftQ); pl.rotateY(0.6 + rb() * 0.8);
      pl.position.set(sx0, 2, sz); scene.add(pl); shafts.push({ m: pl, ph: rb() * 6.3, base: 0.05 + rb() * 0.07 });
    }

    // ---- light for what moves (Hermes, the raiders, the camels, the wagons): the same sun, and a sky to fill the shade ----
    var L = SC.lights(scene, { key: 0xffd4a0, keyI: 1.55, kx: EYE.x + SUN.x * 30, ky: SUN.y * 30 + 6, kz: EYE.z + SUN.z * 30, tx: EYE.x, tz: EYE.z - 2, fill: 0xa9c0ff, fillI: 0.3, back: 0xffb070, backI: 0.2, sky: 0xc4d6ff, ground: 0xb8764a, hemi: 0.5, amb: 0.08, shadow: false });
    // Nothing here casts a real shadow (the world is baked), so each one who walks has a long shadow of the dawn laid
    // at its feet, and is dimmed to the blue of the shade wherever the sun does not reach.
    var blobTex = P.canvasTex(64, 128, function (g, w, h) { g.clearRect(0, 0, w, h); var gr = g.createRadialGradient(w / 2, h * 0.86, 0, w / 2, h * 0.86, w * 0.42); gr.addColorStop(0, 'rgba(20,14,30,0.75)'); gr.addColorStop(1, 'rgba(20,14,30,0)'); g.fillStyle = gr; g.fillRect(0, h * 0.6, w, h * 0.4); var g2 = g.createLinearGradient(0, h * 0.86, 0, 0); g2.addColorStop(0, 'rgba(20,14,30,0.5)'); g2.addColorStop(1, 'rgba(20,14,30,0)'); g.fillStyle = g2; g.beginPath(); g.moveTo(w * 0.24, h * 0.86); g.quadraticCurveTo(w * 0.3, h * 0.3, w * 0.42, 2); g.lineTo(w * 0.58, 2); g.quadraticCurveTo(w * 0.7, h * 0.3, w * 0.76, h * 0.86); g.fill(); });
    var SHADOW_YAW = Math.atan2(SUN.x, SUN.z), walkers = [];
    function walker(obj, tall) {
      var mats = [];
      obj.traverse(function (o) { if (o.isMesh && o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.color && mats.every(function (q) { return q.m !== m; })) mats.push({ m: m, base: m.color.clone() }); }); });
      var sh2 = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0 }));
      sh2.geometry.translate(0, 0.36, 0); sh2.geometry.rotateX(-Math.PI / 2); sh2.rotation.y = SHADOW_YAW; sh2.scale.set(tall * 0.9, 1, tall / Math.tan(Math.asin(SUN.y)) * 1.15); sh2.renderOrder = 3; scene.add(sh2);
      var w = { obj: obj, mats: mats, sh: sh2, k: 1, t: Math.random() * 0.4, lit: 1 };
      walkers.push(w); return w;
    }
    var SHADE = [0.5, 0.57, 0.8];
    function walkersFrame(dt) {
      walkers.forEach(function (w) {
        w.t -= dt;
        if (w.t <= 0) { w.t = 0.35; var p = w.obj.position; w.lit = w.obj.visible ? sunAt(p.x, p.y + 1.6, p.z) : 0; }
        var k0 = w.k; w.k += (w.lit - w.k) * Math.min(1, dt * 3);
        if (Math.abs(w.k - k0) > 0.002 || w.fresh !== true) { w.fresh = true; w.mats.forEach(function (q) { q.m.color.setRGB(q.base.r * lerp(SHADE[0], 1, w.k), q.base.g * lerp(SHADE[1], 1, w.k), q.base.b * lerp(SHADE[2], 1, w.k)); }); }
        w.sh.visible = w.obj.visible && w.k > 0.05; w.sh.material.opacity = 0.85 * w.k;
        w.sh.position.set(w.obj.position.x, w.obj.position.y + 0.2, w.obj.position.z);
      });
    }

    // ---- the founders' survey stones: 980 on the eastern rim; its twin on the western abutment (with something on it) ----
    function surveyStone(x, z, rot, blue) {
      var tx = P.canvasTex(160, 256, function (g, w, h) {
        g.fillStyle = '#c9a27c'; g.fillRect(0, 0, w, h);
        var r = lcg(blue ? 9 : 4); for (var i = 0; i < 700; i++) { var v = 130 + r() * 70 | 0; g.fillStyle = 'rgba(' + v + ',' + (v * 0.8 | 0) + ',' + (v * 0.62 | 0) + ',0.3)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
        // the Order's sign, cut deep: a disc half in light, half in shade
        g.fillStyle = 'rgba(52,32,20,0.9)'; g.beginPath(); g.arc(w / 2, 78, 34, Math.PI / 2, Math.PI * 1.5); g.fill();
        g.strokeStyle = 'rgba(52,32,20,0.9)'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, 78, 34, 0, Math.PI * 2); g.stroke();
        g.fillStyle = 'rgba(52,32,20,0.9)'; g.font = '700 54px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.fillText('980', w / 2, 186);
        g.fillRect(34, 206, w - 68, 4);
        if (blue) { g.fillStyle = 'rgba(38,84,178,0.92)'; g.beginPath(); g.ellipse(w * 0.66, 226, 15, 7, -0.3, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(70,120,214,0.8)'; g.beginPath(); g.ellipse(w * 0.6, 229, 6, 3, -0.3, 0, Math.PI * 2); g.fill(); }
      });
      var side = paint({ color: 0xc09a76 });
      var m = new T.Mesh(new T.BoxGeometry(1.5, 2.6, 0.7), [side, side, side, side, paint({ map: tx, color: 0xffffff }), side]);
      m.position.set(x, 1.3, z); m.rotation.y = rot; m.castShadow = true; scene.add(m);
      var cap = new T.Mesh(new T.ConeGeometry(1.0, 0.7, 4), side); cap.position.set(x, 2.95, z); cap.rotation.y = rot + Math.PI / 4; scene.add(cap);
      return m;
    }
    var STONE = { x: 216, z: -72 }, WSTONE = { x: -157, z: 9.5 };
    // each stone turns its carved face to where Hermes lies
    surveyStone(STONE.x, STONE.z, Math.atan2(EYE.x - STONE.x, EYE.z - STONE.z), false);
    surveyStone(WSTONE.x, WSTONE.z, Math.atan2(EYE.x - WSTONE.x, EYE.z - WSTONE.z), true);
    var rag = new T.Mesh(new T.PlaneGeometry(0.5, 0.22), new T.MeshBasicMaterial({ color: 0x2f55b8, side: T.DoubleSide })); rag.position.set(STONE.x, 3.36, STONE.z); rag.rotation.x = -1.2; rag.visible = false; scene.add(rag);

    // ---- Cairn IV, far down the gorge: the twin pillars at its southern mouth ----
    var PILLARS = { x: bedX(880) + 6, z: 880 };
    [-1, 1].forEach(function (sd) {
      var pg = new T.CylinderGeometry(1.5, 1.9, 11, 16, 6), px0 = PILLARS.x + sd * 4.2, py0 = floorY(PILLARS.x, PILLARS.z) + 5.5;
      pg.translate(px0, py0, PILLARS.z); pg.computeVertexNormals();
      var ua = pg.attributes.uv; for (var ui = 0; ui < ua.count; ui++) ua.setXY(ui, ua.getX(ui) * 0.2, ua.getY(ui) * 0.21);
      bakeLight(pg, function (x, y, z, c) { c[0] = 1.5; c[1] = 1.42; c[2] = 1.3; });
      var pl = new T.Mesh(pg, rockMat); pl.frustumCulled = false; scene.add(pl);
    });
    var rings = [0, 1, 2].map(function () { var m = new T.Mesh(new T.RingGeometry(0.9, 1, 48), new T.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false })); m.rotation.x = -Math.PI / 2; m.position.set(PILLARS.x, FLOOR + 4, PILLARS.z); scene.add(m); return { m: m, t: -1 }; });

    // ---- Tower II, on the north-eastern horizon ----
    var TOWER = { x: EYE.x + 1080, z: EYE.z - 1080 };
    var towerMat = new T.MeshBasicMaterial({ color: 0xa8705a });
    var tower = new T.Group();
    [[30, 20, 0], [20, 18, 20], [12, 16, 38], [6, 14, 54]].forEach(function (b) { var m = new T.Mesh(new T.BoxGeometry(b[0], b[1], b[0]), towerMat); m.position.y = b[2] + b[1] / 2; tower.add(m); });
    tower.position.set(TOWER.x, 0, TOWER.z); tower.rotation.y = 0.5; scene.add(tower);
    var glint = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xfff2c8, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
    glint.position.set(TOWER.x, 72, TOWER.z); glint.scale.set(15, 15, 1); scene.add(glint);

    // ---- the raiders' wagons ----
    var woodTex = SC.tex.wood ? SC.tex.wood(0x6a4a2c, 3) : null;
    var woodMat = paint(woodTex ? { map: woodTex, color: 0xffffff } : { color: 0x6a4a2c });
    var wheelTex = P.canvasTex(128, 128, function (g, w) {
      g.clearRect(0, 0, w, w); g.translate(w / 2, w / 2);
      g.strokeStyle = '#3a2614'; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 54, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 6; for (var i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 50); g.stroke(); }
      g.fillStyle = '#2a1a0c'; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill();
    });
    var wheelMat = new T.MeshLambertMaterial({ map: wheelTex, transparent: true, alphaTest: 0.4, side: T.DoubleSide });
    var canvasTexA = SC.tex.cloth ? SC.tex.cloth(0xd9c7a0, 0xc4b088, 6, 3) : null;
    // the oilcloth: u runs over the hoops from one flank to the other, so the mark is burned once into each flank,
    // its head toward the ridge of the cover
    var phoenixTex = P.canvasTex(512, 256, function (g, w, h) {
      g.fillStyle = '#20241c'; g.fillRect(0, 0, w, h);
      var r = lcg(3); for (var i = 0; i < 34; i++) { g.strokeStyle = 'rgba(' + (r() < 0.5 ? '70,78,60' : '8,10,6') + ',0.35)'; g.lineWidth = 2 + r() * 5; g.beginPath(); var y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 14, w * 0.6, y - 14, w, y + 6); g.stroke(); }
      // the mark of the BC Ashes: a bird with its wings up, rising out of three flames
      function mark() {
        g.fillStyle = '#e8842c';
        [-34, 0, 34].forEach(function (fxp, n) { g.beginPath(); g.moveTo(fxp, 72); g.quadraticCurveTo(fxp - 16, 46, fxp, n === 1 ? 14 : 28); g.quadraticCurveTo(fxp + 16, 46, fxp, 72); g.fill(); });
        g.beginPath(); g.moveTo(0, 22); g.quadraticCurveTo(-9, -4, 0, -30); g.quadraticCurveTo(9, -4, 0, 22); g.fill();
        g.beginPath(); g.arc(0, -36, 7, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(5, -38); g.lineTo(16, -35); g.lineTo(5, -32); g.fill();
        [-1, 1].forEach(function (sd) { g.beginPath(); g.moveTo(sd * 4, -8); g.quadraticCurveTo(sd * 44, -22, sd * 62, -74); g.quadraticCurveTo(sd * 40, -48, sd * 30, -52); g.quadraticCurveTo(sd * 30, -34, sd * 18, -34); g.quadraticCurveTo(sd * 16, -18, sd * 4, 6); g.fill(); });
      }
      g.save(); g.translate(w * 0.15, h / 2); g.rotate(Math.PI / 2); g.scale(0.74, 1.0); mark(); g.restore();
      g.save(); g.translate(w * 0.85, h / 2); g.rotate(-Math.PI / 2); g.scale(0.74, 1.0); mark(); g.restore();
    });
    function buildWagon(oil) {
      var g = new T.Group();
      var bed = new T.Mesh(new T.BoxGeometry(2.3, 0.7, 4.4), woodMat); bed.position.y = 1.35; g.add(bed);
      var pole = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 3.2, 6), woodMat); pole.rotation.x = Math.PI / 2; pole.position.set(0, 1.1, -3.7); g.add(pole);
      var tarpMat = oil ? new T.MeshLambertMaterial({ map: phoenixTex, side: T.DoubleSide }) : paint(canvasTexA ? { map: canvasTexA, color: 0xffffff, side: T.DoubleSide } : { color: 0xd9c7a0, side: T.DoubleSide });
      // the cover: half a barrel of cloth over three hoops, open at both ends
      var tarp = new T.Mesh(new T.CylinderGeometry(1.22, 1.22, 4.3, 14, 1, true, Math.PI / 2, Math.PI), tarpMat);
      tarp.rotation.x = Math.PI / 2; tarp.position.y = 1.7; tarp.scale.set(1, 1, 1.3); g.add(tarp);
      var wheels = [];
      [-1.45, 1.45].forEach(function (z) { [-1.26, 1.26].forEach(function (x) { var wh = new T.Mesh(new T.CircleGeometry(0.95, 20), wheelMat); wh.rotation.y = Math.PI / 2; wh.position.set(x, 0.95, z); g.add(wh); wheels.push(wh); }); });
      g.userData = { wheels: wheels, oil: !!oil };
      g.traverse(function (o) { if (o.isMesh) { o.frustumCulled = false; o.material = o.material.clone(); } });
      scene.add(g); return g;
    }
    function onTrack(obj, s, yaw, lift) { var p = trackAt(s); obj.position.set(p[0] - 0.4, p[1] + 0.25 + (lift || 0), p[2]); obj.rotation.y = yaw == null ? p[3] : yaw; return p; }
    var wagonA = buildWagon(false), wagonB = buildWagon(false), wagonC = buildWagon(true);
    var WA = { s: LEG1 - 1.5, s0: LEG1 - 1.5 }, WB = { s: LEG1 * 0.72, s0: LEG1 * 0.72 }, WC = { s: LEG1 * 0.44, s0: LEG1 * 0.44 };
    // the pack camels that draw them (one each: the terraces are narrow)
    var camels = [];
    function addCamel(seed) { var c = SC.chars.camel ? SC.chars.camel(paint, { seed: seed }) : new T.Group(); c.scale.setScalar(1.5); scene.add(c); camels.push(c); return c; }
    var camB = addCamel(2), camC = addCamel(5);

    // ---- the raiders: three heave at the wedged wagon, two guard the covered one, a leader and his second at the turn ----
    var raiders = [];
    function addRaider(seed) { var r = SC.chars.raider(paint, { robe: seed % 2 ? 0x4a3428 : 0x3a3634, wrap: 0x221814, sash: 0x7a2a18, seed: 30 + seed }); r.scale.setScalar(1.25); scene.add(r); var o = { g: r, role: '', walk: null, ph: seed * 1.7 }; raiders.push(o); return o; }
    var heavers = [addRaider(1), addRaider(2), addRaider(3)], guards = [addRaider(4), addRaider(5)], leader = addRaider(6), second = addRaider(7);
    var footmen = [leader, second, heavers[0], heavers[1]];   // the four who come back up
    raiders.forEach(function (r) { walker(r.g, 2.3); }); camels.forEach(function (c) { walker(c, 2.9); }); [wagonA, wagonB, wagonC].forEach(function (w) { walker(w, 2.6); });

    // ---- the raiders' camp on the first terrace: last night's fire still smoking, and their gear beside the wagons ----
    var CAMP = trackAt(LEG1 * 0.58), campG = new T.Group();
    campG.position.set(CAMP[0] + 2.3, CAMP[1] + 0.25, CAMP[2]);
    (function () {
      var ash = new T.Mesh(new T.CircleGeometry(0.8, 14), new T.MeshBasicMaterial({ color: 0x241c18 })); ash.rotation.x = -Math.PI / 2; ash.position.y = 0.03; campG.add(ash);
      for (var i = 0; i < 9; i++) { var a = i / 9 * Math.PI * 2, st = new T.Mesh(new T.IcosahedronGeometry(0.2, 0), paint({ color: 0x6a5648 })); st.position.set(Math.cos(a) * 0.85, 0.1, Math.sin(a) * 0.85); st.scale.y = 0.7; campG.add(st); }
      var ember = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xff7a30, transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending })); ember.position.y = 0.2; ember.scale.set(1.3, 0.8, 1); campG.add(ember); campG.userData.ember = ember;
      [['crate', -1.7, 1.6, 0.4], ['sack', -1.1, 2.5, 1.2], ['crate', 0.4, -2.2, 1.9], ['amphora', 1.0, 2.1, 0], ['sack', -0.2, -3.0, 0.3]].forEach(function (q) {
        var f = SC.props[q[0]]; if (!f) return;
        var o; try { o = f(paint, {}); } catch (e) { o = null; }
        if (o) { o.position.set(q[1], 0, q[2]); o.rotation.y = q[3]; o.scale.setScalar(1.25); campG.add(o); }
      });
    })();
    scene.add(campG); walker(campG, 0.01);
    // ---- swifts hunting along the rim of the arch: one drawing for the whole flock, wings beaten in the vertices ----
    var SW = 18, swPos = new Float32Array(SW * 18), swGeo = new T.BufferGeometry();
    swGeo.setAttribute('position', new T.BufferAttribute(swPos, 3));
    var swifts = new T.Mesh(swGeo, new T.MeshBasicMaterial({ color: 0x1c1410, side: T.DoubleSide })); swifts.frustumCulled = false; scene.add(swifts);
    var swState = []; for (var sw0 = 0; sw0 < SW; sw0++) swState.push({ a: rb() * 6.3, r: 26 + rb() * 60, y: -40 - rb() * 150, sp: 0.5 + rb() * 0.5, ph: rb() * 6.3, cx: 10 + (rb() - 0.5) * 120, cz: 30 + rb() * 120 });
    function swiftsFrame(t) {
      for (var i = 0; i < SW; i++) {
        var q = swState[i], a = q.a + t * q.sp, x = q.cx + Math.cos(a) * q.r, z = q.cz + Math.sin(a * 0.83 + q.ph) * q.r * 0.8, y = q.y + Math.sin(t * 0.7 + q.ph) * 14 + Math.sin(a * 2.3) * 6;
        var hx = -Math.sin(a) * q.sp, hz = Math.cos(a * 0.83 + q.ph) * 0.83 * q.sp * 0.8, hl = Math.hypot(hx, hz) || 1; hx /= hl; hz /= hl;   // where it is heading
        var flap = Math.sin(t * 17 + q.ph * 3) * 0.55 * (0.4 + 0.6 * Math.max(0, Math.sin(t * 0.9 + q.ph))), wx = -hz * 1.25, wz = hx * 1.25, wy = flap * 1.0, o = i * 18;
        // two wings: body, wingtip, tail
        swPos[o] = x + hx * 0.5; swPos[o + 1] = y; swPos[o + 2] = z + hz * 0.5; swPos[o + 3] = x + wx; swPos[o + 4] = y + wy; swPos[o + 5] = z + wz; swPos[o + 6] = x - hx * 0.45; swPos[o + 7] = y; swPos[o + 8] = z - hz * 0.45;
        swPos[o + 9] = x + hx * 0.5; swPos[o + 10] = y; swPos[o + 11] = z + hz * 0.5; swPos[o + 12] = x - wx; swPos[o + 13] = y + wy; swPos[o + 14] = z - wz; swPos[o + 15] = x - hx * 0.45; swPos[o + 16] = y; swPos[o + 17] = z - hz * 0.45;
      }
      swGeo.attributes.position.needsUpdate = true;
    }
    // ---- a dust devil wandering up the dry bed of the wash ----
    var devil = new T.Group(), devilParts = [];
    for (var dv = 0; dv < 9; dv++) { var ds = new T.Sprite(new T.SpriteMaterial({ map: SC.tex.soft(), color: 0xe6c8a0, transparent: true, opacity: 0.22, depthWrite: false })); ds.position.y = 3 + dv * 6.5; ds.scale.set(8 + dv * 3.2, 10, 1); devil.add(ds); devilParts.push(ds); }
    scene.add(devil);

    // ---- an eagle turning in the cold air under the arch ----
    var eagle = new T.Group();
    var wingMat = new T.MeshBasicMaterial({ color: 0x2a1c14, side: T.DoubleSide });
    var wingL = new T.Mesh(new T.PlaneGeometry(4.2, 1.2), wingMat), wingR = new T.Mesh(new T.PlaneGeometry(4.2, 1.2), wingMat);
    wingL.geometry.translate(-2.1, 0, 0); wingR.geometry.translate(2.1, 0, 0); wingL.rotation.x = wingR.rotation.x = -Math.PI / 2;
    var eL = new T.Group(), eR = new T.Group(); eL.add(wingL); eR.add(wingR); eagle.add(eL, eR); scene.add(eagle);

    // ---- Hermes, at the lip of the span, his spyglass out ----
    var Hh = P.buildHermes(T, SC.tex.soft()), hermes = Hh.hermes;
    hermes.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(hermes);
    walker(hermes, 1.9);
    var brass = new T.MeshStandardMaterial({ color: 0xc9973a, metalness: 0.85, roughness: 0.32 });
    var glassTube = new T.Group();
    [[0.045, 0.3, 0], [0.036, 0.28, 0.27], [0.028, 0.26, 0.52]].forEach(function (s) { var m = new T.Mesh(new T.CylinderGeometry(s[0], s[0], s[1], 12), brass); m.rotation.x = Math.PI / 2; m.position.z = -s[2]; glassTube.add(m); });
    // it rides with his head, at his right eye; the hand comes up to it
    if (Hh.head) { Hh.head.add(glassTube); glassTube.position.set(0.075, 0.05, -0.2); glassTube.rotation.set(0, 0, 0); }
    glassTube.visible = false;
    var HOME = { x: 105.6, z: 8.5, rot: Math.PI - 0.25 };   // facing south-south-east, over the lip
    var dot = new T.Sprite(new T.SpriteMaterial({ color: 0x1d3f9c, fog: false })); dot.scale.set(3.2, 5.2, 1); dot.visible = false; scene.add(dot);   // Hermes seen from half a league away
    var pebble = boulder(0, -1000, 0, 0.9, 77, 0.8, false);   // the stone that turns under his boot

    // the shared feel (EclipseFX): a warm dawn grade, Hermes breathing; no footprints (the deck is bare rock)
    efx = null;
    try {
      if (window.EclipseFX) efx = window.EclipseFX.kit(renderer, scene, Hh, {
        look: { bloom: 0.5, threshold: 0.84, knee: 0.2, vignette: 0.3, grain: 0.028, ca: 0.14, sat: 1.04, contrast: 1.05, gain: [1.04, 1.0, 0.95], shafts: 0.16, shaftThreshold: 0.6, shaftColor: [1.0, 0.86, 0.66], shade: 0.26, shadeColor: [0.56, 0.64, 0.96] },
        sun: SUN, printsOn: true, printLife: 60, printY: 0.17, printColor: 0x7a5236, sandColor: 0xd9b78c, scale: 1, idle: 0.0012, maxDust: 440,
        printsWhere: function () { return world.prints; }
      });
    } catch (e) { efx = null; }

    // ---- the state of the world ----
    var world = { phase: 'stuck', t0: 0, prints: false, sing: -1, vert: 0, shake: 0, crouch: 0, low: false, smokeT: 0, windT: 1, fallT: 4 };
    var walks = [], timers = [];
    function later(sec, fn) { timers.push({ t: sec, fn: fn }); }
    function adiff(a, b) { return ((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI; }
    // a walker follows a list of points at a speed; its legs follow on their own (the scenery's persona, or Hermes's gait)
    function walkPath(obj, pts, speed, then) { walks = walks.filter(function (w) { return w.obj !== obj; }); walks.push({ obj: obj, pts: pts.slice(), speed: speed, then: then || null }); }
    function place() {
      onTrack(wagonA, WA.s, trackAt(WA.s)[3] + 0.95, 0); wagonA.rotation.z = 0.16;        // wedged across the turn, one wheel over the drop
      onTrack(wagonB, WB.s); onTrack(wagonC, WC.s); wagonB.rotation.z = wagonC.rotation.z = 0;
      var pb = onTrack(camB, WB.s - 6.2); camB.rotation.y = pb[3]; var pc = onTrack(camC, WC.s - 6.2); camC.rotation.y = pc[3];
      camels.forEach(function (c) { if (c.userData.walk) c.userData.walk(false); if (c.userData.kneel) c.userData.kneel(0, true); });
      heavers.forEach(function (r, i) { var p = trackAt(WA.s - 3.6 - i * 1.5); r.g.position.set(p[0] + (i - 1) * 1.1, p[1] + 0.25, p[2]); r.g.rotation.y = p[3] + Math.PI; r.role = 'heave'; r.g.visible = true; });
      guards.forEach(function (r, i) { var p = trackAt(WC.s + (i ? 3.4 : -3.8)); r.g.position.set(p[0] - 1.6, p[1] + 0.25, p[2]); r.g.rotation.y = i ? 0.4 : 2.6; r.role = 'guard'; r.g.visible = true; });
      var ph = trackAt(LEG1 + 4); leader.g.position.set(ph[0] + 1.5, ph[1] + 0.25, ph[2] - 1); leader.g.rotation.y = 0.6; leader.role = 'lead';
      second.g.position.set(ph[0] - 0.6, ph[1] + 0.25, ph[2] + 1.4); second.g.rotation.y = -2.2; second.role = 'lead';
      raiders.forEach(function (r) { r.walk = null; r.g.visible = true; });
      WA.s = WA.s0; WB.s = WB.s0; WC.s = WC.s0;
      hermes.visible = true; hermes.position.set(HOME.x, 0, HOME.z); hermes.rotation.y = HOME.rot;
      dot.visible = false; rag.visible = false; glassTube.visible = false; pebble.position.y = -1000; hold(null);
      walks = []; timers = []; world.phase = 'stuck'; world.prints = false; world.sing = -1; world.vert = 0; world.low = false;
    }

    // ---- the camera: a told shot (wide), or the eye at the glass ----
    var PRINT = { p: [40, 46, 800], l: [0, -112, 0] };   // the view of the two printed pages: from the south, a little above the rim
    var cam = { mode: 'wide', p: new T.Vector3(0, -70, 640), l: new T.Vector3(0, -120, 0), gp: new T.Vector3(0, -70, 640), gl: new T.Vector3(0, -120, 0), fov: 46, gfov: 46, k: 0.5, follow: null };
    var G = { yaw: 196 * DEG, pitch: -13 * DEG, tYaw: 196 * DEG, tPitch: -13 * DEG, zoom: 0, fov: FOVS[0], rack: 0, speed: 0, focusId: null, focusT: 0, noteT: 0, point: null, auto: null, drag: null, pinch: 0, blur: -1 };
    function shot(p, l, fov, k, snap) { cam.gp.set(p[0], p[1], p[2]); cam.gl.set(l[0], l[1], l[2]); cam.gfov = fov || 46; cam.k = k || 0.5; cam.follow = null; if (snap) { cam.p.copy(cam.gp); cam.l.copy(cam.gl); cam.fov = cam.gfov; } }
    function dirOf(yaw, pitch, out) { var c = Math.cos(pitch); return out.set(Math.sin(yaw) * c, Math.sin(pitch), -Math.cos(yaw) * c); }
    var tmp = new T.Vector3(), tmp2 = new T.Vector3(), vdir = new T.Vector3();
    function sightPos(id, out) {
      if (id === 'wagons' || id === 'hairpin') return out.copy(wagonA.position).setY(wagonA.position.y + 1.4);
      if (id === 'oilcloth') return out.copy(wagonC.position).setY(wagonC.position.y + 2.2);
      if (id === 'stone') return out.set(STONE.x, 1.5, STONE.z);
      if (id === 'blue') return out.set(WSTONE.x, 0.7, WSTONE.z);
      if (id === 'boulders') return out.set(-8, FLOOR + 12, 78);
      if (id === 'tower') return out.set(TOWER.x, 38, TOWER.z);
      if (id === 'pillars') return out.set(PILLARS.x, FLOOR + 7, PILLARS.z);
      return out.set(0, 0, 0);
    }
    function aimAt(id) { sightPos(id, tmp).sub(tmp2.set(EYE.x, EYE.y, EYE.z)); var h = Math.hypot(tmp.x, tmp.z); return { yaw: Math.atan2(tmp.x, -tmp.z), pitch: Math.atan2(tmp.y, h) }; }
    function setZoom(z) {
      z = Math.max(0, Math.min(2, z | 0));
      if (z === G.zoom) return;
      G.zoom = z; G.rack = 1; cue('lens');
      if (lens) lens.pips.forEach(function (p, i) { p.classList.toggle('is-on', i <= z); });
    }
    function showLens(on) {
      if (!lens) return;
      lens.box.hidden = !on;
      stage.classList.toggle('is-glass', !!on);
      if (on) { lens.pips.forEach(function (p, i) { p.classList.toggle('is-on', i <= G.zoom); }); sizeLens(); }
      else { canvas.style.filter = ''; G.blur = -1; }
    }
    function sizeLens() {
      if (!lens) return;
      var W = stage.clientWidth, Ht = stage.clientHeight, r = Math.min(W, Ht) * 0.455;
      lens.box.style.setProperty('--lr', r + 'px');
      lens.r = r;
    }
    function raise() {      // the eye goes to the glass
      fadeTo(1, 380);
      setTimeout(function () { cam.mode = 'glass'; G.zoom = 0; G.fov = FOVS[0]; G.yaw = G.tYaw = 196 * DEG; G.pitch = G.tPitch = -13 * DEG; G.focusT = 0; G.point = null; G.auto = null; glassTube.visible = true; showLens(true); fadeTo(0, 520); cue('lens'); if (stage) stage.focus(); }, reducedMotion ? 0 : 400);
    }
    function lower() {      // and comes away from it
      fadeTo(1, 380);
      setTimeout(function () { cam.mode = 'wide'; showLens(false); shot([99.8, 2.1, 15.4], [106.0, 0.7, 8.4], 34, 1, true); fadeTo(0, 520); }, reducedMotion ? 0 : 400);
    }
    function cut(fn, hold) { fadeTo(1, 420); later(reducedMotion ? 0.02 : 0.5, function () { fn(); later(hold || 0.12, function () { fadeTo(0, 600); }); }); }

    // ---- pointer, wheel and keys: the glass follows the hand ----
    function glassOn() { return cam.mode === 'glass' && (ns.stage === 'glass' || ns.stage === 'event' || ns.stage === 'split'); }
    canvas.style.touchAction = 'none';
    var ptrs = {};
    function span() { var k = Object.keys(ptrs); if (k.length < 2) return 0; return Math.hypot(ptrs[k[0]].x - ptrs[k[1]].x, ptrs[k[0]].y - ptrs[k[1]].y); }
    canvas.addEventListener('pointerdown', function (e) { if (!glassOn()) return; ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; G.pinch = span(); G.auto = null; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} });
    canvas.addEventListener('pointermove', function (e) {
      var q = ptrs[e.pointerId]; if (!q || !glassOn()) return;
      var dx = e.clientX - q.x, dy = e.clientY - q.y; q.x = e.clientX; q.y = e.clientY;
      if (Object.keys(ptrs).length >= 2) { var sp = span(); if (G.pinch > 0 && sp > 0) { if (sp > G.pinch * 1.25) { setZoom(G.zoom + 1); G.pinch = sp; } else if (sp < G.pinch * 0.8) { setZoom(G.zoom - 1); G.pinch = sp; } } return; }
      var k = (G.fov * DEG) / Math.max(1, canvas.clientHeight);   // the lens moves with the hand, one to one
      G.tYaw += dx * k; G.tPitch = Math.max(-84 * DEG, Math.min(24 * DEG, G.tPitch - dy * k));
    });
    function up(e) { delete ptrs[e.pointerId]; G.pinch = span(); }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    var wheelAt = 0;
    canvas.addEventListener('wheel', function (e) { if (!glassOn()) return; e.preventDefault(); var now = performance.now(); if (now - wheelAt < 260) return; wheelAt = now; setZoom(G.zoom + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
    stage.addEventListener('keydown', function (e) {
      if (!glassOn()) return;
      var st = G.fov * DEG * 0.12, used = true;
      if (e.key === 'ArrowLeft') G.tYaw -= st; else if (e.key === 'ArrowRight') G.tYaw += st;
      else if (e.key === 'ArrowUp') G.tPitch = Math.min(24 * DEG, G.tPitch + st); else if (e.key === 'ArrowDown') G.tPitch = Math.max(-84 * DEG, G.tPitch - st);
      else if (e.key === '+' || e.key === '=') setZoom(G.zoom + 1); else if (e.key === '-' || e.key === '_') setZoom(G.zoom - 1);
      else used = false;
      if (used) { e.preventDefault(); G.auto = null; }
    });

    // ---- what the frame does ----
    var updaters = [function (t, dt) {
      skyObj.uniforms.uTime.value = t;
      // the timeline, then the walkers
      // the timeline (what is due is taken out first: a step may clear or refill the list)
      var due = [];
      timers = timers.filter(function (q) { q.t -= dt; if (q.t <= 0) { due.push(q.fn); return false; } return true; });
      due.forEach(function (f) { f(); });
      walks.slice().forEach(function (w) {
        var o = w.obj, q = w.pts[0], dx = q[0] - o.position.x, dy = q[1] - o.position.y, dz = q[2] - o.position.z, d = Math.hypot(dx, dz);
        if (d > 0.08) {
          var step = Math.min(d, w.speed * dt);
          o.position.x += dx / d * step; o.position.z += dz / d * step; o.position.y += dy * Math.min(1, step / d);
          o.rotation.y += adiff(Math.atan2(-dx, -dz), o.rotation.y) * Math.min(1, dt * 5);
          return;
        }
        w.pts.shift();
        if (!w.pts.length) { walks.splice(walks.indexOf(w), 1); if (w.then) w.then(); }
      });
      // the men at the wedged wagon heave in time; the wagon rocks and will not come free
      var heave = world.phase === 'stuck' ? Math.max(0, Math.sin(t * 1.9)) : 0;
      raiders.forEach(function (r) {
        var ud = r.g.userData;
        if (ud.arm) {
          var want = r.role === 'heave' ? 1.1 + 0.5 * Math.max(0, Math.sin(t * 1.9 + 0.3)) : r.role === 'point' ? 1.9 : r.role === 'lead' ? 0.5 + 0.5 * Math.max(0, Math.sin(t * 2.6 + r.ph)) : 0.35;
          ud.arm.rotation.x += (want - ud.arm.rotation.x) * Math.min(1, dt * 5);
        }
        if (r.role === 'guard' && ud.look) ud.look(Math.sin(t * 0.23 + r.ph) > 0.86 ? { x: EYE.x, y: 2, z: EYE.z } : null);
        if (ud.update) ud.update(t);
      });
      if (world.phase === 'stuck') { wagonA.rotation.z = 0.16 + 0.018 * heave; wagonA.position.y = trackAt(WA.s0)[1] + 0.25 + 0.05 * heave; if (efx && heave > 0.97 && Math.random() < 0.3) efx.dust.emit({ x: wagonA.position.x, y: wagonA.position.y + 0.4, z: wagonA.position.z }, 4, { size: [1.2, 2.4], speed: [0.4, 1.2], up: [0.3, 1], life: [1.2, 2.2], alpha: 0.4, gravity: -0.3, color: 0xd9b78c }); }
      // the wagons back out of the turn and go up the terrace, toward the rim and the north-east
      if (world.phase === 'turn') {
        [[wagonB, WB, camB, 0], [wagonC, WC, camC, 4], [wagonA, WA, null, 9]].forEach(function (w) {
          if (t - world.t0 < w[3]) return;
          w[1].s = Math.max(-40, w[1].s - dt * 1.5);
          var p = w[1].s >= 0 ? trackAt(w[1].s) : [151 + (-w[1].s) * 0.8, 0, 30 + w[1].s * 0.7, 2.3];
          w[0].position.set(p[0] - 0.4, p[1] + 0.25, p[2]); w[0].rotation.y += adiff(p[3], w[0].rotation.y) * Math.min(1, dt * 1.5); w[0].rotation.z *= 0.96;
          w[0].userData.wheels.forEach(function (wh) { wh.rotation.x -= dt * 1.6; });
          if (w[2]) { var cp = w[1].s - 6.2 >= 0 ? trackAt(w[1].s - 6.2) : [151 + (6.2 - w[1].s) * 0.8, 0, 30 + (w[1].s - 6.2) * 0.7, 2.3]; w[2].position.set(cp[0] - 0.4, cp[1] + 0.25, cp[2]); w[2].rotation.y = cp[3] + Math.PI; }
        });
      }
      camels.forEach(function (c) { if (c.userData.update) c.userData.update(t); });
      // the eagle
      var ea = t * 0.16; eagle.position.set(Math.cos(ea) * 70, FLOOR + 150 + Math.sin(t * 0.21) * 22, 40 + Math.sin(ea) * 60); eagle.rotation.y = -ea; eagle.rotation.z = 0.25;
      var fl = Math.sin(t * 1.1) * 0.12; eL.rotation.z = fl; eR.rotation.z = -fl;
      swiftsFrame(t);
      // the dust devil walks the dry bed, leans, thins and gathers again
      var dz = 150 + ((t * 2.2) % 420), dxx = bedX(dz) + Math.sin(t * 0.21) * 16, dk = Math.sin(Math.PI * ((t * 2.2) % 420) / 420);
      devil.position.set(dxx, floorY(dxx, dz), dz);
      devilParts.forEach(function (ds, i) { ds.position.x = Math.sin(t * 2.6 + i * 0.9) * (0.6 + i * 0.5); ds.position.z = Math.cos(t * 2.1 + i * 0.7) * (0.6 + i * 0.5); ds.material.opacity = 0.2 * dk * (1 - i / 12); ds.material.rotation = t * (1.5 - i * 0.1); });
      // the camp: embers that breathe, a thread of smoke that climbs the wall and leans north with the wind
      campG.userData.ember.material.opacity = 0.45 + 0.3 * Math.sin(t * 3.3) * Math.sin(t * 1.1);
      if (efx && !reducedMotion) {
        world.smokeT -= dt;
        if (world.smokeT <= 0) { world.smokeT = 0.22; efx.dust.emit({ x: campG.position.x, y: campG.position.y + 0.4, z: campG.position.z }, 1, { size: [0.7, 1.1], grow: 1.5, speed: [0.05, 0.25], up: [1.3, 2.0], life: [7, 10], alpha: 0.34, gravity: 0.02, drag: 0.08, spread: 0.2, color: 0xb9b2ac, fadeIn: 0.1 }); }
        // sand blown off the eastern rim in thin veils, and now and then a trickle of dust down a wall
        world.windT -= dt;
        if (world.windT <= 0) { world.windT = 0.5 + Math.random() * 1.4; var wz2 = -200 + Math.random() * 620, wx2 = eastX(wz2, 0) - 1; efx.dust.emit({ x: wx2, y: 0.6, z: wz2 }, 7, { size: [2.5, 5], grow: 2.2, speed: [1.5, 4], up: [-0.6, 0.5], life: [3, 5.5], alpha: 0.2, gravity: -0.5, drag: 0.2, spread: 9, color: 0xe6c8a0, fadeIn: 0.25 }); }
        world.fallT -= dt;
        if (world.fallT <= 0) { world.fallT = 5 + Math.random() * 9; var fz2 = -60 + Math.random() * 380, fy2 = -30 - Math.random() * 160, fx2 = Math.random() < 0.5 ? westX(fz2, fy2) + 2 : eastX(fz2, fy2) - 2; efx.dust.emit({ x: fx2, y: fy2, z: fz2 }, 14, { size: [1.6, 3.4], grow: 1.6, speed: [0.2, 1.2], up: [-1.5, 0.2], life: [3, 6], alpha: 0.3, gravity: -3.5, drag: 0.5, spread: 3, color: 0xd8b48c, fadeIn: 0.15 }); }
      }
      glint.material.opacity = 0.55 + 0.35 * Math.sin(t * 2.3) * Math.sin(t * 0.7);
      // the pillars' voice, made visible: rings that spread on the sand of the mouth
      rings.forEach(function (r, i) {
        if (world.sing < 0) { r.m.material.opacity = 0; return; }
        var u = ((t - world.sing) * 0.5 - i * 0.33) % 1.6;
        if (u < 0 || t - world.sing > 9) { r.m.material.opacity = 0; return; }
        r.m.scale.setScalar(4 + u * 60); r.m.material.opacity = Math.max(0, 0.75 * (1 - u / 1.2));
      });
      if (world.sing >= 0 && t - world.sing > 9.5) world.sing = -1;

      // Hermes: he breathes, and at the lip he holds the glass to his eye
      if (efx) {
        if (efx.gait) {
          efx.gait.speak(speaking === 'hermes' && cam.mode === 'wide');
          efx.gait.look(glassTube.visible ? { x: hermes.position.x + 40, y: hermes.position.y - 4, z: hermes.position.z + 120 } : null);
        }
        efx.frame(dt, camera);
      }
      // at the lip he crouches low over the edge, the glass at his eye and his hand under it
      var crouch = (glassTube.visible || world.low) && !walks.some(function (w) { return w.obj === hermes; });
      world.crouch += ((crouch ? 1 : 0) - world.crouch) * Math.min(1, dt * 3);
      if (Hh.lamp) Hh.lamp.visible = !(glassTube.visible || world.low);   // his lantern is shuttered and set down while he hides
      if (world.crouch > 0.01) {
        if (efx && efx.gait && efx.gait.body) { efx.gait.body.rotation.x -= 0.08 * world.crouch; efx.gait.body.position.y -= (world.low ? 0.34 : 0.16) * world.crouch; }
        if (Hh.legL) Hh.legL.position.y -= 0.12 * world.crouch; if (Hh.legR) Hh.legR.position.y -= 0.12 * world.crouch;
        if (Hh.head) Hh.head.rotation.x += (world.low ? 0.75 : 0.5) * world.crouch;   // chin up: the glass looks out over the gorge, not at his boots
        if (Hh.armR && glassTube.visible) { Hh.armR.rotation.x += (1.75 - Hh.armR.rotation.x) * world.crouch; Hh.armR.rotation.z += (-0.2 - Hh.armR.rotation.z) * world.crouch; if (Hh.foreR) Hh.foreR.rotation.x += (1.15 - Hh.foreR.rotation.x) * world.crouch; }
      }

      // the camera
      if (cam.mode === 'wide') {
        if (efx && efx.post) { var wp = efx.post.params; wp.haze = 0; wp.ca = 0.14; wp.vignette = 0.3; }
        if (cam.follow) { cam.gl.set(cam.follow.position.x, cam.follow.position.y + 1.3, cam.follow.position.z); }
        var k = 1 - Math.exp(-dt * cam.k);
        cam.p.lerp(cam.gp, k); cam.l.lerp(cam.gl, k); cam.fov += (cam.gfov - cam.fov) * k;
        camera.position.copy(cam.p); camera.lookAt(cam.l);
        if (Math.abs(camera.fov - cam.fov) > 0.01) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
      } else {
        if (G.auto) { G.tYaw += adiff(G.auto.yaw, G.tYaw) * Math.min(1, dt * 1.8); G.tPitch += (G.auto.pitch - G.tPitch) * Math.min(1, dt * 1.8); if (Math.abs(adiff(G.auto.yaw, G.tYaw)) < 0.002 && Math.abs(G.auto.pitch - G.tPitch) < 0.002) G.auto = null; }
        var py = G.yaw, pp = G.pitch, kk = Math.min(1, dt * 11);
        G.yaw += adiff(G.tYaw, G.yaw) * kk; G.pitch += (G.tPitch - G.pitch) * kk;
        G.speed = Math.hypot(adiff(G.yaw, py) * Math.cos(G.pitch), G.pitch - pp) / Math.max(0.001, dt);   // radians a second
        G.fov += (FOVS[G.zoom] - G.fov) * Math.min(1, dt * 6);
        G.rack = Math.max(0, G.rack - dt * 1.9);
        if (efx && efx.post) { var gp = efx.post.params; gp.haze = reducedMotion ? 0 : [0.25, 0.7, 1.25][G.zoom]; gp.hazeY = 0.5; gp.ca = 0.34 + 0.16 * G.zoom; gp.vignette = 0.2; }
        // a hand is never still: the more the tube is drawn out, the more it shows
        var sw = reducedMotion ? 0 : (0.0009 + 0.0007 * G.zoom) * (G.fov / 20) * 3;
        var sy = Math.sin(t * 1.3) * sw + Math.sin(t * 2.9) * sw * 0.4 + world.shake * Math.sin(t * 31) * 0.004, sp = Math.sin(t * 1.7 + 1) * sw * 0.8 + world.vert * Math.sin(t * 2.2) * 0.012;
        world.shake = Math.max(0, world.shake - dt); world.vert = Math.max(0, world.vert - dt * 0.4);
        camera.position.set(EYE.x, EYE.y, EYE.z);
        dirOf(G.yaw + sy, G.pitch + sp, vdir);
        camera.lookAt(EYE.x + vdir.x, EYE.y + vdir.y, EYE.z + vdir.z);
        var wantFov = G.fov * (1 + world.vert * 0.08 * Math.sin(t * 1.4));
        if (Math.abs(camera.fov - wantFov) > 0.005) { camera.fov = wantFov; camera.updateProjectionMatrix(); }
        lensFrame(t, dt);
      }
      skyObj.mesh.position.copy(camera.position); skyBits.position.copy(camera.position);
      // the mist breathes and drifts down the gorge; the shafts of sun come and go with it
      mists.forEach(function (m) { var u = t * 0.02 * m.v + m.ph; m.s.position.x = m.x + Math.sin(u * 0.7) * 24; m.s.position.z = m.z + Math.sin(u * 0.31 + m.ph) * 60; m.s.position.y = m.y + Math.sin(u * 0.53) * 6; m.s.material.opacity = m.k * (0.7 + 0.3 * Math.sin(u * 1.3)); m.s.material.rotation = Math.sin(u * 0.2) * 0.3; });
      shafts.forEach(function (q) { q.m.material.opacity = q.base * (0.7 + 0.3 * Math.sin(t * 0.33 + q.ph)) * (cam.mode === 'glass' ? 0.8 : 1); });
      walkersFrame(dt);
    }];
    scene.userData.updaters = updaters;

    // the lens itself: bearing, the ring that fills while it is held still on something, the blur of a moving glass
    function lensFrame(t, dt) {
      if (!lens || lens.box.hidden) return;
      var deg = ((G.yaw / DEG) % 360 + 360) % 360;
      var txt = Math.round(deg) + '° · ' + NAMES16[Math.round(deg / 22.5) % 16];
      if (lens.bearing.textContent !== txt) lens.bearing.textContent = txt;
      lens.tape.style.backgroundPositionX = (-deg * 6) + 'px';
      // blur: the rack of the tube after a draw, and the smear of a glass that moves
      var blur = reducedMotion ? 0 : Math.round(Math.min(7, G.rack * 6 + Math.max(0, G.speed / (G.fov * DEG) - 0.35) * 1.6) * 2) / 2;
      if (blur !== G.blur) { G.blur = blur; canvas.style.filter = blur ? 'blur(' + blur + 'px)' : ''; }
      // what is under the cross?
      var best = null, bestA = 9, canFind = (ns.stage === 'glass' || ns.stage === 'event') && !ns.busy;
      dirOf(G.yaw, G.pitch, vdir);
      for (var id in SIGHTS) {
        var s = SIGHTS[id];
        if (ns.seen[id] || (s.event && ns.stage !== 'event')) continue;
        sightPos(id, tmp).sub(tmp2.set(EYE.x, EYE.y, EYE.z)).normalize();
        var a = Math.acos(Math.max(-1, Math.min(1, tmp.dot(vdir)))) / DEG;
        if (a < Math.max(s.r, G.fov * 0.16) && a < bestA) { best = id; bestA = a; }
      }
      var still = G.speed < G.fov * DEG * 0.5, note = '';
      if (best && canFind && still) {
        if (G.zoom >= SIGHTS[best].zoom) { if (G.focusId !== best) { G.focusId = best; G.focusT = 0; } G.focusT += dt; }
        else { G.focusT = Math.max(0, G.focusT - dt * 2); G.noteT += dt; if (G.noteT > 0.5) note = 'Something is there, too far to make out. Bring it closer: ＋'; }
      } else { G.focusT = Math.max(0, G.focusT - dt * 2.5); G.noteT = 0; if (!best) G.focusId = null; }
      var NEED = 0.95, f = Math.min(1, G.focusT / NEED);
      lens.focus.style.strokeDashoffset = String(2 * Math.PI * 9 * (1 - f));
      lens.box.classList.toggle('is-near', !!best && canFind);
      if (lens.note.textContent !== note) lens.note.textContent = note;
      if (f >= 1 && best) { G.focusT = 0; G.focusId = null; discover(best); }
      if (canFind && hintBtn) hintBtn.classList.toggle('is-pulse', performance.now() - ns.lastFind > 40000);
      if (ns.stage === 'glass' && !ns.busy && !ns.eventDue && eventReady()) startEvent();
      // the arrow: Hermes pointing
      if (G.point && !ns.seen[G.point] && canFind) {
        var aim = aimAt(G.point), ax = adiff(aim.yaw, G.yaw) * Math.cos(G.pitch), ay = aim.pitch - G.pitch, off = Math.hypot(ax, ay) / (G.fov * DEG);
        if (off > 0.34) { var ang = Math.atan2(-ay, ax); lens.arrow.hidden = false; lens.arrow.style.transform = 'translate(-50%,-50%) rotate(' + ang + 'rad) translateX(' + (lens.r * 0.78) + 'px)'; }
        else lens.arrow.hidden = true;
      } else if (!lens.arrow.hidden) lens.arrow.hidden = true;
    }

    // ---- what the story asks of the scene ----
    function hermesTo(pts, speed, then) { walkPath(hermes, pts.map(function (p) { return [p[0], p[1] == null ? 0 : p[1], p[2]]; }), speed || 1.5, then); }
    function gait(k) { if (efx && efx.gait && efx.gait.react) efx.gait.react(k); }
    function hold(k) { if (efx && efx.gait && efx.gait.hold) efx.gait.hold(k); }
    function footmenTo(pts, speed, then) {
      footmen.forEach(function (r, i) {
        r.role = 'walk';
        var off = i * 2.4;
        later(i * 0.9, function () { walkPath(r.g, pts.map(function (p) { return [p[0] + (i % 2 ? 0.8 : -0.8), p[1], p[2] + (p[3] || 0) * off]; }), speed, i === footmen.length - 1 ? then : null); });
      });
    }
    S3 = {
      zoom: function () { return G.zoom; }, setZoom: setZoom, raise: raise, lower: lower,
      reset: function () { place(); showLens(false); cam.mode = 'wide'; fadeTo(0, 0); shot(PRINT.p, PRINT.l, 44, 0.5, true); },
      found: function (id) {
        G.point = null;
        if (lens) { lens.found.textContent = SIGHTS[id].icon + ' ' + SIGHTS[id].name; lens.found.classList.remove('is-on'); void lens.found.offsetWidth; lens.found.classList.add('is-on'); lens.box.classList.remove('is-flash'); void lens.box.offsetWidth; lens.box.classList.add('is-flash'); }
      },
      point: function (id, swing) { G.point = id; if (swing) { G.auto = aimAt(id); if (SIGHTS[id].zoom > G.zoom) later(1.6, function () { setZoom(SIGHTS[id].zoom); }); } },
      aim: function (id, zoomToo) { var a = aimAt(id); G.yaw = G.tYaw = a.yaw; G.pitch = G.tPitch = a.pitch; if (zoomToo) { G.zoom = SIGHTS[id].zoom; G.fov = FOVS[G.zoom]; G.rack = 0; } },
      state: function () {
        return { mode: cam.mode, zoom: G.zoom, bearing: Math.round(((G.yaw / DEG) % 360 + 360) % 360), pitch: +(G.pitch / DEG).toFixed(1), fov: +camera.fov.toFixed(1), phase: world.phase, focus: +G.focusT.toFixed(2),
          hermes: [+hermes.position.x.toFixed(1), +hermes.position.y.toFixed(1), +hermes.position.z.toFixed(1)], footmen: footmen.map(function (r) { return [+r.g.position.x.toFixed(0), +r.g.position.y.toFixed(0), +r.g.position.z.toFixed(0)]; }), wagonC: +WC.s.toFixed(0), walks: walks.length, lens: !!(lens && !lens.box.hidden) };
      },
      gfx: function () { return { T: T, scene: scene, camera: camera, renderer: renderer, hermes: hermes, raiders: raiders, wagons: [wagonA, wagonB, wagonC] }; },
      frames: function (n, dt) { for (var i = 0; i < (n || 1); i++) { clock.t += dt || 1 / 30; scene.userData.updaters.forEach(function (u) { u(clock.t, dt || 1 / 30); }); } },
      test: { hold: hold, shot: shot, raise: raise, zoom: function (z) { G.zoom = z; G.fov = FOVS[z]; G.rack = 0; }, gaitOn: function () { return !!(efx && efx.gait && efx.gait.hold); } },
      fx: {
        // the view of the two printed pages: from the south, the Mesa on the left, the arch, the terraces on the right
        shotPrint: function () { shot(PRINT.p, PRINT.l, 44, 0.5, true); shot([70, 20, 700], [6, -118, 0], 44, 0.1); cue('whoosh', { dur: 2.2 }); },
        shotTerraces: function () { shot([36, 26, -46], [134, -44, 226], 30, 0.55); cue('groan', { v: 0.5 }); later(1.4, function () { cue('stone', { dur: 1.6 }); }); },
        shotHermes: function () {
          hermesTo([[HOME.x, 0, HOME.z]], 1.2); hermes.rotation.y = HOME.rot;
          shot([99.8, 2.1, 15.4], [106.0, 0.7, 8.4], 34, 0.9);
          later(1.2, function () { hold('kneel'); }); later(2.6, function () { glassTube.visible = true; cue('lens'); });
        },
        shout: function () { cue('echo', { deg: 9, n: 3 }); world.shake = 0.5; raiders.forEach(function (r) { if (r.role === 'heave') r.role = 'idle'; }); world.phase = 'halt'; leader.role = 'point'; },
        vertigo: function () { world.vert = 1; cue('whoosh', { dur: 1.6 }); },
        breath: function () { G.rack = 1; },
        pillarsSing: function () { world.sing = clock.t; cue('echo', { deg: 2, n: 2 }); later(2.4, function () { cue('echo', { deg: 6, n: 2 }); }); later(5, function () { cue('echo', { deg: 2, n: 3 }); }); },
        // the four shoulder their packs and start back up the terrace
        splitStart: function () {
          world.phase = 'split';
          var up = []; for (var s = LEG1 - 6; s >= 0; s -= 14) { var p = trackAt(s); up.push([p[0], p[1] + 0.25, p[2], 0]); }
          up.push([153, 0.1, 27, 0]); up.push([160, 0.1, 16, 0]);
          footmenTo(up, 2.1, function () { world.phase = world.phase === 'gone' ? 'gone' : 'rim'; });
          heavers[2].role = 'idle';
          cue('step');
        },
        wagonsTurn: function () { world.phase = 'turn'; world.t0 = clock.t; camels.forEach(function (c) { if (c.userData.walk) c.userData.walk(true); }); cue('groan', { v: 0.4 }); },
        // ---- CROSS: out onto the bare back of the bridge ----
        crossStart: function () {
          glassTube.visible = false; hold(null);
          hermesTo([[103, 0, 3], [92, 0, 0.5], [70, 0, 0]], 2.3);
          shot([112, 3.2, 9], [96, 1.2, 1], 44, 1.2); cam.follow = hermes;
        },
        crossFar: function () {
          cut(function () {
            walks = walks.filter(function (w) { return w.obj !== hermes; }); hermes.visible = false;
            dot.visible = true; dot.position.set(60, 2.6, 0); walkPath(dot, [[-150, 2.6, 0]], 27, function () { dot.visible = false; });
            shot([-30, -60, 600], [-10, -90, 0], 42, 0.4, true); shot([-60, -40, 520], [-20, -80, 0], 42, 0.1);
            later(3.4, function () {   // the stone that turns under his boot
              pebble.position.set(dot.position.x, -1, 6); var vy = 0, fall = function (t, dt) { vy -= 60 * dt; pebble.position.y += vy * dt; pebble.rotation.x += dt * 5; if (pebble.position.y < FLOOR + 4) { pebble.position.y = -1000; updaters.splice(updaters.indexOf(fall), 1); cue('crack', { v: 0.5 }); later(0.5, function () { cue('echo', { deg: 0, n: 3 }); }); } };
              updaters.push(fall); cue('tick', { f: 300, v: 0.12 });
            });
          });
        },
        crossEnd: function () {
          cut(function () {
            walks = walks.filter(function (w) { return w.obj !== dot; }); dot.visible = false;
            hermes.visible = true; hermes.position.set(-174, 0, -3); hermes.rotation.y = Math.PI / 2 + 0.5;   // he looks back the way he came
            footmen.forEach(function (r, i) { walks = walks.filter(function (w) { return w.obj !== r.g; }); r.g.position.set(156 + i * 1.6, 0.1, 18 + i * 2); r.g.rotation.y = 1.4; r.role = i ? 'idle' : 'point'; });
            world.phase = 'gone';
            shot([-161, 2.3, 4.5], [-175, 1.25, -3.4], 40, 0.6, true); shot([-158.5, 2.6, 6], [-175, 1.2, -3.6], 34, 0.14);
            later(0.6, function () { gait('wonder'); });
          });
        },
        // ---- HIDE: the ledge under the lip ----
        hideStart: function () {
          glassTube.visible = false;
          cut(function () { hermes.position.set(110.2, -4.4, 12.0); hermes.rotation.y = Math.PI; hold('kneel'); world.low = true; shot([105.6, -3.2, 19.5], [110.3, -2.6, 11.4], 46, 0.7, true); shot([104.8, -3.8, 18.8], [110.5, -1.5, 10.6], 46, 0.2); });
        },
        bootsPass: function () {
          footmen.forEach(function (r, i) { walks = walks.filter(function (w) { return w.obj !== r.g; }); r.g.position.set(132 + i * 2.6, 0.1, 6.5 - (i % 2) * 2); r.role = 'walk'; walkPath(r.g, [[108 + i * 1.8, 0.1, 6.5 - (i % 2) * 2]], i === 3 ? 1.0 : 1.5, function () { r.role = 'idle'; }); });
          world.phase = 'gone'; world.shake = 0.3;
          [0.3, 0.9, 1.5, 2.2, 2.9, 3.7].forEach(function (d) { later(d, function () { cue('step'); }); });
        },
        hideEnd: function () {
          footmen.forEach(function (r, i) { r.role = 'walk'; walkPath(r.g, [[-150 - i * 2, 0.1, 4 - (i % 2) * 3]], 2.4); });
          later(2.5, function () { cut(function () { hold(null); world.low = false; hermes.position.set(104, 0, 5); hermes.rotation.y = -Math.PI / 2; shot([118, 2.8, 12], [100, 1.3, 4], 40, 0.6, true); cam.follow = hermes; hermesTo([[80, 0, 1]], 1.4); }); });
        },
        // ---- TRAIL: heavy prints to the survey stone, a strip of blue, and back on bare rock ----
        trailStart: function () {
          glassTube.visible = false; hold(null);
          cut(function () {
            // (the walk from the bridge is told, not shown: he is already most of the way to the stone)
            hermes.position.set(199, 0, -50); hermes.rotation.y = -0.65; world.prints = true;
            hermesTo([[STONE.x - 2.4, 0, STONE.z + 2.8]], 1.7, function () { hermes.rotation.y = Math.atan2(-(STONE.x - hermes.position.x), -(STONE.z - hermes.position.z)); gait('offer'); later(1.1, function () { rag.visible = true; cue('paper'); }); });
            shot([203, 3.4, -44], [STONE.x - 1, 1.3, STONE.z + 1], 42, 0.6, true); shot([206.5, 3.0, -58], [STONE.x - 0.6, 1.5, STONE.z + 0.6], 36, 0.14);
          });
        },
        trailBack: function () {
          world.prints = false;
          cut(function () { walks = walks.filter(function (w) { return w.obj !== hermes; }); rag.visible = true; hermes.position.set(124, 0, 3); hermes.rotation.y = Math.PI / 2; hermesTo([[HOME.x + 2.4, 0, HOME.z - 2.6]], 1.4, function () { hermes.rotation.y = 0.9; hold('kneel'); world.low = true; }); shot([100, 3.6, 15], [112, 0.8, 5], 42, 0.7, true); });
        },
        trailFooled: function () {
          cut(function () {
            footmen.forEach(function (r, i) { walks = walks.filter(function (w) { return w.obj !== r.g; }); r.g.position.set(160 + i * 3.4, 0.1, 6 - i * 3.2 + (i % 2) * 2.4); r.g.rotation.y = -0.6; r.role = i ? 'idle' : 'point'; });
            world.phase = 'gone';
            later(1.8, function () { footmen.forEach(function (r, i) { later(i * 0.9, function () { r.role = 'walk'; walkPath(r.g, [[186 + (i % 2) * 2.2, 0.1, -32 - i], [STONE.x - 3 - i * 1.4, 0.1, STONE.z + 4 + (i % 2) * 2.5]], 2.2, function () { r.role = i ? 'idle' : 'point'; }); }); }); });
            // from the east, across their path: the prints lead them from the bridge (left) toward the stone (right)
            shot([196, 4.2, 12], [176, 1.2, -12], 44, 0.6, true); shot([204, 5.0, 4], [186, 1.0, -30], 40, 0.1);
          });
        },
        crossQuiet: function () {
          cut(function () { hold(null); world.low = false; hermes.position.set(96, 0, 2); hermes.rotation.y = -Math.PI / 2; hermesTo([[40, 0, 0]], 1.9); shot([112, 3, 8], [90, 1.3, 1], 42, 0.7, true); cam.follow = hermes; });
        }
      }
    };

    place();
    shot(PRINT.p, PRINT.l, 44, 0.5, true);
    startLoop();
  }

  function startLoop() { if (animId || !renderer) return; clock.last = performance.now(); loop(); }
  function stopLoop() { if (animId) cancelAnimationFrame(animId); animId = null; }
  function loop() {
    if (!renderer || !scene || !camera) return;
    animId = requestAnimationFrame(loop);
    var now = performance.now(), dt = Math.min(0.05, (now - clock.last) / 1000);
    clock.last = now; clock.t += dt;
    scene.userData.updaters.slice().forEach(function (u) { u(clock.t, dt); });
    if (efx) efx.render(scene, camera, dt); else renderer.render(scene, camera);
  }
  function handleResize() {
    if (!renderer || !camera || !canvas) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    if (lens && !lens.box.hidden && stage) { var r = Math.min(stage.clientWidth, stage.clientHeight) * 0.455; lens.box.style.setProperty('--lr', r + 'px'); lens.r = r; }
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
    if (canvas) canvas.style.filter = '';
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

  // Station 16 asks: has the dawn on the bridge been lived yet?
  window.needsBridgeSpyglass = function () { return !isDone(); };
  window.openBridgeSpyglassModal = open;
  window.BridgeSpyglass = { KEY: KEY, saved: saved, done: isDone, choice: function () { return saved().choice || null; } };
  window.__spyglass = {
    sights: Object.keys(SIGHTS), choices: Object.keys(CHOICES),
    fast: function () { chat.fast = true; window.__spyFast = true; }, slow: function () { chat.fast = false; window.__spyFast = false; },
    discover: function (id) { return discover(id); },
    aim: function (id, zoomToo) { if (S3) S3.aim(id, zoomToo !== false); },
    hint: hint, pick: function (id) { return pick(id); },
    state: function () { return Object.assign({ stage: ns.stage, busy: ns.busy, seen: Object.keys(ns.seen), choice: ns.choice, boons: ns.boon.slice(), replay: ns.replay, gl: !!S3 }, S3 ? S3.state() : {}); },
    gfx: function () { return S3 ? S3.gfx() : null; }, frames: function (n, dt) { if (S3) S3.frames(n, dt); },
    test: function () { return S3 ? S3.test : null; }, lower: function () { if (S3) S3.lower(); }, fx: function (name) { if (S3 && S3.fx[name]) S3.fx[name].apply(null, [].slice.call(arguments, 1)); }
  };
})();
