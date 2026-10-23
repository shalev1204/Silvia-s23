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
      const HOWTO_KEY = 'order_chasm_howto';   // 'seen' once she has read (or skipped) How to play

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
          "Keep your pencil on the canyon in your journal and move it every time I move, so you always know where I am. The top of the page is north, like the N on the compass in the corner of your screen.",
          "The walkers' laws, in plain words: never walk the same ground twice; the quick road to the Oasis skips the cairns, so do not take it; the six cairns must come in order; and a gorge that ends in a wall, a drop or a false cairn is a trap.",
          "Let us take the first turn together. Just inside the North Portal the gorge splits: one way drops south straight away. That is the quick road the second law warns about. Keep going east, along the top of the sheet, and the first cairn your pencil meets is M."
        ]
      });

      // ---- State (saved at every stop, so she can close the Hub and come back to the same place) ----
      let S = null;
      function fresh() {
        return { pos: START.slice(), h: 1, trail: [key(START[0], START[1])], ss: 0, runes: 0, water: 3, min: START_MIN, wh: 1,
                 cp: START.slice(), ch: 1, walked: 0, forks: 0, fails: 0, heard: 0 };
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
      // The sheet draws corridors and walls the same width. Here the walls (even rows and columns of the sheet) are thin
      // fins of rock and the corridors (odd ones) are wide, so the canyon has room to breathe. The centres of the cells
      // stay evenly spaced, so walking, footprints and the map logic are the same as on paper.
      const CELL = 2.2, WIDE = 3.3, THIN = 1.1;
      const span = (i) => ((((i % 2) + 2) % 2) ? WIDE : THIN);
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
        t.encoding = THREE.sRGBEncoding;
        if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
        return t;
      }
      // Soft painted washes over a base colour: the skin of bronze, clay, bone… (broad brush, no grain)
      function speckle(g, w, h, seed, base, spots, count) {
        g.fillStyle = base; g.fillRect(0, 0, w, h);
        const r2 = rng(seed);
        for (let i = 0; i < count / 4; i++) {
          const [col, size] = spots[Math.floor(r2() * spots.length)];
          const x = r2() * w, y = r2() * h, rad = size * (2 + r2() * 3);
          const gr = g.createRadialGradient(x, y, 0, x, y, rad);
          gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
      }

      // ---- The painted look: shade falls in a few soft steps, and a rim of light outlines what matters ----
      let toonRamp = null;
      function toon(opts) {
        if (!toonRamp) {
          const steps = [80, 80, 80, 165, 165, 235, 255, 255], px = new Uint8Array(steps.length * 4);
          steps.forEach((v, i) => px.set([v, v, v, 255], i * 4));
          toonRamp = new THREE.DataTexture(px, steps.length, 1);
          toonRamp.magFilter = toonRamp.minFilter = THREE.LinearFilter;
          toonRamp.needsUpdate = true;
        }
        return new THREE.MeshToonMaterial(Object.assign({ gradientMap: toonRamp }, opts));
      }
      // A warm glow on the edges that turn away from the eye (one shader for all, the colour is per material)
      function rimShader(sh) {
        sh.uniforms.uRim = this.userData.rim;
        sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\n  totalEmissiveRadiance += uRim * pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.6);');
      }
      function rim(mat, color, strength) {
        mat.userData.rim = { value: new THREE.Color(color).multiplyScalar(strength) };
        mat.onBeforeCompile = rimShader;
        return mat;
      }
      // Surfaces coloured by where they stand in the world, painted per pixel so they never blur or pixelate
      const WORLD_VERT = ['varying vec3 vWp;\n', '#include <project_vertex>\n#ifdef USE_INSTANCING\n  vWp = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\n  vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif'];
      function worldPainted(mat, uniforms, decl, body) {
        mat.userData.paint = uniforms;
        mat.extensions = { derivatives: true };
        mat.onBeforeCompile = function (sh) {
          Object.assign(sh.uniforms, this.userData.paint);
          sh.vertexShader = WORLD_VERT[0] + sh.vertexShader.replace('#include <project_vertex>', WORLD_VERT[1]);
          sh.fragmentShader = 'varying vec3 vWp;\n' + decl + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n  {\n' + body + '\n  }');
        };
        mat.customProgramCacheKey = () => decl;
        return mat;
      }
      const ucol = (hex) => ({ value: new THREE.Color(hex) });

      function buildWorld() {
        const T = window.THREE;
        if (T.ColorManagement) T.ColorManagement.legacyMode = false;   // colours are written as on screen (sRGB); only this game uses three.js in the Hub
        let renderer;
        try {
          renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' });
        } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        // Painted colour: what is written is what shows, saturated, with no film curve dulling it
        renderer.outputEncoding = T.sRGBEncoding;
        renderer.toneMapping = T.NoToneMapping;
        const scene = new T.Scene();
        scene.fog = new T.Fog(0xe0a080, 18, 70);
        const camera = new T.PerspectiveCamera(60, 16 / 10, 0.1, 180);
        const rand = rng(909);

        // Sky dome with a sun and a few painted clouds (they ride with the dome, so they stay on the horizon)
        const skyGeo = new T.SphereGeometry(140, 24, 12);
        const skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
        skyGeo.setAttribute('color', new T.BufferAttribute(skyCol, 3));
        const sky = new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false, toneMapped: false }));
        scene.add(sky);
        const glowTex = canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(0.25, 'rgba(255,225,160,0.85)'); gr.addColorStop(1, 'rgba(255,190,110,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const sunDisc = new T.Sprite(new T.SpriteMaterial({ map: glowTex, fog: false, depthWrite: false, transparent: true, toneMapped: false }));
        sunDisc.scale.set(18, 18, 1);
        scene.add(sunDisc);
        const cloudTex = canvasTex(256, 128, (g, w, h) => {
          const r2 = rng(61), puffs = [];
          for (let i = 0; i < 9; i++) { const x = 40 + i * 22 + (r2() - 0.5) * 10, rr = 18 + Math.sin(i / 8 * Math.PI) * 26 + r2() * 8; puffs.push([x, h - 34 - rr * 0.55, rr]); }
          g.fillStyle = '#c99ab8'; puffs.forEach(([x, y, rr]) => { g.beginPath(); g.arc(x, y + 6, rr, 0, Math.PI * 2); g.fill(); });     // lilac shade underneath
          g.fillStyle = '#fff3e4'; puffs.forEach(([x, y, rr]) => { g.beginPath(); g.arc(x - 3, y - 3, rr * 0.9, 0, Math.PI * 2); g.fill(); });   // lit tops
          g.globalCompositeOperation = 'destination-in';   // a flat underside, as clouds have
          const fade = g.createLinearGradient(0, 0, 0, h); fade.addColorStop(0.78, 'rgba(0,0,0,1)'); fade.addColorStop(0.86, 'rgba(0,0,0,0)');
          g.fillStyle = fade; g.fillRect(0, 0, w, h);
        });
        for (let i = 0; i < 7; i++) {
          const cl = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, fog: false, depthWrite: false, transparent: true, toneMapped: false, opacity: 0.92 }));
          const az = i / 7 * Math.PI * 2 + rand() * 0.6, el = 0.22 + rand() * 0.35, s = 34 + rand() * 22;
          cl.position.set(Math.sin(az) * Math.cos(el) * 110, Math.sin(el) * 110, Math.cos(az) * Math.cos(el) * 110);
          cl.scale.set(s, s / 2, 1);
          sky.add(cl);
        }

        // Light: a warm sky above, violet bounce from below (so the shade is coloured, not grey), the sun, his lantern
        const hemi = new T.HemisphereLight(0xfff0dc, 0x7a4aa8, 0.8);
        scene.add(hemi);
        const sun = new T.DirectionalLight(0xfff0d0, 1.3);
        sun.castShadow = true;
        sun.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 100 });
        sun.shadow.bias = -0.0015;
        sun.shadow.normalBias = 0.03;
        sun.shadow.camera.updateProjectionMatrix();
        scene.add(sun); scene.add(sun.target);
        const lantern = new T.PointLight(0xffb15a, 1.4, 11, 2);
        scene.add(lantern);

        // Which ground lies at the foot of a wall: a soft mask, so the sand darkens to violet where the cliffs rise
        const maskO = -4 * CELL, maskS = (N + 8) * CELL;
        const wallMask = canvasTex(256, 256, (g, w) => {
          g.fillStyle = '#000'; g.fillRect(0, 0, w, w);
          const k = w / maskS;
          for (let r = -4; r < N + 4; r++) for (let c = -4; c < N + 4; c++) {
            if (r >= 0 && r < N && c >= 0 && c < N && MAZE[r][c] === '0') continue;
            for (let f = 5; f >= 0; f--) {   // feathered by hand (canvas blur filters are not everywhere)
              const pad = f * 0.2, x = wx(c) - span(c) / 2 - pad - maskO, z = wz(r) - span(r) / 2 - pad - maskO;
              g.fillStyle = 'rgba(255,255,255,0.22)';
              g.fillRect(x * k, z * k, (span(c) + pad * 2) * k, (span(r) + pad * 2) * k);
            }
          }
        });
        wallMask.encoding = T.LinearEncoding;
        wallMask.flipY = false;

        // Sand: a warm gold, with broad shaded drifts and soft wind ripples painted across it
        const floorMat = worldPainted(toon(), {
          uSand: ucol(0xe8a060), uSandLo: ucol(0xc06a48), uSandHi: ucol(0xffd498), uFootShade: ucol(0x7a447c),
          uMask: { value: wallMask }, uMaskO: { value: maskO }, uMaskS: { value: maskS }
        }, 'uniform vec3 uSand, uSandLo, uSandHi, uFootShade;\nuniform sampler2D uMask;\nuniform float uMaskO, uMaskS;\n', `
    float drift = sin(vWp.x * 0.21 + sin(vWp.z * 0.17) * 2.0) * sin(vWp.z * 0.19 + sin(vWp.x * 0.13) * 2.0);
    vec3 c = mix(uSand, uSandLo, smoothstep(0.1, 0.75, drift) * 0.55);
    float rip = sin(vWp.z * 2.4 + sin(vWp.x * 0.55) * 2.2 + vWp.x * 0.4);
    c = mix(c, uSandHi, smoothstep(0.6, 0.95, rip) * 0.6);
    c = mix(c, uSandLo, smoothstep(0.6, 0.95, -rip) * 0.35);
    float foot = texture2D(uMask, (vWp.xz - uMaskO) / uMaskS).r;
    c = mix(c, uFootShade, smoothstep(0.05, 0.85, foot) * 0.7);
    diffuseColor.rgb *= c;`);
        const floor = new T.Mesh(new T.PlaneGeometry(160, 160), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(wx(12), 0, wz(12));
        floor.receiveShadow = true;
        scene.add(floor);

        // Canyon walls: chunky faceted sandstone, painted by height (plum at the foot, glowing orange, a cream crust
        // where the sun lands on top) with broad strata that run on from one cliff to the next
        function rockGeometry() {
          const geo = new T.BoxGeometry(1, 1, 1, 2, 6, 2);
          geo.translate(0, 0.5, 0);
          const p = geo.attributes.position;
          const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
          for (let i = 0; i < p.count; i++) {
            const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            // The same corner of two faces gets the same push, so the rock stays closed
            const qx = Math.round(x * 4) / 4, qy = Math.round(y * 12) / 12, qz = Math.round(z * 4) / 4;
            const wear = 1 + Math.sin(qy * Math.PI * 5 + hash(qx, 0, qz) * 6) * 0.07;   // ledges eroded in steps
            if (y > 0.001) {
              p.setX(i, x * wear + (hash(qx, qy, qz) - 0.5) * 0.16);
              p.setZ(i, z * wear + (hash(qz, qx, qy) - 0.5) * 0.16);
              if (y < 0.999) p.setY(i, y + (hash(qy, qz, qx) - 0.5) * 0.05);
            }
          }
          geo.computeVertexNormals();
          return geo;
        }
        const ROCK = 'uniform vec3 uFoot, uMid, uHigh, uCrust, uLip;\n';
        const rockPaint = (foot, mid, high, crust, lip) => worldPainted(toon({ flatShading: true }),
          { uFoot: ucol(foot), uMid: ucol(mid), uHigh: ucol(high), uCrust: ucol(crust), uLip: ucol(lip) }, ROCK, `
    float wob = sin(vWp.x * 0.31 + vWp.z * 0.23) * 0.45 + sin((vWp.x - vWp.z) * 0.9) * 0.12;
    float hgt = vWp.y + wob;
    vec3 c = mix(uFoot, uMid, smoothstep(0.0, 3.0, hgt));
    c = mix(c, uHigh, smoothstep(3.0, 7.5, hgt));
    float band = hgt * 1.15, f = fract(band);
    c *= 0.9 + 0.16 * fract(sin(floor(band) * 12.9898 + 4.1) * 43758.5453);
    c = mix(c, uLip, smoothstep(0.84, 0.96, f) * 0.4);
    vec3 fn = normalize(cross(dFdx(vWp), dFdy(vWp)));
    c = mix(c, uCrust, smoothstep(0.45, 0.8, fn.y));
    diffuseColor.rgb *= c;`);
        const rockMat = rockPaint(0x6a2c4a, 0xd65a36, 0xf59a50, 0xffd9a0, 0xffc28a);
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
        const walls = new T.InstancedMesh(rockGeometry(), rockMat, cells.length * 2);
        walls.castShadow = true; walls.receiveShadow = true;
        const m4 = new T.Matrix4(), q = new T.Quaternion(), v = new T.Vector3(), sc = new T.Vector3(), up = new T.Vector3(0, 1, 0);
        let n = 0;
        cells.forEach(([r, c, inside]) => {
          const h = inside ? 4.6 + rand() * 2.6 : 8 + rand() * 4;
          const sx = span(c), sz = span(r);
          q.setFromAxisAngle(up, rand() < 0.5 ? 0 : Math.PI);
          m4.compose(v.set(wx(c), 0, wz(r)), q, sc.set(sx * 1.04, h, sz * 1.04));
          walls.setMatrixAt(n++, m4);
          if (rand() < 0.7) {   // a cap of harder rock, a little wider than the fin below it
            const lh = 0.5 + rand() * 1.6;
            q.setFromAxisAngle(up, (rand() - 0.5) * 0.25);
            m4.compose(v.set(wx(c) + (rand() - 0.5) * 0.3, h - 0.25, wz(r) + (rand() - 0.5) * 0.3), q,
              sc.set(sx * (0.85 + rand() * 0.35), lh, sz * (0.85 + rand() * 0.35)));
            walls.setMatrixAt(n++, m4);
          }
        });
        walls.count = n;
        scene.add(walls);

        // Fallen rocks along the foot of the walls
        const rubbleGeo = new T.DodecahedronGeometry(0.5, 0);
        const rubble = new T.InstancedMesh(rubbleGeo, rockMat, 520);
        rubble.castShadow = true; rubble.receiveShadow = true;
        let rn = 0;
        for (let r = 0; r < N && rn < 520; r++) for (let c = 0; c < N && rn < 520; c++) {
          if (MAZE[r][c] !== '0') continue;
          DIRS.forEach(([dr, dc]) => {
            if (rn >= 520 || open(r + dr, c + dc) || rand() > 0.38) return;
            const s = 0.12 + rand() * 0.4;
            const toWall = (dc ? span(c) : span(r)) / 2 - 0.15, along = (rand() - 0.5) * (dc ? span(r) : span(c)) * 0.85;
            q.setFromEuler(new T.Euler(rand() * 3, rand() * 3, rand() * 3));
            m4.compose(v.set(wx(c) + dc * toWall + (dr ? along : 0), s * 0.3, wz(r) + dr * toWall + (dc ? along : 0)), q, sc.set(s, s * 0.7, s));
            rubble.setMatrixAt(rn++, m4);
          });
        }
        rubble.count = rn;
        scene.add(rubble);

        // Desert agaves in the shade of the walls: a rosette of thick leaves, deep teal at the heart, sage at the tips
        const leafPos = [], leafCol = [], dark = new T.Color(0x1f6f6a), pale = new T.Color(0xa8d68a), lc = new T.Color();
        for (let l = 0; l < 11; l++) {
          const cone = new T.ConeGeometry(0.07, l < 4 ? 0.5 : 0.7, 4).toNonIndexed();
          cone.translate(0, (l < 4 ? 0.5 : 0.7) / 2, 0);
          cone.rotateX(l < 4 ? 0.25 : 0.75 + (l % 3) * 0.12);
          cone.rotateY(l * 2.4);
          const cp = cone.attributes.position;
          for (let i = 0; i < cp.count; i++) {
            leafPos.push(cp.getX(i), cp.getY(i), cp.getZ(i));
            lc.copy(dark).lerp(pale, Math.min(1, cp.getY(i) / 0.55));
            leafCol.push(lc.r, lc.g, lc.b);
          }
        }
        const agaveGeo = new T.BufferGeometry();
        agaveGeo.setAttribute('position', new T.Float32BufferAttribute(leafPos, 3));
        agaveGeo.setAttribute('color', new T.Float32BufferAttribute(leafCol, 3));
        agaveGeo.computeVertexNormals();
        const shrubs = new T.InstancedMesh(agaveGeo, toon({ vertexColors: true, flatShading: true }), 160);
        let sn = 0;
        for (let r = 1; r < N && sn < 160; r += 2) for (let c = 1; c < N && sn < 160; c += 2) {
          if (MAZE[r][c] !== '0' || rand() > 0.45) continue;
          const side = rand() < 0.5 ? -1 : 1, s = 0.6 + rand() * 0.7;
          q.setFromAxisAngle(up, rand() * Math.PI);
          m4.compose(v.set(wx(c) + side * (WIDE / 2 - 0.45), 0, wz(r) + (rand() - 0.5) * 1.6), q, sc.set(s, s * (0.8 + rand() * 0.4), s));
          shrubs.setMatrixAt(sn++, m4);
        }
        shrubs.count = sn;
        shrubs.castShadow = true;
        scene.add(shrubs);

        // Shafts of sunlight that fall slanting into the gorge
        const shaftTex = canvasTex(32, 128, (g, w, h) => {
          const v2 = g.createLinearGradient(0, 0, 0, h);
          v2.addColorStop(0, 'rgba(255,255,255,0.9)'); v2.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = v2; g.fillRect(0, 0, w, h);
          g.globalCompositeOperation = 'destination-in';
          const h2 = g.createLinearGradient(0, 0, w, 0);
          h2.addColorStop(0, 'rgba(0,0,0,0)'); h2.addColorStop(0.5, 'rgba(0,0,0,1)'); h2.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = h2; g.fillRect(0, 0, w, h);
        });
        const shaftGeo = new T.PlaneGeometry(1.4, 9);
        shaftGeo.translate(0, 4.5, 0);
        const shafts = new T.InstancedMesh(shaftGeo, new T.MeshBasicMaterial({ map: shaftTex, color: 0xffd9a0, transparent: true, opacity: 0.16,
          depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped: false }), 40);
        let hn = 0;
        for (let r = 1; r < N && hn < 40; r += 2) for (let c = 1; c < N && hn < 40; c += 2) {
          if (MAZE[r][c] !== '0' || rand() > 0.22) continue;
          q.setFromEuler(new T.Euler(0, rand() * Math.PI, 0.35, 'YXZ'));
          m4.compose(v.set(wx(c) + (rand() - 0.5), 0, wz(r) + (rand() - 0.5)), q, sc.set(0.7 + rand() * 0.8, 1, 1));
          shafts.setMatrixAt(hn++, m4);
        }
        shafts.count = hn;
        shafts.renderOrder = 3;
        scene.add(shafts);

        // Cairns, false cairns, the named dead ends, the two portals
        const stoneMat = rim(toon({ color: 0xf0a868, flatShading: true }), 0xffd8a0, 0.35);   // paler than the cliffs, so a cairn stands out
        const stoneAt = {};
        // A cairn stands against the wall of its corridor (or at the back of its dead end), so Hermes stops beside it
        function cairnMesh(r, c, seed) {
          let ox = 0, oz = 0;
          DIRS.forEach(([dr, dc]) => { if (open(r + dr, c + dc)) { ox -= dc; oz -= dr; } });
          if (!ox && !oz) { if (open(r - 1, c)) ox = 1; else oz = 1; }
          const len = Math.hypot(ox, oz), x = wx(c) + ox / len * (WIDE / 2 - 0.5), z = wz(r) + oz / len * (WIDE / 2 - 0.5);
          const g = new T.Group(), r2 = rng(seed);
          for (let i = 0; i < 6; i++) {
            const s = 0.42 - i * 0.055;
            const st = new T.Mesh(new T.DodecahedronGeometry(s, 0), stoneMat);
            st.scale.set(1, 0.42, 1);
            st.position.set((r2() - 0.5) * 0.06, 0.12 + i * 0.19, (r2() - 0.5) * 0.06);
            st.rotation.y = r2() * 3;
            st.castShadow = true; st.receiveShadow = true;
            g.add(st);
          }
          g.position.set(x, 0, z);
          scene.add(g);
          stoneAt[key(r, c)] = g.position;
          return g;
        }
        const jarMat = rim(toon({ color: 0xc8703e }), 0xffc890, 0.3);
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
            const ring = new T.Mesh(new T.TorusGeometry(0.75, 0.2, 6, 16), stoneMat);
            ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.16, z); ring.castShadow = true;
            const hole = new T.Mesh(new T.CircleGeometry(0.6, 16), new T.MeshBasicMaterial({ color: 0x120804 }));
            hole.rotation.x = -Math.PI / 2; hole.position.set(x, 0.03, z);
            scene.add(ring); scene.add(hole);
          } else if (kind === 'pit') {
            const pit = new T.Mesh(new T.CircleGeometry(1.4, 9), new T.MeshBasicMaterial({ color: 0x050302 }));
            pit.rotation.x = -Math.PI / 2; pit.scale.set(1, 0.7, 1); pit.position.set(x, 0.02, z + 0.3);
            scene.add(pit);
          } else if (kind === 'salt') {
            const salt = new T.Mesh(new T.CircleGeometry(1.6, 12), toon({ color: 0xf6f2ea }));
            salt.rotation.x = -Math.PI / 2; salt.position.set(x, 0.02, z); salt.receiveShadow = true;
            scene.add(salt);
          } else if (kind === 'dune') {
            const dune = new T.Mesh(new T.SphereGeometry(1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), floorMat);
            dune.scale.set(1.1, 1.2, 1.6); dune.position.set(x + 0.5, 0, z); dune.receiveShadow = true;
            scene.add(dune);
          }
        });
        const glowMat = (col) => new T.MeshBasicMaterial({ color: col, fog: false, toneMapped: false });
        const exitGlow = new T.Mesh(new T.PlaneGeometry(WIDE * 1.1, 16), glowMat(0xfff4dc));
        exitGlow.position.set(wx(N + 3), 6, wz(EXIT[0])); exitGlow.rotation.y = -Math.PI / 2;
        scene.add(exitGlow);
        const portalGlow = new T.Mesh(new T.PlaneGeometry(WIDE * 1.1, 16), glowMat(0xffe0b0));
        portalGlow.position.set(wx(-3), 6, wz(START[0])); portalGlow.rotation.y = Math.PI / 2;
        scene.add(portalGlow);

        // Footprints
        const printTex = canvasTex(32, 64, (g) => {
          g.fillStyle = 'rgba(110,52,78,0.7)';
          g.beginPath(); g.ellipse(16, 22, 9, 15, 0, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.ellipse(16, 50, 7, 9, 0, 0, Math.PI * 2); g.fill();
        });
        const printGeo = new T.PlaneGeometry(0.2, 0.38);
        printGeo.rotateX(-Math.PI / 2);
        const prints = new T.InstancedMesh(printGeo, new T.MeshLambertMaterial({ map: printTex, transparent: true, depthWrite: false, opacity: 0.8 }), 1600);
        prints.count = 0;
        prints.renderOrder = 2;
        scene.add(prints);

        const H = buildHermes(T, glowTex);
        scene.add(H.hermes);

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

        // Motes of sand that hang in the light around him
        const motesN = lowPower ? 120 : 260;
        const motesGeo = new T.BufferGeometry(), motesBase = new Float32Array(motesN * 3), mr = rng(77);
        for (let i = 0; i < motesN; i++) { motesBase[i * 3] = mr() * 14; motesBase[i * 3 + 1] = 0.2 + mr() * 4.5; motesBase[i * 3 + 2] = mr() * 14; }
        motesGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(motesN * 3), 3));
        const motes = new T.Points(motesGeo, new T.PointsMaterial({ map: glowTex, color: 0xffe2b8, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending }));
        motes.frustumCulled = false;
        scene.add(motes);

        // The relic in Silvia's hands, with its own light, a halo that warms as the letter turns to her,
        // and the golden sparks it throws out when the rune is read
        const relicLight = new T.PointLight(0xfff0d0, 0, 6, 2);
        scene.add(relicLight);
        const relicGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd98a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        relicGlow.visible = false;
        relicGlow.renderOrder = -1;
        scene.add(relicGlow);
        const sparksN = 70;
        const sparksGeo = new T.BufferGeometry();
        sparksGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(sparksN * 3), 3));
        const sparks = new T.Points(sparksGeo, new T.PointsMaterial({ map: glowTex, color: 0xffd27a, size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        sparks.frustumCulled = false;
        sparks.visible = false;
        scene.add(sparks);

        return { T, renderer, scene, camera, sky, sunDisc, hemi, sun, lantern, prints, hermes: H.hermes, legL: H.legL, legR: H.legR, flame: H.flame,
                 staff: H.staff, lamp: H.lamp, cloak: H.cloak, arrows, arrowGeo, dust, dustN, motes, motesBase, motesN, relicLight, relicGlow, sparks, sparksN, relic: null, lowPower, stoneAt, shafts };
      }

      // ---- Hermes as the Cartographer of Distant Light: silver hair and white beard, the deep blue robe embroidered
      // with gold constellations, brown boots, a walking staff, his satchel, the brass spyglass and the lantern ----
      // Adds a part to its parent at height y (Object3D.add returns the parent, so its position cannot be chained)
      function pin(parent, mesh, y) { mesh.position.y = y; parent.add(mesh); return mesh; }
      function buildHermes(T, glowTex) {
        const hermes = new T.Group();
        // The robe is painted in broad strokes: royal blue that deepens towards the hem, gold constellations whose
        // stars glow faintly of their own light, the gold border along the hem and down the front opening
        const stars = [];
        const r2 = rng(43);
        for (let k = 0; k < 16; k++) {
          const cx = r2() * 512, cy = 40 + r2() * 166, pts = [];
          for (let s = 0; s < 4 + Math.floor(r2() * 3); s++) pts.push([cx + (r2() - 0.5) * 70, cy + (r2() - 0.5) * 50, 2.4 + r2() * 1.8]);
          stars.push(pts);
        }
        const drawStars = (g, thread) => stars.forEach((pts) => {
          if (thread) { g.strokeStyle = thread; g.lineWidth = 1.6; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
          pts.forEach(([x, y, rr]) => { g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); });
        });
        const robeTex = canvasTex(512, 256, (g, w, h) => {
          const grad = g.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, '#3a6fd0'); grad.addColorStop(0.55, '#24479c'); grad.addColorStop(1, '#152a66');
          g.fillStyle = grad; g.fillRect(0, 0, w, h);
          speckle(g, w, h, 41, 'rgba(0,0,0,0)', [['rgba(120,170,255,0.18)', 14], ['rgba(10,20,60,0.22)', 16]], 120);
          drawStars(g, 'rgba(240,200,110,0.85)');
          g.fillStyle = '#d9a440'; g.fillRect(0, h - 28, w, 16);
          g.fillStyle = '#ffe08a'; g.fillRect(0, h - 25, w, 3); g.fillRect(0, h - 17, w, 2);
          g.fillStyle = '#d9a440'; g.fillRect(w / 2 - 6, 0, 12, h);
          g.fillStyle = '#ffe08a'; g.fillRect(w / 2 - 1.5, 0, 3, h);
        });
        const starGlow = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); drawStars(g, null); });
        const warm = 0xffdcae;
        const robe = rim(toon({ map: robeTex, emissive: 0xffd27a, emissiveMap: starGlow, emissiveIntensity: 0.7 }), 0x9cc4ff, 0.45);
        const blue = rim(toon({ color: 0x2c58b8 }), 0x9cc4ff, 0.45);
        const skin = rim(toon({ color: 0xf0b48c }), warm, 0.3);
        const silver = rim(toon({ color: 0xf4f2ee }), 0xffffff, 0.35);
        const leather = rim(toon({ color: 0x7a4a26 }), warm, 0.3);
        const boot = rim(toon({ color: 0x5e3418 }), warm, 0.25);
        const wood = rim(toon({ color: 0x8a5a2e }), warm, 0.3);
        const brass = rim(toon({ color: 0xf0c060 }), 0xfff0b0, 0.6);
        const gold = rim(toon({ color: 0xf2c25a, emissive: 0x3a2404 }), 0xfff0b0, 0.5);
        const V = (a) => a.map((p) => new T.Vector2(p[0], p[1]));
        const add = (mesh, x, y, z, parent) => { mesh.position.set(x, y, z); mesh.castShadow = true; (parent || hermes).add(mesh); return mesh; };

        // The robe falls from the shoulders to just above the boots; a short cape covers the shoulders
        const cloak = new T.Group();
        hermes.add(cloak);
        const robeGeo = new T.LatheGeometry(V([[0.4, 0.1], [0.37, 0.3], [0.33, 0.55], [0.29, 0.8], [0.26, 1.0], [0.25, 1.15], [0.27, 1.28], [0.22, 1.38], [0.09, 1.44]]), 24);
        robeGeo.rotateY(Math.PI);    // the gold opening (the middle of the texture) comes to the front, which is -Z
        add(new T.Mesh(robeGeo, robe), 0, 0, 0, cloak);
        add(new T.Mesh(new T.LatheGeometry(V([[0.36, 1.06], [0.34, 1.2], [0.29, 1.34], [0.18, 1.43], [0.1, 1.46]]), 24), blue), 0, 0, 0, cloak);
        add(new T.Mesh(new T.CylinderGeometry(0.27, 0.27, 0.05, 20, 1, true), gold), 0, 0.97, 0, cloak);   // the sash
        // The hood lies down around his neck, as in the portraits
        const cowl = add(new T.Mesh(new T.TorusGeometry(0.13, 0.065, 8, 18), blue), 0, 1.45, 0.01);
        cowl.rotation.x = Math.PI / 2;
        const hood = add(new T.Mesh(new T.SphereGeometry(0.16, 14, 10), blue), 0, 1.45, 0.11);
        hood.scale.set(1.05, 0.65, 0.75);
        // Head: the face, silver hair swept back, the white beard
        add(new T.Mesh(new T.SphereGeometry(0.14, 16, 12), skin), 0, 1.61, 0);
        add(new T.Mesh(new T.SphereGeometry(0.148, 16, 12), silver), 0, 1.638, 0.03);
        const mane = add(new T.Mesh(new T.SphereGeometry(0.11, 12, 10), silver), 0, 1.54, 0.08);
        mane.scale.set(1.15, 1, 0.7);
        const beard = add(new T.Mesh(new T.ConeGeometry(0.095, 0.24, 12), silver), 0, 1.47, -0.09);
        beard.rotation.x = Math.PI + 0.35;
        add(new T.Mesh(new T.SphereGeometry(0.024, 8, 6), skin), 0, 1.61, -0.14);   // the nose
        // Arms in wide sleeves; fingerless leather gloves
        function arm(side, ax, az) {
          const a = new T.Group();
          a.position.set(side * 0.27, 1.33, 0);
          a.rotation.set(ax, 0, az);
          const sleeve = new T.Mesh(new T.CylinderGeometry(0.06, 0.1, 0.48, 10), blue);
          sleeve.position.y = -0.24; sleeve.castShadow = true; a.add(sleeve);
          const glove = new T.Mesh(new T.SphereGeometry(0.068, 10, 8), leather);
          glove.position.y = -0.52; a.add(glove);
          hermes.add(a);
          return a;
        }
        const armR = arm(1, 0.55, 0.12), armL = arm(-1, 0.35, -0.15);
        // The lantern hangs from his right hand, upright whatever the arm does
        const lamp = new T.Group();
        lamp.position.set(0, -0.6, 0);
        lamp.rotation.x = -0.55;
        armR.add(lamp);
        const lampBody = new T.Group();
        lampBody.position.y = -0.08;
        lamp.add(lampBody);
        pin(lampBody, new T.Mesh(new T.CylinderGeometry(0.075, 0.085, 0.03, 10), brass), -0.09);
        pin(lampBody, new T.Mesh(new T.ConeGeometry(0.08, 0.07, 10), brass), 0.1);
        const glass = new T.Mesh(new T.CylinderGeometry(0.065, 0.065, 0.16, 10), new T.MeshBasicMaterial({ color: 0xffc46a, transparent: true, opacity: 0.55 }));
        lampBody.add(glass);
        const flame = new T.Mesh(new T.SphereGeometry(0.035, 8, 8), new T.MeshBasicMaterial({ color: 0xfff0b8, toneMapped: false }));
        lampBody.add(flame);
        const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffb860, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending }));
        halo.scale.set(0.7, 0.7, 1);
        flame.add(halo);
        // The staff in his left hand, as he walks out of the sketch of the North Portal
        const staff = new T.Group();
        staff.position.set(-0.34, 0.84, -0.18);
        hermes.add(staff);
        const pole = new T.Mesh(new T.CylinderGeometry(0.022, 0.028, 1.8, 8), wood);
        pole.position.y = 0.06; pole.castShadow = true; staff.add(pole);
        pin(staff, new T.Mesh(new T.TorusGeometry(0.045, 0.014, 6, 12), brass), 0.98);
        // A small star of brass set in the ring, that keeps a glint of light even in the shade
        const finial = pin(staff, new T.Mesh(new T.OctahedronGeometry(0.035, 0), new T.MeshBasicMaterial({ color: 0xfff0b0, toneMapped: false })), 0.98);
        const glint = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd890, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending }));
        glint.scale.set(0.32, 0.32, 1);
        finial.add(glint);
        // The satchel on his right hip, the brass spyglass tucked behind the sash
        add(new T.Mesh(new T.BoxGeometry(0.1, 0.22, 0.26), leather), 0.31, 0.86, 0.05);
        const glassTube = add(new T.Mesh(new T.CylinderGeometry(0.03, 0.038, 0.36, 10), brass), -0.1, 1.02, 0.27);
        glassTube.rotation.z = 0.9;
        // Boots that show under the hem as he walks
        const legL = new T.Group(), legR = new T.Group();
        [[legL, -0.1], [legR, 0.1]].forEach(([g, x]) => {
          const b = new T.Mesh(new T.BoxGeometry(0.12, 0.1, 0.24), boot);
          b.position.set(0, 0.05, -0.04); b.castShadow = true;
          g.add(b); g.position.x = x; hermes.add(g);
        });
        return { hermes, legL, legR, flame, staff, lamp, cloak };
      }

      // ---- Relics: each one carries its rune cut into its own surface ----
      // The surface that holds the rune is mapped flat from the front (or from above), and gets the rune carved
      // into its colour and its relief; the rest of the object keeps the plain material.
      function engrave(geo, face, cx, cy, size) {
        if (!geo.attributes.normal) geo.computeVertexNormals();
        const p = geo.attributes.position, nr = geo.attributes.normal, uv = new Float32Array(p.count * 2);
        for (let i = 0; i < p.count; i++) {
          const n = face === 'top' ? nr.getY(i) : nr.getZ(i);
          if (n > 0.3) {
            const a = p.getX(i), b = face === 'top' ? -p.getZ(i) : p.getY(i);
            uv[i * 2] = (a - cx) / size + 0.5; uv[i * 2 + 1] = (b - cy) / size + 0.5;
          } else { uv[i * 2] = 0.03; uv[i * 2 + 1] = 0.03; }
        }
        geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        return geo;
      }
      const SKINS = {
        bronze: ['#a8722e', [['rgba(70,170,150,0.4)', 7], ['rgba(90,50,16,0.25)', 6], ['rgba(255,220,140,0.35)', 4]], '#3a2208', 'rgba(255,230,160,0.85)'],
        clay: ['#9a5a34', [['rgba(40,20,10,0.25)', 7], ['rgba(190,120,80,0.2)', 4]], '#4a2412', 'rgba(236,180,130,0.9)'],
        bone: ['#ddcfac', [['rgba(150,120,80,0.18)', 5], ['rgba(255,250,235,0.3)', 3]], '#5a4228', 'rgba(255,248,226,0.8)'],
        brass: ['#b8903e', [['rgba(90,60,20,0.22)', 5], ['rgba(240,210,130,0.25)', 3]], '#3e2a0a', 'rgba(255,236,170,0.8)'],
        iron: ['#5e3420', [['rgba(170,82,40,0.4)', 7], ['rgba(30,16,10,0.3)', 5]], '#140804', 'rgba(240,184,128,0.95)'],
        shell: ['#e2bf9c', [['rgba(214,150,130,0.3)', 6], ['rgba(255,244,230,0.35)', 4]], '#6a3a26', 'rgba(255,246,232,0.85)']
      };
      // The colour and the relief of one relic's surface, with the rune carved (or scratched) in the middle
      function runeSurface(skin, letter, letterPx, style) {
        const [base, spots, groove, rim] = SKINS[skin];
        const W = 256, font = `700 ${letterPx}px Cinzel, Georgia, serif`;
        const draw = (g, x, y, mode) => {
          g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
          if (mode === 'outline') { g.lineWidth = Math.max(2, letterPx * 0.03); g.strokeText(letter, x, y); }
          else if (style === 'scratch') { g.fillText(letter, x, y); g.lineWidth = Math.max(3, letterPx * 0.05); g.lineJoin = 'round'; g.strokeText(letter, x, y); }
          else g.fillText(letter, x, y);
        };
        const map = canvasTex(W, W, (g) => {
          speckle(g, W, W, letter.charCodeAt(0) * 7, base, spots, 220);
          g.fillStyle = g.strokeStyle = rim; draw(g, W / 2 + 3, W / 2 + 3 + letterPx * 0.04);     // the lit lower edge of the cut
          g.fillStyle = g.strokeStyle = groove; draw(g, W / 2, W / 2 + letterPx * 0.04);         // the bottom of the cut
          if (style !== 'scratch') { g.strokeStyle = 'rgba(0,0,0,0.35)'; draw(g, W / 2 - 1, W / 2 - 1 + letterPx * 0.04, 'outline'); }
        });
        const bump = canvasTex(W, W, (g) => {
          g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, W);
          g.filter = 'blur(2px)';
          g.fillStyle = g.strokeStyle = '#000000';
          draw(g, W / 2, W / 2 + letterPx * 0.04);
          g.filter = 'none';
        });
        bump.encoding = THREE.LinearEncoding;
        return { map, bump };
      }
      function makeRelic(kind, letter) {
        const T = G.T, g = new T.Group();
        const V = (a) => a.map((p) => new T.Vector2(p[0], p[1]));
        const skins = {};
        // Painted shading with a rim of light; metal gets a brighter, golden rim in place of a mirror shine
        const shine = (m, metal) => rim(m, metal > 0.2 ? 0xffe6a0 : 0xfff0dc, metal > 0.2 ? 0.75 : 0.4);
        const plain = (skin, metal, rough) => (skins[skin + metal + rough] = skins[skin + metal + rough] || shine(toon({
          map: canvasTex(128, 128, (c, w, h) => speckle(c, w, h, skin.length * 13, SKINS[skin][0], SKINS[skin][1], 90)) }), metal));
        const carved = (skin, metal, rough, letterPx, style) => {
          const s = runeSurface(skin, letter, letterPx, style);
          return shine(toon({ map: s.map, bumpMap: s.bump, bumpScale: 2.5 }), metal);
        };
        // Where the rune sits, and which way it faces (the camera must look at it to read it)
        const anchor = new T.Object3D();
        let face = 'front';
        if (kind === 'bell') {
          // The profile runs from the lip up to the crown, so the lathe faces outwards; the inside runs back down
          const outer = [[0.36, -0.25], [0.35, -0.22], [0.29, -0.16], [0.24, -0.05], [0.215, 0.1], [0.2, 0.25], [0.17, 0.36], [0.12, 0.42], [0.06, 0.44]];
          g.add(new T.Mesh(engrave(new T.LatheGeometry(V(outer), 40), 'front', 0, 0.06, 0.5), carved('bronze', 0.35, 0.5, 120)));
          g.add(new T.Mesh(new T.LatheGeometry(V(outer.map(([r, y]) => [r * 0.9, y - 0.015]).reverse()), 40), plain('bronze', 0.3, 0.6)));
          pin(g, new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.02, 20), plain('bronze', 0.3, 0.6)), 0.445);
          pin(g, new T.Mesh(new T.TorusGeometry(0.06, 0.022, 8, 18), plain('bronze', 0.35, 0.5)), 0.5);
          pin(g, new T.Mesh(new T.SphereGeometry(0.055, 12, 10), plain('iron', 0.2, 0.8)), -0.2);
          anchor.position.set(0, 0.06, 0.22);
        } else if (kind === 'lamp') {
          // A palm-sized oil lamp: round body, a flat top with the filling hole, the nozzle and a ring handle
          const body = [[0, -0.1], [0.2, -0.09], [0.29, -0.04], [0.3, 0.02], [0.27, 0.07], [0.24, 0.085], [0.002, 0.085], [0, 0.085]];   // the point by the axis keeps the lid's normal straight up
          g.add(new T.Mesh(engrave(new T.LatheGeometry(V(body), 36), 'top', 0, -0.02, 0.5), carved('clay', 0, 0.9, 130, 'scratch')));
          const hole = new T.Mesh(new T.CircleGeometry(0.035, 14), new T.MeshBasicMaterial({ color: 0x1a0c06 }));
          hole.rotation.x = -Math.PI / 2; hole.position.set(0, 0.087, 0.18); g.add(hole);
          const nozzle = new T.Mesh(new T.CylinderGeometry(0.05, 0.075, 0.24, 14), plain('clay', 0, 0.9));
          nozzle.rotation.x = Math.PI / 2; nozzle.position.set(0, 0.0, -0.36); g.add(nozzle);
          const soot = new T.Mesh(new T.CircleGeometry(0.045, 12), new T.MeshBasicMaterial({ color: 0x0c0604 }));
          soot.position.set(0, 0.0, -0.481); soot.rotation.y = Math.PI; g.add(soot);
          const handle = new T.Mesh(new T.TorusGeometry(0.07, 0.025, 8, 16), plain('clay', 0, 0.9));
          handle.position.set(0, 0.03, 0.33); handle.rotation.y = Math.PI / 2; g.add(handle);
          anchor.position.set(0, 0.086, 0.02); anchor.rotation.x = -Math.PI / 2;
          face = 'top';
        } else if (kind === 'comb') {
          // Carved bone: an arched back with the rune along it, and the teeth (half of them broken)
          const back = new T.Shape();
          back.moveTo(-0.42, -0.02); back.lineTo(0.42, -0.02); back.lineTo(0.42, 0.1);
          back.quadraticCurveTo(0, 0.3, -0.42, 0.1); back.closePath();
          const bg = new T.ExtrudeGeometry(back, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 16 });
          bg.translate(0, 0, -0.035);
          g.add(new T.Mesh(engrave(bg, 'front', 0, 0.1, 0.42), carved('bone', 0, 0.7, 150)));
          const toothMat = plain('bone', 0, 0.7);
          for (let i = 0; i < 15; i++) {
            const broken = i % 3 === 1 && i > 4, len = broken ? 0.09 + (i % 2) * 0.04 : 0.3;
            const t = new T.Mesh(new T.CylinderGeometry(0.012, 0.018, len, 6), toothMat);
            t.position.set(-0.385 + i * 0.055, -0.02 - len / 2, 0); g.add(t);
          }
          anchor.position.set(0, 0.1, 0.05);
        } else if (kind === 'horn') {
          // A ram's horn with the little brass plate the walkers fixed to it
          const pts = [];
          for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 1.55; const rr = 0.32 - i * 0.0045; pts.push(new T.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, -i * 0.01)); }
          const hornGeo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 64, 0.08, 12);
          const ridges = hornGeo.attributes.position;
          for (let i = 0; i < ridges.count; i++) {   // the growth rings of the horn, and the tip that narrows
            const seg = Math.floor(i / 13) / 64, k = (1 - seg * 0.75) * (1 + Math.sin(seg * 120) * 0.06);
            const c = new T.Vector3(); const along = Math.min(40, Math.round(seg * 40)); c.copy(pts[along]);
            ridges.setXYZ(i, c.x + (ridges.getX(i) - c.x) * k, c.y + (ridges.getY(i) - c.y) * k, c.z + (ridges.getZ(i) - c.z) * k);
          }
          hornGeo.computeVertexNormals();
          g.add(new T.Mesh(hornGeo, plain('bone', 0, 0.65)));
          const plateGeo = new T.CylinderGeometry(0.13, 0.13, 0.025, 28);
          plateGeo.rotateX(Math.PI / 2);
          const plate = new T.Mesh(engrave(plateGeo, 'front', 0, 0, 0.27), carved('brass', 0.45, 0.4, 150));
          plate.position.set(0, 0, 0.09); g.add(plate);
          [[-0.1, 0], [0.1, 0]].forEach(([x]) => { const rivet = new T.Mesh(new T.SphereGeometry(0.012, 6, 6), plain('brass', 0.5, 0.4)); rivet.position.set(x, 0, 0.104); g.add(rivet); });
          anchor.position.set(0, 0, 0.105);
        } else if (kind === 'key') {
          // A heavy iron key: a round head with the rune, a ring to hang it, the shaft and its bit
          const headGeo = new T.CylinderGeometry(0.16, 0.16, 0.05, 32);
          headGeo.rotateX(Math.PI / 2);
          const head = new T.Mesh(engrave(headGeo, 'front', 0, 0, 0.33), carved('iron', 0.3, 0.85, 150));
          head.position.y = 0.24; g.add(head);
          const rim = new T.Mesh(new T.TorusGeometry(0.16, 0.025, 8, 32), plain('iron', 0.3, 0.85)); rim.position.y = 0.24; g.add(rim);
          const ring = new T.Mesh(new T.TorusGeometry(0.05, 0.016, 8, 16), plain('iron', 0.3, 0.85)); ring.position.y = 0.44; g.add(ring);
          const shaft = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.62, 12), plain('iron', 0.3, 0.85)); shaft.position.y = -0.2; g.add(shaft);
          [[-0.38, 0.13], [-0.46, 0.09]].forEach(([y, w]) => { const bit = new T.Mesh(new T.BoxGeometry(w, 0.05, 0.035), plain('iron', 0.3, 0.85)); bit.position.set(w / 2, y, 0); g.add(bit); });
          anchor.position.set(0, 0.24, 0.026);
        } else {
          // A scallop: ribs fanning out from the hinge, the rune cut across them
          const rows = 14, cols = 28, pos = [], idx = [];
          for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) {
            const t = i / rows, a = (j / cols - 0.5) * 2.1, R = 0.4 * t;
            const rib = Math.pow(Math.abs(Math.cos(a * 7.5)), 0.6) * 0.034 * t;
            pos.push(Math.sin(a) * R, -0.2 + Math.cos(a) * R, 0.13 * (1 - t * t * 0.7) * Math.cos(a * 0.9) + rib);
          }
          for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
            const a = i * (cols + 1) + j, b = a + 1, c = a + cols + 1, d = c + 1;
            idx.push(a, b, c, b, d, c);   // wound so the ribbed face looks forwards (+z)
          }
          const front = new T.BufferGeometry();
          front.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); front.setIndex(idx); front.computeVertexNormals();
          g.add(new T.Mesh(engrave(front, 'front', 0, 0.02, 0.5), carved('shell', 0, 0.55, 120)));
          const backGeo = front.clone(); backGeo.scale(1, 1, -0.35); backGeo.index.array.reverse(); backGeo.computeVertexNormals();
          g.add(new T.Mesh(backGeo, plain('shell', 0, 0.6)));
          [-1, 1].forEach((s) => { const ear = new T.Mesh(new T.BoxGeometry(0.1, 0.07, 0.03), plain('shell', 0, 0.6)); ear.position.set(s * 0.07, -0.21, 0.02); ear.rotation.z = s * 0.3; g.add(ear); });
          anchor.position.set(0, 0.02, 0.14);
        }
        g.add(anchor);
        g.userData.plate = anchor;
        g.userData.face = face;
        g.scale.setScalar(0.66);
        return g;
      }

      // The relic leaves her hands: its meshes, materials and carved textures are freed
      function dropRelic() {
        if (!G || !G.relic) return;
        G.scene.remove(G.relic);
        G.relic.traverse((m) => {
          if (!m.isMesh) return;
          m.geometry.dispose();
          [m.material].flat().forEach((mt) => { if (mt.map) mt.map.dispose(); if (mt.bumpMap) mt.bumpMap.dispose(); mt.dispose(); });
        });
        G.relic = null;
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
        // A painted sky: peach at the horizon, a deep clear blue overhead; dawn and dusk turn both warmer
        const horizon = new G.T.Color().setHSL(0.06 + 0.02 * k, 0.9, 0.6 + 0.12 * k, 'srgb'), zenith = new G.T.Color().setHSL(0.6 - 0.04 * (1 - k), 0.7, 0.36 + 0.2 * k, 'srgb');
        const pos = G.sky.geometry.attributes.position, col = G.sky.geometry.attributes.color, c = new G.T.Color();
        for (let i = 0; i < pos.count; i++) {
          const y = Math.max(0, pos.getY(i) / 120);
          c.copy(horizon).lerp(zenith, Math.pow(y, 0.6));
          col.setXYZ(i, c.r, c.g, c.b);
        }
        col.needsUpdate = true;
        G.sun.intensity = 0.35 + 0.7 * Math.sin(Math.min(e, 1.2));
        G.sun.color.setHSL(0.09, 0.85, 0.7 + 0.22 * k, 'srgb');
        G.hemi.intensity = 0.55 + 0.2 * k;
        G.scene.fog.color.copy(horizon).lerp(new G.T.Color(0x9a6aa8), 0.3);   // a violet haze down the long corridors
        G.shafts.material.opacity = 0.05 + 0.13 * k;
        if (win && Math.abs((paintSky.k ?? -1) - k) > 0.02) { paintSky.k = k; win.style.setProperty('--sun', k.toFixed(2)); }
        G.sunDir = dir;
        G.sky.position.copy(G.camera.position);
        G.sunDisc.position.copy(G.camera.position).addScaledVector(dir, 100);
      }

      // ---- Hermes on screen ----
      const view = { x: 0, z: 0, yaw: 0, look: 0, walk: null, phase: 'idle', relicHold: 0, shake: 0, hot: -1, spin: null, turnQ: [], burst: null, glow: 0, warm: 0 };
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
          a.position.set(view.x + dc * 1.8, 0.03, view.z + dr * 1.8);
          a.scale.setScalar(1.35);
          a.rotation.y = yawOf(o.d);
          a.userData = Object.assign({ born: performance.now(), n: G.arrows.children.length }, o);
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

      // Small rewards for the ear, made on the spot (no files): bell notes, a soft thud, bubbles
      function tone(freq, at, dur, opts) {
        const a = ensureAudio();
        if (!a) return;
        const { ctx } = a, t = ctx.currentTime + (at || 0), o = opts || {};
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = o.type || 'sine';
        osc.frequency.setValueAtTime(freq, t);
        if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(o.gain || 0.12, t + (o.attack || 0.01));
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g); g.connect(a.master);
        osc.start(t); osc.stop(t + dur + 0.05);
      }
      const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1567.98 };
      const sounds = {
        rune: () => ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => { tone(NOTE[n], i * 0.085, 1.1, { gain: 0.1 }); tone(NOTE[n] * 2, i * 0.085, 0.5, { gain: 0.025, type: 'triangle' }); }),
        warm: (level) => tone([NOTE.C5, NOTE.E5, NOTE.G5][level - 1] || NOTE.G5, 0, 0.35, { gain: 0.05, type: 'triangle' }),
        thud: () => { tone(140, 0, 0.35, { to: 55, gain: 0.22 }); tone(90, 0.02, 0.25, { type: 'triangle', to: 50, gain: 0.08 }); },
        fill: () => [0, 1, 2].forEach((i) => tone(520 + i * 160, i * 0.07, 0.12, { to: 900 + i * 160, gain: 0.06 })),
        win: () => {
          ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach((n, i) => tone(NOTE[n], i * 0.11, 1.4, { gain: 0.09 }));
          ['C5', 'E5', 'G5', 'C6'].forEach((n) => tone(NOTE[n], 0.8, 2.2, { gain: 0.06, type: 'triangle', attack: 0.08 }));
        }
      };

      // ---- Little moments on the screen: a flash of light, a red pulse, a shower of confetti ----
      const fxEl = {};
      if (el.stage) {
        const mk = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); if (html) d.innerHTML = html; el.stage.appendChild(d); return d; };
        fxEl.flash = mk('chasm3d-flash');
        fxEl.hurt = mk('chasm3d-hurt');
        fxEl.gauge = mk('chasm3d-gauge', '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" class="g-track"/><circle cx="32" cy="32" r="27" class="g-fill" pathLength="100"/></svg><span>Turn it to the light</span>');
        // A wrong turn is told in the middle of the picture, where she cannot miss it
        fxEl.alert = document.createElement('div');
        fxEl.alert.className = 'chasm3d-alert';
        fxEl.alert.hidden = true;
        fxEl.alert.setAttribute('role', 'alert');
        el.stage.appendChild(fxEl.alert);
      }
      function showAlert(stop, restNeeded) {
        if (!fxEl.alert) return null;
        const [title, why] = {
          decoy: ['A false cairn', 'It stands at a dead end, and a true cairn never does.'],
          early: ['Out of order', 'You skipped a cairn. The cairns must be found in order.'],
          'exit-early': ['Not yet!', `Only ${S.runes} of the six runes. All six come before the way out.`],
          tracks: ['Your own footprints', 'Never walk the same ground twice.'],
          stuck: ['No way left', 'Every way from here crosses your own footprints.']
        }[stop] || ['A dead end', 'The gorge ends in a wall of rock.'];
        const back = S.runes ? `the cairn of the ${CAIRNS[S.runes - 1].relic}` : 'the North Portal';
        fxEl.alert.innerHTML = `<div class="chasm3d-alert-card">
          <div class="chasm3d-alert-seal" aria-hidden="true">✕</div>
          <div class="chasm3d-alert-kicker">Wrong turn</div>
          <div class="chasm3d-alert-title">${title}</div>
          <p class="chasm3d-alert-why">${why}</p>
          <p class="chasm3d-alert-cost">${restNeeded ? '💧 No water left: Hermes must rest in the shade.' : '💧 −1 skin of water'}</p>
          <p class="chasm3d-alert-next">Hermes walks back to ${back}. Try again from there.</p>
          <button type="button" class="chasm3d-alert-btn">${restNeeded ? 'Rest in the shade' : '↺ Back to the last cairn'}</button>
        </div>`;
        fxEl.alert.hidden = false;
        replay(fxEl.alert, 'is-on');
        const b = fxEl.alert.querySelector('button');
        b.addEventListener('click', () => goBack());
        return b;
      }
      function hideAlert() { if (fxEl.alert) fxEl.alert.hidden = true; }
      const win = modal && modal.querySelector('.chasm3d-window');
      if (win) {
        // Life around the game: a warm haze that drifts, an astrolabe turning slowly, sand motes rising in the light
        const amb = document.createElement('div');
        amb.className = 'chasm3d-ambient';
        amb.setAttribute('aria-hidden', 'true');
        const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5 * Math.PI / 180, r0 = i % 6 ? 92 : 86; return `<line x1="${(Math.cos(a) * r0).toFixed(1)}" y1="${(Math.sin(a) * r0).toFixed(1)}" x2="${(Math.cos(a) * 97).toFixed(1)}" y2="${(Math.sin(a) * 97).toFixed(1)}"/>`; }).join('');
        const star = Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8, r = i % 2 ? 34 : (i % 4 ? 52 : 70), b1 = a - 0.12, b2 = a + 0.12; return `<path d="M0,0 L${(Math.cos(b1) * 14).toFixed(1)},${(Math.sin(b1) * 14).toFixed(1)} L${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)} L${(Math.cos(b2) * 14).toFixed(1)},${(Math.sin(b2) * 14).toFixed(1)} Z"/>`; }).join('');
        let motes = '';
        for (let i = 0; i < 26; i++) motes += `<i style="--x:${(6 + Math.random() * 84).toFixed(1)}%;--s:${(2 + Math.random() * 3).toFixed(1)}px;--d:${(14 + Math.random() * 16).toFixed(1)}s;--delay:${(-Math.random() * 30).toFixed(1)}s;--dx:${(Math.random() * 60 - 30).toFixed(0)}px"></i>`;
        amb.innerHTML = `<div class="amb-haze"></div><div class="amb-haze amb-haze-2"></div>
          <svg class="amb-rose" viewBox="-100 -100 200 200"><circle r="97"/><circle r="86"/><circle r="60" stroke-dasharray="2 4"/><circle r="22"/><g class="amb-ticks">${ticks}</g><g class="amb-star">${star}</g></svg>
          <div class="amb-motes">${motes}</div>`;
        win.insertBefore(amb, win.firstChild);
      }
      function paintWarmth() {
        if (!fxEl.gauge) return;
        const on = view.phase === 'relic';
        fxEl.gauge.classList.toggle('is-on', on);
        if (!on) return;
        fxEl.gauge.style.setProperty('--w', view.warm.toFixed(3));
        const level = view.warm > 0.92 ? 3 : view.warm > 0.66 ? 2 : view.warm > 0.33 ? 1 : 0;
        const label = ['Turn it to the light', 'Warmer…', 'Warmer still…', 'Almost! Hold it there'][level];
        const span = fxEl.gauge.querySelector('span');
        if (span.textContent !== label) span.textContent = label;
        if (level > (view.warmLevel || 0)) sounds.warm(level);
        view.warmLevel = level;
      }
      function turnSmooth(ax, ang) {
        if (view.phase !== 'relic') return;
        view.spin = null;
        view.turnQ.push({ ax, left: ang });
      }
      // The rune leaves the relic and flies up into its box, which catches it with a little bounce
      function runeFly(i, letter) {
        const box = el.runes && el.runes.children[i];
        if (!box || !el.stage || reducedMotion() || !box.animate) { if (box) replay(box, 'is-new'); return; }
        const st = el.stage.getBoundingClientRect(), b = box.getBoundingClientRect();
        const fly = document.createElement('div');
        fly.className = 'chasm3d-flyrune';
        fly.setAttribute('aria-hidden', 'true');
        fly.textContent = letter;
        el.stage.appendChild(fly);
        box.classList.add('is-incoming');
        const x0 = st.width / 2, y0 = st.height * 0.48, x1 = b.left - st.left + b.width / 2, y1 = b.top - st.top + b.height / 2;
        const anim = fly.animate([
          { transform: `translate(${x0}px, ${y0}px) translate(-50%, -50%) scale(0.4)`, opacity: 0 },
          { transform: `translate(${x0}px, ${y0 - 30}px) translate(-50%, -50%) scale(2.6)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${x1}px, ${y1}px) translate(-50%, -50%) scale(0.9)`, opacity: 1 }
        ], { duration: 1150, easing: 'cubic-bezier(.5,0,.3,1)', delay: 250 });
        anim.onfinish = () => { fly.remove(); box.classList.remove('is-incoming'); replay(box, 'is-new'); };
      }
      function confetti() {
        if (!el.stage || reducedMotion()) return;
        const box = document.createElement('div');
        box.className = 'chasm3d-confetti';
        box.setAttribute('aria-hidden', 'true');
        const cols = ['#fde68a', '#f59e0b', '#ef6b4a', '#5fa8d8', '#a7f3d0', '#fff3e4'];
        for (let i = 0; i < 70; i++) {
          const c = document.createElement('i');
          c.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--dx:${((Math.random() - 0.5) * 160).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;`
            + `--d:${(1.8 + Math.random() * 1.6).toFixed(2)}s;--delay:${(Math.random() * 0.6).toFixed(2)}s;background:${cols[i % cols.length]}`;
          box.appendChild(c);
        }
        el.stage.appendChild(box);
        setTimeout(() => box.remove(), 4200);
      }

      // =====================================================================
      // The panel: Hermes's voice, where he stands, the controls
      // =====================================================================
      // Hermes's words arrive in a soft cascade, word after word (the whole line in under a second)
      function say(text) {
        if (!el.voice) return;
        if (reducedMotion() || view.quiet) { el.voice.textContent = text; return; }
        const parts = String(text).split(/(\s+)/), words = parts.filter((w) => w.trim()).length;
        const step = Math.min(28, 520 / Math.max(1, words));
        let n = 0;
        el.voice.innerHTML = parts.map((w) => (w.trim() ? `<span class="chasm3d-word" style="animation-delay:${Math.round(n++ * step)}ms">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>` : w)).join('');
        const label = el.voice.previousElementSibling;
        if (label) { label.classList.add('is-talking'); clearTimeout(say.t); say.t = setTimeout(() => label.classList.remove('is-talking'), words * step + 900); }
      }
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
          // The skins are kept (not redrawn), so the water level slides; a lost skin drains with a shake, a refill bubbles
          if (el.skins.children.length !== 3) el.skins.innerHTML = '<span class="chasm3d-skin"></span>'.repeat(3);
          [...el.skins.children].forEach((sk, i) => sk.style.setProperty('--fill', Math.max(0, Math.min(1, S.water - i))));
          el.skins.setAttribute('aria-label', `Water: ${Math.max(0, Math.round(S.water * 10) / 10)} of 3 skins`);
          const before = view.water0;
          view.water0 = S.water;
          if (before !== undefined && G && modal.style.display !== 'none') {
            if (S.water <= before - 0.5) { el.skins.classList.remove('is-fill'); replay(el.skins, 'is-hurt'); replay(fxEl.hurt, 'is-on'); sounds.thud(); }
            else if (S.water >= before + 0.5) { el.skins.classList.remove('is-hurt'); replay(el.skins, 'is-fill'); setTimeout(sounds.fill, 500); }
          }
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
      function where(text) {
        if (!el.where || el.where.textContent === text) return;
        el.where.textContent = text;
        if (!view.quiet) replay(el.where, 'is-new');
      }
      // Restart a one-shot CSS animation on an element
      function replay(node, cls) {
        if (!node) return;
        node.classList.remove(cls);
        void node.offsetWidth;
        node.classList.add(cls);
      }
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
        if (view.quiet) b.style.animation = 'none';   // the window itself is fading in
        else b.style.animationDelay = `${el.controls.children.length * 55}ms`;   // the buttons arrive one after another
        if (opts && opts.dir !== undefined) {   // pointing at a way lights its arrow on the sand
          const hot = (on) => () => { view.hot = on ? opts.dir : -1; };
          b.addEventListener('mouseenter', hot(true)); b.addEventListener('mouseleave', hot(false));
          b.addEventListener('focus', hot(true)); b.addEventListener('blur', hot(false));
        }
        el.controls.appendChild(b);
        return b;
      }
      function clearControls() { if (el.controls) el.controls.innerHTML = ''; view.hot = -1; }

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
        if (stop === 'out') { victory(true); return; }
        setback(stop);
      }

      // ---- Listening for the whisper ----
      function listen() {
        if (view.phase !== 'choose' || S.wh <= 0) return;
        S.wh--;
        S.heard++;
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
        S.fails++;
        view.shake = 1;
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
        const first = showAlert(stop, restNeeded) || el.controls.querySelector('button');
        if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
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
        hideAlert();
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
          b.style.setProperty('--p', (1 - left / REST_S).toFixed(3));   // the button fills like a bar while he rests
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
          dropRelic();
          G.relic = makeRelic(ca.relic, ca.letter);
          // The rune starts turned away from her: half a turn past the way Hermes faces, and tipped over
          G.relic.quaternion.setFromEuler(new G.T.Euler(0.9, yawOf(S.h) + Math.PI * 0.85, 0.3, 'YXZ'));
          G.scene.add(G.relic);
          view.relicHold = 0; view.warm = 0; view.warmLevel = 0; view.spin = null; view.turnQ.length = 0;
        }
        const turn = (ax, ang) => () => turnSmooth(ax, ang);
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
        view.spin = null; view.turnQ.length = 0;
        if (soundOn()) sounds.rune(); else if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        replay(fxEl.flash, 'is-on');
        if (G && G.relic && !reducedMotion()) {   // a burst of golden sparks out of the relic
          const v = new Float32Array(G.sparksN * 3);
          for (let n = 0; n < G.sparksN; n++) {
            const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2 - 0.2, sp = 0.8 + Math.random() * 1.4;
            v[n * 3] = Math.cos(a) * Math.cos(e) * sp; v[n * 3 + 1] = Math.sin(e) * sp + 0.9; v[n * 3 + 2] = Math.sin(a) * Math.cos(e) * sp;
          }
          view.burst = { t: 0, o: G.relic.position.clone(), v };
        }
        S.runes = i + 1;
        S.water = 3;
        S.wh = 1;
        S.ss = S.trail.length - 1;
        S.cp = S.pos.slice();
        S.ch = S.h;
        paintHud();
        runeFly(i, ca.letter);
        subtitle(`The ${ordinal(i)} rune: ${ca.letter}`, 4);
        say(ca.found);
        clearControls();
        btn('Walk on', () => {
          dropRelic();
          showChoice();
        }, { cls: 'is-way' });
        save();
        const first = el.controls.querySelector('button');
        if (first) setTimeout(() => first.focus(), 30);
      }

      // ---- Out of the gorge ----
      function victory(live) {
        view.phase = 'done';
        paintArrows([]);
        clearControls();
        say("We are out, Silvia! The cliffs fall away on both sides and the light is so bright that I have to close my eyes. Ahead lies a white plain of salt, flat as a table, all the way to the horizon: the Salt Playa. Far away I can see the ruins of an old nomad camp. And above the gate, cut into the rock, there is something for your Cipher Ledger! Nobody crosses that salt at midday, so I will rest in the shade of the Oasis Gate and tell you everything on the Field Wire.");
        where('Out of the canyon, at the edge of the Salt Playa.');
        if (el.victory) el.victory.style.display = 'block';
        if (soundOn()) sounds.win(); else if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        confetti();
        const first = !isDone();
        put('order_whispering_chasm_completed', 'true');
        put('order_desert_station_active', '11');
        save();
        hints.refresh();
        if (first && typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (first && typeof window.selectMapNode === 'function') window.selectMapNode(11, false);
        if (first) document.dispatchEvent(new Event('chasm:cleared'));   // Hermes has news on the Field Wire
        paintHud();
        // Live, the reward rises over the canyon once the confetti has had its moment
        if (live) setTimeout(() => { if (view.phase === 'done' && modal.style.display !== 'none') showReward(); }, reducedMotion() ? 300 : 2600);
        if (el.runes) [...el.runes.children].forEach((r, n) => { r.style.animationDelay = `${n * 120}ms`; replay(r, 'is-wave'); });
      }

      // =====================================================================
      // The loop
      // =====================================================================
      let raf = 0, last = 0;
      const camPos = { x: 0, y: 0, z: 0, ok: false };
      function frame(now) {
        raf = requestAnimationFrame(frame);
        if (!G || modal.style.display === 'none' || modal.classList.contains('closing') || document.hidden) return;   // no frames while it fades out
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
        const swing = moving && !rm ? Math.sin(now / 130) : 0;
        G.legL.position.z = swing * 0.17; G.legR.position.z = -swing * 0.17;
        G.legL.position.y = Math.max(0, swing) * 0.05; G.legR.position.y = Math.max(0, -swing) * 0.05;
        G.staff.rotation.x = swing * 0.22;
        G.cloak.rotation.z = swing * 0.025;
        G.lamp.rotation.z = rm ? 0 : Math.sin(now / 260) * 0.07 + swing * 0.08;
        H.position.y = moving && !rm ? Math.abs(Math.sin(now / 130)) * 0.035 : 0;
        const flick = 1.25 + Math.sin(now / 90) * 0.08 + Math.sin(now / 37) * 0.05;
        G.lantern.intensity = flick;
        G.lantern.position.copy(G.flame.getWorldPosition(new T.Vector3()));
        G.shafts.visible = G.camera.position.y < 5;   // seen from above at a fork, the shafts of light would read as ribbons

        // Camera: behind and above him; closer and lower in front of a relic
        const yaw = view.yaw + view.look;
        const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
        const relic = view.phase === 'relic' || view.phase === 'found';
        const stone = relic ? G.stoneAt[key(S.pos[0], S.pos[1])] : null;
        H.visible = !stone;
        // At a fork the camera rises, so the mouths of the side passages and the arrows on the sand are in view
        const fork = view.phase === 'choose' || view.phase === 'setback';
        let tx = view.x - fx * (fork ? 1.6 : 3.8), ty = fork ? 8.4 : 2.6, tz = view.z - fz * (fork ? 1.6 : 3.8);
        let lx = view.x + fx * (fork ? 0.6 : 3), ly = fork ? 0 : 1.2, lz = view.z + fz * (fork ? 0.6 : 3);
        if (stone) {
          tx = view.x - fx * 1.5; ty = 1.6; tz = view.z - fz * 1.5;
          lx = stone.x; ly = 0.95; lz = stone.z;
        }
        const k = camPos.ok && !rm ? Math.min(1, dt * 4) : 1;
        camPos.x += (tx - camPos.x) * k; camPos.y += (ty - camPos.y) * k; camPos.z += (tz - camPos.z) * k; camPos.ok = true;
        G.camera.position.set(camPos.x, camPos.y, camPos.z);
        G.camera.lookAt(lx, ly, lz);
        if (view.shake > 0) {   // a wrong turn jolts the picture for a moment
          if (!rm) { const a = view.shake * view.shake * 0.12; G.camera.position.x += (Math.random() - 0.5) * a; G.camera.position.y += (Math.random() - 0.5) * a; }
          view.shake = Math.max(0, view.shake - dt * 2.2);
        }

        // The relic floats in front of the camera; the letter must face it for a moment
        if (G.relic) {
          const f = new T.Vector3(0, 0, -1).applyQuaternion(G.camera.quaternion);
          G.relic.position.copy(G.camera.position).addScaledVector(f, 1.3);
          G.relic.position.y += 0.08;
          G.relicLight.position.copy(G.camera.position).add(new T.Vector3(0.5, 0.6, 0.2));
          if (view.phase === 'relic') {
            // The arrow buttons and keys turn it smoothly; a flick of the finger keeps it spinning a little
            const tq = view.turnQ[0];
            if (tq) {
              const step = rm ? tq.left : tq.left * Math.min(1, dt * 14);
              rotateRelic(tq.ax, step); tq.left -= step;
              if (Math.abs(tq.left) < 0.002) view.turnQ.shift();
            }
            if (view.spin && !dragging) {
              rotateRelic('y', view.spin.y * dt); rotateRelic('x', view.spin.x * dt);
              const k2 = Math.pow(0.03, dt); view.spin.x *= k2; view.spin.y *= k2;
              if (Math.abs(view.spin.x) + Math.abs(view.spin.y) < 0.05) view.spin = null;
            }
          }
          // Warmer as the letter turns towards her: the gauge fills, the relic glows, a soft note at each quarter
          const warm = view.phase === 'found' ? 1 : Math.max(0, Math.min(1, (relicFacing() - 0.15) / 0.75));
          view.warm += (warm - view.warm) * Math.min(1, dt * 8);
          paintWarmth();
          G.relicLight.intensity = 0.9 + view.warm * 1.6;
          G.relicGlow.visible = true;
          G.relicGlow.position.copy(G.relic.position).addScaledVector(f, 0.35);
          G.relicGlow.material.opacity = 0.12 + view.warm * 0.55 + (view.phase === 'found' ? Math.sin(now / 240) * 0.08 : 0);
          G.relicGlow.scale.setScalar(1.1 + view.warm * 0.9);
          if (view.phase === 'relic' && !dragging && !view.spin && !view.turnQ.length) {
            if (relicFacing() > 0.9) { view.relicHold += dt; if (view.relicHold > 0.5) relicFound(); }
            else view.relicHold = 0;
          }
          if (view.phase === 'found') {
            // Once read, the relic settles with its rune upright and square to her, so an M never shows as a W
            const upright = G.camera.quaternion.clone().multiply(G.relic.userData.plate.quaternion.clone().invert());
            G.relic.quaternion.slerp(upright, Math.min(1, dt * 4));
          }
        } else { G.relicLight.intensity = 0; G.relicGlow.visible = false; }

        // Golden sparks thrown out by a rune when it is read
        if (view.burst) {
          const b = view.burst, sp = G.sparks.geometry.attributes.position;
          b.t += dt;
          for (let i = 0; i < G.sparksN; i++) {
            sp.setXYZ(i, b.o.x + b.v[i * 3] * b.t, b.o.y + b.v[i * 3 + 1] * b.t - 1.6 * b.t * b.t, b.o.z + b.v[i * 3 + 2] * b.t);
          }
          sp.needsUpdate = true;
          G.sparks.material.opacity = Math.max(0, 1 - b.t / 1.3);
          G.sparks.visible = true;
          if (b.t > 1.3) { view.burst = null; G.sparks.visible = false; }
        }

        // Arrows breathe; whisper dust drifts in
        G.arrows.children.forEach((a) => {
          // they spring out of the sand when he stops, and the one she points at grows and brightens
          const age = rm ? 1 : Math.min(1, Math.max(0, (performance.now() - a.userData.born) / 1000 - a.userData.n * 0.07) * 3.2);
          const pop = 1 + 2.7 * Math.pow(age - 1, 3) + 1.7 * Math.pow(age - 1, 2);   // ease out, with a little overshoot
          const hot = !a.userData.blocked && view.hot === a.userData.d;
          a.userData.h = (a.userData.h || 0) + ((hot ? 1 : 0) - (a.userData.h || 0)) * Math.min(1, dt * 10);
          a.scale.setScalar(1.35 * pop * (1 + a.userData.h * 0.3));
          if (!a.userData.blocked) a.material.opacity = Math.min(1, 0.6 + Math.sin(now / 300) * 0.3 + a.userData.h * 0.5);
        });
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

        if (G.motes) {
          const mp = G.motes.geometry.attributes.position, b0 = G.motesBase, t = now / 1000, wrap = (x) => ((x % 14) + 14) % 14;
          for (let i = 0; i < G.motesN; i++) {
            mp.setXYZ(i, view.x - 7 + wrap(b0[i * 3] + t * 0.22 + Math.sin(t * 0.4 + i) * 0.3),
              b0[i * 3 + 1] + Math.sin(t * 0.5 + i * 1.7) * 0.18, view.z - 7 + wrap(b0[i * 3 + 2] + t * 0.1));
          }
          mp.needsUpdate = true;
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
        view.spin = null; view.turnQ.length = 0;
        try { el.canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
      function onMove(e) {
        if (!dragging || !downAt) return;
        const dx = e.clientX - downAt.lx, dy = e.clientY - downAt.ly;
        downAt.lx = e.clientX; downAt.ly = e.clientY; downAt.t = performance.now();
        if (Math.abs(e.clientX - downAt.x) + Math.abs(e.clientY - downAt.y) > 6) downAt.moved = true;
        if (view.phase === 'relic') {
          rotateRelic('y', dx * 0.012); rotateRelic('x', dy * 0.012);
          const vx = Math.max(-8, Math.min(8, dy * 0.72)), vy = Math.max(-8, Math.min(8, dx * 0.72));   // radians a second, at ~60 moves a second
          view.spin = view.spin ? { x: view.spin.x * 0.5 + vx * 0.5, y: view.spin.y * 0.5 + vy * 0.5 } : { x: vx, y: vy };
        }
        else view.look = Math.max(-1.8, Math.min(1.8, view.look - dx * 0.006));
      }
      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        // a fling only when she lets go while still moving: held still first, the relic stays where she aimed it
        if (view.spin && (!downAt || !downAt.t || performance.now() - downAt.t > 90)) view.spin = null;
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
          turnSmooth(rel % 2 ? 'y' : 'x', [-0.35, 0.35, 0.35, -0.35][rel]);
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
        view.quiet = true;
        S = load();
        if (el.victory) el.victory.style.display = 'none';
        dropRelic();
        view.walk = null; view.look = 0; view.dust = null; view.water0 = undefined; camPos.ok = false;
        hideAlert();
        hideReward(true);
        placeHermes(S.trail[S.trail.length - 1], S.h);
        paintPrints();
        paintHud();
        const k = key(S.pos[0], S.pos[1]);
        if (isDone() && S.runes === 6 && S.pos[0] === EXIT[0] && S.pos[1] === EXIT[1]) {
          victory();
          say("We camp tonight at the mouth of the canyon, Silvia, with the white salt in front of us. When the wind blows down the gorge behind me, I still think I can hear the whispers. Tomorrow, the page “The Salt Playa (Dry Basin)” of your journal.");
        } else if (S.rest) rest();
        else if (k in cairnAt && cairnAt[k] === S.runes) startRelic(S.runes);
        else if (firstTime && !isDone()) showChoice("Silvia, I am standing at the North Portal. The canyon is only a crack in the red rock, so deep that the morning sun has not reached the bottom yet. The wind inside sounds like people talking quietly in the next room. Here is how we will do it: I walk, and you steer. Every time the gorge splits, I will stop and wait for your choice. Keep the page “The Whispering Chasm” of your journal in front of you, with the top of the page pointing north, and follow me with your pencil.");
        else showChoice(S.trail.length === 1 ? "I am back at the North Portal, Silvia, ready to go in again. Keep the page “The Whispering Chasm” of your journal in front of you, with the top of the page pointing north." : "I am still here, Silvia, exactly where you left me. Find my place in your journal and tell me which way to go.");
        // The first picture is drawn now (shaders, textures, shadows), so that slow first frame comes before the window fades in
        if (building && G) tick(performance.now(), 1 / 60);
        view.quiet = false;
        if (!raf) raf = requestAnimationFrame(frame);
        if (get(HOWTO_KEY) !== 'seen' && !isDone()) showHowto(0);
        else focusFirst();
      }
      // The first live control; at the way out (or while he rests) the victory card or the close button.
      // Focused at once: the first 3D frame can hold the page long enough for a timer to come too late.
      function focusFirst() {
        const first = [...el.controls.querySelectorAll('button:not([disabled])'), ...(el.victory ? el.victory.querySelectorAll('button') : []), el.close]
          .find((x) => x && x.offsetParent);
        if (first) first.focus({ preventScroll: true });
      }

      // ---- The reward: what the canyon gave her, shown once she walks out (and again from the victory card) ----
      const RELIC_ICON = {
        bell: '<path d="M-10 6 Q-11 -12 0 -12 Q11 -12 10 6 Z"/><path d="M-14 6 H14"/><circle cy="10" r="2.5"/><path d="M0 -12 V-16"/>',
        lamp: '<path d="M-13 2 Q0 13 13 2 Q3 -3 -13 2 Z"/><path d="M13 2 L17 -2"/><path d="M-3 -4 Q-1 -13 3 -7 Q2 -4 -3 -4 Z"/>',
        comb: '<path d="M-13 -7 H13 V-1 H-13 Z"/><path d="M-10 -1 V9 M-6 -1 V9 M-2 -1 V6 M2 -1 V9 M6 -1 V4 M10 -1 V9"/>',
        horn: '<path d="M-13 9 Q-9 -9 12 -11 L13 -4 Q-3 -3 -7 11 Z"/><path d="M-11 4 L-6 6"/>',
        key: '<circle cx="-8" r="5.5"/><path d="M-2.5 0 H14 M10 0 V5 M14 0 V6"/>',
        shell: '<path d="M0 11 L-13 -3 Q0 -15 13 -3 Z"/><path d="M0 11 L-6 -9 M0 11 L0 -11 M0 11 L6 -9"/>'
      };
      const reward = { box: null, back: null };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      // Her road from the North Portal to the Oasis Gate: the trail she walked, or (a save without one) the walkers' road
      function rewardRoute() {
        const t = S.trail || [];
        if (t.length > 20 && t[0] === key(START[0], START[1]) && t[t.length - 1] === key(EXIT[0], EXIT[1])) return t.map(at);
        // the same rules as the whispers: never over the road already walked, past no other cairn, out only at the end
        const stops = [START, ...CAIRNS.map((c) => [c.r, c.c]), EXIT], out = [START], walked = new Set([key(START[0], START[1])]);
        for (let i = 1; i < stops.length; i++) {
          const from = key(stops[i - 1][0], stops[i - 1][1]), goal = key(stops[i][0], stops[i][1]), prev = { [from]: -1 }, q = [from];
          while (q.length && !(goal in prev)) {
            const k = q.shift(), [r, c] = at(k);
            DIRS.forEach(([dr, dc]) => {
              const nk = key(r + dr, c + dc);
              if (!open(r + dr, c + dc) || nk in prev || walked.has(nk)) return;
              if (nk !== goal && ((nk in cairnAt) || (nk in decoyAt) || nk === key(EXIT[0], EXIT[1]))) return;
              prev[nk] = k; q.push(nk);
            });
          }
          const leg = [];
          for (let k = goal; k !== from && k !== undefined && k !== -1; k = prev[k]) leg.unshift(at(k));
          leg.forEach(([r, c]) => walked.add(key(r, c)));
          out.push(...leg);
        }
        return out;
      }
      function showReward() {
        const body = modal && modal.querySelector('.chasm3d-body');
        if (!body) return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', 'Your reward for the Whispering Chasm');
          body.appendChild(reward.box);
          // a click before it has all played shows everything at once
          reward.box.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast'); });
        }
        const quiet = reducedMotion();
        const mins = Math.max(0, Math.round(S.min - START_MIN));
        const time = `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min`;
        // The map: walls of the canyon, her road drawn in gold, each cairn lighting up as the line reaches it
        const route = rewardRoute(), DRAW0 = 0.7, DRAW = 2.8;
        const pts = route.map(([r, c]) => `${c + 0.5},${r + 0.5}`).join(' ');
        const reach = CAIRNS.map((c) => { const i = route.findIndex(([r, cc]) => r === c.r && cc === c.c); return DRAW0 + DRAW * Math.max(0, i) / Math.max(1, route.length - 1); });
        let walls = '';
        MAZE.forEach((row, r) => { for (let c = 0; c < N; c++) if (row[c] === '1') walls += `M${c} ${r}h1v1h-1z`; });
        const flawless = (S.fails || 0) === 0 && mins > 0;
        reward.box.innerHTML = `<div class="rw-rays" aria-hidden="true"></div>
          <div class="rw-sparks" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--a:${(i * 360 / 22).toFixed(0)}deg;--d:${(140 + (i % 5) * 40)}px;--t:${(0.9 + (i % 4) * 0.2).toFixed(1)}s"></i>`).join('')}</div>
          <div class="chasm3d-reward-card">
          <div class="chasm3d-reward-kicker">Station 10 · The Whispering Chasm</div>
          <h3 class="chasm3d-reward-title">Out of the Gorge!</h3>
          <p class="rw-sub">Six relics, six runes, and the way out. This is what the canyon gives you.</p>
          <div class="rw-grid">
            <section class="rw-map" aria-label="Your road through the canyon">
              <div class="rw-label">Your road through the canyon</div>
              <svg viewBox="-0.5 -0.5 26 26" aria-hidden="true">
                <path class="rw-walls" d="${walls}"/>
                <polyline class="rw-road-glow" points="${pts}" pathLength="1" style="--d0:${DRAW0}s;--dd:${DRAW}s"/>
                <polyline class="rw-road" points="${pts}" pathLength="1" style="--d0:${DRAW0}s;--dd:${DRAW}s"/>
                <circle class="rw-end" cx="${START[1] + 0.5}" cy="${START[0] + 0.5}" r="0.55"/>
                ${CAIRNS.map((c, i) => `<g class="rw-cairn" style="--t:${reach[i].toFixed(2)}s"><circle cx="${c.c + 0.5}" cy="${c.r + 0.5}" r="0.95"/><text x="${c.c + 0.5}" y="${c.r + 0.86}">${c.letter}</text></g>`).join('')}
                <circle class="rw-end rw-exit" cx="${EXIT[1] + 0.5}" cy="${EXIT[0] + 0.5}" r="0.7" style="--t:${(DRAW0 + DRAW).toFixed(2)}s"/>
              </svg>
              <div class="rw-ends"><span>▲ North Portal</span><span>Oasis Gate ▼</span></div>
              ${mins > 0 ? `<div class="chasm3d-reward-stats">
                <div><b data-count="${mins}" data-time="1">${time}</b><span>in the canyon</span></div>
                <div><b data-count="${S.fails || 0}">${S.fails || 0}</b><span>wrong turns</span></div>
                <div><b data-count="${S.heard || 0}">${S.heard || 0}</b><span>whispers heard</span></div>
              </div>` : ''}
              ${flawless ? '<div class="rw-flawless">✦ A flawless walk ✦</div>' : ''}
            </section>
            <section class="rw-loot">
              <div class="chasm3d-reward-relics">${CAIRNS.map((c, i) => `<div class="chasm3d-medal" style="--t:${reach[i].toFixed(2)}s">
                <svg viewBox="-20 -20 40 40" aria-hidden="true">${RELIC_ICON[c.relic]}</svg>
                <b>${c.letter}</b><small>${c.relic}</small></div>`).join('')}</div>
              <div class="chasm3d-reward-word"><span>The Nomad's Passphrase</span>
                <strong aria-label="MIRAGE">${'MIRAGE'.split('').map((l, i) => `<em style="--i:${i}">${l}</em>`).join('')}</strong>
                <small>Write it in the six boxes of the Nomad's Passphrase, on the page “The Whispering Chasm” of your journal.</small></div>
              <div class="rw-ledger">
                <div class="rw-seal" aria-hidden="true"><span>X</span></div>
                <div class="rw-ledger-text">
                  <div class="rw-ledger-kicker">The Cipher Ledger · a new letter</div>
                  <div class="rw-ledger-title">The Line of the Gate</div>
                  <div class="rw-eq" aria-label="X plus E equals 17"><i>X</i><u>+</u><i>E</i><u>=</u><b>17</b></div>
                  <p>Carved above the Oasis Gate. A letter of the secret alphabet you have never had before: work it out in your Cipher Ledger.</p>
                </div>
              </div>
              <div class="rw-next">Next · Station 11 · The Salt Playa</div>
            </section>
          </div>
          <div class="chasm3d-reward-actions">
            <button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>
            <button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay in the canyon</button>
          </div>
        </div>`;
        if (!rewardOpen()) reward.back = document.activeElement;
        reward.box.hidden = false;
        reward.box.classList.remove('is-fast');
        replay(reward.box, 'is-on');
        // a chime as the line reaches each cairn, a deep stamp for the seal of the new letter
        if (soundOn() && !quiet) {
          CAIRNS.forEach((c, i) => tone(NOTE[['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][i]], reach[i], 0.9, { gain: 0.07, type: 'triangle' }));
          ['E6', 'G6'].forEach((n, i) => tone(NOTE[n], DRAW0 + DRAW + 0.5 + i * 0.12, 1.1, { gain: 0.05 }));
          tone(110, 4.35, 0.5, { gain: 0.16, to: 55 });
          tone(NOTE.C6, 4.4, 1.4, { gain: 0.06, type: 'triangle' });
        }
        // the numbers count up once the road is drawn
        const counters = [...reward.box.querySelectorAll('[data-count]')];
        const fmt = (b, v) => (b.dataset.time ? `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, '0')} min` : String(v));
        if (!quiet) counters.forEach((b) => {
          const end = +b.dataset.count, t0 = performance.now() + 3600;
          b.textContent = fmt(b, 0);
          const step = (now) => {
            const k = reward.box.classList.contains('is-fast') ? 1 : Math.max(0, Math.min(1, (now - t0) / 900));
            b.textContent = fmt(b, Math.round(end * (1 - Math.pow(1 - k, 3))));
            if (k < 1 && rewardOpen()) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        reward.box.querySelector('.chasm3d-reward-wire').addEventListener('click', () => {
          hideReward(true);
          closeChasm();
          if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
          else { const tab = document.querySelector('[data-view="view-field-wire"]'); if (tab) tab.click(); }
        });
        reward.box.querySelector('.chasm3d-reward-stay').addEventListener('click', () => hideReward());
        reward.box.querySelector('.chasm3d-reward-wire').focus({ preventScroll: true });
      }
      function hideReward(quiet) {
        if (!rewardOpen()) return;
        reward.box.hidden = true;
        const back = reward.back;
        reward.back = null;
        if (quiet) return;
        if (back && document.contains(back) && back.offsetParent) back.focus({ preventScroll: true });
        else focusFirst();
      }

      // ---- How to play: three short pages, the first time she opens the canyon and whenever she presses ? ----
      const howto = { box: $('chasm3d-howto'), page: 0, back: null };
      const howtoPages = howto.box ? [...howto.box.querySelectorAll('.chasm3d-howto-page')] : [];
      const howtoOpen = () => !!howto.box && !howto.box.hidden;
      function showHowto(page) {
        if (!howto.box) return;
        const was = howtoOpen() ? howto.page : -1;
        if (!howtoOpen()) howto.back = document.activeElement;
        howto.page = Math.max(0, Math.min(howtoPages.length - 1, page));
        howtoPages.forEach((p, i) => { p.hidden = i !== howto.page; });
        howtoPages.forEach(p => p.classList.remove('is-fwd', 'is-back'));
        if (was >= 0 && was !== howto.page) replay(howtoPages[howto.page], howto.page > was ? 'is-fwd' : 'is-back');
        $('chasm3d-howto-count').textContent = `${howto.page + 1} of ${howtoPages.length}`;
        [...($('chasm3d-howto-dots')?.children || [])].forEach((d, i) => d.classList.toggle('is-on', i === howto.page));
        $('btn-howto-back').disabled = howto.page === 0;
        $('btn-howto-next').textContent = howto.page === howtoPages.length - 1 ? 'Start walking' : 'Next →';
        howto.box.hidden = false;
        $('btn-howto-next').focus({ preventScroll: true });
      }
      function hideHowto() {
        if (!howtoOpen()) return;
        howto.box.hidden = true;
        put(HOWTO_KEY, 'seen');
        const back = howto.back;
        howto.back = null;
        if (back && back.id !== 'btn-chasm-howto' && document.contains(back) && back.offsetParent) back.focus({ preventScroll: true });
        else focusFirst();
      }
      if (howto.box) {
        $('btn-howto-next').addEventListener('click', () => (howto.page === howtoPages.length - 1 ? hideHowto() : showHowto(howto.page + 1)));
        $('btn-howto-back').addEventListener('click', () => showHowto(howto.page - 1));
        $('btn-howto-skip').addEventListener('click', hideHowto);
        $('btn-chasm-howto').addEventListener('click', () => showHowto(0));
        // While it is open, keys belong to it: Escape closes only these pages, and the arrows do not walk Hermes.
        // Caught before the page's own listeners (the Hub's Escape would otherwise close the whole canyon).
        window.addEventListener('keydown', (e) => {
          if (rewardOpen() && modal.style.display !== 'none' && e.key !== 'Tab') { e.stopPropagation(); if (e.key === 'Escape') hideReward(); return; }
          if (!howtoOpen() || modal.style.display === 'none' || e.key === 'Tab') return;
          e.stopPropagation();
          if (e.key === 'Escape') hideHowto();
        }, true);
      }
      function closeChasm() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (view.walk) finishWalk();
        clearTimeout(rest.t);
        if (howto.box) howto.box.hidden = true;
        hideReward(true);
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); document.dispatchEvent(new Event('chasm:closed')); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      function walkAgain() {
        hideReward(true);
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
      if ($('btn-chasm-reward')) $('btn-chasm-reward').addEventListener('click', () => showReward());
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
