// A chat-style conversation for story scenes: one bubble per run of messages from the same speaker, "typing..." dots
// for as long as the message would take to write, then time to read it. Narration and diary cards sit between the bubbles.
// The look is the .gl-* family of s13b-gates-tower-ii.css (row, avatar, name, bubble, line, narration, card).
//
//   var chat = EclipseChat.create({ log, cast, subtitle?, stage?, onSpeak?(who, text|null), onBeat?() });
//   await chat.play([ { narr, fx?, hold? }, { card:[...], title? }, { who, say, fx? } ... ], chat.token);
//   chat.reset() starts a new run (cancels the one in flight); chat.fast = true makes every pause 50 ms.
// A line's fx runs when its text appears. play() resolves false when the run was cancelled.
//
// The pace is slow on purpose (the Operator's choice): every line stays up as long as it takes to read it calmly, and a
// stage direction ("narr") stays longer, because it also happens in the scene. Silvia can pause the scene at any moment
// (EclipseChat.pauser puts the button on the stage) and clicking the chat hurries the beat in flight.
// EclipseChat.pace and EclipseChat.subtitle are shared with the Gates of Tower II, which has its own chat.
(function () {
  'use strict';

  function words(text) { return String(text || '').split(/\s+/).filter(Boolean).length; }
  var pace = {
    // the dots last about as long as a calm hand would take to type it
    typing: function (who, text) { return Math.min(2400, 700 + String(text).length * (who === 'silvia' ? 14 : 22)); },
    // about 175 words a minute, and a breath before the next line
    read: function (text) { return Math.min(9000, 1500 + words(text) * 340); },
    // a stage direction: read it, and watch it happen
    narr: function (text, hold) { return Math.min(10500, 2100 + words(text) * 360) + (hold || 0); },
    card: 2600
  };

  // A wait that stops while the scene is paused and ends at once when the scene is hurried
  function waiter(ctl) {
    return function (ms) {
      return new Promise(function (res) {
        if (ctl.isFast()) { setTimeout(res, 50); return; }
        var left = ms, last = Date.now();
        (function tick() {
          var now = Date.now();
          if (!ctl.isPaused()) left -= now - last;
          last = now;
          if (left <= 0 || ctl.isFast()) res(); else setTimeout(tick, Math.max(16, Math.min(120, left)));
        })();
      });
    };
  }

  // The stage direction as a TV subtitle: gold, at the foot of the scene, gone again when someone speaks
  var subtitle = {
    act: function (el, text) {
      if (!el) return;
      el.textContent = text;
      el.classList.add('is-act');
      el.classList.remove('is-quiet');
    },
    quiet: function (el) { if (el && el.classList.contains('is-act')) el.classList.add('is-quiet'); },
    reset: function (el, text) { if (!el) return; el.classList.remove('is-act', 'is-quiet'); if (text != null) el.textContent = text; }
  };

  // ⏸ on the stage: holds the scene (the 3D keeps breathing, the words wait). ctl.onChange(paused) for the owner.
  function pauser(stage, ctl) {
    var p = { paused: false, btn: null };
    if (!stage) return p;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gl-pause';
    function paint() {
      b.textContent = p.paused ? '▶ Resume' : '⏸ Pause';
      b.setAttribute('aria-pressed', p.paused ? 'true' : 'false');
      b.setAttribute('aria-label', p.paused ? 'Resume the scene' : 'Pause the scene');
      stage.classList.toggle('is-paused', p.paused);
    }
    p.set = function (on) { p.paused = !!on; paint(); if (ctl && ctl.onChange) ctl.onChange(p.paused); };
    p.toggle = function () { p.set(!p.paused); };
    b.addEventListener('click', function (e) { e.stopPropagation(); p.toggle(); });
    stage.appendChild(b);
    p.btn = b;
    paint();
    return p;
  }

  function create(o) {
    var log = o.log, cast = o.cast, sub = o.subtitle || null;
    var chat = { token: 0, fast: false };
    var pause = pauser(o.stage || null);
    chat.pause = pause;

    var sleep = waiter({ isFast: function () { return chat.fast; }, isPaused: function () { return pause.paused; } });
    function scroll() {
      if (!log) return;
      log.scrollTop = log.scrollHeight;
      requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; });
    }

    function narr(text) {
      var d = document.createElement('div');
      d.className = 'gl-narr';
      d.textContent = text;
      log.appendChild(d);
      scroll();
      subtitle.act(sub, text);
    }
    function card(title, items) {
      var d = document.createElement('div');
      d.className = 'gl-card';
      var h = document.createElement('div');
      h.className = 'gl-card-title';
      h.textContent = title;
      d.appendChild(h);
      var ul = document.createElement('ul');
      items.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
      d.appendChild(ul);
      log.appendChild(d);
      scroll();
    }

    async function say(who, lines, token) {
      var c = cast[who];
      var row = document.createElement('div');
      row.className = 'gl-row gl-' + who;
      row.innerHTML = '<div class="gl-avatar" aria-hidden="true">' + c.icon + '</div>' +
        '<div class="gl-main"><div class="gl-name">' + c.name + ' <small>' + c.role + '</small></div><div class="gl-bubble"></div></div>';
      var bubble = row.querySelector('.gl-bubble');
      log.appendChild(row);
      subtitle.quiet(sub);
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i], text = typeof ln === 'string' ? ln : ln.say;
        var p = document.createElement('p');
        p.className = 'gl-line';
        p.innerHTML = '<span class="gl-typing"><i></i><i></i><i></i></span>';
        bubble.appendChild(p);
        scroll();
        if (o.onSpeak) o.onSpeak(who, null);
        await sleep(pace.typing(who, text));
        if (token !== chat.token) return;
        if (ln.fx) ln.fx();
        p.textContent = text;
        scroll();
        if (o.onSpeak) o.onSpeak(who, text);
        await sleep(pace.read(text));
        if (token !== chat.token) return;
      }
      row.classList.add('is-said');
    }

    async function play(lines, token) {
      var i = 0;
      while (i < lines.length) {
        if (token !== chat.token) return false;
        var ln = lines[i];
        if (ln.card) {
          if (o.onSpeak) o.onSpeak(null, null);
          card(ln.title || '📖 Where we are', ln.card);
          await sleep(pace.card);
          i++;
        } else if (ln.narr) {
          if (o.onSpeak) o.onSpeak(null, null);
          narr(ln.narr);
          if (ln.fx) ln.fx();
          await sleep(pace.narr(ln.narr, ln.hold));
          i++;
        } else {
          var run = [];
          while (i < lines.length && lines[i].who === ln.who && !lines[i].narr && !lines[i].card) { run.push(lines[i]); i++; }
          await say(ln.who, run, token);
        }
      }
      return token === chat.token;
    }

    chat.reset = function () { chat.token++; chat.fast = false; if (pause.set) pause.set(false); if (log) log.innerHTML = ''; return chat.token; };
    chat.sleep = sleep;
    chat.say = say;
    chat.play = play;
    chat.narr = narr;
    chat.card = card;
    return chat;
  }

  window.EclipseChat = { create: create, pace: pace, waiter: waiter, pauser: pauser, subtitle: subtitle, words: words };
})();
