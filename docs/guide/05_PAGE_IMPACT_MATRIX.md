> **GUÍA MAESTRA · Parte 5 · Impacto de cada cara del Journal en la web** · Anexo de [docs/GAME_MASTER_GUIDE.md](../GAME_MASTER_GUIDE.md) · Auditoría del 16-nov-2026 sobre el árbol de trabajo (incluye la J en S19 ya implementada en local). Marcas: [DOC] · [CÓDIGO] · [INFERENCIA] · ✅ ⏳ ❓ ⚠️. Las **PROPUESTAS** de este anexo **no están aprobadas**; solo mandan las decisiones registradas en la guía maestra §5.0. Ante discrepancia manda el código; el papel impreso es inmutable.

# E · Matriz de impacto de CADA cara del Journal en la web

> Materia prima para `docs/GAME_MASTER_GUIDE.md` (parte E). Auditoría a 16-nov-2026 sobre el worktree `game-context-docs-ed9d0b` (HEAD `ec7ce59` + cambios sin commit). Solo lectura; no se ejecutó el smoke ni se abrió navegador.
> Marcas: [DOC] lo que dice un documento · [CÓDIGO] lo que hace el código · [INFERENCIA] deducción mía · ✅ 🟡 ⏳ ❓ ⚠️ (estados del brief).
> Abreviaturas: HC = `web/hub/js/hub-core.js` · IDX = `web/index.html` · WSS = `wire-script-stage.js` · WST = `wire-script-tower.js` · WSB = `wire-script-bridge.js` · WSM = `wire-script-monolith.js` · WSX = `wire-script-marches.js` · AL = `aurelia-letters.js` · FJ = `field-journal.js` · SS = `sheet-seals.js` · SP = `stage-pause.js` · LC = `ledger-complete.js` · G00 = `docs/GAME_MASTER_GUIDE.md` · G01..G04 = `docs/guide/01..04` · IB = `docs/IDEAS_BACKLOG.md` · A-nn / D-nn / R-nn = decisiones y conflictos de G00 §5 y §6.
> Método: para cada cara busqué (grep) el **título impreso exacto**, «Sheet NN[AB]», el nombre de archivo de la hoja y las claves/flags en `web/hub/js/**`, `web/hub/js/stations/*.js`, `web/index.html`, `web/constellation/**`, `web/assets/js/**`, `web/shared/**`. «0 coincidencias» significa eso, no «imposible».

---

## 0. Cómo la web «nombra» o «usa» una página hoy (mecanismos reales)

| # | Mecanismo | Dónde | Hechos exactos |
|---|---|---|---|
| M1 | **Pastilla 📖** automática | `formatJournalCallouts`, HC:5993-6004; se aplica a todo texto del Wire/Ask Hermes/elecciones (HC:7382, 7704, 7783, 7809, 7878, 8444, 8777, 9567) | Convierte en pastilla (a) cualquier «Sheet NN[AB]» y (b) cualquier título entre comillas curvas «“…”» **que coincida exactamente** con `JOURNAL_SHEETS[k].title`. Un título que no esté en `JOURNAL_SHEETS` **no** se convierte en pastilla. |
| M2 | **Tarjeta de página** (popover) | `JOURNAL_SHEETS` HC:6006-6042 + `openSheetPopover` HC:6082-6137 | 35 claves: `4 5 6 6A 6B 7 7A 7B 8A 8B 9A 9B 10A 10B 11A 11B 12A 12B 13A 13B 14A 14B 15A 15B 16A 16B 17A 17B 18A 18B 19A 19B 20A 20B 21B`. Muestra título, nota, miniatura (`thumb`), botón «🗺️ ir a la estación» (`node`) o «Open the Grand Desert Map» (`mapOnly`). |
| M3 | **Visor de la página impresa** | `openPageViewer` HC:6050-6070 | Solo **7 páginas** tienen imagen (`page:`): 13B, 14A, 14B, 15A, 15B, 16A, 16B (`web/assets/journal_pages/page_*.webp`). Dentro de los juegos la pastilla con `data-open="page"` abre el visor directo (IDX:3573, 3633-3634, 3706, 4606, 4756, 4889). |
| M4 | **Escena rejugable desde la tarjeta** | HC:6088-6092, 6027-6031 | `scene:'dream'` en **14A** (`StonesDream`), `scene:'bridge'` en **15B y 16A** (`BridgeSpyglass`). El botón «✦ … ➔» solo aparece cuando la escena ya se vivió. |
| M5 | **Wire** (pasos 0–44) | `WIRE_SCRIPT` en `wire-script-*.js`; `EXPEDITION_THREAD`/`DAWN_THREAD` en HC | Los mensajes citan páginas por título curvo («Keep the page “…” close»). Eventos de marcha (`WIRE_MARCH_EVENTS`): solo **legs 10, 14, 18, 22, 26, 34** (WSX:14,154,253,419,557,676). Capítulos: `WIRE_CHAPTERS` 9/25/33/41 (HC:7038). |
| M6 | **Ask Hermes** | `FIELD_INQUIRIES` HC:5314-5778; `INQUIRY_REQUIREMENTS` HC:5924-5968 | ~63 preguntas. Las que nombran páginas: `inq-1998-log`, `inq-wadi`, `inq-monolith-shadows`, `inq-labyrinth-arches`, `inq-seven-echoes`, `inq-midsummer-ray`, `inq-stele-stanzas`, `inq-oracle-mirrors`, `inq-unsent-letter`, `inq-masks-lie`, `inq-camera-upside`, `inq-cairn3-plate`. |
| M7 | **Cuaderno de Hermes** | `EclipseNotebook`, FJ:1-249; `PAGES` FJ:24-94 | Una página **por juego resuelto**: `cairn1 chasm playa lexicon clepsydra s14…s22`. **No hay páginas para escenas ni para páginas sin juego** (13B-escena, sueño, catalejo). `clue(id)` (FJ:236) guarda `order_ashes_clues` = `intercept`, `note1`, `feather` (HC:7453, 7469; `stage-mirror.js:226`). |
| M8 | **Cartas de Aurelia** | AL:1-186 | 3 cartas (`I` sala índice 2 = S22 · `II` índice 5 = S25 · `III` índice 7 = S27; AL:34, 44, 54). Estado `order_aurelia_letters`. El comentario AL:3 las liga a los cuadernos **21A, 23B, 25B**, pero **ningún texto visible nombra esas páginas**. Hermes comenta cada carta en el Wire (`notesAt`, HC:7427-7432). |
| M9 | **Sello QR** | SS:10 | Solo `SEALS[41]='9682e2b4'` (cara **20A**). 42–48 = `null`. `FACE` y `TITLE` (SS:11, 13) nombran 20A–26A / 21B; `TITLE` solo tiene 41–43. |
| M10 | **Pausa** | SP:10 | `HOURS = {41:3, 42:6, 43..48:null}`. |
| M11 | **Tarjeta de sala** del Stage | HC:1989-2060 | Para nodos 40–48 lista título + cara (`'19B'…'26A'`, no se muestra al jugador) + teaser; las salas sin construir enseñan «Journal page “<sala>”» como *recompensa* (texto plano, no pastilla) y «The door is still closed». |
| M12 | **Satchel** | `SATCHEL_RELICS` HC:6273+ | Objetos con origen en papeles: `gilded_feather` y `order_wax_seal` («Sent with the Physical Journal», «Journal Package Binding Seal», HC:6274-6290), `flint_tinder`, `surveyor_compass` (ruta de 7B), `spyglass_lens`… `mirror_fragment_1..3` (solo 3 SVG en `web/assets/items/`). |
| M13 | **Previously** | `previously.js:17-33` | Una línea por juego; solo `s21` nombra una página («“The Camera Obscura”», línea 32). |
| M14 | **Mirror Speaker** | `mirror-speaker.js` | Línea espejada al abrir cada sala (hora, esfuerzo, ritmo, tono); lee la página de cuaderno de la sala anterior. No nombra páginas. |
| M15 | **Escena «Ledger completo»** (sin commit) | `ledger-complete.js:1-100`, ya cargada en IDX:5058 y `sw.js:194` | A-01/A-03 ya en el árbol de trabajo: 5 líneas Aurelia/Hermes; Hermes dice «I only ever handed you the shapes of the letters» (alusión a las hojas del alfabeto, sin nombrarlas). Exige la ecuación `oracle-ij`. |

**Hechos de estructura que condicionan las propuestas**
- [CÓDIGO] Las claves de `JOURNAL_SHEETS` **`'4'` y `'5'` son en realidad 4B y 5B** («The Planisphere», «The Zodiacal Engine»); no existen entradas para **4A y 5A**. Una pastilla «Sheet 4A» caería por `key.replace(/[A-Z]$/,'')` (HC:6085) en la tarjeta de 4B (latente: hoy ningún texto escribe «Sheet 4A»).
- [CÓDIGO] No hay entradas para **1A–3B, 4A, 5A, 21A, 22A–26B**. Si el Wire escribe «“The Fly Tower”» entre comillas curvas **no** será pastilla hasta dar de alta su título en `JOURNAL_SHEETS` (M1).
- [DOC] Las 8 hojas 19–26 llegan **juntas** con la paloma (WSS:38: «A pigeon of the Order has just landed with eight new pages»). Silvia puede leer 22B (nombra a Pope-E y «the key»), 24B, 25B y 26A/26B **mucho antes** de que la web llegue a esas salas.
- [CÓDIGO] El Hub **no tiene ninguna función que lea o verifique una hoja física** salvo el sello QR de 20A. Todo acople web↔papel es «Hermes te manda abrir la página X y la web espera el resultado».

