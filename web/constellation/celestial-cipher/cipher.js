/**
 * THE ECLIPSE ORDER · THE CELESTIAL CIPHER (STATION 09)
 * Production Logic: Concentric Dial, Sighting Log, Deduction Engine & Sanguine Sandstorm Climax
 */

(function () {
  'use strict';

  // Seeker access control: Station 09 remains veiled / locked for Silvia until release
  const currentSeeker = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
  if (currentSeeker !== 'carles') {
    alert("Station 09 remains veiled under the Order's nocturnal seal. The path will unlock when the next dispatch is broadcast.");
    window.location.replace('../../index.html#view-trail');
    return;
  }

  // ── 1. Astronomical Constants & Canonical Dial Data ──
  const ROMANS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const BANDS = ["+45°", "+15°", "-15°", "-45°"];
  const RADII = [255, 210, 165, 120, 75]; // Outer to Inner rings

  // Exact 48-Cell Dial Letter Mapping (Calculated from Sheet 07 / build_constellation_games.py)
  const DIAL_MAP = {
    "IV|+45°": "Y", "VII|-15°": "O", "II|+15°": "U",
    "IX|-15°": "W", "V|+15°": "E", "I|+45°": "R", "XI|-45°": "E",
    "III|+15°": "A", "VIII|+45°": "L", "X|-15°": "W", "VI|+45°": "A", "IV|-15°": "Y", "XII|-45°": "S",
    "I|-15°": "T", "VII|+45°": "H", "V|-45°": "E",
    "X|+15°": "T", "III|-45°": "R", "VIII|-15°": "E", "VI|-45°": "A", "IX|+45°": "S", "II|-45°": "U", "XI|+15°": "R", "XII|+15°": "E",
    "XII|+45°": "B", "XII|-15°": "D", "I|+15°": "H", "I|-45°": "K",
    "II|+45°": "L", "II|-15°": "N", "III|+45°": "Q", "III|-15°": "S",
    "IV|+15°": "W", "IV|-45°": "Z", "V|+45°": "B", "V|-15°": "D",
    "VI|+15°": "H", "VI|-15°": "J", "VII|+15°": "M", "VII|-45°": "P",
    "VIII|+15°": "R", "VIII|-45°": "T", "IX|+15°": "W", "IX|-45°": "Z",
    "X|+45°": "B", "X|-45°": "F", "XI|+45°": "G", "XI|-15°": "J"
  };

  // 5 Canonical Thematic Sighting Groups from the Cartographer
  const SIGHTING_GROUPS = [
    {
      title: "I. The Seeker's Identity",
      wordIdx: 0,
      coords: [
        { roman: "IV", band: "+45°" },
        { roman: "VII", band: "-15°" },
        { roman: "II", band: "+15°" }
      ]
    },
    {
      title: "II. The Past Meridian",
      wordIdx: 1,
      coords: [
        { roman: "IX", band: "-15°" },
        { roman: "V", band: "+15°" },
        { roman: "I", band: "+45°" },
        { roman: "XI", band: "-45°" }
      ]
    },
    {
      title: "III. The Timeless Stance",
      wordIdx: 2,
      coords: [
        { roman: "III", band: "+15°" },
        { roman: "VIII", band: "+45°" },
        { roman: "X", band: "-15°" },
        { roman: "VI", band: "+45°" },
        { roman: "IV", band: "-15°" },
        { roman: "XII", band: "-45°" }
      ]
    },
    {
      title: "IV. The Definite Sun",
      wordIdx: 3,
      coords: [
        { roman: "I", band: "-15°" },
        { roman: "VII", band: "+45°" },
        { roman: "V", band: "-45°" }
      ]
    },
    {
      title: "V. The Final Mystery",
      wordIdx: 4,
      coords: [
        { roman: "X", band: "+15°" },
        { roman: "III", band: "-45°" },
        { roman: "VIII", band: "-15°" },
        { roman: "VI", band: "-45°" },
        { roman: "IX", band: "+45°" },
        { roman: "II", band: "-45°" },
        { roman: "XI", band: "+15°" },
        { roman: "XII", band: "+15°" }
      ]
    }
  ];

  const TARGET_WORDS = ["YOU", "WERE", "ALWAYS", "THE", "TREASURE"];
  const TOTAL_LETTERS = 24;

  // ── 2. Tactile Audio Synthesis Engine ──
  class TacticalSFX {
    constructor() {
      this.ctx = null;
      this.windSource = null;
      this.windGain = null;
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

    playChime() {
      try {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
      } catch (e) {}
    }

    playWordUnlocked() {
      try {
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [329.63, 440.00, 554.37, 659.25];
        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + i * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 1.25);
        });
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
          const t = now + i * 0.1;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 3.1);
        });
      } catch (e) {}
    }

    startStormSound() {
      try {
        this.init();
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 380;
        filter.Q.value = 3.0;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3.0);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        whiteNoise.start();
        this.windSource = whiteNoise;
        this.windGain = gainNode;
      } catch (e) {}
    }
  }

  const sfx = new TacticalSFX();

  // ── 3. State Management ──
  const state = {
    selectedRoman: "IV",
    selectedBand: "+45°",
    activeSightingIndex: 0,
    userLetters: ["", "", "", "", ""].map((_, i) => new Array(TARGET_WORDS[i].length).fill("")),
    isCompleted: false
  };

  // Flattened mapping of all 24 coordinates
  const flatSightings = [];
  SIGHTING_GROUPS.forEach((grp, gIdx) => {
    grp.coords.forEach((c, lIdx) => {
      flatSightings.push({
        groupIndex: gIdx,
        letterIndex: lIdx,
        roman: c.roman,
        band: c.band,
        expectedLetter: DIAL_MAP[`${c.roman}|${c.band}`]
      });
    });
  });

  // ── 4. Dial Rendering & SVG Geometry ──
  const cellsGroup = document.getElementById('dial-cells-group');
  const hourLinesGroup = document.getElementById('dial-hour-lines-group');
  const romansGroup = document.getElementById('dial-romans-group');
  const opticalNeedle = document.getElementById('optical-needle');
  const targetBead = document.getElementById('target-bead');
  const targetBeadInner = document.getElementById('target-bead-inner');
  const targetCoordReadout = document.getElementById('target-coord-readout');
  const targetLetterReadout = document.getElementById('target-letter-readout');
  const declTabs = document.querySelectorAll('.decl-tab');

  function renderDial() {
    if (!cellsGroup) return;
    cellsGroup.innerHTML = '';
    hourLinesGroup.innerHTML = '';
    romansGroup.innerHTML = '';

    // Draw 12 Sector Dividers & Roman Numeral Labels
    for (let i = 0; i < 12; i++) {
      const deg = i * 30 - 90;
      const rad = deg * (Math.PI / 180);
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      // Line from Pole to Outer Rim
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (RADII[4] * cosA).toFixed(1));
      line.setAttribute('y1', (RADII[4] * sinA).toFixed(1));
      line.setAttribute('x2', (RADII[0] * cosA).toFixed(1));
      line.setAttribute('y2', (RADII[0] * sinA).toFixed(1));
      line.setAttribute('stroke', 'rgba(212, 168, 83, 0.28)');
      line.setAttribute('stroke-width', '1');
      hourLinesGroup.appendChild(line);

      // Roman Numeral text label just outside the rim
      const romanText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const rLabel = RADII[0] + 18;
      romanText.setAttribute('x', (rLabel * cosA).toFixed(1));
      romanText.setAttribute('y', (rLabel * sinA + 4).toFixed(1));
      romanText.setAttribute('class', 'dial-roman-label');
      romanText.setAttribute('data-roman', ROMANS[i]);
      romanText.textContent = ROMANS[i];
      romanText.addEventListener('click', () => {
        setDialPosition(ROMANS[i], state.selectedBand);
      });
      romansGroup.appendChild(romanText);
    }

    // Draw 48 Annular Sector Cells
    for (let sIdx = 0; sIdx < 12; sIdx++) {
      const roman = ROMANS[sIdx];
      const startDeg = sIdx * 30 - 90;
      const endDeg = (sIdx + 1) * 30 - 90;
      const midDeg = sIdx * 30 - 75;

      for (let bIdx = 0; bIdx < 4; bIdx++) {
        const band = BANDS[bIdx];
        const rOuter = RADII[bIdx];
        const rInner = RADII[bIdx + 1];
        const rMid = (rOuter + rInner) / 2;

        const pathD = describeAnnularSector(0, 0, rInner, rOuter, startDeg, endDeg);
        const letter = DIAL_MAP[`${roman}|${band}`] || '?';

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'dial-cell');
        g.setAttribute('data-roman', roman);
        g.setAttribute('data-band', band);
        g.setAttribute('data-letter', letter);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const radMid = midDeg * (Math.PI / 180);
        text.setAttribute('x', (rMid * Math.cos(radMid)).toFixed(1));
        text.setAttribute('y', (rMid * Math.sin(radMid)).toFixed(1));
        text.textContent = letter;

        g.appendChild(path);
        g.appendChild(text);

        g.addEventListener('click', () => {
          setDialPosition(roman, band);
          handleCellClick(letter);
        });

        cellsGroup.appendChild(g);
      }
    }
  }

  function describeAnnularSector(cx, cy, rInner, rOuter, startAngle, endAngle) {
    const toRad = Math.PI / 180;
    const sRad = startAngle * toRad;
    const eRad = endAngle * toRad;

    const x1 = cx + rOuter * Math.cos(sRad);
    const y1 = cy + rOuter * Math.sin(sRad);
    const x2 = cx + rOuter * Math.cos(eRad);
    const y2 = cy + rOuter * Math.sin(eRad);

    const x3 = cx + rInner * Math.cos(eRad);
    const y3 = cy + rInner * Math.sin(eRad);
    const x4 = cx + rInner * Math.cos(sRad);
    const y4 = cy + rInner * Math.sin(sRad);

    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} ` +
           `A ${rOuter} ${rOuter} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} ` +
           `L ${x3.toFixed(1)} ${y3.toFixed(1)} ` +
           `A ${rInner} ${rInner} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
  }

  function setDialPosition(roman, band, shouldPlaySound = true) {
    state.selectedRoman = roman;
    state.selectedBand = band;

    if (shouldPlaySound) sfx.playClick();

    const sIdx = ROMANS.indexOf(roman);
    const bIdx = BANDS.indexOf(band);
    if (sIdx === -1 || bIdx === -1) return;

    // Center angle of this hour sector
    const midDeg = sIdx * 30 - 75;
    const radMid = midDeg * (Math.PI / 180);
    const rMid = (RADII[bIdx] + RADII[bIdx + 1]) / 2;

    // Aim Optical Reticle Needle & Bead
    const needleTipX = (RADII[0] * Math.cos(radMid)).toFixed(1);
    const needleTipY = (RADII[0] * Math.sin(radMid)).toFixed(1);
    const beadX = (rMid * Math.cos(radMid)).toFixed(1);
    const beadY = (rMid * Math.sin(radMid)).toFixed(1);

    if (opticalNeedle) {
      opticalNeedle.setAttribute('x2', needleTipX);
      opticalNeedle.setAttribute('y2', needleTipY);
    }
    if (targetBead) {
      targetBead.setAttribute('cx', beadX);
      targetBead.setAttribute('cy', beadY);
    }
    if (targetBeadInner) {
      targetBeadInner.setAttribute('cx', beadX);
      targetBeadInner.setAttribute('cy', beadY);
    }

    // Highlight Cell
    document.querySelectorAll('.dial-cell').forEach(c => {
      const match = c.getAttribute('data-roman') === roman && c.getAttribute('data-band') === band;
      c.classList.toggle('cell-active', match);
    });

    // Highlight Roman
    document.querySelectorAll('.dial-roman-label').forEach(r => {
      r.classList.toggle('active', r.getAttribute('data-roman') === roman);
    });

    // Highlight Declination Tab
    declTabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-band') === band);
    });

    // Update Readouts
    const letter = DIAL_MAP[`${roman}|${band}`] || '?';
    if (targetCoordReadout) targetCoordReadout.textContent = `HOUR ${roman} · DECL ${band}`;
    if (targetLetterReadout) targetLetterReadout.textContent = letter;
  }

  // ── 5. Sighting Log & Deduction Logic ──
  const sightingContainer = document.getElementById('sighting-groups-container');
  const sightingBadge = document.getElementById('sighting-progress-badge');
  const prophecyStatusBar = document.getElementById('prophecy-status-bar');

  function renderSightingLog() {
    if (!sightingContainer) return;
    sightingContainer.innerHTML = '';

    SIGHTING_GROUPS.forEach((grp, gIdx) => {
      const grpRow = document.createElement('div');
      grpRow.className = 'sighting-group-row';
      grpRow.setAttribute('data-group-idx', gIdx);

      const titleRow = document.createElement('div');
      titleRow.className = 'group-title-row';
      titleRow.innerHTML = `
        <span class="group-name">${grp.title}</span>
        <span class="group-status" id="group-${gIdx}-status">0 / ${grp.coords.length} RESOLVED</span>
      `;
      grpRow.appendChild(titleRow);

      const chipsRow = document.createElement('div');
      chipsRow.className = 'chips-row';

      grp.coords.forEach((c, lIdx) => {
        const flatIdx = flatSightings.findIndex(f => f.groupIndex === gIdx && f.letterIndex === lIdx);
        const resolvedLetter = state.userLetters[gIdx][lIdx];
        const isResolved = resolvedLetter === DIAL_MAP[`${c.roman}|${c.band}`];

        const chip = document.createElement('div');
        chip.className = 'coord-chip' + (flatIdx === state.activeSightingIndex ? ' chip-active' : '') + (isResolved ? ' chip-resolved' : '');
        chip.setAttribute('data-flat-idx', flatIdx);
        chip.innerHTML = `
          <span>${c.roman} · ${c.band}</span>
          ${isResolved ? `<span class="chip-arrow">➔</span><span class="chip-resolved-letter">${resolvedLetter}</span>` : ''}
        `;

        chip.addEventListener('click', () => {
          setActiveSighting(flatIdx);
        });

        chipsRow.appendChild(chip);
      });

      grpRow.appendChild(chipsRow);
      sightingContainer.appendChild(grpRow);
    });
  }

  function renderProphecyBoxes() {
    TARGET_WORDS.forEach((word, wIdx) => {
      const container = document.getElementById(`word-${wIdx}-boxes`);
      if (!container) return;
      container.innerHTML = '';

      for (let lIdx = 0; lIdx < word.length; lIdx++) {
        const flatIdx = flatSightings.findIndex(f => f.groupIndex === wIdx && f.letterIndex === lIdx);
        const box = document.createElement('input');
        box.type = 'text';
        box.maxLength = 1;
        box.className = 'letter-box';
        box.setAttribute('data-word-idx', wIdx);
        box.setAttribute('data-letter-idx', lIdx);
        box.setAttribute('data-flat-idx', flatIdx);
        box.value = state.userLetters[wIdx][lIdx] || '';

        box.addEventListener('focus', () => {
          setActiveSighting(flatIdx);
        });

        box.addEventListener('keydown', (e) => {
          handleBoxKeydown(e, wIdx, lIdx, flatIdx);
        });

        box.addEventListener('input', (e) => {
          handleBoxInput(e, wIdx, lIdx, flatIdx);
        });

        container.appendChild(box);
      }
    });

    updateValidation();
  }

  function setActiveSighting(flatIdx) {
    if (flatIdx < 0 || flatIdx >= flatSightings.length) return;
    state.activeSightingIndex = flatIdx;
    const item = flatSightings[flatIdx];

    setDialPosition(item.roman, item.band);

    // Update Chips
    document.querySelectorAll('.coord-chip').forEach(c => {
      c.classList.toggle('chip-active', parseInt(c.getAttribute('data-flat-idx'), 10) === flatIdx);
    });

    // Focus input box
    const targetBox = document.querySelector(`.letter-box[data-flat-idx="${flatIdx}"]`);
    if (targetBox && document.activeElement !== targetBox) {
      targetBox.focus();
    }
  }

  function handleBoxInput(e, wIdx, lIdx, flatIdx) {
    const val = (e.target.value || '').toUpperCase().trim();
    e.target.value = val;
    state.userLetters[wIdx][lIdx] = val;

    sfx.playClick();
    updateValidation();

    if (val && flatIdx < flatSightings.length - 1) {
      setActiveSighting(flatIdx + 1);
    }
  }

  function handleBoxKeydown(e, wIdx, lIdx, flatIdx) {
    if (e.key === 'Backspace' && !e.target.value && flatIdx > 0) {
      setActiveSighting(flatIdx - 1);
    } else if (e.key === 'ArrowRight' && flatIdx < flatSightings.length - 1) {
      setActiveSighting(flatIdx + 1);
    } else if (e.key === 'ArrowLeft' && flatIdx > 0) {
      setActiveSighting(flatIdx - 1);
    }
  }

  function handleCellClick(letter) {
    const item = flatSightings[state.activeSightingIndex];
    if (!item) return;

    state.userLetters[item.groupIndex][item.letterIndex] = letter;
    const box = document.querySelector(`.letter-box[data-flat-idx="${state.activeSightingIndex}"]`);
    if (box) box.value = letter;

    updateValidation();

    if (state.activeSightingIndex < flatSightings.length - 1) {
      setActiveSighting(state.activeSightingIndex + 1);
    }
  }

  function updateValidation() {
    let correctCount = 0;

    TARGET_WORDS.forEach((word, wIdx) => {
      let wordDone = true;
      for (let lIdx = 0; lIdx < word.length; lIdx++) {
        const inputLetter = state.userLetters[wIdx][lIdx];
        const expectedLetter = word[lIdx];
        const flatIdx = flatSightings.findIndex(f => f.groupIndex === wIdx && f.letterIndex === lIdx);
        const box = document.querySelector(`.letter-box[data-flat-idx="${flatIdx}"]`);

        if (inputLetter === expectedLetter) {
          correctCount++;
          if (box) box.classList.add('box-correct');
        } else {
          wordDone = false;
          if (box) box.classList.remove('box-correct');
        }
      }

      const wordBlock = document.querySelector(`.word-block[data-word-idx="${wIdx}"]`);
      if (wordBlock) {
        const wasDone = wordBlock.classList.contains('word-completed');
        wordBlock.classList.toggle('word-completed', wordDone);
        if (wordDone && !wasDone && correctCount < TOTAL_LETTERS) {
          sfx.playWordUnlocked();
        }
      }

      // Update group status
      const grpResolved = state.userLetters[wIdx].filter((l, i) => l === word[i]).length;
      const statusEl = document.getElementById(`group-${wIdx}-status`);
      if (statusEl) {
        statusEl.textContent = `${grpResolved} / ${word.length} RESOLVED`;
        statusEl.style.color = (grpResolved === word.length) ? 'var(--brass-bright)' : '';
      }
    });

    // Update Chips status
    renderSightingLog();

    if (sightingBadge) {
      sightingBadge.textContent = `${correctCount} / ${TOTAL_LETTERS} LOCKED`;
      if (correctCount === TOTAL_LETTERS) {
        sightingBadge.style.color = '#86efac';
        sightingBadge.style.borderColor = 'rgba(34, 197, 94, 0.5)';
      }
    }

    if (prophecyStatusBar) {
      if (correctCount === TOTAL_LETTERS) {
        prophecyStatusBar.innerHTML = `<span class="status-icon" style="color:var(--brass-bright);">★</span> <strong style="color:var(--brass-bright); letter-spacing:0.1em;">"YOU WERE ALWAYS THE TREASURE" — PROPHECY SEALED!</strong>`;
      } else {
        prophecyStatusBar.innerHTML = `<span class="status-icon">⏳</span> <span>${correctCount} of 24 coordinates aligned... continue crossing the dial.</span>`;
      }
    }

    // Check Victory / Climax Trigger
    if (correctCount === TOTAL_LETTERS && !state.isCompleted) {
      triggerClimaxSequence();
    }
  }

  // ── 6. Climax Sequence: La Gran Tormenta de Arena del Sur ──
  const climaxModal = document.getElementById('climax-modal');
  const typewriterTextEl = document.getElementById('dispatch-typewriter-text');
  const radioPill = document.getElementById('radio-pill');
  const radioOverloadState = document.getElementById('radio-overload-state');

  const DISPATCH_TRANSCRIPT = 
    "«Silvia! The storm has broken without warning! The sky has turned pitch crimson and the shifting sands are scouring everything... we have lost the raiders' trail! All previous maps are dead paper now... the crescent dunes have slid miles south and ancient ravines are buried! Listen closely: you must open the next sheet of my journal... find the Desert Oracle. In the deep desert, beyond the moved dunes, only the Oracle can read what the wind has buried...!»";

  function triggerClimaxSequence() {
    state.isCompleted = true;
    sfx.playProphecyResolved();

    // Mark completion in storage for Hub navigation and route map
    try {
      localStorage.setItem('order_cipher_completed', 'true');
      localStorage.setItem('order_sandstorm_triggered', 'true');
      const activeSeeker = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
      localStorage.setItem(`seeker_${activeSeeker}_cipher_completed`, 'true');
    } catch (e) {}

    // 1. Atmosphere Shift to Red & Storm Howl
    setTimeout(() => {
      document.body.classList.add('sandstorm-active');
      sfx.startStormSound();
      if (radioPill) {
        radioPill.style.borderColor = '#ef4444';
        radioPill.style.background = 'rgba(185, 28, 28, 0.4)';
        radioPill.querySelector('.radio-state').textContent = '⚡ CARRIER OVERLOAD';
        radioPill.querySelector('.radio-state').style.color = '#fca5a5';
      }
    }, 900);

    // 2. Open Climax Modal
    setTimeout(() => {
      if (climaxModal) climaxModal.classList.add('modal-open');
      typewriteDispatch(DISPATCH_TRANSCRIPT, 0);
    }, 1800);
  }

  function typewriteDispatch(text, charIndex) {
    if (!typewriterTextEl) return;
    if (charIndex <= text.length) {
      typewriterTextEl.textContent = text.slice(0, charIndex);
      setTimeout(() => {
        typewriteDispatch(text, charIndex + 1);
      }, 22);
    } else {
      // Finished typing: Carrier Drops
      setTimeout(() => {
        if (radioOverloadState) {
          radioOverloadState.textContent = 'CARRIER LOST // SIGNAL DROPPED';
          radioOverloadState.style.color = '#9ca3af';
        }
      }, 1200);
    }
  }

  // ── 7. Atmospheric Sandstorm Canvas Engine ──
  const sandCanvas = document.getElementById('sandstorm-canvas');
  if (sandCanvas) {
    const ctx = sandCanvas.getContext('2d');
    let width = sandCanvas.width = window.innerWidth;
    let height = sandCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = sandCanvas.width = window.innerWidth;
      height = sandCanvas.height = window.innerHeight;
    });

    const GRAIN_COUNT = 240;
    const grains = [];
    for (let i = 0; i < GRAIN_COUNT; i++) {
      grains.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -(Math.random() * 5.0 + 3.0),
        vy: (Math.random() - 0.25) * 1.5,
        size: Math.random() * 2.0 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.4 ? '#f59e0b' : '#fbbf24'
      });
    }

    function renderSand() {
      ctx.clearRect(0, 0, width, height);

      const isStorm = document.body.classList.contains('sandstorm-active');
      const speedMult = isStorm ? 2.4 : 1.0;

      for (let g of grains) {
        g.x += g.vx * speedMult;
        g.y += g.vy * speedMult;

        if (g.x < -10) {
          g.x = width + Math.random() * 20;
          g.y = Math.random() * height;
        }
        if (g.y > height + 10) g.y = -5;
        if (g.y < -10) g.y = height + 5;

        ctx.fillStyle = isStorm ? '#ef4444' : g.color;
        ctx.globalAlpha = isStorm ? Math.min(1, g.alpha * 1.6) : g.alpha;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.size * (isStorm ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      requestAnimationFrame(renderSand);
    }

    requestAnimationFrame(renderSand);
  }

  // ── 8. Controls & Initialization ──
  const btnPrev = document.getElementById('btn-dial-prev');
  const btnNext = document.getElementById('btn-dial-next');
  const btnAutoSolve = document.getElementById('btn-quick-solve');
  const btnReplay = document.getElementById('btn-replay-cipher');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      const curIdx = ROMANS.indexOf(state.selectedRoman);
      const prevIdx = (curIdx - 1 + 12) % 12;
      setDialPosition(ROMANS[prevIdx], state.selectedBand);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const curIdx = ROMANS.indexOf(state.selectedRoman);
      const nextIdx = (curIdx + 1) % 12;
      setDialPosition(ROMANS[nextIdx], state.selectedBand);
    });
  }

  declTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const band = tab.getAttribute('data-band');
      setDialPosition(state.selectedRoman, band);
    });
  });

  if (btnAutoSolve) {
    btnAutoSolve.addEventListener('click', () => {
      TARGET_WORDS.forEach((word, wIdx) => {
        for (let lIdx = 0; lIdx < word.length; lIdx++) {
          state.userLetters[wIdx][lIdx] = word[lIdx];
          const flatIdx = flatSightings.findIndex(f => f.groupIndex === wIdx && f.letterIndex === lIdx);
          const box = document.querySelector(`.letter-box[data-flat-idx="${flatIdx}"]`);
          if (box) box.value = word[lIdx];
        }
      });
      sfx.playClick();
      updateValidation();
    });
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      if (climaxModal) climaxModal.classList.remove('modal-open');
      document.body.classList.remove('sandstorm-active');
      state.isCompleted = false;
      state.userLetters = ["", "", "", "", ""].map((_, i) => new Array(TARGET_WORDS[i].length).fill(""));
      renderProphecyBoxes();
      setActiveSighting(0);
    });
  }

  // Initial Assembly
  renderDial();
  renderSightingLog();
  renderProphecyBoxes();
  setDialPosition("IV", "+45°", false);
  setActiveSighting(0);

})();
