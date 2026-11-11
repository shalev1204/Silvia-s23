    // =========================================================================
    // EclipseScenery · the shared painted-desert scenery of the 3D walks
    // =========================================================================
    // Built on EclipsePaint (s10-whispering-chasm.js). Every new walk can ask this module for:
    //   textures   · sand (ripples + relief), flagstones, masonry courses, sandstone strata, cloth, wood, bark, pottery
    //   sky        · a shader dome: zenith to haze, cirrus drifting, a sun glow, tone-mapped like the rest of the scene
    //   terrain    · real dunes (vertex-displaced) around a flat camp, vertex-tinted, with a ripple relief map
    //   ridges     · mesa silhouettes in layers, blended into the haze for depth
    //   props      · palm, awning, amphora, crate, sack, firepit, broken column, rock cluster, camel tracks
    //   air        · drifting dust, wind-blown sand, distant birds
    //   lights     · a key with real soft shadows, a cool fill, a warm rim from behind, a sky/ground hemisphere
    // `desertCamp(scene, opts)` dresses a whole camp in one call and returns { update(t, dt), heightAt, ... }.
    // Nothing here ever draws a letter, an hour or a hint: it is scenery.
    (function initEclipseScenery() {
      'use strict';
      var T = window.THREE;
      var P = window.EclipsePaint;
      if (!T || !P) return;

      // ---- small maths ----
      var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
      var lerp = function (a, b, t) { return a + (b - a) * t; };
      var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
      var hex = function (h) { return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; };
      var mix = function (a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; };
      function rng(seed) {
        var a = seed >>> 0;
        return function () {
          a = (a + 0x6D2B79F5) | 0;
          var t = Math.imul(a ^ (a >>> 15), 1 | a);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      function hash2(x, y, s) {
        var h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
      }
      // value noise; px / py make it tile every px / py cells (so a texture can repeat without a seam)
      function vnoise(x, y, s, px, py) {
        var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
        var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
        var x0 = px ? ((xi % px) + px) % px : xi, x1 = px ? (((xi + 1) % px) + px) % px : xi + 1;
        var y0 = py ? ((yi % py) + py) % py : yi, y1 = py ? (((yi + 1) % py) + py) % py : yi + 1;
        var a = hash2(x0, y0, s), b = hash2(x1, y0, s), c = hash2(x0, y1, s), d = hash2(x1, y1, s);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
      }
      function fbm(x, y, s, oct, px, py) {
        var a = 0, amp = 0.5, f = 1, n = 0;
        for (var i = 0; i < oct; i++) {
          a += amp * vnoise(x * f, y * f, s + i * 17, px ? px * f : 0, py ? py * f : 0);
          n += amp; amp *= 0.5; f *= 2;
        }
        return a / n;
      }

      // ---- canvas helpers ----
      function pixelCanvas(w, h, fn) {
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var g = c.getContext('2d');
        var im = g.createImageData(w, h), d = im.data;
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var o = (y * w + x) * 4, col = fn(x / w, y / h, x, y);
            d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = col.length > 3 ? col[3] : 255;
          }
        }
        g.putImageData(im, 0, 0);
        return c;
      }
      function toTex(canvas, linear, clampEdge) {
        var t = new T.CanvasTexture(canvas);
        t.wrapS = t.wrapT = clampEdge ? T.ClampToEdgeWrapping : T.RepeatWrapping;
        t.anisotropy = 8;
        if (!linear) t.encoding = T.sRGBEncoding;
        t.needsUpdate = true;
        return t;
      }
      function greyCanvas(size, arr, gain) {
        return pixelCanvas(size, size, function (u, v, x, y) {
          var g = clamp(arr[y * size + x] * 255 * (gain || 1), 0, 255);
          return [g, g, g];
        });
      }

      // ---- textures (each one is built once and kept) ----
      var cache = {};
      var tex = {};

      // Wind ripples over broad swells, a lit side and a shaded side, a fine grain. Tiles.
      tex.sand = function (seed) {
        var key = 'sand' + (seed || 11);
        if (cache[key]) return cache[key];
        seed = seed || 11;
        var size = 512, h = new Float32Array(size * size);
        for (var y = 0; y < size; y++) {
          for (var x = 0; x < size; x++) {
            var u = x / size, v = y / size;
            var warp = fbm(u * 4, v * 4, seed, 3, 4, 4);
            var rip = Math.sin((u * 13 + v * 3 + warp * 1.4) * Math.PI * 2);
            var broad = fbm(u * 3, v * 3, seed + 9, 4, 3, 3);
            h[y * size + x] = clamp(0.5 + 0.17 * rip + (broad - 0.5) * 0.9, 0, 1);
          }
        }
        var light = hex(0xf6d29a), mid = hex(0xdba96e), dark = hex(0xa6683c);
        var albedo = pixelCanvas(size, size, function (u, v, x, y) {
          var hv = h[y * size + x], t = hv;
          var c = t < 0.45 ? mix(dark, mid, smooth(0.12, 0.45, t)) : mix(mid, light, smooth(0.45, 0.88, t));
          var hr = h[y * size + ((x + 1) % size)];
          var sl = (hv - hr) * 70, g = (hash2(x, y, seed + 3) - 0.5) * 14;
          return [clamp(c[0] + g + sl, 0, 255), clamp(c[1] + g + sl, 0, 255), clamp(c[2] + g * 0.8 + sl, 0, 255)];
        });
        var r = { map: toTex(albedo), bump: toTex(greyCanvas(size, h), true) };
        cache[key] = r;
        return r;
      };

      // A round of irregular flagstones with a broken edge (an alpha cut-out), for the paving of a camp.
      tex.flagDisc = function (seed) {
        var key = 'flag' + (seed || 5);
        if (cache[key]) return cache[key];
        seed = seed || 5;
        var size = 512, N = 16, hm = new Float32Array(size * size);
        var albedo = pixelCanvas(size, size, function (u, v, x, y) {
          var ci = Math.floor(u * N), cj = Math.floor(v * N), m1 = 9, m2 = 9, id = 0;
          for (var dj = -1; dj <= 1; dj++) {
            for (var di = -1; di <= 1; di++) {
              var ni = ci + di, nj = cj + dj;
              var px = (ni + 0.18 + hash2(ni, nj, seed) * 0.64) / N, py = (nj + 0.18 + hash2(ni, nj, seed + 1) * 0.64) / N;
              var d = Math.sqrt((u - px) * (u - px) + (v - py) * (v - py));
              if (d < m1) { m2 = m1; m1 = d; id = hash2(ni, nj, seed + 2); } else if (d < m2) m2 = d;
            }
          }
          var edge = (m2 - m1) * N;
          var bevel = smooth(0.03, 0.2, edge);
          var mott = fbm(u * 16, v * 16, seed + 4, 3, 0, 0);
          var base = mix([136, 112, 84], [208, 180, 136], clamp(id * 0.8 + (mott - 0.5) * 0.6 + 0.1, 0, 1));
          var grain = (hash2(x, y, seed + 7) - 0.5) * 16;
          var r = Math.sqrt((u - 0.5) * (u - 0.5) + (v - 0.5) * (v - 0.5)) * 2;
          var rn = r + (fbm(u * 8, v * 8, seed + 6, 3, 0, 0) - 0.5) * 0.24;
          var rimK = 1 - smooth(0.7, 0.9, rn) * 0.3;
          hm[y * size + x] = bevel * (0.8 + 0.2 * mott);
          var c = mix([82, 64, 46], base, bevel);
          return [clamp(c[0] * rimK + grain, 0, 255), clamp(c[1] * rimK + grain, 0, 255), clamp(c[2] * rimK + grain, 0, 255), rn < 0.9 ? 255 : 0];
        });
        var r2 = { map: toTex(albedo, false, true), bump: toTex(greyCanvas(size, hm), true, true) };
        cache[key] = r2;
        return r2;
      };

      // Courses of cut stone with mortar, chips and stains. Tiles both ways (rows and per are whole numbers).
      tex.masonry = function (seed, rows, per) {
        var key = 'mas' + (seed || 3) + '_' + rows + '_' + per;
        if (cache[key]) return cache[key];
        seed = seed || 3; rows = rows || 6; per = per || 4;
        var size = 256, hm = new Float32Array(size * size);
        var albedo = pixelCanvas(size, size, function (u, v, x, y) {
          var rowF = v * rows, row = Math.floor(rowF), fv = rowF - row;
          var bu = u * per + (row % 2) * 0.5, bi = Math.floor(bu), fu = bu - bi;
          var id = hash2(((bi % per) + per) % per, row, seed);
          var mort = fv < 0.1 || fv > 0.965 || fu < 0.045 || fu > 0.985;
          var stain = fbm(u * 5, v * 3, seed + 3, 3, 5, 3);
          var grain = (hash2(x, y, seed + 5) - 0.5) * 14;
          var base = mix([172, 142, 102], [222, 196, 150], clamp(0.2 + id * 0.55 + (stain - 0.5) * 0.5, 0, 1));
          var k = 0.84 + 0.16 * smooth(0.1, 0.4, fv);
          var chip = hash2(x, y, seed + 9) > 0.993 ? 0.78 : 1;
          hm[y * size + x] = mort ? 0.12 : 0.8 + (stain - 0.5) * 0.25;
          if (mort) return [clamp(98 + grain, 0, 255), clamp(80 + grain, 0, 255), clamp(60 + grain, 0, 255)];
          return [clamp(base[0] * k * chip + grain, 0, 255), clamp(base[1] * k * chip + grain, 0, 255), clamp(base[2] * k * chip + grain, 0, 255)];
        });
        var r = { map: toTex(albedo), bump: toTex(greyCanvas(size, hm), true) };
        cache[key] = r;
        return r;
      };

      // Layers of sandstone in rust, ochre and cream, warped and streaked by erosion. Tiles.
      tex.strata = function (seed) {
        var key = 'str' + (seed || 7);
        if (cache[key]) return cache[key];
        seed = seed || 7;
        var pal = [[188, 112, 70], [222, 162, 104], [240, 210, 156], [170, 92, 58], [208, 140, 88], [234, 188, 130]];
        var size = 256;
        var c = pixelCanvas(size, size, function (u, v, x, y) {
          var warp = fbm(u * 3, v * 3, seed, 4, 3, 3), streak = fbm(u * 20, v * 2, seed + 5, 3, 20, 2);
          var yy = v * 6 + (warp - 0.5) * 1.8, bi = Math.floor(yy), f = yy - bi;
          var c0 = pal[((bi % 6) + 6) % 6], c1 = pal[(((bi + 1) % 6) + 6) % 6];
          var col = mix(c0, c1, smooth(0.78, 1, f) * 0.6);
          var k = (0.82 + 0.3 * streak) * (f < 0.05 ? 0.82 : 1);
          var g = (hash2(x, y, seed + 2) - 0.5) * 12;
          return [clamp(col[0] * k + g, 0, 255), clamp(col[1] * k + g, 0, 255), clamp(col[2] * k + g, 0, 255)];
        });
        var r = toTex(c);
        cache[key] = r;
        return r;
      };

      // Woven cloth in two colours with a faint dirt. Stripes whole per tile.
      tex.cloth = function (a, b, stripes, seed) {
        var key = 'cl' + a + '_' + b + '_' + stripes + '_' + (seed || 1);
        if (cache[key]) return cache[key];
        var A = hex(a), B = hex(b), size = 256;
        var c = pixelCanvas(size, size, function (u, v, x, y) {
          var col = (Math.floor(u * stripes) % 2) ? A : B;
          var weave = (((x >> 1) + (y >> 1)) & 1) ? 1 : 0.9;
          var dirt = 0.86 + 0.14 * fbm(u * 6, v * 6, (seed || 1) + 4, 3, 6, 6);
          var hemline = v > 0.93 ? 0.7 : 1;
          var g = (hash2(x, y, (seed || 1) + 8) - 0.5) * 10;
          return [clamp(col[0] * weave * dirt * hemline + g, 0, 255), clamp(col[1] * weave * dirt * hemline + g, 0, 255), clamp(col[2] * weave * dirt * hemline + g, 0, 255)];
        });
        var t = toTex(c);
        cache[key] = t;
        return t;
      };

      // Planks: long grain, a seam between boards. Tiles.
      tex.wood = function (base, seed) {
        var key = 'wd' + base + '_' + (seed || 2);
        if (cache[key]) return cache[key];
        var B = hex(base), size = 128;
        var c = pixelCanvas(size, size, function (u, v, x, y) {
          var gr = 0.5 + 0.5 * Math.sin((u * 6 + fbm(u * 3, v * 1, (seed || 2), 3, 3, 1) * 3) * Math.PI * 2);
          var seam = (v * 4) % 1 < 0.035 ? 0.55 : 1;
          var k = (0.78 + 0.34 * gr) * seam;
          var g = (hash2(x, y, (seed || 2) + 6) - 0.5) * 10;
          return [clamp(B[0] * k + g, 0, 255), clamp(B[1] * k + g, 0, 255), clamp(B[2] * k + g, 0, 255)];
        });
        var t = toTex(c);
        cache[key] = t;
        return t;
      };

      // Palm bark: rings across the trunk, rough along it. For a TubeGeometry (u along the length).
      tex.bark = function () {
        if (cache.bark) return cache.bark;
        var size = 128;
        var c = pixelCanvas(size, size, function (u, v, x, y) {
          var ring = 0.5 + 0.5 * Math.sin(u * 30 * Math.PI * 2);
          var rough = fbm(u * 8, v * 12, 41, 3, 8, 12);
          var k = 0.62 + 0.28 * ring + 0.22 * rough;
          var g = (hash2(x, y, 44) - 0.5) * 12;
          return [clamp(150 * k + g, 0, 255), clamp(104 * k + g, 0, 255), clamp(66 * k + g, 0, 255)];
        });
        cache.bark = toTex(c);
        return cache.bark;
      };

      // Painted clay for a jar: horizontal bands, a zigzag, a little wear. u around, v along the profile.
      tex.pottery = function (body, band, seed) {
        var key = 'pt' + body + '_' + band + '_' + (seed || 3);
        if (cache[key]) return cache[key];
        var c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        var g = c.getContext('2d'), r = rng(seed || 3), B = hex(body), D = hex(band);
        g.fillStyle = 'rgb(' + B.join(',') + ')';
        g.fillRect(0, 0, 256, 256);
        for (var i = 0; i < 260; i++) {
          var x = r() * 256, y = r() * 256, rad = 4 + r() * 16;
          var gr = g.createRadialGradient(x, y, 0, x, y, rad);
          gr.addColorStop(0, r() < 0.5 ? 'rgba(255,224,176,0.18)' : 'rgba(70,32,12,0.16)');
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = gr;
          g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        g.fillStyle = 'rgb(' + D.join(',') + ')';
        g.fillRect(0, 70, 256, 14);
        g.fillRect(0, 176, 256, 10);
        g.fillRect(0, 196, 256, 5);
        g.strokeStyle = 'rgb(' + D.join(',') + ')';
        g.lineWidth = 5;
        g.beginPath();
        for (var k = 0; k <= 16; k++) { var zx = k * 16, zy = 108 + (k % 2 ? 22 : 0); if (k === 0) g.moveTo(zx, zy); else g.lineTo(zx, zy); }
        g.stroke();
        var t = new T.CanvasTexture(c);
        t.wrapS = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 8;
        cache[key] = t;
        return t;
      };

      // One palm frond: a rib and leaflets on transparent. Used with alphaTest.
      tex.frond = function () {
        if (cache.frond) return cache.frond;
        var c = document.createElement('canvas');
        c.width = 128; c.height = 512;
        var g = c.getContext('2d'), r = rng(5);
        for (var y = 500; y > 8; y -= 6) {
          var t = 1 - y / 512, len = 58 * Math.sin(Math.min(1, t * 1.15 + 0.06) * Math.PI * 0.92) * (0.5 + 0.5 * (1 - t * 0.6));
          for (var sd = -1; sd <= 1; sd += 2) {
            g.strokeStyle = 'rgb(' + (38 + ((r() * 30) | 0)) + ',' + (108 + ((r() * 56) | 0)) + ',' + (50 + ((r() * 22) | 0)) + ')';
            g.lineWidth = 4.4 - t * 2.4;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(64, y);
            g.quadraticCurveTo(64 + sd * len * 0.5, y - len * 0.28 - 6, 64 + sd * len, y - len * 0.62 - 10 * t);
            g.stroke();
          }
        }
        g.strokeStyle = '#5a4622';
        g.lineWidth = 5;
        g.beginPath(); g.moveTo(64, 512); g.lineTo(64, 6); g.stroke();
        var tx = new T.CanvasTexture(c);
        tx.encoding = T.sRGBEncoding; tx.anisotropy = 8;
        cache.frond = tx;
        return tx;
      };

      tex.soft = function () {
        if (cache.soft) return cache.soft;
        var c = document.createElement('canvas');
        c.width = c.height = 32;
        var g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        gr.addColorStop(0, 'rgba(255,244,222,1)');
        gr.addColorStop(0.45, 'rgba(255,236,200,0.45)');
        gr.addColorStop(1, 'rgba(255,230,190,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
        cache.soft = new T.CanvasTexture(c);
        return cache.soft;
      };

      // The colour to give the fog so that, after Reinhard and the sRGB output, a far pixel shows exactly `h`.
      function preTone(h, exposure) {
        var c = hex(h).map(function (v) { var l = Math.pow(Math.min(v / 255, 0.96), 2.2); return l / (1 - l) / (exposure || 1.08); });
        return new T.Color(c[0], c[1], c[2]);
      }

      function paintFor() {
        return function (opts, rimColor, rimK) {
          var m = P.toonSoft ? P.toonSoft(opts) : (P.toon ? P.toon(opts) : new T.MeshToonMaterial(opts));
          if (rimColor != null && P.rim) P.rim(m, rimColor, rimK == null ? 0.2 : rimK);
          return m;
        };
      }
      function shadowy(obj, cast, receive) {
        obj.traverse(function (m) {
          if (m.isMesh || m.isInstancedMesh) { if (cast !== false) m.castShadow = true; if (receive !== false) m.receiveShadow = true; }
        });
        return obj;
      }

      // ---- cloth that hangs and flies: a Verlet grid over a PlaneGeometry (rows top to bottom), with gravity and wind
      // taken from the world, and the jolt of whatever carries it (a man who walks, a head that turns). Pinned points keep
      // their shape; the rest swing. clothSim(mesh, opts) → { update(t), point(fx, fy, out), normal(fx, fy, out) }
      //   opts: ws, hs (segments), pin(ix, iy) (default the top row), wind [x, y, z] (world), gust, gravity, damp,
      //   iters, minZ / maxZ (keep it off a body behind or in front of it, in the mesh's own space), stiff (bend 0…1)
      var clothReduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
      function clothSim(mesh, o) {
        o = o || {};
        var geo = mesh.geometry, P = geo.attributes.position, N = P.count;
        var ws = o.ws, hs = o.hs, cols = ws + 1;
        mesh.userData.live = true;
        var pos = new Float32Array(P.array), prev = new Float32Array(P.array), rest = new Float32Array(P.array);
        var pinned = new Uint8Array(N);
        var pin = o.pin || function (ix, iy) { return iy === 0; };
        for (var i = 0; i < N; i++) pinned[i] = pin(i % cols, Math.floor(i / cols)) ? 1 : 0;
        var links = [];
        function link(a, b) { var dx = rest[a * 3] - rest[b * 3], dy = rest[a * 3 + 1] - rest[b * 3 + 1], dz = rest[a * 3 + 2] - rest[b * 3 + 2]; links.push(a, b, Math.sqrt(dx * dx + dy * dy + dz * dz)); }
        for (var iy = 0; iy <= hs; iy++) for (var ix = 0; ix <= ws; ix++) {
          var a = iy * cols + ix;
          if (ix < ws) link(a, a + 1);
          if (iy < hs) link(a, a + cols);
          if (ix < ws && iy < hs) { link(a, a + cols + 1); link(a + 1, a + cols); }
          if (o.stiff !== 0) { if (ix < ws - 1) link(a, a + 2); if (iy < hs - 1) link(a, a + 2 * cols); }
        }
        var nL = links.length / 3, iters = o.iters || 4, damp = o.damp == null ? 0.982 : o.damp;
        var wind = o.wind || [1.1, 0, 0.45], gust = o.gust == null ? 1 : o.gust, grav = o.gravity == null ? 9.8 : o.gravity;
        var q = new T.Quaternion(), sc = new T.Vector3(), wp = new T.Vector3(), lastWp = null, vel = new T.Vector3(), lastVel = new T.Vector3();
        var fG = new T.Vector3(), fW = new T.Vector3(), fA = new T.Vector3(), lastT = null, acc = 0, ph = Math.random() * 10;
        function step(h, t) {
          var h2 = h * h;
          for (var i = 0; i < N; i++) {
            if (pinned[i]) continue;
            var k = i * 3, x = pos[k], y = pos[k + 1], z = pos[k + 2];
            // gusts roll across the cloth: stronger at the free end, never quite the same twice
            var g = 1 + gust * (0.55 * Math.sin(t * 2.3 + rest[k] * 3.1 + ph) + 0.35 * Math.sin(t * 5.7 - rest[k + 1] * 4.3 + ph * 1.7));
            var fx = fG.x + fW.x * g + fA.x, fy = fG.y + fW.y * g + fA.y, fz = fG.z + fW.z * g + fA.z;
            var nx = x + (x - prev[k]) * damp + fx * h2, ny = y + (y - prev[k + 1]) * damp + fy * h2, nz = z + (z - prev[k + 2]) * damp + fz * h2;
            prev[k] = x; prev[k + 1] = y; prev[k + 2] = z;
            pos[k] = nx; pos[k + 1] = ny; pos[k + 2] = nz;
          }
          for (var it = 0; it < iters; it++) {
            for (var l = 0; l < nL; l++) {
              var a = links[l * 3] * 3, b = links[l * 3 + 1] * 3, r = links[l * 3 + 2];
              var dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2];
              var d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6, c = (d - r) / d;
              var pa = pinned[a / 3], pb = pinned[b / 3];
              if (pa && pb) continue;
              var wa = pa ? 0 : (pb ? 1 : 0.5), wb = pb ? 0 : (pa ? 1 : 0.5);
              pos[a] += dx * c * wa; pos[a + 1] += dy * c * wa; pos[a + 2] += dz * c * wa;
              pos[b] -= dx * c * wb; pos[b + 1] -= dy * c * wb; pos[b + 2] -= dz * c * wb;
            }
            if (o.minZ != null || o.maxZ != null) for (var j = 0; j < N; j++) {
              if (pinned[j]) continue;
              if (o.minZ != null && pos[j * 3 + 2] < o.minZ) pos[j * 3 + 2] = o.minZ;
              if (o.maxZ != null && pos[j * 3 + 2] > o.maxZ) pos[j * 3 + 2] = o.maxZ;
            }
          }
        }
        function lerpGrid(arr, fx, fy, out) {
          fx = Math.max(0, Math.min(ws, fx)); fy = Math.max(0, Math.min(hs, fy));
          var x0 = Math.min(ws - 1, Math.floor(fx)), y0 = Math.min(hs - 1, Math.floor(fy)), u = fx - x0, v = fy - y0;
          var i00 = (y0 * cols + x0) * 3, i10 = i00 + 3, i01 = i00 + cols * 3, i11 = i01 + 3;
          for (var c = 0; c < 3; c++) out.setComponent(c, (arr[i00 + c] * (1 - u) + arr[i10 + c] * u) * (1 - v) + (arr[i01 + c] * (1 - u) + arr[i11 + c] * u) * v);
          return out;
        }
        var api = {
          // t in seconds; the cloth keeps its own fixed step (1/60) and never runs more than four of them a frame
          update: function (t) {
            if (lastT == null) { lastT = t; return; }
            var dt = Math.min(0.066, Math.max(0, t - lastT)); lastT = t;
            if (!(dt > 0)) return;
            mesh.updateWorldMatrix(true, false);
            mesh.matrixWorld.decompose(wp, q, sc);
            q.invert();
            var s = Math.max(1e-3, sc.x);
            var calm = clothReduced() ? 0.35 : 1;
            fG.set(0, -grav, 0).applyQuaternion(q).divideScalar(s);
            fW.set(wind[0], wind[1], wind[2]).multiplyScalar(calm).applyQuaternion(q).divideScalar(s);
            // whatever carries the cloth pulls it the other way when it starts, stops or turns
            if (lastWp) {
              var nv = wp.clone().sub(lastWp).divideScalar(dt);
              fA.copy(nv).sub(lastVel).divideScalar(dt);
              if (fA.length() > 40) fA.setLength(40);
              fA.multiplyScalar(-1).applyQuaternion(q).divideScalar(s);
              lastVel.copy(nv);
            }
            lastWp = (lastWp || new T.Vector3()).copy(wp);
            acc += dt;
            var n = 0;
            while (acc >= 1 / 60 && n < 4) { step(1 / 60, t); acc -= 1 / 60; n++; }
            if (n === 4) acc = 0;
            fA.set(0, 0, 0);
            P.array.set(pos); P.needsUpdate = true;
            geo.computeVertexNormals();
            geo.computeBoundingSphere();
          },
          point: function (fx, fy, out) { return lerpGrid(pos, fx, fy, out || new T.Vector3()); },
          normal: function (fx, fy, out) { return lerpGrid(geo.attributes.normal.array, fx, fy, out || new T.Vector3()).normalize(); },
          reset: function () { pos.set(rest); prev.set(rest); P.array.set(rest); P.needsUpdate = true; lastT = null; lastWp = null; }
        };
        return api;
      }
      // ---- a rope between two points, with weight: a Verlet chain drawn as a thin tube. ends are local points (arrays or
      // functions returning arrays), so a rope can hang from something that moves. rope(mat, a, b, opts) → mesh with
      // userData.update(t)
      function rope(mat, a, b, o) {
        o = o || {};
        var n = o.segments || 10, rad = o.radius || 0.014, slack = o.slack == null ? 1.04 : o.slack, R = 5;
        var end = function (e) { return typeof e === 'function' ? e() : e; };
        var A = end(a), B = end(b), pts = [], prv = [];
        for (var i = 0; i <= n; i++) { var u = i / n; pts.push([A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u - Math.sin(u * Math.PI) * 0.05, A[2] + (B[2] - A[2]) * u]); prv.push(pts[i].slice()); }
        var len = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]) * slack / n;
        var geo = new T.BufferGeometry(), V = new Float32Array((n + 1) * R * 3), idx = [];
        for (var s2 = 0; s2 < n; s2++) for (var r = 0; r < R; r++) {
          var r2 = (r + 1) % R, p0 = s2 * R + r, p1 = s2 * R + r2, p2 = (s2 + 1) * R + r, p3 = (s2 + 1) * R + r2;
          idx.push(p0, p2, p1, p1, p2, p3);
        }
        geo.setIndex(idx); geo.setAttribute('position', new T.BufferAttribute(V, 3));
        var mesh = new T.Mesh(geo, mat); mesh.castShadow = true; mesh.frustumCulled = false;
        var lastT = null, ph = Math.random() * 6, tan = new T.Vector3(), nA = new T.Vector3(), nB = new T.Vector3(), up = new T.Vector3(0, 1, 0);
        function draw() {
          for (var i = 0; i <= n; i++) {
            var p = pts[i], q2 = pts[Math.min(n, i + 1)], q0 = pts[Math.max(0, i - 1)];
            tan.set(q2[0] - q0[0], q2[1] - q0[1], q2[2] - q0[2]).normalize();
            nA.crossVectors(tan, Math.abs(tan.y) > 0.9 ? nB.set(1, 0, 0) : up).normalize(); nB.crossVectors(tan, nA);
            for (var r = 0; r < R; r++) {
              var an = r / R * Math.PI * 2, c = Math.cos(an) * rad, sn = Math.sin(an) * rad, k = (i * R + r) * 3;
              V[k] = p[0] + nA.x * c + nB.x * sn; V[k + 1] = p[1] + nA.y * c + nB.y * sn; V[k + 2] = p[2] + nA.z * c + nB.z * sn;
            }
          }
          geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
        }
        draw();
        mesh.userData.update = function (t) {
          if (lastT == null) { lastT = t; return; }
          var dt = Math.min(0.05, Math.max(0, t - lastT)); lastT = t;
          if (!(dt > 0)) return;
          var h2 = dt * dt, A2 = end(a), B2 = end(b), w = clothReduced() ? 0 : 0.6 * Math.sin(t * 1.7 + ph) + 0.3 * Math.sin(t * 4.1 + ph * 2);
          pts[0] = A2.slice(); pts[n] = B2.slice();
          for (var i = 1; i < n; i++) {
            var p = pts[i], q2 = prv[i], x = p[0], y = p[1], z = p[2];
            p[0] += (x - q2[0]) * 0.98 + w * h2; p[1] += (y - q2[1]) * 0.98 - 9.8 * h2; p[2] += (z - q2[2]) * 0.98 + w * 0.4 * h2;
            q2[0] = x; q2[1] = y; q2[2] = z;
          }
          for (var it = 0; it < 6; it++) for (var j = 0; j < n; j++) {
            var p0 = pts[j], p1 = pts[j + 1], dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2];
            var d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6, c = (d - len) / d;
            var wa = j === 0 ? 0 : (j + 1 === n ? 1 : 0.5), wb = j + 1 === n ? 0 : (j === 0 ? 1 : 0.5);
            p0[0] += dx * c * wa; p0[1] += dy * c * wa; p0[2] += dz * c * wa;
            p1[0] -= dx * c * wb; p1[1] -= dy * c * wb; p1[2] -= dz * c * wb;
          }
          draw();
        };
        return mesh;
      }

      // ---- one draw instead of eighty: sibling meshes that share a material (and how they take shadows) become a single
      // mesh in their parent's space. Groups are never touched, so whatever a game moves keeps moving; a mesh is left alone
      // if it has children, carries userData (somebody owns it), is hidden, see-through, or listed in opts.skip.
      function bake(root, o) {
        o = o || {};
        var skip = o.skip || [], parents = [], saved = 0;
        var v = new T.Vector3(), nm = new T.Matrix3();
        // opts.shallow: only the root's own children; opts.only: nothing but these meshes
        if (o.shallow) parents.push(root); else root.traverse(function (n) { if (n.children.length > 1) parents.push(n); });
        var only = o.only ? new Set(o.only) : null;
        parents.forEach(function (p) {
          var buckets = {};
          p.children.forEach(function (m) {
            if (!m.isMesh || m.isInstancedMesh || m.isSkinnedMesh || m.children.length || !m.visible || skip.indexOf(m) >= 0 || (only && !only.has(m))) return;
            var mat = m.material, geo = m.geometry;
            if (!mat || Array.isArray(mat) || mat.vertexColors || mat.transparent || !geo || !geo.attributes.position || !geo.attributes.normal) return;
            if (geo.morphAttributes && geo.morphAttributes.position) return;
            for (var k in m.userData) return;
            m.updateMatrix();
            if (m.matrix.determinant() < 0) return;
            var key = mat.uuid + (m.castShadow ? 'c' : '-') + (m.receiveShadow ? 'r' : '-') + m.renderOrder + (m.frustumCulled ? 'f' : '-');
            (buckets[key] = buckets[key] || []).push(m);
          });
          Object.keys(buckets).forEach(function (key) {
            var list = buckets[key];
            if (list.length < 2) return;
            var nV = 0, nI = 0;
            list.forEach(function (m) { var g = m.geometry; nV += g.attributes.position.count; nI += g.index ? g.index.count : g.attributes.position.count; });
            var pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), uv = new Float32Array(nV * 2);
            var idx = nV > 65535 ? new Uint32Array(nI) : new Uint16Array(nI), vo = 0, io = 0;
            list.forEach(function (m) {
              var g = m.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, n = P.count;
              nm.getNormalMatrix(m.matrix);
              for (var i = 0; i < n; i++) {
                v.fromBufferAttribute(P, i).applyMatrix4(m.matrix); pos[(vo + i) * 3] = v.x; pos[(vo + i) * 3 + 1] = v.y; pos[(vo + i) * 3 + 2] = v.z;
                v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[(vo + i) * 3] = v.x; nor[(vo + i) * 3 + 1] = v.y; nor[(vo + i) * 3 + 2] = v.z;
                if (U) { uv[(vo + i) * 2] = U.getX(i); uv[(vo + i) * 2 + 1] = U.getY(i); }
              }
              if (g.index) for (var j = 0; j < g.index.count; j++) idx[io++] = g.index.getX(j) + vo;
              else for (var j2 = 0; j2 < n; j2++) idx[io++] = vo + j2;
              vo += n;
            });
            var geo = new T.BufferGeometry();
            geo.setAttribute('position', new T.BufferAttribute(pos, 3));
            geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
            geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
            geo.setIndex(new T.BufferAttribute(idx, 1));
            var first = list[0], mesh = new T.Mesh(geo, first.material);
            mesh.castShadow = first.castShadow; mesh.receiveShadow = first.receiveShadow; mesh.renderOrder = first.renderOrder; mesh.frustumCulled = first.frustumCulled;
            mesh.name = 'baked';
            list.forEach(function (m) { p.remove(m); });
            p.add(mesh);
            saved += list.length - 1;
          });
        });
        return saved;
      }

      // ---- a face that lives: eyes that blink (now and then twice), pupils that never quite rest, brows that rise with
      // surprise and knit with worry. eyes: [{ sd, white, pupil, glint, lid, brow }] (any may be missing).
      function faceLife(eyes) {
        eyes = (eyes || []).filter(function (e) { return e && e.pupil; });
        eyes.forEach(function (e) {
          ['white', 'pupil', 'glint', 'lid', 'brow', 'iris'].forEach(function (k) { if (e[k]) e[k].userData.live = true; });
          e.b = {
            wy: e.white ? e.white.scale.y : 1, py: e.pupil.scale.y, px: e.pupil.position.x, pY: e.pupil.position.y,
            ix: e.iris ? e.iris.position.x : 0, iY: e.iris ? e.iris.position.y : 0, iy: e.iris ? e.iris.scale.y : 1,
            lx: e.lid ? e.lid.rotation.x : 0, by: e.brow ? e.brow.position.y : 0, bz: e.brow ? e.brow.rotation.z : 0
          };
        });
        var next = 1 + Math.random() * 3, b = 0, ph = 0, dbl = false, sur = 0, wor = 0;
        var gx = 0, gy = 0, tx = 0, ty = 0, sx = 0, sy = 0, sacT = 0;
        var calm = clothReduced();
        return {
          blink: function () { if (!ph) ph = 1; },
          mood: function (surprise, worry) { sur = Math.max(sur, surprise || 0); wor = Math.max(wor, worry || 0); },
          gaze: function (x, y) { tx = x || 0; ty = y || 0; },
          update: function (dt) {
            if (!(dt > 0) || !eyes.length) return;
            next -= dt;
            if (next <= 0 && !ph) { ph = 1; next = 2.4 + Math.random() * 4.2; dbl = Math.random() < 0.18; }
            if (ph === 1) { b += dt / 0.06; if (b >= 1) { b = 1; ph = 2; } }
            else if (ph === 2) { b -= dt / 0.11; if (b <= 0) { b = 0; ph = 0; if (dbl) { dbl = false; next = 0.1; } } }
            sacT -= dt;
            if (sacT <= 0) { sacT = 0.7 + Math.random() * 2.6; sx = calm ? 0 : (Math.random() - 0.5) * 0.5; sy = calm ? 0 : (Math.random() - 0.5) * 0.3; }
            gx += (Math.max(-1, Math.min(1, tx + sx)) - gx) * Math.min(1, dt * 16);
            gy += (Math.max(-1, Math.min(1, ty + sy)) - gy) * Math.min(1, dt * 16);
            var fade = Math.exp(-dt * 1.1); sur *= fade; wor *= fade;
            for (var i = 0; i < eyes.length; i++) {
              var e = eyes[i], B = e.b, r = e.white ? e.white.geometry.parameters.radius * e.white.scale.x : 0.02;
              if (e.white) e.white.scale.y = B.wy * (1 - 0.92 * b) * (1 + 0.16 * sur);
              e.pupil.scale.y = B.py * (1 - b);
              e.pupil.position.x = B.px + gx * r * 0.3; e.pupil.position.y = B.pY + gy * r * 0.16;
              if (e.iris) { e.iris.scale.y = B.iy * (1 - b); e.iris.position.x = B.ix + gx * r * 0.3; e.iris.position.y = B.iY + gy * r * 0.16; }
              if (e.glint) e.glint.visible = b < 0.5;
              if (e.lid) e.lid.rotation.x = B.lx - 0.95 * b + 0.14 * sur - 0.12 * wor;
              if (e.brow) { e.brow.position.y = B.by + r * (0.45 * sur - 0.22 * wor - 0.12 * b); e.brow.rotation.z = B.bz + e.sd * (0.24 * wor - 0.12 * sur); }
            }
          }
        };
      }

      // ---- a body that lives, for the people of the scenery (the old man of the gates, the young nomad). The game only
      // moves the figure and says who is speaking; this reads how far it went and does the rest: legs that step, a body
      // that bobs and leans, a stick that plants, a head that turns to whoever it listens to and nods as it talks, an arm
      // that marks the words, a face that blinks. persona(g, parts) → { update(t), speak(on), look(v), react(kind) }
      //   parts: head, face (faceLife), legs [L, R], arm (a pivot group for the free arm), stick, lantern, stride
      function persona(g, c) {
        c = c || {};
        var body = new T.Group(), legs = c.legs || [];
        g.children.slice().forEach(function (ch) { if (legs.indexOf(ch) < 0) { g.remove(ch); body.add(ch); } });
        g.add(body);
        var head = c.head, hb = head ? head.rotation.clone() : null, ab = c.arm ? c.arm.rotation.clone() : null;
        var sb = c.stick ? c.stick.rotation.clone() : null, lb = c.lantern ? c.lantern.rotation.clone() : null;
        var lastT = null, last = null, wp = new T.Vector3(), lv = new T.Vector3();
        var phase = 0, wgt = 0, sp = 0, speaking = false, target = null, yaw = 0, pitch = 0, rx = null, glance = { t: 4 + Math.random() * 5, k: 0, yaw: 0 };
        var STR = c.stride || 0.5, calm = clothReduced();
        var api = {
          body: body,
          speak: function (on) { speaking = !!on; if (c.face && c.face.talk) c.face.talk(speaking); },
          look: function (v) { target = v ? (target || new T.Vector3()).set(v.x, v.y, v.z) : null; },
          react: function (kind) { rx = { kind: kind, t: 0, dur: kind === 'bow' ? 1.8 : 0.9 }; if (c.face) { if (kind === 'startle') { c.face.mood(1, 0); } else c.face.blink(); } },
          moving: function () { return wgt > 0.05; },
          update: function (t) {
            if (lastT == null) { lastT = t; return; }
            var dt = Math.min(0.066, Math.max(0, t - lastT)); lastT = t;
            if (!(dt > 0)) return;
            var s = g.scale.x || 1, dist = 0;
            g.getWorldPosition(wp);
            if (last) { dist = Math.hypot(wp.x - last.x, wp.z - last.z) / s; if (dist > 0.6) dist = 0; }
            last = (last || new T.Vector3()).copy(wp);
            var speed = dist / dt;
            wgt += ((speed > 0.05 ? Math.min(1, 0.4 + speed / 2) : 0) - wgt) * Math.min(1, dt * (speed > 0.05 ? 9 : 5));
            if (speed > 0.05) phase = (phase + dist / (2 * STR)) % 1; else if (wgt < 0.02) phase = 0;
            var a = Math.PI * 2 * phase, sw = Math.sin(a), br = Math.sin(t * 1.5);
            if (legs.length === 2) {
              legs[0].rotation.x = 0.5 * sw * wgt; legs[1].rotation.x = -0.5 * sw * wgt;
              legs[0].position.y = (legs[0].userData.y0 == null ? (legs[0].userData.y0 = legs[0].position.y) : legs[0].userData.y0) + Math.max(0, Math.cos(a)) * 0.03 * wgt;
              legs[1].position.y = (legs[1].userData.y0 == null ? (legs[1].userData.y0 = legs[1].position.y) : legs[1].userData.y0) + Math.max(0, -Math.cos(a)) * 0.03 * wgt;
              // a knee, where the leg has one: it bends as the foot comes through
              if (legs[0].userData.knee) legs[0].userData.knee.rotation.x = -0.95 * Math.max(0, Math.cos(a)) * wgt;
              if (legs[1].userData.knee) legs[1].userData.knee.rotation.x = -0.95 * Math.max(0, -Math.cos(a)) * wgt;
            }
            sp += ((speaking ? 1 : 0) - sp) * Math.min(1, dt * 6);
            var e = 0;
            if (rx) { rx.t += dt; var u = rx.t / rx.dur; if (u >= 1) rx = null; else { e = u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75; e = e * e * (3 - 2 * e); } }
            var bow = rx && rx.kind === 'bow' ? e : 0, start = rx && rx.kind === 'startle' ? e : 0;
            body.position.y = -0.025 * (0.5 - 0.5 * Math.cos(2 * a)) * wgt + 0.004 * br * (1 - wgt);
            body.position.x = 0.012 * sw * wgt + (calm ? 0 : 0.006 * Math.sin(t * 0.41) * (1 - wgt));
            body.rotation.x = -0.05 * wgt - 0.22 * bow + 0.07 * start;
            body.rotation.z = 0.03 * sw * wgt + (calm ? 0 : 0.008 * Math.sin(t * 0.33) * (1 - wgt));
            body.scale.y = 1 + 0.005 * br;
            if (c.stick && sb) c.stick.rotation.x = sb.x + 0.16 * sw * wgt;
            if (c.lantern && lb) c.lantern.rotation.x = lb.x + 0.14 * Math.sin(a + 1.1) * wgt;
            if (c.arm && ab) {
              // the free hand marks the words: it rises as he speaks and beats with them
              c.arm.rotation.x = ab.x + sp * (0.32 + 0.1 * Math.sin(t * 3.3) + 0.05 * Math.sin(t * 7.1)) + 0.5 * start - 0.12 * sw * wgt;
              c.arm.rotation.z = ab.z - sp * 0.1 * Math.sin(t * 2.2);
            }
            if (head && hb) {
              var ty = 0, tp = 0;
              if (target) {
                head.updateWorldMatrix(true, false);
                lv.copy(target); head.parent.worldToLocal(lv); lv.sub(head.position);
                ty = Math.max(-0.8, Math.min(0.8, Math.atan2(-lv.x, -lv.z)));
                tp = Math.max(-0.3, Math.min(0.3, Math.atan2(lv.y, Math.hypot(lv.x, lv.z))));
              } else if (!calm) {
                // nobody to look at: now and then he glances aside
                glance.t -= dt;
                if (glance.t <= 0) { glance.t = 5 + Math.random() * 7; glance.k = 1.6; glance.yaw = (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.25); }
                if (glance.k > 0) { glance.k -= dt; ty = glance.yaw * Math.min(1, glance.k * 2); }
                ty += 0.05 * Math.sin(t * 0.4);
              }
              yaw += (ty - yaw) * Math.min(1, dt * 3.5); pitch += (tp - pitch) * Math.min(1, dt * 3.5);
              head.rotation.y = hb.y + yaw;
              head.rotation.x = hb.x + pitch + sp * (0.035 * Math.sin(t * 7.3) * Math.sin(t * 2.1) + 0.02) - 0.3 * bow + 0.16 * start + 0.015 * Math.sin(t * 0.3);
              head.rotation.z = hb.z + sp * 0.03 * Math.sin(t * 1.9);
              if (c.face) c.face.gaze(Math.max(-1, Math.min(1, (ty - yaw) * 3)), 0);
            }
            if (c.face) { if (speaking) c.face.mood(0.25, 0); c.face.update(dt); }
          }
        };
        return api;
      }

      // ---- the sky: a shader dome, tone-mapped and encoded like everything else so the horizon meets the haze ----
      var SKY_VERT = 'varying vec3 vDir;\nvoid main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
      var SKY_FRAG = [
        'uniform vec3 uSun; uniform float uTime; uniform vec3 uZenith; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uGlow;',
        'uniform vec3 uCloudA; uniform vec3 uCloudB; uniform float uCloudK; uniform vec3 uDisc;',
        'varying vec3 vDir;',
        'float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
        'float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }',
        'float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * n2(p); p *= 2.03; a *= 0.5; } return s; }',
        'void main(){',
        '  vec3 d = normalize(vDir); float y = max(d.y, 0.0);',
        '  vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.2, y));',
        '  col = mix(col, uZenith, smoothstep(0.14, 0.95, y));',
        '  float s = max(dot(d, normalize(uSun)), 0.0);',
        '  col += uGlow * (pow(s, 5.0) * 0.28 + pow(s, 48.0) * 0.55);',
        '  col = mix(col, uDisc, smoothstep(0.9993, 0.9997, s));',
        '  vec2 p = d.xz / (d.y + 0.2); p *= vec2(0.9, 1.9);',
        '  float c = fbm(p * 1.25 + vec2(uTime * 0.006, 0.0));',
        '  c = smoothstep(0.5, 0.82, c) * smoothstep(0.03, 0.28, y);',
        '  vec3 cc = mix(uCloudA, uCloudB, smoothstep(0.1, 0.7, fbm(p * 3.1)));',
        '  col = mix(col, cc, c * uCloudK);',
        '  col = mix(col, uHorizon, (1.0 - smoothstep(0.0, 0.085, y)) * 0.8);',
        '  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);',
        '  #include <encodings_fragment>',
        '}'
      ].join('\n');
      function sky(scene, o) {
        o = o || {};
        var mat = new T.ShaderMaterial({
          side: T.BackSide, depthWrite: false, fog: false,
          uniforms: {
            uSun: { value: new T.Vector3(o.sun ? o.sun[0] : 0.3, o.sun ? o.sun[1] : 0.9, o.sun ? o.sun[2] : -0.35) },
            uTime: { value: 0 },
            uZenith: { value: new T.Color(o.zenith == null ? 0x86aecc : o.zenith) },
            uMid: { value: new T.Color(o.mid == null ? 0xe6d4b6 : o.mid) },
            uHorizon: { value: new T.Color(o.horizon == null ? 0xe8cfa8 : o.horizon) },
            uGlow: { value: new T.Color(o.glow == null ? 0xffd9a0 : o.glow) },
            // night skies dim the clouds and cool the disc (defaults are the day look, unchanged)
            uCloudA: { value: o.cloudA == null ? new T.Color(1.0, 0.86, 0.72) : new T.Color(o.cloudA) },
            uCloudB: { value: o.cloudB == null ? new T.Color(1.0, 0.97, 0.9) : new T.Color(o.cloudB) },
            uCloudK: { value: o.cloudK == null ? 0.6 : o.cloudK },
            uDisc: { value: o.disc == null ? new T.Color(1.0, 0.97, 0.88) : new T.Color(o.disc) }
          },
          vertexShader: SKY_VERT,
          fragmentShader: SKY_FRAG
        });
        var mesh = new T.Mesh(new T.SphereGeometry(120, 32, 18), mat);
        mesh.renderOrder = -100;
        mesh.frustumCulled = false;
        scene.add(mesh);
        return { mesh: mesh, uniforms: mat.uniforms };
      }

      // ---- the ground: real dunes around a flat camp ----
      function duneH(x, z, seed) {
        var w = fbm(x * 0.018 + 3, z * 0.018 + 7, seed, 3, 0, 0);
        var ridge = 1 - Math.abs(fbm(x * 0.035 + w * 2, z * 0.05 - w * 1.5, seed + 4, 4, 0, 0) * 2 - 1);
        return Math.pow(ridge, 2.2) * 5.4 + fbm(x * 0.12, z * 0.12, seed + 8, 3, 0, 0) * 0.7;
      }
      function terrain(scene, paint, o) {
        o = o || {};
        var size = o.size || 170, seg = o.segments || 120, flat = o.flatRadius || 13, seed = o.seed || 21;
        var heightAt = function (x, z) {
          var r = Math.sqrt(x * x + z * z);
          return duneH(x, z, seed) * smooth(flat, flat + 24, r);
        };
        var geo = new T.PlaneGeometry(size, size, seg, seg);
        geo.rotateX(-Math.PI / 2);
        var pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
        for (var i = 0; i < pos.count; i++) {
          var x = pos.getX(i), z = pos.getZ(i), y = heightAt(x, z);
          pos.setY(i, y);
          var n = fbm(x * 0.09, z * 0.09, seed + 2, 3, 0, 0), t = clamp(0.88 + y * 0.045 + (n - 0.5) * 0.3, 0.7, 1.12);
          col[i * 3] = t; col[i * 3 + 1] = t * (0.97 + (n - 0.5) * 0.1); col[i * 3 + 2] = t * (0.92 + (0.5 - n) * 0.12);
        }
        geo.setAttribute('color', new T.BufferAttribute(col, 3));
        geo.computeVertexNormals();
        var s = tex.sand(seed);
        s.map.repeat.set(26, 26);
        s.bump.repeat.set(26, 26);
        var mat = paint({ map: s.map, bumpMap: s.bump, bumpScale: 1.4, vertexColors: true }, 0xffe0b0, 0.2);
        var mesh = new T.Mesh(geo, mat);
        mesh.receiveShadow = true;
        scene.add(mesh);
        return { mesh: mesh, heightAt: heightAt };
      }

      // ---- far mesas in layers, fading into the haze ----
      function ridges(scene, o) {
        o = o || {};
        var horizon = hex(o.horizon == null ? 0xe8cfa8 : o.horizon);
        var rings = o.rings || [
          { R: 84, h: 20, seed: 3, col: hex(0xc88a5e), haze: 0.5 },
          { R: 100, h: 30, seed: 9, col: hex(0xa98a86), haze: 0.7 }
        ];
        var pal = [[200, 122, 80], [228, 170, 112], [242, 214, 164], [182, 100, 66]];
        var out = [];
        rings.forEach(function (ring) {
          var N = 200, K = 9, pos = [], colr = [], idx = [];
          for (var i = 0; i <= N; i++) {
            var a = (i / N) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
            var q = fbm(ca * 2.4 + 20, sa * 2.4 + 20, ring.seed, 4, 0, 0) * 4.4;
            var step = Math.floor(q) + smooth(0.3, 0.7, q - Math.floor(q));
            var hh = Math.max(2.2, ring.h * (0.16 + 0.84 * step / 4.4) + fbm(ca * 14, sa * 14, ring.seed + 3, 2, 0, 0) * 1.6);
            for (var k = 0; k <= K; k++) {
              var fr = k / K, y = -1.5 + (hh + 1.5) * fr;
              pos.push(ca * ring.R, y, sa * ring.R);
              var band = fbm(a * 3, y * 0.35, ring.seed + 5, 3, 0, 0) * 3.9, c0 = pal[Math.floor(band) % 4], c1 = pal[(Math.floor(band) + 1) % 4];
              var base = mix(ring.col, mix(c0, c1, band - Math.floor(band)), 0.45);
              var hz = lerp(1, ring.haze, smooth(0.0, 0.55, fr));
              var cc = mix(base, horizon, hz);
              colr.push(Math.pow(cc[0] / 255, 2.2), Math.pow(cc[1] / 255, 2.2), Math.pow(cc[2] / 255, 2.2));
            }
          }
          for (var j = 0; j < N; j++) {
            for (var m = 0; m < K; m++) {
              var a0 = j * (K + 1) + m, b0 = (j + 1) * (K + 1) + m;
              idx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1);
            }
          }
          var g = new T.BufferGeometry();
          g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
          g.setAttribute('color', new T.Float32BufferAttribute(colr, 3));
          g.setIndex(idx);
          var mesh = new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, fog: false, toneMapped: false, side: T.DoubleSide }));
          mesh.frustumCulled = false;
          scene.add(mesh);
          out.push(mesh);
        });
        return out;
      }

      // ---- props ----
      function palm(paint, o) {
        o = o || {};
        var g = new T.Group(), h = o.height || 3.4, bend = o.bend == null ? 0.5 : o.bend;
        var curve = new T.CatmullRomCurve3([new T.Vector3(0, 0, 0), new T.Vector3(bend * 0.12, h * 0.35, 0), new T.Vector3(bend * 0.5, h * 0.72, 0), new T.Vector3(bend, h, 0)]);
        var bark = tex.bark();
        var trunk = new T.Mesh(new T.TubeGeometry(curve, 16, 0.105, 10, false), paint({ map: bark }, 0xffd8a8, 0.15));
        g.add(trunk);
        var flare = new T.Mesh(new T.CylinderGeometry(0.115, 0.2, 0.3, 10), paint({ map: bark }));
        flare.position.y = 0.12;
        g.add(flare);
        var top = curve.getPoint(1), fronds = [];
        for (var i = 0; i < 10; i++) {
          var geo = new T.PlaneGeometry(1.25, 2.4, 1, 10);
          geo.translate(0, 1.2, 0);
          var p = geo.attributes.position;
          for (var v = 0; v < p.count; v++) {
            var y = p.getY(v), t = y / 2.4;
            p.setZ(v, t * t * 1.05);
            p.setX(v, p.getX(v) * (1 - t * 0.35));
          }
          geo.computeVertexNormals();
          var frond = new T.Mesh(geo, paint({ map: tex.frond(), alphaTest: 0.45, side: T.DoubleSide }, 0xc8ff9a, 0.18));
          frond.rotation.x = 0.55 + (i % 3) * 0.28;
          var pivot = new T.Group();
          pivot.rotation.y = i * (Math.PI * 2 / 10) + (i % 2) * 0.15;
          pivot.scale.setScalar(0.85 + (i % 4) * 0.08);
          pivot.add(frond);
          pivot.position.copy(top);
          pivot.userData = { base: frond.rotation.x, ph: i * 0.8, frond: frond };
          g.add(pivot);
          fronds.push(pivot);
        }
        var dates = new T.Group();
        for (var d = 0; d < 7; d++) {
          var date = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), paint({ color: 0x8a4a22 }));
          date.scale.y = 1.4;
          date.position.set(top.x + Math.cos(d * 0.9) * 0.14, top.y - 0.18 - (d % 3) * 0.05, Math.sin(d * 0.9) * 0.14);
          dates.add(date);
        }
        g.add(dates);
        g.userData.fronds = fronds;
        return shadowy(g);
      }

      function awning(paint, o) {
        o = o || {};
        var w = o.width || 3, d = o.depth || 2.3, hi = o.height || 2.1, g = new T.Group();
        var cloth = tex.cloth(0xb85740, 0xead8b2, 8, 4);
        var geo = new T.PlaneGeometry(w, d, 18, 10);
        geo.rotateX(-Math.PI / 2);
        var p = geo.attributes.position;
        for (var i = 0; i < p.count; i++) {
          var x = p.getX(i), z = p.getZ(i), u = x / w + 0.5, v = z / d + 0.5;
          p.setY(i, hi + (v - 0.5) * 0.55 - Math.sin(u * Math.PI) * 0.14 - Math.sin(v * Math.PI) * 0.1);
        }
        geo.computeVertexNormals();
        var roof = new T.Mesh(geo, paint({ map: cloth, side: T.DoubleSide }, 0xffe0c0, 0.16));
        g.add(roof);
        var valance = new T.Mesh(new T.PlaneGeometry(w, 0.3, 16, 4), paint({ map: cloth, side: T.DoubleSide }));
        valance.position.set(0, hi - 0.43, d / 2);
        g.add(valance);
        // the roof is tied at its edges and its belly lifts and falls with the wind; the valance flies from the front edge
        var roofSim = clothSim(roof, { ws: 18, hs: 10, pin: function (ix, iy) { return ix === 0 || ix === 18 || iy === 0 || iy === 10; }, wind: [0, 2.2, 0], gust: 1.4, gravity: 3.5, damp: 0.97, iters: 3, stiff: 0 });
        var valSim = clothSim(valance, { ws: 16, hs: 4, wind: [0.6, 0, 2.4], gust: 1.2 });
        var pole = paint({ map: tex.wood(0x7a5230, 5) }, 0xffd8a8, 0.12);
        [[-w / 2, -d / 2, 0.28], [w / 2, -d / 2, 0.28], [-w / 2, d / 2, -0.27], [w / 2, d / 2, -0.27]].forEach(function (c) {
          var pl = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, hi + c[2] + 0.05, 8), pole);
          pl.position.set(c[0], (hi + c[2] + 0.05) / 2, c[1]);
          g.add(pl);
          var cap = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), paint({ color: 0xd9b25c }));
          cap.position.set(c[0], hi + c[2] + 0.05, c[1]);
          g.add(cap);
        });
        var ropeMat = paint({ color: 0x8a6a42 });
        var ropes = [-1, 1].map(function (sd) {
          var r = rope(ropeMat, [sd * w / 2, hi - 0.27 + 0.05, d / 2], [sd * (w / 2 + 0.7), 0.04, d / 2 + 1.0], { segments: 9, radius: 0.012, slack: 1.05 });
          g.add(r);
          var stake = new T.Mesh(new T.CylinderGeometry(0.025, 0.012, 0.22, 6), pole);
          stake.position.set(sd * (w / 2 + 0.7), 0.06, d / 2 + 1.0); stake.rotation.x = -0.35; g.add(stake);
          return r;
        });
        g.userData.update = function (t) { roofSim.update(t); valSim.update(t); ropes.forEach(function (r) { r.userData.update(t); }); };
        var rug = new T.Mesh(new T.PlaneGeometry(w * 0.8, d * 0.75), paint({ map: tex.cloth(0x7a2e2a, 0xd9b26a, 6, 6), polygonOffset: true, polygonOffsetFactor: -3 }));
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = 0.025;
        g.add(rug);
        [[-0.7, 0.2], [0.55, -0.2]].forEach(function (c, n) {
          var cu = new T.Mesh(new T.SphereGeometry(0.2, 12, 8), paint({ map: tex.cloth(n ? 0x2f5f78 : 0xb8863a, 0xe6d3a8, 4, 9) }));
          cu.scale.set(1.3, 0.55, 0.95);
          cu.position.set(c[0], 0.14, c[1]);
          cu.rotation.y = n * 0.9;
          g.add(cu);
        });
        return shadowy(g);
      }

      function amphora(paint, o) {
        o = o || {};
        var s = o.scale || 1, g = new T.Group();
        var prof = [[0.001, 0], [0.11, 0.01], [0.2, 0.1], [0.27, 0.3], [0.28, 0.46], [0.22, 0.66], [0.12, 0.8], [0.095, 0.88], [0.13, 0.94], [0.15, 0.97]]
          .map(function (q) { return new T.Vector2(q[0], q[1]); });
        var mat = paint({ map: tex.pottery(o.body || 0xc2683c, o.band || 0x5a2412, o.seed || 3) }, 0xffd0a0, 0.2);
        g.add(new T.Mesh(new T.LatheGeometry(prof, 28), mat));
        [-1, 1].forEach(function (sd) {
          var h = new T.Mesh(new T.TorusGeometry(0.1, 0.02, 6, 12, Math.PI), mat);
          h.position.set(sd * 0.11, 0.82, 0);
          h.rotation.z = sd > 0 ? -Math.PI / 2 : Math.PI / 2;
          h.rotation.y = Math.PI / 2;
          g.add(h);
        });
        g.scale.setScalar(s);
        return shadowy(g);
      }

      function crate(paint, o) {
        o = o || {};
        var g = new T.Group(), w = o.w || 0.62, h = o.h || 0.46, d = o.d || 0.46;
        var wood = paint({ map: tex.wood(0x8a5c34, 7) }, 0xffd8a8, 0.12);
        g.add(new T.Mesh(new T.BoxGeometry(w, h, d), wood));
        var band = paint({ color: 0x3a2a1c });
        [-1, 1].forEach(function (sd) {
          var b = new T.Mesh(new T.BoxGeometry(0.05, h + 0.02, d + 0.02), band);
          b.position.x = sd * (w / 2 - 0.08);
          g.add(b);
        });
        g.children.forEach(function (m) { m.position.y += h / 2; });
        return shadowy(g);
      }

      function sack(paint, o) {
        o = o || {};
        var g = new T.Group(), c = o.color || 0xd8c49a;
        var body = new T.Mesh(new T.SphereGeometry(0.28, 16, 12), paint({ map: tex.cloth(c, 0xc8b283, 24, 2) }, 0xfff0d0, 0.14));
        body.scale.set(1, 0.95, 0.82);
        body.position.y = 0.26;
        g.add(body);
        var neck = new T.Mesh(new T.ConeGeometry(0.1, 0.18, 10), paint({ color: 0xc8b283 }));
        neck.position.y = 0.58;
        g.add(neck);
        var tie = new T.Mesh(new T.TorusGeometry(0.075, 0.014, 6, 12), paint({ color: 0x6a4524 }));
        tie.rotation.x = Math.PI / 2;
        tie.position.y = 0.5;
        g.add(tie);
        return shadowy(g);
      }

      function firepit(paint, o) {
        o = o || {};
        var g = new T.Group(), r = rng(o.seed || 12);
        var stone = paint({ map: tex.strata(2) }, 0xffe0b8, 0.2);
        for (var i = 0; i < 10; i++) {
          var a = i / 10 * Math.PI * 2, s = 0.11 + r() * 0.07;
          var m = new T.Mesh(new T.DodecahedronGeometry(s, 0), stone);
          m.position.set(Math.cos(a) * 0.5, s * 0.5, Math.sin(a) * 0.5);
          m.rotation.set(r() * 3, r() * 3, r() * 3);
          g.add(m);
        }
        var ash = new T.Mesh(new T.CircleGeometry(0.42, 18), paint({ color: 0x3a3532, polygonOffset: true, polygonOffsetFactor: -3 }));
        ash.rotation.x = -Math.PI / 2;
        ash.position.y = 0.02;
        g.add(ash);
        var char = paint({ color: 0x1e1612 });
        [[0.1, 0.2], [-0.12, -0.15], [0.2, -0.12]].forEach(function (c, n) {
          var lg = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 0.55, 8), char);
          lg.position.set(c[0] * 0.5, 0.07, c[1] * 0.5);
          lg.rotation.set(Math.PI / 2, 0, n * 1.1);
          g.add(lg);
        });
        return shadowy(g);
      }

      function column(paint, stoneMat, o) {
        o = o || {};
        var g = new T.Group(), h = o.height || 2.2, r = rng(o.seed || 4);
        var geo = new T.CylinderGeometry(0.33, 0.38, h, 32, 6);
        var p = geo.attributes.position;
        for (var i = 0; i < p.count; i++) {
          var x = p.getX(i), z = p.getZ(i), y = p.getY(i), a = Math.atan2(z, x), rad = Math.sqrt(x * x + z * z);
          if (rad > 0.001) {
            var f = 1 + Math.cos(a * 16) * 0.05;
            p.setX(i, x * f); p.setZ(i, z * f);
          }
          if (y > h / 2 - 0.02) p.setY(i, y - (vnoise(x * 5 + 3, z * 5 + 3, 7, 0, 0) * 0.45 + Math.max(0, Math.cos(a - 0.6)) * 0.25));
        }
        geo.computeVertexNormals();
        var shaft = new T.Mesh(geo, stoneMat);
        shaft.position.y = h / 2 + 0.2;
        g.add(shaft);
        var base = new T.Mesh(new T.CylinderGeometry(0.5, 0.58, 0.22, 28), stoneMat);
        base.position.y = 0.11;
        g.add(base);
        for (var k = 0; k < 3; k++) {
          var chunk = new T.Mesh(new T.DodecahedronGeometry(0.12 + r() * 0.1, 0), stoneMat);
          chunk.position.set((r() - 0.5) * 1.6, 0.1, 0.55 + r() * 0.6);
          chunk.rotation.set(r() * 3, r() * 3, r() * 3);
          g.add(chunk);
        }
        return shadowy(g);
      }

      function rocks(paint, o) {
        o = o || {};
        var g = new T.Group(), r = rng(o.seed || 17), n = o.count || 4, s0 = o.scale || 1;
        var st = tex.strata(o.seed || 7);
        var mat = paint({ map: st, flatShading: true }, 0xffe2b8, 0.22);
        for (var i = 0; i < n; i++) {
          var geo = new T.IcosahedronGeometry(1, 1), p = geo.attributes.position;
          for (var v = 0; v < p.count; v++) {
            var x = p.getX(v), y = p.getY(v), z = p.getZ(v);
            var d = 1 + (vnoise(x * 1.4 + i * 5, y * 1.4 + z * 1.4, 31 + i, 0, 0) - 0.5) * 1.1 + Math.sin(y * 7 + i) * 0.03;
            p.setXYZ(v, x * d, Math.max(y * d, -0.35), z * d);
          }
          geo.computeVertexNormals();
          var m = new T.Mesh(geo, mat);
          var s = s0 * (i === 0 ? 1 : 0.35 + r() * 0.4);
          m.scale.set(s * (1 + r() * 0.5), s * (0.7 + r() * 0.5), s * (1 + r() * 0.4));
          m.position.set(i === 0 ? 0 : (r() - 0.5) * 2.6 * s0, m.scale.y * 0.3, i === 0 ? 0 : (r() - 0.5) * 2.2 * s0);
          m.rotation.y = r() * 6;
          g.add(m);
        }
        return shadowy(g);
      }

      // Camel prints heading off toward a bearing (north is -z), pairs of pads, a stride apart.
      function tracks(scene, o) {
        o = o || {};
        var n = o.count || 34, geo = new T.CircleGeometry(0.15, 12), r = rng(o.seed || 8);
        var mat = new T.MeshBasicMaterial({ color: 0x4a2a14, transparent: true, opacity: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
        var im = new T.InstancedMesh(geo, mat, n * 2), dummy = new T.Object3D();
        var ang = ((o.bearing == null ? 14 : o.bearing) * Math.PI) / 180, dx = Math.sin(ang), dz = -Math.cos(ang);
        var sx = o.x == null ? -1 : o.x, sz = o.z == null ? -4 : o.z, c = 0;
        for (var i = 0; i < n; i++) {
          [-1, 1].forEach(function (sd) {
            var along = i * 0.95 + (sd > 0 ? 0.45 : 0), side = sd * 0.34 + (r() - 0.5) * 0.06;
            dummy.position.set(sx + dx * along - dz * side, 0.04, sz + dz * along + dx * side);
            dummy.rotation.set(-Math.PI / 2, 0, -ang);
            dummy.scale.set(0.9 + r() * 0.15, 1.35 + r() * 0.2, 1);
            dummy.updateMatrix();
            im.setMatrixAt(c++, dummy.matrix);
          });
        }
        im.instanceMatrix.needsUpdate = true;
        scene.add(im);
        return im;
      }

      // Pebbles, dry tufts and scrub, scattered over the dunes with a clear camp in the middle.
      function scatter(scene, paint, heightAt, o) {
        o = o || {};
        var r = rng(o.seed || 31), dummy = new T.Object3D(), col = new T.Color(), keep = o.clear || 5.2, cx = o.cx || 0, cz = o.cz || 0.75;
        function ring(inner, span) {
          var a = r() * Math.PI * 2, rad = inner + Math.pow(r(), 0.7) * span;
          return [cx + Math.cos(a) * rad, cz + Math.sin(a) * rad];
        }
        var pebbles = new T.InstancedMesh(new T.DodecahedronGeometry(1, 0), paint({ color: 0xffffff }, 0xffe0b8, 0.15), o.pebbles || 280);
        var pal = [0xb08760, 0x9a7450, 0xc49a6c, 0x8a6a48, 0xd0a878];
        for (var i = 0; i < pebbles.count; i++) {
          var p = ring(keep, 34), s = 0.04 + r() * 0.15 * (r() < 0.12 ? 2 : 1);
          dummy.position.set(p[0], heightAt(p[0], p[1]) + s * 0.3, p[1]);
          dummy.rotation.set(r() * 3, r() * 3, r() * 3);
          dummy.scale.set(s * (1 + r() * 0.5), s * (0.6 + r() * 0.4), s * (1 + r() * 0.5));
          dummy.updateMatrix();
          pebbles.setMatrixAt(i, dummy.matrix);
          pebbles.setColorAt(i, col.setHex(pal[Math.floor(r() * pal.length)]));
        }
        pebbles.castShadow = true; pebbles.receiveShadow = true;
        pebbles.instanceMatrix.needsUpdate = true; pebbles.instanceColor.needsUpdate = true;
        scene.add(pebbles);

        var bladeGeo = new T.ConeGeometry(0.022, 0.42, 4, 1);
        bladeGeo.translate(0, 0.21, 0);
        var blades = new T.InstancedMesh(bladeGeo, paint({ color: 0xffffff, side: T.DoubleSide }, 0xfff0c0, 0.12), o.tufts || 620);
        var straw = [0xc8b068, 0xa89048, 0x8e8a4a, 0xd8c078];
        var c = 0;
        while (c < blades.count) {
          var q = ring(keep + 0.6, 30), n = 5 + Math.floor(r() * 4);
          for (var b = 0; b < n && c < blades.count; b++) {
            var ox = q[0] + (r() - 0.5) * 0.28, oz = q[1] + (r() - 0.5) * 0.28, sc = 0.7 + r() * 0.9;
            dummy.position.set(ox, heightAt(ox, oz), oz);
            dummy.rotation.set((r() - 0.5) * 0.7, r() * 6, (r() - 0.5) * 0.7);
            dummy.scale.set(1, sc, 1);
            dummy.updateMatrix();
            blades.setMatrixAt(c, dummy.matrix);
            blades.setColorAt(c, col.setHex(straw[Math.floor(r() * straw.length)]));
            c++;
          }
        }
        blades.castShadow = true;
        blades.instanceMatrix.needsUpdate = true; blades.instanceColor.needsUpdate = true;
        scene.add(blades);

        var scrub = new T.InstancedMesh(new T.IcosahedronGeometry(1, 1), paint({ color: 0xffffff }, 0xe8f0b0, 0.12), o.scrub || 26);
        var green = [0x6a7a3a, 0x7e8a46, 0x8c8446];
        for (var k = 0; k < scrub.count; k++) {
          var z2 = ring(keep + 2, 28), s2 = 0.22 + r() * 0.3;
          dummy.position.set(z2[0], heightAt(z2[0], z2[1]) + s2 * 0.35, z2[1]);
          dummy.rotation.set(0, r() * 6, 0);
          dummy.scale.set(s2 * 1.3, s2 * 0.7, s2 * 1.1);
          dummy.updateMatrix();
          scrub.setMatrixAt(k, dummy.matrix);
          scrub.setColorAt(k, col.setHex(green[Math.floor(r() * green.length)]));
        }
        scrub.castShadow = true; scrub.receiveShadow = true;
        scrub.instanceMatrix.needsUpdate = true; scrub.instanceColor.needsUpdate = true;
        scene.add(scrub);
        return [pebbles, blades, scrub];
      }

      // ---- the air: dust in the light, sand on the wind, birds far up ----
      function air(scene, o) {
        o = o || {};
        var r = rng(o.seed || 55), soft = tex.soft();
        function cloud(count, size, color, opacity, spread, y0, y1) {
          var pos = new Float32Array(count * 3);
          for (var i = 0; i < count; i++) {
            pos[i * 3] = (r() - 0.5) * spread * 2;
            pos[i * 3 + 1] = y0 + r() * (y1 - y0);
            pos[i * 3 + 2] = (r() - 0.5) * spread * 2 + (o.cz || 0);
          }
          var geo = new T.BufferGeometry();
          geo.setAttribute('position', new T.BufferAttribute(pos, 3));
          var pts = new T.Points(geo, new T.PointsMaterial({ map: soft, size: size, color: color, transparent: true, opacity: opacity, depthWrite: false, sizeAttenuation: true }));
          pts.frustumCulled = false;
          scene.add(pts);
          return { pts: pts, base: pos.slice(), spread: spread };
        }
        var dust = cloud(o.dust || 90, 0.16, 0xffe6c0, 0.5, 12, 0.3, 4.2);
        var sand = cloud(o.sand || 150, 0.07, 0xf2cf9a, 0.7, 14, 0.04, 0.55);
        var birdTex;
        (function () {
          var c = document.createElement('canvas');
          c.width = 64; c.height = 32;
          var g = c.getContext('2d');
          g.strokeStyle = 'rgba(58,36,22,0.9)'; g.lineWidth = 3; g.lineCap = 'round';
          g.beginPath(); g.moveTo(4, 22); g.quadraticCurveTo(18, 4, 32, 18); g.quadraticCurveTo(46, 4, 60, 22); g.stroke();
          birdTex = new T.CanvasTexture(c);
        })();
        var birds = [];
        for (var b = 0; b < (o.birds == null ? 3 : o.birds); b++) {
          var sp = new T.Sprite(new T.SpriteMaterial({ map: birdTex, transparent: true, depthWrite: false, fog: false }));
          sp.scale.set(1.5, 0.75, 1);
          sp.userData = { a: b * 2.1, rad: 38 + b * 6, y: 15 + b * 2.4, spd: 0.07 + b * 0.012 };
          scene.add(sp);
          birds.push(sp);
        }
        return {
          update: function (t, dt, reduced) {
            if (reduced) return;
            [dust, sand].forEach(function (c, n) {
              var a = c.pts.geometry.attributes.position.array, base = c.base;
              for (var i = 0; i < a.length; i += 3) {
                var k = i / 3, drift = (t * (n ? 1.5 : 0.18) + k * 0.37) % (c.spread * 2);
                a[i] = ((base[i] + c.spread + drift) % (c.spread * 2)) - c.spread;
                a[i + 1] = base[i + 1] + Math.sin(t * (n ? 2.1 : 0.7) + k) * (n ? 0.03 : 0.22);
                a[i + 2] = base[i + 2] + Math.sin(t * 0.4 + k * 1.3) * 0.2;
              }
              c.pts.geometry.attributes.position.needsUpdate = true;
            });
            birds.forEach(function (s) {
              var u = s.userData;
              u.a += dt * u.spd;
              s.position.set(Math.cos(u.a) * u.rad, u.y + Math.sin(u.a * 3) * 1.2, -Math.abs(Math.sin(u.a)) * u.rad - 14);
              s.scale.y = 0.75 * (0.55 + 0.45 * Math.abs(Math.sin(t * 3.2 + u.a * 5)));
            });
          }
        };
      }

      // ---- lights: a key with soft shadows, a cool fill, a warm rim from behind, a sky/ground wash ----
      function lights(scene, o) {
        o = o || {};
        var key = new T.DirectionalLight(o.key == null ? 0xfff0d4 : o.key, o.keyI == null ? 1.15 : o.keyI);
        key.position.set(o.kx == null ? 8 : o.kx, o.ky == null ? 13 : o.ky, o.kz == null ? 2 : o.kz);
        key.target.position.set(o.tx == null ? 0 : o.tx, 0, o.tz == null ? 0.7 : o.tz);
        if (o.shadow !== false) {
          var m = o.shadowSize || 2048, e = o.shadowExtent || 13, c;
          key.castShadow = true;
          key.shadow.mapSize.set(m, m);
          c = key.shadow.camera;
          c.left = -e; c.right = e; c.top = e; c.bottom = -e; c.near = 2; c.far = 60;
          c.updateProjectionMatrix();
          key.shadow.bias = -0.0006;
          key.shadow.normalBias = 0.03;
          key.shadow.radius = 3.5;
        }
        var fill = new T.DirectionalLight(o.fill == null ? 0xc9d6ff : o.fill, o.fillI == null ? 0.26 : o.fillI);
        fill.position.set(-6, 5, 9);
        var back = new T.DirectionalLight(o.back == null ? 0xffb060 : o.back, o.backI == null ? 0.5 : o.backI);
        back.position.set(-4, 8, -10);
        var hemi = new T.HemisphereLight(o.sky == null ? 0xffe7c4 : o.sky, o.ground == null ? 0xc47a42 : o.ground, o.hemi == null ? 0.5 : o.hemi);
        var amb = new T.AmbientLight(0xffe4c4, o.amb == null ? 0.16 : o.amb);
        scene.add(key, key.target, fill, back, hemi, amb);
        return { key: key, fill: fill, back: back, hemi: hemi, amb: amb };
      }

      // ---- the whole camp in one call ----
      function desertCamp(scene, o) {
        o = o || {};
        var paint = o.paint || paintFor();
        var horizon = o.horizon == null ? 0xe8cfa8 : o.horizon;
        // three lays the fog after the tone curve and the encoding: the sky's horizon colour as it shows is the seamless one
        scene.fog = new T.Fog(horizon, o.fogNear || 22, o.fogFar || 72);
        var skyObj = sky(scene, { horizon: horizon, zenith: o.zenith, mid: o.mid, glow: o.glow, sun: o.sun });
        var ground = terrain(scene, paint, { seed: o.seed || 21, flatRadius: o.flatRadius || 13 });
        var far = ridges(scene, { horizon: horizon });
        var heightAt = ground.heightAt;
        var cx = o.cx == null ? 0 : o.cx, cz = o.cz == null ? 0.75 : o.cz;

        // flagstone paving under the wells
        var fd = tex.flagDisc(5);
        var pave = new T.Mesh(new T.CircleGeometry(o.pavingRadius || 5.1, 48),
          paint({ map: fd.map, bumpMap: fd.bump, bumpScale: 1.8, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }, 0xffe6c0, 0.16));
        pave.rotation.x = -Math.PI / 2;
        pave.position.set(cx, 0.02, cz);
        pave.receiveShadow = true;
        scene.add(pave);

        var place = function (obj, x, z, ry, s) {
          obj.position.set(x, heightAt(x, z), z);
          obj.rotation.y = ry || 0;
          if (s) obj.scale.setScalar(s);
          scene.add(obj);
          return obj;
        };
        var m = tex.masonry(9, 5, 3), stoneMat = paint({ map: m.map, bumpMap: m.bump, bumpScale: 1.6 }, 0xffe2b8, 0.22);
        var palms = [
          place(palm(paint, { height: 3.7, bend: 0.65 }), -7.4, -4.8, 0.4),
          place(palm(paint, { height: 4.3, bend: -0.55 }), 7.8, -5.4, 1.9),
          place(palm(paint, { height: 3.9, bend: 0.4 }), -11, -10.2, 2.6),
          place(palm(paint, { height: 3.4, bend: -0.3 }), 11.8, -9.4, 0.8),
          place(palm(paint, { height: 4.6, bend: 0.5 }), 4.6, -11.2, 3.3)
        ];
        place(column(paint, stoneMat, { height: 2.3, seed: 4 }), -5.6, -7.6, 0.3);
        place(column(paint, stoneMat, { height: 1.5, seed: 9 }), 5.3, -8, 1.2);
        var fallen = column(paint, stoneMat, { height: 2.1, seed: 12 });
        fallen.rotation.set(0, 0.9, Math.PI / 2 - 0.06);
        fallen.position.set(8.6, 0.62, -6.6);
        scene.add(fallen);
        var tent = place(awning(paint, { width: 2.9, depth: 2.2, height: 2.0 }), -5.2, -2.8, 0.38);
        place(firepit(paint), 4.7, -2.7, 0.5);
        place(crate(paint), -3.6, -3.4, 0.5);
        place(crate(paint, { w: 0.5, h: 0.4, d: 0.5 }), -3.55, -3.45, 0.2).position.y += 0.46;
        place(sack(paint), -3.0, -2.6, 0.3);
        place(sack(paint, { color: 0xcdb98c }), -3.5, -2.2, 1.4);
        place(amphora(paint, { body: 0xc2683c, band: 0x5a2412, seed: 3, scale: 1.1 }), 3.6, -3.4, 0.2);
        place(amphora(paint, { body: 0xa8532e, band: 0xe6c88a, seed: 6, scale: 0.9 }), 4.15, -3.1, 1.0);
        var tipped = amphora(paint, { body: 0xb85e36, band: 0x40200e, seed: 8, scale: 1 });
        tipped.rotation.set(0, 0.5, Math.PI / 2 - 0.15);
        tipped.position.set(3.1, 0.3, -3.0);
        scene.add(tipped);
        place(amphora(paint, { body: 0xc2683c, band: 0x5a2412, seed: 5, scale: 0.8 }), 3.0, 4.4, 0.4);
        place(rocks(paint, { seed: 17, scale: 0.9, count: 4 }), 9.6, -1.6, 0.4);
        place(rocks(paint, { seed: 23, scale: 1.1, count: 5 }), -10.4, -3.2, 1.6);
        place(rocks(paint, { seed: 31, scale: 1.7, count: 5 }), -4, -14.5, 0.2);
        place(rocks(paint, { seed: 41, scale: 1.9, count: 5 }), 7.5, -15.5, 2.0);
        place(rocks(paint, { seed: 53, scale: 0.55, count: 3 }), 2.7, 4.8, 0.7);
        place(rocks(paint, { seed: 59, scale: 0.5, count: 3 }), -3.8, 4.2, 1.1);
        scatter(scene, paint, heightAt, { cx: cx, cz: cz, clear: 5.3 });
        tracks(scene, { x: -1.2, z: -4.4, bearing: 14, count: 34 });
        var airObj = air(scene, { cz: cz });

        shadowy(pave, false, true);
        return {
          sky: skyObj, ground: ground.mesh, ridges: far, palms: palms, heightAt: heightAt, stoneMat: stoneMat,
          update: function (t, dt, reduced) {
            skyObj.uniforms.uTime.value = t;
            airObj.update(t, dt || 0.016, reduced);
            if (tent && tent.userData.update) tent.userData.update(t);
            if (!reduced) {
              palms.forEach(function (pm, n) {
                (pm.userData.fronds || []).forEach(function (pv) {
                  pv.userData.frond.rotation.x = pv.userData.base + Math.sin(t * 0.9 + pv.userData.ph + n) * 0.05;
                });
              });
            }
          }
        };
      }


      // =====================================================================
      // Second shelf: people, fire, cloth, cliffs, light and a camera you can move.
      // Used first by "At the Gates of Tower II"; any walk or scene can ask for them.
      // =====================================================================

      // A lathe with a fold function: fold(theta, t) -> { r: radius factor, y: height offset }. For robes, urns, skirts.
      function foldedLathe(profile, segs, fold) {
        var pos = [], uv = [], idx = [], n = profile.length;
        for (var i = 0; i < n; i++) {
          for (var j = 0; j <= segs; j++) {
            var th = j / segs * Math.PI * 2, t = i / (n - 1), f = fold ? fold(th, t) : { r: 1, y: 0 };
            var r = profile[i][0] * f.r;
            pos.push(Math.sin(th) * r, profile[i][1] + (f.y || 0), Math.cos(th) * r);
            uv.push(j / segs, t);
          }
        }
        for (var a = 0; a < n - 1; a++) {
          for (var b = 0; b < segs; b++) {
            var i0 = a * (segs + 1) + b, i1 = i0 + segs + 1;
            idx.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1);
          }
        }
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        return g;
      }

      // Cloth of a robe: pleats down its length, a stitched hem band, fine weave. u around, v along (0 at the hem).
      tex.robe = function (base, trim, seed) {
        var key = 'robe' + base + '_' + trim + '_' + (seed || 1);
        if (cache[key]) return cache[key];
        var c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        var g = c.getContext('2d'), r = rng(seed || 1), B = hex(base), D = hex(trim);
        var gr = g.createLinearGradient(0, 512, 0, 0);
        gr.addColorStop(0, 'rgb(' + Math.floor(B[0] * 0.7) + ',' + Math.floor(B[1] * 0.7) + ',' + Math.floor(B[2] * 0.7) + ')');
        gr.addColorStop(1, 'rgb(' + B.join(',') + ')');
        g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
        for (var x = 0; x < 512; x += 16) {
          g.fillStyle = ((x / 16) % 2) ? 'rgba(0,0,0,0.13)' : 'rgba(255,230,200,0.07)';
          g.fillRect(x, 0, 8, 512);
        }
        for (var i = 0; i < 1400; i++) {
          g.fillStyle = r() < 0.5 ? 'rgba(255,235,210,0.06)' : 'rgba(0,0,0,0.08)';
          g.fillRect(r() * 512, r() * 512, 1 + r() * 2, 6 + r() * 20);
        }
        // hem band (near v = 0, which is the bottom of the canvas)
        g.fillStyle = 'rgb(' + D.join(',') + ')'; g.fillRect(0, 462, 512, 34);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 462, 512, 3); g.fillRect(0, 493, 512, 3);
        g.fillStyle = 'rgba(255,240,190,0.7)';
        for (var k = 0; k < 512; k += 32) {
          g.beginPath(); g.moveTo(k, 479); g.lineTo(k + 8, 470); g.lineTo(k + 16, 479); g.lineTo(k + 8, 488); g.closePath(); g.fill();
        }
        // a little worn at the very hem
        var wear = g.createLinearGradient(0, 512, 0, 440);
        wear.addColorStop(0, 'rgba(120,80,40,0.45)'); wear.addColorStop(1, 'rgba(120,80,40,0)');
        g.fillStyle = wear; g.fillRect(0, 440, 512, 72);
        var t = new T.CanvasTexture(c);
        t.wrapS = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 8;
        cache[key] = t;
        return t;
      };

      // Strands of white hair, for beards and brows
      tex.hair = function (tone) {
        var key = 'hair' + (tone || 'w');
        if (cache[key]) return cache[key];
        var c = document.createElement('canvas');
        c.width = c.height = 256;
        var g = c.getContext('2d'), r = rng(5);
        g.fillStyle = tone === 'grey' ? '#cfcdc6' : '#efede8'; g.fillRect(0, 0, 256, 256);
        for (var i = 0; i < 640; i++) {
          var x = r() * 256, y = r() * 256, l = 24 + r() * 70;
          g.strokeStyle = r() < 0.5 ? 'rgba(140,146,160,0.38)' : 'rgba(255,255,255,0.75)';
          g.lineWidth = 1 + r() * 1.6;
          g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 10, y + l / 2, x + (r() - 0.5) * 14, y + l); g.stroke();
        }
        var t = new T.CanvasTexture(c);
        t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 8;
        cache[key] = t;
        return t;
      };

      // The Order's sign: a disc half in light, half in shade
      tex.eclipse = function (light, dark) {
        var key = 'ecl' + light + '_' + dark;
        if (cache[key]) return cache[key];
        var c = document.createElement('canvas');
        c.width = c.height = 256;
        var g = c.getContext('2d'), L = hex(light), D = hex(dark);
        g.fillStyle = 'rgb(' + D.join(',') + ')'; g.beginPath(); g.arc(128, 128, 122, 0, Math.PI * 2); g.fill();
        var gl = g.createRadialGradient(100, 100, 10, 128, 128, 122);
        gl.addColorStop(0, 'rgb(' + Math.min(255, L[0] + 40) + ',' + Math.min(255, L[1] + 40) + ',' + Math.min(255, L[2] + 30) + ')');
        gl.addColorStop(1, 'rgb(' + L.join(',') + ')');
        g.fillStyle = gl; g.beginPath(); g.arc(128, 128, 122, Math.PI / 2, Math.PI * 1.5); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(40,24,8,0.8)'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = 'rgba(255,236,170,0.65)'; g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.stroke();
        var t = new T.CanvasTexture(c);
        t.encoding = T.sRGBEncoding; t.anisotropy = 8;
        cache[key] = t;
        return t;
      };

      tex.flame = function () {
        if (cache.flame) return cache.flame;
        var c = document.createElement('canvas');
        c.width = 64; c.height = 128;
        var g = c.getContext('2d');
        var gr = g.createRadialGradient(32, 92, 2, 32, 82, 56);
        gr.addColorStop(0, 'rgba(255,250,214,1)');
        gr.addColorStop(0.28, 'rgba(255,196,84,0.95)');
        gr.addColorStop(0.62, 'rgba(240,110,28,0.5)');
        gr.addColorStop(1, 'rgba(180,50,10,0)');
        g.fillStyle = gr;
        g.beginPath(); g.moveTo(32, 2); g.bezierCurveTo(60, 60, 64, 96, 32, 126); g.bezierCurveTo(0, 96, 4, 60, 32, 2); g.fill();
        cache.flame = new T.CanvasTexture(c);
        return cache.flame;
      };

      // A person with a long beard, a hood, a heavy robe and a staff crowned by a star-sight.
      // Faces -z (turn it with rotation.y). o: robe, trim, mantle (hex), stone (a statue in sandstone), scale.
      function elder(paint, o) {
        o = o || {};
        var g = new T.Group(), stone = !!o.stone, F0 = window.EclipseFigure;
        var soft = tex.soft();
        var stoneMat = stone ? paint({ map: tex.strata(7), color: 0xe6c0a0, flatShading: false }, 0xffe0b8, 0.22) : null;
        function M(opts, rc, rk) { return stone ? stoneMat : paint(opts, rc, rk); }
        var robeMat = M({ map: tex.robe(o.robe == null ? 0x5a2e1c : o.robe, o.trim == null ? 0xd4a345 : o.trim, 3), side: T.DoubleSide }, 0xffb878, 0.3);
        var mantleMat = M({ color: o.mantle == null ? 0x2e1a10 : o.mantle, side: T.DoubleSide }, 0xffb878, 0.28);
        var skin = M({ color: tone(0xa8734c) }, 0xffc890, 0.3);
        var hairM = M({ map: tex.hair(), color: 0xffffff }, 0xffffff, 0.35);
        var brass = M({ color: 0xd9aa4a, emissive: 0x3a2404 }, 0xfff0b0, 0.6);
        var iron = M({ color: 0x34322f }, 0xffb878, 0.3);
        var leather = M({ color: 0x5a3418 }, 0xffc890, 0.25);
        var ink = new T.MeshBasicMaterial({ color: 0x1c120c });

        function put(mesh, x, y, z, parent) { mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; (parent || g).add(mesh); return mesh; }
        function ell(geo, mat, sx, sy, sz) { var m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); return m; }
        function limb(a, b, rTop, rBot, mat) {
          var A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]);
          // a wide sleeve: it swells at the elbow, opens at the cuff and keeps its folds
          var len = A.distanceTo(B), mid = (rTop + rBot) / 2;
          var m = new T.Mesh(loft([[0, 0.03, 0, rTop, rTop], [0, -len * 0.45, 0, mid * 1.12, mid * 1.16], [0, -len * 0.8, 0, rBot * 0.96, rBot], [0, -len, 0, rBot, rBot * 1.04]], { radial: 18, caps: false, bump: function (a2, u) { return 1 + 0.07 * Math.sin(a2 * 6 + u * 8) * Math.sin(u * Math.PI); } }), mat);
          m.position.copy(A);
          m.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), B.clone().sub(A).normalize());
          m.castShadow = true; g.add(m);
          return m;
        }

        // robe: pleats all round and a scalloped hem
        var pleat = function (th, t) { return { r: 1 + 0.05 * Math.sin(th * 10 + t * 2) * (1 - t * 0.6) + 0.02 * Math.sin(th * 5 + 1), y: t < 0.05 ? 0.03 * Math.sin(th * 10) : 0 }; };
        var robeProf = [[0.54, 0.02], [0.5, 0.2], [0.43, 0.45], [0.37, 0.75], [0.31, 1.05], [0.28, 1.28], [0.3, 1.42], [0.23, 1.52], [0.13, 1.58], [0.1, 1.62]];
        put(new T.Mesh(foldedLathe(robeProf, 64, pleat), robeMat), 0, 0, 0);
        // mantle over the shoulders with a heavy fall behind
        var mfold = function (th, t) { return { r: 1 + 0.035 * Math.sin(th * 8), y: t > 0.8 ? -0.04 * (0.5 + 0.5 * Math.cos(th * 12)) : 0 }; };
        put(new T.Mesh(foldedLathe([[0.14, 1.6], [0.24, 1.58], [0.33, 1.5], [0.385, 1.4], [0.4, 1.31]], 56, mfold), mantleMat), 0, 0, 0);
        var trim = put(new T.Mesh(new T.TorusGeometry(0.4, 0.012, 8, 56), brass), 0, 1.31, 0);
        trim.rotation.x = Math.PI / 2;
        // belt, buckle, pouch and a ring of keys
        var belt = put(new T.Mesh(new T.TorusGeometry(0.31, 0.035, 10, 48), leather), 0, 0.98, 0);
        belt.rotation.x = Math.PI / 2;
        put(new T.Mesh(new T.BoxGeometry(0.09, 0.08, 0.03), brass), 0, 0.98, -0.318);
        put(new T.Mesh(new T.BoxGeometry(0.14, 0.15, 0.08), leather), 0.26, 0.9, -0.2);
        var ring = put(new T.Mesh(new T.TorusGeometry(0.05, 0.007, 6, 16), brass), -0.2, 0.84, -0.26);
        for (var k = 0; k < 3; k++) {
          var key = put(new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 0.09 + k * 0.015, 5), brass), -0.2 + (k - 1) * 0.012, 0.77 - k * 0.012, -0.265);
          key.rotation.z = (k - 1) * 0.15;
        }
        // a keeper's stole: two embroidered bands from the shoulders to the knee, weighted with brass
        var stoleMat = M({ map: tex.cloth(0x7a2c1c, F0.mixHex(o.trim == null ? 0xd4a345 : o.trim, 0x7a4a1c, 0.35), 1, 31), side: T.DoubleSide }, 0xffe0a0, 0.3);
        [-1, 1].forEach(function (sd) {
          var x = sd * 0.15;
          put(new T.Mesh(F0.tube([[x * 0.8, 1.56, 0.02], [x, 1.5, -0.16], [x, 1.3, -0.262], [x, 1.05, -0.3], [x, 0.78, -0.355], [x, 0.56, -0.405]], 0.05, { segments: 22, radial: 8, flat: 0.16 }), stoleMat), 0, 0, 0);
          put(new T.Mesh(new T.BoxGeometry(0.1, 0.022, 0.02), brass), x, 0.555, -0.408);
          for (var q = 0; q < 3; q++) put(new T.Mesh(new T.ConeGeometry(0.01, 0.06, 5), brass), x + (q - 1) * 0.032, 0.515, -0.41).rotation.z = Math.PI;
        });
        // the Order's medallion on a chain
        var chain = put(new T.Mesh(new T.TorusGeometry(0.2, 0.006, 6, 36, Math.PI), brass), 0, 1.5, -0.04);
        chain.rotation.set(Math.PI / 2 + 0.55, 0, Math.PI);
        var medal = put(new T.Mesh(new T.CircleGeometry(0.06, 24), stone ? stoneMat : new T.MeshBasicMaterial({ map: tex.eclipse(0xf2c25a, 0x2a1810) })), 0, 1.24, -0.285);
        medal.rotation.y = Math.PI;

        // hood lying round the head, open at the front
        var hoodMat = mantleMat;
        var hood = put(ell(new T.SphereGeometry(0.205, 30, 20, Math.PI * 1.5 + 0.75, Math.PI * 2 - 1.5, 0, 2.5), hoodMat, 1.28, 1.4, 1.34), 0, 1.72, 0.03);
        hood.rotation.x = -0.1;
        var hoodTail = put(new T.Mesh(new T.ConeGeometry(0.1, 0.34, 14), mantleMat), 0, 1.4, 0.2);
        hoodTail.rotation.x = 0.18;

        // head: a long weathered face, deep-set eyes under heavy white brows, a big moustache, a long beard
        var head = new T.Group();
        head.position.set(0, 1.72, 0);
        head.scale.setScalar(1.28);
        g.add(head);
        function hput(mesh, x, y, z) { mesh.position.set(x, y, z); mesh.castShadow = true; head.add(mesh); return mesh; }
        // (EclipseFigure) a sculpted skull and a painted face: hollow cheeks, a great hooked nose, dark eyes that miss
        // nothing, brows like snow, a moustache that hides his mouth and a beard forked in two that lies on his chest.
        // In stone it is the same man with his eyes half shut, and nothing in him moves.
        var F = window.EclipseFigure;
        var rig = F.head({ size: 0.14, skin: 0xa8734c, age: 1, iris: 0x6a4a2a, brow: { color: 0xe6e2da, thick: 1.5 }, nose: 1.4, jaw: 0.4, cheek: 1.25, ridge: 1.25, material: stoneMat, seed: 9 });
        head.add(rig.group);
        var beardMat = stone ? stoneMat : F.mat({ map: F.hairTex(0xe4dfd4, { dark: 0x857e70, light: 0xffffff }), side: T.DoubleSide }, 0xffffff, 0.35);
        F.beard(rig, { mat: beardMat, length: 2.1, width: 0.85, fork: true, moustache: 1.4, drape: 1.12, forward: 0.52, drop: 0.1, cheek: -0.12 });
        var face = F.face(rig);

        // arms: wide sleeves; the right hand grips the staff, the left rests on the belt
        var cuffAt = function (pt, from) {
          var c = new T.Mesh(new T.TorusGeometry(0.138, 0.013, 8, 24), brass);
          c.position.set(pt[0], pt[1], pt[2]);
          c.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), new T.Vector3(pt[0] - from[0], pt[1] - from[1], pt[2] - from[2]).normalize());
          g.add(c);
          return c;
        };
        var shR = [0.3, 1.46, 0.0], wrR = [0.38, 1.12, -0.4], shL = [-0.3, 1.46, 0.0], wrL = [-0.26, 0.96, -0.34];
        limb(shR, wrR, 0.085, 0.135, robeMat);
        cuffAt(wrR, shR);
        put(new T.Mesh(new T.SphereGeometry(0.085, 14, 10), robeMat), shR[0], shR[1], shR[2]);
        // the left arm hangs from its own shoulder, so the free hand can mark his words
        var armL = new T.Group(); armL.position.set(shL[0], shL[1], shL[2]); g.add(armL);
        var freeArm = [limb(shL, wrL, 0.085, 0.135, robeMat), cuffAt(wrL, shL), put(new T.Mesh(new T.SphereGeometry(0.085, 14, 10), robeMat), shL[0], shL[1], shL[2])];
        function hand(pos, grip) {
          // (EclipseFigure) a palm, four fingers of three joints and a thumb, closed on what it holds
          var h = window.EclipseFigure.hand({ mat: skin, size: 1.08, curl: grip ? 0.95 : 0.3, side: pos[0] < 0 ? -1 : 1 });
          h.position.set(pos[0], pos[1] - 0.01, pos[2]);
          g.add(h);
          return h;
        }
        hand(wrR, true); freeArm.push(hand(wrL, false));
        freeArm.forEach(function (m) { g.remove(m); m.position.sub(armL.position); armL.add(m); });

        // the staff: dark iron, rings, a star-sight crowned with eight points and a warm jewel
        var staff = new T.Group();
        staff.position.set(0.38, 0, -0.4);
        g.add(staff);
        var pole = new T.Mesh(new T.CylinderGeometry(0.022, 0.03, 2.5, 12), iron);
        pole.position.y = 1.15; pole.castShadow = true; staff.add(pole);
        [0.5, 1.2, 1.9].forEach(function (y) {
          var rg = new T.Mesh(new T.TorusGeometry(0.03, 0.008, 6, 14), brass);
          rg.rotation.x = Math.PI / 2; rg.position.y = y; staff.add(rg);
        });
        var foot = new T.Mesh(new T.ConeGeometry(0.03, 0.12, 10), iron);
        foot.position.y = -0.14; foot.rotation.x = Math.PI; staff.add(foot);
        var sight = new T.Group();
        sight.position.y = 2.55;
        staff.add(sight);
        var sRing = new T.Mesh(new T.TorusGeometry(0.15, 0.018, 10, 36), brass); sRing.castShadow = true; sight.add(sRing);
        var sIn = new T.Mesh(new T.TorusGeometry(0.095, 0.01, 8, 28), brass); sight.add(sIn);
        for (var a = 0; a < 8; a++) {
          var ang = a * Math.PI / 4, spike = new T.Mesh(new T.ConeGeometry(0.014, a % 2 ? 0.07 : 0.12, 6), brass);
          spike.position.set(Math.cos(ang) * 0.2, Math.sin(ang) * 0.2, 0);
          spike.rotation.z = ang - Math.PI / 2;
          sight.add(spike);
        }
        [0, Math.PI / 2].forEach(function (rz) {
          var cross = new T.Mesh(new T.CylinderGeometry(0.005, 0.005, 0.3, 5), brass);
          cross.rotation.z = rz; sight.add(cross);
        });
        var jewel = new T.Mesh(new T.SphereGeometry(0.03, 14, 10), new T.MeshBasicMaterial({ color: 0xffd890, toneMapped: false }));
        sight.add(jewel);
        var halo = new T.Sprite(new T.SpriteMaterial({ map: soft, color: 0xffb860, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending }));
        halo.scale.set(0.9, 0.9, 1);
        sight.add(halo);
        if (stone) { jewel.visible = false; halo.visible = false; }

        g.scale.setScalar(o.scale || 1);
        // a statue stays a statue; a living man blinks, breathes, listens and talks with his free hand
        var life = stone ? null : persona(g, { head: head, face: face, arm: armL });
        bake(g);
        g.userData = {
          head: head, staff: staff, sight: sight, halo: halo, life: life,
          speak: function (on) { if (life) life.speak(on); }, look: function (v) { if (life) life.look(v); }, react: function (k) { if (life) life.react(k); },
          update: function (t) {
            if (life) life.update(t);
            sight.rotation.z = t * 0.12;
            halo.material.opacity = 0.45 + 0.15 * Math.sin(t * 2.3);
            staff.rotation.z = Math.sin(t * 0.5) * 0.004;
          }
        };
        return g;
      }

      // A young man of the desert (about thirty-five): linen tunic, loose trousers, a striped sash, a headcloth, a short
      // beard, a waterskin, a dark lantern and a plain walking stick. Faces -z like the elder. No Order jewellery on him.
      function youngNomad(paint, o) {
        o = o || {};
        var g = new T.Group();
        var soft = tex.soft();
        var linen = paint({ map: tex.cloth(o.tunic == null ? 0xcdb98c : o.tunic, 0xe6d8b4, 3, 21), side: T.DoubleSide }, 0xffd8a8, 0.18);
        var trousers = paint({ map: tex.cloth(o.trousers == null ? 0x7d6a4c : o.trousers, 0x9b8764, 5, 22), side: T.DoubleSide }, 0xffd8a8, 0.16);
        var vestMat = paint({ color: tone(o.vest == null ? 0x5a3a24 : o.vest), side: T.DoubleSide }, 0xffb878, 0.22);
        var skin = paint({ color: tone(0x9c6a44) }, 0xffc890, 0.28);
        var skinDark = paint({ color: tone(0x8a5c3a) }, 0xffc890, 0.2);
        var hairM = paint({ color: 0x2c1d14 }, 0xffb878, 0.2);
        var leather = paint({ color: tone(0x6a4022) }, 0xffc890, 0.22);
        var brass = paint({ color: tone(0xc79a46), emissive: 0x1a0e02 }, 0xfff0b0, 0.4);
        var sash = paint({ map: tex.cloth(0x9b3f2b, 0xe0b878, 6, 23), side: T.DoubleSide }, 0xffb878, 0.2);
        var headcloth = paint({ map: tex.cloth(0xe9ddc0, 0x9c4a30, 10, 24), side: T.DoubleSide }, 0xffe0b8, 0.2);
        var wood = paint({ map: tex.wood(0x7a5230, 25) }, 0xffd8a8, 0.12);
        var ink = new T.MeshBasicMaterial({ color: 0x1c120c });
        function put(mesh, x, y, z, parent) { mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; (parent || g).add(mesh); return mesh; }
        function ell(geo, mat, sx, sy, sz) { var m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); return m; }
        function limb(a, b, rTop, rBot, mat) {
          var A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]);
          var len = A.distanceTo(B), m = new T.Mesh(new T.CylinderGeometry(rTop, rBot, len, 14, 1, false), mat);
          m.position.copy(A.clone().add(B).multiplyScalar(0.5));
          m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), A.clone().sub(B).normalize());
          m.castShadow = true; g.add(m);
          return m;
        }

        // legs: loose trousers gathered at the ankle, low leather boots with a turned toe
        var fold = function (k, d) { return function (a2, u) { return 1 + d * Math.sin(a2 * k + u * 9) * Math.sin(u * Math.PI); }; };
        var legs = [-1, 1].map(function (sd) {
          var leg = new T.Group(); leg.position.set(sd * 0.1, 0.96, 0); g.add(leg);
          var up = new T.Mesh(loft([[0, 0.04, 0, 0.1, 0.11], [0, -0.2, -0.012, 0.118, 0.125], [0, -0.46, 0, 0.092, 0.098]], { bump: fold(5, 0.06) }), trousers); up.castShadow = true; leg.add(up);
          var knee = new T.Group(); knee.position.y = -0.46; leg.add(knee);
          var lo = new T.Mesh(loft([[0, 0.03, 0, 0.09, 0.096], [0, -0.14, 0.008, 0.102, 0.108], [0, -0.3, 0.01, 0.085, 0.09], [0, -0.38, 0.008, 0.06, 0.064]], { bump: fold(6, 0.08) }), trousers); lo.castShadow = true; knee.add(lo);
          var cuff = new T.Mesh(new T.TorusGeometry(0.064, 0.013, 8, 18), leather); cuff.rotation.x = Math.PI / 2; cuff.position.set(0, -0.375, 0.008); knee.add(cuff);
          var boot = new T.Mesh(loft([[0, -0.36, 0.01, 0.058, 0.062], [0, -0.44, 0.012, 0.056, 0.066]], { radial: 10 }), leather); boot.castShadow = true; knee.add(boot);
          var foot = new T.Mesh(loft([[0, -0.455, 0.08, 0.04, 0.034], [0, -0.455, 0.0, 0.056, 0.046], [0, -0.462, -0.1, 0.054, 0.036], [0, -0.455, -0.19, 0.032, 0.022], [0, -0.425, -0.225, 0.01, 0.01]]), leather); foot.castShadow = true; knee.add(foot);
          leg.userData.knee = knee;
          return leg;
        });

        // tunic: a long linen shirt over the hips, open at the throat, with a dark leather vest over it
        var tunicProf = [[0.3, 0.52], [0.285, 0.7], [0.255, 0.95], [0.235, 1.2], [0.22, 1.4], [0.15, 1.5], [0.075, 1.54]];
        var tunic = new T.Mesh(foldedLathe(tunicProf, 48, function (th, t) { return { r: 1 + 0.05 * Math.sin(th * 9 + t * 2) * (1 - t) * (1 - t) + 0.015 * Math.sin(th * 4 + 1), y: t < 0.05 ? 0.018 * Math.sin(th * 9) : 0 }; }), linen);
        tunic.scale.set(0.84, 1, 0.74); tunic.castShadow = true; g.add(tunic);
        var hem = put(new T.Mesh(new T.TorusGeometry(0.3, 0.012, 8, 40), leather), 0, 0.53, 0); hem.rotation.x = Math.PI / 2; hem.scale.set(0.84, 0.74, 1);
        var vestProf = [[0.275, 0.86], [0.255, 1.0], [0.245, 1.2], [0.235, 1.4], [0.17, 1.49]];
        var vest = new T.Mesh(new T.LatheGeometry(vestProf.map(function (p) { return new T.Vector2(p[0], p[1]); }), 40, Math.PI * 0.12, Math.PI * 1.76), vestMat);
        vest.scale.set(0.84, 1, 0.78); vest.rotation.y = Math.PI; vest.castShadow = true; g.add(vest);
        // a broad striped sash at the waist, a knotted end hanging at the hip
        var waist = put(new T.Mesh(new T.TorusGeometry(0.27, 0.06, 10, 40), sash), 0, 0.95, 0); waist.rotation.x = Math.PI / 2; waist.scale.set(0.84, 0.76, 1);
        var knot = put(ell(new T.SphereGeometry(0.06, 12, 10), sash, 1, 0.9, 0.9), 0.2, 0.93, -0.22);
        var tail1 = put(new T.Mesh(new T.PlaneGeometry(0.1, 0.34, 2, 6), sash), 0.22, 0.74, -0.24); tail1.rotation.set(0.12, 0.3, 0.1);
        var tail2 = put(new T.Mesh(new T.PlaneGeometry(0.09, 0.28, 2, 6), sash), 0.16, 0.76, -0.25); tail2.rotation.set(0.1, -0.2, -0.12);
        // a knife on the sash, a leather satchel on the other hip, a cross strap over the shoulder for the waterskin
        put(new T.Mesh(new T.BoxGeometry(0.03, 0.2, 0.025), leather), -0.12, 0.88, -0.28).rotation.z = 0.25;
        put(new T.Mesh(new T.BoxGeometry(0.18, 0.16, 0.09), leather), -0.25, 0.78, -0.02);
        var strap = limb([0.17, 1.48, -0.02], [-0.22, 0.86, -0.06], 0.014, 0.014, leather);
        var skinBag = put(ell(new T.SphereGeometry(0.12, 16, 12), paint({ color: tone(0x7a4a26) }, 0xffc890, 0.22), 0.85, 1.35, 0.75), -0.22, 0.74, 0.1);
        put(new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.06, 10), leather), -0.22, 0.92, 0.1);

        // neck and the loose scarf round it
        put(new T.Mesh(new T.CylinderGeometry(0.058, 0.07, 0.12, 12), skinDark), 0, 1.56, 0);
        var scarf = put(new T.Mesh(new T.TorusGeometry(0.115, 0.04, 10, 28), headcloth), 0, 1.5, -0.005); scarf.rotation.x = Math.PI / 2;
        var scarfEnd = put(new T.Mesh(new T.PlaneGeometry(0.12, 0.42, 2, 8), headcloth), -0.1, 1.28, -0.12); scarfEnd.rotation.set(0.1, 0.25, 0.12);

        // head: a lean, sun-browned face, straight brows, a short dark beard and moustache, a headcloth held by a cord
        var head = new T.Group(); head.position.set(0, 1.68, 0); head.scale.setScalar(1.3); g.add(head);
        function hput(mesh, x, y, z) { mesh.position.set(x, y, z); mesh.castShadow = true; head.add(mesh); return mesh; }
        // (EclipseFigure) a lean sun-browned face of thirty-five: straight dark brows, eyes lined with kohl against the
        // glare, a short black beard close to the jaw and a moustache; his mouth shows, and moves when he speaks
        var F = window.EclipseFigure;
        var rig = F.head({ size: 0.13, skin: 0x9c6a44, age: 0.3, iris: 0x4a3018, brow: { color: 0x1c120c, thick: 1.05 }, nose: 1.05, jaw: 0.7, cheek: 1.1, kohl: true, lip: 0x8a4a3a, seed: 23 });
        head.add(rig.group);
        var darkHair = F.mat({ map: F.hairTex(0x241812, { dark: 0x0c0806, light: 0x5a4030 }), side: T.DoubleSide }, 0xffb878, 0.2);
        F.beard(rig, { mat: darkHair, length: 0.32, width: 0.42, moustache: 0.7, thick: 0.05, cheek: -0.32, drape: 0.0, drop: 0.16, forward: -0.05 });
        var face = F.face(rig);
        // the headcloth: cream with terracotta stripes, over the crown and down behind, a dark cord round the brow
        // it is wound over the very shape of his skull: low on the brow, behind the ears, down to the nape
        var cloth = new T.Mesh(F.shell(rig, function (nx, ny, nz) {
          var back = Math.max(0, Math.min(1, (nz + 0.2) / 0.5));
          return Math.max(0, Math.min(1, (ny - (0.5 * (1 - back) - 0.45 * back)) / 0.1));
        }, { thick: 0.11, segs: [80, 48], ridges: { count: 9, depth: 0.012, swirl: 5 }, uvRepeat: 1 }), headcloth);
        cloth.castShadow = true; cloth.userData.live = true; rig.group.add(cloth);
        var cord = hput(new T.Mesh(new T.TorusGeometry(0.108, 0.013, 8, 32), paint({ color: 0x1e1612 })), 0, 0.078, 0.012); cord.rotation.x = Math.PI / 2 - 0.1; cord.scale.set(1, 1.14, 1);
        var drape = hput(new T.Mesh(new T.PlaneGeometry(0.27, 0.34, 4, 6), headcloth), 0, -0.15, 0.1); drape.rotation.set(0.12, 0, 0);
        var drapeSide = [-1, 1].map(function (sd) { var d = hput(new T.Mesh(new T.PlaneGeometry(0.09, 0.2, 2, 4), headcloth), sd * 0.12, -0.08, 0.09); d.rotation.set(0.05, sd * 0.9, sd * 0.05); return d; });
        // the night wind and his own steps move them; they never pass into his neck or his chest
        var cloths = [
          clothSim(drape, { ws: 4, hs: 6, minZ: -0.004, wind: [0.5, 0, 0.9], gust: 0.9, damp: 0.975 }),
          clothSim(scarfEnd, { ws: 2, hs: 8, maxZ: 0.01, wind: [0.4, 0, 0.6], gust: 0.8, damp: 0.975 }),
          clothSim(tail1, { ws: 2, hs: 6, maxZ: 0.01, wind: [0.5, 0, 0.5], gust: 0.9, damp: 0.975 }),
          clothSim(tail2, { ws: 2, hs: 6, maxZ: 0.01, wind: [0.5, 0, 0.5], gust: 0.9, damp: 0.975 })
        ].concat(drapeSide.map(function (d) { return clothSim(d, { ws: 2, hs: 4, wind: [0.4, 0, 0.6], gust: 0.8, damp: 0.975 }); }));

        // arms: sleeves rolled to the elbow, forearms bare, a leather band on the wrist; the right hand holds the stick,
        // the left one the dark lantern
        var shR = [0.225, 1.45, -0.01], elR = [0.29, 1.18, -0.1], wrR = [0.31, 0.96, -0.32];
        var shL = [-0.225, 1.45, -0.01], elL = [-0.27, 1.18, -0.09], wrL = [-0.26, 1.02, -0.28];
        [shR, shL].forEach(function (s) { put(new T.Mesh(new T.SphereGeometry(0.062, 14, 10), linen), s[0], s[1], s[2]); });
        function span(a, b, secs, mat, bump) {
          // a shaped limb from a to b: secs are [along 0…1, rx, rz]
          var A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]), len = A.distanceTo(B);
          var m = new T.Mesh(loft(secs.map(function (q) { return [0, -q[0] * len, 0, q[1], q[2]]; }), { radial: 12, bump: bump }), mat);
          m.position.copy(A); m.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), B.clone().sub(A).normalize()); m.castShadow = true; g.add(m);
          return m;
        }
        [[shR, elR], [shL, elL]].forEach(function (q) { span(q[0], q[1], [[-0.05, 0.06, 0.062], [0.4, 0.07, 0.074], [1.04, 0.062, 0.066]], linen, fold(5, 0.07)); });
        [elR, elL].forEach(function (e) { var r = put(new T.Mesh(new T.TorusGeometry(0.066, 0.014, 8, 18), linen), e[0], e[1], e[2]); r.rotation.x = Math.PI / 2 - 0.2; });
        [[elR, wrR], [elL, wrL]].forEach(function (q) { span(q[0], q[1], [[-0.04, 0.046, 0.05], [0.28, 0.054, 0.058], [0.7, 0.042, 0.044], [1.0, 0.034, 0.03]], skin); });
        [wrR, wrL].forEach(function (w) { var b = put(new T.Mesh(new T.TorusGeometry(0.047, 0.012, 8, 16), leather), w[0], w[1], w[2]); b.rotation.x = Math.PI / 2 - 0.3; });
        function hand(pos, grip) {
          // (EclipseFigure) a palm, four fingers of three joints and a thumb, closed on what it holds
          var h = window.EclipseFigure.hand({ mat: skin, size: 1.08, curl: grip ? 0.95 : 0.3, side: pos[0] < 0 ? -1 : 1 });
          h.position.set(pos[0], pos[1] - 0.01, pos[2]);
          g.add(h);
          return h;
        }
        hand(wrR, true); hand(wrL, true);

        // the walking stick: plain wood, a leather grip, a forked top
        var stick = new T.Group(); stick.position.set(wrR[0] + 0.01, 0, wrR[2]); g.add(stick);
        var pole = new T.Mesh(new T.CylinderGeometry(0.02, 0.027, 1.78, 10), wood); pole.position.y = 0.88; pole.castShadow = true; stick.add(pole);
        var grip = new T.Mesh(new T.CylinderGeometry(0.028, 0.028, 0.16, 10), leather); grip.position.y = 0.96; stick.add(grip);
        [-1, 1].forEach(function (sd) { var fk = new T.Mesh(new T.CylinderGeometry(0.012, 0.018, 0.14, 6), wood); fk.position.set(sd * 0.03, 1.8, 0); fk.rotation.z = sd * -0.35; stick.add(fk); });

        // the lantern in his left hand: brass, a glass belly, a ring to carry it. Dark until the lamp is lit.
        var lantern = new T.Group(); lantern.position.set(wrL[0] - 0.02, wrL[1] - 0.2, wrL[2] - 0.02); g.add(lantern);
        var lRing = new T.Mesh(new T.TorusGeometry(0.03, 0.006, 6, 14), brass); lRing.position.y = 0.13; lantern.add(lRing);
        var lTop = new T.Mesh(new T.ConeGeometry(0.06, 0.05, 8), brass); lTop.position.y = 0.09; lantern.add(lTop);
        var glassMat = new T.MeshBasicMaterial({ color: 0x3a2a1c, transparent: true, opacity: 0.8 });
        var lGlass = new T.Mesh(new T.CylinderGeometry(0.055, 0.045, 0.14, 10), glassMat); lGlass.position.y = 0; lantern.add(lGlass);
        var lBase = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.03, 10), brass); lBase.position.y = -0.085; lantern.add(lBase);
        var lFlame = new T.Sprite(new T.SpriteMaterial({ map: soft, color: 0xffb860, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
        lFlame.scale.set(0.5, 0.5, 1); lantern.add(lFlame);
        var lit = 0;

        g.scale.setScalar(o.scale || 1);
        tunic.userData.live = true;
        // he walks on his own legs, plants his stick, turns his head to whoever speaks and blinks at the fire
        var life = persona(g, { head: head, face: face, legs: legs, stick: stick, lantern: lantern, stride: 0.52 });
        bake(g);
        g.userData = {
          head: head, lantern: lantern, life: life,
          speak: function (on) { life.speak(on); }, look: function (v) { life.look(v); }, react: function (k) { life.react(k); },
          setLamp: function (on) { lit = on ? 1 : 0; glassMat.color.setHex(on ? 0xffd890 : 0x3a2a1c); glassMat.opacity = on ? 0.95 : 0.8; },
          update: function (t) {
            life.update(t);
            cloths.forEach(function (c) { c.update(t); });
            lantern.rotation.z = Math.sin(t * 1.1) * 0.04;
            lFlame.material.opacity = lit ? 0.5 + 0.12 * Math.sin(t * 9) : 0;
          }
        };
        return g;
      }

      // ---- a skin drawn through rings: loft([[x, y, z, rx, rz], …], opts) → geometry. The rings follow a smooth curve
      // through the centres and swell and narrow between the radii given, so a thigh, a forearm, a camel's neck or a
      // boot is one surface with flesh on it and not a pipe. rx is the width across (x), rz the other way.
      //   opts: radial, steps (rings between two sections), caps (default true), arc [from, to] (an open sheet),
      //   bump(angle, u) → a factor on the radius (folds, muscles)
      function loft(secs, o) {
        o = o || {};
        var rad = o.radial || 14, n = (secs.length - 1) * (o.steps || 4), a0 = o.arc ? o.arc[0] : 0, a1 = o.arc ? o.arc[1] : Math.PI * 2;
        var cc = new T.CatmullRomCurve3(secs.map(function (s) { return new T.Vector3(s[0], s[1], s[2]); }), false, 'centripetal');
        var rc = new T.CatmullRomCurve3(secs.map(function (s, i) { return new T.Vector3(s[3], s[4] == null ? s[3] : s[4], i); }), false, 'centripetal');
        var X = new T.Vector3(1, 0, 0), tan = new T.Vector3(), nr = new T.Vector3(), sd = new T.Vector3(), c = new T.Vector3(), r = new T.Vector3();
        var pos = [], uv = [], idx = [], cols = rad + 1;
        for (var i = 0; i <= n; i++) {
          var u = i / n;
          cc.getPoint(u, c); cc.getTangent(u, tan); rc.getPoint(u, r);
          nr.crossVectors(X, tan).normalize(); sd.crossVectors(tan, nr).normalize();
          for (var j = 0; j <= rad; j++) {
            var a = a0 + (a1 - a0) * j / rad, k = o.bump ? o.bump(a, u) : 1, cx = Math.cos(a) * Math.max(0.0005, r.x) * k, cz = Math.sin(a) * Math.max(0.0005, r.y) * k;
            pos.push(c.x + sd.x * cx + nr.x * cz, c.y + sd.y * cx + nr.y * cz, c.z + sd.z * cx + nr.z * cz);
            uv.push(j / rad * (o.uv ? o.uv[0] : 1), u * (o.uv ? o.uv[1] : 1));
          }
        }
        for (var p = 0; p < n; p++) for (var q = 0; q < rad; q++) { var i0 = p * cols + q, i1 = i0 + cols; idx.push(i0, i1, i0 + 1, i0 + 1, i1, i1 + 1); }
        if (o.caps !== false && !o.arc) {
          [0, n].forEach(function (row) {
            cc.getPoint(row / n, c); var ci = pos.length / 3; pos.push(c.x, c.y, c.z); uv.push(0.5, row / n);
            for (var q2 = 0; q2 < rad; q2++) { var b = row * cols + q2; if (row) idx.push(ci, b + 1, b); else idx.push(ci, b, b + 1); }
          });
        }
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
        g.computeVertexNormals();
        return g;
      }

      // A raider of the desert, of those who ride under the phoenix: a dark turban wound low over the brow and a veil
      // over nose and mouth, so that all his face is two hard eyes lined with kohl; a tunic to the knee over loose
      // trousers and tall boots, a red sash, crossed belts, a curved sword at his hip and a cloak that the wind takes.
      // Faces -z. userData: arm (the right arm: the game turns it at the shoulder), hold (his right fist: hang a torch
      // there, it stays upright), body, update(t), look(v), react(kind), sleep(on), life
      //   o: robe, wrap, sash (hex), seed, scale
      // a plain colour as the eye reads it (the painted cloths are sRGB; a bare hex would come out washed)
      function tone(h) { return new T.Color(h).convertSRGBToLinear(); }
      function raider(paint, o) {
        o = o || {};
        var g = new T.Group(), F = window.EclipseFigure, seed = o.seed || 31;
        var robeC = o.robe == null ? 0x3c3848 : o.robe, wrapC = o.wrap == null ? 0x1e1b26 : o.wrap;
        var robeMat = paint({ map: tex.robe(robeC, 0x8a3a2c, seed), side: T.DoubleSide }, 0xffb878, 0.26);
        var clothMat = paint({ map: tex.cloth(robeC, F.mixHex(robeC, 0x000000, 0.25), 9, seed), side: T.DoubleSide }, 0xffb878, 0.22);
        var trouser = paint({ map: tex.cloth(F.mixHex(robeC, 0x000000, 0.35), F.mixHex(robeC, 0x000000, 0.5), 7, seed + 1) }, 0xffb878, 0.18);
        var wrap = paint({ map: tex.cloth(wrapC, F.mixHex(wrapC, 0x6a6480, 0.22), 1, seed + 2), side: T.DoubleSide }, 0xc8d0ff, 0.34);
        var sashMat = paint({ map: tex.cloth(o.sash == null ? 0x8a2c22 : o.sash, 0xd8842c, 8, seed + 3), side: T.DoubleSide }, 0xffb878, 0.26);
        var cloakMat = paint({ map: tex.cloth(F.mixHex(wrapC, robeC, 0.4), wrapC, 5, seed + 4), side: T.DoubleSide }, 0xc8d0ff, 0.22);
        var leather = paint({ color: tone(0x6a4022) }, 0xffc890, 0.25), leatherDk = paint({ color: tone(0x3a2216) }, 0xffc890, 0.2);
        var brass = paint({ color: tone(0xc79a46), emissive: 0x1a0e02 }, 0xfff0b0, 0.5);
        var skinC = o.skin == null ? 0x7a5238 : o.skin, skin = paint({ color: tone(F.mixHex(skinC, 0x3a1c14, 0.15)) }, 0xffc890, 0.28);
        function put(mesh, x, y, z, parent) { mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; (parent || g).add(mesh); return mesh; }
        var crease = function (k, d) { return function (a, u) { return 1 + d * Math.sin(a * k + u * 9) * Math.sin(u * Math.PI); }; };

        // legs: loose trousers gathered into tall boots, a knee that bends
        var legs = [-1, 1].map(function (sd) {
          var leg = new T.Group(); leg.position.set(sd * 0.105, 0.94, 0); g.add(leg);
          put(new T.Mesh(loft([[0, 0.04, 0, 0.1, 0.11], [0, -0.2, -0.01, 0.112, 0.12], [0, -0.44, 0, 0.09, 0.095]], { bump: crease(5, 0.05) }), trouser), 0, 0, 0, leg);
          var knee = new T.Group(); knee.position.y = -0.44; leg.add(knee);
          put(new T.Mesh(loft([[0, 0.03, 0, 0.088, 0.093], [0, -0.1, 0.005, 0.1, 0.105], [0, -0.2, 0.01, 0.075, 0.08]], { bump: crease(6, 0.07) }), trouser), 0, 0, 0, knee);
          put(new T.Mesh(loft([[0, -0.17, 0.01, 0.072, 0.078], [0, -0.3, 0.012, 0.062, 0.07], [0, -0.42, 0.01, 0.054, 0.064], [0, -0.47, 0.0, 0.056, 0.07]]), leather), 0, 0, 0, knee);
          put(new T.Mesh(loft([[0, -0.455, 0.075, 0.04, 0.035], [0, -0.455, 0.0, 0.056, 0.048], [0, -0.465, -0.1, 0.054, 0.038], [0, -0.455, -0.2, 0.03, 0.022], [0, -0.42, -0.235, 0.01, 0.01]]), leather), 0, 0, 0, knee);
          var cuff = put(new T.Mesh(new T.TorusGeometry(0.076, 0.012, 6, 18), leather), 0, -0.18, 0.01, knee); cuff.rotation.x = Math.PI / 2;
          leg.userData.knee = knee;
          return leg;
        });

        // the chest and the tunic that falls from the sash to the knee, slit at the front for the stride
        put(new T.Mesh(loft([[0, 0.9, 0, 0.2, 0.15], [0, 1.05, 0, 0.19, 0.14], [0, 1.26, -0.012, 0.225, 0.155], [0, 1.42, 0, 0.235, 0.14], [0, 1.5, 0.005, 0.15, 0.105], [0, 1.57, 0.005, 0.07, 0.07]], { radial: 20, bump: crease(7, 0.025) }), robeMat), 0, 0, 0);
        var pleat = function (th, t) { return { r: 1 + 0.06 * Math.sin(th * 9 + t * 2) * (1 - t * 0.7) + 0.025 * Math.sin(th * 4 + 1), y: t < 0.05 ? 0.02 * Math.sin(th * 9) : 0 }; };
        var skirt = put(new T.Mesh(foldedLathe([[0.33, 0.47], [0.31, 0.6], [0.26, 0.82], [0.215, 1.0], [0.2, 1.06]], 44, pleat), robeMat), 0, 0, 0); skirt.scale.set(0.94, 1, 0.78);
        var waist = put(new T.Mesh(new T.TorusGeometry(0.205, 0.055, 10, 36), sashMat), 0, 1.02, 0); waist.rotation.x = Math.PI / 2; waist.scale.set(0.96, 0.76, 1.25);
        put(new T.Mesh(new T.SphereGeometry(0.055, 12, 10), sashMat), -0.15, 1.0, -0.15).scale.set(1.1, 0.9, 0.8);
        var tail = put(new T.Mesh(new T.PlaneGeometry(0.11, 0.42, 2, 6), sashMat), -0.17, 0.78, -0.17); tail.rotation.set(0.1, -0.35, -0.08);
        // crossed belts with brass studs, a pouch, a curved sword in its scabbard on the left hip, a dagger in the sash
        [-1, 1].forEach(function (sd) {
          var b = put(new T.Mesh(F.tube([[sd * 0.2, 1.47, 0.03], [sd * 0.13, 1.4, -0.135], [0, 1.24, -0.172], [-sd * 0.16, 1.09, -0.14], [-sd * 0.2, 1.05, 0.02], [-sd * 0.12, 1.2, 0.15], [sd * 0.08, 1.4, 0.14], [sd * 0.2, 1.47, 0.03]], 0.02, { segments: 30, radial: 6, flat: 0.4 }), leather), 0, 0, 0);
          for (var k = 0; k < 4; k++) { var u = 0.14 + k * 0.09; put(new T.Mesh(new T.SphereGeometry(0.011, 6, 5), brass), sd * (0.14 - u * 0.75), 1.42 - u * 0.86, -0.15 - 0.05 * Math.sin(u * 2.4)); }
        });
        put(new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.012, 14), brass), 0, 1.24, -0.185).rotation.x = Math.PI / 2;
        put(new T.Mesh(new T.BoxGeometry(0.12, 0.13, 0.06), leather), 0.2, 0.9, -0.06);
        var sword = new T.Group(); sword.position.set(-0.235, 1.0, -0.04); sword.rotation.set(0.75, 0, 0.1); g.add(sword);
        put(new T.Mesh(F.tube([[0, 0, 0], [0, -0.22, 0.015], [0, -0.43, 0.065], [0, -0.6, 0.16]], function (u) { return 0.046 - 0.02 * u; }, { segments: 14, radial: 10, flat: 0.42 }), leatherDk), 0, 0, 0, sword);
        [0.02, 0.3, 0.57].forEach(function (u, k) { var rg = put(new T.Mesh(new T.TorusGeometry(0.042 - k * 0.008, 0.008, 5, 14), brass), 0, -u, [0.0, 0.03, 0.14][k], sword); rg.rotation.x = Math.PI / 2 - k * 0.25; rg.scale.y = 0.5; });
        put(new T.Mesh(new T.BoxGeometry(0.11, 0.018, 0.03), brass), 0, 0.02, 0, sword);
        put(new T.Mesh(new T.CylinderGeometry(0.014, 0.017, 0.13, 8), leather), 0, 0.09, 0, sword);
        put(new T.Mesh(new T.SphereGeometry(0.022, 8, 6), brass), 0, 0.165, -0.008, sword);
        var dag = put(new T.Mesh(new T.ConeGeometry(0.02, 0.2, 6), leatherDk), 0.1, 0.95, -0.18); dag.rotation.set(Math.PI, 0, -0.35);
        put(new T.Mesh(new T.CylinderGeometry(0.011, 0.013, 0.08, 6), brass), 0.146, 1.08, -0.18).rotation.z = -0.35;

        // the cloak: a short cape over both shoulders, and behind it the long fall the wind takes
        var cfold = function (th, t) { return { r: 1 + 0.04 * Math.sin(th * 7 + 1), y: t > 0.75 ? -0.03 * (0.5 + 0.5 * Math.cos(th * 9)) : 0 }; };
        var cape = put(new T.Mesh(foldedLathe([[0.085, 1.585], [0.17, 1.555], [0.26, 1.48], [0.3, 1.38], [0.3, 1.3]], 40, cfold), cloakMat), 0, 0, 0); cape.scale.set(1, 1, 0.72);
        var cloakG = new T.PlaneGeometry(0.6, 1.02, 6, 9), CP = cloakG.attributes.position;
        for (var ci = 0; ci < CP.count; ci++) {
          // narrow at the shoulders, full at the hem, wrapped round the back, in soft folds
          var cx = CP.getX(ci), cy = CP.getY(ci), down = 0.5 - cy / 1.02, wd = 0.62 + 0.38 * down, xx = cx * wd;
          CP.setXYZ(ci, xx, cy, -0.5 * xx * xx * (1.6 - down) + 0.03 * down * Math.cos(cx * 26));
        }
        cloakG.computeVertexNormals();
        var cloak = new T.Mesh(cloakG, cloakMat); cloak.position.set(0, 0.96, 0.2); cloak.rotation.x = -0.05; cloak.castShadow = true; g.add(cloak);
        var cloths = [clothSim(cloak, { ws: 6, hs: 9, minZ: -0.09, wind: [0.45, 0, 0.7], gust: 0.9, damp: 0.975 }), clothSim(tail, { ws: 2, hs: 6, maxZ: 0.01, wind: [0.4, 0, 0.5], gust: 0.8, damp: 0.975 })];

        // the head: all that shows is the bridge of the nose and the eyes
        put(new T.Mesh(loft([[0, 1.52, 0.005, 0.09, 0.085], [0, 1.6, 0.0, 0.078, 0.08], [0, 1.66, -0.005, 0.085, 0.09]], { bump: crease(4, 0.06) }), wrap), 0, 0, 0);
        var head = new T.Group(); head.position.set(0, 1.7, 0); head.scale.setScalar(1.3); g.add(head);
        var rig = F.head({ size: 0.13, skin: skinC, age: 0.55, iris: o.iris == null ? 0x6a4a22 : o.iris, brow: { color: 0x120c0a, thick: 1.1 }, nose: 1.15, jaw: 0.7, cheek: 1.15, ridge: 1.3, kohl: true, seed: seed, detail: 64, mouth: false });
        head.add(rig.group);
        var turban = new T.Mesh(F.shell(rig, function (nx, ny, nz) {
          var back = Math.max(0, Math.min(1, (nz + 0.35) / 0.45));
          return Math.max(0, Math.min(1, (ny - (0.4 * (1 - back) - 0.6 * back)) / 0.16));
        }, { thick: 0.2, segs: [72, 56], ridges: { count: 1, depth: 0.05, swirl: 24 }, uvRepeat: 2 }), wrap);
        turban.castShadow = true; rig.group.add(turban);
        var veil = new T.Mesh(F.shell(rig, function (nx, ny, nz) {
          var front = Math.max(0, Math.min(1, (0.35 - nz) / 0.5));
          return Math.max(0, Math.min(1, ((-0.04 - 0.1 * Math.abs(nx)) - ny) / 0.08)) * (0.55 + 0.45 * front);
        }, { thick: 0.085, segs: [72, 56], ridges: { count: 1, depth: 0.016, swirl: 30 }, uvRepeat: 2 }), wrap);
        veil.castShadow = true; rig.group.add(veil);
        var end = new T.Mesh(new T.PlaneGeometry(0.11, 0.36, 2, 6), wrap); end.position.set(0.085, -0.19, 0.1); end.rotation.set(0.1, -0.5, 0.06); end.castShadow = true; head.add(end);
        cloths.push(clothSim(end, { ws: 2, hs: 6, minZ: -0.004, wind: [0.5, 0, 0.8], gust: 0.9, damp: 0.975 }));
        var face = F.face(rig);

        // the left arm, bent, its hand on the hilt; the right one is the game's to move
        function sleeve(pts, parent) { return put(new T.Mesh(loft(pts, { bump: crease(5, 0.06) }), clothMat), 0, 0, 0, parent); }
        function bracer(parent, y) { var b = put(new T.Mesh(loft([[0, y + 0.01, 0, 0.05, 0.05], [0, y - 0.07, 0, 0.044, 0.042], [0, y - 0.15, 0, 0.037, 0.034]], { radial: 10 }), leather), 0, 0, 0, parent); [y - 0.02, y - 0.12].forEach(function (yy) { put(new T.Mesh(new T.TorusGeometry(yy > y - 0.05 ? 0.049 : 0.039, 0.005, 5, 12), brass), 0, yy, 0, parent).rotation.x = Math.PI / 2; }); return b; }
        var armL = new T.Group(); armL.position.set(-0.235, 1.44, 0); armL.rotation.set(0.1, 0, -0.22); g.add(armL);
        put(new T.Mesh(new T.SphereGeometry(0.08, 12, 9), clothMat), 0, 0, 0, armL);
        sleeve([[0, 0.02, 0, 0.075, 0.078], [0, -0.14, 0, 0.07, 0.074], [0, -0.3, 0, 0.062, 0.064]], armL);
        var foreL = new T.Group(); foreL.position.y = -0.3; foreL.rotation.set(0.95, 0, 0.5); armL.add(foreL);
        sleeve([[0, 0.02, 0, 0.064, 0.066], [0, -0.07, 0, 0.066, 0.07], [0, -0.13, 0, 0.055, 0.056]], foreL);
        bracer(foreL, -0.11);
        var hL = F.hand({ mat: skin, size: 1.05, curl: 0.75, side: -1 }); hL.position.y = -0.26; foreL.add(hL);
        var arm = new T.Group(); arm.position.set(0.235, 1.44, 0); g.add(arm);
        put(new T.Mesh(new T.SphereGeometry(0.08, 12, 9), clothMat), 0, 0, 0, arm);
        sleeve([[0, 0.02, 0, 0.075, 0.078], [0, -0.14, 0, 0.07, 0.074], [0, -0.3, 0, 0.062, 0.064]], arm);
        var fore = new T.Group(); fore.position.y = -0.3; arm.add(fore);
        sleeve([[0, 0.02, 0, 0.064, 0.066], [0, -0.07, 0, 0.066, 0.07], [0, -0.13, 0, 0.055, 0.056]], fore);
        bracer(fore, -0.11);
        var hold = new T.Group(); hold.position.y = -0.3; fore.add(hold);
        var hR = F.hand({ mat: skin, size: 1.05, curl: 0.95, side: 1 }); hR.rotation.set(0, 0, Math.PI / 2); hR.position.set(-0.062, 0, 0.03); hold.add(hR);

        g.scale.setScalar(o.scale || 1);
        // only the big shapes throw a shadow: nobody misses the shadow of a stud, and each one is a draw
        var quiet = [brass, leatherDk, skin, sashMat, wrap];
        g.traverse(function (m) { if (m.isMesh && (quiet.indexOf(m.material) >= 0 || m.parent === sword || m.parent === hold || m.parent === foreL)) m.castShadow = false; });
        turban.castShadow = true;
        var life = persona(g, { head: head, face: face, legs: legs, stride: 0.55 });
        bake(g);
        var asleep = false, body = new T.Object3D();
        g.userData = {
          arm: arm, fore: fore, hold: hold, head: head, life: life, body: body, face: face,
          look: function (v) { life.look(v); }, react: function (k) { life.react(k); }, sleep: function (on) { asleep = !!on; if (face.shut) face.shut(asleep ? 1 : 0); },
          update: function (t) {
            // the elbow follows the shoulder (bent when the torch is carried low, nearly straight when it is held high),
            // and the fist keeps what it holds upright
            var up = Math.max(0, Math.min(1, (arm.rotation.x - 0.3) / 1.6));
            fore.rotation.x = 1.0 - 0.75 * up;
            hold.rotation.x = -(arm.rotation.x + fore.rotation.x) - 0.12;
            if (!asleep) face.mood(0, 0.55, 0);
            life.update(t);
            for (var i = 0; i < cloths.length; i++) cloths[i].update(t);
          }
        };
        return g;
      }

      // A dromedary, saddled for the road: a deep chest and a tucked belly, one hump under a striped blanket, a long
      // neck that carries the head high, heavy lids and long lashes, a jaw that chews sideways, knees that fold when
      // it couches. Faces -z. userData: kneel(k 0…1), walk(on), update(t), head, parts
      //   o: coat, blanket, blanket2 (hex), seed, scale
      function camel(paint, o) {
        o = o || {};
        var g = new T.Group(), parts = new T.Group(), F = window.EclipseFigure, seed = o.seed || 41; g.add(parts);
        var coatC = o.coat == null ? 0xb08a5c : o.coat;
        // a short coat: soft patches of sun and dust, and the fine hairs only where you look for them
        var furT = F.canvasTex(256, 256, function (c2, w, h) {
          var r = rng(seed), dk = F.mixHex(coatC, 0x3a2010, 0.5), lt = F.mixHex(coatC, 0xfff0d0, 0.4), css = function (hx, a) { return 'rgba(' + ((hx >> 16) & 255) + ',' + ((hx >> 8) & 255) + ',' + (hx & 255) + ',' + a + ')'; };
          c2.fillStyle = css(coatC, 1); c2.fillRect(0, 0, w, h);
          for (var i = 0; i < 60; i++) { var x = r() * w, y = r() * h, rr = 18 + r() * 40, gr = c2.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, css(r() < 0.5 ? dk : lt, 0.16)); gr.addColorStop(1, css(coatC, 0)); c2.fillStyle = gr; c2.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
          for (var k2 = 0; k2 < 1500; k2++) { var sx = r() * w, sy = r() * h; c2.strokeStyle = css(r() < 0.5 ? dk : lt, 0.1 + r() * 0.12); c2.lineWidth = 1; c2.beginPath(); c2.moveTo(sx, sy); c2.lineTo(sx + (r() - 0.5) * 3, sy + 4 + r() * 7); c2.stroke(); }
        });
        furT.wrapS = furT.wrapT = T.RepeatWrapping; furT.repeat.set(2, 2);
        var fur = paint({ map: furT }, 0xffe0b0, 0.3), furDk = paint({ map: furT, color: 0x8a7868 }, 0xffe0b0, 0.2);
        var pad = paint({ color: tone(F.mixHex(coatC, 0x2a1a10, 0.6)) }, 0xffc890, 0.15), dark = new T.MeshBasicMaterial({ color: 0x120a08 });
        var blanket = paint({ map: tex.cloth(o.blanket == null ? 0x7e2a22 : o.blanket, o.blanket2 == null ? 0x4e1814 : o.blanket2, 14, seed), side: T.DoubleSide }, 0xffb878, 0.25);
        var blanket2 = paint({ map: tex.cloth(0x2c3a5a, 0xcdb98c, 6, seed + 1), side: T.DoubleSide }, 0xffb878, 0.2);
        var leather = paint({ color: tone(0x6a4022) }, 0xffc890, 0.25), wood = paint({ map: tex.wood(0x6a4426, seed) }, 0xffd8a8, 0.15), brass = paint({ color: tone(0xc79a46), emissive: 0x1a0e02 }, 0xfff0b0, 0.5);
        var ropeM = paint({ color: tone(0xb09a6a) }, 0xffe0b0, 0.15), tassel = paint({ color: tone(0xd89a34) }, 0xfff0b0, 0.3);
        function put(mesh, x, y, z, parent) { mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; (parent || parts).add(mesh); return mesh; }
        var shag = function (k, d) { return function (a, u) { return 1 + d * Math.sin(a * k + u * 7) * (0.5 + 0.5 * Math.sin(u * 23)); }; };

        // trunk: chest forward (-z), a belly that rises to the flank, the rump
        put(new T.Mesh(loft([[0, 1.5, -0.84, 0.13, 0.22], [0, 1.42, -0.68, 0.3, 0.44], [0, 1.39, -0.35, 0.37, 0.5], [0, 1.45, 0.1, 0.38, 0.45], [0, 1.52, 0.5, 0.33, 0.37], [0, 1.5, 0.78, 0.24, 0.31], [0, 1.42, 0.92, 0.08, 0.12]], { radial: 22, steps: 5, uv: [1, 1.5] }), fur), 0, 0, 0);
        var humpG = new T.SphereGeometry(1, 22, 16), HP = humpG.attributes.position;
        for (var hi = 0; hi < HP.count; hi++) { var hy = HP.getY(hi), hz = HP.getZ(hi); HP.setXYZ(hi, HP.getX(hi) * (1 - 0.25 * Math.max(0, hy)), hy > 0 ? hy : hy * 0.5, hz + 0.18 * Math.max(0, hy) * Math.max(0, hy)); }
        humpG.computeVertexNormals();
        var hump = put(new T.Mesh(humpG, fur), 0, 1.76, 0.08); hump.scale.set(0.27, 0.44, 0.46);

        // legs: a thick forearm, a knobbed knee, a thin shin, a broad split pad
        function leg(x, z, front) {
          var hip = new T.Group(); hip.position.set(x, 1.36, z); parts.add(hip);
          put(new T.Mesh(front
            ? loft([[0, 0.16, 0.02, 0.12, 0.19], [0, -0.1, 0, 0.105, 0.145], [0, -0.4, -0.01, 0.075, 0.09], [0, -0.64, 0, 0.066, 0.072], [0, -0.74, 0, 0.07, 0.076]], { radial: 12 })
            : loft([[0, 0.18, -0.06, 0.13, 0.27], [0, -0.1, -0.03, 0.115, 0.2], [0, -0.38, 0.02, 0.078, 0.105], [0, -0.62, 0.05, 0.062, 0.072], [0, -0.74, 0.04, 0.066, 0.074]], { radial: 12 }), fur), 0, 0, 0, hip);
          var knee = new T.Group(); knee.position.set(0, -0.72, front ? 0 : 0.04); hip.add(knee);
          put(new T.Mesh(loft([[0, 0.04, 0, 0.068, 0.074], [0, -0.14, 0, 0.054, 0.06], [0, -0.42, 0, 0.046, 0.052], [0, -0.54, -0.01, 0.06, 0.066], [0, -0.6, -0.03, 0.075, 0.085]], { radial: 10 }), fur), 0, 0, 0, knee);
          [-1, 1].forEach(function (sd) { put(new T.Mesh(new T.SphereGeometry(0.075, 10, 8), pad), sd * 0.04, -0.6, -0.05, knee).scale.set(0.85, 0.5, 1.55); });
          return { hip: hip, knee: knee, front: front, side: x < 0 ? -1 : 1 };
        }
        var legs = [leg(-0.19, -0.56, true), leg(0.19, -0.56, true), leg(-0.19, 0.6, false), leg(0.19, 0.6, false)];

        // the neck swings from the chest; the head hangs from the neck
        var neck = new T.Group(); neck.position.set(0, 1.5, -0.7); parts.add(neck);
        put(new T.Mesh(loft([[0, -0.06, 0.1, 0.17, 0.26], [0, -0.14, -0.22, 0.13, 0.2], [0, 0.0, -0.5, 0.105, 0.15], [0, 0.3, -0.66, 0.092, 0.12], [0, 0.62, -0.68, 0.085, 0.105], [0, 0.84, -0.62, 0.08, 0.1]], { radial: 16, steps: 5, bump: shag(7, 0.035), uv: [1, 1.2] }), fur), 0, 0, 0, neck);
        // a mane down the back of the neck and a tuft on the crown
        put(new T.Mesh(F.strands(loft([[0, 0.9, -0.52, 0.035, 0.05], [0, 0.6, -0.57, 0.045, 0.07], [0, 0.28, -0.53, 0.05, 0.08], [0, 0.04, -0.34, 0.05, 0.08], [0, -0.02, -0.08, 0.04, 0.06]], { radial: 8 }), { count: 5, depth: 0.012 }), furDk), 0, 0, 0, neck);
        var head = new T.Group(); head.position.set(0, 0.86, -0.62); neck.add(head);
        put(new T.Mesh(loft([[0, 0.0, 0.14, 0.07, 0.085], [0, 0.03, 0.0, 0.098, 0.11], [0, 0.02, -0.16, 0.086, 0.095], [0, -0.03, -0.32, 0.064, 0.07], [0, -0.07, -0.44, 0.062, 0.058], [0, -0.09, -0.5, 0.045, 0.04]], { radial: 16, steps: 5 }), fur), 0, 0, 0, head);
        var jaw = new T.Group(); jaw.position.set(0, -0.06, -0.1); head.add(jaw);
        put(new T.Mesh(loft([[0, 0.0, 0.08, 0.06, 0.04], [0, -0.035, -0.12, 0.058, 0.04], [0, -0.065, -0.3, 0.048, 0.034], [0, -0.07, -0.385, 0.036, 0.026]], { radial: 10 }), fur), 0, 0, 0, jaw);
        [-1, 1].forEach(function (sd) {
          put(new T.Mesh(new T.SphereGeometry(0.034, 12, 10), dark), sd * 0.082, 0.045, -0.09, head);
          var lid = put(new T.Mesh(new T.SphereGeometry(0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), fur), sd * 0.082, 0.047, -0.09, head); lid.rotation.set(0.2, 0, sd * -0.55);
          var lash = put(new T.Mesh(new T.TorusGeometry(0.041, 0.006, 5, 12, Math.PI), dark), sd * 0.086, 0.046, -0.09, head); lash.rotation.set(Math.PI / 2 + 0.2, sd * 0.9, 0);
          put(new T.Mesh(new T.SphereGeometry(0.05, 10, 8), fur), sd * 0.06, 0.09, -0.08, head).scale.set(0.9, 0.5, 1.3);    // the brow
          var ear = put(new T.Mesh(new T.ConeGeometry(0.034, 0.1, 8), fur), sd * 0.085, 0.125, 0.06, head); ear.rotation.set(-0.5, 0, sd * -0.6); ear.scale.z = 0.55;
          put(new T.Mesh(new T.SphereGeometry(0.014, 8, 6), dark), sd * 0.03, -0.065, -0.49, head).scale.set(0.7, 1, 1.8);   // nostril
        });
        put(new T.Mesh(F.strands(new T.SphereGeometry(0.07, 12, 10), { count: 5, depth: 0.012 }), furDk), 0, 0.12, 0.02, head).scale.set(1, 0.7, 1.2);

        // the tail
        var tailG = new T.Group(); tailG.position.set(0, 1.52, 0.9); parts.add(tailG);
        put(new T.Mesh(F.tube([[0, 0, 0], [0, -0.14, 0.09], [0, -0.4, 0.11], [0, -0.62, 0.08]], function (u) { return 0.034 - 0.02 * u; }, { segments: 10, radial: 7 }), fur), 0, 0, 0, tailG);
        put(new T.Mesh(F.strands(new T.SphereGeometry(0.05, 10, 10), { count: 5, depth: 0.014 }), furDk), 0, -0.68, 0.075, tailG).scale.set(0.8, 1.8, 0.8);

        // the harness: two blankets, a wooden saddle with its horns round the hump, bags, a water skin, tassels, a halter
        var over = function (r, k) { return function (a, u) { return r + k * Math.sin(u * Math.PI); }; };
        put(new T.Mesh(loft([[0, 1.5, -0.5, 0.345, 0.47], [0, 1.52, -0.1, 0.36, 0.47], [0, 1.55, 0.3, 0.355, 0.44], [0, 1.56, 0.62, 0.32, 0.38]], { radial: 22, steps: 4, arc: [Math.PI * 1.02, Math.PI * 1.98], bump: over(1.0, 0.02), uv: [4, 1] }), blanket2), 0, 0, 0);
        put(new T.Mesh(loft([[0, 1.53, -0.38, 0.365, 0.5], [0, 1.56, -0.05, 0.385, 0.62], [0, 1.58, 0.25, 0.385, 0.62], [0, 1.58, 0.5, 0.35, 0.46]], { radial: 22, steps: 4, arc: [Math.PI * 1.1, Math.PI * 1.9], bump: over(1.0, 0.03), uv: [3, 1] }), blanket), 0, 0, 0);
        for (var tk = 0; tk < 7; tk++) [-1, 1].forEach(function (sd) {
          var tz = -0.34 + tk * 0.135, ts = put(new T.Mesh(new T.ConeGeometry(0.024, 0.11, 6), tassel), sd * 0.375, 1.37, tz); ts.rotation.z = Math.PI;
          put(new T.Mesh(new T.SphereGeometry(0.016, 6, 5), brass), sd * 0.375, 1.43, tz);
        });
        [-0.34, 0.5].forEach(function (z, k) {
          [-1, 1].forEach(function (sd) { var bar = put(new T.Mesh(new T.CylinderGeometry(0.022, 0.026, 0.62, 8), wood), sd * 0.13, 2.02, z); bar.rotation.z = sd * 0.42; bar.rotation.x = k ? 0.12 : -0.12; });
          put(new T.Mesh(new T.SphereGeometry(0.04, 10, 8), brass), 0, 2.3, z + (k ? 0.035 : -0.035));
        });
        [-1, 1].forEach(function (sd) {
          var rail = put(new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.86, 8), wood), sd * 0.24, 1.86, 0.08); rail.rotation.x = Math.PI / 2;
          put(new T.Mesh(loft([[0, 0.18, 0, 0.1, 0.045], [0, 0.0, 0, 0.16, 0.085], [0, -0.2, 0, 0.15, 0.08], [0, -0.3, 0, 0.07, 0.04]], { radial: 12 }), leather), sd * 0.42, 1.5, 0.3).rotation.y = Math.PI / 2;
          put(new T.Mesh(new T.BoxGeometry(0.012, 0.2, 0.2), leather), sd * 0.465, 1.6, 0.3);
          put(new T.Mesh(new T.SphereGeometry(0.014, 6, 5), brass), sd * 0.475, 1.52, 0.3);
        });
        put(new T.Mesh(new T.SphereGeometry(0.15, 14, 10), paint({ color: tone(0x7a4a26) }, 0xffc890, 0.22)), -0.4, 1.52, -0.18).scale.set(0.6, 1.3, 0.85);
        var roll = put(new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.62, 14), blanket2), 0, 1.98, 0.6); roll.rotation.z = Math.PI / 2;
        [-0.2, 0.2].forEach(function (x) { put(new T.Mesh(new T.TorusGeometry(0.103, 0.01, 5, 14), leather), x, 1.98, 0.6).rotation.y = Math.PI / 2; });
        var girth = put(new T.Mesh(new T.TorusGeometry(0.4, 0.016, 5, 28), leather), 0, 1.46, -0.3); girth.scale.set(0.86, 1.14, 1);
        var nose = put(new T.Mesh(new T.TorusGeometry(0.068, 0.008, 5, 16), leather), 0, -0.045, -0.33, head); nose.scale.set(1, 1.1, 1);
        var cheekS = put(new T.Mesh(new T.TorusGeometry(0.105, 0.007, 5, 18), leather), 0, 0.0, -0.02, head); cheekS.scale.set(1, 1.15, 1);
        [-1, 1].forEach(function (sd) { put(new T.Mesh(F.tube([[sd * 0.07, -0.04, -0.33], [sd * 0.095, -0.01, -0.18], [sd * 0.1, 0.0, -0.02]], 0.007, { segments: 6, radial: 5 }), leather), 0, 0, 0, head); });
        // the rein: from the halter to the front horn, with its own weight
        var rv = new T.Vector3();
        var rein = rope(ropeM, function () { return reinEnd(); }, [0, 2.24, -0.36], { segments: 9, radius: 0.009, slack: 1.12 });
        function reinEnd() { rv.set(0, -0.11, -0.33); head.updateWorldMatrix(true, false); head.localToWorld(rv); parts.worldToLocal(rv); return [rv.x, rv.y, rv.z]; }
        rein.userData.live = true; parts.add(rein);

        g.scale.setScalar(o.scale || 1);
        var quiet = [tassel, brass, dark, leather, pad, ropeM, furDk, wood];
        g.traverse(function (m) { if (m.isMesh && (quiet.indexOf(m.material) >= 0 || m.parent === jaw)) m.castShadow = false; });
        bake(g, { skip: [rein] });
        var kT = 0, k = null, walking = false, wgt = 0, ph = (seed % 7), lastT = null, phase = 0, calm = clothReduced();
        var chewT = 2 + (seed % 5), flick = 0;
        function pose() {
          var e = k * k * (3 - 2 * k);
          parts.position.y = -0.98 * e;
          legs.forEach(function (L, i) {
            var s = Math.sin(Math.PI * 2 * phase + (L.side > 0 ? Math.PI : 0) + (L.front ? 0 : 0.5)), lift = Math.max(0, Math.cos(Math.PI * 2 * phase + (L.side > 0 ? Math.PI : 0) + (L.front ? 0 : 0.5)));
            L.hip.rotation.x = (L.front ? 1.38 : 1.15) * e + 0.42 * s * wgt * (1 - e);
            L.knee.rotation.x = -(L.front ? 2.76 : 2.5) * e - 0.85 * lift * wgt * (1 - e);
          });
          neck.rotation.x = 0.1 * e;
        }
        g.userData = {
          parts: parts, head: head, neck: neck, legs: legs,
          kneel: function (v, now) { kT = v ? 1 : 0; if (now || k == null) { k = kT; pose(); } },
          walk: function (on) { walking = !!on; },
          update: function (t) {
            if (lastT == null) { lastT = t; if (k == null) k = kT; pose(); return; }
            var dt = Math.min(0.066, Math.max(0, t - lastT)); lastT = t;
            if (!(dt > 0)) return;
            k += Math.max(-dt / 2.6, Math.min(dt / 2.6, kT - k));
            wgt += ((walking ? 1 : 0) - wgt) * Math.min(1, dt * 4);
            if (wgt > 0.01) phase = (phase + dt * 0.95) % 1;
            pose();
            var a = Math.PI * 2 * phase;
            parts.position.y += 0.03 * Math.sin(a * 2) * wgt;
            parts.rotation.z = 0.025 * Math.sin(a) * wgt;
            // it chews for a while, sideways, then rests; it breathes; an ear and the tail flick at the flies
            chewT -= dt; if (chewT < -4) chewT = 3 + Math.random() * 5;
            var chew = chewT < 0 && !calm ? 1 : 0;
            jaw.rotation.x = chew * 0.07 * (0.5 + 0.5 * Math.sin(t * 6.2 + ph));
            jaw.position.x = chew * 0.012 * Math.sin(t * 3.1 + ph);
            flick -= dt; if (flick < -0.5) flick = 2 + Math.random() * 6;
            tailG.rotation.z = calm ? 0 : (flick < 0 ? 0.5 * Math.sin((flick + 0.5) * Math.PI * 4) : 0.05 * Math.sin(t * 0.9 + ph));
            tailG.rotation.x = 0.1 * Math.sin(a * 2) * wgt;
            neck.rotation.x += (calm ? 0 : 0.02 * Math.sin(t * 0.5 + ph)) + 0.05 * Math.sin(a * 2 + 0.6) * wgt;
            neck.rotation.y = calm ? 0 : 0.06 * Math.sin(t * 0.23 + ph * 2) * (1 - wgt);
            head.rotation.x = (calm ? 0 : 0.05 * Math.sin(t * 0.37 + ph)) - 0.05 * Math.sin(a * 2 + 0.6) * wgt;
            head.rotation.y = calm ? 0 : 0.18 * Math.sin(t * 0.17 + ph * 3) * (1 - wgt);
            parts.scale.x = 1 + (calm ? 0 : 0.012 * Math.sin(t * 1.3 + ph));
            rein.userData.update(t);
          }
        };
        return g;
      }

      // A bronze tripod brazier with a live fire (flame sprites and a flickering light)
      function brazier(paint, o) {
        o = o || {};
        var g = new T.Group(), h = o.height || 1.5;
        var bronze = paint({ color: 0x6a4a28, emissive: 0x1a0e04 }, 0xffb870, 0.5);
        var bowlProf = [[0.001, 0], [0.12, 0.02], [0.3, 0.12], [0.38, 0.28], [0.4, 0.34], [0.36, 0.36]].map(function (q) { return new T.Vector2(q[0], q[1]); });
        var bowl = new T.Mesh(new T.LatheGeometry(bowlProf, 24), bronze);
        bowl.position.y = h; bowl.castShadow = true; g.add(bowl);
        var rimT = new T.Mesh(new T.TorusGeometry(0.385, 0.025, 8, 28), bronze);
        rimT.rotation.x = Math.PI / 2; rimT.position.y = h + 0.35; g.add(rimT);
        for (var i = 0; i < 3; i++) {
          var a = i * Math.PI * 2 / 3 + 0.4;
          var leg = new T.Mesh(new T.CylinderGeometry(0.024, 0.036, h + 0.05, 8), bronze);
          leg.position.set(Math.cos(a) * 0.2, (h + 0.05) / 2, Math.sin(a) * 0.2);
          leg.rotation.set(Math.sin(a) * 0.14, 0, -Math.cos(a) * 0.14);
          leg.castShadow = true; g.add(leg);
        }
        var ringMid = new T.Mesh(new T.TorusGeometry(0.15, 0.014, 6, 20), bronze);
        ringMid.rotation.x = Math.PI / 2; ringMid.position.y = h * 0.45; g.add(ringMid);
        var coals = new T.Mesh(new T.CircleGeometry(0.33, 18), new T.MeshBasicMaterial({ color: 0xff7a22, toneMapped: false }));
        coals.rotation.x = -Math.PI / 2; coals.position.y = h + 0.3; g.add(coals);
        var flames = [];
        for (var f = 0; f < 4; f++) {
          var sp = new T.Sprite(new T.SpriteMaterial({ map: tex.flame(), color: 0xff9a48, opacity: 0.85, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
          sp.position.set((f - 1.5) * 0.09, h + 0.62, (f % 2 - 0.5) * 0.12);
          sp.scale.set(0.46, 0.8, 1);
          sp.userData = { ph: f * 1.7, base: sp.position.y };
          g.add(sp); flames.push(sp);
        }
        var glow = new T.Sprite(new T.SpriteMaterial({ map: tex.soft(), color: 0xff9a40, transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
        glow.position.y = h + 0.7; glow.scale.set(2.6, 2.6, 1);
        g.add(glow);
        var light = new T.PointLight(0xff9040, o.intensity == null ? 1.7 : o.intensity, o.range || 11, 1.6);
        light.position.y = h + 0.8;
        g.add(light);
        // lvl: how high the fire burns (1 = normal, 0.35 = nearly out, above 1 = a roaring flare)
        g.userData.update = function (t, ph, lvl) {
          var k = (ph || 0), L = lvl == null ? 1 : lvl, sz = 0.4 + 0.6 * Math.min(L, 1.6);
          flames.forEach(function (sp) {
            var u = sp.userData, w = 0.5 + 0.5 * Math.sin(t * 9 + u.ph + k);
            sp.scale.set((0.4 + 0.12 * w) * sz, (0.72 + 0.28 * Math.sin(t * 7 + u.ph * 2 + k)) * sz * (0.8 + 0.2 * L), 1);
            sp.position.y = u.base + 0.05 * Math.sin(t * 6 + u.ph);
            sp.material.opacity = 0.85 * Math.min(1, 0.45 + 0.55 * L);
          });
          light.intensity = (o.intensity == null ? 1.7 : o.intensity) * L * (0.85 + 0.15 * Math.sin(t * 11 + k) + 0.08 * Math.sin(t * 23 + k * 2));
          glow.material.opacity = (0.42 + 0.1 * Math.sin(t * 8 + k)) * Math.min(1.5, L);
          glow.scale.setScalar(1.3 + 1.3 * Math.min(L, 1.6));
        };
        return g;
      }

      // A hanging banner of heavy cloth with the Order's sign; it breathes in the wind
      function banner(paint, o) {
        o = o || {};
        var w = o.width || 0.9, h = o.height || 2.6, g = new T.Group();
        var cloth = tex.cloth(o.color == null ? 0x8e2f26 : o.color, o.color2 == null ? 0x6e2018 : o.color2, 2, 8);
        var geo = new T.PlaneGeometry(w, h, 8, 16);
        var mat = paint({ map: cloth, side: T.DoubleSide }, 0xffb080, 0.14);
        var mesh = new T.Mesh(geo, mat);
        mesh.position.y = -h / 2;
        mesh.castShadow = true;
        g.add(mesh);
        var emb = new T.Mesh(new T.CircleGeometry(w * 0.3, 28), new T.MeshBasicMaterial({ map: tex.eclipse(0xf2c25a, 0x241410), transparent: true, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
        emb.position.set(0, -h * 0.4, 0.012);
        g.add(emb);
        var pole = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, w + 0.3, 10), paint({ color: 0x5a3a1c }, 0xffd0a0, 0.2));
        pole.rotation.z = Math.PI / 2; g.add(pole);
        [-1, 1].forEach(function (sd) { var cap = new T.Mesh(new T.SphereGeometry(0.05, 10, 8), paint({ color: 0xd9aa4a }, 0xfff0b0, 0.5)); cap.position.x = sd * (w / 2 + 0.15); g.add(cap); });
        var tail = new T.Mesh(new T.ConeGeometry(w / 2, 0.3, 4), paint({ map: cloth, side: T.DoubleSide }));
        tail.rotation.z = Math.PI; tail.position.y = -h - 0.1; tail.scale.set(1, 1, 0.05);
        g.add(tail);
        // the cloth hangs from the pole and the wind takes it; the emblem is sewn on (its points ride the cloth) and the
        // pointed tail hangs from the hem
        var sim = clothSim(mesh, { ws: 8, hs: 16, wind: o.wind || [0.9, 0, 1.6], gust: 1.1, damp: 0.985 });
        var eg = emb.geometry, eUV = [], eP = eg.attributes.position;
        for (var i = 0; i < eP.count; i++) eUV.push([(eP.getX(i) + w / 2) / w * 8, (h * 0.4 + -eP.getY(i)) / h * 16]);
        emb.position.set(0, -h / 2, 0); emb.material.polygonOffsetFactor = -4;
        var tp = new T.Vector3(), tn = new T.Vector3(), tq = new T.Vector3();
        g.userData.cloth = sim;
        g.userData.update = function (t) {
          sim.update(t);
          for (var i = 0; i < eUV.length; i++) {
            sim.point(eUV[i][0], eUV[i][1], tp); sim.normal(eUV[i][0], eUV[i][1], tn);
            eP.setXYZ(i, tp.x + tn.x * 0.012, tp.y + tn.y * 0.012, tp.z + tn.z * 0.012);
          }
          eP.needsUpdate = true; eg.computeBoundingSphere();
          sim.point(4, 16, tp); sim.point(4, 14, tq);
          tail.position.set(tp.x, tp.y - h / 2 - 0.12, tp.z);
          tail.rotation.x = Math.atan2(tp.z - tq.z, tq.y - tp.y);
        };
        return g;
      }

      // A full cliff wall for a backdrop: ragged mesa top, ledges that step back, strata, crevices.
      // Flat in the middle (|x| < flat) so a built front can stand against it.
      function cliffWall(paint, o) {
        o = o || {};
        var W = o.width || 90, H = o.height || 30, seed = o.seed || 13, cols = o.cols || 170, rows = o.rows || 64;
        var zBase = o.z == null ? -1.5 : o.z, flat = o.flat || 6, curve = o.curve == null ? 0.011 : o.curve;
        var topAt = function (x) {
          var n = fbm(x * 0.05 + seed, 0.5, seed, 4, 0, 0) * 4.2;
          var q = Math.floor(n) + smooth(0.3, 0.7, n - Math.floor(n));
          var top = Math.max(o.minTop || 15, H * (0.5 + 0.5 * q / 4.2));
          if (o.dip) top = lerp(o.dip.h, top, smooth(o.dip.x * 0.35, o.dip.x, Math.abs(x)));
          return top;
        };
        var pos = [], uv = [], colr = [], idx = [];
        for (var i = 0; i <= cols; i++) {
          var x = -W / 2 + W * i / cols, top = topAt(x), k = smooth(flat, flat + 7, Math.abs(x));
          for (var j = 0; j <= rows; j++) {
            var v = j / rows, y = top * v;
            var d = fbm(x * 0.13, y * 0.13, seed + 3, 4, 0, 0) * 2.4 + fbm(x * 0.5, y * 0.09, seed + 9, 3, 0, 0) * 0.7;
            var ledge = (Math.floor(y / 3.1) + smooth(0.72, 1, (y / 3.1) % 1)) * 0.5;
            var z = zBase - curve * x * x - (d * 0.9 + ledge) * k - 0.12 * d * (1 - k);
            pos.push(x, y, z);
            uv.push(x / 9, y / 9);
            var band = 0.8 + 0.2 * Math.sin(y * 1.9 + fbm(x * 0.2, y * 0.2, seed + 5, 3, 0, 0) * 5);
            var ao = clamp(0.78 + d * 0.2 + (1 - k) * 0.1 - (y > top * 0.93 ? 0.12 : 0), 0.5, 1.15);
            var cc = clamp(band * ao, 0.5, 1.12);
            colr.push(cc, cc * 0.96, cc * 0.92);
          }
        }
        for (var a = 0; a < cols; a++) {
          for (var b = 0; b < rows; b++) {
            var i0 = a * (rows + 1) + b, i1 = (a + 1) * (rows + 1) + b;
            idx.push(i0, i0 + 1, i1, i1, i0 + 1, i1 + 1);
          }
        }
        var geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        geo.setAttribute('color', new T.Float32BufferAttribute(colr, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        var st = tex.strata(o.strataSeed || 7);
        st.repeat.set(1, 1);
        var mesh = new T.Mesh(geo, paint({ map: st, vertexColors: true, color: o.tint == null ? 0xffffff : o.tint, side: T.DoubleSide }, o.rim == null ? 0xffc890 : o.rim, 0.22));
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        return mesh;
      }

      // Slanting shafts of low sun, soft and additive
      function beams(scene, o) {
        o = o || {};
        var c = document.createElement('canvas');
        c.width = 64; c.height = 256;
        var g = c.getContext('2d'), im = g.createImageData(64, 256), d = im.data;
        for (var y = 0; y < 256; y++) {
          for (var x = 0; x < 64; x++) {
            var u = Math.abs(x / 63 - 0.5) * 2, a = Math.pow(1 - u, 2) * smooth(0, 0.18, y / 255) * (1 - smooth(0.6, 1, y / 255));
            var q = (y * 64 + x) * 4;
            d[q] = 255; d[q + 1] = 214; d[q + 2] = 150; d[q + 3] = a * 255;
          }
        }
        g.putImageData(im, 0, 0);
        var tx = new T.CanvasTexture(c);
        var out = [], n = o.count || 4, r = rng(o.seed || 9);
        for (var i = 0; i < n; i++) {
          var m = new T.Mesh(new T.PlaneGeometry(1.4 + r() * 1.6, 26), new T.MeshBasicMaterial({ map: tx, transparent: true, opacity: o.opacity == null ? 0.16 : o.opacity, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }));
          m.position.set((o.x0 == null ? -9 : o.x0) + i * (o.dx || 4.2) + r() * 1.5, (o.y == null ? 6 : o.y), (o.z == null ? 2 : o.z) - r() * 2);
          m.rotation.z = o.tilt == null ? -0.62 : o.tilt;
          m.rotation.y = 0.25;
          m.userData = { ph: r() * 6, base: m.material.opacity };
          scene.add(m);
          out.push(m);
        }
        return { meshes: out, update: function (t) { out.forEach(function (m) { m.material.opacity = m.userData.base * (0.75 + 0.25 * Math.sin(t * 0.45 + m.userData.ph)); }); } };
      }

      // Move the camera round a target: drag to turn and tilt, wheel or pinch to zoom, double-tap to reset.
      // Touch and pen work the same. Returns { update(dt), setTarget(x, y, z), reset(), state }.
      function orbit(canvas, camera, o) {
        o = o || {};
        var cfg = {
          dist: o.dist || 10, pitch: o.pitch == null ? 0.14 : o.pitch, yaw: o.yaw || 0,
          minDist: o.minDist || 3.5, maxDist: o.maxDist || 17, minPitch: o.minPitch == null ? -0.04 : o.minPitch, maxPitch: o.maxPitch == null ? 1.0 : o.maxPitch,
          yawLimit: o.yawLimit == null ? Math.PI : o.yawLimit, groundY: o.groundY == null ? 0.35 : o.groundY
        };
        var tgt = new T.Vector3(o.x || 0, o.y || 2, o.z || 0), cur = tgt.clone();
        var st = { yaw: cfg.yaw, pitch: cfg.pitch, dist: cfg.dist, tYaw: cfg.yaw, tPitch: cfg.pitch, tDist: cfg.dist, idle: 0 };
        var ptrs = {}, pinch = 0, lx = 0, ly = 0;
        canvas.style.touchAction = 'none';
        canvas.style.cursor = 'grab';
        function count() { return Object.keys(ptrs).length; }
        function span() { var k = Object.keys(ptrs); if (k.length < 2) return 0; var a = ptrs[k[0]], b = ptrs[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
        canvas.addEventListener('pointerdown', function (e) {
          ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
          lx = e.clientX; ly = e.clientY; pinch = span(); st.idle = 0;
          canvas.style.cursor = 'grabbing';
          try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        });
        canvas.addEventListener('pointermove', function (e) {
          if (!ptrs[e.pointerId]) return;
          ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
          st.idle = 0;
          if (count() >= 2) {
            var sp = span();
            if (pinch > 0 && sp > 0) st.tDist = clamp(st.tDist * pinch / sp, cfg.minDist, cfg.maxDist);
            pinch = sp;
            return;
          }
          st.tYaw = clamp(st.tYaw - (e.clientX - lx) * 0.006, -cfg.yawLimit, cfg.yawLimit);
          st.tPitch = clamp(st.tPitch + (e.clientY - ly) * 0.004, cfg.minPitch, cfg.maxPitch);
          lx = e.clientX; ly = e.clientY;
        });
        function up(e) { delete ptrs[e.pointerId]; pinch = span(); if (!count()) canvas.style.cursor = 'grab'; }
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointercancel', up);
        canvas.addEventListener('wheel', function (e) {
          e.preventDefault();
          st.tDist = clamp(st.tDist * Math.exp(e.deltaY * 0.0012), cfg.minDist, cfg.maxDist);
          st.idle = 0;
        }, { passive: false });
        canvas.addEventListener('dblclick', function () { st.tYaw = cfg.yaw; st.tPitch = cfg.pitch; st.tDist = cfg.dist; });
        return {
          state: st,
          setTarget: function (x, y, z) { tgt.set(x, y, z); },
          reset: function () { st.tYaw = cfg.yaw; st.tPitch = cfg.pitch; st.tDist = cfg.dist; },
          update: function (dt, sway) {
            var k = Math.min(1, dt * 7);
            st.yaw += (st.tYaw - st.yaw) * k;
            st.pitch += (st.tPitch - st.pitch) * k;
            st.dist += (st.tDist - st.dist) * k;
            cur.lerp(tgt, Math.min(1, dt * 2.2));
            st.idle += dt;
            var sw = sway ? Math.sin(performance.now() * 0.00035) * 0.012 : 0;
            var y = st.yaw + sw, el = st.pitch;
            var cx = cur.x + Math.sin(y) * st.dist * Math.cos(el), cz = cur.z + Math.cos(y) * st.dist * Math.cos(el), cy = cur.y + Math.sin(el) * st.dist;
            camera.position.set(cx, Math.max(cy, cfg.groundY), cz);
            camera.lookAt(cur);
          }
        };
      }

      window.EclipseScenery = {
        tex: tex, preTone: preTone, clothSim: clothSim, rope: rope, bake: bake, faceLife: faceLife, persona: persona, foldedLathe: foldedLathe, loft: loft, orbit: orbit, beams: beams, cliffWall: cliffWall, util: { hex: hex, mix: mix, smooth: smooth, clamp: clamp, lerp: lerp, pixelCanvas: pixelCanvas, toTex: toTex, greyCanvas: greyCanvas }, chars: { elder: elder, nomad: youngNomad, raider: raider, camel: camel }, sky: sky, terrain: terrain, ridges: ridges, scatter: scatter, air: air, lights: lights, desertCamp: desertCamp,
        props: { brazier: brazier, banner: banner, palm: palm, awning: awning, amphora: amphora, crate: crate, sack: sack, firepit: firepit, column: column, rocks: rocks, tracks: tracks },
        paint: paintFor, shadowy: shadowy, noise: { vnoise: vnoise, fbm: fbm, hash2: hash2, rng: rng }
      };
    })();
