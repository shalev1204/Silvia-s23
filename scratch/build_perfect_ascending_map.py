import re
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

new_svg = '''            <svg id="trail-svg-map" viewBox="0 0 1120 1100">
              <defs>
                <!-- Panoramic Atmospheric Gradient (Night Alpine Base -> Twilight Gorge -> Upper Storm & Desert) -->
                <linearGradient id="panoramicMapBg" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#040918" />
                  <stop offset="25%" stop-color="#07132a" />
                  <stop offset="48%" stop-color="#101124" />
                  <stop offset="68%" stop-color="#1b101c" />
                  <stop offset="85%" stop-color="#28130c" />
                  <stop offset="100%" stop-color="#321608" />
                </linearGradient>

                <!-- Full-Canvas Regional Atmospheric Halos (Soft, Seamless Blending) -->
                <radialGradient id="glowObservatory" cx="30%" cy="86%" r="35%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.16" />
                  <stop offset="50%" stop-color="#ffe099" stop-opacity="0.06" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowChasm" cx="42%" cy="63%" r="30%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.12" />
                  <stop offset="55%" stop-color="#1e293b" stop-opacity="0.05" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowPlanisphere" cx="50%" cy="42%" r="28%">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.16" />
                  <stop offset="50%" stop-color="#d97706" stop-opacity="0.07" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowTempest" cx="56%" cy="22%" r="32%">
                  <stop offset="0%" stop-color="#ea580c" stop-opacity="0.25" />
                  <stop offset="45%" stop-color="#fbbf24" stop-opacity="0.15" />
                  <stop offset="70%" stop-color="#3b0764" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="tempestVortexDark" cx="56%" cy="22%" r="22%">
                  <stop offset="0%" stop-color="#1c0717" stop-opacity="0.65" />
                  <stop offset="60%" stop-color="#120410" stop-opacity="0.30" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowDesertDunes" cx="80%" cy="13%" r="34%">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25" />
                  <stop offset="45%" stop-color="#ea580c" stop-opacity="0.12" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <!-- Star & Marker Glows -->
                <radialGradient id="starGlowGold" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffe099" stop-opacity="0.95" />
                  <stop offset="40%" stop-color="#d4a853" stop-opacity="0.45" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="starGlowCyan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#4fe3c1" stop-opacity="0.95" />
                  <stop offset="40%" stop-color="#2bb898" stop-opacity="0.45" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="starGlowAmber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffe099" stop-opacity="0.95" />
                  <stop offset="45%" stop-color="#f59e0b" stop-opacity="0.55" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <!-- Future Trail Fade into Celestial Horizon -->
                <linearGradient id="futureFadeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.85" />
                  <stop offset="60%" stop-color="#ea580c" stop-opacity="0.45" />
                  <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
                </linearGradient>
              </defs>

              <!-- Base Background Map Canvas -->
              <rect x="0" y="0" width="1120" height="1100" fill="url(#panoramicMapBg)" pointer-events="none" />

              <!-- Regional Atmospheric Auras (Full-canvas blend, zero sharp seams) -->
              <rect x="0" y="0" width="1120" height="1100" fill="url(#glowObservatory)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="1100" fill="url(#glowChasm)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="1100" fill="url(#glowPlanisphere)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="1100" fill="url(#glowTempest)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="1100" fill="url(#tempestVortexDark)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="1100" fill="url(#glowDesertDunes)" pointer-events="none" />

              <!-- =============================================================
                   CARTOGRAPHIC BORDER GRADUATIONS & MARGIN RULERS
                   ============================================================= -->
              <!-- Outer Framework Borders -->
              <g stroke="rgba(212,168,83,0.32)" stroke-width="1.2" fill="none">
                <rect x="24" y="22" width="1072" height="1056" />
                <rect x="30" y="28" width="1060" height="1044" stroke-dasharray="3, 5" stroke-opacity="0.4" />
              </g>

              <!-- Corner Rosettes & Renaissance Scrollwork -->
              <g fill="none" stroke="rgba(212,168,83,0.55)" stroke-width="1.2">
                <circle cx="27" cy="25" r="4.5" fill="#140f1a" />
                <circle cx="27" cy="25" r="2" fill="#ffe099" />
                <circle cx="1093" cy="25" r="4.5" fill="#140f1a" />
                <circle cx="1093" cy="25" r="2" fill="#ffe099" />
                <circle cx="27" cy="1075" r="4.5" fill="#140f1a" />
                <circle cx="27" cy="1075" r="2" fill="#ffe099" />
                <circle cx="1093" cy="1075" r="4.5" fill="#140f1a" />
                <circle cx="1093" cy="1075" r="2" fill="#ffe099" />
              </g>

              <!-- Top & Bottom Margin Graduations (Celestial Hours / Right Ascension) -->
              <g fill="rgba(212,168,83,0.48)" font-family="'JetBrains Mono', monospace" font-size="8" text-anchor="middle">
                <!-- Top Hours -->
                <line x1="80" y1="22" x2="80" y2="28" stroke="rgba(212,168,83,0.6)" stroke-width="1.2" />
                <text x="80" y="18">0h · N</text>
                <line x1="180" y1="22" x2="180" y2="28" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="180" y="18">II h</text>
                <line x1="300" y1="22" x2="300" y2="28" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="300" y="18">IV h</text>
                <line x1="430" y1="22" x2="430" y2="28" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="430" y="18">VI h</text>
                <line x1="560" y1="20" x2="560" y2="28" stroke="#f59e0b" stroke-width="1.6" />
                <text x="560" y="16" fill="#f59e0b" font-weight="700">XII h · MERIDIES</text>
                <line x1="690" y1="22" x2="690" y2="28" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="690" y="18">XVI h</text>
                <line x1="820" y1="22" x2="820" y2="28" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="820" y="18">XVIII h</text>
                <line x1="950" y1="22" x2="950" y2="28" stroke="rgba(234,88,12,0.6)" stroke-width="1.2" />
                <text x="950" y="18" fill="#ea580c">XXII h</text>
                <line x1="1040" y1="22" x2="1040" y2="28" stroke="rgba(234,88,12,0.7)" stroke-width="1.4" />
                <text x="1040" y="18" fill="#ea580c">XXIV h</text>

                <!-- Bottom Margin Graduations -->
                <line x1="80" y1="1072" x2="80" y2="1078" stroke="rgba(212,168,83,0.5)" stroke-width="1.2" />
                <text x="80" y="1088">0h</text>
                <line x1="300" y1="1072" x2="300" y2="1078" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="300" y="1088">IV h</text>
                <line x1="560" y1="1072" x2="560" y2="1080" stroke="#f59e0b" stroke-width="1.6" />
                <text x="560" y="1090" fill="#f59e0b" font-weight="700">XII h</text>
                <line x1="820" y1="1072" x2="820" y2="1078" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="820" y="1088">XVIII h</text>
                <line x1="1040" y1="1072" x2="1040" y2="1078" stroke="rgba(234,88,12,0.6)" stroke-width="1.2" />
                <text x="1040" y="1088" fill="#ea580c">XXIV h</text>
              </g>

              <!-- Left & Right Flank Graduations (Latitude Degrees) -->
              <g fill="rgba(212,168,83,0.45)" font-family="'JetBrains Mono', monospace" font-size="8">
                <!-- Left Flank -->
                <line x1="24" y1="90" x2="30" y2="90" stroke="rgba(212,168,83,0.6)" stroke-width="1.2" />
                <text x="18" y="93" text-anchor="end">+80° N</text>
                <line x1="24" y1="320" x2="30" y2="320" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="18" y="323" text-anchor="end">+50°</text>
                <line x1="24" y1="560" x2="30" y2="560" stroke="#f59e0b" stroke-width="1.6" />
                <text x="18" y="563" text-anchor="end" fill="#f59e0b" font-weight="700">0° EQ</text>
                <line x1="24" y1="800" x2="30" y2="800" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="18" y="803" text-anchor="end">-40°</text>
                <line x1="24" y1="1000" x2="30" y2="1000" stroke="rgba(234,88,12,0.6)" stroke-width="1.2" />
                <text x="18" y="1003" text-anchor="end" fill="#ea580c">-80° S</text>

                <!-- Right Flank -->
                <line x1="1090" y1="90" x2="1096" y2="90" stroke="rgba(212,168,83,0.6)" stroke-width="1.2" />
                <text x="1102" y="93" text-anchor="start">+80° N</text>
                <line x1="1090" y1="320" x2="1096" y2="320" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="1102" y="323" text-anchor="start">+50°</text>
                <line x1="1090" y1="560" x2="1096" y2="560" stroke="#f59e0b" stroke-width="1.6" />
                <text x="1102" y="563" text-anchor="start" fill="#f59e0b" font-weight="700">0° EQ</text>
                <line x1="1090" y1="800" x2="1096" y2="800" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="1102" y="803" text-anchor="start">-40°</text>
                <line x1="1090" y1="1000" x2="1096" y2="1000" stroke="rgba(234,88,12,0.6)" stroke-width="1.2" />
                <text x="1102" y="1003" text-anchor="start" fill="#ea580c">-80° S</text>
              </g>

              <!-- Top & Bottom Master Cartouche Ribbons -->
              <text x="560" y="44" fill="#ffe099" font-family="'Cinzel Decorative', 'Cinzel', serif" font-size="10" font-weight="700" letter-spacing="0.28em" text-anchor="middle" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.9))">✦ ITER CELESTE · VIA ASTRONOMICA ✦</text>
              <text x="560" y="58" fill="rgba(212,168,83,0.55)" font-family="'Cinzel', serif" font-size="7.5" letter-spacing="0.18em" text-anchor="middle">THE CONSTELLATION OVERWORLD · EXPEDITION TRANSECT</text>

              <text x="560" y="1056" fill="rgba(212,168,83,0.65)" font-family="'Cinzel', serif" font-size="8.5" font-weight="700" letter-spacing="0.22em" text-anchor="middle">✦ TRIBUS TURRIBUS CANON // A CUMBRE ALPINO AD ARENAS DESERTI ✦</text>

              <!-- =============================================================
                   CELESTIAL OVERHEAD CANOPY & ASTRONOMICAL CONSTELLATIONS
                   ============================================================= -->
              <!-- Armillary Sphere Coordinate Arcs across Upper Sky -->
              <g stroke="rgba(212,168,83,0.12)" stroke-width="0.8" fill="none">
                <circle cx="560" cy="110" r="440" stroke-dasharray="2, 6" />
                <circle cx="560" cy="110" r="300" stroke-dasharray="4, 4" />
                <circle cx="560" cy="110" r="170" />
                <ellipse cx="560" cy="110" rx="390" ry="85" stroke-dasharray="3, 5" />
                <line x1="120" y1="110" x2="1000" y2="110" stroke-dasharray="3, 5" stroke-opacity="0.2" />
                <line x1="560" y1="28" x2="560" y2="240" stroke-dasharray="3, 5" stroke-opacity="0.2" />
              </g>

              <!-- Traced Celestial Asterisms in the Sky -->
              <g stroke="rgba(212,168,83,0.24)" stroke-width="0.8" fill="none">
                <!-- Ursa Minor & Polaris (Northwest) -->
                <polyline points="100,75 125,85 140,78 160,95 150,110 128,106 125,85" />
                <circle cx="100" cy="75" r="2.8" fill="#ffe099" opacity="0.95" />
                <circle cx="100" cy="75" r="5.5" fill="none" stroke="#ffe099" stroke-width="0.6" opacity="0.7" />
                <text x="100" y="65" fill="#ffe099" font-family="'Cinzel', serif" font-size="7" font-weight="700" text-anchor="middle">POLARIS ★</text>

                <!-- Cassiopeia 'W' (North-Center Sky) -->
                <polyline points="290,65 310,80 330,67 350,83 370,70" />
                <circle cx="290" cy="65" r="1.8" fill="#ffe099" />
                <circle cx="310" cy="80" r="1.8" fill="#ffe099" />
                <circle cx="330" cy="67" r="1.8" fill="#ffe099" />
                <circle cx="350" cy="83" r="1.8" fill="#ffe099" />
                <circle cx="370" cy="70" r="1.8" fill="#ffe099" />
                <text x="330" y="57" fill="rgba(212,168,83,0.5)" font-family="'Cinzel', serif" font-size="7" text-anchor="middle">CASSIOPEIA</text>

                <!-- Cygnus (Center-East Sky) -->
                <line x1="490" y1="80" x2="550" y2="105" />
                <line x1="520" y1="65" x2="515" y2="125" />
                <circle cx="520" cy="90" r="2.2" fill="#ffe099" />
                <text x="520" y="59" fill="rgba(212,168,83,0.5)" font-family="'Cinzel', serif" font-size="7" text-anchor="middle">CYGNUS</text>

                <!-- Lyra & Vega (Source of the 97° collimator beam) -->
                <polygon points="825,60 845,53 858,73 840,81" />
                <line x1="845" y1="53" x2="840" y2="75" />
                <circle cx="840" cy="75" r="3.8" fill="#ffe099" filter="drop-shadow(0 0 8px #fbbf24)" />
                <circle cx="840" cy="75" r="7.5" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.8" />
                <text x="840" y="46" fill="#fbbf24" font-family="'Cinzel', serif" font-size="8.5" font-weight="700" text-anchor="middle" filter="drop-shadow(0 0 5px rgba(0,0,0,0.9))">VEGA ★ [LYRA]</text>

                <!-- Altair -->
                <polyline points="655,115 680,130 705,120" />
                <circle cx="680" cy="130" r="2.5" fill="#ffe099" />
                <text x="680" y="145" fill="rgba(212,168,83,0.5)" font-family="'Cinzel', serif" font-size="7" text-anchor="middle">ALTAIR</text>
              </g>

              <!-- =============================================================
                   ZONE 1: MONTES BOREALES & THE GRAND OBSERVATORY (LOWER ALPINE)
                   ============================================================= -->
              <!-- Distant Alpine Mountain Peaks (Background Layer) -->
              <g fill="#071224" stroke="rgba(212,168,83,0.35)" stroke-width="1.2">
                <polygon points="50,1030 110,810 180,1030" />
                <polygon points="120,1030 230,730 330,1030" />
                <polygon points="280,1030 360,820 440,1030" />
              </g>

              <!-- Mountain Snowcaps -->
              <g fill="rgba(255,224,153,0.18)" stroke="#ffe099" stroke-width="1.2">
                <polygon points="110,810 102,840 110,835 118,845 126,832" />
                <polygon points="230,730 218,775 230,766 242,778 254,762" />
                <polygon points="360,820 352,850 360,844 368,855 376,842" />
              </g>

              <!-- Da Vinci Style Shading & Ridge Lines -->
              <g class="map-terrain-hatching">
                <line x1="230" y1="730" x2="230" y2="1030" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <line x1="215" y1="800" x2="230" y2="815" />
                <line x1="205" y1="830" x2="230" y2="850" />
                <line x1="195" y1="860" x2="230" y2="885" />
                <line x1="245" y1="800" x2="230" y2="815" />
                <line x1="255" y1="830" x2="230" y2="850" />
              </g>

              <!-- Grand Observatory Complex Architecture at Station 2 terrace (400, 890) -->
              <g stroke="#d4a853" stroke-width="1" fill="#0f1b2d">
                <rect x="380" y="830" width="40" height="20" />
                <rect x="385" y="836" width="5" height="10" rx="2.5" fill="#ffe099" opacity="0.8" />
                <rect x="397" y="836" width="5" height="10" rx="2.5" fill="#ffe099" opacity="0.8" />
                <rect x="409" y="836" width="5" height="10" rx="2.5" fill="#ffe099" opacity="0.8" />
                <!-- Copper/Verdigris Observation Dome -->
                <path d="M 378 830 Q 400 804 422 830 Z" fill="#1b3b42" stroke="#4fe3c1" stroke-width="1.1" />
                <!-- Cupola & Armillary Spire -->
                <rect x="397" y="800" width="6" height="6" fill="#d4a853" />
                <line x1="400" y1="800" x2="400" y2="790" stroke="#ffe099" stroke-width="1.2" />
                <circle cx="400" cy="788" r="3" fill="none" stroke="#ffe099" stroke-width="0.8" />
                <!-- Brass Telescope pointing towards Polaris -->
                <line x1="405" y1="825" x2="423" y2="802" stroke="#ffe099" stroke-width="2" stroke-linecap="round" filter="drop-shadow(0 0 4px #ffe099)" />
              </g>

              <!-- Alpine Pine Grove (Around Station 03 at 630, 810) -->
              <g fill="#081e20" stroke="rgba(79,227,193,0.3)" stroke-width="0.8">
                <polygon points="580,820 575,835 585,835" />
                <polygon points="595,810 590,826 600,826" />
                <polygon points="610,830 605,848 615,848" />
                <polygon points="645,820 640,838 650,838" />
                <polygon points="665,810 660,828 670,828" />
                <polygon points="680,825 675,842 685,842" />
              </g>

              <!-- Region Banner Ribbon: MONTES BOREALES -->
              <text x="230" y="710" fill="#ffe099" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">MONTES BOREALES // OBSERVATORIUM ALTI</text>

              <!-- =============================================================
                   ZONE 2: THE WHISPERING CHASM & THE ANCIENT AQUEDUCT (MID-LOWER)
                   ============================================================= -->
              <!-- Sheer Vertical Gorge Cliffs & Fractured Strata (Da Vinci hatching) -->
              <g stroke="rgba(212,168,83,0.25)" stroke-width="0.9" fill="none">
                <path d="M 405 600 L 410 665 L 402 735 L 415 800" />
                <line x1="385" y1="640" x2="410" y2="640" stroke-dasharray="2, 4" />
                <line x1="380" y1="700" x2="405" y2="700" stroke-dasharray="2, 4" />
                <line x1="390" y1="760" x2="415" y2="760" stroke-dasharray="2, 4" />
                <path d="M 535 580 L 530 650 L 538 720 L 532 790" />
                <line x1="530" y1="630" x2="555" y2="630" stroke-dasharray="2, 4" />
                <line x1="535" y1="690" x2="560" y2="690" stroke-dasharray="2, 4" />
                <line x1="532" y1="750" x2="555" y2="750" stroke-dasharray="2, 4" />
              </g>

              <!-- Cascading Glacial Waterfall in Ravine -->
              <path d="M 465 760 Q 480 710 490 685 L 505 685 Q 495 715 480 760 Z" fill="#061c28" stroke="rgba(56,189,248,0.45)" stroke-width="1.2" />

              <!-- Ancient Multi-Arch Stone Aqueduct (Station 04 Bridgehead at 470, 680) -->
              <g stroke="#d4a853" stroke-width="1" fill="#141424">
                <rect x="410" y="674" width="125" height="6" fill="#1e1828" stroke-width="1.2" />
                <path d="M 415 680 A 5 5 0 0 0 425 680 M 430 680 A 5 5 0 0 0 440 680 M 445 680 A 5 5 0 0 0 455 680 M 460 680 A 5 5 0 0 0 470 680 M 475 680 A 5 5 0 0 0 485 680 M 490 680 A 5 5 0 0 0 500 680 M 505 680 A 5 5 0 0 0 515 680" fill="none" stroke="#d4a853" stroke-width="0.8" />
                <rect x="420" y="684" width="10" height="34" />
                <rect x="465" y="684" width="10" height="34" />
                <rect x="500" y="684" width="10" height="34" />
                <!-- Broken Arch Breach -->
                <path d="M 475 708 Q 482 696 488 704 L 492 710 L 500 684 L 475 684 Z" fill="#0a0a14" stroke="#ef4444" stroke-width="1.2" />
              </g>

              <!-- The Radio Needle Pinnacle (Station 05 Rock Needle Spire at 280, 540) -->
              <g stroke="rgba(212,168,83,0.3)" stroke-width="1">
                <polygon points="274,720 280,520 286,720" fill="#140f1a" />
              </g>

              <!-- Region Banner Ribbon: FRETUM CALAMITAS -->
              <text x="470" y="645" fill="#ffe099" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">FRETUM CALAMITAS // PONS FRACTUS</text>

              <!-- =============================================================
                   ZONE 3: THE SUNKEN PLANISPHERE & SANDSTONE TERRACES (MID-UPPER)
                   ============================================================= -->
              <!-- The Ancient Sunken Planisphere Arena (Station 06 at 510, 440) -->
              <g transform="translate(510, 440)">
                <ellipse cx="0" cy="0" rx="48" ry="24" fill="#1a120b" stroke="#d4a853" stroke-width="1.4" />
                <ellipse cx="0" cy="0" rx="40" ry="20" fill="#22160e" stroke="#d4a853" stroke-width="0.9" stroke-dasharray="3, 3" />
                <ellipse cx="0" cy="0" rx="30" ry="15" fill="#2b1a10" stroke="#f59e0b" stroke-width="1" />
                <ellipse cx="0" cy="0" rx="16" ry="9" fill="#361f12" stroke="#ffe099" stroke-width="0.8" />
                <!-- Inscription Rays -->
                <g stroke="rgba(255,224,153,0.3)" stroke-width="0.7">
                  <line x1="-46" y1="0" x2="46" y2="0" />
                  <line x1="0" y1="-23" x2="0" y2="23" />
                  <line x1="-32" y1="-16" x2="32" y2="16" />
                  <line x1="-32" y1="16" x2="32" y2="-16" />
                </g>
                <!-- Zodiac Glyphs along rim -->
                <g fill="#ffe099" font-family="'Cinzel', serif" font-size="5" text-anchor="middle" opacity="0.75">
                  <text x="0" y="-17">♈</text>
                  <text x="18" y="-12">♉</text>
                  <text x="32" y="-5">♊</text>
                  <text x="38" y="2">♋</text>
                  <text x="32" y="10">♌</text>
                  <text x="18" y="16">♍</text>
                  <text x="0" y="19">♎</text>
                  <text x="-18" y="16">♏</text>
                  <text x="-32" y="10">♐</text>
                  <text x="-38" y="2">♑</text>
                  <text x="-32" y="-5">♒</text>
                  <text x="-18" y="-12">♓</text>
                </g>
                <circle cx="0" cy="0" r="3" fill="#ffe099" />
              </g>

              <!-- Sandstone Mesas Framing Station 07 (750, 360) -->
              <g fill="#241108" stroke="#b45309" stroke-width="1.1">
                <polygon points="705,410 720,360 790,360 805,410" />
                <line x1="720" y1="360" x2="790" y2="360" stroke="#f59e0b" stroke-width="1.4" />
              </g>

              <!-- The Subterranean Bunker Portal & 3 Sacred Tuning Obelisks (Station 07 at 750, 360) -->
              <g transform="translate(750, 360)">
                <rect x="-14" y="-18" width="28" height="22" rx="2" fill="#100602" stroke="#d4a853" stroke-width="1.2" />
                <path d="M -9 4 L -9 -10 Q 0 -16 9 -10 L 9 4 Z" fill="#050201" stroke="#f59e0b" stroke-width="0.9" />
                <line x1="-9" y1="-4" x2="9" y2="-4" stroke="#d4a853" stroke-width="1.4" />
                <!-- Obelisks -->
                <polygon points="-26,4 -23,-24 -19,-24 -16,4" fill="#241006" stroke="#d97706" stroke-width="0.9" />
                <circle cx="-21" cy="-28" r="3" fill="#f59e0b" />
                <polygon points="-4,4 -2,-28 2,-28 4,4" fill="#241006" stroke="#d97706" stroke-width="0.9" />
                <path d="M -2 -30 A 3 3 0 1 0 2 -33 A 4 4 0 0 1 -2 -30" fill="#ffe099" />
                <polygon points="16,4 19,-24 23,-24 26,4" fill="#241006" stroke="#d97706" stroke-width="0.9" />
                <circle cx="21" cy="-28" r="3" fill="#f59e0b" />
              </g>

              <!-- Region Banner Ribbon: ARENA PLANISPHAERII -->
              <text x="510" y="525" fill="#ffe099" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">ARENA PLANISPHAERII // VALLIS UMBRARUM</text>

              <!-- =============================================================
                   ZONE 4: THE SHIFTING TEMPEST & VEGA COLLIMATOR (UPPER CENTER)
                   ============================================================= -->
              <g fill="none">
                <!-- Swirling Wind Vortex Isobars -->
                <path d="M 505 190 Q 575 155 645 175 T 705 220" stroke="rgba(245,158,11,0.36)" stroke-width="1.5" stroke-dasharray="5, 6" />
                <path d="M 500 250 Q 585 210 665 230 T 715 280" stroke="rgba(245,158,11,0.40)" stroke-width="1.6" stroke-dasharray="7, 5" />

                <!-- Driving Gale Squall Lines -->
                <g class="storm-gale-squall" stroke="rgba(251,191,36,0.3)" stroke-width="0.9" stroke-linecap="round">
                  <line x1="525" y1="180" x2="510" y2="205" stroke-dasharray="7, 6" />
                  <line x1="605" y1="160" x2="590" y2="185" stroke-dasharray="6, 5" />
                  <line x1="545" y1="240" x2="530" y2="265" stroke-dasharray="7, 5" />
                  <line x1="625" y1="250" x2="610" y2="275" stroke-dasharray="6, 6" />
                </g>

                <!-- Electrostatic Lightning Bolts -->
                <polyline class="storm-lightning-bolt" points="525,140 540,175 530,195 553,235 545,260 567,290" stroke="#fef08a" stroke-width="2.2" filter="drop-shadow(0 0 10px #f59e0b)" />
                <circle cx="553" cy="235" r="2" fill="#ffffff" filter="drop-shadow(0 0 5px #f59e0b)" />

                <polyline class="storm-lightning-bolt fast" points="685,130 670,165 683,185 660,220 670,240 653,270" stroke="#fbbf24" stroke-width="2" filter="drop-shadow(0 0 10px #f59e0b)" />
                <circle cx="660" cy="220" r="2" fill="#ffffff" filter="drop-shadow(0 0 5px #f59e0b)" />

                <!-- Vega 97° Collimator Optical Sightline (Ray beaming from Vega to Station 08 at 580, 230) -->
                <line x1="840" y1="75" x2="580" y2="230" stroke="rgba(251,191,36,0.45)" stroke-width="0.9" stroke-dasharray="2, 4" />
                <circle cx="840" cy="75" r="3" fill="#ffe099" opacity="0.75" />
                <text x="690" y="145" fill="rgba(251,191,36,0.6)" font-family="'JetBrains Mono', monospace" font-size="6.5" letter-spacing="0.08em">VEGA 97° COLLIMATOR</text>

                <!-- Station 08 Electrostatic Surge Rings at (580, 230) -->
                <circle cx="580" cy="230" r="38" stroke="rgba(245,158,11,0.50)" stroke-width="1.6" stroke-dasharray="4, 5" />
                <circle class="storm-pulse-ring" cx="580" cy="230" r="50" stroke="#f59e0b" fill="none" stroke-dasharray="3, 4" />

                <!-- Tempest Sector Banner -->
                <text x="580" y="300" fill="#fbbf24" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle" filter="drop-shadow(0 0 6px rgba(245,158,11,0.6))">⚡ THE SHIFTING TEMPEST · 142.85 MHz ⚡</text>
                <text x="580" y="312" fill="rgba(253,230,138,0.7)" font-family="'Cinzel', serif" font-size="6.5" letter-spacing="0.12em" text-anchor="middle">ELECTROSTATIC BLACKOUT ZONE · GALE VORTEX</text>
              </g>

              <!-- =============================================================
                   ZONE 5: THE GREAT ERG & DESERT FRONTIER GATE (SUMMIT / UPPER RIGHT)
                   ============================================================= -->
              <!-- Graceful Sand Dune Crests (Natural curves, no harsh boxes) -->
              <g fill="none" stroke-linecap="round">
                <path d="M 670 150 Q 740 105 820 125 T 910 105" stroke="rgba(245,158,11,0.4)" stroke-width="1.4" stroke-dasharray="4, 4" />
                <path d="M 700 175 Q 770 125 845 145 T 915 125" stroke="rgba(245,158,11,0.55)" stroke-width="1.6" />
                <path d="M 730 200 Q 800 145 870 165 T 920 145" stroke="#f59e0b" stroke-width="1.8" filter="drop-shadow(0 0 6px rgba(245,158,11,0.5))" />
              </g>

              <!-- Desert Palm Oasis Grove & Spring Pool at (980, 180) -->
              <g transform="translate(980, 180)">
                <ellipse cx="0" cy="18" rx="15" ry="5" fill="#08283a" stroke="#38bdf8" stroke-width="0.8" />
                <path d="M -7 18 Q -10 6 -5 -6" stroke="#78350f" stroke-width="2" fill="none" />
                <path d="M -5 -6 Q -14 -12 -18 -8 M -5 -6 Q -10 -16 -8 -18 M -5 -6 Q 0 -18 5 -16 M -5 -6 Q 7 -12 10 -6" stroke="#22c55e" stroke-width="1.1" fill="none" />
                <path d="M 5 18 Q 2 6 7 -3" stroke="#78350f" stroke-width="1.8" fill="none" />
                <path d="M 7 -3 Q -1 -8 -6 -5 M 7 -3 Q 2 -14 4 -15 M 7 -3 Q 12 -14 17 -12 M 7 -3 Q 18 -7 20 -2" stroke="#16a34a" stroke-width="1" fill="none" />
              </g>

              <!-- Ancient Sandstone Obelisks flanking Desert Gate (Station 09 at 810, 140) -->
              <g fill="#291206" stroke="#b45309" stroke-width="1.2">
                <!-- Left Obelisk -->
                <polygon points="780,180 785,85 791,85 796,180" />
                <polygon points="785,85 788,73 791,85" fill="#d97706" />
                <line x1="788" y1="90" x2="788" y2="175" stroke="rgba(245,158,11,0.5)" stroke-width="0.8" />
                <!-- Right Obelisk -->
                <polygon points="825,180 830,85 836,85 841,180" />
                <polygon points="830,85 833,73 836,85" fill="#d97706" />
                <line x1="833" y1="90" x2="833" y2="175" stroke="rgba(245,158,11,0.5)" stroke-width="0.8" />
              </g>

              <!-- Desert Portal Arch framing Station 09 -->
              <path d="M 791 180 L 791 125 Q 810 85 830 125 L 830 180" fill="none" stroke="rgba(217,119,6,0.5)" stroke-width="2" stroke-dasharray="4, 4" />
              <path d="M 796 180 L 796 132 Q 810 94 825 132 L 825 180" fill="none" stroke="rgba(245,158,11,0.3)" stroke-width="1" />

              <!-- Inscriptions at Desert Threshold -->
              <text x="810" y="82" fill="#fde68a" font-family="'Cinzel Decorative', 'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">✦ DESERTI LIMEN ✦</text>

              <!-- =============================================================
                   RENAISSANCE WIND ROSE & NAUTICAL RHUMB LINES (ROSA DE LOS VIENTOS)
                   ============================================================= -->
              <g stroke="rgba(212,168,83,0.08)" stroke-width="0.75" stroke-dasharray="3, 8" fill="none">
                <line x1="90" y1="990" x2="90" y2="28" />
                <line x1="90" y1="990" x2="1080" y2="990" />
                <line x1="90" y1="990" x2="880" y2="28" />
                <line x1="90" y1="990" x2="1080" y2="400" />
                <line x1="90" y1="990" x2="1080" y2="700" />
              </g>

              <g transform="translate(90, 990)" opacity="0.65">
                <circle cx="0" cy="0" r="28" fill="#080e1c" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <circle cx="0" cy="0" r="21" fill="none" stroke="rgba(212,168,83,0.25)" stroke-dasharray="2, 4" />
                <polygon points="0,-28 4,-8 0,0 -4,-8" fill="#d4a853" />
                <polygon points="0,28 4,8 0,0 -4,8" fill="rgba(212,168,83,0.6)" />
                <polygon points="28,0 8,4 0,0 8,-4" fill="rgba(212,168,83,0.6)" />
                <polygon points="-28,0 -8,4 0,0 -8,-4" fill="rgba(212,168,83,0.6)" />
                <polygon points="19,-19 7,-4 0,0 4,-7" fill="rgba(212,168,83,0.35)" />
                <polygon points="-19,-19 -4,-7 0,0 -7,-4" fill="rgba(212,168,83,0.35)" />
                <polygon points="19,19 4,7 0,0 7,4" fill="rgba(212,168,83,0.35)" />
                <polygon points="-19,19 -7,4 0,0 -4,7" fill="rgba(212,168,83,0.35)" />
                <text x="0" y="-31" fill="#f59e0b" font-family="'Cinzel', serif" font-size="7.5" font-weight="700" text-anchor="middle">N</text>
                <text x="33" y="3" fill="rgba(212,168,83,0.6)" font-family="'Cinzel', serif" font-size="6.5" font-weight="700" text-anchor="middle">E</text>
                <text x="0" y="37" fill="rgba(212,168,83,0.6)" font-family="'Cinzel', serif" font-size="6.5" font-weight="700" text-anchor="middle">S</text>
                <text x="-33" y="3" fill="rgba(212,168,83,0.6)" font-family="'Cinzel', serif" font-size="6.5" font-weight="700" text-anchor="middle">O</text>
                <circle cx="0" cy="0" r="2.5" fill="#ffe099" />
              </g>

              <!-- =============================================================
                   THE EXPEDITION TRAIL ROADWAY (SERPENTINE ASCENDING ROUTE)
                   ============================================================= -->
              <!-- Outer Roadway Casing -->
              <path fill="none" class="expedition-road-casing" d="M 200 970 C 272.0 941.2, 327.3 917.0, 400 890 C 482.2 859.4, 602.3 893.2, 630 810 C 653.5 739.6, 528.8 725.3, 470 680 C 402.7 628.1, 266.0 623.8, 280 540 C 294.8 450.9, 425.7 472.3, 510 440 C 595.0 407.4, 721.2 446.4, 750 360 C 774.4 286.9, 559.7 304.3, 580 230 C 603.4 144.2, 727.7 173.6, 810 140" />
              <!-- Center Roadway Dashed Track -->
              <path fill="none" class="expedition-road-core" d="M 200 970 C 272.0 941.2, 327.3 917.0, 400 890 C 482.2 859.4, 602.3 893.2, 630 810 C 653.5 739.6, 528.8 725.3, 470 680 C 402.7 628.1, 266.0 623.8, 280 540 C 294.8 450.9, 425.7 472.3, 510 440 C 595.0 407.4, 721.2 446.4, 750 360 C 774.4 286.9, 559.7 304.3, 580 230 C 603.4 144.2, 727.7 173.6, 810 140" />

              <!-- Waypoint Footstep Marks between stations (Evenly distributed along spline) -->
              <g fill="rgba(245,158,11,0.4)">
                <!-- 1 -> 2 -->
                <circle cx="251.4" cy="949.1" r="1.5" />
                <circle cx="299.7" cy="929.3" r="1.5" />
                <circle cx="348.2" cy="909.8" r="1.5" />
                <!-- 2 -> 3 -->
                <circle cx="466.7" cy="876.3" r="1.5" />
                <circle cx="535.4" cy="869.7" r="1.5" />
                <circle cx="593.9" cy="853.3" r="1.5" />
                <!-- 3 -> 4 -->
                <circle cx="623.2" cy="766.4" r="1.5" />
                <circle cx="580.9" cy="735.6" r="1.5" />
                <circle cx="523.1" cy="709.5" r="1.5" />
                <!-- 4 -> 5 -->
                <circle cx="410.0" cy="648.0" r="1.5" />
                <circle cx="344.5" cy="622.0" r="1.5" />
                <circle cx="294.3" cy="589.9" r="1.5" />
                <!-- 5 -> 6 -->
                <circle cx="310.3" cy="491.3" r="1.5" />
                <circle cx="368.9" cy="468.7" r="1.5" />
                <circle cx="440.6" cy="456.7" r="1.5" />
                <!-- 6 -> 7 -->
                <circle cx="579.3" cy="425.9" r="1.5" />
                <circle cx="651.1" cy="420.2" r="1.5" />
                <circle cx="712.3" cy="404.4" r="1.5" />
                <!-- 7 -> 8 -->
                <circle cx="730.9" cy="319.3" r="1.5" />
                <circle cx="666.5" cy="295.4" r="1.5" />
                <circle cx="601.4" cy="271.4" r="1.5" />
                <!-- 8 -> 9 -->
                <circle cx="614.2" cy="184.5" r="1.5" />
                <circle cx="672.9" cy="165.4" r="1.5" />
                <circle cx="742.6" cy="156.2" r="1.5" />
              </g>

              <!-- =============================================================
                   PAST-NARRATIVE ARTIFACT RELIC EMBLEMS (ICONS BESIDE STATIONS)
                   ============================================================= -->
              <!-- Relic 1 (Station 01): Vellum Envelope & Wax Seal XXII:XXII at (135, 970) -->
              <g transform="translate(135, 970)" opacity="0.9">
                <rect x="-14" y="-10" width="28" height="20" rx="2" fill="#181109" stroke="#d4a853" stroke-width="0.9" />
                <polyline points="-14,-10 0,2 14,-10" fill="none" stroke="#d4a853" stroke-width="0.8" />
                <circle cx="0" cy="2" r="4.5" fill="#991b1b" stroke="#7f1d1d" stroke-width="0.6" />
                <text x="0" y="4" fill="#fef08a" font-family="'Cinzel', serif" font-size="4" font-weight="700" text-anchor="middle">XXII</text>
              </g>

              <!-- Relic 2 (Station 02): Cartographer Sextant & Quill at (335, 890) -->
              <g transform="translate(335, 890)" opacity="0.9">
                <path d="M-10,10 L0,-12 L10,10" fill="none" stroke="#d4a853" stroke-width="0.9" />
                <path d="M-12,10 Q0,15 12,10" fill="none" stroke="#d4a853" stroke-width="1.2" />
                <circle cx="0" cy="-12" r="2.5" fill="#ffe099" />
                <line x1="0" y1="-12" x2="3" y2="12" stroke="#4fe3c1" stroke-width="0.8" />
              </g>

              <!-- Relic 3 (Station 03): 8-Petal Mechanical Brass Flower at (695, 810) -->
              <g transform="translate(695, 810)" opacity="0.9">
                <circle cx="0" cy="0" r="11" fill="none" stroke="#d4a853" stroke-width="0.9" />
                <circle cx="0" cy="-5" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="0" cy="5" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="-5" cy="0" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="5" cy="0" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="0" cy="0" r="2.5" fill="#ffe099" />
              </g>

              <!-- Relic 4 (Station 04): Fractured Astrolabe Disc & 22.22 MHz Breach at (470, 620) -->
              <g transform="translate(470, 620)" opacity="0.9">
                <circle cx="0" cy="0" r="12" fill="none" stroke="#991b1b" stroke-width="1" stroke-dasharray="3, 3" />
                <path d="M-7,-7 L-2,0 L-6,7" stroke="#ef4444" stroke-width="1.2" fill="none" />
                <path d="M3,-9 L1,2 L6,9" stroke="#ef4444" stroke-width="1.2" fill="none" />
                <circle cx="0" cy="0" r="2" fill="#f87171" />
                <text x="0" y="18" fill="#f87171" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">22.22 MHz</text>
              </g>

              <!-- Relic 5 (Station 05): Radio Shortwave Dipole Tower & 19.84 MHz at (280, 585) -->
              <g transform="translate(280, 585)" opacity="0.9">
                <polygon points="0,-12 -5,10 5,10" fill="none" stroke="#4fe3c1" stroke-width="0.9" />
                <line x1="-10" y1="-12" x2="10" y2="-12" stroke="#4fe3c1" stroke-width="1.2" />
                <circle cx="0" cy="-12" r="2" fill="#4fe3c1" />
                <path d="M-8,-17 Q0,-21 8,-17" stroke="#4fe3c1" stroke-width="0.8" fill="none" opacity="0.7" />
                <text x="0" y="20" fill="#4fe3c1" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">19.84 MHz</text>
              </g>

              <!-- Relic 6 (Station 06): 16-Division Planisphere Wheel & 142.85 MHz at (510, 380) -->
              <g transform="translate(510, 380)" opacity="0.9">
                <circle cx="0" cy="0" r="13" fill="none" stroke="#d4a853" stroke-width="1" />
                <circle cx="0" cy="0" r="7" fill="none" stroke="#4fe3c1" stroke-width="0.7" stroke-dasharray="2, 3" />
                <line x1="-13" y1="0" x2="13" y2="0" stroke="#d4a853" stroke-width="0.8" />
                <line x1="0" y1="-13" x2="0" y2="13" stroke="#d4a853" stroke-width="0.8" />
                <circle cx="0" cy="0" r="2" fill="#ffe099" />
                <text x="0" y="20" fill="#d4a853" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">142.85 MHz</text>
              </g>

              <!-- Relic 7 (Station 07): The 7 Zodiacal Dials & Sandstone Outpost at (820, 340) -->
              <g transform="translate(820, 340)" opacity="0.92">
                <rect x="-11" y="-13" width="22" height="26" rx="2" fill="#201107" stroke="#d4a853" stroke-width="1" />
                <circle cx="0" cy="-5" r="4.5" fill="none" stroke="#f59e0b" stroke-width="0.8" />
                <circle cx="0" cy="5" r="3.5" fill="none" stroke="#f59e0b" stroke-width="0.8" />
                <text x="0" y="-3" fill="#fde68a" font-family="'Cinzel', serif" font-size="4.5" text-anchor="middle">♈</text>
                <text x="0" y="7" fill="#fde68a" font-family="'Cinzel', serif" font-size="4.5" text-anchor="middle">♎</text>
              </g>

              <!-- Relic 8 (Station 08): Vega 97° Collimation Ray & Axis at (645, 230) -->
              <g transform="translate(645, 230)" opacity="0.95">
                <circle cx="0" cy="0" r="14" fill="none" stroke="#f59e0b" stroke-width="1.2" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2, 2" />
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2, 2" />
                <polygon points="0,-11 3,0 0,2 -3,0" fill="#fef08a" />
                <text x="0" y="22" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="700" text-anchor="middle">2090 LY · 97°</text>
              </g>

              <!-- Relic 9 (Station 09): The Celestial Cipher Dial at (870, 130) -->
              <g transform="translate(870, 130)" opacity="0.95">
                <circle cx="0" cy="0" r="15" fill="#1e0c04" stroke="#f59e0b" stroke-width="1.2" />
                <circle cx="0" cy="0" r="9" fill="none" stroke="#fde68a" stroke-width="0.8" stroke-dasharray="2, 4" />
                <text x="0" y="3" fill="#fde68a" font-family="'Cinzel', serif" font-size="6.5" font-weight="700" text-anchor="middle">XII</text>
                <path d="M -16 4 Q 0 -2 16 6 L 16 16 L -16 16 Z" fill="#3c1908" stroke="#d97706" stroke-width="1" />
              </g>

              <!-- =============================================================
                   INTERACTIVE CONSTELLATION FILAMENTS (SMOOTH SERPENTINE ASCENT)
                   ============================================================= -->
              <!-- 1 -> 2 (Ascending Mountain Pass to Cartographer Terrace) -->
              <path fill="none" class="constellation-filament lit" id="path-1-2" d="M 200 970 C 272.0 941.2, 327.3 917.0, 400 890" />
              <!-- 2 -> 3 (Gentle rounded curve into Sheltered Alpine Pine Hollow) -->
              <path fill="none" class="constellation-filament lit" id="path-2-3" d="M 400 890 C 482.2 859.4, 602.3 893.2, 630 810" />
              <!-- 3 -> 4 (Smooth sweeping climb towards Broken Aqueduct Bridgehead) -->
              <path fill="none" class="constellation-filament lit" id="path-3-4" d="M 630 810 C 653.5 739.6, 528.8 725.3, 470 680" />
              <!-- 4 -> 5 (Traversing aqueduct deck & gorge to Radio Needle Spire) -->
              <path fill="none" class="constellation-filament lit" id="path-4-5" d="M 470 680 C 402.7 628.1, 266.0 623.8, 280 540" />
              <!-- 5 -> 6 (Silky smooth curve into Sunken Planisphere Arena) -->
              <path fill="none" class="constellation-filament lit" id="path-5-6" d="M 280 540 C 294.8 450.9, 425.7 472.3, 510 440" />
              <!-- 6 -> 7 (Graceful climb up onto Sandstone Terraces & Outpost) -->
              <path fill="none" id="filament-6-7" class="constellation-filament lit" d="M 510 440 C 595.0 407.4, 721.2 446.4, 750 360" />
              <!-- 7 -> 8 (Ascending into Tempest Mesa & Vega Beam Strike) -->
              <path fill="none" id="filament-7-8" class="constellation-filament lit" d="M 750 360 C 774.4 286.9, 559.7 304.3, 580 230" />
              <!-- 8 -> 9 (Soft curve through Deep Dunes to Desert Gate) -->
              <path fill="none" id="filament-8-9" class="constellation-filament" d="M 580 230 C 603.4 144.2, 727.7 173.6, 810 140" style="display:none;" />
              <!-- Future Fading Filament trailing towards the Desert Frontier -->
              <path fill="none" id="filament-future-fade" class="constellation-filament-fading" d="M 580 230 C 603.4 144.2, 727.7 173.6, 810 140" stroke="url(#futureFadeGrad)" stroke-width="2" stroke-dasharray="3, 6" />
              <!-- Desert Trail beyond Station 09 ascending into Upper Celestial Canopy -->
              <path fill="none" d="M 810 140 C 864.5 117.8, 906.0 98.4, 960 75" stroke="url(#futureFadeGrad)" stroke-width="2.2" stroke-dasharray="4, 5" />

              <!-- =============================================================
                   THE 9 INTERACTIVE STAR NODES (BALANCED & HARMONIOUS ASCENT)
                   ============================================================= -->
              <!-- STAR NODE 1: The Opening Summons (Valley Gate Foothills) -->
              <g class="map-node-trigger" data-node="1">
                <circle class="node-outer-gear" cx="200" cy="970" r="26" />
                <circle class="node-orbit-ring" cx="200" cy="970" r="20" />
                <circle cx="200" cy="970" r="14" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="200" cy="970" r="8" />
                <text class="node-tag-svg" x="200" y="1006" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">01 · ORIGIN ✓</text>
                <text class="node-title-svg" x="200" y="1020" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">The Threshold</text>
              </g>

              <!-- STAR NODE 2: Cartographer Arrival (High Alpine Terrace) -->
              <g class="map-node-trigger" data-node="2">
                <circle class="node-outer-gear" cx="400" cy="890" r="26" />
                <circle class="node-orbit-ring" cx="400" cy="890" r="20" />
                <circle cx="400" cy="890" r="14" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="400" cy="890" r="8" />
                <text class="node-tag-svg" x="400" y="926" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">02 · RECEIVED ✓</text>
                <text class="node-title-svg" x="400" y="940" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Cartographer Arrival</text>
              </g>

              <!-- STAR NODE 3: The Celestial Flower (Protected Alpine Pine Hollow) -->
              <g class="map-node-trigger" data-node="3">
                <circle class="node-outer-gear" cx="630" cy="810" r="28" />
                <circle class="node-orbit-ring" cx="630" cy="810" r="22" />
                <circle cx="630" cy="810" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="630" cy="810" r="9" />
                <text class="node-tag-svg" x="630" y="776" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">03 · HARMONIZED ✓</text>
                <text class="node-title-svg" x="630" y="762" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Celestial Flower</text>
              </g>

              <!-- STAR NODE 4: Observatory Raid (Broken Aqueduct Western Bridgehead) -->
              <g class="map-node-trigger" data-node="4">
                <circle class="node-outer-gear" cx="470" cy="680" r="28" />
                <circle class="node-orbit-ring" cx="470" cy="680" r="22" />
                <circle cx="470" cy="680" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="470" cy="680" r="9" />
                <text class="node-tag-svg" x="470" y="716" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">04 · ARCHIVED ✓</text>
                <text class="node-title-svg" x="470" y="730" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Observatory Raid</text>
              </g>

              <!-- STAR NODE 5: Emergency Radio Relay (Canyon Rock Needle Pinnacle) -->
              <g class="map-node-trigger" data-node="5">
                <circle class="node-outer-gear" cx="280" cy="540" r="28" />
                <circle class="node-orbit-ring" cx="280" cy="540" r="22" />
                <circle cx="280" cy="540" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="280" cy="540" r="9" />
                <text class="node-tag-svg" x="280" y="506" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">05 · RECEIVED ✓</text>
                <text class="node-title-svg" x="280" y="492" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Radio Relay</text>
              </g>

              <!-- STAR NODE 6: The Celestial Matrix (Sunken Planisphere Arena) -->
              <g class="map-node-trigger" data-node="6">
                <circle class="node-outer-gear" cx="510" cy="440" r="28" />
                <circle class="node-orbit-ring" cx="510" cy="440" r="22" />
                <circle cx="510" cy="440" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle id="node-6-dot" class="node-dot-completed" cx="510" cy="440" r="9" />
                <text class="node-tag-svg" id="node-6-tag" x="510" y="480" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">06 · CALIBRATED ✓</text>
                <text class="node-title-svg" id="node-6-title" x="510" y="494" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Celestial Matrix</text>
              </g>

              <!-- STAR NODE 7: The Zodiac Engine (Subterranean Sandstone Outpost) -->
              <g class="map-node-trigger" data-node="7" style="cursor: pointer;">
                <circle class="node-outer-gear" cx="750" cy="360" r="28" />
                <circle class="node-orbit-ring" cx="750" cy="360" r="22" />
                <circle cx="750" cy="360" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle id="node-7-dot" class="node-dot-completed" cx="750" cy="360" r="9" />
                <circle class="active-beacon-pulse" id="node-7-beacon" cx="750" cy="360" r="14" style="display: none;" />
                <text class="node-tag-svg" id="node-7-tag" x="750" y="396" style="fill:var(--brass-bright); font-weight:700;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">07 · SECURED ✓</text>
                <text class="node-title-svg" id="node-7-title" x="750" y="410" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">The Zodiac Engine</text>
              </g>

              <!-- STAR NODE 8: The Midnight Calibration (ACTIVE OBJECTIVE · Tempest Mesa) -->
              <g class="map-node-trigger" data-node="8" style="cursor: pointer;">
                <g transform="translate(580, 230)">
                  <!-- Expanding Amber Beacon Wave -->
                  <circle class="active-beacon-pulse" id="node-8-beacon" cx="0" cy="0" r="14" style="stroke: #e2b069; display: block;" />
                  <!-- Amber Glow & Active Dot Marker -->
                  <circle id="node-8-glow" cx="0" cy="0" r="22" fill="url(#starGlowAmber)" opacity="0.85" />
                  <circle class="node-orbit-ring" cx="0" cy="0" r="18" stroke-dasharray="3, 3" />
                  <circle id="node-8-dot" class="node-dot-active" cx="0" cy="0" r="11" />
                  <text id="node-8-icon" x="0" y="4" text-anchor="middle" font-family="'Cinzel', serif" font-size="10" font-weight="700" fill="#ffffff" opacity="0.95">⏳</text>
                </g>
                <text class="node-tag-svg" id="node-8-tag" x="580" y="196" style="fill:#e2b069; font-weight:700; opacity:1;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">08 · ACTIVE OBJECTIVE ⏳</text>
                <text class="node-title-svg" id="node-8-title" x="580" y="182" style="opacity:1;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">[ Sealed ]</text>
              </g>

              <!-- STAR NODE 9: The Celestial Cipher (Finale of Constellation Path · Desert Gate) -->
              <g class="map-node-trigger" id="map-node-9" data-node="9" style="display:none; cursor:pointer;">
                <circle class="node-outer-gear" cx="810" cy="140" r="26" opacity="0.7" stroke="#ea580c" />
                <circle class="node-orbit-ring" cx="810" cy="140" r="20" stroke-dasharray="2, 5" opacity="0.6" stroke="#f59e0b" />
                <circle cx="810" cy="140" r="14" fill="url(#starGlowAmber)" opacity="0.7" />
                <circle class="node-dot-active" cx="810" cy="140" r="9" fill="#ea580c" />
                <text class="node-tag-svg" x="810" y="176" style="fill:#fde68a; font-weight:700;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">09 · CONSTELLATION FINALE ✦</text>
                <text class="node-title-svg" x="810" y="190" style="fill:#ffffff; font-weight:600;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">The Celestial Cipher</text>
              </g>
            </svg>'''

file_path = os.path.join(ROOT, "web/index.html")
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'<svg id="trail-svg-map"[^>]*>.*?</svg>', re.DOTALL)
match = pattern.search(content)
if not match:
    print("ERROR: Could not find <svg id=\"trail-svg-map\" ... </svg>")
    exit(1)

new_content = content[:match.start()] + new_svg.strip() + content[match.end():]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("SUCCESS: Ascending Serpentine SVG written to", file_path)