---

## 1. Matriz de las 52 caras impresas + 4 futuras

Niveles: **FUERTE** = la web depende de la cara (pide sus datos o la dramatiza en escena/Wire) · **MEDIO** = la menciona, da un objeto, una pregunta o una carta ligada · **DÉBIL** = solo miniatura/pastilla/etiqueta de tarjeta (o eco de contenido sin nombrar la página) · **NULO** = nada. «Eco» = la web repite un motivo del papel sin enlazarlo ni nombrar la página.
Títulos: los impresos (G01 §4.0, G02 §tabla de hojas, G03 §0; clave y línea de `JOURNAL_SHEETS` entre paréntesis cuando existe).

### 1.1 Constellation (hojas 1–7)

| Cara | Título impreso | Tipo | Qué trae el papel | Impacto web actual (evidencia) | Nivel |
|---|---|---|---|---|---|
| 1A | *The Eclipse Order* (cubierta) | arte | Boceto Da Vinci a lápiz: paloma, astrolabio armilar, dunas, espejo/escenario, rosa de los vientos [DOC G01:302] | 0 coincidencias con la cubierta como objeto. Eco: los objetos iniciales del satchel `gilded_feather` y `order_wax_seal` («bound the oilskin wrappings of the **18-sheet** manuscript», HC:6289) vienen del paquete del diario; texto obsoleto (el diario tiene 26 hojas). Sin entrada en `JOURNAL_SHEETS`. | NULO (eco) |
| 1B | *The Uncharted Path* | lore (carta del Cartógrafo) | Carta manuscrita de 21 líneas + sello Constellation; «The path is real. We just have to walk it.» [DOC G01:303] | 0 coincidencias. Sin pastilla, sin pregunta en Ask Hermes. | NULO |
| 2A | *The Celestial Alphabet* | hoja de trabajo (alfabeto) | 7 glifos K R D Y M B T, cada uno en caja con ~490 px «de deducción» **sin letra pre-rellenada** (`build_page02_03.py:18-21`) | 0 coincidencias. Solo `inq-eclipse-script` (HC:5442-5447) habla del alfabeto en general. Los glifos nuevos se entregan en modales de recompensa (`rw-glyph`, p. ej. `s10-whispering-chasm.js:2199`), que **no remiten a la hoja**. | NULO |
| 2B | (sin título) | ídem | O F W A S P C | 0 coincidencias (solo un comentario de código irrelevante, HC:296). | NULO |
| 3A | (sin título) | ídem | X H L U J E N | ídem | NULO |
| 3B | *Convergence of the Bearings* | hoja de trabajo + lore | Z Q G V I + «Meridian Quadrant · Elevation index 38° — Polaris alignment», firma The Cartographer [DOC G01:209] | 0 coincidencias. | NULO |
| 4A | *The Astrolabe* | lore | Astrolabio armilar, «Suspension Throne» con plomada, *Three Rules of the Outer Dial*, tabla de épocas, curva de declinación solsticial [DOC G01:305] | 0 coincidencias con el título. Eco temático: `inq-six-stars` / `inq-replica-flaws` (categoría «The Astrolabe», HC:5456-5468) y el glosario del Matrix (ALIDADE, `celestial-matrix/index.html:2417`). Sin entrada en `JOURNAL_SHEETS` (la clave `'4'` es la 4B). | NULO (eco) |
| 4B | *The Planisphere* (`'4'`, HC:6007) | juego (S06) | Sopa de letras circular 12×12, 16 palabras | «Open your notebook to the page “The Planisphere”» (`celestial-matrix/index.html:1932`, miniatura 1955); Chronicles y lore HC:1261, 1272, IDX:1829; la consola no se abre sin resolver la hoja (`:1892`, `:1943`). | FUERTE |
| 5A | *Anatomy of the Artifact* | lore/arte | Disección explotada: Mater, Tympan, Rete, Alidade, Horse Wedge (⚠️ jerga ya impresa) [DOC G01:306] | 0 coincidencias con el título; solo «Sheet 5 (Cara B)» en un comentario de `zodiac.js:3` (es 5B). Eco: ALIDADE como solución de la mecánica 3 del Matrix (`celestial-matrix/index.html:2497`). | NULO (eco) |
| 5B | *The Zodiacal Engine* (`'5'`, HC:6008) | juego (S07) | Crucigrama de engranajes, 10 palabras, 7 círculos → clave de 7 letras | `zodiac-engine/index.html:55` «Check the page “The Zodiacal Engine”»; `zodiac.js:3` pide la Master Key de la hoja; Chronicles HC:1287-1289, 2747. | FUERTE |
| 6A | *The Midnight Calibration* (HC:6010) | juego (S08 fase 1) | Planisferio nocturno, procedimiento de 4 pasos, Field Observation Log de 6 estrellas, `Delta=(Bearing+Altitude)−38°` | `midnight-calibration/index.html:80,90,429` (la web pide cotejar el Log de la página); `astrolabe.js:9,591,641` valida contra el log de la hoja; Chronicles `chronicle-8` (IDX:1857-1865). | FUERTE |
| 6B | *The Midnight Transit* (HC:6011) | juego (S08 fase 2) | 12 estrellas con años luz, «Six Chords of Distant Light» | `transit.html:150,175`; `transit.js:603,656` (suma de acordes en años luz y polígono de la hoja); `astrolabe.js:739,745`. | FUERTE |
| 7A | *The Celestial Cipher* (`'7'`/`'7A'`, HC:6012-6013) | juego (S09) | Dial concéntrico I–XII × ±45/±15, 24 avistamientos | `celestial-cipher/index.html:64` «Open your physical journal to the page “The Celestial Cipher”»; `cipher.js:154`; IDX:1893. | FUERTE |
| 7B | *Field Log: The Desert Frontier* (HC:6014) | cuaderno de campo (lore) | Cuaderno de 1998: I. First Crossing · II. Astronomy of the Dunes · III. Three Cairns & Copper Benchmark; panorama, cuadrante 90°/plomada 30°, 112° E a Watchtower VI; doble sello | **Eje de los pasos 1–3 del Wire de la tormenta**: elecciones «Check the page “Field Log: The Desert Frontier”, Section I/III/Upper Panorama» (HC:4535-4576) que dan objetos (`flint_tinder` HC:4534, `surveyor_compass` HC:4546, `spyglass_lens`); respuesta de 112° tecleada contra la hoja (HC:9524, 9542, 9602); `inq-1998-log` (HC:5407); pastilla `data-sheet="7B"` (HC:9480); IDX:228. | FUERTE |

### 1.2 Desert Path (hojas 8–18)

