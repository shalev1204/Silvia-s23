
    // =========================================================================
    // ☀️ STATION 14 · THE SUN MONOLITH & CAIRN II (THE WALKING SUN · SHEET 13B)
    // Part I (journal): the seven-letter sigil wakes the Monolith.
    // Part II (web only): move the sun until the shadow tip touches the four marks
    // named by the inscription, in order. Reward: the Seal of Cairn II and two Ledger equations.
    // =========================================================================
    (function initSunMonolith() {
      const modal = document.getElementById('modal-sun-monolith');
      if (!modal) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const KEYS = {
        awake: 'order_sun_monolith_awake',
        marks: 'order_sun_monolith_marks',
        done: 'order_sun_monolith_completed',
        fails: 'order_monolith_key_fails',
        hint: 'order_monolith_hint',
        minute: 'order_monolith_sun_minute'
      };
      const SIGIL = 'SUNDIAL';

      // ---- The sky model (one fixed day at the latitude of the Ridge) ----
      const MONOLITH_HEIGHT = 24;   // paces (Sheet 13B)
      const SUN_MAX_ALT = 60;       // degrees above the horizon at true noon
      const FIRST_MINUTE = 7 * 60, LAST_MINUTE = 17 * 60;
      const rad = (d) => d * Math.PI / 180;
      function sunAt(minute) {
        const t = minute / 60;
        return { bearing: 90 + (t - 6) * 15, altitude: SUN_MAX_ALT * Math.sin(Math.PI * (t - 6) / 12) };
      }
      // Shadow tip in paces: x = east, y = north
      function shadowTip(minute) {
        const s = sunAt(minute);
        const length = MONOLITH_HEIGHT / Math.tan(rad(s.altitude));
        const bearing = rad((s.bearing + 180) % 360);
        return { x: length * Math.sin(bearing), y: length * Math.cos(bearing), length };
      }

      // The four carved marks sit where the shadow tip falls at the inscription's four moments.
      // The Lion (10:00) and the Ibis (14:00) also lie on the shadow's path but are never named: touching one
      // puts the marks back to sleep, so sweeping the sun without reading the inscription fails.
      // The moon (south) and the star (shorter than the noon shadow) can never be touched.
      const MARKS = [
        { id: 'jackal', icon: '🐺', name: 'the Jackal', minute: 8 * 60 },
        { id: 'falcon', icon: '🦅', name: 'the Falcon', minute: 12 * 60 },
        { id: 'scarab', icon: '🪲', name: 'the Scarab', minute: 15 * 60 },
        { id: 'serpent', icon: '🐍', name: 'the Serpent', minute: 16 * 60 + 30 }
      ].map((m) => Object.assign(m, shadowTip(m.minute)));
      const TRAPS = [
        { id: 'lion', icon: '🦁', name: 'the Lion', minute: 10 * 60 },
        { id: 'ibis', icon: '🪶', name: 'the Ibis', minute: 14 * 60 }
      ].map((m) => Object.assign(m, shadowTip(m.minute)));
      const DECOYS = TRAPS.concat([
        { id: 'moon', icon: '🌙', name: 'the Moon', x: 0, y: -20 },
        { id: 'star', icon: '⭐', name: 'the Star', x: -7, y: 5 }
      ]);
      const ALL_MARKS = MARKS.concat(DECOYS).map((m) => Object.assign(m, { radius: Math.max(3, 0.11 * Math.hypot(m.x, m.y)) }));

      const INSCRIPTION = [
        'First, the morning shadow, as long as the outermost ring, leaning toward the sunset.',
        'Then the shortest shadow of the day, bowing to the north star.',
        'Then the afternoon shadow that points north-east, almost twice the shortest.',
        'Last, the evening shadow, four times the shortest, reaching back toward the sunrise.'
      ];
      const FRAGMENTS = [
        'We, the stone-setters of the Order, raised five cairns to measure this desert, one for every road the sun keeps.',
        'Under each cairn a seal sleeps. Only the patient shadow wakes it; force finds nothing but stone.',
        'When the five seals return to the gates of the Sanctuary, the doors will open for the one who carries the light.',
        'And the Oracle, who keeps the sand, will remember.'
      ];
      const MARK_DISPATCH = [
        "The Jackal is glowing! The morning shadow found it. The first line of the founders' message is surfacing in the stone.",
        "The Falcon answered at noon, Silvia. Two lines now. I am copying every word into my field log.",
        "The Scarab! Three of four. The stone under my feet is warm and humming like a struck bell.",
        "The Serpent took the last of the evening light... and the lid of Cairn II is sliding open!"
      ];

      const HEARTS = 3;
      const WALK_KEY = 'order_monolith_walk', HOWTO_KEY = 'order_monolith_howto';
      const CINE_INTRO = 'order_monolith_cine_intro', CINE_OUTRO = 'order_monolith_cine_outro';
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const toast = (msg) => { if (typeof window.showDesertToast === 'function') window.showDesertToast(msg); };
      const P = window.EclipsePaint, SC = window.EclipseScenery;

      const el = {
        close: $('btn-close-monolith'), stage: $('mon3d-stage'), canvas: $('mon3d-canvas'), subtitle: $('mon3d-subtitle'), fade: $('mon3d-fade'),
        clock: $('mon3d-clock'), hearts: $('mon3d-hearts'), marksHud: $('mon3d-marks'), where: $('mon3d-where'), dispatch: $('monolith-dispatch-text'),
        controls: $('mon3d-controls'), sigilRow: $('mon3d-sigil-row'), sunRow: $('mon3d-sun-row'),
        keyInput: $('monolith-key-input'), speak: $('btn-monolith-speak'), keyFeedback: $('monolith-key-feedback'),
        sky: $('monolith-sky'), slider: $('monolith-time-slider'), earlier: $('btn-monolith-earlier'), later: $('btn-monolith-later'),
        timeLabel: $('monolith-time-label'), mark: $('btn-monolith-mark'), markFeedback: $('monolith-mark-feedback'),
        inscription: $('monolith-inscription'), fragments: $('monolith-fragments'),
        lost: $('mon3d-lost'), again: $('btn-monolith-again'), victory: $('monolith-victory'), victoryText: $('monolith-victory-text'),
        finish: $('btn-monolith-finish'), rewardBtn: $('btn-monolith-reward'), replay: $('btn-monolith-replay'),
        howto: $('mon3d-howto'), help: $('btn-monolith-howto')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      // What the road to the gates and the night on the Erg left in Hermes's satchel (gates-road.js)
      const road = () => (window.GatesRoad ? window.GatesRoad.flags() : {});
      const marksFound = () => Math.max(0, Math.min(MARKS.length, parseInt(get(KEYS.marks) || '0', 10) || 0));
      const isTester = () => (typeof window.isAdminTester === 'function' && window.isAdminTester())
        || (typeof window.isCarlesTester === 'function' && window.isCarlesTester());

      // Hints climb three levels (hub/js/hint-ladder.js); level 2 is the older help of each part
      const hints = window.EclipseHints;
      const sigilHints = hints.define({
        id: 's14-sigil', station: 'Station 14', title: 'the sigil of the seven noons', group: 'desert',
        anchor: el.keyFeedback, solved: isAwake, legacyKey: KEYS.hint,
        texts: [
          'Each of the seven noons on the page “The Sun Monolith & Cairn II” gives one letter. You only know the shadow of my staff: the shadow of the Monolith is the one the dial needs.',
          'I wrote down how my staff and the Monolith share the sun. It is in Ask Hermes, under the question about reading the shadows of the Monolith.',
          'Let us do the first noon together. My staff\'s shadow at Noon I is 1.5 paces. The Monolith is twelve times taller than my staff, so its shadow is 12 × 1.5 = 18 paces. On the dial, the ring of 18 paces carries S. Now Noon II, the same way.'
        ]
      });
      const shadowHints = hints.define({
        id: 's14-shadow', station: 'Station 14', title: 'the walking sun', group: 'desert',
        anchor: el.markFeedback, solved: isDone, active: isAwake,
        texts: [
          'Read the inscription line by line before you move the sun. Each line tells you where the shadow must fall, not what time it is, and the stone only answers the marks it names, in its order.',
          'Some carved marks lie on the shadow\'s path but the inscription never names them. My note on how a shadow moves through the day is in Ask Hermes: "How does a shadow move during the day?"',
          'Let us find the first moment together. The sun sets in the west, so a shadow leaning toward the sunset falls west, and that happens in the morning, with the sun in the east. Drag the sun early into the morning and stop when the tip of the shadow touches the mark on the outermost ring. Then line II, the same way.'
        ]
      });
      // ---- State of the walk: hearts and tries (the marks, the sigil and the sun keep their own keys) ----
      let S = null;
      function freshWalk() { return { hearts: HEARTS, tries: 1, wrong: 0, lost: false }; }
      function loadWalk() {
        try {
          const s = JSON.parse(get(WALK_KEY) || 'null');
          if (s && typeof s === 'object') {
            const w = Object.assign(freshWalk(), s);
            w.hearts = Math.max(0, Math.min(HEARTS, w.hearts | 0));
            w.tries = Math.max(1, w.tries | 0);
            w.wrong = Math.max(0, w.wrong | 0);
            w.lost = !!w.lost || w.hearts <= 0;
            return w;
          }
        } catch (e) {}
        return freshWalk();
      }
      function saveWalk() { if (S) set(WALK_KEY, JSON.stringify(S)); }

      let minute = Math.max(FIRST_MINUTE, Math.min(LAST_MINUTE, parseInt(get(KEYS.minute) || String(FIRST_MINUTE), 10) || FIRST_MINUTE));
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      let walk = null, busy = false, introPending = false;
      const view = { rings: -1, ringsT0: 0, lidT0: 0, sealT0: 0, lid: 0, seal: 0, glowPulse: 0, flash: 0 };

      const fmt = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
      const svgEl = (tag, attrs) => {
        const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
        return n;
      };
      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
      function feedback(node, text, kind) {
        if (!node) return;
        node.textContent = text;
        node.classList.toggle('is-error', kind === 'error');
        node.classList.toggle('is-ok', kind === 'ok');
      }
      function subtitle(text, secs) {
        if (!el.subtitle) return;
        el.subtitle.textContent = text;
        el.subtitle.classList.add('is-on');
        clearTimeout(subtitle.t);
        subtitle.t = setTimeout(() => el.subtitle.classList.remove('is-on'), (secs || 5) * 1000);
      }
      const phase = () => (isDone() ? 'done' : (S && S.lost) ? 'lost' : isAwake() ? 'sun' : 'sigil');

      // ---- The little sky in the corner (the sun's path; drag the sun) ----
      // East on the right, so the sun and its shadow always sit on opposite sides
      const SKY_X = (m) => 190 - 180 * (m / 60 - 6) / 12;
      const SKY_Y = (m) => 58 - 48 * Math.sin(Math.PI * (m / 60 - 6) / 12);
      let sunDot = null;
      function drawSky() {
        if (!el.sky) return;
        el.sky.innerHTML = '';
        el.sky.appendChild(svgEl('line', { x1: 0, y1: 58, x2: 200, y2: 58, stroke: '#d4a853', 'stroke-opacity': 0.5, 'stroke-width': 0.6 }));
        let d = '';
        for (let m = 6 * 60; m <= 18 * 60; m += 10) d += (d ? ' L ' : 'M ') + SKY_X(m).toFixed(2) + ' ' + SKY_Y(m).toFixed(2);
        el.sky.appendChild(svgEl('path', { d, fill: 'none', stroke: '#fde68a', 'stroke-opacity': 0.45, 'stroke-width': 0.6, 'stroke-dasharray': '2 2' }));
        [['W · sunset', 12, 'start'], ['S · noon', 100, 'middle'], ['E · sunrise', 188, 'end']].forEach(([label, x, anchor]) => {
          const t = svgEl('text', { x, y: 63, fill: '#fff1cc', 'font-size': 4.4, 'text-anchor': anchor });
          t.textContent = label;
          el.sky.appendChild(t);
        });
        sunDot = svgEl('circle', { r: 4.2, fill: '#fbbf24', stroke: '#fff7d6', 'stroke-width': 0.8 });
        el.sky.appendChild(sunDot);
      }

      function markUnderShadow(m) {
        const tip = shadowTip(m);
        return ALL_MARKS.find((mk) => Math.hypot(tip.x - mk.x, tip.y - mk.y) <= mk.radius) || null;
      }

      // ---- The screen: everything that is not the 3D scene ----
      function paintChrome() {
        const found = marksFound(), ph = phase();
        const tip = shadowTip(minute);
        if (sunDot) { sunDot.setAttribute('cx', SKY_X(minute).toFixed(2)); sunDot.setAttribute('cy', SKY_Y(minute).toFixed(2)); }
        if (el.sky) el.sky.setAttribute('data-locked', ph === 'sun' && !busy ? 'false' : 'true');
        if (el.slider) { el.slider.value = String(minute); el.slider.setAttribute('aria-valuetext', fmt(minute)); el.slider.disabled = busy; }
        if (el.timeLabel) el.timeLabel.textContent = fmt(minute);
        if (el.clock) el.clock.textContent = '☀ ' + fmt(minute);
        if (el.hearts) {
          el.hearts.innerHTML = [0, 1, 2].map((i) => '<i class="chasm3d-heart' + (i < (S ? S.hearts : HEARTS) ? '' : ' is-lost') + '">♥</i>').join('');
          el.hearts.setAttribute('aria-label', (S ? S.hearts : HEARTS) + ' of 3 hearts left');
        }
        if (el.marksHud) {
          el.marksHud.innerHTML = MARKS.map((m, i) => '<i class="mon3d-mark' + (i < found ? ' is-found' : '') + '" title="' + m.name + '">' + m.icon + '</i>').join('');
          el.marksHud.setAttribute('aria-label', found + ' of 4 shadow marks awake');
        }
        if (el.where) {
          const text = ph === 'done' ? 'Cairn II is open · the Seal is yours'
            : ph === 'lost' ? 'The sun has set · attempt ' + S.tries
              : ph === 'sigil' ? 'At the foot of the Monolith · speak the sigil'
                : 'The walking sun · ' + found + ' of 4 marks awake · shadow ' + tip.length.toFixed(0) + ' paces';
          if (el.where.textContent !== text) el.where.textContent = text;
        }
        const lost = ph === 'lost', done = ph === 'done';
        if (el.sigilRow) el.sigilRow.hidden = ph !== 'sigil';
        if (el.sunRow) el.sunRow.hidden = ph !== 'sun';
        if (el.controls) el.controls.style.display = (lost || done) ? 'none' : '';
        if (el.lost) el.lost.hidden = !lost;
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        if (el.help) el.help.style.display = (lost || done) ? 'none' : '';
        if (el.mark) el.mark.disabled = ph !== 'sun' || busy;
        if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
        if (isAwake() && el.keyFeedback && el.keyFeedback.textContent !== 'Sigil spoken: ' + SIGIL + ' ✓') feedback(el.keyFeedback, 'Sigil spoken: ' + SIGIL + ' ✓', 'ok');
        if (el.inscription) {
          el.inscription.innerHTML = '';
          INSCRIPTION.forEach((line, i) => {
            const li = document.createElement('li');
            li.setAttribute('data-num', ['I', 'II', 'III', 'IV'][i]);
            li.textContent = isAwake() ? line : 'Sealed in stone until the Monolith wakes.';
            li.classList.toggle('is-found', i < found);
            el.inscription.appendChild(li);
          });
        }
        if (el.fragments) {
          el.fragments.innerHTML = '';
          FRAGMENTS.forEach((text, i) => {
            const div = document.createElement('div');
            div.className = 'monolith-fragment' + (i < found ? '' : ' is-sealed');
            div.textContent = i < found ? '“' + text + '”' : 'A line of the founders, still asleep in the stone.';
            el.fragments.appendChild(div);
          });
        }
        sigilHints.refresh(); shadowHints.refresh();
      }

      function setMinute(m, persist) {
        if (busy || cine && cine.active) return;
        minute = Math.max(FIRST_MINUTE, Math.min(LAST_MINUTE, Math.round(m)));
        if (persist) set(KEYS.minute, String(minute));
        paintChrome();
      }

      // ---- The Ridge of the Sun in 3D. One unit is one pace; east is +x and north is -z ----
      const BASE = { x: 1.6, z: 7.4 };      // where Hermes waits, by the foot of Cairn II
      const CAIRN = { x: 5.6, z: 4.6 };
      const faceYaw = (fx, fz, tx, tz) => Math.atan2(-(tx - fx), -(tz - fz));   // Hermes's front is -z at yaw 0
      const ssm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      const LETTER_RINGS = (() => {   // the page's rings: 18 S, 6 U, 30 N, 12 D, 36 I, 24 A, 42 L
        const pairs = [[6, 'U'], [12, 'D'], [18, 'S'], [24, 'A'], [30, 'N'], [36, 'I'], [42, 'L']];
        return pairs.map(([r, c]) => ({ r, c }));
      })();

      function buildWorld() {
        const T = window.THREE;
        if (!T || !P || !SC || !el.canvas) return null;
        let renderer;
        try { renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputEncoding = T.sRGBEncoding;
        if (T.ReinhardToneMapping) { renderer.toneMapping = T.ReinhardToneMapping; renderer.toneMappingExposure = 1.08; }
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(46, 16 / 10, 0.5, 900);
        const paint = SC.paint();
        const hex = SC.util.hex;
        const horizon0 = 0xe8cfa8;
        // the fog is laid after the tone curve and the encoding, so it takes the sky's own horizon colour as it shows: the sand melts into the sky with no seam
        const skyFog = (h) => new T.Color(h);
        scene.fog = new T.Fog(skyFog(horizon0), 150, 340);
        const sky = SC.sky(scene, { horizon: horizon0 });
        sky.mesh.scale.setScalar(3.2);
        const ground = SC.terrain(scene, paint, { size: 1000, segments: 170, flatRadius: 105, seed: 14 });
        try { const gm = ground.mesh.material; [gm.map, gm.bumpMap].forEach((tx) => { if (tx) tx.repeat.set(92, 92); }); } catch (e) {}
        SC.ridges(scene, { horizon: horizon0, rings: [{ R: 250, h: 36, seed: 3, col: hex(0xc88a5e), haze: 0.5 }, { R: 310, h: 54, seed: 9, col: hex(0xa98a86), haze: 0.7 }] });
        const lights = SC.lights(scene, { keyI: 1.2, hemi: 0.46, amb: 0.14, backI: 0.0, fillI: 0.2, shadowExtent: 98, shadowSize: 2048, tx: 0, tz: -24 });
        lights.key.shadow.camera.near = 20; lights.key.shadow.camera.far = 460; lights.key.shadow.camera.updateProjectionMatrix();
        lights.key.shadow.bias = -0.0012; lights.key.shadow.normalBias = 0.12; lights.key.shadow.radius = 2.5;

        const strata = (w, h, a, b, seed) => P.canvasTex(w, h, (g, ww, hh) => {
          const gr = g.createLinearGradient(0, 0, 0, hh);
          gr.addColorStop(0, a); gr.addColorStop(1, b);
          g.fillStyle = gr; g.fillRect(0, 0, ww, hh);
          const r = P.rng(seed);
          for (let i = 0; i < 70; i++) {
            const y = r() * hh, th = 1 + r() * 4;
            g.fillStyle = r() < 0.5 ? 'rgba(90,52,24,0.16)' : 'rgba(255,235,190,0.12)';
            g.fillRect(0, y, ww, th);
          }
          for (let i = 0; i < 18; i++) { g.strokeStyle = 'rgba(70,40,18,0.18)'; g.lineWidth = 1; g.beginPath(); const x = r() * ww; g.moveTo(x, r() * hh); g.lineTo(x + (r() - 0.5) * 20, r() * hh); g.stroke(); }
        });
        const monoTex = strata(256, 512, '#e0b678', '#b88a54', 4);
        monoTex.wrapS = monoTex.wrapT = T.RepeatWrapping;
        const stone = P.rim ? P.rim(paint({ map: strata(256, 256, '#d9ad72', '#b4834e', 8) }), 0xffe6c0, 0.22) : paint({ map: strata(256, 256, '#d9ad72', '#b4834e', 8) });
        const monoMat = P.rim ? P.rim(paint({ map: monoTex }), 0xffe6c0, 0.2) : paint({ map: monoTex });
        const goldMat = paint({ color: 0xe2b457, emissive: 0xffc46b, emissiveIntensity: 0.22 });

        // the Monolith: 24 paces of sandstone, its faces to the four winds, a gilded point
        const mono = new T.Group();
        const plinth = new T.Mesh(new T.BoxGeometry(6.4, 0.7, 6.4), stone); plinth.position.y = 0.35; mono.add(plinth);
        const step2 = new T.Mesh(new T.BoxGeometry(5.2, 0.5, 5.2), stone); step2.position.y = 0.95; mono.add(step2);
        const shaft = new T.Mesh(new T.CylinderGeometry(1.5, 2.7, 22.0, 4, 1), monoMat);
        shaft.rotation.y = Math.PI / 4; shaft.position.y = 1.2 + 11.0; mono.add(shaft);
        const tip = new T.Mesh(new T.ConeGeometry(1.4, 1.0, 4), goldMat);
        tip.rotation.y = Math.PI / 4; tip.position.y = 23.2 + 0.5; mono.add(tip);
        scene.add(mono);

        // the dial painted on the paving: seven rings, north half, with their lengths in paces on the west side
        const decalTex = P.canvasTex(1024, 1024, (g, w, h) => {
          g.clearRect(0, 0, w, h);
          const s = w / 100, cx = w / 2, cy = h / 2;
          g.lineCap = 'round';
          for (let r = 6; r <= 42; r += 6) {
            g.strokeStyle = 'rgba(60,32,12,0.55)'; g.lineWidth = 7;
            g.beginPath(); g.arc(cx, cy, r * s, Math.PI, 2 * Math.PI); g.stroke();
            g.strokeStyle = r === 42 ? 'rgba(232,190,100,0.95)' : 'rgba(232,190,100,0.7)'; g.lineWidth = 3;
            g.beginPath(); g.arc(cx, cy, r * s, Math.PI, 2 * Math.PI); g.stroke();
            g.fillStyle = 'rgba(70,40,16,0.85)'; g.font = '700 22px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(String(r), cx - r * s, cy + 22);
          }
          g.strokeStyle = 'rgba(60,32,12,0.4)'; g.lineWidth = 4;
          g.beginPath(); g.moveTo(cx - 44 * s, cy); g.lineTo(cx + 44 * s, cy); g.stroke();
          g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - 44 * s); g.stroke();
          g.fillStyle = 'rgba(70,40,16,0.9)'; g.font = '700 30px Cinzel, Georgia, serif';
          g.fillText('N', cx, cy - 46 * s); g.fillText('W', cx - 46 * s, cy + 2); g.fillText('E', cx + 46 * s, cy + 2);
        });
        const decal = new T.Mesh(new T.PlaneGeometry(100, 100), paint({ map: decalTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
        decal.rotation.x = -Math.PI / 2; decal.position.y = 0.05; decal.receiveShadow = true;
        scene.add(decal);

        // the letter slabs on the north line (the page's rings: they only show once the sigil is spoken)
        const slabs = LETTER_RINGS.map((ring) => {
          const tex = P.canvasTex(128, 128, (g, w, h) => {
            g.fillStyle = '#4a2c12'; g.fillRect(0, 0, w, h);
            g.strokeStyle = '#e6c27a'; g.lineWidth = 5; g.strokeRect(8, 8, w - 16, h - 16);
            g.fillStyle = '#fde68a'; g.font = '700 76px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(ring.c, w / 2, h / 2 + 4);
          });
          const mat = paint({ map: tex, emissive: 0xffb347, emissiveIntensity: 0 });
          const slab = new T.Mesh(new T.BoxGeometry(2.6, 0.34, 2.6), [stone, stone, mat, stone, stone, stone]);
          slab.position.set(0, 0.17, -ring.r); slab.castShadow = true; slab.receiveShadow = true; slab.visible = false;
          slab.userData = { mat };
          scene.add(slab);
          return slab;
        });

        // the carved marks: round slabs of stone where the tip of the shadow can land
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(0.4, 'rgba(255,190,90,0.5)'); gr.addColorStop(1, 'rgba(255,180,60,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const marks = ALL_MARKS.map((m) => {
          const grp = new T.Group();
          const r = m.radius;
          const faceTex = P.canvasTex(256, 256, (g, w, h) => {
            g.clearRect(0, 0, w, h);
            const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
            gr.addColorStop(0, '#e2bb7e'); gr.addColorStop(1, '#b98a52');
            g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); g.fill();
            g.strokeStyle = '#6b4322'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 12, 0, Math.PI * 2); g.stroke();
            g.strokeStyle = 'rgba(253,230,138,0.6)'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 26, 0, Math.PI * 2); g.stroke();
            g.font = '150px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.globalAlpha = 1; g.fillText(m.icon, w / 2, h / 2 + 8);
          });
          const body = new T.Mesh(new T.CylinderGeometry(r, r * 1.05, 0.32, 40), stone);
          body.position.y = 0.16; grp.add(body);
          const faceMat = paint({ map: faceTex, emissive: 0xf59e0b, emissiveIntensity: 0 });
          const face = new T.Mesh(new T.CircleGeometry(r * 0.96, 40), faceMat);
          face.rotation.x = -Math.PI / 2; face.position.y = 0.335; grp.add(face);
          const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
          halo.scale.set(r * 3.4, r * 3.4, 1); halo.position.y = 0.8; grp.add(halo);
          grp.position.set(m.x, 0, -m.y);
          grp.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });
          scene.add(grp);
          return { m, grp, faceMat, halo };
        });

        // the tip of the shadow: a ring of light and a thin beam, so it can be followed from far away
        const tipRing = new T.Mesh(new T.TorusGeometry(1.5, 0.14, 10, 40), new T.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.9 }));
        tipRing.rotation.x = Math.PI / 2; tipRing.position.y = 0.2;
        const tipBeam = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 7, 8, 1, true), new T.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.32, depthWrite: false, blending: T.AdditiveBlending }));
        tipBeam.position.y = 3.5;
        const tipGroup = new T.Group(); tipGroup.add(tipRing, tipBeam); scene.add(tipGroup);

        // Cairn II at the foot of the Monolith: three steps, a lid that slides, a niche, a Seal that rises
        const cairn = new T.Group();
        const steps = [[3.8, 0.5, 3.8, 0.25], [3.0, 0.5, 3.0, 0.75], [2.2, 0.5, 2.2, 1.25]];
        steps.forEach(([w, h, d, y]) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), stone); b.position.y = y; b.castShadow = true; b.receiveShadow = true; cairn.add(b); });
        const nicheMat = new T.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0 });
        const niche = new T.Mesh(new T.BoxGeometry(1.5, 0.05, 1.1), nicheMat); niche.position.y = 1.52; cairn.add(niche);
        const lid = new T.Mesh(new T.BoxGeometry(1.8, 0.2, 1.4), stone); lid.position.y = 1.62; lid.castShadow = true; cairn.add(lid);
        const ironMat = paint({ color: 0x2a2622 });
        [-0.5, 0, 0.5].forEach((dz) => { const bar = new T.Mesh(new T.BoxGeometry(2.0, 0.06, 0.07), ironMat); bar.position.set(0, 0.13, dz); bar.rotation.y = 0.12 * dz; lid.add(bar); });
        const ash = new T.Mesh(new T.CircleGeometry(0.9, 18), new T.MeshBasicMaterial({ color: 0x2b2724, transparent: true, opacity: 0.55, depthWrite: false }));
        ash.rotation.x = -Math.PI / 2; ash.position.set(0.6, 0.06, 2.4); cairn.add(ash);
        const sealMat = new T.MeshBasicMaterial({ color: 0xe3a93d });
        const seal = new T.Mesh(new T.CylinderGeometry(0.46, 0.46, 0.1, 28), sealMat); seal.visible = false; seal.position.y = 1.6; cairn.add(seal);
        const sealHalo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
        sealHalo.scale.set(4, 4, 1); sealHalo.position.y = 1.7; cairn.add(sealHalo);
        for (let i = 0; i < 4; i++) {
          const tb = new T.Mesh(new T.BoxGeometry(0.9, 1.2, 0.14), stone);
          const a = i * Math.PI / 2 + 0.5;
          tb.position.set(Math.cos(a) * 2.7, 0.62, Math.sin(a) * 2.7); tb.rotation.set(-0.18, -a + Math.PI / 2, 0); tb.castShadow = true; cairn.add(tb);
        }
        cairn.position.set(CAIRN.x, 0, CAIRN.z);
        scene.add(cairn);

        // a few stones for the scale of it
        [[-14, 10, 17, 1.4], [18, 14, 23, 1.2], [-30, -4, 31, 2.0], [34, -12, 41, 1.7], [-52, 20, 53, 2.2], [60, 24, 59, 2.0]].forEach(([x, z, seed, sc]) => {
          try { const rk = SC.props.rocks(paint, { seed, scale: sc, count: 4 }); rk.position.set(x, ground.heightAt(x, z), z); rk.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(rk); } catch (e) {}
        });

        let H = null;
        try {
          H = P.buildHermes(T, glowTex);
          if (H && H.hermes) {
            H.hermes.scale.setScalar(2.5);
            H.hermes.position.set(BASE.x, 0, BASE.z);
            H.hermes.rotation.y = faceYaw(BASE.x, BASE.z, CAIRN.x, CAIRN.z);
            H.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
            scene.add(H.hermes);
          }
        } catch (e) { H = null; }
        mono.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

        // the feel: a lens that lets the sun and the gold bloom, a body for Hermes, a camera that breathes, sand that falls
        const FX = window.EclipseFX;
        let post = null, gait = null, dust = null, sparks = null, prints = null, shake = null;
        if (FX) {
          try { post = FX.post(renderer, { bloom: 0.5, threshold: 0.95, knee: 0.12, vignette: 0.3, grain: 0.026, ca: 0.18, sat: 1.04, contrast: 1.03, shafts: 0.4, shaftThreshold: 0.8, shade: 0.32 }); } catch (e) { post = null; }
          shake = FX.shaker({ idle: 0.0022 });
          dust = FX.particles(scene, { max: 360, wind: [0.9, 0, 0.25] });
          sparks = FX.particles(scene, { max: 260, additive: true });
          prints = FX.footprints(scene, { max: 64, life: 18 });
          if (H) gait = FX.gait(H, { onStep: (st) => {
            prints.stamp(st.pos.x, 0.07, st.pos.z, H.hermes.rotation.y, st.side, 2.5);
            dust.emit(st.pos, 3, { size: [0.45, 0.8], speed: [0.2, 0.7], up: [0.25, 0.7], life: [0.6, 1.1], alpha: 0.3, gravity: -0.7, color: 0xdcbb8c });
          } });
        }
        return { skyFog, T, renderer, scene, camera, sky, lights, mono, slabs, marks, tipGroup, tipRing, tipBeam, cairn, lid, niche, nicheMat, seal, sealHalo, H, hermes: H && H.hermes, goldMat, ground, post, gait, dust, sparks, prints, shake, windT: 0, ringsShown: 0, lidWas: 0 };
      }

      // The sun: its light, its sky and the colour of the haze follow the minute of the day
      const WARM = { horizon: 0xe9c9a6, mid: 0xecd0b0, zenith: 0x8a9cc0, key: 0xffbe82 };
      const NOON = { horizon: 0xe8d4b0, mid: 0xe6d8bc, zenith: 0x7fb0d6, key: 0xfff1d8 };
      function applySun() {
        if (!G) return;
        const s = sunAt(minute), a = rad(s.altitude), b = rad(s.bearing), T = G.T;
        const dir = new T.Vector3(Math.sin(b) * Math.cos(a), Math.sin(a), -Math.cos(b) * Math.cos(a));
        const k = ssm(2, 50, s.altitude);
        G.lights.key.position.set(dir.x * 200, dir.y * 200, -24 + dir.z * 200);
        G.lights.key.target.position.set(0, 0, -24);
        G.lights.key.target.updateMatrixWorld();
        G.lights.key.color.setHex(WARM.key).lerp(new T.Color(NOON.key), k);
        G.lights.key.intensity = 0.62 + 0.62 * k;
        G.lights.hemi.intensity = 0.34 + 0.16 * k;
        const u = G.sky.uniforms;
        u.uSun.value.copy(dir);
        u.uHorizon.value.setHex(WARM.horizon).lerp(new T.Color(NOON.horizon), k);
        u.uMid.value.setHex(WARM.mid).lerp(new T.Color(NOON.mid), k);
        u.uZenith.value.setHex(WARM.zenith).lerp(new T.Color(NOON.zenith), k);
        G.scene.fog.color.copy(G.skyFog(u.uHorizon.value.getHex()));
        if (G.post) {
          const pp = G.post.params;
          pp.gain = [1.05 - 0.035 * k, 1.0, 0.93 + 0.05 * k];   // gold in the morning and evening, clean at noon
          pp.haze = 0.25 + 0.75 * k;                              // the air trembles over the sand as the day heats
          pp.bloom = 0.55 - 0.1 * k;
        }
        const tip = shadowTip(minute);
        G.tipGroup.position.set(tip.x, 0, -tip.y);
        G.lastSun = minute;
      }

      // ---- Hermes on the Ridge: he walks to the tip of the shadow, and back ----
      const timers = [];
      const later = (sec, fn) => { timers.push({ t: sec, fn }); };
      function snapHermes(x, z, toward) {
        if (!G || !G.hermes) return;
        G.hermes.position.set(x, 0, z);
        if (toward) G.hermes.rotation.y = faceYaw(x, z, toward.x, toward.z);
        walk = null;
      }
      function goTo(x, z, then, opts) {
        const h = G && G.hermes;
        if (!h || reduced()) { snapHermes(x, z, opts && opts.face); if (then) then(); return; }
        const fx = h.position.x, fz = h.position.z, d = Math.hypot(x - fx, z - fz);
        if (d < 0.05) { if (then) then(); return; }
        const dirx = (x - fx) / d, dirz = (z - fz) / d;
        const face = opts && opts.face ? faceYaw(x, z, opts.face.x, opts.face.z) : faceYaw(fx, fz, x, z);
        walk = { t: 0, dur: Math.max(1.1, Math.min(3.4, d / 11)), fx, fz, tx: x, tz: z, ry0: h.rotation.y, ry1: faceYaw(fx, fz, x, z), face, dir: { x: dirx, z: dirz }, then: then || null, turned: false };
      }
      function finishWalk() {
        if (!walk) return;
        const w = walk; walk = null;
        if (G && G.hermes) { G.hermes.position.set(w.tx, 0, w.tz); G.hermes.rotation.y = w.face; }
        if (w.then) w.then();
      }
      const goHome = (then) => goTo(BASE.x, BASE.z, then, { face: CAIRN });

      // ---- The camera ----
      const orbit = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, down: false, x: 0, y: 0 };
      function bindOrbit() {
        const c = el.canvas;
        if (!c || c.__monOrbit) return;
        c.__monOrbit = true;
        c.style.touchAction = 'none';
        c.addEventListener('pointerdown', (e) => { orbit.down = true; orbit.x = e.clientX; orbit.y = e.clientY; try { c.setPointerCapture(e.pointerId); } catch (err) {} });
        c.addEventListener('pointermove', (e) => {
          if (!orbit.down) return;
          orbit.tYaw -= (e.clientX - orbit.x) * 0.006;
          orbit.tPitch = Math.max(-0.5, Math.min(0.7, orbit.tPitch + (e.clientY - orbit.y) * 0.004));
          orbit.x = e.clientX; orbit.y = e.clientY;
        });
        const up = () => { orbit.down = false; };
        c.addEventListener('pointerup', up);
        c.addEventListener('pointercancel', up);
        c.addEventListener('dblclick', () => { orbit.tYaw = 0; orbit.tPitch = 0; });
      }
      const camNow = { p: null, l: null };
      function placeCamera(dt, snap) {
        const cam = G.camera, ph = phase(), T = G.T;
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else if (walk && G.hermes) {
          const hx = G.hermes.position.x, hz = G.hermes.position.z;
          p = [hx - walk.dir.x * 8 - walk.dir.z * 1.5, 3.8, hz - walk.dir.z * 8 + walk.dir.x * 1.5];
          l = [hx + walk.dir.x * 10, 1.6, hz + walk.dir.z * 10];
        } else if (ph === 'sigil') { p = [11, 4.8, 16]; l = [1.8, 3.6, 3.2]; }
        else if (ph === 'done') { p = [12, 6.5, 18]; l = [3, 2.2, 2]; }
        else {
          const base = new T.Vector3(0, 27, 42), look = new T.Vector3(0, 9, -21);
          const off = base.clone().sub(look), rad2 = off.length();
          const hor = Math.hypot(off.x, off.z), el0 = Math.atan2(off.y, hor), az0 = Math.atan2(off.x, off.z);
          const elv = Math.max(0.12, Math.min(1.25, el0 + orbit.pitch)), az = az0 + orbit.yaw;
          p = [look.x + Math.sin(az) * rad2 * Math.cos(elv), look.y + rad2 * Math.sin(elv), look.z + Math.cos(az) * rad2 * Math.cos(elv)];
          l = [look.x, look.y, look.z];
        }
        if (!camNow.p || snap) { camNow.p = p.slice(); camNow.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * 3.2);
          for (let i = 0; i < 3; i++) { camNow.p[i] += (p[i] - camNow.p[i]) * k; camNow.l[i] += (l[i] - camNow.l[i]) * k; }
        }
        cam.position.set(camNow.p[0], camNow.p[1], camNow.p[2]);
        cam.lookAt(camNow.l[0], camNow.l[1], camNow.l[2]);
      }
      function openingShots() {
        return [
          { from: { p: [-70, 46, 130], l: [0, 10, -10] }, to: { p: [-36, 22, 76], l: [0, 11, -12] }, dur: 6, kicker: 'STATION 14', title: 'THE RIDGE OF THE SUN', line: 'Across the Great Erg, one stone stands alone: twenty-four paces of sandstone.' },
          { from: { p: [12, 3.2, 17], l: [0, 3, 4] }, to: { p: [8, 2.6, 13], l: [3, 2, 4.5] }, dur: 5, line: 'And at its feet, Cairn II, like a sundial waiting for its hour.' },
          { from: { p: [9, 1.6, 11], l: [0, 3, 1] }, to: { p: [7, 1.6, 10], l: [0, 21, -1] }, dur: 5, line: 'The founders locked it with the sun itself.' }
        ];
      }
      function endingShots() {
        return [
          { from: { p: [9, 3.6, 11], l: [CAIRN.x, 1.4, CAIRN.z] }, to: { p: [8.4, 3.0, 9.4], l: [CAIRN.x, 1.5, CAIRN.z] }, dur: 5, kicker: 'CAIRN II', title: 'THE NICHE OPENS', line: 'The fourth shadow touched the Serpent, and the lid began to slide.' },
          { from: { p: [8.2, 2.4, 8.4], l: [CAIRN.x, 1.8, CAIRN.z] }, to: { p: [7.4, 2.9, 7.6], l: [CAIRN.x, 2.6, CAIRN.z] }, dur: 4, line: 'Inside, the Seal of Cairn II. The second of the five.' },
          { from: { p: [8, 9, 14], l: [CAIRN.x, 2, CAIRN.z] }, to: { p: [0, 46, 56], l: [0, 2, -20] }, dur: 5, line: 'And across the ridge, the whole day lies written in shadow.' }
        ];
      }

      // ---- The frame: the sun, the tip of the shadow, the marks, the lid and Hermes ----
      function tick(now, dt) {
        if (!G) return;
        const t = now / 1000;
        for (let i = timers.length - 1; i >= 0; i--) { timers[i].t -= dt; if (timers[i].t <= 0) { const f = timers.splice(i, 1)[0].fn; f(); } }
        if (walk && G.hermes) {
          walk.t += dt;
          const u = Math.min(1, walk.t / walk.dur), e = u * u * (3 - 2 * u);
          G.hermes.position.x = walk.fx + (walk.tx - walk.fx) * e;
          G.hermes.position.z = walk.fz + (walk.tz - walk.fz) * e;
          const turn = Math.min(1, walk.t / 0.35);
          let dy = walk.ry1 - walk.ry0; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
          G.hermes.rotation.y = u >= 1 ? walk.face : walk.ry0 + dy * turn;
          if (!G.gait && G.H) { const swing = Math.sin(t * 9.5); G.H.legL.position.z = swing * 0.17; G.H.legR.position.z = -swing * 0.17; G.H.legL.position.y = Math.max(0, swing) * 0.05; G.H.legR.position.y = Math.max(0, -swing) * 0.05; }
          if (u >= 1) finishWalk();
        } else if (G.H && !G.gait) {
          G.H.legL.position.z = 0; G.H.legR.position.z = 0; G.H.legL.position.y = 0; G.H.legR.position.y = 0;
        }
        if (G.gait) {
          // he watches what matters: the tip of the shadow while the sun walks, the cairn when it opens
          const ph0 = phase();
          G.gait.look(walk ? null : ph0 === 'sun' ? G.tipGroup.position : ph0 === 'sigil' ? { x: 0, y: 6, z: 0 } : { x: CAIRN.x, y: 1.8, z: CAIRN.z });
          G.gait.update(dt);
        }
        if (G.lastSun !== minute) applySun();
        const found = marksFound(), near = phase() === 'sun' ? markUnderShadow(minute) : null, pulse = reduced() ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4);
        G.marks.forEach((mk) => {
          const idx = MARKS.indexOf(mk.m), awake = idx >= 0 && idx < found, isNear = !!near && near.id === mk.m.id && !awake;
          mk.faceMat.emissiveIntensity = awake ? 0.5 + 0.12 * pulse : isNear ? 0.18 + 0.22 * pulse : 0;
          mk.halo.material.opacity = awake ? 0.55 : isNear ? 0.22 + 0.2 * pulse : 0;
        });
        G.tipGroup.visible = phase() === 'sun' || phase() === 'lost';
        G.tipRing.scale.setScalar(near ? Math.max(1, near.radius / 1.5) * (0.96 + 0.06 * pulse) : 1 + 0.06 * pulse);
        G.tipRing.material.color.setHex(near ? 0xfff0a8 : 0xffd27a);
        G.tipBeam.material.opacity = 0.2 + 0.2 * pulse;
        // the seven rings light one by one when the sigil is spoken
        const awake = isAwake();
        const nRings = !awake ? 0 : view.ringsT0 ? Math.min(7, Math.floor((now - view.ringsT0) / 450) + 1) : 7;
        G.slabs.forEach((s, i) => {
          s.visible = i < nRings;
          const fresh = view.ringsT0 ? Math.max(0, 1 - (now - view.ringsT0 - i * 450) / 1400) : 0;
          s.userData.mat.emissiveIntensity = i < nRings ? 0.28 + 0.6 * Math.max(0, Math.min(1, fresh)) : 0;
        });
        if (view.ringsT0 && now - view.ringsT0 > 7 * 450 + 1500) view.ringsT0 = 0;
        if (view.ringsT0 && nRings > G.ringsShown && G.dust) {
          for (let i = Math.max(0, G.ringsShown); i < Math.min(nRings, G.slabs.length); i++) {
            const sp = G.slabs[i].position;
            G.dust.emit({ x: sp.x, y: 0.2, z: sp.z }, 14, { size: [0.8, 1.4], speed: [0.8, 2.0], up: [0.4, 1.2], life: [0.9, 1.6], alpha: 0.35, spread: 2.4 });
            G.sparks.emit({ x: sp.x, y: 0.4, z: sp.z }, 18, { color: 0xffcf7a, size: [0.2, 0.35], grow: 0.3, speed: [0.3, 1.2], up: [1.5, 3.5], life: [0.7, 1.3], alpha: 0.9, gravity: -2.5, drag: 0.6, spread: 2 });
          }
          if (G.shake) G.shake.add(0.12);
        }
        G.ringsShown = Math.max(0, nRings);
        // the lid slides, the Seal rises (only in the ending; a finished station shows its niche open)
        let lidK = view.ending ? 0 : (isDone() ? 1 : 0), sealK = 0;
        if (view.ending && view.lidT0) lidK = Math.max(0, Math.min(1, (now - view.lidT0) / 3600));
        if (view.ending && view.sealT0) sealK = Math.max(0, Math.min(1, (now - view.sealT0) / 3200));
        G.lid.position.x = lidK * 1.7; G.lid.position.y = 1.62 + Math.sin(lidK * Math.PI) * 0.18;
        if (G.dust && lidK > G.lidWas && lidK < 1) {
          // stone on stone: grit spills from the edge of the lid and the ground hums
          if (Math.random() < 0.6) G.dust.emit({ x: CAIRN.x + 0.9 + lidK * 1.7, y: 1.6, z: CAIRN.z + (Math.random() - 0.5) * 1.2 }, 2, { size: [0.25, 0.5], speed: [0.1, 0.4], up: [0, 0.3], life: [0.8, 1.4], alpha: 0.45, gravity: -4, drag: 0.4, bounce: 0.2, color: 0xc9a274 });
          if (G.shake) G.shake.add(dt * 0.35);
        }
        G.lidWas = lidK;
        G.nicheMat.opacity = lidK * 0.8;
        G.seal.visible = sealK > 0 && sealK < 1.01 && !view.sealGone;
        G.seal.position.y = 1.6 + sealK * 1.5; G.seal.rotation.y = t * 2.4;
        G.sealHalo.material.opacity = G.seal.visible ? Math.min(1, sealK * 1.4) * 0.8 : 0;
        G.sealHalo.position.y = G.seal.position.y + 0.1;
        if (G.sparks && G.seal.visible && Math.random() < 0.5) G.sparks.emit({ x: CAIRN.x, y: G.seal.position.y, z: CAIRN.z }, 1, { color: 0xffe08a, size: [0.12, 0.22], grow: 0.2, speed: [0.1, 0.4], up: [0.2, 0.8], life: [0.8, 1.4], alpha: 0.9, gravity: 0.15, drag: 0.5, spread: 0.9 });
        // a little sand always moves on the wind
        if (G.dust) {
          G.windT -= dt;
          if (G.windT <= 0 && camNow.l) {
            G.windT = 0.11;
            G.dust.emit({ x: camNow.l[0] + (Math.random() - 0.5) * 60, y: 0.15, z: camNow.l[2] + (Math.random() - 0.5) * 46 }, 1, { size: [1.4, 2.6], grow: 1.5, speed: [0.1, 0.3], up: [0.05, 0.25], life: [2.6, 4.2], alpha: 0.1, gravity: 0, drag: 0.25, fadeIn: 0.35 });
          }
          G.dust.update(dt, G.camera, G.renderer);
          G.sparks.update(dt, G.camera, G.renderer);
        }
        if (G.prints) G.prints.update(dt);
        placeCamera(dt, false);
        if (G.shake) G.shake.apply(G.camera, dt);
        if (G.adapt) G.adapt(dt); else if (P.fitSpeed) G.adapt = P.fitSpeed(G.renderer);
        if (G.post) { G.post.horizonFrom(G.camera); G.post.render(G.scene, G.camera, dt); }
        else G.renderer.render(G.scene, G.camera);
      }
      function frame(t) {
        if (!G || modal.style.display === 'none') return;
        if (window.__filmMode) return;
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

      // ---- Part I: the sigil from Sheet 13B ----
      function speakSigil() {
        if (isAwake() || (cine && cine.active)) return;
        const typed = (el.keyInput ? el.keyInput.value : '').normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase();
        if (!typed) { feedback(el.keyFeedback, 'Type the seven letters from the page “The Sun Monolith & Cairn II”.', 'error'); return; }
        if (typed !== SIGIL) {
          const fails = (parseInt(get(KEYS.fails) || '0', 10) || 0) + 1;
          set(KEYS.fails, String(fails));
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.keyFeedback, 'The Monolith stays silent. Check the seven noons on the page “The Sun Monolith & Cairn II”.', 'error');
          sigilHints.fail();
          return;
        }
        set(KEYS.awake, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
        feedback(el.keyFeedback, 'SUNDIAL. The rings of Cairn II light up one by one.', 'ok');
        view.ringsT0 = (window.__vclock || performance.now()) + 1;
        say("The rings are glowing, Silvia! And under Cairn II there is an inscription I can finally read. It names four moments of the day. Move the sun: when the Monolith's shadow touches the right mark, tell me to mark it. The inscription lists them in order.");
        subtitle('The seven rings wake', 4);
        paintChrome();
      }

      // ---- Part II: the walking sun ----
      function strike(touched, base) {
        S.hearts = Math.max(0, S.hearts - 1);
        S.wrong += 1;
        if (G) {
          if (G.shake) G.shake.add(S.hearts <= 0 ? 0.8 : 0.5);
          if (G.post) G.post.flash(0x3d1206, S.hearts <= 0 ? 0.42 : 0.26, S.hearts <= 0 ? 1.6 : 0.9);
          if (G.dust) G.dust.emit({ x: touched.x, y: 0.3, z: -touched.y }, 26, { size: [0.9, 1.6], speed: [1, 2.6], up: [0.6, 1.6], life: [1, 1.8], alpha: 0.4, spread: touched.radius || 2, color: 0xb98e5e });
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        let note = base;
        if (S.hearts <= 0) {
          S.lost = true;
          set(KEYS.marks, '0');
          note = 'The sun is going down on us, Silvia, and the last of my strength with it. Every mark has gone back to sleep. Let me rest until sunrise and we will walk the sun again.';
          subtitle('The sun sets', 4);
          minute = LAST_MINUTE;
          set(KEYS.minute, String(minute));
        } else if (S.hearts === 1) {
          note += ' One heart left, Silvia. One more and the sun sets.';
        }
        saveWalk();
        say(note);
        paintChrome();
      }
      function markShadow() {
        if (phase() !== 'sun' || busy || (cine && cine.active)) return;
        const found = marksFound();
        const touched = markUnderShadow(minute);
        if (!touched) {
          feedback(el.markFeedback, 'Only sand lies under the tip of the shadow.', 'error');
          return;
        }
        busy = true;
        paintChrome();
        goTo(touched.x, -touched.y, () => resolveMark(touched, found), { face: { x: 0, z: 0 } });
      }
      function resolveMark(touched, found) {
        const back = () => {
          if (phase() === 'done') { busy = false; paintChrome(); return; }
          later(0.9, () => goHome(() => { busy = false; paintChrome(); }));
        };
        if (TRAPS.indexOf(touched) >= 0) {
          shadowHints.fail();
          if (found > 0) {
            set(KEYS.marks, '0');
            feedback(el.markFeedback, 'The inscription never names ' + touched.name + '. The awakened marks sink back to sleep: begin again with the morning shadow.', 'error');
            strike(touched, "The glow went out, Silvia, all of it. The stone wants the inscription's moments and nothing else. Start again from the morning.");
          } else {
            feedback(el.markFeedback, 'The inscription never names ' + touched.name + '. The stone stays asleep.', 'error');
            strike(touched, 'The stone stayed dark. That mark is not one the founders named, Silvia. Read the inscription again.');
          }
          back();
          return;
        }
        const idx = MARKS.indexOf(touched);
        if (idx >= 0 && idx < found) {
          feedback(el.markFeedback, touched.name.charAt(0).toUpperCase() + touched.name.slice(1) + ' is already awake.', '');
          back();
          return;
        }
        if (idx !== found) {
          feedback(el.markFeedback, 'The stone stays silent. The inscription names another moment first.', 'error');
          shadowHints.fail();
          strike(touched, 'The stone did not answer. That mark is true, but not yet: the inscription names another moment first.');
          back();
          return;
        }
        set(KEYS.marks, String(found + 1));
        if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        if (G && G.sparks) {
          G.sparks.emit({ x: touched.x, y: 0.5, z: -touched.y }, 70, { color: 0xffd27a, size: [0.18, 0.34], grow: 0.4, speed: [0.5, 2.4], up: [2.2, 5.2], life: [0.9, 1.9], alpha: 0.95, gravity: -3.2, drag: 0.7, bounce: 0.45, spread: touched.radius || 2 });
          if (G.post) G.post.pulse(0.7, 1.4);
          if (G.shake) G.shake.add(0.16);
        }
        feedback(el.markFeedback, touched.name.charAt(0).toUpperCase() + touched.name.slice(1) + ' answers.', 'ok');
        say(MARK_DISPATCH[found]);
        if (found + 1 === MARKS.length) completeStation();
        else { paintChrome(); back(); }
      }

      function completeStation() {
        set(KEYS.done, 'true');
        if (G && G.post) { G.post.flash(0xfff3d0, 0.32, 1.4); G.post.pulse(1.0, 2.2); }
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.grantCairnSeal === 'function') window.grantCairnSeal(2);
        else set('order_seal_cairn_2', 'true');
        // The Ibis slab only looked like a trap: if the stone keepers of Tower II asked for an ibis, it was a lock, and here is the key
        if (road().statues && typeof window.addRelicToInventory === 'function') {
          window.addRelicToInventory('ibis_figure');
          setTimeout(() => { if (typeof window.openItemAcquiredModal === 'function') window.openItemAcquiredModal({ id: 'ibis_figure' }); }, 4200);
        }
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        saveWalk();
        const after = () => { busy = false; applyVictory(); paintChrome(); showReward(); };
        if (G && cine && !reduced() && get(CINE_OUTRO) !== 'seen') {
          set(CINE_OUTRO, 'seen');
          busy = true;
          view.lidT0 = 0; view.sealT0 = 0; view.sealGone = false; view.ending = true;
          cine.start(endingShots(), () => { view.sealGone = true; view.ending = false; after(); }, { fade: true });
        } else { view.sealGone = true; after(); }
        paintChrome();
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = 'The Seal of Cairn II was resting inside, and two lines are carved into the lid. But Silvia, someone tried to open this before us: the rim is scarred by iron bars and grey ash. They knew the seals existed, and the stone refused them.';
        }
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
      }
      function beginAgain() {
        if (!S) return;
        S = { hearts: HEARTS, tries: S.tries + 1, wrong: S.wrong, lost: false };
        set(KEYS.marks, '0');
        minute = FIRST_MINUTE;
        set(KEYS.minute, String(minute));
        busy = false;
        walk = null;
        hideReward(true);
        saveWalk();
        snapHermes(BASE.x, BASE.z, CAIRN);
        say('A new day, Silvia. Sunrise number ' + S.tries + ' on the Ridge, and the marks are asleep again. Read the inscription once more and walk the sun in order.');
        feedback(el.markFeedback, '', '');
        paintChrome();
      }

      // ---- The reward: a central card, as on the Salt, the Lexicon and the Wells ----
      const reward = { box: null, back: null };
      const rewardOpen = () => !!reward.box && !reward.box.hidden;
      function showReward() {
        const body = modal.querySelector('.chasm3d-body');
        if (!body || !isDone()) return;
        if (!reward.box) {
          reward.box = document.createElement('div');
          reward.box.className = 'chasm3d-reward mon3d-reward';
          reward.box.setAttribute('role', 'dialog');
          reward.box.setAttribute('aria-label', 'Your reward for the Sun Monolith');
          reward.box.hidden = true;
          body.appendChild(reward.box);
          reward.box.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('button'))) reward.box.classList.add('is-fast'); });
        }
        const w = S || freshWalk();
        const rows = MARKS.map((m, i) => '<li class="clep-line" style="--t:' + (0.5 + i * 0.25).toFixed(2) + 's"><b>' + m.icon + ' ' + m.name.replace('the ', '') + '</b><span>' + fmt(m.minute) + '</span></li>').join('');
        const lucid = (w.wrong | 0) === 0;
        reward.box.onclick = (e) => {
          const med = e.target.closest && e.target.closest('.clep-medal[data-relic]');
          if (med && typeof window.openItemAcquiredModal === 'function') window.openItemAcquiredModal({ id: med.getAttribute('data-relic') });
        };
        reward.box.innerHTML = '<div class="rw-rays" aria-hidden="true"></div>'
          + '<div class="rw-sparks" aria-hidden="true">' + Array.from({ length: 18 }, (_, i) => '<i style="--a:' + ((i * 360 / 18) | 0) + 'deg;--d:' + (120 + (i % 5) * 36) + 'px;--t:' + (0.9 + (i % 4) * 0.2).toFixed(2) + 's"></i>').join('') + '</div>'
          + '<div class="chasm3d-reward-card">'
          + '<div class="chasm3d-reward-kicker">Station 14 · The Sun Monolith &amp; Cairn II</div>'
          + '<h3 class="chasm3d-reward-title">The Second Seal</h3>'
          + '<p class="rw-sub">The sun walked its day across the ridge, and four shadows woke four marks. The lid of Cairn II slid back.</p>'
          + '<div class="rw-grid">'
          + '<section class="rw-map clep-rw-page" aria-label="The four shadows of the inscription">'
          + '<div class="rw-label">The four shadows</div>'
          + '<ol class="clep-registry">' + rows + '</ol>'
          + '<ul class="mon3d-rw-frags">' + FRAGMENTS.map((f) => '<li>“' + f + '”</li>').join('') + '</ul>'
          + ((w.tries | 1) > 1 ? '<div class="chasm3d-reward-stats"><div><b>' + (w.tries | 1) + '</b><span>sunrises</span></div></div>' : '')
          + (lucid && (w.tries | 1) === 1 ? '<div class="rw-flawless">✦ A clear day ✦</div>' : '')
          + '</section>'
          + '<section class="rw-loot">'
          + '<svg class="mon3d-seal" viewBox="0 0 80 80" aria-label="The Seal of Cairn II"><circle cx="40" cy="40" r="34" fill="#e8bf63" stroke="#7c5a32" stroke-width="3"/><circle cx="40" cy="40" r="26" fill="none" stroke="#7c5a32" stroke-width="2" stroke-dasharray="3 3"/><path d="M40 16v10M40 54v10M16 40h10M54 40h10M23 23l7 7M50 50l7 7M57 23l-7 7M30 50l-7 7" stroke="#7c5a32" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="40" r="9" fill="#7c5a32"/></svg>'
          + '<div class="mon3d-rw-eqs">'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Cut inside the lid</div><div class="rw-ledger-title">The Line of the Noon</div><div class="rw-eq" aria-label="D plus F equals 24"><i>D</i><u>+</u><i>F</i><u>=</u><b>24</b></div><p>A line for your Cipher Ledger. Two new letters to find.</p></div></div>'
          + '<div class="rw-ledger"><div class="rw-ledger-text"><div class="rw-ledger-kicker">Cut beneath it</div><div class="rw-ledger-title">The Line of the Shadow</div><div class="rw-eq" aria-label="C minus T equals 8"><i>C</i><u>−</u><i>T</i><u>=</u><b>8</b></div><p>The second line. Record both in your Ledger.</p></div></div>'
          + '</div>'
          + (road().statues ? '<div class="clep-relics"><button type="button" class="clep-medal" data-relic="ibis_figure" aria-label="The Ibis Figure: open the card"><img src="./assets/items/item_ibis_figure.png" alt="" loading="lazy"><span>Ibis Figure</span></button></div>' : '')
          + '<div class="rw-next">Next · down to the Sandstone Labyrinth</div>'
          + '</section></div>'
          + '<div class="chasm3d-reward-actions">'
          + '<button type="button" class="chasm3d-reward-wire">📻 Hermes is calling on the Field Wire</button>'
          + '<button type="button" class="chasm3d-btn chasm3d-reward-stay">Stay on the Ridge</button>'
          + '</div></div>';
        if (!rewardOpen()) reward.back = document.activeElement;
        reward.box.hidden = false;
        reward.box.classList.remove('is-fast', 'is-on');
        void reward.box.offsetWidth;
        reward.box.classList.add('is-on');
        const wireBtn = reward.box.querySelector('.chasm3d-reward-wire'), stayBtn = reward.box.querySelector('.chasm3d-reward-stay');
        if (wireBtn) wireBtn.addEventListener('click', () => { hideReward(true); finishAndLeave(); });
        if (stayBtn) stayBtn.addEventListener('click', () => hideReward());
        if (wireBtn) wireBtn.focus({ preventScroll: true });
      }
      function hideReward(quietly) {
        if (!rewardOpen()) return;
        reward.box.hidden = true;
        const back = reward.back; reward.back = null;
        if (quietly) return;
        if (back && document.contains(back) && back.focus) back.focus({ preventScroll: true });
      }
      function finishAndLeave() {
        closeSunMonolithModal();
        if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.showDesertToast === 'function') {
          let seals = 0;
          for (let i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) === 'true') seals++;
          window.showDesertToast('✦ Seal of Cairn II secured (' + seals + ' of 5) ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
        }
      }

      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('mon3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('mon3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-monolith-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
      }
      function hideHowto() { if (el.howto) el.howto.hidden = true; set(HOWTO_KEY, 'seen'); }

      // ---- The sky in the corner is dragged with the pointer ----
      let dragging = false;
      function minuteFromPointer(evt) {
        const ctm = el.sky.getScreenCTM();
        if (!ctm) return minute;
        const pt = el.sky.createSVGPoint();
        pt.x = evt.clientX; pt.y = evt.clientY;
        const x = pt.matrixTransform(ctm.inverse()).x;
        return (6 + (190 - x) / 180 * 12) * 60;
      }
      if (el.sky) {
        el.sky.addEventListener('pointerdown', (e) => {
          if (phase() !== 'sun' || busy) return;
          dragging = true;
          try { el.sky.setPointerCapture(e.pointerId); } catch (err) {}
          setMinute(minuteFromPointer(e), false);
        });
        el.sky.addEventListener('pointermove', (e) => { if (dragging) setMinute(minuteFromPointer(e), false); });
        const stop = () => { if (dragging) { dragging = false; set(KEYS.minute, String(minute)); } };
        el.sky.addEventListener('pointerup', stop);
        el.sky.addEventListener('pointercancel', stop);
      }
      if (el.slider) el.slider.addEventListener('input', () => setMinute(parseInt(el.slider.value, 10), true));
      if (el.earlier) el.earlier.addEventListener('click', () => setMinute(minute - 5, true));
      if (el.later) el.later.addEventListener('click', () => setMinute(minute + 5, true));
      if (el.mark) el.mark.addEventListener('click', markShadow);
      if (el.speak) el.speak.addEventListener('click', speakSigil);
      if (el.keyInput) el.keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') speakSigil(); });
      if (el.again) el.again.addEventListener('click', beginAgain);
      if (el.finish) el.finish.addEventListener('click', finishAndLeave);
      if (el.rewardBtn) el.rewardBtn.addEventListener('click', showReward);
      if (el.replay) el.replay.addEventListener('click', () => { minute = FIRST_MINUTE; set(KEYS.minute, String(minute)); say('Watch the day go by, Silvia. The Seal stays safe in my satchel.'); paintChrome(); });
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-monolith-howto-back'), hn = $('btn-monolith-howto-next'), hs = $('btn-monolith-howto-skip');
      if (hb) hb.addEventListener('click', () => { if (howtoPage === 0) hideHowto(); else showHowto(howtoPage - 1); });
      if (hn) hn.addEventListener('click', () => { if (howtoPage >= 3) hideHowto(); else showHowto(howtoPage + 1); });
      if (hs) hs.addEventListener('click', hideHowto);

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (isTester()) return true;
        if (get('order_oasis_clepsydra_completed') !== 'true') return false;
        return typeof window.isMonolithMarchOver === 'function' ? window.isMonolithMarchOver() : false;
      }
      // The road's gifts, in Hermes's voice. The red cord is a measuring line: twelve knots, one staff-length each,
      // and the Monolith is twelve staffs tall, so it opens the first note of the sigil.
      function arrivalNote() {
        const f = road(), out = [];
        if (f.blessing) {
          out.push("I tied the Servant's red cord to my staff: twelve knots, one staff-length each. Whatever shadow the Monolith throws, I can measure it in staffs.");
          if (window.EclipseHints && window.EclipseHints.grant) window.EclipseHints.grant('s14-sigil', 1);
        }
        if (f.nightLost) out.push('And I am sorry about last night. I arrived with half a skin of water, so let us not waste the sun.');
        if (f.nightOil === 'all') out.push('My lantern is dry, but I do not regret it.');
        return out.length ? ' ' + out.join(' ') : '';
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
        if (reward.box && !reward.box.hidden && reward.box.contains(e.target)) return;
        const panel = el.controls && el.controls.closest('.chasm3d-panel');
        if (panel && panel.contains(e.target) && panel.scrollHeight > panel.clientHeight + 1) return;
        e.preventDefault();
      }
      function introLine() {
        if (isDone()) return 'Cairn II is open, Silvia, and the Seal is in my satchel. The sun is yours to walk again if you want to watch the day go by.';
        if (S && S.lost) return 'The sun went down on us. When you are ready, we begin a new day.';
        if (!isAwake()) return 'Silvia, I made it to the Ridge of the Sun. The Monolith is taller than I imagined, and Cairn II sits at its feet like a sundial waiting for its hour. The stone tablet is cold, and it wants seven letters from your page “The Sun Monolith & Cairn II”: the sigil of the seven noons.' + arrivalNote();
        return 'The rings are still glowing. Move the sun, Silvia, and let the shadow touch the marks the inscription names, in order.';
      }
      function openSunMonolithModal() {
        if (!canOpen()) {
          if (get('order_oasis_clepsydra_completed') !== 'true') {
            toast('✦ TERRA INCOGNITA ✦ Help Hermes at the Four Wells (Station 13) before the road to the Sun Monolith opens.');
          } else if (typeof window.getMonolithMarchEta === 'function' && window.getMonolithMarchEta()) {
            toast('Hermes is crossing the Great Erg toward the Sun Monolith. Arrival in ' + window.getMonolithMarchEta() + '.');
          } else {
            toast('Hermes is still at the gates of Tower II. Open the Cliffside Workshop to hear what happened there.');
          }
          return;
        }
        // Hermes tells Silvia about the night on the Erg before the stone: once, on arrival
        if (!isDone() && typeof window.needsNightErg === 'function' && window.needsNightErg() && typeof window.openNightErgModal === 'function') {
          window.openNightErgModal(openSunMonolithModal);
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        lockHubScroll(true);
        modal.addEventListener('wheel', stopHubScroll, { passive: false });
        modal.addEventListener('touchmove', stopHubScroll, { passive: false });
        returnFocusTo = document.activeElement;
        if (!G && el.canvas) G = buildWorld();
        orbit.yaw = orbit.tYaw = orbit.pitch = orbit.tPitch = 0;
        bindOrbit();
        if (G && !cine && el.stage) {
          cine = P.cinema(el.stage, {
            reduced,
            onShot: (i, sh) => {
              if (sh.line) subtitle(sh.line, sh.dur - 0.4);
              if (view.ending) { const n = window.__vclock || performance.now(); if (i === 0) view.lidT0 = n; if (i === 1) view.sealT0 = n; }
            }
          });
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        if (G && 'ResizeObserver' in window && !el.stage.__monFit) { el.stage.__monFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        S = loadWalk();
        busy = false; walk = null; timers.length = 0;
        camNow.p = null;
        if (S.lost) minute = LAST_MINUTE;
        else minute = Math.max(FIRST_MINUTE, Math.min(LAST_MINUTE, parseInt(get(KEYS.minute) || String(FIRST_MINUTE), 10) || FIRST_MINUTE));
        view.ringsT0 = 0; view.sealGone = true; view.ending = false; view.lidT0 = 0; view.sealT0 = 0;
        if (G) { applySun(); snapHermes(BASE.x, BASE.z, CAIRN); }
        if (isDone()) applyVictory();
        else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
        say(introLine());
        paintChrome();
        const finishOpen = () => {
          introPending = false;
          if (get(HOWTO_KEY) !== 'seen' && !isDone() && !(S && S.lost)) showHowto(0);
          const focusTarget = isDone() ? el.finish : isAwake() ? el.slider : el.keyInput;
          if (focusTarget) setTimeout(() => { if (modal.style.display !== 'none') focusTarget.focus({ preventScroll: true }); }, 60);
        };
        lastT = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
        if (el.close) el.close.focus({ preventScroll: true });
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          introPending = true; set(CINE_INTRO, 'seen');
          busy = true; paintChrome();
          cine.start(openingShots(), () => { busy = false; paintChrome(); finishOpen(); });
        } else finishOpen();
      }
      function closeSunMonolithModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (cine && cine.active) cine.skip();
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        hideReward(true);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openSunMonolithModal = openSunMonolithModal;
      window.closeSunMonolithModal = closeSunMonolithModal;
      if (el.close) el.close.addEventListener('click', closeSunMonolithModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeSunMonolithModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { hideHowto(); return; }
        closeSunMonolithModal();
      }, true);

      // Test hook for scripts/audit/web_smoke.py: exposes the model, never the answers' UI
      window.__sunMonolith = {
        shadowTip, marks: MARKS.map((m) => ({ id: m.id, minute: m.minute })),
        setMinute: (m) => { setMinute(m, true); return minute; },
        state: () => ({ ending: !!view.ending, lidT0: view.lidT0, sealT0: view.sealT0, phase: phase(), hearts: S ? S.hearts : HEARTS, tries: S ? S.tries : 1, wrong: S ? S.wrong : 0, found: marksFound(), minute, busy, gl: !!G, awake: isAwake(), done: isDone() }),
        settle: () => { for (let i = 0; i < 12 && (walk || timers.length || (cine && cine.active)); i++) { if (cine && cine.active) cine.skip(); finishWalk(); const ts = timers.splice(0); ts.forEach((x) => x.fn()); } return window.__sunMonolith.state(); },
        speak: (w) => { if (el.keyInput) el.keyInput.value = w; speakSigil(); return window.__sunMonolith.state(); },
        mark: () => { markShadow(); return window.__sunMonolith.state(); },
        again: () => { beginAgain(); return window.__sunMonolith.state(); },
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        gfx: () => G,
        fx: () => ({ post: !!(G && G.post), gait: !!(G && G.gait), dust: G && G.dust ? G.dust.count() : 0, sparks: G && G.sparks ? G.sparks.count() : 0, bodyY: G && G.gait ? G.gait.body.position.y : 0, legL: G && G.H ? G.H.legL.position.z : 0 }),
        frames: (n, dt) => { const d = dt || 1 / 30; for (let i = 0; i < (n || 1); i++) { if (dt) { window.__vclock = (window.__vclock || performance.now()) + d * 1000; tick(window.__vclock, d); } else tick(performance.now() + i * 33, 1 / 30); } }
      };

      drawSky();
      S = loadWalk();
      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      paintChrome();
    })();
