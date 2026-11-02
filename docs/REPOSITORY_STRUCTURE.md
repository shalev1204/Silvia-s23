# Estructura del Repositorio · The Eclipse Order

> **Regla de oro de organización:** `Ámbito General / Transversal` → `Caminos (Paths)` → `Juegos / Entregas individuales`.  
> Última revisión: octubre 2026 (alineada con la Biblia Maestra 6.0).

---

## 1. Mapa General

```text
Silvia's23/
│
├── CLAUDE.md · AGENTS.md · GEMINI.md · .cursorrules   ← Protocolo obligatorio de inicio y reglas del Operador (Capa 2)
├── .agents/rules/user-preferences.md                  ← Estándar estético y de producción del diario
├── .cursor/rules/canonical-lore.mdc                   ← Misma regla de onboarding para Cursor
├── PROJECT_MASTER.md                                  ← Índice maestro y registro de decisiones
│
├── web/                       ← ECOSISTEMA DIGITAL (se despliega en Cloudflare Pages)
│   ├── index.html             ← Hub Central (HTML de vistas y modales)
│   ├── hub/                   ← css/ y js/ del Hub (núcleo + un archivo por estación en stations/)
│   ├── assets/                ← Mapas, miniaturas, fondos, branding
│   ├── constellation/         ← celestial-flower, celestial-flower-2, radio-transmission,
│   │                            celestial-matrix, zodiac-engine, midnight-calibration, celestial-cipher
│   ├── desert/                ← Reservado (los juegos del Desert Path viven en el Hub)
│   ├── shared/                ← navigator.js / navigator.css
│   ├── stage/                 ← Reservado
│   └── templates/             ← game_boilerplate/ (HTML, CSS, JS procedural para nuevos puzzles)
│
├── journal/                   ← DIARIO MANUSCRITO A5 (26 hojas, 52 caras)
│   ├── page01 … page26/       ← Por hoja: mockups/ (JPG fotorrealistas) y pdf/ (A5 listos para imprimir)
│   ├── seals/                 ← Sellos y vistas previas QR para las Hojas 20 a 26
│   ├── stage_seals.json       ← Registro criptográfico de hashes y firmas de sellos del Stage Path
│   ├── constellation_games/   ← Mockups de los juegos C1–C4
│   ├── desert_games/          ← Mockups de los juegos de la primera tanda del desierto
│   └── impresion/             ← PDFs de impresión maestros:
│                                ├── 00_DIARIO_COMPLETO_36_PAGINAS_A5.pdf (Hojas 01 a 18)
│                                ├── 01_STAGE_PATH_HOJAS_19_A_26_A5.pdf (Hojas 19 a 26)
│                                ├── 02_STAGE_PATH_VISTA_PREVIA_A4.pdf (Pliego A4 encuadernación)
│                                └── hojas_doble_cara/ (Hojas 01 a 26 individuales A5)
│
├── assets/                    ← RECURSOS MULTIMEDIA DE PRODUCCIÓN
│   ├── fonts/                 ← Tipografías manuscritas (Fondamento, etc.)
│   ├── general/               ← backgrounds, branding, emails, glyphs (Eclipse Script)
│   ├── constellation/         ← branding, celestial-flower, radio-transmission, zodiac-outpost
│   ├── desert/                ← branding
│   └── stage/                 ← branding
│
├── emails/                    ← CORRESPONDENCIA OFICIAL (DISPATCHES)
│   ├── general/01-opening-dispatch/
│   ├── constellation/01-cartographer-dispatch/ · 02-zodiac-dispatch/
│   ├── desert/01-emergency-wire-dispatch/
│   └── stage/
│
├── puzzles/                   ← DISEÑO DE JUEGOS
│   ├── general/cipher-alphabet/   ← ECLIPSE_SCRIPT.md
│   ├── constellation/01-celestial-flower · 02-stolen-astrolabe
│   └── desert/ · stage/
│
├── scripts/                   ← HERRAMIENTAS
│   ├── journal/               ← Generadores del diario (build_stage_path.py, build_impresion_master.py, stage_drawings.py, sheet_seal.py, verify_sheets.py, stage_preview.py)
│   ├── audit/                 ← Suite de calidad (web_smoke.py, lint_lore_and_vocabulary.py, journey_report.py)
│   ├── audio/                 ← Generadores de voz Gemini TTS, foley y mezclas (ver audio/README.md)
│   ├── glyphs/                ← Generadores del Eclipse Script (v1, v2, v3)
│   ├── maps/                  ← Generación de relieves y mapas vectoriales
│   ├── render/                ← Renderizado de emails y cinemáticas
│   └── web/                   ← Utilidades web (offline_list.py para web/sw.js)
│
├── scratch/                   ← Prototipos, pruebas y verificaciones aisladas
│   ├── maps/                  ← Ajustes paramétricos de curvas SVG y mapas procedurales
│   ├── hub_tests/             ← Pruebas de integración, talleres de juego y tormenta roja
│   ├── verifications/         ← Verificaciones criptográficas, léxico y laberintos
│   └── utils/                 ← Utilidades auxiliares de captura y depuración rápida
│
└── docs/                      ← DOCUMENTACIÓN
    ├── design_system/         ← SISTEMA DE DISEÑO Y MANUALES DE CREACIÓN
    │   ├── README.md                          ← Índice y guía de inicio rápido
    │   ├── 01_JOURNAL_STYLE_AND_ART_GUIDE.md  ← Diario A5: dibujo renacentista, Stage Path, troquelado, tipografía
    │   ├── 02_WEB_GAMES_AND_HUB_GUIDE.md      ← Web: UI dark mode, tokens, micro-animaciones, Web Audio API
    │   └── 03_VOICE_TONE_AND_LORE_GUIDE.md    ← Narrativa: personajes, agencia Silvia, WHEN/WHERE/WHAT, vocabulario
    ├── CANONICAL_LORE_AND_VOCABULARY_AUDIT.md   ← Biblia Maestra 6.0 (fuente de verdad)
    ├── DESERT_ODYSSEY_BIBLE.md                  ← Desert Path: hojas 08–18, juegos y estaciones 10–19
    ├── STAGE_PATH_BIBLE.md                      ← Stage Path: hojas 19–26, fragmentos, Espejo Vivo y estaciones 20–28
    ├── HANDOFF_STAGE_PATH.md                    ← Informe de entrega y auditoría del Stage Path
    ├── lore_and_puzzle_bible.md                 ← Diseño de puzzles, astronomía y mecánicas
    ├── LORE.md · PATHS_AND_CHARACTERS.md · GRIMOIRE.md · TIMELINE.md
    ├── WEB_ECOSYSTEM.md · EMAIL_SETUP.md · ASSETS.md · SESSION_LOG.md
    └── REPOSITORY_STRUCTURE.md                  ← Este documento
```

