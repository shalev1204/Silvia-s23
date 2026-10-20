# HANDOFF · Stage Path (para continuar en una sesión local)

> Estado a 20-10-2026. Léelo junto con `docs/STAGE_PATH_BIBLE.md` (diseño y canon) y `CLAUDE.md` / `AGENTS.md`.

## Dónde está todo

- `main` y la rama `claude/repo-security-audit-3vuwrl` están **idénticas** (`24b795c`, "Station 20: fixes from the independent review"). No queda nada sin fusionar ni sin subir.
- Para continuar en local: `git checkout main && git pull origin main` (o crea tu rama de trabajo desde `main`).
- Despliegue (lo hace el Operador desde su Mac): `git pull origin main` y `npx wrangler pages deploy web --project-name=the-eclipse-order`. **Pendiente de desplegar** la Estación 20 y la Hoja 19.
- Dependencias para generar hojas: `pip install opencv-python-headless pypdf pillow numpy`.

## Hecho y verificado

- Estación 20 (The Gate of a Thousand Masks) y Hojas 19A/19B (SILVER, máscaras, mitades en espejo, Fragmento I), Espejo Vivo del Path III, Field Wire pasos 33–36, tester `s20`, Ask Hermes del Stage, docs.
- Revisión independiente aplicada (7 hallazgos, con pruebas de regresión).
- Suite completa `python3 scripts/audit/web_smoke.py`: **206 comprobaciones en verde** (~11 min; en el entorno cloud: `--chromium /opt/pw-browsers/chromium-1194/chrome-linux/chrome`). Secciones 13 (Espejo) y 14 (Máscaras) incluidas.
- `python3 scripts/audit/lint_lore_and_vocabulary.py` limpio; sin "Staatsoper"/"Vienna" en claro en `web/` (solo invertido en el JS).
- Hoja 19: `python3 scripts/journal/build_stage_path.py` (PDF y mockups en `journal/page19/`); paquete `journal/impresion/01_STAGE_PATH_HOJAS_19_A_26_A5.pdf` con `build_impresion_master.py`.

## Pendiente inmediato

Nada. Lo siguiente es la Estación 21. Última pregunta abierta al Operador: ¿empezar por *The Camera Obscura* (Hoja 20A, Fragmento II)? Antes de construir, preguntarle las decisiones de diseño en formato test.

## Siguiente trabajo (Estaciones 21–28, Hojas 20–26)

Mapa acordado con el Operador (estación → cara de hoja → fragmento):

| Est. | Nodo | Juego | Cara | Extra |
|---|---|---|---|---|
| 21 | 41 | The Camera Obscura | 20A | Fragmento II |
| 22 | 42 | The Whispering Gallery | 20B | III + Ledger J = 8 |
| 23 | 43 | The Automaton Orchestra | 21B | IV |
| 24 | 44 | The Fly Tower | 22A | V + Ledger Q = 14 |
| 25 | 45 | The Shadow Theatre | 23A | VI + reliquia |
| 26 | 46 | The Hall of Mirrors | 24A | VII; reflejo de Pope-E visto de espaldas |
| 27 | 47 | The Kaleidoscope Lantern | 25A | VIII + Ledger X = 15 |
| 28 | 48 | Stage of the Mirror Speaker | 26A | IX + revelación del WHERE |

Caras de historia: 21A Cuaderno de Aurelia I (observatorio, 1970) · 22B The Ashes Before Christ (secta BC, sello de Pope-E) · 23B Cuaderno II (disco y voto) · 24B Doctrina de la Mirror Speaker · 25B Cuaderno III (terraza bajo las estrellas) · 26B Back to the Peaks. Pope-E: notas 2 y 3 (Estaciones 22/26 aprox.), reflejo en la 26. Más allá: Torre I y Bóveda.

Patrón por estación (plantilla: la Estación 20, `web/hub/js/stations/s20-masks-gate.js` + `web/hub/css/stations/s20-masks-gate.css`; su modal sigue en `web/index.html`). Desde el 20-10-2026 el Hub está dividido (`docs/IDEAS_BACKLOG.md` #17): cada estación nueva nace como `web/hub/js/stations/sNN-*.js` y `web/hub/css/stations/sNN-*.css`, enlazados en `index.html` tras los de la Estación 20; lo compartido (`makeMarch`, `MARCH_LEGS`, Field Wire, tester, Ask Hermes) está en `web/hub/js/hub-core.js`. Añadir la sección al smoke (`SECTIONS` y la última estación de `QUICK` en `web_smoke.py`):
1. Preguntar al Operador las decisiones de diseño en formato test (una estación cada vez), como en las anteriores.
2. Cara(s) de la hoja en `scripts/journal/build_stage_path.py` (registrar en `STAGE_SHEETS`; margen izquierdo X<165 vacío en Cara A, X>1583 vacío en Cara B; `draw_fragment(canvas, idx, ...)` dibuja el fragmento de su estación).
3. Modal `.monolith-*` con clase `is-stage-room`, controlador, `window.STAGE_OPENERS[node]`, `window.STAGE_CARDS[node]` (nodos 40–48), `makeMarch`, `MARCH_LEGS`, `MARCH_STARTED_BY_ANSWER`, pasos del Field Wire (empezar en 37), `WIRE_LAST_STEP`, telemetría, divisores, lista de respuestas que auto-avanzan, tester (`GAMES`, `ARRIVAL`, `WALKS`, `syncWire`), preguntas de Ask Hermes (grupo `stage`), claves en `StageMirror.STATIONS` (ya definidas).
4. Ledger: J, Q, X con valores 8, 14, 15 en las estaciones 22, 24 y 27 (una ecuación de una incógnita cada una; Regla 9: nunca mostrar valores de letras en las hojas).
5. Smoke, revisión independiente, docs, commit y push a la rama.

## Invariantes (no romper)

- Textos del juego en inglés; vocabulario sencillo; prohibidos Sunken, Coastal, Coast, Hermit, Stage Mistress; solo A–Z.
- El WHERE (Viena · Wiener Staatsoper) nunca en claro antes de la Estación 28 (está invertido en `stage-mirror.js`).
- Pope-E es Carles: Silvia no lo sabe hasta la Torre I. Notas con sello de ceniza (círculo con una línea), siempre la llama *the treasure*; la Mirror Speaker nunca se ve, solo se refleja, y firma con una línea horizontal.
- Git: commit y push a la rama de la sesión al terminar cada tarea; nunca PR, force-push ni borrar ramas sin orden.
