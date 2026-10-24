    // The two cinematics of the desert (docs/CINEMATIC_THE_ROAD_OF_SALT.md): «The Road of Salt», offered while Hermes walks
    // the dunes to the Nomad Ruins, and «The Night of the Steles», offered when the Desert Lexicon is done.
    // The films are not part of the Hub's offline kit (they weigh more than the whole game). They stream when she presses
    // play. Which ones exist is written in assets/cinematics/manifest.json ("available": true once the files are there);
    // until then no button shows anywhere.
    // State: order_cinematic_<id>_seen = 'true' once a film was watched to its end (nothing else is stored).
    window.EclipseCinematic = (function () {
      'use strict';
      var DIR = './assets/cinematics/';
      var manifest = null, loading = null;
      var layer = null, video = null, current = null, returnFocus = null, ambienceWas = null;

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
      function seen(id) { return get('order_cinematic_' + id + '_seen') === 'true'; }
      function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
      }

      // The manifest is read once; a failed read (offline, first visit) simply means "nothing to offer"
      function load() {
        if (manifest) return Promise.resolve(manifest);
        if (!loading) {
          loading = fetch(DIR + 'manifest.json', { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : {}; })
            .catch(function () { return {}; })
            .then(function (m) { manifest = m && typeof m === 'object' ? m : {}; return manifest; });
        }
        return loading;
      }
      function entry(id) { return manifest && manifest[id] && manifest[id].available ? manifest[id] : null; }

      function label(id, e) {
        return seen(id) ? '🎬 Watch again: ' + e.title : '🎬 Watch: ' + e.title + ' (' + e.length + ')';
      }
      function button(id, e) {
        var b = el('button', 'cine-btn', label(id, e));
        b.type = 'button';
        b.setAttribute('data-cinematic', id);
        if (navigator.onLine === false) {
          b.disabled = true;
          b.textContent = '🎬 ' + e.title + ': available when you are online';
        } else {
          b.addEventListener('click', function (ev) { ev.stopPropagation(); open(id, b); });
        }
        return b;
      }

      // Puts the button at the end of a container (idempotent: a container redrawn by the Hub gets it again)
      function attach(container, id) {
        if (!container || !id) return;
        load().then(function () {
          var e = entry(id);
          [].forEach.call(container.querySelectorAll('.cine-btn[data-cinematic]'), function (n) { n.remove(); });
          if (e && container.isConnected) container.appendChild(button(id, e));
        });
      }
      // The card of the Quest Map: the button joins its row of actions
      function inspector(id) {
        var row = document.querySelector('#star-inspector .inspector-actions-row');
        if (!row) return;
        [].forEach.call(row.querySelectorAll('.cine-btn[data-cinematic]'), function (n) { n.remove(); });
        if (id) attach(row, id);
      }

      // ---- The player
      function build() {
        layer = el('div', 'cine-layer');
        layer.id = 'cinematic-layer';
        layer.hidden = true;
        layer.setAttribute('role', 'dialog');
        layer.setAttribute('aria-modal', 'true');
        layer.setAttribute('aria-labelledby', 'cine-title');
        var card = el('div', 'cine-card');
        var head = el('div', 'cine-head');
        var title = el('div', 'cine-title');
        title.id = 'cine-title';
        var close = el('button', 'cine-close', '✕');
        close.type = 'button';
        close.setAttribute('aria-label', 'Close the film');
        close.addEventListener('click', function () { shut(false); });
        head.appendChild(title);
        head.appendChild(close);
        video = el('video', 'cine-video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'none';
        video.setAttribute('controlslist', 'nodownload');
        video.addEventListener('ended', function () { shut(true); });
        var note = el('p', 'cine-note', 'Subtitles are on. Press Escape to close.');
        card.appendChild(head);
        card.appendChild(video);
        card.appendChild(note);
        layer.appendChild(card);
        layer.addEventListener('click', function (e) { if (e.target === layer) shut(false); });
        layer.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { e.stopPropagation(); shut(false); return; }
          if (e.key !== 'Tab') return;
          var f = [].filter.call(layer.querySelectorAll('button, video'), function (n) { return !n.disabled && n.getClientRects().length; });
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
        document.body.appendChild(layer);
      }

      function small() {
        var c = navigator.connection;
        return window.innerWidth < 760 || !!(c && c.saveData);
      }
      function open(id, from) {
        load().then(function () {
          var e = entry(id);
          if (!e) return;
          if (!layer) build();
          current = id;
          returnFocus = from || document.activeElement;
          layer.querySelector('.cine-title').textContent = e.title;
          while (video.firstChild) video.removeChild(video.firstChild);
          video.poster = DIR + e.files.poster;
          video.src = DIR + (small() ? e.files['720'] : e.files['1080']);
          var tr = document.createElement('track');
          tr.kind = 'subtitles'; tr.label = 'English'; tr.srclang = 'en'; tr.src = DIR + e.files.vtt; tr.default = true;
          video.appendChild(tr);
          // the film carries its own sound: the ambient bed rests while it plays, and the film starts muted if she had muted the Hub
          var A = window.EclipseAmbience;
          ambienceWas = A ? A.state().muted : null;
          video.muted = ambienceWas === true;
          if (A && ambienceWas === false) A.setMuted(true);
          layer.hidden = false;
          document.documentElement.classList.add('cine-open');
          var play = video.play();
          if (play && play.catch) play.catch(function () {});
          setTimeout(function () { layer.querySelector('.cine-close').focus({ preventScroll: true }); }, 30);
        });
      }
      function shut(finished) {
        if (!layer || layer.hidden) return;
        video.pause();
        video.removeAttribute('src');
        video.load();
        layer.hidden = true;
        document.documentElement.classList.remove('cine-open');
        var A = window.EclipseAmbience;
        if (A && ambienceWas === false) A.setMuted(false);
        ambienceWas = null;
        var id = current; current = null;
        if (finished && id) {
          set('order_cinematic_' + id + '_seen', 'true');
          document.dispatchEvent(new CustomEvent('cinematic:seen', { detail: { id: id } }));
        }
        // the buttons that name the film say "Watch again" from now on
        [].forEach.call(document.querySelectorAll('.cine-btn[data-cinematic="' + id + '"]'), function (b) { b.textContent = label(id, entry(id) || { title: '', length: '' }); });
        if (returnFocus && typeof returnFocus.focus === 'function' && document.contains(returnFocus)) returnFocus.focus();
        returnFocus = null;
      }

      load();
      return { attach: attach, inspector: inspector, open: open, close: function () { shut(false); }, seen: seen, ready: load };
    })();
