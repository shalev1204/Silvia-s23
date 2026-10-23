    // =========================================================================
    // Station 10 · The Whispering Chasm: a walk behind Hermes through the canyon of Sheet 9B (three.js)
    // =========================================================================
    // The camera follows Hermes and his lantern down the gorge. He walks on his own along each corridor and stops
    // where something must be decided: a fork, a cairn, a dead end. Silvia steers from her printed sheet; the screen
    // never shows the map. Four layers: whispers that come from the right branch (one per stretch), relics she
    // turns in her hands to find each rune, water and sun, and his footprints in the sand (the first law).
    // A wrong turn sends him back to the last cairn, costing a skin of water; the wind fills in the tracks.
    (function initWhisperingChasm() {
      const modal = document.getElementById('modal-whispering-chasm');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const el = {
        stage: $('chasm3d-stage'), canvas: $('chasm3d-canvas'), fade: $('chasm3d-fade'), subtitle: $('chasm3d-subtitle'),
        runes: $('chasm3d-runes'), rose: $('chasm3d-rose'), facing: $('chasm3d-facing'), skins: $('chasm3d-skins'), clock: $('chasm3d-clock'),
        voice: $('chasm3d-voice'), where: $('chasm3d-where'), controls: $('chasm3d-controls'),
        victory: $('chasm-victory-card'), finish: $('btn-chasm-finish'), again: $('btn-chasm-again'), close: $('btn-close-chasm')
      };
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const isDone = () => get('order_whispering_chasm_completed') === 'true';
      const soundOn = () => !(window.EclipseAmbience && window.EclipseAmbience.state().muted);
      const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const WALK_KEY = 'order_chasm_walk';

      // ---- The canyon of Sheet 9B (25 × 25; 1 = rock). Generated with the printed sheet by
      // scripts/journal/build_desert_games.py (render_game_d1): it must stay identical to the paper.
      const MAZE = [
        "1111111111111111111111111",
        "0000000000100000100000001",
        "1011111110101110101110101",
        "1000000010001000101000101",
        "1011111011111011111011101",
        "1010000010000010001010101",
        "1010111110111110101010101",
        "1010000010000010100010001",
        "1011111011111010111110111",
        "1000100010001000100010001",
        "1110101110101111101111101",
        "1010100000100000001000001",
        "1010111111111111101011111",
        "1010101000000000101000101",
        "1010101011111010101110101",
        "1010100010000010100010001",
        "1010111110111110111011101",
        "1010100010100010001000101",
        "1010101010101111101110101",
        "1010001010100000001010101",
        "1011111010101111111010101",
        "1000001010100000100010001",
        "1010111010111110101011101",
        "1010000000100000001000000",
        "1111111111111111111111111"
      ];
      const N = 25, START = [1, 0], EXIT = [23, 24];
      const DIRS = [[-1, 0, 'north'], [0, 1, 'east'], [1, 0, 'south'], [0, -1, 'west']];
      const REL = ['ahead', 'to your right', 'behind you', 'to your left'];
      const FROM = ['straight ahead', 'your right', 'behind you', 'your left'];
      const REL_BTN = [['↑', 'Ahead'], ['→', 'Right'], ['↓', 'Back'], ['←', 'Left']];
      const key = (r, c) => r * N + c;
      const at = (k) => [Math.floor(k / N), k % N];
      const open = (r, c) => r >= 0 && r < N && c >= 0 && c < N && MAZE[r][c] === '0';

      // The six relic cairns in the order the true road meets them (M-I-R-A-G-E), and what lies on each
      const CAIRNS = [
        { letter: 'M', r: 7, c: 9, relic: 'bell',
          arrive: "A cairn, Silvia! A little tower of flat red stones, as high as my knee. The walkers call these the Six Relic Cairns: each one keeps something that belonged to a pilgrim the gorge never gave back. They are not the Order's great Cairns, but the walkers treat them with the same respect. On top of this one sits a bronze bell, green with age. Somewhere on it there is a letter. Turn it in your hands until you find it.",
          found: "M, cut into the rim of the bell. That is the first rune. At the foot of the cairn the walkers have left a clay jar sealed with wax, full of cool water, and I have filled all three skins. Write the M in the first box on your sheet." },
        { letter: 'I', r: 9, c: 23, relic: 'lamp',
          arrive: "The second cairn, half hidden in the shadow of the wall. Someone left a small clay oil lamp on it, the kind you carry in the palm of your hand, still black with old smoke. Find the letter for me.",
          found: "I, scratched into the lamp. Two runes. There is another water jar here, and my skins are full again. The canyon is getting deeper; I can barely see the sky." },
        { letter: 'R', r: 11, c: 13, relic: 'comb',
          arrive: "The third cairn. The wind finds a gap in the cliffs here and whistles through it, thin and high, like a kettle someone forgot on the fire. On the stones lies a comb carved from bone, with half its teeth missing.",
          found: "R, carved along the back of the comb, so small I nearly missed it. Three runes, and my skins are full. Keep this one in mind, Silvia: the third rune of the canyon is the R, and your Cipher Ledger will want it." },
        { letter: 'A', r: 7, c: 1, relic: 'horn',
          arrive: "The fourth cairn stands close to the western wall of the canyon. On top lies a ram's horn, curled like a snail shell, the kind shepherds blow to call their flock home in the evening.",
          found: "A, on a little brass plate fixed to the horn. Four runes. I have drunk, I have filled the skins, and I am ready." },
        { letter: 'G', r: 15, c: 13, relic: 'key',
          arrive: "The fifth cairn. The gravel under my boots is damp here, and I can smell water somewhere under the rock. On the stones lies a heavy iron key, bigger than my hand and rusted orange.",
          found: "G, cut into the round end of the key. Five runes. One more, Silvia. Only one." },
        { letter: 'E', r: 21, c: 15, relic: 'shell',
          arrive: "The sixth cairn! The walls are lower here and the light is coming back. On the top stone lies a sea shell, a scallop, very far from any sea. Some pilgrim carried it all the way here.",
          found: "E, cut into the shell. Six runes: M, I, R, A, G, E. The walkers call the end of this canyon the Oasis Gate, because their old track runs on across the salt to the wells. Now take me out, Silvia." }
      ];
      // Cairns that stand at the end of blind gorges: traps for travellers (printed on the sheet with false runes)
      const DECOYS = [{ letter: 'T', r: 13, c: 5 }, { letter: 'K', r: 19, c: 19 }, { letter: 'S', r: 3, c: 17 }];
      // Dead ends named on Sheet 9B: Hermes says the name, so Silvia can find him on the paper
      const PLACES = {
        [key(11, 1)]: { kind: 'well', text: "This must be the place your sheet calls The Dry Well: a ring of old stones around a hole full of dust. No water in it, and no way on." },
        [key(23, 1)]: { kind: 'pit', text: "Stop! The floor ends one step in front of my boots. There is a crack in the ground here, so deep that my lantern cannot find the bottom. This must be the Blind Chasm on your sheet." },
        [key(23, 11)]: { kind: 'salt', text: "The ground turns white and crusty here, like old snow. It is a pit of salt, and the crust cracks when I touch it with my boot. Your sheet calls this the Salt Basin. There is no way through." },
        [key(13, 23)]: { kind: 'dune', text: "A slope of loose red sand fills the gorge from wall to wall. I tried to climb it and slid back down twice. This must be the Sands of Thirst on your sheet. No way through." }
      };
      const cairnAt = {}, decoyAt = {};
      CAIRNS.forEach((c, i) => { cairnAt[key(c.r, c.c)] = i; });
      DECOYS.forEach((d) => { decoyAt[key(d.r, d.c)] = d; });

      const FORK_LINES = [
        "The gorge splits here. Which way, Silvia?",
        "Another fork. I will wait while you look at the sheet.",
        "Two ways again. Take your time; the rock is not going anywhere.",
        "The walls open into a small crossing. Where now?",
        "A fork. The wind is coming down both passages, so it is no help to me. Your sheet is."
      ];
      const WHISPERS = ['…this way… the water is this way…', '…come… come along the wall…', '…here… the stones are here…', '…follow… follow the cold air…'];
      const MIN_PER_CELL = 1.2, START_MIN = 6 * 60 + 10, CELLS_PER_SKIN = 60, REST_S = 40;

      const hints = window.EclipseHints.define({
        id: 's10-chasm', station: 'Station 10', title: 'the whispering chasm', group: 'desert',
        anchor: () => el.controls,
        solved: isDone,
        texts: [
          "Keep your pencil on Sheet 9B and move it every time I move, so you always know where I am. The top of the page is north, like the N on the compass in the corner of your screen.",
          "The walkers' laws, in plain words: never walk the same ground twice; the quick road to the Oasis skips the cairns, so do not take it; the six cairns must come in order; and a gorge that ends in a wall, a drop or a false cairn is a trap.",
          "Let us take the first turn together. Just inside the North Portal the gorge splits: one way drops south straight away. That is the quick road the second law warns about. Keep going east, along the top of the sheet, and the first cairn your pencil meets is M."
        ]
      });

      // ---- State (saved at every stop, so she can close the Hub and come back to the same place) ----
      let S = null;
      function fresh() {
        return { pos: START.slice(), h: 1, trail: [key(START[0], START[1])], ss: 0, runes: 0, water: 3, min: START_MIN, wh: 1,
                 cp: START.slice(), ch: 1, walked: 0, forks: 0 };
      }
      function load() {
        try {
          const s = JSON.parse(get(WALK_KEY) || 'null');
          if (s && Array.isArray(s.pos) && Array.isArray(s.trail) && s.trail.length && open(s.pos[0], s.pos[1])) return Object.assign(fresh(), s);
        } catch (e) {}
        return fresh();
      }
      function save() { put(WALK_KEY, JSON.stringify(S)); }
      const trailSet = () => new Set(S.trail);
      const cameFrom = () => (S.trail.length > 1 ? S.trail[S.trail.length - 2] : -1);

      // The ways out of the cell he stands on, with the ones his own footprints already cover
      function options() {
        const [r, c] = S.pos, seen = trailSet(), back = cameFrom(), out = [];
        DIRS.forEach(([dr, dc], d) => {
          const k = key(r + dr, c + dc);
          if (!open(r + dr, c + dc) || k === back) return;
          out.push({ d, blocked: seen.has(k) });
        });
        if (r === START[0] && c === START[1] && S.trail.length === 1) return out.filter((o) => o.d === 1);
        return out;
      }

      // Walk from the current cell in direction d until something must be decided. Returns the cells and why he stopped.
      function plan(d) {
        const seen = trailSet(), cells = [];
        let [r, c] = S.pos, dir = d, prev = key(r, c);
        for (let guard = 0; guard < 700; guard++) {
          r += DIRS[dir][0]; c += DIRS[dir][1];
          const k = key(r, c);
          cells.push({ k, d: dir });
          seen.add(k);
          if (k in cairnAt) return { cells, stop: cairnAt[k] === S.runes ? 'rune' : 'early' };
          if (k in decoyAt) return { cells, stop: 'decoy' };
          if (r === EXIT[0] && c === EXIT[1]) return { cells, stop: S.runes === 6 ? 'out' : 'exit-early' };
          const onward = [];
          DIRS.forEach(([dr, dc], nd) => { if (open(r + dr, c + dc) && key(r + dr, c + dc) !== prev) onward.push(nd); });
          if (!onward.length) return { cells, stop: 'dead' };
          if (onward.length > 1) {
            const free = onward.filter((nd) => !seen.has(key(r + DIRS[nd][0], c + DIRS[nd][1])));
            return { cells, stop: free.length ? 'fork' : 'stuck' };
          }
          if (seen.has(key(r + DIRS[onward[0]][0], c + DIRS[onward[0]][1]))) return { cells, stop: 'tracks' };
          prev = k; dir = onward[0];
        }
        return { cells, stop: 'dead' };
      }

      // The way the whisper comes from: the first step of the shortest walk to the next cairn (or the exit) that
      // stays off his own footprints and off every other cairn. -1 when no such walk exists.
      function whisperDir() {
        const goal = S.runes < 6 ? key(CAIRNS[S.runes].r, CAIRNS[S.runes].c) : key(EXIT[0], EXIT[1]);
        const seen = trailSet(), start = key(S.pos[0], S.pos[1]);
        const first = new Map([[start, -1]]), queue = [start];
        while (queue.length) {
          const k = queue.shift();
          if (k === goal) return first.get(k);
          const [r, c] = at(k);
          DIRS.forEach(([dr, dc], d) => {
            const nk = key(r + dr, c + dc);
            if (!open(r + dr, c + dc) || first.has(nk) || seen.has(nk)) return;
            if (nk !== goal && ((nk in cairnAt) || (nk in decoyAt) || (r + dr === EXIT[0] && c + dc === EXIT[1]))) return;
            first.set(nk, k === start ? d : first.get(k));
            queue.push(nk);
          });
        }
        return -1;
      }

      // =====================================================================
      // The 3D canyon
      // =====================================================================
      const CELL = 2;
      const wx = (c) => c * CELL, wz = (r) => r * CELL;
      const yawOf = (d) => Math.atan2(-DIRS[d][1], -DIRS[d][0]);   // yaw 0 faces -Z, which is north (the top of the sheet)
      let G = null;   // everything three.js, built on the first opening

      function rng(seed) {
        let s = seed >>> 0;
        return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      }
      function canvasTex(w, h, paint, repeat) {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        paint(cv.getContext('2d'), w, h);
        const t = new THREE.CanvasTexture(cv);
        if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
        return t;
      }

      function buildWorld() {
        const T = window.THREE;
        let renderer;
        try {
          renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' });
        } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        const scene = new T.Scene();
        scene.fog = new T.Fog(0x3a2418, 10, 46);
        const camera = new T.PerspectiveCamera(62, 16 / 10, 0.1, 160);
        const rand = rng(909);

        // Sky dome with a sun
        const skyGeo = new T.SphereGeometry(120, 24, 12);
        const skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
        skyGeo.setAttribute('color', new T.BufferAttribute(skyCol, 3));
        const sky = new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
        scene.add(sky);
        const sunDisc = new T.Sprite(new T.SpriteMaterial({
          map: canvasTex(64, 64, (g, w) => {
            const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
            gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(0.25, 'rgba(255,230,160,0.9)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
            g.fillStyle = gr; g.fillRect(0, 0, w, w);
          }), fog: false, depthWrite: false, transparent: true }));
        sunDisc.scale.set(16, 16, 1);
        scene.add(sunDisc);

        // Light: the sky, the sun (shadows follow Hermes), his lantern
        const hemi = new T.HemisphereLight(0xffd6a8, 0x5a2a18, 0.55);
        scene.add(hemi);
        const sun = new T.DirectionalLight(0xffe2b0, 1.2);
        sun.castShadow = true;
        sun.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 });
        sun.shadow.bias = -0.0015;
        sun.shadow.camera.updateProjectionMatrix();
        scene.add(sun); scene.add(sun.target);
        const lantern = new T.PointLight(0xffb15a, 1.4, 10, 2);
        scene.add(lantern);

        // Sand floor
        const sandTex = canvasTex(256, 256, (g, w, h) => {
          g.fillStyle = '#c4834f'; g.fillRect(0, 0, w, h);
          const r2 = rng(5);
          for (let i = 0; i < 5000; i++) {
            const v = r2();
            g.fillStyle = v < 0.5 ? 'rgba(120,60,30,0.18)' : 'rgba(255,220,170,0.16)';
            g.fillRect(r2() * w, r2() * h, 1 + r2() * 2, 1 + r2() * 2);
          }
          g.strokeStyle = 'rgba(140,80,40,0.12)'; g.lineWidth = 2;
          for (let y = 8; y < h; y += 18) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x / 20 + y) * 3); g.stroke(); }
        }, [30, 30]);
        const floor = new T.Mesh(new T.PlaneGeometry(140, 140), new T.MeshLambertMaterial({ map: sandTex }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(wx(12), 0, wz(12));
        floor.receiveShadow = true;
        scene.add(floor);

        // Canyon walls: one block per rock cell of the sheet, plus a broken ledge on top, plus a ring outside
        const rockTex = canvasTex(64, 256, (g, w, h) => {
          const bands = ['#8f3f24', '#a8512e', '#7c341e', '#b9683c', '#94452a', '#6e2d1a', '#a35a33'];
          let y = 0;
          const r2 = rng(17);
          while (y < h) { const bh = 6 + r2() * 26; g.fillStyle = bands[Math.floor(r2() * bands.length)]; g.fillRect(0, y, w, bh); y += bh; }
          for (let i = 0; i < 900; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(40,15,8,0.22)' : 'rgba(255,190,140,0.12)'; g.fillRect(r2() * w, r2() * h, 1 + r2() * 3, 1); }
        }, [1, 2]);
        const rockMat = new T.MeshLambertMaterial({ map: rockTex });
        const cells = [];
        for (let r = -3; r < N + 3; r++) {
          for (let c = -3; c < N + 3; c++) {
            const inside = r >= 0 && r < N && c >= 0 && c < N;
            if (inside && MAZE[r][c] === '0') continue;
            if (!inside && r === START[0] && c < 0) continue;      // the way in, behind the North Portal
            if (!inside && r === EXIT[0] && c >= N) continue;      // the way out, to the Oasis
            cells.push([r, c, inside]);
          }
        }
        const box = new T.BoxGeometry(1, 1, 1);
        box.translate(0, 0.5, 0);
        const walls = new T.InstancedMesh(box, rockMat, cells.length * 2);
        walls.castShadow = true; walls.receiveShadow = true;
        const m4 = new T.Matrix4(), q = new T.Quaternion(), v = new T.Vector3(), sc = new T.Vector3();
        let n = 0;
        cells.forEach(([r, c, inside]) => {
          const h = inside ? 6 + rand() * 3.5 : 9 + rand() * 4;
          m4.compose(v.set(wx(c), 0, wz(r)), q.identity(), sc.set(CELL * 1.02, h, CELL * 1.02));
          walls.setMatrixAt(n++, m4);
          const lh = 0.8 + rand() * 2.4, s = CELL * (0.55 + rand() * 0.4);
          q.setFromAxisAngle(v.set(0, 1, 0), rand() * Math.PI);
          m4.compose(v.set(wx(c) + (rand() - 0.5) * 0.7, h - 0.3, wz(r) + (rand() - 0.5) * 0.7), q, sc.set(s, lh, s));
          walls.setMatrixAt(n++, m4);
        });
        walls.count = n;
        scene.add(walls);

        // Fallen rocks along the foot of the walls
        const rubbleGeo = new T.IcosahedronGeometry(0.5, 0);
        const rubble = new T.InstancedMesh(rubbleGeo, new T.MeshLambertMaterial({ color: 0x8a4a2c, flatShading: true }), 420);
        rubble.castShadow = true; rubble.receiveShadow = true;
        let rn = 0;
        for (let r = 0; r < N && rn < 420; r++) for (let c = 0; c < N && rn < 420; c++) {
          if (MAZE[r][c] !== '0') continue;
          DIRS.forEach(([dr, dc]) => {
            if (rn >= 420 || open(r + dr, c + dc) || rand() > 0.32) return;
            const s = 0.15 + rand() * 0.35;
            const along = (rand() - 0.5) * CELL * 0.8;
            q.setFromEuler(new T.Euler(rand() * 3, rand() * 3, rand() * 3));
            m4.compose(v.set(wx(c) + dc * 0.8 + (dr ? along : 0), s * 0.35, wz(r) + dr * 0.8 + (dc ? along : 0)), q, sc.set(s, s * 0.7, s));
            rubble.setMatrixAt(rn++, m4);
          });
        }
        rubble.count = rn;
        scene.add(rubble);

        // Cairns, false cairns, the named dead ends, the two portals
        const stoneMat = new T.MeshLambertMaterial({ color: 0xa0603a, flatShading: true });
        const stoneAt = {};
        // A cairn stands against the wall of its corridor (or at the back of its dead end), so Hermes stops beside it
        function cairnMesh(r, c, seed) {
          let ox = 0, oz = 0;
          DIRS.forEach(([dr, dc]) => { if (open(r + dr, c + dc)) { ox -= dc; oz -= dr; } });
          if (!ox && !oz) { if (open(r - 1, c)) ox = 1; else oz = 1; }
          const len = Math.hypot(ox, oz), x = wx(c) + ox / len * 0.62, z = wz(r) + oz / len * 0.62;
          const g = new T.Group(), r2 = rng(seed);
          for (let i = 0; i < 6; i++) {
            const s = 0.42 - i * 0.055;
            const st = new T.Mesh(new T.DodecahedronGeometry(s, 0), stoneMat);
            st.scale.set(1, 0.42, 1);
            st.position.set((r2() - 0.5) * 0.06, 0.12 + i * 0.19, (r2() - 0.5) * 0.06);
            st.rotation.y = r2() * 3;
            st.castShadow = true;
            g.add(st);
          }
          g.position.set(x, 0, z);
          scene.add(g);
          stoneAt[key(r, c)] = g.position;
          return g;
        }
        const jarMat = new T.MeshLambertMaterial({ color: 0x9c5b34 });
        CAIRNS.forEach((ca, i) => {
          const g = cairnMesh(ca.r, ca.c, 100 + i);
          const jar = new T.Mesh(new T.LatheGeometry([[0, 0], [0.16, 0.02], [0.2, 0.16], [0.14, 0.34], [0.08, 0.38], [0.09, 0.44]].map((p) => new T.Vector2(p[0], p[1])), 12), jarMat);
          jar.position.set(0.35, 0, 0.3);
          jar.castShadow = true;
          g.add(jar);
        });
        DECOYS.forEach((d, i) => { cairnMesh(d.r, d.c, 300 + i).rotation.z = 0.08; });
        Object.keys(PLACES).forEach((k) => {
          const [r, c] = at(+k), x = wx(c), z = wz(r), kind = PLACES[k].kind;
          if (kind === 'well') {
            const ring = new T.Mesh(new T.TorusGeometry(0.62, 0.17, 6, 16), stoneMat);
            ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.14, z); ring.castShadow = true;
            const hole = new T.Mesh(new T.CircleGeometry(0.5, 16), new T.MeshBasicMaterial({ color: 0x120804 }));
            hole.rotation.x = -Math.PI / 2; hole.position.set(x, 0.03, z);
            scene.add(ring); scene.add(hole);
          } else if (kind === 'pit') {
            const pit = new T.Mesh(new T.CircleGeometry(0.95, 9), new T.MeshBasicMaterial({ color: 0x050302 }));
            pit.rotation.x = -Math.PI / 2; pit.scale.set(1, 0.7, 1); pit.position.set(x, 0.02, z + 0.2);
            scene.add(pit);
          } else if (kind === 'salt') {
            const salt = new T.Mesh(new T.CircleGeometry(1.15, 12), new T.MeshLambertMaterial({ color: 0xf2eee4 }));
            salt.rotation.x = -Math.PI / 2; salt.position.set(x, 0.02, z); salt.receiveShadow = true;
            scene.add(salt);
          } else if (kind === 'dune') {
            const dune = new T.Mesh(new T.SphereGeometry(1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshLambertMaterial({ map: sandTex }));
            dune.scale.set(0.95, 1.1, 1.3); dune.position.set(x + 0.4, 0, z); dune.receiveShadow = true;
            scene.add(dune);
          }
        });
        const glowMat = (col) => new T.MeshBasicMaterial({ color: col, fog: false });
        const exitGlow = new T.Mesh(new T.PlaneGeometry(CELL * 1.2, 14), glowMat(0xfff4dc));
        exitGlow.position.set(wx(N + 3), 5, wz(EXIT[0])); exitGlow.rotation.y = -Math.PI / 2;
        scene.add(exitGlow);
        const portalGlow = new T.Mesh(new T.PlaneGeometry(CELL * 1.2, 14), glowMat(0xffe0b0));
        portalGlow.position.set(wx(-3), 5, wz(START[0])); portalGlow.rotation.y = Math.PI / 2;
        scene.add(portalGlow);

        // Footprints
        const printTex = canvasTex(32, 64, (g) => {
          g.fillStyle = 'rgba(70,32,14,0.75)';
          g.beginPath(); g.ellipse(16, 22, 9, 15, 0, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.ellipse(16, 50, 7, 9, 0, 0, Math.PI * 2); g.fill();
        });
        const printGeo = new T.PlaneGeometry(0.2, 0.38);
        printGeo.rotateX(-Math.PI / 2);
        const prints = new T.InstancedMesh(printGeo, new T.MeshLambertMaterial({ map: printTex, transparent: true, depthWrite: false, opacity: 0.8 }), 1600);
        prints.count = 0;
        prints.renderOrder = 2;
        scene.add(prints);

        // Hermes: coat, hat, satchel and lantern
        const hermes = new T.Group();
        const coat = new T.MeshLambertMaterial({ color: 0x5b3b24 });
        const cloth = new T.MeshLambertMaterial({ color: 0xd8c39a });
        const skin = new T.MeshLambertMaterial({ color: 0xc58c62 });
        const body = new T.Mesh(new T.CylinderGeometry(0.2, 0.3, 0.75, 10), coat); body.position.y = 0.95;
        const head = new T.Mesh(new T.SphereGeometry(0.15, 12, 10), skin); head.position.y = 1.45;
        const brim = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.03, 16), cloth); brim.position.y = 1.55;
        const crown = new T.Mesh(new T.CylinderGeometry(0.15, 0.18, 0.18, 12), cloth); crown.position.y = 1.65;
        const scarf = new T.Mesh(new T.TorusGeometry(0.15, 0.05, 6, 12), new T.MeshLambertMaterial({ color: 0x9a2f22 })); scarf.rotation.x = Math.PI / 2; scarf.position.y = 1.32;
        const bag = new T.Mesh(new T.BoxGeometry(0.12, 0.28, 0.3), new T.MeshLambertMaterial({ color: 0x3b2614 })); bag.position.set(-0.27, 0.85, 0.05);
        const legGeo = new T.CylinderGeometry(0.07, 0.06, 0.6, 8); legGeo.translate(0, -0.3, 0);
        const legL = new T.Mesh(legGeo, coat), legR = new T.Mesh(legGeo, coat);
        legL.position.set(-0.1, 0.6, 0); legR.position.set(0.1, 0.6, 0);
        const armGeo = new T.CylinderGeometry(0.05, 0.05, 0.55, 8); armGeo.translate(0, -0.27, 0);
        const armR = new T.Mesh(armGeo, coat); armR.position.set(0.27, 1.22, 0); armR.rotation.x = -0.9;
        const lamp = new T.Group();
        const lampCage = new T.Mesh(new T.CylinderGeometry(0.07, 0.08, 0.16, 8, 1, true), new T.MeshLambertMaterial({ color: 0x2b1a0c, wireframe: true }));
        const flame = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), new T.MeshBasicMaterial({ color: 0xffd38a }));
        lamp.add(lampCage); lamp.add(flame);
        lamp.position.set(0.3, 0.86, -0.42);
        [body, head, brim, crown, scarf, bag, legL, legR, armR].forEach((m) => { m.castShadow = true; hermes.add(m); });
        hermes.add(lamp);
        scene.add(hermes);

        // Arrows on the sand at a fork
        const arrowShape = new T.Shape();
        arrowShape.moveTo(0, -0.42); arrowShape.lineTo(0.34, 0.02); arrowShape.lineTo(0.14, 0.02); arrowShape.lineTo(0.14, 0.36);
        arrowShape.lineTo(-0.14, 0.36); arrowShape.lineTo(-0.14, 0.02); arrowShape.lineTo(-0.34, 0.02); arrowShape.closePath();
        const arrowGeo = new T.ShapeGeometry(arrowShape);
        arrowGeo.rotateX(-Math.PI / 2);
        arrowGeo.rotateY(Math.PI);                  // the tip points along -Z, the way the arrow's yaw faces
        const arrows = new T.Group();
        scene.add(arrows);

        // Dust of a whisper drifting in from its branch
        const dustN = 60;
        const dustGeo = new T.BufferGeometry();
        dustGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(dustN * 3), 3));
        const dust = new T.Points(dustGeo, new T.PointsMaterial({ color: 0xffe8c0, size: 0.09, transparent: true, opacity: 0, depthWrite: false }));
        dust.frustumCulled = false;
        scene.add(dust);

        // The relic in Silvia's hands, with its own light
        const relicLight = new T.PointLight(0xfff0d0, 0, 6, 2);
        scene.add(relicLight);

        return { T, renderer, scene, camera, sky, sunDisc, hemi, sun, lantern, prints, hermes, legL, legR, flame, arrows, arrowGeo,
                 dust, dustN, relicLight, relic: null, lowPower, stoneAt };
      }

      // ---- Relics: each one carries its rune on a single face ----
      function letterTex(letter) {
        return canvasTex(128, 128, (g, w) => {
          g.clearRect(0, 0, w, w);
          g.font = 'bold 92px Cinzel, Georgia, serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = 'rgba(255,236,190,0.55)'; g.fillText(letter, w / 2 + 3, w / 2 + 6);
          g.fillStyle = 'rgba(30,14,6,0.95)'; g.fillText(letter, w / 2, w / 2 + 3);
        });
      }
      function makeRelic(kind, letter) {
        const T = G.T, g = new T.Group();
        const mat = (color, metal, rough) => new T.MeshStandardMaterial({ color, metalness: metal, roughness: rough, side: T.DoubleSide });
        const bronze = mat(0x6f7a4a, 0.35, 0.55), clay = mat(0x8e4f2c, 0, 0.9), bone = mat(0xd9caa6, 0, 0.75);
        const iron = mat(0x7a3d1e, 0.3, 0.85), shellM = mat(0xe9c9a8, 0, 0.6);
        const V = (a) => a.map((p) => new T.Vector2(p[0], p[1]));
        let face = 0.32, size = 0.3;
        if (kind === 'bell') {
          g.add(new T.Mesh(new T.LatheGeometry(V([[0, 0.42], [0.12, 0.4], [0.18, 0.3], [0.21, 0.08], [0.3, -0.12], [0.36, -0.2], [0.34, -0.22], [0, -0.18]]), 24), bronze));
          const loop = new T.Mesh(new T.TorusGeometry(0.07, 0.025, 8, 16), bronze); loop.position.y = 0.47; g.add(loop);
          face = 0.245; size = 0.22;
        } else if (kind === 'lamp') {
          const b = new T.Mesh(new T.SphereGeometry(0.3, 20, 14), clay); b.scale.set(1, 0.5, 1); g.add(b);
          const spout = new T.Mesh(new T.CylinderGeometry(0.05, 0.08, 0.3, 10), clay); spout.rotation.z = Math.PI / 2; spout.position.set(0.36, 0.02, 0); g.add(spout);
          const handle = new T.Mesh(new T.TorusGeometry(0.08, 0.025, 8, 14), clay); handle.position.set(-0.33, 0.06, 0); g.add(handle);
          face = 0.29; size = 0.24;
        } else if (kind === 'comb') {
          const spine = new T.Mesh(new T.BoxGeometry(0.8, 0.2, 0.06), bone); spine.position.y = 0.12; g.add(spine);
          for (let i = 0; i < 14; i++) if (i % 3 !== 1 || i < 5) {
            const t = new T.Mesh(new T.BoxGeometry(0.03, 0.3, 0.035), bone); t.position.set(-0.36 + i * 0.055, -0.13, 0); g.add(t);
          }
          face = 0.035; size = 0.18;
        } else if (kind === 'horn') {
          const pts = [];
          for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 1.5; const rr = 0.32 - i * 0.006; pts.push(new T.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, -i * 0.012)); }
          g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 48, 0.08, 10), bone));
          const plate = new T.Mesh(new T.CylinderGeometry(0.14, 0.14, 0.02, 20), bronze); plate.rotation.x = Math.PI / 2; plate.position.set(0, 0, 0.09); g.add(plate);
          face = 0.102; size = 0.22;
        } else if (kind === 'key') {
          const bow = new T.Mesh(new T.TorusGeometry(0.17, 0.045, 10, 22), iron); bow.position.y = 0.26; g.add(bow);
          const disc = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.04, 20), iron); disc.rotation.x = Math.PI / 2; disc.position.y = 0.26; g.add(disc);
          const shaft = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.6, 10), iron); shaft.position.y = -0.17; g.add(shaft);
          [[0.06, -0.4], [0.06, -0.3]].forEach(([x, y]) => { const bit = new T.Mesh(new T.BoxGeometry(0.12, 0.05, 0.03), iron); bit.position.set(x + 0.03, y, 0); g.add(bit); });
          face = 0.022; size = 0.2;
          g.userData.faceY = 0.26;
        } else {
          const dome = new T.Mesh(new T.SphereGeometry(0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shellM);
          dome.scale.set(1, 0.32, 1); dome.rotation.x = Math.PI / 2; g.add(dome);
          for (let i = 0; i < 9; i++) {
            const a = -1.2 + i * 0.3, rib = new T.Mesh(new T.BoxGeometry(0.025, 0.36, 0.02), shellM);
            rib.position.set(Math.sin(a) * 0.17, Math.cos(a) * 0.17 - 0.04, 0.1); rib.rotation.z = -a; g.add(rib);
          }
          face = 0.125; size = 0.2;
        }
        const plateMesh = new T.Mesh(new T.PlaneGeometry(size, size), new T.MeshBasicMaterial({ map: letterTex(letter), transparent: true, depthWrite: false }));
        plateMesh.position.set(0, g.userData.faceY || 0, face + 0.004);
        g.add(plateMesh);
        g.userData.plate = plateMesh;
        g.traverse((m) => { if (m.isMesh) m.castShadow = false; });
        g.scale.setScalar(0.62);
        return g;
      }

      // ---- Time of day: sun, sky and light follow the clock ----
      function sunAt(min) {
        const t = Math.max(0, Math.min(1, (min - 380) / 800));
        const el2 = Math.max(0.04, Math.sin(Math.PI * t)) * 1.22, az = Math.PI * (0.5 + t);
        return { el: el2, dir: new G.T.Vector3(Math.sin(az) * Math.cos(el2), Math.sin(el2), -Math.cos(az) * Math.cos(el2)) };
      }
      function paintSky() {
        const { el: e, dir } = sunAt(S.min);
        const k = Math.min(1, e / 1.0);
        const horizon = new G.T.Color().setHSL(0.07, 0.75, 0.55 + 0.15 * k), zenith = new G.T.Color().setHSL(0.58, 0.55 - 0.2 * (1 - k), 0.35 + 0.25 * k);
        const pos = G.sky.geometry.attributes.position, col = G.sky.geometry.attributes.color, c = new G.T.Color();
        for (let i = 0; i < pos.count; i++) {
          const y = Math.max(0, pos.getY(i) / 120);
          c.copy(horizon).lerp(zenith, Math.pow(y, 0.6));
          col.setXYZ(i, c.r, c.g, c.b);
        }
        col.needsUpdate = true;
        G.sun.intensity = 0.5 + 1.1 * Math.sin(Math.min(e, 1.2));
        G.sun.color.setHSL(0.09, 0.8, 0.6 + 0.3 * k);
        G.hemi.intensity = 0.6 + 0.3 * k;
        G.scene.fog.color.setHSL(0.05, 0.4, 0.13 + 0.12 * k);
        G.sunDir = dir;
        G.sky.position.copy(G.camera.position);
        G.sunDisc.position.copy(G.camera.position).addScaledVector(dir, 100);
      }

      // ---- Hermes on screen ----
      const view = { x: 0, z: 0, yaw: 0, look: 0, walk: null, phase: 'idle', relicHold: 0, shake: 0 };
      function placeHermes(k, d) {
        const [r, c] = at(k);
        view.x = wx(c); view.z = wz(r); view.yaw = yawOf(d);
      }
      function paintPrints() {
        if (!G) return;
        const T = G.T, m4 = new T.Matrix4(), q = new T.Quaternion(), v = new T.Vector3(), one = new T.Vector3(1, 1, 1);
        let n = 0;
        const shown = S.trail.slice(0, view.walk ? view.walk.shown : S.trail.length);
        for (let i = 1; i < shown.length && n < 1598; i++) {
          const [r0, c0] = at(shown[i - 1]), [r1, c1] = at(shown[i]);
          const yaw = Math.atan2(-(c1 - c0), -(r1 - r0));
          q.setFromAxisAngle(v.set(0, 1, 0), yaw);
          const fx = c1 - c0, fz = r1 - r0, sx = -fz, sz = fx;
          [[-0.45, -0.13], [0.05, 0.13]].forEach(([along, side]) => {
            m4.compose(v.set(wx(c0) + fx * (CELL * (0.5 + along)) + sx * side, 0.015, wz(r0) + fz * (CELL * (0.5 + along)) + sz * side), q, one);
            G.prints.setMatrixAt(n++, m4);
          });
        }
        G.prints.count = n;
        G.prints.instanceMatrix.needsUpdate = true;
      }
      function paintArrows(opts) {
        if (!G) return;
        G.arrows.clear();
        (opts || []).forEach((o) => {
          const mat = new G.T.MeshBasicMaterial({ color: o.blocked ? 0x6b625a : 0xffc65a, transparent: true, opacity: o.blocked ? 0.35 : 0.9, depthWrite: false });
          const a = new G.T.Mesh(G.arrowGeo, mat);
          const [dr, dc] = DIRS[o.d];
          a.position.set(view.x + dc * CELL * 1.05, 0.03, view.z + dr * CELL * 1.05);
          a.scale.setScalar(1.35);
          a.rotation.y = yawOf(o.d);
          a.userData = o;
          G.arrows.add(a);
        });
      }

      // =====================================================================
      // Sound: whispers in 3D (HRTF), footsteps
      // =====================================================================
      let audio = null;
      function ensureAudio() {
        if (!soundOn()) return null;
        try {
          if (!audio) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            const ctx = new Ctx();
            const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
            const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            audio = { ctx, master, noise: buf };
          }
          if (audio.ctx.state !== 'running') Promise.resolve(audio.ctx.resume()).catch(() => {});
          return audio;
        } catch (e) { return null; }
      }
      function setListener() {
        if (!audio || !G) return;
        const L = audio.ctx.listener, p = G.camera.position, f = new G.T.Vector3(0, 0, -1).applyQuaternion(G.camera.quaternion);
        if (L.positionX) {
          L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z;
          L.forwardX.value = f.x; L.forwardY.value = f.y; L.forwardZ.value = f.z; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0;
        } else if (L.setPosition) { L.setPosition(p.x, p.y, p.z); L.setOrientation(f.x, f.y, f.z, 0, 1, 0); }
      }
      function whisperSound(x, y, z) {
        const a = ensureAudio();
        if (!a) return;
        setListener();
        const { ctx } = a, t = ctx.currentTime;
        const src = ctx.createBufferSource(); src.buffer = a.noise; src.loop = true;
        const band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.Q.value = 1.6; band.frequency.value = 2400;
        const form = ctx.createBiquadFilter(); form.type = 'peaking'; form.gain.value = 9; form.Q.value = 3;
        const env = ctx.createGain(); env.gain.value = 0;
        const pan = ctx.createPanner();
        pan.panningModel = 'HRTF'; pan.distanceModel = 'inverse'; pan.refDistance = 2.5; pan.rolloffFactor = 0.6;
        if (pan.positionX) { pan.positionX.value = x; pan.positionY.value = y; pan.positionZ.value = z; } else pan.setPosition(x, y, z);
        src.connect(band); band.connect(form); form.connect(env); env.connect(pan); pan.connect(a.master);
        let s = t + 0.05;
        for (let i = 0; i < 9; i++) {
          const len = 0.12 + Math.random() * 0.16;
          env.gain.setValueAtTime(0.0001, s);
          env.gain.linearRampToValueAtTime(0.9, s + len * 0.35);
          env.gain.linearRampToValueAtTime(0.0001, s + len);
          form.frequency.setValueAtTime(700 + Math.random() * 1800, s);
          band.frequency.setValueAtTime(1800 + Math.random() * 1600, s);
          s += len + (i % 3 === 2 ? 0.28 : 0.04);
        }
        src.start(t); src.stop(s + 0.2);
      }
      function stepSound() {
        if (!audio || !soundOn()) return;
        const { ctx } = audio, t = ctx.currentTime;
        const src = ctx.createBufferSource(); src.buffer = audio.noise;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
        const g = ctx.createGain(); g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        src.connect(lp); lp.connect(g); g.connect(audio.master);
        src.start(t, Math.random()); src.stop(t + 0.14);
      }

      // =====================================================================
      // The panel: Hermes's voice, where he stands, the controls
      // =====================================================================
      function say(text) { if (el.voice) el.voice.textContent = text; }
      function subtitle(text, secs) {
        if (!el.subtitle) return;
        el.subtitle.textContent = text;
        el.subtitle.classList.add('is-on');
        clearTimeout(subtitle.t);
        subtitle.t = setTimeout(() => el.subtitle.classList.remove('is-on'), (secs || 5) * 1000);
      }
      const clock = (min) => {
        const m = Math.round(min) % (24 * 60);
        return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      };
      function paintHud() {
        if (el.runes) {
          el.runes.innerHTML = CAIRNS.map((c, i) => `<span class="chasm3d-rune${i < S.runes ? ' is-found' : ''}">${i < S.runes ? c.letter : ''}</span>`).join('');
          el.runes.setAttribute('aria-label', S.runes ? `Runes found: ${CAIRNS.slice(0, S.runes).map((c) => c.letter).join(' ')}` : 'No runes found yet');
        }
        if (el.skins) {
          el.skins.innerHTML = [0, 1, 2].map((i) => `<span class="chasm3d-skin" style="--fill:${Math.max(0, Math.min(1, S.water - i))}"></span>`).join('');
          el.skins.setAttribute('aria-label', `Water: ${Math.max(0, Math.round(S.water * 10) / 10)} of 3 skins`);
        }
        if (el.clock) el.clock.textContent = '☀ ' + clock(S.min);
        paintFacing();
      }
      function paintFacing() {
        const yaw = view.yaw + view.look;
        if (el.rose) el.rose.style.transform = `rotate(${(yaw * 180 / Math.PI).toFixed(1)}deg)`;
        if (el.facing) {
          const d = ((Math.round(-yaw / (Math.PI / 2)) % 4) + 4) % 4;
          el.facing.textContent = 'Facing ' + DIRS[d][2];
        }
      }
      function where(text) { if (el.where) el.where.textContent = text; }
      function headingLabel() { return DIRS[S.h][2]; }

      function btn(label, onClick, opts) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chasm3d-btn' + (opts && opts.cls ? ' ' + opts.cls : '');
        b.innerHTML = label;
        if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
        if (opts && opts.disabled) b.disabled = true;
        if (opts && opts.dir !== undefined) b.dataset.dir = DIRS[opts.dir][2];
        b.addEventListener('click', onClick);
        el.controls.appendChild(b);
        return b;
      }
      function clearControls() { if (el.controls) el.controls.innerHTML = ''; }

      // ---- At a stop where he can choose ----
      function showChoice(line) {
        view.phase = 'choose';
        const opts = options();
        paintArrows(opts);
        clearControls();
        const free = opts.filter((o) => !o.blocked);
        if (!free.length) { setback('stuck'); return; }
        const rel = (d) => (d - S.h + 4) % 4;
        const parts = opts.slice().sort((a, b) => [0, 3, 1, 2].indexOf(rel(a.d)) - [0, 3, 1, 2].indexOf(rel(b.d)));
        parts.forEach((o) => {
          const [arrow, word] = REL_BTN[rel(o.d)];
          btn(`<span class="chasm3d-arrow">${arrow}</span> ${word} <small>${DIRS[o.d][2]}</small>`,
              () => go(o.d), { dir: o.d, disabled: o.blocked, cls: o.blocked ? 'is-tracks' : 'is-way',
                               aria: o.blocked ? `${word}, ${DIRS[o.d][2]}: your own footprints, closed` : `${word}, go ${DIRS[o.d][2]}` });
        });
        btn('👂 Listen', listen, { cls: 'is-listen', disabled: S.wh <= 0,
            aria: S.wh > 0 ? 'Listen for the whisper (one per stretch between cairns)' : 'Listen: no whisper left until the next cairn' });
        const ways = parts.map((o) => `${REL[rel(o.d)]} (${DIRS[o.d][2]})${o.blocked ? ', covered by your own footprints' : ''}`);
        where(`Facing ${headingLabel()}. ${ways.length > 1 ? 'Ways: ' : 'The way: '}${ways.join('; ')}.`);
        if (line) say(line);
        paintHud();
        save();
      }
      function go(d) {
        if (view.phase !== 'choose') return;
        const o = options().find((x) => x.d === d);
        if (!o || o.blocked) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        ensureAudio();
        const p = plan(d);
        paintArrows([]);
        clearControls();
        where('Walking ' + DIRS[d][2] + '…');
        view.phase = 'walk';
        const startLen = S.trail.length;
        p.cells.forEach((c) => S.trail.push(c.k));
        view.walk = { cells: p.cells, from: S.pos.slice(), i: 0, t: 0, shown: startLen, stop: p.stop };
        if (!G) finishWalk();
      }
      // Bring the walk to its end (the animation calls it on the last cell; tests and the text-only view call it at once)
      function finishWalk() {
        const w = view.walk;
        if (!w) return;
        view.walk = null;
        const last = w.cells[w.cells.length - 1];
        S.pos = at(last.k);
        S.h = last.d;
        S.walked += w.cells.length;
        S.min += w.cells.length * MIN_PER_CELL;
        S.water = Math.max(0.25, S.water - w.cells.length / CELLS_PER_SKIN);
        placeHermes(last.k, last.d);
        paintPrints();
        arrive(w.stop);
      }
      function arrive(stop) {
        const k = key(S.pos[0], S.pos[1]);
        if (stop === 'fork') { showChoice(FORK_LINES[S.forks++ % FORK_LINES.length]); return; }
        if (stop === 'rune') { startRelic(cairnAt[k]); return; }
        if (stop === 'out') { victory(); return; }
        setback(stop);
      }

      // ---- Listening for the whisper ----
      function listen() {
        if (view.phase !== 'choose' || S.wh <= 0) return;
        S.wh--;
        const d = whisperDir();
        const words = WHISPERS[(S.runes + S.forks) % WHISPERS.length];
        if (d < 0) {
          subtitle('A whisper comes from behind you, from the way you came: “…back… go back…”', 6);
          say("I heard it, Silvia: the whisper came from behind me. I think the gorge is telling us this stretch went wrong.");
        } else {
          const rel = (d - S.h + 4) % 4;
          subtitle(`A whisper comes from ${FROM[rel]} (${DIRS[d][2]}): “${words}”`, 6);
          say(`Did you hear that? It came from ${FROM[rel]}, from the ${DIRS[d][2]}. The walkers say the voices in this gorge belong to the pilgrims it kept, and that they still point the way to the next cairn. I have heard my one whisper for this stretch.`);
          if (G) {
            const [dr, dc] = DIRS[d];
            const sx = view.x + dc * CELL * 3, sz = view.z + dr * CELL * 3;
            whisperSound(sx, 1.4, sz);
            view.dust = { t: 0, sx, sz };
          }
        }
        showChoice();
      }

      // ---- A wrong turn: back to the last cairn ----
      function setback(stop) {
        view.phase = 'setback';
        paintArrows([]);
        clearControls();
        hints.fail();
        const k = key(S.pos[0], S.pos[1]);
        let text;
        if (stop === 'decoy') text = `There is a cairn here, Silvia, with a letter ${decoyAt[k].letter} painted on its top stone. But look around: the gorge ends right behind it. A true cairn never stands at a dead end. This one was built to fool travellers, exactly as the walkers warned us.`;
        else if (stop === 'early') text = "Another cairn, but something is wrong. Look at your sheet: this is not the next one. We must have skipped a cairn on the way, and the third law says they must be found in order. I will not touch this one.";
        else if (stop === 'exit-early') text = `I can see the way out! Light, and open sand… But we have only ${S.runes} of the six runes, and the third law is clear: all six before we leave the canyon.`;
        else if (stop === 'tracks') text = "Wait. These are my own footprints, crossing the gorge in front of me. The first law says never walk the same ground twice. This way is closed to us.";
        else if (stop === 'stuck') text = "Every way out of this place crosses my own footprints. The first law closes all of them.";
        else text = PLACES[k] ? PLACES[k].text : "The gorge ends here, in a wall of red rock. Not even a lizard lives here. The fourth law warns us about blind gorges like this one.";
        S.water = Math.max(0, S.water - 1);
        const restNeeded = S.water <= 0.001;
        const cost = restNeeded ? "And that was my last drop of water." : `It cost us a skin of water: ${skinsWord(S.water)} left.`;
        say(`${text} ${cost}`);
        where(`Facing ${headingLabel()}. A wrong turn: Hermes goes back to the last cairn.`);
        // The state moves back now (and is saved), the picture moves when she presses the button
        const lost = S.trail.length - 1 - S.ss;
        S.trail = S.trail.slice(0, S.ss + 1);
        S.pos = S.cp.slice();
        S.h = S.ch;
        S.min += lost * MIN_PER_CELL * 0.6;
        if (restNeeded) S.rest = Date.now() + REST_S * 1000;
        save();
        paintHud();
        btn(restNeeded ? 'Rest in the shade' : '↺ Back to the last cairn', () => goBack(), { cls: 'is-back' });
        const first = el.controls.querySelector('button');
        if (first) setTimeout(() => first.focus(), 30);
      }
      function skinsWord(w) {
        const n = Math.round(w * 10) / 10;
        if (n >= 2.95) return 'three skins';
        if (n >= 1.95) return n >= 2.05 ? 'two skins and a little more' : 'two skins';
        if (n >= 0.95) return n >= 1.05 ? 'one skin and a little more' : 'one skin';
        return 'only a few mouthfuls';
      }
      function goBack(instant) {
        if (view.phase !== 'setback') return;
        view.phase = 'fading';
        clearControls();
        if (el.fade) el.fade.classList.add('is-on');
        const done = () => {
          placeHermes(S.trail[S.trail.length - 1], S.h);
          paintPrints();
          if (el.fade) el.fade.classList.remove('is-on');
          subtitle('The wind fills in the footprints of the wrong turn.', 4);
          if (S.rest) rest();
          else showChoice(S.runes ? `Back at the cairn of the ${CAIRNS[S.runes - 1].relic}. Let us try again.` : 'Back at the North Portal. Let us try again.');
        };
        if (G && !reducedMotion() && instant !== true) setTimeout(done, 700); else done();
      }

      // ---- Out of water: he rests in the shade until the sun has moved ----
      function rest() {
        view.phase = 'rest';
        paintArrows([]);
        clearControls();
        say("My last skin is empty, Silvia. I cannot walk on in this heat without water. I will sit in the shade by the wall and wait for the sun to move. Give me a little while.");
        const b = btn('', () => {}, { cls: 'is-rest', disabled: true });
        const tick = () => {
          if (view.phase !== 'rest') return;
          const left = Math.max(0, Math.ceil((S.rest - Date.now()) / 1000));
          b.textContent = `Hermes is resting · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
          where(`Resting in the shade. The sun is moving across the sky.`);
          if (left <= 0) { endRest(); return; }
          rest.t = setTimeout(tick, 500);
        };
        tick();
      }
      function endRest() {
        clearTimeout(rest.t);
        S.rest = 0;
        S.water = 1;
        S.min += 90;
        save();
        paintHud();
        showChoice("The shade has crossed to the far wall. And look: a thin line of water is seeping out of a crack in the rock. I filled one skin, slowly, drop by drop. Let us try again.");
      }

      // ---- A relic in her hands ----
      function startRelic(i) {
        view.phase = 'relic';
        paintArrows([]);
        clearControls();
        const ca = CAIRNS[i];
        say(ca.arrive);
        where(`At the ${ordinal(i)} cairn. Turn the ${ca.relic} until its carved letter faces you: drag it, or use the arrow buttons or the arrow keys.`);
        if (G) {
          G.relic = makeRelic(ca.relic, ca.letter);
          // The rune starts turned away from her: half a turn past the way Hermes faces, and tipped over
          G.relic.quaternion.setFromEuler(new G.T.Euler(0.9, yawOf(S.h) + Math.PI * 0.85, 0.3, 'YXZ'));
          G.scene.add(G.relic);
          view.relicHold = 0;
        }
        const turn = (ax, ang) => () => rotateRelic(ax, ang);
        btn('⟲', turn('y', -0.35), { aria: 'Turn the relic left', cls: 'is-turn' });
        btn('⟳', turn('y', 0.35), { aria: 'Turn the relic right', cls: 'is-turn' });
        btn('⤒', turn('x', -0.35), { aria: 'Tip the relic away from you', cls: 'is-turn' });
        btn('⤓', turn('x', 0.35), { aria: 'Tip the relic towards you', cls: 'is-turn' });
        if (!G) btn('Look at every side', () => relicFound(), { cls: 'is-way' });
        paintHud();
        save();
      }
      const ordinal = (i) => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][i];
      function rotateRelic(ax, ang) {
        if (view.phase !== 'relic' || !G || !G.relic) return;
        const axis = ax === 'y' ? new G.T.Vector3(0, 1, 0) : new G.T.Vector3(1, 0, 0).applyQuaternion(G.camera.quaternion);
        G.relic.quaternion.premultiply(new G.T.Quaternion().setFromAxisAngle(axis, ang));
      }
      function relicFacing() {
        if (!G || !G.relic) return 0;
        const plate = G.relic.userData.plate;
        const n = new G.T.Vector3(0, 0, 1).applyQuaternion(plate.getWorldQuaternion(new G.T.Quaternion()));
        const p = plate.getWorldPosition(new G.T.Vector3());
        return n.dot(G.camera.position.clone().sub(p).normalize());
      }
      function relicFound() {
        if (view.phase !== 'relic') return;
        const i = S.runes, ca = CAIRNS[i];
        view.phase = 'found';
        if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        S.runes = i + 1;
        S.water = 3;
        S.wh = 1;
        S.ss = S.trail.length - 1;
        S.cp = S.pos.slice();
        S.ch = S.h;
        paintHud();
        subtitle(`The ${ordinal(i)} rune: ${ca.letter}`, 4);
        say(ca.found);
        clearControls();
        btn('Walk on', () => {
          if (G && G.relic) { G.scene.remove(G.relic); G.relic = null; }
          showChoice();
        }, { cls: 'is-way' });
        save();
        const first = el.controls.querySelector('button');
        if (first) setTimeout(() => first.focus(), 30);
      }

      // ---- Out of the gorge ----
      function victory() {
        view.phase = 'done';
        paintArrows([]);
        clearControls();
        say("We are out, Silvia! The cliffs fall away on both sides and the light is so bright that I have to close my eyes. Ahead lies a white plain of salt, flat as a table, all the way to the horizon: the Salt Playa. Far away I can see the ruins of an old nomad camp. But the walkers' track does not cross the salt in a straight line, and I can already see why: there are dark holes of brine under the crust. Open Sheet 10A of your journal.");
        where('Out of the canyon, at the edge of the Salt Playa.');
        if (el.victory) el.victory.style.display = 'block';
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        const first = !isDone();
        put('order_whispering_chasm_completed', 'true');
        put('order_desert_station_active', '11');
        save();
        hints.refresh();
        if (first && typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (first && typeof window.selectMapNode === 'function') window.selectMapNode(11, false);
        paintHud();
      }

      // =====================================================================
      // The loop
      // =====================================================================
      let raf = 0, last = 0;
      const camPos = { x: 0, y: 0, z: 0, ok: false };
      function frame(now) {
        raf = requestAnimationFrame(frame);
        if (!G || modal.style.display === 'none' || document.hidden) return;
        tick(now, Math.min(0.1, (now - (last || now)) / 1000));
        last = now;
      }
      function tick(now, dt) {
        const T = G.T, rm = reducedMotion();
        let moving = false;

        const w = view.walk;
        if (w) {
          moving = true;
          w.t += dt * (rm ? 5 : 2.6);
          while (w.t >= 1 && w.i < w.cells.length) {
            w.t -= 1; w.i++; w.shown++;
            paintPrints();
            stepSound();
            if (w.i >= w.cells.length) break;
          }
          if (w.i >= w.cells.length) { finishWalk(); }
          else {
            const from = w.i === 0 ? key(w.from[0], w.from[1]) : w.cells[w.i - 1].k;
            const [r0, c0] = at(from), [r1, c1] = at(w.cells[w.i].k);
            view.x = wx(c0 + (c1 - c0) * w.t); view.z = wz(r0 + (r1 - r0) * w.t);
            const target = yawOf(w.cells[w.i].d);
            let dy = target - view.yaw;
            while (dy > Math.PI) dy -= Math.PI * 2;
            while (dy < -Math.PI) dy += Math.PI * 2;
            view.yaw += dy * Math.min(1, dt * 7);
          }
        }
        if (!dragging) view.look *= Math.pow(0.15, dt);

        // Hermes
        const H = G.hermes;
        H.position.set(view.x, 0, view.z);
        H.rotation.y = view.yaw;
        const swing = moving && !rm ? Math.sin(now / 130) * 0.55 : 0;
        G.legL.rotation.x = swing; G.legR.rotation.x = -swing;
        H.position.y = moving && !rm ? Math.abs(Math.sin(now / 130)) * 0.04 : 0;
        const flick = 1.25 + Math.sin(now / 90) * 0.08 + Math.sin(now / 37) * 0.05;
        G.lantern.intensity = flick;
        G.lantern.position.copy(G.flame.getWorldPosition(new T.Vector3()));

        // Camera: behind and above him; closer and lower in front of a relic
        const yaw = view.yaw + view.look;
        const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
        const relic = view.phase === 'relic' || view.phase === 'found';
        const stone = relic ? G.stoneAt[key(S.pos[0], S.pos[1])] : null;
        H.visible = !stone;
        // At a fork the camera rises, so the mouths of the side passages and the arrows on the sand are in view
        const fork = view.phase === 'choose' || view.phase === 'setback';
        let tx = view.x - fx * (fork ? 1.3 : 3.4), ty = fork ? 7.2 : 2.35, tz = view.z - fz * (fork ? 1.3 : 3.4);
        let lx = view.x + fx * (fork ? 0.5 : 2.6), ly = fork ? 0 : 1.15, lz = view.z + fz * (fork ? 0.5 : 2.6);
        if (stone) {
          tx = view.x - fx * 1.5; ty = 1.6; tz = view.z - fz * 1.5;
          lx = stone.x; ly = 0.95; lz = stone.z;
        }
        const k = camPos.ok && !rm ? Math.min(1, dt * 4) : 1;
        camPos.x += (tx - camPos.x) * k; camPos.y += (ty - camPos.y) * k; camPos.z += (tz - camPos.z) * k; camPos.ok = true;
        G.camera.position.set(camPos.x, camPos.y, camPos.z);
        G.camera.lookAt(lx, ly, lz);

        // The relic floats in front of the camera; the letter must face it for a moment
        if (G.relic) {
          const f = new T.Vector3(0, 0, -1).applyQuaternion(G.camera.quaternion);
          G.relic.position.copy(G.camera.position).addScaledVector(f, 1.3);
          G.relic.position.y += 0.08;
          G.relicLight.position.copy(G.camera.position).add(new T.Vector3(0.5, 0.6, 0.2));
          G.relicLight.intensity = 1.1;
          if (view.phase === 'relic' && !dragging) {
            if (relicFacing() > 0.9) { view.relicHold += dt; if (view.relicHold > 0.5) relicFound(); }
            else view.relicHold = 0;
          }
          if (view.phase === 'found') G.relic.rotation.y += dt * 0.25;
        } else G.relicLight.intensity = 0;

        // Arrows breathe; whisper dust drifts in
        G.arrows.children.forEach((a) => { if (!a.userData.blocked) a.material.opacity = 0.6 + Math.sin(now / 300) * 0.3; });
        if (view.dust) {
          const dd = view.dust, pos = G.dust.geometry.attributes.position;
          dd.t += dt;
          for (let i = 0; i < G.dustN; i++) {
            const ph = ((dd.t * 0.6 + i / G.dustN) % 1);
            pos.setXYZ(i, dd.sx + (view.x - dd.sx) * ph + Math.sin(i * 7 + now / 400) * 0.3, 0.6 + (i % 7) * 0.15, dd.sz + (view.z - dd.sz) * ph + Math.cos(i * 5 + now / 500) * 0.3);
          }
          pos.needsUpdate = true;
          G.dust.material.opacity = Math.max(0, Math.min(0.8, dd.t * 2, (3.5 - dd.t)));
          if (dd.t > 3.5) { view.dust = null; G.dust.material.opacity = 0; }
        }

        // Sun and shadows follow Hermes
        paintSky();
        G.sun.position.set(view.x, 0, view.z).addScaledVector(G.sunDir, 40);
        G.sun.target.position.set(view.x, 0, view.z);
        paintFacing();
        if (audio && G) setListener();
        G.renderer.render(G.scene, G.camera);
      }
      function fit() {
        if (!G || !el.stage) return;
        const w = el.stage.clientWidth, h = el.stage.clientHeight;
        if (!w || !h) return;
        G.renderer.setSize(w, h, false);
        G.camera.aspect = w / h;
        G.camera.updateProjectionMatrix();
      }

      // ---- Pointer: drag to look around (or to turn a relic), tap an arrow to walk ----
      let dragging = false, downAt = null;
      const ray = () => (G ? new G.T.Raycaster() : null);
      function onDown(e) {
        if (!G) return;
        downAt = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false };
        dragging = true;
        try { el.canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
      function onMove(e) {
        if (!dragging || !downAt) return;
        const dx = e.clientX - downAt.lx, dy = e.clientY - downAt.ly;
        downAt.lx = e.clientX; downAt.ly = e.clientY;
        if (Math.abs(e.clientX - downAt.x) + Math.abs(e.clientY - downAt.y) > 6) downAt.moved = true;
        if (view.phase === 'relic') { rotateRelic('y', dx * 0.012); rotateRelic('x', dy * 0.012); }
        else view.look = Math.max(-1.8, Math.min(1.8, view.look - dx * 0.006));
      }
      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        if (downAt && !downAt.moved && view.phase === 'choose' && G.arrows.children.length) {
          const rect = el.canvas.getBoundingClientRect();
          const p = new G.T.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
          const rc = ray();
          rc.setFromCamera(p, G.camera);
          const hit = rc.intersectObjects(G.arrows.children)[0];
          if (hit && !hit.object.userData.blocked) go(hit.object.userData.d);
        }
        downAt = null;
      }
      if (el.canvas) {
        el.canvas.addEventListener('pointerdown', onDown);
        el.canvas.addEventListener('pointermove', onMove);
        el.canvas.addEventListener('pointerup', onUp);
        el.canvas.addEventListener('pointercancel', () => { dragging = false; downAt = null; });
      }

      // ---- Keyboard: arrows steer relative to Hermes (or turn the relic), L listens ----
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'none') return;
        if (e.key === 'Escape') { closeChasm(); return; }
        const tag = (e.target && e.target.tagName) || '';
        if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
        const rel = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
        if (view.phase === 'relic' && rel !== undefined) {
          e.preventDefault();
          rotateRelic(rel % 2 ? 'y' : 'x', [-0.35, 0.35, 0.35, -0.35][rel]);
          return;
        }
        if (view.phase === 'choose') {
          if (rel !== undefined) { e.preventDefault(); go((S.h + rel) % 4); }
          else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); listen(); }
        }
      });

      // =====================================================================
      // Opening and closing
      // =====================================================================
      function canOpen() {
        if (isDone()) return true;
        if ((typeof window.isAdminTester === 'function' && window.isAdminTester()) || (typeof isCarlesTester === 'function' && isCarlesTester())) return true;
        const unlocked = get('order_cairn1_completed') === 'true' || get('order_cairn1_bypassed') === 'true' || parseInt(get('order_dawn_step') || '0', 10) >= 3;
        const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : () => {};
        if (!unlocked) {
          toast('✦ BASECAMP · WATCHTOWER VI ✦ Hermes is still at the watchtower. Open the Field Wire and read his dawn message.');
          if (typeof activateHubView === 'function') activateHubView('view-field-wire');
          return false;
        }
        if (typeof window.isChasmMarchOver === 'function' && !window.isChasmMarchOver()) {
          toast('✦ ON THE ROAD ✦ Hermes is still walking across the scree to the North Portal. The Field Wire shows how long he has left.');
          return false;
        }
        return true;
      }
      let returnFocusTo = null;
      function openChasm() {
        if (!canOpen()) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        returnFocusTo = document.activeElement;
        const building = !G && window.THREE && el.canvas;
        if (building) {
          G = buildWorld();
          if (G && 'ResizeObserver' in window) new ResizeObserver(fit).observe(el.stage);
          else window.addEventListener('resize', fit);
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        fit();
        const firstTime = !get(WALK_KEY);
        S = load();
        if (el.victory) el.victory.style.display = 'none';
        if (G && G.relic) { G.scene.remove(G.relic); G.relic = null; }
        view.walk = null; view.look = 0; view.dust = null; camPos.ok = false;
        placeHermes(S.trail[S.trail.length - 1], S.h);
        paintPrints();
        paintHud();
        const k = key(S.pos[0], S.pos[1]);
        if (isDone() && S.runes === 6 && S.pos[0] === EXIT[0] && S.pos[1] === EXIT[1]) {
          victory();
          say("We camp tonight at the mouth of the canyon, Silvia, with the white salt in front of us. When the wind blows down the gorge behind me, I still think I can hear the whispers. Sheet 10A is waiting for you.");
        } else if (S.rest) rest();
        else if (k in cairnAt && cairnAt[k] === S.runes) startRelic(S.runes);
        else if (firstTime && !isDone()) showChoice("Silvia, I am standing at the North Portal. The canyon is only a crack in the red rock, so deep that the morning sun has not reached the bottom yet. The wind inside sounds like people talking quietly in the next room. Here is how we will do it: I walk, and you steer. Every time the gorge splits, I will stop and wait for your choice. Keep Sheet 9B in front of you, with the top of the page pointing north, and follow me with your pencil.");
        else showChoice(S.trail.length === 1 ? "I am back at the North Portal, Silvia, ready to go in again. Keep Sheet 9B in front of you, with the top of the page pointing north." : "I am still here, Silvia, exactly where you left me. Find my place on Sheet 9B and tell me which way to go.");
        // The first picture is drawn now (shaders, textures, shadows), so that slow first frame comes before the window fades in
        if (building && G) tick(performance.now(), 1 / 60);
        if (!raf) raf = requestAnimationFrame(frame);
        // The first live control; at the way out (or while he rests) the victory card or the close button.
        // Focused at once: the first 3D frame can hold the page long enough for a timer to come too late.
        const first = [...el.controls.querySelectorAll('button:not([disabled])'), ...(el.victory ? el.victory.querySelectorAll('button') : []), el.close]
          .find((x) => x && x.offsetParent);
        if (first) first.focus({ preventScroll: true });
      }
      function closeChasm() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (view.walk) finishWalk();
        clearTimeout(rest.t);
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      function walkAgain() {
        S = fresh();
        save();
        if (el.victory) el.victory.style.display = 'none';
        placeHermes(S.trail[0], S.h);
        paintPrints();
        paintHud();
        showChoice("Back at the North Portal, for one more walk through the gorge. The water jars are full again; the walkers never forget to fill them.");
      }

      window.openWhisperingChasmModal = openChasm;
      window.closeWhisperingChasmModal = closeChasm;
      if (el.close) el.close.addEventListener('click', closeChasm);
      if (el.again) el.again.addEventListener('click', walkAgain);
      if (el.finish) el.finish.addEventListener('click', () => {
        closeChasm();
        if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
      });
      modal.addEventListener('click', (e) => { if (e.target === modal) closeChasm(); });

      // Test hook (scripts/audit/web_smoke.py)
      window.__chasm = {
        state: () => Object.assign({ phase: view.phase, gl: !!G, options: S ? options() : [], drawn: G ? G.renderer.info.render.calls : 0 }, S),
        choose: (name) => { const d = DIRS.findIndex((x) => x[2] === name); go(d); finishWalk(); return view.phase; },
        guide: () => { const d = whisperDir(); return d < 0 ? null : DIRS[d][2]; },
        back: () => goBack(true),
        endRest: () => { if (view.phase === 'rest') endRest(); },
        facing: () => relicFacing(),
        turn: (ax, ang) => rotateRelic(ax, ang),
        solveRelic: () => relicFound(),
        frames: (n) => { for (let i = 0; i < (n || 1); i++) tick(performance.now() + i * 33, 1 / 30); },
        walkOn: () => { const b = el.controls.querySelector('.chasm3d-btn.is-way'); if (b) b.click(); }
      };
    })();
