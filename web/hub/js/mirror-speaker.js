    // The Mirror Speaker reads how Silvia plays (docs/IDEAS_BACKLOG.md #11). She is never seen and never speaks:
    // when the door of a room of Tower III opens, a short line appears in the glass, in mirror writing, signed
    // with her horizontal line. It answers how Silvia solved the room before: her misses and Hermes's notes
    // (Hermes's notebook, order_journal), how long after arriving, the hour of the day, and the tone she uses with
    // Hermes on the wire. The line is written once and kept (order_speaker_line_<node>), so it never changes after
    // she has read it. Silvia reads it with her hand mirror; tapping the glass turns it round for a few seconds.
    // Every room of the Stage Path shows it at the top of its game: EclipseMirrorSpeaker.render(node, element).
    window.EclipseMirrorSpeaker = (function () {
      'use strict';
      var READ_MS = 6000;

      var HOUR = [
        [5, 10, 'You came with the first light.'],
        [10, 18, 'You came under the full sun.'],
        [18, 22, 'You came as the lamps were lit.'],
        [22, 29, 'You came by candlelight.']   // 22:00 to 05:00
      ];
      var EFFORT = {
        clean: 'You saw it before it was shown.',
        hard: 'The glass tested you hard. You did not break.',
        helped: 'You let the old man hold the lamp. That is also seeing.',
        alone: 'You stumbled, and did not ask. The glass noticed.'
      };
      var PACE = {
        swift: 'And swiftly.',
        slow: 'You let it rest a night. That was wise.'
      };
      var TONE = {
        warm: 'Bring that warmth inside.',
        protective: 'You guard him. Here, let the room guard you.',
        tactical: 'Here, plans bend. Look twice.',
        analytic: 'Here, reason opens only half the door.'
      };
      var UNSEEN = 'You came. The glass remembers the rest.';

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function rooms() { return window.StageMirror ? window.StageMirror.stations : []; }

      // The notebook page of the game that won the room before `node` ({at, fails, notes, arrived} or null)
      function previousPage(node) {
        var list = rooms(), i, id = null, journal = null;
        for (i = 1; i < list.length; i++) if (list[i].node === node) break;
        if (i >= list.length || get(list[i - 1].flag) !== 'true') return undefined;   // the door is not open yet
        (window.TesterDesert ? window.TesterDesert.games : []).forEach(function (g) { if (g.flag === list[i - 1].flag) id = g.id; });
        try { journal = JSON.parse(get('order_journal') || 'null'); } catch (e) { journal = null; }
        return id && journal && journal[id] && journal[id].at ? journal[id] : null;
      }

      function compose(page) {
        var tone = typeof window.hermesDominantTone === 'function' ? window.hermesDominantTone() : 'warm';
        if (!page) return UNSEEN + ' ' + (TONE[tone] || TONE.warm);
        var h = new Date(page.at).getHours(), parts = [];
        HOUR.forEach(function (r) { if ((h >= r[0] && h < r[1]) || (h + 24 >= r[0] && h + 24 < r[1])) parts.push(r[2]); });
        var fails = page.fails || 0, notes = page.notes || 0;
        parts.push(!fails && !notes ? EFFORT.clean : fails >= 6 ? EFFORT.hard : notes ? EFFORT.helped : EFFORT.alone);
        if (page.arrived) {
          var mins = (page.at - page.arrived) / 60000;
          if (mins >= 0 && mins < 20) parts.push(PACE.swift);
          else if (mins > 12 * 60) parts.push(PACE.slow);
        }
        parts.push(TONE[tone] || TONE.warm);
        return parts.join(' ');
      }

      // The line for the room at `node` (null while its door is shut), written once and kept
      function line(node) {
        var key = 'order_speaker_line_' + node, kept = get(key);
        if (kept) return kept;
        var page = previousPage(node);
        if (page === undefined) return null;
        if (window.EclipseStagePause && window.EclipseStagePause.remaining(node)) return null;
        var text = compose(page);
        try { localStorage.setItem(key, text); } catch (e) {}
        return text;
      }

      // Draws the line into `container`: mirror-written, signed with her line; a tap turns it round for a moment
      function render(node, container) {
        if (!container) return false;
        container.textContent = '';
        var text = line(node);
        container.hidden = !text;
        if (!text) return false;
        var box = document.createElement('button');
        box.type = 'button';
        box.className = 'mirror-speaker-line';
        box.setAttribute('aria-label', 'Written in the glass, in mirror writing: ' + text + ' Signed with a single horizontal line.');
        box.title = 'Hold your mirror to it, or tap';
        var words = document.createElement('span');
        words.className = 'mirror-speaker-words';
        words.textContent = text;
        var sign = document.createElement('span');
        sign.className = 'mirror-speaker-sign';
        sign.setAttribute('aria-hidden', 'true');
        box.appendChild(words);
        box.appendChild(sign);
        var timer = null;
        box.addEventListener('click', function (e) {
          e.stopPropagation();
          box.classList.add('is-read');
          clearTimeout(timer);
          timer = setTimeout(function () { box.classList.remove('is-read'); }, READ_MS);
        });
        container.appendChild(box);
        return true;
      }

      return { line: line, render: render, compose: compose };
    })();
    // the Living Mirror may have been drawn before this script loaded: draw it again so the line shows
    if (window.StageMirror && typeof window.StageMirror.refresh === 'function') window.StageMirror.refresh();
