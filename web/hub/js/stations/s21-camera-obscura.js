
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
        tFound: $('camera-telem-found'), tHideout: $('camera-telem-hideout'), tFragment: $('camera-telem-fragment')
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
      }
      function setAngle(deg) {
        const before = sharp();
        angle = ((deg % 360) + 360) % 360;
        applyAngle();
        if (sharp() && !before && sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
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
          setAngle(fromPointer(e));
        });
        el.ring.addEventListener('pointermove', (e) => { if (dragging === e.pointerId) setAngle(fromPointer(e)); });
        const end = (e) => { if (dragging === e.pointerId) dragging = null; };
        el.ring.addEventListener('pointerup', end);
        el.ring.addEventListener('pointercancel', end);
        // The keyboard turns it too: arrows by 5 degrees (Shift: 1), Page Up and Down by 45, Home upright, End upside down
        el.ring.addEventListener('keydown', (e) => {
          if (isDone()) return;
          const step = e.shiftKey ? 1 : 5;
          const moves = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: 45, PageDown: -45 };
          if (moves[e.key] !== undefined) { e.preventDefault(); setAngle(angle + moves[e.key]); }
          else if (e.key === 'Home') { e.preventDefault(); setAngle(0); }
          else if (e.key === 'End') { e.preventDefault(); setAngle(180); }
        });
      }

      function say(text) { if (el.dispatch) el.dispatch.textContent = '"' + text + '"'; }
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
          feedback('The picture is still blurred. Turn the ring until the city stands upright and sharp, then point.', 'error');
          return;
        }
        if (id === CITY.target) { completeStation(); return; }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
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
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        feedback('The chimney of the narrow house was cold on the sheet, and it smokes now. The raiders hide there.', 'ok');
        applyVictory();
        render();
        if (typeof window.updatePathTabsUI === 'function') window.updatePathTabsUI();
        if (modal.style.display !== 'none') {
          justSet = true;   // the mirror is refreshed once the modal closes, so its flash is seen
          if (el.done) setTimeout(() => el.done.focus(), 60);
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
        if (el.tFound) el.tFound.textContent = done ? '4 / 4 ✓' : '[ ' + list.length + ' / 4 ]';
        if (el.tHideout) el.tHideout.textContent = done ? 'THE NARROW HOUSE ✓' : '[ UNKNOWN ]';
        if (el.tFragment) el.tFragment.textContent = done ? 'SET ✓' : '[ MISSING ]';
        if (el.hint) {
          const hint = !done && cityHints.level() >= 2 ? '✦ Aurelia: hold the sheet so that it matches the wall. What was cold, and is warm now?' : '';
          el.hint.style.display = hint ? '' : 'none';
          el.hint.textContent = hint;
        }
        if (el.victory) el.victory.style.display = done ? '' : 'none';
        if (el.ring) el.ring.setAttribute('aria-disabled', done ? 'true' : 'false');
        if (done && angle !== 0) setAngle(0);
      }

      // ---- Open / close ----
      const pause = () => (window.EclipseStagePause ? window.EclipseStagePause.remaining(NODE) : 0);
      const sealFace = () => (window.EclipseSheetSeals ? window.EclipseSheetSeals.missing(NODE) : '');
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        return get('order_masks_gate_completed') === 'true' && !pause() && !sealFace();
      }
      let returnFocusTo = null;
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
        returnFocusTo = document.activeElement;
        if (el.speaker && window.EclipseMirrorSpeaker) window.EclipseMirrorSpeaker.render(NODE, el.speaker);
        if (isDone()) { applyVictory(); setAngle(0); say("We sleep tonight in the old dressing rooms again, Silvia, but nobody can say the dark room let us down. The picture on its wall is still turned the right way up, and a little smoke is still rising from the narrow house, as if the glass remembered."); }
        else {
          setAngle(START_DEG);
          say("Silvia, the Mirror Speaker's reflection led us down a stair and into a room with no windows. It is as black as the inside of a cupboard, and in one wall there is a hole no bigger than a coin. On the opposite wall, hanging in the dark, is the whole city of the third tower, upside down: roofs where the ground should be, smoke falling toward the sky. Aurelia says this is a camera obscura. Open the page “The Camera Obscura”, please. She says it shows the city as it was yesterday.");
        }
        render();
        const target = isDone() ? el.done : el.ring;
        if (target) setTimeout(() => target.focus(), 60);
      }
      function closeCameraModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
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
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeCameraModal(); });

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
        places: () => CITY.places.map((p) => ({ id: p.id, change: p.change, box: p.box }))
      };
    })();
