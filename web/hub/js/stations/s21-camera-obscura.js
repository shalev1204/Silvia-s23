
    // =========================================================================
    // STATION 21 · THE CAMERA OBSCURA (Tower III, Stage Path · node 41)
    // A dark room with a hole in one wall: the city of the third tower falls on the opposite wall, upside down.
    // Sheet 20A shows the city as it stood the day before, drawn upside down. Four things have changed since
    // (a flag, a cart, a shutter, a chimney that smokes). Silvia turns the lens ring until the picture stands
    // upright and sharp, then points at the place where the raiders hide: the house whose chimney was cold on the
    // sheet and smokes now. Only a sharp picture can be pointed at.
    // The city is drawn from web/assets/js/camera-city-data.js (scripts/journal/camera_city.py), the same
    // geometry as the sheet. Reward: Fragment II of the mirror of Tower III.
    // =========================================================================
    (function initCameraObscura() {
      const modal = document.getElementById('modal-camera-obscura');
      const CITY = window.CAMERA_CITY;
      if (!modal || !CITY) return;
      const sfx = window.sfx || null;
      const $ = (id) => document.getElementById(id);
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
      const cue = (kind, o) => { const a = window.EclipseAmbience; return !!(a && a.sfx && a.sfx(kind, o)); };
      const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const HOWTO_KEY = 'order_camera_howto', CINE_INTRO = 'order_camera_cine_intro';
      const KEYS = {
        done: 'order_camera_obscura_completed',
        fails: 'order_camera_obscura_fails',
        found: 'order_camera_obscura_found'
      };
      const NODE = 41;
      const NS = 'http://www.w3.org/2000/svg';
      const W = CITY.width, H = CITY.height;
      const SHARP_DEG = 7;          // how far from upright the picture still counts as sharp
      const START_DEG = 180;        // the wall shows the city upside down, like Sheet 20A

      // What each change is, as Silvia meets it when she points at it
      const CHANGES = {
        flag: { chip: 'A flag', text: 'A new flag flies from the clock tower: it was not on the sheet. That is one of the four changes, but nobody hides there.' },
        cart: { chip: 'A cart', text: 'A cart stands in the street that was not on the sheet: another change. But nobody hides there.' },
        shutter: { chip: 'A shutter', text: 'The shutter of that house stood open on the sheet and is closed now: another change. But nobody hides there.' },
        smoke: { chip: 'A fire', text: '' }
      };
      const CHANGE_ORDER = ['flag', 'cart', 'shutter', 'smoke'];
      const placeById = {};
      CITY.places.forEach((p) => { placeById[p.id] = p; });

      const el = {
        close: $('btn-close-camera'), speaker: $('camera-speaker'), svg: $('camera-city'), ring: $('camera-ring'), knob: $('camera-ring-knob'),
        ringHelp: $('camera-ring-help'), feedback: $('camera-feedback'), changes: $('camera-changes'), hint: $('camera-hint'),
        victory: $('camera-victory'), victoryText: $('camera-victory-text'), fragment: $('camera-fragment-svg'),
        done: $('btn-camera-finish-station'), dispatch: $('camera-dispatch-text'),
        stage: $('camera3d-stage'), stage3d: $('camera3d-canvas'), subtitle: $('camera3d-subtitle'), fade: $('camera3d-fade'),
        status: $('camera3d-status'), howto: $('camera3d-howto'), help: $('btn-camera-howto'), picture: $('camera3d-picture')
      };

      const isDone = () => get(KEYS.done) === 'true';
      const found = () => {
        let list = [];
        try { list = JSON.parse(get(KEYS.found) || '[]'); } catch (e) { list = []; }
        list = (Array.isArray(list) ? list : []).filter((c) => CHANGE_ORDER.indexOf(c) >= 0);
        if (isDone() && list.indexOf('smoke') < 0) list.push('smoke');
        return list;
      };
      const remember = (change) => {
        const list = found();
        if (list.indexOf(change) < 0) { list.push(change); set(KEYS.found, JSON.stringify(list)); }
      };
      const fails = () => parseInt(get(KEYS.fails) || '0', 10) || 0;

      // Hints climb three levels (hub/js/hint-ladder.js)
      const cityHints = window.EclipseHints.define({
        id: 's21-city', station: 'Station 21', title: 'the city on the wall', group: 'stage',
        anchor: el.feedback, solved: isDone,
        texts: [
          'Four things changed since the page “The Camera Obscura” was drawn, Silvia: something in the sky, something in the street, a shutter, and something on a roof. Which of the four is a fire?',
          'On the page “The Camera Obscura” two chimneys smoke. Turn the ring until the wall stands upright and count the smoking chimneys there: there are three. One of them is new.',
          'Let us look together. Start at the market and look up, past the awnings, at the narrow house behind them. Now find that house on the sheet, upside down: is its chimney smoking there?'
        ]
      });

      // ---- the city on the wall ----
      let angle = START_DEG;
      let drawn = false;
      const mk = (tag, attrs, parent) => {
        const n = document.createElementNS(NS, tag);
        Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
        if (parent) parent.appendChild(n);
        return n;
      };
      const pathOf = (pts, closed) => pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') + (closed ? ' Z' : '');
      function drawCity() {
        if (drawn || !el.svg) return;
        drawn = true;
        mk('rect', { x: -40, y: 0, width: W + 80, height: H, class: 'camera-wall-bg' }, el.svg);   // the wall is a little wider than the picture
        const turn = mk('g', { id: 'camera-turn' }, el.svg);
        const scene = mk('g', { class: 'camera-scene' }, turn);
        mk('rect', { x: 0, y: 0, width: W, height: H, class: 'camera-sky' }, scene);
        CITY.items.filter((it) => !it.o || it.o === 'now').forEach((it) => {
          mk('path', { d: pathOf(it.pts, it.c), class: 'camera-line' + (it.c && it.f === 1 ? ' is-wall' : '') + (it.c && it.f === 2 ? ' is-roof' : '') }, scene);
        });
        CITY.smoke.filter((s) => !s.o || s.o === 'now').forEach((s, i) => {
          for (let k = 0; k < 3; k++) {
            const puff = mk('circle', { cx: s.x + (k % 2 ? 6 : -4), cy: s.y - 8 - k * 15, r: 5 + k * 2.4, class: 'camera-smoke' }, scene);
            puff.style.animationDelay = (-(i * 1.3 + k * 1.1)) + 's';
          }
        });
        const spots = mk('g', { class: 'camera-spots' }, scene);
        const area = (p) => (p.box[2] - p.box[0]) * (p.box[3] - p.box[1]);
        CITY.places.slice().sort((a, b) => area(b) - area(a)).forEach((p) => {   // the small places go on top
          const b = p.box;
          const spot = mk('rect', { x: b[0], y: b[1], width: b[2] - b[0], height: b[3] - b[1], class: 'camera-spot', 'data-place': p.id,
            tabindex: '0', role: 'button', 'aria-label': 'Point at ' + p.name }, spots);
          spot.addEventListener('click', () => pick(p.id));
          spot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p.id); } });
        });
        mk('path', { d: pathOf([[-32, 8], [W + 32, 8], [W + 32, H - 8], [-32, H - 8]], true), class: 'camera-wall-edge' }, el.svg);
      }
      // The picture turns about the middle of the wall and shrinks just enough to stay whole
      const deviation = () => Math.min(angle, 360 - angle);
      const sharp = () => deviation() <= SHARP_DEG;
      function applyAngle() {
        const turn = $('camera-turn');
        const a = angle * Math.PI / 180, ca = Math.abs(Math.cos(a)), sa = Math.abs(Math.sin(a));
        const k = Math.min(1, W / (W * ca + H * sa), H / (W * sa + H * ca));
        if (turn) turn.setAttribute('transform', 'translate(' + W / 2 + ' ' + H / 2 + ') rotate(' + angle + ') scale(' + k.toFixed(4) + ') translate(' + (-W / 2) + ' ' + (-H / 2) + ')');
        if (el.svg) {
          const dev = deviation();
          el.svg.style.filter = dev <= SHARP_DEG ? 'none' : 'blur(' + (0.6 + 2.6 * Math.pow(dev / 180, 0.8)).toFixed(2) + 'px)';
          el.svg.classList.toggle('is-sharp', dev <= SHARP_DEG);
        }
        if (el.knob) {
          const r = 46, c = 56;
          el.knob.setAttribute('cx', (c + r * Math.sin(a)).toFixed(2));
          el.knob.setAttribute('cy', (c - r * Math.cos(a)).toFixed(2));
        }
        if (el.ring) {
          el.ring.setAttribute('aria-valuenow', String(Math.round(angle) % 360));
          el.ring.setAttribute('aria-valuetext', sharp() ? 'upright and sharp' : (deviation() > 150 ? 'upside down and blurred' : 'turned ' + Math.round(angle) + ' degrees, blurred'));
        }
        if (el.ringHelp) el.ringHelp.textContent = sharp() ? 'Sharp. Point at a place in the picture.' : 'Blurred. Turn the ring until the city stands upright.';
        statusLine();
      }
      function setAngle(deg) {
        const before = sharp();
        angle = ((deg % 360) + 360) % 360;
        applyAngle();
        if (sharp() && !before && !cue('lens') && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (sharp() !== before) sceneSharp(sharp());
      }
      // Silvia's hand on the ring: a tick for every 15-degree notch it passes (higher as the picture nears upright), at most one every 80 ms
      let lastNotch = Math.floor(START_DEG / 15), lastTick = 0;
      function turnTo(deg) {
        setAngle(deg);
        const notch = Math.floor(angle / 15), t = performance.now();
        if (notch !== lastNotch && !sharp() && t - lastTick >= 80) { lastTick = t; cue('tick', { f: 3400 - 8 * deviation(), v: 0.07 }); }
        lastNotch = notch;
      }
      if (el.ring) {
        let dragging = null;
        const fromPointer = (e) => {
          const r = el.ring.getBoundingClientRect();
          return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
        };
        el.ring.addEventListener('pointerdown', (e) => {
          if (isDone()) return;
          e.preventDefault();
          dragging = e.pointerId;
          try { el.ring.setPointerCapture(e.pointerId); } catch (err) {}
          el.ring.focus();
          turnTo(fromPointer(e));
        });
        el.ring.addEventListener('pointermove', (e) => { if (dragging === e.pointerId) turnTo(fromPointer(e)); });
        const end = (e) => { if (dragging === e.pointerId) dragging = null; };
        el.ring.addEventListener('pointerup', end);
        el.ring.addEventListener('pointercancel', end);
        // The keyboard turns it too: arrows by 5 degrees (Shift: 1), Page Up and Down by 45, Home upright, End upside down
        el.ring.addEventListener('keydown', (e) => {
          if (isDone()) return;
          const step = e.shiftKey ? 1 : 5;
          const moves = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: 45, PageDown: -45 };
          if (moves[e.key] !== undefined) { e.preventDefault(); turnTo(angle + moves[e.key]); }
          else if (e.key === 'Home') { e.preventDefault(); turnTo(0); }
          else if (e.key === 'End') { e.preventDefault(); turnTo(180); }
        });
      }

      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
      function subtitle(text, secs, kind) {
        if (!el.subtitle) return;
        el.subtitle.textContent = text;
        el.subtitle.classList.toggle('is-act', kind === 'act');
        el.subtitle.classList.add('is-on');
        clearTimeout(subtitle.t);
        subtitle.t = setTimeout(() => el.subtitle.classList.remove('is-on'), (secs || 4.5) * 1000);
      }
      function statusLine() {
        if (el.status) el.status.textContent = isDone() ? '✦ The hideout is found · Fragment II' : (sharp() ? 'Upright and sharp' : 'Upside down · blurred') + ' · ' + found().length + ' of 4 changes';
      }
      function feedback(text, kind) {
        if (!el.feedback) return;
        el.feedback.textContent = text;
        el.feedback.classList.toggle('is-error', kind === 'error');
        el.feedback.classList.toggle('is-ok', kind === 'ok');
      }

      // ---- pointing ----
      function pick(id) {
        if (isDone()) return;
        const place = placeById[id];
        if (!place) return;
        if (!sharp()) {
          cue('wrong');
          scenePick(id, 'blur');
          feedback('The picture is still blurred. Turn the ring until the city stands upright and sharp, then point.', 'error');
          return;
        }
        if (id === CITY.target) { completeStation(); return; }
        // a change not seen before rings softly, a step higher with each one; anything else is a gentle no
        const fresh = place.change && place.change !== 'smoke' && found().indexOf(place.change) < 0;
        if (!(fresh ? cue('bell', { f: 659.25 * Math.pow(2, 2 * found().length / 12), v: 0.07, len: 1.8 }) : cue('wrong')) && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        scenePick(id, place.change && place.change !== 'smoke' ? 'change' : 'same');
        if (place.change && place.change !== 'smoke') {
          remember(place.change);
          feedback(CHANGES[place.change].text, 'error');
        } else {
          feedback('Look at ' + place.name + ' on the page “The Camera Obscura”, upside down: it is exactly as it was. The raiders are not there.', 'error');
        }
        set(KEYS.fails, String(fails() + 1));
        cityHints.fail();
        render();
      }

      function completeStation() {
        remember('smoke');
        set(KEYS.done, 'true');
        sceneFound();
        cue('flame', { dur: 1.4 });   // the raiders' fire, still warm
        if (!cue('win') && sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback('The chimney of the narrow house was cold on the sheet, and it smokes now. The raiders hide there.', 'ok');
        applyVictory();
        render();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        if (modal.style.display !== 'none') {
          justSet = true;   // the mirror is refreshed once the modal closes, so its flash is seen
          if (el.done) setTimeout(() => el.done.focus({ preventScroll: true }), 60);
        } else {
          showMirror();
        }
        say("The narrow house behind the market, Silvia. Cold yesterday, smoking today. Aurelia laid her hand flat on the wall where its chimney was, and the whole picture trembled. The raiders were not in the house: only a fire still warm in the cellar, and on the hearth, wrapped in a sooty cloth, a piece of mirror the size of my hand. Fragment II. There is a window in it, with a candle in the window, and no window in this city has a candle like it. In the dark glass behind us a woman in a grey gown tilted her head and drew her straight line in the air.");
      }
      let justSet = false;
      function drawFragment() {
        const D = window.STAGE_MIRROR;
        if (!el.fragment || !D || el.fragment.childNodes.length) return;
        const pts = D.shards[1].points;
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        const x0 = Math.min(...xs), y0 = Math.min(...ys), s = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0);
        el.fragment.setAttribute('viewBox', (x0 - 6) + ' ' + (y0 - 6) + ' ' + (s + 12) + ' ' + (s + 12));
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') + ' Z';
        const defs = mk('defs', {}, el.fragment);
        mk('path', { d }, mk('clipPath', { id: 'camera-frag-clip' }, defs));
        const grad = mk('linearGradient', { id: 'camera-frag-glass', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
        mk('stop', { offset: '0', 'stop-color': '#4a2a18' }, grad);
        mk('stop', { offset: '0.6', 'stop-color': '#2a1430' }, grad);
        mk('stop', { offset: '1', 'stop-color': '#120a1c' }, grad);
        mk('path', { d, fill: 'url(#camera-frag-glass)' }, el.fragment);
        const lines = mk('g', { 'clip-path': 'url(#camera-frag-clip)', fill: 'none', stroke: '#f6e3b0', 'stroke-width': 2, 'stroke-linecap': 'round' }, el.fragment);
        D.facade.forEach((pl) => mk('path', { d: pl.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') }, lines));
        mk('path', { d, fill: 'none', stroke: '#f7dc8c', 'stroke-width': 3 }, el.fragment);
      }
      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = 'Silvia held the page “The Camera Obscura” against the city on the wall, turned the lens until the picture stood upright, and saw what had changed: a flag, a cart, a shutter and, above the narrow house behind the market, a chimney that smokes. Where the raiders had lit a fire, the second piece of the mirror of Tower III was waiting in the ashes.';
        }
        drawFragment();
      }

      function render() {
        const done = isDone(), list = found();
        cityHints.refresh();
        if (el.changes) {
          el.changes.textContent = '';
          CHANGE_ORDER.forEach((c) => {
            const chip = document.createElement('li');
            const has = list.indexOf(c) >= 0;
            chip.className = 'camera-change' + (has ? ' is-found' : '');
            chip.textContent = has ? '✓ ' + CHANGES[c].chip : '? A change not yet seen';
            el.changes.appendChild(chip);
          });
        }
        statusLine();
        if (el.hint) {
          const hint = !done && cityHints.level() >= 2 ? '✦ Aurelia: hold the sheet so that it matches the wall. What was cold, and is warm now?' : '';
          el.hint.style.display = hint ? '' : 'none';
          el.hint.textContent = hint;
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        if (el.ring) el.ring.setAttribute('aria-disabled', done ? 'true' : 'false');
        if (done && angle !== 0) setAngle(0);
        syncWorld();
        // the dark room has no music, but its bed follows the hunt like the others
        const amb = window.EclipseAmbience;
        if (amb && amb.intensity) amb.intensity(done ? 0.6 : 0.3 + 0.07 * list.length);
      }

      // ---- The dark room in 3D. The picture falls on the far wall (z = WALL_Z); the hole is in the wall behind the viewer ----
      const P = window.EclipsePaint, SC = window.EclipseScenery;
      const ROOM_W = 7, ROOM_H = 4.6, WALL_Z = -3.2, BACK_Z = 4.6;
      const PW = 5.2, PH = 2.6, PY = 2.55;                  // the picture on the wall: the whole viewBox (-40..1240 × 0..640)
      const HOLE = [0, 2.6, BACK_Z - 0.02];
      const GLASS = [1.85, 1.95, BACK_Z - 0.06];             // the dark glass on the back wall, where the Mirror Speaker shows
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const ease = (u) => u * u * (3 - 2 * u);
      const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
      let G = null, raf = 0, lastT = 0, cine = null, howtoPage = 0;
      const view = { snapNext: true, phase: '', sharpT: 0, pickT: 0, pickAt: null, pickKind: '', foundT: 0, endTimers: [], rect: '' };
      // where a point of the picture (viewBox units, upright) lands on the wall
      const wallPoint = (x, y) => [-PW / 2 + (x + 40) / 1280 * PW, PY + PH / 2 - y / 640 * PH, WALL_Z + 0.03];
      const placeAt = (id) => { const p = placeById[id]; return p ? wallPoint((p.box[0] + p.box[2]) / 2, (p.box[1] + p.box[3]) / 2) : [0, PY, WALL_Z]; };

      // The city as light on plaster, for the moments the camera does not look straight at the wall (the opening, the end)
      function cityCanvas() {
        const cv = document.createElement('canvas');
        cv.width = 1024; cv.height = 512;
        const g = cv.getContext('2d'), k = 1024 / 1280;
        g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 512);
        g.save(); g.scale(k, k); g.translate(40, 0);
        g.lineJoin = 'round'; g.lineCap = 'round';
        CITY.items.filter((it) => !it.o || it.o === 'now').forEach((it) => {
          g.beginPath();
          it.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
          if (it.c) {
            g.closePath();
            if (it.f) { g.fillStyle = it.f === 2 ? 'rgba(246,227,176,0.26)' : 'rgba(246,227,176,0.1)'; g.fill(); }
          }
          g.strokeStyle = 'rgba(243,226,184,0.9)'; g.lineWidth = 2.6; g.stroke();
        });
        CITY.smoke.filter((s) => !s.o || s.o === 'now').forEach((s) => {
          for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(s.x + (i % 2 ? 6 : -4), s.y - 8 - i * 15, 5 + i * 2.4, 0, Math.PI * 2); g.strokeStyle = 'rgba(243,226,184,0.6)'; g.lineWidth = 1.6; g.stroke(); }
        });
        g.restore();
        return cv;
      }

      function buildWorld() {
        const T = window.THREE;
        if (!T || !P || !SC || !el.stage3d) return null;
        let renderer;
        try { renderer = new T.WebGLRenderer({ canvas: el.stage3d, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
        const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
        renderer.outputEncoding = T.sRGBEncoding;
        if (T.ReinhardToneMapping) { renderer.toneMapping = T.ReinhardToneMapping; renderer.toneMappingExposure = 1.08; }
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        const scene = new T.Scene();
        scene.background = new T.Color(0x020103);
        scene.fog = new T.Fog(0x020103, 9, 22);
        const camera = new T.PerspectiveCamera(50, 16 / 10, 0.05, 100);
        const paint = SC.paint();
        const glowTex = P.canvasTex(64, 64, (g, w) => {
          const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
          gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, w);
        });
        const glow = (color, op) => new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op == null ? 0 : op, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        const solid = (geo, mat, x, y, z, parent) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; };

        // ---- Almost no light: a breath of blue from nowhere, and the beam from the hole ----
        const hemi = new T.HemisphereLight(0x3a3a5a, 0x0a0606, 0.08);
        scene.add(hemi);
        const beam = new T.SpotLight(0xfff0d0, 0.9, 14, 0.42, 0.55, 1.2);
        beam.position.set(HOLE[0], HOLE[1], HOLE[2] - 0.05);
        beam.target.position.set(0, PY, WALL_Z);
        beam.castShadow = true; beam.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
        beam.shadow.bias = -0.0004; beam.shadow.camera.near = 0.5; beam.shadow.camera.far = 12;
        scene.add(beam); scene.add(beam.target);

        // ---- The room: rough stone, a lime-washed far wall, a floor of worn boards ----
        const mas0 = SC.tex.masonry(21, 7, 4), mas = { map: mas0.map.clone(), bump: mas0.bump.clone() };
        [mas.map, mas.bump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2.2, 1.4); });
        const stone = paint({ map: mas.map, bumpMap: mas.bump, bumpScale: 0.7, color: 0x2e2a34 });
        [-1, 1].forEach((sd) => { const w = solid(new T.BoxGeometry(0.3, ROOM_H, BACK_Z - WALL_Z + 0.6), stone, sd * (ROOM_W / 2 + 0.15), ROOM_H / 2, (BACK_Z + WALL_Z) / 2); w.castShadow = false; });
        solid(new T.BoxGeometry(ROOM_W + 0.6, 0.3, BACK_Z - WALL_Z + 0.6), paint({ color: 0x120c0e }), 0, ROOM_H + 0.15, (BACK_Z + WALL_Z) / 2).castShadow = false;
        const back = solid(new T.BoxGeometry(ROOM_W + 0.6, ROOM_H, 0.3), stone, 0, ROOM_H / 2, BACK_Z + 0.15); back.castShadow = false;
        const lime = SC.tex.masonry(5, 12, 6), limeMap = lime.map.clone(), limeBump = lime.bump.clone();
        [limeMap, limeBump].forEach((t) => { t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1.6, 1); });
        const far = solid(new T.BoxGeometry(ROOM_W + 0.6, ROOM_H, 0.3), paint({ map: limeMap, bumpMap: limeBump, bumpScale: 0.25, color: 0x57504a }), 0, ROOM_H / 2, WALL_Z - 0.15);
        far.castShadow = false;
        const wood0 = SC.tex.wood(0x3a2418, 21).clone();
        wood0.needsUpdate = true; wood0.wrapS = wood0.wrapT = T.RepeatWrapping; wood0.repeat.set(3, 4);
        const floor = new T.Mesh(new T.PlaneGeometry(ROOM_W, BACK_Z - WALL_Z), paint({ map: wood0, color: 0x3a2a22 }));
        floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, (BACK_Z + WALL_Z) / 2); floor.receiveShadow = true; scene.add(floor);

        // the hole: a coin of white light in the back wall, with a brass lens set in it
        const holeGlow = glow(0xfff4dc, 1); holeGlow.scale.set(0.5, 0.5, 1); holeGlow.position.set(HOLE[0], HOLE[1], HOLE[2] - 0.16); scene.add(holeGlow);
        const brass = paint({ color: 0xa8803a, metalness: 0.5, roughness: 0.35, emissive: 0x1a0e02 }, 0xffe0a0, 0.4);
        const lens = new T.Group(); lens.position.set(HOLE[0], HOLE[1], HOLE[2] - 0.06); scene.add(lens);
        const lensRing = solid(new T.TorusGeometry(0.11, 0.025, 10, 32), brass, 0, 0, 0, lens); lensRing.castShadow = false;
        const lensMark = solid(new T.BoxGeometry(0.02, 0.05, 0.02), brass, 0, 0.14, 0, lens); lensMark.castShadow = false;
        const lensGlass = new T.Mesh(new T.CircleGeometry(0.1, 24), new T.MeshBasicMaterial({ color: 0xfff6e0, toneMapped: false }));
        lens.add(lensGlass);
        // the dark glass beside the hole
        const gilt = paint({ color: 0x8a6428, metalness: 0.4, roughness: 0.45 }, 0xffe0a0, 0.3);
        const glassTex = P.canvasTex(128, 256, (g, w, h) => {
          const gr = g.createLinearGradient(0, 0, w, h);
          gr.addColorStop(0, '#1a1622'); gr.addColorStop(0.45, '#0a080e'); gr.addColorStop(0.52, '#2a2434'); gr.addColorStop(0.6, '#0a080e'); gr.addColorStop(1, '#141018');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
        });
        const darkGlass = new T.Group(); darkGlass.position.set(GLASS[0], GLASS[1], GLASS[2]); darkGlass.rotation.y = Math.PI; scene.add(darkGlass);
        solid(new T.PlaneGeometry(1.0, 2.0), new T.MeshStandardMaterial({ color: 0x6a6070, map: glassTex, roughness: 0.06, metalness: 0.3, emissive: 0xffffff, emissiveMap: glassTex, emissiveIntensity: 0.22 }), 0, 0, 0, darkGlass).castShadow = false;
        [[0, 1.05, 1.2, 0.1], [0, -1.05, 1.2, 0.1], [-0.55, 0, 0.1, 2.2], [0.55, 0, 0.1, 2.2]].forEach(([x, y, bw, bh]) => { solid(new T.BoxGeometry(bw, bh, 0.06), gilt, x, y, 0.02, darkGlass).castShadow = false; });

        // ---- The picture on the far wall: a soft square of light, and the city in it (seen whole only from the side) ----
        const glowCv = P.canvasTex(256, 128, (g, w, h) => {
          const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.62);
          gr.addColorStop(0, 'rgba(255,240,210,1)'); gr.addColorStop(0.6, 'rgba(255,236,200,0.75)'); gr.addColorStop(1, 'rgba(255,230,190,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
        });
        const wallGlow = new T.Mesh(new T.PlaneGeometry(PW * 1.18, PH * 1.3), new T.MeshBasicMaterial({ map: glowCv, color: 0xffe8c8, transparent: true, opacity: 0.12, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        wallGlow.position.set(0, PY, WALL_Z + 0.02); scene.add(wallGlow);
        const cityTex = new T.CanvasTexture(cityCanvas());
        cityTex.encoding = T.sRGBEncoding; cityTex.center.set(0.5, 0.5); cityTex.anisotropy = 4;
        const cityPlane = new T.Mesh(new T.PlaneGeometry(PW, PH), new T.MeshBasicMaterial({ map: cityTex, transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
        cityPlane.position.set(0, PY, WALL_Z + 0.025); scene.add(cityPlane);

        // ---- Hermes and Aurelia, standing in the beam: their shadows fall on the city ----
        let HM = null;
        try {
          HM = P.buildHermes(T, glowTex);
          HM.hermes.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(HM.hermes);
        } catch (e) { HM = null; }
        let aurelia = null;
        try {
          aurelia = SC.chars.oracle(paint, { scale: 1.12 });
          aurelia.userData.lift(1);
          aurelia.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
          scene.add(aurelia);
        } catch (e) { aurelia = null; }
        // the Mirror Speaker, for a moment, in the dark glass
        // she is only ever seen inside the frame of the glass: flattened against it and cut to its edges, like a reflection
        renderer.localClippingEnabled = true;
        const inGlass = [new T.Plane(new T.Vector3(1, 0, 0), -(GLASS[0] - 0.5)), new T.Plane(new T.Vector3(-1, 0, 0), GLASS[0] + 0.5),
          new T.Plane(new T.Vector3(0, 1, 0), -(GLASS[1] - 1.0)), new T.Plane(new T.Vector3(0, -1, 0), GLASS[1] + 1.0)];
        let speaker = null;
        try {
          speaker = SC.chars.oracle(paint, { robe: 0x8a8a94, trim: 0xc8c8d0, mantle: 0x6a6a76, scale: 0.86 });
          speaker.userData.lift(1);
          speaker.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0; o.material.depthWrite = false; o.material.clippingPlanes = inGlass; o.castShadow = false; } });
          speaker.scale.z *= 0.3;
          speaker.position.set(GLASS[0], GLASS[1] - 1.0, GLASS[2] - 0.1); speaker.visible = false; scene.add(speaker);
        } catch (e) { speaker = null; }
        const ghostLight = new T.PointLight(0xd8d8ff, 0, 3, 1.8); ghostLight.position.set(GLASS[0], 2.0, GLASS[2] - 1.2); scene.add(ghostLight);
        const signLine = new T.Mesh(new T.BoxGeometry(0.9, 0.02, 0.02), new T.MeshBasicMaterial({ color: 0xe9d5ff, transparent: true, opacity: 0, toneMapped: false }));
        signLine.position.set(GLASS[0], 2.15, GLASS[2] - 0.14); scene.add(signLine);

        let fx = null, motes = null;
        try {
          if (window.EclipseFX) {
            fx = window.EclipseFX.kit(renderer, scene, HM, {
              look: { bloom: 0.85, threshold: 0.78, knee: 0.2, vignette: 0.6, grain: 0.045, ca: 0.12, sat: 0.96, contrast: 1.08, gain: [1.02, 1.0, 0.98], shade: 0.36, shadeColor: [0.36, 0.34, 0.5] },
              sandColor: 0x6a5a50, printsOn: false, scale: 1, wind: [0, 0, 0], ambient: null, sparkColor: 0xffe0a0
            });
            motes = window.EclipseFX.particles(scene, { max: lowPower ? 160 : 320, additive: true, wind: [0.01, 0, 0] });
          }
        } catch (e) { fx = null; }

        return { T, renderer, scene, camera, lowPower, beam, holeGlow, lens, wallGlow, cityPlane, cityTex, darkGlass, speaker, ghostLight, signLine,
          H: HM, hermes: HM && HM.hermes, aurelia, fx, motes, moteAcc: 0, hMove: null, aMove: null, spot: null, sharpK: 0,
          cam: { dist: 1, tDist: 1, p: null, l: null } };
      }

      // ---- Keeping the scene in step with the game ----
      function shortTurn(a, b) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
      function moveTo(obj, x, z, dur, yaw) {
        if (dur <= 0 || reduced()) { obj.position.x = x; obj.position.z = z; if (yaw != null) obj.rotation.y = yaw; return null; }
        return { fx: obj.position.x, fz: obj.position.z, tx: x, tz: z, t: 0, dur, ry0: obj.rotation.y, ry1: yaw == null ? obj.rotation.y : yaw };
      }
      function stepMv(obj, mv, dt) {
        if (!mv) return null;
        mv.t += dt;
        const u = Math.min(1, mv.t / mv.dur), e = ease(u);
        obj.position.x = mv.fx + (mv.tx - mv.fx) * e;
        obj.position.z = mv.fz + (mv.tz - mv.fz) * e;
        obj.rotation.y = mv.ry0 + shortTurn(mv.ry0, mv.ry1) * Math.min(1, mv.t / Math.min(0.3, mv.dur));
        return u >= 1 ? null : mv;
      }
      const endE = (now) => (view.foundT && !reduced() ? ((now || performance.now()) - view.foundT) / 1000 : -1);
      // while Aurelia's hand is on the wall the city is drawn in the 3D scene, so she stands in front of it and it trembles under her fingers
      const handMoment = (now) => { const e = endE(now); return e >= 0.3 && e < 3.6; };
      // where the two of them stand: in the beam, a few steps from the wall; after the find, Aurelia's hand on the wall
      function spots(now) {
        const e = endE(now);
        if (e >= 0 && e < 3.6) {
          const h = placeAt(CITY.target);
          return { h: [-2.6, WALL_Z + 1.7], a: [clamp(h[0], -2.2, 2.2) + 0.35, WALL_Z + 0.75] };
        }
        // one on each side of the picture, close to the wall: two silhouettes and two shadows framing the city
        return { h: [-2.95, WALL_Z + 1.15], a: [2.95, WALL_Z + 1.35] };
      }
      function steer(snap, now) {
        if (!G) return;
        const s = spots(now);
        const key = s.h.join() + '|' + s.a.join();
        if (!snap && G.spot === key) return;
        G.spot = key;
        const go = (obj, [x, z]) => {
          if (!obj) return null;
          if (snap) { obj.position.set(x, 0.02, z); obj.rotation.y = faceYaw(-x * 0.5, WALL_Z - z); return null; }
          const d = Math.hypot(x - obj.position.x, z - obj.position.z);
          return moveTo(obj, x, z, Math.min(4, d / 1.4), faceYaw(x - obj.position.x, z - obj.position.z));
        };
        G.hMove = go(G.hermes, s.h);
        G.aMove = go(G.aurelia, s.a);
      }
      function syncWorld() {
        if (!G) return;
        steer(view.snapNext);
        view.snapNext = false;
      }

      // ---- The camera: straight at the wall while she plays (the picture stays square), turned to the dark glass at the end ----
      function cameraPhase(now) {
        const e = endE(now);
        if (isDone() && e > 3.6 && e < 13) return 'end';
        return 'wall';
      }
      function shotFor(ph) {
        if (ph === 'end') return { p: [0.2, 1.85, 1.2], l: [GLASS[0], 1.85, GLASS[2]] };
        // from the back of the room, beside the hole: the lens (fitWallFov) is chosen so the picture fills most of the stage
        const y = PY - PH * 0.08;
        return { p: [0, y, WALL_Z + WALL_D], l: [0, y, WALL_Z] };
      }
      const WALL_D = BACK_Z - 0.7 - WALL_Z;
      function fitWallFov() {
        const asp = G.camera.aspect || 1.6;
        const tv = Math.max((PH * 1.7) / 2 / WALL_D, PW / 0.64 / 2 / (WALL_D * asp));
        return Math.min(75, Math.atan(tv) * 360 / Math.PI);
      }
      function placeCamera(dt, now, snap) {
        const cam = G.camera, c = G.cam;
        const fov = (cine && cine.active) || cameraPhase(now) !== 'wall' ? 50 : fitWallFov();
        if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = snap || !c.p || (cine && cine.active) ? fov : cam.fov + (fov - cam.fov) * (1 - Math.exp(-dt * 2.2)); cam.updateProjectionMatrix(); }
        let p, l;
        const cf = cine && cine.active ? cine.frame(dt) : null;
        if (cf) { p = cf.p; l = cf.l; snap = true; }
        else {
          const ph = cameraPhase(now);
          if (ph !== view.phase) { view.phase = ph; }
          c.dist += (c.tDist - c.dist) * Math.min(1, dt * 4);
          const s = shotFor(ph);
          p = s.p.slice(); l = s.l.slice();
          if (ph === 'wall') { p[2] = WALL_Z + (p[2] - WALL_Z) * c.dist; if (!reduced()) { const t = now / 1000; p[0] += Math.sin(t * 0.21) * 0.04; l[0] = p[0]; p[1] += Math.sin(t * 0.17) * 0.02; l[1] = p[1]; } }
        }
        if (!c.p || snap) { c.p = p.slice(); c.l = l.slice(); }
        else {
          const k = 1 - Math.exp(-dt * 2.2);
          for (let i = 0; i < 3; i++) { c.p[i] += (p[i] - c.p[i]) * k; c.l[i] += (l[i] - c.l[i]) * k; }
        }
        cam.position.set(c.p[0], c.p[1], c.p[2]);
        cam.lookAt(c.l[0], c.l[1], c.l[2]);
      }
      // the drawing she points at lies exactly over the picture on the wall
      function placePicture() {
        if (!el.picture) return;
        const show = !!G && !(cine && cine.active) && view.phase === 'wall' && !handMoment() && G.cam.p && Math.abs(G.cam.p[0] - G.cam.l[0]) < 0.2 && Math.abs(G.cam.p[1] - G.cam.l[1]) < 0.2;
        if (!G) return;
        el.picture.classList.toggle('is-away', !show);
        if (!show) return;
        G.camera.updateMatrixWorld();
        const T = G.T, a = new T.Vector3(-PW / 2, PY + PH / 2, WALL_Z + 0.03).project(G.camera), b = new T.Vector3(PW / 2, PY - PH / 2, WALL_Z + 0.03).project(G.camera);
        const w = el.stage.clientWidth, h = el.stage.clientHeight;
        const x0 = (a.x + 1) / 2 * w, y0 = (1 - a.y) / 2 * h, x1 = (b.x + 1) / 2 * w, y1 = (1 - b.y) / 2 * h;
        const key = [x0, y0, x1 - x0, y1 - y0].map((v) => v.toFixed(1)).join(',');
        if (key === view.rect) return;
        view.rect = key;
        Object.assign(el.picture.style, { left: x0.toFixed(1) + 'px', top: y0.toFixed(1) + 'px', width: (x1 - x0).toFixed(1) + 'px', height: (y1 - y0).toFixed(1) + 'px' });
      }
      function openingShots() {
        return [
          { from: { p: [-1.2, 2.2, 1.0], l: [0, 2.6, BACK_Z] }, to: { p: [-0.5, 2.4, 2.4], l: [0, 2.6, BACK_Z] }, dur: 5.5, kicker: 'STATION 21', title: 'THE CAMERA OBSCURA', line: 'Under Tower III, a room with no windows, as black as a cupboard. In one wall, a hole no bigger than a coin.' },
          { from: { p: [0.6, 2.7, 4.0], l: [0, 2.4, -1] }, to: { p: [0.2, 2.5, 2.2], l: [0, 2.5, WALL_Z] }, dur: 5.5, line: 'Through that hole the light of the whole city falls across the dark, all the way to the far wall.' },
          { from: { p: [2.6, 1.6, 0.6], l: [-0.5, 2.5, WALL_Z] }, to: { p: [1.4, 2.0, 1.6], l: [0, 2.5, WALL_Z] }, dur: 5.5, line: 'And there, hanging in the dark, is the city of the third tower. Upside down.' }
        ];
      }
      function bindPointer() {
        const c = el.stage;
        if (!c || c.__cameraWheel) return;
        c.__cameraWheel = true;
        c.addEventListener('wheel', (e) => { if (!G || (el.howto && el.howto.contains(e.target))) return; e.preventDefault(); G.cam.tDist = clamp(G.cam.tDist * Math.exp(e.deltaY * 0.001), 0.7, 1); }, { passive: false });
      }

      // ---- The frame ----
      function drawFrame(now, dt) {
        if (!G) return;
        const t = now / 1000, rm = reduced(), done = isDone();
        const dev = deviation();
        // the lens: it turns with the ring; the sharper the picture, the brighter the wall
        G.lens.rotation.z = -angle * Math.PI / 180;
        const want = done ? 1 : Math.pow(1 - Math.min(1, dev / 180), 2.2) * (sharp() ? 1 : 0.85);
        G.sharpK += (want - G.sharpK) * Math.min(1, dt * 5);
        const flash = view.sharpT && !rm ? Math.max(0, 1 - (now - view.sharpT) / 900) : 0;
        G.beam.intensity = 0.3 + 0.45 * G.sharpK + 0.5 * flash;
        G.wallGlow.material.opacity = 0.08 + 0.16 * G.sharpK + 0.18 * flash;
        G.holeGlow.material.opacity = 0.9 + (rm ? 0 : 0.1 * Math.sin(t * 3));
        // the 3D city follows the ring too (it is seen whole when the camera is not square to the wall)
        G.cityTex.rotation = -angle * Math.PI / 180;
        G.cityPlane.material.opacity = view.phase === 'wall' && !(cine && cine.active) && !handMoment(now) ? 0 : 0.55 + 0.3 * G.sharpK;
        const quake = !rm && endE(now) >= 1.6 ? Math.max(0, 1 - (endE(now) - 1.6) / 1.4) : 0;
        G.cityPlane.position.x = quake * 0.035 * Math.sin(t * 47);
        G.cityPlane.position.y = PY + quake * 0.025 * Math.sin(t * 61 + 1);
        // the two of them in the beam
        steer(false, now);
        if (G.hermes) {
          if (G.hMove) G.hMove = stepMv(G.hermes, G.hMove, dt);
          else G.hermes.rotation.y += shortTurn(G.hermes.rotation.y, view.phase === 'end' ? faceYaw(GLASS[0] - G.hermes.position.x, GLASS[2] - G.hermes.position.z) : 0.12) * Math.min(1, dt * 3);
          G.hermes.position.y = 0.02;
        }
        if (G.aurelia) {
          if (G.aMove) G.aMove = stepMv(G.aurelia, G.aMove, dt);
          else G.aurelia.rotation.y += shortTurn(G.aurelia.rotation.y, view.phase === 'end' ? faceYaw(GLASS[0] - G.aurelia.position.x, GLASS[2] - G.aurelia.position.z) : -0.1) * Math.min(1, dt * 3);
          G.aurelia.position.y = 0.02;
          if (G.aurelia.userData.update) G.aurelia.userData.update(t);
        }
        // the end: the Mirror Speaker in the dark glass, tilting her head, and the line she draws
        const e = endE(now);
        const ghost = e > 0 ? Math.max(0, Math.min(1, (e - 5) / 1.2, (12.5 - e) / 1.5)) : 0;
        if (G.speaker) {
          G.speaker.visible = ghost > 0.01;
          if (G.speaker.visible) {
            G.speaker.traverse((o) => { if (o.isMesh) o.material.opacity = 0.42 * ghost; });
            G.speaker.rotation.z = Math.sin(clamp((e - 5.5) / 1.5, 0, 1) * Math.PI) * 0.06;
            if (G.speaker.userData.update) G.speaker.userData.update(t);
          }
        }
        G.ghostLight.intensity = 0.9 * ghost;
        const line = e > 0 ? clamp((e - 7) / 1.3, 0, 1) : 0;
        G.signLine.scale.x = Math.max(0.001, ease(line));
        G.signLine.material.opacity = 0.9 * line * Math.max(0, Math.min(1, (13 - e) / 1.5));
        // dust turning slowly in the beam
        if (G.motes && !rm) {
          G.moteAcc += dt * (G.lowPower ? 8 : 16);
          const n = Math.floor(G.moteAcc); G.moteAcc -= n;
          for (let i = 0; i < n; i++) {
            const u = 0.42 + Math.random() * 0.55, tx = (Math.random() - 0.5) * PW, ty = PY + (Math.random() - 0.5) * PH;
            G.motes.emit({ x: HOLE[0] + (tx - HOLE[0]) * u, y: HOLE[1] + (ty - HOLE[1]) * u, z: HOLE[2] + (WALL_Z - HOLE[2]) * u }, 1, { color: 0xfff0d8, size: [0.012, 0.03], speed: [0, 0.03], up: [-0.02, 0.03], gravity: 0, drag: 0.2, life: [3, 6], alpha: 0.35 + 0.3 * G.sharpK, fadeIn: 0.5, spread: 0.05 });
          }
        }
        if (G.fx) G.fx.frame(dt, G.camera);
        if (G.motes) G.motes.update(dt, G.camera, G.renderer);
        placeCamera(dt, now, false);
        placePicture();
        if (G.fx) G.fx.render(G.scene, G.camera, dt); else G.renderer.render(G.scene, G.camera);
        if (G.adapt) G.adapt(dt); else if (P.fitSpeed) G.adapt = P.fitSpeed(G.renderer);
      }
      function frame(t) {
        if (!G || modal.style.display === 'none') return;
        const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
        lastT = t;
        drawFrame(t, dt);
        raf = requestAnimationFrame(frame);
      }
      function fit() {
        if (!G || !el.stage) return;
        const w = el.stage.clientWidth || 800, h = el.stage.clientHeight || 450;
        G.renderer.setSize(w, h, false);
        G.camera.aspect = w / Math.max(1, h);
        G.camera.updateProjectionMatrix();
        view.rect = '';
      }

      // ---- The moments the scene acts out ----
      const react = (kind) => { if (G && G.fx && G.fx.gait) G.fx.gait.react(kind); };
      const aureliaDoes = (kind) => { if (G && G.aurelia && G.aurelia.userData.react) G.aurelia.userData.react(kind); };
      function sceneSharp(on) {
        if (!on || !G) return;
        view.sharpT = performance.now();
        react('wonder');
        if (!isDone()) subtitle('The city stands up on the wall, sharp to the last roof tile. Hermes holds his breath, as if it might fall over again.', 4.5, 'act');
      }
      function scenePick(id, kind) {
        if (!G) return;
        view.pickT = performance.now();
        const at = placeAt(id);
        if (kind === 'blur') { react('worry'); return; }
        if (kind === 'change') {
          aureliaDoes('nod');
          if (G.fx) G.fx.sparks.emit({ x: at[0], y: at[1], z: at[2] + 0.05 }, 10, { color: 0xfff0c0, size: [0.015, 0.03], speed: [0.1, 0.4], up: [0.1, 0.3], life: [0.4, 0.9], alpha: 0.9, gravity: -0.4, spread: 0.3 });
        } else {
          aureliaDoes('shake');
          react('worry');
        }
      }
      function sceneFound() {
        view.foundT = performance.now();
        react('wonder');
        setTimeout(() => {
          if (!G || modal.style.display === 'none') return;
          aureliaDoes('offer');
          const at = placeAt(CITY.target);
          if (G.fx) { G.fx.triumph({ x: at[0], y: at[1], z: at[2] + 0.1 }, 0.6); G.fx.shake.add(0.02); }
        }, reduced() ? 0 : 1600);
        subtitle('Aurelia crosses the beam and lays her hand flat on the wall, over the narrow house. The whole picture trembles under her fingers.', 4.2, 'act');
        view.endTimers.forEach(clearTimeout);
        view.endTimers = [
          setTimeout(() => { if (modal.style.display !== 'none') subtitle('Cold yesterday, smoking today. Under the house, the raiders\' fire is still warm, and on the hearth lies Fragment II.', 5, 'act'); }, reduced() ? 4500 : 4600),
          setTimeout(() => { if (modal.style.display !== 'none') subtitle('In the dark glass behind them, a woman in a grey gown tilts her head, and draws her straight line in the air.', 5.5, 'act'); }, reduced() ? 9500 : 9600)
        ];
      }

      // ---- Open / close ----
      const pause = () => (window.EclipseStagePause ? window.EclipseStagePause.remaining(NODE) : 0);
      const sealFace = () => (window.EclipseSheetSeals ? window.EclipseSheetSeals.missing(NODE) : '');
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        return get('order_masks_gate_completed') === 'true' && !pause() && !sealFace();
      }
      // ---- How to play ----
      function showHowto(page) {
        if (!el.howto) return;
        howtoPage = page || 0;
        el.howto.hidden = false;
        el.howto.querySelectorAll('.chasm3d-howto-page').forEach((p) => { p.hidden = Number(p.getAttribute('data-page')) !== howtoPage; });
        const count = $('camera3d-howto-count'); if (count) count.textContent = (howtoPage + 1) + ' of 4';
        const dots = $('camera3d-howto-dots'); if (dots) dots.querySelectorAll('i').forEach((d, n) => d.classList.toggle('is-on', n === howtoPage));
        const next = $('btn-camera-howto-next'); if (next) next.textContent = howtoPage === 3 ? 'Begin' : 'Next →';
      }
      const focusTarget = () => (isDone() ? el.done : el.ring);
      function hideHowto() {
        if (el.howto) el.howto.hidden = true;
        set(HOWTO_KEY, 'seen');
        const target = focusTarget();
        if (target && modal.style.display !== 'none') target.focus({ preventScroll: true });
      }
      if (el.help) el.help.addEventListener('click', () => showHowto(0));
      const hb = $('btn-camera-howto-back'), hn = $('btn-camera-howto-next'), hs = $('btn-camera-howto-skip');
      if (hb) hb.addEventListener('click', () => { if (howtoPage === 0) hideHowto(); else showHowto(howtoPage - 1); });
      if (hn) hn.addEventListener('click', () => { if (howtoPage >= 3) hideHowto(); else showHowto(howtoPage + 1); });
      if (hs) hs.addEventListener('click', hideHowto);

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
        if (panel && panel.contains(e.target) && panel.scrollHeight > panel.clientHeight + 1) return;
        if (el.howto && el.howto.contains(e.target)) return;
        e.preventDefault();
      }
      function openCameraModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          const wait = window.EclipseStagePause ? window.EclipseStagePause.opensIn(NODE) : '';
          if (get('order_masks_gate_completed') !== 'true') toast('✦ THE DOOR IS SHUT ✦ The Camera Obscura opens after the Gate of a Thousand Masks (Station 20).');
          else if (wait) toast('The candles of Tower III are still burning down. The Camera Obscura opens in ' + wait + '.');
          else toast('The door of the Camera Obscura opens with the seal printed on ' + (window.EclipseSheetSeals && window.EclipseSheetSeals.page ? window.EclipseSheetSeals.page(NODE) : 'the page “The Camera Obscura”') + ': scan it with your camera.');
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        drawCity();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        lockHubScroll(true);
        modal.addEventListener('wheel', stopHubScroll, { passive: false });
        modal.addEventListener('touchmove', stopHubScroll, { passive: false });
        returnFocusTo = document.activeElement;
        if (!G && el.stage3d) G = buildWorld();
        bindPointer();
        if (G && !cine && el.stage && P.cinema) {
          cine = P.cinema(el.stage, {
            reduced,
            onShot: (i, sh) => { if (sh.line) subtitle(sh.line, sh.dur - 0.4); if (i === 0) cue('whoosh', { dur: 1.8 }); }
          });
        }
        if (el.stage) el.stage.classList.toggle('is-flat', !G);
        if (G && 'ResizeObserver' in window && !el.stage.__cameraFit) { el.stage.__cameraFit = true; new ResizeObserver(fit).observe(el.stage); }
        fit();
        view.snapNext = true; view.sharpT = 0; view.pickT = 0; view.foundT = 0; view.phase = ''; view.rect = '';
        if (G) { G.cam.p = null; G.spot = null; G.hMove = null; G.aMove = null; G.sharpK = isDone() ? 1 : 0; }
        if (el.picture) el.picture.classList.remove('is-tremble');
        if (el.fade) el.fade.classList.remove('is-on');
        if (el.speaker && window.EclipseMirrorSpeaker) window.EclipseMirrorSpeaker.render(NODE, el.speaker);
        if (isDone()) { applyVictory(); setAngle(0); say("We sleep tonight in the old dressing rooms again, Silvia, but nobody can say the dark room let us down. The picture on its wall is still turned the right way up, and a little smoke is still rising from the narrow house, as if the glass remembered."); }
        else {
          setAngle(START_DEG);
          say("Silvia, the Mirror Speaker's reflection led us down a stair and into a room with no windows. It is as black as the inside of a cupboard, and in one wall there is a hole no bigger than a coin. On the opposite wall, hanging in the dark, is the whole city of the third tower, upside down: roofs where the ground should be, smoke falling toward the sky. Aurelia says this is a camera obscura. Open the page “The Camera Obscura”, please. She says it shows the city as it was yesterday.");
        }
        render();
        syncWorld();
        const finishOpen = () => {
          if (get(HOWTO_KEY) !== 'seen' && !isDone()) { showHowto(0); return; }
          const target = focusTarget();
          if (target) setTimeout(() => { if (modal.style.display !== 'none') target.focus({ preventScroll: true }); }, 60);
        };
        lastT = 0;
        cancelAnimationFrame(raf);
        if (G) raf = requestAnimationFrame(frame);
        if (G && cine && !reduced() && !isDone() && get(CINE_INTRO) !== 'seen') {
          set(CINE_INTRO, 'seen');
          cine.start(openingShots(), finishOpen);
        } else finishOpen();
      }
      function closeCameraModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (cine && cine.active) cine.skip();
        view.endTimers.forEach(clearTimeout); view.endTimers = [];
        if (el.fade) el.fade.classList.remove('is-on');
        modal.classList.add('closing');
        modal.removeEventListener('wheel', stopHubScroll);
        modal.removeEventListener('touchmove', stopHubScroll);
        cancelAnimationFrame(raf);
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); lockHubScroll(false); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
        if (justSet) { justSet = false; showMirror(); }
      }
      // Path III on the Quest Map, with Fragment II flashing into its place
      function showMirror() {
        if (document.documentElement.dataset.mapPath !== 'stage' && typeof window.switchMapPath === 'function') window.switchMapPath('stage', true);
        else if (window.StageMirror && typeof window.StageMirror.refresh === 'function') window.StageMirror.refresh();
        const wrap = document.getElementById('stage-map-canvas-wrap');
        if (wrap && wrap.offsetParent) setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }), 260);
      }
      function finishStation() {
        justSet = true;
        closeCameraModal();
      }
      window.openCameraObscuraModal = openCameraModal;
      window.closeCameraObscuraModal = closeCameraModal;
      window.STAGE_OPENERS = window.STAGE_OPENERS || {};
      window.STAGE_OPENERS[NODE] = openCameraModal;
      if (el.close) el.close.addEventListener('click', closeCameraModal);
      if (el.done) el.done.addEventListener('click', finishStation);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeCameraModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || modal.style.display === 'none') return;
        if (cine && cine.active) { e.stopImmediatePropagation(); e.preventDefault(); cine.skip(); return; }
        if (el.howto && !el.howto.hidden) { e.stopImmediatePropagation(); hideHowto(); return; }
        closeCameraModal();
      }, true);

      // ---- The card of the room on the Quest Map ----
      window.STAGE_CARDS = window.STAGE_CARDS || {};
      window.STAGE_CARDS[NODE] = () => {
        const thumb = './assets/thumbnails/camera_obscura_preview.webp';
        if (isDone()) {
          return {
            badge: 'STATION 21 // FRAGMENT II',
            status: 'THE HIDEOUT FOUND ✓',
            statusClass: 'status-done-badge',
            title: 'The Camera Obscura · Tower III',
            thumb,
            lore: 'Silvia held the page “The Camera Obscura” against the city on the wall and found the four things that had changed. A chimney that was cold now smoked: the raiders had hidden in the narrow house behind the market, and the second piece of the mirror of Tower III lay in their ashes.',
            rewards: [
              { icon: '🪞', label: 'Fragment II', desc: 'Set in the mirror of Tower III' },
              { icon: '🏠', label: 'The Narrow House', desc: 'Where the raiders hid' }
            ],
            btnText: 'Revisit the dark room ➔',
            action: openCameraModal,
            hideReturnBtn: true
          };
        }
        return {
          badge: 'STATION 21 // STAGE PATH',
          status: 'THE DARK ROOM IS OPEN ✦',
          statusClass: 'status-live-badge',
          title: 'The Camera Obscura · Tower III',
          thumb,
          lore: 'A hole in a wall, and the whole city of the third tower hanging in the dark, upside down. Hold the journal page of the same name against the wall: four things have changed since it was drawn, and the raiders hide where one of them is.',
          rewards: [
            { icon: '🕳️', label: 'The City on the Wall', desc: 'Your journal · turn the lens, compare, point' },
            { icon: '🪞', label: 'Fragment II', desc: 'One ninth of the mirror of Tower III' }
          ],
          btnText: '✦ ENTER THE DARK ROOM ➔',
          action: openCameraModal,
          hideReturnBtn: true
        };
      };

      // For the smoke tests: the picture's angle, the places, and a way to point without the mouse
      window.__camera = {
        angle: () => angle, sharp, setAngle, pick, found, fails, target: CITY.target,
        places: () => CITY.places.map((p) => ({ id: p.id, change: p.change, box: p.box })),
        gfx: () => G,
        cine: () => !!(cine && cine.active), skipCine: () => { if (cine) cine.skip(); },
        world: () => {
          if (!G) return { gl: false };
          const r = el.picture ? el.picture.getBoundingClientRect() : null;
          return {
            gl: true, phase: view.phase, sharpK: +G.sharpK.toFixed(2), beam: +G.beam.intensity.toFixed(2), lens: +G.lens.rotation.z.toFixed(2),
            picture: !!(el.picture && !el.picture.classList.contains('is-away')), rect: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null,
            hermes: G.hermes ? [+G.hermes.position.x.toFixed(2), +G.hermes.position.z.toFixed(2)] : null,
            aurelia: G.aurelia ? [+G.aurelia.position.x.toFixed(2), +G.aurelia.position.z.toFixed(2)] : null,
            ghost: !!(G.speaker && G.speaker.visible), post: !!(G.fx && G.fx.post)
          };
        },
        // where the picture of the wall lies on the screen, from the 3D wall itself (to check the drawing sits on it)
        wallRect: () => {
          if (!G) return null;
          G.camera.updateMatrixWorld();
          const a = new G.T.Vector3(-PW / 2, PY + PH / 2, WALL_Z + 0.03).project(G.camera), b = new G.T.Vector3(PW / 2, PY - PH / 2, WALL_Z + 0.03).project(G.camera);
          const r = el.stage.getBoundingClientRect();
          return [Math.round(r.left + (a.x + 1) / 2 * r.width), Math.round(r.top + (1 - a.y) / 2 * r.height), Math.round((b.x - a.x) / 2 * r.width), Math.round((a.y - b.y) / 2 * r.height)];
        },
        frames: (n) => { for (let i = 0; i < (n || 1); i++) drawFrame(performance.now() + i * 33, 1 / 30); },
        settle: () => { view.sharpT = 0; view.foundT = 0; view.snapNext = true; syncWorld(); }
      };
    })();