| Cara | Título impreso | Tipo | Qué trae el papel | Impacto web actual (evidencia) | Nivel |
|---|---|---|---|---|---|
| 8A | *The Desert* (HC:6015) | lore (prólogo) | Of Sun, Silence, and Buried Stone; Three Laws of the Waste (Meridian Shadow, Dry Wash, Benchmark Plate 112°); «She wears no face» | **El primer paso de `DAWN_THREAD` son sus leyes**: «Law 2 on the page “The Desert”, the Dry Wash…», «Law 1 … the Meridian Shadow» (HC:5249-5265); la elección fija el camino (Dry Wash vs Western Shelf, HC:1444); `inq-three-laws` (HC:5400). | FUERTE |
| 8B | *Grand Desert Map · North-West* (HC:6016) | mapa | Cuadrante NO: Desert Frontier, Red Ridge, Watchtower VI, Dry Canyon Wash, Great Mesa, **Cairn I (980,2190)** | Dawn paso 1 lo cita (HC:5272: «The map on the page “Grand Desert Map…”»); `inq-wadi` (HC:5540-5545). El mapa del Hub usa sus coordenadas (IDX:1330) pero la hoja no se nombra ahí. | MEDIO |
| 9A | *Grand Desert Map · North-East* (HC:6017) | mapa | Cuadrante NE: Sun Monolith, Arches, Sandstone Labyrinth, **Cairn II (2070,2150)**, **Cairn III (2750,2150)**, línea discontinua 348° al Monolito | Solo la tarjeta (`mapOnly`). 0 menciones en el Wire; el 348° se cita desde 14A (WSM:154), no desde esta hoja. | DÉBIL |
| 9B | *The Whispering Chasm* (HC:6018) | juego (S10) | Laberinto 25×25, Ley del Canyon Walker, 6 cairns M-I-R-A-G-E, 6 casillas del *Nomad's Passphrase* | `s10-whispering-chasm.js:29` (misma matriz «generated with the printed sheet»), `:90` (callejones nombrados en la hoja), recompensa «Write it in the six boxes … on the page “The Whispering Chasm”» (`:2196`); HC:1477; IDX:2309. | FUERTE |
| 10A | *The Salt Playa (Dry Basin)* (HC:6019) | juego (S11 fase I) | Rejilla 7×7 [facetas+letra], simas, 6 reglas, Waypoint Log, «Transmit the 7-letter keyword» | `s11-salt-playa.js:4,39` («slab grid exactly as printed»); la palabra CRYSTAL se copia de la hoja (HC:8605: «The letters … were on your page all along»); HC:8267. | FUERTE |
| 10B | *Study on the Dry Salt Playa* (HC:6020) | estudio/lore | Costra de halita, salmuera, uniones a 120°, Fig. I, transecto; «weight without balance always yields to the deep» | **Fase II entera se lee con esta página** (`s11-salt-playa.js:9,78,2183`; alertas de fallo la citan `:2036,2334`; IDX:2761, 2795). | FUERTE |
| 11A | *The Desert Lexicon & Al-Qibla* (HC:6021) | juego (S12) | Crucigrama de 10 palabras, 7 círculos = sigilo, dial Al-Qibla 194° | `s12-desert-lexicon.js:6,39,89` (`const PAGE`); HC:1560-1565 (recompensa «Journal page …»). | FUERTE |
| 11B | *Grand Desert Map · South-West* (HC:6022) | mapa | Cuadrante SO: Whispering Chasm, Lower Wash, Sentinel Mesa (980 varas), **Cairn IV (220,1750)** | Solo aparece como «reward» de la tarjeta de S10 («Grand Desert Map · South-West — Where the canyon lies», HC:1481) y la tarjeta (`mapOnly`). | DÉBIL |
| 12A | *Grand Desert Map · South-East* (HC:6023) | mapa | Cuadrante SE: Sanctuary, Solar Altar, Arch, Salt Playa, **Cairn V (2340,280)**, 163° SSE | La lore de la tarjeta de S12 la nombra (HC:1560: «South-East Quadrant, on the map page “Grand Desert Map · South-East”»). Nada más. | MEDIO |
| 12B | *The Oasis Clepsydra* (HC:6024) | juego (S13, **congelada 3-nov**) | 5 testimonios, cuadrícula 4×4×4, Oasis Registry, suma XXX | `s13-oasis-clepsydra.js:288` («Two clues on the page “The Oasis Clepsydra”»); HC:8267-8270 y recompensas; `s13-oasis-visions.js`; IDX. | FUERTE |
| 13A | *At the Gates of Tower II* (HC:6025) | lore → **escena** | El Sirviente y la demanda de los 5 Cairns; «The great circuit begins north-north-east» | **Escena 13B completa** (`s13b-gates-tower-ii.js:2`, tag «Station 13B», nodo 27, flag `order_gates_scene_completed`, HC:754): el jugador «Check my diary: “At the Gates of Tower II”» (`:1204`), `logCard('📖 Your diary…')` (`:937`), Wire paso 9 espera la escena, `GatesRoad` (camino humilde/audaz/observador), objetos `red_cord`/`servant_coin`/`statue_seal`; `previously.js:24`. | FUERTE |
| 13B | *The Sun Monolith & Cairn II* (HC:6026, visor) | juego (S14) | Siete sombras de mediodía, dial de 7 anillos, sigilo | `s14-sun-monolith.js:3`; WSM:29,42 («its seven noons are your work»); `inq-monolith-shadows` (HC:5575); IDX:4845, 4889 (pastilla al visor). | FUERTE |
| 14A | *The Five Geodetic Cairns* (HC:6027, visor, `scene:'dream'`) | lore → **escena** | Los 5 mojones I–V, coordenadas, marcas; nota del Sirviente sobre 1971; «a young traveler» | **Escena «The Memory of the Stones»** (`s15b-stones-dream.js:1-12`: «The printed page … lived»; `order_stones_dream`; el Wire la ofrece tras S15, HC:9225-9234, `needsStonesDream` `:974`; las respuestas vuelven con `W.dream`); WSM:154 (348°); `inq-cairn3-plate` (HC:5614). Replay desde la tarjeta (M4). | FUERTE |
| 14B | *The Sandstone Labyrinth & Cairn III* (HC:6032, visor) | juego (S15) | Laberinto 17×12, 8 arcos, «The Tablet at the Mouth», **errata «North of the Sun Monolith»** | `s15-sandstone-labyrinth.js`; WSM:172 **dramatiza la errata** («says ‘North of the Sun Monolith’. That is my doing»), WSM:216, 237; `inq-labyrinth-arches` (HC:5596). | FUERTE |
| 15A | *Cairn IV: Sentry of the Canyon* (HC:6030, visor) | juego (S16) | Lámina del cañón, plano cenital, libro de 7 ecos, 16 grietas (9 falsas) | `s16-cairn-iv.js`; WSB:92 («Keep the page … close: the survey log of the seven echoes»); `inq-seven-echoes` (HC:5617); IDX:4559, 4606. | FUERTE |
| 15B | *The Natural Bridge of the Sentinel Mesa* (HC:6031, visor, `scene:'bridge'`) | mapa/zoom → **escena** | Zoom 1:250 del arco, estratos, senda de carretas | **Escena «The Spyglass on the Natural Bridge»** (`s15c-bridge-spyglass.js:1-14`, `order_bridge_spyglass`, apertura desde S16); WSB:58 («The page “The Natural Bridge…” shows switchbacks…»). | FUERTE |
| 16A | *The Eastern Buttress & Lower Wash* (HC:6028, visor, `scene:'bridge'`) | mapa/zoom → **escena** | Estribo oriental, switchbacks, cantos de 1971, notas de Hermes | misma escena; WSB:61 («it matches your page “The Eastern Buttress & Lower Wash”»); `s16-cairn-iv.js:1290`. | FUERTE |
| 16B | *Arch of the Solstice & The Solar Altar* (HC:6029, visor) | juego (S17) | Arco con rayo, patio 12×11 con espejos, 8 piedras solares, 163° SSE; **errata «At midsummer dawn»** | `s17-solstice-arch.js`; WSB:172, 236; `inq-midsummer-ray`, `inq-autumn-dawn` (HC:5638-5645; el juego es un amanecer de octubre en un patio hecho para junio = la errata dramatizada); IDX:3661, 3706. | FUERTE |
| 17A | *The Polybius Stele* (HC:6035) | juego (S18) | Cuadrícula de Polibio 5×5 con PHOENIX, 6 estrofas | WST:44, 66-67, 91; `s18-polybius-stele.js:3`; `inq-stele-stanzas` (HC:5666); IDX:3944. | FUERTE |
| 17B | *The Desert Oracle* (HC:6036) | lore (cuaderno 1998) | Hermes confiesa su arrogancia, sigue un cauce seco, observa desde una cresta al hombre barbudo y lo toma por el Oráculo (**error: era el Sirviente**); «Seek his outpost when shadows lengthen» [DOC G02:429] | Solo la tarjeta. **Eco sin nombrar la página**: WST:118 («In 1998 I mistook a bearded old man for her. I have not forgiven myself.»). Ninguna pastilla, escena ni pregunta nombra «The Desert Oracle» como página. | DÉBIL (eco) |
| 18A | *The Oracle's Horizon* (HC:6033) | juego (S19) | 8 balizas, 3 espejos, sigilo OVERTURE; «hour» (⚠️ reimpresión pendiente) | WST:176, 201, 217, 260; `s19-oracle-horizon.js:3,361` («the sigil from Sheet 18A»); `inq-oracle-mirrors` (HC:5694). | FUERTE |
| 18B | *From the Desert to the Stage* (HC:6034) | arte / transición | Cortinaje con cordón y borla, colonnade jónica, telón en cuadrícula, arena y un mojón diminuto; solo grafito [DOC G02:431] | Solo la tarjeta, más el **texto del botón final de S19** («✦ From the Desert to the Stage ➔», IDX:4093), que no enlaza con la página. | DÉBIL |

### 1.3 Stage Path (hojas 19–26)

