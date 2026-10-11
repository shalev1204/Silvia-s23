/**
 * THE ECLIPSE ORDER · 3D RETRO RAYCAST ENGINE v3.0 (RENAISSANCE ARCHAEOLOGICAL LABYRINTH)
 * Features:
 * - Intricate 25x25 Ancient Sandstone Labyrinth of Tower II (30-40% enhanced complexity)
 * - 640x400 High-Res Software Raycasting (Silky 60 FPS Delta-Time normalized, 16:10 native aspect ratio)
 * - 360° Panoramic Parallax Celestial Skybox (Kepler constellations, Crescent Moon, Tower II spire)
 * - Textured Flagstone Floor with Mortar Joints & Radial Inverse-Square Lantern Illumination
 * - Vertical Ambient Occlusion & Directional Key/Shadow Lighting
 * - 128x128 High-Definition Procedural Renaissance Textures (Da Vinci astronomical reliefs, Corinthian columns)
 * - Enlarged Tactical Archaeological Radar (128x128) with local 2D stone grid & multi-beacon telemetry
 * - Full Archaeological Blueprint Modal [M] displaying complete surveyed floor plan, live player pin & checklist
 * - Subtle walking head-bob & atmospheric Web Audio soundscapes
 */

(function () {
  'use strict';

  // Map Dimensions: 25x25 Labyrinth
  const MAP_W = 25;
  const MAP_H = 25;

  // Tile Legend:
  // 0: Open Walkable Corridor / Flagstone Floor
  // 1: Sandstone Wall with Da Vinci Astronomical Reliefs
  // 2: Weathered Corinthian Pillar
  // 3: Sun Obelisk (☀ West Wing) at (2, 21)
  // 4: Moon Obelisk (☽ North-East Wing) at (22, 3)
  // 5: Star Obelisk (✦ South-East Wing) at (22, 21)
  // 6: Great Sanctuary Portcullis (Locked until 3 runes active) at (12, 10)
  // 7: Raiders' Iron Chest Altar (Inside the Sanctuary Vault) at (12, 12)
  const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,2,0,4,1,1], // Moon Obelisk at (22, 3)
    [1,1,0,0,2,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,0,2,0,1,1],
    [1,1,0,1,1,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1],
    [1,1,0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,1,0,1,1],
    [1,1,0,1,1,1,1,1,1,0,0,1,0,1,0,0,1,1,1,1,1,1,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // North Outer Vault Hall
    [1,1,1,1,1,1,1,0,1,0,1,1,6,1,1,0,1,0,1,1,1,1,0,1,1], // Vault Gate at (12, 10)
    [1,1,1,1,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1,1,0,1,1],
    [1,1,1,0,0,0,1,0,1,0,1,0,7,0,1,0,1,0,1,0,0,0,0,1,1], // Raiders' Chest at (12, 12)
    [1,1,1,0,2,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,2,0,0,1,1],
    [1,1,1,0,0,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // South Outer Vault Hall
    [1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
    [1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1],
    [1,1,0,0,0,0,1,1,1,1,0,1,0,1,0,1,1,1,1,0,0,0,0,1,1],
    [1,1,0,0,2,0,1,1,1,1,0,1,0,1,0,1,1,1,1,0,0,2,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,3,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,5,1,1], // Sun at (2, 21), Star at (22, 21)
    [1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Game Quest State
  const questState = {
    sunActive: false,
    moonActive: false,
    starActive: false,
    gateOpen: false,
    chestOpened: false,
    isMapOpen: false
  };

  // Interactive Objectives in the Labyrinth
  const objectives = {
    sun:   { x: 2.5,  y: 21.5, name: 'Sol Obelisk',   symbol: '☀', type: 'sun',  desc: 'West Wing' },
    moon:  { x: 22.5, y: 3.5,  name: 'Luna Obelisk',  symbol: '☽', type: 'moon', desc: 'North-East Wing' },
    star:  { x: 22.5, y: 21.5, name: 'Stella Obelisk', symbol: '✦', type: 'star', desc: 'South-East Wing' },
    gate:  { x: 12.5, y: 10.5, name: 'Sanctuary Gate', desc: 'Central Vault' },
    chest: { x: 12.5, y: 12.5, name: "Raiders' Chest", desc: 'Inner Altar' }
  };

  // Player State: Spawn in Entrance Courtyard facing East-South-East
  const player = {
    x: 3.5,
    y: 3.5,
    dirX: 0.9238, // Facing ~22.5 degrees South of East
    dirY: 0.3826,
    planeX: -0.2525, // Perpendicular Camera Plane (FOV ~66°)
    planeY: 0.6097,
    moveSpeed: 0.058,
    rotSpeed: 0.038,
    bobPhase: 0,
    currBobY: 0
  };

  // Input States
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    rotLeft: false,
    rotRight: false
  };

  // Web Audio Sound Engine
  class RetroAudio {
    constructor() {
      this.ctx = null;
      this.windGain = null;
      this.isMuted = false;
      this.lastStepTime = 0;
      this.lastSonarPing = 0;
    }

    start() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        return;
      }
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        // Atmospheric Desert Night Wind
        const bufSize = this.ctx.sampleRate * 2;
        const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const out = noiseBuf.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufSize; i++) {
          const white = Math.random() * 2 - 1;
          out[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = out[i];
        }

        const windSource = this.ctx.createBufferSource();
        windSource.buffer = noiseBuf;
        windSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(240, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.8, this.ctx.currentTime);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(this.isMuted ? 0 : 0.055, this.ctx.currentTime);

        windSource.connect(filter);
        filter.connect(this.windGain);
        this.windGain.connect(this.ctx.destination);
        windSource.start(0);

        // Wind Whistle LFO
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(90, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(0);
      } catch (e) {}
    }

    setMute(muted) {
      this.isMuted = muted;
      if (this.windGain && this.ctx) {
        this.windGain.gain.setValueAtTime(this.isMuted ? 0 : 0.055, this.ctx.currentTime);
      }
    }

    playFootstep() {
      if (this.isMuted || !this.ctx) return;
      const now = performance.now();
      if (now - this.lastStepTime < 380) return;
      this.lastStepTime = now;

      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.07);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.07);
      } catch (e) {}
    }

    playSonarPing(dist) {
      if (this.isMuted || !this.ctx) return;
      const now = performance.now();
      const interval = Math.max(700, Math.min(2600, dist * 130));
      if (now - this.lastSonarPing < interval) return;
      this.lastSonarPing = now;

      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1420, t);
        osc.frequency.exponentialRampToValueAtTime(980, t + 0.12);

        gain.gain.setValueAtTime(0.045, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      } catch (e) {}
    }

    playRuneAttune(type) {
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        let chord = [293.66, 369.99, 440.00, 587.33]; // D Major (Sun)
        if (type === 'moon') chord = [261.63, 329.63, 392.00, 523.25]; // C Major/Silver (Moon)
        if (type === 'star') chord = [329.63, 415.30, 493.88, 659.25]; // E Major (Star)

        chord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);

          gain.gain.setValueAtTime(0.12, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 2.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 2.3);
        });
      } catch (e) {}
    }

    playGateUnseal() {
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const rumbleOsc = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();

        rumbleOsc.type = 'sawtooth';
        rumbleOsc.frequency.setValueAtTime(45, t);
        rumbleOsc.frequency.linearRampToValueAtTime(30, t + 2.0);

        rumbleGain.gain.setValueAtTime(0.28, t);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

        rumbleOsc.connect(rumbleGain);
        rumbleGain.connect(this.ctx.destination);
        rumbleOsc.start(t);
        rumbleOsc.stop(t + 2.4);
      } catch (e) {}
    }

    playChestFanfare() {
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const notes = [220, 277.18, 329.63, 440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = t + i * 0.09;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.14, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 1.85);
        });
      } catch (e) {}
    }
  }

  const audio = new RetroAudio();

  // Procedural 128x128 High-Definition Textures
  const TEX_SIZE = 128;
  const textures = {};

  function generateTextures() {
    function createTexture(renderer) {
      const c = document.createElement('canvas');
      c.width = TEX_SIZE;
      c.height = TEX_SIZE;
      const ctx = c.getContext('2d');
      const imgData = ctx.createImageData(TEX_SIZE, TEX_SIZE);
      const data = imgData.data;

      for (let y = 0; y < TEX_SIZE; y++) {
        for (let x = 0; x < TEX_SIZE; x++) {
          const idx = (y * TEX_SIZE + x) * 4;
          const [r, g, b, a] = renderer(x, y);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = a;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return ctx.getImageData(0, 0, TEX_SIZE, TEX_SIZE).data;
    }

    // 1. Sandstone Ashlar with Da Vinci Astronomical Reliefs
    textures[1] = createTexture((x, y) => {
      const blockRow = Math.floor(y / 32);
      const isMortarH = (y % 32 <= 1 || y % 32 >= 30);
      const offsetX = (blockRow % 2 === 0) ? 0 : 32;
      const isMortarV = ((x + offsetX) % 64 <= 1 || (x + offsetX) % 64 >= 62);
      const noise = ((x * 17 ^ y * 13) % 23) * 2;

      if (isMortarH || isMortarV) {
        return [45 - noise, 32 - noise, 18 - noise, 255]; // Deep mortar shadow
      }

      // Engraved Da Vinci concentric planetary rings and angle spokes
      const localCX = ((x + offsetX) % 64) - 32;
      const localCY = (y % 32) - 16;
      const distC = Math.sqrt(localCX * localCX + localCY * localCY);
      const isRingRelief = (Math.abs(distC - 11) <= 1.2 || Math.abs(distC - 6) <= 0.8);
      const isSpoke = (distC <= 12 && (Math.abs(localCX) <= 0.6 || Math.abs(localCY) <= 0.6));

      let baseR = 188 - noise;
      let baseG = 138 - noise;
      let baseB = 84 - noise;

      if (isRingRelief || isSpoke) {
        baseR += 40;
        baseG += 30;
        baseB += 18;
      }

      return [Math.max(25, baseR), Math.max(18, baseG), Math.max(10, baseB), 255];
    });

    // 2. Weathered Corinthian Pillar with Deep Fluted Shadows & Gold Trim
    textures[2] = createTexture((x, y) => {
      const flute = Math.abs(Math.sin((x / TEX_SIZE) * Math.PI * 6)) * 55;
      const noise = ((x * 7 ^ y * 11) % 17) * 2;
      let baseR = 192 - flute - noise;
      let baseG = 146 - flute - noise;
      let baseB = 96 - flute - noise;

      if (y < 16) { // Carved Acanthus Capital
        const cap = Math.sin((x / 16) * Math.PI) * 25;
        baseR += 42 + cap;
        baseG += 32 + cap;
        baseB += 18;
      } else if (y > 114) { // Stepped Base Molding
        baseR += 28;
        baseG += 22;
        baseB += 14;
      }

      return [Math.max(25, baseR), Math.max(18, baseG), Math.max(10, baseB), 255];
    });

    // 3. Sun Rune Obelisk (☀ Radiant Solar Gold Glyphs)
    textures[3] = createTexture((x, y) => {
      const cx = 64, cy = 64;
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const isSunDisk = (d <= 15);
      const isSunRay = (d > 17 && d < 32 && ((x - cx) * (y - cy)) % 9 === 0);
      const isGlyph = isSunDisk || isSunRay;

      if (isGlyph) {
        return [255, 222, 115, 255]; // Living Solar Fire Gold
      }
      const noise = ((x * 19 + y * 23) % 29) * 2;
      return [90 - noise, 65 - noise, 40 - noise, 255];
    });

    // 4. Moon Rune Obelisk (☽ Lunar Opal Silver Glyphs)
    textures[4] = createTexture((x, y) => {
      const cx = 64, cy = 64;
      const d1 = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const d2 = Math.sqrt((x - (cx + 9)) ** 2 + (y - (cy - 4)) ** 2);
      const isCrescent = (d1 <= 24 && d2 > 17);

      if (isCrescent) {
        return [225, 246, 255, 255]; // Lunar Opal Silver
      }
      const noise = ((x * 13 + y * 29) % 27) * 2;
      return [60 - noise, 75 - noise, 95 - noise, 255];
    });

    // 5. Star Rune Obelisk (✦ Telemetry Cyan Luminous Glyphs)
    textures[5] = createTexture((x, y) => {
      const cx = 64, cy = 64;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const isStar4 = (dx < 5 && dy < 32) || (dy < 5 && dx < 32) || (dx < 18 && dy < 18 && Math.abs(dx - dy) < 4);

      if (isStar4) {
        return [79, 227, 193, 255]; // Astral Turquoise Cyan
      }
      const noise = ((x * 23 + y * 17) % 31) * 2;
      return [40 - noise, 68 - noise, 78 - noise, 255];
    });

    // 6. Great Sanctuary Portcullis Gate
    textures[6] = createTexture((x, y) => {
      const isBarV = (x % 16 <= 3);
      const isBarH = (y % 32 <= 3);
      const isSpike = (y < 16 && (x % 16 === 1 || x % 16 === 2));

      // Central Rune Lock Wheel
      const distCenter = Math.sqrt((x - 64) ** 2 + (y - 64) ** 2);
      if (distCenter <= 20) {
        if (distCenter <= 7) {
          return questState.gateOpen ? [79, 227, 193, 255] : [246, 173, 85, 255];
        }
        return [255, 218, 130, 255]; // Polished Brass Dial
      }

      if (isBarV || isBarH || isSpike) {
        const ironNoise = ((x * 5 ^ y * 7) % 13) * 3;
        return [40 + ironNoise, 34 + ironNoise, 30 + ironNoise, 255];
      }
      // Void behind bars: dark sanctuary interior
      return [10, 14, 22, 255];
    });

    // 7. Raiders' Altar & Iron Chest
    textures[7] = createTexture((x, y) => {
      // Sandstone Pedestal Top & Base
      if (y < 22 || y > 106) {
        const noise = ((x ^ y) % 17) * 3;
        return [198 - noise, 148 - noise, 88 - noise, 255];
      }

      // Polished Brass Edges & Reinforcement Straps
      const isBrassBorder = (x < 12 || x > 115 || y === 22 || y === 23 || y === 105 || y === 106);
      const isBrassStrap = (Math.abs(x - 40) <= 5 || Math.abs(x - 88) <= 5 || Math.abs(y - 64) <= 5);

      // Cyan Luminous Frequency Seal
      const distC = Math.sqrt((x - 64) ** 2 + (y - 64) ** 2);
      if (distC <= 14) {
        return [79, 227, 193, 255];
      }
      if (distC <= 18) {
        return [255, 216, 133, 255]; // Gold Lock Escutcheon
      }

      if (isBrassBorder || isBrassStrap) {
        const rivet = ((x % 16 <= 2) && (y % 16 <= 2)) ? 40 : 0;
        return [210 + rivet, 175 + rivet, 85, 255];
      }

      // Dark Aged Iron / Oak Coffer Body
      const woodGrain = ((x * 3 ^ y * 7) % 11) * 2;
      return [42 + woodGrain, 32 + woodGrain, 26 + woodGrain, 255];
    });
  }

  // 360° Panoramic Parallax Celestial Skybox
  const SKY_W = 1280;
  const SKY_H = 200;
  let skyCanvas, skyCtx;

  function buildSkybox() {
    skyCanvas = document.createElement('canvas');
    skyCanvas.width = SKY_W;
    skyCanvas.height = SKY_H;
    skyCtx = skyCanvas.getContext('2d');

    // Renaissance Deep Twilight Firmament Gradient
    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, SKY_H);
    skyGrad.addColorStop(0, '#070b16');
    skyGrad.addColorStop(0.5, '#0d1526');
    skyGrad.addColorStop(0.85, '#162238');
    skyGrad.addColorStop(1, '#252028');
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, SKY_W, SKY_H);

    // Procedural Stars & Constellations
    const starList = [];
    for (let i = 0; i < 280; i++) {
      const sx = ((i * 137.5) % SKY_W);
      const sy = Math.floor(((i * 73.1) % (SKY_H - 45)) + 8);
      const mag = (i % 5 === 0) ? 2.2 : (i % 2 === 0 ? 1.4 : 0.8);
      const alpha = 0.4 + (i % 7) * 0.08;

      skyCtx.fillStyle = `rgba(255, 245, 220, ${alpha})`;
      skyCtx.beginPath();
      skyCtx.arc(sx, sy, mag, 0, Math.PI * 2);
      skyCtx.fill();

      if (mag > 1.3) starList.push({ x: sx, y: sy });
    }

    // Kepler Constellation Line Segments
    skyCtx.strokeStyle = 'rgba(79, 227, 193, 0.22)';
    skyCtx.lineWidth = 0.8;
    for (let k = 0; k < starList.length - 1; k += 2) {
      const s1 = starList[k];
      const s2 = starList[k + 1];
      if (Math.hypot(s1.x - s2.x, s1.y - s2.y) < 95) {
        skyCtx.beginPath();
        skyCtx.moveTo(s1.x, s1.y);
        skyCtx.lineTo(s2.x, s2.y);
        skyCtx.stroke();
      }
    }

    // Glowing Crescent Moon at angle ~120° (South-East firmament)
    const moonX = SKY_W * 0.33;
    const moonY = 46;
    const moonGlow = skyCtx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 54);
    moonGlow.addColorStop(0, 'rgba(255, 248, 220, 0.65)');
    moonGlow.addColorStop(0.4, 'rgba(255, 235, 180, 0.2)');
    moonGlow.addColorStop(1, 'rgba(255, 235, 180, 0)');
    skyCtx.fillStyle = moonGlow;
    skyCtx.beginPath();
    skyCtx.arc(moonX, moonY, 54, 0, Math.PI * 2);
    skyCtx.fill();

    skyCtx.fillStyle = '#fff6d6';
    skyCtx.beginPath();
    skyCtx.arc(moonX, moonY, 15, 0, Math.PI * 2);
    skyCtx.fill();

    // Crescent shadow bite
    skyCtx.fillStyle = '#0a1428';
    skyCtx.beginPath();
    skyCtx.arc(moonX + 7, moonY - 3, 14, 0, Math.PI * 2);
    skyCtx.fill();

    // Distant Monolithic Silhouette of Tower II
    const towerX = SKY_W * 0.75;
    skyCtx.fillStyle = '#080d16';
    skyCtx.beginPath();
    skyCtx.moveTo(towerX - 28, SKY_H);
    skyCtx.lineTo(towerX - 20, SKY_H - 85);
    skyCtx.lineTo(towerX - 12, SKY_H - 95);
    skyCtx.lineTo(towerX, SKY_H - 122); // Tower Spire
    skyCtx.lineTo(towerX + 12, SKY_H - 95);
    skyCtx.lineTo(towerX + 20, SKY_H - 85);
    skyCtx.lineTo(towerX + 28, SKY_H);
    skyCtx.closePath();
    skyCtx.fill();

    // Sandstone Dune Ridges along the Horizon
    skyCtx.fillStyle = 'rgba(18, 14, 22, 0.85)';
    skyCtx.beginPath();
    skyCtx.moveTo(0, SKY_H);
    for (let x = 0; x <= SKY_W; x += 40) {
      const dy = Math.sin((x / SKY_W) * Math.PI * 8) * 14 + Math.cos((x / SKY_W) * Math.PI * 14) * 8;
      skyCtx.lineTo(x, SKY_H - 20 + dy);
    }
    skyCtx.lineTo(SKY_W, SKY_H);
    skyCtx.closePath();
    skyCtx.fill();
  }

  // Engine Setup & Rendering State
  let canvas, ctx;
  let radarCanvas, radarCtx;
  let fullMapCanvas, fullMapCtx;

  // High Resolution 16:10 Native Screen
  const screenWidth = 640;
  const screenHeight = 400;
  let screenImgData = null;
  let screenPixels = null;
  let zBuffer = [];
  let isRunning = false;
  let radarSweepAngle = 0;
  let lastFrameTime = performance.now();
  let activeInteraction = null;

  window.startRaycastEngine = function () {
    if (isRunning) return;
    isRunning = true;

    canvas = document.getElementById('raycast-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    screenImgData = ctx.createImageData(screenWidth, screenHeight);
    screenPixels = screenImgData.data;
    zBuffer = new Array(screenWidth).fill(0);

    radarCanvas = document.getElementById('hud-radar-canvas');
    if (radarCanvas) {
      radarCtx = radarCanvas.getContext('2d');
    }

    generateTextures();
    buildSkybox();
    audio.start();

    setupInputHandlers();
    setupAudioToggle();
    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
  };

  // Audio Toggle UI Handler
  function setupAudioToggle() {
    const btnAudio = document.getElementById('hud-audio-toggle');
    const audioIcon = document.getElementById('hud-audio-icon');
    const audioLabel = document.getElementById('hud-audio-label');

    if (btnAudio) {
      btnAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.setMute(!audio.isMuted);
        if (audio.isMuted) {
          btnAudio.classList.add('muted');
          if (audioIcon) audioIcon.innerText = '🔇';
          if (audioLabel) audioLabel.innerText = 'MUTED';
        } else {
          btnAudio.classList.remove('muted');
          if (audioIcon) audioIcon.innerText = '🔊';
          if (audioLabel) audioLabel.innerText = 'SOUND';
        }
      });
    }
  }



  // Keyboard, Mouse Drag, Touch Swipe
  function setupInputHandlers() {
    window.addEventListener('keydown', (e) => {
      // WASD Movement
      if (['w', 'W'].includes(e.key)) keys.forward = true;
      if (['s', 'S'].includes(e.key)) keys.backward = true;
      if (['a', 'A'].includes(e.key)) keys.left = true;
      if (['d', 'D'].includes(e.key)) keys.right = true;

      // Camera rotation with arrow keys
      if (e.key === 'ArrowLeft') { e.preventDefault(); keys.rotLeft = true; }
      if (e.key === 'ArrowRight') { e.preventDefault(); keys.rotRight = true; }
      if (e.key === 'ArrowUp') { e.preventDefault(); keys.forward = true; }
      if (e.key === 'ArrowDown') { e.preventDefault(); keys.backward = true; }

      // Key 'E' / Space / Enter: INTERACT WITH OBJECTS ONLY (No movement or rotation!)
      if (['e', 'E', ' ', 'Enter'].includes(e.key)) {
        if (activeInteraction) {
          e.preventDefault();
          handleInteractionTrigger();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['w', 'W', 'ArrowUp'].includes(e.key)) keys.forward = false;
      if (['s', 'S', 'ArrowDown'].includes(e.key)) keys.backward = false;
      if (['a', 'A'].includes(e.key)) keys.left = false;
      if (['d', 'D'].includes(e.key)) keys.right = false;
      if (e.key === 'ArrowLeft') keys.rotLeft = false;
      if (e.key === 'ArrowRight') keys.rotRight = false;
    });

    // Mouse Drag Look-Around
    const viewport = document.getElementById('raycast-viewport-frame');
    let isDragging = false;
    let lastMouseX = 0;

    if (viewport) {
      viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.hud-audio-btn') || e.target.closest('.hud-map-btn') || e.target.closest('.v-btn') || e.target.closest('#hud-proximity-prompt') || e.target.closest('.labyrinth-map-modal')) return;
        isDragging = true;
        lastMouseX = e.clientX;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastMouseX;
        lastMouseX = e.clientX;
        if (deltaX !== 0) {
          rotatePlayer(deltaX * 0.0042);
        }
      });

      window.addEventListener('mouseup', () => { isDragging = false; });
      viewport.addEventListener('mouseleave', () => { isDragging = false; });

      // Touch Drag / Swipe Look-Around
      let touchStartX = 0;
      let isTouching = false;

      viewport.addEventListener('touchstart', (e) => {
        if (e.target.closest('.virtual-controls-wrap') || e.target.closest('.hud-audio-btn') || e.target.closest('.hud-map-btn') || e.target.closest('#hud-proximity-prompt') || e.target.closest('.labyrinth-map-modal')) return;
        if (e.touches.length === 1) {
          isTouching = true;
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        if (!isTouching || e.touches.length !== 1) return;
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchStartX;
        touchStartX = currentX;
        if (deltaX !== 0) {
          rotatePlayer(deltaX * 0.0055);
        }
      }, { passive: true });

      viewport.addEventListener('touchend', () => { isTouching = false; });
      viewport.addEventListener('touchcancel', () => { isTouching = false; });
    }

    // Virtual Touch Buttons for Mobile
    function bindTouchBtn(id, keyProp) {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyProp] = true; });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyProp] = false; });
      btn.addEventListener('touchcancel', (e) => { e.preventDefault(); keys[keyProp] = false; });
      btn.addEventListener('mousedown', (e) => { e.preventDefault(); keys[keyProp] = true; });
      btn.addEventListener('mouseup', () => { keys[keyProp] = false; });
      btn.addEventListener('mouseleave', () => { keys[keyProp] = false; });
    }

    bindTouchBtn('v-btn-up', 'forward');
    bindTouchBtn('v-btn-down', 'backward');
    bindTouchBtn('v-btn-left', 'left');
    bindTouchBtn('v-btn-right', 'right');
    bindTouchBtn('v-btn-rot-l', 'rotLeft');
    bindTouchBtn('v-btn-rot-r', 'rotRight');

    const promptEl = document.getElementById('hud-proximity-prompt');
    if (promptEl) {
      promptEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleInteractionTrigger();
      });
    }
  }

  // Rotation Helper
  function rotatePlayer(rot) {
    const oldDirX = player.dirX;
    player.dirX = player.dirX * Math.cos(rot) - player.dirY * Math.sin(rot);
    player.dirY = oldDirX * Math.sin(rot) + player.dirY * Math.cos(rot);

    const oldPlaneX = player.planeX;
    player.planeX = player.planeX * Math.cos(rot) - player.planeY * Math.sin(rot);
    player.planeY = oldPlaneX * Math.sin(rot) + player.planeY * Math.cos(rot);
  }

  // Smooth Wall Collision with Bounding Radius
  function isBlocked(x, y) {
    const pad = 0.28;
    const minX = Math.floor(x - pad);
    const maxX = Math.floor(x + pad);
    const minY = Math.floor(y - pad);
    const maxY = Math.floor(y + pad);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        if (cx < 0 || cx >= MAP_W || cy < 0 || cy >= MAP_H) return true;
        const tile = MAP[cy][cx];
        if (tile === 6 && questState.gateOpen) continue; // Unlocked Gate is walkable
        if (tile > 0) return true;
      }
    }
    return false;
  }

  // Update Player Physics & Head-Bobbing
  function updatePlayer(dtFactor) {
    let moveX = 0;
    let moveY = 0;
    const speed = player.moveSpeed * dtFactor;

    if (keys.forward) {
      moveX += player.dirX * speed;
      moveY += player.dirY * speed;
    }
    if (keys.backward) {
      moveX -= player.dirX * speed;
      moveY -= player.dirY * speed;
    }

    const strafeSpeed = speed * 0.82;
    if (keys.right) {
      moveX += -player.dirY * strafeSpeed;
      moveY += player.dirX * strafeSpeed;
    }
    if (keys.left) {
      moveX += player.dirY * strafeSpeed;
      moveY -= player.dirX * strafeSpeed;
    }

    let isMoving = false;
    if (moveX !== 0 && !isBlocked(player.x + moveX, player.y)) {
      player.x += moveX;
      isMoving = true;
    }
    if (moveY !== 0 && !isBlocked(player.x, player.y + moveY)) {
      player.y += moveY;
      isMoving = true;
    }

    if (isMoving) {
      player.bobPhase += 0.16 * dtFactor;
      player.currBobY = Math.sin(player.bobPhase) * 2.2;
      audio.playFootstep();
    } else {
      player.currBobY *= 0.85;
    }

    const rotSpeed = player.rotSpeed * dtFactor;
    if (keys.rotLeft) rotatePlayer(-rotSpeed);
    if (keys.rotRight) rotatePlayer(rotSpeed);

    updateQuestAndHUD();
  }

  // Check Proximity to Obelisks and Chest
  function updateQuestAndHUD() {
    // 1. Compass Heading
    const angleRad = Math.atan2(player.dirY, player.dirX);
    let deg = Math.round((angleRad * 180) / Math.PI);
    if (deg < 0) deg += 360;

    const compassEl = document.getElementById('hud-compass-deg');
    if (compassEl) {
      const cardinals = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
      const card = cardinals[Math.floor(((deg + 22.5) % 360) / 45)];
      compassEl.innerText = `${deg.toString().padStart(3, '0')}º ${card}`;
    }

    // 2. Scan Nearest Active Objective
    let target = null;
    let targetDist = Infinity;

    if (!questState.sunActive) {
      const d = Math.hypot(objectives.sun.x - player.x, objectives.sun.y - player.y);
      if (d < targetDist) { targetDist = d; target = objectives.sun; }
    }
    if (!questState.moonActive) {
      const d = Math.hypot(objectives.moon.x - player.x, objectives.moon.y - player.y);
      if (d < targetDist) { targetDist = d; target = objectives.moon; }
    }
    if (!questState.starActive) {
      const d = Math.hypot(objectives.star.x - player.x, objectives.star.y - player.y);
      if (d < targetDist) { targetDist = d; target = objectives.star; }
    }

    // If all runes active, target becomes the Sanctuary Vault / Chest
    if (questState.sunActive && questState.moonActive && questState.starActive) {
      const d = Math.hypot(objectives.chest.x - player.x, objectives.chest.y - player.y);
      targetDist = d;
      target = objectives.chest;
    }

    const beaconDistEl = document.getElementById('hud-beacon-dist');
    if (beaconDistEl && target) {
      beaconDistEl.innerText = `${(targetDist * 3.8).toFixed(1)}m`;
    }

    // Sonar Ping towards active target
    if (target) {
      audio.playSonarPing(targetDist);
    }

    // 3. Proximity Interaction Trigger
    activeInteraction = null;
    const promptEl = document.getElementById('hud-proximity-prompt');

    const distSun = Math.hypot(objectives.sun.x - player.x, objectives.sun.y - player.y);
    const distMoon = Math.hypot(objectives.moon.x - player.x, objectives.moon.y - player.y);
    const distStar = Math.hypot(objectives.star.x - player.x, objectives.star.y - player.y);
    const distChest = Math.hypot(objectives.chest.x - player.x, objectives.chest.y - player.y);

    if (distSun < 1.9 && !questState.sunActive) {
      activeInteraction = { type: 'sun' };
      if (promptEl) {
        promptEl.innerHTML = '<span>✦ ATTUNE SUN OBELISK · PRESS [E] OR TAP ✦</span>';
        promptEl.style.display = 'block';
      }
    } else if (distMoon < 1.9 && !questState.moonActive) {
      activeInteraction = { type: 'moon' };
      if (promptEl) {
        promptEl.innerHTML = '<span>✦ ATTUNE MOON OBELISK · PRESS [E] OR TAP ✦</span>';
        promptEl.style.display = 'block';
      }
    } else if (distStar < 1.9 && !questState.starActive) {
      activeInteraction = { type: 'star' };
      if (promptEl) {
        promptEl.innerHTML = '<span>✦ ATTUNE STAR OBELISK · PRESS [E] OR TAP ✦</span>';
        promptEl.style.display = 'block';
      }
    } else if (distChest < 2.0 && questState.gateOpen && !questState.chestOpened) {
      activeInteraction = { type: 'chest' };
      if (promptEl) {
        promptEl.innerHTML = "<span>✦ OPEN RAIDERS' CHEST · PRESS [E] OR TAP ✦</span>";
        promptEl.style.display = 'block';
      }
    } else {
      if (promptEl) promptEl.style.display = 'none';
    }

    // 4. Render Archaeological Radar (Points for 3 Obelisks, Peripheral Chest Direction when 3/3)
    renderRadar(angleRad);
  }

  // Handle Player Interaction
  function handleInteractionTrigger() {
    if (!activeInteraction) return;

    if (activeInteraction.type === 'sun') {
      questState.sunActive = true;
      audio.playRuneAttune('sun');
      updateRuneUI('sun');
      showCenterBanner('✦ SUN RUNE ATTUNED · SOLAR HARMONIC LOCKED ✦');
      checkAllRunes();
    } else if (activeInteraction.type === 'moon') {
      questState.moonActive = true;
      audio.playRuneAttune('moon');
      updateRuneUI('moon');
      showCenterBanner('✦ MOON RUNE ATTUNED · LUNAR FREQUENCY LOCKED ✦');
      checkAllRunes();
    } else if (activeInteraction.type === 'star') {
      questState.starActive = true;
      audio.playRuneAttune('star');
      updateRuneUI('star');
      showCenterBanner('✦ STAR RUNE ATTUNED · ASTRAL RESONANCE LOCKED ✦');
      checkAllRunes();
    } else if (activeInteraction.type === 'chest') {
      questState.chestOpened = true;
      audio.playChestFanfare();
      try { localStorage.setItem('order_zodiac_completed', 'true'); } catch (e) {}

      // Transition out of the 3D raycaster to the Victory Screen!
      isRunning = false;
      const raycastSec = document.getElementById('raycast-section');
      if (raycastSec) {
        raycastSec.classList.remove('active');
        raycastSec.style.display = 'none';
      }

      const victoryScreen = document.getElementById('victory-screen');
      if (victoryScreen) {
        victoryScreen.style.display = 'block';
        victoryScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      const promptEl = document.getElementById('hud-proximity-prompt');
      if (promptEl) promptEl.style.display = 'none';
    }
  }

  function updateRuneUI(type) {
    const badge = document.getElementById(`rune-badge-${type}`);
    if (badge) badge.classList.add('aligned');

    const runesCount = (questState.sunActive ? 1 : 0) + (questState.moonActive ? 1 : 0) + (questState.starActive ? 1 : 0);
    const gateStatus = document.getElementById('hud-gate-status');
    if (gateStatus && !questState.gateOpen) {
      gateStatus.innerText = `GATE: SEALED (${runesCount}/3)`;
    }
  }

  function checkAllRunes() {
    if (questState.sunActive && questState.moonActive && questState.starActive && !questState.gateOpen) {
      questState.gateOpen = true;
      MAP[10][12] = 0; // Portcullis unseals into walkable corridor!

      audio.playGateUnseal();
      showCenterBanner('✦ ALL 3 RUNES ATTUNED // SANCTUARY VAULT UNSEALED ✦');

      const gateStatus = document.getElementById('hud-gate-status');
      if (gateStatus) {
        gateStatus.innerText = 'VAULT: UNSEALED ➔';
        gateStatus.classList.add('unsealed');
      }

      const objText = document.getElementById('hud-objective-text');
      if (objText) {
        objText.innerText = "SANCTUARY UNSEALED // LOCATE RAIDERS' IRON CHEST AT CENTER";
      }

      const frame = document.getElementById('raycast-viewport-frame');
      if (frame) {
        frame.classList.add('vault-rumble');
        setTimeout(() => frame.classList.remove('vault-rumble'), 1200);
      }
    }
  }

  function showCenterBanner(msg) {
    const banner = document.getElementById('hud-center-banner');
    if (!banner) return;
    banner.innerText = msg;
    banner.classList.add('visible');
    setTimeout(() => banner.classList.remove('visible'), 3200);
  }

  // Tactical Archaeological Radar (3 Obelisk Discovery Points, Peripheral Chest Direction on 3/3)
  function renderRadar(playerAngle) {
    if (!radarCtx || !radarCanvas) return;
    const w = radarCanvas.width;
    const h = radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = cx - 2;

    radarCtx.clearRect(0, 0, w, h);

    // Dark Radar Scanner Glass
    radarCtx.save();
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    radarCtx.clip();

    radarCtx.fillStyle = '#060b14';
    radarCtx.fillRect(0, 0, w, h);

    // Range Concentric Rings & Crosshair Guides (No maze walls!)
    radarCtx.strokeStyle = 'rgba(79, 227, 193, 0.16)';
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
    radarCtx.arc(cx, cy, radius * 0.70, 0, Math.PI * 2);
    radarCtx.arc(cx, cy, radius * 0.98, 0, Math.PI * 2);
    // Subtle crosshairs
    radarCtx.moveTo(cx, cy - radius);
    radarCtx.lineTo(cx, cy + radius);
    radarCtx.moveTo(cx - radius, cy);
    radarCtx.lineTo(cx + radius, cy);
    radarCtx.stroke();

    // 360° Rotating Radar Sweep Line
    radarSweepAngle = (radarSweepAngle + 0.055) % (Math.PI * 2);
    const sweepGrad = radarCtx.createLinearGradient(
      cx, cy,
      cx + Math.cos(radarSweepAngle) * radius,
      cy + Math.sin(radarSweepAngle) * radius
    );
    sweepGrad.addColorStop(0, 'rgba(79, 227, 193, 0.8)');
    sweepGrad.addColorStop(1, 'rgba(79, 227, 193, 0.03)');

    radarCtx.strokeStyle = sweepGrad;
    radarCtx.lineWidth = 1.6;
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(cx + Math.cos(radarSweepAngle) * radius, cy + Math.sin(radarSweepAngle) * radius);
    radarCtx.stroke();

    const pX = player.x;
    const pY = player.y;

    // The 3 Celestial Obelisk Points to Discover (Sol, Luna, Stella)
    const obeliskList = [
      { ...objectives.sun, active: questState.sunActive, color: '#ffd885', label: '☀' },
      { ...objectives.moon, active: questState.moonActive, color: '#e2e8f0', label: '☽' },
      { ...objectives.star, active: questState.starActive, color: '#4fe3c1', label: '✦' }
    ];

    obeliskList.forEach(t => {
      const dx = t.x - pX;
      const dy = t.y - pY;
      const dist = Math.hypot(dx, dy);
      const targetAngle = Math.atan2(dy, dx);
      const relAngle = targetAngle - playerAngle - Math.PI / 2;
      const rDist = Math.min(radius - 12, (dist / 26) * (radius - 12));
      const blipX = cx + Math.cos(relAngle) * rDist;
      const blipY = cy + Math.sin(relAngle) * rDist;

      if (t.active) {
        // Attuned: subtle silver/dimmed point with small ring
        radarCtx.fillStyle = 'rgba(140, 160, 175, 0.55)';
        radarCtx.beginPath();
        radarCtx.arc(blipX, blipY, 3, 0, Math.PI * 2);
        radarCtx.fill();
        radarCtx.strokeStyle = 'rgba(140, 160, 175, 0.35)';
        radarCtx.lineWidth = 1;
        radarCtx.beginPath();
        radarCtx.arc(blipX, blipY, 5.5, 0, Math.PI * 2);
        radarCtx.stroke();
      } else {
        // Active discovery objective: Glowing point
        radarCtx.fillStyle = t.color;
        radarCtx.shadowColor = t.color;
        radarCtx.shadowBlur = 9;
        radarCtx.beginPath();
        radarCtx.arc(blipX, blipY, 3.8, 0, Math.PI * 2);
        radarCtx.fill();
        radarCtx.shadowBlur = 0;

        // Rune symbol glyph next to the point
        radarCtx.fillStyle = t.color;
        radarCtx.font = '8px sans-serif';
        radarCtx.fillText(t.label, blipX + 5, blipY + 3);
      }
    });

    // When all 3 are attuned, show chest bearing PERIPHERALLY ONLY on the minimap border!
    if (questState.gateOpen && !questState.chestOpened) {
      const cdx = objectives.chest.x - pX;
      const cdy = objectives.chest.y - pY;
      const chestBearing = Math.atan2(cdy, cdx);
      const relChestAngle = chestBearing - playerAngle - Math.PI / 2;

      // Position strictly along the outer perimeter / border of the minimap
      const rimR = radius - 8;
      const indX = cx + Math.cos(relChestAngle) * rimR;
      const indY = cy + Math.sin(relChestAngle) * rimR;

      const pulse = 0.75 + 0.25 * Math.sin(Date.now() * 0.008);

      // 1. Glowing arc segment on the border rim pointing towards chest direction
      radarCtx.save();
      radarCtx.strokeStyle = `rgba(246, 173, 85, ${0.85 * pulse})`;
      radarCtx.lineWidth = 3.5;
      radarCtx.shadowColor = '#f6ad55';
      radarCtx.shadowBlur = 8 * pulse;
      radarCtx.beginPath();
      radarCtx.arc(cx, cy, radius - 3, relChestAngle - 0.24, relChestAngle + 0.24);
      radarCtx.stroke();
      radarCtx.restore();

      // 2. Peripheral directional beacon chevron / pointer on the border
      radarCtx.save();
      radarCtx.translate(indX, indY);
      radarCtx.rotate(relChestAngle + Math.PI / 2); // Oriented towards bearing

      radarCtx.fillStyle = `rgba(246, 173, 85, ${pulse})`;
      radarCtx.shadowColor = '#ffd885';
      radarCtx.shadowBlur = 10 * pulse;

      radarCtx.beginPath();
      radarCtx.moveTo(0, -6);
      radarCtx.lineTo(5, 4);
      radarCtx.lineTo(0, 1.5);
      radarCtx.lineTo(-5, 4);
      radarCtx.closePath();
      radarCtx.fill();
      radarCtx.restore();
    }

    // Player Vision Cone & Center Indicator
    radarCtx.fillStyle = 'rgba(255, 216, 133, 0.28)';
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.arc(cx, cy, 26, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
    radarCtx.closePath();
    radarCtx.fill();

    radarCtx.fillStyle = '#ffd885';
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    radarCtx.fill();

    // Player Direction Arrow (pointing forward/up)
    radarCtx.strokeStyle = '#ffd885';
    radarCtx.lineWidth = 2.0;
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy - 2);
    radarCtx.lineTo(cx, cy - 10);
    radarCtx.stroke();

    radarCtx.restore();

    // Outer Brass Rim
    radarCtx.strokeStyle = '#c59b4c';
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    radarCtx.stroke();
  }

  // DDA Raycasting Scene Renderer
  function renderScene(time) {
    const halfH = Math.floor(screenHeight / 2) + Math.round(player.currBobY);

    // 1. Draw Panoramic Parallax Celestial Skybox
    const playerAngle = Math.atan2(player.dirY, player.dirX);
    let normAngle = (playerAngle + Math.PI) / (2 * Math.PI);
    const skyOffset = Math.floor(normAngle * SKY_W);

    ctx.drawImage(skyCanvas, skyOffset, 0, screenWidth, SKY_H, 0, 0, screenWidth, halfH);
    if (skyOffset + screenWidth > SKY_W) {
      const rem = (skyOffset + screenWidth) - SKY_W;
      ctx.drawImage(skyCanvas, 0, 0, rem, SKY_H, screenWidth - rem, 0, rem, halfH);
    }

    // Grab frame buffer
    const frameImgData = ctx.getImageData(0, 0, screenWidth, screenHeight);
    const pixels = frameImgData.data;

    // Organic Torch / Explorer's Lantern Flame Flicker
    const torchFlicker = 0.95 + 0.07 * Math.sin(time * 6.5) + 0.03 * Math.cos(time * 16.3);

    // 2. High-Fidelity Textured Flagstone Floor with Mortar Joints & Radial Light
    const rayDirX0 = player.dirX - player.planeX;
    const rayDirY0 = player.dirY - player.planeY;
    const rayDirX1 = player.dirX + player.planeX;
    const rayDirY1 = player.dirY + player.planeY;

    for (let y = halfH; y < screenHeight; y++) {
      const p = y - halfH;
      if (p <= 0) continue;

      const posZ = 0.5 * screenHeight / p;
      const floorStepX = posZ * (rayDirX1 - rayDirX0) / screenWidth;
      const floorStepY = posZ * (rayDirY1 - rayDirY0) / screenWidth;

      let floorX = player.x + posZ * rayDirX0;
      let floorY = player.y + posZ * rayDirY0;

      // Inverse-square lantern light falloff
      const lanternLight = Math.min(1.2, (1.25 / (1.0 + posZ * 0.28 + posZ * posZ * 0.015)) * torchFlicker);
      const fogRatio = Math.min(1.0, posZ / 15.0);

      const baseR = 175 * lanternLight;
      const baseG = 125 * lanternLight;
      const baseB = 72 * lanternLight;

      let pixelIdx = (y * screenWidth) * 4;

      for (let x = 0; x < screenWidth; x++) {
        // Flagstone tile mortar joint check
        const cellX = floorX - Math.floor(floorX);
        const cellY = floorY - Math.floor(floorY);
        const isMortar = (cellX < 0.04 || cellX > 0.96 || cellY < 0.04 || cellY > 0.96);

        let r, g, b;
        if (isMortar) {
          r = Math.floor(baseR * 0.35);
          g = Math.floor(baseG * 0.35);
          b = Math.floor(baseB * 0.35);
        } else {
          const grain = ((Math.floor(floorX * 128) ^ Math.floor(floorY * 128)) % 13) * 2;
          r = Math.floor(baseR + grain);
          g = Math.floor(baseG + grain * 0.7);
          b = Math.floor(baseB + grain * 0.4);
        }

        // Blend with distance nocturnal fog
        r = Math.floor(r * (1 - fogRatio) + 7 * fogRatio);
        g = Math.floor(g * (1 - fogRatio) + 12 * fogRatio);
        b = Math.floor(b * (1 - fogRatio) + 24 * fogRatio);

        pixels[pixelIdx] = Math.min(255, Math.max(0, r));
        pixels[pixelIdx + 1] = Math.min(255, Math.max(0, g));
        pixels[pixelIdx + 2] = Math.min(255, Math.max(0, b));
        pixels[pixelIdx + 3] = 255;

        floorX += floorStepX;
        floorY += floorStepY;
        pixelIdx += 4;
      }
    }

    // 3. Cast DDA Rays for Each Screen Column (640 High Definition Rays)
    for (let x = 0; x < screenWidth; x++) {
      const cameraX = (2 * x) / screenWidth - 1;
      const rayDirX = player.dirX + player.planeX * cameraX;
      const rayDirY = player.dirY + player.planeY * cameraX;

      let mapX = Math.floor(player.x);
      let mapY = Math.floor(player.y);

      let sideDistX, sideDistY;
      const deltaDistX = Math.abs(rayDirX) < 1e-7 ? 1e30 : Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(rayDirY) < 1e-7 ? 1e30 : Math.abs(1 / rayDirY);
      let perpWallDist;

      let stepX, stepY;
      let hit = 0;
      let side = 0;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (player.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
      }

      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (player.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
      }

      // Step DDA through grid
      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }

        if (mapX >= 0 && mapX < MAP_W && mapY >= 0 && mapY < MAP_H) {
          const t = MAP[mapY][mapX];
          if (t === 6 && questState.gateOpen) continue; // Walk through unsealed gate
          if (t > 0) hit = t;
        } else {
          hit = 1;
        }
      }

      if (side === 0) {
        perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
      } else {
        perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
      }

      zBuffer[x] = perpWallDist;

      const lineHeight = Math.floor(screenHeight / Math.max(0.01, perpWallDist));
      let drawStart = Math.floor(-lineHeight / 2 + halfH);
      if (drawStart < 0) drawStart = 0;
      let drawEnd = Math.floor(lineHeight / 2 + halfH);
      if (drawEnd >= screenHeight) drawEnd = screenHeight - 1;

      let wallX;
      if (side === 0) wallX = player.y + perpWallDist * rayDirY;
      else wallX = player.x + perpWallDist * rayDirX;
      wallX -= Math.floor(wallX);

      let texX = Math.floor(wallX * TEX_SIZE);
      if (side === 0 && rayDirX > 0) texX = TEX_SIZE - texX - 1;
      if (side === 1 && rayDirY < 0) texX = TEX_SIZE - texX - 1;

      const texData = textures[hit] || textures[1];
      const step = TEX_SIZE / lineHeight;
      let texPos = (drawStart - halfH + lineHeight / 2) * step;

      // Dynamic Lantern Lighting & Directional Shading
      const lanternAtten = (1.0 / (1.0 + perpWallDist * 0.20 + perpWallDist * perpWallDist * 0.012)) * torchFlicker;
      const lightFactor = Math.min(1.3, Math.max(0.12, lanternAtten));
      const sideShade = side === 1 ? 0.76 : 1.0;
      const fogRatio = Math.min(1.0, perpWallDist / 15.0);

      for (let y = drawStart; y <= drawEnd; y++) {
        const texY = Math.floor(texPos) & (TEX_SIZE - 1);
        texPos += step;

        const texIdx = (texY * TEX_SIZE + texX) * 4;
        let r = texData[texIdx] * sideShade;
        let g = texData[texIdx + 1] * sideShade;
        let b = texData[texIdx + 2] * sideShade;

        // Vertical Ambient Occlusion (darkening ceiling and floor contact seams)
        const topDist = y - drawStart;
        const btmDist = drawEnd - y;
        const aoRange = lineHeight * 0.14;
        let vertAO = 1.0;
        if (topDist < aoRange) vertAO = Math.min(vertAO, 0.45 + (topDist / aoRange) * 0.55);
        if (btmDist < aoRange) vertAO = Math.min(vertAO, 0.50 + (btmDist / aoRange) * 0.50);

        r *= vertAO;
        g *= vertAO;
        b *= vertAO;

        // Warm Explorer's Lantern tint
        r = r * lightFactor + 32 * lightFactor;
        g = g * lightFactor + 18 * lightFactor;
        b = b * lightFactor + 8 * lightFactor;

        // Self-illuminated Emissive Runes (Immune to darkness)
        const isEmissive = (hit === 3 || hit === 4 || hit === 5 || hit === 7) &&
                           (texData[texIdx + 1] > 180 || texData[texIdx + 2] > 180);
        if (isEmissive) {
          const pulse = 1.0 + 0.28 * Math.sin(time * 4.5);
          r = Math.min(255, texData[texIdx] * pulse);
          g = Math.min(255, texData[texIdx + 1] * pulse);
          b = Math.min(255, texData[texIdx + 2] * pulse);
        } else {
          // Nocturnal Sand Fog Blend
          r = Math.floor(r * (1 - fogRatio) + 8 * fogRatio);
          g = Math.floor(g * (1 - fogRatio) + 14 * fogRatio);
          b = Math.floor(b * (1 - fogRatio) + 28 * fogRatio);
        }

        const pIdx = (y * screenWidth + x) * 4;
        pixels[pIdx] = Math.min(255, Math.max(0, r));
        pixels[pIdx + 1] = Math.min(255, Math.max(0, g));
        pixels[pIdx + 2] = Math.min(255, Math.max(0, b));
        pixels[pIdx + 3] = 255;
      }
    }

    ctx.putImageData(frameImgData, 0, 0);
  }

  // Main 60 FPS Game Loop
  function gameLoop(timestamp) {
    if (!isRunning) return;
    const now = timestamp || performance.now();
    const dt = Math.min(0.06, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    const dtFactor = dt * 60;

    updatePlayer(dtFactor);
    renderScene(now * 0.001);
    requestAnimationFrame(gameLoop);
  }

  // Handle Re-entering 3D Labyrinth from Victory Screen
  document.addEventListener('DOMContentLoaded', () => {
    const btnRevisit = document.getElementById('btn-revisit-maze');
    const victoryScreen = document.getElementById('victory-screen');
    const raycastSec = document.getElementById('raycast-section');

    if (btnRevisit && victoryScreen && raycastSec) {
      btnRevisit.addEventListener('click', () => {
        victoryScreen.style.display = 'none';
        raycastSec.style.display = 'block';
        raycastSec.classList.add('active');

        const frame = document.getElementById('raycast-viewport-frame');
        if (frame) {
          frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
          frame.focus();
        }

        if (typeof window.startRaycastEngine === 'function') {
          window.startRaycastEngine();
        }
      });
    }
  });

})();
