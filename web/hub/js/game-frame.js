    // The 3D games fill the screen. Every game window with a scene and a side panel (.chasm3d-body) gets two buttons in
    // its header, next to the ✕: one sends the whole Hub to the screen's full size (the browser's fullscreen, so the
    // item cards and the Field Wire still open on top), the other folds the side panel away so the scene takes all the
    // width, to watch it like a film. Leaving the game leaves the fullscreen it asked for; the panel opens again
    // every time a game opens, so the controls are never lost.
    (function () {
      'use strict';
      var root = document.documentElement;
      var fsApi = {
        on: function () { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
        can: function () { return !!(root.requestFullscreen || root.webkitRequestFullscreen) && document.fullscreenEnabled !== false; },
        enter: function () {
          try {
            var p = root.requestFullscreen ? root.requestFullscreen({ navigationUI: 'hide' }) : root.webkitRequestFullscreen();
            if (p && p.catch) p.catch(function () {});
          } catch (e) {}
        },
        exit: function () {
          try {
            var p = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
            if (p && p.catch) p.catch(function () {});
          } catch (e) {}
        }
      };
      var owner = null;   // the game that asked for the fullscreen

      function button(cls, glyph) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gf-btn ' + cls;
        b.textContent = glyph;
        return b;
      }
      function setup(modal) {
        var head = modal.querySelector('.chasm-header-bar'), body = modal.querySelector('.chasm3d-body');
        var close = head && head.querySelector('.chasm-close-btn');
        if (!head || !body || !close || head.querySelector('.gf-tools')) return;
        var tools = document.createElement('div');
        tools.className = 'gf-tools';
        var fold = button('gf-fold', '⇥'), full = button('gf-full', '⛶');
        // only a game whose side panel holds nothing you must click mid-scene can fold it (the story scenes keep their replies)
        if (body.querySelector(':scope > .chasm3d-panel')) tools.appendChild(fold);
        if (fsApi.can()) tools.appendChild(full);
        head.insertBefore(tools, close);

        function paint() {
          var folded = body.classList.contains('is-folded');
          fold.textContent = folded ? '⇤' : '⇥';
          fold.setAttribute('aria-pressed', folded ? 'true' : 'false');
          fold.setAttribute('aria-label', folded ? 'Show the side panel again' : 'Hide the side panel and watch the scene');
          fold.title = folded ? 'Show the panel' : 'Hide the panel';
          var on = fsApi.on() && owner === modal;
          full.textContent = on ? '⤡' : '⛶';
          full.setAttribute('aria-pressed', on ? 'true' : 'false');
          full.setAttribute('aria-label', on ? 'Leave full screen' : 'Play in full screen');
          full.title = on ? 'Leave full screen' : 'Full screen';
        }
        fold.addEventListener('click', function () { body.classList.toggle('is-folded'); paint(); window.dispatchEvent(new Event('resize')); });
        full.addEventListener('click', function () {
          if (fsApi.on()) { fsApi.exit(); owner = null; }
          else { owner = modal; fsApi.enter(); }
          paint();
        });
        ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
          document.addEventListener(ev, function () { if (!fsApi.on() && owner === modal) owner = null; paint(); });
        });
        // the game closed: the panel comes back for next time, and the fullscreen it asked for ends
        new MutationObserver(function () {
          if (modal.style.display !== 'none') return;
          if (body.classList.contains('is-folded')) body.classList.remove('is-folded');
          if (owner === modal && fsApi.on()) fsApi.exit();
          if (owner === modal) owner = null;
          paint();
        }).observe(modal, { attributes: true, attributeFilter: ['style'] });
        paint();
      }
      function init() {
        [].forEach.call(document.querySelectorAll('.chasm-modal-backdrop'), function (m) { if (m.querySelector('.chasm3d-body')) setup(m); });
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
      else init();
    })();
