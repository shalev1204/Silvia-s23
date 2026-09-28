/**
 * THE ECLIPSE ORDER · THE DESERT PATH
 * Atmospheric Sandstorm & Drifting Dune Particle Simulation (No Stars)
 */

(function () {
  'use strict';

  const canvas = document.getElementById('desert-sand-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let animationId = null;

  // Particle configuration
  const GRAIN_COUNT = 240;
  const DUST_PUFF_COUNT = 18;
  const grains = [];
  const dustPuffs = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function initParticles() {
    grains.length = 0;
    dustPuffs.length = 0;

    // 1. Fine Sand Grains pelting across the dunes
    for (let i = 0; i < GRAIN_COUNT; i++) {
      grains.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -(Math.random() * 5.5 + 4.0), // blowing right to left
        vy: (Math.random() - 0.3) * 1.5,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.6 + 0.25,
        color: Math.random() > 0.3 ? '#f59e0b' : (Math.random() > 0.5 ? '#d97706' : '#fef3c7')
      });
    }

    // 2. Soft Swirling Dust Clouds / Sand Haze
    for (let i = 0; i < DUST_PUFF_COUNT; i++) {
      dustPuffs.push({
        x: Math.random() * width,
        y: height * 0.4 + Math.random() * (height * 0.6),
        vx: -(Math.random() * 2.2 + 1.2),
        vy: (Math.random() - 0.4) * 0.8,
        radius: Math.random() * 120 + 80,
        alpha: Math.random() * 0.12 + 0.04,
        hue: Math.random() > 0.5 ? '217, 119, 6' : '194, 65, 12'
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Warm deep twilight desert ambient gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, 'rgba(26, 14, 9, 0.4)');
    bgGrad.addColorStop(0.6, 'rgba(45, 23, 14, 0.65)');
    bgGrad.addColorStop(1, 'rgba(65, 30, 16, 0.85)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw Dust Clouds (Haze)
    for (let puff of dustPuffs) {
      puff.x += puff.vx;
      puff.y += puff.vy;

      if (puff.x < -puff.radius * 2) {
        puff.x = width + puff.radius;
        puff.y = height * 0.35 + Math.random() * (height * 0.65);
      }

      const grad = ctx.createRadialGradient(puff.x, puff.y, puff.radius * 0.1, puff.x, puff.y, puff.radius);
      grad.addColorStop(0, `rgba(${puff.hue}, ${puff.alpha})`);
      grad.addColorStop(0.6, `rgba(${puff.hue}, ${puff.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Pelting Sand Grains
    for (let g of grains) {
      g.x += g.vx;
      g.y += g.vy;

      if (g.x < -10) {
        g.x = width + Math.random() * 20;
        g.y = Math.random() * height;
      }
      if (g.y > height + 10) g.y = -5;
      if (g.y < -10) g.y = height + 5;

      ctx.fillStyle = g.color;
      ctx.globalAlpha = g.alpha;

      // Draw elongated grain streaks (high speed motion blur)
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, g.size * 2.2, g.size * 0.7, -0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    animationId = requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  document.addEventListener('DOMContentLoaded', () => {
    resize();
    initParticles();
    render();
  });

})();
