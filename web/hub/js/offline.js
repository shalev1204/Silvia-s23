    // The Hub without a signal, page side (docs/IDEAS_BACKLOG.md #21; the worker is web/sw.js).
    // 1. Registers the worker on the published site (https), or anywhere with ?sw=1 (smoke); ?sw=0 skips it.
    // 2. A new version waits in the background; when the Hub is opened and one is waiting, it is let in and the
    //    page reloads once, before anything has been played. It never reloads an open page.
    // 3. A small notice says the Hub is offline: the journey stays on this device and the cloud save
    //    (hub/js/cloud-save.js) sends it when the signal comes back.
    (function () {
      'use strict';
      var params = new URLSearchParams(location.search);
      var forced = params.get('sw');
      var on = 'serviceWorker' in navigator && forced !== '0' && (forced === '1' || location.protocol === 'https:');
      var OPENED_AT = Date.now();
      var LET_IN_MS = 8000;    // a version found later than this waits for the next opening

      if (on) {
        navigator.serviceWorker.register('./sw.js').then(function (reg) {
          function letIn(worker) {
            if (!worker || !navigator.serviceWorker.controller || Date.now() - OPENED_AT > LET_IN_MS) return;
            var last = 0;
            try { last = parseInt(sessionStorage.getItem('eclipse_sw_reloaded') || '0', 10); } catch (e) {}
            if (Date.now() - last < 60000) return;   // never twice in a row
            navigator.serviceWorker.addEventListener('controllerchange', function () {
              try { sessionStorage.setItem('eclipse_sw_reloaded', String(Date.now())); } catch (e) {}
              if (window.EclipseCloud && window.EclipseCloud.flush) window.EclipseCloud.flush();
              location.reload();
            }, { once: true });
            worker.postMessage('eclipse-sw-update');
          }
          letIn(reg.waiting);
          reg.addEventListener('updatefound', function () {
            var w = reg.installing;
            if (w) w.addEventListener('statechange', function () { if (w.state === 'installed') letIn(w); });
          });
          reg.update().catch(function () {});
        }).catch(function () {});
      }

      // ---- the notice
      var note = null;
      function cloudDown() {
        var c = window.EclipseCloud && window.EclipseCloud.state;
        return !!(c && c.enabled && c.lastError && /fetch|network|load failed|offline/i.test(c.lastError));
      }
      function show() {
        var off = navigator.onLine === false || cloudDown();
        if (off && !note && document.body) {
          note = document.createElement('div');
          note.className = 'offline-notice';
          note.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147482000;pointer-events:none;' +
            'max-width:calc(100% - 32px);padding:8px 16px;border-radius:999px;border:1px solid rgba(255,213,146,.45);' +
            'background:rgba(11,7,18,.94);color:#e8d9b5;font:14px/1.4 Georgia,serif;letter-spacing:.02em;text-align:center';
          note.setAttribute('role', 'status');
          note.textContent = '✦ No signal · your journey is kept on this device and reaches the Order’s archive when the signal returns';
          document.body.appendChild(note);
        } else if (!off && note) {
          note.remove(); note = null;
        }
      }
      window.addEventListener('online', function () { setTimeout(show, 3000); });   // the cloud save sends first
      window.addEventListener('offline', show);
      setInterval(show, 5000);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
    })();
