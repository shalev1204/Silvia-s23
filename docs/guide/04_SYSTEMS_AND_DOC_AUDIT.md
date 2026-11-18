> **GUÍA MAESTRA · Parte 4 · Sistemas del Hub, verificación y auditoría de documentos** · Anexo de [docs/GAME_MASTER_GUIDE.md](../GAME_MASTER_GUIDE.md) (léase primero la guía maestra) · Auditoría a 16-nov-2026 sobre el repo en `ec7ce59`. Marcas: [DOC] lo que dice un documento · [CÓDIGO] lo que hace el código o archivo · [INFERENCIA] deducción · ✅ hecho · 🟡 a medias · ⏳ pendiente · ❓ sin diseñar · ⚠️ conflicto. **Ante discrepancia manda el código; el papel ya impreso es inmutable.** Las citas `ruta:línea` corresponden a esa fecha.

# D · Sistemas transversales del Hub + registro y auditoría de las guías

Auditoría hecha el 16-nov-2026 sobre el worktree `game-context-docs-ed9d0b` (rama `claude/game-context-docs-ed9d0b`; sin commits propios; árbol con 3 ficheros modificados sin commitear: `AGENTS.md`, `CLAUDE.md`, `docs/DESERT_ODYSSEY_BIBLE.md`).
Convenciones: [DOC] = lo que dice un documento · [CÓDIGO] = lo que hace el código/archivo · [INFERENCIA] = deducción mía. Estados: ✅ 🟡 ⏳ ❓ ⚠️.
Rutas relativas a la raíz del repo. `hub-core.js` = `web/hub/js/hub-core.js` (10 121 líneas, solo leído por grep).

---

# PARTE D1 · REGISTRO DE DOCUMENTOS

## 1.1 Tabla maestra (un renglón por documento)

mtime = fecha real del fichero en este checkout (`stat`). "Fecha que dice" = la que figura en su cabecera. Ojo: el mtime de varios ficheros (2026-10-20 19:07) es la fecha del checkout/clonado, no de la última edición; para esos usar `git log`.

