
    // =========================================================================
    // 📜 THE DESERT LEXICON & AL-QIBLA CONTROLLER (STATION 12)
    // =========================================================================
    (function initDesertLexiconController() {
      const modal = document.getElementById('modal-desert-lexicon');
      const btnClose = document.getElementById('btn-close-lexicon');
      const btnCarve = document.getElementById('btn-carve-word');
      const btnAutoFill = document.getElementById('btn-auto-fill-word');
      const btnSolveAll = document.getElementById('btn-lexicon-solve-all');
      const btnFinish = document.getElementById('btn-lexicon-finish');
      const wordInput = document.getElementById('lexicon-word-input');
      const activeClueLabel = document.getElementById('lexicon-active-clue-label');
      const gridTable = document.getElementById('lexicon-grid-table');
      const wordsCountEl = document.getElementById('lexicon-words-count');
      const dispatchEl = document.getElementById('lexicon-dispatch-text');
      const victoryCard = document.getElementById('lexicon-victory-card');
      const compassNeedle = document.getElementById('lexicon-compass-needle');
      const compassLabel = document.getElementById('lexicon-compass-label');
      const telemBearing = document.getElementById('lexicon-telem-bearing');
      const telemSigil = document.getElementById('lexicon-telem-sigil');
      const sigilStatus = document.getElementById('lexicon-sigil-status');

      // Canonical Crossword Specification (Matching Sheet 11A / build_desert_games.py)
      const LEXICON_WORDS = {
        'ac-2': { id: 'ac-2', label: '2 Across', clue: 'The blistering south-easterly wind that sweeps the dunes (7)', answer: 'SIROCCO', dir: 'across', r: 2, c: 1, len: 7 },
        'ac-3': { id: 'ac-3', label: '3 Across', clue: 'The eternal wanderer whose only roof is the starry vault (5)', answer: 'NOMAD', dir: 'across', r: 6, c: 3, len: 5 },
        'ac-6': { id: 'ac-6', label: '6 Across', clue: 'A verdant sanctuary where hidden subterranean springs quench thirst (5)', answer: 'OASIS', dir: 'across', r: 9, c: 4, len: 5 },
        'ac-8': { id: 'ac-8', label: '8 Across', clue: 'The sacred occultation when noon sun is crowned in darkness (7)', answer: 'ECLIPSE', dir: 'across', r: 11, c: 5, len: 7 },
        'ac-9': { id: 'ac-9', label: '9 Across', clue: 'The boundless circle where desert sands meet the vault of heaven (7)', answer: 'HORIZON', dir: 'across', r: 13, c: 5, len: 7 },
        'dn-1': { id: 'dn-1', label: '1 Down', clue: 'The solemn march of laden camels navigating by night stars (7)', answer: 'CARAVAN', dir: 'down', r: 0, c: 3, len: 7 },
        'dn-2': { id: 'dn-2', label: '2 Down', clue: 'The stone guardian of ancient dynasties keeping silent watch (6)', answer: 'SPHINX', dir: 'down', r: 2, c: 1, len: 6 },
        'dn-4': { id: 'dn-4', label: '4 Down', clue: 'The shimmering illusion of non-existent waters conjured by heat (6)', answer: 'MIRAGE', dir: 'down', r: 6, c: 5, len: 6 },
        'dn-5': { id: 'dn-5', label: '5 Down', clue: 'The shifting hills of golden powder sculpted by the midnight breeze (5)', answer: 'DUNES', dir: 'down', r: 7, c: 10, len: 5 },
        'dn-7': { id: 'dn-7', label: '7 Down', clue: 'The unseen whisperer whistling through sandstone canyons (6)', answer: 'SPIRIT', dir: 'down', r: 9, c: 8, len: 6 }
      };

      // 7 Circled Cells forming Master Key PHOENIX in order 1 to 7
      const KEY_CIRCLES = {
        '11,9': { num: 1, letter: 'P', word: 'ac-8' },
        '13,5': { num: 2, letter: 'H', word: 'ac-9' },
        '2,4':  { num: 3, letter: 'O', word: 'ac-2' },
        '10,10':{ num: 4, letter: 'E', word: 'dn-5' },
        '6,3':  { num: 5, letter: 'N', word: 'ac-3' },
        '9,7':  { num: 6, letter: 'I', word: 'ac-6' },
        '7,1':  { num: 7, letter: 'X', word: 'dn-2' }
      };

      // Word Starting Numbers in Grid
      const WORD_STARTS = {
        '0,3': '1',
        '2,1': '2',
        '6,3': '3',
        '6,5': '4',
        '7,10': '5',
        '9,4': '6',
        '9,8': '7',
        '11,5': '8',
        '13,5': '9'
      };

      // Hints climb three levels (hub/js/hint-ladder.js): a word the stele refuses is a miss
      const lexiconHints = window.EclipseHints.define({
        id: 's12-lexicon', station: 'Station 12', title: 'the desert lexicon', group: 'desert',
        anchor: () => document.querySelector('.lexicon-stele-input-bar'),
        solved: () => localStorage.getItem('order_desert_lexicon_completed') === 'true',
        texts: [
          'You do not need all ten words, Silvia. Look at the circled squares of Sheet 11A: seven words pass through them, and their letters make the sigil. Start with the clues you are surest of.',
          'Each clue is one desert word, and the number in brackets is how many letters it has. Where two words cross they share a letter, so every word you carve gives you letters for the words that cross it. When the seven circled squares are full, the dial turns by itself.',
          'Let us carve one together. 3 Across, five letters: the eternal wanderer whose only roof is the stars. Someone with no house, who moves with the seasons and sleeps under the sky: a NOMAD. Its first square is circled, so it is a letter of the sigil. Now look at the words that cross it.'
        ]
      });

      let activeWordId = 'ac-2';
      let solvedWords = new Set();

      // Load saved state
      try {
        const saved = localStorage.getItem('order_lexicon_solved_words');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) solvedWords = new Set(arr);
        }
      } catch (e) {}

      // Pre-compute map of cells: key "r,c" -> { letter, words: [wordId], isCircle, circleNum, startNum }
      const cellDataMap = {};
      Object.values(LEXICON_WORDS).forEach(w => {
        for (let i = 0; i < w.len; i++) {
          const r = w.dir === 'across' ? w.r : w.r + i;
          const c = w.dir === 'across' ? w.c + i : w.c;
          const key = `${r},${c}`;
          if (!cellDataMap[key]) {
            cellDataMap[key] = {
              r, c,
              letter: w.answer[i],
              words: [],
              isCircle: !!KEY_CIRCLES[key],
              circleNum: KEY_CIRCLES[key] ? KEY_CIRCLES[key].num : null,
              startNum: WORD_STARTS[key] || null
            };
          }
          cellDataMap[key].words.push(w.id);
        }
      });

      function renderCrosswordGrid() {
        if (!gridTable) return;
        let html = '';
        for (let r = 0; r < 15; r++) {
          html += '<tr>';
          for (let c = 0; c < 12; c++) {
            const key = `${r},${c}`;
            const data = cellDataMap[key];
            if (data) {
              const isCircled = data.isCircle ? ' circled' : '';
              const startBadge = data.startNum ? `<span class="lexicon-cell-badge">${data.startNum}</span>` : '';
              const circleBadge = data.circleNum ? `<span class="lexicon-cell-circle-num">${data.circleNum}</span>` : '';
              html += `
                <td class="lexicon-cw-cell active${isCircled}" id="lex-cell-${r}-${c}" data-r="${r}" data-c="${c}" data-words="${data.words.join(' ')}" onclick="window.selectLexiconCell(${r}, ${c})">
                  ${startBadge}
                  ${circleBadge}
                  <span class="cell-letter" id="lex-ltr-${r}-${c}"></span>
                </td>
              `;
            } else {
              html += `<td class="lexicon-cw-cell empty"></td>`;
            }
          }
          html += '</tr>';
        }
        gridTable.innerHTML = html;
        refreshGridLetters();
      }

      function refreshGridLetters() {
        // Fill letters for all solved words
        Object.values(LEXICON_WORDS).forEach(w => {
          const isSolved = solvedWords.has(w.id);
          const clueItem = document.querySelector(`.lexicon-clue-item[data-word-id="${w.id}"]`);
          if (clueItem) {
            clueItem.classList.toggle('solved', isSolved);
          }

          if (isSolved) {
            for (let i = 0; i < w.len; i++) {
              const r = w.dir === 'across' ? w.r : w.r + i;
              const c = w.dir === 'across' ? w.c + i : w.c;
              const ltrSpan = document.getElementById(`lex-ltr-${r}-${c}`);
              if (ltrSpan) {
                ltrSpan.textContent = w.answer[i];
              }
            }
          }
        });

        // Update solved counter
        if (wordsCountEl) {
          wordsCountEl.textContent = `${solvedWords.size} / 10 WORDS SOLVED`;
        }

        // Update Sigil Rack
        updateSigilRack();
        highlightActiveWord();
      }

      function updateSigilRack() {
        const letters = ['P', 'H', 'O', 'E', 'N', 'I', 'X'];
        let filledCount = 0;

        for (let i = 0; i < 7; i++) {
          const slot = document.getElementById(`lex-sigil-${i}`);
          if (!slot) continue;
          const letterSpan = slot.querySelector('.slot-letter');

          // Check if circle i+1 is revealed
          const circleEntry = Object.values(KEY_CIRCLES).find(k => k.num === (i + 1));
          const isWordSolved = circleEntry && solvedWords.has(circleEntry.word);

          if (isWordSolved) {
            slot.classList.add('filled');
            if (letterSpan) letterSpan.textContent = letters[i];
            filledCount++;
          } else {
            slot.classList.remove('filled');
            if (letterSpan) letterSpan.textContent = '';
          }
        }

        if (sigilStatus) {
          if (filledCount === 7) {
            sigilStatus.textContent = 'SIGIL VERIFIED ✓ [PHOENIX]';
            sigilStatus.style.color = '#86efac';
          } else {
            sigilStatus.textContent = `${filledCount} / 7 LETTERS ASSEMBLED`;
            sigilStatus.style.color = '#fbbf24';
          }
        }

        // If 7 letters collected or all words solved, trigger calibration!
        if (filledCount === 7 || solvedWords.size === 10) {
          lockAlQiblaCalibration();
        }
      }

      function lockAlQiblaCalibration() {
        // Rotate compass needle to 194°
        if (compassNeedle) {
          compassNeedle.setAttribute('transform', 'rotate(194 80 80)');
          compassNeedle.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
        if (compassLabel) {
          compassLabel.textContent = 'RAIDERS 194° SSW · TOWER II 14° NNE [LOCKED]';
          compassLabel.style.color = '#86efac';
        }
        if (telemBearing) {
          telemBearing.textContent = '194° SSW ⇄ 14° NNE [Locked]';
          telemBearing.style.color = '#86efac';
        }
        if (telemSigil) {
          telemSigil.textContent = 'PHOENIX [Verified]';
          telemSigil.style.color = '#86efac';
        }
        if (victoryCard) {
          victoryCard.style.display = 'block';
        }
        if (dispatchEl) {
          dispatchEl.textContent = '"Silvia, the Al-Qibla brass dial locked into place with a chime! The needle points 194° South-Southwest, the way the raiders fled; its tail points 14° North-Northeast, to Tower II and the Desert Oracle! The path across the Great Erg is unlocked! Look at the second stele: [R] × 2 = [F]. Update your Cipher Ledger!"';
        }

        try {
          localStorage.setItem('order_desert_lexicon_completed', 'true');
          localStorage.setItem('order_desert_station_active', '12');
        } catch (e) {}
        lexiconHints.refresh();

        updateDesertMapMarkers();
      }

      function highlightActiveWord() {
        // Remove previous selected classes
        const allCells = document.querySelectorAll('.lexicon-cw-cell.selected');
        allCells.forEach(c => c.classList.remove('selected'));

        const allClueItems = document.querySelectorAll('.lexicon-clue-item');
        allClueItems.forEach(ci => ci.classList.remove('active'));

        const activeClue = document.querySelector(`.lexicon-clue-item[data-word-id="${activeWordId}"]`);
        if (activeClue) activeClue.classList.add('active');

        const word = LEXICON_WORDS[activeWordId];
        if (!word) return;

        if (activeClueLabel) {
          activeClueLabel.textContent = `${word.label} (${word.len})`;
        }

        for (let i = 0; i < word.len; i++) {
          const r = word.dir === 'across' ? word.r : word.r + i;
          const c = word.dir === 'across' ? word.c + i : word.c;
          const cell = document.getElementById(`lex-cell-${r}-${c}`);
          if (cell) cell.classList.add('selected');
        }

        if (wordInput) {
          wordInput.placeholder = solvedWords.has(activeWordId) ? word.answer : `ENTER ${word.len} LETTERS...`;
          wordInput.value = '';
        }
      }

      window.selectLexiconClue = function(wordId) {
        if (sfx) sfx.playMechanicalClick();
        if (LEXICON_WORDS[wordId]) {
          activeWordId = wordId;
          highlightActiveWord();
        }
      };

      window.selectLexiconCell = function(r, c) {
        const key = `${r},${c}`;
        const data = cellDataMap[key];
        if (!data || !data.words || data.words.length === 0) return;

        // If cell belongs to activeWordId, toggle to second word if available
        if (data.words.includes(activeWordId) && data.words.length > 1) {
          const nextWord = data.words.find(w => w !== activeWordId);
          window.selectLexiconClue(nextWord);
        } else {
          window.selectLexiconClue(data.words[0]);
        }
      };

      function carveActiveWord() {
        if (!wordInput) return;
        const val = wordInput.value.trim().toUpperCase();
        const word = LEXICON_WORDS[activeWordId];
        if (!word) return;

        if (val === word.answer) {
          if (sfx) sfx.playCelestialChime();
          solvedWords.add(activeWordId);
          try {
            localStorage.setItem('order_lexicon_solved_words', JSON.stringify([...solvedWords]));
          } catch (e) {}

          if (dispatchEl) {
            dispatchEl.textContent = `"Carved '${word.answer}' on the sandstone stele! The letters align with the ancient inscriptions."`;
          }

          refreshGridLetters();

          // Auto-advance to next unsolved clue
          const remaining = Object.keys(LEXICON_WORDS).filter(id => !solvedWords.has(id));
          if (remaining.length > 0) {
            activeWordId = remaining[0];
            highlightActiveWord();
          }
        } else {
          if (sfx) sfx.playMechanicalClick();
          wordInput.classList.add('decoy-hit');
          setTimeout(() => wordInput.classList.remove('decoy-hit'), 800);
          if (dispatchEl) {
            dispatchEl.textContent = `"Wait, Silvia! '${val || '???'}' does not fit the carved pattern of ${word.label}. Check Sheet 11A in your journal!"`;
          }
          if (val) lexiconHints.fail();
        }
      }

      function autoFillActiveWord() {
        const word = LEXICON_WORDS[activeWordId];
        if (!word) return;
        if (sfx) sfx.playChimeHover();
        if (wordInput) wordInput.value = word.answer;
        carveActiveWord();
      }

      function solveAllLexicon() {
        if (sfx) sfx.playCelestialChime();
        Object.keys(LEXICON_WORDS).forEach(id => solvedWords.add(id));
        try {
          localStorage.setItem('order_lexicon_solved_words', JSON.stringify([...solvedWords]));
        } catch (e) {}
        refreshGridLetters();
      }

      function openDesertLexiconModal() {
        const isPlayaDone = localStorage.getItem('order_salt_playa_completed') === 'true';
        const isLexiconAlreadyDone = localStorage.getItem('order_desert_lexicon_completed') === 'true';
        if (!isPlayaDone && !isLexiconAlreadyDone && !(window.isAdminTester && window.isAdminTester())) {
          if (typeof window.showDesertToast === 'function') {
            window.showDesertToast('✦ TERRA INCOGNITA ✦ Guide Hermes across the Salt Playa (Station 11) before he reaches the Nomad Ruins.');
          }
          return;
        }
        if (sfx) sfx.playMechanicalClick();
        if (!modal) return;
        modal.style.display = 'flex';
        modal.classList.remove('closing');

        renderCrosswordGrid();

        const isDone = localStorage.getItem('order_desert_lexicon_completed') === 'true';
        if (isDone) {
          solveAllLexicon();
        } else {
          highlightActiveWord();
        }
      }

      function closeDesertLexiconModal() {
        if (sfx) sfx.playMechanicalClick();
        if (!modal) return;
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('closing');
        }, 220);
      }

      window.openDesertLexiconModal = openDesertLexiconModal;
      window.closeDesertLexiconModal = closeDesertLexiconModal;

      if (btnClose) btnClose.addEventListener('click', closeDesertLexiconModal);
      if (btnCarve) btnCarve.addEventListener('click', carveActiveWord);
      if (btnAutoFill) btnAutoFill.addEventListener('click', autoFillActiveWord);
      if (btnSolveAll) btnSolveAll.addEventListener('click', solveAllLexicon);

      if (wordInput) {
        wordInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            carveActiveWord();
          }
        });
      }

      if (btnFinish) {
        btnFinish.addEventListener('click', () => {
          closeDesertLexiconModal();
          if (typeof window.switchMapPath === 'function') {
            window.switchMapPath('desert', true);
          }
        });
      }

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeDesertLexiconModal();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
          closeDesertLexiconModal();
        }
      });

      // Initial setup
      renderCrosswordGrid();
    })();

    /* ===================================================================
       STATION 12: THE OASIS CLEPSYDRA (4 WELLS) CONTROLLER
       =================================================================== */
