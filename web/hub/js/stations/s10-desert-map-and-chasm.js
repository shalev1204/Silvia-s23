
    // =========================================================================
    // 🏜️ THE GRAND DESERT MAP CONTROLLER
    // =========================================================================
    (function initGrandDesertMapAndChasm() {
      const sfx = window.sfx || null;
      // 1. Navigation & Path Switcher
      const tabConstellation = document.getElementById('btn-tab-path-constellation');
      const tabDesert = document.getElementById('btn-tab-path-desert');
      const constellationMapWrap = document.querySelector('.constellation-map-frame .map-canvas-wrap');
      const desertMapWrap = document.getElementById('desert-map-canvas-wrap');
      const stageMapWrap = document.getElementById('stage-map-canvas-wrap');
      const viewHeader = document.querySelector('#view-trail .view-header');
      const viewTagline = viewHeader ? viewHeader.querySelector('.view-tagline') : null;
      const viewTitle = viewHeader ? viewHeader.querySelector('.view-title') : null;
      const viewDesc = viewHeader ? viewHeader.querySelector('.view-desc') : null;

      // Progress and state shown on the two path cards
      function updatePathTabsUI() {
        const done = (key) => localStorage.getItem(key) === 'true';
        // Path III appears once the Oracle has given the WHEN (Station 19)
        const stageTab = document.getElementById('btn-tab-path-stage');
        const stageOpen = done('order_oracle_horizon_completed');
        if (stageTab) stageTab.style.display = stageOpen ? '' : 'none';
        const seeker = (window.currentSeeker || localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
        const midnightVal = localStorage.getItem('seeker_' + seeker + '_midnight_completed');
        const midnightDone = midnightVal === null ? true : midnightVal === 'true';
        const cipherDone = typeof window.getSeekerCipherCompleted === 'function' ? window.getSeekerCipherCompleted() : false;

        // Stations 01 to 07 are canonically cleared before Station 08 (Midnight Calibration) and 09 (Celestial Cipher)
        const constellationDone = 7 + (midnightDone ? 1 : 0) + (cipherDone ? 1 : 0);
        const watchtowerDone = done('order_field_wire_completed') || (parseInt(localStorage.getItem('order_field_wire_step') || '0', 10) >= 4);
        const desertDone = (watchtowerDone ? 1 : 0) + [
          'order_cairn1_completed',
          'order_whispering_chasm_completed',
          'order_salt_playa_completed',
          'order_desert_lexicon_completed',
          'order_oasis_clepsydra_completed',
          'order_sun_monolith_completed',
          'order_sandstone_labyrinth_completed',
          'order_cairn_iv_completed',
          'order_arch_solstice_completed',
          'order_polybius_stele_completed',
          'order_oracle_horizon_completed'
        ].filter(done).length;

        const stageStations = window.StageMirror ? window.StageMirror.stations : [];
        const stageDone = stageStations.filter((st) => done(st.flag)).length;
        const paths = [
          { id: 'constellation', cleared: constellationDone, total: 9 },
          { id: 'desert', cleared: desertDone, total: 12 },
          { id: 'stage', cleared: stageDone, total: 9 }
        ];
        paths.forEach((p) => {
          const fill = document.getElementById('path-progress-' + p.id);
          const count = document.getElementById('path-count-' + p.id);
          const state = document.getElementById('path-state-' + p.id);
          if (fill) fill.style.width = Math.round((p.cleared / p.total) * 100) + '%';
          if (count) count.textContent = p.cleared + ' of ' + p.total + ' trials cleared' + (p.cleared === p.total ? ' ✓' : '');
          if (state) state.textContent = (currentMapPath === p.id) ? 'You are here' : (p.cleared === p.total ? 'Revisit' : 'Open path');
        });
      }

      let currentMapPath = 'constellation';
      try {
        const savedPath = localStorage.getItem('order_active_map_path');
        if (savedPath === 'desert') currentMapPath = 'desert';
        else if (savedPath === 'stage' && localStorage.getItem('order_oracle_horizon_completed') === 'true') currentMapPath = 'stage';
      } catch (e) {}

      // Next room of the Stage Path (map nodes 40–48 are Stations 20–28)
      function getNextStageNodeId() {
        const stations = window.StageMirror ? window.StageMirror.stations : [];
        const next = stations.find((st) => localStorage.getItem(st.flag) !== 'true');
        return next ? next.node : 48;
      }
      // Each built room registers how to open its game: window.STAGE_OPENERS[node] = fn
      window.STAGE_OPENERS = window.STAGE_OPENERS || {};
      window.selectStageStation = function (node) {
        if (!window.StageMirror) return;
        const st = window.StageMirror.stations.find((x) => x.node === node);
        if (!st) return;
        if (typeof window.selectMapNode === 'function') window.selectMapNode(node, true);
        // A pause after the last fragment (hub/js/stage-pause.js): the card shows the hour, the room stays shut
        const wait = window.EclipseStagePause ? window.EclipseStagePause.opensIn(node) : '';
        if (wait && !(typeof window.isAdminTester === 'function' && window.isAdminTester())) {
          showDesertToast('Station ' + st.station + ' · ' + st.room + ': its door opens in ' + wait + '.');
          return;
        }
        // Then the seal on its sheet (hub/js/sheet-seals.js)
        const face = window.EclipseSheetSeals ? window.EclipseSheetSeals.missing(node) : '';
        if (face && !(typeof window.isAdminTester === 'function' && window.isAdminTester())) {
          showDesertToast('Station ' + st.station + ' · ' + st.room + ': its door opens with the seal on Sheet ' + face + '. Scan it with your camera.');
          return;
        }
        const opener = window.STAGE_OPENERS[node];
        if (typeof opener === 'function') opener();
        else showDesertToast('Station ' + st.station + ' · ' + st.room + ': the Mirror Speaker has not opened this room yet.');
      };

      // Next pending Desert Path station (internal node ids: 10 Chasm, 21 Salt Playa, 11 Lexicon, 12 Clepsydra,
      // 23–26 Stations 14–17, 13 the Polybius Stele, 14 the Oracle)
      function getNextDesertNodeId() {
        if (localStorage.getItem('order_whispering_chasm_completed') !== 'true') return typeof window.getDawnNodeId === 'function' ? window.getDawnNodeId() : 10;
        if (localStorage.getItem('order_polybius_stele_completed') === 'true') return 14;
        if (localStorage.getItem('order_arch_solstice_completed') === 'true') return 13;
        if (localStorage.getItem('order_cairn_iv_completed') === 'true') return 26;
        if (localStorage.getItem('order_sandstone_labyrinth_completed') === 'true') return 25;
        if (localStorage.getItem('order_sun_monolith_completed') === 'true') return 24;
        if (localStorage.getItem('order_oasis_clepsydra_completed') === 'true') return 23;
        if (localStorage.getItem('order_desert_lexicon_completed') === 'true') return 12;
        return localStorage.getItem('order_salt_playa_completed') === 'true' ? 11 : 21;
      }

      // The Desert Path has one view: the 3D unlit map (Three.js), mounted on stage.
      function ensureDesert3D() {
        const stage = document.getElementById('desert3d-stage');
        if (!stage) return;
        if (window.Desert3D) {
          if (!stage.__d3) {
            window.Desert3D.mount(stage);
          } else {
            window.Desert3D.refresh();
          }
        }
      }
      window.ensureDesert3D = ensureDesert3D;

      function showDesertMap(autoSelect = false) {
        const layerOverview = document.getElementById('desert-layer-overview');
        if (layerOverview) layerOverview.style.display = 'block';

        updateDesertMapMarkers();
        ensureDesert3D();

        if (autoSelect && typeof window.selectMapNode === 'function') {
          window.selectMapNode(getNextDesertNodeId(), false);
        }
      }
      window.showDesertMap = showDesertMap;

      function switchMapPath(path, autoSelectNode = true) {
        currentMapPath = path;
        try { localStorage.setItem('order_active_map_path', path); } catch (e) {}
        document.documentElement.setAttribute('data-map-path', path === 'desert' || path === 'stage' ? path : 'constellation');
        updatePathTabsUI();

        if (tabConstellation) tabConstellation.classList.toggle('active', path === 'constellation');
        if (tabDesert) tabDesert.classList.toggle('active', path === 'desert');
        const tabStageBtn = document.getElementById('btn-tab-path-stage');
        if (tabStageBtn) tabStageBtn.classList.toggle('active', path === 'stage');
        if (stageMapWrap) stageMapWrap.style.display = path === 'stage' ? 'block' : 'none';

        if (path === 'stage') {
          if (constellationMapWrap) constellationMapWrap.style.display = 'none';
          if (desertMapWrap) desertMapWrap.style.display = 'none';
          if (viewTagline) viewTagline.textContent = '✦ Stage Progression · The Mirror Sanctuary ✦';
          if (viewTitle) viewTitle.textContent = 'The Velvet Stage';
          const divLabel = document.querySelector('.map-divider-label');
          if (divLabel) divLabel.textContent = '✦ The Mirror of Tower III ✦';
          if (window.StageMirror) window.StageMirror.mount(document.getElementById('stage-mirror-mount'));
          if (autoSelectNode && typeof window.selectMapNode === 'function') window.selectMapNode(getNextStageNodeId(), false);
        } else if (path === 'desert') {
          if (constellationMapWrap) constellationMapWrap.style.display = 'none';
          if (desertMapWrap) desertMapWrap.style.display = 'block';

          if (viewTagline) viewTagline.textContent = '✦ Desert Progression · Terra Deserta ✦';
          if (viewTitle) viewTitle.textContent = 'The Grand Desert Map';
          const divLabel = document.querySelector('.map-divider-label');
          if (divLabel) divLabel.textContent = '✦ The Grand Desert Map ✦';

          const activeId = getNextDesertNodeId();

          showDesertMap(false);

          if (autoSelectNode && typeof window.selectMapNode === 'function') {
            window.selectMapNode(activeId, false);
          }
        } else {
          if (constellationMapWrap) constellationMapWrap.style.display = 'block';
          if (desertMapWrap) desertMapWrap.style.display = 'none';

          if (viewTagline) viewTagline.textContent = '✦ Celestial Progression ✦';
          if (viewTitle) viewTitle.textContent = 'The Constellation Trail';
          const divLabel = document.querySelector('.map-divider-label');
          if (divLabel) divLabel.textContent = '✦ Celestial Route Map ✦';

          if (autoSelectNode && typeof window.selectMapNode === 'function') {
            const isCipherDone = typeof getSeekerCipherCompleted === 'function' ? getSeekerCipherCompleted() : false;
            window.selectMapNode(isCipherDone ? 9 : 8, false);
          }
        }
      }

      function showDesertToast(msg) {
        let toast = document.getElementById('desert-toast-banner');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'desert-toast-banner';
          toast.className = 'desert-toast-banner';
          document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        if (window._desertToastTimer) clearTimeout(window._desertToastTimer);
        window._desertToastTimer = setTimeout(() => {
          toast.classList.remove('show');
        }, 3400);
      }
      window.showDesertToast = showDesertToast;

      function selectDesertStation(id) {
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();

        let targetId = id;
        if (id === 15) targetId = 10;
        else if (id === 16) targetId = 12;
        else if (id === 17) targetId = 14;

        if (targetId === 10) {
          window.selectMapNode(10, true);
          const isCairnDone = localStorage.getItem('order_cairn1_completed') === 'true';
          const isCairnBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
          const isDawnDone = parseInt(localStorage.getItem('order_dawn_step') || '0', 10) >= 3;
          const isChasmUnlocked = isCairnDone || isCairnBypassed || isDawnDone;
          const isChasmAlreadyDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';
          const isTester = (typeof window.isAdminTester === 'function' && window.isAdminTester()) || (typeof isCarlesTester === 'function' && isCarlesTester());
          const marchOver = typeof window.isChasmMarchOver === 'function' ? window.isChasmMarchOver() : true;

          const camped = typeof window.isChasmCamped === 'function' && window.isChasmCamped();

          if (camped && isChasmUnlocked) {
            showDesertToast('✦ CAMP AT THE NORTH PORTAL ✦ Hermes is resting at the mouth of the canyon. The wind inside is too strong tonight. He will call you on the Field Wire as soon as he can go in.');
          } else if ((isChasmUnlocked && marchOver) || isChasmAlreadyDone || isTester) {
            if (window.openWhisperingChasmModal) {
              window.openWhisperingChasmModal();
            } else {
              showDesertToast('Station 10: The Whispering Chasm · Open Sheet 9B of your physical journal.');
            }
          } else if (!isChasmUnlocked) {
            showDesertToast('✦ BASECAMP · WATCHTOWER VI ✦ Hermes is at Watchtower VI. Open the Field Wire to review his dawn dispatch.');
          } else if (!marchOver) {
            showDesertToast('✦ 26-HOUR TREK IN PROGRESS ✦ Hermes is trekking toward the North Portal. Follow his beacon on the map.');
          }
        } else if (targetId === 22) {
          window.selectMapNode(22, true);
          const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
          const isLockedTemp = localStorage.getItem('order_cairn1_locked_until_3_cairns') === 'true';
          if (isBypassed) {
            if (isLockedTemp) {
              showDesertToast('Wadi al-Hajar: The river is quiet. You must first secure other cairn seals.');
            } else {
              showDesertToast('Wadi al-Hajar: You chose not to explore this bend of the dry river at dawn.');
            }
          } else {
            const cairnFound = parseInt(localStorage.getItem('order_dawn_step') || '0', 10) >= 2 || localStorage.getItem('order_cairn1_completed') === 'true';
            if (cairnFound && window.openCairnOneModal) window.openCairnOneModal();
            else showDesertToast('Hermes is still walking the dry river. Keep the wire open.');
          }
        } else if (targetId === 21) {
          window.selectMapNode(21, true);
          if (window.openSaltPlayaModal) {
            window.openSaltPlayaModal();
          } else {
            showDesertToast('Station 11: The Salt Playa · See Sheet 10A of your physical journal.');
          }
        } else if (targetId === 11) {
          window.selectMapNode(11, true);
          if (window.openDesertLexiconModal) {
            window.openDesertLexiconModal();
          } else {
            showDesertToast('Station 12: The Desert Lexicon & Al-Qibla · See Sheet 11A of your physical journal.');
          }
        } else if (targetId === 12) {
          window.selectMapNode(12, true);
          if (window.openOasisClepsydraModal) {
            window.openOasisClepsydraModal();
          } else {
            showDesertToast('Station 13: The Oasis Clepsydra · See Sheet 12B of your physical journal.');
          }
        } else if (targetId === 23) {
          window.selectMapNode(23, true);
          if (window.openSunMonolithModal) window.openSunMonolithModal();
          else showDesertToast('Station 14: The Sun Monolith · See Sheet 13B of your physical journal.');
        } else if (targetId === 24) {
          window.selectMapNode(24, true);
          if (window.openLabyrinthModal) window.openLabyrinthModal();
          else showDesertToast('Station 15: The Sandstone Labyrinth · See Sheet 14B of your physical journal.');
        } else if (targetId === 25) {
          window.selectMapNode(25, true);
          if (window.openCairnFourModal) window.openCairnFourModal();
          else showDesertToast('Station 16: Cairn IV, Sentry of the Canyon · See Sheet 15A of your physical journal.');
        } else if (targetId === 26) {
          window.selectMapNode(26, true);
          if (window.openSolsticeModal) window.openSolsticeModal();
          else showDesertToast('Station 17: The Arch of the Solstice · See Sheet 16B of your physical journal.');
        } else if (targetId === 13) {
          window.selectMapNode(13, true);
          if (window.openSteleModal) window.openSteleModal();
          else showDesertToast('Station 18: The Polybius Stele (Tower II atrium) · See Sheet 17A of your physical journal.');
        } else if (targetId === 14) {
          window.selectMapNode(14, true);
          if (window.openOracleModal) window.openOracleModal();
          else showDesertToast('Station 19: Tower II · The Sandstone Sanctuary of the Desert Oracle · Sheet 18A of your journal.');
        }
      }
      window.selectDesertStation = selectDesertStation;

      function updateDesertMapMarkers() {
        const isChasmDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';
        const isLexiconDone = localStorage.getItem('order_desert_lexicon_completed') === 'true';

        const isPlayaDone = localStorage.getItem('order_salt_playa_completed') === 'true';
        const banners = [
          ['node-10-banner-text', isChasmDone, '✓ 10 · WHISPERING CHASM (CLEARED)', '✦ 10 · WHISPERING CHASM ➔'],
          ['node-21-banner-text', isPlayaDone, '✓ 11 · THE SALT PLAYA (CROSSED)', '✦ 11 · THE SALT PLAYA ➔'],
          ['node-11-banner-text', isLexiconDone, '✓ 12 · NOMAD RUINS (SOLVED)', '✦ 12 · NOMAD RUINS (LEXICON) ➔']
        ];
        updatePathTabsUI();
        if (typeof window.updateDawnMapLayer === 'function') window.updateDawnMapLayer();
        if (window.Desert3D && typeof window.Desert3D.refresh === 'function') {
          window.Desert3D.refresh();
        }
        banners.forEach(([id, done, doneText, openText]) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.textContent = done ? doneText : openText;
          el.setAttribute('fill', done ? '#a7f3d0' : '#fde68a');
        });
      }
      window.updateDesertMapMarkers = updateDesertMapMarkers;
      window.updatePathTabsUI = updatePathTabsUI;

      if (tabConstellation) tabConstellation.addEventListener('click', () => {
        if (sfx) sfx.playMechanicalClick();
        switchMapPath('constellation', true);
      });

      if (tabDesert) tabDesert.addEventListener('click', () => {
        if (sfx) sfx.playMechanicalClick();
        switchMapPath('desert', true);
      });

      const tabStage = document.getElementById('btn-tab-path-stage');
      if (tabStage) tabStage.addEventListener('click', () => {
        if (sfx) sfx.playMechanicalClick();
        switchMapPath('stage', true);
      });

      window.switchMapPath = switchMapPath;

      // 2. The Whispering Chasm Modal Controller
      const modal = document.getElementById('modal-whispering-chasm');
      const btnClose = document.getElementById('btn-close-chasm');
      const btnReset = document.getElementById('btn-chasm-reset');
      const btnFinish = document.getElementById('btn-chasm-finish');
      const svgMaze = document.getElementById('chasm-svg-maze');
      const keypadContainer = document.getElementById('chasm-keypad-buttons');
      const dispatchText = document.getElementById('chasm-dispatch-text');
      const victoryCard = document.getElementById('chasm-victory-card');
      const telemTime = document.getElementById('chasm-telem-time');
      const telemCanteen = document.getElementById('chasm-telem-canteen');
      const telemWaypoint = document.getElementById('chasm-telem-waypoint');
      const progressCount = document.getElementById('chasm-progress-count');

      const MAZE_WALLS = [
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

      // Real route through MAZE_WALLS (no wall crossings, never retraced), cairn to cairn as printed on Sheet 9B
      const SEGMENTS = {
        start_M: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 9], [3, 9], [3, 10], [3, 11], [2, 11], [1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [2, 15], [3, 15], [3, 14], [3, 13], [4, 13], [5, 13], [5, 12], [5, 11], [5, 10], [5, 9], [6, 9], [7, 9]],
        M_I: [[7, 9], [7, 10], [7, 11], [7, 12], [7, 13], [8, 13], [9, 13], [9, 14], [9, 15], [8, 15], [7, 15], [6, 15], [5, 15], [5, 16], [5, 17], [6, 17], [7, 17], [7, 18], [7, 19], [6, 19], [5, 19], [4, 19], [3, 19], [3, 20], [3, 21], [2, 21], [1, 21], [1, 22], [1, 23], [2, 23], [3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [7, 22], [7, 21], [8, 21], [9, 21], [9, 22], [9, 23]],
        I_R: [[9, 23], [10, 23], [11, 23], [11, 22], [11, 21], [11, 20], [11, 19], [12, 19], [13, 19], [13, 20], [13, 21], [14, 21], [15, 21], [15, 22], [15, 23], [16, 23], [17, 23], [18, 23], [19, 23], [20, 23], [21, 23], [21, 22], [21, 21], [20, 21], [19, 21], [18, 21], [17, 21], [17, 20], [17, 19], [16, 19], [15, 19], [15, 18], [15, 17], [14, 17], [13, 17], [12, 17], [11, 17], [11, 16], [11, 15], [11, 14], [11, 13]],
        R_A: [[11, 13], [11, 12], [11, 11], [10, 11], [9, 11], [9, 10], [9, 9], [10, 9], [11, 9], [11, 8], [11, 7], [11, 6], [11, 5], [10, 5], [9, 5], [9, 6], [9, 7], [8, 7], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [6, 3], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [4, 7], [3, 7], [3, 6], [3, 5], [3, 4], [3, 3], [3, 2], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]],
        A_G: [[7, 1], [8, 1], [9, 1], [9, 2], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [18, 3], [19, 3], [19, 4], [19, 5], [18, 5], [17, 5], [17, 6], [17, 7], [18, 7], [19, 7], [20, 7], [21, 7], [22, 7], [23, 7], [23, 8], [23, 9], [22, 9], [21, 9], [20, 9], [19, 9], [18, 9], [17, 9], [16, 9], [15, 9], [15, 10], [15, 11], [15, 12], [15, 13]],
        G_E: [[15, 13], [14, 13], [13, 13], [13, 14], [13, 15], [14, 15], [15, 15], [16, 15], [17, 15], [17, 16], [17, 17], [18, 17], [19, 17], [19, 16], [19, 15], [19, 14], [19, 13], [19, 12], [19, 11], [20, 11], [21, 11], [21, 12], [21, 13], [21, 14], [21, 15]],
        E_exit: [[21, 15], [22, 15], [23, 15], [23, 16], [23, 17], [22, 17], [21, 17], [21, 18], [21, 19], [22, 19], [23, 19], [23, 20], [23, 21], [23, 22], [23, 23], [23, 24]]
      };

      const CAIRNS = [
        { letter: 'M', r: 7, c: 9, step: 0, dispatch: "Silvia! I found the first marker near the dry wash. It bears the mark 'M'! The canyon walkers call these the Six Relic Cairns: small shrine-stones, each keeping a relic of a pilgrim the gorge never gave back. They are not the Order's great Cairns, but the walkers still leave water at their feet. The rock walls are keeping off the heat." },
        { letter: 'I', r: 9, c: 23, step: 1, dispatch: "Second marker reached! The letter 'I' is carved into red sandstone. Heading deeper into the gorge." },
        { letter: 'R', r: 11, c: 13, step: 2, dispatch: "Third marker! 'R'! The wind makes a soft whistling sound between the high cliffs. Your directions are keeping me safe." },
        { letter: 'A', r: 7, c: 1, step: 3, dispatch: "Fourth marker reached: 'A'! We skirted past the treacherous dry salt basin without losing the track." },
        { letter: 'G', r: 15, c: 13, step: 4, dispatch: "Fifth marker: 'G'! The gravel underfoot is damp—I can smell subterranean fresh water nearby!" },
        { letter: 'E', r: 21, c: 15, step: 5, dispatch: "Sixth marker! 'E'! The cliffs are opening up. The walkers call this mouth the Oasis Gate, because their old track runs on across the salt to the wells. I can see a blinding white salt basin ahead, and ruins beyond it!" }
      ];

      const DECOYS = [
        { letter: 'T', r: 13, c: 5, hazard: "Blind Chasm", text: "Wait, Silvia! This corridor ends at a sheer drop ('Blind Chasm'). The trail is blocked. Let's retrace our steps to the last stone pile." },
        { letter: 'K', r: 19, c: 19, hazard: "Salt Basin", text: "Careful, Silvia! The ground turns into a dry salt basin ('Salt Basin') with no way through. Let's head back to our last marker." },
        { letter: 'S', r: 3, c: 17, hazard: "Sands of Thirst", text: "Hold on, Silvia! A wall of loose red sand blocks this turn ('Sands of Thirst'). Let's retrace our steps." }
      ];

      let chasmStepIndex = 0;

      // Hints climb three levels (hub/js/hint-ladder.js): a trap marker or a marker out of order is a miss
      const chasmHints = window.EclipseHints.define({
        id: 's10-chasm', station: 'Station 10', title: 'the whispering chasm', group: 'desert',
        anchor: () => modal && modal.querySelector('.chasm-cairns-keypad-box'),
        solved: () => localStorage.getItem('order_whispering_chasm_completed') === 'true',
        texts: [
          'Trace the gorge of Sheet 9B with your pencil, from the North Portal, before you send me anywhere. Only the markers on the road that goes through count, in the order you reach them.',
          'The canyon walkers have two laws: never retrace your steps, and never take a side passage that skips a marker. A marker at the end of a dead corridor (the Blind Chasm, the Salt Basin, the Sands of Thirst) is a trap. Six markers, in the order your pencil meets them.',
          'Let us find the first marker together. From the North Portal, at the top left of the sheet, the gorge runs to the right along the top before it winds down. Follow it without turning back: the first stone pile your pencil meets is M. Then keep going the same way.'
        ]
      });
      let walkedPathCoords = [[1, 0]];
      let isWalking = false;

      function renderMazeSvg() {
        if (!svgMaze) return;
        const cellW = 1060 / 25;
        const cellH = 1060 / 25;

        let svgHtml = `
          <defs>
            <radialGradient id="mazeHermesGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffe099" stop-opacity="0.9" />
              <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.5" />
              <stop offset="100%" stop-color="transparent" stop-opacity="0" />
            </radialGradient>
            <pattern id="chasmRockHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#3d2a1b" stroke-width="1.2" />
            </pattern>
          </defs>

          <!-- Sandstone Basin Floor -->
          <rect x="0" y="0" width="1060" height="1060" fill="#130e0a" />
        `;

        // Draw maze walls
        for (let r = 0; r < 25; r++) {
          for (let c = 0; c < 25; c++) {
            if (MAZE_WALLS[r][c] === '1') {
              const x = c * cellW;
              const y = r * cellH;
              svgHtml += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="#251a11" stroke="#3a2a1c" stroke-width="0.8" />`;
              svgHtml += `<rect x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${cellH - 4}" fill="url(#chasmRockHatch)" opacity="0.65" />`;
            }
          }
        }

        // Entrance Portal (Row 1, Col 0)
        svgHtml += `
          <g transform="translate(4, ${1.5 * cellH})">
            <rect x="0" y="-12" width="75" height="24" rx="4" fill="#1e140a" stroke="#22c55e" stroke-width="1.2" />
            <text x="37" y="4" text-anchor="middle" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#86efac">PORTAL · IN</text>
          </g>
        `;

        // Exit Portal (Row 23, Col 24)
        svgHtml += `
          <g transform="translate(${24 * cellW - 20}, ${23.5 * cellH})">
            <rect x="0" y="-12" width="85" height="24" rx="4" fill="#0c2326" stroke="#38bdf8" stroke-width="1.2" />
            <text x="42" y="4" text-anchor="middle" font-family="'Cinzel', serif" font-size="9" font-weight="700" fill="#7dd3fc">OASIS · OUT</text>
          </g>
        `;

        // Hazard labels
        const hazards = [
          { text: "Sands of Thirst", r: 13, c: 23 },
          { text: "Blind Chasm", r: 23, c: 1 },
          { text: "Salt Basin", r: 23, c: 11 },
          { text: "Dry Well", r: 11, c: 1 }
        ];
        hazards.forEach(h => {
          const hx = (h.c + 0.5) * cellW;
          const hy = (h.r + 0.5) * cellH;
          svgHtml += `
            <text x="${hx}" y="${hy + 3}" text-anchor="middle" font-family="'Cinzel', serif" font-size="7" fill="#ef4444" opacity="0.85" filter="drop-shadow(0 1px 3px #000)">${h.text}</text>
          `;
        });

        // Footstep Trail Polyline
        const pointsStr = walkedPathCoords.map(([r, c]) => `${(c + 0.5) * cellW},${(r + 0.5) * cellH}`).join(' ');
        svgHtml += `<polyline id="chasm-svg-trail-line" points="${pointsStr}" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4, 3" stroke-linecap="round" stroke-linejoin="round" />`;

        // Cairns (True + Decoys)
        const allCairns = [...CAIRNS, ...DECOYS];
        allCairns.forEach(cairn => {
          const cx = (cairn.c + 0.5) * cellW;
          const cy = (cairn.r + 0.5) * cellH;
          const isTrue = 'step' in cairn;
          const isVisited = isTrue && cairn.step < chasmStepIndex;

          svgHtml += `
            <g class="chasm-cairn-svg-node" data-letter="${cairn.letter}" style="cursor: pointer;" aria-hidden="true" onclick="window.handleChasmCairnClick('${cairn.letter}')">
              <circle cx="${cx}" cy="${cy}" r="16" fill="${isVisited ? '#14532d' : '#1e140d'}" stroke="${isVisited ? '#22c55e' : '#d4a853'}" stroke-width="${isVisited ? '2' : '1.5'}" />
              <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="${isVisited ? '#86efac' : '#ffe099'}" stroke-width="0.8" stroke-dasharray="2, 3" />
              <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="'Cinzel', serif" font-size="13" font-weight="700" fill="${isVisited ? '#86efac' : '#ffe099'}">${cairn.letter}</text>
            </g>
          `;
        });

        // Hermes Explorer Token
        const currentPos = walkedPathCoords[walkedPathCoords.length - 1] || [1, 0];
        const hx = (currentPos[1] + 0.5) * cellW;
        const hy = (currentPos[0] + 0.5) * cellH;
        svgHtml += `
          <g id="chasm-hermes-token" transform="translate(${hx}, ${hy})">
            <circle class="hermes-beacon-ring" cx="0" cy="0" r="18" stroke="#fbbf24" stroke-width="1.8" fill="none" />
            <circle cx="0" cy="0" r="12" fill="url(#mazeHermesGlow)" />
            <circle cx="0" cy="0" r="8" fill="#180e07" stroke="#ffe099" stroke-width="1.5" />
            <text x="0" y="3" text-anchor="middle" font-size="9" fill="#fff">🚶</text>
          </g>
        `;

        svgMaze.innerHTML = svgHtml;
      }

      function updateKeypadButtons() {
        if (!keypadContainer) return;
        const cairnLetters = ['M', 'I', 'R', 'A', 'G', 'E', 'T', 'K', 'S'];
        keypadContainer.innerHTML = cairnLetters.map(letter => {
          const isVisitedTrue = CAIRNS.some(c => c.letter === letter && c.step < chasmStepIndex);
          return `
            <button type="button" class="chasm-cairn-btn ${isVisitedTrue ? 'visited' : ''}" data-letter="${letter}" ${isVisitedTrue || isWalking ? 'disabled' : ''} onclick="window.handleChasmCairnClick('${letter}')">
              <span>Marker</span>
              <strong>${letter}</strong>
            </button>
          `;
        }).join('');
      }

      function updatePassphraseSlots() {
        const letters = ['M', 'I', 'R', 'A', 'G', 'E'];
        for (let i = 0; i < 6; i++) {
          const slot = document.getElementById(`chasm-slot-${i}`);
          if (!slot) continue;
          const letterSpan = slot.querySelector('.slot-letter');
          if (i < chasmStepIndex) {
            slot.classList.add('filled');
            if (letterSpan) letterSpan.textContent = letters[i];
          } else {
            slot.classList.remove('filled');
            if (letterSpan) letterSpan.textContent = '';
          }
        }
        if (progressCount) {
          progressCount.textContent = `${chasmStepIndex} / 6 MARKERS`;
        }
      }

      function animateHermesWalk(pathCoords, onComplete) {
        isWalking = true;
        updateKeypadButtons();

        let step = 0;
        const cellW = 1060 / 25;
        const cellH = 1060 / 25;
        const token = document.getElementById('chasm-hermes-token');
        const trailLine = document.getElementById('chasm-svg-trail-line');

        const interval = setInterval(() => {
          if (step >= pathCoords.length) {
            clearInterval(interval);
            isWalking = false;
            updateKeypadButtons();
            if (typeof onComplete === 'function') onComplete();
            return;
          }

          const [r, c] = pathCoords[step];
          walkedPathCoords.push([r, c]);

          const x = (c + 0.5) * cellW;
          const y = (r + 0.5) * cellH;
          if (token) token.setAttribute('transform', `translate(${x}, ${y})`);
          if (trailLine) {
            const currentPoints = trailLine.getAttribute('points') || '';
            trailLine.setAttribute('points', `${currentPoints} ${x},${y}`);
          }

          step++;
        }, 35);
      }

      window.handleChasmCairnClick = function(letter) {
        if (isWalking) return;
        const isDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';
        if (isDone) return;

        const expectedLetter = ['M', 'I', 'R', 'A', 'G', 'E'][chasmStepIndex];

        // 1. Correct Next Letter in MIRAGE
        if (letter === expectedLetter) {
          if (sfx) sfx.playMechanicalClick();
          const targetCairn = CAIRNS[chasmStepIndex];
          const segmentKey = chasmStepIndex === 0 ? 'start_M' : `${CAIRNS[chasmStepIndex - 1].letter}_${expectedLetter}`;
          const segmentPoints = SEGMENTS[segmentKey] || [];

          animateHermesWalk(segmentPoints, () => {
            if (sfx) sfx.playChimeHover();
            chasmStepIndex++;
            updatePassphraseSlots();

            // Update telemetry
            const times = ['4h 30m', '3h 45m', '3h 00m', '2h 15m', '1h 30m', '45m', '0m'];
            if (telemTime) telemTime.textContent = times[chasmStepIndex];
            if (telemWaypoint) telemWaypoint.textContent = `Marker ${letter}`;

            // Update dispatch
            if (dispatchText) dispatchText.textContent = `"${targetCairn.dispatch}"`;

            renderMazeSvg();
            updateKeypadButtons();

            // If all 6 cairns discovered, walk to the Oasis exit!
            if (chasmStepIndex === 6) {
              setTimeout(() => {
                const exitPoints = SEGMENTS['E_exit'] || [];
                animateHermesWalk(exitPoints, () => {
                  if (sfx) sfx.playCelestialChime();
                  if (telemTime) telemTime.textContent = '0h 00m';
                  if (telemWaypoint) telemWaypoint.textContent = 'Salt Playa Edge (Arrived)';
                  if (dispatchText) {
                    dispatchText.textContent = '"Silvia, we made it out of the gorge! The cliffs fall away and a blinding white salt basin, the Salt Playa, stretches ahead. Far beyond it I can see the ruins of an old nomad camp, but the crust is riddled with brine sinkholes... Open Sheet 10A of your journal: The Salt Playa!"';
                  }
                  if (victoryCard) victoryCard.style.display = 'block';

                  try {
                    localStorage.setItem('order_whispering_chasm_completed', 'true');
                    localStorage.setItem('order_desert_station_active', '11');
                  } catch (e) {}
                  chasmHints.refresh();

                  updateDesertMapMarkers();
                  if (typeof window.selectMapNode === 'function') {
                    window.selectMapNode(11, false);
                  }
                });
              }, 400);
            }
          });
          return;
        }

        // 2. Decoy Cairn (T, K, S)
        const decoy = DECOYS.find(d => d.letter === letter);
        if (decoy) {
          if (sfx) sfx.playMechanicalClick();
          const btn = document.querySelector(`.chasm-cairn-btn[data-letter="${letter}"]`);
          if (btn) {
            btn.classList.add('decoy-hit');
            setTimeout(() => btn.classList.remove('decoy-hit'), 1200);
          }
          if (dispatchText) dispatchText.textContent = `"${decoy.text}"`;
          chasmHints.fail();
          return;
        }

        // 3. Out of Order True Cairn
        const trueCairn = CAIRNS.find(c => c.letter === letter);
        if (trueCairn) {
          if (sfx) sfx.playMechanicalClick();
          if (dispatchText) {
            dispatchText.textContent = `"Hold on, Silvia! That marker skips ahead. The Law of the Canyon Walkers requires discovering the sacred runes in strict sequence. Which marker comes next in the word?"`;
          }
          chasmHints.fail();
        }
      };

      function resetChasmDescent() {
        if (sfx) sfx.playMechanicalClick();
        chasmStepIndex = 0;
        walkedPathCoords = [[1, 0]];
        isWalking = false;

        if (telemTime) telemTime.textContent = '4h 30m';
        if (telemCanteen) telemCanteen.textContent = '3 / 3 Skins';
        if (telemWaypoint) telemWaypoint.textContent = 'North Portal';
        if (victoryCard) victoryCard.style.display = 'none';

        if (dispatchText) {
          dispatchText.textContent = '"Silvia, I\'m standing at the North Portal of the Whispering Chasm. The canyon splits ahead. Which stone marker do your notes indicate first?"';
        }

        updatePassphraseSlots();
        renderMazeSvg();
        updateKeypadButtons();
      }

      function openWhisperingChasmModal() {
        const isCairnDone = localStorage.getItem('order_cairn1_completed') === 'true';
        const isCairnBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
        const isDawnDone = parseInt(localStorage.getItem('order_dawn_step') || '0', 10) >= 3;
        const isChasmUnlocked = isCairnDone || isCairnBypassed || isDawnDone;
        const isChasmAlreadyDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';
        const isTester = (typeof window.isAdminTester === 'function' && window.isAdminTester()) || (typeof isCarlesTester === 'function' && isCarlesTester());

        if (!isChasmUnlocked && !isChasmAlreadyDone && !isTester) {
          if (typeof window.showDesertToast === 'function') {
            window.showDesertToast('✦ BASECAMP · WATCHTOWER VI ✦ Consult Hermes on the Field Wire to survey the canyon threshold.');
          }
          if (typeof activateHubView === 'function') activateHubView('view-field-wire');
          return;
        }

        const marchOver = typeof window.isChasmMarchOver === 'function' ? window.isChasmMarchOver() : true;
        if (!marchOver && !isChasmAlreadyDone && !isTester) {
          if (typeof window.showDesertToast === 'function') {
            window.showDesertToast('✦ 26-HOUR TREK IN PROGRESS ✦ Hermes is trekking across the scree slopes to the North Portal. Check the Field Wire for live ETA.');
          }
          return;
        }

        if (typeof window.isChasmCamped === 'function' && window.isChasmCamped()) {
          if (typeof window.showDesertToast === 'function') window.showDesertToast('✦ CAMP AT THE NORTH PORTAL ✦ Hermes is resting at the mouth of the canyon. The wind inside is too strong tonight. He will call you on the Field Wire as soon as he can go in.');
          return;
        }

        if (sfx) sfx.playMechanicalClick();
        if (!modal) return;
        modal.style.display = 'flex';
        modal.classList.remove('closing');

        const isDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';
        if (isDone) {
          chasmStepIndex = 6;
          // Render full walked path
          walkedPathCoords = [
            ...SEGMENTS['start_M'],
            ...SEGMENTS['M_I'],
            ...SEGMENTS['I_R'],
            ...SEGMENTS['R_A'],
            ...SEGMENTS['A_G'],
            ...SEGMENTS['G_E'],
            ...SEGMENTS['E_exit']
          ];
          if (telemTime) telemTime.textContent = '0h 00m';
          if (telemWaypoint) telemWaypoint.textContent = 'Salt Playa Edge (Arrived)';
          if (victoryCard) victoryCard.style.display = 'block';
          if (dispatchText) {
            dispatchText.textContent = '"Silvia, we made it out of the gorge! The cliffs fall away and a blinding white salt basin, the Salt Playa, stretches ahead. Far beyond it I can see the ruins of an old nomad camp, but the crust is riddled with brine sinkholes... Open Sheet 10A of your journal: The Salt Playa!"';
          }
        } else {
          if (chasmStepIndex === 0) {
            resetChasmDescent();
          }
        }

        updatePassphraseSlots();
        renderMazeSvg();
        updateKeypadButtons();
      }

      function closeWhisperingChasmModal() {
        if (sfx) sfx.playMechanicalClick();
        if (!modal) return;
        modal.classList.add('closing');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('closing');
        }, 220);
      }

      window.openWhisperingChasmModal = openWhisperingChasmModal;
      window.closeWhisperingChasmModal = closeWhisperingChasmModal;

      if (btnClose) btnClose.addEventListener('click', closeWhisperingChasmModal);
      if (btnReset) btnReset.addEventListener('click', resetChasmDescent);
      if (btnFinish) {
        btnFinish.addEventListener('click', () => {
          closeWhisperingChasmModal();
          switchMapPath('desert', true);
        });
      }

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeWhisperingChasmModal();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
          closeWhisperingChasmModal();
        }
      });

      // Initial Path Evaluation on load:
      // Silvia: desert once Station 09 / storm / desert unlock is live (shows Transceiver Offline).
      // Carles: only if saved/forced desert (tester keeps free path choice).
      const wireDone = localStorage.getItem('order_field_wire_completed') === 'true';
      const desertUnlocked = localStorage.getItem('order_desert_path_unlocked') === 'true';
      const sandstormLive =
        localStorage.getItem('order_sandstorm_active') === 'true' ||
        localStorage.getItem('seeker_silvia_sandstorm_active') === 'true';
      const cipherDone =
        typeof window.getSeekerCipherCompleted === 'function'
          ? window.getSeekerCipherCompleted()
          : localStorage.getItem('order_cipher_completed') === 'true';
      const activeSeeker = (window.currentSeeker || localStorage.getItem('the_eclipse_active_seeker') || 'Silvia');
      const isCarles = activeSeeker.toLowerCase() === 'carles';
      const urlParams = new URLSearchParams(window.location.search);
      const forceDesert = urlParams.get('path') === 'desert';
      const silviaDesertLive = !isCarles && (wireDone || desertUnlocked || sandstormLive || cipherDone);
      const stageOpen = localStorage.getItem('order_oracle_horizon_completed') === 'true';
      if (urlParams.get('path') === 'stage' && stageOpen) {
        switchMapPath('stage', true);
      } else if (currentMapPath === 'stage' || (stageOpen && !isCarles && !forceDesert)) {
        switchMapPath('stage', true);
      } else if (forceDesert || currentMapPath === 'desert' || silviaDesertLive) {
        switchMapPath('desert', true);
      } else {
        switchMapPath('constellation', false);
      }

    })();
