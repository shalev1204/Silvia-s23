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

      // ---- the sky: a shader dome, tone-mapped and encoded like everything else so the horizon meets the haze ----
      var SKY_VERT = 'varying vec3 vDir;\nvoid main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
      var SKY_FRAG = [
        'uniform vec3 uSun; uniform float uTime; uniform vec3 uZenith; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uGlow;',
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
        '  col = mix(col, vec3(1.0, 0.97, 0.88), smoothstep(0.9993, 0.9997, s));',
        '  vec2 p = d.xz / (d.y + 0.2); p *= vec2(0.9, 1.9);',
        '  float c = fbm(p * 1.25 + vec2(uTime * 0.006, 0.0));',
        '  c = smoothstep(0.5, 0.82, c) * smoothstep(0.03, 0.28, y);',
        '  vec3 cc = mix(vec3(1.0, 0.86, 0.72), vec3(1.0, 0.97, 0.9), smoothstep(0.1, 0.7, fbm(p * 3.1)));',
        '  col = mix(col, cc, c * 0.6);',
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
            uGlow: { value: new T.Color(o.glow == null ? 0xffd9a0 : o.glow) }
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
        var valance = new T.Mesh(new T.PlaneGeometry(w, 0.3, 16, 1), paint({ map: cloth, side: T.DoubleSide }));
        valance.position.set(0, hi - 0.43, d / 2);
        g.add(valance);
        var pole = paint({ map: tex.wood(0x7a5230, 5) }, 0xffd8a8, 0.12);
        [[-w / 2, -d / 2, 0.28], [w / 2, -d / 2, 0.28], [-w / 2, d / 2, -0.27], [w / 2, d / 2, -0.27]].forEach(function (c) {
          var pl = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, hi + c[2] + 0.05, 8), pole);
          pl.position.set(c[0], (hi + c[2] + 0.05) / 2, c[1]);
          g.add(pl);
          var cap = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), paint({ color: 0xd9b25c }));
          cap.position.set(c[0], hi + c[2] + 0.05, c[1]);
          g.add(cap);
        });
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
        scene.fog = new T.Fog(preTone(horizon, o.exposure), o.fogNear || 22, o.fogFar || 72);
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
        place(awning(paint, { width: 2.9, depth: 2.2, height: 2.0 }), -5.2, -2.8, 0.38);
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

      window.EclipseScenery = {
        tex: tex, sky: sky, terrain: terrain, ridges: ridges, scatter: scatter, air: air, lights: lights, desertCamp: desertCamp,
        props: { palm: palm, awning: awning, amphora: amphora, crate: crate, sack: sack, firepit: firepit, column: column, rocks: rocks, tracks: tracks },
        paint: paintFor, shadowy: shadowy, noise: { vnoise: vnoise, fbm: fbm, hash2: hash2, rng: rng }
      };
    })();
