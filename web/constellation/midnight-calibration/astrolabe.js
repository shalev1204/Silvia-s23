/**
 * THE ECLIPSE ORDER · STATION 08: THE BACKUP BRASS ASTROLABE RIG
 * Mechanical Backlash, Eccentric Friction Sectors & Emergency Transit Controller
 */

(function () {
  'use strict';

  // Master Data of the 6 Observed Guide Stars (Sheet 6 · Side A)
  const GUIDE_STARS = {
    polaris: {
      id: 'polaris',
      name: 'Polaris',
      constellation: 'Ursa Minor · True North Pivot',
      alt: 30,
      bearing: 360,
      delta: 352,
      tag: 'OPTICAL MISMATCH -38° // BEAM DEFLECTION',
      msg: 'The collimated ray strikes the solid granite bedrock of the northern cliff. No optical sensor detected.'
    },
    vega: {
      id: 'vega',
      name: 'Vega',
      constellation: 'Lyra · The Harp of Distant Light',
      alt: 45,
      bearing: 90,
      delta: 97,
      tag: 'OPTICAL RESONANCE CONFIRMED · 97° MERIDIAN',
      msg: 'PERFECT ALIGNMENT! The golden ray strikes the central prism of the Mountain Vault. Mechanical relays engage!'
    },
    arcturus: {
      id: 'arcturus',
      name: 'Arcturus',
      constellation: 'Boötes · Western Horizon Guard',
      alt: 45,
      bearing: 270,
      delta: 277,
      tag: 'OPTICAL MISMATCH +180° // WESTERN OCCLUSION',
      msg: 'Beam deflected into the western mountain shadow. Meridian aperture remains dark.'
    },
    aldebaran: {
      id: 'aldebaran',
      name: 'Aldebaran',
      constellation: 'Taurus · The Red Eye of the Dunes',
      alt: 15,
      bearing: 225,
      delta: 202,
      tag: 'OPTICAL MISMATCH +105° // LOW HORIZON DRIFT',
      msg: 'Ray lost in atmospheric dust haze near the horizon. Zero optical feedback.'
    },
    deneb: {
      id: 'deneb',
      name: 'Deneb',
      constellation: 'Cygnus · The Northern Cross',
      alt: 15,
      bearing: 45,
      delta: 22,
      tag: 'OPTICAL MISMATCH -75° // COLLIMATION OFFSET',
      msg: 'Ray strikes the upper rock fissure. Lens angle misaligned by 75 degrees.'
    },
    altair: {
      id: 'altair',
      name: 'Altair',
      constellation: 'Aquila · The Flying Eagle',
      alt: 15,
      bearing: 180,
      delta: 157,
      tag: 'OPTICAL MISMATCH +60° // SOUTHERN HORIZON SHIFT',
      msg: 'Ray points directly towards the open desert plain. No sanctuary gateway present.'
    }
  };

  // Mechanical Flaw & Imperfection Engine (Field Backup Astrolabe)
  function getRandomDetentThreshold() {
    // Random interval between 35° and 75° of coarse movement before mechanical stiffness
    return Math.floor(35 + Math.random() * 40);
  }

  // Alidade Mechanical State
  let currentAlidadeAngle = 30; // initial elevation position
  let alidadeCoarseTravel = 0;
  let alidadeJamThreshold = getRandomDetentThreshold();
  let isAlidadeJammed = false;
  let alidadeJamAngle = null;
  let alidadeJamDir = 0;
  let lastAlidadeDirection = 1;
  let alidadeSlack = 0;

  // Rete Mechanical State
  let currentReteAngle = 0;     // initial meridian bearing
  let reteCoarseTravel = 0;
  let reteJamThreshold = getRandomDetentThreshold();
  let isReteJammed = false;
  let reteJamAngle = null;
  let reteJamDir = 0;
  let lastReteDirection = 1;    // 1 = clockwise, -1 = counter-clockwise
  let reteSlack = 0;
  let isApertureUnlocked = false;

  let mechanicalWarningTimeout = null;

  function showMechanicalWarning(text, isCleared = false) {
    if (!bindingWarningTag) return;
    if (mechanicalWarningTimeout) clearTimeout(mechanicalWarningTimeout);

    bindingWarningTag.textContent = text;
    bindingWarningTag.style.display = 'inline-flex';

    if (isCleared) {
      bindingWarningTag.classList.add('cleared');
      mechanicalWarningTimeout = setTimeout(() => {
        if (bindingWarningTag) {
          bindingWarningTag.style.display = 'none';
          bindingWarningTag.classList.remove('cleared');
        }
      }, 2500);
    } else {
      bindingWarningTag.classList.remove('cleared');
    }
  }

  function triggerRigShudder(type) {
    const rig = document.getElementById(`rig-${type}`);
    if (rig) {
      rig.classList.remove('jammed-shudder');
      void rig.offsetWidth; // force reflow
      rig.classList.add('jammed-shudder');
      setTimeout(() => {
        if (rig) rig.classList.remove('jammed-shudder');
      }, 280);
    }
    try {
      if (window.OrderStormEngine && typeof window.OrderStormEngine.playBrassClank === 'function') {
        window.OrderStormEngine.playBrassClank();
      }
    } catch (_) {}
  }

  // DOM Elements
  const alidadeRulerEl = document.getElementById('astrolabe-alidade');
  const reteWebEl = document.getElementById('astrolabe-rete');
  const astrolabeStage = document.getElementById('astrolabe-stage');
  const collimatorRayEl = document.getElementById('collimator-ray');
  const sliderAlidade = document.getElementById('slider-alidade');
  const sliderRete = document.getElementById('slider-rete');
  const valAlidade = document.getElementById('val-alidade');
  const valAlidadeDisplay = document.getElementById('val-alidade-display');
  const valRete = document.getElementById('val-rete');
  const valReteDisplay = document.getElementById('val-rete-display');
  const valLimbo = document.getElementById('val-limbo');
  const mechanicalSlackBadge = document.getElementById('mechanical-slack-badge');
  const bindingWarningTag = document.getElementById('binding-warning-tag');
  const apertureStatusTag = document.getElementById('aperture-status-tag');
  const apertureStatusMsg = document.getElementById('aperture-status-msg');
  const apertureBox = document.getElementById('aperture-feedback-box');
  const btnLockAlignment = document.getElementById('btn-lock-alignment');

  // Micrometer Stepping Buttons
  const btnAlidadeDec = document.getElementById('btn-alidade-dec');
  const btnAlidadeInc = document.getElementById('btn-alidade-inc');
  const btnReteDec = document.getElementById('btn-rete-dec');
  const btnReteInc = document.getElementById('btn-rete-inc');

  // Radio Chassis & Tempest Intercept Elements
  const radioSection = document.getElementById('emergency-radio-chassis');
  const btnProceedEmergency = document.getElementById('btn-proceed-emergency');
  const phase1Container = document.getElementById('phase-1-calibration');
  const phase2Container = document.getElementById('phase-2-emergency');
  const victoryCard = document.getElementById('victory-epilogue');

  // Phase 2 Elements
  const emergencyDigits = document.getElementById('emergency-timer-digits');
  const carrierMeterFill = document.getElementById('carrier-meter-fill');
  const btnSignalFlare = document.getElementById('btn-signal-flare');
  const btnBroadcastPacket = document.getElementById('btn-broadcast-packet');
  const inputDistance = document.getElementById('input-transit-distance');
  const inputPolygon = document.getElementById('input-transit-polygon');
  const inputAnchor1 = document.getElementById('input-anchor-1');
  const inputAnchor2 = document.getElementById('input-anchor-2');

  let emergencySecondsLeft = 15 * 60; // 15:00
  let countdownTimerInterval = null;

  // Update Visual and Mechanical State
  function updateAstrolabeView(animate = false, source = null) {
    if (alidadeRulerEl) {
      alidadeRulerEl.style.transition = animate ? 'transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'none';
      alidadeRulerEl.style.transformOrigin = '250px 250px';
      alidadeRulerEl.style.transform = `rotate(${currentAlidadeAngle}deg)`;
      alidadeRulerEl.setAttribute('transform', `rotate(${currentAlidadeAngle} 250 250)`);
    }
    if (reteWebEl) {
      reteWebEl.style.transition = animate ? 'transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'none';
      reteWebEl.style.transformOrigin = '250px 250px';
      reteWebEl.style.transform = `rotate(${currentReteAngle}deg)`;
      reteWebEl.setAttribute('transform', `rotate(${currentReteAngle} 250 250)`);
    }

    if (sliderAlidade && source !== 'alidade') sliderAlidade.value = currentAlidadeAngle;
    if (sliderRete && source !== 'rete') sliderRete.value = currentReteAngle;
    if (valAlidade) valAlidade.textContent = `${currentAlidadeAngle}°`;
    if (valAlidadeDisplay) valAlidadeDisplay.textContent = `${currentAlidadeAngle}°`;
    if (valRete) valRete.textContent = `${currentReteAngle}°`;
    if (valReteDisplay) valReteDisplay.textContent = `${currentReteAngle}°`;

    updateCursorPosition('alidade', currentAlidadeAngle);
    updateCursorPosition('rete', currentReteAngle);

    // Calculated Limbo Meridian Bearing (Directly driven by the Rete star web)
    const currentLimbo = currentReteAngle;
    if (valLimbo) valLimbo.textContent = `${currentLimbo.toString().padStart(3, '0')}°`;

    if (collimatorRayEl) {
      collimatorRayEl.style.transform = `rotate(${currentLimbo - 90}deg)`;
    }

    // If unlocked, but user turns dials away from resonance (97° Limbo & 45° Alidade), reset
    if (isApertureUnlocked && (currentLimbo !== 97 || currentAlidadeAngle !== 45)) {
      isApertureUnlocked = false;
      if (collimatorRayEl) collimatorRayEl.classList.remove('resonance-success');
      if (apertureBox) apertureBox.className = 'aperture-feedback-box';
      if (apertureStatusTag) apertureStatusTag.textContent = 'OPTICAL SCANNING // READY FOR CALIBRATION';
      if (apertureStatusMsg) apertureStatusMsg.textContent = 'Dials moved out of resonance. Re-align brass dials and engage collimation.';
      if (btnLockAlignment) {
        btnLockAlignment.classList.remove('pulse-ready');
        btnLockAlignment.innerHTML = `<span>✦ COLLIMATE BEAM & ENGAGE VAULT APERTURE ➔</span>`;
      }
    }
  }

  // Precision Sliders Input with Random Mechanical Flaw Simulation
  function handleAlidadeInput(val, isFineStep = false) {
    let targetAngle = parseInt(val, 10);
    if (isNaN(targetAngle)) return;
    targetAngle = (targetAngle % 360 + 360) % 360;

    // Case 1: Micrometer Worm-Screw Step (▲ +1° / ▼ -1°) or Arrow Keys
    if (isFineStep) {
      if (isAlidadeJammed) {
        // High-torque worm-screw ratchets through the stiff detent!
        isAlidadeJammed = false;
        alidadeJamAngle = null;
        alidadeCoarseTravel = 0;
        alidadeJamThreshold = getRandomDetentThreshold();
        showMechanicalWarning('✦ WORM-SCREW ADVANCED // ALIDADE DETENT CLEARED', true);
      }
      currentAlidadeAngle = targetAngle;
      updateAstrolabeView(false, 'alidade');
      try {
        if (window.OrderStormEngine && typeof window.OrderStormEngine.playRatchetClick === 'function') {
          window.OrderStormEngine.playRatchetClick();
        }
      } catch (_) {}
      return;
    }

    // Case 2: Coarse Dragging or Jump
    let delta = targetAngle - currentAlidadeAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (delta === 0) return;

    const dir = delta > 0 ? 1 : -1;
    const absDelta = Math.abs(delta);

    // Backlash Slack Check on Direction Reversal
    if (dir !== lastAlidadeDirection) {
      lastAlidadeDirection = dir;
      alidadeSlack = 2; // ±2° play
      if (mechanicalSlackBadge) {
        mechanicalSlackBadge.classList.add('rattling');
        mechanicalSlackBadge.textContent = 'BACKLASH SLACK: ALIDADE GEAR PLAY (±2°)';
      }
    } else if (alidadeSlack > 0) {
      alidadeSlack--;
      if (alidadeSlack === 0 && mechanicalSlackBadge) {
        mechanicalSlackBadge.classList.remove('rattling');
        mechanicalSlackBadge.textContent = 'BACKLASH SLACK: TEETH ENGAGED';
      }
    }

    // If currently jammed:
    if (isAlidadeJammed) {
      if (dir === alidadeJamDir) {
        // Continuing to force coarse drag in the locked direction
        triggerRigShudder('alidade');
        showMechanicalWarning(`⚠ WORN BRASS DETENT · ALIDADE STIFFENED AT ${alidadeJamAngle}° — STEP WITH MICROMETER [▲/▼] OR REVERSE`);
        currentAlidadeAngle = alidadeJamAngle;
        updateAstrolabeView(false, 'alidade');
        return;
      } else {
        // Reverse drag disengages the detent
        isAlidadeJammed = false;
        alidadeJamAngle = null;
        alidadeCoarseTravel = 0;
        alidadeJamThreshold = getRandomDetentThreshold();
        showMechanicalWarning('✦ DETENT DISENGAGED // AXLE REVERSED', true);
      }
    }

    // Accumulate coarse travel toward random detent
    alidadeCoarseTravel += absDelta;
    if (alidadeCoarseTravel >= alidadeJamThreshold) {
      // Trigger random mechanical jam
      isAlidadeJammed = true;
      alidadeJamAngle = targetAngle;
      alidadeJamDir = dir;
      currentAlidadeAngle = targetAngle;
      triggerRigShudder('alidade');
      showMechanicalWarning(`⚠ WORN GEAR DETENT · ALIDADE STIFFENED AT ${targetAngle}° — STEP WITH MICROMETER [▲/▼]`);
      updateAstrolabeView(false, 'alidade');
      return;
    }

    // Normal coarse travel
    currentAlidadeAngle = targetAngle;
    updateAstrolabeView(false, 'alidade');
    try {
      if (window.OrderStormEngine && typeof window.OrderStormEngine.playRatchetClick === 'function') {
        window.OrderStormEngine.playRatchetClick();
      }
    } catch (_) {}
  }

  function handleReteInput(val, isFineStep = false) {
    let targetAngle = parseInt(val, 10);
    if (isNaN(targetAngle)) return;
    targetAngle = (targetAngle % 360 + 360) % 360;

    // Case 1: Micrometer Worm-Screw Step (▲ +1° / ▼ -1°) or Arrow Keys
    if (isFineStep) {
      if (isReteJammed) {
        // High-torque worm-screw ratchets through the stiff detent!
        isReteJammed = false;
        reteJamAngle = null;
        reteCoarseTravel = 0;
        reteJamThreshold = getRandomDetentThreshold();
        showMechanicalWarning('✦ WORM-SCREW ADVANCED // RETE DETENT CLEARED', true);
      }
      currentReteAngle = targetAngle;
      updateAstrolabeView(false, 'rete');
      try {
        if (window.OrderStormEngine && typeof window.OrderStormEngine.playRatchetClick === 'function') {
          window.OrderStormEngine.playRatchetClick();
        }
      } catch (_) {}
      return;
    }

    // Case 2: Coarse Dragging or Jump
    let delta = targetAngle - currentReteAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (delta === 0) return;

    const dir = delta > 0 ? 1 : -1;
    const absDelta = Math.abs(delta);

    // Backlash Slack Check on Direction Reversal
    if (dir !== lastReteDirection) {
      lastReteDirection = dir;
      reteSlack = 3; // ±3° loose gear play on the broad rete star web
      if (mechanicalSlackBadge) {
        mechanicalSlackBadge.classList.add('rattling');
        mechanicalSlackBadge.textContent = 'BACKLASH SLACK: RETE GEAR TEETH SLIPPING (±3°)';
      }
    } else if (reteSlack > 0) {
      reteSlack--;
      if (reteSlack === 0 && mechanicalSlackBadge) {
        mechanicalSlackBadge.classList.remove('rattling');
        mechanicalSlackBadge.textContent = 'BACKLASH SLACK: TEETH ENGAGED';
      }
    }

    // If currently jammed:
    if (isReteJammed) {
      if (dir === reteJamDir) {
        // Continuing to force coarse drag in the locked direction
        triggerRigShudder('rete');
        showMechanicalWarning(`⚠ WORN BEARING DETENT · RETE STIFFENED AT ${reteJamAngle}° — STEP WITH MICROMETER [▲/▼] OR REVERSE`);
        currentReteAngle = reteJamAngle;
        updateAstrolabeView(false, 'rete');
        return;
      } else {
        // Reverse drag disengages the detent
        isReteJammed = false;
        reteJamAngle = null;
        reteCoarseTravel = 0;
        reteJamThreshold = getRandomDetentThreshold();
        showMechanicalWarning('✦ DETENT DISENGAGED // AXLE REVERSED', true);
      }
    }

    // Accumulate coarse travel toward random detent
    reteCoarseTravel += absDelta;
    if (reteCoarseTravel >= reteJamThreshold) {
      // Trigger random mechanical jam
      isReteJammed = true;
      reteJamAngle = targetAngle;
      reteJamDir = dir;
      currentReteAngle = targetAngle;
      triggerRigShudder('rete');
      showMechanicalWarning(`⚠ WORN BEARING DETENT · RETE STIFFENED AT ${targetAngle}° — STEP WITH MICROMETER [▲/▼]`);
      updateAstrolabeView(false, 'rete');
      return;
    }

    // Normal coarse travel
    currentReteAngle = targetAngle;
    updateAstrolabeView(false, 'rete');
    try {
      if (window.OrderStormEngine && typeof window.OrderStormEngine.playRatchetClick === 'function') {
        window.OrderStormEngine.playRatchetClick();
      }
    } catch (_) {}
  }

  window.handleAlidadeSlider = handleAlidadeInput;
  window.handleReteSlider = handleReteInput;

  // Update Visual Vernier Brass Cursor Position
  function updateCursorPosition(type, angle) {
    const slot = document.getElementById(`slot-${type}`);
    const cursor = document.getElementById(`cursor-${type}`);
    if (!slot || !cursor) return;

    const normAngle = ((angle % 360) + 360) % 360;
    const ratio = normAngle / 360;
    slot.setAttribute('aria-valuenow', normAngle);

    const slotH = slot.clientHeight || 260;
    const slotW = slot.clientWidth || 52;
    const isVertical = slotH >= slotW;

    if (isVertical) {
      const cursorH = cursor.offsetHeight || 32;
      const usableH = Math.max(10, slotH - cursorH);
      const bottomPx = Math.round(ratio * usableH);
      cursor.style.bottom = `${bottomPx}px`;
      cursor.style.left = '50%';
      cursor.style.top = 'auto';
      cursor.style.transform = 'translateX(-50%)';
    } else {
      const cursorW = cursor.offsetWidth || 32;
      const usableW = Math.max(10, slotW - cursorW);
      const leftPx = Math.round(ratio * usableW);
      cursor.style.left = `${leftPx}px`;
      cursor.style.top = '50%';
      cursor.style.bottom = 'auto';
      cursor.style.transform = 'translateY(-50%)';
    }
  }

  // Pointer & Drag Controller for Brass Vernier Sliders
  function setupBrassVernierSlider(type, onInputHandler) {
    const slot = document.getElementById(`slot-${type}`);
    const cursor = document.getElementById(`cursor-${type}`);
    if (!slot || !cursor) return;

    let isDragging = false;

    function getAngleFromPointer(e) {
      const rect = slot.getBoundingClientRect();
      const isVertical = rect.height >= rect.width;
      let ratio = 0;

      if (isVertical) {
        const cursorH = cursor.offsetHeight || 32;
        const usableH = rect.height - cursorH;
        if (usableH <= 0) return 0;
        // e.clientY: rect.top is 360°, rect.bottom is 0°
        const y = e.clientY - rect.top;
        ratio = 1 - ((y - (cursorH / 2)) / usableH);
      } else {
        const cursorW = cursor.offsetWidth || 32;
        const usableW = rect.width - cursorW;
        if (usableW <= 0) return 0;
        const x = e.clientX - rect.left;
        ratio = (x - (cursorW / 2)) / usableW;
      }

      ratio = Math.max(0, Math.min(1, ratio));
      return Math.round(ratio * 360);
    }

    slot.addEventListener('pointerdown', (e) => {
      isDragging = true;
      cursor.classList.add('dragging');
      try {
        slot.setPointerCapture(e.pointerId);
      } catch (_) {}
      const angle = getAngleFromPointer(e);
      onInputHandler(angle, false);
    });

    slot.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const angle = getAngleFromPointer(e);
      onInputHandler(angle, false);
    });

    const stopDragging = (e) => {
      if (!isDragging) return;
      isDragging = false;
      cursor.classList.remove('dragging');
      try {
        if (e && e.pointerId && slot.hasPointerCapture(e.pointerId)) {
          slot.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
    };

    slot.addEventListener('pointerup', stopDragging);
    slot.addEventListener('pointercancel', stopDragging);

    // Keyboard support
    slot.addEventListener('keydown', (e) => {
      const currentVal = type === 'alidade' ? currentAlidadeAngle : currentReteAngle;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        onInputHandler(Math.min(360, currentVal + 1), true);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        onInputHandler(Math.max(0, currentVal - 1), true);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        onInputHandler(Math.min(360, currentVal + 15), false);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        onInputHandler(Math.max(0, currentVal - 15), false);
      }
    });
  }

  if (sliderAlidade) {
    ['input', 'change'].forEach(evt => {
      sliderAlidade.addEventListener(evt, (e) => handleAlidadeInput(e.target.value, false));
    });
  }

  if (sliderRete) {
    ['input', 'change'].forEach(evt => {
      sliderRete.addEventListener(evt, (e) => handleReteInput(e.target.value, false));
    });
  }

  // Micrometer Worm-Screw Step Buttons Listeners
  if (btnAlidadeDec) {
    btnAlidadeDec.addEventListener('click', () => {
      handleAlidadeInput(Math.max(0, currentAlidadeAngle - 1), true);
    });
  }
  if (btnAlidadeInc) {
    btnAlidadeInc.addEventListener('click', () => {
      handleAlidadeInput(Math.min(360, currentAlidadeAngle + 1), true);
    });
  }
  if (btnReteDec) {
    btnReteDec.addEventListener('click', () => {
      handleReteInput(Math.max(0, currentReteAngle - 1), true);
    });
  }
  if (btnReteInc) {
    btnReteInc.addEventListener('click', () => {
      handleReteInput(Math.min(360, currentReteAngle + 1), true);
    });
  }



  // --- Collimation & Aperture Lock Protocol ---
  if (btnLockAlignment) {
    btnLockAlignment.addEventListener('click', () => {
      const currentLimbo = currentReteAngle;

      // If already unlocked and user clicks the active button: ENGAGE MOUNTAIN VAULT!
      if (isApertureUnlocked) {
        window.OrderStormEngine.playBrassClank();
        btnLockAlignment.disabled = true;
        btnLockAlignment.innerHTML = `<span>⏳ ENGAGING SANCTUARY MECHANISM // ADVANCING TO TRANSMISSION RELAY...</span>`;

        // Advance to the dedicated cinematic and transmission page
        setTimeout(() => {
          window.location.href = 'transmission.html';
        }, 1200);
        return;
      }

      // Check collimation alignment against field observation records (Sheet 6 · Side A)
      if (collimatorRayEl) collimatorRayEl.classList.add('active');

      if (currentLimbo === 97 && currentAlidadeAngle === 45) {
        // VEGA MERIDIAN RESONANCE!
        isApertureUnlocked = true;
        window.OrderStormEngine.playOpticalHum();
        window.OrderStormEngine.playSuccessChime();
        if (collimatorRayEl) collimatorRayEl.classList.add('resonance-success');
        if (apertureBox) apertureBox.className = 'aperture-feedback-box success';
        if (apertureStatusTag) apertureStatusTag.textContent = 'OPTICAL RESONANCE CONFIRMED · 97° MERIDIAN (VEGA)';
        if (apertureStatusMsg) apertureStatusMsg.textContent = 'PERFECT ALIGNMENT! The golden ray strikes the central prism of Vega (97°). Relays engage! Transmit the transit satellite packet to unlock the sacred revelation of the First Dispatch.';
        btnLockAlignment.classList.add('pulse-ready');
        btnLockAlignment.innerHTML = `<span>✦ LOCK APERTURE & ENGAGE MOUNTAIN VAULT (97°) ➔</span>`;
      } else if (currentLimbo === 352 || currentLimbo === 0) {
        window.OrderStormEngine.playBrassClank();
        if (collimatorRayEl) collimatorRayEl.classList.remove('resonance-success');
        if (apertureBox) apertureBox.className = 'aperture-feedback-box error';
        if (apertureStatusTag) apertureStatusTag.textContent = 'POLARIS AXIS // 352° (-8°) DELTA';
        if (apertureStatusMsg) apertureStatusMsg.textContent = 'Collimated ray strikes the northern glacial peak. Elevation matches Polaris (30°), but this is the polar anchor, not the mountain sanctuary.';
      } else if (currentLimbo === 277) {
        window.OrderStormEngine.playBrassClank();
        if (collimatorRayEl) collimatorRayEl.classList.remove('resonance-success');
        if (apertureBox) apertureBox.className = 'aperture-feedback-box error';
        if (apertureStatusTag) apertureStatusTag.textContent = 'ARCTURUS MERIDIAN // 277° DELTA';
        if (apertureStatusMsg) apertureStatusMsg.textContent = 'Ray deflected into western sandstone shadow. Elevation matches 45°, but western bearing points away from the sanctuary cleft.';
      } else if (currentLimbo === 202) {
        window.OrderStormEngine.playBrassClank();
        if (collimatorRayEl) collimatorRayEl.classList.remove('resonance-success');
        if (apertureBox) apertureBox.className = 'aperture-feedback-box error';
        if (apertureStatusTag) apertureStatusTag.textContent = 'ALDEBARAN ALIGNMENT // 202° DELTA';
        if (apertureStatusMsg) apertureStatusMsg.textContent = 'Ray lost in southern dune dust haze near the horizon (Alt 15°). No sanctuary gateway present.';
      } else if (currentLimbo === 22) {
        window.OrderStormEngine.playBrassClank();
        if (collimatorRayEl) collimatorRayEl.classList.remove('resonance-success');
        if (apertureBox) apertureBox.className = 'aperture-feedback-box error';
        if (apertureStatusTag) apertureStatusTag.textContent = 'DENEB ALIGNMENT // 022° DELTA';
        if (apertureStatusMsg) apertureStatusMsg.textContent = 'Ray strikes upper rock fissure. Lens angle misaligned.';
      } else if (currentLimbo === 157) {
        window.OrderStormEngine.playBrassClank();
        if (collimatorRayEl) collimatorRayEl.classList.remove('resonance-success');
        if (apertureBox) apertureBox.className = 'aperture-feedback-box error';
        if (apertureStatusTag) apertureStatusTag.textContent = 'ALTAIR MERIDIAN // 157° DELTA';
        if (apertureStatusMsg) apertureStatusMsg.textContent = 'Ray points to the open desert flats. No optical receiver detected.';
      } else {
        window.OrderStormEngine.playBrassClank();
        if (collimatorRayEl) collimatorRayEl.classList.remove('resonance-success');
        if (apertureBox) apertureBox.className = 'aperture-feedback-box error';
        if (apertureStatusTag) apertureStatusTag.textContent = `OPTICAL MISALIGNMENT // ${currentLimbo.toString().padStart(3, '0')}° LIMBO`;
        if (apertureStatusMsg) {
          apertureStatusMsg.textContent = `The collimated ray strikes blind cliff rock at ${currentLimbo.toString().padStart(3, '0')}°. Consult the Field Observation Log on the page “The Midnight Calibration” to calculate the true sanctuary meridian delta.`;
        }
      }
    });
  }

  // Advance from Radio Intercept to Phase 2 Emergency Transit
  if (btnProceedEmergency) {
    btnProceedEmergency.addEventListener('click', () => {
      window.OrderStormEngine.playBrassClank();
      if (radioSection) radioSection.style.display = 'none';
      if (phase1Container) phase1Container.style.display = 'none';
      if (phase2Container) {
        phase2Container.classList.add('active');
        phase2Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      startEmergencyCountdown();
    });
  }

  // --- Phase 2: 15-Minute Countdown ---
  function startEmergencyCountdown() {
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);

    function updateTimer() {
      if (emergencySecondsLeft > 0) {
        emergencySecondsLeft--;
      }

      const m = Math.floor(emergencySecondsLeft / 60).toString().padStart(2, '0');
      const s = (emergencySecondsLeft % 60).toString().padStart(2, '0');
      if (emergencyDigits) emergencyDigits.textContent = `${m}:${s}`;

      const pct = Math.max(5, (emergencySecondsLeft / (15 * 60)) * 100);
      if (carrierMeterFill) carrierMeterFill.style.width = `${pct}%`;

      if (emergencySecondsLeft === 0) {
        if (emergencyDigits) {
          emergencyDigits.style.color = '#ff4757';
          emergencyDigits.textContent = '00:00 · CARRIER LOST';
        }
      }
    }

    countdownTimerInterval = setInterval(updateTimer, 1000);
    updateTimer();
  }

  // Tactical HUD Feedback Messenger
  const transitHudFeedback = document.getElementById('transit-hud-feedback');
  let feedbackTimeout = null;

  function showTransitFeedback(message, type = 'error') {
    if (!transitHudFeedback) {
      alert(message);
      return;
    }
    transitHudFeedback.textContent = message;
    transitHudFeedback.className = `transit-hud-feedback ${type}`;
    transitHudFeedback.style.display = 'flex';

    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
      transitHudFeedback.style.display = 'none';
    }, 6000);
  }

  // Signal Flare (+5 Min)
  if (btnSignalFlare) {
    btnSignalFlare.addEventListener('click', () => {
      window.OrderStormEngine.playRatchetClick();
      emergencySecondsLeft += 5 * 60;
      if (emergencyDigits) emergencyDigits.style.color = '#fff';
      showTransitFeedback('⚡ SIGNAL FLARE FIRED! Carrier frequency stabilized for +5 minutes.', 'success');
    });
  }

  // Submit Side B Transit Calculations
  if (btnBroadcastPacket) {
    btnBroadcastPacket.addEventListener('click', () => {
      const distRaw = (inputDistance ? inputDistance.value : '').trim().toLowerCase();
      const polyVal = (inputPolygon ? inputPolygon.value : '').trim().toLowerCase();
      const a1Val = (inputAnchor1 ? inputAnchor1.value : '').trim().toLowerCase();
      const a2Val = (inputAnchor2 ? inputAnchor2.value : '').trim().toLowerCase();

      // Tolerant distance: allows 2090, 2.090, 2,090, 2090 ly, 2090ly
      const distDigits = distRaw.replace(/\D/g, '');
      const isDistValid = distDigits === '2090' || distRaw.includes('2090');

      // Tolerant polygon: allows hexagon, hexágono, hexagono, hexagonal
      const isPolyValid = polyVal.includes('hexag') || polyVal.includes('hexág');

      // Tolerant anchors: allows Achernar and Polaris (or Polar / Estrella Polar) in either order
      const combinedAnchors = `${a1Val} ${a2Val}`;
      const isAnchorsValid = combinedAnchors.includes('achernar') && (combinedAnchors.includes('polaris') || combinedAnchors.includes('polar'));

      if (!isDistValid) {
        showTransitFeedback('⚠️ INVALID DISTANCE SUM: Calculate the sum of the six stellar chords in light-years (the page “The Midnight Transit”, box 1).', 'error');
        if (inputDistance) inputDistance.focus();
        return;
      }

      if (!isPolyValid) {
        showTransitFeedback('⚠️ UNRECOGNIZED ASTERISM: Name the geometric polygon formed by tracing the light chords across the heavens (the page “The Midnight Transit”, box 2).', 'error');
        if (inputPolygon) inputPolygon.focus();
        return;
      }

      if (!isAnchorsValid) {
        showTransitFeedback('⚠️ INCORRECT ANCHORS: Enter the two celestial guide stars bridging southern pivot and northern axle (box 3).', 'error');
        return;
      }

      // VICTORY!
      if (countdownTimerInterval) clearInterval(countdownTimerInterval);
      window.OrderStormEngine.playSuccessChime();

      try {
        localStorage.setItem('order_midnight_completed', 'true');
        const activeSeeker = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
        localStorage.setItem(`seeker_${activeSeeker}_midnight_completed`, 'true');
      } catch (e) {}

      // Switch to Victory Screen and Keep Radio Deck Active to display Live Transcript & Oscilloscope
      if (phase2Container) phase2Container.style.display = 'none';
      if (phase1Container) phase1Container.style.display = 'none';

      if (radioSection) {
        radioSection.style.display = 'flex';
        if (btnProceedEmergency) btnProceedEmergency.style.display = 'none';
      }

      if (victoryCard) {
        victoryCard.classList.add('active');
        victoryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (window.OrderRadioSystem) {
        window.OrderRadioSystem.loadTransmission('victory', true);
      }
    });
  }

  // Replay from scratch handler
  const btnReplayCalibration = document.getElementById('btn-replay-calibration');
  if (btnReplayCalibration) {
    btnReplayCalibration.addEventListener('click', () => {
      window.OrderStormEngine.playBrassClank();
      if (victoryCard) victoryCard.classList.remove('active');
      if (radioSection) radioSection.style.display = 'none';
      if (phase2Container) phase2Container.style.display = 'none';
      if (phase1Container) {
        phase1Container.style.display = 'flex';
        phase1Container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Direct Victory Check from URL hash (#victory)
  function showSolvedCalibration() {
    currentReteAngle = 97;
    currentAlidadeAngle = 45;
    if (sliderRete) sliderRete.value = '97';
    if (sliderAlidade) sliderAlidade.value = '45';
    isApertureUnlocked = true;
    updateAstrolabeView(false);
    if (collimatorRayEl) collimatorRayEl.classList.add('active', 'resonance-success');
    if (apertureBox) apertureBox.className = 'aperture-feedback-box success';
    if (apertureStatusTag) apertureStatusTag.textContent = 'OPTICAL RESONANCE CONFIRMED · 97° MERIDIAN (VEGA)';
    if (apertureStatusMsg) {
      apertureStatusMsg.textContent = 'This alignment is already locked. The golden ray rests on Vega. Revisit the secured transit, or replay from the start.';
    }
    if (btnLockAlignment) {
      btnLockAlignment.classList.add('pulse-ready');
      btnLockAlignment.disabled = false;
      btnLockAlignment.innerHTML = `<span>✦ LOCK APERTURE & ENGAGE MOUNTAIN VAULT (97°) ➔</span>`;
    }
    const archiveBar = document.getElementById('completed-archive-bar');
    if (archiveBar) archiveBar.hidden = false;
  }

  function checkDirectVictory() {
    const isDone = localStorage.getItem('order_midnight_completed') === 'true';
    if (window.location.hash === '#victory') {
      window.location.replace('transit.html#victory');
      return;
    }
    if (window.location.hash === '#replay') return;
    if (isDone) showSolvedCalibration();
  }

  window.addEventListener('hashchange', checkDirectVictory);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkDirectVictory);
  } else {
    checkDirectVictory();
  }

  // Initialize Brass Vernier Sliders
  setupBrassVernierSlider('alidade', handleAlidadeInput);
  setupBrassVernierSlider('rete', handleReteInput);

  window.addEventListener('resize', () => {
    updateCursorPosition('alidade', currentAlidadeAngle);
    updateCursorPosition('rete', currentReteAngle);
  });

  // Initial view & position sync
  updateAstrolabeView(false);
  setTimeout(() => {
    updateCursorPosition('alidade', currentAlidadeAngle);
    updateCursorPosition('rete', currentReteAngle);
  }, 50);

})();
