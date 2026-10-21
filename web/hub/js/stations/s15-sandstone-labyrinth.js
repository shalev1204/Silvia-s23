
    // =========================================================================
    // 🌀 STATION 15 · THE SANDSTONE LABYRINTH & CAIRN III (ESCAPE FROM THE BC ASHES · SHEET 14B)
    // Part I (journal): the eight-letter sigil opens the copper plate of Cairn III.
    // Part II (web only): a turn-based escape through a dark labyrinth. Every step of Hermes
    // (or holding still) moves every torch one square along its round.
    // The level was generated and checked offline (search over square × turn): it can be solved from
    // any phase of the rounds, the shortest road that ignores the torches gets caught, and the gold
    // star and the raiders' camp sit on squares that every road must cross.
    // Reward: the Seal of Cairn III and two Ledger equations.
    // =========================================================================
    (function initSandstoneLabyrinth() {
      const modal = document.getElementById('modal-sandstone-labyrinth');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const KEYS = {
        awake: 'order_labyrinth_awake',
        done: 'order_sandstone_labyrinth_completed',
        fails: 'order_labyrinth_key_fails',
        hint: 'order_labyrinth_hint',
        captures: 'order_labyrinth_captures',
        torchHint: 'order_labyrinth_torch_hint',
        star: 'order_labyrinth_star_seen',
        camp: 'order_labyrinth_camp_seen'
      };
      const SIGIL = 'WINDROSE';
      const LIVES = 3;              // close calls per run
      const LAMP = 2;               // Hermes's lamp: squares around him (in both axes)
      const REACH = 2;              // a torch lights its square and this many squares ahead

      // Walls: one hex digit per square (0x1 north, 0x2 east, 0x4 south, 0x8 west). Torches: their rounds, square by square.
      const LEVEL = {
        cols: 13,
        rows: 11,
        walls: [
          '955539391553b',
          'ad53ac2c4396a',
          'a93c43c396c56',
          'aac1569683953',
          '869693c3c2a92',
          'a9456c3c3c6aa',
          'c2939503c556a',
          '96ac2d6813956',
          'a943c556aaa93',
          'c2929153c46aa',
          'd46c46d455546'
        ],
        start: [6, 0],
        exit: [0, 10],
        star: [10, 6],
        camp: [8, 7],
        guards: [
          [[12, 5], [12, 4], [12, 3], [11, 3], [10, 3], [10, 4], [10, 3], [11, 3], [12, 3], [12, 4]],
          [[8, 7], [9, 7], [9, 8], [9, 9], [10, 9], [10, 8], [10, 9], [9, 9], [9, 8], [9, 7]],
          [[2, 7], [2, 8], [3, 8], [2, 8]],
          [[4, 7], [4, 6], [5, 6], [6, 6], [7, 6], [7, 7], [7, 8], [6, 8], [5, 8], [4, 8]]
        ]
      };
      const DIRS = [
        { bit: 1, dx: 0, dy: -1, name: 'north' },
        { bit: 2, dx: 1, dy: 0, name: 'east' },
        { bit: 4, dx: 0, dy: 1, name: 'south' },
        { bit: 8, dx: -1, dy: 0, name: 'west' }
      ];
      const CELL = 10;
      const cellKey = (x, y) => y * LEVEL.cols + x;
      const wallBits = (x, y) => parseInt(LEVEL.walls[y][x], 16);
      const dirOf = (dx, dy) => DIRS.find((d) => d.dx === dx && d.dy === dy) || null;
      const canStep = (x, y, dir) => !(wallBits(x, y) & dir.bit);
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      const PERIOD = LEVEL.guards.reduce((acc, r) => acc * r.length / gcd(acc, r.length), 1);

      function guardAt(route, t) { return route[t % route.length]; }
      // Squares lit by the torches at turn t
      function litAt(t) {
        const lit = new Set();
        LEVEL.guards.forEach((route) => {
          const [x, y] = guardAt(route, t);
          const [nx, ny] = guardAt(route, t + 1);
          lit.add(cellKey(x, y));
          const dir = dirOf(nx - x, ny - y);
          if (!dir) return;
          let cx = x, cy = y;
          for (let i = 0; i < REACH && canStep(cx, cy, dir); i++) {
            cx += dir.dx; cy += dir.dy;
            lit.add(cellKey(cx, cy));
          }
        });
        return lit;
      }

      const el = {
        close: $('btn-close-labyrinth'), sigilCard: $('laby-sigil-card'), keyInput: $('laby-key-input'), speak: $('btn-laby-speak'),
        keyFeedback: $('laby-key-feedback'), game: $('laby-game'), gameInner: document.querySelector('#laby-game .monolith-game-inner'),
        board: $('laby-board'), lives: $('laby-lives'), turnLabel: $('laby-turn-label'), moveFeedback: $('laby-move-feedback'),
        hint: $('laby-hint'), victory: $('laby-victory'), victoryText: $('laby-victory-text'), finish: $('btn-laby-finish'),
        dispatch: $('laby-dispatch-text'), pad: { up: $('btn-laby-up'), down: $('btn-laby-down'), left: $('btn-laby-left'), right: $('btn-laby-right'), wait: $('btn-laby-wait') },
        tSigil: $('laby-telem-sigil'), tTurn: $('laby-telem-turn'), tLives: $('laby-telem-lives'), tSeal: $('laby-telem-seal')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const torchHintOn = () => get(KEYS.torchHint) === 'true';

      // Hints climb three levels (hub/js/hint-ladder.js); level 2 is the older help of each part
      const hints = window.EclipseHints;
      const sigilHints = hints.define({
        id: 's15-sigil', station: 'Station 15', title: 'the sigil of the true road', group: 'desert',
        anchor: el.keyFeedback, solved: isAwake, legacyKey: KEYS.hint,
        texts: [
          'Start at the Southern Mouth of Sheet 14B, not at the cairn. Only the arches that stand on the one true road count, in the order you pass beneath them.',
          'I wrote down how to find the true road. It is in Ask Hermes: "How do I find the true road of Sheet 14B?"',
          'Let us start together. Put your pencil on the Southern Mouth and shade in every dead end you leave behind; the side fissures have arches too, to fool the hurried. The first arch on the true road carries a W: if your pencil reaches another letter first, you have strayed. Seven arches more, up to the cairn.'
        ]
      });
      const torchHints = hints.define({
        id: 's15-torches', station: 'Station 15', title: 'the torches in the labyrinth', group: 'desert',
        anchor: el.moveFeedback, solved: isDone, active: isAwake, legacyKey: KEYS.torchHint,
        texts: [
          'Watch the torches before you move. Each one walks the same round again and again, and it only lights what is in front of it.',
          'I have drawn their rounds on your board. My note is in Ask Hermes: "How do the raiders\' torches move?"',
          'Let us pass the first torch together. When one comes into view, hold still in the dark and count the turns until it is back on the same square: that is its round. Step into its corridor just after it has passed you and turned away, and keep behind it. Every road out passes the gold star and the raiders\' camp: make for the star first.'
        ]
      });

      // One run of the escape. It lives only while the page is open; a reload starts again at Cairn III.
      let run = null;
      const seen = new Set();
      function newRun() {
        run = { x: LEVEL.start[0], y: LEVEL.start[1], t: 0, moves: 0, lives: LIVES, trail: [] };
        reveal();
      }
      function reveal() {
        for (let y = run.y - LAMP; y <= run.y + LAMP; y++) {
          for (let x = run.x - LAMP; x <= run.x + LAMP; x++) {
            if (x >= 0 && y >= 0 && x < LEVEL.cols && y < LEVEL.rows) seen.add(cellKey(x, y));
          }
        }
      }
      const inLamp = (x, y) => Math.abs(x - run.x) <= LAMP && Math.abs(y - run.y) <= LAMP;

      const svgEl = (tag, attrs) => {
        const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
        return n;
      };
      const svgText = (x, y, text, attrs) => {
        const t = svgEl('text', Object.assign({ x, y, 'text-anchor': 'middle' }, attrs || {}));
        t.textContent = text;
        return t;
      };
      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
      function feedback(node, text, kind) {
        if (!node) return;
        node.textContent = text;
        node.classList.toggle('is-error', kind === 'error');
        node.classList.toggle('is-ok', kind === 'ok');
      }

      // ---- Drawing ----
      const cx = (x) => x * CELL + CELL / 2;
      const cy = (y) => y * CELL + CELL / 2;
      function drawBoard() {
        const b = el.board;
        if (!b || !run) return;
        b.textContent = '';
        const done = isDone();
        const lit = litAt(run.t);
        b.appendChild(svgEl('rect', { x: 0, y: 0, width: LEVEL.cols * CELL, height: LEVEL.rows * CELL, fill: '#050302', stroke: '#5c4524', 'stroke-width': 0.6 }));

        // Floor: bright inside the lamp, dim where Hermes has already been, black elsewhere
        const walls = { near: '', far: '' };
        for (let y = 0; y < LEVEL.rows; y++) {
          for (let x = 0; x < LEVEL.cols; x++) {
            if (!done && !seen.has(cellKey(x, y))) continue;
            const near = done || inLamp(x, y);
            b.appendChild(svgEl('rect', { x: x * CELL, y: y * CELL, width: CELL, height: CELL, fill: near ? '#5a3f1e' : '#1a1109' }));
            const bits = wallBits(x, y), x0 = x * CELL, y0 = y * CELL;
            let d = '';
            if (bits & 1) d += `M${x0} ${y0}h${CELL}`;
            if (bits & 2) d += `M${x0 + CELL} ${y0}v${CELL}`;
            if (bits & 4) d += `M${x0} ${y0 + CELL}h${CELL}`;
            if (bits & 8) d += `M${x0} ${y0}v${CELL}`;
            walls[near ? 'near' : 'far'] += d;
          }
        }
        if (walls.far) b.appendChild(svgEl('path', { d: walls.far, stroke: '#8a6d3b', 'stroke-width': 1.1, 'stroke-linecap': 'square', fill: 'none' }));
        if (walls.near) b.appendChild(svgEl('path', { d: walls.near, stroke: '#fcd34d', 'stroke-width': 1.4, 'stroke-linecap': 'square', fill: 'none' }));

        // The torches' rounds, once Hermes has learnt them (hint)
        if (torchHintOn() && !done) {
          LEVEL.guards.forEach((route) => {
            const pts = route.map(([x, y]) => cx(x) + ',' + cy(y)).join(' ');
            b.appendChild(svgEl('polyline', { points: pts + ' ' + cx(route[0][0]) + ',' + cy(route[0][1]), fill: 'none', stroke: '#fb923c', 'stroke-opacity': 0.45, 'stroke-width': 0.8, 'stroke-dasharray': '1.5 1.5' }));
          });
        }

        // Torchlight is visible from anywhere in the dark
        if (!done) {
          lit.forEach((k) => {
            const x = k % LEVEL.cols, y = Math.floor(k / LEVEL.cols);
            b.appendChild(svgEl('rect', { x: x * CELL + 0.6, y: y * CELL + 0.6, width: CELL - 1.2, height: CELL - 1.2, fill: 'rgba(251, 146, 60, 0.32)' }));
          });
        }

        // Landmarks
        const [sx, sy] = LEVEL.start, [ex, ey] = LEVEL.exit;
        b.appendChild(svgText(cx(sx), cy(sy) + 2.6, '△', { fill: '#fde68a', 'font-size': 7 }));
        b.appendChild(svgText(cx(ex), cy(ey) + 2.4, '⇦', { fill: '#86efac', 'font-size': 7 }));
        const [stx, sty] = LEVEL.star, [cpx, cpy] = LEVEL.camp;
        if (done || seen.has(cellKey(stx, sty))) b.appendChild(svgText(cx(stx), cy(sty) + 2.6, '✶', { fill: '#fbbf24', 'font-size': 7.5 }));
        if (done || seen.has(cellKey(cpx, cpy))) b.appendChild(svgText(cx(cpx), cy(cpy) + 2.2, '⨁', { fill: '#a8a29e', 'font-size': 6.5 }));

        // Torches, with an arrowhead showing where they walk next
        if (!done) {
          LEVEL.guards.forEach((route) => {
            const [x, y] = guardAt(route, run.t), [nx, ny] = guardAt(route, run.t + 1);
            const dx = nx - x, dy = ny - y, ox = cx(x) + dx * 4.4, oy = cy(y) + dy * 4.4;
            b.appendChild(svgEl('circle', { cx: cx(x), cy: cy(y), r: 3.3, fill: '#7c2d12', stroke: '#fb923c', 'stroke-width': 0.7 }));
            b.appendChild(svgText(cx(x), cy(y) + 1.7, '🔥', { 'font-size': 4.4 }));
            b.appendChild(svgEl('polygon', { points: `${ox + dx * 1.6},${oy + dy * 1.6} ${ox - dy * 1.4},${oy + dx * 1.4} ${ox + dy * 1.4},${oy - dx * 1.4}`, fill: '#fdba74' }));
          });
        }

        // Hermes and his lamp
        b.appendChild(svgEl('circle', { cx: cx(run.x), cy: cy(run.y), r: 6, fill: 'rgba(253, 230, 138, 0.12)' }));
        b.appendChild(svgEl('circle', { cx: cx(run.x), cy: cy(run.y), r: 2.9, fill: '#fde68a', stroke: '#fff7d6', 'stroke-width': 0.6 }));

        // Labels around the board
        b.appendChild(svgText(cx(sx), -4, 'CAIRN III', { fill: '#fde68a', 'font-size': 4.2, 'letter-spacing': 0.4 }));
        b.appendChild(svgText(65, LEVEL.rows * CELL + 7, 'THE SOUTHERN MOUTH · RAIDERS', { fill: '#fb923c', 'font-size': 3.6, 'letter-spacing': 0.3 }));
        b.appendChild(svgText(0, LEVEL.rows * CELL + 13, 'THE WESTERN CLEFT ⇧', { fill: '#86efac', 'font-size': 3.6, 'text-anchor': 'start', 'letter-spacing': 0.3 }));
      }

      function render() {
        const awake = isAwake(), done = isDone();
        if (run) drawBoard();
        if (el.lives) {
          el.lives.textContent = '';
          for (let i = 0; i < LIVES; i++) {
            const span = document.createElement('span');
            span.textContent = '🏮';
            if (run && i >= run.lives) span.className = 'is-spent';
            el.lives.appendChild(span);
          }
        }
        if (el.turnLabel) el.turnLabel.textContent = done ? 'Escaped' : 'Turn ' + (run ? run.moves : 0);
        if (el.tTurn) el.tTurn.textContent = String(run ? run.moves : 0);
        if (el.tLives) el.tLives.textContent = done ? '—' : String(run ? run.lives : LIVES);
        if (el.tSigil) el.tSigil.textContent = awake ? SIGIL + ' ✓' : '[ 8 LETTERS ]';
        if (el.tSeal) el.tSeal.textContent = done ? 'CAIRN III ✓' : (awake ? 'IN HERMES\'S HAND' : '[ SEALED ]');
        if (el.game) el.game.classList.toggle('is-locked', !awake);
        if (el.gameInner) el.gameInner.inert = !awake;
        if (el.sigilCard) el.sigilCard.classList.toggle('is-collapsed', awake);
        const spoken = 'Sigil spoken: ' + SIGIL + ' ✓';
        if (awake && el.keyFeedback && el.keyFeedback.textContent !== spoken) feedback(el.keyFeedback, spoken, 'ok');
        Object.values(el.pad).forEach((btn) => { if (btn) btn.disabled = !awake || done; });
        if (el.hint) el.hint.style.display = torchHintOn() && !done ? '' : 'none';
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        sigilHints.refresh(); torchHints.refresh();
      }

      // ---- Part I: the sigil from Sheet 14B ----
      function speakSigil() {
        if (isAwake()) return;
        const typed = (el.keyInput ? el.keyInput.value : '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
        if (!typed) { feedback(el.keyFeedback, 'Type the eight letters from Sheet 14B.', 'error'); return; }
        if (typed !== SIGIL) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The copper plate does not move. Walk the one true road of Sheet 14B again.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'WINDROSE. The copper plate turns, and the seal is in Hermes\'s hand.', 'ok');
        say("The plate turned under my hand, Silvia, and the Seal of Cairn III is in my palm. But there are torches at the Southern Mouth. The BC Ashes followed my tracks into the labyrinth, and I cannot go back the way I came. The founders cut another way out, the Western Cleft. Guide me there through the dark. Let the torches pass, then follow behind them.");
        render();
        if (el.pad.wait) setTimeout(() => el.pad.wait.focus(), 60);
      }

      // ---- Part II: the escape ----
      function takeTurn(dx, dy) {
        if (!isAwake() || isDone() || !run) return;
        if (dx || dy) {
          const dir = dirOf(dx, dy);
          if (!dir || !canStep(run.x, run.y, dir)) {
            feedback(el.moveFeedback, 'Solid rock to the ' + (dir ? dir.name : 'side') + '.', 'error');
            return;
          }
        }
        run.trail.push([run.x, run.y]);
        run.x += dx; run.y += dy;
        run.moves++;
        const here = cellKey(run.x, run.y);
        if (litAt(run.t).has(here)) { caught('Hermes walked straight into the torchlight.'); return; }
        run.t++;
        if (litAt(run.t).has(here)) { caught('A torch came round the corner and found him.'); return; }
        reveal();
        feedback(el.moveFeedback, dx || dy ? '' : 'Hermes holds his breath in the dark.', '');
        landmarks();
        if (run.x === LEVEL.exit[0] && run.y === LEVEL.exit[1]) { completeStation(); return; }
        render();
      }

      function landmarks() {
        if (run.x === LEVEL.star[0] && run.y === LEVEL.star[1] && get(KEYS.star) !== 'true') {
          set(KEYS.star, 'true');
          say("Silvia... on the wall of this fissure there is a star, painted in gold leaf. Eight points, laid over a ground of blue. The gold is bright: it has not been here long. I know only one hand that gilded stars like this. I cannot stop now.");
        } else if (run.x === LEVEL.camp[0] && run.y === LEVEL.camp[1] && get(KEYS.camp) !== 'true') {
          set(KEYS.camp, 'true');
          say("Their camp. Cold ashes, a broken wagon wheel, and the charred circle of the BC Ashes scratched on the rock. They have been sleeping in this labyrinth for days, waiting for someone to open the cairn for them.");
        }
      }

      function caught(how) {
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        const captures = (parseInt(get(KEYS.captures) || '0', 10) || 0) + 1;
        set(KEYS.captures, String(captures));
        torchHints.fail();
        if (el.board) { el.board.classList.remove('laby-flash'); void el.board.getBoundingClientRect(); el.board.classList.add('laby-flash'); }
        run.lives--;
        if (run.lives <= 0) {
          newRun();
          feedback(el.moveFeedback, how + ' No close calls left: Hermes ran back to the shadow of Cairn III.', 'error');
          say("They saw me, Silvia. I ran back up to the cairn and they lost me among the pillars. The torches keep their rounds; watch them, and we try again." + (torchHintOn() ? " I have drawn their rounds on your board." : ''));
          render();
          return;
        }
        // A close call: Hermes flattens himself into a crack and the raiders walk on.
        // The rounds move on until his square is dark again; if it never is, he steps back the way he came.
        let k = 1;
        while (k <= PERIOD && litAt(run.t + k).has(cellKey(run.x, run.y))) k++;
        while (k > PERIOD && run.trail.length) {
          [run.x, run.y] = run.trail.pop();
          k = 1;
          while (k <= PERIOD && litAt(run.t + k).has(cellKey(run.x, run.y))) k++;
        }
        run.t += k;
        reveal();
        landmarks();
        feedback(el.moveFeedback, how + ' A close call: he pressed into a crack in the rock and the torch walked on.', 'error');
        render();
      }

      function completeStation() {
        set(KEYS.done, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.grantCairnSeal === 'function') window.grantCairnSeal(3);
        else set('order_seal_cairn_3', 'true');
        feedback(el.moveFeedback, 'The Western Cleft. Hermes is out.', 'ok');
        say("I am out, Silvia! Through the Western Cleft and onto the open hardpan. The torches are still searching the fissures behind me.");
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        if (el.finish) setTimeout(() => el.finish.focus(), 60);
      }

      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "Hermes squeezed through the Western Cleft with the Seal of Cairn III wrapped in his scarf. The raiders never saw his face. Under the copper plate, on the founders' stone, two lines were waiting. And there was more in that labyrinth... He will tell you on the wire.";
        }
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        if (run) { run.x = LEVEL.exit[0]; run.y = LEVEL.exit[1]; }
      }

      // ---- Controls: pad, keyboard, tapping a square next to Hermes ----
      const STEPS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], wait: [0, 0] };
      Object.keys(STEPS).forEach((k) => { if (el.pad[k]) el.pad[k].addEventListener('click', () => takeTurn(STEPS[k][0], STEPS[k][1])); });
      const KEYMAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'wait' };
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'none' || !isAwake() || isDone()) return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const k = KEYMAP[e.key];
        if (!k) return;
        // The space bar holds still even when a pad arrow has focus: the browser would otherwise press that arrow again
        if (k === 'wait' && e.target && e.target.tagName === 'BUTTON' && !modal.contains(e.target)) return;
        e.preventDefault();
        takeTurn(STEPS[k][0], STEPS[k][1]);
      });
      document.addEventListener('keyup', (e) => {
        if (e.key === ' ' && modal.style.display !== 'none' && e.target && e.target.tagName === 'BUTTON' && modal.contains(e.target)) e.preventDefault();
      });
      if (el.board) {
        el.board.addEventListener('click', (e) => {
          if (!run || !isAwake() || isDone()) return;
          const ctm = el.board.getScreenCTM();
          if (!ctm) return;
          const pt = el.board.createSVGPoint();
          pt.x = e.clientX; pt.y = e.clientY;
          const p = pt.matrixTransform(ctm.inverse());
          const x = Math.floor(p.x / CELL), y = Math.floor(p.y / CELL);
          const dx = x - run.x, dy = y - run.y;
          if (Math.abs(dx) + Math.abs(dy) <= 1) takeTurn(dx, dy);
        });
      }
      if (el.speak) el.speak.addEventListener('click', speakSigil);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakSigil(); });

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_sun_monolith_completed') !== 'true') return false;
        return typeof window.isLabyrinthMarchOver === 'function' ? window.isLabyrinthMarchOver() : false;
      }
      let returnFocusTo = null;
      function openLabyrinthModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          if (get('order_sun_monolith_completed') !== 'true') {
            toast('✦ TERRA INCOGNITA ✦ Wake Cairn II at the Sun Monolith (Station 14) before the road to the labyrinth opens.');
          } else if (typeof window.getLabyrinthMarchEta === 'function' && window.getLabyrinthMarchEta()) {
            toast('Hermes is walking down to the Sandstone Labyrinth. Arrival in ' + window.getLabyrinthMarchEta() + '.');
          } else {
            toast('Hermes is resting under the Sun Monolith. Open the Cliffside Workshop: he will wire you at first light.');
          }
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        returnFocusTo = document.activeElement;
        if (!run) newRun();
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I am inside the labyrinth, at the foot of Cairn III. A pyramid of dry stone, and on its face my own copper benchmark from 1998. Beneath it there is an older copper plate, with eight empty letter slots. It wants the name of the true road: Sheet 14B.");
        else say("The torches are still out there. Watch their rounds, Silvia, and take me to the Western Cleft.");
        render();
        const focusTarget = isDone() ? el.finish : isAwake() ? el.pad.wait : el.keyInput;
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
      }
      function closeLabyrinthModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openLabyrinthModal = openLabyrinthModal;
      window.closeLabyrinthModal = closeLabyrinthModal;
      if (el.close) el.close.addEventListener('click', closeLabyrinthModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeLabyrinthModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeLabyrinthModal(); });
      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeLabyrinthModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof window.showDesertToast === 'function') {
            let seals = 0;
            for (let i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) === 'true') seals++;
            window.showDesertToast('✦ Seal of Cairn III secured (' + seals + ' of 5) ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
          }
        });
      }

      // Test hook for scripts/audit/web_smoke.py: the level (it is in this source anyway) and the controls
      window.__labyrinth = {
        level: JSON.parse(JSON.stringify(LEVEL)),
        reach: REACH,
        state: () => (run ? { x: run.x, y: run.y, t: run.t, moves: run.moves, lives: run.lives } : null),
        step: (dx, dy) => takeTurn(dx, dy)
      };

      newRun();
      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
