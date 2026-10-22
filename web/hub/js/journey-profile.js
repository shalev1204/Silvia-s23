    // The journey profile for the ending (docs/IDEAS_BACKLOG.md #13): the one place that says how Silvia played, so
    // the ending scenes of Tower I and the Vault and the report for Carles's handwritten letter
    // (scripts/audit/journey_report.py) read the same thing. It shows nothing on screen.
    // Sources: the tone she used with Hermes (hub-core.js), Hermes's notebook (order_journal), the walks' start times,
    // the solved games and rooms, the name she gave Hermes (Field Wire step 1) and the object she chose (step 2).
    window.EclipseJourney = (function () {
      'use strict';
      var DAY_MS = 86400000;
      var BANDS = [
        ['first light', 5, 10],
        ['full sun', 10, 18],
        ['lamplight', 18, 22],
        ['candlelight', 22, 29]   // 22:00 to 05:00
      ];
      var WALK_STARTS = ['order_chasm_march_start', 'order_monolith_march_start', 'order_labyrinth_march_start', 'order_cairn4_march_start',
        'order_cairn5_march_start', 'order_stele_march_start', 'order_masks_march_start'];

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function json(k) { try { return JSON.parse(get(k) || 'null'); } catch (e) { return null; } }
      function band(ms) {
        var h = new Date(ms).getHours();
        for (var i = 0; i < BANDS.length; i++) {
          if ((h >= BANDS[i][1] && h < BANDS[i][2]) || (h + 24 >= BANDS[i][1] && h + 24 < BANDS[i][2])) return BANDS[i][0];
        }
        return null;
      }
      function dayIndex(ms) { var d = new Date(ms); return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DAY_MS); }

      function profile() {
        var journal = json('order_journal') || {};
        var games = window.TesterDesert ? window.TesterDesert.games : [];
        var labels = {};
        games.forEach(function (g) { labels[g.id] = g.label; });
        var stamps = [], notes = 0, fails = 0, perBand = {}, swiftest = null;
        Object.keys(journal).forEach(function (id) {
          var p = journal[id];
          if (!p || !p.at) return;
          stamps.push(p.at);
          if (p.arrived) stamps.push(p.arrived);
          notes += p.notes || 0;
          fails += p.fails || 0;
          var b = band(p.at);
          if (b) perBand[b] = (perBand[b] || 0) + 1;
          if (p.arrived && p.at > p.arrived && (!swiftest || p.at - p.arrived < swiftest.minutes * 60000)) {
            swiftest = { id: id, label: labels[id] || id, minutes: Math.round((p.at - p.arrived) / 60000) };
          }
        });
        WALK_STARTS.forEach(function (k) { var t = parseInt(get(k) || '0', 10); if (t > 1e12) stamps.push(t); });
        var hour = null;
        BANDS.forEach(function (b) { if (perBand[b[0]] && (!hour || perBand[b[0]] > perBand[hour])) hour = b[0]; });
        var rooms = window.StageMirror ? window.StageMirror.stations : [];
        var stageFlags = rooms.map(function (s) { return s.flag; });
        // the tester's list holds Station 20 too: the rooms of Tower III are counted once, apart
        var desert = games.filter(function (g) { return stageFlags.indexOf(g.flag) < 0 && window.TesterDesert.isDone(g.id); }).length;
        var stage = rooms.filter(function (s) { return get(s.flag) === 'true'; }).length;
        var name = typeof window.hermesWireChoice === 'function' ? window.hermesWireChoice(1) : null;
        var item = json('order_satchel_expedition_item');
        var start = stamps.length ? Math.min.apply(null, stamps) : null;
        var end = stamps.length ? Math.max.apply(null, stamps) : null;
        return {
          tone: typeof window.hermesDominantTone === 'function' ? window.hermesDominantTone() : 'warm',
          days: start ? dayIndex(end) - dayIndex(start) + 1 : 0,
          started: start,
          desertGames: desert,
          stageRooms: stage,
          rooms: desert + stage,
          notes: notes,
          fails: fails,
          hour: hour,
          swiftest: swiftest,
          name: name && name.nameTitle ? name.nameTitle : null,
          item: item && item.name ? item.name : null
        };
      }

      return { profile: profile };
    })();
