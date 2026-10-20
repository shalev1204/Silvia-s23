    // Each seeker keeps their own adventure. Game progress lives in shared keys (order_*, seeker_*, …), so when
    // the profile changes, everything that belongs to the leaving seeker is packed into their vault and the
    // arriving seeker's vault is unpacked. Only device settings stay put. A seeker without a vault starts from
    // the canonical baseline (the Hub's syncWaypointBaseline). Silvia's own browser never switches profile.
    window.EclipseProfiles = (function () {
      var VAULT = 'eclipse_profile_vault_';
      var DEVICE_KEYS = ['the_eclipse_active_seeker', 'the_eclipse_gate_ok_at', 'hub_sidebar_collapsed'];
      function isDeviceKey(k) { return DEVICE_KEYS.indexOf(k) >= 0 || k.indexOf(VAULT) === 0; }
      function swap(from, to) {
        if (!from || !to || from.toLowerCase() === to.toLowerCase()) return false;
        var progress = {}, keys = [], i, k;
        for (i = 0; i < localStorage.length; i++) {
          k = localStorage.key(i);
          if (k && !isDeviceKey(k)) { progress[k] = localStorage.getItem(k); keys.push(k); }
        }
        localStorage.setItem(VAULT + from.toLowerCase(), JSON.stringify(progress));
        keys.forEach(function (key) { localStorage.removeItem(key); });
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem(VAULT + to.toLowerCase()) || 'null'); } catch (e) { saved = null; }
        if (saved && typeof saved === 'object') {
          Object.keys(saved).forEach(function (key) { if (!isDeviceKey(key)) localStorage.setItem(key, saved[key]); });
        }
        localStorage.removeItem(VAULT + to.toLowerCase());   // the arriving seeker's progress lives in the keys again
        return true;
      }
      return { swap: swap };
    })();

    (function () {
      var ACCOUNTS = { silvia: 'Silvia', carles: 'Carles' };
      var GATE_TTL_MS = 12 * 60 * 60 * 1000;
      var overlay = document.getElementById('sanctuary-gate-overlay');
      var form = document.getElementById('gate-auth-form');
      var userEl = document.getElementById('gate-username');
      var passEl = document.getElementById('gate-password');
      var errEl = document.getElementById('gate-error-msg');
      var btn = document.getElementById('gate-submit-btn');
      if (!overlay || !form || !userEl || !passEl) return;

      function gateOk() {
        try {
          if (sessionStorage.getItem('the_eclipse_session_authenticated') === 'true') return true;
          var t = parseInt(localStorage.getItem('the_eclipse_gate_ok_at') || '0', 10);
          if (t && Date.now() - t < GATE_TTL_MS) {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            return true;
          }
        } catch (e) {}
        return false;
      }
      window.__gateIsOpen = gateOk;

      // Already signed in (this session, or within 12 h): never show the gate again
      if (gateOk()) overlay.classList.add('gate-hidden');

      var busy = false;
      function clean(s) {
        // Phones auto-capitalize / add invisible spaces: ignore case and stray whitespace
        return String(s || '').replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (busy) return;
        var key = clean(userEl.value);
        var pass = clean(passEl.value);
        // The passphrase is the seeker's own name
        if (ACCOUNTS[key] && pass === key) {
          busy = true;
          if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
          if (errEl) errEl.style.display = 'none';
          try {
            var before = localStorage.getItem('the_eclipse_active_seeker');
            if (before && ACCOUNTS[String(before).toLowerCase()]) window.EclipseProfiles.swap(ACCOUNTS[String(before).toLowerCase()], ACCOUNTS[key]);
            localStorage.setItem('the_eclipse_active_seeker', ACCOUNTS[key]);
            localStorage.setItem('the_eclipse_gate_ok_at', String(Date.now()));
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
          } catch (err) {}
          overlay.classList.add('gate-hidden');
          // Reload so the Hub boots cleanly with the chosen profile
          window.location.reload();
        } else {
          if (errEl) errEl.style.display = 'block';
          passEl.value = '';
          passEl.focus();
        }
      }, true);

      // Safety net: if the submit event is ever swallowed, a button click still logs in
      if (btn) btn.addEventListener('click', function (e) {
        if (busy) return;
        if (typeof form.requestSubmit === 'function') {
          e.preventDefault();
          form.requestSubmit();
        }
      });
    })();
