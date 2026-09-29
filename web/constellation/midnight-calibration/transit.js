/**
 * THE ECLIPSE ORDER · THE DESERT PATH
 * Station 08: The Midnight Transit Relay Controller
 * High-Intensity Emergency Countdown, Tactical Procedural Foley,
 * Sheet 6 Side B Decryption & Victory Radio Epilogue
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const emergencyDigitsMain = document.getElementById('emergency-timer-main');
  const emergencyDigitsMs = document.getElementById('emergency-timer-ms');
  const carrierMeterFill = document.getElementById('carrier-meter-fill');
  const carrierMeterPct = document.getElementById('carrier-meter-pct');
  const emergencyStatusCallout = document.getElementById('emergency-status-callout');
  const statusCalloutText = document.getElementById('status-callout-text');
  const mainTimerBanner = document.getElementById('main-timer-banner');

  // Sticky HUD Elements
  const stickyHud = document.getElementById('sticky-countdown-hud');
  const stickyTimerMain = document.getElementById('sticky-timer-main');
  const stickyTimerMs = document.getElementById('sticky-timer-ms');
  const stickyStatusLabel = document.getElementById('sticky-status-label');
  const stickySignalPct = document.getElementById('sticky-signal-pct');
  const stickyMeterFill = document.getElementById('sticky-meter-fill');

  // Overlay FX & Buttons
  const emergencyVignettePulse = document.getElementById('emergency-vignette-pulse');
  const flareScreenFlash = document.getElementById('flare-screen-flash');

  const btnSignalFlare = document.getElementById('btn-signal-flare');
  const btnSignalFlareBanner = document.getElementById('btn-signal-flare-banner');
  const btnStickyFlare = document.getElementById('btn-sticky-flare');

  const btnMainAudioToggle = document.getElementById('btn-main-audio-toggle');
  const mainAudioIcon = document.getElementById('main-audio-icon');
  const btnStickyAudioToggle = document.getElementById('btn-sticky-audio-toggle');
  const stickyAudioIcon = document.getElementById('sticky-audio-icon');

  const btnBroadcastPacket = document.getElementById('btn-broadcast-packet');

  // Puzzle Inputs
  const inputDistance = document.getElementById('input-transit-distance');
  const inputPolygon = document.getElementById('input-transit-polygon');
  const inputAnchor1 = document.getElementById('input-anchor-1');
  const inputAnchor2 = document.getElementById('input-anchor-2');
  const hudFeedback = document.getElementById('transit-hud-feedback');

  const inputSection = document.getElementById('emergency-cipher-card');
  const victoryCard = document.getElementById('victory-epilogue');
  const btnReplayCalibration = document.getElementById('btn-replay-calibration');

  // Victory Audio Elements & Transport Controls
  const victoryAudio = document.getElementById('victory-audio-element');
  const victoryCanvas = document.getElementById('victory-oscilloscope-canvas');
  let victoryCtx = null;
  if (victoryCanvas) victoryCtx = victoryCanvas.getContext('2d');
  const victoryTeletype = document.getElementById('victory-teletype-box');

  const btnVictoryPlay = document.getElementById('btn-victory-play');
  const btnVictoryPause = document.getElementById('btn-victory-pause');
  const btnVictoryReplay = document.getElementById('btn-victory-replay');
  const btnVictoryMute = document.getElementById('btn-victory-mute');
  const victoryMuteIcon = document.getElementById('victory-mute-icon');
  const victorySeekSlider = document.getElementById('victory-seek-slider');
  const victoryScrubberFill = document.getElementById('victory-scrubber-fill');
  const victoryTimeCurrent = document.getElementById('victory-time-current');
  const victoryTimeTotal = document.getElementById('victory-time-total');

  // --- Countdown & Escalation State ---
  const INITIAL_DURATION_MS = 15 * 60 * 1000; // 15:00 minutes
  const MAX_DURATION_MS = 25 * 60 * 1000;     // 25:00 max cap
  let endTime = Date.now() + INITIAL_DURATION_MS;
  let countdownTimerId = null;
  let currentTier = 'amber'; // 'amber' (>10m), 'orange' (5-10m), 'red' (<5m)
  let lastTickSecond = -1;
  let isTimerActive = true;
  let isVictoryActive = false;
  let victoryAnimId = null;

  // --- Audio State & Web Audio Synthesizer ---
  let isAudioMuted = false;
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Tactical Foley Sound Synthesizers
  function playTickSound() {
    if (isAudioMuted || !isTimerActive) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const t = ctx.currentTime;

    // High mechanical escapement click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.022);

    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.025);

    // Subtle sub-bass mechanical dampener
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(62, t);
    subOsc.frequency.exponentialRampToValueAtTime(38, t + 0.045);

    subGain.gain.setValueAtTime(0.05, t);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.05);
  }

  function playHeartbeatSound() {
    if (isAudioMuted || !isTimerActive) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Lub (first pulse)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(54, t);
    osc1.frequency.exponentialRampToValueAtTime(35, t + 0.075);
    gain1.gain.setValueAtTime(0.12, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.08);

    // Dub (second pulse ~110ms later)
    const t2 = t + 0.11;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(46, t2);
    osc2.frequency.exponentialRampToValueAtTime(30, t2 + 0.085);
    gain2.gain.setValueAtTime(0.14, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.085);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.09);

    // High urgent click
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'sawtooth';
    click.frequency.setValueAtTime(2600, t2);
    click.frequency.exponentialRampToValueAtTime(500, t2 + 0.018);
    clickGain.gain.setValueAtTime(0.035, t2);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.018);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(t2);
    click.stop(t2 + 0.02);
  }

  function playKlaxonAlert() {
    if (isAudioMuted || !isTimerActive) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    [0, 0.14].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(640, t + offset);
      osc.frequency.setValueAtTime(880, t + offset + 0.05);

      gain.gain.setValueAtTime(0.08, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.12);
    });
  }

  function playFlareSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. Rocket launch whoosh: noise buffer swept upward
    const bufferSize = ctx.sampleRate * 0.55;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + 0.45);
    filter.Q.setValueAtTime(3.2, t);

    const whooshGain = ctx.createGain();
    whooshGain.gain.setValueAtTime(0.01, t);
    whooshGain.gain.linearRampToValueAtTime(0.25, t + 0.35);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    whiteNoise.connect(filter);
    filter.connect(whooshGain);
    whooshGain.connect(ctx.destination);
    whiteNoise.start(t);
    whiteNoise.stop(t + 0.55);

    // 2. Flare detonation pop & sub-bass resonance at 0.42s
    const tBurst = t + 0.42;
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(95, tBurst);
    boomOsc.frequency.exponentialRampToValueAtTime(28, tBurst + 0.65);

    boomGain.gain.setValueAtTime(0.28, tBurst);
    boomGain.gain.exponentialRampToValueAtTime(0.001, tBurst + 0.65);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(tBurst);
    boomOsc.stop(tBurst + 0.7);

    // 3. Magnesium crackle / sparkle tone
    const crackleOsc = ctx.createOscillator();
    const crackleGain = ctx.createGain();
    crackleOsc.type = 'triangle';
    crackleOsc.frequency.setValueAtTime(1600, tBurst);
    crackleOsc.frequency.exponentialRampToValueAtTime(800, tBurst + 0.3);

    crackleGain.gain.setValueAtTime(0.07, tBurst);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, tBurst + 0.3);

    crackleOsc.connect(crackleGain);
    crackleGain.connect(ctx.destination);
    crackleOsc.start(tBurst);
    crackleOsc.stop(tBurst + 0.35);
  }

  function toggleAudio() {
    getAudioCtx();
    isAudioMuted = !isAudioMuted;
    updateAudioToggleUI();
  }

  function updateAudioToggleUI() {
    if (mainAudioIcon) {
      mainAudioIcon.textContent = isAudioMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
    }
    if (stickyAudioIcon) {
      stickyAudioIcon.textContent = isAudioMuted ? '🔇' : '🔊';
    }
  }

  // --- VICTORY AUDIO SCRIPT (DISPATCH 08-B: THE DESERT ORACLE) ---
  const VICTORY_LINES = [
    { t: 1.2, dur: 6.33, text: "Silvia...! Silvia, do you copy me? The signal... it punched through the electrostatic gale!" },
    { t: 8.68, dur: 11.37, text: "Two thousand and ninety light-years... the celestial hexagon... anchored between Achernar and Polaris! By the stars, you have done it!" },
    { t: 21.2, dur: 7.57, text: "The storm is tearing the world apart out here! The winds are shifting entire mountains of stone and sand!" },
    { t: 29.92, dur: 13.13, text: "All previous maps of the desert are dead paper now. The crescent dunes have slid miles south, ancient ravines are buried, and the raiders are as lost and stranded as we are in this shifting sea." },
    { t: 44.2, dur: 16.61, text: "We lost their trail, but we hold the three stellar constants! In the deep desert, beyond the moved dunes, dwells the only ancient soul who can read the shifted sands: The Desert Oracle." },
    { t: 61.96, dur: 7.45, text: "When this tempest subsides, we will navigate by your three chords directly to the Oracle's sanctuary!" },
    { t: 70.57, dur: 8.37, text: "Record every number in your Ledger, Silvia. Rest now while the winds blow. The Desert Path awaits us. Stay safe. Out." }
  ];

  // --- Main Initializer ---
  function initTransitPage() {
    const openVictoryArchive = window.location.hash === '#victory';

    if (!openVictoryArchive) {
      startHighPrecisionCountdown();
      setupStickyHudScroll();
    } else {
      isTimerActive = false;
      if (inputSection) inputSection.style.display = 'none';
      if (mainTimerBanner) mainTimerBanner.style.display = 'none';
      if (emergencyVignettePulse) emergencyVignettePulse.style.display = 'none';
      if (stickyHud) stickyHud.classList.remove('visible');
    }

    // Flare Triggers (Banner, Sticky HUD, and Bottom Cipher Row)
    if (btnSignalFlare) btnSignalFlare.addEventListener('click', fireEmergencyFlare);
    if (btnSignalFlareBanner) btnSignalFlareBanner.addEventListener('click', fireEmergencyFlare);
    if (btnStickyFlare) btnStickyFlare.addEventListener('click', fireEmergencyFlare);

    // Audio Toggles
    if (btnMainAudioToggle) btnMainAudioToggle.addEventListener('click', toggleAudio);
    if (btnStickyAudioToggle) btnStickyAudioToggle.addEventListener('click', toggleAudio);

    // Enable Web Audio context on user's first gesture
    const unlockAudio = () => {
      getAudioCtx();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Packet Broadcast
    if (btnBroadcastPacket) {
      btnBroadcastPacket.addEventListener('click', verifyTransitSubmission);
    }

    if (btnReplayCalibration) {
      btnReplayCalibration.addEventListener('click', () => {
        window.location.href = 'index.html#replay';
      });
    }

    // Victory Audio Transport Controls
    if (btnVictoryPlay && victoryAudio) {
      btnVictoryPlay.addEventListener('click', () => {
        getAudioCtx();
        victoryAudio.play();
      });
    }

    if (btnVictoryPause && victoryAudio) {
      btnVictoryPause.addEventListener('click', () => {
        victoryAudio.pause();
      });
    }

    if (btnVictoryReplay && victoryAudio) {
      btnVictoryReplay.addEventListener('click', () => {
        getAudioCtx();
        victoryAudio.currentTime = 0;
        victoryAudio.play();
      });
    }

    if (btnVictoryMute && victoryAudio) {
      btnVictoryMute.addEventListener('click', () => {
        victoryAudio.muted = !victoryAudio.muted;
        if (victoryMuteIcon) {
          victoryMuteIcon.textContent = victoryAudio.muted ? '🔇' : '🔊';
        }
      });
    }

    if (victorySeekSlider && victoryAudio) {
      victorySeekSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        victoryAudio.currentTime = val;
      });
    }

    if (victoryAudio) {
      victoryAudio.addEventListener('timeupdate', updateVictoryTeletype);
      victoryAudio.addEventListener('ended', onVictoryAudioEnded);
      victoryAudio.addEventListener('loadedmetadata', () => {
        if (victoryTimeTotal) {
          victoryTimeTotal.textContent = formatTime(victoryAudio.duration || 82.3);
        }
        if (victorySeekSlider) {
          victorySeekSlider.max = (victoryAudio.duration || 82.3).toString();
        }
      });
    }

    if (window.location.hash === '#victory' && victoryCard) {
      victoryCard.classList.add('active');
      triggerVictoryRadio();
    }
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  }

  // --- 1. High-Intensity Kinetic Countdown Engine ---
  function startHighPrecisionCountdown() {
    if (countdownTimerId) clearInterval(countdownTimerId);

    // High frequency update loop (50ms) for ultra-fluid tenths-of-a-second readout
    countdownTimerId = setInterval(updateHighPrecisionTick, 50);
    updateHighPrecisionTick();
  }

  function updateHighPrecisionTick() {
    if (!isTimerActive) return;

    const remainingMs = Math.max(0, endTime - Date.now());
    const totalSecs = Math.floor(remainingMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((remainingMs % 1000) / 100);

    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const tenthsStr = `.${tenths}`;

    // Update Banner Digits
    if (emergencyDigitsMain) emergencyDigitsMain.textContent = timeStr;
    if (emergencyDigitsMs) emergencyDigitsMs.textContent = tenthsStr;

    // Update Sticky HUD Digits
    if (stickyTimerMain) stickyTimerMain.textContent = timeStr;
    if (stickyTimerMs) stickyTimerMs.textContent = tenthsStr;

    // Signal Integrity Percentage (15:00 = 100% nominal baseline)
    const ratio = Math.max(0, Math.min(1, remainingMs / INITIAL_DURATION_MS));
    const pctStr = (ratio * 100).toFixed(1) + '%';

    if (carrierMeterFill) carrierMeterFill.style.width = pctStr;
    if (carrierMeterPct) carrierMeterPct.textContent = pctStr;
    if (stickyMeterFill) stickyMeterFill.style.width = pctStr;
    if (stickySignalPct) stickySignalPct.textContent = pctStr;

    // Tactical Audio Scheduling
    if (totalSecs !== lastTickSecond && remainingMs > 0) {
      lastTickSecond = totalSecs;
      if (currentTier === 'red') {
        playHeartbeatSound();
      } else {
        playTickSound();
      }
    }

    // Urgency Escalation Tier Evaluation
    evaluateUrgencyTiers(remainingMs, ratio);

    // Carrier Collapse Detection
    if (remainingMs <= 0) {
      isTimerActive = false;
      clearInterval(countdownTimerId);
      onCarrierCollapse();
    }
  }

  function evaluateUrgencyTiers(remainingMs, ratio) {
    let nextTier = 'amber';
    if (remainingMs <= 5 * 60 * 1000) {
      nextTier = 'red';
    } else if (remainingMs <= 10 * 60 * 1000) {
      nextTier = 'orange';
    }

    // Tier Change Trigger
    if (nextTier !== currentTier) {
      const isEscalation = (nextTier === 'red' && currentTier !== 'red') || 
                           (nextTier === 'orange' && currentTier === 'amber');
      currentTier = nextTier;

      applyTierStyles(currentTier);

      if (isEscalation) {
        playKlaxonAlert();
      }
    }
  }

  function applyTierStyles(tier) {
    // 1. Main Banner
    if (mainTimerBanner) {
      mainTimerBanner.classList.remove('tier-orange', 'tier-red');
      if (tier === 'orange') mainTimerBanner.classList.add('tier-orange');
      if (tier === 'red') mainTimerBanner.classList.add('tier-red');
    }

    // 2. Full-Screen Screen Vignette Pulse
    if (emergencyVignettePulse) {
      emergencyVignettePulse.classList.remove('tier-orange', 'tier-red');
      if (tier === 'orange') emergencyVignettePulse.classList.add('tier-orange');
      if (tier === 'red') emergencyVignettePulse.classList.add('tier-red');
    }

    // 3. Status Callouts
    if (statusCalloutText && stickyStatusLabel) {
      if (tier === 'red') {
        statusCalloutText.textContent = '⚡ CRITICAL DECAY // ELECTROSTATIC COLLAPSE IMMINENT · IGNITE FLARE';
        stickyStatusLabel.textContent = '⚡ CRITICAL: SEVERANCE IMMINENT';
        stickyStatusLabel.style.color = '#ef4444';
      } else if (tier === 'orange') {
        statusCalloutText.textContent = '⚠ WARNING // IONOSPHERIC DUST ACCUMULATION · FLUX DEGRADING';
        stickyStatusLabel.textContent = '⚠ CARRIER INSTABILITY DETECTED';
        stickyStatusLabel.style.color = '#f97316';
      } else {
        statusCalloutText.textContent = 'CARRIER STABLE // IONOSPHERIC FLUX NOMINAL';
        stickyStatusLabel.textContent = '142.85 MHz CARRIER ACTIVE';
        stickyStatusLabel.style.color = '#d97706';
      }
    }

    // 4. Meter Colors
    const meterColor = tier === 'red' 
      ? '#ef4444' 
      : (tier === 'orange' ? '#f97316' : 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)');
    const glowColor = tier === 'red' 
      ? '0 0 16px rgba(239, 68, 68, 0.85)' 
      : (tier === 'orange' ? '0 0 14px rgba(249, 115, 22, 0.7)' : '0 0 12px rgba(251, 191, 36, 0.6)');

    if (carrierMeterFill) {
      carrierMeterFill.style.background = meterColor;
      carrierMeterFill.style.boxShadow = glowColor;
    }
    if (stickyMeterFill) {
      stickyMeterFill.style.background = meterColor;
      stickyMeterFill.style.boxShadow = glowColor;
    }
  }

  // --- 2. Emergency Signal Flare Mechanic ---
  function fireEmergencyFlare() {
    getAudioCtx();

    // Visual Blinding Magnesium Screen Flash
    if (flareScreenFlash) {
      flareScreenFlash.classList.remove('active');
      // Trigger DOM reflow to restart keyframe animation
      void flareScreenFlash.offsetWidth;
      flareScreenFlash.classList.add('active');
    }

    // High Impact Audio Foley
    playFlareSound();

    // Extend Time Window (+5 minutes, capped at 25:00)
    const EXTENSION_MS = 5 * 60 * 1000;
    const now = Date.now();
    const remainingMs = Math.max(0, endTime - now);
    const newRemaining = Math.min(MAX_DURATION_MS, remainingMs + EXTENSION_MS);
    endTime = now + newRemaining;

    // Resume timer if it collapsed
    if (!isTimerActive) {
      isTimerActive = true;
      startHighPrecisionCountdown();
    }

    // Force instant update & evaluate tier recovery
    updateHighPrecisionTick();

    showFeedback(true, '✦ EMERGENCY SIGNAL FLARE IGNITED // +05:00 EXTENSION GRANTED TO 142.85 MHz CARRIER WINDOW');
  }

  function onCarrierCollapse() {
    if (statusCalloutText) {
      statusCalloutText.textContent = '✖ CARRIER COLLAPSE // 142.85 MHz SIGNAL HAS PERISHED IN THE ELECTROSTATIC DUST STORM';
    }
    if (stickyStatusLabel) {
      stickyStatusLabel.textContent = '✖ CARRIER COLLAPSED // IGNITE FLARE';
      stickyStatusLabel.style.color = '#ef4444';
    }
    showFeedback(false, '⚠ CARRIER COLLAPSE // 142.85 MHz SIGNAL HAS PERISHED IN THE ELECTROSTATIC DUST STORM. IGNITE EMERGENCY SIGNAL FLARE TO RESTORE LINK.');
  }

  // --- 3. Persistent Sticky HUD Scroll Synchronization ---
  function setupStickyHudScroll() {
    if (!stickyHud || !mainTimerBanner) return;

    function checkScroll() {
      const bannerRect = mainTimerBanner.getBoundingClientRect();
      // Show sticky HUD when the main banner scrolls above the header view
      if (bannerRect.bottom < 50) {
        stickyHud.classList.add('visible');
      } else {
        stickyHud.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  // --- 4. Packet Verification (Sheet 6 · Side B) ---
  function verifyTransitSubmission() {
    const rawDist = (inputDistance ? inputDistance.value : '').trim().replace(/,/g, '').toLowerCase();
    const rawPoly = (inputPolygon ? inputPolygon.value : '').trim().toLowerCase();
    const rawA1 = (inputAnchor1 ? inputAnchor1.value : '').trim().toLowerCase();
    const rawA2 = (inputAnchor2 ? inputAnchor2.value : '').trim().toLowerCase();

    // Distance: 2090
    const isDistValid = rawDist.includes('2090');

    // Polygon: Hexagon / Hexágono / 6-gon
    const isPolyValid = rawPoly.includes('hexag') || rawPoly.includes('hexág') || rawPoly.includes('6-gon');

    // Anchors: Achernar and Polaris
    const hasAchernar = rawA1.includes('achernar') || rawA2.includes('achernar');
    const hasPolaris = rawA1.includes('polaris') || rawA2.includes('polaris');
    const isAnchorsValid = hasAchernar && hasPolaris;

    if (isDistValid && isPolyValid && isAnchorsValid) {
      // SUCCESS! Freeze countdown and cease ticking
      isTimerActive = false;
      if (countdownTimerId) clearInterval(countdownTimerId);

      try {
        localStorage.setItem('order_midnight_completed', 'true');
      } catch (e) {}

      // Hide sticky HUD
      if (stickyHud) stickyHud.classList.remove('visible');

      showFeedback(true, '✦ PACKET ENCRYPTION VERIFIED (2090 LY · HEXAGON · ACHERNAR/POLARIS) // SATELLITE RELAY LOCKED ➔');

      if (btnBroadcastPacket) {
        btnBroadcastPacket.disabled = true;
        btnBroadcastPacket.innerHTML = `<span>⏳ TRANSMITTING SATELLITE PACKET...</span>`;
      }

      setTimeout(() => {
        if (inputSection) inputSection.style.display = 'none';
        if (mainTimerBanner) mainTimerBanner.style.display = 'none';
        if (emergencyVignettePulse) emergencyVignettePulse.style.display = 'none';

        if (victoryCard) {
          victoryCard.classList.add('active');
          victoryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        triggerVictoryRadio();
      }, 1200);

    } else {
      let errors = [];
      if (!isDistValid) errors.push('Cumulative light-year traverse does not match Sheet 6 Side B');
      if (!isPolyValid) errors.push('Geometric asterism shape incorrect');
      if (!isAnchorsValid) errors.push('Bipolar stellar anchors misidentified');

      showFeedback(false, `⚠ TRANSMIT REJECTED BY ORBITAL RELAY: ${errors.join('; ')}.`);
    }
  }

  function showFeedback(isSuccess, text) {
    if (!hudFeedback) return;
    hudFeedback.style.display = 'block';
    hudFeedback.className = isSuccess ? 'transit-hud-feedback success' : 'transit-hud-feedback error';
    hudFeedback.innerHTML = `<span>${text}</span>`;
  }

  // --- 5. Victory Radio Dispatch & Oscilloscope ---
  function triggerVictoryRadio() {
    isVictoryActive = true;
    startVictoryOscilloscope();

    if (victoryAudio) {
      victoryAudio.src = 'audio/cartographer_tempest_victory.mp3?v=' + Date.now();
      victoryAudio.load();
      victoryAudio.play().catch(e => {
        console.warn("Victory audio autoplay notice:", e);
      });
    }
  }

  function updateVictoryTeletype() {
    if (!victoryAudio || !victoryTeletype) return;
    const cur = victoryAudio.currentTime;
    const dur = victoryAudio.duration || 82.3;

    if (victoryTimeCurrent) victoryTimeCurrent.textContent = formatTime(cur);
    if (victoryTimeTotal) victoryTimeTotal.textContent = formatTime(dur);
    if (victorySeekSlider) victorySeekSlider.value = cur;
    if (victoryScrubberFill) victoryScrubberFill.style.width = ((cur / dur) * 100) + '%';

    let html = '';

    VICTORY_LINES.forEach((item) => {
      if (cur >= item.t) {
        const isCurrent = cur >= item.t && cur < (item.t + item.dur + 0.4);
        const style = isCurrent 
          ? 'color:#fff; background:rgba(217, 119, 6, 0.25); padding:6px 10px; border-left:3px solid #f59e0b; border-radius:3px; font-weight:600; text-shadow:0 0 12px rgba(245,158,11,0.85); margin-bottom:8px;'
          : 'color:#fbbf24; opacity:0.8; margin-bottom:8px;';
        html += `<p style="${style}">${item.text}</p>`;
      }
    });

    html += `<span style="animation:amber-pulse 0.8s infinite; color:#f59e0b;">█</span>`;
    victoryTeletype.innerHTML = html;
    victoryTeletype.scrollTop = victoryTeletype.scrollHeight;
  }

  function onVictoryAudioEnded() {
    if (victoryTeletype) {
      const p = document.createElement('p');
      p.style.cssText = 'color:#f59e0b; font-style:italic; font-weight:700; margin-top:12px; border-top:1px dashed rgba(245,158,11,0.4); padding-top:6px;';
      p.textContent = "[ CARRIER SILENCE · DISPATCH 08-B CLOSED // THE DESERT PATH AWAITS ]";
      victoryTeletype.appendChild(p);
      victoryTeletype.scrollTop = victoryTeletype.scrollHeight;
    }
  }

  function startVictoryOscilloscope() {
    if (victoryAnimId) cancelAnimationFrame(victoryAnimId);

    function render() {
      if (!victoryCanvas || !victoryCtx) return;
      const w = victoryCanvas.width;
      const h = victoryCanvas.height;
      const cur = victoryAudio ? victoryAudio.currentTime : 0;
      const now = performance.now() * 0.005;

      let energy = 0;
      if (victoryAudio && !victoryAudio.paused) {
        for (let item of VICTORY_LINES) {
          if (cur >= item.t && cur <= (item.t + item.dur)) {
            const p = cur - item.t;
            energy = (Math.sin(p * 15.0) * 0.35 + Math.sin(p * 28.0) * 0.25 + 0.6) * 0.85;
            break;
          }
        }
      }

      victoryCtx.fillStyle = 'rgba(10, 5, 2, 0.28)';
      victoryCtx.fillRect(0, 0, w, h);

      if (energy > 0.1) {
        victoryCtx.lineWidth = 2.2;
        victoryCtx.strokeStyle = '#fbbf24';
        victoryCtx.shadowColor = '#f59e0b';
        victoryCtx.shadowBlur = 10;
        victoryCtx.beginPath();
        const pts = 70;
        const step = w / pts;
        for (let i = 0; i <= pts; i++) {
          const x = i * step;
          const carrier = Math.sin(i * 0.22 + now * 3.8);
          const vocalMod = Math.sin(i * 0.45 - now * 5.5) * Math.cos(i * 0.14);
          const noise = (Math.random() - 0.5) * 5;
          const y = (h * 0.5) + (carrier * vocalMod * energy * (h * 0.38)) + noise;
          if (i === 0) victoryCtx.moveTo(x, y);
          else victoryCtx.lineTo(x, y);
        }
        victoryCtx.stroke();
        victoryCtx.shadowBlur = 0;
      } else {
        victoryCtx.lineWidth = 1.2;
        victoryCtx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        victoryCtx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const y = (h * 0.5) + Math.sin(x * 0.05 + now) * 2.0;
          if (x === 0) victoryCtx.moveTo(x, y);
          else victoryCtx.lineTo(x, y);
        }
        victoryCtx.stroke();
      }

      victoryAnimId = requestAnimationFrame(render);
    }
    victoryAnimId = requestAnimationFrame(render);
  }

  // --- Initialize ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTransitPage);
  } else {
    initTransitPage();
  }

})();
