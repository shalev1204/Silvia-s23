
    // =========================================================================
    // 🌅 DAWN ROUTE ON THE GRAND DESERT MAP: Outer Watchtower VI → the dry river → Cairn I → the North Portal
    // Revealed as the story advances: marks and routes follow the Hermes chat (order_field_wire_step / order_dawn_step).
    // =========================================================================
    (function initDawnMapLayer() {
      const svg = document.getElementById('desert-map-svg-overview');
      if (!svg) return;
      const NS = 'http://www.w3.org/2000/svg';
      const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

      function state() {
        const wire = parseInt(get('order_field_wire_step') || '0', 10) || 0;
        const cairnDone = get('order_cairn1_completed') === 'true';
        const isBypassed = get('order_cairn1_bypassed') === 'true';
        const chasmDone = get('order_whispering_chasm_completed') === 'true';
        const dawn = (cairnDone || isBypassed) ? 3 : (parseInt(get('order_dawn_step') || '0', 10) || 0);
        return { reached: wire >= 4 || chasmDone || cairnDone || isBypassed, dawn: dawn };
      }

      // The station the map should highlight before the Whispering Chasm
      window.getDawnNodeId = function () {
        const s = state();
        const isBypassed = get('order_cairn1_bypassed') === 'true';
        if (isBypassed) return 10;
        return (s.reached && s.dawn >= 1 && s.dawn < 3) ? 22 : 10;
      };

      const ROUTES = [
        { id: 'dawn-route-1', d: 'M 170 948 C 215 968 300 990 340 1000 S 395 1012 413 1019' },
        { id: 'dawn-route-2', d: 'M 413 1019 C 430 1045 425 1070 450 1105 S 505 1160 538 1203' },
        { id: 'dawn-route-3', d: 'M 538 1203 C 560 1235 548 1290 520 1330 S 505 1400 490 1440 S 440 1540 395 1610 S 340 1700 340 1760 S 385 1860 405 1925 S 418 1995 400 2052' }
      ];
      const MARKS = [
        { id: 'dawn-mark-silence', x: 170, y: 948, icon: '🌅', label: 'THE GREAT SILENCE', w: 190,
          say: '“The wind has stopped. After a big storm the desert holds its breath, and every sound carries for miles.” · Hermes, at dawn' },
        { id: 'dawn-mark-river', x: 413, y: 1019, icon: '👣', label: 'THE DRY RIVER', w: 160,
          say: '“A riverbed wider than a street, with a floor of smooth gray stones. Something pulls me south along it.” · Hermes, Wadi al-Hajar' },
        { id: 'dawn-mark-portal', x: 400, y: 2052, icon: '🚪', label: 'NORTH PORTAL', w: 150, below: true,
          say: '“The rock splits open into a narrow gate, and the wind is already murmuring inside.” · Hermes, at the Whispering Chasm' }
      ];

      const layer = document.createElementNS(NS, 'g');
      layer.setAttribute('id', 'dawn-map-layer');
      svg.appendChild(layer);

      function el(name, attrs, parent) {
        const e = document.createElementNS(NS, name);
        Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
        if (parent) parent.appendChild(e);
        return e;
      }

      ROUTES.forEach((r) => {
        const g = el('g', { id: r.id, style: 'display:none;' }, layer);
        el('path', { class: 'dawn-route-halo', d: r.d }, g);
        el('path', { class: 'dawn-route-line', d: r.d }, g);
      });

      function buildMark(m, onClick) {
        const g = el('g', { id: m.id, class: 'dawn-mark', transform: 'translate(' + m.x + ', ' + m.y + ') scale(1.4)', style: 'display:none;' }, layer);
        el('circle', { class: 'dawn-mark-core', cx: 0, cy: 0, r: 15, fill: '#2d1507', stroke: '#fbbf24', 'stroke-width': 2.2 }, g);
        const icon = el('text', { class: 'dawn-mark-icon', x: 0, y: 5, 'text-anchor': 'middle', 'font-size': 13, fill: '#fbbf24' }, g);
        icon.textContent = m.icon;
        el('rect', { class: 'dawn-mark-rect', x: -m.w / 2, y: m.below ? 24 : -48, width: m.w, height: 24, rx: 4, fill: '#180e07', stroke: '#fbbf24', 'stroke-width': 1.3, opacity: 0.96 }, g);
        const text = el('text', { class: 'dawn-mark-text', x: 0, y: m.below ? 40 : -32, 'text-anchor': 'middle', 'font-family': "'Cinzel', serif", 'font-size': 10.5, 'font-weight': 700, fill: '#fde68a' }, g);
        text.textContent = m.label;
        g.addEventListener('click', onClick);
        return g;
      }

      MARKS.forEach((m) => {
        buildMark(m, () => { if (typeof window.showDesertToast === 'function') window.showDesertToast(m.say); });
      });
      const cairnMark = buildMark({ id: 'dawn-mark-cairn', x: 538, y: 1203, icon: '?', label: '', w: 270 }, () => {
        if (typeof window.selectDesertStation === 'function') window.selectDesertStation(22);
      });

      let lastSig = '';
      function update() {
        const s = state();
        const show = (id, on) => { const n = document.getElementById(id); if (n) n.style.display = on ? '' : 'none'; };
        const r1 = s.reached, r2 = s.reached && s.dawn >= 1, r3 = s.dawn >= 3;
        show('dawn-route-1', r1); show('dawn-route-2', r2); show('dawn-route-3', r3);
        show('dawn-mark-silence', r1); show('dawn-mark-river', r2); show('dawn-mark-cairn', r2); show('dawn-mark-portal', r3);

        // Only the newest route keeps flowing
        const latest = r3 ? 'dawn-route-3' : (r2 ? 'dawn-route-2' : 'dawn-route-1');
        ROUTES.forEach((r) => {
          const line = document.querySelector('#' + r.id + ' .dawn-route-line');
          if (line) line.classList.toggle('is-latest', r.id === latest && r1);
        });

        // Cairn I marker: a question mark until Hermes finds it, then the stones, then a check
        const isBypassed = get('order_cairn1_bypassed') === 'true';
        const icon = cairnMark.querySelector('.dawn-mark-icon');
        const text = cairnMark.querySelector('.dawn-mark-text');
        if (isBypassed) {
          icon.textContent = '?';
          text.textContent = '✦ DRY WASH · UNEXPLORED';
        } else if (s.dawn >= 3) {
          icon.textContent = '🪨';
          text.textContent = '✓ CAIRN I · SEAL SECURED';
        } else if (s.dawn >= 2) {
          icon.textContent = '🪨';
          text.textContent = '✦ CAIRN I ➔';
        } else {
          icon.textContent = '?';
          text.textContent = '✦ SOMETHING IN THE DRY RIVER';
        }

        const sig = [r1, r2, r3, s.dawn].join(',');
        if (sig !== lastSig && lastSig !== '') {
          layer.querySelectorAll('g').forEach((g) => { if (g.style.display !== 'none') { g.classList.remove('dawn-fade'); void g.getBoundingClientRect(); g.classList.add('dawn-fade'); } });
        }
        lastSig = sig;
      }
      window.updateDawnMapLayer = update;
      document.addEventListener('dawn:cairn1-solved', update);
      update();
    })();
