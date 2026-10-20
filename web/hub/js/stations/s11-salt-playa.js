
    // =========================================================================
    // 🧂 THE SALT PLAYA CONTROLLER (STATION 11 · SHEET 10A)
    // =========================================================================
    (function initSaltPlayaController() {
      const modal = document.getElementById('modal-salt-playa');
      if (!modal) return;
      const sfx = window.sfx || null;
      const btnClose = document.getElementById('btn-close-playa');
      const btnUndo = document.getElementById('btn-playa-undo');
      const btnReset = document.getElementById('btn-playa-reset');
      const btnTransmit = document.getElementById('btn-playa-transmit');
      const btnFinish = document.getElementById('btn-playa-finish');
      const keywordInput = document.getElementById('playa-keyword-input');
      const board = document.getElementById('playa-board');
      const dispatchEl = document.getElementById('playa-dispatch-text');
      const victoryCard = document.getElementById('playa-victory-card');
      const progressEl = document.getElementById('playa-progress-count');
      const telemRow = document.getElementById('playa-telem-row');
      const telemFacets = document.getElementById('playa-telem-facets');
      const telemWaypoint = document.getElementById('playa-telem-waypoint');
      const slots = [0, 1, 2, 3, 4, 5, 6].map(i => document.getElementById('playa-slot-' + i));

      // Slab grid exactly as printed on Sheet 10A (build_desert_odyssey_expanded.py · render_game_d2_salt_playa).
      // Each cell is [facets, letter]; null marks a brine sinkhole. The crossing is unique and spells the keyword.
      const GRID = [
        [[1, 'M'], [5, 'X'], [6, 'B'], [3, 'C'], [1, 'Q'], [6, 'Z'], [2, 'V']],
        [[4, 'G'], [2, 'E'], null, [6, 'K'], [4, 'R'], [1, 'J'], [5, 'U']],
        [[3, 'F'], null, [2, 'I'], [5, 'Y'], null, [2, 'P'], [6, 'D']],
        [[5, 'O'], [1, 'A'], [4, 'S'], [2, 'W'], null, [5, 'B'], [3, 'T']],
        [[2, 'L'], null, [3, 'T'], [6, 'H'], [1, 'N'], null, [6, 'M']],
        [[6, 'K'], [5, 'N'], null, [2, 'A'], [5, 'R'], [3, 'E'], [1, 'S']],
        [[3, 'P'], [1, 'Z'], [4, 'O'], [1, 'L'], null, [6, 'C'], [2, 'Y']]
      ];
      const ROWS = 7;
      const COL_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      const START_COL = 3;
      const KEYWORD = 'CRYSTAL';
      const SOLUTION_PATH = [3, 4, 3, 2, 2, 3, 3];
      const START_LINE = "Silvia, I'm standing at the North Edge of the Salt Playa. The white crust cracks under my boots, and the dark patches are brine sinkholes. Your notes say where I must start. Which slab first?";

      let path = [];

      const isDone = () => localStorage.getItem('order_salt_playa_completed') === 'true';
      const cell = (r, c) => GRID[r][c];
      const say = (text) => { if (dispatchEl) dispatchEl.textContent = '"' + text + '"'; };
      const toast = (msg) => { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); };
      const spelled = () => path.map((c, r) => cell(r, c)[1]).join('');

      function render() {
        const done = isDone();
        const nextRow = path.length;
        let html = '<div class="playa-col-heads"><span></span>' + COL_NAMES.map(n => '<span>' + n + '</span>').join('') + '</div>';
        for (let r = 0; r < ROWS; r++) {
          html += '<div class="playa-row' + (r === nextRow && !done ? ' current' : '') + '"><span class="playa-row-label">' + ROMAN[r] + '</span>';
          for (let c = 0; c < ROWS; c++) {
            const slab = cell(r, c);
            const chosen = path[r] === c;
            const adjacent = r === nextRow && (r === 0 ? c === START_COL : Math.abs(c - path[r - 1]) <= 1);
            const reachable = !done && slab !== null && adjacent;
            const cls = 'playa-slab' + (slab === null ? ' sink' : '') + (chosen ? ' chosen' : '') + (reachable ? ' reachable' : '');
            const aria = slab === null ? 'Row ' + ROMAN[r] + ', column ' + COL_NAMES[c] + ': sinkhole' : 'Row ' + ROMAN[r] + ', column ' + COL_NAMES[c] + ': ' + slab[0] + ' facets, letter ' + slab[1];
            const inner = slab === null ? '✕' : '<span class="playa-num">' + slab[0] + '</span><span class="playa-let">[' + slab[1] + ']</span>';
            html += '<button type="button" class="' + cls + '" data-r="' + r + '" data-c="' + c + '" aria-label="' + aria + '">' + inner + (chosen ? '<span class="playa-step-badge">' + (r + 1) + '</span>' : '') + '</button>';
          }
          html += '</div>';
        }
        board.innerHTML = html;

        slots.forEach((el, i) => {
          if (!el) return;
          const letter = el.querySelector('.slot-letter');
          if (path[i] !== undefined) {
            letter.textContent = cell(i, path[i])[1];
            el.classList.add('filled');
          } else {
            letter.textContent = '';
            el.classList.remove('filled');
          }
        });

        if (progressEl) progressEl.textContent = path.length + ' / ' + ROWS + ' STEPS';
        if (telemRow) telemRow.textContent = (path.length >= ROWS ? 'VII' : ROMAN[path.length]) + ' / VII';
        if (telemFacets) telemFacets.textContent = path.length ? String(cell(path.length - 1, path[path.length - 1])[0]) : '—';
        if (telemWaypoint) {
          telemWaypoint.textContent = done ? 'South Shore (Crossed)' : (path.length === 0 ? 'North Edge' : 'Row ' + ROMAN[path.length - 1]);
        }
        if (btnUndo) btnUndo.disabled = done || path.length === 0;
        if (btnReset) btnReset.disabled = done || path.length === 0;
        if (btnTransmit) btnTransmit.disabled = done;
        if (keywordInput) keywordInput.disabled = done;
      }

      function resetCrossing() {
        if (sfx) sfx.playMechanicalClick();
        path = [];
        if (victoryCard) victoryCard.style.display = 'none';
        say(START_LINE);
        render();
      }

      function undoStep() {
        if (isDone() || path.length === 0) return;
        if (sfx) sfx.playMechanicalClick();
        path.pop();
        say('Back one slab, Silvia. Tell me where to step from here.');
        render();
      }

      function flash(r, c) {
        const el = board.querySelector('.playa-slab[data-r="' + r + '"][data-c="' + c + '"]');
        if (!el) return;
        el.classList.remove('shake');
        void el.offsetWidth;
        el.classList.add('shake');
      }

      function completeCrossing() {
        path = SOLUTION_PATH.slice();
        try {
          localStorage.setItem('order_salt_playa_completed', 'true');
          localStorage.setItem('order_salt_playa_path', JSON.stringify(path));
        } catch (e) {}
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        say('The crust held on every slab! The seven letters under my boots spell ' + KEYWORD + '. We are across, Silvia!');
        if (victoryCard) victoryCard.style.display = 'block';
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
      }

      function stepOn(r, c) {
        path.push(c);
        if (sfx) sfx.playMechanicalClick();
        if (path.length === ROWS) {
          completeCrossing();
          return;
        }
        const here = cell(r, c);
        const next = r + 1;
        const options = [c - 1, c, c + 1].filter(cc => cc >= 0 && cc < ROWS && cell(next, cc) !== null && Math.abs(cell(next, cc)[0] - here[0]) === 1);
        if (options.length === 0) {
          say('I am on a slab of ' + here[0] + ' facets, but nothing below me changes by exactly 1. I cannot go on from here. Step me back and try another route.');
        } else {
          const lines = [
            'A slab of ' + here[0] + ' facets, and it holds. Which slab for Row ' + ROMAN[next] + '?',
            'Row ' + ROMAN[r] + ' done. The salt crunches but it carries me. Where next, Silvia?',
            'The crust is steady under ' + here[0] + ' facets. Which slab should I try in Row ' + ROMAN[next] + '?'
          ];
          say(lines[r % lines.length]);
        }
        render();
      }

      board.addEventListener('click', (e) => {
        const btn = e.target.closest('.playa-slab');
        if (!btn || isDone()) return;
        const r = parseInt(btn.dataset.r, 10);
        const c = parseInt(btn.dataset.c, 10);

        if (r === path.length - 1 && c === path[r]) { undoStep(); return; }

        if (r !== path.length) {
          say('We cross the crust one row at a time, from North to South. Which slab should I take in Row ' + ROMAN[path.length] + '?');
          return;
        }
        if (cell(r, c) === null) {
          say('Careful, Silvia! That slab is a brine sinkhole. The crust would swallow my boots. Choose another one.');
          flash(r, c);
          return;
        }
        if (r === 0) {
          if (c !== START_COL) {
            say('That is not where we begin. Your notes say to start at Row I, Column D, the slab marked 3 and [C].');
            flash(r, c);
            return;
          }
        } else {
          if (Math.abs(c - path[r - 1]) > 1) {
            say('That slab is too far to reach in one stride. From here I can only step straight down or diagonally.');
            flash(r, c);
            return;
          }
          const from = cell(r - 1, path[r - 1])[0];
          const to = cell(r, c)[0];
          if (Math.abs(to - from) !== 1) {
            say('The crust cracks under a slab of ' + to + ' facets, Silvia. From ' + from + ' facets I can only step to a slab with exactly one facet more or one less.');
            flash(r, c);
            return;
          }
        }
        stepOn(r, c);
      });

      function transmitKeyword() {
        if (isDone() || !keywordInput) return;
        const word = keywordInput.value.trim().toUpperCase();
        if (word.length === 0) return;
        if (sfx) sfx.playMechanicalClick();
        if (word === KEYWORD) {
          completeCrossing();
        } else {
          say('The wire hums, but the crust does not answer to "' + word + '". Check the letters on your 7-step path and try again.');
          keywordInput.classList.remove('shake');
          void keywordInput.offsetWidth;
          keywordInput.classList.add('shake');
        }
      }

      function openSaltPlayaModal() {
        const isChasmDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';
        if (!isChasmDone && !isDone() && !(window.isAdminTester && window.isAdminTester())) {
          toast('✦ TERRA INCOGNITA ✦ Guide Hermes through the Whispering Chasm (Station 10) before crossing the Salt Playa.');
          return;
        }
        if (sfx) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');

        if (isDone()) {
          path = SOLUTION_PATH.slice();
          if (victoryCard) victoryCard.style.display = 'block';
          say('We crossed the Salt Playa together, Silvia. The seven letters on the safe path spell ' + KEYWORD + '.');
          render();
        } else {
          if (path.length === ROWS) path = [];
          if (path.length === 0) say(START_LINE);
          render();
        }
      }

      function closeSaltPlayaModal() {
        if (sfx) sfx.playMechanicalClick();
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('closing');
        }, 220);
      }

      window.openSaltPlayaModal = openSaltPlayaModal;
      window.closeSaltPlayaModal = closeSaltPlayaModal;

      if (btnClose) btnClose.addEventListener('click', closeSaltPlayaModal);
      if (btnUndo) btnUndo.addEventListener('click', undoStep);
      if (btnReset) btnReset.addEventListener('click', resetCrossing);
      if (btnTransmit) btnTransmit.addEventListener('click', transmitKeyword);
      if (keywordInput) keywordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') transmitKeyword(); });
      if (btnFinish) {
        btnFinish.addEventListener('click', () => {
          closeSaltPlayaModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
        });
      }
      modal.addEventListener('click', (e) => { if (e.target === modal) closeSaltPlayaModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') closeSaltPlayaModal();
      });
    })();
