    // =========================================================================
    // EclipseFigure · people worth a close-up: a sculpted head with a face painted by hand, eyes that are eyes
    // =========================================================================
    //   head(opts)            · a skull with a brow, sockets, a nose, cheekbones, lips and a chin, painted like a champion's
    //                           portrait (blush, shadow under the brow, lines of age, lips, freckles); two eyeballs with a
    //                           painted iris that turn to look; lids with lashes that close; brows that move; ears; a jaw
    //                           that carries the beard and works when he talks.
    //   face(rig)             · what plays that head: blinks, glances, surprise, worry, joy, speech.
    //   shell(rig, mask, t)   · a skin over part of that skull (a cap of hair, a close beard, a headcloth) that fits it exactly.
    //   tube(points, r, …)    · a tapering tube along a curve (a moustache, a lock of hair, a finger, a strap).
    //   strands(geo, …)       · combs a surface into locks; hairTex(…) paints the strands.
    //   hand(opts)            · a hand with a palm, four fingers of three joints and a thumb, open or closed on a grip.
    // Nothing here draws a letter, an hour or a hint.
    (function initEclipseFigure() {
      'use strict';
      var T = window.THREE;
      if (!T) return;
      var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
      var gs = function (a, s) { return Math.exp(-(a * a) / (2 * s * s)); };
      var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
      var reduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
      function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
      function hexCss(h) { return '#' + ('000000' + (h >>> 0).toString(16)).slice(-6); }
      function rgba(h, a) { return 'rgba(' + ((h >> 16) & 255) + ',' + ((h >> 8) & 255) + ',' + (h & 255) + ',' + a + ')'; }
      function mixHex(a, b, t) {
        var r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t), g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t), bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
        return (r << 16) | (g << 8) | bl;
      }
      function canvasTex(w, h, draw) {
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        draw(cv.getContext('2d'), w, h);
        var t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.anisotropy = 8;
        return t;
      }
      function mat(opts, rimColor, rimK) {
        var P = window.EclipsePaint || {};
        var m = P.toonSoft ? P.toonSoft(opts) : new T.MeshToonMaterial(opts);
        if (rimColor != null && P.rim) P.rim(m, rimColor, rimK == null ? 0.25 : rimK);
        return m;
      }

      // ---------------------------------------------------------------- the skull
      // A direction on the unit sphere (the face looks down -z) → a point of the head. Every feature is a soft bump or
      // a soft dent placed by direction, so the paint (laid out by direction too) always falls on the right flesh.
      function sculptor(o) {
        var nose = o.nose == null ? 1 : o.nose, jaw = o.jaw == null ? 0.5 : o.jaw, brow = o.ridge == null ? 1 : o.ridge, cheek = o.cheek == null ? 1 : o.cheek, lips = o.lips == null ? 1 : o.lips;
        return function (nx, ny, nz, out) {
          var x = nx * 0.86, y = ny * 1.1, z = nz * 0.98;
          var low = clamp(-ny, 0, 1), ax = Math.abs(nx), front = smooth(0.0, 0.55, -nz);
          x *= 1 - (0.3 - 0.2 * jaw) * Math.pow(low, 1.5);                       // the jaw narrows to the chin
          if (nz > 0) z *= 1 - 0.12 * low * low;                                 // the nape tucks in
          y -= 0.04 * gs(ny + 1, 0.3);
          var F = 0;
          F += 0.14 * gs(ny + 0.8, 0.15) * gs(nx, 0.24);
          F += 0.05 * gs(ax - 0.62, 0.1) * gs(ny + 0.62, 0.12);                   // the corner of the jaw                          // chin
          F += 0.085 * brow * gs(ny - 0.3, 0.08) * gs(nx, 0.6) * (1 - 0.4 * gs(nx, 0.09));   // brow ridge, split over the nose
          F -= 0.13 * gs(ax - 0.37, 0.17) * gs(ny - 0.11, 0.1);                // eye sockets
          F += nose * (0.13 * gs(ny - 0.0, 0.2) * gs(nx, 0.08)                  // bridge
            + 0.2 * gs(ny + 0.17, 0.1) * gs(nx, 0.105)                         // tip
            + 0.1 * gs(ax - 0.115, 0.048) * gs(ny + 0.235, 0.048));               // wings
          F += 0.085 * cheek * gs(ax - 0.52, 0.16) * gs(ny + 0.1, 0.13);           // cheekbones
          F -= 0.035 * gs(ax - 0.45, 0.16) * gs(ny + 0.42, 0.18);                 // hollow of the cheek
          F += lips * (0.055 * gs(nx, 0.2) * gs(ny + 0.46, 0.04) + 0.05 * gs(nx, 0.16) * gs(ny + 0.565, 0.04) - 0.03 * gs(nx, 0.22) * gs(ny + 0.512, 0.018));
          F -= 0.03 * gs(nx, 0.1) * gs(ny + 0.66, 0.05);                          // the dip over the chin
          F += 0.03 * gs(ny - 0.62, 0.2) * gs(nx, 0.5);                           // forehead
          z -= F * front;
          x += Math.sign(nx) * 0.02 * gs(ax - 0.75, 0.2) * gs(ny - 0.25, 0.3);    // temples
          return out.set(x, y, z);
        };
      }
      // where a point of the face (by direction) falls on the painted skin: [x, y] in pixels
      function onSkin(nx, ny, W, H) {
        var th = Math.acos(clamp(ny, -1, 1)), s = Math.max(1e-4, Math.sin(th));
        return [(0.75 - Math.asin(clamp(nx / s, -1, 1)) / (Math.PI * 2)) * W, th / Math.PI * H];
      }

      // ---------------------------------------------------------------- the paint
      function skinTexture(o) {
        var W = 1024, H = 512, U = W / (Math.PI * 2);
        var skin = o.skin, shade = o.shade, light = o.light, blush = o.blush, lip = o.lip, age = o.age, r = rng(o.seed || 7);
        return canvasTex(W, H, function (g) {
          var blob = function (nx, ny, rx, ry, color, a) {
            var p = onSkin(nx, ny, W, H);
            g.save(); g.translate(p[0], p[1]); g.scale(rx * U, ry * U);
            var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
            gr.addColorStop(0, rgba(color, a)); gr.addColorStop(0.55, rgba(color, a * 0.55)); gr.addColorStop(1, rgba(color, 0));
            g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
          };
          var line = function (pts, color, a, w, blur) {
            g.save(); g.strokeStyle = rgba(color, a); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
            if (blur) { g.shadowColor = rgba(color, a); g.shadowBlur = blur; }
            g.beginPath();
            pts.forEach(function (q, i) { var p = onSkin(q[0], q[1], W, H); if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); });
            g.stroke(); g.restore();
          };
          var both = function (fn) { fn(-1); fn(1); };
          g.fillStyle = hexCss(skin); g.fillRect(0, 0, W, H);
          // the light falls from above: a pale brow, a ruddy middle, a darker jaw
          var gr = g.createLinearGradient(0, 0, 0, H);
          gr.addColorStop(0, rgba(light, 0.22)); gr.addColorStop(0.4, rgba(light, 0)); gr.addColorStop(0.6, rgba(blush, 0.16)); gr.addColorStop(0.8, rgba(shade, 0.5)); gr.addColorStop(1, rgba(shade, 0.85));
          g.fillStyle = gr; g.fillRect(0, 0, W, H);
          // brush grain
          for (var i = 0; i < 2600; i++) {
            g.fillStyle = r() < 0.5 ? rgba(shade, 0.05) : rgba(light, 0.06);
            var bx = r() * W, by = r() * H; g.fillRect(bx, by, 2 + r() * 9, 1 + r() * 3);
          }
          blob(0, 0.6, 0.4, 0.22, light, 0.22);                                   // forehead
          blob(0, 0.95, 1.2, 0.3, shade, 0.4);
          both(function (s) {
            blob(s * 0.37, 0.13, 0.27, 0.17, shade, 0.8);                         // socket
            blob(s * 0.2, 0.14, 0.1, 0.12, mixHex(shade, 0x30142a, 0.4), 0.5);     // the deep corner by the nose
            blob(s * 0.36, 0.215, 0.24, 0.07, mixHex(shade, 0x2a1020, 0.4), 0.42); // under the brow
            blob(s * 0.35, 0.0, 0.2, 0.06, mixHex(shade, 0x5a3050, 0.35), 0.2 + 0.3 * age);   // under the eye
            blob(s * 0.47, -0.17, 0.26, 0.2, blush, 0.68);                         // cheek
            blob(s * 0.52, -0.02, 0.16, 0.08, light, 0.28);                        // cheekbone catches the light
            blob(s * 0.115, -0.07, 0.045, 0.18, shade, 0.4);                       // side of the nose
            blob(s * 0.08, -0.275, 0.032, 0.026, 0x2a0f0a, 0.75);                  // nostril
            blob(s * 0.13, -0.235, 0.05, 0.045, blush, 0.3);
            blob(s * 0.6, -0.42, 0.22, 0.2, shade, 0.5);                           // under the cheekbone
            blob(s * 0.75, -0.6, 0.3, 0.3, shade, 0.45);                           // along the jaw
            line([[s * 0.15, -0.22], [s * 0.22, -0.33], [s * 0.28, -0.45], [s * 0.29, -0.55]], shade, 0.22 + 0.3 * age, 3, 6);   // the fold from nose to mouth
            blob(s * 0.98, 0.02, 0.2, 0.3, blush, 0.3);                            // ear side
          });
          blob(0, -0.19, 0.12, 0.1, blush, 0.62);                                  // nose tip
          blob(0, -0.02, 0.03, 0.2, light, 0.42);                                  // bridge
          blob(0, -0.175, 0.04, 0.035, light, 0.5);
          blob(0, -0.385, 0.05, 0.05, shade, 0.3);                                 // philtrum
          blob(0, -0.82, 0.16, 0.1, light, 0.25);                                  // chin
          blob(0, -0.67, 0.2, 0.045, shade, 0.3);
          // lips
          g.save();
          var lp = function (nx, ny) { return onSkin(nx, ny, W, H); };
          var a0 = lp(-0.2, -0.508), a1 = lp(-0.08, -0.455), a2 = lp(0, -0.468), a3 = lp(0.08, -0.455), a4 = lp(0.2, -0.508);
          g.fillStyle = rgba(mixHex(lip, shade, 0.25), 0.9);
          g.beginPath(); g.moveTo(a0[0], a0[1]); g.quadraticCurveTo(a1[0], a1[1] - 3, a2[0], a2[1]); g.quadraticCurveTo(a3[0], a3[1] - 3, a4[0], a4[1]);
          var m = lp(0, -0.515); g.quadraticCurveTo(m[0], m[1] + 3, a0[0], a0[1]); g.fill();
          var b1 = lp(0, -0.61);
          g.fillStyle = rgba(lip, 0.9);
          g.beginPath(); g.moveTo(a4[0], a4[1]); g.quadraticCurveTo(b1[0], b1[1] + 6, a0[0], a0[1]); g.quadraticCurveTo(m[0], m[1] + 3, a4[0], a4[1]); g.fill();
          g.restore();
          blob(0, -0.565, 0.07, 0.022, 0xffffff, 0.3);                             // the lower lip shines
          line([[-0.215, -0.5], [-0.1, -0.514], [0, -0.51], [0.1, -0.514], [0.215, -0.5]], 0x3a1410, 0.8, 2.2, 2);
          both(function (s) { blob(s * 0.225, -0.5, 0.03, 0.03, shade, 0.5); });
          // age: lines on the brow, between the brows, at the corners of the eyes
          if (age > 0.05) {
            [0.5, 0.6, 0.7].forEach(function (y, k) { line([[-0.36, y - 0.02], [-0.15, y + 0.012], [0.12, y + 0.004], [0.36, y - 0.02]], shade, 0.2 * age + 0.06 * age * k, 2, 3); });
            both(function (s) {
              line([[s * 0.06, 0.3], [s * 0.05, 0.42]], shade, 0.4 * age, 2, 3);
              [[0.63, 0.17], [0.65, 0.12], [0.63, 0.07]].forEach(function (e) { line([[s * 0.56, 0.12], [s * e[0], e[1]]], shade, 0.35 * age, 1.6, 2); });
              line([[s * 0.2, 0.01], [s * 0.36, -0.035], [s * 0.5, 0.0]], shade, 0.3 * age, 1.6, 3);
            });
          }
          // freckles and sun
          for (var k2 = 0; k2 < 90; k2++) {
            var fx = (r() - 0.5) * 1.3, fy = -0.3 + r() * 0.8, p2 = onSkin(fx, fy, W, H);
            g.fillStyle = rgba(mixHex(shade, 0x5a2a10, 0.5), 0.1 + r() * 0.12); g.beginPath(); g.arc(p2[0], p2[1], 0.8 + r() * 1.8, 0, 7); g.fill();
          }
          // a shaven jaw still shows its shadow
          if (o.stubble != null) {
            for (var k3 = 0; k3 < 5200; k3++) {
              var sx = (r() - 0.5) * 1.9, sy = -0.2 - r() * 0.75;
              var keep = (Math.abs(sx) > 0.3 || sy < -0.6 || (sy < -0.3 && sy > -0.46)) && !(Math.abs(sx) < 0.22 && sy < -0.47 && sy > -0.6);
              if (!keep) continue;
              var p3 = onSkin(sx, sy, W, H);
              g.fillStyle = rgba(o.stubble, 0.22 + r() * 0.3); g.fillRect(p3[0], p3[1], 1.2, 1.6 + r() * 1.6);
            }
            both(function (s) { blob(s * 0.5, -0.6, 0.4, 0.35, o.stubble, 0.28); });
            blob(0, -0.86, 0.3, 0.16, o.stubble, 0.3);
          }
          if (o.kohl) both(function (s) { blob(s * 0.36, 0.115, 0.2, 0.075, 0x1a0c0a, 0.5); });
        });
      }
      // sclera, a coloured iris with its spokes and its dark rim, a pupil and two points of light. The iris sits where
      // the ball looks (-z).
      function eyeTexture(irisHex, seed) {
        return canvasTex(256, 128, function (g, w, h) {
          var cx = w * 0.75, cy = h * 0.5, R = 27, r = rng(seed || 3);
          g.fillStyle = '#f6efe4'; g.fillRect(0, 0, w, h);
          var gr = g.createRadialGradient(cx, cy, R, cx, cy, 86);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(206,150,140,0.65)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          var top = g.createLinearGradient(0, cy - 44, 0, cy);
          top.addColorStop(0, 'rgba(60,30,40,0.5)'); top.addColorStop(1, 'rgba(60,30,40,0)');
          g.fillStyle = top; g.fillRect(0, 0, w, cy);                               // the lid's shadow
          g.fillStyle = hexCss(mixHex(irisHex, 0x000000, 0.72)); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
          var ig = g.createRadialGradient(cx, cy + 5, 3, cx, cy, R - 2);
          ig.addColorStop(0, hexCss(mixHex(irisHex, 0xffffff, 0.45))); ig.addColorStop(0.6, hexCss(irisHex)); ig.addColorStop(1, hexCss(mixHex(irisHex, 0x000000, 0.45)));
          g.fillStyle = ig; g.beginPath(); g.arc(cx, cy, R - 2.5, 0, 7); g.fill();
          for (var i = 0; i < 46; i++) {
            var a = r() * Math.PI * 2;
            g.strokeStyle = r() < 0.5 ? rgba(mixHex(irisHex, 0xffffff, 0.6), 0.5) : rgba(mixHex(irisHex, 0x000000, 0.6), 0.45); g.lineWidth = 1;
            g.beginPath(); g.moveTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); g.lineTo(cx + Math.cos(a) * (R - 4), cy + Math.sin(a) * (R - 4)); g.stroke();
          }
          g.fillStyle = '#0a0606'; g.beginPath(); g.arc(cx, cy, 10, 0, 7); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.96)'; g.beginPath(); g.arc(cx - 8, cy - 9, 5, 0, 7); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(cx + 9, cy + 8, 2.4, 0, 7); g.fill();
        });
      }
      // strands that run down the surface: dark at the root, bright where the light combs them
      function hairTex(base, o) {
        o = o || {};
        var dark = o.dark == null ? mixHex(base, 0x000000, 0.45) : o.dark, light = o.light == null ? mixHex(base, 0xffffff, 0.5) : o.light, r = rng(o.seed || 11);
        var t = canvasTex(256, 256, function (g, w, h) {
          g.fillStyle = hexCss(base); g.fillRect(0, 0, w, h);
          var gr = g.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, rgba(light, 0.25)); gr.addColorStop(0.5, rgba(base, 0)); gr.addColorStop(1, rgba(dark, 0.5));
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          // broad locks first, fine hairs over them
          for (var b = 0; b < 26; b++) { var lx = r() * w; g.fillStyle = rgba(dark, 0.12 + r() * 0.2); g.fillRect(lx, 0, 4 + r() * 12, h); }
          for (var i = 0; i < 640; i++) {
            var x = r() * w, y = r() * h - 30, l = 50 + r() * 140, d = r();
            g.strokeStyle = d < 0.5 ? rgba(dark, 0.4 + r() * 0.35) : rgba(light, 0.3 + r() * 0.45); g.lineWidth = 0.8 + r() * 2.6;
            g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + (r() - 0.5) * 12, y + l * 0.3, x + (r() - 0.5) * 16, y + l * 0.7, x + (r() - 0.5) * 12, y + l); g.stroke();
          }
        });
        t.wrapS = t.wrapT = T.RepeatWrapping;
        if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1]);
        return t;
      }

      // ---------------------------------------------------------------- geometry helpers
      // A tube along a curve whose radius changes on the way (radius(u) with u 0…1) and may be flattened (flat < 1).
      function tube(points, radius, o) {
        o = o || {};
        var seg = o.segments || 14, rad = o.radial || 8, flat = o.flat == null ? 1 : o.flat;
        var curve = new T.CatmullRomCurve3(points.map(function (p) { return p.isVector3 ? p : new T.Vector3(p[0], p[1], p[2]); }));
        var geo = new T.TubeGeometry(curve, seg, 1, rad, false), P = geo.attributes.position, c = new T.Vector3(), v = new T.Vector3();
        var fr = curve.computeFrenetFrames(seg, false);
        for (var i = 0; i <= seg; i++) {
          var u = i / seg, r = typeof radius === 'function' ? radius(u) : radius;
          curve.getPointAt(u, c);
          for (var j = 0; j <= rad; j++) {
            var k = i * (rad + 1) + j;
            v.fromBufferAttribute(P, k).sub(c);
            var a = v.dot(fr.normals[i]), b = v.dot(fr.binormals[i]);
            v.copy(c).addScaledVector(fr.normals[i], a * r).addScaledVector(fr.binormals[i], b * r * flat);
            P.setXYZ(k, v.x, v.y, v.z);
          }
        }
        geo.computeVertexNormals();
        return geo;
      }
      // Combs a surface into locks: ridges that follow its v direction, deeper toward the tips. Reads the uv.
      function strands(geo, o) {
        o = o || {};
        var k = o.count || 16, amp = o.depth == null ? 0.04 : o.depth, P = geo.attributes.position, N = geo.attributes.normal, UV = geo.attributes.uv, twist = o.twist || 0, seed = o.seed || 0;
        if (!N) { geo.computeVertexNormals(); N = geo.attributes.normal; }
        for (var i = 0; i < P.count; i++) {
          var u = UV.getX(i), v = UV.getY(i), tip = o.fromTop ? 1 - v : v;
          var w = Math.sin((u + twist * tip) * Math.PI * 2 * k + seed) * 0.6 + Math.sin((u - twist * 0.5 * tip) * Math.PI * 2 * k * 2.3 + seed * 1.7 + 1.3) * 0.4;
          var d = amp * w * (0.35 + 0.65 * tip);
          P.setXYZ(i, P.getX(i) + N.getX(i) * d, P.getY(i) + N.getY(i) * d, P.getZ(i) + N.getZ(i) * d);
        }
        geo.computeVertexNormals();
        return geo;
      }

      // Every mesh under a group (all of one material) as a single geometry in the group's own space: a hand of fifteen
      // pieces, a beard of four, drawn once.
      function flatten(group) {
        group.updateMatrixWorld(true);
        var inv = new T.Matrix4().copy(group.matrixWorld).invert(), m4 = new T.Matrix4(), nm = new T.Matrix3(), v = new T.Vector3();
        var pos = [], nor = [], uv = [], idx = [], base = 0;
        group.traverse(function (o) {
          if (!o.isMesh) return;
          var g = o.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
          m4.multiplyMatrices(inv, o.matrixWorld); nm.getNormalMatrix(m4);
          for (var i = 0; i < P.count; i++) {
            v.fromBufferAttribute(P, i).applyMatrix4(m4); pos.push(v.x, v.y, v.z);
            v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z);
            uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0);
          }
          if (g.index) for (var j = 0; j < g.index.count; j++) idx.push(g.index.getX(j) + base); else for (var k = 0; k < P.count; k++) idx.push(base + k);
          base += P.count;
        });
        var geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
        return geo;
      }

      // ---------------------------------------------------------------- the head
      // head(opts) → rig { group, skull, eyes, jaw, mouth, point(nx, ny, lift), sculpt, skinMat, plainMat }
      //   opts: size (world radius of the skull), skin/shade/light/blush/lip colours, age 0…1, iris, brow { color, thick },
      //   nose, jaw, cheek, lips, ridge (shape), stubble (colour), kohl, material (a stone face: no paint, no life), seed
      function head(o) {
        o = o || {};
        var size = o.size || 0.145, stone = o.material || null;
        var skin = o.skin == null ? 0xe9b08c : o.skin, shade = o.shade == null ? mixHex(skin, 0x6a2a2a, 0.5) : o.shade;
        var light = o.light == null ? mixHex(skin, 0xfff2dc, 0.6) : o.light, blush = o.blush == null ? mixHex(skin, 0xd8553e, 0.55) : o.blush, lip = o.lip == null ? mixHex(skin, 0xb04a40, 0.6) : o.lip;
        var age = o.age == null ? 0.5 : o.age;
        var S = sculptor(o), v = new T.Vector3(), n = new T.Vector3();
        var group = new T.Group(); group.scale.setScalar(size);
        var SW = stone ? 56 : (o.detail || 96), SH = stone ? 40 : Math.round((o.detail || 96) * 0.7);
        var geo = new T.SphereGeometry(1, SW, SH), P = geo.attributes.position;
        for (var i = 0; i < P.count; i++) { n.fromBufferAttribute(P, i).normalize(); S(n.x, n.y, n.z, v); P.setXYZ(i, v.x, v.y, v.z); }
        geo.computeVertexNormals();
        // the seam of the sphere would show as a crease: give both edges the same normal
        var N = geo.attributes.normal, cols = SW + 1;
        for (var row = 0; row <= SH; row++) {
          var a = row * cols, b = a + SW, mx = (N.getX(a) + N.getX(b)) / 2, my = (N.getY(a) + N.getY(b)) / 2, mz = (N.getZ(a) + N.getZ(b)) / 2, ml = Math.hypot(mx, my, mz) || 1;
          N.setXYZ(a, mx / ml, my / ml, mz / ml); N.setXYZ(b, mx / ml, my / ml, mz / ml);
        }
        var skinMat = stone || mat({ map: skinTexture({ skin: skin, shade: shade, light: light, blush: blush, lip: lip, age: age, stubble: o.stubble, kohl: o.kohl, seed: o.seed }), emissive: mixHex(blush, 0x000000, 0.55), emissiveIntensity: 0.22 }, 0xffd2a8, 0.32);
        var plainMat = stone || mat({ color: mixHex(mixHex(skin, shade, 0.55), blush, 0.15), emissive: mixHex(blush, 0x000000, 0.6), emissiveIntensity: 0.2 }, 0xffd2a8, 0.28);
        var skull = new T.Mesh(geo, skinMat); skull.castShadow = true; skull.receiveShadow = true; if (!stone) skull.userData.live = true; group.add(skull);
        // a point of the face by direction, lifted off the skin
        function point(nx, ny, lift, out) {
          var nz = -Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          out = S(nx, ny, nz, out || new T.Vector3());
          if (lift) out.z -= lift;
          return out;
        }
        var rig = { group: group, skull: skull, eyes: [], jaw: null, mouth: null, point: point, sculpt: S, skinMat: skinMat, plainMat: plainMat, size: size, stone: !!stone };

        // ---- eyes: a ball that turns in its socket, an upper lid with lashes that closes over it, a lower lid
        var ER = 0.2;
        var eyeMat = stone || new T.MeshBasicMaterial({ map: eyeTexture(o.iris == null ? 0x5f86b4 : o.iris, o.seed) });
        var lashMat = stone || new T.MeshBasicMaterial({ color: o.lash == null ? 0x1e120e : o.lash });
        var browMat = stone || mat({ map: hairTex((o.brow && o.brow.color) == null ? 0x4a3020 : o.brow.color, { seed: 5, repeat: [1, 1] }) }, 0xffffff, 0.3);
        [-1, 1].forEach(function (sd) {
          var c = point(sd * 0.37, 0.11, 0); c.z += 0.14;
          var eye = new T.Group(); eye.position.copy(c); group.add(eye);
          var ball = new T.Mesh(new T.SphereGeometry(ER, 20, 14), eyeMat); if (!stone) ball.userData.live = true; eye.add(ball);
          var lid = new T.Mesh(new T.SphereGeometry(ER * 1.07, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), plainMat); if (!stone) lid.userData.live = true; eye.add(lid);
          var lash = new T.Mesh(new T.TorusGeometry(ER * 1.075, 0.014, 6, 22, Math.PI), lashMat); lash.rotation.x = -Math.PI / 2; lid.add(lash);
          var lower = new T.Mesh(new T.SphereGeometry(ER * 1.06, 24, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), plainMat); if (!stone) lower.userData.live = true; eye.add(lower);
          // the brow: thick over the nose, thin at the temple, on its own pivot
          var th = (o.brow && o.brow.thick) || 1;
          var bp = point(sd * 0.37, 0.335, 0.035), pv = new T.Group(); pv.position.copy(bp); group.add(pv);
          var pts = [[0.11, 0.29], [0.24, 0.335], [0.4, 0.35], [0.56, 0.32], [0.66, 0.26]].map(function (q) { return point(sd * q[0], q[1], 0.03 + 0.02 * th).sub(bp); });
          var bg = tube(pts, function (u) { return (0.062 - 0.045 * u) * th * (0.6 + 0.4 * Math.sin(Math.min(1, u * 5) * Math.PI / 2)); }, { segments: 12, radial: 8, flat: 0.55 });
          strands(bg, { count: 3, depth: 0.012 * th });
          var brow = new T.Mesh(bg, browMat); if (!stone) brow.userData.live = true; pv.add(brow);
          rig.eyes.push({ sd: sd, eye: eye, ball: ball, lid: lid, lower: lower, brow: pv });
          // ear
          var ear = new T.Mesh(new T.SphereGeometry(0.2, 16, 12), plainMat); ear.scale.set(0.28, 0.9, 0.55);
          S(sd * 0.995, 0.02, 0.1, v); ear.position.set(v.x + sd * 0.02, v.y + 0.02, v.z); ear.rotation.set(0, sd * -0.35, sd * -0.12); ear.castShadow = true; group.add(ear);
          var lobe = new T.Mesh(new T.SphereGeometry(0.1, 10, 8), plainMat); lobe.scale.set(0.3, 0.75, 0.5);
          lobe.position.set(ear.position.x + sd * 0.035, ear.position.y + 0.03, ear.position.z - 0.03); lobe.rotation.copy(ear.rotation); group.add(lobe);
        });
        // ---- the jaw carries whatever grows on it, and works when he speaks
        var jaw = new T.Group(); jaw.position.set(0, -0.3, 0.25); group.add(jaw); rig.jaw = jaw;
        if (!stone && o.mouth !== false) {
          var mp = point(0, -0.512, 0.006);
          var mouth = new T.Mesh(new T.CircleGeometry(1, 20), new T.MeshBasicMaterial({ color: 0x2a0d0c }));
          mouth.position.copy(mp); mouth.rotation.y = Math.PI; mouth.scale.set(0.15, 0.01, 1); mouth.visible = false; mouth.userData.live = true; group.add(mouth);
          rig.mouth = mouth;
        }
        return rig;
      }

      // A skin over part of the skull (hair, a close beard, a cloth): mask(nx, ny, nz) → 0…1 says where it lies and how
      // thick; it follows every bump underneath. opts: thick, segs [w, h], ridges { count, depth }
      function shell(rig, mask, o) {
        o = o || {};
        var W = (o.segs && o.segs[0]) || 72, H = (o.segs && o.segs[1]) || 52, thick = o.thick == null ? 0.05 : o.thick;
        var S = rig.sculpt, pos = [], uv = [], idx = [], keep = [], v = new T.Vector3(), v2 = new T.Vector3(), nrm = new T.Vector3();
        for (var j = 0; j <= H; j++) for (var i = 0; i <= W; i++) {
          var ph = i / W * Math.PI * 2, th = j / H * Math.PI;
          var nx = -Math.cos(ph) * Math.sin(th), ny = Math.cos(th), nz = Math.sin(ph) * Math.sin(th);
          var m = mask(nx, ny, nz);
          S(nx, ny, nz, v);
          nrm.set(nx * 0.9, ny * 0.8, nz).normalize();
          // the edge sinks a little into the skin, so the border is the clean line where the two surfaces meet
          var lift = thick * Math.max(0, m) - (o.sink == null ? 0.014 : o.sink);
          if (o.ridges && m > 0) lift += o.ridges.depth * (0.6 * Math.sin(ph * o.ridges.count + ny * (o.ridges.swirl || 0)) + 0.4 * Math.sin(ph * o.ridges.count * 2.3 + 1.3)) * Math.min(1, m);
          v2.copy(v).addScaledVector(nrm, lift);
          pos.push(v2.x, v2.y, v2.z); uv.push(i / W * (o.uvRepeat || 1), 1 - j / H); keep.push(m > 0.02);
        }
        for (var b = 0; b < H; b++) for (var a = 0; a < W; a++) {
          var i0 = b * (W + 1) + a, i1 = i0 + 1, i2 = i0 + W + 1, i3 = i2 + 1;
          if (keep[i0] || keep[i1] || keep[i2] || keep[i3]) idx.push(i0, i2, i1, i1, i2, i3);
        }
        var geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
        geo.computeVertexNormals();
        return geo;
      }


      // ---------------------------------------------------------------- hair and beards
      // hair(rig, opts) → a mesh on the skull: a cap of combed hair with its own hairline.
      //   opts: mat, front (how high the hairline sits on the brow, 0.5 low … 0.9 receding), temples (how far they
      //   recede), side (how low it comes by the ear), nape, thick, count/depth (the locks)
      function hair(rig, o) {
        o = o || {};
        var front = o.front == null ? 0.7 : o.front, temples = o.temples == null ? 0.12 : o.temples, side = o.side == null ? 0.12 : o.side, nape = o.nape == null ? -0.6 : o.nape;
        var geo = shell(rig, function (nx, ny, nz) {
          var ax = Math.abs(nx), back = smooth(-0.35, 0.25, nz);
          // the hairline: high on the brow, higher still at the temples, then down behind the ear to the nape
          var line = (front + temples * gs(ax - 0.45, 0.16)) * (1 - back) + (side + (nape - side) * smooth(0.1, 0.75, nz)) * back;
          return smooth(0, 0.14, ny - line);
        }, { thick: o.thick == null ? 0.1 : o.thick, segs: [84, 50], ridges: { count: o.count || 30, depth: o.depth == null ? 0.022 : o.depth, swirl: o.swirl || 2.5 }, uvRepeat: 3 });
        var m = new T.Mesh(geo, o.mat); m.castShadow = true; m.userData.live = true; rig.group.add(m);
        return m;
      }
      // beard(rig, opts) → a Group on the jaw (it works with it): whiskers that fit the cheeks and the chin, a moustache
      // in two wings, and (length > 0) a mass that hangs from the chin.
      //   opts: mat, cheek (how high it climbs, default -0.2), thick, length (0 … 2.5 in skulls), width, moustache (0 … 1.5),
      //   fork (a beard that ends in two points)
      function beard(rig, o) {
        o = o || {};
        var g = new T.Group(), jaw = rig.jaw, m = o.mat, top = o.cheek == null ? -0.2 : o.cheek, off = jaw.position;
        var put = function (mesh) { mesh.position.sub(off); g.add(mesh); return mesh; };
        var whiskers = shell(rig, function (nx, ny, nz) {
          var ax = Math.abs(nx);
          if (nz > 0.5) return 0;
          var lip = gs(nx, 0.2) * gs(ny + 0.53, 0.085);                               // the mouth stays clear
          var cheekLine = top - 0.28 * gs(ax - 0.3, 0.2);                             // it dips under the cheekbone
          return smooth(0, 0.16, cheekLine - ny) * (1 - smooth(0.3, 0.5, nz)) * (1 - Math.min(1, lip * 1.6));
        }, { thick: o.thick == null ? 0.1 : o.thick, segs: rig.stone ? [56, 34] : [84, 50], ridges: { count: 34, depth: 0.02, swirl: 0 }, uvRepeat: 4 });
        put(new T.Mesh(whiskers, m));
        var mo = o.moustache == null ? 1 : o.moustache;
        if (mo > 0) [-1, 1].forEach(function (sd) {
          var a = rig.point(sd * 0.035, -0.4, 0.07), b = rig.point(sd * 0.2, -0.455, 0.09), c = rig.point(sd * 0.36, -0.56, 0.06), d = rig.point(sd * 0.44, -0.68 - 0.1 * mo, 0.03);
          var geo = tube([a, b, c, d], function (u) { return (0.085 - 0.065 * u) * (0.75 + 0.35 * mo) * (0.55 + 0.45 * Math.sin(Math.min(1, u * 4) * Math.PI / 2)); }, { segments: 14, radial: 10, flat: 0.7 });
          strands(geo, { count: 4, depth: 0.014, twist: 0.3 });
          put(new T.Mesh(geo, m));
        });
        var len = o.length || 0;
        if (len > 0) {
          var w = o.width == null ? 0.8 : o.width, geo2 = new T.SphereGeometry(1, 40, 28), P = geo2.attributes.position;
          for (var i = 0; i < P.count; i++) {
            var x = P.getX(i), y = P.getY(i), z = P.getZ(i), d2 = Math.max(0, -y);
            var taper = 1 - 0.78 * Math.pow(d2, 2.0);
            if (o.fork) x += Math.sign(x) * 0.25 * d2 * d2;
            x *= w * taper; z *= 0.5 * taper * (z > 0 ? 0.6 : 1);
            y = y > 0 ? y * 0.42 : y * len;
            z -= 0.16 * d2 * d2 * len * 0.5;                                          // the tip curls forward
            P.setXYZ(i, x, y, z);
          }
          geo2.computeVertexNormals();
          strands(geo2, { count: 11, depth: 0.06, fromTop: true, twist: 0.05 });
          var chin = rig.point(0, -0.8, 0), mass = new T.Mesh(geo2, m);
          mass.position.set(0, chin.y - 0.02 - (o.drop || 0), chin.z + 0.2 - (o.forward || 0));
          mass.rotation.x = o.drape == null ? 0.3 : o.drape;                          // it lies forward over the chest
          put(mass);
        }
        // one mesh for the whole beard
        var whole = new T.Mesh(flatten(g), m); whole.castShadow = true; whole.userData.live = true;
        jaw.add(whole);
        return whole;
      }

      // ---------------------------------------------------------------- the play of the face
      // face(rig) → { update(dt), blink(), mood(surprise, worry, joy), gaze(x, y), talk(on) }
      function face(rig) {
        var eyes = rig.eyes || [], live = !rig.stone;
        var OPEN = 0.3, SHUT = -0.4, LOW = -0.42;
        eyes.forEach(function (e) { e.by = e.brow.position.y; e.lid.rotation.x = OPEN; e.lower.rotation.x = LOW; });
        if (rig.stone) eyes.forEach(function (e) { e.lid.rotation.x = 0.15; });
        var jawX = rig.jaw ? rig.jaw.rotation.x : 0;
        var next = 1 + Math.random() * 3, b = 0, ph = 0, dbl = false, sur = 0, wor = 0, joy = 0, gx = 0, gy = 0, tx = 0, ty = 0, sx = 0, sy = 0, sacT = 0, talking = false, sp = 0, t = Math.random() * 9;
        var calm = reduced();
        return {
          blink: function () { if (!ph) ph = 1; },
          mood: function (surprise, worry, j) { sur = Math.max(sur, surprise || 0); wor = Math.max(wor, worry || 0); joy = Math.max(joy, j || 0); },
          gaze: function (x, y) { tx = x || 0; ty = y || 0; },
          talk: function (on) { talking = !!on; },
          update: function (dt) {
            if (!live || !(dt > 0)) return;
            t += dt;
            next -= dt;
            if (next <= 0 && !ph) { ph = 1; next = 2.2 + Math.random() * 4.4; dbl = Math.random() < 0.2; }
            if (ph === 1) { b += dt / 0.055; if (b >= 1) { b = 1; ph = 2; } }
            else if (ph === 2) { b -= dt / 0.12; if (b <= 0) { b = 0; ph = 0; if (dbl) { dbl = false; next = 0.09; } } }
            sacT -= dt;
            if (sacT <= 0) { sacT = 0.6 + Math.random() * 2.4; sx = calm ? 0 : (Math.random() - 0.5) * 0.36; sy = calm ? 0 : (Math.random() - 0.5) * 0.2; }
            gx += (clamp(tx + sx, -1, 1) - gx) * Math.min(1, dt * 18);
            gy += (clamp(ty + sy, -1, 1) - gy) * Math.min(1, dt * 18);
            var fade = Math.exp(-dt * 0.9); sur *= fade; wor *= fade; joy *= fade;
            sp += ((talking ? 1 : 0) - sp) * Math.min(1, dt * 9);
            // syllables: the mouth opens and shuts some six times a second, never twice the same
            var syl = sp * Math.max(0, 0.55 * Math.sin(t * 19) + 0.45 * Math.sin(t * 11.3 + 1) + 0.25) * (0.6 + 0.4 * Math.sin(t * 3.1));
            for (var i = 0; i < eyes.length; i++) {
              var e = eyes[i];
              e.ball.rotation.y = -gx * 0.5; e.ball.rotation.x = -gy * 0.32;
              // the lid follows the eye, opens wide with surprise, narrows with worry and with a smile
              var open = OPEN + 0.2 * sur - 0.16 * wor - 0.14 * joy - gy * 0.16;
              e.lid.rotation.x = open + (SHUT - open) * b;
              e.lower.rotation.x = LOW + 0.22 * joy + 0.1 * wor + 0.12 * b - 0.06 * sur;
              e.brow.position.y = e.by + 0.085 * sur - 0.05 * wor + 0.02 * joy - 0.025 * b + 0.012 * syl;
              e.brow.rotation.z = e.sd * (0.3 * wor - 0.16 * sur - 0.05 * joy);
            }
            if (rig.jaw) rig.jaw.rotation.x = jawX + 0.07 * syl + 0.05 * sur;
            if (rig.mouth) { var mo = Math.max(syl * 0.07, sur * 0.045); rig.mouth.visible = mo > 0.004; rig.mouth.scale.set(0.13 + 0.03 * joy - 0.02 * syl, mo, 1); }
          }
        };
      }

      // ---------------------------------------------------------------- hands
      // hand(opts) → Group (the wrist at its origin, the fingers pointing down -y, the palm facing -z)
      //   opts: mat, size (default 1 ≈ a palm 0.1 wide), curl 0…1 (0 open, 1 closed on a grip), side (+1 right, -1 left)
      function hand(o) {
        o = o || {};
        var m = o.mat, s = o.size || 1, curl = o.curl == null ? 0.35 : o.curl, sd = o.side || 1, g = new T.Group();
        var palm = new T.Mesh(new T.SphereGeometry(0.05 * s, 14, 10), m); palm.scale.set(1, 1.12, 0.52); palm.position.y = -0.045 * s; palm.castShadow = true; g.add(palm);
        var fingers = [];
        for (var f = 0; f < 4; f++) {
          var len = [0.036, 0.042, 0.039, 0.03][f] * s, r = [0.0105, 0.0112, 0.0105, 0.0092][f] * s;
          var root = new T.Group(); root.position.set((-0.03 + f * 0.02) * s * sd, -0.09 * s, 0); root.rotation.z = (f - 1.5) * 0.06 * sd; g.add(root);
          var joint = root, bones = [];
          for (var k = 0; k < 3; k++) {
            var l = len * (1 - k * 0.18), bone = new T.Group();
            bone.position.y = k ? -(len * (1 - (k - 1) * 0.18)) : 0;
            bone.rotation.x = -curl * (k === 0 ? 1.1 : 1.25);
            var seg = new T.Mesh(new T.CapsuleGeometry(r * (1 - k * 0.1), l, 2, 6), m); seg.position.y = -l / 2; bone.add(seg);
            joint.add(bone); joint = bone; bones.push(bone);
          }
          fingers.push(bones);
        }
        var th = new T.Group(); th.position.set(0.045 * s * sd, -0.04 * s, -0.012 * s); th.rotation.set(-0.5 - curl * 0.4, 0, sd * 0.85); g.add(th);
        var t1 = new T.Mesh(new T.CapsuleGeometry(0.0125 * s, 0.032 * s, 3, 8), m); t1.position.y = -0.016 * s; t1.castShadow = true; th.add(t1);
        var t2g = new T.Group(); t2g.position.y = -0.036 * s; t2g.rotation.z = -sd * 0.5 * (0.4 + curl); th.add(t2g);
        var t2 = new T.Mesh(new T.CapsuleGeometry(0.011 * s, 0.026 * s, 3, 8), m); t2.position.y = -0.013 * s; t2g.add(t2);
        // posed once, then one mesh: fifteen pieces would cost fifteen draws (and fifteen more for their shadow)
        var out = new T.Group(), whole = new T.Mesh(flatten(g), m); whole.castShadow = true; out.add(whole);
        return out;
      }

      window.EclipseFigure = { head: head, face: face, hair: hair, beard: beard, shell: shell, tube: tube, strands: strands, hairTex: hairTex, hand: hand, mat: mat, mixHex: mixHex, canvasTex: canvasTex };
    })();
