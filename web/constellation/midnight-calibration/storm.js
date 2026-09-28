/**
 * THE ECLIPSE ORDER · THE SHIFTING TEMPEST SIMULATION & AUDIO SYNTHESIZER
 * Procedural Canvas Particle Storm & Web Audio API Soundscape Engine
 */

(function (window) {
  'use strict';

  // --- Web Audio API Procedural Soundscape ---
  let audioCtx = null;
  let stormGain = null;
  let stormNoiseNode = null;
  let stormFilter = null;
  let stormLfo = null;
  let isAudioMuted = false;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize mechanical brass ratchet click
  function playRatchetClick() {
    if (isAudioMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
    filter.Q.setValueAtTime(3.5, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  }

  // Synthesize heavy brass gear lock / clank
  function playBrassClank() {
    if (isAudioMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.35);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(580, audioCtx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.35);
    osc2.stop(audioCtx.currentTime + 0.35);
  }

  // Optical Collimated Beam Chime
  function playOpticalHum() {
    if (isAudioMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.6); // C6

    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  }

  // Dramatic Tempest Wind & Electrostatic Storm Audio
  function startStormAudio() {
    if (isAudioMuted) return;
    initAudioContext();
    if (!audioCtx || stormGain) return;

    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // Pink noise generation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    stormNoiseNode = audioCtx.createBufferSource();
    stormNoiseNode.buffer = noiseBuffer;
    stormNoiseNode.loop = true;

    stormFilter = audioCtx.createBiquadFilter();
    stormFilter.type = 'lowpass';
    stormFilter.frequency.setValueAtTime(450, audioCtx.currentTime);

    // LFO to create howling gust swell
    stormLfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    stormLfo.frequency.setValueAtTime(0.2, audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(320, audioCtx.currentTime);
    stormLfo.connect(lfoGain);
    lfoGain.connect(stormFilter.frequency);

    stormGain = audioCtx.createGain();
    stormGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    stormGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 3.0);

    stormNoiseNode.connect(stormFilter);
    stormFilter.connect(stormGain);
    stormGain.connect(audioCtx.destination);

    stormNoiseNode.start();
    stormLfo.start();
  }

  function playThunderRumble() {
    if (isAudioMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.8);
  }

  function playSuccessChime() {
    if (isAudioMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + idx * 0.12);
      osc.stop(audioCtx.currentTime + idx * 0.12 + 1.2);
    });
  }

  // --- Canvas Particle Storm & Ambient Starfield Engine ---
  let ambientCanvas, ambientCtx;
  let stormCanvas, stormCtx;
  let stars = [];
  let sandParticles = [];
  let lightningArcs = [];
  let isStormActive = false;
  let animationFrameId = null;

  function setupCanvases() {
    ambientCanvas = document.getElementById('ambient-sky-canvas');
    stormCanvas = document.getElementById('storm-canvas');

    if (!ambientCanvas || !stormCanvas) return;

    ambientCtx = ambientCanvas.getContext('2d');
    stormCtx = stormCanvas.getContext('2d');

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    initStars();
    initSandParticles();
    animateScene();
  }

  function resizeCanvases() {
    if (!ambientCanvas || !stormCanvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ambientCanvas.width = w;
    ambientCanvas.height = h;
    stormCanvas.width = w;
    stormCanvas.height = h;
  }

  function initStars() {
    stars = [];
    const count = Math.floor((window.innerWidth * window.innerHeight) / 3800);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  function initSandParticles() {
    sandParticles = [];
    const count = 350;
    for (let i = 0; i < count; i++) {
      sandParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 18 + 6,
        thickness: Math.random() * 1.8 + 0.6,
        vx: -(Math.random() * 14 + 18), // strong desert wind blowing right to left
        vy: (Math.random() * 4 + 2),
        alpha: Math.random() * 0.6 + 0.25,
        hue: Math.floor(Math.random() * 25 + 25) // amber to copper
      });
    }
  }

  function triggerLightning() {
    if (!isStormActive) return;
    const startX = Math.random() * window.innerWidth;
    const segments = [];
    let curX = startX;
    let curY = 0;

    while (curY < window.innerHeight * 0.8) {
      const nextX = curX + (Math.random() * 60 - 30);
      const nextY = curY + Math.random() * 45 + 15;
      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
      curX = nextX;
      curY = nextY;
    }

    lightningArcs.push({
      segments: segments,
      alpha: 1.0,
      life: 0.18
    });

    playThunderRumble();
  }

  function activateStormSimulation() {
    isStormActive = true;
    if (stormCanvas) stormCanvas.classList.add('active');
    startStormAudio();

    // Trigger intermittent lightning flashes
    setInterval(() => {
      if (isStormActive && Math.random() < 0.35) {
        triggerLightning();
      }
    }, 2800);
  }

  function animateScene() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 1. Draw Ambient Starfield
    if (ambientCtx) {
      ambientCtx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha = Math.max(0.1, s.alpha + Math.sin(s.twinklePhase) * 0.3);
        ambientCtx.fillStyle = `rgba(240, 245, 255, ${currentAlpha})`;
        ambientCtx.beginPath();
        ambientCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ambientCtx.fill();
      });
    }

    // 2. Draw Storm (Sand Particles & Lightning Arcs)
    if (stormCtx && isStormActive) {
      stormCtx.clearRect(0, 0, w, h);

      // Desert dust atmospheric haze
      stormCtx.fillStyle = 'rgba(75, 40, 15, 0.08)';
      stormCtx.fillRect(0, 0, w, h);

      // Draw Sand Particles
      sandParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -50) p.x = w + 50;
        if (p.y > h + 50) p.y = -50;

        stormCtx.strokeStyle = `hsla(${p.hue}, 85%, 55%, ${p.alpha})`;
        stormCtx.lineWidth = p.thickness;
        stormCtx.beginPath();
        stormCtx.moveTo(p.x, p.y);
        stormCtx.lineTo(p.x + p.length, p.y - (p.length * 0.25));
        stormCtx.stroke();
      });

      // Draw Lightning
      for (let i = lightningArcs.length - 1; i >= 0; i--) {
        const l = lightningArcs[i];
        l.alpha -= 0.04;
        if (l.alpha <= 0) {
          lightningArcs.splice(i, 1);
          continue;
        }

        stormCtx.strokeStyle = `rgba(104, 214, 227, ${l.alpha})`;
        stormCtx.lineWidth = 2.5;
        stormCtx.shadowColor = '#68d6e3';
        stormCtx.shadowBlur = 20;

        l.segments.forEach(seg => {
          stormCtx.beginPath();
          stormCtx.moveTo(seg.x1, seg.y1);
          stormCtx.lineTo(seg.x2, seg.y2);
          stormCtx.stroke();
        });
        stormCtx.shadowBlur = 0;
      }
    }

    animationFrameId = requestAnimationFrame(animateScene);
  }

  // Export engine methods globally
  window.OrderStormEngine = {
    init: setupCanvases,
    activateStorm: activateStormSimulation,
    playRatchetClick,
    playBrassClank,
    playOpticalHum,
    playSuccessChime,
    initAudioContext
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCanvases);
  } else {
    setupCanvases();
  }

})(window);