| Cara | Título impreso | Tipo | Qué trae el papel | Impacto web actual (evidencia) | Nivel |
|---|---|---|---|---|---|
| 19A | *The Unsent Letter* (HC:6037) | lore (carta en espejo) | Carta de una Oráculo antigua a la Mirror Speaker, escrita al revés; último verso = acertijo | Wire 33: «Open the page “The Unsent Letter”, Silvia, and find a mirror» (WSS:37-39); elección (WSS:42-47); WSS:75 («tell me what you make of the last line») y WSS:88 citan la letra («Only the one who sees what is not equal will find it.»); marcha de 18 h (HC:8246, `s20-masks-gate.js:1298`); `inq-unsent-letter` (HC:5722). **La web no pide nada de la hoja** (no hay respuesta que verificar). | MEDIO |
| 19B | *The Gate of a Thousand Masks* (HC:6038) | juego (S20) | 12 máscaras sin letras (6 mienten) | `s20-masks-gate.js:4,99-101,406,417`; WSS:89; `inq-masks-lie` (HC:5729). | FUERTE |
| 20A | *The Camera Obscura* (HC:6039) | juego (S21) **+ sello QR** | Ciudad **boca abajo**, «The Three Hearths», sello QR | `s21-camera-obscura.js:5` («Sheet 20A shows the city as it stood the day before»: la web cambia 4 cosas); WSS:200-216; **sello real** `SEALS[41]` (SS:10) que abre la sala; `previously.js:32`; `inq-camera-upside` (HC:5750). | FUERTE |
| 20B | *The Whispering Gallery* (HC:6040) | juego (S22) | Elipse a escala, sin focos ni alfileres, «The Secret of the Niche» | `s22-whispering-gallery.js:4`; WSS:341-356; `inq-gallery-pins`; sin sello (`SEALS[42]=null`). | FUERTE |
| 21A | *The Alpine Memories* | cuaderno de Aurelia I | Cúpula de latón girando, edelweiss prensada «on the twenty-third day of September»; Hermes: «She is beginning to remember the way back» [DOC G03:249] | Carta I (AL:34-43: «March 1970», dibujo cúpula) se rompe y se lee tras ganar S22; Hermes responde en el Wire (AL:42). **La página no se nombra ni tiene tarjeta**; solo el comentario AL:3. | MEDIO |
| 21B | *The Automaton Orchestra* (HC:6041) | juego (S23, ⏳) | 3 autómatas, cilindro con púas sin partitura, 6 campanas C D E F G A | Tarjeta de sala (HC:1996), `FACE[43]` (SS:11), `TITLE[43]`, texto de espera del Wire (HC:9183-9184), `stage-mirror.js:22`. **Sin juego, sin sello, sin pausa**. Se volverá FUERTE al construir S23. | DÉBIL (pendiente) |
| 22A | *The Fly Tower* | juego (S24, ⏳) | Poleas, clinómetro 38° (±2°), cesta oeste con sacos y lingote | Solo HC:1997, `FACE[44]` (SS:11), `stage-mirror.js:23`. No está en `JOURNAL_SHEETS`. | DÉBIL (pendiente) |
| 22B | *The Ashes Before Christ* | lore (Pope-E) | «BC = Before Christ», sello de hollín, **una pluma dorada**, nota «the fourth door yields to no one but the key», Hermes: «Pope-E knew Silvia was following our steps. Why does our pursuer call her the key?» [DOC G03:240] | 0 coincidencias con el título. **Eco sin enlace**: `clue('feather')` (pluma junto al espejo, `stage-mirror.js:223-226`), `clue('note1')` (HC:7469), `inq-ash-note` (HC:5743), sello ⊖ en el mensaje interceptado (HC:7440-7455). Ninguno remite a 22B; además 22B ya revela lo que esos clues dosifican (⚠️ ver §5.2). | NULO (eco) |
| 23A | *The Shadow Theatre* | juego (S25, ⏳) **+ sello QR + trasluz** | 3 lámparas, 3 figuras (luna, torre, enmascarado), QR | HC:1998, `FACE[45]`; `SEALS[45]=null` (el hash `77d1d1fa` aún no está pegado, G03:150). | DÉBIL (pendiente) |
| 23B | *The Disc and the Vow* | cuaderno de Aurelia II (trasluz) | Disco de bronce de 24 radios y 3 aberturas, «Instructions for the Flame» | Carta II (AL:44-53; sala S25, **inalcanzable hasta construirla**) con dibujo del disco de 24 estrellas; Hermes comenta en el Wire. Página sin nombrar. | MEDIO (latente) |
| 24A | *The Hall of Mirrors* | juego (S26, ⏳) **+ doblez** | Plano 20 pasos W→E, alcobas IV V V VI, eje central, cristal oscuro a la derecha | HC:1999, `FACE[46]`. Nada más. | DÉBIL (pendiente) |
| 24B | *The Doctrine of the Mirror Speaker* | lore | Aurelia (1970): «Pope-E burned the ropes above the stage…»; Hermes (1998): «Do not look for your own face in the mirror», «You already hold seven pieces» [DOC G03:181] | 0 coincidencias. | NULO |
| 25A | *The Kaleidoscope Lantern* | juego (S27, ⏳) | Linterna octogonal, anillo de latón, «northern angle», pasador en los dientes | HC:2000, `FACE[47]`. Nada más. | DÉBIL (pendiente) |
| 25B | *The Terrace Under the Stars* | cuaderno de Aurelia III | Ilustración a sangre; banderola: «Look down at the gorge, Hermes. The torches are climbing toward the ice with our Astrolabe…» | Carta III (AL:54-63: «August 1971», dibujo terraza con estrella; «Three short, a pause, two long. Answer me.»; sala S27 **inalcanzable**). Página sin nombrar. | MEDIO (latente) |
| 26A | *The Stage of the Mirror Speaker* | juego/ceremonia (S28, ⏳) | Marco con 8 fragmentos y fachada de la Ópera, «Gather the marks from the margins of Sheets 19 to 26» (⚠️ no hay marcas), Liturgy, 48°12′N 16°22′E, 354° N | HC:2001, `FACE[48]`; el mapa del Espejo Vivo ya revela «WIENER STAATSOPER · VIENNA» con 9 fragmentos (`stage-mirror.js:34`). Sala sin construir. | DÉBIL (pendiente) |
| 26B | *Back to the Peaks* | transición / mapa de las 3 torres | «The Stage Path is finished…», paloma blanca, Chasm Pass, mapa con distancias 240/210/180 leguas, rumbo 354° N, astrolabio al centro, «THE VAULT OF THE GRAND ECLIPSE · Locus Convergentiae» [DOC G03:278] | 0 coincidencias. No hay Torre I en el Hub. | NULO |

### 1.4 Las 4 caras futuras (hojas 27 y 28, decisión A-27 del 16-nov) · estado actual: todas NULO (no existen)

| Cara | Nombre de diseño | Tipo | Qué ya está decidido | Impacto web actual |
|---|---|---|---|---|
| 27A | Observatorio (juego) | juego (Torre I, A-23) | Restaurar la cúpula con luz: reorientar espejos y lentes rotas hasta el anaquel de las cartas | NULO (sin nodo, sin hoja, sin `JOURNAL_SHEETS`) |
| 27B | Cuaderno de Aurelia IV (el puente) | cuaderno de Aurelia | La memoria del puente (1971) se vive **durante la Alineación** (A-25); ninguna de las cartas I–III habla del puente (AL:3-4) | NULO (AL solo tiene 3 cartas) |
| 28A | Cartas celestes + Alineación (juego) | juego doble (A-24, A-25) | Reconstruir una carta quemada con las 6 estrellas nativas fijas · tres diales (rumbo de la Torre II, 354° de la Torre III, vertical de la Torre I) contra Pope-E; **Silvia gana el Astrolabe** (A-14) | NULO |
| 28B | Hoja final de la Orden | lore/cierre | Llega con las demás (A-27); el Hub acaba con carta de Carles y sobre sellado (A-05); Bóveda de 5 diales 52·26·72·38·50 (A-26) | NULO |

### 1.5 Recuento (52 caras impresas)

| Nivel | Nº | Caras |
|---|:-:|---|
| FUERTE | 25 | 4B 5B 6A 6B 7A 7B 8A 9B 10A 10B 11A 12B 13A 13B 14A 14B 15A 15B 16A 16B 17A 18A 19B 20A 20B |
| MEDIO | 6 | 8B 12A 19A 21A · 23B y 25B (**latentes**: la carta de Aurelia existe en código, pero la sala que la abre no se ha construido) |
| DÉBIL | 10 | 9A 11B 17B (eco) 18B · 21B 22A 23A 24A 25A 26A (**pendientes de construir**: solo etiqueta de tarjeta, `FACE`/`TITLE` de sellos y `stage-mirror.js`) |
| NULO | 11 | 1A 1B 2A 2B 3A 3B 4A 5A 22B 24B 26B (1A, 4A, 5A y 22B con eco temático sin enlace) |

Suma: 25 + 6 + 10 + 11 = 52 ✓. Las 4 futuras (27A, 27B, 28A, 28B): NULO (no existen).

---

## 2. Qué hace falta saber antes de proponer (preguntas abiertas que condicionan)