| Documento | Propósito / audiencia | mtime | Fecha que dice | Ámbito | Estado | Contradicciones / problemas (con cita) | Recomendación |
|---|---|---|---|---|---|---|---|
| `CLAUDE.md` (89 l.) | Arranque obligatorio de Claude Code; resumen de lore, 11 reglas, verificación y git | 15-nov 22:20 (modificado, sin commit) | sin fecha | Todo el repo | ✅ vigente (corregido a 9 fragmentos) | `:32` "~56 días" (obsoleto: el WHEN es 18-dic, ≈108 días desde el 1-sep). `:43` cuaderno de Aurelia "Hojas 21B, 23B, 25B": 21B es *The Automaton Orchestra* (Estación 23), el cuaderno I es **21A** ([DOC] `docs/STAGE_PATH_BIBLE.md:59-60`). `:43` Aurelia refugiada en Tower III en 1974 choca con CANONICAL §12 (Aurelia = la Oráculo en Torre II desde 1971). `:38` WHEN = "Fecha y hora"; la Biblia dice "18–20 dic, sin hora" (CANONICAL:821) | Mantener como **punto de entrada** (≤1 pág.) y que apunte a la guía maestra; borrar el resumen de lore duplicado |
| `AGENTS.md` (149 l.) | Igual que CLAUDE.md pero multi-agente + §5 arquitectura técnica, §6 verificación, §7 R4 | 15-nov 22:20 (modificado) | sin fecha | Todo el repo | ✅ casi vigente | Mismos "~56 días" (`:33`), "21B" (`:52`), Aurelia 1974 (`:52`). `:24` "26 hojas" ✓. `:114` lista `scripts/audit/` ✓. Falta mencionar `web/hub/js/*` sistemas (Ledger, Wire…) | Mantener (SSOT de **reglas del Operador Capa 2**); recortar el lore y enlazar a la guía maestra |
| `GEMINI.md` (89 l.) | Copia de CLAUDE.md para Gemini/Antigravity | 6-nov 23:19 | sin fecha | Todo | ⚠️ parcialmente obsoleto | Único diff con CLAUDE.md además del encabezado: `:22` "**8** fragmentos de espejo" (el código tiene 9: `web/assets/js/stage-mirror.js:18-28`). Hereda los demás errores de CLAUDE.md | Archivar como fichero generado: producir CLAUDE/GEMINI/.cursorrules/.mdc **desde una sola plantilla** (script) o dejar solo un `AGENTS.md` + stubs de 5 líneas |
| `.cursorrules` (89 l.) y `.cursor/rules/canonical-lore.mdc` (95 l.) | Copias para Cursor | 6-nov | — | Todo | ⚠️ obsoletos | `.cursorrules:22` y `.mdc:28` "8 fragmentos". No estaban en la lista del encargo pero son la 4.ª y 5.ª copia del mismo onboarding | Igual que GEMINI.md |
| `PROJECT_MASTER.md` (182 l.) | Índice maestro + registro de decisiones del 1-sep | 6-nov 23:19 | "octubre 2026" (`:4`) y avisa que Fase I/Entrega 2/decisiones son del 1-sep (`:11`) | Visión + mapa de docs | 🟡 mitad histórico, mitad vigente | `:15,:154` "obra/lugar/fecha **TBD**" (ya decididos: WHERE = Viena, WHEN = 18–20 dic). `:27,:92-95` Grimoire "11 sep, diario de **bolsillo (NO A4)**" vs diario real A5 con anillas (`AGENTS.md:105`, `docs/design_system/01…:42`). `:119` ruta `web/hub/js/stations/stage-mirror.js` **no existe** (real: `web/assets/js/stage-mirror.js`). `:99` `assets/email-01-parchment.png` no existe (movido/no versionado). `:117-121` estado "Desert 10–19 jugables; Stage 20–28 diario 100%" no refleja que solo 20–22 están construidas. `:68` WHEN "(Fecha / Hora)" | Convertir en **registro histórico de decisiones** (§"Registro completo", "Descartado"), mover el estado a la guía maestra |
| `SECURITY.md` (17 l.) | Política de secretos, gitleaks, CSP | 20-oct | — | Repo + web | ✅ vigente | `.github/workflows/secret-scan.yml` y `.pre-commit-config.yaml` existen ✓. Declara que el gate de login es del juego, no control de acceso ✓ (el gate está en `hub-core.js:581` con contraseñas triviales en cliente: coherente) | Mantener tal cual |
| `.agents/rules/user-preferences.md` (116 l.) | Preferencias estéticas/flujo del Operador (renacentista, A5, vocabulario) | 6-nov | sin fecha | Diario + web | ✅ vigente | §6 dice usar "code/alphabet/symbol en vez de *cipher*" pero el producto se llama *The Cipher Ledger* / *Celestial Cipher* (conflicto de política vs nombre canónico). §8 repite el canon del Astrolabio (6 estrellas `Ald Pol Veg Alt Den Arc`) | Mantener como SSOT de **estética + tipografía + troquelado**; fusionar §8-§10 con la guía |
| `docs/REPOSITORY_STRUCTURE.md` (104 l.) | Mapa de directorios | 6-nov | "octubre 2026" | Repo | 🟡 parcialmente obsoleto | `:24-26,:94` `web/desert/` y `web/stage/` "Reservado" ✓ (solo README). No lista `supabase/`, `.github/`, `web/sw.js`, `web/hub/js/engine/`; dice "Estaciones 10–20" en el HTML (`:94`, hoy 10–22). `:86` no lista `IDEAS_BACKLOG`, `HANDOFF`, `CINEMATIC`, `SILVIA_PLAYTHROUGH_LOG` | Mantener como SSOT de **mapa de carpetas** tras actualizarlo (o autogenerarlo con `tree`) |
| `docs/ASSETS.md` (46 l.) | Inventario de assets generados | 20-oct | sin fecha | Assets | 🟡 obsoleto parcial | `:16,:18,:28` PNG `assets/general/emails/email-01-parchment.png`, `…gmail-view.png`, `…email-02-fragment-1.png` **no están en el repo** (solo los `.html`). No inventaría `web/assets/` (items, chat, cinematics) | Fusionar con REPOSITORY_STRUCTURE o archivar |
| `docs/WEB_ECOSYSTEM.md` (115 l.) | Catálogo web: estructura, estaciones, claves localStorage del Desert/Stage, perfiles, tester | 23-oct (git: 12-nov para lo demás) | sin fecha | Web/Hub | 🟡 el más útil pero desfasado | `:13` index "~4.000 líneas" (hoy 5 062). `:69` "23–28 ⏳" ✓ correcto. `:82` "Field Wire: paso 33, 34, 35, 36" (hoy pasos 33–44 con S21/S22). `:86` documenta el fin de la tormenta ✓ (coincide con el código). `:88` guardado en nube ✓. `:80` orden Desert ✓ coincide con `ARRIVAL`. `:66-68` Estaciones 20–22 ✓. Falta: Cairn I, 13B (Gates), Night Erg, Stones Dream, Spyglass, cinemáticas | Mantener como SSOT de **catálogo técnico + claves localStorage**, pero regenerarlo desde el código (hay inventario completo en §2 de este informe) |
| `docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md` (1 014 l.) | "Biblia Maestra 6.0": historia 1970–2026, emails, 6 transmisiones literales, estaciones 01–09, tormenta, Cipher Ledger (§7), directorio, topografía, erratas impresas (§11), canon secreto Oráculo=Aurelia (§12) y Pope-E (§13) | 12-nov 10:27 | "Version 6.0 · October 2026" (`:2-3`) | Lore + cripto + Hojas 08–18 | ✅ SSOT de lore y Ledger, pero cabecera mentirosa | Cabecera dice "estaciones 01–09 … clímax actual Estación 09" (`:3`) mientras §7.B/§9/§12/§13 llegan a la 28. §7.B.* contiene **notas contradictorias internas**: `:705` "$J,Q,X$ libres 8,14,15", `:726` "Q valor 14 (Estación 24)" vs `:746` "Q = 14 en Estación 11" y `:728` X = Estación 10 (las "Actualización 25-10" lo corrigen en paréntesis). §7.0 (`:541-545`) exige J antes de la 19, pero §7.B.13 la deja en la 22. `:116` cita `assets/email-01-parchment.png` inexistente | Mantener como **SSOT de lore/cripto**; limpiar §7.B (borrar valores libres obsoletos), cambiar cabecera a "v6.x · nov 2026" |
| `docs/DESERT_ODYSSEY_BIBLE.md` (374 l.) | Desert Path: hojas 08–18, mapa, 5 Cairns, tabla Hoja↔Estación (§5.B), invariantes y **estándar del chat Field Wire** (desde §"Estándar del chat") | 15-nov 22:20 (modificado) | "Version 5.0 · October 2026" | Desert + Wire | ✅ vigente (el más actualizado) | Cabecera "v5.0, octubre" ya no refleja que alberga el estándar del Wire (13–15 nov). §5.B ✓ coincide con `GAMES`. `:373-374` cita `wire-ceremony.css`, `item_seal_cairn_N.svg` (existen ✓ `web/hub/css/wire-ceremony.css`, `web/assets/items/item_seal_cairn_{2..5}.svg`) | Mantener como SSOT del **Desert Path y del Wire**; mover el "Estándar del chat" a la guía maestra |
| `docs/STAGE_PATH_BIBLE.md` (260 l.) | Stage Path: decisiones (WHERE=Viena), 16 caras (§4), lo realmente impreso (§4.1), mapa Espejo Vivo, estaciones 20–28 (§6), Pope-E (§9), estado (§10), fichas de S20–S22 | 12-nov 10:28 | "decisiones fijadas el 20-10-2026" | Stage | 🟡 vigente pero con ⚠️ | §4 tabla (títulos "provisional", ecuaciones Q en 22A y X en 25A) **contradice** §4.1 (lo impreso: 22A sin ecuación Q; 25A…). §6 `:130` "queda Q valor 14… Estación 24" obsoleto (Q = Estación 11 en código). §4.1 `24B/25B` nombran a Pope-E en 1970 y chocan con §9 ("solo 2026"). §10 `:223` dice "Hojas 19–26 impresas y entregadas" mientras §1 dice que Silvia las recibe "todas juntas al empezar el Stage Path" | Mantener como SSOT del **Stage Path**; reescribir §4/§6 con lo impreso (§4.1) y retirar valores libres de Q/X |
| `docs/lore_and_puzzle_bible.md` (473 l.) | Biblia de diseño original (sep-2026): agencia, vocabulario, juegos C1–C4, D1…, Ledger "Fases A–D" | 20-oct | "v1.0 · septiembre 2026" | Constellation + diseño | ⚠️ obsoleto en estado | §6 marca C3 (Estación 08) "PRÓXIMO EN DESARROLLO" y C4 (Estación 09) "PENDIENTE" (ambos ✅ hechos). `:163-176` tabla maestra del alfabeto "histórica" (A=7 … H=11, J=14, Q=1, W=5, X=18, Y=19, Z=8) **contradice** los valores vigentes (§2.1 abajo); el propio doc avisa "manda la §7.B". `:191-195` Fase D (Vault) es el único sitio que describe el uso final del Ledger | Mantener solo §1-§2 (principios) y §4-§5; archivar §6-§12 como histórico; el diseño del final va a la guía maestra |
| `docs/IDEAS_BACKLOG.md` (431 l.) | Registro de 22 ideas de mejora + decisiones de planificación | 22-oct | "20-10-2026" | Infra/UX | ✅ útil, estado "comprobado el 20-10" | `:30` PWA "31 MB" vs `web/sw.js:9` "219 files, 49.3 MB". `:24` #6 "pistas en Cairn I y 10–20" ✓ (31 escaleras en código, incluye 21 y 22). `:20` #1 etc ✓ implementadas | Archivar como histórico; el estado real pasa a la guía maestra (tabla §2.3) |
| `docs/LORE.md` (124 l.) | Mito fundacional, doctrina de los 3 caminos, relaciones entre guardianes, hilos | 20-oct | sin fecha | Lore (1-sep) | 🟡 parcialmente obsoleto | Hilos "Semana 2/3/4" (`:95-99`) son plan de sep, no ejecutado así. Giro del Astrolabio ✓ coincide. Ninguna mención de Aurelia/Pope-E (esos viven en CANONICAL) | Fusionar lo útil (mito, relaciones Oráculo↔Mirror Speaker) en la guía; archivar |
| `docs/PATHS_AND_CHARACTERS.md` (180 l.) | v2 de caminos, personajes y tipos de puzzle (plan de 1-sep) | 20-oct | v2 | Diseño | ⚠️ obsoleto | `:11,:19` Oracle ↔ "WHEN (Fecha / Hora de la función)"; `:55-62` Mirror Speaker "no teatro, no ballet" vs `design_system/03:37-43` "Teatral… telones, máscaras". `:173-179` checklist "Entrega grimoire 11 sep (método TBD)" | Archivar |
| `docs/TIMELINE.md` (84 l.) | Calendario: estado real hasta oct + plan original | 20-oct | "Estado real (octubre 2026)" | Cronología | 🟡 parcial | `:22-24` dice S20 "jugable", sin S21/S22; `:23` WHEN **18–20 dic 2026** ✓ coincide con código; `:37-38` "Día final TBD"; tablas "Semanas (borrador)" y "Alfabeto" son plan original (avisado `:4`) | Fusionar el "Estado real" en la guía maestra (con fechas reales), archivar el resto |
| `docs/SESSION_LOG.md` (135 l.) | Transcripción de la sesión 1 (1-sep) | 20-oct | "Sesión 1 (1 sep 2026)" | Histórico | ✅ histórico (no vigente) | `:11` "~56 días" origen del dato; `:108` Grimoire "TBD" | Archivar (mover a `docs/archive/`) |
| `docs/HANDOFF_STAGE_PATH.md` (53 l.) | Entrega a sesión local del Stage Path | 6-nov | "Estado a 20-10-2026" (`:3`) | Stage | ⚠️ obsoleto | `:5-9` commits/ramas (`24b795c`, `a6a3371`) ya superados. `:16` "206 comprobaciones" (hoy 49 secciones). `:33,:45` plan "Q = 14 en Estación 24" ya no vigente (Q se entrega en la 11); sí acierta con X ("ya la da la Estación 10", `:36`). `:39` "Pope-E notas 2 y 3 (≈22/26)" vs STAGE §9 (23/27) vs IDEAS #10 (23/27) | Archivar; la tabla "Siguiente trabajo (21–28)" ya está en STAGE_PATH_BIBLE §6 |
| `docs/GRIMOIRE.md` (52 l.) | Diario de cuero entregado el 11-sep (anatomía, 15 primeras páginas, reliquario) | 20-oct | "11 sep 2026" | Físico | ⚠️ conflicto de formato | `:5-8` "cuero marrón, anillas, A5" vs PROJECT_MASTER "bolsillo NO A4"; `:50-52` "hasta 30 páginas" vs 26 hojas/52 caras reales. El término *Grimoire* sobrevive solo aquí/PROJECT_MASTER/LORE; el producto usa "journal/diario" | Fusionar en guía (sección "diario físico"), archivar |
| `docs/CINEMATIC_THE_ROAD_OF_SALT.md` (151 l.) | Guion/prompts de la cinemática (24-oct) | 26-oct | "24-10-2026" | Cinemáticas | 🟡 parcial | `:1` "2:40" vs `web/assets/cinematics/manifest.json` `"length": "1:45"`; el manifest apunta `"1080"` al mismo `_720.mp4` (no hay 1080). Parte 2 "Night of the Steles ≈1:10" (`:136`) existe como 0:59. Cita `road_of_salt_1080.mp4` inexistente (`:21`) | Mantener como doc de producción; actualizar duración |
| `docs/EMAIL_SETUP.md` (94 l.) | Cuenta Gmail y alternativas | 20-oct | sin fecha | Email | ✅ vigente / histórico | `:9` ruta `assets/order-profile-picture.png` movida a `assets/general/branding/`. `:91` "Decisión pendiente" obsoleta (cuenta activa) | Archivar |
| `docs/SILVIA_PLAYTHROUGH_LOG.md` (79 l.) | Registro de respuestas/estadísticas de Silvia (Supabase) | 24-oct | 24-oct | Datos del jugador | 🟡 desfasado | Se detiene en la Estación 12/quedó antes del 12-nov (`story-point.js:1-5`: Silvia al pie del Monolito el 12-nov). Contiene datos personales/gameplay | Mantener **fuera** de la guía; actualizar o regenerar con `journey_report.py` |
| `docs/design_system/README.md` + `01/02/03_*.md` (43/144/152/97 l.) | Sistema de diseño: arte A5, web/Hub (tokens, audio), voz y lore | 20-oct | sin fecha | Producción | 🟡 vigente en estética, obsoleto en estado | `03:55-59` tabla WHEN "Pendiente" (la Estación 19 ya lo entrega ✅). `02:123-143` persistencia `silvia_station_<id>_completed` + evento `stationSolved`: **no es lo que hace el Hub** (usa `order_*_completed`) → [CÓDIGO] `GAMES[].flag` en `hub-core.js:708-818`. `03:37-43` tono "teatral" de la Mirror Speaker | Mantener 01 y 02 (estética/tokens); corregir 02 §5.2 y 03 §3 |
| `web/README.md` | Índice de `web/` | 20-oct 21:04 | — | Web | ✅ vigente | `Estaciones 10 a 20` desfasado (hoy 10–22) | Mantener |
| `emails/README.md` | Estructura de correspondencia | 20-oct | — | Emails | 🟡 | Solo lista 01-opening y 02-cartographer; en disco existen también `constellation/02-zodiac-dispatch/` y `desert/01-emergency-wire-dispatch/` | Actualizar |
| `puzzles/README.md` (+`desert/`,`stage/README.md`) | Estructura de puzzles | 20-oct | — | Puzzles | ⚠️ stubs obsoletos | `puzzles/desert/README.md`: WHEN "Fecha y hora"; `puzzles/stage/` "Puzzles previstos" sin contenido real (el diseño vive en las Biblias) | Archivar |
| `scripts/README.md` (101 l.) | Herramientas + guía del smoke | 6-nov | — | Scripts | 🟡 | `:56-80` enumera 14 puntos del smoke; el smoke real tiene 49 secciones (ver §3.2). Falta `scripts/web/offline_list.py --check` (sí lo menciona en el .py) | Mantener, regenerar la lista de secciones |
| `scratch/README.md` | Reglas de `scratch/` | 6-nov | — | Higiene | ✅ | Las rutas listadas existen (comprobado) | Mantener |
| `assets/README.md` | Estructura de assets | 20-oct | — | Assets | ✅ | — | Mantener |

