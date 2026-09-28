/**
 * THE ECLIPSE ORDER · STATION 08: TRANSMISSION RELAY & CINEMATIC CONTROLLER
 * Video Player, Audio Synchronizer & Transition to Emergency Transit
 */

(function () {
  'use strict';

  // DOM Elements
  const videoElem = document.getElementById('tempest-cinematic-video');
  const btnReplayVideo = document.getElementById('btn-replay-video');
  const btnScrollToRadio = document.getElementById('btn-scroll-to-radio');
  const transceiverSection = document.getElementById('emergency-radio-chassis');
  const transceiverAnchor = document.getElementById('transceiver-anchor');
  const btnProceedEmergency = document.getElementById('btn-proceed-emergency');

  let hasRadioStarted = false;

  // Initialize Page and Audio/Video
  function initTransmissionPage() {
    // Activate the storm canvas ambience in background
    if (window.OrderStormEngine && typeof window.OrderStormEngine.activateStorm === 'function') {
      window.OrderStormEngine.activateStorm();
    }

    // Initialize radio transmission module
    if (window.OrderRadioSystem && typeof window.OrderRadioSystem.loadTransmission === 'function') {
      window.OrderRadioSystem.loadTransmission('alert', false);
    }

    // Video Events
    if (videoElem) {
      // Try to autoplay video
      const playPromise = videoElem.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy blocks sound autoplay, video remains paused until user clicks
        });
      }

      // When the 24s cinematic concludes, transition smoothly to the Radio Transceiver
      videoElem.addEventListener('ended', () => {
        proceedToRadioTransceiver(true, false);
      });
    }

    if (btnReplayVideo && videoElem) {
      btnReplayVideo.addEventListener('click', () => {
        videoElem.currentTime = 0;
        videoElem.play();
      });
    }

    if (btnScrollToRadio) {
      btnScrollToRadio.addEventListener('click', () => {
        if (videoElem && !videoElem.paused) videoElem.pause();
        proceedToRadioTransceiver(true, true);
      });
    }

    if (btnProceedEmergency) {
      btnProceedEmergency.addEventListener('click', (e) => {
        // Allow default link navigation to transit.html
        try {
          if (window.OrderStormEngine && typeof window.OrderStormEngine.playBrassClank === 'function') {
            window.OrderStormEngine.playBrassClank();
          }
        } catch (_) {}
      });
    }
  }

  function proceedToRadioTransceiver(autoPlayRadio = true, fromUserClick = false) {
    if (transceiverAnchor) {
      transceiverAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (transceiverSection) {
      transceiverSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (window.OrderRadioSystem) {
      if (fromUserClick) {
        hasRadioStarted = true;
        window.OrderRadioSystem.loadTransmission('alert', true);
      } else if (autoPlayRadio && !hasRadioStarted) {
        hasRadioStarted = true;
        window.OrderRadioSystem.loadTransmission('alert', true);
      } else {
        window.OrderRadioSystem.loadTransmission('alert', false);
      }
    }
  }

  // DOM ready initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTransmissionPage);
  } else {
    initTransmissionPage();
  }

})();
