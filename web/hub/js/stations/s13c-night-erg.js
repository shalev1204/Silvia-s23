
// =========================================================================
// 🌌 THE NIGHT ON THE ERG · between the gates of Tower II and the Sun Monolith (Station 14's overture)
// Hermes crossed the Great Erg by night. When he arrives, he tells Silvia what happened out there, and Silvia lives it:
// the night is different according to the road she took at the gates (see gates-road.js):
//   · no oil left (fed the fire, lost the duel)  -> THE DARK NIGHT: no lantern, steer by the Pole Star
//   · she saw the camel prints at the stairs      -> THE GHOST CAMEL: a camel of moonlight, glowing prints
//   · otherwise                                   -> THE TRAVELLER: a nomad whose lamp died asks for oil
// What she chooses can open a free note for the Monolith (EclipseHints.grant). A storm or a shortcut on the road shows up too.
// Station 14 opens this scene once, on arrival (s14-sun-monolith.js: needsNightErg / openNightErgModal).
// =========================================================================
(function initNightErg() {
  var modal = document.getElementById('modal-night-erg');
  if (!modal) return;
  var T = window.THREE, P = window.EclipsePaint, SC = window.EclipseScenery, Road = window.GatesRoad;
  var sfx = window.sfx || {};
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var canvas = document.getElementById('night-canvas');
  var logEl = document.getElementById('night-log');
  var choicesBox = document.getElementById('night-choices');
  var subtitle = document.getElementById('night-subtitle');
  var closeBtn = document.getElementById('btn-close-night');
  var finishCard = document.getElementById('night-finish-card');
  var finishBtn = document.getElementById('btn-night-finish');
  var finishBody = document.getElementById('night-finish-body');
  var bubbleEl = null;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  // ---------------------------------------------------------------------
  // 1. THE STORY
  // ---------------------------------------------------------------------
  var CAST = {
    hermes: { name: 'Hermes', role: 'Cartographer', icon: '🧭' },
    silvia: { name: 'Silvia', role: 'on the field wire', icon: '📡' },
    nomad:  { name: 'The Nomad', role: 'night traveller', icon: '🐫' }
  };
  var ns = { stage: 'idle', kind: 'traveller', busy: false, picked: {}, boon: [], onDone: null, token: 0 };
  var S3 = null;   // the 3D scene's hooks (null when WebGL is missing: the story plays on without it)
  var speaking = null;

  var chat = window.EclipseChat.create({
    log: logEl, cast: CAST, subtitle: subtitle,
    onSpeak: function (who, text) { speaking = who; showBubble(who, text); }
  });

  var H = function (t, x) { var o = { who: 'hermes', say: t }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var N = function (t, x) { var o = { who: 'nomad', say: t }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var nar = function (t, x) { var o = { narr: t }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var fx = function (name) { return function () { if (S3 && S3.fx[name]) S3.fx[name].apply(null, [].slice.call(arguments)); }; };
  function setMission(t) { var m = document.getElementById('night-mission-text'); if (m) m.textContent = t; }

  function roadFlags() { return Road ? Road.flags() : {}; }
  function grant(id, n) { if (window.EclipseHints && window.EclipseHints.grant) window.EclipseHints.grant(id, n); ns.boon.push(id); }

  // Each night: opening lines, then a menu of replies; a reply may end the night (done: true)
  var NIGHTS = {
    traveller: {
      title: 'The Traveller', time: '02:40 · DEEP NIGHT',
      open: function () { return [
        nar('The wind drops. Far ahead, a light the size of a seed is moving across the dunes.', { fx: fx('travellerComes') }),
        H('Silvia... a lantern, coming my way. Someone is walking toward my fire.'),
        nar('A young nomad in a striped headcloth stops at the edge of the firelight. His own lantern is dark.'),
        N('Peace, traveller. My lamp died two dunes ago.'),
        N('I have walked blind since moonrise. A little oil would carry me to the well by dawn.'),
        H('I still have my oil, Silvia. Not much. What do we do?')
      ]; },
      menu: function () { return ns.picked.ask ? ['share', 'all', 'refuse'] : ['ask', 'share', 'all', 'refuse']; },
      choices: {
        ask: { icon: '🗣️', label: 'Ask what he knows of the road.', say: 'Hermes, ask him first what he knows of this road.',
          lines: function () { return [H('Friend, what do you know of the road to the Monolith?'), N('Oil first, words after. That is the rule of the dark.'), H('A fair rule, I suppose.')]; } },
        share: { icon: '🪔', label: 'Share half the oil.', say: 'Share half with him, Hermes. We can spare that much.',
          lines: function () { return [
            nar('Hermes pours half his oil into the nomad’s lamp. It catches, small and gold.', {
              fx: function () {
                fx('pour')();
                if (Road && Road.patch) Road.patch({ nightOil: 'shared' });
                if (window.syncLampOil) window.syncLampOil();
                if (window.updateInventoryBadge) window.updateInventoryBadge();
                if (window.showDesertToast) window.showDesertToast('✦ Supply Updated: The Lamp Oil (Half Full) ✦');
              }
            }),
            N('The desert pays its debts. Listen: at the Monolith, the morning shadow leans toward the sunset.'),
            N('That is the whole secret of the first mark. Let it help you.'),
            nar('He bows, and walks on into the dark, lamp swinging.', { fx: fx('travellerLeaves') }),
            H('He gave us a clue, Silvia. For half a flask of oil.')
          ]; },
          done: function () {
            grant('s14-shadow', 1);
            Road.patch({ nightOil: 'shared' });
            if (window.syncLampOil) window.syncLampOil();
            if (window.updateInventoryBadge) window.updateInventoryBadge();
          } },
        all: { icon: '🎁', label: 'Give him all of it.', say: 'Give him everything, Hermes. He needs it more than we do.',
          lines: function () { return [
            nar('Hermes empties the flask into the nomad’s lamp. His own lantern gutters, and dies.', {
              fx: function () {
                fx('pour')();
                if (Road && Road.patch) Road.patch({ nightOil: 'all' });
                if (window.dropRelic) window.dropRelic('lamp_oil');
                if (window.syncLampOil) window.syncLampOil();
                if (window.updateInventoryBadge) window.updateInventoryBadge();
                if (window.showItemRelinquishedAnimation) {
                  window.showItemRelinquishedAnimation({
                    id: 'lamp_oil',
                    name: 'The Lamp Oil',
                    category: 'Expedition Supply',
                    origin: 'The Erg Dunes · 02:40 Deep Night',
                    image: 'assets/items/item_lamp_oil.png',
                    tag: 'SUPPLY RELINQUISHED',
                    badge: 'REMOVED FROM SATCHEL',
                    lore: 'Hermes poured every drop into the nomad’s lamp. The flask is empty, and his own lantern dies.'
                  });
                }
              }
            }),
            N('All of it? Then take two gifts, for the desert is listening.'),
            N('The morning shadow leans toward the sunset. And a staff has a shadow, but the tall stone has a longer one: measure the small to know the great.'),
            nar('He bows low, and walks on into the dark, lamp swinging.', { fx: fx('travellerLeaves') }),
            H('Now we are the ones walking blind, Silvia. But I think that was right.')
          ]; },
          done: function () {
            grant('s14-shadow', 1);
            grant('s14-sigil', 1);
            Road.patch({ nightOil: 'all' });
            if (window.dropRelic) window.dropRelic('lamp_oil');
            if (window.syncLampOil) window.syncLampOil();
            if (window.updateInventoryBadge) window.updateInventoryBadge();
          } },
        refuse: { icon: '✋', label: 'Refuse. We need every drop.', say: 'I am sorry, Hermes. We need every drop. Tell him gently.',
          lines: function () { return [
            H('Forgive me, friend. The road is long and we have little.'),
            N('Then I walk. The desert is wide enough for both of us.'),
            nar('He nods once, and the dark takes him.', { fx: fx('travellerLeaves') }),
            H('I hope he finds his well, Silvia.')
          ]; },
          done: function () {
            Road.patch({ nightOil: 'kept' });
            if (window.syncLampOil) window.syncLampOil();
            if (window.updateInventoryBadge) window.updateInventoryBadge();
          } }
      }
    },

    ghost: {
      title: 'The Ghost Camel', time: '02:40 · DEEP NIGHT',
      open: function () { return [
        nar('The wind drops. Ahead, the sand begins to glow, one print at a time.', { fx: fx('camelComes') }),
        H('Silvia... camel prints, and they are glowing. The same prints we saw at the stairs.'),
        nar('A camel made of moonlight crosses the dune. No rider. No sound.'),
        H('It has stopped. It is looking at me.')
      ]; },
      menu: function () { return ['follow', 'watch', 'call']; },
      choices: {
        follow: { icon: '👣', label: 'Follow it.', say: 'Follow it, Hermes. Slowly.',
          lines: function () { return [
            nar('The camel turns and walks. Hermes follows its glowing prints for an hour.', { fx: fx('camelLeads') }),
            nar('At a toppled caravan cairn, it kneels, and is gone.', { fx: fx('camelFades') }),
            H('A carved stone, Silvia. A jackal, and under it three words: “Morning leans west.”'),
            H('I think the camel wanted me to read it.')
          ]; },
          done: function () { grant('s14-shadow', 1); Road.patch({ nightGhost: 'followed' }); } },
        watch: { icon: '👁️', label: 'Keep still. Watch what it does.', say: 'Stay still, Hermes. Watch what it does.',
          lines: function () { return [
            nar('The camel looks back once. Then it walks away in a perfectly straight line.', { fx: fx('camelLeads') }),
            H('Silvia, it is walking north-north-east. Exactly 14°. It is pointing the way.'),
            nar('Where it passes, the prints form a line that runs straight at the dawn.', { fx: fx('camelFades') }),
            H('I will walk on the line it drew. A camel never walks crooked.')
          ]; },
          done: function () { grant('s14-sigil', 1); Road.patch({ nightGhost: 'watched' }); } },
        call: { icon: '📣', label: 'Call out to it.', say: 'Call out to it, Hermes. Ask who it is.',
          lines: function () { return [
            H('Hello? Whose camel are you?'),
            nar('At the sound of a voice, the camel dissolves into the dark.', { fx: fx('camelFades') }),
            H('Gone. Perhaps it only wanted to be left alone.')
          ]; },
          done: function () { Road.patch({ nightGhost: 'called' }); } }
      }
    },

    dark: {
      title: 'The Dark Night', time: '02:40 · NO LAMP',
      open: function () {
        var out = [
          nar('No lamp. No fire. The only light on the Great Erg is the stars.', { fx: fx('lookNorth') }),
          H('Silvia, without oil I cannot see the dial of my compass. I am blind out here.'),
          H('But the Pole Star is straight ahead of me: that is north. And the Monolith lies 14° north-north-east.'),
          H('So which way do I walk?')
        ];
        return out;
      },
      menu: function () {
        var out = ['keep', 'right', 'left'];
        if (roadFlags().blessing && !ns.picked.cord) out.unshift('cord');
        return out;
      },
      choices: {
        cord: { icon: '🧵', label: 'Measure it with the red cord.', say: 'Hermes, use the red cord. Measure the 14° against your fist.',
          lines: function () { return [
            nar('Hermes stretches the cord along his arm, and counts the knots against the sky.'),
            H('At arm’s length, one fist is about ten degrees. Fourteen is a fist and a bit more.'),
            H('That is a lot more than nothing, Silvia. Which side?')
          ]; } },
        keep: { icon: '⭐', label: 'Keep the Pole Star straight ahead.', say: 'Walk with the Pole Star straight ahead.', wrong: true,
          lines: function () { return lostLines('straight at the Pole Star, which is true north'); },
          done: function () { Road.patch({ nightLost: true }); } },
        right: { icon: '➡️', label: '14° to the right of the Pole Star.', say: 'Put the Pole Star a little to your left. Walk 14° to the right of it.',
          lines: function () { return [
            H('East is on the right when you face north. So a fist and a bit to the right of the star.'),
            nar('Hermes turns until the Pole Star sits at the edge of his left eye, and walks.', { fx: fx('lookAhead') }),
            nar('Hours pass. The sand is firm and cold. At the first grey of dawn, a tall black shape rises dead ahead.'),
            H('The Monolith. Silvia, we came out exactly right.'),
            H('I watched my own shadow all night under the moon, and measured it against my staff. It will help me with the Monolith’s.')
          ]; },
          done: function () { grant('s14-sigil', 1); Road.patch({ nightStars: true }); } },
        left: { icon: '⬅️', label: '14° to the left of the Pole Star.', say: 'Walk 14° to the left of the Pole Star.', wrong: true,
          lines: function () { return lostLines('to the left of the Pole Star, which is west of north'); },
          done: function () { Road.patch({ nightLost: true }); } }
      }
    }
  };

  function lostLines(where) {
    return [
      H('If you say so, Silvia. I walk ' + where + '.'),
      nar('Hours pass. The stars turn, and the Pole Star does not seem to move at all. Neither does the horizon.', { fx: fx('lookAhead') }),
      nar('At first light, the Monolith stands far off to the side of the way.'),
      H('I have lost two hours and half a skin of water, Silvia. East of north is on the right when you face north. I should have said so.'),
      H('No harm done. But next time, we count the fists.')
    ];
  }

  function allChoices(kind) { return NIGHTS[kind].choices; }
  function menuIds() { return NIGHTS[ns.kind].menu(); }

  function renderChoices() {
    choicesBox.innerHTML = '';
    var box = choicesBox.parentNode;
    var ids = ns.stage === 'asking' ? menuIds() : [];
    box.style.display = ids.length ? '' : 'none';
    ids.forEach(function (id) {
      var c = allChoices(ns.kind)[id];
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gates-choice-btn'; b.id = 'night-choice-' + id;
      b.innerHTML = '<span>' + c.icon + ' ' + c.label + '</span>';
      b.addEventListener('click', function () { pick(id); });
      choicesBox.appendChild(b);
    });
  }

  async function pick(id) {
    if (ns.busy || ns.stage !== 'asking') return;
    var c = allChoices(ns.kind)[id], token = chat.token;
    ns.busy = true;
    if (!window.__nightFast) chat.fast = false;   // a hurry only lasts the scene in flight
    choicesBox.innerHTML = '';
    choicesBox.parentNode.style.display = 'none';
    ns.picked[id] = true;
    if (sfx.playMechanicalClick) sfx.playMechanicalClick();
    await chat.say('silvia', [c.say], token);
    var ok = await chat.play(c.lines(), token);
    if (!ok) return;
    if (!window.__nightFast) chat.fast = false;
    ns.busy = false;
    if (c.done) { c.done(); if (window.syncLampOil) window.syncLampOil(); finish(id); }
    else renderChoices();
  }

  function finish(id) {
    ns.stage = 'done';
    speaking = null; hideBubble();
    var flags = roadFlags();
    Road.saveNight({ done: true, kind: ns.kind, choice: id, boons: ns.boon });
    setMission('The Monolith is in sight');
    if (finishBody) finishBody.textContent = epilogue(id);
    if (finishCard) finishCard.style.display = 'flex';
    if (finishBtn) finishBtn.focus();
    if (sfx.playCelestialChime) sfx.playCelestialChime();
  }
  function epilogue(id) {
    var b = ns.boon.length;
    var base = {
      share: 'The nomad walked on with a light in his lamp, and left Hermes a clue for the first mark of the Monolith.',
      all: 'Hermes walked the rest of the night with no lamp at all, and the nomad left him two clues for the Monolith.',
      refuse: 'Hermes kept every drop of his oil, and the nomad walked on alone into the dark.',
      follow: 'The camel of moonlight led Hermes to a carved stone, and a clue for the first mark of the Monolith.',
      watch: 'The camel drew a straight line toward the dawn, and left Hermes with a clue for the Monolith.',
      call: 'The camel vanished at the sound of a voice. Hermes walked the rest of the night alone.',
      right: 'Silvia steered Hermes by the Pole Star, and a night under the moon taught him how shadows fall.',
      keep: 'Hermes lost the night walking true north instead of north-north-east, and arrived with half a skin of water.',
      left: 'Hermes lost the night walking west of north, and arrived with half a skin of water.'
    }[id] || '';
    return base + (b ? ' ✦ A new note is waiting for you in the Monolith.' : '');
  }

  async function start() {
    var token = chat.reset();
    ns.token = token; ns.stage = 'intro'; ns.busy = true; ns.picked = {}; ns.boon = [];
    ns.kind = Road ? Road.nightKind() : 'traveller';
    var night = NIGHTS[ns.kind], flags = roadFlags();
    logEl.innerHTML = '';
    choicesBox.innerHTML = ''; choicesBox.parentNode.style.display = 'none';
    if (finishCard) finishCard.style.display = 'none';
    setMission('The night on the Great Erg');
    var tm = document.getElementById('night-hud-time'); if (tm) tm.textContent = night.time;
    var tt = document.getElementById('night-title-kind'); if (tt) tt.textContent = night.title;
    if (S3) S3.setKind(ns.kind, flags);
    hideBubble();

    var hours = Road ? Road.marchHours() : 12, mk = Road ? Road.marchKind() : 'steady';
    chat.card('📖 Where we are', [
      'Hermes crossed the Great Erg by night: ' + hours + ' hours on foot from the gates of Tower II.',
      'He is telling you what happened out there, and you decide what he does.',
      'What you choose may help him at the Monolith.'
    ]);
    await chat.sleep(1500);
    var open = [];
    if (mk === 'storm') open.push(H('The storm caught us at midnight, Silvia, and cost two hours. When it passed the sky was clean and cold.'));
    else if (mk === 'shortcut') open.push(H('The Servant’s dry channel saved us two hours, and the sand was firm under my boots.'));
    if (flags.blessing) open.push(H('The red cord is still on my wrist.'));
    var ok = await chat.play(open.concat(night.open()), token);
    if (!ok) return;
    ns.stage = 'asking'; ns.busy = false;
    speaking = null; hideBubble();
    setMission('Decide what Hermes does');
    renderChoices();
  }

  // ---------------------------------------------------------------------
  // 2. THE STAGE BUBBLE (follows the speaker)
  // ---------------------------------------------------------------------
  function showBubble(who, text) {
    if (!bubbleEl || !who) { hideBubble(); return; }
    var c = CAST[who];
    bubbleEl.className = 'gates-bubble gb-' + who + (text ? ' is-on' : ' is-typing');
    bubbleEl.innerHTML = '<div class="gb-name">' + c.icon + ' ' + c.name.toUpperCase() + '</div>' +
      '<div class="gb-text">' + (text ? text.replace(/</g, '&lt;') : '<span class="gl-typing"><i></i><i></i><i></i></span>') + '</div>';
    if (who === 'silvia') bubbleEl.classList.add('gb-radio');
    bubbleWho = who;
  }
  var bubbleWho = null;
  function hideBubble() { if (bubbleEl) bubbleEl.className = 'gates-bubble'; bubbleWho = null; }

  // ---------------------------------------------------------------------
  // 3. THE SCENE (three.js): night sky, dunes, a lamp, and the night's visitor
  // ---------------------------------------------------------------------
  var renderer = null, scene = null, camera = null, orbitCtl = null, animId = null, clock = { t: 0, last: 0 };

  // a soft glow or a four-pointed star as a sprite texture
  function glowTex(size, cross) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), h = size / 2;
    var grad = g.createRadialGradient(h, h, 0, h, h, h);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.18, 'rgba(210,225,255,0.65)'); grad.addColorStop(1, 'rgba(120,150,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, size, size);
    if (cross) {
      g.strokeStyle = 'rgba(235,242,255,0.9)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(h, 2); g.lineTo(h, size - 2); g.moveTo(2, h); g.lineTo(size - 2, h); g.stroke();
    }
    return new T.CanvasTexture(c);
  }
  function lcg(seed) { var s = seed; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

  // a camel of moonlight: translucent, with legs that really walk
  function buildCamel() {
    var g = new T.Group();
    var m = new T.MeshBasicMaterial({ color: 0xa9d4ff, transparent: true, opacity: 0.36, depthWrite: false, blending: T.AdditiveBlending, fog: false });
    var halo = new T.MeshBasicMaterial({ color: 0x6fa6ff, transparent: true, opacity: 0.12, depthWrite: false, blending: T.AdditiveBlending, side: T.BackSide, fog: false });
    function ell(r, sx, sy, sz, x, y, z) {
      var a = new T.Mesh(new T.SphereGeometry(r, 18, 12), m); a.scale.set(sx, sy, sz); a.position.set(x, y, z); g.add(a);
      var b = new T.Mesh(new T.SphereGeometry(r * 1.12, 14, 10), halo); b.scale.set(sx, sy, sz); b.position.set(x, y, z); g.add(b);
      return a;
    }
    ell(1, 0.55, 0.6, 1.25, 0, 1.55, 0);            // body
    ell(1, 0.4, 0.5, 0.45, 0, 2.15, -0.15);          // hump
    ell(1, 0.2, 0.2, 0.7, 0, 2.2, -1.2).rotation.x = -0.9;   // neck (sphere stretched along z, tilted up)
    ell(1, 0.22, 0.23, 0.42, 0, 2.95, -1.75);        // head
    ell(1, 0.15, 0.14, 0.2, 0, 2.85, -2.12);         // muzzle
    ell(1, 0.06, 0.12, 0.05, 0.14, 3.14, -1.64); ell(1, 0.06, 0.12, 0.05, -0.14, 3.14, -1.64);   // ears
    var tail = ell(1, 0.05, 0.05, 0.45, 0, 1.75, 1.4); tail.rotation.x = 0.7;
    var legs = [];
    [[-0.3, -0.75], [0.3, -0.75], [-0.3, 0.8], [0.3, 0.8]].forEach(function (p, i) {
      var leg = new T.Group(); leg.position.set(p[0], 1.35, p[1]);
      var up = new T.Mesh(new T.CylinderGeometry(0.1, 0.07, 0.75, 8), m); up.position.y = -0.38; leg.add(up);
      var lo = new T.Group(); lo.position.y = -0.76; leg.add(lo);
      var shin = new T.Mesh(new T.CylinderGeometry(0.06, 0.05, 0.7, 8), m); shin.position.y = -0.34; lo.add(shin);
      var hoof = new T.Mesh(new T.SphereGeometry(0.1, 8, 6), m); hoof.scale.set(1.1, 0.5, 1.4); hoof.position.y = -0.7; lo.add(hoof);
      g.add(leg); legs.push({ leg: leg, lo: lo, ph: (i === 0 || i === 3) ? 0 : Math.PI });
    });
    g.userData = { legs: legs, mats: [m, halo] };
    return g;
  }

  function setup3D() {
    if (!canvas || !T || !SC || !P) return;
    if (renderer) return;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { console.warn('WebGL not supported for the Night on the Erg:', e); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    scene = new T.Scene();
    var HORIZON = 0x1c2a52;
    scene.fog = new T.Fog(HORIZON, 26, 95);   // the sky's horizon as it shows: the dunes melt into it
    var aspect = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    camera = new T.PerspectiveCamera(46, aspect, 0.1, 320);
    var paint = SC.paint();

    var MOON = [-0.5, 0.46, -0.74];
    var skyObj = SC.sky(scene, { zenith: 0x03061a, mid: 0x0d1a40, horizon: HORIZON, glow: 0x3d5aa8, sun: MOON, cloudA: new T.Color(0.16, 0.2, 0.34), cloudB: new T.Color(0.3, 0.36, 0.52), cloudK: 0.35, disc: new T.Color(0.86, 0.92, 1.0) });

    // ---- stars: a dome of points, a bright Pole Star due north (-z) with the Great Bear wheeling below it ----
    var rnd = lcg(77), SN = 1100, sp = new Float32Array(SN * 3), sc = new Float32Array(SN * 3);
    for (var i = 0; i < SN; i++) {
      var y = 0.035 + Math.pow(rnd(), 0.8) * 0.96, ph = rnd() * Math.PI * 2, rr = Math.sqrt(1 - y * y);
      sp[i * 3] = Math.cos(ph) * rr * 112; sp[i * 3 + 1] = y * 112; sp[i * 3 + 2] = Math.sin(ph) * rr * 112;
      var b = 0.3 + 0.7 * Math.pow(rnd(), 3);
      sc[i * 3] = b * 0.92; sc[i * 3 + 1] = b * 0.96; sc[i * 3 + 2] = b;
    }
    var sg = new T.BufferGeometry();
    sg.setAttribute('position', new T.BufferAttribute(sp, 3)); sg.setAttribute('color', new T.BufferAttribute(sc, 3));
    var stars = new T.Points(sg, new T.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, fog: false }));
    stars.frustumCulled = false; stars.renderOrder = -90; scene.add(stars);
    var flare = glowTex(128, true), halo = glowTex(128, false);
    function sprite(map, dir, size, op) {
      var s = new T.Sprite(new T.SpriteMaterial({ map: map, transparent: true, opacity: op, depthWrite: false, fog: false, blending: T.AdditiveBlending }));
      var l = Math.hypot(dir[0], dir[1], dir[2]);
      s.position.set(dir[0] / l * 108, dir[1] / l * 108, dir[2] / l * 108); s.scale.set(size, size, 1); s.renderOrder = -80; scene.add(s); return s;
    }
    var polaris = sprite(flare, [0.02, 0.55, -0.83], 10, 1);
    // the Great Bear: seven points near the Pole Star
    [[0.28, 0.40, -0.86], [0.36, 0.43, -0.83], [0.43, 0.47, -0.79], [0.49, 0.5, -0.74], [0.52, 0.58, -0.7], [0.62, 0.6, -0.62], [0.6, 0.67, -0.58]].forEach(function (d) { sprite(halo, d, 3.2, 0.9); });
    sprite(halo, MOON, 34, 0.55);

    // ---- the ground: cold dunes, a flat patch for the camp ----
    var ground = SC.terrain(scene, paint, { seed: 61, flatRadius: 16, size: 190, segments: 120 });
    ground.mesh.material.color.setHex(0x59679b);
    SC.ridges(scene, { horizon: HORIZON, rings: [
      { R: 88, h: 10, seed: 6, col: SC.util.hex(0x1a2347), haze: 0.5 },
      { R: 106, h: 17, seed: 13, col: SC.util.hex(0x121a38), haze: 0.7 }
    ] });
    SC.scatter(scene, paint, ground.heightAt, { cx: 0, cz: 0, clear: 7, pebbles: 260, tufts: 260, scrub: 22, seed: 9 });
    [[-7.5, -5, 1.2], [8.6, -8, 2.3], [-12, 6, 0.4]].forEach(function (f) {
      var rk = SC.props.rocks(paint, { seed: 11, scale: 0.9, count: 3 });
      rk.position.set(f[0], 0, f[1]); rk.rotation.y = f[2];
      rk.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); o.material.color.setHex(0x4a5580); } });
      scene.add(rk);
    });

    // ---- moon and starlight; the lamp does the rest ----
    var L = SC.lights(scene, { key: 0x9db8ff, keyI: 0.36, kx: -9, ky: 10, kz: -9, tx: 0, tz: 0, fill: 0x5a6cc8, fillI: 0.12, back: 0x3a4a9a, backI: 0.2, sky: 0x4a5c9e, ground: 0x151a30, hemi: 0.3, amb: 0.05, shadowExtent: 12, shadowSize: 1024 });

    // ---- Hermes, his lamp, a small fire for company ----
    var Hh = P.buildHermes(T, SC.tex.soft());
    var hermes = Hh.hermes;
    hermes.position.set(-1.5, 0, 0.4); hermes.rotation.y = -2.1; hermes.scale.setScalar(1.15);
    hermes.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(hermes);
    var lampLight = new T.PointLight(0xffb868, 1.6, 15, 1.7);
    scene.add(lampLight);
    var ringH = new T.Mesh(new T.RingGeometry(0.62, 0.78, 48), new T.MeshBasicMaterial({ color: 0x7fb4ff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false }));
    ringH.rotation.x = -Math.PI / 2; ringH.position.set(hermes.position.x, 0.03, hermes.position.z); scene.add(ringH);
    var camp = SC.props.brazier(paint, { height: 0.8, intensity: 1.3, range: 11 });
    camp.position.set(-0.2, 0, 0.9); scene.add(camp);

    // ---- the traveller (a man of thirty-five in a striped headcloth, linen and a sash) ----
    var nomad = SC.chars.nomad ? SC.chars.nomad(paint, {}) : SC.chars.elder(paint, { robe: 0x24406e, trim: 0xe0b050, mantle: 0x172640 });
    nomad.position.set(9, 0, -4); nomad.rotation.y = 1.95; nomad.scale.setScalar(1.3); nomad.visible = false;
    scene.add(nomad);
    var nomadLamp = new T.PointLight(0xffc070, 0, 8, 1.8); scene.add(nomadLamp);
    var ringN = new T.Mesh(new T.RingGeometry(0.62, 0.78, 48), new T.MeshBasicMaterial({ color: 0x8fe0d0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false }));
    ringN.rotation.x = -Math.PI / 2; scene.add(ringN);

    // ---- the ghost camel and the prints it leaves ----
    var camel = buildCamel(); camel.visible = false; camel.position.set(10, 0, -7); scene.add(camel);
    var PN = 36, prints = [];
    var printMat = new T.MeshBasicMaterial({ color: 0xa9d4ff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, fog: false });
    for (var pi = 0; pi < PN; pi++) {
      var pm = new T.Mesh(new T.CircleGeometry(0.2, 14), printMat.clone());
      pm.rotation.x = -Math.PI / 2; pm.scale.set(0.9, 1.4, 1); pm.visible = false; pm.userData.life = 0; scene.add(pm); prints.push(pm);
    }
    var printI = 0;
    function dropPrint(x, z, rotY, side) {
      var p = prints[printI++ % PN];
      p.position.set(x + Math.cos(rotY) * 0.28 * side, 0.04, z - Math.sin(rotY) * 0.28 * side);
      p.rotation.z = rotY; p.visible = true; p.userData.life = 1;
    }
    var mover = { target: null, speed: 0, pathDone: null, stride: 0, side: 1 };

    // ---- wind-blown sand (a storm made the night longer) ----
    var WN = 360, wp = new Float32Array(WN * 3), wr = lcg(5);
    for (var wi = 0; wi < WN; wi++) { wp[wi * 3] = (wr() - 0.5) * 40; wp[wi * 3 + 1] = 0.2 + wr() * 3.2; wp[wi * 3 + 2] = (wr() - 0.5) * 40; }
    var wg = new T.BufferGeometry(); wg.setAttribute('position', new T.BufferAttribute(wp, 3));
    var windDust = new T.Points(wg, new T.PointsMaterial({ map: SC.tex.soft(), size: 0.14, color: 0x8da0d8, transparent: true, opacity: 0.0, depthWrite: false, sizeAttenuation: true }));
    windDust.frustumCulled = false; scene.add(windDust);

    // ---- the camera ----
    var narrow = Math.max(1, 1.2 / aspect);
    orbitCtl = SC.orbit(canvas, camera, { dist: Math.min(24, 11.5 * narrow), minDist: 3, maxDist: 26, pitch: 0.18, minPitch: -0.02, maxPitch: 1.1, yawLimit: 2.2, x: 0.4, y: 1.7, z: 0, groundY: 0.4 });
    function frame(x, y, z, d) { orbitCtl.setTarget(x, y, z); orbitCtl.state.tDist = Math.min(26, d * narrow); }
    frame(0.4, 1.7, 0, 11.5);
    orbitCtl.state.dist = orbitCtl.state.tDist;

    var kind = 'traveller', fl = {}, lampK = 1, lampBoost = 0;
    var flameOn = true;

    function setKind(k, flags) {
      kind = k; fl = flags || {};
      var lantern = Road ? Road.hasLantern(fl) : true;
      flameOn = lantern; Hh.flame.visible = lantern; lampK = lantern ? 1 : 0;
      camp.visible = (k === 'traveller'); camp.userData.on = camp.visible;
      nomad.visible = false; camel.visible = false; nomadLamp.intensity = 0; if (nomad.userData.setLamp) nomad.userData.setLamp(false);
      prints.forEach(function (p) { p.visible = false; });
      mover.target = null;
      var storm = Road && Road.marchKind() === 'storm';
      windDust.material.opacity = storm ? 0.55 : 0.0;
      scene.fog.near = storm ? 14 : 26; scene.fog.far = storm ? 62 : 95;
      polaris.visible = true;
      // the dark night is steered by the Pole Star: look up at it, a fist and a bit to the right
      if (k === 'dark') frame(0.2, 3.4, 0, 11);
      else frame(0.4, 1.7, 0, 11.5);
    }

    S3 = {
      setKind: setKind, nomadObj: nomad,
      fx: {
        travellerComes: function () { nomad.visible = true; nomad.position.set(9, 0, -4); mover.target = { obj: nomad, x: 1.5, z: -0.3, face: Math.PI + 0.9, speed: 2.6, lamp: false }; frame(0.2, 1.6, -0.2, 8.5); },
        travellerLeaves: function () { nomadLamp.intensity = 1.1; if (nomad.userData.setLamp) nomad.userData.setLamp(true); mover.target = { obj: nomad, x: -15, z: -22, face: null, speed: 2.2, lamp: true, hideAtEnd: true }; },
        pour: function () { lampBoost = 1.4; if (sfx.playCelestialChime) sfx.playCelestialChime(); },
        camelComes: function () { camel.visible = true; camel.position.set(10, 0, -7); mover.target = { obj: camel, x: 2.6, z: -2.0, face: null, speed: 2.4, prints: true }; frame(0.6, 1.6, -0.8, 9.5); },
        camelLeads: function () { mover.target = { obj: camel, x: 7, z: -34, face: null, speed: 2.4, prints: true }; },
        camelFades: function () { mover.fade = 1; },
        lookNorth: function () { frame(0.2, 3.6, 0, 11); },
        lookAhead: function () { frame(0.4, 1.7, 0, 11.5); }
      }
    };

    var tmp = new T.Vector3();
    // the shared feel (EclipseFX): the lamp, the fire and the stars bloom in a cold night grade; Hermes breathes and looks
    efx = null;
    try {
      if (window.EclipseFX) efx = window.EclipseFX.kit(renderer, scene, Hh, {
        look: { bloom: 0.7, threshold: 0.86, knee: 0.16, vignette: 0.38, grain: 0.032, ca: 0.16, sat: 1.0, contrast: 1.04, gain: [0.97, 1.0, 1.06] },
        printsOn: false, sandColor: 0x6d6a86, blowColor: 0x08091c, scale: 1.15, idle: 0.0016
      });
    } catch (e) { efx = null; }
    var updaters = [function (t, dt) {
      skyObj.uniforms.uTime.value = t;
      stars.material.opacity = 0.88 + 0.07 * Math.sin(t * 1.7);
      polaris.scale.setScalar(10 + 1.2 * Math.sin(t * 2.3));
      // lamp: flicker, a pulse when oil is poured
      lampBoost *= Math.pow(0.35, dt);
      Hh.lamp.getWorldPosition(tmp);
      lampLight.position.copy(tmp);
      lampLight.intensity = flameOn ? (1.5 + 0.2 * Math.sin(t * 11) + 0.1 * Math.sin(t * 23)) * (1 + lampBoost) : 0;
      Hh.flame.scale.set(1 + 0.08 * Math.sin(t * 9), 1.35 + 0.12 * Math.sin(t * 13 + 1) + lampBoost * 0.5, 1);
      if (!(efx && efx.gait)) { Hh.lamp.rotation.z = Math.sin(t * 1.3) * 0.04; Hh.cloak.scale.y = 1 + Math.sin(t * 1.1) * 0.004; }
      if (camp.visible) camp.userData.update(t, 0.7, 1);
      nomad.userData.update && nomad.visible && nomad.userData.update(t);
      var spH = speaking === 'hermes' || speaking === 'silvia', spN = speaking === 'nomad', pulse = 0.55 + 0.35 * Math.sin(t * 5);
      ringH.material.opacity += ((spH ? pulse : 0) - ringH.material.opacity) * Math.min(1, dt * 8);
      ringN.material.opacity += ((spN && nomad.visible ? pulse : 0) - ringN.material.opacity) * Math.min(1, dt * 8);
      ringN.position.set(nomad.position.x, 0.03, nomad.position.z);
      hermes.position.y = spH ? 0.02 * Math.abs(Math.sin(t * 8)) : 0;
      if (efx) {
        // he looks at the traveller while he is there, and at the fire otherwise
        if (efx.gait) efx.gait.look(nomad.visible ? { x: nomad.position.x, y: 2.2, z: nomad.position.z } : { x: camp.position.x, y: 0.6, z: camp.position.z });
        efx.frame(dt, camera);
      }
      nomadLamp.position.set(nomad.position.x - 0.4, 1.4, nomad.position.z + 0.3);
      // walkers: the nomad slides on, the camel strides and leaves prints
      var m = mover.target;
      if (m) {
        var o = m.obj, dx = m.x - o.position.x, dz = m.z - o.position.z, d = Math.hypot(dx, dz);
        if (d > 0.08) {
          var step = Math.min(d, m.speed * dt);
          o.position.x += dx / d * step; o.position.z += dz / d * step;
          var want = m.face != null && d < 2.4 ? m.face : Math.atan2(-dx, -dz);
          o.rotation.y += (((want - o.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dt * 4);
          if (o === camel) {
            camel.userData.legs.forEach(function (l) { var a = Math.sin(t * 5.5 + l.ph); l.leg.rotation.x = a * 0.5; l.lo.rotation.x = Math.max(0, -a) * 0.7; });
            camel.position.y = Math.abs(Math.sin(t * 5.5)) * 0.04;
          } else o.position.y = Math.abs(Math.sin(t * 6)) * 0.03;
          mover.stride += step;
          if (m.prints && mover.stride > 1.0) { mover.stride = 0; mover.side *= -1; dropPrint(camel.position.x, camel.position.z, camel.rotation.y, mover.side); }
        } else {
          if (o === camel) camel.userData.legs.forEach(function (l) { l.leg.rotation.x *= 0.9; l.lo.rotation.x *= 0.9; });
          if (m.hideAtEnd) { o.visible = false; m.hideAtEnd = false; nomadLamp.intensity = 0; if (nomad.userData.setLamp) nomad.userData.setLamp(false); }
        }
      }
      if (mover.fade) {
        mover.fade = Math.max(0, mover.fade - dt * 0.8);
        camel.userData.mats[0].opacity = 0.36 * mover.fade; camel.userData.mats[1].opacity = 0.12 * mover.fade;
        if (mover.fade === 0) { camel.visible = false; camel.userData.mats[0].opacity = 0.36; camel.userData.mats[1].opacity = 0.12; mover.target = null; }
      }
      prints.forEach(function (p) { if (p.userData.life > 0) { p.userData.life = Math.max(0, p.userData.life - dt * 0.18); p.material.opacity = 0.7 * p.userData.life; if (!p.userData.life) p.visible = false; } });
      if (windDust.material.opacity > 0 && !reducedMotion) {
        var a = windDust.geometry.attributes.position.array;
        for (var k = 0; k < a.length; k += 3) { a[k] += dt * 9; if (a[k] > 20) a[k] -= 40; a[k + 1] += Math.sin(t * 2 + k) * 0.01; }
        windDust.geometry.attributes.position.needsUpdate = true;
      }
    }];
    scene.userData.updaters = updaters;

    if (!bubbleEl) { bubbleEl = document.createElement('div'); bubbleEl.className = 'gates-bubble'; canvas.parentNode.appendChild(bubbleEl); }
    startLoop();
  }

  var tmpV = null, efx = null;
  // keep the speech bubble over whoever talks (Silvia's radio bubble floats beside Hermes)
  function placeBubble() {
    if (!bubbleEl || !bubbleWho || !S3 || !camera) return;
    if (!tmpV) tmpV = new T.Vector3();
    if (bubbleWho === 'nomad') S3.nomadObj.localToWorld(tmpV.set(0, 2.4, 0));
    else tmpV.set(bubbleWho === 'silvia' ? -2.3 : -1.5, bubbleWho === 'silvia' ? 3.0 : 2.45, 0.4);
    tmpV.project(camera);
    var W = canvas.clientWidth, Ht = canvas.clientHeight;
    if (tmpV.z > 1) { bubbleEl.style.opacity = '0'; return; }
    var bw = bubbleEl.offsetWidth || 220, bh = bubbleEl.offsetHeight || 60;
    var x = (tmpV.x * 0.5 + 0.5) * W, y = (-tmpV.y * 0.5 + 0.5) * Ht;
    x = Math.max(bw / 2 + 8, Math.min(W - bw / 2 - 8, x));
    y = Math.max(bh + 54, Math.min(Ht - 70, y));
    bubbleEl.style.opacity = ''; bubbleEl.style.left = x + 'px'; bubbleEl.style.top = y + 'px';
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
    placeBubble();
  }
  function handleResize() {
    if (!renderer || !camera || !canvas) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', function () { if (modal.style.display !== 'none') handleResize(); });

  // ---------------------------------------------------------------------
  // 4. OPEN / CLOSE
  // ---------------------------------------------------------------------
  var returnFocusTo = null;
  function open(onDone) {
    ns.onDone = typeof onDone === 'function' ? onDone : null;
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
    ns.busy = false; speaking = null; hideBubble();
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
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.style.display !== 'none') close(ns.stage === 'done'); });

  // Station 14 asks: has the road's night been lived yet?
  window.needsNightErg = function () { return !!Road && !Road.nightDone(); };
  window.openNightErgModal = open;
  window.__nightErg = { kinds: Object.keys(NIGHTS), kindFor: function (f) { return Road.nightKind(f); }, fast: function () { chat.fast = true; window.__nightFast = true; } };
})();