| ID | Pregunta | Por qué importa | Evidencia |
|---|---|---|---|
| Q-E1 | ¿Cómo sabe Silvia la letra de los **14 glifos que la web nunca entrega**? | Las hojas 2A–3B **no traen ninguna letra** (cajas de deducción vacías, `build_page02_03.py:18-21`); la web entrega solo 12 glifos con su letra (D C P K B G V F R X Q Z, G01 §3.3). G00 §3.1 afirma que «reconoce todas las letras» [INFERENCIA no verificable]. Hoy **el alfabeto impreso no tiene ningún uso funcional en la web** (el Ledger trabaja con letras latinas). Cualquier propuesta de «leer glifos» (PE-03c) exige decidirlo. | G01:205, G00 §3.1 |
| Q-E2 | ¿Se permite que la web pida **escribir en el diario** (cruces, letras en cajas)? | PE-03a y PE-07 dependen de ello; el diario impreso es inmutable pero Silvia puede escribir en él (las cajas de 2A–3B y el Waypoint Log de 10A están hechas para eso). | `build_page02_03.py`, G02 10A |
| Q-E3 | Las 8 hojas llegan juntas (Wire 33): ¿se acepta que Silvia pueda leer 22B/24B/25B/26A/26B en S19–S20? | Condiciona PE-11, PE-12, PE-13 (spoilers de Pope-E y del WHERE por papel). | WSS:42, G03 §3.1 |
| Q-E4 | ¿Las 4 caras nuevas tendrán sello QR y/o truco físico propio? | A-11 solo habla de S23–S28. | GM §5.0 A-11 |

---

## 3. PROPUESTAS (estado: **propuesta, sin aprobar**)

> Reglas que todas respetan salvo indicación: Regla 7 (Silvia resuelve; los guardianes narran), Regla 9 (la web nunca muestra valores del Ledger), Regla 10 (A–Z), vocabulario blindado (nada de *Azimuth/Mucro/Mater/Tympan/Stereographic* en texto de Silvia, aunque **4A/5A ya los imprimen**), páginas nombradas por título impreso entre «comillas curvas», Hub solo inglés, A-02 (el Stage Path no da operaciones del Ledger). «Retro» = no interfiere con el guardado actual de Silvia (S14 hecho, S15 sin abrir); «Futuro» = solo se verá al llegar a su estación.
> Esfuerzo: S = ≤½ día · M = 1–2 días · L = más. Todas reutilizan mecanismos que **ya existen** (M1–M15 de §0).

### PE-01 · 1A *The Eclipse Order* (NULO) — «La cubierta se va llenando»
- (a) **Qué hace Silvia:** en Chronicles, bajo las cartas de Aurelia, una sección «The Cover» con 5 casillas (dunas, espejo/escenario, astrolabio, paloma, rosa de los vientos). Cada una se enciende con una línea de Hermes cuando Silvia vive ese motivo: dunas al cerrar S19, paloma cuando llega el pliego de 8 páginas (Wire 33), espejo al encajar el fragmento IX, astrolabio al ganarlo en la Alineación, rosa de los vientos al completar el Ledger. Cada nota termina con «Look at the cover of your journal».
- (b) **Qué gana:** la cubierta deja de ser neutra; la cubierta «ya lo había dibujado todo»; cierra el arco de 56 días.
- (c) **Esfuerzo:** S (patrón de `aurelia-letters.js`, solo texto y 5 iconos SVG).
- (d) **Riesgos:** los 5 motivos salen de G01:302 (descripción de los scripts de maquetación): **comprobar con la maqueta real** antes de afirmarlos; no mencionar el WHERE ni el Astrolabe antes de tiempo; no ligar el astrolabio dibujado en 1A al *Astrolabe* robado hasta la Torre I. Aprovechar para corregir `order_wax_seal` («18-sheet manuscript», HC:6289) → «the journal» (**retro**, S).

### PE-02 · 1B *The Uncharted Path* (NULO) — «La primera carta, otra vez»
- (a) Tras S09 (cuando ya le llama Hermes) se desbloquea en Ask Hermes: «What did you promise in your first letter?» (grupo `constellation`): Hermes cita la última línea y reconoce que la escribió «sin saber si habría alguien». Segunda pieza (**Futuro**, Torre I): en la llegada, Hermes le pide releer «“The Uncharted Path”» y compara la promesa («the path is real, we just have to walk it») con lo caminado (nº de estaciones y días, de `journey-profile.js`).
- (b) Ancla humana al inicio del viaje; da al regreso a la Torre I una frase-eco real.
- (c) S (+S la pieza de la Torre I).
- (d) Citar solo líneas verificadas en la maqueta (G01 solo da fragmentos); 1B va firmada «The Cartographer» (no «Hermes»): la pregunta debe salir después de la revelación del nombre (`inq-true-name`). Sin spoilers de Pope-E (no mencionar «the key»).

### PE-03 · 2A, 2B, 3A (NULO) — el alfabeto impreso
Tres piezas independientes; **PE-03c depende de Q-E1**.
- **PE-03a «Write it in its box»** (**Retro**, S). Los modales de recompensa con glifo (`rw-glyph`: X en `s10-whispering-chasm.js:2199`, Q en `s11-salt-playa.js:2920`, Z en `s12-desert-lexicon.js:2114`, y los de S03/S06/S07/S09) añaden una línea: «Find its box on the pages “The Celestial Alphabet” and write X beside it». *Hace Silvia:* escribe la letra en la caja de deducción (la página ya la reserva). *Gana:* el alfabeto impreso pasa de decoración a registro propio; refuerza la sensación de «mi diario». *Riesgos:* Q-E2; no decir nunca el número (Regla 9); hoy el texto dice «work out its value in your Cipher Ledger» (no tocar eso).
- **PE-03b «The Alphabet Proof»** (**Futuro cercano**, S). La escena ya existente `ledger-complete.js` (M15) se cierra con un paso nuevo: Hermes pide abrir «“The Celestial Alphabet”» y comprobar que las 26 cajas tienen su letra (**honor**, sin verificación; botón «All 26 boxes are filled»). Si no, Hermes ofrece volver a Ask Hermes `inq-eclipse-script`. *Gana:* el cierre del Ledger toca el papel que lo inició (el texto ya dice «the shapes of the letters», LC:12). *Riesgos:* no mostrar valores; el Ledger completo llegará ~20–22 nov (G00 §3.1): **decidir pronto** porque la escena está activa en el árbol de trabajo.
- **PE-03c «The door speaks in glyphs»** (**Futuro**, M dentro de la Bóveda). La puerta de la Bóveda muestra las 5 palabras de la frase del Email 1 (YOU / WERE / ALWAYS / THE / TREASURE) **en glifos**; Silvia las lee con su alfabeto y solo entonces calcula las 5 sumas (A-26: 52·26·72·38·50). *Gana:* el alfabeto impreso se vuelve la llave de la última puerta; coherente con «A-04 el Ledger completo es la llave». *Riesgos:* Q-E1 (¿conoce los 26 glifos?); hay que generar los 26 glifos en SVG desde `build_page02_03.py` (`SHUFFLED_GLYPHS`); Regla 10.

### PE-04 · 3B *Convergence of the Bearings* (NULO) — «El 38° viene de lejos»
- (a) En S24 (Fly Tower; clinómetro 38° ±2°, A-18) el nivel 2 de la escalera `s24-*` o la línea de Hermes dice: «I have seen this angle before: “Convergence of the Bearings” and “The Midnight Calibration” both end at 38°». Silvia lo comprueba en las dos hojas (3B «Elevation index 38° — Polaris alignment»; 6A `Delta=(Bearing+Altitude)−38°`). Más adelante la **Alineación** (A-25) reutiliza el 354° de 26A/26B como segunda cita de «Bearings».
- (b) Un número impreso en septiembre sostiene un juego de diciembre: la sensación de diseño cerrado.
- (c) S (solo texto en S24 y en la Alineación).
- (d) **Es una pista, no la solución**: la 22A ya imprime «thirty-eight degrees»; no repetir su regla; no mostrar nada del Ledger. 3B y 6A ya se imprimieron con «Polaris alignment»: verificar contra maqueta.

### PE-05 · 4A *The Astrolabe* (NULO) — las «Three Rules of the Outer Dial» llegan a la Alineación
- (a) En la Alineación (28A; tres diales; A-25) el «How to play» remite a «“The Astrolabe”»: sus *Three Rules of the Outer Dial* son el reglamento de uso de los diales (**requiere leer las tres reglas en el PDF/maqueta: NO DEFINIDO en las guías**). Antes (**Retro**, S): dos preguntas en Ask Hermes tras S09, «What is the Suspension Throne?» y «Why does the Astrolabe hang from a plumb line?».
- (b) Una hoja de septiembre paga en diciembre; ancla la escena clave del juego.
- (c) S (retro) + S (cita en 28A; el juego es L aparte).
- (d) 4A y 5A **imprimen jerga prohibida** (Mater, Tympan…): la web usa *base plate / horizon plate* y deja que Silvia emparente por posición; clave `'4'` de `JOURNAL_SHEETS` = 4B (alta de `'4A'` sin tocar `'4'`); no contradecir «mide nativamente 6 estrellas» (Regla 8).

