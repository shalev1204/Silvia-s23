    // «Previously on…» (docs/IDEAS_BACKLOG.md #1). When Silvia comes back after 12 hours or more away, a series
    // narrator tells her where the story stands: the last thing that happened, where Hermes is now, and what to do next.
    // The same recap stays in Ask Hermes ("Previously on The Eclipse Order…"), always up to date.
    // "Last time" comes from the last game she solved; "now" and "next" are read from the Field Wire's own waypoint
    // (or, when the wire is waiting for her, from the wire itself), so the recap never disagrees with the chat.
    // State: order_last_seen_at (travels with the cloud save, so time away counts across devices).
    window.EclipsePreviously = (function () {
      'use strict';
      var KEY = 'order_last_seen_at';
      var AWAY_MS = 12 * 3600 * 1000;
      var STAMP_EVERY_MS = 5 * 60 * 1000;
      var SHOW_DELAY_MS = 1200;

      // One line per solved game, in the narrator's voice. Never an answer, never the WHERE.
      var LAST = {
        start: 'A storm of red sand buried the raiders’ tracks, and Hermes rode it out under a rock shelf by Watchtower VI, with a copper wire to Silvia his only light.',
        cairn1: 'At dawn, by the dry wash, Silvia guided Hermes stone by stone through Cairn I, and the Wash River seal went into his satchel.',
        chasm: 'Silvia led Hermes through the Whispering Chasm, marker by marker, and out of the gorge alive.',
        playa: 'Silvia found Hermes a safe road across the Salt Playa, slab by slab, around the sinkholes.',
        lexicon: 'At Camp VII, Silvia read the nomad steles and locked the Al-Qibla bearing: the true road to Tower II.',
        clepsydra: 'At the Four Wells of Camp VIII, Silvia set the four seekers in their shadow-hours, and the water came back.',
        s14: 'At the Sun Monolith, Silvia woke Cairn II and its seal came out of the niche. On the rim, Hermes found a smear of cobalt blue, ground the way Aurelia ground her lapis.',
        s15: 'In the Sandstone Labyrinth, Silvia slipped Hermes past the raiders’ torches to the Seal of Cairn III. On the way out he saw a star in gold leaf, painted over blue.',
        s16: 'Between the singing pillars of Cairn IV, the song gave up the fourth seal and a river pebble painted with a gold star. At dawn the raiders split: a few men on Hermes’s tracks, the wagons back north-east.',
        s17: 'Under the Arch of the Solstice, Silvia woke Cairn V, and its seal was sewn into Hermes’s coat with the others. Over Tower II, the smoke was still rising.',
        s18: 'In the burning atrium of Tower II, Silvia read the stele and led Hermes through the fire to the well. The Servant was alive, and the Oracle’s charts were safe.',
        s19: 'Behind the door of the inner stair, the Oracle turned out to be Aurelia, alive since 1971. And her disc gave Silvia the first truth: the WHEN.',
        s20: 'The Gate of a Thousand Masks opened for Hermes and Aurelia. Inside: Fragment I of the Mirror Speaker’s mirror, and a note sealed with ash.',
        s21: 'In the dark room under Tower III, Silvia held Sheet 20A against the city on the wall and found where the Ashes had lit their fire. The second piece of the mirror was in the chimney of the narrow house.'
      };
      var DO_WORDS = /^(Open|Keep|Read|Trace|Follow|Help|Guide|Speak|Wake|Answer)\b/;

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
      function gateOpen() { return typeof window.__gateIsOpen !== 'function' || window.__gateIsOpen(); }

      function lastSolved() {
        var T = window.TesterDesert, id = null;
        if (!T) return null;
        T.games.forEach(function (g) { if (T.isDone(g.id)) id = g.id; });
        return id;
      }

      // Where Hermes stands and what to do, from the Field Wire's waypoint card
      function wireNow() {
        var bar = document.getElementById('wire-completed-bar');
        if (!bar || bar.style.display === 'none') {
          return { place: 'On the Field Wire', now: ['Hermes is on the wire, waiting for Silvia’s answer.'], next: ['Open the Field Wire and reply to him.'] };
        }
        var titleEl = bar.querySelector('.messenger-waypoint-title');
        var descEl = bar.querySelector('.messenger-waypoint-desc');
        var place = (titleEl ? titleEl.textContent : '').replace(/✦/g, '').trim();
        var eta = '', now = [], next = [];
        if (descEl) {
          var copy = descEl.cloneNode(true);
          Array.prototype.forEach.call(copy.querySelectorAll('button'), function (b) { b.remove(); });
          Array.prototype.forEach.call(copy.querySelectorAll('div'), function (d) {
            var m = /(\d+)\s*h\s*(\d+)\s*m/i.exec(d.textContent);
            if (m) { eta = m[1] + '\u00a0h\u00a0' + m[2] + '\u00a0min'; d.remove(); }
          });
          copy.textContent.replace(/\s+/g, ' ').trim().replace(/([.!?])\s+(?=[A-Z])/g, '$1\n').split('\n').forEach(function (s) {
            if (!s) return;
            if (/^Next:\s*/.test(s)) next.push(s.replace(/^Next:\s*/, ''));
            else if (DO_WORDS.test(s)) next.push(s);
            else now.push(s);
          });
        }
        if (eta) now.push('He arrives in ' + eta + '.');
        if (!next.length) {
          if (eta) next.push('Nothing to solve until he arrives: follow his beacon on the Grand Desert Map.');
          else if (now.length > 1) next.push(now.pop());
        }
        return { place: place, now: now, next: next };
      }

      function recap() {
        var id = lastSolved();
        var w = wireNow();
        return { id: id || 'start', last: LAST[id] || LAST.start, place: w.place, now: w.now.join(' '), next: w.next.join(' ') };
      }

      // ---- The card
      var overlay = null;
      function close() {
        if (!overlay) return;
        overlay.remove();
        overlay = null;
        document.removeEventListener('keydown', onKey);
      }
      function onKey(e) { if (e.key === 'Escape') close(); }
      function section(label, lines) {
        var s = document.createElement('section');
        s.className = 'previously-section';
        var h = document.createElement('h3');
        h.textContent = label;
        s.appendChild(h);
        lines.forEach(function (l) {
          if (!l.text) return;
          var p = document.createElement('p');
          if (l.cls) p.className = l.cls;
          p.textContent = l.text;
          s.appendChild(p);
        });
        return s;
      }
      function show() {
        if (overlay) return;
        var r = recap();
        overlay = document.createElement('div');
        overlay.className = 'previously-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'previously-title');
        var card = document.createElement('div');
        card.className = 'previously-card';
        card.innerHTML = '<p class="previously-eyebrow">Previously on</p><h2 class="previously-title" id="previously-title">The Eclipse Order…</h2>';
        card.appendChild(section('Last time', [{ text: r.last }]));
        card.appendChild(section('Where things stand', [{ text: r.place, cls: 'previously-place' }, { text: r.now }]));
        if (r.next) card.appendChild(section('Next', [{ text: r.next }]));
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'previously-continue';
        btn.textContent = 'Continue the story ➔';
        btn.addEventListener('click', close);
        card.appendChild(btn);
        var foot = document.createElement('p');
        foot.className = 'previously-foot';
        foot.textContent = 'Hermes keeps this recap in Ask Hermes.';
        card.appendChild(foot);
        overlay.appendChild(card);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        btn.focus();
      }

      // ---- Time away
      function stamp(force) {
        var last = parseInt(get(KEY) || '0', 10) || 0;
        if (force || Date.now() - last >= STAMP_EVERY_MS) set(KEY, String(Date.now()));
      }
      function awayLongEnough() {
        var last = parseInt(get(KEY) || '0', 10) || 0;
        return last > 0 && Date.now() - last >= AWAY_MS;   // the very first visit has nothing to recap
      }
      // Stamps are written at most every 5 minutes (each one is a cloud event); 5 minutes is nothing against 12 hours
      function arrive(onLoad) {
        if (!gateOpen()) return;   // behind the gate: the reload after signing in is the real arrival
        var away = awayLongEnough();
        if (away) setTimeout(show, SHOW_DELAY_MS);
        stamp(onLoad || away);
      }

      arrive(true);
      setInterval(function () { if (document.visibilityState === 'visible' && gateOpen()) stamp(false); }, STAMP_EVERY_MS);
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') arrive(false);
        else if (gateOpen()) stamp(false);
      });
      window.addEventListener('pagehide', function () { if (gateOpen()) stamp(false); });

      var testerBtn = document.getElementById('tester-previously');
      if (testerBtn) testerBtn.addEventListener('click', show);

      // Ask Hermes: the recap, always current. A new chapter reads as unread again.
      function inquiry() {
        var r = recap();
        var step = get('order_field_wire_step') || '0';
        return {
          id: 'inq-previously-' + r.id + '-' + step,
          title: 'Previously on The Eclipse Order…',
          category: 'The story so far',
          group: 'desert',
          unlocked: function () { return true; },
          answer: 'Last time: ' + r.last + ' Where things stand: ' + (r.place ? r.place + '. ' : '') + r.now + (r.next ? ' Next: ' + r.next : '')
        };
      }

      return { show: show, recap: recap, inquiry: inquiry, AWAY_MS: AWAY_MS };
    })();
