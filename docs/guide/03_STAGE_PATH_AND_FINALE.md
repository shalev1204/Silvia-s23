> **GUÍA MAESTRA · Parte 3 · Stage Path (S20–S28), Torre I, Bóveda y final** · Anexo de [docs/GAME_MASTER_GUIDE.md](../GAME_MASTER_GUIDE.md) (léase primero la guía maestra) · Auditoría a 16-nov-2026 sobre el repo en `ec7ce59`. Marcas: [DOC] lo que dice un documento · [CÓDIGO] lo que hace el código o archivo · [INFERENCIA] deducción · ✅ hecho · 🟡 a medias · ⏳ pendiente · ❓ sin diseñar · ⚠️ conflicto. **Ante discrepancia manda el código; el papel ya impreso es inmutable.** Las citas `ruta:línea` corresponden a esa fecha.

# PARTE C · Stage Path (Torre III, Estaciones 20–28, Hojas 19–26) + Torre I (regreso) + Bóveda + final

Materia prima para `docs/GAME_MASTER_GUIDE.md`. Repo leído en solo lectura (worktree `game-context-docs-ed9d0b`, estado a 16-nov-2026). Rutas relativas a la raíz del repo salvo indicación. Marcas: [DOC] lo que dice un documento · [CÓDIGO] lo que hace el código/archivo · [INFERENCIA] deducción mía. Estados: ✅ ⏳ ❓ 🟡 ⚠️.

Abreviaturas de fuentes: SPB = `docs/STAGE_PATH_BIBLE.md` · HO = `docs/HANDOFF_STAGE_PATH.md` · IB = `docs/IDEAS_BACKLOG.md` · CAN = `docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md` · BSP = `scripts/journal/build_stage_path.py` · WSS = `web/hub/js/wire-script-stage.js` · HC = `web/hub/js/hub-core.js`.

---

## 0. Resumen ejecutivo del estado del Stage Path

