    (function initOasisClepsydra() {
      const modal = document.getElementById('modal-oasis-clepsydra');
      if (!modal) return;

      const btnClose = document.getElementById('btn-close-clepsydra');
      const tbody = document.getElementById('clepsydra-matrix-tbody');
      const btnResetGrid = document.getElementById('btn-clepsydra-reset-grid');
      const clueCards = document.querySelectorAll('#clepsydra-clues-list .clepsydra-clue-card');
      const btnEngage = document.getElementById('btn-clepsydra-engage');
      const btnSolveAll = document.getElementById('btn-clepsydra-solve-all');
      const btnFinish = document.getElementById('btn-clepsydra-finish');
      const keyInput = document.getElementById('clepsydra-key-input');
      const dispatchText = document.getElementById('clepsydra-dispatch-text');
      const victoryCard = document.getElementById('clepsydra-victory-card');
      const telemWells = document.getElementById('clepsydra-telem-wells');
      const telemCanteens = document.getElementById('clepsydra-telem-canteens');
      const telemKey = document.getElementById('clepsydra-telem-key');
      const weirBox = document.getElementById('clepsydra-weir-box');

      const BASINS = {
        Falcon: {
          el: document.getElementById('basin-falcon'),
          fill: document.getElementById('water-fill-falcon'),
          status: document.getElementById('basin-falcon-status'),
          seeker: document.getElementById('basin-falcon-seeker'),
          hour: document.getElementById('basin-falcon-hour')
        },
        Jackal: {
          el: document.getElementById('basin-jackal'),
          fill: document.getElementById('water-fill-jackal'),
          status: document.getElementById('basin-jackal-status'),
          seeker: document.getElementById('basin-jackal-seeker'),
          hour: document.getElementById('basin-jackal-hour')
        },
        Scarab: {
          el: document.getElementById('basin-scarab'),
          fill: document.getElementById('water-fill-scarab'),
          status: document.getElementById('basin-scarab-status'),
          seeker: document.getElementById('basin-scarab-seeker'),
          hour: document.getElementById('basin-scarab-hour')
        },
        Serpent: {
          el: document.getElementById('basin-serpent'),
          fill: document.getElementById('water-fill-serpent'),
          status: document.getElementById('basin-serpent-status'),
          seeker: document.getElementById('basin-serpent-seeker'),
          hour: document.getElementById('basin-serpent-hour')
        }
      };

      const selects = {
        cart: {
          relic: document.getElementById('reg-cart-relic'),
          well: document.getElementById('reg-cart-well'),
          hour: document.getElementById('reg-cart-hour')
        },
        alch: {
          relic: document.getElementById('reg-alch-relic'),
          well: document.getElementById('reg-alch-well'),
          hour: document.getElementById('reg-alch-hour')
        },
        nomad: {
          relic: document.getElementById('reg-nomad-relic'),
          well: document.getElementById('reg-nomad-well'),
          hour: document.getElementById('reg-nomad-hour')
        },
        astro: {
          relic: document.getElementById('reg-astro-relic'),
          well: document.getElementById('reg-astro-well'),
          hour: document.getElementById('reg-astro-hour')
        }
      };

      const SEEKERS = [
        { id: 'cart', name: 'The Cartographer' },
        { id: 'alch', name: 'The Alchemist' },
        { id: 'nomad', name: 'The Nomad' },
        { id: 'astro', name: 'The Astronomer' }
      ];

      const COLUMNS = [
        // Wells
        { cat: 'well', item: 'Falcon' },
        { cat: 'well', item: 'Jackal' },
        { cat: 'well', item: 'Scarab' },
        { cat: 'well', item: 'Serpent' },
        // Hours
        { cat: 'hour', item: 'Hr III' },
        { cat: 'hour', item: 'Hr VI' },
        { cat: 'hour', item: 'Hr IX' },
        { cat: 'hour', item: 'Hr XII' },
        // Relics
        { cat: 'relic', item: 'Astrolabe' },
        { cat: 'relic', item: 'Scarab' },
        { cat: 'relic', item: 'Sandglass' },
        { cat: 'relic', item: 'Dagger' }
      ];

      const SOLUTION = {
        cart: { relic: 'Astrolabe', well: 'Scarab', hour: 'Hr VI' },
        alch: { relic: 'Sandglass', well: 'Jackal', hour: 'Hr III' },
        nomad: { relic: 'Dagger', well: 'Falcon', hour: 'Hr IX' },
        astro: { relic: 'Scarab', well: 'Serpent', hour: 'Hr XII' }
      };

      function renderMatrix() {
        if (!tbody) return;
        tbody.innerHTML = '';
        let savedMatrix = {};
        try {
          savedMatrix = JSON.parse(localStorage.getItem('order_clepsydra_matrix_state') || '{}');
        } catch(e) {}

        SEEKERS.forEach(seeker => {
          const tr = document.createElement('tr');
          const th = document.createElement('td');
          th.className = 'row-hdr';
          th.textContent = seeker.name;
          tr.appendChild(th);

          COLUMNS.forEach(col => {
            const td = document.createElement('td');
            const key = `${seeker.id}_${col.cat}_${col.item}`;
            const state = savedMatrix[key] || 0;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'clepsydra-cell-btn';
            btn.setAttribute('data-cell-key', key);
            if (state === 1) {
              btn.classList.add('state-cross');
              btn.textContent = '✕';
            } else if (state === 2) {
              btn.classList.add('state-confirmed');
              btn.textContent = '✓';
            } else {
              btn.textContent = '·';
            }

            btn.addEventListener('click', () => {
              if (sfx) sfx.playMechanicalClick();
              let curState = savedMatrix[key] || 0;
              curState = (curState + 1) % 3;
              savedMatrix[key] = curState;
              try {
                localStorage.setItem('order_clepsydra_matrix_state', JSON.stringify(savedMatrix));
              } catch(e) {}

              btn.className = 'clepsydra-cell-btn';
              if (curState === 1) {
                btn.classList.add('state-cross');
                btn.textContent = '✕';
              } else if (curState === 2) {
                btn.classList.add('state-confirmed');
                btn.textContent = '✓';
              } else {
                btn.textContent = '·';
              }
            });

            td.appendChild(btn);
            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });
      }

      function initClues() {
        let savedClues = {};
        try {
          savedClues = JSON.parse(localStorage.getItem('order_clepsydra_clues_state') || '{}');
        } catch(e) {}

        clueCards.forEach(card => {
          const idx = card.getAttribute('data-clue-idx');
          if (savedClues[idx]) {
            card.classList.add('analyzed');
          }
          card.addEventListener('click', () => {
            if (sfx) sfx.playChimeHover();
            card.classList.toggle('analyzed');
            savedClues[idx] = card.classList.contains('analyzed');
            try {
              localStorage.setItem('order_clepsydra_clues_state', JSON.stringify(savedClues));
            } catch(e) {}
          });
        });
      }

      function saveSelections() {
        const data = {};
        SEEKERS.forEach(s => {
          data[s.id] = {
            relic: selects[s.id].relic ? selects[s.id].relic.value : '',
            well: selects[s.id].well ? selects[s.id].well.value : '',
            hour: selects[s.id].hour ? selects[s.id].hour.value : ''
          };
        });
        try {
          localStorage.setItem('order_clepsydra_registry_selections', JSON.stringify(data));
        } catch(e) {}
      }

      function restoreSelections() {
        let data = {};
        try {
          data = JSON.parse(localStorage.getItem('order_clepsydra_registry_selections') || '{}');
        } catch(e) {}
        SEEKERS.forEach(s => {
          if (data[s.id]) {
            if (selects[s.id].relic) selects[s.id].relic.value = data[s.id].relic || '';
            if (selects[s.id].well) selects[s.id].well.value = data[s.id].well || '';
            if (selects[s.id].hour) selects[s.id].hour.value = data[s.id].hour || '';
          }
        });
      }

      function updateBasinVisuals(isFullySolved = false) {
        Object.keys(BASINS).forEach(wellName => {
          const b = BASINS[wellName];
          if (!b || !b.el) return;
          if (isFullySolved) {
            b.el.classList.add('flowing');
            if (b.fill) b.fill.style.width = '100%';
            if (b.status) {
              b.status.textContent = '[ FLOWING ✓ ]';
              b.status.style.color = '#38bdf8';
            }
          } else {
            b.el.classList.remove('flowing');
            if (b.fill) b.fill.style.width = '0%';
            if (b.status) {
              b.status.textContent = '[ DRY ]';
              b.status.style.color = '#64748b';
            }
            if (b.seeker) b.seeker.textContent = 'Seeker: Unassigned';
            if (b.hour) b.hour.textContent = '--';
          }
        });

        let activeWells = 0;
        SEEKERS.forEach(seeker => {
          const selWell = selects[seeker.id].well ? selects[seeker.id].well.value : '';
          const selHour = selects[seeker.id].hour ? selects[seeker.id].hour.value : '';
          if (selWell && BASINS[selWell]) {
            activeWells++;
            const b = BASINS[selWell];
            if (b.seeker) b.seeker.textContent = seeker.name.replace('The ', '');
            if (b.hour) b.hour.textContent = selHour || 'Hour ?';
            if (!isFullySolved) {
              if (b.status) {
                b.status.textContent = '[ SIPHON PRIMED ]';
                b.status.style.color = '#60a5fa';
              }
              if (b.fill) b.fill.style.width = selHour ? '65%' : '35%';
            }
          }
        });

        if (telemWells) {
          telemWells.textContent = isFullySolved ? '4 / 4 BALANCED' : `${activeWells} / 4 BALANCED`;
          telemWells.style.color = isFullySolved ? '#34d399' : (activeWells > 0 ? '#60a5fa' : '#94a3b8');
        }

        if (isFullySolved) {
          if (BASINS.Falcon && BASINS.Falcon.seeker) BASINS.Falcon.seeker.textContent = 'Nomad';
          if (BASINS.Falcon && BASINS.Falcon.hour) BASINS.Falcon.hour.textContent = 'Hr IX';
          if (BASINS.Jackal && BASINS.Jackal.seeker) BASINS.Jackal.seeker.textContent = 'Alchemist';
          if (BASINS.Jackal && BASINS.Jackal.hour) BASINS.Jackal.hour.textContent = 'Hr III';
          if (BASINS.Scarab && BASINS.Scarab.seeker) BASINS.Scarab.seeker.textContent = 'Cartographer';
          if (BASINS.Scarab && BASINS.Scarab.hour) BASINS.Scarab.hour.textContent = 'Hr VI';
          if (BASINS.Serpent && BASINS.Serpent.seeker) BASINS.Serpent.seeker.textContent = 'Astronomer';
          if (BASINS.Serpent && BASINS.Serpent.hour) BASINS.Serpent.hour.textContent = 'Hr XII';
        }
      }

      // Hints climb three levels (hub/js/hint-ladder.js): a refused key or a seeker out of place is a miss
      const clepsydraHints = window.EclipseHints.define({
        id: 's13-wells', station: 'Station 13', title: 'the four wells', group: 'desert',
        anchor: btnEngage, solved: () => localStorage.getItem('order_oasis_clepsydra_completed') === 'true',
        texts: [
          'Do not start with the hours, Silvia. Two clues on the page “The Oasis Clepsydra” name a seeker and their relic outright: begin with those, and mark them in the matrix.',
          'Each seeker has exactly one well, one relic and one hour, and no two share any of them. A ✓ in the matrix means ✕ in every other box of its row and column, in that group. Earlier and later compare the hours: III, then VI, then IX, then XII. The key is the four arrival hours added together, in Roman numerals.',
          'Let us take clue IV together. The Astronomer carried the Gold Scarab and reached the Well of the Serpent: two ✓ in the Astronomer\'s row, and ✕ for everyone else under the Gold Scarab and the Serpent. They arrived at Hour IX or later, so cross out III and VI in their row. Now clue V, the same way.'
        ]
      });

      function applyCompleteState() {
        updateBasinVisuals(true);
        clepsydraHints.refresh();
        if (telemWells) {
          telemWells.textContent = '4 / 4 BALANCED';
          telemWells.style.color = '#34d399';
        }
        if (telemCanteens) {
          telemCanteens.textContent = '4 / 4 FILLED';
          telemCanteens.style.color = '#34d399';
        }
        if (telemKey) {
          telemKey.textContent = 'KEY XXX [ENGAGED ✓]';
          telemKey.style.color = '#34d399';
        }
        if (weirBox) weirBox.style.display = 'block';
        if (victoryCard) victoryCard.style.display = 'flex';
        if (btnEngage) btnEngage.style.display = 'none';
        if (dispatchText) {
          dispatchText.textContent = '"Silvia! The moment Key XXX fell into place, the four wells shimmered and vanished. There were never any siphons: it was the fever, a mirage of the heat. But your logic kept my head clear, and with a clear head I saw what was really there: a narrow cleft in the rock beneath a carved falcon, cold water seeping from it, and an old cache of supplies. Our four leather water skins are full. Scratched into the stone beside the falcon: [P] - [A] = 14! With water in our skins and Al-Qibla set on Tower II (14° NNE), the crossing of the Great Erg is secured. Next: Station 14!"';
        }
      }

      function engageHydraulicSiphons() {
        const keyVal = keyInput ? keyInput.value.trim().toUpperCase() : '';
        const keyClean = keyVal.replace(/[^A-Z0-9]/g, '');
        const isKeyCorrect = keyClean === 'XXX' || keyClean === '30';

        if (!isKeyCorrect) {
          if (sfx) sfx.playMechanicalClick();
          if (keyInput) {
            keyInput.classList.add('decoy-hit');
            setTimeout(() => keyInput.classList.remove('decoy-hit'), 800);
          }
          if (dispatchText) {
            dispatchText.textContent = `"The hydraulic counterweights resist! The key is the sum of the four arrival hours on the page “The Oasis Clepsydra”, written in Roman numerals."`;
          }
          clepsydraHints.fail();
          return false;
        }

        // Validate Seeker pairings
        let allCorrect = true;
        let mismatchCount = 0;
        SEEKERS.forEach(s => {
          const expected = SOLUTION[s.id];
          const actualRelic = selects[s.id].relic ? selects[s.id].relic.value : '';
          const actualWell = selects[s.id].well ? selects[s.id].well.value : '';
          const actualHour = selects[s.id].hour ? selects[s.id].hour.value : '';

          if (actualRelic !== expected.relic || actualWell !== expected.well || actualHour !== expected.hour) {
            allCorrect = false;
            mismatchCount++;
          }
        });

        if (!allCorrect) {
          if (sfx) sfx.playMechanicalClick();
          if (btnEngage) {
            btnEngage.classList.add('decoy-hit');
            setTimeout(() => btnEngage.classList.remove('decoy-hit'), 800);
          }
          if (dispatchText) {
            dispatchText.textContent = `"The subterranean siphons rattle! ${mismatchCount} seeker(s) are not aligned with their true well, relic, or shadow-hour according to the page “The Oasis Clepsydra”. Verify your deductions in the matrix!"`;
          }
          clepsydraHints.fail();
          return false;
        }

        // Success!
        if (sfx) sfx.playCelestialChime();
        try {
          localStorage.setItem('order_oasis_clepsydra_completed', 'true');
        } catch(e) {}

        applyCompleteState();

        if (typeof window.updateDesertMapMarkers === 'function') {
          window.updateDesertMapMarkers();
        }

        return true;
      }

      function solveAllClepsydra() {
        if (sfx) sfx.playCelestialChime();

        // Fill all selects with canonical solutions
        SEEKERS.forEach(s => {
          const sol = SOLUTION[s.id];
          if (selects[s.id].relic) selects[s.id].relic.value = sol.relic;
          if (selects[s.id].well) selects[s.id].well.value = sol.well;
          if (selects[s.id].hour) selects[s.id].hour.value = sol.hour;
        });
        saveSelections();

        // Fill key input
        if (keyInput) keyInput.value = 'XXX';

        // Fill matrix table: confirmed for matching, cross for others
        const solvedMatrix = {};
        SEEKERS.forEach(s => {
          const sol = SOLUTION[s.id];
          COLUMNS.forEach(col => {
            const key = `${s.id}_${col.cat}_${col.item}`;
            if (
              (col.cat === 'well' && col.item === sol.well) ||
              (col.cat === 'hour' && col.item === sol.hour) ||
              (col.cat === 'relic' && col.item === sol.relic)
            ) {
              solvedMatrix[key] = 2; // ✓
            } else {
              solvedMatrix[key] = 1; // ✕
            }
          });
        });
        try {
          localStorage.setItem('order_clepsydra_matrix_state', JSON.stringify(solvedMatrix));
        } catch(e) {}
        renderMatrix();

        // Mark all 5 clues as analyzed
        const solvedClues = { '1': true, '2': true, '3': true, '4': true, '5': true };
        try {
          localStorage.setItem('order_clepsydra_clues_state', JSON.stringify(solvedClues));
        } catch(e) {}
        clueCards.forEach(c => c.classList.add('analyzed'));

        engageHydraulicSiphons();
      }

      function openOasisClepsydraModal() {
        const isLexiconDone = localStorage.getItem('order_desert_lexicon_completed') === 'true';
        const isClepsydraAlreadyDone = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';
        if (!isLexiconDone && !isClepsydraAlreadyDone && !(window.isAdminTester && window.isAdminTester())) {
          if (typeof window.showDesertToast === 'function') {
            window.showDesertToast('✦ TERRA INCOGNITA ✦ Solve the Desert Lexicon at the Nomad Ruins (Station 12) before entering the Oasis Clepsydra.');
          }
          return;
        }
        if (sfx) sfx.playMechanicalClick();
        if (!modal) return;
        modal.style.display = 'flex';
        modal.classList.remove('closing');

        renderMatrix();
        restoreSelections();

        const isDone = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';
        if (isDone) {
          if (keyInput) keyInput.value = 'XXX';
          applyCompleteState();
        } else {
          updateBasinVisuals(false);
        }
      }

      function closeOasisClepsydraModal() {
        if (sfx) sfx.playMechanicalClick();
        if (!modal) return;
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('closing');
        }, 220);
      }

      window.openOasisClepsydraModal = openOasisClepsydraModal;
      window.closeOasisClepsydraModal = closeOasisClepsydraModal;

      if (btnClose) btnClose.addEventListener('click', closeOasisClepsydraModal);
      if (btnEngage) btnEngage.addEventListener('click', engageHydraulicSiphons);
      if (btnSolveAll) btnSolveAll.addEventListener('click', solveAllClepsydra);
      if (btnResetGrid) {
        btnResetGrid.addEventListener('click', () => {
          if (sfx) sfx.playMechanicalClick();
          localStorage.removeItem('order_clepsydra_matrix_state');
          renderMatrix();
        });
      }

      if (btnFinish) {
        btnFinish.addEventListener('click', () => {
          closeOasisClepsydraModal();
          if (typeof window.switchMapPath === 'function') {
            window.switchMapPath('desert', true);
          }
          if (typeof window.updateDesertMapMarkers === 'function') {
            window.updateDesertMapMarkers();
          }
          // Hermes walks on to the gates of Tower II (Sheet 13A); the scene plays on the wire, then the road to Station 14
          if (typeof window.selectMapNode === 'function') window.selectMapNode(23, true);
          if (typeof window.showDesertToast === 'function') {
            window.showDesertToast('✦ TOWER II ✦ Hermes is walking to the gates of the Sandstone Sanctuary. Open the Cliffside Workshop to hear what he finds there, then the page “At the Gates of Tower II” of your journal.');
          }
        });
      }

      // Attach change listeners to all selects
      Object.keys(selects).forEach(seekerId => {
        const row = selects[seekerId];
        Object.keys(row).forEach(field => {
          const el = row[field];
          if (el) {
            el.addEventListener('change', () => {
              if (sfx) sfx.playMechanicalClick();
              saveSelections();
              const isDone = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';
              updateBasinVisuals(isDone);
            });
          }
        });
      });

      if (keyInput) {
        keyInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            engageHydraulicSiphons();
          }
        });
      }

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeOasisClepsydraModal();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
          closeOasisClepsydraModal();
        }
      });

      // Initial setup
      initClues();
      renderMatrix();
      restoreSelections();
      const isInitialDone = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';
      if (isInitialDone) {
        if (keyInput) keyInput.value = 'XXX';
        applyCompleteState();
      } else {
        updateBasinVisuals(false);
      }
    })();
