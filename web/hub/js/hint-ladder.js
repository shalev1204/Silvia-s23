    // Progressive hints (docs/IDEAS_BACKLOG.md #6). Every puzzle of every station climbs the same ladder:
    //   level 1 after 3 misses or 10 minutes stuck: where to look;
    //   level 2 after 6 misses or 20 minutes: the rule (the station's own older help: its Ask Hermes answer or guide);
    //   level 3 after 9 misses or 35 minutes: the first step, done with her. Never the answer.
    // Minutes are active minutes: the puzzle on screen, the tab visible, the puzzle not yet solved.
    // Hermes's notes are drawn under the puzzle and kept in Ask Hermes ("Hermes's notes · …").
    // State per puzzle: order_hint_<id>_fails, order_hint_<id>_secs, order_hint_<id>_level (travels with the cloud save).
    window.EclipseHints = (function () {
      'use strict';
      var FAILS = [3, 6, 9];
      var SECS = [600, 1200, 2100];
      var TICK_S = 5, SAVE_EVERY_S = 60;
      var defs = {}, order = [];

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
      function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
      function num(k) { return parseInt(get(k) || '0', 10) || 0; }
      function key(id, part) { return 'order_hint_' + id + '_' + part; }

      function level(id) { return Math.max(0, Math.min(3, num(key(id, 'level')))); }
      function due(d) {
        var f = num(key(d.id, 'fails')), s = num(key(d.id, 'secs')) + d.unsaved, n = 0;
        for (var i = 0; i < 3; i++) if (f >= FAILS[i] || s >= SECS[i]) n = i + 1;
        return n;
      }
      function climb(d) {
        var now = level(d.id), next = due(d);
        if (next <= now) return;
        set(key(d.id, 'level'), String(next));
        if (next >= 2 && d.legacyKey) set(d.legacyKey, 'true');   // the station's older help opens at level 2
        if (d.onLevel) { try { d.onLevel(next); } catch (e) {} }
        draw(d, true);
      }

      function visible(node) { return !!node && document.contains(node) && node.getClientRects().length > 0; }
      function solved(d) { try { return !!(d.solved && d.solved()); } catch (e) { return false; } }
      function playing(d) {
        if (solved(d) || level(d.id) >= 3) return false;
        if (d.active) { try { if (!d.active()) return false; } catch (e) { return false; } }
        return visible(typeof d.anchor === 'function' ? d.anchor() : d.anchor);
      }

      // ---- Hermes's note under the puzzle
      function draw(d, fresh) {
        var anchor = typeof d.anchor === 'function' ? d.anchor() : d.anchor;
        if (!anchor || !anchor.parentNode) return;
        if (!d.box || !document.contains(d.box)) {
          d.box = document.createElement('div');
          d.box.className = 'hint-ladder';
          d.box.setAttribute('role', 'status');
          d.box.setAttribute('aria-live', 'polite');
          anchor.parentNode.insertBefore(d.box, anchor.nextSibling);
        }
        var n = solved(d) ? 0 : level(d.id);
        d.box.style.display = n ? '' : 'none';
        d.box.textContent = '';
        for (var i = 0; i < n; i++) {
          var p = document.createElement('p');
          p.className = 'hint-ladder-note' + (i === n - 1 && fresh ? ' is-new' : '');
          var tag = document.createElement('span');
          tag.className = 'hint-ladder-tag';
          tag.textContent = '✦ Hermes’s note ' + (i + 1) + ' of 3';
          p.appendChild(tag);
          p.appendChild(document.createTextNode(' ' + d.texts[i]));
          d.box.appendChild(p);
        }
      }

      setInterval(function () {
        if (document.visibilityState === 'hidden') return;
        order.forEach(function (id) {
          var d = defs[id];
          if (!playing(d)) { flush(d); return; }
          d.unsaved += TICK_S;
          if (d.unsaved >= SAVE_EVERY_S) flush(d);
          climb(d);
        });
      }, TICK_S * 1000);
      function flush(d) {
        if (!d.unsaved) return;
        set(key(d.id, 'secs'), String(num(key(d.id, 'secs')) + d.unsaved));
        d.unsaved = 0;
      }
      window.addEventListener('pagehide', function () { order.forEach(function (id) { flush(defs[id]); }); });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') order.forEach(function (id) { flush(defs[id]); });
      });

      // define({ id, station, title, group, texts: [l1, l2, l3], anchor, solved, active?, legacyKey?, onLevel? })
      function define(d) {
        d.unsaved = 0;
        if (!defs[d.id]) order.push(d.id);
        defs[d.id] = d;
        // Help Silvia already had before the ladder existed is never taken back
        if (d.legacyKey && get(d.legacyKey) === 'true' && level(d.id) < 2) set(key(d.id, 'level'), '2');
        draw(d, false);
        return {
          fail: function () { set(key(d.id, 'fails'), String(num(key(d.id, 'fails')) + 1)); climb(d); },
          level: function () { return level(d.id); },
          refresh: function () { draw(d, false); }
        };
      }

      // Ask Hermes keeps every note she has unlocked
      function inquiries() {
        return order.map(function (id) {
          var d = defs[id];
          return {
            id: 'inq-hints-' + id + '-' + level(id),   // a new note reads as unread again
            title: 'Hermes’s notes · ' + d.station + ', ' + d.title,
            category: d.station,
            group: d.group || 'desert',
            unlocked: function () { return level(id) > 0; },
            answer: d.texts.slice(0, level(id)).map(function (t, i) { return (i + 1) + '. ' + t; }).join(' ')
          };
        }).filter(function (q) { return q.unlocked(); });
      }

      // Tester: wipe the ladders of the given puzzles (by id prefix, e.g. 's20' or 's1')
      function reset(prefix) {
        order.forEach(function (id) {
          if (prefix && id.indexOf(prefix) !== 0) return;
          ['fails', 'secs', 'level'].forEach(function (p) { del(key(id, p)); });
          defs[id].unsaved = 0;
          draw(defs[id], false);
        });
      }

      return { define: define, inquiries: inquiries, reset: reset, level: level, ids: function () { return order.slice(); } };
    })();
