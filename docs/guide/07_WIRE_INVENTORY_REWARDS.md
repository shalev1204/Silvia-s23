> **GUÍA MAESTRA · Parte 7 · Wire, ramas, inventario y premios** · Anexo de [docs/GAME_MASTER_GUIDE.md](../GAME_MASTER_GUIDE.md) · Auditoría del 16-nov-2026 sobre el árbol de trabajo (incluye la J en S19 ya implementada en local). Marcas: [DOC] · [CÓDIGO] · [INFERENCIA] · ✅ ⏳ ❓ ⚠️. Las **PROPUESTAS** de este anexo **no están aprobadas**; solo mandan las decisiones registradas en la guía maestra §5.0. Ante discrepancia manda el código; el papel impreso es inmutable.

# G · Wire, conversaciones con ramas, inventario, premios y caminos de la historia

> Materia prima para `docs/GAME_MASTER_GUIDE.md` (Brief 2, 16-nov-2026). Solo lectura del repo; no se ejecutó el smoke ni ningún navegador.
> **Qué se leyó:** `web/hub/js/hub-core.js` (motor y datos del Wire, Satchel, Ask Hermes), los cinco `wire-script-*.js`, `wire-ceremony.js`, `gates-road.js`, las escenas `s13b-*`, `s13c-night-erg`, `s15b-stones-dream`, `s15c-bridge-spyglass`, `field-journal.js`, `aurelia-letters.js`, `mirror-speaker.js`, `journey-profile.js`, `hint-ladder.js`, `stage-pause.js`, `sheet-seals.js`, `satchel-and-cairn-one.js`, `web/index.html` (carga de scripts, Chronicles) y `docs/GAME_MASTER_GUIDE.md` + anexos `docs/guide/01..04` + `DESERT_ODYSSEY_BIBLE.md` (estándar del Wire) + `guide-src/B_desert.md`, `C_stage_and_finale.md`.
> **Árbol de trabajo:** el repo tiene cambios sin commit (`hub-core.js`, `wire-script-stage.js`, `wire-script-tower.js`, `s22-whispering-gallery.js`, `field-journal.js`, `ledger-complete.js`…). Todo lo que se cita es lo que hay **en el árbol de trabajo hoy**, no en `ec7ce59`.
> **Etiquetas:** [DOC] lo dice un documento · [CÓDIGO] lo hace el código · [INFERENCIA] deducido. Estados ✅ 🟡 ⏳ ❓ ⚠️ como en `_BRIEF_COMMON.md`.
> **Abreviaturas de ruta (todas bajo `web/hub/js/`):** `HC` = `hub-core.js` · `WSM` = `wire-script-monolith.js` (pasos 10–16) · `WSB` = `wire-script-bridge.js` (17–24) · `WST` = `wire-script-tower.js` (25–32) · `WSS` = `wire-script-stage.js` (33–44) · `WMA` = `wire-script-marches.js` · `WCE` = `wire-ceremony.js` · `GR` = `gates-road.js` · `S13B` = `stations/s13b-gates-tower-ii.js` · `S13X` = `stations/s13b-gates-extras.js` · `ERG` = `stations/s13c-night-erg.js`.
> **Leyenda de consecuencia (§2):** **M** mecánica (cambia estado de juego: nota de pista, objeto, bandera, ruta, horas) · **T** texto posterior (una línea de Hermes más adelante lee la elección) · **C** cosmética (solo cambia la réplica inmediata) · **P** perfil (cuenta para el tono dominante / el perfil del final).

---

## 0. RESUMEN EJECUTIVO (hallazgos que cambian decisiones)

1. **Casi ninguna decisión del Wire cambia el estado del juego.** En los pasos 0–43 hay **67 opciones principales** (+6 del amanecer, +18 del hilo del Chasm), **34 intervenciones de Silvia (asks) con 100 opciones** y **28 preguntas de marcha** (2 opciones cada una). Solo **10 elecciones** tocan algo más que texto: 5 notas de la escalera de pistas desde el Wire (`13:1`, `13:2`, `21:0`, `37:1`, `41:1`), 3 desde eventos de marcha, el objeto del paso 2 y el desvío del amanecer (saltarse Cairn I). El resto es **texto posterior** (13 asks y todas las elecciones principales se releen 1–3 líneas más adelante) o **cosmético** (21 asks, 23 preguntas de marcha). Detalle en §2.
2. **Las bifurcaciones reales viven fuera del Wire**: la escena 3D 13B (3 tonos, ~20 banderas, horas de marcha 9–14, 3 tipos de noche en el Erg, 5 finales de las puertas de bronce), el sueño de 1998, el catalejo del puente y Cairn I (resuelto / saltado). El Wire las **lee** con `W.road()`, `W.flag()`, `W.dream()`, `W.bridge()`. §3.
3. **El nombre que Silvia da a Hermes (paso 1) no se ve en ningún sitio**: `WIRE_CONTACT_NAME = 'Hermes'` está fijo y `setCartographerTitle` ignora lo elegido (`HC:6256-6266`). Solo `EclipseJourney.profile().name` lee la opción cruda (para el final). ⚠️
4. **El tono dominante (warm / protective / tactical / analytic) solo se mide con los pasos 0–3 y el amanecer** (`dominantTone`, `HC:7938`); desde el paso 5 ninguna elección lleva tono. La Mirror Speaker y el perfil del final solo ven esas 4–6 muestras (y el paso 3 siempre suma «tactical»). Para el «final por estilo de juego» hace falta medir también S14–S28. §1.4, §8.3.
5. **De 24 reliquias del Satchel, solo 11 tienen un uso mecánico** (5 sellos de Cairn como puerta, `lamp_oil`, `red_cord`, `servant_coin`, los 3 fragmentos en el Espejo Vivo) y **2 son condicionales** (`falcon_weight`, `ibis_figure`, solo en el camino «observer»). **11 son huérfanas** (solo texto): `gilded_feather`, `order_wax_seal`, `flint_tinder`, `surveyor_compass`, `spyglass_lens`, `water_skins`, `statue_seal`, `tuning_pebble`, `signal_mirror`, `servant_key`, `gilded_star`. §4.
6. **Reparto de premios desequilibrado:** S12 y S19 concentran 5–9 recompensas; **S20, S21 y S22 solo dan «Fragmento + 1–2 preguntas de Ask Hermes»** (y desde la decisión A-02 ya no dan Ledger); S11 no desbloquea ninguna pregunta; el Gates (13B) no tiene página de cuaderno. §5.
7. **Dos restos obsoletos tras A-02 (el Stage ya no da ecuaciones):** `WSS:450` («The line is in your Ledger, and I will not peek at the sum») y el subtítulo `stations/s22-whispering-gallery.js:1030` («…one line for the Ledger»). ⚠️
8. **Bug probable en la rama «Cairn I saltado»:** `completeQuestEncounter` fuerza `order_monolith_gate_seal1 = 'true'` (`S13B:1707`) y la elección «Show him the Seal of Cairn I» no comprueba que Silvia tenga el sello (`S13B:1266-1295`); el Wire (`rememberGateSeal`, `HC:7241`) fija la verdad **antes** de la escena, pero `gateSeal()` en WSM/WSB lee ese valor y diría «One seal» a quien no la lleva. No hay prueba de smoke de esa rama. [INFERENCIA sobre el efecto; el código es hecho].
9. **Para añadir los pasos 45–68 no basta con escribir el guion**: hay que crear *carcasas* en `EXPEDITION_THREAD` con 3 `choices` (si no, `applyWireScript` ignora las elecciones), ampliar `WIRE_LAST_STEP`, `WIRE_FINAL_TELEMETRY`, `WIRE_FINAL_RELIC`, `WIRE_STEP_DIVIDERS`, `wireMoodFor`, la lista de pasos impares de `handleWireChoiceSelection` y los bloques `if (wireCurrentStep === N)` de `renderWireChoices`. §1.6.
10. **Conflicto menor de docs:** `docs/guide/04` dice que las cartas II y III de Aurelia se abren «con S23/S25»; el código las abre con **S25 y S27** (`aurelia-letters.js:44-62`, índices 5 y 7 de `StageMirror.stations`). §7.

---

## 1. EL FIELD WIRE COMO SISTEMA

### 1.1 Capas y ficheros

| Capa | Fichero(s) | Contenido |
|---|---|---|
| Motor, estado, UI del chat | `HC:4457-4477` (nodos DOM), `HC:5781-5850` (estado y `applyWireScript`), `HC:7016-7300`, `HC:7402-7470`, `HC:7622-7960`, `HC:9021-9330` (`renderWireChoices`), `HC:9576-9780` (`handleWireChoiceSelection`) | Un único `<script>` gigante; el Wire es la sección «THE FIELD WIRE (CAMP TELETYPE CONTROLLER)» (`HC:4458`) |
| Hilo de datos pasos 0–44 («carcasa») | `HC:4478-5210` `EXPEDITION_THREAD` | Pasos 0–9 con su texto definitivo; pasos 10–44 con ids de elección y **texto antiguo** que el guion nuevo pisa |
| Hilo del amanecer | `HC:5240-5311` `DAWN_THREAD` (4 pasos: 0, 1, 2 = Cairn I, 3 = final) | Tono de Silvia → `{TONE}` |
| Hilo del Chasm / sal / ruinas / Camp VIII | `HC:8530-8680` `CHASM_WIRE` (6 conversaciones `seen0..5/reply0..5`) | Estado en `order_chasm_wire` |
| Guion pasos 10–44 | `WSM` (10–16), `WSB` (17–24), `WST` (25–32), `WSS` (33–44) | `window.WIRE_SCRIPT[paso]`; se cargan **antes** de `hub-core.js` (`web/index.html:5014-5020`) |
| Eventos de marcha | `WMA` (tramos 10, 14, 18, 22, 26, 34) | `window.WIRE_MARCH_EVENTS[tramo]`, 48 eventos |
| Ceremonias de capítulo | `WCE` (+ `hub/css/wire-ceremony.css`) | `SCENES[25, 33, 41]` |
| Escenas que alimentan el Wire | `S13B`, `S13X`, `GR`, `ERG`, `stations/s15b-stones-dream.js`, `stations/s15c-bridge-spyglass.js` | `W.road/flag/hours/dream/bridge` |
| Consumidores de lo elegido | `mirror-speaker.js`, `journey-profile.js`, `previously.js`, `field-journal.js`, `aurelia-letters.js` | Tono, nombre, objeto, fechas |

### 1.2 Estructura de datos [CÓDIGO]

**`EXPEDITION_THREAD[paso]`** (`HC:4478`):
```
{ step, hermesInitial?, hermesFinal?, completed?, isCompassInput?, game?, divider?, sketch?,
  choices?: [{ id, text, silviaMsg, hermesReply, onPick?, tone?, nameTitle?, item?, beats? }] }
```
- Los pasos **impares ≥ 9 son conversación** (apertura `hermesInitial` + 3 elecciones); los **pares son cierre** (`hermesFinal` + telemetría, a veces arranca/espera una marcha) (`HC:9732`).
- Pasos 0–8 (cap. I): texto definitivo **en `hub-core.js`**, un único mensaje largo por turno (no se partió en beats). No se tocan ([DOC] `DESERT_ODYSSEY_BIBLE.md`: «Capítulo I intacto»).

**`WIRE_SCRIPT[paso]`** (ficheros `wire-script-*.js`):
```js
window.WIRE_SCRIPT[11] = {
  hermesInitial: <TEXTO>,                 // apertura de un paso impar
  hermesFinal:   <TEXTO>,                 // cierre de un paso par
  choices: [ { text, silviaMsg, hermesReply: <TEXTO>, onPick?: (W)=>… } ×3 ]
};
// <TEXTO> = string | [string | {ask:[…]}] | (W) => lo anterior
```
`applyWireScript` (`HC:5836-5844`) [CÓDIGO]:
- Solo para `step >= 10` y solo si el paso existe en `EXPEDITION_THREAD`.
- `hermesInitial` / `hermesFinal` se copian si no son `null`.
- `choices` solo se copian si **`data.choices.length === target.choices.length`**; campos `text`, `silviaMsg`, `hermesReply`, `onPick`.
- Si el valor es una **función**, se define como *getter*: se **reevalúa cada vez que se lee** (cada reapertura del chat), por eso todo texto que dependa de «el estado de ahora» debe usar valores **congelados** (`order_monolith_gate_seal1`, `order_cairn5_seals_at_altar`, `order_stele_seals_at_well`) o de lo contrario un replay reescribe lo que Hermes dijo.

**`<TEXTO>` → mensajes** (`wireBeats`, `HC:7622-7637`): una cadena se parte por párrafos (`\n\s*\n`) y, si un párrafo supera `WIRE_BEAT_MAX = 150` caracteres, por frases. Un objeto `{ask}` **no es un mensaje**.

**Intervención de Silvia (`ask`)** (`HC:7644-7665`, `7666-7725`):
```js
{ ask: [ { text, silviaMsg, reply: <TEXTO>, onPick?: (W)=>… } ×2–3 ] }
```
Puede aparecer dentro de `hermesInitial`, `hermesFinal`, de una `hermesReply` o de un evento de marcha. Hermes se detiene, la bandeja muestra «Say something» con las opciones (💬), Silvia “dice” `silviaMsg`, se ejecuta `onPick`, Hermes contesta con `reply` y continúa. Se guarda en **`order_wire_asks`** con clave **`paso:parte:índice`**: `parte` ∈ `i` (apertura), `f` (final), `r0`/`r1`/`r2` (réplica a la elección principal 0/1/2); `índice` = orden de aparición de los asks de esa secuencia (0, 1, …). Sin valor guardado, el historial **no dibuja** ese ask (por eso un ask no contestado no existe en el pasado de Silvia). En tests (`window.__wireFast`) elige la opción 0 sola salvo `window.__wireAsk = 'manual'`.

**API `W = window.WireScript`** (`HC:5816-5835`):

| Método | Devuelve |
|---|---|
| `W.choice(paso)` | índice 0–2 elegido en `paso` (o `null`) — lee `order_field_wire_choices` |
| `W.chose(paso, i)` | `true` si eligió `i` |
| `W.ask(paso, parte, i)` | opción elegida en ese ask (0–2) o `null` — lee `order_wire_asks` |
| `W.event(id)` | 0/1 si contestó ese evento de marcha; `null` si no llegó / no contestó (`order_wire_marchev`) |
| `W.seals()` | nº de sellos de Cairn en la Alforja ahora |
| `W.road()` | `'humble' \| 'bold' \| 'observer'` (escena 13B; por defecto `'humble'`) |
| `W.flag(k)` | bandera de `order_gates_flags` (`regard`, `blessing`, `coin`, `lieCaught`, `gaveOil`, `lostOil`, `secret`, `statues`, `seen`…) |
| `W.hours()` | horas del cruce del Erg en palabra («Twelve») |
| `W.dream(k)` | respuesta del sueño de 1998: `why` ∈ `seeker/thread/grief`, `radio` ∈ `alone/under/walk`, `end` ∈ `hands/never/finish` |
| `W.bridge()` | `cross \| hide \| trail` (catalejo del puente) o `null` |
| `W.hint(id, n)` | **único método con efecto**: abre las `n` primeras notas de la escalera de pistas de `id` (`EclipseHints.grant`; nunca quita) |

**Eventos de marcha** (`HC:7296-7400`, `WMA`): `WIRE_MARCH_EVENTS[tramo] = [{ at, pool: [{ id, beats, choices?: [{text, silviaMsg, reply, onPick?}×2] } ×3] }]`. El motor elige **una** de las 3 variantes por hueco con `marchHash(tramo:hueco:startedAt) % 3` (FNV-1a; misma durante toda la marcha, distinta en la siguiente); si llega tarde y es el último hueco prefiere variantes sin pregunta. Estado en `order_wire_marchev = { tramo: [{id, pick}] }` con `pick`: `0/1` respuesta · `null` esperando · `'x'` sin respuesta (Hermes decide solo con una de 3 frases `MARCH_NOREPLY`) · `'n'` sin pregunta. Solo marchas iniciadas desde `MARCH_EVENTS_FROM = 2026-11-13` y no saltadas por el tester.

### 1.3 Claves de `localStorage` del Wire y sus ligas

| Clave | Forma | Escribe | Lee |
|---|---|---|---|
| `order_field_wire_step` | int 0–44 | `handleWireChoiceSelection`, `advanceTo`, `syncWire`, tester | todo el motor, `previously.js` |
| `order_field_wire_choices` | array de índices por paso (los pasos sin elección guardan `0`; el 9 se fuerza a 0) | `handleWireChoiceSelection` (`HC:9590`), `renderWireChoices` (paso 9) | `W.choice/chose`, `dominantTone`, `hermesWireChoice`, ceremonias |
| `order_field_wire_completed` | `'true'` mientras la barra de «waypoint» está visible | `showWaypointBar` | UI |
| `order_dawn_step` / `order_dawn_choices` | int 0–3 / `[i,i,'bypassed'?]` | `handleDawnChoice` | `DAWN_THREAD`, `dominantTone(true)` |
| `order_chasm_wire` | `{seenN, replyN}` N=0..5 | `chasmWireTurn` | `isChasmBriefHeard` (`HC:8009`), mapa |
| `order_cartographer_title` | string | `setCartographerTitle` (siempre `'Hermes'`) | — (la opción cruda la lee `journey-profile.js`) |
| `order_satchel_expedition_item` | `{id,name,icon,desc}` | paso 2 | `getHermesFinalForWatchtower`, `EclipseJourney` |
| `order_wire_asks` | `{ "paso:parte:i": 0–2 }` | `wireAskSave` | `W.ask`, historial |
| `order_wire_marchev` | ver §1.2 | `deliverMarchEvents`, `pickMarchChoice` | `W.event`, historial |
| `order_wire_chapters_closed` | `[25,33,41…]` | `wireCloseChapter` | `advanceTo` |
| `order_wire_rests` | `[12,20…]` | `wireRest` | `wireRestHold` |
| `order_wire_read2` | por capítulo, mensajes leídos | `saveWireRead` | etiqueta NEW |
| `order_messenger_unread_count`, `order_messenger_last_read_step`, `order_chat_sound` | int/int/bool | insignia | UI |
| `order_monolith_gate_seal1` | `'true'/'false'` | `rememberGateSeal` (Wire, paso 8) · `S13B:979,1707` (escena) | `gateSeal()` de WSM/WSB/WST, `sealsAtGates` |
| `order_cairn5_seals_at_altar`, `order_stele_seals_at_well` | int 1–5 | `renderWireChoices` pasos 22 y 26 (`HC:9256`, `9266`) | `sealsAtAltar/Well`, telemetría |
| `order_lamp_oil_found` | `'true'` | alijo de Camp VIII | `syncLampOil` |
| `order_gates_path`, `order_gates_flags`, `order_monolith_march_hours`, `order_night_erg`, `order_gates_return` | ver `GR:1-16` | `S13B`, `ERG` | `GatesRoad`, Wire |
| `order_stones_dream`, `order_bridge_spyglass` | `{done, … respuestas}` / `{done, choice}` | escenas | `W.dream`, `W.bridge` |
| `order_ashes_clues` | `{note1, feather, intercept: ms}` | `EclipseNotebook.clue` (`field-journal.js`) | página de la revelación (⏳) |
| `order_hint_<id>_{fails,secs,level}` | int | `hint-ladder.js` | notas, Ask Hermes |

**Nube y perfiles:** cualquier clave nueva `order_*` **viaja sola** con el guardado en la nube (`cloud-save.js:15-30`: solo se excluyen `the_eclipse_active_seeker`, `the_eclipse_gate_ok_at`, `hub_sidebar_collapsed`, `eclipse_profile_vault_*`, `eclipse_cloud_*`) y con el cambio de perfil (`profiles.js:6-30`). **Pero** el rebobinado del tester (`wireForgetFrom`, `HC:7054`) solo olvida `order_wire_chapters_closed/rests/asks/marchev`: una bandera nueva necesita su propia limpieza.

### 1.4 Ritmo, ambiente y estructura [CÓDIGO]

