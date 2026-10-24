    // =========================================================================
    // Station 11 · The Salt Playa: "Measured Footsteps", a crossing behind Hermes over the salt of Sheet 10A (three.js)
    // =========================================================================
    // The journal sees from above, Hermes from the ground, and neither is enough alone. On the salt there are no
    // rows, no columns and no numbers, and the brine sinkholes look like firm crust (Sheet 10B: "sinkholes form
    // unseen"): only the printed grid shows them. Hermes faces south, so his left hand is east, the right of her page.
    // Each stride is tested with his staff: she holds to lean his weight and lets go in the measured band (Sheet 10B,
    // the Architect's note). A sinkhole swallows the staff and a skin of water; a slab that breaks the Law of the Basin
    // cracks; too heavy a step makes the crust groan. Only once he stands on a slab does he brush the salt and read
    // its letter, and see the crystal of its facets. The sun climbs, the haze thickens, and on Row V a mirage shines.
    (function initSaltPlaya() {
      const modal = document.getElementById('modal-salt-playa');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const el = {
        stage: $('playa3d-stage'), canvas: $('playa3d-canvas'), fade: $('playa3d-fade'), subtitle: $('playa3d-subtitle'),
        log: $('playa3d-log'), rose: $('playa3d-rose'), facing: $('playa3d-facing'), skins: $('playa3d-skins'), clock: $('playa3d-clock'),
        voice: $('playa3d-voice'), where: $('playa3d-where'), controls: $('playa3d-controls'),
        victory: $('playa-victory-card'), finish: $('btn-playa-finish'), again: $('btn-playa-again'), close: $('btn-close-playa')
      };
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const isDone = () => get('order_salt_playa_completed') === 'true';
      const soundOn = () => !(window.EclipseAmbience && window.EclipseAmbience.state().muted);
      const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const toast = (msg) => { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); };
      const WALK_KEY = 'order_playa_walk';
      const HOWTO_KEY = 'order_playa_howto';

      // ---- The slab grid exactly as printed on Sheet 10A (build_desert_odyssey_expanded.py · render_game_d2_salt_playa).
      // Each cell is [facets, letter]; null marks a brine sinkhole. Only one crossing keeps the Law, and it spells CRYSTAL.
      const GRID = [
        [[1, 'M'], [5, 'X'], [6, 'B'], [3, 'C'], [1, 'Q'], [6, 'Z'], [2, 'V']],
        [[4, 'G'], [2, 'E'], null, [6, 'K'], [4, 'R'], [1, 'J'], [5, 'U']],
        [[3, 'F'], null, [2, 'I'], [5, 'Y'], null, [2, 'P'], [6, 'D']],
        [[5, 'O'], [1, 'A'], [4, 'S'], [2, 'W'], null, [5, 'B'], [3, 'T']],
        [[2, 'L'], null, [3, 'T'], [6, 'H'], [1, 'N'], null, [6, 'M']],
        [[6, 'K'], [5, 'N'], null, [2, 'A'], [5, 'R'], [3, 'E'], [1, 'S']],
        [[3, 'P'], [1, 'Z'], [4, 'O'], [1, 'L'], null, [6, 'C'], [2, 'Y']]
      ];
      const ROWS = 7, START_COL = 3, KEYWORD = 'CRYSTAL';
      const SOLUTION = [3, 4, 3, 2, 2, 3, 3];
      const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
      const cell = (r, c) => GRID[r][c];
      const START_MIN = 6 * 60, MIN_PER_STRIDE = 14, REST_S = 45;
      // The row whose sinkhole the mirage covers: Row V, where the haze of mid-morning first plays tricks
      const MIRAGE_ROW = 4;

      const hints = window.EclipseHints.define({
        id: 's11-playa', station: 'Station 11', title: 'the salt crossing', group: 'desert',
        anchor: () => el.controls,
        solved: isDone,
        texts: [
          'Keep your pencil on the page “The Salt Playa (Dry Basin)” and move it every time Hermes moves. He faces south, so his left hand is east: the right-hand side of your page. On the salt he sees no numbers and no sinkholes. Only your page has them.',
          'Each stride goes one row south, straight or diagonal, onto a slab with exactly one facet more or one less than the slab he stands on, and never onto a [X]. Of the three slabs within his reach, only one keeps the Law each time. When he leans, hold until the needle is in the gold band and let go.',
          'Let us take the first strides together. Walk Hermes east along the edge to Column D, the fourth slab from the west: 3 facets, [C]. From there, in Row II, only Column E has 4 facets. For Hermes, who faces south, that is ahead and to his left, the south-east.'
        ]
      });

      // ---- State (saved at every stride, so she can close the Hub and come back to the same slab) ----
      let S = null;
      function fresh() {
        return { path: [], edge: 0, water: 3, min: START_MIN, fails: 0, sinks: 0, cracks: 0, heavy: 0, light: 0, revealed: {}, mirage: 0, rest: 0 };
      }
      function load() {
        try {
          const s = JSON.parse(get(WALK_KEY) || 'null');
          if (s && Array.isArray(s.path) && s.path.every((c, r) => c === SOLUTION[r])) return Object.assign(fresh(), s);
        } catch (e) {}
        return fresh();
      }
      function save() { put(WALK_KEY, JSON.stringify(S)); }
      const row = () => S.path.length;                                   // the row of the next stride
      const col = () => (S.path.length ? S.path[S.path.length - 1] : S.edge);
      const kOf = (r, c) => r * ROWS + c;
      // The slabs within reach of the next stride, west to east, with what the salt has already shown of them
      function reach() {
        const r = row(), c = col(), out = [];
        if (r >= ROWS) return out;
        const cols = r === 0 ? [c] : [c - 1, c, c + 1];
        cols.forEach((cc) => { if (cc >= 0 && cc < ROWS) out.push({ c: cc, shown: S.revealed[kOf(r, cc)] || '' }); });
        return out;
      }
      // What the slab truly is, for the stride from where he stands
      function judge(r, cc) {
        if (r === 0) return cc === START_COL ? 'good' : 'start';
        const to = cell(r, cc);
        if (!to) return 'sink';
        const from = cell(r - 1, col());
        return Math.abs(to[0] - from[0]) === 1 ? 'good' : 'crack';
      }

      // =====================================================================
      // The 3D salt
      // =====================================================================
      // East is +x (column A in the west, G in the east), south is +z (Row I nearest the edge). Hermes faces south,
      // so the camera behind him looks south too, and the west comes out on the right of the screen.
      const CELL = 3.0, PLATE = 2.55, SLAB_TOP = 0.22, FACE = SLAB_TOP + 0.04, STAND = 0.45;   // FACE: the top of a slab with its bevel   // he stands on the north half of a slab, its letter before his boots
      const X = (c) => (c - START_COL) * CELL, Z = (r) => r * CELL, EDGE_Z = -CELL * 0.95;
      let G = null;
      const P = window.EclipsePaint;   // the painted look of the Whispering Chasm (s10-whispering-chasm.js)

      const VORONOI = `
    vec2 sHash(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
    // distance to the nearest border of the salt polygons (Inigo Quilez), and a random value per polygon
    vec2 sVoro(vec2 x) {
      vec2 n = floor(x), f = fract(x), mg = vec2(0.0), mr = vec2(0.0);
      float md = 8.0;
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j)), o = 0.5 + 0.38 * sin(6.2831 * sHash(n + g)), r = g + o - f;
        float d = dot(r, r);
        if (d < md) { md = d; mr = r; mg = g; }
      }
      float id = sHash(n + mg).x;
      md = 8.0;
      for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
        vec2 g = mg + vec2(float(i), float(j)), o = 0.5 + 0.38 * sin(6.2831 * sHash(n + g)), r = g + o - f;
        if (dot(mr - r, mr - r) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
      }
      return vec2(md, id);
    }
`;

      function buildWorld() {
        const T = window.THREE;
        if (!P) return null;
        if (T.ColorManagement) T.ColorManagement.legacyMode = false;
        let renderer;
        try {
          renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' });
        } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.outputEncoding = T.sRGBEncoding;
        renderer.toneMapping = T.NoToneMapping;
        const scene = new T.Scene();
        scene.fog = new T.Fog(0xf6e4dc, 14, 60);
        const camera = new T.PerspectiveCamera(58, 16 / 10, 0.1, 420);
        const rand = P.rng(1110);
        const ucol = (hex) => ({ value: new T.Color(hex) });
        const uTime = { value: 0 };

        // Sky: a dome painted by the clock, the rising sun, a few long dawn clouds
        const skyGeo = new T.SphereGeometry(300, 32, 14);
        skyGeo.setAttribute('color', new T.BufferAttribute(new Float32Array(skyGeo.attributes.position.count * 3), 3));
        const sky = new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false, toneMapped: false }));
        scene.add(sky);
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,252,236,1)'); gr.addColorStop(0.25, 'rgba(255,230,170,0.85)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const sunDisc = new T.Sprite(new T.SpriteMaterial({ map: glowTex, fog: false, depthWrite: false, transparent: true, toneMapped: false }));
        sunDisc.scale.set(46, 46, 1);
        scene.add(sunDisc);
        const cloudTex = P.canvasTex(256, 96, (g, w, h) => {
          const r2 = P.rng(73);
          for (let i = 0; i < 11; i++) {
            const x = 20 + i * 21 + (r2() - 0.5) * 8, rr = 10 + Math.sin(i / 10 * Math.PI) * 18 + r2() * 6;
            g.fillStyle = '#d9a6c8'; g.beginPath(); g.ellipse(x, h - 30 - rr * 0.3 + 5, rr * 1.4, rr * 0.55, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#fff1e6'; g.beginPath(); g.ellipse(x - 2, h - 32 - rr * 0.3, rr * 1.25, rr * 0.48, 0, 0, Math.PI * 2); g.fill();
          }
        });
        for (let i = 0; i < 6; i++) {
          const cl = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, fog: false, depthWrite: false, transparent: true, toneMapped: false, opacity: 0.85 }));
          const az = -0.9 + i * 0.36 + rand() * 0.2, elv = 0.06 + rand() * 0.12, s = 80 + rand() * 50;
          cl.position.set(Math.sin(az) * Math.cos(elv) * 260, Math.sin(elv) * 260, Math.cos(az) * Math.cos(elv) * 260);
          cl.scale.set(s, s * 0.38, 1);
          sky.add(cl);
        }

        // Light: a pale sky above, lavender bounce from the white salt (shade is coloured, never grey), the low sun
        const hemi = new T.HemisphereLight(0xfff4ea, 0x9a88cc, 0.85);
        scene.add(hemi);
        const sun = new T.DirectionalLight(0xffe2c0, 1.2);
        sun.castShadow = true;
        sun.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 120 });
        sun.shadow.bias = -0.0015;
        sun.shadow.normalBias = 0.03;
        sun.shadow.camera.updateProjectionMatrix();
        scene.add(sun); scene.add(sun.target);

        // The playa: polygons of white halite to the horizon, their buckled ridges lit, lavender in the cracks,
        // glints of salt that come and go (Sheet 10B, Fig. I: the 120° triple junctions)
        const crust = P.worldPainted(P.toon(), {
          uSalt: ucol(0xf4ece4), uSaltLo: ucol(0xe2d2d4), uRidge: ucol(0xffffff), uCrack: ucol(0x9c88b8), uWarm: ucol(0xf6d2b0), uTime
        }, 'uniform vec3 uSalt, uSaltLo, uRidge, uCrack, uWarm;\nuniform float uTime;\n' + VORONOI, `
    vec2 v = sVoro(vWp.xz * 0.55);
    vec3 c = mix(uSalt, uSaltLo, v.y * 0.5);
    c = mix(c, uRidge, smoothstep(0.11, 0.04, v.x) * 0.9);
    c = mix(c, uCrack, smoothstep(0.035, 0.0, v.x) * 0.75);
    float far = smoothstep(30.0, 140.0, length(vWp.xz));
    c = mix(c, uWarm, far * 0.35);
    float g = fract(sin(dot(floor(vWp.xz * 7.0), vec2(12.9898, 78.233))) * 43758.5453);
    c += vec3(0.45) * step(0.9965, fract(g + uTime * 0.07)) * (1.0 - far);
    diffuseColor.rgb *= c;`);
        const ground = new T.Mesh(new T.PlaneGeometry(700, 700), crust);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, 0, 60);
        ground.receiveShadow = true;
        scene.add(ground);

        // The slabs of the crossing: thick plates of salt, slightly irregular, a little raised above the crust
        const slabMat = P.worldPainted(P.toon(), {
          uTop: ucol(0xfdf8f2), uTopLo: ucol(0xeee2dc), uSide: ucol(0xcfb6c6), uFoot: ucol(0x8f7aac), uRidge: ucol(0xffffff), uCrack: ucol(0xa894c4)
        }, 'uniform vec3 uTop, uTopLo, uSide, uFoot, uRidge, uCrack;\n' + VORONOI, `
    vec2 v = sVoro(vWp.xz * 1.6 + 11.0);
    vec3 top = mix(uTop, uTopLo, v.y * 0.6);
    top = mix(top, uRidge, smoothstep(0.08, 0.03, v.x) * 0.7);
    top = mix(top, uCrack, smoothstep(0.025, 0.0, v.x) * 0.45);
    float h = clamp(vWp.y / 0.22, 0.0, 1.0);
    vec3 side = mix(uFoot, uSide, h);
    diffuseColor.rgb *= mix(side, top, smoothstep(0.82, 0.97, h));`);
        const slabs = [];
        for (let r = 0; r < ROWS; r++) {
          slabs.push([]);
          for (let c = 0; c < ROWS; c++) {
            const sh = new T.Shape(), n = 9, rr2 = P.rng(r * 31 + c * 7 + 5);
            for (let i = 0; i < n; i++) {
              const a = (i / n) * Math.PI * 2 + Math.PI / n, rad = PLATE * 0.6 * (0.9 + rr2() * 0.12);
              const px = Math.cos(a) * rad * 1.02, pz = Math.sin(a) * rad;
              if (i) sh.lineTo(px, pz); else sh.moveTo(px, pz);
            }
            sh.closePath();
            const geo = new T.ExtrudeGeometry(sh, { depth: SLAB_TOP - 0.04, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.08, bevelSegments: 2, curveSegments: 4 });
            geo.rotateX(Math.PI / 2);
            geo.translate(0, SLAB_TOP, 0);
            const m = new T.Mesh(geo, slabMat);
            m.position.set(X(c), 0, Z(r));
            m.rotation.y = (rr2() - 0.5) * 0.3;
            m.castShadow = true; m.receiveShadow = true;
            m.userData = { r, c };
            scene.add(m);
            slabs[r].push({ mesh: m, letter: null, crystal: null, crack: null, pool: null, base: m.position.clone(), rot: m.rotation.y });
          }
        }

        // The letter cut into each slab under the salt (readable from behind Hermes), hidden until he brushes it
        const letterMat = (letter) => new T.MeshBasicMaterial({
          map: P.canvasTex(128, 128, (g, w) => {
            g.clearRect(0, 0, w, w);
            g.font = '700 84px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillText(letter, w / 2 + 3, w / 2 + 6);
            g.fillStyle = 'rgba(92,64,120,0.95)'; g.fillText(letter, w / 2, w / 2 + 3);
          }), transparent: true, opacity: 0, depthWrite: false
        });
        const letterGeo = new T.PlaneGeometry(1.0, 1.0);
        letterGeo.rotateX(-Math.PI / 2);
        letterGeo.rotateY(Math.PI);   // its top points south, away from the camera behind him
        // Cracks that run through a slab the Law refuses (or a step too heavy)
        const crackTex = P.canvasTex(256, 256, (g, w) => {
          g.clearRect(0, 0, w, w);
          const r2 = P.rng(404);
          g.lineCap = 'round';
          for (let k = 0; k < 9; k++) {
            let x = w / 2, y = w / 2, a = k / 9 * Math.PI * 2 + r2() * 0.4;
            g.beginPath(); g.moveTo(x, y);
            for (let s = 0; s < 7; s++) { a += (r2() - 0.5) * 0.9; x += Math.cos(a) * 17; y += Math.sin(a) * 17; g.lineTo(x, y); }
            g.strokeStyle = 'rgba(70,50,96,0.85)'; g.lineWidth = 4.5 - k * 0.25; g.stroke();
          }
        });
        const crackGeo = new T.PlaneGeometry(PLATE * 1.05, PLATE * 1.05);
        crackGeo.rotateX(-Math.PI / 2);
        // Brine where a sinkhole broke through: dark, glassy, with slow rings
        const poolMat = new T.ShaderMaterial({
          transparent: true, depthWrite: false, uniforms: { uTime, uA: { value: 0 } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: `uniform float uTime, uA; varying vec2 vUv;
            void main(){ vec2 p = vUv - 0.5; float d = length(p) * 2.0; if (d > 1.0) discard;
              float ring = sin(d * 18.0 - uTime * 1.6) * 0.5 + 0.5;
              vec3 c = mix(vec3(0.06, 0.26, 0.30), vec3(0.16, 0.46, 0.50), (1.0 - d) * 0.7 + ring * 0.12);
              c += vec3(0.85, 0.95, 1.0) * pow(max(0.0, sin(p.x * 9.0 - p.y * 5.0 + uTime * 0.7)), 12.0) * 0.25 * (1.0 - d);
              c = mix(c, vec3(0.96, 0.93, 0.92), smoothstep(0.78, 0.95, d));
              gl_FragColor = vec4(c, uA * smoothstep(1.0, 0.95, d)); }`
        });

        // The crystal of a slab's facets: as many halite prisms as the page counts, rising when he stands on it
        const prismMat = P.rim(P.toon({ color: 0xf6e8f2, emissive: 0x4a2a5a, emissiveIntensity: 0.25 }), 0xffe6ff, 0.8);
        const prismGeo = new T.CylinderGeometry(0.07, 0.1, 0.42, 6);
        prismGeo.translate(0, 0.21, 0);
        function makeCrystal(n) {
          const g = new T.Group();
          for (let i = 0; i < n; i++) {
            const p = new T.Mesh(prismGeo, prismMat);
            const a = (i / n) * Math.PI * 2;
            p.position.set(Math.cos(a) * (n > 1 ? 0.11 : 0), 0, Math.sin(a) * (n > 1 ? 0.11 : 0));
            p.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45);
            p.scale.y = 0.75 + (i % 3) * 0.2;
            p.castShadow = true;
            g.add(p);
          }
          g.scale.setScalar(0.001);
          return g;
        }

        // The North Edge: a bank of hard sand where the old track from the Oasis Gate meets the salt
        const bankMat = P.rim(P.toon({ color: 0xe8c49a }), 0xfff0dc, 0.25);
        const bank = new T.Mesh(new T.BoxGeometry(ROWS * CELL + 14, SLAB_TOP, 2.6), bankMat);
        bank.position.set(0, SLAB_TOP / 2, EDGE_Z - 0.6);
        bank.receiveShadow = true;
        scene.add(bank);
        for (let i = 0; i < 26; i++) {   // pebbles and tufts along it
          const s = 0.1 + rand() * 0.22, peb = new T.Mesh(new T.DodecahedronGeometry(s, 0), P.rim(P.toon({ color: rand() > 0.5 ? 0xc98c62 : 0xb7785a }), 0xffe0c0, 0.2));
          peb.position.set(-ROWS * CELL / 2 - 6 + rand() * (ROWS * CELL + 12), SLAB_TOP + s * 0.4, EDGE_Z - 1.6 + rand() * 1.4);
          peb.castShadow = true; scene.add(peb);
        }
        // The red rocks of the Oasis Gate behind him, to the north
        const rockMat = P.rim(P.toon({ color: 0xc8643e }), 0xffc89a, 0.35);
        for (let i = 0; i < 14; i++) {
          const w = 4 + rand() * 7, h = 6 + rand() * 12, d = 4 + rand() * 6;
          const rock = new T.Mesh(new T.BoxGeometry(w, h, d), rockMat);
          const gap = i < 7 ? -1 : 1;
          rock.position.set(gap * (7 + (i % 7) * 6 + rand() * 3), h / 2, EDGE_Z - 9 - rand() * 10);
          rock.rotation.y = (rand() - 0.5) * 0.5;
          rock.castShadow = true; scene.add(rock);
        }

        // The old surveyor's tripod at the west end of the edge, its wood bleached by the salt, a rag on its head
        const tripod = new T.Group();
        const bleached = P.rim(P.toon({ color: 0xece2d2 }), 0xffffff, 0.3), brass = P.rim(P.toon({ color: 0xc89a48 }), 0xfff0b0, 0.6);
        [0, 1, 2].forEach((i) => {
          const a = i / 3 * Math.PI * 2, leg = new T.Mesh(new T.CylinderGeometry(0.03, 0.045, 2.0, 6), bleached);
          leg.position.set(Math.cos(a) * 0.38, 0.95, Math.sin(a) * 0.38);
          leg.rotation.set(Math.sin(a) * 0.36, 0, -Math.cos(a) * 0.36);
          leg.castShadow = true; tripod.add(leg);
        });
        const head = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.08, 14), brass); head.position.y = 1.92; tripod.add(head);
        const scope = new T.Mesh(new T.CylinderGeometry(0.035, 0.05, 0.5, 10), brass); scope.rotation.z = Math.PI / 2; scope.position.y = 2.06; tripod.add(scope);
        const rag = new T.Mesh(new T.PlaneGeometry(0.5, 0.26, 6, 1), new T.MeshLambertMaterial({ color: 0xb2423a, side: T.DoubleSide }));
        rag.position.set(0.28, 1.86, 0); tripod.add(rag);
        tripod.position.set(X(0) - 1.6, SLAB_TOP, EDGE_Z - 0.5);
        scene.add(tripod);

        // The Sentinel Mesa on the southern horizon (Sheet 10A, "Southern Prospect"), with lesser buttes: far,
        // in the haze, painted in bands of rose and lilac
        function butte(x, z, w, d, h, tiers) {
          const g = new T.Group();
          for (let t = 0; t < tiers; t++) {
            const k = 1 - t * 0.12, geo = new T.CylinderGeometry(w * k * 0.92, w * k, h / tiers, 9, 1);
            geo.scale(1, 1, d / w);
            const cols = new Float32Array(geo.attributes.position.count * 3), cc = new T.Color(), p = geo.attributes.position;
            for (let i = 0; i < p.count; i++) {
              const up = (p.getY(i) / (h / tiers) + 0.5 + t) / tiers;
              cc.setHSL(0.98 - up * 0.06, 0.38, 0.62 + up * 0.14, 'srgb');
              cols.set([cc.r, cc.g, cc.b], i * 3);
            }
            geo.setAttribute('color', new T.BufferAttribute(cols, 3));
            const m = new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, fog: false }));
            m.position.y = h / tiers * (t + 0.5);
            g.add(m);
          }
          g.position.set(x, 0, z);
          scene.add(g);
          return g;
        }
        butte(46, 190, 34, 18, 30, 3);
        butte(-60, 230, 16, 12, 18, 2);
        butte(-14, 260, 10, 8, 12, 2);
        butte(110, 250, 20, 10, 16, 2);

        // Heat haze over the far salt: wide pale bands that ripple, thicker as the morning wears on
        const hazeMat = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false, uniforms: { uTime, uHeat: { value: 0 } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: `uniform float uTime, uHeat; varying vec2 vUv;
            void main(){ float w = sin(vUv.x * 40.0 + uTime * 1.6 + sin(vUv.y * 20.0 + uTime) * 2.0) * 0.5 + 0.5;
              float band = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
              gl_FragColor = vec4(vec3(1.0, 0.97, 0.94), band * (0.12 + 0.4 * uHeat) * (0.7 + 0.3 * w)); }`
        });
        const haze = new T.Mesh(new T.PlaneGeometry(500, 10), hazeMat);
        haze.position.set(0, 3.5, 120);
        scene.add(haze);

        // The mirage: a sheet of shining water laid over a slab that is anything but (Row V)
        const mirageMat = new T.ShaderMaterial({
          transparent: true, depthWrite: false, uniforms: { uTime, uA: { value: 0 } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: `uniform float uTime, uA; varying vec2 vUv;
            void main(){ vec2 p = vUv - 0.5; float d = length(p * vec2(1.0, 1.6)) * 2.0; if (d > 1.0) discard;
              float s = sin(p.y * 60.0 + uTime * 3.0 + sin(p.x * 18.0 + uTime * 1.3) * 1.5) * 0.5 + 0.5;
              vec3 c = mix(vec3(0.22, 0.52, 0.88), vec3(0.72, 0.9, 1.0), s * 0.7 + (1.0 - d) * 0.2);
              gl_FragColor = vec4(c, uA * smoothstep(1.0, 0.45, d) * (0.7 + 0.2 * s)); }`
        });
        const mirage = new T.Mesh(new T.PlaneGeometry(CELL * 1.9, CELL * 1.5), mirageMat);
        mirage.rotation.x = -Math.PI / 2;
        mirage.visible = false;
        scene.add(mirage);

        // Rings on the slabs within his reach (they rise when he stops; the one she points at brightens)
        const ringGeo = new T.RingGeometry(PLATE * 0.42, PLATE * 0.5, 40);
        ringGeo.rotateX(-Math.PI / 2);
        const markers = new T.Group();
        scene.add(markers);

        // Footprints on the salt where he has stood
        const printTex = P.canvasTex(32, 64, (g, w, h) => {
          g.clearRect(0, 0, w, h);
          g.fillStyle = 'rgba(120,96,130,0.55)';
          g.beginPath(); g.ellipse(w / 2, h * 0.32, w * 0.36, h * 0.24, 0, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.ellipse(w / 2, h * 0.76, w * 0.28, h * 0.16, 0, 0, Math.PI * 2); g.fill();
        });
        const printGeo = new T.PlaneGeometry(0.2, 0.36);
        printGeo.rotateX(-Math.PI / 2);
        const prints = new T.InstancedMesh(printGeo, new T.MeshBasicMaterial({ map: printTex, transparent: true, depthWrite: false }), 40);
        prints.count = 0;
        prints.renderOrder = 2;
        scene.add(prints);

        // Salt glitter that hangs in the light around him, and shards (or brine) thrown up by a slab
        const motesN = lowPower ? 90 : 200, motesBase = new Float32Array(motesN * 3), mr = P.rng(77);
        for (let i = 0; i < motesN; i++) { motesBase[i * 3] = mr() * 16; motesBase[i * 3 + 1] = 0.2 + mr() * 3.5; motesBase[i * 3 + 2] = mr() * 16; }
        const motesGeo = new T.BufferGeometry();
        motesGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(motesN * 3), 3));
        const motes = new T.Points(motesGeo, new T.PointsMaterial({ map: glowTex, color: 0xfff6ee, size: 0.07, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending }));
        motes.frustumCulled = false;
        scene.add(motes);
        const burstN = 60;
        const burstGeo = new T.BufferGeometry();
        burstGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(burstN * 3), 3));
        const burst = new T.Points(burstGeo, new T.PointsMaterial({ map: glowTex, color: 0xffffff, size: 0.12, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
        burst.frustumCulled = false;
        burst.visible = false;
        scene.add(burst);

        // Hermes: the Cartographer of Distant Light, as in the canyon. In the daylight his lantern is out.
        const H = P.buildHermes(T, glowTex);
        H.flame.visible = false;
        scene.add(H.hermes);

        return { T, renderer, scene, camera, sky, sunDisc, hemi, sun, uTime, slabs, letterMat, letterGeo, crackTex, crackGeo, poolMat, makeCrystal,
                 hazeMat, mirage, mirageMat, ringGeo, markers, prints, motes, motesBase, motesN, burst, burstN, rag, glowTex,
                 hermes: H.hermes, legL: H.legL, legR: H.legR, staff: H.staff, lamp: H.lamp, cloak: H.cloak, lowPower };
      }

      // ---- What each slab has shown: its letter and crystal, its cracks, its brine ----
      function showLetter(r, c, instant) {
        if (!G) return;
        const s = G.slabs[r][c];
        if (!s.letter) {
          s.letter = new G.T.Mesh(G.letterGeo, G.letterMat(cell(r, c)[1]));
          s.letter.position.set(X(c) - 0.88, FACE + 0.012, Z(r) + 0.32);   // at his right boot (west), where the camera behind him sees it
          s.letter.renderOrder = 3;
          G.scene.add(s.letter);
          s.crystal = G.makeCrystal(cell(r, c)[0]);
          s.crystal.position.set(X(c) + 0.82, FACE, Z(r) + 0.2);
          G.scene.add(s.crystal);
        }
        s.show = instant ? 1 : 0;
        if (instant) { s.letter.material.opacity = 1; s.crystal.scale.setScalar(1); }
      }
      function showCrack(r, c, instant) {
        if (!G) return;
        const s = G.slabs[r][c];
        if (!s.crack) {
          s.crack = new G.T.Mesh(G.crackGeo, new G.T.MeshBasicMaterial({ map: G.crackTex, transparent: true, opacity: 0, depthWrite: false }));
          s.crack.position.set(X(c), FACE + 0.015, Z(r));
          s.crack.rotation.y = s.rot;
          s.crack.renderOrder = 3;
          G.scene.add(s.crack);
        }
        s.cracked = instant ? 1 : 0.001;
        if (instant) s.crack.material.opacity = 0.9;
        s.mesh.position.y = -0.04;
      }
      function showSink(r, c, instant) {
        if (!G) return;
        const s = G.slabs[r][c];
        if (!s.pool) {
          s.pool = new G.T.Mesh(new G.T.CircleGeometry(PLATE * 0.62, 36), G.poolMat.clone());
          s.pool.material.uniforms.uTime = G.uTime;
          s.pool.rotation.x = -Math.PI / 2;
          s.pool.position.set(X(c), 0.05, Z(r));
          G.scene.add(s.pool);
        }
        s.sunk = instant ? 1 : 0.001;
        if (instant) applySink(s, 1);
      }
      function applySink(s, k) {
        s.mesh.position.y = -0.55 * k;
        s.mesh.rotation.z = 0.32 * k;
        s.mesh.rotation.x = -0.18 * k;
        if (s.pool) s.pool.material.uniforms.uA.value = Math.min(1, k * 1.3);
      }
      function paintSlabs() {
        if (!G) return;
        G.slabs.forEach((rowS, r) => rowS.forEach((s, c) => {
          s.mesh.position.copy(s.base); s.mesh.rotation.set(0, s.rot, 0);
          [s.letter, s.crystal, s.crack, s.pool].forEach((m) => { if (m) { G.scene.remove(m); } });
          s.letter = s.crystal = s.crack = s.pool = null; s.show = s.cracked = s.sunk = 0;
        }));
        S.path.forEach((c, r) => showLetter(r, c, true));
        Object.keys(S.revealed).forEach((k) => {
          const r = Math.floor(k / ROWS), c = k % ROWS;
          if (S.revealed[k] === 'sink') showSink(r, c, true); else showCrack(r, c, true);
        });
      }
      function paintPrints() {
        if (!G) return;
        const T = G.T, m4 = new T.Matrix4(), q = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI), v = new T.Vector3(), one = new T.Vector3(1, 1, 1);
        let n = 0;
        S.path.forEach((c, r) => {
          [[-0.16, -0.95], [0.16, -0.6]].forEach(([sx, sz]) => {
            m4.compose(v.set(X(c) + sx, FACE + 0.01, Z(r) + sz), q, one);
            G.prints.setMatrixAt(n++, m4);
          });
        });
        G.prints.count = n;
        G.prints.instanceMatrix.needsUpdate = true;
      }

      // ---- Time of day: the sun climbs out of the east, the salt turns from rose to blinding white ----
      const heat = () => Math.max(0, Math.min(1, (S.min - START_MIN) / 300));   // 06:00 → 11:00
      function paintSky() {
        const T = G.T, k = heat();
        const el2 = 0.05 + k * 0.95, az = 0.35 + k * 0.9;   // from low in the east-south-east towards the south
        const dir = new T.Vector3(Math.cos(az) * Math.cos(el2), Math.sin(el2), Math.sin(az) * Math.cos(el2));
        const horizon = new T.Color().setHSL(0.04 + 0.06 * k, 0.85 - 0.35 * k, 0.74 + 0.16 * k, 'srgb');
        const zenith = new T.Color().setHSL(0.66 - 0.08 * k, 0.55 + 0.1 * k, 0.5 + 0.12 * k, 'srgb');
        if (Math.abs((paintSky.k ?? -1) - k) > 0.004 || !paintSky.done) {
          paintSky.k = k; paintSky.done = true;
          const pos = G.sky.geometry.attributes.position, colr = G.sky.geometry.attributes.color, c = new T.Color();
          for (let i = 0; i < pos.count; i++) {
            const y = Math.max(0, pos.getY(i) / 300);
            c.copy(horizon).lerp(zenith, Math.pow(y, 0.55));
            colr.setXYZ(i, c.r, c.g, c.b);
          }
          colr.needsUpdate = true;
          if (win) win.style.setProperty('--sun', k.toFixed(2));
        }
        G.sun.intensity = 0.75 + 0.55 * k;
        G.sun.color.setHSL(0.07 + 0.04 * k, 0.85 - 0.4 * k, 0.72 + 0.2 * k, 'srgb');
        G.hemi.intensity = 0.7 + 0.3 * k;
        // the haze closes in as the salt heats up: the far rows melt into white
        G.scene.fog.color.copy(horizon).lerp(new T.Color(0xfff8f2), 0.4 + 0.4 * k);
        G.scene.fog.near = 12 - 4 * k; G.scene.fog.far = 58 - 26 * k;
        G.hazeMat.uniforms.uHeat.value = k;
        G.sunDir = dir;
        G.sky.position.copy(G.camera.position);
        G.sunDisc.position.copy(G.camera.position).addScaledVector(dir, 250);
      }

      // =====================================================================
      // Sound, made on the spot (no files): crunching salt, the creak of the crust, brine, bells
      // =====================================================================
      let audio = null;
      function ensureAudio() {
        if (!soundOn()) return null;
        try {
          if (!audio) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            const ctx = new Ctx(), master = ctx.createGain();
            master.gain.value = 0.9; master.connect(ctx.destination);
            const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            audio = { ctx, master, noise: buf };
          }
          if (audio.ctx.state !== 'running') Promise.resolve(audio.ctx.resume()).catch(() => {});
          return audio;
        } catch (e) { return null; }
      }
      function noise(dur, type, freq, gain, at, q) {
        const a = ensureAudio();
        if (!a) return;
        const { ctx } = a, t = ctx.currentTime + (at || 0);
        const src = ctx.createBufferSource(); src.buffer = a.noise;
        const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
        const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f); f.connect(g); g.connect(a.master);
        src.start(t, Math.random()); src.stop(t + dur + 0.05);
      }
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
      // The creak of the crust while he leans: a filtered hiss that rises with his weight
      let creak = null;
      function creakOn() {
        const a = ensureAudio();
        if (!a || creak) return;
        const { ctx } = a, src = ctx.createBufferSource(); src.buffer = a.noise; src.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 6; f.frequency.value = 300;
        const g = ctx.createGain(); g.gain.value = 0.0001;
        src.connect(f); f.connect(g); g.connect(a.master); src.start();
        creak = { src, f, g };
      }
      function creakAt(w) {
        if (!creak || !audio) return;
        const t = audio.ctx.currentTime;
        creak.f.frequency.setTargetAtTime(260 + w * 900, t, 0.05);
        creak.g.gain.setTargetAtTime(0.02 + w * w * 0.12 * (0.6 + Math.random() * 0.4), t, 0.03);
      }
      function creakOff() {
        if (!creak || !audio) { creak = null; return; }
        const c = creak, t = audio.ctx.currentTime;
        c.g.gain.setTargetAtTime(0.0001, t, 0.04);
        setTimeout(() => { try { c.src.stop(); } catch (e) {} }, 200);
        creak = null;
      }
      const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1567.98 };
      const sounds = {
        crunch: () => { noise(0.16, 'highpass', 1800, 0.08); noise(0.1, 'lowpass', 700, 0.08, 0.04); },
        letter: (r) => [0, 1, 2].forEach((i) => tone([NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.E6][Math.min(6, r + i)], i * 0.09, 0.9, { gain: 0.08, type: 'triangle' })),
        crack: () => { noise(0.35, 'highpass', 2600, 0.22); noise(0.25, 'lowpass', 400, 0.18, 0.02); tone(160, 0, 0.3, { to: 60, gain: 0.15 }); },
        sink: () => { noise(0.25, 'highpass', 2200, 0.2); tone(120, 0.05, 0.6, { to: 45, gain: 0.22 }); noise(0.9, 'lowpass', 500, 0.16, 0.12); [0, 1, 2, 3].forEach((i) => tone(300 + i * 90, 0.3 + i * 0.12, 0.12, { to: 500 + i * 120, gain: 0.04 })); },
        groan: () => { tone(110, 0, 0.5, { to: 70, gain: 0.12, type: 'triangle' }); noise(0.3, 'bandpass', 900, 0.08, 0, 4); },
        light: () => tone(420, 0, 0.2, { to: 360, gain: 0.05, type: 'triangle' }),
        mirage: () => ['E6', 'G6', 'C6'].forEach((n, i) => tone(NOTE[n], i * 0.4, 2.2, { gain: 0.03, attack: 0.6 })),
        fill: () => [0, 1, 2].forEach((i) => tone(520 + i * 160, i * 0.07, 0.12, { to: 900 + i * 160, gain: 0.06 })),
        win: () => {
          ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach((n, i) => tone(NOTE[n], i * 0.11, 1.4, { gain: 0.09 }));
          ['C5', 'E5', 'G5', 'C6'].forEach((n) => tone(NOTE[n], 0.8, 2.2, { gain: 0.06, type: 'triangle', attack: 0.08 }));
        }
      };

      // ---- Little moments on the screen: a flash, a red pulse, confetti, the balance gauge, the alert card ----
      const fxEl = {};
      if (el.stage) {
        const mk = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); if (html) d.innerHTML = html; el.stage.appendChild(d); return d; };
        fxEl.flash = mk('chasm3d-flash');
        fxEl.hurt = mk('chasm3d-hurt');
        // The balance: a brass arc, the measured band in gold, the needle of his weight
        fxEl.gauge = mk('playa3d-balance', `<svg viewBox="-60 -58 120 66">
            <path class="b-track" d="M-50 0 A50 50 0 0 1 50 0" pathLength="100"/>
            <path class="b-band" d="M-50 0 A50 50 0 0 1 50 0" pathLength="100"/>
            <path class="b-heavy" d="M-50 0 A50 50 0 0 1 50 0" pathLength="100"/>
            <g class="b-needle"><line x1="0" y1="0" x2="0" y2="-46"/><circle r="5"/></g>
          </svg><span class="b-label">Hold to lean</span>`);
        fxEl.alert = document.createElement('div');
        fxEl.alert.className = 'chasm3d-alert';
        fxEl.alert.hidden = true;
        fxEl.alert.setAttribute('role', 'alert');
        el.stage.appendChild(fxEl.alert);
      }
      function replay(node, cls) {
        if (!node) return;
        node.classList.remove(cls);
        void node.offsetWidth;
        node.classList.add(cls);
      }
      const win = modal.querySelector('.chasm3d-window');
      if (win) {
        // Life around the game: a haze that drifts, a compass rose turning slowly, glints of salt rising
        const amb = document.createElement('div');
        amb.className = 'chasm3d-ambient';
        amb.setAttribute('aria-hidden', 'true');
        const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5 * Math.PI / 180, r0 = i % 6 ? 92 : 86; return `<line x1="${(Math.cos(a) * r0).toFixed(1)}" y1="${(Math.sin(a) * r0).toFixed(1)}" x2="${(Math.cos(a) * 97).toFixed(1)}" y2="${(Math.sin(a) * 97).toFixed(1)}"/>`; }).join('');
        const star = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r = i % 2 ? 40 : 66, b1 = a - 0.14, b2 = a + 0.14; return `<path d="M0,0 L${(Math.cos(b1) * 14).toFixed(1)},${(Math.sin(b1) * 14).toFixed(1)} L${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)} L${(Math.cos(b2) * 14).toFixed(1)},${(Math.sin(b2) * 14).toFixed(1)} Z"/>`; }).join('');
        let motes = '';
        for (let i = 0; i < 26; i++) motes += `<i style="--x:${(6 + Math.random() * 84).toFixed(1)}%;--s:${(2 + Math.random() * 3).toFixed(1)}px;--d:${(14 + Math.random() * 16).toFixed(1)}s;--delay:${(-Math.random() * 30).toFixed(1)}s;--dx:${(Math.random() * 60 - 30).toFixed(0)}px"></i>`;
        amb.innerHTML = `<div class="amb-haze"></div><div class="amb-haze amb-haze-2"></div>
          <svg class="amb-rose" viewBox="-100 -100 200 200"><circle r="97"/><circle r="86"/><circle r="60" stroke-dasharray="2 4"/><circle r="22"/><g class="amb-ticks">${ticks}</g><g class="amb-star">${star}</g></svg>
          <div class="amb-motes">${motes}</div>`;
        win.insertBefore(amb, win.firstChild);
      }
      function confetti() {
        if (!el.stage || reducedMotion()) return;
        const box = document.createElement('div');
        box.className = 'chasm3d-confetti';
        box.setAttribute('aria-hidden', 'true');
        const cols = ['#fde68a', '#ffffff', '#f5c2e7', '#93c5fd', '#a7f3d0', '#fff3e4'];
        for (let i = 0; i < 70; i++) {
          const c = document.createElement('i');
          c.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--dx:${((Math.random() - 0.5) * 160).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;`
            + `--d:${(1.8 + Math.random() * 1.6).toFixed(2)}s;--delay:${(Math.random() * 0.6).toFixed(2)}s;background:${cols[i % cols.length]}`;
          box.appendChild(c);
        }
        el.stage.appendChild(box);
        setTimeout(() => box.remove(), 4200);
      }
      // A letter leaves the salt and flies up into its box of the Waypoint Log
      function letterFly(r, letter) {
        const box = el.log && el.log.children[r];
        if (!box || !el.stage || reducedMotion() || !box.animate) { if (box) replay(box, 'is-new'); return; }
        const st = el.stage.getBoundingClientRect(), b = box.getBoundingClientRect();
        const fly = document.createElement('div');
        fly.className = 'chasm3d-flyrune';
        fly.setAttribute('aria-hidden', 'true');
        fly.textContent = letter;
        el.stage.appendChild(fly);
        box.classList.add('is-incoming');
        const x0 = st.width / 2, y0 = st.height * 0.62, x1 = b.left - st.left + b.width / 2, y1 = b.top - st.top + b.height / 2;
        const anim = fly.animate([
          { transform: `translate(${x0}px, ${y0}px) translate(-50%, -50%) scale(0.4)`, opacity: 0 },
          { transform: `translate(${x0}px, ${y0 - 40}px) translate(-50%, -50%) scale(2.4)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${x1}px, ${y1}px) translate(-50%, -50%) scale(0.9)`, opacity: 1 }
        ], { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)', delay: 350 });
        anim.onfinish = () => { fly.remove(); box.classList.remove('is-incoming'); replay(box, 'is-new'); };
      }

      // =====================================================================
      // The panel: Hermes's voice, where he stands, the controls
      // =====================================================================
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
      function where(text) {
        if (!el.where || el.where.textContent === text) return;
        el.where.textContent = text;
        if (!view.quiet) replay(el.where, 'is-new');
      }
      const clock = (min) => {
        const m = Math.round(min) % (24 * 60);
        return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      };
      function paintHud() {
        if (el.log) {
          if (el.log.children.length !== ROWS) el.log.innerHTML = ROMAN.map((n) => `<span class="chasm3d-rune playa3d-logbox" data-row="${n}"></span>`).join('');
          [...el.log.children].forEach((b, r) => {
            const found = r < S.path.length;
            b.classList.toggle('is-found', found);
            if (b.textContent !== (found ? cell(r, S.path[r])[1] : '')) b.textContent = found ? cell(r, S.path[r])[1] : '';
          });
          el.log.setAttribute('aria-label', S.path.length ? `Waypoint Log: ${S.path.map((c, r) => cell(r, c)[1]).join(' ')}` : 'Waypoint Log: empty');
        }
        if (el.skins) {
          if (el.skins.children.length !== 3) el.skins.innerHTML = '<span class="chasm3d-skin"></span>'.repeat(3);
          [...el.skins.children].forEach((sk, i) => sk.style.setProperty('--fill', Math.max(0, Math.min(1, S.water - i))));
          el.skins.setAttribute('aria-label', `Water: ${Math.max(0, Math.round(S.water * 10) / 10)} of 3 skins`);
          const before = view.water0;
          view.water0 = S.water;
          if (before !== undefined && modal.style.display !== 'none') {
            if (S.water <= before - 0.2) { el.skins.classList.remove('is-fill'); replay(el.skins, 'is-hurt'); replay(fxEl.hurt, 'is-on'); }
            else if (S.water >= before + 0.5) { el.skins.classList.remove('is-hurt'); replay(el.skins, 'is-fill'); setTimeout(sounds.fill, 400); }
          }
        }
        if (el.clock) el.clock.textContent = '☀ ' + clock(S.min);
        paintFacing();
      }
      function paintFacing() {
        if (el.rose) el.rose.style.transform = `rotate(${((Math.PI + view.look) * 180 / Math.PI).toFixed(1)}deg)`;
        if (el.facing) el.facing.textContent = Math.abs(view.look) > 1.2 ? 'Looking around' : 'Facing south';
      }

      // The three ways of a stride, as Hermes sees them (he faces south: east is on his left)
      const WAY = (dc) => (dc > 0 ? ['↖', 'Ahead-left', 'south-east'] : dc < 0 ? ['↗', 'Ahead-right', 'south-west'] : ['↑', 'Ahead', 'south']);
      function btn(label, onClick, opts) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chasm3d-btn' + (opts && opts.cls ? ' ' + opts.cls : '');
        b.innerHTML = label;
        if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
        if (opts && opts.disabled) b.disabled = true;
        if (onClick) b.addEventListener('click', onClick);
        if (view.quiet) b.style.animation = 'none';
        else b.style.animationDelay = `${el.controls.children.length * 55}ms`;
        if (opts && opts.slab !== undefined) {   // pointing at a way lights its ring on the salt
          const hot = (on) => () => { view.hot = on ? opts.slab : -1; };
          b.addEventListener('mouseenter', hot(true)); b.addEventListener('mouseleave', hot(false));
          b.addEventListener('focus', hot(true)); b.addEventListener('blur', hot(false));
        }
        el.controls.appendChild(b);
        return b;
      }
      function clearControls() { if (el.controls) el.controls.innerHTML = ''; view.hot = -1; }
      function paintMarkers(list) {
        if (!G) return;
        G.markers.clear();
        (list || []).forEach((o, n) => {
          const m = new G.T.Mesh(G.ringGeo, new G.T.MeshBasicMaterial({ color: 0xffc65a, transparent: true, opacity: 0.9, depthWrite: false }));
          m.position.set(X(o.c), o.r >= 0 ? FACE + 0.03 : SLAB_TOP + 0.03, Z(o.r));
          m.userData = { c: o.c, r: o.r, born: performance.now(), n };
          m.renderOrder = 4;
          G.markers.add(m);
        });
      }

      // ---- On the North Edge: walk along it, then step onto the slab in front ----
      const view = { x: X(0), z: EDGE_Z, yaw: Math.PI, look: 0, phase: 'idle', hot: -1, walk: null, lean: 0, weight: 0, target: null, shake: 0, burst: null, quiet: false };
      function placeHermes() {
        if (S.path.length) { view.x = X(col()); view.z = Z(row() - 1) - STAND; }
        else { view.x = X(S.edge); view.z = EDGE_Z; }
        view.yaw = Math.PI;
      }
      function showEdge(line) {
        view.phase = 'edge';
        clearControls();
        paintMarkers([{ r: 0, c: S.edge }]);
        btn('<span class="chasm3d-arrow">←</span> East <small>along the edge</small>', () => alongEdge(1),
            { disabled: S.edge >= ROWS - 1, aria: 'Walk east along the edge, one slab' });
        btn(`<span class="chasm3d-arrow">↑</span> Step onto this slab <small>Row I</small>`, () => choose(S.edge), { cls: 'is-way', slab: S.edge, aria: 'Step onto the slab in front of Hermes, in Row I' });
        btn('West <small>along the edge</small> <span class="chasm3d-arrow">→</span>', () => alongEdge(-1),
            { disabled: S.edge <= 0, aria: 'Walk west along the edge, one slab' });
        const count = S.edge === 0 ? 'He stands by the tripod, in front of the westernmost slab of the first row.'
          : `He stands ${S.edge} slab${S.edge > 1 ? 's' : ''} east of the tripod, in front of the slab that is ${ORD[S.edge]} from the west.`;
        where(`On the North Edge, facing south. ${count}`);
        if (line) say(line);
        paintHud();
        save();
      }
      function alongEdge(d) {
        if (view.phase !== 'edge') return;
        const to = S.edge + d;
        if (to < 0 || to >= ROWS) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        ensureAudio();
        S.edge = to;
        S.min += 1;
        view.walk = { fx: view.x, fz: view.z, tx: X(to), tz: EDGE_Z, t: 0, dur: 0.7, then: () => showEdge(edgeLine()) };
        clearControls();
        paintMarkers([]);
        if (!G) finishWalk();
      }
      const edgeLine = () => (S.edge === 0 ? 'Back by the tripod, at the west end of the edge.'
        : [`One slab east of the tripod. The crust in front of me looks like all the others.`, 'Another slab east. They all shine the same, Silvia.',
           'East again. The tripod is falling behind me, on my right.', 'Further east. I am near the middle of the edge now.',
           'East again. The salt goes on and on.', 'This is the eastern end of the edge. Nothing beyond but crust.'][S.edge - 1]);

      // ---- A stride: she picks a slab within reach ----
      function showChoice(line) {
        if (row() >= ROWS) { victory(true); return; }
        if (row() === 0) { showEdge(line); return; }
        view.phase = 'choose';
        clearControls();
        const r = row(), opts = reach();
        paintMarkers(opts.filter((o) => !o.shown).map((o) => ({ r, c: o.c })));
        // west on the right of the screen: the buttons run east to west, as the slabs do in front of him
        opts.slice().reverse().forEach((o) => {
          const [arrow, word, compass] = WAY(o.c - col());
          const shut = o.shown === 'sink' ? 'brine' : o.shown === 'crack' ? 'cracked' : '';
          btn(`<span class="chasm3d-arrow">${arrow}</span> ${word} <small>${shut || compass}</small>`, () => choose(o.c),
              { cls: shut ? 'is-tracks' : 'is-way', disabled: !!shut, slab: o.c,
                aria: shut ? `${word}, ${compass}: ${shut === 'brine' ? 'a brine sinkhole, open' : 'cracked crust'}` : `${word}: step ${compass} onto Row ${ROMAN[r]}` });
        });
        const ways = opts.map((o) => `${WAY(o.c - col())[1].toLowerCase()} (${WAY(o.c - col())[2]})${o.shown ? ', ' + (o.shown === 'sink' ? 'open brine' : 'cracked') : ''}`);
        where(`Row ${ROMAN[r - 1]}, facing south. Within reach in Row ${ROMAN[r]}: ${ways.join('; ')}.`);
        // Mid-morning, Row V: the heat paints water where there is none (again after a reload, until she has seen through it)
        if (r === MIRAGE_ROW && (!S.mirage || (S.mirage === 1 && view.mirageAt < 0))) {
          const sink = opts.find((o) => !cell(r, o.c) && !o.shown);
          if (sink) {
            S.mirage = 1;
            view.mirageAt = sink.c;
            if (soundOn()) sounds.mirage();
            subtitle('Something shines on the salt ahead, like a pool of clear water.', 6);
            line = `Silvia, look! Just ${WAY(sink.c - col())[1].toLowerCase()} of me, on the ${WAY(sink.c - col())[2]} slab, there is water. A pool, blue and still, with the sky in it. My throat is so dry that I can almost taste it. Is it real? MIRAGE, the walkers wrote in their canyon… Your page knows. Tell me which way.`;
          }
        }
        if (line) say(line);
        paintHud();
        save();
      }
      function choose(c) {
        if (view.phase !== 'choose' && view.phase !== 'edge') return;
        const r = row();
        if (S.revealed[kOf(r, c)]) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        ensureAudio();
        if (r === 0 && c !== START_COL) { setback('start', 0, c); return; }
        startTest(r, c);
      }

      // ---- Measured footsteps: he plants his staff and leans; she holds, and lets go in the gold band ----
      const BAND_C = 0.6;
      const bandHalf = () => Math.max(0.05, 0.11 - heat() * 0.05 - row() * 0.004);
      const leanSpeed = () => 0.42 + heat() * 0.2 + row() * 0.02;
      function startTest(r, c) {
        view.phase = 'test';
        view.target = { r, c };
        view.weight = 0; view.leaning = false;
        clearControls();
        paintMarkers([{ r, c }]);
        const half = bandHalf();
        if (fxEl.gauge) {
          const lo = (BAND_C - half) * 100, hi = (BAND_C + half) * 100;
          fxEl.gauge.querySelector('.b-band').setAttribute('stroke-dasharray', `0 ${lo.toFixed(1)} ${(hi - lo).toFixed(1)} 200`);
          fxEl.gauge.querySelector('.b-heavy').setAttribute('stroke-dasharray', `0 ${hi.toFixed(1)} ${(100 - hi).toFixed(1)} 200`);
          fxEl.gauge.classList.add('is-on');
          paintGauge();
        }
        const hold = btn('<span class="chasm3d-arrow">⇩</span> Hold to lean <small>let go in the gold</small>', null, { cls: 'is-way playa3d-hold', aria: 'Hold to lean Hermes onto the slab, let go when the needle is in the gold band' });
        hold.addEventListener('pointerdown', (e) => { e.preventDefault(); try { hold.setPointerCapture(e.pointerId); } catch (err) {} leanStart(); });
        hold.addEventListener('pointerup', leanEnd);
        hold.addEventListener('pointercancel', leanEnd);
        hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); leanStart(); } });
        hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); leanEnd(); } });
        btn('↺ Another slab', () => { endGauge(); showChoice(); }, { cls: 'is-back', aria: 'Choose another slab' });
        const ahead = r === 0 ? 'the slab in front of me' : `the ${WAY(c - col())[2]} slab`;
        say(r === 0 ? "Here goes. I plant my staff on " + ahead + " and lean on it, slowly, the way the Architect wrote: measured footsteps. Hold, Silvia, and let go when my weight is just right."
          : `My staff is on ${ahead} of Row ${ROMAN[r]}. Hold, and let go when my weight sits in the gold.`);
        where(`Testing the ${r === 0 ? 'first' : WAY(c - col())[2]} slab of Row ${ROMAN[r]}. Hold the button (or the space bar) and let go when the needle is in the gold band.`);
        setTimeout(() => { if (view.phase === 'test') hold.focus({ preventScroll: true }); }, 30);
      }
      function paintGauge() {
        if (!fxEl.gauge) return;
        fxEl.gauge.querySelector('.b-needle').setAttribute('transform', `rotate(${(-90 + Math.min(1, view.weight) * 180).toFixed(1)})`);
        const lo = BAND_C - bandHalf(), hi = BAND_C + bandHalf(), w = view.weight;
        const label = !view.leaning && w === 0 ? 'Hold to lean' : w < lo ? 'Leaning…' : w <= hi ? 'Now! Let go' : 'Too heavy!';
        const span = fxEl.gauge.querySelector('.b-label');
        if (span.textContent !== label) span.textContent = label;
        fxEl.gauge.classList.toggle('is-gold', w >= lo && w <= hi);
        fxEl.gauge.classList.toggle('is-red', w > hi);
      }
      function endGauge() { if (fxEl.gauge) fxEl.gauge.classList.remove('is-on', 'is-gold', 'is-red'); creakOff(); view.leaning = false; }
      function leanStart() {
        if (view.phase !== 'test' || view.leaning) return;
        view.leaning = true;
        view.weight = 0;
        view.wob = Math.random() * 6;
        creakOn();
        if (!G) view.weight = BAND_C;   // without 3D (no frames run) the lean lands in the band
      }
      function leanEnd() {
        if (view.phase !== 'test' || !view.leaning) return;
        view.leaning = false;
        creakOff();
        release(view.weight);
      }
      // Her weight at the moment she lets go decides; then the slab answers
      function release(w) {
        const lo = BAND_C - bandHalf(), hi = BAND_C + bandHalf(), { r, c } = view.target;
        if (w < lo) {
          S.light++;
          if (soundOn()) sounds.light();
          view.weight = 0;
          paintGauge();
          say(w < lo * 0.5 ? 'I barely touched it, Silvia. Lean with me: hold a little longer.' : 'Not quite enough weight to trust it. Again, a little longer.');
          return;
        }
        endGauge();
        const truth = judge(r, c);
        if (truth === 'sink') { setback('sink', r, c); return; }
        if (truth === 'crack') { setback('crack', r, c); return; }
        if (w > hi) { heavy(); return; }
        stride(r, c);
      }
      // Too heavy on a sound slab: the crust groans, he pulls back his foot; nothing broken, a little water spent
      function heavy() {
        view.phase = 'heavy';
        S.heavy++;
        S.water = Math.max(0, S.water - 0.25);
        S.min += 4;
        view.shake = 0.6;
        if (soundOn()) sounds.groan();
        hints.fail();
        save();
        paintHud();
        subtitle('Too heavy! The crust groans under his staff.', 3);
        say('Too much weight, too fast! The crust groaned like an old door and I pulled my foot back just in time. It did not break. That one may still be good, Silvia: slower, and let go in the gold.');
        if (S.water <= 0.001) { S.rest = Date.now() + REST_S * 1000; save(); setTimeout(rest, 900); return; }
        setTimeout(() => { if (view.phase === 'heavy') startTest(view.target.r, view.target.c); }, reducedMotion() ? 200 : 1300);
      }

      // ---- The slab holds: he steps onto it, brushes the salt and reads the letter ----
      function stride(r, c) {
        view.phase = 'step';
        paintMarkers([]);
        clearControls();
        S.path.push(c);
        S.min += MIN_PER_STRIDE;
        save();
        view.walk = { fx: view.x, fz: view.z, tx: X(c), tz: Z(r) - STAND, t: 0, dur: 0.95, hop: true, then: () => reveal(r, c) };
        where(`Stepping onto Row ${ROMAN[r]}…`);
        if (!G) finishWalk();
      }
      function reveal(r, c) {
        view.phase = 'found';
        const [n, letter] = cell(r, c);
        if (soundOn()) sounds.letter(r); else if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        replay(fxEl.flash, 'is-on');
        showLetter(r, c, !G || reducedMotion());
        burstAt(X(c), SLAB_TOP + 0.2, Z(r), 0xfff6ff);
        paintPrints();
        paintHud();
        letterFly(r, letter);
        subtitle(`Row ${ROMAN[r]}: [${letter}] · a crystal of ${n} facet${n > 1 ? 's' : ''}`, 4);
        where(`Row ${ROMAN[r]}, facing south: Hermes stands on the slab of [${letter}].`);
        const crystal = `A crystal of ${['one facet', 'two facets', 'three facets', 'four facets', 'five facets', 'six facets'][n - 1]} grows at my feet`;
        const lines = [
          `The crust holds! I brushed the salt from under my boots and there is a letter cut into the slab: ${letter}. ${crystal}. Write the ${letter} in the box of Row I of your Waypoint Log.`,
          `It held. ${letter}, under the salt, and ${crystal.toLowerCase()}. Row II is in the log.`,
          `Firm. ${letter} at my feet, and ${crystal.toLowerCase()}. The sun is getting stronger on the back of my neck.`,
          `${letter}, Row IV. ${crystal}. The crust ticks and pops in the heat, Silvia. I do not like that sound.`,
          `Held again: ${letter}. ${crystal}. The haze is so thick now that the far rows are only white.`,
          `${letter}! ${crystal}. One more row, and the south shore is right there.`,
          `${letter}… and solid ground under the last slab. ${crystal}.`
        ];
        say(lines[r]);
        if (r === MIRAGE_ROW && S.mirage === 1) S.mirage = 2;   // she saw through it
        save();
        if (row() >= ROWS) { setTimeout(() => victory(true), reducedMotion() ? 300 : 1900); return; }
        const next = () => { if (view.phase === 'found') showChoice(); };
        clearControls();
        btn('Walk on', next, { cls: 'is-way' });
        const first = el.controls.querySelector('button');
        if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
      }

      // ---- A slab that lies: brine, a crack, or the wrong start ----
      function setback(kind, r, c) {
        view.phase = 'setback';
        paintMarkers([]);
        clearControls();
        hints.fail();
        S.fails++;
        view.shake = kind === 'sink' ? 1.1 : 0.8;
        let text, cost, title, why;
        const mirage = kind === 'sink' && r === MIRAGE_ROW && view.mirageAt === c;
        if (kind === 'sink') {
          S.sinks++;
          S.water = Math.max(0, S.water - 1);
          S.revealed[kOf(r, c)] = 'sink';
          showSink(r, c, !G || reducedMotion());
          burstAt(X(c), SLAB_TOP, Z(r), 0x3a7a88);
          if (soundOn()) sounds.sink();
          title = mirage ? 'It was the mirage' : 'A brine sinkhole';
          why = mirage ? 'The water was the sky, shining on a lid of salt over deep brine.' : 'The crust was only a lid over deep brine. Only your page shows the sinkholes.';
          text = mirage
            ? "The water was not water, Silvia. When my staff touched the shine, it went straight through the crust and the brine came up black, and the blue pool was just the sky lying on the salt. MIRAGE. The walkers knew. I pulled back, but the skin on my belt went in with the staff."
            : "My staff went straight through! The crust was only a lid, and under it the brine is black and deep, exactly as the page “Study on the Dry Salt Playa” warns. I pulled back in time, but a skin of water slipped from my belt and sank.";
          cost = '💧 −1 skin of water';
          if (view.mirageAt === c) view.mirageAt = -1;
          if (mirage) S.mirage = 3;   // she believed it: 1 shown, 2 seen through, 3 stepped into
        } else if (kind === 'crack') {
          S.cracks++;
          S.water = Math.max(0, S.water - 0.5);
          S.revealed[kOf(r, c)] = 'crack';
          showCrack(r, c, !G || reducedMotion());
          burstAt(X(c), SLAB_TOP + 0.1, Z(r), 0xffffff);
          if (soundOn()) sounds.crack();
          title = 'The crust refuses';
          why = 'This slab breaks the Law of the Basin: its facets are not one more or one less than the slab he stands on.';
          text = "Crack! The slab split under my staff like a sheet of ice, from the middle to the edges. It is not hollow, but it will not carry me: it does not keep the Law of the Basin with the slab I am standing on. One facet more or one less, Silvia, the page says. I jumped back, and spilled half a skin.";
          cost = '💧 −½ skin of water';
        } else {
          S.water = Math.max(0, S.water - 0.5);
          if (soundOn()) sounds.groan();
          title = 'Not where we begin';
          why = 'The page names the first slab: Row I, Column D, marked 3 and [C].';
          text = `Wait. I counted the slabs from the tripod, and this is the ${ORD[c]} from the west. Your page says exactly where the crossing begins, Silvia, and it is not here. I stepped back onto the edge, but in this heat even a wasted walk costs water.`;
          cost = '💧 −½ skin of water';
        }
        S.min += 10;
        const restNeeded = S.water <= 0.001;
        if (restNeeded) S.rest = Date.now() + REST_S * 1000;
        save();
        paintHud();
        say(text + (restNeeded ? ' And that was the last of my water.' : ''));
        where(`A false step: Hermes is back on ${row() ? `his slab of Row ${ROMAN[row() - 1]}` : 'the North Edge'}.`);
        if (fxEl.alert) {
          fxEl.alert.innerHTML = `<div class="chasm3d-alert-card">
            <div class="chasm3d-alert-seal" aria-hidden="true">${kind === 'sink' ? '≈' : '✕'}</div>
            <div class="chasm3d-alert-kicker">${kind === 'sink' ? 'Sinkhole' : 'False step'}</div>
            <div class="chasm3d-alert-title">${title}</div>
            <p class="chasm3d-alert-why">${why}</p>
            <p class="chasm3d-alert-cost">${restNeeded ? '💧 No water left: Hermes must rest.' : cost}</p>
            <p class="chasm3d-alert-next">${kind === 'start' ? 'Hermes is back on the edge.' : 'Hermes stays on his slab. Choose again.'}</p>
            <button type="button" class="chasm3d-alert-btn">${restNeeded ? 'Rest under the cloak' : '↺ Choose again'}</button>
          </div>`;
          fxEl.alert.hidden = false;
          replay(fxEl.alert, 'is-on');
          const b = fxEl.alert.querySelector('button');
          b.addEventListener('click', goOn);
          setTimeout(() => b.focus({ preventScroll: true }), 30);
        }
        btn(restNeeded ? 'Rest under the cloak' : '↺ Choose again', goOn, { cls: 'is-back' });
      }
      function goOn() {
        if (view.phase !== 'setback') return;
        if (fxEl.alert) fxEl.alert.hidden = true;
        if (S.rest) { rest(); return; }
        showChoice(row() ? 'Let us try again. Look at the page before I lean.' : 'Back on the edge. Count the slabs with me.');
      }

      // ---- Out of water: he sits under his cloak until the worst heat passes ----
      function rest() {
        view.phase = 'rest';
        paintMarkers([]);
        clearControls();
        endGauge();
        if (fxEl.alert) fxEl.alert.hidden = true;
        say('My skins are empty, Silvia. There is no shade on the salt, so I will sit on this slab with my cloak over my head and drink the last mouthfuls of the little flask I keep for emergencies. Give me a moment.');
        const b = btn('', null, { cls: 'is-rest', disabled: true });
        const tick = () => {
          if (view.phase !== 'rest') return;
          const left = Math.max(0, Math.ceil((S.rest - Date.now()) / 1000));
          b.textContent = `Hermes is resting · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
          b.style.setProperty('--p', (1 - left / REST_S).toFixed(3));
          where('Resting under his cloak on the salt.');
          if (left <= 0) { endRest(); return; }
          rest.t = setTimeout(tick, 500);
        };
        tick();
      }
      function endRest() {
        clearTimeout(rest.t);
        S.rest = 0;
        S.water = 1;
        S.min += 40;
        save();
        paintHud();
        showChoice('The flask is empty now, but my head is clear again. One skin, and the page. Let us go on.');
      }

      // ---- The south shore ----
      function victory(live) {
        view.phase = 'done';
        paintMarkers([]);
        clearControls();
        endGauge();
        say("Sand! Real sand under my boots, Silvia. I stepped off the last slab onto the south shore and my knees nearly gave way. C, R, Y, S, T, A, L: CRYSTAL, the passage keyword, spelled under my own feet. Behind me the salt is a white sea, and the haze has swallowed the edge where we started. And in front of me stands a squat stone marker of the Order, with a niche in its side. There is something in it, wrapped in oiled cloth. I will tell you everything on the Field Wire.");
        where('Across the Salt Playa, on the south shore.');
        if (el.victory) el.victory.style.display = 'block';
        if (soundOn()) sounds.win(); else if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (live) confetti();
        const first = !isDone();
        put('order_salt_playa_completed', 'true');
        put('order_salt_playa_path', JSON.stringify(SOLUTION));
        save();
        hints.refresh();
        paintHud();
        if (first && typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (first) document.dispatchEvent(new Event('playa:cleared'));   // Hermes has news on the Field Wire
        if (live) setTimeout(() => { if (view.phase === 'done' && modal.style.display !== 'none') showReward(); }, reducedMotion() ? 300 : 2600);
        if (el.log) [...el.log.children].forEach((b, n) => { b.style.animationDelay = `${n * 120}ms`; replay(b, 'is-wave'); });
      }

      // A spray of salt shards (or brine) out of a slab
      function burstAt(x, y, z, color) {
        if (!G || reducedMotion()) return;
        const v = new Float32Array(G.burstN * 3);
        for (let n = 0; n < G.burstN; n++) {
          const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.8;
          v[n * 3] = Math.cos(a) * sp; v[n * 3 + 1] = 1.2 + Math.random() * 2.2; v[n * 3 + 2] = Math.sin(a) * sp;
        }
        G.burst.material.color.setHex(color);
        view.burst = { t: 0, o: new G.T.Vector3(x, y, z), v };
      }

      // =====================================================================
      // The loop
      // =====================================================================
      let raf = 0, last = 0;
      const camPos = { x: 0, y: 0, z: 0, lx: 0, ly: 0, lz: 0, ok: false };
      function frame(now) {
        raf = requestAnimationFrame(frame);
        if (!G || modal.style.display === 'none' || modal.classList.contains('closing') || document.hidden) return;
        tick(now, Math.min(0.1, (now - (last || now)) / 1000));
        last = now;
      }
      function finishWalk() {
        const w = view.walk;
        if (!w) return;
        view.walk = null;
        view.x = w.tx; view.z = w.tz;
        if (w.then) w.then();
      }
      function tick(now, dt) {
        const T = G.T, rm = reducedMotion();
        G.uTime.value = now / 1000;
        let moving = false;
        const w = view.walk;
        if (w) {
          moving = true;
          w.t += dt / (rm ? w.dur * 0.3 : w.dur);
          const k = Math.min(1, w.t), e = k * k * (3 - 2 * k);
          view.x = w.fx + (w.tx - w.fx) * e; view.z = w.fz + (w.tz - w.fz) * e;
          if (Math.floor(w.t * 4) !== (w.steps || 0)) { w.steps = Math.floor(w.t * 4); if (soundOn() && audio) sounds.crunch(); }
          if (k >= 1) finishWalk();
        }
        // While she holds, his weight climbs with a wobble (the heat makes it less steady); past full, it is too heavy
        if (view.phase === 'test' && view.leaning) {
          view.wob = (view.wob || 0) + dt;
          const sp = leanSpeed() * (1 + Math.sin(view.wob * 5.3) * 0.35 + Math.sin(view.wob * 11.7) * 0.12);
          view.weight = Math.min(1.05, view.weight + dt * sp);
          creakAt(view.weight);
          paintGauge();
          if (view.weight >= 1.05) { view.leaning = false; creakOff(); release(1.05); }
        }
        const leanTo = view.phase === 'test' ? 0.25 + view.weight * 0.55 : 0;
        view.lean += (leanTo - view.lean) * Math.min(1, dt * 8);
        if (!dragging) view.look *= Math.pow(0.15, dt);

        // Hermes
        const H = G.hermes;
        const hop = w && w.hop ? Math.sin(Math.min(1, w.t) * Math.PI) * 0.35 : 0;
        H.position.set(view.x, (view.z > EDGE_Z + 0.5 ? FACE : SLAB_TOP) + hop, view.z);
        H.rotation.set(0, view.yaw, 0);
        const swing = moving && !rm ? Math.sin(now / 120) : 0;
        G.legL.position.z = swing * 0.17; G.legR.position.z = -swing * 0.17;
        G.legL.position.y = Math.max(0, swing) * 0.05; G.legR.position.y = Math.max(0, -swing) * 0.05;
        G.cloak.rotation.z = swing * 0.025;
        // leaning: he tips forward over his staff, which reaches out to the slab he tests
        H.rotation.x = -view.lean * 0.18;
        G.staff.rotation.x = -view.lean * 1.1 + swing * 0.2;
        G.lamp.rotation.z = rm ? 0 : Math.sin(now / 260) * 0.07 + swing * 0.08;
        if (view.phase === 'rest') H.position.y = FACE - 0.35;
        G.rag.rotation.y = Math.sin(now / 300) * 0.4;

        // Camera: behind him and above, looking south over the slabs within reach; closer while he leans
        const test = view.phase === 'test' || view.phase === 'heavy';
        const yaw = view.yaw + view.look;
        const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
        let tx = view.x - fx * 4.6, ty = 5.6, tz = view.z - fz * 4.6;
        let lx = view.x + fx * 3.4, ly = 0.4, lz = view.z + fz * 3.4;
        if (test && view.target) {
          const gx = X(view.target.c), gz = Z(view.target.r);
          // over his shoulder, a little to the east, so the slab under his staff is in the middle of the picture
          const dx = gx - view.x, dz = gz - view.z, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl;
          tx = view.x - ux * 3.0 + uz * 1.5; ty = 4.0; tz = view.z - uz * 3.0 - ux * 1.5;
          lx = view.x + ux * 2.7; ly = 0.2; lz = view.z + uz * 2.7;
        }
        if (view.phase === 'done') { tx = view.x + 2.5; ty = 3.2; tz = view.z - 5; lx = view.x; ly = 1.2; lz = view.z + 6; }
        const k = camPos.ok && !rm ? Math.min(1, dt * 3.2) : 1;
        ['x', 'y', 'z'].forEach((a, i) => { camPos[a] += ([tx, ty, tz][i] - camPos[a]) * k; camPos['l' + a] += ([lx, ly, lz][i] - camPos['l' + a]) * k; });
        camPos.ok = true;
        G.camera.position.set(camPos.x, camPos.y, camPos.z);
        G.camera.lookAt(camPos.lx, camPos.ly, camPos.lz);
        if (view.shake > 0) {
          if (!rm) { const a = view.shake * view.shake * 0.14; G.camera.position.x += (Math.random() - 0.5) * a; G.camera.position.y += (Math.random() - 0.5) * a; }
          view.shake = Math.max(0, view.shake - dt * 2.2);
        }

        // The slabs that answered: letters fade in, crystals grow, cracks spread, sinkholes fall in
        G.slabs.forEach((rowS) => rowS.forEach((s) => {
          if (s.letter && s.show < 1) {
            s.show = Math.min(1, s.show + dt * 1.2);
            s.letter.material.opacity = s.show;
            const g2 = Math.min(1, s.show * 1.4), pop = 1 + 2.4 * Math.pow(g2 - 1, 3) + 1.4 * Math.pow(g2 - 1, 2);
            s.crystal.scale.setScalar(Math.max(0.001, pop));
          }
          if (s.crack && s.cracked > 0 && s.cracked < 1) { s.cracked = Math.min(1, s.cracked + dt * 3); s.crack.material.opacity = 0.9 * s.cracked; s.crack.scale.setScalar(0.4 + 0.6 * s.cracked); }
          if (s.pool && s.sunk > 0 && s.sunk < 1) { s.sunk = Math.min(1, s.sunk + dt * 1.6); applySink(s, s.sunk); }
          if (s.crystal) s.crystal.rotation.y += dt * 0.25;
        }));

        // Rings on the slabs within reach: they rise when he stops, the one she points at grows and glows
        G.markers.children.forEach((m) => {
          const age = rm ? 1 : Math.min(1, Math.max(0, (performance.now() - m.userData.born) / 1000 - m.userData.n * 0.08) * 3);
          const pop = 1 + 2.7 * Math.pow(age - 1, 3) + 1.7 * Math.pow(age - 1, 2);
          const hot = view.hot === m.userData.c || view.phase === 'test';
          m.userData.h = (m.userData.h || 0) + ((hot ? 1 : 0) - (m.userData.h || 0)) * Math.min(1, dt * 10);
          m.scale.setScalar(pop * (1 + m.userData.h * 0.12));
          m.material.opacity = Math.min(1, 0.55 + Math.sin(now / 300) * 0.25 + m.userData.h * 0.45);
          m.material.color.setHex(view.phase === 'test' ? (fxEl.gauge && fxEl.gauge.classList.contains('is-red') ? 0xff6a5a : 0xfff0a0) : 0xffc65a);
        });

        // The mirage shines over its slab while it is the choice in front of him
        const mir = view.phase === 'choose' && row() === MIRAGE_ROW && view.mirageAt >= 0 && S.mirage === 1;
        if (mir) { G.mirage.position.set(X(view.mirageAt), FACE + 0.05, Z(MIRAGE_ROW) + 0.4); G.mirage.visible = true; }
        G.mirageMat.uniforms.uA.value += ((mir ? 1 : 0) - G.mirageMat.uniforms.uA.value) * Math.min(1, dt * 1.5);
        if (!mir && G.mirageMat.uniforms.uA.value < 0.01) G.mirage.visible = false;

        if (view.burst) {
          const b = view.burst, sp = G.burst.geometry.attributes.position;
          b.t += dt;
          for (let i = 0; i < G.burstN; i++) sp.setXYZ(i, b.o.x + b.v[i * 3] * b.t, b.o.y + b.v[i * 3 + 1] * b.t - 4.2 * b.t * b.t, b.o.z + b.v[i * 3 + 2] * b.t);
          sp.needsUpdate = true;
          G.burst.material.opacity = Math.max(0, 1 - b.t / 1.1);
          G.burst.visible = true;
          if (b.t > 1.1) { view.burst = null; G.burst.visible = false; }
        }
        const mp = G.motes.geometry.attributes.position, b0 = G.motesBase, t = now / 1000, wrap = (x) => ((x % 16) + 16) % 16;
        for (let i = 0; i < G.motesN; i++) {
          mp.setXYZ(i, view.x - 8 + wrap(b0[i * 3] + t * 0.25 + Math.sin(t * 0.4 + i) * 0.3), b0[i * 3 + 1] + Math.sin(t * 0.5 + i * 1.7) * 0.15, view.z - 8 + wrap(b0[i * 3 + 2] + t * 0.12));
        }
        mp.needsUpdate = true;

        paintSky();
        G.sun.position.set(view.x, 0, view.z).addScaledVector(G.sunDir, 60);
        G.sun.target.position.set(view.x, 0, view.z);
        paintFacing();
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

      // ---- Pointer: drag to look around, tap a ringed slab to test it ----
      let dragging = false, downAt = null;
      if (el.canvas) {
        el.canvas.addEventListener('pointerdown', (e) => {
          if (!G) return;
          downAt = { x: e.clientX, y: e.clientY, lx: e.clientX, moved: false };
          dragging = true;
          try { el.canvas.setPointerCapture(e.pointerId); } catch (err) {}
        });
        el.canvas.addEventListener('pointermove', (e) => {
          if (!dragging || !downAt) return;
          const dx = e.clientX - downAt.lx;
          downAt.lx = e.clientX;
          if (Math.abs(e.clientX - downAt.x) + Math.abs(e.clientY - downAt.y) > 6) downAt.moved = true;
          view.look = Math.max(-1.8, Math.min(1.8, view.look - dx * 0.006));
        });
        el.canvas.addEventListener('pointerup', (e) => {
          if (!dragging) return;
          dragging = false;
          if (downAt && !downAt.moved && (view.phase === 'choose' || view.phase === 'edge') && G.markers.children.length) {
            const rect = el.canvas.getBoundingClientRect();
            const p = new G.T.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
            const rc = new G.T.Raycaster();
            rc.setFromCamera(p, G.camera);
            const slabMeshes = G.markers.children.map((m) => G.slabs[m.userData.r][m.userData.c].mesh);
            const hit = rc.intersectObjects(slabMeshes)[0];
            if (hit) choose(hit.object.userData.c);
          }
          downAt = null;
        });
        el.canvas.addEventListener('pointercancel', () => { dragging = false; downAt = null; });
      }
      // ---- Keyboard: arrows pick a way (relative to Hermes), the space bar leans ----
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'none') return;
        if (e.key === 'Escape') { closePlaya(); return; }
        const tag = (e.target && e.target.tagName) || '';
        if (/INPUT|TEXTAREA|SELECT|BUTTON/.test(tag) && (e.key === ' ' || e.key === 'Enter')) return;
        if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
        if (view.phase === 'test' && e.key === ' ' && !e.repeat) { e.preventDefault(); leanStart(); return; }
        if (view.phase === 'edge') {
          if (e.key === 'ArrowLeft') { e.preventDefault(); alongEdge(1); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); alongEdge(-1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); choose(S.edge); }
          return;
        }
        if (view.phase === 'choose') {
          const dc = { ArrowLeft: 1, ArrowUp: 0, ArrowRight: -1 }[e.key];
          if (dc !== undefined) { e.preventDefault(); const c = col() + dc; if (c >= 0 && c < ROWS && !S.revealed[kOf(row(), c)]) choose(c); }
        }
      });
      document.addEventListener('keyup', (e) => {
        if (modal.style.display === 'none' || e.key !== ' ' || view.phase !== 'test') return;
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'BUTTON') return;
        e.preventDefault(); leanEnd();
      });

      // =====================================================================
      // Opening and closing
      // =====================================================================
      const briefHeard = () => { try { const w = JSON.parse(get('order_chasm_wire') || '{}'); return !!w && w.reply2 !== undefined; } catch (e) { return false; } };
      function canOpen() {
        if (isDone()) return true;
        if ((typeof window.isAdminTester === 'function' && window.isAdminTester()) || (typeof isCarlesTester === 'function' && isCarlesTester())) return true;
        if (get('order_whispering_chasm_completed') !== 'true') {
          toast('✦ TERRA INCOGNITA ✦ Guide Hermes through the Whispering Chasm (Station 10) before crossing the Salt Playa.');
          return false;
        }
        if (typeof window.isPlayaMarchOver === 'function' && !window.isPlayaMarchOver()) {
          const eta = typeof window.getPlayaMarchEta === 'function' ? window.getPlayaMarchEta() : '';
          if (typeof window.isPlayaCamped === 'function' && window.isPlayaCamped()) {
            toast('✦ THE EDGE OF THE SALT ✦ Hermes has made camp by the old surveyor\'s tripod and is testing the crust. He will call you on the Field Wire when he is ready.');
            return false;
          }
          toast(eta
            ? '✦ NIGHT AT THE OASIS GATE ✦ Hermes is asleep by the gate. First light in ' + eta + ': then he calls you from the edge of the salt.'
            : '✦ THE OASIS GATE ✦ Hermes is calling you from the Oasis Gate on the Field Wire.');
          if (!eta && typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
          return false;
        }
        if (!briefHeard()) {
          toast('✦ THE NORTH EDGE ✦ Hermes is calling you on the Field Wire: answer him before he steps onto the salt.');
          if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
          return false;
        }
        return true;
      }
      let returnFocusTo = null;
      function openPlaya() {
        if (!canOpen()) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        const speaker = document.getElementById('ambience-toggle');
        if (speaker && el.close && speaker.parentElement !== el.close.parentElement) el.close.parentElement.insertBefore(speaker, el.close);
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
        if (isDone() && firstTime) S.path = SOLUTION.slice();   // crossed before this walk existed (or by the tester): on the south shore
        if (el.victory) el.victory.style.display = 'none';
        view.walk = null; view.look = 0; view.water0 = undefined; view.mirageAt = -1; camPos.ok = false;
        if (fxEl.alert) fxEl.alert.hidden = true;
        endGauge();
        hideReward(true);
        placeHermes();
        paintSlabs();
        paintPrints();
        paintHud();
        if (isDone() && S.path.length === ROWS) {
          victory();
          say("We are on the south shore, Silvia, and the salt behind us shines like a frozen lake. CRYSTAL. The page “The Salt Playa (Dry Basin)” of your journal has every letter of it.");
        } else if (S.rest) rest();
        else if (firstTime && !isDone()) showChoice("Silvia, I am on the North Edge, by the old surveyor's tripod, at the west end of the first row. I face south: my right hand is west, the left side of your page. From here every slab looks the same, white and firm, and I cannot see a single number. You have the page “The Salt Playa (Dry Basin)”. Walk me east along the edge to the slab where the crossing begins, and we will test it together.");
        else showChoice(S.path.length ? `I am still here, Silvia, on my slab of Row ${ROMAN[row() - 1]}. Find me on your page and tell me where to step.` : "I am back on the North Edge, by the tripod. Walk me east along the edge to where the crossing begins.");
        if (building && G) tick(performance.now(), 1 / 60);
        view.quiet = false;
        if (!raf) raf = requestAnimationFrame(frame);
        if (get(HOWTO_KEY) !== 'seen' && !isDone()) showHowto(0);
        else focusFirst();
      }
      function focusFirst() {
        const first = [...el.controls.querySelectorAll('button:not([disabled])'), ...(el.victory ? el.victory.querySelectorAll('button') : []), el.close]
          .find((x) => x && x.offsetParent);
        if (first) first.focus({ preventScroll: true });
      }

      // ---- The reward: the crossing drawn on the page, the keyword, the Ledger line and the surveyor's balance ----
      const reward = { box: null, back: null };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      function showReward() {
        const body = modal.querySelector('.chasm3d-body');
        if (!body) return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward playa3d-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', 'Your reward for the Salt Playa');
          body.appendChild(reward.box);
          reward.box.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast'); });
        }
        const quiet = reducedMotion();
        const mins = Math.max(0, Math.round(S.min - START_MIN));
        const time = `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min`;
        const path = S.path.length === ROWS ? S.path : SOLUTION;
        const DRAW0 = 0.7, DRAW = 2.6, reachT = (r) => DRAW0 + DRAW * r / (ROWS - 1);
        // The grid as printed, her crossing drawn over it in gold, each slab lighting up as the line reaches it
        let cells = '';
        GRID.forEach((rw, r) => rw.forEach((s, c) => {
          const on = path[r] === c;
          cells += s ? `<g class="pl-cell${on ? ' is-on' : ''}" ${on ? `style="--t:${reachT(r).toFixed(2)}s"` : ''}><rect x="${c * 10 + 0.6}" y="${r * 10 + 0.6}" width="8.8" height="8.8" rx="1.2"/><text class="n" x="${c * 10 + 5}" y="${r * 10 + 4.6}">${s[0]}</text><text class="l" x="${c * 10 + 5}" y="${r * 10 + 8.4}">${s[1]}</text></g>`
            : `<g class="pl-sink"><rect x="${c * 10 + 0.6}" y="${r * 10 + 0.6}" width="8.8" height="8.8" rx="1.2"/><path d="M${c * 10 + 2.6} ${r * 10 + 2.6}l4.8 4.8M${c * 10 + 7.4} ${r * 10 + 2.6}l-4.8 4.8"/></g>`;
        }));
        const pts = path.map((c, r) => `${c * 10 + 5},${r * 10 + 5}`).join(' ');
        const misses = (S.sinks || 0) + (S.cracks || 0);
        const flawless = misses === 0 && (S.heavy || 0) === 0 && mins > 0;
        reward.box.innerHTML = `<div class="rw-rays" aria-hidden="true"></div>
          <div class="rw-sparks" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--a:${(i * 360 / 22).toFixed(0)}deg;--d:${(140 + (i % 5) * 40)}px;--t:${(0.9 + (i % 4) * 0.2).toFixed(1)}s"></i>`).join('')}</div>
          <div class="chasm3d-reward-card">
          <div class="chasm3d-reward-kicker">Station 11 · The Salt Playa</div>
          <h3 class="chasm3d-reward-title">Across the Salt!</h3>
          <p class="rw-sub">Seven measured footsteps, seven letters under the salt, and solid sand on the south shore.</p>
          <div class="rw-grid">
            <section class="rw-map playa-rw-map" aria-label="Your crossing of the salt">
              <div class="rw-label">Your crossing, on the page</div>
              <svg viewBox="-1 -1 72 72" aria-hidden="true">
                <polyline class="rw-road-glow" points="${pts}" pathLength="1" style="--d0:${DRAW0}s;--dd:${DRAW}s"/>
                <polyline class="rw-road" points="${pts}" pathLength="1" style="--d0:${DRAW0}s;--dd:${DRAW}s"/>
                ${cells}
              </svg>
              <div class="rw-ends"><span>▲ North Edge</span><span>South Shore ▼</span></div>
              ${mins > 0 ? `<div class="chasm3d-reward-stats">
                <div><b data-count="${mins}" data-time="1">${time}</b><span>on the salt</span></div>
                <div><b data-count="${misses}">${misses}</b><span>false steps</span></div>
                <div><b data-count="${S.heavy || 0}">${S.heavy || 0}</b><span>heavy steps</span></div>
              </div>` : ''}
              ${flawless ? '<div class="rw-flawless">✦ A measured crossing ✦</div>' : ''}
            </section>
            <section class="rw-loot">
              <div class="chasm3d-reward-word"><span>The Passage Keyword</span>
                <strong aria-label="CRYSTAL">${KEYWORD.split('').map((l, i) => `<em style="--i:${i}">${l}</em>`).join('')}</strong>
                <small>Write it in the seven boxes of the Waypoint Log, on the page “The Salt Playa (Dry Basin)” of your journal.</small></div>
              <div class="rw-ledger playa-rw-ledger">
                <div class="rw-ledger-text">
                  <div class="rw-ledger-kicker">The Cipher Ledger · a line to check</div>
                  <div class="rw-ledger-title">The Line of the Salt</div>
                  <div class="rw-eq" aria-label="T minus A equals 9"><i>T</i><u>−</u><i>A</i><u>=</u><b>9</b></div>
                  <p>Cut into the marker on the south shore, with two letters of CRYSTAL. No new letter: a line to prove the ones you work out.</p>
                </div>
              </div>
              <div class="rw-ledger playa-rw-balance">
                <figure class="playa-balance-icon" aria-hidden="true"><svg viewBox="-32 -30 64 56"><path d="M0 -24 V18 M-16 22 H16 M-26 -14 H26"/><circle cy="-24" r="3"/><path d="M-26 -14 L-34 2 H-18 Z M26 -14 L18 2 H34 Z"/></svg></figure>
                <div class="rw-ledger-text">
                  <div class="rw-ledger-kicker">Found in the marker · a new instrument</div>
                  <div class="rw-ledger-title">The Surveyor's Balance</div>
                  <p>A little brass balance of the Order, now in your Cipher Ledger. Lay a sum on one pan and a difference on the other, and it shows you how to weigh out the two letters.</p>
                </div>
              </div>
              <div class="rw-next">Next · Station 12 · The Desert Lexicon</div>
            </section>
          </div>
          <div class="chasm3d-reward-actions">
            <button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>
            <button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay on the shore</button>
          </div>
        </div>`;
        if (!rewardOpen()) reward.back = document.activeElement;
        reward.box.hidden = false;
        reward.box.classList.remove('is-fast');
        replay(reward.box, 'is-on');
        if (soundOn() && !quiet) {
          path.forEach((c, r) => tone(NOTE[['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'E6'][r]], reachT(r), 0.9, { gain: 0.07, type: 'triangle' }));
          tone(110, 4.35, 0.5, { gain: 0.16, to: 55 });
          tone(NOTE.C6, 4.4, 1.4, { gain: 0.06, type: 'triangle' });
        }
        const counters = [...reward.box.querySelectorAll('[data-count]')];
        const fmt = (b, v) => (b.dataset.time ? `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, '0')} min` : String(v));
        if (!quiet) counters.forEach((b) => {
          const end = +b.dataset.count, t0 = performance.now() + 3400;
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
          closePlaya();
          if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
        });
        reward.box.querySelector('.chasm3d-reward-stay').addEventListener('click', () => hideReward());
        reward.box.querySelector('.chasm3d-reward-wire').focus({ preventScroll: true });
      }
      function hideReward(quietly) {
        if (!rewardOpen()) return;
        reward.box.hidden = true;
        const back = reward.back;
        reward.back = null;
        if (quietly) return;
        if (back && document.contains(back) && back.offsetParent) back.focus({ preventScroll: true });
        else focusFirst();
      }

      // ---- How to play: three short pages, the first time she opens the salt and whenever she asks ----
      const howto = { box: $('playa3d-howto'), page: 0, back: null };
      const howtoPages = howto.box ? [...howto.box.querySelectorAll('.chasm3d-howto-page')] : [];
      const howtoOpen = () => !!howto.box && !howto.box.hidden;
      function showHowto(page) {
        if (!howto.box) return;
        const was = howtoOpen() ? howto.page : -1;
        if (!howtoOpen()) howto.back = document.activeElement;
        howto.page = Math.max(0, Math.min(howtoPages.length - 1, page));
        howtoPages.forEach((p, i) => { p.hidden = i !== howto.page; p.classList.remove('is-fwd', 'is-back'); });
        if (was >= 0 && was !== howto.page) replay(howtoPages[howto.page], howto.page > was ? 'is-fwd' : 'is-back');
        $('playa3d-howto-count').textContent = `${howto.page + 1} of ${howtoPages.length}`;
        [...($('playa3d-howto-dots')?.children || [])].forEach((d, i) => d.classList.toggle('is-on', i === howto.page));
        $('btn-playa-howto-back').disabled = howto.page === 0;
        $('btn-playa-howto-next').textContent = howto.page === howtoPages.length - 1 ? 'Onto the salt' : 'Next →';
        howto.box.hidden = false;
        $('btn-playa-howto-next').focus({ preventScroll: true });
      }
      function hideHowto() {
        if (!howtoOpen()) return;
        howto.box.hidden = true;
        put(HOWTO_KEY, 'seen');
        const back = howto.back;
        howto.back = null;
        if (back && back.id !== 'btn-playa-howto' && document.contains(back) && back.offsetParent) back.focus({ preventScroll: true });
        else focusFirst();
      }
      if (howto.box) {
        $('btn-playa-howto-next').addEventListener('click', () => (howto.page === howtoPages.length - 1 ? hideHowto() : showHowto(howto.page + 1)));
        $('btn-playa-howto-back').addEventListener('click', () => showHowto(howto.page - 1));
        $('btn-playa-howto-skip').addEventListener('click', hideHowto);
        $('btn-playa-howto').addEventListener('click', () => showHowto(0));
        window.addEventListener('keydown', (e) => {
          if (rewardOpen() && modal.style.display !== 'none' && e.key !== 'Tab') { e.stopPropagation(); if (e.key === 'Escape') hideReward(); return; }
          if (!howtoOpen() || modal.style.display === 'none' || e.key === 'Tab') return;
          e.stopPropagation();
          if (e.key === 'Escape') hideHowto();
        }, true);
      }
      function closePlaya() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (view.walk) finishWalk();
        if (view.phase === 'test') { endGauge(); showChoice(); }
        clearTimeout(rest.t);
        if (howto.box) howto.box.hidden = true;
        hideReward(true);
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('closing');
          const speaker = document.getElementById('ambience-toggle');
          if (speaker && modal.contains(speaker)) document.body.appendChild(speaker);
          document.dispatchEvent(new Event('playa:closed'));
        }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      function crossAgain() {
        hideReward(true);
        S = fresh();
        save();
        if (el.victory) el.victory.style.display = 'none';
        view.mirageAt = -1;
        placeHermes();
        paintSlabs();
        paintPrints();
        paintHud();
        showChoice("Back on the North Edge, by the tripod, for one more crossing. The wind has smoothed the salt again, and every slab looks the same.");
      }

      window.openSaltPlayaModal = openPlaya;
      window.closeSaltPlayaModal = closePlaya;
      if (el.close) el.close.addEventListener('click', closePlaya);
      if (el.again) el.again.addEventListener('click', crossAgain);
      if ($('btn-playa-reward')) $('btn-playa-reward').addEventListener('click', () => showReward());
      if (el.finish) el.finish.addEventListener('click', () => {
        closePlaya();
        if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
      });
      modal.addEventListener('click', (e) => { if (e.target === modal) closePlaya(); });

      // Test hook (scripts/audit/web_smoke.py)
      window.__playa = {
        state: () => Object.assign({ phase: view.phase, gl: !!G, reach: S ? reach() : [], drawn: G ? G.renderer.info.render.calls : 0, band: [BAND_C - bandHalf(), BAND_C + bandHalf()] }, S),
        edge: (d) => { alongEdge(d); finishWalk(); return view.phase; },
        pick: (c) => { choose(c); return view.phase; },
        lean: (w) => { if (view.phase !== 'test') return view.phase; release(w); if (view.walk) finishWalk(); return view.phase; },
        measured: () => BAND_C,
        goOn: () => goOn(),
        walkOn: () => { const b = el.controls.querySelector('.chasm3d-btn.is-way'); if (b) b.click(); return view.phase; },
        endRest: () => { if (view.phase === 'rest') endRest(); },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) tick(performance.now() + i * 33, 1 / 30); },
        letters: () => (G ? G.slabs.flat().filter((s) => s.letter).map((s) => ({ y: s.letter.position.y, z: s.letter.position.z, a: s.letter.material.opacity, cam: G.camera.position.toArray().map((v) => +v.toFixed(2)) })) : [])
      };
    })();