> Documentos no pedidos pero relevantes: `.github/workflows/lore-lint.yml` (corre el linter en cada push), `.github/workflows/secret-scan.yml`, `.pre-commit-config.yaml`.

## 1.2 Matriz de datos clave cruzados

| Dato | Valor en el CÓDIGO (verdad operativa) | Dónde coincide | Dónde discrepa |
|---|---|---|---|
| Nº de fragmentos de espejo | **9** (`web/assets/js/stage-mirror.js:18-28`, nodos 40–48; REFLECTED `:31`) | CLAUDE, AGENTS, STAGE_PATH_BIBLE, WEB_ECOSYSTEM | **8** en GEMINI.md:22, `.cursorrules:22`, `.cursor/rules/canonical-lore.mdc:28` |
| Estaciones por camino | Constellation 01–09 · Desert 10–19 · Stage 20–28 (+13B, escenas 13c/15b/15c no numeradas) | Todos los onboarding | WEB_ECOSYSTEM §5 "Estaciones 10–20" en HTML |
| Estaciones **construidas** | Hub: 10–22 (+Cairn I, 13B). 23–28 NO construidas (solo flags en `stage-mirror.js:22-27`, sin modal, sin `STAGE_OPENERS`) | WEB_ECOSYSTEM:69 | PROJECT_MASTER:119 "Stage Path … implementada" ambiguo |
| Hojas del diario | 26 hojas / 52 caras (`journal/page01…page26`) · PDF `00_DIARIO_COMPLETO_36_PAGINAS_A5.pdf` = hojas 01–18 | AGENTS:105, REPOSITORY_STRUCTURE:29 | GRIMOIRE.md:52 "30 páginas"; PROJECT_MASTER "bolsillo" |
| WHEN | **"18 – 20 December"**, sin hora (`web/index.html:4061,4085,4538`; `hub-core.js:2065,7283`; smoke `web_smoke.py:1267`) | CANONICAL:821 y :999, TIMELINE:23, WEB_ECOSYSTEM:65 | CLAUDE/AGENTS/PATHS "Fecha y hora"; brief del coordinador "18-dic-2026"; STAGE_PATH_BIBLE:184 "antes del 18 de diciembre (el WHEN)" |
| WHERE | Viena · Wiener Staatsoper (invertido en `stage-mirror.js:31`; hoja 26A da 48° 12′ N, 16° 22′ E [DOC STAGE §4.1]) | STAGE, CANONICAL §13, HANDOFF, IDEAS | PROJECT_MASTER "TBD" |
| WHAT | 2 entradas de ballet, Bóveda del Gran Eclipse (Torre I). **No hay código ni escena** del final | Todos | — |
| Guardián Torre II | The Oracle (femenina, "she"); es Aurelia (secreto) | CANONICAL §12 | AGENTS:52/CLAUDE:43 sitúan a Aurelia en Tower III (1974) |
| Pope-E | Solo en docs (0 menciones en `web/`: `grep Pope web/` = vacío; el código usa "ash seal"/"the key") | STAGE §9, CANONICAL §13 | HANDOFF "notas 2 y 3 en ≈22/26"; STAGE §9 "23 y 27" |
| Valores del Ledger | Permutación completa 1–26 (ver §2.1) | CANONICAL §7.B, STAGE §6 (J) | lore_and_puzzle_bible tabla "histórica" (H=11, J=14, Q=1, W=5, X=18, Y=19, Z=8…) |
| Duración del juego | 1-sep → 18-dic ≈ 108 días | — | "~56 días" en CLAUDE:32, AGENTS:33, PROJECT_MASTER:15,153, SESSION_LOG:11 |
| "Entrega"/Grimoire | Diario entregado 11-sep (Italia); hojas 19–26 impresas y entregadas (STAGE §4.1) | GRIMOIRE | PROJECT_MASTER "bolsillo, pre-relleno"; STAGE §1 "recibe las 8 hojas todas juntas al empezar el Stage Path" |
| Smoke | 49 secciones; último informe local `smoke_report.json` solo contiene sección `dream` (18 checks OK, 117 s, 15-nov 22:14) | scripts/README (14 puntos) | HANDOFF "206 comprobaciones" |
| PWA offline | 219 ficheros, 49.3 MB, VERSION `60fc1eb4950b` (`web/sw.js:9`) | `offline_list.py --check` OK | IDEAS:30 "31 MB" |
| Cinemáticas | `road_of_salt` 1:45, `night_of_steles` 0:59; ambos `available:true`; solo versión 720p (13–18 MB) | memoria del proyecto "<25 MB" | CINEMATIC doc "2:40" |

## 1.3 Tabla de solapamientos (tema → nº de documentos que lo repiten)

| Tema | Docs donde aparece (nº) | Quién debería ser SSOT |
|---|---|---|
| Resumen de lore + 3 Torres + mito Hermes/Aurelia | CLAUDE, AGENTS, GEMINI, .cursorrules, .mdc, PROJECT_MASTER, LORE, PATHS, CANONICAL §2/§8, design_system/03 (**≥10**) | CANONICAL §2 (y la guía maestra) |
| 11 reglas de oro / vocabulario blindado | CLAUDE, AGENTS, GEMINI, .cursorrules, .mdc, user-preferences, design_system/01+03, lore_and_puzzle_bible §2, STAGE §2, CANONICAL §8.C (**≥10**) | `.agents/rules/user-preferences.md` + linter |
| Protocolo de arranque (lista de docs a leer) | CLAUDE, AGENTS, GEMINI, .cursorrules, .mdc, user-preferences §12 (**6**) | 1 solo fichero (AGENTS.md) |
| Cipher Ledger (letras/valores/ecuaciones) | CANONICAL §7, lore_and_puzzle_bible §7, DESERT §…, STAGE §6, HANDOFF, WEB_ECOSYSTEM:90 y **código** `hub-core.js:3287-3320` (**6 + código**) | **El código** (`CLUE_EQUATIONS`) y su tabla en la guía maestra |
| Mapa de estaciones ↔ hojas | CANONICAL §9, DESERT §5/§5.B, STAGE §4/§6, HANDOFF, WEB_ECOSYSTEM §2, lore_and_puzzle_bible §6 (**6**) | DESERT §5.B + STAGE §4.1 (verdad impresa) |
| Claves localStorage por estación | WEB_ECOSYSTEM §3, DESERT_ODYSSEY, STAGE, design_system/02 §5.2 (obsoleto) (**4**) | Código (`TesterDesert.GAMES[]`, ver §2.2) |
| Pope-E | CANONICAL §13, STAGE §9, HANDOFF, IDEAS #10 (**4**) | STAGE §9 |
| Oráculo = Aurelia | CANONICAL §12 (+ DESERT §9 notas), STAGE | CANONICAL §12 |
| Calendario/fechas | TIMELINE, PROJECT_MASTER, CANONICAL §5, WEB_ECOSYSTEM:86, SESSION_LOG (**5**) | guía maestra (con fechas reales) |
| Grimoire/diario físico | PROJECT_MASTER, GRIMOIRE, LORE, SESSION_LOG, PATHS (**5**) | guía maestra |
| Field Wire | DESERT (estándar), WEB_ECOSYSTEM, lore_and_puzzle_bible §12, STAGE §6, HANDOFF (**5**) | DESERT_ODYSSEY (estándar) + tabla de pasos de §2.6 |
| Verificación (comandos R3) | CLAUDE, AGENTS, scripts/README, WEB_ECOSYSTEM §6, HANDOFF (**5**) | scripts/README |

## 1.4 Enlaces/rutas rotos (script propio sobre 36 ficheros .md; solo falsos positivos descartados a mano)

Rotos reales (la ruta citada no existe):
- `PROJECT_MASTER.md:119` → `web/hub/js/stations/stage-mirror.js` ✗ (real: `web/assets/js/stage-mirror.js`).
- `PROJECT_MASTER.md:99`, `docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md:116` → `assets/email-01-parchment.png` ✗ (no existe; el `.html` fuente está en `assets/general/emails/parchment-email-01.html`).
- `docs/ASSETS.md:16,18,28` → PNG de emails ✗ (no versionados).
- `docs/EMAIL_SETUP.md:9` → `assets/order-profile-picture.png` ✗ (hoy `assets/general/branding/…`).
- `docs/LORE.md:62` → `assets/parchment-email-01.html` ✗ (hoy `assets/general/emails/`).
- `docs/lore_and_puzzle_bible.md:150,246` → `assets/general/glyphs/rendered_png/glyph_{p,k}.png` (enlace markdown desde `docs/` resuelve mal; las imágenes existen en `assets/general/glyphs/rendered_png/`): ruta relativa incorrecta.
- `docs/CINEMATIC_THE_ROAD_OF_SALT.md:21` → `road_of_salt_1080.mp4` ✗ (solo existe `_720`).
- `docs/HANDOFF_STAGE_PATH.md:22` → `Hoja_20_Camera_Obscura_y_Whispering_Gallery.pdf` ✗ (no existe: los PDFs son `journal/page20/pdf/*`, `journal/impresion/hojas_doble_cara/`).
- `docs/STAGE_PATH_BIBLE.md:207,223`, `HANDOFF:51` citan `stage-mirror.js` sin ruta (resuelve a `web/assets/js/`, no a `web/hub/js/`).

Todos los enlaces markdown entre documentos principales (`[…](docs/…)`) resuelven ✓.

