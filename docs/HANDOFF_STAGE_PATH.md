# HANDOFF · Stage Path (para continuar en una sesión local)

> Estado a 20-10-2026. Léelo junto con `docs/STAGE_PATH_BIBLE.md` (diseño y canon) y `CLAUDE.md` / `AGENTS.md`.

## Dónde está todo

- Rama de trabajo: `claude/repo-security-audit-3vuwrl` (remoto `origin`). Último commit: `Station 20: The Gate of a Thousand Masks`.
- `main` sigue en `5d077e4` (hasta la Estación 19). **Falta fusionar** la rama a `main` cuando el smoke esté en verde y la revisión independiente esté aplicada:
  `git fetch origin && git merge-base --is-ancestor origin/main HEAD && git push origin HEAD:main`
- Despliegue (lo hace el Operador desde su Mac): `git pull origin main` y `npx wrangler pages deploy web --project-name=the-eclipse-order`.

## Hecho

- Estación 20 y Hojas 19A/19B (SILVER, máscaras, mitades en espejo, Fragmento I), Espejo Vivo del Path III, Field Wire 33–36, tester `s20`, Ask Hermes del Stage, smoke secciones 13 y 14, docs.
- Hoja 19 generada: `python3 scripts/journal/build_stage_path.py` (PDF + mockups en `journal/page19/`), paquete `journal/impresion/01_STAGE_PATH_HOJAS_19_A_26_A5.pdf` con `build_impresion_master.py`. Requiere `pip install opencv-python-headless pypdf pillow numpy`.

## Pendiente inmediato (antes de fusionar)

1. Pasar la suite completa: `python3 scripts/audit/web_smoke.py` (unos 11 min; en el entorno cloud: `--chromium /opt/pw-browsers/chromium-1194/chrome-linux/chrome`). La última ejecución completa estaba en curso; la sección 14 y la 13 pasaron por separado.
2. Aplicar los hallazgos de la revisión independiente de la Estación 20 (un agente la estaba haciendo; si no consta, repetir la revisión: Field Wire 32→33, cierre del modal a mitad de trazo o de los `setTimeout` de `carveTrue`, `inert`, tester, mirror `justSet`).
3. `python3 scripts/audit/lint_lore_and_vocabulary.py` y comprobar que "Staatsoper"/"Vienna" no aparecen en claro en `web/` (en el JS solo invertido).

## Siguiente trabajo (Estaciones 21–28, Hojas 20–26)

Patrón por estación (ver Estación 20 como plantilla en `web/index.html`: buscar `initMasksGate`):
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