| Elemento | Valor | Fuente |
|---|---|---|
| Mensaje de Hermes (desde S14) | puntos «escribiendo» `min(800, 260 + 4·len)` ms → tecleo **2 caracteres / 15 ms (~133 car/s)** con un solo tic suave (`playSoftTick`) → pausa `min(800, 200 + 4·len)` ms | `HC:7640-7641`, `HC:7855-7890` |
| Modo test | `window.__wireFast` → 30 ms | `HC:7640` |
| Longitud máxima de un beat | 150 car. | `HC:7622` |
| Pasos 0–9 (antiguo) | un único mensaje largo, tecleo rápido con sonido de telégrafo | `HC:7855-7870` |
| Norma de escritura [DOC] | apertura ≤ 6 mensajes + 1–2 asks (Silvia habla cada 3–4 mensajes); final 2–3; réplica 2–3; «si se puede borrar sin perder nada, se borra» | `DESERT_ODYSSEY_BIBLE.md:346+` |
| Ambiente `wireMoodFor` | <5 `dawn` · 5–8 `noon` · 9,10 `night` · 11,12 `dusk` · 13 `dawn` · 14 `noon` · 15 `night` · 16 `dawn` · 17 `dusk` · 18 `night` · 19,20 `dawn` · 21 `dusk` · 22 `night` · 23 `noon` · 24 `dusk` · 25,26 `noon` · 27,28 `fire` · 29,30 `dawn` · 31,32 `noon` · 33 `dawn` · 34 `night` · **resto `lamp`** | `HC:7016-7021` |
| Divisores `WIRE_STEP_DIVIDERS` | 5 Camp VII · 7 Camp VIII · 9 Tower II · The Gates · 11 The Ridge of the Sun · 13 First Light · 15 The Sandstone Labyrinth · 17 The Next Evening · 19 The Southern Mouth · 21 That Evening · 23 The Arch of the Solstice · 25 Under the Arch · 27 The Well of the Atrium · 29 The Inner Stair · 31 The Inner Chamber · 33 The Morning of Departure · 35 The Gate of a Thousand Masks · 37 The Dark Room · 39 The Narrow House · 41 The Whispering Gallery · 43 The Little Door of the Gallery | `HC:7230` |
| Capítulos `WIRE_CHAPTERS` | 0 (por defecto) «The Red Storm · The Salt Road and the Four Wells» (0–8) · **9** «The Five Cairns · Seals of the Sun» · **25** «Tower II in Flames · The Oracle» · **33** «The Mirror Sanctuary · Tower III» · **41** «The Whispering Gallery» | `HC:7036-7038` |
| Cartela de cierre `WIRE_CHAPTER_CARDS` (índice del capítulo que cierra) | 0 «The Al-Qibla bearing · the water of Camp VIII» · 1 «The Seals of Cairns II, III, IV and V» (relics seal_cairn_2..5) · 2 «The first truth: the WHEN» (servant_key, gilded_star) · 3 «Fragments I and II of the mirror» (fragment_1, _2). **Falta el índice 4** (cerrar el cap. V) | `HC:7043-7048` |
| Ceremonias `WCE.SCENES` | claves **25, 33, 41** (cierran II, III, IV); **no hay** para 9 (I→II) ni para 45+ | `WCE:12-70` |
| Descansos `WIRE_RESTS` | **12** («Night under the Sun Monolith» · «☾ Wait for first light ➔») y **20** («Between the Singing Pillars» · «☀ Wait for dusk ➔») | `HC:7061-7064` |
| Otros huecos de la historia | 16 → sueño de 1998 (botón «Enter the dream of 1998»; el tester puede saltarlo); 24→25 y 32→33 ceremonias; 36→37 y 40→41 `holdForDoor` (pausa de sala + sello) | `HC:9145-9190`, `9224-9242` |
| Pausas de puerta (Stage) | `HOURS = {41:3, 42:6, 43..48:null}` (3 h para S21, 6 h para S22) y sellos QR `SEALS = {41:'9682e2b4', resto null}`; `FACE` 41→20A … 48→26A | `stage-pause.js:9`, `sheet-seals.js:11-13` |
| Marchas (ver B_desert §1.3) | 10→9–14 h (por 13B) · 14→6 h · 18→18 h · 22→18 h · 26→6 h · 30→sin espera (`oracleStair`) · 34→18 h | `HC:8116`, `8139-8191`, `8194-8262` |
| Eventos de marcha | 6 tramos, **48 eventos** (10: 3 huecos·9; 14: 2·6; 18: 3·9; 22: 3·9; 26: 2·6; 34: 3·9), 28 con pregunta | `WMA` (tablas en §2.6) |
| Telemetría final | línea `✦ … ✦` por cada paso par (`WIRE_FINAL_TELEMETRY`, `HC:7269-7289`) | — |
| Chip «ADDED TO THE SATCHEL» | solo en pasos 12, 16, 20, 24, 36, 40, 44 (`WIRE_FINAL_RELIC`, `HC:7402`); **no** hay chip para `servant_key` (28), `gilded_star` (32), `tuning_pebble`, `signal_mirror` | `HC:7402-7414` |
| Mensaje interceptado | 2,6 s después del paso 36 en vivo (`WIRE_INTERCEPT`, `HC:7436`); registra `clue('intercept')`; el paso 35 registra `clue('note1')` | `HC:9761`, `7469` |
| Notas de las cartas de Aurelia | `appendLetterNotes(step)` añade la réplica de Hermes al paso en que Silvia abrió la carta | `HC:7427` |

**Tono dominante** [CÓDIGO `HC:5218-5237`, `7938-7961`]: `HERMES_TONE_MAP` asigna tono solo a ids de los pasos 0–3 (`choice-0-grounded warm`, `-protective protective`, `-cipher analytic`; `choice-1-name-hermes warm`, `-cartographer tactical`, `-order analytic`; `choice-2-wash-flint protective`, `-cairns-compass analytic`, `-lookout-spyglass tactical`; `choice-3-bearing-direct tactical`) y a `DAWN_THREAD[0..1].choices[].tone`. `dominantTone(includeDawn)` cuenta; **el empate lo gana el primero que apareció**. Usos: `{TONE}` del cierre del amanecer (`HERMES_TONE_LINES/FINALE`), `mirror-speaker.js` (`TONE`: «Bring that warmth inside» / «You guard him…» / «Here, plans bend. Look twice.» / «Here, reason opens only half the door.»), `journey-profile.js`. ⚠️ El paso 3 solo tiene **una** opción (`isCompassInput`), así que **suma siempre «tactical»** (`HERMES_TONE_MAP` trae además `choice-3-bearing-encouraging/-cautious`, que no existen: restos).

### 1.5 Tabla de pasos (0–44)

| Paso | Tipo | Ambiente | Divisor | Cierre / efecto especial |
|---|---|---|---|---|
| 0–2 | conversación (3 elecciones) | dawn | — | tono; paso 1 = nombre; paso 2 = objeto + modal «item acquired» |
| 3 | entrada de brújula («112» + E) | dawn | — | |
| 4 | cierre de la tormenta | dawn | — | telemetría «WAYPOINT SECURED · OUTER WATCHTOWER VI [112° E]»; sigue el hilo del amanecer (`DAWN_THREAD` 0–3 y `CHASM_WIRE` 0–4) hasta leer el Lexicon |
| 5 | conversación (Camp VII) | noon | Camp VII · The Nomad Ruins | |
| 6 | cierre | noon | — | espera a Clepsydra; hold `NEXT_ADVENTURE_HOLD=false` |
| 7 | conversación (Camp VIII) | noon | Camp VIII · The Four Wells | |
| 8 | cierre | noon | — | marcha 6 h a las puertas (`gatesMarch`); telemetría «KEY XXX · [P] - [A] = 14» |
| 9 | **sin chat** (escena 3D 13B) | night | Tower II · The Gates | espera `order_gates_scene_completed`; al completarse el motor fuerza `choices[9]=0`, arranca `monolithMarch` y salta a 10 |
| 10 | cierre (marcha 9–14 h) | night | — | `WIRE_FINAL_TELEMETRY[10]` según `wire10Arrived()` |
| 11 / 12 | S14: conv. / cierre | dusk / dusk | The Ridge of the Sun | 12: chip `seal_cairn_2`, `WIRE_RESTS[12]` |
| 13 / 14 | amanecer: conv. / cierre | dawn / noon | First Light | 13 arranca marcha 6 h; 14 = tramo de marcha |
| 15 / 16 | S15: conv. / cierre | night / dawn | The Sandstone Labyrinth | 16: chip `seal_cairn_3`; luego el **sueño de 1998** |
| 17 / 18 | anochecer del hardpan: conv. / cierre | dusk / night | The Next Evening | 17 arranca marcha 18 h |
| 19 / 20 | S16: conv. / cierre | dawn / dawn | The Southern Mouth of the Gorge | 20: chip `seal_cairn_4`, `WIRE_RESTS[20]`; antes, escena del **catalejo** al llegar a S16 |
| 21 / 22 | anochecer en Cairn IV: conv. / cierre | dusk / night | That Evening | 21 arranca marcha 18 h |
| 23 / 24 | S17: conv. / cierre | noon / dusk | The Arch of the Solstice | 22→23 guarda `order_cairn5_seals_at_altar`; 24: chip `seal_cairn_5`, **ceremonia de 5 sellos**, luego ceremonia de cap. II→III |
| 25 / 26 | bajo el Arco: conv. / cierre | noon / noon | Under the Arch | 25 arranca marcha 6 h; 26→27 guarda `order_stele_seals_at_well` |
| 27 / 28 | S18: conv. / cierre | fire / fire | The Well of the Atrium | 28: **bloquea si `countCairnSeals() < 5`** (`HC:9270`); sin chip de `servant_key` |
| 29 / 30 | escalera interior: conv. / cierre | dawn / dawn | The Inner Stair | 29 arranca `oracleStair` (sin espera) |
| 31 / 32 | S19: conv. / cierre | noon / noon | The Inner Chamber | 32: telemetría «THE FIRST TRUTH · WHEN: 18 – 20 DECEMBER · [I] + [E] = 12 · [I] + [J] = 18 …»; ceremonia III→IV |
| 33 / 34 | mañana de salida: conv. / cierre | dawn / night | The Morning of Departure | 33 arranca marcha 18 h (`masksMarch`) |
| 35 / 36 | S20: conv. / cierre | lamp | The Gate of a Thousand Masks | 36: chip `mirror_fragment_1`, mensaje interceptado, `holdForDoor(41)` (3 h + sello 20A) |
| 37 / 38 | escalera: conv. / cierre | lamp | The Dark Room | 38 espera a S21 (`order_camera_obscura_completed`) |
| 39 / 40 | S21: conv. / cierre | lamp | The Narrow House | 40: chip `mirror_fragment_2`, `holdForDoor(42)` (6 h) |
| 41 / 42 | segunda escalera: conv. / cierre | lamp | The Whispering Gallery | ceremonia IV→V; 42 espera a S22 |
| 43 / 44 | S22: conv. / cierre | lamp | The Little Door of the Gallery | 44: chip `mirror_fragment_3`; `WIRE_LAST_STEP`; barra «Fragment III Is Set · 3 of 9 · Next: The Automaton Orchestra (Station 23)» |

**Ciclo de un paso de conversación** [CÓDIGO `HC:9576-9770`]: Silvia elige → su `silviaMsg` entra como mensaje saliente → `onPick(W)` → `wireHistory[paso]=i` y `order_field_wire_step = paso+1` → tras 200 ms Hermes dice `hermesReply` (beats, con sus asks) → si el paso está en la lista impar `[9,11,…,43]` arranca la marcha asociada (`MARCH_STARTED_BY_ANSWER`, `HC:8299`: 9→monolith, 13→labyrinth, 17→cairnFour, 21→solstice, 25→stele, 29→oracleStair, 33→masks) y Hermes dice el `hermesFinal` del paso par siguiente + telemetría + chip → `renderWireChoices()` decide si hay marcha, descanso, puerta, ceremonia o la siguiente conversación.

### 1.6 Guía práctica: cómo añadir los pasos 45+ (S23 = 45–48 … S28 = 65–68) [CÓDIGO + DOC]

Patrón **4 pasos por sala** (como S21 = 37–40, S22 = 41–44; [DOC] `GAME_MASTER_GUIDE.md §5.2.B.4`): **A** conversación de salida (apertura + 1–2 asks + 3 elecciones) → **B** cierre (marcha/espera, sin elecciones) → **C** conversación de balance (tras ganar la sala) → **D** cierre con reliquia y puerta de la sala siguiente.

Lista de edición, por orden (todo en `web/hub/js/` salvo que se indique):
1. **Guion**: nuevo `wire-script-stage2.js` (o ampliar `WSS`) con `S[45..68]`. Cargarlo en `web/index.html` **antes** de `hub-core.js` (junto a `:5017`), y regenerar el manifiesto offline: `python3 scripts/web/offline_list.py` (actualiza `web/sw.js`).
2. **Carcasas en `EXPEDITION_THREAD`** (`HC:~5206`, tras el paso 44): `{ step: 45, choices: [{id:'choice-45-a'},{id:'choice-45-b'},{id:'choice-45-c'}] }` para pasos de conversación (**siempre 3**, mismo nº que en el guion, o `applyWireScript` las descarta); `{ step: 46, completed: true }` para cierres.
3. `WIRE_LAST_STEP` (`HC:5845`) → 68. Es el tope de `wireCurrentStep`, del tester (`HC:7487`) y de `appendStepFinal`.
4. `WIRE_FINAL_TELEMETRY[par]` (`HC:7269`) — una línea por paso par; **sin spoilers del WHERE** hasta S28. `WIRE_FINAL_RELIC[par]` (`HC:7402`) solo para 48, 52, 56, 60, 64, 68 (reliquia nueva en `SATCHEL_RELICS` + imagen en `web/assets/items/`).
5. `WIRE_STEP_DIVIDERS[impar]` (`HC:7230`) — un divisor por conversación. `wireMoodFor` (`HC:7016`) ya devuelve `lamp` por defecto para pasos ≥35: dejarlo o añadir `night`/`fire` para S24/S26.
6. `handleWireChoiceSelection`: añadir los impares nuevos a la lista `[9, 11, … 43]` (`HC:9732`) — sin eso el paso par siguiente no se dice solo. Si la sala tiene marcha, añadir `makeMarch(...)` (`HC:8022`), entrada en `MARCH_LEGS` (`HC:8194`) y en `MARCH_STARTED_BY_ANSWER` (`HC:8299`); si no, la espera es la pausa de puerta.
7. `renderWireChoices` (`HC:9160-9190`): copiar el bloque de S21/S22 por sala: `if (wireCurrentStep === 44) { if (holdForDoor(43, …)) return; advanceTo(45); }` · `if (wireCurrentStep === 46) { if (localStorage.getItem('order_automaton_orchestra_completed') !== 'true') { showWaypointBar(…); return; } advanceTo(47); }` · etc. Sustituir el tope actual `if (wireCurrentStep >= WIRE_LAST_STEP)` (`HC:9182`).
8. `stage-pause.js:9` (`HOURS[43..48]`), `sheet-seals.js:11-13` (`SEALS`, `FACE`, `TITLE`): D-21 propone 3·4·5·4·6·8 h; solo S25 con QR (A-11).
9. `WIRE_CHAPTERS` / `WIRE_CHAPTER_CARDS[4]` / `WCE.SCENES[clave]`: si el cap. V se cierra al final de S28 y se abre uno de la Torre I, añadir las tres entradas (más ceremonia de cierre del Stage Path, [DOC] `GAME_MASTER_GUIDE §5.2.B.4`).
10. `syncWire` y `setWire` del tester (`HC:837-875`): ampliar `floor/cap` con `a23…a28` y `ARRIVAL` (`HC:~860`); `TesterDesert.GAMES` ya reserva las salas.
11. Efectos secundarios habituales: `previously.js` (`LAST`), `field-journal.js` (`PAGES.sNN`), `mirror-speaker.js` (automático por nodo), `ambience.js` (`BEDS`), `hint-ladder.js` (ids `sNN-*`), `FIELD_INQUIRIES` + `INQUIRY_REQUIREMENTS` (`HC:5314`, `5924`) y la sección del smoke.
12. **Trampas conocidas**: (a) textos-función **no** deben leer el estado «de ahora» si Hermes ya lo dijo antes (congelar); (b) cada opción necesita **texto por defecto** si `W.choice()` es `null` (replay desde el tester o save antiguo); (c) los ids de elección y el nº de opciones no pueden cambiar tras publicar (el save guarda el índice); (d) `ask` sin respuesta guardada = no existe: nunca poner información obligatoria dentro de un ask (los 4 «detalles aprobados 15-nov» **ya** están dentro de asks: ver §9.b); (e) 150 car./beat; (f) inglés claro, páginas del diario por título entre «comillas curvas», nunca «Sheet NN»; (g) vocabulario blindado (sin *Azimuth, Mucro, Mater, Tympan, Stereographic*); (h) Hermes nunca oye el mensaje interceptado ni nombra a Pope-E.

---

## 2. MAPA DE CONVERSACIONES: todas las decisiones de Silvia, pasos 0–44

> Recuento [CÓDIGO]: **67** opciones principales (pasos 0–3, 5, 7 = 16; pasos 11…43 impares = 17 × 3 = 51) · **6** del amanecer · **18** del hilo del Chasm (6 × 3) · **34 asks / 100 opciones** (32 de 3 y 2 de 2) · **28 preguntas de marcha / 56 opciones**. Con efecto de estado: **10** (5 notas de pista en el Wire, 3 en marchas, objeto del paso 2, desvío del amanecer). Con eco de texto posterior: las 51 elecciones principales de 11–43 y **13 de los 34 asks**. Cosméticas: 21 asks, 23 preguntas de marcha, todas las del cap. I salvo el objeto, el desvío y el gating del Chasm.
> Cada **elección principal** del cap. II–V se responde con 2–3 mensajes de Hermes (+ ask opcional dentro de la réplica) y **vuelve a aparecer** en el cierre par siguiente (`W.choice(paso)`). El nº de opciones principales por paso es siempre 3; sus ids viven en `EXPEDITION_THREAD`.

### 2.1 Capítulo I · «The Red Storm · The Salt Road and the Four Wells» (pasos 0–9, amanecer, hilo del Chasm)

Texto en `HC:4478-4650` (pasos 0–8), `HC:5240-5311` (`DAWN_THREAD`), `HC:8530-8680` (`CHASM_WIRE`). Réplica de Hermes: **un único mensaje largo** (sin beats ni asks).

