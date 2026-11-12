
    // =========================================================================
    // 🌀 STATION 15 · THE SANDSTONE LABYRINTH & CAIRN III (ESCAPE FROM THE BC ASHES · SHEET 14B)
    // Part I (journal): the eight-letter sigil opens the copper plate of Cairn III.
    // Part II (web only): a turn-based escape through a dark labyrinth, played in 3D at night. Every step of
    // Hermes (or holding still) moves every torch one square along its round.
    // The level was generated and checked offline (search over square × turn): it can be solved from
    // any phase of the rounds, the shortest road that ignores the torches gets caught, and the gold
    // star and the raiders' camp sit on squares that every road must cross.
    // The 3D scene only shows what the rules already say: the walls rise as Hermes's lamp finds them,
    // the squares a torch lights glow on the ground, and his map in the corner keeps what he has seen.
    // Reward: the Seal of Cairn III and two Ledger equations.
    // =========================================================================
    (function initSandstoneLabyrinth() {
      const modal = document.getElementById('modal-sandstone-labyrinth');
      if (!modal) return;
      const sfx = window.sfx || null;
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(a && a.sfx && a.sfx(kind, o)); };
      // Footsteps follow each turn, but a held arrow key repeats faster than they should sound
      let lastStepCue = 0;
      const stepCue = (kind, o) => { const n = Date.now(); if (n - lastStepCue < 80) return; lastStepCue = n; cue(kind, o); };
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
      const HOWTO_KEY = 'order_labyrinth_howto', CINE_INTRO = 'order_labyrinth_cine_intro';
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
        stage: $('laby3d-stage'), canvas: $('laby3d-canvas'), subtitle: $('laby3d-subtitle'), fade: $('laby3d-fade'), danger: $('laby3d-danger'),
        howto: $('laby3d-howto'), help: $('btn-laby-howto')
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
          'Start at the Southern Mouth on the page “The Sandstone Labyrinth & Cairn III”, not at the cairn. Only the arches that stand on the one true road count, in the order you pass beneath them.',
          'I wrote down how to find the true road. It is in Ask Hermes, under the question about finding the true road.',
          'Let us start together. Put your pencil on the Southern Mouth and shade in every dead end you leave behind; the side fissures have arches too, to fool the hurried. The first arch on the true road carries a W: if your pencil reaches another letter first, you have strayed. Seven arches more, up to the cairn.'
        ]
      });
      const torchHints = hints.define({
        id: 's15-torches', station: 'Station 15', title: 'the torches in the labyrinth', group: 'desert',
        anchor: el.moveFeedback, solved: isDone, active: isAwake, legacyKey: KEYS.torchHint,
        texts: [
          'Watch the torches before you move. Each one walks the same round again and again, and it only lights what is in front of it.',
          'I have drawn their rounds on the ground and on your map. My note is in Ask Hermes: "How do the raiders\' torches move?"',
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
      function subtitle(text, secs, kind) {
        if (!el.subtitle) return;
        el.subtitle.textContent = text;
        el.subtitle.classList.toggle('is-act', kind === 'act');
        el.subtitle.classList.add('is-on');
        clearTimeout(subtitle.t);
        subtitle.t = setTimeout(() => el.subtitle.classList.remove('is-on'), (secs || 4.5) * 1000);
      }

      // ---- Hermes's map (the SVG in the corner of the scene) ----
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

        // the round of the torch she clicked, bright for a few seconds
        if (view.peek && !done) {
          const route = LEVEL.guards[view.peek.n];
          const pts = route.map(([x, y]) => cx(x) + ',' + cy(y)).join(' ');
          b.appendChild(svgEl('polyline', { points: pts + ' ' + cx(route[0][0]) + ',' + cy(route[0][1]), fill: 'none', stroke: '#fde68a', 'stroke-opacity': 0.95, 'stroke-width': 1.3, 'stroke-dasharray': '2 1.2', 'stroke-linejoin': 'round' }));
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
        // once the plate has turned, the Seal of Cairn III travels with him: a gold ring round his dot
        if (isAwake()) b.appendChild(svgEl('circle', { cx: cx(run.x), cy: cy(run.y), r: 4.3, fill: 'none', stroke: '#fbbf24', 'stroke-width': 0.7, 'stroke-dasharray': '1.2 0.8' }));

        // Labels around the board
        b.appendChild(svgText(cx(sx), -4, isAwake() ? 'CAIRN III · ✦ SEAL IN HAND' : 'CAIRN III', { fill: '#fde68a', 'font-size': 4.2, 'letter-spacing': 0.4 }));
        b.appendChild(svgText(65, LEVEL.rows * CELL + 7, 'RAIDERS AT THE SOUTHERN MOUTH ↓', { fill: '#fb923c', 'font-size': 3.6, 'letter-spacing': 0.3 }));
        b.appendChild(svgText(0, LEVEL.rows * CELL + 13, 'THE WESTERN CLEFT ⇧', { fill: '#86efac', 'font-size': 3.6, 'text-anchor': 'start', 'letter-spacing': 0.3 }));
      }

      // ---- The labyrinth in 3D. One square is S units; east is +x, north is -z; Hermes faces -z at yaw 0 ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const S = 3, WALL_H = 2.0;
      const wx = (x) => (x - (LEVEL.cols - 1) / 2) * S;
      const wz = (y) => (y - (LEVEL.rows - 1) / 2) * S;
      const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
      const CLEFT = { x: wx(LEVEL.exit[0]) - S * 1.25, z: wz(LEVEL.exit[1]) };
      const CAIRN = { x: wx(LEVEL.start[0]), z: wz(LEVEL.start[1]) - S * 0.36 };
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, ending: 0, prevLives: LIVES, sigilT: 0, hover: -1, wasDone: false, peek: null, idleT: 0, whispers: 0 };
      // the torch standing on a square right now, if any (its index in LEVEL.guards)
      const torchOn = (cell) => (run && cell >= 0 ? LEVEL.guards.findIndex((route) => { const [x, y] = guardAt(route, run.t); return cellKey(x, y) === cell; }) : -1);

      // the walls of the plan, once each: the north and west sides of every square, the south and east of the last row and column
      function wallSegments() {
        const segs = [], pillars = new Map();
        const pillar = (i, j, s) => { const k = j * (LEVEL.cols + 1) + i; if (!pillars.has(k)) pillars.set(k, { i, j, segs: [] }); pillars.get(k).segs.push(s); };
        const add = (x, z, vert, cells, v0, v1) => { const s = segs.length; segs.push({ x, z, vert, cells }); pillar(v0[0], v0[1], s); pillar(v1[0], v1[1], s); };
        for (let y = 0; y < LEVEL.rows; y++) {
          for (let x = 0; x < LEVEL.cols; x++) {
            const b = wallBits(x, y), k = cellKey(x, y);
            if (b & 1) add(wx(x), wz(y) - S / 2, false, y > 0 ? [k, cellKey(x, y - 1)] : [k], [x, y], [x + 1, y]);
            // the Western Cleft: the founders cut the west wall of the last square open
            if ((b & 8) && !(x === LEVEL.exit[0] && y === LEVEL.exit[1])) add(wx(x) - S / 2, wz(y), true, x > 0 ? [k, cellKey(x - 1, y)] : [k], [x, y], [x, y + 1]);
            if (y === LEVEL.rows - 1 && (b & 4)) add(wx(x), wz(y) + S / 2, false, [k], [x, y + 1], [x + 1, y + 1]);
            if (x === LEVEL.cols - 1 && (b & 2)) add(wx(x) + S / 2, wz(y), true, [k], [x + 1, y], [x + 1, y + 1]);
          }
        }
        return { segs, pillars: Array.from(pillars.values()) };
      }

      function buildWorld() {
        const T = window.THREE;
        if (!T || !P || !SC || !el.canvas) return null;
        let renderer;
        try { renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
        renderer.outputEncoding = T.sRGBEncoding;
        if (T.ReinhardToneMapping) { renderer.toneMapping = T.ReinhardToneMapping; renderer.toneMappingExposure = 1.08; }
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        const scene = new T.Scene();
        scene.background = new T.Color(0x04050d);
        scene.fog = new T.Fog(0x05060e, 28, 80);
        const camera = new T.PerspectiveCamera(48, 16 / 10, 0.3, 700);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });

        // ---- The night: stars, a low moon, a cold blue light that only just shows the stone ----
        const starsV = new Float32Array(1400 * 3), sr = P.rng(1515);
        for (let i = 0; i < 1400; i++) {
          const a = sr() * Math.PI * 2, y = 0.08 + Math.pow(sr(), 0.8) * 0.92, rr = Math.sqrt(1 - y * y);
          starsV.set([Math.cos(a) * rr * 320, y * 320, Math.sin(a) * rr * 320], i * 3);
        }
        const starsG = new T.BufferGeometry(); starsG.setAttribute('position', new T.BufferAttribute(starsV, 3));
        scene.add(new T.Points(starsG, new T.PointsMaterial({ color: 0xe8ecff, size: 2.4, sizeAttenuation: false, map: glowTex, transparent: true, opacity: 0.85, fog: false, depthWrite: false, blending: T.AdditiveBlending })));
        const moon = new T.Sprite(new T.SpriteMaterial({ map: P.canvasTex(256, 256, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, w * 0.16, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(220,232,255,0.55)'); gr.addColorStop(1, 'rgba(160,180,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
          g.fillStyle = '#f4f1e6'; g.beginPath(); g.arc(w / 2, w / 2, w * 0.16, 0, Math.PI * 2); g.fill();
        }), fog: false, depthWrite: false, transparent: true, toneMapped: false }));
        moon.scale.set(60, 60, 1); moon.position.set(-150, 110, -220);
        scene.add(moon);
        const hemi = new T.HemisphereLight(0x5a68b0, 0x120e1c, 0.26);
        scene.add(hemi);
        const moonLight = new T.DirectionalLight(0xb4c4ff, 0.34);
        moonLight.position.set(-22, 34, -18);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(moonLight.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 110 });
        moonLight.shadow.bias = -0.0008;
        scene.add(moonLight); scene.add(moonLight.target);

        // ---- The ground: dark sand all round; the floor of each square appears once the lamp has found it ----
        const ground = new T.Mesh(new T.PlaneGeometry(400, 400), paint({ color: 0x0e0c16 }));
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
        // the sand textures are shared and cached: clone them before setting our own repeat
        const sand = SC.tex.sand(15), sandMap = sand.map.clone(), sandBump = sand.bump.clone();
        [sandMap, sandBump].forEach((t) => { t.needsUpdate = true; t.repeat.set(1, 1); });
        const floorMat = paint({ map: sandMap, bumpMap: sandBump, bumpScale: 0.8, color: 0x8a7a72 });
        const floor = new T.InstancedMesh(new T.BoxGeometry(S * 0.995, 0.08, S * 0.995), floorMat, LEVEL.cols * LEVEL.rows);
        floor.receiveShadow = true; scene.add(floor);

        // ---- The walls: sandstone in its bands, and a rounded pillar wherever walls meet ----
        const plan = wallSegments();
        const stoneMat = paint({ map: SC.tex.strata(7), color: 0x9c8c98 }, 0x8ea0ff, 0.12);
        const walls = new T.InstancedMesh(new T.BoxGeometry(S + 0.1, WALL_H, 0.5), stoneMat, plan.segs.length);
        walls.castShadow = true; walls.receiveShadow = true; scene.add(walls);
        const pillarGeo = new T.CylinderGeometry(0.36, 0.48, WALL_H * 1.14, 8);
        pillarGeo.translate(0, WALL_H * 0.57, 0);
        const pillars = new T.InstancedMesh(pillarGeo, paint({ map: SC.tex.strata(11), color: 0x9c8c98 }, 0x8ea0ff, 0.12), plan.pillars.length);
        pillars.castShadow = true; pillars.receiveShadow = true; scene.add(pillars);
        const hr = P.rng(77);
        plan.segs.forEach((s) => { s.h = 0.9 + hr() * 0.22; s.rise = 0; s.goal = 0; s.delay = 0; });
        plan.pillars.forEach((p) => { p.h = 0.95 + hr() * 0.3; p.rise = 0; p.goal = 0; p.delay = 0; p.x = wx(p.i) - S / 2; p.z = wz(p.j) - S / 2; p.ry = hr() * Math.PI; });
        const tiles = [];
        for (let y = 0; y < LEVEL.rows; y++) for (let x = 0; x < LEVEL.cols; x++) tiles.push({ x: wx(x), z: wz(y), rise: 0, goal: 0, delay: 0 });

        // ---- Cairn III at the head of the labyrinth: dry stone in three steps, and two copper plates on its face ----
        const cairn = new T.Group();
        // four courses of dry stone, each a little smaller, so the pyramid reads as laid by hand (page “The Five Geodetic Cairns”)
        const PYR_H = 1.9, PYR_HALF = 0.82, slope = Math.atan2(PYR_HALF, PYR_H);
        [[0, 0.5], [0.5, 0.98], [0.98, 1.42], [1.42, PYR_H]].forEach(([y0, y1], n) => {
          const r0 = PYR_HALF * (1 - y0 / PYR_H) * Math.SQRT2, r1 = Math.max(0.02, PYR_HALF * (1 - y1 / PYR_H) * Math.SQRT2);
          const course = new T.Mesh(new T.CylinderGeometry(r1, r0, y1 - y0 - 0.03, 4, 1), stoneMat);
          course.rotation.y = Math.PI / 4 + (n % 2 ? 0.04 : -0.03); course.position.y = (y0 + y1) / 2;
          course.castShadow = true; course.receiveShadow = true; cairn.add(course);
        });
        const faceZ = (y) => PYR_HALF * (1 - y / PYR_H) + 0.03;
        const copperMat = paint({ color: 0xb8683a, emissive: 0xff8a3c, emissiveIntensity: 0.05 });
        // Hermes's own 1998 benchmark: a round copper plate on the south face
        const plate = new T.Mesh(new T.CylinderGeometry(0.27, 0.27, 0.04, 28), copperMat);
        plate.rotation.x = Math.PI / 2 - slope; plate.position.set(0, 0.98, faceZ(0.98)); cairn.add(plate);
        // the founders' older plate below it, with its eight letter slots: it turns on a pin when the sigil is spoken
        const oldPlate = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.035, 8), paint({ color: 0x8a4a28, emissive: 0xffb14a, emissiveIntensity: 0 }));
        oldPlate.geometry.rotateX(Math.PI / 2);
        const oldPin = new T.Group(); oldPin.rotation.x = -slope; oldPin.position.set(0, 0.38, faceZ(0.38)); oldPin.add(oldPlate); cairn.add(oldPin);
        const sealHalo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
        sealHalo.scale.set(2.6, 2.6, 1); sealHalo.position.set(0, 0.85, 0.9); cairn.add(sealHalo);
        cairn.position.set(CAIRN.x, 0, CAIRN.z);
        scene.add(cairn);
        // the Seal of Cairn III: it rises out of the opened plate and flies into Hermes's hand
        const seal = new T.Group();
        const sealDisc = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.05, 28), new T.MeshBasicMaterial({ color: 0xe3a93d }));
        sealDisc.rotation.x = Math.PI / 2; seal.add(sealDisc);
        const sealGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending }));
        sealGlow.scale.set(1.3, 1.3, 1); seal.add(sealGlow);
        seal.visible = false; scene.add(seal);

        // ---- The gold star on the north wall of its fissure: eight points of gold leaf on a ground of blue, fresh ----
        const starTex = P.canvasTex(256, 256, (g, w, h) => {
          g.clearRect(0, 0, w, h);
          const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
          gr.addColorStop(0, '#2f4fa8'); gr.addColorStop(0.75, '#1d3478'); gr.addColorStop(1, 'rgba(29,52,120,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); g.fill();
          g.save(); g.translate(w / 2, h / 2);
          g.beginPath();
          for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, r = i % 2 ? 34 : 92; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
          g.closePath();
          const gold = g.createLinearGradient(-90, -90, 90, 90); gold.addColorStop(0, '#fff2b0'); gold.addColorStop(0.5, '#e3b04a'); gold.addColorStop(1, '#a8741c');
          g.fillStyle = gold; g.fill(); g.strokeStyle = 'rgba(90,56,10,0.7)'; g.lineWidth = 3; g.stroke();
          g.restore();
        });
        const starMat = new T.MeshStandardMaterial({ map: starTex, transparent: true, emissive: 0xffc96b, emissiveMap: starTex, emissiveIntensity: 0.12, roughness: 0.35, metalness: 0.4 });
        const star = new T.Mesh(new T.PlaneGeometry(1.25, 1.25), starMat);
        star.position.set(wx(LEVEL.star[0]), 1.45, wz(LEVEL.star[1]) - S / 2 + 0.33);
        star.visible = false; scene.add(star);

        // ---- The raiders' camp: cold ashes in a ring of stones, a broken wagon wheel, their charred circle on the rock ----
        const camp = new T.Group();
        const ash = new T.Mesh(new T.CircleGeometry(0.75, 20), new T.MeshBasicMaterial({ color: 0x1d1a1a, transparent: true, opacity: 0.75, depthWrite: false }));
        ash.rotation.x = -Math.PI / 2; ash.position.y = 0.1; camp.add(ash);
        const cr = P.rng(88);
        for (let i = 0; i < 9; i++) {
          const a = i / 9 * Math.PI * 2, s = 0.13 + cr() * 0.07;
          const st = new T.Mesh(new T.DodecahedronGeometry(s, 0), stoneMat); st.position.set(Math.cos(a) * 0.8, 0.1 + s * 0.5, Math.sin(a) * 0.8); st.rotation.set(cr() * 3, cr() * 3, 0); st.castShadow = true; camp.add(st);
        }
        const woodMat = paint({ color: 0x4a2e1a });
        const wheel = new T.Group();
        const rim = new T.Mesh(new T.TorusGeometry(0.62, 0.06, 6, 22, Math.PI * 1.55), woodMat); wheel.add(rim);
        for (let i = 0; i < 5; i++) { const sp = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.6, 5), woodMat); sp.position.set(Math.cos(i * 0.95) * 0.3, Math.sin(i * 0.95) * 0.3, 0); sp.rotation.z = i * 0.95 - Math.PI / 2; wheel.add(sp); }
        const hub = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.14, 8), woodMat); hub.rotation.x = Math.PI / 2; wheel.add(hub);
        wheel.position.set(0.9, 0.62, -S / 2 + 0.55); wheel.rotation.set(-0.25, 0.3, 0.2); camp.add(wheel);
        const charTex = P.canvasTex(128, 128, (g, w) => {
          g.clearRect(0, 0, w, w);
          g.strokeStyle = 'rgba(20,14,12,0.85)'; g.lineWidth = 9; g.beginPath(); g.arc(w / 2, w / 2, w * 0.36, 0, Math.PI * 2); g.stroke();
          g.lineWidth = 4; g.beginPath(); g.arc(w / 2, w / 2, w * 0.2, 0.3, Math.PI * 1.7); g.stroke();
          g.fillStyle = 'rgba(30,20,16,0.35)'; g.beginPath(); g.arc(w / 2, w / 2, w * 0.46, 0, Math.PI * 2); g.fill();
        });
        const charred = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), new T.MeshBasicMaterial({ map: charTex, transparent: true, depthWrite: false }));
        charred.position.set(-0.6, 1.3, -S / 2 + 0.32); camp.add(charred);
        camp.position.set(wx(LEVEL.camp[0]), 0, wz(LEVEL.camp[1]));
        camp.visible = false; scene.add(camp);

        // ---- The Western Cleft: two slabs leaning together, moonlight through the gap ----
        const cleft = new T.Group();
        [-1, 1].forEach((s) => {
          const slab = new T.Mesh(new T.BoxGeometry(0.7, WALL_H * 1.35, 1.25), stoneMat);
          slab.position.set(0, WALL_H * 0.62, s * 0.92); slab.rotation.x = -s * 0.16; slab.castShadow = true; slab.receiveShadow = true; cleft.add(slab);
        });
        const cleftGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xa8c4ff, transparent: true, opacity: 0.75, depthWrite: false, blending: T.AdditiveBlending }));
        cleftGlow.scale.set(2.4, 3.6, 1); cleftGlow.position.set(-0.6, 1.4, 0); cleft.add(cleftGlow);
        const cleftLight = new T.PointLight(0x9fb8ff, 1.1, 9, 1.6); cleftLight.position.set(-0.8, 1.6, 0); cleft.add(cleftLight);
        cleft.position.set(wx(LEVEL.exit[0]) - S / 2, 0, wz(LEVEL.exit[1]));
        scene.add(cleft);

        // ---- The squares a torch lights, glowing on the ground, and the arrow of where each torch goes next ----
        const litMat = new T.MeshBasicMaterial({ map: P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w * 0.72);
          gr.addColorStop(0, 'rgba(255,200,120,1)'); gr.addColorStop(0.7, 'rgba(255,140,50,0.75)'); gr.addColorStop(1, 'rgba(255,120,40,0.25)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        }), color: 0xff9a40, transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending });
        const litGeo = new T.PlaneGeometry(S * 0.94, S * 0.94); litGeo.rotateX(-Math.PI / 2);
        const litMesh = new T.InstancedMesh(litGeo, litMat, LEVEL.guards.length * (REACH + 1));
        litMesh.position.y = 0.11; litMesh.count = 0; litMesh.renderOrder = 2; scene.add(litMesh);
        const arrowGeo = new T.BufferGeometry();
        arrowGeo.setAttribute('position', new T.Float32BufferAttribute([0, 0, -0.55, -0.42, 0, 0.2, 0.42, 0, 0.2], 3));
        const arrowMat = new T.MeshBasicMaterial({ color: 0xffd08a, transparent: true, opacity: 0.85, depthWrite: false, side: T.DoubleSide });

        // ---- The rounds, once Hermes has learnt them: dashed lines on the ground ----
        const rounds = new T.Group();
        LEVEL.guards.forEach((route) => {
          const pts = route.concat([route[0]]).map(([x, y]) => new T.Vector3(wx(x), 0.16, wz(y)));
          const line = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineDashedMaterial({ color: 0xfb923c, dashSize: 0.45, gapSize: 0.35, transparent: true, opacity: 0.7, depthTest: false }));
          line.renderOrder = 4;
          line.computeLineDistances(); rounds.add(line);
        });
        rounds.visible = false; scene.add(rounds);

        // ---- The raiders, each with his torch, walking the rounds ----
        const raiders = LEVEL.guards.map((route, n) => {
          const looks = [{ seed: 31 }, { robe: 0x4a3428, wrap: 0x2a1c16, sash: 0x7a3a1c, seed: 37, iris: 0x4a3018 }, { robe: 0x2e3a3c, wrap: 0x161c1e, sash: 0x8a2a1c, seed: 41 }, { robe: 0x5a3a2a, wrap: 0x2a1a14, sash: 0x6a3418, seed: 47 }];
          let body = null;
          try { body = SC.chars.raider(paint, looks[n]); } catch (e) { body = null; }
          const g = body || new T.Group();
          const torch = new T.Group();
          const stick = new T.Mesh(new T.CylinderGeometry(0.03, 0.04, 0.8, 6), woodMat); stick.position.y = 0.2; torch.add(stick);
          const flame = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffb35a, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          flame.scale.set(0.6, 0.9, 1); flame.position.y = 0.72; torch.add(flame);
          if (body && body.userData.hold) { body.userData.hold.add(torch); if (body.userData.arm) body.userData.arm.rotation.x = 1.7; }
          else { torch.position.set(0.3, 1.2, -0.2); g.add(torch); }
          const light = new T.PointLight(0xff9a40, 2.0, S * 3.4, 1.6);
          scene.add(light);
          const arrow = new T.Mesh(arrowGeo, arrowMat); arrow.renderOrder = 3; scene.add(arrow);
          g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(g);
          return { g, body, flame, light, arrow, route, mv: null, ph: n * 1.7 };
        });

        // ---- Hermes, his lamp lit ----
        let H = null;
        try {
          H = P.buildHermes(T, glowTex);
          H.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(H.hermes);
        } catch (e) { H = null; }
        const lamp = new T.PointLight(0xffc27a, 2.6, S * 3.1, 1.5);
        lamp.castShadow = !lowPower;
        if (lamp.castShadow) { lamp.shadow.mapSize.set(512, 512); lamp.shadow.bias = -0.004; lamp.shadow.camera.near = 0.2; lamp.shadow.camera.far = S * 3.2; }
        scene.add(lamp);

        // ---- Where she can send him: rings on the open squares next to him ----
        const ringGeo = new T.RingGeometry(0.5, 0.68, 36); ringGeo.rotateX(-Math.PI / 2);
        const rings = [0, 1, 2, 3].map(() => {
          const m = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0, depthWrite: false }));
          m.position.y = 0.14; m.renderOrder = 3; scene.add(m);
          return m;
        });

        // ---- The feel: a night lens that lets the fire bloom, a body for Hermes, dust, prints on the sand ----
        let fx = null;
        try {
          if (window.EclipseFX) fx = window.EclipseFX.kit(renderer, scene, H, {
            look: { bloom: 0.7, threshold: 0.86, knee: 0.16, vignette: 0.42, grain: 0.032, ca: 0.16, sat: 1.02, contrast: 1.05, gain: [1.0, 0.98, 1.05], shade: 0.26, shadeColor: [0.45, 0.52, 0.95] },
            sandColor: 0x8a7a72, printColor: 0x2a2030, printLife: 16, scale: 1, wind: [0.4, 0, 0.1], blowColor: 0x4a0a04,
            ambient: () => (H ? { x: H.hermes.position.x, z: H.hermes.position.z } : null), ambientRadius: 10, ambientAlpha: 0.07, ambientColor: 0x8c90b8
          });
        } catch (e) { fx = null; }

        return { T, renderer, scene, camera, lowPower, plan, walls, pillars, floor, tiles, cairn, plate, oldPlate, copperMat, sealHalo, star, starMat, camp, cleft, cleftGlow, cleftLight,
          litMesh, rounds, raiders, seal, H, hermes: H && H.hermes, lamp, rings, fx, dummy: new T.Object3D(), ray: new T.Raycaster(), floorPlane: new T.Plane(new T.Vector3(0, 1, 0), 0),
          hMove: null, cam: { dist: 16, pitch: 1.02, tDist: 16, tPitch: 1.02, p: null, l: null } };
      }

      // ---- Keeping the scene in step with the game ----
      const ease = (u) => u * u * (3 - 2 * u);
      function shortTurn(a, b) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
      function moveTo(obj, x, z, dur, yaw, keepMv) {
        const mv = { fx: obj.position.x, fz: obj.position.z, tx: x, tz: z, t: 0, dur, ry0: obj.rotation.y, ry1: yaw == null ? obj.rotation.y : yaw };
        if (dur <= 0 || reduced()) { obj.position.x = x; obj.position.z = z; obj.rotation.y = mv.ry1; return null; }
        return keepMv ? mv : mv;
      }
      function stepMv(obj, mv, dt) {
        if (!mv) return null;
        mv.t += dt;
        const u = Math.min(1, mv.t / mv.dur), e = ease(u);
        obj.position.x = mv.fx + (mv.tx - mv.fx) * e;
        obj.position.z = mv.fz + (mv.tz - mv.fz) * e;
        obj.rotation.y = mv.ry0 + shortTurn(mv.ry0, mv.ry1) * Math.min(1, mv.t / Math.min(0.22, mv.dur));
        return u >= 1 ? null : mv;
      }
      function finishMoves() {
        if (!G) return;
        if (G.hermes && G.hMove) { stepMv(G.hermes, G.hMove, 99); G.hMove = null; }
        G.raiders.forEach((r) => { if (r.mv) { stepMv(r.g, r.mv, 99); r.mv = null; } });
      }
      function setRise(list, i, on, delay) {
        const it = list[i];
        if (it.goal === (on ? 1 : 0)) return;
        it.goal = on ? 1 : 0;
        it.delay = delay || 0;
        if (reduced() || view.snapNext) { it.rise = it.goal; it.delay = 0; }
      }
      function revealWorld() {
        const done = isDone();
        const ex = wx(LEVEL.exit[0]), ez = wz(LEVEL.exit[1]);
        const wave = (x, z) => (view.ending ? Math.hypot(x - ex, z - ez) * 0.035 : 0);
        const all = done || view.cineAll;
        G.tiles.forEach((t, i) => setRise(G.tiles, i, all || seen.has(i), wave(t.x, t.z)));
        G.plan.segs.forEach((s, i) => setRise(G.plan.segs, i, all || s.cells.some((k) => seen.has(k)), wave(s.x, s.z)));
        G.plan.pillars.forEach((p, i) => setRise(G.plan.pillars, i, p.segs.some((s) => G.plan.segs[s].goal > 0), wave(p.x, p.z) + 0.05));
      }
      function writeInstances(force) {
        const d = G.dummy;
        let tilesDirty = !!force, wallsDirty = !!force, pillarsDirty = !!force;
        G.tiles.forEach((t, i) => {
          if (!force && t.rise === t.drawn) return;
          t.drawn = t.rise; tilesDirty = true;
          const k = Math.max(0.0001, t.rise);
          d.position.set(t.x, 0.04 * k, t.z); d.rotation.set(0, 0, 0); d.scale.set(k < 0.01 ? 0.0001 : 1, k, k < 0.01 ? 0.0001 : 1); d.updateMatrix();
          G.floor.setMatrixAt(i, d.matrix);
        });
        G.plan.segs.forEach((s, i) => {
          if (!force && s.rise === s.drawn) return;
          s.drawn = s.rise; wallsDirty = true;
          const k = Math.max(0.0001, ease(s.rise)) * s.h;
          d.position.set(s.x, WALL_H * k / 2, s.z); d.rotation.set(0, s.vert ? Math.PI / 2 : 0, 0); d.scale.set(s.rise < 0.01 ? 0.0001 : 1, k, 1); d.updateMatrix();
          G.walls.setMatrixAt(i, d.matrix);
        });
        G.plan.pillars.forEach((p, i) => {
          if (!force && p.rise === p.drawn) return;
          p.drawn = p.rise; pillarsDirty = true;
          const k = Math.max(0.0001, ease(p.rise)) * p.h;
          d.position.set(p.x, 0, p.z); d.rotation.set(0, p.ry, 0); d.scale.set(p.rise < 0.01 ? 0.0001 : 1, k, p.rise < 0.01 ? 0.0001 : 1); d.updateMatrix();
          G.pillars.setMatrixAt(i, d.matrix);
        });
        if (tilesDirty) G.floor.instanceMatrix.needsUpdate = true;
        if (wallsDirty) G.walls.instanceMatrix.needsUpdate = true;
        if (pillarsDirty) G.pillars.instanceMatrix.needsUpdate = true;
      }
      function growRises(dt) {
        let puffs = 0;
        const step = (list, speed) => list.forEach((it) => {
          if (it.rise === it.goal) return;
          if (it.delay > 0) { it.delay -= dt; return; }
          const was = it.rise;
          it.rise = it.goal > it.rise ? Math.min(it.goal, it.rise + dt * speed) : Math.max(it.goal, it.rise - dt * speed);
          // stone rising out of the dark sheds a little sand
          if (was === 0 && it.goal === 1 && G.fx && puffs < 6 && list !== G.tiles) { puffs++; G.fx.puff({ x: it.x, y: 0.2, z: it.z }, 4, { color: 0x8a7a72, alpha: 0.25 }); }
        });
        step(G.tiles, 4); step(G.plan.segs, 2.6); step(G.plan.pillars, 2.4);
      }
      function placeLit() {
        const d = G.dummy, done = isDone();
        let n = 0;
        if (!done) litAt(run.t).forEach((k) => {
          d.position.set(wx(k % LEVEL.cols), 0, wz(Math.floor(k / LEVEL.cols))); d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1); d.updateMatrix();
          G.litMesh.setMatrixAt(n++, d.matrix);
        });
        G.litMesh.count = n;
        G.litMesh.instanceMatrix.needsUpdate = true;
      }
      // Each turn: Hermes and the torches walk to their squares, the light moves, the lamp finds new rock
      function syncWorld() {
        if (!G || !run) return;
        const snap = view.snapNext;
        if (snap) finishMoves();
        const done = isDone();
        // before the sigil he stands aside, so the copper plates on the cairn can be seen
        const asleep = !isAwake();
        const hx = done && !view.ending ? CLEFT.x : wx(run.x) + (asleep ? 0.85 : 0), hz = done && !view.ending ? CLEFT.z : wz(run.y) + (asleep ? 0.55 : 0);
        if (G.hermes) {
          const h = G.hermes, dx = hx - h.position.x, dz = hz - h.position.z;
          if (Math.abs(dx) + Math.abs(dz) > 0.01) {
            if (G.hMove) { stepMv(h, G.hMove, 99); G.hMove = null; }
            const far = Math.hypot(hx - h.position.x, hz - h.position.z) > S * 1.5;
            G.hMove = moveTo(h, hx, hz, snap ? 0 : view.ending ? 1.6 : far ? 0.9 : 0.34, faceYaw(dx, dz));
          } else if (snap && asleep) h.rotation.y = faceYaw(CAIRN.x - hx, CAIRN.z - hz);
        }
        G.raiders.forEach((r) => {
          const [x, y] = guardAt(r.route, run.t), [nx, ny] = guardAt(r.route, run.t + 1);
          const tx = wx(x), tz = wz(y), yaw = (nx !== x || ny !== y) ? faceYaw(nx - x, ny - y) : r.g.rotation.y;
          if (r.mv) { stepMv(r.g, r.mv, 99); r.mv = null; }
          const far = Math.hypot(tx - r.g.position.x, tz - r.g.position.z) > S * 1.5;
          if (Math.abs(tx - r.g.position.x) + Math.abs(tz - r.g.position.z) > 0.01 || Math.abs(shortTurn(r.g.rotation.y, yaw)) > 0.01) r.mv = moveTo(r.g, tx, tz, snap ? 0 : far ? 0.9 : 0.34, yaw);
          r.arrow.visible = !done;
          r.arrow.position.set(tx + (nx - x) * S * 0.42, 0.15, tz + (ny - y) * S * 0.42);
          r.arrow.rotation.y = yaw;
          r.arrow.scale.setScalar(nx !== x || ny !== y ? 1 : 0.001);
        });
        placeLit();
        revealWorld();
        if (snap) writeInstances(true);
        // all the rounds once Hermes has learnt them; otherwise only the one she clicked, for a few seconds
        G.rounds.visible = !done && (torchHintOn() || !!view.peek);
        G.rounds.children.forEach((line, i) => {
          const on = !!view.peek && view.peek.n === i;
          line.visible = torchHintOn() || on;
          line.material.color.setHex(on ? 0xfde68a : 0xfb923c);
          line.material.opacity = on ? 1 : 0.7;
        });
        G.star.visible = done || seen.has(cellKey(LEVEL.star[0], LEVEL.star[1]));
        G.camp.visible = done || seen.has(cellKey(LEVEL.camp[0], LEVEL.camp[1]));
        placeRings();
        paintDanger();
        view.snapNext = false;
      }
      function openNeighbours() {
        if (!run || !isAwake() || isDone()) return [];
        return DIRS.filter((d) => canStep(run.x, run.y, d)).map((d) => [run.x + d.dx, run.y + d.dy]);
      }
      function placeRings() {
        const nb = openNeighbours();
        G.rings.forEach((m, i) => {
          m.visible = i < nb.length;
          if (m.visible) { m.position.x = wx(nb[i][0]); m.position.z = wz(nb[i][1]); m.userData.cell = nb[i]; }
        });
      }
      // a torch whose light already touches the square next to Hermes
      function paintDanger() {
        if (!el.danger) return;
        let near = false;
        if (run && isAwake() && !isDone()) litAt(run.t).forEach((k) => { const x = k % LEVEL.cols, y = Math.floor(k / LEVEL.cols); if (Math.abs(x - run.x) + Math.abs(y - run.y) === 1) near = true; });
        el.danger.textContent = near ? '🔥 Torchlight next to you' : '';
        el.danger.classList.toggle('is-on', near);
      }

      // ---- The camera: behind Hermes and above him, north always up the screen ----
      function bindPointer() {
        const c = el.canvas;
        if (!c || c.__labyPointer) return;
        c.__labyPointer = true;
        c.style.touchAction = 'none';
        const pt = { down: false, x: 0, y: 0, moved: 0 };
        c.addEventListener('pointerdown', (e) => { pt.down = true; pt.x = e.clientX; pt.y = e.clientY; pt.moved = 0; try { c.setPointerCapture(e.pointerId); } catch (err) {} });
        c.addEventListener('pointermove', (e) => {
          if (pt.down) {
            const dy = e.clientY - pt.y;
            pt.moved += Math.abs(e.clientX - pt.x) + Math.abs(dy);
            if (G) G.cam.tPitch = Math.max(0.6, Math.min(1.4, G.cam.tPitch + dy * 0.004));
            pt.x = e.clientX; pt.y = e.clientY;
          } else view.hover = cellUnder(e);
        });
        const up = (e) => {
          if (!pt.down) return;
          pt.down = false;
          if (pt.moved > 6 || !G) return;
          const cell = cellUnder(e);
          const tn = raiderUnder(e);
          if (tn >= 0 || torchOn(cell) >= 0) { peekRound(tn >= 0 ? tn : torchOn(cell)); return; }
          if (cell >= 0 && run && isAwake() && !isDone()) {
            const x = cell % LEVEL.cols, y = Math.floor(cell / LEVEL.cols), dx = x - run.x, dy = y - run.y;
            if (Math.abs(dx) + Math.abs(dy) <= 1) takeTurn(dx, dy);
          }
        };
        c.addEventListener('pointerup', up);
        c.addEventListener('pointercancel', () => { pt.down = false; });
        c.addEventListener('pointerleave', () => { view.hover = -1; });
        c.addEventListener('wheel', (e) => { if (!G) return; e.preventDefault(); G.cam.tDist = Math.max(8, Math.min(34, G.cam.tDist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
        c.addEventListener('dblclick', () => { if (G) { G.cam.tDist = 16; G.cam.tPitch = 1.02; } });
      }
      function raiderUnder(e) {
        if (!G || !run || isDone()) return -1;
        const r = el.canvas.getBoundingClientRect();
        const ndc = new G.T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        G.ray.setFromCamera(ndc, G.camera);
        const hit = G.ray.intersectObjects(G.raiders.map((q) => q.g), true)[0];
        if (!hit) return -1;
        return G.raiders.findIndex((q) => { let o = hit.object; while (o) { if (o === q.g) return true; o = o.parent; } return false; });
      }
      // Watching a torch costs no turn: its round is drawn on the ground and on the map for a few seconds
      function peekRound(n) {
        if (n < 0 || isDone() || !run) return;
        const route = LEVEL.guards[n];
        view.peek = { n, until: performance.now() + 6500 };
        view.idleT = performance.now();
        cue('tick', { f: 660, v: 0.05 });
        subtitle('Hermes watches that torch from the dark: it comes back to the same square every ' + route.length + ' turns.', 5);
        render();
      }
      function cellUnder(e) {
        if (!G) return -1;
        const r = el.canvas.getBoundingClientRect();
        const ndc = new G.T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        G.ray.setFromCamera(ndc, G.camera);
        const p = new G.T.Vector3();
        if (!G.ray.ray.intersectPlane(G.floorPlane, p)) return -1;
        const x = Math.round(p.x / S + (LEVEL.cols - 1) / 2), y = Math.round(p.z / S + (LEVEL.rows - 1) / 2);
        return x >= 0 && y >= 0 && x < LEVEL.cols && y < LEVEL.rows ? cellKey(x, y) : -1;
      }
      function placeCamera(dt, snap) {
        const cam = G.camera, c = G.cam;
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else {
          let tx, tz, dist, pitch, yaw = 0;
          if (view.ending || (isDone() && view.overview)) { tx = -3; tz = 2.5; dist = 44; pitch = 1.12; }
          // at the cairn, from the side so Hermes never hides the plates; it stays there while the old plate turns
          else if (!isAwake() || (view.sigilT && performance.now() - view.sigilT < 2400)) { tx = CAIRN.x; tz = CAIRN.z + 0.5; dist = 5.4; pitch = 1.12; yaw = -1.0; }
          else {
            c.dist += (c.tDist - c.dist) * Math.min(1, dt * 6); c.pitch += (c.tPitch - c.pitch) * Math.min(1, dt * 6);
            tx = G.hermes ? G.hermes.position.x : wx(run.x); tz = G.hermes ? G.hermes.position.z : wz(run.y); dist = c.dist; pitch = c.pitch;
          }
          p = [tx + Math.sin(yaw) * dist * Math.cos(pitch), dist * Math.sin(pitch), tz + Math.cos(yaw) * dist * Math.cos(pitch)];
          l = [tx, 0.6, tz - 0.6];
        }
        if (!c.p || snap) { c.p = p.slice(); c.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * (view.ending ? 1.4 : 4.2));
          for (let i = 0; i < 3; i++) { c.p[i] += (p[i] - c.p[i]) * k; c.l[i] += (l[i] - c.l[i]) * k; }
        }
        cam.position.set(c.p[0], c.p[1], c.p[2]);
        cam.lookAt(c.l[0], c.l[1], c.l[2]);
      }
      function openingShots() {
        return [
          { from: { p: [0, 58, 44], l: [0, 0, 0] }, to: { p: [0, 40, 30], l: [0, 0, -2] }, dur: 6, kicker: 'STATION 15', title: 'THE SANDSTONE LABYRINTH', line: 'Night over the Sandstone Labyrinth. Far below, four torches move between the pillars.' },
          { from: { p: [6, 6, 24], l: [3, 1, 10] }, to: { p: [2, 5, 21], l: [3, 1.2, 8] }, dur: 5, line: 'The BC Ashes got here first. They have been camped in the fissures for days, waiting for someone to open the cairn.' },
          { from: { p: [CAIRN.x + 5, 3.2, CAIRN.z + 7], l: [CAIRN.x, 1, CAIRN.z] }, to: { p: [CAIRN.x + 3, 2.4, CAIRN.z + 5], l: [CAIRN.x, 1.1, CAIRN.z] }, dur: 5, line: 'And at the foot of Cairn III, his lamp turned low, Hermes.' }
        ];
      }

      // ---- The frame ----
      function tick(now, dt) {
        if (!G) return;
        const t = now / 1000, rm = reduced();
        if (G.hermes && G.hMove) G.hMove = stepMv(G.hermes, G.hMove, dt);
        G.raiders.forEach((r) => {
          if (r.mv) r.mv = stepMv(r.g, r.mv, dt);
          if (r.body && r.body.userData.update) r.body.userData.update(t + r.ph);
          if (r.body && r.body.userData.arm) r.body.userData.arm.rotation.x = 1.7 + (rm ? 0 : Math.sin(t * 2.2 + r.ph) * 0.08);
          r.flame.scale.set(0.6 + (rm ? 0 : Math.sin(t * 19 + r.ph) * 0.06), 0.9 + (rm ? 0 : Math.sin(t * 13 + r.ph) * 0.1), 1);
          r.flame.getWorldPosition(r.light.position);
          r.light.intensity = rm ? 2 : 1.9 + Math.sin(t * 17 + r.ph) * 0.22 + Math.sin(t * 7.3 + r.ph) * 0.18;
        });
        // the lamp sways with Hermes; out on the hardpan he lets it burn bright
        if (G.H && G.H.flame) { G.H.flame.getWorldPosition(G.lamp.position); }
        else if (G.hermes) G.lamp.position.set(G.hermes.position.x, 1.4, G.hermes.position.z);
        G.lamp.intensity = (isDone() ? 3.0 : 2.5) + (rm ? 0 : Math.sin(t * 11) * 0.12);
        // the light of the torches breathes on the ground
        G.litMesh.material.opacity = rm ? 0.5 : 0.42 + 0.12 * Math.sin(t * 5);
        G.rings.forEach((m) => {
          const c = m.userData.cell, hot = c && cellKey(c[0], c[1]) === view.hover;
          m.material.opacity = m.visible ? (hot ? 0.95 : 0.35 + (rm ? 0 : 0.15 * Math.sin(t * 3.4))) : 0;
          m.scale.setScalar(hot ? 1.18 : 1);
        });
        if (el.canvas) el.canvas.style.cursor = torchOn(view.hover) >= 0 || G.rings.some((m) => m.visible && m.userData.cell && cellKey(m.userData.cell[0], m.userData.cell[1]) === view.hover) ? 'pointer' : '';
        // the copper plate warms when the sigil is spoken; the seal shines for a moment
        const sk = view.sigilT ? Math.max(0, 1 - (now - view.sigilT) / 2600) : 0;
        G.copperMat.emissiveIntensity = isAwake() ? 0.2 + 0.6 * sk : 0.22 + (rm ? 0 : 0.06 * Math.sin(t * 2));
        G.oldPlate.material.emissiveIntensity = isAwake() ? 0.3 + 0.5 * sk : 0.16;
        const turn = view.sigilT && !rm ? Math.min(1, (now - view.sigilT) / 1600) : 1;
        G.oldPlate.rotation.z = isAwake() ? Math.PI * (turn * turn * (3 - 2 * turn)) : 0;
        G.sealHalo.material.opacity = sk * 0.9;
        if (view.peek && now > view.peek.until) { view.peek = null; render(); }
        const se = view.sigilT && !rm ? (now - view.sigilT) / 1000 : 9;
        G.seal.visible = se < 2.3;
        if (G.seal.visible) {
          const from = { x: CAIRN.x, y: 0.85, z: CAIRN.z + 0.9 }, up = Math.min(1, se / 1.2), fly = Math.max(0, Math.min(1, (se - 1.2) / 1.0)), fe = fly * fly * (3 - 2 * fly);
          const hp = G.hermes ? G.hermes.position : from;
          G.seal.position.set(from.x + (hp.x - from.x) * fe, from.y + 0.9 * (up * (2 - up)) + (1.3 - from.y - 0.9) * fe, from.z + (hp.z - from.z) * fe);
          G.seal.rotation.y = se * 5;
          G.seal.scale.setScalar(1 - 0.55 * fe);
        }
        if (isAwake() && !isDone() && !(cine && cine.active) && (!el.howto || el.howto.hidden) && view.idleT && now - view.idleT > 40000 && view.whispers < 3) whisper();
        G.starMat.emissiveIntensity = 0.12 + (rm ? 0 : 0.08 * Math.sin(t * 1.7));
        G.cleftGlow.material.opacity = (isDone() ? 0.95 : 0.6) + (rm ? 0 : 0.12 * Math.sin(t * 1.3));
        growRises(dt);
        writeInstances(false);
        if (G.fx) G.fx.frame(dt, G.camera);
        placeCamera(dt, false);
        if (G.fx) G.fx.render(G.scene, G.camera, dt); else G.renderer.render(G.scene, G.camera);
        if (G.adapt) G.adapt(dt); else if (P.fitSpeed) G.adapt = P.fitSpeed(G.renderer);
      }
      function frame(t) {
        if (!G || modal.style.display === 'none') return;
        const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
        lastT = t;
        tick(t, dt);
        raf = requestAnimationFrame(frame);
      }
      function fit() {
        if (!G || !el.stage) return;
        const w = el.stage.clientWidth || 800, h = el.stage.clientHeight || 450;
        G.renderer.setSize(w, h, false);
        G.camera.aspect = w / Math.max(1, h);
        G.camera.updateProjectionMatrix();
      }

      // Hermes whispers when she has left him still in the dark for a long while (three times at most per visit)
      const WHISPERS = [
        "I can hear their boots, Silvia. Hold me still in a dark passage with the space bar, and count the turns until a torch comes back to the same square.",
        "Point at a torch, on my map or down here in the dark, and I will watch it for you: you will see its whole round.",
        "Behind a torch is the safest place in this labyrinth. Let it pass me, then follow it while it walks away."
      ];
      function whisper() {
        view.idleT = performance.now();
        say(WHISPERS[view.whispers % WHISPERS.length]);
        subtitle('Hermes whispers on the wire.', 3.5, 'act');
        cue('tick', { f: 520, v: 0.04 });
        view.whispers++;
      }
      function render() {
        const awake = isAwake(), done = isDone();
        if (run) drawBoard();
        if (el.lives) {
          el.lives.textContent = '';
          const left = done ? LIVES : run ? run.lives : LIVES;
          for (let i = 0; i < LIVES; i++) {
            const span = document.createElement('span');
            span.textContent = '🏮';
            if (i >= left) span.className = i < view.prevLives ? 'is-spent is-lost' : 'is-spent';
            el.lives.appendChild(span);
          }
          el.lives.setAttribute('aria-label', left + ' of ' + LIVES + ' close calls left');
          view.prevLives = left;
        }
        if (el.turnLabel) el.turnLabel.textContent = done ? '✦ Escaped' : 'Turn ' + (run ? run.moves : 0);
        if (el.game) el.game.classList.toggle('is-locked', !awake);
        if (el.gameInner) el.gameInner.inert = !awake;
        if (el.sigilCard) el.sigilCard.classList.toggle('is-collapsed', awake);
        const spoken = 'Sigil spoken: ' + SIGIL + ' ✓';
        if (awake && el.keyFeedback && el.keyFeedback.textContent !== spoken) feedback(el.keyFeedback, spoken, 'ok');
        Object.values(el.pad).forEach((btn) => { if (btn) btn.disabled = !awake || done; });
        if (el.hint) el.hint.style.display = 'none';   // the rounds are announced by the hint note and by Hermes
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        if (el.game) el.game.style.display = done ? 'none' : '';
        syncWorld();
        setMood();
        sigilHints.refresh(); torchHints.refresh();
      }
      // The music fills as Hermes passes the star and the camp on his way to the cleft
      function setMood() {
        const amb = window.EclipseAmbience;
        if (!amb || !amb.intensity) return;
        const marks = (get(KEYS.star) === 'true' ? 1 : 0) + (get(KEYS.camp) === 'true' ? 1 : 0);
        amb.intensity(isDone() ? 0.6 : !isAwake() ? 0.3 : 0.38 + 0.08 * marks + (run && run.lives < LIVES ? 0.04 : 0));
      }

      // ---- Part I: the sigil from Sheet 14B ----
      function speakSigil() {
        if (isAwake()) return;
        const typed = (el.keyInput ? el.keyInput.value : '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
        if (!typed) { feedback(el.keyFeedback, 'Type the eight letters from the page “The Sandstone Labyrinth & Cairn III”.', 'error'); return; }
        if (typed !== SIGIL) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (!cue('wrong') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          if (G && G.fx) G.fx.blow(null, 0.2);
          feedback(el.keyFeedback, 'The copper plate does not move. Walk the one true road of the page “The Sandstone Labyrinth & Cairn III” again.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        cue('stone', { dur: 1.6 });
        if (!cue('reveal') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'WINDROSE. The copper plate turns, and the seal is in Hermes\'s hand.', 'ok');
        say("The plate turned under my hand, Silvia, and the Seal of Cairn III is in my palm. But those ruts were theirs, Silvia: the BC Ashes were already inside, and now their torches stand between me and the Southern Mouth. I cannot go back the way I came. The founders cut another way out, the Western Cleft, through the lower fissures. Your page shows only the true road; nobody ever drew the fissures, so my lamp will draw them for you, square by square. Guide me there through the dark. Let the torches pass, then follow behind them.");
        subtitle('The copper plate turns. The Seal of Cairn III is in his hand, and there are torches in the dark.', 5, 'act');
        view.idleT = performance.now();
        if (G) {
          view.sigilT = performance.now();
          if (G.fx) G.fx.triumph({ x: CAIRN.x, y: 1, z: CAIRN.z + 0.8 }, 0.8);
          setTimeout(() => cue('bell', { f: 783.99, v: 0.08, len: 2.2 }), 2100);   // the seal lands in his hand
        }
        render();
        if (el.pad.wait) setTimeout(() => el.pad.wait.focus({ preventScroll: true }), 60);
      }

      // ---- Part II: the escape ----
      function takeTurn(dx, dy) {
        if (!isAwake() || isDone() || !run) return;
        if (dx || dy) {
          const dir = dirOf(dx, dy);
          if (!dir || !canStep(run.x, run.y, dir)) {
            stepCue('thud');
            feedback(el.moveFeedback, 'Solid rock to the ' + (dir ? dir.name : 'side') + '.', 'error');
            if (G && G.hermes) {
              finishMoves();
              G.hermes.rotation.y = faceYaw(dx, dy);
              if (G.fx) { G.fx.shake.add(0.12); if (G.fx.gait) G.fx.gait.react('flinch'); G.fx.puff({ x: wx(run.x) + dx * S * 0.45, y: 1, z: wz(run.y) + dy * S * 0.45 }, 6); }
            }
            return;
          }
        }
        run.trail.push([run.x, run.y]);
        view.idleT = performance.now();
        stepCue(dx || dy ? 'step' : 'tick', { f: 900, v: 0.05 });
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
          cue('shimmer', { deg: 14 });
          say("Silvia... on the wall of this fissure there is a star, painted in gold leaf. Eight points, laid over a ground of blue. The gold is bright: it has not been here long. I know only one hand that gilded stars like this. I cannot stop now.");
          subtitle('On the rock, a star of gold leaf: eight points on a ground of blue. Fresh.', 5, 'act');
          if (G && G.fx) { G.fx.triumph({ x: wx(LEVEL.star[0]), y: 1.4, z: wz(LEVEL.star[1]) - S / 2 + 0.5 }, 0.6); if (G.fx.gait) G.fx.gait.react('wonder'); }
        } else if (run.x === LEVEL.camp[0] && run.y === LEVEL.camp[1] && get(KEYS.camp) !== 'true') {
          set(KEYS.camp, 'true');
          cue('crack', { v: 0.16 });
          say("Their camp. Cold ashes, a broken wagon wheel, and the charred circle of the BC Ashes scratched on the rock. They have been sleeping in this labyrinth for days, waiting for someone to open the cairn for them.");
          subtitle('Cold ashes, a broken wheel, a charred circle on the rock: the raiders\' camp.', 5, 'act');
          if (G && G.fx && G.fx.gait) G.fx.gait.react('worry');
        }
      }

      function caught(how) {
        if (!cue(run.lives <= 1 ? 'dusk' : 'heart') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        const captures = (parseInt(get(KEYS.captures) || '0', 10) || 0) + 1;
        set(KEYS.captures, String(captures));
        torchHints.fail();
        if (el.stage) { el.stage.classList.remove('laby-flash'); void el.stage.getBoundingClientRect(); el.stage.classList.add('laby-flash'); }
        if (G && G.fx && G.hermes) G.fx.blow({ x: G.hermes.position.x, y: 0.4, z: G.hermes.position.z }, 0.6);
        run.lives--;
        if (run.lives <= 0) {
          newRun();
          feedback(el.moveFeedback, how + ' No close calls left: Hermes ran back to the shadow of Cairn III.', 'error');
          say("They saw me, Silvia. I ran back up to the cairn and they lost me among the pillars. The torches keep their rounds; watch them, and we try again." + (torchHintOn() ? " I have drawn their rounds on the ground and on your map." : ''));
          subtitle('Seen. He runs back up to the cairn, and the torches lose him among the pillars.', 4.5, 'act');
          backToCairn();
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
        subtitle('The light finds him. He presses into a crack in the rock, and the torch walks on.', 4, 'act');
        render();
      }
      // with no close calls left the night goes black for a breath, and Hermes is back under the cairn
      function backToCairn() {
        if (!G || reduced() || !el.fade) { view.snapNext = true; render(); return; }
        el.fade.classList.add('is-on');
        render();
        finishMoves();
        if (G.hermes) G.hMove = null;
        setTimeout(() => { view.snapNext = true; syncWorld(); el.fade.classList.remove('is-on'); }, 650);
        view.snapNext = false;
      }

      function completeStation() {
        set(KEYS.done, 'true');
        cue('whoosh', { dur: 1.4 });
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.grantCairnSeal === 'function') window.grantCairnSeal(3);
        else set('order_seal_cairn_3', 'true');
        feedback(el.moveFeedback, 'The Western Cleft. Hermes is out.', 'ok');
        say("I am out, Silvia! Through the Western Cleft and out to the edge of the hardpan. The torches are still searching the fissures behind me.");
        subtitle('Through the Western Cleft, and out onto the open hardpan. Behind him the torches search the dark.', 6, 'act');
        if (G && !reduced()) {
          // he squeezes through the cleft; then the whole labyrinth stands up out of the dark, from the cleft outwards
          view.ending = 1;
          finishMoves();
          G.hMove = moveTo(G.hermes, CLEFT.x, CLEFT.z, 1.6, faceYaw(-1, 0));
          setTimeout(() => { if (G && G.fx) G.fx.triumph({ x: CLEFT.x, y: 1, z: CLEFT.z }, 1); }, 1500);
          setTimeout(() => { view.ending = 0; view.overview = true; }, 5200);
        }
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        if (el.finish) setTimeout(() => el.finish.focus({ preventScroll: true }), 60);
      }

      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "Hermes squeezed through the Western Cleft with the Seal of Cairn III wrapped in his scarf. The raiders never saw his face. Under the copper plate, on the founders' stone, two lines were waiting. And there was more in that labyrinth... He will tell you on the wire.";
        }
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        if (run) { run.x = LEVEL.exit[0]; run.y = LEVEL.exit[1]; }
      }

      // ---- Controls: pad, keyboard, clicking a square next to Hermes (in the scene or on his map) ----
      const STEPS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], wait: [0, 0] };
      const busyOverlay = () => (cine && cine.active) || (el.howto && !el.howto.hidden);
      function press(k) {
        const b = el.pad[k];
        if (b) { b.classList.add('is-pressed'); clearTimeout(b.__t); b.__t = setTimeout(() => b.classList.remove('is-pressed'), 130); }
        takeTurn(STEPS[k][0], STEPS[k][1]);
      }
      Object.keys(STEPS).forEach((k) => { if (el.pad[k]) el.pad[k].addEventListener('click', () => takeTurn(STEPS[k][0], STEPS[k][1])); });
      const KEYMAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'wait' };
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'none' || !isAwake() || isDone()) return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const k = KEYMAP[e.key];
        if (!k) return;
        if (e.repeat) { e.preventDefault(); return; }
        if (busyOverlay()) return;
        // The space bar holds still even when a pad arrow has focus: the browser would otherwise press that arrow again
        if (k === 'wait' && e.target && e.target.tagName === 'BUTTON' && !modal.contains(e.target)) return;
        e.preventDefault();
        press(k);
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
          if (x >= 0 && y >= 0 && x < LEVEL.cols && y < LEVEL.rows && torchOn(cellKey(x, y)) >= 0) { peekRound(torchOn(cellKey(x, y))); return; }
          const dx = x - run.x, dy = y - run.y;
          if (Math.abs(dx) + Math.abs(dy) <= 1) takeTurn(dx, dy);
        });
      }
      if (el.speak) el.speak.addEventListener('click', speakSigil);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakSigil(); });

      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('laby3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('laby3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-laby-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
      }
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = isDone() ? el.finish : isAwake() ? el.pad.wait : el.keyInput;
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-laby-howto-back'), hn = $('btn-laby-howto-next'), hs = $('btn-laby-howto-skip');
      if (hb) hb.addEventListener('click', () => { if (howtoPage === 0) hideHowto(); else showHowto(howtoPage - 1); });
      if (hn) hn.addEventListener('click', () => { if (howtoPage >= 3) hideHowto(); else showHowto(howtoPage + 1); });
      if (hs) hs.addEventListener('click', hideHowto);

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_sun_monolith_completed') !== 'true') return false;
        return typeof window.isLabyrinthMarchOver === 'function' ? window.isLabyrinthMarchOver() : false;
      }
      let returnFocusTo = null, scrollLockY = 0;
      function lockHubScroll(on) {
        const root = document.documentElement, body = document.body;
        if (!root || !body) return;
        if (on) {
          scrollLockY = window.scrollY || window.pageYOffset || 0;
          root.classList.add('game-open');
          body.style.overflow = 'hidden'; body.style.position = 'fixed'; body.style.top = '-' + scrollLockY + 'px';
          body.style.left = '0'; body.style.right = '0'; body.style.width = '100%';
        } else {
          body.style.overflow = ''; body.style.position = ''; body.style.top = ''; body.style.left = ''; body.style.right = ''; body.style.width = '';
          window.scrollTo(0, scrollLockY || 0);
        }
      }
      function stopHubScroll(e) {
        const panel = el.dispatch && el.dispatch.closest('.chasm3d-panel');
        if (panel && panel.contains(e.target) && (panel.scrollHeight > panel.clientHeight + 1 || panel.parentElement.scrollHeight > panel.parentElement.clientHeight + 1)) return;
        if (el.howto && el.howto.contains(e.target)) return;
        if (e.target === el.canvas) return;
        e.preventDefault();
      }
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
        lockHubScroll(true);
        modal.addEventListener('wheel', stopHubScroll, { passive: false });
        modal.addEventListener('touchmove', stopHubScroll, { passive: false });
        returnFocusTo = document.activeElement;
        if (!run) newRun();
        if (!G && el.canvas) G = buildWorld();
        bindPointer();
        if (G && !cine && el.stage && P.cinema) {
          cine = P.cinema(el.stage, {
            reduced,
            onShot: (i, sh) => { if (sh.line) subtitle(sh.line, sh.dur - 0.4); if (i === 0) cue('whoosh', { dur: 1.8 }); }
          });
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        if (G && 'ResizeObserver' in window && !el.stage.__labyFit) { el.stage.__labyFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        view.ending = 0; view.overview = isDone(); view.sigilT = 0; view.snapNext = true; view.peek = null; view.idleT = performance.now(); view.whispers = 0;
        if (G) { G.cam.p = null; G.cam.dist = G.cam.tDist = 16; G.cam.pitch = G.cam.tPitch = 1.02; }
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I reached the Southern Mouth at noon and waited in the rocks for dark. Now I am inside, at the foot of Cairn III. A pyramid of dry stone, and on its face my own copper benchmark from 1998. Beneath it there is an older copper plate, with eight empty letter slots. It wants the name of the true road, the one on the page “The Sandstone Labyrinth & Cairn III” of your journal.");
        else say("The torches are still out there. Watch their rounds, Silvia, and take me to the Western Cleft.");
        render();
        // The bed starts at its own level when the modal appears; set ours once it has
        setTimeout(setMood, 700);
        const finishOpen = () => {
          if (get(HOWTO_KEY) !== 'seen' && !isDone()) { showHowto(0); return; }
          const focusTarget = isDone() ? el.finish : isAwake() ? el.pad.wait : el.keyInput;
          if (focusTarget) setTimeout(() => { if (modal.style.display !== 'none') focusTarget.focus({ preventScroll: true }); }, 60);
        };
        lastT = 0;
        cancelAnimationFrame(raf);
        if (G) raf = requestAnimationFrame(frame);
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          set(CINE_INTRO, 'seen');
          if (el.stage) el.stage.classList.add('is-cine');
          view.cineAll = true; view.snapNext = true; syncWorld();
          cine.start(openingShots(), () => {
            if (el.stage) el.stage.classList.remove('is-cine');
            if (el.subtitle) el.subtitle.classList.remove('is-on');   // a skipped film leaves no line behind
            view.cineAll = false; syncWorld();
            finishOpen();
          });
        } else finishOpen();
      }
      function closeLabyrinthModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (cine && cine.active) cine.skip();
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openLabyrinthModal = openLabyrinthModal;
      window.closeLabyrinthModal = closeLabyrinthModal;
      if (el.close) el.close.addEventListener('click', closeLabyrinthModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeLabyrinthModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeLabyrinthModal();
      }, true);
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

      // Test hook for scripts/audit/web_smoke.py: the level (it is in this source anyway), the controls and the scene
      window.__labyrinth = {
        level: JSON.parse(JSON.stringify(LEVEL)),
        reach: REACH,
        state: () => (run ? { x: run.x, y: run.y, t: run.t, moves: run.moves, lives: run.lives } : null),
        step: (dx, dy) => takeTurn(dx, dy),
        gfx: () => G,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          const up = (list) => list.filter((it) => it.goal > 0).length;
          const hp = G.hermes ? G.hermes.position : null;
          return {
            gl: true, walls: up(G.plan.segs), wallsTotal: G.plan.segs.length, tiles: up(G.tiles), lit: G.litMesh.count,
            raiders: G.raiders.map((r) => [+(r.g.position.x / S + (LEVEL.cols - 1) / 2).toFixed(2), +(r.g.position.z / S + (LEVEL.rows - 1) / 2).toFixed(2)]),
            hermes: hp ? [+(hp.x / S + (LEVEL.cols - 1) / 2).toFixed(2), +(hp.z / S + (LEVEL.rows - 1) / 2).toFixed(2)] : null,
            star: G.star.visible, camp: G.camp.visible, rounds: G.rounds.visible, rings: G.rings.filter((m) => m.visible).length,
            danger: !!(el.danger && el.danger.classList.contains('is-on')), post: !!(G.fx && G.fx.post), gait: !!(G.fx && G.fx.gait)
          };
        },
        settle: () => { finishMoves(); if (G) { [G.tiles, G.plan.segs, G.plan.pillars].forEach((l) => l.forEach((it) => { it.rise = it.goal; it.delay = 0; })); writeInstances(true); } },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) tick(performance.now() + i * 33, 1 / 30); }
      };

      newRun();
      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