---

## 2. Notas

- **Hub dividido (20-10-2026):** `web/index.html` guarda solo el HTML (vistas y modales de las Estaciones 10–20); el CSS vive en `web/hub/css/` y el JS en `web/hub/js/` (`hub-core.js`, un archivo por estación en `stations/` y piezas como `tester-panel.js`), cargados con `<link>` y `<script src>` clásicos, sin build, para que funcione también por `file://`. El diseño de cada juego está en `docs/DESERT_ODYSSEY_BIBLE.md` y `docs/STAGE_PATH_BIBLE.md`.
- **Regeneración del diario:**
  - Hojas 01 a 18 (Constellation + Desert): generadas mediante `python3 -m scripts.journal.build_entire_journal`.
  - Hojas 19 a 26 (Stage Path): compiladas mediante `python3 scripts/journal/build_stage_path.py` (con ilustraciones renacentistas de `stage_drawings.py` y sellos QR de `sheet_seal.py`).
  - Verificación de maquetación: `python3 scripts/journal/verify_sheets.py --sheets 19-26` verifica márgenes de troquelado ($X < 165$ px cara A, $X > 1583$ px cara B), tamaños de fuente y cero colisiones texto-dibujo (margen $\ge 40$ px).
- **`journal/impresion/`:** contiene los paquetes maestros de impresión:
  - `00_DIARIO_COMPLETO_36_PAGINAS_A5.pdf`: Hojas 01 a 18 (36 páginas iniciales).
  - `01_STAGE_PATH_HOJAS_19_A_26_A5.pdf`: Hojas 19 a 26 (16 páginas del Stage Path).
  - `02_STAGE_PATH_VISTA_PREVIA_A4.pdf`: Pliego A4 con marcas de anillas y doblez.
  - `hojas_doble_cara/`: PDFs individuales de dos caras para cada hoja (01 a 26).
- **Audio:** los `*.wav` / `*.pcm` de `web/` están en `.gitignore`; solo se versionan los `.mp3` / `.mp4` finales. Ver `scripts/audio/README.md` para el mapa de generadores de stems y post-producción.
