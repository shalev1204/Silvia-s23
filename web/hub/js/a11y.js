    // Keyboard access to the Hub (docs/IDEAS_BACKLOG.md #20). Loaded last; it changes nothing on screen.
    // 1. The modal windows (role="dialog" aria-modal="true"): focus goes in when one opens, Tab stays inside it,
    //    Escape closes it (when its station did not already), and focus comes back to where it was.
    // 2. A few cards and cells that were only clickable with the mouse get a place in the Tab order, and Enter or
    //    Space click them. The smoke's a11y section fails on any new control that cannot be reached this way.
    (function () {
      'use strict';
      var CLICKABLE = ['.tx-log-card', '.archive-item-card', '#doc-image-frame', '#insp-btn-primary',
        '.lexicon-cw-cell.active', '.lexicon-clue-item', '.clepsydra-clue-card', '.si-mc-slot.is-filled'].join(',');
      var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),' +
        'textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
      var openers = new Map();      // dialog -> the element that had focus before it opened
      var lastOutside = null;       // the last element focused outside every open dialog

      function shown(el) {
        if (!el.isConnected || !el.getClientRects().length) return false;
        for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
          var s = getComputedStyle(e);
          if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false;
        }
        return true;
      }
      function openDialogs() {
        return Array.prototype.filter.call(document.querySelectorAll('[role="dialog"][aria-modal="true"],[role="alertdialog"][aria-modal="true"]'), shown);
      }
      function topDialog() {
        var list = openDialogs(), best = null, bestZ = -Infinity;
        list.forEach(function (d) {
          var z = 0;
          for (var e = d; e && e.nodeType === 1; e = e.parentElement) {
            var v = parseInt(getComputedStyle(e).zIndex, 10);
            if (!isNaN(v)) { z = v; break; }
          }
          if (z >= bestZ) { bestZ = z; best = d; }   // same height: the later one in the page is on top
        });
        return best;
      }
      function focusables(root) {
        return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), function (el) {
          return !el.closest('[inert],[aria-hidden="true"]') && shown(el);
        });
      }

      // ---- 1. modal windows ----
      document.addEventListener('focusin', function (e) {
        if (!openDialogs().some(function (d) { return d.contains(e.target); })) lastOutside = e.target;
      });
      function watch() {
        var open = openDialogs();
        open.forEach(function (d) {
          if (openers.has(d)) return;
          openers.set(d, lastOutside);
          if (!d.contains(document.activeElement)) {
            var first = focusables(d)[0];
            if (first) first.focus({ preventScroll: true });
            else { if (!d.hasAttribute('tabindex')) d.setAttribute('tabindex', '-1'); d.focus({ preventScroll: true }); }
          }
        });
        openers.forEach(function (opener, d) {
          if (open.indexOf(d) >= 0) return;
          openers.delete(d);
          var a = document.activeElement;
          if ((!a || a === document.body || d.contains(a)) && opener && shown(opener)) opener.focus({ preventScroll: true });
        });
      }
      setInterval(watch, 200);

      document.addEventListener('keydown', function (e) {
        var d = topDialog();
        if (!d) return;
        if (e.key === 'Tab') {
          var list = focusables(d);
          if (!list.length) { e.preventDefault(); return; }
          var i = list.indexOf(document.activeElement);
          if (i < 0) { e.preventDefault(); list[e.shiftKey ? list.length - 1 : 0].focus(); }
          else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
          else if (e.shiftKey && i === 0) { e.preventDefault(); list[list.length - 1].focus(); }
        } else if (e.key === 'Escape') {
          // the stations close their own window on Escape; if this one is still open after them, use its close button
          setTimeout(function () {
            if (!shown(d)) return;
            var close = d.querySelector('[id^="btn-close"],[class*="close-btn"],.jsp-close,[aria-label="Close"]');
            if (close && shown(close)) close.click();
          }, 0);
        }
      });

      // ---- 2. clickable cards and cells ----
      function operable() {
        document.querySelectorAll(CLICKABLE).forEach(function (el) {
          if (el.hasAttribute('data-a11y-key')) return;
          el.setAttribute('data-a11y-key', '');
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
          if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
        });
      }
      var queued = false;
      new MutationObserver(function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; operable(); });
      }).observe(document.body, { childList: true, subtree: true });
      operable();
      document.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && e.target.hasAttribute('data-a11y-key') && !e.repeat) {
          e.preventDefault();
          e.target.click();
        }
      });
    })();
