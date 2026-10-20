/* The Grand Desert Map · 3D "unlit" view (Three.js r149 global build).
 *
 * The Journal already prints this map on parchment, so the Hub does not repeat it. Here the whole
 * desert is black. Only the cliffs show as faint blue relief, and the ground lights up where Hermes
 * has actually walked. Places he has not reached are plain "?" marks: no name, no number.
 *
 * Textures come from scripts/maps/build_desert_relief.py. State comes from the same localStorage
 * flags as the rest of the Hub, so no other module has to know about this file.
 */
(function () {
  'use strict';
  if (window.Desert3D) return;

  var MAP_W = 1920, MAP_H = 2724;                 // coordinate space of the Journal overview map
  var ASSETS = './assets/maps/';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var PLANE_W = 1, PLANE_H = MAP_H / MAP_W;
  var TILT = 0.35;                                // radians the map leans back
  var DISP = 0.1;                                 // terrain height, relative to map width
  var MESH_W = PLANE_W * 1.30, MESH_H = PLANE_H * 1.18; // extended full-bleed mesh
  var MASK_W = 384, MASK_H = Math.round(384 * MAP_H / MAP_W);

  var ls = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var flag = function (k) { return ls(k) === 'true'; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ------------------------------------------------------------------ Hermes' journey */
  // Normal Route: traverses down the dry river (Wadi al-Hajar) to Cairn I, then south to North Portal.
  var WP_NORMAL = [
    { x: 242, y: 752 },    // 0  Outer Watchtower VI (sheltering from the storm)
    { x: 170, y: 948 },    // 1  The Great Silence (dawn)
    { x: 538, y: 1203 },   // 2  Cairn I, down the dry river
    { x: 400, y: 2052 },   // 3  North Portal of the Whispering Chasm
    { x: 1196, y: 2460 },  // 4  The Salt Playa
    { x: 1180, y: 2367 },  // 5  Nomad Ruins
    { x: 1580, y: 2420 },  // 6  The Oasis
    { x: 1262, y: 430 },   // 7  The Sun Monolith
    { x: 1640, y: 770 },   // 8  The Sandstone Labyrinth
    { x: 130, y: 2150 },   // 9  Cairn IV
    { x: 1480, y: 2040 },  // 10 Arch of the Solstice
    { x: 1560, y: 1660 }   // 11 Sandstone Sanctuary
  ];
  var SEG_NORMAL = [
    null,
    'M 242 752 C 225 810 190 880 170 948',
    'M 170 948 C 215 968 300 990 340 1000 S 395 1012 413 1019 C 430 1045 425 1070 450 1105 S 505 1160 538 1203',
    'M 538 1203 C 560 1235 548 1290 520 1330 S 505 1400 490 1440 S 440 1540 395 1610 S 340 1700 340 1760 S 385 1860 405 1925 S 418 1995 400 2052',
    'M 400 2052 C 520 2200 780 2230 960 2330 S 1140 2430 1196 2460',
    'M 1196 2460 C 1210 2430 1195 2395 1180 2367',
    'M 1180 2367 C 1300 2330 1450 2330 1580 2420',
    'M 1580 2420 C 1590 2180 1580 1900 1560 1660 C 1530 1250 1450 820 1350 600 S 1280 470 1262 430',   // via the gates of Tower II
    'M 1262 430 C 1400 520 1550 640 1640 770',
    'M 1640 770 C 1500 1300 900 1500 700 1800 S 300 2100 130 2150',
    'M 130 2150 C 400 2350 900 2300 1200 2150 S 1420 2060 1480 2040',
    'M 1480 2040 C 1500 1900 1540 1760 1560 1660'
  ];
  var WHERE_NORMAL = [
    'Outer Watchtower VI', 'The Great Silence', 'Wadi al-Hajar · Cairn I', 'The North Portal', 'The Salt Playa',
    'Nomad Ruins', 'The Oasis', 'The Sun Monolith', 'The Sandstone Labyrinth', 'Cairn IV',
    'Arch of the Solstice', 'The Sandstone Sanctuary'
  ];

  // Bypassed Route: Silvia chose to NOT disturb Cairn I; Hermes traverses the Western Rock Shelf.
  var WP_BYPASS = [
    { x: 242, y: 752 },    // 0  Outer Watchtower VI
    { x: 170, y: 948 },    // 1  The Great Silence
    { x: 215, y: 1420 },   // 2  The Western Rock Shelf
    { x: 400, y: 2052 },   // 3  North Portal
    { x: 1196, y: 2460 },  // 4  The Salt Playa
    { x: 1180, y: 2367 },  // 5  Nomad Ruins
    { x: 1580, y: 2420 },  // 6  The Oasis
    { x: 1262, y: 430 },   // 7  The Sun Monolith
    { x: 1640, y: 770 },   // 8  The Sandstone Labyrinth
    { x: 130, y: 2150 },   // 9  Cairn IV
    { x: 1480, y: 2040 },  // 10 Arch of the Solstice
    { x: 1560, y: 1660 }   // 11 Sandstone Sanctuary
  ];
  var SEG_BYPASS = [
    null,
    'M 242 752 C 225 810 190 880 170 948',
    'M 170 948 C 160 1080 175 1250 215 1420',
    'M 215 1420 C 245 1580 285 1740 335 1880 S 385 2000 400 2052',
    'M 400 2052 C 520 2200 780 2230 960 2330 S 1140 2430 1196 2460',
    'M 1196 2460 C 1210 2430 1195 2395 1180 2367',
    'M 1180 2367 C 1300 2330 1450 2330 1580 2420',
    'M 1580 2420 C 1590 2180 1580 1900 1560 1660 C 1530 1250 1450 820 1350 600 S 1280 470 1262 430',   // via the gates of Tower II
    'M 1262 430 C 1400 520 1550 640 1640 770',
    'M 1640 770 C 1500 1300 900 1500 700 1800 S 300 2100 130 2150',
    'M 130 2150 C 400 2350 900 2300 1200 2150 S 1420 2060 1480 2040',
    'M 1480 2040 C 1500 1900 1540 1760 1560 1660'
  ];
  var WHERE_BYPASS = [
    'Outer Watchtower VI', 'The Great Silence', 'The Western Rock Shelf', 'The North Portal', 'The Salt Playa',
    'Nomad Ruins', 'The Oasis', 'The Sun Monolith', 'The Sandstone Labyrinth', 'Cairn IV',
    'Arch of the Solstice', 'The Sandstone Sanctuary'
  ];

  // From the Oasis, Hermes first walks to the gates of Tower II (Sheet 13A), then crosses the Great Erg
  // to the Sun Monolith. Segment 7 starts with exactly this sub-path, so its length marks the gates.
  var GATES_SUBPATH = 'M 1580 2420 C 1590 2180 1580 1900 1560 1660';

  var WP = WP_NORMAL;
  var SEG = SEG_NORMAL;
  var WHERE = WHERE_NORMAL;

  // lvl = progress level at which the place is reached. landmark = scenery, not a station.
  var STATIONS = [
    { key: 'wt6', x: 242, y: 752, lvl: 0, icon: '🔭', label: 'OUTER WATCHTOWER VI [112° E]',
      say: '“Thick stone walls, a fire and a barred door. Safe, for now.” · Hermes, Outer Watchtower VI' },
    { key: 'silence', x: 170, y: 948, lvl: 1, landmark: true, icon: '🌅', label: 'THE GREAT SILENCE',
      say: '“The wind has stopped. After a big storm the desert holds its breath, and every sound carries for miles.” · Hermes, at dawn' },
    { key: 'river', x: 413, y: 1019, lvl: 2, landmark: true, icon: '👣', label: 'THE DRY RIVER',
      say: '“A riverbed wider than a street, with a floor of smooth gray stones. Something pulls me south along it.” · Hermes, Wadi al-Hajar' },
    { key: 'western_shelf', x: 215, y: 1420, lvl: 2, landmark: true, icon: '🧗', label: 'THE WESTERN SHELF',
      say: '“The hard rock shelf avoids the soft sand of the wash. A grueling climb, but solid underfoot.” · Hermes' },
    { key: 'cairn1', x: 538, y: 1203, lvl: 2, id: 22, icon: '🪨', label: 'CAIRN I', done: 'cairn1', revealWhen: 'cairnFound' },
    { key: 'portal', x: 400, y: 2052, lvl: 3, landmark: true, icon: '🚪', label: 'NORTH PORTAL',
      say: '“The rock splits open into a narrow gate, and the wind is already murmuring inside.” · Hermes, at the Whispering Chasm' },
    { key: 'chasm', x: 264, y: 2065, lvl: 3, id: 10, icon: '🧭', label: '10 · WHISPERING CHASM', done: 'chasm', doneLabel: '10 · WHISPERING CHASM (CLEARED)' },
    { key: 'playa', x: 1196, y: 2460, lvl: 4, id: 21, icon: '🧂', label: '11 · THE SALT PLAYA', done: 'playa', doneLabel: '11 · THE SALT PLAYA (CROSSED)' },
    { key: 'lexicon', x: 1180, y: 2367, lvl: 5, id: 11, icon: '📜', label: '12 · NOMAD RUINS (LEXICON)', done: 'lex', doneLabel: '12 · NOMAD RUINS (SOLVED)' },
    { key: 'oasis', x: 1580, y: 2420, lvl: 6, id: 12, icon: '💧', label: '13 · THE OASIS CLEPSYDRA', done: 'clep', doneLabel: '13 · THE OASIS CLEPSYDRA (SOLVED)' },
    { key: 'monolith', x: 1262, y: 430, lvl: 7, id: 23, icon: '☀️', label: '14 · THE SUN MONOLITH', done: 'monolith', doneLabel: '14 · THE SUN MONOLITH (CAIRN II)', revealWhen: 'clep' },
    { key: 'labyrinth', x: 1640, y: 770, lvl: 8, id: 24, icon: '🌀', label: '15 · THE SANDSTONE LABYRINTH', done: 'labyrinth', doneLabel: '15 · THE SANDSTONE LABYRINTH (CAIRN III)', revealWhen: 'monolith' },
    { key: 'cairn4', x: 130, y: 2150, lvl: 9, id: 25, icon: '🗿', label: '16 · CAIRN IV · SENTRY OF THE CANYON', done: 'cairn4', doneLabel: '16 · CAIRN IV (THE PILLARS SANG)', revealWhen: 'labyrinth' },
    { key: 'arch', x: 1480, y: 2040, lvl: 10, id: 26, icon: '🌓', label: '17 · ARCH OF THE SOLSTICE', done: 'arch', doneLabel: '17 · ARCH OF THE SOLSTICE (CAIRN V)', revealWhen: 'cairn4' },
    { key: 'stele', x: 1560, y: 1660, lvl: 11, id: 13, icon: '🔥', label: '18 · TOWER II · THE POLYBIUS STELE', done: 'stele', doneLabel: '18 · THE POLYBIUS STELE (THE SERVANT SAVED)', revealWhen: 'arch' },
    { key: 'sanctuary', x: 1640, y: 1590, lvl: 11, id: 14, icon: '🏛️', label: '19 · THE ORACLE OF TOWER II', done: 'oracle', revealWhen: 'stele' }
  ];

  function stormOver() {
    try {
      var p = new URLSearchParams(location.search);
      if (p.get('storm_over') === '1' || p.get('dawn') === '1') return true;
      if (ls('order_storm_tester_bypassed') === 'true') return true;
      if (typeof window.isStormOver === 'function') return window.isStormOver();
    } catch (e) {}
    var t = typeof window.getStormTargetTime === 'function' ? window.getStormTargetTime() : 1792324800000;
    return Date.now() >= t;
  }

  function readState() {
    var wire = parseInt(ls('order_field_wire_step') || '0', 10) || 0;
    var cairn1 = flag('order_cairn1_completed');
    var isBypassed = flag('order_cairn1_bypassed');
    var d = {
      cairn1: cairn1,
      chasm: flag('order_whispering_chasm_completed'),
      playa: flag('order_salt_playa_completed'),
      lex: flag('order_desert_lexicon_completed'),
      clep: flag('order_oasis_clepsydra_completed'),
      monolith: flag('order_sun_monolith_completed'),
      labyrinth: flag('order_sandstone_labyrinth_completed'),
      cairn4: flag('order_cairn_iv_completed'),
      arch: flag('order_arch_solstice_completed'),
      stele: flag('order_polybius_stele_completed'),
      oracle: flag('order_oracle_horizon_completed')
    };
    var dawn = (cairn1 || isBypassed) ? 3 : (parseInt(ls('order_dawn_step') || '0', 10) || 0);
    var reached = wire >= 4 || d.chasm || cairn1 || isBypassed;
    var storm = stormOver();

    var lvl = 0;
    if (reached && storm) lvl = 1;
    if (lvl >= 1 && dawn >= 1) lvl = 2;
    if (dawn >= 3) lvl = Math.max(lvl, 3);
    if (d.chasm) lvl = Math.max(lvl, 4);
    if (d.playa) lvl = Math.max(lvl, 5);
    if (d.lex) lvl = Math.max(lvl, 6);
    // Station 14: Hermes reaches the Sun Monolith (lvl 7) only when the 12-hour crossing is over.
    // Station 15: he reaches the Sandstone Labyrinth (lvl 8) only when the 6-hour walk down is over.
    var monolithArrived = d.monolith || (typeof window.isMonolithMarchOver === 'function' && window.isMonolithMarchOver());
    if (d.clep) lvl = Math.max(lvl, monolithArrived ? 7 : 6);
    var labyrinthArrived = d.labyrinth || (typeof window.isLabyrinthMarchOver === 'function' && window.isLabyrinthMarchOver());
    if (d.monolith) lvl = Math.max(lvl, labyrinthArrived ? 8 : 7);
    // Station 16: Cairn IV (lvl 9) only when the 18-hour crossing is over
    var cairnFourArrived = d.cairn4 || (typeof window.isCairnFourMarchOver === 'function' && window.isCairnFourMarchOver());
    if (d.labyrinth) lvl = Math.max(lvl, cairnFourArrived ? 9 : 8);
    // Station 17: the Arch of the Solstice (lvl 10) only when the 18-hour walk is over
    var archArrived = d.arch || (typeof window.isSolsticeMarchOver === 'function' && window.isSolsticeMarchOver());
    if (d.cairn4) lvl = Math.max(lvl, archArrived ? 10 : 9);
    // Station 18: Tower II (lvl 11) only when the 6-hour walk is over
    var steleArrived = d.stele || (typeof window.isSteleMarchOver === 'function' && window.isSteleMarchOver());
    if (d.arch) lvl = Math.max(lvl, steleArrived ? 11 : 10);

    try {   // test hook: ?d3lvl=4 forces a progress level
      var forced = new URLSearchParams(location.search).get('d3lvl');
      if (forced !== null && forced !== '') lvl = clamp(parseInt(forced, 10) || 0, 0, WP.length - 1);
    } catch (e) {}

    // reached = Hermes has arrived at Watchtower VI via the Field Wire (or later).
    // Until then there is no map position to show for him.
    return { lvl: lvl, dawn: dawn, done: d, waiting: reached && !storm, reached: reached, isBypassed: isBypassed };
  }

  function stationRevealed(st, s) {
    if (st.key === 'cairn1') {
      if (s.isBypassed) return false;
      return s.dawn >= 2 || s.done.cairn1;
    }
    if (st.key === 'western_shelf') {
      return s.isBypassed && s.lvl >= 2;
    }
    if (st.key === 'river') {
      if (s.isBypassed) return false;
      return s.lvl >= 2;
    }
    if (st.key === 'wt6') return !!(s.done.cairn1 || s.isBypassed);
    if (st.revealWhen === 'cairnFound') return s.dawn >= 2 || s.done.cairn1;
    if (st.revealWhen === 'clep') return !!s.done.clep;
    if (st.revealWhen === 'monolith') return !!s.done.monolith;
    if (st.revealWhen === 'labyrinth') return !!s.done.labyrinth;
    if (st.revealWhen === 'cairn4') return !!s.done.cairn4;
    if (st.revealWhen === 'arch') return !!s.done.arch;
    if (st.revealWhen === 'stele') return !!s.done.stele;
    return s.lvl >= st.lvl;
  }

  /* ------------------------------------------------------------------ route sampling */
  function buildRoute() {
    var holder = document.createElementNS(SVGNS, 'svg');
    holder.setAttribute('width', '0');
    holder.setAttribute('height', '0');
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden';
    document.body.appendChild(holder);
    var pts = [], cum = [0], total = 0, gatesD = null;
    SEG.forEach(function (d, i) {
      if (!d) { pts.push({ x: WP[0].x, y: WP[0].y, d: 0 }); return; }
      var p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d);
      holder.appendChild(p);
      var len = p.getTotalLength();
      var n = Math.max(2, Math.ceil(len / 8));
      for (var k = 1; k <= n; k++) {
        var pt = p.getPointAtLength(len * k / n);
        pts.push({ x: pt.x, y: pt.y, d: total + len * k / n });
      }
      if (i === 7) {
        var gatesPath = document.createElementNS(SVGNS, 'path');
        gatesPath.setAttribute('d', GATES_SUBPATH);
        holder.appendChild(gatesPath);
        gatesD = total + gatesPath.getTotalLength();
      }
      total += len;
      cum[i] = total;
    });
    holder.remove();
    return { pts: pts, cum: cum, total: total, gates: gatesD };
  }

  function pointAt(route, dist) {
    var pts = route.pts, lo = 0, hi = pts.length - 1;
    if (dist <= 0) return pts[0];
    if (dist >= pts[hi].d) return pts[hi];
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (pts[mid].d <= dist) lo = mid; else hi = mid;
    }
    var a = pts[lo], b = pts[hi], t = (dist - a.d) / Math.max(b.d - a.d, 1e-6);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, d: dist };
  }

  /* ------------------------------------------------------------------ shaders */
  var TERRAIN_VERT = [
    'uniform sampler2D uHeight;',
    'uniform float uDisp;',
    'uniform vec2 uPlane;',
    'varying vec2 vUv;',
    'varying float vH;',
    'varying float vDepth;',
    'void main() {',
    '  vec2 mapUv = vec2(position.x / uPlane.x + 0.5, position.y / uPlane.y + 0.5);',
    '  vUv = mapUv;',
    '  float h = texture2D(uHeight, clamp(mapUv, 0.0, 1.0)).r;',
    '  vH = h;',
    '  vec3 p = position;',
    '  p.z += h * uDisp;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  vDepth = -mv.z;',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var TERRAIN_FRAG = [
    'precision highp float;',
    'uniform sampler2D uInk;',
    'uniform sampler2D uHeight;',
    'uniform sampler2D uMask;',
    'uniform vec2 uTexel;',
    'uniform vec2 uHermes;',
    'uniform float uTime;',
    'uniform float uIntro;',
    'uniform float uRelief;',
    'uniform float uDepth0;',
    'uniform float uHermesLit;',
    'varying vec2 vUv;',
    'varying float vH;',
    'varying float vDepth;',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p), f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
    '}',
    'float fbm(vec2 p) {',
    '  float a = 0.5, s = 0.0;',
    '  for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }',
    '  return s;',
    '}',
    'void main() {',
    '  vec2 uv = vUv;',
    '  vec2 mapUv = clamp(uv, 0.0, 1.0);',
    '  vec2 tx = uTexel * 2.0;',
    '  float hl = texture2D(uHeight, clamp(uv - vec2(tx.x, 0.0), 0.0, 1.0)).r;',
    '  float hr = texture2D(uHeight, clamp(uv + vec2(tx.x, 0.0), 0.0, 1.0)).r;',
    '  float hd = texture2D(uHeight, clamp(uv - vec2(0.0, tx.y), 0.0, 1.0)).r;',
    '  float hu = texture2D(uHeight, clamp(uv + vec2(0.0, tx.y), 0.0, 1.0)).r;',
    '  vec3 n = normalize(vec3((hl - hr) * uRelief, (hd - hu) * uRelief, 1.0));',
    '  vec3 L = normalize(vec3(-0.62, 0.52, 0.60));',
    '  float diff = clamp(dot(n, L), 0.0, 1.0);',
    '  float rock = smoothstep(0.04, 0.75, vH);',
    '',
    '  vec2 warp = vec2(fbm(mapUv * vec2(9.0, 13.0) + uTime * 0.02), fbm(mapUv * vec2(9.0, 13.0) + 7.3 - uTime * 0.02)) - 0.5;',
    '  float m = texture2D(uMask, clamp(mapUv + warp * 0.022, 0.0, 1.0)).r;',
    '  float lit = smoothstep(0.10, 0.60, m) * uIntro;',
    '',
    '  bool inMap = (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0);',
    '  float inkSharp = inMap ? texture2D(uInk, uv).r : 0.0;',
    '  float inkSoft = inMap ? texture2D(uInk, uv, 3.4).r : 0.0;',
    '',
    '  float hh = vH * 16.0;',
    '  float contour = 1.0 - smoothstep(0.0, 1.4, abs(fract(hh - 0.5) - 0.5) / max(fwidth(hh), 1e-4));',
    '',
    '  // Unlit: black ground, dark-blue relief only',
    '  vec3 dark = vec3(0.006, 0.010, 0.022);',
    '  dark += vec3(0.05, 0.12, 0.30) * (0.18 + 0.95 * diff) * rock * 0.62;',
    '  dark += vec3(0.04, 0.10, 0.26) * inkSoft * 1.05;',
    '  dark += vec3(0.05, 0.13, 0.32) * contour * 0.30 * smoothstep(0.08, 0.40, vH);',
    '',
    '  // Lit: moonlit relief with crisp pale-blue linework (not the Journal colours)',
    '  vec3 litCol = vec3(0.020, 0.040, 0.078) + vec3(0.07, 0.15, 0.22) * diff * rock;',
    '  litCol += vec3(0.70, 0.88, 1.00) * inkSharp * 0.92;',
    '  litCol += vec3(0.10, 0.35, 0.46) * contour * 0.22;',
    '',
    '  // Hermes\' lantern',
    '  vec2 dh = (uv - uHermes) * vec2(1.0, 1.4187);',
    '  float dist2 = dot(dh, dh);',
    '  float flick = 0.88 + 0.12 * sin(uTime * 7.0 + noise(uv * 20.0) * 6.0) + 0.04 * sin(uTime * 13.0);',
    '  float lamp = exp(-dist2 * 265.0) * flick * uHermesLit;',
    '  litCol += vec3(1.0, 0.62, 0.22) * lamp * (0.22 + inkSharp * 0.95);',
    '  dark += vec3(0.9, 0.5, 0.15) * lamp * 0.07;',
    '',
    '  vec3 col = mix(dark, litCol, lit);',
    '',
    '  // Frontier where the light ends',
    '  float rim = smoothstep(0.12, 0.28, m) * (1.0 - smoothstep(0.28, 0.52, m));',
    '  float shimmer = 0.6 + 0.4 * sin(uTime * 1.3 + fbm(uv * 30.0) * 9.0);',
    '  col += vec3(0.30, 0.55, 0.95) * rim * shimmer * 0.20 * uIntro;',
    '',
    '  float fog = clamp(exp(-max(vDepth - uDepth0, 0.0) * 1.7), 0.38, 1.0);',
    '  col = mix(vec3(0.004, 0.006, 0.014), col, fog);',
    '  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  var DUST_VERT = [
    'attribute float aSeed;',
    'uniform float uTime;',
    'uniform float uPx;',
    'uniform float uMotion;',
    'uniform vec3 uHermes;',
    'varying float vWarm;',
    'varying float vAlpha;',
    'void main() {',
    '  vec3 p = position;',
    '  float t = uTime * uMotion;',
    '  p.x = mod(p.x + 0.62 + t * (0.004 + 0.012 * aSeed), 1.24) - 0.62;',
    '  p.y += sin(t * 0.3 + aSeed * 40.0) * 0.02;',
    '  p.z += sin(t * 0.5 + aSeed * 17.0) * 0.012;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_Position = projectionMatrix * mv;',
    '  gl_PointSize = (1.5 + aSeed * 3.4) * uPx * (2.4 / -mv.z);',
    '  vec2 d = p.xy - uHermes.xy;',
    '  vWarm = exp(-dot(d, d) * 28.0);',
    '  vAlpha = 0.22 + 0.55 * aSeed;',
    '}'
  ].join('\n');

  var DUST_FRAG = [
    'precision highp float;',
    'varying float vWarm;',
    'varying float vAlpha;',
    'void main() {',
    '  float d = length(gl_PointCoord - 0.5);',
    '  float a = smoothstep(0.5, 0.05, d);',
    '  vec3 c = mix(vec3(0.35, 0.55, 1.0), vec3(1.0, 0.72, 0.30), vWarm);',
    '  gl_FragColor = vec4(c, a * vAlpha * (0.30 + 0.9 * vWarm));',
    '}'
  ].join('\n');

  var BEAM_VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  var BEAM_FRAG = [
    'precision highp float;',
    'uniform float uTime;',
    'varying vec2 vUv;',
    'void main() {',
    '  float fall = pow(1.0 - vUv.y, 1.7);',
    '  float flick = 0.85 + 0.15 * sin(uTime * 6.0) + 0.05 * sin(uTime * 11.0);',
    '  gl_FragColor = vec4(1.0, 0.66, 0.25, fall * 0.34 * flick);',
    '}'
  ].join('\n');

  /* ------------------------------------------------------------------ the scene */
  function mount(stage) {
    if (!stage || stage.__d3) return;
    if (!window.THREE) throw new Error('THREE missing');
    var THREE = window.THREE;
    stage.__d3 = true;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wrap = document.getElementById('desert-map-canvas-wrap');

    // DOM
    var canvas = document.createElement('canvas');
    var vignette = document.createElement('div'); vignette.className = 'desert3d-vignette';
    var markersEl = document.createElement('div'); markersEl.className = 'desert3d-markers';
    var hud = document.createElement('div'); hud.className = 'desert3d-hud-status';
    hud.innerHTML = '<span class="desert3d-hud-lamp"></span><span class="desert3d-hud-text"></span>';
    stage.appendChild(canvas); stage.appendChild(vignette); stage.appendChild(markersEl);
    stage.appendChild(hud);
    var hudText = hud.querySelector('.desert3d-hud-text');

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    var world = new THREE.Group();
    scene.add(world);

    var route = buildRoute();
    var state = readState();
    var targetD = route.cum[state.lvl];
    var savedShownLvl = parseInt(ls('order_desert3d_shown_lvl') || '-1', 10);
    var savedShownD = parseFloat(ls('order_desert3d_shown_d') || '-1');
    var shownD;
    if (savedShownLvl !== -1 && savedShownLvl < state.lvl) {
      shownD = route.cum[savedShownLvl];
    } else if (savedShownLvl === -1 && state.lvl > 0) {
      shownD = route.cum[Math.max(0, state.lvl - 1)];
    } else if (savedShownD >= 0 && savedShownD < targetD) {
      shownD = savedShownD;
    } else {
      shownD = targetD;
    }
    var hermesPos = pointAt(route, shownD);
    var maskDirty = true;
    var sig = '';
    var heightPixels = null, heightW = 0, heightH = 0;
    var markers = [];
    var camDist = 3;
    var pauseTimer = 0;
    var WALK_SPEED = 210; // ~250% slower journey pace (was 650 px/s)
    var TRAIL_STEP = 22;  // distance interval for cartographic dotted line

    function isHermesActive() {
      return !!state.done.cairn1 || state.lvl >= 1;
    }

    /* ---- dotted path trail (THREE.Points draped on the 3D relief) ---- */
    var trailGeo = null;
    var trailMat = null;
    var trailMesh = null;
    var trailCount = 0;

    function createDotTexture() {
      var dc = document.createElement('canvas');
      dc.width = dc.height = 64;
      var dctx = dc.getContext('2d');
      var dg = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      dg.addColorStop(0, 'rgba(255, 255, 240, 1.0)');     // luminous core
      dg.addColorStop(0.32, 'rgba(253, 230, 138, 0.95)'); // radiant amber gold
      dg.addColorStop(0.65, 'rgba(245, 158, 11, 0.85)');  // deep parchment amber
      dg.addColorStop(0.85, 'rgba(217, 119, 6, 0.35)');   // atmospheric halo
      dg.addColorStop(1, 'rgba(180, 83, 9, 0.0)');        // soft transparent fade
      dctx.fillStyle = dg;
      dctx.fillRect(0, 0, 64, 64);
      var tex = new THREE.CanvasTexture(dc);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    }

    function buildTrailGeometry() {
      if (trailMesh) {
        world.remove(trailMesh);
        if (trailGeo) trailGeo.dispose();
      }
      var total = route.total;
      var numDots = Math.floor(total / TRAIL_STEP) + 1;
      var positions = new Float32Array(numDots * 3);

      for (var i = 0; i < numDots; i++) {
        var d = Math.min(total, i * TRAIL_STEP);
        var pt = pointAt(route, d);
        var lp = localPos(pt.x, pt.y, 0.0035);
        positions[i * 3] = lp.x;
        positions[i * 3 + 1] = lp.y;
        positions[i * 3 + 2] = lp.z;
      }

      trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      trailGeo.setDrawRange(0, 0);

      if (!trailMat) {
        trailMat = new THREE.PointsMaterial({
          size: 0.012,
          map: createDotTexture(),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        });
      }

      trailMesh = new THREE.Points(trailGeo, trailMat);
      trailMesh.frustumCulled = false;
      world.add(trailMesh);
      trailCount = numDots;
      updateTrailDrawRange();
    }

    function updateTrailDrawRange() {
      if (!trailGeo) return;
      if (!isHermesActive() || shownD <= 0) {
        trailGeo.setDrawRange(0, 0);
        return;
      }
      var visible = Math.min(trailCount, Math.floor(shownD / TRAIL_STEP) + 1);
      trailGeo.setDrawRange(0, visible);
    }

    function onWaypointReached(w) {
      var wpCoord = WP[w];
      if (!wpCoord) return;
      if (window.sfx) {
        if (w === state.lvl && typeof window.sfx.playCelestialChime === 'function') {
          window.sfx.playCelestialChime();
        } else if (typeof window.sfx.playChimeHover === 'function') {
          window.sfx.playChimeHover();
        }
      }
      if (hudText) {
        var placeName = WHERE[w] || ('Waypoint ' + w);
        var leg = w === state.lvl ? currentCrossing() : null;
        if (leg) {
          hudText.textContent = leg.text;   // passing the last waypoint on the way to the next station, not arriving
        } else if (w === state.lvl) {
          hudText.textContent = (state.waiting ? 'Sheltering at ' : '✦ Arrived at ') + placeName;
        } else {
          hudText.textContent = '✦ Hermes reaches ' + placeName + '...';
        }
      }
      markers.forEach(function (m) {
        if (!m.st) return;
        var dist = Math.hypot(m.st.x - wpCoord.x, m.st.y - wpCoord.y);
        if (dist < 45 || m.st.lvl === w) {
          m.el.classList.remove('is-discovered-pulse');
          void m.el.offsetWidth;
          m.el.classList.add('is-discovered-pulse');
          setTimeout(function () {
            m.el.classList.remove('is-discovered-pulse');
          }, 2200);
        }
      });
      glow(wpCoord.x, wpCoord.y, 240, 1.0);
      maskDirty = true;
    }

    // Reveal mask (painted in map coordinates, sampled in the terrain shader)
    var maskCanvas = document.createElement('canvas');
    maskCanvas.width = MASK_W; maskCanvas.height = MASK_H;
    var mctx = maskCanvas.getContext('2d');
    var maskTex = new THREE.CanvasTexture(maskCanvas);
    maskTex.minFilter = THREE.LinearFilter; maskTex.magFilter = THREE.LinearFilter;
    maskTex.generateMipmaps = false;

    var uniforms = {
      uInk: { value: null }, uHeight: { value: null }, uMask: { value: maskTex },
      uTexel: { value: new THREE.Vector2(1 / 874, 1 / 1240) },
      uHermes: { value: new THREE.Vector2(0.1, 0.7) },
      uHermesLit: { value: 0.0 },
      uPlane: { value: new THREE.Vector2(PLANE_W, PLANE_H) },
      uTime: { value: 0 }, uIntro: { value: 0 }, uDisp: { value: DISP }, uRelief: { value: 9.0 }, uDepth0: { value: 2.5 }
    };

    function glow(x, y, r, a) {
      var sx = MASK_W / MAP_W, X = x * sx, Y = y * sx, R = r * sx;
      var g = mctx.createRadialGradient(X, Y, 0, X, Y, R);
      g.addColorStop(0, 'rgba(255,255,255,' + a + ')');
      g.addColorStop(0.55, 'rgba(255,255,255,' + (a * 0.8) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      mctx.fillStyle = g;
      mctx.fillRect(X - R, Y - R, R * 2, R * 2);
    }

    function paintMask() {
      mctx.globalCompositeOperation = 'source-over';
      mctx.fillStyle = '#000';
      mctx.fillRect(0, 0, MASK_W, MASK_H);
      mctx.globalCompositeOperation = 'lighter';
      if (isHermesActive()) {
        glow(WP[0].x, WP[0].y, 184, 1);
        for (var i = 0; i < route.pts.length; i += 2) {
          var p = route.pts[i];
          if (p.d > shownD) break;
          glow(p.x, p.y, 100, 0.5);
        }
        STATIONS.forEach(function (st) { if (!st.landmark && stationRevealed(st, state)) glow(st.x, st.y, 120, 0.9); });
        glow(hermesPos.x, hermesPos.y, 204, 1);
      }
      maskTex.needsUpdate = true;
    }

    // Terrain: extended mesh covering the entire canvas edge-to-edge
    var geometry = new THREE.PlaneGeometry(MESH_W, MESH_H, 220, 300);
    var terrainMat = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: TERRAIN_VERT, fragmentShader: TERRAIN_FRAG, side: THREE.DoubleSide });
    var terrain = new THREE.Mesh(geometry, terrainMat);
    world.add(terrain);

    // Dust drifting in front of the cliffs (depth cue; turns amber near Hermes)
    var DUST_N = 900;
    var dpos = new Float32Array(DUST_N * 3), dseed = new Float32Array(DUST_N);
    for (var i = 0; i < DUST_N; i++) {
      dpos[i * 3] = (Math.random() - 0.5) * MESH_W;
      dpos[i * 3 + 1] = (Math.random() - 0.5) * MESH_H;
      dpos[i * 3 + 2] = 0.01 + Math.random() * 0.2;
      dseed[i] = Math.random();
    }
    var dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    dgeo.setAttribute('aSeed', new THREE.BufferAttribute(dseed, 1));
    var dustUniforms = { uTime: { value: 0 }, uPx: { value: pixelRatio }, uMotion: { value: reduceMotion ? 0 : 1 }, uHermes: { value: new THREE.Vector3() } };
    var dust = new THREE.Points(dgeo, new THREE.ShaderMaterial({
      uniforms: dustUniforms, vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    dust.frustumCulled = false;
    world.add(dust);

    // Hermes: a beam of lantern light rising off the ground, plus a soft halo
    var hermesGroup = new THREE.Group();
    var beamGeo = new THREE.CylinderGeometry(0.003, 0.017, 0.26, 24, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 0, 0.13);
    var beamUniforms = { uTime: { value: 0 } };
    hermesGroup.add(new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
      uniforms: beamUniforms, vertexShader: BEAM_VERT, fragmentShader: BEAM_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    })));
    var hc = document.createElement('canvas'); hc.width = hc.height = 128;
    var hctx = hc.getContext('2d');
    var hg = hctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    hg.addColorStop(0, 'rgba(255,236,190,0.95)'); hg.addColorStop(0.3, 'rgba(251,160,50,0.45)'); hg.addColorStop(1, 'rgba(251,146,60,0)');
    hctx.fillStyle = hg; hctx.fillRect(0, 0, 128, 128);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(0.176, 0.176, 1);
    halo.position.z = 0.012;
    hermesGroup.add(halo);
    world.add(hermesGroup);

    /* ---- geometry helpers ---- */
    function heightAt(mx, my) {
      if (!heightPixels) return 0;
      var fx = clamp(mx / MAP_W, 0, 1) * (heightW - 1), fy = clamp(my / MAP_H, 0, 1) * (heightH - 1);
      var x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, heightW - 1), y1 = Math.min(y0 + 1, heightH - 1);
      var tx = fx - x0, ty = fy - y0;
      var px = function (x, y) { return heightPixels[(y * heightW + x) * 4] / 255; };
      return (px(x0, y0) * (1 - tx) + px(x1, y0) * tx) * (1 - ty) + (px(x0, y1) * (1 - tx) + px(x1, y1) * tx) * ty;
    }
    function localPos(mx, my, lift) {
      return new THREE.Vector3((mx / MAP_W - 0.5) * PLANE_W, (0.5 - my / MAP_H) * PLANE_H, heightAt(mx, my) * DISP + (lift || 0));
    }

    function applyHermes() {
      var lp = localPos(hermesPos.x, hermesPos.y, 0.004);
      hermesGroup.position.copy(lp);
      var active = isHermesActive();
      hermesGroup.visible = active;
      uniforms.uHermes.value.set(hermesPos.x / MAP_W, 1 - hermesPos.y / MAP_H);
      uniforms.uHermesLit.value = active ? 1.0 : 0.0;
      dustUniforms.uHermes.value.copy(lp);
    }

    function fitCamera() {
      var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      world.rotation.set(-TILT, 0, 0);
      world.updateMatrixWorld(true);
      var yOff = -0.06;
      var d = 2.52;
      camera.position.set(0, yOff, d);
      camera.lookAt(0, yOff, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      camDist = d;
      uniforms.uDepth0.value = d;
      dustUniforms.uPx.value = pixelRatio * Math.max(0.7, w / 1000);
    }

    /* ---- markers ---- */
    function activeStationKey() {
      var key = null;
      STATIONS.forEach(function (st) {
        if (st.landmark || !stationRevealed(st, state)) return;
        if (st.done && state.done[st.done]) return;
        if (st.key === 'cairn1' && state.dawn < 2) return;   // still a "?" until Hermes finds it
        key = st.key;
      });
      return key;
    }

    function toast(msg) { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); }
    var hub = function (name, fallback) { return typeof window[name] === 'function' ? window[name]() : fallback; };
    function monolithProgress() { return hub('getMonolithMarchProgress', 1); }
    function labyrinthProgress() { return hub('getLabyrinthMarchProgress', 1); }
    function cairnFourProgress() { return hub('getCairnFourMarchProgress', 1); }
    function solsticeProgress() { return hub('getSolsticeMarchProgress', 1); }
    function steleProgress() { return hub('getSteleMarchProgress', 1); }
    // The leg Hermes is walking right now, if any:
    // · after Station 13: at the gates of Tower II, then the 12-hour crossing to the Sun Monolith (segment 7, from the gates);
    // · after Station 14: resting under the Monolith, then the 6-hour walk down to the Sandstone Labyrinth (segment 8);
    // · after Station 15: hiding at the Western Cleft, then the 18-hour crossing to Cairn IV (segment 9);
    // · after Station 16: waiting for dusk at Cairn IV, then the 18-hour walk to the Arch of the Solstice (segment 10);
    // · after Station 17: resting under the Arch, then the 6-hour walk to the burning Tower II (segment 11).
    function currentCrossing() {
      if (state.done.clep && !state.done.monolith && monolithProgress() < 1 && route.gates !== null) {
        var etaM = hub('getMonolithMarchEta', '');
        return { progress: monolithProgress(), from: route.gates, to: route.cum[7],
                 text: etaM ? '🚶 CROSSING THE GREAT ERG TO THE SUN MONOLITH · ETA: ' + etaM : 'At the gates of Tower II' };
      }
      if (state.done.monolith && !state.done.labyrinth && labyrinthProgress() < 1) {
        var etaL = hub('getLabyrinthMarchEta', '');
        return { progress: labyrinthProgress(), from: route.cum[7], to: route.cum[8],
                 text: etaL ? '🚶 DOWN TO THE SANDSTONE LABYRINTH · ETA: ' + etaL : 'Resting under the Sun Monolith' };
      }
      if (state.done.labyrinth && !state.done.cairn4 && cairnFourProgress() < 1) {
        var eta4 = hub('getCairnFourMarchEta', '');
        return { progress: cairnFourProgress(), from: route.cum[8], to: route.cum[9],
                 text: eta4 ? '🚶 ACROSS THE HARDPAN TO CAIRN IV · ETA: ' + eta4 : 'Hiding at the Western Cleft until dark' };
      }
      if (state.done.cairn4 && !state.done.arch && solsticeProgress() < 1) {
        var eta5 = hub('getSolsticeMarchEta', '');
        return { progress: solsticeProgress(), from: route.cum[9], to: route.cum[10],
                 text: eta5 ? '🚶 EAST TO THE ARCH OF THE SOLSTICE · ETA: ' + eta5 : 'Waiting for dusk at Cairn IV' };
      }
      if (state.done.arch && !state.done.stele && steleProgress() < 1) {
        var eta6 = hub('getSteleMarchEta', '');
        return { progress: steleProgress(), from: route.cum[10], to: route.cum[11],
                 text: eta6 ? '🚶 TO TOWER II, TOWARD THE SMOKE · ETA: ' + eta6 : 'Resting under the Arch of the Solstice' };
      }
      return null;
    }

    function renderMarkers() {
      markersEl.textContent = '';
      markers = [];
      var active = activeStationKey();
      STATIONS.forEach(function (st) {
        var revealed = stationRevealed(st, state);
        if (st.landmark && (!revealed || !state.done.cairn1)) return;                 // scenery only appears once Hermes passes it after Cairn I
        var isDone = !!(st.done && state.done[st.done]);
        var el = document.createElement('div');
        el.className = 'd3-marker' + (revealed ? '' : ' is-unknown') + (st.landmark ? ' is-landmark' : '') + (isDone ? ' is-done' : '') + (st.key === active ? ' is-active' : '');
        var pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'd3-pin';
        if (!revealed) {
          pin.textContent = '?';
          pin.setAttribute('aria-label', 'Unknown place. Hermes has not reached it yet.');
          var tip = document.createElement('span');
          tip.className = 'd3-unknown-tip';
          tip.textContent = 'Unknown ground';
          tip.setAttribute('role', 'status');
          tip.setAttribute('aria-live', 'polite');
          pin.addEventListener('click', function () {
            if (st.key === 'cairn1' && state.lvl >= 2 && typeof window.selectDesertStation === 'function') { window.selectDesertStation(st.id); return; }
            pin.classList.remove('is-nudged'); void pin.offsetWidth; pin.classList.add('is-nudged');
            // Small tip next to this marker (not the page-level desert toast)
            markersEl.querySelectorAll('.d3-unknown-tip.is-visible').forEach(function (t) {
              t.classList.remove('is-visible');
              if (t._hide) clearTimeout(t._hide);
            });
            tip.classList.remove('is-visible');
            void tip.offsetWidth;
            tip.classList.add('is-visible');
            if (tip._hide) clearTimeout(tip._hide);
            tip._hide = setTimeout(function () { tip.classList.remove('is-visible'); }, 2200);
          });
          el.appendChild(pin);
          el.appendChild(tip);
          markersEl.appendChild(el);
          markers.push({ el: el, local: localPos(st.x, st.y, 0.014), hermes: false, st: st });
          return;
        } else {
          var label = document.createElement('span');
          label.className = 'd3-label';
          var text = st.label;
          if (st.landmark) text = st.label;
          else if (isDone) text = '✓ ' + (st.doneLabel || st.label);
          else text = '✦ ' + st.label + ' ➔';
          label.textContent = text;
          pin.textContent = isDone && !st.landmark ? '✓' : st.icon;
          pin.setAttribute('aria-label', st.label);
          pin.addEventListener('click', function () {
            if (window.sfx && window.sfx.playMechanicalClick) window.sfx.playMechanicalClick();
            var marchOver = typeof window.isChasmMarchOver === 'function' ? window.isChasmMarchOver() : true;
            if (st.key === 'chasm' && !state.done.chasm && !marchOver) {
              var start = parseInt(ls('order_chasm_march_start') || '0', 10);
              var remMs = Math.max(0, (26 * 3600 * 1000) - (start ? Date.now() - start : 0));
              var hrs = Math.floor(remMs / 3600000);
              var mins = Math.floor((remMs % 3600000) / 60000);
              toast('Hermes is trekking across the scree slopes to the North Portal. Reaching the Whispering Chasm in ' + hrs + ' hours and ' + mins + ' minutes.');
              return;
            }
            if (st.say) toast(st.say);
            else if (st.id && typeof window.selectDesertStation === 'function') window.selectDesertStation(st.id);
            else if (st.soon) toast(st.soon);
          });
          el.appendChild(pin);
          el.appendChild(label);
          markersEl.appendChild(el);
          markers.push({ el: el, local: localPos(st.x, st.y, 0.014), hermes: false, st: st });
        }
      });

      var h = document.createElement('div');
      h.className = 'd3-marker d3-hermes';
      h.innerHTML = '<span class="d3-orb"></span>';
      if (!isHermesActive()) h.style.display = 'none';
      markersEl.appendChild(h);
      markers.push({ el: h, local: new THREE.Vector3(), hermes: true });

      // Position pill: only once Hermes has a real place on the map (Field Wire complete+)
      var marchOver = typeof window.isChasmMarchOver === 'function' ? window.isChasmMarchOver() : true;
      if (!state.reached) {
        hud.style.display = 'none';
        hudText.textContent = '';
      } else if (state.lvl === 3 && !state.done.chasm && !marchOver) {
        hud.style.display = '';
        var start = parseInt(ls('order_chasm_march_start') || '0', 10);
        var remMs = Math.max(0, (26 * 3600 * 1000) - (start ? Date.now() - start : 0));
        var hrs = Math.floor(remMs / 3600000);
        var mins = Math.floor((remMs % 3600000) / 60000);
        hudText.textContent = '🚶 EN ROUTE TO NORTH PORTAL · ETA: ' + hrs + 'h ' + mins + 'm';
      } else if (currentCrossing()) {
        hud.style.display = '';
        hudText.textContent = currentCrossing().text;
      } else {
        hud.style.display = '';
        hudText.textContent = (state.waiting ? 'Sheltering at ' : '') + WHERE[state.lvl];
      }
    }

    var tmp = new THREE.Vector3();
    function updateMarkers() {
      var w = stage.clientWidth, h = stage.clientHeight;
      world.updateMatrixWorld(true);
      for (var i = 0; i < markers.length; i++) {
        var m = markers[i];
        if (m.hermes) m.local.copy(hermesGroup.position);
        tmp.copy(m.local).applyMatrix4(world.matrixWorld);
        var depth = camera.position.distanceTo(tmp);
        tmp.project(camera);
        var x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h;
        var s = clamp(camDist / depth, 0.72, 1.3);
        m.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + s.toFixed(3) + ')';
        m.el.style.zIndex = String(Math.round(1000 - depth * 100));
      }
    }

    /* ---- state sync ---- */
    function sync(force) {
      var next = readState();
      var isBypassed = next.isBypassed;
      var activeWp = isBypassed ? WP_BYPASS : WP_NORMAL;
      var activeSeg = isBypassed ? SEG_BYPASS : SEG_NORMAL;
      var activeWhere = isBypassed ? WHERE_BYPASS : WHERE_NORMAL;
      if (WP !== activeWp || SEG !== activeSeg) {
        WP = activeWp;
        SEG = activeSeg;
        WHERE = activeWhere;
        route = buildRoute();
      }

      var marchOver = typeof window.isChasmMarchOver === 'function' ? window.isChasmMarchOver() : true;
      var marchProgress = typeof window.getChasmMarchProgress === 'function' ? window.getChasmMarchProgress() : 1.0;

      var nextSig = [next.lvl, next.dawn >= 2 ? 1 : 0, next.waiting ? 1 : 0, isBypassed ? 1 : 0, marchOver ? 1 : 0, Math.floor(marchProgress * 100), Math.floor(monolithProgress() * 200), Math.floor(labyrinthProgress() * 200), Math.floor(cairnFourProgress() * 200), Math.floor(solsticeProgress() * 200), JSON.stringify(next.done)].join('|');
      if (!force && nextSig === sig) return;
      var advanced = next.lvl > state.lvl;
      state = next;
      sig = nextSig;

      if (state.lvl === 3 && !state.done.chasm && !marchOver) {
        var dStart = route.cum[2];
        var dEnd = route.cum[3];
        targetD = dStart + (dEnd - dStart) * marchProgress;
      } else if (currentCrossing()) {
        var leg = currentCrossing();
        targetD = leg.from + (leg.to - leg.from) * leg.progress;
      } else {
        targetD = route.cum[state.lvl];
      }

      if (targetD < shownD) {
        shownD = targetD;
        pauseTimer = 0;
        hermesPos = pointAt(route, shownD);
      } else if (advanced) {
        pauseTimer = 0;
      }
      applyHermes();
      updateTrailDrawRange();
      maskDirty = true;
      renderMarkers();
    }

    /* ---- interaction & loop ---- */
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(stage);
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { if (stage.clientWidth > 0) fitCamera(); }).observe(stage);
    } else {
      window.addEventListener('resize', fitCamera);
    }

    var t0 = performance.now(), last = t0, introStart = null;
    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || stage.clientWidth === 0 || !uniforms.uInk.value) return;
      var dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      var time = (now - t0) / 1000;

      if (pauseTimer > 0) {
        pauseTimer -= dt;
        if (pauseTimer <= 0) {
          pauseTimer = 0;
          if (shownD >= targetD) {
            try {
              localStorage.setItem('order_desert3d_shown_lvl', String(state.lvl));
              localStorage.setItem('order_desert3d_shown_d', String(targetD));
            } catch (e) {}
            if (hudText) {
              var marchOver = typeof window.isChasmMarchOver === 'function' ? window.isChasmMarchOver() : true;
              if (state.lvl === 3 && !state.done.chasm && !marchOver) {
                var start = parseInt(ls('order_chasm_march_start') || '0', 10);
                var remMs = Math.max(0, (26 * 3600 * 1000) - (start ? Date.now() - start : 0));
                var hrs = Math.floor(remMs / 3600000);
                var mins = Math.floor((remMs % 3600000) / 60000);
                hudText.textContent = '🚶 EN ROUTE TO NORTH PORTAL · ETA: ' + hrs + 'h ' + mins + 'm';
              } else {
                var leg = currentCrossing();   // stopped part-way along a walking leg: keep its countdown
                hudText.textContent = leg ? leg.text : (state.waiting ? 'Sheltering at ' : '') + WHERE[state.lvl];
              }
            }
          }
        }
      } else if (shownD < targetD) {
        var nextD = shownD + WALK_SPEED * dt;
        var hitWp = -1;
        for (var w = 1; w <= state.lvl; w++) {
          var wpDist = route.cum[w];
          if (wpDist > shownD + 0.5 && nextD >= wpDist - 0.5) {
            hitWp = w;
            break;
          }
        }
        if (hitWp !== -1) {
          shownD = route.cum[hitWp];
          pauseTimer = (hitWp === state.lvl) ? 1.8 : 1.35;
          onWaypointReached(hitWp);
        } else {
          shownD = Math.min(targetD, nextD);
          if (shownD >= targetD) {
            pauseTimer = 1.8;
            onWaypointReached(state.lvl);
          }
        }
        hermesPos = pointAt(route, shownD);
        applyHermes();
        updateTrailDrawRange();
        maskDirty = true;
      }
      if (maskDirty) { paintMask(); maskDirty = false; }

      if (introStart === null) introStart = now;
      uniforms.uIntro.value = reduceMotion ? 1 : clamp((now - introStart) / 2200, 0, 1);

      world.rotation.x = -TILT;
      world.rotation.y = 0;
      world.rotation.z = 0;

      uniforms.uTime.value = time;
      dustUniforms.uTime.value = time;
      beamUniforms.uTime.value = time;
      renderer.render(scene, camera);
      updateMarkers();
    }

    // Assets: use bundled base64 data URLs when available (required for file:// and offline WebGL)
    var pending = 3, failed = false;
    function fail(err) {
      if (failed) return;
      failed = true;
      if (window.console) console.warn('Desert3D: falling back to the flat map', err);
      if (wrap) wrap.classList.add('desert3d-fallback');
    }
    function ready() {
      if (--pending > 0 || failed) return;
      fitCamera();
      buildTrailGeometry();
      applyHermes();
      sync(true);
      stage.classList.add('is-ready');
      requestAnimationFrame(frame);
    }

    function createTextureFromImage(img, isHeight) {
      if (isHeight) {
        var t = new THREE.Texture(img);
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        t.needsUpdate = true;
        uniforms.uHeight.value = t;
        uniforms.uTexel.value.set(1 / img.width, 1 / img.height);
        heightW = img.width;
        heightH = img.height;
        var c = document.createElement('canvas');
        c.width = heightW;
        c.height = heightH;
        var cx = c.getContext('2d');
        cx.drawImage(img, 0, 0);
        try {
          heightPixels = cx.getImageData(0, 0, heightW, heightH).data;
        } catch (e) {
          if (window.console) console.warn('Could not read height pixels:', e);
        }
        ready();
      } else {
        var t = new THREE.Texture(img);
        if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
          t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        }
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.needsUpdate = true;
        uniforms.uInk.value = t;
        ready();
      }
    }

    if (window.DESERT_MAP_DATA && window.DESERT_MAP_DATA.ink && window.DESERT_MAP_DATA.height) {
      var imgInk = new Image();
      imgInk.onload = function () { createTextureFromImage(imgInk, false); };
      imgInk.onerror = function (e) { fail(e); };
      imgInk.src = window.DESERT_MAP_DATA.ink;

      var imgHeight = new Image();
      imgHeight.onload = function () { createTextureFromImage(imgHeight, true); };
      imgHeight.onerror = function (e) { fail(e); };
      imgHeight.src = window.DESERT_MAP_DATA.height;
    } else {
      var loader = new THREE.TextureLoader();
      loader.load(ASSETS + 'desert_relief_ink.webp', function (t) {
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
        uniforms.uInk.value = t; ready();
      }, undefined, fail);
      loader.load(ASSETS + 'desert_relief_height.png', function (t) {
        t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
        uniforms.uHeight.value = t; uniforms.uTexel.value.set(1 / t.image.width, 1 / t.image.height);
        heightW = t.image.width; heightH = t.image.height;
        var c = document.createElement('canvas'); c.width = heightW; c.height = heightH;
        var cx = c.getContext('2d'); cx.drawImage(t.image, 0, 0);
        try { heightPixels = cx.getImageData(0, 0, heightW, heightH).data; } catch (e) {}
        ready();
      }, undefined, fail);
    }
    // One extra tick so the first paint of the mask exists before the reveal animation starts
    requestAnimationFrame(ready);

    setInterval(function () { if (!document.hidden) sync(false); }, 1000);
    api.sync = function () { sync(false); };
    api.replay = function (fromLvl) {
      var startLvl = clamp(typeof fromLvl === 'number' ? fromLvl : 0, 0, state.lvl);
      shownD = route.cum[startLvl];
      pauseTimer = 0;
      hermesPos = pointAt(route, shownD);
      applyHermes();
      updateTrailDrawRange();
      maskDirty = true;
    };
    window.replayDesertWalk = function (fromLvl) {
      if (api.replay) api.replay(fromLvl);
    };
    api.debug = function () { return { state: state, shownD: shownD, targetD: targetD, camDist: camDist, hermes: hermesPos }; };
  }

  var api = {
    mount: function (stage) {
      try { mount(stage); }
      catch (err) {
        if (window.console) console.warn('Desert3D: could not start', err);
        var wrap = document.getElementById('desert-map-canvas-wrap');
        if (wrap) wrap.classList.add('desert3d-fallback');
      }
    },
    refresh: function () { if (api.sync) api.sync(); },
    replay: function (fromLvl) { if (api.replay) api.replay(fromLvl); }
  };
  window.Desert3D = api;
})();
