    // =========================================================================
    // EclipseFX · the feel of the 3D games: a lens, a body with weight, a camera that breathes, dust that falls
    // =========================================================================
    //   post(renderer, opts)      · the lens: bloom on everything that shines, a colour grade, a vignette, film grain,
    //                               heat haze over the horizon and a flash for the big moments. Off it, the picture is
    //                               exactly what the renderer drew (it encodes once, at the end, like the renderer did).
    //   gait(H, opts)             · Hermes walks: feet that plant and never skate, a body that bobs, sways, leans and
    //                               breathes, arms that swing, a lamp that swings on its own weight, a head that looks.
    //                               It reads how far he moved each frame, so a game only has to move him.
    //   shaker(opts)              · trauma-based camera shake and a slow handheld drift (none with reduced motion).
    //   particles(scene, opts)    · pooled dust, sand and sparks with gravity, drag, wind and a ground they bounce on.
    //   footprints(scene, opts)   · boot prints that stay in the sand and fade.
    // Nothing here draws a letter, an hour or a hint.
    (function initEclipseFX() {
      'use strict';
      var T = window.THREE;
      if (!T) return;
      var reduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
      var lowPower = (navigator.hardwareConcurrency || 4) <= 4;
      var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
      var TAU = Math.PI * 2;

      // ---------------------------------------------------------------- the lens
      var FS_VERT = 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
      // dual-filter blur: four taps around the centre on the way down, eight on the way up
      var DOWN_FRAG = [
        'uniform sampler2D tMap; uniform vec2 uTexel; uniform float uThreshold; uniform float uKnee; uniform float uBright;',
        'varying vec2 vUv;',
        'void main(){',
        '  vec2 h = uTexel;',
        '  vec3 c = texture2D(tMap, vUv).rgb * 4.0;',
        '  c += texture2D(tMap, vUv - h).rgb + texture2D(tMap, vUv + h).rgb;',
        '  c += texture2D(tMap, vUv + vec2(h.x, -h.y)).rgb + texture2D(tMap, vUv - vec2(h.x, -h.y)).rgb;',
        '  c *= 0.125;',
        '  if (uBright > 0.5) {',
        '    float br = max(c.r, max(c.g, c.b));',
        '    float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);',
        '    soft = soft * soft / (4.0 * uKnee + 1e-4);',
        '    c *= max(soft, br - uThreshold) / max(br, 1e-4);',
        '  }',
        '  gl_FragColor = vec4(c, 1.0);',
        '}'
      ].join('\n');
      var UP_FRAG = [
        'uniform sampler2D tMap; uniform vec2 uTexel; uniform float uSpread;',
        'varying vec2 vUv;',
        'void main(){',
        '  vec2 o = uTexel * uSpread;',
        '  vec3 c = texture2D(tMap, vUv + vec2(-2.0 * o.x, 0.0)).rgb + texture2D(tMap, vUv + vec2(2.0 * o.x, 0.0)).rgb;',
        '  c += texture2D(tMap, vUv + vec2(0.0, 2.0 * o.y)).rgb + texture2D(tMap, vUv + vec2(0.0, -2.0 * o.y)).rgb;',
        '  c += (texture2D(tMap, vUv + vec2(-o.x, o.y)).rgb + texture2D(tMap, vUv + vec2(o.x, o.y)).rgb) * 2.0;',
        '  c += (texture2D(tMap, vUv + vec2(o.x, -o.y)).rgb + texture2D(tMap, vUv + vec2(-o.x, -o.y)).rgb) * 2.0;',
        '  gl_FragColor = vec4(c / 12.0, 1.0);',
        '}'
      ].join('\n');
      var COMPOSITE_FRAG = [
        'uniform sampler2D tScene; uniform sampler2D tBloom;',
        'uniform float uBloom; uniform float uTime; uniform float uAspect;',
        'uniform float uSat; uniform float uContrast; uniform vec3 uGain; uniform vec3 uLift;',
        'uniform float uVig; uniform float uGrain; uniform float uCA;',
        'uniform float uHaze; uniform float uHazeY;',
        'uniform vec3 uFlash; uniform float uFlashK;',
        'varying vec2 vUv;',
        'float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }',
        'vec3 toSRGB(vec3 c){ c = max(c, vec3(0.0)); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }',
        'void main(){',
        '  vec2 uv = vUv;',
        '  if (uHaze > 0.001) {',
        '    float band = smoothstep(uHazeY - 0.2, uHazeY - 0.02, uv.y) * (1.0 - smoothstep(uHazeY + 0.01, uHazeY + 0.09, uv.y));',
        '    uv.x += sin(uv.y * 260.0 + uTime * 5.0) * 0.0011 * uHaze * band;',
        '    uv.y += sin(uv.x * 180.0 + uTime * 3.3) * 0.0007 * uHaze * band;',
        '  }',
        '  vec2 d = uv - 0.5;',
        '  vec3 c;',
        '  if (uCA > 0.001) { vec2 off = d * uCA * 0.008; c = vec3(texture2D(tScene, uv + off).r, texture2D(tScene, uv).g, texture2D(tScene, uv - off).b); }',
        '  else c = texture2D(tScene, uv).rgb;',
        '  c += texture2D(tBloom, uv).rgb * uBloom;',
        '  vec3 s = toSRGB(c);',
        '  float l = dot(s, vec3(0.2126, 0.7152, 0.0722));',
        '  s = mix(vec3(l), s, uSat);',
        '  s = (s - 0.5) * uContrast + 0.5;',
        '  s = s * uGain + uLift * (1.0 - s);',
        '  float r = length(d * vec2(uAspect, 1.0)) / length(vec2(uAspect, 1.0) * 0.5);',
        '  s *= 1.0 - uVig * smoothstep(0.42, 1.05, r);',
        '  s = mix(s, uFlash, uFlashK);',
        '  float n = h12(gl_FragCoord.xy + fract(uTime * 7.31) * vec2(97.0, 41.0)) - 0.5;',
        '  s += n * (uGrain + 1.0 / 255.0);',
        '  gl_FragColor = vec4(clamp(s, 0.0, 1.0), 1.0);',
        '}'
      ].join('\n');

      function lin(c) { c = clamp(c, 0, 1); return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
      function fsTriangle() {
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
        g.setAttribute('uv', new T.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
        return g;
      }
      function shaderMat(frag, uniforms, extra) {
        var m = new T.ShaderMaterial({ uniforms: uniforms, vertexShader: FS_VERT, fragmentShader: frag, depthTest: false, depthWrite: false, toneMapped: false });
        if (extra) Object.keys(extra).forEach(function (k) { m[k] = extra[k]; });
        return m;
      }

      var LOOK = {
        sat: 1, contrast: 1, gain: [1, 1, 1], lift: [0, 0, 0],
        bloom: 0.6, threshold: 0.78, knee: 0.22, spread: 1.0,
        vignette: 0.28, grain: 0.03, ca: 0.25, haze: 0, hazeY: 0.5
      };

      // `post` returns null where it cannot run (WebGL 1): the game then keeps drawing straight to the screen.
      function post(renderer, opts) {
        if (!renderer || !renderer.capabilities || !renderer.capabilities.isWebGL2) return null;
        var p = {};
        Object.keys(LOOK).forEach(function (k) { p[k] = Array.isArray(LOOK[k]) ? LOOK[k].slice() : LOOK[k]; });
        Object.keys(opts || {}).forEach(function (k) { p[k] = Array.isArray(opts[k]) ? opts[k].slice() : opts[k]; });
        var hdr = false;
        try { hdr = !!renderer.extensions.has('EXT_color_buffer_float'); } catch (e) { hdr = false; }
        // half-float keeps what shines above white for the bloom; otherwise an sRGB target keeps the colour exact
        var type = hdr ? T.HalfFloatType : T.UnsignedByteType;
        var sceneRT = new T.WebGLRenderTarget(2, 2, { type: type, encoding: hdr ? T.LinearEncoding : T.sRGBEncoding, samples: 4, depthBuffer: true, minFilter: T.LinearFilter, magFilter: T.LinearFilter });
        var LEVELS = lowPower ? 4 : 5;
        var levels = [];
        for (var i = 0; i < LEVELS; i++) levels.push(new T.WebGLRenderTarget(2, 2, { type: type, depthBuffer: false, minFilter: T.LinearFilter, magFilter: T.LinearFilter }));

        var fsScene = new T.Scene(), fsCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        var quad = new T.Mesh(fsTriangle(), null); quad.frustumCulled = false; fsScene.add(quad);
        var down = shaderMat(DOWN_FRAG, { tMap: { value: null }, uTexel: { value: new T.Vector2() }, uThreshold: { value: p.threshold }, uKnee: { value: p.knee }, uBright: { value: 0 } });
        var up = shaderMat(UP_FRAG, { tMap: { value: null }, uTexel: { value: new T.Vector2() }, uSpread: { value: p.spread } }, { blending: T.AdditiveBlending, transparent: true });
        var comp = shaderMat(COMPOSITE_FRAG, {
          tScene: { value: sceneRT.texture }, tBloom: { value: levels[0].texture },
          uBloom: { value: 0 }, uTime: { value: 0 }, uAspect: { value: 1 },
          uSat: { value: 1 }, uContrast: { value: 1 }, uGain: { value: new T.Vector3(1, 1, 1) }, uLift: { value: new T.Vector3() },
          uVig: { value: 0 }, uGrain: { value: 0 }, uCA: { value: 0 }, uHaze: { value: 0 }, uHazeY: { value: 0.5 },
          uFlash: { value: new T.Color() }, uFlashK: { value: 0 }
        });

        var size = new T.Vector2(), w = 0, h = 0, time = 0;
        var flash = { k: 0, decay: 1 }, pulse = { k: 0, decay: 1 };
        var slow = 0, seen = 0, degraded = false;
        function resize() {
          renderer.getDrawingBufferSize(size);
          if (size.x === w && size.y === h) return;
          w = size.x; h = size.y;
          sceneRT.setSize(w, h);
          var lw = Math.max(1, w >> 1), lh = Math.max(1, h >> 1);
          for (var i = 0; i < levels.length; i++) { levels[i].setSize(lw, lh); lw = Math.max(1, lw >> 1); lh = Math.max(1, lh >> 1); }
        }
        function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); }

        var api = {
          params: p,
          enabled: true,
          render: function (scene, camera, dt) {
            dt = dt || 0.016;
            if (!api.enabled) { renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
            resize();
            // a slow GPU loses the bloom's finest level and the colour fringe before it loses its frame rate
            if (!degraded && dt > 0 && dt < 0.09 && ++seen > 150) { if (dt > 0.03) slow++; if (seen > 330) { if (slow > 90) { degraded = true; p.ca = 0; p.haze = 0; } seen = 150; slow = 0; } }
            time += reduced() ? 0 : dt;
            flash.k = Math.max(0, flash.k - dt * flash.decay);
            pulse.k = Math.max(0, pulse.k - dt * pulse.decay);
            var prevAuto = renderer.autoClear;
            // three lays the fog after the sRGB encoding, so its colour is a screen colour; in the linear target it must be
            // linear too, or every haze would come out paler than on the screen
            var fog = scene.fog && scene.fog.color, fr = 0, fg = 0, fb = 0;
            if (fog) { fr = fog.r; fg = fog.g; fb = fog.b; fog.setRGB(lin(fr), lin(fg), lin(fb)); }
            renderer.setRenderTarget(sceneRT);
            renderer.render(scene, camera);
            if (fog) fog.setRGB(fr, fg, fb);
            renderer.autoClear = false;
            var bloom = p.bloom + pulse.k;
            if (bloom > 0.001) {
              renderer.autoClear = true;
              down.uniforms.uThreshold.value = p.threshold; down.uniforms.uKnee.value = p.knee;
              down.uniforms.tMap.value = sceneRT.texture; down.uniforms.uTexel.value.set(1 / w, 1 / h); down.uniforms.uBright.value = 1;
              pass(down, levels[0]);
              down.uniforms.uBright.value = 0;
              for (var i = 1; i < levels.length; i++) {
                down.uniforms.tMap.value = levels[i - 1].texture;
                down.uniforms.uTexel.value.set(1 / levels[i - 1].width, 1 / levels[i - 1].height);
                pass(down, levels[i]);
              }
              renderer.autoClear = false;
              up.uniforms.uSpread.value = p.spread;
              for (var j = levels.length - 1; j > 0; j--) {
                up.uniforms.tMap.value = levels[j].texture;
                up.uniforms.uTexel.value.set(1 / levels[j].width, 1 / levels[j].height);
                pass(up, levels[j - 1]);
              }
            }
            var u = comp.uniforms;
            u.uBloom.value = bloom; u.uTime.value = time; u.uAspect.value = w / Math.max(1, h);
            u.uSat.value = p.sat; u.uContrast.value = p.contrast;
            u.uGain.value.set(p.gain[0], p.gain[1], p.gain[2]); u.uLift.value.set(p.lift[0], p.lift[1], p.lift[2]);
            u.uVig.value = p.vignette; u.uGrain.value = reduced() ? 0 : p.grain; u.uCA.value = p.ca;
            u.uHaze.value = reduced() ? 0 : p.haze; u.uHazeY.value = p.hazeY;
            u.uFlashK.value = flash.k * flash.k * (3 - 2 * flash.k) * flash.max;
            renderer.autoClear = true;
            pass(comp, null);
            renderer.autoClear = prevAuto;
          },
          // a flash of colour that fades (white for a revelation, ember for a blow); it is soft with reduced motion
          flash: function (color, strength, seconds) {
            comp.uniforms.uFlash.value.set(color == null ? 0xffffff : color);
            flash.max = clamp(strength == null ? 0.5 : strength, 0, 1) * (reduced() ? 0.4 : 1);
            flash.k = 1; flash.decay = 1 / Math.max(0.05, seconds || 0.6);
          },
          // the bloom swells for a moment
          pulse: function (extra, seconds) { pulse.k = Math.max(pulse.k, extra == null ? 0.6 : extra); pulse.decay = pulse.k / Math.max(0.05, seconds || 0.8); },
          // where the horizon falls on the screen (0 bottom … 1 top), for the heat haze
          horizonFrom: function (camera) {
            var v = new T.Vector3(), f = new T.Vector3();
            camera.getWorldDirection(f); f.y = 0;
            if (f.lengthSq() < 1e-6) return;
            f.normalize();
            v.copy(camera.position).addScaledVector(f, 400); v.y = 0;
            v.project(camera);
            p.hazeY = clamp(v.y * 0.5 + 0.5, -0.2, 1.2);
          },
          dispose: function () {
            sceneRT.dispose(); levels.forEach(function (l) { l.dispose(); });
            down.dispose(); up.dispose(); comp.dispose(); quad.geometry.dispose();
          }
        };
        flash.max = 0;
        return api;
      }

      // ---------------------------------------------------------------- the body: Hermes walks
      function findHand(arm) {
        if (!arm) return null;
        for (var i = 0; i < arm.children.length; i++) { var c = arm.children[i]; if (c.isGroup && Math.abs(c.position.y + 0.55) < 0.02) return c; }
        return null;
      }
      function gait(H, o) {
        if (!H || !H.hermes || !H.legL || !H.legR) return null;
        o = o || {};
        var root = H.hermes;
        root.rotation.order = 'YXZ';
        // the upper body moves on its own pivot, so the game keeps owning where he stands and where he faces
        var body = new T.Group();
        root.children.slice().forEach(function (c) { if (c !== H.legL && c !== H.legR) { root.remove(c); body.add(c); } });
        root.add(body);
        var arms = [];
        body.children.forEach(function (c) { if (c.isGroup && Math.abs(c.position.y - 1.34) < 0.02 && Math.abs(Math.abs(c.position.x) - 0.27) < 0.02) arms.push(c); });
        var armR = H.armR || arms.filter(function (a) { return a.position.x > 0; })[0] || null;
        var armL = H.armL || arms.filter(function (a) { return a.position.x < 0; })[0] || null;
        var head = H.head || null;
        var handL = findHand(armL);
        var base = {
          armR: armR ? armR.rotation.clone() : null, armL: armL ? armL.rotation.clone() : null,
          staff: H.staff ? H.staff.rotation.clone() : null, lamp: H.lamp ? H.lamp.rotation.clone() : null,
          cloak: H.cloak ? H.cloak.rotation.clone() : null, head: head ? head.rotation.clone() : null,
          legLx: H.legL.position.x, legRx: H.legR.position.x
        };
        // the staff stays in the left hand however the arm swings
        var staffOff = null, tmp = new T.Vector3();
        function handInBody() {
          handL.updateWorldMatrix(true, false);
          tmp.setFromMatrixPosition(handL.matrixWorld);
          return body.worldToLocal(tmp);
        }
        if (handL && H.staff) { root.updateMatrixWorld(true); staffOff = H.staff.position.clone().sub(handInBody().clone()); }

        var STRIDE0 = o.stride || 0.36, STRIDE = STRIDE0, LIFT = o.lift || 0.075, REF = o.refSpeed || 1.25;
        var phase = 0, wgt = 0, last = null, lastYaw = root.rotation.y, yawRate = 0, t = 0;
        var lamp = { ax: 0, az: 0, vx: 0, vz: 0 }, vel = new T.Vector3(), prevVel = new T.Vector3();
        var cloak = { x: 0, z: 0 };
        var look = { target: null, yaw: 0, pitch: 0 };
        var lookV = new T.Vector3();

        function foot(leg, ph, side) {
          var z, y = 0, pitch = 0;
          if (ph < 0.5) { z = -STRIDE / 2 + STRIDE * (ph / 0.5); }
          else {
            var s = (ph - 0.5) / 0.5, e = s * s * (3 - 2 * s);
            z = STRIDE / 2 - STRIDE * e;
            y = Math.sin(Math.PI * s) * LIFT;
            pitch = 0.42 * Math.sin(Math.PI * s) * (2 * s - 0.55);
          }
          leg.position.z += (z * wgt - leg.position.z) * Math.min(1, 0.35 + wgt);
          leg.position.y = y * wgt;
          leg.rotation.x = pitch * wgt;
          leg.position.x = side;
        }

        return {
          body: body,
          look: function (v) { look.target = v ? (v.clone ? v.clone() : new T.Vector3(v.x, v.y, v.z)) : null; },
          update: function (dt) {
            if (!(dt > 0)) return;
            t += dt;
            var sc = root.scale.x || 1;
            var px = root.position.x, pz = root.position.z;
            var dist = 0;
            if (last) {
              var dx = px - last.x, dz = pz - last.z;
              dist = Math.hypot(dx, dz);
              if (dist / sc > 0.6) { dist = 0; dx = 0; dz = 0; }          // he was placed, not walked
              prevVel.copy(vel); vel.set(dx / dt, 0, dz / dt);
            }
            last = { x: px, z: pz };
            var dy = root.rotation.y - lastYaw; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU;
            lastYaw = root.rotation.y;
            yawRate += (dy / dt - yawRate) * Math.min(1, dt * 8);
            var local = dist / sc, speed = local / dt;
            wgt += ((speed > 0.05 ? clamp(speed / REF, 0.35, 1) : 0) - wgt) * Math.min(1, dt * (speed > 0.05 ? 10 : 6));

            // the feet: one cycle is two steps, each step as long as the ground the body covers; a hurried walk lengthens the stride
            STRIDE += ((speed > 0.05 ? clamp(STRIDE0 + speed * 0.08, STRIDE0, 0.8) : STRIDE0) - STRIDE) * Math.min(1, dt * 4);
            var before = phase;
            if (speed > 0.05) phase = (phase + local / (2 * STRIDE)) % 1;
            else if (wgt < 0.02) phase = 0;
            foot(H.legL, phase, base.legLx);
            foot(H.legR, (phase + 0.5) % 1, base.legRx);
            if (speed > 0.05 && o.onStep) {
              var crossed = function (a, b, mark) { return a <= b ? (mark > a && mark <= b) : (mark > a || mark <= b); };
              [[0.0001, H.legL, 'L'], [0.5, H.legR, 'R']].forEach(function (s) {
                if (crossed(before, phase, s[0])) { var wp = new T.Vector3(); s[1].getWorldPosition(wp); o.onStep({ side: s[2], pos: wp }); }
              });
            }

            // the body: up at mid-stride, a little sideways over the foot that carries him, leaning into the walk and the turn
            var c2 = Math.cos(TAU * phase);
            var bob = (0.032 + 0.05 * (STRIDE - STRIDE0)) * (0.5 - 0.5 * Math.cos(2 * TAU * phase)) * wgt;
            var breathe = Math.sin(t * 1.7) * (1 - wgt);
            body.position.y = bob + 0.004 * breathe;
            body.position.x = 0.014 * Math.sin(TAU * phase) * wgt + 0.008 * Math.sin(t * 0.37) * (1 - wgt);
            body.rotation.x = -0.075 * wgt;
            body.rotation.z = 0.035 * Math.sin(TAU * phase) * wgt - clamp(yawRate, -3, 3) * 0.035;
            body.scale.y = 1 + 0.006 * breathe;

            if (armR && base.armR) armR.rotation.x = base.armR.x + 0.2 * c2 * wgt + 0.02 * breathe;
            if (armL && base.armL) armL.rotation.x = base.armL.x - 0.1 * c2 * wgt;
            if (staffOff && H.staff) {
              H.staff.position.copy(handInBody()).add(staffOff);
              H.staff.rotation.x = base.staff.x - 0.16 * c2 * wgt;
            }

            // the lamp hangs from his hand: a pendulum pushed by every start, stop and turn
            if (H.lamp && base.lamp) {
              var ax = 0, az = 0;
              if (dt < 0.1) {
                var acc = vel.clone().sub(prevVel).divideScalar(dt);
                var yaw = root.rotation.y, cs = Math.cos(yaw), sn = Math.sin(yaw);
                // into his frame: forward is -z
                var fwd = -acc.x * sn - acc.z * cs, side = acc.x * cs - acc.z * sn;
                ax = clamp(fwd / sc, -40, 40); az = clamp(side / sc, -40, 40);
              }
              var K = 38, C = 3.2, G = 1.0;
              lamp.vx += (-K * lamp.ax - C * lamp.vx - G * ax) * dt; lamp.ax += lamp.vx * dt;
              lamp.vz += (-K * lamp.az - C * lamp.vz - G * az + yawRate * 0.9) * dt; lamp.az += lamp.vz * dt;
              lamp.ax = clamp(lamp.ax, -0.6, 0.6); lamp.az = clamp(lamp.az, -0.6, 0.6);
              H.lamp.rotation.x = base.lamp.x + lamp.ax + 0.05 * Math.sin(TAU * phase * 2) * wgt;
              H.lamp.rotation.z = base.lamp.z + lamp.az;
            }
            // the cloak trails behind the walk and swings out of the turn
            if (H.cloak && base.cloak) {
              cloak.x += ((0.06 * wgt) - cloak.x) * Math.min(1, dt * 4);
              cloak.z += ((clamp(yawRate, -3, 3) * 0.05 + 0.025 * Math.sin(TAU * phase) * wgt) - cloak.z) * Math.min(1, dt * 5);
              H.cloak.rotation.x = base.cloak.x + cloak.x;
              H.cloak.rotation.z = base.cloak.z + cloak.z;
            }
            // the head turns to what matters, and keeps level while the body bobs
            if (head && base.head) {
              var ty = 0, tp = 0;
              if (look.target) {
                head.updateWorldMatrix(true, false);
                lookV.copy(look.target); head.parent.worldToLocal(lookV); lookV.sub(head.position);
                ty = clamp(Math.atan2(-lookV.x, -lookV.z), -0.75, 0.75);
                tp = clamp(Math.atan2(lookV.y, Math.hypot(lookV.x, lookV.z)), -0.35, 0.3);
              } else ty = 0.06 * Math.sin(t * 0.31) * (1 - wgt);
              look.yaw += (ty - look.yaw) * Math.min(1, dt * 4);
              look.pitch += (tp - look.pitch) * Math.min(1, dt * 4);
              head.rotation.y = base.head.y + look.yaw;
              head.rotation.x = base.head.x + look.pitch + 0.06 * wgt;
            }
          },
          moving: function () { return wgt > 0.05; }
        };
      }

      // ---------------------------------------------------------------- the camera
      function shaker(o) {
        o = o || {};
        var trauma = 0, t = Math.random() * 100;
        var MAXR = o.maxAngle || 0.045, IDLE = o.idle == null ? 0.0035 : o.idle;
        var n = function (x, s) { return Math.sin(x * 1.7 + s) * 0.6 + Math.sin(x * 3.1 + s * 2.3) * 0.3 + Math.sin(x * 7.3 + s * 0.7) * 0.1; };
        return {
          add: function (k) { if (!reduced()) trauma = Math.min(1, trauma + k); },
          apply: function (camera, dt) {
            if (reduced()) return;
            t += dt; trauma = Math.max(0, trauma - dt * 1.3);
            var s = trauma * trauma, f = 24;
            camera.rotateX(n(t * f, 1) * MAXR * s + Math.sin(t * 0.43) * IDLE);
            camera.rotateY(n(t * f, 7) * MAXR * s + Math.sin(t * 0.31 + 2) * IDLE);
            camera.rotateZ(n(t * f, 13) * MAXR * 0.6 * s);
          },
          level: function () { return trauma; }
        };
      }

      // ---------------------------------------------------------------- dust, sand and sparks
      var PART_VERT = [
        'attribute float aSize; attribute vec4 aColor; uniform float uScale; varying vec4 vColor;',
        '#include <fog_pars_vertex>',
        'void main(){',
        '  vColor = aColor;',
        '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = aSize * uScale / max(0.001, -mvPosition.z);',
        '  gl_Position = projectionMatrix * mvPosition;',
        '  #include <fog_vertex>',
        '}'
      ].join('\n');
      var PART_FRAG = [
        'varying vec4 vColor; uniform float uHard;',
        '#include <fog_pars_fragment>',
        'void main(){',
        '  float d = length(gl_PointCoord - 0.5) * 2.0;',
        '  float a = 1.0 - smoothstep(uHard, 1.0, d);',
        '  if (a * vColor.a < 0.003) discard;',
        '  gl_FragColor = vec4(vColor.rgb, a * vColor.a);',
        '  #include <tonemapping_fragment>',
        '  #include <encodings_fragment>',
        '  #include <fog_fragment>',
        '}'
      ].join('\n');
      function particles(scene, o) {
        o = o || {};
        var MAX = o.max || 256, additive = !!o.additive;
        var pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 4), size = new Float32Array(MAX);
        var vel = new Float32Array(MAX * 3), life = new Float32Array(MAX), max = new Float32Array(MAX);
        var s0 = new Float32Array(MAX), s1 = new Float32Array(MAX), a0 = new Float32Array(MAX);
        var grav = new Float32Array(MAX), drag = new Float32Array(MAX), bounce = new Float32Array(MAX), fadeIn = new Float32Array(MAX);
        var geo = new T.BufferGeometry();
        var aPos = new T.BufferAttribute(pos, 3), aCol = new T.BufferAttribute(col, 4), aSize = new T.BufferAttribute(size, 1);
        aPos.setUsage(T.DynamicDrawUsage); aCol.setUsage(T.DynamicDrawUsage); aSize.setUsage(T.DynamicDrawUsage);
        geo.setAttribute('position', aPos); geo.setAttribute('aColor', aCol); geo.setAttribute('aSize', aSize);
        geo.boundingSphere = new T.Sphere(new T.Vector3(), 1e5);
        var uniforms = T.UniformsUtils.merge([T.UniformsLib.fog, { uScale: { value: 400 }, uHard: { value: additive ? 0.0 : 0.15 } }]);
        var mat = new T.ShaderMaterial({
          uniforms: uniforms, vertexShader: PART_VERT, fragmentShader: PART_FRAG, fog: !!scene.fog,
          transparent: true, depthWrite: false, blending: additive ? T.AdditiveBlending : T.NormalBlending
        });
        var points = new T.Points(geo, mat);
        points.frustumCulled = false;
        points.renderOrder = o.renderOrder == null ? 5 : o.renderOrder;
        scene.add(points);
        var next = 0, alive = 0, tmpC = new T.Color();
        var wind = o.wind || [0, 0, 0];
        var heightAt = o.heightAt || function () { return 0; };
        var rnd = function (r) { return Array.isArray(r) ? r[0] + Math.random() * (r[1] - r[0]) : r; };

        function emit(at, n, e) {
          e = e || {};
          if (reduced() && !e.evenReduced) n = Math.ceil(n * 0.3);
          tmpC.set(e.color == null ? 0xd9b98a : e.color);
          for (var k = 0; k < n; k++) {
            var i = next; next = (next + 1) % MAX;
            var sp = rnd(e.spread == null ? 0.3 : e.spread);
            pos[i * 3] = at.x + (Math.random() - 0.5) * sp; pos[i * 3 + 1] = at.y + Math.random() * (e.rise || 0); pos[i * 3 + 2] = at.z + (Math.random() - 0.5) * sp;
            var th = Math.random() * TAU, sv = rnd(e.speed == null ? [0.3, 1.2] : e.speed);
            var upv = rnd(e.up == null ? [0.2, 1] : e.up);
            var dir = e.dir || null;
            vel[i * 3] = Math.cos(th) * sv + (dir ? dir.x : 0); vel[i * 3 + 1] = upv; vel[i * 3 + 2] = Math.sin(th) * sv + (dir ? dir.z : 0);
            max[i] = life[i] = rnd(e.life == null ? [0.6, 1.4] : e.life);
            s0[i] = rnd(e.size == null ? [0.3, 0.6] : e.size); s1[i] = s0[i] * (e.grow == null ? 2.2 : e.grow);
            a0[i] = e.alpha == null ? 0.5 : e.alpha;
            grav[i] = e.gravity == null ? -1.2 : e.gravity; drag[i] = e.drag == null ? 1.6 : e.drag; bounce[i] = e.bounce == null ? 0.25 : e.bounce;
            fadeIn[i] = e.fadeIn == null ? 0.12 : e.fadeIn;
            var j = (e.tint ? (Math.random() - 0.5) * e.tint : 0);
            col[i * 4] = tmpC.r + j; col[i * 4 + 1] = tmpC.g + j; col[i * 4 + 2] = tmpC.b + j;
          }
          alive = MAX;
        }
        function update(dt, camera, renderer) {
          if (camera && renderer) {
            var hgt = renderer.getDrawingBufferSize ? renderer.getDrawingBufferSize(new T.Vector2()).y : 600;
            uniforms.uScale.value = hgt / (2 * Math.tan((camera.fov || 50) * Math.PI / 360));
          }
          if (!alive) return;
          var any = false;
          for (var i = 0; i < MAX; i++) {
            if (life[i] <= 0) { if (size[i] !== 0) { size[i] = 0; col[i * 4 + 3] = 0; } continue; }
            any = true;
            life[i] -= dt;
            var k = 1 - Math.max(0, life[i]) / max[i];
            var dk = Math.exp(-drag[i] * dt);
            vel[i * 3] = (vel[i * 3] + wind[0] * dt) * dk; vel[i * 3 + 1] = (vel[i * 3 + 1] + grav[i] * dt) * dk; vel[i * 3 + 2] = (vel[i * 3 + 2] + wind[2] * dt) * dk;
            pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
            var g = heightAt(pos[i * 3], pos[i * 3 + 2]) + 0.02;
            if (pos[i * 3 + 1] < g) {
              pos[i * 3 + 1] = g;
              if (vel[i * 3 + 1] < 0) vel[i * 3 + 1] = -vel[i * 3 + 1] * bounce[i];
              vel[i * 3] *= 0.6; vel[i * 3 + 2] *= 0.6;
            }
            size[i] = s0[i] + (s1[i] - s0[i]) * Math.sqrt(k);
            var fi = fadeIn[i] > 0 ? Math.min(1, k / fadeIn[i]) : 1;
            col[i * 4 + 3] = a0[i] * fi * (1 - k) * (1 - k * 0.3);
          }
          aPos.needsUpdate = true; aCol.needsUpdate = true; aSize.needsUpdate = true;
          if (!any) alive = 0;
        }
        return { points: points, emit: emit, update: update, setWind: function (x, y, z) { wind = [x, y, z]; }, count: function () { var c = 0; for (var i = 0; i < MAX; i++) if (life[i] > 0) c++; return c; } };
      }

      // ---------------------------------------------------------------- footprints
      function bootTex() {
        var c = document.createElement('canvas'); c.width = 64; c.height = 128;
        var g = c.getContext('2d');
        g.fillStyle = 'rgba(255,255,255,1)';
        g.beginPath(); g.ellipse(32, 40, 20, 34, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(32, 100, 15, 20, 0, 0, TAU); g.fill();
        var tx = new T.CanvasTexture(c);
        return tx;
      }
      function footprints(scene, o) {
        o = o || {};
        var MAX = o.max || 48, LIFE = o.life || 16, ALPHA = o.alpha == null ? 0.42 : o.alpha;
        var geo = new T.BufferGeometry();
        var pos = new Float32Array(MAX * 4 * 3), uv = new Float32Array(MAX * 4 * 2), col = new Float32Array(MAX * 4 * 4), idx = [];
        for (var i = 0; i < MAX; i++) {
          uv.set([0, 0, 1, 0, 1, 1, 0, 1], i * 8);
          idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
        }
        var aPos = new T.BufferAttribute(pos, 3), aCol = new T.BufferAttribute(col, 4);
        aPos.setUsage(T.DynamicDrawUsage); aCol.setUsage(T.DynamicDrawUsage);
        geo.setAttribute('position', aPos); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setAttribute('color', aCol);
        geo.setIndex(idx);
        geo.boundingSphere = new T.Sphere(new T.Vector3(), 1e5);
        var mat = new T.MeshBasicMaterial({ color: o.color == null ? 0x5a3c22 : o.color, map: bootTex(), vertexColors: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 });
        var mesh = new T.Mesh(geo, mat);
        mesh.frustumCulled = false; mesh.renderOrder = 2;
        scene.add(mesh);
        var age = new Float32Array(MAX).fill(LIFE + 1), next = 0;
        return {
          mesh: mesh,
          stamp: function (x, y, z, yaw, side, scale) {
            var i = next; next = (next + 1) % MAX;
            var s = scale || 1, hw = 0.07 * s, hl = 0.15 * s, off = (side === 'L' ? -1 : 1) * 0.02 * s;
            var cs = Math.cos(yaw), sn = Math.sin(yaw);
            // his frame: forward is -z, right is +x
            var corner = function (lx, lz) { return [x + (lx + off) * cs + lz * sn, y, z - (lx + off) * sn + lz * cs]; };
            var q = [corner(-hw, hl), corner(hw, hl), corner(hw, -hl), corner(-hw, -hl)];
            for (var k = 0; k < 4; k++) pos.set(q[k], (i * 4 + k) * 3);
            age[i] = 0;
            aPos.needsUpdate = true;
          },
          update: function (dt) {
            for (var i = 0; i < MAX; i++) {
              if (age[i] > LIFE) { if (col[i * 16 + 3] !== 0) { for (var k = 0; k < 4; k++) col[(i * 4 + k) * 4 + 3] = 0; } continue; }
              age[i] += dt;
              var a = ALPHA * Math.min(1, age[i] * 6) * (1 - Math.pow(Math.min(1, age[i] / LIFE), 2));
              for (var k2 = 0; k2 < 4; k2++) { var j = (i * 4 + k2) * 4; col[j] = col[j + 1] = col[j + 2] = 1; col[j + 3] = a; }
            }
            aCol.needsUpdate = true;
          },
          clear: function () { age.fill(LIFE + 1); }
        };
      }

      // ---------------------------------------------------------------- the kit: everything above for one game, in one call
      // kit(renderer, scene, H, opts) → { post, gait, dust, sparks, prints, shake, frame(dt, camera), render(scene, camera, dt),
      //   blow(at, k), triumph(at, k), puff(at, n) }. opts: look (post params), scale (Hermes), heightAt, printY, sandColor,
      //   wind, ambient (a function giving the point the sand blows around, or null), printsOn (false on stone), noPost.
      function kit(renderer, scene, H, o) {
        o = o || {};
        var hAt = o.heightAt || function () { return 0; };
        var k = { post: null, gait: null, dust: null, sparks: null, prints: null, shake: null };
        if (!o.noPost) { try { k.post = post(renderer, o.look || {}); } catch (e) { k.post = null; } }
        k.shake = shaker({ idle: o.idle == null ? 0.002 : o.idle });
        k.dust = particles(scene, { max: o.maxDust || 320, wind: o.wind || [0.8, 0, 0.2], heightAt: hAt });
        k.sparks = particles(scene, { max: o.maxSparks || 240, additive: true, heightAt: hAt });
        if (o.printsOn !== false) k.prints = footprints(scene, { max: 64, life: o.printLife || 18, color: o.printColor });
        var sand = o.sandColor == null ? 0xdcbb8c : o.sandColor;
        if (H && H.hermes) {
          k.gait = gait(H, { stride: o.stride, onStep: function (st) {
            if (o.onStep) o.onStep(st);
            if (k.prints && (!o.printsWhere || o.printsWhere(st.pos))) k.prints.stamp(st.pos.x, hAt(st.pos.x, st.pos.z) + (o.printY == null ? 0.03 : o.printY), st.pos.z, H.hermes.rotation.y, st.side, H.hermes.scale.x);
            if (o.stepDust !== false) k.dust.emit(st.pos, 3, { size: [0.18, 0.32].map(function (v) { return v * H.hermes.scale.x; }), speed: [0.1, 0.4], up: [0.15, 0.45], life: [0.6, 1.1], alpha: 0.3, gravity: -0.6, color: sand });
          } });
        }
        var windT = 0;
        k.frame = function (dt, camera) {
          if (!(dt > 0)) return;
          if (k.gait) k.gait.update(dt);
          if (o.ambient) {
            windT -= dt;
            var c = windT <= 0 ? o.ambient() : null;
            if (c) {
              windT = o.ambientEvery || 0.12;
              var R = o.ambientRadius || 30;
              var x = c.x + (Math.random() - 0.5) * R * 2, z = c.z + (Math.random() - 0.5) * R * 1.6;
              k.dust.emit({ x: x, y: hAt(x, z) + 0.1, z: z }, 1, { size: [R * 0.045, R * 0.085], grow: 1.5, speed: [0.05, 0.25], up: [0.03, 0.2], life: [2.4, 4], alpha: o.ambientAlpha || 0.1, gravity: 0, drag: 0.25, fadeIn: 0.35, color: o.ambientColor == null ? sand : o.ambientColor });
            }
          }
          k.dust.update(dt, camera, renderer); k.sparks.update(dt, camera, renderer);
          if (k.prints) k.prints.update(dt);
        };
        k.render = function (sc, camera, dt) {
          if (k.shake) k.shake.apply(camera, dt || 0.016);
          if (k.post) { if (o.haze) k.post.horizonFrom(camera); k.post.render(sc, camera, dt); }
          else renderer.render(sc, camera);
        };
        // a mistake: the ground jolts, the light reddens, sand jumps
        k.blow = function (at, strength) {
          var s2 = strength == null ? 0.5 : strength;
          k.shake.add(s2);
          if (k.post) k.post.flash(o.blowColor == null ? 0x3d1206 : o.blowColor, 0.2 + 0.25 * s2, 0.7 + s2);
          if (at) k.dust.emit(at, 22, { size: [0.3, 0.6].map(function (v) { return v * (o.scale || 1); }), speed: [0.6, 1.8], up: [0.5, 1.4], life: [0.9, 1.6], alpha: 0.4, spread: o.scale || 1, color: sand });
        };
        // a success: gold rises, the light swells
        k.triumph = function (at, strength) {
          var s2 = strength == null ? 1 : strength, sc2 = o.scale || 1;
          if (at) k.sparks.emit(at, Math.round(60 * s2), { color: o.sparkColor == null ? 0xffd27a : o.sparkColor, size: [0.07, 0.14].map(function (v) { return v * sc2; }), grow: 0.4, speed: [0.2 * sc2, 1.0 * sc2], up: [0.9 * sc2, 2.2 * sc2], life: [0.9, 1.8], alpha: 0.95, gravity: -1.3 * sc2, drag: 0.7, bounce: 0.45, spread: 0.8 * sc2 });
          if (k.post) k.post.pulse(0.5 * s2, 1.3);
          k.shake.add(0.12 * s2);
        };
        k.puff = function (at, n, extra) {
          var e = { size: [0.3, 0.6].map(function (v) { return v * (o.scale || 1); }), speed: [0.3, 1.0], up: [0.3, 0.9], life: [0.8, 1.4], alpha: 0.35, color: sand };
          if (extra) Object.keys(extra).forEach(function (kk) { e[kk] = extra[kk]; });
          k.dust.emit(at, n || 12, e);
        };
        return k;
      }

      window.EclipseFX = { kit: kit, post: post, gait: gait, shaker: shaker, particles: particles, footprints: footprints, reduced: reduced, lowPower: lowPower };
    })();
