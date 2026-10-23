    // The seals of the Stage Path sheets (docs/IDEAS_BACKLOG.md #14). Each game face of Sheets 20 to 26 carries an
    // engraved seal with a QR code (scripts/journal/sheet_seal.py). The QR opens the Hub with ?seal=CODE and that
    // turns the key of its room: until Silvia scans the seal of the sheet in her hands, the room's door stays shut.
    // SEALS[node] is the hash of the room's code, pasted when the room is built and its sheet printed; until then
    // it is null and the room needs no seal. A seal can be scanned early: the key is kept (order_sheet_seal_<node>)
    // and the door opens when its turn comes. Carles can open it at once, like a pause (hub/js/stage-pause.js).
    // Loaded before hub-core.js, which asks it when it draws a card.
    window.EclipseSheetSeals = (function () {
      'use strict';
      var SEALS = { 41: '9682e2b4', 42: 'a5cfd3a9', 43: null, 44: null, 45: null, 46: null, 47: null, 48: null };
      var FACE = { 41: '20A', 42: '20B', 43: '21B', 44: '22A', 45: '23A', 46: '24A', 47: '25A', 48: '26A' };
      // The printed title of each face: the player never sees sheet numbers, only titles
      var TITLE = { 41: 'The Camera Obscura', 42: 'The Whispering Gallery', 43: 'The Automaton Orchestra' };
      function page(node) { return TITLE[node] ? 'the page “' + TITLE[node] + '”' : 'its page in your journal'; }

      function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
      function rooms() { return window.StageMirror ? window.StageMirror.stations : []; }
      // 32-bit FNV-1a, as sheet_seal.py: the Hub keeps only the hash of each code
      function hash(text) {
        var h = 0x811c9dc5;
        for (var i = 0; i < text.length; i++) {
          h ^= text.charCodeAt(i);
          h = Math.imul(h, 0x01000193) >>> 0;
        }
        return ('0000000' + h.toString(16)).slice(-8);
      }
      function has(node) { return get('order_sheet_seal_' + node) === 'true'; }
      function turn(node) { try { localStorage.setItem('order_sheet_seal_' + node, 'true'); } catch (e) {} }

      // The face whose seal the room at `node` is waiting for ('' when it needs none, has it, or it is not its turn)
      function missing(node) {
        if (!SEALS[node] || has(node)) return '';
        var list = rooms(), i;
        for (i = 1; i < list.length; i++) if (list[i].node === node) break;
        if (i >= list.length || get(list[i - 1].flag) !== 'true' || get(list[i].flag) === 'true') return '';
        return FACE[node];
      }

      // A scanned code: the node whose key it turns, or null
      function accept(code) {
        var c = String(code || '').toUpperCase().replace(/[^A-Z]/g, ''), h = hash(c), node = null;
        if (!c) return null;
        Object.keys(SEALS).forEach(function (n) { if (SEALS[n] && SEALS[n] === h) node = parseInt(n, 10); });
        if (node) turn(node);
        return node;
      }

      // Opening the Hub from a seal: turn the key, take the code out of the address, and go to the room
      function fromAddress() {
        var params, code;
        try { params = new URLSearchParams(window.location.search); code = params.get('seal'); } catch (e) { return; }
        if (code === null) return;
        params.delete('seal');
        try {
          var q = params.toString();
          window.history.replaceState(null, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash);
        } catch (e) {}
        var node = accept(code);
        var toast = function (msg) { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); };
        if (!node) { toast('✦ This seal belongs to no door of Tower III ✦'); return; }
        var st = rooms().filter(function (s) { return s.node === node; })[0];
        toast('✦ The seal of ' + page(node) + ' turns in its lock: ' + (st ? st.room : 'a room of Tower III') + ' ✦');
        if (typeof window.switchMapPath === 'function' && get('order_oracle_horizon_completed') === 'true') window.switchMapPath('stage', false);
        if (typeof window.selectMapNode === 'function') window.selectMapNode(node, true);
      }
      window.addEventListener('load', fromAddress);

      return { SEALS: SEALS, hash: hash, missing: missing, accept: accept, skip: turn, page: page, face: function (node) { return FACE[node] || ''; } };
    })();
