
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
          showDesertToast('Station ' + st.station + ' · ' + st.room + ': its door opens with the seal on ' + window.EclipseSheetSeals.page(node) + '. Scan it with your camera.');
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
      window.getNextDesertNodeId = getNextDesertNodeId;

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

          if ((isChasmUnlocked && marchOver) || isChasmAlreadyDone || isTester) {
            if (window.openWhisperingChasmModal) {
              window.openWhisperingChasmModal();
            } else {
              showDesertToast('Station 10: The Whispering Chasm · Open the page “The Whispering Chasm” of your journal.');
            }
          } else if (!isChasmUnlocked) {
            showDesertToast('✦ BASECAMP · WATCHTOWER VI ✦ Hermes is at Watchtower VI. Open the Field Wire to review his dawn dispatch.');
          } else if (!marchOver) {
            showDesertToast(typeof window.isChasmCamped === 'function' && window.isChasmCamped()
              ? '✦ CAMP BY THE NORTH PORTAL ✦ Hermes is resting before the descent. He will call you on the Field Wire when he is ready.'
              : '✦ 26-HOUR TREK IN PROGRESS ✦ Hermes is trekking toward the North Portal. Follow his beacon on the map.');
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
            showDesertToast('Station 11: The Salt Playa · Open the page “The Salt Playa (Dry Basin)” of your journal.');
          }
        } else if (targetId === 11) {
          window.selectMapNode(11, true);
          if (window.openDesertLexiconModal) {
            window.openDesertLexiconModal();
          } else {
            showDesertToast('Station 12: The Desert Lexicon & Al-Qibla · Open its page in your journal.');
          }
        } else if (targetId === 12) {
          window.selectMapNode(12, true);
          if (window.openOasisClepsydraModal) {
            window.openOasisClepsydraModal();
          } else {
            showDesertToast('Station 13: The Oasis Clepsydra · Open its page in your journal.');
          }
        } else if (targetId === 23) {
          window.selectMapNode(23, true);
          if (window.openSunMonolithModal) window.openSunMonolithModal();
          else showDesertToast('Station 14: The Sun Monolith · Open the page “The Sun Monolith & Cairn II” of your journal.');
        } else if (targetId === 24) {
          window.selectMapNode(24, true);
          if (window.openLabyrinthModal) window.openLabyrinthModal();
          else showDesertToast('Station 15: The Sandstone Labyrinth · Open the page “The Sandstone Labyrinth & Cairn III” of your journal.');
        } else if (targetId === 25) {
          window.selectMapNode(25, true);
          if (window.openCairnFourModal) window.openCairnFourModal();
          else showDesertToast('Station 16: Cairn IV, Sentry of the Canyon · Open its page in your journal.');
        } else if (targetId === 26) {
          window.selectMapNode(26, true);
          if (window.openSolsticeModal) window.openSolsticeModal();
          else showDesertToast('Station 17: The Arch of the Solstice · Open the page “Arch of the Solstice & The Solar Altar” of your journal.');
        } else if (targetId === 13) {
          window.selectMapNode(13, true);
          if (window.openSteleModal) window.openSteleModal();
          else showDesertToast('Station 18: The Polybius Stele (Tower II atrium) · Open its page in your journal.');
        } else if (targetId === 14) {
          window.selectMapNode(14, true);
          if (window.openOracleModal) window.openOracleModal();
          else showDesertToast('Station 19: Tower II · The Sandstone Sanctuary of the Desert Oracle · Open the page “The Oracle\'s Horizon” of your journal.');
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

      // 2. The Whispering Chasm itself lives in hub/js/stations/s10-whispering-chasm.js (the walk behind Hermes)

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
