
    // =========================================================================
    // 🎒 HERMES'S SATCHEL (CAIRN SEALS) & 🪨 CAIRN I · THE WASH RIVER MARKER (DAWN SEGMENT)
    // =========================================================================
    (function initSatchelAndCairnOne() {
      const sfx = window.sfx || null;
      const SEAL_ROMAN = ['I', 'II', 'III', 'IV', 'V'];
      const toast = (msg) => { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); };
      const isAdmin = () => typeof window.isAdminTester === 'function' && window.isAdminTester();
      const hasSeal = (n) => localStorage.getItem('order_seal_cairn_' + n) === 'true';
      const cairnOneDone = () => localStorage.getItem('order_cairn1_completed') === 'true';

      // ---------- The satchel in the header ----------
      function renderSatchel(justAdded) {
        const wrap = document.getElementById('satchel-wrap');
        if (!wrap) return;
        wrap.innerHTML = '<span class="satchel-label">Cairns</span>';

        // The 5 Cairns Seals
        SEAL_ROMAN.forEach((roman, i) => {
          const n = i + 1;
          const anchor = document.createElement('span');
          anchor.className = 'satchel-slot-anchor';
          const slot = document.createElement('button');
          slot.type = 'button';
          const filled = hasSeal(n);
          slot.className = 'satchel-slot' + (filled ? ' filled' : '') + (justAdded === n ? ' just-added' : '');
          slot.textContent = filled ? roman : '·';
          slot.title = filled ? 'Seal of Cairn ' + roman : 'Cairn not found yet.';
          slot.setAttribute('aria-label', slot.title);
          const tip = document.createElement('span');
          tip.className = 'satchel-slot-tip';
          tip.setAttribute('role', 'status');
          tip.setAttribute('aria-live', 'polite');
          tip.textContent = filled
            ? ('Seal of Cairn ' + roman)
            : 'Cairn not found yet.';
          slot.addEventListener('click', () => {
            if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
            // Local tip under this Cairn — not the page-level desert toast
            wrap.querySelectorAll('.satchel-slot-tip.is-visible').forEach(function (t) {
              t.classList.remove('is-visible');
              if (t._hide) clearTimeout(t._hide);
            });
            tip.classList.remove('is-visible');
            void tip.offsetWidth;
            tip.classList.add('is-visible');
            if (tip._hide) clearTimeout(tip._hide);
            tip._hide = setTimeout(function () { tip.classList.remove('is-visible'); }, 2000);
          });
          anchor.appendChild(slot);
          anchor.appendChild(tip);
          wrap.appendChild(anchor);
        });
      }

      // Visible with the chat button once the Desert / storm era is live (Silvia after Station 09),
      // or once Hermes has a wire step, a tool, or any Cairn seal (always for the admin tester).
      function updateSatchelVisibility() {
        const wrap = document.getElementById('satchel-wrap');
        const invBtn = document.getElementById('btn-open-inventory');
        const chatBtn = document.getElementById('btn-header-messenger');
        if (!wrap) return;
        const chatVisible = !!chatBtn && chatBtn.style.display !== 'none';
        const step = parseInt(localStorage.getItem('order_field_wire_step') || '0', 10) || 0;
        const hasTool = !!localStorage.getItem('order_satchel_expedition_item');
        const desertEra =
          localStorage.getItem('order_desert_path_unlocked') === 'true' ||
          localStorage.getItem('order_sandstorm_active') === 'true' ||
          localStorage.getItem('seeker_silvia_sandstorm_active') === 'true';
        const reached = isAdmin() || desertEra || step >= 1 || hasTool || SEAL_ROMAN.some((_, i) => hasSeal(i + 1));
        wrap.style.display = (chatVisible && reached) ? 'inline-flex' : 'none';
        if (invBtn) invBtn.style.display = (chatVisible && reached) ? 'inline-flex' : 'none';
        if (typeof window.updateInventoryBadge === 'function') window.updateInventoryBadge();
      }

      window.grantCairnSeal = function (n) {
        n = parseInt(n, 10);
        if (!(n >= 1 && n <= 5)) return;
        const had = hasSeal(n);
        try { localStorage.setItem('order_seal_cairn_' + n, 'true'); } catch (e) {}
        if (n === 1 && typeof addRelicToInventory === 'function') {
          addRelicToInventory('seal_cairn_1');
        }
        renderSatchel(had ? 0 : n);
        updateSatchelVisibility();
        if (!had) {
          const sealName = n === 1 ? 'Wash River Seal' : ('Seal of Cairn ' + SEAL_ROMAN[n - 1]);
          toast('✦ ' + sealName + ' added to Hermes\'s satchel ✦');
          // The five seals come home: celebrated once, whichever seal is the last to arrive
          const all = [1, 2, 3, 4, 5].every((k) => hasSeal(k));
          if (all && localStorage.getItem('order_five_seals_celebrated') !== 'true') {
            try { localStorage.setItem('order_five_seals_celebrated', 'true'); } catch (e) {}
            if (typeof window.showFiveSealsCeremony === 'function') setTimeout(window.showFiveSealsCeremony, 900);
          }
        }
      };
      window.renderSatchel = renderSatchel;
      window.updateSatchelVisibility = updateSatchelVisibility;

      // ---------- Cairn I: four stones, three foundations ----------
      const modal = document.getElementById('modal-cairn-one');
      if (!modal) { renderSatchel(0); updateSatchelVisibility(); return; }
      const pegsEl = document.getElementById('cairn1-pegs');
      const movesEl = document.getElementById('cairn1-telem-moves');
      const placedEl = document.getElementById('cairn1-telem-placed');
      const dispatchEl = document.getElementById('cairn1-dispatch-text');
      const victoryCard = document.getElementById('cairn1-victory-card');
      const btnClose = document.getElementById('btn-close-cairn1');
      const btnUndo = document.getElementById('btn-cairn1-undo');
      const btnReset = document.getElementById('btn-cairn1-reset');
      const btnHint = document.getElementById('btn-cairn1-hint');
      const btnFinish = document.getElementById('btn-cairn1-finish');

      const STONES = 4;
      const TARGET = 2;
      const STONE_NAMES = ['smallest', 'second', 'third', 'largest'];
      const PEG_NAMES = ['first', 'second', 'third'];
      const PEG_ROMAN = ['I', 'II', 'III'];
      const START_LINE = 'Silvia, the stones are heavy and my arms are tired. Tell me which foundation to lift from, and where to set the stone down.';

      let pegs = [[4, 3, 2, 1], [], []];
      let selected = -1;
      let moves = 0;
      let history = [];
      let solved = false;

      const say = (text) => { if (dispatchEl) dispatchEl.textContent = '"' + text + '"'; };
      const topOf = (p) => pegs[p][pegs[p].length - 1];

      function fresh() {
        pegs = [[4, 3, 2, 1], [], []];
        selected = -1;
        moves = 0;
        history = [];
        solved = false;
        if (victoryCard) {
          victoryCard.style.display = 'none';
          const textEl = victoryCard.querySelector('.chasm-victory-text');
          if (textEl) {
            textEl.innerHTML = '"Silvia, the last stone settled and something clicked deep inside the base. A hollow opened under the third foundation, and in it lay a flat disc of sandstone: a sun over a wavy line. The Wash River seal. It is in my satchel now."';
          }
        }
      }

      function render() {
        if (!pegsEl) return;
        pegsEl.innerHTML = '';
        for (let p = 0; p < 3; p++) {
          const peg = document.createElement('button');
          peg.type = 'button';
          let pegClass = 'c1-peg' + (selected === p ? ' is-source' : '');
          if (selected !== -1 && p !== selected) {
            const isTargetOk = !pegs[p].length || topOf(p) > topOf(selected);
            pegClass += isTargetOk ? ' is-target-ok' : ' is-target-blocked';
          }
          peg.className = pegClass;
          peg.setAttribute('data-label', 'Foundation ' + PEG_ROMAN[p]);
          peg.setAttribute('aria-label', 'Foundation ' + PEG_ROMAN[p] + ', ' + pegs[p].length + ' stones');
          peg.disabled = solved;

          // Drag and drop dropzone on each foundation
          peg.addEventListener('dragover', (e) => {
            if (solved) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          });
          peg.addEventListener('dragenter', (e) => {
            if (solved) return;
            e.preventDefault();
            if (selected !== -1 && p !== selected) {
              const isTargetOk = !pegs[p].length || topOf(p) > topOf(selected);
              peg.classList.add(isTargetOk ? 'is-drag-hover' : 'is-target-blocked');
            }
          });
          peg.addEventListener('dragleave', () => {
            peg.classList.remove('is-drag-hover');
          });
          peg.addEventListener('drop', (e) => {
            if (solved) return;
            e.preventDefault();
            peg.classList.remove('is-drag-hover');
            const fromStr = e.dataTransfer.getData('text/plain');
            const fromPeg = parseInt(fromStr, 10);
            if (!isNaN(fromPeg) && fromPeg >= 0 && fromPeg < 3) {
              if (fromPeg === p) {
                selected = -1;
                if (sfx && typeof sfx.playStoneThud === 'function') sfx.playStoneThud(topOf(p));
                render();
                say('Back it goes. Which stone shall I lift instead?');
              } else {
                selected = fromPeg;
                onPeg(p, peg);
              }
            }
          });

          pegs[p].forEach((size, i) => {
            const isTopStone = (i === pegs[p].length - 1);
            const stone = document.createElement('span');
            stone.className = 'c1-stone' + (selected === p && isTopStone ? ' is-lifted' : '') + (solved ? ' is-seal-glow' : '');
            stone.setAttribute('data-size', String(size));
            if (size === 4) {
              const glyph = document.createElement('span');
              glyph.className = 'c1-stone-glyph';
              glyph.textContent = '— ☉ —';
              stone.appendChild(glyph);
            }

            // Dual control: top stone can be dragged directly or clicked
            if (isTopStone && !solved) {
              stone.draggable = true;
              stone.setAttribute('title', 'Click to lift or drag directly to a foundation');
              stone.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', String(p));
                e.dataTransfer.effectAllowed = 'move';
                selected = p;
                stone.classList.add('is-dragging');
                if (sfx && typeof sfx.playStoneLift === 'function') sfx.playStoneLift();
                else if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
                say('I am holding the ' + STONE_NAMES[topOf(p) - 1] + ' stone from the ' + PEG_NAMES[p] + ' foundation. Where should it rest?');
                setTimeout(() => { render(); }, 10);
              });
              stone.addEventListener('dragend', () => {
                stone.classList.remove('is-dragging');
              });
            }

            peg.appendChild(stone);
          });
          peg.addEventListener('click', () => onPeg(p, peg));
          pegsEl.appendChild(peg);
        }
        if (movesEl) movesEl.textContent = solved && !history.length ? '—' : String(moves);
        if (placedEl) placedEl.textContent = pegs[TARGET].length + ' / ' + STONES;
        if (btnUndo) btnUndo.disabled = solved || history.length === 0;
        if (btnHint) btnHint.disabled = solved;
      }

      function refuse(peg, line) {
        say(line);
        peg.classList.remove('shake');
        void peg.offsetWidth;
        peg.classList.add('shake');
      }

      function onPeg(p, pegEl) {
        if (solved) return;
        if (selected === -1) {
          if (!pegs[p].length) { refuse(pegEl, 'There is no stone on that foundation, Silvia. Pick a pile that has one.'); return; }
          selected = p;
          if (sfx && typeof sfx.playStoneLift === 'function') sfx.playStoneLift();
          else if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          render();
          say('I am holding the ' + STONE_NAMES[topOf(p) - 1] + ' stone from the ' + PEG_NAMES[p] + ' foundation. Where should it rest?');
          return;
        }
        if (p === selected) {
          selected = -1;
          if (sfx && typeof sfx.playStoneThud === 'function') sfx.playStoneThud(topOf(p));
          else if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          render();
          say('Back it goes. Which stone shall I lift instead?');
          return;
        }
        const size = topOf(selected);
        if (pegs[p].length && topOf(p) < size) {
          refuse(pegEl, 'A big stone on a small one would crush it, and the law of the stones forbids it. Try another foundation.');
          return;
        }
        pegs[p].push(pegs[selected].pop());
        history.push({ from: selected, to: p });
        moves++;
        selected = -1;
        if (sfx && typeof sfx.playStoneThud === 'function') sfx.playStoneThud(size);
        else if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (pegs[TARGET].length === STONES) {
          solve();
          return;
        }
        render();
        say(moves < 4 ? 'Set down. What next?' : 'Set down. ' + moves + ' lifts so far. What next?');
      }

      function undo() {
        if (solved || !history.length) return;
        const last = history.pop();
        pegs[last.from].push(pegs[last.to].pop());
        moves = Math.max(0, moves - 1);
        selected = -1;
        render();
        say('Taken back. Everything is as it was a moment ago.');
      }

      function reset() {
        if (solved) return;
        fresh();
        render();
        say('All four stones back on the first foundation. We start again, slowly this time.');
      }

      // A one-step nudge: breadth-first search from the current position to the finished pile
      function nextMove() {
        const start = [0, 1, 2, 3].map((d) => {
          for (let p = 0; p < 3; p++) if (pegs[p].indexOf(d + 1) !== -1) return p;
          return 0;
        });
        const goal = [TARGET, TARGET, TARGET, TARGET].join('');
        const seen = { [start.join('')]: null };
        const queue = [start];
        while (queue.length) {
          const s = queue.shift();
          if (s.join('') === goal) {
            let key = s.join('');
            let step = null;
            while (seen[key]) { step = seen[key]; key = step.prev; }
            return step;
          }
          for (let from = 0; from < 3; from++) {
            const d = s.indexOf(from);
            if (d === -1) continue;
            for (let to = 0; to < 3; to++) {
              if (to === from) continue;
              const t = s.indexOf(to);
              if (t !== -1 && t < d) continue;
              const n = s.slice();
              n[d] = to;
              const k = n.join('');
              if (k in seen) continue;
              seen[k] = { stone: d, to: to, prev: s.join('') };
              queue.push(n);
            }
          }
        }
        return null;
      }

      function hint() {
        if (solved) return;
        selected = -1;
        render();
        const step = nextMove();
        if (!step) { say('Hmm. I am as lost as you are. Let us start again.'); return; }
        say('Let me think out loud, Silvia... what if the ' + STONE_NAMES[step.stone] + ' stone went to the ' + PEG_NAMES[step.to] + ' foundation?');
      }

      function solve() {
        solved = true;
        try {
          localStorage.setItem('order_cairn1_completed', 'true');
          if (moves === 15) {
            localStorage.setItem('order_cairn1_optimal', 'true');
          }
        } catch (e) {}
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        render();
        if (victoryCard) {
          victoryCard.style.display = 'block';
          const textEl = victoryCard.querySelector('.chasm-victory-text');
          if (textEl) {
            if (moves === 15) {
              textEl.innerHTML = '"Silvia, fifteen lifts—<strong>the exact mathematical minimum of the ancient surveyors!</strong> Not a single stone was lifted in vain. The last stone settled and something clicked deep inside the base. A hollow opened under the third foundation, and in it lay a flat disc of sandstone: a sun over a wavy line. The Wash River seal. It is safe in my satchel now."';
            } else {
              textEl.innerHTML = '"Silvia, the last stone settled and something clicked deep inside the base. A hollow opened under the third foundation, and in it lay a flat disc of sandstone: a sun over a wavy line. The Wash River seal. It is in my satchel now."';
            }
          }
        }
        if (moves === 15) {
          say('Fifteen lifts! Exactly fifteen—the optimal path of the Order. The whole pile stands on the third foundation, and the base is humming under my hands.');
        } else {
          say('The whole pile stands on the third foundation, and the base is humming under my hands.');
        }
        window.grantCairnSeal(1);
        document.dispatchEvent(new CustomEvent('dawn:cairn1-solved', { detail: { moves } }));
      }

      function openCairnOneModal() {
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        if (cairnOneDone()) {
          fresh();
          pegs = [[], [], [4, 3, 2, 1]];
          solved = true;
          if (victoryCard) victoryCard.style.display = 'block';
          say('We lifted every stone together, Silvia. The Wash River seal is safe in my satchel.');
        } else {
          if (solved) fresh();
          if (!history.length && moves === 0) say(START_LINE);
        }
        render();
      }

      function closeCairnOneModal() {
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('closing');
          // Just solved: take the player back to the chat, where Hermes tells what he found
          if (window.__dawnFinaleLive && typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
        }, 220);
      }

      window.openCairnOneModal = openCairnOneModal;
      window.closeCairnOneModal = closeCairnOneModal;

      if (btnClose) btnClose.addEventListener('click', closeCairnOneModal);
      if (btnFinish) btnFinish.addEventListener('click', closeCairnOneModal);
      if (btnUndo) btnUndo.addEventListener('click', undo);
      if (btnReset) btnReset.addEventListener('click', reset);
      if (btnHint) btnHint.addEventListener('click', hint);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeCairnOneModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (modal && modal.style.display !== 'none') closeCairnOneModal();
          const invM = document.getElementById('modal-satchel-inventory');
          if (invM && invM.style.display !== 'none' && typeof window.closeSatchelInventoryModal === 'function') window.closeSatchelInventoryModal();
          const acqM = document.getElementById('modal-item-acquired');
          if (acqM && acqM.style.display !== 'none' && typeof window.closeItemAcquiredModal === 'function') window.closeItemAcquiredModal();
        }
      });

      // Relics Satchel Inventory Modal & Acquired Popup Wire-up
      const btnOpenInv = document.getElementById('btn-open-inventory');
      const btnCloseInv = document.getElementById('btn-close-inventory');
      const invModal = document.getElementById('modal-satchel-inventory');
      const acqModal = document.getElementById('modal-item-acquired');
      const btnCollectAcq = document.getElementById('iac-btn-collect');

      const seekerActivePill = document.getElementById('seeker-active-pill');
      if (seekerActivePill) {
        seekerActivePill.addEventListener('click', () => {
          if (typeof window.openSatchelInventoryModal === 'function') window.openSatchelInventoryModal('surveyor_compass');
        });
        seekerActivePill.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (typeof window.openSatchelInventoryModal === 'function') window.openSatchelInventoryModal('surveyor_compass');
          }
        });
      }

      if (btnOpenInv) btnOpenInv.addEventListener('click', () => {
        if (typeof window.openSatchelInventoryModal === 'function') window.openSatchelInventoryModal();
      });
      if (btnCloseInv) btnCloseInv.addEventListener('click', () => {
        if (typeof window.closeSatchelInventoryModal === 'function') window.closeSatchelInventoryModal();
      });
      if (btnCollectAcq) btnCollectAcq.addEventListener('click', () => {
        if (typeof window.closeItemAcquiredModal === 'function') window.closeItemAcquiredModal();
      });
      if (invModal) invModal.addEventListener('click', (e) => {
        if (e.target === invModal && typeof window.closeSatchelInventoryModal === 'function') window.closeSatchelInventoryModal();
      });
      if (acqModal) acqModal.addEventListener('click', (e) => {
        if (e.target === acqModal && typeof window.closeItemAcquiredModal === 'function') window.closeItemAcquiredModal();
      });

      // ---------- Servant of Tower II & Cairn I Check Modal Wire-up ----------
      const servantModal = document.getElementById('modal-servant-cairn-check');
      const btnCloseServant = document.getElementById('btn-close-servant-cairn');
      const btnServantRetrace = document.getElementById('btn-servant-retrace');
      const btnServantRefuse = document.getElementById('btn-servant-refuse');
      const btnServantConfirmClose = document.getElementById('btn-servant-confirm-close');
      const servantActions = document.getElementById('servant-cairn-choice-actions');
      const servantResBox = document.getElementById('servant-cairn-result-box');
      const servantResText = document.getElementById('servant-cairn-result-text');

      function openServantCairnCheckModal() {
        if (!servantModal) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (servantActions) servantActions.style.display = 'flex';
        if (servantResBox) servantResBox.style.display = 'none';
        servantModal.style.display = 'flex';
        servantModal.classList.remove('closing');
      }

      function closeServantCairnCheckModal() {
        if (!servantModal) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        servantModal.classList.add('closing');
        setTimeout(() => {
          servantModal.style.display = 'none';
          servantModal.classList.remove('closing');
        }, 220);
      }

      window.openServantCairnCheckModal = openServantCairnCheckModal;
      window.closeServantCairnCheckModal = closeServantCairnCheckModal;

      if (btnCloseServant) btnCloseServant.addEventListener('click', closeServantCairnCheckModal);
      if (servantModal) servantModal.addEventListener('click', (e) => { if (e.target === servantModal) closeServantCairnCheckModal(); });

      if (btnServantRetrace) {
        btnServantRetrace.addEventListener('click', () => {
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          try {
            localStorage.removeItem('order_cairn1_bypassed');
            localStorage.removeItem('order_cairn1_locked_until_3_cairns');
          } catch (e) {}
          closeServantCairnCheckModal();
          setTimeout(() => {
            if (typeof window.openCairnOneModal === 'function') window.openCairnOneModal();
            if (typeof window.updateDawnMapLayer === 'function') window.updateDawnMapLayer();
          }, 240);
        });
      }

      if (btnServantRefuse) {
        btnServantRefuse.addEventListener('click', () => {
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          try {
            localStorage.setItem('order_cairn1_locked_until_3_cairns', 'true');
          } catch (e) {}
          if (servantActions) servantActions.style.display = 'none';
          if (servantResBox && servantResText) {
            servantResText.textContent = '"As you command, Silvia. We do not turn back. But the Servant crosses his arms: \'Until you have proven your worth with at least two or three other sacred seals across the desert pilgrimage, the path back to the first cairn will remain closed to you.\'"';
            servantResBox.style.display = 'block';
          }
          if (typeof window.updateDawnMapLayer === 'function') window.updateDawnMapLayer();
        });
      }

      if (btnServantConfirmClose) {
        btnServantConfirmClose.addEventListener('click', () => {
          closeServantCairnCheckModal();
        });
      }

      window.checkServantCairnRequirement = function () {
        const hasSeal1 = localStorage.getItem('order_seal_cairn_1') === 'true' || localStorage.getItem('order_cairn1_completed') === 'true';
        const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
        if (!isBypassed || hasSeal1) return false;

        const isLockedTemp = localStorage.getItem('order_cairn1_locked_until_3_cairns') === 'true';
        const otherSeals = [2, 3, 4, 5].filter(n => localStorage.getItem('order_seal_cairn_' + n) === 'true').length;

        // If locked until 2-3 cairns, check if the player already gathered at least 2 other seals
        if (isLockedTemp) {
          if (otherSeals >= 2) {
            try { localStorage.removeItem('order_cairn1_locked_until_3_cairns'); } catch (e) {}
            openServantCairnCheckModal();
            return true;
          } else {
            if (typeof window.showDesertToast === 'function') {
              window.showDesertToast('The Servant of Tower II stands firm: you must gather at least 2–3 other cairn seals before returning to Cairn I.');
            }
            return true;
          }
        }

        openServantCairnCheckModal();
        return true;
      };

      fresh();
      renderSatchel(0);
      updateSatchelVisibility();
    })();