| Est. | Sala | Hoja (cara) | Fragmento | Estado juego web | Estado hoja impresa |
|:-:|:--|:-:|:-:|:-:|:-:|
| 20 | The Gate of a Thousand Masks | 19B | I | ✅ construida (3D) | ✅ impresa y entregada |
| 21 | The Camera Obscura | 20A | II | ✅ construida (3D) | ✅ impresa (con sello QR) |
| 22 | The Whispering Gallery | 20B | III · ecuación J | ✅ construida (3D) | ✅ impresa (SIN sello, ver conflicto) |
| 23 | The Automaton Orchestra | 21B | IV | ⏳ NO construida | ✅ impresa (sin sello, sin púas legibles) |
| 24 | The Fly Tower | 22A | V | ⏳ NO construida | ✅ impresa (sin sello, sin masa) |
| 25 | The Shadow Theatre | 23A | VI · reliquia | ⏳ NO construida | ✅ impresa (CON sello QR, sin letras) |
| 26 | The Hall of Mirrors | 24A | VII | ⏳ NO construida | ✅ impresa (sin sello, con línea de doblez) |
| 27 | The Kaleidoscope Lantern | 25A | VIII | ⏳ NO construida | ✅ impresa (sin sello) |
| 28 | The Stage of the Mirror Speaker | 26A | IX · WHERE | ⏳ NO construida (el espejo final del mapa SÍ está) | ✅ impresa (sin sello, sin marcas de márgenes) |
| — | Torre I de regreso + Bóveda + final | 26B | — | ❓ sin diseñar en código (solo borradores en IB #13) | ✅ solo 26B de transición |

Caras de historia impresas: 19A, 21A, 22B, 23B, 24B, 25B, 26B. Wire construido: pasos 33–44 (`WIRE_LAST_STEP = 44`, HC:5846). Pasos 45+ no existen.

---

## 1. ESTACIONES CONSTRUIDAS (20, 21, 22)

### Estación 20 · The Gate of a Thousand Masks — ✅
- **Camino/Torre**: Stage Path · Torre III · nodo de mapa 40 (`s20-masks-gate.js:46 NODE = 40`).
- **Hojas**: 19A «The Unsent Letter» (lore, cara A) y **19B «The Gate of a Thousand Masks»** (juego, cara B). Se entregan las 8 hojas juntas con una paloma (Wire 33). Render: BSP:542 (19A), BSP:1040 (19B).
- **Archivos web**: `web/hub/js/stations/s20-masks-gate.js` (1336 l), `web/hub/css/stations/s20-masks-gate.css` + `s20b-masks-3d.css`; modal `#modal-masks-gate` en `web/index.html`; Wire en `web/hub/js/wire-script-stage.js`; marcha en `hub-core.js:8187` (`masksMarch`).
- **Historia**: tras la audiencia en Torre II, Hermes y Aurelia cruzan la meseta 18 h hacia el este tras las carretas de los Ashes (marcha con eventos Wire leg 34: `wire-script-marches.js:678`, tres ranuras a 0,2/0,5/0,8 de la marcha). Llegan al muro de máscaras. Dentro: pasillo de espejos, la Mirror Speaker se ve solo como reflejo (vestido gris, firma = línea recta). Tres máscaras talladas a medias. Al final, nicho de terciopelo con el Fragmento I («una luna que no está en el cielo») y la **nota 1 de Pope-E** clavada en la última máscara: «Let her through.» (sello de ceniza).
- **Mecánica y solución exacta**
  - **Parte I (palabra)**: 12 máscaras a lo ancho de la hoja 19B (4×3, **sin letras impresas**). Mienten las nº 2, 4, 5, 8, 10, 11 en orden de lectura (lágrima, Bauta agrietada, gato de una pluma, rey agrietado, encapuchada de ojos distintos, pierrot de la borla) [DOC SPB:80]. En la sala 3D las mismas 12 cuelgan lisas con una letra en la frente: `GREAT = ['S','G','I','O','L','L','V','D','E','E','N','R']` [CÓDIGO s20:34]. Las 6 verdaderas (pos. 1,3,6,7,9,12) = **SILVER**; las 6 mentirosas = **GOLDEN** (trampa con aviso propio: teclear GOLDEN → «Those are the letters of the six that lie»). Entrada tolerante: `letters()` quita no-A–Z y pasa a mayúsculas (s20:139). Fallo → `order_masks_key_fails`+1 y `wordHints.fail()`.
  - **Parte II (The Missing Halves)**: 3 máscaras talladas por una mitad (`the plain mask`, `the weeping mask`, `the feathered mask`); Silvia dibuja la otra mitad reflejada con dedo/ratón/teclado (flechas = pluma, Espacio/Enter baja/sube; Shift pasos de 1). Criterios: TOL 15 u (de 300), cobertura ≥ 0,72, cada línea ≥ 0,45, precisión ≥ 0,70 (s20:105-108). Fallo → `order_masks_draw_fails`+1 y `halfHints.fail()`. Se resetea a 0 al acertar.
  - **Escalera de pistas** (motor `hint-ladder.js`: nivel 1 a 3 fallos/10 min, 2 a 6/20, 3 a 9/35): `s20-word` (n1 mirar el muro; n2 abre Ask Hermes «How do I find the masks that lie…»; n3 resuelve las dos primeras máscaras con ella) y `s20-halves` (n1 «el espejo gira la mitad»; n2 guía punteada + botón «Let the Mirror Speaker carve it»; n3 empezar por el contorno). Ayuda antigua: `order_masks_hint`, `order_masks_draw_hint`.
- **Recompensa**: Fragmento I (destella en el Espejo Vivo al cerrar el modal; `justSet`/`showMirror`, s20:117,1241); reliquia de satchel `mirror_fragment_1` (HC:6401); **sin ecuación** del Ledger. Cuaderno de Hermes (`field-journal.js` PAGES.s20). Ask Hermes: `inq-unsent-letter`, `inq-masks-lie`, `inq-masks-halves`, `inq-ash-note`.
- **Field Wire**: 33 (partida; respuesta inicia la marcha 18 h: `MARCH_STARTED_BY_ANSWER[33]`, HC:8300) → 34 (final; muestra la marcha, `MARCH_LEGS[34]` HC:8244) → **35 balance** (SILVER, reflejo, nota «Let her through.», ask «Where shall I look first?») → 36 cierre. Tras 36 se cuela el mensaje interceptado (`appendWireIntercept`, HC:7422, 9762). Ceremonia de capítulo en el paso 33 (cierra III «Tower II in Flames», abre IV «The Mirror Sanctuary») [`wire-ceremony.js:34-54`]. Sello QR requerido: ninguno.
- **Flags/localStorage**: `order_masks_march_start` (inicio marcha; el tester «complete» escribe `1`), `order_masks_march_bypassed`, `order_masks_gate_awake` (palabra dicha), `order_masks_carved` (0–3), **`order_masks_gate_completed`** (flag oficial), `order_masks_key_fails`, `order_masks_draw_fails`, `order_masks_hint`, `order_masks_draw_hint`, `order_masks_howto`, `order_masks_cine_intro`, `order_stage_mirror_seen`, `order_ashes_clues` (`note1` se anota al aparecer el paso 35, HC:7466). Reset del tester: HC:810.
- **Dependencias**: `order_oracle_horizon_completed` (S19) para que exista la pestaña Path III; marcha de 18 h terminada o tester. Desbloquea: S21 (pausa 3 h + sello 20A).
- **Verificación**: smoke `s20` (`test_masks_gate`), `mirror`, `ashes`, `a11y`. Suite completa 206 comprobaciones (HO:16).
- **Huecos/conflictos**: (1) SPB:257 (sección «Estación 20») dice que las mentirosas dan SILVER y lista 12 letras M S A I L O T V H E R U, pero SPB:80 y el código dicen verdaderas = SILVER, mentirosas = GOLDEN → ⚠️ la sección vieja está obsoleta. (2) SPB:258 dice «tras 3 intentos: guía punteada»; el código la abre en nivel 2 de pista (6 fallos o 20 min) → ⚠️ (s20:111 `guideShown = level>=2`). (3) SPB:206 sitúa la nota 1 en «Field Wire 35 y Ask Hermes» ✅ coherente.
- **Fuentes**: SPB:254-260, SPB:80; s20:1-120, 300-410; WSS:94-160; HC:7437; `journal/stage_seals.json` (19B no tiene sello).

### Estación 21 · The Camera Obscura — ✅
- **Camino/Torre**: Stage · Torre III · nodo 41 (`s21:NODE`).
- **Hoja**: **20A «The Camera Obscura»** (cara A, juego). Render BSP:1169. Ciudad dibujada **boca abajo** («el texto no gira»), pie «Look at the sky, the roofs, the shutters and the street.», «The Three Hearths» (dos chimeneas humean en la hoja: molino y casa junto al mercado), **sello QR 20A** (modo `camera_obscura`, 400 px). Fragmento II dibujado en la hoja (código `TEDDWHYX` → hash `9682e2b4`, `journal/stage_seals.json`).
- **Archivos**: `s21-camera-obscura.js` (927 l), `s21-camera-obscura.css`, `s21b-camera-3d.css`; datos `web/assets/js/camera-city-data.js` generado por `scripts/journal/camera_city.py` (misma geometría que la hoja, 11 lugares).
- **Historia**: velas consumidas, la Mirror Speaker abre una puerta y una escalera (31 escalones); abajo, sala negra con un agujero en la pared; la ciudad de la Torre III se proyecta boca abajo. Los Ashes encendieron un fuego en la «narrow house» para que alguien mirase (Aurelia: «un fuego así no lo encienden quienes quieren esconderse»); el Fragmento II está en el hogar, envuelto en un trapo de ceniza; las paredes tienen el signo de los Ashes (círculo con línea).
- **Mecánica y solución**: la imagen empieza a 180° y borrosa; el **anillo de lente** (arrastrar, flechas ±5°, Shift ±1°, RePág/AvPág ±45°, Inicio/Fin) la gira; solo **nítida y derecha (±7°)** se puede señalar (clic en borroso no cuenta fallo). Cuatro cambios respecto a la hoja: bandera nueva en la torre del reloj (`flag`), carro en la calle (`cart`), contraventana abierta→cerrada en la casa de las contraventanas (`shutter`), chimenea fría de la **casa estrecha tras el mercado** (`house_d`) que ahora humea (`smoke`) = **el escondite (solución)**. Señalar un cambio falso lo apunta pero cuenta fallo; un lugar sin cambios «exactly as it was» (fallo). Antes humeaban 2 chimeneas, ahora 3.
- **Pistas**: `s21-city`: n1 «cuatro cambios, ¿cuál es fuego?»; n2 «cuenta chimeneas: dos en la hoja, tres en la pared»; n3 «empieza por el mercado y mira la casa estrecha». Ask Hermes: `inq-camera-upside` (desde S20), `inq-camera-house` (al resolver). Wire 37 `onPick` concede n1 (`W.hint('s21-city',1)`).
- **Recompensa**: Fragmento II (`mirror_fragment_2`); sin ecuación. Línea de la Mirror Speaker al abrir la sala (sobre la 20). Ambient «dark room» (`ambience.js:64`).
- **Wire**: 37 (velas, escalera, hoja 20A a mano) → 38 (agujero en la puerta; barra «The Camera Obscura · Station 21 Awaits» hasta `order_camera_obscura_completed`, HC:9163) → 39 balance (Fragmento II en la chimenea, «who were they hoping would look?») → 40 cierre. Telemetría final 38 y 40 (HC:7286-7287). **Pausa 3 h** (`stage-pause.js:10 HOURS[41]=3`, cuenta desde la página de cuaderno de S20) y **sello 20A** requeridos (`holdForDoor(41…)` en paso 36, HC:9156). Relic WIRE_FINAL_RELIC[40]=`mirror_fragment_2`.
- **Flags**: `order_camera_obscura_completed`, `order_camera_obscura_fails`, `order_camera_obscura_found` (lista de cambios), `order_camera_howto`, `order_camera_cine_intro`, `order_sheet_seal_41`, `order_stage_pause_skipped_41`, `order_speaker_line_41`. Reset HC:813-815.
- **Dependencias**: S20 resuelta; pausa 3 h; sello. Desbloquea S22.
- **Verificación**: smoke `camera` (pausa → sello real → chat → anillo → fallos/pistas → teclado → Fragmento II → chat → tester); `a11y`.
- **Fuentes**: SPB:242-252; s21:1-140, 217-247; WSS:178-320; sheet-seals.js:10; stage-pause.js:10.

### Estación 22 · The Whispering Gallery — ✅ (fijó la J del Ledger)
- **Camino/Torre**: Stage · nodo 42.
- **Hoja**: **20B «The Whispering Gallery»** (cara B). Render BSP:1348. Plano elíptico a escala (95 px/vara, barra 0–5 varas), ejes con medidas 10×8 varas, viñeta del jardinero (Kepler), «The Secret of the Niche» («cinco campanas de bronce… desde el último toque al primero»; «Non sonus, sed reflexio.»). **El plano no marca los focos ni los alfileres**: se hallan con «cinco varas desde la curva norte hasta el eje central» (RULE_20B, BSP:1256). **La hoja impresa NO lleva sello** (el código de 20B no llama a `draw_seal`; BSP:1348-1424).
- **Archivos**: `s22-whispering-gallery.js` (1252 l), `s22-whispering-gallery.css` + `s22b-gallery-3d.css`; `web/assets/js/whisper-gallery-data.js` generado por `scripts/journal/whisper_gallery.py` (elipse a=5, b=4 varas, c=3 [triángulo 3-4-5], 17 columnas, puerta en el centro del lado sur, raiders = focus **east**).
- **Historia**: segunda escalera, sala sin esquinas. Los Ashes susurran en el foco este sobre un cuenco de brasas; ya tocaron al nicho su melodía **nota por nota** y no abrió. Su frase: «…Then it is not a tune. It is a reflection. Leave it. She will come.» («waiting for you»). Aurelia conoce cada columna al tacto (ha estado antes; susurra algo corto hacia el este). Dentro de la puertecita del nicho, rayado a mano por Aurelia, la línea para el Ledger.
- **Mecánica y solución exacta**
  1. **Los alfileres**: Hermes empieza en (0, −3,5) varas; rejilla de media vara (arrastrar/tocar/flechas; Enter = escuchar). La sala dice su posición («2 varas west, 0.5 varas north»). Susurro filtrado en estéreo; se aclara a <1,5 varas del foco, «clear as a bell» a ≤0,5 (`HEAR=1`, `CLEAR=0.5` en el código). **Foco oeste = (−3, 0)** [CÓDIGO: `listenAt = foci[raiders==='east'?'west':'east']`]. «Stand still and listen» fuera del foco = fallo (`focusHints.fail`). No se puede acercar a <1 vara del foco este (`ASH=1`, no es fallo). Flag `order_whispering_gallery_focus`.
  2. **El eco en espejo**: la melodía (**6 notas sobre 5 campanas**): `BELLS=[523.25,587.33,659.25,783.99,880.0]` (C5 D5 E5 G5 A5), `TUNE=[0,2,4,3,1,2]` (campanas 1-3-5-4-2-3), **`MIRROR = TUNE.reverse() = [2,1,3,4,2,0]` → campanas 3-2-4-5-3-1 (E D G A E C)** [CÓDIGO s22:42-46]. Silvia debe tocar la secuencia inversa. Tocarla al derecho da «Note for note, exactly as the raiders played it. The niche stays shut»; cualquier otra «stays shut»; «Hear the tune again» sin límite. Cada error → `echoHints.fail()`.
  - **Sin sonido**: si el altavoz de `EclipseAmbience` está en silencio, cada susurro sale escrito y cada campana brilla al sonar (camino accesible).
- **Pistas**: `s22-focus` (n1 «busca la rosa en la hoja»; n2 «está en el eje largo, al oeste»; n3 «cuerda 10 varas; desde 4 varas sobre el medio, 5 varas llegan al eje a 3 varas del centro → rosa a 3 varas al oeste») y `s22-echo` (n1 «es un reflejo»; n2 «último → primero»; n3 «escribe las campanas 1–5 y lee la lista al revés»). Wire 41 `onPick` n1 de `s22-focus`. Ask Hermes: `inq-gallery-pins` (desde S21), `inq-gallery-niche` (al resolver). Ambient «stone gallery».
- **Recompensa**: Fragmento III (`mirror_fragment_3`); **Ledger: línea «The Line of the Echo»: [J] × 2 = [T]** (`gallery-jt`, HC:3317, requiere `order_whispering_gallery_completed`). Solución del Operador: **T = 16 ⇒ J = 8** (CAN §7.B.13, líneas ~720-726). Regla 9: el valor no se muestra. **Carta I de Aurelia** («The Alpine Observatory · March 1970») se desbloquea al ganar (`aurelia-letters.js:35`, `room: 2`).
- **Wire**: 41 (el hogar se apaga; la hoja 20B a mano) → 42 (puerta de la galería; barra espera a la Estación 22) → **43 balance** (Fragmento III, «She will come», línea de J; elección «I will solve the line») → 44 cierre (`WIRE_LAST_STEP`). Ceremonia en el paso 41 (cierra IV «The Mirror Sanctuary», abre V «The Whispering Gallery»; `wire-ceremony.js:55-73`). **Pausa 6 h** tras S21 (`HOURS[42]=6`); **sello**: 20B no lleva (SEALS[42]=null, sheet-seals.js:10) → no hay puerta de sello. Telemetría paso 44: «THE NICHE OPENED · THE TUNE MIRRORED · FRAGMENT III SET · 3 / 9 · [J] × 2 = [T] RECORDED» (HC:7289).
- **Flags**: `order_whispering_gallery_completed`, `order_whispering_gallery_focus`, `order_gallery_howto`, `order_gallery_cine_intro`, `order_stage_pause_skipped_42`, `order_speaker_line_42`, `order_aurelia_letters` (clave `I`). Reset HC:818-822.
- **Dependencias**: S21 resuelta + 6 h. Desbloquea S23 (nodo 43; `HOURS[43]=null`).
- **Verificación**: smoke `gallery` (en `QUICK`): pausa → sello real → chat → teclado → fallos → focos → melodía al derecho, errónea y en espejo → Fragmento III → Ledger → chat → sin sonido → tester.
- **Huecos/conflictos**:
  - ⚠️ SPB:232 y SPB:240 y IB (#14) dicen que 20B lleva sello con hash en `SEALS[42]` y que Silvia «debe escanearlo»; SPB:82 (§4.1), la hoja impresa (BSP:1348) y `sheet-seals.js:10` dicen que 20B **no** lleva sello y `SEALS[42]=null`. Vigente: el código y el papel.
  - ⚠️ «5 campanas» (hoja 20B, Ask Hermes de pistas, SPB:239) vs «6 campanas» (SPB:235 dice «melodía de 6 campanas (de 5)») vs **dibujo de 20B con 4 campanas** (SPB:82). El código usa 5 campanas y 6 notas. Hay un texto legado en `hub-core.js:5184` («the five bells of the niche») coherente con 5 y otro en HC:5776 («a tune of six bells») que hay que leer como 6 *notas*.
  - HO:22 («imprimir la Hoja 20 a doble cara… Silvia escanee los sellos de la 20A y la 20B») está caducado: SPB:76 declara las 16 caras impresas y entregadas.
- **Fuentes**: SPB:227-240, 82; s22:1-120, 340-373; whisper_gallery.py; WSS:322-458; HC:3317.

---

## 2. ESTACIONES NO CONSTRUIDAS (23–28)

### 2.0 Lo que es común a las seis (decidido y pendiente)

**Decidido (DOC)**
- Cada sala nace como `web/hub/js/stations/sNN-*.js` + `web/hub/css/stations/sNN-*.css`; patrón en HO:41-46 (modal `.monolith-*` con clase `is-stage-room`, `window.STAGE_OPENERS[node]`, `STAGE_CARDS[node]`, `makeMarch`/`MARCH_LEGS`/`MARCH_STARTED_BY_ANSWER`, pasos del Wire «empezar en 37» [obsoleto: ya van por el 44], `WIRE_LAST_STEP`, telemetría, divisores, tester `GAMES`/`ARRIVAL`/`WALKS`/`syncWire`, preguntas Ask Hermes grupo `stage`, sección del smoke y último de `QUICK`).
- **Preguntar al Operador las decisiones de diseño «en formato test», una estación cada vez** (HO:22, HO:42).
- Cada sala cumple la **ficha de variedad** (SPB §6.1), la **escalera de pistas** (#6), su **cama de sonido** (#4, `ambience.js:BEDS`), su **pausa** (#3, `stage-pause.js:HOURS`), la **línea de la Mirror Speaker** (`EclipseMirrorSpeaker.render(node, el)`), su **sello** si lo tiene impreso (#14), alta en `JOURNAL_SHEETS` con título impreso (memoria `feedback_page-titles-not-sheet-numbers`: `JOURNAL_SHEETS` hoy solo tiene 19A, 19B, 20A, 20B y 21B), `TITLE` en `sheet-seals.js` (solo 41–43), página del cuaderno `PAGES.sNN` en `field-journal.js` (hoy s20–s22), frase `Previously` por sala (`previously.js:31-33`, solo s20–s22), miniatura de hoja/ficha (`assets/thumbnails/*_preview.webp`; las salas sin construir usan `stage_mirror_preview.webp`), reliquia de satchel `mirror_fragment_N` + SVG `assets/items/item_mirror_fragment_N.svg` (solo 1–3; HC:6401-6429, 6569), línea en `WIRE_FINAL_RELIC` (HC:7403, solo 36/40/44), carta de Aurelia donde toque, nota de Pope-E donde toque.
- Ya preparado en código para los 9 nodos: tabla de salas y flags en `web/assets/js/stage-mirror.js:20-30` (flags: `order_automaton_orchestra_completed`, `order_fly_tower_completed`, `order_shadow_theatre_completed`, `order_hall_of_mirrors_completed`, `order_kaleidoscope_lantern_completed`, `order_mirror_stage_completed`); ficha genérica «The door is still closed» (HC:1989-2056, `rooms` con teaser por sala); tabla `FACE` de sellos (23B…26A) y `SEALS` a `null`; `HOURS` 43–48 a `null`; códigos QR ya generados en `journal/stage_seals.json` (hashes calculados por mí con el FNV-1a de `sheet-seals.js:19`: 20B `a5cfd3a9`, 21B `88f97815`, 22A `30448394`, **23A `77d1d1fa`**, 24A `5521dbb8`, 25A `be83e864`, 26A `95762354`).
- **Wire previsto (INFERENCIA por patrón 4 pasos/estación)**: S23 = pasos 45–48, S24 = 49–52, S25 = 53–56, S26 = 57–60, S27 = 61–64, S28 = 65–68. Patrón por estación [DOC SPB:121]: escena de salida con respuestas (inicia el viaje), viaje, balance tras la estación y cierre; las caras de historia se citan en el chat en su momento («Open Sheet 22B…» [en la web debe decir el título entre comillas curvas]). No existe ninguna definición de capítulos más allá del 41 (`WIRE_CHAPTERS`, HC:7038) ni de ceremonias (`wire-ceremony.js` solo tiene claves 25, 33, 41). El balance de cada estación debe cerrar con la línea de telemetría `WIRE_FINAL_TELEMETRY`.

**Pendiente común (❓)**: pausas en horas (la guía SPB:145,183 solo sugiere 3–8 h/sala), cama sonora, texto del Wire, diálogos de Aurelia, nombre/forma del sello cuando falte, reliquia de S25, el resto de lo listado arriba.

**Restricciones del papel ya impreso (SPB §4.1, ampliadas con lo que he comprobado en las maquetas `journal/page2N/mockups/*.jpg` y en `BSP`)**: la web se adapta al papel, no al revés (SPB:76). Las hojas **no** pueden cambiar; cualquier dato que el papel prometa y no traiga lo debe producir la web. Textos impresos ya nombran «Sheet 23», «Sheet 24», «Sheets 19 to 26» por número (excepción de lo impreso; el texto web debe usar títulos).

---

### Estación 23 · The Automaton Orchestra — ⏳
- **Camino/Torre**: Stage · Torre III · nodo 43 · flag `order_automaton_orchestra_completed`.
- **Hoja**: **21B «The Automaton Orchestra»** (cara B, ya impresa; BSP:1540). Hoja 21A (cara A de la misma hoja) = **«The Alpine Memories»** (cuaderno de Aurelia I, historia), BSP:1456.
- **Lo ya decidido**
  - Premio: **Fragmento IV** (SPB:112). Sin ecuación del Ledger (J=S22; Q y X ya dadas antes; ver §6 conflicto Q).
  - Ficha de variedad (SPB:133): **colocar púas en la rejilla del cilindro según la partitura**, sentido oído + vista, dificultad 2, acaba «los autómatas tocan la canción». Segunda sala de **sonido** (con S22); debe tener camino sin audio (partitura visible/subtítulos) y respetar el altavoz ambiental.
  - Pope-E: **nota 2**, con la cita *«You were never only the seeker»* (pista 2 del canon secreto), «al construir la sala» (SPB:210, IB #10; HO dice «22/26 aprox.»: ⚠️ conflicto, vigente la Biblia y el backlog: S23).
  - Pausa: `HOURS[43]=null` (sin definir; SPB §6.1 sugiere 3–8 h).
  - Papel: **sello 21B existe en `stage_seals.json` (`NKMRSZAX`) pero NO está impreso en la hoja** (ni fragmento ni sello se dibujan en 21B; `_render_game_fragment_row` no se llama desde ninguna cara).
- **Qué dice el papel (21B)**: tres músicos de relojería (laúd, flauta, dulcémele) de madera de peral y latón; **un gran cilindro de bronce con púas de hierro** bajo las tablas de cedro («bristling with iron pins») [dibujo: cilindro grabado con filas de puntos pero **no hay partitura legible ni rejilla de compases**]. Regla impresa: «Study the measures upon the drum. The song that opens the gate is the reflection of the melody: read each pitch from the opposite rim of the cylinder, from the last measure to the first.» Seis campanas bajo el tablero afinadas al «natural hexachord» **C · D · E · F · G · A** (grabado con la letra en cada campana). Pie: «The last note struck is the first to unlock.» «To open the door of the Orchestra, play the reflection of the melody upon the bells.»
- **Lo que FALTA (lista exacta)**
  1. ❓ **La melodía** (secuencia de notas y su longitud) y su **representación en la rejilla del cilindro**: el papel no la trae → la web la define entera. Debe usar solo las 6 notas C D E F G A.
  2. ❓ Mecánica concreta de «colocar púas» y de dónde sale la «partitura» que Silvia debe leer (el papel solo explica el principio de reflexión).
  3. ⚠️ Coherencia de variedad: la regla impresa («tocar el reflejo, del último compás al primero») repite la solución de S22 (tocar la melodía al revés en campanas) en la sala consecutiva. La ficha prohíbe dos salas seguidas con la misma interacción; el papel fuerza la misma *idea*. Decisión pendiente: cómo diferenciar (p. ej. colocar púas [S23] vs tocar campanas [S22]; el Operador debe decidir).
  4. ❓ Solución exacta (secuencia final de púas/campanas y qué hace sonar a los autómatas), condición de fallo y niveles de la escalera `s23-*`.
  5. ❓ Texto de Pope-E nota 2 (texto literal, dónde se encuentra, sello de ceniza) — canon exige la cita «You were never only the seeker» sin origen.
  6. ❓ Escenas del Wire 45–48 (salida, viaje, balance, cierre), incluyendo qué dice la Mirror Speaker (línea compuesta por `mirror-speaker.js`, reacciona a cómo se resolvió S22), reacciones de Aurelia (ya cercana a su memoria: la 21A impresa dice «She is beginning to remember the way back»).
  7. ❓ Sello 21B: decidir si se pega `SEALS[43]='88f97815'` (el QR no está impreso → **no se puede**: o se deja `null` o se reimprime la 21B; decisión del Operador). Mientras, `FACE[43]` exigiría sello y bloquearía la sala.
  8. ❓ Pausa (horas), cama sonora (`BEDS['modal-automaton-orchestra']`), cuaderno `PAGES.s23`, `Previously.s23`, `TITLE[43]` ya está en `sheet-seals.js:13`, `inq-orchestra-*` Ask Hermes, reliquia `mirror_fragment_4` + SVG, miniatura, smoke `orchestra`.
- **Dependencias**: S22 resuelta + pausa. Desbloquea S24.
- **Fuentes**: SPB:112,133,210; HO:32; BSP:1540-1600; `journal/page21/mockups/page21_back_real_paper_mockup.jpg`; sheet-seals.js:10-13; stage-pause.js:10.

### Estación 24 · The Fly Tower — ⏳
- **Camino/Torre**: nodo 44 · flag `order_fly_tower_completed`.
- **Hoja**: **22A «The Fly Tower»** (cara A, juego, impresa; BSP:1703); cara B = **22B «The Ashes Before Christ»** (historia, BSP:1830).
- **Decidido**
  - Premio: **Fragmento V**. Ficha SPB:134: **tiempo real, arrastrar contrapesos contra el reloj**, tacto/reflejos, dificultad **4**, acaba «escena equilibrada».
  - ⚠️ «Ecuación Q» (SPB:113, 118-119, HO:33-45): **obsoleta**. La Q se entregó en la Estación 11 el 25-10-2026 (CAN §7.B.16, línea ~742-746; memoria `project_ledger-letters-q-z`: «Station 24 has no free letter»). CAN:726 dice que S24, «si hace falta, llevará una línea de comprobación»: **no decidido**.
  - Pausa: `HOURS[44]=null`. Sin sello impreso (el código 22A existe en `stage_seals.json`, `EIIODYFB`, pero la cara no lo dibuja).
- **Qué dice el papel (22A)**: aparejo de la torre de maniobras con 4 poleas de boj, cuerdas de cáñamo, **clinómetro** semicircular con plomada (arco de bronce), plataforma/cesta («cradle») oeste con **3 sacos de arena y un lingote/peso**, dos cuerdas cortadas a la derecha con un peso suelto. Reglas impresas: (I) «Settle the plumb-bob exactly upon **thirty-eight degrees** on the bronze arc»: solo ahí el trinquete suelta el freno; (II) «distribute the sandbags and iron ingots upon the west cradle. When the cradle counterweight **equals the mass of the curtain**, the proscenium raises smoothly»; nota de campo: «If the plumb-line drifts even two degrees from thirty-eight, the iron teeth bite and lock the track. Set the balance first; weigh the cradle second.» Los asaltantes cortaron las cuerdas del este para bajar la cortina de hierro del proscenio.
- **Lo que FALTA**
  1. ❓ **La masa de la cortina y las masas de sacos/lingotes** (el papel no imprime ninguna cifra): las da la web. (Posible sitio para una ecuación de una sola incógnita sin dar valores de letras.)
  2. ❓ Mecánica «contra el reloj»: el papel no habla de tiempo; hay que justificar en historia por qué corre el reloj (SPB:113 dice «los asaltantes cortan cuerdas»; el papel dice que ya las cortaron).
  3. ❓ Tolerancia del clinómetro: el papel dice que ±2° bloquea (SPB:84: «38° (±2° bloquea)»). Definir si es ≥2° o >2°, y qué pasa al bloquear (penalización/reinicio).
  4. ❓ Si S24 lleva «línea de comprobación» del Ledger (cuál; regla 9: sin valores) o ninguna.
  5. ❓ Solución exacta (combinación de pesos), fallos, niveles de pista `s24-*`, escenas 3D, juice (UX standard), accesible sin tiempo (¿modo sin reloj?).
  6. ❓ Wire 49–52, pausa, cama sonora, reliquia/SVG del Fragmento V, cuaderno, Previously, Ask Hermes, smoke.
  7. 22B ya impresa trae contenido que la web debe respetar: ver §3 (Pope-E, pluma dorada, nota firmada).
- **Dependencias**: S23 + pausa. Desbloquea S25.
- **Fuentes**: SPB:84,113,134; HO:33; BSP:1703-1786; CAN:726; memoria `project_ledger-letters-q-z.md`.

### Estación 25 · The Shadow Theatre — ⏳
- **Camino/Torre**: nodo 45 · flag `order_shadow_theatre_completed`.
- **Hoja**: **23A «The Shadow Theatre»** (cara A, juego, **con sello QR impreso**, BSP:1920) y **23B «The Disc and the Vow»** (cara B, cuaderno de Aurelia II, BSP:1985). Son las dos caras del truco **al trasluz** (IB #8).
- **Decidido**
  - Premio: **Fragmento VI + una reliquia (sin nombre ni diseño)**. Ficha SPB:135: **secuencia de escenas: mover figuras y lámparas siguiendo el guion**, vista, dificultad 3, acaba **palabra tecleada** («lo que dicen las sombras»).
  - Trasluz (SPB:154): «Puesta contra una lámpara, la hoja junta sus dos caras: las figuras de 23A y las marcas de 23B (leídas en espejo) forman la escena o la palabra que la sala pide teclear». Reglas SPB:158-162: papel 80–90 g/m²; **la web nunca da el dato** (miniaturas sin esas marcas; la pista nivel 3 explica el gesto «hold Sheet 23 up to a lamp», nunca el resultado); salida de emergencia: pedir a Hermes y Carles abre desde el tester.
  - **Carta II de Aurelia** (diciembre 1970, «El disco») al ganar S25 (`aurelia-letters.js:44-52`, `room: 5`); cuaderno II = 23B.
  - Sello: **el único (junto a 20A) impreso de verdad**. Código `YCIJNQSR`, hash **`77d1d1fa`** (cálculo mío con el hash de `sheet-seals.js`; SPB:85 y IB lo citan igual) → **falta pegarlo en `SEALS[45]`** (hoy `null`). QR en modo `shadow_theatre` (latón calado, silueta torre+luna), ~407 px.
  - Pausa: `HOURS[45]=null`.
- **Qué dice el papel**: 23A: tres lámparas venecianas colgadas de un raíl de hierro; **tres siluetas articuladas de latón en el escenario: una luna creciente con rostro, una torre almenada con puerta y dos ventanas, una figura enmascarada con sombrero de pluma y capa**; engranajes y compases al pie; sello QR. Texto: «arrange the brass figures along the beam between the flames. When the shadow of the tower and the crescent align, hold this page against a lantern: the light passing through both faces will bring the secret cipher into focus.» 23B: disco de bronce con **24 radios**, y **tres aberturas** (una arriba al centro y dos abajo izq./der., justo donde caen las tres lámparas de 23A al darle la vuelta), título «The Disc and the Vow», texto «In the autumn of 1970… we cast this disc of bronze… Held up to a candle, the light shining through both faces reveals the secret word of our covenant», «Instructions for the Flame» (1 vela detrás de la hoja; 2 «Hold Sheet 23 upright…»; 3 «Look through the three pierced apertures… revealing the secret letters of our vow»). Firma «A.». **No hay ninguna letra impresa en ninguna cara**: el trasluz solo muestra lámparas y aberturas.
- **Lo que FALTA**
  1. ❓ **La palabra de la sala** («secret word of our covenant»/«secret letters of our vow»): NO DEFINIDA en ningún documento. Debe salir de la escena web guiada por las lámparas (SPB:86). [INFERENCIA: el «voto» canónico es «You were always the treasure»; no hay decisión de si la palabra es de ese voto.]
  2. ❓ El guion de la «secuencia de escenas»: qué figuras (luna, torre, enmascarado) se colocan dónde y en qué orden, cómo interviene el trasluz (la web no puede mostrarlo; la pista n3 solo explica el gesto).
  3. ❓ **La reliquia**: id, nombre, arte SVG, texto de lore, dónde aparece (`SATCHEL_RELICS` solo trae `mirror_fragment_1..3`).
  4. ❓ Pegar el hash `77d1d1fa` en `SEALS[45]`, añadir `TITLE[45]` («The Shadow Theatre»).
  5. ❓ Pausa, Wire 53–56, cama sonora, Ask Hermes, `PAGES.s25`, `Previously.s25`, smoke `shadow`; cómo se evita que las miniaturas de la Hoja 23 del Hub revelen el truco (las hojas 23A/23B no están aún en `JOURNAL_SHEETS`).
  6. ⚠️ Inconsistencia impresa: 23B dice «In the autumn of 1970» que fundieron («cast») el disco de bronce, mientras que la carta II de Aurelia en código dice «December 1970… You carved twenty-four stars into brass» y el canon (CAN §2.B) y S19 hablan de un disco **grabado a mano por Hermes** con 24 avistamientos y tres anillos de 8 letras. El disco de 23B tiene 24 radios y tres ventanas; el de S19, tres anillos de letras. Hay que decidir si es el mismo disco (y cómo cuadra) antes de escribir el Wire.
  7. ❓ Posible conflicto de registro: el trasluz exige alineación ±2 mm (SPB:159); validar con impresión real (IB #8 «prueba física» pendiente).
- **Dependencias**: S24 + pausa + sello 23A. Desbloquea S26.
- **Fuentes**: SPB:114,135,154,158-162; IB:154-161; BSP:1920-2068; `journal/page23/mockups/*`; aurelia-letters.js:43-52; stage_seals.json.

### Estación 26 · The Hall of Mirrors — ⏳
- **Camino/Torre**: nodo 46 · flag `order_hall_of_mirrors_completed`.
- **Hoja**: **24A «The Hall of Mirrors»** (cara A, juego, **con línea de doblez** `FOLD_LINES['page24_front']` = eje vertical central, BSP:2561; BSP:2069) y **24B «The Doctrine of the Mirror Speaker»** (cara B, lore, BSP:2136).
- **Decidido**
  - Premio: **Fragmento VII**. Ficha SPB:136: **laberinto, moverse entre reflejos (flechas o toques)**, sentido vista/espacio, dificultad **5 (pico)**, acaba «llegar a la salida (el reflejo de Pope-E)». Una sala suave tras la dura: S27 = 2.
  - Pope-E: **reflejo de espaldas** en la sala (pista 4/canal 2 del canon, SPB:200, 211). Los asaltantes «solo se ven reflejados» (SPB:115).
  - Truco **doblar** (IB #8, SPB:155): «Doblada por el eje marcado, las dos mitades del plano se juntan y muestran el único camino o el reflejo que la sala necesita. Sin doblar, el plano engaña». La web solo puede explicar el gesto («fold Sheet 24 along the mirror line»), no el resultado. Marcado en la vista previa con 40 px libres a cada lado (BSP:2561).
  - Pausa: `HOURS[46]=null`; sello `24A` en `stage_seals.json` (`YQCCMLDP`) pero **no impreso**.
- **Qué dice el papel (24A)**: plano rectangular (≈ 20 pasos venecianos de ancho con barra «Scala di Venti Passi Veneziani»), **puerta oeste (W, izquierda)** y **salida este (E, derecha, cámara pequeña)**, eje central discontinuo vertical, **cuatro alcobas numeradas IV y VI (arriba) y V, V (abajo)**, tabiques en L; ambas mitades casi simétricas salvo un **cristal/piedra oscura en la mitad derecha cerca de la salida E**; esquema óptico candil–espejo–ojo + rosa de los vientos. Texto: «Count twenty Venetian paces from the Western gate: at each mirrored alcove, reject the path that duplicates your candle. Follow only the corridor where your shadow walks ahead of you»; «Fold Sheet 24 along the central silver axis: the false reflections cancel against stone masonry, revealing the only unmirrored route through the twenty paces to the inner chamber»; citas «Never trust the corridor that reflects your own eyes; the true path reflects only the lanterns behind you.» y «Twenty paces from gate to sanctum: where the glass lies, the compass remembers.» **No hay ninguna ruta marcada**.
- **Lo que FALTA**
  1. ❓ **El grafo exacto del laberinto y la ruta correcta** (la web debe coincidir con el plano impreso: tabiques, alcobas IV–VI, 20 pasos W→E). El significado de los numerales de las alcobas (IV, V, VI, V) no está definido.
  2. ❓ Qué muestra el doblez y cómo lo usa la web sin revelar el dato; qué pista de nivel 3 se escribe (solo el gesto).
  3. ❓ Mecánica de «solo se ven reflejados» (asaltantes), qué papel tiene la vela/sombra («reject the path that duplicates your candle»), movimiento (flechas o toques), fallos, escalera de pistas `s26-*` (dificultad 5: calibración fina).
  4. ❓ **El reflejo de espaldas de Pope-E**: cuándo y dónde aparece, qué hace, qué dice (si dice algo); pistas del canon que debe cargar (sello de ceniza invertido, pluma dorada, «the key»…); debe registrar `EclipseNotebook.clue('reflection')`.
  5. ❓ Wire 57–60; pausa; sello (si se reimprime); cama sonora; reliquia/SVG Fragmento VII; `PAGES.s26`; smoke `mirrors`; accesibilidad (laberinto con teclado/táctil ya requerido).
  6. ⚠️ El texto impreso dice «Western gate» pero el plano pone la puerta a la izquierda (oeste, correcto) y la salida a la derecha; el Wire/web deben respetar esa orientación.
  7. 24B impresa: Aurelia (1970) afirma que **Pope-E quemó las cuerdas sobre el escenario y llenó de humo las salas inferiores en 1970** y que «no pudo cruzar este umbral»; Hermes (1998) pide a Silvia «Do not look for your own face in the mirror» y «You already hold seven pieces. Only the light and the stage remain.» Ver conflicto Pope-E en §3.
- **Dependencias**: S25 + pausa. Desbloquea S27.
- **Fuentes**: SPB:115,136,155,200; BSP:2069-2224, 2561; `journal/page24/mockups/page24_front_real_paper_mockup.jpg`; IB:154-161.

### Estación 27 · The Kaleidoscope Lantern — ⏳
- **Camino/Torre**: nodo 47 · flag `order_kaleidoscope_lantern_completed`.
- **Hoja**: **25A «The Kaleidoscope Lantern»** (cara A, juego, BSP:2226) y **25B «The Terrace Under the Stars»** (cara B, cuaderno de Aurelia III, BSP:2296, ilustración a sangre con banderola).
- **Decidido**
  - Premio: **Fragmento VIII**; **ya NO da letra del Ledger** (la X pasó a S10; SPB:119; SPB:116 «VIII · ecuación X» es obsoleto). Ficha SPB:137: **girar y alinear cristales para que la luz deletree**, vista/color, dificultad **2**, acaba **palabra tecleada** («y la ecuación de X» ⚠️ obsoleto).
  - Pope-E: **nota 3**, «justo antes del final» (SPB:211). **Carta III de Aurelia** (agosto de 1971, «la terraza») al ganar S27 (`aurelia-letters.js:53-62`, `room: 7`): menciona «three short, a pause, two long», el código del disco.
  - Pausa: `HOURS[47]=null`; sello `25A` en JSON (`LNNNSNRP`), no impreso.
- **Qué dice el papel (25A)**: linterna octogonal colgada del zénit de la cúpula (a «treinta pasos» sobre el escenario) con prismas de cuarzo, contrapesos, ocho lados; página con diagramas de prismas/rayos y rótulos en italiano deformados. Regla impresa: «Turn the outer brass ring until the refracted rays converge upon the passage dial; the spectrum marks the pathway to the high terrace.» Nota de **Aurelia (1970)**: «When **Pope-E** set fire to the rigging below… I turned the prism vernier to **the northern angle**, casting a beam of amber light through the high archway… Then I dropped the iron pin into the gear train so no stranger could turn the glass.» **Hermes (1998)**: el pasador seguía en los dientes del tambor («twenty-eight years of mountain dust»); «When you solve the alignment in the lantern, the lock will release and the door to the northern terrace will swing open»; «We are one step from the final stage.» No se imprimió ninguna palabra ni letra.
- **Lo que FALTA**
  1. ❓ **La palabra que la luz deletrea** (y por tanto la solución): NO DEFINIDA. El papel solo da «northern angle», anillo exterior de latón y «passage dial».
  2. ❓ Mecánica de «girar y alinear cristales», dial, ángulo norte numérico, cómo se «deletrea» con luz de color; escalera `s27-*`.
  3. ❓ **Texto y ubicación de la nota 3 de Pope-E** (qué dice, cómo cierra el arco antes del final); `clue('note3')`.
  4. ❓ Qué es exactamente «la terraza norte» y su relación con 25B (la banderola de Aurelia en 25B habla en presente de «torches climbing toward the ice with our Astrolabe» y «the mountain is ours»: ver §3).
  5. ❓ Wire 61–64, ceremonia/capítulo (la serie termina de decidirse al llegar a S28), pausa, sonido, reliquia SVG Fragmento VIII, `PAGES.s27`, smoke.
  6. ⚠️ SPB:116 y SPB:137 mantienen «ecuación X»: no debe construirse (X = 15 dada en S10).
- **Dependencias**: S26 + pausa. Desbloquea S28.
- **Fuentes**: SPB:116,119,137,211; BSP:2226-2403; `journal/page25/mockups/page25_front_real_paper_mockup.jpg`; aurelia-letters.js:53-62.

### Estación 28 · The Stage of the Mirror Speaker — ⏳ (el espejo final del mapa sí está)
- **Camino/Torre**: nodo 48 · flag `order_mirror_stage_completed`.
- **Hoja**: **26A «The Stage of the Mirror Speaker»** (cara A, BSP:2405) y **26B «Back to the Peaks»** (cara B, BSP:2495).
- **Decidido**
  - Premio: **Fragmento IX + el WHERE: Viena · Wiener Staatsoper** (SPB:11, SPB:117). Ficha SPB:138: **encajar los nueve fragmentos en el marco**, vista, dificultad 3 («final ceremonial, no examen»), acaba «el espejo completo muestra el WHERE (sin teclear)».
  - En el Espejo Vivo (mapa del Path III): cuando hay 9 fragmentos, **el caleidoscopio se detiene y el cartucho muestra «WIENER STAATSOPER · VIENNA»**, escrito invertido en el JS: `REPOSTAATS RENEIW` en `stage-mirror.js:34` (`REFLECTED = 'ANNEIV · REPOSTAATS RENEIW'`, se revierte con `reflectedName()`); el smoke (`web_smoke.py:1525`) lo comprueba. El flag de S28 es el 9.º.
  - Narrativa SPB:45: Silvia encaja los nueve, el espejo refleja la fachada de la Ópera; **Pope-E y los suyos huyen con el Astrolabio hacia las cumbres**; todo converge en Torre I y Bóveda. El Astrolabio sigue robado (SPB:19).
  - Pausa `HOURS[48]=null`; sello `26A` (`BHYZFDKG`) no impreso.
- **Qué dice el papel (26A, que Silvia ya tiene desde el Wire 33)**: marco veneciano con ocho fragmentos y **dibujo de la fachada de la Ópera ya visible dentro del espejo agrietado**, cinco arcos de la logia (el texto pide contarlos). Texto: «Gather the marks from the margins of Sheets 19 to 26. In order, they reveal the words of the ceremony… let the restored reflection speak its name when the ninth piece is laid in the frame.» «Liturgy of the Mirror Speaker»: «You did not seek an echo, Silvia; you sought an awakening… across five hundred leagues of mountain and river, the grand hall of the imperial capital awaits, where the stone dances and the strings are tuned to your arrival. Walk into the snow with an untroubled heart.» Datos: «Zenith Latitude 48° 12′ 12″ N · Imperial Meridian 16° 22′ 08″ E · True Bearing 354° North through the Alpine Pass · Elevation 171 m» (Hermes: «From the proscenium of Tower III, the sighting line passes directly over the high shoulder of Tower I… At first light, we pack the instruments and ride toward the snow.»), firmado «H. & A.».
- **Lo que FALTA**
  1. ❓ **La ceremonia entera**: qué hace Silvia al «encajar» (orden de los fragmentos, gesto), qué dice la Mirror Speaker (se refleja, nunca se ve), cómo se cierra con la fachada y el nombre; y qué hace con **«the marks from the margins of Sheets 19 to 26»**: **no se imprimió ninguna marca en los márgenes** (SPB:90), así que la ceremonia **no puede depender de ellas** (IB #8 y SPB:156-162 lo diseñaban como truco meta; ya no es posible sin reimprimir las 8 hojas). Decisión pendiente: sustituir por algo ya existente (p. ej. las inscripciones de los propios fragmentos, los fragmentos como dibujo de cada cara, el orden de las salas) o reimprimir.
  2. ❓ Ritmo: cuándo se abre S28 (pausa tras S27), cómo cierra el Wire 65–68 (balance + paso al viaje a la Torre I), qué dice Hermes sobre la Ópera, **cómo se enlazan** las coordenadas impresas (el WHERE ya es deducible en papel) con la revelación web.
  3. ❓ La escena de fuga de Pope-E con el Astrolabio (¿se ve? ¿mensaje interceptado? ¿reflejo?) — no definida.
  4. ❓ Ceremonia de capítulo de cierre del Stage Path (`wire-ceremony.js`) y apertura del capítulo de Torre I; `WIRE_CHAPTER_CARDS` índice 4+; telemetría `WIRE_FINAL_TELEMETRY` con «WHERE: …» (cuidado con spoilers: el WHERE no debe estar en claro antes).
  5. ❓ Sonido, reliquia/SVG Fragmento IX, `PAGES.s28`, `Previously.s28`, smoke `mirrorstage`, accesibilidad.
  6. ⚠️ **El WHERE ya está prácticamente en papel desde el primer día del Stage Path** (26A dibuja la Ópera con sus 5 arcos y da 48°12′N 16°22′E «imperial capital»; las ocho hojas llegan juntas, Wire 33). La invariante «nunca en claro antes de la Estación 28» (SPB:11, HO:51, IB:36) ya está rota en papel; la web debe preservar solo la **confirmación por nombre** («Wiener Staatsoper · Vienna») para la S28. [INFERENCIA] Sugiero decidirlo explícitamente en la guía.
  7. ⚠️ SPB:155/IB #8 prometen un truco de márgenes que el papel no tiene (ver 1). Hay que reescribir §6.2 de SPB.
- **Dependencias**: S27 resuelta + pausa. Desbloquea: el viaje a la Torre I (§4).
- **Fuentes**: SPB:11,45,100,117,138,156-162; `stage-mirror.js:20-34`; `web_smoke.py:1525`; BSP:2405-2492; `journal/page26/mockups/page26_front_real_paper_mockup.jpg`.

---

## 3. POPE-E, AURELIA, LA MIRROR SPEAKER Y EL ESPEJO VIVO

### 3.1 Pope-E (canon secreto: es Carles)
- **Canon [DOC SPB:188-200, CAN:1011]**: Pope-E, jefe enmascarado (máscara de plata ennegrecida) de los BC Ashes (secta anterior a Cristo, guardiana del «primer fuego»), **es Carles disfrazado**. Se revela en la Torre I. Robó el Astrolabio porque el tesoro es Silvia (mensaje oculto del Email 1: «YOU WERE NEVER ONLY THE SEEKER YOU WERE ALWAYS THE TREASURE»). Nunca hace daño. La llama siempre **«the key»**, nunca «the seeker». Canales: tres notas con sello de ceniza (círculo cruzado por una línea), reflejo de espaldas en S26, mensajes que interceptan el Field Wire.
- **Las 5 pistas sutiles (SPB:194-199)**: 1) sello de ceniza = ◐ al revés; 2) cita «You were never only the seeker»; 3) pluma dorada (como la reliquia *Gilded Feather* del principio); 4) nunca hace daño; 5) «the key».
- **Pistas ya plantadas en código (✅)**
  | Pista | Dónde | Detalle |
  |---|---|---|
  | `note1` | Wire paso 35 (WSS:117,126; `HC:7466` `EclipseNotebook.clue('note1')`) | «Let her through.» Papel con olor a humo, sello de ceniza. Hermes: «He has written about you… either a fool or a step ahead» |
  | `feather` | `stage-mirror.js:223-226` | Con el Fragmento I, una pluma dorada pequeña (`.sm-feather`) junto al marco del Espejo Vivo; sin texto |
  | `intercept` | `HC:7437,7438-7455`, tras el paso 36 | «…kssh… tell the old man to hold the lamp lower… the key reads by it… kssh… the stair past the dressing rooms is rotten, she must keep to the wall… kssh… no harm comes to her in this tower. Not while I…» con tag «STATIC ON THE LINE · UNKNOWN SENDER» y sello ⊖. Hermes no lo comenta |
  | Ask Hermes | `inq-ash-note` (HC:5748) | «Who left the note sealed with ash?» |
  Fechas guardadas en `order_ashes_clues` (JSON `{pista: ms}`) por `EclipseNotebook.clue(id)` (`field-journal.js:232-247`). Reiniciar S20 en el tester la borra (HC:810).
- **Pistas PREVISTAS aún por plantar (⏳)**: `note2` (S23, cita «You were never only the seeker»), `reflection` (S26), `note3` (S27), **revelación en retrospectiva en la Torre I**: escena del Wire en la que Hermes enlaza cada pista con su momento (queda en Ask Hermes) **y** página especial del cuaderno de Hermes (Chronicles) con cada pista y la fecha real en que Silvia la vio. (SPB:204-214, IB #10.) Nada de esto existe aún.
- **YA IMPRESO en papel (no editable) que toca a Pope-E**
  - **22B «The Ashes Before Christ»**: «'BC' … stands for Before Christ… a brotherhood far older than our Order, custodians of a primordial flame»; su líder enmascarado firma con «a seal of soot: a circle cut in two by an iron stroke»; «Hermes found their camp empty at dawn. In the cold embers lay **a single golden feather**»; **nota pinchada** (cita): «Do not mistake our fire for pity, traveler. We kindle the braziers ahead not to guide you, but to test if you can endure our smoke. The dark would have taken you before thirty paces. Gather the nine shards of the living glass: the fourth door yields to no one but the key.»; sello de ceniza dibujado; **nota de Hermes: «Pope-E knew Silvia was following our steps. Why does our pursuer call her the key?»** → la hoja 22B **nombra a Pope-E, la pluma dorada, la nota con «the key» y la pregunta de Hermes**, es decir, ya imprime pistas 3 y 5 y el nombre.
  - **24B**: Aurelia (1970): «Pope-E burned the ropes above the stage and filled the lower halls with smoke, but he could not cross this threshold… By the time the Ashes reach this room, our steps will already be high in the mountains.»
  - **25A**: Aurelia (1970): «When Pope-E set fire to the rigging below…».
  - **25B**: banderola de Aurelia: «Look down at the gorge, Hermes. The torches are climbing toward the ice with our Astrolabe. Sleep well tonight. At the first light of dawn, the mountain is ours.»
- **⚠️ CONFLICTO (el ya detectado)**: SPB:88 (§4.1) y SPB:190-200 (§9): Pope-E = Carles, aparece solo en 2026 y nada visible lo nombra antes de la Torre I; el papel impreso lo sitúa **en 1970** quemando las cuerdas del teatro y ya **nombrado** con «the key» en 22B. SPB:88 dice «la web no lo contradice ni lo explica». **Opciones [INFERENCIA, para decidir por el Operador]**: (a) **Pope-E es un título/máscara hereditaria** de la secta (el Pope-E de 1970 fue otro; Carles porta hoy el título y la máscara) — compatible con 24B/25A y con la revelación; (b) Pope-E 1970 = antecesor y Carles «hereda» el apodo; (c) reinterpretar el nombre de las notas como «lo que Aurelia llama» al líder de turno. Hasta decidir, S23–S28 y la Torre I no deben afirmar ni negar nada. Además la nota 1 del Wire (35) y la hoja 22B se solapan (los dos «Let her through» / «the key»): la 22B hace redundante la pista «the key» para el Operador (Hermes ya la pregunta en papel).
- **Otro choque menor**: SPB:206-212 reparte «nota 1 (S20), pluma y mensaje tras S20, nota 2 (S23), reflejo (S26), nota 3 (S27)» pero **22B (S24) ya trae una nota y una pluma**, así que cuenta como pista adicional no listada; y HO:39 dice «notas 2 y 3 (Estaciones 22/26 aprox.)» (obsoleto).

### 3.2 Aurelia: cartas y cuadernos
- **Estado**: Aurelia ES la Oráculo desde S19 (canon visible, SPB:31). Su memoria vuelve por partes; **el puente (1971) se guarda para la Torre I**. Viaja con Hermes en el Stage Path; en el Wire es personaje que dibuja, tararea («the tune with no words»), recuerda olor a lapislázuli y cedro (wire-script-marches leg 34).
- **Cuadernos (caras impresas)**: 21A «The Alpine Memories» (Aurelia: la cúpula de latón girando, edelweiss prensada «on the twenty-third day of September»; Hermes: «She is beginning to remember the way back. The road to the peaks is still open.»); 23B «The Disc and the Vow»; 25B «The Terrace Under the Stars». Los títulos impresos no coinciden con los provisionales de SPB:59-68 («Aurelia's Sketchbook I/II/III»).
- **Cartas en Chronicles (✅ código, `aurelia-letters.js`)**: sección «Aurelia's Letters», oculta hasta `order_oracle_horizon_completed`; estado `order_aurelia_letters = {I:{at,step}}`; lacre que se rompe; Hermes comenta en el Wire en el paso donde las abre (`notesAt`).
  | Carta | Fecha | Se desbloquea al ganar | Contenido |
  |---|---|---|---|
  | I | The Alpine Observatory · March 1970 | **S22** (✅ alcanzable) | «You fell asleep over your tables…», lapislázuli, «I am happy here, in the cold, beside your lamp.» Dibujo: cúpula |
  | II | December 1970 | **S25** (⏳) | Los 24 astros de latón; «You said I was always the treasure…»; dibujo: disco |
  | III | August 1971 | **S27** (⏳) | Terraza, «three short, a pause, two long. Answer me.»; dibujo: terraza con estrella |
  Ninguna habla del puente. Las cartas II y III existen en el código pero no se pueden alcanzar hasta construir S25/S27.
- **Pendiente**: la memoria del puente y su escena (Torre I), qué dice Aurelia en la Bóveda (borrador IB #13), si Aurelia «encuentra» más cartas.

### 3.3 La Mirror Speaker
- **Canon**: guardiana de la Torre III; **nunca se ve, solo se refleja** (Hermes ve su reflejo en cristal; nunca ella). Firma con **una línea horizontal**. Voz elegante, pausada y ceremonial; frases breves. Palabras clave: luz, umbral, reflejo, lo que se ve cuando dejas de buscar (`docs/PATHS_AND_CHARACTERS.md`). Vestido gris en el Wire 35/37/41. NUNCA hablar de «teatro/ballet» en sus diálogos (`PROJECT_MASTER.md:69,144`).
- **Reflexión de estilo (✅ `mirror-speaker.js`, IB #11)**: al abrir cada sala escribe, en escritura de espejo (`scaleX(-1)`, tap para girar 6 s), hasta 4 frases fijas: HORA («You came with the first light / under the full sun / as the lamps were lit / by candlelight.»), ESFUERZO («You saw it before it was shown.» / «The glass tested you hard. You did not break.» / «You let the old man hold the lamp…» / «You stumbled, and did not ask…»), RITMO («And swiftly.» < 20 min; «You let it rest a night. That was wise.» > 12 h) y TONO (warm: «Bring that warmth inside.»; protective; tactical; analytic), o `UNSEEN` si no hay página de cuaderno. Se guarda en `order_speaker_line_<nodo>` (no cambia). Se pinta con `EclipseMirrorSpeaker.render(nodo, elemento)` (regla para construir S23–S28). Smoke `speaker`.
- **Pendiente**: su despedida final en espejo (IB #13: una frase por tono), su aparición/representación en S28 (la ceremonia), su firma en 24B y en la Liturgy de 26A ya impresas.

### 3.4 Mapa: El Espejo Roto Vivo + Caleidoscopio (✅ `web/assets/js/stage-mirror.js`, `stage-mirror-data.js`, `living-mirror.css`)
- Gran espejo veneciano roto en 9 fragmentos (geometría generada por `scripts/journal/stage_mirror.py`); huecos oscuros con caleidoscopio que gira con dedo/ratón/flechas y respeta `prefers-reduced-motion`; cada fragmento es un botón de su estación; fragmentos ganados con destello (`order_stage_mirror_seen`); reflejo de un escenario con la silueta de Hermes y trozo de fachada; con 9 fragmentos el caleidoscopio se detiene y se lee el cartucho con el nombre de la Ópera (invertido en el fuente). Pluma dorada con el Fragmento I. Línea de la Mirror Speaker bajo el título. Fragmentos por ahora vistos: I «una luna», II «una ventanita con una vela», III «un arco y el borde de un balcón» (Wire 36/40/44). Fragmentos IV–IX sin descripción de contenido salvo la fachada común.
- Pestaña del Path III solo tras S19 (`switchMapPath('stage')`).

---

## 4. TORRE I (REGRESO), ALINEACIÓN DE LAS TRES TORRES, BÓVEDA Y REGALO

### 4.1 Qué está definido [DOC]
- **Torre I (The Alpine Observatory)**, cumbres nevadas del norte, Constellation Path, Hermes (Cartógrafo). Custodia la geometría celeste, los acordes estelares y el Astrolabio maestro (CAN:30). Dañada en 1971 (seísmo + incendio) y reconstruida; asaltada en 2026 (Estación 04); el Astrolabio robado.
- **Las Tres Torres y las tres pistas** (CAN §8.B líneas ~796-828): Torre II → **WHEN** (**18–20 de diciembre**, sin hora, decisión 11-2026; ver conflicto) ✅ entregado en S19; Torre III → **WHERE** (Viena · Wiener Staatsoper) ⏳ en S28; **Torre I → WHAT** (la velada de ballet / las 2 entradas físicas) ⏳, «3ª Gran Pista y Revelación Final».
- **La Bóveda (The Vault of the Grand Eclipse, «La Cuarta Cámara Prohibida»)**: cámara sellada por los fundadores en el punto geodésico de convergencia de las tres torres; solo se abre si un buscador predestinado **alinea simultáneamente las Tres Torres con The Astrolabe of Distant Light** (CAN:34; user-preferences §8). Contiene **el cofre físico con las entradas reales** (CAN §8.B.4; IB #13: «la Bóveda abre el cofre físico con las entradas»). Los asaltantes buscan la Cuarta Cámara (22B, WSS).
- **Preferencias del Operador** (`.agents/rules/user-preferences.md:68-86`): el Astrolabio físico está robado y solo mide nativamente 6 estrellas (Ald, Pol, Veg, Alt, Den, Arc); los juegos del diario simulan el resto; al recuperar el Astrolabio, traducir el alfabeto secreto completo y alinear con **los tres vectores** de las torres, se revela el cuarto lugar.
- **Estado del Astrolabio**: sigue robado; los Ashes escapan con él hacia la Torre I (SPB:19,45). 22 estrellas guía (CAN:78).
- **El diario (hoja 26B «Back to the Peaks»)** [verificado en maqueta + BSP:2495]: «The Stage Path is finished. The restored glass has spoken, casting its true reflection northward across five hundred leagues to the imperial palace of music. Yet our journey cannot rest while the Astrolabe remains lost to the ashes. At first light we pack the sighting instruments, strap the brass cases to the mules, and step out from the underground proscenium into the sharp alpine dawn. Aurelia has released the white dove toward the crags of Tower I to announce our ascent. Ahead lies the Chasm Pass, where the ancient road climbs to the secret convergence of the Three Towers.» Mapa grabado de las tres torres: **Tower I · The Alpine Observatory · Summit 3,420 m · The Chasm Pass Trail** (arriba); **Tower II · Sandstone Sanctuary · The Desert Path · Solar Meridian** (abajo izq.); **Tower III · The Stage Tower · Departure Bearing 354° North** (abajo der.); distancias «240 Leagues · Western Ridge» (II–I), «210 Leagues · Bearing 354° N» (III–I), «180 Leagues · The Great Rift» (II–III); un **astrolabio dibujado en el centro** y «**THE VAULT OF THE GRAND ECLIPSE · Locus Convergentiae · The Secret Chamber**» en el centro del triángulo. Pie: «Bearings: 354° North from Tower III through the Chasm Pass toward Tower I and the Vault. – H. & A.»
- **Final distinto según estilo de juego (IB #13, ✅ perfil / ⏳ escenas)**: lo que NO cambia es el regalo; cambian 4 piezas: despedida de Hermes (última transmisión del Wire), constelación personal («The Hearth», «The Shield», «The Arrow», «The Scale»), una línea final de Aurelia y otra de la Mirror Speaker (en espejo), y **el desenmascaramiento de Pope-E**. 4 variantes por tono dominante (cálida/protectora/táctica/analítica), con señales (cifras del viaje, nombre dado a Hermes en el paso 1, objeto del paso 2) y marcadores `{name} {item} {days} {rooms} {notes} {hour}`. Los textos completos están como **borradores** en IB:233-239; la frase del Email 1 cierra las 4 variantes del desenmascaramiento («You were never only the seeker, you were always the treasure»). **Parte física**: una **carta a mano de Carles** para el cofre; antes de la Bóveda Claude lee el progreso de Silvia en Supabase y saca el mismo perfil (`scripts/audit/journey_report.py`, `web/hub/js/journey-profile.js`, ✅).
- **Regla del código**: «el desenmascaramiento y la Bóveda no entran en `web/` hasta que se construya la Torre I» (IB:231): el código del Hub es legible y no debe adelantar ni a Pope-E ni el WHAT.

### 4.2 El WHERE / WHAT / WHEN
| Pista | Torre | Qué está definido | Qué NO está definido |
|---|---|---|---|
| **WHEN** | II (S19, ✅) | Web: sigilo `OVERTURE`; disco de 24 avistamientos que lee `DECEMBER EIGHTEEN TO TWENTY` (`s19-oracle-horizon.js:42`). Canon: «18–20 de diciembre, sin hora». El brief de la guía dice **18-dic-2026** | ⚠️ Cuál es el día/hora exactos de la función dentro del 18–20 (el WHEN impreso en 18A pide reimpresión «the day and season»). `TIMELINE.md:25,38` aún dice «Día final TBD» |
| **WHERE** | III (S28) | **Viena · Wiener Staatsoper**; coordenadas 48°12′12″ N 16°22′08″ E, 171 m, «imperial capital»/«imperial palace of music», 5 arcos de la logia (impreso en 26A); reveal en el mapa del Espejo Vivo ya construido | La ceremonia de la S28, el momento y la forma exacta de la confirmación; que el papel ya lo da por deducible (⚠️ §2) |
| **WHAT** | I (Bóveda) | 2 entradas físicas de ballet para Silvia y Carles; cofre físico; mensaje de Carles (carta a mano) | **Qué obra/ballet, compañía, fecha y hora exactas de la función, butacas/asientos, quién guarda el cofre y dónde está físicamente, cómo y cuándo se entrega.** No hay ninguna obra nombrada en todo el repo (grep de títulos de ballet clásicos: 0 resultados). `PROJECT_MASTER.md:15,53` y `docs/SESSION_LOG.md:12,126` dicen «obra/lugar/fecha por decidir (meta-juego)»; `PROJECT_MASTER.md:128` «Meta-cuestionario ballet (elegir obra sin spoilear)» sigue sin hacer |

### 4.3 Qué NO está definido de la Torre I / Bóveda / final (el grueso de lo que falta del juego) ❓
1. **Estructura jugable de la Torre I de regreso**: número de estaciones, juegos, hojas (no hay hoja 27; el diario termina con 26; SPB:14), nodos del Hub (no existen ids >48), pestaña/mapa («Path I» de regreso), pasos de Wire (≥ 69), capítulos y ceremonias, pausas, etc. **Todo sin diseñar.**
2. **El viaje desde la Torre III**: el Chasm Pass (marcha en tiempo real: duración no fijada), eventos del camino (el patrón de marchas con eventos aleatorios ya existe y se puede reutilizar), paloma de Aurelia.
3. **La Torre I reconstruida/asaltada**: estado en que la encuentran, qué hay en ella, qué retos hay (el mapa 26B solo la sitúa a 3.420 m).
4. **La memoria del puente de Aurelia (1971)** y la escena en que vuelve («volverá desde abajo, en las cumbres»; CAN §12): ni texto ni mecánica.
5. **El desenmascaramiento de Pope-E** (escena del Wire + página del cuaderno de Hermes con las fechas reales de cada pista) y **cómo se resuelve el choque con las notas impresas de 1970** (§3.1).
6. **La alineación de las Tres Torres con el Astrolabio**: mecánica completa NO DEFINIDA (qué son «los tres vectores», cómo se usan el WHEN/WHERE/WHAT y el Ledger completo, qué se «alinea» en pantalla; existe un concepto antiguo en `docs/lore_and_puzzle_bible.md:185-194` «Fase D» — Ledger completo + profecía inicial dan «coordenadas exactas y butaca/clave de las entradas» — no reflejado en ninguna Biblia nueva: estado incierto). Cómo recupera Silvia el Astrolabio de Pope-E (¿es Carles quien se lo entrega?); si el Astrolabio físico existe como objeto real.
7. **The Vault of the Grand Eclipse**: aspecto, apertura, cofre físico, quién/dónde/cuándo se abre en la vida real (¿mismo día que el WHEN?), relación con la fecha 18–20 de diciembre y con el tiempo de la historia (la web llega a la Torre I en noviembre).
8. **El WHAT**: obra de ballet y su forma de revelarse; si se mantiene la idea del meta-juego/cuestionario para elegirla; el contenido del cofre más allá de las entradas.
9. **El final por estilo de juego**: implementar las escenas (Hermes, constelación personal, Aurelia, Mirror Speaker, desenmascaramiento) a partir de los borradores y de `journey-profile.js`; la carta a mano de Carles.
10. **Hoja de la Orden final**: **no existe** ninguna hoja 27 ni «hoja de la Orden final» en el repo (`journal/` termina en `page26`; `journal/impresion/` = diario 36 páginas + Stage 19–26; no hay ningún email/dispatch final redactado en `emails/`; `emails/stage/README.md` y `puzzles/stage/README.md`, `web/stage/README.md` son stubs sin contenido). Si el Operador quiere un cierre físico (carta/hoja/email final de la Orden), está ❓ sin diseñar.
11. **Perfil de juego y informe previo** ✅ (`journey_report.py`) para escribir la carta; falta decidir cuándo y cómo se lee.

---

## 5. ESTADO REAL DEL BACKLOG DE IDEAS (`docs/IDEAS_BACKLOG.md`)

| # | Resumen | Estado real (verificado) | Dónde |
|:-:|---|---|---|
| 1 | «Previously on…» al volver tras ≥12 h | ✅ hecha | `web/hub/js/previously.js` (frases por juego hasta s22: líneas 31-33), `previously.css`, smoke `previously`; IB:61-77 |
| 2 | Diario de campo automático (cuaderno de Hermes) | ✅ hecha (páginas para s20–s22; faltan s23–s28) | `web/hub/js/field-journal.js` (PAGES), `field-journal.css`; clave `order_journal` |
| 3 | Momentos de pausa tras cada fragmento | 🟡 mecanismo ✅; horas solo S21=3 h, S22=6 h; S23–S28 `null` | `web/hub/js/stage-pause.js:10`; IB:94 |
| 4 | Sonido ambiental por estación | 🟡 ✅ mecanismo y camas S20 «theatre gate», S21 «dark room», S22 «stone gallery»; faltan camas S23–S28 | `web/hub/js/ambience.js:63-65` (`BEDS`), `ambience.css` |
| 5 | Háptica en móvil | ❌ descartada (iPhone/iPad no soportan vibración web) | IB:124 |
| 6 | Pistas progresivas en 3 niveles | 🟡 ✅ Cairn I + S10–S22 (24 puzzles: añadir `s21-city`, `s22-focus`, `s22-echo`); S23–S28 deben nacer con ella | `web/hub/js/hint-ladder.js`; IB:127-145 |
| 7 | Variedad de mecánicas S21–S28 | 🟡 especificada (ficha SPB §6.1); cumplida en S21–S22, pendiente S23–S28 | SPB:124-146 |
| 8 | Puzzle «meta» con las hojas físicas | ⏳ especificada, **nada construido**; **marcas de márgenes imposibles** (no impresas); trasluz (23A/23B) y doblez (24A) soportados por el papel pero sin web ni prueba física | SPB:148-162; IB:154-161 |
| 9 | Modo «ojo de Operador» → informe de Claude | ✅ hecha sin panel (Claude lee Supabase `aoochekcbugawaurllco`) | IB:163-173; memoria `reference_supabase-cloud-save` |
| 10 | Pistas sutiles de Pope-E en retrospectiva | 🟡 parte construible hecha (nota 1, pluma dorada, mensaje interceptado); `note2`, `reflection`, `note3` y revelación en Torre I ⏳; ⚠️ choque con 22B/24B/25A/25B | `stage-mirror.js:223`, `hub-core.js:7437`, `field-journal.js:232`; SPB:202-214 |
| 11 | Mirror Speaker reactiva | ✅ hecha | `web/hub/js/mirror-speaker.js` |
| 12 | Cartas de Aurelia desbloqueables | ✅ hecha (carta I alcanzable; II y III esperan S25/S27) | `web/hub/js/aurelia-letters.js`, `aurelia-letters.css` |
| 13 | Final distinto según el estilo de juego | 🟡 perfil ✅ (`journey-profile.js`, `journey_report.py`); escenas/textos ⏳ borrador (4 tonos × 5 piezas) | IB:217-243 |
| 14 | QR/palabra clave por hoja (sellos) | 🟡 mecanismo ✅; **hash pegado solo `SEALS[41]`** (20A); 20B sin sello; 23A impresa con QR pero `SEALS[45]=null`; 21B/22A/24A/25A/26A sin QR impreso aunque hay códigos en `stage_seals.json`; ⚠️ SPB:164 dice «cada cara de juego 20–26 lleva sello» | `scripts/journal/sheet_seal.py`, `journal/stage_seals.json`, `sheet-seals.js:10` |
| 15 | Verificador de hojas | ✅ hecha | `scripts/journal/verify_sheets.py`; corre dentro de `build_stage_path.py` |
| 16 | Vista previa de impresión de las 8 hojas | ✅ hecha | `scripts/journal/stage_preview.py` → `journal/impresion/02_STAGE_PATH_VISTA_PREVIA_A4.pdf` |
| 17 | Dividir `index.html` | ✅ hecha | `web/hub/css`, `web/hub/js` (IB:297-315) |
| 18 | Smoke más rápido | ✅ hecha (`--jobs`, `--quick`, `--only`) | `scripts/audit/web_smoke.py` |
| 19 | Guardado automático en la nube | ✅ hecha y desplegada | `web/hub/js/cloud-save.js`, `cloud-config.js`, `supabase/migrations/` |
| 20 | Accesibilidad | ✅ hecha | `web/hub/js/a11y.js`, `web/hub/css/a11y.css`; smoke `a11y` |
| 21 | PWA offline | ✅ hecha | `web/sw.js`, `web/hub/js/offline.js`; `scripts/web/offline_list.py` (correr antes de cada deploy) |
| 22 | Registro de juego | ✅ hecho con #19 | `eclipse_events` |

---

## 6. CONFLICTOS, HUECOS Y TRANSVERSALES

### (a) LISTA DE CONFLICTOS

| Tema | Fuente A | Fuente B | Cuál parece vigente y por qué |
|---|---|---|---|
| **Pope-E en 1970** vs «solo 2026, nada visible antes de la Torre I» | SPB:88, SPB:190-200 (Pope-E = Carles, aparece en 2026) | Papel impreso: 22B («Pope-E knew Silvia was following our steps… the key»), 24B (Aurelia 1970 «Pope-E burned the ropes»), 25A (Aurelia 1970 «When Pope-E set fire to the rigging») [BSP:1830-1920, 2136-2224, 2226-2300] | Lo impreso es inmutable (SPB:76) → hay que reinterpretar Pope-E (título/máscara hereditaria, §3.1). Pendiente decisión del Operador |
| Q: ecuación en S24 | SPB:113,118-119; HO:33,45 («Q = 14, Estación 24») | CAN §7.B.16 (Q en S11 desde 25-10-2026); memoria `project_ledger-letters-q-z` | CAN/memoria. S24 sin letra libre |
| X: ecuación en S27 | SPB:116,137 («VIII · ecuación X») | CAN §7.B.14 (X en S10); SPB:119, HO:36 («X = 15 ya la da la Estación 10») | S10. S27 no da letra |
| Sello de 20B | SPB:232,240; IB #14 («20B lleva sello, hash en `SEALS[42]`») | SPB:82; `sheet-seals.js:10` (`SEALS[42]=null`); BSP:1348-1424 (20B no dibuja sello) | Código y papel: 20B **sin sello** |
| «Cada cara de juego 20–26 lleva un sello» | SPB:164; IB #14 | Papel: solo 20A y 23A tienen QR impreso; 21B, 22A, 24A, 25A, 26A no | El papel (inmutable); `stage_seals.json` tiene códigos sin uso |
| Mentirosas/verdaderas de 19B | SPB:257 («mentirosas = SILVER; M S A I L O T V H E R U») | SPB:80; `s20:34-37` (verdaderas = SILVER, mentirosas = GOLDEN, 12 letras S G I O L L V D E E N R) | Código y SPB §4.1 |
| Guía de «Missing Halves» | SPB:258 («tras 3 intentos») | s20 (`guideShown = level>=2` → 6 fallos o 20 min) | Código |
| Campanas de S22 | 20B impresa: «five bronze bells» (dibujo de 4) | código: 5 campanas, melodía de 6 notas; 21B impresa: 6 campanas C–A | Código para S22; la S23 usa otras 6 campanas |
| Títulos impresos de las caras de historia | SPB:59-68 («Aurelia's Sketchbook I/II/III») | Impresos: «The Alpine Memories» (21A), «The Disc and the Vow» (23B), «The Terrace Under the Stars» (25B) (SPB:76) | Impresos |
| Marcas de márgenes para S28 | SPB:156-162, IB #8 (pequeñas marcas en 19–26) | SPB:90: «no se imprimió ninguna marca»; 26A las pide | Papel: no existen; hay que rediseñar |
| Disco de 23B vs disco de S19 | 23B: bronce «cast», 24 radios, 3 aberturas, «autumn of 1970» | CAN §2.B, S19, carta II: disco grabado a mano por Hermes con 24 avistamientos, «December 1970» | ⚠️ sin resolver; decidir si es el mismo disco o un gemelo |
| WHEN | CAN §8.B y S19: «18–20 de diciembre, sin hora» | Brief de la guía: «WHEN = 18-dic-2026»; `TIMELINE.md`: «Día final TBD» | CAN/código; precisar en la guía qué día exacto |
| Nodos de Wire para nuevas salas | HO:44 («pasos del Wire, empezar en 37») | Código: ya hay pasos hasta el 44 | Código; nuevos pasos desde 45 |
| Pope-E notas 2 y 3 | HO:39 («Estaciones 22/26 aprox.») | SPB:210-211, IB #10 (S23 y S27) | SPB/IB |
| Pendiente HO (imprimir Hoja 20 / escanear sellos 20A y 20B) | HO:22; SPB:240,252 | SPB:76 (16 caras impresas y entregadas) | Caducado |
| Wire legado vs script | `hub-core.js:5032-5209` conserva textos antiguos de los pasos 33-44 | `wire-script-stage.js` los sobrescribe (`applyWireScript`, HC:5832) | El script manda; los textos del núcleo son código muerto y contienen detalles que contradicen (p. ej. 5 campanas) |
| Station numbering de 20B | Bible SPB:238 dice que tras el 40 «el chat espera pausa y sello» | `HOURS[42]=6` y sello 20B inexistente → solo pausa | Código |
| WHERE «nunca en claro antes de S28» | SPB:11, HO:51, IB:36 | 26A (impresa y en manos de Silvia desde Wire 33) dibuja la Ópera, 48°12′N 16°22′E y «5 arcos» | El papel ya lo hace deducible; la web debe cuidar solo el nombre |
| Variedad S22/S23 | Ficha SPB:141 (nunca dos seguidas con la misma interacción) | 21B impresa: «play the reflection upon the bells» (como S22) | ⚠️ pendiente de decidir (§2 S23) |
| 25B | Aurelia le dice «Look down at the gorge, Hermes. The torches are climbing toward the ice with our Astrolabe» | Canon: el Astrolabio robado en 2026 va hacia Torre I; Aurelia en 1971 no tenía Astrolabe robado | Ambiguo: texto en presente (2026) pero firmado como cuaderno de Aurelia (1970–71); pendiente aclarar si la 25B es una escena de 2026 |
| Geografía Torre III | 19A «tallado en el borde de la montaña, frente al abismo»; Wire 33 prólogo «plateau of wind… tower of glass»; SPB:29 «sin costa; se llega por tierra» | 26A/26B: «underground hall/proscenium», «alpine dawn» al salir; 25A «dome… thirty paces above» | Mantener «teatro-santuario subterráneo/excavado»; cuidar sin «costa» |

### (b) LISTA DE HUECOS (lo que falta definir o construir)
**Construir (estaciones)**: S23, S24, S25, S26, S27, S28 (juego, 3D/UX standard, Ask Hermes, escalera de pistas, cama sonora, pausas, sellos [solo 23A está impreso], cuaderno/Previously, reliquias SVG Fragmentos IV–IX, tester, smoke, accesibilidad), pasos 45–68 del Wire con ceremonias y cambios de capítulo.
**Decidir (preguntas al Operador en formato test)**: melodía y reglas de S23 (y cómo no repetir S22); masa del telón y modo sin reloj de S24 (¿línea de comprobación del Ledger?); palabra y guion del trasluz de S25 + reliquia; grafo exacto del laberinto de S26 + reflejo de Pope-E; palabra de S27 + nota 3; ceremonia y sustituto de las «marcas de márgenes» de S28; horas de pausa por sala; qué hacer con los sellos sin imprimir (reimprimir o dejarlos null); cómo resolver Pope-E 1970; si 23B es el mismo disco que S19.
**Torre I / Bóveda / final**: todo lo de §4.3 (estaciones, Wire, alineación, Bóveda, WHAT = obra de ballet, fecha exacta dentro de 18–20 dic, cofre físico, carta a mano de Carles, desenmascaramiento, memoria del puente, escenas por tono).
**Documentación a corregir**: SPB §6 (Q/X), §6.2 (marcas de márgenes), §9 (Pope-E 1970), §10 (sello 20B), §4.1 (añadir 22B); HO completo (caducado); SPB:257 (SILVER/GOLDEN); IB #14; `TIMELINE.md`/`PROJECT_MASTER.md` (WHERE/WHEN ya decididos); `web/stage/README.md`, `emails/stage/README.md`, `puzzles/stage/README.md` son stubs (sin contenido).

### (c) DATOS TRANSVERSALES
- **Canon de nombres**: The Gate of a Thousand Masks, The Camera Obscura, The Whispering Gallery, The Automaton Orchestra, The Fly Tower, The Shadow Theatre, The Hall of Mirrors, The Kaleidoscope Lantern, The Stage of the Mirror Speaker (títulos impresos en las hojas, SPB:76; en el texto al jugador se citan entre comillas curvas, nunca «Sheet 20A»). Prohibidos: Sunken, Coastal/Coast, Hermit, Stage Mistress; sin jerga astronómica (Azimuth, Mucro, Mater, Tympan, Stereographic). La Torre III: «The Stage Tower / The Mirror Sanctuary»; la ciudad: «the city of the third tower» (no inventar nombres propios).
- **Mapeo estación/nodo/hoja/fragmento/flag**: estación n → nodo n+20 (20→40 … 28→48); caras de juego: 19B, 20A, 20B, 21B, 22A, 23A, 24A, 25A, 26A; fragmentos I–IX; flags en `stage-mirror.js:20-30`.
- **Pausas** (tabla `HOURS`, claves = nodo de la sala que abre): 41 → 3 h (S21), 42 → 6 h (S22), 43–48 → `null`. Cuenta desde `order_journal[<id del juego anterior>].at`. SPB:145,183: «3–8 h» sugeridas. Carles las salta con `order_stage_pause_skipped_<nodo>`. Marcha previa a S20: 18 h.
- **Sellos**: `window.EclipseSheetSeals.SEALS` — `{41:'9682e2b4', 42..48:null}`; `FACE={41:'20A',42:'20B',43:'21B',44:'22A',45:'23A',46:'24A',47:'25A',48:'26A'}`; `TITLE` solo 41–43. QR → `https://the-eclipse-order.pages.dev/?seal=CÓDIGO` (IB #14). Orden de puertas: primero pausa, luego sello (HC:2006-2030).
- **Escalera de pistas**: nivel 1 = 3 fallos o 10 min, nivel 2 = 6 o 20, nivel 3 = 9 o 35 (tiempo activo); nunca la respuesta; nivel 2 activa la ayuda antigua; claves `order_hint_<id>_fails/_secs/_level` (IB:129-141).
- **Cipher Ledger en el Stage**: solo S22 da J (J=8, T=16). Regla 9: nunca valores; Regla 10: solo A–Z. S23–S28 sin letra nueva (si acaso, líneas de comprobación). 1 septiembre: letras ausentes B G J P Q X Z (memoria).
- **Fragmentos**: relics `mirror_fragment_1..3` (id, nombre «Fragment N of the Mirror · <sala>», categoría «Mirror Fragment»; HC:6401-6429); en el cuaderno y en la ceremonia de capítulo (`WIRE_CHAPTER_CARDS[3]`: Fragments I and II).
- **Capítulos del Wire**: Desert en 3 (I tormenta/sal/pozos 0–8, II Cinco Cairns 9–24, III Torre II/Oráculo 25–32), Stage en 2 (IV «The Mirror Sanctuary» 33–40, V «The Whispering Gallery» 41+) [decisión del Operador 15-nov-2026, HC:7038]; ceremonias en 25, 33, 41.
- **Estilo de Wire (memoria)**: mensajes cortos (≤6 beats por apertura, 1–2 «asks» de Silvia con respuestas distintas), tecleo ~130 cps con sonido de telégrafo, sin scroll interno; texto inglés novelado, sin dar la respuesta, sin datos de Pope-E/WHERE antes de tiempo; marchas con eventos aleatorios (leg 34 existe).
- **Hoja y papel**: Cara A sin tinta en X<165, Cara B sin tinta en X>1583, 75 px de pie libres, 40–80 px de separación texto–dibujo (`verify_sheets.py`); el doblez de 24A está en `FOLD_LINES`; cualquier reimpresión debe pasar por `python3 scripts/journal/build_stage_path.py` (genera `journal/impresion/01_STAGE_PATH_HOJAS_19_A_26_A5.pdf` y `02_…VISTA_PREVIA_A4.pdf`; maquetas JPG en `journal/page19..26/mockups/`).
- **Tiempo de la historia vs. realidad**: hoy 16-nov-2026; WHEN 18–20 dic 2026 (brief: 18-dic). La web debe llevar a Silvia al WHERE antes de esa fecha (SPB:184).
- **Verificación obligatoria al construir** (CLAUDE.md): `python3 scripts/audit/lint_lore_and_vocabulary.py`, `python3 scripts/journal/verify_sheets.py --sheets 19-26`, `python3 scripts/web/offline_list.py`, smoke `python3 scripts/audit/web_smoke.py` (secciones relevantes; el `QUICK` debe terminar con la última estación construida).
- **Memorias del Operador relevantes**: trabajar directamente sobre `main` (sin ramas) [esta sesión corre en un worktree: lectura]; el Hub está en inglés; no commit/push sin orden; Silvia juega en MacBook (no móvil); las hojas 19–26 ya están en sus manos, la web se adapta al papel; auditar cada estación con su guardado real, arreglar y proponer mejoras UX; «dopaminic» UX (Chasm como listón); `NEXT_ADVENTURE_HOLD`/holds del desierto solo se liberan con OK explícito del Operador.
