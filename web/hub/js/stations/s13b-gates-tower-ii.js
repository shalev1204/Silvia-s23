// =========================================================================
// 🏛️ STATION 13B · AT THE GATES OF TOWER II (SHEET 13A)
// Interactive 3D Narrative Encounter: The Sanctuary Servant, Hermes & Silvia
// Built with Three.js, EclipsePaint and EclipseScenery.
// =========================================================================
(function initGatesTowerII() {
  'use strict';

  var modal = document.getElementById('modal-gates-tower-ii');
  if (!modal) return;

  var canvas = document.getElementById('gates-canvas');
  var closeBtn = document.getElementById('btn-close-gates-tower-ii');
  var subtitle = document.getElementById('gates-stage-subtitle');
  var logEl = document.getElementById('gates-log');
  var choicesBox = document.getElementById('gates-choices');
  var decreeCard = document.getElementById('gates-decree-card');
  var btnDepart = document.getElementById('btn-gates-depart');
  var btnReplay = document.getElementById('btn-gates-replay');
  var hudTime = document.getElementById('gates-hud-time');
  var socketChips = Array.prototype.slice.call(document.querySelectorAll('.gate-socket-chip'));

  var T = window.THREE;
  var P = window.EclipsePaint;
  var SC = window.EclipseScenery;
  var sfx = window.sfx || {};

  var renderer = null;
  var scene = null;
  var camera = null;
  var animFrameId = null;
  var socketMeshes = [];
  var firstSealMesh = null, extraSeals = [], doorPivots = [], gloomMat = null, doorK = 0, doorTarget = 0;
  var isSceneInitialized = false;
  var bubbleEl = null;
  var speaking = null;
  var fireLevel = 0.38, fireFlash = 0, focusRefs = null;
  var servantRef = null, hermesRef = null, ringServant = null, ringHermes = null;

  function getLs(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function setLs(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var isCompleted = function () {
    return getLs('order_gates_scene_completed') === 'true';
  };

  // =========================================================================
  // 1. THREE.JS 3D SCENE: THE GATES OF TOWER II AT LAST LIGHT
  // =========================================================================
  var orbitCtl = null;
  var updaters = [];
  var focusTarget = { overview: [0, 3.9, 1.6, 19], servant: [0.7, 2.6, 1.1, 11], hermes: [-0.7, 2.3, 2.3, 11] };
  var sealFlash = 0;
  var sealLight = null;
  var hintEl = null;
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var clock = { last: 0, t: 0 };

  function rep(t, x, y) {
    var c = t.clone();
    c.wrapS = c.wrapT = T.RepeatWrapping;
    c.repeat.set(x, y);
    c.needsUpdate = true;
    return c;
  }

  // ---- hand-painted textures made only for this place ----
  function carvedTextures() {
    var U = SC.util, N = SC.noise;
    // generic: colour canvas + height canvas drawn by the same function (mode 'c' or 'h')
    function pair(w, h, base, draw) {
      var cc = U.pixelCanvas(w, h, function (u, v, x, y) { return base(u, v, x, y); });
      var hc = U.pixelCanvas(w, h, function () { return [128, 128, 128]; });
      draw(cc.getContext('2d'), w, h, 'c');
      draw(hc.getContext('2d'), w, h, 'h');
      var map = U.toTex(cc), bump = U.toTex(hc, true);
      return { map: map, bump: bump };
    }
    function pick(mode, col, hgt) { return mode === 'c' ? col : hgt; }
    var out = {};

    // calm sandstone grain for shafts: fine mottling and faint weathering streaks (tiles)
    out.stone = function () {
      var c = U.pixelCanvas(256, 256, function (u, v, x, y) {
        var m = N.fbm(u * 6, v * 3, 21, 4, 6, 3), st = N.fbm(u * 24, v * 2, 22, 3, 24, 2), g = (N.hash2(x, y, 9) - 0.5) * 14;
        var k = 0.78 + 0.3 * m + 0.12 * (st - 0.5);
        return [214 * k + g, 160 * k + g, 128 * k + g];
      });
      return U.toTex(c);
    };


    // weathered bronze door leaf: panels, studs, a half of the Order's sign at the meeting edge
    out.door = function (side) {
      var W = 512, H = 1024;
      return pair(W, H, function (u, v, x, y) {
        var m = N.fbm(u * 5, v * 9, 3 + side, 4, 0, 0), g = (N.hash2(x, y, 4) - 0.5) * 12;
        var k = 0.7 + 0.5 * m;
        return [74 * k + g, 56 * k + g, 36 * k + g];
      }, function (g, w, h, mode) {
        function rr(x, y, ww, hh, fill, stroke, lw) { g.fillStyle = fill; g.fillRect(x, y, ww, hh); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.strokeRect(x, y, ww, hh); } }
        // outer frame
        rr(10, 10, w - 20, h - 20, 'rgba(0,0,0,0)', pick(mode, '#20150c', '#2c2c2c'), 22);
        g.strokeStyle = pick(mode, 'rgba(214,170,84,0.75)', '#d2d2d2'); g.lineWidth = 4; g.strokeRect(30, 30, w - 60, h - 60);
        // six sunk panels
        for (var r = 0; r < 3; r++) for (var c = 0; c < 2; c++) {
          var px = 52 + c * ((w - 104) / 2) + 6, py = 56 + r * ((h - 112) / 3) + 8, pw = (w - 104) / 2 - 12, ph = (h - 112) / 3 - 16;
          rr(px, py, pw, ph, pick(mode, 'rgba(24,16,9,0.42)', '#555'), pick(mode, 'rgba(226,186,100,0.5)', '#b8b8b8'), 3);
        }
        // half of the Order's sign across the meeting edge
        var cx = side < 0 ? w : 0, cy = h * 0.5, R = w * 0.8;
        g.fillStyle = side < 0 ? pick(mode, '#c79b45', '#e6e6e6') : pick(mode, '#1d150e', '#9a9a9a');
        g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
        g.strokeStyle = pick(mode, 'rgba(250,224,150,0.9)', '#fff'); g.lineWidth = 6;
        g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 3;
        g.beginPath(); g.arc(cx, cy, R * 0.82, 0, Math.PI * 2); g.stroke();
        for (var i = 0; i < 28; i++) {
          var a = i / 28 * Math.PI * 2;
          g.strokeStyle = pick(mode, side < 0 ? 'rgba(90,56,16,0.6)' : 'rgba(230,190,110,0.5)', side < 0 ? '#999' : '#d0d0d0');
          g.lineWidth = 3;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5); g.lineTo(cx + Math.cos(a) * R * 0.78, cy + Math.sin(a) * R * 0.78); g.stroke();
        }
        // rivets along the frame and hinge straps on the outer edge
        for (var s = 0; s < 22; s++) {
          var yy = 44 + s * ((h - 88) / 21);
          [38, w - 38].forEach(function (xx) {
            g.fillStyle = pick(mode, '#e0c070', '#fff'); g.beginPath(); g.arc(xx, yy, 7, 0, 7); g.fill();
            if (mode === 'c') { g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.arc(xx + 2, yy + 2, 4, 0, 7); g.fill(); }
          });
        }
        [0.14, 0.5, 0.86].forEach(function (f) {
          var xx = side < 0 ? 0 : w - 120;
          rr(xx, h * f - 22, 120, 44, pick(mode, 'rgba(18,12,8,0.7)', '#d8d8d8'), pick(mode, 'rgba(210,170,80,0.5)', '#fff'), 3);
        });
        if (mode === 'c') {
          // green bloom where water has run down from the top
          var r2 = N.rng(7 + side);
          for (var k = 0; k < 46; k++) {
            var x0 = r2() * w, l = 120 + r2() * 520, gr = g.createLinearGradient(0, 0, 0, l);
            gr.addColorStop(0, 'rgba(70,150,120,0.34)'); gr.addColorStop(1, 'rgba(70,150,120,0)');
            g.fillStyle = gr; g.fillRect(x0, 0, 2 + r2() * 7, l);
          }
        }
      });
    };

    // carved frieze: stars, the Order's disc and rolling waves, in a repeating band
    out.frieze = function () {
      return pair(1024, 128, function (u, v, x, y) {
        var m = N.fbm(u * 8, v * 2, 5, 4, 0, 0), g = (N.hash2(x, y, 6) - 0.5) * 10, k = 0.82 + 0.3 * m;
        return [208 * k + g, 150 * k + g, 108 * k + g];
      }, function (g, w, h, mode) {
        g.strokeStyle = pick(mode, 'rgba(70,36,18,0.8)', '#3a3a3a'); g.fillStyle = g.strokeStyle; g.lineWidth = 5;
        g.beginPath(); g.moveTo(0, 14); g.lineTo(w, 14); g.moveTo(0, h - 14); g.lineTo(w, h - 14); g.stroke();
        for (var i = 0; i < 8; i++) {
          var cx = 64 + i * 128, cy = h / 2;
          if (i % 2 === 0) {
            g.beginPath();
            for (var p = 0; p < 16; p++) { var a = p / 16 * Math.PI * 2, rr2 = p % 2 ? 14 : 34; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); }
            g.closePath(); g.fill();
          } else {
            g.beginPath(); g.arc(cx, cy, 30, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.arc(cx, cy, 30, Math.PI / 2, Math.PI * 1.5); g.closePath(); g.fill();
          }
        }
        g.lineWidth = 4;
        for (var q = 0; q < 8; q++) { g.beginPath(); g.moveTo(q * 128 + 100, h / 2 - 8); g.bezierCurveTo(q * 128 + 112, h / 2 - 22, q * 128 + 120, h / 2 + 22, q * 128 + 156, h / 2 + 8); g.stroke(); }
      });
    };

    // rising sun carved into the wall above the doors
    out.sunburst = function () {
      return pair(512, 512, function (u, v, x, y) {
        var m = N.fbm(u * 6, v * 6, 11, 4, 0, 0), g = (N.hash2(x, y, 3) - 0.5) * 10, k = 0.8 + 0.34 * m;
        return [200 * k + g, 142 * k + g, 100 * k + g];
      }, function (g, w, h, mode) {
        g.strokeStyle = pick(mode, 'rgba(70,34,16,0.85)', '#383838'); g.fillStyle = g.strokeStyle;
        var cx = 256, cy = 256;
        for (var r = 0; r < 3; r++) { g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 246 - r * 18, 0, Math.PI * 2); g.stroke(); }
        g.beginPath(); g.arc(cx, cy, 70, 0, Math.PI * 2); g.fill();
        g.lineWidth = 4;
        for (var i = 0; i < 36; i++) {
          var a = i / 36 * Math.PI * 2, r0 = 84, r1 = i % 2 ? 150 : 205;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
          if (!(i % 2)) { g.beginPath(); g.moveTo(cx + Math.cos(a - 0.04) * 150, cy + Math.sin(a - 0.04) * 150); g.lineTo(cx + Math.cos(a) * 205, cy + Math.sin(a) * 205); g.lineTo(cx + Math.cos(a + 0.04) * 150, cy + Math.sin(a + 0.04) * 150); g.fill(); }
        }
      });
    };

    // the golden seal of Cairn I (sun over waves) and the dark empty socket
    out.seal = function () {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var g = c.getContext('2d');
      var gr = g.createRadialGradient(100, 96, 8, 128, 128, 126);
      gr.addColorStop(0, '#fff0b0'); gr.addColorStop(0.6, '#e2b24e'); gr.addColorStop(1, '#8a5e18');
      g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill();
      g.strokeStyle = 'rgba(90,56,10,0.85)'; g.lineWidth = 9; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke();
      g.fillStyle = 'rgba(90,56,10,0.9)'; g.beginPath(); g.arc(128, 104, 24, 0, 7); g.fill();
      g.lineWidth = 6;
      for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 34, 104 + Math.sin(a) * 34); g.lineTo(128 + Math.cos(a) * 52, 104 + Math.sin(a) * 52); g.stroke(); }
      for (var w = 0; w < 3; w++) { g.beginPath(); g.moveTo(52, 176 + w * 16); g.bezierCurveTo(88, 160 + w * 16, 108, 194 + w * 16, 128, 176 + w * 16); g.bezierCurveTo(148, 160 + w * 16, 168, 194 + w * 16, 204, 176 + w * 16); g.stroke(); }
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8;
      return t;
    };
    return out;
  }

  function fluteColumn(paint, mat, height) {
    var g = new T.Group();
    var geo = new T.CylinderGeometry(0.4, 0.48, height, 40, 12);
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), t = y / height + 0.5;
      var entasis = 1 + 0.045 * Math.sin(t * Math.PI), flute = 1 + Math.cos(a * 20) * 0.045;
      p.setX(i, x * entasis * flute); p.setZ(i, z * entasis * flute);
    }
    geo.computeVertexNormals();
    var shaft = new T.Mesh(geo, mat);
    shaft.position.y = height / 2 + 0.34;
    shaft.castShadow = shaft.receiveShadow = true;
    g.add(shaft);
    function add(geo2, y) { var m = new T.Mesh(geo2, mat); m.position.y = y; m.castShadow = m.receiveShadow = true; g.add(m); return m; }
    add(new T.BoxGeometry(1.3, 0.2, 1.3), 0.1);
    add(new T.CylinderGeometry(0.66, 0.74, 0.16, 32), 0.28);
    add(new T.TorusGeometry(0.56, 0.06, 10, 36), 0.4).rotation.x = Math.PI / 2;
    var top = height + 0.34;
    add(new T.CylinderGeometry(0.43, 0.4, 0.14, 32), top + 0.05);
    add(new T.TorusGeometry(0.43, 0.04, 8, 32), top + 0.12).rotation.x = Math.PI / 2;
    // a crown of papyrus buds
    for (var k = 0; k < 14; k++) {
      var a2 = k / 14 * Math.PI * 2, bud = new T.Mesh(new T.SphereGeometry(0.12, 12, 10), mat);
      bud.scale.set(0.8, 2.1, 0.8);
      bud.position.set(Math.cos(a2) * 0.4, top + 0.38, Math.sin(a2) * 0.4);
      bud.rotation.set(Math.sin(a2) * 0.28, 0, -Math.cos(a2) * 0.28);
      bud.castShadow = true; g.add(bud);
    }
    add(new T.CylinderGeometry(0.5, 0.46, 0.1, 32), top + 0.62);
    add(new T.BoxGeometry(1.2, 0.2, 1.2), top + 0.78);
    return g;
  }

  function setup3D() {
    if (!canvas || !T || !SC || !P) return;
    if (renderer) return;

    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL not supported for Gates Tower II:', e);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    scene = new T.Scene();
    var HORIZON = 0xd8946a;
    scene.fog = new T.Fog(SC.preTone(HORIZON, 1.06), 30, 105);
    var aspect = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    camera = new T.PerspectiveCamera(46, aspect, 0.1, 320);

    var paint = SC.paint();
    var skyObj = SC.sky(scene, { zenith: 0x2f3f78, mid: 0xc8788a, horizon: HORIZON, glow: 0xff9650, sun: [-0.5, 0.14, -0.85] });

    // ---- the ground: red sand dunes, a flagstone plaza before the stairs ----
    var ground = SC.terrain(scene, paint, { seed: 44, flatRadius: 17, size: 190, segments: 130 });
    ground.mesh.material.color.setHex(0xe49c7e);
    SC.ridges(scene, {
      horizon: HORIZON,
      rings: [
        { R: 86, h: 9, seed: 5, col: SC.util.hex(0x9a5448), haze: 0.5 },
        { R: 104, h: 15, seed: 12, col: SC.util.hex(0x7c5272), haze: 0.7 }
      ]
    });
    var fd = SC.tex.flagDisc(5);
    var plaza = new T.Mesh(new T.CircleGeometry(9.2, 64),
      paint({ map: fd.map, bumpMap: fd.bump, bumpScale: 1.8, alphaTest: 0.5, color: 0xe2a488, polygonOffset: true, polygonOffsetFactor: -2 }, 0xffd8b0, 0.16));
    plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.02, 6.4); plaza.receiveShadow = true;
    scene.add(plaza);

    // ---- the living rock behind, and big crags that frame the view ----
    var cliff = SC.cliffWall(paint, { width: 110, height: 24, z: -1.55, flat: 6.6, seed: 17, tint: 0xb8786e, minTop: 12, dip: { x: 22, h: 11.5 } });
    scene.add(cliff);
    [[-15, 0, 4.5, 4.6, 3], [16, 0, 5.5, 5.2, 8], [-26, 0, -4, 6.4, 5], [28, 0, -3, 6.8, 6]].forEach(function (c) {
      var r = SC.props.rocks(paint, { seed: c[4], scale: c[3], count: 5 });
      r.position.set(c[0], 0, c[2]);
      r.rotation.y = c[4];
      r.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); o.material.color.setHex(0xa86a5c); } });
      scene.add(r);
    });

    // ---- the front of Tower II ----
    var TX = carvedTextures();
    var ms = SC.tex.masonry(14, 5, 6);
    var wallMat = function (rx, ry) { return paint({ map: rep(ms.map, rx, ry), bumpMap: rep(ms.bump, rx, ry), bumpScale: 1.7, color: 0xe6a688 }, 0xffd0a0, 0.2); };
    var stoneMat = paint({ map: rep(ms.map, 2, 1), bumpMap: rep(ms.bump, 2, 1), bumpScale: 1.4, color: 0xeab092 }, 0xffd8b0, 0.22);
    var stoneDark = paint({ map: rep(ms.map, 2, 1), bumpMap: rep(ms.bump, 2, 1), bumpScale: 1.4, color: 0xcf8e72 }, 0xffd0a0, 0.2);
    var solid = function (w, h, d, mat, x, y, z) { var m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };

    var PLAT = 1.2, DOOR_TOP = 4.7, WALL_H = 8.0, WALL_Z0 = 0.15, WALL_D = 1.65;
    var wz = WALL_Z0 - WALL_D / 2;
    solid(3.95, WALL_H, WALL_D, wallMat(3, 6), -3.825, WALL_H / 2, wz);
    solid(3.95, WALL_H, WALL_D, wallMat(3, 6), 3.825, WALL_H / 2, wz);
    solid(3.7, WALL_H - DOOR_TOP, WALL_D, wallMat(3, 3), 0, (WALL_H + DOOR_TOP) / 2, wz);
    solid(3.7, PLAT, WALL_D, wallMat(3, 1), 0, PLAT / 2, wz);
    // the dark inside, just behind the doors
    gloomMat = new T.MeshBasicMaterial({ color: 0x080403 });
    var gloom = new T.Mesh(new T.PlaneGeometry(3.7, DOOR_TOP - PLAT), gloomMat);
    gloom.position.set(0, (DOOR_TOP + PLAT) / 2, -0.8); scene.add(gloom);
    // string course, pilasters at the corners, cornice with dentils, a crown of merlons
    solid(11.8, 0.18, 0.26, stoneMat, 0, DOOR_TOP, 0.28);
    [-5.55, 5.55].forEach(function (x) { solid(0.55, WALL_H, 0.5, stoneDark, x, WALL_H / 2, 0.38); });
    solid(12.8, 0.36, 1.1, stoneMat, 0, WALL_H + 0.05, 0.42);
    var dentil = new T.InstancedMesh(new T.BoxGeometry(0.15, 0.2, 0.2), stoneDark, 72), dm = new T.Object3D();
    for (var d = 0; d < 72; d++) { dm.position.set(-6.0 + d * (12.0 / 71), WALL_H - 0.18, 0.92); dm.updateMatrix(); dentil.setMatrixAt(d, dm.matrix); }
    dentil.castShadow = true; scene.add(dentil);
    for (var mm = 0; mm < 11; mm++) solid(0.7, 0.62, 0.55, stoneMat, -5.5 + mm * 1.1, WALL_H + 0.54, 0.1);

    // the lintel across the doorway, carved with a frieze
    solid(7.4, 0.55, 1.0, stoneMat, 0, DOOR_TOP + 0.55 / 2 + 0.0, 0.45);
    var fr = TX.frieze();
    var friezeMat = paint({ map: fr.map, bumpMap: fr.bump, bumpScale: 2.2, color: 0xf0b898 }, 0xffd8b0, 0.2);
    fr.map.wrapS = T.RepeatWrapping; fr.map.repeat.set(1.8, 1); fr.bump.wrapS = T.RepeatWrapping; fr.bump.repeat.set(1.8, 1);
    var lf = new T.Mesh(new T.PlaneGeometry(7.0, 0.42), friezeMat);
    lf.position.set(0, DOOR_TOP + 0.28, 0.955); scene.add(lf);
    var sideFr = TX.frieze();
    [-1, 1].forEach(function (sd) {
      var m = new T.Mesh(new T.PlaneGeometry(2.8, 0.5), paint({ map: sideFr.map, bumpMap: sideFr.bump, bumpScale: 2.2, color: 0xf0b898 }, 0xffd8b0, 0.2));
      m.position.set(sd * 4.2, 6.55, WALL_Z0 + 0.012); scene.add(m);
    });

    // sunburst in the lunette and the voussoir ring with five sockets
    var sb = TX.sunburst();
    var lun = new T.Mesh(new T.CircleGeometry(1.92, 56, 0, Math.PI), paint({ map: sb.map, bumpMap: sb.bump, bumpScale: 2.4, color: 0xf0b898, side: T.DoubleSide }, 0xffd8b0, 0.2));
    var ARCH_Y = DOOR_TOP + 0.55;
    lun.position.set(0, ARCH_Y, WALL_Z0 + 0.02); scene.add(lun);
    var NV = 15, ringMid = 2.225;
    for (var vi = 0; vi < NV; vi++) {
      var ang = (vi + 0.5) * Math.PI / NV;
      var blk = new T.Mesh(new T.BoxGeometry(0.66, ringMid * Math.PI / NV * 0.97, 0.55), vi % 2 ? stoneMat : stoneDark);
      blk.position.set(Math.cos(ang) * ringMid, ARCH_Y + Math.sin(ang) * ringMid, 0.44);
      blk.rotation.z = ang; blk.castShadow = blk.receiveShadow = true; scene.add(blk);
    }
    var socketIdx = [12, 10, 7, 4, 2];
    var emptyMat = paint({ color: 0x1a0f08, emissive: 0x3a1c08, emissiveIntensity: 0.5 });
    socketMeshes = [];
    socketIdx.forEach(function (vi2) {
      var a3 = (vi2 + 0.5) * Math.PI / NV, sx = Math.cos(a3) * ringMid, sy = ARCH_Y + Math.sin(a3) * ringMid, sz = 0.74;
      var rimT = new T.Mesh(new T.TorusGeometry(0.22, 0.045, 12, 28), paint({ color: 0xc9a24e, metalness: 0.5, roughness: 0.4 }, 0xfff0b0, 0.5));
      rimT.position.set(sx, sy, sz); rimT.castShadow = true; scene.add(rimT);
      var inner = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.05, 28), emptyMat);
      inner.rotation.x = Math.PI / 2; inner.position.set(sx, sy, sz - 0.02); scene.add(inner);
      socketMeshes.push({ rim: rimT, inner: inner, x: sx, y: sy, z: sz });
    });
    var sealMat = new T.MeshStandardMaterial({ map: TX.seal(), emissive: 0xb07a1c, emissiveIntensity: 0.55, metalness: 0.7, roughness: 0.35 });
    firstSealMesh = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.07, 36), sealMat);
    firstSealMesh.rotation.x = Math.PI / 2;
    firstSealMesh.position.set(socketMeshes[0].x, socketMeshes[0].y, socketMeshes[0].z + 0.01);
    firstSealMesh.castShadow = true;
    firstSealMesh.visible = isCompleted() || getLs('order_monolith_gate_seal1') === 'true';
    scene.add(firstSealMesh);
    extraSeals = [];
    for (var xs = 1; xs < 5; xs++) {
      var xm = new T.Mesh(firstSealMesh.geometry, sealMat);
      xm.rotation.x = Math.PI / 2;
      xm.position.set(socketMeshes[xs].x, socketMeshes[xs].y, socketMeshes[xs].z + 0.01);
      xm.castShadow = true; xm.visible = false; scene.add(xm); extraSeals.push(xm);
    }
    sealLight = new T.PointLight(0xffc060, 0, 5, 1.6);
    sealLight.position.set(socketMeshes[0].x, socketMeshes[0].y, socketMeshes[0].z + 0.6);
    scene.add(sealLight);

    // columns, each with a base, entasis, flutes and a crown of buds
    var colTex = TX.stone();
    var colMat = paint({ map: rep(colTex, 2, 2), color: 0xf4c4a8 }, 0xffd8b0, 0.22);
    var colH = DOOR_TOP - PLAT - 0.34 - 0.62;
    [-2.9, 2.9].forEach(function (x) {
      var col = fluteColumn(paint, colMat, colH);
      col.position.set(x, PLAT, 0.45);
      scene.add(col);
    });

    // the bronze doors, a half of the Order's sign on each leaf
    var leafW = 1.85, leafH = DOOR_TOP - PLAT - 0.02;
    [-1, 1].forEach(function (sd) {
      var tx = TX.door(sd);
      var m = new T.Mesh(new T.BoxGeometry(leafW, leafH, 0.2), [
        paint({ color: 0x2a1c10 }), paint({ color: 0x2a1c10 }), paint({ color: 0x2a1c10 }), paint({ color: 0x2a1c10 }),
        new T.MeshStandardMaterial({ map: tx.map, bumpMap: tx.bump, bumpScale: 2.6, metalness: 0.62, roughness: 0.5, color: 0xffffff }),
        paint({ color: 0x2a1c10 })
      ]);
      // each leaf hangs from a hinge at its outer edge, so the return can swing it open
      var hinge = new T.Group();
      hinge.position.set(sd * (leafW + 0.01), 0, 0);
      m.position.set(-sd * leafW / 2, PLAT + leafH / 2 + 0.01, 0.0);
      m.castShadow = m.receiveShadow = true; hinge.add(m); scene.add(hinge);
      doorPivots.push({ g: hinge, sd: sd });
    });
    solid(3.9, 0.12, 1.5, stoneDark, 0, PLAT + 0.0, 0.5);

    // ---- the stairs: four wide treads with worn edges, and cheek walls either side ----
    var treads = [];
    for (var s = 0; s < 4; s++) {
      var top = PLAT - 0.24 * (s + 1), zc = 1.6 + 0.62 * s + 0.31, w = 8.6 + s * 0.5;
      solid(w, top, 0.64, stoneMat, 0, top / 2, zc);
      treads.push(top);
    }
    solid(9.0, PLAT, 1.6 - WALL_Z0 + 0.0, stoneDark, 0, PLAT / 2 - 0.0, (1.6 + WALL_Z0) / 2 + 0.0).scale.y = 0.999;
    [-1, 1].forEach(function (sd) {
      for (var s2 = 0; s2 < 5; s2++) {
        var hh = PLAT - 0.24 * s2 + 0.35, zz = 1.6 + 0.62 * s2 - 0.31 + 0.31;
        solid(0.7, hh, 0.66, stoneDark, sd * 4.85 + sd * 0.12 * s2, hh / 2, Math.max(zz, 0.8) + (s2 === 0 ? 0 : 0));
      }
    });

    // ---- fires and banners ----
    var braziers = [];
    [[-3.9, PLAT, 1.1, 1.4], [3.9, PLAT, 1.1, 1.4], [-5.6, 0.4, 4.9, 1.7], [5.6, 0.4, 4.9, 1.7]].forEach(function (b, i) {
      var br = SC.props.brazier(paint, { height: b[3], intensity: 1.5, range: 12 });
      br.position.set(b[0], b[1], b[2]); scene.add(br); braziers.push({ g: br, ph: i * 1.9 });
    });
    focusRefs = { brazier: braziers[0].g };
    var banners = [];
    [-3.3, 3.3].forEach(function (x, i) {
      var bn = SC.props.banner(paint, { width: 0.95, height: 2.35 });
      bn.position.set(x, WALL_H - 0.28, WALL_Z0 + 0.55); scene.add(bn); banners.push({ g: bn, ph: i * 1.3 });
    });

    // ---- two stone guardians in niches ----
    [-4.7, 4.7].forEach(function (x) {
      var niche = new T.Mesh(new T.PlaneGeometry(1.35, 3.4), new T.MeshBasicMaterial({ color: 0x27120a }));
      niche.position.set(x, PLAT + 1.9, WALL_Z0 + 0.012); scene.add(niche);
      solid(0.16, 3.5, 0.3, stoneMat, x - 0.75, PLAT + 1.9, WALL_Z0 + 0.1);
      solid(0.16, 3.5, 0.3, stoneMat, x + 0.75, PLAT + 1.9, WALL_Z0 + 0.1);
      solid(1.66, 0.22, 0.32, stoneMat, x, PLAT + 3.68, WALL_Z0 + 0.1);
      solid(1.2, 0.5, 0.8, stoneDark, x, PLAT + 0.25, WALL_Z0 + 0.45);
      var st = SC.chars.elder(paint, { stone: true });
      st.position.set(x, PLAT + 0.5, WALL_Z0 + 0.5); st.rotation.y = Math.PI + (x < 0 ? -0.18 : 0.18);
      scene.add(st);
    });

    // ---- the Servant on the top landing, Hermes on the lowest step ----
    var servant = SC.chars.elder(paint, { robe: 0x5c2c1a, trim: 0xd4a345, mantle: 0x2c180e });
    servant.position.set(0.95, PLAT, 0.95);
    servant.rotation.y = 2.44;
    servant.scale.setScalar(1.12);
    scene.add(servant);
    var glow = SC.tex.soft();
    var H = P.buildHermes(T, glow);
    var hermes = H.hermes;
    hermes.position.set(-1.35, treads[3], 3.6);
    hermes.rotation.y = -0.38;
    hermes.scale.setScalar(1.15);
    hermes.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(hermes);
    servantRef = servant; hermesRef = hermes;
    var ringMat = function (c) { return new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false }); };
    ringServant = new T.Mesh(new T.RingGeometry(0.62, 0.78, 48), ringMat(0xffc060));
    ringServant.rotation.x = -Math.PI / 2; ringServant.position.set(servant.position.x, PLAT + 0.03, servant.position.z);
    ringHermes = new T.Mesh(new T.RingGeometry(0.62, 0.78, 48), ringMat(0x7fb4ff));
    ringHermes.rotation.x = -Math.PI / 2; ringHermes.position.set(hermes.position.x, treads[3] + 0.03, hermes.position.z);
    scene.add(ringServant, ringHermes);

    // ---- the way here: camel prints coming up to the stairs, scattered stones, scrub ----
    SC.props.tracks(scene, { bearing: 180, x: 1.9, z: 4.4, count: 12, seed: 3 });
    SC.scatter(scene, paint, ground.heightAt, { cx: 0, cz: 5, clear: 9.5, pebbles: 330, tufts: 420, scrub: 30, seed: 12 });
    [[-8.4, 6.8, 1.2], [8.9, 7.4, 2.3]].forEach(function (f) {
      var rk = SC.props.rocks(paint, { seed: 11, scale: 0.7, count: 3 });
      rk.position.set(f[0], 0, f[1]); rk.rotation.y = f[2]; scene.add(rk);
    });
    var fallen = fluteColumn(paint, colMat, 2.2);
    fallen.rotation.set(0, 0.6, Math.PI / 2 - 0.05); fallen.position.set(7.4, 0.58, 5.8); scene.add(fallen);
    var drift = new T.Mesh(new T.SphereGeometry(1, 20, 12), paint({ map: SC.tex.sand(11).map, color: 0xe49c7e }));
    drift.scale.set(2.6, 0.3, 1.3); drift.position.set(-7.4, -0.08, 8.2); drift.receiveShadow = true; scene.add(drift);

    // ---- light: last sun low on the right, cool sky, an ember glow from the fires ----
    SC.lights(scene, { key: 0xffa662, keyI: 1.7, kx: 20, ky: 8.5, kz: 7, tx: 0, tz: 2.2, fill: 0x8a94d8, fillI: 0.32, back: 0xff7c46, backI: 0.5, sky: 0xd4a2a6, ground: 0x7a4430, hemi: 0.34, amb: 0.08, shadowExtent: 13, shadowSize: 2048 });
    var beams = SC.beams(scene, { count: 4, x0: -9, dx: 4.4, y: 6, z: 3.5, tilt: -0.6, opacity: 0.12 });
    var air = SC.air(scene, { cz: 3, dust: 110, sand: 120, birds: 3 });

    // ---- the camera: drag to look round, wheel or pinch to zoom ----
    var narrow = Math.max(1, 1.2 / aspect);
    orbitCtl = SC.orbit(canvas, camera, { dist: Math.min(26, 16.5 * narrow), minDist: 3.2, maxDist: 30, pitch: 0.2, minPitch: -0.03, maxPitch: 1.05, yawLimit: 1.5, x: 0, y: 3.9, z: 1.6, groundY: 0.5 });
    var f0 = focusTarget.overview; orbitCtl.setTarget(f0[0], f0[1], f0[2]);
    orbitCtl.state.tDist = orbitCtl.state.dist = Math.min(30, f0[3] * narrow);

    updaters = [
      function (t, dt) {
        skyObj.uniforms.uTime.value = t;
        servant.userData.update(t);
        // who is talking: a glowing ring at their feet, a little life in their body
        var spS = speaking === 'servant', spH = speaking === 'hermes' || speaking === 'silvia';
        var pulse = 0.55 + 0.35 * Math.sin(t * 5);
        ringServant.material.opacity += ((spS ? pulse : 0) - ringServant.material.opacity) * Math.min(1, dt * 8);
        ringHermes.material.opacity += ((spH ? pulse : 0) - ringHermes.material.opacity) * Math.min(1, dt * 8);
        ringHermes.material.color.setHex(speaking === 'silvia' ? 0x9fe8ff : 0x7fb4ff);
        if (spS) { servant.userData.head.rotation.x += 0.05 * Math.abs(Math.sin(t * 9)); servant.userData.sight.rotation.z += 0.01; }
        hermes.position.y = treads[3] + (spH ? 0.02 * Math.abs(Math.sin(t * 8)) : 0);
        H.flame.scale.set(1 + 0.08 * Math.sin(t * 9), 1.35 + 0.12 * Math.sin(t * 13 + 1), 1);
        H.lamp.rotation.z = Math.sin(t * 1.3) * 0.04;
        H.cloak.scale.y = 1 + Math.sin(t * 1.1) * 0.004;
        fireFlash *= Math.pow(0.4, dt);
        fireLevel += ((ds.flags && (ds.flags.gaveOil || ds.flags.lostOil) ? 1 : 0.38) - fireLevel) * Math.min(1, dt * 1.5);
        braziers.forEach(function (b, bi) { b.g.userData.update(t, b.ph, bi === 0 ? fireLevel + fireFlash : 1); });
        banners.forEach(function (b) { b.g.userData.update(t, b.ph); });
        beams.update(t);
        air.update(t, dt, reducedMotion);
        if (sealFlash > 0.001) {
          sealFlash *= Math.pow(0.35, dt);
          sealLight.intensity = sealFlash * 5 + (firstSealMesh && firstSealMesh.visible ? 0.7 : 0);
          sealMat.emissiveIntensity = 0.55 + sealFlash * 2.2;
        } else {
          sealLight.intensity = firstSealMesh && firstSealMesh.visible ? 0.7 + 0.15 * Math.sin(t * 2) : 0;
          sealMat.emissiveIntensity = 0.55;
        }
        // the bronze doors swing in on their hinges (the return), and the dark behind them turns to morning
        if (Math.abs(doorTarget - doorK) > 0.0005) {
          doorK += (doorTarget - doorK) * Math.min(1, dt * 1.5);
          if (reducedMotion) doorK = doorTarget;
          doorPivots.forEach(function (d) { d.g.rotation.y = -d.sd * doorK * 1.5; });
          gloomMat.color.setRGB(0.03 + 0.97 * doorK, 0.016 + 0.76 * doorK, 0.012 + 0.5 * doorK);
        }
      }
    ];

    if (!bubbleEl) {
      bubbleEl = document.createElement('div');
      bubbleEl.className = 'gates-bubble';
      canvas.parentNode.appendChild(bubbleEl);
    }
    if (!hintEl) {
      hintEl = document.createElement('div');
      hintEl.className = 'gates-orbit-hint';
      hintEl.textContent = 'Drag to look around · scroll or pinch to zoom · double-click to reset';
      canvas.parentNode.appendChild(hintEl);
      setTimeout(function () { if (hintEl) hintEl.classList.add('is-faded'); }, 7000);
    }

    isSceneInitialized = true;
    startLoop();
  }

  function startLoop() {
    if (animFrameId || !renderer) return;
    clock.last = performance.now();
    renderLoop();
  }

  function stopLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }

  function renderLoop() {
    if (!renderer || !scene || !camera) return;
    animFrameId = requestAnimationFrame(renderLoop);
    var now = performance.now(), dt = Math.min(0.05, (now - clock.last) / 1000);
    clock.last = now;
    clock.t += dt;
    for (var i = 0; i < updaters.length; i++) updaters[i](clock.t, dt);
    if (orbitCtl) orbitCtl.update(dt, !reducedMotion);
    renderer.render(scene, camera);
    placeBubble();
  }

  var tmpV = null;
  // keep the speech bubble over whoever is talking (Silvia's radio bubble floats beside Hermes)
  function placeBubble() {
    if (!bubbleEl || !ds.speaker || !servantRef || !hermesRef) return;
    if (!tmpV) tmpV = new T.Vector3();
    var who = ds.speaker;
    if (who === 'servant') servantRef.localToWorld(tmpV.set(0, 2.5, 0));
    else if (who === 'hermes') hermesRef.localToWorld(tmpV.set(0, 2.35, 0));
    else hermesRef.localToWorld(tmpV.set(-0.8, 2.9, 0));
    tmpV.project(camera);
    var W = canvas.clientWidth, H = canvas.clientHeight;
    if (tmpV.z > 1) { bubbleEl.style.opacity = '0'; return; }
    var bw = bubbleEl.offsetWidth || 220, bh = bubbleEl.offsetHeight || 60;
    var x = (tmpV.x * 0.5 + 0.5) * W, y = (-tmpV.y * 0.5 + 0.5) * H;
    x = Math.max(bw / 2 + 8, Math.min(W - bw / 2 - 8, x));
    y = Math.max(bh + 54, Math.min(H - 70, y));
    bubbleEl.style.opacity = '';
    bubbleEl.style.left = x + 'px';
    bubbleEl.style.top = y + 'px';
  }

  function handleResize() {
    if (!renderer || !camera || !canvas) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  // look closely at one spot (the player can still drag and zoom afterwards)
  function focusAt(x, y, z, dist) {
    if (!orbitCtl) return;
    orbitCtl.setTarget(x, y, z);
    var asp = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    orbitCtl.state.tDist = Math.min(30, dist * Math.max(1, 1.2 / asp));
  }
  var tmpW = null;
  function focusThing(name) {
    if (!orbitCtl || !servantRef) return;
    if (!tmpW) tmpW = new T.Vector3();
    if (name === 'staff') { servantRef.userData.sight.getWorldPosition(tmpW); focusAt(tmpW.x, tmpW.y - 0.3, tmpW.z, 5.5); }
    else if (name === 'arch') focusAt(-2.0, 6.4, 0.5, 9);
    else if (name === 'fire') focusAt(-3.9, 2.4, 1.1, 7);
    else if (name === 'tracks') focusAt(1.9, 0.6, 5.2, 8);
    else if (name === 'statues') focusAt(-4.7, 2.7, 0.8, 8);
    else focusOn('overview');
  }

  function focusOn(who) {
    if (!orbitCtl) return;
    var f = focusTarget[who] || focusTarget.overview;
    orbitCtl.setTarget(f[0], f[1], f[2]);
    // only re-frame the shot when the player is not steering it
    if (orbitCtl.state.idle > 3) orbitCtl.state.tDist = Math.min(30, f[3] * Math.max(1, 1.2 / Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight))));
  }

  // =========================================================================
  // 2. THE CONVERSATION: short lines, who-is-speaking made obvious
  // =========================================================================
  var CAST = {
    hermes:  { name: 'Hermes',      role: 'Cartographer',       icon: '🧭' },
    servant: { name: 'The Servant', role: 'Elder of Tower II',  icon: '🏛️' },
    silvia:  { name: 'Silvia',      role: 'on the field wire',  icon: '📡' }
  };
  var ds = { token: 0, stage: 'intro', asked: {}, sealPlaced: false, busy: false, fast: false, speaker: null, knows: false, regard: 0, tone: null, seen: {}, flags: {}, wrongs: 0, picked: {}, duel: null, relics: [] };
  var UNKNOWN = { name: '???', role: 'unknown', icon: '❔' };
  // until Silvia learns who the old man is, he is only "???"
  function castOf(who) { return (who === 'servant' && !ds.knows) ? UNKNOWN : CAST[who]; }
  function theMan() { return ds.knows ? 'The Servant' : 'The old man'; }

  // the moment the identity is known: every earlier "???" turns into the Servant
  function revealServant() {
    if (ds.knows) return;
    ds.knows = true;
    var rows = logEl ? logEl.querySelectorAll('.gl-servant') : [];
    Array.prototype.forEach.call(rows, function (r) {
      r.querySelector('.gl-avatar').textContent = CAST.servant.icon;
      r.querySelector('.gl-name').innerHTML = CAST.servant.name + ' <small>' + CAST.servant.role + '</small>';
      r.classList.add('is-revealed');
    });
    setMission('Get past the Servant of Tower II');
    if (sfx.playCelestialChime) sfx.playCelestialChime();
  }

  function sleep(ms) {
    return new Promise(function (res) { setTimeout(res, ds.fast ? 50 : ms); });
  }

  function scrollLog() {
    if (logEl) { logEl.scrollTop = logEl.scrollHeight; requestAnimationFrame(function () { logEl.scrollTop = logEl.scrollHeight; }); }
  }

  function setMission(txt) {
    var m = document.getElementById('gates-mission-text');
    if (m) m.textContent = txt;
  }

  function logNarration(text) {
    var d = document.createElement('div');
    d.className = 'gl-narr';
    d.textContent = text;
    logEl.appendChild(d);
    scrollLog();
    if (subtitle) subtitle.textContent = text;
  }

  function logCard(title, items) {
    var d = document.createElement('div');
    d.className = 'gl-card';
    var h = document.createElement('div');
    h.className = 'gl-card-title';
    h.textContent = title;
    d.appendChild(h);
    var ul = document.createElement('ul');
    items.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    d.appendChild(ul);
    logEl.appendChild(d);
    scrollLog();
  }

  // chat rhythm: the "typing…" dots last as long as the message would take to write, then there is time to read it
  function typingTime(who, text) {
    var per = who === 'silvia' ? 22 : 34;
    return Math.min(3000, 750 + text.length * per);
  }
  function readTime(text) { return Math.min(2600, 650 + text.length * 30); }

  // One chat bubble per run of messages from the same speaker: each line is typed in turn, inside the same bubble.
  // lines: array of {say, fx}
  async function logSay(who, lines, token) {
    var c = castOf(who);
    var row = document.createElement('div');
    row.className = 'gl-row gl-' + who;
    row.innerHTML = '<div class="gl-avatar" aria-hidden="true">' + c.icon + '</div>' +
      '<div class="gl-main"><div class="gl-name">' + c.name + ' <small>' + c.role + '</small></div>' +
      '<div class="gl-bubble"></div></div>';
    var bubble = row.querySelector('.gl-bubble');
    logEl.appendChild(row);
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i], text = typeof ln === 'string' ? ln : ln.say;
      var p = document.createElement('p');
      p.className = 'gl-line';
      p.innerHTML = '<span class="gl-typing"><i></i><i></i><i></i></span>';
      bubble.appendChild(p);
      scrollLog();
      showStageBubble(who, null);
      setSpeaking(who);
      await sleep(typingTime(who, text));
      if (token !== ds.token) return;
      if (ln.fx) ln.fx();
      if (ln.reveal) { revealServant(); row.querySelector('.gl-avatar').textContent = castOf(who).icon; row.querySelector('.gl-name').innerHTML = castOf(who).name + ' <small>' + castOf(who).role + '</small>'; }
      p.textContent = text;
      scrollLog();
      showStageBubble(who, text);
      await sleep(readTime(text));
      if (token !== ds.token) return;
    }
    row.classList.add('is-said');
  }

  // plays a list of beats: narration, diary cards, and speech (runs of one speaker are merged into one bubble)
  async function play(lines, token) {
    var i = 0;
    while (i < lines.length) {
      if (token !== ds.token) return false;
      var ln = lines[i];
      if (ln.unk && ds.knows) { i++; continue; }
      if (ln.card) {
        setSpeaking(null);
        logCard('📖 Your diary · Sheet 13A', ln.card);
        await sleep(1400);
        i++;
      } else if (ln.narr) {
        setSpeaking(null);
        logNarration(ln.narr.replace('{S}', theMan()));
        if (ln.fx) ln.fx();
        await sleep(1100 + Math.min(1400, ln.narr.length * 22));
        i++;
      } else {
        var run = [];
        while (i < lines.length && lines[i].who === ln.who && !lines[i].narr && !lines[i].card) {
          if (!(lines[i].unk && ds.knows)) run.push(lines[i]);
          i++;
        }
        await logSay(ln.who, run, token);
      }
    }
    return token === ds.token;
  }

  // ---- in-scene: a speech bubble that follows the speaker, a ring under their feet ----
  function showStageBubble(who, text) {
    if (!bubbleEl) return;
    ds.speaker = who;
    var c = castOf(who);
    bubbleEl.className = 'gates-bubble gb-' + who + (text ? ' is-on' : ' is-typing');
    bubbleEl.innerHTML = '<div class="gb-name">' + c.icon + ' ' + c.name.toUpperCase() + '</div>' +
      '<div class="gb-text">' + (text ? text.replace(/</g, '&lt;') : '<span class="gl-typing"><i></i><i></i><i></i></span>') + '</div>';
    if (who === 'silvia') bubbleEl.classList.add('gb-radio');
    focusOn(who === 'servant' ? 'servant' : who === 'hermes' ? 'hermes' : 'overview');
  }
  function hideStageBubble() {
    if (bubbleEl) bubbleEl.className = 'gates-bubble';
    ds.speaker = null;
  }
  function setSpeaking(who) { speaking = who; }

  // ---- what the player may say: every choice changes the Servant's regard, the path and what comes next ----
  function sealFx() {
    ds.sealPlaced = true;
    setLs('order_monolith_gate_seal1', 'true');
    if (sfx.playCelestialChime) sfx.playCelestialChime();
    updateHUD();
  }
  function R(n) { ds.regard += n; }
  function seenCount() { return Object.keys(ds.seen).length; }
  function look(name) { return function () { focusThing(name); }; }
  function sayH(t, extra) { var o = { who: 'hermes', say: t }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  function sayS(t, extra) { var o = { who: 'servant', say: t }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  function nar(t, extra) { var o = { narr: t }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  function sayV(t, extra) { var o = { who: 'silvia', say: t }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  var STAFF_Q = 'How many points does the star on my staff carry?';

  // The road so far, in the shape GatesRoad stores it (also what decides the march)
  function curFlags() {
    var f = {}, k;
    for (k in ds.flags) f[k] = ds.flags[k];
    f.regard = ds.regard; f.seen = ds.seen;
    return f;
  }
  function hoursNow() {
    if (!window.GatesRoad) return 12;
    return isCompleted() ? window.GatesRoad.marchHours() : window.GatesRoad.hoursFor(curFlags());
  }
  function hoursWordNow() { var w = { 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen' }; return w[hoursNow()] || String(hoursNow()); }
  function marchKindNow() { var h = hoursNow(); return h < 12 ? 'shortcut' : h > 12 ? 'storm' : 'steady'; }

  // A gift of the road: it goes into the satchel now and its card pops up when the lines have played
  function giveRelic(id) {
    if (ds.relics.indexOf(id) < 0) ds.relics.push(id);
    if (typeof window.addRelicToInventory === 'function') window.addRelicToInventory(id);
  }
  function showQueuedRelics() {
    var id = ds.relics.shift();
    if (!id || typeof window.openItemAcquiredModal !== 'function') { ds.relics = []; return; }
    window.openItemAcquiredModal({ id: id }, showQueuedRelics);
  }
  function fireBurst(k) { fireFlash = k; if (sfx.playCelestialChime) sfx.playCelestialChime(); }

  var CHOICES = {
    // ---- how to meet him (the first choice shapes the whole encounter) ----
    greet: {
      icon: '🙏', label: 'Greet him with respect.', say: 'Hermes, greet him. Slowly, with respect.',
      lines: function () { return [
        nar('Hermes lowers his staff and bows his head.'),
        sayH('Peace on your door, elder.'),
        nar('{S} studies him for a long moment.'),
        sayS('Peace. You walk like one who has walked far.'),
        sayS('Speak, traveler. Slowly.')
      ]; },
      after: function () { ds.tone = 'humble'; R(2); ds.stage = 'hub'; setMission(ds.knows ? 'Earn the Servant’s trust' : 'Find out who he is'); }
    },
    demand: {
      icon: '⚔️', label: 'Tell him to step aside.', say: 'Hermes, tell him to step aside. We have no time.',
      lines: function () { return [
        sayH('Silvia... are you sure? He is old, but that staff is iron.'),
        sayH('Step aside, elder. We have business with the Oracle.'),
        nar('The iron staff drops across the stairs with a ringing crack.'),
        sayS('Business. Everyone who climbs has business.'),
        sayS('Answer one question, or turn back.'),
        sayS(STAFF_Q, { fx: look('staff') })
      ]; },
      after: function () { ds.tone = 'bold'; R(-2); ds.flags.trial = true; ds.stage = 'test'; setMission('Answer his question'); }
    },
    study: {
      icon: '👁️', label: 'Look around first.', say: 'Wait, Hermes. Do not speak yet. Look around.',
      lines: function () { return [
        nar('Hermes holds still. His eyes travel over the gates, the fires, the stone.'),
        sayH('What should I look at first, Silvia?')
      ]; },
      after: function () { ds.tone = 'observer'; ds.stage = 'look'; setMission('Look closely at the gates'); }
    },

    // ---- looking: each detail is a clue, and the Servant notices who looks ----
    look_arch: {
      icon: '🔍', label: 'The arch and its five sockets.', say: 'Look at the arch above the doors.',
      lines: function () { return [
        nar('Hermes lifts his eyes to the arch.', { fx: look('arch') }),
        sayH('Five round sockets in the stone ring.'),
        sayH('The first one, on the left, has a sun above waves carved around it.'),
        sayH('Silvia... my stone disc has that same sun and those same waves.'),
        nar('Along the lintel, in worn capitals: “OPEN AT THE SETTING OF THE SUN”.')
      ]; },
      after: function () { ds.seen.arch = true; }
    },
    look_staff: {
      icon: '🔍', label: 'His staff. The top of it.', say: 'Look at his staff. The very top.',
      lines: function () { return [
        nar('Hermes squints up at the staff.', { fx: look('staff') }),
        sayH('Dark iron. A ring at the top, with points like a star.'),
        sayH('Let me count them... eight. Eight points, Silvia.'),
        nar('The old man does not move, but his eyes follow Hermes’s gaze.')
      ]; },
      after: function () { ds.seen.staff = true; }
    },
    look_tracks: {
      icon: '🔍', label: 'The prints on the ground.', say: 'What is on the ground, Hermes? Any prints?',
      lines: function () { return [
        nar('Hermes crouches at the foot of the stairs.', { fx: look('tracks') }),
        sayH('Camel prints. Two animals, I think.'),
        sayH('They come right up to the stairs. Whoever it was stood here a while.')
      ]; },
      after: function () { ds.seen.tracks = true; }
    },
    look_fire: {
      icon: '🔍', label: 'The fires by the columns.', say: 'Look at the fires on the landing.',
      lines: function () { return [
        nar('Hermes turns to the braziers.', { fx: look('fire') }),
        sayH('Four fires. Three burn high.'),
        sayH('The one on the left, by the column, is nearly out. The bowl is almost dry.'),
        nar('The old man glances at it, then looks away.')
      ]; },
      after: function () { ds.seen.fire = true; }
    },
    look_statues: {
      icon: '🔍', label: 'The stone guardians.', say: 'Look at the statues in the niches.',
      lines: function () { return [
        nar('Hermes studies the niches in the wall.', { fx: look('statues') }),
        sayH('Two statues. Old men, hooded, with long staffs.'),
        sayH('They hold their staffs just as he does. Like a long line of them.'),
        sayH('Maybe he is not the first to keep this door.')
      ]; },
      after: function () { ds.seen.statues = true; }
    },
    look_done: {
      icon: '🗣️', label: 'Enough. Speak to him.', say: 'That is enough looking. Now speak to him, Hermes.',
      lines: function () {
        var n = seenCount();
        return [
          nar('Hermes turns to the old man.', { fx: look('overview') }),
          n >= 2 ? sayS('You look before you speak. Few do.') : sayS('Speak, traveler.')
        ];
      },
      after: function () { if (seenCount() >= 2) R(1); ds.stage = 'hub'; setMission(ds.knows ? 'Earn the Servant’s trust' : 'Find out who he is'); }
    },
    look_more: {
      icon: '🔍', label: 'Look around some more.', say: 'Hermes, take another look around.',
      lines: function () { return [nar('Hermes lets his eyes wander again.')]; },
      after: function () { ds.stage = 'look'; }
    },

    // ---- finding out who he is ----
    who: {
      icon: '👤', label: 'Who is he, Hermes?', say: 'Hermes, who is he? Do you know him?',
      lines: function () { return [
        sayH('I am not sure, Silvia.'),
        sayH('In 1998 I watched an old man from a far ridge. Hood. White beard. It may be the same man.'),
        sayH('Back then I thought he was the Oracle. But I never spoke to him.'),
        sayH('We should ask him ourselves.')
      ]; }
    },
    name: {
      icon: '🗣️', label: 'Ask him who he is.', say: 'Hermes, ask him who he is.',
      lines: function () {
        var cold = ds.regard <= -1;
        return [
          nar('Hermes lowers his voice and asks.'),
          sayS('I am the Servant of the Oracle.', { reveal: true }),
          sayS(cold ? 'I keep this door. Do not mistake me for a friend.' : 'I keep this door. Nothing more.'),
          sayH('The Servant of the Oracle... so he is not the Oracle herself.'),
          sayH('In 1998 I had it wrong, Silvia.'),
          sayH('Read Sheet 13A in your diary now. It tells of the Servant and the five cairns.')
        ];
      }
    },
    oracle: {
      icon: '👁️', label: 'Ask about the Oracle.', say: 'Ask him where the Oracle is.',
      lines: function () {
        var out = [nar('Hermes steps closer and asks.')];
        if (ds.regard <= -1) {
          out.push(sayS('Not for you. Not tonight.'), sayS('Earn the stair first.'), sayH('Then we earn it. Ask how, Silvia?'));
          ds.flags.trialHint = true;
        } else {
          out.push(sayS('She has no face. She keeps the horizon.'), sayS('She lives deep inside.'));
          if (ds.regard >= 2) out.push(sayS('She sees those who come with open hands.'));
          out.push(sayS('Five seals must sit in this arch before she receives anyone.'), sayH('Five, Silvia. Not one.'));
        }
        return out;
      }
    },
    memory: {
      icon: '🗝️', label: 'Does he remember you?', say: 'Tell him your name. Maybe he remembers you.',
      lines: function () {
        var out = [sayH('My name is Hermes. Once of the Alpine Observatory.')];
        if (ds.regard >= 2) {
          out.push(nar('The old man’s eyes warm.'), sayS('The boy with the star-charts. Lamp oil on his sleeves.'), sayH('You remember...'), sayS('I remember everyone who climbs. Few climb twice.'));
          ds.flags.recognized = true; R(1);
        } else if (ds.regard <= -1) {
          out.push(sayS('Memory is not a key.'), sayH('Cold. But fair.'));
        } else {
          out.push(nar('For a moment, the old man’s mouth softens.'), sayH('He smiled, Silvia. Maybe he remembers me. I cannot tell.'), sayS('Old memories do not open doors.'), sayH('Then memories will not open this door.'));
        }
        return out;
      }
    },
    proof: {
      icon: '🪨', label: 'What proof does he want?', say: 'Ask what “proof of survey” means.',
      lines: function () {
        var out = [sayH('Elder, what proof of survey?'), sayS('A seal. Cut from the desert’s own stone.')];
        out.push(sayH('A seal? Silvia, I carry a stone disc from the dry river, at Wadi al-Hajar.'));
        if (ds.seen.arch) out.push(sayH('And the first socket has its sun and waves. It may fit.'));
        out.push(sayH('Could that be what he means? Shall I show him?'));
        return out;
      }
    },
    diary: {
      icon: '📖', label: 'Check my diary (Sheet 13A).', say: 'Wait. Let me check my diary, Sheet 13A.',
      lines: function () { return [
        nar('Silvia turns to Sheet 13A: “At the Gates of Tower II”.'),
        { card: ['Five cairns were raised across the desert.', 'Each one holds a seal. Five seals open Tower II.', 'Cairn I: the river stones at Wadi al-Hajar. Your seal comes from here.', 'Next: Cairn II, the Sun Monolith (Sheet 13B).', 'The lintel of the arch, in worn capitals: “OPEN AT THE SETTING OF THE SUN”.'] },
        { who: 'silvia', say: 'Five cairns, five seals. We have one.' },
        sayH('Then one is where we begin.')
      ]; }
    },

    // ---- his test: eyes that count (the answer is on his staff, visible in the scene) ----
    trial: {
      icon: '🎯', label: 'Ask how to earn his trust.', say: 'Ask him what it takes to earn his trust.',
      lines: function () { return [
        sayH('Elder, what would you have us prove?'),
        sayS('One honest answer.'),
        sayS(STAFF_Q, { fx: look('staff') })
      ]; },
      after: function () { ds.flags.trial = true; ds.stage = 'test'; setMission('Answer his question'); }
    },
    t8: {
      icon: '8️⃣', label: 'Eight points.', say: 'Eight. The star has eight points.',
      lines: function () {
        var out = [nar('The old man lifts his staff. The star-sight catches the last light.'), sayS('Eight. Eyes that count.')];
        if (ds.seen.staff) out.push(sayS('You looked. I saw you looking.'));
        out.push(sayS('Few see what stands in front of them.'), sayH('Well done, Silvia.'));
        return out;
      },
      after: function () { ds.flags.testPassed = true; R(2); ds.stage = 'hub'; focusThing('overview'); setMission('You earned his respect'); }
    },
    t6: {
      icon: '6️⃣', label: 'Six points.', say: 'Six, I think.', wrong: true,
      lines: function () { return wrongAnswer(); }
    },
    t12: {
      icon: '🔢', label: 'Twelve points.', say: 'Twelve?', wrong: true,
      lines: function () { return wrongAnswer(); }
    },
    tlook: {
      icon: '🔍', label: 'Ask Hermes to look closer.', say: 'Hermes, look closer at his staff.',
      lines: function () { return [
        nar('Hermes steps forward and squints up at the star-sight.', { fx: look('staff') }),
        sayH('The light is low... I count eight. Or seven. I cannot be sure, Silvia.')
      ]; },
      after: function () { ds.seen.staff = true; ds.flags.tlook = true; }
    },

    // ---- a small act of kindness: the dying fire ----
    oil: {
      icon: '🪔', label: 'Feed the dying fire with Hermes’s lamp oil.', say: 'Hermes, that left fire is dying. Give it your lamp oil.',
      lines: function () { return [
        sayH('My lantern oil? It is all I have for the night walk.', { fx: look('fire') }),
        sayH('Your call, Silvia... Very well.'),
        nar('Hermes tips the little flask over the bowl. The fire roars up, gold and tall.', { fx: function () { fireFlash = 1.6; ds.flags.gaveOil = true; if (sfx.playCelestialChime) sfx.playCelestialChime(); } }),
        nar('The old man’s face softens. For the first time he looks at Hermes, not through him.'),
        sayS('Oil is dear in the Erg. You paid more than the flask.'),
        sayH('My lantern burns low now. The night walk will be dark.')
      ]; },
      after: function () { R(2); focusThing('overview'); if (ds.stage === 'hub') setMission(ds.knows ? 'Earn the Servant’s trust' : 'Find out who he is'); }
    },

    // ---- presenting the seal: the answer depends on how you got here ----
    seal: {
      icon: '🪨', label: 'Show him the Seal of Cairn I.', say: 'Hermes, show him the seal from Cairn I.',
      lines: function () {
        var ok = ds.regard >= 1 || ds.flags.testPassed || (ds.flags.stumbled && ds.flags.gaveOil), out = [nar('Hermes lifts a stone disc from his satchel.'), sayH('Proof of survey, elder. From the dry river.')];
        if (!ds.knows) out.push(sayS('I am the Servant of the Oracle. I keep this door.', { unk: true, reveal: true }));
        if (!ok) {
          out.push(nar('{S} turns the disc in his fingers, then hands it back.'));
          if (ds.flags.stumbled) {
            out.push(sayS('You have not paid for your first mistake.'), sayS('A fire is dying by that column. You have eyes.'), sayH('The fire, Silvia. He wants us to feed it.'));
            ds.flags.sealRefused = true; ds.stage = 'hub';
          } else {
            out.push(sayS('A stone is half a proof.'), sayS('Show me you can see.'), sayS(STAFF_Q, { fx: look('staff') }));
            ds.flags.sealRefused = true; ds.flags.trial = true; ds.stage = 'test';
          }
          ds.sealAccepted = false;
          return out;
        }
        out.push(nar('{S} studies the sun and the waves cut into the stone.'));
        out.push(sayS(ds.tone === 'humble' ? 'True stone. True hand. And a true bow before it.' : ds.tone === 'bold' ? 'True stone. A pity about the manners.' : ds.tone === 'observer' ? 'True stone. And you looked before you asked.' : 'True stone. True hand.'));
        out.push(nar('He presses it into the first socket of the arch.', { fx: sealFx }));
        out.push(nar('A deep chime rolls through the canyon. The socket glows gold.'));
        out.push(sayS('One seal is home. Four still sleep in stone.'), sayH('Four more, Silvia.'));
        ds.sealAccepted = true;
        return out;
      },
      after: function () {
        if (ds.sealAccepted) { ds.stage = 'after'; setMission('Four seals to go · pick the next road'); }
        else if (ds.stage === 'test') setMission('Answer his question');
      }
    },

    // ---- after the seal: the paths open or close depending on what you did ----
    where: {
      icon: '🧭', label: 'Where are the other seals?', say: 'Where do we find the other four?',
      lines: function () { return [
        sayS('Out in the Great Erg. Follow the needle.'),
        sayS('Fourteen degrees, north-north-east.'),
        sayH('Cairn II is the Sun Monolith, in your diary. Is that where he points?')
      ]; }
    },
    goal: {
      icon: '🚪', label: 'What happens at five?', say: 'And when all five seals are in?',
      lines: function () {
        // the Servant's one lie: unless it has been caught, he says the doors open at dawn
        var lied = !ds.flags.lieCaught;
        if (lied) ds.flags.lieHeard = true;
        return [
          sayS(lied ? 'The bronze doors open at dawn.' : 'The bronze doors open at dusk.'),
          sayS('The Oracle will receive you.'),
          sayH('So the Oracle is the goal, Silvia.')
        ];
      }
    },
    time: {
      icon: '⏳', label: 'How long is the walk?', say: 'How far is Cairn II, Hermes?',
      lines: function () {
        var k = marchKindNow();
        return [
          sayH('By my map, about twelve hours across the dunes.'),
          k === 'shortcut' ? sayH('Unless the Servant is right about his dry channel: then ' + hoursWordNow() + '.')
            : k === 'storm' ? sayH('If the weather holds. The wind does not like us tonight.') : sayH('Best to walk by night, out of the sun.')
        ];
      }
    },
    tracks: {
      icon: '🐪', label: 'Ask about the camel tracks.', say: 'Ask him about the camel prints at the stairs.',
      lines: function () {
        var out = [sayS('Many pass. Few climb.'), sayS('Those two climbed, stood where you stand, then went back down.')];
        out.push(ds.regard >= 2 ? sayS('They did not ask my leave. You did.') : sayS('They did not ask my leave, either.'));
        out.push(sayH('Two riders who saw the doors and turned back. Or were turned back.'));
        ds.flags.askedTracks = true;
        return out;
      }
    },
    blessing: {
      icon: '🧵', label: 'Ask for his blessing on the road.', say: 'Hermes, ask him for a blessing for the road.',
      lines: function () { return [
        sayH('Elder, will you bless the road ahead?'),
        nar('The old man unties a faded red cord from his staff and knots it round Hermes’s wrist.'),
        sayS('Red for the road. It will not stop the sun. It will remind you who waits.'),
        sayH('I will not take it off.', { fx: function () { giveRelic('red_cord'); } })
      ]; },
      after: function () { ds.flags.blessing = true; R(1); }
    },
    secret: {
      icon: '🔓', label: 'Ask what the Oracle values most.', say: 'Ask him what the Oracle values most.',
      lines: function () { return [
        sayS('You have earned a true answer.'),
        sayS('She listens longer than she speaks.'),
        sayS('When you stand before her, do the same.'),
        sayH('I will remember that. So will Silvia.')
      ]; },
      after: function () { ds.flags.secret = true; }
    },
    go: {
      icon: '✦', label: 'Go: march 14° NNE to Cairn II.', say: 'Go, Hermes. March 14° NNE to Cairn II.',
      lines: function () {
        var out = [sayS('Go. The desert is patient.')];
        if (ds.flags.secret) out.push(sayS('And Hermes: look after her. She sees more than the stars.'));
        else if (ds.flags.angered) out.push(sayS('You doubted my word. Go, and think on it.'));
        else if (ds.tone === 'humble') out.push(sayS('Walk gently. The Erg remembers kindness.'));
        else if (ds.tone === 'bold') out.push(sayS('You came hard. Leave softer.'));
        else out.push(sayS('You see well. Keep your eyes open on the sand.'));
        var mk = marchKindNow();
        if (mk === 'shortcut') out.push(sayS('Take the dry channel under the red dune. It saves you two hours.'));
        else if (mk === 'storm') out.push(sayS('The wind is turning. A storm is walking up from the south: it will cost you two hours.'));
        out.push(sayS('When five seals are gathered, call on this gate.'));
        if (ds.flags.gaveOil || ds.flags.lostOil) out.push(sayH('My lantern is nearly dry. We will walk the night half blind.'));
        if (ds.flags.blessing) out.push(sayH('And the red cord stays on my wrist.'));
        if (!ds.flags.gaveOil && !ds.flags.lostOil) out.push(sayH('I still have my lamp oil. A little light on the road will not hurt.'));
        out.push(sayH('Keep Sheet 13B close, Silvia.'), sayH('At the Monolith, the seven noons are yours to solve.'));
        out.push(nar('Hermes turns north-north-east. The long march begins.'));
        return out;
      },
      after: function () { completeQuestEncounter(); }
    }
  };

  // the second wrong answer closes the door for now; the first gives another try
  function wrongAnswer() {
    ds.wrongs = (ds.wrongs || 0) + 1;
    if (ds.wrongs === 1) return [sayS('No. Look again.'), sayH('Think, Silvia. The top of the staff.')];
    if (ds.flags.lostOil) return [sayS('No. But you have already paid in oil. Look once more.'), sayH('Take your time, Silvia. The staff, the very top.')];
    return [
      sayS('The desert is patient. I am not.'),
      sayH('Silvia... he is closing the door on us.'),
      nar('The old man lowers his staff. The test is over.'),
      sayS('You will learn. A fire burns low by that column. Think on it.')
    ];
  }
  CHOICES.t6.after = CHOICES.t12.after = function () {
    R(-1);
    if (ds.wrongs >= 2 && ds.flags.lostOil) { ds.wrongs = 0; ds.picked.t6 = ds.picked.t12 = false; return; }
    if (ds.wrongs >= 2) { ds.flags.testFailed = true; ds.flags.stumbled = true; ds.stage = 'hub'; focusThing('overview'); setMission('He is not convinced · find a way to earn him'); }
  };

  // the long scenes (riddle duel, the statues' riddle, the Servant's lie) live in s13b-gates-extras.js
  var extras = window.GatesExtras ? window.GatesExtras({
    ds: ds, CHOICES: CHOICES, nar: nar, sayH: sayH, sayS: sayS, sayV: sayV, look: look, R: R, STAFF_Q: STAFF_Q,
    setMission: setMission, focusThing: focusThing, giveRelic: giveRelic, fireBurst: fireBurst,
    fitSeals: fitSeals, openDoors: function (k) { doorTarget = k; }, finishReturn: showReturnCard
  }) : null;
  if (extras) for (var xid in extras.choices) CHOICES[xid] = extras.choices[xid];

  // which replies are on offer right now (at most four, plus the one that moves the story on)
  function menu() {
    var a = ds.asked, f = ds.flags, out = [], list = [];
    var own = extras && extras.menu(ds.stage);
    if (own) return own;
    var add = extras ? extras.add(ds.stage) : [];
    if (ds.stage === 'approach') return ['greet', 'demand', 'study'];
    if (ds.stage === 'look') {
      ['arch', 'staff', 'tracks', 'fire', 'statues'].forEach(function (k) { if (!ds.seen[k]) list.push('look_' + k); });
      return list.slice(0, 4).concat(['look_done']);
    }
    if (ds.stage === 'test') {
      list = ['t8', 't6', 't12'];
      if (ds.wrongs >= 1) list = list.filter(function (id) { return !(CHOICES[id].wrong && ds.picked && ds.picked[id]); });
      if (!f.tlook && !ds.seen.staff) list.push('tlook');
      return list.concat(add);
    }
    if (ds.stage === 'hub') {
      if (!ds.knows) { list.push('name'); if (!a.who) list.push('who'); }
      if (ds.knows) {
        if (!a.oracle) list.push('oracle');
        if (!a.memory) list.push('memory');
        if (a.oracle && !a.proof) list.push('proof');
        if (!a.diary) list.push('diary');
      } else if (a.who) { /* waits for the Servant to speak for himself */ }
      var oilLeft = !f.gaveOil && !f.lostOil;
      if (f.stumbled && oilLeft) list.unshift('oil');
      if (ds.seen.fire && oilLeft && !f.stumbled) list.push('oil');
      if (!f.trial && ds.knows) list.push('trial');
      if (seenCount() < 5) list.push('look_more');
      return add.concat(list).slice(0, 4).concat(['seal']);
    }
    if (ds.stage === 'after') {
      if (!a.where) list.push('where');
      if (!a.goal) list.push('goal');
      if (a.where && !a.time) list.push('time');
      if (ds.seen.tracks && !f.askedTracks) list.push('tracks');
      if (ds.regard >= 3 && !f.blessing && ds.tone !== 'bold') list.push('blessing');
      if (ds.regard >= 5 && !f.secret) list.push('secret');
      if (!f.gaveOil && !f.lostOil && (ds.seen.fire || f.stumbled)) list.push('oil');
      if (!a.diary) list.push('diary');
      return add.concat(list).slice(0, 4).concat(['go']);
    }
    return out;
  }

  function renderChoices() {
    choicesBox.innerHTML = '';
    var ids = menu();
    choicesBox.parentNode.style.display = ids.length ? '' : 'none';
    ids.forEach(function (id) {
      var c = CHOICES[id];
      addChoice('choice-' + id, c.icon + ' ' + c.label, function () { pick(id); });
    });
  }

  async function pick(id) {
    if (ds.busy) return;
    var c = CHOICES[id], token = ds.token;
    // some replies only open a sub-menu: nothing is sent to the Servant yet
    if (c.opens) { if (sfx.playMechanicalClick) sfx.playMechanicalClick(); c.opens(); renderChoices(); return; }
    ds.busy = true;
    ds.fast = false;   // a hurry only lasts the scene in flight; every new reply gets the calm pace again
    choicesBox.innerHTML = '';
    choicesBox.parentNode.style.display = 'none';
    ds.asked[id] = true;
    ds.picked = ds.picked || {};
    ds.picked[id] = true;
    if (sfx.playMechanicalClick) sfx.playMechanicalClick();
    await logSay('silvia', [c.say], token);
    var ok = await play(c.lines(), token);
    if (!ok) return;
    ds.fast = false;
    if (c.after) c.after();
    ds.busy = false;
    if (ds.relics.length) showQueuedRelics();
    if (ds.stage !== 'done') renderChoices();
    setSpeaking(null);
    if (ds.stage !== 'done') hideStageBubbleSoon(token);
  }

  function hideStageBubbleSoon(token) {
    setTimeout(function () { if (token === ds.token && !ds.busy) hideStageBubble(); }, 2600);
  }

  function updateHUD() {
    var hasSeal1 = ds.sealPlaced || isCompleted() || getLs('order_monolith_gate_seal1') === 'true';
    var fitted = Math.max(hasSeal1 ? 1 : 0, ds.retSeals || 0), NUM = ['I', 'II', 'III', 'IV', 'V'];
    if (socketChips) socketChips.forEach(function (chip, i) {
      chip.classList.toggle('is-fitted', i < fitted);
      chip.innerHTML = i < fitted ? '✓' : NUM[i];
    });
    if (firstSealMesh) {
      if (hasSeal1 && !firstSealMesh.visible) sealFlash = 1;
      firstSealMesh.visible = hasSeal1;
    }
    extraSeals.forEach(function (m, i) {
      var on = fitted > i + 1;
      if (on && !m.visible) sealFlash = 1;
      m.visible = on;
    });
  }

  // the return: seal number n goes home in the arch
  function fitSeals(n) {
    ds.retSeals = n;
    if (sfx.playCelestialChime) sfx.playCelestialChime();
    updateHUD();
  }

  function addChoice(id, label, action) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gates-choice-btn';
    btn.id = id;
    btn.innerHTML = '<span>' + label + '</span>';
    btn.addEventListener('click', action);
    choicesBox.appendChild(btn);
  }

  // ---- the opening: where we are, what Silvia has, then the scene ----
  async function startConversation(resume) {
    var token = ++ds.token;
    ds.stage = 'intro'; ds.asked = {}; ds.busy = true; ds.fast = false; ds.knows = !!resume;
    ds.regard = 0; ds.tone = null; ds.seen = {}; ds.flags = {}; ds.wrongs = 0; ds.picked = {}; ds.duel = null; ds.relics = []; ds.statueMiss = 0;
    if (extras) extras.reset();
    // the doors stand open only for those who have already been received at the end of the Desert Path
    var back = !!(window.GatesRoad && window.GatesRoad.returned());
    ds.mode = null; ds.onReturn = null; ds.retSeals = back ? 5 : 0; doorTarget = back ? 1 : 0;
    if (hudTime) hudTime.textContent = '18:30 · LAST LIGHT';
    ds.sealPlaced = getLs('order_monolith_gate_seal1') === 'true' && isCompleted();
    if (resume) {
      try { ds.flags = JSON.parse(getLs('order_gates_flags') || '{}') || {}; } catch (e) { ds.flags = {}; }
      ds.tone = getLs('order_gates_path') || null;
      ds.regard = ds.flags.regard || 0; ds.seen = ds.flags.seen || {};
    }
    logEl.innerHTML = '';
    choicesBox.innerHTML = '';
    choicesBox.parentNode.style.display = 'none';
    if (decreeCard) decreeCard.style.display = 'none';
    hideStageBubble();
    updateHUD();
    setMission(ds.knows ? 'Get past the Servant of Tower II' : 'Get past the old man at the gates');

    logCard('📖 Where we are', [
      'You sent Hermes across the desert. He carries the Seal of Cairn I.',
      'Your goal: reach the Oracle, inside Tower II.',
      'Every choice here counts. The order you ask, and how you ask, will change what comes next.'
    ]);
    await sleep(1500);

    if (resume) {
      ds.stage = 'done';
      var f = ds.flags, lines = [nar('Hermes has already set out for Cairn II.')];
      lines.push(sayS(ds.tone === 'humble' ? 'He bowed. I remember a bow.' : ds.tone === 'bold' ? 'He came hard. I remember that, too.' : 'He looked before he spoke. I remember that.'));
      if (f.gaveOil) lines.push(sayS('And a fire still burns by my column because of his oil.'));
      if (f.blessing) lines.push(nar('A red cord is tied to Hermes’s wrist.'));
      lines.push(sayH((window.GatesRoad ? window.GatesRoad.hoursWord() : 'Twelve') + ' hours across the Erg. Sheet 13B is next, Silvia.'));
      await play(lines, token);
      if (token !== ds.token) return;
      ds.busy = false; setSpeaking(null); hideStageBubble();
      showVictoryDecree();
      return;
    }

    var ok = await play([
      nar('Last light. Tower II rises from the red cliff. An old man blocks the stairs.'),
      sayH('Silvia, can you hear me? I am at the gates of Tower II.'),
      sayH('Columns of living rock. Bronze doors, sealed shut.'),
      sayH('And an old man on the top step, with an iron staff.'),
      sayS('Halt. No traveler passes without proof of survey.'),
      sayH('Silvia... I have seen a man like this before. How do we meet him?')
    ], token);
    if (!ok) return;
    ds.stage = 'approach';
    ds.busy = false;
    setSpeaking(null);
    setMission('Decide how to approach him');
    renderChoices();
    hideStageBubbleSoon(token);
  }

  // ---- the return (launched by Station 19): five seals home, the bronze doors open ----
  async function startReturn(onDone) {
    var token = ++ds.token, Road = window.GatesRoad;
    ds.mode = 'return'; ds.onReturn = onDone || null;
    ds.stage = 'intro'; ds.asked = {}; ds.busy = true; ds.fast = false; ds.knows = true;
    ds.flags = Road ? Road.flags() : {}; ds.tone = Road ? Road.tone() : null;
    ds.regard = ds.flags.regard || 0; ds.seen = ds.flags.seen || {};
    ds.wrongs = 0; ds.picked = {}; ds.duel = null; ds.relics = []; ds.statueMiss = 0;
    ds.ret = { sealed: false, asked: false, keepers: false };
    ds.retSeals = 1; doorTarget = 0;
    if (hudTime) hudTime.textContent = '06:10 · DAWN';
    if (extras) extras.reset();
    logEl.innerHTML = '';
    choicesBox.innerHTML = '';
    choicesBox.parentNode.style.display = 'none';
    if (decreeCard) decreeCard.style.display = 'none';
    hideStageBubble();
    updateHUD();
    focusThing('overview');
    setMission('Dawn at the gates · five seals in Hermes’s coat');
    logCard('📖 Where we are', [
      'The five seals are home. Hermes is back at the bronze doors of Tower II.',
      'The Servant remembers how you met him. So do the doors.'
    ]);
    await sleep(1400);
    var ok = await play(extras ? extras.returnLines() : [], token);
    if (!ok) return;
    ds.stage = 'ret';
    ds.busy = false;
    setSpeaking(null);
    setMission('Fit the five seals');
    renderChoices();
    hideStageBubbleSoon(token);
  }

  var RETURN_WORDS = {
    humble: 'He bowed first, and opened the doors with his own hands. You met him with respect, and the house is yours.',
    bold: 'The doors flew open with a boom. You came hard, and he answered in kind.',
    observer: 'The doors parted in silence, exactly as far as a person needs. You looked first, and he noticed.',
    trusted: 'He held the small wicket in the left leaf, the founders’ door for the trusted. You heard his secret, and he kept faith.',
    keepers: 'The stone keepers were paid, the two halves of the Order’s sign met, and the doors opened by themselves. Nobody has seen that in fifty years.'
  };
  function showReturnCard(ending, keepers) {
    if (!decreeCard) return;
    var title = decreeCard.querySelector('.gates-decree-title span:last-child');
    var body = decreeCard.querySelector('.gates-decree-body');
    var tagsEl = decreeCard.querySelector('.gates-path-tags');
    if (tagsEl) tagsEl.innerHTML = '<span class="gpt-label">YOUR WELCOME</span>' + pathTags().filter(function (t) { return !/Shortcut|Storm/.test(t); }).concat(keepers ? ['🗿 Seal of the Two Keepers'] : []).map(function (x) { return '<span class="gpt-tag">' + x + '</span>'; }).join('');
    var icon = decreeCard.querySelector('.gates-decree-title span:first-child');
    if (icon) icon.textContent = '🚪';
    if (title) title.textContent = 'The Bronze Doors Open';
    if (body) body.textContent = (RETURN_WORDS[ending] || RETURN_WORDS.humble) + ' The inner stair is next.';
    if (btnDepart) { var lb = btnDepart.querySelector('span'); if (lb) lb.textContent = '🏛️ Go to the inner stair ➔'; }
    if (btnReplay) btnReplay.style.display = 'none';
    decreeCard.style.display = 'flex';
    if (sfx.playCelestialChime) sfx.playCelestialChime();
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
    decreeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // the story so far, as a short path name and tags that the card shows
  function pathName() {
    var f = ds.flags;
    if (f.secret) return 'trusted';
    if (ds.tone === 'bold') return f.testPassed ? 'proven' : 'stumbled';
    return ds.tone || 'humble';
  }
  function pathTags() {
    var f = ds.flags, t = [];
    t.push(ds.tone === 'humble' ? '🙏 Respectful' : ds.tone === 'bold' ? '⚔️ Bold' : '👁️ Observant');
    if (f.testPassed) t.push('🎯 Sharp eyes');
    if (f.stumbled) t.push('😓 Stumbled');
    if (f.gaveOil) t.push('🪔 Fed the fire');
    if (f.blessing) t.push('🧵 Red cord');
    if (f.recognized) t.push('🗝️ Remembered');
    if (f.secret) t.push('🔓 Secret heard');
    if (f.duel === 'won') t.push('⚖️ Won the duel');
    if (f.duel === 'lost') t.push('⚖️ Lost the duel');
    if (f.lieCaught) t.push('🪙 Caught his lie');
    if (f.angered) t.push('😠 Called him a liar');
    if (f.statues) t.push('🗿 Stone keepers');
    if (f.warned) t.push('🐪 Warned of the raiders');
    var mk = marchKindNow();
    if (mk === 'shortcut') t.push('🧭 Shortcut · ' + hoursNow() + ' h');
    if (mk === 'storm') t.push('🌪️ Storm · ' + hoursNow() + ' h');
    return t;
  }

  function completeQuestEncounter() {
    ds.stage = 'done';
    choicesBox.parentNode.style.display = 'none';
    setLs('order_gates_scene_completed', 'true');
    setLs('order_monolith_gate_seal1', 'true');
    // the road Silvia took is remembered, so later chats and replays can answer to it
    if (window.GatesRoad) window.GatesRoad.save(ds.tone || 'humble', curFlags());
    else { setLs('order_gates_path', ds.tone || 'humble'); setLs('order_gates_flags', JSON.stringify(curFlags())); }
    if (window.syncLampOil) window.syncLampOil();
    setMission('The march to Cairn II has begun');

    // Start the 12-hour march to Station 14 if not already started
    if (window.EclipseMarches && window.EclipseMarches.monolith) {
      window.EclipseMarches.monolith.start();
    }

    if (sfx.playCelestialChime) sfx.playCelestialChime();
    showVictoryDecree();

    // Refresh markers and nodes on the map
    if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
    if (window.Desert3D && typeof window.Desert3D.refresh === 'function') window.Desert3D.refresh();
  }

  function showVictoryDecree() {
    if (!decreeCard) return;
    var body = decreeCard.querySelector('.gates-decree-body');
    var tagsEl = decreeCard.querySelector('.gates-path-tags');
    var ttl = decreeCard.querySelector('.gates-decree-title span:last-child');
    if (ttl) ttl.textContent = 'The Great Circuit Decreed';
    var ico = decreeCard.querySelector('.gates-decree-title span:first-child');
    if (ico) ico.textContent = '🧭';
    var dl = btnDepart && btnDepart.querySelector('span');
    if (dl) dl.textContent = '🗺️ Return to the Grand Desert Map (Begin March) ➔';
    if (btnReplay) btnReplay.style.display = '';
    if (!tagsEl) {
      tagsEl = document.createElement('div');
      tagsEl.className = 'gates-path-tags';
      decreeCard.insertBefore(tagsEl, body);
    }
    tagsEl.innerHTML = '<span class="gpt-label">YOUR ROAD</span>' + pathTags().map(function (x) { return '<span class="gpt-tag">' + x + '</span>'; }).join('');
    var f = ds.flags, why = {
      humble: 'You met him with respect, and he answered in kind.',
      bold: 'You came hard, and he made you earn every step.',
      observer: 'You looked before you spoke, and he took note.'
    }[ds.tone || 'humble'];
    var extra = (f.gaveOil || f.lostOil ? ' Hermes has no lamp oil left, so the night walk will be dark.' : '') + (f.lieCaught ? ' You caught the Servant in his one lie, and he rewarded you with his coin.' : '') + (f.statues ? ' The stone keepers wait for a falcon and an ibis.' : '') + (f.blessing ? ' A red cord now rides on his wrist.' : '') + (f.secret ? ' You carry something the Oracle’s Servant told no one else.' : '');
    if (body) body.textContent = why + ' The first seal sits in the arch and the bronze doors stay shut until all five are home. ' + (hoursNow() === 12 ? 'Twelve' : hoursWordNow().charAt(0).toUpperCase() + hoursWordNow().slice(1)) + ' hours across the Great Erg lie ahead, 14° north-north-east' + (marchKindNow() === 'shortcut' ? ', by the Servant’s dry channel' : marchKindNow() === 'storm' ? ', with a storm on your heels' : '') + '.' + extra;
    decreeCard.style.display = 'flex';
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
    decreeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // openGatesModal({ mode: 'return', onDone }) is the welcome at the bronze doors (Station 19); with no options it is the first meeting
  function openGatesModal(opts) {
    var ret = !!(opts && opts.mode === 'return');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    var begin = function () { if (ret) startReturn(opts.onDone); else startConversation(isCompleted()); };
    if (!isSceneInitialized) {
      setTimeout(function () { setup3D(); handleResize(); begin(); }, 50);
    } else {
      handleResize();
      startLoop();
      begin();
    }
  }

  function closeGatesModal() {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    ds.token++;
    ds.busy = false;
    stopLoop();
    if (sfx.playMechanicalClick) sfx.playMechanicalClick();
  }

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeGatesModal);

  if (btnDepart) {
    btnDepart.addEventListener('click', function () {
      if (ds.mode === 'return') {
        var next = ds.onReturn; ds.onReturn = null;
        closeGatesModal();
        if (next) next();
        return;
      }
      closeGatesModal();
      // Navigate to map view and focus on Station 14 (node 23)
      if (typeof window.activateHubView === 'function') window.activateHubView('view-trail');
      if (typeof window.selectMapNode === 'function') window.selectMapNode(27, true);
    });
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', function () {
      if (sfx.playMechanicalClick) sfx.playMechanicalClick();
      startConversation(false);
    });
  }

  if (logEl) logEl.addEventListener('click', function () { ds.fast = true; });

  window.addEventListener('resize', handleResize);
  if (window.ResizeObserver && canvas) new ResizeObserver(handleResize).observe(canvas);
  window.__gates = { dlg: function () { return ds; }, render: renderChoices, pick: function (id) { return pick(id); }, fast: function () { ds.fast = true; }, world: function () { return { scene: scene, camera: camera, orbit: orbitCtl, renderer: renderer }; } };

  // Expose global launcher
  window.openGatesTowerIIModal = function (opts) { return openGatesModal(opts && opts.mode ? opts : undefined); };

})();