| Punto | Opciones (texto abreviado del botón) | Consecuencia real | Tipo |
|---|---|---|---|
| **0** primer contacto | `choice-0-grounded` «I'm here. The signal is crystal clear…» · `-protective` «The wire is working! Find secure cover…» · `-cipher` «Loud and clear. I solved your celestial cipher at the cliff…» | Tres réplicas distintas que convergen en la pregunta «¿qué nombre me das?». Cuenta tono: warm / protective / analytic. Silvia: `2` (cipher) | C, P |
| **1** nombre | `choice-1-name-hermes` «Hermes — We are companions…» · `-cartographer` «The Cartographer — You charted these stars…» · `-order` «The Cartographer of Distant Light — The sacred title…» | Hermes responde llamándola «Silvia» / «Navigator Silvia» / «Seeker Silvia». **Se guarda `nameTitle` pero el chat lo ignora** (siempre «Hermes», `HC:6256`). Solo `EclipseJourney.profile().name` lo lee (carta del final). Tono: warm / tactical / analytic. Silvia: `0` (Hermes) | C, P ⚠️ |
| **2** refugio | `choice-2-wash-flint` (Sección I → **Ancient Flint & Juniper Tinder**) · `-cairns-compass` (Sección III → **1998 Brass Surveyor's Compass**, placa gemela) · `-lookout-spyglass` (Panorama → **Scorched Spyglass Lens**) | Secuencia de 3 beats + modal «item acquired»; guarda `order_satchel_expedition_item`, añade la reliquia, y **`getHermesFinalForWatchtower()` (paso 4) cambia 1 frase** según el objeto (`HC:6845-6858`). Después el objeto **no se usa en ningún sitio** (§4). Tono: protective / analytic / tactical. Silvia: `1` (compass) | M (leve), P |
| **3** brújula | única entrada: «112» + E/EAST/ESTE/ORIENTE (regex `HC:9530-9536`) | `choice-3-bearing-direct`; suma siempre «tactical» | P |
| 4 | cierre (sin elección) | telemetría WAYPOINT SECURED… | — |
| **DAWN 0** «The Great Silence» | `dawn-0-wash` (Ley 2, tactical) · `dawn-0-shadow` (Ley 1, analytic) · `dawn-0-rest` (protective) | Las tres bajan al uadi; cambia el primer párrafo. Silvia: `1` | C, P |
| **DAWN 1** «The Dry River» | `dawn-1-trust` (warm) · `dawn-1-marker` (tactical: «chalk mark every hundred paces») · **`dawn-1-reject`** (protective, `isBypass`: «No, Hermes. Do not chase hunches… head straight to the portal») | `reject` → `order_cairn1_bypassed='true'`, borra `order_cairn1_completed` y `order_seal_cairn_1`, arranca `order_chasm_march_start` (marcha de **26 h** por la repisa oeste), `dawnStep = 3`: **no hay Cairn I ni Seal I**. Silvia: `1` (marker) | **M** (rama), P |
| **DAWN 2** «The Heart of the River» | dos pastillas: 🪨 «Examine the slab and guide Hermes» (abre el juego Cairn I) · 👣 «Do not disturb the stones, Hermes. Walk away…» (`handleDawnBypassAtStones`) | Segundo punto de desvío: la 2.ª pastilla es igual que `reject` (`dawnHistory[2]='bypassed'`). Silvia: jugó el juego (16 mov., óptimo 15 → `order_cairn1_optimal` da una frase de elogio en DAWN 3) | **M** (rama) |
| **CW0** «The North Portal» | ✏️ «My line is drawn…» · ⏳ «Give me a few minutes…» · 👂 «What are the voices saying…?» | **Las tres valen lo mismo para abrir el Chasm**: lo que cuenta es haber respondido (`order_chasm_wire.reply0`, `isChasmBriefHeard` `HC:8009`). Silvia: `2` | M (puerta), C |
| **CW1** «The Oasis Gate · Dusk» | 🏆 «MIRAGE is in my six boxes…» · 🐫 «Those tracks worry me too. No fire tonight…» (**solo si Hermes lleva el Seal I**, `needsSeal`) · 🗝️ «Maybe MIRAGE opens something further on…» | Cosmético; la opción 🐫 desaparece en la rama «Cairn I saltado». Silvia: `1` (🐫) | C |
| **CW2** «The North Edge» · **CW3** «South Shore» · **CW4** «Nomad Ruins» · **CW5** «Camp VIII · Noon» | 3 opciones cada una (🧭 🤝 🔭 / ⚖️ 💧 🐫 / 🤫 👂 🐫 / ✏️ 💧 📖) | Solo `reply2` se usa fuera (`edgeHeard`, `HC:2117,2156`: texto de la tarjeta del mapa). El resto es cosmético. Las respuestas de Silvia a CW2–CW5 en su save: no definidas | C |
| **5** Camp VII | `choice-5-crossword` «Check the page “The Desert Lexicon & Al-Qibla”…» · `-sigil` «The circled letters spell PHOENIX…» · `-oracle` «The compass must point to Tower II…» | Tres versiones del mismo hecho; la 3.ª añade «[R] × 2 = [F]» en la réplica (el paso 6 lo repite igualmente). Silvia: `0` (crossword) | C |
| **7** Camp VIII | `choice-7-ledger` «Both lines are in my Cipher Ledger. Drink…» · `-tracks` «The tracks keep going. Do not walk in them» · `-weight` «Keep the falcon weight hidden…» | Las tres terminan con «Look what I found along the way» (el aceite lo da el estado, no la elección). Silvia: `0` | C |
| 8 | cierre | marcha 6 h a las puertas | — |
| **9** | sin chat | escena 3D 13B (§3.2) | — |

> **Seeds reales** de Silvia (`story-point.js:27,38,46,50-52,83`): `order_field_wire_choices = [2,0,1,0,null,0,null,0]`, `order_dawn_choices = [1,1]`, título `Hermes`, camino `humble`, `regard 5` con `blessing`, `secret`, `testPassed`, `lieHeard`, `trial`, `tlook`, 10 h de cruce.

### 2.2 Capítulo II · «The Five Cairns · Seals of the Sun» (pasos 10–24)

Texto en `WSM` y `WSB`. Todas las réplicas son 2–3 beats; los asks entre `[ ]` son 2–3 opciones.

**Paso 10** (cierre; marcha 9–14 h). Lee `W.road()`, `W.flag('blessing'|'gaveOil'|'lostOil')`, `marchKind()` (`shortcut`/`storm`/`steady`) y `W.hours()`; si Silvia llega tarde, `wire10Arrived()` cambia el texto. Sin elección.

**Paso 11 · S14 debrief (mancha de azul cobalto)** — `WSM:48-126`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 11:i:0 | [Touch it. Carefully. · Could it be a trap? · A bored painter lives out here?] | La opción 0 cambia la 1.ª frase de la réplica de la elección 0 («My fingertip is already blue…»). Las otras: C | T / C |
| Ask 11:i:1 | [Maybe it is not a ghost. · You are tired. Look again later. · Describe the smear exactly.] | La opción 0 → frase extra en la réplica 1 («You said it may not be a ghost…») **y** apertura del paso 13 («“Maybe it is not a ghost,” you said, and I slept badly.»). Otras: C | T / C |
| Elección 0 | «Keep a little of the blue. We’ll find out at Tower II.» | Hermes guarda un grano en la caja de latón. Después: paso 12 («The grain of blue rides beside my compass…»), 13, 15 («The ground is the same blue as the grain in my brass box.») | T |
| Elección 1 | «Could another painter of the Order use the same lapis?» | Hermes “intenta ser sensato”; 12 («I am still trying to be sensible…»), 13 («I argued with the blue half the night and lost.»), 15 («A sensible painter does not gild stars under raiders’ noses.») | T |
| Elección 2 | «The raiders know about the seals. We have to be faster.» | Sin fuego ni lámpara; 12 («No fire tonight, as agreed…»), 13, 15 («You told me to forget the ghosts…») | T |

**Paso 12** (cierre; `[D]+[F]=24`, `[C]−[T]=8`; chip `seal_cairn_2`; `WIRE_RESTS[12]`). Lee `gateSeal()` y `W.choice(11)`.

**Paso 13 · primer luz** — `WSM:143-226`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Asks 13:i:0 y 13:i:1 | [How sure are you of that line? · Did you sleep at all? · Can you see Cairn III from there?] · [Is the old paper wrong elsewhere? · So the founders drew upside down? · Does the line still hold?] | Solo la réplica inmediata | C |
| Elección 0 | «Walk the reverse of the 348° groove.» | Paso 14: «Down the line of 168°, the Monolith dead behind me.» | T |
| Elección 1 | «Keep off the ruts. Don’t let them see you.» | **`W.hint('s15-torches', 1)`** (abre la 1.ª nota «torches in the labyrinth») + 14 | **M**, T |
| Elección 2 | «Copy the Tablet at the Mouth before you go in.» | **`W.hint('s15-sigil', 1)`** + 14 | **M**, T |
| (todas) | — | Al responder arranca la marcha de 6 h al laberinto | M |

**Paso 15 · S15 debrief (campamento de los Ashes, estrella dorada)** — `WSM:243-322`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 15:i:0 | [Are you hurt? · Did you see their faces? · We make a good team.] | C | C |
| Ask 15:i:1 | [What did it look like? · Maybe the raiders painted it. · Leave it. Just get out of there.] | La opción 1 («Maybe the raiders painted it») → frase en el paso 16 («You wondered if raiders painted it; I do not think a raider owns that much gold.») | T / C |
| Elección 0 | «Someone is marking the way for you.» | 16: «The star is in my log now, and the grain of blue in its box. Two clues…»; **19** (r0): «I told you I would look for the next star…» (`chose(15,0) o chose(15,2)`) | T |
| Elección 1 | «Lose the raiders before Cairn IV.» | 16: «I brushed out my own tracks at the Cleft…» | T |
| Elección 2 | «Tell me about Aurelia’s stars.» | 16: «I keep seeing Aurelia’s hands over the lapis…»; 19 (r0) igual que la 0 | T |

**Paso 16** cierre (`[W]+[A]=26`, `[N]−[E]=9`; chip `seal_cairn_3`). Pasos 15–16 tienen líneas condicionales según los destellos y las voces del laberinto (`labyFound`, `labyHeard` en `wire-script-monolith.js`); se calculan al pintar, así que un destello hallado después en «Back into the dark» cambia el texto ya leído (aceptado). Tras él, el **sueño de 1998** (escena 3D; §3.4).

**Paso 17 · anochecer del hardpan (pastor, mujer velada)** — `WSB:19-77`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| (apertura) | `W.dream('end')` ∈ hands/never/finish | 1.ª frase distinta según lo que Silvia contestó al final del sueño | T (desde 3.º sistema) |
| Ask 17:i:0 | [Drink, and fill every flask. · Can you trust him? · And how are the goats?] | **Las 3 se leen en el paso 18** («Every flask is full.» / «I have not let go of the satchel once.» / «A goat ate a corner of my log.»). La 3.ª = invariante aprobado 15-nov (cabra y bitácora) | T |
| Ask 17:i:1 | [Do not go near her. · Maybe she needs help. · Singing to the stars? Like you.] | Solo si elige la elección 0: la última línea de la réplica cambia (3 variantes por índice) | T |
| Elección 0 | «Ask him about the veiled woman.» | Hermes anota la melodía (5–6 notas); 18: «The dates are on her stone…»; **29** (`W.choice(17)===0`): «…the same tune the shepherd hummed for me» | T |
| Elección 1 | «Ask him the way over the Natural Bridge.» | Evita el camino de carros; 18: «The second turn is marked in my log…» | T |
| Elección 2 | «Ask how many raiders he saw.» | 3 carros, ~12 hombres; 18: «My lamp is wrapped in my coat…» | T |
| (todas) | — | Arranca la marcha de 18 h a Cairn IV (eventos de marcha §2.6) | M |

**Paso 19 · S16 debrief (pilares, guijarro)** — `WSB:98-153`. Depende de `W.bridge()` (catalejo): la frase sobre los asaltantes que se dividen cambia en `cross`/`hide`/`trail`.
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 19:i:0 | [Listen again, to be sure. · Are you all right? Sit down. · Is it exactly the same rhythm?] | C | C |
| Elección 0 | «Keep the pebble. It’s a message.» | r0 lee `chose(15,0/2)`; 20: «The pebble is back in its brass box…» | T |
| Elección 1 | «The Sanctuary is in danger. Hurry.» | 20: «My pack is already by the door…» | T |
| Elección 2 | «The cairns are instruments...» | 20: «The reeds still sing in my head…» | T |

**Paso 20** cierre (`[S]+[U]=17`, `[S]−[U]=9`; chip `seal_cairn_4`; `WIRE_RESTS[20]`).

**Paso 21 · anochecer en Cairn IV (errata midsummer)** — `WSB:170-224`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 21:i:0 y 21:i:1 | [Ask the Servant what to do. · We could wait until June. · Will the seal stay locked?] · [Rest an hour first, please. · Eat and drink as you go. · How fresh are the ruts?] | C | C |
| Elección 0 | «Then we’ll turn the mirrors for an autumn sun.» | **`W.hint('s17-dawn', 1)`** + 22 («I will turn bronze mirrors in my head…») | **M**, T |
| Elección 1 | «Can you see Tower II from the Arch?» | 22 («I will glance north-east at every ridge…») | T |
| Elección 2 | «Watch your back. They’re still following you.» | r2 cambia con `W.bridge()` (3 frases); 22 («My back has carried heavier things…») | T |
| (todas) | — | Arranca la marcha de 18 h al Arco | M |

**Paso 23 · S17 debrief (la luz, el humo)** — `WSB:242-299`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 23:i:0 | [What did it say? · Weren’t you afraid to answer? · It could be a trap, Hermes.] | C | C |
| Elección 0 | «Go now. The Servant is alone.» | r0: 5 sellos vs 4 (`altarSeals()`), frase por `W.road()` (humble/bold/observer), `W.flag('coin')`; 24: «The seals are sewn into my coat…»; 25 («You told me to go at once. I stood up three times…») | T |
| Elección 1 | «Who else could know Aurelia’s code?» | r1 cambia si `W.dream('why')==='grief'`; 24: «I am still turning that question over…»; 25 («All night I turned over your question…») | T |
| Elección 2 | «Keep the mirror. You may need to answer again.» | r2 cambia con `W.flag('blessing')`; 24 («The mirror is warm against my chest…»); 25 («I sat up with the mirror in my hand…») | T |

**Paso 24** cierre (`[Y]−[O]=2`, `[L]+[G]=23`; chip `seal_cairn_5`; ceremonia de 5 sellos; luego «Close the chapter»).

### 2.3 Capítulo III · «Tower II in Flames · The Oracle» (pasos 25–32) — `WST`

**Paso 25 · bajo el Arco** — `WST:15-86`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 25:i:0 | [Is the fire still burning? · Eat something first. · Could that smoke be a signal?] | C | C |
| Ask 25:i:1 | [Could the Servant be inside? · How many men are down there? · A burning tower. Of course.] | La opción 0 cambia la 1.ª frase de la réplica 2 («You asked if he is inside…») | T |
| Elección 0 | «Arrive in the dark. Stay out of their sight.» | r0 trae su propio ask 25:r0:0 [What if both doors are guarded? · Flash your mirror to distract them. · Take notes. I'm grading you.] (C); **27**: «The dark did its work. The side door in the cliff let me in…»; el evento `dry-smell` de la marcha 26 («You said to use the dark…») | T |
| Elección 1 | «I'll have the page “The Polybius Stele” open and ready.» | 27: «…you read that stele like a Servant yourself.» | T |
| Elección 2 | «If the Servant is alive, find him first.» | 27: «You were right to send me to him first…»; evento `dry-smell` («Straight to him, as you asked…») | T |
| (todas) | — | Arranca la marcha de 6 h (eventos de marcha §2.6) | M |

**Paso 27 · S18 debrief (el Sirviente vivo)** — `WST:97-165`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 27:i:0 | [Is he badly hurt? · What did he say when he saw you? · Did he ask for his seals back?] | La 0 cambia la 1.ª frase de la réplica 2. **La opción 1 contiene «‘You are late.’» (invariante aprobado 15-nov): solo sale si la elige** ⚠️ | T / C |
| Ask 27:i:1 | [Have you ever seen the Oracle? · Is she really safe down there? · Take me to her. Now.] | C | C |
| Elección 0 | «A disc in her arms... Ask him more.» | 29: «I slept badly, thinking of the words he would not say.» | T |
| Elección 1 | «What did the raiders want with the charts?» | r1 (2 beats) + ask 27:r1:0 [They'll be back for the charts. · Can the charts be hidden? · Half blind is good. Keep it that way.] (C); 29: «I slept with my back to the hatch…» | T |
| Elección 2 | «Is he hurt? Take care of him.» | r2 usa la 1.ª frase distinta si `ask(27,i,0)===0`; 29: «His hands are better this morning…» | T |

**Paso 28** cierre: `[H]−[U]=16`, `[M]+[T]=25`; `W.flag('regard') >= 3` (camino de las puertas) cambia cómo el Sirviente entrega la llave («without a word» vs «a tiny grid»). **Puerta**: sin 5 sellos el chat **no avanza** (barra «The Servant Is Safe · Seals n / 5 · open Station 19… the Servant will show you the way back to Cairn I», `HC:9270-9280`). No hay chip de `servant_key`.

**Paso 29 · alba en la escalera** — `WST:183-256`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 29:i:0 | [Why would they just leave? · Did they leave anyone behind? · Good riddance, then.] | La 0 cambia la 2.ª frase de la réplica 2 | T / C |
| Ask 29:i:1 | [What do the sockets look like? · Is it safe to touch? · Knock first, Hermes.] | La 2 añade una frase a la réplica 0 («And I knock once more before I touch anything…») | T / C |
| (apertura) | `W.choice(17)===0` | La última frase repite la melodía del pastor | T |
| Elección 0 | «I'm ready. Let's seal the horizon.» | r0 (2 beats); 31: «You said you were ready, at the door…» | T |
| Elección 1 | «Are you all right, Hermes?» | r1 con ask 29:r1:0 [Then I'll hold the door with you. · A door can't hurt you. · What scares you most?] (C) y frase por `W.flag('blessing')` (cordón vs espejo); 31: «You asked at the door if I was all right…» | T |
| Elección 2 | «And the raiders? The Astrolabe?» | r2 cambia con ask 29:i:0; 31: «You asked about the Ashes at the door…» | T |
| (todas) | — | Arranca `oracleStair` (sin espera: Hermes baja ya) | M |

**Paso 31 · S19 debrief (Aurelia)** — `WST:266-333`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 31:i:0 | [I knew it. · Hermes... are you crying? · How? Tell me everything.] | C | C |
| Ask 31:i:1 | [Does she remember you? · What is she like? · Does she know about me?] | C. **La opción 1 contiene el retrato de Aurelia (manos azules, espalda recta) = invariante aprobado**: solo sale si la elige ⚠️ | C |
| Elección 0 | «Stay with her, Hermes. The rest can wait.» | 32: «Staying a day, as you said…»; 33: «You told me to stay, so I stayed…» | T |
| Elección 1 | «Will her memory come back?» | Hermes promete no decir «bridge» hasta que ella lo diga; 33: «I watched her remember…» | T |
| Elección 2 | «Then we follow the raiders to the Stage.» | r2 con ask 31:r2:0 [Is she strong enough to travel? · Take the charts with you. · Promise me you'll be careful.] (C); 33: «You wanted us on the raiders’ road…» | T |

**Paso 32** cierre: `[I]+[E]=12`, `[I]+[J]=18`; estrella de pan de oro; WHEN. Ask 32:f:0 [Thank her for me. · Why a star? · Is she really coming east?] (C). Lee `W.choice(31)`. Ceremonia III→IV.

### 2.4 Capítulos IV y V · Stage Path (pasos 33–44) — `WSS`

**Paso 33 · mañana de salida** — `WSS:13-80`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| (apertura) | `W.choice(31)` · `W.bridge()` (en la réplica del ask) | 1.ª frase por lo que Silvia dijo en 31 | T |
| Ask 33:i:0 | [Did you sleep at all? · Can we catch the raiders? · What will the Speaker want?] | La 1 cambia la 1.ª frase de la réplica 0 («Good. If we are to catch them…») y su propia réplica según `W.bridge()`. **La opción 0 contiene «Eleven hours, in a real bed.» (invariante aprobado)**: solo sale si la elige ⚠️ | T / C |
| Elección 0 | «I have the pages. Let’s go to the third tower.» | 34: «East, then, at Aurelia’s pace…» | T |
| Elección 1 | «How is Aurelia this morning?» | + ask 33:r1:0 [Does she remember you? · Look after her, Hermes.] (C); frase por `W.flag('blessing')`; 34 variante («with Aurelia humming…») | T |
| Elección 2 | «What does the letter say?» | 34 variante; **35** (r2: `W.chose(33,2)` → «You know why from the letter…») | T |
| (todas) | — | Arranca marcha de 18 h (eventos §2.6) | M |

**Paso 35 · S20 debrief (SILVER, Fragmento I, nota con ceniza)** — `WSS:97-161`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| (apertura) | `W.flag('lieCaught')` · `W.road()` | La frase de elogio cambia: mentira cazada / bold / observer / humble (**camino de 13B pagado aquí**) | T |
| Ask 35:i:0 | [Bow to her. Politely. · Does she say anything? · Ask her where the fragment is.] | La 0 → 36: «…Aurelia put a crown of paper stars on my head, and I bowed to her. Nobody bowed back.» | T / C |
| Elección 0 | «What does the note say?» | r0 + ask 35:r0:0 [Could it be a trap? · Burn it, Hermes. · Look at the seal closely.] (C). 36: «I have read the note a dozen times…»; 37: «The note is still in my coat…» | T |
| Elección 1 | «The Mirror Speaker: is she real?» | 36: «I said goodnight to the glass…»; 37: «…the grey gown stood in the glass…» | T |
| Elección 2 | «Keep the fragment safe.» | r2 lee `chose(33,2)`; 36: «Fragment I under my head»; 37 | T |
| (hecho) | — | Mostrar el paso 35 registra `clue('note1')` | M (clave Ashes) |

**Paso 37 · escalera de la cámara oscura** — `WSS:181-235`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 37:i:0 | [Is she still there? · Wait for me before going down! · Any dragons down there?] | C | C |
| Elección 0 | «I have the page “The Camera Obscura”. Go down.» | 38: «Aurelia has put her hand over my lamp…» | T |
| Elección 1 | «Why is the city upside down?» | **`W.hint('s21-city', 1)`**; 38 variante («keeping my guesses to myself on her orders»); **39** («Now I see why the city was upside down…») | **M**, T |
| Elección 2 | «Be careful on the stair.» | 38: «Aurelia has finally let go of my hand…» | T |

**Paso 39 · S21 debrief (casa estrecha, Fragmento II)** — `WSS:252-307`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 39:i:0 | [Are you hurt? · What does it look like? · Soot suits you.] | C | C |
| Elección 0 | «What was in the house?» | Hueco vacío bajo el tablón; 40: «I cannot stop thinking about the empty hollow…» (**gancho sin pagar**, §5.4) | T |
| Elección 1 | «Is Fragment II safe?» | 40: «The two fragments are humming in my scarf…» | T |
| Elección 2 | «Where did the raiders go?» | r2 (2 beats) + ask 39:r2:0 [Then go down now! · Rest first, old man.] (C); 40: «The whispering comes up the second stair…»; **41** (`chose(39,2)` → «You asked where the raiders went…») | T |

**Paso 41 · escalera de los susurros** — `WSS:325-375`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 41:i:0 | [Can you hear words? · How are your knees? · Turn back if it feels wrong.] | La 0 → 42: «Still no words, only the murmur, and now it comes from the far end.» | T / C |
| Elección 0 | «I have the page “The Whispering Gallery” ready.» | 42: «Boots in my hand…» | T |
| Elección 1 | «What is the rose on the floor?» | **`W.hint('s22-focus', 1)`**; 42; **43** («You found the rose for me in the dark…») | **M**, T |
| Elección 2 | «Be very quiet down there.» | 42: «I am whispering to you from the stair…» | T |

**Paso 43 · S22 debrief (las palabras de los Ashes)** — `WSS:394-443`
| Decisión | Opciones | Consecuencia | Tipo |
|---|---|---|---|
| Ask 43:i:0 | [What did they look like? · Did they see you? · Were they good musicians?] | La 2 → 44: «I keep hearing the Ashes’ dreadful notes…» | T / C |
| Elección 0 | «Who is ‘she’?» | 44: «‘She will come.’ I fall asleep on those words…» | T |
| Elección 1 | «What do the words mean?» | 44: **«The line is in your Ledger, and I will not peek at the sum…»** ⚠️ resto de `[J]×2=[T]` | T |
| Elección 2 | «What did Aurelia whisper?» | 44: «Aurelia is whispering toward the east end again…» (**gancho sin pagar**) | T |

**Paso 44** cierre: chip `mirror_fragment_3`; fin del hilo.

### 2.5 Índice de dependencias: quién lee qué (resumen)

| Origen | Lo leen |
|---|---|
| `choice(11)` | 12, 13, 15 |
| `choice(13)` | 14 |
| `choice(15)` y `chose(15,0/2)` | 16, 19 |
| `choice(17)` | 18, 29 |
| `choice(19)`, `choice(21)` | 20 / 22 |
| `choice(23)` | 24, 25 |
| `choice(25)` | 27, evento de marcha `dry-smell` (26) |
| `choice(27)`, `choice(29)` | 29 / 31 |
| `choice(31)` | 32, 33 |
| `choice(33)`, `chose(33,2)` | 34, 35 |
| `choice(35)` | 36, 37 |
| `choice(37)` | 38, 39 |
| `choice(39)`, `chose(39,2)` | 40, 41 |
| `choice(41)`, `chose(41,1)` | 42, 43 |
| `choice(43)` | 44 |
| asks leídos | 11:i:0 · 11:i:1 (→13) · 15:i:1 (→16) · 17:i:0 (→18) · 17:i:1 · 25:i:1 · 27:i:0 · 29:i:0 · 29:i:1 · 33:i:0 · 35:i:0 (→36) · 41:i:0 (→42) · 43:i:0 (→44) |
| `W.road/flag` | 10, 23, 28, 29, 33, 35 |
| `W.dream` | 17 (`end`), 23 (`why`) — **`why`=seeker/thread y todo `radio` no se leen** |
| `W.bridge` | 19, 21, 33 |
| `W.event` | `shelf-lizard` ← `erg-fennec`; `dry-arrow` ← `hp-ruts` |
| **Nadie lee (más allá del cierre inmediato)** | las elecciones de 13, 19, 21, 27, 29 y 43 (solo las repite el cierre par); 21 asks; `W.dream('why')` salvo `grief`; `W.dream('radio')`; las respuestas CW2–CW5 |

### 2.6 Eventos de marcha (`WMA`): 48 eventos, 28 con pregunta

Cada hueco `at` elige 1 de 3 variantes. «P» = lleva pregunta (2 opciones). Las preguntas solo cambian la réplica inmediata, salvo las marcadas.

| Tramo | Hueco (`at`) | Variantes (id) · P = pregunta |
|---|---|---|
| **10** Erg de noche | 0,2 | `erg-fennec` P(«Give it a crumb» / «Leave it be») → **lo lee `shelf-lizard`** · `erg-singing-dune` · `erg-leaving` |
| | 0,5 | `erg-shooting-stars` P(«Make a wish» / «Note which corner») · `erg-cold-wind` · `erg-glass` |
| | 0,8 | `erg-morning-star` P(«Check it with the spyglass» / «Stay low and circle round it») · **`erg-first-shadows` P(«Watch how those shadows change» → `W.hint('s14-shadow',1)` / «Keep walking»)** · `erg-first-sight` |
| **14** bajada 168° | 0,35 | `shelf-lizard` (lee `erg-fennec`) · `shelf-ruts` P(«Pick up the glove» / «Leave it. Leave no trace») · **`shelf-watchman` P(«Teach me how to read a sentry’s round» → `W.hint('s15-torches',1)` / «Did you ever get caught?»)** |
| | 0,7 | `shelf-heat` P(«Rest in the shade» / «Trust the compass») · `shelf-arches-hum` · `shelf-scorpion` |
| **18** hardpan | 0,2 | `hp-owl` · `hp-ticking` P(«Walk toward the notes» / «Ignore it») · `hp-ruts` P(«Walk in the ruts» / «Keep clear») → **lo lee `dry-arrow`** |
| | 0,5 | **`hp-storm` P(«Count the seconds until the thunder» → `W.hint('s16-song',1)` / «Use the flashes»)** · `hp-peg` P(«Look for the next peg» / «Leave it») · `hp-lonely` P(«Tell me about the first star you saw» / «I am right here, at my desk») |
| | 0,8 | `hp-hoopoe` · `hp-cracking-rocks` · `hp-veiled-woman` P(«I think she is real» / «Maybe it is only a herders’ tale») |
| **22** retorno al Arco | 0,2 | `ret-glint` P(«Wait and watch» / «Move on quickly») · `ret-echo-steps` · `ret-bats` |
| | 0,68 | `ret-wrong-turn` P(«Climb the chimney» / «Go back, next gap») · `ret-mist` · `ret-pebble` P(«Maybe it is a thank-you» / «Do not read too much into it yet») |
| | 0,8 | `ret-dust-devil` P(«Run after the hat!» / «Let it go») · `ret-falcon` · `ret-sand-boots` |
| **26** hacia el humo | 0,35 | `dry-smoke-colour` P(«Do not read the smoke» / «Describe it like a surveyor») · `dry-vultures` · `dry-rehearsal` P(«Just say, “I’m glad you’re alive.”» / «Bring him a small gift») ← **regalo prometido, nunca pagado** |
| | 0,7 | `dry-smell` (lee `choice(25)`) · `dry-silence` P(«Stop and listen» / «Keep going, but quietly») · `dry-arrow` P(«Rub the arrow out» / «Turn the stone round»; lee `hp-ruts`) |
| **34** meseta con Aurelia | 0,2 | `plat-sketch` P(«Ask her to draw something for me» / «Keep her away from the viper!») · `plat-hum` P(«Hum along with her» / «Let her hum on her own») · `plat-feather-cloud` |
| | 0,5 | `plat-last-camp` P(«Rest in the shade of their camp» / «Sleep a hundred paces away») · `plat-lapis-evening` P(«Tell her about your first chart together» / «Let her rest») · `plat-mirage` |
| | 0,8 | `plat-stars` P(«Ask which star is her favourite» / «Ask her to teach you a new star») · `plat-glass-bells` P(«Follow the sound» / «Ignore it») · `plat-pigeon` P(«Write back. Thank him.» / «Let Aurelia write the reply») |

**Balance de la sección 2:** el sistema de asks + eventos de marcha **da ritmo y sensación de diálogo, pero no ramificación**. La ramificación con consecuencia está en 13B, Night Erg, sueño y catalejo (§3). Los 4 «detalles aprobados» (cabra · «You are late.» · manos azules de Aurelia · once horas de cama) viven en **opciones de asks** y por tanto **no están garantizados**.

---

## 3. CAMINOS DE LA HISTORIA: bifurcaciones reales, variantes y reconvergencias

### 3.1 Síntesis (qué bifurca de verdad)

| # | Bifurcación | Dónde se decide | Variantes | Qué cambia de verdad | Reconverge en |
|---|---|---|---|---|---|
| B1 | **Cairn I: resolver / saltarlo** | DAWN 1 `dawn-1-reject` o DAWN 2 «Do not disturb the stones» (`HC:8470-8490`) | con Seal I (juego, óptimo = 15 mov.) · sin Seal I (marcha 26 h por la repisa) | sellos 1/5 vs 0/5 en el Wire (textos «N seals»), opción 🐫 del hilo del Chasm, `order_cairn1_*`; la **Estación 19 exige 5 sellos** | Paso 28 (el chat espera `countCairnSeals() ≥ 5`) y S19: el Sirviente ofrece volver a Cairn I (`checkServantCairnRequirement`, `satchel-and-cairn-one.js:545`); «Refuse» bloquea el regreso hasta tener 2 sellos más (`order_cairn1_locked_until_3_cairns`) |
| B2 | **El camino de las puertas** (humble / bold / observer) | escena 13B (`S13B`, `S13X`) | 3 tonos × banderas (§3.2) | horas del cruce (9–14), reliquias (`red_cord`, `servant_coin`, `statue_seal`), notas de pista en S14/S18/S19, tipo de noche en el Erg, frases de los pasos 10/23/28/29/33/35, **5 finales de las puertas de bronce** | Estación 14 (todos llegan al Monolito); S19 (todos entran por las puertas de bronce) |
| B3 | **La noche en el Erg** (traveller / ghost / dark) | `ERG`, la fija `GatesRoad.nightKind()` (no se elige) | 3 noches × 3–4 respuestas | notas gratuitas `s14-shadow` / `s14-sigil`, aceite (`lamp_oil` medio / vacío), `nightLost` (texto de S14) | S14 |
| B4 | **Sueño de 1998** (3 preguntas) | `stations/s15b-stones-dream.js` | `why` (3) · `radio` (3) · `end` (3) | solo texto: `end` (→ paso 17), `why==='grief'` (→ paso 23) | paso 17 |
| B5 | **Catalejo del puente** | `stations/s15c-bridge-spyglass.js` | `cross` · `hide` · `trail` | `hide` → nota `s16-sigil`; avistar los pilares → `s16-song`; texto en 19, 21 y 33 | S16 |
| B6 | **Estatuas → Ibis → guardianes** (rama exclusiva «observer») | `S13X` | resuelto / no | `ibis_figure` en S14, `statue_seal` al volver con 5 sellos | S19 |
| B7 | Objeto del refugio (paso 2) | Wire | flint / compass / lens | 1 frase del paso 4; reliquia sin uso | paso 4 |
| B8 | Variante de eventos de marcha | hash del inicio de la marcha | 3 por hueco | atmósfera, 3 notas de pista | — |
| B9 | **Tono** | pasos 0–3 + amanecer | warm / protective / tactical / analytic | `{TONE}` del amanecer, línea de la Mirror Speaker, perfil del final | — |

> **Todos los caminos reconvergen** en la misma secuencia de estaciones; **ninguna rama bloquea una estación** salvo B1 (necesita los 5 sellos para S19). Las ramas dejan **«eco» en lo que Hermes dice, notas de pista y reliquias**, no finales distintos. [INFERENCIA] El «final por estilo de juego» (IB #13) **hoy solo puede leer** tono (4 muestras), nombre crudo, objeto del paso 2, horas, fallos y notas de pista (`journey-profile.js`); **no lee** ninguna bandera de 13B, sueño ni catalejo.

### 3.2 Escena 13B · At the Gates of Tower II (`S13B` 1 831 l., `S13X` 460 l., `GR` 135 l.)

Estado: `order_gates_scene_completed`, `order_gates_path` (`humble|bold|observer`), `order_gates_flags` (JSON), `order_monolith_march_hours`, `order_gates_return {done, ending, keepers}`, `order_monolith_gate_seal1`. [CÓDIGO `GR:1-16`]

**Banderas** (`GR:9-16`): `regard` int (−4…+7) · `gaveOil` / `lostOil` · `blessing` (cordón rojo) · `coin` (moneda) · `lieCaught` · `duel` (`'won'|'lost'`) · `nightOil` (`'shared'|'all'|'kept'`) · `statues` (`'riddle'`) · `seen` {arch, staff, tracks, fire, statues}. Además (`S13X`/`S13B`): `trial`, `tlook`, `testPassed`, `testFailed`, `stumbled`, `sealRefused`, `lieHeard`, `lieLost`, `angered`, `askedTracks`, `warned`, `secret`, `recognized`, `duelOpened`, `duelDeclined`, `duelDone`.

**Árbol de acciones** (id → efecto; `R(n)` = regard):

| Etapa | Acciones | Efecto |
|---|---|---|
| `approach` | `greet` «Greet him with respect» | tono **humble**, R+2 |
| | `demand` «Tell him to step aside» | tono **bold**, R−2, `trial`, pregunta del bastón |
| | `study` «Look around first» | tono **observer** |
| `look` (máx. 4 a la vez) | `look_arch` / `_staff` / `_tracks` / `_fire` / `_statues` | `seen.*`; `tracks` → noche del camello fantasma; `fire` → ofrece alimentar el fuego; `statues` → (solo observer) ofrece `statue_read`; `look_done` R+1 si ≥2 detalles |
| `hub` | `who`, `name`, `oracle` (+`trialHint` si R≤−1), `memory` (`recognized`, R+1 si R≥2), `proof`, `diary`, `trial`, `look_more`, **`oil`** «Feed the dying fire…» | `oil`: `gaveOil`, R+2, **se pierde `lamp_oil`** |
| `test` (pregunta del bastón) | **`t8` «Eight points»** | `testPassed`, R+2 |
| | `t6`, `t12` (erróneas) | R−1; con 2 fallos `testFailed` + `stumbled` (no puede enseñar el sello hasta pagar con aceite) |
| | `tlook` | `seen.staff` |
| `seal` | «Show him the Seal of Cairn I» | ok si `R≥1 \|\| testPassed \|\| (stumbled && gaveOil)`: coloca el sello (`sealFx` → `order_monolith_gate_seal1='true'`) y pasa a `after`; si no, `sealRefused` y vuelve a `hub`/`test`. ⚠️ **No comprueba que Silvia tenga el Seal I** |
| `after` (máx. 4 a la vez + `go`) | `where`, `goal` (→ `lieHeard`), `time`, `tracks` (`askedTracks`), `diary`, `oil` | información y banderas |
| | **`blessing`** «Ask for his blessing» (si **R≥3 y tono ≠ bold**) | **`red_cord`**, `blessing`, R+1 |
| | **`secret`** «Ask what the Oracle values most» (si **R≥5**) | `secret` (final «trusted») |
| | **`go`** «Go: march 14° NNE to Cairn II» | `completeQuestEncounter`: guarda camino y banderas, `order_gates_scene_completed`, `order_monolith_gate_seal1='true'`, arranca la marcha |
| extras (`S13X`) | **`lie_catch`** (solo `after`, si `lieHeard`, sin `lieCaught/lieLost`, y vio `arch` o leyó el diario) → `lc_dusk` «The doors open at dusk, not dawn» (**correcta**: `lieCaught`, **`servant_coin`**, R+2) · `lc_oracle` / `lc_servant` (erróneas: `angered`, `lieLost`, R−3) | la moneda lleva la mitad del disco |
| | **`statue_read`** (**solo tono observer**, vio las estatuas) → `sr_fi` «The Falcon and the Ibis» (**correcta**: `statues='riddle'`, R+1) · `sr_fj` / `sr_ss` (erróneas) | habilita el Ibis en S14 y pagar a los guardianes al volver |
| | **`duel_open`** (**solo tono bold**, en `test`) → `duel_yes` (apuesta: el aceite) / `duel_no` → 3 rondas (fuegos / huellas / mentira) | ≥2 aciertos: **ganado** (`testPassed`, R+3, premio `dp_raiders` → `warned` o `dp_oracle` → `secret`); si no, **`lostOil`**, R−1, vuelve a `test` |

**Exclusividad por camino** [CÓDIGO]: **humble/observer** → bendición (cordón) y secreto (por R); **bold** → duelo de acertijos; **observer** → estatuas / Ibis / guardianes; **todos** → cazar la mentira, ofrecer aceite. ⚠️ Silvia (humble) **nunca podrá** conseguir el Ibis ni el `statue_seal`: su `falcon_weight` queda sin uso (§4).

**Horas del cruce** (`GR:37-55`): base 12 · `regard ≥ 3` → −2 · (`regard ≤ −2` y sin `gaveOil`) → +2 · `coin` → −1 · mínimo 9 · se congela al salir (`order_monolith_march_hours`). `marchKind()` = `shortcut` (<12) / `storm` (>12) / `steady`. Silvia: 12−2 = **10 h** (`story-point.js:83`).

**Tipo de noche en el Erg** (`GR:62-69`): sin lámpara (`gaveOil`, `lostOil` o `nightOil='all'`) → **dark**; con lámpara y `seen.tracks` → **ghost**; resto → **traveller**.

**El regreso (S19, 5 sellos en casa)** (`S13X:317-460`, `GR:85-111`): se lanza antes de S19 una vez (`needsReturn`). Menú: `rt_seals` (encajar los 5 sellos), `rt_ask` («why did the doors stay shut»; texto por `lieCaught/lieHeard`), `rt_keepers` (**solo si** `statues==='riddle'` y posee `falcon_weight` **e** `ibis_figure`) → entrega `statue_seal`, `rt_open`. **Final** = `GatesRoad.ending`: `keepers` (guardianes pagados) > `trusted` (`secret`: portillo del ala izquierda) > `bold` (puertas con estruendo y palomas) > `observer` (puertas sin ruido) > `humble` (el Sirviente baja, se inclina y abre). Si `coin` y no `keepers`: «The coin has done its work. Keep it as a memory.»

### 3.3 La noche en el Erg (`ERG`, `order_night_erg {done, kind, choice, boons}`)

| Noche | Opciones | Efecto |
|---|---|---|
| **traveller** (con lámpara) | `ask` «Ask what he knows of the road» · `share` «Share half the oil» · `all` «Give him all of it» · `refuse` «Refuse. We need every drop» | `share`: nota **`s14-shadow` 1**, `nightOil='shared'`, **`lamp_oil` pasa a «medio»** · `all`: `s14-shadow` 1 **+ `s14-sigil` 1**, `nightOil='all'`, **se pierde `lamp_oil`** (animación «relinquished») · `refuse`: `nightOil='kept'` · `ask`: solo texto |
| **ghost** (vio las huellas) | `follow` · `watch` · `call` | `follow`: `s14-shadow` 1 (`nightGhost='followed'`) · `watch`: `s14-sigil` 1 · `call`: nada |
| **dark** (sin aceite) | `cord` (solo con `blessing`, texto de medir con el cordón) · `keep` «Pole Star straight ahead» ✗ · `right` «14° to the right of the Pole Star» ✓ · `left` ✗ | `right`: `s14-sigil` 1, `nightStars`; `keep`/`left`: `nightLost` (S14: «I arrived with half a skin of water…») |

S14 también regala al llegar (`s14-sun-monolith.js:1112-1121`): con `blessing` → «I tied the Servant's red cord to my staff» + **`s14-sigil` 1**; con `nightLost`/`nightOil==='all'` una frase.

### 3.4 Sueño de 1998 y catalejo del puente

**Sueño** (`stations/s15b-stones-dream.js`, tras el paso 16; `order_stones_dream {done, skipped, why, radio, end}`): 3 placas, cada una termina en una pregunta de Hermes.
| Clave | Opciones (texto del botón) | Se lee |
|---|---|---|
| `why` «Why did he build it?» | `seeker` «For whoever would come after you» · `thread` «So you could find your own way back» · `grief` «Because you could not leave her without a marker» | `grief` → paso 23 («In the dream you said I raised those stones for her.»); las otras: nada |
| `radio` «Speak to the man by the fire» | `alone` «You are not alone out here» · `under` «Look under the stones» · `walk` «Keep walking. Someone will follow.» | solo la tarjeta final de la escena |
| `end` «What do I do with a thing like that?» | `hands` «Your hands remembered before you did» · `never` «You were never lost. You were surveying» · `finish` «Then finish what you began» | paso 17 (1.ª frase, 3 variantes) |
Sin ninguna nota de pista. «Skip» del tester guarda `{done:true, skipped:true}`.

**Catalejo** (`stations/s15c-bridge-spyglass.js`, al llegar a S16; `order_bridge_spyglass {done, choice}`): el jugador arrastra una lente y fija 7 hallazgos (`wagons`, `oilcloth`, `hairpin` = evento, `stone` 980, `boulders`, `tower`, `pillars`) + 1 secreto (`blue` 💙, «A smear of blue», sin hueco en el tracker). `pillars` → **`s16-song` 1**. Luego cuatro hombres a pie suben al puente:
| `choice` | Texto | Efecto |
|---|---|---|
| `cross` | «Cross now, before they reach the rim.» | piedra rodada; Hermes cruza a la vista (19: «the four on foot heard my stone») |
| `hide` | «Hide under the lip of the bridge.» | **`s16-sigil` 1**; 19: «walked over my head and found nothing» |
| `trail` | «Lay a false trail along the rim.» | rastro con un trozo de su capa azul; 19: «still hunt the blue cloth»; 33: «the rest of my blue cloak» |

### 3.5 Cairn I (resuelto / saltado) y su recuperación [CÓDIGO]
`order_cairn1_completed/found/bypassed/optimal`, `order_seal_cairn_1`, `order_cairn1_locked_until_3_cairns`, `order_dawn_choices[2]='bypassed'`.
- **Saltado**: no hay juego, el DAWN 3 cambia («Do not disturb the stones…», 26 h), el hilo del Chasm omite la opción 🐫, `isLockedTemp` puede bloquear el regreso.
- **Recuperación**: `checkServantCairnRequirement()` (`satchel-and-cairn-one.js:545`) la lanza al abrir S19 sin 5 sellos (`stations/s19-oracle-horizon.js:1108`) y el paso 28 espera (`HC:9270`). Si Silvia «Refuse», la puerta vuelve a abrirse al tener ≥2 de los sellos II–V.
- La **ceremonia de los cinco sellos** (una vez) se dispara cuando el 5.º llega a la Alforja; si salta Cairn I, al recuperarlo.
- Silvia: lo resolvió (16 movimientos, `order_cairn1_optimal` ausente).

### 3.6 Banderas → consumidores (tabla de cableado)

| Bandera / dato | Lo escribe | Lo leen |
|---|---|---|
| `order_gates_path` (`W.road()`) | 13B | Wire 10, 23, 35; `GatesRoad.ending`; frases de la escena de retorno |
| `regard` | 13B | `hoursFor`, Wire 28; `blessing` (≥3), `secret` (≥5) |
| `blessing` / `red_cord` | 13B | S14 (`s14-sigil` 1), Erg dark (`cord`), Wire 10, 23, 29, 33 |
| `coin` / `servant_coin` | 13B | `hoursFor` (−1 h), **S18 (`s18-proverb` 1)**, **S19 (`s19-sigil` 1)**, Wire 23, retorno |
| `lieCaught` | 13B | Wire 35, `confess()` |
| `gaveOil` / `lostOil` / `nightOil` | 13B, Erg | `hasLantern` → tipo de noche, relic `lamp_oil`, Wire 10 |
| `statues` | 13B observer | S14 (Ibis), `canPayKeepers` |
| `secret` | 13B | final `trusted` |
| `nightLost` / `nightStars` / `nightGhost` / `nightOil` | Erg | texto de S14; (`nightStars/nightGhost` no se leen) |
| `W.dream` | sueño | 17, 23 |
| `W.bridge` | catalejo | 19, 21, 33 |
| `order_monolith_gate_seal1` | Wire 8 / 13B | `sealsAtGates` y `gateSeal()` → todas las cuentas «N seals» y la telemetría |
| `order_cairn5_seals_at_altar` / `order_stele_seals_at_well` | Wire (pasos 22, 26) | pasos 24–28 |
| `order_satchel_expedition_item` | Wire 2 | Wire 4, `EclipseJourney` |
| `order_cartographer_title` | Wire 1 | solo `EclipseJourney` |

### 3.7 Resumen: qué finales / variantes produce cada elección y cómo reconvergen
- **No hay finales de historia distintos**; hay **variantes de texto** y **objetos/notas** que cambian de mano. La historia reconverge en: (1) **Station 14** (todos los caminos de las puertas), (2) **Station 19** (5 sellos + puertas de bronce con 5 finales de tono), (3) **Station 20+** (los textos de 33–35 releen el camino de las puertas y el catalejo).
- Variantes distinguibles hoy: 3 tonos (13B) × 3 noches × 5 finales de las puertas × 3 catalejo × 3 `end` × 3 objetos del paso 2 × 2 (Cairn I) hasta ≈ **2 400 combinaciones teóricas** de pequeñas frases; **ninguna cambia qué estaciones juega ni qué letras recibe**.
- Silvia hoy: `humble` + `blessing` + `secret` + `regard 5` + 10 h de cruce + `surveyor_compass` + Cairn I resuelto (seed `story-point.js`). Su noche en el Erg, sueño y catalejo: **NO DEFINIDO** (aún no los ha jugado: estaba al pie del Monolito el 12-nov y en el paso 13 el 16-nov, [DOC] `GAME_MASTER_GUIDE §3.1`).

---

## 4. INVENTARIO / SATCHEL

### 4.1 Cómo funciona [CÓDIGO]
- **Catálogo:** `SATCHEL_RELICS` (`HC:6273-6518`): `{id, name, category, image, origin, summary, lore}` (24 ids). `lamp_oil` es un *getter* con dos estados (`item_lamp_oil.png` lleno / `item_lamp_oil_half.png` si `nightOil==='shared'`).
- **Posesión:** `getOwnedRelicIds()` (`HC:6545-6582`) = base `['gilded_feather','order_wax_seal','surveyor_compass']` (**siempre**, incluida la brújula aunque Silvia eligiera flint o lente) + `order_inventory_relics` (+ copias `seeker_<perfil>_inventory_relics`) + objeto del paso 2 + **derivados de banderas** (`seal_cairn_1..5`, `mirror_fragment_1..3`, `tuning_pebble`, `signal_mirror`, `servant_key`, `gilded_star`, `water_skins`, `falcon_weight`) + `lamp_oil` (`syncLampOil`, `HC:6591`). Orden fijo `INVENTORY_ORDER` (`HC:6584`).
- **Altas/bajas:** `addRelicToInventory(id)` (`HC:6613`) · `removeRelicFromInventory`/`dropRelic(id)` (`HC:6625`; hoy solo lo llama el Erg (`all`) y el tester; en 13B el aceite se retira porque `syncLampOil` recalcula `hasLantern`). Los objetos de las escenas (13B, Erg) se encolan y muestran la tarjeta `openItemAcquiredModal`; perder uno muestra `showItemRelinquishedAnimation`.
- **UI:** cabecera «Cairns» con 5 huecos I–V (`satchel-and-cairn-one.js`); modal de inventario (16+ huecos, crece solo); cada objeto solo se **inspecciona** (nombre, categoría, origen, resumen, lore): **no existe acción «usar»**. Chip «ADDED TO THE SATCHEL» en el Wire solo en pasos 12/16/20/24/36/40/44.
- **Arte:** los 24 archivos referenciados **existen** (`web/assets/items/*`); `seal_cairn_1` reutiliza el boceto `assets/chat/sketch_cairn_one.webp` (no hay `item_seal_cairn_1`).

### 4.2 Tabla de objetos (24)

| id | Nombre | Arte | Cómo se obtiene | Dónde se usa | ¿Se gasta? | ¿Cambia algo de la historia? | Estado |
|---|---|---|---|---|---|---|---|
| `gilded_feather` | The Messenger's Gilded Feather | `item_gilded_feather.png` | Inicial (Constellation, sep) | solo inventario; [DOC] pista nº3 de Pope-E: una pluma gemela aparece en el marco del Espejo Vivo con el Fragmento I (`stage-mirror.js:223`, `.sm-feather`, sin texto) | no | no | ⚠️ huérfana (hay plan en S26 y en la revelación) |
| `order_wax_seal` | Scarlet Wax Seal of The Order | `item_order_wax_seal.png` | Inicial | solo inventario | no | no | ⚠️ huérfana |
| `surveyor_compass` | 1998 Brass Surveyor's Compass | `item_brass_compass.png` | siempre; opción del paso 2 | 1 frase del paso 4; citada en eventos de marcha | no | no | ⚠️ huérfana |
| `flint_tinder` | Ancient Flint & Juniper Tinder | `item_flint_tinder.png` | paso 2, opción 0 | 1 frase del paso 4 | no | no | ⚠️ huérfana |
| `spyglass_lens` | Scorched Spyglass Lens | `item_spyglass_lens.png` | paso 2, opción 2 | 1 frase del paso 4; su lore («ground… to calculate the path of the Grand Eclipse») nunca se usa | no | no | ⚠️ huérfana + promesa sin pagar |
| `seal_cairn_1` | The Seal of Cairn I · Wash River | `sketch_cairn_one.webp` | Cairn I (`order_seal_cairn_1`) | **puerta**: se muestra al Sirviente (13B), cuenta para S19 y la ceremonia | no | sí (puerta de S19) | ✅ |
| `seal_cairn_2..5` | Seals of Cairns II–V (Sun Monolith · Sandstone Labyrinth · Natural Bridge · Arch of the Solstice) | `item_seal_cairn_N.svg` | S14–S17 (flags) | cuentas del Wire («N of five»), ceremonia de 5 sellos, retorno a las puertas (se encajan) | no | sí (puerta de S19) | ✅ |
| `water_skins` | The Four Water Skins | `item_water_skins.png` | S13 | tarjeta de premio del Clepsydra | no | no | ⚠️ huérfana |
| `falcon_weight` | The Falcon Weight | `item_falcon_weight.png` | S13 | **solo** `canPayKeepers` (observer + estatuas + Ibis) | no se quita | solo rama observer | 🟡 condicional |
| `lamp_oil` | The Lamp Oil | `item_lamp_oil.png` / `_half.png` | alijo de Camp VIII (paso ≥8) | 13B (`oil`, duelo), Erg | **sí** (lleno → medio → 0) | sí: tipo de noche, texto | ✅ |
| `red_cord` | The Servant's Red Cord | `item_red_cord.png` | 13B `blessing` | S14 (`s14-sigil` 1, «twelve knots»), Erg dark (`cord`), Wire 10/23/29/33 | no | sí (nota + opción) | ✅ |
| `servant_coin` | The Servant's Coin | `item_servant_coin.png` | 13B `lc_dusk` | S18 (`s18-proverb` 1), S19 (`s19-sigil` 1), −1 h del cruce, Wire 23, retorno | no | sí | ✅ |
| `statue_seal` | The Seal of the Two Keepers | `item_statue_seal.png` | retorno 13B `rt_keepers` | nada («opens nothing the five did not») | — | no | ⚠️ huérfana |
| `ibis_figure` | The Brass Ibis | `item_ibis_figure.png` | S14 si `statues` (`s14:898`) | solo `canPayKeepers` | no se quita | solo rama observer | 🟡 condicional |
| `tuning_pebble` | The Tuning Pebble · Cairn IV | `item_tuning_pebble.webp` | S16 (`s16:1080`) | Wire 19–23 y 31 (texto) | no | no | ⚠️ huérfana |
| `signal_mirror` | The Signal Mirror · Cairn V | `item_signal_mirror.webp` | S17 (`s17:530`) | Wire 23 y 29 (texto; «responder a la luz») | no | no | ⚠️ huérfana |
| `servant_key` | The Servant's Key · Tower II | `item_servant_key.webp` | S18 (`s18:561`) | Wire 28–30 («the key in my hand»); apertura de la puerta de S19 es narrativa | no | no | ⚠️ huérfana tras S19 |
| `gilded_star` | The Gilded Star · Tower II | `item_gilded_star.webp` | S19 (`s19:346`) | cartela del cap. III; Wire 32 | no | no | ⚠️ huérfana |
| `mirror_fragment_1..3` | Fragments I–III of the Mirror | `item_mirror_fragment_N.svg` | S20–S22 (flags) | **Espejo Vivo** del mapa Path III (cada fragmento destella), cartelas, chips | no | sí (progreso al WHERE) | ✅ (IV–IX no existen) |

Recuento (24 ids): **uso mecánico 11** (`seal_cairn_1`, `seal_cairn_2..5` ×4, `lamp_oil`, `red_cord`, `servant_coin`, `mirror_fragment_1..3` ×3) · **condicionales 2** (`falcon_weight`, `ibis_figure`) · **huérfanos 11** (los de la lista de §4.3).

### 4.3 Objetos huérfanos o con promesa sin cumplir
> **Actualización 18-nov-2026:** esta sección describe el estado anterior. Desde A-49 (`GAME_MASTER_GUIDE.md` §5.0) los objetos del Desert Path se **usan y se gastan** con `relic-use.js` (bandeja «Hermes asks» + botón Use): aceite, espejo, lente y odres (S17 y marcha 22); moneda y halcón (S18); sellos, halcón + ibis y copia de los asaltantes (regreso a Tower II); llave, lámpara de los fundadores, moneda y guijarro (S19). Siguen sin uso: `gilded_feather`, `order_wax_seal`, `statue_seal`, `gilded_star` (Stage Path y Bóveda), `surveyor_compass`, `red_cord` y `flint_tinder`.
- **Huérfanos totales (solo texto o inventario):** `gilded_feather`, `order_wax_seal`, `surveyor_compass`, `flint_tinder`, `spyglass_lens`, `water_skins`, `statue_seal`, `tuning_pebble`, `signal_mirror`, `servant_key`, `gilded_star`.
- **Dependen de la rama «observer»:** `falcon_weight`, `ibis_figure`, `statue_seal` — la ruta *humble* de Silvia nunca los usará.
- **Después de S19 el Satchel no se usa para nada** (ni en S20–S22): los 3 fragmentos solo se *muestran* en el mapa. La Torre I (A-23…A-26) todavía no consume nada del inventario.
- Cada objeto solo se inspecciona: el jugador no puede «presentar» uno a un personaje ni combinarlo. [INFERENCIA] Es el límite del sistema: para dar uso futuro hay que **conectar objetos a salas** (nota de pista / línea del Wire / opción extra), como ya hacen `red_cord` y `servant_coin`. Propuestas en §8.2.

---

## 5. RECOMPENSAS POR ESTACIÓN (S01–S22 + escenas) Y EVALUACIÓN DEL REPARTO

### 5.1 Tabla de lo que gana Silvia (código; el Constellation S01–S09 está en `guide/01` y `A_constellation_foundations.md`)

«Asks» = preguntas de **Ask Hermes** (`FIELD_INQUIRIES`) que se desbloquean **al completar** (`INQUIRY_REQUIREMENTS`, `HC:5924`); entre paréntesis las que abre la escalera de pistas (nivel 2) y la de «despertar». Ledger: letra nueva (valor interno) y líneas.

| Estación | Glifo/letra (valor) | Líneas del Ledger | Sello | Reliquia / objeto | Cuaderno de Hermes | Asks | Otros |
|---|---|---|---|---|---|---|---|
| Tormenta (Wire 0–4) | — | — | — | uno de flint / lente (+ brújula) | — | 0 | tono, nombre |
| **Cairn I** | — | — | **Seal I** | `seal_cairn_1` | `cairn1` | 1 (al encontrarlo: stacking-rule) + 4 (chasm, cairns, seal-one, river-hunch) | hint `cairn1-stones` |
| **S10 Chasm** | **X** (15); R (3, pista) | `[X]+[E]=17` | — | — | `chasm` | 1 (salt-playa) | MIRAGE, mapa de pergamino |
| **S11 Playa** | **Q** (14) | `[T]−[A]=9`, `[Q]+[E]=16` | — | Surveyor's Balance (herramienta del Ledger) | `playa` | **0** | CRYSTAL |
| **S12 Lexicon** | **Z** (5) | `[R]×2=[F]`, `[O]−[Z]=18` | — | — | `lexicon` | **6** (desert-oracle, bc-ashes, oasis-steles, al-qibla, phoenix-sigil, four-wells) | PHOENIX, Al-Qibla, «BC Ashes» |
| **S13 Clepsydra** | — (comprobaciones) | `[P]−[A]=14`, `[Q]+[Z]=19` | — | `water_skins`, `falcon_weight`, `lamp_oil` | `clepsydra` | 2 (shadow-hours, falcon-weir) | marcha 6 h |
| **13B Puertas** | — | — | — | `red_cord` / `servant_coin` (según camino) | **ninguno** | 0 | camino, horas, regard |
| Erg (noche) | — | — | — | (pierde/reparte `lamp_oil`) | **ninguno** | 0 | notas gratis |
| **S14 Monolito** | **D (18), C (24)** | `[D]+[F]=24`, `[C]−[T]=8` | **Seal II** | `seal_cairn_2`; `ibis_figure` (cond.) | `s14` | 1 (cairn2-niche) (+1 «awake» walking-sun, +1 pista monolith-shadows) | mancha azul |
| Sueño 1998 | — | — | — | — | **ninguno** | 0 | respuestas |
| **S15 Laberinto** | **W (19), N (11)** | `[W]+[A]=26`, `[N]−[E]=9` | **Seal III** (+ opcionales Founders' Lamp, Raiders' Copy of the Survey) | `seal_cairn_3`, `founders_lamp`, `raiders_survey` | `s15` | 1 (cairn3-plate) (+2 pistas) | estrella dorada, campamento |
| Catalejo | — | — | — | — | **ninguno** | 0 | notas |
| **S16 Cairn IV** | **S (13), U (4)** | `[S]+[U]=17`, `[S]−[U]=9` | **Seal IV** | `seal_cairn_4`, `tuning_pebble` | `s16` | 1 (tuning-pebble) (+2) | código del disco |
| **S17 Arco** | **Y (25), L (1)** | `[Y]−[O]=2`, `[L]+[G]=23` | **Seal V** | `seal_cairn_5`, `signal_mirror` | `s17` | 1 (light-on-tower) (+3) | **ceremonia de 5 sellos** |
| **S18 Estela** | **H (20), M (9)** | `[H]−[U]=16`, `[M]+[T]=25` | — | `servant_key` | `s18` | 1 (servant-well) (+3) | el Sirviente vivo |
| **S19 Oráculo** | **I (10), J (8)** | `[I]+[E]=12`, `[I]+[J]=18` (**`[Z]+[D]=23` retirada**) | — | `gilded_star` | `s19` | **2** (oracle-aurelia, unsent-letter) (+3) | **WHEN 18–20 dic**, Aurelia revelada, Cartas de Aurelia, pestaña Stage/Path III, escena «Ledger completo» (26/26) |
| **S20 Máscaras** | — | — | — | `mirror_fragment_1` | `s20` | 2 (ash-note, camera-upside) (+2 pistas) | nota con ceniza (`note1`), pluma dorada en el Espejo, mensaje interceptado (paso 36) |
| **S21 Cámara oscura** | — | — | — | `mirror_fragment_2` | `s21` | 2 (camera-house, gallery-pins) | línea de la Mirror Speaker |
| **S22 Galería** | — (**antes `[J]×2=[T]`; retirado A-02**) | — | — | `mirror_fragment_3` | `s22` | 1 (gallery-niche) | **Carta I de Aurelia** (marzo 1970), «Listen, and answer» |

[CÓDIGO]: `CLUE_EQUATIONS` (`HC:3287-3317`) ya sin `gallery-jt` ni `oracle-zd`; `oracle-ij` = «The Line of the Shared Cell»; escena «Ledger completo» = `ledger-complete.js` (`order_ledger_complete_seen`). ⚠️ `docs/guide/04` y `C_stage_and_finale.md` aún describen `[J]×2=[T]` en S22 y `Z+D=23` en S19: ya **no** es así en código.

### 5.2 Evaluación del reparto
**Sobre-recompensadas** (≥ 9 recompensas discretas): **S19** (≈ 14: WHEN, Aurelia, I, J, 2 líneas, estrella, Cartas, pestaña Stage, escena 26/26, 2 asks) · **S12** (≈ 12: Z, 2 líneas, PHOENIX, Al-Qibla, BC Ashes, 6 asks) · **S17** (≈ 10: sello, espejo, Y, L, 2 líneas, ceremonia, 1 ask).
**Equilibradas** (5–8): S10, S11, S13, S14, S15, S16, S18.
**Pobres** (≤ 3): **S20, S21, S22** (fragmento + 1–2 asks; S22 + carta) y **13B / Erg / sueño / catalejo** (solo banderas y notas; sin página de cuaderno).
**Vacíos concretos:**
1. **S11** no desbloquea **ninguna** pregunta de Ask Hermes.
2. **S14–S18** solo desbloquean **1** pregunta al completar (las demás son pistas).
3. **S20–S22**: desde A-02 no tienen recompensa «de cálculo»; su único bien tangible es el fragmento, que **solo se muestra en el mapa**.
4. **Ningún premio de S20–S22 se usa en la sala siguiente** (a diferencia de `red_cord`/`coin`, que sí dan notas).
5. El cuaderno de Hermes (14 páginas) **no registra** 13B, Erg, sueño ni catalejo, que son las escenas con más decisiones.

### 5.3 Recompensas sin uso posterior (huérfanas) — resumen
Objetos: §4.3. Además: **Surveyor's Balance** (S11; la herramienta del Ledger sí se usa mientras el Ledger está incompleto, pero tras 26/26 no sirve); **`MIRAGE`** (pasa a ser solo palabra de paso); **`CRYSTAL`**, **`PHOENIX`** (palabras de paso de S11/S12, usadas solo allí); **Al-Qibla 194°/14°** (se vuelve a citar en Wire 6 y 10; ninguna sala posterior lo usa); la pestaña «Cartas de Aurelia» y las 3 cartas **sí** tienen consumidor (notas del Wire).

### 5.4 Promesas («chekhov's guns») y su pago

| Elemento | Dónde se promete | Pago | Estado |
|---|---|---|---|
| **Mancha de azul cobalto** | nicho de Cairn II (paso 11), sueño/catalejo (💙 «A smear of blue»), pasos 12–15, 19, 23 | Paso 31: «The gold stars, the lapis blue, the pebble in the pillar: hers too.»; manos azules de Aurelia (invariante) | ✅ pagada **solo en texto** (sin objeto) |
| **Estrella dorada de 8 puntas** (laberinto) | paso 15 | Paso 32: Aurelia pinta una; `gilded_star` | ✅ (objeto sin uso posterior) |
| **Tuning Pebble** | paso 19 («Someone tuned this canyon for me») | Paso 31 (una línea) | 🟡 pagada en una frase; **el objeto no tiene uso**; no se explica *cuándo* ni *cómo* Aurelia lo dejó en el pilar |
| **Signal Mirror** | S17 / paso 23 («Answer me») | responde a la luz de Aurelia (3 cortos, pausa, 2 largos) | ✅ narrativa; objeto sin uso después |
| **La luz de Torre II** y el «código de Aurelia» | pasos 23–27 | Paso 31/32 | ✅ |
| **Mujer velada que canta** | paso 17 (pastor) y evento `hp-veiled-woman` | Paso 29 («someone is humming… the same tune»); Aurelia | ✅ |
| **Cabra que se come la bitácora** | paso 17 (ask 17:i:0, opción 2) | — (invariante) | ✅ pero **condicional a elegir esa opción** |
| **Servant «listen for stone that knocks»** (la moneda) | 13B | S18 `knocks` + nota `s18-proverb` | ✅ |
| **Falcon Weight** («owed back at the gates») | S13 / 13B `sr_fi` | solo en el retorno si `statues` | 🟡 condicional (la ruta humble no lo paga) |
| **Brass Ibis** | 13B / S14 | `rt_keepers` → `statue_seal` («opens nothing the five did not») | 🟡 se paga con otro objeto sin uso |
| **Scorched Spyglass Lens** («ground to calculate the Grand Eclipse») | paso 2 | nunca | ❌ |
| **Pluma dorada (Gilded Feather)** | Constellation; pista nº3 de Pope-E | decorativa en el Espejo Vivo tras el Fragmento I; S26 (`reflection`) y revelación ⏳ | 🟡 |
| **Hueco vacío bajo el tablón en la casa estrecha** («dust still soft where something heavy lay») | paso 39 | nada | ❌ gancho abierto |
| **Aurelia susurrando hacia el extremo este de la galería** | pasos 43–44 | nada (¿las tres palabras?) | ❌ gancho abierto |
| **Regalo para el Sirviente** (`dry-rehearsal`: «Bring him a small gift… a smooth red stone») | marcha 26 | el paso 27 no lo menciona (`W.event` no lo lee) | ❌ |
| **Nota «Let her through»** y mensaje interceptado | pasos 35–36 | Pope-E (⏳ Torre I) | ⏳ |
| **Astrolabio «lee lo que miden los cairns» / 6 estrellas maestras** | pasos 19, 27 | Torre I (Alineación, A-25) | ⏳ |
| **Los 5 sellos «sewn into my coat»** | 23–28 | S19 (encajan en las puertas); luego sin uso | 🟡 |
| **Servant's Key** (ojo 5×5) | S18 / paso 28 | abre la escalera; nada después | 🟡 |

---

## 6. ASK HERMES: tabla de todas las preguntas y su desbloqueo

`FIELD_INQUIRIES` (`HC:5314-5777`, **66** preguntas prehechas: desert 39 · stage 8 · workshop 7 · astrolabe 7 · constellation 5) + «Previously on…» (`previously.js`, primera de la lista) + **Hermes's notes** (`EclipseHints.inquiries()`: una entrada `inq-hints-<id>-<nivel>` por escalera con nivel ≥1; 29 escaleras). Desbloqueo: `INQUIRY_UNLOCKS` (`HC:5890-5922`: clave → flag) + `INQUIRY_REQUIREMENTS` (`HC:5924-5967`); modo Carles las ve todas. Las respuestas son **siempre prehechas** (no hay texto libre). `order_field_inquiries_read` guarda las leídas.

**Siempre abiertas (23):**
`inq-shelter` (workshop) · `inq-map-quadrants` · `inq-raiders-astrolabe` (astrolabe) · `inq-dust-navigation` · `inq-teletype-wire` · `inq-three-laws` · `inq-1998-log` · `inq-languages` · `inq-eclipse-order` · `inq-three-towers` · `inq-true-name` · `inq-eclipse-script` · `inq-distant-light` · `inq-six-stars` · `inq-replica-flaws` · `inq-fourth-chamber` · `inq-ledger-how` · `inq-signal-meter` · `inq-safe-here` · `inq-journal-purpose` · `inq-great-silence` · `inq-wadi` · `inq-satchel`.

**Con requisito (43):**

| Pregunta (`id`) | Grupo | Requisito (`INQUIRY_UNLOCKS` → flag) |
|---|---|---|
| `inq-stacking-rule` «How do the stones of Cairn I work?» | desert | `cairn1found` → `order_cairn1_found` |
| `inq-chasm` · `inq-cairns` · `inq-seal-one` · `inq-river-hunch` | desert | `cairn1` → `order_cairn1_completed` |
| `inq-salt-playa` | desert | `chasm` → `order_whispering_chasm_completed` |
| `inq-desert-oracle` · `inq-bc-ashes` · `inq-oasis-steles` · `inq-al-qibla` · `inq-phoenix-sigil` · `inq-four-wells` | desert | `lexicon` → `order_desert_lexicon_completed` |
| `inq-shadow-hours` · `inq-falcon-weir` | desert / astrolabe | `clepsydra` → `order_oasis_clepsydra_completed` |
| `inq-monolith-shadows` | desert | `monolithHint` → `order_monolith_hint` (nivel 2 del ladder) |
| `inq-walking-sun` | desert | `monolithAwake` → `order_sun_monolith_awake` |
| `inq-cairn2-niche` | desert | `monolith` → `order_sun_monolith_completed` |
| `inq-labyrinth-arches` · `inq-torch-rounds` | desert | `labyrinthHint` → `order_labyrinth_hint` · `labyrinthTorches` → `order_labyrinth_torch_hint` |
| `inq-cairn3-plate` | desert | `labyrinth` → `order_sandstone_labyrinth_completed` |
| `inq-seven-echoes` · `inq-count-echo` | desert | `cairn4Hint` → `order_cairn4_hint` · `cairn4Count` → `order_cairn4_count_hint` |
| `inq-tuning-pebble` | desert | `cairn4` → `order_cairn_iv_completed` |
| `inq-midsummer-ray` · `inq-autumn-dawn` · `inq-light-code` | desert | `cairn5Hint` · `cairn5Dawn` · `cairn5Signal` (`order_cairn5_hint/_dawn_hint/_signal_hint`) |
| `inq-light-on-tower` | desert | `cairn5` → `order_arch_solstice_completed` |
| `inq-stele-stanzas` · `inq-stele-knocks` · `inq-burning-atrium` | desert | `steleHint` · `steleKnocks` · `steleFire` (`order_stele_hint/_knock_hint/_fire_hint`) |
| `inq-servant-well` | desert | `stele` → `order_polybius_stele_completed` |
| `inq-oracle-mirrors` · `inq-oracle-disc` · `inq-oracle-vow` | desert | `oracleHint` · `oracleDisc` · `oracleVow` (`order_oracle_hint/_disc_hint/_vow_hint`) |
| `inq-oracle-aurelia` · `inq-unsent-letter` (stage) | desert / **stage** | `oracle` → `order_oracle_horizon_completed` |
| `inq-masks-lie` · `inq-masks-halves` | stage | `masksHint` → `order_masks_hint` · `masksDraw` → `order_masks_draw_hint` |
| `inq-ash-note` · `inq-camera-upside` | stage | `masks` → `order_masks_gate_completed` |
| `inq-camera-house` · `inq-gallery-pins` | stage | `camera` → `order_camera_obscura_completed` |
| `inq-gallery-niche` | stage | `gallery` → `order_whispering_gallery_completed` |

Por grupo: desert 39 · stage 8 (`inq-unsent-letter`, `-masks-lie`, `-masks-halves`, `-ash-note`, `-camera-upside`, `-camera-house`, `-gallery-pins`, `-gallery-niche`).
**Observaciones:** (a) las **«preguntas de pista»** (2.º nivel de la escalera) son 16 de las 43: son una recompensa de **atascarse**, no de ganar. (b) `inq-unsent-letter` («Who wrote “The Unsent Letter”?») y `inq-camera-upside` se abren **antes** de la sala a la que sirven (la pregunta de S21 se abre al ganar S20). (c) **No hay preguntas para S23–S28** (`group: 'stage'` solo cubre hasta S22). (d) Los consejos de las notas de pista (Wire `W.hint`, escenas) aparecen aquí como «Hermes's notes · Station N, <título>». (e) Nombre ambiguo: **Ask Hermes** (pestaña, `tab-wire-inquiries`) ≠ **ask** (intervención de Silvia dentro de un texto, `{ask:[…]}`).

**Escaleras de pistas (29, `hint-ladder.js`)** — ids: `cairn1-stones`, `s10-chasm`, `s11-playa`, `s11-sump`, `s12-lexicon`, `s12-dial`, `s13-key`, `s13-visions`, `s13-wells`, `s14-sigil`, `s14-shadow`, `s15-sigil`, `s15-torches`, `s16-sigil`, `s16-song`, `s17-sigil`, `s17-dawn`, `s17-signal`, `s18-proverb`, `s18-knocks`, `s18-fire`, `s19-sigil`, `s19-disc`, `s19-vow`, `s20-word`, `s20-halves`, `s21-city`, `s22-focus`, `s22-echo`. Niveles: **1** tras 3 fallos o 10 min · **2** 6 o 20 · **3** 9 o 35 (minutos activos). **Concesiones de la historia** (`EclipseHints.grant(id, n)`): `s14-shadow` (Erg: share/all/follow; marcha `erg-first-shadows`), `s14-sigil` (Erg: all/watch/right; cordón al llegar a S14), `s15-torches` (Wire 13:1; marcha `shelf-watchman`), `s15-sigil` (Wire 13:2), `s16-song` (catalejo `pillars`; marcha `hp-storm`), `s16-sigil` (catalejo `hide`), `s17-dawn` (Wire 21:0), `s18-proverb` (moneda), `s19-sigil` (moneda), `s21-city` (Wire 37:1), `s22-focus` (Wire 41:1). Nunca dan la respuesta.

---

## 7. CARTAS DE AURELIA, CHRONICLES Y CUADERNO DE HERMES: qué existe y qué falta

### 7.1 Chronicles (`view-chronicles`, `web/index.html:1771-1900`)
- **Tarjetas fijas del Constellation:** Game 03 *The Celestial Flower* · Game 04 *The Observatory Raid* · (Game 06) *The Celestial Matrix* · Game 07 *The Zodiac Engine & Outpost Patrol* · Station 08 *The Midnight Calibration* · Game 09 *The Celestial Cipher* (6 tarjetas). **No hay tarjetas de Chronicles para el Desert ni el Stage**: ese papel lo hacen el cuaderno y las cartas.
- Debajo: **Aurelia's Letters** (`#aurelia-letters`, oculto hasta `order_oracle_horizon_completed`) y **Hermes's Field Notebook** (`#field-notebook`).

### 7.2 Cartas de Aurelia (`aurelia-letters.js`; `order_aurelia_letters {I:{at,step}}`)
| Carta | Fecha | Se abre al ganar | Cuaderno impreso | Contenido | Respuesta de Hermes |
|---|---|---|---|---|---|
| **I** | «The Alpine Observatory · March 1970» | **S22** (índice 2) ✅ | 21A | «You fell asleep over your tables again…», lapislázuli, Cassiopeia | «You read her letter. She found it this morning, sewn into the lining of her old coat…» |
| **II** | «December 1970» | **S25** (índice 5) ⏳ | 23B | «You carved twenty-four stars into brass for me…» (el disco) | «The second letter. The week of the disc…» |
| **III** | «August 1971» | **S27** (índice 7) ⏳ | 25B | «three short, a pause, two long… Answer me.» (la terraza) | «…It took me forty-five years to see that light, Silvia…» |
- Cada carta llega **sellada** (sobre con sello de cera partido «A|A»), la abre Silvia y Hermes responde en el **paso del Wire donde la abrió** (`notesAt(step)`). Ninguna habla del puente (reservado a la Torre I). Un reset del tester la vuelve a cerrar.
- ⚠️ `docs/guide/04` dice «S23/S25»; el código dice **S25 y S27**. Para que S23 y S24 no queden sin carta: ver §8.1.
- **Falta:** carta IV (el puente, hoja 27B, A-27) y el *consumidor* de las cartas al final (solo notas del Wire).

### 7.3 Cuaderno de Hermes (`field-journal.js`; `order_journal {id:{at,fails,notes,restarts,arrived}}`)
- **14 páginas** (`PAGES`): `cairn1, chasm, playa, lexicon, clepsydra, s14, s15, s16, s17, s18, s19, s20, s21, s22`. Cada una: fecha de resolución, título, nota en voz de Hermes, cita «(on the Field Wire)», lista «earned» (+ «Cipher Ledger: …»), párrafo «cómo lo resolviste» (fallos, notas, reinicios, tiempo desde que llegó), boceto.
- **Faltan** [CÓDIGO: `games()` viene de `TesterDesert.games`, y `gates`, el sueño, el catalejo y el Erg no tienen `PAGES`]: **13B Gates** (con etiquetas de camino), **Night Erg**, **Memoria de las piedras (sueño 1998)**, **Spyglass del puente**, **S23–S28**, **Torre I** (3 salas), **página de la revelación de Pope-E** con las fechas reales de cada pista (`order_ashes_clues`: `note1`, `feather`, `intercept` ya se guardan; `note2`, `reflection`, `note3` ⏳), **cuaderno de Aurelia IV** (27B).
- Consumidores de `order_journal`: `mirror-speaker.js` (hora, fallos, ritmo), `stage-pause.js` (hora de resolución), `journey-profile.js`, `aurelia-letters`.
- **Líneas de la Mirror Speaker** (`order_speaker_line_<nodo>`): se escribe una vez al abrirse la sala; compone hora + esfuerzo + ritmo + tono (`TONE`); no cambia después.

---

## 8. PROPUESTAS (**propuesta, sin aprobar** — nada de esta sección está decidido ni construido)

> Respetan las decisiones aprobadas del 16-nov (`GAME_MASTER_GUIDE §5.0`): A-02 (el Stage no da ecuaciones), A-08…A-22 (ceremonia de S28, melodía **FACADE**, reloj de S24 = asaltantes cortando cuerdas, palabra **ALWAYS** en S25, reflejo de espaldas de Pope-E con pluma dorada en S26, palabra **NORTH** en S27, fuga de Pope-E en el espejo de S28), A-12/D-21 (pausas 3·4·5·4·6·8 h), A-13…A-27 (Torre I), A-16 (los 4 detalles aprobados pasan a mensajes fijos). Las decisiones abiertas (D-18, D-19, D-20) se mantienen abiertas: aquí solo se ofrece material para decidirlas.

### 8.0 Principios que propongo
1. **Una decisión, una huella.** Cada elección o ask debe dejar al menos una de: (a) una nota de la escalera de pistas, (b) un objeto/valor de estado, (c) una línea concreta en un paso futuro, (d) una etiqueta de **tono** para el final. Lo que no deje huella se declara **C** en el guion (como hoy, pero a propósito).
2. **Ventaja o color, nunca puerta.** Ninguna rama del Wire puede dejar a Silvia sin poder jugar una sala. La única puerta heredada es «5 sellos para S19».
3. **Pagar lo prometido.** Cada gancho del §5.4 se cierra o se retira antes del final.
4. **Reutilizar mecanismos que ya existen** (`W.hint`, `W.choice/ask/event`, `addRelicToInventory`, `EclipseNotebook.clue`, `GatesRoad`-style) antes de inventar sistemas.
5. **Compatibilidad hacia atrás**: ids y nº de opciones de los pasos ya publicados no cambian.
6. **Agencia de Silvia (regla 7):** Hermes y Aurelia narran y contextualizan; la *idea* nunca la da Hermes. Las pistas de las notas no dan la respuesta.

### 8.1 Reparto de premios de S23 a S28 y la Torre I (hasta S28 sin matemáticas)

**Diagnóstico:** S20–S22 dan «fragmento + 1–2 asks». Sin ecuaciones, S23–S28 corren el riesgo de quedar **más pobres** que el Desierto. Propongo que **cada sala dé 4 cosas**: ① fragmento (fijo), ② **un objeto con uso posterior**, ③ **una huella de Aurelia o de Pope-E**, ④ **una página de cuaderno + 2 preguntas de Ask Hermes** (1 de pista + 1 al completar). Además cada sala da una **ventaja para la siguiente** (nota de pista o línea de Hermes) — la cadena de objetos hace que cada sala *importe* para la siguiente.

| Sala | Fragmento | **Objeto nuevo** (id propuesto) | Aurelia / Pope-E | Ask Hermes (2) | Página del cuaderno | **Uso posterior del objeto** |
|---|---|---|---|---|---|---|
| **S23** Automaton Orchestra | IV | **The Drum Pin** (`drum_pin`): una púa de hierro del cilindro | Aurelia recuerda al relojero (mem. 1) · **nota 2** de Pope-E: *«You were never only the seeker.»* (tarjeta bajo el atril, sello de ceniza) | `inq-orchestra-score` (pista) · `inq-orchestra-card` («Who left the card under the drum?») | `s23` (boceto de los 3 autómatas) | **S27**: encaja en el hueco donde Aurelia clavó su púa de hierro (25A) → nota 1 de `s27-*` + línea de Aurelia |
| **S24** Fly Tower | V | **The Cut Rope** (`cut_rope`): un cabo de cáñamo chamuscado | 22B ya impresa: Pope-E quemó las cuerdas en 1970 y «no pudo cruzar»; Aurelia reconoce la torre | `inq-fly-clinometer` (pista) · `inq-fly-ropes` («Who cut the ropes?») | `s24` | **S26**: «hilo de Ariadna»: Silvia puede marcar **un** callejón sin salida (una vez) |
| **S25** Shadow Theatre | VI | **The Twin Disc** (`twin_disc`): copia de bronce con tres aberturas (A-10) | **Carta II** de Aurelia (dic. 1970, el disco) | `inq-shadow-lamps` (pista del gesto, nunca el resultado) · `inq-twin-disc` («Why does her disc have three windows?») | `s25` | **Torre I · Alineación** (A-25): sirve de plantilla de los tres diales |
| **S26** Hall of Mirrors | VII | **The Golden Feather** (`golden_feather`; A-20) | reflejo de espaldas de Pope-E (`clue('reflection')`); cita de 24B de Hermes (1998) | `inq-hall-fold` (pista del doblez) · `inq-hall-reflection` («Who walked ahead of me?») | `s26` | **Revelación (A-15)**: se compara con la `gilded_feather` del principio; el cuaderno muestra las dos |
| **S27** Kaleidoscope Lantern | VIII | **The Amber Prism** (`amber_prism`): un prisma de cuarzo | **Carta III** de Aurelia (agosto 1971, la terraza) · **nota 3** de Pope-E («the key») | `inq-lantern-north` (pista) · `inq-lantern-note3` | `s27` | **Torre I · Observatorio** (A-23): una lente/prisma extra para restaurar la cúpula |
| **S28** Stage of the Mirror Speaker | IX | — (el 9.º fragmento *es* el premio; no se añade objeto) | último mensaje interceptado, sin comentario de Hermes (A-22) | `inq-stage-mirror` · `inq-stage-flight` | `s28` (los 9 dibujos en el orden en que los ganó, A-08) | — |

**Retro-ajuste opcional de S20–S22** (coste bajo: 1 entrada de catálogo + 1 SVG cada una): S20 **The Half-Mask** (la media máscara que dibujó) · S21 **The Obscura Lens** (el vidrio del agujero) · S22 **The Bronze Rose** (el pétalo de la rosa del suelo). Servirían de **piezas extra del Observatorio** (lente) y de la ceremonia de S28.

**Torre I (A-13, A-23…A-27) — reparto propuesto, abierto a D-19:**
| Estación | Recompensa principal | Recompensas secundarias propuestas |
|---|---|---|
| **Observatorio** (restaurar la cúpula con luz) | la cúpula vuelve a girar; aparece la puerta de la Bóveda | usa `signal_mirror`, `spyglass_lens`, `amber_prism`, `obscura_lens` si los tiene (cada uno = una pieza extra, opcional); página `t1` |
| **Cartas celestes** (reconstruir la carta quemada con las 6 estrellas nativas) | la carta completa; **página de la revelación de Pope-E** con fechas reales (`order_ashes_clues`) | `servant_key` abre el cajón de las cartas (Wire); el sello `order_wax_seal` se compara con el sello de ceniza ◐ invertido |
| **Alineación** (3 diales contra Pope-E) | **el Astrolabio** (A-14) + la memoria del puente de Aurelia (A-25) | `surveyor_compass` da el rumbo de un dial (siempre la tiene); `gilded_star` dispara el recuerdo de Aurelia; `twin_disc` como plantilla |
| **Bóveda** (5 diales: 52 · 26 · 72 · 38 · 50, A-26) | carta de Carles + sobre sellado (A-05) | los **5 sellos** (`seal_cairn_1..5`) como tapas de los 5 diales (eco del arco de las puertas); `servant_coin` (muesca «like a keyhole») abre el cajón del sobre; `statue_seal` abre una **«sexta puerta»** opcional (la placa de los guardianes: «A sixth door will open») solo para quien la tiene |

### 8.2 Uso futuro de los objetos huérfanos (todo opcional; nunca bloquea)

| Objeto | Uso propuesto | Dónde | Cómo se nota (efecto) |
|---|---|---|---|
| `surveyor_compass` (siempre poseída) | rumbo de un dial | Torre I · Alineación | línea de Hermes + nota 1 |
| `spyglass_lens` (solo si la eligió en el paso 2) | pieza óptica del Observatorio; paga el lore «Grand Eclipse» | Torre I · Observatorio | pieza extra |
| `flint_tinder` (si la eligió) | Hermes enciende la cúpula fría | Torre I · inicio del Observatorio | solo línea del Wire |
| `tuning_pebble` | «afinar» la nota de referencia | **S23** | nota 1 de `s23-score` gratis |
| `signal_mirror` | pieza reflectora; también «responder la luz de Aurelia» | Observatorio · **S27** (carta III) | pieza extra · momento emotivo |
| `falcon_weight` (siempre la tiene) | peso de calibración | **S24** | nota 1 de `s24-weights` («the falcon weighs exactly one unit») — sin cifras |
| `water_skins` | decisión de agua en la marcha de vuelta | Chasm Pass (Torre I) | evento con pregunta |
| `red_cord` (si lo tiene) | medir 20 pasos / el clinómetro | **S24 / S26** | nota 1 |
| `servant_coin` (si la tiene) | llave del sobre | Bóveda | cajón extra |
| `servant_key` | abre el cajón de las cartas | Cartas celestes | línea + atajo |
| `gilded_star` | dispara el recuerdo del puente | Alineación | escena |
| `statue_seal` / `ibis_figure` | «sexta puerta» | Bóveda | extra opcional |
| `gilded_feather` | comparación con la pluma de Pope-E | Revelación (A-15) | página del cuaderno |
| `order_wax_seal` | comparación con el sello de ceniza ◐ invertido | Revelación | página del cuaderno |
| `seal_cairn_1..5` | tapas de los 5 diales | Bóveda | estética + línea |
| `mirror_fragment_1..9` | ceremonia | S28 | (ya previsto) |
Para los objetos que Silvia **no** tenga (ramas), cada uso lleva una alternativa gratuita de la misma magnitud (p. ej. Hermes ofrece su propia nota). **Mecánica:** `W.has(id)` en los textos + `EclipseHints.grant`.

### 8.3 Cambios de motor para que las decisiones pesen (pequeños)
1. **`W.note(clave, valor)` / `W.get(clave)`** sobre una única clave `order_wire_flags` (JSON, viaja con la nube) para guardar lo que decidió en cada sala (p. ej. `s23.note2 = 'shared'|'hidden'|'traced'`) sin añadir claves nuevas por decisión. Añadir su limpieza a `wireForgetFrom` (`HC:7054`).
2. **Tono en todas las elecciones**: `tone:'warm|protective|tactical|analytic'` en cada elección principal (y, opcionalmente, en cada opción de ask) de los pasos 10–68, y ampliar `dominantTone` (`HC:7938`) a todos los pasos. Peso propuesto: elección principal 1, ask ½. Corregir el sesgo del paso 3 (suma siempre «tactical»). Así el «final por estilo de juego» (4 tonos × 5 piezas) tiene 40+ muestras en vez de 4–6.
3. **`W.has(id)` y `W.give(id)`** (envoltorios de `getOwnedRelicIds` y `addRelicToInventory`) para que el guion pueda adaptarse y dar objetos.
4. **Garantizar los 4 detalles aprobados** (cabra, «You are late.», manos azules de Aurelia, once horas de cama): sacarlos de los asks y ponerlos como beats fijos (A-16).
5. **`EclipseJourney.profile()`** debe leer `GatesRoad.tone()`, `flags()` (`regard`, `secret`, `coin`, `duel`, `statues`), `W.dream`, `W.bridge` y las notas de S23–S28.
6. **Notas del cuaderno** para 13B, Erg, sueño y catalejo, generadas desde el estado (`order_gates_flags`, `order_night_erg`, `order_stones_dream`, `order_bridge_spyglass`). Plantilla de la página 13B: «Road: *humble* · Regard +5 · The Servant’s red cord ✓ · A secret heard ✓ · Crossing: 10 h».
7. **Correcciones**: `S13B:1707` (no forzar `order_monolith_gate_seal1`; que la escena compruebe `order_seal_cairn_1`); `WSS:450` y `s22:1030` (quitar la mención a la línea del Ledger); limpiar `HERMES_TONE_MAP` (ids inexistentes).
8. **Smoke:** secciones para Cairn I saltado, 13B (un camino por tono), Erg (3 noches) y las nuevas salas; hoy ninguna cubre esas ramas (`web_smoke.py:4851`).

### 8.4 Plantillas de conversación para los pasos 45–68 (S23–S28) — **borrador, sin aprobar**

**Cómo leerlas.** Patrón de 4 pasos por sala: **A** (impar, apertura + 2 asks + 3 elecciones) → **B** (par, cierre; espera de la sala) → **C** (impar, balance + 2 asks + 3 elecciones) → **D** (par, cierre con reliquia y puerta de la siguiente). Se escriben completos A y C; B y D como líneas por variante. Longitudes del estándar: apertura 5–6 beats + 2 asks; réplica 2–3 beats. `[tono]` = etiqueta para `dominantTone` (§8.3.2). **Consecuencia** = lo que queda guardado (hint = `W.hint`; nota = `W.note`; obj = `W.give`). Los textos son inglés de novela, beats ≤150 car.; nada nombra el WHERE ni a Carles; Hermes **no** habla del mensaje interceptado. Las pistas de `W.hint` abren solo la nota 1 y nunca dan la respuesta. Ids de escalera propuestos: `sNN-*`.

#### S23 · The Automaton Orchestra (pasos 45–48) — puerta: pausa 3 h tras S22 (sin QR) · divisor «Tower III · The Automaton Orchestra»

**Paso 45 · apertura**
1. «The candles of the gallery burned out one by one, Silvia, and a little door opened on a hall full of musicians who are not alive.»
2. «A lute, a flute and a dulcimer, in pear wood and brass. Glass eyes. Hands that wait.»
3. «Between them, under the boards, lies a bronze drum bristling with iron pins. It turns a hair whenever I breathe.»
- **Ask 45:i:0** [Are they moving? · Is it safe to walk in? · Do they have faces?] → «Not while I look. The moment I turn, the flute-player’s head tilts.» · «The boards creak in tune. I take that as a yes.» · «Painted, and kind. Aurelia touched the flute-player’s cheek and said, ‘You were always late.’ Then she looked as if she had never spoken.»
4. «Six bells hang under the rail, cast with letters: C, D, E, F, G, A. Your page “The Automaton Orchestra” shows the same six.»
5. «Aurelia says the Order held that a song worth singing is worth singing twice: once forward, once in the glass.»
- **Ask 45:i:1** [Can you hear it already? · Does Aurelia know this song? · Do not touch anything yet.] → «Only the drum turning, like a very patient clock.» · «She hums three notes, stops, and says it was a draught.» · «My hands are in my pockets. They look innocent there.»
6. «Where do I begin?»

| Elección | silviaMsg | Réplica de Hermes | Consecuencia |
|---|---|---|---|
| 1 `[analytic]` «Read me the drum, row by row.» | «Read me the drum, Hermes, row by row, from the outer rim.» | «Outer rim first. Six rows to a measure, and some rows are bare.» · «I will say each row as I see it. You tell me which way the song runs.» · «The first row is in my log, and on its way to you.» | **hint `s23-score` 1** |
| 2 `[warm]` «Ask Aurelia who taught her this hall.» | «Ask Aurelia who showed her this hall, Hermes. She looks as if she knows it.» | «She did not answer at once. Then: ‘An old clockmaker. He let me wind the springs if I did not talk.’» · «She named the three musicians as if they were nephews.» · «I asked no more. Whatever she remembers is coming up gently.» | **nota `aurelia.orchestra`=true** → S27 (Aurelia recuerda al relojero al ver el engranaje) |
| 3 `[protective]` «Don’t touch the drum until I say.» | «Don’t touch the drum until I say so, Hermes. Not even to lean on it.» | «Hands in pockets, as promised. Aurelia looks at me like a child at a market.» · «Nothing will move until you say so. That is a comfort in a hall of puppets.» | **nota `s23.careful`=true** → la sala perdona el **primer** fallo (el juego la lee) |

**Paso 46 · cierre** (espera a S23: `order_automaton_orchestra_completed`). Base: «The six bells are tuned and the drum is waiting. I stand where the lute-player can see me.» Por elección: 1 → «Row one is in my log. The rest comes when you ask.» · 2 → «Aurelia has taken the flute-player’s hand. She is humming the first bar and does not know it.» · 3 → «My hands are still in my pockets. The floor hums under my boots like a held breath.» **Telemetría:** `✦ THE AUTOMATON ORCHESTRA · SIX BELLS · A DRUM OF IRON PINS · KEEP “THE AUTOMATON ORCHESTRA” CLOSE ✦`

**Paso 47 · balance (tras S23)**
1. «The drum turned and the little musicians played. I would swear the flute-player sighed.»
2. «It was a short tune, and it ended on a note that wanted another. Aurelia says that is how the Order ends a sentence it means to finish later.»
- **Ask 47:i:0** [What did it sound like? · Did Aurelia sing? · Were you frightened?] → «Like a house being drawn in notes, if that makes sense.» · «One line, quite out of tune. She laughed at herself.» · «Only when the drum started alone. Then I was too busy listening.»
3. «Fragment IV dropped out of the drum itself: warm, with a music stand inside it and one small candle.»
4. «And under the third music stand there was a card, on smoke-coloured paper, sealed with ash.»
5. «‘You were never only the seeker.’ In a fine, careful hand.»
6. «I know that sentence, Silvia. It was in your first letter from the Order. Nobody outside it should have read it.»
- **Ask 47:i:1** [Show me the card. · Burn it. · Is it the same hand as the first note?] → «Here it is, as I found it.» · «Not yet. A burnt card cannot be compared with the next.» · «The same ink, the same patience.»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[analytic]` «Then someone has read my first letter.» | «Then someone has read my first letter, Hermes.» | «Or someone close to the hand that wrote it.» · «I do not like either answer.» · «It goes into my coat with the other card.» | **nota `s23.note2`='traced'** → página de la revelación: «traced it to the letter at once» |
| 2 `[protective]` «Keep it from Aurelia. She has ghosts enough.» | «Keep it away from Aurelia, Hermes. She has ghosts enough.» | «Inside my coat, then. I will tell her when she is stronger.» · «I do not like keeping things from her. I like less what happens if I don’t.» | **nota `s23.note2`='hidden'** → S27: Aurelia dice «You have kept something from me, old man.» |
| 3 `[warm]` «Read it aloud to Aurelia.» | «Read it aloud to Aurelia, Hermes. She should hear it.» | «She listened with her eyes shut. ‘That is not a cruel sentence,’ she said. ‘It is a lonely one.’» · «I have not stopped thinking about that.» | **nota `s23.note2`='shared'** → carta III y revelación: Aurelia lo recuerda |

**Paso 48 · cierre** (chip `mirror_fragment_4`, `W.give('drum_pin')`). «I took one iron pin from the drum, Silvia, the way you take a stone from a place you mean to remember.» + 1 línea por la elección del 47. **Telemetría:** `✦ THE MELODY MIRRORED · FRAGMENT IV SET · 4 / 9 ✦` (sin letras del Ledger). Puerta: `holdForDoor(44, 'Fragment IV Is Set · 4 of 9', 'The Fly Tower (Station 24)', 48)` → pausa 4 h.

#### S24 · The Fly Tower (pasos 49–52) — pausa 4 h (sin QR) · «Tower III · The Fly Tower» · ambiente `night`

**Paso 49 · apertura**
1. «The stair ended in a tower of ropes, Silvia, so high my lamp never reaches the top.»
2. «Pulleys on pulleys, and a curtain like a sleeping sail. Two ropes hang cut, scorched at the ends.»
3. «Up in the dark someone is cutting more. One every half minute, and the curtain drops with each.»
- **Ask 49:i:0** [How high are you? · Can they see you? · Where is the curtain?] → «Higher than I like to say.» · «They see my lamp. I put it out. Now they see me not having a lamp.» · «Above me, and sinking.»
4. «On the cradle: three sandbags and one iron ingot. Your page “The Fly Tower” gives an angle, and no weights.»
5. «Aurelia is looking at the ropes the way you look at a face.»
- **Ask 49:i:1** [Why cut the ropes? · Can Aurelia help? · Don’t look down.] → «To stop us reaching the stage. Or to see if we can.» · «She has already taken hold of one.» · «I am looking at the ceiling. It is not much better.»
6. «Something heavy, someone steady, or a good count. What do I use?»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[tactical]` «Use something heavy you already carry.» | «You already carry something heavy, Hermes. What do you have that you know the weight of?» | con `W.has('falcon_weight')`: «The falcon. A weight with a name, from a spring that was not there.» · «In my palm it weighs what it should. I will tell you every ounce.»; sin él: «The ingot, then, and my own boots. We shall see.» | **hint `s24-weights` 1** (el peso del halcón sirve de unidad, sin cifras) |
| 2 `[warm]` «Let Aurelia take the ropes. She knows towers.» | «Let Aurelia take the rope, Hermes. She knows towers.» | «She took it like a hand she had held before. ‘I was here in 1970,’ she said. ‘It smelled of smoke.’» · «Then she looked at me, shocked at her own voice.» | **nota `aurelia.fly`='remembered'** + **holgura:** el primer corte llega 10 s más tarde (el juego lee `order_wire_flags['s24.slack']`) |
| 3 `[analytic]` «Count the cut ropes with me.» | «Count the cut ropes with me, Hermes. Two cut, how many whole?» | «Two cut, four whole. Each cut costs the curtain a share of its height.» · «The plumb-bob swings. Tell me when it stops.» | **hint `s24-clinometer` 1** |

**Paso 50 · cierre.** Base: «I climb to the west cradle. I will tell you only what I see: the plumb-bob, the arc, the sandbags.» + variantes (1: «The falcon sits on the rail where I can see it.» · 2: «Aurelia holds the rope. She is not afraid. She says so.» · 3: «Four ropes whole. I count them again.»). **Telemetría:** `✦ THE FLY TOWER · A CURTAIN AND FOUR ROPES · THE ASHES ARE CUTTING · KEEP “THE FLY TOWER” CLOSE ✦`

**Paso 51 · balance**
1. «The curtain rose. Smoothly, like a held breath let go.»
2. «The Ashes ran when it went up. They left their knives in the beams.»
- **Ask 51:i:0** [What is on the stage? · Did you fall? · Is Aurelia all right?] → «Painted dunes, and a sun on a wire.» · «Only my dignity.» · «She is sitting on the cradle with the rope in her lap.»
3. «On a beam, burned in with a hot wire: a circle cut by a stroke, and under it a date. 1970.»
4. «Somebody burned these ropes once before, Silvia. Before either of us was grown.»
- **Ask 51:i:1** [Who? · Was Aurelia here? · What does the circle mean?] → «The Ashes of those years had a leader with a title, not a name.» · «She says nothing, which says a lot.» · «The sign of the Ashes. A circle, cut in two.»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[analytic]` «Who burned the ropes in 1970?» | «Who burned the ropes in 1970, Hermes?» | «Aurelia says the Ashes’ leader of those years was called Pope-E.» · «He stood on this tower’s threshold and could not cross it.» · «Whoever he was, he stopped where I am standing.» | **nota `ashes.lore`=true**; abre `inq-fly-ropes` |
| 2 `[protective]` «Is Aurelia all right?» | «Is Aurelia all right? Look at her properly.» | «She said, ‘I was not afraid. I was angry.’ It is the first time I have heard her say so.» · «I sat beside her, and neither of us spoke.» | **nota `aurelia.fly`='angry'** (S27/Torre I) |
| 3 `[tactical]` «What is on the stage now?» | «What is on the stage now, Hermes? Anything for us?» | «A rail with three brass figures: a moon with a face, a tower, a masked man in a plumed hat.» · «Three lamps over them. Aurelia says the Order cast shadows there for a vow.» | **hint `s25-lamps` 1** |

**Paso 52 · cierre** (chip `mirror_fragment_5`; `W.give('cut_rope')`: «I kept the end of one cut rope. It is still warm.»). **Telemetría:** `✦ THE CURTAIN RAISED · FRAGMENT V SET · 5 / 9 ✦`. Puerta: pausa 5 h **+ sello QR de 23A** (A-11).

#### S25 · The Shadow Theatre (pasos 53–56) — pausa 5 h + sello 23A · «Tower III · The Shadow Theatre» · ambiente `lamp`

**Paso 53 · apertura**
1. «A small theatre inside the tower, Silvia: a stage the size of a table and three lamps hung from an iron rail.»
2. «Three brass figures wait on the beam: a crescent moon with a face, a tower with a door and two windows, a masked figure in a plumed hat.»
3. «Each lamp throws a different shadow on the wall. None of them agree.»
- **Ask 53:i:0** [Do the lamps burn? · Whose face is on the moon? · Does it look old?] → «Three small flames, steady as pulses.» · «Nobody’s. Everybody’s. It smiles at me.» · «Older than the tower, Aurelia says.»
4. «Aurelia says the Order called this room the place where a vow is said with a light behind it.»
5. «She asks you to hold the page “The Shadow Theatre” up to a lamp, and to look at what is behind it.»
- **Ask 53:i:1** [What vow? · Is she crying? · Do as she says.] → «She will not say it yet.» · «Not quite. Her eyes are very bright.» · «I will tell her you said yes.»
6. «She is looking at the page “The Disc and the Vow”. What shall I say?»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[analytic]` «Hold the page “The Shadow Theatre” up to a lamp.» | «Hold the page “The Shadow Theatre” up to a lamp, Hermes, and look at what is behind it.» | «Light through paper. One face prints itself on the other.» · «I will not tell you what. You can see it from where you sit.» | **hint `s25-lamps` 1** (solo el gesto, nunca el resultado) |
| 2 `[warm]` «Ask Aurelia to tell the story of the disc.» | «Ask Aurelia to tell the story of the disc, Hermes.» | «‘He carved twenty-four stars in brass,’ she said. ‘I cast a copy in bronze, with three windows, so that a light could count them on a wall.’» · «Twin discs. One for him, one for her.» | **nota `aurelia.disc`='told'** → reacción a la carta II y Torre I |
| 3 `[protective]` «Let her rest first. The lamps will keep.» | «Let her rest first, Hermes. The lamps will keep.» | «She slept ten minutes against my shoulder. The best ten minutes since Tower II.» | **nota `aurelia.rest`='s25'** → S26: «Aurelia is rested» (+ ella dice la primera frase de la sala) |

**Paso 54 · cierre.** Base: «The lamps are lit and the figures stand on the beam. I will move them when you tell me where.» Variantes por elección. **Telemetría:** `✦ THE SHADOW THEATRE · THREE LAMPS · THREE FIGURES · KEEP “THE SHADOW THEATRE” CLOSE ✦`

**Paso 55 · balance**
1. «The shadows made a word. Aurelia read it aloud before I could.»
2. «She said the first half of the vow, and then she wept, and then she laughed.»
- **Ask 55:i:0** [What was the word? · Did she say the rest? · Are the two discs alike?] → «You typed it, Silvia. You know.» · «Only half. She keeps the other half for the road.» · «Alike as two hands, and not alike as two faces.»
3. «Out of the wall, with a whisper like silk, came the twin disc: bronze, with three windows.»
4. «Aurelia says her letter of that winter remembers it better than she does.»
- **Ask 55:i:1** [Can I see it? · Is it heavy? · What do the windows frame?] → ...

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[warm]` «Tell Aurelia the vow is safe with us.» | «Tell Aurelia the vow is safe with us, Hermes.» | «She took my hand. ‘Then I may finish it,’ she said, ‘when I know it by heart again.’» | **nota `aurelia.vow`='kept'** (Torre I: ella termina el voto) |
| 2 `[analytic]` «What do the three windows frame?» | «What do the three windows frame, Hermes?» | «Three lamps, three windows. When they line up the wall shows a ring of twenty-four marks.» · «She says to ask again when the first tower is in sight.» | **nota `twin.windows`='asked'** → plantilla de la Alineación |
| 3 `[tactical]` «Take the twin disc. It may matter.» | «Take the twin disc, Hermes. It may matter later.» | «It rides next to the compass now. Lighter than it looks.» | **nota `twin.holder`='hermes'** (si no: Aurelia lo guarda y se lo entrega a Silvia en la Alineación) |

**Paso 56 · cierre** (chip `mirror_fragment_6`; `W.give('twin_disc')`; el motor añade la nota de Hermes a la **carta II** de Aurelia si la abrió). **Telemetría:** `✦ THE SHADOWS SPOKE · FRAGMENT VI SET · 6 / 9 ✦`. Puerta: pausa 4 h.

#### S26 · The Hall of Mirrors (pasos 57–60) — pausa 4 h (sin QR) · «Tower III · The Hall of Mirrors» · ambiente `night`

**Paso 57 · apertura**
1. «A long hall of glass, Silvia, with alcoves numbered along it: four, five, five, six.»
2. «My reflection walks beside me, a half-step late. Aurelia’s does not walk at all.»
3. «Aurelia stops at the door. ‘Do not look for your own face,’ she says. I wrote that on a page in 1998 and never knew why.»
- **Ask 57:i:0** [Can you see yourself? · How many mirrors? · Is there a way out?] → «Too often.» · «I stopped counting at forty.» · «At the east end, a small chamber. The rest is glass.»
4. «Far ahead in the glass, someone walks with his back to us. When I turn, the corridor is empty.»
5. «Aurelia says every mirror in this hall lies a little, and the best liars are the ones that agree with you.»
- **Ask 57:i:1** [Is he real? · Does Aurelia see him? · Is it safe?] → «Real as a reflection can be.» · «She says nothing.» · «No. Walk carefully.»
6. «How do I begin?»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[analytic]` «Fold the page “The Hall of Mirrors” down its middle.» | «Fold the page “The Hall of Mirrors” down its middle line, Hermes, and tell me what meets.» | «Folded. The two halves are very nearly twins.» · «Very nearly. One of them has a dark stone the other lacks.» | **hint `s26-fold` 1** (solo el gesto) |
| 2 `[protective]` «Do not follow anyone you cannot see.» | «Do not follow anyone you cannot see, Hermes. Not even a back.» | «Then we follow the plan, not the shadow.» · «Aurelia nodded, as if she had said the same.» | **nota `s26.follow`='refused'** + **hint `s26-candle` 1** (rechazar el camino que repite la vela) |
| 3 `[tactical]` «Tie the rope to the door and pay it out as you go.» | «Tie the rope to the door, Hermes, and pay it out as you go. Leave yourself a thread.» | con `W.has('cut_rope')`: «The cut rope of the Fly Tower. Longer than I thought.»; si no: «Chalk, then. A mark at every turn.» | **nota `s26.thread`=true** → el juego da **un** marcador de callejón sin salida (una vez) |

**Paso 58 · cierre.** Base: «I stand at the western door with the glass at my back. I will tell you each corridor as it opens.» **Telemetría:** `✦ THE HALL OF MIRRORS · TWENTY PACES · A PAGE TO FOLD · KEEP “THE HALL OF MIRRORS” CLOSE ✦`

**Paso 59 · balance** (`EclipseNotebook.clue('reflection')` se registra al mostrarlo)
1. «The figure walked the right way the whole time, and never turned his face.»
2. «At the exit he was gone. On the floor there was a feather.»
3. «Small. Gold. Very bright, as if it had just fallen.»
- **Ask 59:i:0** [Pick it up. · What does it look like? · Compare it with the feather in my satchel.] → «Warm, though nothing here is warm.» · «A pigeon’s feather, gilded at the tip.» · **«Of course. You carry its twin. I held them side by side in the lamp: the same gold, the same fold.»** (`W.note('s26.compared')`; **solo si Silvia lo pide** — es *su* deducción)
4. «Aurelia says the Ashes’ leader of 1970 never crossed the last threshold of this tower. She says it twice.»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[protective]` «Keep the feather safe.» | «Keep the feather safe, Hermes. Wrap it well.» | «In my scarf, beside the fragments. It weighs nothing at all.» | **obj `golden_feather`** + nota `s26.feather`='kept' |
| 2 `[tactical]` «Leave it where it lay.» | «Leave it where it lay, Hermes. Someone may come back for it.» | «I put it back exactly. Aurelia looked at me and did not argue.» | nota `s26.feather`='left' → Torre I: la pluma reaparece «waiting» |
| 3 `[analytic]` «Who walked ahead of us?» | «Who walked ahead of us, Hermes? Truly.» | «A reflection of someone who stood here long ago. Aurelia will not give his name again.» · «But he took the true road, Silvia, every turn. Whoever he is, he knows this tower better than we do.» | nota `s26.asked`=true; refuerza la pista 4 de Pope-E |

**Paso 60 · cierre** (chip `mirror_fragment_7`). **Telemetría:** `✦ THE HALL OF MIRRORS · THE WAY OUT FOUND · FRAGMENT VII SET · 7 / 9 ✦`. Puerta: pausa 6 h.

#### S27 · The Kaleidoscope Lantern (pasos 61–64) — pausa 6 h (sin QR) · «Tower III · The Kaleidoscope Lantern» · ambiente `lamp`

**Paso 61 · apertura**
1. «A lantern with eight sides, hung from the top of the dome, thirty paces over the stage.»
2. «Quartz prisms and a brass ring, and a wheel of gears, held by a single iron pin.»
- **Ask 61:i:0** [Can you reach it? · What is it made of? · Is Aurelia sad?] → «A rope and a great deal of faith.» · «Light, mostly. And brass.» · «Not sad. Listening.»
3. «Aurelia stands very still. ‘I did something here,’ she says. ‘With a pin.’»
4. «She turned the glass to the northern angle in 1970, she says, and locked it so no stranger could turn it again.»
- **Ask 61:i:1** [Whose pin? · Does she remember why? · Careful.] → «Hers.» · «For the stage. For the sky. For him, I think.» · «I am being careful, Silvia. I am old.»
5. «What do I try first?»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[warm]` «Ask Aurelia to tell you what she did.» | «Ask Aurelia to tell you what she did here, Hermes. Slowly.» | «She told it in pieces: the pin, the ladder, the smell of smoke.» · con `s23.note2='hidden'`: «Then she said, ‘You kept something from me, old man.’» · con `aurelia.orchestra`: «And the clockmaker taught her how a pin holds a wheel.» | lee **notas** de S23/S24 (texto) |
| 2 `[analytic]` «Turn the outer ring until the rays meet.» | «Turn the outer brass ring until the rays meet, Hermes.» | «The ring gives a hair. The rays crawl toward each other.» · «Not yet. Not yet.» | **hint `s27-ring` 1** |
| 3 `[tactical]` «Try the pin from the orchestra.» | «You took a pin from the drum, Hermes. Try it in the gear train.» | con `W.has('drum_pin')`: «It fits as if it were cast with it. The wheel gives a quarter turn.» · «Aurelia: ‘Same iron as mine.’»; sin él: «I have nothing that fits. I will need your eyes.» | **hint `s27-gears` 1** (solo con `drum_pin`) |

**Paso 62 · cierre.** **Telemetría:** `✦ THE KALEIDOSCOPE LANTERN · EIGHT SIDES · ONE IRON PIN · KEEP “THE KALEIDOSCOPE LANTERN” CLOSE ✦`

**Paso 63 · balance** (`clue('note3')` al mostrar la nota)
1. «The light came through, amber and green and rose, and wrote a word on the terrace wall. You know it. I will not say it.»
2. «Aurelia walked up to the terrace. The whole sky was there, as full as in her letter.»
3. «She raised her hand and flashed three short, a pause, two long. At nobody. At the sky.»
- **Ask 63:i:0** [Answer her. · Did she say anything? · Will she remember the bridge?] → «Not yet. Let me look at her.» · «Not a word. I have promised not to say the word, and I will not.» · «The Servant said: from below, and slowly.»
4. «Under a stone on the parapet there was a third card. The same careful hand. ‘…the key…’ Words burnt away on either side.»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[warm]` «Answer her light: three short, a pause, two long.» | «Answer her light, Hermes. Three short, a pause, two long.» | con `W.has('signal_mirror')`: «I raised the mirror from Cairn V and sent it back to her.» · «She turned. For the first time since the desert, she looked at me and knew me.» | **nota `s27.answered`=true** → Torre I (recuerdo del puente más suave) |
| 2 `[protective]` «Don’t make her say it. Let her come to it herself.» | «Don’t make her say it, Hermes. Let her come to it herself.» | «I sat beside her on the parapet and said nothing. It was the right thing, and the hardest.» | **nota `s27.bridge`='gentle'** → Torre I: Aurelia se lo agradece |
| 3 `[analytic]` «Read me the third card.» | «Read me the third card, Hermes. Word for word.» | «‘The key.’ And the same careful hand, and nothing else.» · «The Order’s oldest oath ends on that word. I do not like finding it in this hand.» | **nota `s27.note3`='read'** (revelación) |

**Paso 64 · cierre** (chip `mirror_fragment_8`; `W.give('amber_prism')`: «A quartz prism from the lantern is warm in my pocket. A piece of the sky, for later.»). **Telemetría:** `✦ THE LANTERN LIT THE TERRACE · FRAGMENT VIII SET · 8 / 9 ✦`. Puerta: pausa 8 h.

#### S28 · The Stage of the Mirror Speaker (pasos 65–68) — pausa 8 h (sin QR) · «Tower III · The Stage of the Mirror Speaker» · ambiente `lamp`

**Paso 65 · apertura**
1. «The last door opens on the stage itself, Silvia. At the far end, the frame of the great mirror stands empty.»
2. «Nine dark hollows. Eight pieces under my arm. The ninth is in your hands.»
- **Ask 65:i:0** [Is the Mirror Speaker here? · How big is the frame? · Do your hands shake?] → «She is only a reflection, and not even that yet.» · «Taller than the door I came in by.» · «Both of them.»
3. «Aurelia has not spoken since the terrace. She is standing very straight.»
4. «Every piece remembers the room it came from. The pictures in them are the way home.»
- **Ask 65:i:1** [In what order? · Do you remember each room? · Where do I stand?] → «The order we earned them. The glass will not accept another.» · «Every one, and I will not forget the dark room.» · «Where the light falls. The stage will show you.»
5. «Who places the first piece?»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[warm]` «Let Aurelia place the first piece.» | «Let Aurelia place the first piece, Hermes. She has earned it.» | «She laid Fragment I in its hollow without looking at the picture. She knew.» · «And she said the first words of the liturgy aloud.» | **nota `s28.first`='aurelia'** → la ceremonia incluye su línea |
| 2 `[analytic]` «Study each fragment’s picture first.» | «Study each fragment’s picture first, Hermes. Tell me what each one shows.» | «A moon. A window with a candle. An arch and a balcony…» · «Each picture is the room it came from. Put them in order and the glass will do the rest.» | **hint `s28-order` 1** (el dibujo de cada pieza = la sala; sin teclear) |
| 3 `[tactical]` «Keep watch at the door. The Ashes may come.» | «Keep watch at the door, Hermes. If the Ashes come, I want to hear them first.» | «At the door, then, with my back to the glass.» · «I will see whatever comes, and the mirror will see me seeing it.» | **nota `s28.witness`='hermes'** → en la fuga de Pope-E (A-22) Hermes la ve desde la puerta |

**Paso 66 · cierre.** **Telemetría:** `✦ THE LAST DOOR · NINE HOLLOWS IN THE FRAME · KEEP “THE STAGE OF THE MIRROR SPEAKER” CLOSE ✦`

**Paso 67 · balance** (tras la ceremonia web; el WHERE lo muestra el espejo, el Wire solo lo nombra si Silvia pregunta)
1. «The ninth piece clicked, and the mirror woke.»
2. «It showed the stage, and behind the stage a long building with arches like a row of open mouths.»
- **Ask 67:i:0** [Describe the building. · I know that building. · Does anyone walk in it?] → «Five arches. Steps. A great door. Stone that looks as if it were dancing.» · «Then say its name, Silvia. The glass is yours.» · «At the top of the steps, a man with a bundle in cloth. Brass shows at a corner. He does not turn.»
3. «Aurelia says the Astrolabe is going up to the peaks, to the place where it began: the first tower.»
4. «We have the seals, the charts and nine pieces of glass. They have one instrument and a head start.»
- **Ask 67:i:1** [Are you all right? · Is Aurelia coming? · Did you hear that crackle on the wire?] → «Tired, and glad.» · «She never asked. She informed me.» · «Which one? I hear many.»

| Elección | silviaMsg | Réplica | Consecuencia |
|---|---|---|---|
| 1 `[warm]` «We go to the peaks together, the three of us.» | «We go to the peaks together, Hermes. The three of us.» | «The three of us, then, and the navigator on the wire.» · «Aurelia took my arm. She has not let go.» | **nota `return.company`='aurelia'**; marcha de vuelta **estándar** |
| 2 `[tactical]` «He took it again. We end this, quickly.» | «He took it again, Hermes. We end this. Quickly.» | «Quickly, then. No camp, no fire.» · «I will pay for it in my knees, but I will not pay for it in days.» | **`return.pace`='fast'**: la marcha dura **3 h menos** y trae un evento de «storm» |
| 3 `[protective]` «Rest a night first. The mountain will wait.» | «Rest a night first, Hermes. The mountain will wait.» | «One night. Aurelia is already making a bed of her coat.» · «She says she will draw me a map of the terrace, from memory.» | **`return.rest`=true**: **+0 h** y una escena nocturna con una página nueva del cuaderno (boceto de Aurelia) |

**Paso 68 · cierre** (chip `mirror_fragment_9`; ceremonia que cierra el capítulo V y abre «VI · The Return · Tower I»). **Telemetría:** `✦ THE MIRROR WOKE · FRAGMENT IX SET · 9 / 9 · THE PEAKS AWAIT ✦` (sin el nombre del WHERE).

#### Comprobaciones de consistencia de las plantillas (hecho/propuesta)
- Cada **elección** del paso A y C deja una huella distinta (hint · nota · objeto · tono); ningún ask es obligatorio: toda **información necesaria** va en beats fijos (A-16).
- Ninguna plantilla da valores de letras (A-02) ni nombra al WHERE antes de S28; la «nota 2» es la cita de la Carta del Umbral (pista 2 de Pope-E) sin decir quién la escribió; la pluma de S26 se **compara por decisión de Silvia** (agencia, regla 7).
- Las asimetrías (`W.has`) siempre tienen texto por defecto: nada exige poseer un objeto.

### 8.5 Caras impresas sin juego → impacto en la web (Brief 2: «cada página debe tener impacto») — **propuesta**

| Cara impresa (título) | Qué es | Impacto web **hoy** [CÓDIGO] | Impacto propuesto |
|---|---|---|---|
| 08A «The Desert · Of Sun, Silence, and Buried Stone» | lore + Cairn I solo en web | ✅ Cairn I (juego) | — |
| 13A «At the Gates of Tower II» | el Sirviente y los 5 Cairns | ✅ escena 13B | página `13B` del cuaderno con las etiquetas del camino (§8.3.6) |
| 14A «The Five Geodetic Cairns» | Memoria de las piedras | ✅ sueño de 1998 | página del cuaderno `dream` (texto de lo contestado) |
| 15B+16A «The Natural Bridge…» / «The Eastern Buttress…» | catalejo | ✅ escena | página `spyglass` + `W.bridge()` ya leído |
| 17B (audiencia con el Oráculo) · 18B (arte de transición) | lore | 🟡 Wire 31 y ceremonia III→IV | NO DEFINIDO; propongo cartela de capítulo con la lámina |
| 19A «The Unsent Letter» | carta del Oráculo a la Mirror Speaker, al revés | ✅ Wire 33 (pide abrir la página) + `inq-unsent-letter` | — |
| 21A «The Alpine Memories» | cuaderno de Aurelia I | ✅ **Carta I** (S22) | — |
| **22B «The Ashes Before Christ»** | Pope-E 1970, nota firmada y pluma | ❌ ninguno | paso 51 (nota `ashes.lore`) + `inq-fly-ropes` + página `s24` |
| **23B «The Disc and the Vow»** | cuaderno de Aurelia II, trasluz | ⏳ Carta II (S25) | **Twin Disc** + paso 55 + carta II |
| **24B «The Doctrine of the Mirror Speaker»** | Pope-E quemó las cuerdas; Hermes 1998: «Do not look for your own face» | ❌ ninguno | pasos 57–59 citan la frase; `clue('reflection')` |
| **25B «The Terrace Under the Stars»** | cuaderno de Aurelia III | ⏳ Carta III (S27) | paso 63 (respuesta a la luz) |
| **26B «Back to the Peaks»** | puente a la Torre I | ❌ ninguno | paso 67–68 y capítulo VI del Wire |
| 27A/27B/28A/28B (previstas, A-27) | Torre I y final | ⏳ | Observatorio, cuaderno de Aurelia IV (el puente), Cartas celestes + Alineación, hoja final de la Orden |

---

## 9. (a) LISTA DE CONFLICTOS

| Tema | Fuente A | Fuente B | Cuál parece vigente y por qué |
|---|---|---|---|
| Qué sala abre las cartas II y III de Aurelia | `docs/guide/04` (≈l. 219): «las cartas II y III se abren con S23/S25» | `aurelia-letters.js:44-62` `room: 5` y `room: 7` = **S25 y S27** (`StageMirror.stations`) | **Código** (el índice 5 = S25 y 7 = S27); S23 y S24 no tienen carta |
| Ledger de S19 | `B_desert.md §4.1`, `docs/guide/04`: `[Z]+[D]=23` + `[I]+[E]=12` | `HC:3315-3316`: `oracle-ie` + **`oracle-ij` (`[I]+[J]=18`)**, sin `oracle-zd` | **Código** + A-01 (decisión 16-nov) |
| Ledger de S22 | `C_stage_and_finale.md`, `CANONICAL §7.B.13`: `[J]×2=[T]` (`gallery-jt`) | `HC:3287-3317` ya no la tiene; `s22:12` («no Ledger line») | **Código** + A-02; restos: `WSS:450`, `s22:1030` |
| Nombre dado a Hermes (paso 1) | `B_desert.md §1.4`, DB: «fija cómo se le llama en toda la partida» | `HC:6256-6266` (`WIRE_CONTACT_NAME='Hermes'`) | **Código**; la opción solo vive en `EclipseJourney.profile().name` |
| Los 4 detalles «aprobados» (cabra, «You are late.», manos azules, once horas) | DB:372 «invariantes» | están **dentro de asks opcionales** (`17:i:0`, `27:i:0`, `31:i:1`, `33:i:0`) | **Conflicto de diseño** (A-16 propone hacerlos beats fijos) |
| Número de escaleras de pistas | `docs/guide/04`: «notas de 31 escaleras» | `EclipseHints.define` → **29** ids (§6) | **Código (29)** |
| `order_monolith_gate_seal1` | `HC:7241` (`rememberGateSeal`): guarda la verdad (`false` si no hay Seal I) | `S13B:979,1707`: lo fuerza a `'true'` | **Bug probable** (ver §0.8) |
| Mensajes de los pasos 33–44 en `hub-core.js:5032-5209` | texto antiguo en `EXPEDITION_THREAD` | texto vigente en `WSS` (lo pisa `applyWireScript`) | **WSS**; `GAME_MASTER_GUIDE §5.2.D` ya lo marca como código muerto |
| Tono: ids inexistentes | `HERMES_TONE_MAP` incluye `choice-3-bearing-encouraging/-cautious` | el paso 3 solo tiene `choice-3-bearing-direct` | **Código** (restos) |
| Chip de reliquia en el Wire | DB: «Cuando Hermes dice que tiene uno… `WIRE_FINAL_RELIC`» | solo 7 pasos; `servant_key`, `gilded_star`, `tuning_pebble`, `signal_mirror` no tienen chip | **Código** (hueco, no conflicto) |
| «Satchel crece… 16 huecos» | DB | `getOwnedRelicIds` devuelve 24 posibles | coherente |

## 9. (b) LISTA DE HUECOS (qué falta definir o construir)

1. **Pasos 45–68 del Wire**: guion, carcasas en `EXPEDITION_THREAD`, telemetrías, chips, `WIRE_CHAPTER_CARDS[4]`, ceremonias, `holdForDoor` por sala (§1.6, §8.4).
2. **Notas del cuaderno** para 13B, Erg, sueño, catalejo, S23–S28 y la revelación de Pope-E; **cuaderno de Aurelia IV** (27B).
3. **Tono en el Wire de S14 en adelante** (el final por estilo de juego hoy solo tiene 4–6 muestras).
4. **Los 4 detalles aprobados**: moverlos a beats fijos (A-16).
5. **Ganchos abiertos**: hueco bajo el tablón (paso 39), susurro de Aurelia al este (paso 43), regalo al Sirviente (marcha 26), lente del catalejo, explicación del guijarro, pluma dorada (S26).
6. **Objetos huérfanos** (11) y **objetos nuevos** (§8.1) con arte (SVG/WebP en `web/assets/items/`), lore y `SATCHEL_RELICS`.
7. **Chips** de `servant_key` (28) y `gilded_star` (32).
8. **Ask Hermes para S23–S28** y para Torre I (`group: 'stage'` / nuevo grupo) + `INQUIRY_UNLOCKS/REQUIREMENTS`.
9. **Smoke** para Cairn I saltado, 13B por tono, Erg ×3, sueño con las 3 `end`, catalejo ×3 y las salas nuevas.
10. **Decisión de producto:** ¿el cuaderno y el final deben leer las banderas de 13B (camino, regard, cordón, moneda, duelo, estatuas)? (D-nuevo propuesto).
11. **Bug**: `order_monolith_gate_seal1` forzado a `true`; restos de la línea del Ledger en S22 (`WSS:450`, `s22:1030`).
12. **Respuestas reales de Silvia a CW2–CW5**, Erg, sueño y catalejo: NO DEFINIDO (no jugados aún / no están en el seed `story-point.js`).

## 9. (c) DATOS TRANSVERSALES

- **Paridad de pasos**: impar ≥9 = conversación (3 opciones), par = cierre; 9 es solo divisor. Pasos 0–8: texto único largo; ≥10: beats + asks.
- **Orden de claves de un ask**: `paso:parte:índice` con `parte ∈ {i, f, r0, r1, r2}`; un ask dentro de una réplica va en `r<n>`.
- **Límites de escritura:** beat ≤150 car.; apertura ≤6 beats + 1–2 asks; final 2–3; réplica 2–3 (DB:370).
- **Tiempos reales ya fijados** (espera tras completar la estación): S14→S15 6 h · S15→S16 18 h · S16→S17 18 h · S17→S18 6 h · S19→S20 18 h · S20→S21 3 h · S21→S22 6 h; cruce de las puertas 9–14 h; Camp VIII→Puertas 6 h; amanecer→Chasm 26 h (`CHASM_MARCH_HOURS`, `HC:7968`).
- **Qué cuenta como «sellos» en el Wire:** `W.seals()` (ahora), `gateSeal()` (congelado al salir de Camp VIII), `order_cairn5_seals_at_altar`, `order_stele_seals_at_well` (congelados).
- **Quién escribe en `order_field_wire_choices`:** solo el Wire (y `setWire` del tester, que rellena `[2,0,1,0]` + ceros y marca `order_field_wire_completed`).
- **Lo que nunca se guarda:** el contenido de las réplicas (se recalcula); por eso un cambio de texto en un guion cambia el pasado visible de Silvia.
- **Reglas del Operador que afectan al Wire:** inglés claro; páginas por título entre comillas curvas; Hermes nunca oye el mensaje interceptado; el Stage no da ecuaciones (A-02); Silvia nunca ve valores del Ledger (Regla 9).
- **Datos de Silvia en el repo** (`story-point.js`, 12-nov): `order_field_wire_choices=[2,0,1,0,null,0,null,0]`, `order_dawn_choices=[1,1]`, camino `humble`, `regard 5`, `blessing`, `secret`, 10 h.
