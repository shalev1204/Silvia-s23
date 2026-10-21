
    (function initSandstormLockdown() {
      const overlay = document.getElementById('sandstorm-lockout-overlay');
      if (!overlay) return;

      const canvas = document.getElementById('sandstorm-lockout-canvas');
      const hoursEl = document.getElementById('storm-cd-hours');
      const minsEl = document.getElementById('storm-cd-minutes');
      const secsEl = document.getElementById('storm-cd-seconds');
      const progressFill = document.getElementById('storm-progress-fill');
      const progressPercent = document.getElementById('storm-progress-percent');
      const windSpeedEl = document.getElementById('tel-wind-speed');
      const barometerEl = document.getElementById('tel-barometer');
      const audioToggleBtn = document.getElementById('btn-storm-audio-toggle');
      const audioIcon = document.getElementById('storm-audio-icon');
      const audioLabel = document.getElementById('storm-audio-label');
      const lightningFlash = document.getElementById('storm-lightning-flash');
      const devControls = document.getElementById('storm-dev-controls');
      const btnDevToggle = document.getElementById('btn-dev-toggle-storm');
      const btnDevReset = document.getElementById('btn-dev-reset-storm-timer');
      const btnDevExpire = document.getElementById('btn-dev-expire-storm-timer');
      const btnStormOpenLedger = document.getElementById('btn-storm-open-ledger');
      const emergencyWireCard = document.getElementById('storm-emergency-wire-card');
      const btnStormAnswerWire = document.getElementById('btn-storm-answer-wire');
      const btnDevToggleWire = document.getElementById('btn-dev-toggle-wire');
      const statusBeaconText = document.querySelector('.storm-status-beacon span:nth-child(2)');

      const DURATION_48H_MS = 48 * 60 * 60 * 1000; // 172,800,000 ms (48 Hours)
      const urlParams = new URLSearchParams(window.location.search);
      const activeSeeker = (localStorage.getItem('the_eclipse_active_seeker') || (typeof currentSeeker !== 'undefined' ? currentSeeker : 'Silvia') || 'Silvia').toLowerCase();

      // Check URL parameters for explicit overrides
      const forceStorm = urlParams.get('storm') === '1';
      const bypassStorm = urlParams.get('storm') === '0' || urlParams.get('bypass') === '1';

      // Storm sandbox controls: Carles only — never Silvia (not even with ?dev=1)
      const isCarles = activeSeeker === 'carles';
      if (typeof window.syncStormDevControlsVisibility === 'function') {
        window.syncStormDevControlsVisibility();
      } else if (devControls) {
        devControls.style.display = isCarles ? 'flex' : 'none';
      }

      function getStormTargetTime() {
        // Target: Sunday Oct 18 2026 at 14:00:00 CEST (1792324800000)
        const SUNDAY_OCT_18_2026_2PM = window.SUNDAY_OCT_18_2026_2PM || 1792324800000;
        const seekerNow = (localStorage.getItem('the_eclipse_active_seeker') || activeSeeker || 'Silvia').toLowerCase();
        // Silvia's live clock is always pinned to Sun 18 14:00; Carles may override for testing
        if (seekerNow === 'silvia') {
          localStorage.setItem('order_sandstorm_target_time', String(SUNDAY_OCT_18_2026_2PM));
          return SUNDAY_OCT_18_2026_2PM;
        }
        let target = parseInt(localStorage.getItem('order_sandstorm_target_time'), 10);
        if (!target || isNaN(target) || target === 1792260000000) {
          target = SUNDAY_OCT_18_2026_2PM;
          localStorage.setItem('order_sandstorm_target_time', target.toString());
        }
        return target;
      }
      window.getStormTargetTime = getStormTargetTime;

      function getRemainingTime() {
        return Math.max(0, getStormTargetTime() - Date.now());
      }

      function isStormActive() {
        if (bypassStorm) return false;
        if (forceStorm) return true;

        const seekerNow = (localStorage.getItem('the_eclipse_active_seeker') || activeSeeker || 'Silvia').toLowerCase();
        const carlesNow = seekerNow === 'carles' || urlParams.get('dev') === '1';

        // Carles sandbox never locks out by default
        if (carlesNow && !forceStorm) {
          return false;
        }

        // Answering the telegraph only dismisses the overlay for this browser session
        // (so a fresh visit / new session as Silvia always enters into the storm)
        if (sessionStorage.getItem('order_sandstorm_wire_answered') === 'true') {
          return false;
        }
        try { localStorage.removeItem('order_sandstorm_wire_answered'); } catch (e) {}

        // Silvia live: the storm is over; she has reached Watchtower VI
        if (seekerNow === 'silvia') {
          return false;
        }

        const isMarked = localStorage.getItem('seeker_silvia_sandstorm_active') === 'true' ||
                         localStorage.getItem('order_sandstorm_active') === 'true';

        if (!isMarked) return false;

        return getRemainingTime() > 0;
      }

      // Procedural Web Audio Ambient Wind Synthesizer
      let audioCtx = null;
      let windGain = null;
      let windFilter = null;
      let isAudioMuted = false;
      let windInitialized = false;

      function initWindAudio() {
        if (windInitialized) return;
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          audioCtx = new AudioContextClass();

          // Create 3 seconds of white/pink noise buffer
          const bufferSize = audioCtx.sampleRate * 3;
          const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            output[i] = (b0 + b1 + b2) * 0.35;
          }

          const whiteNoise = audioCtx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          // Bandpass filter for wind howling frequencies
          windFilter = audioCtx.createBiquadFilter();
          windFilter.type = 'bandpass';
          windFilter.frequency.setValueAtTime(380, audioCtx.currentTime);
          windFilter.Q.setValueAtTime(2.2, audioCtx.currentTime);

          // LFO to modulate filter frequency (wind gusts)
          const lfo = audioCtx.createOscillator();
          lfo.frequency.setValueAtTime(0.18, audioCtx.currentTime); // 0.18 Hz slow gusts
          const lfoGain = audioCtx.createGain();
          lfoGain.gain.setValueAtTime(220, audioCtx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(windFilter.frequency);
          lfo.start();

          // Master wind gain
          windGain = audioCtx.createGain();
          windGain.gain.setValueAtTime(isAudioMuted ? 0 : 0.16, audioCtx.currentTime);

          whiteNoise.connect(windFilter);
          windFilter.connect(windGain);
          windGain.connect(audioCtx.destination);

          whiteNoise.start();
          windInitialized = true;
        } catch(e) {
          console.warn('Sandstorm audio initialization deferred:', e);
        }
      }

      function toggleAudio() {
        isAudioMuted = !isAudioMuted;
        if (!windInitialized) {
          initWindAudio();
        }
        if (windGain && audioCtx) {
          if (audioCtx.state === 'suspended') audioCtx.resume();
          windGain.gain.setValueAtTime(isAudioMuted ? 0 : 0.16, audioCtx.currentTime);
        }
        if (audioIcon && audioLabel) {
          audioIcon.textContent = isAudioMuted ? '🔇' : '🔊';
          audioLabel.textContent = isAudioMuted ? 'Storm Audio: Muted' : 'Storm Audio: ON';
        }
      }

      if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', toggleAudio);
      }

      // High-DPI Canvas Particle Engine for Sand & Dust
      let animationFrameId = null;
      let particles = [];
      let canvasWidth = window.innerWidth;
      let canvasHeight = window.innerHeight;

      function setupCanvas() {
        if (!canvas) return;
        canvas.width = canvasWidth = window.innerWidth;
        canvas.height = canvasHeight = window.innerHeight;

        const PARTICLE_COUNT = 240;
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            vx: -(Math.random() * 12 + 8), // High horizontal wind speed
            vy: (Math.random() - 0.35) * 3,
            length: Math.random() * 22 + 4, // Sand streaks
            size: Math.random() * 2.2 + 0.6,
            alpha: Math.random() * 0.6 + 0.25,
            color: Math.random() < 0.2 ? '#f59e0b' : (Math.random() < 0.6 ? '#d97706' : '#ef4444')
          });
        }
      }

      let lastLightning = Date.now();
      function renderStormParticles() {
        if (!canvas || !overlay || overlay.style.display === 'none') return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Rare sheet lightning in the dust clouds
        const now = Date.now();
        if (now - lastLightning > 8000 + Math.random() * 9000) {
          lastLightning = now;
          if (lightningFlash) {
            lightningFlash.style.opacity = '0.7';
            setTimeout(() => { lightningFlash.style.opacity = '0'; }, 90);
            setTimeout(() => { lightningFlash.style.opacity = '0.4'; }, 160);
            setTimeout(() => { lightningFlash.style.opacity = '0'; }, 240);
          }
        }

        for (let p of particles) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -40) {
            p.x = canvasWidth + Math.random() * 60;
            p.y = Math.random() * canvasHeight;
          }
          if (p.y < 0) p.y = canvasHeight;
          if (p.y > canvasHeight) p.y = 0;

          // Draw wind streak
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length, p.y - p.vy * 2);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = p.size;
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        animationFrameId = requestAnimationFrame(renderStormParticles);
      }

      // Live 48-Hour Countdown Ticker
      let timerInterval = null;
      let telemetryInterval = null;

      function updateCountdown() {
        const remaining = getRemainingTime();
        const targetTime = getStormTargetTime();

        if (remaining <= 0) {
          // Storm subsided!
          clearInterval(timerInterval);
          if (progressFill) progressFill.style.width = '100%';
          if (progressPercent) progressPercent.textContent = '100% · Storm Subsided · Carrier Signal Restored';
          if (hoursEl) hoursEl.textContent = '00';
          if (minsEl) minsEl.textContent = '00';
          if (secsEl) secsEl.textContent = '00';
          setTimeout(() => {
            deactivateStormLockout();
          }, 1500);
          return;
        }

        const hrs = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remaining % (1000 * 60)) / 1000);

        if (hoursEl) hoursEl.textContent = String(hrs).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');

        let startTime = parseInt(localStorage.getItem('order_sandstorm_start_time'), 10);
        if (!startTime || isNaN(startTime)) {
          startTime = Date.now();
          localStorage.setItem('order_sandstorm_start_time', startTime.toString());
        }
        const totalDuration = Math.max(1, targetTime - startTime);
        const elapsed = Math.max(0, Date.now() - startTime);
        const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        if (progressFill) progressFill.style.width = pct.toFixed(2) + '%';
        if (progressPercent) progressPercent.textContent = `ESTIMATED SIGNAL RE-ACQUISITION WINDOW · ${pct.toFixed(1)}% ELAPSED`;

        // Emergency copper wire: at ≤24h remaining, ?wire=1, force flag, or Silvia live unlock (Hermes already calling)
        const is24hWire = remaining <= (24 * 60 * 60 * 1000) ||
          urlParams.get('wire') === '1' ||
          window.forceWireAlert === true ||
          localStorage.getItem('order_sandstorm_wire_unlocked') === 'true';
        if (emergencyWireCard) {
          emergencyWireCard.style.display = is24hWire ? 'flex' : 'none';
        }
        if (statusBeaconText) {
          if (is24hWire) {
            statusBeaconText.textContent = '142.85 MHz // EMERGENCY COPPER WIRE DETECTED · INCOMING SIGNAL';
          } else {
            statusBeaconText.textContent = '142.85 MHz // CARRIER SIGNAL LOST · CRITICAL INTERFERENCE';
          }
        }
      }

      function updateTelemetry() {
        // Natural micro-fluctuations in gale telemetry
        if (windSpeedEl) {
          const speed = 120 + Math.floor(Math.sin(Date.now() / 4000) * 12 + Math.random() * 6);
          windSpeedEl.textContent = `${speed} km/h`;
        }
        if (barometerEl) {
          const baro = 880 + Math.floor(Math.cos(Date.now() / 6000) * 3 + Math.random() * 2);
          barometerEl.textContent = `${baro} hPa`;
        }
      }

      function activateStormLockout() {
        document.body.classList.add('sandstorm-lockout-active');
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');

        // Re-assert: Silvia must never see the DEV storm bar while locked out
        if (typeof window.syncStormDevControlsVisibility === 'function') {
          window.syncStormDevControlsVisibility();
        } else if (devControls) {
          const seekerNow = (localStorage.getItem('the_eclipse_active_seeker') || activeSeeker || 'Silvia').toLowerCase();
          devControls.style.display = seekerNow === 'carles' ? 'flex' : 'none';
        }

        setupCanvas();
        if (!animationFrameId) {
          renderStormParticles();
        }

        updateCountdown();
        clearInterval(timerInterval);
        timerInterval = setInterval(updateCountdown, 1000);

        updateTelemetry();
        clearInterval(telemetryInterval);
        telemetryInterval = setInterval(updateTelemetry, 2500);

        // User gesture listener to start ambient wind sound
        const startAudioOnFirstInteract = () => {
          initWindAudio();
          window.removeEventListener('click', startAudioOnFirstInteract);
          window.removeEventListener('keydown', startAudioOnFirstInteract);
        };
        window.addEventListener('click', startAudioOnFirstInteract, { once: true });
        window.addEventListener('keydown', startAudioOnFirstInteract, { once: true });
      }

      function deactivateStormLockout() {
        document.body.classList.remove('sandstorm-lockout-active');
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        clearInterval(timerInterval);
        clearInterval(telemetryInterval);

        if (windGain && audioCtx) {
          try {
            windGain.gain.setValueAtTime(0, audioCtx.currentTime);
          } catch(e) {}
        }
      }

      // Dev Sandbox Control Actions & Global Interface
      window.SandstormLockdown = {
        activate: (persist = true) => {
          if (persist) {
            localStorage.setItem('order_sandstorm_active', 'true');
            localStorage.setItem('seeker_silvia_sandstorm_active', 'true');
          }
          activateStormLockout();
        },
        deactivate: (persist = true) => {
          if (persist) {
            localStorage.setItem('order_sandstorm_active', 'false');
            localStorage.setItem('seeker_silvia_sandstorm_active', 'false');
          }
          deactivateStormLockout();
        },
        toggle: () => {
          if (overlay.style.display === 'none') {
            localStorage.setItem('order_sandstorm_active', 'true');
            localStorage.setItem('seeker_silvia_sandstorm_active', 'true');
            activateStormLockout();
          } else {
            localStorage.setItem('order_sandstorm_active', 'false');
            localStorage.setItem('seeker_silvia_sandstorm_active', 'false');
            deactivateStormLockout();
          }
        }
      };

      const btnHeaderStormToggle = document.getElementById('btn-dev-storm-toggle-header');
      if (btnHeaderStormToggle) {
        btnHeaderStormToggle.addEventListener('click', () => {
          window.SandstormLockdown.toggle();
        });
      }
      if (typeof window.syncStormDevControlsVisibility === 'function') {
        window.syncStormDevControlsVisibility();
      }

      if (btnDevToggle) {
        btnDevToggle.addEventListener('click', () => {
          deactivateStormLockout();
        });
      }

      if (btnDevReset) {
        btnDevReset.addEventListener('click', () => {
          // A fresh 48 h window from now (the canon end date is already in the past)
          localStorage.setItem('order_sandstorm_target_time', String(Date.now() + DURATION_48H_MS));
          localStorage.setItem('order_sandstorm_start_time', Date.now().toString());
          localStorage.setItem('order_sandstorm_active', 'true');
          localStorage.setItem('seeker_silvia_sandstorm_active', 'true');
          updateCountdown();
        });
      }

      if (btnDevExpire) {
        btnDevExpire.addEventListener('click', () => {
          const past = Date.now() - 1000;
          localStorage.setItem('order_sandstorm_target_time', past.toString());
          updateCountdown();
        });
      }

      if (btnDevToggleWire) {
        btnDevToggleWire.addEventListener('click', () => {
          window.forceWireAlert = !window.forceWireAlert;
          updateCountdown();
        });
      }

      if (btnStormAnswerWire) {
        btnStormAnswerWire.addEventListener('click', () => {
          if (typeof sfx !== 'undefined' && sfx.playMechanicalClick) sfx.playMechanicalClick();
          try {
            // Session-only: a later visit as Silvia still opens into the storm
            sessionStorage.setItem('order_sandstorm_wire_answered', 'true');
            localStorage.removeItem('order_sandstorm_wire_answered');
            localStorage.setItem('order_sandstorm_wire_unlocked', 'true');
            localStorage.setItem('seeker_silvia_sandstorm_active', 'true');
            localStorage.setItem('order_sandstorm_active', 'true');
            localStorage.setItem('order_desert_path_unlocked', 'true');
            // Pending Hermes distress on the wire (badge + stream)
            localStorage.removeItem('order_messenger_last_read_step');
            localStorage.setItem('order_messenger_unread_count', '1');
          } catch (e) {}
          // Leave the fullscreen storm overlay and open The Cliffside Workshop directly
          deactivateStormLockout();
          const btnHeaderMessenger = document.getElementById('btn-header-messenger');
          if (btnHeaderMessenger) btnHeaderMessenger.style.display = '';
          if (typeof window.updateSatchelVisibility === 'function') window.updateSatchelVisibility();
          if (typeof window.updateMessengerBadge === 'function') window.updateMessengerBadge();
          // Sandstorm IIFE is outside the Hub controller — must use window.activateHubView
          if (typeof window.activateHubView === 'function') {
            window.activateHubView('view-field-wire');
          } else {
            const workshop = document.getElementById('view-field-wire');
            if (workshop) {
              document.querySelectorAll('.hub-view-section.active').forEach((el) => el.classList.remove('active'));
              workshop.classList.add('active');
              document.body.setAttribute('data-active-view', 'view-field-wire');
            }
          }
          try {
            if (window.location.hash !== '#view-field-wire' && window.location.hash !== '#wire') {
              history.replaceState(null, '', '#view-field-wire');
            }
          } catch (e) {}
          if (typeof window.switchWireTab === 'function') {
            window.switchWireTab('expedition');
          }
          if (typeof window.switchMapPath === 'function') {
            window.switchMapPath('desert', false);
          }
          if (typeof window.updateSatchelVisibility === 'function') window.updateSatchelVisibility();
        });
      }

      if (btnStormOpenLedger) {
        btnStormOpenLedger.addEventListener('click', () => {
          // Smoothly switch view to Cipher Ledger beneath the overlay
          if (typeof activateHubView === 'function') {
            activateHubView('view-cipher');
          }
          // Temporarily hide the overlay so she can work on cipher ledger, but with storm body class active!
          overlay.style.display = 'none';
          // Add a floating return button
          let returnBtn = document.getElementById('btn-return-to-storm-banner');
          if (!returnBtn) {
            returnBtn = document.createElement('button');
            returnBtn.id = 'btn-return-to-storm-banner';
            returnBtn.innerHTML = '🌪️ Return to Storm Signal Alert';
            returnBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;padding:12px 20px;background:#b45309;color:#fff;border:1.5px solid #f59e0b;border-radius:30px;font-family:Cinzel,serif;font-weight:700;font-size:0.85rem;cursor:pointer;box-shadow:0 0 20px rgba(0,0,0,0.8);';
            returnBtn.onclick = () => {
              overlay.style.display = 'flex';
              returnBtn.remove();
            };
            document.body.appendChild(returnBtn);
          }
        });
      }

      window.addEventListener('resize', () => {
        if (overlay.style.display !== 'none') setupCanvas();
      });

      // Master Evaluation on Page Load — The storm is over; Silvia reaches the Desert Path
      try {
        const seekerBoot = (localStorage.getItem('the_eclipse_active_seeker') || activeSeeker || 'Silvia').toLowerCase();
        if (seekerBoot === 'silvia') {
          localStorage.removeItem('seeker_silvia_sandstorm_active');
          localStorage.removeItem('order_sandstorm_active');
          localStorage.setItem('order_sandstorm_wire_unlocked', 'true');
          localStorage.setItem('order_storm_tester_bypassed', 'true');
        }
      } catch (e) {}
      if (isStormActive()) {
        activateStormLockout();
      }
      // =======================================================================
      // SMART STICKY VIEWPORT HEADER (REVEAL ON SCROLL UP · HIDE ON SCROLL DOWN)
      // =======================================================================
      function initSmartStickyHeader() {
        const header = document.querySelector('.hub-viewport-header');
        if (!header) return;

        let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        let accumulatedDelta = 0;
        let ticking = false;
        const SCROLL_THRESHOLD = 50;

        function updateHeaderVisibility() {
          // Smart Sticky HUD ONLY operates inside The Cliffside Workshop (view-field-wire)
          if (document.body.getAttribute('data-active-view') !== 'view-field-wire') {
            header.classList.remove('header-nav-hidden', 'header-nav-floating');
            accumulatedDelta = 0;
            ticking = false;
            return;
          }

          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
          const delta = currentScrollY - lastScrollY;

          // If scroll direction reversed, reset accumulator
          if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
            accumulatedDelta = 0;
          }
          accumulatedDelta += delta;

          // At the top: return to natural flow header
          if (currentScrollY <= 25) {
            header.classList.remove('header-nav-hidden', 'header-nav-floating');
            accumulatedDelta = 0;
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          // Scrolling DOWN past threshold: hide header to keep reading area clear
          if (accumulatedDelta > 10 && currentScrollY > SCROLL_THRESHOLD) {
            header.classList.add('header-nav-hidden');
            header.classList.add('header-nav-floating');
            accumulatedDelta = 0;
          }
          // Scrolling UP ("aunque sea un poco"): reveal header immediately
          else if (accumulatedDelta < -4) {
            header.classList.remove('header-nav-hidden');
            header.classList.add('header-nav-floating');
            accumulatedDelta = 0;
          }

          lastScrollY = currentScrollY;
          ticking = false;
        }

        function onScroll() {
          if (!ticking) {
            window.requestAnimationFrame(updateHeaderVisibility);
            ticking = true;
          }
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        // Reset header to visible state whenever view changes
        window.resetStickyHeader = function () {
          header.classList.remove('header-nav-hidden', 'header-nav-floating');
          lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
          accumulatedDelta = 0;
        };
      }

      initSmartStickyHeader();

      if (typeof handleHubUrlHash === 'function') {
        handleHubUrlHash();
      }
    })();
