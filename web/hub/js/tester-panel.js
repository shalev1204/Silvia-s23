
    // =========================================================================
    // 🛠 TESTER PANEL (Carles only): complete or replay the Desert Path games
    // =========================================================================
    (function initTesterPanel() {
      const panel = document.getElementById('tester-panel');
      const rowsEl = document.getElementById('tester-rows');
      if (!panel || !rowsEl || !window.TesterDesert) return;
      // Silvia must never see Tester Controls — hide and bail unless Carles is active
      if (typeof window.syncStormDevControlsVisibility === 'function') {
        window.syncStormDevControlsVisibility();
      }
      if (!(window.isAdminTester && window.isAdminTester())) {
        panel.style.display = 'none';
        return;
      }
      const T = window.TesterDesert;
      panel.style.display = '';

      try { panel.open = localStorage.getItem('order_tester_panel_open') === 'true'; } catch (e) {}
      panel.addEventListener('toggle', () => {
        try { localStorage.setItem('order_tester_panel_open', panel.open ? 'true' : 'false'); } catch (e) {}
      });

      // Every action rewrites the saved progress, then reloads so each game restarts from its saved state
      function apply(action, message) {
        if (typeof window.showDesertToast === 'function') window.showDesertToast(message);
        action();
        setTimeout(() => window.location.reload(), 450);
      }

      T.games.forEach((g) => {
        const done = T.isDone(g.id);
        const row = document.createElement('div');
        row.className = 'tester-row' + (done ? ' is-done' : '') + (g.built ? '' : ' is-unbuilt');
        row.innerHTML = '<span class="tester-row-tag"></span><span class="tester-row-label"><span class="tester-name"></span><span class="tester-state"></span></span>';
        row.querySelector('.tester-row-tag').textContent = g.tag;
        row.querySelector('.tester-name').textContent = g.label;
        row.querySelector('.tester-state').textContent = g.built ? (done ? '✓ done' : '· open') : '· web game not built yet';

        const btnComplete = document.createElement('button');
        btnComplete.type = 'button';
        btnComplete.className = 'tester-btn';
        btnComplete.textContent = '⏩ Complete up to here';
        btnComplete.title = 'Finishes this game and every game before it';
        btnComplete.disabled = !g.built;
        btnComplete.addEventListener('click', () => apply(() => T.completeUpTo(g.id), '✦ Completed up to ' + g.tag + ' ✦'));

        const btnPlay = document.createElement('button');
        btnPlay.type = 'button';
        btnPlay.className = 'tester-btn tester-btn-play';
        btnPlay.textContent = '▶ Play this game';
        btnPlay.title = 'Every game before it done, this game and the ones after it unsolved, no walk to wait for: the game opens at once. Press it again to replay.';
        btnPlay.disabled = !g.built;
        btnPlay.addEventListener('click', () => {
          if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ Playing ' + g.tag + ' ✦');
          const node = T.jumpTo(g.id);
          try { if (node) sessionStorage.setItem('eclipse_tester_open_node', String(node)); } catch (e) {}
          setTimeout(() => window.location.reload(), 450);
        });

        const btnRestart = document.createElement('button');
        btnRestart.type = 'button';
        btnRestart.className = 'tester-btn';
        btnRestart.textContent = '↺ Start over';
        btnRestart.title = 'Only this game goes back to its very beginning (its How to play too); every other game stays as it is';
        btnRestart.disabled = !g.built || !g.reset;
        btnRestart.addEventListener('click', () => apply(() => g.reset(), '✦ ' + g.tag + ' starts over ✦'));

        row.appendChild(btnPlay);
        row.appendChild(btnRestart);
        row.appendChild(btnComplete);
        rowsEl.appendChild(row);
      });

      const btnSkipWalks = document.getElementById('tester-skip-walks');
      if (btnSkipWalks) btnSkipWalks.addEventListener('click', () => apply(() => T.skipWalks(), '✦ Hermes arrives at once: every walk skipped ✦'));

      // After "Play this game" the page reloads, then the game opens straight away
      try {
        const node = parseInt(sessionStorage.getItem('eclipse_tester_open_node') || '', 10);
        sessionStorage.removeItem('eclipse_tester_open_node');
        if (node >= 40 && node <= 48 && typeof window.selectStageStation === 'function') {
          // a room of Tower III: the stage, then its game
          if (typeof window.switchMapPath === 'function') window.switchMapPath('stage', false);
          setTimeout(() => window.selectStageStation(node), 900);
        } else if (node && typeof window.selectDesertStation === 'function') {
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', false);
          setTimeout(() => window.selectDesertStation(node), 900);
        }
      } catch (e) {}

      const btnAll = document.getElementById('tester-complete-all');
      const btnReplayAll = document.getElementById('tester-replay-all');
      if (btnAll) btnAll.addEventListener('click', () => apply(() => T.completeAll(), '✦ Every built game completed ✦'));
      if (btnReplayAll) {
        btnReplayAll.addEventListener('click', () => {
          if (!window.confirm('Reset every Desert Path game and the Hermes chat? Only Stations 01 to 09 stay done.')) return;
          apply(() => T.replayAll(), '✦ Desert Path reset: only Stations 01–09 are done ✦');
        });
      }
    })();
