    // Aurelia's Letters (docs/IDEAS_BACKLOG.md #12), in Chronicles above Hermes's notebook. Three letters she wrote to
    // Hermes at the Alpine Observatory in 1970 and 1971 and never gave him; her memory brings them back one by one,
    // with her sketchbooks (Sheets 21A, 23B, 25B): each comes when the room before that sketchbook face is won. None of
    // them speaks of the bridge (kept for Tower I). The section stays hidden until the audience with the Oracle.
    // A letter arrives sealed; breaking the seal opens it for good, and Hermes answers on the Field Wire at the step
    // where she read it (hub-core.js asks notesAt(step) when it rebuilds the chat).
    // State: order_aurelia_letters = { I: { at, step } }. A tester reset that unsolves the room closes its letter again.
    window.EclipseAureliaLetters = (function () {
      'use strict';
      var KEY = 'order_aurelia_letters';
      var POLL_MS = 1500;
      var BREAK_MS = 750;
      var SKETCH = {
        dome: '<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#e3b95c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M22 92 H98"/><path d="M30 92 V70 H90 V92"/><path d="M30 70 A30 30 0 0 1 90 70"/><path d="M58 41 L66 41 L64 70 L56 70 Z"/>' +
          '<path d="M61 52 L84 26"/><path d="M42 92 V80 H52 V92"/></g>' +
          '<g fill="#7fa6ff"><circle cx="20" cy="22" r="2"/><circle cx="36" cy="14" r="1.5"/><circle cx="96" cy="18" r="2"/><circle cx="104" cy="40" r="1.5"/><circle cx="88" cy="10" r="1.2"/></g></svg>',
        disc: '<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#e3b95c" stroke-width="2"><circle cx="60" cy="60" r="44"/><circle cx="60" cy="60" r="30"/><circle cx="60" cy="60" r="8"/></g>' +
          '<g fill="#7fa6ff">' + (function () {
            var dots = '';
            for (var i = 0; i < 24; i++) {
              var a = i * Math.PI / 12;
              dots += '<circle cx="' + (60 + 37 * Math.cos(a)).toFixed(1) + '" cy="' + (60 + 37 * Math.sin(a)).toFixed(1) + '" r="2"/>';
            }
            return dots;
          })() + '</g></svg>',
        terrace: '<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#e3b95c" stroke-width="2" stroke-linecap="round">' +
          '<path d="M14 84 H106"/><path d="M14 100 H106"/><path d="M24 84 V100 M40 84 V100 M56 84 V100 M72 84 V100 M88 84 V100 M104 84 V100"/></g>' +
          '<path d="M60 14 L65 33 L84 28 L71 42 L84 56 L65 51 L60 70 L55 51 L36 56 L49 42 L36 28 L55 33 Z" fill="#e3b95c" stroke="#7fa6ff" stroke-width="1.5"/></svg>'
      };
      // room: index of the Stage station in StageMirror.stations (22, 25 and 27)
      var LETTERS = [
        {
          id: 'I', room: 2, sketch: 'dome', sketchAlt: 'Her sketch in the margin: the observatory dome under the stars',
          date: 'The Alpine Observatory · March 1970',
          body: [
            'You fell asleep over your tables again, with the lamp still lit and the pen still in your hand. I took the pen. I left you the lamp.',
            'Tonight I ground the lapis until my wrists ached, and the blue came out finer than ever. I painted Cassiopeia with it while you dreamed. You dream of treasure the way other men dream of falling.',
            'I will not give you this letter. You would read it as a correction to your figures. But I wanted it written somewhere that I am happy here, in the cold, beside your lamp.'
          ],
          hermes: 'You read her letter. She found it this morning, sewn into the lining of her old coat. March 1970… I was asleep over my tables while she wrote it. I never knew, Silvia. Not once.'
        },
        {
          id: 'II', room: 5, sketch: 'disc', sketchAlt: 'Her sketch in the margin: the brass disc with its twenty-four stars',
          date: 'The Alpine Observatory · December 1970',
          body: [
            'You carved twenty-four stars into brass for me, and your hands are still cut from the burin. You think you gave me a gift. You gave me back the man who used to look up.',
            'I keep the disc under my pillow like a girl. Every night I count its stars, and every night there are twenty-four, and every night I am surprised.',
            'You said I was always the treasure. Then let me be a treasure that is spent: on you, on mornings, on nothing that lasts. I will not give you this one either. Some things must stay where you cannot correct them.'
          ],
          hermes: 'The second letter. The week of the disc. She kept it from me so I could not correct it… and fifty-five years later I still want to. She is right about me. She always was.'
        },
        {
          id: 'III', room: 7, sketch: 'terrace', sketchAlt: 'Her sketch in the margin: the terrace and a gilded star',
          date: 'The Alpine Observatory · August 1971',
          body: [
            'Tonight on the terrace you showed me what the rim of my disc says: three short, a pause, two long. You laughed when I flashed it back too slowly.',
            'I have painted this terrace so many times that the stones know my brushes. Tonight I only watched. The sky was so full that there was no dark place left to put a star.',
            'If we are ever apart, I will look for you with that light. Three short, a pause, two long. Answer me.'
          ],
          hermes: 'Three short, a pause, two long. She asked me to answer. It took me forty-five years to see that light, Silvia, and you were beside me on the wire when I finally did.'
        }
      ];

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function load() {
        var o = null;
        try { o = JSON.parse(get(KEY) || 'null'); } catch (e) { o = null; }
        return o && typeof o === 'object' ? o : {};
      }
      function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
      function flagOf(l) { var s = window.StageMirror ? window.StageMirror.stations[l.room] : null; return s ? s.flag : null; }
      function unlocked(l) { var f = flagOf(l); return !!f && get(f) === 'true'; }
      function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
      }
      function reducedMotion() {
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
      }

      // Hermes's lines for the letters Silvia opened at this step of the Field Wire, in the order she opened them
      function notesAt(step) {
        var o = load();
        return LETTERS.filter(function (l) { return o[l.id] && o[l.id].step === step && unlocked(l); })
          .sort(function (a, b) { return o[a.id].at - o[b.id].at; })
          .map(function (l) { return l.hermes; });
      }

      function open(l) {
        var o = load();
        if (o[l.id]) return;
        o[l.id] = { at: Date.now(), step: parseInt(get('order_field_wire_step') || '0', 10) || 0 };
        save(o);
        if (typeof window.setMessengerUnread === 'function') window.setMessengerUnread((parseInt(get('order_messenger_unread_count') || '0', 10) || 0) + 1);
        render();
        var opened = document.querySelector('.aurelia-letter[data-letter="' + l.id + '"]');
        if (opened) opened.focus();
      }

      function letterNode(l, isOpen) {
        var art = el('article', 'aurelia-letter' + (isOpen ? '' : ' is-sealed'));
        art.setAttribute('data-letter', l.id);
        art.tabIndex = -1;
        if (!isOpen) {
          var env = el('button', 'letter-envelope');
          env.type = 'button';
          env.setAttribute('aria-label', 'Letter ' + l.id + ' from Aurelia, sealed. Break the seal to read it.');
          env.appendChild(el('span', 'letter-envelope-num', 'Letter ' + l.id));
          var seal = el('span', 'letter-seal');
          seal.setAttribute('aria-hidden', 'true');
          seal.appendChild(el('span', 'letter-seal-half is-left', 'A'));
          seal.appendChild(el('span', 'letter-seal-half is-right', 'A'));
          env.appendChild(seal);
          env.appendChild(el('span', 'letter-envelope-hint', 'Break the seal'));
          env.addEventListener('click', function () {
            if (art.classList.contains('is-breaking')) return;
            art.classList.add('is-breaking');
            setTimeout(function () { open(l); }, reducedMotion() ? 0 : BREAK_MS);
          });
          art.appendChild(env);
          return art;
        }
        var fig = el('div', 'letter-sketch');
        fig.setAttribute('role', 'img');
        fig.setAttribute('aria-label', l.sketchAlt);
        fig.innerHTML = SKETCH[l.sketch];
        art.appendChild(fig);
        var body = el('div', 'letter-body');
        body.appendChild(el('div', 'letter-date', l.date));
        body.appendChild(el('p', 'letter-salutation', 'Hermes,'));
        l.body.forEach(function (text, i) {
          var p = el('p', 'letter-text');
          if (i === 0) {
            var cap = el('span', 'letter-initial', text.charAt(0));
            cap.setAttribute('aria-hidden', 'true');
            p.appendChild(cap);
            var sr = el('span', 'letter-sr', text.charAt(0));
            p.appendChild(sr);
            p.appendChild(document.createTextNode(text.slice(1)));
          } else {
            p.textContent = text;
          }
          body.appendChild(p);
        });
        body.appendChild(el('p', 'letter-signature', 'A.'));
        art.appendChild(body);
        return art;
      }

      var last = null;
      function render() {
        var box = document.getElementById('aurelia-letters');
        if (!box) return;
        var o = load(), changed = false;
        // a room unsolved again (tester reset) closes its letter and forgets it was read
        LETTERS.forEach(function (l) { if (o[l.id] && !unlocked(l)) { delete o[l.id]; changed = true; } });
        if (changed) save(o);
        box.hidden = get('order_oracle_horizon_completed') !== 'true';
        var list = box.querySelector('.letters-list');
        list.textContent = '';
        var shown = 0;
        LETTERS.forEach(function (l) {
          if (!unlocked(l)) return;
          list.appendChild(letterNode(l, !!o[l.id]));
          shown++;
        });
        var wait = box.querySelector('.letters-wait');
        var left = LETTERS.length - shown;
        wait.hidden = !left;
        wait.textContent = shown ? (left === 1 ? 'One more letter is still lost in her memory.' : left + ' more letters are still lost in her memory.')
          : 'Aurelia remembers slowly. What she wrote long ago comes back to her one letter at a time.';
        last = signature();
      }
      function signature() {
        return get('order_oracle_horizon_completed') + '|' + LETTERS.map(function (l) { return unlocked(l) ? 1 : 0; }).join('') + '|' + get(KEY);
      }
      function watch() { if (signature() !== last) render(); }

      render();
      setInterval(watch, POLL_MS);

      return { render: render, notesAt: notesAt, letters: LETTERS };
    })();
