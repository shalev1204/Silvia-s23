/**
 * THE ECLIPSE ORDER · 142.85 MHz EMERGENCY RADIO TRANSCEIVER
 * High-Fidelity Audio Demodulator, CRT Phosphor Oscilloscope & Real-time Synchronized Teletype
 */

(function (window) {
  'use strict';

  let audioElem = null;
  let oscCanvas = null;
  let oscCtx = null;
  let animFrameId = null;
  let currentTransmissionKey = 'alert';
  let isSeeking = false;
  let hasUserTuned = false;

  const TRANSMISSION_DATA = {
    alert: {
      title: "DISPATCH 08-A // PRIORITY DISTRESS: THE SHIFTING TEMPEST",
      totalDur: 71.8,
      lines: [
        { t: 1.0, dur: 4.29, text: "Silvia! Silvia, do you copy me? It is the Cartographer." },
        { t: 6.14, dur: 6.69, text: "Your ninety-seven degree Vega calibration was absolute perfection—the vault aperture sparked into life!" },
        { t: 13.68, dur: 4.65, text: "But the southern mountain pass has just erupted! Look to the horizon!" },
        { t: 19.18, dur: 4.69, text: "The barometers plummeted in seconds. It is the Shifting Tempest." },
        { t: 24.72, dur: 7.45, text: "A colossal wall of copper sand and violet lightning is tearing across the foothills at terrifying speed!" },
        { t: 33.02, dur: 10.41, text: "We have completely lost the raiders' trail! The swirling sands have erased their wagon tracks, their campfires, and every trace into the deep dunes." },
        { t: 44.29, dur: 5.73, text: "I am forced into a narrow sandstone crevice to keep from being thrown from the crags!" },
        { t: 50.87, dur: 12.53, text: "The electrostatic storm will collapse our radio carrier in fifteen minutes! Before the signal dies, we must transmit the nocturnal star transit vectors from Sheet Six, Side B." },
        { t: 64.25, dur: 4.89, text: "Solve the six chords in your journal before darkness takes the wire! Stay safe! Out!" }
      ],
      peaks: [1.2, 14.5, 27.8, 38.4, 55.5, 62.0] // seconds of lightning/thunder/dropouts
    },
    victory: {
      title: "DISPATCH 08-B // TRANSIT LOCKED: THE DESERT ORACLE",
      totalDur: 82.3,
      lines: [
        { t: 1.2, dur: 6.33, text: "Silvia...! Silvia, do you copy me? The signal... it punched through the electrostatic gale!" },
        { t: 8.68, dur: 11.37, text: "Two thousand and ninety light-years... the celestial hexagon... anchored between Achernar and Polaris! By the stars, you have done it!" },
        { t: 21.2, dur: 7.57, text: "The storm is tearing the world apart out here! The winds are shifting entire mountains of stone and sand!" },
        { t: 29.92, dur: 13.13, text: "All previous maps of the desert are dead paper now. The crescent dunes have slid miles south, ancient ravines are buried, and the raiders are as lost and stranded as we are in this shifting sea." },
        { t: 44.2, dur: 16.61, text: "We lost their trail, but we hold the three stellar constants! In the deep desert, beyond the moved dunes, dwells the only ancient soul who can read the shifted sands: The Desert Oracle." },
        { t: 61.96, dur: 7.45, text: "When this tempest subsides, we will navigate by your three chords directly to the Oracle's sanctuary!" },
        { t: 70.57, dur: 8.37, text: "Record every number in your Ledger, Silvia. Rest now while the winds blow. The Desert Path awaits us. Stay safe. Out." }
      ],
      peaks: [1.2, 21.2, 29.9, 44.2, 62.0]
    }
  };

  function initRadioPlayer() {
    audioElem = document.getElementById('radio-audio-element');
    oscCanvas = document.getElementById('radio-oscilloscope-canvas');
    if (oscCanvas) oscCtx = oscCanvas.getContext('2d');

    const btnTune = document.getElementById('btn-tune-broadcast');
    const btnPlay = document.getElementById('btn-radio-play');
    const btnPause = document.getElementById('btn-radio-pause');
    const btnReplay = document.getElementById('btn-radio-replay');
    const btnMute = document.getElementById('btn-radio-mute');
    const volSlider = document.getElementById('radio-vol-slider');
    const seekSlider = document.getElementById('radio-seek-slider');

    if (btnTune) btnTune.addEventListener('click', onUserTuneClick);
    if (btnPlay) btnPlay.addEventListener('click', playTransmission);
    if (btnPause) btnPause.addEventListener('click', pauseTransmission);
    if (btnReplay) btnReplay.addEventListener('click', replayTransmission);

    if (btnMute) btnMute.addEventListener('click', toggleMute);
    if (volSlider) volSlider.addEventListener('input', onVolumeChange);

    if (seekSlider) {
      seekSlider.addEventListener('input', onSeekInput);
      seekSlider.addEventListener('change', onSeekChange);
    }

    if (audioElem) {
      audioElem.addEventListener('timeupdate', onTimeUpdate);
      audioElem.addEventListener('ended', onTransmissionEnded);
      audioElem.addEventListener('loadedmetadata', onMetadataLoaded);
    }

    // Set initial audio source
    loadTransmission('alert', false);
    startOscilloscopeLoop();
  }

  function loadTransmission(key, autoPlay = false) {
    currentTransmissionKey = key || 'alert';
    const data = TRANSMISSION_DATA[currentTransmissionKey];
    if (!data) return;

    if (audioElem) {
      audioElem.src = `audio/cartographer_tempest_${currentTransmissionKey}.mp3`;
      audioElem.load();
    }

    const titleEl = document.getElementById('radio-current-title');
    if (titleEl) titleEl.textContent = data.title;

    const totalEl = document.getElementById('radio-time-total');
    if (totalEl) totalEl.textContent = formatTime(data.totalDur);

    const seekSlider = document.getElementById('radio-seek-slider');
    if (seekSlider) seekSlider.max = data.totalDur.toString();

    // Reset teletype standby message
    resetTeletypeStandby();

    if (autoPlay) {
      playTransmission();
    }
  }

  function resetTeletypeStandby() {
    const teletypeBox = document.getElementById('radio-teletype-content');
    if (!teletypeBox) return;

    const isAlert = currentTransmissionKey === 'alert';
    teletypeBox.innerHTML = `
      <div class="teletype-standby">
        <span class="teletype-cursor">█</span> SQUELCH OPEN // 142.85 MHz CARRIER LOCKED.<br>
        <span style="color:#ffd54f; font-size:12px; margin-top:4px; display:inline-block;">
          ✦ PRESS <strong>[ TUNE 142.85 MHz ]</strong> OR <strong>[ ▶ PLAY ]</strong> TO HEAR THE CARTOGRAPHER ✦
        </span>
      </div>
    `;
  }

  function onUserTuneClick() {
    hasUserTuned = true;
    const banner = document.getElementById('radio-tune-banner');
    if (banner) {
      banner.style.opacity = '0.7';
      const btn = banner.querySelector('.btn-tune-broadcast');
      if (btn) {
        btn.innerHTML = `
          <span class="tune-pulse-dot active"></span>
          <span class="tune-icon">📻</span>
          <span class="tune-label">142.85 MHz CARRIER ACTIVE · TRANSMITTING</span>
          <span class="tune-icon">⚡</span>
        `;
      }
    }
    playTransmission();
  }

  function playTransmission() {
    if (!audioElem) return;

    audioElem.play().then(() => {
      updateLEDs(true);
      updatePlayPauseButtons(true);
    }).catch(err => {
      console.warn("Audio play prevented by browser policy:", err);
      updateLEDs(false);
      updatePlayPauseButtons(false);

      // Highlight the prominent tune button
      const btnTune = document.getElementById('btn-tune-broadcast');
      if (btnTune) {
        btnTune.style.boxShadow = '0 0 25px rgba(74, 222, 128, 0.9)';
      }
    });
  }

  function pauseTransmission() {
    if (!audioElem) return;
    audioElem.pause();
    updateLEDs(false);
    updatePlayPauseButtons(false);
  }

  function replayTransmission() {
    if (!audioElem) return;
    audioElem.currentTime = 0;
    playTransmission();
  }

  function toggleMute() {
    if (!audioElem) return;
    audioElem.muted = !audioElem.muted;
    const icon = document.getElementById('radio-mute-icon');
    if (icon) {
      icon.textContent = audioElem.muted ? '🔇' : (audioElem.volume < 0.5 ? '🔉' : '🔊');
    }
  }

  function onVolumeChange(e) {
    if (!audioElem) return;
    const val = parseFloat(e.target.value);
    audioElem.volume = val;
    audioElem.muted = (val === 0);
    const icon = document.getElementById('radio-mute-icon');
    if (icon) {
      icon.textContent = audioElem.muted ? '🔇' : (val < 0.5 ? '🔉' : '🔊');
    }
  }

  function onSeekInput(e) {
    isSeeking = true;
    const target = parseFloat(e.target.value);
    updateTimeDisplay(target);
  }

  function onSeekChange(e) {
    if (!audioElem) return;
    const target = parseFloat(e.target.value);
    audioElem.currentTime = target;
    isSeeking = false;
    updateTeletype(target);
  }

  function onMetadataLoaded() {
    if (!audioElem) return;
    const total = audioElem.duration || TRANSMISSION_DATA[currentTransmissionKey].totalDur;
    const totalEl = document.getElementById('radio-time-total');
    if (totalEl) totalEl.textContent = formatTime(total);
    const seekSlider = document.getElementById('radio-seek-slider');
    if (seekSlider) seekSlider.max = total.toString();
  }

  function onTimeUpdate() {
    if (!audioElem || isSeeking) return;
    const cur = audioElem.currentTime;
    updateTimeDisplay(cur);
    updateTeletype(cur);
  }

  function updateTimeDisplay(cur) {
    const curEl = document.getElementById('radio-time-current');
    if (curEl) curEl.textContent = formatTime(cur);

    const data = TRANSMISSION_DATA[currentTransmissionKey];
    const total = (audioElem && audioElem.duration) ? audioElem.duration : (data ? data.totalDur : 72);

    const fill = document.getElementById('radio-scrubber-fill');
    if (fill && total > 0) {
      fill.style.width = `${Math.min(100, (cur / total) * 100)}%`;
    }

    const seekSlider = document.getElementById('radio-seek-slider');
    if (seekSlider && !isSeeking) {
      seekSlider.value = cur.toString();
    }
  }

  function updateTeletype(cur) {
    const data = TRANSMISSION_DATA[currentTransmissionKey];
    if (!data) return;
    const teletypeBox = document.getElementById('radio-teletype-content');
    if (!teletypeBox) return;

    const lines = data.lines;
    let html = '';
    let hasAnyLine = false;

    lines.forEach((item, idx) => {
      if (cur >= item.t) {
        hasAnyLine = true;
        const isCurrent = cur >= item.t && cur < (item.t + item.dur + 0.5);
        const cls = isCurrent ? 'teletype-line active-speaking' : 'teletype-line read-past';
        html += `<p class="${cls}">${item.text}</p>`;
      }
    });

    if (!hasAnyLine) {
      html = `
        <div class="teletype-standby">
          <span class="teletype-cursor">█</span> SQUELCH OPEN // CARRIER STREAM ACQUIRED...
        </div>
      `;
    } else {
      html += `<span class="teletype-cursor">█</span>`;
    }

    teletypeBox.innerHTML = html;
    teletypeBox.scrollTop = teletypeBox.scrollHeight;
  }

  function onTransmissionEnded() {
    updateLEDs(false);
    updatePlayPauseButtons(false);
    const teletypeBox = document.getElementById('radio-teletype-content');
    if (teletypeBox) {
      const p = document.createElement('p');
      p.className = 'teletype-line teletype-carrier-end';
      p.textContent = "[ CARRIER SILENCE · 142.85 MHz TRANSMISSION CLOSED ]";
      teletypeBox.appendChild(p);
      teletypeBox.scrollTop = teletypeBox.scrollHeight;
    }
  }

  function updateLEDs(isPlaying) {
    const rx = document.getElementById('led-radio-rx');
    const tx = document.getElementById('led-radio-tx');
    if (rx) rx.classList.toggle('active', isPlaying);
    if (tx) tx.classList.toggle('active', isPlaying);
  }

  function updatePlayPauseButtons(isPlaying) {
    const btnPlay = document.getElementById('btn-radio-play');
    const btnPause = document.getElementById('btn-radio-pause');
    if (btnPlay) btnPlay.classList.toggle('active-state', isPlaying);
    if (btnPause) btnPause.classList.toggle('active-state', !isPlaying);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Real-time CRT Phosphor Oscilloscope Visualizer ---
  function startOscilloscopeLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    function render() {
      renderOscilloscopeFrame();
      animFrameId = requestAnimationFrame(render);
    }
    animFrameId = requestAnimationFrame(render);
  }

  function getSpeechEnergy(cur) {
    if (!audioElem || audioElem.paused) return 0;
    const data = TRANSMISSION_DATA[currentTransmissionKey];
    if (!data) return 0;

    let energy = 0;
    for (let item of data.lines) {
      if (cur >= item.t && cur <= (item.t + item.dur)) {
        // Active speaking: base energy + vocal syllable modulation
        const phrasePos = cur - item.t;
        const syllMod = (Math.sin(phrasePos * 14.0) * 0.35 +
                         Math.sin(phrasePos * 29.0) * 0.25 + 0.6);
        energy = Math.max(energy, syllMod * 0.85);
        break;
      }
    }

    // Check storm peaks (thunderclaps / lightning / dropouts)
    for (let peakT of data.peaks) {
      const dist = Math.abs(cur - peakT);
      if (dist < 1.2) {
        const peakAmp = Math.max(0, 1.0 - (dist / 1.2));
        energy = Math.max(energy, peakAmp * 1.3);

        // Shake the radio chassis during violent peak
        const chassis = document.getElementById('emergency-radio-chassis');
        if (chassis && peakAmp > 0.8 && Math.random() < 0.2) {
          chassis.classList.add('tremor-strike');
          setTimeout(() => chassis.classList.remove('tremor-strike'), 250);
        }
      }
    }

    return energy * (audioElem.muted ? 0 : audioElem.volume);
  }

  function renderOscilloscopeFrame() {
    if (!oscCanvas || !oscCtx) return;
    const w = oscCanvas.width;
    const h = oscCanvas.height;
    const curTime = audioElem ? (audioElem.currentTime || 0) : 0;
    const energy = getSpeechEnergy(curTime);
    const now = performance.now() * 0.005;

    // Dark phosphorescent screen decay trail
    oscCtx.fillStyle = 'rgba(3, 10, 8, 0.28)';
    oscCtx.fillRect(0, 0, w, h);

    if (energy > 0.08) {
      // Dynamic Vocal Wave
      const isPeak = energy > 0.85;
      oscCtx.lineWidth = isPeak ? 2.6 : 1.8;
      oscCtx.strokeStyle = isPeak ? '#ffd54f' : '#4ade80';
      oscCtx.shadowColor = isPeak ? '#ffd54f' : '#4ade80';
      oscCtx.shadowBlur = isPeak ? 14 : 7;

      oscCtx.beginPath();
      const points = 80;
      const step = w / points;

      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const carrier = Math.sin(i * 0.25 + now * 4.0);
        const vocalHarmonic = Math.sin(i * 0.55 - now * 6.5) * Math.cos(i * 0.15);
        const noise = (Math.random() - 0.5) * (isPeak ? 9 : 4);
        const amp = energy * (h * 0.38);
        const y = (h * 0.5) + (carrier * vocalHarmonic * amp) + noise;

        if (i === 0) oscCtx.moveTo(x, y);
        else oscCtx.lineTo(x, y);
      }
      oscCtx.stroke();
      oscCtx.shadowBlur = 0;

    } else {
      // Idle Phosphor Scanline with Subtle RF Jitter
      oscCtx.lineWidth = 1.4;
      oscCtx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
      oscCtx.beginPath();
      for (let x = 0; x < w; x += 4) {
        const jitter = (Math.random() - 0.5) * 2.2;
        const wave = Math.sin(x * 0.04 + now * 0.8) * 2.5;
        const y = (h * 0.5) + wave + jitter;
        if (x === 0) oscCtx.moveTo(x, y);
        else oscCtx.lineTo(x, y);
      }
      oscCtx.stroke();
    }
  }

  window.OrderRadioSystem = {
    init: initRadioPlayer,
    loadTransmission,
    playTransmission,
    pauseTransmission,
    replayTransmission
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRadioPlayer);
  } else {
    initRadioPlayer();
  }

})(window);
