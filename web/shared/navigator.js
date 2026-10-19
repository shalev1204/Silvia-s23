/**
 * THE ECLIPSE ORDER · UNIVERSAL CODEX & NAVIGATOR
 * Dynamic, spoiler-free navigation system for Silvia's Quest Ecosystem:
 * 1. Collapsible Left Sidebar (Hub Navigation Menu): returns to Hub Home or any section (#view-chronicles, #view-trail, etc.)
 * 2. Order Codex Drawer (Right): track journey progress & quick return to Chronicles of the Raid.
 */

(function () {
  'use strict';

  function getRootRelativePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/constellation/') || path.includes('/desert/') || path.includes('/stage/')) {
      return '../../';
    }
    return './';
  }

  const root = getRootRelativePath();

  // Check player's actual progress in localStorage (Flower & Matrix are canonical completed defaults)
  const isFlowerCompleted = localStorage.getItem('order_flower_completed') !== 'false';
  if (localStorage.getItem('order_flower_completed') !== 'true') {
    try { localStorage.setItem('order_flower_completed', 'true'); } catch (e) {}
  }
  const isMatrixCompleted = localStorage.getItem('order_matrix_completed') !== 'false';
  if (localStorage.getItem('order_matrix_completed') !== 'true') {
    try { localStorage.setItem('order_matrix_completed', 'true'); } catch (e) {}
  }
  const isZodiacCompleted = localStorage.getItem('order_zodiac_completed') === 'true';

  // Only show stages she actually knows about, with no future spoilers
  const stages = [
    {
      id: 'celestial-flower',
      folder: 'celestial-flower',
      path: 'Constellation Path · Game 03',
      title: 'The Celestial Flower',
      icon: '🌸',
      url: root + 'constellation/celestial-flower/index.html',
      status: 'Harmonized ✓',
      statusClass: 'status-completed',
      unlocked: true
    },
    {
      id: 'celestial-flower-2',
      folder: 'celestial-flower-2',
      aliases: ['severed-sky', 'observatory-raid'],
      path: 'The Observatory · Game 04',
      title: 'The Observatory Raid',
      icon: '⚡',
      url: root + 'constellation/celestial-flower-2/index.html',
      status: 'Archived ✓',
      statusClass: 'status-completed',
      unlocked: true
    },
    {
      id: 'radio-transmission',
      folder: 'radio-transmission',
      path: 'Constellation Path · Game 05',
      title: 'Emergency Radio Relay',
      icon: '📻',
      url: root + 'constellation/radio-transmission/index.html',
      status: 'Received ✓',
      statusClass: 'status-completed',
      unlocked: true
    },
    {
      id: 'celestial-matrix',
      folder: 'celestial-matrix',
      path: 'The Observatory · Game 06',
      title: 'The Celestial Matrix',
      icon: '🔭',
      url: root + 'constellation/celestial-matrix/index.html',
      status: 'Calibrated ✓',
      statusClass: 'status-completed',
      unlocked: true
    },
    {
      id: 'zodiac-engine',
      folder: 'zodiac-engine',
      path: 'Constellation Path · Game 07',
      title: 'The Zodiac Engine',
      icon: '🏜️',
      url: root + 'constellation/zodiac-engine/index.html',
      status: isZodiacCompleted ? 'Explored ✓' : 'Active Pursuit ★',
      statusClass: isZodiacCompleted ? 'status-completed' : 'status-active',
      unlocked: true
    }
  ];

  const isMidnightCompleted = localStorage.getItem('order_midnight_completed') === 'true';

  if (isZodiacCompleted) {
    stages.push({
      id: 'midnight-calibration',
      folder: 'midnight-calibration',
      path: 'Station 08 · The Shifting Tempest',
      title: 'The Midnight Calibration',
      icon: '⏳',
      url: isMidnightCompleted
        ? root + 'constellation/midnight-calibration/transit.html#victory'
        : root + 'constellation/midnight-calibration/index.html',
      status: isMidnightCompleted ? 'Calibrated ✓' : 'Midnight Watch ⏳',
      statusClass: isMidnightCompleted ? 'status-completed' : 'status-active',
      unlocked: true
    });
  }

  const isCipherCompleted = localStorage.getItem('order_cipher_completed') === 'true';
  const activeSeekerNav = (localStorage.getItem('the_eclipse_active_seeker') || 'Silvia').toLowerCase();
  const silviaCipherDone = localStorage.getItem('seeker_silvia_cipher_completed') === 'true';
  const carlesCipherDone = localStorage.getItem('seeker_carles_cipher_completed') === 'true';
  const seekerCipherDone = activeSeekerNav === 'carles' ? (carlesCipherDone || isCipherCompleted) : (silviaCipherDone || isCipherCompleted);

  if (isMidnightCompleted) {
    // Station 09 is available to both seekers — never auto-switch profiles from the sidebar
    stages.push({
      id: 'celestial-cipher',
      folder: 'celestial-cipher',
      path: 'Station 09 · Constellation Finale',
      title: 'The Celestial Cipher',
      icon: '📜',
      url: root + 'constellation/celestial-cipher/index.html',
      status: seekerCipherDone ? 'Decrypted ✓' : 'Awaiting Decryption ✦',
      statusClass: seekerCipherDone ? 'status-completed' : 'status-active',
      unlocked: true
    });
  }

  function getCurrentStageId(stagesList) {
    const normPath = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();

    // Sort stages by identifier length descending so specific directory names (e.g. celestial-flower-2)
    // take precedence over parent/substring names (e.g. celestial-flower)
    const sorted = [...stagesList].sort((a, b) => {
      const lenA = Math.max(a.id.length, (a.folder || '').length);
      const lenB = Math.max(b.id.length, (b.folder || '').length);
      return lenB - lenA;
    });

    // 1. Strict delimiter / folder boundary check (e.g. '/celestial-flower-2/' vs '/celestial-flower/')
    for (const s of sorted) {
      const candidates = [s.folder, s.id, ...(s.aliases || [])].filter(Boolean);
      for (const name of candidates) {
        const lower = name.toLowerCase();
        if (
          normPath.includes('/' + lower + '/') ||
          normPath.endsWith('/' + lower) ||
          normPath.includes('/' + lower + '/index.html') ||
          normPath.endsWith('/' + lower + '.html')
        ) {
          return s.id;
        }
      }
    }

    // 2. Direct folder containment check as fallback
    for (const s of sorted) {
      const folder = (s.folder || s.id).toLowerCase();
      if (normPath.includes(folder)) {
        return s.id;
      }
    }

    return null;
  }

  function initNavigator() {
    // If embedded inside an iframe (e.g. inside the Hub's Transmissions player), do not render duplicate outer navigation
    const isEmbedded = (window.self !== window.top || window.location.search.includes('embedded=true') || document.documentElement.classList.contains('is-embedded'));
    if (isEmbedded) return;

    // -------------------------------------------------------------------------
    // 1. COLLAPSIBLE LEFT SIDEBAR (HUB MENU)
    // -------------------------------------------------------------------------
    if (!document.getElementById('order-sidebar-toggle')) {
      const sidebarTrigger = document.createElement('button');
      sidebarTrigger.id = 'order-sidebar-toggle';
      sidebarTrigger.className = 'order-sidebar-toggle';
      sidebarTrigger.type = 'button';
      sidebarTrigger.title = 'Open Navigation Menu · Return to Hub';
      sidebarTrigger.innerHTML = `<span class="trigger-icon">☰</span><span>Menu</span>`;
      document.body.appendChild(sidebarTrigger);
    }

    if (!document.getElementById('order-sidebar-backdrop')) {
      const sidebarBackdrop = document.createElement('div');
      sidebarBackdrop.id = 'order-sidebar-backdrop';
      sidebarBackdrop.className = 'order-sidebar-backdrop';

      sidebarBackdrop.innerHTML = `
        <aside class="order-sidebar-drawer" role="dialog" aria-label="Order Hub Menu">
          <div>
            <!-- Order Brand Header -->
            <div class="order-sidebar-brand">
              <div class="brand-sigil-wrap">
                <div class="brand-sigil-ring"></div>
                <div class="brand-sigil-ring-inner"></div>
                <span class="brand-sigil">◐</span>
              </div>
              <div class="brand-text-wrap">
                <span class="brand-order-title">The Eclipse Order</span>
                <span class="brand-sub-tag">Silvia's Journey</span>
              </div>
              <button type="button" class="order-sidebar-collapse-btn" id="order-sidebar-close" title="Collapse Menu">◀</button>
            </div>

            <!-- Navigation Links to Hub Sections -->
            <nav class="order-sidebar-nav">
              <a href="${root}index.html#view-trail" class="order-sidebar-link">
                <span class="btn-icon">🗺️</span>
                <span>The Quest Map</span>
              </a>
              <a href="${root}index.html#view-transmissions" class="order-sidebar-link">
                <span class="btn-icon">📡</span>
                <span>Transmissions</span>
              </a>
              <a href="${root}index.html#view-archives" class="order-sidebar-link">
                <span class="btn-icon">📜</span>
                <span>The Archives</span>
              </a>
              <a href="${root}index.html#view-chronicles" class="order-sidebar-link">
                <span class="btn-icon">🏛️</span>
                <span>Chronicles of the Raid</span>
              </a>
              <a href="${root}index.html#view-cipher" class="order-sidebar-link">
                <span class="btn-icon">🗝️</span>
                <span>The Cipher Ledger</span>
              </a>
            </nav>

            <!-- Quick Return to Hub Home Button -->
            <div class="sidebar-hub-home-wrap">
              <a href="${root}index.html" class="btn-sidebar-hub-home">
                <span>✦ Return to Hub Home ✦</span>
              </a>
            </div>
          </div>

          <!-- Atmospheric Lore Footer -->
          <div class="order-sidebar-footer-lore">
            <div class="footer-lore-crest">✧ ✦ ✧</div>
            <div class="footer-lore-text">The Eclipse Order · 2026</div>
            <div class="footer-lore-sub">Silvia's Journey</div>
          </div>
        </aside>
      `;

      document.body.appendChild(sidebarBackdrop);
    }

    // -------------------------------------------------------------------------
    // 2. ORDER CODEX (RIGHT DRAWER)
    // -------------------------------------------------------------------------
    if (!document.getElementById('order-codex-trigger')) {
      const codexTrigger = document.createElement('button');
      codexTrigger.id = 'order-codex-trigger';
      codexTrigger.className = 'order-nav-trigger';
      codexTrigger.type = 'button';
      codexTrigger.title = 'Open Order Codex & Quest Map';
      codexTrigger.innerHTML = `<span class="trigger-icon">◐</span><span>Order Codex</span>`;
      document.body.appendChild(codexTrigger);
    }

    if (!document.getElementById('order-codex-backdrop')) {
      const codexBackdrop = document.createElement('div');
      codexBackdrop.id = 'order-codex-backdrop';
      codexBackdrop.className = 'order-nav-backdrop';

      const activeStageId = getCurrentStageId(stages);

      let stageCardsHtml = '';
      stages.forEach(s => {
        const isActive = (s.id === activeStageId);
        const activeClass = isActive ? ' active' : '';
        const lockedClass = s.locked ? ' locked' : '';
        stageCardsHtml += `
          <a href="${s.locked ? 'javascript:void(0)' : s.url}" class="order-stage-card${activeClass}${lockedClass}" ${isActive ? 'aria-current="page"' : ''}>
            <div class="stage-card-icon">${s.icon}</div>
            <div class="stage-card-info">
              <div class="stage-card-path">${s.path}</div>
              <div class="stage-card-title">${s.title}</div>
              <div class="stage-card-status ${s.statusClass}">${s.status}</div>
            </div>
          </a>
        `;
      });

      codexBackdrop.innerHTML = `
        <aside class="order-nav-drawer" role="dialog" aria-label="Order Codex">
          <header class="order-nav-header">
            <div class="order-nav-title-group">
              <span class="order-nav-badge">✦ Silvia's Journey ✦</span>
              <h3 class="order-nav-title">The Order Codex</h3>
            </div>
            <button type="button" class="order-nav-close" id="order-codex-close" aria-label="Close Codex">×</button>
          </header>

          <div class="order-nav-content">
            <!-- Quests & Navigation -->
            <div>
              <div class="order-nav-section-title"><span>The Star Trail</span></div>
              <div class="order-stage-list">
                ${stageCardsHtml}
              </div>
            </div>
          </div>

          <footer class="order-nav-footer">
            <a href="${root}index.html#view-chronicles" class="btn-order-hub" id="btn-return-codex-hub">
              <span>✦ Return to Chronicles of the Raid ✦</span>
            </a>
          </footer>
        </aside>
      `;

      document.body.appendChild(codexBackdrop);
    }

    // -------------------------------------------------------------------------
    // 3. CONTROLLERS & EVENT BINDINGS
    // -------------------------------------------------------------------------
    const sidebarTriggerBtn = document.getElementById('order-sidebar-toggle');
    const sidebarBackdropEl = document.getElementById('order-sidebar-backdrop');
    const sidebarCloseBtn = document.getElementById('order-sidebar-close');

    const codexTriggerBtn = document.getElementById('order-codex-trigger');
    const codexBackdropEl = document.getElementById('order-codex-backdrop');
    const codexCloseBtn = document.getElementById('order-codex-close');

    function openSidebar() {
      closeCodex();
      if (sidebarBackdropEl) {
        sidebarBackdropEl.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeSidebar() {
      if (sidebarBackdropEl) {
        sidebarBackdropEl.classList.remove('open');
      }
      if (!codexBackdropEl || !codexBackdropEl.classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }

    function openCodex() {
      closeSidebar();
      if (codexBackdropEl) {
        codexBackdropEl.classList.add('open');
        document.body.style.overflow = 'hidden';

        const activeCard = codexBackdropEl.querySelector('.order-stage-card.active');
        if (activeCard && typeof activeCard.scrollIntoView === 'function') {
          setTimeout(() => {
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 120);
        }
      }
    }

    function closeCodex() {
      if (codexBackdropEl) {
        codexBackdropEl.classList.remove('open');
      }
      if (!sidebarBackdropEl || !sidebarBackdropEl.classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }

    if (sidebarTriggerBtn) sidebarTriggerBtn.addEventListener('click', openSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
    if (sidebarBackdropEl) {
      sidebarBackdropEl.addEventListener('click', function (e) {
        if (e.target === sidebarBackdropEl) closeSidebar();
      });
    }

    if (codexTriggerBtn) codexTriggerBtn.addEventListener('click', openCodex);
    if (codexCloseBtn) codexCloseBtn.addEventListener('click', closeCodex);
    if (codexBackdropEl) {
      codexBackdropEl.addEventListener('click', function (e) {
        if (e.target === codexBackdropEl) closeCodex();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (sidebarBackdropEl && sidebarBackdropEl.classList.contains('open')) closeSidebar();
        if (codexBackdropEl && codexBackdropEl.classList.contains('open')) closeCodex();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigator);
  } else {
    initNavigator();
  }
})();