### PE-06 · 5A *Anatomy of the Artifact* (NULO) — «Reassemble the Astrolabe»
- (a) Al ganar el Astrolabe en la Alineación (A-14), una escena breve (no juego): el instrumento aparece **desmontado** como en la lámina de 5A; Silvia arrastra 5 piezas a su sitio (guiada por la forma del dibujo impreso, no por nombres) y gira el anillo exterior hasta que encaja. Pope-E ya no lo tiene.
- (b) El premio más importante del juego se **gana con las manos**; usa por fin la lámina más «da Vinci» del diario.
- (c) M (3D sencillo reutilizando `EclipsePaint`/`EclipseScenery`; sin reglas de dificultad).
- (d) Nombres de piezas solo por función («sighting arm», «star web»); no decir que mide más de 6 estrellas; no solaparse con la animación final de la Alineación (A-25): se coloca **entre** la Alineación y la Bóveda. Opción Retro (S): enlazar la ALIDADE del glosario del Matrix (`celestial-matrix/index.html:2417`) con «the exploded drawing».

### PE-07 · 9A (DÉBIL), 11B (DÉBIL), y refuerzo de 8B/12A (MEDIO) — «Five crosses» y «Draw the 348° line»
- **PE-07a «Five crosses»** (S, **Futuro**: ceremonia de los 5 sellos en S17, `wire-ceremony.js`): Hermes pide que Silvia marque a lápiz una cruz en cada Cairn de las cuatro hojas de mapa (I en «Grand Desert Map · North-West», II y III en «· North-East», IV en «· South-West», V en «· South-East») y pulse «I marked them». Las coordenadas impresas (980,2190 · 2070,2150 · 2750,2150 · 220,1750 · 2340,280, G02) ya están en la web (IDX:1330). *Gana:* un mapa propio y real del peregrinaje; da por fin uso explícito a las 4 hojas de mapa. *Riesgos:* Q-E2 (escribir en el diario: opcional, con vía «skip»); verificar coordenadas con la maqueta.
- **PE-07b «Draw the 348° line»** (S, **Futuro**: tras S15): en el Wire de S15 la errata «North of the Sun Monolith» se explica por voz (WSM:172); se añade que Silvia traza con regla sobre «Grand Desert Map · North-East» la línea discontinua de Cairn III al Monolito y responde en 2 opciones qué atraviesa. *Gana:* la errata pasa de narración a gesto sobre 9A. *Riesgos:* la línea ya está impresa en 9A (G02:412): la pregunta debe ser de lectura, no de dibujo.
- **PE-07c «The Sentinel Mesa on the map»** (S, 11B): antes de entrar en la escena del catalejo (`s15c-bridge-spyglass.js`) una primera línea pide ubicar el Sentinel Mesa (980 varas) y Cairn IV en «Grand Desert Map · South-West». *Gana:* une 11B, 15B y 16A (tres hojas) en una sola cadena. *Riesgos:* ninguno de spoiler.
- Refuerzo de 8B/12A (opcional, S): cada vez que Hermes diga un topónimo del cuadrante, que la pastilla sea de la tarjeta (ya lo es: añadir la pastilla de «Grand Desert Map · North-West» en `inq-map-quadrants`, HC:5323).

### PE-08 · 17B *The Desert Oracle* (DÉBIL, eco) — «The man on the ridge»
- (a) En el debrief de S18 (Servant vivo junto al pozo) la pregunta ya existente «Have you ever seen the Oracle?» (WST:117-119) se convierte en **escena corta** con 3 respuestas de Silvia a la confesión de Hermes («In 1998 I mistook a bearded old man for her»): *«You should apologise to him»* / *«He knew, and watched you anyway»* / *«I'll keep the secret»*. Hermes le pide antes abrir «“The Desert Oracle”» y leer su propio párrafo de arrogancia. La respuesta se guarda como los flags de `GatesRoad` y vuelve en el *return* de las puertas al abrir S19 (cinco finales: keepers/trusted/bold/observer/humble, G02:285) y en la línea del Sirviente.
- (b) Silvia gana agencia emocional sobre la mayor torpeza de Hermes y el Sirviente; une 17B con 13A, 14A (el punto de vista del Sirviente, «a young traveler») y S18.
- (c) S–M (texto + un flag; reutiliza el sistema `W.ask`/`W.flag`).
- (d) El Oráculo sigue **sin rostro** hasta S19 (no revelar a Aurelia); mantener el error de Hermes («era el Sirviente», no «era Aurelia»); solapamiento con el «lie» del Servant en `s13b-gates-extras.js`: usar un flag distinto.

### PE-09 · 18B *From the Desert to the Stage* (DÉBIL) — «The curtain between»
- **Nivel S:** el botón final de S19 (IDX:4093) abre un *wipe* de cortina con la lámina de 18B (cordón, borla, colonnade) y la pestaña Path III («Stage») aparece **descorriendo** el telón; texto: «This is the page “From the Desert to the Stage”. Do you have it open?».
- **Nivel M:** «**Carry one thing across**»: antes de partir (Wire 33) Silvia elige un objeto del satchel (`gilded_star`, `servant_key`, `signal_mirror`, `tuning_pebble`) que Hermes llevará al teatro; la elección **solo cambia texto**: la Mirror Speaker lo menciona al abrir S20 (`mirror-speaker.js`) y reaparece en la ceremonia de S28.
- (b) Da a 18B una función de **frontera de capítulo** y a la elección un eco físico.
- (c) S / M.
- (d) El objeto no puede dar ventaja mecánica (Regla 7); si se elige M, registrar la elección en `order_*` para el cierre de S28 (A-08) y el perfil de `journey-profile.js`.

### PE-10 · 22B *The Ashes Before Christ* (NULO, eco) — «Your theory»
- (a) La hoja ya nombra a Pope-E y pregunta «Why does our pursuer call her the key?» (en la letra de Hermes). La web **no la ignora**: tras el paso 35 (nota 1, «Let her through.») Hermes ofrece una elección opcional «Open the page “The Ashes Before Christ”»: *«Because I unlock something»* / *«Because he wants me to follow»* / *«Because he knows me»* / *«I don't know»*. La respuesta se guarda en `order_ashes_clues` (junto a `note1`) con su fecha.
- (b) La **página de desenmascaramiento** del cuaderno de Hermes (A-15) puede decir «On <fecha> you guessed…». Silvia deja de recibir pistas de forma pasiva y se las apropia.
- (c) M (una elección en el Wire + un campo en `EclipseNotebook`).
- (d) **Spoilers:** la opción «he knows me» es verdad; las otras tres deben ser igual de plausibles. Resolver Q-E3 y el choque Pope-E-1970 (A-07: «Carles imita a un enemigo leyenda»): no afirmar nada sobre 1970 en la elección. Hay que dar de alta `'22B'` en `JOURNAL_SHEETS` sin miniatura (evitar mostrar la pluma o el sello).

### PE-11 · 24B *The Doctrine of the Mirror Speaker* (NULO) — «Ropes twice» y doctrina
- (a) Dos toques mínimos. **En S24** (A-18: los asaltantes cortan cuerdas) Hermes dice «Aurelia says the ropes of this stage have burned before». **En S26** la línea de la Mirror Speaker al abrir la sala cita la doctrina («Do not look for your own face in the mirror») y, si el juego registra que Silvia siguió su propio reflejo en el laberinto, el cierre lo comenta; Hermes pide leer «“The Doctrine of the Mirror Speaker”» y apunta que **él** escribió la nota de 1998.
- (b) Ata 24B a dos salas y al motivo «cuerdas quemadas 1970 → 2026»; da a S26 una regla narrativa.
- (c) S.
- (d) 24B afirma que Pope-E quemó las cuerdas **en 1970**: A-07 (Carles adopta el nombre de un villano histórico) lo resuelve; no explicar más. La doctrina no puede decidir el laberinto (D-18: el grafo lo define la web desde 24A).

### PE-12 · 26B *Back to the Peaks* (NULO) — «The Chasm Pass table»
- (a) El último paso del Wire de S28 (65–68 previstos) pide abrir «“Back to the Peaks”» y **elegir el camino** del viaje a la Torre I entre los tres rumbos del mapa (Western Ridge 240 leguas / bearing 354° 210 / Great Rift 180). Cada elección es una marcha con eventos (patrón WSX) de distinta duración y tono; las tres llegan al Chasm Pass.
- (b) Primer uso real de la hoja; la transición es un **viaje elegido**; el 354° reaparece en la Alineación (A-25).
- (c) M (una marcha nueva con ≥3 variantes; reutiliza `MARCH_LEGS`).
- (d) Duración de la marcha **NO DEFINIDA** (G03 §4.3); coherencia con las distancias impresas (leguas) y con A-06 (el Hub debe acabar antes del 18-dic); la hoja ya enseña la etiqueta «The Vault of the Grand Eclipse» (no añadir información nueva sobre la Bóveda).

### PE-13 · Caras de juego sin construir (21B, 22A, 23A, 24A, 25A, 26A · DÉBIL pendiente) — contrato + «gancho extra»
**Contrato mínimo por cara (patrón S20–S22)**: entrada en `JOURNAL_SHEETS` (título impreso, sin miniatura que revele el truco), `TITLE`/`SEALS`/`FACE` en `sheet-seals.js`, `HOURS` en `stage-pause.js`, `PAGES.sNN` en `field-journal.js`, línea en `previously.js`, pastilla en el Wire, preguntas en Ask Hermes, objeto/reliquia (`mirror_fragment_N` + SVG) y línea de la Mirror Speaker. Detalle por sala en G03 §2 y G00 §5.2.

