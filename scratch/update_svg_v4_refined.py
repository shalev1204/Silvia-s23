import re
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

new_svg = '''            <svg id="trail-svg-map" viewBox="0 0 1120 800">
              <defs>
                <!-- Panoramic Atmospheric Gradient (West Alpine Night -> Center Twilight Canyon -> East Storm & Desert) -->
                <linearGradient id="panoramicMapBg" x1="0%" y1="20%" x2="100%" y2="80%">
                  <stop offset="0%" stop-color="#040918" />
                  <stop offset="22%" stop-color="#08142a" />
                  <stop offset="42%" stop-color="#111022" />
                  <stop offset="64%" stop-color="#1e111a" />
                  <stop offset="82%" stop-color="#2a140b" />
                  <stop offset="100%" stop-color="#341708" />
                </linearGradient>

                <!-- Full-Canvas Regional Atmospheric Halos (Soft, No Hard Edges) -->
                <radialGradient id="glowObservatory" cx="22%" cy="70%" r="32%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.14" />
                  <stop offset="50%" stop-color="#ffe099" stop-opacity="0.05" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowChasm" cx="44%" cy="60%" r="28%">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.10" />
                  <stop offset="55%" stop-color="#1e293b" stop-opacity="0.04" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowPlanisphere" cx="64%" cy="56%" r="26%">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.16" />
                  <stop offset="50%" stop-color="#d97706" stop-opacity="0.07" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowTempest" cx="82%" cy="32%" r="30%">
                  <stop offset="0%" stop-color="#ea580c" stop-opacity="0.24" />
                  <stop offset="45%" stop-color="#fbbf24" stop-opacity="0.14" />
                  <stop offset="70%" stop-color="#3b0764" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="tempestVortexDark" cx="82%" cy="32%" r="24%">
                  <stop offset="0%" stop-color="#1c0717" stop-opacity="0.65" />
                  <stop offset="60%" stop-color="#120410" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="transparent" stop-opacity="0" />
                </radialGradient>

                <radialGradient id="glowDesertDunes" cx="92%" cy="18%" r="32%">
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
              <rect x="0" y="0" width="1120" height="800" fill="url(#panoramicMapBg)" pointer-events="none" />

              <!-- Regional Atmospheric Auras (Full-canvas blend, zero sharp seams) -->
              <rect x="0" y="0" width="1120" height="800" fill="url(#glowObservatory)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="800" fill="url(#glowChasm)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="800" fill="url(#glowPlanisphere)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="800" fill="url(#glowTempest)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="800" fill="url(#tempestVortexDark)" pointer-events="none" />
              <rect x="0" y="0" width="1120" height="800" fill="url(#glowDesertDunes)" pointer-events="none" />

              <!-- =============================================================
                   CARTOGRAPHIC BORDER GRADUATIONS & MARGIN RULERS
                   ============================================================= -->
              <!-- Outer Framework Borders -->
              <g stroke="rgba(212,168,83,0.32)" stroke-width="1.2" fill="none">
                <rect x="24" y="22" width="1072" height="756" />
                <rect x="30" y="28" width="1060" height="744" stroke-dasharray="3, 5" stroke-opacity="0.4" />
              </g>

              <!-- Corner Rosettes & Renaissance Scrollwork -->
              <g fill="none" stroke="rgba(212,168,83,0.55)" stroke-width="1.2">
                <circle cx="27" cy="25" r="4.5" fill="#140f1a" />
                <circle cx="27" cy="25" r="2" fill="#ffe099" />
                <circle cx="1093" cy="25" r="4.5" fill="#140f1a" />
                <circle cx="1093" cy="25" r="2" fill="#ffe099" />
                <circle cx="27" cy="775" r="4.5" fill="#140f1a" />
                <circle cx="27" cy="775" r="2" fill="#ffe099" />
                <circle cx="1093" cy="775" r="4.5" fill="#140f1a" />
                <circle cx="1093" cy="775" r="2" fill="#ffe099" />
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
                <line x1="80" y1="772" x2="80" y2="778" stroke="rgba(212,168,83,0.5)" stroke-width="1.2" />
                <text x="80" y="788">0h</text>
                <line x1="300" y1="772" x2="300" y2="778" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="300" y="788">IV h</text>
                <line x1="560" y1="772" x2="560" y2="780" stroke="#f59e0b" stroke-width="1.6" />
                <text x="560" y="790" fill="#f59e0b" font-weight="700">XII h</text>
                <line x1="820" y1="772" x2="820" y2="778" stroke="rgba(212,168,83,0.4)" stroke-width="1" />
                <text x="820" y="788">XVIII h</text>
                <line x1="1040" y1="772" x2="1040" y2="778" stroke="rgba(234,88,12,0.6)" stroke-width="1.2" />
                <text x="1040" y="788" fill="#ea580c">XXIV h</text>
              </g>

              <!-- Left & Right Flank Graduations (Latitude Degrees) -->
              <g fill="rgba(212,168,83,0.45)" font-family="'JetBrains Mono', monospace" font-size="8">
                <!-- Left Flank -->
                <line x1="24" y1="80" x2="30" y2="80" stroke="rgba(212,168,83,0.6)" stroke-width="1.2" />
                <text x="18" y="83" text-anchor="end">+80° N</text>
                <line x1="24" y1="240" x2="30" y2="240" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="18" y="243" text-anchor="end">+50°</text>
                <line x1="24" y1="420" x2="30" y2="420" stroke="#f59e0b" stroke-width="1.6" />
                <text x="18" y="423" text-anchor="end" fill="#f59e0b" font-weight="700">0° EQ</text>
                <line x1="24" y1="580" x2="30" y2="580" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="18" y="583" text-anchor="end">-40°</text>
                <line x1="24" y1="720" x2="30" y2="720" stroke="rgba(234,88,12,0.6)" stroke-width="1.2" />
                <text x="18" y="723" text-anchor="end" fill="#ea580c">-80° S</text>

                <!-- Right Flank -->
                <line x1="1090" y1="80" x2="1096" y2="80" stroke="rgba(212,168,83,0.6)" stroke-width="1.2" />
                <text x="1102" y="83" text-anchor="start">+80° N</text>
                <line x1="1090" y1="240" x2="1096" y2="240" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="1102" y="243" text-anchor="start">+50°</text>
                <line x1="1090" y1="420" x2="1096" y2="420" stroke="#f59e0b" stroke-width="1.6" />
                <text x="1102" y="423" text-anchor="start" fill="#f59e0b" font-weight="700">0° EQ</text>
                <line x1="1090" y1="580" x2="1096" y2="580" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <text x="1102" y="583" text-anchor="start">-40°</text>
                <line x1="1090" y1="720" x2="1096" y2="720" stroke="rgba(234,88,12,0.6)" stroke-width="1.2" />
                <text x="1102" y="723" text-anchor="start" fill="#ea580c">-80° S</text>
              </g>

              <!-- Top & Bottom Master Cartouche Ribbons -->
              <text x="560" y="44" fill="#ffe099" font-family="'Cinzel Decorative', 'Cinzel', serif" font-size="10" font-weight="700" letter-spacing="0.28em" text-anchor="middle" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.9))">✦ ITER CELESTE · VIA ASTRONOMICA ✦</text>
              <text x="560" y="58" fill="rgba(212,168,83,0.55)" font-family="'Cinzel', serif" font-size="7.5" letter-spacing="0.18em" text-anchor="middle">THE CONSTELLATION OVERWORLD · EXPEDITION TRANSECT</text>

              <text x="560" y="756" fill="rgba(212,168,83,0.65)" font-family="'Cinzel', serif" font-size="8.5" font-weight="700" letter-spacing="0.22em" text-anchor="middle">✦ TRIBUS TURRIBUS CANON // A CUMBRE ALPINO AD ARENAS DESERTI ✦</text>

              <!-- =============================================================
                   CELESTIAL OVERHEAD CANOPY & ASTRONOMICAL CONSTELLATIONS
                   ============================================================= -->
              <!-- Armillary Sphere Coordinate Arcs across Upper Sky -->
              <g stroke="rgba(212,168,83,0.12)" stroke-width="0.8" fill="none">
                <circle cx="560" cy="120" r="440" stroke-dasharray="2, 6" />
                <circle cx="560" cy="120" r="300" stroke-dasharray="4, 4" />
                <circle cx="560" cy="120" r="170" />
                <ellipse cx="560" cy="120" rx="390" ry="90" stroke-dasharray="3, 5" />
                <line x1="120" y1="120" x2="1000" y2="120" stroke-dasharray="3, 5" stroke-opacity="0.2" />
                <line x1="560" y1="30" x2="560" y2="280" stroke-dasharray="3, 5" stroke-opacity="0.2" />
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

                <!-- Aquila & Altair -->
                <polyline points="655,130 680,145 705,135" />
                <circle cx="680" cy="145" r="2.5" fill="#ffe099" />
                <text x="680" y="160" fill="rgba(212,168,83,0.5)" font-family="'Cinzel', serif" font-size="7" text-anchor="middle">ALTAIR</text>
              </g>

              <!-- =============================================================
                   ZONE 1: MONTES BOREALES & THE GRAND OBSERVATORY (WEST)
                   ============================================================= -->
              <!-- Distant Alpine Mountain Peaks (Background Layer) -->
              <g fill="#071224" stroke="rgba(212,168,83,0.35)" stroke-width="1.2">
                <polygon points="25,720 70,500 130,720" />
                <polygon points="90,710 180,410 270,710" />
                <polygon points="220,710 290,520 350,710" />
              </g>

              <!-- Mountain Snowcaps -->
              <g fill="rgba(255,224,153,0.18)" stroke="#ffe099" stroke-width="1.2">
                <polygon points="70,500 62,530 70,525 78,535 86,522" />
                <polygon points="180,410 168,455 180,446 192,458 204,442" />
                <polygon points="290,520 282,550 290,544 298,555 306,542" />
              </g>

              <!-- Da Vinci Style Shading & Ridge Lines -->
              <g class="map-terrain-hatching">
                <line x1="180" y1="410" x2="180" y2="710" stroke="rgba(212,168,83,0.4)" stroke-width="1.2" />
                <line x1="165" y1="480" x2="180" y2="495" />
                <line x1="155" y1="510" x2="180" y2="530" />
                <line x1="145" y1="540" x2="180" y2="565" />
                <line x1="195" y1="480" x2="180" y2="495" />
                <line x1="205" y1="510" x2="180" y2="530" />
              </g>

              <!-- Grand Observatory Complex Architecture at Station 2 terrace (240, 590) -->
              <g stroke="#d4a853" stroke-width="1" fill="#0f1b2d">
                <rect x="220" y="530" width="40" height="20" />
                <rect x="225" y="536" width="5" height="10" rx="2.5" fill="#ffe099" opacity="0.8" />
                <rect x="237" y="536" width="5" height="10" rx="2.5" fill="#ffe099" opacity="0.8" />
                <rect x="249" y="536" width="5" height="10" rx="2.5" fill="#ffe099" opacity="0.8" />
                <!-- Copper/Verdigris Observation Dome -->
                <path d="M 218 530 Q 240 504 262 530 Z" fill="#1b3b42" stroke="#4fe3c1" stroke-width="1.1" />
                <!-- Cupola & Armillary Spire -->
                <rect x="237" y="500" width="6" height="6" fill="#d4a853" />
                <line x1="240" y1="500" x2="240" y2="490" stroke="#ffe099" stroke-width="1.2" />
                <circle cx="240" cy="488" r="3" fill="none" stroke="#ffe099" stroke-width="0.8" />
                <!-- Brass Telescope pointing towards Polaris -->
                <line x1="245" y1="525" x2="263" y2="502" stroke="#ffe099" stroke-width="2" stroke-linecap="round" filter="drop-shadow(0 0 4px #ffe099)" />
              </g>

              <!-- Alpine Pine Grove (Around Station 03 at 330, 480) -->
              <g fill="#081e20" stroke="rgba(79,227,193,0.3)" stroke-width="0.8">
                <polygon points="305,520 300,535 310,535" />
                <polygon points="315,510 310,526 320,526" />
                <polygon points="345,520 340,538 350,538" />
                <polygon points="360,510 355,528 365,528" />
              </g>

              <!-- Region Banner Ribbon: MONTES BOREALES -->
              <text x="180" y="385" fill="#ffe099" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">MONTES BOREALES // OBSERVATORIUM ALTI</text>

              <!-- =============================================================
                   ZONE 2: THE WHISPERING CHASM & THE ANCIENT AQUEDUCT (CENTER-WEST)
                   ============================================================= -->
              <!-- Sheer Vertical Gorge Cliffs & Fractured Strata (Da Vinci hatching) -->
              <g stroke="rgba(212,168,83,0.25)" stroke-width="0.9" fill="none">
                <path d="M 385 450 L 390 515 L 382 585 L 395 650" />
                <line x1="365" y1="490" x2="390" y2="490" stroke-dasharray="2, 4" />
                <line x1="360" y1="550" x2="385" y2="550" stroke-dasharray="2, 4" />
                <line x1="370" y1="610" x2="395" y2="610" stroke-dasharray="2, 4" />
                <path d="M 500 430 L 495 500 L 502 570 L 498 640" />
                <line x1="495" y1="480" x2="520" y2="480" stroke-dasharray="2, 4" />
                <line x1="500" y1="540" x2="525" y2="540" stroke-dasharray="2, 4" />
                <line x1="498" y1="600" x2="520" y2="600" stroke-dasharray="2, 4" />
              </g>

              <!-- Cascading Glacial Waterfall in Ravine -->
              <path d="M 445 610 Q 460 560 470 535 L 485 535 Q 475 565 460 610 Z" fill="#061c28" stroke="rgba(56,189,248,0.45)" stroke-width="1.2" />

              <!-- Ancient Multi-Arch Stone Aqueduct (Station 04 Bridgehead at 440, 530) -->
              <g stroke="#d4a853" stroke-width="1" fill="#141424">
                <rect x="390" y="524" width="115" height="6" fill="#1e1828" stroke-width="1.2" />
                <path d="M 395 530 A 5 5 0 0 0 405 530 M 410 530 A 5 5 0 0 0 420 530 M 425 530 A 5 5 0 0 0 435 530 M 440 530 A 5 5 0 0 0 450 530 M 455 530 A 5 5 0 0 0 465 530 M 470 530 A 5 5 0 0 0 480 530 M 485 530 A 5 5 0 0 0 495 530" fill="none" stroke="#d4a853" stroke-width="0.8" />
                <rect x="400" y="534" width="10" height="34" />
                <rect x="435" y="534" width="10" height="34" />
                <rect x="470" y="534" width="10" height="34" />
                <!-- Broken Arch Breach -->
                <path d="M 445 558 Q 452 546 458 554 L 462 560 L 470 534 L 445 534 Z" fill="#0a0a14" stroke="#ef4444" stroke-width="1.2" />
              </g>

              <!-- The Radio Needle Pinnacle (Station 05 Rock Needle Spire at 560, 420) -->
              <g stroke="rgba(212,168,83,0.3)" stroke-width="1">
                <polygon points="554,600 560,400 566,600" fill="#140f1a" />
              </g>

              <!-- Region Banner Ribbon: FRETUM CALAMITAS -->
              <text x="450" y="405" fill="#ffe099" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">FRETUM CALAMITAS // PONS FRACTUS</text>

              <!-- =============================================================
                   ZONE 3: THE SUNKEN PLANISPHERE & SANDSTONE TERRACES (CENTER-EAST)
                   ============================================================= -->
              <!-- The Ancient Sunken Planisphere Arena (Station 06 at 680, 470) -->
              <g transform="translate(680, 470)">
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

              <!-- Sandstone Mesas Framing Station 07 (800, 370) -->
              <g fill="#241108" stroke="#b45309" stroke-width="1.1">
                <polygon points="755,420 770,370 840,370 855,420" />
                <line x1="770" y1="370" x2="840" y2="370" stroke="#f59e0b" stroke-width="1.4" />
              </g>

              <!-- The Subterranean Bunker Portal & 3 Sacred Tuning Obelisks (Station 07 at 800, 370) -->
              <g transform="translate(800, 370)">
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
              <text x="680" y="555" fill="#ffe099" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">ARENA PLANISPHAERII // VALLIS UMBRARUM</text>

              <!-- =============================================================
                   ZONE 4: THE SHIFTING TEMPEST & VEGA COLLIMATOR (EAST)
                   ============================================================= -->
              <g fill="none">
                <!-- Swirling Wind Vortex Isobars -->
                <path d="M 830 220 Q 900 185 970 205 T 1030 250" stroke="rgba(245,158,11,0.36)" stroke-width="1.5" stroke-dasharray="5, 6" />
                <path d="M 825 280 Q 910 240 990 260 T 1040 310" stroke="rgba(245,158,11,0.40)" stroke-width="1.6" stroke-dasharray="7, 5" />

                <!-- Driving Gale Squall Lines -->
                <g class="storm-gale-squall" stroke="rgba(251,191,36,0.3)" stroke-width="0.9" stroke-linecap="round">
                  <line x1="850" y1="210" x2="835" y2="235" stroke-dasharray="7, 6" />
                  <line x1="930" y1="190" x2="915" y2="215" stroke-dasharray="6, 5" />
                  <line x1="870" y1="270" x2="855" y2="295" stroke-dasharray="7, 5" />
                  <line x1="950" y1="280" x2="935" y2="305" stroke-dasharray="6, 6" />
                </g>

                <!-- Electrostatic Lightning Bolts -->
                <polyline class="storm-lightning-bolt" points="850,170 865,205 855,225 878,265 870,290 892,320" stroke="#fef08a" stroke-width="2.2" filter="drop-shadow(0 0 10px #f59e0b)" />
                <circle cx="878" cy="265" r="2" fill="#ffffff" filter="drop-shadow(0 0 5px #f59e0b)" />

                <polyline class="storm-lightning-bolt fast" points="1010,160 995,195 1008,215 985,250 995,270 978,300" stroke="#fbbf24" stroke-width="2" filter="drop-shadow(0 0 10px #f59e0b)" />
                <circle cx="985" cy="250" r="2" fill="#ffffff" filter="drop-shadow(0 0 5px #f59e0b)" />

                <!-- Vega 97° Collimator Optical Sightline (Ray beaming from Vega to Station 08 at 905, 260) -->
                <line x1="840" y1="75" x2="905" y2="260" stroke="rgba(251,191,36,0.45)" stroke-width="0.9" stroke-dasharray="2, 4" />
                <circle cx="840" cy="75" r="3" fill="#ffe099" opacity="0.75" />
                <text x="885" y="170" fill="rgba(251,191,36,0.6)" font-family="'JetBrains Mono', monospace" font-size="6.5" letter-spacing="0.08em">VEGA 97° COLLIMATOR</text>

                <!-- Station 08 Electrostatic Surge Rings at (905, 260) -->
                <circle cx="905" cy="260" r="38" stroke="rgba(245,158,11,0.50)" stroke-width="1.6" stroke-dasharray="4, 5" />
                <circle class="storm-pulse-ring" cx="905" cy="260" r="50" stroke="#f59e0b" fill="none" stroke-dasharray="3, 4" />

                <!-- Tempest Sector Banner (Separated into open space to the right) -->
                <text x="945" y="325" fill="#fbbf24" font-family="'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle" filter="drop-shadow(0 0 6px rgba(245,158,11,0.6))">⚡ THE SHIFTING TEMPEST · 142.85 MHz ⚡</text>
                <text x="945" y="337" fill="rgba(253,230,138,0.7)" font-family="'Cinzel', serif" font-size="6.5" letter-spacing="0.12em" text-anchor="middle">ELECTROSTATIC BLACKOUT ZONE · GALE VORTEX</text>
              </g>

              <!-- =============================================================
                   ZONE 5: THE GREAT ERG & DESERT FRONTIER GATE (FAR EAST / UPPER)
                   ============================================================= -->
              <!-- Graceful Sand Dune Crests (Natural curves, no harsh boxes) -->
              <g fill="none" stroke-linecap="round">
                <path d="M 850 160 Q 920 115 1000 135 T 1090 115" stroke="rgba(245,158,11,0.4)" stroke-width="1.4" stroke-dasharray="4, 4" />
                <path d="M 880 185 Q 950 135 1025 155 T 1095 135" stroke="rgba(245,158,11,0.55)" stroke-width="1.6" />
                <path d="M 910 210 Q 980 155 1050 175 T 1100 155" stroke="#f59e0b" stroke-width="1.8" filter="drop-shadow(0 0 6px rgba(245,158,11,0.5))" />
              </g>

              <!-- Desert Palm Oasis Grove & Spring Pool at (1045, 195) -->
              <g transform="translate(1045, 195)">
                <ellipse cx="0" cy="18" rx="15" ry="5" fill="#08283a" stroke="#38bdf8" stroke-width="0.8" />
                <path d="M -7 18 Q -10 6 -5 -6" stroke="#78350f" stroke-width="2" fill="none" />
                <path d="M -5 -6 Q -14 -12 -18 -8 M -5 -6 Q -10 -16 -8 -18 M -5 -6 Q 0 -18 5 -16 M -5 -6 Q 7 -12 10 -6" stroke="#22c55e" stroke-width="1.1" fill="none" />
                <path d="M 5 18 Q 2 6 7 -3" stroke="#78350f" stroke-width="1.8" fill="none" />
                <path d="M 7 -3 Q -1 -8 -6 -5 M 7 -3 Q 2 -14 4 -15 M 7 -3 Q 12 -14 17 -12 M 7 -3 Q 18 -7 20 -2" stroke="#16a34a" stroke-width="1" fill="none" />
              </g>

              <!-- Ancient Sandstone Obelisks flanking Desert Gate (Station 09 at 995, 150) -->
              <g fill="#291206" stroke="#b45309" stroke-width="1.2">
                <!-- Left Obelisk -->
                <polygon points="965,190 970,95 976,95 981,190" />
                <polygon points="970,95 973,83 976,95" fill="#d97706" />
                <line x1="973" y1="100" x2="973" y2="185" stroke="rgba(245,158,11,0.5)" stroke-width="0.8" />
                <!-- Right Obelisk -->
                <polygon points="1010,190 1015,95 1021,95 1026,190" />
                <polygon points="1015,95 1018,83 1021,95" fill="#d97706" />
                <line x1="1018" y1="100" x2="1018" y2="185" stroke="rgba(245,158,11,0.5)" stroke-width="0.8" />
              </g>

              <!-- Desert Portal Arch framing Station 09 -->
              <path d="M 976 190 L 976 135 Q 995 95 1015 135 L 1015 190" fill="none" stroke="rgba(217,119,6,0.5)" stroke-width="2" stroke-dasharray="4, 4" />
              <path d="M 981 190 L 981 142 Q 995 104 1010 142 L 1010 190" fill="none" stroke="rgba(245,158,11,0.3)" stroke-width="1" />

              <!-- Inscriptions at Desert Threshold -->
              <text x="995" y="92" fill="#fde68a" font-family="'Cinzel Decorative', 'Cinzel', serif" font-size="8" font-weight="700" letter-spacing="0.2em" text-anchor="middle">✦ DESERTI LIMEN ✦</text>

              <!-- =============================================================
                   RENAISSANCE WIND ROSE & NAUTICAL RHUMB LINES (ROSA DE LOS VIENTOS)
                   ============================================================= -->
              <g stroke="rgba(212,168,83,0.08)" stroke-width="0.75" stroke-dasharray="3, 8" fill="none">
                <line x1="75" y1="720" x2="75" y2="28" />
                <line x1="75" y1="720" x2="1080" y2="720" />
                <line x1="75" y1="720" x2="880" y2="28" />
                <line x1="75" y1="720" x2="1080" y2="280" />
                <line x1="75" y1="720" x2="1080" y2="520" />
              </g>

              <g transform="translate(75, 720)" opacity="0.65">
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
                   THE EXPEDITION TRAIL ROADWAY (FLOWING, GENTLE SERPENTINE ROUTE)
                   ============================================================= -->
              <!-- Outer Roadway Casing -->
              <path fill="none" class="expedition-road-casing" d="M 120 660 C 163.2 634.8, 202.0 622.5, 240 590 C 278.8 556.7, 281.0 494.7, 330 480 C 371.7 467.5, 397.9 541.0, 440 530 C 496.7 515.2, 503.1 434.2, 560 420 C 605.4 408.6, 634.2 479.5, 680 470 C 735.1 458.5, 758.9 408.4, 800 370 C 840.0 332.6, 868.7 301.0, 905 260 C 938.9 221.7, 961.0 188.2, 995 150" />
              <!-- Center Roadway Dashed Track -->
              <path fill="none" class="expedition-road-core" d="M 120 660 C 163.2 634.8, 202.0 622.5, 240 590 C 278.8 556.7, 281.0 494.7, 330 480 C 371.7 467.5, 397.9 541.0, 440 530 C 496.7 515.2, 503.1 434.2, 560 420 C 605.4 408.6, 634.2 479.5, 680 470 C 735.1 458.5, 758.9 408.4, 800 370 C 840.0 332.6, 868.7 301.0, 905 260 C 938.9 221.7, 961.0 188.2, 995 150" />

              <!-- Waypoint Footstep Marks between stations (Silky smooth distribution) -->
              <g fill="rgba(245,158,11,0.4)">
                <!-- 1 -> 2 -->
                <circle cx="155" cy="640" r="1.5" />
                <circle cx="190" cy="618" r="1.5" />
                <circle cx="218" cy="600" r="1.5" />
                <!-- 2 -> 3 -->
                <circle cx="265" cy="565" r="1.5" />
                <circle cx="288" cy="530" r="1.5" />
                <circle cx="310" cy="500" r="1.5" />
                <!-- 3 -> 4 -->
                <circle cx="360" cy="485" r="1.5" />
                <circle cx="390" cy="510" r="1.5" />
                <circle cx="418" cy="528" r="1.5" />
                <!-- 4 -> 5 -->
                <circle cx="475" cy="515" r="1.5" />
                <circle cx="510" cy="470" r="1.5" />
                <circle cx="538" cy="438" r="1.5" />
                <!-- 5 -> 6 -->
                <circle cx="595" cy="422" r="1.5" />
                <circle cx="630" cy="450" r="1.5" />
                <circle cx="658" cy="468" r="1.5" />
                <!-- 6 -> 7 -->
                <circle cx="715" cy="455" r="1.5" />
                <circle cx="750" cy="420" r="1.5" />
                <circle cx="778" cy="390" r="1.5" />
                <!-- 7 -> 8 -->
                <circle cx="832" cy="340" r="1.5" />
                <circle cx="862" cy="305" r="1.5" />
                <circle cx="888" cy="278" r="1.5" />
                <!-- 8 -> 9 -->
                <circle cx="932" cy="228" r="1.5" />
                <circle cx="958" cy="195" r="1.5" />
                <circle cx="980" cy="168" r="1.5" />
              </g>

              <!-- =============================================================
                   PAST-NARRATIVE ARTIFACT RELIC EMBLEMS (ICONS BESIDE STATIONS)
                   ============================================================= -->
              <!-- Relic 1 (Station 01): Vellum Envelope & Wax Seal XXII:XXII at (65, 660) -->
              <g transform="translate(65, 660)" opacity="0.9">
                <rect x="-14" y="-10" width="28" height="20" rx="2" fill="#181109" stroke="#d4a853" stroke-width="0.9" />
                <polyline points="-14,-10 0,2 14,-10" fill="none" stroke="#d4a853" stroke-width="0.8" />
                <circle cx="0" cy="2" r="4.5" fill="#991b1b" stroke="#7f1d1d" stroke-width="0.6" />
                <text x="0" y="4" fill="#fef08a" font-family="'Cinzel', serif" font-size="4" font-weight="700" text-anchor="middle">XXII</text>
              </g>

              <!-- Relic 2 (Station 02): Cartographer Sextant & Quill at (185, 590) -->
              <g transform="translate(185, 590)" opacity="0.9">
                <path d="M-10,10 L0,-12 L10,10" fill="none" stroke="#d4a853" stroke-width="0.9" />
                <path d="M-12,10 Q0,15 12,10" fill="none" stroke="#d4a853" stroke-width="1.2" />
                <circle cx="0" cy="-12" r="2.5" fill="#ffe099" />
                <line x1="0" y1="-12" x2="3" y2="12" stroke="#4fe3c1" stroke-width="0.8" />
              </g>

              <!-- Relic 3 (Station 03): 8-Petal Mechanical Brass Flower at (285, 480) -->
              <g transform="translate(285, 480)" opacity="0.9">
                <circle cx="0" cy="0" r="11" fill="none" stroke="#d4a853" stroke-width="0.9" />
                <circle cx="0" cy="-5" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="0" cy="5" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="-5" cy="0" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="5" cy="0" r="4" fill="none" stroke="#d4a853" stroke-width="0.7" />
                <circle cx="0" cy="0" r="2.5" fill="#ffe099" />
              </g>

              <!-- Relic 4 (Station 04): Fractured Astrolabe Disc & 22.22 MHz Breach at (440, 475) -->
              <g transform="translate(440, 475)" opacity="0.9">
                <circle cx="0" cy="0" r="12" fill="none" stroke="#991b1b" stroke-width="1" stroke-dasharray="3, 3" />
                <path d="M-7,-7 L-2,0 L-6,7" stroke="#ef4444" stroke-width="1.2" fill="none" />
                <path d="M3,-9 L1,2 L6,9" stroke="#ef4444" stroke-width="1.2" fill="none" />
                <circle cx="0" cy="0" r="2" fill="#f87171" />
                <text x="0" y="18" fill="#f87171" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">22.22 MHz</text>
              </g>

              <!-- Relic 5 (Station 05): Radio Shortwave Dipole Tower & 19.84 MHz at (560, 475) -->
              <g transform="translate(560, 475)" opacity="0.9">
                <polygon points="0,-12 -5,10 5,10" fill="none" stroke="#4fe3c1" stroke-width="0.9" />
                <line x1="-10" y1="-12" x2="10" y2="-12" stroke="#4fe3c1" stroke-width="1.2" />
                <circle cx="0" cy="-12" r="2" fill="#4fe3c1" />
                <path d="M-8,-17 Q0,-21 8,-17" stroke="#4fe3c1" stroke-width="0.8" fill="none" opacity="0.7" />
                <text x="0" y="20" fill="#4fe3c1" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">19.84 MHz</text>
              </g>

              <!-- Relic 6 (Station 06): 16-Division Planisphere Wheel & 142.85 MHz at (680, 410) -->
              <g transform="translate(680, 410)" opacity="0.9">
                <circle cx="0" cy="0" r="13" fill="none" stroke="#d4a853" stroke-width="1" />
                <circle cx="0" cy="0" r="7" fill="none" stroke="#4fe3c1" stroke-width="0.7" stroke-dasharray="2, 3" />
                <line x1="-13" y1="0" x2="13" y2="0" stroke="#d4a853" stroke-width="0.8" />
                <line x1="0" y1="-13" x2="0" y2="13" stroke="#d4a853" stroke-width="0.8" />
                <circle cx="0" cy="0" r="2" fill="#ffe099" />
                <text x="0" y="20" fill="#d4a853" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">142.85 MHz</text>
              </g>

              <!-- Relic 7 (Station 07): The 7 Zodiacal Dials & Sandstone Outpost at (750, 340) -->
              <g transform="translate(750, 340)" opacity="0.92">
                <rect x="-11" y="-13" width="22" height="26" rx="2" fill="#201107" stroke="#d4a853" stroke-width="1" />
                <circle cx="0" cy="-5" r="4.5" fill="none" stroke="#f59e0b" stroke-width="0.8" />
                <circle cx="0" cy="5" r="3.5" fill="none" stroke="#f59e0b" stroke-width="0.8" />
                <text x="0" y="-3" fill="#fde68a" font-family="'Cinzel', serif" font-size="4.5" text-anchor="middle">♈</text>
                <text x="0" y="7" fill="#fde68a" font-family="'Cinzel', serif" font-size="4.5" text-anchor="middle">♎</text>
              </g>

              <!-- Relic 8 (Station 08): Vega 97° Collimation Ray & Axis at (965, 260) -->
              <g transform="translate(965, 260)" opacity="0.95">
                <circle cx="0" cy="0" r="14" fill="none" stroke="#f59e0b" stroke-width="1.2" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2, 2" />
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2, 2" />
                <polygon points="0,-11 3,0 0,2 -3,0" fill="#fef08a" />
                <text x="0" y="22" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="700" text-anchor="middle">2090 LY · 97°</text>
              </g>

              <!-- Relic 9 (Station 09): The Celestial Cipher Dial at (935, 140) -->
              <g transform="translate(935, 140)" opacity="0.95">
                <circle cx="0" cy="0" r="15" fill="#1e0c04" stroke="#f59e0b" stroke-width="1.2" />
                <circle cx="0" cy="0" r="9" fill="none" stroke="#fde68a" stroke-width="0.8" stroke-dasharray="2, 4" />
                <text x="0" y="3" fill="#fde68a" font-family="'Cinzel', serif" font-size="6.5" font-weight="700" text-anchor="middle">XII</text>
                <path d="M -16 4 Q 0 -2 16 6 L 16 16 L -16 16 Z" fill="#3c1908" stroke="#d97706" stroke-width="1" />
              </g>

              <!-- =============================================================
                   INTERACTIVE CONSTELLATION FILAMENTS (SMOOTH SERPENTINE ASCENT)
                   ============================================================= -->
              <!-- 1 -> 2 (Ascending Mountain Pass to Cartographer Terrace) -->
              <path fill="none" class="constellation-filament lit" id="path-1-2" d="M 120 660 C 163.2 634.8, 202.0 622.5, 240 590" />
              <!-- 2 -> 3 (Gentle rounded curve into Sheltered Alpine Pine Hollow) -->
              <path fill="none" class="constellation-filament lit" id="path-2-3" d="M 240 590 C 278.8 556.7, 281.0 494.7, 330 480" />
              <!-- 3 -> 4 (Smooth sweeping climb towards Broken Aqueduct Bridgehead) -->
              <path fill="none" class="constellation-filament lit" id="path-3-4" d="M 330 480 C 371.7 467.5, 397.9 541.0, 440 530" />
              <!-- 4 -> 5 (Traversing aqueduct deck & gorge to Radio Needle Spire) -->
              <path fill="none" class="constellation-filament lit" id="path-4-5" d="M 440 530 C 496.7 515.2, 503.1 434.2, 560 420" />
              <!-- 5 -> 6 (Silky smooth curve into Sunken Planisphere Arena) -->
              <path fill="none" class="constellation-filament lit" id="path-5-6" d="M 560 420 C 605.4 408.6, 634.2 479.5, 680 470" />
              <!-- 6 -> 7 (Graceful climb up onto Sandstone Terraces & Outpost) -->
              <path fill="none" id="filament-6-7" class="constellation-filament lit" d="M 680 470 C 735.1 458.5, 758.9 408.4, 800 370" />
              <!-- 7 -> 8 (Ascending into Tempest Mesa & Vega Beam Strike) -->
              <path fill="none" id="filament-7-8" class="constellation-filament lit" d="M 800 370 C 840.0 332.6, 868.7 301.0, 905 260" />
              <!-- 8 -> 9 (Soft curve through Deep Dunes to Desert Gate) -->
              <path fill="none" id="filament-8-9" class="constellation-filament" d="M 905 260 C 938.9 221.7, 961.0 188.2, 995 150" style="display:none;" />
              <!-- Future Fading Filament trailing towards the Desert Frontier -->
              <path fill="none" id="filament-future-fade" class="constellation-filament-fading" d="M 905 260 C 938.9 221.7, 961.0 188.2, 995 150" stroke="url(#futureFadeGrad)" stroke-width="2" stroke-dasharray="3, 6" />
              <!-- Desert Trail beyond Station 09 ascending into Upper Celestial Canopy -->
              <path fill="none" d="M 995 150 C 1018.7 123.4, 1039.8 105.2, 1065 80" stroke="url(#futureFadeGrad)" stroke-width="2.2" stroke-dasharray="4, 5" />

              <!-- =============================================================
                   THE 9 INTERACTIVE STAR NODES (BALANCED & HARMONIOUS ROUTE)
                   ============================================================= -->
              <!-- STAR NODE 1: The Opening Summons (Valley Gate Foothills) -->
              <g class="map-node-trigger" data-node="1">
                <circle class="node-outer-gear" cx="120" cy="660" r="26" />
                <circle class="node-orbit-ring" cx="120" cy="660" r="20" />
                <circle cx="120" cy="660" r="14" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="120" cy="660" r="8" />
                <text class="node-tag-svg" x="120" y="696" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">01 · ORIGIN ✓</text>
                <text class="node-title-svg" x="120" y="710" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">The Threshold</text>
              </g>

              <!-- STAR NODE 2: Cartographer Arrival (High Alpine Terrace) -->
              <g class="map-node-trigger" data-node="2">
                <circle class="node-outer-gear" cx="240" cy="590" r="26" />
                <circle class="node-orbit-ring" cx="240" cy="590" r="20" />
                <circle cx="240" cy="590" r="14" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="240" cy="590" r="8" />
                <text class="node-tag-svg" x="240" y="632" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">02 · RECEIVED ✓</text>
                <text class="node-title-svg" x="240" y="646" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Cartographer Arrival</text>
              </g>

              <!-- STAR NODE 3: The Celestial Flower (Protected Alpine Pine Hollow) -->
              <g class="map-node-trigger" data-node="3">
                <circle class="node-outer-gear" cx="330" cy="480" r="28" />
                <circle class="node-orbit-ring" cx="330" cy="480" r="22" />
                <circle cx="330" cy="480" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="330" cy="480" r="9" />
                <text class="node-tag-svg" x="330" y="440" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">03 · HARMONIZED ✓</text>
                <text class="node-title-svg" x="330" y="426" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Celestial Flower</text>
              </g>

              <!-- STAR NODE 4: Observatory Raid (Broken Aqueduct Western Bridgehead) -->
              <g class="map-node-trigger" data-node="4">
                <circle class="node-outer-gear" cx="440" cy="530" r="28" />
                <circle class="node-orbit-ring" cx="440" cy="530" r="22" />
                <circle cx="440" cy="530" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="440" cy="530" r="9" />
                <text class="node-tag-svg" x="440" y="566" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">04 · ARCHIVED ✓</text>
                <text class="node-title-svg" x="440" y="580" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Observatory Raid</text>
              </g>

              <!-- STAR NODE 5: Emergency Radio Relay (Canyon Rock Needle Pinnacle) -->
              <g class="map-node-trigger" data-node="5">
                <circle class="node-outer-gear" cx="560" cy="420" r="28" />
                <circle class="node-orbit-ring" cx="560" cy="420" r="22" />
                <circle cx="560" cy="420" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle class="node-dot-completed" cx="560" cy="420" r="9" />
                <text class="node-tag-svg" x="560" y="386" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">05 · RECEIVED ✓</text>
                <text class="node-title-svg" x="560" y="372" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Radio Relay</text>
              </g>

              <!-- STAR NODE 6: The Celestial Matrix (Sunken Planisphere Arena) -->
              <g class="map-node-trigger" data-node="6">
                <circle class="node-outer-gear" cx="680" cy="470" r="28" />
                <circle class="node-orbit-ring" cx="680" cy="470" r="22" />
                <circle cx="680" cy="470" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle id="node-6-dot" class="node-dot-completed" cx="680" cy="470" r="9" />
                <text class="node-tag-svg" id="node-6-tag" x="680" y="508" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">06 · CALIBRATED ✓</text>
                <text class="node-title-svg" id="node-6-title" x="680" y="522" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">Celestial Matrix</text>
              </g>

              <!-- STAR NODE 7: The Zodiac Engine (Subterranean Sandstone Outpost) -->
              <g class="map-node-trigger" data-node="7" style="cursor: pointer;">
                <circle class="node-outer-gear" cx="800" cy="370" r="28" />
                <circle class="node-orbit-ring" cx="800" cy="370" r="22" />
                <circle cx="800" cy="370" r="16" fill="url(#starGlowGold)" opacity="0.6" />
                <circle id="node-7-dot" class="node-dot-completed" cx="800" cy="370" r="9" />
                <circle class="active-beacon-pulse" id="node-7-beacon" cx="800" cy="370" r="14" style="display: none;" />
                <text class="node-tag-svg" id="node-7-tag" x="800" y="406" style="fill:var(--brass-bright); font-weight:700;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">07 · SECURED ✓</text>
                <text class="node-title-svg" id="node-7-title" x="800" y="420" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">The Zodiac Engine</text>
              </g>

              <!-- STAR NODE 8: The Midnight Calibration (ACTIVE OBJECTIVE · Tempest Mesa) -->
              <g class="map-node-trigger" data-node="8" style="cursor: pointer;">
                <g transform="translate(905, 260)">
                  <!-- Expanding Amber Beacon Wave -->
                  <circle class="active-beacon-pulse" id="node-8-beacon" cx="0" cy="0" r="14" style="stroke: #e2b069; display: block;" />
                  <!-- Amber Glow & Active Dot Marker -->
                  <circle id="node-8-glow" cx="0" cy="0" r="22" fill="url(#starGlowAmber)" opacity="0.85" />
                  <circle class="node-orbit-ring" cx="0" cy="0" r="18" stroke-dasharray="3, 3" />
                  <circle id="node-8-dot" class="node-dot-active" cx="0" cy="0" r="11" />
                  <text id="node-8-icon" x="0" y="4" text-anchor="middle" font-family="'Cinzel', serif" font-size="10" font-weight="700" fill="#ffffff" opacity="0.95">⏳</text>
                </g>
                <text class="node-tag-svg" id="node-8-tag" x="905" y="226" style="fill:#e2b069; font-weight:700; opacity:1;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">08 · ACTIVE OBJECTIVE ⏳</text>
                <text class="node-title-svg" id="node-8-title" x="905" y="212" style="opacity:1;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">[ Sealed ]</text>
              </g>

              <!-- STAR NODE 9: The Celestial Cipher (Finale of Constellation Path · Desert Gate) -->
              <g class="map-node-trigger" id="map-node-9" data-node="9" style="display:none; cursor:pointer;">
                <circle class="node-outer-gear" cx="995" cy="150" r="26" opacity="0.7" stroke="#ea580c" />
                <circle class="node-orbit-ring" cx="995" cy="150" r="20" stroke-dasharray="2, 5" opacity="0.6" stroke="#f59e0b" />
                <circle cx="995" cy="150" r="14" fill="url(#starGlowAmber)" opacity="0.7" />
                <circle class="node-dot-active" cx="995" cy="150" r="9" fill="#ea580c" />
                <text class="node-tag-svg" x="995" y="186" style="fill:#fde68a; font-weight:700;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">09 · CONSTELLATION FINALE ✦</text>
                <text class="node-title-svg" x="995" y="200" style="fill:#ffffff; font-weight:600;" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))">The Celestial Cipher</text>
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

print("SUCCESS: Refined SVG written to", file_path)
