// A chat-style conversation for story scenes: one bubble per run of messages from the same speaker, "typing..." dots
// for as long as the message would take to write, then time to read it. Narration and diary cards sit between the bubbles.
// The look is the .gl-* family of s13b-gates-tower-ii.css (row, avatar, name, bubble, line, narration, card).
//
//   var chat = EclipseChat.create({ log, cast, subtitle?, onSpeak?(who, text|null), onBeat?() });
//   await chat.play([ { narr, fx? }, { card:[...], title? }, { who, say, fx? } ... ], chat.token);
//   chat.reset() starts a new run (cancels the one in flight); chat.fast = true makes every pause 50 ms.
// A line's fx runs when its text appears. play() resolves false when the run was cancelled.
(function () {
  'use strict';

  function create(o) {
    var log = o.log, cast = o.cast, subtitle = o.subtitle || null;
    var chat = { token: 0, fast: false };

    function sleep(ms) { return new Promise(function (res) { setTimeout(res, chat.fast ? 50 : ms); }); }
    function scroll() {
      if (!log) return;
      log.scrollTop = log.scrollHeight;
      requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; });
    }
    // chat rhythm: typing lasts as long as the message would take to write; reading as long as it takes to read
    function typingTime(who, text) { return Math.min(3000, 750 + text.length * (who === 'silvia' ? 22 : 34)); }
    function readTime(text) { return Math.min(2600, 650 + text.length * 30); }

    function narr(text) {
      var d = document.createElement('div');
      d.className = 'gl-narr';
      d.textContent = text;
      log.appendChild(d);
      scroll();
      if (subtitle) subtitle.textContent = text;
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
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i], text = typeof ln === 'string' ? ln : ln.say;
        var p = document.createElement('p');
        p.className = 'gl-line';
        p.innerHTML = '<span class="gl-typing"><i></i><i></i><i></i></span>';
        bubble.appendChild(p);
        scroll();
        if (o.onSpeak) o.onSpeak(who, null);
        await sleep(typingTime(who, text));
        if (token !== chat.token) return;
        if (ln.fx) ln.fx();
        p.textContent = text;
        scroll();
        if (o.onSpeak) o.onSpeak(who, text);
        await sleep(readTime(text));
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
          await sleep(1400);
          i++;
        } else if (ln.narr) {
          if (o.onSpeak) o.onSpeak(null, null);
          narr(ln.narr);
          if (ln.fx) ln.fx();
          await sleep(1100 + Math.min(1400, ln.narr.length * 22));
          i++;
        } else {
          var run = [];
          while (i < lines.length && lines[i].who === ln.who && !lines[i].narr && !lines[i].card) { run.push(lines[i]); i++; }
          await say(ln.who, run, token);
        }
      }
      return token === chat.token;
    }

    chat.reset = function () { chat.token++; chat.fast = false; if (log) log.innerHTML = ''; return chat.token; };
    chat.sleep = sleep;
    chat.say = say;
    chat.play = play;
    chat.narr = narr;
    chat.card = card;
    return chat;
  }

  window.EclipseChat = { create: create };
})();
