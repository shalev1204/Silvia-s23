// Structured soundtrack composer and hybrid external-track player for Silvia's 23.
// Works offline and under file:// with Web Audio synthesis out of the box, and lets
// the Operator drop in real .mp3/.ogg loops via registerTrack() or ECLIPSE_MUSIC_FILES
// without touching any station or Hub code.
window.EclipseMusicComposer = (function () {
  'use strict';

  // Register real orchestral/chamber tracks here when ready, e.g.:
  //   hubMondstadt: './assets/audio/music/hub-constellation.mp3',
  //   hubLiyue: './assets/audio/music/hub-desert.mp3',
  //   hubFontaine: './assets/audio/music/hub-stage.mp3',
  //   desertAdventure: './assets/audio/music/desert-adventure.mp3'
  // Or per-station overrides: desertAdventureArch, desertAdventureFire, desertAdventureOracle.
  // Never add uncreated URLs by default so offline/smoke runs never log 404 errors.
  var EXTERNAL_TRACKS = {};
  var bufferCache = {};

  function externalUrl(key) {
    var overrides = window.ECLIPSE_MUSIC_FILES;
    if (overrides && typeof overrides[key] === 'string' && overrides[key]) return overrides[key];
    return EXTERNAL_TRACKS[key] || '';
  }

  function registerTrack(key, url) {
    if (!key || typeof url !== 'string') return;
    EXTERNAL_TRACKS[key] = url;
    delete bufferCache[key + ':' + url];
  }

  // Convert MIDI note number to Hz (A4 = 69 = 440 Hz)
  function mtof(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function makeEnv(ctx, t, peak, a, d, sLevel, r, dur) {
    var g = ctx.createGain();
    var atk = Math.max(0.003, a);
    var dec = Math.max(0.01, d);
    var hold = Math.max(atk + dec + 0.01, dur || (atk + dec + 0.05));
    var rel = Math.max(0.02, r);
    var floor = 0.0001;
    g.gain.setValueAtTime(floor, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + atk);
    g.gain.exponentialRampToValueAtTime(Math.max(floor, peak * (sLevel || 0.001)), t + atk + dec);
    if (hold > atk + dec) g.gain.setValueAtTime(Math.max(floor, peak * (sLevel || 0.001)), t + hold);
    g.gain.exponentialRampToValueAtTime(floor, t + hold + rel);
    return { node: g, stopAt: t + hold + rel + 0.08 };
  }

  function routePan(ctx, node, out, pan) {
    if (pan && typeof ctx.createStereoPanner === 'function') {
      var p = ctx.createStereoPanner();
      p.pan.value = Math.max(-0.85, Math.min(0.85, pan));
      node.connect(p);
      p.connect(out);
    } else {
      node.connect(out);
    }
  }

  function addNoiseBurst(ctx, noise, out, t, len, v, bpFreq, q, pan) {
    if (!noise || !v) return;
    var s = ctx.createBufferSource();
    s.buffer = noise;
    s.loop = true;
    s.loopStart = Math.random() * 1.2;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = bpFreq;
    bp.Q.value = q || 1.2;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + Math.min(0.03, len * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(bp);
    bp.connect(g);
    routePan(ctx, g, out, pan);
    s.start(t);
    s.stop(t + len + 0.05);
  }

  // ---- Rich multi-voice instrument synthesis bank ----
  var INST = {
    // MONDSTADT: Bright pastoral harp / lute arpeggio
    harp: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var tail = Math.max(0.7, dur || 0.9) + 180 / f;
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter();
      o1.type = 'triangle';
      o2.type = 'sine';
      o1.frequency.setValueAtTime(f * 1.004, t);
      o1.frequency.exponentialRampToValueAtTime(f, t + 0.035);
      o2.frequency.value = f * 2;
      lp.type = 'lowpass';
      lp.Q.value = 1.4;
      lp.frequency.setValueAtTime(Math.min(7200, f * 7.5), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 1.7), t + 0.55);
      var env = makeEnv(ctx, t, v, 0.005, tail * 0.45, 0.14, tail * 0.55, tail * 0.45);
      var g2 = ctx.createGain();
      g2.gain.value = 0.28;
      o1.connect(lp);
      o2.connect(g2);
      g2.connect(lp);
      lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : -0.18);
      o1.start(t); o2.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt);
    },

    // MONDSTADT: Warm chamber transverse flute
    flute: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var vib = ctx.createOscillator(), vg = ctx.createGain();
      o1.type = 'sine';
      o2.type = 'triangle';
      if (opts && opts.slideFrom) {
        o1.frequency.setValueAtTime(mtof(opts.slideFrom), t);
        o1.frequency.exponentialRampToValueAtTime(f, t + 0.08);
        o2.frequency.setValueAtTime(mtof(opts.slideFrom), t);
        o2.frequency.exponentialRampToValueAtTime(f, t + 0.08);
      } else {
        o1.frequency.value = f;
        o2.frequency.value = f;
      }
      vib.frequency.value = 5.2;
      vg.gain.setValueAtTime(0, t);
      vg.gain.linearRampToValueAtTime(f * 0.007, t + Math.min(dur * 0.65, 0.35));
      vib.connect(vg);
      vg.connect(o1.frequency);
      vg.connect(o2.frequency);
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.min(5400, f * 4.5);
      var g2 = ctx.createGain();
      g2.gain.value = 0.16;
      var env = makeEnv(ctx, t, v, 0.08, Math.max(0.08, dur * 0.25), 0.78, 0.26, dur);
      o1.connect(lp);
      o2.connect(g2);
      g2.connect(lp);
      lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.12);
      if (opts && opts.noise) addNoiseBurst(ctx, opts.noise, out, t, Math.min(0.18, dur * 0.4), v * 0.16, f * 2.1, 1.8, 0.12);
      o1.start(t); o2.start(t); vib.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt); vib.stop(env.stopAt);
    },

    // Lush soft chamber string pad (3 detuned oscillators filtered smoothly)
    strings: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 0.7;
      lp.frequency.value = Math.min(3000, f * 3.6);
      var env = makeEnv(ctx, t, v, Math.min(0.45, dur * 0.32), 0.25, 0.8, 0.65, dur);
      lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0);
      [-7, 0, 7].forEach(function (det, idx) {
        var o = ctx.createOscillator();
        o.type = idx === 1 ? 'triangle' : 'sawtooth';
        o.frequency.value = f;
        o.detune.value = det;
        var sg = ctx.createGain();
        sg.gain.value = idx === 1 ? 0.45 : 0.24;
        o.connect(sg);
        sg.connect(lp);
        o.start(t);
        o.stop(env.stopAt);
      });
    },

    // Crystalline celesta bell sparkles
    celesta: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      [[1, 1], [2, 0.28], [4.02, 0.08]].forEach(function (pair, i) {
        var o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * pair[0];
        var d = Math.max(0.35, dur || 0.75) / (1 + i * 0.7);
        var env = makeEnv(ctx, t, v * pair[1], 0.004, d * 0.45, 0.06, d * 0.55, d * 0.45);
        o.connect(env.node);
        routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.24);
        o.start(t);
        o.stop(env.stopAt);
      });
    },

    // Warm plucked cello/lute bass
    bassPluck: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter();
      o.type = 'triangle';
      o2.type = 'sine';
      o.frequency.value = f;
      o2.frequency.value = f * 2;
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(1800, f * 5), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(180, f * 1.4), t + 0.45);
      var env = makeEnv(ctx, t, v, 0.01, 0.35, 0.28, 0.45, Math.max(0.4, dur));
      var g2 = ctx.createGain();
      g2.gain.value = 0.22;
      o.connect(lp); o2.connect(g2); g2.connect(lp);
      lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0);
      o.start(t); o2.start(t);
      o.stop(env.stopAt); o2.stop(env.stopAt);
    },

    // LIYUE: Guzheng silk-string zither (crisp harmonic shimmer + slight bend)
    guzheng: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var tail = Math.max(0.85, dur || 1.1) + 170 / f;
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter();
      o1.type = 'sawtooth';
      o2.type = 'triangle';
      o1.frequency.setValueAtTime(f * 1.012, t);
      o1.frequency.exponentialRampToValueAtTime(f, t + 0.055);
      o2.frequency.setValueAtTime(f * 2.008, t);
      o2.frequency.exponentialRampToValueAtTime(f * 2, t + 0.055);
      lp.type = 'lowpass';
      lp.Q.value = 2.4;
      lp.frequency.setValueAtTime(Math.min(8800, f * 9.5), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(420, f * 1.65), t + 0.5);
      var g2 = ctx.createGain();
      g2.gain.value = 0.32;
      var env = makeEnv(ctx, t, v, 0.003, tail * 0.4, 0.12, tail * 0.6, tail * 0.4);
      o1.connect(lp); o2.connect(g2); g2.connect(lp);
      lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : -0.22);
      o1.start(t); o2.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt);
    },

    // LIYUE: Expressive bamboo dizi (bright singing flute with membrane edge)
    dizi: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var vib = ctx.createOscillator(), vg = ctx.createGain();
      o1.type = 'sine';
      o2.type = 'sawtooth';
      if (opts && opts.slideFrom) {
        o1.frequency.setValueAtTime(mtof(opts.slideFrom), t);
        o1.frequency.exponentialRampToValueAtTime(f, t + 0.07);
        o2.frequency.setValueAtTime(mtof(opts.slideFrom), t);
        o2.frequency.exponentialRampToValueAtTime(f, t + 0.07);
      } else {
        o1.frequency.value = f;
        o2.frequency.value = f;
      }
      vib.frequency.value = 5.6;
      vg.gain.setValueAtTime(0, t);
      vg.gain.linearRampToValueAtTime(f * 0.01, t + Math.min(dur * 0.5, 0.28));
      vib.connect(vg);
      vg.connect(o1.frequency);
      vg.connect(o2.frequency);
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = Math.min(6000, f * 2.2);
      bp.Q.value = 1.1;
      var g2 = ctx.createGain();
      g2.gain.value = 0.22;
      var env = makeEnv(ctx, t, v, 0.045, Math.max(0.06, dur * 0.22), 0.82, 0.24, dur);
      o1.connect(env.node);
      o2.connect(bp); bp.connect(g2); g2.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.14);
      if (opts && opts.noise) addNoiseBurst(ctx, opts.noise, out, t, Math.min(0.16, dur * 0.35), v * 0.22, f * 2.5, 2.2, 0.14);
      o1.start(t); o2.start(t); vib.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt); vib.stop(env.stopAt);
    },

    // LIYUE: Soulful bowed erhu (two-formant vocal wood resonance + expressive slide + vibrato)
    erhu: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var o = ctx.createOscillator();
      o.type = 'sawtooth';
      var startF = opts && opts.slideFrom ? mtof(opts.slideFrom) : f * 0.96;
      o.frequency.setValueAtTime(startF, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.11);
      var vib = ctx.createOscillator(), vg = ctx.createGain();
      vib.frequency.value = 5.5;
      vg.gain.setValueAtTime(0, t);
      vg.gain.linearRampToValueAtTime(f * 0.013, t + Math.min(dur * 0.7, 0.38));
      vib.connect(vg);
      vg.connect(o.frequency);
      var f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
      f1.type = 'bandpass'; f1.frequency.value = 920; f1.Q.value = 2.4;
      f2.type = 'bandpass'; f2.frequency.value = 2250; f2.Q.value = 2.8;
      lp.type = 'lowpass'; lp.frequency.value = 3400;
      var env = makeEnv(ctx, t, v, 0.12, Math.max(0.08, dur * 0.25), 0.85, 0.32, dur);
      var g1 = ctx.createGain(), g2 = ctx.createGain(), g3 = ctx.createGain();
      g1.gain.value = 0.72; g2.gain.value = 0.36; g3.gain.value = 0.32;
      o.connect(f1); f1.connect(g1); g1.connect(env.node);
      o.connect(f2); f2.connect(g2); g2.connect(env.node);
      o.connect(lp); lp.connect(g3); g3.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.06);
      o.start(t); vib.start(t);
      o.stop(env.stopAt); vib.stop(env.stopAt);
    },

    // LIYUE / ORACLE: Warm distant temple bell / bronze chime
    templeBell: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      [[1, 1], [2.4, 0.35], [4.1, 0.14]].forEach(function (pair, i) {
        var o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * pair[0];
        var d = Math.max(1.8, dur || 2.8) / (1 + i * 0.6);
        var env = makeEnv(ctx, t, v * pair[1], 0.008, d * 0.4, 0.05, d * 0.6, d * 0.4);
        o.connect(env.node);
        routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : -0.3);
        o.start(t);
        o.stop(env.stopAt);
      });
    },

    // FONTAINE: Refined Baroque harpsichord (crisp double-octave pluck)
    harpsichord: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
      o1.type = 'sawtooth';
      o2.type = 'square';
      o1.frequency.value = f;
      o2.frequency.value = f * 2;
      hp.type = 'highpass'; hp.frequency.value = Math.max(120, f * 0.7);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(9200, f * 10), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(900, f * 2.4), t + 0.38);
      var g2 = ctx.createGain();
      g2.gain.value = 0.24;
      var tail = Math.min(1.1, Math.max(0.32, dur || 0.45));
      var env = makeEnv(ctx, t, v, 0.002, tail * 0.45, 0.14, tail * 0.55, tail * 0.45);
      o1.connect(hp); o2.connect(g2); g2.connect(hp);
      hp.connect(lp); lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : -0.2);
      o1.start(t); o2.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt);
    },

    // FONTAINE: Chamber double-reed oboe / musette voice
    reedOboe: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      o1.type = 'sawtooth';
      o2.type = 'triangle';
      o1.frequency.value = f;
      o2.frequency.value = f * 2;
      var vib = ctx.createOscillator(), vg = ctx.createGain();
      vib.frequency.value = 5.4;
      vg.gain.setValueAtTime(0, t);
      vg.gain.linearRampToValueAtTime(f * 0.008, t + Math.min(dur * 0.6, 0.28));
      vib.connect(vg); vg.connect(o1.frequency);
      var bp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1280; bp.Q.value = 1.9;
      lp.type = 'lowpass'; lp.frequency.value = Math.min(4400, f * 5);
      var g2 = ctx.createGain(); g2.gain.value = 0.22;
      var env = makeEnv(ctx, t, v, 0.055, Math.max(0.06, dur * 0.2), 0.78, 0.22, dur);
      o1.connect(bp); bp.connect(lp);
      o2.connect(g2); g2.connect(lp);
      lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.12);
      o1.start(t); o2.start(t); vib.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt); vib.stop(env.stopAt);
    },

    // FONTAINE: Crystalline glass harmonica / mirror chime box
    glassBox: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      [[1, 1], [2.004, 0.25], [3, 0.1]].forEach(function (pair, i) {
        var o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * pair[0];
        var d = Math.max(0.45, dur || 0.7) / (1 + i * 0.5);
        var env = makeEnv(ctx, t, v * pair[1], 0.008, d * 0.35, 0.1, d * 0.65, d * 0.35);
        o.connect(env.node);
        routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.28);
        o.start(t);
        o.stop(env.stopAt);
      });
    },

    // MEDIEVAL ARABIC ADVENTURE: Oud (warm woody Arabic lute with dynamic pluck & body formant)
    oud: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var tail = Math.max(0.65, dur || 0.75) + 150 / f;
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var body = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
      o1.type = 'sawtooth';
      o2.type = 'triangle';
      o1.frequency.setValueAtTime(f * 1.008, t);
      o1.frequency.exponentialRampToValueAtTime(f, t + 0.045);
      o2.frequency.value = f * 2;
      o2.detune.value = 6;
      body.type = 'peaking';
      body.frequency.value = 340;
      body.Q.value = 1.6;
      body.gain.value = 4.5;
      lp.type = 'lowpass';
      lp.Q.value = 2.0;
      lp.frequency.setValueAtTime(Math.min(7600, f * 8), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(380, f * 1.55), t + 0.42);
      var g2 = ctx.createGain(); g2.gain.value = 0.28;
      var env = makeEnv(ctx, t, v, 0.004, tail * 0.4, 0.14, tail * 0.6, tail * 0.4);
      o1.connect(body); o2.connect(g2); g2.connect(body);
      body.connect(lp); lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : -0.18);
      o1.start(t); o2.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt);
    },

    // MEDIEVAL ARABIC ADVENTURE: Qanun (bright trapezoidal zither with shimmering octave doubling)
    qanun: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var tail = Math.max(0.55, dur || 0.7) + 130 / f;
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
      o1.type = 'sawtooth';
      o2.type = 'sawtooth';
      o1.frequency.value = f;
      o2.frequency.value = f * 2;
      o2.detune.value = -4;
      hp.type = 'highpass'; hp.frequency.value = Math.max(140, f * 0.6);
      lp.type = 'lowpass'; lp.Q.value = 2.6;
      lp.frequency.setValueAtTime(Math.min(9800, f * 10), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(600, f * 2.1), t + 0.45);
      var g2 = ctx.createGain(); g2.gain.value = 0.36;
      var env = makeEnv(ctx, t, v, 0.002, tail * 0.38, 0.1, tail * 0.62, tail * 0.38);
      o1.connect(hp); o2.connect(g2); g2.connect(hp);
      hp.connect(lp); lp.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.25);
      o1.start(t); o2.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt);
    },

    // MEDIEVAL ARABIC ADVENTURE: Rabab / Ney heroic desert lead (expressive reed+bowed blend)
    rababNey: function (ctx, out, midi, t, dur, v, opts) {
      var f = mtof(midi);
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      o1.type = 'sawtooth';
      o2.type = 'sine';
      var startF = opts && opts.slideFrom ? mtof(opts.slideFrom) : f * 0.975;
      o1.frequency.setValueAtTime(startF, t);
      o1.frequency.exponentialRampToValueAtTime(f, t + 0.075);
      o2.frequency.setValueAtTime(startF, t);
      o2.frequency.exponentialRampToValueAtTime(f, t + 0.075);
      var vib = ctx.createOscillator(), vg = ctx.createGain();
      vib.frequency.value = 5.4;
      vg.gain.setValueAtTime(0, t);
      vg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(dur * 0.6, 0.3));
      vib.connect(vg); vg.connect(o1.frequency); vg.connect(o2.frequency);
      var bp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = Math.min(2600, Math.max(750, f * 2.1)); bp.Q.value = 1.5;
      lp.type = 'lowpass'; lp.frequency.value = Math.min(4200, f * 4.5);
      var g1 = ctx.createGain(), g2 = ctx.createGain();
      g1.gain.value = 0.58; g2.gain.value = 0.65;
      var env = makeEnv(ctx, t, v, 0.075, Math.max(0.06, dur * 0.22), 0.84, 0.28, dur);
      o1.connect(bp); bp.connect(lp); lp.connect(g1); g1.connect(env.node);
      o2.connect(g2); g2.connect(env.node);
      routePan(ctx, env.node, out, opts && opts.pan != null ? opts.pan : 0.06);
      if (opts && opts.noise) addNoiseBurst(ctx, opts.noise, out, t, Math.min(0.18, dur * 0.35), v * 0.22, f * 2.2, 1.5, 0.06);
      o1.start(t); o2.start(t); vib.start(t);
      o1.stop(env.stopAt); o2.stop(env.stopAt); vib.stop(env.stopAt);
    },

    // Darbuka: D = deep resonant Doum, T = crisp bright Tek, K = soft Ka slap
    darbuka: function (ctx, noise, out, hit, t, v) {
      if (hit === 'D') {
        var o = ctx.createOscillator();
        var g = makeEnv(ctx, t, v, 0.004, 0.16, 0.18, 0.24, 0.18);
        o.type = 'sine';
        o.frequency.setValueAtTime(142, t);
        o.frequency.exponentialRampToValueAtTime(54, t + 0.13);
        o.connect(g.node);
        routePan(ctx, g.node, out, -0.05);
        o.start(t); o.stop(g.stopAt);
        addNoiseBurst(ctx, noise, out, t, 0.06, v * 0.32, 320, 1.0, -0.05);
      } else if (hit === 'T') {
        var hi = ctx.createOscillator();
        var hg = makeEnv(ctx, t, v * 0.42, 0.002, 0.06, 0.05, 0.08, 0.06);
        hi.type = 'triangle';
        hi.frequency.setValueAtTime(420, t);
        hi.frequency.exponentialRampToValueAtTime(210, t + 0.05);
        hi.connect(hg.node);
        routePan(ctx, hg.node, out, 0.15);
        hi.start(t); hi.stop(hg.stopAt);
        addNoiseBurst(ctx, noise, out, t, 0.07, v * 0.65, 2900, 1.4, 0.15);
      } else if (hit === 'K') {
        addNoiseBurst(ctx, noise, out, t, 0.05, v * 0.45, 2100, 1.8, -0.15);
      }
    },

    // Riq: shimmering Arabic brass tambourine jingles (adds adventure drive on higher intensity)
    riq: function (ctx, noise, out, t, v) {
      addNoiseBurst(ctx, noise, out, t, 0.075, v, 6800, 3.2, 0.32);
    }
  };

  // ---- Structured 16-bar thematic scores ----
  // Notice bar chord progressions, distinct section melodies (A/B/C), basslines, and reactive layering.
  // Root & mode metadata are exposed for ambience.js SFX scale harmony.

  // Pattern utilities: chord MIDI helpers
  function buildHubMondstadt() {
    // Key: D Major / Lydian (D3 = 50)
    // Progression (16 bars):
    //   0-3: Dmaj7  | A/C#   | Bm7    | F#m7
    //   4-7: Gmaj7  | D/F#   | Em7    | A7
    //  8-11: Gmaj7  | A6     | F#m7   | Bm7
    // 12-15: Em7    | A7     | Dmaj9  | A6
    var chords = [
      [50, 57, 62, 66, 69], [49, 57, 61, 64, 69], [47, 54, 59, 62, 66], [42, 54, 57, 61, 66],
      [43, 55, 59, 62, 66], [42, 54, 57, 62, 66], [40, 52, 55, 59, 62], [45, 52, 57, 61, 64],
      [43, 55, 59, 62, 66], [45, 54, 57, 61, 64], [42, 54, 57, 61, 64], [47, 54, 59, 62, 66],
      [40, 52, 55, 59, 62], [45, 52, 57, 61, 64], [50, 57, 62, 64, 66], [45, 54, 57, 61, 64]
    ];
    // Pastoral flowing flute melody over 16 bars (8 eighths per bar, null = rest/sustain)
    // Each entry: [noteMidi, durationInSteps] or null
    var mel = {};
    function put(bar, step, midi, steps) { mel[bar * 8 + step] = [midi, steps]; }
    // A1: lyrical pastoral opening
    put(0, 0, 74, 3); put(0, 3, 76, 1); put(0, 4, 78, 4);
    put(1, 0, 76, 3); put(1, 3, 74, 1); put(1, 4, 73, 4);
    put(2, 0, 74, 4); put(2, 4, 71, 2); put(2, 6, 69, 2);
    put(3, 0, 73, 6);
    // A2: rising cadence
    put(4, 0, 71, 2); put(4, 2, 74, 2); put(4, 4, 76, 4);
    put(5, 0, 74, 3); put(5, 3, 73, 1); put(5, 4, 74, 4);
    put(6, 0, 71, 2); put(6, 2, 69, 2); put(6, 4, 67, 4);
    put(7, 0, 69, 6);
    // B: soaring chorus-like lift (flute reaches A5, celesta sparkles accompany)
    put(8, 0, 79, 3); put(8, 3, 78, 1); put(8, 4, 76, 2); put(8, 6, 74, 2);
    put(9, 0, 76, 4); put(9, 4, 73, 2); put(9, 6, 76, 2);
    put(10, 0, 78, 3); put(10, 3, 76, 1); put(10, 4, 74, 2); put(10, 6, 73, 2);
    put(11, 0, 74, 6);
    // C: tender resolution home
    put(12, 0, 71, 2); put(12, 2, 74, 2); put(12, 4, 79, 4);
    put(13, 0, 78, 2); put(13, 2, 76, 2); put(13, 4, 73, 4);
    put(14, 0, 74, 7);

    var arpPattern = [1, 2, 3, 4, 2, 3, 4, 2];
    return {
      root: 146.83, mode: 'lydian', bpm: 84, stepsPerBar: 8, bars: 16, level: 0.44,
      stepFn: function (ctx, out, bar, s, cycle, t, eighth, intensity, noise, onNote) {
        var ch = chords[bar];
        // Bass pluck on downbeat & beat 3 (soft)
        if (s === 0 || s === 4) {
          INST.bassPluck(ctx, out, ch[0] - (s === 0 ? 12 : 0), t, eighth * 3.2, s === 0 ? 0.14 : 0.08, { pan: -0.06 });
          onNote();
        }
        // Soft chamber strings pad every bar (longer warm wash on B/C or cycle >= 1)
        if (s === 0 && (bar >= 4 || cycle > 0)) {
          INST.strings(ctx, out, ch[1], t, eighth * 7.5, bar >= 8 && bar < 12 ? 0.068 : 0.048, { pan: -0.25 });
          INST.strings(ctx, out, ch[2] + 12, t, eighth * 7.5, bar >= 8 && bar < 12 ? 0.056 : 0.038, { pan: 0.25 });
          onNote();
        }
        // Harp broken chord every eighth note (breathes gracefully at bar 15 cadence)
        if (!(bar === 15 && s >= 4)) {
          var idx = arpPattern[s];
          var arpV = (s === 0 ? 0.11 : s === 4 ? 0.095 : 0.072);
          INST.harp(ctx, out, ch[idx], t, eighth * 2.4, arpV, { pan: (s % 2 ? -0.22 : -0.1) });
          onNote();
        } else if (s === 4 || s === 6) {
          INST.harp(ctx, out, ch[s === 4 ? 2 : 3], t, eighth * 2.2, 0.065, { pan: -0.15 });
          onNote();
        }
        // Lead melody: flute on even cycles, alternating with celesta sparkle on C / variations
        var idxFlat = bar * 8 + s;
        var m = mel[idxFlat];
        if (m) {
          var prev = mel[idxFlat - 2] || mel[idxFlat - 3];
          var slide = prev && Math.abs(prev[0] - m[0]) >= 3 ? prev[0] : 0;
          if (bar >= 12 && cycle % 2 === 1) {
            INST.celesta(ctx, out, m[0], t, eighth * m[1], 0.085, { pan: 0.22 });
          } else {
            INST.flute(ctx, out, m[0], t, eighth * m[1], 0.105, { noise: noise, pan: 0.14, slideFrom: slide });
            if (bar >= 8 && bar < 12 && (s === 0 || s === 4)) {
              INST.celesta(ctx, out, m[0] + 12, t + 0.01, eighth * 1.5, 0.042, { pan: 0.3 });
            }
          }
          onNote();
        }
        // Gentle starlight celesta bell at ends of sections
        if ((bar === 7 || bar === 14) && s === 4) {
          INST.celesta(ctx, out, bar === 14 ? 86 : 81, t, eighth * 3, 0.055, { pan: 0.28 });
          onNote();
        }
      }
    };
  }

  function buildHubLiyue() {
    // Key: D Major Pentatonic / B Minor Pentatonic (D E F# A B) — evocative Liyue horizon
    var chords = [
      [50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 55, 62, 66, 69], [45, 57, 62, 64, 69],
      [50, 57, 62, 66, 69], [42, 54, 57, 62, 66], [40, 52, 59, 64, 69], [45, 57, 64, 69, 74],
      [43, 55, 59, 62, 69], [45, 57, 62, 64, 69], [47, 54, 59, 66, 69], [42, 54, 57, 62, 66],
      [43, 55, 59, 62, 66], [45, 57, 62, 64, 69], [50, 57, 62, 66, 74], [50, 57, 62, 69, 74]
    ];
    var mel = {};
    function put(bar, step, midi, steps, slide) { mel[bar * 8 + step] = [midi, steps, slide || 0]; }
    // A1: Luminous Dizi opening — soaring fifths & yearning pentatonic falls
    put(0, 0, 74, 3); put(0, 3, 76, 1); put(0, 4, 78, 4);
    put(1, 0, 74, 2); put(1, 2, 71, 2); put(1, 4, 69, 4);
    put(2, 0, 67, 2); put(2, 2, 69, 2); put(2, 4, 74, 4);
    put(3, 0, 76, 6);
    // A2: Dizi answers over rippling guzheng
    put(4, 0, 81, 3); put(4, 3, 78, 1); put(4, 4, 76, 2); put(4, 6, 74, 2);
    put(5, 0, 78, 4); put(5, 4, 74, 2); put(5, 6, 71, 2);
    put(6, 0, 69, 2); put(6, 2, 71, 2); put(6, 4, 74, 4);
    put(7, 0, 69, 6);
    // B: Soulful Erhu solo (bars 8-11) with characteristic vocal slides
    put(8, 0, 71, 2, 69); put(8, 2, 74, 2); put(8, 4, 76, 4, 74);
    put(9, 0, 78, 3); put(9, 3, 76, 1); put(9, 4, 74, 4);
    put(10, 0, 71, 2); put(10, 2, 74, 2); put(10, 4, 78, 3, 76); put(10, 7, 81, 1);
    put(11, 0, 78, 6);
    // C: Guzheng + Dizi & Erhu farewell cadence
    put(12, 0, 76, 3); put(12, 3, 74, 1); put(12, 4, 71, 4, 74);
    put(13, 0, 69, 2); put(13, 2, 71, 2); put(13, 4, 76, 4);
    put(14, 0, 74, 8, 71);

    var gArp = [1, 2, 3, 4, 3, 2, 3, 4];
    return {
      root: 146.83, mode: 'majorPent', bpm: 74, stepsPerBar: 8, bars: 16, level: 0.44,
      stepFn: function (ctx, out, bar, s, cycle, t, eighth, intensity, noise, onNote) {
        var ch = chords[bar];
        // Mountain open-fifth mist sustain
        if (s === 0 && bar % 2 === 0) {
          INST.strings(ctx, out, ch[0], t, eighth * 14, 0.048, { pan: -0.2 });
          INST.strings(ctx, out, ch[1], t, eighth * 14, 0.042, { pan: 0.2 });
          onNote();
        }
        // Guzheng cascading arpeggio roll at phrases (bars 0, 4, 8, 12, 15) + sparse pluck pattern
        if (s === 0 && (bar % 4 === 0 || bar === 15)) {
          [0, 1, 2, 3, 4].forEach(function (idx, k) {
            INST.guzheng(ctx, out, ch[idx] + (idx === 4 ? 12 : 0), t + k * 0.055, eighth * 3.5, 0.095 - k * 0.008, { pan: -0.24 + k * 0.06 });
          });
          onNote();
        } else if (s === 0 || s === 2 || s === 4 || s === 6 || (bar >= 8 && s % 2 === 1 && Math.random() < 0.65)) {
          var gNote = ch[gArp[s]];
          if (!(bar === 15 && s > 4)) {
            INST.guzheng(ctx, out, gNote, t, eighth * 2.6, s === 0 || s === 4 ? 0.11 : 0.075, { pan: -0.2 });
            onNote();
          }
        }
        // Distant temple bronze bell on bar 0, 8, 14
        if (s === 0 && (bar === 0 || bar === 8 || bar === 14)) {
          INST.templeBell(ctx, out, bar === 8 ? 71 : 74, t, 3.4, 0.05, { pan: -0.35 });
          onNote();
        }
        // Dizi (bars 0-7, 14) & Erhu (bars 8-13, alternating on cycles)
        var m = mel[bar * 8 + s];
        if (m) {
          var useErhu = (bar >= 8 && bar <= 13) || (cycle % 2 === 1 && bar < 4);
          if (useErhu) {
            INST.erhu(ctx, out, m[0], t, eighth * m[1], 0.095, { pan: 0.08, slideFrom: m[2] });
          } else {
            INST.dizi(ctx, out, m[0], t, eighth * m[1], 0.098, { noise: noise, pan: 0.14, slideFrom: m[2] });
          }
          onNote();
        }
      }
    };
  }

  function buildHubFontaine() {
    // Key: G Minor / Bb Major Baroque Chamber Waltz (3/4 meter: 6 eighth-notes per bar, 16 bars = 96 steps)
    // Inspired by Fontaine's elegant clockwork, theater, and mirror salon atmosphere
    var chords = [
      [43, 55, 58, 62], [42, 54, 57, 62], [46, 55, 58, 62], [51, 55, 58, 63],
      [48, 55, 60, 63], [41, 53, 57, 60], [46, 53, 58, 62], [50, 54, 57, 60],
      [51, 55, 58, 63], [46, 53, 58, 62], [48, 55, 60, 63], [50, 54, 57, 62],
      [43, 55, 58, 62], [48, 55, 60, 63], [50, 54, 57, 60], [43, 55, 58, 62]
    ];
    var mel = {};
    function put(bar, step, midi, steps) { mel[bar * 6 + step] = [midi, steps]; }
    // A1: Graceful Baroque 3/4 chamber waltz theme (Oboe)
    put(0, 0, 74, 2); put(0, 2, 79, 2); put(0, 4, 78, 2);
    put(1, 0, 79, 3); put(1, 3, 74, 1); put(1, 4, 75, 2);
    put(2, 0, 74, 2); put(2, 2, 72, 2); put(2, 4, 70, 2);
    put(3, 0, 67, 5);
    // A2: Poignant theatrical climb
    put(4, 0, 72, 2); put(4, 2, 75, 2); put(4, 4, 74, 2);
    put(5, 0, 72, 2); put(5, 2, 70, 2); put(5, 4, 69, 2);
    put(6, 0, 70, 3); put(6, 3, 72, 1); put(6, 4, 74, 2);
    put(7, 0, 78, 5);
    // B: Crystal Mirror Salon (Glass Box + Harpsichord dialogue)
    put(8, 0, 79, 2); put(8, 2, 77, 2); put(8, 4, 75, 2);
    put(9, 0, 74, 3); put(9, 3, 72, 1); put(9, 4, 74, 2);
    put(10, 0, 75, 2); put(10, 2, 74, 2); put(10, 4, 72, 2);
    put(11, 0, 74, 5);
    // C: Final curtain flourish
    put(12, 0, 70, 2); put(12, 2, 74, 2); put(12, 4, 79, 2);
    put(13, 0, 75, 2); put(13, 2, 74, 2); put(13, 4, 72, 2);
    put(14, 0, 70, 2); put(14, 2, 69, 2); put(14, 4, 66, 2);
    put(15, 0, 67, 5);

    return {
      root: 196.00, mode: 'nahawand', bpm: 96, stepsPerBar: 6, bars: 16, level: 0.42,
      stepFn: function (ctx, out, bar, s, cycle, t, eighth, intensity, noise, onNote) {
        var ch = chords[bar];
        // Classical waltz bass (beat 1) + harpsichord chord pulse (beats 2, 3)
        if (s === 0) {
          INST.bassPluck(ctx, out, ch[0] - 12, t, eighth * 3.5, 0.13, { pan: -0.08 });
          INST.harpsichord(ctx, out, ch[1], t, eighth * 1.4, 0.065, { pan: -0.2 });
          if (bar % 2 === 0) INST.strings(ctx, out, ch[0], t, eighth * 10.5, 0.045, { pan: 0.18 });
          onNote();
        } else if (s === 2 || s === 4) {
          INST.harpsichord(ctx, out, ch[2], t, eighth * 1.2, 0.06, { pan: -0.24 });
          INST.harpsichord(ctx, out, ch[3], t + 0.015, eighth * 1.1, 0.055, { pan: -0.14 });
          onNote();
        } else if (bar >= 8 && s % 2 === 1 && !(bar === 15 && s > 2)) {
          // Subtle harpsichord 8th filigree in B/C
          INST.harpsichord(ctx, out, ch[(s % 3) + 1] + 12, t, eighth * 0.9, 0.036, { pan: -0.28 });
          onNote();
        }
        // Melodic voice: Reed Oboe in A/C, Glass Mirror Box in B
        var m = mel[bar * 6 + s];
        if (m) {
          if (bar >= 8 && bar < 12) {
            INST.glassBox(ctx, out, m[0], t, eighth * m[1], 0.095, { pan: 0.24 });
            if (cycle % 2 === 1) INST.reedOboe(ctx, out, m[0] - 12, t, eighth * m[1], 0.045, { pan: -0.05 });
          } else {
            INST.reedOboe(ctx, out, m[0], t, eighth * m[1], 0.082, { pan: 0.1 });
            if (bar >= 12) INST.glassBox(ctx, out, m[0] + 12, t, eighth * m[1], 0.04, { pan: 0.28 });
          }
          onNote();
        }
      }
    };
  }

  // ---- Shared Medieval Arabic Desert Adventure Leitmotif (S13b Return + S17 + S18 + S19) ----
  // Shares one cohesive heroic D Hijaz / G Nahawand score across all four encounters,
  // adapting tempo, percussion pattern, ornament density, and reactive instrumentation per station.
  function buildDesertAdventure(variant) {
    var cfg = {
      gates:  { bpm: 100, drum: 'DT.TD.T.', level: 0.46, style: 'heroic', pulseBoost: 0 },
      arch:   { bpm: 104, drum: 'DT.TD.T.', level: 0.48, style: 'sunlit', pulseBoost: 0.04 },
      fire:   { bpm: 112, drum: 'DD.TD.TK', level: 0.50, style: 'urgent', pulseBoost: 0.12 },
      oracle: { bpm: 92,  drum: 'D..TD.T.', level: 0.46, style: 'mythic', pulseBoost: 0 }
    }[variant] || { bpm: 100, drum: 'DT.TD.T.', level: 0.46, style: 'heroic', pulseBoost: 0 };

    // 16 bars in D Hijaz (D - Eb - F# - G - A - Bb - C - D) with Gm (Nahawand) bridge in B
    var roots = [
      50, 51, 50, 48,   // Bars 0-3: D - Eb - D - C (Andalusian / Hijaz heroic descent)
      55, 50, 51, 50,   // Bars 4-7: Gm - D - Eb - D
      55, 53, 51, 50,   // Bars 8-11: Gm - F - Eb - D (Bridge tension)
      55, 51, 50, 50    // Bars 12-15: Gm - Eb - D - D (Climactic return)
    ];
    // Companion triad tones for qanun / strings
    var chords = [
      [50, 54, 57, 62], [51, 55, 58, 63], [50, 54, 57, 62], [48, 55, 58, 60],
      [55, 58, 62, 67], [50, 54, 57, 62], [51, 55, 58, 63], [50, 54, 57, 62],
      [55, 58, 62, 67], [53, 57, 60, 65], [51, 55, 58, 63], [50, 54, 57, 62],
      [55, 58, 62, 67], [51, 55, 58, 63], [50, 54, 57, 62], [50, 57, 62, 66]
    ];

    // The Shared Heroic Desert Leitmotif (MIDI notes in D Hijaz / G Nahawand)
    // A (0-7): iconic Hijaz call-and-response theme
    // B (8-11): sweeping desert caravan ascent
    // C (12-15): climactic Hijaz descent resolving cleanly to D4
    var mel = {};
    function put(bar, step, midi, steps, slide) { mel[bar * 8 + step] = [midi, steps, slide || 0]; }
    put(0, 0, 62, 2); put(0, 2, 63, 1); put(0, 3, 66, 2); put(0, 5, 67, 1); put(0, 6, 69, 2);
    put(1, 0, 67, 2); put(1, 2, 66, 2); put(1, 4, 63, 2); put(1, 6, 62, 2);
    put(2, 0, 66, 2, 63); put(2, 2, 67, 2); put(2, 4, 69, 4);
    put(3, 0, 67, 2); put(3, 2, 66, 2); put(3, 4, 63, 2); put(3, 6, 62, 2);

    put(4, 0, 69, 2); put(4, 2, 70, 2); put(4, 4, 72, 2); put(4, 6, 70, 2);
    put(5, 0, 69, 2); put(5, 2, 67, 2); put(5, 4, 66, 4);
    put(6, 0, 67, 2); put(6, 2, 66, 1); put(6, 3, 63, 1); put(6, 4, 62, 2); put(6, 6, 63, 2);
    put(7, 0, 62, 6);

    put(8, 0, 67, 2, 62); put(8, 2, 69, 2); put(8, 4, 70, 2); put(8, 6, 74, 2);
    put(9, 0, 72, 2); put(9, 2, 70, 2); put(9, 4, 69, 4);
    put(10, 0, 70, 2); put(10, 2, 69, 2); put(10, 4, 67, 2); put(10, 6, 66, 2);
    put(11, 0, 69, 5, 67);

    put(12, 0, 74, 2, 70); put(12, 2, 72, 1); put(12, 3, 70, 2); put(12, 5, 69, 1); put(12, 6, 67, 2);
    put(13, 0, 69, 2); put(13, 2, 67, 1); put(13, 3, 66, 2); put(13, 5, 63, 3);
    put(14, 0, 66, 2, 63); put(14, 2, 63, 2); put(14, 4, 61, 2); put(14, 6, 63, 2);
    put(15, 0, 62, 6);

    return {
      root: 146.83, mode: 'hijaz', bpm: cfg.bpm, stepsPerBar: 8, bars: 16, level: cfg.level,
      stepFn: function (ctx, out, bar, s, cycle, t, eighth, intensity, noise, onNote) {
        var r = roots[bar];
        var ch = chords[bar];
        var energy = Math.max(0, Math.min(1, intensity + cfg.pulseBoost));

        // 1. Deep desert pedal / bass pulse
        if (s === 0 || (energy >= 0.45 && s === 3) || (cfg.style === 'urgent' && energy >= 0.5 && s === 6)) {
          INST.bassPluck(ctx, out, r - 12, t, eighth * 2.5, s === 0 ? 0.16 : 0.1, { pan: 0 });
          onNote();
        }
        // Lush low harmonic bed in Oracle / high-intensity Bridge
        if (s === 0 && (cfg.style === 'mythic' || bar >= 8 || energy >= 0.5)) {
          INST.strings(ctx, out, r, t, eighth * 7.6, cfg.style === 'mythic' ? 0.065 : 0.048, { pan: -0.15 });
          INST.strings(ctx, out, ch[2], t, eighth * 7.6, cfg.style === 'mythic' ? 0.05 : 0.036, { pan: 0.15 });
          onNote();
        }

        // 2. Driving Arabic Oud ostinato (roots + fifth + b2 tension)
        var oudHit = (s === 0 || s === 3 || s === 4 || s === 6 || (energy >= 0.48 && s % 2 === 1 && bar % 2 === 1));
        if (cfg.style === 'mythic' && energy < 0.36 && s % 2 === 1) oudHit = false;
        if (oudHit) {
          var oudMidi = s === 0 ? r : s === 3 ? r + 7 : s === 6 ? ch[2] : ch[1];
          INST.oud(ctx, out, oudMidi, t, eighth * 1.4, (s === 0 || s === 4 ? 0.13 : 0.095) * (0.78 + 0.35 * energy), { pan: -0.22 });
          onNote();
        }

        // 3. Qanun shimmering cascades (strongest in Sunlit Arch & Mythic Oracle)
        if ((cfg.style === 'sunlit' || cfg.style === 'mythic' || energy >= 0.55) && (s === 2 || s === 5 || (s === 7 && bar % 2 === 0))) {
          var qMidi = ch[s === 2 ? 3 : 2] + 12;
          INST.qanun(ctx, out, qMidi, t, eighth * 1.3, 0.065 + 0.04 * energy, { pan: 0.28 });
          if (s === 7 && bar % 4 === 3) {
            // Fast Arabic qanun grace flourish into the next bar
            INST.qanun(ctx, out, qMidi + 1, t + eighth * 0.5, eighth * 0.5, 0.045, { pan: 0.32 });
          }
          onNote();
        }

        // 4. Medieval Arabic percussion (darbuka + dynamic riq)
        // At very low intensity in Arch/Oracle (~0.3 night silence/prayer), thin percussion gracefully
        var drumChar = cfg.drum.charAt(s % cfg.drum.length);
        var playDrum = drumChar !== '.' && (energy >= 0.36 || (s === 0 && drumChar === 'D'));
        if (playDrum) {
          INST.darbuka(ctx, noise, out, drumChar, t, (drumChar === 'D' ? 0.24 : 0.16) * (0.65 + 0.55 * energy));
          onNote();
        }
        if (energy >= 0.5 && (s === 2 || s === 6 || (cfg.style === 'urgent' && s === 4))) {
          INST.riq(ctx, noise, out, t, 0.045 * (energy - 0.3));
          onNote();
        }

        // 5. Lead heroic motif: Oud lead / Rabab-Ney alternation by section & intensity
        var m = mel[bar * 8 + s];
        if (m) {
          var useLead = (bar >= 8) || (cfg.style === 'mythic') || (cycle % 2 === 1 && bar < 8);
          var leadMidi = m[0] + (cfg.style === 'sunlit' && bar >= 8 && energy >= 0.5 ? 12 : 0);
          if (useLead) {
            INST.rababNey(ctx, out, leadMidi, t, eighth * m[1], 0.105 + 0.025 * energy, { noise: noise, pan: 0.08, slideFrom: m[2] });
          } else {
            INST.oud(ctx, out, leadMidi, t, eighth * Math.max(1.8, m[1]), 0.14, { pan: -0.05 });
            if (cfg.style === 'urgent' && energy >= 0.65) {
              // Heroic rapid doubled pluck on fire crossing
              INST.qanun(ctx, out, leadMidi + 12, t + 0.02, eighth * 1.2, 0.05, { pan: 0.22 });
            }
          }
          onNote();
        }
      }
    };
  }

  var SCORES = {
    hubMondstadt: buildHubMondstadt(),
    hubLiyue: buildHubLiyue(),
    hubFontaine: buildHubFontaine(),
    desertAdventure: buildDesertAdventure('gates'),
    desertAdventureArch: buildDesertAdventure('arch'),
    desertAdventureFire: buildDesertAdventure('fire'),
    desertAdventureOracle: buildDesertAdventure('oracle')
  };

  function has(key) {
    return !!(key && (SCORES[key] || externalUrl(key)));
  }

  function meta(key) {
    var s = SCORES[key];
    return s ? { root: s.root, mode: s.mode } : null;
  }

  // ---- Hybrid player: external .mp3/.ogg if explicitly registered, otherwise live procedural score ----
  function create(key, ctx, out, opts) {
    var s = SCORES[key];
    if (!s && !externalUrl(key)) return null;
    opts = opts || {};
    var level = s ? s.level : 0.46;
    var mix = ctx.createGain();
    mix.gain.value = level;
    mix.connect(out);
    if (opts.verb) {
      var send = ctx.createGain();
      send.gain.value = 0.5;
      mix.connect(send);
      send.connect(opts.verb);
    }

    var stopped = false;
    var extUrl = externalUrl(key);
    var activeExternal = !!extUrl;
    var srcNode = null;
    var htmlAudio = null;

    // Live procedural state
    var bar = 0, step = 0, cycle = 0;
    var next = ctx.currentTime + 0.35;
    var ahead = 0.45;

    function stopExternal() {
      if (srcNode) { try { srcNode.stop(); } catch (e) {} try { srcNode.disconnect(); } catch (e) {} srcNode = null; }
      if (htmlAudio) { try { htmlAudio.pause(); htmlAudio.src = ''; } catch (e) {} htmlAudio = null; }
      activeExternal = false;
    }

    function startExternal(url) {
      if (!url) { activeExternal = false; return; }
      if (window.location && window.location.protocol === 'file:') {
        try {
          htmlAudio = new Audio(url);
          htmlAudio.loop = true;
          htmlAudio.volume = 0;
          htmlAudio.addEventListener('error', function () { stopExternal(); });
          var p = htmlAudio.play();
          if (p && typeof p.catch === 'function') p.catch(function () { /* wait for tick volume sync or fallback */ });
        } catch (e) { stopExternal(); }
        return;
      }
      var cacheKey = key + ':' + url;
      function attachBuffer(buf) {
        if (stopped || !buf) { activeExternal = false; return; }
        try {
          var node = ctx.createBufferSource();
          node.buffer = buf;
          node.loop = true;
          node.connect(mix);
          node.start();
          srcNode = node;
          if (opts.onNote) opts.onNote();
        } catch (e) { stopExternal(); }
      }
      if (bufferCache[cacheKey]) {
        attachBuffer(bufferCache[cacheKey]);
        return;
      }
      if (typeof fetch !== 'function') { stopExternal(); return; }
      fetch(url)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
        .then(function (ab) { return ctx.decodeAudioData(ab); })
        .then(function (buf) {
          bufferCache[cacheKey] = buf;
          attachBuffer(buf);
        })
        .catch(function () {
          stopExternal();
        });
    }

    if (extUrl) startExternal(extUrl);

    function tick() {
      if (stopped) return;
      if (htmlAudio) {
        var mutedNow = !!(opts.isMuted && opts.isMuted());
        var targetVol = mutedNow ? 0 : Math.max(0, Math.min(1, mix.gain.value * 0.45));
        try {
          htmlAudio.volume = targetVol;
          if (!mutedNow && ctx.state === 'running' && htmlAudio.paused) htmlAudio.play().catch(function () {});
        } catch (e) {}
        if (!mutedNow && opts.onNote) opts.onNote();
        return;
      }
      if (activeExternal) return;
      if (!s) return;
      if (!ctx || ctx.state !== 'running') { next = ctx ? ctx.currentTime + 0.1 : next; return; }
      if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
      var eighth = 30 / s.bpm;
      var intensity = opts.getIntensity ? opts.getIntensity() : 0.5;
      var isMuted = opts.isMuted ? opts.isMuted() : false;
      while (next < ctx.currentTime + ahead) {
        var swing = (step % 2 && s.stepsPerBar === 8) ? eighth * 0.035 : 0;
        if (!isMuted) {
          s.stepFn(ctx, mix, bar, step, cycle, next + swing, eighth, intensity, opts.noise, opts.onNote || function () {});
        }
        next += eighth;
        step++;
        if (step >= s.stepsPerBar) {
          step = 0;
          bar++;
          if (bar >= s.bars) {
            bar = 0;
            cycle++;
          }
        }
      }
    }

    return {
      mix: mix,
      level: level,
      tick: tick,
      stop: function () { stopped = true; stopExternal(); },
      isExternal: function () { return activeExternal; }
    };
  }

  return {
    has: has,
    meta: meta,
    create: create,
    registerTrack: registerTrack
  };
})();
