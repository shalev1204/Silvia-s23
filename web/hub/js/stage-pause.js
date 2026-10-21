    // Pauses on the Stage Path (docs/IDEAS_BACKLOG.md #3). After each fragment of the mirror, the next room of
    // Tower III stays shut for a number of hours of its own, so the rooms cannot be played back to back.
    // HOURS[node] is that wait, counted from the moment the previous room was solved (Hermes's notebook,
    // order_journal, hub/js/field-journal.js). Each room gets its hours when it is built, from its own story;
    // until then it is null, and a null wait (or a room solved before the notebook existed) means no wait.
    // While a room waits, its card and the Field Wire show "Opens in …"; Carles can open it at once
    // (order_stage_pause_skipped_<node>). Loaded before hub-core.js, which asks it when it draws a card.
    window.EclipseStagePause = (function () {
      'use strict';
      var HOURS = { 41: null, 42: null, 43: null, 44: null, 45: null, 46: null, 47: null, 48: null };

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function rooms() { return window.StageMirror ? window.StageMirror.stations : []; }

      // When the room before `node` was solved, from the notebook page of the game with that room's flag
      function solvedAt(flag) {
        var games = window.TesterDesert ? window.TesterDesert.games : [], journal = null, id = null;
        games.forEach(function (g) { if (g.flag === flag) id = g.id; });
        try { journal = JSON.parse(get('order_journal') || 'null'); } catch (e) { journal = null; }
        return id && journal && journal[id] && journal[id].at ? journal[id].at : 0;
      }

      // Milliseconds until the room at `node` opens (0: open, or not waiting for its fragment yet)
      function remaining(node) {
        var hours = HOURS[node], list = rooms(), i;
        if (!hours || get('order_stage_pause_skipped_' + node) === 'true') return 0;
        for (i = 1; i < list.length; i++) if (list[i].node === node) break;
        if (i >= list.length || get(list[i - 1].flag) !== 'true' || get(list[i].flag) === 'true') return 0;
        var at = solvedAt(list[i - 1].flag);
        return at ? Math.max(0, at + hours * 3600 * 1000 - Date.now()) : 0;
      }
      // "14 h 20 min" ('' when open)
      function opensIn(node) {
        var ms = remaining(node);
        if (!ms) return '';
        var min = Math.ceil(ms / 60000), h = Math.floor(min / 60);
        return (h ? h + ' h ' : '') + String(min % 60).padStart(h ? 2 : 1, '0') + ' min';
      }
      function skip(node) { try { localStorage.setItem('order_stage_pause_skipped_' + node, 'true'); } catch (e) {} }

      return { HOURS: HOURS, remaining: remaining, opensIn: opensIn, skip: skip };
    })();
