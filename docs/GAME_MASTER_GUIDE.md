# GAME MASTER GUIDE · Silvia's 23

> **Guía definitiva y global del juego.** Dice qué es el juego, en qué estado está cada página y cada estación, qué recompensa da cada una y **qué falta exactamente para terminarlo**.
> **Estado auditado:** 16-nov-2026 · repo en `ec7ce59` (+ cambios sin commit de `CLAUDE.md`, `AGENTS.md`, `docs/DESERT_ODYSSEY_BIBLE.md`).
> **Fuente de la auditoría:** lectura completa de las 17 guías de `docs/`, `PROJECT_MASTER.md`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.agents/rules/`, y contraste con el código del Hub (`web/hub/js/**`), los scripts del diario (`scripts/journal/**`), los PDF/maquetas (`journal/**`) y los correos (`emails/**`).
> **Entrada obligatoria:** [CLAUDE.md](../CLAUDE.md) §1 y [AGENTS.md](../AGENTS.md) remiten aquí en primer lugar.

---

## 0. Cómo usar esta guía (agentes y Operador)

### 0.1 Jerarquía de verdad (de mayor a menor)
1. **El papel ya impreso y entregado a Silvia** (hojas 1–26): es inmutable. Si una guía o el código lo contradicen, se corrige la guía o la web, nunca el papel.
2. **El código** (`web/hub/js/**`, flags `order_*`): dice lo que el juego hace de verdad hoy.
3. **Esta guía y sus 4 anexos** (`docs/guide/`): estado y decisiones consolidadas.
4. **Las Biblias** ([CANONICAL](CANONICAL_LORE_AND_VOCABULARY_AUDIT.md), [DESERT](DESERT_ODYSSEY_BIBLE.md), [STAGE](STAGE_PATH_BIBLE.md)): lore y diseño; **dentro de cada una, la última decisión fechada gana**.
5. Documentos históricos (ver §8): solo contexto.

### 0.2 Mapa de esta guía
| Archivo | Contenido | Cuándo leerlo |
|---|---|---|
| **Este archivo** | Premisa, mapa global de estaciones, Ledger, calendario, **lo que falta**, decisiones pendientes, conflictos resueltos, registro de documentos, Definition of Done | Siempre, primero |
| [guide/01_FOUNDATIONS_AND_CONSTELLATION.md](guide/01_FOUNDATIONS_AND_CONSTELLATION.md) | Premisa, cronología 1970–2026, personajes, emails enviados, Eclipse Script, estaciones 01–09, tormenta de arena | Tocar lore base, emails, glifos o Constellation |
| [guide/02_DESERT_PATH.md](guide/02_DESERT_PATH.md) | Estaciones 10–19 + escenas extra, marchas, Field Wire 0–32, hojas 08–18, sellos, Cairns, satchel | Tocar el Desierto o el Wire de esa parte |
| [guide/03_STAGE_PATH_AND_FINALE.md](guide/03_STAGE_PATH_AND_FINALE.md) | Estaciones 20–28 (construidas y por construir), Pope-E, Aurelia, Torre I, Bóveda, backlog de ideas | **Construir S23–S28 o el final** |
| [guide/04_SYSTEMS_AND_DOC_AUDIT.md](guide/04_SYSTEMS_AND_DOC_AUDIT.md) | Sistemas del Hub (Ledger, satchel, Wire, pistas, nube…), verificación, registro de los 36 documentos | Tocar código transversal o documentación |
| [guide/05_PAGE_IMPACT_MATRIX.md](guide/05_PAGE_IMPACT_MATRIX.md) | Impacto en la web de cada una de las 52 caras del Journal (+ 4 nuevas), 15 propuestas de impacto | Dar impacto a una página; diseñar 27A–28B |
| [guide/06_GAMES_CATALOG_AND_ENGINE.md](guide/06_GAMES_CATALOG_AND_ENGINE.md) | Qué es cada juego, cómo se juega, motor gráfico, mecánicas, pistas; **§3 patrones del motor** y **§4.2–4.3 fichas de construcción de S23–S28 y de la Torre I** | **Construir cualquier juego nuevo** |
| [guide/07_WIRE_INVENTORY_REWARDS.md](guide/07_WIRE_INVENTORY_REWARDS.md) | Field Wire como sistema, mapa de decisiones y consecuencias paso a paso, caminos de la historia, inventario (24 objetos), reparto de premios, Ask Hermes, plantillas de los pasos 45–68 | **Escribir Wire, objetos y premios** |

### 0.3 Reglas de uso
- **Nada de lo que está aquí se resume de memoria**: si va a editar una estación, lea su ficha en el anexo y compruebe el código citado.
- **Cualquier cambio que afecte a lo que cuenta esta guía** (nueva estación, flag, letra, hoja, paso del Wire, fecha) se refleja aquí **en el mismo turno** (ver §9, Definition of Done).
- Los textos del jugador están en **inglés**; las guías, en español. Las páginas del diario se nombran por su **título impreso entre «comillas curvas»**, nunca «Sheet 13B».
- Convenciones de estado: ✅ hecho y verificado · 🟡 a medias · ⏳ diseñado, sin construir · ❓ sin diseñar · ⚠️ conflicto.

---

## 1. El juego en una página

- **Qué es:** caza del tesoro no lineal para el 23.º cumpleaños de **Silvia** (protagonista y única resolutora, en inglés). Creador y Operador: **Carles**. Universo: **The Eclipse Order** (símbolo ◐, contacto sagrado 22:22, correo `theeclipseorder.quest@gmail.com`). Arrancó el **1-sep-2026 22:22** (Email 1). Fecha final: **WHEN = 18–20 dic 2026**.
- **Regalo final:** 2 entradas de ballet para Silvia y Carles, ocultas en **The Vault of the Grand Eclipse**, que se abre al alinear las tres torres con el Astrolabio.
- **Tres torres, tres caminos, tres pistas:**
  | Torre | Camino | Guardián | Pista | Estado de la pista |
  |---|---|---|---|---|
  | I · The Alpine Observatory | Constellation (S01–09) y **regreso** | The Cartographer of Distant Light (**Hermes**) | **WHAT**: 2 entradas de ballet | **Extra posterior al juego** (decisión 16-nov): se entrega en persona el día del WHEN; el Hub solo termina con una carta y un sobre sellado |
  | II · The Sandstone Sanctuary | Desert (S10–19) | **The Oracle** = **Aurelia** (secreto, ya revelado en S19) | **WHEN**: 18–20 dic | ✅ entregado en S19 (sin hora) |
  | III · The Stage Tower / Mirror Sanctuary | Stage (S20–28) | **The Mirror Speaker** (solo reflejada) | **WHERE**: Viena · Wiener Staatsoper | ⏳ se revela en S28 |
- **Mito:** 1970 Hermes entrega a Aurelia un disco grabado a mano («You were always the treasure»); 1971 un seísmo parte el puente y Aurelia cae salvando las cartas celestes; Hermes renuncia a su nombre 45 años; Aurelia sobrevive y la halla el Servant (Torre II); 1998 expedición de frontera (cuaderno 7B); 2026 asalto al observatorio, Astrolabio robado, travesía del desierto, tormenta roja, alineación de las tres torres. Cronología completa: [guide/01 §1.4](guide/01_FOUNDATIONS_AND_CONSTELLATION.md).
- **Mensaje oculto del Email 1** (el corazón del juego): *«YOU ARE THE REASON FOR ALL OF THIS. WHEN YOU READ THIS YOU WILL KNOW HOW MUCH I LOVE YOU. YOU WERE NEVER ONLY THE SEEKER YOU WERE ALWAYS THE TREASURE.»*
- **Canon secreto del Operador (nada visible para Silvia antes de la Torre I):** **Pope-E, jefe enmascarado de los BC Ashes («Before Christ»), es Carles.** Robó el Astrolabio porque el tesoro es Silvia. Siempre la llama *the key*, nunca *the seeker*; nunca hace daño.
- **Astrolabio:** robado; mide nativamente 6 estrellas (Aldebaran, Polaris, Vega, Altair, Deneb, Arcturus); los juegos del diario simulan el resto. Los asaltantes escapan con él hacia la Torre I.
- **Reglas de oro** (resumen; íntegras en [AGENTS.md](../AGENTS.md) y [.agents/rules/user-preferences.md](../.agents/rules/user-preferences.md)): Silvia resuelve, los guardianes solo narran; vocabulario blindado (nada de *Sunken, Coastal, Hermit, Stage Mistress*; nada de Azimuth/Mucro/Mater/Tympan/Stereographic); **Regla 9**: la web nunca muestra valores del Ledger; **Regla 10**: solo alfabeto A–Z en fórmulas; diario A5 con troquel (A: X<165 sin tinta · B: X>1583 sin tinta) y 40–80 px de aire texto–dibujo; nada de scripts en la raíz (van a `scratch/`).

---

## 2. Mapa global: las 28 estaciones, sus hojas, juegos y recompensas

Leyenda de **Wire**: paso del Field Wire que la envuelve. **Estado**: del juego web (el diario ya está impreso al 100%, hojas 1–26).

### 2.1 Constellation Path · Torre I (S01–S09) — ✅ completo y entregado
| Est. | Nombre | Hoja impresa | Recompensa principal | Notas |
|---|---|---|---|---|
| 01 | The Threshold (Email 1) | — | Elección de camino (`THE CONSTELLATION PATH`) · profecía en glifos | Email 1 (1-sep, 22:22). Texto real = imagen del pergamino |
| 02 | Cartographer Arrival (Email 2) | — | Carta del Cartógrafo; fragmento 1 | 2-sep. ⚠️ los archivos del repo son de la Matrix, no de lo enviado |
| 03 | The Celestial Flower | — | Glifos **D** y **C**; 22 estrellas trazadas | Web `constellation/celestial-flower` |
| 04 | The Observatory Raid / The Severed Sky | — | Asalto y robo del Astrolabio | ❓ canal de entrega del 5-sep no documentado |
| 05 | Emergency Radio Relay | — | Transmisión de radio (despacho 12-sep) | audio 19.84 MHz |
| 06 | The Celestial Matrix | 4A lore + 4B «The Planisphere» | Glifo **P** | Email 3 (14-sep) |
| 07 | The Zodiacal Engine | 5B | Glifo **K** (cofre) · clave `ECLIPSE` | Email 4 (25-sep) |
| 08 | Midnight Calibration & Shifting Tempest | 6A/6B | Transit; Transmisiones 5A/5B | ventana 29-sep 00:00 |
| 09 | The Celestial Cipher | 7A | Glifos **B, G, V, F** · voto de Hermes · tormenta de arena | Email 5 (10-oct) |

### 2.2 Desert Path · Torre II (S10–S19) — ✅ construido; Silvia en curso
Wire pasos 0–32. Letras del Ledger por estación en §3.
| Est. | Nombre | Hoja | Premio / mecánica (las letras indicadas son las que la estación **fija** en el Ledger, no glifos nuevos) | Espera real (Wire) |
|---|---|---|---|---|
| Prólogo | La tormenta y la Atalaya · Cairn I (Hanói de 4 piedras, óptimo 15) | 7B / sin hoja | Seal I | Wire 0–4 (intacto) |
| 10 | The Whispering Chasm | 9B | Glifo **X**, runa **R** | — |
| 11 | The Salt Playa | 10A/10B | Glifo **Q** · Surveyor's Balance | — |
| 12 | The Desert Lexicon & Al-Qibla | 11A | Glifo **Z** · «BC Ashes» nombrados | — |
| 13 | The Oasis Clepsydra | 12B (**congelada 3-nov**) | 4 odres, Falcon Weight; solo comprobaciones | marcha 6 h Camp VIII → Puertas |
| 13B | At the Gates of Tower II (escena) | 13A | Red Cord / Servant's Coin / Statue Seal | — |
| (Erg) | The Night on the Erg (escena) | — | Overture de S14 | — |
| 14 | The Sun Monolith & Cairn II | 13B | Seal II · **D, C** | 6 h a S15 |
| (14A) | The Memory of the Stones (sueño 1998; **entre S15 y S16**, Wire 16→17) | 14A | Escena | lore aprobado 16-nov (A-16) |
| 15 | The Sandstone Labyrinth & Cairn III (recompensa animada, película de salida, 3 destellos, voces y «Back into the dark»: 16-nov) | 14B | Seal III · **W, N** (+ Founders' Lamp, Raiders' Copy of the Survey) | 18 h a S16 |
| 16 | Cairn IV · Sentry of the Canyon | 15A | Seal IV · **S, U** | 18 h a S17 |
| (15B/16A) | The Spyglass on the Natural Bridge (antes de S16) | 15B+16A | Escena | lore aprobado 16-nov (A-16) |
| 17 | The Arch of the Solstice & Solar Altar (Cairn V) | 16B | Seal V · **Y, L** · ceremonia de los 5 sellos | 6 h a S18 |
| 18 | The Polybius Stele · Tower II in Flames | 17A/17B | **H, M** · Servant's Key | — |
| 19 | The Oracle's Horizon | 18A (**reimpresión menor pendiente**) | **WHEN 18–20 dic** · **I y J** (⏳ J añadida, A-01) · Gilded Star · Aurelia revelada · ⏳ escena «Ledger completo» | 18 h a S20 |

### 2.3 Stage Path · Torre III (S20–S28) — 🟡 3 de 9 construidas
Wire pasos 33–44. 9 fragmentos de espejo (I–IX). Mapa: «Espejo Roto Vivo» (✅ `web/assets/js/stage-mirror.js`).
| Est. | Sala | Cara impresa | Fragmento | Interacción (ficha de variedad) | Estado | Pausa antes | Pope-E / Aurelia |
|---|---|---|---|---|---|---|---|
| 20 | The Gate of a Thousand Masks | 19B (19A carta) | I | Comparar simetrías + dibujar (SILVER + Missing Halves) | ✅ | marcha 18 h | nota 1 «Let her through.» |
| 21 | The Camera Obscura | 20A (QR ✅) | II | Girar proyección y señalar (dif. 2) | ✅ | 3 h | — |
| 22 | The Whispering Gallery | 20B (sin QR) | III | Escuchar en estéreo y tocar melodía en espejo (dif. 4) · ⏳ pierde `[J]×2=[T]` (A-02) | ✅ | 6 h | mensaje interceptado (tras Wire 36) |
| 23 | The Automaton Orchestra | 21B (21A cuaderno I) | IV | Colocar púas en cilindro (dif. 2) | ⏳ | ❓ | **nota 2** |
| 24 | The Fly Tower | 22A (22B Ashes) | V | Tiempo real, contrapesos (dif. 4) | ⏳ | ❓ | — |
| 25 | The Shadow Theatre | 23A (QR ✅) + 23B | VI · reliquia | Secuencia de escenas + **trasluz** (dif. 3) | ⏳ | ❓ | carta II de Aurelia |
| 26 | The Hall of Mirrors | 24A (**doblez**) + 24B | VII | Laberinto (dif. 5, pico) | ⏳ | ❓ | **reflejo de espaldas** |
| 27 | The Kaleidoscope Lantern | 25A + 25B | VIII | Girar y alinear cristales (dif. 2) | ⏳ | ❓ | **nota 3** · carta III de Aurelia |
| 28 | The Stage of the Mirror Speaker | 26A + 26B | IX · **WHERE** | Encajar 9 fragmentos (ceremonia, sin teclear) | ⏳ | ❓ | huida con el Astrolabio |

Reglas de variedad (ficha del Operador, 21-oct): nunca dos salas seguidas con la misma interacción; como mucho la mitad acaba tecleando; sonido en S22 y S23 con camino sin audio; una sala suave después de cada dura.

### 2.4 Regreso a la Torre I, Bóveda y final — ❓ sin construir
Sin estaciones, sin nodos (>48), sin pasos de Wire (≥ 45 para S23; la Torre I sería ≥ 69), sin hoja 27. Solo existen: hoja 26B «Back to the Peaks», el plan de IB #13 (final por estilo de juego) y `journey-profile.js`. **Es el grueso de lo que falta** (§5.2). Decidido el 16-nov (§5.0): **3 estaciones con juego completo** (*Observatorio*, *Cartas celestes*, *Alineación*); el Astrolabio se gana en la alineación (A-14); el Ledger completo abre la Bóveda (A-04); desenmascaramiento por Wire + cuaderno (A-15); el Hub acaba con la carta de Carles y un sobre sellado (A-05). El WHAT queda **fuera del Hub**.

---

## 3. The Cipher Ledger (26 letras, valores internos)

> **Regla 9:** la web y las hojas NUNCA muestran valores; este cuadro es solo para agentes. Los 26 valores son una permutación exacta de 1–26 (verificado: las 30 ecuaciones de `CLUE_EQUATIONS`, `hub-core.js:3287`, se cumplen).

| Letra | Valor | Entrega del glifo | Ecuación que la fija |
|---|:-:|---|---|
| O | 23 | hoja | `A+O=30′` (06) + `O−A=16` (07) |
| A | 7 | hoja | ídem |
| K · G | 26 · 22 | S07 · S09 | `K+G=48°` (06) + `K−G=4` (09) |
| P · B | 21 · 17 | S06 · S09 | `B+P=38°` (06) + `P−B=4` (09) |
| V · E | 12 · 2 | S09 · hoja | `E+V=14′` (06) + `V−E=10` (09) |
| T · F | 16 · 6 | hoja · S09 | `F+T=22″` (06) + `T−F=10` (09) |
| D · C | 18 · 24 | S03 | `D+F=24` · `C−T=8` (S14) |
| R | 3 | S10 | pista «tercera runa» → `R×2=F` (S12) |
| X | 15 | S10 | `X+E=17` (S10) |
| Q | 14 | S11 | `Q+E=16` (S11) |
| Z | 5 | S12 | `O−Z=18` (S12) |
| W · N | 19 · 11 | hoja | `W+A=26` · `N−E=9` (S15) |
| S · U | 13 · 4 | hoja | `S+U=17`, `S−U=9` (S16) |
| Y · L | 25 · 1 | hoja | `Y−O=2` · `L+G=23` (S17) |
| H · M | 20 · 9 | hoja | `H−U=16` · `M+T=25` (S18) |
| I | 10 | hoja | `I+E=12` (S19) |
| **J** | **8** | hoja | **`[I]+[J]=18` en S19** (decisión 16-nov; antes `J×2=T` en S22) |

- S13 aporta comprobaciones (`P−A=14`, `Q+Z=19`). **Decisión 16-nov:** el **Stage Path no tiene operaciones matemáticas como recompensa** (S20–S28 sin ecuaciones) y **Silvia debe tener los 26 valores al terminar S19** (el WHEN es 18–20 dic). Por tanto la **J pasa a S19** con `[I]+[J]=18`, que **sustituye** a la comprobación `Z+D=23`; S22 pierde `[J]×2=[T]` (`gallery-jt`).
- Tras S19 Silvia calcula **26 de 26**. **Uso final:** el Ledger completo es la **llave de la Bóveda**: cerradura de **6 diales con el valor de cada letra de SILVIA: 13 · 10 · 1 · 12 · 10 · 7** (decisión 16-nov, A-38; sustituye a la idea de la frase del Email 1, descartada por el Operador). Al completarlo hay una **escena breve de Aurelia y Hermes** (sin mostrar valores).
- **Implementado en local el 16-nov (A-01, A-02, A-03; sin commit ni despliegue):** `CLUE_EQUATIONS` (`oracle-zd` y `gallery-jt` fuera; `oracle-ij` dentro), recompensas y Wire de S19 y S22, telemetría 32 y 44, cuaderno de Hermes, escena `ledger-complete.js`, smoke (S19 incluye ahora la comprobación de los 26 valores y que la escena no muestra números). Verificado: `s19`, `gallery`, `notebook`, `wirechat`, `tester`, `ledger` en verde; falta pasar el smoke completo antes de desplegar. **Silvia aún no ha llegado a S19**, así que nada de esto le afecta hasta desplegar.
- Ledger real de Silvia: sembrado con O=23 y A=7 (excepción deliberada a la Regla 9, `hub-core.js:1101`); su guardado del 12-nov lleva 14 letras.
- Tabla completa con ecuaciones, ids y `requires`: [guide/01 §3.3–3.4](guide/01_FOUNDATIONS_AND_CONSTELLATION.md) y [guide/04 §2.1](guide/04_SYSTEMS_AND_DOC_AUDIT.md).

### 3.1 Estado de Silvia en el Ledger (guardado en Supabase del 16-nov-2026, 11:39)

- **Dónde está:** S14 (Sun Monolith) completado el **13-nov 00:34**; sellos I y II; Wire en el paso 13; **S15 sin abrir** (la marcha de 6 h ya pasó). Última visita: 15-nov 20:46 (solo miró el mapa).
- **Valores que ya ha descubierto (16 de 26):** O 23 · A 7 · K 26 · G 22 · P 21 · B 17 · V 12 · E 2 · T 16 · F 6 · X 15 · Q 14 · Z 5 · R 3 · D 18 · C 24.
- **Ecuaciones resueltas: 19 de 30.** Pendientes (aparecen al completar su estación): `cairn3-wa`, `cairn3-ne` (S15) · `cairn4-sum`, `cairn4-diff` (S16) · `cairn5-yo`, `cairn5-lg` (S17) · `stele-hu`, `stele-mt` (S18) · `oracle-ie` y la nueva `[I]+[J]=18` (S19). `oracle-zd` y `gallery-jt` desaparecen (A-01, A-02).
- **Letras sin valor todavía y cuándo se dan:**
  | Letra · valor | Estación | Ecuación | Cuándo puede jugarla |
  |---|---|---|---|
  | W 19 · N 11 | S15 Sandstone Labyrinth | `[W]+[A]=26` · `[N]−[E]=9` | ahora |
  | S 13 · U 4 | S16 Cairn IV | `[S]+[U]=17` · `[S]−[U]=9` | 18 h tras S15 |
  | Y 25 · L 1 | S17 Arch of the Solstice | `[Y]−[O]=2` · `[L]+[G]=23` | 18 h tras S16 |
  | H 20 · M 9 | S18 Polybius Stele | `[H]−[U]=16` · `[M]+[T]=25` | 6 h tras S17 |
  | I 10 · **J 8** | S19 Oracle's Horizon | `[I]+[E]=12` · `[I]+[J]=18` | tras S18 |
- **Calendario mínimo hasta el Ledger completo:** 18 + 18 + 6 h de marchas entre S15 y S19 → **≥ 42 h de espera en tiempo real desde que abra S15** (≈ 2 días), más lo que tarde en jugar cada estación. Con un ritmo de una estación por sesión, el Ledger puede estar completo en torno a **20–22 nov**.
- **Qué «sabe» además:** el alfabeto completo de 26 glifos está impreso en las hojas 2–3, así que reconoce todas las letras; la web solo le entrega glifos nuevos en S03, S06, S07, S09, S10, S11 y S12 (D, C, P, K, B, G, V, F, R, X, Q, Z). El resto de valores los deduce por ecuación.
- **Reglas del Ledger de Silvia:** Regla 9 (nunca valores en pantalla); Regla 10 (solo A–Z); O=23 y A=7 estaban sembrados desde el principio (excepción deliberada); cada juego del Desierto da una letra ausente del mensaje del 1-sep (B G J P Q X Z) y que ella no tenía — **la J cumple esa regla en S19**.

---

## 4. Calendario real y margen

| Fecha | Hito | Fuente |
|---|---|---|
| 1-sep 22:22 | Email 1; arranque | Gmail |
| 11-sep | Entrega del diario (hojas 1–7, Italia) | GRIMOIRE |
| 8–10-oct | S09, tormenta (fin real: dom 18-oct 14:00), Email 5 | código/Gmail |
| 22–24-oct | Amanecer, Cairn I, Chasm | log |
| 3-nov | 12B congelada; `NEXT_ADVENTURE_HOLD = false` (liberado) | código |
| 10–11-nov | Clepsydra y puertas de Tower II | código |
| 12-nov | Silvia al pie del Monolito (S14 sin empezar) | `story-point.js` |
| 15-nov | Wire reescrito sin contradicciones, desplegado | `ec7ce59` |
| **16-nov** | **Hoy** | |
| **18–20 dic** | **WHEN** (fecha única por decidir: D-01) | S19 |

**Cuenta atrás: 32 días hasta el 18-dic.** Esperas en tiempo real ya fijadas en código desde que Silvia completa cada estación (telemetría del Wire): S14→S15 6 h · S15→S16 18 h · S16→S17 18 h · S17→S18 6 h · S19→S20 18 h · S20→S21 3 h · S21→S22 6 h = **≈ 75 h (≈ 3 días)** de espera mínima hasta S22, más las pausas de S23–S28 (3–8 h cada una: **15–40 h**). Para Silvia el cuello no es el reloj del juego sino **su ritmo diario**; para el Operador, el cuello es **construir 6 salas + la Torre I + el final** (§5). [INFERENCIA a partir de `MARCH_LEGS`/telemetría; Silvia juega aproximadamente 1 estación por sesión.]

---

## 5. LO QUE FALTA PARA TERMINAR EL JUEGO

### 5.0 Decisiones aprobadas por el Operador (16-nov-2026)

Estas decisiones **mandan sobre cualquier guía anterior**. Las marcadas ⏳ aún no están implementadas en código, papel o documentos.

| ID | Decisión | Estado |
|---|---|---|
| **A-01** | **La J se descubre en S19** junto a la I, con `[I]+[J]=18` («The Line of the Shared Cell»), que sustituye a la comprobación `Z+D=23`. Silvia tendrá los 26 valores al terminar el Desert Path | ✅ **implementado en local el 16-nov** (sin desplegar ni commit): `CLUE_EQUATIONS`, tarjeta y recompensa de S19, Wire 31/32 y telemetría, cuaderno, smoke |
| **A-02** | **El Stage Path no tiene operaciones matemáticas como recompensa**: S22 pierde `[J]×2=[T]` (`gallery-jt`) | ✅ implementado en local: S22 ahora entrega las tres palabras de Aurelia «Listen, and answer.» (puerta del nicho, victoria, Wire 43, cuaderno) |
| **A-03** | Al completar los 26 valores: **escena breve de Aurelia y Hermes** (sin valores) | ✅ implementado en local: `web/hub/js/ledger-complete.js` + `css/ledger-complete.css` («The Alphabet Is Whole», una sola vez, flag `order_ledger_complete_seen`) |
| **A-04** | **El Ledger completo es la llave de la Bóveda** (la fuente del código se concretó en A-38: el nombre SILVIA; la frase del Email 1 queda **descartada** como llave) | ⏳ mecánica por diseñar |
| **A-05** | **El WHAT es un extra posterior al juego.** El Hub termina con la **carta de Carles y un sobre sellado «to be opened on the day»**; el regalo físico se entrega **en persona el día del WHEN (18–20 dic)** | ⏳ escena y carta |
| **A-06** | **Silvia termina el Hub antes del 18-dic, con margen** (objetivo: 15–16 dic como máximo) | plan |
| **A-07** | **Pope-E en 1970:** *Carles imita a un enemigo leyenda*: el Pope-E de 1970 (22B, 24B, 25A) es un villano histórico real; en 2026 Carles adopta su nombre y su sello para jugar con Silvia | ⏳ guion del desenmascaramiento |
| **A-08** | **Ceremonia de S28:** Silvia encaja los 9 fragmentos en el **orden en que los ganó**, guiada por el dibujo de cada uno; sin teclear, sin marcas de margen | ⏳ S28 |
| **A-09** | **S23 = colocar púas** en la rejilla del cilindro hasta que la partitura espejada suene (S22 = escuchar y tocar) | ⏳ S23 |
| **A-10** | **Los discos son gemelos:** Hermes grabó el original (S19); Aurelia fundió su copia de bronce con tres aberturas (23B) | ⏳ textos S25 y carta II |
| **A-11** | **Solo S25 usa sello QR** (23A impresa, hash `77d1d1fa` en `SEALS[45]`); S23, S24, S26, S27 y S28 se abren solo por la pausa; no se reimprime nada | ⏳ `sheet-seals.js` |
| **A-12** | **Pausas S23–S28 de 3 a 8 h** (rango de la Biblia Stage); horas exactas por sala por fijar | ⏳ `stage-pause.js` |
| **A-13** | **Torre I = 3 estaciones con juego completo:** *Observatorio*, *Cartas celestes* y *Alineación* (más escenas de Wire) | ⏳ diseño y construcción |
| **A-14** | **El Astrolabio lo gana Silvia en la alineación** (no se lo entrega Pope-E) | ⏳ Torre I |
| **A-15** | **Desenmascaramiento** = escena del Wire en que Hermes repasa cada pista + **página del cuaderno de Hermes** con la fecha real en que Silvia vio cada una; termina con la carta de Carles | ⏳ Torre I |
| **A-16** | **Lore del sueño de 1998 y del catalejo aprobado como canon**, y los **4 detalles del 15-nov** (cabra, «You are late.», manos azules, once horas de cama) pasan a **mensajes fijos** | ⏳ Wire |
| **A-17** | **S23: melodía = FACADE** (F-A-C-A-D-E; invertida suena E-D-A-C-A-F): pista sutil hacia la fachada de la Ópera | ⏳ S23 |
| **A-18** | **S24: el reloj son los asaltantes cortando cuerdas** (una cada 20–30 s baja la cortina); modo sin reloj en accesibilidad; clinómetro a 38° (±2°) | ⏳ S24 |
| **A-19** | **S25: palabra = ALWAYS** (el voto; mitad de «You were always the treasure») | ⏳ S25 |
| **A-20** | **S26: reflejo de espaldas de Pope-E** camina un tramo por delante por el camino correcto, sin girarse, y deja una pluma dorada en la salida (pistas 3 y 4); registra `clue('reflection')` | ⏳ S26 |
| **A-21** | **S27: palabra = NORTH** (la luz de los cristales la deletrea) | ⏳ S27 |
| **A-22** | **S28: la fuga de Pope-E se ve en el espejo restaurado**: al encajar el noveno fragmento, el espejo muestra la fachada y, al fondo, a Pope-E subiendo con el Astrolabio; último mensaje interceptado sin comentario de Hermes | ⏳ S28 |
| **A-23** | **Torre I, juego 1 «Observatorio»:** restaurar la cúpula con luz (reorientar espejos y lentes rotas hasta el anaquel de las cartas) | ⏳ |
| **A-24** | **Torre I, juego 2 «Cartas celestes»:** reconstruir una carta quemada colocando fragmentos con las seis estrellas nativas del Astrolabio como puntos fijos | ⏳ |
| **A-25** | **Torre I, juego 3 «Alineación»:** tres diales (rumbo de la Torre II, rumbo 354° de la Torre III, vertical de la Torre I) contra Pope-E, que mueve un dial cada cierto tiempo; al alinearlos Silvia gana el Astrolabio. **La memoria del puente de Aurelia (1971) ocurre durante la Alineación** | ⏳ |
| **A-26** | ~~Cerradura de 5 diales con las sumas de la frase del Email 1~~ **DESCARTADA el 16-nov** (el Operador no quiere que esa frase aparezca ni que los glifos se usen para ello). Sustituida por **A-38** | ❌ |
| **A-27** | **La Torre I tendrá web y 4 caras impresas (hojas 27 y 28):** 27A Observatorio · 27B cuaderno de Aurelia IV (el puente) · 28A Cartas celestes + Alineación · 28B hoja final de la Orden. Llegan **todas juntas, en persona o con la «paloma»** al empezar la Torre I | ⏳ diseño, impresión (≈ 2 semanas) |
| **A-28** | **«56 días»:** se reencuadra como la primera fase de la Orden; no se reescribe el Email 1 | doc |
| **A-29** | **Limpieza documental aprobada** (§8): archivar históricos, corregir Biblias y regenerar las copias de CLAUDE/GEMINI/Cursor | ✅ ejecutada (§8) |
| **A-30** | **Consecuencias reales en el Wire desde el paso 14 en adelante** (lo que Silvia aún no ha jugado: S15 en adelante y Torre I): cada decisión deja una marca que cambia un texto posterior, un objeto o el final. Lo ya jugado hasta Cairn II (S14) no se toca | ⏳ Wire 14+ · S15 hecho (16-nov): paso 13 elección 0 marca el campamento, `nightOil` amplía la lámpara, voces/destellos cambian los pasos 15–16 |
| **A-31** | **El nombre que Silvia da a Hermes (paso 1)** se usa en la carta final y en 2–3 momentos clave; en el chat sigue siendo «Hermes» | ⏳ |
| **A-32** | **Los objetos huérfanos** (11 de 24) ganan **uso como ventaja opcional o guiño**, nunca como puerta obligatoria | ⏳ |
| **A-33** | **Premios S20–S28:** cada sala da fragmento + **un objeto con uso posterior** + una **huella de Aurelia o Pope-E** + **página del cuaderno** + **2 preguntas de Ask Hermes** (también se añaden a S20, S21 y S22) | ⏳ |
| **A-34** | **Los 14 glifos que la web aún no entrega (A E H I J L M N O S T U W Y) se reparten hasta el final del juego**; hoy Silvia solo conoce los 12 que dio la web (D C P K B G V F R X Q Z) | ⏳ plan de reparto por decidir |
| **A-35** | **La web nunca pide escribir en el papel.** Silvia puede anotar en su diario si quiere, pero ninguna escena lo exige ni lo ofrece como botón | regla |
| **A-36** | **Silvia ya tiene las 8 hojas 19–26 en la mano:** puede leer 22B, 24B, 25B, 26A y 26B (Pope-E, la Ópera) antes de llegar a esas salas; la web no depende de que no las lea | hecho |
| **A-38** | **Bóveda: la llave es el nombre SILVIA.** Cerradura de **6 diales: 13 · 10 · 1 · 12 · 10 · 7** (valor de S, I, L, V, I, A en el Ledger). Exige los 26 valores; no se muestra la frase del Email 1 ni se usan glifos para la puerta. Pista de Aurelia: «the key is the one she answers to» | ⏳ Torre I |
| **A-39** | **Reparto de los 14 glifos (A E H I J L M N O S T U W Y): 2 en el Desierto, 8 en el Stage, 4 en la Torre I.** Desierto: **I y J en S19**. Stage: **W en S20, N en S21, S en S22, U en S23, Y en S24, L en S25, H en S26, M en S27** (S28 solo el espejo). Torre I: **A en el Observatorio, E en las Cartas celestes, O y T en la Alineación**. Cada entrega es una tarjeta «A new glyph» (los 26 SVG `ecl-*.svg` ya existen); nunca muestra valores | ⏳ |
| **A-40** | **El final cambia según el estilo de juego en las 5 piezas:** despedida de Hermes, constelación personal, línea de Aurelia, línea de la Mirror Speaker y texto del desenmascaramiento (tono dominante + consecuencias reales del Wire + nombre dado a Hermes) | ⏳ |
| **A-41** | **Constellation: pulido completo** de Flower, Matrix y Zodiac (rejugables, teclado, reduced-motion, soluciones solo en modo tester, reinicio que funcione) | ⏳ |
| **A-42** | **Módulo común de pantalla de recompensa** (con el resumen de la partida) y **`fitSpeed` en todas las escenas 3D**, aplicados a S15–S28 | ⏳ S15 hecha a mano (16-nov); módulo común y S16–S28 pendientes |
| **A-43** | **S24, pesos:** saco = 3, lingote = 5, masa de la cortina = 14 (3 sacos + lingote = 14, las piezas dibujadas en 22A), leída en una **placa de bronce** de la cortina; la dificultad 4 viene del reloj, no del cálculo | ⏳ S24 |
| **A-44** | **S25, reliquia = «The Twin Disc»** (el disco de bronce de Aurelia, 24 radios y tres aberturas): se ve a trasluz, sirve como dial en la Alineación y en la carta II | ⏳ S25 |
| **A-45** | **S26, formato:** 3D en tercera persona con pasos en rejilla (flechas o toque), espejos que duplican el reflejo, sin tiempo; el reflejo de Pope-E marcha por delante | ⏳ S26 |
| **A-46** | **S28, orden:** cada fragmento lleva el dibujo que ganó en su sala; Silvia lo coloca en su hueco; uno equivocado desliza de vuelta sin penalización; la Mirror Speaker da una pista tras 3 fallos | ⏳ S28 |
| **A-47** | **Notas de Pope-E (texto aprobado):** nota 2 (S23, en el cilindro) «You were never only the seeker.»; nota 3 (S27, en la terraza) «The last door does not need me. Walk.»; sello de ceniza (círculo partido, ◐ invertido); en los mensajes interceptados la llama siempre «the key» | ⏳ S23, S27 |
| **A-48** | **Eje emocional del Wire 45–68:** Hermes duda, Aurelia recuerda por partes y Silvia decide; sus respuestas inclinan la confianza en uno u otro (tono cálido/protector/táctico/analítico). 4 pasos por estación (salida, viaje, balance, cierre), mensajes cortos, 1–2 decisiones con 3 ramas y una consecuencia guardada | ⏳ Wire 45–68 |
| **A-37** | **Paquetes de impacto de páginas aprobados:** *Escenas de lore* (PE-08 «The man on the ridge» 17B, PE-09 «The curtain between» 18B con objeto que Hermes lleva al teatro, PE-10 «Your theory» 22B, PE-11 «Ropes twice» 24B); *Astrolabio* (PE-05 reglas del dial exterior de 4A en la Alineación, PE-06 «Reassemble the Astrolabe» con 5A); *Portada, primera carta y 26B* (PE-01 la cubierta se va llenando, PE-02 preguntas sobre 1B, PE-12 elegir el camino de regreso desde 26B). **No aprobado:** el paquete de mapas (cruces y línea de 348°, que pedían escribir) | ⏳ ver [guide/05](guide/05_PAGE_IMPACT_MATRIX.md) §3 |

### 5.1 Decisiones todavía abiertas (en formato test, ronda a ronda)

| ID | Decisión | Recomendación |
|---|---|---|
| **D-01** | ¿Se concreta el día exacto del WHEN dentro de 18–20 dic y con qué hora? (la 18A impresa dice «hour»: reimprimir como «day and season») | Decidirlo cuando se conozca el ballet |
| **D-14** | Notebook/Chronicles: páginas para la escena 13B, el sueño y el catalejo | Añadir |
| **D-18** | Detalles de sala aún abiertos: masa de la cortina y pesos de S24, grafo del laberinto de S26, reliquia de S25, gesto exacto de la ceremonia de S28 | Los propongo yo al construir cada sala y usted los aprueba |
| **D-19** | Diseño fino de los tres juegos de la Torre I (reglas, dificultad, 3D) y de las 4 caras 27A–28B | Ronda de preguntas al empezar la Torre I |
| **D-20** | Cartas de Aurelia y notas de Pope-E (texto y ubicación): nota 2 (S23), reflejo (S26), nota 3 (S27) | Con cada sala |
| **D-21** | Horas exactas de pausa por sala (A-12) | 3 h · 4 h · 5 h · 4 h · 6 h · 8 h (S23→S28) |
| **D-22** | Lore nuevo de S15 (16-nov): el «chief» de los BC Ashes y su creencia de que con cinco sellos «the doors of the sandstone tower open by themselves»; la copia del levantamiento de los fundadores en manos de los asaltantes (¿quién se la copió?); la tiza «H · 98» de Hermes que enlaza con el sueño | Aprobar tal cual, o retocar textos (`VOICES`/`FINDS` en `s15-sandstone-labyrinth.js`) antes de que Silvia juegue S15 |

### 5.2 Trabajo de construcción (ordenado)

**A. Antes de construir nada — cerrar D-04 a D-10 (una pregunta por estación)**.

**B. Seis salas del Stage (S23–S28).** Entregables **por sala** (patrón de S20–S22):
1. Juego: `web/hub/js/stations/sNN-*.js` + CSS, modal 3D con `is-stage-room`, accesible (teclado y táctil), con «How to play», UX «juice» al nivel del Chasm, camino **sin audio** si es sala de sonido.
2. Registro en `hub-core.js`: `STAGE_OPENERS`, `STAGE_CARDS`, `GAMES` y `ARRIVAL`/`WALKS` del probador, `syncWire`, `MARCH_LEGS`, `Ask Hermes` (grupo `stage`), reliquia `mirror_fragment_N` (+ SVG en `web/assets/items/`), `WIRE_FINAL_RELIC`, `WIRE_FINAL_TELEMETRY` (sin spoiler del WHERE).
3. Hoja: alta en `JOURNAL_SHEETS` (título impreso), `sheet-seals.js` (`TITLE`, `SEALS` si procede), `stage-pause.js` (`HOURS`), `previously.js`, `field-journal.js` (`PAGES.sNN`), `ambience.js` (`BEDS`), `hint-ladder.js` (ids `sNN-*`, 3 niveles 3/6/9 fallos o 10/20/35 min).
4. Wire: **4 pasos por sala (patrón previsto, aún no escrito)** (salida con respuestas → viaje → balance → cierre): S23 = 45–48, S24 = 49–52, S25 = 53–56, S26 = 57–60, S27 = 61–64, S28 = 65–68; mensajes cortos, tecleo lento, respuestas variadas con consecuencias; `wire-ceremony.js` (cierre de capítulo en S28).
5. Pistas de Pope-E donde toque: `note2` (S23, cita «You were never only the seeker»), `reflection` (S26), `note3` (S27), registradas con `EclipseNotebook.clue(id)`.
6. Mirror Speaker: línea que reacciona al estilo de Silvia (`EclipseMirrorSpeaker.render`).
7. Verificación: sección nueva del smoke, `lint_lore_and_vocabulary.py`, `verify_sheets.py --sheets 19-26`, `offline_list.py`, y auditoría con el guardado real de Silvia.

Lo que **falta definir por sala** (detalle exacto con restricciones del papel en [guide/03 §2](guide/03_STAGE_PATH_AND_FINALE.md)):
| Sala | Falta definir |
|---|---|
| S23 | Melodía (solo C D E F G A), representación en el cilindro, mecánica de púas, solución, texto de la nota 2 |
| S24 | Masa de la cortina y sacos/lingotes (el papel no trae cifras), tolerancia del clinómetro (38° ±2°), justificación del reloj, modo sin reloj |
| S25 | **Palabra** que dicen las sombras (el trasluz no trae letras), guion de las 3 figuras (luna, torre, enmascarado), reliquia (nombre, SVG, lore) |
| S26 | **Grafo del laberinto** (20 pasos W→E, alcobas IV V V VI, doblez sobre el eje central), reflejo de espaldas de Pope-E |
| S27 | **Palabra** que deletrea la luz, dial y «northern angle», texto de la nota 3 |
| S28 | Ceremonia completa (orden y gesto de encajar), sustituto de las marcas de margen, fuga de Pope-E con el Astrolabio, cierre del capítulo |

**C. Torre I, Bóveda y final** ([guide/03 §4.3](guide/03_STAGE_PATH_AND_FINALE.md)). Hoy **solo existe el concepto**; el diseño base está decidido (A-13, A-14, A-23 a A-27). Por construir: **3 juegos** (*Observatorio*, *Cartas celestes*, *Alineación*), **4 caras impresas** (hojas 27 y 28, A-27) y viaje por el Chasm Pass (marcha real + eventos), reconstrucción del estado de la Torre I, escena de la **memoria del puente de Aurelia (1971)**, alineación de las tres torres + Astrolabio, desenmascaramiento de Pope-E (escena del Wire + página del cuaderno de Hermes con las fechas reales de cada pista, `order_ashes_clues`), Vault, final por estilo de juego (4 tonos × 5 piezas, borradores en IB #13), **carta a mano de Carles**, y el correo/hoja final de la Orden (si se desea).

**D. Correcciones de coherencia (código, papel, textos).**
- Reimpresión menor de **18A** («hour» → «day and season»).
- Pegar el hash de **23A** en `SEALS[45]`; decidir 20B (sin sello impreso) y los QR no impresos (D-07).
- Mover los 4 detalles aprobados (cabra, «You are late.», manos azules, once horas de cama) a mensajes fijos (A-16).
- Notebook/Chronicles: páginas para 13B, sueño y catalejo.
- Limpiar código muerto: Clepsydra legacy (`s13-oasis-clepsydra.js`), `astrolabe.js` fase 2, textos antiguos de los pasos 33–44 en `hub-core.js:5032–5209`.
- Ocultar los botones «ver solución» de Matrix/Zodiac si procede; el enlace «↺ Re-trace Constellation» no reinicia la Flower (`#reset` no se procesa).

**E. Verificación y entrega.** El smoke solo comprueba que las páginas de Constellation cargan; Cairn I, la escena 13B y la Night on the Erg no tienen partida completa; no hay sección para S23–S28 ni para el final. Última pasada completa del smoke: 15-nov (`ec7ce59`); `smoke_report.json` local solo guarda la sección `dream`.

---

## 6. Conflictos entre guías y código: resolución propuesta

Los 24 conflictos de Constellation, 21 del Desierto, 20 del Stage y 15 de sistemas (más de 70 en total, deduplicados abajo) están detallados al final de cada anexo. **Estos son los que cambian lo que un agente construiría o diría**:

| # | Tema | Dónde choca | Resolución (vigente) |
|---|---|---|---|
| R-01 | Nº de fragmentos de espejo | GEMINI.md, `.cursorrules`, `.cursor/rules/canonical-lore.mdc` dicen 8 | **9** (código, CLAUDE.md, AGENTS.md ya corregidos) |
| R-02 | Q en S24 y X en S27 | STAGE §4/§6, HANDOFF | **Q = S11, X = S10**; S23–S28 sin letra nueva |
| R-03 | Duración de la tormenta («48 h») | BM, TIMELINE vs código | Nominal 48 h; fin real **dom 18-oct 14:00**. Silvia siempre exenta |
| R-04 | WHEN con hora | CLAUDE, AGENTS, PM, puzzles/desert | **18–20 dic, sin hora** (reimprimir 18A) |
| R-05 | Letras iniciales reveladas | PM, GRIMOIRE, PUZZLE.md: Y, O | **D y C** (código y diseño) |
| R-06 | Aurelia en 1974 en la Torre III | CLAUDE/AGENTS/GEMINI | **Aurelia es la Oráculo de la Torre II desde 1971** (BM §12); su cuaderno es la hoja **21A**, no 21B. La línea de 1974 es una versión antigua |
| R-07 | `NEXT_ADVENTURE_HOLD` | Biblia Desert y memoria dicen `true` | **`false`** (liberado el 3-nov, `hub-core.js:8067`) |
| R-08 | Marchas | Biblia: 0 h Camp VII→VIII | Código: 0 h, y **6 h** Camp VIII→Puertas (no documentada hasta hoy) |
| R-09 | Sello de 20B | STAGE, IB #14 | **No tiene** (`SEALS[42]=null`; no impreso) |
| R-10 | «Cada cara 20–26 lleva sello» | STAGE §6.2, IB #14 | Solo **20A y 23A** impresos |
| R-11 | Nombre del canal de Hermes | UI «Cliffside Workshop» · historia «Field Wire» · aparato «copper telegraph» | **Field Wire** = el canal; *The Cliffside Workshop* = nombre de la vista del Hub |
| R-12 | Astrolabio de latón permanente | LPB | **Solo modo Carles** |
| R-13 | Silvia empezó con «cero valores» | CLAUDE §4.9, BIB:167 | Excepción deliberada: sembrado **O=23, A=7** |
| R-14 | Títulos de página | DB vs `JOURNAL_SHEETS` | **`JOURNAL_SHEETS`** (títulos impresos) |
| R-15 | Mentirosas de 19B | STAGE §…: «mentirosas = SILVER» | Las **verdaderas** forman **SILVER**; las mentirosas, GOLDEN (código y STAGE §4.1) |
| R-16 | Email 1 y Email 2 | BM: texto borrador / HTML del repo | Lo enviado fue el **pergamino imagen** (Email 1) y la Flower (Email 2); recuperar los textos reales |
| R-17 | Entrega de la Estación 04 | Docs: 5-sep | Gmail no registra correo el 5-sep: **❓ canal alterno** |
| R-18 | Pope-E / Mirror Speaker / Oráculo | ver D-04 | — |
| R-19 | Marca del WHERE «nunca en claro antes de S28» | STAGE §1, HANDOFF, IB | **26A impresa ya lo hace deducible** (Ópera, 48°12′ N 16°22′ E, 5 arcos): se protege solo la **confirmación por nombre** en S28 |
| R-20 | Frecuencia de la T2 | asunto del email 12-sep 142.85 | **19.84 MHz** (audio) |

---

## 7. Datos transversales de producción

- **Nombres canónicos de salas y estaciones:** títulos impresos de las hojas, citados entre «comillas curvas». La ciudad de la Torre III es «the city of the third tower» (no inventar nombres propios).
- **Pistas (escalera de 3 niveles):** nivel 1 = 3 fallos o 10 min, nivel 2 = 6 o 20, nivel 3 = 9 o 35 (tiempo activo). Nunca dan la respuesta. Claves `order_hint_<id>_*`.
- **Sellos:** `https://the-eclipse-order.pages.dev/?seal=CÓDIGO`; orden de puertas: **pausa primero, sello después**. Códigos en `journal/stage_seals.json`.
- **Estilo del Wire:** mensajes cortos, tecleo lento, más turnos, respuestas variadas con consecuencias, sin scroll interno. Capítulo I del Wire (pasos 0–8) **intacto** por diseño.
- **Estilo visual:** diario en grafito puro (Serlio/Sabbatini/Galli da Bibiena para la tramoya); juegos 3D pintados a mano con sombreado toon; «UX juice»: toda sala animada, satisfactoria y con «How to play»; el Chasm marca el listón.
- **Hub:** inglés, un único mapa completo del Desierto, sin etiquetas «(Stations…)» en pestañas; Silvia juega en MacBook.
- **Guardado:** perfiles Silvia/Carles, Supabase `aoochekcbugawaurllco` (solo en el sitio publicado); `story-point.js` refleja su punto de historia.

---

## 8. Registro de documentos (36) y limpieza

**Limpieza ejecutada el 16-nov-2026 (A-29; sin commit):** movidos a `docs/archive/` `SESSION_LOG`, `PATHS_AND_CHARACTERS`, `GRIMOIRE`, `EMAIL_SETUP` y `HANDOFF_STAGE_PATH`; avisos de «histórico» en `PROJECT_MASTER`, `LORE`, `TIMELINE`, `IDEAS_BACKLOG` y `lore_and_puzzle_bible`; `CLAUDE.md` y `AGENTS.md` corregidos (56 días, WHEN sin hora, Aurelia 1971, onboarding); `GEMINI.md`, `.cursorrules` y `.cursor/rules/canonical-lore.mdc` **regenerados desde `CLAUDE.md`** con `scratch/utils/sync_agent_rules.py` (ejecútelo tras tocar `CLAUDE.md`); Biblias (CANONICAL, DESERT, STAGE §11) actualizadas con las decisiones. Quedan sin tocar los stubs `README` de `puzzles/`, `web/desert|stage/` y `emails/desert|stage/`. La tabla de abajo conserva la propuesta original para referencia.

Detalle con fechas, contradicciones y rutas rotas: [guide/04 §1](guide/04_SYSTEMS_AND_DOC_AUDIT.md). **Propuesta (no ejecutada; requiere D-16):**

| Acción | Documentos |
|---|---|
| **Mantener como fuente de su ámbito** | [CANONICAL](CANONICAL_LORE_AND_VOCABULARY_AUDIT.md) (lore y Ledger; limpiar §7.B), [DESERT_ODYSSEY_BIBLE](DESERT_ODYSSEY_BIBLE.md) (Desierto y estándar del Wire), [STAGE_PATH_BIBLE](STAGE_PATH_BIBLE.md) (reescribir §4/§6/§9/§10 con esta guía), `.agents/rules/user-preferences.md` (estética), `scripts/README.md`, `SECURITY.md`, `scratch/README.md`, `assets/README.md` |
| **Mantener tras actualizar** | `AGENTS.md` (reglas Capa 2; recortar lore y enlazar aquí), `docs/REPOSITORY_STRUCTURE.md`, `docs/WEB_ECOSYSTEM.md`, `docs/CINEMATIC_THE_ROAD_OF_SALT.md`, `docs/design_system/*` |
| **Generar desde un solo origen** | `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.cursor/rules/canonical-lore.mdc` (hoy 5 copias; 3 con «8 fragmentos») |
| **Archivar en `docs/archive/` (histórico)** | `SESSION_LOG`, `PATHS_AND_CHARACTERS`, `LORE`, `GRIMOIRE`, `EMAIL_SETUP`, `IDEAS_BACKLOG` (estado real ya en [guide/03 §5](guide/03_STAGE_PATH_AND_FINALE.md)), `HANDOFF_STAGE_PATH`, `lore_and_puzzle_bible` §6–§12, `puzzles/*/README`, `web/desert/README`, `web/stage/README`, `emails/desert/README`, `emails/stage/README` |
| **Convertir en registro histórico** | `PROJECT_MASTER.md` (decisiones del 1-sep y «Descartado») |
| **Mantener fuera de las guías** | `SILVIA_PLAYTHROUGH_LOG.md` (datos de la jugadora; regenerar con `scripts/audit/journey_report.py`) |

Rutas rotas a corregir (ejemplos): `PROJECT_MASTER.md:119` (`stage-mirror.js` vive en `web/assets/js/`), PNG de email inexistentes en ASSETS/EMAIL_SETUP/CANONICAL, `road_of_salt_1080.mp4`, PDF de la hoja 20 en HANDOFF.

---

## 9. Definition of Done de cualquier cambio de contenido

Un cambio (estación, hoja, flag, letra, paso del Wire, fecha, texto) **no está terminado** hasta que:
1. El código pasa `python3 scripts/audit/lint_lore_and_vocabulary.py` (0 errores) y, si toca diario, `python3 scripts/journal/verify_sheets.py --sheets <rango>`.
2. Se ejecuta la sección del smoke correspondiente (`python3 scripts/audit/web_smoke.py --only <secciones> --jobs 1`) y se registra el resultado.
3. Si toca la web: `python3 scripts/web/offline_list.py` (regenera `web/sw.js`).
4. **Esta guía** refleja el cambio (tabla §2, Ledger §3, falta §5, anexo correspondiente).
5. Git: ninguna escritura sin orden textual del Operador (R4); staging selectivo; sin secretos (R5).

---

## 10. Estado de la auditoría que dio origen a esta guía

- **Hecho:** inventario y comparación de 36 documentos; extracción por estación (S01–S28, escenas extra, Torre I/Bóveda); verificación cruzada con el código (flags, `HOURS`, `SEALS`, `WIRE_LAST_STEP = 44`, `NEXT_ADVENTURE_HOLD = false`, `built:true` de S10–S22); verificación algebraica del Ledger (30 ecuaciones); lint de lore (0 errores, 19 avisos de vocabulario ya impreso en 4A/5A); manifiesto offline al día.
- **No hecho (y por qué):** no se ejecutó el smoke completo ni `verify_sheets.py` (esta tarea no toca web ni hojas); no se aplicaron correcciones a las guías antiguas ni se archivó nada (esperan D-16); no se leyó el estado actual del guardado de Silvia en Supabase (el último dato fiable es el del 12-nov).
- **Riesgos residuales:** las citas `ruta:línea` de los anexos envejecen con cada commit; los PDF del diario son imagen sin capa de texto, por lo que el texto impreso se contrastó contra los scripts de maquetación y las maquetas JPG, no contra el PDF.
