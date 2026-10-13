/**
 * ============================================================================
 * THE ECLIPSE ORDER · UNIVERSAL GAME ENGINE (BOILERPLATE)
 * Lógica modular interactiva, síntesis de audio procedural y persistencia
 * ============================================================================
 */

(function () {
  'use strict';

  // Configuración de la Estación (Modificar por cada juego)
  const CONFIG = {
    stationId: 'station_20',
    stationName: 'The Mirror Sanctuary',
    targetLetter: 'K',
    targetAngle: 137, // Ángulo objetivo en grados
    toleranceAngle: 5,  // Margen de tolerancia
    coordinates: {
      latitude: 'K · G · A ° N',
      longitude: 'O · B · P ° W'
    },
    hubUrl: '../../index.html'
  };

  // Estado Reactivo
  const state = {
    currentAngle: 0,
    isDragging: false,
    soundEnabled: true,
    isSolved: false,
    audioCtx: null
  };

  // Elementos DOM
  const DOM = {
    introModal: document.getElementById('intro-modal'),
    victoryModal: document.getElementById('victory-modal'),
    btnStartGame: document.getElementById('btn-start-game'),
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    btnHelpToggle: document.getElementById('btn-help-toggle'),
    rotatableWheel: document.getElementById('rotatable-wheel'),
    dialArea: document.getElementById('dial-area'),
    angleDisplay: document.getElementById('current-angle-display'),
    inputLetter: document.getElementById('input-letter'),
    btnVerify: document.getElementById('btn-verify-solution'),
    feedbackMsg: document.getElementById('feedback-message'),
    btnReturnHub: document.getElementById('btn-return-hub'),
    coordLat: document.getElementById('coord-lat'),
    coordLong: document.getElementById('coord-long')
  };

  // ==========================================================================
  // 1. SÍNTESIS DE AUDIO PROCEDURAL (WEB AUDIO API)
  // ==========================================================================

  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        state.audioCtx = new AudioContextClass();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  const Sound = {
    // Clic mecánico de engranaje de latón
    tick: function () {
      if (!state.soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    },

    // Error suave
    buzzer: function () {
      if (!state.soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    },

    // Acorde celestial de victoria
    victoryChime: function () {
      if (!state.soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const freqs = [528, 660, 792, 1056]; // Do#, Mi, Sol#, Do# brillante
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + 2.4);
      });
    }
  };

  // ==========================================================================
  // 2. INTERACCIÓN DEL DIAL ASTROLÁBICO (TOUCH & MOUSE & KEYBOARD)
  // ==========================================================================

  function updateWheelRotation(deg) {
    state.currentAngle = Math.round(((deg % 360) + 360) % 360);
    DOM.rotatableWheel.style.transform = `rotate(${state.currentAngle}deg)`;
    DOM.rotatableWheel.setAttribute('aria-valuenow', state.currentAngle);

    const degFormatted = String(state.currentAngle).padStart(3, '0');
    DOM.angleDisplay.textContent = `${degFormatted}° 00'`;
  }

  function handlePointerMove(e) {
    if (!state.isDragging) return;
    const rect = DOM.dialArea.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const radians = Math.atan2(clientY - centerY, clientX - centerX);
    let degrees = radians * (180 / Math.PI) + 90; // 0 arriba
    degrees = (degrees + 360) % 360;

    const prevAngle = state.currentAngle;
    updateWheelRotation(degrees);

    if (Math.abs(state.currentAngle - prevAngle) >= 15) {
      Sound.tick();
    }
  }

  function initDialInteraction() {
    // Mouse Events
    DOM.rotatableWheel.addEventListener('mousedown', (e) => {
      state.isDragging = true;
      getAudioContext();
      handlePointerMove(e);
    });

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', () => {
      state.isDragging = false;
    });

    // Touch Events
    DOM.rotatableWheel.addEventListener('touchstart', (e) => {
      state.isDragging = true;
      getAudioContext();
      handlePointerMove(e);
    }, { passive: true });

    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', () => {
      state.isDragging = false;
    });

    // Accesibilidad por Teclado (Flechas)
    DOM.rotatableWheel.addEventListener('keydown', (e) => {
      let delta = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 5;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -5;

      if (delta !== 0) {
        e.preventDefault();
        updateWheelRotation(state.currentAngle + delta);
        Sound.tick();
      }
    });
  }

  // ==========================================================================
  // 3. VALIDACIÓN DE SOLUCIÓN Y PERSISTENCIA
  // ==========================================================================

  function checkSolution() {
    const inputVal = DOM.inputLetter.value.trim().toUpperCase();

    // 1. Validar letra del alfabeto latino estándar
    if (!inputVal) {
      showFeedback('Please enter the meridian key letter.', 'error');
      Sound.buzzer();
      return;
    }

    if (inputVal !== CONFIG.targetLetter) {
      showFeedback(`Incorrect meridian key '${inputVal}'. Consult the Cipher Ledger.`, 'error');
      Sound.buzzer();
      return;
    }

    // 2. Validar alineación angular del dial
    const angleDiff = Math.abs(state.currentAngle - CONFIG.targetAngle);
    const wrappedDiff = Math.min(angleDiff, 360 - angleDiff);

    if (wrappedDiff > CONFIG.toleranceAngle) {
      showFeedback(`The sighting angle (${state.currentAngle}°) is not yet balanced to the true vector.`, 'error');
      Sound.buzzer();
      return;
    }

    // ¡Victoria confirmada!
    triggerVictory();
  }

  function showFeedback(msg, type) {
    DOM.feedbackMsg.textContent = msg;
    DOM.feedbackMsg.className = `feedback-msg ${type}`;
  }

  function triggerVictory() {
    state.isSolved = true;
    Sound.victoryChime();

    // Guardar en localStorage
    saveProgress();

    // Poblar pizarra de victoria
    DOM.coordLat.textContent = CONFIG.coordinates.latitude;
    DOM.coordLong.textContent = CONFIG.coordinates.longitude;

    // Mostrar modal
    DOM.victoryModal.classList.remove('hidden');
  }

  function saveProgress() {
    try {
      const completionKey = `silvia_${CONFIG.stationId}_completed`;
      const dataKey = `silvia_${CONFIG.stationId}_data`;

      localStorage.setItem(completionKey, 'true');
      localStorage.setItem(dataKey, JSON.stringify({
        stationId: CONFIG.stationId,
        stationName: CONFIG.stationName,
        solvedAt: new Date().toISOString(),
        revealedLetter: CONFIG.targetLetter,
        coordinates: CONFIG.coordinates
      }));

      // Notificar evento global si el Hub está escuchando
      window.dispatchEvent(new CustomEvent('stationSolved', {
        detail: { stationId: CONFIG.stationId }
      }));
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e);
    }
  }

  // ==========================================================================
  // 4. INICIALIZACIÓN Y EVENT LISTENERS
  // ==========================================================================

  function init() {
    // Comprobar si ya estaba completado previamente
    const wasCompleted = localStorage.getItem(`silvia_${CONFIG.stationId}_completed`);
    if (wasCompleted === 'true') {
      DOM.inputLetter.value = CONFIG.targetLetter;
      updateWheelRotation(CONFIG.targetAngle);
    }

    // Modal de bienvenida
    DOM.btnStartGame.addEventListener('click', () => {
      getAudioContext();
      Sound.tick();
      DOM.introModal.classList.add('hidden');
    });

    // Botón de ayuda para reabrir instrucciones
    DOM.btnHelpToggle.addEventListener('click', () => {
      DOM.introModal.classList.remove('hidden');
    });

    // Control de sonido
    DOM.btnSoundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      DOM.btnSoundToggle.textContent = state.soundEnabled ? '🔊' : '🔇';
      DOM.btnSoundToggle.setAttribute('aria-label', state.soundEnabled ? 'Mute Sound' : 'Unmute Sound');
    });

    // Verificación
    DOM.btnVerify.addEventListener('click', checkSolution);
    DOM.inputLetter.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkSolution();
    });

    // Retorno al Hub
    DOM.btnReturnHub.addEventListener('click', () => {
      window.location.href = CONFIG.hubUrl;
    });

    // Iniciar interactivo
    initDialInteraction();
    updateWheelRotation(0);
  }

  // Lanzar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
