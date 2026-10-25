    // =========================================================================
    // Station 12 · The Desert Lexicon: "The Steles of Camp VII", one night in the nomad ruins with Hermes (three.js)
    // =========================================================================
    // The raiders rode south at dusk and left two men behind to watch their back trail: one asleep by the fire, one
    // walking a slow round with a torch that passes the three steles. The night is told in three acts:
    // I.   The Crossword Stele. The ten words of the page "The Desert Lexicon & Al-Qibla" are carved in a net on the
    //      middle stele, every groove packed with sand. Silvia reads a word from her page and Hermes brushes it clean.
    //      The watcher's round is turn-based and always told: every brush or wait moves him one place on. While he turns
    //      toward the steles or stands by them, Hermes must lie still, or the scrape is heard. No reflexes, no time limit.
    // II.  Al-Qibla. When the seven circled squares are clean, Hermes creeps to the tallest stele: Silvia types the
    //      Desert Sigil into the seven windows of the bronze dial, then turns the freed needle to the vector printed on
    //      her page. It locks with a chime, the needle's shadow lights the line [R] × 2 = [F] on the second stele…
    // III. The Ambush. …and the chime wakes the camp. Hermes runs into the walls of the old camp, where the nomads cut a
    //      letter over every doorway: the true way follows the sigil, letter by letter. Hidden in the dark, he lets the
    //      torches pass, and at the cold hearth reads what the raider scratched there at dusk: their sign and their name.
    // Every mistake costs time under the moon (the clock runs toward midnight), never the game.
    (function initDesertLexicon() {
      const modal = document.getElementById('modal-desert-lexicon');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const el = {
        stage: $('lex3d-stage'), canvas: $('lex3d-canvas'), fade: $('lex3d-fade'), subtitle: $('lex3d-subtitle'),
        sigil: $('lex3d-sigil'), rose: $('lex3d-rose'), facing: $('lex3d-facing'), clock: $('lex3d-clock'), watch: $('lex3d-watch'), hearts: $('lex3d-hearts'),
        voice: $('lex3d-voice'), where: $('lex3d-where'), controls: $('lex3d-controls'),
        victory: $('lexicon-victory-card'), finish: $('btn-lexicon-finish'), again: $('btn-lexicon-again'), close: $('btn-close-lexicon')
      };
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const isDone = () => get('order_desert_lexicon_completed') === 'true';
      const soundOn = () => !(window.EclipseAmbience && window.EclipseAmbience.state().muted);
      const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const toast = (msg) => { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); };
      const isTester = () => (typeof window.isAdminTester === 'function' && window.isAdminTester()) || (typeof isCarlesTester === 'function' && isCarlesTester());
      const WALK_KEY = 'order_lexicon_walk';
      const HOWTO_KEY = 'order_lexicon_howto';

      // ---- The crossword exactly as printed on the page "The Desert Lexicon & Al-Qibla" (11A) ----
      const WORDS = [
        { id: 'ac-2', n: 2, dir: 'across', r: 2, c: 1, answer: 'SIROCCO' },
        { id: 'ac-3', n: 3, dir: 'across', r: 6, c: 3, answer: 'NOMAD' },
        { id: 'ac-6', n: 6, dir: 'across', r: 9, c: 4, answer: 'OASIS' },
        { id: 'ac-8', n: 8, dir: 'across', r: 11, c: 5, answer: 'ECLIPSE' },
        { id: 'ac-9', n: 9, dir: 'across', r: 13, c: 5, answer: 'HORIZON' },
        { id: 'dn-1', n: 1, dir: 'down', r: 0, c: 3, answer: 'CARAVAN' },
        { id: 'dn-2', n: 2, dir: 'down', r: 2, c: 1, answer: 'SPHINX' },
        { id: 'dn-4', n: 4, dir: 'down', r: 6, c: 5, answer: 'MIRAGE' },
        { id: 'dn-5', n: 5, dir: 'down', r: 7, c: 10, answer: 'DUNES' },
        { id: 'dn-7', n: 7, dir: 'down', r: 9, c: 8, answer: 'SPIRIT' }
      ];
      WORDS.forEach((w) => { w.len = w.answer.length; w.label = `${w.n} ${w.dir === 'across' ? 'Across' : 'Down'}`; });
      const WORD = Object.fromEntries(WORDS.map((w) => [w.id, w]));
      const cellsOf = (w) => Array.from({ length: w.len }, (_, i) => (w.dir === 'across' ? [w.r, w.c + i] : [w.r + i, w.c]));
      // The seven circled squares, numbered 1 to 7 as on the page: their letters spell the Desert Sigil
      const CIRCLES = [
        { r: 11, c: 9, word: 'ac-8' }, { r: 13, c: 5, word: 'ac-9' }, { r: 2, c: 4, word: 'ac-2' }, { r: 10, c: 10, word: 'dn-5' },
        { r: 6, c: 3, word: 'ac-3' }, { r: 9, c: 7, word: 'ac-6' }, { r: 7, c: 1, word: 'dn-2' }
      ];
      const SIGIL = 'PHOENIX', BEARING = 194, TAIL = 14;
      const GRID_R = 15, GRID_C = 12;
      const CELL = {};
      WORDS.forEach((w) => cellsOf(w).forEach(([r, c], i) => {
        const k = `${r},${c}`;
        if (!CELL[k]) CELL[k] = { r, c, letter: w.answer[i], words: [], circle: CIRCLES.findIndex((o) => o.r === r && o.c === c) + 1, num: null };
        CELL[k].words.push(w.id);
      }));
      WORDS.forEach((w) => { CELL[`${w.r},${w.c}`].num = w.n; });
      const circleWords = [...new Set(CIRCLES.map((o) => o.word))];

      // ---- The watcher's round, one place per action of hers: where he is, and whether a scrape would carry to him ----
      const WATCH = [
        { at: 'by the fire, his back to the steles', hud: 'Back turned', safe: true },
        { at: 'with the camels, checking their hobbles', hud: 'At the camels', safe: true },
        { at: 'at the north edge of the ruins, looking out along the trail we came by', hud: 'Far off', safe: true },
        { at: 'turning back toward the steles, his torch swinging this way', hud: 'Turning this way!', safe: false },
        { at: 'right by the steles, ten paces from Hermes', hud: 'Ten paces away!', safe: false },
        { at: 'past the steles, going down to the dry cistern', hud: 'Going away', safe: true }
      ];
      // The walls of the old camp: seven rows of three doorways, a letter cut over each; the true way spells the sigil
      // (ways: -1 west, 0 straight on, +1 east; seen from behind Hermes running south, east is on his left)
      const FLEE = [
        ['R', 'P', 'B'], ['N', 'K', 'H'], ['O', 'Q', 'C'], ['F', 'L', 'E'], ['M', 'N', 'W'], ['I', 'T', 'L'], ['K', 'Y', 'X']
      ];
      const FLEE_SOL = FLEE.map((row, i) => row.indexOf(SIGIL[i]) - 1);
      const START_MIN = 21 * 60 + 50;
      // What a mistake costs: minutes of the night (the moon climbs toward midnight)
      const COST = { brush: 6, wait: 5, wrong: 5, heard: 20, dial: 5, bearing: 5, dead: 8 };
      const PAGE = 'the page “The Desert Lexicon & Al-Qibla”';

      const hints = window.EclipseHints.define({
        id: 's12-lexicon', station: 'Station 12', title: 'the desert lexicon', group: 'desert',
        anchor: () => el.controls,
        solved: () => isDone() || !!(S && S.atDial),
        texts: [
          `You do not need all ten words, Silvia. Look at the circled squares on ${PAGE}: seven words pass through them, and only those seven must be clean for the dial. Start with the clues you are surest of, and watch the torch before every brush.`,
          'Each clue is one desert word, and the little grid shows how long it is. Where two words cross they share a letter, so every word you are sure of gives you letters of the words that cross it. The watcher only hears you while he is turning toward the steles or standing by them: lie still then, and brush when his back is turned.',
          'Let us find one together. 3 Across, five letters: the eternal wanderer whose only roof is the stars. Someone with no house, who moves with the seasons and sleeps under the sky: a NOMAD. Its first square is circled, so it is a letter of the sigil. Now look at the words that cross it.'
        ]
      });
      const dialHints = window.EclipseHints.define({
        id: 's12-dial', station: 'Station 12', title: 'the Al-Qibla dial', group: 'desert',
        anchor: () => el.where,   // its own place, above the dial (the note of the stele stays under the controls)
        solved: () => isDone() || !!(S && S.flee && S.flee.length >= FLEE.length),
        active: () => !!(S && S.atDial),
        texts: [
          `The seven windows of the dial want the Desert Sigil: the circled letters of ${PAGE}, read in order from 1 to 7. Then the needle wants a bearing, and the page gives it in its own title.`,
          'Look at the line under the title of the page: “Al-Qibla Vector”, and a number of degrees with a direction after it. Turn the needle there. In the walls, after the chime, read the letter over each doorway: the nomads marked their way with the same word that woke the dial.',
          'Let us take the first steps together. Each circled square is one letter of the sigil, numbered 1 to 7: the circle in NOMAD (3 Across) is number 5, so it is the fifth letter, an N. Fill the other six from your page. In the walls, the doorway of the first wall carries the first letter of the sigil, the second wall the second, and so on. And the needle wants its head on the vector of the title, not its tail.'
        ]
      });

      // The openings and endings that the engine plays itself (EclipsePaint.cinema): seen once, then skipped
      const CINE_INTRO = 'order_lexicon_cine_intro', CINE_OUTRO = 'order_lexicon_cine_outro';
      let cine = null;

      // ---- State (saved at every action, so she can close the Hub and come back to the same moment of the night) ----
      let S = null;
      function fresh() {
        return { carved: [], watch: 0, min: START_MIN, wrong: 0, heard: 0, waits: 0, atDial: false, sigil: false, locked: false,
                 dialWrong: 0, bearWrong: 0, flee: [], dead: 0, tried: {}, hidden: false, hearts: HEARTS, tries: 1 };
      }
      // Three hearts for the whole night: a word that does not fit, a scrape the watcher hears, a wrong sigil, a wrong
      // bearing or a false doorway costs one. The third loses the night, and the steles are read again from the first
      // word; the counts of her mistakes go with her into the next night.
      const HEARTS = 3;
      function startOver() {
        const keep = {};
        ['wrong', 'heard', 'waits', 'dialWrong', 'bearWrong', 'dead'].forEach((k) => { keep[k] = S[k]; });
        S = Object.assign(fresh(), keep, { tries: (S.tries || 1) + 1 });
      }
      function load() {
        try {
          const s = JSON.parse(get(WALK_KEY) || 'null');
          if (s && Array.isArray(s.carved)) {
            const t = Object.assign(fresh(), s);
            t.carved = t.carved.filter((id) => WORD[id]);
            if (!Array.isArray(t.flee) || !t.flee.every((d, i) => d === FLEE_SOL[i])) { t.flee = []; t.tried = {}; }
            if (!t.tried || typeof t.tried !== 'object') t.tried = {};
            t.watch = ((t.watch | 0) % WATCH.length + WATCH.length) % WATCH.length;
            if (t.atDial && !circleWords.every((id) => t.carved.includes(id))) { t.atDial = false; t.sigil = false; t.locked = false; }
            t.hearts = Math.max(0, Math.min(HEARTS, t.hearts | 0));
            if (t.hearts <= 0) { S = t; startOver(); return S; }   // closed on the card of the third heart
            return t;
          }
        } catch (e) {}
        return fresh();
      }
      function save() { put(WALK_KEY, JSON.stringify(S)); }
      const circlesClean = () => circleWords.every((id) => S.carved.includes(id));
      const sigilFound = () => CIRCLES.map((o) => (S.carved.includes(o.word) ? CELL[`${o.r},${o.c}`].letter : ''));
      // Where she is in the night: at the crossword, at the dial, in the walls, or past the danger
      const stage = () => (!S.atDial ? 'stele' : !S.sigil ? 'sigil' : !S.locked ? 'bearing' : S.flee.length < FLEE.length ? 'flee' : 'done');

      // =====================================================================
      // The world: the ruins of Camp VII under the moon
      // =====================================================================
      const P = window.EclipsePaint;
      let G = null;
      // Places in the square (north is -Z). The steles stand in the middle, facing south, where Hermes crouches.
      const STELE = { x: 0, z: -0.6 }, DIAL = { x: 4.4, z: -1.5 }, CURB = { x: -4.2, z: -1.3 };
      const HERE = { x: 0.15, z: 1.25 }, AT_DIAL = { x: 4.4, z: 0.35 };
      const FIRE = { x: -8.5, z: -6.5 }, HEARTH = { x: -7.3, z: -5.1 }, AT_HEARTH = { x: -5.6, z: -5.4 };
      const WATCH_AT = [[-6.9, -4.9], [-12.2, -10.6], [-2.8, -15.5], [-3.4, -6.4], [-1.95, -1.55], [-9.4, 2.3]];
      // The walls of the old camp, south of the square: row i of doorways at FZ(i), centred on its lane
      const FZ0 = 12, FDZ = 4.4, FD = 2.8;
      const FZ = (i) => FZ0 + i * FDZ;
      const LANE = FLEE_SOL.reduce((a, d, i) => { a.push(a[i] + d * FD); return a; }, [0]);
      const NICHE = { x: LANE[FLEE.length], z: FZ(FLEE.length - 1) + 3.4 };

      function letterTex(ch, opts) {
        const o = opts || {};
        return P.canvasTex(128, 128, (g, w, h) => {
          g.fillStyle = o.bg || '#8a6a4e'; g.fillRect(0, 0, w, h);
          const r2 = P.rng(ch.charCodeAt(0) * 7 + (o.seed || 0));
          for (let i = 0; i < 90; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(40,24,14,0.18)' : 'rgba(255,236,200,0.12)'; g.fillRect(r2() * w, r2() * h, 2 + r2() * 5, 2 + r2() * 3); }
          g.font = `700 ${o.size || 84}px Cinzel, Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = 'rgba(255,240,210,0.45)'; g.fillText(ch, w / 2 + 2, h / 2 + 5);
          g.fillStyle = o.ink || '#2a160c'; g.fillText(ch, w / 2, h / 2 + 3);
        });
      }
      // The phoenix of the raiders, as they burn and scratch it: a bird rising out of three flames
      function drawPhoenix(g, cx, cy, s, ink, lw) {
        g.save(); g.translate(cx, cy); g.scale(s, s);
        g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = lw / s; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath();   // wings raised
        g.moveTo(0, -6); g.bezierCurveTo(-18, -14, -34, -34, -44, -58); g.bezierCurveTo(-30, -46, -22, -44, -14, -40);
        g.bezierCurveTo(-20, -30, -12, -20, 0, -12);
        g.moveTo(0, -6); g.bezierCurveTo(18, -14, 34, -34, 44, -58); g.bezierCurveTo(30, -46, 22, -44, 14, -40);
        g.bezierCurveTo(20, -30, 12, -20, 0, -12);
        g.stroke();
        g.beginPath(); g.arc(0, -22, 5, 0, Math.PI * 2); g.stroke();   // head
        g.beginPath(); g.moveTo(0, -27); g.lineTo(-3, -36); g.moveTo(0, -27); g.lineTo(3, -35); g.stroke();   // crest
        g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 8); g.stroke();   // body
        g.beginPath();   // three flames under it
        [-14, 0, 14].forEach((x, i) => { const hh = i === 1 ? 30 : 22; g.moveTo(x - 7, 30); g.quadraticCurveTo(x - 6, 30 - hh * 0.6, x, 30 - hh); g.quadraticCurveTo(x + 6, 30 - hh * 0.6, x + 7, 30); });
        g.stroke();
        g.restore();
      }

      function buildWorld() {
        const T = window.THREE;
        if (!P) return null;
        if (T.ColorManagement) T.ColorManagement.legacyMode = false;
        let renderer;
        try {
          renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' });
        } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(lowPower ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.outputEncoding = T.sRGBEncoding;
        renderer.toneMapping = T.NoToneMapping;
        const scene = new T.Scene();
        scene.fog = new T.Fog(0x1b2142, 26, 95);
        const camera = new T.PerspectiveCamera(50, 16 / 10, 0.1, 500);
        const rand = P.rng(1212);

        // ---- The night sky: deep indigo, a band of the Milky Way, thousands of stars, and the moon over the south ----
        const skyGeo = new T.SphereGeometry(300, 32, 16), sc = new Float32Array(skyGeo.attributes.position.count * 3);
        const zen = new T.Color(0x050819), hor = new T.Color(0x29305e), glowC = new T.Color(0x4a3f6e), cc = new T.Color();
        for (let i = 0; i < skyGeo.attributes.position.count; i++) {
          const y = skyGeo.attributes.position.getY(i) / 300, z = skyGeo.attributes.position.getZ(i) / 300;
          cc.copy(hor).lerp(zen, Math.min(1, Math.max(0, y) * 1.6));
          if (y < 0.18 && z > 0) cc.lerp(glowC, (0.18 - Math.max(0, y)) / 0.18 * 0.5 * z);   // the faint glow of the south, under the moon
          sc.set([cc.r, cc.g, cc.b], i * 3);
        }
        skyGeo.setAttribute('color', new T.BufferAttribute(sc, 3));
        const sky = new T.Mesh(skyGeo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false, toneMapped: false }));
        scene.add(sky);
        const starTex = P.canvasTex(64, 64, (g, w) => {   // a round, soft point: stars are never little squares
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const starsOf = (n, size, seed, op) => {
          const r2 = P.rng(seed), v = new Float32Array(n * 3);
          for (let i = 0; i < n; i++) {
            const a = r2() * Math.PI * 2, y = 0.06 + Math.pow(r2(), 0.8) * 0.94, rr = Math.sqrt(1 - y * y);
            v.set([Math.cos(a) * rr * 280, y * 280, Math.sin(a) * rr * 280], i * 3);
          }
          const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(v, 3));
          const m = new T.Points(g, new T.PointsMaterial({ color: 0xf2f4ff, size: size * 2.1, sizeAttenuation: false, map: starTex, transparent: true, opacity: op, fog: false, depthWrite: false, blending: T.AdditiveBlending }));
          scene.add(m);
          return m;
        };
        const stars = [starsOf(1600, 1.3, 5, 0.75), starsOf(380, 2.2, 9, 0.9), starsOf(60, 3.2, 13, 1)];
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const milky = new T.Sprite(new T.SpriteMaterial({ map: P.canvasTex(256, 64, (g, w, h) => {
          const r2 = P.rng(31);
          for (let i = 0; i < 260; i++) {
            const x = r2() * w, y = h / 2 + (r2() - 0.5) * h * 0.55 * Math.sin(x / w * Math.PI), rr = 4 + r2() * 14;
            const gr = g.createRadialGradient(x, y, 0, x, y, rr);
            gr.addColorStop(0, `rgba(${200 + r2() * 40 | 0},${190 + r2() * 40 | 0},255,0.09)`); gr.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
          }
        }), fog: false, depthWrite: false, transparent: true, opacity: 0.85, toneMapped: false, rotation: 0.5 }));
        milky.scale.set(420, 90, 1); milky.position.set(-40, 170, -170);
        scene.add(milky);
        const moonTex = P.canvasTex(256, 256, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, w * 0.17, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(220,232,255,0.55)'); gr.addColorStop(1, 'rgba(160,180,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
          g.fillStyle = '#f4f1e6'; g.beginPath(); g.arc(w / 2, w / 2, w * 0.17, 0, Math.PI * 2); g.fill();
          g.fillStyle = 'rgba(170,170,190,0.35)';
          [[-0.05, -0.04, 0.05], [0.06, 0.03, 0.035], [-0.02, 0.07, 0.03], [0.04, -0.07, 0.02]].forEach(([x, y, r]) => { g.beginPath(); g.arc(w / 2 + x * w, w / 2 + y * w, r * w, 0, Math.PI * 2); g.fill(); });
        });
        const moon = new T.Sprite(new T.SpriteMaterial({ map: moonTex, fog: false, depthWrite: false, transparent: true, toneMapped: false }));
        moon.scale.set(70, 70, 1); moon.position.set(70, 120, 230);
        scene.add(moon);

        // ---- Light: a cold moon from the south-east, a blue night all round, the fire and the torch in warm gold ----
        const hemi = new T.HemisphereLight(0x7080c4, 0x1c1830, 0.62);
        scene.add(hemi);
        const moonLight = new T.DirectionalLight(0xbccbff, 0.88);
        moonLight.position.set(16, 26, 22);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        Object.assign(moonLight.shadow.camera, { left: -21, right: 21, top: 21, bottom: -21, near: 1, far: 90 });   // a tighter frustum: sharper shadows from the same map
        moonLight.shadow.bias = -0.0006;
        scene.add(moonLight); scene.add(moonLight.target);
        const fireLight = new T.PointLight(0xff8a3c, 2.4, 18, 1.6);
        fireLight.position.set(FIRE.x, 1.2, FIRE.z);
        scene.add(fireLight);
        const torchLight = new T.PointLight(0xffa64a, 2.0, 11, 1.6);
        scene.add(torchLight);

        // ---- The sand: a flat square among the ruins, dunes all round, painted cool where the moon does not reach ----
        const gGeo = new T.PlaneGeometry(240, 240, 210, 210);
        gGeo.rotateX(-Math.PI / 2);
        const gp = gGeo.attributes.position, gc = new Float32Array(gp.count * 3);
        const sandHi = new T.Color(0xbba68c), sandLo = new T.Color(0x5c5f86), dune = (x, z) => {
          const r = Math.hypot(x, z - 10), k = Math.min(1, Math.max(0, (r - 24) / 26));
          return k * k * (2.6 * Math.sin(x * 0.09 + Math.cos(z * 0.05) * 2) + 1.8 * Math.cos(z * 0.08 + x * 0.03) + 2.2) + Math.sin(x * 0.7) * Math.cos(z * 0.6) * 0.04;
        };
        for (let i = 0; i < gp.count; i++) {
          const x = gp.getX(i), z = gp.getZ(i), y = dune(x, z), dy = dune(x + 0.5, z) - y;
          gp.setY(i, y);
          cc.copy(sandLo).lerp(sandHi, Math.min(1, Math.max(0, 0.55 + dy * 1.6 + y * 0.03)));
          gc.set([cc.r, cc.g, cc.b], i * 3);
        }
        gGeo.setAttribute('color', new T.BufferAttribute(gc, 3));
        gGeo.computeVertexNormals();
        // painted per pixel, so it never blurs or pixelates: wind ripples that catch the moon, a fine grain, glints of lit grains
        const sandTime = { value: 0 };
        const sandPaint = P.worldPainted(P.toon({ vertexColors: true }), { uTime: sandTime },
          `uniform float uTime;
float sHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float sNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(sHash(i), sHash(i + vec2(1.0, 0.0)), f.x), mix(sHash(i + vec2(0.0, 1.0)), sHash(i + vec2(1.0, 1.0)), f.x), f.y); }
`,
          `  vec2 p = vWp.xz;
  float w = sNoise(p * 0.35) * 5.0;
  float rip = sin(dot(p, vec2(0.93, 0.36)) * 3.4 + w) * 0.5 + 0.5;
  float rip2 = sin(dot(p, vec2(-0.2, 0.98)) * 7.5 + sNoise(p * 0.9) * 4.0) * 0.5 + 0.5;
  float near = 1.0 - smoothstep(18.0, 70.0, length(p));
  float grain = sHash(floor(p * 38.0));
  float m = 1.0 + (rip - 0.5) * 0.17 * (0.4 + near) + (rip2 - 0.5) * 0.09 * near + (grain - 0.5) * 0.07 * near + (sNoise(p * 0.12) - 0.5) * 0.1;
  diffuseColor.rgb *= m;
  diffuseColor.rgb += vec3(0.5, 0.55, 0.85) * step(0.9985, grain) * near * (0.5 + 0.5 * sin(uTime * 2.0 + grain * 40.0));`);
        const ground = new T.Mesh(gGeo, sandPaint);
        ground.receiveShadow = true;
        scene.add(ground);

        // ---- Mud-brick walls, broken at the top, and stone blocks fallen at their feet ----
        // mud brick in courses, with mortar that sits back (a bump map), and dressed stone: textures of 2 m a side
        const brickCv = (tint) => P.canvasTex(512, 512, (g, w, h) => {
          const r2 = P.rng(tint ? 31 : 17), rows = 8, bh = h / rows;
          g.fillStyle = '#5a4030'; g.fillRect(0, 0, w, h);
          for (let r = 0; r < rows; r++) {
            const bw = 128 + (r % 3) * 16, off = (r % 2) * bw / 2;
            for (let x = -bw; x < w + bw; x += bw) {
              const l = 0.9 + r2() * 0.22, c = tint ? [140 * l, 106 * l, 80 * l] : [176 * l, 138 * l, 106 * l];
              g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
              g.fillRect(x + off + 3, r * bh + 3, bw - 6, bh - 6);
              for (let k = 0; k < 14; k++) { g.fillStyle = r2() < 0.5 ? 'rgba(60,36,22,0.22)' : 'rgba(255,230,200,0.14)'; g.fillRect(x + off + 4 + r2() * (bw - 10), r * bh + 4 + r2() * (bh - 10), 2 + r2() * 5, 2 + r2() * 4); }
            }
          }
          for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(40,24,14,0.4)'; g.lineWidth = 1.5; g.beginPath(); let x = r2() * w, y = r2() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r2() - 0.5) * 30; y += 10 + r2() * 20; g.lineTo(x, y); } g.stroke(); }
        }, [1, 1]);
        const stoneCv = P.canvasTex(512, 512, (g, w, h) => {
          const r2 = P.rng(53);
          g.fillStyle = '#b89c7c'; g.fillRect(0, 0, w, h);
          for (let i = 0; i < 40; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(90,64,40,0.12)' : 'rgba(255,236,206,0.13)'; const rr = 12 + r2() * 40; g.beginPath(); g.arc(r2() * w, r2() * h, rr, 0, 7); g.fill(); }
          for (let i = 0; i < 1800; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(70,46,28,0.18)' : 'rgba(255,240,216,0.16)'; g.fillRect(r2() * w, r2() * h, 1 + r2() * 3, 1 + r2() * 3); }
        }, [1, 1]);
        const brickA = brickCv(false), brickB = brickCv(true);
        const brick = P.toon({ color: 0xffffff, map: brickA, bumpMap: brickA, bumpScale: 2.2 });
        const brickDark = P.toon({ color: 0xd8c0aa, map: brickB, bumpMap: brickB, bumpScale: 2.2 });
        const stone = P.toon({ color: 0xffffff, map: stoneCv, bumpMap: stoneCv, bumpScale: 1.6 });
        const box = new T.BoxGeometry(1, 1, 1);
        // a box whose texture runs in tiles of `tile` metres, so bricks keep their size on a long thin wall
        function sizedBox(w, h, d, tile) {
          const g = new T.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
          for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile); }
          return g;
        }
        const casters = [];
        function block(x, y, z, w, h, d, mat, ry) {
          const m = new T.Mesh(sizedBox(w, h, d, 2), mat || brick);
          m.position.set(x, y + h / 2, z); m.rotation.y = ry || 0;
          m.castShadow = true; m.receiveShadow = true;
          scene.add(m); casters.push(m);
          return m;
        }
        function wall(x1, z1, x2, z2, h, seed, gaps) {
          const len = Math.hypot(x2 - x1, z2 - z1), n = Math.max(1, Math.round(len / 0.9)), r2 = P.rng(seed), ry = -Math.atan2(z2 - z1, x2 - x1);
          for (let i = 0; i < n; i++) {
            const t = (i + 0.5) / n, x = x1 + (x2 - x1) * t, z = z1 + (z2 - z1) * t;
            if (gaps && gaps.some((g) => Math.hypot(x - g[0], z - g[1]) < (g[2] || 0.75))) continue;
            const hh = h * (0.55 + 0.45 * Math.abs(Math.sin(t * 7 + seed))) * (0.85 + r2() * 0.3);
            block(x, 0, z, len / n + 0.02, hh, 0.55, r2() < 0.3 ? brickDark : brick, ry);
            for (let k = 0; k < 2; k++) {   // loose bricks and a broken crown along the top
              if (r2() < 0.6) block(x + (r2() - 0.5) * 0.7, hh, z + (r2() - 0.5) * 0.3, 0.22 + r2() * 0.26, 0.13 + r2() * 0.16, 0.22 + r2() * 0.18, brickDark, ry + (r2() - 0.5) * 1.2);
            }
          }
          for (let i = 0; i < Math.round(len / 3); i++) {   // fallen bricks
            const t = r2(), s = 0.25 + r2() * 0.3;
            block(x1 + (x2 - x1) * t + (r2() - 0.5) * 1.6, 0, z1 + (z2 - z1) * t + (r2() - 0.5) * 1.6, s * 1.4, s * 0.6, s, brickDark, r2() * 3);
          }
        }
        // the old ring of the camp round the square, broken in many places (the south side gives onto the walls)
        const ring = [[-15, -17, 3], [-6, -19.5, 2.2], [5, -19, 2.6], [14, -15, 3], [18, -6, 2.4], [17.5, 3, 2.8], [-17, 3.5, 2.6], [-19, -6, 2.2]];
        ring.forEach((p, i) => { const q = ring[(i + 1) % ring.length]; if (i !== 5) wall(p[0], p[1], q[0], q[1], p[2], 40 + i, [[(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 1.2]]); });
        wall(-17, 3.5, -9, 4.6, 2.4, 61); wall(17.5, 3, 9.5, 4.6, 2.6, 62);
        // a roofless house in the north-east, and a broken arch in the north-west
        wall(8, -12, 12.5, -12, 2.8, 63, [[10, -12, 0.7]]); wall(12.5, -12, 12.5, -8, 2.8, 64); wall(8, -12, 8, -9, 2.4, 65);
        block(-12.4, 0, -14.2, 0.7, 3.2, 0.7, brick); block(-9.8, 0, -14.2, 0.7, 3.0, 0.7, brick); block(-11.1, 3.0, -14.2, 3.4, 0.5, 0.75, brickDark);

        // ---- The dry cistern: a low ring of stones round a black mouth ----
        const cis = new T.Group();
        const cr = new T.Mesh(new T.TorusGeometry(1.5, 0.35, 8, 24), stone); cr.rotation.x = Math.PI / 2; cr.position.y = 0.25; cis.add(cr);
        const hole = new T.Mesh(new T.CircleGeometry(1.25, 24), new T.MeshBasicMaterial({ color: 0x0a0812 })); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.06; cis.add(hole);
        cis.position.set(-10.5, 0, 4.5); scene.add(cis);

        // ---- The three steles ----
        const sandCv = P.canvasTex(512, 512, (g, w, h) => {
          const r2 = P.rng(91);
          const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#dcc096'); gr.addColorStop(1, '#bf9c74');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          for (let i = 0; i < 16; i++) { const y = r2() * h; g.strokeStyle = `rgba(${r2() < 0.5 ? '120,84,54' : '240,214,176'},${0.05 + r2() * 0.06})`; g.lineWidth = 4 + r2() * 18; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (r2() - 0.5) * 40, w * 0.7, y + (r2() - 0.5) * 40, w, y + (r2() - 0.5) * 30); g.stroke(); }
          for (let i = 0; i < 2400; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(90,58,34,0.2)' : 'rgba(255,240,214,0.18)'; g.fillRect(r2() * w, r2() * h, 1 + r2() * 3, 1 + r2() * 3); }
          for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(60,38,22,0.35)'; g.lineWidth = 1.5; g.beginPath(); let x = r2() * w, y = r2() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r2() - 0.5) * 24; y += 8 + r2() * 16; g.lineTo(x, y); } g.stroke(); }
        }, [1, 1]);
        const sandstone = P.rim(P.toon({ color: 0xf2e6d6, map: sandCv, bumpMap: sandCv, bumpScale: 0.9 }), 0x9fb4ff, 0.22);
        // I. The Crossword Stele: its face is a canvas, repainted whenever a word comes clean
        const SW = 3.4, SH = 4.6, SD = 0.62, CV_W = 960, CV_H = 1300;
        const GRID_X0 = 84, GRID_Y0 = 210, CS = 66;
        const faceCv = document.createElement('canvas'), glowCv = document.createElement('canvas'), baseCv = document.createElement('canvas');
        [faceCv, glowCv, baseCv].forEach((c) => { c.width = CV_W; c.height = CV_H; });
        (function paintBase(g, w, h) {
          const gr = g.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, '#d8b98f'); gr.addColorStop(0.6, '#c9a57c'); gr.addColorStop(1, '#a98260');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          const r2 = P.rng(77);
          for (let i = 0; i < 14; i++) {   // the bedding of the sandstone
            const y = r2() * h; g.strokeStyle = `rgba(${r2() < 0.5 ? '120,80,50' : '250,226,190'},${0.08 + r2() * 0.1})`; g.lineWidth = 6 + r2() * 26;
            g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (r2() - 0.5) * 60, w * 0.7, y + (r2() - 0.5) * 60, w, y + (r2() - 0.5) * 40); g.stroke();
          }
          for (let i = 0; i < 2600; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(90,58,34,0.16)' : 'rgba(255,240,214,0.16)'; g.fillRect(r2() * w, r2() * h, 1 + r2() * 3, 1 + r2() * 3); }
          // the sun disc carved at the top, and a band of old marks under it
          g.strokeStyle = 'rgba(70,42,24,0.7)'; g.lineWidth = 7;
          g.beginPath(); g.arc(w / 2, 92, 46, 0, Math.PI * 2); g.stroke();
          for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 58, 92 + Math.sin(a) * 58); g.lineTo(w / 2 + Math.cos(a) * (i % 2 ? 70 : 82), 92 + Math.sin(a) * (i % 2 ? 70 : 82)); g.stroke(); }
          g.lineWidth = 4;
          for (let i = 0; i < 22; i++) { const x = 70 + i * 38; g.beginPath(); g.moveTo(x, 172); g.lineTo(x + 12, 160); g.lineTo(x + 24, 172); g.stroke(); }
          for (let i = 0; i < 9; i++) { const x = 120 + i * 90; g.beginPath(); g.moveTo(x, CV_H - 70); g.lineTo(x + 40, CV_H - 70); g.moveTo(x + 20, CV_H - 90); g.lineTo(x + 20, CV_H - 50); g.stroke(); }
        })(baseCv.getContext('2d'), CV_W, CV_H);
        const faceTex = new T.CanvasTexture(faceCv); faceTex.encoding = T.sRGBEncoding; faceTex.anisotropy = 4;
        const glowTexS = new T.CanvasTexture(glowCv); glowTexS.encoding = T.sRGBEncoding;
        const faceMat = new T.MeshToonMaterial({ map: faceTex, emissive: 0xffffff, emissiveMap: glowTexS, gradientMap: sandstone.gradientMap });
        const steleI = new T.Mesh(new T.BoxGeometry(SW, SH, SD), [sandstone, sandstone, sandstone, sandstone, faceMat, sandstone]);
        steleI.position.set(STELE.x, 0.35 + SH / 2, STELE.z);
        steleI.castShadow = true; steleI.receiveShadow = true;
        scene.add(steleI);
        const plinthI = block(STELE.x, 0, STELE.z, SW + 0.6, 0.35, SD + 0.7, stone);
        block(STELE.x, 0.35, STELE.z, SW + 0.2, 0.12, SD + 0.3, stone);
        for (let k = 0; k < 7; k++) { const r3 = P.rng(300 + k); block(STELE.x + (r3() - 0.5) * (SW + 1.6), 0, STELE.z + 0.6 + r3() * 0.9, 0.16 + r3() * 0.2, 0.08 + r3() * 0.1, 0.14 + r3() * 0.2, stone, r3() * 3); }
        const capI = new T.Mesh(new T.BoxGeometry(SW + 0.3, 0.32, SD + 0.24), sandstone);
        capI.position.set(STELE.x, 0.35 + SH + 0.16, STELE.z); capI.castShadow = true; scene.add(capI);
        const capI2 = new T.Mesh(new T.BoxGeometry(SW * 0.55, 0.26, SD), sandstone); capI2.position.set(STELE.x, 0.35 + SH + 0.45, STELE.z); scene.add(capI2);
        // II. The stele of the proportion: shorter, with a stone curb at its foot where a line waits in the shadow
        const steleII = block(CURB.x, 0.3, CURB.z, 1.7, 3.4, 0.55, sandstone);
        block(CURB.x, 0, CURB.z, 2.3, 0.3, 1.2, stone);
        const curb = block(CURB.x, 0, CURB.z + 0.95, 2.1, 0.42, 0.5, stone);
        const lineTex = P.canvasTex(512, 96, (g, w, h) => {
          g.font = '700 54px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = '#ffe2a0'; g.fillText('[ R ] × 2 = [ F ]', w / 2, h / 2 + 2);
        });
        const curbLine = new T.Mesh(new T.PlaneGeometry(2.0, 0.38), new T.MeshBasicMaterial({ map: lineTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
        curbLine.position.set(CURB.x, 0.22, CURB.z + 1.205);
        scene.add(curbLine);
        const curbGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffc66a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        curbGlow.scale.set(3.2, 1.1, 1); curbGlow.position.set(CURB.x, 0.3, CURB.z + 1.4); scene.add(curbGlow);
        const curbMarks = new T.Mesh(new T.PlaneGeometry(1.4, 2.4), new T.MeshBasicMaterial({ map: P.canvasTex(128, 220, (g, w, h) => {
          g.strokeStyle = 'rgba(60,36,20,0.6)'; g.lineWidth = 5;
          for (let i = 0; i < 6; i++) { const y = 20 + i * 34; g.beginPath(); g.moveTo(16, y); g.lineTo(w - 16, y); g.stroke(); g.beginPath(); g.arc(w / 2, y + 16, 8, 0, Math.PI * 2); g.stroke(); }
        }), transparent: true, depthWrite: false }));
        curbMarks.position.set(CURB.x, 2.1, CURB.z + 0.28); scene.add(curbMarks);
        // III. Al-Qibla: the tallest, with the bronze sun compass set into its face
        const steleIII = block(DIAL.x, 0.3, DIAL.z, 2.0, 5.4, 0.6, sandstone);
        block(DIAL.x, 0, DIAL.z, 2.6, 0.3, 1.2, stone);
        const capIII = new T.Mesh(new T.BoxGeometry(2.3, 0.3, 0.84), sandstone);
        capIII.position.set(DIAL.x, 5.85, DIAL.z); capIII.castShadow = true; scene.add(capIII);
        const DIAL_Y = 3.15, DIAL_R = 0.72;
        const bronze = P.rim(P.toon({ color: 0xb98a4a, emissive: 0x3a2208, emissiveIntensity: 0.4 }), 0xffd28a, 0.5);
        const dialBack = new T.Mesh(new T.CylinderGeometry(DIAL_R + 0.12, DIAL_R + 0.12, 0.12, 40), bronze);
        dialBack.rotation.x = Math.PI / 2; dialBack.position.set(DIAL.x, DIAL_Y, DIAL.z + 0.33); scene.add(dialBack);
        const POINTS16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const dialCv = document.createElement('canvas'); dialCv.width = dialCv.height = 512;
        const dialTex = new T.CanvasTexture(dialCv); dialTex.encoding = T.sRGBEncoding;
        const dialFace = new T.Mesh(new T.CircleGeometry(DIAL_R, 64), new T.MeshToonMaterial({ map: dialTex, emissive: 0x2a1a08, gradientMap: sandstone.gradientMap }));
        dialFace.position.set(DIAL.x, DIAL_Y, DIAL.z + 0.395); scene.add(dialFace);
        const bezel = new T.Mesh(new T.TorusGeometry(DIAL_R + 0.06, 0.06, 8, 48), bronze);
        bezel.position.set(DIAL.x, DIAL_Y, DIAL.z + 0.4); scene.add(bezel);
        const needle = new T.Group();
        const shape = new T.Shape(); shape.moveTo(0, DIAL_R * 0.88); shape.lineTo(0.07, 0); shape.lineTo(0, -DIAL_R * 0.62); shape.lineTo(-0.07, 0); shape.closePath();
        const needleMat = new T.MeshBasicMaterial({ color: 0xffd98a, toneMapped: false });
        const nm = new T.Mesh(new T.ShapeGeometry(shape), needleMat); needle.add(nm);
        const hub = new T.Mesh(new T.CircleGeometry(0.07, 16), new T.MeshBasicMaterial({ color: 0x5a3a14 })); hub.position.z = 0.005; needle.add(hub);
        needle.position.set(DIAL.x, DIAL_Y, DIAL.z + 0.42); scene.add(needle);
        const dialGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd28a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        dialGlow.scale.setScalar(3.4); dialGlow.position.set(DIAL.x, DIAL_Y, DIAL.z + 0.6); scene.add(dialGlow);

        // ---- The rearguard's camp: the fire, a sleeper on his blanket, the watcher and his torch, two kneeling camels, a lance ----
        const fire = new T.Group();
        for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const s = new T.Mesh(new T.DodecahedronGeometry(0.22, 0), P.toon({ color: 0xb59a78 })); s.position.set(Math.cos(a) * 0.75, 0.1, Math.sin(a) * 0.75); s.castShadow = true; fire.add(s); }
        const logMat = P.toon({ color: 0x3a2618 });
        for (let i = 0; i < 4; i++) { const l = new T.Mesh(new T.CylinderGeometry(0.07, 0.08, 1.1, 6), logMat); l.rotation.set(Math.PI / 2 - 0.3, i * Math.PI / 4, 0); l.position.y = 0.18; fire.add(l); }
        const flames = [0xffd27a, 0xff9a3c, 0xff6a2a].map((col, i) => {
          const f = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
          f.scale.set(1.1 - i * 0.2, 1.6 - i * 0.3, 1); f.position.y = 0.7; fire.add(f); return f;
        });
        const embersN = 26, eG = new T.BufferGeometry(), eV = new Float32Array(embersN * 3);
        eG.setAttribute('position', new T.BufferAttribute(eV, 3));
        const embers = new T.Points(eG, new T.PointsMaterial({ color: 0xffb060, size: 0.13, map: glowTex, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending }));
        fire.add(embers);
        const emberSeed = Array.from({ length: embersN }, () => [rand() * 6, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6]);
        fire.position.set(FIRE.x, 0, FIRE.z);
        scene.add(fire);
        // the hearth stone the raider scratched at dusk: their sign, their name, and the way they rode
        const hearthCv = P.canvasTex(512, 384, (g, w, h) => {
          g.fillStyle = '#4a3c34'; g.fillRect(0, 0, w, h);
          const r2 = P.rng(11);
          for (let i = 0; i < 700; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(20,14,10,0.3)' : 'rgba(150,130,110,0.16)'; g.fillRect(r2() * w, r2() * h, 2 + r2() * 4, 2 + r2() * 4); }
          drawPhoenix(g, w / 2, 170, 2.0, 'rgba(240,226,200,0.92)', 4);
          g.font = '700 58px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(240,226,200,0.92)';
          g.fillText('B C   A S H E S', w / 2, 300);
          g.strokeStyle = 'rgba(240,226,200,0.8)'; g.lineWidth = 4;
          g.beginPath(); g.moveTo(w - 70, 40); g.lineTo(w - 86, 100); g.moveTo(w - 86, 100); g.lineTo(w - 98, 84); g.moveTo(w - 86, 100); g.lineTo(w - 72, 90); g.stroke();
          g.font = '600 26px Cinzel, Georgia, serif'; g.fillText('194', w - 78, 136);
        });
        // until Hermes bends over it, the stone shows only scratches: nothing readable (the name is the reward)
        const hearthPlain = P.canvasTex(512, 384, (g, w, h) => {
          g.fillStyle = '#4a3c34'; g.fillRect(0, 0, w, h);
          const r2 = P.rng(11);
          for (let i = 0; i < 700; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(20,14,10,0.3)' : 'rgba(150,130,110,0.16)'; g.fillRect(r2() * w, r2() * h, 2 + r2() * 4, 2 + r2() * 4); }
          g.strokeStyle = 'rgba(200,184,160,0.16)'; g.lineWidth = 3;
          for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(60 + r2() * 380, 90 + r2() * 220); g.lineTo(60 + r2() * 380, 90 + r2() * 220); g.stroke(); }
        });
        const hearthMat = new T.MeshToonMaterial({ map: hearthPlain, gradientMap: sandstone.gradientMap, emissive: 0x2a1408 });
        const hearth = new T.Mesh(new T.BoxGeometry(1.5, 0.16, 1.1), [stone, stone, hearthMat, stone, stone, stone]);
        hearth.position.set(HEARTH.x, 0.08, HEARTH.z); hearth.rotation.y = 0.35; hearth.receiveShadow = true;
        scene.add(hearth);

        // ---- The raiders' belongings and the small things of the desert: barrels and crates, saddle bags, firewood, a lantern
        // post, then pebbles, dry tufts and drifts of sand scattered over the whole camp ----
        const woodMat = P.toon({ color: 0x7a5232 }), woodDk = P.toon({ color: 0x4e3320 }), ironMat = P.toon({ color: 0x3a3a46 });
        const clothRed = P.toon({ color: 0x8a3a2c }), clothSand = P.toon({ color: 0xa88c5c }), ropeMat = P.toon({ color: 0xb09a6a });
        const prop = (mesh, x, y, z, ry, shadow) => { mesh.position.set(x, y, z); mesh.rotation.y = ry || 0; mesh.castShadow = shadow !== false; mesh.receiveShadow = true; scene.add(mesh); return mesh; };
        function barrel(x, z, k) {
          const g = new T.Group();
          const b = new T.Mesh(new T.CylinderGeometry(0.3, 0.26, 0.74, 18, 1), woodMat); b.position.y = 0.37; b.castShadow = true; g.add(b);
          [0.14, 0.5].forEach((y) => { const h = new T.Mesh(new T.TorusGeometry(y === 0.14 ? 0.272 : 0.298, 0.014, 6, 20), ironMat); h.rotation.x = Math.PI / 2; h.position.y = y + 0.07; g.add(h); });
          const lid = new T.Mesh(new T.CylinderGeometry(0.27, 0.27, 0.02, 18), woodDk); lid.position.y = 0.745; g.add(lid);
          g.position.set(x, dune(x, z), z); g.rotation.y = k; scene.add(g); return g;
        }
        function crate(x, z, s2, ry) {
          const g = new T.Group();
          const c = new T.Mesh(new T.BoxGeometry(0.62 * s2, 0.5 * s2, 0.62 * s2), woodMat); c.position.y = 0.25 * s2; c.castShadow = true; g.add(c);
          [[0.33, 0.33], [-0.33, 0.33], [0.33, -0.33], [-0.33, -0.33]].forEach(([a2, b2]) => { const post = new T.Mesh(new T.BoxGeometry(0.06 * s2, 0.52 * s2, 0.06 * s2), woodDk); post.position.set(a2 * s2, 0.25 * s2, b2 * s2); g.add(post); });
          const band = new T.Mesh(new T.BoxGeometry(0.64 * s2, 0.05 * s2, 0.64 * s2), woodDk); band.position.y = 0.38 * s2; g.add(band);
          g.position.set(x, dune(x, z), z); g.rotation.y = ry; scene.add(g); return g;
        }
        barrel(-5.9, -9.6, 0.3); barrel(-5.0, -9.1, 1.1); barrel(-5.5, -8.4, 2.0).scale.setScalar(0.85);
        crate(-7.2, -10.4, 1.15, 0.4); crate(-6.4, -10.7, 0.8, 1.1); crate(-6.9, -10.5, 0.7, 0.2).position.y += 0.57;
        // saddle bags by the sleeper, a coil of rope, a water skin
        [[-9.7, -3.4, 0.5], [-9.2, -3.1, -0.4]].forEach(([x, z, ry], i) => {
          const bag = new T.Mesh(new T.SphereGeometry(0.3, 14, 10), i ? clothRed : clothSand); bag.scale.set(1.15, 0.7, 0.8);
          prop(bag, x, dune(x, z) + 0.2, z, ry);
        });
        const rope = new T.Mesh(new T.TorusGeometry(0.28, 0.05, 8, 22), ropeMat); rope.rotation.x = Math.PI / 2; prop(rope, -8.3, dune(-8.3, -3.0) + 0.06, -3.0, 0);
        const skin2 = new T.Mesh(new T.SphereGeometry(0.2, 14, 10), P.toon({ color: 0x7a5a38 })); skin2.scale.set(0.8, 1.15, 0.8); prop(skin2, -10.6, dune(-10.6, -2.6) + 0.22, -2.6, 0.6);
        // firewood stacked by the fire
        for (let k = 0; k < 7; k++) {
          const log = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.8, 8), k % 2 ? woodMat : woodDk);
          log.rotation.z = Math.PI / 2; prop(log, -6.4, dune(-6.4, -7.7) + 0.07 + (k > 3 ? 0.12 : 0) + 0.0, -7.7 + (k % 4) * 0.13 - 0.2, 0.2 + (k % 3) * 0.05);
        }
        // a lantern on a post at the edge of the camp, with its little halo
        const post = new T.Mesh(new T.CylinderGeometry(0.05, 0.07, 2.1, 8), woodDk); prop(post, -3.6, dune(-3.6, -8.4) + 1.05, -8.4, 0);
        const lampHead = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.22, 10), new T.MeshBasicMaterial({ color: 0xffc46a, toneMapped: false }));
        prop(lampHead, -3.6, dune(-3.6, -8.4) + 2.05, -8.4, 0, false);
        const lampHalo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffb860, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
        lampHalo.scale.set(1.8, 1.8, 1); lampHalo.position.set(-3.6, dune(-3.6, -8.4) + 2.05, -8.4); scene.add(lampHalo);
        // pebbles, dry tufts and drifts, scattered round the whole camp
        const sr = P.rng(2024), clear = (x, z) => x > -5.5 && x < 6.5 && z > -3.6 && z < 3.6;   // the stele square keeps its clean sand
        const pebbleN = lowPower ? 260 : 560, pebbles = new T.InstancedMesh(new T.DodecahedronGeometry(0.12, 0), P.toon({ color: 0xffffff }), pebbleN), dm = new T.Object3D(), pc = new T.Color();
        for (let i = 0; i < pebbleN; i++) {
          let x, z; do { const a = sr() * Math.PI * 2, r = 3 + Math.pow(sr(), 0.7) * 30; x = Math.cos(a) * r; z = 6 + Math.sin(a) * r; } while (clear(x, z));
          const k = 0.5 + sr() * 1.2; dm.position.set(x, dune(x, z) + 0.03 * k, z); dm.rotation.set(sr() * 3, sr() * 3, sr() * 3); dm.scale.set(k, k * (0.55 + sr() * 0.3), k * (0.8 + sr() * 0.4)); dm.updateMatrix();
          pebbles.setMatrixAt(i, dm.matrix); pebbles.setColorAt(i, pc.setHSL(0.07 + sr() * 0.03, 0.2 + sr() * 0.15, 0.32 + sr() * 0.14));
        }
        pebbles.receiveShadow = true; scene.add(pebbles);
        const tuftN = lowPower ? 60 : 130, blades = new T.InstancedMesh(new T.ConeGeometry(0.045, 0.42, 4), P.toon({ color: 0x9a8a5a }), tuftN * 6);
        for (let i = 0; i < tuftN; i++) {
          let x, z; do { const a = sr() * Math.PI * 2, r = 5 + Math.pow(sr(), 0.7) * 28; x = Math.cos(a) * r; z = 6 + Math.sin(a) * r; } while (clear(x, z));
          for (let b2 = 0; b2 < 6; b2++) {
            dm.position.set(x + (sr() - 0.5) * 0.3, dune(x, z) + 0.17, z + (sr() - 0.5) * 0.3); dm.rotation.set((sr() - 0.5) * 0.7, sr() * 3, (sr() - 0.5) * 0.7);
            const k = 0.7 + sr() * 0.9; dm.scale.set(1, k, 1); dm.updateMatrix(); blades.setMatrixAt(i * 6 + b2, dm.matrix);
          }
        }
        scene.add(blades);

        const robeMat = P.toon({ color: 0x4a4250 }), robeMat2 = P.toon({ color: 0x5c4436 }), skinMat = P.toon({ color: 0x6e4b38 }), wrapMat = P.toon({ color: 0x24202c });
        function raider(robe) {
          const g = new T.Group();
          const body = new T.Mesh(new T.CylinderGeometry(0.17, 0.33, 1.3, 8), robe); body.position.y = 0.65; body.castShadow = true; g.add(body);
          const sh = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), robe); sh.scale.set(1.2, 0.6, 1); sh.position.y = 1.28; g.add(sh);
          const head = new T.Mesh(new T.SphereGeometry(0.16, 10, 8), skinMat); head.position.y = 1.52; g.add(head);
          const wrap = new T.Mesh(new T.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), wrapMat); wrap.position.y = 1.55; g.add(wrap);
          const scarf = new T.Mesh(new T.CylinderGeometry(0.17, 0.18, 0.13, 10), wrapMat); scarf.position.y = 1.44; g.add(scarf);
          const arm = new T.Group(); arm.position.set(0.22, 1.25, 0);
          const a = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.6, 6), robe); a.position.y = -0.25; arm.add(a);
          g.add(arm);
          g.userData = { arm, body };
          return g;
        }
        const watcher = raider(robeMat);
        const torch = new T.Group();
        const stick = new T.Mesh(new T.CylinderGeometry(0.03, 0.04, 0.8, 6), logMat); stick.position.y = 0.2; torch.add(stick);
        const tFlame = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffb35a, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        tFlame.scale.set(0.6, 0.9, 1); tFlame.position.y = 0.72; torch.add(tFlame);
        torch.position.set(0, -0.55, 0.1); torch.rotation.x = -0.6;
        watcher.userData.arm.add(torch);
        watcher.position.set(WATCH_AT[0][0], 0, WATCH_AT[0][1]);
        scene.add(watcher);
        const sleeper = raider(robeMat2);
        sleeper.userData.lying = 1;
        const blanket = new T.Mesh(new T.BoxGeometry(0.9, 0.05, 2.0), P.toon({ color: 0x7a3a2c })); blanket.position.set(FIRE.x - 2.0, 0.03, FIRE.z + 1.4); blanket.rotation.y = 0.4; scene.add(blanket);
        sleeper.position.set(FIRE.x - 2.0, 0.18, FIRE.z + 1.4);
        scene.add(sleeper);
        const torch2 = torch.clone(); torch2.visible = false; sleeper.userData.arm.add(torch2);
        const camelMat = P.toon({ color: 0x7a5c50 }), saddleMat = P.toon({ color: 0x6a2a24 });
        function camel() {
          const c = new T.Group(), parts = new T.Group();
          const body = new T.Mesh(new T.SphereGeometry(0.5, 10, 8), camelMat); body.scale.set(0.65, 0.5, 1.05); body.position.y = 1.05; parts.add(body);
          const hump = new T.Mesh(new T.SphereGeometry(0.3, 8, 6), camelMat); hump.position.set(0, 1.38, -0.05); parts.add(hump);
          const sad = new T.Mesh(new T.BoxGeometry(0.55, 0.12, 0.6), saddleMat); sad.position.set(0, 1.55, -0.05); parts.add(sad);
          const neck = new T.Mesh(new T.CylinderGeometry(0.08, 0.12, 0.75, 6), camelMat); neck.position.set(0, 1.3, 0.55); neck.rotation.x = 0.7; parts.add(neck);
          const head = new T.Mesh(new T.BoxGeometry(0.17, 0.15, 0.36), camelMat); head.position.set(0, 1.62, 0.8); parts.add(head);
          const legs = [[-0.17, 0.32], [0.17, 0.32], [-0.17, -0.32], [0.17, -0.32]].map(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(0.055, 0.045, 0.9, 5), camelMat); l.position.set(x, 0.45, z); parts.add(l); return l; });
          parts.traverse((m) => { m.castShadow = true; });
          c.add(parts);
          c.userData = { parts, legs, head, ph: rand() * 6 };
          return c;
        }
        const camels = [camel(), camel()];
        camels[0].position.set(-12.6, 0, -10.2); camels[0].rotation.y = 0.9;
        camels[1].position.set(-14.2, 0, -8.6); camels[1].rotation.y = 1.4;
        camels.forEach((c) => { c.userData.parts.position.y = -0.55; c.userData.legs.forEach((l) => { l.scale.y = 0.3; }); scene.add(c); });   // kneeling
        // the lance with the furled banner, planted by the fire
        const lance = new T.Group();
        const pole = new T.Mesh(new T.CylinderGeometry(0.035, 0.045, 3.6, 6), logMat); pole.position.y = 1.8; lance.add(pole);
        const bannerTex = P.canvasTex(256, 320, (g, w, h) => {
          g.fillStyle = '#3a1a14'; g.fillRect(0, 0, w, h);
          g.fillStyle = '#5a2418'; g.fillRect(10, 10, w - 20, h - 20);
          drawPhoenix(g, w / 2, 170, 1.9, '#ffb14a', 7);
        });
        const banner = new T.Mesh(new T.PlaneGeometry(1.1, 1.4, 8, 1), new T.MeshToonMaterial({ map: bannerTex, side: T.DoubleSide, emissive: 0x2a0c04, gradientMap: sandstone.gradientMap }));
        banner.geometry.translate(0.55, 0, 0);
        banner.position.set(0.04, 2.8, 0); banner.scale.x = 0.12;
        lance.add(banner);
        lance.position.set(FIRE.x + 1.6, 0, FIRE.z - 1.3); lance.rotation.z = -0.08;
        scene.add(lance);

        // ---- The walls of the old camp, south of the square: seven rows of three doorways, a letter over each ----
        const fleeRows = [], letterMats = {};
        const lintelGeo = new T.BoxGeometry(1.6, 0.62, 0.62), postGeo = new T.BoxGeometry(0.35, 2.3, 0.6);
        FLEE.forEach((row, i) => {
          const z = FZ(i), lane = LANE[i], doors = [];
          const gaps = [-1, 0, 1].map((d) => [lane + d * FD, z, 0.62]);
          wall(lane - 10, z, lane + 10, z, 2.3, 80 + i, gaps);
          // the passages behind each doorway, split by walls; the false ones end in a heap of fallen brick
          [-1.5, 1.5].forEach((dx) => wall(lane + dx * FD * 0.95, z + 0.4, lane + dx * FD * 0.95, z + FDZ - 0.5, 2.0, 120 + i * 3 + (dx > 0 ? 1 : 0)));
          [-1, 0, 1].forEach((d) => {
            const x = lane + d * FD;
            const L = row[d + 1];
            if (!letterMats[L]) letterMats[L] = new T.MeshToonMaterial({ map: letterTex(L, { bg: '#d2b088', ink: '#24120a', size: 92 }), emissive: 0x8088b0, emissiveIntensity: 0.3, gradientMap: sandstone.gradientMap });
            const lintel = new T.Mesh(lintelGeo, [stone, stone, stone, stone, letterMats[L], letterMats[L]]);
            lintel.position.set(x, 2.6, z); lintel.castShadow = true; scene.add(lintel);
            [-0.75, 0.75].forEach((px) => { const p = new T.Mesh(postGeo, brickDark); p.position.set(x + px, 1.15, z); p.castShadow = true; scene.add(p); });
            const heap = new T.Group();
            if (d !== FLEE_SOL[i]) {
              const r2 = P.rng(300 + i * 7 + d);
              for (let k = 0; k < 9; k++) { const s = 0.3 + r2() * 0.4, b = new T.Mesh(box, r2() < 0.5 ? brick : brickDark); b.scale.set(s * 1.5, s * 0.7, s); b.position.set((r2() - 0.5) * 1.4, s * 0.35 + (k > 5 ? 0.4 : 0), (r2() - 0.5) * 0.9); b.rotation.y = r2() * 3; b.castShadow = true; heap.add(b); }
              heap.position.set(x, 0, z + 2.2); heap.scale.setScalar(0.001); heap.visible = false; scene.add(heap);
            }
            doors.push({ x, z, d, heap, lintel });
          });
          fleeRows.push(doors);
        });
        // the niche at the end of the walls: a fallen lintel over a black hollow where a man can hide
        block(NICHE.x - 1.2, 0, NICHE.z + 0.9, 0.6, 2.2, 1.6, brick); block(NICHE.x + 1.2, 0, NICHE.z + 0.9, 0.6, 2.2, 1.6, brick);
        block(NICHE.x, 2.2, NICHE.z + 0.9, 3.0, 0.5, 1.8, brickDark, 0.04);
        block(NICHE.x, 0, NICHE.z + 1.75, 3.0, 2.2, 0.3, brickDark);
        // two torches running after him through the walls
        const pursuers = [raider(robeMat), raider(robeMat2)];
        pursuers.forEach((p) => { const t = torch.clone(); p.userData.arm.add(t); p.userData.torch = t; p.visible = false; scene.add(p); });
        const chaseLight = new T.PointLight(0xffa64a, 0, 14, 1.6);
        scene.add(chaseLight);

        // Hermes: the Cartographer of Distant Light, his lantern out so the watcher cannot see him
        const H = P.buildHermes(T, glowTex);
        H.flame.visible = false;
        scene.add(H.hermes);

        // Rings on what she can choose, motes of sand drifting in the moonlight
        const ringGeo = new T.RingGeometry(0.55, 0.72, 40); ringGeo.rotateX(-Math.PI / 2);
        const markers = new T.Group(); scene.add(markers);
        const motesN = 160, mG = new T.BufferGeometry(), mV = new Float32Array(motesN * 3);
        const motesBase = new Float32Array(motesN * 3);
        for (let i = 0; i < motesN; i++) { motesBase.set([rand() * 30, 0.2 + rand() * 3.5, rand() * 30], i * 3); }
        mG.setAttribute('position', new T.BufferAttribute(mV, 3));
        const motes = new T.Points(mG, new T.PointsMaterial({ color: 0xdfe6ff, size: 0.08, map: glowTex, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending }));
        scene.add(motes);
        const burstN = 60, bG = new T.BufferGeometry(); bG.setAttribute('position', new T.BufferAttribute(new Float32Array(burstN * 3), 3));
        const burst = new T.Points(bG, new T.PointsMaterial({ color: 0xffe2a0, size: 0.12, map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
        burst.visible = false; scene.add(burst);

        return { T, renderer, scene, camera, sky, stars, moon, hemi, moonLight, fireLight, torchLight, flames, embers, emberSeed, embersN, hearthMat, hearthPlain, hearthCv, sandTime,
                 steleI, faceCv, glowCv, baseCv, faceTex, glowTexS, GRID_X0, GRID_Y0, CS, CV_W, CV_H, SW, SH,
                 curbLine, curbGlow, dialCv, dialTex, needle, needleMat, dialGlow, bezel, DIAL_Y, POINTS16,
                 watcher, torch, tFlame, sleeper, torch2, camels, banner, lance, hearth, fleeRows, pursuers, chaseLight,
                 hermes: H.hermes, legL: H.legL, legR: H.legR, staff: H.staff, lamp: H.lamp, cloak: H.cloak,
                 ringGeo, markers, motes, motesBase, motesN, burst, burstN, glowTex, lowPower, casters, plinthI, steleII, steleIII };
      }

      // ---- The face of the Crossword Stele: sand in every groove until a word is brushed clean ----
      function paintStele() {
        if (!G) return;
        const g = G.faceCv.getContext('2d'), e = G.glowCv.getContext('2d'), cs = G.CS;
        g.drawImage(G.baseCv, 0, 0);
        e.fillStyle = '#000'; e.fillRect(0, 0, G.CV_W, G.CV_H);
        const sel = view.sel ? WORD[view.sel] : null, selCells = sel ? cellsOf(sel).map(([r, c]) => `${r},${c}`) : [];
        const clean = new Set();
        S.carved.forEach((id) => cellsOf(WORD[id]).forEach(([r, c]) => clean.add(`${r},${c}`)));
        Object.values(CELL).forEach((cl) => {
          const x = G.GRID_X0 + cl.c * cs, y = G.GRID_Y0 + cl.r * cs, k = `${cl.r},${cl.c}`, isClean = clean.has(k);
          // the groove: a square cut into the stone, shadowed at the top and left by the moon from the south-east
          g.fillStyle = isClean ? '#5a3c2a' : '#b9976f';
          g.fillRect(x + 4, y + 4, cs - 8, cs - 8);
          if (!isClean) {   // packed sand, grainy and pale
            const r2 = P.rng(cl.r * 31 + cl.c * 7);
            for (let i = 0; i < 26; i++) { g.fillStyle = r2() < 0.5 ? 'rgba(232,208,168,0.7)' : 'rgba(150,118,84,0.5)'; g.fillRect(x + 6 + r2() * (cs - 14), y + 6 + r2() * (cs - 14), 2 + r2() * 3, 2 + r2() * 3); }
          }
          g.strokeStyle = 'rgba(40,22,12,0.75)'; g.lineWidth = 4;
          g.beginPath(); g.moveTo(x + 4, y + cs - 4); g.lineTo(x + 4, y + 4); g.lineTo(x + cs - 4, y + 4); g.stroke();
          g.strokeStyle = 'rgba(255,236,206,0.55)'; g.lineWidth = 3;
          g.beginPath(); g.moveTo(x + cs - 4, y + 4); g.lineTo(x + cs - 4, y + cs - 4); g.lineTo(x + 4, y + cs - 4); g.stroke();
          if (cl.circle) {
            g.strokeStyle = isClean ? 'rgba(255,214,120,0.9)' : 'rgba(70,40,20,0.75)'; g.lineWidth = 3;
            g.beginPath(); g.arc(x + cs / 2, y + cs / 2, cs * 0.36, 0, Math.PI * 2); g.stroke();
            g.fillStyle = 'rgba(50,28,14,0.95)'; g.font = '700 15px Cinzel, Georgia, serif'; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
            g.fillText(String(cl.circle), x + cs - 7, y + cs - 7);
          }
          if (cl.num) { g.fillStyle = 'rgba(50,28,14,0.95)'; g.font = '700 15px Cinzel, Georgia, serif'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(String(cl.num), x + 8, y + 7); }
          if (isClean) {
            g.font = '700 38px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = '#1e120a'; g.fillText(cl.letter, x + cs / 2, y + cs / 2 + 3);
            e.font = '700 38px Cinzel, Georgia, serif'; e.textAlign = 'center'; e.textBaseline = 'middle';
            e.fillStyle = cl.circle ? '#ffc65a' : '#6f86b8'; e.fillText(cl.letter, x + cs / 2, y + cs / 2 + 3);
            if (cl.circle) { e.strokeStyle = '#b07a22'; e.lineWidth = 3; e.beginPath(); e.arc(x + cs / 2, y + cs / 2, cs * 0.36, 0, Math.PI * 2); e.stroke(); }
          }
          if (selCells.includes(k)) { e.strokeStyle = '#a87a2a'; e.lineWidth = 5; e.strokeRect(x + 3, y + 3, cs - 6, cs - 6); }
        });
        G.faceTex.needsUpdate = true;
        G.glowTexS.needsUpdate = true;
      }
      // ---- The bronze dial: sixteen points, the degrees, and the seven windows of the sigil round the hub ----
      function paintDial() {
        if (!G) return;
        const g = G.dialCv.getContext('2d'), w = 512, c = w / 2;
        const gr = g.createRadialGradient(c * 0.8, c * 0.7, 20, c, c, c);
        gr.addColorStop(0, '#e7c27c'); gr.addColorStop(0.7, '#b9883e'); gr.addColorStop(1, '#7a5222');
        g.fillStyle = gr; g.fillRect(0, 0, w, w);
        g.strokeStyle = '#3a2208'; g.fillStyle = '#3a2208'; g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let d = 0; d < 360; d += 2) {
          const a = (d - 90) * Math.PI / 180, r1 = d % 10 ? 236 : 222;
          g.lineWidth = d % 10 ? 1.5 : 3;
          g.beginPath(); g.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); g.lineTo(c + Math.cos(a) * 250, c + Math.sin(a) * 250); g.stroke();
        }
        G.POINTS16.forEach((p, i) => {
          const a = (i * 22.5 - 90) * Math.PI / 180, r = p.length === 1 ? 190 : p.length === 2 ? 192 : 196;
          g.font = `700 ${p.length === 1 ? 34 : p.length === 2 ? 20 : 15}px Cinzel, Georgia, serif`;
          g.save(); g.translate(c + Math.cos(a) * r, c + Math.sin(a) * r); g.rotate(a + Math.PI / 2); g.fillText(p, 0, 0); g.restore();
        });
        g.lineWidth = 2; g.beginPath(); g.arc(c, c, 160, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(c, c, 92, 0, Math.PI * 2); g.stroke();
        // the seven windows: dark until the sigil is set, then each with its letter
        for (let i = 0; i < 7; i++) {
          const a = (i / 7 * 360 - 90) * Math.PI / 180, x = c + Math.cos(a) * 126, y = c + Math.sin(a) * 126;
          g.fillStyle = S && S.sigil ? '#fff1c8' : '#2a1606';
          g.beginPath(); g.arc(x, y, 22, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#3a2208'; g.lineWidth = 3; g.stroke();
          if (S && S.sigil) { g.fillStyle = '#5a2a08'; g.font = '700 28px Cinzel, Georgia, serif'; g.fillText(SIGIL[i], x, y + 1); }
        }
        g.font = '700 22px Cinzel, Georgia, serif'; g.fillStyle = '#3a2208'; g.fillText('AL-QIBLA', c, c + 52);
        G.dialTex.needsUpdate = true;
      }

      // =====================================================================
      // Sound, made on the spot (no files): the fire, the brush, footsteps in sand, the bronze, shouts, running
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
      const NOTE = { A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5 };
      const sounds = {
        brush: () => { [0, 0.16, 0.32, 0.5].forEach((t) => noise(0.14, 'bandpass', 3200 + Math.random() * 900, 0.07, t, 1.5)); },
        word: (n) => [0, 1, 2].forEach((i) => tone([NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.E6][Math.min(5, n + i)], 0.55 + i * 0.1, 0.9, { gain: 0.06, type: 'triangle' })),
        circle: () => tone(NOTE.E6, 0.8, 1.6, { gain: 0.05, attack: 0.05 }),
        grit: () => { noise(0.3, 'highpass', 2400, 0.12); tone(180, 0, 0.3, { to: 120, gain: 0.06, type: 'triangle' }); },
        step: () => noise(0.12, 'lowpass', 520, 0.05),
        heart: () => [0, 0.22, 0.9, 1.12].forEach((t, i) => tone(55, t, 0.18, { to: 40, gain: i % 2 ? 0.12 : 0.18 })),
        shout: () => { tone(330, 0, 0.5, { to: 240, gain: 0.05, type: 'sawtooth', attack: 0.04 }); tone(300, 0.6, 0.7, { to: 200, gain: 0.04, type: 'sawtooth', attack: 0.05 }); },
        bronze: () => [[196, 3.8, 0.16], [392, 3.0, 0.1], [523, 2.6, 0.07], [784, 2.0, 0.05], [1175, 1.5, 0.03]].forEach(([f, d, g]) => tone(f, 0, d, { gain: g, attack: 0.005 })),
        click: () => { noise(0.05, 'highpass', 4000, 0.08); tone(1400, 0, 0.06, { gain: 0.04 }); },
        run: () => [0, 0.17, 0.34, 0.51].forEach((t) => noise(0.1, 'lowpass', 700, 0.08, t)),
        rubble: () => { noise(0.6, 'lowpass', 400, 0.2); tone(90, 0, 0.5, { to: 50, gain: 0.12 }); },
        win: () => {
          ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => tone(NOTE[n], i * 0.12, 1.5, { gain: 0.08 }));
          ['A4', 'C5', 'E5'].forEach((n) => tone(NOTE[n], 0.8, 2.4, { gain: 0.05, type: 'triangle', attack: 0.1 }));
        }
      };

      // ---- Little moments on the screen: a flash, a red pulse, confetti, the alert card ----
      const fxEl = {};
      if (el.stage) {
        const mk = (cls) => { const d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); el.stage.appendChild(d); return d; };
        fxEl.flash = mk('chasm3d-flash');
        fxEl.hurt = mk('chasm3d-hurt');
        fxEl.torch = mk('lex3d-torchglow');
        if (el.canvas) { const vg = document.createElement('div'); vg.className = 'lex3d-vignette'; vg.setAttribute('aria-hidden', 'true'); el.canvas.after(vg); }
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
        // Life around the game: a night haze, a compass rose turning slowly, a few stars drifting up
        const amb = document.createElement('div');
        amb.className = 'chasm3d-ambient';
        amb.setAttribute('aria-hidden', 'true');
        const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5 * Math.PI / 180, r0 = i % 6 ? 92 : 86; return `<line x1="${(Math.cos(a) * r0).toFixed(1)}" y1="${(Math.sin(a) * r0).toFixed(1)}" x2="${(Math.cos(a) * 97).toFixed(1)}" y2="${(Math.sin(a) * 97).toFixed(1)}"/>`; }).join('');
        const star = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r = i % 2 ? 40 : 66, b1 = a - 0.14, b2 = a + 0.14; return `<path d="M0,0 L${(Math.cos(b1) * 14).toFixed(1)},${(Math.sin(b1) * 14).toFixed(1)} L${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)} L${(Math.cos(b2) * 14).toFixed(1)},${(Math.sin(b2) * 14).toFixed(1)} Z"/>`; }).join('');
        let motes = '';
        for (let i = 0; i < 26; i++) motes += `<i style="--x:${(6 + Math.random() * 84).toFixed(1)}%;--s:${(1.5 + Math.random() * 2.5).toFixed(1)}px;--d:${(16 + Math.random() * 16).toFixed(1)}s;--delay:${(-Math.random() * 30).toFixed(1)}s;--dx:${(Math.random() * 60 - 30).toFixed(0)}px"></i>`;
        amb.innerHTML = `<div class="amb-haze"></div><div class="amb-haze amb-haze-2"></div>
          <svg class="amb-rose" viewBox="-100 -100 200 200"><circle r="97"/><circle r="86"/><circle r="60" stroke-dasharray="2 4"/><circle r="22"/><g class="amb-ticks">${ticks}</g><g class="amb-star">${star}</g></svg>
          <div class="amb-motes">${motes}</div>`;
        win.insertBefore(amb, win.firstChild);
      }
      function confetti() {
        if (!el.stage || reducedMotion()) return;
        const boxEl = document.createElement('div');
        boxEl.className = 'chasm3d-confetti';
        boxEl.setAttribute('aria-hidden', 'true');
        const cols = ['#fde68a', '#ffb14a', '#f97316', '#fff3e4', '#c7d2fe', '#ffffff'];
        for (let i = 0; i < 70; i++) {
          const c = document.createElement('i');
          c.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--dx:${((Math.random() - 0.5) * 160).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;`
            + `--d:${(1.8 + Math.random() * 1.6).toFixed(2)}s;--delay:${(Math.random() * 0.6).toFixed(2)}s;background:${cols[i % cols.length]}`;
          boxEl.appendChild(c);
        }
        el.stage.appendChild(boxEl);
        setTimeout(() => boxEl.remove(), 4200);
      }

      // =====================================================================
      // The panel: Hermes's whisper, where he is, the controls
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
        if (el.sigil) {
          if (el.sigil.children.length !== 7) el.sigil.innerHTML = SIGIL.split('').map((_, i) => `<span class="chasm3d-rune lex3d-sigilbox" data-n="${i + 1}"></span>`).join('');
          const found = sigilFound();
          [...el.sigil.children].forEach((b, i) => {
            const letter = S.sigil ? SIGIL[i] : found[i];
            b.classList.toggle('is-found', !!letter);
            b.classList.toggle('is-word', S.sigil);
            if (b.textContent !== letter) b.textContent = letter;
          });
          el.sigil.setAttribute('aria-label', S.sigil ? `The Desert Sigil: ${SIGIL.split('').join(' ')}` : `The Desert Sigil: ${found.filter(Boolean).length} of 7 circled letters clean`);
        }
        if (el.clock) el.clock.textContent = '☾ ' + clock(S.min);
        paintHearts();
        paintWatch();
        paintFacing();
      }
      // The watcher on the HUD: where he is and whether he would hear a scrape now
      function paintWatch() {
        if (!el.watch) return;
        const st = stage(), w = WATCH[S.watch];
        let text = w.hud, cls = w.safe ? 'is-safe' : S.watch === 3 ? 'is-warn' : 'is-danger';
        if (st === 'sigil' || st === 'bearing') { text = 'Dozing by the fire'; cls = 'is-safe'; }
        if (st === 'flee') { text = view.phase === 'locked' ? 'He is waking!' : S.dead ? 'Torches close behind!' : 'Torches behind!'; cls = view.phase === 'locked' ? 'is-warn' : 'is-danger'; }
        if (st === 'done' || view.phase === 'hide' || view.phase === 'hearth') { text = view.phase === 'hide' ? 'Torches passing…' : 'The riders are gone'; cls = view.phase === 'hide' ? 'is-warn' : 'is-safe'; }
        el.watch.innerHTML = `<span class="lex3d-eye" aria-hidden="true">👁</span> <span>${text}</span>`;
        el.watch.className = 'lex3d-watch ' + cls;
        el.watch.setAttribute('aria-label', `The watcher: ${text}`);
        if (fxEl.torch) fxEl.torch.classList.toggle('is-on', cls === 'is-danger' && st === 'stele');
      }
      function burn() { replay(el.clock, 'is-hot'); replay(fxEl.hurt, 'is-on'); }
      function paintHearts(breaking) {
        if (!el.hearts) return;
        if (el.hearts.children.length !== HEARTS) el.hearts.innerHTML = Array.from({ length: HEARTS }, () => '<i class="chasm3d-heart" aria-hidden="true">♥</i>').join('');
        [...el.hearts.children].forEach((h, i) => {
          h.classList.toggle('is-lost', i >= S.hearts);
          if (breaking && i === S.hearts) replay(h, 'is-breaking');
        });
        el.hearts.setAttribute('aria-label', `${S.hearts} of ${HEARTS} hearts left`);
      }
      // A mistake that counts: one heart less. True when it was the last one
      function loseHeart() {
        S.hearts = Math.max(0, S.hearts - 1);
        paintHearts(true);
        if (soundOn()) tone(S.hearts > 0 ? 220 : 110, 0, S.hearts > 0 ? 0.5 : 0.9, { to: S.hearts > 0 ? 150 : 60, gain: S.hearts > 0 ? 0.08 : 0.1, type: 'triangle' });
        return S.hearts <= 0;
      }
      const heartsLine = () => `${'♥'.repeat(S.hearts)}${'♡'.repeat(HEARTS - S.hearts)} · ${S.hearts ? `${S.hearts === 1 ? 'one heart' : 'two hearts'} left` : 'no hearts left'}`;
      const heartsWarn = () => (S.hearts === 1 ? ' That was my second mistake tonight, Silvia: one more and the night is lost.' : '');
      // The third heart: the night is lost, and the card sends them back to the first word
      function nightLost(why, cost) {
        view.phase = 'setback';
        clearControls();
        where('Three mistakes: the night is lost.');
        say(`That is three, Silvia. The camp is stirring, and I cannot stay by the steles another minute. I am slipping back into the dunes to lie hidden until the moon comes round again. When I come back the wind will have packed the grooves with sand, as it does every day. We begin again from the first word.`);
        alertCard('Night lost', '☾', 'The night is lost', why, cost, '');
      }
      function paintFacing() {
        const yaw = view.yaw + view.look;
        if (el.rose) el.rose.style.transform = `rotate(${(yaw * 180 / Math.PI).toFixed(1)}deg)`;
        if (el.facing) el.facing.textContent = Math.abs(view.look) > 1.2 ? 'Looking around' : Math.abs(Math.cos(view.yaw)) > 0.7 ? (Math.cos(view.yaw) > 0 ? 'Facing north' : 'Facing south') : 'Facing east';
      }
      function btn(label, onClick, opts) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chasm3d-btn' + (opts && opts.cls ? ' ' + opts.cls : '');
        b.innerHTML = label;
        if (opts && opts.aria) b.setAttribute('aria-label', opts.aria);
        if (opts && opts.disabled) b.disabled = true;
        if (onClick) b.addEventListener('click', onClick);
        if (view.quiet) b.style.animation = 'none';
        else b.style.animationDelay = `${el.controls.children.length * 45}ms`;
        if (opts && opts.door !== undefined) {   // pointing at a doorway lights its ring
          const hot = (on) => () => { view.hot = on ? opts.door : null; };
          b.addEventListener('mouseenter', hot(true)); b.addEventListener('mouseleave', hot(false));
          b.addEventListener('focus', hot(true)); b.addEventListener('blur', hot(false));
        }
        (opts && opts.into ? opts.into : el.controls).appendChild(b);
        return b;
      }
      function clearControls() { if (el.controls) el.controls.innerHTML = ''; view.hot = null; }
      function paintMarkers(list) {
        if (!G) return;
        G.markers.clear();
        (list || []).forEach((o, n) => {
          const m = new G.T.Mesh(G.ringGeo, new G.T.MeshBasicMaterial({ color: 0xffc65a, transparent: true, opacity: 0.9, depthWrite: false }));
          m.position.set(o.x, 0.06, o.z);
          m.userData = { d: o.d, born: performance.now(), n };
          m.renderOrder = 4;
          G.markers.add(m);
        });
      }

      // =====================================================================
      // Act I · The Crossword Stele
      // =====================================================================
      const view = { x: HERE.x, z: HERE.z, yaw: 0, look: 0, phase: 'idle', hot: null, walk: null, sel: null, shake: 0, burst: null, quiet: false,
                     wx: WATCH_AT[0][0], wz: WATCH_AT[0][1], wyaw: 0, wwalk: null, raise: 0, lock: 0, bear: 0, bearShown: 0, kneel: 0, chase: 0, line: 0,
                     sleeperUp: 0, ride: 0, crouch: 0, flee: null };
      function placeHermes() {
        const st = stage();
        if (st === 'stele') { view.x = HERE.x; view.z = HERE.z; view.yaw = 0; }
        else if (st === 'sigil' || st === 'bearing') { view.x = AT_DIAL.x; view.z = AT_DIAL.z; view.yaw = 0; }
        else if (st === 'flee') { const i = S.flee.length; view.x = LANE[i]; view.z = FZ(i) - 2.2; view.yaw = Math.PI; }
        else { view.x = AT_HEARTH.x; view.z = AT_HEARTH.z; view.yaw = 1.4; }
        view.crouch = st === 'stele' ? 1 : 0;
      }
      function placeWatcher() {
        const p = WATCH_AT[S.watch];
        view.wx = p[0]; view.wz = p[1]; view.wwalk = null;
        view.wyaw = S.watch === 4 ? Math.atan2(-(HERE.x - p[0]), -(HERE.z - p[1])) : Math.atan2(-(WATCH_AT[(S.watch + 1) % 6][0] - p[0]), -(WATCH_AT[(S.watch + 1) % 6][1] - p[1]));
      }
      function moveWatcher(to) {
        const p = WATCH_AT[to];
        view.wwalk = { fx: view.wx, fz: view.wz, tx: p[0], tz: p[1], t: 0, dur: 1.6 };
        if (soundOn()) [0, 0.4, 0.8, 1.2].forEach((t) => setTimeout(() => { if (audio) sounds.step(); }, t * 1000));
      }
      const wordState = (w) => (S.carved.includes(w.id) ? 'clean' : 'sand');
      function showStele(line) {
        if (stage() !== 'stele') { showChoice(line); return; }
        view.phase = 'stele';
        clearControls();
        paintMarkers([]);
        // the ten words, Across then Down, as on her page; the ones through a circle carry a small gold ring
        const box = document.createElement('div');
        box.className = 'lex3d-words';
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'The ten words of the stele');
        ['across', 'down'].forEach((dir) => {
          const col = document.createElement('div');
          col.className = 'lex3d-wordcol';
          col.innerHTML = `<div class="lex3d-wordhead">${dir === 'across' ? 'Across · the lateral trails' : 'Down · the vertical meridians'}</div>`;
          WORDS.filter((w) => w.dir === dir).forEach((w) => {
            const clean = wordState(w) === 'clean', circ = circleWords.includes(w.id);
            const b = btn(`<b>${w.n}</b> <span class="lw-cells">${clean ? w.answer : '·'.repeat(w.len)}</span>${circ ? '<i class="lw-ring" aria-hidden="true"></i>' : ''}`, () => selectWord(w.id),
              { cls: 'lex3d-word' + (clean ? ' is-clean' : '') + (view.sel === w.id ? ' is-sel' : ''), into: col,
                aria: `${w.label}, ${w.len} letters${circ ? ', through a circled square' : ''}${clean ? `: ${w.answer}, clean` : ''}` });
            b.dataset.word = w.id;
          });
          box.appendChild(col);
        });
        el.controls.appendChild(box);
        // the word she reads from her page, and what Hermes does with it
        const sel = view.sel && WORD[view.sel];
        const form = document.createElement('div');
        form.className = 'lex3d-carve';
        const selClean = sel && S.carved.includes(sel.id);
        form.innerHTML = `<label class="lex3d-carve-label" for="lex3d-input">${sel ? `${sel.label} · ${sel.len} letters` : 'Choose a word above, or tap its squares on the stele'}</label>
          <div class="lex3d-carve-row"><input type="text" id="lex3d-input" maxlength="${sel ? sel.len : 12}" autocomplete="off" autocapitalize="characters" spellcheck="false" ${sel && !selClean ? '' : 'disabled'} placeholder="${sel ? (selClean ? sel.answer : 'The word from your page') : ''}"></div>`;
        el.controls.appendChild(form);
        const input = form.querySelector('input');
        input.addEventListener('input', () => { input.value = input.value.toUpperCase().replace(/[^A-Z]/g, ''); form.classList.remove('is-wrong'); });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); brushWord(input.value); } });
        const safe = WATCH[S.watch].safe;
        btn(`🪶 Brush it clean <small>☾ +${COST.brush} min</small>`, () => brushWord(input.value), { cls: 'is-way lex3d-brush', disabled: !sel || selClean,
          aria: sel ? `Brush the sand out of ${sel.label}${safe ? '' : ': the watcher is close'}` : 'Brush a word clean: choose a word first' });
        btn(`🤫 Lie still <small>let him pass</small>`, waitTurn, { cls: 'lex3d-wait' + (safe ? '' : ' is-urgent'), aria: 'Lie still in the shadow of the stele while the watcher walks on' });
        if (circlesClean()) btn('Creep to the tall stele <small>Al-Qibla</small> <span class="chasm3d-arrow">➔</span>', creepToDial, { cls: 'is-way lex3d-creep', aria: 'Creep to the tallest stele, with the bronze dial' });
        const n = S.carved.length, c = circleWords.filter((id) => S.carved.includes(id)).length;
        where(`At the Crossword Stele. ${n} of 10 words clean, ${c} of the 7 through a circle. The watcher is ${WATCH[S.watch].at}.`);
        if (line) say(line);
        paintHud();
        paintStele();
        save();
      }
      function selectWord(id) {
        if (view.phase !== 'stele' || !WORD[id]) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        ensureAudio();
        view.sel = id;
        showStele(null);
        const input = $('lex3d-input');
        if (input && !input.disabled) setTimeout(() => input.focus({ preventScroll: true }), 30);
      }
      // A word from her page: if the watcher is close he hears the brush; if it does not fit, the grooves refuse it
      function brushWord(raw) {
        if (view.phase !== 'stele') return;
        const w = view.sel && WORD[view.sel];
        if (!w || S.carved.includes(w.id)) return;
        const word = String(raw || '').toUpperCase().replace(/[^A-Z]/g, '');
        const form = el.controls.querySelector('.lex3d-carve');
        if (word.length !== w.len) {
          if (form) replay(form, 'is-short');
          say(word.length ? `I count ${word.length} letter${word.length === 1 ? '' : 's'}, Silvia, and ${w.label} has ${w.len} squares on the stone.` : `Tell me the word for ${w.label} first, Silvia: ${w.len} letters, from your page.`);
          return;
        }
        ensureAudio();
        if (!WATCH[S.watch].safe) { heard('brush'); return; }
        if (soundOn()) sounds.brush();
        view.kneel = performance.now();
        S.min += COST.brush;
        const next = (S.watch + 1) % WATCH.length;
        if (word !== w.answer) {
          S.wrong++;
          S.min += COST.wrong;
          hints.fail();
          S.watch = next;
          moveWatcher(next);
          const lost = loseHeart();
          burn();
          if (soundOn()) setTimeout(() => { if (audio) sounds.grit(); }, 450);
          if (form) replay(form, 'is-wrong');
          view.shake = 0.25;
          save();
          if (lost) { nightLost(`${word} is not the word for ${w.label}: the grooves under the sand have another shape. That was the third mistake of the night.`, COST.wrong); return; }
          showStele(`I brushed, Silvia, but the grooves under the sand are not the shape of ${word}: where your third letter should be, the stone has another. ${w.label} is not that word. Look at the clue again on your page, and at the words that cross it.${heartsWarn()} ${watchLine(next)}`);
          return;
        }
        S.carved.push(w.id);
        S.watch = next;
        moveWatcher(next);
        view.sel = null;
        if (soundOn()) sounds.word(S.carved.length % 4);
        const circ = CIRCLES.map((o, i) => (o.word === w.id ? i + 1 : 0)).filter(Boolean);
        if (circ.length && soundOn()) sounds.circle();
        replay(fxEl.flash, 'is-on');
        subtitle(`${w.answer} · ${w.label}${circ.length ? ` · circle ${circ.join(', ')}` : ''}`, 4);
        save();
        const done = circlesClean();
        const lead = circ.length ? `${w.answer}. The sand runs out of the grooves, and one square, the circled one, catches the moonlight like gold.`
          : `${w.answer}. The letters come up out of the sand, sharp as the day they were cut.`;
        showStele(`${lead} ${done && circ.length ? 'And that was the last circle, Silvia. Seven letters are shining on the stone. The tall stele with the dial is six paces to my right, when the watcher lets me go.' : ''} ${watchLine(next)}`.replace(/\s+/g, ' ').trim());
        if (el.sigil && circ.length) circ.forEach((n) => { const b = el.sigil.children[n - 1]; if (b) replay(b, 'is-wave'); });
      }
      // What Hermes sees of the watcher after her move, and what it means for the next one
      function watchLine(i) {
        return [
          'He is back by the fire with his back to us. Brush, if you like.',
          'He has gone over to the camels. We have time.',
          'He is out at the north edge of the ruins, looking along our trail. Still time.',
          'Careful: he is turning back toward the steles, and his torch is swinging this way. If I scrape now he will hear it.',
          'Do not move, Silvia. He is right here, ten paces away. I can hear his sandals in the sand.',
          'He has gone past us, down to the cistern. Breathe.'
        ][i];
      }
      function waitTurn() {
        if (view.phase !== 'stele') return;
        ensureAudio();
        const next = (S.watch + 1) % WATCH.length;
        S.watch = next;
        S.waits++;
        S.min += COST.wait;
        moveWatcher(next);
        view.crouch = 1.4;
        if (next === 4 && soundOn()) sounds.heart();
        save();
        const lines = ['I lie flat. The torch drifts away toward the fire.', 'Still. Sand in my beard and my heart in my ears.', 'I lie still and count my breaths.', 'Flat in the shadow of the stone.', 'I press my face into the sand.', 'I wait. The moon is climbing.'];
        showStele(`${lines[next]} ${watchLine(next)}`);
      }
      function creepToDial() {
        if (view.phase !== 'stele' || !circlesClean()) return;
        ensureAudio();
        if (!WATCH[S.watch].safe) { heard('creep'); return; }
        S.atDial = true;
        S.min += 3;
        save();
        view.phase = 'walk';
        clearControls();
        view.sel = null;
        paintStele();
        view.crouch = 0.6;
        view.walk = { fx: view.x, fz: view.z, tx: AT_DIAL.x, tz: AT_DIAL.z, t: 0, dur: 1.8, then: () => showDial("Six paces on my knees, and I am at the foot of the tallest stele. The watcher has sat down by the fire again, and his head is nodding. Lucky us. Silvia, the bronze dial is set into the stone at the height of my eyes. Round its hub there are seven little windows, dark, like seven shut eyes. Under them, in letters older than the Order: AL-QIBLA. The seven circled letters, from 1 to 7, as your page numbers them: tell me the sigil, and I will turn each window to its letter.") };
        if (!G) finishWalk();
      }
      // The scrape carried: he stops, lifts his torch toward the steles, and Hermes lies still until he walks on
      function heard(what) {
        view.phase = 'setback';
        clearControls();
        S.heard++;
        S.min += COST.heard;
        hints.fail();
        const was = S.watch;
        S.watch = 4;
        moveWatcher(4);
        view.raise = performance.now();
        view.crouch = 1.4;
        loseHeart();
        burn();
        view.shake = 0.5;
        if (soundOn()) { sounds.heart(); setTimeout(() => { if (audio) sounds.shout(); }, 700); }
        save();
        paintHud();
        const why = was === 3 ? 'He was already turning toward the steles, and the scrape carried across the sand.' : 'He was right by the steles, ten paces away.';
        say(`${what === 'creep' ? 'I moved' : 'I had barely started brushing'}, Silvia, and he stopped dead. He lifted his torch toward the stones and called out, low, in a language I do not know. I lay flat in the shadow of the stele with my face in the sand and did not breathe… He stood there for a long time. Then he spat, and walked on, down toward the cistern. Watch where he is before every move: while he turns toward us, or stands by the steles, I must lie still.`);
        where('The watcher heard the scrape. Hermes lies still.');
        if (S.hearts <= 0) { alertCard('Heard', '👁', 'He heard you', why + ' That was the third mistake of the night.', COST.heard, ''); return; }
        alertCard('Heard', '👁', 'He heard you', why + ' Lie still while he turns this way and while he stands by the steles; brush when his back is turned.', COST.heard, 'He walks on, down to the cistern. Hermes waits in the shadow.');
      }
      function alertCard(kicker, sealMark, title, why, cost, next, btnLabel) {
        if (S.hearts <= 0) { next = 'All three hearts are gone. Hermes slips back into the dunes, and the steles must be read again from the first word.'; btnLabel = '↺ Begin the night again'; }
        btnLabel = btnLabel || '↺ Go on';
        if (fxEl.alert) {
          fxEl.alert.innerHTML = `<div class="chasm3d-alert-card lex3d-alert-card">
            <div class="chasm3d-alert-seal" aria-hidden="true">${sealMark}</div>
            <div class="chasm3d-alert-kicker">${kicker}</div>
            <div class="chasm3d-alert-title">${title}</div>
            <p class="chasm3d-alert-why">${why}</p>
            <p class="chasm3d-alert-hearts${S.hearts ? '' : ' is-out'}" aria-label="${S.hearts} of ${HEARTS} hearts left">${heartsLine()}</p>
            <p class="chasm3d-alert-cost">☾ +${cost} min · the moon climbs toward midnight</p>
            <p class="chasm3d-alert-next">${next}</p>
            <button type="button" class="chasm3d-alert-btn">${btnLabel}</button>
          </div>`;
          fxEl.alert.hidden = false;
          replay(fxEl.alert, 'is-on');
          const b = fxEl.alert.querySelector('button');
          b.addEventListener('click', goOn);
          setTimeout(() => b.focus({ preventScroll: true }), 30);
        }
        btn(btnLabel, goOn, { cls: 'is-back' });
      }
      function goOn() {
        if (view.phase !== 'setback') return;
        if (fxEl.alert) fxEl.alert.hidden = true;
        if (S.hearts <= 0) {
          startOver();
          save();
          beginAgain(`A new night, Silvia. I lay hidden in the dunes all day and crept back at moonrise, and I am at the foot of the steles with three hearts again. The wind has packed every groove with sand, as I feared, and the watcher walks his round with his torch. This is night number ${S.tries}. Choose a word.`);
          return;
        }
        const st = stage();
        if (st === 'stele') {
          S.watch = 5;
          moveWatcher(5);
          view.raise = 0;
          save();
          showStele('He is gone, down to the cistern. My heart is still hammering. Which word now, Silvia?');
          return;
        }
        if (st === 'flee') { showFlee('Back to the crossing of the walls. The torches are closer. Which doorway, Silvia? Read the letters.'); return; }
        showChoice();
      }

      // =====================================================================
      // Act II · Al-Qibla
      // =====================================================================
      function showChoice(line) {
        const st = stage();
        if (st === 'stele') { showStele(line); return; }
        if (st === 'sigil' || st === 'bearing') { showDial(line); return; }
        if (st === 'flee') { showFlee(line); return; }
        victory(false);
        if (line) say(line);
      }
      function showDial(line) {
        const st = stage();
        view.phase = st;
        clearControls();
        paintMarkers([]);
        paintDial();
        if (st === 'sigil') {
          const boxEl = document.createElement('div');
          boxEl.className = 'playa3d-console lex3d-console';
          boxEl.setAttribute('role', 'group');
          boxEl.setAttribute('aria-label', 'The seven windows of the Al-Qibla dial');
          boxEl.innerHTML = `<div class="pc-title">☉ The Al-Qibla Dial</div>
            <p class="pc-sub">Seven windows round the hub: the Desert Sigil, the circled letters from 1 to 7.</p>
            <div class="pc-boxes">${SIGIL.split('').map((_, i) => `<label><input type="text" inputmode="text" maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="Window ${i + 1}" data-i="${i}"><span>${i + 1}</span></label>`).join('')}</div>
            <button type="button" class="chasm3d-btn is-way pc-send">☉ Turn the windows</button>`;
          el.controls.appendChild(boxEl);
          const inputs = [...boxEl.querySelectorAll('input')];
          inputs.forEach((inp, i) => {
            inp.addEventListener('input', () => {
              const v = inp.value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
              inp.value = v;
              boxEl.classList.remove('is-wrong');
              if (v && inputs[i + 1]) inputs[i + 1].focus();
            });
            inp.addEventListener('keydown', (e) => {
              if (e.key === 'Backspace' && !inp.value && inputs[i - 1]) { e.preventDefault(); inputs[i - 1].focus(); inputs[i - 1].value = ''; }
              else if (e.key === 'Enter') { e.preventDefault(); setSigil(inputs.map((x) => x.value).join('')); }
              else if (e.key === 'ArrowLeft' && inputs[i - 1]) inputs[i - 1].focus();
              else if (e.key === 'ArrowRight' && inputs[i + 1]) inputs[i + 1].focus();
            });
          });
          boxEl.querySelector('.pc-send').addEventListener('click', () => setSigil(inputs.map((x) => x.value).join('')));
          where('At the foot of the tallest stele. The watcher dozes by the fire. The dial waits for the sigil.');
          setTimeout(() => { if (view.phase === 'sigil' && inputs[0]) inputs[0].focus({ preventScroll: true }); }, 60);
        } else {
          const boxEl = document.createElement('div');
          boxEl.className = 'lex3d-bearing';
          boxEl.setAttribute('role', 'group');
          boxEl.setAttribute('aria-label', 'Turn the needle of Al-Qibla');
          boxEl.innerHTML = `<div class="pc-title">🧭 Turn the needle</div>
            <div class="lb-read" aria-live="polite"><strong id="lex3d-bear">${String(view.bear).padStart(3, '0')}°</strong> <span id="lex3d-bearpt">${pointOf(view.bear)}</span></div>
            <input type="range" id="lex3d-bear-range" min="0" max="359" step="1" value="${view.bear}" aria-label="Bearing of the needle, in degrees">
            <div class="lb-row"></div>`;
          el.controls.appendChild(boxEl);
          const row = boxEl.querySelector('.lb-row');
          [[-10, '⟲ 10°'], [-1, '‹ 1°'], [1, '1° ›'], [10, '10° ⟳']].forEach(([d, l]) => btn(l, () => turnNeedle(view.bear + d), { cls: 'lb-step', into: row, aria: `Turn the needle ${Math.abs(d)} degree${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? 'clockwise' : 'anticlockwise'}` }));
          const range = boxEl.querySelector('input');
          range.addEventListener('input', () => turnNeedle(+range.value, true));
          btn(`🔒 Lock the needle here`, () => lockNeedle(), { cls: 'is-way lb-lock', into: boxEl, aria: 'Lock the needle at this bearing' });
          where('At the dial. The sigil is set and the needle swings free. It waits for the Al-Qibla vector.');
        }
        if (line) say(line);
        paintHud();
        save();
      }
      const pointOf = (b) => G ? G.POINTS16[Math.round(((b % 360) + 360) % 360 / 22.5) % 16] : ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(((b % 360) + 360) % 360 / 22.5) % 16];
      function setSigil(word) {
        if (view.phase !== 'sigil') return;
        const boxEl = el.controls.querySelector('.lex3d-console');
        if (word.length < 7) {
          if (boxEl) replay(boxEl, 'is-short');
          say(`I count ${word.length} letter${word.length === 1 ? '' : 's'}, Silvia. Seven windows: one for every circle on your page.`);
          return;
        }
        ensureAudio();
        if (word !== SIGIL) {
          S.dialWrong++;
          S.min += COST.dial;
          dialHints.fail();
          const lost = loseHeart();
          burn();
          if (boxEl) replay(boxEl, 'is-wrong');
          if (soundOn()) sounds.grit();
          save();
          paintHud();
          if (lost) { nightLost(`The seven windows turned to ${word}, and the hub did not give. The Desert Sigil is read from the circled squares of your page, in the order of their little numbers. That was the third mistake of the night.`, COST.dial); return; }
          say(`The windows turned, but the hub did not give. The needle is still stuck fast. Read the circles again on your page, Silvia: the little number in each one says its place, 1 to 7.${heartsWarn()}`);
          return;
        }
        S.sigil = true;
        S.min += 3;
        view.bear = 0;
        save();
        if (soundOn()) SIGIL.split('').forEach((l, i) => tone([NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.E6][i], i * 0.14, 0.7, { gain: 0.06, type: 'triangle' }));
        view.spin = performance.now();
        replay(fxEl.flash, 'is-on');
        subtitle('PHOENIX · the needle is free', 4);
        if (el.sigil) [...el.sigil.children].forEach((b, n) => { b.style.animationDelay = `${n * 110}ms`; replay(b, 'is-wave'); });
        showDial('P, H, O, E, N, I, X. Seven little clicks, Silvia, and the hub turned under my thumb: the needle swung round twice, free as a weathervane, and settled pointing at nothing. It wants a bearing. The nomads set it to the way they meant to go, and your page has a vector in its very title. Tell me where to turn it.');
      }
      function turnNeedle(b, fromRange) {
        if (view.phase !== 'bearing') return;
        view.bear = ((Math.round(b) % 360) + 360) % 360;
        const r = $('lex3d-bear'), p = $('lex3d-bearpt'), range = $('lex3d-bear-range');
        if (r) r.textContent = `${String(view.bear).padStart(3, '0')}°`;
        if (p) p.textContent = pointOf(view.bear);
        if (range && !fromRange) range.value = view.bear;
        if (soundOn() && audio && !(fromRange && view.bear % 5)) sounds.click();
      }
      function lockNeedle() {
        if (view.phase !== 'bearing') return;
        ensureAudio();
        const b = view.bear;
        if (b !== BEARING) {
          S.bearWrong++;
          S.min += COST.bearing;
          dialHints.fail();
          const lost = loseHeart();
          burn();
          save();
          paintHud();
          if (soundOn()) sounds.grit();
          view.shake = 0.2;
          if (lost) { nightLost(`The needle trembled at ${String(b).padStart(3, '0')}° and swung back. The dial wants the Al-Qibla Vector of your page, with the head of the needle on it. That was the third mistake of the night.`, COST.bearing); return; }
          const near = Math.min(Math.abs(b - BEARING), 360 - Math.abs(b - BEARING));
          say((b === TAIL ? 'Fourteen… the needle shivered, Silvia, and swung back. Its tail sat on 14 and its head on the far side: the dial wants the head of the needle on the vector, not its tail. Read the title of your page again.'
            : near <= 12 ? 'Close, Silvia, so close that the needle hummed, but it swung back. The vector on your page is a precise number of degrees. Read it again.'
            : 'I locked it there, and the needle trembled and swung back to the north. That is not the vector on your page, Silvia. Look at the line under the title: Al-Qibla Vector, so many degrees.') + heartsWarn());
          return;
        }
        S.locked = true;
        S.min += 2;
        save();
        view.phase = 'locked';
        clearControls();
        view.lock = performance.now();
        if (soundOn()) sounds.bronze();
        replay(fxEl.flash, 'is-on');
        subtitle('194° SSW ⇄ 14° NNE · Al-Qibla is locked', 5);
        paintHud();
        say('…It locked. One hundred and ninety-four degrees, south-south-west, the way the raiders rode, and the tail on fourteen, north-north-east: Tower II. And Silvia, the bronze rang. Like a bell. The whole ruin rang with it. In the moonlight the shadow of the needle has fallen on the curb of the second stele, and there is a line cut there that I never saw: [R] × 2 = [F]. Write it in your Cipher Ledger… Wait. The man by the fire is on his feet.');
        where('Al-Qibla is locked. The chime has woken the camp.');
        setTimeout(() => { if (view.phase === 'locked') ambush(); }, reducedMotion() ? 600 : 3600);
      }

      // =====================================================================
      // Act III · The Ambush, and the walls of the old camp
      // =====================================================================
      function ambush() {
        if (view.phase !== 'locked') return;
        view.phase = 'ambush';
        view.sleeperUp = performance.now();
        view.raise = performance.now();
        S.watch = 4;
        moveWatcher(3);
        if (soundOn()) { sounds.shout(); setTimeout(() => { if (audio) sounds.shout(); }, 500); sounds.heart(); }
        view.shake = 0.6;
        replay(fxEl.hurt, 'is-on');
        clearControls();
        subtitle('The camp is awake!', 4);
        say('Both of them, Silvia! Torches, knives, and they are shouting at the stones. They have seen my shadow on the dial. I cannot go back past the fire. Behind me, to the south, are the walls of the old camp, a warren of doorways. The nomads cut a letter over every doorway… and a dial that wakes on a word would have a word for its walls too. Run with me!');
        where('Ambush! Run south, into the walls of the old camp.');
        const go = btn('Run! Into the walls <span class="chasm3d-arrow">➔</span>', () => {
          if (view.phase !== 'ambush') return;
          view.phase = 'walk';
          clearControls();
          view.walk = { fx: view.x, fz: view.z, tx: LANE[0], tz: FZ(0) - 2.2, t: 0, dur: 1.6, run: true, then: () => showFlee('I am at the first wall, Silvia. Three doorways, a letter cut over each, and the torches are coming round the steles behind me. Which one? Quickly!') };
          view.yaw = Math.PI;
          if (!G) finishWalk();
        }, { cls: 'is-way lex3d-run' });
        setTimeout(() => go.focus({ preventScroll: true }), 30);
      }
      function showFlee(line) {
        if (S.flee.length >= FLEE.length) { toHide(); return; }
        view.phase = 'flee';
        view.yaw = Math.PI;
        clearControls();
        const i = S.flee.length, row = FLEE[i], tried = S.tried[i] || [];
        paintMarkers([-1, 0, 1].filter((d) => !tried.includes(d)).map((d) => ({ x: LANE[i] + d * FD, z: FZ(i) - 0.7, d })));
        // as Hermes sees them, running south: east is on his left
        [1, 0, -1].forEach((d) => {
          const L = row[d + 1], shut = tried.includes(d);
          const arrow = d > 0 ? '↖' : d < 0 ? '↗' : '↑', word = d > 0 ? 'Left' : d < 0 ? 'Right' : 'Ahead';
          btn(`<span class="chasm3d-arrow">${arrow}</span> ${word} <span class="lex3d-door">${L}</span> <small>${shut ? 'fallen in' : 'the doorway marked ' + L}</small>`, () => chooseDoor(d),
            { cls: 'lex3d-doorbtn ' + (shut ? 'is-tracks' : 'is-way'), disabled: shut, door: d, aria: shut ? `${word}, the doorway marked ${L}: fallen in` : `Run ${word.toLowerCase()}, through the doorway marked ${L}` });
        });
        where(`In the walls of the old camp, wall ${i + 1} of ${FLEE.length}. The doorways ahead are marked ${[1, 0, -1].map((d) => `${row[d + 1]} (${d > 0 ? 'left' : d < 0 ? 'right' : 'ahead'})`).join(', ')}.`);
        if (line) say(line);
        paintHud();
        save();
      }
      function chooseDoor(d) {
        if (view.phase !== 'flee') return;
        const i = S.flee.length;
        if ((S.tried[i] || []).includes(d)) return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        ensureAudio();
        view.phase = 'walk';
        clearControls();
        paintMarkers([]);
        if (soundOn()) sounds.run();
        const x = LANE[i] + d * FD;
        if (d === FLEE_SOL[i]) {
          S.flee.push(d);
          S.min += 2;
          save();
          view.walk = { fx: view.x, fz: view.z, tx: x, tz: FZ(i) + 1.2, t: 0, dur: 0.75, run: true, then: () => {
            if (i + 1 >= FLEE.length) { toHide(); return; }
            view.walk = { fx: view.x, fz: view.z, tx: LANE[i + 1], tz: FZ(i + 1) - 2.2, t: 0, dur: 0.85, run: true, then: () => fleeOn(i) };
            if (!G) finishWalk();
          } };
          if (!G) finishWalk();
          return;
        }
        // a false doorway: a heap of fallen brick two steps in, and the torches gaining
        (S.tried[i] || (S.tried[i] = [])).push(d);
        S.dead++;
        S.min += COST.dead;
        dialHints.fail();
        loseHeart();
        save();
        view.walk = { fx: view.x, fz: view.z, tx: x, tz: FZ(i) + 1.2, t: 0, dur: 0.7, run: true, then: () => deadEnd(i, d) };
        if (!G) finishWalk();
      }
      function fleeOn(i) {
        const lines = [
          'Through! Another wall, three more doorways. The shouting is behind the first wall now.',
          'Through, and on. I can hear them arguing over which way I went.',
          'Through the O. My lungs are burning, Silvia. Next letter?',
          'Through. A torch flared somewhere to my right, then went the wrong way. Next!',
          'Through! The walls are higher here, and darker. The moon is only a stripe overhead.',
          'Through the I. One more wall, Silvia, the last letter of the sigil. I can see a black hollow beyond it.'
        ];
        if (soundOn()) tone([NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.E6][i], 0, 0.6, { gain: 0.06, type: 'triangle' });
        subtitle(`${SIGIL.slice(0, i + 1).split('').join(' · ')}`, 2.5);
        showFlee(lines[i]);
      }
      function deadEnd(i, d) {
        view.phase = 'setback';
        const door = G && G.fleeRows[i] && G.fleeRows[i][d + 1];
        if (door && door.heap) { door.heap.visible = true; door.heap.userData.pop = performance.now(); }
        if (soundOn()) sounds.rubble();
        view.shake = 0.7;
        burn();
        view.chase = performance.now();
        const L = FLEE[i][d + 1];
        say(`Fallen in! Two steps past the ${L} the passage is choked with brick to the roof. I turned round, and there was torchlight on the wall behind me. They are close, Silvia. The nomads marked the true way with the word that woke the dial: one letter for each wall, in order.${S.hearts ? heartsWarn() : ' …And that is three. I cannot outrun them like this: I am going over the wall into the dunes before they see me.'}`);
        where('A dead end. Hermes runs back to the doorways.');
        view.walk = { fx: view.x, fz: view.z, tx: LANE[i], tz: FZ(i) - 2.2, t: 0, dur: 0.9, run: true, then: () => {
          clearControls();
          alertCard('Dead end', '✕', 'Fallen in', `The doorway marked ${L} ends in a heap of fallen brick. The true way follows the Desert Sigil, one letter for each wall, in order: this is wall ${i + 1}.`, COST.dead, 'The torches are closer. Choose another doorway.', '↺ Choose again');
        } };
        if (!G) finishWalk();
      }
      // Past the last wall: into the niche under the fallen lintel, while the torches go by
      function toHide() {
        view.phase = 'walk';
        clearControls();
        view.walk = { fx: view.x, fz: view.z, tx: NICHE.x, tz: NICHE.z + 0.8, t: 0, dur: 1.1, run: true, then: hide };
        if (!G) finishWalk();
      }
      function hide() {
        view.phase = 'hide';
        view.crouch = 1.6;
        view.yaw = 0;
        view.hideAt = performance.now();
        paintMarkers([]);
        clearControls();
        if (soundOn()) sounds.heart();
        subtitle('Into the dark', 3);
        say('In. There is a hollow under a fallen lintel, Silvia, just wide enough for an old man folded in two. I am inside, with my cloak over my face… Here they come. Two torches. They have stopped at the last wall. One of them is holding the light up to the doorway, the X… they are talking. Not a sound now.');
        where('Hidden in a niche under a fallen lintel, past the last wall. The torches are at the doorway.');
        paintHud();
        const b = btn('🤫 Stay in the dark', toHearth, { cls: 'is-way' });
        setTimeout(() => b.focus({ preventScroll: true }), 30);
      }
      function toHearth() {
        if (view.phase !== 'hide') return;
        view.phase = 'walk';
        clearControls();
        if (el.fade) el.fade.classList.add('is-on');
        setTimeout(() => {
          view.phase = 'hearth';
          view.x = AT_HEARTH.x; view.z = AT_HEARTH.z; view.yaw = 1.4; view.crouch = 0.5;
          view.ride = performance.now();
          camPos.ok = false;
          if (el.fade) el.fade.classList.remove('is-on');
          subtitle('Near midnight · the hearth of the raiders', 4);
          say('They went back, Silvia. I heard them run to their camels, and then the beasts groaning up off their knees, and hoofbeats going away south, fast, the way the needle points. I waited until the sound was gone, and then I came back to the fire. It is only red eyes now. And here on the hearth stone is what the raider scratched with his knife at dusk… Come closer to the light with me.');
          where('At the cold fire, near midnight. The rearguard has ridden south.');
          paintHud();
          const b = btn('🔥 Read the hearth stone', () => { if (view.phase === 'hearth') victory(true); }, { cls: 'is-way' });
          setTimeout(() => b.focus({ preventScroll: true }), 30);
        }, reducedMotion() || !G ? 0 : 700);
      }

      // ---- The end of the night ----
      function victory(live) {
        view.phase = 'done';
        paintMarkers([]);
        clearControls();
        if (!S.locked) { S.atDial = true; S.sigil = true; S.locked = true; }
        if (S.flee.length < FLEE.length) S.flee = FLEE_SOL.slice();
        circleWords.forEach((id) => { if (!S.carved.includes(id)) S.carved.push(id); });
        S.hidden = true;
        view.x = AT_HEARTH.x; view.z = AT_HEARTH.z; view.yaw = 1.4;
        say('A bird with its wings up, rising out of three flames: the same mark that was burned into the wagon\'s oilcloth. Under it, cut deep, two letters and a word: BC ASHES. And an arrow, with 194 beside it. The BC Ashes, Silvia. That is their name. That is who came down from the mountains with the Astrolabe, and that is the way they ride. We know their name, their sign and their road, and they do not know ours. The needle\'s tail points to Tower II. Talk to me on the Field Wire.');
        where('At the hearth of the BC Ashes, Camp VII. Al-Qibla is locked: 194° SSW for the raiders, 14° NNE for Tower II.');
        if (el.victory) el.victory.style.display = 'block';
        if (window.EclipseCinematic) window.EclipseCinematic.attach(el.victory, 'night_of_steles');
        const fanfare = () => { if (soundOn()) sounds.win(); else if (sfx && sfx.playCelestialChime) sfx.playCelestialChime(); };
        if (!live) fanfare();
        const first = !isDone();
        put('order_desert_lexicon_completed', 'true');
        put('order_desert_station_active', '12');
        put('order_lexicon_solved_words', JSON.stringify(S.carved));
        save();
        hints.refresh();
        dialHints.refresh();
        paintHud();
        paintStele();
        paintDial();
        if (first && typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (first) document.dispatchEvent(new Event('lexicon:cleared'));
        if (live) {
          const after = () => {
            fanfare(); confetti();
            setTimeout(() => { if (view.phase === 'done' && modal.style.display !== 'none') showReward(); }, reducedMotion() ? 300 : 3000);
          };
          if (G && cine && !reducedMotion() && get(CINE_OUTRO) !== 'seen') { put(CINE_OUTRO, 'seen'); cine.start(endingShots(), after); } else after();
        }
      }
      function burstAt(x, y, z, color) {
        if (!G || reducedMotion()) return;
        const v = new Float32Array(G.burstN * 3);
        for (let n = 0; n < G.burstN; n++) {
          const a = Math.random() * Math.PI * 2, sp = 0.4 + Math.random() * 1.4;
          v[n * 3] = Math.cos(a) * sp; v[n * 3 + 1] = 0.8 + Math.random() * 1.8; v[n * 3 + 2] = Math.sin(a) * sp;
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
        const dt = Math.min(0.1, (now - (last || now)) / 1000);
        tick(now, dt);
        (G.adapt || (G.adapt = P.fitSpeed(G.renderer)))(dt);
        last = now;
      }
      function finishWalk() {
        const w = view.walk;
        if (!w) return;
        view.walk = null;
        view.x = w.tx; view.z = w.tz;
        if (w.then) w.then();
      }
      const ease = (k) => k * k * (3 - 2 * k);
      function tick(now, dt) {
        const T = G.T, rm = reducedMotion(), tt = now / 1000;
        G.sandTime.value = tt;
        let moving = false;
        const w = view.walk;
        if (w) {
          moving = true;
          w.t += dt / (rm ? w.dur * 0.3 : w.dur);
          const k = Math.min(1, w.t), e = ease(k);
          const px = view.x, pz = view.z;
          view.x = w.fx + (w.tx - w.fx) * e; view.z = w.fz + (w.tz - w.fz) * e;
          if (Math.hypot(view.x - px, view.z - pz) > 0.002) view.yaw += ((Math.atan2(-(view.x - px), -(view.z - pz)) - view.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 10);
          if (Math.floor(w.t * (w.run ? 6 : 4)) !== (w.steps || 0)) { w.steps = Math.floor(w.t * (w.run ? 6 : 4)); if (soundOn() && audio) sounds.step(); }
          if (k >= 1) finishWalk();
        } else {
          // at rest he faces what matters: the stele, the dial, the doorways, the hearth
          const face = ['flee', 'setback'].includes(view.phase) && stage() === 'flee' ? Math.PI : view.phase === 'hide' ? 0 : ['hearth', 'done'].includes(view.phase) ? Math.atan2(-(HEARTH.x - view.x), -(HEARTH.z - view.z)) : 0;
          view.yaw += ((face - view.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 5);
        }
        if (!dragging) view.look *= Math.pow(0.15, dt);

        // Hermes: crouched at the stele, kneeling to brush, running in the walls, folded into the niche
        const H = G.hermes;
        H.position.set(view.x, 0, view.z);
        H.rotation.set(0, view.yaw, 0);
        const crouchTo = view.phase === 'hide' ? 0.62 : stage() === 'stele' && view.phase !== 'walk' ? 0.8 : 1;
        view.cy = (view.cy || 1) + (crouchTo - (view.cy || 1)) * Math.min(1, dt * 6);
        H.scale.set(1, view.cy, 1);
        if (!moving && !rm) H.scale.y *= 1 + Math.sin(now / 640) * 0.012;
        if (view.kneel && !rm) { const kt = (now - view.kneel) / 1100; if (kt >= 1) view.kneel = 0; else H.scale.y *= 1 - 0.12 * Math.sin(Math.PI * Math.min(1, kt)); }
        const swing = moving && !rm ? Math.sin(now / (w && w.run ? 80 : 120)) : 0;
        G.legL.position.z = swing * 0.2; G.legR.position.z = -swing * 0.2;
        G.legL.position.y = Math.max(0, swing) * 0.06; G.legR.position.y = Math.max(0, -swing) * 0.06;
        G.cloak.rotation.z = swing * 0.03;
        H.rotation.x = w && w.run ? 0.12 : 0;
        G.staff.rotation.x = view.kneel ? -0.6 : swing * 0.25;
        G.lamp.rotation.z = rm ? 0 : swing * 0.1;

        // The watcher walks his round; when he hears something he stops and lifts his torch toward the stones
        const ww = view.wwalk;
        if (ww) {
          ww.t += dt / (rm ? ww.dur * 0.3 : ww.dur);
          const k = Math.min(1, ww.t), e = ease(k);
          view.wx = ww.fx + (ww.tx - ww.fx) * e; view.wz = ww.fz + (ww.tz - ww.fz) * e;
          view.wyaw = Math.atan2(-(ww.tx - ww.fx), -(ww.tz - ww.fz));
          if (k >= 1) { view.wwalk = null; if (S.watch === 4 || view.raise) view.wyaw = Math.atan2(-(view.x - view.wx), -(view.z - view.wz)); }
        }
        const st = stage();
        const wat = G.watcher, inWalls = st === 'flee' || ['hide'].includes(view.phase);
        wat.visible = !inWalls && !['hearth', 'done'].includes(view.phase);
        wat.position.set(view.wx, 0, view.wz);
        wat.rotation.y += ((view.wyaw - wat.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 6);
        const wmove = !!view.wwalk && !rm;
        wat.userData.body.rotation.z = wmove ? Math.sin(now / 160) * 0.05 : 0;
        const raised = view.raise ? Math.min(1, (now - view.raise) / 500) : 0;
        wat.userData.arm.rotation.x = -0.4 - raised * 1.6 + (wmove ? Math.sin(now / 160) * 0.15 : 0);
        // the sleeper wakes at the chime and gets up with a second torch
        const up = view.sleeperUp ? Math.min(1, (now - view.sleeperUp) / 900) : (S.locked && st !== 'done' ? 1 : 0);
        G.sleeper.visible = !inWalls && !['hearth', 'done'].includes(view.phase);
        G.sleeper.rotation.set(-Math.PI / 2 * (1 - ease(up)), 0.4, 0);
        G.sleeper.position.y = 0.18 * (1 - up);
        G.torch2.visible = up > 0.5;
        if (!rm && up < 0.01) G.sleeper.scale.y = 1 + Math.sin(now / 900) * 0.03;
        // their torches light the sand round them; in the walls, the torches of the chase follow behind Hermes
        const tp = new T.Vector3();
        G.tFlame.getWorldPosition(tp);
        G.torchLight.position.copy(tp);
        G.torchLight.intensity = wat.visible ? (rm ? 2 : 1.8 + Math.sin(tt * 17) * 0.25 + Math.sin(tt * 7.3) * 0.2) : 0;
        G.tFlame.scale.set(0.6 + (rm ? 0 : Math.sin(tt * 19) * 0.06), 0.9 + (rm ? 0 : Math.sin(tt * 13) * 0.1), 1);
        const chasing = inWalls || (view.phase === 'setback' && st === 'flee');
        G.pursuers.forEach((p, n) => {
          p.visible = chasing;
          if (!chasing) return;
          const i = Math.min(S.flee.length, FLEE.length - 1);
          const gap = view.phase === 'hide' ? 0 : Math.max(3.2, 9 - S.dead * 1.4);
          let tx = LANE[i] + (n ? 1.2 : -1.0), tz = view.z - gap - n * 1.3;
          if (view.phase === 'hide') { const k = Math.min(1, (now - view.hideAt) / 2600); tx = NICHE.x + (n ? 1.6 : -0.6); tz = FZ(FLEE.length - 1) - 1.4 + k * 1.1 - n; }
          const px = p.position.x, pz = p.position.z;
          p.position.x += (tx - p.position.x) * Math.min(1, dt * 2.4); p.position.z += (tz - p.position.z) * Math.min(1, dt * 2.4);
          if (Math.hypot(p.position.x - px, p.position.z - pz) > 0.002) p.rotation.y = Math.atan2(-(p.position.x - px), -(p.position.z - pz));
          p.userData.arm.rotation.x = -1.7 + (rm ? 0 : Math.sin(now / 110 + n) * 0.15);
          p.userData.body.rotation.z = rm ? 0 : Math.sin(now / 100 + n * 2) * 0.06;
        });
        if (chasing) {
          const pp = new T.Vector3(); G.pursuers[0].userData.torch.children[1].getWorldPosition(pp);
          G.chaseLight.position.copy(pp);
          const flare = view.chase ? Math.max(0, 1 - (now - view.chase) / 900) : 0;
          G.chaseLight.intensity = (rm ? 2.2 : 2.0 + Math.sin(tt * 15) * 0.3) + flare * 2;
        } else G.chaseLight.intensity = 0;

        // The fire breathes, its embers rise; the camels chew and flick their heads; the banner stirs
        const fl = rm ? 1 : 0.85 + Math.sin(tt * 11) * 0.08 + Math.sin(tt * 23.7) * 0.06;
        const fireLow = ['hearth', 'done'].includes(view.phase) ? 0.35 : 1;
        G.flames.forEach((f, i) => { f.scale.y = (1.6 - i * 0.3) * fl * fireLow; f.material.opacity = 0.9 * fireLow; });
        G.fireLight.intensity = 2.4 * fl * fireLow;
        const ep = G.embers.geometry.attributes.position;
        for (let i = 0; i < G.embersN; i++) {
          const s = G.emberSeed[i], k = ((tt * 0.35 + s[0]) % 1);
          ep.setXYZ(i, s[1] + Math.sin(tt + i) * 0.15 * k, 0.4 + k * 2.6 * fireLow, s[2] + Math.cos(tt * 0.7 + i) * 0.15 * k);
        }
        ep.needsUpdate = true;
        G.embers.material.opacity = rm ? 0.6 : 0.9 * fireLow;
        // after the chase the riders mount and ride south with the banner flying
        const ride = view.ride ? Math.min(1, (now - view.ride) / 9000) : (st === 'done' ? 1 : 0);
        G.camels.forEach((c, n) => {
          const kneel = ride > 0 ? 0 : 1, ud = c.userData;
          ud.parts.position.y = -0.55 * kneel;
          ud.legs.forEach((l, j) => { l.scale.y = kneel ? 0.3 : 1; l.rotation.x = ride > 0 && ride < 1 && !rm ? Math.sin(now / 130 + j * 1.6) * 0.5 : 0; });
          if (ride > 0) {
            const k = ease(Math.min(1, ride * 1.2));
            c.position.set((n ? -14.2 : -12.6) + k * (-6 - n * 2), 0, (n ? -8.6 : -10.2) + k * (70 + n * 3));
            c.rotation.y = Math.PI - 0.15;
            c.visible = ride < 0.98;
          } else if (!rm) ud.head.rotation.x = Math.sin(now / 1100 + ud.ph) * 0.15;
        });
        G.banner.scale.x = ride > 0 ? 1 : 0.12;
        const readIt = view.phase === 'done';
        if (G.hearthMat.map !== (readIt ? G.hearthCv : G.hearthPlain)) { G.hearthMat.map = readIt ? G.hearthCv : G.hearthPlain; G.hearthMat.needsUpdate = true; }
        G.lance.visible = ride === 0;
        if (!rm) { const bp = G.banner.geometry.attributes.position; for (let i = 0; i < bp.count; i++) { const x = bp.getX(i); bp.setZ(i, Math.sin(x * 4 - tt * 5) * 0.08 * x); } bp.needsUpdate = true; }

        // The dial: the needle spins free when the sigil is set, follows her bearing, locks with a burst of light
        let ang;
        if (!S.sigil) ang = 0.35 + (rm ? 0 : Math.sin(tt * 2.2) * 0.012);
        else if (S.locked) ang = BEARING;
        else if (view.spin && now - view.spin < 1600 && !rm) ang = ((now - view.spin) / 1600) * 720 * (1 - (now - view.spin) / 3200);
        else ang = view.bear;
        view.bearShown += (ang - view.bearShown) * Math.min(1, dt * 8);
        G.needle.rotation.z = -view.bearShown * Math.PI / 180;
        const lk = view.lock ? Math.max(0, 1 - (now - view.lock) / 2400) : 0;
        G.dialGlow.material.opacity = S.locked ? 0.25 + lk * 0.75 + (rm ? 0 : Math.sin(tt * 2) * 0.05) : S.sigil ? 0.18 : 0;
        G.needleMat.color.setHex(S.locked ? 0xfff0b8 : 0xffd98a);
        G.curbLine.material.opacity += ((S.locked ? 1 : 0) - G.curbLine.material.opacity) * Math.min(1, dt * (rm ? 10 : 0.8));
        G.curbGlow.material.opacity = G.curbLine.material.opacity * (view.phase === 'locked' ? 0.75 + (rm ? 0 : Math.sin(tt * 3) * 0.15) : 0.3);

        // Rings on the doorways she can choose, the one she points at glowing
        G.markers.children.forEach((m) => {
          const age = rm ? 1 : Math.min(1, Math.max(0, (now - m.userData.born) / 1000 - m.userData.n * 0.08) * 3);
          const pop = 1 + 2.7 * Math.pow(age - 1, 3) + 1.7 * Math.pow(age - 1, 2);
          const hot = view.hot !== null && view.hot === m.userData.d;
          m.userData.h = (m.userData.h || 0) + ((hot ? 1 : 0) - (m.userData.h || 0)) * Math.min(1, dt * 10);
          m.scale.setScalar(pop * (1 + m.userData.h * 0.15));
          m.material.opacity = Math.min(1, 0.5 + Math.sin(now / 300) * 0.25 + m.userData.h * 0.45);
        });
        // the heaps of a false doorway tumble down when he finds them
        G.fleeRows.forEach((row) => row.forEach((dr) => {
          if (!dr.heap.visible) return;
          const t = dr.heap.userData.pop ? Math.min(1, (now - dr.heap.userData.pop) / 500) : 1;
          dr.heap.scale.setScalar(Math.max(0.001, 1 + 2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)));
        }));
        if (view.burst) {
          const b = view.burst, sp = G.burst.geometry.attributes.position;
          b.t += dt;
          for (let i = 0; i < G.burstN; i++) sp.setXYZ(i, b.o.x + b.v[i * 3] * b.t, b.o.y + b.v[i * 3 + 1] * b.t - 3 * b.t * b.t, b.o.z + b.v[i * 3 + 2] * b.t);
          sp.needsUpdate = true;
          G.burst.material.opacity = Math.max(0, 1 - b.t / 1.1);
          G.burst.visible = true;
          if (b.t > 1.1) { view.burst = null; G.burst.visible = false; }
        }
        const mp = G.motes.geometry.attributes.position, b0 = G.motesBase, wrap = (x) => ((x % 30) + 30) % 30;
        for (let i = 0; i < G.motesN; i++) mp.setXYZ(i, view.x - 15 + wrap(b0[i * 3] + tt * 0.6), b0[i * 3 + 1] + Math.sin(tt * 0.5 + i * 1.7) * 0.15, view.z - 15 + wrap(b0[i * 3 + 2] + tt * 0.2));
        mp.needsUpdate = true;
        if (!rm) G.stars[2].material.opacity = 0.75 + Math.sin(tt * 1.7) * 0.25;

        // ---- The camera ----
        let tx, ty, tz, lx, ly, lz;
        const ph = view.phase, narrow = G.camera.aspect < 1;
        if (st === 'stele' || (ph === 'walk' && view.z < 2 && !S.locked && !S.atDial)) {
          // behind his shoulder, the whole stele in view; when the watcher draws near, the picture opens to the left to show him
          const wide = !WATCH[S.watch].safe || (ph === 'setback');
          tx = narrow ? 0.9 : 2.2; ty = narrow ? 3.3 : 3.0; tz = narrow ? 7.6 : 6.4;
          lx = narrow ? 0 : -0.5; ly = 2.55; lz = STELE.z;
          if (wide) { tx = narrow ? 1.6 : 4.2; ty = 3.8; tz = narrow ? 9.2 : 8.4; lx = -2.6; ly = 1.9; lz = -2.6; }
        } else if (['sigil', 'bearing', 'locked'].includes(ph) || (ph === 'walk' && S.atDial && !S.locked)) {
          tx = AT_DIAL.x - 0.6; ty = 3.4; tz = AT_DIAL.z + (narrow ? 3.4 : 2.7); lx = DIAL.x; ly = G.DIAL_Y - 0.1; lz = DIAL.z;
          if (ph === 'locked') { tx = CURB.x + 2.3; ty = narrow ? 2.6 : 2.1; tz = CURB.z + (narrow ? 5.0 : 4.2); lx = CURB.x; ly = 0.7; lz = CURB.z + 0.6; }
        } else if (ph === 'ambush') {
          tx = view.x + 2.5; ty = 4.2; tz = view.z + 7; lx = -3; ly = 1.4; lz = -3;
        } else if (ph === 'hide') {
          tx = NICHE.x + 0.5; ty = 0.9; tz = NICHE.z + 0.95; lx = NICHE.x - 0.2; ly = 1.3; lz = FZ(FLEE.length - 1);
        } else if (ph === 'hearth' || ph === 'done') {
          tx = HEARTH.x - 0.2; ty = narrow ? 3.4 : 2.7; tz = HEARTH.z + (narrow ? 3.4 : 2.8); lx = HEARTH.x + 0.5; ly = 0.25; lz = HEARTH.z - 0.2;
        } else {
          // in the walls: behind him and above, looking south at the doorways
          const yaw = Math.PI + view.look;
          const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
          tx = view.x - fx * 4.4; ty = narrow ? 4.4 : 3.6; tz = view.z - fz * 4.4;
          lx = view.x + fx * 3.6; ly = 1.7; lz = view.z + fz * 3.6;
        }
        let k = camPos.ok && !rm ? Math.min(1, dt * 2.6) : 1;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { [tx, ty, tz] = cf.p; [lx, ly, lz] = cf.l; k = 1; }
        ['x', 'y', 'z'].forEach((a, i) => { camPos[a] += ([tx, ty, tz][i] - camPos[a]) * k; camPos['l' + a] += ([lx, ly, lz][i] - camPos['l' + a]) * k; });
        camPos.ok = true;
        G.camera.position.set(camPos.x, camPos.y, camPos.z);
        G.camera.lookAt(camPos.lx, camPos.ly, camPos.lz);
        if (view.shake > 0) {
          if (!rm) { const a = view.shake * view.shake * 0.12; G.camera.position.x += (Math.random() - 0.5) * a; G.camera.position.y += (Math.random() - 0.5) * a; }
          view.shake = Math.max(0, view.shake - dt * 2.2);
        }
        G.moonLight.position.set(view.x + 16, 26, view.z + 22);
        G.moonLight.target.position.set(view.x, 0, view.z);
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

      // ---- Pointer: tap a square of the stele to choose its word, a ringed doorway to run through it; drag to look ----
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
          if (view.phase === 'flee') view.look = Math.max(-1.6, Math.min(1.6, view.look - dx * 0.006));
        });
        el.canvas.addEventListener('pointerup', (e) => {
          if (!dragging) return;
          dragging = false;
          if (downAt && !downAt.moved && G) {
            const rect = el.canvas.getBoundingClientRect();
            const p = new G.T.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
            const rc = new G.T.Raycaster();
            rc.setFromCamera(p, G.camera);
            if (view.phase === 'stele') {
              const hit = rc.intersectObject(G.steleI)[0];
              if (hit && hit.face && hit.face.materialIndex === 4 && hit.uv) {
                const cx = hit.uv.x * G.CV_W, cy = (1 - hit.uv.y) * G.CV_H;
                const c = Math.floor((cx - G.GRID_X0) / G.CS), r = Math.floor((cy - G.GRID_Y0) / G.CS), cl = CELL[`${r},${c}`];
                if (cl) selectWord(cl.words.length > 1 && cl.words.includes(view.sel) ? cl.words.find((id) => id !== view.sel) : cl.words[0]);
              }
            } else if (view.phase === 'flee' && G.markers.children.length) {
              const row = G.fleeRows[S.flee.length];
              const hits = rc.intersectObjects(row.map((dr) => dr.lintel))[0];
              const ring = hits ? null : rc.intersectObjects(G.markers.children)[0];
              const d = hits ? row.find((dr) => dr.lintel === hits.object).d : ring ? ring.object.userData.d : undefined;
              if (d !== undefined) chooseDoor(d);
            }
          }
          downAt = null;
        });
        el.canvas.addEventListener('pointercancel', () => { dragging = false; downAt = null; });
      }
      // ---- Keyboard: Escape closes; in the walls the arrows run (as Hermes sees it: ← left is east); at the dial they turn the needle ----
      document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'none') return;
        if (e.key === 'Escape') { if (cine && cine.active) cine.skip(); else closeLexicon(); return; }
        const tag = (e.target && e.target.tagName) || '';
        if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
        if (/BUTTON/.test(tag) && (e.key === ' ' || e.key === 'Enter')) return;
        if (view.phase === 'flee') {
          const d = { ArrowLeft: 1, ArrowUp: 0, ArrowRight: -1 }[e.key];
          if (d !== undefined) { e.preventDefault(); chooseDoor(d); }
          return;
        }
        if (view.phase === 'bearing') {
          const d = { ArrowLeft: -1, ArrowRight: 1, PageDown: -10, PageUp: 10 }[e.key];
          if (d !== undefined) { e.preventDefault(); turnNeedle(view.bear + d * (e.shiftKey ? 10 : 1)); }
          return;
        }
        if (view.phase === 'stele' && (e.key === 'w' || e.key === 'W')) { e.preventDefault(); waitTurn(); }
      });

      // =====================================================================
      // Opening and closing
      // =====================================================================
      function canOpen() {
        if (isDone() || isTester()) return true;
        if (get('order_salt_playa_completed') !== 'true') {
          toast('✦ TERRA INCOGNITA ✦ Guide Hermes across the Salt Playa (Station 11) before he reaches the Nomad Ruins.');
          return false;
        }
        // After the salt: the walk through the dunes, then his call from the ruins at dusk (a save that never heard him
        // on the North Edge of the salt goes straight to the steles)
        let w = {};
        try { w = JSON.parse(get('order_chasm_wire') || '{}') || {}; } catch (e) { w = {}; }
        if (w.reply2 !== undefined) {
          const walking = typeof window.isLexiconMarchOver === 'function' && !window.isLexiconMarchOver();
          if (walking || w.reply4 === undefined) {
            const eta = walking && typeof window.getLexiconMarchEta === 'function' ? window.getLexiconMarchEta() : '';
            toast(eta
              ? '✦ THROUGH THE DUNES ✦ Hermes is walking to the Nomad Ruins. He arrives in ' + eta + ', and calls you from there.'
              : '✦ THE NOMAD RUINS ✦ Hermes is calling you on the Field Wire: answer him before you read the steles.');
            if (!eta && typeof window.activateHubView === 'function') window.activateHubView('view-field-wire');
            return false;
          }
        }
        return true;
      }
      let returnFocusTo = null;
      function openLexicon() {
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
        if (G && !cine && el.stage) cine = P.cinema(el.stage, { reduced: reducedMotion, onShot: (i, sh) => { if (sh.line) subtitle(sh.line, sh.dur - 0.4); } });
        fit();
        const firstTime = !get(WALK_KEY);
        view.quiet = true;
        S = load();
        if (isDone() && firstTime) { S.carved = WORDS.map((x) => x.id); S.atDial = true; S.sigil = true; S.locked = true; S.flee = FLEE_SOL.slice(); S.hidden = true; }   // read before this night existed (or by the tester)
        if (el.victory) el.victory.style.display = 'none';
        view.walk = null; view.look = 0; view.sel = null; view.raise = 0; view.lock = 0; view.spin = 0; view.sleeperUp = 0; view.ride = 0; view.chase = 0; camPos.ok = false;
        view.bear = 0; view.bearShown = S.locked ? BEARING : 0;
        if (fxEl.alert) fxEl.alert.hidden = true;
        hideReward(true);
        placeHermes();
        placeWatcher();
        if (G) G.fleeRows.forEach((row, i) => row.forEach((dr) => { if (dr.heap) { dr.heap.visible = (S.tried[i] || []).includes(dr.d) && S.flee.length <= i; dr.heap.userData.pop = 0; } }));
        paintStele();
        paintDial();
        paintHud();
        const st = stage();
        let introPending = false;
        const finishOpen = () => { if (get(HOWTO_KEY) !== 'seen' && !isDone()) showHowto(0); else focusFirst(); };
        if (st === 'done' || isDone()) {
          if (st !== 'done') { S.flee = FLEE_SOL.slice(); S.locked = true; S.sigil = true; S.atDial = true; }
          victory(false);
          say('Camp VII, near midnight. The fire is cold, the steles are clean, and the needle of Al-Qibla still points the way the BC Ashes rode: 194°, south-south-west. Its tail points to Tower II.');
        } else if (firstTime) {
          const intro = "Silvia, listen. The riders rode south at dusk with their wagon, but they left two men behind to watch the trail. One is asleep by the fire with his head on a saddle. The other walks a slow round with a torch, and his round passes these stones. I am crouched at the foot of the middle stele. The ten words are here, carved in a net exactly like your page, but the wind has packed every groove with sand. Choose a word, read it to me from your page, and I will brush it clean, gently. And watch his torch with me: when he turns this way, I lie still.";
          if (G && cine && !reducedMotion() && get(CINE_INTRO) !== 'seen') {
            introPending = true; put(CINE_INTRO, 'seen');
            view.phase = 'cine'; clearControls();
            cine.start(openingShots(), () => { showStele(intro); finishOpen(); });
          } else showStele(intro);
        }
        else if (st === 'stele') showStele(`I am still at the foot of the Crossword Stele, Silvia, ${S.carved.length} words clean. The watcher is ${WATCH[S.watch].at}.`);
        else if (st === 'sigil' || st === 'bearing') showDial(st === 'sigil' ? 'I am at the foot of the tall stele, by the dial. The watcher is still dozing. Tell me the sigil for its seven windows.' : 'The needle of the dial still swings free, Silvia. Tell me the vector, and I will set it.');
        else showFlee(`I am in the walls of the old camp, Silvia, at wall ${S.flee.length + 1}, and the torches are still behind me. Read me the letters.`);
        if (building && G) tick(performance.now(), 1 / 60);
        view.quiet = false;
        if (!raf) raf = requestAnimationFrame(frame);
        if (!introPending) finishOpen();
      }
      // The opening: the camp from above, the rearguard by the fire, the stone where Hermes begins
      function openingShots() {
        return [
          { from: { p: [-26, 13, 22], l: [-3, 1.5, -4] }, to: { p: [-15, 7.5, 13], l: [-3, 1.5, -5] }, dur: 6.5, kicker: 'STATION 12', title: 'CAMP VII · MIDNIGHT', line: 'The riders went south at dusk. Two men stayed behind.' },
          { from: { p: [-14.5, 1.7, -0.5], l: [FIRE.x, 0.9, FIRE.z] }, to: { p: [-5.5, 1.9, -13.5], l: [FIRE.x, 0.9, FIRE.z] }, dur: 6, kicker: 'BY THE FIRE', title: 'THE REARGUARD', line: 'One sleeps with his head on a saddle. One walks a round with a torch.' },
          { from: { p: [-8.5, 2.7, 7], l: [0.5, 2.4, -0.6] }, to: { p: [2.2, 3.0, 6.4], l: [-0.5, 2.55, -0.6] }, dur: 6, kicker: 'THE STELES', title: 'TEN WORDS IN THE SAND', line: 'Ten words, packed with sand. Brush them clean between his rounds.' }
        ];
      }
      // The ending: the name on the hearth, the way they rode, the road to Tower II
      function endingShots() {
        const H0 = { x: HEARTH.x, z: HEARTH.z };
        return [
          { from: { p: [H0.x - 0.2, 2.7, H0.z + 2.8], l: [H0.x + 0.5, 0.25, H0.z - 0.2] }, to: { p: [H0.x + 2.2, 1.4, H0.z + 1.6], l: [H0.x, 0.2, H0.z] }, dur: 5, kicker: 'ON THE HEARTH STONE', title: 'THE BC ASHES', line: 'A bird with its wings up, rising out of three flames.' },
          { from: { p: [H0.x + 2.2, 1.4, H0.z + 1.6], l: [H0.x, 0.2, H0.z] }, to: { p: [H0.x + 9, 9, H0.z + 11], l: [-6, 0.5, -2] }, dur: 6, kicker: 'AND THE NEEDLE POINTS', title: 'THE WAY THEY RODE', line: 'Their name, their sign and their road. And they do not know ours.' },
          { from: { p: [H0.x + 9, 9, H0.z + 11], l: [-6, 0.5, -2] }, to: { p: [H0.x + 17, 17, H0.z + 25], l: [0, 3, 32] }, dur: 5, line: 'Tower II lies the other way: fourteen degrees north-north-east.' }
        ];
      }
      function focusFirst() {
        const first = [...el.controls.querySelectorAll('button:not([disabled]), input:not([disabled])'), ...(el.victory ? el.victory.querySelectorAll('button') : []), el.close]
          .find((x) => x && x.offsetParent);
        if (first) first.focus({ preventScroll: true });
      }

      // ---- The reward: the stele as she cleaned it, the sigil, the bearing, the Ledger line and the name of the raiders ----
      const reward = { box: null, back: null };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      function showReward() {
        const body = modal.querySelector('.chasm3d-body');
        if (!body) return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward lex3d-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', 'Your reward for the Desert Lexicon');
          body.appendChild(reward.box);
          reward.box.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast'); });
        }
        const quiet = reducedMotion();
        const mins = Math.max(0, Math.round(S.min - START_MIN));
        const time = `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')} min`;
        // the stele as a little grid, her clean words lit in turn, the seven circles in gold
        const order = S.carved.slice();
        let cells = '';
        Object.values(CELL).forEach((cl) => {
          const idx = Math.min(...cl.words.map((id) => (order.includes(id) ? order.indexOf(id) : 99)));
          const on = idx < 99, t = (0.6 + idx * 0.22).toFixed(2);
          cells += `<g class="lx-cell${on ? ' is-on' : ''}${cl.circle ? ' is-circle' : ''}" ${on ? `style="--t:${t}s"` : ''}><rect x="${cl.c * 10 + 0.6}" y="${cl.r * 10 + 0.6}" width="8.8" height="8.8" rx="1"/>${cl.circle ? `<circle cx="${cl.c * 10 + 5}" cy="${cl.r * 10 + 5}" r="3.8"/>` : ''}${on ? `<text x="${cl.c * 10 + 5}" y="${cl.r * 10 + 6.6}">${cl.letter}</text>` : ''}</g>`;
        });
        const quietNight = S.heard === 0 && S.dead === 0 && mins > 0;
        reward.box.innerHTML = `<div class="rw-rays" aria-hidden="true"></div>
          <div class="rw-sparks" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--a:${(i * 360 / 22).toFixed(0)}deg;--d:${(140 + (i % 5) * 40)}px;--t:${(0.9 + (i % 4) * 0.2).toFixed(1)}s"></i>`).join('')}</div>
          <div class="chasm3d-reward-card">
          <div class="chasm3d-reward-kicker">Station 12 · The Desert Lexicon</div>
          <h3 class="chasm3d-reward-title">The Steles of Camp VII</h3>
          <p class="rw-sub">The words brushed clean under a watcher's torch, the sigil set in the bronze, the needle locked, a flight through the walls, and the name of the raiders at last.</p>
          <div class="rw-grid">
            <section class="rw-map lex-rw-map" aria-label="The Crossword Stele as you cleaned it">
              <div class="rw-label">The Crossword Stele</div>
              <svg viewBox="-1 -1 122 152" aria-hidden="true">${cells}</svg>
              ${mins > 0 ? `<div class="chasm3d-reward-stats">
                <div><b data-count="${mins}" data-time="1">${time}</b><span>in the ruins</span></div>
                <div><b data-count="${S.carved.length}">${S.carved.length}</b><span>of 10 words</span></div>
                <div><b data-count="${S.heard}">${S.heard}</b><span>times heard</span></div>
                <div><b data-count="${S.dead}">${S.dead}</b><span>dead ends</span></div>
              </div>` : ''}
              ${quietNight ? '<div class="rw-flawless">✦ Unseen, unheard ✦</div>' : ''}
              ${S.tries > 1 ? `<div class="rw-flawless">✦ Read on the ${['', 'first', 'second', 'third', 'fourth', 'fifth'][S.tries] || S.tries + 'th'} night ✦</div>` : ''}
            </section>
            <section class="rw-loot">
              <div class="chasm3d-reward-word"><span>The Desert Sigil</span>
                <strong aria-label="PHOENIX">${SIGIL.split('').map((l, i) => `<em style="--i:${i}">${l}</em>`).join('')}</strong>
                <small>Write it in the seven boxes of the Desert Sigil, on ${PAGE} of your journal.</small></div>
              <div class="rw-ledger lex-rw-bearing">
                <figure class="lex-compass-icon" aria-hidden="true"><svg viewBox="-40 -40 80 80"><circle r="34"/><path class="t" d="M0 -30 V-24 M0 30 V24 M-30 0 H-24 M30 0 H24"/><g class="nd"><path d="M0 -26 L4 0 L0 18 L-4 0 Z"/></g><circle class="hb" r="3"/></svg></figure>
                <div class="rw-ledger-text">
                  <div class="rw-ledger-kicker">Al-Qibla · the bearing locked</div>
                  <div class="rw-ledger-title">194° SSW ⇄ 14° NNE</div>
                  <p>The needle points the way the raiders rode. Its tail points across the Great Erg to Tower II.</p>
                </div>
              </div>
              <div class="rw-ledger lex-rw-ledger">
                <div class="rw-ledger-text">
                  <div class="rw-ledger-kicker">The Cipher Ledger · a new line</div>
                  <div class="rw-ledger-title">The Stargazer Proportion</div>
                  <div class="rw-eq" aria-label="R times 2 equals F"><i>R</i><u>×</u><b>2</b><u>=</u><i>F</i></div>
                  <p>Cut into the curb of the second stele, lit by the needle's shadow. It is in your Cipher Ledger now.</p>
                </div>
              </div>
              <div class="rw-ledger lex-rw-ashes">
                <figure class="lex-phoenix-icon" aria-hidden="true"><svg viewBox="-50 -64 100 100"><path d="M0 -6 C-18 -14 -34 -34 -44 -58 C-30 -46 -22 -44 -14 -40 C-20 -30 -12 -20 0 -12 M0 -6 C18 -14 34 -34 44 -58 C30 -46 22 -44 14 -40 C20 -30 12 -20 0 -12 M0 -12 V8 M-21 30 Q-20 12 -14 8 Q-8 12 -7 30 M-7 30 Q-6 12 0 0 Q6 12 7 30 M7 30 Q8 12 14 8 Q20 12 21 30"/><circle cy="-22" r="5"/></svg></figure>
                <div class="rw-ledger-text">
                  <div class="rw-ledger-kicker">Scratched on the hearth · their name</div>
                  <div class="rw-ledger-title">The BC Ashes</div>
                  <p>A bird rising out of three flames, the mark on their wagon. These are the raiders who took the Astrolabe of Distant Light.</p>
                </div>
              </div>
              <div class="rw-next">Next · Station 13 · The Oasis Clepsydra</div>
            </section>
          </div>
          <div class="chasm3d-reward-actions">
            <button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>
            <button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay by the fire</button>
          </div>
        </div>`;
        if (!rewardOpen()) reward.back = document.activeElement;
        reward.box.hidden = false;
        reward.box.classList.remove('is-fast');
        replay(reward.box, 'is-on');
        if (soundOn() && !quiet) {
          order.forEach((_, i) => tone([NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.E6][i % 7], 0.6 + i * 0.22, 0.8, { gain: 0.05, type: 'triangle' }));
          tone(196, 3.6, 2.4, { gain: 0.1 });
        }
        const counters = [...reward.box.querySelectorAll('[data-count]')];
        const fmt = (b, v) => (b.dataset.time ? `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, '0')} min` : String(v));
        if (!quiet) counters.forEach((b) => {
          const end = +b.dataset.count, t0 = performance.now() + 3200;
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
          closeLexicon();
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

      // ---- How to play: four short pages, the first time she opens the ruins and whenever she asks ----
      const howto = { box: $('lex3d-howto'), page: 0, back: null };
      const howtoPages = howto.box ? [...howto.box.querySelectorAll('.chasm3d-howto-page')] : [];
      const howtoOpen = () => !!howto.box && !howto.box.hidden;
      function showHowto(page) {
        if (!howto.box) return;
        const was = howtoOpen() ? howto.page : -1;
        if (!howtoOpen()) howto.back = document.activeElement;
        howto.page = Math.max(0, Math.min(howtoPages.length - 1, page));
        howtoPages.forEach((p, i) => { p.hidden = i !== howto.page; p.classList.remove('is-fwd', 'is-back'); });
        if (was >= 0 && was !== howto.page) replay(howtoPages[howto.page], howto.page > was ? 'is-fwd' : 'is-back');
        $('lex3d-howto-count').textContent = `${howto.page + 1} of ${howtoPages.length}`;
        [...($('lex3d-howto-dots')?.children || [])].forEach((d, i) => d.classList.toggle('is-on', i === howto.page));
        $('btn-lexicon-howto-back').disabled = howto.page === 0;
        $('btn-lexicon-howto-next').textContent = howto.page === howtoPages.length - 1 ? 'Into the ruins' : 'Next →';
        howto.box.hidden = false;
        $('btn-lexicon-howto-next').focus({ preventScroll: true });
      }
      function hideHowto() {
        if (!howtoOpen()) return;
        howto.box.hidden = true;
        put(HOWTO_KEY, 'seen');
        const back = howto.back;
        howto.back = null;
        if (back && back.id !== 'btn-lexicon-howto' && document.contains(back) && back.offsetParent) back.focus({ preventScroll: true });
        else focusFirst();
      }
      if (howto.box) {
        $('btn-lexicon-howto-next').addEventListener('click', () => (howto.page === howtoPages.length - 1 ? hideHowto() : showHowto(howto.page + 1)));
        $('btn-lexicon-howto-back').addEventListener('click', () => showHowto(howto.page - 1));
        $('btn-lexicon-howto-skip').addEventListener('click', hideHowto);
        $('btn-lexicon-howto').addEventListener('click', () => showHowto(0));
        window.addEventListener('keydown', (e) => {
          if (rewardOpen() && modal.style.display !== 'none' && e.key !== 'Tab') { e.stopPropagation(); if (e.key === 'Escape') hideReward(); return; }
          if (!howtoOpen() || modal.style.display === 'none' || e.key === 'Tab') return;
          e.stopPropagation();
          if (e.key === 'Escape') hideHowto();
        }, true);
      }
      function closeLexicon() {
        if (modal.style.display === 'none') return;
        if (cine && cine.active) cine.skip();
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (view.walk) finishWalk();
        if (view.phase === 'locked') ambush();
        if (howto.box) howto.box.hidden = true;
        hideReward(true);
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('closing');
          const speaker = document.getElementById('ambience-toggle');
          if (speaker && modal.contains(speaker)) document.body.appendChild(speaker);
          document.dispatchEvent(new Event('lexicon:closed'));
        }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      function readAgain() {
        hideReward(true);
        S = fresh();
        save();
        beginAgain('Another night, Silvia, and the wind has packed the grooves with sand again. The watcher walks his round with his torch. Choose a word.');
      }
      function beginAgain(line) {
        if (el.victory) el.victory.style.display = 'none';
        view.look = 0; view.sel = null; view.raise = 0; view.lock = 0; view.spin = 0; view.sleeperUp = 0; view.ride = 0; view.chase = 0; view.bear = 0; view.bearShown = 0; camPos.ok = false;
        if (G) G.fleeRows.forEach((row) => row.forEach((dr) => { if (dr.heap) dr.heap.visible = false; }));
        placeHermes();
        placeWatcher();
        paintStele();
        paintDial();
        paintHud();
        showStele(line);
      }

      window.openDesertLexiconModal = openLexicon;
      window.closeDesertLexiconModal = closeLexicon;
      if (el.close) el.close.addEventListener('click', closeLexicon);
      if (el.again) el.again.addEventListener('click', readAgain);
      if ($('btn-lexicon-reward')) $('btn-lexicon-reward').addEventListener('click', () => showReward());
      if (el.finish) el.finish.addEventListener('click', () => {
        closeLexicon();
        if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
      });
      modal.addEventListener('click', (e) => { if (e.target === modal) closeLexicon(); });

      // Test hook (scripts/audit/web_smoke.py)
      // Escape during a cinematic only skips it (the Hub would also close the window)
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cine && cine.active && modal.style.display !== 'none') { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); }
      }, true);

      window.__lexicon = {
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        gfx: () => G,
        state: () => Object.assign({ phase: view.phase, stage: S ? stage() : '', gl: !!G, sel: view.sel, bear: view.bear, drawn: G ? G.renderer.info.render.calls : 0,
          cam: G ? G.camera.position.toArray().map((v) => +v.toFixed(2)) : [], watchSafe: S ? WATCH[S.watch].safe : null }, S),
        select: (id) => { selectWord(id); return view.phase; },
        brush: (word) => { brushWord(word); if (view.walk) finishWalk(); return view.phase; },
        wait: () => { waitTurn(); return view.phase; },
        creep: () => { creepToDial(); if (view.walk) finishWalk(); return view.phase; },
        goOn: () => { goOn(); return view.phase; },
        sigil: (word) => { setSigil(word); return view.phase; },
        turn: (b) => { turnNeedle(b); return view.bear; },
        lock: () => { lockNeedle(); return view.phase; },
        ambush: () => { ambush(); return view.phase; },
        run: () => { const b = el.controls.querySelector('.lex3d-run'); if (b) b.click(); if (view.walk) finishWalk(); return view.phase; },
        door: (d) => { chooseDoor(d); while (view.walk) finishWalk(); return view.phase; },
        sol: () => FLEE_SOL.slice(),
        frames: (n) => { for (let i = 0; i < (n || 1); i++) tick(performance.now() + i * 33, 1 / 30); }
      };
    })();
