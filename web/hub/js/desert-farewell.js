    // The end of the Desert Path (the Operator's decision of 19 Nov 2026). After Hermes's last talk from Tower II (Field Wire, step 32),
    // closing the chapter first plays three things, once:
    //   1. "Dawn at the gates": the farewell at the bronze doors, in the scene of the gates (s13b-gates-tower-ii.js, mode 'farewell');
    //   2. "The Desert Path, walked": the whole road in gold, what she brought back, what the satchel gave and what she chose;
    //   3. the curtain: it closes over the desert and opens on the ceremony of the next chapter (wire-ceremony.js).
    // Station 19 sets order_desert_farewell_pending when it is won; until the farewell is done the Stage Path stays off the map.
    // A save that finished Station 19 before this existed has no such mark and goes on as before.
    window.DesertFarewell = (function () {
      'use strict';
      var PENDING = 'order_desert_farewell_pending', KEY = 'order_desert_farewell';
      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
      function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
      function json(k, d) { try { var v = JSON.parse(get(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
      var reduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };
      var fast = function () { return !!window.__wireFast; };
      function cue(kind, o) { try { var a = window.EclipseAmbience; return !!(a && a.sfx && a.sfx(kind, o)); } catch (e) { return false; } }
      function chime() { try { if (!cue('reveal') && window.sfx && window.sfx.playCelestialChime) window.sfx.playCelestialChime(); } catch (e) {} }

      var state = function () { return json(KEY, {}); };
      var done = function () { return !!state().done; };
      var pending = function () { return get(PENDING) === 'true' && !done(); };

      // ---- the road as she walked it: a ribbon of twelve places, in order ----
      var ROAD = [   // at: where it sits on the ribbon; lab: where its name goes from there
        { name: 'Cairn I', flag: 'order_cairn1_completed', at: [40, 205], lab: [0, 24], seal: 1 },
        { name: 'Whispering Chasm', flag: 'order_whispering_chasm_completed', at: [118, 170], lab: [0, -13] },
        { name: 'Salt Playa', flag: 'order_salt_playa_completed', at: [200, 205], lab: [0, 22] },
        { name: 'Desert Lexicon', flag: 'order_desert_lexicon_completed', at: [284, 170], lab: [0, -13] },
        { name: 'Four Wells', flag: 'order_oasis_clepsydra_completed', at: [368, 205], lab: [0, 22] },
        { name: 'Gates of Tower II', flag: 'order_gates_scene_completed', at: [452, 170], lab: [0, -13] },
        { name: 'Sun Monolith', flag: 'order_sun_monolith_completed', at: [560, 128], lab: [18, 26], seal: 2 },
        { name: 'Labyrinth', flag: 'order_sandstone_labyrinth_completed', at: [470, 84], lab: [0, 26], seal: 3 },
        { name: 'Cairn IV', flag: 'order_cairn_iv_completed', at: [378, 52], lab: [0, -16], seal: 4 },
        { name: 'Arch of the Solstice', flag: 'order_arch_solstice_completed', at: [286, 84], lab: [0, 26], seal: 5 },
        { name: 'Tower II in flames', flag: 'order_polybius_stele_completed', at: [194, 52], lab: [0, -13] },
        { name: 'The Oracle', flag: 'order_oracle_horizon_completed', at: [100, 84], lab: [0, 24] }
      ];
      function roadSvg() {
        var pts = ROAD.map(function (r) { return r.at; });
        // a soft curve through every place
        var d = 'M' + pts[0][0] + ' ' + pts[0][1];
        for (var i = 1; i < pts.length; i++) {
          var a = pts[i - 1], b = pts[i], mx = (a[0] + b[0]) / 2;
          d += ' C ' + mx + ' ' + a[1] + ', ' + mx + ' ' + b[1] + ', ' + b[0] + ' ' + b[1];
        }
        var nodes = ROAD.map(function (r, k) {
          var t = (0.9 + k * 0.36).toFixed(2);
          return '<g class="dfw-node' + (r.seal ? ' is-seal' : '') + (get(r.flag) === 'true' ? '' : ' is-missing') + '" style="--t:' + t + 's">'
            + '<circle cx="' + r.at[0] + '" cy="' + r.at[1] + '" r="' + (r.seal ? 9 : 6.5) + '"/>'
            + (r.seal ? '<text class="dfw-roman" x="' + r.at[0] + '" y="' + (r.at[1] + 3.6) + '">' + ['', 'I', 'II', 'III', 'IV', 'V'][r.seal] + '</text>' : '')
            + '<text class="dfw-name" x="' + (r.at[0] + r.lab[0]) + '" y="' + (r.at[1] + r.lab[1]) + '">' + r.name + '</text></g>';
        }).join('');
        return '<svg viewBox="0 0 640 238" role="img" aria-label="The Desert Path as you walked it: from Cairn I by the dry wash to the Oracle of Tower II, twelve places and five seals">'
          + '<path class="dfw-road-shade" d="' + d + '"/>'
          + '<path class="dfw-road" pathLength="1" d="' + d + '"/>'
          + nodes + '</svg>';
      }
      function count(list) { return list.filter(function (k) { return get(k) === 'true'; }).length; }
      function len(key) { var l = json(key, []); return Array.isArray(l) ? l.length : 0; }
      function choiceLines() {
        var out = [], R = window.GatesRoad, fw = state();
        var tone = R && R.tone ? R.tone() : null, ret = R && R.returnState ? R.returnState() : {};
        out.push(tone === 'bold' ? 'You sent Hermes straight at the Servant, and he respected it.'
          : tone === 'observer' ? 'You had Hermes look at everything before he spoke.'
          : 'You had Hermes bow at the gates, and wait.');
        var END = {
          keepers: 'The stone keepers were paid, and the bronze doors opened by themselves.',
          trusted: 'The Servant held the founders’ small door for you: the door of the trusted.',
          bold: 'The bronze doors flew open with a boom.',
          observer: 'The bronze doors parted without a sound.',
          humble: 'The Servant bowed first, and opened the doors with his own hands.'
        };
        if (ret && ret.ending && END[ret.ending]) out.push(END[ret.ending]);
        if (fw.veil) out.push('Aurelia left the Oracle’s veil in the Servant’s hands.');
        if (fw.cord) out.push('The Servant tied a thirteenth knot in the red cord.');
        if (fw.compass) out.push('Aurelia set the compass true: two degrees east.');
        if (fw.flint) out.push('The flint stayed with the Servant, for his lamp.');
        return out;
      }

      var box = null;
      function build() {
        if (box) return box;
        box = document.createElement('div');
        box.className = 'dfw';
        box.id = 'desert-farewell';
        box.hidden = true;
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-labelledby', 'dfw-title');
        document.body.appendChild(box);
        // the recap holds the keyboard while it is open
        document.addEventListener('keydown', function (e) {
          if (!box || box.hidden) return;
          if (e.key === 'Tab') { e.preventDefault(); var b = box.querySelector('.dfw-go'); if (b) b.focus(); }
          else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); }   // it ends by its button: the curtain is part of it
        }, true);
        return box;
      }
      // "The Desert Path, walked"
      function showRecap(onDone) {
        build();
        var seals = count(['order_seal_cairn_1', 'order_seal_cairn_2', 'order_seal_cairn_3', 'order_seal_cairn_4', 'order_seal_cairn_5']);
        var places = count(ROAD.map(function (r) { return r.flag; }));
        var finds = len('order_labyrinth_finds') + len('order_stele_finds');
        var gave = window.RelicUse ? window.RelicUse.spent().length : 0;
        var lines = choiceLines().map(function (l, i) { return '<li style="--t:' + (5.6 + i * 0.3).toFixed(2) + 's">' + l + '</li>'; }).join('');
        box.innerHTML = '<div class="dfw-sky" aria-hidden="true"></div>'
          + '<div class="dfw-card">'
          + '<div class="dfw-kicker">Path II · The Sandstone Sanctuary</div>'
          + '<h2 class="dfw-title" id="dfw-title">The Desert Path, walked</h2>'
          + '<p class="dfw-sub">From a dry wash to the door of an Oracle: every place Hermes stood, and you with him on the wire.</p>'
          + '<div class="dfw-map">' + roadSvg() + '</div>'
          + '<div class="dfw-stats">'
          + '<div style="--t:4.6s"><b>' + places + '/' + ROAD.length + '</b><span>places</span></div>'
          + '<div style="--t:4.8s"><b>' + seals + '/5</b><span>seals in the arch</span></div>'
          + '<div style="--t:5.0s"><b>' + finds + '/6</b><span>hidden finds</span></div>'
          + '<div style="--t:5.2s"><b>' + gave + '</b><span>things the satchel gave</span></div>'
          + '</div>'
          + '<div class="dfw-truth"><span>The First Truth · the WHEN</span><strong>18 – 20 December</strong></div>'
          + '<div class="dfw-label">How you walked it</div>'
          + '<ul class="dfw-lines">' + lines + '</ul>'
          + '<p class="dfw-motto">“The road ends where the curtain rises.”</p>'
          + '<button type="button" class="dfw-go">✦ Raise the curtain</button>'
          + '</div>';
        box.hidden = false;
        box.scrollTop = 0;
        box.classList.remove('is-on');
        void box.offsetWidth;
        box.classList.add('is-on');
        document.body.classList.add('dfw-on');
        chime();
        var go = box.querySelector('.dfw-go');
        go.addEventListener('click', function () {
          go.disabled = true;
          curtain(function () {
            box.hidden = true; box.classList.remove('is-on'); document.body.classList.remove('dfw-on');
            if (typeof onDone === 'function') onDone();
          });
        });
        setTimeout(function () { try { go.focus({ preventScroll: true }); } catch (e) {} }, 80);
      }
      // two curtains close over the desert; what comes next is set behind them, and then they part
      function curtain(mid) {
        if (reduced() || fast()) { mid(); return; }
        var c = document.createElement('div');
        c.className = 'dfw-curtain';
        c.setAttribute('aria-hidden', 'true');
        c.innerHTML = '<i class="is-left"></i><i class="is-right"></i>';
        document.body.appendChild(c);
        cue('whoosh', { dur: 1.4 });
        void c.offsetWidth;
        c.classList.add('is-shut');
        setTimeout(function () {
          mid();
          setTimeout(function () {
            c.classList.remove('is-shut');
            setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 1300);
          }, 500);
        }, 1150);
      }

      // The whole event. `then` runs when the curtain has closed (the chapter ceremony starts there).
      function open(then) {
        var finish = function () {
          var s = state(); s.done = true; set(KEY, JSON.stringify(s)); del(PENDING);
          if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof then === 'function') then();
        };
        var afterScene = function () {
          // what she chose at the gates travels with the save
          try {
            var d = window.__gates && window.__gates.dlg ? window.__gates.dlg() : null, s = state();
            if (d && d.fw) { ['veil', 'cord', 'compass', 'flint'].forEach(function (k) { if (d.fw[k]) s[k] = true; }); set(KEY, JSON.stringify(s)); }
          } catch (e) {}
          showRecap(finish);
        };
        if (typeof window.openGatesTowerIIModal === 'function') window.openGatesTowerIIModal({ mode: 'farewell', onDone: afterScene });
        else afterScene();
      }

      return { pending: pending, done: done, state: state, open: open, recap: showRecap, markPending: function () { if (!done()) set(PENDING, 'true'); } };
    })();
