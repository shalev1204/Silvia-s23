    // Ambient sound per station (docs/IDEAS_BACKLOG.md #4). While a station's game is on screen, a quiet bed of
    // synthesized sound plays under it (Web Audio, no files): wind on the Erg, water at the Four Wells, fire in
    // Tower II, the hum of the Oracle's chamber… It fades in when the game opens and out when it closes.
    // On by default, low; the speaker button (always on screen) mutes it, and the choice is remembered
    // (order_ambience_muted). Browsers only allow sound after a touch or a key, so the first one wakes it.
    // The stations' own sounds (the pillars' song, the knocks, the storm) are separate and keep their own switches.
    window.EclipseAmbience = (function () {
      'use strict';
      var MUTE_KEY = 'order_ambience_muted';
      var MASTER = 0.16, FADE_S = 1.5, POLL_MS = 600;

      // Which bed goes with which game. Parts: wind [level, centre Hz, Q, sway/s, echo?], drone [level, Hz…],
      // drips [level, per second], crackle [level, per second], rumble [level, cutoff Hz]
      var BEDS = {
        'modal-cairn-one': { name: 'dry wash at dawn', wind: [0.5, 520, 0.7, 0.07] },
        'modal-whispering-chasm': { name: 'canyon', wind: [0.55, 340, 1.0, 0.05, true], drone: [0.14, 55, 82.4] },
        'modal-salt-playa': { name: 'salt flat', wind: [0.4, 1800, 0.6, 0.1], crackle: [0.12, 0.5] },
        'modal-desert-lexicon': { name: 'nomad camp', wind: [0.4, 700, 0.8, 0.06], drone: [0.08, 110, 165] },
        'modal-oasis-clepsydra': { name: 'four wells', wind: [0.15, 420, 0.8, 0.05], drips: [0.32, 1.2], rumble: [0.1, 800] },
        'modal-sun-monolith': { name: 'noon on the ridge', wind: [0.45, 900, 0.5, 0.04], drone: [0.1, 73.4, 110] },
        'modal-sandstone-labyrinth': { name: 'labyrinth', wind: [0.35, 450, 1.2, 0.05, true], crackle: [0.1, 0.8] },
        'modal-cairn-four': { name: 'singing canyon', wind: [0.4, 300, 1.5, 0.08, true] },
        'modal-solstice-arch': { name: 'courtyard of rays', wind: [0.3, 1200, 0.6, 0.05], drone: [0.07, 130.8, 196, 261.6] },
        'modal-polybius-stele': { name: 'tower in flames', rumble: [0.35, 300], crackle: [0.28, 3] },
        'modal-oracle-horizon': { name: 'inner chamber', wind: [0.12, 600, 0.8, 0.04], drone: [0.13, 98, 147, 196] },
        'modal-masks-gate': { name: 'theatre gate', wind: [0.1, 500, 0.9, 0.03], drone: [0.11, 65.4, 98], crackle: [0.07, 0.5] },
        'modal-camera-obscura': { name: 'dark room', wind: [0.05, 380, 1.1, 0.02], drone: [0.1, 55, 82.4], drips: [0.14, 0.35] },
        'modal-whispering-gallery': { name: 'stone gallery', wind: [0.04, 700, 0.9, 0.02], drone: [0.05, 73.4, 110], drips: [0.08, 0.2] }
      };

      var ctx = null, master = null, noise = null, current = null, bed = null;
      var muted = false;
      try { muted = localStorage.getItem(MUTE_KEY) === 'true'; } catch (e) {}

      function audio() {
        if (ctx) return ctx;
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        try { ctx = new C(); } catch (e) { return null; }
        master = ctx.createGain();
        master.gain.value = muted ? 0 : MASTER;
        master.connect(ctx.destination);
        noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        var d = noise.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return ctx;
      }
      function noiseSource() {
        var s = ctx.createBufferSource();
        s.buffer = noise;
        s.loop = true;
        s.loopStart = Math.random();   // two beds never share the same grain
        return s;
      }
      function lfo(rate, depth, target) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = rate;
        g.gain.value = depth;
        o.connect(g);
        g.connect(target);
        o.start();
        return o;
      }

      // ---- One bed: every part feeds the bed's own gain, which fades in and out
      function build(def) {
        var out = ctx.createGain(), stops = [], timers = [];
        out.gain.value = 0;
        out.connect(master);
        if (def.wind) {
          var w = def.wind, src = noiseSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
          bp.type = 'bandpass'; bp.frequency.value = w[1]; bp.Q.value = w[2];
          g.gain.value = w[0];
          src.connect(bp); bp.connect(g);
          stops.push(lfo(w[3], w[1] * 0.35, bp.frequency), lfo(w[3] * 0.7, w[0] * 0.4, g.gain));
          if (w[4]) {
            var dl = ctx.createDelay(1), fb = ctx.createGain();
            dl.delayTime.value = 0.42; fb.gain.value = 0.45;
            g.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(out);
          }
          g.connect(out);
          src.start();
          stops.push(src);
        }
        if (def.rumble) {
          var r = noiseSource(), lp = ctx.createBiquadFilter(), rg = ctx.createGain();
          lp.type = 'lowpass'; lp.frequency.value = def.rumble[1];
          rg.gain.value = def.rumble[0];
          r.connect(lp); lp.connect(rg); rg.connect(out);
          stops.push(lfo(0.11, def.rumble[0] * 0.3, rg.gain));
          r.start();
          stops.push(r);
        }
        if (def.drone) {
          var dg = ctx.createGain(), dlp = ctx.createBiquadFilter();
          dlp.type = 'lowpass'; dlp.frequency.value = 900;
          dg.gain.value = def.drone[0];
          dlp.connect(dg); dg.connect(out);
          def.drone.slice(1).forEach(function (f, i) {
            var o = ctx.createOscillator();
            o.type = i ? 'sine' : 'triangle';
            o.frequency.value = f;
            o.detune.value = (i - 1) * 4;
            o.connect(dlp);
            o.start();
            stops.push(o);
          });
          stops.push(lfo(0.06, def.drone[0] * 0.35, dg.gain));
        }
        if (def.drips) timers.push(every(def.drips[1], function () { drip(out, def.drips[0]); }));
        if (def.crackle) timers.push(every(def.crackle[1], function () { crackle(out, def.crackle[0]); }));
        return { out: out, stops: stops, timers: timers };
      }
      // Random events, on average `perSecond` times a second
      function every(perSecond, fn) {
        return setInterval(function () { if (Math.random() < perSecond * 0.1) fn(); }, 100);
      }
      function drip(out, level) {
        var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = 900 + Math.random() * 900;
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.12);
        g.gain.setValueAtTime(level, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g); g.connect(out);
        o.start(t); o.stop(t + 0.2);
      }
      function crackle(out, level) {
        var t = ctx.currentTime, s = noiseSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain(), len = 0.02 + Math.random() * 0.05;
        hp.type = 'highpass'; hp.frequency.value = 1500 + Math.random() * 2500;
        g.gain.setValueAtTime(level * (0.4 + Math.random() * 0.6), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        s.connect(hp); hp.connect(g); g.connect(out);
        s.start(t); s.stop(t + len + 0.02);
      }
      function fadeOut(b) {
        var t = ctx.currentTime;
        b.timers.forEach(clearInterval);
        b.out.gain.cancelScheduledValues(t);
        b.out.gain.setValueAtTime(b.out.gain.value, t);
        b.out.gain.linearRampToValueAtTime(0, t + FADE_S);
        setTimeout(function () {
          b.stops.forEach(function (n) { try { n.stop(); } catch (e) {} });
          b.out.disconnect();
        }, FADE_S * 1000 + 100);
      }

      // ---- Which game is on screen
      function onScreen() {
        var ids = Object.keys(BEDS);
        for (var i = 0; i < ids.length; i++) {
          var m = document.getElementById(ids[i]);
          if (m && m.style.display !== 'none' && m.getClientRects().length) return ids[i];
        }
        return null;
      }
      function sync() {
        var id = onScreen();
        if (id === current) return;
        if (bed) { fadeOut(bed); bed = null; }
        current = id;
        if (!id || !audio()) return;
        bed = build(BEDS[id]);
        bed.out.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE_S);
        if (ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(function () {});
      }
      setInterval(sync, POLL_MS);

      // Sound may only start after a gesture; the tab going away pauses it
      function wake() { if (audio() && ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(function () {}); }
      ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { window.addEventListener(ev, wake, true); });
      document.addEventListener('visibilitychange', function () {
        if (!ctx) return;
        if (document.hidden) ctx.suspend().catch(function () {});
        else wake();
      });

      // ---- The speaker button
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'ambience-toggle';
      btn.className = 'ambience-toggle';
      function paint() {
        btn.textContent = muted ? '🔇' : '🔊';
        btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
        btn.setAttribute('aria-label', muted ? 'Ambient sound is off: turn it on' : 'Ambient sound is on: turn it off');
        btn.title = muted ? 'Ambient sound: off' : 'Ambient sound: on';
      }
      function setMuted(m) {
        muted = !!m;
        try { localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false'); } catch (e) {}
        if (ctx) {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
          master.gain.linearRampToValueAtTime(muted ? 0 : MASTER, ctx.currentTime + 0.4);
        }
        paint();
      }
      btn.addEventListener('click', function () { setMuted(!muted); });
      paint();
      document.body.appendChild(btn);

      return {
        beds: BEDS,
        setMuted: setMuted,
        state: function () {
          return { bed: current ? BEDS[current].name : null, muted: muted, running: !!(ctx && ctx.state === 'running') };
        }
      };
    })();
