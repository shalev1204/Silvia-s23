    // Hermes's Field Notebook (docs/IDEAS_BACKLOG.md #2), at the foot of Chronicles. One page per solved game of the
    // Desert Path, in Hermes's voice: when Silvia solved it (and how long after he got there), what it gave, how she
    // solved it (misses and Hermes's notes from the hint ladder), a sketch and a line he sent on the Field Wire.
    // State: order_journal = { gameId: { at, fails, notes, arrived } }, written the moment a game is seen going from
    // unsolved to solved (it travels with the cloud save). A game already solved when the notebook first saw it gets
    // an undated page. A tester reset that unsolves a game tears its page out.
    window.EclipseNotebook = (function () {
      'use strict';
      var KEY = 'order_journal';
      var POLL_MS = 1500;
      var HINT_PREFIX = { cairn1: 'cairn1-', chasm: 's10-', playa: 's11-', lexicon: 's12-', clepsydra: 's13-' };
      // Walks that end at a game: start key and hours (a skipped walk has no arrival time)
      var WALKS = {
        chasm: ['order_chasm_march_start', 'order_chasm_march_bypassed', 26],
        s14: ['order_monolith_march_start', 'order_monolith_march_bypassed', 12],
        s15: ['order_labyrinth_march_start', 'order_labyrinth_march_bypassed', 6],
        s16: ['order_cairn4_march_start', 'order_cairn4_march_bypassed', 18],
        s17: ['order_cairn5_march_start', 'order_cairn5_march_bypassed', 18],
        s18: ['order_stele_march_start', 'order_stele_march_bypassed', 6],
        s20: ['order_masks_march_start', 'order_masks_march_bypassed', 18]
      };
      var T = './assets/thumbnails/';
      var PAGES = {
        cairn1: {
          note: 'Wash River, at dawn. Four river stones lifted and set down again on Silvia’s word, and the base opened. A sandstone disc, a sun above a wavy line: the Wash River seal, now in my satchel.',
          quote: 'The last stone settled and the whole base gave a soft click, as if the river itself had exhaled.',
          earned: ['Seal of Cairn I'], sketch: './assets/chat/sketch_cairn_one.webp'
        },
        chasm: {
          note: 'The Whispering Chasm. A maze of red walls, and a voice on the wire telling me which markers to trust. I came out the far side with all my water.',
          earned: ['The way through the gorge'], sketch: './assets/chat/sketch_chasm_mouth.webp'
        },
        playa: {
          note: 'The Salt Playa. Every slab looked solid, and half of them were not. Silvia read the facets, I walked where she said, and the crust held.',
          earned: ['A safe road across the salt'], sketch: T + 'salt_playa_preview.webp'
        },
        lexicon: {
          note: 'Camp VII, among the nomad steles. Silvia read their words and the Al-Qibla bearing locked: from here on, we know the road to Tower II.',
          earned: ['The Al-Qibla bearing'], ledger: ['The Stargazer Proportion'], sketch: T + 'desert_lexicon_preview.webp'
        },
        clepsydra: {
          note: 'Camp VIII, the Four Wells. Four seekers, four shadow-hours, four counterweights. When the last one dropped, the basins filled and we drank.',
          ledger: ['The Falcon Inscription'], sketch: T + 'oasis_clepsydra_preview.webp'
        },
        s14: {
          note: 'The Sun Monolith, Cairn II. The sun walked across the dial and the lid gave way. On the rim of the niche, a smear of cobalt blue. I know that blue.',
          quote: 'Someone who did not force the stone. Someone who knew how to wait for the sun.',
          earned: ['Seal of Cairn II'], ledger: ['The Deneb Line', 'The Cygnus Line'], sketch: T + 'sun_monolith_preview.webp'
        },
        s15: {
          note: 'The Sandstone Labyrinth, Cairn III. Torches in the passages, and Silvia always one turn ahead of them. The seal is wrapped in my scarf, and they never saw my face.',
          quote: 'Either the sun is cooking my mind, or someone walks these cairns ahead of me.',
          earned: ['Seal of Cairn III'], ledger: ['The West Wind Line', 'The Wind Rose Line'], sketch: T + 'sandstone_labyrinth_preview.webp'
        },
        s16: {
          note: 'Cairn IV, between the singing pillars. The song opened the chamber, and in the throat of the Left pillar lay a pebble painted with a gold star on blue.',
          quote: 'SUN, ECHO, STONE: the cairns are instruments, and the Order measured the whole desert with them.',
          earned: ['Seal of Cairn IV', 'The Tuning Pebble'], ledger: ['The Rising Echo', 'The Falling Echo'], sketch: T + 'cairn_iv_preview.webp'
        },
        s17: {
          note: 'The Arch of the Solstice, Cairn V. An October sun in a courtyard built for June, and Silvia made it reach the altar anyway. Five seals sewn into my coat.',
          quote: 'The smoke still standing over Tower II like a black tree.',
          earned: ['Seal of Cairn V', 'The Signal Mirror'], ledger: ['The First Line of Light', 'The Second Line of Light'], sketch: T + 'solstice_arch_preview.webp'
        },
        s18: {
          note: 'Tower II, in flames. The stele first, then the knocks, then the burning atrium, flagstone by flagstone. At the end of it, the Servant, alive by the well.',
          quote: 'She came from the edge of the sky with a disc in her arms and no name.',
          earned: ['The Servant’s Key'], ledger: ['The Line of the Well', 'The Line of the Hatch'], sketch: T + 'polybius_stele_preview.webp'
        },
        s19: {
          note: 'The inner chamber of Tower II. Behind the door, humming, was Aurelia. Fifty-five years. And her disc gave Silvia the first truth.',
          quote: 'When she says my name she says it carefully, the way you carry something full to the brim.',
          earned: ['The Gilded Star', 'The WHEN'], ledger: ['The Line of the Rim', 'The Line of the Heart'], sketch: T + 'oracle_horizon_preview.webp'
        },
        s20: {
          note: 'Tower III, the Gate of a Thousand Masks. The wall opened like a curtain, and the first piece of the Mirror Speaker’s mirror is in my hands.',
          quote: 'Cold, heavy, with a little moon in it that is not in the sky.',
          earned: ['Fragment I of the mirror'], sketch: T + 'masks_gate_preview.webp'
        }
      };

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function load() {
        var j = null;
        try { j = JSON.parse(get(KEY) || 'null'); } catch (e) { j = null; }
        return j && typeof j === 'object' ? j : {};
      }
      function save(j) { try { localStorage.setItem(KEY, JSON.stringify(j)); } catch (e) {} }
      function games() { return window.TesterDesert ? window.TesterDesert.games : []; }
      function isDone(id) { return !!(window.TesterDesert && window.TesterDesert.isDone(id)); }
      function num(k) { return parseInt(get(k) || '0', 10) || 0; }

      // Misses and Hermes's notes, summed over the game's puzzles on the hint ladder
      function effort(id) {
        var prefix = HINT_PREFIX[id] || id + '-', fails = 0, notes = 0;
        (window.EclipseHints ? window.EclipseHints.ids() : []).forEach(function (h) {
          if (h.indexOf(prefix) !== 0) return;
          fails += num('order_hint_' + h + '_fails');
          notes += num('order_hint_' + h + '_level');
        });
        return { fails: fails, notes: notes };
      }
      function arrival(id) {
        var w = WALKS[id];
        if (!w || get(w[1]) === 'true') return null;
        var start = num(w[0]);
        return start > 1e12 ? start + w[2] * 3600 * 1000 : null;   // the tester's "complete" writes a start of 1
      }

      // ---- Watching for games that become solved (and for tester resets that unsolve them)
      var seenDone = {};
      games().forEach(function (g) { seenDone[g.id] = isDone(g.id); });
      function watch() {
        var j = load(), changed = false;
        games().forEach(function (g) {
          var done = isDone(g.id);
          if (done && !seenDone[g.id] && !(j[g.id] && j[g.id].at)) {
            var e = effort(g.id);
            j[g.id] = { at: Date.now(), fails: e.fails, notes: e.notes, arrived: arrival(g.id) };
            changed = true;
          } else if (!done && j[g.id]) {
            delete j[g.id];
            changed = true;
          }
          seenDone[g.id] = done;
        });
        if (changed) save(j);
        if (changed || !rendered) render();
      }

      // ---- The pages
      function when(ms) {
        var d = new Date(ms);
        try {
          return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' +
            d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        } catch (e) { return d.toDateString(); }
      }
      function span(ms) {
        var min = Math.round(ms / 60000);
        if (min < 60) return min + ' min';
        var h = Math.floor(min / 60);
        if (h >= 48) return Math.round(h / 24) + ' days';
        return h + ' h' + (min % 60 ? ' ' + String(min % 60).padStart(2, '0') + ' min' : '');
      }
      function how(r) {
        var miss = r.fails === 1 ? 'one miss' : r.fails + ' misses';
        var notes = r.notes === 1 ? 'one of my notes' : r.notes + ' of my notes';
        var text = r.fails === 0 && r.notes === 0 ? 'Solved at the first try, without a single note from me.'
          : r.fails === 0 ? 'Solved without a single miss, with ' + notes + '.'
          : 'Solved after ' + miss + (r.notes ? ', with ' + notes + '.' : ', without a single note from me.');
        if (r.arrived && r.at > r.arrived) text += ' ' + span(r.at - r.arrived) + ' after I got there.';
        return text;
      }
      function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
      }

      var rendered = false;
      function render() {
        var box = document.getElementById('field-notebook');
        if (!box) return;
        rendered = true;
        var j = load();
        var list = box.querySelector('.notebook-pages');
        list.textContent = '';
        var count = 0;
        games().forEach(function (g) {
          if (!isDone(g.id)) return;
          var p = PAGES[g.id] || {}, r = j[g.id];
          var page = el('article', 'notebook-page');
          page.setAttribute('data-game', g.id);
          if (p.sketch) {
            var fig = el('div', 'notebook-sketch');
            var img = el('img');
            img.src = p.sketch;
            img.alt = 'Hermes’s sketch: ' + g.label;
            img.loading = 'lazy';
            fig.appendChild(img);
            page.appendChild(fig);
          }
          var body = el('div', 'notebook-body');
          body.appendChild(el('div', 'notebook-date', r && r.at ? when(r.at) : 'Before this notebook was opened'));
          body.appendChild(el('h3', 'notebook-title', g.tag + ' · ' + g.label));
          if (p.note) body.appendChild(el('p', 'notebook-note', p.note));
          if (p.quote) {
            var q = el('blockquote', 'notebook-quote', '“' + p.quote + '”');
            q.appendChild(el('span', 'notebook-quote-src', ' (on the Field Wire)'));
            body.appendChild(q);
          }
          var gains = (p.earned || []).slice();
          if (p.ledger) gains.push('Cipher Ledger: ' + p.ledger.join(' · '));
          if (gains.length) {
            var ul = el('ul', 'notebook-earned');
            gains.forEach(function (x) { ul.appendChild(el('li', null, x)); });
            body.appendChild(ul);
          }
          if (r && r.at) body.appendChild(el('p', 'notebook-how', how(r)));
          page.appendChild(body);
          list.appendChild(page);
          count++;
        });
        box.querySelector('.notebook-empty').style.display = count ? 'none' : '';
      }

      watch();
      setInterval(watch, POLL_MS);

      return { render: render, pages: function () { return load(); } };
    })();
