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
│   ├── index.html             ← Hub Central
│   ├── assets/                ← Mapas, miniaturas, fondos, branding
│   ├── constellation/         ← celestial-flower, celestial-flower-2, radio-transmission,
│   │                            celestial-matrix, zodiac-engine, midnight-calibration, celestial-cipher
│   ├── desert/                ← Reservado (los juegos del Desert Path viven en el Hub)
│   ├── shared/                ← navigator.js / navigator.css
│   └── stage/                 ← Reservado
│
├── journal/                   ← DIARIO MANUSCRITO A5 (18 hojas, 36 caras)
│   ├── page01 … page18/       ← Por hoja: canvases/ (PNG 300 dpi), mockups/ (JPG) y pdf/ (A5)
│   ├── constellation_games/   ← Lienzos y mockups de los juegos C1–C4
│   ├── desert_games/          ← Lienzos y mockups de los juegos de la primera tanda del desierto
│   └── impresion/             ← PDFs de impresión (⚠️ versión antigua de 12 hojas; ver nota)
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
│   ├── journal/               ← Generadores del diario (build_entire_journal.py, build_page*.py, tests/)
│   ├── audio/                 ← Voz, foley y mezclas (stems intermedios no versionados en web/)
│   ├── glyphs/                ← Generadores del Eclipse Script
│   ├── render/                ← Renderizado de emails
│   └── audit/lint_lore_and_vocabulary.py   ← Linter de lore y vocabulario
│
├── scratch/                   ← Capturas y verificaciones de trabajo (no es fuente de verdad)
│
└── docs/                      ← DOCUMENTACIÓN
    ├── CANONICAL_LORE_AND_VOCABULARY_AUDIT.md   ← Biblia Maestra 6.0 (fuente de verdad)
    ├── DESERT_ODYSSEY_BIBLE.md                  ← Desert Path: hojas, juegos y estaciones 10–19
    ├── lore_and_puzzle_bible.md                 ← Diseño de puzzles, astronomía y mecánicas
    ├── LORE.md · PATHS_AND_CHARACTERS.md · GRIMOIRE.md · TIMELINE.md
    ├── WEB_ECOSYSTEM.md · EMAIL_SETUP.md · ASSETS.md · SESSION_LOG.md
    └── REPOSITORY_STRUCTURE.md                  ← Este documento
```

---

## 2. Notas

- **Desert Path en el Hub:** las Estaciones 10 a 13 son modales de `web/index.html`; el diseño de cada juego está en `docs/DESERT_ODYSSEY_BIBLE.md`.
- **Regeneración del diario:** `python3 -m scripts.journal.build_entire_journal` desde la raíz reescribe las 36 caras y sincroniza los mapas en `web/assets/maps/`. Es determinista: una cara solo cambia si cambia su script.
- **`journal/impresion/`:** contiene los PDFs de impresión doble cara de la versión anterior (12 hojas, numeración antigua) y **no se genera con ningún script**. Para imprimir, use los `page*/pdf/*_A5.pdf` actuales.
- **Audio:** los `*.wav` / `*.pcm` de `web/` están en `.gitignore`; solo se versionan los `.mp3` / `.mp4` finales.
