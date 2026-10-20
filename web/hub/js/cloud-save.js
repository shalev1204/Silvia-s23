    // Cloud save (docs/IDEAS_BACKLOG.md #19 and #22). Loaded in <head>, before any script writes localStorage.
    // Every write to a game key (anything that is not a device setting) is noticed here; 2 s after the last
    // change the whole journey is sent to Supabase as one snapshot, with the changed keys as events.
    // A browser with no journey (new device, cleared data) first asks the cloud for the seeker's latest save,
    // restores it and reloads. Until that question has been answered once on this device, nothing is sent,
    // so a fresh, empty start can never become the "latest save" and hide the real one.
    // Runs only on the published site (https) and never in tester/admin URLs, so the Operator's file:// copy
    // and the smoke tests cannot write to Silvia's journey. ?cloud=1 forces it on (smoke), ?cloud=0 off.
    window.EclipseCloud = (function () {
      'use strict';
      var CFG = window.ECLIPSE_CLOUD || {};
      var HUB_VERSION = '2026-10-20';
      var QUEUE = 'eclipse_cloud_queue';          // events waiting for the network (device key)
      var READY = 'eclipse_cloud_ready_';          // + seeker: this device has asked the cloud once
      var DEVICE_KEYS = ['the_eclipse_active_seeker', 'the_eclipse_gate_ok_at', 'hub_sidebar_collapsed'];
      var SEEKERS = { silvia: true, carles: true };
      var DEBOUNCE_MS = 2000, MAX_WAIT_MS = 10000, RETRY_MS = 15000;

      var params = new URLSearchParams(location.search);
      var forced = params.get('cloud');
      var testerUrl = ['admin', 'tester', 'carles', 'dev'].some(function (p) { return params.has(p); });
      var enabled = !!(CFG.url && CFG.key) && forced !== '0' &&
        (forced === '1' || (location.protocol === 'https:' && !testerUrl));

      var store = window.localStorage;
      var rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem;
      function get(k) { try { return store.getItem(k); } catch (e) { return null; } }
      function put(k, v) { try { rawSet.call(store, k, v); } catch (e) {} }
      function isDeviceKey(k) {
        return DEVICE_KEYS.indexOf(k) >= 0 || k.indexOf('eclipse_profile_vault_') === 0 || k.indexOf('eclipse_cloud_') === 0;
      }
      function seeker() {
        var s = String(get('the_eclipse_active_seeker') || '').toLowerCase();
        return SEEKERS[s] ? s : null;
      }
      function journey() {
        var out = {}, i, k;
        for (i = 0; i < store.length; i++) {
          k = store.key(i);
          if (k && !isDeviceKey(k)) out[k] = store.getItem(k);
        }
        return out;
      }
      function hasJourney() { return Object.keys(journey()).length > 0; }

      var state = { enabled: enabled, restoring: false, sending: false, lastError: null, lastSentAt: null };
      if (!enabled) return { state: state };

      // ---- Events (#22): one per changed game key, collapsed to the last value within each send
      var pending = {}, dirty = false, firstDirtyAt = 0, timer = null;
      var held = false;   // the page is about to reload into another journey: stop noticing and sending
      var frozen = false; // restored keys are on disk: the Hub still booting underneath must not overwrite them
      var queue = [];
      try { queue = JSON.parse(get(QUEUE) || '[]'); } catch (e) { queue = []; }
      if (!Array.isArray(queue)) queue = [];

      function note(kind, key, value, removed) {
        var s = seeker();
        if (!s || held) return;
        var id = kind + ':' + (key || '');
        pending[id] = { seeker: s, client_at: new Date().toISOString(), kind: kind, key: key || null,
          value: value == null ? null : String(value).slice(0, 4000), removed: !!removed };
        dirty = true;
        if (!firstDirtyAt) firstDirtyAt = Date.now();
        schedule();
      }
      function schedule() {
        clearTimeout(timer);
        var wait = Math.max(0, Math.min(DEBOUNCE_MS, firstDirtyAt + MAX_WAIT_MS - Date.now()));
        timer = setTimeout(send, wait);
      }

      Storage.prototype.setItem = function (k, v) {
        if (frozen && this === store && !isDeviceKey(String(k))) return;
        var before = this === store ? this.getItem(k) : null;
        rawSet.apply(this, arguments);
        if (this === store && !isDeviceKey(String(k)) && before !== String(v)) note('key', String(k), v, false);
      };
      Storage.prototype.removeItem = function (k) {
        if (frozen && this === store && !isDeviceKey(String(k))) return;
        var had = this === store && this.getItem(k) !== null;
        rawRemove.apply(this, arguments);
        if (had && !isDeviceKey(String(k))) note('key', String(k), null, true);
      };

      // ---- Network
      function call(path, body, keepalive) {
        return fetch(CFG.url.replace(/\/+$/, '') + '/rest/v1/' + path, {
          method: 'POST', keepalive: !!keepalive,
          headers: { 'apikey': CFG.key, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(body)
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.status === 204 ? null : r.text().then(function (t) { return t ? JSON.parse(t) : null; });
        });
      }

      function send(onLeave) {
        clearTimeout(timer);
        if (held) return;
        var s = seeker();
        if (!s || state.restoring || state.sending) { if (dirty) timer = setTimeout(send, RETRY_MS); return; }
        if (get(READY + s) !== '1') { checkCloud(); return; }
        if (!dirty && !queue.length) return;
        Object.keys(pending).forEach(function (id) { queue.push(pending[id]); });
        pending = {}; dirty = false; firstDirtyAt = 0;
        put(QUEUE, JSON.stringify(queue.slice(-2000)));
        var events = queue.slice(0, 500);
        var save = { seeker: s, client_at: new Date().toISOString(), hub_version: HUB_VERSION, progress: journey() };
        var leaveSmall = onLeave === true && JSON.stringify(save).length < 60000;
        state.sending = true;
        call('eclipse_saves', save, leaveSmall)
          .then(function () { return events.length ? call('eclipse_events', events, onLeave === true) : null; })
          .then(function () {
            queue = queue.slice(events.length);
            put(QUEUE, JSON.stringify(queue));
            state.lastSentAt = new Date().toISOString(); state.lastError = null;
          })
          .catch(function (e) { state.lastError = String(e && e.message || e); dirty = true; timer = setTimeout(send, RETRY_MS); })
          .then(function () { state.sending = false; if (dirty) schedule(); });
      }

      // ---- Recovery: a seeker with no journey in this browser gets their latest cloud save back
      var overlay = null;
      function showOverlay() {
        if (overlay || !document.body) return;
        overlay = document.createElement('div');
        overlay.setAttribute('role', 'status');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
          'background:#0b0712;color:#e8d9b5;font:20px Georgia,serif;letter-spacing:.04em;text-align:center;padding:24px';
        overlay.textContent = 'Recovering your journey from the Order’s archive…';
        document.body.appendChild(overlay);
      }
      function hideOverlay() { if (overlay) { overlay.remove(); overlay = null; } }

      function checkCloud() {
        var s = seeker();
        if (!s || state.restoring || get(READY + s) === '1') return;
        var emptyHere = !hasJourney() || freshStart;
        state.restoring = true;
        if (emptyHere) { if (document.body) showOverlay(); else document.addEventListener('DOMContentLoaded', showOverlay); }
        call('rpc/eclipse_latest_save', { p_seeker: s })
          .then(function (res) {
            var saved = res && res.progress;
            if (emptyHere && saved && typeof saved === 'object' && Object.keys(saved).length) {
              Object.keys(journey()).forEach(function (k) { rawRemove.call(store, k); });
              Object.keys(saved).forEach(function (k) { if (!isDeviceKey(k)) put(k, saved[k]); });
              put(READY + s, '1');
              stop(); frozen = true;
              location.reload();
              return;
            }
            put(READY + s, '1');      // nothing to recover, or this browser already holds the journey
            state.restoring = false;
            hideOverlay();
            dirty = true; schedule();  // first snapshot from this device
          })
          .catch(function (e) {
            state.lastError = String(e && e.message || e);
            state.restoring = false;
            hideOverlay();
            setTimeout(checkCloud, RETRY_MS);  // nothing is sent until the cloud has been asked
          });
      }

      // A seeker who arrives here with no game keys at all is a fresh start: whatever the Hub writes while
      // it boots is the baseline, not a journey worth keeping over the cloud's
      var freshStart = !!seeker() && !hasJourney();
      note('session', null, navigator.userAgent.indexOf('iPad') >= 0 || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)) ? 'ipad' : 'desktop');
      checkCloud();

      document.addEventListener('DOMContentLoaded', function () {
        function view() { var v = document.body.getAttribute('data-active-view'); if (v) note('view', null, v); }
        view();   // the Hub's scripts may already have opened the first view
        new MutationObserver(view).observe(document.body, { attributes: true, attributeFilter: ['data-active-view'] });
      });
      window.addEventListener('pagehide', function () { if (dirty || queue.length) send(true); });
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && (dirty || queue.length)) send(true); });
      window.addEventListener('online', function () { if (dirty || queue.length) send(); });

      // Called by EclipseProfiles.swap before it repacks localStorage: those writes are a profile change,
      // not progress, and the page reloads straight after
      // Its last real changes still go up first, while the keys are still the leaving seeker's.
      function stop() { held = true; pending = {}; dirty = false; clearTimeout(timer); }
      function hold() { if (!held && dirty) send(true); stop(); }

      return { state: state, flush: function () { send(); }, hold: hold };
    })();
