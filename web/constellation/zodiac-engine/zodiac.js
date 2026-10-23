/**
 * THE ZODIACAL ENGINE · DIAL CONTROLLER & VALIDATOR
 * Handles the 7-letter Master Key from Sheet 5 (Cara B) of Silvia's Journal.
 * Initiates the 3D Raycasting Engine upon calibration.
 */

(function () {
  'use strict';

  // Master Key from Crossword (1 to 7 circled letters: E-C-L-I-P-S-E)
  const MASTER_KEY = 'ECLIPSE';

  // Audio Synthesizer for Mechanical Brass & Clicks (Web Audio API)
  class SoundFX {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playGearClick() {
      try {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {}
    }

    playLockSuccess() {
      try {
        this.init();
        const now = this.ctx.currentTime;

        // Rich Renaissance brass chord (D3, A3, F#4, D4)
        const chord = [146.83, 220.00, 293.66, 370.00, 440.00];
        chord.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = i % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 2.9);
        });

        // Mechanical ratchet clatter
        for (let j = 0; j < 4; j++) {
          const t = now + j * 0.06;
          const clickOsc = this.ctx.createOscillator();
          const clickGain = this.ctx.createGain();

          clickOsc.type = 'sawtooth';
          clickOsc.frequency.setValueAtTime(450 - j * 40, t);
          clickGain.gain.setValueAtTime(0.15, t);
          clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

          clickOsc.connect(clickGain);
          clickGain.connect(this.ctx.destination);

          clickOsc.start(t);
          clickOsc.stop(t + 0.04);
        }
      } catch (e) {}
    }

    playErrorBuzz() {
      try {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.linearRampToValueAtTime(75, now + 0.28);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.28);
      } catch (e) {}
    }
  }

  const sfx = new SoundFX();

  document.addEventListener('DOMContentLoaded', () => {
    const inputs = Array.from(document.querySelectorAll('.letter-input'));
    const btnEngage = document.getElementById('btn-engage-gears');
    const gearSvg = document.getElementById('gear-svg');
    const gearStatus = document.getElementById('gear-status-readout');
    const rewardSlate = document.getElementById('zodiac-reward-slate');
    const btnStartRaycast = document.getElementById('btn-start-raycast');
    const zodiacConsole = document.getElementById('zodiac-console-card');
    const raycastSection = document.getElementById('raycast-section');

    // Auto-focus first input
    if (inputs.length > 0) {
      setTimeout(() => inputs[0].focus(), 150);
    }

    // Input navigation & typing handling
    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        sfx.playGearClick();
        const val = input.value.trim().toUpperCase();
        input.value = val.slice(-1); // Only 1 char

        if (input.value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else if (input.value && index === inputs.length - 1) {
          // Check if all 7 are filled
          const fullWord = inputs.map(i => i.value.trim().toUpperCase()).join('');
          if (fullWord.length === 7) {
            validateMasterKey();
          }
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!input.value && index > 0) {
            inputs[index - 1].focus();
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          inputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else if (e.key === 'Enter') {
          validateMasterKey();
        }
      });

      // Handle paste event (e.g. pasting "ECLIPSE")
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').trim().toUpperCase();
        if (text) {
          const chars = text.replace(/[^A-Z]/g, '').split('');
          chars.slice(0, 7).forEach((ch, i) => {
            if (inputs[i]) inputs[i].value = ch;
          });
          if (chars.length >= 7) {
            inputs[6].focus();
            validateMasterKey();
          } else if (inputs[chars.length]) {
            inputs[chars.length].focus();
          }
        }
      });
    });

    function validateMasterKey() {
      const enteredWord = inputs.map(inp => inp.value.trim().toUpperCase()).join('');

      if (enteredWord.length < 7) {
        sfx.playErrorBuzz();
        inputs.forEach(inp => {
          if (!inp.value) {
            inp.classList.add('error');
            setTimeout(() => inp.classList.remove('error'), 450);
          }
        });
        if (gearStatus) {
          gearStatus.innerText = 'INCOMPLETE KEY · 7 LETTERS REQUIRED';
          gearStatus.style.color = '#fc8181';
        }
        return;
      }

      if (enteredWord === MASTER_KEY) {
        // SUCCESS
        sfx.playLockSuccess();
        try { localStorage.setItem('order_zodiac_completed', 'true'); } catch (e) {}

        inputs.forEach(inp => {
          inp.classList.remove('error');
          inp.classList.add('success');
          inp.setAttribute('readonly', true);
        });

        if (gearSvg) {
          gearSvg.classList.add('locked');
        }

        if (gearStatus) {
          gearStatus.innerText = 'GEARS SYNCHRONIZED · 100% RESONANCE';
          gearStatus.style.color = 'var(--cyan-beam)';
        }

        if (btnEngage) {
          btnEngage.style.display = 'none';
        }

        // Reveal Reward Slate
        if (rewardSlate) {
          rewardSlate.style.display = 'block';
          rewardSlate.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        // INCORRECT
        sfx.playErrorBuzz();
        inputs.forEach(inp => {
          inp.classList.add('error');
          setTimeout(() => inp.classList.remove('error'), 450);
        });

        if (gearStatus) {
          gearStatus.innerText = 'MISALIGNED TEETH · CHECK THE CIRCLES IN YOUR JOURNAL';
          gearStatus.style.color = '#fc8181';
        }
      }
    }

    if (btnEngage) {
      btnEngage.addEventListener('click', validateMasterKey);
    }

    function populateCompletedZodiac() {
      inputs.forEach((inp, i) => {
        inp.value = MASTER_KEY[i] || '';
        inp.classList.remove('error');
        inp.classList.add('success');
        inp.setAttribute('readonly', true);
      });
      if (gearSvg) {
        gearSvg.classList.add('locked');
      }
      if (gearStatus) {
        gearStatus.innerText = 'GEARS SYNCHRONIZED · 100% RESONANCE';
        gearStatus.style.color = 'var(--cyan-beam)';
      }
      if (btnEngage) {
        btnEngage.style.display = 'none';
      }
      if (rewardSlate) {
        rewardSlate.style.display = 'block';
      }
      const victoryScreen = document.getElementById('victory-screen');
      if (victoryScreen) {
        victoryScreen.style.display = 'block';
      }
      try { localStorage.setItem('order_zodiac_completed', 'true'); } catch (e) {}
    }

    function resetZodiacForReplay() {
      sfx.playGearClick();
      try { localStorage.setItem('order_zodiac_completed', 'false'); } catch (e) {}

      inputs.forEach(inp => {
        inp.value = '';
        inp.classList.remove('error', 'success');
        inp.removeAttribute('readonly');
      });
      if (gearSvg) gearSvg.classList.remove('spinning', 'locked');
      if (gearStatus) {
        gearStatus.innerText = 'STANDBY · AWAITING 7-LETTER KEY';
        gearStatus.style.color = '';
      }
      if (btnEngage) btnEngage.style.display = 'inline-flex';
      if (rewardSlate) rewardSlate.style.display = 'none';

      const victoryScreen = document.getElementById('victory-screen');
      if (victoryScreen) victoryScreen.style.display = 'none';

      if (raycastSection) {
        raycastSection.classList.remove('active');
        raycastSection.style.display = 'none';
      }
      if (zodiacConsole) {
        zodiacConsole.style.display = 'block';
      }

      if (inputs.length > 0) inputs[0].focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const btnResetDials = document.getElementById('btn-reset-dials');
    if (btnResetDials) btnResetDials.addEventListener('click', resetZodiacForReplay);

    const btnResetDialsTop = document.getElementById('btn-reset-dials-top');
    if (btnResetDialsTop) btnResetDialsTop.addEventListener('click', resetZodiacForReplay);

    const btnReplayZodiacBottom = document.getElementById('btn-replay-zodiac-bottom');
    if (btnReplayZodiacBottom) btnReplayZodiacBottom.addEventListener('click', resetZodiacForReplay);

    const btnShowSolution = document.getElementById('btn-show-solution');
    if (btnShowSolution) {
      btnShowSolution.addEventListener('click', () => {
        sfx.playLockSuccess();
        populateCompletedZodiac();
        if (rewardSlate) rewardSlate.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    const btnJumpVictory = document.getElementById('btn-jump-victory');
    if (btnJumpVictory) {
      btnJumpVictory.addEventListener('click', () => {
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
          victoryScreen.style.display = 'block';
          victoryScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    const btnJumpVictoryTop = document.getElementById('btn-jump-victory-top');
    if (btnJumpVictoryTop) {
      btnJumpVictoryTop.addEventListener('click', () => {
        populateCompletedZodiac();
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
          victoryScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Switch to 3D Raycast Section
    if (btnStartRaycast) {
      btnStartRaycast.addEventListener('click', () => {
        sfx.playGearClick();
        // Blur inputs so keyboard events don't get eaten
        document.activeElement && document.activeElement.blur();

        if (zodiacConsole) {
          zodiacConsole.style.display = 'none';
        }
        if (raycastSection) {
          raycastSection.classList.add('active');
          const frame = document.getElementById('raycast-viewport-frame');
          if (frame) {
            frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
            frame.focus();
          }

          if (typeof window.startRaycastEngine === 'function') {
            window.startRaycastEngine();
          }
        }
      });
    }

    // Default canonical completed state in Chronicles of the Raid (Silvia can explore answers or tap reset to replay)
    const isZodiacSavedDone = localStorage.getItem('order_zodiac_completed') !== 'false';
    if (isZodiacSavedDone || window.location.hash === '#completed') {
      populateCompletedZodiac();
    }

    if (window.location.search.includes('play=3d') || window.location.hash === '#3d') {
      populateCompletedZodiac();
      if (btnStartRaycast) btnStartRaycast.click();
    }

    if (window.location.hash === '#victory') {
      populateCompletedZodiac();
      const victoryScreen = document.getElementById('victory-screen');
      if (victoryScreen) victoryScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
