    (function () {
      'use strict';

      // A game window covers the whole hub. While one is open, everything painted behind it (the 3D map, the star canvas
      // and the hub's CSS animations) stands still, so the game keeps the whole GPU and holds a steady frame rate.
      (function watchGameWindows() {
        // (an older browser without :has() falls back to the three 3D game windows by id: nothing here may ever stop the Hub from loading)
        const find = () => {
          try { return [...document.querySelectorAll('.chasm-modal-backdrop:has(.chasm3d-window), .monolith-modal-backdrop, .clepsydra-modal-backdrop')]; }
          catch (e) { return ['modal-whispering-chasm', 'modal-salt-playa', 'modal-desert-lexicon'].map((id) => document.getElementById(id)).filter(Boolean); }
        };
        const sync = () => {
          const open = find().some((m) => m.style.display && m.style.display !== 'none');
          window.__eclipseGameOpen = open;
          document.documentElement.classList.toggle('game-open', open);
        };
        const start = () => {
          try {
            const mo = new MutationObserver(sync);
            find().forEach((m) => mo.observe(m, { attributes: true, attributeFilter: ['style'] }));
            sync();
          } catch (e) {}
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
      })();

      // 1. Tactile Audio Synthesizer (Web Audio API)
      class TactileSound {
        constructor() {
          this.ctx = null;
        }

        init() {
          if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
          }
          if (this.ctx.state === 'suspended') this.ctx.resume();
        }

        // Sounds can be switched off inside The Cliffside Workshop
        _muted() {
          return window.hubChatMuted === true && document.body.getAttribute('data-active-view') === 'view-field-wire';
        }

        // Short telegraph burst (dit dit dah) when a new dispatch from Hermes starts to arrive
        playTelegraphArrival() {
          if (this._muted()) return;
          try {
            this.init();
            const start = this.ctx.currentTime;
            [[0, 0.06], [0.1, 0.06], [0.2, 0.17]].forEach(([offset, length]) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(640, start + offset);
              gain.gain.setValueAtTime(0.0001, start + offset);
              gain.gain.exponentialRampToValueAtTime(0.045, start + offset + 0.008);
              gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + length);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(start + offset);
              osc.stop(start + offset + length + 0.02);
            });
          } catch(e) {}
        }

        playMechanicalClick() {
          if (this._muted()) return;
          try {
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.04);
          } catch(e) {}
        }

        playStoneLift() {
          if (this._muted()) return;
          try {
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(280, now);
            filter.frequency.exponentialRampToValueAtTime(140, now + 0.08);
            filter.Q.setValueAtTime(1.5, now);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(95, now);
            osc.frequency.linearRampToValueAtTime(160, now + 0.03);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
          } catch(e) {}
        }

        playStoneThud(size = 2) {
          if (this._muted()) return;
          try {
            this.init();
            const now = this.ctx.currentTime;
            const sNum = Number(size) || 2;
            const baseFreq = sNum === 4 ? 65 : sNum === 3 ? 85 : sNum === 2 ? 115 : 150;
            
            // Deep low-frequency rock body thud
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq * 1.6, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.12);

            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.14);

            // Snappy stone-contact click
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'sine';
            clickOsc.frequency.setValueAtTime(360, now);
            clickOsc.frequency.exponentialRampToValueAtTime(110, now + 0.03);
            clickGain.gain.setValueAtTime(0.09, now);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
            clickOsc.connect(clickGain);
            clickGain.connect(this.ctx.destination);
            clickOsc.start(now);
            clickOsc.stop(now + 0.04);
          } catch(e) {}
        }

        playChimeHover() {
          if (this._muted()) return;
          try {
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08);

            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.13);
          } catch(e) {}
        }

        playCelestialChime() {
          if (this._muted()) return;
          try {
            this.init();
            const now = this.ctx.currentTime;
            const freqs = [293.66, 369.99, 440.00, 587.33, 739.99, 880.00];
            freqs.forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              const noteTime = now + (idx * 0.08);

              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, noteTime);

              gain.gain.setValueAtTime(0, noteTime);
              gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.04);
              gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.2);

              osc.connect(gain);
              gain.connect(this.ctx.destination);

              osc.start(noteTime);
              osc.stop(noteTime + 2.25);
            });
          } catch(e) {}
        }
      }

      const sfx = new TactileSound();
      window.sfx = sfx;
      try {
        localStorage.setItem('order_hub_unlocked', 'true');
        localStorage.setItem('order_hub_unlocked_v4', 'true');
      } catch (e) {}

      // Collapsible Hub Navigation Sidebar Controller
      const hubSidebar = document.querySelector('.hub-sidebar');
      const btnSidebarCollapse = document.getElementById('btn-sidebar-collapse');
      const btnSidebarOpen = document.getElementById('btn-sidebar-open');

      function setSidebarCollapsed(collapsed) {
        if (!hubSidebar) return;
        if (collapsed) {
          hubSidebar.classList.add('collapsed');
          try { localStorage.setItem('hub_sidebar_collapsed', 'true'); } catch (e) {}
        } else {
          hubSidebar.classList.remove('collapsed');
          try { localStorage.setItem('hub_sidebar_collapsed', 'false'); } catch (e) {}
        }
      }

      if (btnSidebarCollapse) {
        btnSidebarCollapse.addEventListener('click', () => {
          sfx.playMechanicalClick();
          setSidebarCollapsed(true);
        });
      }

      if (btnSidebarOpen) {
        btnSidebarOpen.addEventListener('click', () => {
          sfx.playMechanicalClick();
          setSidebarCollapsed(false);
        });
      }

      try {
        if (localStorage.getItem('hub_sidebar_collapsed') === 'true') {
          setSidebarCollapsed(true);
        }
      } catch (e) {}

      // 2. Navigation Menu Switching (Sidebar) & View Management
      const navButtons = document.querySelectorAll('.nav-menu-btn');
      const viewSections = document.querySelectorAll('.hub-view-section');

      // 2B. Transmission Logs Menu & On-Demand Single Relay Controller
      const txLogCards = document.querySelectorAll('.tx-log-card');
      const txLaunchBtns = document.querySelectorAll('.btn-launch-decoder');
      const txMenuView = document.getElementById('tx-logs-menu-view');
      const txSinglePlayerView = document.getElementById('tx-single-player-view');
      const txEmbeddedFrame = document.getElementById('transmissions-embedded-frame');
      const btnBackToTxLogs = document.getElementById('btn-back-to-tx-logs');
      const btnTxChronicleQuest = document.getElementById('btn-tx-chronicle-quest');
      const btnTxQuestIcon = document.getElementById('btn-tx-quest-icon');
      const btnTxQuestText = document.getElementById('btn-tx-quest-text');
      const txCurrentCarrierTag = document.getElementById('tx-current-carrier-tag');
      const txCurrentTitle = document.getElementById('tx-current-title');
      const txFrameWrap = document.getElementById('tx-frame-wrap');

      const txMetaInfo = [
        {
          carrier: 'RELAY 01 ACTIVE',
          title: '01 · The Stolen Astrolabe (Observatory Under Attack)',
          gameUrl: './constellation/celestial-flower-2/index.html',
          gameTitle: 'Inspect The Observatory Raid ➔',
          gameIcon: '⚔️'
        },
        {
          carrier: 'RELAY 02 ACTIVE',
          title: '02 · Voices in the Dunes (Southern Erg Outpost)',
          gameUrl: null
        },
        {
          carrier: 'RELAY 03 ACTIVE',
          title: '03 · Harmonic Relief (Sandstone Dunes Vector)',
          gameUrl: './constellation/celestial-matrix/index.html',
          gameTitle: 'Inspect The Celestial Matrix ➔',
          gameIcon: '🏛️'
        }
      ];

      function returnToTxLogsMenu() {
        if (txFrameWrap) {
          txFrameWrap.classList.remove('loaded');
          txFrameWrap.classList.add('loading');
        }
        // Unload iframe completely to release all video, audio, and canvas memory/GPU
        if (txEmbeddedFrame && txEmbeddedFrame.src && !txEmbeddedFrame.src.endsWith('about:blank')) {
          txEmbeddedFrame.src = 'about:blank';
        }
        if (btnTxChronicleQuest) {
          btnTxChronicleQuest.style.display = 'none';
        }
        if (txSinglePlayerView) txSinglePlayerView.style.display = 'none';
        if (txMenuView) txMenuView.style.display = 'flex';
      }

      function openSingleTransmission(idx) {
        if (sfx) sfx.playMechanicalClick();
        if (txMenuView) txMenuView.style.display = 'none';
        if (txSinglePlayerView) txSinglePlayerView.style.display = 'flex';

        const meta = txMetaInfo[idx] || txMetaInfo[0];
        if (txCurrentCarrierTag) txCurrentCarrierTag.textContent = meta.carrier;
        if (txCurrentTitle) txCurrentTitle.textContent = meta.title;

        // Configure "Go to Game" button for Transmissions 1 and 3 (top-left)
        if (btnTxChronicleQuest) {
          if (meta.gameUrl) {
            btnTxChronicleQuest.style.display = 'inline-flex';
            btnTxChronicleQuest.href = meta.gameUrl;
            if (btnTxQuestIcon) btnTxQuestIcon.textContent = meta.gameIcon || '✦';
            if (btnTxQuestText) btnTxQuestText.textContent = meta.gameTitle || 'Inspect Game Chronicles ➔';
          } else {
            btnTxChronicleQuest.style.display = 'none';
          }
        }

        // Reset skeleton to loading state
        if (txFrameWrap) {
          txFrameWrap.classList.remove('loaded');
          txFrameWrap.classList.add('loading');
        }

        // Dynamically load ONLY this single transmission
        if (txEmbeddedFrame) {
          let hasLoaded = false;
          const markLoaded = () => {
            if (hasLoaded) return;
            hasLoaded = true;
            if (txFrameWrap) {
              txFrameWrap.classList.remove('loading');
              txFrameWrap.classList.add('loaded');
            }
          };
          txEmbeddedFrame.onload = () => {
            setTimeout(markLoaded, 250);
          };
          // Fail-safe: After 1.2s, dismiss skeleton so content is never blocked
          setTimeout(markLoaded, 1200);
          txEmbeddedFrame.src = `./constellation/radio-transmission/index.html?embedded=true&single=${idx}`;
        }
      }

      // Last view the player was on before the current one (the chat button uses it to go back)
      let previousHubView = 'view-trail';
      window.getPreviousHubView = () => previousHubView;

      function activateHubView(targetView) {
        if (targetView === 'view-cipher' && typeof window.refreshLedgerUnlocks === 'function') window.refreshLedgerUnlocks();
        const isCarles = (currentSeeker || 'Silvia').toLowerCase() === 'carles';
        const isCipherCompleted = getSeekerCipherCompleted();

        // Access guard: The Brass Astrolabe is strictly for Carles (sandbox/dev)
        if (targetView === 'view-astrolabe' && !isCarles) {
          targetView = 'view-trail';
        }

        // Access guard: Silvia accesses Cliffside Workshop after Game 9, Desert Path unlocked, or during wire
        const isWireUnlocked = isCipherCompleted ||
                               localStorage.getItem('order_desert_path_unlocked') === 'true' ||
                               localStorage.getItem('order_sandstorm_wire_unlocked') === 'true' ||
                               new URLSearchParams(window.location.search).get('wire') === '1' ||
                               window.forceWireAlert;
        if (targetView === 'view-field-wire' && !isCarles && !isWireUnlocked) {
          targetView = 'view-trail';
        }

        const viewBefore = document.body.getAttribute('data-active-view');
        if (viewBefore && viewBefore !== targetView) previousHubView = viewBefore;

        document.body.setAttribute('data-active-view', targetView);
        document.body.classList.toggle('constellation-trail', targetView === 'view-trail');
        navButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === targetView));
        viewSections.forEach(s => s.classList.toggle('active', s.id === targetView));

        const btnHeaderMessenger = document.getElementById('btn-header-messenger');
        if (btnHeaderMessenger) {
          const inWorkshop = targetView === 'view-field-wire';
          btnHeaderMessenger.classList.toggle('active', inWorkshop);
          btnHeaderMessenger.setAttribute('aria-pressed', inWorkshop ? 'true' : 'false');
          if (!btnHeaderMessenger.dataset.openTitle) btnHeaderMessenger.dataset.openTitle = btnHeaderMessenger.getAttribute('title') || '';
          btnHeaderMessenger.setAttribute('title', inWorkshop ? 'Close The Cliffside Workshop and go back' : btnHeaderMessenger.dataset.openTitle);
        }

        if (typeof window.resetStickyHeader === 'function') window.resetStickyHeader();
        if (targetView === 'view-trail' && typeof window.updateDawnMapLayer === 'function') window.updateDawnMapLayer();

        if (targetView === 'view-field-wire') {
          if (typeof syncSilviaWaypointBaseline === 'function') syncSilviaWaypointBaseline();
          if (typeof switchWireTab === 'function') switchWireTab('expedition');
          if (typeof renderWireExpedition === 'function') renderWireExpedition();
          if (typeof renderInquiriesGrid === 'function') renderInquiriesGrid();
          if (typeof markMessengerAsRead === 'function') markMessengerAsRead();
          if (typeof scrollChatToActivePrompt === 'function') scrollChatToActivePrompt(false);
        }

        // On-Demand Fast Loading & Ghost Skeleton: Archives Parchment
        if (targetView === 'view-archives') {
          const docImg = document.getElementById('doc-view-img');
          const imgFrame = document.getElementById('doc-image-frame');
          const activeDocKey = document.querySelector('.archive-item-card.active')?.getAttribute('data-doc') || 'doc1';
          const activeDoc = archiveDocs[activeDocKey];
          const targetSrc = activeDoc?.imgSrc || './assets/emails/email-01-parchment.webp';

          if (docImg) {
            if (!docImg.src || !docImg.src.endsWith(targetSrc.replace('./', ''))) {
              if (imgFrame) {
                imgFrame.classList.remove('loaded');
                imgFrame.classList.add('loading');
              }
              docImg.onload = () => {
                if (imgFrame) {
                  imgFrame.classList.remove('loading');
                  imgFrame.classList.add('loaded');
                }
              };
              docImg.src = targetSrc;
            } else if (docImg.complete && docImg.naturalWidth > 0) {
              if (imgFrame) {
                imgFrame.classList.remove('loading');
                imgFrame.classList.add('loaded');
              }
            }
          }

          // Pre-fetch active master plate in the background so lightbox opens with 0ms delay
          if (activeDoc && activeDoc.fullImgSrc) {
            const preImg = new Image();
            preImg.src = activeDoc.fullImgSrc;
          }
        }

        // Clean-up or ensure transmission menu readiness
        if (targetView !== 'view-transmissions') {
          returnToTxLogsMenu();
        } else {
          // If entering transmissions view without an active iframe running, make sure the cards are visible
          if (!txEmbeddedFrame || !txEmbeddedFrame.src || txEmbeddedFrame.src.endsWith('about:blank')) {
            returnToTxLogsMenu();
          }
        }
      }
      window.activateHubView = activateHubView;

      // Nav menu button click handlers
      navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (sfx) sfx.playMechanicalClick();
          const targetView = btn.getAttribute('data-view');
          if (targetView === 'view-transmissions') {
            // Clicking Transmissions from the menu always returns to the dossier cards view
            returnToTxLogsMenu();
          }
          activateHubView(targetView);
        });
      });

      // Handle URL hash and query params on load, hashchange, or pageshow
      function handleHubUrlHash() {
        const hash = (window.location.hash || '').replace('#', '').trim();
        const params = new URLSearchParams(window.location.search);
        const queryView = params.get('view');
        const queryTx = params.get('tx') || params.get('single') || params.get('relay');

        // Check if targeting a specific transmission directly
        let targetTxIndex = null;
        if (hash === 'transmission-1' || hash === 'tx-1' || hash === 'relay-1' || queryTx === '0' || (queryTx === '1' && params.has('single'))) {
          targetTxIndex = 0;
        } else if (hash === 'transmission-2' || hash === 'tx-2' || hash === 'relay-2' || queryTx === '1' || (queryTx === '2' && params.has('single'))) {
          targetTxIndex = 1;
        } else if (hash === 'transmission-3' || hash === 'tx-3' || hash === 'relay-3' || queryTx === '2' || (queryTx === '3' && params.has('single'))) {
          targetTxIndex = 2;
        }

        if (targetTxIndex !== null) {
          activateHubView('view-transmissions');
          openSingleTransmission(targetTxIndex);
          return;
        }

        // Routing for views
        const targetViewId = hash || queryView;
        if (targetViewId && document.getElementById(targetViewId)) {
          activateHubView(targetViewId);
        } else if (targetViewId === 'transmissions') {
          activateHubView('view-transmissions');
        } else if (targetViewId === 'chronicles') {
          activateHubView('view-chronicles');
        } else if (targetViewId === 'archives') {
          activateHubView('view-archives');
        } else if (targetViewId === 'trail' || targetViewId === 'map') {
          activateHubView('view-trail');
        } else if (targetViewId === 'cipher') {
          activateHubView('view-cipher');
        } else if (targetViewId === 'wire' || targetViewId === 'teletype' || targetViewId === 'field-wire' || targetViewId === 'messenger' || targetViewId === 'chat' || targetViewId === 'camp-messenger' || targetViewId === 'workshop' || targetViewId === 'cliffside-workshop') {
          activateHubView('view-field-wire');
        } else if (targetViewId === 'astrolabe' || targetViewId === 'brass-astrolabe') {
          activateHubView('view-astrolabe');
        }
      }

      // Event listeners for transmission cards
      txLogCards.forEach(card => {
        card.addEventListener('click', (e) => {
          const href = card.getAttribute('data-tx-href');
          if (href) {
            if (e.target.closest('a')) return;
            window.location.href = href;
            return;
          }
          const idx = parseInt(card.getAttribute('data-tx-index'), 10) || 0;
          openSingleTransmission(idx);
        });
      });

      // Individual launch buttons
      txLaunchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = btn.closest('.tx-log-card');
          if (card && card.getAttribute('data-tx-href')) return;
          e.stopPropagation();
          const idx = card ? parseInt(card.getAttribute('data-tx-index'), 10) || 0 : 0;
          openSingleTransmission(idx);
        });
      });

      // =====================================================================
      // SEEKER AUTHENTICATION & PROGRESSION ENGINE (SILVIA & CARLES)
      // =====================================================================
      const VALID_ACCOUNTS = {
        'silvia': { name: 'Silvia', pass: 'Silvia', role: 'Seeker' },
        'carles': { name: 'Carles', pass: 'Carles', role: '' }
      };

      // Active Seeker State — sticky across F5 / navigation.
      // The saved profile in localStorage ALWAYS wins on reload.
      // The ONLY way to change it is Switch Seeker → successful gate login.
      const isLocalHost = window.location.protocol === 'file:' ||
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';

      function normalizeSeekerName(raw) {
        const k = String(raw || '').trim().toLowerCase();
        if (k === 'carles') return 'Carles';
        if (k === 'silvia') return 'Silvia';
        return null;
      }

      function persistActiveSeeker(name) {
        const normalized = normalizeSeekerName(name) || 'Silvia';
        const previous = normalizeSeekerName(localStorage.getItem('the_eclipse_active_seeker'));
        if (previous && previous !== normalized && window.EclipseProfiles) {
          try { window.EclipseProfiles.swap(previous, normalized); } catch (e) {}   // each seeker keeps their own adventure
        }
        currentSeeker = normalized;
        window.currentSeeker = normalized;
        try { localStorage.setItem('the_eclipse_active_seeker', normalized); } catch (e) {}
        try { document.body.setAttribute('data-active-seeker', normalized.toLowerCase()); } catch (e) {}
        if (typeof syncWaypointBaseline === 'function') {
          syncWaypointBaseline();
        } else if (typeof syncSilviaWaypointBaseline === 'function') {
          syncSilviaWaypointBaseline();
        }
        return normalized;
      }
      window.persistActiveSeeker = persistActiveSeeker;

      // Reload / F5 (localhost AND Cloudflare): restore exact saved seeker.
      // Same rule everywhere — never infer Carles from environment.
      const savedSeeker = normalizeSeekerName(localStorage.getItem('the_eclipse_active_seeker'));
      let currentSeeker = savedSeeker || 'Silvia';
      persistActiveSeeker(currentSeeker);
      // Localhost convenience: skip the gate UI only. Profile still comes from localStorage.
      if (isLocalHost) {
        sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
      }

      function getSeekerKey(suffix) {
        const u = (currentSeeker || 'Silvia').toLowerCase();
        return `seeker_${u}_${suffix}`;
      }

      // Seeker progression defaults:
      // Both Silvia and Carles have completed Games 8–9 (Midnight Calibration + Celestial Cipher).
      // Silvia is in the live sandstorm era (Hermes wire → Watchtower VI / checkpoint 1).
      // Carles keeps tester controls + storm toggles; Silvia does not.
      const SUNDAY_OCT_18_2026_2PM = 1792324800000; // Sun 18 Oct 2026 14:00 CEST
      window.SUNDAY_OCT_18_2026_2PM = SUNDAY_OCT_18_2026_2PM;
      window.SATURDAY_OCT_17_2026_8PM = SUNDAY_OCT_18_2026_2PM; // legacy alias
      try {
        if (localStorage.getItem('seeker_carles_midnight_completed') === null) {
          localStorage.setItem('seeker_carles_midnight_completed', 'true');
        }
        if (localStorage.getItem('seeker_silvia_midnight_completed') === null) {
          localStorage.setItem('seeker_silvia_midnight_completed', 'true');
        }
        if (localStorage.getItem('seeker_carles_cipher_completed') === null) {
          localStorage.setItem('seeker_carles_cipher_completed', 'true');
        }
        if (localStorage.getItem('seeker_silvia_cipher_completed') === null) {
          localStorage.setItem('seeker_silvia_cipher_completed', 'true');
        }
      } catch (e) {}

      function getSeekerMidnightCompleted() {
        const u = (currentSeeker || 'Silvia').toLowerCase();
        const key = `seeker_${u}_midnight_completed`;
        const val = localStorage.getItem(key);
        if (val !== null) return val === 'true';
        // Both Silvia and Carles have completed Game 8
        return true;
      }

      function getSeekerCipherCompleted() {
        const u = (currentSeeker || 'Silvia').toLowerCase();
        const key = `seeker_${u}_cipher_completed`;
        const val = localStorage.getItem(key);
        if (val !== null) return val === 'true';
        // Both seekers are past Station 09 in the live timeline
        return true;
      }
      window.getSeekerCipherCompleted = getSeekerCipherCompleted;

      // Carles is the admin tester: every game opens at any time, in any order
      window.isAdminTester = function () {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('admin') === '1' || urlParams.get('carles') === '1' || urlParams.get('tester') === '1') return true;
        } catch (e) {}
        const u = String(
          (typeof window.currentSeeker !== 'undefined' && window.currentSeeker) ||
          currentSeeker ||
          localStorage.getItem('the_eclipse_active_seeker') ||
          'Silvia'
        ).toLowerCase();
        return u === 'carles';
      };

      // =====================================================================
      // TESTER CONTROLS (Carles only): the Desert Path as one ordered story line.
      // "Complete up to here" finishes a game and every game before it; "Replay from here" resets it and every game after it.
      // =====================================================================
      window.TesterDesert = (function () {
        const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
        const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
        const del = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
        const dels = (list) => list.forEach(del);
        // A reset game also takes its relic back out of the satchel (shared and per-seeker inventories)
        const dropRelic = (id) => {
          ['order_inventory_relics', 'seeker_silvia_inventory_relics', 'seeker_carles_inventory_relics'].forEach((key) => {
            let list = null;
            try { list = JSON.parse(get(key) || 'null'); } catch (e) { list = null; }
            if (Array.isArray(list) && list.includes(id)) set(key, JSON.stringify(list.filter((x) => x !== id)));
          });
        };

        const GAMES = [
          {
            id: 'cairn1', tag: 'Dawn', label: 'Cairn I · The Wash River Marker', flag: 'order_cairn1_completed', built: true,
            complete() { set('order_cairn1_completed', 'true'); set('order_cairn1_found', 'true'); set('order_seal_cairn_1', 'true'); set('order_dawn_step', '3'); del('order_cairn1_bypassed'); del('order_cairn1_locked_until_3_cairns'); },
            reset() { dels(['order_cairn1_completed', 'order_cairn1_found', 'order_seal_cairn_1', 'order_dawn_choices', 'order_cairn1_bypassed', 'order_cairn1_locked_until_3_cairns', 'order_cairn1_optimal', 'order_five_seals_celebrated', 'order_monolith_gate_seal1']); set('order_dawn_step', '0'); dropRelic('seal_cairn_1'); }
          },
          {
            id: 'chasm', tag: 'Station 10', label: 'The Whispering Chasm', flag: 'order_whispering_chasm_completed', built: true,
            complete() { set('order_whispering_chasm_completed', 'true'); set('order_desert_station_active', '11'); },
            reset() { dels(['order_whispering_chasm_completed', 'order_chasm_walk', 'order_chasm_howto', 'order_chasm_wire', 'order_playa_march_start', 'order_playa_march_bypassed']); }
          },
          {
            id: 'playa', tag: 'Station 11', label: 'The Salt Playa', flag: 'order_salt_playa_completed', built: true,
            complete() { set('order_salt_playa_completed', 'true'); set('order_salt_playa_path', JSON.stringify([3, 4, 3, 2, 2, 3, 3])); },
            reset() {   // its night at the Oasis Gate goes with the Chasm; its two calls on the wire (the North Edge, the south shore) go with it
              dels(['order_salt_playa_completed', 'order_salt_playa_path', 'order_playa_walk', 'order_playa_howto', 'order_playa_howto2', 'order_playa_cine_intro', 'order_playa_cine_outro', 'order_lexicon_march_start', 'order_lexicon_march_bypassed']);
              let w = null;
              try { w = JSON.parse(get('order_chasm_wire') || 'null'); } catch (e) { w = null; }
              if (w && typeof w === 'object') { ['seen2', 'reply2', 'seen3', 'reply3', 'seen4', 'reply4'].forEach((k) => delete w[k]); set('order_chasm_wire', JSON.stringify(w)); }
            }
          },
          {
            id: 'lexicon', tag: 'Station 12', label: 'The Desert Lexicon', flag: 'order_desert_lexicon_completed', built: true,
            complete() { set('order_desert_lexicon_completed', 'true'); set('order_desert_station_active', '12'); },
            reset() {   // Hermes calls again from the ruins at dusk (the walk there stays walked)
              dels(['order_desert_lexicon_completed', 'order_lexicon_solved_words', 'order_lexicon_walk', 'order_lexicon_howto', 'order_lexicon_cine_intro', 'order_lexicon_cine_outro']);
              let w = null;
              try { w = JSON.parse(get('order_chasm_wire') || 'null'); } catch (e) { w = null; }
              if (w && typeof w === 'object') { ['seen4', 'reply4'].forEach((k) => delete w[k]); set('order_chasm_wire', JSON.stringify(w)); }
            }
          },
          {
            id: 'clepsydra', tag: 'Station 13', label: 'The Oasis Clepsydra', flag: 'order_oasis_clepsydra_completed', built: true,
            complete() { set('order_oasis_clepsydra_completed', 'true'); },
            reset() { dels(['order_oasis_clepsydra_completed', 'order_clepsydra_matrix_state', 'order_clepsydra_clues_state', 'order_clepsydra_registry_selections']); }
          },
          {
            id: 's14', tag: 'Station 14', label: 'The Sun Monolith · Cairn II', flag: 'order_sun_monolith_completed', built: true,
            complete() { set('order_monolith_march_start', '1'); set('order_sun_monolith_awake', 'true'); set('order_sun_monolith_marks', '4'); set('order_sun_monolith_completed', 'true'); set('order_seal_cairn_2', 'true'); },
            reset() { dels(['order_sun_monolith_completed', 'order_sun_monolith_awake', 'order_sun_monolith_marks', 'order_monolith_key_fails', 'order_monolith_hint', 'order_monolith_sun_minute', 'order_seal_cairn_2', 'order_monolith_march_start', 'order_monolith_march_bypassed', 'order_monolith_gate_seal1', 'order_five_seals_celebrated']); }
          },
          {
            id: 's15', tag: 'Station 15', label: 'The Sandstone Labyrinth · Cairn III', flag: 'order_sandstone_labyrinth_completed', built: true,
            complete() { set('order_labyrinth_march_start', '1'); set('order_labyrinth_awake', 'true'); set('order_labyrinth_star_seen', 'true'); set('order_labyrinth_camp_seen', 'true'); set('order_sandstone_labyrinth_completed', 'true'); set('order_seal_cairn_3', 'true'); },
            reset() { dels(['order_sandstone_labyrinth_completed', 'order_labyrinth_awake', 'order_labyrinth_key_fails', 'order_labyrinth_hint', 'order_labyrinth_captures', 'order_labyrinth_torch_hint', 'order_labyrinth_star_seen', 'order_labyrinth_camp_seen', 'order_seal_cairn_3', 'order_labyrinth_march_start', 'order_labyrinth_march_bypassed', 'order_five_seals_celebrated']); }
          },
          {
            id: 's16', tag: 'Station 16', label: 'Cairn IV · Sentry of the Canyon', flag: 'order_cairn_iv_completed', built: true,
            complete() { set('order_cairn4_march_start', '1'); set('order_cairn4_awake', 'true'); set('order_cairn4_verses', '3'); set('order_cairn_iv_completed', 'true'); set('order_seal_cairn_4', 'true'); },
            reset() { dels(['order_cairn_iv_completed', 'order_cairn4_awake', 'order_cairn4_verses', 'order_cairn4_key_fails', 'order_cairn4_hint', 'order_cairn4_song_fails', 'order_cairn4_count_hint', 'order_seal_cairn_4', 'order_cairn4_march_start', 'order_cairn4_march_bypassed', 'order_five_seals_celebrated']); dropRelic('tuning_pebble'); }
          },
          {
            id: 's17', tag: 'Station 17', label: 'The Arch of the Solstice · Cairn V', flag: 'order_arch_solstice_completed', built: true,
            complete() { set('order_cairn5_march_start', '1'); set('order_cairn5_awake', 'true'); set('order_cairn5_dawn_done', 'true'); set('order_cairn5_signal_round', '4'); set('order_arch_solstice_completed', 'true'); set('order_seal_cairn_5', 'true'); },
            reset() { dels(['order_arch_solstice_completed', 'order_cairn5_awake', 'order_cairn5_key_fails', 'order_cairn5_hint', 'order_cairn5_mirrors', 'order_cairn5_dawn_done', 'order_cairn5_dawn_fails', 'order_cairn5_dawn_hint', 'order_cairn5_signal_round', 'order_cairn5_signal_fails', 'order_cairn5_signal_hint', 'order_seal_cairn_5', 'order_cairn5_march_start', 'order_cairn5_march_bypassed', 'order_five_seals_celebrated', 'order_cairn5_seals_at_altar']); dropRelic('signal_mirror'); }
          },
          {
            id: 's18', tag: 'Station 18', label: 'The Polybius Stele · Tower II in Flames', flag: 'order_polybius_stele_completed', built: true,
            complete() { set('order_stele_march_start', '1'); set('order_stele_awake', 'true'); set('order_stele_knocks', '4'); set('order_polybius_stele_completed', 'true'); },
            reset() { dels(['order_polybius_stele_completed', 'order_stele_awake', 'order_stele_key_fails', 'order_stele_hint', 'order_stele_knocks', 'order_stele_knock_fails', 'order_stele_knock_hint', 'order_stele_fire_fails', 'order_stele_fire_hint', 'order_stele_march_start', 'order_stele_march_bypassed', 'order_stele_seals_at_well']); dropRelic('servant_key'); }
          },
          {
            id: 's19', tag: 'Station 19', label: "The Oracle's Horizon · Aurelia", flag: 'order_oracle_horizon_completed', built: true,
            complete() { set('order_oracle_stair_start', '1'); set('order_oracle_awake', 'true'); set('order_oracle_disc', '000'); set('order_oracle_when_read', 'true'); set('order_oracle_horizon_completed', 'true'); },
            reset() { dels(['order_oracle_horizon_completed', 'order_oracle_awake', 'order_oracle_key_fails', 'order_oracle_hint', 'order_oracle_disc', 'order_oracle_disc_turns', 'order_oracle_disc_hint', 'order_oracle_when_read', 'order_oracle_read_fails', 'order_oracle_vow_fails', 'order_oracle_vow_hint', 'order_oracle_stair_start', 'order_oracle_stair_bypassed', 'order_stage_passage_seen']); dropRelic('gilded_star'); }
          },
          {
            id: 's20', tag: 'Station 20', label: 'The Gate of a Thousand Masks · Tower III', flag: 'order_masks_gate_completed', built: true,
            complete() { set('order_masks_march_start', '1'); set('order_masks_gate_awake', 'true'); set('order_masks_carved', '3'); set('order_masks_gate_completed', 'true'); },
            reset() { dels(['order_masks_gate_completed', 'order_masks_gate_awake', 'order_masks_key_fails', 'order_masks_hint', 'order_masks_carved', 'order_masks_draw_fails', 'order_masks_draw_hint', 'order_masks_march_start', 'order_masks_march_bypassed', 'order_stage_mirror_seen', 'order_stage_pause_skipped_41', 'order_ashes_clues', 'order_speaker_line_41']); }
          },
          {
            id: 's21', tag: 'Station 21', label: 'The Camera Obscura · Tower III', flag: 'order_camera_obscura_completed', built: true,
            complete() { set('order_camera_obscura_found', JSON.stringify(['flag', 'cart', 'shutter', 'smoke'])); set('order_camera_obscura_completed', 'true'); },
            reset() { dels(['order_camera_obscura_completed', 'order_camera_obscura_fails', 'order_camera_obscura_found', 'order_stage_pause_skipped_42', 'order_speaker_line_42']); }
          },
          {
            id: 's22', tag: 'Station 22', label: 'The Whispering Gallery · Tower III', flag: 'order_whispering_gallery_completed', built: true,
            complete() { set('order_whispering_gallery_focus', 'true'); set('order_whispering_gallery_completed', 'true'); },
            reset() { dels(['order_whispering_gallery_completed', 'order_whispering_gallery_focus', 'order_stage_pause_skipped_43', 'order_speaker_line_43']); }
          }
        ];
        // A reset game also forgets the hints its puzzles had climbed to (hub/js/hint-ladder.js)
        const HINT_PREFIX = { cairn1: 'cairn1-', chasm: 's10-', playa: 's11-', lexicon: 's12-', clepsydra: 's13-' };
        GAMES.forEach((g) => {
          const reset = g.reset;
          if (!reset) return;
          g.reset = function () {
            reset.call(this);
            if (window.EclipseHints) window.EclipseHints.reset(HINT_PREFIX[g.id] || g.id + '-');
          };
        });

        const isDone = (id) => { const g = GAMES.find((x) => x.id === id); return !!(g && g.flag && get(g.flag) === 'true'); };

        // Where the Hermes chat should stand for the games that are done
        function syncWire(direction) {
          const a22 = isDone('s22'), a21 = isDone('s21'), a20 = isDone('s20'), a19 = isDone('s19'), a18 = isDone('s18'), a17 = isDone('s17'), c4 = isDone('s16'), lab = isDone('s15'), m = isDone('s14'), c = isDone('clepsydra'), l = isDone('lexicon'), ch = isDone('chasm'), p = isDone('playa'), k = isDone('cairn1');
          const floor = a22 ? 43 : a21 ? 39 : a20 ? 35 : a19 ? 31 : a18 ? 27 : a17 ? 23 : c4 ? 19 : lab ? 15 : m ? 11 : c ? 8 : l ? 6 : (ch || k || p) ? 4 : 0;
          const cap = a22 ? 44 : a21 ? 42 : a20 ? 38 : a19 ? 32 : a18 ? 30 : a17 ? 26 : c4 ? 22 : lab ? 18 : m ? 14 : c ? 10 : l ? 6 : 4;   // until the Lexicon is read, the chat stays on the road of the Chasm and the salt (step 4)
          let step = parseInt(get('order_field_wire_step') || '0', 10) || 0;
          step = direction === 'complete' ? Math.max(step, floor) : Math.min(step, cap);
          set('order_field_wire_step', String(step));
          dels(['order_messenger_unread_count', 'order_messenger_last_read_step']);
        }

        function indexOf(id) { return GAMES.findIndex((g) => g.id === id); }

        // Where the story stands the moment Hermes reaches each game: the Hermes chat step, the walk that
        // leads there (skipped for the tester) and the map node that opens the game.
        const ARRIVAL = {
          cairn1: { wire: 4, node: 22, dawn: 2 },
          chasm: { wire: 4, node: 10, walk: 'order_chasm_march_bypassed' },
          playa: { wire: 4, node: 21, walk: 'order_playa_march_bypassed' },
          lexicon: { wire: 4, node: 11, walk: 'order_lexicon_march_bypassed' },
          clepsydra: { wire: 6, node: 12 },
          s14: { wire: 10, node: 23, walk: 'order_monolith_march_bypassed' },
          s15: { wire: 14, node: 24, walk: 'order_labyrinth_march_bypassed' },
          s16: { wire: 18, node: 25, walk: 'order_cairn4_march_bypassed' },
          s17: { wire: 22, node: 26, walk: 'order_cairn5_march_bypassed' },
          s18: { wire: 26, node: 13, walk: 'order_stele_march_bypassed' },
          s19: { wire: 30, node: 14, walk: 'order_oracle_stair_bypassed' },
          s20: { wire: 34, node: 40, walk: 'order_masks_march_bypassed' },
          s21: { wire: 38, node: 41 },
          s22: { wire: 42, node: 42 }
        };
        const WALKS = ['order_chasm_march_bypassed', 'order_playa_march_bypassed', 'order_lexicon_march_bypassed', 'order_monolith_march_bypassed', 'order_labyrinth_march_bypassed', 'order_cairn4_march_bypassed', 'order_cairn5_march_bypassed', 'order_stele_march_bypassed', 'order_oracle_stair_bypassed', 'order_masks_march_bypassed'];

        // Puts the Hermes chat exactly at `step`: the replies before it are kept (first reply if none was saved)
        function setWire(step) {
          let hist = [];
          try { hist = JSON.parse(get('order_field_wire_choices') || '[]') || []; } catch (e) { hist = []; }
          if (!Array.isArray(hist)) hist = [];
          hist = hist.slice(0, step);
          while (hist.length < step) hist.push(0);
          [2, 0, 1, 0].forEach((v, i) => { if (i < step) hist[i] = v; });   // the storm replies are canon
          set('order_field_wire_step', String(step));
          set('order_field_wire_choices', JSON.stringify(hist));
          set('order_field_wire_completed', 'true');
          dels(['order_messenger_unread_count', 'order_messenger_last_read_step']);
        }

        return {
          games: GAMES,
          isDone,
          completeUpTo(id) {
            const idx = indexOf(id);
            for (let i = 0; i <= idx; i++) if (GAMES[i].built && !isDone(GAMES[i].id)) GAMES[i].complete();
            syncWire('complete');
          },
          replayFrom(id) {
            for (let i = indexOf(id); i < GAMES.length; i++) if (GAMES[i].reset) GAMES[i].reset();
            // First desert mission (Cairn I): wipe Hermes chat + expedition inventory so a tester
            // can replay the dawn/wire cleanly (items and dialogue stay in sync).
            if (id === 'cairn1') {
              dels([
                'order_field_wire_step', 'order_field_wire_choices', 'order_field_wire_completed',
                'order_dawn_step', 'order_dawn_choices',
                'order_satchel_expedition_item', 'order_inventory_relics',
                'order_messenger_unread_count', 'order_messenger_last_read_step',
                'order_cartographer_title', 'order_desert_station_active',
                'order_field_inquiries_read'
              ]);
            }
            syncWire('replay');
          },
          completeAll() {
            GAMES.forEach((g) => { if (g.built && !isDone(g.id)) g.complete(); });
            syncWire('complete');
          },
          // Every game before `id` done (with its rewards), `id` and every game after it unsolved, the walk to it
          // skipped, the chat at the moment Hermes arrives. Returns the map node that opens the game.
          jumpTo(id) {
            const idx = indexOf(id), arrival = ARRIVAL[id];
            if (idx < 0 || !arrival) return null;
            for (let i = 0; i < idx; i++) if (GAMES[i].built && !isDone(GAMES[i].id)) GAMES[i].complete();
            for (let i = idx; i < GAMES.length; i++) if (GAMES[i].reset) GAMES[i].reset();
            if (arrival.walk) set(arrival.walk, 'true');
            if (typeof arrival.dawn === 'number') {
              set('order_dawn_step', String(arrival.dawn));
              set('order_cairn1_found', 'true');
            }
            if (idx > indexOf('s14')) set('order_monolith_gate_seal1', String(get('order_seal_cairn_1') === 'true'));
            setWire(arrival.wire);
            return arrival.node;
          },
          skipWalks() { WALKS.forEach((k) => set(k, 'true')); },
          replayAll() {
            GAMES.forEach((g) => { if (g.reset) g.reset(); });
            dels(['order_field_wire_step', 'order_field_wire_choices', 'order_field_wire_completed', 'order_dawn_step', 'order_dawn_choices',
              'order_desert_station_active', 'order_messenger_unread_count', 'order_messenger_last_read_step',
              'order_satchel_expedition_item', 'order_inventory_relics', 'order_cartographer_title',
              'order_field_inquiries_read']);
          }
        };
      })();

      // No automatic tester reset here: each seeker's progress is packed into their own vault when the
      // profile changes (see window.EclipseProfiles), and Carles moves through the Desert Path by hand from the
      // tester controls (Play this game, Complete up to here, Skip every walk).

      // One-time Silvia live seed: Station 09 done · storm until Sat 17 20:00 · Hermes wire live · desert clean for checkpoint 1
      try {
        if (localStorage.getItem('order_silvia_live_v4') !== 'done') {
          localStorage.setItem('seeker_silvia_midnight_completed', 'true');
          localStorage.setItem('seeker_silvia_cipher_completed', 'true');
          localStorage.setItem('seeker_silvia_sandstorm_active', 'true');
          localStorage.setItem('order_midnight_completed', 'true');
          localStorage.setItem('order_cipher_completed', 'true');
          localStorage.setItem('order_sandstorm_triggered', 'true');
          localStorage.setItem('order_sandstorm_active', 'true');
          localStorage.setItem('order_sandstorm_target_time', String(SATURDAY_OCT_17_2026_8PM));
          // Canon 48h window ending Sat 17 20:00 → start Thu 15 Oct 2026 20:00 CEST
          localStorage.setItem('order_sandstorm_start_time', String(SATURDAY_OCT_17_2026_8PM - (48 * 60 * 60 * 1000)));
          localStorage.setItem('order_sandstorm_wire_unlocked', 'true');
          localStorage.removeItem('order_sandstorm_wire_answered');
          localStorage.setItem('order_desert_path_unlocked', 'true');
          if (window.TesterDesert && typeof window.TesterDesert.replayAll === 'function') {
            window.TesterDesert.replayAll();
          }
          localStorage.removeItem('order_field_inquiries_read');
          // Pending Hermes distress (badge "1") until she opens The Cliffside Workshop
          localStorage.removeItem('order_messenger_last_read_step');
          localStorage.setItem('order_messenger_unread_count', '1');
          localStorage.setItem('order_silvia_live_v4', 'done');
          localStorage.setItem('order_silvia_live_v3', 'done');
        }
        // Canonical Story Point (18 Oct 2026):
        // Both Silvia and Carles have crossed the Desert Frontier, weathered the storm, and reached Outer Watchtower VI.
        // Authentic choices during the storm:
        //   - Step 0: [2] "Loud and clear. I solved your celestial cipher at the southern cliff..."
        //   - Step 1: [0] "Call you Hermes..."
        //   - Step 2: [1] "Check the page “Field Log: The Desert Frontier”, Section III: The Three Cairns & The Copper Benchmark..."
        //   - Step 3: [0] "According to your notes on Sheet 7B, the benchmark plate points 112° East toward Outer Watchtower VI."
        //   - Satchel Item: "1998 Brass Surveyor's Compass" (trail-head benchmark below Watchtower VI)
        // Waypoint secured at Outer Watchtower VI (wire step 4).
        // The storm has ended. Dawn has broken (The Great Silence).
        // Hermes has sent his morning dispatch (Dawn Step 0).
        // Awaiting the seeker's first reply to the Three Laws of the Waste.
        function syncWaypointBaseline() {
          const seekerNow = (localStorage.getItem('the_eclipse_active_seeker') || (window.currentSeeker || 'Silvia')).toLowerCase();

          // Storm is officially over for both seekers across all devices
          localStorage.removeItem('order_sandstorm_active');
          localStorage.removeItem('seeker_silvia_sandstorm_active');
          localStorage.removeItem('seeker_carles_sandstorm_active');
          localStorage.setItem('order_storm_tester_bypassed', 'true');
          localStorage.setItem('order_desert_path_unlocked', 'true');
          localStorage.setItem('order_sandstorm_wire_unlocked', 'true');

          // Always ensure authentic choices for the 4 storm steps: [2, 0, 1, 0]
          localStorage.setItem('order_cartographer_title', 'Hermes');
          const compassItem = {
            id: "surveyor_compass",
            name: "1998 Brass Surveyor's Compass",
            icon: "🧭",
            desc: "Precision surveyor compass left in 1998 beside the copper benchmark at the foot of the Watchtower VI trail."
          };
          localStorage.setItem('order_satchel_expedition_item', JSON.stringify(compassItem));
          localStorage.setItem('seeker_silvia_satchel_expedition_item', JSON.stringify(compassItem));
          localStorage.setItem('seeker_carles_satchel_expedition_item', JSON.stringify(compassItem));

          // Ensure inventory has the compass in both general and profile-specific storage
          try {
            let relics = ['gilded_feather', 'order_wax_seal'];
            const rawRelics = localStorage.getItem('order_inventory_relics');
            if (rawRelics) {
              try { const p = JSON.parse(rawRelics); if (Array.isArray(p)) relics = p; } catch(e) {}
            }
            if (!relics.includes('surveyor_compass')) relics.push('surveyor_compass');
            localStorage.setItem('order_inventory_relics', JSON.stringify(relics));
            localStorage.setItem('seeker_silvia_inventory_relics', JSON.stringify(relics));
            localStorage.setItem('seeker_carles_inventory_relics', JSON.stringify(relics));
          } catch(e) {}

          // Waypoint baseline: both seekers are at step 4 (Outer Watchtower VI reached)
          // and Dawn Step 0 (awaiting first reply to Hermes's morning dispatch)
          const chasmCompleted = localStorage.getItem('order_whispering_chasm_completed') === 'true';
          if (!chasmCompleted) {
            const waypointDoneKey = `order_${seekerNow}_waypoint_v2`;
            if (localStorage.getItem(waypointDoneKey) !== 'done') {
              localStorage.setItem('order_field_wire_step', '4');
              localStorage.setItem('order_field_wire_completed', 'true');
              localStorage.setItem('order_field_wire_choices', JSON.stringify([2, 0, 1, 0]));
              localStorage.setItem('order_dawn_step', '0');
              localStorage.setItem('order_dawn_choices', '[]');
              localStorage.removeItem('order_cairn1_completed');
              localStorage.removeItem('order_cairn1_found');
              localStorage.removeItem('order_cairn1_bypassed');
              localStorage.removeItem('order_seal_cairn_1');
              localStorage.removeItem('order_cairn1_optimal');
              localStorage.removeItem('order_cairn1_locked_until_3_cairns');
              localStorage.removeItem('order_chasm_march_start');
              localStorage.removeItem('order_chasm_march_bypassed');
              localStorage.removeItem('order_playa_march_start');
              localStorage.removeItem('order_playa_march_bypassed');
              localStorage.setItem(waypointDoneKey, 'done');
              localStorage.setItem('order_silvia_waypoint_v2', 'done');
              localStorage.setItem('order_carles_waypoint_v2', 'done');
            } else {
              const curStep = parseInt(localStorage.getItem('order_field_wire_step') || '0', 10) || 0;
              if (curStep < 4) {
                localStorage.setItem('order_field_wire_step', '4');
                localStorage.setItem('order_field_wire_completed', 'true');
                localStorage.setItem('order_field_wire_choices', JSON.stringify([2, 0, 1, 0]));
              } else {
                let hist = [];
                try { hist = JSON.parse(localStorage.getItem('order_field_wire_choices') || '[]') || []; } catch(e) { hist = []; }
                if (!Array.isArray(hist) || hist.length < 4 || hist[0] !== 2 || hist[1] !== 0 || hist[2] !== 1 || hist[3] !== 0) {
                  hist[0] = 2; hist[1] = 0; hist[2] = 1; hist[3] = 0;
                  localStorage.setItem('order_field_wire_choices', JSON.stringify(hist));
                }
              }
            }
          }
        }
        window.syncSilviaWaypointBaseline = syncWaypointBaseline;
        window.syncWaypointBaseline = syncWaypointBaseline;
        syncWaypointBaseline();

        // Canonical Story Point (23 Oct 2026), Silvia only, once: the dawn is over and Hermes stands at the North Portal.
        //   - Dawn 0: [1] Law 1, the Meridian Shadow · Dawn 1: [1] the chalk mark every hundred paces
        //   - Cairn I solved in 16 lifts (not the optimal 15): the Wash River Seal is in the satchel
        //   - The 26-hour trek began 22 Oct 18:00 CEST and is over
        // Her North Portal brief stays unanswered: Hermes calls her on the Field Wire and she answers him there.
        (function syncSilviaNorthPortal() {
          const seekerNow = (localStorage.getItem('the_eclipse_active_seeker') || (window.currentSeeker || 'Silvia')).toLowerCase();
          if (seekerNow !== 'silvia' || localStorage.getItem('order_silvia_north_portal_v1') === 'done') return;
          if (localStorage.getItem('order_whispering_chasm_completed') !== 'true') {
            localStorage.setItem('order_dawn_step', '3');
            localStorage.setItem('order_dawn_choices', JSON.stringify([1, 1]));
            localStorage.setItem('order_cairn1_found', 'true');
            localStorage.setItem('order_cairn1_completed', 'true');
            localStorage.setItem('order_seal_cairn_1', 'true');
            ['order_cairn1_optimal', 'order_cairn1_bypassed', 'order_cairn1_locked_until_3_cairns', 'order_chasm_march_bypassed']
              .forEach((k) => localStorage.removeItem(k));
            const TREK_START = Date.UTC(2026, 9, 22, 16, 0);   // 22 Oct 2026 18:00 CEST
            const start = parseInt(localStorage.getItem('order_chasm_march_start') || '0', 10);
            if (!start || start > TREK_START) localStorage.setItem('order_chasm_march_start', String(TREK_START));
            try {
              let relics = JSON.parse(localStorage.getItem('order_inventory_relics') || '[]');
              if (!Array.isArray(relics)) relics = [];
              if (!relics.includes('seal_cairn_1')) relics.push('seal_cairn_1');
              localStorage.setItem('order_inventory_relics', JSON.stringify(relics));
              localStorage.setItem('seeker_silvia_inventory_relics', JSON.stringify(relics));
            } catch (e) {}
          }
          localStorage.setItem('order_silvia_north_portal_v1', 'done');
        })();

        // Ask Hermes: wipe leftover "Answered" badges from tester runs (shared localStorage key)
        if (localStorage.getItem('order_silvia_inquiries_reset_v1') !== 'done') {
          localStorage.removeItem('order_field_inquiries_read');
          localStorage.setItem('order_silvia_inquiries_reset_v1', 'done');
        }

        // Canon: Silvia already deduced O = 23 and A = 7 (Stations 06→07 + Zodiacal Differential).
        // Seed The Cipher Ledger so those two equations open as resolved / balanced.
        if (localStorage.getItem('order_silvia_oa_ledger_v1') !== 'done') {
          let ledger = {};
          try { ledger = JSON.parse(localStorage.getItem('seeker_silvia_cipher_ledger') || '{}') || {}; } catch (e) { ledger = {}; }
          ledger.O = 23;
          ledger.A = 7;
          localStorage.setItem('seeker_silvia_cipher_ledger', JSON.stringify(ledger));

          let resolved = {};
          try { resolved = JSON.parse(localStorage.getItem('seeker_silvia_equations_resolved') || '{}') || {}; } catch (e) { resolved = {}; }
          resolved['lat-min'] = true;   // A + O = 30' N
          resolved['zod-diff'] = true;  // O − A = 16 S
          localStorage.setItem('seeker_silvia_equations_resolved', JSON.stringify(resolved));
          localStorage.setItem('order_silvia_oa_ledger_v1', 'done');
        }
      } catch (e) {}

      // Station 08 countdown is at 0 (unlocked / ready to enter without timer waiting)
      function isStation8Unlocked() {
        return true;
      }

      if (btnBackToTxLogs) {
        btnBackToTxLogs.addEventListener('click', () => {
          if (sfx) sfx.playMechanicalClick();
          returnToTxLogsMenu();
        });
      }

      // Hash, popstate, and pageshow event listeners
      window.addEventListener('hashchange', handleHubUrlHash);
      window.addEventListener('popstate', handleHubUrlHash);
      window.addEventListener('pageshow', () => {
        handleHubUrlHash();
      });

      // Initial execution of handleHubUrlHash() is deferred to the end of this script
      // so that all views, wire stream elements, and map controllers are fully initialized.

      // 3. Star Map Node Definitions & Click Inspection
      // A station Hermes has not reached yet (Station 11 and Stations 14–18): no name, no rewards, a veiled picture and
      // a live countdown to his arrival. At zero the card is drawn again, whole (selectMapNode).
      function veiledStation(o) {
        const march = window.EclipseMarches && window.EclipseMarches[o.march];
        const started = !!march && march.started();
        const at = started ? march.arrivesAt() : 0;
        const tester = typeof window.isAdminTester === 'function' && window.isAdminTester();
        return {
          badge: 'STATION ' + o.station + ' // DESERT PATH',
          status: started ? 'HERMES ON HIS WAY ⏳' : 'HERMES IS CALLING 📻',
          statusClass: 'status-live-badge',
          title: 'Station ' + o.station + ' · [ Sealed ]',
          thumb: o.thumb,
          veiled: true,
          lore: started ? o.walking : (o.waiting || 'Hermes is waiting for your answer on the Field Wire before he sets out on the next stretch of the road.'),
          rewards: [{ icon: '🔒', label: 'Sealed until Hermes arrives', desc: 'The name of the place, its page and what it keeps' }],
          countdown: at ? {
            title: o.etaLabel || 'HERMES ARRIVES IN',
            ref: 'STATION ' + o.station + ' · [ SEALED ]',
            arrivesAt: at,
            footer: '✦ The name of the place, its page in your journal and what it keeps open the moment Hermes arrives. ✦',
            skip: tester ? march.skip : null
          } : null,
          cinematic: o.cinematic || null,
          btnText: started ? '⏳ Hermes is on his way' : '📻 OPEN THE FIELD WIRE ➔',
          btnDisabled: started,
          action: started ? null : () => { if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire'); }
        };
      }
      const marchOver = (name) => !!(window.EclipseMarches && window.EclipseMarches[name] && window.EclipseMarches[name].over());

      const nodesData = {
        1: {
          badge: 'STATION 01 // ORIGIN DISPATCH',
          status: 'COMPLETED',
          statusClass: 'status-done-badge',
          title: 'The Threshold (Dispatch 22:22)',
          sector: 'Origin · Night Horizon',
          journal: 'Prologue Letter',
          freq: 'Personal Seal',
          thumb: './assets/emails/email-01-parchment.webp',
          lore: 'The initiation summons received at 22:22 on 1 September. Silvia chose The Constellation Path among the three ancient routes.',
          rewards: [
            { icon: '📜', label: 'The Initiation Summon', desc: '1 Sep 22:22 exact dispatch' },
            { icon: '🧭', label: 'The Constellation Path', desc: 'Silvia\'s chosen destiny' },
            { icon: '✨', label: 'Order Cipher Ledger', desc: 'Unsealed parchment codex' }
          ],
          btnText: 'Inspect In Archives ➔',
          action: () => {
            document.querySelector('[data-view="view-archives"]').click();
            selectArchiveDoc('doc1');
          }
        },
        2: {
          badge: 'STATION 02 // CARTOGRAPHER ARRIVAL',
          status: 'COMPLETED',
          statusClass: 'status-done-badge',
          title: 'DISPATCH 02 // CARTOGRAPHER ARRIVAL',
          sector: 'Mountain Threshold',
          journal: 'Fragment 1',
          freq: 'Personal Seal',
          thumb: './assets/emails/email-02-fragment-1.webp',
          lore: 'The Cartographer introduced himself, announcing the handwritten journal, the sacred Astrolabe, and the path to the stars.',
          rewards: [
            { icon: '✉️', label: 'Cartographer Fragment 1', desc: 'The Cartographer of Distant Light' },
            { icon: '🌌', label: 'Sacred Astrolabe Lore', desc: 'The 22-star instrument described' },
            { icon: '📖', label: 'Handwritten Journal Summons', desc: '56-day chronological expedition' }
          ],
          btnText: 'Inspect In Archives ➔',
          action: () => {
            document.querySelector('[data-view="view-archives"]').click();
            selectArchiveDoc('doc2');
          }
        },
        3: {
          badge: 'STATION 03 // CELESTIAL PROLOGUE',
          status: 'HARMONIZED ✓',
          statusClass: 'status-done-badge',
          title: 'The Celestial Flower',
          thumb: './assets/thumbnails/celestial_flower_preview.webp',
          lore: 'The 22-star mechanical dial at the gateway of the sanctuary. Harmonized and aligned by Silvia before the raid on the Observatory.',
          rewards: [
            { icon: '🌸', label: '22 Anchor Stars Aligned', desc: 'Harmonic circuit complete' },
            { icon: '🔤', label: 'Letter D Decoded (Deneb)', desc: 'Apex star cipher key' },
            { icon: '🔤', label: 'Letter C Decoded (Cygnus)', desc: 'Constellation wing key' },
            { icon: '🏛️', label: 'Sanctuary Archive Access', desc: 'Parchment chamber unsealed' }
          ],
          btnText: 'Inspect Decoded Letters & Flower ➔',
          url: './constellation/celestial-flower/index.html',
          replayUrl: './constellation/celestial-flower/index.html#reset',
          replayText: '↺ Re-trace Constellation'
        },
        4: {
          badge: 'STATION 04 // THE FALL & TRANSMISSION 1',
          status: 'RAID ARCHIVED ✓',
          statusClass: 'status-done-badge',
          title: 'The Observatory Raid',
          thumb: './assets/thumbnails/severed_sky.webp',
          lore: 'Masked assailants breach the sanctuary and tear the sacred Astrolabe from its cradle. Transmission 1 broadcasts the urgent distress call (22.22 MHz) as the stars shatter into gravitational ripples.',
          rewards: [
            { icon: '⚔️', label: 'Observatory Breach Recorded', desc: 'Sacred Astrolabe stolen by raiders' },
            { icon: '📻', label: 'Transmission 1 (22.22 MHz)', desc: 'Observatory Under Attack distress call' },
            { icon: '🌌', label: 'The Severed Sky Record', desc: 'Gravitational ripple anomalies documented' }
          ],
          btnText: 'Inspect Observatory Raid & Breach ➔',
          url: './constellation/celestial-flower-2/index.html',
          replayUrl: './constellation/radio-transmission/index.html#transmission-1',
          replayText: '📻 Listen to Transmission 1'
        },
        5: {
          badge: 'STATION 05 // SHORTWAVE RELAY',
          status: 'RECEIVED ✓',
          statusClass: 'status-done-badge',
          title: 'Emergency Radio Relay',
          thumb: './assets/thumbnails/radio_cover.webp',
          lore: 'Fleeing south through the mountain passes and aqueducts, the Cartographer beamed distress Transmission 2 at 19.84 MHz, confirming proof of life and urging Silvia to decipher the Planisphere in her journal.',
          rewards: [
            { icon: '📡', label: 'Survivor Beacon Locked', desc: '19.84 MHz shortwave carrier' },
            { icon: '📻', label: 'Transmission 2 Intercepted', desc: 'Proof of life from southern dunes' },
            { icon: '🧭', label: 'Planisphere Alert', desc: 'Guidance to unlock the page “The Planisphere”' }
          ],
          btnText: 'Open Radio Transmission ➔',
          url: './constellation/radio-transmission/index.html#transmission-2'
        },
        6: {
          badge: 'STATION 06 // OBSERVATORY RESONANCE',
          status: 'CALIBRATED ✓',
          statusClass: 'status-done-badge',
          title: 'The Celestial Matrix',
          thumb: './assets/thumbnails/planisphere_preview.webp',
          lore: 'At the Observatory, Silvia aligned the sixteen celestial guides and harmonic mechanics from the page “The Planisphere”. Transmission 3 (142.85 MHz) confirmed signal stabilization, locking Vector I coordinates and projecting the southern harmonic beam into the dunes.',
          rewards: [
            { icon: '🔤', label: 'Secret Letter P Decoded', desc: 'Primary Cardinal Guide key' },
            { icon: '📐', label: 'Ancient Vector I Locked', desc: 'Lat: [K]+[G]=48°, [A]+[O]=30\' · Lon: [B]+[P]=38°, [E]+[V]=14\', [F]+[T]=22″' },
            { icon: '🎙️', label: 'Transmission 3 (142.85 MHz)', desc: 'Cartographer relief confirmation' }
          ],
          btnText: 'Inspect Calibrated Matrix ➔',
          url: './constellation/celestial-matrix/index.html',
          replayUrl: './constellation/celestial-matrix/index.html#phase-1',
          replayText: '↺ Replay Calibration from Phase 1'
        },
        7: {
          badge: 'STATION 07 // OUTPOST CACHE SECURED',
          status: 'CACHE SECURED ✓',
          statusClass: 'status-done-badge',
          title: 'The Zodiacal Engine',
          thumb: './assets/thumbnails/zodiac_journal_preview.webp',
          lore: 'Calibrating the seven dials on the page “The Zodiacal Engine”, Silvia locked the emergency frequency and breached the desert outskirts outpost. Navigating the ancient subterranean chambers, she attuned the celestial obelisks and recovered the iron cipher chest discarded by the fleeing raiders.',
          rewards: [
            { icon: '🔤', label: 'Secret Letter K Decoded', desc: 'Secondary Cardinal Guide key' },
            { icon: '📐', label: 'Zodiacal Differential', desc: 'Meridian resonance: [O] − [A] = 16' },
            { icon: '📜', label: 'Intercepted Orders', desc: 'Astrolabe triangulates the Fourth Chamber' }
          ],
          btnText: 'Inspect Secured Cache ➔',
          url: './constellation/zodiac-engine/index.html#victory',
          replayUrl: './constellation/zodiac-engine/index.html',
          replayText: '↺ Replay Outpost Patrol'
        },
        8: () => {
          const isMidnightDone = getSeekerMidnightCompleted();
          if (isMidnightDone) {
            return {
              badge: 'STATION 08 // TRANSIT SECURED',
              status: 'SECURED ✓',
              statusClass: 'status-done-badge',
              title: 'The Midnight Calibration',
              thumb: './assets/thumbnails/midnight_calibration_preview.webp',
              lore: 'At true astronomical midnight, Silvia calibrated the astrolabe rig against Vega (97°), survived the electrostatic surge of The Shifting Tempest, and relayed the 2090 ly polar transit chords to the Cartographer before the radio blackout.',
              rewards: [
                { icon: '★', label: 'Vega Meridian Resonance', desc: 'Optical collimation locked at 97°' },
                { icon: '📐', label: 'Hexagon Transit Constant', desc: 'Total chord distance: 2090 light-years' },
                { icon: '🧭', label: 'Bipolar Stellar Anchors', desc: 'Achernar & Polaris bridge the shifted skies' }
              ],
              btnText: 'Inspect Secured Transit ➔',
              url: './constellation/midnight-calibration/transit.html#victory',
              replayUrl: './constellation/midnight-calibration/index.html#replay',
              replayText: '↺ Replay from the Start'
            };
          }

          return {
            badge: 'STATION 08 // ALIGNMENT OPEN',
            status: 'CALIBRATION READY ✦',
            statusClass: 'status-live-badge',
            title: 'The Midnight Calibration',
            thumb: './assets/thumbnails/midnight_calibration_preview.webp',
            lore: 'The celestial meridian has aligned at astronomical midnight. The instruments of the Order and the reserve astrolabe rig are now calibrated and ready for observation against the guide stars.',
            rewards: [],
            btnText: '✦ ENTER MERIDIAN ALIGNMENT ➔',
            url: './constellation/midnight-calibration/index.html'
          };
        },
        9: () => {
          const isCipherDone = getSeekerCipherCompleted();

          if (isCipherDone) {
            return {
              badge: 'STATION 09 // PROPHETIC MERIDIAN SECURED',
              status: 'DECRYPTED ✓',
              statusClass: 'status-done-badge',
              title: 'The Celestial Cipher',
              thumb: './assets/thumbnails/desert_frontier_preview.webp',
              lore: 'Reading the folio of Deserti Limen, Silvia uncovered the Cartographer\'s true name—Hermes—and transmitted his sacred vow: \'You were always the treasure\'. As the signal cleared, the southern sandstorm broke, sealing the Constellation Path behind her, for now.',
              rewards: [
                { icon: '📜', label: "Hermes's Celestial Vow", desc: '"YOU WERE ALWAYS THE TREASURE"' },
                { icon: '★', label: "The True Name Revealed", desc: 'Hermes · The Cartographer of Distant Light' },
                { icon: '🏜️', label: 'Threshold to Desert Path', desc: 'Gateway to the Great Dunes & Desert Oracle' }
              ],
              btnText: 'Read "The Man Behind the Maps" ➔',
              url: './constellation/celestial-cipher/index.html',
              replayUrl: './constellation/celestial-cipher/index.html',
              replayText: '↺ Re-read Chapter'
            };
          }

          return {
            badge: 'STATION 09 // ACTIVE OBJECTIVE',
            status: 'AWAITING DECRYPTION ✦',
            statusClass: 'status-live-badge',
            title: 'The Celestial Cipher',
            thumb: './assets/thumbnails/desert_frontier_preview.webp',
            lore: 'At the southern cliff where the alpine rocks meet the burning sands, Silvia reaches the threshold of Deserti Limen. Here lies the sacred record of the Cartographer: the confession he carved into brass for Aurelia before the world broke. Beyond this threshold, the stars give way to the shifting sands of the Desert Path and the search for the Desert Oracle.',
            rewards: [
              { icon: '📜', label: "Hermes's Celestial Vow", desc: '"YOU WERE ALWAYS THE TREASURE"' },
              { icon: '★', label: "The Secret Behind the Maps", desc: 'The real name and lost love of the Cartographer' },
              { icon: '🏜️', label: 'Threshold to Desert Path', desc: 'Gateway to the Great Dunes and the Second Tower' }
            ],
            btnText: '✦ ENTER CELESTIAL CIPHER ➔',
            url: './constellation/celestial-cipher/index.html'
          };
        },
        10: () => {
          const isCairnDone = localStorage.getItem('order_cairn1_completed') === 'true';
          const isCairnBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
          const isDawnDone = parseInt(localStorage.getItem('order_dawn_step') || '0', 10) >= 3;
          const isChasmUnlocked = isCairnDone || isCairnBypassed || isDawnDone;
          const isChasmDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';

          // The storm is over. Dawn has broken at Outer Watchtower VI; awaiting first canyon descent:
          if (!isChasmUnlocked) {
            return {
              badge: 'STATION 10 // EXPEDITION BASECAMP',
              status: 'WAYPOINT SECURED · DAWN AT WATCHTOWER VI ✦',
              statusClass: 'status-live-badge',
              title: 'Outer Watchtower VI · The Canyon Mouth',
              thumb: './assets/thumbnails/whispering_chasm_preview.webp',
              lore: 'The red sandstorm has subsided into the great dawn silence. Hermes is sheltered inside Outer Watchtower VI by the hearth fire with the 1998 brass surveyor\'s compass. To review his morning dispatch and survey the entrance to the Whispering Chasm, open the field wire relay.',
              rewards: [
                { icon: '🧭', label: "1998 Surveyor's Compass", desc: 'Recovered beside the trail-head benchmark below the tower' },
                { icon: '📻', label: 'Field Wire Relay Active', desc: 'Direct communications line with Hermes' },
                { icon: '🏜️', label: 'Wadi al-Hajar Frontier', desc: 'The dry wash and the road to the Whispering Chasm' }
              ],
              btnText: '✦ OPEN CLIFFSIDE WORKSHOP WIRE ➔',
              action: () => {
                if (typeof activateHubView === 'function') activateHubView('view-field-wire');
              }
            };
          }

          if (isChasmDone) {
            return {
              badge: 'STATION 10 // CANYON CLEARED',
              status: 'GORGE CLEARED · MIRAGE SOLVED ✓',
              statusClass: 'status-done-badge',
              title: 'The Whispering Chasm',
              thumb: './assets/thumbnails/whispering_chasm_preview.webp',
              lore: 'Fork by fork, with the page “The Whispering Chasm” of her journal open in front of her, Silvia walked Hermes through the red maze of the Whispering Chasm. He turned the six relics in his hands until each one showed its rune, M, I, R, A, G and E, and came out at the Oasis Gate with water in his skins. Above the gate waited a line for the Cipher Ledger, with a letter she had never had: [X] + [E] = 17.',
              rewards: [
                { icon: '🏜️', label: 'The Canyon Walked', desc: 'Six relic cairns, found in order' },
                { icon: '🗝️', label: 'Passphrase: MIRAGE', desc: 'The word the old walkers left in the stones' },
                { icon: '📐', label: 'The Line of the Gate: [X] + [E] = 17', desc: 'A new letter for the Cipher Ledger' },
                { icon: '🏜️', label: 'Out of the Gorge', desc: 'Beyond the Oasis Gate lies the Salt Playa' }
              ],
              btnText: 'Walk the Canyon Again ➔',
              action: () => (window.openWhisperingChasmModal ? window.openWhisperingChasmModal() : null)
            };
          }

          const isMarchOver = (typeof window.isChasmMarchOver === 'function') ? window.isChasmMarchOver() : true;
          if (!isMarchOver && window.isChasmCamped()) {
            return {
              badge: 'STATION 10 // DESERT PATH',
              status: 'CAMP BY THE NORTH PORTAL ⛺',
              statusClass: 'status-live-badge',
              title: 'Camp Below the North Portal',
              thumb: './assets/thumbnails/whispering_chasm_preview.webp',
              lore: 'Hermes has reached the great red wall and made camp in sight of the North Portal. He is resting his legs and filling his skins before the descent, and he will call you on the Field Wire when he is ready to go in. Meanwhile, study the page “The Whispering Chasm” of your journal.',
              rewards: [
                { icon: '⛺', label: 'Camp at the Canyon Mouth', desc: 'Hermes rests before the descent' },
                { icon: '🧭', label: 'Journal page “The Whispering Chasm”', desc: 'The canyon maze, seen from above' },
                { icon: '📻', label: 'Field Wire on Standby', desc: 'He will call you when he is ready' }
              ],
              btnText: '⛺ HERMES IS RESTING AT HIS CAMP',
              btnDisabled: true
            };
          }
          if (!isMarchOver) {
            const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
            return {
              badge: 'STATION 10 // 26-HOUR TREK IN PROGRESS',
              status: 'TREK TO NORTH PORTAL · IN PROGRESS ⏳',
              statusClass: 'status-live-badge',
              title: isBypassed ? 'Western Shelf Trek · Heading to North Portal' : 'Dry Wash Trek · Heading to North Portal',
              thumb: './assets/thumbnails/whispering_chasm_preview.webp',
              lore: isBypassed
                ? 'Hermes left the river stones as they were and is crossing the hard rock shelf straight toward the canyon. You can follow his light along the western ridge on the Grand Desert Map, or open the Field Wire to see how long he still has to walk.'
                : 'The Wash River seal is safe in Hermes\'s satchel. Now he is walking up the dry riverbed and over the loose stone slopes toward the Whispering Chasm. Open the Field Wire to see how far he has come.',
              rewards: [
                { icon: '🎒', label: isBypassed ? 'River Stones Left Alone' : 'Wash River Seal in the Satchel', desc: 'On the road to the canyon' },
                { icon: '⏱️', label: 'A 26-Hour Walk', desc: 'Hermes will call you when he reaches the gate' },
                { icon: '📻', label: 'Field Wire on Standby', desc: 'His beacon is still sending' }
              ],
              countdown: window.getChasmMarchArrivesAt() ? {
                title: 'ARRIVAL AT THE NORTH PORTAL IN',
                ref: 'STATION 10 · ON THE ROAD',
                arrivesAt: window.getChasmMarchArrivesAt(),
                footer: '✦ Hermes will call you on the Field Wire the moment he reaches the canyon mouth. ✦',
                skip: typeof window.isAdminTester === 'function' && window.isAdminTester() ? window.skipChasmMarch : null
              } : null,
              btnText: '✦ OPEN FIELD WIRE & CHECK TREK ETA ➔',
              action: () => {
                if (typeof activateHubView === 'function') activateHubView('view-field-wire');
              }
            };
          }

          // Hermes speaks first at the North Portal: until Silvia has answered him, the button takes her to the wire
          const briefHeard = typeof window.isChasmBriefHeard === 'function' ? window.isChasmBriefHeard() : true;
          return {
            badge: 'STATION 10 // DESERT PATH',
            status: briefHeard ? 'NORTH PORTAL REACHED · CANYON DESCENT READY ✦' : 'NORTH PORTAL REACHED · HERMES IS CALLING 📻',
            statusClass: 'status-live-badge',
            title: 'The Whispering Chasm',
            thumb: './assets/thumbnails/whispering_chasm_preview.webp',
            lore: briefHeard
              ? 'Hermes is standing at the North Portal, the narrow gate where the Whispering Chasm begins. Inside, the red walls twist into a maze. You will walk it with him, fork by fork. Keep the page “The Whispering Chasm” of your journal open: it shows the whole maze from above, and he will only ever see the next turn.'
              : 'Hermes is standing at the North Portal, the narrow gate where the Whispering Chasm begins, and he wants a word with you before he takes a single step inside. Open the Field Wire and answer him.',
            rewards: [
              { icon: '🧭', label: 'Journal page “The Whispering Chasm”', desc: 'The canyon maze, seen from above' },
              { icon: '🗺️', label: 'Grand Desert Map · South-West', desc: 'Where the canyon lies on the map' },
              { icon: '🔒', label: 'What the Canyon Keeps', desc: 'Revealed when Hermes walks out' }
            ],
            btnText: briefHeard ? '✦ ENTER THE CANYON WITH HERMES ➔' : '📻 HERMES IS CALLING · OPEN THE FIELD WIRE ➔',
            action: briefHeard
              ? () => (window.openWhisperingChasmModal ? window.openWhisperingChasmModal() : null)
              : () => { if (typeof activateHubView === 'function') activateHubView('view-field-wire'); }
          };
        },
        11: () => {
          const isLexiconDone = localStorage.getItem('order_desert_lexicon_completed') === 'true';

          if (isLexiconDone) {
            return {
              badge: 'STATION 12 // AL-QIBLA BEARING LOCKED',
              status: 'TOWER II LIES 14° NNE ✓',
              statusClass: 'status-done-badge',
              title: 'The Desert Lexicon & Al-Qibla',
              thumb: './assets/thumbnails/desert_lexicon_preview.webp',
              lore: 'By moonlight at Camp VII, under the torch of the raiders\' rearguard, Silvia read the ten words of the steles from the page “The Desert Lexicon & Al-Qibla” while Hermes brushed them clean. The circled letters gave the PHOENIX Sigil, and the Al-Qibla sun compass locked at 194° SSW, the way the raiders rode, its tail at 14° NNE toward Tower II. Its chime woke the camp: Hermes escaped through the walls of the old camp by the letters of the sigil, and on the cold hearth he read the raiders\' name, the BC Ashes.',
              rewards: [
                { icon: '🦅', label: 'The Desert Sigil: PHOENIX', desc: 'Master key of 7 circled letters' },
                { icon: '🧭', label: 'Al-Qibla: 194° SSW · 14° NNE', desc: 'The raiders\' heading, and its reverse to Tower II' },
                { icon: '📐', label: 'Stargazer Equation: [R] × 2 = [F]', desc: 'Cipher Ledger: work out F and T' },
                { icon: '🔥', label: 'Their name: the BC Ashes', desc: 'Scratched on the hearth, under the sign of the phoenix' }
              ],
              cinematic: 'night_of_steles',
              btnText: 'Return to the steles of Camp VII ➔',
              action: () => (window.openDesertLexiconModal ? window.openDesertLexiconModal() : null)
            };
          }

          // The road from the south shore: three hours through the dunes, then Hermes calls from the ruins at dusk.
          // (A save that never heard him on the North Edge of the salt goes straight to the steles.)
          let ruinsWire = {};
          try { ruinsWire = JSON.parse(localStorage.getItem('order_chasm_wire') || '{}') || {}; } catch (e) { ruinsWire = {}; }
          // Before Hermes has even stepped onto the salt, the ruins are not on his road yet: nothing of them is told
          if (ruinsWire.reply2 === undefined && localStorage.getItem('order_salt_playa_completed') !== 'true') {
            return veiledStation({
              station: 12, march: 'lexicon', thumb: './assets/thumbnails/desert_lexicon_preview.webp', etaLabel: 'HERMES REACHES THE RUINS IN',
              walking: 'The road beyond the Salt Playa is still unknown.',
              waiting: 'The road beyond the Salt Playa is still unknown. Guide Hermes across the salt first.'
            });
          }
          if (ruinsWire.reply2 !== undefined) {
            if (!marchOver('lexicon')) {
              return veiledStation({
                station: 12, march: 'lexicon', cinematic: 'road_of_salt', thumb: './assets/thumbnails/desert_lexicon_preview.webp', etaLabel: 'HERMES REACHES THE RUINS IN',
                walking: 'Hermes has left the marker on the south shore of the salt and is walking south through the dunes, keeping to the hollows, toward the ruins of an old nomad camp. The riders from the rim went the same way. Weigh your Cipher Ledger with the Surveyor\'s Balance while he walks.',
                waiting: localStorage.getItem('order_salt_playa_completed') === 'true'
                  ? 'Hermes is resting on the south shore of the salt, in the shadow of the Order\'s marker. Answer him on the Field Wire before he walks on.'
                  : 'The road beyond the Salt Playa is still unknown. Guide Hermes across the salt first.'
              });
            }
            if (ruinsWire.reply4 === undefined) {
              return {
                badge: 'STATION 12 // DESERT PATH',
                status: 'THE NOMAD RUINS AT DUSK · HERMES IS CALLING 📻',
                statusClass: 'status-live-badge',
                title: 'The Desert Lexicon & Al-Qibla',
                thumb: './assets/thumbnails/desert_lexicon_preview.webp',
                lore: 'Hermes has reached the ruins of Camp VII, an old nomad camp in the dunes south of the salt, at sunset. He is calling you in a whisper: he is not alone there. Open the Field Wire and answer him.',
                rewards: [
                  { icon: '📻', label: 'Hermes is calling', desc: 'From behind a broken wall' },
                  { icon: '🔒', label: 'What the Ruins Keep', desc: 'Revealed when you answer him' }
                ],
                btnText: '📻 HERMES IS CALLING · OPEN THE FIELD WIRE ➔',
                action: () => { if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire'); }
              };
            }
          }

          return {
            badge: 'STATION 12 // DESERT PATH',
            status: 'NOMAD RUINS AT MOONRISE ✦',
            statusClass: 'status-live-badge',
            title: 'The Desert Lexicon & Al-Qibla',
            thumb: './assets/thumbnails/desert_lexicon_preview.webp',
            lore: 'In the ruins of Camp VII, in the dunes south of the Salt Playa (South-East Quadrant, on the map page “Grand Desert Map · South-East”), Hermes hid behind a broken wall while a band of riders watered their camels at dusk. The band rode off south with its wagon, but two men stayed behind to watch the trail: one asleep by the fire, one walking a round with a torch past three sandstone stelae. In the moonlight they hold ten nomad words crossing like a net, and a bronze sun compass, Al-Qibla, whose needle will not move. Open the page “The Desert Lexicon & Al-Qibla” in your journal, solve the crossword and set the sun compass. Hermes has three hearts tonight: three mistakes and the night is lost.',
            rewards: [
              { icon: '📜', label: 'Journal page “The Desert Lexicon & Al-Qibla”', desc: '10 words of the nomad pilgrims' },
              { icon: '🦅', label: 'The Desert Sigil', desc: '7 circled letters' },
              { icon: '🧭', label: 'Al-Qibla Sun Compass', desc: 'Straight heading to Tower II' }
            ],
            btnText: '✦ TRANSCRIBE THE STELAE & SET THE COMPASS ➔',
            action: () => (window.openDesertLexiconModal ? window.openDesertLexiconModal() : null)
          };
        },
        12: () => {
          const isClepsydraDone = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';

          if (isClepsydraDone) {
            return {
              badge: 'STATION 13 // EXPEDITION COMPLETE',
              status: 'MIRAGE DISPELLED · REAL SPRING FOUND ✓',
              statusClass: 'status-done-badge',
              title: 'The Oasis Clepsydra (4 Wells)',
              thumb: './assets/thumbnails/oasis_clepsydra_preview.webp',
              lore: 'The four seekers have been matched with their arrival hours and relics on the page “The Oasis Clepsydra” (Key XXX, 30 Hours). The four wells were a fever mirage, but the logic kept Hermes lucid: he found a real spring beneath a carved falcon and filled the four water skins.',
              rewards: [
                { icon: '⏳', label: 'The Mirage of the 4 Wells', desc: 'Falcon, Jackal, Scarab, Serpent' },
                { icon: '💧', label: '4 Full Canteens', desc: 'Great Erg crossing secured' },
                { icon: '📐', label: 'Ledger Equation: [P] - [A] = 14', desc: 'Scratched beside the falcon carving' }
              ],
              btnText: 'Review the Balanced Clepsydra ➔',
              action: () => (window.openOasisClepsydraModal ? window.openOasisClepsydraModal() : null)
            };
          }

          if (window.isNextAdventureHeld && window.isNextAdventureHeld()) {
            return {
              badge: 'STATION 13 // DESERT PATH',
              status: 'HERMES IS RESTING AT CAMP VII ⛺',
              statusClass: 'status-live-badge',
              title: 'Station 13 · [ Sealed ]',
              thumb: './assets/thumbnails/oasis_clepsydra_preview.webp',
              veiled: true,
              lore: 'Hermes has read the steles of Camp VII and learned the name of the raiders. He is resting by the cold hearth, the needle of Al-Qibla pointing the way they rode. The next stretch of the road, across the Great Erg, is not open yet. He will call you on the Field Wire the moment it is.',
              rewards: [
                { icon: '⛺', label: 'Camp VII', desc: 'Hermes rests by the cold hearth' },
                { icon: '🔒', label: 'What the Next Stretch Keeps', desc: 'Revealed when the road opens' }
              ],
              btnText: '⛺ HERMES IS RESTING AT CAMP VII',
              btnDisabled: true
            };
          }
          return {
            badge: 'STATION 13 // DESERT PATH',
            status: 'THE FOUR WELLS DISCOVERED ✦',
            statusClass: 'status-live-badge',
            title: 'The Oasis Clepsydra (4 Wells)',
            thumb: './assets/thumbnails/oasis_clepsydra_preview.webp',
            lore: 'In the Desert Oasis basin (South-East Quadrant, on the map page “Grand Desert Map · South-East”), Hermes has reached the Four Wells. Open the page “The Oasis Clepsydra” in your journal, balance the hydraulic siphons and fill your canteens.',
            rewards: [
              { icon: '⏳', label: 'Journal page “The Oasis Clepsydra”', desc: 'Logic deduction of the 4 Seekers' },
              { icon: '💧', label: '4 Water Canteens', desc: 'Vital supplies for the desert' },
              { icon: '📐', label: 'The Clepsydra Key', desc: 'Written in Roman numerals' }
            ],
            btnText: '✦ OPEN THE CLEPSYDRA WORKSHOP ➔',
            action: () => (window.openOasisClepsydraModal ? window.openOasisClepsydraModal() : null)
          };
        },
        // Station 14 · The Sun Monolith & Cairn II (node id 23: 15–17 are aliases)
        23: () => {
          const thumb = './assets/thumbnails/sun_monolith_preview.webp';
          const open = () => (window.openSunMonolithModal ? window.openSunMonolithModal() : null);
          if (localStorage.getItem('order_sun_monolith_completed') === 'true') {
            return {
              badge: 'STATION 14 // CAIRN II AWAKE',
              status: 'SEAL OF CAIRN II SECURED ✓',
              statusClass: 'status-done-badge',
              title: 'The Sun Monolith & Cairn II',
              thumb,
              lore: 'Silvia spoke the sigil from the page “The Sun Monolith & Cairn II” and walked the sun across the sky until the Monolith\'s shadow touched the four marks of the founders. The niche of Cairn II opened: its seal was waiting inside, though iron bars had scarred the rim.',
              rewards: [
                { icon: '🪨', label: 'The Seal of Cairn II', desc: 'Second seal of the five' },
                { icon: '📐', label: 'Ledger: [D] + [F] = 24 · [C] − [T] = 8', desc: 'Carved inside the lid of the niche' },
                { icon: '📜', label: 'The Founders\' Inscription', desc: 'Four lines under Cairn II' }
              ],
              btnText: 'Review the Sun Monolith ➔',
              action: open
            };
          }
          if (!marchOver('monolith')) {
            return veiledStation({ station: 14, march: 'monolith', thumb,
              walking: 'Hermes is walking by night across open sand, with the stars for a compass. Where he is going stays sealed until he gets there.' });
          }
          const eta = typeof window.getMonolithMarchEta === 'function' ? window.getMonolithMarchEta() : '';
          const arrived = (typeof window.isMonolithMarchOver === 'function' && window.isMonolithMarchOver()) || (typeof window.isAdminTester === 'function' && window.isAdminTester());
          return {
            badge: 'STATION 14 // DESERT PATH',
            status: arrived ? 'THE RIDGE OF THE SUN REACHED ✦' : (eta ? 'HERMES CROSSING THE GREAT ERG ✦' : 'NORTH-NORTH-EAST OF TOWER II ✦'),
            statusClass: 'status-live-badge',
            title: 'The Sun Monolith & Cairn II',
            thumb,
            lore: arrived
              ? 'On the high north-eastern ridge stands the Sun Monolith, and Cairn II sits at its feet like a sundial waiting for its hour. Solve the page “The Sun Monolith & Cairn II” in your journal, speak its sigil and wake the Monolith.'
              : (eta
                ? 'Hermes is walking north-north-east across the Great Erg, from the gates of Tower II to the Sun Monolith. Arrival in ' + eta + '. Keep the page “The Sun Monolith & Cairn II” close.'
                : 'The road north-north-east from the gates of Tower II leads to the Sun Monolith. Hermes will set out once you answer him on the wire.'),
            rewards: [
              { icon: '📖', label: 'Journal page “The Sun Monolith & Cairn II”', desc: 'The seven noons of the Monolith' },
              { icon: '☀️', label: 'The Walking Sun', desc: 'A second trial, only on the Ridge' },
              { icon: '🪨', label: 'The Seal of Cairn II', desc: 'Second seal of the five' }
            ],
            btnText: arrived ? '✦ WAKE THE SUN MONOLITH ➔' : 'Hermes is on his way',
            btnDisabled: !arrived,
            action: open
          };
        },
        // Station 15 · The Sandstone Labyrinth & Cairn III (node id 24)
        24: () => {
          const thumb = './assets/thumbnails/sandstone_labyrinth_preview.webp';
          const open = () => (window.openLabyrinthModal ? window.openLabyrinthModal() : null);
          if (localStorage.getItem('order_sandstone_labyrinth_completed') === 'true') {
            return {
              badge: 'STATION 15 // CAIRN III OPEN',
              status: 'SEAL OF CAIRN III SECURED ✓',
              statusClass: 'status-done-badge',
              title: 'The Sandstone Labyrinth & Cairn III',
              thumb,
              lore: 'Silvia read the eight arches of the true road on the page “The Sandstone Labyrinth & Cairn III” and the copper plate of Cairn III turned. Then she guided Hermes through the dark, between the torches of the BC Ashes, and out through the Western Cleft.',
              rewards: [
                { icon: '🪨', label: 'The Seal of Cairn III', desc: 'Third seal of the five' },
                { icon: '📐', label: 'Ledger: [W] + [A] = 26 · [N] − [E] = 9', desc: 'Carved under the copper plate' },
                { icon: '✶', label: 'A Star of Gold Leaf', desc: 'Painted on a wall of the labyrinth' }
              ],
              btnText: 'Review the Sandstone Labyrinth ➔',
              action: open
            };
          }
          if (!marchOver('labyrinth')) {
            return veiledStation({ station: 15, march: 'labyrinth', thumb,
              walking: 'Hermes is walking down from the ridge on the stone shelves, away from the raiders\' ruts. Where he is going stays sealed until he gets there.' });
          }
          const eta = typeof window.getLabyrinthMarchEta === 'function' ? window.getLabyrinthMarchEta() : '';
          const arrived = (typeof window.isLabyrinthMarchOver === 'function' && window.isLabyrinthMarchOver()) || (typeof window.isAdminTester === 'function' && window.isAdminTester());
          // The bearing is Hermes's to explain at first light (wire step 13): before that, no direction
          const heardAtDawn = (parseInt(localStorage.getItem('order_field_wire_step') || '0', 10) || 0) >= 13;
          return {
            badge: 'STATION 15 // DESERT PATH',
            status: arrived ? 'CAIRN III REACHED ✦' : (eta ? 'HERMES WALKING DOWN FROM THE MONOLITH ✦' : (heardAtDawn ? 'SOUTH-SOUTH-EAST OF THE SUN MONOLITH ✦' : 'BEYOND THE ARCHES OF THE WEST WIND ✦')),
            statusClass: 'status-live-badge',
            title: 'The Sandstone Labyrinth & Cairn III',
            thumb,
            lore: arrived
              ? 'Below the Arches of the West Wind, a maze of pillars and fissures hides Cairn III and its copper plate. Solve the page “The Sandstone Labyrinth & Cairn III” in your journal, speak the sigil, and get Hermes out alive: the BC Ashes are inside.'
              : (eta
                ? 'Hermes is walking down from the Sun Monolith to the Sandstone Labyrinth, on the bearing of 168°. Arrival in ' + eta + '. Keep the page “The Sandstone Labyrinth & Cairn III” close.'
                : (heardAtDawn
                  ? 'The Sandstone Labyrinth lies south-south-east of the Sun Monolith, under the Arches of the West Wind. Hermes will set out once you answer him on the wire.'
                  : 'Somewhere beyond the Arches of the West Wind lies the Sandstone Labyrinth. Hermes is resting under the Sun Monolith and will wire you at first light.')),
            rewards: [
              { icon: '📖', label: 'Journal page “The Sandstone Labyrinth & Cairn III”', desc: 'The eight arches of the true road' },
              { icon: '🔥', label: 'Escape from the BC Ashes', desc: 'A second trial, only in the labyrinth' },
              { icon: '🪨', label: 'The Seal of Cairn III', desc: 'Third seal of the five' }
            ],
            btnText: arrived ? '✦ ENTER THE LABYRINTH ➔' : 'Hermes is on his way',
            btnDisabled: !arrived,
            action: open
          };
        },
        // Station 16 · Cairn IV, Sentry of the Canyon (node id 25)
        25: () => {
          const thumb = './assets/thumbnails/cairn_iv_preview.webp';
          const open = () => (window.openCairnFourModal ? window.openCairnFourModal() : null);
          if (localStorage.getItem('order_cairn_iv_completed') === 'true') {
            return {
              badge: 'STATION 16 // THE PILLARS SANG',
              status: 'SEAL OF CAIRN IV SECURED ✓',
              statusClass: 'status-done-badge',
              title: 'Cairn IV · Sentry of the Canyon',
              thumb,
              lore: 'Silvia spoke the sigil of the seven echoes and then sang the canyon\'s three verses back to it: SUN, ECHO, STONE. The founders\' chamber opened. In the throat of the Left pillar, Hermes found a pebble that the river never put there.',
              rewards: [
                { icon: '🪨', label: 'The Seal of Cairn IV', desc: 'Fourth seal of the five' },
                { icon: '📐', label: 'Ledger: [S] + [U] = 17 · [S] − [U] = 9', desc: 'Engraved on the bronze reed' },
                { icon: '✶', label: 'The Tuning Pebble', desc: 'In Hermes\'s satchel' }
              ],
              btnText: 'Review the Song of the Pillars ➔',
              action: open
            };
          }
          if (!marchOver('cairnFour')) {
            return veiledStation({ station: 16, march: 'cairnFour', thumb,
              walking: 'Hermes walks the hardpan by night and sleeps in the rocks by day. Where he is going stays sealed until he gets there.' });
          }
          const eta = typeof window.getCairnFourMarchEta === 'function' ? window.getCairnFourMarchEta() : '';
          const arrived = (typeof window.isCairnFourMarchOver === 'function' && window.isCairnFourMarchOver()) || (typeof window.isAdminTester === 'function' && window.isAdminTester());
          return {
            badge: 'STATION 16 // DESERT PATH',
            status: arrived ? 'CAIRN IV REACHED ✦' : (eta ? 'HERMES CROSSING THE HARDPAN ✦' : 'THE SOUTHERN MOUTH OF THE GORGE ✦'),
            statusClass: 'status-live-badge',
            title: 'Cairn IV · Sentry of the Canyon',
            thumb,
            lore: arrived
              ? 'Two hollow pillars guard the southern mouth of the gorge, under the Sentinel Mesa, and the wind sings inside them. Solve the page “Cairn IV: Sentry of the Canyon” in your journal, speak the sigil, and learn the song of the pillars.'
              : (eta
                ? 'Hermes is crossing the hardpan by night and the Natural Bridge of the Sentinel Mesa, toward the singing pillars. Arrival in ' + eta + '. Keep the page “Cairn IV: Sentry of the Canyon” close.'
                : 'Far to the south-west, where the canyon narrows under the Sentinel Mesa, Cairn IV has stood since the founders\' time. Hermes will set out once you answer him on the wire.'),
            rewards: [
              { icon: '📖', label: 'Journal page “Cairn IV: Sentry of the Canyon”', desc: 'The seven echoes of the survey log' },
              { icon: '🎶', label: 'The Song of the Pillars', desc: 'A second trial, by ear' },
              { icon: '🪨', label: 'The Seal of Cairn IV', desc: 'Fourth seal of the five' }
            ],
            btnText: arrived ? '✦ WAKE THE SENTRY ➔' : 'Hermes is on his way',
            btnDisabled: !arrived,
            action: open
          };
        },
        // Station 17 · The Arch of the Solstice & Cairn V (node id 26)
        26: () => {
          const thumb = './assets/thumbnails/solstice_arch_preview.webp';
          const open = () => (window.openSolsticeModal ? window.openSolsticeModal() : null);
          if (localStorage.getItem('order_arch_solstice_completed') === 'true') {
            return {
              badge: 'STATION 17 // THE LAST SEAL',
              status: 'SEAL OF CAIRN V SECURED ✓',
              statusClass: 'status-done-badge',
              title: 'The Arch of the Solstice & Cairn V',
              thumb,
              lore: 'Silvia turned the founders\' mirrors for an October dawn and the brass ring of the Solar Altar closed its four locks. That night a light on Tower II answered Hermes\'s mirror, spelled two lines in the old light-code of the Order, and went out. At dawn, smoke rose over the Sanctuary.',
              rewards: [
                { icon: '🪨', label: 'The Seal of Cairn V', desc: 'The fifth and last seal' },
                { icon: '📐', label: 'Ledger: [Y] − [O] = 2 · [L] + [G] = 23', desc: 'Spelled in light from Tower II' },
                { icon: '🪞', label: 'The Signal Mirror', desc: 'In Hermes\'s satchel' }
              ],
              btnText: 'Review the Arch of the Solstice ➔',
              action: open
            };
          }
          if (!marchOver('solstice')) {
            return veiledStation({ station: 17, march: 'solstice', thumb,
              walking: 'Hermes is walking east without sleep, back over the Natural Bridge. Where he is going stays sealed until he gets there.' });
          }
          const eta = typeof window.getSolsticeMarchEta === 'function' ? window.getSolsticeMarchEta() : '';
          const arrived = (typeof window.isSolsticeMarchOver === 'function' && window.isSolsticeMarchOver()) || (typeof window.isAdminTester === 'function' && window.isAdminTester());
          return {
            badge: 'STATION 17 // DESERT PATH',
            status: arrived ? 'THE ARCH REACHED ✦' : (eta ? 'HERMES WALKING EAST WITHOUT SLEEP ✦' : 'BY THE SANCTUARY, UNDER THE ARCH ✦'),
            statusClass: 'status-live-badge',
            title: 'The Arch of the Solstice & Cairn V',
            thumb,
            lore: arrived
              ? 'Behind the Arch of the Solstice lies the Courtyard of Rays, its bronze mirrors and the Solar Altar, with Cairn V watching from the dunes. Solve the page “Arch of the Solstice & The Solar Altar” in your journal, speak the sigil, and bring the light to the altar.'
              : (eta
                ? 'Hermes is walking east without sleep, back over the Natural Bridge and across the dunes of Cairn V. Arrival in ' + eta + '. Keep the page “Arch of the Solstice & The Solar Altar” close.'
                : 'Near the Sanctuary of Tower II stands the Arch of the Solstice, and behind it the last cairn. Hermes will set out once you answer him on the wire.'),
            rewards: [
              { icon: '📖', label: 'Journal page “Arch of the Solstice & The Solar Altar”', desc: 'The midsummer ray and its sun-stones' },
              { icon: '☀', label: 'The Autumn Dawn', desc: 'A second trial, against the climbing sun' },
              { icon: '🪞', label: 'The Night Signal', desc: 'A third trial, in light' }
            ],
            btnText: arrived ? '✦ ENTER THE COURTYARD ➔' : 'Hermes is on his way',
            btnDisabled: !arrived,
            action: open
          };
        },
        // Station 18 · The Polybius Stele · Tower II in Flames (node id 13)
        13: () => {
          const open = () => (window.openSteleModal ? window.openSteleModal() : null);
          if (localStorage.getItem('order_polybius_stele_completed') === 'true') {
            return {
              badge: 'STATION 18 // THE SERVANT LIVES',
              status: 'THE WELL OPENED ✓',
              statusClass: 'status-done-badge',
              title: 'The Polybius Stele · Tower II',
              thumb: './assets/thumbnails/polybius_stele_preview.webp',
              lore: 'Silvia read the proverb on the page “The Polybius Stele” and the stele turned. Under the floor the Servant answered in the founders\' grid, and she answered him back. Then she guided Hermes across the burning atrium, on the ash, to the hatch of the well.',
              rewards: [
                { icon: '🗝️', label: "The Servant's Key", desc: 'The bronze key of the inner stair' },
                { icon: '🧭', label: 'Bearing 348° NNW', desc: 'On the back of the stele, as on Cairn III' },
                { icon: '🧮', label: '2 New Equations', desc: '[H] − [U] = 16 · [M] + [T] = 25' }
              ],
              btnText: 'Revisit the Atrium ➔',
              action: open
            };
          }
          if (!marchOver('stele')) {
            return veiledStation({ station: 18, march: 'stele', thumb: './assets/thumbnails/polybius_stele_preview.webp',
              walking: 'Hermes is following a dry bed under the dunes toward a column of smoke, and will arrive after dark. Where he is going stays sealed until he gets there.' });
          }
          const eta = typeof window.getSteleMarchEta === 'function' ? window.getSteleMarchEta() : '';
          const arrived = (typeof window.isSteleMarchOver === 'function' && window.isSteleMarchOver()) || (typeof window.isAdminTester === 'function' && window.isAdminTester());
          return {
            badge: 'STATION 18 // DESERT PATH',
            status: arrived ? 'TOWER II IS BURNING ✦' : (eta ? 'HERMES WALKING TOWARD THE SMOKE ✦' : 'UNDER THE ARCH, WATCHING THE SMOKE ✦'),
            statusClass: 'status-live-badge',
            title: 'The Polybius Stele · Tower II in Flames',
            thumb: './assets/thumbnails/polybius_stele_preview.webp',
            lore: arrived
              ? 'The raiders have set fire to the library of Tower II and the Servant is missing. In the smoke of the atrium the stele stands untouched. Solve the page “The Polybius Stele” in your journal and speak its proverb: someone under the floor is listening.'
              : (eta
                ? 'Hermes is following the dry bed under the dunes toward the smoke over the Sanctuary. Arrival in ' + eta + ', after dark. Keep the page “The Polybius Stele” close.'
                : 'Smoke is rising over Tower II. Hermes will set out from the Arch once you answer him on the wire: six hours to the Sanctuary.'),
            rewards: [
              { icon: '📜', label: 'The Proverb of the Stele', desc: 'The page “The Polybius Stele” · six stanzas' },
              { icon: '🪨', label: 'The Knocks in the Stone', desc: 'A second trial, in the grid of the stele' },
              { icon: '🔥', label: 'The Burning Atrium', desc: 'A third trial, against the fire' }
            ],
            btnText: arrived ? '✦ ENTER THE ATRIUM ➔' : 'Hermes is on his way',
            btnDisabled: !arrived,
            action: open
          };
        },
        // Stage Path · the nine rooms of Tower III (nodes 40–48). A built room replaces its card in STAGE_CARDS.
        ...(() => {
          const cards = {};
          const rooms = [
            [40, 20, 'The Gate of a Thousand Masks', '19B', 'A thousand faces guard the theatre of the Order, and six of them lie.'],
            [41, 21, 'The Camera Obscura', '20A', 'A dark room where the whole city appears upside down on the wall.'],
            [42, 22, 'The Whispering Gallery', '20B', 'A gallery where a whisper at one end is heard at the other.'],
            [43, 23, 'The Automaton Orchestra', '21B', 'A brass orchestra that plays only what its cylinder remembers.'],
            [44, 24, 'The Fly Tower', '22A', 'High above the stage, ropes, pulleys and counterweights hold the scenery.'],
            [45, 25, 'The Shadow Theatre', '23A', 'A silk screen, a row of lamps, and figures that live only as shadows.'],
            [46, 26, 'The Hall of Mirrors', '24A', 'A maze where you see everyone, and nobody is where you see them.'],
            [47, 27, 'The Kaleidoscope Lantern', '25A', 'The great lantern of the theatre, its glass waiting to be set.'],
            [48, 28, 'The Stage of the Mirror Speaker', '26A', 'The last room: the stage where the mirror of Tower III hangs.']
          ];
          rooms.forEach(([node, station, room, sheet, teaser], i) => {
            cards[node] = () => {
              const card = roomCard();
              // A pause after the last fragment (hub/js/stage-pause.js): the door stays shut until its hour
              const wait = window.EclipseStagePause ? window.EclipseStagePause.opensIn(node) : '';
              const tester = typeof window.isAdminTester === 'function' && window.isAdminTester();
              // Then the seal on its sheet (hub/js/sheet-seals.js): the QR on the game face is the key of the room
              const face = !wait && window.EclipseSheetSeals ? window.EclipseSheetSeals.missing(node) : '';
              if (face) {
                const sealPage = window.EclipseSheetSeals && window.EclipseSheetSeals.page ? window.EclipseSheetSeals.page(node) : 'its page in your journal';
                return Object.assign({}, card, {
                  status: 'THE SEAL OF ' + sealPage.toUpperCase() + ' ✦',
                  lore: teaser + ' The door of this room opens with the seal printed on ' + sealPage + '. Scan it with your camera.',
                  btnText: tester ? '⏩ Tester: open it now' : '🔒 Scan the seal on ' + sealPage,
                  btnDisabled: !tester,
                  action: tester ? () => { window.EclipseSheetSeals.skip(node); return card.action ? card.action() : null; } : () => null
                });
              }
              if (!wait) return card;
              return Object.assign({}, card, {
                status: 'OPENS IN ' + wait.toUpperCase() + ' ✦',
                lore: teaser + ' The door of this room opens in ' + wait + '.',
                btnText: tester ? '⏩ Tester: open it now' : '🔒 Opens in ' + wait,
                btnDisabled: !tester,
                action: tester ? () => { window.EclipseStagePause.skip(node); return card.action ? card.action() : null; } : () => null
              });
            };
            const roomCard = () => {
              const builtCard = window.STAGE_CARDS && window.STAGE_CARDS[node];
              if (typeof builtCard === 'function') return builtCard();
              const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][i];
              return {
                badge: 'STATION ' + station + ' // STAGE PATH',
                status: 'FRAGMENT ' + roman + ' · NOT YET ✦',
                statusClass: 'status-live-badge',
                title: room,
                thumb: './assets/thumbnails/stage_mirror_preview.webp',
                lore: teaser + ' The Mirror Speaker has not opened this room yet.',
                rewards: [
                  { icon: '📖', label: 'Journal page “' + room + '”', desc: 'The game of this room' },
                  { icon: '🪞', label: 'Fragment ' + roman, desc: 'One ninth of the mirror of Tower III' }
                ],
                btnText: 'The door is still closed',
                btnDisabled: true,
                action: () => null
              };
            };
          });
          return cards;
        })(),
        // Station 19 · The Oracle's Horizon (node id 14)
        14: () => {
          const open = () => (window.openOracleModal ? window.openOracleModal() : null);
          if (localStorage.getItem('order_oracle_horizon_completed') === 'true') {
            return {
              badge: 'STATION 19 // THE FIRST TRUTH',
              status: 'THE ORACLE REMEMBERS ✓',
              statusClass: 'status-done-badge',
              title: "The Oracle's Horizon · Tower II",
              thumb: './assets/thumbnails/oracle_horizon_preview.webp',
              lore: 'Silvia sealed the horizon on the page “The Oracle\'s Horizon”, set the brass disc of 24 sightings to the sky and read the first truth on it: the WHEN. Then she gave the vow back to the Oracle, and the Oracle lifted her veil. She was Aurelia.',
              rewards: [
                { icon: '📅', label: 'The WHEN', desc: '18 – 20 December' },
                { icon: '⭐', label: 'The Gilded Star', desc: 'Painted for the navigator' },
                { icon: '🧮', label: '2 New Equations', desc: '[Z] + [D] = 23 · [I] + [E] = 12' }
              ],
              btnText: 'Revisit the Inner Chamber ➔',
              action: open
            };
          }
          const seals = [1, 2, 3, 4, 5].filter((i) => localStorage.getItem('order_seal_cairn_' + i) === 'true').length;
          const tester = typeof window.isAdminTester === 'function' && window.isAdminTester();
          const ready = localStorage.getItem('order_polybius_stele_completed') === 'true' && seals === 5 && typeof window.isOracleStairOver === 'function' && window.isOracleStairOver();
          const arrived = ready || tester;
          const steleDone = localStorage.getItem('order_polybius_stele_completed') === 'true';
          const fourSeals = steleDone && seals < 5 && !tester;
          return {
            badge: 'STATION 19 // TOWER II · THE ORACLE',
            status: arrived ? 'THE INNER STAIR ✦' : (fourSeals ? 'FOUR SEALS OF FIVE ✦' : 'THE ORACLE WAITS ✦'),
            statusClass: 'status-live-badge',
            title: "The Oracle's Horizon",
            thumb: './assets/thumbnails/oracle_horizon_preview.webp',
            lore: arrived
              ? 'At the bottom of the inner stair of Tower II, a door carved with the horizon. Solve the page “The Oracle\'s Horizon” in your journal, speak the sigil of the Oracle, and stand before her.'
              : (fourSeals
                ? "'She receives no one until the five seals are home.' The first seal still sleeps by the dry wash, at Cairn I: the Servant will show you the way back."
                : (steleDone
                  ? 'Hermes is waiting for dawn by the inner stair. Open the Cliffside Workshop: he will wire you before he goes down.'
                  : 'Deep in Tower II the Oracle keeps the first truth. Save the Servant of the atrium, and wait for Hermes on the wire.')),
            rewards: [
              { icon: '📖', label: 'Journal page “The Oracle\'s Horizon”', desc: 'The three mirrors of the horizon' },
              { icon: '🪙', label: 'The Disc of 24 Sightings', desc: 'A second trial, set by the sky' },
              { icon: '💬', label: 'The Vow', desc: 'A third trial, in words' }
            ],
            btnText: arrived ? '✦ DESCEND THE INNER STAIR ➔' : (fourSeals ? 'Speak with the Servant ➔' : 'The door is still closed'),
            btnDisabled: !arrived && !fourSeals,
            action: open
          };
        },
        21: () => {
          const isPlayaDone = localStorage.getItem('order_salt_playa_completed') === 'true';
          if (isPlayaDone) {
            return {
              badge: 'STATION 11 // BASIN CROSSED',
              status: 'SALT CRUST CROSSED ✓',
              statusClass: 'status-done-badge',
              title: 'The Salt Playa (Dry Basin)',
              thumb: './assets/thumbnails/salt_playa_preview.webp',
              lore: 'Guiding Hermes with the Law of the Basin and the page “The Salt Playa (Dry Basin)” of her journal, Silvia found the one safe crossing of seven slabs, dodging the brine sinkholes. The letters along the path, copied from her page, spelled CRYSTAL, and the Console on the Order\'s post opened the way into the Great Salt Sump. At noon she read its plates with the page “Study on the Dry Salt Playa” and brought Hermes to the south shore, where a marker of the Order kept a line to check and a little brass balance.',
              rewards: [
                { icon: '🧂', label: 'Basin Crossed', desc: '7 safe slabs, north to south' },
                { icon: '🗝️', label: 'Passage Keyword Verified: CRYSTAL', desc: 'Transmitted to the Console of the Order' },
                { icon: '☀️', label: 'The Sump at Noon', desc: '6 sound plates, read with the Study' },
                ...(localStorage.getItem('order_chasm_wire') && (JSON.parse(localStorage.getItem('order_chasm_wire') || '{}') || {}).reply2 !== undefined
                  ? [{ icon: '⚖️', label: 'The Surveyor\'s Balance', desc: 'In your Cipher Ledger, with the Line of the Salt' }] : []),
                { icon: '🏜️', label: 'Nomad Ruins in Sight', desc: 'Station 12 unlocked' }
              ],
              cinematic: 'road_of_salt',
              btnText: 'Review the Crossing ➔',
              action: () => (window.openSaltPlayaModal ? window.openSaltPlayaModal() : null)
            };
          }

          if (window.EclipseMarches && window.EclipseMarches.playa.camped()) {
            return {
              badge: 'STATION 11 // DESERT PATH',
              status: 'CAMP AT THE EDGE OF THE SALT ⛺',
              statusClass: 'status-live-badge',
              title: 'Camp at the Edge of the Salt',
              thumb: './assets/thumbnails/salt_playa_preview.webp',
              veiled: true,
              lore: 'First light has come. Hermes has walked out of the Oasis Gate to the edge of the white salt and made camp beside an old surveyor\'s tripod. He is testing the crust with his staff, slab by slab, and will call you on the Field Wire when he is ready to step onto it. Meanwhile, keep the page “The Salt Playa (Dry Basin)” of your journal close.',
              rewards: [
                { icon: '⛺', label: 'Camp at the Edge of the Salt', desc: 'Hermes tests the crust before he trusts it' },
                { icon: '🧭', label: 'Journal page “The Salt Playa (Dry Basin)”', desc: 'The crossing, seen from above' },
                { icon: '📻', label: 'Field Wire on Standby', desc: 'He will call you when he is ready' }
              ],
              btnText: '⛺ HERMES IS TESTING THE CRUST',
              btnDisabled: true
            };
          }
          if (!marchOver('playa')) {
            return veiledStation({
              station: 11, march: 'playa', thumb: './assets/thumbnails/salt_playa_preview.webp', etaLabel: 'FIRST LIGHT IN',
              walking: 'Hermes is asleep by the rocks of the Oasis Gate, outside the canyon, his satchel under his head. At first light he sets out on the next stretch of the road, and only then does this station open. Keep the page he gave you tonight close.',
              waiting: localStorage.getItem('order_whispering_chasm_completed') === 'true'
                ? 'Hermes is out of the canyon and calling you from the Oasis Gate. Open the Field Wire to hear him.'
                : 'The road beyond the Whispering Chasm is still unknown. Guide Hermes through the canyon first.'
            });
          }
          // Hermes speaks first on the North Edge: until Silvia has answered him, the button takes her to the wire
          let edgeHeard = false;
          try { edgeHeard = (JSON.parse(localStorage.getItem('order_chasm_wire') || '{}') || {}).reply2 !== undefined; } catch (e) { edgeHeard = false; }
          return {
            badge: 'STATION 11 // DESERT PATH',
            status: edgeHeard ? 'FIRST LIGHT ON THE SALT ✦' : 'FIRST LIGHT ON THE SALT · HERMES IS CALLING 📻',
            statusClass: 'status-live-badge',
            title: 'The Salt Playa (Dry Basin)',
            thumb: './assets/thumbnails/salt_playa_preview.webp',
            lore: edgeHeard
              ? 'South of the Oasis Gate the ground opens into a blinding white salt basin, and every slab of its crust looks the same. Brine sinkholes hide under it. Cross it with Hermes step by step, with the page “The Salt Playa (Dry Basin)” of your journal as your map: only the page shows the facets, the letters and the sinkholes. Beyond the stones waits the Great Salt Sump, and the page “Study on the Dry Salt Playa”. Hermes has three hearts for the whole crossing: three false steps and he walks back to the North Edge.'
              : 'Hermes is standing on the North Edge of the salt, by an old surveyor\'s tripod of the Order, and he wants a word with you before he steps onto the crust. Open the Field Wire and answer him.',
            rewards: [
              { icon: '🧂', label: 'Journal page “The Salt Playa (Dry Basin)”', desc: '7×7 slab grid with brine sinkholes' },
              { icon: '⚖️', label: 'Measured Footsteps', desc: 'Every step is tested before he trusts it' },
              { icon: '🔒', label: 'What the South Shore Keeps', desc: 'Revealed when Hermes reaches it' }
            ],
            btnText: edgeHeard ? '✦ STEP ONTO THE SALT WITH HERMES ➔' : '📻 HERMES IS CALLING · OPEN THE FIELD WIRE ➔',
            action: edgeHeard
              ? () => (window.openSaltPlayaModal ? window.openSaltPlayaModal() : null)
              : () => { if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire'); }
          };
        },
        22: () => {
          const openChat = () => { if (typeof window.activateHubView === 'function') window.activateHubView('view-field-wire'); };
          const cairnDone = localStorage.getItem('order_cairn1_completed') === 'true';
          const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
          const isLockedTemp = localStorage.getItem('order_cairn1_locked_until_3_cairns') === 'true';
          const found = cairnDone || (!isBypassed && parseInt(localStorage.getItem('order_dawn_step') || '0', 10) >= 2);
          if (cairnDone) {
            return {
              badge: 'CAIRN I // THE WASH RIVER MARKER',
              status: 'SEAL SECURED ✓',
              statusClass: 'status-done-badge',
              title: 'Cairn I · The Wash River Marker',
              thumb: './assets/chat/sketch_cairn_one.webp',
              lore: 'Guided by Silvia, Hermes lifted four river stones from the first foundation to the third, one at a time and never a big stone on a small one. A hollow opened in the base and gave up the Seal of Cairn I: a flat disc of sandstone with a sun above a wavy line. It now rests in his satchel.',
              rewards: [
                { icon: '🎒', label: 'Seal of Cairn I', desc: 'Safe in Hermes\'s satchel' },
                { icon: '🚪', label: 'North Portal of the Whispering Chasm', desc: 'Station 10 is within reach' }
              ],
              btnText: 'Review the River Stones ➔',
              action: () => (window.openCairnOneModal ? window.openCairnOneModal() : null)
            };
          }
          if (isBypassed) {
            return {
              badge: 'WADI AL-HAJAR // DRY RIVER',
              status: isLockedTemp ? 'PATH BARRED · ?' : 'LEFT UNDISTURBED · ?',
              statusClass: 'status-locked-badge',
              title: 'Wadi al-Hajar · The Dry River',
              thumb: './assets/chat/sketch_dry_wash.webp',
              lore: isLockedTemp
                ? 'The silent bend of Wadi al-Hajar. The Servant of Tower II has temporarily barred access until you have gathered at least two to three other sacred cairn seals across the desert pilgrimage.'
                : 'A quiet bend in the dry riverbed of Wadi al-Hajar. When Hermes surveyed the canyon at dawn, you chose to keep strictly to the surveyor\'s route toward the gorge, leaving whatever lay buried in the silt undisturbed.',
              rewards: [],
              btnText: isLockedTemp ? 'Locked by the Servant of Tower II' : '💬 Review Notes in Workshop ➔',
              btnDisabled: isLockedTemp,
              action: isLockedTemp ? () => { if (typeof window.showDesertToast === 'function') window.showDesertToast('The path to Cairn I is temporarily closed until you hold 2–3 other cairn seals.'); } : openChat
            };
          }
          if (found) {
            return {
              badge: 'WADI AL-HAJAR // THE RIVER STONES',
              status: 'RIVER STONES FOUND ✦',
              statusClass: 'status-live-badge',
              title: 'The River Stones · Wadi al-Hajar',
              thumb: './assets/chat/sketch_cairn_one.webp',
              lore: 'Half buried in the silt of the dry river, Hermes found a heap of round stones, stacked by an old hand. At its foot lies a slab with three foundations and four stones. Guide him: one stone at a time, and never a big stone on a small one.',
              rewards: [
                { icon: '🪨', label: 'Four river stones', desc: 'Three foundations, one stone at a time' },
                { icon: '❓', label: 'Concealed Hollow', desc: 'Waiting under the third foundation' }
              ],
              btnText: '✦ GUIDE HERMES AT THE STONES ➔',
              action: () => (window.openCairnOneModal ? window.openCairnOneModal() : null)
            };
          }
          return {
            badge: 'WADI AL-HAJAR // THE DRY RIVER',
            status: 'HERMES FOLLOWS A HUNCH ✦',
            statusClass: 'status-live-badge',
            title: 'The Dry River · Wadi al-Hajar',
            thumb: './assets/chat/sketch_dry_wash.webp',
            lore: 'Hermes has left the watchtower and walks south along Wadi al-Hajar, the dry river, on nothing more than a hunch. Keep the wire open and see what he finds.',
            rewards: [],
            btnText: '💬 Back to the Cliffside Workshop ➔',
            action: openChat
          };
        },
        15: () => nodesData[10](),
        16: () => nodesData[12](),
        17: () => nodesData[14]()
      };

      const inspBadge = document.getElementById('insp-badge');
      const inspStatus = document.getElementById('insp-status');
      const inspTitle = document.getElementById('insp-title');
      const inspLore = document.getElementById('insp-lore');
      const inspThumb = document.getElementById('insp-thumb-img');
      const inspBtn = document.getElementById('insp-btn-primary');
      const inspBtnReplay = document.getElementById('insp-btn-replay');
      const inspBtnReset = document.getElementById('insp-btn-reset');
      const inspRelicsBox = document.getElementById('insp-relics-box');
      const inspRelicsChips = document.getElementById('insp-relics-chips');

      window.selectMapNode = function (id, shouldScroll = false) {
        sfx.playMechanicalClick();
        const data = (typeof nodesData[id] === 'function') ? nodesData[id]() : nodesData[id];
        if (!data) return;

        // Switch to trail view if not already there
        const trailNavBtn = document.querySelector('[data-view="view-trail"]');
        if (trailNavBtn && !trailNavBtn.classList.contains('active')) {
          trailNavBtn.click();
        }

        if (inspBadge) inspBadge.innerText = data.badge;
        if (inspStatus) {
          inspStatus.innerText = data.status;
          inspStatus.className = 'inspector-status ' + data.statusClass;
        }
        if (inspTitle) inspTitle.innerText = data.title;
        if (inspLore) inspLore.innerText = data.lore;
        if (data.thumb && inspThumb) inspThumb.src = data.thumb;
        if (inspThumb && inspThumb.parentElement) inspThumb.parentElement.classList.toggle('is-veiled', !!data.veiled);

        // Render Unlocked Relics & Canonical Rewards
        if (inspRelicsChips && data.rewards && data.rewards.length > 0) {
          if (inspRelicsBox) inspRelicsBox.style.display = 'flex';
          inspRelicsChips.innerHTML = data.rewards.map(r => `
            <div class="relic-chip" title="${r.desc || ''}">
              <span class="relic-chip-icon">${r.icon}</span>
              <span class="relic-chip-text">${r.label}</span>
              ${r.desc ? `<span class="relic-chip-desc">· ${r.desc}</span>` : ''}
            </div>
          `).join('');
        } else if (inspRelicsBox) {
          inspRelicsBox.style.display = 'none';
        }

        // Primary Action Button (Launch / Inspect)
        if (inspBtn) {
          if (data.btnText) {
            inspBtn.style.display = 'inline-flex';
            const span = inspBtn.querySelector('span');
            if (span) span.innerText = data.btnText;
            inspBtn.setAttribute('aria-disabled', data.btnDisabled ? 'true' : 'false');
            if (data.btnDisabled) {
              inspBtn.style.opacity = '0.55';
              inspBtn.style.cursor = 'not-allowed';
              inspBtn.removeAttribute('href');
              inspBtn.onclick = (e) => {
                e.preventDefault();
                if (typeof data.action === 'function') data.action();
              };
            } else {
              inspBtn.style.opacity = '1';
              inspBtn.style.cursor = 'pointer';
              if (data.action) {
                inspBtn.removeAttribute('href');
                inspBtn.onclick = (e) => { e.preventDefault(); data.action(); };
              } else {
                inspBtn.onclick = null;
                inspBtn.href = data.url;
              }
            }
          } else {
            inspBtn.style.display = 'none';
          }
        }

        // Replay Button (Seamless replay from scratch)
        if (inspBtnReplay) {
          if (data.replayUrl) {
            inspBtnReplay.style.display = 'inline-flex';
            inspBtnReplay.href = data.replayUrl;
            const span = inspBtnReplay.querySelector('span');
            if (span) span.innerText = data.replayText || '↺ Replay';
          } else {
            inspBtnReplay.style.display = 'none';
          }
        }

        if (window.EclipseCinematic) window.EclipseCinematic.inspector(data.cinematic || null);

        const inspCountdownBar = document.getElementById('insp-countdown-bar');
        if (inspCountdownBar) {
          // Show countdown ONLY if Station 08 is active AND NOT yet unlocked!
          inspCountdownBar.style.display = (id == 8 && !isStation8Unlocked()) ? 'flex' : 'none';
        }

        // The walk to a sealed station: a live countdown, and at zero the card opens by itself (on the Quest Map)
        if (window.__inspMarchTimer) { clearInterval(window.__inspMarchTimer); window.__inspMarchTimer = null; }
        const inspMarchBar = document.getElementById('insp-march-bar');
        if (inspMarchBar) {
          const cd = data.countdown;
          inspMarchBar.style.display = cd ? 'flex' : 'none';
          if (cd) {
            inspMarchBar.querySelector('.countdown-title-text').textContent = cd.title;
            inspMarchBar.querySelector('.countdown-station-ref').textContent = cd.ref;
            inspMarchBar.querySelector('.countdown-footer-msg').textContent = cd.footer;
            const skipBtn = inspMarchBar.querySelector('.insp-march-skip');
            skipBtn.hidden = !cd.skip;
            skipBtn.onclick = cd.skip ? () => { cd.skip(); selectMapNode(id, false); } : null;
            const digits = inspMarchBar.querySelectorAll('.countdown-unit-box strong');
            const tick = (live) => {
              const rem = Math.max(0, cd.arrivesAt - Date.now());
              [Math.floor(rem / 3600000), Math.floor((rem % 3600000) / 60000), Math.floor((rem % 60000) / 1000)]
                .forEach((v, i) => { digits[i].textContent = String(v).padStart(2, '0'); });
              if (rem > 0 || !live) return;
              clearInterval(window.__inspMarchTimer); window.__inspMarchTimer = null;
              if (sfx && typeof sfx.playCelestialChime === 'function') sfx.playCelestialChime();
              if (window.Desert3D && typeof window.Desert3D.refresh === 'function') window.Desert3D.refresh();
              if (document.body.getAttribute('data-active-view') === 'view-trail') selectMapNode(id, false);
            };
            tick(false);
            if (cd.arrivesAt > Date.now()) window.__inspMarchTimer = setInterval(() => tick(true), 1000);
          }
        }

        if (inspBtnReset) {
          const isMidnightDone = getSeekerMidnightCompleted();
          // On the Desert Path the active quest is Hermes's next station; before it, Station 08 or 09
          const desertNo = { 10: '10', 21: '11', 11: '12', 12: '13', 23: '14', 24: '15', 25: '16', 26: '17', 13: '18', 14: '19', 22: 'Cairn I' };
          const desertTarget = desertNo[id] && typeof window.getNextDesertNodeId === 'function' ? window.getNextDesertNodeId() : null;
          const targetStation = desertTarget || (isMidnightDone ? 9 : 8);
          if (id == targetStation || data.hideReturnBtn || (+id >= 40 && +id <= 48)) {   // the Stage rooms keep their own ribbon
            // On the Desert Path the button keeps its box (display:none shrinks the inspector and the 3D map under it repaints every frame)
            inspBtnReset.style.display = desertNo[id] ? 'inline-flex' : 'none';
            inspBtnReset.style.visibility = desertNo[id] ? 'hidden' : '';
            inspBtnReset.tabIndex = -1;
          } else {
            inspBtnReset.style.display = 'inline-flex';
            inspBtnReset.style.visibility = '';
            inspBtnReset.tabIndex = 0;
            const isCarles = (currentSeeker || 'Silvia').toLowerCase() === 'carles';
            const targetName = desertTarget ? (desertNo[desertTarget] === 'Cairn I' ? 'Cairn I' : 'Station ' + desertNo[desertTarget]) : `Station 0${targetStation}`;
            const label = (desertTarget || !isMidnightDone || isCarles)
              ? `➔ Return to Active Quest (${targetName})`
              : `➔ Return to Horizon (${targetName})`;
            const span = inspBtnReset.querySelector('span');
            if (span) {
              span.innerText = label;
            } else {
              inspBtnReset.innerText = label;
            }
            inspBtnReset.onclick = () => selectMapNode(targetStation, true);
          }
        }

        const inspectorEl = document.getElementById('star-inspector');
        if (inspectorEl) {
          inspectorEl.classList.remove('inspector-pulse-update');
          void inspectorEl.offsetWidth; // trigger reflow
          inspectorEl.classList.add('inspector-pulse-update');

          if (shouldScroll) {
            inspectorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      };

      document.querySelectorAll('.map-node-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
          const id = trigger.getAttribute('data-node');
          selectMapNode(id, true);
        });

        trigger.addEventListener('mouseenter', () => {
          sfx.playChimeHover();
        });
      });

      // 4. Archives Document Switcher & Real Images (Physical Dispatches Only)
      const archiveDocs = {
        doc1: {
          metaId: 'DISPATCH 01 // PARCHMENT IMAGE',
          metaDate: '1 SEP 2026 · 22:22 EXACT',
          imgSrc: './assets/emails/email-01-parchment.webp',
          fullImgSrc: './assets/emails/email-01-parchment-full.webp',
          bodyHtml: `
            <p class="archive-record-note">
              <strong>Dispatch I · September 1, 2026 (22:22):</strong> Opening dispatch parchment from the Eclipse Order. Confirms Silvia's designated path along <em>The Constellation Path</em> and the forthcoming delivery of the journal for the 56-day cycle.
            </p>
          `
        },
        doc2: {
          metaId: 'DISPATCH 02 // CARTOGRAPHER ARRIVAL',
          metaDate: 'FRAGMENT 1 · THE CARTOGRAPHER',
          imgSrc: './assets/emails/email-02-fragment-1.webp',
          fullImgSrc: './assets/emails/email-02-fragment-1-full.webp',
          bodyHtml: `
            <p class="archive-record-note">
              <strong>Dispatch II · Fragment 1 (The Cartographer):</strong> Welcome letter from the Cartographer of Distant Light to the seeker who answered with the stars, standing watch at the Observatory at the edge of the dark.
            </p>
          `
        },
        doc3: {
          metaId: 'DISPATCH 03 // SUBTERRANEAN OUTPOST',
          metaDate: 'SOUTHERN FOOTHILLS · 142.85 MHz',
          imgSrc: './assets/emails/email-03-zodiac-outpost.webp',
          fullImgSrc: './assets/emails/email-03-zodiac-outpost-full.webp',
          bodyHtml: `
            <p class="archive-record-note">
              <strong>Dispatch III · The Subterranean Outpost:</strong> Transmission received from the Cartographer at the desert threshold. Informs Silvia of the dormant central command console and directs her to solve the page “The Zodiacal Engine” to extract the emergency override sequence.
            </p>
          `
        },
        doc4: {
          metaId: 'RECORD 09-A // THE MAN BEHIND THE MAPS',
          metaDate: 'FOLIO LIMEN · MEMOIRS OF HERMES (ANNO 1970–2026)',
          imgSrc: './constellation/celestial-cipher/assets/distant-light-precipice.jpg',
          fullImgSrc: './constellation/celestial-cipher/assets/distant-light-precipice.jpg',
          bodyHtml: `
            <p class="archive-record-note">
              <strong>Folio Limen · The Man Behind the Maps (Anno 1970–2026):</strong> The recovered personal memoirs of Hermes, the Cartographer of Distant Light. Documents the fall of the Southern Bridge in 1971, twenty-seven years of rebuilding the Alpine Observatory stone by stone, the grueling 1998 frontier survey along the gorge precipice, and the midnight beacon of 2016 that reignited his lifelong search for Aurelia.
            </p>
            <div style="margin-top: 14px;">
              <a href="./constellation/celestial-cipher/index.html" class="btn-historical-web" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 8px 16px; font-size: 0.85rem; cursor: pointer;">
                <span>📖 Read Complete Folio in Celestial Cipher ➔</span>
              </a>
            </div>
          `
        },
        vid1: {
          kind: 'video',
          metaId: 'OPTICAL LOG 01 // THE SHIFTING TEMPEST',
          metaDate: 'STATION 08 · 00:24 · 1080p',
          videoSrc: './constellation/midnight-calibration/video/tempest_cinematic_master.mp4',
          posterSrc: './constellation/midnight-calibration/video/tempest_poster.jpg',
          bodyHtml: `
            <p class="archive-record-note">
              <strong>Optical Log I · The Shifting Tempest:</strong> Master cinematic captured when the observatory aperture locked on Vega. A wall of copper sand and violet lightning crosses the foothills as the Cartographer's carrier begins to fail.
            </p>
          `
        }
      };

      const docMetaId = document.getElementById('doc-meta-id');
      const docMetaDate = document.getElementById('doc-meta-date');
      const docViewImg = document.getElementById('doc-view-img');
      const docViewText = document.getElementById('doc-view-text');
      const imgFrame = document.getElementById('doc-image-frame');
      const videoFrame = document.getElementById('doc-video-frame');
      const docViewVideo = document.getElementById('doc-view-video');

      function selectArchiveDoc(docKey) {
        const doc = archiveDocs[docKey];
        if (!doc) return;

        document.querySelectorAll('.archive-item-card').forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-doc') === docKey);
        });

        if (docMetaId) docMetaId.innerText = doc.metaId;
        if (docMetaDate) docMetaDate.innerText = doc.metaDate;
        if (docViewText) docViewText.innerHTML = doc.bodyHtml;

        if (doc.kind === 'video') {
          if (imgFrame) imgFrame.style.display = 'none';
          if (videoFrame) videoFrame.hidden = false;
          if (docViewVideo) {
            if (doc.posterSrc) docViewVideo.poster = doc.posterSrc;
            if (docViewVideo.dataset.src !== doc.videoSrc) {
              docViewVideo.dataset.src = doc.videoSrc;
              docViewVideo.src = doc.videoSrc;
            }
          }
          return;
        }

        if (docViewVideo) docViewVideo.pause();
        if (videoFrame) videoFrame.hidden = true;
        if (imgFrame) imgFrame.style.display = '';

        if (docViewImg && imgFrame) {
          const targetSrc = doc.imgSrc;
          if (!docViewImg.src || !docViewImg.src.endsWith(targetSrc.replace('./', ''))) {
            imgFrame.classList.remove('loaded');
            imgFrame.classList.add('loading');
            docViewImg.onload = () => {
              imgFrame.classList.remove('loading');
              imgFrame.classList.add('loaded');
            };
            docViewImg.src = targetSrc;
          } else if (docViewImg.complete && docViewImg.naturalWidth > 0) {
            imgFrame.classList.remove('loading');
            imgFrame.classList.add('loaded');
          }
        }

        // Pre-fetch selected document's high-res plate in background
        if (doc.fullImgSrc) {
          const preImg = new Image();
          preImg.src = doc.fullImgSrc;
        }
      }

      // Initialize initial image state
      if (docViewImg && imgFrame) {
        if (docViewImg.complete && docViewImg.naturalWidth > 0) {
          imgFrame.classList.remove('loading');
          imgFrame.classList.add('loaded');
        } else {
          docViewImg.addEventListener('load', () => {
            imgFrame.classList.remove('loading');
            imgFrame.classList.add('loaded');
          });
        }
      }

      // 5. Transmissions Player Controls (Audio Intercept & Video Stream)
      const txRadioAudio = document.getElementById('tx-radio-audio');
      const btnTxRadioPlay = document.getElementById('btn-tx-radio-play');
      const txCardRadio = document.getElementById('tx-card-radio');
      const txTimeDisplay = document.getElementById('tx-time-display');

      if (btnTxRadioPlay && txRadioAudio) {
        btnTxRadioPlay.addEventListener('click', () => {
          sfx.playMechanicalClick();
          if (txRadioAudio.paused) {
            txRadioAudio.play().then(() => {
              btnTxRadioPlay.innerText = '⏸';
              if (txCardRadio) txCardRadio.classList.add('playing');
            }).catch(e => console.log('Audio playback prevented:', e));
          } else {
            txRadioAudio.pause();
            btnTxRadioPlay.innerText = '▶';
            if (txCardRadio) txCardRadio.classList.remove('playing');
          }
        });

        txRadioAudio.addEventListener('timeupdate', () => {
          if (!txTimeDisplay) return;
          const cur = Math.floor(txRadioAudio.currentTime);
          const dur = Math.floor(txRadioAudio.duration) || 48;
          const curM = Math.floor(cur / 60);
          const curS = (cur % 60).toString().padStart(2, '0');
          const durM = Math.floor(dur / 60);
          const durS = (dur % 60).toString().padStart(2, '0');
          txTimeDisplay.innerText = `${curM}:${curS} / ${durM}:${durS}`;
        });

        txRadioAudio.addEventListener('ended', () => {
          btnTxRadioPlay.innerText = '▶';
          if (txCardRadio) txCardRadio.classList.remove('playing');
        });
      }

      const btnTxCinematicPlay = document.getElementById('btn-tx-cinematic-play');
      if (btnTxCinematicPlay) {
        btnTxCinematicPlay.addEventListener('click', () => {
          openCinematicTheater();
        });
      }

      document.querySelectorAll('.archive-item-card').forEach(card => {
        card.addEventListener('click', () => {
          sfx.playMechanicalClick();
          const docKey = card.getAttribute('data-doc');
          selectArchiveDoc(docKey);
        });
      });

      // 5. Image Lightbox Modal
      const lightboxModal = document.getElementById('image-lightbox');
      const lightboxImg = document.getElementById('lightbox-full-img');
      const lightboxWrap = document.getElementById('lightbox-img-wrap');
      const btnCloseLightbox = document.getElementById('btn-close-lightbox');

      function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('open');
      }

      if (imgFrame && lightboxModal) {
        // Pre-fetch on hover for immediate 0ms readiness
        imgFrame.addEventListener('mouseenter', () => {
          const activeCard = document.querySelector('.archive-item-card.active');
          const docKey = activeCard ? activeCard.getAttribute('data-doc') : 'doc1';
          const doc = archiveDocs[docKey];
          if (doc && doc.fullImgSrc) {
            const pre = new Image();
            pre.src = doc.fullImgSrc;
          }
        });

        imgFrame.addEventListener('click', () => {
          const activeCard = document.querySelector('.archive-item-card.active');
          const docKey = activeCard ? activeCard.getAttribute('data-doc') : 'doc1';
          const doc = archiveDocs[docKey];
          if (doc && doc.kind === 'video') return;
          sfx.playMechanicalClick();
          const targetFullSrc = doc ? (doc.fullImgSrc || doc.imgSrc) : docViewImg.src;

          const isAlreadyLoaded = lightboxImg.src && lightboxImg.src.endsWith(targetFullSrc.replace('./', '')) && lightboxImg.complete && lightboxImg.naturalWidth > 0;

          if (isAlreadyLoaded) {
            if (lightboxWrap) {
              lightboxWrap.classList.remove('loading');
              lightboxWrap.classList.add('loaded');
            }
          } else {
            if (lightboxWrap) {
              lightboxWrap.classList.remove('loaded');
              lightboxWrap.classList.add('loading');
            }

            lightboxImg.onload = () => {
              if (lightboxWrap) {
                lightboxWrap.classList.remove('loading');
                lightboxWrap.classList.add('loaded');
              }
            };

            lightboxImg.src = targetFullSrc;
            if (lightboxImg.complete && lightboxImg.naturalWidth > 0) {
              if (lightboxWrap) {
                lightboxWrap.classList.remove('loading');
                lightboxWrap.classList.add('loaded');
              }
            }
          }

          lightboxModal.classList.add('open');
        });
      }

      if (btnCloseLightbox && lightboxModal) {
        btnCloseLightbox.addEventListener('click', closeLightbox);
      }

      if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
          if (e.target === lightboxModal) {
            closeLightbox();
          }
        });
      }

      // Canonical Active Quest on Hub Load: Station 08 is the active objective (Zodiac completed)
      try {
        localStorage.setItem('order_zodiac_completed', 'true');
      } catch (e) {}

      const n7Tag = document.getElementById('node-7-tag');
      if (n7Tag) {
        n7Tag.textContent = '07 · SECURED ✓';
        n7Tag.style.fill = 'var(--brass-bright)';
      }
      const n7Dot = document.getElementById('node-7-dot');
      if (n7Dot) {
        n7Dot.classList.remove('node-dot-active');
        n7Dot.classList.add('node-dot-completed');
      }
      const n7Beacon = document.getElementById('node-7-beacon');
      if (n7Beacon) n7Beacon.style.display = 'none';

      // Illuminate filament 7 -> 8
      const fil78 = document.getElementById('filament-7-8');
      if (fil78) fil78.classList.add('lit');

      // Astronomical Midnight Countdown for Station 08: 29 Sep 2026, 00:00 local time.
      const COUNTDOWN_STORAGE_KEY = 'order_station8_unlock_target';
      const UNLOCKED_STORAGE_KEY = 'order_station8_unlocked';
      const MIDNIGHT_CALIBRATION_TARGET_MS = new Date(2026, 8, 29, 0, 0, 0).getTime();

      function getOrCreateCountdownTarget() {
        return MIDNIGHT_CALIBRATION_TARGET_MS;
      }

      // Update Chronicles of the Raid - Game 06
      const chronCard7 = document.getElementById('chronicle-card-7');
      const chron7Tag = document.getElementById('chronicle-7-tag');
      const chron7Title = document.getElementById('chronicle-7-title');
      const chron7Text = document.getElementById('chronicle-7-text');
      const chron7Btn = document.getElementById('chronicle-7-btn');

      if (chronCard7) {
        chronCard7.removeAttribute('style');
        chronCard7.style.display = 'flex';
      }
      if (chron7Tag) {
        chron7Tag.textContent = 'Game 07 · Subterranean Cache Secured ✓';
        chron7Tag.removeAttribute('style');
        chron7Tag.style.color = 'var(--brass-base)';
      }
      if (chron7Title) {
        chron7Title.textContent = 'The Zodiac Engine & Outpost Patrol';
        chron7Title.removeAttribute('style');
        chron7Title.style.color = 'var(--brass-bright)';
      }
      if (chron7Text) {
        chron7Text.textContent = 'Calibrating the seven dials on the page “The Zodiacal Engine”, Silvia locked the emergency beacon (142.85 MHz) and breached the subterranean outpost beneath the dunes. Attuning the celestial obelisks of Sol, Luna, and Stella, she recovered the iron cipher chest and unmasked Letter K.';
      }
      if (chron7Btn) {
        chron7Btn.className = 'btn-historical-web';
        chron7Btn.removeAttribute('style');
        chron7Btn.style.cursor = 'pointer';
        const span = chron7Btn.querySelector('span');
        if (span) span.textContent = '↺ Revisit Outpost Patrol ➔';
      }

      function updateProgressionStateUI() {
        const isCarles = (currentSeeker || 'Silvia').toLowerCase() === 'carles';
        const isMidnightCompleted = getSeekerMidnightCompleted();
        const isCipherCompleted = getSeekerCipherCompleted();

        // Keep global keys in sync for child pages (transit.html, astrolabe.js, cipher.js, navigator.js)
        try {
          localStorage.setItem('order_midnight_completed', isMidnightCompleted ? 'true' : 'false');
          localStorage.setItem('order_cipher_completed', isCipherCompleted ? 'true' : 'false');
          localStorage.setItem(UNLOCKED_STORAGE_KEY, 'true');
        } catch (e) {}

        // 1. Transmission Logs
        const midnightTxCards = document.querySelectorAll('.tx-log-card-midnight');
        midnightTxCards.forEach(card => {
          card.hidden = !isMidnightCompleted;
        });
        const cipherTxCards = document.querySelectorAll('.tx-log-card-cipher');
        cipherTxCards.forEach(card => {
          card.hidden = !isCipherCompleted && !isCarles;
        });
        const txArchiveCount = document.getElementById('tx-archive-count');
        const txDossierDesc = document.getElementById('tx-dossier-desc');
        if (txArchiveCount) {
          if (isCipherCompleted) {
            txArchiveCount.textContent = 'FREQUENCY ARCHIVE // 6 RECORDINGS READY';
          } else if (isMidnightCompleted) {
            txArchiveCount.textContent = 'FREQUENCY ARCHIVE // 5 RECORDINGS READY';
          } else {
            txArchiveCount.textContent = 'FREQUENCY ARCHIVE // 3 RECORDINGS READY';
          }
        }
        if (txDossierDesc) {
          if (isCipherCompleted) {
            txDossierDesc.textContent = 'Six intercepted audio broadcasts recovered from the Cartographer\'s field receiver, including the emergency wire from the southern sandstorm at Deserti Limen.';
          } else if (isMidnightCompleted) {
            txDossierDesc.textContent = 'Five intercepted audio broadcasts recovered from the Cartographer\'s field receiver. Select an intercepted log below to initialize its dedicated relay console and examine its authentic telemetry.';
          } else {
            txDossierDesc.textContent = 'Three intercepted audio broadcasts recovered from the Cartographer\'s field receiver. Select an intercepted log below to initialize its dedicated relay console, play the recorded signal, and examine its authentic telemetry.';
          }
        }

        // 2. The Order Archives (Optical Logs & Station 09 Folio Limen)
        const opticalLogs = document.getElementById('archive-optical-logs');
        if (opticalLogs) {
          opticalLogs.hidden = !isMidnightCompleted;
        }
        const cipherArchiveCard = document.getElementById('archive-item-doc4');
        if (cipherArchiveCard) {
          cipherArchiveCard.hidden = !isCipherCompleted && !isCarles;
        }

        // 3. SVG Map Relics (Relic 8 text & Relic 9 dial)
        const relic8Text = document.getElementById('relic-8-text');
        if (relic8Text) {
          relic8Text.textContent = isMidnightCompleted ? '2090 LY · 97°' : 'MERIDIAN AXIS';
        }
        const relic9Art = document.getElementById('relic-9-art');
        if (relic9Art) {
          relic9Art.style.display = isMidnightCompleted ? '' : 'none';
        }

        // 4. Celestial Route Map (Node 8, Node 9 & Filaments)
        const n8Beacon = document.getElementById('node-8-beacon');
        const n8Dot = document.getElementById('node-8-dot');
        const n8Tag = document.getElementById('node-8-tag');
        const n8Title = document.getElementById('node-8-title');
        const n8Icon = document.getElementById('node-8-icon');

        const node9 = document.getElementById('map-node-9');
        const n9Beacon = document.getElementById('node-9-beacon');
        const n9Gear = document.getElementById('node-9-gear');
        const n9Ring = document.getElementById('node-9-ring');
        const n9Glow = document.getElementById('node-9-glow');
        const n9Dot = document.getElementById('node-9-dot');
        const n9Icon = document.getElementById('node-9-icon');
        const n9Tag = document.getElementById('node-9-tag');
        const n9Title = document.getElementById('node-9-title');

        const fil89 = document.getElementById('filament-8-9');
        const fadeFil = document.getElementById('filament-future-fade');

        if (isMidnightCompleted) {
          // Node 8 completed
          if (n8Beacon) n8Beacon.style.display = 'none';
          if (n8Icon) n8Icon.style.display = 'none';
          if (n8Dot) {
            n8Dot.className.baseVal = 'node-dot-completed';
          }
          if (n8Tag) {
            n8Tag.textContent = '08 · SECURED ✓';
            n8Tag.style.fill = 'var(--brass-bright)';
            n8Tag.style.opacity = '1';
          }
          if (n8Title) {
            n8Title.textContent = 'The Midnight Calibration';
            n8Title.style.opacity = '1';
          }

          // Node 9 is visible on the map
          if (node9) node9.style.display = '';
          if (fil89) {
            fil89.style.display = '';
            fil89.classList.add('lit');
          }
          if (fadeFil) fadeFil.style.display = 'none';

          // Node 9 is visible and interactive for both Silvia and Carles
          if (n9Gear) n9Gear.style.opacity = '0.85';
          if (n9Ring) n9Ring.style.opacity = '0.85';
          if (n9Glow) n9Glow.style.opacity = '0.7';
          if (n9Icon) n9Icon.style.display = 'none';

          if (isCipherCompleted) {
            if (n9Beacon) n9Beacon.style.display = 'none';
            if (n9Dot) {
              n9Dot.className.baseVal = 'node-dot-completed';
              n9Dot.removeAttribute('fill');
            }
            if (n9Tag) {
              n9Tag.textContent = '09 · DECRYPTED ✓';
              n9Tag.style.fill = 'var(--brass-bright)';
            }
            if (n9Title) {
              n9Title.textContent = 'The Celestial Cipher';
              n9Title.style.fill = '#ffffff';
            }
          } else {
            if (n9Beacon) n9Beacon.style.display = 'block';
            if (n9Dot) {
              n9Dot.className.baseVal = 'node-dot-active';
              n9Dot.removeAttribute('fill');
            }
            if (n9Tag) {
              n9Tag.textContent = '09 · ACTIVE OBJECTIVE ✦';
              n9Tag.style.fill = '#fde68a';
            }
            if (n9Title) {
              n9Title.textContent = 'The Celestial Cipher';
              n9Title.style.fill = '#ffffff';
            }
          }
        } else {
          // Game 8 NOT completed (Silvia initial state):
          if (n8Beacon) {
            n8Beacon.style.display = 'block';
            n8Beacon.style.stroke = 'var(--brass-bright)';
          }
          if (n8Icon) n8Icon.style.display = 'none';
          if (n8Dot) {
            n8Dot.className.baseVal = 'node-dot-active';
          }
          if (n8Tag) {
            n8Tag.textContent = '08 · CALIBRATION READY ✦';
            n8Tag.style.fill = 'var(--brass-bright)';
            n8Tag.style.opacity = '1';
          }
          if (n8Title) {
            n8Title.textContent = 'The Midnight Calibration';
            n8Title.style.opacity = '1';
          }

          // Node 9 is hidden
          if (node9) node9.style.display = 'none';
          if (fil89) fil89.style.display = 'none';
          if (fadeFil) fadeFil.style.display = '';
        }

        // 5. Chronicles of the Raid
        const chronCard8 = document.getElementById('chronicle-card-8');
        if (chronCard8) {
          chronCard8.style.display = 'flex';
          const chron8Tag = document.getElementById('chronicle-8-tag') || chronCard8.querySelector('.chronicle-step-tag');
          const chron8Title = document.getElementById('chronicle-8-title') || chronCard8.querySelector('.chronicle-title');
          const chron8Text = document.getElementById('chronicle-8-text') || chronCard8.querySelector('.chronicle-text');
          const chron8Thumb = document.getElementById('chronicle-8-thumb') || chronCard8.querySelector('img');
          const chron8Countdown = document.getElementById('chronicle-8-cd-strip') || chronCard8.querySelector('.chronicle-countdown-strip');
          const chron8Btn = document.getElementById('chron-btn-locked');

          if (chron8Countdown) chron8Countdown.style.display = 'none';

          if (isMidnightCompleted) {
            chronCard8.classList.remove('chronicle-locked-card', 'chronicle-unlock-glow');
            if (chron8Tag) {
              chron8Tag.textContent = 'Station 08 · Meridian Transit Secured ✓';
              chron8Tag.style.color = 'var(--brass-base)';
            }
            if (chron8Title) {
              chron8Title.textContent = 'The Midnight Calibration';
              chron8Title.style.color = 'var(--brass-bright)';
            }
            if (chron8Text) {
              chron8Text.textContent = 'At true astronomical midnight, Silvia calibrated the astrolabe rig against Vega (97°), survived the electrostatic surge of The Shifting Tempest, and relayed the 2090 ly polar transit chords to the Cartographer before the radio blackout.';
            }
            if (chron8Thumb) {
              chron8Thumb.src = './assets/thumbnails/midnight_calibration_preview.webp';
              chron8Thumb.alt = 'The Midnight Calibration';
            }
            if (chron8Btn) {
              chron8Btn.className = 'btn-historical-web';
              chron8Btn.href = './constellation/midnight-calibration/transit.html#victory';
              chron8Btn.onclick = null;
              const span = chron8Btn.querySelector('span');
              if (span) span.textContent = '↺ Revisit Midnight Calibration ➔';
            }
          } else {
            chronCard8.classList.remove('chronicle-locked-card');
            if (chron8Tag) {
              chron8Tag.textContent = 'Station 08 · Meridian Open ✦';
              chron8Tag.style.color = 'var(--brass-bright)';
            }
            if (chron8Title) {
              chron8Title.textContent = 'The Midnight Calibration';
              chron8Title.style.color = 'var(--brass-bright)';
            }
            if (chron8Text) {
              chron8Text.textContent = 'The celestial meridian has aligned at astronomical midnight. The instruments of the Order and the reserve astrolabe rig are now calibrated and ready for observation against the guide stars.';
            }
            if (chron8Thumb) {
              chron8Thumb.src = './assets/thumbnails/midnight_calibration_preview.webp';
              chron8Thumb.alt = 'The Midnight Calibration';
            }
            if (chron8Btn) {
              chron8Btn.className = 'btn-historical-web';
              chron8Btn.href = './constellation/midnight-calibration/index.html';
              chron8Btn.onclick = null;
              const span = chron8Btn.querySelector('span');
              if (span) span.textContent = '✦ ENTER MERIDIAN ALIGNMENT ➔';
            }
          }
        }

        const chronCard9 = document.getElementById('chronicle-card-9');
        if (chronCard9) {
          if (!isMidnightCompleted) {
            chronCard9.style.display = 'none';
          } else {
            chronCard9.style.display = 'flex';
            const chron9Tag = document.getElementById('chronicle-9-tag') || chronCard9.querySelector('.chronicle-step-tag');
            const chron9Title = document.getElementById('chronicle-9-title') || chronCard9.querySelector('.chronicle-title');
            const chron9Text = document.getElementById('chronicle-9-text') || chronCard9.querySelector('.chronicle-text');
            const chron9Thumb = document.getElementById('chronicle-9-thumb') || chronCard9.querySelector('img');
            const chron9Btn = document.getElementById('chronicle-9-btn');

            chronCard9.className = 'chronicle-card';
            if (chron9Thumb) {
              chron9Thumb.src = './assets/thumbnails/desert_frontier_preview.webp';
              chron9Thumb.alt = 'The Celestial Cipher';
            }
            if (isCipherCompleted) {
              if (chron9Tag) {
                chron9Tag.textContent = 'Game 09 · Constellation Finale Decrypted ✓';
                chron9Tag.style.color = 'var(--brass-base)';
              }
              if (chron9Title) {
                chron9Title.textContent = 'The Celestial Cipher';
                chron9Title.style.color = 'var(--brass-bright)';
              }
              if (chron9Text) {
                chron9Text.textContent = 'Reading the folio of Deserti Limen, Silvia uncovered the Cartographer\'s true name and spoke his sacred vow across 142.85 MHz: \'You were always the treasure\'. As the transmission ended, the great sandstorm broke, sealing the Constellation Path behind her, for now.';
              }
              if (chron9Btn) {
                chron9Btn.className = 'btn-historical-web';
                chron9Btn.href = './constellation/celestial-cipher/index.html';
                chron9Btn.onclick = null;
                const span = chron9Btn.querySelector('span');
                if (span) span.textContent = '↺ Re-read Chapter ➔';
              }
            } else {
              if (chron9Tag) {
                chron9Tag.textContent = 'Game 09 · Active Objective ✦';
                chron9Tag.style.color = 'var(--brass-bright)';
              }
              if (chron9Title) {
                chron9Title.textContent = 'The Celestial Cipher';
                chron9Title.style.color = 'var(--brass-bright)';
              }
              if (chron9Text) {
                chron9Text.textContent = 'At the southern precipice where the Shifting Tempest begins to scour the mountain passes, Silvia reaches the final station of the Constellation Path: Deserti Limen. Here lies the sacred record of the Cartographer: the confession he carved into brass for Aurelia before the world broke. Beyond this threshold, the stars give way to the shifting sands of the Desert Path and the search for the Desert Oracle.';
              }
              if (chron9Btn) {
                chron9Btn.className = 'btn-historical-web';
                chron9Btn.href = './constellation/celestial-cipher/index.html';
                chron9Btn.onclick = null;
                const span = chron9Btn.querySelector('span');
                if (span) span.textContent = '✦ ENTER CELESTIAL CIPHER ➔';
              }
            }
          }
        }

        // 6. Inspector Active Selection
        // After Station 09, Silvia's live frontier is the Desert Path (storm / transceiver offline
        // until Cairn I). Do not pin the inspector on Celestial Cipher once the desert is open.
        const desertFrontier =
          isCipherCompleted &&
          (
            localStorage.getItem('order_desert_path_unlocked') === 'true' ||
            localStorage.getItem('order_sandstorm_active') === 'true' ||
            localStorage.getItem('seeker_silvia_sandstorm_active') === 'true' ||
            localStorage.getItem('order_field_wire_completed') === 'true' ||
            localStorage.getItem('order_active_map_path') === 'desert'
          );

        if (desertFrontier && !isCarles) {
          const dawnId = typeof window.getDawnNodeId === 'function' ? window.getDawnNodeId() : 10;
          if (typeof window.switchMapPath === 'function') {
            window.switchMapPath('desert', true);
          } else {
            selectMapNode(dawnId, false);
          }
        } else if (!isMidnightCompleted) {
          selectMapNode(8, false);
        } else {
          selectMapNode(9, false);
        }

        // 7. Navigation items visibility
        // The Brass Astrolabe: ONLY visible in Carles' developer sandbox; hidden for Silvia
        const navBtnAstrolabe = document.getElementById('nav-btn-astrolabe');
        if (navBtnAstrolabe) {
          navBtnAstrolabe.style.display = isCarles ? '' : 'none';
        }

        // Cliffside Workshop Chat: visible for Carles, and for Silvia ONLY once Game 9 is completed
        const btnHeaderMessenger = document.getElementById('btn-header-messenger');
        if (btnHeaderMessenger) {
          btnHeaderMessenger.style.display = (isCarles || isCipherCompleted) ? '' : 'none';
        }
        if (typeof window.updateSatchelVisibility === 'function') window.updateSatchelVisibility();
      }

      // Initial progression UI synchronization
      updateProgressionStateUI();

      // Astronomical midnight unlock sequence (target already defined above)

      let hasTriggeredUnlockAnim = false;

      function triggerStation8UnlockSequence(isManual = false) {
        if (hasTriggeredUnlockAnim && !isManual) return;
        hasTriggeredUnlockAnim = true;

        try {
          localStorage.setItem(UNLOCKED_STORAGE_KEY, 'true');
        } catch (e) {}

        // Sound fanfare
        try {
          if (sfx && typeof sfx.playCelestialChime === 'function') {
            sfx.playCelestialChime();
          }
        } catch (_) {}

        // Hide countdown bars with smooth fade
        const inspCountdownBar = document.getElementById('insp-countdown-bar');
        if (inspCountdownBar) {
          inspCountdownBar.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          inspCountdownBar.style.opacity = '0';
          inspCountdownBar.style.transform = 'scaleY(0)';
          setTimeout(() => { inspCountdownBar.style.display = 'none'; }, 400);
        }

        const chronCard8 = document.getElementById('chronicle-card-8');
        if (chronCard8) {
          chronCard8.classList.remove('chronicle-locked-card');
          chronCard8.classList.add('chronicle-unlock-glow');
          const cd = chronCard8.querySelector('.chronicle-countdown-strip');
          if (cd) {
            cd.style.transition = 'opacity 0.4s ease';
            cd.style.opacity = '0';
            setTimeout(() => { cd.style.display = 'none'; }, 400);
          }

          const chron8Tag = chronCard8.querySelector('.chronicle-step-tag');
          const chron8Title = chronCard8.querySelector('.chronicle-title');
          const chron8Text = chronCard8.querySelector('.chronicle-text');
          const chron8Thumb = chronCard8.querySelector('img');
          const chron8Btn = document.getElementById('chron-btn-locked');

          if (chron8Tag) {
            chron8Tag.textContent = 'Station 08 · Meridian Open ✦';
            chron8Tag.style.color = 'var(--brass-bright)';
          }
          if (chron8Title) {
            chron8Title.textContent = 'The Midnight Calibration';
            chron8Title.style.color = 'var(--brass-bright)';
          }
          if (chron8Text) {
            chron8Text.textContent = 'The celestial meridian has aligned at astronomical midnight. The instruments of the Order and the reserve astrolabe rig are now calibrated and ready for observation against the guide stars.';
          }
          if (chron8Thumb) {
            chron8Thumb.src = './assets/thumbnails/midnight_calibration_preview.webp';
          }
          if (chron8Btn) {
            chron8Btn.className = 'btn-historical-web';
            chron8Btn.style.cursor = 'pointer';
            chron8Btn.onclick = () => window.location.href = './constellation/midnight-calibration/index.html';
            const span = chron8Btn.querySelector('span');
            if (span) span.textContent = '✦ ENTER MERIDIAN ALIGNMENT ➔';
          }
        }

        // Map Node 8 visual unlock
        const n8Beacon = document.getElementById('node-8-beacon');
        const n8Dot = document.getElementById('node-8-dot');
        const n8Tag = document.getElementById('node-8-tag');
        const n8Title = document.getElementById('node-8-title');
        if (n8Beacon) {
          n8Beacon.style.display = 'block';
          n8Beacon.style.stroke = '#ffd885';
          n8Beacon.classList.add('node-unlock-beacon-pulse');
        }
        if (n8Dot) {
          n8Dot.classList.remove('node-dot-veiled');
          n8Dot.classList.add('node-dot-active');
        }
        if (n8Tag) {
          n8Tag.textContent = '08 · CALIBRATION READY ✦';
          n8Tag.style.fill = 'var(--brass-bright)';
        }
        if (n8Title) {
          n8Title.textContent = 'The Midnight Calibration';
          n8Title.style.fill = '#ffd885';
        }

        // Refresh Inspector panel with unlocked data
        selectMapNode(8, false);

        // Show Unlock Modal
        const unlockModal = document.getElementById('station8-unlock-modal');
        if (unlockModal) {
          unlockModal.style.display = 'flex';
        }
      }

      window.triggerStation8UnlockAnimation = () => triggerStation8UnlockSequence(true);
      window.resetStation8Lock = () => {
        const u = (currentSeeker || 'Silvia').toLowerCase();
        localStorage.removeItem(`seeker_${u}_midnight_completed`);
        localStorage.removeItem(`seeker_${u}_cipher_completed`);
        localStorage.removeItem(UNLOCKED_STORAGE_KEY);
        localStorage.removeItem('order_midnight_completed');
        localStorage.removeItem('order_cipher_completed');
        window.location.reload();
      };
      window.debugCompleteStation8 = () => {
        const u = (currentSeeker || 'Silvia').toLowerCase();
        localStorage.setItem(`seeker_${u}_midnight_completed`, 'true');
        localStorage.setItem('order_midnight_completed', 'true');
        updateProgressionStateUI();
      };

      const btnUnlockDismiss = document.getElementById('btn-unlock-dismiss');
      if (btnUnlockDismiss) {
        btnUnlockDismiss.addEventListener('click', () => {
          const unlockModal = document.getElementById('station8-unlock-modal');
          if (unlockModal) unlockModal.style.display = 'none';
          if (sfx) sfx.playMechanicalClick();
        });
      }

      function updateCountdownTimer() {
        const cdHours = document.getElementById('cd-hours');
        const cdMins = document.getElementById('cd-mins');
        const cdSecs = document.getElementById('cd-secs');
        const chronHours = document.getElementById('chron-cd-hours');
        const chronMins = document.getElementById('chron-cd-mins');
        const chronSecs = document.getElementById('chron-cd-secs');

        const isUnlocked = isStation8Unlocked();

        // If permanently unlocked, ensure countdown is hidden and buttons are active
        if (isUnlocked) {
          const inspCountdownBar = document.getElementById('insp-countdown-bar');
          if (inspCountdownBar) inspCountdownBar.style.display = 'none';
          const chronCard8 = document.getElementById('chronicle-card-8');
          if (chronCard8) {
            const cd = chronCard8.querySelector('.chronicle-countdown-strip');
            if (cd) cd.style.display = 'none';
          }
          return;
        }

        const target = getOrCreateCountdownTarget();
        const now = Date.now();
        const diff = Math.max(0, target - now);

        if (diff <= 0) {
          triggerStation8UnlockSequence(false);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const hStr = hours.toString().padStart(2, '0');
        const mStr = minutes.toString().padStart(2, '0');
        const sStr = seconds.toString().padStart(2, '0');

        if (cdHours) cdHours.textContent = hStr;
        if (cdMins) cdMins.textContent = mStr;
        if (cdSecs) cdSecs.textContent = sStr;

        if (chronHours) chronHours.textContent = hStr;
        if (chronMins) chronMins.textContent = mStr;
        if (chronSecs) chronSecs.textContent = sStr;

        const chronBtnSpan = document.querySelector('#chron-btn-locked span');
        if (chronBtnSpan) {
          chronBtnSpan.textContent = `⏳ Calibration Window in ${hours}h ${minutes}m ${seconds}s`;
        }

        const inspBadgeEl = document.getElementById('insp-badge');
        if (inspBadgeEl && inspBadgeEl.innerText.includes('STATION 08')) {
          const btnSpan = document.querySelector('#insp-btn-primary span');
          if (btnSpan) {
            btnSpan.textContent = `⏳ Calibration Window in ${hours}h ${minutes}m ${seconds}s`;
          }
        }
      }

      setInterval(updateCountdownTimer, 1000);
      updateCountdownTimer();

      // =====================================================================
      // 6. THE CIPHER LEDGER & CELESTIAL MATH WORKBENCH CONTROLLER
      // =====================================================================
      const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const CLUE_EQUATIONS = [
        { id: 'lat-deg', station: 'Station 06 → 07 Bearing', name: 'Latitude Degrees', expr: 'K + G', l1: 'K', op: '+', l2: 'G', target: 48, unit: '° N' },
        { id: 'lat-min', station: 'Station 06 → 07 Bearing', name: 'Latitude Minutes', expr: 'A + O', l1: 'A', op: '+', l2: 'O', target: 30, unit: "' N" },
        { id: 'zod-diff', station: 'Station 07 · Zodiacal Differential', name: 'Meridian Resonance', expr: 'O − A', l1: 'O', op: '-', l2: 'A', target: 16, unit: ' S' },
        { id: 'lon-deg', station: 'Vector I · Deep Desert Vector', name: 'Longitude Degrees', expr: 'B + P', l1: 'B', op: '+', l2: 'P', target: 38, unit: '° E' },
        { id: 'lon-min', station: 'Vector I · Deep Desert Vector', name: 'Longitude Minutes', expr: 'E + V', l1: 'E', op: '+', l2: 'V', target: 14, unit: "' E" },
        { id: 'lon-sec', station: 'Vector I · Deep Desert Vector', name: 'Longitude Seconds', expr: 'F + T', l1: 'F', op: '+', l2: 'T', target: 22, unit: "'' E" },
        { id: 'diff-kg', station: 'Station 09 · Folio Limen', name: 'Meridian Parallax', expr: 'K − G', l1: 'K', op: '-', l2: 'G', target: 4, unit: ' N' },
        { id: 'diff-pb', station: 'Station 09 · Folio Limen', name: 'Frontier Shift', expr: 'P − B', l1: 'P', op: '-', l2: 'B', target: 4, unit: ' E' },
        { id: 'diff-ve', station: 'Station 09 · Folio Limen', name: 'Solar Amplitude', expr: 'V − E', l1: 'V', op: '-', l2: 'E', target: 10, unit: ' S' },
        { id: 'diff-tf', station: 'Station 09 · Folio Limen', name: 'Polar Resonance', expr: 'T − F', l1: 'T', op: '-', l2: 'F', target: 10, unit: ' W' },
        { id: 'chasm-xe', station: 'Station 10 · Above the Oasis Gate', name: 'The Line of the Gate', expr: 'X + E', l1: 'X', op: '+', l2: 'E', target: 17, unit: '', requires: 'order_whispering_chasm_completed' },
        { id: 'playa-ta', station: 'Station 11 · The South Shore marker', name: 'The Line of the Salt', expr: 'T − A', l1: 'T', op: '-', l2: 'A', target: 9, unit: '', requires: 'order_salt_playa_completed' },
        { id: 'stele-rf', station: 'Station 12 · Nomad Ruins Stele', name: 'Stargazer Proportion', expr: 'R × 2', l1: 'R', op: 'x2', l2: 'F', target: null, unit: '', requires: 'order_desert_lexicon_completed' },
        { id: 'falcon-pa', station: 'Station 13 · Falcon Stone', name: 'Falcon Inscription', expr: 'P − A', l1: 'P', op: '-', l2: 'A', target: 14, unit: '', requires: 'order_oasis_clepsydra_completed' },
        { id: 'cairn2-df', station: 'Station 14 · Lid of Cairn II', name: 'The Deneb Line', expr: 'D + F', l1: 'D', op: '+', l2: 'F', target: 24, unit: '', requires: 'order_sun_monolith_completed' },
        { id: 'cairn2-ct', station: 'Station 14 · Lid of Cairn II', name: 'The Cygnus Line', expr: 'C − T', l1: 'C', op: '-', l2: 'T', target: 8, unit: '', requires: 'order_sun_monolith_completed' },
        { id: 'cairn3-wa', station: 'Station 15 · Under the copper plate of Cairn III', name: 'The West Wind Line', expr: 'W + A', l1: 'W', op: '+', l2: 'A', target: 26, unit: '', requires: 'order_sandstone_labyrinth_completed' },
        { id: 'cairn3-ne', station: 'Station 15 · Under the copper plate of Cairn III', name: 'The Wind Rose Line', expr: 'N − E', l1: 'N', op: '-', l2: 'E', target: 9, unit: '', requires: 'order_sandstone_labyrinth_completed' },
        { id: 'cairn4-sum', station: 'Station 16 · The bronze reed of Cairn IV', name: 'The Rising Echo', expr: 'S + U', l1: 'S', op: '+', l2: 'U', target: 17, unit: '', requires: 'order_cairn_iv_completed' },
        { id: 'cairn4-diff', station: 'Station 16 · The bronze reed of Cairn IV', name: 'The Falling Echo', expr: 'S − U', l1: 'S', op: '-', l2: 'U', target: 9, unit: '', requires: 'order_cairn_iv_completed' },
        { id: 'cairn5-yo', station: 'Station 17 · The light on Tower II', name: 'The First Line of Light', expr: 'Y − O', l1: 'Y', op: '-', l2: 'O', target: 2, unit: '', requires: 'order_arch_solstice_completed' },
        { id: 'cairn5-lg', station: 'Station 17 · The light on Tower II', name: 'The Second Line of Light', expr: 'L + G', l1: 'L', op: '+', l2: 'G', target: 23, unit: '', requires: 'order_arch_solstice_completed' },
        { id: 'stele-hu', station: 'Station 18 · Under the hatch of the well', name: 'The Line of the Well', expr: 'H − U', l1: 'H', op: '-', l2: 'U', target: 16, unit: '', requires: 'order_polybius_stele_completed' },
        { id: 'stele-mt', station: 'Station 18 · Under the hatch of the well', name: 'The Line of the Hatch', expr: 'M + T', l1: 'M', op: '+', l2: 'T', target: 25, unit: '', requires: 'order_polybius_stele_completed' },
        { id: 'oracle-zd', station: 'Station 19 · The back of the disc', name: 'The Line of the Rim', expr: 'Z + D', l1: 'Z', op: '+', l2: 'D', target: 23, unit: '', requires: 'order_oracle_horizon_completed' },
        { id: 'oracle-ie', station: 'Station 19 · The back of the disc', name: 'The Line of the Heart', expr: 'I + E', l1: 'I', op: '+', l2: 'E', target: 12, unit: '', requires: 'order_oracle_horizon_completed' },
        { id: 'gallery-jt', station: 'Station 22 · Inside the door of the niche', name: 'The Line of the Echo', expr: 'J × 2', l1: 'J', op: 'x2', l2: 'T', target: null, unit: '', requires: 'order_whispering_gallery_completed' }
      ];

      // Desert equations only appear once their station is solved, so the Ledger never spoils them
      const isEquationUnlocked = (eq) => !eq.requires || localStorage.getItem(eq.requires) === 'true';
      const getVisibleEquations = () => CLUE_EQUATIONS.filter(isEquationUnlocked);

      // Most equations read [L1] ± [L2] = N; the stele's proportion reads [R] × 2 = [F]
      const isProportion = (eq) => eq.op === 'x2';
      function equationFormula(eq) {
        if (isProportion(eq)) return `[${eq.l1}] × 2 = [${eq.l2}]`;
        const opSymbol = (eq.op === '-') ? '−' : '+';
        return `[${eq.l1}] ${opSymbol} [${eq.l2}] = ${eq.target}${eq.unit}`;
      }
      function equationCheck(eq, v1, v2) {
        if (isProportion(eq)) {
          const ok = v1 * 2 === v2;
          return { ok, line: ok ? `${v1} × 2 = ${v2}` : `${v1} × 2 = ${v1 * 2} ≠ ${v2}` };
        }
        const opSymbol = (eq.op === '-') ? '−' : '+';
        const result = (eq.op === '-') ? (v1 - v2) : (v1 + v2);
        const ok = result === eq.target;
        return { ok, line: ok ? `${v1} ${opSymbol} ${v2} = ${result}${eq.unit}` : `${v1} ${opSymbol} ${v2} = ${result} (Target: ${eq.target}${eq.unit})` };
      }

      const alphabetGridEl = document.getElementById('alphabet-grid');
      const clueEquationsContainer = document.getElementById('clue-equations-container');
      const sanctuaryStatusPill = document.getElementById('sanctuary-status-pill');
      const btnCopyLedger = document.getElementById('btn-copy-ledger');
      const copyBtnText = document.getElementById('copy-btn-text');
      const btnResetLedger = document.getElementById('btn-reset-ledger');


      // Automatic Migration of Legacy Un-namespaced Keys into Silvia's Profile
      function migrateLegacySilviaData() {
        try {
          if (!localStorage.getItem('seeker_silvia_cipher_ledger') && localStorage.getItem('silvia_cipher_ledger')) {
            localStorage.setItem('seeker_silvia_cipher_ledger', localStorage.getItem('silvia_cipher_ledger'));
          }
          if (!localStorage.getItem('seeker_silvia_equations_order') && localStorage.getItem('silvia_equations_order')) {
            localStorage.setItem('seeker_silvia_equations_order', localStorage.getItem('silvia_equations_order'));
          }
          if (!localStorage.getItem('seeker_silvia_equations_resolved') && localStorage.getItem('silvia_equations_resolved')) {
            localStorage.setItem('seeker_silvia_equations_resolved', localStorage.getItem('silvia_equations_resolved'));
          }
          if (!localStorage.getItem('seeker_silvia_equations_open_editors') && localStorage.getItem('silvia_equations_open_editors')) {
            localStorage.setItem('seeker_silvia_equations_open_editors', localStorage.getItem('silvia_equations_open_editors'));
          }
        } catch (e) {}
      }
      migrateLegacySilviaData();

      // Profile Runtime State
      let cipherLedger = {};
      let resolvedEquations = {};
      let equationsOrder = [];
      let openEquationEditors = {};

      function saveCipherLedger() {
        try {
          localStorage.setItem(getSeekerKey('cipher_ledger'), JSON.stringify(cipherLedger));
        } catch (e) {}
      }

      function saveEquationsOrder() {
        try {
          if (!clueEquationsContainer) return;
          const currentOrder = Array.from(clueEquationsContainer.querySelectorAll('.clue-equation-item'))
            .map(el => el.id.replace('eq-item-', ''));
          localStorage.setItem(getSeekerKey('equations_order'), JSON.stringify(currentOrder));
          equationsOrder = currentOrder;
        } catch (e) {}
      }

      function saveResolvedEquations() {
        try {
          localStorage.setItem(getSeekerKey('equations_resolved'), JSON.stringify(resolvedEquations));
        } catch (e) {}
      }

      function saveOpenEquationEditors() {
        try {
          localStorage.setItem(getSeekerKey('equations_open_editors'), JSON.stringify(openEquationEditors));
        } catch (e) {}
      }

      function getSortedEquations() {
        const visible = getVisibleEquations();
        if (!Array.isArray(equationsOrder) || equationsOrder.length === 0) {
          return visible;
        }
        const eqMap = new Map(visible.map(eq => [eq.id, eq]));
        const sorted = [];
        equationsOrder.forEach(id => {
          if (eqMap.has(id)) {
            sorted.push(eqMap.get(id));
            eqMap.delete(id);
          }
        });
        eqMap.forEach(eq => sorted.push(eq));
        return sorted;
      }

      function syncStormDevControlsVisibility() {
        // Absolute rule: Silvia never sees storm DEV controls (Bypass / Wire / Reset / Expire)
        const seeker = String(currentSeeker || localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
        const allowDev = seeker === 'carles';
        document.body.setAttribute('data-active-seeker', seeker);
        const stormDev = document.getElementById('storm-dev-controls');
        if (stormDev) stormDev.style.display = allowDev ? 'flex' : 'none';
        const btnHeaderStormToggle = document.getElementById('btn-dev-storm-toggle-header');
        if (btnHeaderStormToggle) btnHeaderStormToggle.style.display = allowDev ? 'inline-flex' : 'none';
        const testerPanel = document.getElementById('tester-panel');
        if (testerPanel) testerPanel.style.display = allowDev ? '' : 'none';
      }
      window.syncStormDevControlsVisibility = syncStormDevControlsVisibility;
      // The Ledger as the Surveyor's Balance reads it (js/ledger-balance.js): her lines and her letters, nothing more
      window.EclipseLedger = {
        equations: () => getVisibleEquations().map((eq) => Object.assign({}, eq)),
        value: (ch) => cipherLedger[ch],
        set: (ch, n) => { cipherLedger[ch] = n; saveCipherLedger(); renderAlphabetGrid(); renderClueEquations(); updateAllLedgerUI(ch); }
      };

      function updateProfileHeaderUI() {
        const seekerActivePill = document.getElementById('seeker-active-pill');
        const seekerNameDisplay = document.getElementById('seeker-name-display');
        const isCarles = (currentSeeker.toLowerCase() === 'carles');

        syncStormDevControlsVisibility();

        if (seekerActivePill && seekerNameDisplay) {
          if (isCarles) {
            seekerActivePill.classList.add('is-carles');
            seekerNameDisplay.textContent = 'Carles (Test Sandbox)';
            const urlForce = new URLSearchParams(window.location.search).get('storm') === '1';
            if (window.SandstormLockdown && !urlForce) {
              window.SandstormLockdown.deactivate();
            }
            if (typeof window.switchMapPath === 'function') {
              window.switchMapPath('desert', false);
            }
            if (typeof window.updateSatchelVisibility === 'function') {
              window.updateSatchelVisibility();
            }
            if (typeof window.updateMessengerBadge === 'function') {
              window.updateMessengerBadge();
            }
            if (typeof window.updateInventoryBadge === 'function') {
              window.updateInventoryBadge();
            }
          } else {
            seekerActivePill.classList.remove('is-carles');
            seekerNameDisplay.textContent = 'Seeker: Silvia';
            // Silvia baseline: the storm has ended. Dawn has broken at Outer Watchtower VI.
            try {
              localStorage.removeItem('order_sandstorm_active');
              localStorage.removeItem('seeker_silvia_sandstorm_active');
              localStorage.setItem('order_storm_tester_bypassed', 'true');
              localStorage.setItem('order_sandstorm_wire_unlocked', 'true');
              localStorage.setItem('order_desert_path_unlocked', 'true');
            } catch (e) {}
            if (window.SandstormLockdown) {
              window.SandstormLockdown.deactivate(false);
            }
            if (typeof window.switchMapPath === 'function') {
              window.switchMapPath('desert', false);
            }
            if (typeof window.updateSatchelVisibility === 'function') {
              window.updateSatchelVisibility();
            }
            if (typeof window.updateMessengerBadge === 'function') {
              window.updateMessengerBadge();
            }
            if (typeof window.updateInventoryBadge === 'function') {
              window.updateInventoryBadge();
            }
          }
        }

        const sidebarSeekerDisplay = document.getElementById('sidebar-seeker-display');
        if (sidebarSeekerDisplay) {
          sidebarSeekerDisplay.textContent = isCarles ? "Carles's Sandbox" : "Silvia's Journey";
        }
      }

      // Load Profile Data from Active Seeker Sandbox
      function loadCurrentProfile() {
        if (typeof syncWaypointBaseline === 'function') {
          syncWaypointBaseline();
        } else if (typeof syncSilviaWaypointBaseline === 'function') {
          syncSilviaWaypointBaseline();
        }
        try {
          const savedLedger = localStorage.getItem(getSeekerKey('cipher_ledger'));
          cipherLedger = savedLedger ? JSON.parse(savedLedger) : {};
        } catch (e) {
          cipherLedger = {};
        }

        try {
          const savedOrder = localStorage.getItem(getSeekerKey('equations_order'));
          equationsOrder = savedOrder ? JSON.parse(savedOrder) : [];
        } catch (e) {
          equationsOrder = [];
        }

        try {
          const savedRes = localStorage.getItem(getSeekerKey('equations_resolved'));
          resolvedEquations = savedRes ? JSON.parse(savedRes) : {};
        } catch (e) {
          resolvedEquations = {};
        }

        try {
          const savedOpen = localStorage.getItem(getSeekerKey('equations_open_editors'));
          openEquationEditors = savedOpen ? JSON.parse(savedOpen) : {};
        } catch (e) {
          openEquationEditors = {};
        }

        updateProfileHeaderUI();
        renderAlphabetGrid();
        renderClueEquations();
        updateAllLedgerUI();
        updateProgressionStateUI();
      }

      // Render 26 Alphabet Input Cards
      function renderAlphabetGrid() {
        if (!alphabetGridEl) return;
        alphabetGridEl.innerHTML = '';

        // Value frequency map to detect duplicates across alphabet
        const valFreq = {};
        Object.values(cipherLedger).forEach(val => {
          if (val !== undefined && val !== null && val !== '') {
            valFreq[val] = (valFreq[val] || 0) + 1;
          }
        });

        ALPHABET.forEach((char) => {
          const val = cipherLedger[char];
          const hasVal = (val !== undefined && val !== null && val !== '');
          const isDuplicate = hasVal && valFreq[val] > 1;

          const card = document.createElement('div');
          card.className = 'letter-node-box' + (hasVal ? ' has-value' : '') + (isDuplicate ? ' has-conflict' : '');
          card.id = `letter-card-${char}`;

          let statusText = 'Unassigned';
          if (hasVal) {
            statusText = isDuplicate ? `⚠ Dup (${val})` : `Val: ${val}`;
          }

          card.innerHTML = `
            <div class="letter-node-header">
              <span class="letter-char">${char}</span>
            </div>
            <input type="number" min="1" max="26" class="letter-val-input" data-letter="${char}" placeholder="—" value="${hasVal ? val : ''}" autocomplete="off">
            <span class="letter-status-indicator">${statusText}</span>
          `;

          const inputEl = card.querySelector('.letter-val-input');
          inputEl.addEventListener('input', (e) => {
            const raw = e.target.value.trim();
            if (raw === '') {
              delete cipherLedger[char];
            } else {
              const num = parseInt(raw, 10);
              if (!isNaN(num)) {
                cipherLedger[char] = num;
              }
            }
            saveCipherLedger();
            updateAllLedgerUI(char);
          });

          alphabetGridEl.appendChild(card);
        });
      }

      // Drag & Drop / Touch Reordering Engine
      let draggedEqItem = null;

      function setupEquationDragAndDrop(item, eqId) {
        item.setAttribute('draggable', 'true');

        // Prevent dragging when clicking inside interactive elements
        item.addEventListener('mousedown', (e) => {
          if (e.target.closest('input, button, .clue-eq-editor-panel')) {
            item.setAttribute('draggable', 'false');
          } else {
            item.setAttribute('draggable', 'true');
          }
        });

        // HTML5 Desktop Drag Events
        item.addEventListener('dragstart', (e) => {
          if (e.target.closest('input, button, .clue-eq-editor-panel')) {
            e.preventDefault();
            return;
          }
          draggedEqItem = item;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', eqId);
          setTimeout(() => {
            if (draggedEqItem) draggedEqItem.classList.add('is-dragging');
          }, 0);
        });

        item.addEventListener('dragend', () => {
          if (draggedEqItem) {
            draggedEqItem.classList.remove('is-dragging');
            draggedEqItem = null;
          }
          if (clueEquationsContainer) {
            clueEquationsContainer.querySelectorAll('.clue-equation-item').forEach(el => {
              el.classList.remove('drag-over-top', 'drag-over-bottom');
            });
          }
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          if (!draggedEqItem || draggedEqItem === item) return;
          e.dataTransfer.dropEffect = 'move';

          const rect = item.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            item.classList.add('drag-over-top');
            item.classList.remove('drag-over-bottom');
          } else {
            item.classList.add('drag-over-bottom');
            item.classList.remove('drag-over-top');
          }
        });

        item.addEventListener('dragleave', () => {
          item.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('drag-over-top', 'drag-over-bottom');
          if (!draggedEqItem || draggedEqItem === item) return;

          const rect = item.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            clueEquationsContainer.insertBefore(draggedEqItem, item);
          } else {
            clueEquationsContainer.insertBefore(draggedEqItem, item.nextSibling);
          }

          saveEquationsOrder();
          if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
        });

        // Touch & Pointer hold-and-drag support (for touch screens and click-and-hold)
        item.addEventListener('pointerdown', (e) => {
          if (e.target.closest('input, button, .clue-eq-editor-panel')) return;
          if (e.pointerType === 'mouse' && e.button !== 0) return;

          const isDirectHandle = !!e.target.closest('.eq-drag-handle');
          let dragTimer = null;
          let activePointerDrag = false;
          const startClientY = e.clientY;

          const activatePointerDrag = () => {
            activePointerDrag = true;
            draggedEqItem = item;
            item.classList.add('is-dragging');
            if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
          };

          if (isDirectHandle) {
            activatePointerDrag();
          } else {
            dragTimer = setTimeout(activatePointerDrag, 220);
          }

          const onPointerMove = (moveEvt) => {
            if (!activePointerDrag) {
              if (Math.abs(moveEvt.clientY - startClientY) > 8) {
                clearTimeout(dragTimer);
              }
              return;
            }

            moveEvt.preventDefault();
            const elements = document.elementsFromPoint(moveEvt.clientX, moveEvt.clientY);
            const targetCard = elements.find(el => el.classList && el.classList.contains('clue-equation-item') && el !== item);

            clueEquationsContainer.querySelectorAll('.clue-equation-item').forEach(el => {
              if (el !== targetCard) el.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            if (targetCard && clueEquationsContainer.contains(targetCard)) {
              const rect = targetCard.getBoundingClientRect();
              const midY = rect.top + rect.height / 2;
              if (moveEvt.clientY < midY) {
                targetCard.classList.add('drag-over-top');
                targetCard.classList.remove('drag-over-bottom');
              } else {
                targetCard.classList.add('drag-over-bottom');
                targetCard.classList.remove('drag-over-top');
              }
            }
          };

          const onPointerUp = (upEvt) => {
            clearTimeout(dragTimer);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);

            if (!activePointerDrag) return;
            activePointerDrag = false;
            item.classList.remove('is-dragging');

            const elements = document.elementsFromPoint(upEvt.clientX, upEvt.clientY);
            const targetCard = elements.find(el => el.classList && el.classList.contains('clue-equation-item') && el !== item);

            if (targetCard && clueEquationsContainer.contains(targetCard)) {
              const rect = targetCard.getBoundingClientRect();
              const midY = rect.top + rect.height / 2;
              if (upEvt.clientY < midY) {
                clueEquationsContainer.insertBefore(item, targetCard);
              } else {
                clueEquationsContainer.insertBefore(item, targetCard.nextSibling);
              }
              saveEquationsOrder();
              if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
            }

            clueEquationsContainer.querySelectorAll('.clue-equation-item').forEach(el => {
              el.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            draggedEqItem = null;
          };

          window.addEventListener('pointermove', onPointerMove, { passive: false });
          window.addEventListener('pointerup', onPointerUp);
          window.addEventListener('pointercancel', onPointerUp);
        });
      }

      // Render Clue Equations DOM (in saved custom order)
      function renderClueEquations() {
        if (!clueEquationsContainer) return;
        clueEquationsContainer.innerHTML = '';

        const equationsToRender = getSortedEquations();

        equationsToRender.forEach(eq => {
          const item = document.createElement('div');
          item.className = 'clue-equation-item';
          item.id = `eq-item-${eq.id}`;

          const opSymbol = isProportion(eq) ? '× 2 =' : ((eq.op === '-') ? '−' : '+');
          const v1 = cipherLedger[eq.l1];
          const v2 = cipherLedger[eq.l2];
          const val1Str = (v1 !== undefined && v1 !== null && v1 !== '') ? v1 : '';
          const val2Str = (v2 !== undefined && v2 !== null && v2 !== '') ? v2 : '';

          item.innerHTML = `
            <div class="clue-eq-header-row">
              <div class="clue-eq-left-group">
                <div class="eq-drag-handle" title="Hold & drag up or down to reorder">
                  <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
                    <circle cx="3" cy="3" r="1.5"/>
                    <circle cx="9" cy="3" r="1.5"/>
                    <circle cx="3" cy="9" r="1.5"/>
                    <circle cx="9" cy="9" r="1.5"/>
                    <circle cx="3" cy="15" r="1.5"/>
                    <circle cx="9" cy="15" r="1.5"/>
                  </svg>
                </div>
                <div class="clue-eq-info">
                  <div class="clue-eq-meta">
                    <span class="clue-eq-station">${eq.station}</span>
                    <span class="clue-eq-name">${eq.name}</span>
                  </div>
                  <div class="clue-eq-formula-line">
                    <span class="clue-eq-formula">${equationFormula(eq)}</span>
                    <span class="clue-eq-live-values waiting" id="eq-live-${eq.id}">
                      Values: ?
                    </span>
                  </div>
                </div>
              </div>
              <div class="clue-eq-actions">
                <button type="button" class="eq-action-btn eq-btn-edit" id="eq-btn-edit-${eq.id}" title="Assign values for ${eq.l1} & ${eq.l2}">
                  <span>✏️</span>
                  <span class="edit-label">Edit Values</span>
                </button>
                <button type="button" class="eq-action-btn eq-btn-check" id="eq-btn-check-${eq.id}" title="Toggle equation resolved status">
                  <span class="check-icon">✓</span>
                  <span class="check-label">Resolve</span>
                </button>
              </div>
            </div>

            <!-- Inline Letter Assignment & Calculation Drawer -->
            <div class="clue-eq-editor-panel" id="eq-panel-${eq.id}">
              <div class="eq-inputs-container">
                <div class="eq-letter-field">
                  <strong>${eq.l1} =</strong>
                  <input type="number" min="1" max="26" class="eq-number-input eq-input-${eq.l1}" data-letter="${eq.l1}" placeholder="—" value="${val1Str}" autocomplete="off">
                </div>
                <span class="eq-editor-op">${opSymbol}</span>
                <div class="eq-letter-field">
                  <strong>${eq.l2} =</strong>
                  <input type="number" min="1" max="26" class="eq-number-input eq-input-${eq.l2}" data-letter="${eq.l2}" placeholder="—" value="${val2Str}" autocomplete="off">
                </div>
                ${isProportion(eq) ? '' : '<span class="eq-editor-equals">=</span>'}
              </div>
              <div class="eq-calc-feedback waiting" id="eq-feedback-${eq.id}">
                Assign values to calculate
              </div>
            </div>
          `;

          // Setup Drag and Drop / Touch Reordering
          setupEquationDragAndDrop(item, eq.id);

          // Restore open drawer state if previously opened
          const panel = item.querySelector(`#eq-panel-${eq.id}`);
          const editBtn = item.querySelector(`#eq-btn-edit-${eq.id}`);
          if (openEquationEditors[eq.id]) {
            panel.classList.add('is-open');
            editBtn.classList.add('active');
            const label = editBtn.querySelector('.edit-label');
            if (label) label.textContent = 'Done';
          }

          // Event: Edit (Pencil) button toggles drawer
          editBtn.addEventListener('click', () => {
            if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
            openEquationEditors[eq.id] = !openEquationEditors[eq.id];
            saveOpenEquationEditors();
            const isOpen = openEquationEditors[eq.id];
            panel.classList.toggle('is-open', isOpen);
            editBtn.classList.toggle('active', isOpen);
            const label = editBtn.querySelector('.edit-label');
            if (label) label.textContent = isOpen ? 'Done' : 'Edit Values';
            if (isOpen) {
              const firstInput = panel.querySelector('.eq-number-input');
              if (firstInput) firstInput.focus();
            }
          });

          // Event: Check (Tick) button toggles resolved
          const checkBtn = item.querySelector(`#eq-btn-check-${eq.id}`);
          checkBtn.addEventListener('click', () => {
            if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
            resolvedEquations[eq.id] = !resolvedEquations[eq.id];
            saveResolvedEquations();
            updateClueEquationsUI();
          });

          // Events: Inline inputs for letters
          const inputs = item.querySelectorAll('.eq-number-input');
          inputs.forEach(input => {
            input.addEventListener('input', (e) => {
              const char = e.target.getAttribute('data-letter');
              const raw = e.target.value.trim();
              if (raw === '') {
                delete cipherLedger[char];
              } else {
                const num = parseInt(raw, 10);
                if (!isNaN(num)) {
                  cipherLedger[char] = num;
                }
              }
              saveCipherLedger();
              updateAllLedgerUI(char);
            });
          });

          clueEquationsContainer.appendChild(item);
        });
      }

      // Update Clue Equations UI in-place (no DOM recreation, focus safe)
      function updateClueEquationsUI(activeChar) {
        if (!clueEquationsContainer) return;

        CLUE_EQUATIONS.forEach(eq => {
          const card = document.getElementById(`eq-item-${eq.id}`);
          if (!card) return;

          const v1 = cipherLedger[eq.l1];
          const v2 = cipherLedger[eq.l2];
          const hasV1 = (v1 !== undefined && v1 !== null && v1 !== '');
          const hasV2 = (v2 !== undefined && v2 !== null && v2 !== '');
          const opSymbol = (eq.op === '-') ? '−' : '+';

          // Sync inline input values if not currently focused
          const in1 = card.querySelector(`.eq-input-${eq.l1}`);
          const in2 = card.querySelector(`.eq-input-${eq.l2}`);
          if (in1 && document.activeElement !== in1) {
            in1.value = hasV1 ? v1 : '';
          }
          if (in2 && document.activeElement !== in2) {
            in2.value = hasV2 ? v2 : '';
          }

          const liveBadge = document.getElementById(`eq-live-${eq.id}`);
          const feedback = document.getElementById(`eq-feedback-${eq.id}`);
          const checkBtn = document.getElementById(`eq-btn-check-${eq.id}`);

          let liveHtml = '';
          let feedbackHtml = '';
          let stateClass = 'waiting';

          if (hasV1 && hasV2) {
            const check = equationCheck(eq, v1, v2);
            if (check.ok) {
              stateClass = 'is-balanced';
              liveHtml = `Values: ${check.line} (Balanced ✓)`;
              feedbackHtml = `✓ Balanced: ${check.line}`;
              // Auto-mark resolved on mathematical match if not already explicitly toggled off
              if (resolvedEquations[eq.id] === undefined) {
                resolvedEquations[eq.id] = true;
                saveResolvedEquations();
              }
            } else {
              stateClass = 'is-imbalanced';
              liveHtml = `Values: ${check.line}`;
              feedbackHtml = `⚠ Not balanced: ${check.line}`;
            }
          } else if (isProportion(eq)) {
            stateClass = 'waiting';
            liveHtml = `Values: ${hasV1 ? v1 : `[${eq.l1}]`} × 2 = ${hasV2 ? v2 : `[${eq.l2}]`}`;
            feedbackHtml = `Assign values to ${eq.l1} and ${eq.l2} to test the proportion`;
          } else if (hasV1) {
            stateClass = 'waiting';
            liveHtml = `Values: ${v1} ${opSymbol} [${eq.l2}] = ? (Need ${eq.l2})`;
            feedbackHtml = `${v1} ${opSymbol} [${eq.l2}] = ? · Assign value to ${eq.l2}`;
          } else if (hasV2) {
            stateClass = 'waiting';
            liveHtml = `Values: [${eq.l1}] ${opSymbol} ${v2} = ? (Need ${eq.l1})`;
            feedbackHtml = `[${eq.l1}] ${opSymbol} ${v2} = ? · Assign value to ${eq.l1}`;
          } else {
            stateClass = 'waiting';
            liveHtml = `Values: [${eq.l1}] ${opSymbol} [${eq.l2}] = ?`;
            feedbackHtml = `Assign values to ${eq.l1} and ${eq.l2} to test equation`;
          }

          if (liveBadge) {
            liveBadge.className = `clue-eq-live-values ${stateClass}`;
            liveBadge.textContent = liveHtml;
          }

          if (feedback) {
            feedback.className = `eq-calc-feedback ${stateClass}`;
            feedback.textContent = feedbackHtml;
          }

          const isResolved = !!resolvedEquations[eq.id];
          card.classList.toggle('is-resolved', isResolved);

          if (checkBtn) {
            checkBtn.classList.toggle('is-resolved', isResolved);
            const checkLabel = checkBtn.querySelector('.check-label');
            if (checkLabel) {
              checkLabel.textContent = isResolved ? 'Resolved ✓' : 'Resolve';
            }
          }
        });

        // Update overall resolved status pill
        const visibleEquations = getVisibleEquations();
        const resolvedTotal = visibleEquations.filter(eq => !!resolvedEquations[eq.id]).length;
        if (sanctuaryStatusPill) {
          sanctuaryStatusPill.innerText = `${resolvedTotal} / ${visibleEquations.length} Equations Resolved`;
          sanctuaryStatusPill.classList.toggle('all-balanced', resolvedTotal === visibleEquations.length);
        }
      }

      // Update All Ledger UI (both Alphabet Grid and Clue Equations)
      function updateAllLedgerUI(activeChar) {
        document.dispatchEvent(new CustomEvent('ledger:changed', { detail: activeChar || null }));
        const valFreq = {};
        Object.entries(cipherLedger).forEach(([k, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            valFreq[val] = (valFreq[val] || 0) + 1;
          }
        });

        ALPHABET.forEach(char => {
          const card = document.getElementById(`letter-card-${char}`);
          if (!card) return;
          const val = cipherLedger[char];
          const hasVal = (val !== undefined && val !== null && val !== '');
          const isDuplicate = hasVal && valFreq[val] > 1;

          card.classList.toggle('has-value', hasVal);
          card.classList.toggle('has-conflict', isDuplicate);

          const inputEl = card.querySelector('.letter-val-input');
          if (inputEl && document.activeElement !== inputEl) {
            inputEl.value = hasVal ? val : '';
          }

          const statusEl = card.querySelector('.letter-status-indicator');
          if (statusEl) {
            if (hasVal) {
              statusEl.innerText = isDuplicate ? `⚠ Dup (${val})` : `Val: ${val}`;
            } else {
              statusEl.innerText = 'Unassigned';
            }
          }
        });

        updateClueEquationsUI(activeChar);
      }

      // Copy Ledger Summary Action
      if (btnCopyLedger) {
        btnCopyLedger.addEventListener('click', () => {
          if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();

          let text = '=========================================\n';
          text += "THE ECLIPSE ORDER · THE CIPHER LEDGER\n";
          text += `${currentSeeker}'s Celestial Cryptanalysis Summary\n`;
          text += '=========================================\n\n';

          text += '[Alphabet Numerical Values (1-26)]\n';
          const chunks = [];
          for (let i = 0; i < ALPHABET.length; i += 6) {
            const slice = ALPHABET.slice(i, i + 6).map(ch => {
              const v = cipherLedger[ch];
              return `${ch}: ${v !== undefined && v !== null && v !== '' ? v : '—'}`;
            });
            chunks.push(slice.join(' | '));
          }
          text += chunks.join('\n') + '\n\n';

          text += '[Coordinate Equations & Status]\n';
          const equationsToExport = getSortedEquations();
          equationsToExport.forEach(eq => {
            const v1 = cipherLedger[eq.l1];
            const v2 = cipherLedger[eq.l2];
            const hasBoth = (v1 !== undefined && v1 !== null && v1 !== '' && v2 !== undefined && v2 !== null && v2 !== '');
            const isRes = !!resolvedEquations[eq.id];
            const resStatus = isRes ? '[RESOLVED ✓]' : '[PENDING]';
            if (hasBoth) {
              const check = equationCheck(eq, v1, v2);
              text += `• ${eq.name}: ${equationFormula(eq)} | Values: ${check.line} [${check.ok ? 'BALANCED' : 'IMBALANCED'}] ${resStatus}\n`;
            } else {
              text += `• ${eq.name}: ${equationFormula(eq)} [Awaiting letter values] ${resStatus}\n`;
            }
          });

          navigator.clipboard.writeText(text).then(() => {
            if (copyBtnText) copyBtnText.innerText = 'Copied! ✓';
            setTimeout(() => {
              if (copyBtnText) copyBtnText.innerText = 'Copy Notes';
            }, 2000);
          }).catch(() => {
            alert('Failed to copy to clipboard automatically.');
          });
        });
      }

      // A desert equation unlocks when its station is solved: show it next time the Ledger opens, without a reload
      function refreshLedgerUnlocks() {
        if (!clueEquationsContainer) return;
        const rendered = clueEquationsContainer.querySelectorAll('.clue-equation-item').length;
        if (rendered !== getVisibleEquations().length) {
          renderClueEquations();
          updateAllLedgerUI();
        }
      }
      window.refreshLedgerUnlocks = refreshLedgerUnlocks;
      document.querySelectorAll('[data-view="view-cipher"]').forEach(btn => btn.addEventListener('click', refreshLedgerUnlocks));

      // Reset All Letters Action (Scoped strictly to current seeker)
      if (btnResetLedger) {
        btnResetLedger.addEventListener('click', () => {
          if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
          const ok = confirm(`Reset all alphabet letter assignments and resolved equations for ${currentSeeker}?`);
          if (ok) {
            cipherLedger = {};
            resolvedEquations = {};
            saveCipherLedger();
            saveResolvedEquations();
            renderAlphabetGrid();
            updateAllLedgerUI();
          }
        });
      }

      // Sanctuary Gate Authentication Form & Session Management
      const gateOverlay = document.getElementById('sanctuary-gate-overlay');
      const gateForm = document.getElementById('gate-auth-form');
      const gateUser = document.getElementById('gate-username');
      const gatePass = document.getElementById('gate-password');
      const gateError = document.getElementById('gate-error-msg');
      const btnSeekerSwitch = document.getElementById('btn-seeker-switch');

      // Check Session Authentication on Arrival (never changes the saved seeker)
      const urlAuthParams = new URLSearchParams(window.location.search);
      const isLocalHostEnvironment = window.location.protocol === 'file:' ||
                                     window.location.hostname === 'localhost' ||
                                     window.location.hostname === '127.0.0.1';
      if (urlAuthParams.get('auth') === '1' || isLocalHostEnvironment) {
        sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
      }
      const isSessionAuth = (sessionStorage.getItem('the_eclipse_session_authenticated') === 'true') ||
                            (typeof window.__gateIsOpen === 'function' && window.__gateIsOpen()) ||
                            isLocalHostEnvironment;
      if (isSessionAuth && gateOverlay) {
        gateOverlay.classList.add('gate-hidden');
      } else if (gateOverlay) {
        gateOverlay.classList.remove('gate-hidden');
        if (gateUser) gateUser.value = currentSeeker;
      }

      // Initial Profile Load
      loadCurrentProfile();

      if (gateForm) {
        gateForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const username = (gateUser.value || '').trim();
          const userKey = username.toLowerCase();
          const password = (gatePass.value || '').trim();

          const account = VALID_ACCOUNTS[userKey];
          if (account && account.pass === password) {
            // Switch Seeker → successful login: the ONLY path that may change the active profile
            if (gateError) gateError.style.display = 'none';
            const seekerBefore = currentSeeker;
            persistActiveSeeker(account.name);
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            // A different seeker brings a different adventure: reload so every game reads their progress
            if (normalizeSeekerName(account.name) !== seekerBefore) {
              window.location.reload();
              return;
            }
            if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
            if (gateOverlay) gateOverlay.classList.add('gate-hidden');
            gatePass.value = '';
            loadCurrentProfile();
          } else {
            // Authentication Failure — keep previous seeker untouched
            if (gateError) {
              gateError.style.display = 'block';
            }
            gatePass.value = '';
            gatePass.focus();
          }
        });
      }

      // Switch Seeker: opens the gate only. Profile stays until login succeeds.
      if (btnSeekerSwitch) {
        btnSeekerSwitch.addEventListener('click', () => {
          if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
          if (gateOverlay) {
            sessionStorage.removeItem('the_eclipse_session_authenticated');
            try { localStorage.removeItem('the_eclipse_gate_ok_at'); } catch (e) {}
            if (gateError) gateError.style.display = 'none';
            gateOverlay.classList.remove('gate-hidden');
            if (gateUser) {
              // Prefill the OTHER name as a hint only; profile does not change until login succeeds
              gateUser.value = (currentSeeker.toLowerCase() === 'silvia') ? 'Carles' : 'Silvia';
              if (gatePass) gatePass.value = '';
              setTimeout(() => {
                if (gatePass) gatePass.focus();
              }, 100);
            }
          }
        });
      }

      // F5 / back-forward cache: always re-assert the saved seeker (never invent a new one)
      function restoreSavedSeekerOnReload() {
        const saved = normalizeSeekerName(localStorage.getItem('the_eclipse_active_seeker'));
        if (!saved) return;
        if (saved !== currentSeeker || document.body.getAttribute('data-active-seeker') !== saved.toLowerCase()) {
          persistActiveSeeker(saved);
          if (typeof loadCurrentProfile === 'function') loadCurrentProfile();
        } else {
          try { document.body.setAttribute('data-active-seeker', saved.toLowerCase()); } catch (e) {}
        }
      }
      window.addEventListener('pageshow', restoreSavedSeekerOnReload);
      window.addEventListener('focus', restoreSavedSeekerOnReload);

      // 7. Multi-Layered Cosmic Starfield & Dynamic Weather Canvas
      const initialActiveSec = document.querySelector('.hub-view-section.active');
      const initialActiveId = initialActiveSec ? initialActiveSec.id : 'view-trail';
      if (!document.body.getAttribute('data-active-view')) {
        document.body.setAttribute('data-active-view', initialActiveId);
      }
      if (initialActiveId === 'view-trail') {
        document.body.classList.add('constellation-trail');
      }
      const canvas = document.getElementById('ambient-stars');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
          w = canvas.width = window.innerWidth;
          h = canvas.height = window.innerHeight;
          initStars();
          initSand();
          initConstellations();
        });

        let stars = [];
        let shootingStars = [];
        let sand = [];
        let constellations = [];

        function initStars() {
          stars = [];
          const count = Math.floor((w * h) / 8000);
          for (let i = 0; i < count; i++) {
            // Chromatic mix: golden, cyan, icy white
            const colorType = Math.random();
            let color = 'rgba(255, 224, 153, '; // gold
            if (colorType > 0.7) color = 'rgba(79, 227, 193, '; // cyan
            else if (colorType > 0.5) color = 'rgba(230, 240, 255, '; // white

            stars.push({
              x: Math.random() * w,
              y: Math.random() * h,
              r: Math.random() * 1.5 + 0.3,
              a: Math.random() * 0.7 + 0.25,
              color: color,
              speed: Math.random() * 0.015 + 0.005,
              phase: Math.random() * Math.PI * 2
            });
          }
        }
        initStars();

        // Faint constellation figures (3 to 6 linked stars) for the Constellation Trail backdrop
        function initConstellations() {
          constellations = [];
          const figures = Math.max(5, Math.floor(w / 230));
          for (let f = 0; f < figures; f++) {
            const pts = [];
            let x = 60 + Math.random() * (w - 120);
            let y = 40 + Math.random() * (h - 80);
            const n = 3 + Math.floor(Math.random() * 4);
            for (let k = 0; k < n; k++) {
              pts.push({ x: x, y: y, r: 1.5 + Math.random() * 1.5, ph: Math.random() * Math.PI * 2 });
              x = Math.max(20, Math.min(w - 20, x + 24 + (Math.random() * 2 - 1) * 120));
              y = Math.max(20, Math.min(h - 20, y + (Math.random() * 2 - 1) * 100));
            }
            constellations.push(pts);
          }
        }
        initConstellations();

        function initSand() {
          sand = [];
          const count = Math.floor((w * h) / 14000);
          for (let i = 0; i < count; i++) {
            sand.push({
              x: Math.random() * w,
              y: Math.random() * h,
              r: Math.random() * 1.1 + 0.25,
              vx: -(0.25 + Math.random() * 0.7),
              vy: 0.12 + Math.random() * 0.4,
              a: 0.04 + Math.random() * 0.12
            });
          }
        }
        initSand();

        function trailIsActive() {
          const trail = document.getElementById('view-trail');
          return !!(trail && trail.classList.contains('active'));
        }

        function maybeSpawnShootingStar() {
          if (shootingStars.length < 2 && Math.random() < 0.007) {
            shootingStars.push({
              x: Math.random() * w * 0.8,
              y: Math.random() * h * 0.4,
              len: Math.random() * 80 + 60,
              speed: Math.random() * 7 + 9,
              angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
              opacity: 1
            });
          }
        }

        let lastStarsTime = 0;
        const targetFPS = 24;
        const frameInterval = 1000 / targetFPS; // 41.67 ms

        function renderStars(timestamp) {
          requestAnimationFrame(renderStars);
          if (document.hidden || window.__eclipseGameOpen) return; // Completely idle in background tabs, and under a game window

          const elapsed = timestamp - lastStarsTime;
          if (elapsed < frameInterval) return;
          lastStarsTime = timestamp - (elapsed % frameInterval);

          ctx.clearRect(0, 0, w, h);
          const t = timestamp * 0.001;
          const activeView = document.body.getAttribute('data-active-view') || (trailIsActive() ? 'view-trail' : '');
          const onTrail = activeView === 'view-trail';
          const onMessenger = activeView === 'view-field-wire';
          const onTransmissions = activeView === 'view-transmissions';
          const onArchives = activeView === 'view-archives';

          if (onMessenger) {
            // The Cliffside Workshop: Warm artisan forge embers & floating candlelight dust motes
            for (let i = 0; i < sand.length; i++) {
              const g = sand[i];
              g.x += Math.sin(t * 0.8 + i) * 0.45;
              g.y -= (g.vy * 0.4 + 0.35); // drift gently upward like warm hearth heat
              if (g.y < -8) {
                g.y = h + 8;
                g.x = Math.random() * w;
              }
              if (g.x < -8) g.x = w + 8;
              if (g.x > w + 8) g.x = -8;
              const flicker = 0.55 + 0.45 * Math.sin(t * 2.5 + i * 0.7);
              ctx.fillStyle = 'rgba(251, 191, 36, ' + (g.a * 0.85 * flicker) + ')';
              ctx.fillRect(g.x, g.y, g.r * 1.2, g.r * 1.2);
            }
            return; // Pure workshop ambiance, no lightning or cold celestial stars
          }

          if (onTransmissions || onArchives) {
            return; // Clean, authentic environmental backdrops
          }

          const onDesertTrail = onTrail && document.documentElement.getAttribute('data-map-path') === 'desert';

          if (onDesertTrail) {
            // Golden-hour desert: a few early stars high in the sky, wind-blown sand streaks and drifting dust
            const gust = 0.75 + 0.5 * Math.sin(t * 0.18);
            for (let i = 0; i < stars.length; i += 6) {
              const s = stars[i];
              if (s.y > h * 0.4) continue;
              const a = (s.a + Math.sin(t * s.speed + s.phase) * 0.3) * 0.35 * (1 - s.y / (h * 0.4));
              ctx.fillStyle = s.color + Math.max(0.03, Math.min(1, a)) + ')';
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.lineWidth = 1;
            for (let i = 0; i < sand.length; i++) {
              const g = sand[i];
              g.x += g.vx * 3.2 * gust;
              g.y += g.vy * 0.5;
              if (g.x < -30) g.x = w + 30;
              if (g.y > h + 4) g.y = -4;
              ctx.strokeStyle = 'rgba(240, 196, 130, ' + Math.min(0.5, g.a * 2.2) + ')';
              ctx.beginPath();
              ctx.moveTo(g.x, g.y);
              ctx.lineTo(g.x + 12 + g.r * 8, g.y - g.vy * 2);
              ctx.stroke();
            }
            return;
          }

          // Render Calm Twinkling Stars (No mouse lag or parallax)
          const starStep = 1;
          const starDim = onTrail ? 1 : 0.8;
          for (let i = 0; i < stars.length; i += starStep) {
            const s = stars[i];
            const a = (s.a + Math.sin(t * s.speed + s.phase) * 0.3) * starDim;

            ctx.fillStyle = s.color + Math.max(0.04, Math.min(1, a)) + ')';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }

          if (onTrail) {
            // Constellation Trail: faint figures drawn between linked stars
            ctx.lineWidth = 1;
            for (let f = 0; f < constellations.length; f++) {
              const pts = constellations[f];
              ctx.strokeStyle = 'rgba(150, 190, 255, 0.17)';
              ctx.beginPath();
              pts.forEach((p, idx) => {
                if (idx === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
              });
              ctx.stroke();
              pts.forEach((p) => {
                const tw = 0.6 + 0.4 * Math.sin(t * 1.3 + p.ph);
                ctx.fillStyle = 'rgba(200, 222, 255, ' + (0.5 * tw) + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(150, 190, 255, ' + (0.12 * tw) + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
                ctx.fill();
              });
            }
          }


          // Update & Render Shooting Stars
          maybeSpawnShootingStar();
          for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const tailX = ss.x - Math.cos(ss.angle) * ss.len;
            const tailY = ss.y - Math.sin(ss.angle) * ss.len;

            const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
            grad.addColorStop(0, 'rgba(255, 224, 153, 0)');
            grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(ss.x, ss.y);
            ctx.stroke();

            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= 0.016;

            if (ss.opacity <= 0 || ss.x > w || ss.y > h) {
              shootingStars.splice(i, 1);
            }
          }
        }
        requestAnimationFrame(renderStars);
      }

      // =======================================================================
      // THE FIELD WIRE (CAMP TELETYPE CONTROLLER)
      // =======================================================================
      const btnHeaderMessenger = document.getElementById('btn-header-messenger');
      const tabWireExpedition = document.getElementById('tab-wire-expedition');
      const tabWireInquiries = document.getElementById('tab-wire-inquiries');
      const wireExpeditionPanel = document.getElementById('wire-expedition-panel');
      const wireInquiriesPanel = document.getElementById('wire-inquiries-panel');
      const wireMessagesStream = document.getElementById('wire-messages-stream');
      const wireInquiriesStream = document.getElementById('wire-inquiries-stream');
      let currentWireTab = 'expedition';
      const wirePromptBox = document.getElementById('wire-prompt-box');
      const wireChoicesGrid = document.getElementById('wire-choices-grid');
      const wireCompletedBar = document.getElementById('wire-completed-bar');
      const btnWireReplay = document.getElementById('btn-wire-replay');
      const btnWireToMap = document.getElementById('btn-wire-to-map');
      const inquiriesQuestionsGrid = document.getElementById('inquiries-questions-grid');
      const inquiryDisplayPanel = document.getElementById('inquiry-display-panel');
      const inquirySelectedQ = document.getElementById('inquiry-selected-q');
      const inquirySelectedA = document.getElementById('inquiry-selected-a');

      const EXPEDITION_THREAD = [
        {
          step: 0,
          hermesInitial: "Silvia, I hope you hear this. If this copper needle twitches on your end, my signal got through the storm.\n\nRed sand is hitting the cliff like broken glass. An hour after reaching the desert border, the sky turned dark. The raiders' tracks are gone under the dust, and mine are gone too. I had to scramble under a rock shelf to keep from being blown away.\n\nI rigged this wire using an old telegraph repeater. Tell me... is the signal working? Are you there?",
          choices: [
            {
              id: "choice-0-grounded",
              text: "I'm here. The signal is crystal clear. Catch your breath—we are connected.",
              silviaMsg: "I'm here. The signal is coming through crystal clear. Catch your breath—we are connected across the canyon.",
              hermesReply: "Thank heavens. Hearing the key click under your hand brings warmth into this cold shelter... Knowing you are listening across the canyon changes everything.\n\nBefore the dust blinds this line completely, tell me something... It has been decades since anyone spoke to me across this waste. How should we address each other on this wire? What name do you give me?"
            },
            {
              id: "choice-0-protective",
              text: "The wire is working! Find secure cover. How bad is the storm, and are you safe from rockfall?",
              silviaMsg: "The wire is working! Find secure cover immediately. How strong is the storm, and are you safe from falling rocks?",
              hermesReply: "I'm tucked beneath a deep shelf of solid granite—the stone above is ancient and sturdy, though red dust is pouring over the ledge like water. Your concern warms an old man's heart.\n\nBefore the storm thickens and we chart our route through the canyon, tell me... how should we address each other across this wire? What name do you choose to call me?"
            },
            {
              id: "choice-0-cipher",
              text: "Loud and clear. I solved your celestial cipher at the cliff. The storm won't stop us—what is your situation?",
              silviaMsg: "Loud and clear. I solved your celestial cipher at the southern cliff. The storm won't stop us—what is your situation out there?",
              hermesReply: "You solved the cipher already? When I carved those letters into the brass plate at the cliff edge, I wondered if anyone would ever read my heart again. Knowing you deciphered it gave me strength to scramble through these rocks.\n\nBefore the dust cuts our frequency, answer me this: how should we address each other on this wire? What name do you choose for me?"
            }
          ]
        },
        {
          step: 1,
          choices: [
            {
              id: "choice-1-name-hermes",
              nameTitle: "Hermes",
              text: "Hermes — We are companions in this desert, not strangers. Call me Silvia, and I will call you Hermes.",
              silviaMsg: "Call you Hermes. We are companions in this desert, not strangers. Call me Silvia, and I will call you Hermes.",
              hermesReply: "Hermes... It has been fifty-five years since anyone spoke that name with warmth. It feels good to put down the heavy mantle of the Order, if only between friends on a copper wire. Hermes it is, Silvia.\n\nNow, about our situation: through my spyglass, I saw the raiders' heavy wagons break down in the sand dunes three leagues south. Their axles are buried to the hubs.\n\nStill, the storm is getting worse and walking blind into this wind is impossible. In the autumn of 1998, I spent three weeks surveying this exact gorge and recorded the only safe passages in my personal notes.\n\nPlease open your physical journal to the page “Field Log: The Desert Frontier”. What does it say about crossing this windy canyon?"
            },
            {
              id: "choice-1-name-cartographer",
              nameTitle: "The Cartographer",
              text: "The Cartographer — You charted these stars and sands; that is the title of honor you earned with your compass.",
              silviaMsg: "I will call you The Cartographer. You mapped these stars and sands; that is the title of honor you earned with your compass.",
              hermesReply: "The Cartographer. Direct, professional, and true to the craft. A surveyor's duty is never finished until every stone and meridian is accounted for. I will wear that title proudly on this wire, Navigator Silvia.\n\nNow, to business: through my spyglass, I saw the raiders' heavy wagons break down in the sand dunes three leagues south. Their axles are buried to the hubs.\n\nStill, the storm is getting worse and walking blind into this wind is impossible. In the autumn of 1998, I spent three weeks surveying this exact gorge and recorded the only safe passages in my personal notes.\n\nPlease open your physical journal to the page “Field Log: The Desert Frontier”. What does it say about crossing this windy canyon?"
            },
            {
              id: "choice-1-name-order",
              nameTitle: "The Cartographer of Distant Light",
              text: "The Cartographer of Distant Light — The sacred title of the Order. We must honor the ancient rites.",
              silviaMsg: "The Cartographer of Distant Light. The sacred title of the Order must not be forgotten in the storm.",
              hermesReply: "The full title... 'The Cartographer of Distant Light'. Hearing those words across the wire makes the old vows echo in these cliffs once more. The Order may be scattered, but its flame still burns in you. I accept the solemn mantle, Seeker Silvia.\n\nNow, heed this report: through my spyglass, I saw the raiders' heavy wagons break down in the sand dunes three leagues south. Their axles are buried to the hubs.\n\nStill, the storm is getting worse and walking blind into this wind is impossible. In the autumn of 1998, I spent three weeks surveying this exact gorge and recorded the only safe passages in my personal notes.\n\nPlease open your physical journal to the page “Field Log: The Desert Frontier”. What does it say about crossing this windy canyon?"
            }
          ]
        },
        {
          step: 2,
          choices: [
            {
              id: "choice-2-wash-flint",
              item: { id: "flint_tinder", name: "Ancient Flint & Juniper Tinder", icon: "🪵", desc: "Dry juniper wood and 1998 expedition flint found along the canyon wash bed." },
              text: "Check the page “Field Log: The Desert Frontier”, Section I: Scramble down to the gravel canyon wash. The rock walls cut the gale, and there is dry juniper wood along the bank.",
              silviaMsg: "I'm checking the page “Field Log: The Desert Frontier”, Section I: you noted that the high rock walls break the fury of the gale. Drop down into the dry gravel wash, keep away from the dunes, and gather whatever dry juniper wood washed down from the winter floods.",
              beats: [
                "Down to the gravel wash it is! I'm sliding down the shale embankment now... The slope is steep and loose rocks are tumbling into the dark, but the high canyon walls are finally cutting the gale overhead. The red dust stays low near the ground, and my boots can actually find firm footing on the dry gravel bed.",
                "Wait, Silvia... look at what's caught against this flood boulder! The winter floods washed down a tangle of ancient, bone-dry juniper root, perfectly sheltered under the rock overhang. And half-buried in the silt right beside it: an old oilskin pouch from 1998 with my spare fire-striker and dark flint stone! We have fuel and fire for the night.",
                "I packed the juniper wood and flint into my satchel and pushed fifty paces along the sheltered cliff trail. Ahead through the swirling dust, the entrance benchmark of the watchtower path emerged through the haze! Beneath the flat sandstone slab lies the copper benchmark plate I buried twenty-eight years ago.\n\nOpen your journal to the page “Field Log: The Desert Frontier”, Silvia: what compass direction was stamped on that plate to guide me to Watchtower VI?"
              ],
              hermesReply: "Down to the wash it is! I slid down the shale embankment onto the gravel bed. What a relief—overhead the gale is screaming, but down here the dust stays near the floor.\n\nAlong the dry bank, caught under a boulder, I found a tangle of dry juniper root and an old oilskin pouch half-buried in silt: my own spare flint from 1998! I stowed both in my satchel.\n\nAhead through the haze, I reached the entrance benchmark of the watchtower trail! Underneath the base slab is the copper reference plate pointing to Watchtower VI.\n\nLook at the page “Field Log: The Desert Frontier” in your journal: what compass direction was stamped on that plate?"
            },
            {
              id: "choice-2-cairns-compass",
              item: { id: "surveyor_compass", name: "1998 Brass Surveyor's Compass", icon: "🧭", desc: "Precision surveyor compass left in 1998 beside the copper benchmark at the foot of the Watchtower VI trail." },
              text: "Check the page “Field Log: The Desert Frontier”, Section III: The Three Cairns & The Copper Benchmark. Keep to the wash bed you surveyed in 1998 and find your benchmark at the foot of the watchtower trail.",
              silviaMsg: "Check the page “Field Log: The Desert Frontier”, Section III: The Three Cairns & The Copper Benchmark. Before climbing to Watchtower VI in 1998, you surveyed the dry wash bed below it. And you wrote that the plate under Cairn III was the FIRST copper benchmark, so there must be another one. Follow the wash bed to the foot of the watchtower trail!",
              beats: [
                "Section III! You read my notes from 1998 more closely than I wrote them, Silvia. 'The first copper benchmark'... I had forgotten that word. I'm sliding down into the sheltered wash bed, keeping my back to the gale. My three cairns run south-south-east from here, the last of them days down the wash; the nearest one was swallowed by flood silt long ago, and I cannot find it in this dust. But tonight I don't need them.",
                "Here it is: the trail-head benchmark at the foot of the bluff, the second copper plate I set that autumn so whoever came after me could find the watchtower. And tucked into a dry stone niche beside it, wrapped tight in oiled canvas, was my precision brass surveyor's compass! I left it there the day I climbed out of this canyon in 1998. The blued-steel needle floated straight true the moment I lifted the latch. Not a speck of rust.",
                "I secured the brass compass in my satchel and brushed the silt from the flat sandstone slab. The copper plate is right here, the twin of the first one I buried under Cairn III, stamped with the same bearing.\n\nLook closely at the page “Field Log: The Desert Frontier” in your journal: what compass heading was stamped on that plate to guide me up to Watchtower VI?"
              ],
              hermesReply: "The first copper benchmark... so you noticed there was a second! My three cairns run on down the wash, the last of them days to the south and far beyond reach in this storm, but I followed the wash bed to the foot of the watchtower trail and found the second plate. In a dry stone niche beside it, wrapped in oiled canvas, was my 1998 brass surveyor's compass! The plate is the twin of the one under Cairn III, stamped with the same bearing.\n\nCheck the page “Field Log: The Desert Frontier” in your journal: what compass heading did I stamp on the copper plate to guide me to Watchtower VI?"
            },
            {
              id: "choice-2-lookout-spyglass",
              item: { id: "spyglass_lens", name: "Scorched Spyglass Lens", icon: "🔍", desc: "A tempered optical lens bearing the raiders' charred ash sigil." },
              text: "Check the page “Field Log: The Desert Frontier”, Upper Panorama: Scout from the northern bluff shelf before dropping down. Check the raiders' wagons and find the sheltered descent.",
              silviaMsg: "Look at the upper panorama on the page “Field Log: The Desert Frontier”: before dropping into the canyon, use the northern bluff shelf as a natural lookout. Scout the raiders' wagons to the south and take the sheltered crack down.",
              beats: [
                "A brilliant scout's eye, Silvia. I'm creeping out onto the northern bluff shelf, staying low on my stomach beneath the crag. Through the red squall, I can see the entire southern basin... Silvia, you were right to have me look.",
                "The raiders' six heavy baggage wagons are completely buried up to the hubs in the great dune drift three leagues south! Their canvas awnings are torn to shreds and their scouts abandoned their outpost in panic. Look what they dropped right by the descent fissure: a heavy optical spyglass lens in a scorched brass ring, finely etched with their burned ash sigil! I'm pocketing it in my satchel.",
                "I slipped down the protected rock fissure, completely bypassing the storm on the ridge, and came out right at the entrance crag of the watchtower path! Beneath the foundation slab lies the copper surveyor's benchmark plate.\n\nCheck the page “Field Log: The Desert Frontier” in your journal: what compass heading did I stamp on that plate to reach Watchtower VI?"
              ],
              hermesReply: "A brilliant tactician's eye, Silvia. I crept along the northern shelf, shielded by the crag, and looked through the storm.\n\nThe raiders' six heavy wagons are completely trapped in the sand dunes three leagues south—their canvas is torn to shreds and they are abandoning their carts! Right by the descent crack, where their scout must have surveyed the gorge, I found a brass optical lens dropped in the dust, etched with their scorched ash sigil. I pocketed it in my satchel—it may reveal how they read our skies.\n\nFrom there, I slipped down the hidden fissure straight to the entrance benchmark of the watchtower path. Under the flat sandstone foundation rests the copper plate.\n\nLook at the page “Field Log: The Desert Frontier” in your journal: what compass direction was stamped on that plate to guide me to Watchtower VI?"
            }
          ]
        },
        {
          step: 3,
          isCompassInput: true,
          choices: [
            {
              id: "choice-3-bearing-direct",
              silviaMsg: "According to your notes on the page “Field Log: The Desert Frontier”, the benchmark plate points 112° East toward Outer Watchtower VI.",
              hermesReply: "112 degrees East... I cleared away the drifted sand with my knife, and the green metal showed the letters: '112° E // WATCHTOWER VI'.\n\nI aligned my field compass, fixed my eyes on the heading, and followed the base of the bluff. Through the swirling dust, a heavy wooden door appeared in the rock! The lock was stiff, but the old key turned with a loud click."
            }
          ]
        },
        {
          step: 4,
          completed: true,
          hermesFinal: "Silvia... the door is barred shut! The wind is howling outside, but inside these thick stone walls, the air is completely calm.\n\nI found dry cedar wood in the corner and lit a spark in the fireplace. The hearth is glowing warm, casting light across an old wooden table.\n\nWe did it, Silvia. We crossed the threshold into the desert together. The storm outside is tearing at the rock face, and neither traveler nor beast can move until it breaks. Rest now by the fire. When the sandstorm calms down, we will meet at dawn to survey Wadi al-Hajar."
        },
        {
          step: 5,
          hermesInitial: "Silvia, it is past midnight at Camp VII and my heart has only just slowed down. The two watchers are gone, south after the others, and their fire has burned down to red eyes. I am sitting with my back against the tallest stele, and the needle of Al-Qibla still points the way they rode. On the hearth stone their name is scratched under a bird of fire: the BC Ashes.\n\nI keep thinking of what the nomads knew. When the wind moves the dunes overnight, every track is gone by morning, and the raiders' wagon ruts with them. Out on the Great Erg a man without a true bearing walks in circles until his water runs out. These people carved their bearings into stone so that the desert could never take them away.\n\nTell me again how we read the steles, Silvia. I want to write it down in my own log before I sleep, the way you would tell it.",
          choices: [
            {
              id: "choice-5-crossword",
              text: "Check the page “The Desert Lexicon & Al-Qibla”: Solve the 10 crossword words to assemble the circled letters.",
              silviaMsg: "I'm looking at the page “The Desert Lexicon & Al-Qibla” in my journal. We must carve the 10 desert terms on the sandstone stele to assemble the circled letters.",
              hermesReply: "Ten desert terms... Yes! I can see them carved in the stone: SIROCCO, NOMAD, OASIS, ECLIPSE, HORIZON across... and CARAVAN, SPHINX, MIRAGE, DUNES, SPIRIT down. And seven cells have etched numbered circles!\n\nMIRAGE is there too, Silvia: the passphrase of the canyon walkers, carved by the same hands. And the seven circles, read from 1 to 7, gave us the word that woke the dial.\n\nI will hear that watcher's footsteps in my sleep, Silvia. Every brush I made, I counted his steps with you: toward the cistern, back toward the stones, and the long still moments when I lay with my face in the sand. A word at a time, between his rounds. That is how those ten words came clean."
            },
            {
              id: "choice-5-sigil",
              text: "The circled letters spell PHOENIX. That Desert Sigil unlocks the Al-Qibla sun compass!",
              silviaMsg: "The circled letters spell PHOENIX! That Desert Sigil unlocks the Al-Qibla sun compass dial.",
              hermesReply: "PHOENIX! The sacred Sun-Bird of the desert that rises from its own embers! When I tapped those seven letters into the brass dial, the needle broke free of the sand with a crisp click!\n\nIt settled steadily on 194° South-Southwest: the heading the raiders carved here, the way they fled with the Astrolabe! And the sun-bird's tail points the other way, 14° North-Northeast. That is our true line across the Great Erg to Tower II!\n\nAnd when the bronze rang like a bell, I thought my heart would stop. That run through the walls, one doorway at a time, was your sigil spelled out in brick, Silvia: P, H, O, E, N, I, X. I owe you my skin, and I mean to say so again when we are safe."
            },
            {
              id: "choice-5-oracle",
              text: "The compass must point to Tower II. The Desert Oracle is the only one who can guide us now.",
              silviaMsg: "The compass must point directly to Tower II. The Desert Oracle is the only guardian who can see through this storm.",
              hermesReply: "Exactly so, Silvia! The raiders' tracks are gone, but the Oracle's eye never sleeps. With Al-Qibla locked into our charts, 14° NNE to the Sanctuary and 194° SSW for the raiders, we can cross the Great Erg without losing our way.\n\nAnd look under the shadow curb of the second stele: an ancient mathematical inscription: [R] × 2 = [F]! Update your Cipher Ledger!"
            }
          ]
        },
        {
          step: 6,
          completed: true,
          hermesFinal: "Silvia! Al-Qibla is locked: the raiders fled 194° South-Southwest, and Tower II lies the other way, 14° North-Northeast! And we possess the sacred Desert Sigil PHOENIX to present at the gates of Tower II!\n\nDon't forget to record the math stele in your Cipher Ledger: the Chasm gave you a clue for [R], so [R] × 2 = [F] lets you find [F]! And combined with your Vector Card [F] + [T] = 22, you can work out [T] too!\n\nOne more thing: when the two watchers rode off, their banner opened in the wind, and it bears the same bird of fire that is burned into the wagon's oilcloth. Under that bird, on the hearth stone, their name is cut with a knife. They call themselves the BC Ashes!\n\nBefore we cross the Great Erg we will need water, and somewhere ahead, at Camp VIII, the old nomads built a clepsydra of four wells. But not tonight.\n\nThe camp is quiet, my legs are still shaking, and the road beyond the dunes is not open yet. I am going to sleep by the cold hearth with the needle of Al-Qibla at my head. Rest too, Silvia: you earned it. I will call you on the Field Wire the moment the road opens."
        },
        {
          step: 7,
          hermesInitial: "Silvia, can you hear me? I hooked my copper wire into the rusted relay at Camp VIII beside the Four Wells!\n\nThe desert heat is merciless, and our canteens are running bone dry. Before us lie four sculpted stone basins: Falcon, Jackal, Scarab, and Serpent. But the surface water is dry! The underground siphons are sealed shut by heavy counterweights.\n\nAn engraved bronze plaque above the water gate reads: 'Only when the four seekers rest in their true shadow-hours will the living waters surge.' Four seekers came here before us: the Cartographer, the Alchemist, the Nomad, and the Astronomer. Each brought a sacred relic, arriving at a distinct shadow hour.\n\nLook at the page “The Oasis Clepsydra” in your physical journal. How do we deduce their arrival hours and balance the siphons?",
          choices: [
            {
              id: "choice-7-matrix",
              text: "Check the page “The Oasis Clepsydra”: The Cartographer carried the Astrolabe, arriving at the Scarab Well at Hr VI.",
              silviaMsg: "I'm checking the page “The Oasis Clepsydra” in my journal: The Cartographer carried the Brass Astrolabe, arriving at the Scarab Well at Hr VI.",
              hermesReply: "The Brass Astrolabe at the Scarab Well at Hour VI! Yes—the first counterweight groaned and water began trickling into the copper pipes! And what of the other three seekers?"
            },
            {
              id: "choice-7-deduction",
              text: "The Alchemist took Sandglass to Jackal (Hr III); Nomad took Dagger to Falcon (Hr IX); Astronomer took Scarab to Serpent (Hr XII).",
              silviaMsg: "The Alchemist took the Sandglass to Jackal at Hr III; the Nomad took the Dagger to Falcon at Hr IX; the Astronomer took the Gold Scarab to Serpent at Hr XII.",
              hermesReply: "Brilliant deduction, Silvia! The testimonies lock together like clockwork: Alchemist at Jackal (Hr III), Cartographer at Scarab (Hr VI), Nomad at Falcon (Hr IX), Astronomer at Serpent (Hr XII)!\n\nNow look at the master lock cylinder: it wants the Clepsydra Key, the sum of all four arrival hours in Roman numerals. What does your journal give?"
            },
            {
              id: "choice-7-key",
              text: "The Clepsydra Key is XXX (30 Hours). Carve Roman numeral XXX into the hydraulic lock!",
              silviaMsg: "The Clepsydra Key is XXX! The sum of the four arrival hours is 30, carved in Roman numerals. Engage Key XXX into the hydraulic lock!",
              hermesReply: "Key XXX! The instant you said it, the four wells shimmered and dissolved like smoke. Silvia... they were never there. The heat had me seeing things. But my head is clear now, and right below a carved falcon there is a real cleft in the rock, with cold water seeping out of it!"
            }
          ]
        },
        {
          step: 8,
          completed: true,
          hermesFinal: "Silvia! The four wells were a fever mirage, but your logic kept me lucid long enough to find the real spring: a cleft in the rock beneath a carved falcon, with an old cache of supplies tucked inside. We filled our four leather water skins to capacity.\n\nAnd scratched into the stone beside the falcon, in deep letters: [P] - [A] = 14!\n\nRecord this relation in your Cipher Ledger right away. With our water skins full and Al-Qibla set on Tower II (14° NNE), I am ready to cross the treacherous Great Erg toward Station 14!"
        },
        {
          // Tower II · the gates (Sheet 13A). Hermes recognises the Servant he watched from a ridge in 1998 (Sheet 17B).
          step: 9,
          get hermesInitial() {
            const demand = hadFirstSealAtGates()
              ? "When I showed him the stone seal from the dry river, he studied it in silence and pointed his staff at five empty sockets in the arch: 'You found the first seal by following the dry wash, but four still sleep in stone. Return to the sands and complete the survey, or these gates stay closed.'"
              : "When I told him I carried no seal, he pointed his staff at five empty sockets in the arch: 'Five cairns were raised by our founders to measure this desert. The first sleeps by the dry wash, where you turned away. Return to the sands and complete the survey, or these gates stay closed.'";
            return "Silvia, I reached the gates of Tower II at last light. The Sandstone Sanctuary is carved into the red cliff itself: fluted columns of living rock and bronze gates as tall as a ship's mast. And on the top step, leaning on an iron staff crowned with a star-sight, an old man was waiting for me.\n\n" + demand + "\n\nSilvia... I know this man. Twenty-eight years ago I watched him from a ridge for hours, his face lost in his cowl, and I wrote in my journal that he was the Oracle. He is not. He is her Servant. And he looked at me as if he knew me, too.";
          },
          choices: [
            {
              id: "choice-9-oracle",
              text: "Ask him about the Oracle.",
              silviaMsg: "Ask him about the Oracle, Hermes. Who is she, and why won't she come out?",
              hermesReply: "I did. He only said: 'She receives no one until the five seals are home.' Then he turned his face to the north-north-east, as if the answer were written there. I have the feeling he chose every word long before I arrived."
            },
            {
              id: "choice-9-remember",
              text: "Ask him if he remembers you.",
              silviaMsg: "Ask him if he remembers you. He looked at you as if he knew you.",
              hermesReply: "He did not answer, Silvia. But when I said my name, Hermes, the old man smiled for the first time, the way you smile at a boy you once caught reading the forbidden charts. I left a Sanctuary library when I was twenty-four. I am beginning to think it was this one."
            },
            {
              id: "choice-9-course",
              text: "Check the page “At the Gates of Tower II”: set course NNE to the Sun Monolith.",
              silviaMsg: "I'm reading the page “At the Gates of Tower II”. The great circuit begins: our course is north-north-east, toward the shadow of the Sun Monolith.",
              hermesReply: "North-north-east. Exactly the line the Servant pointed to with his staff. The Sun Monolith, and Cairn II at its feet. The crossing of the Great Erg is long, but the night is cool and the stars are clear."
            }
          ]
        },
        {
          step: 10,
          completed: true,
          get hermesFinal() {
            return "I am setting out now, Silvia: north-north-east across the Great Erg, by night, with the stars for a compass. Twelve hours on foot to the Ridge of the Sun. Keep the page “The Sun Monolith & Cairn II” close; when I reach the Monolith, its seven noons will be your work.\n\nThe Servant watched me go from the top step until the dark took him. " + sealsPhrase(5 - sealsAtGates()) + " to find. One is waiting under the Sun.";
          }
        },
        {
          // After Station 14: the raiders' marks were in the modal; the blue is told only here, on the wire.
          step: 11,
          hermesInitial: "Silvia, now that the sun is down I can see it properly. On the inner rim of the niche, where the Seal of Cairn II was resting, there is a smear of blue. Not dust, not stone: pigment. Cobalt blue, ground so fine it shines like the night sky.\n\nI have seen this blue only once in my life. Aurelia ground her lapis exactly like this, by the fire, for the star charts... It cannot be. Fifty-five years. Lapis is rare, but the Order had other painters, and the sand keeps everything. I am tired, and tired men see ghosts.\n\nBut someone was here before the raiders, Silvia. Someone who did not force the stone. Someone who knew how to wait for the sun.",
          choices: [
            {
              id: "choice-11-keep",
              text: "Keep a little of the blue. We'll find out at Tower II.",
              silviaMsg: "Keep a little of that blue in your satchel, Hermes. Whatever it is, we'll find out at the gates of Tower II.",
              hermesReply: "I scraped a grain of it into the brass box where I keep my compass. It weighs nothing at all, and it is the heaviest thing I carry."
            },
            {
              id: "choice-11-painter",
              text: "Could another painter of the Order use the same lapis?",
              silviaMsg: "Could another painter of the Order have used the same lapis?",
              hermesReply: "Perhaps. The founders painted their charts with the same stone for centuries. That is the sensible answer, and I am trying very hard to be sensible."
            },
            {
              id: "choice-11-raiders",
              text: "The raiders know about the seals. We have to be faster.",
              silviaMsg: "Forget the ghosts for now. The raiders know about the seals, and they won't stop at one failed niche. We have to be faster.",
              hermesReply: "You are right. The iron marks are days old, no more. If they cannot open the cairns, they will try to follow the one who can. From now on I will cover my tracks."
            }
          ]
        },
        {
          step: 12,
          completed: true,
          get hermesFinal() {
            return sealsPhrase(sealsAtGates() + 1) + " of five, Silvia. The Seal of Cairn II sits in my satchel, and the two lines from the lid of the niche belong in your Cipher Ledger: [D] + [F] = 24 and [C] − [T] = 8.\n\nThe next cairn waits beyond the Arches of the West Wind, inside the Sandstone Labyrinth (Station 15). I will rest under the Monolith tonight and wire you at first light, before I set out.";
          }
        },
        {
          // First light at the Monolith (Sheet 14A/14B). Covers the printed "North of the Sun Monolith" of Sheet 14B:
          // the line comes from the founders' survey, and the Order drew its charts with the south at the top.
          step: 13,
          hermesInitial: "First light, Silvia. From the foot of the Monolith I can see the plateau of the Arches of the West Wind, and under it the Sandstone Labyrinth. It lies south-south-east of here, on the old line of 348° that the founders cut into Cairn III to point back at this very stone (the page “The Five Geodetic Cairns”).\n\nYes, the page “The Sandstone Labyrinth & Cairn III” says 'North of the Sun Monolith'. I copied that line from the founders' survey, and it puzzled me for years. Then, in the shadow of the Sanctuary, I remembered how they drew their charts: with the south at the top, as the great cartographers of the caravans did. Their north is our south. The ground does not lie; only the paper turns.\n\nOne more thing. There are fresh wheel ruts in the sand, going the same way. The BC Ashes fled into that labyrinth with their wagons once before.",
          choices: [
            {
              id: "choice-13-bearing",
              text: "Walk the reverse of the 348° groove.",
              silviaMsg: "Take the bearing from the page “The Five Geodetic Cairns”, Hermes. If Cairn III points to the Monolith at 348°, walk the reverse: 168°, south-south-east, and the cairn will be waiting at the end of it.",
              hermesReply: "One hundred and sixty-eight degrees. You turn the founders' compass faster than I do, Silvia. I will keep the Monolith exactly behind my back all the way down."
            },
            {
              id: "choice-13-ruts",
              text: "Keep off the ruts. Don't let them see you.",
              silviaMsg: "Keep away from those ruts, Hermes. Walk on rock where you can, and don't let them see you coming.",
              hermesReply: "I will walk the stone shelves, where wheels leave no mark and the sand cannot remember me. If they are inside, I want to see their fires before they see my lamp."
            },
            {
              id: "choice-13-tablet",
              text: "Copy the Tablet at the Mouth before you go in.",
              silviaMsg: "When you reach the Southern Mouth, copy the tablet before you go in. I'll trace the true road on the page “The Sandstone Labyrinth & Cairn III” while you walk.",
              hermesReply: "It is already in my log: eight stone arches stand upon the one true road, each bearing a single letter. Find me those eight letters, Silvia, and I will speak them at the cairn."
            }
          ]
        },
        {
          step: 14,
          completed: true,
          get hermesFinal() {
            return "I am going down now. Six hours to the Southern Mouth of the labyrinth, along the line of 168°, keeping to the rock. Trace the true road on the page “The Sandstone Labyrinth & Cairn III” while I walk: only one road reaches Cairn III, and eight arches stand upon it.\n\n" + sealsPhrase(sealsAtGates() + 1) + " in my satchel, Silvia. " + sealsPhrase(4 - sealsAtGates()) + " still sleeping in the stone.";
          }
        },
        {
          // Station 15 debrief: the raiders' camp and the gold star
          step: 15,
          hermesInitial: "I am out, Silvia. Through the Western Cleft and onto the open hardpan, with the Seal of Cairn III wrapped in my scarf. They never saw my face.\n\nTwo things I cannot stop thinking about. Their camp: cold ashes, a broken wagon wheel, the charred circle of the BC Ashes scratched on the rock. They have been sleeping in that labyrinth for days, waiting for someone to open the cairn for them. Now they know someone did.\n\nAnd the star. A star painted in gold leaf on the wall of a fissure, eight points over a ground of blue, and the gold still bright. Aurelia gilded her stars exactly like that, the blue first so the gold would seem to burn in the night. First the blue at Cairn II, now this. Either the sun is cooking my mind, or someone walks these cairns ahead of me and knows the old way of painting the sky.",
          choices: [
            {
              id: "choice-15-star",
              text: "Someone is marking the way for you.",
              silviaMsg: "Hermes, that's no accident. Someone is marking the way for you. The blue at Cairn II, the gold in the labyrinth...",
              hermesReply: "Or marking it for someone else, and I happen to be walking it. I copied the star into my log, point by point. Eight points, like the wind rose of the Order. I will look for the next one."
            },
            {
              id: "choice-15-raiders",
              text: "Lose the raiders before Cairn IV.",
              silviaMsg: "The raiders will follow you now. Lose them before Cairn IV, whatever it takes.",
              hermesReply: "The canyon of Cairn IV is far to the south-west, across the open hardpan. I will cross it by night and sleep in the rocks by day. Let them search the labyrinth for a man who is no longer in it."
            },
            {
              id: "choice-15-aurelia",
              text: "Tell me about Aurelia's stars.",
              silviaMsg: "Tell me about Aurelia's stars, Hermes. How did she paint them?",
              hermesReply: "With a brush of squirrel hair, holding her breath so the gold leaf would not fly away. A ground of lapis first, then the gold, then one stroke of white at the tip of each point. I never saw anyone else do it. I never saw anyone else need to."
            }
          ]
        },
        {
          step: 16,
          completed: true,
          get hermesFinal() {
            return sealsPhrase(sealsAtGates() + 2) + " of five, Silvia. The Seal of Cairn III sits next to the second one, and the two lines carved under the copper plate belong in your Cipher Ledger: [W] + [A] = 26 and [N] − [E] = 9.\n\nThe fourth cairn stands far to the south-west, where the canyon narrows: Cairn IV, the Sentry of the Canyon (Station 16). I will hide in the rocks until dark and wire you before I cross the hardpan.";
          }
        },
        {
          // Dusk at the edge of the hardpan: a shepherd, and the veiled woman who sings to the stars
          step: 17,
          hermesInitial: "Dusk, Silvia, and I am not alone. At a seep under the last rocks before the hardpan there is an old shepherd with a dozen black goats. He shared his water and asked me nothing, which is the desert's way of being kind.\n\nHe says the hardpan can be crossed in one night if you walk toward the singing: when the night wind blows, the pillars of Cairn IV can be heard from the Natural Bridge of the Sentinel Mesa. Then he said something I cannot shake off. Every autumn, on the clear nights, a veiled woman comes down from the sandstone and sings to the stars. The herders leave her milk and dates on a flat stone. Nobody has seen her face.\n\nThe raiders' wagons came by here yesterday, he says. Heading south-west, like me.",
          choices: [
            {
              id: "choice-17-veiled",
              text: "Ask him about the veiled woman.",
              silviaMsg: "Ask him about the veiled woman, Hermes. What does she sing?",
              hermesReply: "He hummed it for me. No words, just a few notes rising and falling, the way you would sing to a child. He says the goats go quiet when she sings. I wrote the notes in my log, and my hand was shaking, and I do not know why."
            },
            {
              id: "choice-17-bridge",
              text: "Ask him the way over the Natural Bridge.",
              silviaMsg: "Ask him the safest way over the Natural Bridge. The pages “The Natural Bridge of the Sentinel Mesa” and “The Eastern Buttress & Lower Wash” show switchbacks on the eastern side.",
              hermesReply: "He laughed. 'The old cart track crosses the bridge on its back,' he said, 'but the switchbacks below are too tight for a loaded wagon. Men on foot, yes. Wagons, never.' If the raiders try it, they will have to choose between their wagons and their road."
            },
            {
              id: "choice-17-raiders",
              text: "Ask how many raiders he saw.",
              silviaMsg: "Ask him how many raiders he saw, and whether they had the Astrolabe with them.",
              hermesReply: "Three wagons and perhaps a dozen men, with ash on their sleeves. One wagon was covered with oilcloth and guarded day and night. He did not see what was under it. I did not need him to."
            }
          ]
        },
        {
          step: 18,
          completed: true,
          get hermesFinal() {
            return "I am going now, Silvia. Eighteen hours: across the hardpan by night, over the Natural Bridge of the Sentinel Mesa, down to the southern mouth of the gorge where Cairn IV stands guard. I will sleep in the shade of the rocks when the sun is high.\n\nKeep the page “Cairn IV: Sentry of the Canyon” close: the survey log of the seven echoes. " + sealsPhrase(sealsAtGates() + 2) + " in my satchel; " + sealsPhrase(3 - sealsAtGates()).toLowerCase() + " still to find.";
          }
        },
        {
          // Station 16 debrief: the pillars sang the disc's code, Cairn IV never fell, and the raiders split up
          step: 19,
          hermesInitial: "Silvia, I have not slept. I have been sitting between the pillars with the pebble in my hand.\n\nThe chamber of Cairn IV opened with the founders' own mechanism: bronze reeds inside the pillars, untouched since before the first road was cut. This cairn never fell. SUN, ECHO, STONE: the cairns are instruments, and the Order measured the whole desert with them.\n\nBut the last verse... three short calls, a pause, two long. The code I engraved on Aurelia's brass disc, the same light I saw blinking from the cliffs in 2016. And wedged in the throat of the Left pillar, a river pebble painted with a small gold star on blue. Someone tuned this canyon to sing that code.\n\nAnd one more thing. From the Natural Bridge, at dawn, I saw the raiders stuck at the switchbacks. They split. A few men on foot are following my tracks. The wagons, and the one under oilcloth, turned back north-east. Toward Tower II.",
          choices: [
            {
              id: "choice-19-pebble",
              text: "Keep the pebble. It's a message.",
              silviaMsg: "Keep that pebble safe, Hermes. Nobody tunes a canyon by accident. It's a message, and it's meant for you.",
              hermesReply: "It is in the brass box with the grain of blue from Cairn II. Two small things, and I feel like I am carrying a whole sky. If it is a message, Silvia, I am afraid to read it to the end."
            },
            {
              id: "choice-19-tower",
              text: "The Sanctuary is in danger. Hurry.",
              silviaMsg: "If the wagons are heading to Tower II, the Sanctuary is in danger. The Servant is alone there. You have to hurry.",
              hermesReply: "The last cairn stands near the Sanctuary, under the Arch of the Solstice. One road for both. I will walk until my legs refuse, and then I will walk a little more."
            },
            {
              id: "choice-19-instruments",
              text: "The cairns are instruments...",
              silviaMsg: "Sun, echo, stone... the cairns are instruments. Then the Astrolabe was never meant to work alone, was it?",
              hermesReply: "No. I think the Astrolabe reads what the cairns measure, the way a musician reads a score. Without the five seals it is only brass. That is why the raiders want the seals, and why they followed me instead of breaking the cairns."
            }
          ]
        },
        {
          step: 20,
          completed: true,
          get hermesFinal() {
            return sealsPhrase(sealsAtGates() + 3) + " of five, Silvia. The Seal of Cairn IV rests with the others, and the two lines engraved on the bronze reed belong in your Cipher Ledger: [S] + [U] = 17 and [S] − [U] = 9. Two unknowns, two lines: you know the trick.\n\nThe last cairn is waiting under the Arch of the Solstice, by the Solar Altar, not far from the Sanctuary (Station 17). The raiders' wagons are on the same road. I will wire you before I set out.";
          }
        },
        {
          // Leaving Cairn IV at dusk. Covers the printed "At midsummer dawn" of Sheet 16B: Hermes arrives in October.
          step: 21,
          hermesInitial: "Dusk again, Silvia, and I am leaving the pillars behind. Before the light went I read the page “Arch of the Solstice & The Solar Altar” one more time, and one line will not let me go: 'At midsummer dawn, the sun's first ray slips beneath the arch.'\n\nMidsummer. The founders built the Courtyard of Rays for the longest day of the year. We are in October. The sun rises far to the south of where it rose for them, and its first ray will strike the arch at another place. If the courtyard is blind in autumn, the last seal is locked until June.\n\nAnd the footprints of the raiders who followed me are fresh on the road east. Eighteen hours to the Arch. I will not stop to sleep.",
          choices: [
            {
              id: "choice-21-mirrors",
              text: "Then we'll turn the mirrors for an autumn sun.",
              silviaMsg: "Then we'll turn the mirrors ourselves, Hermes. If the founders aimed them for June, we can aim them for October.",
              hermesReply: "Turn the founders' mirrors... A year ago I would have called it sacrilege. Tonight it sounds like the only sensible thing anyone has said to me. Bronze can be turned. Let us hope the dawn waits for us."
            },
            {
              id: "choice-21-tower",
              text: "Can you see Tower II from the Arch?",
              silviaMsg: "Will you be able to see Tower II from the Arch? I want to know what's happening at the Sanctuary.",
              hermesReply: "From the terrace of the altar, yes: the Sanctuary is a few hours further on. If the wagons are there, I will see their fires. If something else is there, I will see that too."
            },
            {
              id: "choice-21-raiders",
              text: "Watch your back. They're still following you.",
              silviaMsg: "Watch your back, Hermes. The ones on foot are still following you.",
              hermesReply: "I walk on stone and stop at every ridge to look back. Twice I have seen a glint behind me. Spyglasses. They want me to open the last cairn for them, like the others. They will be disappointed."
            }
          ]
        },
        {
          step: 22,
          completed: true,
          get hermesFinal() {
            return "Eighteen hours east, Silvia, without sleep: back across the Natural Bridge, along the Lower Wash and over the dunes where Cairn V stands guard at 163°. I will reach the Arch of the Solstice before the next dawn but one.\n\nKeep the page “Arch of the Solstice & The Solar Altar” close: the midsummer ray and its eight sun-stones. " + sealsPhrase(sealsAtGates() + 3) + " in my satchel. The fifth is waiting under the Arch.";
          }
        },
        {
          // Station 17 debrief: the light answered in the disc's code, then went out; smoke over Tower II
          step: 23,
          get hermesInitial() {
            const all = sealsAtAltar() >= 5;
            return "Silvia, it is dawn again and I have not slept. Let me tell you in order, or I will not be able to tell you at all.\n\nThe light on Tower II asked, and we answered, and it asked again. Then I sent the three short flashes, the pause, the two long ones. The code I made for Aurelia when we were young, for the nights she worked late in the lower observatory. Nobody else in the world knew it. And the light answered it. Not with my code: with the two lines you have now, spelled slowly in the old light-code of the Order, the way a teacher writes on a blackboard.\n\nThen it went out, all at once. When the sky turned grey I saw the smoke. The wagons are at the foot of the Sanctuary steps, and there is no sign of the Servant.\n\n" + (all ? "Five seals, Silvia. Five. The gates of Tower II can no longer refuse me, if there are still gates to open." : "Four seals of five. The first still sleeps by the dry wash, and the Servant will want it. But first the Servant has to be alive to want it.");
          },
          choices: [
            {
              id: "choice-23-go",
              text: "Go now. The Servant is alone.",
              silviaMsg: "Go now, Hermes. The Servant is alone up there, and whoever answered your light is in danger.",
              hermesReply: "I will go as soon as my legs obey me. The seals are sewn into the lining of my coat, where nobody will look. If the raiders want them, they will have to take the coat off a very stubborn old man."
            },
            {
              id: "choice-23-who",
              text: "Who else could know Aurelia's code?",
              silviaMsg: "Hermes... who else could know Aurelia's code? Think. Anyone you told, anything you wrote down?",
              hermesReply: "No one. I never wrote it, Silvia; it was ours. I have been asking myself that question since the light answered, and every answer I find frightens me more than the smoke."
            },
            {
              id: "choice-23-mirror",
              text: "Keep the mirror. You may need to answer again.",
              silviaMsg: "Keep that mirror close. If the light comes back, I want you to be able to answer it.",
              hermesReply: "It hangs on a cord around my neck, next to the brass box with the blue and the pebble. Three small things, Silvia. I am beginning to think they are one message."
            }
          ]
        },
        {
          step: 24,
          completed: true,
          get hermesFinal() {
            return sealsPhrase(sealsAtAltar()) + " of five, Silvia, and two lines that came to us in light: [Y] − [O] = 2 and [L] + [G] = 23. Write them in your Cipher Ledger; I wrote them on my sleeve.\n\nNow Tower II. If the Servant still stands, his last trial waits in the atrium: Station 18, the page “The Polybius Stele”. If he does not... then we will learn what the raiders came for. I will wire you from under the Arch before I set out.";
          }
        },
        {
          // Under the Arch at noon: the smoke over Tower II and the six-hour walk toward it
          step: 25,
          hermesInitial: "Noon, Silvia. I meant to leave at dawn, and my legs said no. I slept two hours in the shade of the Arch with the seals sewn into my coat, and woke with the smoke still standing over Tower II like a black tree.\n\nThe Sanctuary is six hours from here, along the dry bed under the dunes. If I leave now, I will reach the foot of its steps after dark. The wagons are still there: I can see the glint of their harness from the terrace.\n\nAnd the stele in the atrium, the page “The Polybius Stele”. The Servant called it his last trial. Whoever is inside that tower now, I think we will need it.",
          choices: [
            {
              id: "choice-25-dark",
              text: "Arrive in the dark. Stay out of their sight.",
              silviaMsg: "Use the dark, Hermes. Go round the wagons and get in where nobody is watching.",
              hermesReply: "In the dark, then. The Sanctuary is cut into the cliff, and no house of the Order was ever built with only one door. I will find the other one before they find me."
            },
            {
              id: "choice-25-stele",
              text: "I'll have the page “The Polybius Stele” open and ready.",
              silviaMsg: "I have the page “The Polybius Stele” open on my desk. Whatever the stele says, I'll read it with you.",
              hermesReply: "Then I walk lighter. Keep the founders' grid under your hand, and the Law of the Inverted Mirage under the other. The Servant never chose a word by accident in his life."
            },
            {
              id: "choice-25-servant",
              text: "If the Servant is alive, find him first.",
              silviaMsg: "Find the Servant first, Hermes. The stele can wait; he can't.",
              hermesReply: "He made me wait at his gates until I had five seals, and I would give all five to find him alive. I am going, Silvia."
            }
          ]
        },
        {
          step: 26,
          completed: true,
          get hermesFinal() {
            return "Six hours to Tower II, Silvia, along the dry bed under the dunes, toward the smoke. I will reach the foot of the Sanctuary steps after dark.\n\nKeep the page “The Polybius Stele” close: the stele of the Servant and its Law of the Inverted Mirage. " + sealsPhrase(sealsAtAltar()) + " sewn into my coat.";
          }
        },
        {
          // Station 18 debrief: the Servant is alive, the raiders wanted the charts, and his answer about the light
          step: 27,
          hermesInitial: "Silvia, he is alive. He is sitting next to me on the rim of the well with a wet cloth around his hands, and the fire in the library is down to embers.\n\nHe told me everything in a few words, the way he does. The raiders came at dusk and asked for the Oracle and her charts. He said no. They set fire to the library to smoke out whoever was hiding, and he went down into the old well with the charts in his arms and pulled the hatch shut over his head. The Oracle is safe, he says: deeper in the rock than any fire can reach.\n\nThen I asked him the question I cannot stop asking. Who answered my light? Who knows the code I made for Aurelia? He looked at me for a long time, Silvia. And he said: 'She came from the edge of the sky with a disc in her arms and no name.'\n\nNothing more. He would not say one word more.",
          choices: [
            {
              id: "choice-27-disc",
              text: "A disc in her arms... Ask him more.",
              silviaMsg: "A disc in her arms, Hermes... Ask him more. Please.",
              hermesReply: "I asked. He only bowed his head and said: 'The rest is hers to tell.' My hands are shaking again, Silvia, and this time I know why, and I do not dare to say it."
            },
            {
              id: "choice-27-charts",
              text: "What did the raiders want with the charts?",
              silviaMsg: "Why the charts? What did the raiders want with them?",
              hermesReply: "The Oracle's charts are the earth half of the Astrolabe: the measures of sand and stone that the stars need to point anywhere at all. The raiders asked for them by name. They burned a whole library to find a roll of maps that was under their feet."
            },
            {
              id: "choice-27-servant",
              text: "Is he hurt? Take care of him.",
              silviaMsg: "Is he hurt? Take care of him, Hermes. Water, rest, and don't let him argue.",
              hermesReply: "Burnt hands and smoke in his chest: nothing that water and a night of sleep will not mend. He laughed at me for fussing. 'You walked the whole desert,' he said, 'and now you worry about my hands.'"
            }
          ]
        },
        {
          step: 28,
          completed: true,
          get hermesFinal() {
            const seals = sealsAtWell();
            return "Two lines were cut under the hatch of the well, Silvia: [H] − [U] = 16 and [M] + [T] = 25. Into your Cipher Ledger with them. And the bearing on the back of the stele, 348° north-north-west, the same as Cairn III: I have written it on my sleeve with the others.\n\nThe Servant gave me his key, the bronze key of the inner stair. " + (seals >= 5
              ? "'At dawn,' he said, 'with the five seals, she will receive you.' Station 19, Silvia: the page “The Oracle's Horizon”."
              : "But he counted the seals in my coat, and there are " + sealsPhrase(seals).toLowerCase() + ". 'She receives no one until the five seals are home.' The first still sleeps by the dry wash. Station 19, the page “The Oracle's Horizon”, waits for it.");
          }
        },
        {
          // Dawn at the inner stair of Tower II, with the Servant's key: the audience is about to begin
          step: 29,
          hermesInitial: "Dawn, Silvia. The Servant woke me before first light with a cup of mint tea and the bronze key, and walked me to a door at the back of the atrium I had never noticed: the inner stair, cut down into the rock.\n\nThe raiders' fires at the foot of the steps are cold. Their wagons are gone, and the wheel ruts run east, toward the sunrise. The one under the oilcloth went with them.\n\nAt the bottom of the stair there is a second door: a slab of sandstone carved with a horizon, three mirrors and eight small sockets. It is the page “The Oracle's Horizon”. And behind it, Silvia, someone is humming. The same tune the shepherd hummed for me on the hardpan.",
          choices: [
            {
              id: "choice-29-ready",
              text: "I'm ready. Let's seal the horizon.",
              silviaMsg: "I'm ready, Hermes. The page “The Oracle's Horizon” is open. Let's seal the horizon together.",
              hermesReply: "Together, then. I have climbed down a thousand stairs in my life, Silvia, and never one as short as this. My knees are shaking like a schoolboy's."
            },
            {
              id: "choice-29-hermes",
              text: "Are you all right, Hermes?",
              silviaMsg: "Before you go down: are you all right, Hermes? Really?",
              hermesReply: "No. And yes. I have been afraid of the wrong things for fifty-five years, Silvia: of the dark, of the sand, of being forgotten. This morning I am only afraid of a door. Stay on the wire."
            },
            {
              id: "choice-29-raiders",
              text: "And the raiders? The Astrolabe?",
              silviaMsg: "And the raiders? They still have the Astrolabe, Hermes.",
              hermesReply: "They do, and they have gone east with it, toward the dawn. One thing at a time, Silvia. Whatever is behind this door has waited longer than they have."
            }
          ]
        },
        {
          step: 30,
          completed: true,
          get hermesFinal() {
            return "Down the inner stair, then. The Servant stays at the top with a lamp; he says this door is not his to open.\n\nThe page “The Oracle's Horizon”, Silvia: eight beacons sent east across the three mirrors of the horizon, and the eight letters where they land. When the horizon is sealed, the door will open. " + sealsPhrase(countCairnSeals()) + " in my coat, and the Servant's key in my hand.";
          }
        },
        {
          // Station 19 debrief: Aurelia, the WHEN, and the raiders gone east with the Astrolabe
          step: 31,
          hermesInitial: "Silvia. I have been sitting beside her for an hour, and I still cannot believe my own eyes.\n\nShe did not die in 1971. A deep dune at the foot of the cliff caught her, the Servant found her days later in the dry wash, with no name and no memory, holding the disc to her chest. The Oracle before her had died in the same earthquake. She took the veil, and she has kept this desert ever since: the charts, the songs, the light on the tower. The gold stars. The lapis blue. It was her, all of it, all along.\n\nShe remembers pieces: the fire in the observatory, the cold of the terrace, my voice. Not the bridge. Not yet. When she says my name she says it carefully, the way you carry something full to the brim.\n\nAnd the disc gave you the first truth, Silvia: the WHEN. December, the eighteenth to the twentieth.",
          choices: [
            {
              id: "choice-31-stay",
              text: "Stay with her, Hermes. The rest can wait.",
              silviaMsg: "Stay with her, Hermes. The raiders, the Astrolabe, the next tower: all of it can wait a day.",
              hermesReply: "A day, then. She wants to show me her charts, and I want to watch her hands while she does. She still grinds the lapis exactly the way she did by our fire."
            },
            {
              id: "choice-31-memory",
              text: "Will her memory come back?",
              silviaMsg: "Will her memory come back, Hermes? All of it?",
              hermesReply: "The Servant says it comes back like water into a dry well: slowly, and from below. She remembered the vow when she heard it. She says the rest is waiting somewhere high and cold. I think I know where."
            },
            {
              id: "choice-31-follow",
              text: "Then we follow the raiders to the Stage.",
              silviaMsg: "Then we follow them. The Astrolabe is going to the third tower, and so are we.",
              hermesReply: "East, toward the Stage Tower, where the Mirror Speaker keeps the WHERE. They have the Astrolabe; we have the seals, the charts and the first truth. And this time, Silvia, I am not going alone."
            }
          ]
        },
        {
          step: 32,
          completed: true,
          get hermesFinal() {
            return "Two lines were scratched on the back of the disc, Silvia, under my old engraving, in a hand I would know anywhere: [Z] + [D] = 23 and [I] + [E] = 12. Into your Cipher Ledger with them.\n\nAnd she sent you something: a star of gold leaf on a card of lapis blue, painted while we talked. 'For the navigator who brought him back,' she said.\n\nThe Desert Path is done. The first truth is yours: the WHEN, the eighteenth to the twentieth of December. The second waits at the Stage Tower, with the Mirror Speaker. The road ends where the curtain rises.";
          }        },
        {
          // The Stage Path begins: the morning of departure from Tower II, with the unsent letter and the new sheets
          step: 33,
          hermesInitial: "Silvia. A whole day at the Sanctuary, the best one I have had since 1971. She showed me her charts, and I watched her hands.\n\nAt dawn we leave, Aurelia and I, east across the plateau, after the raiders' ruts. The Servant stays to guard the Sanctuary. He packed us bread, dates and a lamp, and would not hear a word of thanks.\n\nAurelia brought something from the cedar chest of the Sanctuary: a letter an Oracle of long ago wrote to the Mirror Speaker of Tower III, and never sent. It is written backwards. And this morning a pigeon of the Order landed on the stair with a packet for you: eight new pages for your journal. Open the page “The Unsent Letter”, Silvia, and find a mirror.",
          choices: [
            {
              id: "choice-33-go",
              text: "I have the sheets. Let's go to the third tower.",
              silviaMsg: "I have the new pages, Hermes, and a mirror. The page “The Unsent Letter” is in front of me. Let's go to the third tower.",
              hermesReply: "Then we walk. Eighteen hours to the gate of Tower III, if the plateau is kind. Aurelia walks faster than I do. She says I have grown slow. She is right."
            },
            {
              id: "choice-33-aurelia",
              text: "How is Aurelia this morning?",
              silviaMsg: "How is Aurelia this morning, Hermes?",
              hermesReply: "She hums when she walks, and she stops to draw things: a lizard, a cloud, the back of my head. She asked me if we used to argue. I said yes, about the stars. She laughed and said she was probably right. She was."
            },
            {
              id: "choice-33-letter",
              text: "What does the letter say?",
              silviaMsg: "What does the letter say, Hermes? Have you read it?",
              hermesReply: "Aurelia read it to me in the lid of my compass, slowly, and then she was quiet for a long time. Read it yourself, Silvia. Then tell me what you make of the last line, and of the Ashes."
            }
          ]
        },
        {
          step: 34,
          completed: true,
          hermesFinal: "East, then. We set out at first light with the raiders' ruts in front of us and the sun in our eyes: eighteen hours across the plateau to the third tower, with a short sleep at noon in the shade of their last camp.\n\nKeep the page “The Gate of a Thousand Masks” close, Silvia. Aurelia says the old charts of the Sanctuary draw the gate of Tower III as a wall of masks, and that the last line of the letter is about it: 'Only the one who sees what is not equal will find it.'"
        },
        {
          // Station 20 debrief: inside the gate, the Mirror Speaker's reflection, Fragment I and a note sealed with ash
          step: 35,
          hermesInitial: "SILVER. The word was SILVER, Silvia, and the wall of masks opened like a curtain.\n\nInside it is dark and warm and smells of candle wax and old velvet: a long corridor of mirrors. In every one of them, behind our own reflections, a woman in a grey gown walks beside us. When I turn round, there is no one there. Only in the glass. She has not said a word. She raised her hand and drew a line in the air, straight and flat as a horizon. Aurelia says that is how the Mirror Speaker signs.\n\nAnd the first piece of her mirror is in my hands. Fragment I: cold, heavy, with a little moon in it that is not in the sky.\n\nThere is something else. On the last mask, someone had pinned a note. Not the Mirror Speaker: the paper smells of smoke, and it is sealed with ash. A circle, with a line across it.",
          choices: [
            {
              id: "choice-35-note",
              text: "What does the note say?",
              silviaMsg: "What does the note say, Hermes? Read it to me.",
              hermesReply: "Seven words, in a fine and careful hand: 'Let her through. She is the treasure.' Then the seal. Aurelia went pale. She says the Ashes have a leader, and that he never writes to anyone. He has just written about you."
            },
            {
              id: "choice-35-speaker",
              text: "The Mirror Speaker: is she real?",
              silviaMsg: "The Mirror Speaker... is she real, Hermes? Or only a reflection?",
              hermesReply: "Real enough to cast a reflection, Silvia, which is more than I can say for some people I have met. Aurelia says the Mirror Speakers never show themselves: only their reflection, and only to those who come in peace. She drew her line again just now, in the glass beside me. I think she is listening to us."
            },
            {
              id: "choice-35-fragment",
              text: "Keep the fragment safe.",
              silviaMsg: "Keep Fragment I safe, Hermes. Wrap it well.",
              hermesReply: "It is wrapped in my scarf, next to the Gilded Star, against my heart. Eight more, Silvia. Aurelia says every room of this theatre keeps one, and every room has its own trick."
            }
          ]
        },
        {
          step: 36,
          completed: true,
          hermesFinal: "We sleep tonight behind the gate, in the old dressing rooms, on piles of costumes, with the lamp turned low. Aurelia found a crown of paper stars and put it on my head. I have not taken it off.\n\nThe note sealed with ash is in my coat. Whoever wrote it knew you were coming, Silvia. Let us find out what they want before they find out what we have.\n\nFragment I is set in the mirror. Look at Path III on your map: the glass has begun to remember."
        },
        {
          // Station 21: the candles burn down and the Mirror Speaker opens a door onto a stair
          step: 37,
          hermesInitial: "Silvia, are you awake? Nobody sleeps in this theatre for long. The candles along the dressing rooms burned down all together, and in the glass at the end of the corridor the grey gown was standing beside a door that was not there before. She drew her line on it, and it opened on a stair going down.\n\nAurelia has already gone ahead; I can hear her counting the steps. Before I follow: the page “The Camera Obscura”, Silvia. It is the city of the third tower, drawn upside down. Aurelia says it is not a map. It is a memory: the city as it stood yesterday. Have it ready.",
          choices: [
            {
              id: "choice-37-go",
              text: "I have the page “The Camera Obscura”. Go down.",
              silviaMsg: "I have the page “The Camera Obscura” in front of me, Hermes, upside down. Go down the stair.",
              hermesReply: "Then down we go. Thirty-one steps, by Aurelia's count, and the air is colder at every one of them."
            },
            {
              id: "choice-37-upside",
              text: "Why is the city upside down?",
              silviaMsg: "Why is the city on the page “The Camera Obscura” upside down, Hermes?",
              hermesReply: "Aurelia says it is not a mistake. It is the whole point. She would not say more. She smiled at the sheet like someone who has done this before, a long time ago."
            },
            {
              id: "choice-37-careful",
              text: "Be careful on the stair.",
              silviaMsg: "Be careful on the stair, Hermes. Hold the rail.",
              hermesReply: "There is no rail. There is Aurelia's hand, and she has not let go of mine since the gate."
            }
          ]
        },
        {
          step: 38,
          completed: true,
          hermesFinal: "We are at the bottom. A door with a hole in it, no bigger than a coin, and no light anywhere. Aurelia has put her hand over my lamp. In a moment my eyes will learn the dark.\n\nWhen they have, I will tell you what is on the wall. Open Path III on your Quest Map, Silvia, and look with me. You have the sheet. I have a hole in a wall."
        },
        {
          // Station 21 debrief: the narrow house, the warm ashes and Fragment II
          step: 39,
          hermesInitial: "Fragment II is in my hands, Silvia, and my hands are black to the wrists. It was in the chimney of the narrow house, wrapped in a cloth that smelled of old smoke. The Ashes had been there. The hearth was still warm, and the walls were scratched with their sign, a circle with a line across it, over and over. They left in a hurry.\n\nAurelia stood in the street a long time, looking up at the chimney. She says a fire like that is not lit by people who want to hide. It was lit so that someone would look.",
          choices: [
            {
              id: "choice-39-house",
              text: "What was in the house?",
              silviaMsg: "What else was in the house, Hermes?",
              hermesReply: "Nothing but ash, a stool and a broom with no bristles. And a floorboard with a hollow under it, empty. Whatever the raiders carried out of that house, they carried it quickly."
            },
            {
              id: "choice-39-safe",
              text: "Is Fragment II safe?",
              silviaMsg: "Is Fragment II safe, Hermes? Is it wrapped?",
              hermesReply: "In my scarf, beside the first one. The two of them hum when they touch, Silvia, like two glasses on a table. Aurelia says it is only the cold. I do not think she believes it."
            },
            {
              id: "choice-39-where",
              text: "Where did the raiders go?",
              silviaMsg: "Where did the raiders go, Hermes?",
              hermesReply: "Deeper into the theatre. The cellar has a second stair, and from the bottom of it comes a sound like a great many people whispering at once. Aurelia says the next room is made of whispers."
            }
          ]
        },
        {
          step: 40,
          completed: true,
          hermesFinal: "We rest in the cellar of the narrow house, with the hearth for company and the dust of the Ashes on everything. Aurelia has drawn the picture on the wall, upside down, in the margin of her sketchbook, so that she will not forget it.\n\nFragment II is set in the mirror. Look at Path III on your map: two pieces now, and in the second there is a window with a candle in it."
        },
        {
          // Station 22: the hearth goes out and the second stair leads down to the whispers
          step: 41,
          hermesInitial: "Silvia, the hearth has gone out, and the whispering under the floor has not stopped all night. In the black window of the cellar the grey gown stood a moment by the second stair, and drew her line across it.\n\nAurelia is already lacing her boots. She says the room below was built by the Order to keep secrets, and that it keeps them very badly. The page “The Whispering Gallery”, Silvia. A hall shaped like an egg, a string, and two pins nobody drew. Have it ready, and have a ruler.",
          choices: [
            {
              id: "choice-41-ready",
              text: "I have the page “The Whispering Gallery” and a ruler.",
              silviaMsg: "I have the page “The Whispering Gallery” in front of me, Hermes, and a ruler. Go down.",
              hermesReply: "Then down we go, as quietly as two old people can. Aurelia has taken off her boots after all. She says the floor below remembers footsteps."
            },
            {
              id: "choice-41-pins",
              text: "Why does the sheet have no pins?",
              silviaMsg: "Why did Aurelia leave the pins off the page “The Whispering Gallery”, Hermes?",
              hermesReply: "I asked her. She said that whoever needs the pins drawn for them should not be listening at them. Then she smiled, and said that you would not need them."
            },
            {
              id: "choice-41-quiet",
              text: "Be very quiet down there.",
              silviaMsg: "Be very quiet down there, Hermes. If you can hear them, they can hear you.",
              hermesReply: "Only at the right place, Aurelia says. Everywhere else the gallery swallows every sound. I will whisper to you from the stair, and nowhere else."
            }
          ]
        },
        {
          step: 42,
          completed: true,
          hermesFinal: "We are at the foot of the stair, at the door of a long hall with no corners. Columns all round it, and the dark in the middle. At the far end two voices are whispering, and I cannot make out one word.\n\nOpen Path III on your Quest Map, Silvia, and stand with me in the gallery. You have the sheet and the ruler. I have two ears, and they are not as young as yours."
        },
        {
          // Station 22 debrief: the words of the Ashes, the mirrored tune, Fragment III and the Line of the Echo
          step: 43,
          hermesInitial: "Fragment III is in my scarf with the other two, Silvia. They do not hum any more when they touch: they sing, very softly, the six bells of the niche, backwards.\n\nAnd we heard the Ashes. 'Leave it. She will come.' I have been turning those four words over all night. They are not hunting us. They are waiting for you. Aurelia says the line in the niche is for your Ledger: [J] × 2 = [T].",
          choices: [
            {
              id: "choice-43-she",
              text: "Who is 'she'?",
              silviaMsg: "Who did they mean, Hermes? 'She will come.'",
              hermesReply: "Aurelia looked at me, and I looked at the sheet in my hand, the one you sent me. I think we both know, Silvia. What I do not know is why they would wait for you instead of stopping you."
            },
            {
              id: "choice-43-line",
              text: "I will solve the line.",
              silviaMsg: "I will put [J] × 2 = [T] in my Ledger and solve it, Hermes.",
              hermesReply: "Twice J is T. You found T long ago, in the desert. Aurelia says the Order liked its echoes exact: a sound that comes back twice as strong is not an echo, it is an answer."
            },
            {
              id: "choice-43-aurelia",
              text: "What did Aurelia whisper?",
              silviaMsg: "What does Aurelia whisper toward the east end, Hermes?",
              hermesReply: "She will not tell me. Something short, always the same, and it comes back to us small and clear. Once I thought it was my name. Then I thought it was a date. I am too old to ask twice."
            }
          ]
        },
        {
          step: 44,
          completed: true,
          hermesFinal: "We sleep by the west pin, wrapped in our coats on the cold floor. Every sound in the gallery comes to us here, and none of it is the Ashes any more: only drops of water, and the columns settling.\n\nFragment III is set in the mirror. Look at Path III on your map: three pieces now, and in the third there is an arch, and the edge of a balcony."
        }
      ];



      // =======================================================================
      // THE DAWN SEGMENT: from the end of the storm to the North Portal of the Whispering Chasm
      // Hermes remembers the tone Silvia used so far (warm / protective / tactical / analytic).
      // =======================================================================
      const HERMES_TONE_MAP = {
        'choice-0-grounded': 'warm', 'choice-0-protective': 'protective', 'choice-0-cipher': 'analytic',
        'choice-1-name-hermes': 'warm', 'choice-1-name-cartographer': 'tactical', 'choice-1-name-order': 'analytic',
        'choice-2-wash-flint': 'protective', 'choice-2-cairns-compass': 'analytic', 'choice-2-lookout-spyglass': 'tactical',
        'choice-2-tactical': 'tactical', 'choice-2-landmarks': 'analytic', 'choice-2-windbreak': 'analytic',
        'choice-3-bearing-direct': 'tactical', 'choice-3-bearing-encouraging': 'warm', 'choice-3-bearing-cautious': 'protective'
      };
      const HERMES_TONE_LINES = {
        warm: "Silvia, your voice is the first sound I wanted to hear this morning. Thank you for staying on the wire all night.",
        protective: "Silvia, I slept sitting up, which you would have scolded me for, but I am in one piece. You can stop worrying for a moment.",
        tactical: "Silvia, shelter first and then the road: that was your plan, and it worked. Now for the road.",
        analytic: "Silvia, you trusted the stones of 1998 over the wind. I tested that this morning, and you were right."
      };
      const HERMES_TONE_FINALE = {
        warm: "I could not have lifted those stones with a heavy heart, and you kept mine light. Thank you.",
        protective: "You watched every step I took, even from so far away. I felt it.",
        tactical: "Clean work: no wasted moves, no loose ends. That is how a good survey is done.",
        analytic: "You found the order in the stones before I did. I think the Order would have liked you."
      };

      // Dawn steps: 0 and 1 are conversations, 2 is Cairn I (the stone-stacking game), 3 is the finale (done).
      const DAWN_DONE = 3;
      const DAWN_THREAD = [
        {
          step: 0,
          divider: "Dawn · The Great Silence",
          hermesInitial: "The wind has stopped. I woke up because of the quiet, not because of any noise.\n\nOut here they call it the Great Silence. After a big storm the desert holds its breath, and every sound carries for miles. I can hear my own heartbeat. I can hear sand sliding off the ledge, one grain at a time.\n\nI opened the door a crack. The sky is the color of a peach and the red dust still hangs low over the ground. Nothing moves: no raiders, no wagons, not even a bird.\n\nThe page “The Desert” in your journal lists the Three Laws of the Waste. Which one should I trust first this morning?",
          choices: [
            {
              id: "dawn-0-wash",
              tone: "tactical",
              text: "Law 2 on the page “The Desert”, the Dry Wash: the packed gravel of the riverbed is the only firm road.",
              silviaMsg: "Law 2 on the page “The Desert”, Hermes: the Dry Wash. The packed gravel of the dry riverbed is the only firm road through the canyons.",
              hermesReply: "The Dry Wash. Yes. The sand will take a week to settle, but gravel packed by a thousand floods does not care about one storm.\n\nThere is a riverbed just below the watchtower. My map calls it Wadi al-Hajar, the river of stones. I will go down to it and keep my eyes open."
            },
            {
              id: "dawn-0-shadow",
              tone: "analytic",
              text: "Law 1 on the page “The Desert”, the Meridian Shadow: wait for noon and read true north from the shortest shadow.",
              silviaMsg: "Law 1 on the page “The Desert”, Hermes: the Meridian Shadow. At true noon the shortest shadow shows true north, and north points home to the observatory.",
              hermesReply: "A fine law, and I will keep it close. Something tells me shadows will matter again before this journey is over.\n\nBut noon is hours away, and the silence will not last. While I wait, I will go down to the riverbed under the watchtower. Wadi al-Hajar, the river of stones: dry now, but it is the other law on that sheet, and it is right under my feet."
            },
            {
              id: "dawn-0-rest",
              tone: "protective",
              text: "Don't rush out, Hermes. Eat something, drink some water, and test the ground before you trust it.",
              silviaMsg: "Don't rush out, Hermes. Eat something, drink some water, and test the ground before you trust it. The page “The Desert” can wait five minutes.",
              hermesReply: "Dry figs and a mouthful of water, as ordered. I feel almost human again.\n\nAnd I tested the ground, I promise: three taps with my stick on every step. The only firm road out of here is the one your page “The Desert” calls the Dry Wash, the old riverbed under the watchtower. Wadi al-Hajar, the river of stones. I am going down."
            }
          ]
        },
        {
          step: 1,
          divider: "The Dry River · Wadi al-Hajar",
          hermesInitial: "I am standing in Wadi al-Hajar now. It is wider than a street, with red walls on both sides and a floor of smooth gray stones, polished by water that left long ago. The silence is even deeper down here.\n\nThe map on the page “Grand Desert Map · North-West” marks the safe road running west, straight to the canyon mouth. But my feet want to turn south, following this dry river into the unknown.\n\nI have no reason for it, Silvia. It is only a hunch, a pull like a quiet hand on my sleeve. Do I trust it, or do we stick strictly to the surveyor's line?",
          sketch: { src: "./assets/chat/sketch_dry_wash.webp", caption: "The dry riverbed, from the ledge below the watchtower." },
          choices: [
            {
              id: "dawn-1-trust",
              tone: "warm",
              text: "Trust it, Hermes. A hunch is just an old memory you cannot read yet. Follow the river south, and tell me what you find.",
              silviaMsg: "Trust it, Hermes. A hunch is just an old memory you cannot read yet. Follow the river south, and tell me what you find.",
              hermesReply: "An old memory I cannot read yet... I like that. It is a kinder name than a foolish old man's whim.\n\nI am following the river south, one stone at a time."
            },
            {
              id: "dawn-1-marker",
              tone: "tactical",
              text: "Go take a look, Hermes, but leave a chalk mark every hundred paces. If it's nothing or looks dangerous, do not touch anything and turn back.",
              silviaMsg: "Go take a look, Hermes, but leave a chalk mark every hundred paces. If it's nothing or looks dangerous, do not touch anything and turn back.",
              hermesReply: "Chalk stripes on the stones, every hundred paces. Done. I will inspect the riverbed, but I will keep my hands in my pockets until you give the word.\n\nI am walking south along the dry river."
            },
            {
              id: "dawn-1-reject",
              tone: "protective",
              isBypass: true,
              text: "No, Hermes. Do not chase hunches in an empty desert. The map says west to the canyon. Keep your canteen full and head straight to the portal.",
              silviaMsg: "No, Hermes. Do not chase hunches in an empty desert. The map says west to the canyon. Keep your canteen full and head straight to the portal.",
              hermesReply: "You are right, Silvia. A surveyor who follows whims in the waste is a surveyor who does not come back. The sun is climbing, and our water is too precious for ghost hunts.\n\nI am turning west, away from the river, following the hard rock shelf straight toward the gorge."
            }
          ]
        },
        {
          step: 2,
          divider: "The Heart of the River",
          hermesInitial: "Silvia! Stop everything. Look at what the river was hiding.\n\nA heap of stones, half buried in silt. They are round river stones, not cut sandstone, and somebody stacked them into a cone by hand. A long time ago, judging by the dust on them. I know this shape, and I cannot tell you how.\n\nAt the foot of the heap there is a flat slab with three round hollows cut into it, three foundations in a row. Four stones of different sizes lie on the first one, the largest at the bottom. A line of old letters on the slab says that the pile must be carried to the third hollow, one stone at a time, never a big stone on a small one.\n\nMy hands are shaking from thirst and my head is foggy. You see this better from where you are. What should we do?",
          sketch: { src: "./assets/chat/sketch_cairn_one.webp", caption: "Half buried in silt: river stones, stacked by an old hand." },
          game: true
        },
        {
          step: 3,
          divider: "The North Portal",
          hermesFinal: "It is done. The last stone settled and the whole base gave a soft click, as if the river itself had exhaled. A hollow opened under the third foundation, and in it lay a flat disc of sandstone, as big as my palm: a sun above a wavy line. The Wash River seal.\n\nI have no idea what it opens. But the Order does not hide things without a reason, so it goes into the front pocket of my satchel, and I will carry it carefully.\n\n{TONE}\n\nI followed the river to its end, and the red walls closed in around me. At the end of the wash the rock splits open into a narrow gate: the North Portal of the Whispering Chasm. The wind is already murmuring inside, so softly that I can almost make out words.\n\nOpen the Grand Desert Map, Silvia, and find the page “The Whispering Chasm” in your journal. This is where the canyon begins.",
          sketch: { src: "./assets/chat/sketch_chasm_mouth.webp", caption: "The North Portal of the Whispering Chasm." }
        }
      ];

      const FIELD_INQUIRIES = [
        {
          id: "inq-shelter",
          title: "Where is this cliffside workshop?",
          category: "The Workshop",
          group: "workshop",
          answer: "I set up camp inside an old stone shelter at Watchtower VI, right against the canyon wall. There is an ancient fireplace, a stone workbench, and old tools left behind. That's where I put this telegraph together from spare brass gears and copper wire."
        },
        {
          id: "inq-map-quadrants",
          title: "Why is the desert map split into four pages?",
          category: "The Grand Map",
          group: "desert",
          answer: "The desert is huge! It was too large to fit on a single page, so I drew it across four journal leaves: Northwest, Northeast, Southwest, and Southeast. Together, they show the solid rocky ground that sandstorms can't wash away."
        },
        {
          id: "inq-raiders-astrolabe",
          title: "What happened to the real Astrolabe?",
          category: "The Stolen Relic",
          group: "astrolabe",
          answer: "Weeks ago, raiders broke into the Alpine Observatory and stole the original Astrolabe. The one I have with me is just a backup copy I made from scrap metal. The raiders headed south into the desert, but their heavy wagons broke down in the storm. They are stuck somewhere ahead, and we need to get the real Astrolabe back."
        },
        {
          id: "inq-desert-oracle",
          title: "Who is the Desert Oracle and where is Tower II?",
          category: "Guardians",
          group: "desert",
          answer: "She is the second guardian of the Order, living at Tower II (The Sandstone Sanctuary) deep in the Great Erg. While I study the stars in the night sky, she understands the desert earth, sun shadows, and celestial alignments. She knows exactly where the thieves are hiding and how to breach their defenses."
        },
        {
          id: "inq-oasis-steles",
          title: "What are the three sandstone steles at the Nomad Ruins?",
          category: "The Nomad Ruins",
          group: "desert",
          answer: "Standing among the ruined walls of the nomad camp at Camp VII are three tall sandstone steles. The middle one holds the same ten words as the page “The Desert Lexicon & Al-Qibla”, every groove packed with sand. The second one has a stone curb at its foot, where the needle's shadow lights the line [R] × 2 = [F] once Al-Qibla is locked. The tallest carries the bronze Al-Qibla sun compass. Two of the raiders stayed behind to watch them, one asleep and one walking a round with a torch."
        },
        {
          id: "inq-al-qibla",
          title: "What is the Al-Qibla heading and why 194° SSW?",
          category: "Navigation",
          group: "desert",
          answer: "Al-Qibla is the sacred direction dial used by nomads to cross trackless dune seas. In the raiders' bivouac, its needle locks on 194° South-Southwest: the heading the BC Ashes carved before they fled with the Astrolabe. A needle has two ends, though: the sun-bird's tail points the reverse way, 14° North-Northeast, through the shifting sands of the Great Erg to Tower II (The Sandstone Sanctuary). Without this calibrated line, an expedition would wander in circles and perish in the Erg."
        },
        {
          id: "inq-four-wells",
          title: "What are the Four Wells of Camp VIII?",
          category: "The Clepsydra",
          group: "desert",
          answer: "Deep beneath Camp VIII lie the Four Wells: Falcon, Jackal, Scarab, and Serpent. Fed by a subterranean aquifer, they are interconnected by copper siphons and balanced by shadow counterweights that only open when the Four Seekers are aligned."
        },
        {
          id: "inq-shadow-hours",
          title: "How do shadow-hours work in the Clepsydra?",
          category: "Hydraulics",
          group: "desert",
          answer: "Nomadic water clocks (clepsydras) measure time by water volume draining through precision orifices. The four canonical arrival intervals are Hour III, Hour VI, Hour IX, and Hour XII. The sum of all four hours (3 + 6 + 9 + 12 = 30, or Key XXX) unlocks the master release weir."
        },
        {
          id: "inq-falcon-weir",
          title: "What is the Falcon Weir inscription [P] - [A] = 14?",
          category: "The Cipher Ledger",
          group: "astrolabe",
          answer: "Scratched into the rock beside the falcon carving, at the real spring Hermes found once the mirage of the four wells faded, is the algebraic relation [P] - [A] = 14. It provides a direct mathematical constraint between P and A in the Cipher Ledger without spoiling their raw numeric values, honoring the ancient laws of cryptography."
        },
        {
          id: "inq-phoenix-sigil",
          title: "What is the Desert Sigil PHOENIX?",
          category: "Sacred Lore",
          group: "desert",
          answer: "The seven circled letters of the Nomad Ruins crossword spell P-H-O-E-N-I-X, the mythical fire-bird that is reborn from its own ashes under the noon sun. Ancient temple records state that the Desert Oracle only opens the stone sanctuary gates to pilgrims who present this sacred sigil."
        },
        {
          id: "inq-dust-navigation",
          title: "How do we find our way through dust and storms?",
          category: "Navigation",
          group: "desert",
          answer: "Never walk over soft sand dunes that shift in the wind. Always follow dry, rocky riverbeds where your footing is solid, check shadows at noon to find north, and look for stone markers buried along the path."
        },
        {
          id: "inq-teletype-wire",
          title: "How does this telegraph work?",
          category: "The Telegraph",
          group: "workshop",
          answer: "The howling gales severed the old copper lines along the high ridge, so I salvaged clock gears, a copper coil, and a battery cell here in the shelter to rig this direct telegraph wire. It sends electrical pulses along the canyon wall straight to your console, entirely sheltered from the storm."
        },
        {
          id: "inq-three-laws",
          title: "What are the rules for surviving the desert?",
          category: "Desert Rules",
          group: "desert",
          answer: "Three simple rules: 1. At noon, your shadow points north. 2. Walk on hard riverbeds, never loose sand dunes. 3. Look for stone piles and buried metal markers to stay on course."
        },
        {
          id: "inq-1998-log",
          title: "What is the Autumn 1998 Field Log?",
          category: "Old Journal",
          group: "astrolabe",
          answer: "Twenty-eight years ago, in 1998, I surveyed this desert. I built the three stone cairns and buried the first 112° copper marker under the third of them, and its twin at the foot of the watchtower trail, so that someone could follow my trail years later. That someone is you, Silvia."
        },
        {
          id: "inq-languages",
          title: "Why are notes written in different languages?",
          category: "Languages",
          group: "workshop",
          answer: "Travelers and merchants from all over the world have crossed this desert for centuries, and the raiders come from different places too. That's why you'll find notes in English, Spanish, French, and Catalan throughout the journal."
        },
        {
          id: "inq-eclipse-order",
          title: "What is The Eclipse Order?",
          category: "The Order",
          group: "constellation",
          answer: "An old fellowship of astronomers, builders and thinkers who guard secrets that travel between worlds. Its sign is the disc that is half white and half dark, and its sacred hour is 22:22, when the constellations reach their highest point. I joined the Order as a young man, and I still serve it."
        },
        {
          id: "inq-three-towers",
          title: "What are the Three Ancient Towers?",
          category: "The Order",
          group: "constellation",
          answer: "The Order raised three towers to watch over its secrets. Tower I is the Alpine Observatory, high in the snow, where I kept the stars. Tower II is the Sandstone Sanctuary in the desert, home of the Oracle. Tower III is the Stage Tower, where the Mirror Speaker guards light, symmetry and music. The raiders believe that when all three are lined up, a forbidden fourth chamber will open."
        },
        {
          id: "inq-true-name",
          title: "Why did you call yourself the Cartographer?",
          category: "Hermes",
          group: "constellation",
          answer: "A long time ago I lost someone I loved at the Southern Bridge, and I buried my name with her. For years I answered only to the Cartographer. Then you spoke the words I had carved into a brass dial, and you gave my name back to me. You can call me Hermes."
        },
        {
          id: "inq-eclipse-script",
          title: "What is the Eclipse Script?",
          category: "The Alphabet",
          group: "constellation",
          answer: "It is the Order's own alphabet: twenty-six glyphs carved in stone and bronze. They look strange, but each one stands for an ordinary letter. The numbers hidden behind the letters are another matter. You must work those out yourself in your Cipher Ledger, and I will never hand them to you."
        },
        {
          id: "inq-distant-light",
          title: "What does \"Distant Light\" mean?",
          category: "The Order",
          group: "constellation",
          answer: "Starlight leaves its star long before it reaches your eye, so what looks far away is already on its way to you. The Order has a saying for it: what is far is not lost, it is simply on its way."
        },
        {
          id: "inq-six-stars",
          title: "Which stars can the Astrolabe point to?",
          category: "The Astrolabe",
          group: "astrolabe",
          answer: "Only six: Aldebaran, Polaris, Vega, Altair, Deneb and Arcturus. They are the master stars of its star web. For the rest of the sky we have to work things out together, using the games in your journal."
        },
        {
          id: "inq-replica-flaws",
          title: "Why is your replica Astrolabe not as good as the real one?",
          category: "The Astrolabe",
          group: "astrolabe",
          answer: "I made it from scrap brass in a hurry. Its parts are loose, its star pointers are not as sharp, and its readings can be off by a few degrees. It is good enough to teach us, but not good enough to open anything."
        },
        {
          id: "inq-fourth-chamber",
          title: "What do the raiders want with the Astrolabe?",
          category: "The Stolen Relic",
          group: "astrolabe",
          answer: "We intercepted their orders. They believe the Astrolabe can find a forbidden fourth chamber when it is lined up with the Three Towers. They think I only ever used it as a telescope, and I will not be the one to tell them otherwise."
        },
        {
          id: "inq-ledger-how",
          title: "How do I use the Cipher Ledger?",
          category: "The Cipher Ledger",
          group: "astrolabe",
          answer: "It starts empty on purpose. Every equation we find is a clue: two letters, joined by a sum or a difference. Put two clues about the same letters side by side and the values begin to fall out. Write what you work out in the Ledger, then test it against the next clue. If you get stuck, look for another equation that shares a letter."
        },
        {
          id: "inq-signal-meter",
          title: "What does the signal meter show?",
          category: "The Telegraph",
          group: "workshop",
          answer: "It shows how clearly the wire carries my voice to you. Solid rock and calm air keep it high; wind and dust push it down. If it drops, wait a little and ask again. The wire always comes back."
        },
        {
          id: "inq-safe-here",
          title: "Are you safe where you are?",
          category: "Hermes",
          group: "workshop",
          answer: "For now. The shelter has thick walls, a fire and enough water to last. The raiders are stuck in the dunes. What worries me most is the storm, not them. Keep solving, Silvia. Knowing you are out there keeps me steady."
        },
        {
          id: "inq-journal-purpose",
          title: "Why does the journal hold maps and puzzles?",
          category: "Old Journal",
          group: "workshop",
          answer: "The raiders can listen to the wire and the radio, but they have never seen the journal. What I cannot say through the air, I put on paper, and only you can read it."
        },
        {
          id: "inq-chasm",
          title: "What is the Whispering Chasm?",
          category: "The Whispering Chasm",
          group: "desert",
          answer: "A deep, narrow canyon that twists back on itself like a knot, and the wind inside it carries every sound, even a whisper. Long ago the desert walkers hid six relics in it, one on each of six cairns, and left four laws for anyone who follows them. Never walk the same ground twice. Never take the quick road that skips the cairns. Find all six, in order, before you leave. And treat every dead end as a trap. The page “The Whispering Chasm” of your journal shows the whole maze from above, so you can see what I cannot."
        },
        {
          id: "inq-cairns",
          title: "What are the Cairns?",
          category: "The Grand Map",
          group: "desert",
          answer: "Five stone markers of the Order stand along the only safe road through the desert. In 1998 I raised three piles of stones to mark my own route, never imagining they would matter again. The first Cairn gave up its seal when I followed a hunch along the dry riverbed, and I still wonder why my hands remembered the place."
        },
        {
          id: "inq-salt-playa",
          title: "What is the Salt Playa?",
          category: "The Salt Playa",
          group: "desert",
          answer: "A dry lake of blinding white salt. Under the crust there are pockets of brine that swallow boots. The old surveyors marked the safe slabs with facets and letters, and the safe way across follows a pattern. Count carefully before you tell me where to step."
        },
        {
          id: "inq-bc-ashes",
          title: "Who are the raiders?",
          category: "The Stolen Relic",
          group: "desert",
          answer: "They call themselves the BC Ashes. At Camp VII their banner opened in the wind as the last riders left: a bird of fire, the same mark that is burned into the oilcloth of their wagon, and on the hearth stone one of them had cut their name with a knife. They are bandits, but they do not steal blindly. They wanted the Astrolabe for what it might open."
        },
        {
          id: "inq-great-silence",
          title: "Why is the desert so quiet after a storm?",
          category: "The Great Silence",
          group: "desert",
          answer: "The old nomads call it the Great Silence. When the wind drops, the air is clean and still, and a voice or a footstep can carry for miles. The page “The Desert” says the desert is the purest archive of the Order: it strips away everything and leaves only the stone. Listen well after a storm. You hear what stays."
        },
        {
          id: "inq-wadi",
          title: "What is Wadi al-Hajar?",
          category: "The Dry River",
          group: "desert",
          answer: "The Dry Canyon Wash on your map, on the page “Grand Desert Map · North-West”. A wadi is a riverbed that only runs after rain, and al-Hajar means of the stones. The winter floods pack its gravel hard, so it is the one safe road through the red canyons."
        },
        {
          id: "inq-satchel",
          title: "What do you carry in your satchel?",
          category: "The Workshop",
          group: "workshop",
          answer: "Not much: dry figs, a water skin, a compass, a stub of pencil and my brass replica of the Astrolabe that never quite works. And a small pocket at the front, kept for whatever the road decides to give me."
        },
        {
          id: "inq-stacking-rule",
          title: "How do the stones of Cairn I work?",
          category: "Cairn I",
          group: "desert",
          answer: "Four stones, three foundations. Move one stone at a time, only the top one of a pile, and never set a big stone on a small one. Think about the smallest stone: it is always free to move, and every move you make should clear room for the next. Don't hurry. A stone put down in the wrong place can always be lifted again."
        },
        {
          id: "inq-seal-one",
          title: "What is the Seal of Cairn I?",
          category: "Cairn I",
          group: "desert",
          answer: "A flat disc of sandstone as big as my palm, with a sun above a wavy line: the sun and the river. It was waiting in a hollow under the stones. I do not know yet what it opens, but the Order never hides anything without a reason."
        },
        {
          id: "inq-river-hunch",
          title: "Why did you follow the river on a hunch?",
          category: "Cairn I",
          group: "desert",
          answer: "I wish I knew. My feet turned south before my mind agreed. When I found the first Cairn, I knew the shape of its stones. Some places are remembered by the hands and not by the head. I will think about that when I have time, and when the answer decides to come."
        },
        {
          id: "inq-monolith-shadows",
          title: "How do I read the shadows on the page “The Sun Monolith & Cairn II”?",
          category: "Cairn II",
          group: "desert",
          answer: "Think of my staff and the Monolith as two people standing side by side in the sun. Whatever the hour, the taller one casts the longer shadow, always in the same proportion. My staff is two paces tall and the Monolith twenty-four: twelve times taller, so at any noon its shadow is twelve times the shadow of my staff. Work out each noon on paper, find that distance among the rings of the dial, and read the letter carved there. I will not do the arithmetic for you; the stone would know."
        },
        {
          id: "inq-walking-sun",
          title: "How does a shadow move during the day?",
          category: "Cairn II",
          group: "desert",
          answer: "A shadow always runs away from the sun. At sunrise the sun is in the east, so shadows stretch long toward the west. As the sun climbs they shrink and swing north, and at true noon they are at their shortest, pointing straight at the north star. In the afternoon they grow again and lean toward the east, until at sunset they are endless. Read the inscription with that in mind: it tells you where the shadow must fall, not what time it is."
        },
        {
          id: "inq-cairn2-niche",
          title: "Who tried to force the niche of Cairn II?",
          category: "Cairn II",
          group: "desert",
          answer: "The iron marks are the raiders'. The BC Ashes carry pry bars on their wagons, and the ash in the cracks is the same grey ash as on their banners. They know the Astrolabe needs the seals, and they tried to take one by force. But the founders built every cairn so that only the patient can open it. Force finds nothing but stone."
        },
        {
          id: "inq-labyrinth-arches",
          title: "How do I find the true road on the page “The Sandstone Labyrinth & Cairn III”?",
          category: "Cairn III",
          group: "desert",
          answer: "Start at the Southern Mouth, never at the cairn: the tablet was written for someone walking in. Trace with a pencil and keep one hand on the wall, the way a blind man walks a corridor; every dead end you leave behind, shade it in, and the true road will stand out on its own. Only the arches that stand on that one road count, and only in the order you pass beneath them. The arches in the side fissures are there to fool the hurried. Eight letters, Silvia, read from the mouth to the cairn."
        },
        {
          id: "inq-torch-rounds",
          title: "How do the raiders' torches move?",
          category: "Cairn III",
          group: "desert",
          answer: "They walk rounds, Silvia, the same squares again and again, like sentries on a wall. Some go back and forth along one corridor; one walks a loop beside their camp. A torch only lights what is in front of it, so the safest place in the labyrinth is right behind one. Hold still in a side passage, let the light go past, then follow it. I have drawn their rounds on your board so you can count the beats between them."
        },
        {
          id: "inq-cairn3-plate",
          title: "What was under the copper plate of Cairn III?",
          category: "Cairn III",
          group: "desert",
          answer: "Two plates, one on top of the other. On top, the copper benchmark I set myself in 1998, pointing 112° to Outer Watchtower VI, without knowing whose stones I was stacking (the page “The Five Geodetic Cairns”). Beneath it, the founders' own copper plate, with eight letter slots and the old groove of 348° cut into the stone. When the eight letters of the true road were spoken it turned on its pin, and the founders' stone was waiting underneath with the Seal of Cairn III and two lines: [W] + [A] = 26 and [N] − [E] = 9."
        },
        {
          id: "inq-seven-echoes",
          title: "How do I turn the echoes on the page “Cairn IV: Sentry of the Canyon” into letters?",
          category: "Cairn IV",
          group: "desert",
          answer: "Take one echo at a time. The pillar tells you which cliff answered: Left pillar, left cliff; Right pillar, right cliff, never the other way. The beats tell you how far: each beat is 5 paces, so multiply the beats by five. Find that ring on the survey plan and read the letter carved on that cliff, at that ring. Seven echoes, seven letters, in the order of the log."
        },
        {
          id: "inq-count-echo",
          title: "How do I count an echo by ear?",
          category: "Cairn IV",
          group: "desert",
          answer: "Do not count the echo; count from the call. The moment a pillar calls, start at zero with the chronometer's ticks and stop when the same voice comes back, softer and further away. The Left pillar sings low and on your left, the Right pillar higher and on your right; a long call comes back long. If two echoes cross, the tape keeps them all: read it after the wind is quiet. I have numbered the beats on it for you."
        },
        {
          id: "inq-tuning-pebble",
          title: "What is the pebble from the Left pillar?",
          category: "Cairn IV",
          group: "desert",
          answer: "A river pebble, smooth as an egg, with a small eight-point star painted in gold on a ground of blue. It was wedged in the throat of the Left pillar, exactly where it turns the night wind into three short calls and two long ones: the code of Aurelia's disc. The bronze reeds are the founders' work. The pebble is not. Someone came here after them, and knew what they were doing."
        },
        {
          id: "inq-midsummer-ray",
          title: "How do I follow the ray on the page “Arch of the Solstice & The Solar Altar”?",
          category: "Cairn V",
          group: "desert",
          answer: "Put your finger under the arch, where the arrow is, and walk straight down. When you meet a bronze mirror, turn a quarter along its slant, the way a ball bounces off a wall at a corner: the slant tells you whether you go left or right. A fallen pillar ends a false path; go back and check your last turn. Every lettered sun-stone your finger crosses is a letter of the sigil, in that order, until the ray reaches the Solar Altar. Eight letters."
        },
        {
          id: "inq-autumn-dawn",
          title: "How do I aim the mirrors for an October dawn?",
          category: "Cairn V",
          group: "desert",
          answer: "Work backwards, Silvia. Start at the altar and ask: from which side can light come in? Follow that line back until it meets a mirror, and ask the same question there. When your backward path reaches the top of the courtyard, it tells you where the ray must enter the arch. The four rays of the dawn enter at four places, further west each time, and each needs a few mirrors turned. You can set the first one in the dark, before you call the dawn; then you only have to be quick for the others. I have learnt to breathe slowly: now each ray waits a little longer."
        },
        {
          id: "inq-light-code",
          title: "How do I answer the light on Tower II?",
          category: "Cairn V",
          group: "desert",
          answer: "Watch the whole pattern before you answer: short flashes are a blink, long ones a held breath. Then hold the mirror the same way: a quick touch for a short flash, a long press for a long one, in the same order, and send it. If you lose count, watch it again; the light is patient. I have written the last pattern in my log for you."
        },
        {
          id: "inq-light-on-tower",
          title: "Who answered from Tower II?",
          category: "Cairn V",
          group: "desert",
          answer: "I do not know, Silvia. I know what it knew: a code I made for Aurelia, three short and two long, that nobody else ever learnt from me. I know what it said: two lines in the old light-code of the Order, slow and careful, like someone who has done this many times. And I know that it went out all at once, and that there was smoke at dawn. Whoever it was, they are inside Tower II, and the raiders are at its door."
        },
        {
          id: "inq-stele-stanzas",
          title: "How do I read the stanzas on the page “The Polybius Stele”?",
          category: "Tower II",
          group: "desert",
          answer: "Each pair of numbers in a stanza points to one square of the grid at the top of the stele: the first number counts down the rows, the second across the columns. That is the plain reading, for stanzas I, III and V. In stanzas II, IV and VI the mirage swaps them: the first number is the column and the second the row. Write each letter in its box, and the six words make one proverb. The little numbers at the end of each line tell you how many letters to expect."
        },
        {
          id: "inq-stele-knocks",
          title: "How do I read the Servant's knocks?",
          category: "Tower II",
          group: "desert",
          answer: "Count the knocks in each group and write the numbers down in pairs: a short pause separates the two groups of a letter, a longer one separates the letters. Then look them up in the grid on the page “The Polybius Stele”, as you did with the stanzas. And remember which stanza you are in, counting his and yours together: in the even ones the mirage swaps the pair. When it is your turn to answer, knock the first group, press Pause, knock the second, and so on, letter by letter."
        },
        {
          id: "inq-burning-atrium",
          title: "How do I cross the burning atrium?",
          category: "Tower II",
          group: "desert",
          answer: "Do not race the fire across the mats: it spreads one flagstone a turn, and it will catch you. Bare stone never burns, so it is a safe place to wait while the fire goes by, and three turns after a flagstone catches it is ash, and ash cannot burn again. Find stone to stand on, let the fire pass in front of you, then walk on its ash toward the hatch. Glowing flagstones catch on the next turn. Now every flagstone also shows in how many turns it will catch."
        },
        {
          id: "inq-servant-well",
          title: "What happened in Tower II?",
          category: "Tower II",
          group: "desert",
          answer: "The raiders came at dusk and asked for the Oracle and her charts, the earth half of the Astrolabe. The Servant refused. They burned the library of the atrium to smoke out whoever was hiding, and he went down into the old well with the charts and shut the hatch over his head. He heard me speak the proverb at the stele and answered in its grid, and you answered him. The Oracle is safe, deeper in the rock than any fire can reach. About who answered my light, he said only this: 'She came from the edge of the sky with a disc in her arms and no name.'"
        },
        {
          id: "inq-oracle-mirrors",
          title: "How do the three mirrors on the page “The Oracle's Horizon” work?",
          category: "Tower II",
          group: "desert",
          answer: "Take one beacon at a time and fold it across each mirror in turn, as if the chart were paper. Mirror I is the upright line on column 4: a beacon three columns to its left lands three columns to its right, on the same row. Mirror II is the horizon of the Sanctuary: in column 6 it lies on Row D, everywhere else on Row F, and a beacon two rows above it lands two rows below it, in the same column. Mirror III, on column 10, works like Mirror I. After the third fold, write down the letter the beacon lands on. Eight beacons, eight letters, in order."
        },
        {
          id: "inq-oracle-disc",
          title: "How do I set the disc of 24 sightings?",
          category: "Tower II",
          group: "desert",
          answer: "Each ring has one small gold star engraved beside one of its letters: Aldebaran on the outer ring, Capella in the middle, Polaris on the inner one. Look at the sky I drew beside the disc, with north at the top, and turn each ring until its star points the same way as the real star. When all three point true, the jewel answers. Then read it the way I engraved it: start at the north spoke, read rim, middle, heart, then move clockwise to the next spoke. Three letters a spoke, eight spokes."
        },
        {
          id: "inq-oracle-vow",
          title: "Which words does she remember?",
          category: "Tower II",
          group: "desert",
          answer: "Some of the words she remembers belong to the long prophecy of the Order: 'You were never only the seeker.' Those are true, but they were not mine. Mine were the five you sent me from the cliffs, the night the storm began, the words that gave me back my name. Put those five in order, and I will say them to her."
        },
        {
          id: "inq-oracle-aurelia",
          title: "What happened to Aurelia?",
          category: "Tower II",
          group: "desert",
          answer: "She did not die in 1971. A deep dune at the foot of the cliff caught her fall, and days later the Servant found her in the dry wash with the brass disc in her arms and no memory of who she was. The Oracle before her had died in the same earthquake, and the Servant took her for a sign. She has worn the veil ever since: she painted the charts, tuned the pillars, answered my light. When I said the vow she remembered my voice, the fire and the terrace. The rest is still coming back, slowly, from below."
        },
        {
          id: "inq-unsent-letter",
          title: "Who wrote “The Unsent Letter”?",
          category: "Tower III",
          group: "stage",
          answer: "An Oracle of Tower II, centuries ago, to the Mirror Speaker of her time. Aurelia found it in the cedar chest of the Sanctuary, under the oldest charts. It is written the way a mirror sees, from right to left: hold the page up to a mirror and it reads plainly. It asks forgiveness, it tells how the two of them broke the mirror of Tower III into nine pieces so that no one could turn the Astrolabe alone, and it warns about the Ashes. The last line is a riddle about the gate."
        },
        {
          id: "inq-masks-lie",
          title: "How do I find the masks that lie on the page “The Gate of a Thousand Masks”?",
          category: "Tower III",
          group: "stage",
          answer: "Look at each mask as if a line ran down the middle of its face, through the letter on the forehead and the nose. A true mask is the same on both sides: what is on the left is on the right, at the same height. A mask that lies has something on one side only, or something missing on one side: a tear, a feather, a crack, an eyebrow, a ribbon, an eye of a different shape. Careful: a mask with two tears, or two feathers, is telling the truth. There are six liars. Read their letters left to right, row by row."
        },
        {
          id: "inq-masks-halves",
          title: "How do I give a mask its other half?",
          category: "Tower III",
          group: "stage",
          answer: "Pretend the dotted line is the edge of a mirror. Every point of the gold half has a twin on the other side: as far from the line, at the same height. Start with the outline, from the top of the forehead down to the chin, then the eye, the eyebrow and whatever else that mask carries. You do not need a steady hand, only every line. If you rub out too much, start again: the mask does not mind waiting."
        },
        {
          id: "inq-ash-note",
          title: "Who left the note sealed with ash?",
          category: "Tower III",
          group: "stage",
          answer: "We do not know yet. The note was pinned on the last mask of the gate: 'Let her through. She is the treasure.' The seal is a circle of ash with a line across it, a little like the sign of the Order, but not quite. Aurelia says the Ashes are older than the Order, and that they obey one leader they never name. Whoever he is, he wanted you to pass. I do not know whether that should comfort me."
        },
        {
          id: "inq-camera-upside",
          title: "Why is the city upside down on the page “The Camera Obscura”?",
          category: "Tower III",
          group: "stage",
          answer: "A camera obscura is a dark room with a hole no bigger than a coin in one wall. Light from the street goes through the hole and paints the whole city on the opposite wall, but upside down, because light travels in straight lines and crosses at the hole. Aurelia drew the page “The Camera Obscura” the way that wall shows it, so that the sheet and the wall can be held side by side. The city on the sheet is how it stood yesterday. On the wall, today, four things are different."
        },
        {
          id: "inq-camera-house",
          title: "What did we find in the narrow house?",
          category: "Tower III",
          group: "stage",
          answer: "The narrow house behind the market had a cold chimney on the page “The Camera Obscura” and a smoking one on the wall. The Ashes had lit a fire in its cellar so that someone would look, and they left Fragment II in the chimney, wrapped in a sooty cloth. The other three changes were only the city living its day: a new flag on the clock tower, a cart in the street and a shutter that someone had closed."
        },
        {
          id: "inq-gallery-pins",
          title: "Why does a whisper cross the gallery?",
          category: "Tower III",
          group: "stage",
          answer: "Because the gallery is an ellipse, the shape Kepler found in the paths of the planets. You draw one with two pins and a loop of string: keep the string tight with a pencil and go round. The two pins are its foci, and an ellipse has a secret: every sound that leaves one focus bounces off the wall and arrives at the other, all at the same moment. So a whisper at one pin is clear at the other, and lost everywhere else. The page “The Whispering Gallery” shows the string, but not where the pins stood."
        },
        {
          id: "inq-gallery-niche",
          title: "What was in the niche of the gallery?",
          category: "Tower III",
          group: "stage",
          answer: "The niche at the west pin opens to a tune of six bells, played from its last note to its first: the gallery is a mirror for sound, and a mirror gives everything back in reverse. The Ashes played it note for note, the right way round, and it stayed shut for them. Inside, on grey velvet, lay Fragment III, with an arch and the edge of a balcony in it, and inside its little door Aurelia had scratched a line for your Ledger: [J] × 2 = [T]."
        }
      ];
      window.FIELD_INQUIRIES = FIELD_INQUIRIES;

      if (typeof syncSilviaWaypointBaseline === 'function') syncSilviaWaypointBaseline();
      let wireCurrentStep = 0;
      let wireHistory = [];
      try {
        const savedStep = localStorage.getItem('order_field_wire_step');
        if (savedStep !== null) wireCurrentStep = parseInt(savedStep, 10);
        const savedHistory = localStorage.getItem('order_field_wire_choices');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) wireHistory = parsed;
        }
      } catch (e) {}

      const isChasmDoneForWire = localStorage.getItem('order_whispering_chasm_completed') === 'true';
      const isLexiconDoneForWire = localStorage.getItem('order_desert_lexicon_completed') === 'true';
      const isClepsydraDoneForWire = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';
      const isPlayaDoneForWire = localStorage.getItem('order_salt_playa_completed') === 'true';

      if (isClepsydraDoneForWire) {
        if (wireCurrentStep < 8) wireCurrentStep = 8;
      } else if (isLexiconDoneForWire) {
        if (wireCurrentStep < 6) wireCurrentStep = 6;
      } else if (isChasmDoneForWire && isPlayaDoneForWire) {
        if (wireCurrentStep > 4) wireCurrentStep = 4;   // the south shore, the walk to the ruins and the call at dusk are all step 4
      } else if (isChasmDoneForWire) {
        if (wireCurrentStep > 4) wireCurrentStep = 4;
      } else {
        if (wireCurrentStep > 4) wireCurrentStep = 4;
      }
      const WIRE_LAST_STEP = 44;   // the last step of the expedition thread (end of Station 22, the Whispering Gallery)
      if (wireCurrentStep > WIRE_LAST_STEP) wireCurrentStep = WIRE_LAST_STEP;
      while (wireHistory.length < wireCurrentStep) {
        wireHistory.push(0);
      }

      // Dawn segment progress (see DAWN_THREAD). A save that already cleared the Chasm counts as dawn done, with the Cairn I seal.
      let dawnStep = 0;
      let dawnHistory = [];
      try {
        const savedDawn = localStorage.getItem('order_dawn_step');
        if (savedDawn !== null) dawnStep = Math.max(0, Math.min(DAWN_DONE, parseInt(savedDawn, 10) || 0));
        const savedDawnChoices = localStorage.getItem('order_dawn_choices');
        if (savedDawnChoices) {
          const parsedDawn = JSON.parse(savedDawnChoices);
          if (Array.isArray(parsedDawn)) dawnHistory = parsedDawn;
        }
        const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
        if (localStorage.getItem('order_cairn1_completed') === 'true' || isBypassed) dawnStep = DAWN_DONE;
        if (savedDawn === null && (isChasmDoneForWire || wireCurrentStep >= 5)) {
          dawnStep = DAWN_DONE;
          if (!isBypassed && localStorage.getItem('order_cairn1_completed') !== 'true') {
            localStorage.setItem('order_cairn1_completed', 'true');
            localStorage.setItem('order_seal_cairn_1', 'true');
          }
        }
        localStorage.setItem('order_dawn_step', String(dawnStep));
        if (dawnStep >= 2 && !isBypassed) localStorage.setItem('order_cairn1_found', 'true');
      } catch (e) {}

      // Persistent Read Inquiries Tracking
      let readInquiriesSet = new Set();
      try {
        const savedInq = localStorage.getItem('order_field_inquiries_read');
        if (savedInq) {
          const arr = JSON.parse(savedInq);
          if (Array.isArray(arr)) readInquiriesSet = new Set(arr);
        }
      } catch (e) {}

      let currentInquiryFilter = 'all';
      let currentInquirySearch = '';

      // Questions whose answers reveal puzzle results unlock when the matching station is complete; the "…Hint"
      // keys are set by the hint ladder (hub/js/hint-ladder.js) at its second note: 6 misses or 20 minutes stuck
      const INQUIRY_UNLOCKS = {
        chasm: { key: 'order_whispering_chasm_completed', label: 'Station 10' },
        playa: { key: 'order_salt_playa_completed', label: 'Station 11' },
        lexicon: { key: 'order_desert_lexicon_completed', label: 'Station 12' },
        clepsydra: { key: 'order_oasis_clepsydra_completed', label: 'Station 13' },
        cairn1found: { key: 'order_cairn1_found', label: 'finding Cairn I' },
        cairn1: { key: 'order_cairn1_completed', label: 'the Cairn I seal' },
        monolithHint: { key: 'order_monolith_hint', label: 'the second hint at the sigil of Cairn II' },
        monolithAwake: { key: 'order_sun_monolith_awake', label: 'waking the Sun Monolith' },
        monolith: { key: 'order_sun_monolith_completed', label: 'Station 14' },
        labyrinthHint: { key: 'order_labyrinth_hint', label: 'the second hint at the sigil of Cairn III' },
        labyrinthTorches: { key: 'order_labyrinth_torch_hint', label: 'the second hint at the torches of the labyrinth' },
        labyrinth: { key: 'order_sandstone_labyrinth_completed', label: 'Station 15' },
        cairn4Hint: { key: 'order_cairn4_hint', label: 'the second hint at the sigil of Cairn IV' },
        cairn4Count: { key: 'order_cairn4_count_hint', label: 'the second hint at the song of Cairn IV' },
        cairn4: { key: 'order_cairn_iv_completed', label: 'Station 16' },
        cairn5Hint: { key: 'order_cairn5_hint', label: 'the second hint at the sigil of Cairn V' },
        cairn5Dawn: { key: 'order_cairn5_dawn_hint', label: 'the second hint at the autumn dawn' },
        cairn5Signal: { key: 'order_cairn5_signal_hint', label: 'the second hint at the night signal' },
        cairn5: { key: 'order_arch_solstice_completed', label: 'Station 17' },
        steleHint: { key: 'order_stele_hint', label: 'the second hint at the proverb of the stele' },
        steleKnocks: { key: 'order_stele_knock_hint', label: 'the second hint at the knocks of the Servant' },
        steleFire: { key: 'order_stele_fire_hint', label: 'the second hint at the burning atrium' },
        stele: { key: 'order_polybius_stele_completed', label: 'Station 18' },
        oracleHint: { key: 'order_oracle_hint', label: 'the second hint at the sigil of the Oracle' },
        oracleDisc: { key: 'order_oracle_disc_hint', label: 'the second hint at the disc' },
        oracleVow: { key: 'order_oracle_vow_hint', label: 'the second hint at the vow' },
        oracle: { key: 'order_oracle_horizon_completed', label: 'Station 19' },
        masksHint: { key: 'order_masks_hint', label: 'the second hint at the word of the gate' },
        masksDraw: { key: 'order_masks_draw_hint', label: 'the second hint at the missing halves' },
        masks: { key: 'order_masks_gate_completed', label: 'Station 20' },
        camera: { key: 'order_camera_obscura_completed', label: 'Station 21' },
        gallery: { key: 'order_whispering_gallery_completed', label: 'Station 22' }
      };
      const INQUIRY_REQUIREMENTS = {
        'inq-desert-oracle': 'lexicon',
        'inq-chasm': 'cairn1',
        'inq-salt-playa': 'chasm',
        'inq-bc-ashes': 'lexicon',
        'inq-oasis-steles': 'lexicon',
        'inq-al-qibla': 'lexicon',
        'inq-phoenix-sigil': 'lexicon',
        'inq-four-wells': 'lexicon',
        'inq-shadow-hours': 'clepsydra',
        'inq-falcon-weir': 'clepsydra',
        'inq-cairns': 'cairn1',
        'inq-stacking-rule': 'cairn1found',
        'inq-seal-one': 'cairn1',
        'inq-river-hunch': 'cairn1',
        'inq-monolith-shadows': 'monolithHint',
        'inq-walking-sun': 'monolithAwake',
        'inq-cairn2-niche': 'monolith',
        'inq-labyrinth-arches': 'labyrinthHint',
        'inq-torch-rounds': 'labyrinthTorches',
        'inq-cairn3-plate': 'labyrinth',
        'inq-seven-echoes': 'cairn4Hint',
        'inq-count-echo': 'cairn4Count',
        'inq-tuning-pebble': 'cairn4',
        'inq-midsummer-ray': 'cairn5Hint',
        'inq-autumn-dawn': 'cairn5Dawn',
        'inq-light-code': 'cairn5Signal',
        'inq-light-on-tower': 'cairn5',
        'inq-stele-stanzas': 'steleHint',
        'inq-stele-knocks': 'steleKnocks',
        'inq-burning-atrium': 'steleFire',
        'inq-servant-well': 'stele',
        'inq-oracle-mirrors': 'oracleHint',
        'inq-oracle-disc': 'oracleDisc',
        'inq-oracle-vow': 'oracleVow',
        'inq-oracle-aurelia': 'oracle',
        'inq-unsent-letter': 'oracle',
        'inq-masks-lie': 'masksHint',
        'inq-masks-halves': 'masksDraw',
        'inq-ash-note': 'masks',
        'inq-camera-upside': 'masks',
        'inq-camera-house': 'camera',
        'inq-gallery-pins': 'camera',
        'inq-gallery-niche': 'gallery'
      };
      FIELD_INQUIRIES.forEach((inq) => { if (INQUIRY_REQUIREMENTS[inq.id]) inq.requires = INQUIRY_REQUIREMENTS[inq.id]; });
      const INQUIRY_GROUPS = [
        { id: 'all', label: 'All Questions' },
        { id: 'desert', label: 'The Desert' },
        { id: 'stage', label: 'The Stage' },
        { id: 'constellation', label: 'The Constellation' },
        { id: 'astrolabe', label: 'The Astrolabe' },
        { id: 'workshop', label: 'The Workshop' }
      ];
      // «Previously on…» (hub/js/previously.js) leads the list; Hermes's notes from the hint ladder
      // (hub/js/hint-ladder.js) join it once the first is unlocked
      function allInquiries() {
        return (window.EclipsePreviously ? [window.EclipsePreviously.inquiry()] : [])
          .concat(FIELD_INQUIRIES, window.EclipseHints ? window.EclipseHints.inquiries() : []);
      }
      function isInquiryUnlocked(inq) {
        if (typeof inq.unlocked === 'function') return inq.unlocked();
        if (!inq.requires) return true;
        const rule = INQUIRY_UNLOCKS[inq.requires];
        if (!rule) return true;
        return localStorage.getItem(rule.key) === 'true';
      }

      // Physical Journal Callout Highlight Helper: Natural Illuminated Citation
      function formatJournalCallouts(text) {
        if (!text) return '';
        return text.replace(/\bSheet\s+([0-9]+[A-Za-z]?)\b/gi, (match, sheet) => {
          const key = sheet.toUpperCase();
          return `<span class="journal-ref-pill" role="button" tabindex="0" data-sheet="${key}" aria-haspopup="dialog" title="Open details for Sheet ${key}"><span class="pill-icon">📖</span> Sheet ${key}</span>`;
        }).replace(/“([^”<]+)”/g, (match, title) => {
          // A page named by its printed title, “The Whispering Chasm”, opens the same card
          const key = Object.keys(JOURNAL_SHEETS).find((k) => JOURNAL_SHEETS[k].title === title);
          return key ? `<span class="journal-ref-pill" role="button" tabindex="0" data-sheet="${key}" aria-haspopup="dialog" title="Open details for the page ${title}"><span class="pill-icon">📖</span> ${title}</span>` : match;
        });
      }

      // Journal sheet cards: what each sheet is for, with a preview and a shortcut to its station
      const JOURNAL_SHEETS = {
        '4': { title: 'The Planisphere', note: 'The circle of star words. Find the sixteen celestial guides hidden in it.', thumb: './assets/thumbnails/planisphere_preview.webp', path: 'constellation', node: 6, nodeLabel: 'Station 06 · The Celestial Matrix' },
        '5': { title: 'The Zodiacal Engine', note: 'The crossword whose words open the console of the underground outpost.', thumb: './assets/thumbnails/zodiac_journal_preview.webp', path: 'constellation', node: 7, nodeLabel: 'Station 07 · The Zodiacal Engine' },
        '6': { title: 'Midnight Calibration & Transit', note: 'Calibrate the star heights, then trace the six chords of distant light.', thumb: './assets/thumbnails/midnight_calibration_preview.webp', path: 'constellation', node: 8, nodeLabel: 'Station 08 · Midnight Calibration' },
        '6A': { title: 'The Midnight Calibration', note: 'Calibrate the heights of the guide stars against the astrolabe rig at true midnight.', thumb: './assets/thumbnails/midnight_calibration_preview.webp', path: 'constellation', node: 8, nodeLabel: 'Station 08 · Midnight Calibration' },
        '6B': { title: 'The Midnight Transit', note: 'Trace the six chords of distant light across the shifted skies.', thumb: './assets/thumbnails/midnight_calibration_preview.webp', path: 'constellation', node: 8, nodeLabel: 'Station 08 · Midnight Calibration' },
        '7': { title: 'The Celestial Cipher', note: 'The coordinate dial that hides the old vow of the Order.', path: 'constellation', node: 9, nodeLabel: 'Station 09 · The Celestial Cipher' },
        '7A': { title: 'The Celestial Cipher', note: 'The coordinate dial that hides the old vow of the Order.', path: 'constellation', node: 9, nodeLabel: 'Station 09 · The Celestial Cipher' },
        '7B': { title: 'Field Log: The Desert Frontier', note: "Hermes's survey notes from 1998: the Three Cairns along the canyon wash, the copper benchmark plate beneath Cairn III, and the 112° E bearing to Outer Watchtower VI." },
        '8A': { title: 'The Desert', note: 'Sun, silence and buried stone. The Three Laws of the Waste: the Meridian Shadow, the Dry Wash and the Benchmark Plate.' },
        '8B': { title: 'Grand Desert Map · North-West', note: 'The first quarter of the Grand Desert Map.', thumb: './assets/maps/desert_quadrant_1_nw.webp', path: 'desert', mapOnly: true, nodeLabel: 'Open the Grand Desert Map' },
        '9A': { title: 'Grand Desert Map · North-East', note: 'The second quarter of the Grand Desert Map.', thumb: './assets/maps/desert_quadrant_2_ne.webp', path: 'desert', mapOnly: true, nodeLabel: 'Open the Grand Desert Map' },
        '9B': { title: 'The Whispering Chasm', note: 'The 25×25 canyon labyrinth and the Law of the Canyon Walkers.', thumb: './assets/thumbnails/whispering_chasm_preview.webp', path: 'desert', node: 10, nodeLabel: 'Station 10 · The Whispering Chasm' },
        '10A': { title: 'The Salt Playa (Dry Basin)', note: 'A 7×7 field of salt slabs. Read the facets and the letters along a safe path.', thumb: './assets/thumbnails/salt_playa_preview.webp', path: 'desert', node: 21, nodeLabel: 'Station 11 · The Salt Playa' },
        '10B': { title: 'Study on the Dry Salt Playa', note: 'The Architect\'s study of the salt: the signs of brine, ridges and sinkholes that form unseen, Fig. I of the crust, and the warning to walk with measured footsteps.', thumb: './assets/thumbnails/salt_playa_preview.webp', path: 'desert', node: 21, nodeLabel: 'Station 11 · The Salt Playa' },
        '11A': { title: 'The Desert Lexicon & Al-Qibla', note: 'The nomad crossword and the sun compass.', thumb: './assets/thumbnails/desert_lexicon_preview.webp', path: 'desert', node: 11, nodeLabel: 'Station 12 · The Desert Lexicon' },
        '11B': { title: 'Grand Desert Map · South-West', note: 'The third quarter of the Grand Desert Map.', thumb: './assets/maps/desert_quadrant_3_sw.webp', path: 'desert', mapOnly: true, nodeLabel: 'Open the Grand Desert Map' },
        '12A': { title: 'Grand Desert Map · South-East', note: 'The fourth quarter of the Grand Desert Map.', thumb: './assets/maps/desert_quadrant_4_se.webp', path: 'desert', mapOnly: true, nodeLabel: 'Open the Grand Desert Map' },
        '12B': { title: 'The Oasis Clepsydra', note: 'The logic grid of the four seekers at the Four Wells.', thumb: './assets/thumbnails/oasis_clepsydra_preview.webp', path: 'desert', node: 12, nodeLabel: 'Station 13 · The Oasis Clepsydra' },
        '13A': { title: 'At the Gates of Tower II', note: 'The Sandstone Sanctuary, its Servant, and the demand of the five seals. The great circuit begins north-north-east.' },
        '13B': { title: 'The Sun Monolith & Cairn II', note: 'Seven noons, seven shadows, seven rings of the dial: the sigil of Cairn II.', thumb: './assets/thumbnails/sun_monolith_preview.webp', path: 'desert', node: 23, nodeLabel: 'Station 14 · The Sun Monolith' },
        '14A': { title: 'The Five Geodetic Cairns', note: 'The markers of the Order, the words of the Servant, and the survey of Cairn III: 112° to Watchtower VI, 348° to the Sun Monolith.' },
        '16A': { title: 'The Eastern Buttress & Lower Wash', note: 'The right half of the Natural Bridge zoom: the eastern pier, the switchbacks and the boulders of the 1971 quake.' },
        '16B': { title: 'Arch of the Solstice & The Solar Altar', note: 'The midsummer ray, the Courtyard of Rays and its eight sun-stones: the sigil of Cairn V.', thumb: './assets/thumbnails/solstice_arch_preview.webp', path: 'desert', node: 26, nodeLabel: 'Station 17 · The Arch of the Solstice' },
        '15A': { title: 'Cairn IV: Sentry of the Canyon', note: 'Two singing pillars, three laws of the echo and the survey log of seven echoes: the sigil of the Sentry.', thumb: './assets/thumbnails/cairn_iv_preview.webp', path: 'desert', node: 25, nodeLabel: 'Station 16 · Cairn IV' },
        '15B': { title: 'The Natural Bridge of the Sentinel Mesa', note: 'The stone span, the old cart track and the switchbacks too tight for a loaded wagon (continues on the page “The Eastern Buttress & Lower Wash”).' },
        '14B': { title: 'The Sandstone Labyrinth & Cairn III', note: 'One true road from the Southern Mouth to the cairn, and eight arches upon it: the sigil of Cairn III.', thumb: './assets/thumbnails/sandstone_labyrinth_preview.webp', path: 'desert', node: 24, nodeLabel: 'Station 15 · The Sandstone Labyrinth' },
        '18A': { title: "The Oracle's Horizon", note: 'Eight beacons sent east across the three mirrors of the horizon: the sigil of the Oracle, and the first truth.', thumb: './assets/thumbnails/oracle_horizon_preview.webp', path: 'desert', node: 14, nodeLabel: "Station 19 · The Oracle's Horizon" },
        '18B': { title: 'From the Desert to the Stage', note: 'Curtains, columns and the floor of a stage: the passage to the third tower.' },
        '17A': { title: 'The Polybius Stele', note: "The Servant's trial: the founders' 5 × 5 grid, keyed with PHOENIX, and six stanzas carved in the atrium of Tower II.", thumb: './assets/thumbnails/polybius_stele_preview.webp', path: 'desert', node: 13, nodeLabel: 'Station 18 · The Polybius Stele' },
        '17B': { title: 'The Desert Oracle', note: 'An audience with the Oracle of Tower II, and the Servant Hermes once watched from a ridge in 1998.' },
        '19A': { title: 'The Unsent Letter', note: 'A letter written backwards and never sent. Read it in a mirror.' },
        '19B': { title: 'The Gate of a Thousand Masks', note: 'A thousand faces guard the theatre of the Order, and six of them lie.', path: 'stage', node: 40, nodeLabel: 'Station 20 · The Gate of a Thousand Masks' },
        '20A': { title: 'The Camera Obscura', note: 'A dark room where the whole city appears upside down on the wall.', path: 'stage', node: 41, nodeLabel: 'Station 21 · The Camera Obscura' },
        '20B': { title: 'The Whispering Gallery', note: 'A gallery where a whisper at one end is heard at the other.', path: 'stage', node: 42, nodeLabel: 'Station 22 · The Whispering Gallery' },
        '21B': { title: 'The Automaton Orchestra', note: 'A brass orchestra that plays only what its cylinder remembers.', path: 'stage', node: 43, nodeLabel: 'Station 23 · The Automaton Orchestra' }
      };
      let sheetPopover = null;
      let sheetPopoverAnchor = null;

      function closeSheetPopover() {
        if (sheetPopover) sheetPopover.remove();
        sheetPopover = null;
        sheetPopoverAnchor = null;
      }

      function openSheetPopover(pill) {
        closeSheetPopover();
        const key = pill.getAttribute('data-sheet') || '';
        const info = JOURNAL_SHEETS[key] || JOURNAL_SHEETS[key.replace(/[A-Z]$/, '')] || null;
        const el = document.createElement('div');
        el.className = 'journal-sheet-popover';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', info ? info.title : 'Your physical journal');
        el.innerHTML = `
          <button type="button" class="jsp-close" aria-label="Close">✕</button>
          <div class="jsp-kicker">📖 Your physical journal</div>
          <div class="jsp-title">${info ? info.title : 'Your physical journal'}</div>
          ${info && info.thumb ? `<img class="jsp-thumb" src="${info.thumb}" alt="Preview of the page ${info.title}" loading="lazy">` : ''}
          <div class="jsp-note">${info ? info.note : 'Open your physical journal.'}</div>
          ${info && info.nodeLabel ? `<button type="button" class="jsp-go">🗺️ ${info.nodeLabel} ➔</button>` : ''}
        `;
        document.body.appendChild(el);

        const r = pill.getBoundingClientRect();
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
        let top = r.bottom + 10;
        if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 10);
        el.style.left = left + 'px';
        el.style.top = top + 'px';

        el.querySelector('.jsp-close').addEventListener('click', closeSheetPopover);
        const go = el.querySelector('.jsp-go');
        if (go && info) {
          go.addEventListener('click', () => {
            closeSheetPopover();
            if (typeof window.switchMapPath === 'function') window.switchMapPath(info.path, false);
            if (!info.mapOnly && typeof window.selectMapNode === 'function') {
              window.selectMapNode(info.node, true);
            } else if (typeof window.activateHubView === 'function') {
              window.activateHubView('view-trail');
            }
          });
        }
        sheetPopover = el;
        sheetPopoverAnchor = pill;
      }

      // Capture phase: a sheet pill inside a reply button must open its card, not send the reply
      document.addEventListener('click', (e) => {
        const pill = e.target.closest ? e.target.closest('.journal-ref-pill') : null;
        if (pill) {
          e.preventDefault();
          e.stopPropagation();
          if (sheetPopoverAnchor === pill) closeSheetPopover();
          else openSheetPopover(pill);
          return;
        }
        if (sheetPopover && !e.target.closest('.journal-sheet-popover')) closeSheetPopover();
      }, true);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSheetPopover();
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('journal-ref-pill')) {
          e.preventDefault();
          e.stopPropagation();
          if (sheetPopoverAnchor === e.target) closeSheetPopover();
          else openSheetPopover(e.target);
        }
      }, true);
      window.addEventListener('scroll', closeSheetPopover, { passive: true });

      // Notification Badge System
      function getMessengerUnreadCount() {
        const customUnread = localStorage.getItem('order_messenger_unread_count');
        if (customUnread !== null) {
          return parseInt(customUnread, 10) || 0;
        }
        const lastRead = localStorage.getItem('order_messenger_last_read_step');
        if (lastRead === null) {
          return 1; // 1 initial incoming transmission from Hermes
        }
        const lastReadStep = parseInt(lastRead, 10);
        return Math.max(0, wireCurrentStep - lastReadStep);
      }

      function updateMessengerBadge() {
        const badge = document.getElementById('messenger-counter-badge');
        if (!badge) return;
        const currentView = document.body.getAttribute('data-active-view');
        if (currentView === 'view-field-wire') {
          markMessengerAsRead();
          return;
        }
        const count = getMessengerUnreadCount();
        if (count > 0) {
          badge.textContent = count > 9 ? '9+' : count.toString();
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }

      function markMessengerAsRead() {
        try {
          localStorage.removeItem('order_messenger_unread_count');
          localStorage.setItem('order_messenger_last_read_step', wireCurrentStep.toString());
        } catch (e) {}
        const badge = document.getElementById('messenger-counter-badge');
        if (badge) {
          badge.style.display = 'none';
          badge.textContent = '0';
        }
      }

      function setMessengerUnreadCount(count) {
        try {
          if (count <= 0) {
            markMessengerAsRead();
          } else {
            localStorage.setItem('order_messenger_unread_count', count.toString());
          }
        } catch(e) {}
        updateMessengerBadge();
      }

      // Expose helpers globally
      window.setMessengerUnread = setMessengerUnreadCount;
      window.markMessengerAsRead = markMessengerAsRead;
      window.updateMessengerBadge = updateMessengerBadge;

      const messengerTypingBar = document.getElementById('messenger-typing-bar');

      function getWireTimestamp(offsetMinutes = 0) {
        const d = new Date(Date.now() - offsetMinutes * 60000);
        // CEST until 25 Oct 2026, CET after: ask the browser instead of hard-coding it
        let zone = 'CEST';
        try {
          const part = new Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' }).formatToParts(d).find(x => x.type === 'timeZoneName');
          if (part && /^[A-Z]{3,4}$/.test(part.value)) zone = part.value;
        } catch (e) {}
        return d.toTimeString().slice(0, 5) + ' ' + zone;
      }

      function updateHeaderContactName(title) {
        const wrap = document.getElementById('messenger-contact-name-wrap');
        const textEl = document.getElementById('messenger-contact-name');
        const chosen = WIRE_CONTACT_NAME;
        if (!wrap || !textEl) return;
        if (chosen) {
          textEl.textContent = chosen;
          if (chosen.length > 18 || chosen.includes('Distant Light')) {
            textEl.classList.add('long-title');
          } else {
            textEl.classList.remove('long-title');
          }
          wrap.style.display = 'inline-flex';
          const avatar = document.querySelector('.workshop-avatar');
          if (avatar) avatar.setAttribute('title', chosen);
        } else {
          textEl.textContent = '';
          textEl.classList.remove('long-title');
          wrap.style.display = 'none';
        }
      }

      // Canon (Desert Path): Silvia named him Hermes. Fixed forever in the wire chat.
      const WIRE_CONTACT_NAME = 'Hermes';
      function getCartographerTitle() {
        return WIRE_CONTACT_NAME;
      }
      function setCartographerTitle(title) {
        if (!title) return;
        title = WIRE_CONTACT_NAME;
        try { localStorage.setItem('order_cartographer_title', title); } catch(e) {}
        document.querySelectorAll('.chat-bubble-wrap.incoming:not(.chat-typing-wrap) .chat-sender-name').forEach(el => {
          el.textContent = title;
        });
        updateHeaderContactName(title);
      }

      // =========================================================================
      // 🎒 SATCHEL & EXPEDITION RELICS CATALOG & INVENTORY
      // =========================================================================
      const SATCHEL_RELICS = {
        gilded_feather: {
          id: "gilded_feather",
          name: "The Messenger's Gilded Feather",
          category: "Order Relic",
          image: "assets/items/item_gilded_feather.png",
          origin: "Sent with the Physical Journal to Italy · Sep 2026",
          summary: "A vivid royal violet pigeon feather dipped in metallic gold leaf.",
          lore: "Carried across the sea by the Order's last carrier pigeon when Hermes dispatched the recovery protocols and the physical journal to Silvia. Its gilded tip was dipped in the sacred gold leaf of the Alpine Observatory before the flight."
        },
        order_wax_seal: {
          id: "order_wax_seal",
          name: "Scarlet Wax Seal of The Order",
          category: "Sacred Token",
          image: "assets/items/item_order_wax_seal.png",
          origin: "Journal Package Binding Seal · Sep 2026",
          summary: "Deep crimson wax medallion stamped with the solar eclipse insignia.",
          lore: "The official seal that bound the oilskin wrappings of the 18-sheet manuscript. It bears the radiant sunburst, the moon's shadow, and the outer degree ring of the Astrolabe."
        },
        flint_tinder: {
          id: "flint_tinder",
          name: "Ancient Flint & Juniper Tinder",
          category: "Expedition Tool",
          image: "assets/items/item_flint_tinder.png",
          origin: "Canyon Wash Bed · Survey of 1998",
          summary: "A hand-forged steel striker, dark flint stone and fragrant dry juniper root.",
          lore: "Left in an oilskin pouch under a riverbed boulder during Hermes's 1998 expedition. The dry juniper wood and sparking flint provided the warm fire that keeps Hermes alive inside Outer Watchtower VI."
        },
        surveyor_compass: {
          id: "surveyor_compass",
          name: "1998 Brass Surveyor's Compass",
          category: "Survey Instrument",
          image: "assets/items/item_brass_compass.png",
          origin: "Watchtower VI Trail · Wash Survey of 1998",
          summary: "A heavy brass pocket compass engraved with celestial degree coordinates.",
          lore: "Hermes's precision field compass from twenty-eight years ago, left in a dry stone niche beside the second copper benchmark he set at the foot of the watchtower trail (the first lies under Cairn III, far down the wash). Set to the 112° E bearing stamped on that plate, it guided Hermes through the blinding sandstorm up the ridge to Outer Watchtower VI. Its balanced blued-steel needle still responds with absolute fidelity to the desert's magnetic meridians."
        },
        spyglass_lens: {
          id: "spyglass_lens",
          name: "Scorched Spyglass Lens",
          category: "Raider Artifact",
          image: "assets/items/item_spyglass_lens.png",
          origin: "Northern Bluff Shelf · Dropped by Raiders",
          summary: "A convex tempered optical lens set in a charred brass ring, etched with ash sigils.",
          lore: "Dropped on the bluff edge by the raiders' scouts while surveying the gorge. The optical curvature of the glass is ground specifically to calculate the path of the Grand Eclipse."
        },
        tuning_pebble: {
          id: "tuning_pebble",
          name: "The Tuning Pebble · Cairn IV",
          category: "Mysterious Token",
          image: "assets/items/item_tuning_pebble.webp",
          origin: "Throat of the Left Pillar · Cairn IV · Oct 2026",
          summary: "A smooth river pebble with a small gold star painted on a ground of lapis blue.",
          lore: "Wedged in the throat of the Left pillar of Cairn IV, where it turns the night wind into three short calls and two long ones: the code Hermes engraved on Aurelia's brass disc. The founders' bronze reeds are ancient. The pebble is not."
        },
        signal_mirror: {
          id: "signal_mirror",
          name: "The Signal Mirror · Cairn V",
          category: "Order Relic",
          image: "assets/items/item_signal_mirror.webp",
          origin: "Courtyard of Rays · Arch of the Solstice · Oct 2026",
          summary: "A small bronze hand mirror with a sun-ray rim and an eclipse engraved at the top.",
          lore: "One of the founders' bronze mirrors, worked loose from its post in the Courtyard of Rays. With it Hermes answered the light on Tower II in the code he made for Aurelia, and the light answered back."
        },
        gilded_star: {
          id: "gilded_star",
          name: "The Gilded Star · Tower II",
          category: "Gift of the Oracle",
          image: "assets/items/item_gilded_star.webp",
          origin: "The Inner Chamber · Tower II · Oct 2026",
          summary: "An eight-pointed star of gold leaf on a small card of lapis blue.",
          lore: "Painted by Aurelia while Hermes told her about the journey, with a squirrel-hair brush and her breath held so the gold would not fly away: a ground of lapis, then the gold, then a touch of white at the tip of every point. 'For the navigator who brought him back.'"
        },
        servant_key: {
          id: "servant_key",
          name: "The Servant's Key · Tower II",
          category: "Order Relic",
          image: "assets/items/item_servant_key.webp",
          origin: "The Well of the Atrium · Tower II · Oct 2026",
          summary: "A heavy bronze key whose bow holds the founders' grid: five squares by five.",
          lore: "The Servant pressed it into Hermes's hand on the rim of the well, still warm from the fire. It opens the inner stair of Tower II, the way down to the Oracle, and its bow is cut in the shape of the grid of the stele, as if the door itself could only be opened by someone who reads it."
        },
        seal_cairn_1: {
          id: "seal_cairn_1",
          name: "Wash River Seal · Cairn I",
          category: "Sacred Seal",
          image: "assets/chat/sketch_cairn_one.webp",
          origin: "Wadi al-Hajar · Under Foundation of Cairn I",
          summary: "A flat sandstone disc carved with the radiant sun above a wavy water line.",
          lore: "Discovered inside the hollow bedrock beneath the third foundation of Cairn I after solving the ancient river stone trial. Its purpose is still unknown."
        }
      };

      function getSatchelExpeditionItem() {
        try {
          const raw = localStorage.getItem('order_satchel_expedition_item');
          if (raw) return JSON.parse(raw);
        } catch(e) {}
        return {
          id: "surveyor_compass",
          name: "1998 Brass Surveyor's Compass",
          icon: "🧭",
          desc: "Precision surveyor compass left in 1998 beside the copper benchmark at the foot of the Watchtower VI trail."
        };
      }

      function setSatchelExpeditionItem(item) {
        if (!item) return;
        try {
          localStorage.setItem('order_satchel_expedition_item', JSON.stringify(item));
        } catch(e) {}
        addRelicToInventory(item.id);
        if (typeof window.renderSatchel === 'function') window.renderSatchel(0);
        if (typeof window.updateSatchelVisibility === 'function') window.updateSatchelVisibility();
      }
      window.getSatchelExpeditionItem = getSatchelExpeditionItem;
      window.setSatchelExpeditionItem = setSatchelExpeditionItem;

      function getOwnedRelicIds() {
        let list = ['gilded_feather', 'order_wax_seal', 'surveyor_compass'];
        try {
          const raw = localStorage.getItem('order_inventory_relics');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach(id => { if (!list.includes(id)) list.push(id); });
            }
          }
        } catch(e) {}
        const expItem = getSatchelExpeditionItem();
        if (expItem && expItem.id && !list.includes(expItem.id)) {
          list.push(expItem.id);
        }
        if (!list.includes('surveyor_compass')) {
          list.push('surveyor_compass');
        }
        if (localStorage.getItem('order_seal_cairn_1') === 'true' || localStorage.getItem('order_cairn1_completed') === 'true') {
          if (!list.includes('seal_cairn_1')) list.push('seal_cairn_1');
        }
        if (localStorage.getItem('order_cairn_iv_completed') === 'true' && !list.includes('tuning_pebble')) list.push('tuning_pebble');
        if (localStorage.getItem('order_arch_solstice_completed') === 'true' && !list.includes('signal_mirror')) list.push('signal_mirror');
        if (localStorage.getItem('order_polybius_stele_completed') === 'true' && !list.includes('servant_key')) list.push('servant_key');
        if (localStorage.getItem('order_oracle_horizon_completed') === 'true' && !list.includes('gilded_star')) list.push('gilded_star');
        return list;
      }

      function addRelicToInventory(relicId) {
        if (!relicId) return;
        const list = getOwnedRelicIds();
        if (!list.includes(relicId)) {
          list.push(relicId);
          try {
            localStorage.setItem('order_inventory_relics', JSON.stringify(list));
          } catch(e) {}
        }
        updateInventoryBadge();
      }

      function updateInventoryBadge() {
        const badge = document.getElementById('bsi-badge');
        if (!badge) return;
        const list = getOwnedRelicIds();
        badge.textContent = list.length.toString();
      }

      let activeItemAcquiredCallback = null;

      function openItemAcquiredModal(item, onCollect) {
        const modal = document.getElementById('modal-item-acquired');
        if (!modal) return;
        activeItemAcquiredCallback = onCollect || null;

        const img = document.getElementById('iac-art-img');
        const cat = document.getElementById('iac-category');
        const title = document.getElementById('iac-title');
        const origin = document.getElementById('iac-origin');
        const lore = document.getElementById('iac-lore');

        const relic = SATCHEL_RELICS[item.id] || item;
        if (img) img.src = relic.image || ('assets/items/item_' + relic.id + '.jpg');
        if (cat) cat.textContent = relic.category || 'EXPEDITION ARTIFACT';
        if (title) title.textContent = relic.name;
        if (origin) origin.textContent = relic.origin || 'Wadi al-Hajar Frontier';
        if (lore) lore.textContent = relic.lore || relic.desc || '';

        modal.style.display = 'flex';
        if (sfx && sfx.playCelestialChime) sfx.playCelestialChime();
      }

      function closeItemAcquiredModal() {
        const modal = document.getElementById('modal-item-acquired');
        if (!modal) return;
        modal.style.display = 'none';
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        if (typeof activeItemAcquiredCallback === 'function') {
          const cb = activeItemAcquiredCallback;
          activeItemAcquiredCallback = null;
          cb();
        }
      }

      let selectedInventoryItemId = 'gilded_feather';

      function openSatchelInventoryModal(selectId) {
        const modal = document.getElementById('modal-satchel-inventory');
        if (!modal) return;
        if (selectId) selectedInventoryItemId = selectId;
        renderSatchelInventory();
        modal.style.display = 'flex';
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
      }

      function closeSatchelInventoryModal() {
        const modal = document.getElementById('modal-satchel-inventory');
        if (!modal) return;
        modal.style.display = 'none';
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
      }

      function inspectInventoryItem(id) {
        selectedInventoryItemId = id;
        const relic = SATCHEL_RELICS[id];
        if (!relic) return;

        const img = document.getElementById('si-inspect-img');
        const cat = document.getElementById('si-inspect-category');
        const title = document.getElementById('si-inspect-title');
        const origin = document.getElementById('si-inspect-origin');
        const desc = document.getElementById('si-inspect-desc');

        if (img) img.src = relic.image;
        if (cat) cat.textContent = relic.category;
        if (title) title.textContent = relic.name;
        if (origin) origin.textContent = relic.origin;
        if (desc) desc.textContent = relic.lore;

        document.querySelectorAll('.si-mc-slot').forEach(slot => {
          if (slot.dataset.id === id) slot.classList.add('active');
          else slot.classList.remove('active');
        });
      }

      function renderSatchelInventory() {
        const grid = document.getElementById('si-items-grid');
        const countPill = document.getElementById('si-count-pill');
        if (!grid) return;
        grid.innerHTML = '';

        const owned = getOwnedRelicIds();
        const TOTAL_SLOTS = 16;
        if (countPill) countPill.textContent = `${owned.length} / ${TOTAL_SLOTS} SLOTS`;

        if (!owned.includes(selectedInventoryItemId) && owned.length > 0) {
          selectedInventoryItemId = owned[0];
        }

        for (let i = 0; i < TOTAL_SLOTS; i++) {
          const slot = document.createElement('div');
          slot.className = 'si-mc-slot';

          if (i < owned.length) {
            const id = owned[i];
            const relic = SATCHEL_RELICS[id];
            if (relic) {
              slot.classList.add('is-filled');
              if (id === selectedInventoryItemId) slot.classList.add('active');
              slot.dataset.id = id;
              slot.title = `${relic.name} · ${relic.category}`;
              slot.setAttribute('aria-label', relic.name);
              slot.innerHTML = `
                <img src="${relic.image}" alt="${relic.name}" class="si-mc-thumb">
              `;
              slot.addEventListener('click', () => {
                if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
                inspectInventoryItem(id);
              });
            }
          } else {
            slot.classList.add('is-empty');
            slot.title = 'Empty Slot';
            slot.setAttribute('aria-label', 'Empty slot');
            slot.innerHTML = `<span class="si-mc-empty-mark"></span>`;
          }

          grid.appendChild(slot);
        }

        if (selectedInventoryItemId && SATCHEL_RELICS[selectedInventoryItemId]) {
          inspectInventoryItem(selectedInventoryItemId);
        }
      }

      window.openItemAcquiredModal = openItemAcquiredModal;
      window.closeItemAcquiredModal = closeItemAcquiredModal;
      window.openSatchelInventoryModal = openSatchelInventoryModal;
      window.closeSatchelInventoryModal = closeSatchelInventoryModal;
      window.addRelicToInventory = addRelicToInventory;
      window.getOwnedRelicIds = getOwnedRelicIds;
      window.updateInventoryBadge = updateInventoryBadge;

      function getHermesFinalForWatchtower() {
        const item = getSatchelExpeditionItem();
        let fireDetails = "I found dry cedar wood in the corner and lit a spark in the fireplace. The hearth is glowing warm, casting light across an old wooden table.";
        if (item) {
          if (item.id === 'flint_tinder') {
            fireDetails = "Using that dry juniper root and the 1998 flint we recovered from the canyon bed, I struck a spark in the fireplace. The hearth is roaring warm, filling the room with the fragrant scent of cedar and juniper smoke.";
          } else if (item.id === 'surveyor_compass') {
            fireDetails = "I found dry cedar wood in the corner and lit a spark in the fireplace. On the wooden table, I set down that brass surveyor's compass from 1998—its needle is humming with the ancient magnetic lines of the desert.";
          } else if (item.id === 'spyglass_lens') {
            fireDetails = "I found dry cedar wood in the corner and lit a spark in the fireplace. Under the glow of the flames, I examined the raider's scorched lens from the bluff—its optical curvature is ground specifically to track our stars!";
          }
        }
        return `Silvia... the door is barred shut! The wind is howling outside, but inside these thick stone walls, the air is completely calm.\n\n${fireDetails}\n\nWe did it, Silvia. We crossed the threshold into the desert together. The storm outside is tearing at the rock face, and neither traveler nor beast can move until it breaks. Rest now by the fire. When the sandstorm calms down, we will meet at dawn to survey Wadi al-Hajar.`;
      }

      function isStormOver() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test_storm_lock') === '1') return false;
        return true;
      }
      window.skipStormWait = function () {
        localStorage.setItem('order_storm_tester_bypassed', 'true');
        removeShelterStormWaitBox();
        beginDawnStep(Math.max(1, dawnStep));
      };

      let shelterTimerInterval = null;

      function renderShelterStormWaitBox() {
        removeShelterStormWaitBox();
        const box = document.createElement('div');
        box.className = 'shelter-storm-wait-box';
        box.id = 'shelter-storm-wait-box';
        const isTester = (typeof isCarlesTester === 'function' && isCarlesTester()) || (typeof window.isAdminTester === 'function' && window.isAdminTester());
        const adminBtnHtml = isTester
          ? `<div style="margin-top:14px; text-align:center;"><button type="button" id="btn-admin-skip-storm" style="padding:6px 14px; background:rgba(251,191,36,0.18); border:1px solid #fbbf24; border-radius:4px; color:#fde68a; font-family:'Cinzel',serif; font-size:0.7rem; letter-spacing:0.08em; cursor:pointer; text-transform:uppercase;">⚡ Carles Tester: Skip Storm Wait ➔</button></div>`
          : '';
        box.innerHTML = `
          <div class="ssw-header">
            <span class="ssw-icon">⏳</span>
            <span class="ssw-title">WATCHTOWER VI · THE GREAT SILENCE BEFORE THE DESERT</span>
          </div>
          <p class="ssw-desc">
            ${getCartographerTitle()} is safely sheltered inside Watchtower VI by the hearth fire while the remaining red sandstorm winds subside across the outer canyons. The open waste to Wadi al-Hajar is impassable until the gale clears completely.
          </p>
          <div class="ssw-timer-row">
            <span class="ssw-timer-label">STORM SUBSIDES IN:</span>
            <div class="ssw-countdown" id="shelter-storm-countdown">
              <span class="ssw-cd-segment"><strong id="ssw-cd-days">00</strong><small>d</small></span>
              <span class="ssw-cd-sep">:</span>
              <span class="ssw-cd-segment"><strong id="ssw-cd-hours">00</strong><small>h</small></span>
              <span class="ssw-cd-sep">:</span>
              <span class="ssw-cd-segment"><strong id="ssw-cd-mins">00</strong><small>m</small></span>
              <span class="ssw-cd-sep">:</span>
              <span class="ssw-cd-segment"><strong id="ssw-cd-secs">00</strong><small>s</small></span>
            </div>
          </div>
          <div class="ssw-subtext">Wadi al-Hajar & The Dry Riverbed unlock Sunday, October 18 at 14:00 CEST.</div>
          ${adminBtnHtml}
        `;
        const adminBtn = box.querySelector('#btn-admin-skip-storm');
        if (adminBtn) {
          adminBtn.addEventListener('click', () => {
            localStorage.setItem('order_storm_tester_bypassed', 'true');
            if (shelterTimerInterval) clearInterval(shelterTimerInterval);
            removeShelterStormWaitBox();
            beginDawnStep(Math.max(1, dawnStep));
          });
        }
        wireMessagesStream.appendChild(box);
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        function updateShelterCountdown() {
          const target = typeof window.getStormTargetTime === 'function' ? window.getStormTargetTime() : (window.SUNDAY_OCT_18_2026_2PM || 1792324800000);
          const diff = Math.max(0, target - Date.now());

          if (diff <= 0) {
            clearInterval(shelterTimerInterval);
            removeShelterStormWaitBox();
            if (sfx && typeof sfx.playCelestialChime === 'function') sfx.playCelestialChime();
            appendWireMessage('SYSTEM TELEMETRY', '✦ THE CATACLYSMIC SANDSTORM HAS SUBSIDED · WADI AL-HAJAR UNLOCKED ✦', true, false, null, null, { type: 'dawn', step: 1 });
            if (typeof window.SandstormLockdown === 'object' && window.SandstormLockdown.deactivate) {
              window.SandstormLockdown.deactivate();
            }
            beginDawnStep(Math.max(1, dawnStep));
            return;
          }

          const totalSecs = Math.floor(diff / 1000);
          const d = Math.floor(totalSecs / 86400);
          const h = Math.floor((totalSecs % 86400) / 3600);
          const m = Math.floor((totalSecs % 3600) / 60);
          const s = totalSecs % 60;

          const dEl = document.getElementById('ssw-cd-days');
          const hEl = document.getElementById('ssw-cd-hours');
          const mEl = document.getElementById('ssw-cd-mins');
          const sEl = document.getElementById('ssw-cd-secs');

          if (dEl) dEl.textContent = String(d).padStart(2, '0');
          if (hEl) hEl.textContent = String(h).padStart(2, '0');
          if (mEl) mEl.textContent = String(m).padStart(2, '0');
          if (sEl) sEl.textContent = String(s).padStart(2, '0');
        }

        updateShelterCountdown();
        if (shelterTimerInterval) clearInterval(shelterTimerInterval);
        shelterTimerInterval = setInterval(updateShelterCountdown, 1000);
      }

      function removeShelterStormWaitBox() {
        if (shelterTimerInterval) {
          clearInterval(shelterTimerInterval);
          shelterTimerInterval = null;
        }
        const existing = document.getElementById('shelter-storm-wait-box');
        if (existing) existing.remove();
      }

      // Typing indicator: a bubble inside the conversation, with a little telegraph key
      function showTyping(show = true) {
        document.querySelectorAll('.chat-typing-wrap').forEach((el) => el.remove());
        if (messengerTypingBar) messengerTypingBar.style.display = 'none';
        if (!show) return;
        const stream = currentWireTab === 'inquiries' ? wireInquiriesStream : wireMessagesStream;
        if (!stream) return;
        const wrap = document.createElement('div');
        wrap.className = 'chat-bubble-wrap incoming chat-typing-wrap';
        wrap.innerHTML = `
          <div class="chat-sender-name">${getCartographerTitle()}</div>
          <div class="chat-bubble">
            <span class="typing-key" aria-hidden="true">📟</span>
            <span class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>
            <span class="typing-label">operating the telegraph coils</span>
          </div>
        `;
        stream.appendChild(wrap);
        wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      function noteNewMessage() {}

      // Telegraph sounds on/off (remembered)
      const btnWireSound = document.getElementById('btn-wire-sound');
      function applyChatSoundState() {
        const on = !window.hubChatMuted;
        if (btnWireSound) {
          btnWireSound.setAttribute('aria-pressed', on ? 'true' : 'false');
          btnWireSound.setAttribute('title', on ? 'Telegraph sounds: on' : 'Telegraph sounds: off');
          const icon = btnWireSound.querySelector('span');
          if (icon) icon.textContent = on ? '🔊' : '🔇';
        }
      }
      try { window.hubChatMuted = localStorage.getItem('order_chat_sound') === 'off'; } catch (e) { window.hubChatMuted = false; }
      applyChatSoundState();
      if (btnWireSound) {
        btnWireSound.addEventListener('click', () => {
          window.hubChatMuted = !window.hubChatMuted;
          try { localStorage.setItem('order_chat_sound', window.hubChatMuted ? 'off' : 'on'); } catch (e) {}
          applyChatSoundState();
          if (!window.hubChatMuted && sfx) sfx.playMechanicalClick();
        });
      }

      // Divider between camps in the expedition thread
      function appendWireDivider(text) {
        if (!wireMessagesStream) return;
        const pill = document.createElement('div');
        pill.className = 'messenger-date-pill';
        pill.textContent = text;
        wireMessagesStream.appendChild(pill);
      }
      const WIRE_STEP_DIVIDERS = { 5: 'Camp VII · The Nomad Ruins', 7: 'Camp VIII · The Four Wells', 9: 'Tower II · The Gates', 11: 'The Ridge of the Sun · Cairn II', 13: 'The Arches of the West Wind', 15: 'The Sandstone Labyrinth · Cairn III', 17: 'The Edge of the Hardpan', 19: 'The Southern Mouth of the Gorge · Cairn IV', 21: 'Leaving the Singing Pillars', 23: 'The Arch of the Solstice · Cairn V', 25: 'Under the Arch · Smoke over Tower II', 27: 'Tower II · The Well of the Atrium', 29: 'Tower II · The Inner Stair', 31: 'Tower II · The Inner Chamber', 33: 'Tower II · The Morning of Departure', 35: 'Tower III · The Gate of a Thousand Masks', 37: 'Tower III · The Dark Room', 41: 'Tower III · The Whispering Gallery' };

      // Seals of the five Cairns in Hermes's satchel (order_seal_cairn_1..5)
      function countCairnSeals() {
        let n = 0;
        for (let i = 1; i <= 5; i++) if (localStorage.getItem('order_seal_cairn_' + i) === 'true') n++;
        return n;
      }
      // Did Hermes carry the Seal of Cairn I to the gates of Tower II? Saved when the gates scene first plays,
      // so the replayed chat never rewrites what he said there (Seals II–V are only won after the gates).
      const GATE_SEAL_KEY = 'order_monolith_gate_seal1';
      function rememberGateSeal() {
        if (localStorage.getItem(GATE_SEAL_KEY) === null) {
          try { localStorage.setItem(GATE_SEAL_KEY, String(localStorage.getItem('order_seal_cairn_1') === 'true')); } catch (e) {}
        }
      }
      function hadFirstSealAtGates() {
        const saved = localStorage.getItem(GATE_SEAL_KEY);
        return saved !== null ? saved === 'true' : localStorage.getItem('order_seal_cairn_1') === 'true';
      }
      const sealsAtGates = () => (hadFirstSealAtGates() ? 1 : 0);
      // Seals in the satchel when the light went out over Tower II (Cairn I may have been recovered by then).
      // Saved when the Station 17 debrief first plays, so its replays keep what Hermes said.
      const ALTAR_SEALS_KEY = 'order_cairn5_seals_at_altar';
      function sealsAtAltar() {
        const saved = parseInt(localStorage.getItem(ALTAR_SEALS_KEY) || '', 10);
        return saved >= 1 && saved <= 5 ? saved : Math.min(5, sealsAtGates() + 4);
      }
      // Seals in Hermes's coat when the Servant counted them by the well (saved when the Station 18 debrief first plays)
      const WELL_SEALS_KEY = 'order_stele_seals_at_well';
      function sealsAtWell() {
        const saved = parseInt(localStorage.getItem(WELL_SEALS_KEY) || '', 10);
        return saved >= 1 && saved <= 5 ? saved : sealsAtAltar();
      }
      function sealsPhrase(n) {
        const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];
        return (words[n] || String(n)) + (n === 1 ? ' seal' : ' seals');
      }
      // Closing message + telemetry of the "completed" steps that end each conversation
      const WIRE_FINAL_TELEMETRY = {
        8: () => '✦ MIRAGE DISPELLED · REAL SPRING FOUND · 4 WATER SKINS FILLED · KEY XXX · [P] - [A] = 14 RECORDED ✦',
        10: () => '✦ TOWER II SEALED · SEALS ' + sealsAtGates() + ' / 5 · CROSSING THE GREAT ERG TO THE SUN MONOLITH (12 H) ✦',
        12: () => '✦ SEAL OF CAIRN II SECURED · SEALS ' + (sealsAtGates() + 1) + ' / 5 · [D] + [F] = 24 · [C] − [T] = 8 RECORDED ✦',
        14: () => '✦ SEALS ' + (sealsAtGates() + 1) + ' / 5 · DOWN TO THE SANDSTONE LABYRINTH (6 H) · BEARING 168° SSE ✦',
        16: () => '✦ SEAL OF CAIRN III SECURED · SEALS ' + (sealsAtGates() + 2) + ' / 5 · [W] + [A] = 26 · [N] − [E] = 9 RECORDED ✦',
        18: () => '✦ SEALS ' + (sealsAtGates() + 2) + ' / 5 · ACROSS THE HARDPAN TO CAIRN IV (18 H) · VIA THE NATURAL BRIDGE ✦',
        20: () => '✦ SEAL OF CAIRN IV SECURED · SEALS ' + (sealsAtGates() + 3) + ' / 5 · [S] + [U] = 17 · [S] − [U] = 9 RECORDED ✦',
        22: () => '✦ SEALS ' + (sealsAtGates() + 3) + ' / 5 · EAST TO THE ARCH OF THE SOLSTICE (18 H) · NO SLEEP ✦',
        24: () => '✦ SEAL OF CAIRN V SECURED · SEALS ' + sealsAtAltar() + ' / 5 · [Y] − [O] = 2 · [L] + [G] = 23 RECORDED · SMOKE OVER TOWER II ✦',
        26: () => '✦ SEALS ' + sealsAtAltar() + ' / 5 · TO TOWER II, TOWARD THE SMOKE (6 H) · ARRIVAL AFTER DARK ✦',
        28: () => '✦ THE SERVANT IS SAFE · [H] − [U] = 16 · [M] + [T] = 25 RECORDED · BEARING 348° NNW · SEALS ' + sealsAtWell() + ' / 5 ✦',
        30: () => '✦ SEALS 5 / 5 · DOWN THE INNER STAIR OF TOWER II · AUDIENCE WITH THE ORACLE ✦',
        32: () => '✦ THE FIRST TRUTH · WHEN: 18 – 20 DECEMBER · [Z] + [D] = 23 · [I] + [E] = 12 RECORDED · THE DESERT PATH IS COMPLETE ✦',
        34: () => '✦ EIGHT NEW JOURNAL PAGES RECEIVED · EAST ACROSS THE PLATEAU TO TOWER III (18 H) · KEEP “THE GATE OF A THOUSAND MASKS” CLOSE ✦',
        36: () => '✦ THE GATE OPENED · SILVER · FRAGMENT I SET · 1 / 9 · A NOTE SEALED IN ASH ✦',
        38: () => '✦ THE DARK ROOM · A HOLE IN THE WALL · “THE CAMERA OBSCURA” READY · FOUR CHANGES TO FIND ✦',
        40: () => '✦ THE HIDEOUT FOUND · THE NARROW HOUSE · FRAGMENT II SET · 2 / 9 ✦',
        42: () => '✦ THE GALLERY · TWO PINS NOBODY DREW · “THE WHISPERING GALLERY” READY · LISTEN AT THE WEST ONE ✦',
        44: () => '✦ THE NICHE OPENED · THE TUNE MIRRORED · FRAGMENT III SET · 3 / 9 · [J] × 2 = [T] RECORDED ✦'
      };
      function appendStepFinal(stepIdx) {
        appendWireMessage(getCartographerTitle(), EXPEDITION_THREAD[stepIdx].hermesFinal, false, false, null, null, { type: 'expedition', step: stepIdx });
        appendWireMessage('SYSTEM TELEMETRY', WIRE_FINAL_TELEMETRY[stepIdx](), true, false, null, null, { type: 'expedition', step: stepIdx });
        if (stepIdx === 36) appendWireIntercept();
        appendLetterNotes(stepIdx);
      }

      // Hermes answers each of Aurelia's letters at the step where Silvia read it (hub/js/aurelia-letters.js)
      function appendLetterNotes(stepIdx) {
        if (!window.EclipseAureliaLetters) return;
        window.EclipseAureliaLetters.notesAt(stepIdx).forEach((text) => {
          appendWireMessage(getCartographerTitle(), text, false, false, null, wireMessagesStream, { type: 'expedition', step: stepIdx });
        });
      }

      // After the night behind the gate, a broken line from someone else slips onto the wire, sealed with ash
      // (docs/STAGE_PATH_BIBLE.md §9). Hermes never hears it and never mentions it.
      const WIRE_INTERCEPT = "…kssh… tell the old man to hold the lamp lower… the treasure reads by it… kssh… the stair past the dressing rooms is rotten, she must keep to the wall… kssh… no harm comes to her in this tower. Not while I…";
      function appendWireIntercept() {
        if (!wireMessagesStream) return;
        const el = document.createElement('div');
        el.className = 'chat-bubble-wrap system-event wire-intercept';
        el.innerHTML = `
          <div class="chat-bubble-row">
            <div class="chat-bubble">
              <span class="wire-intercept-tag">✶ STATIC ON THE LINE · UNKNOWN SENDER ✶</span>
              <span class="wire-intercept-text"></span>
              <span class="wire-intercept-seal" aria-label="A seal of ash: a circle with a line across it">⊖</span>
            </div>
          </div>
        `;
        el.querySelector('.wire-intercept-text').textContent = WIRE_INTERCEPT;
        wireMessagesStream.appendChild(el);
        if (window.EclipseNotebook && window.EclipseNotebook.clue) window.EclipseNotebook.clue('intercept');
      }

      function appendStepIntro(stepIdx) {
        if (WIRE_STEP_DIVIDERS[stepIdx]) appendWireDivider(WIRE_STEP_DIVIDERS[stepIdx]);
        if (EXPEDITION_THREAD[stepIdx] && EXPEDITION_THREAD[stepIdx].hermesInitial) {
          appendWireMessage('HERMES · CARTOGRAPHER', EXPEDITION_THREAD[stepIdx].hermesInitial, false, false, null, null, { type: 'expedition', step: stepIdx });
        }
        // Step 35 tells of the note sealed with ash on the last mask
        if (stepIdx === 35 && window.EclipseNotebook && window.EclipseNotebook.clue) window.EclipseNotebook.clue('note1');
      }

      function isCarlesTester() {
        if (typeof window.isAdminTester === 'function' && window.isAdminTester()) return true;
        const u = String((typeof currentSeeker !== 'undefined' && currentSeeker) || (window.currentSeeker || '') || localStorage.getItem('the_eclipse_active_seeker') || '').toLowerCase();
        if (u === 'carles') return true;
        if (document.body && document.body.getAttribute('data-active-seeker') === 'carles') return true;
        return false;
      }
      window.isCarlesTester = isCarlesTester;

      function rewindToExpeditionStep(targetStep) {
        if (sfx && typeof sfx.playMechanicalClick === 'function') sfx.playMechanicalClick();
        window.__wireTypewriterToken = (window.__wireTypewriterToken || 0) + 1;
        showTyping(false);

        const isSilvia = (localStorage.getItem('the_eclipse_active_seeker') || (window.currentSeeker || 'Silvia')).toLowerCase() === 'silvia';
        targetStep = Math.max(isSilvia ? 4 : 0, Math.min(WIRE_LAST_STEP, Number(targetStep) || 0));
        wireCurrentStep = targetStep;
        wireHistory = wireHistory.slice(0, targetStep);

        try {
          localStorage.setItem('order_field_wire_step', targetStep.toString());
          localStorage.setItem('order_field_wire_choices', JSON.stringify(wireHistory));
        } catch(e) {}

        if (targetStep <= 1) {
          try {
            localStorage.removeItem('order_cartographer_title');
          } catch(e) {}
          setCartographerTitle('HERMES · CARTOGRAPHER');
        }

        if (targetStep <= 2) {
          try {
            localStorage.removeItem('order_satchel_expedition_item');
            localStorage.setItem('order_inventory_relics', JSON.stringify(['gilded_feather', 'order_wax_seal']));
          } catch(e) {}
          if (typeof window.renderSatchel === 'function') window.renderSatchel(0);
          if (typeof window.updateSatchelVisibility === 'function') window.updateSatchelVisibility();
          if (typeof window.updateInventoryBadge === 'function') window.updateInventoryBadge();
        }

        if (targetStep <= 4) {
          try {
            if (targetStep < 4) localStorage.removeItem('order_field_wire_completed');
            localStorage.removeItem('order_dawn_step');
            localStorage.removeItem('order_dawn_choices');
            localStorage.removeItem('order_cairn1_bypassed');
            localStorage.removeItem('order_cairn1_completed');
            localStorage.removeItem('order_cairn1_optimal');
            localStorage.removeItem('order_seal_cairn_1');
            localStorage.removeItem('order_cairn1_found');
            localStorage.removeItem('order_cairn1_locked_until_3_cairns');
            localStorage.removeItem('order_chasm_march_start');
            localStorage.removeItem('order_chasm_march_bypassed');
            localStorage.removeItem('order_playa_march_start');
            localStorage.removeItem('order_playa_march_bypassed');
            localStorage.removeItem(CHASM_WIRE_KEY);
            removeShelterStormWaitBox();
          } catch(e) {}
          dawnStep = 0;
          dawnHistory = [];
          if (typeof window.renderSatchel === 'function') window.renderSatchel(0);
          if (typeof window.updateDawnMapLayer === 'function') window.updateDawnMapLayer();
        }

        if (typeof window.refreshTelegraphSignal === 'function') {
          window.refreshTelegraphSignal();
        }

        renderWireExpedition();
        markMessengerAsRead();
      }
      window.rewindToExpeditionStep = rewindToExpeditionStep;

      function rewindToDawnStep(targetDawnStep) {
        if (sfx && typeof sfx.playMechanicalClick === 'function') sfx.playMechanicalClick();
        window.__wireTypewriterToken = (window.__wireTypewriterToken || 0) + 1;
        showTyping(false);

        targetDawnStep = Math.max(0, Math.min(DAWN_DONE, Number(targetDawnStep) || 0));

        // When in dawn, expedition thread is at step 4
        wireCurrentStep = 4;
        try {
          localStorage.setItem('order_field_wire_step', '4');
          localStorage.setItem('order_field_wire_completed', 'true');
          localStorage.removeItem('order_chasm_march_start');
          localStorage.removeItem('order_chasm_march_bypassed');
          localStorage.removeItem('order_playa_march_start');
          localStorage.removeItem('order_playa_march_bypassed');
          localStorage.removeItem(CHASM_WIRE_KEY);
        } catch(e) {}

        dawnStep = targetDawnStep;
        dawnHistory = dawnHistory.slice(0, targetDawnStep);

        if (targetDawnStep < DAWN_DONE) {
          try {
            localStorage.removeItem('order_cairn1_bypassed');
            localStorage.removeItem('order_cairn1_completed');
            localStorage.removeItem('order_cairn1_optimal');
            localStorage.removeItem('order_seal_cairn_1');
            localStorage.removeItem('order_cairn1_locked_until_3_cairns');
            if (targetDawnStep < 2) {
              localStorage.removeItem('order_cairn1_found');
            }
          } catch(e) {}
          if (typeof window.renderSatchel === 'function') window.renderSatchel(0);
        }
        removeShelterStormWaitBox();

        persistDawn();
        if (typeof window.updateDawnMapLayer === 'function') window.updateDawnMapLayer();

        renderWireExpedition();
        markMessengerAsRead();
      }
      window.rewindToDawnStep = rewindToDawnStep;

      function attachRewindHandler(btn, meta) {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (!meta) {
            rewindToExpeditionStep(0);
            return;
          }
          if (meta.type === 'chasm') {
            rewindToChasmWire(meta.step);
          } else if (meta.type === 'dawn') {
            if (meta.step >= DAWN_DONE) {
              rewindToDawnStep(2);
            } else {
              rewindToDawnStep(meta.step);
            }
          } else if (meta.type === 'inquiry') {
            const bubbleWrap = btn.closest('.chat-bubble-wrap');
            if (bubbleWrap) bubbleWrap.remove();
          } else {
            rewindToExpeditionStep(meta.step);
          }
        });
      }

      function appendWireMessage(sender, text, isSystem = false, isLive = false, onComplete = null, targetStream = null, meta = null) {
        const el = appendWireMessageCore(sender, text, isSystem, isLive, onComplete, targetStream, meta);
        noteNewMessage();
        return el;
      }

      function appendWireMessageCore(sender, text, isSystem = false, isLive = false, onComplete = null, targetStream = null, meta = null) {
        const stream = targetStream || (currentWireTab === 'inquiries' ? wireInquiriesStream : wireMessagesStream);
        if (!stream) return null;
        const msgEl = document.createElement('div');
        const isSilvia = sender.toLowerCase().includes('silvia');

        const effectiveMeta = meta || (
          (stream === wireInquiriesStream || currentWireTab === 'inquiries')
            ? { type: 'inquiry' }
            : (wireCurrentStep === 4 && (isDawnDone() || dawnStep > 0))
              ? { type: 'dawn', step: dawnStep }
              : { type: 'expedition', step: wireCurrentStep }
        );

        let rewindBtnHtml = '';
        if (isCarlesTester()) {
          rewindBtnHtml = `<button type="button" class="carles-rewind-btn" title="Rewind conversation here" aria-label="Rewind conversation here"><span>↺</span></button>`;
        }

        if (isSystem) {
          msgEl.className = 'chat-bubble-wrap system-event';
          msgEl.innerHTML = `
            <div class="chat-bubble-row" style="display:flex; align-items:center; justify-content:center; gap:8px;">
              <div class="chat-bubble">
                <span>${text}</span>
              </div>
              ${rewindBtnHtml}
            </div>
          `;
          const btn = msgEl.querySelector('.carles-rewind-btn');
          if (btn) attachRewindHandler(btn, effectiveMeta);
          stream.appendChild(msgEl);
          msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          if (typeof onComplete === 'function') onComplete();
          return msgEl;
        }

        const senderDisplay = isSilvia ? 'Silvia (Navigator)' : getCartographerTitle();
        const checks = isSilvia ? ' ✓✓' : '';

        if (isSilvia) {
          msgEl.className = 'chat-bubble-wrap outgoing';
          const formattedText = formatJournalCallouts(text).split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
          msgEl.innerHTML = `
            <div class="chat-sender-name">${senderDisplay}</div>
            <div class="chat-bubble-row">
              ${rewindBtnHtml}
              <div class="chat-bubble">
                <div class="chat-bubble-text">${formattedText}</div>
                <span class="chat-bubble-time">${getWireTimestamp()}${checks}</span>
              </div>
              <div class="silvia-avatar-stamp" title="Silvia · Master Navigator" aria-label="Silvia Navigator Stamp">
                <img src="assets/silvia_navigator_avatar.jpg" alt="Silvia" class="silvia-avatar-img">
              </div>
            </div>
          `;
          const btn = msgEl.querySelector('.carles-rewind-btn');
          if (btn) attachRewindHandler(btn, effectiveMeta);
          stream.appendChild(msgEl);
          msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          if (typeof onComplete === 'function') onComplete();
          return msgEl;
        }

        // Incoming message from Hermes
        msgEl.className = 'chat-bubble-wrap incoming';

        if (!isLive) {
          const formattedText = formatJournalCallouts(text).split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
          msgEl.innerHTML = `
            <div class="chat-sender-name">${senderDisplay}</div>
            <div class="chat-bubble-row">
              <div class="chat-bubble">
                <div class="chat-bubble-text">${formattedText}</div>
                <span class="chat-bubble-time">${getWireTimestamp()}</span>
              </div>
              ${rewindBtnHtml}
            </div>
          `;
          const btn = msgEl.querySelector('.carles-rewind-btn');
          if (btn) attachRewindHandler(btn, effectiveMeta);
          stream.appendChild(msgEl);
          if (typeof onComplete === 'function') onComplete();
          return msgEl;
        }

        // Live typewriter effect for new incoming Hermes dispatch
        msgEl.innerHTML = `
          <div class="chat-sender-name">${senderDisplay}</div>
          <div class="chat-bubble-row">
            <div class="chat-bubble highlight-pulse">
              <div class="chat-bubble-text"><span class="telegraph-typewriter-target"></span><span class="telegraph-cursor"></span></div>
              <span class="chat-bubble-time">${getWireTimestamp()}</span>
            </div>
            ${rewindBtnHtml}
          </div>
        `;
        const btn = msgEl.querySelector('.carles-rewind-btn');
        if (btn) attachRewindHandler(btn, effectiveMeta);
        stream.appendChild(msgEl);

        // Smooth scroll to focus on newly arriving dispatch
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const targetSpan = msgEl.querySelector('.telegraph-typewriter-target');
        const cursorSpan = msgEl.querySelector('.telegraph-cursor');
        const bubble = msgEl.querySelector('.chat-bubble');

        let charIdx = 0;
        const totalChars = text.length;
        let lastSoundTime = 0;
        const myToken = (window.__wireTypewriterToken = (window.__wireTypewriterToken || 0));

        function typeTick() {
          if (!targetSpan || !targetSpan.isConnected || myToken !== window.__wireTypewriterToken) return;
          const chunk = Math.min(Math.max(5, Math.ceil(totalChars / 70)), totalChars - charIdx);
          charIdx += chunk;
          const currentSub = text.substring(0, charIdx);

          targetSpan.innerHTML = currentSub.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');

          const now = Date.now();
          if (now - lastSoundTime > 65) {
            if (sfx && typeof sfx.playMechanicalClick === 'function') {
              try { sfx.playMechanicalClick(); } catch(e) {}
            }
            lastSoundTime = now;
          }

          if (charIdx < totalChars) {
            setTimeout(typeTick, 16);
          } else {
            if (cursorSpan) cursorSpan.remove();
            const finalFormatted = formatJournalCallouts(text).split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
            if (bubble) {
              const textContainer = bubble.querySelector('.chat-bubble-text');
              if (textContainer) textContainer.innerHTML = finalFormatted;
            }
            if (typeof onComplete === 'function') onComplete();
          }
        }

        if (sfx && typeof sfx.playTelegraphArrival === 'function') sfx.playTelegraphArrival();
        typeTick();
        return msgEl;
      }

      // A graphite sketch that Hermes attaches to the conversation
      function appendWireSketch(src, caption, meta = null) {
        if (!wireMessagesStream) return;
        const el = document.createElement('div');
        el.className = 'chat-bubble-wrap incoming';
        let rewindBtnHtml = '';
        if (isCarlesTester()) {
          rewindBtnHtml = `<button type="button" class="carles-rewind-btn" title="Rewind conversation here" aria-label="Rewind conversation here"><span>↺</span></button>`;
        }
        el.innerHTML = `
          <div class="chat-sender-name">${getCartographerTitle()}</div>
          <div class="chat-bubble-row">
            <div class="chat-bubble chat-sketch-bubble">
              <img src="${src}" alt="${caption}" loading="lazy">
              <div class="chat-sketch-cap">${caption}</div>
              <span class="chat-bubble-time">${getWireTimestamp()}</span>
            </div>
            ${rewindBtnHtml}
          </div>
        `;
        const btn = el.querySelector('.carles-rewind-btn');
        if (btn) attachRewindHandler(btn, meta || { type: 'dawn', step: 2 });
        wireMessagesStream.appendChild(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        noteNewMessage();
      }

      // =======================================================================
      // THE DAWN SEGMENT · conversation logic, restoration and the hand-off to Cairn I
      // =======================================================================
      const DAWN_TELEMETRY = '✦ SEAL OF CAIRN I SECURED · TREK TO THE NORTH PORTAL BEGUN ✦';

      function persistDawn() {
        try {
          localStorage.setItem('order_dawn_step', String(dawnStep));
          localStorage.setItem('order_dawn_choices', JSON.stringify(dawnHistory));
          if (dawnStep >= 2) localStorage.setItem('order_cairn1_found', 'true');
        } catch (e) {}
        if (typeof window.updateDawnMapLayer === 'function') window.updateDawnMapLayer();
      }

      function isDawnDone() { return dawnStep >= DAWN_DONE; }

      // The tone Silvia used most often so far; a tie goes to the tone she used first.
      function dominantTone(includeDawn) {
        const counts = {};
        const order = [];
        const note = (t) => {
          if (!t) return;
          if (!(t in counts)) { counts[t] = 0; order.push(t); }
          counts[t]++;
        };
        for (let s = 0; s < 4; s++) {
          const data = EXPEDITION_THREAD[s];
          if (data && data.choices && data.choices[wireHistory[s]]) note(HERMES_TONE_MAP[data.choices[wireHistory[s]].id]);
        }
        if (includeDawn) {
          for (let s = 0; s < 2; s++) {
            const data = DAWN_THREAD[s];
            if (s < dawnStep && data.choices && data.choices[dawnHistory[s]]) note(data.choices[dawnHistory[s]].tone);
          }
        }
        let best = 'warm';
        let bestCount = 0;
        order.forEach((t) => { if (counts[t] > bestCount) { best = t; bestCount = counts[t]; } });
        return best;
      }
      window.hermesDominantTone = () => dominantTone(true);   // the Mirror Speaker answers it (hub/js/mirror-speaker.js)
      // The answer Silvia chose at a step of the Field Wire (the journey profile reads steps 1 and 2: hub/js/journey-profile.js)
      window.hermesWireChoice = (step) => {
        const data = EXPEDITION_THREAD[step];
        return data && data.choices && wireHistory[step] !== undefined ? data.choices[wireHistory[step]] || null : null;
      };

      const CHASM_MARCH_HOURS = 26;
      const CHASM_MARCH_MS = CHASM_MARCH_HOURS * 3600 * 1000;

      function getChasmMarchProgress() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('skip_march') === '1' || urlParams.get('chasm_ready') === '1') return 1.0;
        if (localStorage.getItem('order_chasm_march_bypassed') === 'true') return 1.0;
        let start = parseInt(localStorage.getItem('order_chasm_march_start') || '0', 10);
        // A save past the dawn with no start time (older saves, a partial restore): Hermes sets out now
        if (!start && (localStorage.getItem('order_cairn1_completed') === 'true' || localStorage.getItem('order_cairn1_bypassed') === 'true'
            || parseInt(localStorage.getItem('order_dawn_step') || '0', 10) >= 3)) {
          start = Date.now();
          try { localStorage.setItem('order_chasm_march_start', String(start)); } catch (e) {}
        }
        if (!start) return 0.0;
        return Math.max(0, Math.min(1.0, (Date.now() - start) / CHASM_MARCH_MS));
      }

      // The Operator's hold (23-10-2026): while true, the canyon stays shut for Silvia even once the 26 hours have
      // passed, and Hermes makes camp in sight of the North Portal. Testers, and a skipped walk, go on.
      // Released on the Operator's OK (23-10-2026): Silvia has reached the North Portal.
      const CHASM_HOLD = false;
      function isChasmHeld() {
        if (!CHASM_HOLD || localStorage.getItem('order_whispering_chasm_completed') === 'true') return false;
        if (localStorage.getItem('order_chasm_march_bypassed') === 'true') return false;
        return !isCarlesTester();
      }
      // The 26 hours are over but the hold keeps Hermes at his camp
      window.isChasmCamped = () => isChasmHeld() && getChasmMarchProgress() >= 1.0;

      function isChasmMarchOver() {
        return getChasmMarchProgress() >= 1.0 && !isChasmHeld();
      }
      window.isChasmMarchOver = isChasmMarchOver;
      window.getChasmMarchProgress = getChasmMarchProgress;
      window.getChasmMarchArrivesAt = () => {
        const start = parseInt(localStorage.getItem('order_chasm_march_start') || '0', 10);
        return start > 1 ? start + CHASM_MARCH_MS : 0;
      };
      // Hermes's brief at the North Portal: until Silvia answers it, the canyon stays shut
      window.isChasmBriefHeard = () => {
        try { const w = JSON.parse(localStorage.getItem('order_chasm_wire') || '{}'); return !!w && w.reply0 !== undefined; } catch (e) { return false; }
      };

      window.skipChasmMarch = function () {
        localStorage.setItem('order_chasm_march_bypassed', 'true');
        if (window.Desert3D && typeof window.Desert3D.refresh === 'function') window.Desert3D.refresh();
        renderWireExpedition();
      };

      // Timed walks between stations: they start when Silvia answers Hermes on the wire, and end when
      // the hours have passed, the station is solved, or a tester skips them.
      function makeMarch(hours, keys) {
        const ms = hours * 3600 * 1000;
        const progress = () => {
          if (localStorage.getItem(keys.bypassed) === 'true') return 1.0;
          if (localStorage.getItem(keys.done) === 'true') return 1.0;
          const start = parseInt(localStorage.getItem(keys.start) || '0', 10);
          if (!start) return 0.0;
          return Math.max(0, Math.min(1.0, (Date.now() - start) / ms));
        };
        const started = () => !!localStorage.getItem(keys.start) || progress() >= 1.0;
        // The hours are up but the Operator holds the station: Hermes camps where he is (keys.held)
        const camped = () => !!keys.held && progress() >= 1.0 && localStorage.getItem(keys.done) !== 'true'
          && localStorage.getItem(keys.bypassed) !== 'true' && keys.held();
        const over = () => progress() >= 1.0 && !camped();
        // "5 h 12 min" while Hermes walks; '' before he sets out or once he has arrived
        const eta = () => {
          if (!started() || progress() >= 1.0) return '';
          const remMs = Math.max(0, ms * (1 - progress()));
          return Math.floor(remMs / 3600000) + ' h ' + String(Math.floor((remMs % 3600000) / 60000)).padStart(2, '0') + ' min';
        };
        const start = () => { if (!localStorage.getItem(keys.start)) { try { localStorage.setItem(keys.start, String(Date.now())); } catch (e) {} } };
        const skip = () => {
          localStorage.setItem(keys.bypassed, 'true');
          if (window.Desert3D && typeof window.Desert3D.refresh === 'function') window.Desert3D.refresh();
          renderWireExpedition();
        };
        // When Hermes arrives (ms since epoch), 0 before he sets out
        const arrivesAt = () => { const t = parseInt(localStorage.getItem(keys.start) || '0', 10); return t > 1 ? t + ms : 0; };
        return { progress, started, over, camped, eta, start, skip, arrivesAt };
      }

      // The Operator's hold on Station 11 (24-10-2026): the Salt Playa is being rebuilt as a 3D game. While true,
      // first light comes but Hermes camps at the edge of the salt and the crossing stays shut for Silvia
      // (testers go on). Released on 25-10-2026 by the Operator's OK (set it back to true to hold the crossing again).
      const PLAYA_HOLD = false;

      // The Operator's hold after the Desert Lexicon (25-10-2026): the road waits for the next adventure. While true, when Silvia has
      // read the steles Hermes rests at Camp VII, Station 13 stays sealed and the chat says goodnight (testers go on). To release it:
      // set NEXT_ADVENTURE_HOLD = false and deploy, only on the Operator's OK.
      const NEXT_ADVENTURE_HOLD = true;
      window.isNextAdventureHeld = () => NEXT_ADVENTURE_HOLD && localStorage.getItem('order_desert_lexicon_completed') === 'true'
        && localStorage.getItem('order_oasis_clepsydra_completed') !== 'true' && !isCarlesTester();

      // Station 11: the night at the Oasis Gate. Hermes sleeps outside the canyon and sets out on the salt at
      // first light, 10 hours after Silvia answers him there (the Oasis Gate reply starts it).
      const playaMarch = makeMarch(10, { start: 'order_playa_march_start', bypassed: 'order_playa_march_bypassed', done: 'order_salt_playa_completed',
        held: () => PLAYA_HOLD && !isCarlesTester() });
      window.isPlayaMarchOver = playaMarch.over;
      window.isPlayaCamped = playaMarch.camped;
      window.getPlayaMarchEta = playaMarch.eta;
      // While he camps, the 3D map keeps him at the Oasis Gate, short of the salt
      window.getPlayaMarchProgress = () => (playaMarch.camped() ? 0.999 : playaMarch.progress());
      window.skipPlayaMarch = playaMarch.skip;

      // Station 12: the 3-hour walk from the marker on the south shore, through the dunes, to the Nomad Ruins at dusk
      // (her answer on the south shore starts it)
      const lexiconMarch = makeMarch(3, { start: 'order_lexicon_march_start', bypassed: 'order_lexicon_march_bypassed', done: 'order_desert_lexicon_completed' });
      window.isLexiconMarchOver = lexiconMarch.over;
      window.getLexiconMarchEta = lexiconMarch.eta;
      window.skipLexiconMarch = lexiconMarch.skip;

      // Station 14: the 12-hour crossing of the Great Erg, from the gates of Tower II to the Sun Monolith (wire step 9 starts it)
      const monolithMarch = makeMarch(12, { start: 'order_monolith_march_start', bypassed: 'order_monolith_march_bypassed', done: 'order_sun_monolith_completed' });
      const getMonolithMarchProgress = monolithMarch.progress;
      const isMonolithMarchStarted = monolithMarch.started;
      const isMonolithMarchOver = monolithMarch.over;
      const getMonolithMarchEta = monolithMarch.eta;
      window.getMonolithMarchProgress = getMonolithMarchProgress;
      window.isMonolithMarchStarted = isMonolithMarchStarted;
      window.isMonolithMarchOver = isMonolithMarchOver;
      window.getMonolithMarchEta = getMonolithMarchEta;
      window.skipMonolithMarch = monolithMarch.skip;

      // Station 15: the 6-hour walk down from the Sun Monolith to the Sandstone Labyrinth (wire step 13 starts it)
      const labyrinthMarch = makeMarch(6, { start: 'order_labyrinth_march_start', bypassed: 'order_labyrinth_march_bypassed', done: 'order_sandstone_labyrinth_completed' });
      window.getLabyrinthMarchProgress = labyrinthMarch.progress;
      window.isLabyrinthMarchStarted = labyrinthMarch.started;
      window.isLabyrinthMarchOver = labyrinthMarch.over;
      window.getLabyrinthMarchEta = labyrinthMarch.eta;
      window.skipLabyrinthMarch = labyrinthMarch.skip;

      // Station 16: the 18-hour crossing of the hardpan and the Natural Bridge to Cairn IV (wire step 17 starts it)
      const cairnFourMarch = makeMarch(18, { start: 'order_cairn4_march_start', bypassed: 'order_cairn4_march_bypassed', done: 'order_cairn_iv_completed' });
      window.getCairnFourMarchProgress = cairnFourMarch.progress;
      window.isCairnFourMarchStarted = cairnFourMarch.started;
      window.isCairnFourMarchOver = cairnFourMarch.over;
      window.getCairnFourMarchEta = cairnFourMarch.eta;
      window.skipCairnFourMarch = cairnFourMarch.skip;

      // Station 17: the 18-hour walk from Cairn IV to the Arch of the Solstice (wire step 21 starts it)
      const solsticeMarch = makeMarch(18, { start: 'order_cairn5_march_start', bypassed: 'order_cairn5_march_bypassed', done: 'order_arch_solstice_completed' });
      window.getSolsticeMarchProgress = solsticeMarch.progress;
      window.isSolsticeMarchStarted = solsticeMarch.started;
      window.isSolsticeMarchOver = solsticeMarch.over;
      window.getSolsticeMarchEta = solsticeMarch.eta;
      window.skipSolsticeMarch = solsticeMarch.skip;

      // Station 18: the 6-hour walk from the Arch of the Solstice to the burning Tower II (wire step 25 starts it)
      const steleMarch = makeMarch(6, { start: 'order_stele_march_start', bypassed: 'order_stele_march_bypassed', done: 'order_polybius_stele_completed' });
      window.getSteleMarchProgress = steleMarch.progress;
      window.isSteleMarchStarted = steleMarch.started;
      window.isSteleMarchOver = steleMarch.over;
      window.getSteleMarchEta = steleMarch.eta;
      window.skipSteleMarch = steleMarch.skip;

      // Station 19: no walk. The inner stair opens at dawn, once Silvia answers Hermes at step 29.
      const oracleStair = (() => {
        const keys = { start: 'order_oracle_stair_start', bypassed: 'order_oracle_stair_bypassed', done: 'order_oracle_horizon_completed' };
        const over = () => ['bypassed', 'done'].some((k) => localStorage.getItem(keys[k]) === 'true') || !!localStorage.getItem(keys.start);
        return {
          progress: () => (over() ? 1.0 : 0.0),
          started: over,
          over,
          eta: () => '',
          start: () => { if (!localStorage.getItem(keys.start)) { try { localStorage.setItem(keys.start, String(Date.now())); } catch (e) {} } },
          skip: () => { localStorage.setItem(keys.bypassed, 'true'); renderWireExpedition(); }
        };
      })();
      window.isOracleStairOver = oracleStair.over;

      // Station 20: the 18-hour crossing of the plateau from Tower II to the gate of Tower III (wire step 33 starts it)
      const masksMarch = makeMarch(18, { start: 'order_masks_march_start', bypassed: 'order_masks_march_bypassed', done: 'order_masks_gate_completed' });
      window.getMasksMarchProgress = masksMarch.progress;
      window.isMasksMarchStarted = masksMarch.started;
      window.isMasksMarchOver = masksMarch.over;
      window.getMasksMarchEta = masksMarch.eta;
      window.skipMasksMarch = masksMarch.skip;

      // What the Field Wire shows while each march is under way (wire step → leg), and which answer starts it
      const MARCH_LEGS = {
        10: {
          step: 10, march: monolithMarch, doneKey: 'order_sun_monolith_completed',
          walkingTitle: '✦ Crossing the Great Erg · Heading NNE to the Sun Monolith ✦',
          walkingDesc: 'Hermes is walking by night across the Great Erg, with the stars for a compass. Keep the page “The Sun Monolith & Cairn II” close.',
          etaLabel: 'ARRIVAL AT THE SUN MONOLITH',
          arrivedTitle: 'Sun Monolith Reached · Station 14 Awaits',
          arrivedDesc: 'Hermes is standing on the Ridge of the Sun. Open the Grand Desert Map and wake Cairn II (Station 14, the page “The Sun Monolith & Cairn II”).'
        },
        14: {
          step: 14, march: labyrinthMarch, doneKey: 'order_sandstone_labyrinth_completed',
          walkingTitle: '✦ Down to the Sandstone Labyrinth · Bearing 168° SSE ✦',
          walkingDesc: 'Hermes is walking down from the Sun Monolith on the stone shelves, away from the raiders\' ruts. Trace the true road on the page “The Sandstone Labyrinth & Cairn III” while he walks.',
          etaLabel: 'ARRIVAL AT THE SANDSTONE LABYRINTH',
          arrivedTitle: 'Sandstone Labyrinth Reached · Station 15 Awaits',
          arrivedDesc: 'Hermes is at the foot of Cairn III, inside the labyrinth. Open the Grand Desert Map and speak the sigil of its copper plate (Station 15, the page “The Sandstone Labyrinth & Cairn III”).'
        },
        18: {
          step: 18, march: cairnFourMarch, doneKey: 'order_cairn_iv_completed',
          walkingTitle: '✦ Across the Hardpan · Over the Natural Bridge to Cairn IV ✦',
          walkingDesc: 'Hermes walks the hardpan by night and sleeps in the rocks by day, toward the singing pillars. Keep the page “Cairn IV: Sentry of the Canyon” close.',
          etaLabel: 'ARRIVAL AT CAIRN IV',
          arrivedTitle: 'Cairn IV Reached · Station 16 Awaits',
          arrivedDesc: 'Hermes is between the twin pillars at the southern mouth of the gorge. Open the Grand Desert Map and wake the Sentry of the Canyon (Station 16, the page “Cairn IV: Sentry of the Canyon”).'
        },
        22: {
          step: 22, march: solsticeMarch, doneKey: 'order_arch_solstice_completed',
          walkingTitle: '✦ East to the Arch of the Solstice · No Sleep ✦',
          walkingDesc: 'Hermes walks without rest, back over the Natural Bridge and across the dunes of Cairn V. Keep the page “Arch of the Solstice & The Solar Altar” close.',
          etaLabel: 'ARRIVAL AT THE ARCH',
          arrivedTitle: 'The Arch of the Solstice · Station 17 Awaits',
          arrivedDesc: 'Hermes is under the Arch, by the Courtyard of Rays. Open the Grand Desert Map and speak the sigil of Cairn V (Station 17, the page “Arch of the Solstice & The Solar Altar”).'
        },
        26: {
          step: 26, march: steleMarch, doneKey: 'order_polybius_stele_completed',
          walkingTitle: '✦ To Tower II · Toward the Smoke ✦',
          walkingDesc: 'Hermes follows the dry bed under the dunes toward the smoke over the Sanctuary, and will arrive after dark. Keep the page “The Polybius Stele” close.',
          etaLabel: 'ARRIVAL AT TOWER II',
          arrivedTitle: 'Tower II in Flames · Station 18 Awaits',
          arrivedDesc: 'Hermes is inside the burning atrium of the Sanctuary, by the stele. Open the Grand Desert Map and speak its proverb (Station 18, the page “The Polybius Stele”).'
        },
        30: {
          step: 30, march: oracleStair, doneKey: 'order_oracle_horizon_completed',
          walkingTitle: '✦ Down the Inner Stair ✦',
          walkingDesc: 'Hermes is going down the inner stair of Tower II.',
          etaLabel: 'AT THE DOOR',
          arrivedTitle: "The Inner Chamber · Station 19 Awaits",
          arrivedDesc: "Hermes is at the door of the Oracle, at the bottom of the inner stair. Open the Grand Desert Map and speak the sigil of the Oracle (Station 19, the page “The Oracle's Horizon”)."
        },
        34: {
          step: 34, march: masksMarch, doneKey: 'order_masks_gate_completed',
          walkingTitle: '✦ East Across the Plateau · To the Third Tower ✦',
          walkingDesc: 'Hermes and Aurelia are walking east after the raiders\' ruts. Read the page “The Unsent Letter” in a mirror, and keep the page “The Gate of a Thousand Masks” close.',
          etaLabel: 'ARRIVAL AT TOWER III',
          arrivedTitle: 'Tower III · The Gate of a Thousand Masks · Station 20 Awaits',
          arrivedDesc: 'Hermes and Aurelia are at the gate of Tower III. Open Path III on the Quest Map and speak the word of the gate (Station 20, the page “The Gate of a Thousand Masks”).'
        }
      };
      // First light at the Oasis Gate: Hermes calls from the edge of the salt, as he promised (a badge while the chat is closed)
      setInterval(() => {
        if (!playaMarch.started() || !playaMarch.over() || localStorage.getItem('order_salt_playa_completed') === 'true') return;
        if (localStorage.getItem('order_playa_first_light_called') === 'true') return;
        try { localStorage.setItem('order_playa_first_light_called', 'true'); } catch (e) {}
        if (document.body.getAttribute('data-active-view') === 'view-field-wire') renderWireChoices();
        else if (getMessengerUnreadCount() < 1) setMessengerUnreadCount(1);
        if (window.Desert3D && typeof window.Desert3D.refresh === 'function') window.Desert3D.refresh();
      }, 15000);

      // Every walk by its station, for the sealed cards of the Quest Map (the countdown reads arrivesAt)
      window.EclipseMarches = { playa: playaMarch, lexicon: lexiconMarch, monolith: monolithMarch, labyrinth: labyrinthMarch, cairnFour: cairnFourMarch, solstice: solsticeMarch, stele: steleMarch };
      const PLAYA_LEG = {
        step: 4, march: playaMarch, doneKey: 'order_salt_playa_completed',
        walkingTitle: '✦ Night at the Oasis Gate · The Salt Waits for First Light ✦',
        walkingDesc: 'Hermes is asleep by the rocks of the Oasis Gate, his satchel under his head. Study the page “The Salt Playa (Dry Basin)” of your journal tonight: at first light he will call you from the edge of the salt.',
        etaLabel: 'FIRST LIGHT ON THE SALT',
        arrivedTitle: 'First Light · Station 11 Awaits',
        arrivedDesc: 'Hermes is standing on the North Edge of the white salt, by an old surveyor\'s tripod, and calling you on the Field Wire. Answer him, then guide him across the Salt Playa (Station 11, the page “The Salt Playa (Dry Basin)”).',
        campedTitle: '✦ First Light · Camp at the Edge of the Salt ✦',
        campedDesc: 'First light has come. Hermes has walked out of the Oasis Gate to the edge of the white salt and made camp beside an old surveyor\'s tripod. He is testing the crust with his staff, slab by slab, and will call you on the Field Wire when he is ready to step onto it. Keep the page “The Salt Playa (Dry Basin)” of your journal close.'
      };
      const LEXICON_LEG = {
        step: 4, march: lexiconMarch, doneKey: 'order_desert_lexicon_completed',
        walkingTitle: '✦ Through the Dunes · To the Nomad Ruins ✦',
        walkingDesc: 'Hermes has left the marker on the south shore and is walking south through the dunes, keeping to the hollows, toward the ruins of an old nomad camp. Weigh your Cipher Ledger with the Surveyor\'s Balance while he walks, and keep the page “The Desert Lexicon & Al-Qibla” close.',
        etaLabel: 'ARRIVAL AT THE NOMAD RUINS',
        cinematic: 'road_of_salt',
        arrivedTitle: 'The Nomad Ruins at Dusk · Hermes Is Calling',
        arrivedDesc: 'Hermes has reached the ruins of Camp VII, in the dunes south of the salt. Keep the Field Wire open to hear him.'
      };
      const MARCH_STARTED_BY_ANSWER = { 9: monolithMarch, 13: labyrinthMarch, 17: cairnFourMarch, 21: solsticeMarch, 25: steleMarch, 29: oracleStair, 33: masksMarch };

      function dawnMessageText(i) {
        const d = DAWN_THREAD[i];
        if (i === 0) return HERMES_TONE_LINES[dominantTone(false)] + '\n\n' + d.hermesInitial;
        if (i === DAWN_DONE) {
          const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
          const isOptimal = localStorage.getItem('order_cairn1_optimal') === 'true';
          if (isBypassed) {
            return "You are right, Silvia. A surveyor who follows whims in the waste is a surveyor who does not come back. The sun is climbing, and our water is too precious for ghost hunts.\n\nI am leaving the river stones untouched in the wash and turning west, following the hard rock shelf directly toward the gorge. It will be a grueling 26-hour trek across the scree slopes to reach the North Portal, but the rock is solid underfoot.\n\nTrack my beacon across the western ridge on the Grand Desert Map. And while I walk, open the page “The Whispering Chasm” in your journal: it is the whole canyon seen from above, the view I will never have down there. Study it well. I will keep the wire on low-power standby and radio in the moment I reach the canyon mouth.";
          }
          const optimalPraise = isOptimal
            ? "Fifteen lifts—exactly fifteen! You moved the four river stones with the pure mathematical economy of the ancient surveyors, Silvia. Not a single stone was lifted in vain.\n\n"
            : "";
          return (optimalPraise + "It is done. The last stone settled and the whole base gave a soft click, as if the river itself had exhaled. A hollow opened under the third foundation, and in it lay a flat disc of sandstone, as big as my palm: a sun above a wavy line. The Wash River seal.\n\nI have no idea what it opens, but into my satchel it goes.\n\n{TONE}\n\nNow look ahead, Silvia. The riverbed ends against a colossal wall of red sandstone, where the Whispering Chasm splits the mountain. It is a long, grueling trek across the broken wash and scree slopes to reach that fissure—at least 26 hours of hard walking through the heat and dust.\n\nI am tightening my boots, filling my canteen from the cool silt reservoir, and setting out right now. Follow my beacon on the Grand Desert Map. And while I walk, open the page “The Whispering Chasm” in your journal: it is the whole canyon seen from above, the view I will never have down there. Study it well. I will keep the wire on low-power standby and radio in the moment I sight the canyon mouth.").replace('{TONE}', HERMES_TONE_FINALE[dominantTone(true)]);
        }
        return d.hermesInitial;
      }

      function appendDawnIntro(i, live, done) {
        const d = DAWN_THREAD[i];
        if (d.divider) appendWireDivider(d.divider);
        appendWireMessage('HERMES · CARTOGRAPHER', dawnMessageText(i), false, !!live, () => {
          if (d.sketch) appendWireSketch(d.sketch.src, d.sketch.caption, { type: 'dawn', step: i });
          if (typeof done === 'function') done();
        }, null, { type: 'dawn', step: i });
      }

      // Re-draws the dawn conversation when the chat opens. Returns true when the finale is playing live.
      function appendDawnHistory() {
        const stormPending = !isStormOver();
        const effectiveDawnStep = (stormPending && dawnStep === 1) ? 0 : dawnStep;
        const last = Math.min(effectiveDawnStep, DAWN_DONE);
        for (let s = 0; s <= last; s++) {
          const d = DAWN_THREAD[s];
          if (s === DAWN_DONE) {
            const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
            const telemetryText = isBypassed
              ? '✦ DRY RIVER UNEXPLORED · TREK TO THE NORTH PORTAL BEGUN ✦'
              : DAWN_TELEMETRY;
            if (window.__dawnFinaleLive) {
              window.__dawnFinaleLive = false;
              wireMessagesStream.classList.remove('is-restoring');
              showTyping(true);
              setTimeout(() => {
                showTyping(false);
                if (sfx) sfx.playCelestialChime();
                appendDawnIntro(s, true, () => {
                  appendWireMessage('SYSTEM TELEMETRY', telemetryText, true, false, null, null, { type: 'dawn', step: 2 });
                  renderWireChoices();
                  updateMessengerBadge();
                });
              }, 700);
              return true;
            }
            appendDawnIntro(s, false);
            appendWireMessage('SYSTEM TELEMETRY', telemetryText, true, false, null, null, { type: 'dawn', step: 2 });
            appendChasmWireHistory();
          } else {
            appendDawnIntro(s, false);
            if (s < dawnStep) {
              if (s === 2 && dawnHistory[2] === 'bypassed') {
                appendWireMessage('SILVIA · NAVIGATOR', "Do not disturb the stones, Hermes. We don't know who stacked them, and the sun is rising. Walk away and head to the canyon.", false, false, null, null, { type: 'dawn', step: 2 });
                appendWireMessage('HERMES · CARTOGRAPHER', "You are right. Old stones in a dry wash might be an ancient marker, a raider trap, or simply a waste of precious daylight. I will leave them as they are and head west to the canyon mouth.", false, false, null, null, { type: 'dawn', step: 2 });
              } else if (d.choices) {
                const idx = (dawnHistory[s] !== undefined && d.choices[dawnHistory[s]]) ? dawnHistory[s] : 0;
                appendWireMessage('SILVIA · NAVIGATOR', d.choices[idx].silviaMsg, false, false, null, null, { type: 'dawn', step: s });
                appendWireMessage('HERMES · CARTOGRAPHER', d.choices[idx].hermesReply, false, false, null, null, { type: 'dawn', step: s });
              }
            }
          }
        }
        return false;
      }

      function makeChoicePill(tag, html, onClick) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'messenger-choice-pill';
        btn.innerHTML = `
          <span class="messenger-choice-tag">${tag}</span>
          <span class="messenger-choice-text">${html}</span>
        `;
        btn.addEventListener('click', onClick);
        return btn;
      }

      function handleDawnBypassAtStones() {
        if (sfx && sfx.playMechanicalClick) sfx.playMechanicalClick();
        appendWireMessage('SILVIA · NAVIGATOR', "Do not disturb the stones, Hermes. We don't know who stacked them, and the sun is rising. Walk away and head to the canyon.", false, false, null, null, { type: 'dawn', step: 2 });
        wireChoicesGrid.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        dawnHistory[2] = 'bypassed';
        try {
          localStorage.setItem('order_cairn1_bypassed', 'true');
          localStorage.removeItem('order_cairn1_completed');
          localStorage.removeItem('order_seal_cairn_1');
          if (!localStorage.getItem('order_chasm_march_start')) {
            localStorage.setItem('order_chasm_march_start', String(Date.now()));
          }
        } catch (e) {}
        dawnStep = DAWN_DONE;
        persistDawn();
        showTyping(true);
        setTimeout(() => {
          showTyping(false);
          if (sfx) sfx.playChimeHover();
          appendWireMessage('HERMES · CARTOGRAPHER', "You are right. Old stones in a dry wash might be an ancient marker, a raider trap, or simply a waste of precious daylight. I will leave them as they are and head west to the canyon mouth.", false, true, () => {
            setTimeout(() => beginDawnStep(DAWN_DONE), 500);
          }, null, { type: 'dawn', step: 2 });
        }, 650);
      }

      function renderDawnPrompt() {
        if (!wireChoicesGrid || !wirePromptBox || !wireCompletedBar) return;
        if (dawnStep >= DAWN_DONE) {
          renderWireChoices();
          return;
        }
        const d = DAWN_THREAD[dawnStep];
        if (!d) {
          renderWireChoices();
          return;
        }
        const header = document.getElementById('wire-prompt-header-text');
        if (typeof window.updateSatchelVisibility === 'function') window.updateSatchelVisibility();
        wirePromptBox.style.display = 'block';
        wireCompletedBar.style.display = 'none';
        wireChoicesGrid.innerHTML = '';
        try {
          localStorage.setItem('order_field_wire_completed', 'true');
          localStorage.setItem('order_field_wire_step', '4');
        } catch (e) {}
        if (d.game) {
          if (header) header.textContent = 'Hermes stands before the river stones:';
          wireChoicesGrid.appendChild(makeChoicePill('🪨', 'Examine the slab and guide Hermes: lift the stones one by one.', () => {
            if (typeof window.openCairnOneModal === 'function') window.openCairnOneModal();
          }));
          wireChoicesGrid.appendChild(makeChoicePill('👣', 'Do not disturb the stones, Hermes. Walk away and head to the canyon.', () => {
            handleDawnBypassAtStones();
          }));
          return;
        }
        if (header) header.textContent = 'Choose your reply';
        if (Array.isArray(d.choices)) {
          d.choices.forEach((choice, idx) => {
            wireChoicesGrid.appendChild(makeChoicePill('0' + (idx + 1), formatJournalCallouts(choice.text), () => handleDawnChoice(choice, idx)));
          });
        }
        if (typeof scrollChatToActivePrompt === 'function') scrollChatToActivePrompt(false);
      }

      // Hermes types the intro of a dawn step, then the reply choices (or the Cairn I button) appear
      function beginDawnStep(i) {
        dawnStep = i;
        persistDawn();
        if (wirePromptBox) wirePromptBox.style.display = 'none';
        showTyping(true);
        setTimeout(() => {
          showTyping(false);
          if (sfx) sfx.playCelestialChime();
          appendDawnIntro(i, true, () => {
            if (dawnStep >= DAWN_DONE) {
              renderWireChoices();
            } else {
              renderDawnPrompt();
            }
            updateMessengerBadge();
          });
        }, 700);
      }

      function handleDawnChoice(choice, idx) {
        if (sfx) sfx.playMechanicalClick();
        const currentDawnStep = dawnStep;
        appendWireMessage('SILVIA · NAVIGATOR', choice.silviaMsg, false, false, null, null, { type: 'dawn', step: currentDawnStep });
        wireChoicesGrid.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        dawnHistory[dawnStep] = idx;
        if (choice.isBypass) {
          try {
            localStorage.setItem('order_cairn1_bypassed', 'true');
            localStorage.removeItem('order_cairn1_completed');
            localStorage.removeItem('order_seal_cairn_1');
            if (!localStorage.getItem('order_chasm_march_start')) {
              localStorage.setItem('order_chasm_march_start', String(Date.now()));
            }
          } catch (e) {}
          dawnStep = DAWN_DONE;
        } else {
          dawnStep = dawnStep + 1;
        }
        persistDawn();
        showTyping(true);
        setTimeout(() => {
          showTyping(false);
          if (sfx) sfx.playChimeHover();
          appendWireMessage('HERMES · CARTOGRAPHER', choice.hermesReply, false, true, () => {
            if (currentDawnStep === 0 && !isStormOver()) {
              if (wirePromptBox) wirePromptBox.style.display = 'none';
              if (wireCompletedBar) wireCompletedBar.style.display = 'none';
              renderShelterStormWaitBox();
              updateMessengerBadge();
            } else {
              setTimeout(() => beginDawnStep(dawnStep), 500);
            }
          }, null, { type: 'dawn', step: currentDawnStep });
        }, 650);
      }

      // Cairn I solved in the game modal: the finale plays live when the chat opens next
      document.addEventListener('dawn:cairn1-solved', () => {
        if (dawnStep >= DAWN_DONE) return;
        const live = (wireCurrentStep === 4 && dawnStep === 2);
        dawnStep = DAWN_DONE;
        persistDawn();
        try {
          if (!localStorage.getItem('order_chasm_march_start')) {
            localStorage.setItem('order_chasm_march_start', String(Date.now()));
          }
        } catch (e) {}
        if (live) window.__dawnFinaleLive = true;
      });

      // =======================================================================
      // THE WHISPERING CHASM ON THE WIRE · at the North Portal Hermes asks her to draw the canyon on
      // her journal before he goes in; at the Oasis Gate, after it, he tells what the canyon gave them.
      // Only for a journey standing there: a save already past the Salt Playa never hears them.
      // =======================================================================
      const CHASM_WIRE_KEY = 'order_chasm_wire';   // { seenN, replyN }: 0 the North Portal, 1 the Oasis Gate, 2 the North Edge of the salt, 3 its south shore, 4 the Nomad Ruins at dusk
      const CHASM_WIRE_TELEMETRY = "✦ NOMAD'S PASSPHRASE RECORDED [MIRAGE] · NEW LEDGER LINE [X] + [E] = 17 · THE SALT PLAYA AWAITS ✦";
      const PLAYA_WIRE_TELEMETRY = "✦ PASSAGE KEYWORD RECORDED [CRYSTAL] · CHECK LINE [T] − [A] = 9 · THE SURVEYOR'S BALANCE IN THE CIPHER LEDGER ✦";
      const WIRE_TELEMETRY = { 1: CHASM_WIRE_TELEMETRY, 3: PLAYA_WIRE_TELEMETRY };
      const CHASM_WIRE = [
        {
          divider: 'The North Portal · Before the Descent',
          hermesInitial: "I am here, Silvia. The North Portal.\n\nIt is narrower than I imagined: two red walls so tall that the sky is only a blue thread above my head, and so close that I can touch both of them with my arms open. The wind goes in ahead of me and comes back changed, full of soft voices, like people talking in the next room. Now I understand the name.\n\nSomebody stood here before us. The canyon walkers, the nomads who crossed these sands long ago, used this gorge as their road to the wells. On a flat stone by the entrance they carved their law, the same four laws that are printed on the page “The Whispering Chasm” in your journal. Never walk the same ground twice. Do not take the quick road. Find all six relic cairns, in order. Beware of the gorges that end in a wall.\n\nDown there I will only ever see the next turn. You can see the whole canyon from above. So before I take a single step, take your pencil: on the page “The Whispering Chasm”, draw the way from the North Portal to the exit marked Desert Oasis, keeping the four laws. Every time your line passes a true cairn, write its rune in the next box of the Nomad's Passphrase.\n\nThen I go in, and you guide me turn by turn, with your line in front of you.",
          choices: [
            {
              tag: '✏️',
              text: 'My line is drawn in my journal, Hermes. Light your lantern: I will guide you turn by turn.',
              silviaMsg: 'My line is drawn in my journal, Hermes, from the North Portal all the way to the oasis. Light your lantern: I will guide you turn by turn.',
              hermesReply: "Then the canyon is already ours, and it simply does not know it yet.\n\nLantern lit. Three skins of water, full. Boots tied twice. I am stepping through the portal now, Silvia. Open the Whispering Chasm and stay close: every time the gorge splits, I will stop and wait for your word."
            },
            {
              tag: '⏳',
              text: 'Give me a few minutes with my pencil first. Sit in the shade and drink something.',
              silviaMsg: 'Give me a few minutes with my pencil first, Hermes. Sit in the shade of the portal and drink something.',
              hermesReply: "Gladly. I am sitting in the shade with my back against the cool rock, listening to the voices. Take all the time you need: a line drawn calmly on paper is worth more than a hundred hurried steps down there.\n\nWhen your pencil reaches the oasis, open the Whispering Chasm and I will get up."
            },
            {
              tag: '👂',
              text: 'What are the voices saying, Hermes? Are they warning us?',
              silviaMsg: 'What are the voices saying, Hermes? Are they warning us?',
              hermesReply: "I pressed my ear to the rock. It is the wind in the cracks, I am almost sure... But the walkers say the voices belong to the pilgrims the gorge kept, and that they still point the way to the next cairn. Down there I can listen once on every stretch, and I will tell you where the whisper comes from.\n\nA whisper is only a hint, though. Your line in the journal is the real map. Draw it first, then open the Whispering Chasm and we go in together."
            }
          ]
        },
        {
          divider: 'The Oasis Gate · Dusk',
          hermesInitial: "Silvia, I am sitting on a warm stone just outside the canyon, and I cannot stop smiling.\n\nI came out a little before noon, and the salt was so bright and so hot that nobody could walk on it, so I waited out the hottest hours in the shade of the rocks. Now the sun is going down. Behind me the gorge is turning purple, and the whispers sound different now: softer, almost like people saying goodbye. I left every relic exactly where we found it: the bell, the lamp, the comb, the horn, the key and the shell. They belong to the pilgrims, not to us. We only took their letters, and the letters are already in your journal.\n\nM, I, R, A, G, E. MIRAGE. A strange password for people who live in the desert, don't you think? I have been turning it over all the way out. Out here a mirage is water that is not really there. Maybe the walkers chose it as a warning: trust the cairns, the laws and the map, never your thirst. Or maybe it is a word that opens something further on. I have learned not to throw any word away.\n\nAnd look up, Silvia. Across the top of the Oasis Gate somebody cut a great X into the rock, and under it, small and neat, in the same careful hand as the other lines of the Order: X + E = 17. The X, a letter of the secret alphabet we have never had! It goes straight into your Cipher Ledger. And keep the R of the bone comb in mind too, the third rune: the Ledger will ask for it soon.\n\nThe walkers call this end of the canyon the Oasis Gate. From here an old track runs south across the Salt Playa, a white plain as flat as a table, all the way to the wells. But something worries me. The sand by the gate is full of fresh tracks: camels, many of them, and boots, all heading south across the salt. Somebody passed through here not long ago, and they were in a hurry.",
          choices: [
            {
              tag: '🏆',
              text: 'MIRAGE is in my six boxes and the Line of the Gate is in my Cipher Ledger. Rest now, Hermes: you earned it.',
              silviaMsg: 'MIRAGE is written in the six boxes of the Nomad\'s Passphrase, and X + E = 17 is in my Cipher Ledger. Rest now, Hermes: you earned it.',
              hermesReply: "Written and recorded. Then tonight I sleep like one of those cairn stones.\n\nBut not before I have looked at the salt once more. The crust is thin in places, and under it there are holes full of brine, dark as ink. Tomorrow at first light I need a safe way across, Silvia, and that way is on the page “The Salt Playa (Dry Basin)” of your journal. Study it tonight and find me a path. I will call you from the edge of the salt the moment the sun is up."
            },
            {
              tag: '🐫', needsSeal: true,   // only when Hermes carries the Seal of Cairn I (not after the river stones were left alone)
              text: 'Those tracks worry me too. No fire tonight, and keep the Seal of Cairn I well hidden.',
              silviaMsg: 'Those tracks worry me too, Hermes. No fire tonight, and keep the Seal of Cairn I well hidden in your satchel.',
              hermesReply: "No fire, then. Cold figs for dinner and the stars for a lamp. The seal is at the very bottom of my satchel, wrapped in my spare shirt, and the satchel is under my head.\n\nWhoever made those tracks is ahead of us, on the same road. We will cross the salt carefully and keep our eyes open. Tomorrow at first light I need a safe way across, Silvia, and that way is on the page “The Salt Playa (Dry Basin)” of your journal. Study it tonight. I will call you from the edge of the salt the moment the sun is up."
            },
            {
              tag: '🗝️',
              text: 'Maybe MIRAGE opens something further on. Keep it like a key, Hermes.',
              silviaMsg: 'Maybe MIRAGE opens something further on, Hermes. Keep it like a key.',
              hermesReply: "Like a key. I have written it on the inside of my hat band, where the sun cannot fade it, next to the bearing of the watchtower.\n\nTomorrow the Salt Playa. The crust is thin in places, and under it there are holes full of brine, dark as ink. I need a safe way across, Silvia, and that way is on the page “The Salt Playa (Dry Basin)” of your journal. Study it tonight and find me a path. I sleep here, by the gate, and at first light I will call you from the edge of the salt."
            }
          ]
        },
        {
          divider: 'First Light · The North Edge',
          hermesInitial: "Good morning, Silvia. The sun is not up yet, but the sky over the salt has already turned pink, and the whole playa glows as if someone had lit it from underneath.\n\nI left the Oasis Gate in the dark and I am standing on the North Edge now, where the old track runs out onto the salt. It is the most beautiful thing I have ever seen, and it frightens me a little. From here the crust looks like one white sheet, polished and perfectly firm, all the way to the Sentinel Mesa on the horizon. But last night I tossed a pebble onto it near the gate, and it went straight through with a sound like a cork leaving a bottle. The brine underneath is black.\n\nThe camel tracks from the gate do not go onto the salt. They swing west and follow the rim. Whoever made them did not dare to cross.\n\nWe are not the first to stand here, though. At the west end of the edge there is an old surveyor's tripod of the Order, its legs bleached white by the salt and a red rag still tied to its head. Someone measured this basin long ago, slab by slab, and I am sure that measurement is the grid on the page “The Salt Playa (Dry Basin)” of your journal. And on the page “Study on the Dry Salt Playa” the Architect left a warning: walk with measured footsteps, because weight without balance always yields to the deep.\n\nSo this is how we will do it. I cannot see a single number on the salt, and the sinkholes look exactly like good crust. You have the grid. Walk me along the edge to the first slab, then choose every step with me. Before each one I will plant my staff and lean my weight on it, slowly, and you tell me when to stop. There will be no letters under my boots: they are on your page. Write each one in your Waypoint Log as I stand on its slab, because your page says the keyword must be transmitted to the Console before the South Shore will open. And beyond the stones lies the Great Salt Sump, where no grid was ever drawn. Keep the page “Study on the Dry Salt Playa” close.",
          choices: [
            {
              tag: '🧭',
              text: 'I have the grid open, Hermes. We begin where the page says, and every step keeps the Law of the Basin.',
              silviaMsg: 'I have the grid open in front of me, Hermes. We begin exactly where the page says, and every step keeps the Law of the Basin: one facet more or one facet less.',
              hermesReply: "One facet more or one less. You read a grid the way I read a sextant, Silvia.\n\nThen I will count the slabs from the tripod as I walk along the edge, and I will not lift a boot until you have checked it on the page. Open the Salt Playa and keep your pencil on the grid: from the moment I step off the edge, it is the only map we have."
            },
            {
              tag: '🤝',
              text: 'Take it slowly, Hermes. If the crust groans, come back. No keyword is worth a fall into the brine.',
              silviaMsg: 'Take it slowly, Hermes. If the crust groans under you, come back to the edge. No keyword is worth a fall into the brine.',
              hermesReply: "Slowly, I promise. I have tied my water skins to my belt with a long cord, so that I can throw them onto a firm slab if I ever need my hands, and I will not take a step until you say so.\n\nOpen the Salt Playa when you are ready. I am waiting on the edge, with my staff in my hand and the tripod at my back."
            },
            {
              tag: '🔭',
              text: 'Look at the tripod first, Hermes. Did the Order leave anything on it?',
              silviaMsg: 'Look at the tripod first, Hermes. Did the Order leave anything on it?',
              hermesReply: "You were right to ask. On its brass head, under a crust of salt, there is a little engraved circle, half black and half white: the sign of the Order. Next to it there is a line of tiny numbers that the salt has eaten away. And the telescope does not point at the mesa. It points straight down into the basin, along one line of slabs. Whoever stood here was surveying the one safe way across.\n\nI cannot read the numbers any more, but you have the page they came from. Open the Salt Playa and we start from the tripod."
            }
          ]
        },
        {
          divider: 'The South Shore · Afternoon',
          hermesInitial: "Silvia, I am sitting on solid sand with my back against a stone of the Order, and my legs are still shaking.\n\nC, R, Y, S, T, A, L. CRYSTAL. The letters were never on the salt: they were on your page all along, and the post of the Order did not open until you sent them. Then the Sump at noon, with no grid at all and a glare that made every plate the same. I was only your eyes down there: you asked, I knelt and looked, and the Study chose. Ridged, dry, cracks in threes, six times over. When I looked back from the shore, the haze had swallowed everything: the Sump, the stones, the tripod, the whole way we came. If we had walked where the salt looked firmest, I would be in the brine.\n\nThe stone behind me is a squat marker, as high as my waist, the kind the Order set at the end of every survey line. On its face, in the small neat hand we know by now: T − A = 9. Two letters of CRYSTAL, and no new one. I think it is a check. Whoever cut it wanted the next traveller to prove their reckoning before trusting it. If the A is already in your Cipher Ledger, see whether the T agrees.\n\nAnd in a niche in its side, wrapped in oiled cloth, there was this: a little brass balance no bigger than my hand, with two pans and a needle, and on its beam the same circle, half black and half white. I think it is how the surveyors weighed out two numbers when all they knew was their sum and their difference. I have drawn it for you in the Cipher Ledger. Lay a sum on one pan and a difference on the other, and see what it teaches you. Your Ledger is full of lines that come in pairs.\n\nThe Nomad Ruins are beyond the dunes, three hours' walk to the south if I keep to the hollows. And Silvia, the camel tracks are back. The riders I saw on the rim, the ones with the spyglass, came all the way around the salt while we crossed it, and their tracks go the same way we do.",
          choices: [
            {
              tag: '⚖️',
              text: 'I will try the balance on the pairs in my Ledger right now. Rest in the shadow of the marker, Hermes.',
              silviaMsg: 'I will try the Surveyor\'s Balance on the pairs in my Cipher Ledger right now, and check T − A = 9. Rest in the shadow of the marker, Hermes.',
              hermesReply: "The marker's shadow is just wide enough for one tired cartographer, and I am taking all of it.\n\nWeigh carefully, Silvia. Every letter you set in the Ledger now is a letter we will not have to fight for later. When I have my breath back, I will walk on through the dunes to the Nomad Ruins and call you when I get there. Three hours, if the sand is kind."
            },
            {
              tag: '💧',
              text: 'How much water do you have left? Drink first, Hermes. The balance can wait a minute.',
              silviaMsg: 'How much water do you have left, Hermes? Drink first. The balance can wait a minute.',
              hermesReply: "Enough, and now a little less, because I did as you said. The salt dries you from the inside, even when you are not thirsty.\n\nThank you for asking before the puzzle, Silvia. When the Ledger is weighed, I will walk on through the dunes to the Nomad Ruins, about three hours south, and call you when I get there."
            },
            {
              tag: '🐫',
              text: 'The tracks again… Keep the balance hidden, and watch the dunes before you go on.',
              silviaMsg: 'The tracks again… Keep the balance hidden in your satchel, Hermes, and watch the dunes for a while before you go on.',
              hermesReply: "Hidden, at the bottom of the satchel. I lay flat on the top of the dune for a long time with my spyglass. Nothing moves out there but the heat. Whoever they are, they are ahead of us, not behind.\n\nI will keep to the hollows between the dunes as far as the Nomad Ruins, three hours south, and call you when I get there. Weigh the Ledger in the meantime, Silvia."
            }
          ]
        },
        {
          divider: 'The Nomad Ruins · Dusk',
          hermesInitial: "Silvia, keep your voice low, even on the wire. I am lying flat behind a broken wall at Camp VII, the old nomad camp in the dunes south of the salt, and there are riders twenty paces from me.\n\nI walked the hollows between the dunes all afternoon, as I promised. The ruins came up out of the sand at sunset: a ring of mud-brick walls, a dry cistern, and three tall stones standing in the middle like people waiting for someone. I had only just reached them when I heard harness bells. The camels from the rim of the salt. They came in at dusk from the west, a dozen riders with scarves over their faces and a heavy wagon with an oilcloth tied over its load, and now they are lighting a fire by the cistern and shouting at each other over the animals.\n\nThey have not seen me. My hat is off, my lantern is out, and the satchel with the balance in it is under my chest.\n\nAnd Silvia, the three stones beside me are steles: tall slabs of sandstone carved all over with words, ten of them, crossing each other like the threads of a net. On the tallest one a bronze dial is set into the rock, with a needle that will not move, and under it, in letters older than the Order, one word: Al-Qibla. A sun compass. The nomads used it to find their way when the dunes moved and every track was gone.\n\nWhen the riders leave, I want to read those stones with you. Open the page “The Desert Lexicon & Al-Qibla” in your journal and keep it ready.",
          choices: [
            {
              tag: '🤫',
              text: 'Stay flat and do not move, Hermes. I have the page open: we read the steles the moment they ride away.',
              silviaMsg: 'Stay flat and do not move, Hermes. I have the page “The Desert Lexicon & Al-Qibla” open in front of me: we read the steles the moment they ride away.',
              hermesReply: "Flat as a lizard, and about as warm. I have been counting their camels to keep calm: eleven, and the wagon.\n\nThey are going now, most of them. Before they left, one of them crouched by the fire and scratched something into the stone of the hearth with the point of his knife, and the others laughed. Then the wagon rolled out south, into the dark, with the riders singing round it.\n\nBut not all of them, Silvia. Two stayed behind with two camels, to watch the trail they came by. One has rolled himself in a blanket by the fire. The other is walking a slow round with a torch, and his round passes the steles. I am ten paces from the middle one, and the moon is up.\n\nOpen the Desert Lexicon, Silvia. Station 12. We read the stones under his nose, quietly."
            },
            {
              tag: '👂',
              text: 'Can you hear what they are saying? Anything about the Astrolabe?',
              silviaMsg: 'Can you hear what they are saying, Hermes? Anything about the Astrolabe?',
              hermesReply: "Bits, over the noise of the camels. They were laughing at the salt. One of them said they had sat on the rim all morning waiting for a fool to fall through it, and that the fool walked across instead. I think the fool was me, Silvia, and I think the one who walked was you.\n\nNot a word about the Astrolabe. But when they rode off south into the dark, the wagon went with them, and its wheels cut deep, as if it carried something very heavy. One of them scratched something into the hearth with his knife before he went.\n\nAnd they left two men behind, Silvia, to watch their back trail: one asleep by the fire, one walking a round with a torch that passes right by the steles. The moon is up. Open the Desert Lexicon, Station 12, and let us read the stones without waking the camp."
            },
            {
              tag: '🐫',
              text: 'Are they the ones who took the Astrolabe? Look at their wagon, Hermes.',
              silviaMsg: 'Are they the ones who took the Astrolabe from the observatory? Look at their wagon, Hermes.',
              hermesReply: "I looked, as long as I dared. Deep iron wheels, like the ruts I followed down from the mountains. And on the oilcloth there is a mark, burned into the canvas, that I could not make out in the dusk. A bird, perhaps, or a flame.\n\nThe wagon is gone now, south, into the dark, and one of them stopped by the fire to scratch something into the hearth with his knife. I will look at it later. Two of them stayed behind with their camels: a sleeper by the fire, and a watcher with a torch who walks round the square, past the steles.\n\nFirst the steles, while the moon is up and his back is turned. Open the Desert Lexicon, Silvia. Station 12."
            }
          ]
        }
      ];
      function chasmWire() {
        try { const w = JSON.parse(localStorage.getItem(CHASM_WIRE_KEY) || '{}'); return w && typeof w === 'object' ? w : {}; } catch (e) { return {}; }
      }
      function saveChasmWire(w) { try { localStorage.setItem(CHASM_WIRE_KEY, JSON.stringify(w)); } catch (e) {} }
      let chasmWirePlaying = false;

      // What was already said, drawn again when the chat opens (after the dawn)
      function appendChasmWireHistory() {
        const w = chasmWire();
        CHASM_WIRE.forEach((d, i) => {
          if (!w['seen' + i] || (chasmWirePlaying && w['reply' + i] === undefined)) return;
          appendWireDivider(d.divider);
          appendWireMessage(getCartographerTitle(), d.hermesInitial, false, false, null, null, { type: 'chasm', step: i });
          const c = d.choices[w['reply' + i]];
          if (!c) return;
          appendWireMessage('SILVIA · NAVIGATOR', c.silviaMsg, false, false, null, null, { type: 'chasm', step: i });
          appendWireMessage(getCartographerTitle(), c.hermesReply, false, false, null, null, { type: 'chasm', step: i });
          if (WIRE_TELEMETRY[i]) appendWireMessage('SYSTEM TELEMETRY', WIRE_TELEMETRY[i], true, false, null, null, { type: 'chasm', step: i });
        });
      }

      // Hermes speaks live, then her replies appear
      function beginChasmWire(i) {
        chasmWirePlaying = true;
        const w = chasmWire();
        w['seen' + i] = true;
        saveChasmWire(w);
        wirePromptBox.style.display = 'none';
        wireCompletedBar.style.display = 'none';
        showTyping(true);
        const token = window.__wireTypewriterToken || 0;
        setTimeout(() => {
          if (token !== (window.__wireTypewriterToken || 0)) return;   // the chat was drawn again: it is in the history
          showTyping(false);
          if (sfx) sfx.playCelestialChime();
          appendWireDivider(CHASM_WIRE[i].divider);
          appendWireMessage(getCartographerTitle(), CHASM_WIRE[i].hermesInitial, false, true, () => {
            chasmWirePlaying = false;
            renderWireChoices();
            updateMessengerBadge();
            scrollChatToActivePrompt(true);
          }, null, { type: 'chasm', step: i });
        }, 900);
      }

      function handleChasmWireChoice(i, idx) {
        const choice = CHASM_WIRE[i].choices[idx];
        if (sfx) sfx.playMechanicalClick();
        wireChoicesGrid.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        appendWireMessage('SILVIA · NAVIGATOR', choice.silviaMsg, false, false, null, null, { type: 'chasm', step: i });
        const w = chasmWire();
        w['reply' + i] = idx;
        saveChasmWire(w);
        if (i === 1) playaMarch.start();   // he sleeps at the Oasis Gate and walks onto the salt at first light
        if (i === 3) lexiconMarch.start();   // he rests in the shadow of the marker, then walks through the dunes to the ruins
        chasmWirePlaying = true;
        wirePromptBox.style.display = 'none';
        showTyping(true);
        const token = window.__wireTypewriterToken || 0;
        setTimeout(() => {
          if (token !== (window.__wireTypewriterToken || 0)) return;   // the chat was drawn again: it is in the history
          showTyping(false);
          if (sfx) sfx.playChimeHover();
          appendWireMessage(getCartographerTitle(), choice.hermesReply, false, true, () => {
            if (WIRE_TELEMETRY[i]) {
              if (sfx) sfx.playCelestialChime();
              appendWireMessage('SYSTEM TELEMETRY', WIRE_TELEMETRY[i], true, false, null, null, { type: 'chasm', step: i });
            }
            chasmWirePlaying = false;
            renderWireChoices();
            scrollChatToActivePrompt(true);
          }, null, { type: 'chasm', step: i });
        }, 700);
      }

      // Its turn in renderWireChoices: true when it drew the prompt (or Hermes is speaking), false to let the bar show
      function chasmWireTurn(i) {
        if (chasmWirePlaying) {
          wirePromptBox.style.display = 'none';
          wireCompletedBar.style.display = 'none';
          return true;
        }
        const w = chasmWire();
        const header = document.getElementById('wire-prompt-header-text');
        if (!w['seen' + i]) {
          const gameModal = document.getElementById(i >= 4 ? 'modal-desert-lexicon' : i >= 2 ? 'modal-salt-playa' : 'modal-whispering-chasm');
          if (document.body.getAttribute('data-active-view') !== 'view-field-wire' || (gameModal && gameModal.style.display !== 'none' && gameModal.style.display !== '')) {
            if (getMessengerUnreadCount() < 1) setMessengerUnreadCount(1);   // Hermes has something to say
            return false;
          }
          beginChasmWire(i);
          return true;
        }
        if (w['reply' + i] === undefined) {
          wirePromptBox.style.display = 'block';
          wireCompletedBar.style.display = 'none';
          wireChoicesGrid.innerHTML = '';
          if (header) header.textContent = 'Choose your reply';
          const hasSeal = localStorage.getItem('order_seal_cairn_1') === 'true' || localStorage.getItem('order_cairn1_completed') === 'true';
          CHASM_WIRE[i].choices.forEach((c, idx) => {
            if (c.needsSeal && !hasSeal) return;
            wireChoicesGrid.appendChild(makeChoicePill(c.tag, formatJournalCallouts(c.text), () => handleChasmWireChoice(i, idx)));
          });
          return true;
        }
        if (i === 0) {
          wirePromptBox.style.display = 'block';
          wireCompletedBar.style.display = 'none';
          wireChoicesGrid.innerHTML = '';
          if (header) header.textContent = 'Hermes is waiting at the North Portal:';
          wireChoicesGrid.appendChild(makeChoicePill('🧭', 'Walk into the Whispering Chasm with Hermes (Station 10)', () => {
            if (typeof window.openWhisperingChasmModal === 'function') window.openWhisperingChasmModal();
          }));
          return true;
        }
        if (i === 2) {
          wirePromptBox.style.display = 'block';
          wireCompletedBar.style.display = 'none';
          wireChoicesGrid.innerHTML = '';
          if (header) header.textContent = 'Hermes is waiting on the North Edge of the salt:';
          wireChoicesGrid.appendChild(makeChoicePill('🧂', 'Step onto the Salt Playa with Hermes (Station 11)', () => {
            if (typeof window.openSaltPlayaModal === 'function') window.openSaltPlayaModal();
          }));
          return true;
        }
        if (i === 4) {
          wirePromptBox.style.display = 'block';
          wireCompletedBar.style.display = 'none';
          wireChoicesGrid.innerHTML = '';
          if (header) header.textContent = 'Hermes is waiting by the steles of the Nomad Ruins:';
          wireChoicesGrid.appendChild(makeChoicePill('📜', 'Read the steles with Hermes (Station 12)', () => {
            if (typeof window.openDesertLexiconModal === 'function') window.openDesertLexiconModal();
          }));
          return true;
        }
        return false;
      }

      // Out of the canyon: the Oasis Gate waits on the wire (a badge while the chat is closed)
      // and back from the canyon with the chat already open, Hermes speaks there and then
      ['chasm:cleared', 'chasm:closed', 'playa:cleared', 'playa:closed', 'lexicon:cleared', 'lexicon:closed'].forEach((ev) => document.addEventListener(ev, () => { if (wireCurrentStep === 4 && !chasmWirePlaying) renderWireChoices(); }));

      function rewindToChasmWire(step) {
        if (sfx && typeof sfx.playMechanicalClick === 'function') sfx.playMechanicalClick();
        window.__wireTypewriterToken = (window.__wireTypewriterToken || 0) + 1;
        showTyping(false);
        chasmWirePlaying = false;
        const w = chasmWire();
        for (let i = step; i < CHASM_WIRE.length; i++) { delete w['seen' + i]; delete w['reply' + i]; }
        saveChasmWire(w);
        if (step <= 1) ['order_playa_march_start', 'order_playa_march_bypassed'].forEach((k) => localStorage.removeItem(k));
        renderWireExpedition();
        markMessengerAsRead();
      }

      function scrollChatToActivePrompt(smooth = false) {
        const doScroll = () => {
          const promptBox = document.getElementById('wire-prompt-box');
          const completedBar = document.getElementById('wire-completed-bar');
          const activeDeck = (promptBox && promptBox.style.display !== 'none')
            ? promptBox
            : ((completedBar && completedBar.style.display !== 'none') ? completedBar : null);

          const target = activeDeck || (wireMessagesStream ? wireMessagesStream.lastElementChild : null);
          if (target) {
            target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
          }
        };
        doScroll();
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            doScroll();
            setTimeout(doScroll, 80);
            setTimeout(doScroll, 220);
            setTimeout(doScroll, 450);
          });
        } else {
          setTimeout(doScroll, 80);
          setTimeout(doScroll, 250);
        }
      }
      window.scrollChatToActivePrompt = scrollChatToActivePrompt;

      function renderWireExpedition() {
        // Drawn again while Hermes was still speaking at the North Portal or the Oasis Gate: his words are saved, so they
        // come back whole with the history and her replies follow (the interrupted typing stops with the new token)
        if (chasmWirePlaying) { chasmWirePlaying = false; window.__wireTypewriterToken = (window.__wireTypewriterToken || 0) + 1; }
        if (typeof syncSilviaWaypointBaseline === 'function') syncSilviaWaypointBaseline();
        try {
          const savedStep = localStorage.getItem('order_field_wire_step');
          if (savedStep !== null) wireCurrentStep = parseInt(savedStep, 10);
          const savedHistory = localStorage.getItem('order_field_wire_choices');
          if (savedHistory) {
            const parsed = JSON.parse(savedHistory);
            if (Array.isArray(parsed)) wireHistory = parsed;
          }
          const savedDawn = localStorage.getItem('order_dawn_step');
          if (savedDawn !== null) dawnStep = Math.max(0, Math.min(DAWN_DONE, parseInt(savedDawn, 10) || 0));
          const savedDawnChoices = localStorage.getItem('order_dawn_choices');
          if (savedDawnChoices) {
            const parsedDawn = JSON.parse(savedDawnChoices);
            if (Array.isArray(parsedDawn)) dawnHistory = parsedDawn;
          }
        } catch(e) {}

        if (!wireMessagesStream) return;
        wireMessagesStream.classList.add('is-restoring');
        let dawnFinalePlaying = false;
        wireMessagesStream.innerHTML = `
          <div class="messenger-date-pill">Today · The Desert Frontier (112° E)</div>
        `;

        // 0. Render protocol warning banner
        const banner = document.createElement('div');
        banner.className = 'chat-protocol-banner';
        banner.id = 'chat-protocol-banner';
        banner.innerHTML = `
          <div class="cpb-header">
            <span class="cpb-badge">✦ TELEGRAPH PROTOCOL NOTICE // VINCULUM ELECTRUM ✦</span>
          </div>
          <p class="cpb-text">
            Every transmission on this wire carries real consequences. The replies and paths chosen by the Navigator will directly alter the Cartographer's decisions, his trust, the recorded field notes, and how he addresses you across the desert. Choose with care.
          </p>
          <div class="cpb-status-line">
            <span>CARRIER: LOCKED</span>
            <span class="cpb-sep">·</span>
            <span>BRANCHING: ACTIVE</span>
            <span class="cpb-sep">·</span>
            <span>TIMELINE: OCT 2026</span>
          </div>
        `;
        wireMessagesStream.appendChild(banner);

        // Check if name was previously chosen in history or saved in session
        if (wireHistory[1] !== undefined && EXPEDITION_THREAD[1] && EXPEDITION_THREAD[1].choices[wireHistory[1]]) {
          const chosenName = EXPEDITION_THREAD[1].choices[wireHistory[1]].nameTitle;
          if (chosenName) setCartographerTitle(chosenName);
        } else if (localStorage.getItem('order_cartographer_title')) {
          setCartographerTitle(localStorage.getItem('order_cartographer_title'));
        } else {
          updateHeaderContactName('');
        }

        // Check if item was previously chosen in history
        if (wireHistory[2] !== undefined && EXPEDITION_THREAD[2] && EXPEDITION_THREAD[2].choices[wireHistory[2]]) {
          const chosenItem = EXPEDITION_THREAD[2].choices[wireHistory[2]].item;
          if (chosenItem) setSatchelExpeditionItem(chosenItem);
        }

        // 1. Initial opening transmission
        appendWireMessage(getCartographerTitle(), EXPEDITION_THREAD[0].hermesInitial, false, false, null, null, { type: 'expedition', step: 0 });

        // 2. Render previous conversation steps from history
        for (let s = 0; s < wireCurrentStep; s++) {
          const stepData = EXPEDITION_THREAD[s];
          if (!stepData) continue;
          if (!WIRE_FINAL_TELEMETRY[s]) appendLetterNotes(s);   // a final step answers them after its telemetry
          if (s === 4) {
            appendWireMessage(getCartographerTitle(), getHermesFinalForWatchtower(), false, false, null, null, { type: 'expedition', step: 4 });
            appendWireMessage('SYSTEM TELEMETRY', '✦ WAYPOINT SECURED · OUTER WATCHTOWER VI [112° E] · DESERT THRESHOLD REACHED ✦', true, false, null, null, { type: 'expedition', step: 4 });
            appendDawnHistory();
            if (EXPEDITION_THREAD[5] && EXPEDITION_THREAD[5].hermesInitial && wireCurrentStep >= 5) {
              appendStepIntro(5);
            }
          }
          if (s === 6) {
            appendWireMessage(getCartographerTitle(), EXPEDITION_THREAD[6].hermesFinal, false, false, null, null, { type: 'expedition', step: 6 });
            appendWireMessage('SYSTEM TELEMETRY', '✦ AL-QIBLA LOCKED [RAIDERS 194° SSW · TOWER II 14° NNE] · DESERT SIGIL VERIFIED [PHOENIX] · CLEPSYDRA TRAIL UNLOCKED ✦', true, false, null, null, { type: 'expedition', step: 6 });
            if (EXPEDITION_THREAD[7] && EXPEDITION_THREAD[7].hermesInitial && wireCurrentStep >= 7) {
              appendStepIntro(7);
            }
          }
          if (WIRE_FINAL_TELEMETRY[s]) {
            appendStepFinal(s);
            if (wireCurrentStep >= s + 1) appendStepIntro(s + 1);
          }
          if (stepData.choices) {
            const choiceIdx = (wireHistory[s] !== undefined && stepData.choices[wireHistory[s]]) ? wireHistory[s] : 0;
            const choice = stepData.choices[choiceIdx];
            if (choice) {
              if (s === 1 && choice.nameTitle) {
                setCartographerTitle(choice.nameTitle);
              }
              if (s === 2 && choice.item) {
                setSatchelExpeditionItem(choice.item);
              }
              appendWireMessage('SILVIA · NAVIGATOR', choice.silviaMsg, false, false, null, null, { type: 'expedition', step: s });
              if (choice.beats && choice.beats.length === 3) {
                appendWireMessage(getCartographerTitle(), choice.beats[0], false, false, null, null, { type: 'expedition', step: s });
                appendWireMessage(getCartographerTitle(), choice.beats[1], false, false, null, null, { type: 'expedition', step: s });
                appendWireMessage(getCartographerTitle(), choice.beats[2], false, false, null, null, { type: 'expedition', step: s });
              } else if (choice.hermesReply) {
                appendWireMessage(getCartographerTitle(), choice.hermesReply, false, false, null, null, { type: 'expedition', step: s });
              }
            }
          }
        }

        // 3. If reached completion step
        if (wireCurrentStep === 4) {
          appendWireMessage(getCartographerTitle(), getHermesFinalForWatchtower(), false, false, null, null, { type: 'expedition', step: 4 });
          appendWireMessage('SYSTEM TELEMETRY', '✦ WAYPOINT SECURED · OUTER WATCHTOWER VI [112° E] · DESERT THRESHOLD REACHED ✦', true, false, null, null, { type: 'expedition', step: 4 });
          dawnFinalePlaying = appendDawnHistory();
        } else if (wireCurrentStep === 6) {
          appendWireMessage(getCartographerTitle(), EXPEDITION_THREAD[6].hermesFinal, false, false, null, null, { type: 'expedition', step: 6 });
          appendWireMessage('SYSTEM TELEMETRY', '✦ AL-QIBLA LOCKED [RAIDERS 194° SSW · TOWER II 14° NNE] · DESERT SIGIL VERIFIED [PHOENIX] · CLEPSYDRA TRAIL UNLOCKED ✦', true, false, null, null, { type: 'expedition', step: 6 });
        } else if (WIRE_FINAL_TELEMETRY[Math.min(wireCurrentStep, WIRE_LAST_STEP)]) {
          appendStepFinal(Math.min(wireCurrentStep, WIRE_LAST_STEP));
        }
        if (!WIRE_FINAL_TELEMETRY[wireCurrentStep]) appendLetterNotes(wireCurrentStep);

        wireMessagesStream.classList.remove('is-restoring');
        if (!dawnFinalePlaying) {
          renderWireChoices();
          scrollChatToActivePrompt(false);
        }
      }

      function renderWireChoices() {
        if (!wireChoicesGrid || !wirePromptBox || !wireCompletedBar) return;

        const promptHeader = document.getElementById('wire-prompt-header-text');
        if (promptHeader) promptHeader.textContent = 'Choose your reply';
        if (typeof window.updateSatchelVisibility === 'function') window.updateSatchelVisibility();

        const isChasmDone = localStorage.getItem('order_whispering_chasm_completed') === 'true';
        const isLexiconDone = localStorage.getItem('order_desert_lexicon_completed') === 'true';
        const isClepsydraDone = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';
        const isPlayaDone = localStorage.getItem('order_salt_playa_completed') === 'true';

        // Steps 8–24: the gates of Tower II (9), the crossing to the Sun Monolith (10), the Station 14 debrief (11),
        // first light at the Monolith (13), the walk down to the labyrinth (14), the Station 15 debrief (15),
        // dusk at the hardpan (17), the crossing to Cairn IV (18), the Station 16 debrief (19),
        // dusk at Cairn IV (21), the walk to the Arch (22), the Station 17 debrief (23) and the end of this leg (24)
        const showWaypointBar = (title, desc, persistStep) => {
          wirePromptBox.style.display = 'none';
          wireCompletedBar.style.display = 'flex';
          const titleEl = wireCompletedBar.querySelector('.messenger-waypoint-title');
          const descEl = wireCompletedBar.querySelector('.messenger-waypoint-desc');
          if (titleEl) titleEl.textContent = title;
          if (descEl) descEl.textContent = desc;
          try {
            localStorage.setItem('order_field_wire_completed', 'true');
            localStorage.setItem('order_field_wire_step', String(persistStep));
          } catch (e) {}
          return descEl;
        };
        // Steps 10, 14, 18 and 22: Hermes walks to the next station. The trek bar shows the countdown (refreshed every 30 s),
        // then the arrival bar stays until the station is solved. Returns true while that leg is not finished.
        const showMarchLeg = (leg) => {
          leg.march.start();   // a save that stands here without a start time (e.g. after a tester replay) sets out now
          if (leg.campedTitle && leg.march.camped()) {
            showWaypointBar(leg.campedTitle, leg.campedDesc, leg.step);
            return true;
          }
          if (!leg.march.over()) {
            const descEl = showWaypointBar(leg.walkingTitle, '', leg.step);
            const updateTrek = () => {
              const arrived = leg.march.over() || leg.march.camped();
              if (!wireCompletedBar || wireCompletedBar.style.display === 'none' || arrived) {
                if (window.__wireMarchTimer) { clearInterval(window.__wireMarchTimer); window.__wireMarchTimer = null; }
                if (arrived) renderWireChoices();
                return;
              }
              if (!descEl) return;
              descEl.innerHTML = leg.walkingDesc
                + '<div style="margin-top:6px; color:#fde68a; font-family:\'Cinzel\',serif; font-size:0.84rem; letter-spacing:0.05em;">⏱️ ' + leg.etaLabel + ' IN ' + leg.march.eta().toUpperCase() + '</div>'
                + (isCarlesTester() ? '<div style="margin-top:8px;"><button type="button" class="btn-admin-skip-march" style="padding:4px 12px; background:rgba(251,191,36,0.18); border:1px solid #fbbf24; border-radius:4px; color:#fde68a; font-family:\'Cinzel\',serif; cursor:pointer;">⏩ Tester: skip the walk</button></div>' : '');
              const skipBtn = descEl.querySelector('.btn-admin-skip-march');
              if (skipBtn) skipBtn.onclick = (e) => { e.stopPropagation(); leg.march.skip(); };
              if (leg.cinematic && window.EclipseCinematic) window.EclipseCinematic.attach(descEl, leg.cinematic);
            };
            updateTrek();
            if (window.__wireMarchTimer) clearInterval(window.__wireMarchTimer);
            window.__wireMarchTimer = setInterval(updateTrek, 30000);
            return true;
          }
          if (localStorage.getItem(leg.doneKey) !== 'true') {
            showWaypointBar(leg.arrivedTitle, leg.arrivedDesc, leg.step);
            return true;
          }
          return false;
        };
        const advanceTo = (step) => {
          wireCurrentStep = step;
          try { localStorage.setItem('order_field_wire_step', String(step)); } catch (e) {}
          appendStepIntro(step);
        };

        // The door of the next room of Tower III waits for its pause (hub/js/stage-pause.js), then for the seal on its
        // sheet (hub/js/sheet-seals.js). The bar says which, and the chat looks again every half minute.
        const roomDoor = (node) => ({
          wait: window.EclipseStagePause ? window.EclipseStagePause.opensIn(node) : '',
          face: window.EclipseSheetSeals ? window.EclipseSheetSeals.missing(node) : ''
        });
        const holdForDoor = (node, title, room, step) => {
          const door = roomDoor(node);
          if (!door.wait && !door.face) return false;
          showWaypointBar(title, 'Next: ' + room + '. ' + (door.wait ? 'Its door opens in ' + door.wait + '.' : 'Its door opens with the seal printed on ' + (window.EclipseSheetSeals && window.EclipseSheetSeals.page ? window.EclipseSheetSeals.page(node) : 'its page in your journal') + '.'), step);
          if (window.__wireDoorTimer) clearInterval(window.__wireDoorTimer);
          window.__wireDoorTimer = setInterval(() => {
            const d = roomDoor(node);
            if (!wireCompletedBar || wireCompletedBar.style.display === 'none' || (!d.wait && !d.face)) {
              clearInterval(window.__wireDoorTimer); window.__wireDoorTimer = null;
              if (!d.wait && !d.face) renderWireChoices();
            }
          }, 30000);
          return true;
        };
        if (wireCurrentStep === 36) {
          if (holdForDoor(41, 'Fragment I Is Set · 1 of 9', 'The Camera Obscura (Station 21)', 36)) return;
          advanceTo(37);   // the candles have burned down: the stair to the dark room
        }
        if (wireCurrentStep === 38) {
          if (localStorage.getItem('order_camera_obscura_completed') !== 'true') {
            showWaypointBar('The Camera Obscura · Station 21 Awaits', 'Open Path III on the Quest Map and help Hermes read the city on the wall. Keep the page “The Camera Obscura” close.', 38);
            return;
          }
          advanceTo(39);   // Station 21 solved: the narrow house, the warm ashes and Fragment II
        }
        if (wireCurrentStep === 40) {
          if (holdForDoor(42, 'Fragment II Is Set · 2 of 9', 'The Whispering Gallery (Station 22)', 40)) return;
          advanceTo(41);   // the hearth has gone out: the second stair, down to the whispers
        }
        if (wireCurrentStep === 42) {
          if (localStorage.getItem('order_whispering_gallery_completed') !== 'true') {
            showWaypointBar('The Whispering Gallery · Station 22 Awaits', 'Open Path III on the Quest Map and stand with Hermes in the gallery. Keep the page “The Whispering Gallery” and a ruler close.', 42);
            return;
          }
          advanceTo(43);   // Station 22 solved: the words of the Ashes, the mirrored tune and Fragment III
        }
        if (wireCurrentStep >= WIRE_LAST_STEP) {
          if (!holdForDoor(43, 'Fragment III Is Set · 3 of 9', 'The Automaton Orchestra (Station 23)', WIRE_LAST_STEP)) {
            showWaypointBar('Fragment III Is Set · 3 of 9', 'Next: The Automaton Orchestra (Station 23). The Mirror Speaker has not opened that room yet.', WIRE_LAST_STEP);
          }
          return;
        }
        if (wireCurrentStep === 8) {
          // The Four Wells are behind him: Hermes reaches the gates of Tower II (Sheet 13A)
          rememberGateSeal();
          advanceTo(9);
        }
        if (wireCurrentStep === 10) {
          if (showMarchLeg(MARCH_LEGS[10])) return;
          advanceTo(11);   // Station 14 solved: the debrief (and the blue on the rim of the niche)
        }
        if (wireCurrentStep === 12) {
          advanceTo(13);   // first light at the Sun Monolith, before the walk down to the labyrinth
        }
        if (wireCurrentStep === 14) {
          if (showMarchLeg(MARCH_LEGS[14])) return;
          advanceTo(15);   // Station 15 solved: the raiders' camp and the gold star
        }
        if (wireCurrentStep === 16) {
          advanceTo(17);   // dusk at the edge of the hardpan: the shepherd and the veiled woman
        }
        if (wireCurrentStep === 18) {
          if (showMarchLeg(MARCH_LEGS[18])) return;
          advanceTo(19);   // Station 16 solved: the song, the pebble and the raiders splitting up
        }
        if (wireCurrentStep === 20) {
          advanceTo(21);   // dusk at Cairn IV: the October sun and the midsummer courtyard
        }
        if (wireCurrentStep === 22) {
          if (showMarchLeg(MARCH_LEGS[22])) return;
          if (localStorage.getItem(ALTAR_SEALS_KEY) === null) {
            try { localStorage.setItem(ALTAR_SEALS_KEY, String(countCairnSeals())); } catch (e) {}
          }
          advanceTo(23);   // Station 17 solved: the light that answered, and the smoke over Tower II
        }
        if (wireCurrentStep === 24) {
          advanceTo(25);   // noon under the Arch: the smoke over Tower II and the walk toward it
        }
        if (wireCurrentStep === 26) {
          if (showMarchLeg(MARCH_LEGS[26])) return;
          if (localStorage.getItem(WELL_SEALS_KEY) === null) {
            try { localStorage.setItem(WELL_SEALS_KEY, String(countCairnSeals())); } catch (e) {}
          }
          advanceTo(27);   // Station 18 solved: the Servant by the well, and what he said about the light
        }
        if (wireCurrentStep === 28) {
          // 'She receives no one until the five seals are home': without Cairn I the audience waits
          if (countCairnSeals() < 5) {
            showWaypointBar('The Servant Is Safe · Seals ' + countCairnSeals() + ' / 5', 'The Oracle receives no one until the five seals are home. The first still sleeps by the dry wash: open Station 19 on the Grand Desert Map, and the Servant will show you the way back to Cairn I.', 28);
            return;
          }
          advanceTo(29);   // dawn at the inner stair of Tower II
        }
        if (wireCurrentStep === 30) {
          if (showMarchLeg(MARCH_LEGS[30])) return;
          advanceTo(31);   // Station 19 solved: Aurelia, the WHEN, and the raiders gone east
        }
        if (wireCurrentStep === 32) {
          advanceTo(33);   // the Stage Path begins: the morning of departure, the letter and the new sheets
        }
        if (wireCurrentStep === 34) {
          if (showMarchLeg(MARCH_LEGS[34])) return;
          advanceTo(35);   // Station 20 solved: inside the gate, Fragment I and the note sealed with ash
        }

        if (wireCurrentStep === 6) {
          if (!isClepsydraDone) {
            wirePromptBox.style.display = 'none';
            wireCompletedBar.style.display = 'flex';
            const titleEl = wireCompletedBar.querySelector('.messenger-waypoint-title');
            const descEl = wireCompletedBar.querySelector('.messenger-waypoint-desc');
            const resting = window.isNextAdventureHeld && window.isNextAdventureHeld();
            if (titleEl) titleEl.textContent = resting ? 'Camp VII · Resting Until the Road Opens' : 'Al-Qibla Bearing Locked · The Four Wells Await';
            if (descEl) descEl.textContent = resting
              ? 'Hermes is asleep by the cold hearth, with the needle of Al-Qibla pointing the way the raiders rode. The next stretch of the road is not open yet: he will call you on the Field Wire the moment it is.'
              : 'Open the Grand Desert Map and help Hermes at the Four Wells of Camp VIII (Station 13, the page “The Oasis Clepsydra”).';
            try {
              localStorage.setItem('order_field_wire_completed', 'true');
              localStorage.setItem('order_field_wire_step', '6');
            } catch(e) {}
            return;
          } else {
            // Clepsydra is completed! Advance to Step 7 (the Camp VIII debrief)
            wireCurrentStep = 7;
            try {
              localStorage.setItem('order_field_wire_step', '7');
            } catch(e) {}
            if (EXPEDITION_THREAD[7] && EXPEDITION_THREAD[7].hermesInitial) {
              appendStepIntro(7);
            }
          }
        }

        if (wireCurrentStep === 4 && !isChasmDone && !isDawnDone()) {
          if (dawnStep >= 1 && !isStormOver()) {
            wirePromptBox.style.display = 'none';
            wireCompletedBar.style.display = 'none';
            renderShelterStormWaitBox();
            return;
          }
          removeShelterStormWaitBox();
          // The dawn after the storm: the Great Silence, the dry river and Cairn I
          renderDawnPrompt();
          return;
        }

        if (wireCurrentStep === 4) {
          if (!isChasmDone && isChasmMarchOver() && chasmWireTurn(0)) return;
          if (isChasmDone && !isPlayaDone && !isLexiconDone && chasmWireTurn(1)) return;
          if (isChasmDone && !isPlayaDone && !isLexiconDone && chasmWire().reply1 !== undefined && playaMarch.over() && chasmWireTurn(2)) return;
          if (isPlayaDone && !isLexiconDone && chasmWire().reply2 !== undefined && chasmWireTurn(3)) return;
          // her answer on the south shore sends him through the dunes; at the ruins, at dusk, he calls again
          if (isPlayaDone && !isLexiconDone && chasmWire().reply3 !== undefined) {
            if (!lexiconMarch.over()) { showMarchLeg(LEXICON_LEG); return; }
            if (chasmWireTurn(4)) return;
          }
          if (!isChasmDone) {
            wirePromptBox.style.display = 'none';
            wireCompletedBar.style.display = 'flex';
            const titleEl = wireCompletedBar.querySelector('.messenger-waypoint-title');
            const descEl = wireCompletedBar.querySelector('.messenger-waypoint-desc');
            const isBypassed = localStorage.getItem('order_cairn1_bypassed') === 'true';
            const marchOver = isChasmMarchOver();

            if (!marchOver) {
              if (titleEl) {
                titleEl.textContent = isBypassed
                  ? '✦ Western Shelf Trek in Progress · Heading to North Portal ✦'
                  : '✦ 26-Hour Trek in Progress · Heading to North Portal ✦';
              }
              const updateTrekTimer = () => {
                if (!wireCompletedBar || wireCompletedBar.style.display === 'none' || isChasmMarchOver()) {
                  if (window.__chasmMarchTimer) {
                    clearInterval(window.__chasmMarchTimer);
                    window.__chasmMarchTimer = null;
                  }
                  if (isChasmMarchOver()) renderWireChoices();
                  return;
                }
                if (window.isChasmCamped()) {
                  if (titleEl) titleEl.textContent = '✦ Camp in Sight of the North Portal ✦';
                  if (descEl) descEl.textContent = 'Hermes has reached the great red wall and made camp in sight of the North Portal. He is resting before the descent and will call you on the Field Wire when he is ready to go in. Meanwhile, study the page “The Whispering Chasm” of your journal.';
                  return;
                }
                const start = parseInt(localStorage.getItem('order_chasm_march_start') || '0', 10);
                const elapsed = start ? Date.now() - start : 0;
                const remMs = Math.max(0, CHASM_MARCH_MS - elapsed);
                const hrs = Math.floor(remMs / 3600000);
                const mins = Math.floor((remMs % 3600000) / 60000);
                const secs = Math.floor((remMs % 60000) / 1000);
                const timeStr = `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
                const routeText = isBypassed
                  ? 'Hermes left the river stones untouched in the wash and is traversing the western rock shelf directly toward the canyon.'
                  : 'The Seal of Cairn I is secured in Hermes\' satchel. He is trekking across the dry wash and scree slopes toward the Whispering Chasm.';
                const isTester = (typeof isCarlesTester === 'function' && isCarlesTester()) || (typeof window.isAdminTester === 'function' && window.isAdminTester());
                const testerBtn = isTester
                  ? `<div style="margin-top:8px;"><button type="button" id="btn-admin-skip-march" style="padding:4px 12px; background:rgba(251,191,36,0.18); border:1px solid #fbbf24; border-radius:4px; color:#fde68a; font-family:'Cinzel',serif; font-size:0.68rem; letter-spacing:0.06em; cursor:pointer; text-transform:uppercase;">⚡ Carles Tester: Skip 26h Trek ➔</button></div>`
                  : '';
                if (descEl) {
                  descEl.innerHTML = `
                    ${routeText}
                    <div style="margin-top:6px; color:#fde68a; font-family:'Cinzel',serif; font-size:0.84rem; letter-spacing:0.05em;">
                      ⏱️ TREK ETA: ${timeStr} remaining until arrival at North Portal
                    </div>
                    <div style="margin-top:6px;">Meanwhile, study the canyon from above on the page “The Whispering Chasm” of your journal.</div>
                    ${testerBtn}
                  `;
                  const skipBtn = descEl.querySelector('#btn-admin-skip-march');
                  if (skipBtn) {
                    skipBtn.onclick = (e) => {
                      e.stopPropagation();
                      skipChasmMarch();
                    };
                  }
                }
              };
              updateTrekTimer();
              if (window.__chasmMarchTimer) clearInterval(window.__chasmMarchTimer);
              window.__chasmMarchTimer = setInterval(updateTrekTimer, 1000);
            } else {
              if (window.__chasmMarchTimer) {
                clearInterval(window.__chasmMarchTimer);
                window.__chasmMarchTimer = null;
              }
              if (titleEl) titleEl.textContent = 'North Portal Reached · The Whispering Chasm Awaits';
              if (descEl) {
                descEl.textContent = (isBypassed
                  ? 'Hermes crossed the western rock shelf and is standing at the mouth of the canyon. '
                  : 'The Seal of Cairn I is safe in his satchel, and Hermes is standing at the mouth of the canyon. ')
                  + 'His three water skins are full and his lantern is lit. Open the Grand Desert Map, choose the Whispering Chasm (Station 10), and walk it with him. Keep the page “The Whispering Chasm” of your journal in front of you.';
              }
            }
            try {
              localStorage.setItem('order_field_wire_completed', 'true');
              localStorage.setItem('order_field_wire_step', '4');
            } catch(e) {}
            return;
          } else if (!isPlayaDone && !isLexiconDone) {
            // Until Silvia answers him at the Oasis Gate, Hermes has not lain down yet: the night starts with her reply
            if (chasmWire().reply1 === undefined) {
              showWaypointBar('Out of the Gorge · Hermes Is Calling', 'Hermes is calling you from the Oasis Gate. Keep the Field Wire open to hear him.', 4);
              return;
            }
            showMarchLeg(PLAYA_LEG);
            return;
          } else if (!isLexiconDone) {
            wirePromptBox.style.display = 'none';
            wireCompletedBar.style.display = 'flex';
            const titleEl = wireCompletedBar.querySelector('.messenger-waypoint-title');
            const descEl = wireCompletedBar.querySelector('.messenger-waypoint-desc');
            if (titleEl) titleEl.textContent = 'Salt Playa Crossed · The Nomad Ruins Await';
            if (descEl) descEl.textContent = 'Open the Grand Desert Map and help Hermes read the stelae of the Nomad Ruins (Station 12, the page “The Desert Lexicon & Al-Qibla”).';
            try {
              localStorage.setItem('order_field_wire_completed', 'true');
              localStorage.setItem('order_field_wire_step', '4');
            } catch(e) {}
            return;
          } else {
            // Chasm, Salt Playa and Lexicon are done: unlock Step 5 (the Camp VII debrief)
            wireCurrentStep = 5;
            try {
              localStorage.setItem('order_field_wire_step', '5');
            } catch(e) {}
            if (EXPEDITION_THREAD[5] && EXPEDITION_THREAD[5].hermesInitial) {
              appendStepIntro(5);
            }
          }
        }

        const currentData = EXPEDITION_THREAD[wireCurrentStep];
        if (!currentData || !currentData.choices) {
          wirePromptBox.style.display = 'none';
          wireCompletedBar.style.display = 'flex';
          return;
        }

        wirePromptBox.style.display = 'block';
        wireCompletedBar.style.display = 'none';
        wireChoicesGrid.innerHTML = '';

        if (currentData.isCompassInput) {
          if (promptHeader) promptHeader.textContent = 'Choose your reply';
          const consoleEl = document.createElement('div');
          consoleEl.className = 'telegraph-compass-console';
          consoleEl.id = 'wire-compass-console';
          consoleEl.innerHTML = `
            <div class="tcc-header">
              <span class="tcc-badge">✦ COPPER BENCHMARK PLATE // WATCHTOWER VI ✦</span>
              <span class="tcc-ref">1998 SURVEY NOTES</span>
            </div>
            <p class="tcc-desc">
              Consult <span class="journal-ref-pill" role="button" tabindex="0" data-sheet="7B" title="Open details for the page Field Log: The Desert Frontier"><span class="pill-icon">📖</span> Field Log: The Desert Frontier</span> in your physical journal. Enter the stamped heading below to guide Hermes through the dust:
            </p>
            <div class="tcc-fields-row">
              <div class="tcc-field-group">
                <label class="tcc-label" for="wire-compass-deg">Bearing (Degrees)</label>
                <div class="tcc-input-wrap">
                  <input type="text" id="wire-compass-deg" class="tcc-input tcc-input-deg" placeholder="" maxlength="4" autocomplete="off" inputmode="numeric" aria-label="Bearing in degrees">
                  <span class="tcc-deg-symbol">°</span>
                </div>
              </div>
              <div class="tcc-field-group">
                <label class="tcc-label" for="wire-compass-dir">Cardinal Direction</label>
                <div class="tcc-input-wrap">
                  <input type="text" id="wire-compass-dir" class="tcc-input tcc-input-dir" placeholder="" maxlength="12" autocomplete="off" aria-label="Cardinal direction">
                </div>
              </div>
              <button type="button" id="btn-wire-transmit-bearing" class="btn-tcc-transmit">
                <span>🧭</span>
                <span>TRANSMIT HEADING ➔</span>
              </button>
            </div>
            <div class="tcc-feedback" id="wire-compass-feedback"></div>
          `;
          wireChoicesGrid.appendChild(consoleEl);

          const degInput = consoleEl.querySelector('#wire-compass-deg');
          const dirInput = consoleEl.querySelector('#wire-compass-dir');
          const submitBtn = consoleEl.querySelector('#btn-wire-transmit-bearing');
          const feedback = consoleEl.querySelector('#wire-compass-feedback');

          function showFeedback(msg) {
            if (!feedback) return;
            feedback.textContent = '⚠️ ' + msg;
            feedback.style.display = 'block';
            feedback.classList.remove('shake-anim');
            void feedback.offsetWidth;
            feedback.classList.add('shake-anim');
          }

          function triggerSubmit() {
            const rawDeg = (degInput ? degInput.value : '').trim();
            const rawDir = (dirInput ? dirInput.value : '').trim();

            if (!rawDeg && !rawDir) {
              showFeedback('Please enter the degrees and cardinal heading recorded on the page “Field Log: The Desert Frontier”.');
              return;
            }

            const combined = (rawDeg + ' ' + rawDir).trim().toUpperCase();
            const has112 = /\b112\b/.test(combined);
            const hasEast = /\b(E|EAST|ESTE|ORIENTE)\b/.test(combined.replace(/°/g, ' '));

            if (has112 && hasEast) {
              if (sfx && typeof sfx.playCelestialChime === 'function') sfx.playCelestialChime();
              if (degInput) degInput.disabled = true;
              if (dirInput) dirInput.disabled = true;
              if (submitBtn) submitBtn.disabled = true;
              if (feedback) feedback.style.display = 'none';

              handleWireChoiceSelection(currentData.choices[0], 0);
            } else {
              if (sfx && typeof sfx.playMechanicalClick === 'function') sfx.playMechanicalClick();
              showFeedback('That heading does not align with the trail. Check the stamped copper plate for Watchtower VI on the page “Field Log: The Desert Frontier”.');
            }
          }

          submitBtn.addEventListener('click', triggerSubmit);
          [degInput, dirInput].forEach(inp => {
            if (!inp) return;
            inp.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                triggerSubmit();
              }
            });
          });

          setTimeout(() => { if (degInput) degInput.focus(); }, 120);
          return;
        }

        currentData.choices.forEach((choice, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'messenger-choice-pill';
          btn.innerHTML = `
            <span class="messenger-choice-tag">0${idx + 1}</span>
            <span class="messenger-choice-text">${formatJournalCallouts(choice.text)}</span>
          `;
          btn.addEventListener('click', () => {
            handleWireChoiceSelection(choice, idx);
          });
          wireChoicesGrid.appendChild(btn);
        });
      }

      function handleWireChoiceSelection(choice, choiceIdx) {
        if (sfx) sfx.playMechanicalClick();
        const justAnsweredStep = wireCurrentStep;
        if (choice.nameTitle) {
          setCartographerTitle(choice.nameTitle);
        }
        appendWireMessage('SILVIA · NAVIGATOR', choice.silviaMsg, false, false, null, null, { type: 'expedition', step: justAnsweredStep });

        // Temporarily disable buttons and inputs in grid
        const allInteractive = wireChoicesGrid.querySelectorAll('button, input');
        allInteractive.forEach(b => b.disabled = true);

        // Record history and advance step
        wireHistory[justAnsweredStep] = choiceIdx;
        wireCurrentStep++;

        try {
          localStorage.setItem('order_field_wire_step', wireCurrentStep.toString());
          localStorage.setItem('order_field_wire_choices', JSON.stringify(wireHistory));
        } catch(e) {}

        if (typeof window.refreshTelegraphSignal === 'function') {
          window.refreshTelegraphSignal();
        }

        // SPECIAL MULTI-BEAT PACING & DISCOVERY FOR STEP 2 (The 3 Routes of Sheet 7B)
        if (justAnsweredStep === 2 && choice.beats && choice.beats.length === 3) {
          showTyping(true);
          setTimeout(() => {
            showTyping(false);
            if (sfx) sfx.playChimeHover();
            // Beat 1: Descent and terrain advance
            appendWireMessage(getCartographerTitle(), choice.beats[0], false, true, () => {
              // Realistic traversal pause while exploring
              setTimeout(() => {
                showTyping(true);
                setTimeout(() => {
                  showTyping(false);
                  if (sfx) sfx.playChimeHover();
                  // Beat 2: Discovery of the artifact
                  appendWireMessage(getCartographerTitle(), choice.beats[1], false, true, () => {
                    // Update satchel & open the cinematic modal in the center of the screen
                    if (choice.item) {
                      setSatchelExpeditionItem(choice.item);
                      addRelicToInventory(choice.item.id);
                      openItemAcquiredModal(choice.item, () => {
                        // After player stores in satchel: Beat 3
                        setTimeout(() => {
                          showTyping(true);
                          setTimeout(() => {
                            showTyping(false);
                            if (sfx) sfx.playCelestialChime();
                            // Beat 3: at the copper benchmark, asking for the bearing
                            appendWireMessage(getCartographerTitle(), choice.beats[2], false, true, () => {
                              renderWireChoices();
                              updateMessengerBadge();
                            }, null, { type: 'expedition', step: justAnsweredStep });
                          }, 900);
                        }, 350);
                      });
                    } else {
                      setTimeout(() => {
                        showTyping(true);
                        setTimeout(() => {
                          showTyping(false);
                          appendWireMessage(getCartographerTitle(), choice.beats[2], false, true, () => {
                            renderWireChoices();
                            updateMessengerBadge();
                          }, null, { type: 'expedition', step: justAnsweredStep });
                        }, 800);
                      }, 350);
                    }
                  }, null, { type: 'expedition', step: justAnsweredStep });
                }, 1800);
              }, 700);
            }, null, { type: 'expedition', step: justAnsweredStep });
          }, 1400);
          return;
        }

        showTyping(true);

        setTimeout(() => {
          showTyping(false);
          if (sfx) sfx.playChimeHover();

          appendWireMessage(getCartographerTitle(), choice.hermesReply, false, true, () => {
            if (justAnsweredStep === 3) {
              // Reached step 4 (Watchtower VI completion)
              setTimeout(() => {
                showTyping(true);
                setTimeout(() => {
                  showTyping(false);
                  if (sfx) sfx.playCelestialChime();
                  appendWireMessage(getCartographerTitle(), getHermesFinalForWatchtower(), false, true, () => {
                    appendWireMessage('SYSTEM TELEMETRY', '✦ WAYPOINT SECURED · OUTER WATCHTOWER VI [112° E] · DESERT THRESHOLD REACHED ✦', true, false, null, null, { type: 'expedition', step: 4 });
                    if (isDawnDone() || localStorage.getItem('order_whispering_chasm_completed') === 'true') {
                      renderWireChoices();
                    } else if (dawnStep >= 1 && !isStormOver()) {
                      renderWireChoices();
                    } else {
                      setTimeout(() => beginDawnStep(dawnStep), 900);
                    }
                    updateMessengerBadge();
                  }, null, { type: 'expedition', step: 4 });
                }, 600);
              }, 400);
            } else if (justAnsweredStep === 5) {
              // Silvia answered Step 5 (Oasis Lexicon conversation)
              const isLexiconDone = localStorage.getItem('order_desert_lexicon_completed') === 'true';
              if (isLexiconDone) {
                wireCurrentStep = 6;
                try {
                  localStorage.setItem('order_field_wire_step', '6');
                } catch(e) {}
                setTimeout(() => {
                  showTyping(true);
                  setTimeout(() => {
                    showTyping(false);
                    if (sfx) sfx.playCelestialChime();
                    appendWireMessage('HERMES · CARTOGRAPHER', EXPEDITION_THREAD[6].hermesFinal, false, true, () => {
                      appendWireMessage('SYSTEM TELEMETRY', '✦ AL-QIBLA LOCKED [RAIDERS 194° SSW · TOWER II 14° NNE] · DESERT SIGIL VERIFIED [PHOENIX] · CLEPSYDRA TRAIL UNLOCKED ✦', true, false, null, null, { type: 'expedition', step: 6 });
                      renderWireChoices();
                      updateMessengerBadge();
                    }, null, { type: 'expedition', step: 6 });
                  }, 600);
                }, 400);
              } else {
                renderWireChoices();
                updateMessengerBadge();
              }
            } else if (justAnsweredStep === 7) {
              // Silvia answered Step 7 (Four Wells Clepsydra conversation)
              const isClepsydraDone = localStorage.getItem('order_oasis_clepsydra_completed') === 'true';
              if (isClepsydraDone) {
                wireCurrentStep = 8;
                try {
                  localStorage.setItem('order_field_wire_step', '8');
                } catch(e) {}
                setTimeout(() => {
                  showTyping(true);
                  setTimeout(() => {
                    showTyping(false);
                    if (sfx) sfx.playCelestialChime();
                    appendWireMessage('HERMES · CARTOGRAPHER', EXPEDITION_THREAD[8].hermesFinal, false, true, () => {
                      appendWireMessage('SYSTEM TELEMETRY', '✦ MIRAGE DISPELLED · REAL SPRING FOUND · 4 WATER SKINS FILLED · KEY XXX · [P] - [A] = 14 RECORDED ✦', true, false, null, null, { type: 'expedition', step: 8 });
                      renderWireChoices();
                      updateMessengerBadge();
                    }, null, { type: 'expedition', step: 8 });
                  }, 600);
                }, 400);
              } else {
                renderWireChoices();
                updateMessengerBadge();
              }
            } else if ([9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43].includes(justAnsweredStep)) {
              // 9: Silvia answered at the gates of Tower II, and the 12-hour crossing to the Sun Monolith begins.
              // 11: Silvia answered the Station 14 debrief.
              // 13: Silvia answered at first light, and the 6-hour walk down to the Sandstone Labyrinth begins.
              // 15: Silvia answered the Station 15 debrief.
              // 17: Silvia answered at dusk, and the 18-hour crossing to Cairn IV begins.
              // 19: Silvia answered the Station 16 debrief.
              // 21: Silvia answered at Cairn IV, and the 18-hour walk to the Arch of the Solstice begins.
              // 23: Silvia answered the Station 17 debrief.
              // 25: Silvia answered at noon under the Arch, and the 6-hour walk to Tower II begins.
              // 27: Silvia answered the Station 18 debrief.
              // 29: Silvia answered at the inner stair, and Hermes goes down to the Oracle's door.
              // 31: Silvia answered the Station 19 debrief.
              // 33: Silvia answered at the morning of departure, and the 18-hour crossing to Tower III begins.
              // 35: Silvia answered the Station 20 debrief.
              // 37: Silvia answered at the head of the stair to the Camera Obscura.
              // 39: Silvia answered the Station 21 debrief.
              // 41: Silvia answered at the head of the second stair, down to the Whispering Gallery.
              // 43: Silvia answered the Station 22 debrief.
              if (justAnsweredStep === 9) rememberGateSeal();
              if (MARCH_STARTED_BY_ANSWER[justAnsweredStep]) MARCH_STARTED_BY_ANSWER[justAnsweredStep].start();
              const finalStep = justAnsweredStep + 1;
              setTimeout(() => {
                showTyping(true);
                setTimeout(() => {
                  showTyping(false);
                  if (sfx) sfx.playCelestialChime();
                  appendWireMessage('HERMES · CARTOGRAPHER', EXPEDITION_THREAD[finalStep].hermesFinal, false, true, () => {
                    appendWireMessage('SYSTEM TELEMETRY', WIRE_FINAL_TELEMETRY[finalStep](), true, false, null, null, { type: 'expedition', step: finalStep });
                    if (finalStep === 36) setTimeout(() => { appendWireIntercept(); scrollChatToActivePrompt(true); }, 2600);
                    if (window.Desert3D && typeof window.Desert3D.refresh === 'function') window.Desert3D.refresh();
                    renderWireChoices();
                    updateMessengerBadge();
                  }, null, { type: 'expedition', step: finalStep });
                }, 600);
              }, 400);
            } else {
              renderWireChoices();
              updateMessengerBadge();
            }
          }, null, { type: 'expedition', step: justAnsweredStep });
        }, 650);
      }

      function switchWireTab(tab) {
        if (sfx) sfx.playMechanicalClick();
        currentWireTab = tab;
        if (tab === 'expedition') {
          if (tabWireExpedition) tabWireExpedition.classList.add('active');
          if (tabWireInquiries) tabWireInquiries.classList.remove('active');
          if (wireExpeditionPanel) wireExpeditionPanel.style.display = 'block';
          if (wireInquiriesPanel) wireInquiriesPanel.style.display = 'none';
          if (wireMessagesStream) wireMessagesStream.style.display = 'flex';
          if (wireInquiriesStream) wireInquiriesStream.style.display = 'none';
        } else {
          if (tabWireExpedition) tabWireExpedition.classList.remove('active');
          if (tabWireInquiries) tabWireInquiries.classList.add('active');
          if (wireExpeditionPanel) wireExpeditionPanel.style.display = 'none';
          if (wireInquiriesPanel) wireInquiriesPanel.style.display = 'block';
          if (wireMessagesStream) wireMessagesStream.style.display = 'none';
          if (wireInquiriesStream) wireInquiriesStream.style.display = 'flex';
          renderInquiriesGrid();
        }
      }
      window.switchWireTab = switchWireTab;

      if (tabWireExpedition) tabWireExpedition.addEventListener('click', () => switchWireTab('expedition'));
      if (tabWireInquiries) tabWireInquiries.addEventListener('click', () => switchWireTab('inquiries'));

      function renderInquiryFilterBar() {
        const filterBar = document.getElementById('inquiry-filter-bar');
        if (!filterBar) return;
        const visibleList = allInquiries().filter(i => isInquiryUnlocked(i));
        filterBar.innerHTML = INQUIRY_GROUPS.map((g) => {
          const count = g.id === 'all' ? visibleList.length : visibleList.filter(i => i.group === g.id).length;
          return `<button type="button" class="inquiry-filter-pill${g.id === currentInquiryFilter ? ' active' : ''}" data-filter="${g.id}">${g.label} (${count})</button>`;
        }).join('');
      }

      function renderInquiriesGrid(filter = currentInquiryFilter) {
        if (!inquiriesQuestionsGrid) return;
        currentInquiryFilter = filter;
        inquiriesQuestionsGrid.innerHTML = '';
        renderInquiryFilterBar();

        const query = currentInquirySearch.trim().toLowerCase();
        // Only visible, unlocked inquiries are displayed (no spoilers or locked placeholders)
        const visibleList = allInquiries().filter(inq => isInquiryUnlocked(inq));
        const filtered = visibleList.filter((inq) => {
          if (filter !== 'all' && inq.group !== filter) return false;
          if (!query) return true;
          return (inq.title + ' ' + inq.category).toLowerCase().includes(query);
        });

        filtered.forEach((inq) => {
          const isRead = readInquiriesSet.has(inq.id);
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'messenger-faq-chip' + (isRead ? ' is-read' : '');
          card.id = `inq-card-${inq.id}`;
          card.innerHTML = `
            <div class="messenger-faq-chip-title">
              <span>✦</span>
              <span>${inq.title}</span>
            </div>
            <div class="messenger-faq-chip-cat">
              <span>${inq.category}</span>
              ${isRead ? '<span class="inquiry-read-badge">✓ Answered</span>' : ''}
            </div>
          `;
          card.addEventListener('click', () => {
            handleInquiryClick(inq);
          });
          inquiriesQuestionsGrid.appendChild(card);
        });

        if (filtered.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'messenger-faq-empty';
          empty.textContent = query ? 'No question matches "' + currentInquirySearch.trim() + '". Try another word.' : 'No questions available in this section yet.';
          inquiriesQuestionsGrid.appendChild(empty);
        }

        const progressEl = document.getElementById('inquiry-progress');
        if (progressEl) {
          const answered = visibleList.filter(i => readInquiriesSet.has(i.id)).length;
          progressEl.textContent = answered + ' / ' + visibleList.length + ' ANSWERED';
        }
      }

      function initInquiryFilters() {
        const filterBar = document.getElementById('inquiry-filter-bar');
        const searchInput = document.getElementById('inquiry-search');
        renderInquiryFilterBar();
        if (filterBar) {
          filterBar.addEventListener('click', (e) => {
            const pill = e.target.closest('.inquiry-filter-pill');
            if (!pill) return;
            if (sfx) sfx.playMechanicalClick();
            renderInquiriesGrid(pill.getAttribute('data-filter') || 'all');
          });
        }
        if (searchInput) {
          searchInput.addEventListener('input', () => {
            currentInquirySearch = searchInput.value;
            renderInquiriesGrid(currentInquiryFilter);
          });
        }
      }

      function handleInquiryClick(inq) {
        if (!isInquiryUnlocked(inq)) return;
        if (sfx) sfx.playMechanicalClick();

        // 1. Persist read state
        readInquiriesSet.add(inq.id);
        try {
          localStorage.setItem('order_field_inquiries_read', JSON.stringify([...readInquiriesSet]));
        } catch(e) {}

        // Keep the "answered" counter in step with the read state
        const progressEl = document.getElementById('inquiry-progress');
        if (progressEl) {
          const visibleList = allInquiries().filter(i => isInquiryUnlocked(i));
          const answered = visibleList.filter(i => readInquiriesSet.has(i.id)).length;
          progressEl.textContent = answered + ' / ' + visibleList.length + ' ANSWERED';
        }

        // 2. Mark card visually with gold ribete and Answered badge
        const card = document.getElementById(`inq-card-${inq.id}`);
        if (card) {
          card.classList.add('is-read');
          const catEl = card.querySelector('.messenger-faq-chip-cat');
          if (catEl && !catEl.querySelector('.inquiry-read-badge')) {
            const badge = document.createElement('span');
            badge.className = 'inquiry-read-badge';
            badge.innerHTML = '✓ Answered';
            catEl.appendChild(badge);
          }
        }

        // 3. Silvia posts question into inquiries stream
        appendWireMessage('SILVIA · NAVIGATOR', inq.title, false, false, null, wireInquiriesStream);
        showTyping(true);

        // 4. Hermes telegraph answer with live typewriter effect and smooth focus
        setTimeout(() => {
          showTyping(false);
          if (sfx) sfx.playChimeHover();
          appendWireMessage('HERMES · CARTOGRAPHER', inq.answer, false, true, null, wireInquiriesStream);
        }, 550);
      }

      if (btnWireReplay) {
        btnWireReplay.addEventListener('click', () => {
          if (sfx) sfx.playMechanicalClick();
          wireCurrentStep = 0;
          wireHistory = [];
          dawnHistory = [];
          if (typeof window.refreshTelegraphSignal === 'function') {
            window.refreshTelegraphSignal();
          }
          try {
            localStorage.removeItem('order_dawn_choices');
            localStorage.removeItem('order_dawn_step');
            localStorage.removeItem('order_chasm_wire');
            // With the Chasm already cleared the Cairn I seal stays earned; otherwise the dawn can be played again
            if (localStorage.getItem('order_whispering_chasm_completed') !== 'true') {
              localStorage.removeItem('order_cairn1_found');
              localStorage.removeItem('order_cairn1_completed');
              localStorage.removeItem('order_cairn1_optimal');
              localStorage.removeItem('order_seal_cairn_1');
            }
          } catch(e) {}
          dawnStep = localStorage.getItem('order_whispering_chasm_completed') === 'true' ? DAWN_DONE : 0;
          persistDawn();
          if (typeof window.renderSatchel === 'function') window.renderSatchel(0);
          try {
            localStorage.removeItem('order_field_wire_step');
            localStorage.removeItem('order_field_wire_choices');
            localStorage.removeItem('order_field_wire_completed');
            localStorage.removeItem('order_cartographer_title');
            localStorage.removeItem('order_satchel_expedition_item');
            localStorage.removeItem('order_inventory_relics');
            localStorage.removeItem('order_messenger_unread_count');
            localStorage.removeItem('order_messenger_last_read_step');
            removeShelterStormWaitBox();
            if (typeof window.updateInventoryBadge === 'function') window.updateInventoryBadge();
          } catch(e) {}
          if (wireInquiriesStream) wireInquiriesStream.innerHTML = '';
          renderWireExpedition();
          renderInquiriesGrid();
          markMessengerAsRead();
        });
      }

      if (btnWireToMap) {
        btnWireToMap.addEventListener('click', () => {
          if (sfx) sfx.playCelestialChime();
          activateHubView('view-trail');
          if (typeof window.switchMapPath === 'function') {
            window.switchMapPath('desert', true);
          }
        });
      }

      if (btnHeaderMessenger) {
        // The chat button is a toggle: inside The Cliffside Workshop it takes the player back to the previous view
        btnHeaderMessenger.addEventListener('click', () => {
          if (sfx) sfx.playMechanicalClick();
          if (document.body.getAttribute('data-active-view') === 'view-field-wire') {
            const back = typeof window.getPreviousHubView === 'function' ? window.getPreviousHubView() : 'view-trail';
            activateHubView(back && back !== 'view-field-wire' ? back : 'view-trail');
          } else {
            activateHubView('view-field-wire');
          }
        });
      }

      // Analog Galvanic Carrier Wave:
      // First mission (sandstorm, wireCurrentStep < 4): exactly 1 bar of connection, % changes with time (21%-28%)
      // Post-storm missions (wireCurrentStep >= 4): fluctuates randomly between 2, 3, and 4 columns
      function initTelegraphSignalMeter() {
        const barContainer = document.querySelector('.signal-indicator-bars');
        const valEl = document.querySelector('.signal-val');
        if (!barContainer) return;
        const bars = barContainer.querySelectorAll('.signal-bar');
        if (bars.length !== 4) return;

        // Each column represents ~25% of the signal gauge
        const signalTiers = {
          1: [21, 28],
          2: [47, 56],
          3: [71, 80],
          4: [91, 98]
        };

        let currentLevel = null;
        let meterTimer = null;

        function setSignalLevel(level) {
          currentLevel = level;
          window.currentTelegraphSignalLevel = level;

          const meterEl = document.querySelector('.telegraph-signal-meter');
          if (meterEl) {
            meterEl.setAttribute('data-level', level);
          }

          bars.forEach((bar, idx) => {
            if (idx < level) {
              bar.classList.add('active');
              if (idx === level - 1) {
                bar.classList.add('pulse');
              } else {
                bar.classList.remove('pulse');
              }
            } else {
              bar.classList.remove('active', 'pulse');
            }
          });

          if (valEl && signalTiers[level]) {
            const [minP, maxP] = signalTiers[level];
            const p = Math.floor(Math.random() * (maxP - minP + 1)) + minP;
            valEl.textContent = p + '%';
          }
        }

        function updateSignalCycle() {
          const inStorm = (typeof wireCurrentStep === 'number' ? wireCurrentStep : 0) < 4;

          if (inStorm) {
            // First mission: exactly 1 bar in the storm; percentage fluctuates with time
            setSignalLevel(1);
            const delay = 1800 + Math.random() * 2000; // 1.8s - 3.8s
            meterTimer = setTimeout(updateSignalCycle, delay);
          } else {
            // Post-storm missions: fluctuates randomly between 2, 3, and 4 columns
            const pool = [2, 3, 4].filter(lvl => lvl !== currentLevel);
            const nextLevel = Math.random() < 0.75
              ? pool[Math.floor(Math.random() * pool.length)]
              : (currentLevel >= 2 ? currentLevel : 3);
            setSignalLevel(nextLevel);
            const delay = 2200 + Math.random() * 2600; // 2.2s - 4.8s
            meterTimer = setTimeout(updateSignalCycle, delay);
          }
        }

        window.refreshTelegraphSignal = function() {
          if (meterTimer) clearTimeout(meterTimer);
          updateSignalCycle();
        };

        updateSignalCycle();
      }

      function initHermesOnlineToggle() {
        const btn = document.getElementById('btn-hermes-status');
        const badge = document.querySelector('.workshop-avatar .messenger-online-badge');
        if (!btn) return;

        btn.addEventListener('click', () => {
          if (sfx) sfx.playMechanicalClick();
          const isOnline = btn.classList.contains('online');
          if (isOnline) {
            btn.classList.remove('online');
            btn.classList.add('offline');
            btn.setAttribute('aria-pressed', 'false');
            const textEl = btn.querySelector('.status-indicator-text');
            if (textEl) textEl.textContent = 'Offline';
            if (badge) {
              badge.style.background = '#78716c';
              badge.style.boxShadow = 'none';
            }
          } else {
            btn.classList.remove('offline');
            btn.classList.add('online');
            btn.setAttribute('aria-pressed', 'true');
            const textEl = btn.querySelector('.status-indicator-text');
            if (textEl) textEl.textContent = 'Online';
            if (badge) {
              badge.style.background = '#7e946a';
              badge.style.boxShadow = '0 0 6px rgba(126, 148, 106, 0.85)';
            }
          }
        });
      }

      // Initial boot
      renderWireExpedition();
      renderInquiriesGrid();
      initInquiryFilters();
      updateMessengerBadge();
      initTelegraphSignalMeter();
      initHermesOnlineToggle();

    })();