## 1.5 Estructura recomendada (propuesta)
1. `docs/GAME_MASTER_GUIDE.md` (nueva): SSOT del **estado** (estaciones, hojas, flags, Ledger, Wire, tiempos).
2. Mantener: `CANONICAL_…` (lore/cripto, tras limpiar §7.B), `DESERT_ODYSSEY_BIBLE` (Desert + estándar Wire), `STAGE_PATH_BIBLE` (Stage, §4/§6 reescritos), `user-preferences.md` (estética), `scripts/README.md`.
3. Un único `AGENTS.md` canónico + `CLAUDE.md`/`GEMINI.md`/`.cursorrules`/`.mdc` generados desde él.
4. Mover a `docs/archive/`: SESSION_LOG, PATHS_AND_CHARACTERS, LORE (tras extraer), GRIMOIRE, EMAIL_SETUP, IDEAS_BACKLOG, HANDOFF, lore_and_puzzle_bible §6-§12, puzzles/*/README.
5. Ampliar `lint_lore_and_vocabulary.py` para que **de verdad** compruebe lo que su docstring promete (§3.1).

---

# PARTE D2 · SISTEMAS DEL HUB

## 2.1 The Cipher Ledger

Dónde vive [CÓDIGO]: UI en `web/index.html` `#view-cipher` (`:1928`); lógica en `hub-core.js:3283-4110` (sección "6. THE CIPHER LEDGER"), **no** en `ledger-balance.js` (ese archivo es *The Surveyor's Balance*, 709 líneas, premio de la Estación 11).
Datos guardados (por perfil con `getSeekerKey`): `seeker_<silvia|carles>_cipher_ledger` (JSON `{letra: valor}`), `…_equations_order`, `…_equations_resolved` (`{id:true}`), `…_equations_open_editors`; `order_balance_state` (progreso de la Balanza por seeker); `order_silvia_oa_ledger_v1='done'` (siembra única de O=23, A=7 y resueltas `lat-min`,`zod-diff`: `hub-core.js:1101-1113`); `order_cipher_completed` (Estación 09, ≠ Ledger). Evento `ledger:changed`; API pública `window.EclipseLedger {equations(), value(ch), set(ch,n)}` (`hub-core.js:3434`).
Reglas [CÓDIGO]: campos numéricos 1–26, duplicados marcados `⚠ Dup`; las ecuaciones de desierto/stage solo se listan si `localStorage[requires]==='true'` (`isEquationUnlocked`, `:3320`). Silvia empieza con CERO valores salvo O=23 y A=7 sembrados (decisión del Operador, [DOC] WEB_ECOSYSTEM:88) — **excepción a la Regla 9** que `CLAUDE.md`/`AGENTS.md` no recogen.

### Tabla completa (verdad = `CLUE_EQUATIONS`, `hub-core.js:3287-3318`)

| id | Ecuación | Estación/lugar (etiqueta del código) | `requires` | Letra(s) nueva(s) | Valor(es) |
|---|---|---|---|---|---|
| lat-deg | K + G = 48 ° N | St. 06→07 Bearing | — (visible desde el inicio) | K, G | (con diff-kg) |
| lat-min | A + O = 30 ′ N | St. 06→07 | — | A, O | (con zod-diff) |
| zod-diff | O − A = 16 S | St. 07 Zodiacal Differential | — | **O=23, A=7** | sembradas a Silvia |
| lon-deg | B + P = 38 ° E | Vector I (Celestial Matrix, St. 06; glifo P) | — | B, P | |
| lon-min | E + V = 14 ′ E | Vector I | — | E, V | |
| lon-sec | F + T = 22 ″ E | Vector I | — | F, T | |
| diff-kg | K − G = 4 N | St. 09 Folio Limen | — | **K=26, G=22** | |
| diff-pb | P − B = 4 E | St. 09 | — | **P=21, B=17** | |
| diff-ve | V − E = 10 S | St. 09 | — | **V=12, E=2** | |
| diff-tf | T − F = 10 W | St. 09 | — | **T=16, F=6** | |
| chasm-xe | X + E = 17 | St. 10 "Above the Oasis Gate" | `order_whispering_chasm_completed` | **X=15** | |
| playa-ta | T − A = 9 | St. 11 marcador orilla sur | `order_salt_playa_completed` | (comprobación; Balanza) | 16−7 ✓ |
| playa-qe | Q + E = 16 | St. 11 pie del marcador | idem | **Q=14** | |
| stele-rf | R × 2 = F | St. 12 Stele (Nomad Ruins) | `order_desert_lexicon_completed` | **R=3** | 3×2=6 ✓ |
| stele-oz | O − Z = 18 | St. 12 pie de la estela Al-Qibla | idem | **Z=5** | |
| falcon-pa | P − A = 14 | St. 13 Falcon Stone | `order_oasis_clepsydra_completed` | (comprobación) | 21−7 ✓ |
| falcon-qz | Q + Z = 19 | St. 13 cleft bajo el halcón | idem | (comprobación) | 14+5 ✓ |
| cairn2-df | D + F = 24 | St. 14 tapa de Cairn II | `order_sun_monolith_completed` | **D=18** | |
| cairn2-ct | C − T = 8 | St. 14 | idem | **C=24** | |
| cairn3-wa | W + A = 26 | St. 15 bajo la placa de cobre de Cairn III | `order_sandstone_labyrinth_completed` | **W=19** | |
| cairn3-ne | N − E = 9 | St. 15 | idem | **N=11** | |
| cairn4-sum | S + U = 17 | St. 16 caña de bronce de Cairn IV | `order_cairn_iv_completed` | **S=13** | |
| cairn4-diff | U + Z = 9 | St. 16 | idem | **U=4** | |
| cairn5-yo | Y − O = 2 | St. 17 luz sobre Torre II | `order_arch_solstice_completed` | **Y=25** | |
| cairn5-lg | L + G = 23 | St. 17 | idem | **L=1** | |
| stele-hu | H − U = 16 | St. 18 bajo la trampilla del pozo | `order_polybius_stele_completed` | **H=20** | |
| stele-mt | M + T = 25 | St. 18 | idem | **M=9** | |
| oracle-zd | Z + D = 23 | St. 19 dorso del disco | `order_oracle_horizon_completed` | (comprobación) | 5+18 ✓ |
| oracle-ie | I + E = 12 | St. 19 | idem | **I=10** | |
| gallery-jt | J × 2 = T | St. 22 puertecilla del nicho | `order_whispering_gallery_completed` | **J=8** | 8×2=16 ✓ |

Valores (calculados por mí a partir de las ecuaciones; coinciden con CANONICAL §7.B): **A7 B17 C24 D18 E2 F6 G22 H20 I10 J8 K26 L1 M9 N11 O23 P21 Q14 R3 S13 T16 U4 V12 W19 X15 Y25 Z5**.
[INFERENCIA verificada por script mental] los 26 valores son una **permutación exacta de 1–26** (sin duplicados ni huecos).

### ¿Está completo el abecedario?
- **Sí, en el código**: las 26 letras tienen su ecuación. Orden de adquisición: 10 letras antes de la St. 10 (A B E F G K O P T V) → X (10) → Q (11) → R, Z (12) → [13: ninguna] → D, C (14) → W, N (15) → S, U (16) → Y, L (17) → H, M (18) → I (19) → **J (22, Stage)**. Las Estaciones 23–28 **no entregan ninguna letra ni ecuación** (y la 24 con "Q" y la 27 con "X" de las Biblias están obsoletas).
- **No falta ninguna letra**. Hueco real de diseño [DOC] CANONICAL §7.0 (`:541-545`): "ningún valor puede quedar para el Stage Path; J hay que adelantarla a una estación del desierto 14–19" → **no está hecho** (J sigue en la 22, §7.B.13 y código). ⚠️
- Letras del mensaje del 1-sep (CANONICAL:744 en §7.B.16): presentes `A C D E F H I K L M N O R S T U V W Y`; ausentes `B G J P Q X Z`. Los "glifos-letra nuevos" se asignaron a letras ausentes del mensaje: X (St.10), Q (St.11), Z (St.12) [memoria del proyecto; DOC §7.B.14-17].
- **¿Para qué sirve el valor final?** [DOC] `lore_and_puzzle_bible.md:191-195` (Fase D): "aplicando los valores a la profecía inicial… se revelan las coordenadas exactas y la butaca/clave de las entradas". [CÓDIGO] No existe ninguna escena/puzzle final (grep "Grand Eclipse" en `web/`: solo texto de relic `spyglass_lens` y Ask Hermes). Los valores hoy solo sirven para **verificar ecuaciones** y las coordenadas de Vector I (48°30′ N, 38°14′22″ E = el Santuario, **no** Viena 48°12′ N 16°22′ E). **NO DEFINIDO**: el mecanismo exacto del uso final de los 26 valores. ❓
- Mecanismo auxiliar ✅ `ledger-balance.js`: *Surveyor's Balance* (premio de la St. 11): detecta pares `+`/`−` sobre las mismas 2 letras (K±G, A±O, B±P, E±V, F±T…), 3 pasos tecleados por Silvia (suma de totales → mitad = letra mayor → resta = menor), pista en palabras sin cifras, "Write … in my Ledger" escribe SUS valores. Estado en `order_balance_state`. Se desbloquea con `order_salt_playa_completed`. Sección smoke `balance`.

## 2.2 Lista de `built: true` en `TesterDesert.GAMES` (`hub-core.js:708-824`), en orden

| # | id | tag | label | flag de completado | Qué hace `complete()` (resumen) | Walk/Wire de llegada (`ARRIVAL`, `:851-866`) |
|---|---|---|---|---|---|---|
| 1 | `cairn1` | Dawn | Cairn I · The Wash River Marker | `order_cairn1_completed` | + `order_cairn1_found`, `order_seal_cairn_1`, `order_dawn_step=3` | wire 4, nodo 22, dawn 2 |
| 2 | `chasm` | Station 10 | The Whispering Chasm | `order_whispering_chasm_completed` | + `order_desert_station_active=11` | wire 4, nodo 10, walk `order_chasm_march_bypassed` |
| 3 | `playa` | Station 11 | The Salt Playa | `order_salt_playa_completed` | + `order_salt_playa_path=[3,4,3,2,2,3,3]` | wire 4, nodo 21, walk `order_playa_march_bypassed` |
| 4 | `lexicon` | Station 12 | The Desert Lexicon | `order_desert_lexicon_completed` | + `order_desert_station_active=12` | wire 4, nodo 11, walk `order_lexicon_march_bypassed` |
| 5 | `clepsydra` | Station 13 | The Oasis Clepsydra | `order_oasis_clepsydra_completed` | + reliquias `water_skins`, `falcon_weight`, `order_clepsydra_done_at` | wire 6, nodo 12 |
| 6 | `gates` | Station 13B | At the Gates of Tower II | `order_gates_scene_completed` | + `order_monolith_gate_seal1` | wire 8, nodo 27, walk `order_gates_march_bypassed` |
| 7 | `s14` | Station 14 | The Sun Monolith · Cairn II | `order_sun_monolith_completed` | + `order_seal_cairn_2`, `order_sun_monolith_marks=4`, `order_night_erg` | wire 10, nodo 23, walk `order_monolith_march_bypassed` |
| 8 | `s15` | Station 15 | The Sandstone Labyrinth · Cairn III | `order_sandstone_labyrinth_completed` | + `order_seal_cairn_3`, `order_stones_dream` | wire 14, nodo 24, walk `order_labyrinth_march_bypassed` |
| 9 | `s16` | Station 16 | Cairn IV · Sentry of the Canyon | `order_cairn_iv_completed` | + `order_seal_cairn_4`, `tuning_pebble`, `order_bridge_spyglass` | wire 18, nodo 25, walk `order_cairn4_march_bypassed` |
| 10 | `s17` | Station 17 | The Arch of the Solstice · Cairn V | `order_arch_solstice_completed` | + `order_seal_cairn_5`, `signal_mirror` | wire 22, nodo 26, walk `order_cairn5_march_bypassed` |
| 11 | `s18` | Station 18 | The Polybius Stele · Tower II in Flames | `order_polybius_stele_completed` | + `servant_key` | wire 26, nodo 13, walk `order_stele_march_bypassed` |
| 12 | `s19` | Station 19 | The Oracle's Horizon · Aurelia | `order_oracle_horizon_completed` | + `order_oracle_when_read`, `gilded_star` | wire 30, nodo 14, walk `order_oracle_stair_bypassed` |
| 13 | `s20` | Station 20 | The Gate of a Thousand Masks · Tower III | `order_masks_gate_completed` | + `order_masks_carved=3` | wire 34, nodo 40, walk `order_masks_march_bypassed` |
| 14 | `s21` | Station 21 | The Camera Obscura · Tower III | `order_camera_obscura_completed` | + `order_camera_obscura_found=[flag,cart,shutter,smoke]` | wire 38, nodo 41 |
| 15 | `s22` | Station 22 | The Whispering Gallery · Tower III | `order_whispering_gallery_completed` | + `order_whispering_gallery_focus` | wire 42, nodo 42 |

15 juegos `built:true`; **ninguno** con `built:false`: Estaciones 23–28 no están ni siquiera declaradas en `GAMES`/`ARRIVAL` (el tester no puede saltar a ellas). Escenas extra sin estación pero con flag propio: `order_night_erg` (`s13c-night-erg.js`), `order_stones_dream` (`s15b-stones-dream.js`), `order_bridge_spyglass` (`s15c-bridge-spyglass.js`), Oasis Visions (`s13-oasis-visions.js`, `s13b-gates-extras.js`).

### Sincronización del Wire (`syncWire`, `hub-core.js:837-845`)
`syncWire('complete')` → `step = max(step, floor)`; `syncWire('replay')` → `step = min(step, cap)`; borra `order_messenger_unread_count` y `…_last_read_step`.

| Último juego hecho | floor | cap |
|---|:-:|:-:|
| ninguno (Cairn I/Chasm/Playa hechos → 4) | 0 (4) | 4 |
| `lexicon` | 6 | 6 |
| `clepsydra` | 8 | 9 |
| `gates` | 10 | 10 |
| `s14` | 11 | 14 |
| `s15` | 15 | 18 |
| `s16` | 19 | 22 |
| `s17` | 23 | 26 |
| `s18` | 27 | 30 |
| `s19` | 31 | 32 |
| `s20` | 35 | 38 |
| `s21` | 39 | 42 |
| `s22` | 43 | 44 (= `WIRE_LAST_STEP`) |

Hasta leer el Lexicon el chat se queda en el paso 4 (camino del Chasm y la sal). `setWire(step)` (usado por `jumpTo`) fuerza `order_field_wire_step`, rellena `order_field_wire_choices` con 0 y las 4 primeras respuestas canon `[2,0,1,0]`, y `order_field_wire_completed=true`.
`WALKS` (12 claves `…_bypassed`) = "Skip every walk" del tester.

## 2.3 Tabla por sistema

| Sistema | Archivos | Qué hace | Claves guardadas | Interactúa con | Estado |
|---|---|---|---|---|---|
| **Satchel / sellos de Cairn** | `satchel-and-cairn-one.js` (574 l.), catálogo `SATCHEL_RELICS` en `hub-core.js:6274+` | Cabecera con 5 huecos I–V; `grantCairnSeal(n)` (n=1–5) guarda `order_seal_cairn_n`, toast, ceremonia al 5.º (`showFiveSealsCeremony`). Visible desde que hay Wire/tormenta/sello. Contiene además el juego **Cairn I** (4 piedras, 3 cimientos, objetivo 2 pegs) | `order_seal_cairn_1..5`, `order_five_seals_celebrated`, `order_cairn1_completed/found/bypassed/optimal`, `order_cairn1_locked_until_3_cairns`, `order_satchel_expedition_item`, `order_inventory_relics` (+ copias `seeker_*_inventory_relics`) | Cairns 1–5 (S14–S17), Wire (`WIRE_FINAL_RELIC`), Gates (S13B/S14: `red_cord`, `servant_coin`, `statue_seal`) | ✅ |
| **Inventario / reliquias** | `hub-core.js:6272-6850` | 24 ids en `INVENTORY_ORDER`: `gilded_feather, order_wax_seal, surveyor_compass, flint_tinder, spyglass_lens, seal_cairn_1, water_skins, falcon_weight, lamp_oil, red_cord, servant_coin, statue_seal, ibis_figure, seal_cairn_2, seal_cairn_3, tuning_pebble, seal_cairn_4, signal_mirror, seal_cairn_5, servant_key, gilded_star, mirror_fragment_1..3`. Derivadas de banderas (`getOwnedRelicIds`) | idem | Todas las estaciones | ✅ (fragmentos IV–IX: no existen en el catálogo) |
| **Sellos de hoja (QR)** | `sheet-seals.js` (69 l.), `scripts/journal/sheet_seal.py`, `journal/stage_seals.json` | El QR de la cara de juego abre `?seal=CODE`; la sala permanece cerrada hasta escanearlo. Hash FNV-1a 32 bits | `order_sheet_seal_<nodo>` | Salas Stage 41–48 | 🟡 `SEALS = {41:'9682e2b4', 42..48:null}`: solo 20A tiene sello pegado. 20B y 21B, 22A, 24A, 25A, 26A impresas **sin** sello ([DOC] STAGE §4.1); 23A (nodo 45) tiene QR impreso (`77d1d1fa`) **sin pegar** en `SEALS[45]`. La 19B/Estación 20 (nodo 40) no usa sello |
| **Chronicles + Cuaderno de Hermes** | `view-chronicles` (`index.html:1770`), `field-journal.js` (249 l.) | Tarjetas fijas Game 03–09 + cuaderno automático: 1 página por juego resuelto (14 `PAGES`: cairn1, chasm, playa, lexicon, clepsydra, s14–s22; sin `gates`), con fecha, fallos, notas de pistas, tiempo desde la llegada, sketch | `order_journal` `{gameId:{at,fails,notes,arrived}}`, `order_ashes_clues` (pistas de Pope-E, fechas para la revelación de la Torre I) | hint-ladder, mirror-speaker, journey-profile, Aurelia letters | ✅ |
| **Cartas de Aurelia** | `aurelia-letters.js` (186 l.) | 3 cartas 1970–71 (cuadernos I–III) en Chronicles, ocultas hasta la audiencia con la Oráculo; sello de cera que se rompe; Hermes responde en el Wire | `order_aurelia_letters` `{I:{at,step}}` | Wire, S19, caras 21A/23B/25B | ✅ (las cartas II y III se abren con S23/S25: **no construidas**) |
| **Ask Hermes** | `hub-core.js:5315-6000` (`FIELD_INQUIRIES`), `previously.js`, `hint-ladder.js` | **66** preguntas prehechas (grupos: desert 39, stage 8, workshop 7, astrolabe 7, constellation 5) + "Previously on…" + notas de la escalera de pistas. Búsqueda, filtros, desbloqueo por `INQUIRY_UNLOCKS` (flags). Modo Carles las ve todas | `order_field_inquiries_read`, `order_wire_asks` | Todas | ✅ |
| **Escalera de pistas** | `hint-ladder.js` (140 l.) | 3 niveles: 1) tras 3 fallos o 10 min activos (dónde mirar), 2) 6 / 20 min (la regla), 3) 9 / 35 min (primer paso hecho con ella; nunca la respuesta). Tick 5 s, guarda cada 60 s. `define({id,station,title,group,anchor,solved,texts})`, `grant(id,n)`, `reset(prefix)` | `order_hint_<id>_fails/_secs/_level` | **31 escaleras**: `cairn1-stones`, `s10-chasm`, `s11-playa`, `s11-sump`, `s12-lexicon`, `s12-dial`, `s13-wells`, `s13-key`, `s13-visions`, `s14-sigil`, `s14-shadow`, `s15-sigil`, `s15-torches`, `s16-sigil`, `s16-song`, `s17-sigil`, `s17-dawn`, `s17-signal`, `s18-proverb`, `s18-knocks`, `s18-fire`, `s19-sigil`, `s19-disc`, `s19-vow`, `s20-word`, `s20-halves`, `s21-city`, `s22-focus`, `s22-echo` (+ s13c Erg y s15c Spyglass conceden notas gratis vía `grant`) | ✅ (S23–S28: nacerán con ella) |
| **Perfiles / vault** | `profiles.js` (100 l.), `hub-core.js:589-640` | `swap(from,to)` empaca todas las claves no-dispositivo en `eclipse_profile_vault_<seeker>` y desempaca las del entrante. Claves de dispositivo: `the_eclipse_active_seeker`, `the_eclipse_gate_ok_at`, `hub_sidebar_collapsed`, `eclipse_cloud_*`. Cuentas: Silvia (rol Seeker) y Carles (admin tester); el gate es solo de juego | `eclipse_profile_vault_<seeker>`, `the_eclipse_session_authenticated` (sessionStorage) | cloud-save, tester | ✅ |
| **Guardado en la nube** | `cloud-save.js` (188 l.), `cloud-config.js` (URL+clave publicable; público por diseño), `supabase/migrations/20261020000000_eclipse_cloud_save.sql` | En https y sin `?admin/?tester/?carles/?dev`: cada cambio de clave de partida → snapshot completo a Supabase a los 2 s (máx. 10 s), + eventos (`kind` key/session/view). Un navegador vacío pide `eclipse_latest_save` y recarga. RLS: anon solo INSERT; función `eclipse_latest_save(seeker)` security definer; poda a 300 snapshots + 1/día | `eclipse_cloud_queue`, `eclipse_cloud_ready_<seeker>` | todos | ✅ ⚠️ `HUB_VERSION='2026-10-20'` (`cloud-save.js:12`) no se actualiza |
| **Tester panel (Carles)** | `tester-panel.js` (113 l.), `window.TesterDesert` | Solo visible a Carles. Botones: **▶ Play this game** (`jumpTo`), **⏩ Complete up to here**, **⏭ Skip every walk**, **⏩ Complete every built game**, **↺ Replay the whole desert**; Silvia nunca los ve (`syncStormDevControlsVisibility`) | `order_tester_panel_open`, `eclipse_tester_open_node` | `GAMES`, `ARRIVAL`, `WALKS`, `syncWire` | ✅ (no cubre 23–28) |
| **Story point / journey** | `story-point.js` (140 l.), `journey-profile.js` (77 l.), `scripts/audit/journey_report.py` | `story-point` siembra una sola vez (`order_story_monolith_v1`) el viaje real de Silvia del 12-nov (106 claves, `eclipse_saves #392`): al pie del Monolito (S14 sin empezar), tras cruzar las Puertas por el camino humilde el 11-nov. `EclipseJourney.profile()`: tono, días, salas, notas, franja horaria, nombre dado a Hermes y objeto elegido (para el final y la carta a mano) | `order_story_monolith_v1` | cloud, Wire | ✅ (el consumidor —final— no existe) |
| **Previously on…** | `previously.js` (214 l.) | Tarjeta al abrir el Hub (retraso 1,2 s) y tras ≥12 h fuera; una línea por juego (`LAST`), "now/next" leídos del Wire; permanece en Ask Hermes | `order_last_seen_at` (cada 5 min), `eclipse_previously_shown` (session) | Wire | ✅ |
| **Offline/PWA** | `web/sw.js` (219 ficheros, 49.3 MB, VERSION `60fc1eb4950b`), `offline.js` (63 l.), `scripts/web/offline_list.py` | SW precachea Hub (hub/assets/shared); cinemáticas excluidas (streaming); los juegos `constellation/` se guardan al abrirlos; aviso "No signal"; versión nueva espera al próximo arranque (<8 s para entrar) | `eclipse_sw_reloaded` (session) | cloud (cola offline) | ✅ `--check` verde |
| **a11y** | `a11y.js` (116 l.) + `a11y.css` | Diálogos `role=dialog aria-modal`: foco dentro/Tab atrapado/Esc/devolver foco; tarjetas clicables con Enter/Espacio; contraste AA; objetivos táctiles 44 px | — | todos los modales | ✅ sección `a11y` |
| **Cinemáticas** | `cinematic.js` (164 l.), `web/assets/cinematics/manifest.json` | «The Road of Salt» (1:45, mientras Hermes camina las 3 h al Lexicon) y «The Night of the Steles» (0:59, al terminar el Lexicon). Solo 720p (13–18 MB), con VTT y póster | `order_cinematic_<id>_seen` | S12, `gamecine` | ✅ |
| **Sandstorm lockdown** | `sandstorm-lockdown.js` (611 l.), `hub-core.js:610-625` | Bloqueo de 48 h tras la St. 09 (`DURATION_48H_MS`); a las 24 h aparece el telégrafo; fin canónico `SUNDAY_OCT_18_2026_2PM = 1792324800000` (18-oct 14:00 CEST, verificado) | `order_sandstorm_active/_start_time/_target_time/_wire_unlocked/_wire_answered`, `seeker_silvia_sandstorm_active`, `order_storm_tester_bypassed`, `order_sandstorm_triggered` | Wire | ✅ ⚠️ comentario stale en `hub-core.js:955` ("48 h ending Sat 17 20:00") |
| **Mirror Speaker** | `mirror-speaker.js` (111 l.) | Línea en escritura de espejo al abrirse cada sala de la Torre III, firmada con una raya horizontal; depende de hora, fallos, notas y tono del Wire; se guarda y no cambia | `order_speaker_line_<nodo>` | field-journal, rooms 41–48 | ✅ (S20–S22) |
| **Stage pause** | `stage-pause.js` (42 l.) | Tras cada fragmento la siguiente sala espera N h: `HOURS = {41:3, 42:6, 43..48:null}` | `order_stage_pause_skipped_<nodo>` | Stage mirror, Wire | 🟡 solo 41 y 42 definidas |
| **Ambience** | `ambience.js` (526 l.) | Lecho sintetizado Web Audio por modal (≈24 `modal-*`), 11 escenas musicales (`dawn, canyon, salt, camp, wells, night, ridge, gates, labyrinth, sanctum, stage`); botón mute | `order_ambience_muted` | todos los modales | ✅ |
| **Wire (chat)** | `hub-core.js` (`EXPEDITION_THREAD`, `WIRE_CHAPTERS`), `wire-script-{monolith,bridge,tower,stage}.js`, `wire-script-marches.js`, `wire-ceremony.js`, `wire-ceremony.css`, `wire-chapters.css` | Ver §2.6 | `order_field_wire_step/_choices/_completed`, `order_wire_read(2)`, `order_wire_chapters_closed`, `order_wire_marchev`, `order_wire_rests`, `order_chat_sound`, `order_messenger_unread_count`, `order_messenger_last_read_step` | todas | ✅ hasta paso 44 |
| **Stage Mirror (mapa Path III)** | `web/assets/js/stage-mirror.js` (358 l.) + `stage-mirror-data.js` (generado por `scripts/journal/stage_mirror.py`) | Espejo veneciano roto en 9 fragmentos, caleidoscopio, `window.STAGE_OPENERS[nodo]`/`STAGE_CARDS`; el WHERE solo cuando el espejo está completo (texto invertido `'ANNEIV · REPOSTAATS RENEIW'`) | `order_stage_mirror_seen` (máscara de bits) | Stations 20–28 | 🟡 9 flags definidos (`order_automaton_orchestra_completed`, `…_fly_tower_…`, `…_shadow_theatre_…`, `…_hall_of_mirrors_…`, `…_kaleidoscope_lantern_…`, `…_mirror_stage_…`) sin juego |
| **Gates/otros** | `gates-road.js` (135 l.), `dawn-map-layer.js`, `game-frame.js`, `hide-solve-shortcuts.js`, `engine/*` | Reglas puras del camino en las Puertas (`order_gates_path` humble/bold/observer, `order_gates_flags`: regard −4..+7, gaveOil, lostOil…, `order_monolith_march_hours` 9–14 h/≤20, `order_night_erg`, `order_gates_return`); capa de mapa del amanecer; botones de pantalla completa; ocultar atajos de resolver a no-admins | ver arriba | S13B–S18 | ✅ |

## 2.4 Esperas y tiempos del Wire / pausas (`makeMarch`, `hub-core.js:8023-8190`)

| Tramo | Horas | Clave de inicio | Empieza al responder el paso | Notas |
|---|:-:|---|:-:|---|
| Tormenta→Chasm | 26 | `order_chasm_march_start` | (storm wire) | `CHASM_MARCH_HOURS=26` |
| Chasm→Playa (noche en la Oasis Gate) | 10 | `order_playa_march_start` | — | luz del alba en la Playa |
| Playa→Lexicon | 3 | `order_lexicon_march_start` | — | cinemática «Road of Salt» |
| Clepsydra | 0 | — | — | espera hasta resolver Lexicon |
| Camp VIII→Puertas de la Torre II | 6 | `order_gates_march_start` | — | desde el minuto en que se resolvió la Clepsydra |
| Puertas→Monolito (Erg) | 12 (base; 9–14 según camino, `GatesRoad.marchHours`, congelado al salir) | `order_monolith_march_start` | 9 | `MARCH_STARTED_BY_ANSWER[9]` |
| Monolito→Laberinto | 6 | `order_labyrinth_march_start` | 13 | |
| Laberinto→Cairn IV | 18 | `order_cairn4_march_start` | 17 | |
| Cairn IV→Arco | 18 | `order_cairn5_march_start` | 21 | sin dormir |
| Arco→Torre II en llamas | 6 | `order_stele_march_start` | 25 | |
| Escalera interior (St. 19) | 0 (sin espera) | `order_oracle_stair_start` | 29 | |
| Torre II→Torre III | 18 | `order_masks_march_start` | 33 | pasos 33 (salida), 34 (en camino), 35 (balance S20 + nota sellada), 36 (cierre) |
| Pausa S20→S21 | 3 | `order_stage_pause_skipped_41` | — | `stage-pause.js` |
| Pausa S21→S22 | 6 | `…_42` | — | |
| S22→S23 y siguientes | NO DEFINIDO (`null`) | | | |
Suma de esperas mínimas hasta S22 ≈ 26+10+3+6+12+6+18+18+6+18+3+6 = **132 h** (≈5,5 días) [INFERENCIA, solo tramos con hora definida].

## 2.5 Estructura del Field Wire (para la guía)
- `WIRE_LAST_STEP = 44` (`hub-core.js:5846`). Capítulos (`WIRE_CHAPTERS`, `:7039`): 0 "The Red Storm · The Salt Road and the Four Wells" (pasos 0–8) · 9 "The Five Cairns · Seals of the Sun" (9–24) · 25 "Tower II in Flames · The Oracle" (25–32) · 33 "The Mirror Sanctuary · Tower III" (33–40) · 41 "The Whispering Gallery" (41–44).
- Patrón [CÓDIGO]: llegada = `ARRIVAL.wire` (S14=10, S15=14, S16=18, S17=22, S18=26, S19=30, S20=34, S21=38, S22=42); cierre/debrief con reliquia = pasos 12, 16, 20, 24 (`WIRE_FINAL_RELIC`: seal_cairn_2..5), 36/40/44 (`mirror_fragment_1..3`); telemetría final del paso 32 = "THE FIRST TRUTH · WHEN: 18 – 20 DECEMBER · [Z]+[D]=23 · [I]+[E]=12".
- Guion en `wire-script-monolith.js` (10–16), `-bridge.js` (17–24), `-tower.js` (25–32), `-stage.js` (33–44); eventos de marcha en `wire-script-marches.js` (tramos 10, 14, 18, 22, 26, 34); ceremonia de cierre en `wire-ceremony.js` (escenas por primer paso del capítulo nuevo: 25 …).
- Pasos 0–9: hilo de tormenta/amanecer/Chasm en `hub-core.js` (`order_chasm_wire`, `order_dawn_choices`, `order_field_wire_choices`).

---

# PARTE D3 · VERIFICACIÓN

## 3.1 `scripts/audit/*.py`

| Script | Qué comprueba | Observaciones |
|---|---|---|
| `lint_lore_and_vocabulary.py` (178 l., mtime 20-oct) | Regex de términos prohibidos (`Sunken, Coastal, Coast, Hermit/Ermitaño, Stage Mistress`) y jerga (`Azimuth, Mucro(nes), Tympan(um), Mater, Stereographic`) en `docs emails journal scripts web .agents .cursor` (ext. md/html/js/css/json/py/mdc; ignora `.git .gemini scratch node_modules .wrangler`). Exime `scripts/journal/build_page04_05.py` como "legacy impreso" | ⚠️ **El docstring promete** "nombres canónicos de las tres torres" y "consistencia matemática del ledger" (`:15-16`) pero **no hay código** que lo haga (grep `ledger`/`tower`: solo mensajes de regex). No escanea los `.md` de la raíz (`CLAUDE.md`, `AGENTS.md`, `PROJECT_MASTER.md`) ni `supabase/` ni `.github/` (TARGET_DIRS). No comprueba Regla 9 (números de letras) ni "Pope-E/WHERE en claro" (eso lo hace el verificador de hojas y el smoke) |
| `web_smoke.py` (4 905 l.) | Playwright/Chromium contra un server local con las cabeceras de `web/_headers` (CSP). **49 secciones** en `SECTIONS` (`:4812`), `--quick` (33), `--only`, `--jobs` (def. 2), `--chromium`. Escribe `scripts/audit/smoke_report.json` (git-ignorado) | ⚠️ El docstring inicial enumera 31 secciones; el README 14; el código 49 |
| `journey_report.py` (69 l.) | Abre el Hub headless con el `progress` de un snapshot de Supabase y vuelca `EclipseJourney.profile()` (para la carta a mano del cofre) | Depende de `web_smoke` |
| `smoke_report.json` | Último informe local (15-nov 22:14): `{"ok":true,"checks":18,"sections":[{"section":"dream","ok":true}]}` | **No es una pasada completa**: solo corrió `--only dream`. No hay evidencia local de la última pasada completa |

## 3.2 Secciones del smoke y cobertura por estación (clave → test → qué cubre)

`pages` (1 · carga de todas las páginas sin errores JS/CSP) · `views` (2 · vistas por perfil) · `wire` (3 · el Wire no ofrece respuestas S12/S13 antes de tiempo) · `ledger` (4 · ecuaciones solo tras su estación) · **`s14`–`s19`** (5–10 · Estaciones 14–19 de principio a fin) · `profiles` (11) · `tester` (12) · `testerworld` (44) · `mirror` (13 · Espejo Vivo) · **`s20`** (14) · `cloud` (15) · `hints` (16) · `early` (17 · pistas S10–S13 y Cairn I) · `previously` (18) · `notebook` (19) · `pause` (20) · `ambience` (21) · `ashes` (22 · pluma y mensaje interceptado tras S20) · `speaker` (23) · `letters` (24) · `journey` (25) · `seals` (26) · `a11y` (27) · `offline` (28) · **`camera`** (29 · S21) · **`gallery`** (30 · S22 y `[J]×2=[T]`) · **`chasm`** (31 · S10) · `veil` (32 · estaciones selladas con cuenta atrás) · `portal` (33 · punto de historia 23-oct) · `playahold` (34) · **`playa`** (35 · S11, 65 checks) · `balance` (36) · **`lexicon`** (37 · S12) · `reduced` (38 · reduce-motion S11/S12) · `cinematic` (39) · `road` (40 · Playa→Lexicon) · `gamecine` · **`visions`** (42 · S13: mediodía en Camp VIII, Registry) · `gatesmarch` (43) · `dream` (45 · Stones Dream) · `spyglass` (46) · `wirechat` (47) · `wiremarch` · `wireux`.

Cobertura por estación:
| Estación | Sección | Estado |
|---|---|---|
| Constellation 01–09 | solo `pages` (carga sin errores); **no hay partida completa** | 🟡 |
| Cairn I (Dawn) | `early` (pistas) + `portal`/`playahold`; sin partida completa dedicada | 🟡 |
| 10 | `chasm` | ✅ |
| 11 | `playa`, `playahold`, `balance`, `reduced` | ✅ |
| 12 | `lexicon`, `road`, `reduced`, `cinematic` | ✅ |
| 13 | `visions` (+ `gatesmarch`, `wire`) — sin un test "end-to-end" del puzle de la clepsidra salvo `visions` | 🟡 |
| 13B Gates scene | `gatesmarch` solo cubre la marcha de 6 h; la escena 3D de las Puertas no tiene sección propia | 🟡 |
| 14–19 | `s14`…`s19` | ✅ |
| 20 | `s20`, `mirror`, `ashes`, `seals` | ✅ |
| 21 | `camera` | ✅ |
| 22 | `gallery` | ✅ |
| 23–28 | **ninguna** (no construidas) | ❓ |
| Final (Torre I / Bóveda) | **ninguna** | ❓ |
→ Hay una sección por estación 10–22 (salvo la escena 13B y la Constellation), no hay para 23–28.

## 3.3 Otras herramientas de verificación
- `scripts/journal/verify_sheets.py [--sheets 19-26]`: dibuja cada cara y comprueba colisiones texto–dibujo (≥40 px), tamaño de letra (≥22 px), vocabulario, Reglas 9/10 y sellos; **bloquea** las hojas 19–26 con errores; hojas 1–18 solo informa. Corre dentro de `build_stage_path.py`. (No ejecutado por mí: requiere OpenCV/pypdf; la regla R3 del repo lo exige.)
- `scripts/journal/sheet_seal.py`: crea (una vez) los códigos en `journal/stage_seals.json`, valida QR con OpenCV, imprime el hash para `SEALS`.
- `scripts/journal/tests/` (4 tests: `test_game_c1.py`, `test_journal_pipeline.py`, `test_page04_05.py`, `test_page06_07.py`): solo hojas antiguas.
- `scripts/web/offline_list.py [--check]`: regenera/comprueba la lista de `web/sw.js`.
- `.github/workflows/lore-lint.yml` (linter en cada push/PR) y `secret-scan.yml` (gitleaks historial completo); `.pre-commit-config.yaml`.
- `scratch/verifications/*`, `scratch/hub_tests/*`: scripts manuales (no CI), algunos cubren Chasm/Lexicon/Gates.

## 3.4 Ejecuciones hechas en esta auditoría
| Comando | Resultado |
|---|---|
| `python3 scripts/audit/lint_lore_and_vocabulary.py` | **Exit 0** · "ÉXITO TOTAL: 0 Términos no canónicos" · 260 archivos analizados · **19 advertencias de vocabulario** (todas `scripts/journal/build_page04_05.py`: *Mater, Tympan, Stereographic*, hoja 4A/5A impresa el 28-sep, exenta como "legacy") |
| `python3 scripts/web/offline_list.py --check` | **Exit 0** · "web/sw.js: the offline list is current" |
| `python3 scripts/audit/web_smoke.py`, `verify_sheets.py` | **No ejecutados** (el encargo lo excluye; el smoke completo tarda ≈11 min y se hizo 206 checks en 20-oct según HANDOFF). Riesgo no cubierto: no hay evidencia de pasada completa posterior al 15-nov (cambios en `wire-script-*`, `hub-core.js` del 15-nov) |

## 3.5 Estado de verificaciones que el repo exige (CLAUDE.md §5 / AGENTS.md §6)
1. Lint lore y vocabulario → ✅ verde (con 19 exenciones legacy).
2. `verify_sheets.py --sheets 19-26` → ❓ no ejecutado.
3. `offline_list.py` → ✅ al día.
4. Smoke (`ALL GREEN` antes de desplegar, `WEB_ECOSYSTEM:110`) → ❓ última pasada completa desconocida.

---

# CONCLUSIÓN FINAL

## (a) LISTA DE CONFLICTOS

| Tema | Fuente A | Fuente B | Cuál parece vigente y por qué |
|---|---|---|---|
| Nº de fragmentos de espejo | CLAUDE.md:22, AGENTS.md:20,46 → 9 | GEMINI.md:22, .cursorrules:22, canonical-lore.mdc:28 → 8 | **9** (código `stage-mirror.js:18-28`, STAGE_PATH_BIBLE §1 "9 estaciones") |
| Q del Ledger | CANONICAL:726,746 y código `playa-qe` → Estación 11 | STAGE_PATH_BIBLE:130 y HANDOFF:33,45 → "Q = 14 en Estación 24"; tabla §4/§6 "V · ecuación Q" | **Estación 11** (código) |
| X del Ledger | Código `chasm-xe` + CANONICAL §7.B.14 → Estación 10 | STAGE §4 (25A "VIII · ecuación X") y §6 ("Fragmento VIII · X"); HANDOFF:36 sí es correcto | **Estación 10** |
| J del Ledger | CANONICAL §7.0 (`:541-545`): adelantar J a St. 14–19 | CANONICAL §7.B.13, STAGE §6, código `gallery-jt` → St. 22 | **Código/§7.B.13** (St. 22); el invariante §7.0 queda **incumplido** (decisión pendiente del Operador) |
| Tabla de valores | `lore_and_puzzle_bible.md:163-176` (A7 B17 C24 D15 E2 F6 G22 H11 I10 J14 K26 L13 M4 N9 O23 P21 Q1 R3 S25 T16 U20 V12 W5 X18 Y19 Z8) | Código/CANONICAL §7.B (D18 H20 J8 L1 M9 N11 Q14 S13 U4 W19 X15 Y25 Z5) | **Código** (el propio doc dice que la tabla es histórica) |
| Regla 9 (cero datos iniciales) | user-preferences §10, AGENTS regla 9 | WEB_ECOSYSTEM:88 + `hub-core.js:1101-1113`: Silvia sembrada con O=23, A=7 | Excepción vigente (decisión del Operador); documentarla en las reglas |
| WHEN | Código/CANONICAL:821/TIMELINE:23: "18–20 de diciembre, sin hora" | CLAUDE:38, AGENTS:45, PATHS:11, puzzles/desert: "Fecha y hora"; brief: "18-dic-2026"; STAGE:184 "antes del 18 de diciembre" | **18–20 dic sin hora** es lo que Silvia ya leyó (`index.html:4061`); la fecha única 18-dic es decisión pendiente |
| Duración | CLAUDE:32, AGENTS:33, PROJECT_MASTER:15 "~56 días" | Realidad 1-sep→18-dic ≈108 días | "~56" es el plan original; obsoleto |
| Destino de Aurelia | CANONICAL §12 (superviviente, es la Oráculo en Torre II desde 1971) | CLAUDE:43/AGENTS:52/GEMINI:43 (refugiada en Tower III en 1974, "desaparece en cumbres") | **CANONICAL §12** (S19 ya construida la revela) |
| Cuaderno de Aurelia (hojas) | STAGE §4: **21A**, 23B, 25B | CLAUDE:43/AGENTS:52: 21B, 23B, 25B | **21A** (21B es *The Automaton Orchestra*) |
| Pope-E en las notas impresas | STAGE §9: Pope-E solo en 2026 | STAGE §4.1 (24B/25B impresas nombran a Pope-E en 1970) | Lo **impreso manda** (decisión del Operador); §9 hay que ajustarlo |
| Notas de Pope-E | STAGE §9, IDEAS #10: notas 2 y 3 en S23 y S27 | HANDOFF:39: "≈ Estaciones 22/26" | STAGE §9 |
| Hojas entregadas | STAGE §4.1/§10: Hojas 19–26 impresas y entregadas | STAGE §1: "las 8 hojas todas juntas al empezar el Stage Path" ; GRIMOIRE "30 páginas" | Estado real = impresas/entregadas; §1 es plan |
| Formato del diario | PROJECT_MASTER:27,93 "bolsillo, NO A4, pre-relleno" | GRIMOIRE:5-8 cuero A5 con anillas; AGENTS:105 26 hojas A5 | A5 con anillas |
| Ubicación de `stage-mirror.js` | PROJECT_MASTER:119 `web/hub/js/stations/` | Real `web/assets/js/stage-mirror.js` (WEB_ECOSYSTEM:82 ✓) | Real |
| Wire Stage | WEB_ECOSYSTEM:82 / HANDOFF:14 "pasos 33–36" | Código `WIRE_LAST_STEP=44`; STAGE §10 "33–44" | **33–44** |
| Persistencia | design_system/02 §5.2 `silvia_station_<id>_completed` + evento `stationSolved` | Código `order_<juego>_completed` en `GAMES[].flag` | Código |
| Duración cinemática | CINEMATIC doc 2:40 | manifest.json 1:45 | manifest |
| Tono Mirror Speaker | PATHS:57 "no teatro, no ballet"; PROJECT_MASTER:69,144 | design_system/03:39-43 "teatral… telones, máscaras" | Reglas del Operador: sin teatro/ballet en diálogos (PROJECT_MASTER "Descartado") |
| Smoke | HANDOFF:16 "206 comprobaciones" | 49 secciones; scripts/README 14 puntos | Código |
| PWA tamaño | IDEAS:30 "31 MB" | `sw.js:9` 49.3 MB | `sw.js` |
| Terminología "cipher" | user-preferences §6 (evitar "cipher") | Nombres canónicos *Cipher Ledger*, *Celestial Cipher*, `view-cipher` | Se mantiene "Cipher Ledger" (uso del producto); la regla es solo para textos nuevos |
| Estado de Silvia | SILVIA_PLAYTHROUGH_LOG (24-oct) | `story-point.js` (12-nov, Monolito) | story-point (más reciente); el log está stale |
| Hojas impresas con jerga | AGENTS regla 6 (prohibido Mater/Tympan/Stereographic) | Hoja 4A/5A impresa los contiene; CANONICAL §11 lo explica | Exención legacy aceptada |
| Lint vs docstring | Docstring: comprueba torres y ledger | Código: solo regex | Código (hay que implementar o cambiar el docstring) |

## (b) LISTA DE HUECOS

1. **Final del juego sin construir** ❓: Torre I (retorno al Constellation Path), revelación de Pope-E = Carles, el WHAT, escena de la Bóveda del Gran Eclipse, final según estilo de juego (el perfil `journey-profile.js` está listo pero nadie lo consume).
2. **Estaciones 23–28** ⏳ sin construir (Automaton Orchestra, Fly Tower, Shadow Theatre, Hall of Mirrors, Kaleidoscope Lantern, Stage of the Mirror Speaker), sin `GAMES`/`ARRIVAL` para el tester, sin pasos de Wire (>44), sin `STAGE_CARDS`, sin sellos (`SEALS[43..48]=null`), pausas (`HOURS[43..48]=null`), ni letras de Ledger.
3. **Uso final de los 26 valores del Ledger**: NO DEFINIDO (solo Fase D en `lore_and_puzzle_bible`). J en St. 22 incumple el invariante §7.0.
4. **WHEN definitivo**: el juego ya mostró "18–20 December"; el coordinador cita 18-dic. Decidir fecha/hora exactas y reconciliar con lo que Silvia ya leyó.
5. **Hoja 26A pide "marcas de los márgenes de las hojas 19–26" que no se imprimieron** ([DOC] STAGE §4.1) → la ceremonia de S28 debe resolverse sin ellas.
6. **Sellos QR**: solo 20A cableado; falta pegar `77d1d1fa` (23A) en `SEALS[45]`; el resto de caras sin sello.
7. **Sin partida completa en el smoke** para Constellation 01–09, Cairn I y la escena 13B; y sin evidencia de pasada completa reciente (`smoke_report.json` = `dream`).
8. **`verify_sheets.py` no verificado** en esta auditoría.
9. **Documentación**: la guía maestra no existe; 5 copias del onboarding; lint no valida lo que promete; rutas rotas (§1.4).
10. **Hint ladder**: S23–S28 "nacerán con ella" (no hay).
11. **Cuenta de Pope-E en lint**: no hay chequeo automático de que `web/` no contenga "Pope"/"Staatsoper" en claro (solo smoke/HANDOFF lo afirman).
12. **Constantes/desfases menores**: `HUB_VERSION='2026-10-20'` en `cloud-save.js:12`; comentario stale en `hub-core.js` sobre la tormenta ("Sat 17 20:00"); `manifest.json` cinemáticas apunta "1080" a un 720.

## (c) DATOS TRANSVERSALES

- **Perfiles**: `silvia` (Seeker) y `carles` (admin tester, ve todas las estaciones y los botones del Tester). `?admin=1|?carles=1|?tester=1` activan modo tester; `?dev=1` solo el sandbox de la tormenta; `?cloud=0|1`, `?sw=0|1` fuerzan nube/offline. El gate de login es de juego (contraseñas triviales en el cliente; SECURITY.md lo declara).
- **Nube**: proyecto Supabase `aoochekcbugawaurllco`, tablas `eclipse_saves` y `eclipse_events`, función `eclipse_latest_save`; no corre en local ni en URLs tester.
- **Claves de dispositivo (no viajan en el vault ni en la nube)**: `the_eclipse_active_seeker`, `the_eclipse_gate_ok_at`, `hub_sidebar_collapsed`, `eclipse_cloud_*`, `eclipse_profile_vault_*`.
- **Fin de la tormenta**: `SUNDAY_OCT_18_2026_2PM = 1792324800000` (18-oct-2026 14:00 CEST, comprobado).
- **Escalera de pistas**: umbrales 3/6/9 fallos o 10/20/35 min activos; "nunca la respuesta".
- **Satchel**: 5 sellos de Cairn (ceremonia al 5.º), reliquias derivadas de flags, `lamp_oil` se gasta en la noche del Erg; Fragmentos I–III del espejo son reliquias (IV–IX no existen).
- **Ask Hermes**: 66 preguntas + notas de 31 escaleras + "Previously on…".
- **Vocabulario**: términos prohibidos solo vigilados por regex; jerga astronómica prohibida *en nuevo*; legacy en `build_page04_05.py`.
- **Reglas de oro** (11) idénticas en CLAUDE/AGENTS/.cursor*: títulos limpios, estética Da Vinci/Kepler/Dürer, cero colisiones texto–dibujo (40–80 px), troquelado (cara A X<165 px y cara B X>1583 px con 0 px), tipografía 62–66/35–38/28–33/≥22 px, vocabulario simple, agencia de Silvia, canon Astrolabio (6 estrellas `Ald Pol Veg Alt Den Arc`), cero datos iniciales en el Ledger, solo A–Z, higiene (`scratch/`).
- **Esperas acumuladas** hasta S22: ≈132 h (ver §2.4); hay 32 días hasta el 18-dic.
- **Cronología fija**: 1-sep Email 1 (22:22, asunto "Something shifted", Silvia elige THE CONSTELLATION PATH) · 2-sep Email 2 · 11-sep diario físico · 12-sep radio · 14-sep Email 3 · 25-sep Email 4 · 28-sep Estación 08 · 8-oct apertura S09 · 10-oct Email 5 · 8/9→18-oct tormenta (fin 14:00) · 12-nov Silvia al pie del Monolito (story-point) · 16-nov hoy · 18–20 dic WHEN [DOC TIMELINE.md:12-25].
- **Git**: R4 — nada de commit/push sin orden textual; stage selectivo. Estado: CLAUDE.md, AGENTS.md y DESERT_ODYSSEY_BIBLE.md modificados sin commit (la corrección 8→9 fragmentos y el bloque "Detalles de historia aprobados el 15-11-2026").

Fuentes principales: `CLAUDE.md:22,32,43`; `AGENTS.md:20,33,46,52,105`; `GEMINI.md:22`; `.cursorrules:22`; `.cursor/rules/canonical-lore.mdc:28`; `PROJECT_MASTER.md:15,27,99,119`; `docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md:541-545,705,726,746,821,970-1014`; `docs/STAGE_PATH_BIBLE.md:11,49-104,130,188-226`; `docs/HANDOFF_STAGE_PATH.md:3-53`; `docs/WEB_ECOSYSTEM.md:66-90`; `docs/IDEAS_BACKLOG.md:6-30`; `web/hub/js/hub-core.js:708-866,3287-3320,3434,5315,5846,5891,6274,6547-6590,7039,8023-8187`; `web/hub/js/{ledger-balance,satchel-and-cairn-one,sheet-seals,field-journal,hint-ladder,profiles,cloud-save,tester-panel,story-point,journey-profile,previously,offline,a11y,cinematic,sandstorm-lockdown,mirror-speaker,ambience,aurelia-letters,stage-pause,gates-road}.js` (cabeceras); `web/assets/js/stage-mirror.js:18-31`; `web/sw.js:9`; `web/assets/cinematics/manifest.json`; `scripts/audit/{web_smoke.py:4812-4905,lint_lore_and_vocabulary.py:1-60,journey_report.py,smoke_report.json}`; `scripts/web/offline_list.py`; `supabase/migrations/20261020000000_eclipse_cloud_save.sql`.
