    // Using what is in the satchel (the Operator's decision of 18 Nov 2026: every relic has a use, and a used one is gone).
    // Two ways in, one rule:
    //   · Hermes asks (RelicUse.ask): at a set moment a tray of the satchel opens over the game. The right relic does
    //     its work; a wrong one gets a line from Hermes and the tray stays open. "Not now" closes it.
    //   · Use (the button in the satchel's inspector, RelicUse.offer): Silvia offers a relic on her own. If a tray is
    //     waiting for it, or a station has registered a use for it right now (RelicUse.register), it works; if not,
    //     Hermes says it is not the moment.
    // A relic used for good is spent (RelicUse.spend): it leaves the satchel for ever, with the card that says so.
    // The list of spent relics is order_relics_spent (a game key: it travels with the cloud save and the profiles).
    window.RelicUse = (function () {
      'use strict';
      var KEY = 'order_relics_spent';
      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
      function spentList() { try { var l = JSON.parse(get(KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
      function isSpent(id) { return spentList().indexOf(id) >= 0; }
      function owned() { return typeof window.getOwnedRelicIds === 'function' ? window.getOwnedRelicIds() : []; }
      function has(id) { return owned().indexOf(id) >= 0; }
      function card(id) { return (typeof window.getRelicCard === 'function' && window.getRelicCard(id)) || { id: id, name: id }; }
      function sfx(kind) { var s = window.sfx; try { if (kind === 'ok' && s && s.playCelestialChime) s.playCelestialChime(); else if (s && s.playMechanicalClick) s.playMechanicalClick(); } catch (e) {} }

      // What Hermes says when she hands him the wrong thing, and when she offers a relic with nothing waiting for it
      var WRONG = {
        gilded_feather: 'A feather, Silvia? Lovely. No use here, but lovely.',
        order_wax_seal: 'The Order’s seal opens one door only, and it is not this one.',
        surveyor_compass: 'The needle points north. Sadly, north is not what we need.',
        flint_tinder: 'A spark will not do it. Not this time.',
        spyglass_lens: 'I can see very far with it. Not that far.',
        water_skins: 'Water I have. That is not what is missing.',
        falcon_weight: 'The falcon is heavy and patient. It is waiting for somewhere else.',
        lamp_oil: 'Every drop of that oil is an hour of sight. Not here.',
        red_cord: 'Twelve knots, and not one of them helps with this.',
        servant_coin: 'The Servant’s coin has its own work to do. Not this.',
        ibis_figure: 'The ibis writes the hour by a river. There is no river here.',
        statue_seal: 'The keepers’ seal is for a door, not for this.',
        founders_lamp: 'Empty: I poured its oil into my own lamp in the labyrinth.',
        raiders_survey: 'Their map shows where the cairns are, not how to open them.',
        tuning_pebble: 'Not the pebble. That one I keep for someone.',
        signal_mirror: 'A mirror needs a sun or a signal. Not this.',
        servant_key: 'A key for a door we have not reached.',
        gilded_star: 'Not the star. That one is for the very end.'
      };
      var NOT_YET = {
        order_wax_seal: 'Not yet. The Order’s seal opens one door only, and we are far from it.',
        lamp_oil: 'I will burn it when the dark is worth it, Silvia.',
        falcon_weight: 'The falcon waits for its place in the desert.',
        tuning_pebble: 'Not yet. I keep it for someone.',
        gilded_star: 'Not yet. That one is for the very end.',
        raiders_survey: 'I will show it to someone who knows the Order’s hands.'
      };
      function wrongLine(id, extra) {
        if (extra && extra[id]) return extra[id];
        if (/^seal_cairn_/.test(id)) return 'The seals stay together, Silvia. Their door is the arch of Tower II.';
        if (/^mirror_fragment_/.test(id)) return 'The pieces of the mirror belong to Tower III.';
        return WRONG[id] || 'That will not help here, Silvia.';
      }
      function notYetLine(id) {
        if (/^seal_cairn_/.test(id)) return 'The seals go home together, to the arch of Tower II.';
        return NOT_YET[id] || 'Not here, Silvia. When it is needed, I will know.';
      }

      // ---- Spending ----
      function spend(id, opts, onDone) {
        opts = opts || {};
        if (isSpent(id)) { if (typeof onDone === 'function') onDone(); return; }
        var l = spentList(); l.push(id); set(KEY, JSON.stringify(l));
        var c = card(id);
        // silent: spent while she was elsewhere (a question on the Wire left unanswered); the satchel just loses it
        if (opts.silent) {
          if (typeof window.dropRelic === 'function') window.dropRelic(id);
          if (typeof window.updateInventoryBadge === 'function') window.updateInventoryBadge();
          if (typeof onDone === 'function') onDone();
          return;
        }
        if (typeof window.showItemRelinquishedAnimation === 'function') {
          window.showItemRelinquishedAnimation({
            id: id, name: c.name, category: c.category, image: c.image,
            tag: opts.tag || 'USED ON THE ROAD', origin: opts.origin || c.origin, lore: opts.lore || c.lore
          }, onDone);
        } else {
          if (typeof window.dropRelic === 'function') window.dropRelic(id);
          if (typeof onDone === 'function') onDone();
        }
      }
      // for the tester's resets: a station replayed from the start gets its relic back. Most relics come back by themselves
      // (the satchel derives them from the game's flags); `restore` puts back one that only lived in the satchel's own list.
      function unspend(id, restore) {
        var l = spentList(), i = l.indexOf(id);
        if (i < 0) return;
        l.splice(i, 1); set(KEY, JSON.stringify(l));
        if (restore) {
          try {
            var inv = JSON.parse(get('order_inventory_relics') || '[]');
            if (Array.isArray(inv) && inv.indexOf(id) < 0) { inv.push(id); set('order_inventory_relics', JSON.stringify(inv)); }
          } catch (e) {}
        }
        if (typeof window.syncLampOil === 'function') window.syncLampOil();
      }

      // ---- The tray: Hermes asks ----
      var tray = null, pending = null, backFocus = null;
      function build() {
        if (tray) return tray;
        tray = document.createElement('div');
        tray.className = 'relic-tray';
        tray.id = 'relic-tray';
        tray.hidden = true;
        tray.setAttribute('role', 'dialog');
        tray.setAttribute('aria-modal', 'true');
        tray.setAttribute('aria-labelledby', 'relic-tray-ask');
        tray.innerHTML = '<div class="rt-box">'
          + '<div class="rt-kicker"><span aria-hidden="true">🎒</span> <span class="rt-who">Hermes asks</span></div>'
          + '<p class="rt-ask" id="relic-tray-ask"></p>'
          + '<p class="rt-reply" aria-live="polite"></p>'
          + '<div class="rt-grid" role="list"></div>'
          + '<div class="rt-actions"><button type="button" class="rt-cancel"></button></div>'
          + '</div>';
        document.body.appendChild(tray);
        tray.querySelector('.rt-cancel').addEventListener('click', function () { close(true); });
        tray.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
          if (e.key === 'Tab') {   // the focus stays inside the tray
            var f = tray.querySelectorAll('button:not([disabled])');
            if (!f.length) return;
            if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
          }
        });
        return tray;
      }
      // (stations listen for Escape on the document, in the capture phase: this listener was added before theirs, so it runs first)
      document.addEventListener('keydown', function (e) {
        if (!tray || tray.hidden || e.key !== 'Escape') return;
        e.preventDefault(); e.stopImmediatePropagation();
        close(true);
      }, true);
      function wants(id) { return !!pending && pending.want.indexOf(id) >= 0; }
      function fill() {
        var grid = tray.querySelector('.rt-grid');
        grid.textContent = '';
        var ids = owned();
        if (!ids.length) {
          var empty = document.createElement('p');
          empty.className = 'rt-empty';
          empty.textContent = 'The satchel is empty.';
          grid.appendChild(empty);
        }
        ids.forEach(function (id) {
          var c = card(id);
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'rt-item';
          b.setAttribute('role', 'listitem');
          b.setAttribute('data-relic', id);
          b.setAttribute('aria-label', 'Hand Hermes ' + c.name);
          b.innerHTML = '<span class="rt-pic"><img alt="" loading="lazy"></span><span class="rt-name"></span>';
          b.querySelector('img').src = c.image || '';
          b.querySelector('.rt-name').textContent = String(c.name || id).replace(/^The /, '').split(' · ')[0];
          b.addEventListener('click', function () { pick(id, b); });
          grid.appendChild(b);
        });
      }
      function pick(id, btn) {
        if (!pending) return;
        if (wants(id)) { resolve(id); return; }
        sfx('no');
        var r = tray.querySelector('.rt-reply');
        r.textContent = '“' + wrongLine(id, pending.wrong) + '”';
        r.classList.remove('is-on'); void r.offsetWidth; r.classList.add('is-on');
        if (btn) { btn.classList.remove('is-wrong'); void btn.offsetWidth; btn.classList.add('is-wrong'); }
        if (pending.onWrong) { try { pending.onWrong(id); } catch (e) {} }
      }
      function resolve(id) {
        var p = pending;
        close(false);
        sfx('ok');
        if (p && p.onRight) { try { p.onRight(id); } catch (e) { console.warn('RelicUse onRight', e); } }
      }
      function close(cancelled) {
        if (!tray || tray.hidden) { pending = null; return; }
        var p = pending;
        pending = null;
        tray.classList.remove('is-on');
        tray.hidden = true;
        if (backFocus && backFocus.focus) { try { backFocus.focus({ preventScroll: true }); } catch (e) {} }
        backFocus = null;
        if (cancelled && p && p.onCancel) { try { p.onCancel(); } catch (e) { console.warn('RelicUse onCancel', e); } }
      }
      // ask({ ask, want: id | [ids], wrong?: {id: line}, cancel?: label, who?: label, onRight(id), onCancel(), onWrong(id) })
      function ask(opts) {
        build();
        pending = {
          want: [].concat(opts.want || []), wrong: opts.wrong || null,
          onRight: opts.onRight, onCancel: opts.onCancel, onWrong: opts.onWrong
        };
        tray.querySelector('.rt-who').textContent = opts.who || 'Hermes asks';
        tray.querySelector('.rt-ask').textContent = '“' + (opts.ask || 'What do we have in the satchel, Silvia?') + '”';
        tray.querySelector('.rt-reply').textContent = '';
        tray.querySelector('.rt-cancel').textContent = opts.cancel || 'Not now';
        fill();
        backFocus = document.activeElement;
        tray.hidden = false;
        void tray.offsetWidth;
        tray.classList.add('is-on');
        sfx('open');
        var first = tray.querySelector('.rt-item') || tray.querySelector('.rt-cancel');
        if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, 40);
      }

      // ---- Use: a relic offered from the satchel ----
      var uses = {};
      function register(id, fn) { (uses[id] = uses[id] || []).push(fn); }
      // Returns { used: true } when something took it, or { used: false, line } with what Hermes says
      function offer(id) {
        if (wants(id)) {
          if (typeof window.closeSatchelInventoryModal === 'function') window.closeSatchelInventoryModal();
          resolve(id);
          return { used: true };
        }
        var list = uses[id] || [];
        for (var i = 0; i < list.length; i++) {
          var r = false;
          try { r = list[i](id); } catch (e) { console.warn('RelicUse use', e); }
          if (r) {
            if (typeof window.closeSatchelInventoryModal === 'function') window.closeSatchelInventoryModal();
            return { used: true };
          }
        }
        return { used: false, line: notYetLine(id) };
      }

      // the Use button in the satchel's inspector
      function wireUseButton() {
        var btn = document.getElementById('btn-si-use');
        if (!btn || btn.__wired) return;
        btn.__wired = true;
        btn.addEventListener('click', function () {
          var id = typeof window.getSelectedRelicId === 'function' ? window.getSelectedRelicId() : null;
          if (!id) return;
          var res = offer(id);
          if (res.used) return;
          sfx('no');
          var note = document.getElementById('si-hermes-note'), box = document.getElementById('si-hermes-note-box');
          if (note) note.textContent = res.line;
          if (box) { box.classList.remove('is-flash'); void box.offsetWidth; box.classList.add('is-flash'); }
        });
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireUseButton);
      else wireUseButton();

      return {
        spent: spentList, isSpent: isSpent, has: has, spend: spend, unspend: unspend,
        ask: ask, close: function () { close(true); }, isOpen: function () { return !!tray && !tray.hidden; },
        offer: offer, register: register, wrongLine: wrongLine
      };
    })();
