/**
 * THE ECLIPSE ORDER · THE CELESTIAL CIPHER (STATION 09)
 * Pure Reading Immersion: Continuous Atmospheric Scroll LERP, Candlelight Focus,
 * Folio Parallax, Living Textures & Distant Horizon Beacon
 */

(function () {
  'use strict';

  // Seeker access control: Station 09 remains veiled / locked for Silvia until release
  const currentSeeker = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const isDevBypass = urlParams.get('preview') === '1' || urlParams.get('auth') === '1' || urlParams.get('dev') === '1' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (currentSeeker !== 'carles' && !isDevBypass && localStorage.getItem('order_midnight_completed') !== 'true') {
    alert("Station 09 remains veiled under the Order's nocturnal seal. The path will unlock when the next dispatch is broadcast.");
    window.location.replace('../../index.html#view-trail');
    return;
  }

  // ── 1. Minimal Audio FX (Only for final transmission click & resolution) ──
  class MinimalAudio {
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

    playClick() {
      try {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {}
    }

    playProphecyResolved() {
      try {
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [220.00, 277.18, 329.63, 440.00, 554.37, 659.25, 880.00];
        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + i * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 2.6);
        });
      } catch (e) {}
    }
  }

  const sfx = new MinimalAudio();

  // ── 2. Mathematical Continuous LERP Utilities ──
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t))
    ];
  }

  // 4 Core Atmospheric Keyframes across scroll progression (0.00 to 1.00)
  const atmosphericKeyframes = [
    {
      progress: 0.00,
      name: 'alpine',
      skyCenter: [22, 32, 56],      // Deep crystalline lapis #162038
      skyPerimeter: [4, 6, 12],     // Cold mountain void #04060c
      nebulaOpacity: 0.75,          // Crystalline starlight cloud
      dustOpacity: 0.08,            // Low ground dust
      hazeOpacity: 0.00,
      particleSpeed: 0.55,
      particleColor1: [147, 197, 253], // Icy cyan #93c5fd
      particleColor2: [226, 232, 240]  // Silver white #e2e8f0
    },
    {
      progress: 0.33,
      name: 'cataclysm',
      skyCenter: [74, 21, 11],      // Bruised tempest crimson #4a150b
      skyPerimeter: [16, 3, 2],     // Scorched stone #100302
      nebulaOpacity: 0.12,          // Choked by red sand
      dustOpacity: 0.70,            // Heavy copper sand haze
      hazeOpacity: 0.65,
      particleSpeed: 2.7,
      particleColor1: [239, 68, 68],  // Fiery vermilion #ef4444
      particleColor2: [249, 115, 22]  // Blazing amber #f97316
    },
    {
      progress: 0.66,
      name: 'ashen',
      skyCenter: [28, 24, 27],      // Muted ash charcoal #1c181b
      skyPerimeter: [6, 5, 7],      // Dead obsidian #060507
      nebulaOpacity: 0.05,          // Barren sky
      dustOpacity: 0.42,            // Lingering cold ash motes
      hazeOpacity: 0.22,
      particleSpeed: 0.72,
      particleColor1: [156, 163, 175], // Ash gray #9ca3af
      particleColor2: [100, 116, 139]  // Slate soot #64748b
    },
    {
      progress: 1.00,
      name: 'beacon',
      skyCenter: [64, 40, 13],      // Warm radiant gold dawn #40280d
      skyPerimeter: [7, 8, 18],     // Midnight southern horizon #070812
      nebulaOpacity: 0.55,          // Stars return with golden light
      dustOpacity: 0.20,            // Gentle desert dunes
      hazeOpacity: 0.08,
      particleSpeed: 1.15,
      particleColor1: [251, 191, 36], // Radiant stardust gold #fbbf24
      particleColor2: [254, 240, 138] // Pale gold spark #fef08a
    }
  ];

  // Dynamic DOM elements
  const skyBackdrop = document.getElementById('sky-backdrop');
  const skyNebula = document.getElementById('sky-nebula');
  const skyDust = document.getElementById('sky-dust');
  const sandstormHaze = document.getElementById('sandstorm-haze');
  const beaconEmitter = document.getElementById('distant-beacon-emitter');

  // Living Astronomical Instrumentation & Climax DOM References
  const caliperEl = document.getElementById('declination-caliper');

  const silkFill = document.getElementById('silk-gold-fill');
  const threadSpark = document.getElementById('thread-spark');
  const threadNode1 = document.getElementById('thread-node-1');
  const threadNode2 = document.getElementById('thread-node-2');
  const threadNode3 = document.getElementById('thread-node-3');
  const threadNode4 = document.getElementById('thread-node-4');

  const compassBtn = document.getElementById('astrolabe-compass-btn');
  const compassNeedle = document.getElementById('compass-needle-group');
  const chartMesh = document.querySelector('.chart-svg-mesh');

  const climaxStage = document.getElementById('climax-stage');
  const radioTransceiverPanel = document.getElementById('radio-transceiver-panel');

  const stepElements = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
  };

  const readableElements = document.querySelectorAll('.novel-para, .novel-quote-card, .charred-relic-facsimile');
  const shimmerElements = document.querySelectorAll(
    '.novel-quote-card, .charred-relic-facsimile, .gold-glow-title, .novel-center-name'
  );
  const plateImages = document.querySelectorAll('.plate-image');

  // Particle state for Canvas
  let currentParticleSpeed = 0.55;
  let currentParticleRGB1 = [147, 197, 253];
  let currentParticleRGB2 = [226, 232, 240];
  let currentChapter = 1;
  let lightningTimer = null;

  // ── Atmospheric Tempest Lightning (Chapter II Cataclysm) ──
  function triggerLightningFlash() {
    const flash = document.getElementById('lightning-flash-overlay');
    if (!flash) return;
    flash.style.opacity = '0.52';
    setTimeout(() => {
      flash.style.opacity = '0.05';
      setTimeout(() => {
        flash.style.opacity = '0.38';
        setTimeout(() => {
          flash.style.opacity = '0';
        }, 80);
      }, 45);
    }, 60);
  }

  function startLightningCycle() {
    stopLightningCycle();
    function scheduleNext() {
      const delay = 6000 + Math.random() * 8000;
      lightningTimer = setTimeout(() => {
        if (currentChapter === 2) {
          triggerLightningFlash();
          scheduleNext();
        }
      }, delay);
    }
    scheduleNext();
  }

  function stopLightningCycle() {
    if (lightningTimer) {
      clearTimeout(lightningTimer);
      lightningTimer = null;
    }
    const flash = document.getElementById('lightning-flash-overlay');
    if (flash) flash.style.opacity = '0';
  }

  // ── 3. Continuous Novel Scroll & Anchor Navigation Engine ──
  let isNavigatingManually = false;
  let manualNavTimer = null;
  let currentScrollProgress = 0;

  function scrollToChapter(num) {
    num = Math.max(1, Math.min(4, parseInt(num, 10) || 1));
    const target = document.getElementById(`chapter-${num}`);
    if (target) {
      isNavigatingManually = true;
      if (manualNavTimer) clearTimeout(manualNavTimer);
      setChapterAtmosphere(num);

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      manualNavTimer = setTimeout(() => {
        isNavigatingManually = false;
      }, 1000);
    }
  }

  function setChapterAtmosphere(num) {
    num = Math.max(1, Math.min(4, parseInt(num, 10) || 1));
    if (currentChapter === num && document.body.classList.contains(`theme-chapter-${num}`)) {
      return;
    }
    currentChapter = num;

    // A. Update buttons in navigation bar
    for (let i = 1; i <= 4; i++) {
      const step = stepElements[i];
      const chap = document.getElementById(`chapter-${i}`);
      const isActive = (i === num);

      if (step) {
        if (isActive) {
          step.classList.add('active');
          step.setAttribute('aria-selected', 'true');
          step.setAttribute('tabindex', '0');
        } else {
          step.classList.remove('active');
          step.setAttribute('aria-selected', 'false');
          step.setAttribute('tabindex', '-1');
        }
      }

      if (chap) {
        if (isActive) {
          chap.classList.add('active-chapter');
        } else {
          chap.classList.remove('active-chapter');
        }
      }
    }

    // B. Update body theme class & Scenic Atmosphere plates
    document.body.classList.remove('theme-chapter-1', 'theme-chapter-2', 'theme-chapter-3', 'theme-chapter-4');
    document.body.classList.add(`theme-chapter-${num}`);

    for (let p = 1; p <= 4; p++) {
      const plate = document.querySelector(`.scenic-plate-${p}`);
      if (plate) {
        if (p === num) plate.classList.add('active');
        else plate.classList.remove('active');
      }
    }

    // C. Chapter Atmospheric Keyframes & Canvas particles
    const kf = atmosphericKeyframes[num - 1] || atmosphericKeyframes[0];
    currentParticleSpeed = kf.particleSpeed;
    currentParticleRGB1 = kf.particleColor1;
    currentParticleRGB2 = kf.particleColor2;

    // D. Distant Horizon Beacon (Chapter IV Revelation)
    if (beaconEmitter) {
      if (num === 4) {
        beaconEmitter.classList.add('beacon-revealed');
      } else {
        beaconEmitter.classList.remove('beacon-revealed');
      }
    }

    // E. Atmospheric Lightning Storm (Chapter II)
    if (num === 2) {
      startLightningCycle();
    } else {
      stopLightningCycle();
    }
  }

  // Cached DOM geometry metrics (Updated only on resize/init, zero layout thrashing on scroll)
  let cachedChapterTops = [0, 0, 0, 0];
  let cachedClimaxTop = 0;
  let cachedScaleHeight = 1000;
  let cachedTrackWidth = 580;

  function updateCachedMetrics() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    for (let i = 1; i <= 4; i++) {
      const chap = document.getElementById(`chapter-${i}`);
      if (chap) {
        const rect = chap.getBoundingClientRect();
        cachedChapterTops[i - 1] = rect.top + scrollY;
      }
    }
    if (climaxStage) {
      const rect = climaxStage.getBoundingClientRect();
      cachedClimaxTop = rect.top + scrollY;
    }
    const scaleLeft = document.querySelector('.codex-margin-scale.scale-left');
    if (scaleLeft) {
      cachedScaleHeight = scaleLeft.offsetHeight;
    }
    const track = document.querySelector('.silk-reading-thread-track');
    if (track) {
      cachedTrackWidth = track.offsetWidth;
    }
  }
  window.addEventListener('resize', updateCachedMetrics);

  function updateActiveChapterOnScroll() {
    if (isNavigatingManually) return;
    
    const viewportHeight = window.innerHeight;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight;

    // A. Scrolled near the bottom of document -> Chapter IV
    if (docHeight - (scrollY + viewportHeight) <= 140) {
      setChapterAtmosphere(4);
      return;
    }

    // B. At the very top -> Chapter I
    if (scrollY < 180) {
      setChapterAtmosphere(1);
      return;
    }

    // C. Optical focus line at reader's gaze level (~38% down viewport)
    const focusY = scrollY + viewportHeight * 0.38;
    let activeIndex = 1;
    for (let i = 3; i >= 0; i--) {
      if (focusY >= (cachedChapterTops[i] || 0) - 120) {
        activeIndex = i + 1;
        break;
      }
    }

    setChapterAtmosphere(activeIndex);
  }

  // ── Tab & Navigation Event Handlers ──
  Object.keys(stepElements).forEach(numStr => {
    const stepEl = stepElements[numStr];
    if (stepEl) {
      stepEl.addEventListener('click', () => {
        sfx.playClick();
        scrollToChapter(parseInt(numStr, 10));
      });
      stepEl.addEventListener('keydown', (e) => {
        let target = null;
        const current = parseInt(numStr, 10);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          target = current === 4 ? 1 : current + 1;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          target = current === 1 ? 4 : current - 1;
        }
        if (target) {
          e.preventDefault();
          scrollToChapter(target);
          const nextStep = stepElements[target];
          if (nextStep) nextStep.focus();
        }
      });
    }
  });

  // ── Reading Focus Beam & Gold Leaf Shimmer (Offloaded to Native IntersectionObserver) ──
  if ('IntersectionObserver' in window) {
    const focusObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reading-focus');
        } else {
          entry.target.classList.remove('reading-focus');
        }
      });
    }, {
      rootMargin: "-18% 0px -18% 0px",
      threshold: 0
    });
    readableElements.forEach(el => focusObserver.observe(el));

    const shimmerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gold-leaf-shimmer');
        } else {
          entry.target.classList.remove('gold-leaf-shimmer');
        }
      });
    }, {
      rootMargin: "-28% 0px -28% 0px",
      threshold: 0
    });
    shimmerElements.forEach(el => shimmerObserver.observe(el));
  } else {
    readableElements.forEach(el => el.classList.add('reading-focus'));
  }

  // ── High-Performance Liquid Physics Engine (LERP Damped Smooth Animations) ──
  let targetProgress = 0;
  let currentProgress = 0;
  let targetCompassAngle = 0;
  let currentCompassAngle = 0;
  let targetChartAngle = 0;
  let currentChartAngle = 0;
  let isPhysicsLoopRunning = false;

  // Reading Caliper Kinetic Physics (Dynamic inertial lag, pitch tilt & starlight glow)
  let currentCaliperDeflection = 0;
  let currentCaliperTilt = 0;
  let currentCaliperScale = 1;

  function physicsTick() {
    // Smooth damping factor: 0.14 provides instant tactile responsiveness with silky liquid easing
    const deltaProgress = targetProgress - currentProgress;
    currentProgress += deltaProgress * 0.14;

    // 1. Reading Focus Needle: Kinetic liquid inertia, tilt & active momentum glow
    // Pinned to reader eye-level (top: 38vh sticky); GPU translate3d & rotate adds organic physical inertia
    const scrollVelocity = deltaProgress * 70; // normalized momentum & direction
    const targetDeflection = Math.max(-14, Math.min(14, scrollVelocity * 16));
    const targetTilt = Math.max(-4.5, Math.min(4.5, scrollVelocity * 5.2));
    const targetScale = 1 + Math.min(0.09, Math.abs(scrollVelocity) * 0.08);

    currentCaliperDeflection += (targetDeflection - currentCaliperDeflection) * 0.14;
    currentCaliperTilt += (targetTilt - currentCaliperTilt) * 0.16;
    currentCaliperScale += (targetScale - currentCaliperScale) * 0.14;

    if (caliperEl) {
      caliperEl.style.transform = `translate3d(0, ${currentCaliperDeflection.toFixed(2)}px, 0) rotate(${currentCaliperTilt.toFixed(2)}deg) scale(${currentCaliperScale.toFixed(3)})`;
      
      if (Math.abs(scrollVelocity) > 0.06) {
        caliperEl.classList.add('caliper-active-glide');
      } else {
        caliperEl.classList.remove('caliper-active-glide');
      }
    }

    // 2. Silk Reading Thread (Zero layout reflow: pure GPU scaleX matrix)
    if (silkFill) {
      silkFill.style.transform = `scaleX(${currentProgress.toFixed(4)})`;
    }

    // 3. Thread Spark (Zero layout reflow: pure GPU translate3d)
    if (threadSpark) {
      const sparkX = currentProgress * cachedTrackWidth;
      threadSpark.style.transform = `translate3d(${sparkX.toFixed(1)}px, -50%, 0)`;
    }

    // 4. Chapter Nodes Ignition
    if (threadNode1) threadNode1.classList.add('ignited');
    if (threadNode2) threadNode2.classList.toggle('ignited', currentProgress >= 0.28);
    if (threadNode3) threadNode3.classList.toggle('ignited', currentProgress >= 0.60);
    if (threadNode4) threadNode4.classList.toggle('ignited', currentProgress >= 0.92);

    // 5. Compass Needle (Organic floating magnetic liquid damping)
    const deltaCompass = targetCompassAngle - currentCompassAngle;
    currentCompassAngle += deltaCompass * 0.10;
    if (compassNeedle) {
      compassNeedle.style.transform = `rotate(${currentCompassAngle.toFixed(1)}deg)`;
    }

    // 6. Celestial Chart Mesh (Slow 0° to 14° astronomical rotation)
    const deltaChart = targetChartAngle - currentChartAngle;
    currentChartAngle += deltaChart * 0.08;
    if (chartMesh) {
      chartMesh.style.transform = `rotate(${currentChartAngle.toFixed(2)}deg)`;
    }

    // Continue running until momentum completely settles
    const isPhysicsActive = Math.abs(deltaProgress) > 0.0001 || 
                           Math.abs(deltaCompass) > 0.05 || 
                           Math.abs(deltaChart) > 0.02 ||
                           Math.abs(currentCaliperDeflection) > 0.08 ||
                           Math.abs(currentCaliperTilt) > 0.08;

    if (isPhysicsActive) {
      requestAnimationFrame(physicsTick);
    } else {
      currentProgress = targetProgress;
      currentCompassAngle = targetCompassAngle;
      currentChartAngle = targetChartAngle;
      currentCaliperDeflection = 0;
      currentCaliperTilt = 0;
      currentCaliperScale = 1;
      if (caliperEl) {
        caliperEl.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
        caliperEl.classList.remove('caliper-active-glide');
      }
      isPhysicsLoopRunning = false;
    }
  }

  function startPhysicsLoop() {
    if (!isPhysicsLoopRunning) {
      isPhysicsLoopRunning = true;
      requestAnimationFrame(physicsTick);
    }
  }

  // Interactive Astrolabe Caliper Click & Sparkle
  if (caliperEl) {
    caliperEl.addEventListener('click', () => {
      sfx.playClick();
      caliperEl.classList.add('caliper-sparkle');
      setTimeout(() => caliperEl.classList.remove('caliper-sparkle'), 600);
    });
  }

  // Quick-Return Astrolabe Compass Click Handler
  if (compassBtn) {
    compassBtn.addEventListener('click', () => {
      sfx.playClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Unified Scroll Listener (Zero layout queries on hot scroll path)
  let chapterCheckPending = false;
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const maxScroll = Math.max(1, docHeight - winHeight);

    targetProgress = Math.max(0, Math.min(1, scrollY / maxScroll));
    targetCompassAngle = targetProgress * 540;
    targetChartAngle = targetProgress * 14;

    if (compassBtn) {
      if (scrollY > 350) {
        compassBtn.classList.add('compass-visible');
      } else {
        compassBtn.classList.remove('compass-visible');
      }
    }

    // Climax Stage Detection (Using cached offset: 0 DOM queries)
    if (climaxStage && cachedClimaxTop > 0) {
      const triggerThreshold = cachedClimaxTop - winHeight * 0.85;
      if (scrollY >= triggerThreshold) {
        if (!document.body.classList.contains('sandstorm-active')) {
          document.body.classList.add('sandstorm-active');
          try {
            localStorage.setItem('order_cipher_completed', 'true');
            localStorage.setItem('order_sandstorm_triggered', 'true');
            const activeSeeker = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
            localStorage.setItem(`seeker_${activeSeeker}_cipher_completed`, 'true');
          } catch (e) {}
        }
      } else if (scrollY < cachedClimaxTop - winHeight && !isRadioPlaying) {
        document.body.classList.remove('sandstorm-active');
      }
    }

    // Wake up physics engine
    startPhysicsLoop();

    // Lightweight throttled chapter theme check
    if (!chapterCheckPending) {
      chapterCheckPending = true;
      requestAnimationFrame(() => {
        updateActiveChapterOnScroll();
        chapterCheckPending = false;
      });
    }
  }, { passive: true });

  // Initial setup: initialize metrics, chapter atmosphere, and kickstart physics loop
  updateCachedMetrics();
  setChapterAtmosphere(1);
  startPhysicsLoop();
  setTimeout(updateCachedMetrics, 400); // recheck after web fonts settle

  // ── 4. Climax Sequence & Desert Radio Transceiver Engine ──
  const radioOverloadState = document.getElementById('radio-overload-state');
  const btnTransmitStory = document.getElementById('btn-transmit-story');
  const btnOpenStoryAgain = document.getElementById('btn-open-story-again');
  const radioModalOverlay = document.getElementById('radio-modal-overlay');
  const radioModalBackdrop = document.getElementById('radio-modal-backdrop');
  const btnCloseRadioModal = document.getElementById('btn-close-radio-modal');

  // Subtitle Data Synchronized with Master Broadcast (cartographer_sandstorm_emergency.mp3)
  const SANDSTORM_SUBTITLES = [
    { time: 0.0, text: "[ 142.85 MHz SHORTWAVE LOCKED · SOUTHERN SANDSTORM OVERRIDE... ]" },
    { time: 0.8, text: "\"SILVIA! SILVIA, CAN YOU HEAR ME THROUGH THE STATIC? THE STORM IS RIGHT ON TOP OF ME OUT HERE IN THE DUNES!\"" },
    { time: 7.92, text: "\"THOSE WORDS... YOU SPOKE THE VOW I CARVED INTO THAT BRASS DIAL FIFTY-SIX YEARS AGO! AFTER A DECADE OF WATCHING THE DISTANT LIGHT... YOU GAVE ME BACK MY TRUE NAME!\"" },
    { time: 21.40, text: "\"I TRACKED THE RAIDERS DOWN INTO THE DESERT, BUT THIS RED SANDSTORM CAUGHT ME IN THE OPEN! THEY FLED DEEPER INTO THE SANDS WITH OUR STOLEN ASTROLABE!\"" },
    { time: 31.24, text: "\"THE GALE IS COLOSSAL—IT IS SEALING THE MOUNTAIN PASS BEHIND YOU! OUR JOURNEY OF MOUNTAIN NUMBERS IS FINISHED!\"" },
    { time: 39.68, text: "\"I MUST FIND SHELTER IN THE CANYON RUINS BEFORE THIS TEMPEST SWALLOWS ME WHOLE! WHEN THE WINDS FINALLY DIE DOWN, YOU MUST DESCEND INTO THE DESERT.\"" },
    { time: 50.72, text: "\"OPEN THE NEXT SHEET OF MY JOURNAL! STUDY THE DESERT PATH—DOWN HERE, MOUNTAIN EQUATIONS HAVE NO POWER; ONLY THE ANCIENT LANGUAGES OF THE SAND CAN GUIDE YOU!\"" },
    { time: 62.69, text: "\"THE SAND IS RIPPING MY ANTENNA AWAY! THE CARRIER IS DYING! ONCE YOU REACH THE DESERT THRESHOLD, WE WILL FIND THE DESERT ORACLE TOGETHER AND RECOVER THE ASTROLABE!\"" },
    { time: 75.57, text: "\"HOLD YOUR GROUND UNTIL THE GALE CLEARS! I WILL BE WAITING FOR YOU AT THE EDGE OF THE SANDS!\"" },
    { time: 83.21, text: "[ ANTENNA MAST TORN DOWN · CARRIER COLLAPSED · RECONNECT IN THE DESERT PATH ]" }
  ];

  // Radio Transceiver DOM Elements
  const radioAudio = document.getElementById('radio-audio-element');
  const btnTuneBroadcast = document.getElementById('btn-tune-broadcast');
  const radioDeckControls = document.getElementById('radio-deck-controls');
  const radioTimeCurrent = document.getElementById('radio-time-current');
  const radioTimeTotal = document.getElementById('radio-time-total');
  const radioSeekSlider = document.getElementById('radio-seek-slider');
  const radioScrubberFill = document.getElementById('radio-scrubber-fill');
  const btnRadioPlayPause = document.getElementById('btn-radio-play-pause');
  const radioPlayIcon = document.getElementById('radio-play-icon');
  const radioPlayLabel = document.getElementById('radio-play-label');
  const btnRadioRestart = document.getElementById('btn-radio-restart');
  const btnRadioMute = document.getElementById('btn-radio-mute');
  const radioMuteIcon = document.getElementById('radio-mute-icon');
  const radioVolSlider = document.getElementById('radio-vol-slider');
  const radioVolPercent = document.getElementById('radio-vol-percent');
  const transcriptBox = document.getElementById('sandstorm-transcript-box');
  const transcriptText = document.getElementById('sandstorm-transcript-text');
  const transcriptSub = document.getElementById('sandstorm-transcript-sub');
  const scopeCanvas = document.getElementById('radio-oscilloscope-canvas');
  const scopeCtx = scopeCanvas ? scopeCanvas.getContext('2d') : null;

  let isRadioPlaying = false;
  let isSeekingRadio = false;
  let activeSubtitleIndex = -1;
  let prevRadioVolume = 1.0;

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  function resizeScopeCanvas() {
    if (!scopeCanvas) return;
    scopeCanvas.width = scopeCanvas.offsetWidth || 600;
    scopeCanvas.height = scopeCanvas.offsetHeight || 70;
  }
  window.addEventListener('resize', resizeScopeCanvas);

  function updateSubtitles(sec) {
    if (!transcriptText) return;
    let targetIdx = 0;
    for (let i = 0; i < SANDSTORM_SUBTITLES.length; i++) {
      if (sec >= SANDSTORM_SUBTITLES[i].time) {
        targetIdx = i;
      }
    }
    if (targetIdx !== activeSubtitleIndex) {
      activeSubtitleIndex = targetIdx;
      transcriptText.classList.add('line-switching');
      setTimeout(() => {
        transcriptText.innerText = SANDSTORM_SUBTITLES[targetIdx].text;
        transcriptText.classList.remove('line-switching');
      }, 150);
    }
  }

  // CRT Phosphor Oscilloscope (Amber/Desert Glow)
  function renderPhosphorScope() {
    requestAnimationFrame(renderPhosphorScope);
    if (!scopeCanvas || !scopeCtx) return;

    const sw = scopeCanvas.width;
    const sh = scopeCanvas.height;
    scopeCtx.clearRect(0, 0, sw, sh);

    // Central guideline
    scopeCtx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
    scopeCtx.lineWidth = 1;
    scopeCtx.beginPath();
    scopeCtx.moveTo(0, sh * 0.5);
    scopeCtx.lineTo(sw, sh * 0.5);
    scopeCtx.stroke();

    const t = radioAudio ? (radioAudio.currentTime || 0) : 0;
    const isLive = isRadioPlaying && radioAudio && !radioAudio.paused;
    const timeNow = Date.now() * 0.005;

    if (isLive) {
      // Audio speech cadence & storm tremor
      const energy = (0.5 + Math.sin(t * 7.5) * 0.28 + Math.cos(t * 18.0) * 0.18) * (radioAudio.muted ? 0 : radioAudio.volume);
      const isStormPeak = energy > 0.72;

      scopeCtx.lineWidth = isStormPeak ? 2.5 : 1.8;
      scopeCtx.strokeStyle = isStormPeak ? '#ef4444' : '#f59e0b';
      scopeCtx.shadowColor = isStormPeak ? '#ef4444' : '#fbbf24';
      scopeCtx.shadowBlur = isStormPeak ? 14 : 7;
      scopeCtx.beginPath();

      const points = 72;
      const step = sw / points;
      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const carrier = Math.sin(i * 0.22 + timeNow * 3.8);
        const voiceMod = Math.sin(i * 0.42 - timeNow * 5.2) * Math.cos(i * 0.14);
        const noise = (Math.random() - 0.5) * (isStormPeak ? 10 : 5);
        const amp = energy * (sh * 0.42);
        const y = (sh * 0.5) + (carrier * voiceMod * amp) + noise;

        if (i === 0) scopeCtx.moveTo(x, y);
        else scopeCtx.lineTo(x, y);
      }
      scopeCtx.stroke();
      scopeCtx.shadowBlur = 0;
    } else {
      // Idle carrier sine wave
      const idleTime = Date.now() * 0.003;
      scopeCtx.lineWidth = 1.4;
      scopeCtx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      scopeCtx.beginPath();
      for (let x = 0; x < sw; x += 4) {
        const y = (sh * 0.5) + Math.sin(x * 0.05 + idleTime) * 3.5;
        if (x === 0) scopeCtx.moveTo(x, y);
        else scopeCtx.lineTo(x, y);
      }
      scopeCtx.stroke();
    }
  }

  function playRadio() {
    if (!radioAudio) return;
    resizeScopeCanvas();
    if (btnTuneBroadcast) btnTuneBroadcast.style.display = 'none';
    if (radioDeckControls) radioDeckControls.style.display = 'flex';

    if (transcriptSub) {
      transcriptSub.innerText = "RECEIVING LIVE EMERGENCY BROADCAST · ICARUS TRANSMITTING AMIDST GALE";
    }

    radioAudio.play().then(() => {
      isRadioPlaying = true;
      if (radioPlayIcon) radioPlayIcon.innerText = "❚❚";
      if (radioPlayLabel) radioPlayLabel.innerText = "Pause";
      if (radioOverloadState) {
        radioOverloadState.textContent = 'SIGNAL CRITICAL · SANDSTORM ENGULFING ANTENNA';
        radioOverloadState.style.color = '#ef4444';
      }
    }).catch(err => {
      console.warn("Autoplay notice:", err.message);
      isRadioPlaying = false;
      if (radioPlayIcon) radioPlayIcon.innerText = "▶";
      if (radioPlayLabel) radioPlayLabel.innerText = "Play";
    });
  }

  function pauseRadio() {
    if (!radioAudio) return;
    radioAudio.pause();
    isRadioPlaying = false;
    if (radioPlayIcon) radioPlayIcon.innerText = "▶";
    if (radioPlayLabel) radioPlayLabel.innerText = "Resume";
    if (transcriptSub) {
      transcriptSub.innerText = "CARRIER PAUSED · 142.85 MHz SQUELCH OPEN";
    }
  }

  function initRadioTransceiver() {
    if (!radioAudio) return;

    if (btnTuneBroadcast) {
      btnTuneBroadcast.addEventListener('click', () => {
        sfx.playClick();
        playRadio();
      });
    }

    if (btnRadioPlayPause) {
      btnRadioPlayPause.addEventListener('click', () => {
        sfx.playClick();
        if (isRadioPlaying) pauseRadio();
        else playRadio();
      });
    }

    if (btnRadioRestart) {
      btnRadioRestart.addEventListener('click', () => {
        sfx.playClick();
        radioAudio.currentTime = 0;
        playRadio();
      });
    }

    if (btnRadioMute) {
      btnRadioMute.addEventListener('click', () => {
        radioAudio.muted = !radioAudio.muted;
        if (radioMuteIcon) radioMuteIcon.innerText = radioAudio.muted ? "🔇" : "🔊";
      });
    }

    if (radioVolSlider) {
      radioVolSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        radioAudio.volume = val;
        radioAudio.muted = (val === 0);
        if (radioMuteIcon) radioMuteIcon.innerText = radioAudio.muted ? "🔇" : "🔊";
        if (radioVolPercent) radioVolPercent.innerText = Math.round(val * 100) + "%";
      });
    }

    if (radioSeekSlider) {
      radioSeekSlider.addEventListener('input', (e) => {
        isSeekingRadio = true;
        const val = parseFloat(e.target.value);
        if (radioTimeCurrent) radioTimeCurrent.innerText = formatTime(val);
        if (radioScrubberFill && radioAudio.duration) {
          const pct = (val / radioAudio.duration) * 100;
          radioScrubberFill.style.width = pct + "%";
        }
      });
      radioSeekSlider.addEventListener('change', (e) => {
        radioAudio.currentTime = parseFloat(e.target.value);
        isSeekingRadio = false;
      });
    }

    radioAudio.addEventListener('loadedmetadata', () => {
      if (radioTimeTotal && radioAudio.duration) {
        radioTimeTotal.innerText = formatTime(radioAudio.duration);
        if (radioSeekSlider) radioSeekSlider.max = radioAudio.duration.toFixed(1);
      }
    });

    radioAudio.addEventListener('timeupdate', () => {
      const cur = radioAudio.currentTime;
      const dur = radioAudio.duration || 82.46;
      if (!isSeekingRadio) {
        if (radioTimeCurrent) radioTimeCurrent.innerText = formatTime(cur);
        if (radioSeekSlider) radioSeekSlider.value = cur;
        if (radioScrubberFill) {
          const pct = (cur / dur) * 100;
          radioScrubberFill.style.width = pct + "%";
        }
      }
      updateSubtitles(cur);
    });

    radioAudio.addEventListener('ended', () => {
      isRadioPlaying = false;
      if (radioPlayIcon) radioPlayIcon.innerText = "↺";
      if (radioPlayLabel) radioPlayLabel.innerText = "Replay";
      if (radioOverloadState) {
        radioOverloadState.textContent = 'CARRIER COLLAPSED // ANTENNA LOST';
        radioOverloadState.style.color = '#9ca3af';
      }
      if (transcriptSub) {
        transcriptSub.innerText = "TRANSMISSION CONCLUDED · PROCEED TO THE DESERT PATH";
      }
      const btnDesert = document.getElementById('btn-climax-desert');
      if (btnDesert) {
        btnDesert.style.animation = 'alarmPulse 1.4s infinite alternate';
      }
    });

    renderPhosphorScope();
  }

  function triggerClimaxSequence() {
    sfx.playClick();
    sfx.playProphecyResolved();

    // Mark completion in storage for Hub navigation and route map
    try {
      localStorage.setItem('order_cipher_completed', 'true');
      localStorage.setItem('order_sandstorm_triggered', 'true');
      const activeSeeker = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
      localStorage.setItem(`seeker_${activeSeeker}_cipher_completed`, 'true');
    } catch (e) {}

    // Atmosphere Shift & Modal Display for Emergency Radio
    openRadioModal();
  }

  function openRadioModal() {
    if (!radioModalOverlay) return;
    radioModalOverlay.classList.add('active');
    radioModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sandstorm-active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      resizeScopeCanvas();
      playRadio();
    }, 300);
  }

  function closeRadioModal() {
    if (!radioModalOverlay) return;
    radioModalOverlay.classList.remove('active');
    radioModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sandstorm-active');
    document.body.style.overflow = '';
    pauseRadio();
  }

  // ── 4B. Climax Reward & Spoils Modal Controller ──
  const rewardModalOverlay = document.getElementById('reward-modal-overlay');
  const rewardModalBackdrop = document.getElementById('reward-modal-backdrop');
  const btnCloseRewardModal = document.getElementById('btn-close-reward-modal');
  const btnClimaxDesert = document.getElementById('btn-climax-desert');

  function openRewardModal() {
    if (radioModalOverlay) closeRadioModal();
    if (!rewardModalOverlay) return;

    rewardModalOverlay.classList.add('active');
    rewardModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Persist all completion flags to local storage
    try {
      localStorage.setItem('order_cipher_completed', 'true');
      localStorage.setItem('order_sandstorm_triggered', 'true');
      localStorage.setItem('order_desert_path_unlocked', 'true');
      localStorage.setItem('order_cipher_reward_claimed', 'true');
      const activeSeeker = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
      localStorage.setItem(`seeker_${activeSeeker}_cipher_completed`, 'true');
      localStorage.setItem(`seeker_silvia_cipher_completed`, 'true');
    } catch (e) {}

    sfx.playProphecyResolved();
  }

  function closeRewardModal() {
    if (!rewardModalOverlay) return;
    rewardModalOverlay.classList.remove('active');
    rewardModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnClimaxDesert) {
    btnClimaxDesert.addEventListener('click', () => {
      sfx.playClick();
      openRewardModal();
    });
  }

  if (btnCloseRewardModal) {
    btnCloseRewardModal.addEventListener('click', () => {
      sfx.playClick();
      closeRewardModal();
    });
  }

  if (rewardModalBackdrop) {
    rewardModalBackdrop.addEventListener('click', () => {
      sfx.playClick();
      closeRewardModal();
    });
  }

  if (btnTransmitStory) {
    btnTransmitStory.addEventListener('click', triggerClimaxSequence);
  }

  if (btnCloseRadioModal) {
    btnCloseRadioModal.addEventListener('click', () => {
      sfx.playClick();
      closeRadioModal();
    });
  }

  if (radioModalBackdrop) {
    radioModalBackdrop.addEventListener('click', () => {
      sfx.playClick();
      closeRadioModal();
    });
  }

  if (btnOpenStoryAgain) {
    btnOpenStoryAgain.addEventListener('click', () => {
      sfx.playClick();
      closeRadioModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (rewardModalOverlay && rewardModalOverlay.classList.contains('active')) {
        closeRewardModal();
      } else if (radioModalOverlay && radioModalOverlay.classList.contains('active')) {
        closeRadioModal();
      }
    }
  });

  // Check URL triggers (e.g. ?mode=radio or #reward)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (urlParams.get('mode') === 'radio' || hash === '#radio' || hash === '#radio-modal-overlay') {
      setTimeout(openRadioModal, 500);
    } else if (urlParams.get('mode') === 'reward' || hash === '#reward' || hash === '#reward-modal-overlay') {
      setTimeout(openRewardModal, 500);
    }
  } catch (e) {}

  // Initialize Transceiver Engine
  initRadioTransceiver();

  // ── 5. Atmospheric Continuous Particle Canvas Engine ──
  const sandCanvas = document.getElementById('sandstorm-canvas');
  if (sandCanvas) {
    const ctx = sandCanvas.getContext('2d');
    let width = sandCanvas.width = window.innerWidth;
    let height = sandCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = sandCanvas.width = window.innerWidth;
      height = sandCanvas.height = window.innerHeight;
    });

    const GRAIN_COUNT = 160;
    const grains = [];
    for (let i = 0; i < GRAIN_COUNT; i++) {
      grains.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -(Math.random() * 2.8 + 0.8),
        vy: (Math.random() - 0.25) * 0.8,
        size: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.5 + 0.25,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        isSpikeStar: Math.random() < 0.14,
      });
    }

    let animTime = 0;

    function renderAtmosphere() {
      ctx.clearRect(0, 0, width, height);
      animTime += 0.02;

      const isStorm = document.body.classList.contains('sandstorm-active');
      const activeSpeedMult = isStorm ? 3.6 : currentParticleSpeed;

      const c1 = isStorm ? [239, 68, 68] : currentParticleRGB1;
      const c2 = isStorm ? [249, 115, 22] : currentParticleRGB2;
      const c1Str = c1.join(', ');
      const c2Str = c2.join(', ');

      for (let g of grains) {
        g.phase += g.twinkleSpeed;
        const twinkle = Math.sin(g.phase) * 0.35 + 0.65;

        if (currentChapter === 4 && !isStorm) {
          // Chapter IV: Golden stardust & embers float upwards toward the night sky
          g.x += g.vx * 0.35 * activeSpeedMult;
          g.y -= (Math.abs(g.vy) + 0.45) * activeSpeedMult;
          if (g.y < -15) {
            g.y = height + 15;
            g.x = Math.random() * width;
          }
        } else if (currentChapter === 3 && !isStorm) {
          // Chapter III: Cold ash flakes drift slowly downward with gentle horizontal sway
          g.x += (Math.sin(animTime + g.phase) * 0.6 + g.vx * 0.3) * activeSpeedMult;
          g.y += (Math.abs(g.vy) * 0.5 + 0.4) * activeSpeedMult;
          if (g.y > height + 15) {
            g.y = -15;
            g.x = Math.random() * width;
          }
        } else if (currentChapter === 2 || isStorm) {
          // Chapter II & Climax: Fast horizontal tempest gusts with wind streaks
          g.x += (g.vx * 2.4) * activeSpeedMult;
          g.y += (g.vy * 1.5 + Math.sin(animTime * 2 + g.phase) * 0.4) * activeSpeedMult;

          if (g.x < -30) {
            g.x = width + Math.random() * 40;
            g.y = Math.random() * height;
          }
          if (g.y > height + 20) g.y = -10;
          if (g.y < -20) g.y = height + 10;
        } else {
          // Chapter I: Crystalline alpine stars & slow silver stardust drift
          g.x += g.vx * 0.6 * activeSpeedMult;
          g.y += g.vy * 0.4 * activeSpeedMult;

          if (g.x < -15) {
            g.x = width + Math.random() * 20;
            g.y = Math.random() * height;
          }
          if (g.y > height + 15) g.y = -10;
          if (g.y < -15) g.y = height + 10;
        }

        const isSecondary = (g.phase % 2 > 1);
        ctx.fillStyle = isSecondary ? `rgb(${c2Str})` : `rgb(${c1Str})`;
        const finalAlpha = isStorm 
          ? Math.min(1, g.alpha * 1.4) 
          : (currentChapter === 1 ? g.alpha * twinkle : g.alpha);

        ctx.globalAlpha = Math.max(0.08, Math.min(1, finalAlpha));

        if ((currentChapter === 2 || isStorm) && g.size > 1.2) {
          // Draw streak tail for windstorm
          ctx.beginPath();
          ctx.moveTo(g.x, g.y);
          ctx.lineTo(g.x + 14 * (isStorm ? 2 : 1), g.y - g.vy * 4);
          ctx.strokeStyle = `rgb(${c1Str})`;
          ctx.lineWidth = g.size * 0.8;
          ctx.stroke();
        } else {
          // Draw circular star / grain
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.size * (isStorm ? 1.25 : 1), 0, Math.PI * 2);
          ctx.fill();

          // Delicate 4-point cross diffraction spike for bright stars in Chapter 1 & 4
          if ((currentChapter === 1 || currentChapter === 4) && g.isSpikeStar && g.size > 1.4 && twinkle > 0.75) {
            const spikeLen = g.size * 4.2 * twinkle;
            ctx.strokeStyle = isSecondary ? `rgba(${c2Str}, 0.45)` : `rgba(${c1Str}, 0.55)`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(g.x - spikeLen, g.y);
            ctx.lineTo(g.x + spikeLen, g.y);
            ctx.moveTo(g.x, g.y - spikeLen);
            ctx.lineTo(g.x, g.y + spikeLen);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      requestAnimationFrame(renderAtmosphere);
    }

    requestAnimationFrame(renderAtmosphere);
  }

})();
