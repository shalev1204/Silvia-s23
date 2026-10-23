
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

      const el = {
        close: $('btn-close-monolith'), sigilCard: $('monolith-sigil-card'), keyInput: $('monolith-key-input'), speak: $('btn-monolith-speak'),
        keyFeedback: $('monolith-key-feedback'), game: $('monolith-game'), gameInner: document.querySelector('#monolith-game .monolith-game-inner'), sky: $('monolith-sky'),
        pavement: $('monolith-pavement'), slider: $('monolith-time-slider'), earlier: $('btn-monolith-earlier'),
        later: $('btn-monolith-later'), timeLabel: $('monolith-time-label'), mark: $('btn-monolith-mark'),
        markFeedback: $('monolith-mark-feedback'), inscription: $('monolith-inscription'),
        fragments: $('monolith-fragments'), victory: $('monolith-victory'), victoryText: $('monolith-victory-text'),
        finish: $('btn-monolith-finish'), dispatch: $('monolith-dispatch-text'),
        tSigil: $('monolith-telem-sigil'), tSun: $('monolith-telem-sun'), tMarks: $('monolith-telem-marks'), tSeal: $('monolith-telem-seal')
      };

      const isAwake = () => get(KEYS.awake) === 'true';
      const isDone = () => get(KEYS.done) === 'true';
      const marksFound = () => Math.max(0, Math.min(MARKS.length, parseInt(get(KEYS.marks) || '0', 10) || 0));

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
      let minute = Math.max(FIRST_MINUTE, Math.min(LAST_MINUTE, parseInt(get(KEYS.minute) || String(FIRST_MINUTE), 10) || FIRST_MINUTE));

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

      // ---- Drawing ----
      // The sky uses the map's orientation (east on the right), so the sun and its shadow always sit on opposite sides
      const SKY_X = (m) => 190 - 180 * (m / 60 - 6) / 12;
      const SKY_Y = (m) => 58 - 48 * Math.sin(Math.PI * (m / 60 - 6) / 12);
      let sunDot = null, shadowLine = null, shadowTipDot = null;
      const markNodes = {};

      function drawSky() {
        if (!el.sky) return;
        el.sky.innerHTML = '';
        el.sky.appendChild(svgEl('line', { x1: 0, y1: 58, x2: 200, y2: 58, stroke: '#d4a853', 'stroke-opacity': 0.5, 'stroke-width': 0.6 }));
        let d = '';
        for (let m = 6 * 60; m <= 18 * 60; m += 10) d += (d ? ' L ' : 'M ') + SKY_X(m).toFixed(2) + ' ' + SKY_Y(m).toFixed(2);
        el.sky.appendChild(svgEl('path', { d, fill: 'none', stroke: '#fde68a', 'stroke-opacity': 0.45, 'stroke-width': 0.6, 'stroke-dasharray': '2 2' }));
        [['W · sunset', 12, 'start'], ['S · noon', 100, 'middle'], ['E · sunrise', 188, 'end']].forEach(([label, x, anchor]) => {
          const t = svgEl('text', { x, y: 63, fill: '#d6c3a0', 'font-size': 4, 'text-anchor': anchor });
          t.textContent = label;
          el.sky.appendChild(t);
        });
        sunDot = svgEl('circle', { r: 4.2, fill: '#fbbf24', stroke: '#fff7d6', 'stroke-width': 0.8 });
        el.sky.appendChild(sunDot);
      }

      function drawPavement() {
        if (!el.pavement) return;
        el.pavement.innerHTML = '';
        for (let r = 6; r <= 42; r += 6) {
          el.pavement.appendChild(svgEl('path', { d: `M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0`, fill: 'none', stroke: '#d4a853', 'stroke-opacity': r === 42 ? 0.7 : 0.35, 'stroke-width': 0.4 }));
          const lab = svgEl('text', { x: -r, y: 3.2, fill: '#b8a07a', 'font-size': 2.6, 'text-anchor': 'middle' });
          lab.textContent = String(r);
          el.pavement.appendChild(lab);
        }
        el.pavement.appendChild(svgEl('line', { x1: -60, y1: 0, x2: 60, y2: 0, stroke: '#d4a853', 'stroke-opacity': 0.25, 'stroke-width': 0.3 }));
        [['N', 0, -60], ['W', -59, 1.4], ['E', 59, 1.4]].forEach(([label, x, y]) => {
          const t = svgEl('text', { x, y, fill: '#fde68a', 'font-size': 4, 'text-anchor': 'middle' });
          t.textContent = label;
          el.pavement.appendChild(t);
        });
        shadowLine = svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#0b0704', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-opacity': 0.85 });
        el.pavement.appendChild(shadowLine);
        ALL_MARKS.forEach((m) => {
          const g = svgEl('g', { class: 'monolith-svg-mark', transform: `translate(${m.x.toFixed(2)} ${(-m.y).toFixed(2)})` });
          g.appendChild(svgEl('circle', { r: m.radius.toFixed(2), fill: 'rgba(212,168,83,0.08)', stroke: '#d4a853', 'stroke-opacity': 0.7, 'stroke-width': 0.4 }));
          const icon = svgEl('text', { y: 1.6, 'font-size': 4.6, 'text-anchor': 'middle' });
          icon.textContent = m.icon;
          g.appendChild(icon);
          const title = svgEl('title', {});
          title.textContent = 'A mark carved with ' + m.name;
          g.appendChild(title);
          el.pavement.appendChild(g);
          markNodes[m.id] = g;
        });
        el.pavement.appendChild(svgEl('rect', { x: -2.2, y: -2.2, width: 4.4, height: 4.4, fill: '#7c5a32', stroke: '#fde68a', 'stroke-width': 0.4 }));
        shadowTipDot = svgEl('circle', { r: 1.1, fill: '#fbbf24' });
        el.pavement.appendChild(shadowTipDot);
      }

      function markUnderShadow(m) {
        const tip = shadowTip(m);
        return ALL_MARKS.find((mk) => Math.hypot(tip.x - mk.x, tip.y - mk.y) <= mk.radius) || null;
      }

      function render() {
        const found = marksFound();
        const tip = shadowTip(minute);
        if (sunDot) { sunDot.setAttribute('cx', SKY_X(minute).toFixed(2)); sunDot.setAttribute('cy', SKY_Y(minute).toFixed(2)); }
        if (shadowLine) { shadowLine.setAttribute('x2', tip.x.toFixed(2)); shadowLine.setAttribute('y2', (-tip.y).toFixed(2)); }
        if (shadowTipDot) { shadowTipDot.setAttribute('cx', tip.x.toFixed(2)); shadowTipDot.setAttribute('cy', (-tip.y).toFixed(2)); }
        const near = markUnderShadow(minute);
        ALL_MARKS.forEach((m) => {
          const g = markNodes[m.id];
          if (!g) return;
          const idx = MARKS.indexOf(m);
          g.classList.toggle('is-awake', idx >= 0 && idx < found);
          g.classList.toggle('is-near', !!near && near.id === m.id && !(idx >= 0 && idx < found));
        });
        if (el.slider) { el.slider.value = String(minute); el.slider.setAttribute('aria-valuetext', fmt(minute)); }
        if (el.timeLabel) el.timeLabel.textContent = fmt(minute);
        if (el.tSun) el.tSun.textContent = fmt(minute);
        if (el.tMarks) el.tMarks.textContent = found + ' / ' + MARKS.length;
        if (el.tSigil) el.tSigil.textContent = isAwake() ? SIGIL + ' ✓' : '[ 7 LETTERS ]';
        if (el.tSeal) el.tSeal.textContent = isDone() ? 'CAIRN II ✓' : '[ SEALED ]';
        if (el.game) el.game.classList.toggle('is-locked', !isAwake());
        if (el.gameInner) el.gameInner.inert = !isAwake();
        if (el.sigilCard) el.sigilCard.classList.toggle('is-collapsed', isAwake());
        if (isAwake() && el.keyFeedback && el.keyFeedback.textContent !== 'Sigil spoken: ' + SIGIL + ' ✓') feedback(el.keyFeedback, 'Sigil spoken: ' + SIGIL + ' ✓', 'ok');
        if (el.mark) el.mark.disabled = !isAwake() || isDone();
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
        if (el.victory) el.victory.style.display = isDone() ? '' : 'none';
        sigilHints.refresh(); shadowHints.refresh();
      }

      function setMinute(m, persist) {
        minute = Math.max(FIRST_MINUTE, Math.min(LAST_MINUTE, Math.round(m)));
        if (persist) set(KEYS.minute, String(minute));
        render();
      }

      // ---- Part I: the sigil from Sheet 13B ----
      function speakSigil() {
        if (isAwake()) return;
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
        say("The rings are glowing, Silvia! And under Cairn II there is an inscription I can finally read. It names four moments of the day. Move the sun: when the Monolith's shadow touches the right mark, the stone answers.");
        render();
      }

      // ---- Part II: the walking sun ----
      function markShadow() {
        if (!isAwake() || isDone()) return;
        const found = marksFound();
        const touched = markUnderShadow(minute);
        if (!touched) {
          feedback(el.markFeedback, 'Only sand lies under the tip of the shadow.', 'error');
          return;
        }
        if (TRAPS.indexOf(touched) >= 0) {
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          shadowHints.fail();
          if (found > 0) {
            set(KEYS.marks, '0');
            feedback(el.markFeedback, 'The inscription never names ' + touched.name + '. The awakened marks sink back to sleep: begin again with the morning shadow.', 'error');
            say("The glow went out, Silvia, all of it. The stone wants the inscription's moments and nothing else. Start again from the morning.");
            render();
          } else {
            feedback(el.markFeedback, 'The inscription never names ' + touched.name + '. The stone stays asleep.', 'error');
          }
          return;
        }
        const idx = MARKS.indexOf(touched);
        if (idx >= 0 && idx < found) {
          feedback(el.markFeedback, touched.name.charAt(0).toUpperCase() + touched.name.slice(1) + ' is already awake.', '');
          return;
        }
        if (idx !== found) {
          if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
          feedback(el.markFeedback, 'The stone stays silent. The inscription names another moment first.', 'error');
          shadowHints.fail();
          return;
        }
        set(KEYS.marks, String(found + 1));
        if (sfx && sfx.playChimeHover) sfx.playChimeHover();
        feedback(el.markFeedback, touched.name.charAt(0).toUpperCase() + touched.name.slice(1) + ' answers.', 'ok');
        say(MARK_DISPATCH[found]);
        if (found + 1 === MARKS.length) completeStation();
        else render();
      }

      function completeStation() {
        set(KEYS.done, 'true');
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
        if (typeof window.grantCairnSeal === 'function') window.grantCairnSeal(2);
        else set('order_seal_cairn_2', 'true');
        applyVictory();
        render();
        if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
        if (typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
      }

      function applyVictory() {
        if (el.victoryText) {
          el.victoryText.textContent = "The Seal of Cairn II was resting inside, and two lines are carved into the lid. But Silvia, someone tried to open this before us: the rim is scarred by iron bars and there is ash in the cracks. The raiders know about the seals. They failed, because they tried to force what only the sun can open. There is something else on the rim... I need better light. I will tell you on the wire.";
        }
        if (el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; }
        if (el.speak) el.speak.disabled = true;
      }

      // ---- Sky dragging (pointer) ----
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
          if (!isAwake()) return;
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

      // ---- Open / close ----
      function canOpen() {
        if (isDone()) return true;
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        if (get('order_oasis_clepsydra_completed') !== 'true') return false;
        return typeof window.isMonolithMarchOver === 'function' ? window.isMonolithMarchOver() : false;
      }
      let returnFocusTo = null;
      function openSunMonolithModal() {
        if (!canOpen()) {
          const toast = typeof window.showDesertToast === 'function' ? window.showDesertToast : null;
          if (!toast) return;
          if (get('order_oasis_clepsydra_completed') !== 'true') {
            toast('✦ TERRA INCOGNITA ✦ Help Hermes at the Four Wells (Station 13) before the road to the Sun Monolith opens.');
          } else if (typeof window.getMonolithMarchEta === 'function' && window.getMonolithMarchEta()) {
            toast('Hermes is crossing the Great Erg toward the Sun Monolith. Arrival in ' + window.getMonolithMarchEta() + '.');
          } else {
            toast('Hermes is still at the gates of Tower II. Open the Cliffside Workshop to hear what happened there.');
          }
          return;
        }
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.style.display = 'flex';
        modal.classList.remove('closing');
        returnFocusTo = document.activeElement;
        if (isDone()) applyVictory();
        else if (!isAwake()) say("Silvia, I made it to the Ridge of the Sun. The Monolith is taller than I imagined, and Cairn II sits at its feet like a sundial waiting for its hour. The stone tablet asks for the sigil of the page “The Sun Monolith & Cairn II” in your journal.");
        else say("The rings are still glowing. Move the sun, Silvia, and let the shadow touch the marks the inscription names, in order.");
        render();
        const focusTarget = isDone() ? el.finish : isAwake() ? el.slider : el.keyInput;
        if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
      }
      function closeSunMonolithModal() {
        if (modal.style.display === 'none') return;
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        modal.classList.add('closing');
        setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('closing'); }, 220);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function' && document.contains(returnFocusTo)) returnFocusTo.focus();
        returnFocusTo = null;
      }
      window.openSunMonolithModal = openSunMonolithModal;
      window.closeSunMonolithModal = closeSunMonolithModal;
      if (el.close) el.close.addEventListener('click', closeSunMonolithModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeSunMonolithModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeSunMonolithModal(); });
      if (el.finish) {
        el.finish.addEventListener('click', () => {
          closeSunMonolithModal();
          if (typeof window.switchMapPath === 'function') window.switchMapPath('desert', true);
          if (typeof window.updateDesertMapMarkers === 'function') window.updateDesertMapMarkers();
          if (typeof window.showDesertToast === 'function') {
            let seals = 0;
            for (let i = 1; i <= 5; i++) if (get('order_seal_cairn_' + i) === 'true') seals++;
            window.showDesertToast('✦ Seal of Cairn II secured (' + seals + ' of 5) ✦ Open the Cliffside Workshop: Hermes has something to tell you.');
          }
        });
      }

      // Test hook for scripts/audit/web_smoke.py: exposes the model, never the answers' UI
      window.__sunMonolith = { shadowTip, marks: MARKS.map((m) => ({ id: m.id, minute: m.minute })), setMinute: (m) => setMinute(m, true) };

      drawSky();
      drawPavement();
      if (isDone()) applyVictory();
      else if (isAwake() && el.keyInput) { el.keyInput.value = SIGIL; el.keyInput.disabled = true; if (el.speak) el.speak.disabled = true; }
      render();
    })();
