    // Ambient sound per station (docs/IDEAS_BACKLOG.md #4). While a station's game is on screen, a quiet bed of
    // synthesized sound plays under it (Web Audio, no files): wind on the Erg, water at the Four Wells, fire in
    // Tower II, the hum of the Oracle's chamber… It fades in when the game opens and out when it closes.
    // Each bed also carries a little music, composed while it plays: a plucked string and a reed flute walking a
    // desert mode over the bed's drone, with a frame drum when the place calls for one. The games add their own
    // moments on top through the same sound: stingers (a reveal, a victory, a fall) and effects (stone grinding,
    // bells, footsteps). Everything is synthesized here, offline and 0 MB.
    // On by default, low; the speaker button (always on screen) mutes it all, and the choice is remembered
    // (order_ambience_muted). Browsers only allow sound after a touch or a key, so the first one wakes it.
    window.EclipseAmbience = (function () {
      'use strict';
      var MUTE_KEY = 'order_ambience_muted';
      var MASTER = 0.16, FADE_S = 1.5, POLL_MS = 600, AHEAD_S = 0.35;

      // The modes the music walks (semitones above the root)
      var MODES = {
        hijaz: [0, 1, 4, 5, 7, 8, 10],
        kurd: [0, 1, 3, 5, 7, 8, 10],
        nahawand: [0, 2, 3, 5, 7, 8, 11],
        dorian: [0, 2, 3, 5, 7, 9, 10],
        minorPent: [0, 3, 5, 7, 10],
        majorPent: [0, 2, 4, 7, 9],
        lydian: [0, 2, 4, 6, 7, 9, 11]
      };
      // The frame drum, one bar of eighths: D a deep stroke, T a dry rim, . silence
      var DRUMS = { maqsum: 'DT.TD.T.', baladi: 'DD.TD.T.', walk: 'D...T...', slow: 'D.......', none: '' };
      // Music: root Hz, mode, tempo (bpm), drum, how often the string plays (0–1), how often the flute sings (0–1), level
      var MUSIC = {
        dawn: { root: 146.83, mode: 'majorPent', bpm: 66, drum: 'none', pluck: 0.32, ney: 0.35, level: 0.5 },
        canyon: { root: 220, mode: 'kurd', bpm: 56, drum: 'slow', pluck: 0.22, ney: 0.5, level: 0.5 },
        salt: { root: 164.81, mode: 'nahawand', bpm: 68, drum: 'walk', pluck: 0.38, ney: 0.25, level: 0.45 },
        camp: { root: 220, mode: 'dorian', bpm: 84, drum: 'baladi', pluck: 0.5, ney: 0.2, level: 0.5 },
        wells: { root: 196, mode: 'majorPent', bpm: 62, drum: 'none', pluck: 0.3, ney: 0.45, level: 0.45 },
        night: { root: 196, mode: 'minorPent', bpm: 52, drum: 'slow', pluck: 0.18, ney: 0.55, level: 0.45 },
        ridge: { root: 146.83, mode: 'hijaz', bpm: 76, drum: 'maqsum', pluck: 0.46, ney: 0.3, level: 0.5 },
        gates: { root: 130.81, mode: 'hijaz', bpm: 58, drum: 'slow', pluck: 0.26, ney: 0.45, level: 0.5 },
        labyrinth: { root: 164.81, mode: 'kurd', bpm: 70, drum: 'walk', pluck: 0.34, ney: 0.3, level: 0.45 },
        sanctum: { root: 196, mode: 'lydian', bpm: 54, drum: 'none', pluck: 0.2, ney: 0.5, level: 0.42 },
        stage: { root: 174.61, mode: 'nahawand', bpm: 60, drum: 'none', pluck: 0.28, ney: 0.4, level: 0.4 }
      };

      // Which bed goes with which game. Parts: wind [level, centre Hz, Q, sway/s, echo?], drone [level, Hz…],
      // drips [level, per second], crackle [level, per second], rumble [level, cutoff Hz], music (a MUSIC key)
      var BEDS = {
        'modal-cairn-one': { name: 'dry wash at dawn', wind: [0.5, 520, 0.7, 0.07], music: 'dawn' },
        'modal-whispering-chasm': { name: 'canyon', wind: [0.55, 340, 1.0, 0.05, true], drone: [0.14, 55, 82.4], music: 'canyon' },
        'modal-salt-playa': { name: 'salt flat', wind: [0.4, 1800, 0.6, 0.1], crackle: [0.12, 0.5], music: 'salt' },
        'modal-desert-lexicon': { name: 'nomad camp', wind: [0.4, 700, 0.8, 0.06], drone: [0.08, 110, 165], music: 'camp' },
        'modal-oasis-clepsydra': { name: 'four wells', wind: [0.15, 420, 0.8, 0.05], drips: [0.32, 1.2], rumble: [0.1, 800], music: 'wells' },
        'modal-oasis-visions': { name: 'four wells', wind: [0.15, 420, 0.8, 0.05], drips: [0.32, 1.2], rumble: [0.1, 800], music: 'wells' },
        'modal-gates-tower-ii': { name: 'gates of tower ii', wind: [0.32, 480, 0.8, 0.05], drone: [0.08, 65.41, 98], crackle: [0.1, 1.4], music: 'gates' },
        'modal-night-erg': { name: 'night on the erg', wind: [0.3, 380, 0.7, 0.05], drone: [0.06, 98, 147], music: 'night' },
        'modal-stones-dream': { name: 'a dream of 1998', wind: [0.22, 520, 0.6, 0.04], drone: [0.07, 73.4, 110, 146.8], crackle: [0.05, 0.7], music: 'dawn' },
        'modal-bridge-spyglass': { name: 'dawn on the natural bridge', wind: [0.55, 360, 1.1, 0.07, true], drone: [0.05, 55, 82.4], music: 'canyon' },
        'modal-sun-monolith': { name: 'noon on the ridge', wind: [0.45, 900, 0.5, 0.04], drone: [0.1, 73.4, 110], music: 'ridge' },
        'modal-sandstone-labyrinth': { name: 'labyrinth', wind: [0.35, 450, 1.2, 0.05, true], crackle: [0.1, 0.8], music: 'labyrinth' },
        'modal-cairn-four': { name: 'singing canyon', wind: [0.4, 300, 1.5, 0.08, true], music: 'canyon' },
        'modal-solstice-arch': { name: 'courtyard of rays', wind: [0.3, 1200, 0.6, 0.05], drone: [0.07, 130.8, 196, 261.6], music: 'sanctum' },
        'modal-polybius-stele': { name: 'tower in flames', rumble: [0.35, 300], crackle: [0.28, 3] },
        'modal-oracle-horizon': { name: 'inner chamber', wind: [0.12, 600, 0.8, 0.04], drone: [0.13, 98, 147, 196], music: 'sanctum' },
        'modal-masks-gate': { name: 'theatre gate', wind: [0.1, 500, 0.9, 0.03], drone: [0.11, 65.4, 98], crackle: [0.07, 0.5], music: 'stage' },
        'modal-camera-obscura': { name: 'dark room', wind: [0.05, 380, 1.1, 0.02], drone: [0.1, 55, 82.4], drips: [0.14, 0.35] },
        'modal-whispering-gallery': { name: 'stone gallery', wind: [0.04, 700, 0.9, 0.02], drone: [0.05, 73.4, 110], drips: [0.08, 0.2], music: 'stage' }
      };

      var ctx = null, master = null, noise = null, verb = null, fxBus = null, current = null, bed = null;
      var muted = false, intensity = 0.5, notes = 0, hushed = false;
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
        // one small hall for the music and the effects: two seconds of falling noise, a little different per ear
        try {
          var len = Math.floor(ctx.sampleRate * 2.2), ir = ctx.createBuffer(2, len, ctx.sampleRate);
          for (var ch = 0; ch < 2; ch++) {
            var data = ir.getChannelData(ch);
            for (var j = 0; j < len; j++) data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / len, 3.2);
          }
          verb = ctx.createConvolver();
          verb.buffer = ir;
          var wet = ctx.createGain();
          wet.gain.value = 0.5;
          verb.connect(wet); wet.connect(master);
        } catch (e) { verb = null; }
        // the games' moments: louder than the bed, under the same mute
        fxBus = ctx.createGain();
        fxBus.gain.value = 2.6;
        fxBus.connect(master);
        if (verb) { var send = ctx.createGain(); send.gain.value = 0.35; fxBus.connect(send); send.connect(verb); }
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
      // a gain that rises in `a` seconds to `v` and falls away in `d`
      function env(t, v, a, d) {
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + Math.max(0.003, a));
        g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
        return g;
      }

      // ---- The instruments ----
      // a plucked string (an oud, more or less): bright at the pluck, then the felt closes over it
      function pluck(out, f, t, v) {
        var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), dur = 1.1 + 160 / f;
        o1.type = 'sawtooth'; o2.type = 'triangle';
        o1.frequency.setValueAtTime(f * 1.006, t); o1.frequency.exponentialRampToValueAtTime(f, t + 0.05);
        o2.frequency.value = f * 2; o2.detune.value = 5;
        lp.type = 'lowpass'; lp.Q.value = 2.2;
        lp.frequency.setValueAtTime(Math.min(9000, f * 9), t);
        lp.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.45);
        var g = env(t, v, 0.004, dur), g2 = ctx.createGain();
        g2.gain.value = 0.3;
        o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(out);
        o1.start(t); o2.start(t); o1.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
      }
      // a reed flute (a ney): breath first, then the note, and a slow vibrato once it settles
      function ney(out, f, t, len, v) {
        var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), vib = ctx.createOscillator(), vg = ctx.createGain();
        o.type = 'sine'; o2.type = 'triangle';
        o.frequency.value = f; o2.frequency.value = f;
        vib.frequency.value = 5.1; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.009, t + Math.min(len, 0.6));
        vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + 0.22);
        g.gain.setValueAtTime(v, t + Math.max(0.25, len - 0.1));
        g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.55);
        var g2 = ctx.createGain(); g2.gain.value = 0.18;
        o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
        var b = noiseSource(), bp = ctx.createBiquadFilter(), bg = env(t, v * 0.5, 0.12, Math.max(0.3, len * 0.7));
        bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 1.4;
        b.connect(bp); bp.connect(bg); bg.connect(out);
        [o, o2, vib].forEach(function (n) { n.start(t); n.stop(t + len + 0.7); });
        b.start(t); b.stop(t + len + 0.7);
      }
      // the frame drum: a deep stroke in the middle of the skin, a dry one on the rim
      function drum(out, kind, t, v) {
        if (kind === 'D') {
          var o = ctx.createOscillator(), g = env(t, v, 0.004, 0.42);
          o.frequency.setValueAtTime(118, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.16);
          o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.5);
          var n = noiseSource(), lp = ctx.createBiquadFilter(), ng = env(t, v * 0.5, 0.002, 0.07);
          lp.type = 'lowpass'; lp.frequency.value = 260;
          n.connect(lp); lp.connect(ng); ng.connect(out); n.start(t); n.stop(t + 0.12);
        } else {
          var s = noiseSource(), hp = ctx.createBiquadFilter(), sg = env(t, v * 0.55, 0.002, 0.06);
          hp.type = 'bandpass'; hp.frequency.value = 2300; hp.Q.value = 1.1;
          s.connect(hp); hp.connect(sg); sg.connect(out); s.start(t); s.stop(t + 0.1);
        }
      }

      // ---- The music: a few bars at a time, written just ahead of the clock ----
      function composer(def, out) {
        var mode = MODES[def.mode] || MODES.hijaz, n = mode.length, eighth = 30 / def.bpm;
        var bar = DRUMS[def.drum] || '', step = 0, next = ctx.currentTime + 0.6;
        var deg = n, phrase = 0, rest = 4, voice = 'pluck', held = 0;
        var mix = ctx.createGain(); mix.gain.value = def.level;
        mix.connect(out);
        if (verb) { var send = ctx.createGain(); send.gain.value = 0.55; mix.connect(send); send.connect(verb); }
        function hz(d) { var o = Math.floor(d / n), k = ((d % n) + n) % n; return def.root * Math.pow(2, o + mode[k] / 12); }
        function walk() {
          var r = Math.random(), mv = r < 0.62 ? (Math.random() < 0.5 ? -1 : 1) : r < 0.82 ? (Math.random() < 0.5 ? -2 : 2) : r < 0.9 ? 3 * (Math.random() < 0.5 ? -1 : 1) : 0;
          if (deg > 2 * n) mv = -Math.abs(mv) || -1;
          if (deg < 0) mv = Math.abs(mv) || 1;
          deg += mv;
        }
        function play(t) {
          var strong = step % 4 === 0, half = step % 2 === 0;
          if (bar && !muted) {
            var hit = bar.charAt(step % bar.length);
            if (hit !== '.' && (hit === 'D' || Math.random() < 0.55 + 0.45 * intensity)) { drum(mix, hit, t, hit === 'D' ? 0.42 : 0.24); notes++; }
          }
          if (held > 0) { held--; return; }
          if (rest > 0) { rest--; if (rest === 0) { phrase = 5 + Math.floor(Math.random() * 7); voice = Math.random() < def.ney ? 'ney' : 'pluck'; } return; }
          if (voice === 'ney') {
            if (!half) return;
            var len = (Math.random() < 0.5 ? 2 : 4) * eighth * (strong ? 2 : 1);
            if (!muted) { ney(mix, hz(deg), t, len, 0.11); notes++; }
            held = Math.round(len / eighth) - 1;
          } else {
            var p = def.pluck * (strong ? 1.6 : half ? 1 : 0.5) * (0.7 + 0.6 * intensity);
            if (Math.random() > p) return;
            if (!muted) { pluck(mix, hz(deg), t, strong ? 0.16 : 0.11); notes++; }
            // an ornament now and then: a quick neighbour before the note
            if (!muted && Math.random() < 0.12) pluck(mix, hz(deg + 1), t - eighth * 0.25, 0.06);
          }
          phrase--;
          if (phrase <= 0) {
            // phrases come home: to the root or the fifth, then a breath
            deg = Math.random() < 0.6 ? n : (n + Math.min(4, n - 3));
            rest = 4 + Math.floor(Math.random() * 10);
          } else walk();
        }
        return {
          mix: mix,
          level: def.level,
          tick: function () {
            if (!ctx || ctx.state !== 'running') { next = ctx ? ctx.currentTime + 0.1 : next; return; }
            if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
            while (next < ctx.currentTime + AHEAD_S) {
              var swing = step % 2 ? eighth * 0.06 : 0;
              play(next + swing);
              next += eighth; step = (step + 1) % 64;
            }
          }
        };
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
        var song = def.music && MUSIC[def.music] ? composer(MUSIC[def.music], out) : null;
        if (song) { if (hushed) song.mix.gain.value = 0.0001; song.tick(); timers.push(setInterval(song.tick, 100)); }
        return { out: out, stops: stops, timers: timers, song: song, mood: def.music || null };
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

      // ---- The games' moments ----
      function bell(t, f, v, len) {
        [[1, 1], [2.76, 0.45], [5.4, 0.22], [8.93, 0.1]].forEach(function (p) {
          var o = ctx.createOscillator(), g = env(t, v * p[1], 0.003, len / p[0] * 1.4);
          o.frequency.value = f * p[0]; o.connect(g); g.connect(fxBus); o.start(t); o.stop(t + len * 1.5);
        });
      }
      function grind(t, len, v) {
        var n = noiseSource(), lp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), g = ctx.createGain(), am = ctx.createGain();
        lp.type = 'lowpass'; lp.frequency.value = 420; bp.type = 'bandpass'; bp.frequency.value = 160; bp.Q.value = 0.8;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.25);
        g.gain.setValueAtTime(v, t + Math.max(0.3, len - 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        am.gain.value = 0.6;
        var wob = ctx.createOscillator(), wg = ctx.createGain(); wob.type = 'square'; wob.frequency.value = 9 + Math.random() * 5; wg.gain.value = 0.4;
        wob.connect(wg); wg.connect(am.gain);
        n.connect(lp); lp.connect(am); n.connect(bp); bp.connect(am); am.connect(g); g.connect(fxBus);
        n.start(t); n.stop(t + len + 0.1); wob.start(t); wob.stop(t + len + 0.1);
      }
      function swish(t, len, v, f0, f1) {
        var n = noiseSource(), bp = ctx.createBiquadFilter(), g = env(t, v, len * 0.4, len * 0.6);
        bp.type = 'bandpass'; bp.Q.value = 0.9;
        bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + len * 0.45); bp.frequency.exponentialRampToValueAtTime(f0, t + len);
        n.connect(bp); bp.connect(g); g.connect(fxBus); n.start(t); n.stop(t + len + 0.05);
      }
      function scaleOf() {
        var m = bed && bed.mood ? MUSIC[bed.mood] : MUSIC.ridge;
        var mode = MODES[m.mode] || MODES.hijaz;
        return function (d) { var n = mode.length, o = Math.floor(d / n), k = ((d % n) + n) % n; return m.root * Math.pow(2, o + mode[k] / 12); };
      }
      var SFX = {
        // stone sliding on stone; o.dur seconds
        stone: function (t, o) { grind(t, o.dur || 2.4, 0.22); },
        // a heavy block set down
        thud: function (t) {
          var o = ctx.createOscillator(), g = env(t, 0.5, 0.004, 0.5);
          o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.3);
          o.connect(g); g.connect(fxBus); o.start(t); o.stop(t + 0.6);
          swish(t, 0.35, 0.12, 300, 700);
        },
        bell: function (t, o) { bell(t, o.f || 880, o.v || 0.12, o.len || 2.4); },
        // a mark waking: a run of little bells up the mode
        shimmer: function (t, o) { var hz = scaleOf(), base = o.deg || 14; for (var i = 0; i < 5; i++) bell(t + i * 0.07, hz(base + i), 0.05, 1.4); },
        whoosh: function (t, o) { swish(t, o.dur || 0.9, 0.16, 280, 1900); },
        step: function (t) { swish(t, 0.12, 0.05, 500, 900); },
        click: function (t) { bell(t, 2400, 0.025, 0.15); },
        // the heart that goes: two low knocks, the second weaker
        heart: function (t) { [0, 0.24].forEach(function (d, i) { var o = ctx.createOscillator(), g = env(t + d, i ? 0.32 : 0.48, 0.004, 0.22); o.frequency.setValueAtTime(64, t + d); o.frequency.exponentialRampToValueAtTime(40, t + d + 0.2); o.connect(g); g.connect(fxBus); o.start(t + d); o.stop(t + d + 0.3); }); },
        // the sun sets on a lost day: a falling minor second and a long low bell
        dusk: function (t) { var hz = scaleOf(); bell(t, hz(7), 0.1, 2.6); bell(t + 0.45, hz(6), 0.09, 3.2); bell(t + 0.9, hz(0), 0.08, 4.0); },
        // something is revealed: up the mode, then the octave
        reveal: function (t) { var hz = scaleOf(); [0, 2, 4, 7].forEach(function (d, i) { bell(t + i * 0.16, hz(7 + d), 0.08, 2.2); }); },
        // the victory: a cadence and a bloom of bells
        win: function (t) {
          var hz = scaleOf();
          [4, 3, 1, 0].forEach(function (d, i) { bell(t + i * 0.22, hz(7 + d), 0.1, 2.0); });
          [0, 2, 4, 7].forEach(function (d) { bell(t + 0.95, hz(7 + d), 0.07, 4.2); });
          swish(t + 0.9, 1.6, 0.06, 900, 4200);
        },
        // a dry crust snapping (salt, old wood, a seal broken); o.v loudness
        crack: function (t, o) {
          var v = o.v || 0.3;
          [0, 0.03, 0.07].forEach(function (d, i) {
            var n = noiseSource(), hp = ctx.createBiquadFilter(), g = env(t + d, v * (1 - i * 0.3), 0.001, 0.05 + i * 0.03);
            hp.type = 'highpass'; hp.frequency.value = 1800 - i * 500;
            n.connect(hp); hp.connect(g); g.connect(fxBus); n.start(t + d); n.stop(t + d + 0.2);
          });
          swish(t, 0.25, v * 0.25, 260, 520);
        },
        // a crust or a beam taking weight: a low wavering creak
        groan: function (t, o) {
          var len = o.dur || 1.4, n = noiseSource(), bp = ctx.createBiquadFilter(), g = env(t, 0.2, len * 0.35, len * 0.65);
          bp.type = 'bandpass'; bp.Q.value = 9; bp.frequency.setValueAtTime(140, t);
          bp.frequency.linearRampToValueAtTime(95, t + len * 0.5); bp.frequency.linearRampToValueAtTime(120, t + len);
          var wob = ctx.createOscillator(), wg = ctx.createGain(); wob.frequency.value = 6; wg.gain.value = 18; wob.connect(wg); wg.connect(bp.frequency);
          n.connect(bp); bp.connect(g); g.connect(fxBus); n.start(t); n.stop(t + len + 0.1); wob.start(t); wob.stop(t + len + 0.1);
        },
        // water poured or running; o.dur seconds
        water: function (t, o) {
          var len = o.dur || 1.6;
          swish(t, len, 0.09, 700, 2600);
          for (var i = 0; i < Math.round(len * 9); i++) {
            var d = t + Math.random() * len, f = 500 + Math.random() * 900, b = ctx.createOscillator(), g = env(d, 0.025, 0.002, 0.06);
            b.frequency.setValueAtTime(f, d); b.frequency.exponentialRampToValueAtTime(f * 1.8, d + 0.05);
            b.connect(g); g.connect(fxBus); b.start(d); b.stop(d + 0.1);
          }
        },
        // one drop into still water
        drop: function (t, o) {
          var f = o.f || 1100, b = ctx.createOscillator(), g = env(t, o.v || 0.07, 0.002, 0.18);
          b.frequency.setValueAtTime(f * 0.6, t); b.frequency.exponentialRampToValueAtTime(f, t + 0.06);
          b.connect(g); g.connect(fxBus); b.start(t); b.stop(t + 0.3);
        },
        // not that one: two soft low notes a half step apart, never harsh
        wrong: function (t) {
          var hz = scaleOf();
          [0, 0.16].forEach(function (d, i) {
            var o = ctx.createOscillator(), g = env(t + d, 0.09, 0.01, 0.35); o.type = 'triangle';
            o.frequency.value = hz(i ? -1 : 0) / 2; o.connect(g); g.connect(fxBus); o.start(t + d); o.stop(t + d + 0.5);
          });
        },
        // a dial or a ring turned one notch: a small wooden tick
        tick: function (t, o) {
          var n = noiseSource(), bp = ctx.createBiquadFilter(), g = env(t, o.v || 0.09, 0.001, 0.035);
          bp.type = 'bandpass'; bp.frequency.value = o.f || 2200; bp.Q.value = 4;
          n.connect(bp); bp.connect(g); g.connect(fxBus); n.start(t); n.stop(t + 0.08);
        },
        // fire catching or flaring
        flame: function (t, o) {
          var len = o.dur || 1.2, n = noiseSource(), lp = ctx.createBiquadFilter(), g = env(t, 0.22, len * 0.3, len * 0.7);
          lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(1400, t + len * 0.3); lp.frequency.exponentialRampToValueAtTime(400, t + len);
          n.connect(lp); lp.connect(g); g.connect(fxBus); n.start(t); n.stop(t + len + 0.1);
          for (var i = 0; i < 6; i++) { var d = t + Math.random() * len, c = noiseSource(), hp = ctx.createBiquadFilter(), cg = env(d, 0.06, 0.001, 0.03); hp.type = 'highpass'; hp.frequency.value = 2500; c.connect(hp); hp.connect(cg); cg.connect(fxBus); c.start(d); c.stop(d + 0.06); }
        },
        // a note sung into the canyon and its echoes coming back; o.deg a degree of the mode, o.n echoes
        echo: function (t, o) {
          var hz = scaleOf(), f = o.f || hz(o.deg == null ? 7 : o.deg), n = o.n || 3;
          for (var i = 0; i <= n; i++) bell(t + i * 0.42, f, (o.v || 0.07) * Math.pow(0.5, i), 1.6);
        },
        // a page turned, a scrap of cloth or paper
        paper: function (t) { swish(t, 0.28, 0.06, 1500, 5200); swish(t + 0.12, 0.2, 0.04, 2400, 6000); },
        // a lens or a shutter: a soft click and the slide of brass
        lens: function (t) { SFX.tick(t, { f: 3200, v: 0.08 }); swish(t + 0.03, 0.35, 0.05, 900, 2200); SFX.tick(t + 0.36, { f: 1800, v: 0.06 }); }
      };
      function sfx(kind, o) {
        if (muted || !SFX[kind] || !audio()) return false;
        if (ctx.state !== 'running') { if (!document.hidden) ctx.resume().catch(function () {}); return false; }
        try { SFX[kind](ctx.currentTime + 0.02, o || {}); notes++; } catch (e) { return false; }
        return true;
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
        // back to neutral only when the game closes: a game that set its level as it opened keeps it
        if (!id) { intensity = 0.5; hushed = false; }
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
        btn.setAttribute('aria-label', muted ? 'Sound and music are off: turn them on' : 'Sound and music are on: turn them off');
        btn.title = muted ? 'Sound and music: off' : 'Sound and music: on';
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
        sfx: sfx,
        // how much is happening in the game (0 calm … 1 the last steps): the drum and the string answer it
        intensity: function (k) { intensity = Math.max(0, Math.min(1, +k || 0)); },
        // the music steps out (the wind and the room stay) while a game needs every ear, and comes back after
        hush: function (on) {
          on = !!on;
          if (on === hushed) return;
          hushed = on;
          if (!ctx || !bed || !bed.song) return;
          var g = bed.song.mix.gain, t = ctx.currentTime;
          g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t);
          g.linearRampToValueAtTime(on ? 0.0001 : bed.song.level, t + (on ? 0.6 : 2.5));
        },
        state: function () {
          return { bed: current ? BEDS[current].name : null, muted: muted, running: !!(ctx && ctx.state === 'running'), music: bed && bed.mood || null, notes: notes, intensity: intensity, hushed: hushed };
        }
      };
    })();