| Cara | Gancho extra propuesto (a: qué hace Silvia · b: qué gana · c: esfuerzo · d: riesgo) |
|---|---|
| 21B | (a) **Reconoce la melodía**: A-17 fija FACADE (F-A-C-A-D-E; invertida E-D-A-C-A-F). La melodía «sin palabras» que Aurelia tararea ya se planta en la web desde la llanura (`wire-script-marches.js:704, 720`: «the tune with no words … grew a new bar»; `wire-script-tower.js:211`: el pastor; WSS:85). En S23 Aurelia dice «that is my tune» al oírla. (b) Pago narrativo de una pista sembrada 4 estaciones antes. (c) S. (d) No decir nunca que deletrea «FACADE» (A-17: pista sutil); la hoja ya trae la regla de reflejo, la web debe variar la interacción respecto a S22 (colocar púas, A-09). |
| 22A | (a) Nota de Hermes que une «38°» con 3B/6A (**PE-04**) y las cuerdas con 24B (**PE-11**). (b) Cohesión de tres hojas. (c) S. (d) Regla 9: S24 sin ecuación (A-02). |
| 23A | (a) La pista de nivel 3 solo explica el **gesto** («hold the page against a lamp», G03:149). Añadir el **ritual** en el Wire: Hermes pide apagar la luz y sostener «“The Shadow Theatre”» contra una lámpara. (b) Convierte el trasluz en momento compartido. (c) S. (d) La web **no puede dar el dato**; miniaturas sin marcas; seguir el protocolo físico (80–90 g/m², ±2 mm, IB #8). Pegar `77d1d1fa` en `SEALS[45]` y `TITLE[45]`. |
| 24A | (a) Gesto del **doblez**: la pista de nivel 3 y una animación que pliega la miniatura por el eje central (sin mostrar el camino). (b) Da cuerpo a la «línea de doblez» impresa. (c) S. (d) Orientación W/E del plano (G03:176); el sello 24A **no está impreso** (A-11: solo S25). |
| 25A | (a) La luz deletrea NORTH (A-21) y la nota 3 de Pope-E cierra la sala. (b) Pago de «the northern angle» impreso en 25A. (c) incluido en el juego. (d) La nota 3 solo se escribe una vez resuelto Q-E3. |
| 26A | (a) Ceremonia: los 9 fragmentos en el orden en que los ganó (A-08); el mapa del Espejo Vivo ya revela el nombre (`stage-mirror.js:34`). Sustituir «the marks from the margins of Sheets 19 to 26» (no impresas) por los dibujos de cada fragmento. (b) El WHERE llega por la web, aunque 26A lo insinúe. (c) L (la sala completa). (d) 26A ya da 48°12′N 16°22′E y 5 arcos: la web solo protege la **confirmación por nombre** (G00 R-19). |

### PE-14 · Refuerzos de caras MEDIO (21A, 23B, 25B, 19A, 12A/8B) — opcionales
- **PE-14a · 21A «The pressed flower»** (S–M, **Futuro**, tras S22): al romper la Carta I, Aurelia pide a Silvia abrir «“The Alpine Memories”» y decir **en qué mes** está la edelweiss prensada (la hoja dice «the twenty-third day of September»; opciones de mes). Acierto o fallo no cambia nada, pero Hermes responde distinto, y **la flor entra al satchel** como objeto cosmético (`pressed_edelweiss`, SVG nuevo) que reaparece en la memoria del puente (27B). *Riesgo:* verificar el texto de 21A en el PDF; dar de alta `'21A'` en `JOURNAL_SHEETS`.
- **PE-14b · 23B «Count the spokes»** (S, **Futuro**, S25): tras ganar la sala, Hermes pide contar los radios del disco de «“The Disc and the Vow”» (24) y dice por qué coinciden con el disco de S19 (A-10: gemelos). *Gana:* un dato del papel que la web pide y comprueba sin tocar el truco del trasluz. *Riesgo:* ⚠️ **cronología**: 23B dice que Aurelia fundió su copia **en el otoño de 1970** y la Carta II dice «December 1970 · You carved twenty-four stars into brass for me» (AL:44-48): la copia sería anterior al original. **Cambiar la fecha de la Carta II a otoño** (texto de web; no toca el papel), o redactar el Wire para que Hermes fuera el primero en grabar.
- **PE-14c · 25B «Answer the light»** (S–M, **Futuro**, S27): al romper la Carta III («Three short, a pause, two long. Answer me.») aparece un botón «Answer the light»; Silvia golpea el patrón (tres cortos, pausa, dos largos) con tecla/clic, reutilizando el motor de señal del Cairn V (`inq-light-code`, HC:5652-5658). Hermes ya dice en su nota: «you were beside me on the wire when I finally did» (AL:60). *Gana:* el momento más tierno del Stage Path tiene mecánica. *Riesgo:* accesibilidad (modo sin parpadeo y con audio), consistencia del patrón con S17; **⚠️ choque con lo impreso**: 25B habla en presente de «torches … toward the ice with our Astrolabe» (2026) en un cuaderno de 1971: aclarar si 25B es 1971 o 2026 antes de escribir el Wire de S27.
- **PE-14d · 19A «Tell him the last line»** (S): elección en el Wire de S33–34 donde Silvia responde a «what do you make of the last line?» (WSS:75) con 3 lecturas; la elegida modula un detalle de la Mirror Speaker en S20. *Riesgo:* el último verso ya se cita en el Wire (WSS:88): no es una pista nueva. Verificar el texto de 19A contra la maqueta.

### PE-15 · Páginas de escena en el cuaderno (D-14) — 13A, 14A, 15B+16A (FUERTE sin huella en el cuaderno)
- (a) Nuevo tipo de entrada en `EclipseNotebook`: «scene pages» (clave `scene13`, `dream`, `bridge`) escritas en el momento de vivir la escena, con la elección de Silvia (camino de las puertas `GatesRoad`, respuesta del sueño `W.dream`, decisión del catalejo `W.bridge`) y su fecha. (b) El cuaderno deja de ser solo «un juego = una página»; sostiene el desenmascaramiento (A-15). (c) M. (d) Hoy `watch()` solo observa juegos (`FJ:135-151`); hay que añadir las banderas de las tres escenas.

---

## 4. Las 4 caras nuevas (27A, 27B, 28A, 28B): qué impacto web deben tener **desde su diseño**

> Estado: propuesta, sin aprobar. Decisiones de base ya tomadas: A-13, A-14, A-15, A-23 a A-27 (G00 §5.0). **Las caras son lo único que no se puede corregir después de imprimir (≈ 2 semanas)**, así que sus ganchos web deben decidirse **antes** del envío a imprenta (D-19).

**Contrato común (checklist de «impacto por cara»)**: título impreso (2–4 palabras) → entrada en `JOURNAL_SHEETS` (`path` y `node` de la Torre I, miniatura que no revele el truco) → nodo del Hub (≥ 49) y flag `order_*_completed` → pasos de Wire (≥ 69: salida, viaje, balance, cierre) → pausa (`HOURS`) → sello (decisión Q-E4) → ≥ 2 preguntas de Ask Hermes con `INQUIRY_REQUIREMENTS` → página de cuaderno (`PAGES.sNN` o scene page, PE-15) → objeto de satchel → línea en `previously.js` → línea de la Mirror Speaker (si procede) → sección de smoke.

| Cara | Qué debe traer el papel para que la web **dependa** de él | Gancho web mínimo (propuesta) | Riesgos |
|---|---|---|---|
| **27A Observatorio** | El plano de la cúpula con las posiciones de espejos y lentes y el anaquel de cartas; un dato que la web **no** repita (orientación inicial o una tabla de lentes con sus marcas), más un truco físico nuevo si se quiere (p. ej. lámina de acetato, **a decidir**). | Nodo 49 «The Observatory» (juego 3D: reorientar espejos y lentes con luz, A-23); su recompensa enciende la cúpula en el Hub y **abre el anaquel** que usa 28A; Wire con Hermes reconociendo su propia torre dañada; página del cuaderno con la fecha. | Q-E4 (sello); no repetir interacciones de S20–S28 (ficha de variedad); la torre «reconstruida/asaltada» no está definida (G03 §4.3.3). |
| **27B Cuaderno de Aurelia IV (el puente)** | La memoria del puente de 1971 **truncada/velada** (hoja plegada o con banda; o texto que se corta antes del vacío) para que **no se pueda leer** antes de la escena. | **Carta IV** en `aurelia-letters.js` (4.ª, lacre que se rompe) + escena «The Memory of the Bridge» (patrón sueño/catalejo: modal, no juego, `order_*`, replay desde la tarjeta con `scene:`) que ocurre **durante la Alineación** (A-25); clave nueva (`suspension_bridge`) para no colisionar con `bridge` (= catalejo del Natural Bridge, HC:6028-6031). Hermes comenta en el Wire; la edelweiss de PE-14a puede cerrar la escena. | **Spoiler**: las hojas llegan juntas; el diseño del papel debe hacerlo ilegible hasta la escena (A-27). Las cartas I–III «no hablan del puente» (AL:3-4): mantener. |
| **28A Cartas celestes + Alineación** | Una carta quemada con **huecos y fragmentos recortables o dibujados** y las 6 estrellas nativas marcadas (Ald, Pol, Veg, Alt, Den, Arc; A-24); los tres diales con escala impresa (rumbo Torre II, 354° Torre III, vertical Torre I; A-25); las *Three Rules of the Outer Dial* se leen en «The Astrolabe» (PE-05). | Dos nodos (50 y 51) o un nodo con dos juegos; el segundo reutiliza el tablero del primero; **Silvia gana el Astrolabe** (A-14): objeto de satchel + escena PE-06 (5A); `clue()` final del cuaderno. | Una sola cara para dos juegos: dificultad y legibilidad A5; Pope-E mueve un dial cada cierto tiempo (modo sin reloj, como A-18); las 6 estrellas y el 354° deben coincidir con 4A, 3B y 26A/26B. |
| **28B Hoja final de la Orden** | La hoja que se **guarda**: carta de la Orden a Silvia (sin WHAT ni WHEN nuevos), una reserva física para el sobre de Carles y el hueco de la **cerradura de 5 diales** (A-26) como dibujo vacío. | Última pieza del Hub: carta de Carles y «sobre sellado» (A-05); la Bóveda abre con las 5 sumas (A-26); la hoja puede llevar un **QR de apertura el día** (18–20 dic) que abre la escena final del Hub, con el objeto `order_wax_seal` (HC:6283) como eco del lacre inicial; página final del cuaderno + `journey-profile.js` para el tono del cierre (IB #13). | El WHAT **queda fuera del Hub** (A-05): ninguna cara puede nombrarlo; el QR no debe exigir conexión el día de la entrega; Regla 9 en el dibujo de la cerradura (sin cifras). |

---

## 5. Listas finales

### 5.1 Caras sin impacto web (NULO) y casi sin impacto (DÉBIL)
- **NULO (11):** 1A, 1B, 2A, 2B, 3A, 3B, 4A, 5A, 22B, 24B, 26B. *(1A, 4A, 5A y 22B con eco temático sin enlace.)*
- **DÉBIL (10):** 9A, 11B, 17B (eco), 18B, 21B, 22A, 23A, 24A, 25A, 26A (las seis últimas = salas aún sin construir).
- **Futuras (4):** 27A, 27B, 28A, 28B (sin existencia web).
- **Conclusión:** 21 caras de las 52 (40 %) no tienen más huella que una etiqueta o nada; **7 de las 11 NULO son de la parte Constellation (1A–5A)**, 3 de lore del Stage (22B, 24B, 26B).

### 5.2 Caras cuyo impacto web choca con lo impreso (⚠️)
| Cara | Choque | Evidencia | Vigente / acción |
|---|---|---|---|
| 18A | El papel dice «hour» pero el WHEN es 18–20 dic **sin hora**; la web lo da correcto | G00 R-04; `s19-oracle-horizon.js:42` | Web correcta; reimprimir 18A («day and season») |
| 20B | Plano con **4 campanas** dibujadas (G03 §1) y texto «five bronze bells»; el código usa 5 campanas y 6 notas (`TUNE=[0,2,4,3,1,2]` y `MIRROR = TUNE.slice().reverse()` (`s22-whispering-gallery.js:45-46`)) | G03:240; `s22-whispering-gallery.js:42-46` | Web respeta el texto, no el dibujo; documentar |
| 22B / 24B / 25A | Imprimen a **Pope-E en 1970** y «the key», lo que la web quería dosificar | G03 §3.1; A-07 | A-07: «Carles imita a un enemigo leyenda»; PE-10 |
| 23B ↔ Carta II | Copia de bronce **otoño 1970** (23B) vs «December 1970 · You carved twenty-four stars» (AL:44-48) | G03:160; A-10 | Cambiar la fecha de la Carta II (PE-14b) |
| 25B | Banderola en presente («torches … with our Astrolabe») en un cuaderno de 1971 | G03:243, 358 | Decidir 1971 vs 2026 antes de escribir S27 |
| 26A | «Gather the marks from the margins of Sheets 19 to 26» pero **no hay marcas impresas**; además da el WHERE (Ópera, 5 arcos, 48°12′N 16°22′E) desde el Wire 33 | G03:213-214 | A-08 (orden de los fragmentos) y G00 R-19 (se protege solo la confirmación por nombre) |
| 1A / `order_wax_seal` | Texto web: «**18-sheet** manuscript» (HC:6289) vs diario de **26 hojas** | HC:6289 | Cambiar texto (PE-01, retro) |
| Alfabeto (2A–3B) | G00 §3.1 dice «reconoce todas las letras» pero las cajas impresas no traen letras y la web entrega 12 de 26 glifos | G01:205; Q-E1 | Resolver Q-E1 |
| `JOURNAL_SHEETS` | Claves `'4'` y `'5'` = 4B y 5B; no hay 4A/5A; la pastilla «Sheet 4A» abriría 4B | HC:6007-6008, 6085 | Dar de alta `'4A'`, `'5A'` (PE-05/06) y renombrar `'4'`→`'4B'` |
| 12B | Hoja **congelada** (3-nov); el juego de web puede cambiar solo en comprobaciones | G00 §2.2 | No tocar |

### 5.3 Orden de prioridad de las propuestas
Criterios: (1) **fecha**: Silvia está en S14 y juega ~1 estación por sesión; (2) lo **irreversible** (papel de 27A–28B, ≈ 2 semanas de impresión); (3) **esfuerzo bajo con retorno alto**; (4) **retro-seguro** (no rompe su guardado).

| Prio | Propuesta | Por qué ahora | Esfuerzo |
|:-:|---|---|:-:|
| **P0** | **§4 Contrato de impacto de 27A–28B** (con Q-E4 y PE-03c/05/06) | Lo único irreversible; hay que definir los ganchos web **antes** de imprimir | M (decisión) |
| **P0** | **PE-14b parte fecha de la Carta II** (otoño 1970) | Corrección de texto de web, sin riesgo; evita el choque 23B/Carta II | S |
| **P1** | **PE-10** «Your theory» (22B) + dar de alta 22B/24B/25B/26B en `JOURNAL_SHEETS` | Silvia puede leer 22B en cuanto reciba el pliego (Wire 33, tras S19) | M |
| **P1** | **PE-03b** Alphabet Proof (cierra `ledger-complete.js`) | El Ledger completo llega ~20–22 nov y la escena ya está activa en el árbol de trabajo | S |
| **P1** | **PE-08** «The man on the ridge» (17B) | Se juega en S18, dentro de ~5 días de juego | S–M |
| **P1** | **PE-09** «The curtain between» (18B) | Se ve al cerrar S19 | S (M opcional) |
| **P2** | **PE-15** scene pages en el cuaderno (13A/14A/15B+16A); **PE-07a** «Five crosses»; **PE-07b/07c** (9A/11B) | D-14 ya aprobada; la ceremonia de S17 está próxima | M + S |
| **P2** | **PE-14a** 21A pressed flower; **PE-14c** 25B Answer the light; **PE-04** 3B/38°; **PE-11** 24B; **PE-13 (21B tune)** | Se hacen al construir cada sala (S23–S27) | S cada una |
| **P3** | **PE-12** 26B Chasm Pass; **PE-06** 5A Reassemble; **PE-05** 4A rules | Dependen de construir S28 y la Torre I | M |
| **P3** | **PE-01, PE-02, PE-03a, PE-03c** | Retro/afectivos; PE-03c solo con Q-E1 resuelto | S/M |

### 5.4 Huecos que esta auditoría deja abiertos
1. Texto íntegro de las caras no extraído por los scripts (los PDF son imagen): las 3 *Rules of the Outer Dial* (4A), el texto de 19A, 21A, 22B (solo en G03), 26B: comprobar contra maquetas `journal/pageNN/mockups/*.jpg` antes de citarlos.
2. Q-E1 a Q-E4 (§2).
3. Durante el audit no se ejecutó el smoke: no se comprobó que las tarjetas de `JOURNAL_SHEETS` abran bien desde cada pastilla.
4. Dónde se renombra `'4'`→`'4B'` sin romper `fallback` (HC:6085) y los usos de `window.openJournalPage` (HC:6080).

### 5.5 Datos transversales (claves exactas)
`order_aurelia_letters` ({I,II,III: {at, step}}) · `order_journal` · `order_ashes_clues` ({intercept, note1, feather}) · `order_stones_dream` · `order_bridge_spyglass` · `order_gates_scene_completed` · `order_sheet_seal_<node>` · `order_stage_pause_skipped_<node>` · `order_speaker_line_<node>` · `order_ledger_complete_seen` · `order_wire_chapters_closed` · `order_field_wire_step` · `order_field_inquiries_read`. Sello 20A: hash `9682e2b4` (código `TEDDWHYX`). Hash de 23A calculado: `77d1d1fa` (aún no pegado).
