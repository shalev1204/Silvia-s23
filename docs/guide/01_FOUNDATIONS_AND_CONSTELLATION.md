> **GUÍA MAESTRA · Parte 1 · Fundamentos y Constellation Path (S01–S09)** · Anexo de [docs/GAME_MASTER_GUIDE.md](../GAME_MASTER_GUIDE.md) (léase primero la guía maestra) · Auditoría a 16-nov-2026 sobre el repo en `ec7ce59`. Marcas: [DOC] lo que dice un documento · [CÓDIGO] lo que hace el código o archivo · [INFERENCIA] deducción · ✅ hecho · 🟡 a medias · ⏳ pendiente · ❓ sin diseñar · ⚠️ conflicto. **Ante discrepancia manda el código; el papel ya impreso es inmutable.** Las citas `ruta:línea` corresponden a esa fecha.

# PARTE A · Fundamentos + Constellation Path (Torre I, Estaciones 01–09)

Materia prima para `docs/GAME_MASTER_GUIDE.md`. Solo lectura del repo; nada editado. Fecha de corte: 16-nov-2026.

**Leyenda de estado**: ✅ hecho y verificado en código/archivo · 🟡 a medias · ⏳ diseñado, sin construir · ❓ sin diseñar · ⚠️ conflicto.
**Etiquetas**: [DOC] lo que dice un documento · [CÓDIGO] lo que hace el código/archivo · [INFERENCIA] deducción mía.

**Abreviaturas de rutas** (todas relativas a la raíz del repo):
`BIB` = `docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md` (Biblia 6.0) · `PM` = `PROJECT_MASTER.md` · `LORE` = `docs/LORE.md` · `PAC` = `docs/PATHS_AND_CHARACTERS.md` · `TL` = `docs/TIMELINE.md` · `GRI` = `docs/GRIMOIRE.md` · `SL` = `docs/SESSION_LOG.md` · `ES` = `docs/EMAIL_SETUP.md` · `LPB` = `docs/lore_and_puzzle_bible.md` · `WE` = `docs/WEB_ECOSYSTEM.md` · `DOB` = `docs/DESERT_ODYSSEY_BIBLE.md` · `HC` = `web/hub/js/hub-core.js` · `SP` = `web/hub/js/story-point.js` · `SD` = `web/hub/js/sandstorm-lockdown.js` · `CST` = `web/constellation` · `BJ` = `scripts/journal/build_entire_journal.py` · `BCG` = `scripts/journal/build_constellation_games.py`.

---

# 1. PREMISA Y REGLAS FIJAS DEL PROYECTO

## 1.1 En una frase
Caza del tesoro no lineal para el 23.º cumpleaños de **Silvia** (protagonista y única resolutora, juega en **inglés**, "avanzada" en puzzles). Operador/creador: **Carles**. Se juega con email + diario físico A5 + Hub web. [DOC: `PM:13-15`, `SL:8-35`, `CLAUDE.md §2`]

- **Regalo final**: **2 entradas de ballet** (para Silvia y Carles), ocultas en **The Vault of the Grand Eclipse**, que se abre al alinear las Tres Torres. [DOC: `CLAUDE.md §2`, `BIB:34, 828-830`]
- **Meta-juego** (diseño inicial): Carles usa las respuestas/pistas de Silvia para elegir el ballet; con 2 de 3 pistas ella intuye, con 3 de 3 lo tiene claro. [DOC: `PM:52-56`]. Después las tres pistas se fijaron: WHEN / WHERE / WHAT (ver 1.3).
- **Duración anunciada**: "~56 días" ([DOC: `PM:15`], Email 1: "For the next fifty-six days", `BIB:125`). ⚠️ **Conflicto**: 1-sep + 56 d = 27-oct, pero el WHEN es 18–20-dic (1-sep → 18-dic = 108 días). Ver conflictos C-01.
- **Tono**: misterio → romántico al final. Ritmo previsto: 2–3 entregas/semana; hora simbólica **22:22**. [DOC: `PM:75-79`]
- **Hora de contacto sagrada**: 22:22 (en Roman "XXII:XXII" en los emails). **Símbolo**: ◐ (disco mitad luz / mitad penumbra). **Email oficial**: `theeclipseorder.quest@gmail.com` (nombre visible "The Eclipse Order"; foto de perfil ◐). Cuenta activa desde 1-sep-2026. [DOC: `ES:5-10`, `PM:58-63`]
- **Lengua sagrada**: **Eclipse Script**, sustitución monoalfabética A↔A con 26 glifos geométricos abstractos (+ espacio ◇ y punto ·). [DOC: `puzzles/general/cipher-alphabet/ECLIPSE_SCRIPT.md`]. Archivos: `assets/general/glyphs/ecl-[a-z].svg`, `ecl-dot.svg`; PNG en `assets/general/glyphs/rendered_png/` (26 ficheros). Generador canónico `scripts/glyphs/generate-glyphs-v3.py`. [CÓDIGO: ls]

## 1.2 La Orden y el mito fundacional
- **El mito**: dos cuerpos celestes amaron la misma noche; al cruzarse en conjunción el mundo quedó en **El Umbral** (lo oculto se hace visible). Nace **The Eclipse Order**: antigua cofradía de astrónomos, geómetras, constructores y filósofos; archivistas de lo que "casi se ve". [DOC: `BIB:25-28`, `LORE:7-13`]
- **Doctrina**: toda verdad grande se alcanza por **tres caminos que deben recorrerse todos**; Email 1 solo elige **por cuál se empieza** (irreversible como orden). [DOC: `PAC:3`, `SL:92-98`]
- **Sede**: no existe en mapa ("donde la sombra es más larga que el cuerpo"). Los despachos firmados "The Eclipse Order" vienen del **Archivo Central**, no de un personaje; los personajes hablan después. [DOC: `LORE:49-56`]
- **Glosario** (LORE:116-124): The Threshold, Initiate (= Silvia), Dispatch, Eclipse Script, the three guardians.

## 1.3 Las Tres Torres, los Tres Caminos y las tres pistas
| Torre | Nombre canónico | Camino | Guardián | Pista | Hojas | Estaciones |
|---|---|---|---|---|---|---|
| I | **The Alpine Observatory** (cumbres alpinas, sobre el desfiladero **Deserti Limen**) | ✨ Constellation | **The Cartographer of Distant Light** (= Hermes) | **WHAT** (2 entradas de ballet) — revelación final al volver a la Torre I | 1–7 (+ 26B "Retorno a las Cumbres") | 01–09 (+ final) |
| II | **The Sandstone Tower / Sanctuary** | 🏜️ Desert | **The Oracle** (sin rostro; en canon secreto = Aurelia) | **WHEN** = **18–20 de diciembre, sin hora** (decisión del Operador, nov-2026) | 8–18 | 10–19 |
| III | **The Stage Tower / The Mirror Sanctuary / The Theater** | 🎭 Stage | **The Mirror Speaker** (nunca se ve; solo reflejada; firma = una línea horizontal) | **WHERE** = Viena · Wiener Staatsoper (secreto del Operador; nunca en claro antes de que ella lo descubra) | 19–26 | 20–28 |
| — | **The Vault of the Grand Eclipse** (4.ª cámara prohibida, en el punto geodésico de convergencia) | — | — | contiene las entradas físicas | — | final |

- Orden de entregas: WHEN (Torre II) → WHERE (Torre III) → WHAT (Torre I) → Bóveda. [DOC: `BIB:818-830`]
- ⚠️ `BIB:818` dice que Silvia empieza "sin conocer ni el WHAT, ni el WHERE, ni el **HOW**" y menciona un "HOW" que no existe en ningún otro documento. `PM:68`, `PAC:11`, `CLAUDE.md §2` y `AGENTS.md` aún dicen WHEN = "Fecha / Hora"; la Biblia (§8.B y §9, Hoja 18A) lo corrige a "sin hora". → C-07.
- El Email 1 no menciona las Torres (solo los tres caminos). Primera mención a Silvia: Hoja 1B ("When aligned with the old towers, its dials reveal landmarks that should not exist on our charts") y, con nombre, las órdenes interceptadas de la S07 (`BIB:411`).

## 1.4 El mito de Hermes y Aurelia y la cronología 1970–2026

### Resumen en 8 líneas [DOC: `BIB:38-91`, `CLAUDE.md §2`]
1. 1970: Hermes (n. ~1944, astrónomo soberbio) y Aurelia (astrónoma-artista; muele lapislázuli, aplica pan de oro) viven en Torre I. Tras 5 días de cálculo él se desmaya; al despertar la ve completando sus cartas con las manos heladas → renuncia a la gloria; graba a mano un disco de latón de 24 avistamientos y se lo da en la terraza: *«You were always the treasure.»*
2. Otoño 1971: terremoto + tormenta de arena roja; el Southern Bridge colapsa; Aurelia vuelve por el disco y los mapas y cae al abismo con el disco en el pecho.
3. 1971–2016: Hermes quema todo lo que lleve su nombre; vive como **The Cartographer** (45 años). 27 años (1971–98) reconstruye el observatorio.
4. 1998: expedición de campo al cañón (Hoja 7B); levanta "tres montones de piedra" y entierra la *primera* placa de cobre (112° E); no halla nada.
5. Otoño 2016: ve desde Deserti Limen un pulso dorado en las ruinas del desierto: **tres cortos, pausa, dos largos** (clave del disco). Pasa a firmar **The Cartographer of Distant Light** y restaura el Astrolabio (22 estrellas guía; mide nativamente 6).
6. Sept-2026: Silvia despierta la Flor → asalto de los **BC Ashes**, robo del Astrolabio; Hermes huye al desierto.
7. 9 oct: Silvia transmite el voto → recupera su nombre (Hermes); estalla la gran tormenta roja.
8. Oct–nov: Desert Path; Aurelia = la Oráculo (canon visible desde Estación 19).

### Cronología completa 1970–2026 (tabla maestra)
| Fecha | Evento | Fuente |
|---|---|---|
| Antigüedad | Mito del Eclipse; fundación de la Orden; erección de las 3 Torres; sellado de la 4.ª cámara (Vault) | BIB:25-34 |
| ~1944 | Nace Hermes (26 años en 1970; 54 en 1998; 82 en 2026) | BIB:959 |
| ~1968 | 1.ª travesía de Hermes a los 24 años "al dejar la biblioteca del Santuario" (Hoja 7B, I. The First Crossing) → por eso el Sirviente le recuerda joven | BIB:959 |
| Invierno 1970 | Hermes se desmaya; Aurelia completa sus cartas; él renuncia a la gloria y graba el disco de 24 avistamientos | BIB:41-45 |
| 1970 (terraza) | Voto: *«Aurelia... todos estos años... Tú fuiste siempre el tesoro»* ("You were always the treasure") | BIB:43-44 |
| Otoño 1971 | Terremoto + tormenta roja; incendio de la torreta; Aurelia rescata disco + mapas; el puente (clave del arco central) se parte; cae al vacío | BIB:48-52 |
| 1971 | La duna frenó su caída; el Sirviente la halla días después sin nombre ni memoria (canon secreto). El mismo terremoto derribó los Cairns I-II-III y mató a la Oráculo anterior | BIB:975-978, DOB:85 |
| 1971 | Hermes renuncia a su nombre → "The Cartographer" | BIB:57-62 |
| 1971–1998 | Reconstruye el observatorio piedra a piedra (27 años); telescopio hacia el cañón | BIB:60 |
| Otoño 1998 | Expedición (Hoja 7B): 3 mojones SSE, placa de cobre 112° E bajo Cairn III; placa **gemela** + brújula de latón al pie de Outer Watchtower VI (canon web fijado 19-10-2026); observa desde una cresta al hombre barbudo (en realidad el **Sirviente**; Hoja 17B) y lo toma por el Oráculo | BIB:61-69, 785-793 |
| Otoño 2016 | Pulso de oro (3 cortas, pausa, 2 largas) → pasa a "The Cartographer of Distant Light"; (2016–26) restaura el Astrolabio | BIB:73-78 |
| 1 sep 2026 22:22 | Email 1 → Silvia elige `THE CONSTELLATION PATH` | BIB:83 |
| 2 sep 22:22 | Email 2 (Cartógrafo) → Estación 03 (Flower) | BIB:84-85 |
| ~5 sep | Asalto al observatorio (Estación 04) | LORE:105 ("5 Sep 2026"), puzzles/02 |
| 11 sep | Entrega física del diario (Italia) | TL:14 |
| 12 sep | Transmisión 2 (Estación 05) | BIB:103 |
| 14 sep | Email "Matrix" (Estación 06) | BIB:104 |
| 25 sep | Email Zodiacal Outpost (Estación 07) | BIB:105 |
| 29 sep 00:00 (código) / "28 sep" (doc) | Ventana de medianoche, Estación 08 | HC:2719, TL:18 |
| 8 oct 22:22 | Despacho de la Estación 09 | BIB:106 |
| 9–10 oct | Voto transmitido → tormenta; Email 5 (10 oct) | BIB:107, 88-89 |
| 18 oct 14:00 | Fin de la ventana de tormenta | HC:638 |
| 22 oct → | Amanecer en Watchtower VI, Cairn I, marcha 26 h, Chasm (24 oct)… (Parte B) | SP, SILVIA_PLAYTHROUGH_LOG |
| 12 nov | Punto canónico: Silvia a los pies del Sun Monolith (Estación 14 sin empezar) | SP:1-5 |
| **18–20 dic 2026** | **WHEN** (cita del ballet) | BIB:821 |
| Día final | Cumpleaños 23 · revelación + entradas — **fecha del cumpleaños NO DEFINIDA en las fuentes** | TL:25,38 |

⚠️ Dato incoherente menor: Hermes "cincuentón en 1998" (BIB:67 / DOB:86) frente a "26 años en 1970" (nacido ~1944 → 54 en 1998). Compatible. "Han pasado 55 años" (Email 5/Field Wire) vs "FIFTY-SIX YEARS AGO" (Transmisión 6, `CST/celestial-cipher/cipher.js:~728`): 1970→2026 = 56 (voto grabado) / 1971→2026 = 55 (sin nombre). Coherente, pero cuidar la cifra en textos nuevos.

## 1.5 Personajes canónicos y su voz
| Personaje | Rol / datos clave | Voz (cita literal) |
|---|---|---|
| **Silvia** | Protagonista y única resolutora. Rigurosa, cálida, "curiosa con red", protectora (lectura de personalidad en `docs/SILVIA_PLAYTHROUGH_LOG.md` §4). Habla con Hermes por el Field Wire con respuestas prehechas. | — |
| **Carles** | Operador; en el canon secreto es **Pope-E** (jefe enmascarado de los BC Ashes) — solo Operador hasta la Torre I. En la historia visible: "The Petitioner / Seeker Companion" que pidió la aventura. | — |
| **Hermes / The Cartographer (of Distant Light)** | Alias por época: Hermes (1970-71) → "The Cartographer" (1971-2016) → "The Cartographer of Distant Light" (2016-26) → nombre humano restituido por Silvia (9-oct-2026, Estación 09). Guardián de Torre I. Habla del cielo "como quien mide distancias imposibles con ternura". Humor seco, formal, cálido en el Field Wire. Nunca resuelve los puzzles por ella. | *"You are not small. You are far. There is a difference."* (PAC:104) · *"What is far is not lost. It is simply on its way."* (firma Email 2) · Wire: *"Goats judge character very well."* |
| **Aurelia** | Astróloga-artista; azul cobalto (lapislázuli molido) y pan de oro. Canon secreto: sobrevivió, es **La Oráculo** desde 1971; memoria a medias; Silvia lo sabe desde la Estación 19. | — |
| **The Oracle (Desert Oracle)** | Mujer sin rostro que nunca se deja ver; túnica con capucha; parábolas cortas; "she". Ver Aurelia. **Nunca "Hermit"**. | *"You brought me a question. I give you heat and silence. Return when the smaller stone casts the longer shadow."* (PAC:29) |
| **The Mirror Speaker** | Guardiana de Torre III; elegante, pausada, ceremonial, **sin términos de teatro/ballet** en su boca; solo reflejada. **Nunca "Stage Mistress"**. | *"I was asked to show you one thing. I chose the thing that reflects. Look at the surface. Not the object."* (PAC:67) |
| **The Sanctuary Servant** | Anciano barbudo, encapuchado, con bastón; heraldo del atrio de Torre II; exige los 5 Cairns. Es el hombre que Hermes vio en 1998 y creyó el Oráculo. | — |
| **The BC Ashes** | Saqueadores del desierto que asaltaron la Torre I y robaron el Astrolabio; estandarte: **fénix/pájaro de fuego**; "BC" = *Before Christ* (secreto del Operador; se revela en Hoja 22B). Jefe: Pope-E (= Carles, secreto). | — |
| **The Eclipse Order (Archivo Central)** | Voz institucional de los despachos sin personaje: *"The Order does not write to many — and we do not write twice."* | `BIB:123` |

Reglas de voz: Hermes ve a Silvia como compañera (`"companions, not strangers"`); el Mirror Speaker no usa vocabulario teatral; los guardianes **solo narran/contextualizan** (Regla de Oro 7). Ver también el tono pre-hechas del Field Wire (parte B).

## 1.6 Vocabulario prohibido vs canónico
[DOC: `BIB:834-851`, `CLAUDE.md §3`, linter `scripts/audit/lint_lore_and_vocabulary.py`]

| ❌ Prohibido | ✅ Canónico | Razón |
|---|---|---|
| ❌ The Sunken Sanctuary / Sunken Oasis / Sunken Planisphere | **The Sandstone Sanctuary** (o Tower II / Sandstone Tower); **The Desert Oasis / Oasis Basin**; **The Planisphere Arena** | Torre II es de arenisca, no sumergida |
| ❌ The Coastal Amphitheater / The Coast / Coastal | **The Stage Tower** / **The Mirror Sanctuary** | No hay costa |
| ❌ The Hermit / Ermitaño / eremita | **The Oracle / The Desert Oracle** | |
| ❌ The Stage Mistress | **The Mirror Speaker** | |
| Azimuth | direction / heading / **bearing** | vocabulario accesible |
| Mucro / Mucrones | star pointer / marker / star tip | |
| Tympan / Mater | plate / disc / dial (horizon plate, base plate, casing, frame) | |
| Stereographic (projection) | star map / sky plan / altitude arcs | |
| "Cairn III de **bronce**" | **cobre** (placa de cobre) | DOB:94 |
| Títulos con florituras ("The Astrolabe of Distant Light" como título de hoja) | títulos limpios (*The Astrolabe*) | Regla de Oro 1 |

- **Excepción de impresión**: Hojas **4A y 5A** ya impresas conservan «stereographic», «Mater», «Tympan» (impresas 28-09-2026, antes de la lista del 10-10-2026). Única excepción del linter: `scripts/journal/build_page04_05.py`. [DOC: `BIB:18, 836-838, 966`; CÓDIGO: `lint_lore_and_vocabulary.py` `LEGACY_PRINTED_FILES`]
- El linter revisa `docs, emails, journal, scripts, web, .agents, .cursor` (`.md .html .js .css .json .py .mdc`), ignora `scratch/`. Jerga bloqueada en lo que ve Silvia: `web/ journal/ emails/ scripts/journal/`. [CÓDIGO: `lint_lore_and_vocabulary.py:26-70`]
- Nota: el linter solo comprueba Azimuth/Mucro(nes)/Tympan/Mater/Stereographic y los 5 patrones "Sunken/Coastal/Coast/Hermit/Stage Mistress". Otros nombres de lugar (p. ej. "The Sunken Planisphere") se cubren solo vía "Sunken". ❌ (término prohibido citado solo para vetarlo)

## 1.7 Reglas de oro de producción y principios de diseño (Capa 2)
1. Títulos limpios. 2. Estética renacentista Da Vinci/Kepler/Dürer (cross-hatching; cero dibujos de palo). 3. Cero colisiones texto–dibujo (margen 40–80 px). 4. Troquelado A5: cara A **X<165 px = 0 tinta**; cara B **X>1583 px = 0 tinta** (lienzo A5 1748×2480 @300 dpi; las caras de mapa a sangrado son la excepción). 5. Tipografía A5: títulos 62–66 px, cuerpo 35–38, notas 28–33, cotas ≥22. 6. Vocabulario accesible. 7. **Agencia de Silvia** (ningún personaje resuelve por ella). 8. Canon del Astrolabio (robado; nativo 6 estrellas: `Ald, Pol, Veg, Alt, Den, Arc`; el diario simula el resto) y las Tres Torres. 9. **Cero datos numéricos iniciales en el Cipher Ledger** (ella deduce cada letra; la web nunca muestra valores, solo ecuaciones). 10. Alfabeto A–Z estándar en fórmulas y coordenadas. 11. Higiene: nada suelto en raíz ni `scripts/journal/`; todo a `scratch/`. [DOC: `CLAUDE.md §4`, `AGENTS.md §4`]
- Otros invariantes: hojas físicas nombradas por **título impreso** entre «curly quotes», nunca "Sheet 13B" en texto de jugador (memoria del Operador; la web aún usa "Sheet NN" en algunos textos de Constellation — ver C-18); el Hub es solo en inglés; 22:22 como hora de envío.
- **Verificación obligatoria R3**: `python3 scripts/audit/lint_lore_and_vocabulary.py` (0 errores), `python3 scripts/journal/verify_sheets.py --sheets 19-26`, `python3 scripts/web/offline_list.py`; antes de desplegar `python3 scripts/audit/web_smoke.py` → ✅ ALL GREEN. **R4**: nunca `git commit/push` sin orden textual.

## 1.8 Canon secreto del Operador (spoilers; NO visible para Silvia antes de su estación)
- **La Oráculo es Aurelia** (BIB §12): ya revelado en la Estación 19. Sembrado en 13A–19 (azul cobalto, estrella de oro, pastor/mujer velada, luz con el código del disco, "She came from the edge of the sky with a disc in her arms and no name").
- **BC = Before Christ**; **Pope-E = Carles**; robó el Astrolabio porque el tesoro del juego es Silvia ("you were never only the seeker, you were always the treasure"); se obsesiona con llamarla *"the key"*. Revelación en **Torre I** (Bóveda). **WHERE = Viena · Wiener Staatsoper**. Nota 1 de Pope-E (Estación 20, wire 35): *«Let her through.»* [DOC: `BIB:1006-1014`; `docs/STAGE_PATH_BIBLE.md §9`]
- La Hoja 19A "The Unsent Letter" la escribió una Oráculo de hace siglos a la Mirror Speaker de su tiempo (no la anterior a Aurelia).

---

# 2. LOS EMAILS Y DESPACHOS

## 2.1 Inventario real (registro de Gmail "Enviados", comprobado 19-10-2026) [DOC: `BIB:97-109`]
Se enviaron **7 correos** desde `theeclipseorder.quest@gmail.com`. Los enlaces enviados apuntaban a proyectos Cloudflare Pages separados (`constellation-watch`, `radio-transmission`, `celestial-matrix`) antes de unificarse en `the-eclipse-order.pages.dev`.

| # (Bib.) | Fecha y hora | Asunto REAL (Gmail) | Estación | Hoja que cita | Enlace enviado | Fuente en repo | Estado |
|---|---|---|---|---|---|---|---|
| **Email 1** | mar 1-sep-2026 · 22:22 | `Tonight, something shifted.` | 01 | — | — (cuerpo = imagen pergamino) | `emails/general/01-opening-dispatch/*`, `assets/general/emails/parchment-email-01.html`, `web/assets/emails/email-01-parchment.webp` | ✅ enviado |
| **Email 2** | mié 2-sep · 22:22 (resp. 3-sep) | `The Cartographer of Distant Light` (registro) | 02→03 | — | `constellation-watch.pages.dev` (registro) / texto transcrito: `…/constellation/celestial-flower/` | `emails/constellation/01-cartographer-dispatch/02-cartographer-dispatch.html` (⚠️ texto distinto, ver abajo) | ✅ enviado |
| *(sin número)* Despacho radio | sáb 12-sep · madrugada 00:xx | `[INTERCEPTADO // FRECUENCIA 142.85 MHz] Nueva señal entrante detectada — Origen: Sector Sur` (adjunto `email_cover_ba…`) | 05 | — | `radio-transmission.pages.dev/#transmission-2` | **ninguno** (solo texto en BIB:204-220) | ✅ enviado |
| **Email 3** | lun 14-sep · 22:22 | `📻 [INTERCEPTED SIGNAL // THE ECLIPSE ORDER]` | 06 | Sheet 4 · Side B "The Planisphere" | `https://celestial-matrix.pages.dev/` | solo borrador "Opción B" en `emails/constellation/01-cartographer-dispatch/02-SEND-CHECKLIST.md` (mal rotulado) | ✅ enviado |
| **Email 4** | vie 25-sep · hora por confirmar | `The Zodiacal Outpost & The Dust of the Mainframe` (+ imagen) | 07 | Sheet 5 · Side B "The Zodiacal Engine" | `https://the-eclipse-order.pages.dev` | `emails/constellation/02-zodiac-dispatch/` (md, html, jpg, checklist) | ✅ enviado |
| *(sin número)* Despacho Est. 09 | jue 8-oct · 22:22 | `📻 [INTERCEPTED SIGNAL // THE ECLIPSE ORDER]` | 09 | Sheet 7 · Side A "The Celestial Cipher" | `https://the-eclipse-order.pages.dev` | **ninguno** (solo BIB:280-296) | ✅ enviado |
| **Email 5** | sáb 10-oct · hora por confirmar | `[Emergency Carrier · 142.85 MHz] A signal cuts through the sandstorm` | 09→Desert | Sheet 7 · Side B "Field Log: The Desert Frontier" | `https://the-eclipse-order.pages.dev` | `emails/desert/01-emergency-wire-dispatch/` (html + checklist) | ✅ enviado |

**Quién responde qué**: solo el Email 1 pide **respuesta por email** ("Reply … with the name of your path and nothing else"); Silvia respondió `THE CONSTELLATION PATH`. El Email 2 tiene "respuesta el 3 sep" en TL:12 / BIB:102 pero **no se documenta quién ni qué** (NO DEFINIDO). Los demás despachos no piden email: la respuesta es jugar en la web (consola/Hub, telégrafo). Email 5: "Tap the telegraph key and tell me where to step" = Field Wire (chat con respuestas prehechas).

**Ausencias**: en el registro Gmail **no hay ningún correo el 5-sep** aunque `puzzles/constellation/02-stolen-astrolabe/PUZZLE.md` ("🚀 Listo para entrega 5 sep 2026, 22:22"), `LORE:105` ("5 Sep") y el checklist de Email 2 ("Sábado 5 de septiembre a las 22:22h para el Fragmento 2") lo prevén. El canal real por el que Silvia recibió la Transmisión 1 / Estación 04 **no está registrado** (NO DEFINIDO). Tampoco hay correos documentados tras el 10-oct (Desert Path y Stage Path). `emails/desert/README.md` y `emails/stage/README.md` solo dicen "Plantillas… para…" (vacíos).

## 2.2 Contenido clave de cada correo

### Email 1 · 1-sep · `Tonight, something shifted.` ✅
- **Formato**: imagen A4 300 dpi (2480×3508) incrustada en el cuerpo (NO adjunto). Asunto en checklist: `Something shifted`; asunto real según Gmail: `Tonight, something shifted.` ⚠️.
- **Estructura del pergamino v4** (de `assets/general/emails/parchment-email-01.html` [CÓDIGO]): ◐ + apertura *"Tonight, something shifted."* → carta lore → reglas vagas → decisión (3 caminos) → firma *The Eclipse Order · XXII : XXII* → bloque cifrado (3 líneas de profecía en glifos). Fondo: tercio cielo (zapatilla de ballet muy sutil + Polaris), tercio pergamino, tercio dunas.
- **Texto realmente impreso en la imagen** [CÓDIGO]: *"A word, before the silence returns. The Order was not built for kings. It was built for those who notice: the grain of sand, the breath on glass, the star that arrives late. We do not call you by accident. Someone petitioned the Threshold on your behalf, someone who believed you would not turn away from wonder. Three guardians await. They disagree about everything. They agree on you. What follows is the first step toward what was hidden. Three roads lie before you. You will walk all of them. Some things will arrive. Some will wait. Keep everything. A journal will find you when you are ready. THE DESERT PATH — What the heat keeps. What the sand refuses to forget. THE STAGE PATH — What light reveals. What stillness holds in place. THE CONSTELLATION PATH — What distance hides. What only forms when you stop looking directly. Reply to this dispatch with the name of ONE path (nothing else). This choice cannot be undone. It opens the first door, not the last. When the stars return to this exact alignment, your chosen road will answer you. The Eclipse Order · XXII : XXII"*.
- ⚠️ **C-02**: BIB §3 transcribe como "texto literal" otro cuerpo ("Silvia, At 22:22 tonight, something shifted… ▸ THE DESERT PATH Heat. Silence. Things buried…" `BIB:119-157`), que es exactamente el borrador marcado **OBSOLETO** en `emails/general/01-opening-dispatch/01-opening-dispatch.md`. Manda la imagen (`parchment-email-01.html` / `web/assets/emails/email-01-parchment.webp`). El `.png` citado en `ES`, `docs/ASSETS.md:11` y la Biblia (`assets/email-01-parchment.png`) **no existe** en el repo (solo `.webp` en `web/assets/emails/`).
- **Profecía cifrada** (plaintext, 3 líneas, 117 letras): `YOU ARE THE REASON FOR ALL OF THIS. / WHEN YOU READ THIS YOU WILL KNOW HOW MUCH I LOVE YOU. / YOU WERE NEVER ONLY THE SEEKER YOU WERE ALWAYS THE TREASURE.` [DOC: ECLIPSE_SCRIPT.md, PM:85-89]. Letras presentes (19): A C D E F H I K L M N O R S T U V W Y. Ausentes (7): **B G J P Q X Z**. [calculado]
- **Recompensa**: acceso al Hub; *The Cipher Ledger* con 26 casillas en blanco (`—`).
- Plan descartado: profecías abstractas tipo "sand remembers", dominio `theeclipseorder.org`, borrador "What was hidden in sand will rise in light… On the twenty-sixth…" (`01-opening-dispatch.md`).

### Email 2 · 2-sep · "The Cartographer of Distant Light" ✅ (⚠️ doc vs archivo)
- Texto (BIB:170-199): *"To the one who looked up. Your response reached the Threshold: THE CONSTELLATION PATH… I am the Cartographer. The others (the Oracle in her sands, the Mirror Speaker in her quiet reflections) guard what is near… ✦ INTERACTIVE RESONANCE CONSOLE ✦ Access the Celestial Flower: 👉 …/constellation/celestial-flower/ … The crossroads ahead: Three celestial anchors will test your perception. When the third is complete, the Order will grant you a choice: to cross over toward the desert, or to leap into an uncharted abyss for which no maps exist. — The Cartographer of Distant Light · "What is far is not lost. It is simply on its way."*
- Recompensa: acceso a la Flower → glifos **D** y **C**.
- ⚠️ **C-03**: `emails/constellation/01-cartographer-dispatch/02-cartographer-dispatch.html` [CÓDIGO] no coincide con el texto enviado: su botón dice *"Enter The Celestial Matrix"* y pide la Hoja "Sheet 4 · Side B — The Planisphere" (es el contenido de la Estación 06, no de la 03). El `.md` de checklist `02-SEND-CHECKLIST.md` también está sobrescrito con "Checklist envío (The Celestial Matrix)" y sus pasos 1-5 describen a Silvia *"en su móvil… toca entre las estrellas de Cygnus … Se le indica el siguiente alineamiento: Sábado, 5 de septiembre a las 22:22h para el Fragmento 2"*. Texto "web/index.html redirige a la consola celestial-matrix" ⚠️ obsoleto (hoy `web/index.html` es el Hub de ~5000 líneas).
- Imagen/tarjeta: `web/assets/emails/email-02-fragment-1(.webp|-full.webp)`; plantilla `assets/constellation/celestial-flower/card-fragment-01.html`.

### Despacho radio · 12-sep (Estación 05) ✅
- Texto (español, BIB:204-220): *SISTEMA DE ESCUCHA DE LA ORDEN DEL ECLIPSE · REGISTRO DE MODULACIÓN // CANAL 142.850 MHz · PRIORIDAD: MÁXIMA · DESTINATARIA: SILVIA · 👉 [ENLACE A LA TRANSMISIÓN …#transmission-2]*. Imagen de portada: radio de válvulas con osciloscopio, ventana arqueada sobre dunas, luna creciente, mapas estelares.
- ⚠️ El asunto dice **142.85 MHz** pero la Transmisión 2 sintoniza **19.84 MHz** (la propia Biblia lo nota `BIB:220`). Único correo en español.

### Email 3 · 14-sep 22:22 (Estación 06) ✅
- *"Silvia, the mountain console has flickered to life. Have your journal open to Sheet 4 · Side B ("The Planisphere"). Solve the paper grid first, then access the emergency console: 👉 https://celestial-matrix.pages.dev/ The Cartographer is listening for your beacon."* Recompensa: letra **P** + placa Vector I (5 ecuaciones).
- La versión larga ("To the one who carries the codex…", asunto `[Dispatch] · Intercepted Transmission: The Celestial Matrix`) es el borrador que **no** se envió (BIB:239; `02-SEND-CHECKLIST.md` Opción A).

### Email 4 · 25-sep (Estación 07) ✅
- Asunto en checklist/md: `[Dispatch III] · The Zodiacal Outpost & The Dust of the Mainframe`; asunto real Gmail: `The Zodiacal Outpost & The Dust of the Mainframe` (con imagen `email-03-outpost.jpg`, 3508×2480).
- Texto (md/BIB:249-274): el Cartógrafo escribe "from the rocky ridges"; los asaltantes se han hundido en un puesto subterráneo; el *Central Command Mainframe & Star Atlas* está en cuarentena. "✦ THE PAPER KEY: SHEET 5 · SIDE B ✦ 1. Open … 'The Zodiacal Engine'. 2. Solve the 10 celestial cross-planes … 3. **Extract the second letter of each discovered word** to form the security override sequence." Enlace Hub. Objetivo: Estación 07.
- ⚠️ **C-04** (el mismo email se contradice con la hoja/web): el "segundo carácter de cada palabra" da `EEOPLEEOCO` (orden 1-9) y el checklist `03-zodiac-dispatch.md` lista 5 claves válidas (`EEOPLEEOCO`/`EEOLPEEOCO`, `PEOCO`, `EEOLE`, `PEOCOEEOLE`/`EEOLEPEOCO`, `ECLIPSE`); **el código solo acepta `ECLIPSE`** (los 7 círculos numerados 1-7) — `CST/zodiac-engine/zodiac.js:11,191`. Manda la hoja impresa 5B + el código. (BIB:275 ya lo reconoce.)
- `03-SEND-CHECKLIST.md` dice que "The Archives" aún no incluye el doc3; en código ya existe (`HC:2451` `archiveDocs.doc3` "DISPATCH 03 // SUBTERRANEAN OUTPOST"). Numeración: archivo/Hub = "Dispatch III" (Zodiac), Biblia = "Email 4" (Zodiac) y "Email 3" = Matrix. ⚠️ C-05.

### Despacho Estación 09 · 8-oct 22:22 ✅
- *"Silvia, the beacon at the southern cliff (Station 09) has just responded. Keep your journal close and open Sheet 7 · Side A ("The Celestial Cipher"). Cross the twenty-four coordinates from the dial on paper, then access the console to transmit the key: 👉 https://the-eclipse-order.pages.dev The Cartographer of Distant Light awaits your signal before the dunes."*

### Email 5 · 10-oct · "A Signal in the Sandstorm" ✅ (hora por confirmar)
- De: **Hermes · The Cartographer** (primera firma con el nombre). Texto: la radio de voz se rompió, pero un viejo cable de telégrafo de cobre sigue vivo desde su cornisa hasta la consola de Silvia; los asaltantes atascados "three leagues south"; él atrapado bajo la roca abierta; pide abrir la Hoja 7B ("Field Log: The Desert Frontier": "What notes did I write about crossing the gravel wash? Where did I build the stone shelter?") y "tap the telegraph key and tell me where to step". Cierre: *"The wind is fierce, but we have the stars and the stone. — Hermes · The Cartographer · THE ECLIPSE ORDER · EXPEDITION WATCH · ANNO 2026"*. Pre-header: *"Silvia, can you hear this? The copper wire telegraph is active. I need your guidance across the gorge."*
- Archivos: `emails/desert/01-emergency-wire-dispatch/01-emergency-wire-dispatch.html`, `…/01-SEND-CHECKLIST.md`.
- ⚠️ **C-06 (fecha)**: el checklist dice *"Fecha programada: **Sábado a las 20:00** (exactamente a las 24 horas del inicio de la tormenta)"* y su casilla previa "tormenta con botón al telégrafo cuando el tiempo restante sea ≤ 24 horas". La Biblia/TL dicen **10 oct** (sábado, hora por confirmar). El código tiene `SATURDAY_OCT_17_2026_8PM` como alias *legacy* de la constante actual (dom 18-oct 14:00) y una constante vieja `1792260000000` = **sáb 17-oct 20:00** (`SD:getStormTargetTime`). Ver §5: no se puede cuadrar "48 h" con "8–10 oct".

## 2.3 Dónde viven hoy en el Hub (Archives/Transmissions/Chronicles) [CÓDIGO: `HC:2428-2490`]
Archives: `doc1` (Dispatch I · pergamino, "1 SEP 2026 · 22:22 EXACT"), `doc2` (Dispatch II · Fragment 1), `doc3` (Dispatch III · Subterranean Outpost = email del 25-sep), `doc4` (Record 09-A · "The Man Behind the Maps", visible tras completar el Cipher; enlace a `celestial-cipher/index.html`), `vid1` (Optical Log 01 · The Shifting Tempest, `tempest_cinematic_master.mp4`, "STATION 08 · 00:24"). **No hay archivo** para el despacho radio (12-sep), el Email 3 (14-sep), el despacho 09 (8-oct) ni el Email 5 (10-oct).

---

# 3. ECLIPSE SCRIPT, PROFECÍA, GLIFOS Y CIPHER LEDGER

## 3.1 Diseño del revelado (plan original vs realidad)
| Plan original (`ECLIPSE_SCRIPT.md` / `TL:77-84`) | Realidad construida |
|---|---|
| Email 1: 0 letras (bloque ilegible) | ✅ igual |
| Grimoire 11-sep: 4–6 símbolos con clave visual | ⚠️ las hojas impresas 2A–3B muestran **los 26 glifos sin ninguna letra pre-rellenada** ("Strictly NO pre-filled letters", docstring de `scripts/journal/build_page02_03.py`) y la nota "*word translation* → *star alignment only*" tachada; GRI:35 dice "Registra ya las letras descubiertas en la Fase 1 (Y, O)" ⚠️ C-08 |
| Desert / Stage / Constellation: 5–8 letras por camino; octubre: alfabeto completo | Hoy: 12 glifos entregados en web (ver tabla), 14 solo en las hojas del alfabeto; los **valores** (Ledger) completan los 26 al cierre del Desert (invariante BIB §7.0) — ⚠️ J incumple (C-09) |

## 3.2 Orden impreso del alfabeto (Hojas 2–3) [CÓDIGO: `SHUFFLED_GLYPHS`, `build_page02_03.py`]
- **2A** (título impreso *"The Celestial Alphabet"* + intro "twenty-six signs uncovered across the ruined towers of the desert kingdom"): **K R D Y M B T** · **2B**: **O F W A S P C** · **3A**: **X H L U J E N** · **3B**: **Z Q G V I** + sección *"Convergence of the Bearings"* (Meridian Quadrant "Elevation index: 38° — Polaris alignment"; texto "This celestial alphabet is not a code of words, but of directions and coordinates… Follow the clues in strict order of discovery… Trust the geometry. The stars do not deceive."; firma *The Cartographer*; pie "Carved in the high desert, beneath the zenith of the solstices."). Cada glifo en caja de 840×~185 px con espacio de deducción.

## 3.3 Tabla completa de los 26 glifos: entrega, hoja, valor y estación que fija el valor
(Valores = canon del Operador, **nunca se muestran en la web/hojas**, Regla 9. Verificados algebraicamente: los 26 valores son distintos y cubren exactamente 1–26.)

| Letra | Veces en la profecía | Glifo entregado en la web (estación/juego) | Posición en hojas 2–3 | **Valor** | Ecuación(es) que lo fijan (estación) |
|---|:--:|---|---|:--:|---|
| **D** | 1 | **Est. 03** Flower ("Deneb") — modal de revelación | 2A | **18** | `D+F=24` (Est. 14 · Cairn II); check `Z+D=23` (Est. 19) |
| **C** | 1 | **Est. 03** Flower ("Cygnus") | 2B | **24** | `C−T=8` (Est. 14) |
| **P** | 0 | **Est. 06** Matrix (letra P; placa Vector I) | 2B | **21** | `B+P=38` (06) + `P−B=4` (09); check `P−A=14` (Est. 13) |
| **K** | 2 | **Est. 07** Zodiacal Engine (cofre) | 2A | **26** | `K+G=48` (06) + `K−G=4` (09) |
| **B** | 0 | **Est. 09** Cipher (modal de recompensas) | 2A | **17** | `B+P=38` (06) + `P−B=4` (09) |
| **G** | 0 | **Est. 09** | 3B | **22** | `K+G=48` (06) + `K−G=4` (09); `L+G=23` (Est. 17) |
| **V** | 2 | **Est. 09** | 3B | **12** | `E+V=14` (06) + `V−E=10` (09) |
| **F** | 2 | **Est. 09** | 2B | **6** | `F+T=22` (06) + `T−F=10` (09); `R×2=F` check (Est. 12) |
| **R** | 10 | **Est. 10** Chasm (3.er mojón/runa; "Chasm: R=3") ⚠️ ver nota | 2A | **3** | pista web "tercera runa" (Est. 10) → `R×2=F` (Est. 12) |
| **X** | 0 | **Est. 10** Chasm (Oasis Gate; premio) | 3A | **15** | `X+E=17` (Est. 10) |
| **Q** | 0 | **Est. 11** Salt Playa (pie del mojón sur) | 3B | **14** | `Q+E=16` (Est. 11); check `Q+Z=19` (Est. 13) |
| **Z** | 0 | **Est. 12** Lexicon (pie de la estela alta) | 3B | **5** | `O−Z=18` (Est. 12); check `Z+D=23` (Est. 19) |
| **A** | 7 | solo hojas | 2B | **7** | `A+O=30` (06) + `O−A=16` (07); `T−A=9` (Est. 11), `W+A=26` (Est. 15), `P−A=14` (Est. 13) |
| **O** | 13 | solo hojas | 2B | **23** | ídem; `O−Z=18`, `Y−O=2` (Est. 17) |
| **E** | 19 | solo hojas | 3A | **2** | `E+V=14`, `V−E=10`; `X+E=17`, `Q+E=16`, `N−E=9` (15), `I+E=12` (19) |
| **T** | 6 | solo hojas | 2A | **16** | `F+T=22`, `T−F=10`; `C−T=8`, `M+T=25` (18); `J×2=T` (22) |
| **W** | 7 | solo hojas | 2B | **19** | `W+A=26` (Est. 15) |
| **N** | 5 | solo hojas | 3A | **11** | `N−E=9` (Est. 15) |
| **S** | 6 | solo hojas | 2B | **13** | `S+U=17` + `S−U=9` (Est. 16) |
| **U** | 8 | solo hojas | 3A | **4** | ídem; `H−U=16` (Est. 18) |
| **Y** | 8 | solo hojas | 2A | **25** | `Y−O=2` (Est. 17) |
| **L** | 7 | solo hojas | 3A | **1** | `L+G=23` (Est. 17) |
| **H** | 8 | solo hojas | 3A | **20** | `H−U=16` (Est. 18) |
| **M** | 1 | solo hojas | 2A | **9** | `M+T=25` (Est. 18) |
| **I** | 4 | solo hojas | 3B | **10** | `I+E=12` (Est. 19) |
| **J** | 0 | solo hojas | 3A | **8** | `J×2=T` (**Est. 22**, Stage) ⚠️ |

- Glifos con entrega web: **12** (D, C, P, K, B, G, V, F, R, X, Q, Z). Solo-hoja: **14** (A E H I J L M N O S T U W Y).
- Nota de contradicción: la Biblia §7.A dice "R: Estación 10 (3.er mojón del Whispering Chasm)"; el Chasm muestra 6 runas **M-I-R-A-G-E** talladas en objetos (DOB:98-99), así que A, G, E, I, M también "aparecen" ahí. La Biblia solo cuenta R (+X) como glifo nuevo. Pendiente de aclarar con la parte B ([INFERENCIA]: son runas del santo y seña, no entregas de glifo).
- Los glifos de Est. 03 se muestran como **SVG inline** idéntico a `assets/general/glyphs/ecl-d.svg`/`ecl-c.svg` [CÓDIGO: `CST/celestial-flower/index.html:1308-1326`]. En las Est. 06 y 07 la letra se muestra como **texto latino enorme** (`.letter-hero` "P" / "K") — Regla de Oro 10. Ficheros `glyph_a/k/m/o.png` en `CST/zodiac-engine/` y `glyph_a..i.png` en `CST/celestial-matrix/glyphs/` no están referenciados por ningún HTML/JS [CÓDIGO: grep].

## 3.4 Cipher Ledger tal como lo define la Biblia y el código
**Estructura** [CÓDIGO: `HC:3286-3318` `CLUE_EQUATIONS`, `HC:3321` `isEquationUnlocked`]. **30 ecuaciones**: 20 con `requires` (flag de localStorage) + 10 sin `requires` (siempre visibles). Id → ecuación → estación → flag requerido:

| id | Ecuación (se muestra tal cual) | Estación | `requires` | Rol |
|---|---|---|---|---|
| `lat-deg` | `[K]+[G]=48°N` | 06 → Vector I "Latitude Degrees" | — | Fija K,G (con `diff-kg`) |
| `lat-min` | `[A]+[O]=30′N` | 06 "Latitude Minutes" | — | Fija A,O |
| `zod-diff` | `[O]−[A]=16 S` | 07 "Meridian Resonance" | — | Fija A,O |
| `lon-deg` | `[B]+[P]=38°E` | 06 "Longitude Degrees" | — | Fija B,P |
| `lon-min` | `[E]+[V]=14′E` | 06 | — | Fija E,V |
| `lon-sec` | `[F]+[T]=22″E` | 06 | — | Fija F,T |
| `diff-kg` | `[K]−[G]=4 N` | 09 "Meridian Parallax" | — | |
| `diff-pb` | `[P]−[B]=4 E` | 09 "Frontier Shift" | — | |
| `diff-ve` | `[V]−[E]=10 S` | 09 "Solar Amplitude" | — | |
| `diff-tf` | `[T]−[F]=10 W` | 09 "Polar Resonance" | — | |
| `chasm-xe` | `[X]+[E]=17` | 10 (Oasis Gate) | `order_whispering_chasm_completed` | X=15 |
| `playa-ta` | `[T]−[A]=9` | 11 (balanza/mojón) | `order_salt_playa_completed` | check |
| `playa-qe` | `[Q]+[E]=16` | 11 | `order_salt_playa_completed` | Q=14 |
| `stele-rf` | `[R]×2=[F]` | 12 | `order_desert_lexicon_completed` | R=3→F=6 |
| `stele-oz` | `[O]−[Z]=18` | 12 | idem | Z=5 |
| `falcon-pa` | `[P]−[A]=14` | 13 | `order_oasis_clepsydra_completed` | check |
| `falcon-qz` | `[Q]+[Z]=19` | 13 | idem | check |
| `cairn2-df` | `[D]+[F]=24` | 14 | `order_sun_monolith_completed` | D=18 |
| `cairn2-ct` | `[C]−[T]=8` | 14 | idem | C=24 |
| `cairn3-wa` | `[W]+[A]=26` | 15 | `order_sandstone_labyrinth_completed` | W=19 |
| `cairn3-ne` | `[N]−[E]=9` | 15 | idem | N=11 |
| `cairn4-sum` | `[S]+[U]=17` | 16 | `order_cairn_iv_completed` | S=13 |
| `cairn4-diff` | `[S]−[U]=9` | 16 | idem | U=4 |
| `cairn5-yo` | `[Y]−[O]=2` | 17 | `order_arch_solstice_completed` | Y=25 |
| `cairn5-lg` | `[L]+[G]=23` | 17 | idem | L=1 |
| `stele-hu` | `[H]−[U]=16` | 18 | `order_polybius_stele_completed` | H=20 |
| `stele-mt` | `[M]+[T]=25` | 18 | idem | M=9 |
| `oracle-zd` | `[Z]+[D]=23` | 19 | `order_oracle_horizon_completed` | check |
| `oracle-ie` | `[I]+[E]=12` | 19 | idem | I=10 |
| `gallery-jt` | `[J]×2=[T]` | **22** (Stage) | `order_whispering_gallery_completed` | J=8 |

- **Álgebra de los pares fundacionales** (Biblia §7.B.1–5): `O=23,A=7`; `K=26,G=22`; `P=21,B=17`; `V=12,E=2`; `T=16,F=6`. Silvia deduce cada par sumando y restando las dos ecuaciones (2·mayor = suma+resta). Todas las igualdades de la tabla quedan verificadas (script mío: 28 sumas/restas + las 2 proporciones `R×2=F` y `J×2=T` = 30/30 correctas con los valores canónicos).
- **Valores libres tras Est. 09**: lo que Silvia puede resolver con S01-S09 son 10 letras (K,G,A,O,B,P,V,E,T,F). La Biblia añade R por pista de Est. 10 (R=3) → 11 letras.
- **Estado real de Silvia** [CÓDIGO: `SP:120`, copia de su guardado Supabase del 12-nov]: `seeker_silvia_cipher_ledger = {O:23,A:7,K:26,G:22,P:21,B:17,V:12,E:2,T:16,F:6,X:15,Q:14,Z:5,R:3}` = exactamente las 14 letras "con valor al terminar la Est. 12" (BIB:543). Antes (24-oct) en su Ledger web solo tenía **O=23 y A=7** (`docs/SILVIA_PLAYTHROUGH_LOG.md:§3`); el resto lo llevaba en papel.
- **Siembra de O y A** (decisión del Operador): el Hub escribe `O=23, A=7` y marca `lat-min`/`zod-diff` como resueltas una sola vez (`order_silvia_oa_ledger_v1`, `HC:1101-1114`). ⚠️ Contradice la Regla 9 literal (cero valores precargados) y `BIB:167`; documentado en `WE` §3 como decisión del Operador (C-10).
- **Las 10 ecuaciones sin `requires`** (Vector I + Est. 07 + Est. 09) están **visibles desde el primer momento** en el Ledger, aunque Silvia no haya jugado las Estaciones 06/07/09 (spoiler potencial si abre el Ledger antes). [CÓDIGO: `HC:3288-3297` sin `requires`; `getVisibleEquations`].
- **Invariante §7.0** (3-nov-2026, Operador): al cerrar el Desert Path (Est. 19) Silvia debe poder calcular las **26 letras**; la Est. 13 no entrega letra nueva (solo comprobaciones: `P−A=14`, `Q+Z=19`). [DOC: BIB:537-547] ⚠️ Pero `J` sigue programada en la Est. 22 (Stage), y BIB:545 lo reconoce como pendiente ("hay que adelantarla a una estación del desierto entre la 14 y la 19"). Sin resolver en código (`gallery-jt` sigue en 22). → C-09.
- **The Surveyor's Balance** (`web/hub/js/ledger-balance.js`, Est. 13, parte B): enseña el método suma-diferencia en el Ledger; no da valores (estado `order_balance_state`).
- **Regla 9** [CÓDIGO]: nunca se muestra ningún valor; la tarjeta/recompensa de cada estación pone la ecuación y/o el glifo, no la solución.
- **Uso final de los 26 valores**: LPB:191-194 dice que al final "se revelan las coordenadas exactas y la butaca/clave" aplicando los valores a la profecía; **ningún documento ni código define esa mecánica final** → ❓ (ver hueco H-04).

---

# 4. LAS 9 ESTACIONES 01–09 (CONSTELLATION PATH · TORRE I)

## 4.0 Mapa de hojas del diario 1–7 y de sus archivos
Fuente autoritativa: `JOURNAL_SHEETS` en `BJ:431-523` + builders. Una hoja = A5 doble cara (1748×2480 px @300 dpi). Existen PDFs por cara en `journal/pageNN/pdf/pageNN_front_A5.pdf` / `_back_A5.pdf`, mockups en `journal/pageNN/mockups/`, hoja doble cara en `journal/impresion/hojas_doble_cara/Hoja_0N_*.pdf` y todo en `journal/impresion/00_DIARIO_COMPLETO_36_PAGINAS_A5.pdf`. **No hay sellos QR en las Hojas 1–7** (los QR existen solo en las caras de juego de 20A–26A: `journal/seals/seal_20A…26A.png`, `journal/stage_seals.json`).

| Hoja·Cara | Título impreso | Contenido | Estación |
|---|---|---|---|
| **1A** | *The Eclipse Order* (cubierta) | Boceto Da Vinci a lápiz (paloma, astrolabio armilar, dunas, espejo/escenario, rosa de los vientos) | — |
| **1B** | *The Uncharted Path* | Carta manuscrita del Cartógrafo (21 líneas) + sello Constellation. Texto: *"For centuries, our order believed every path had already been mapped. We were wrong… The first three markers are verified. The Astrolabe we recovered is only one piece of a much larger puzzle… Tonight I head north to follow the trail into the mountain pass… The path is real. We just have to walk it. — The Cartographer"* | llega con el diario (11-sep) |
| **2A / 2B / 3A / 3B** | *The Celestial Alphabet* / (sin título) / (sin título) / *Convergence of the Bearings* | Alfabeto de 26 glifos (K R D Y M B T · O F W A S P C · X H L U J E N · Z Q G V I) | glifos de S03,06,07,09… |
| **4A** | *The Astrolabe* | Lore: astrolabio armilar, "Suspension Throne" con plomada y *Three Rules of the Outer Dial*, tabla de épocas y curva de declinación solsticial | lore de S06 |
| **4B** | ***The Planisphere*** (juego C1) | Sopa de letras 12×12 circular, 16 palabras | **S06** |
| **5A** | *Anatomy of the Artifact* | Disección explotada tipo Da Vinci (Mater, Tympan, Rete, Alidade, Horse Wedge; ⚠️ jerga de 4A/5A ya impresa) | lore |
| **5B** | ***The Zodiacal Engine*** (C2) | Crucigrama de engranajes (10 palabras, 7 círculos numerados) | **S07** |
| **6A** | ***The Midnight Calibration*** | Planisferio nocturno, procedimiento de calibración en 4 pasos, Field Observation Log de 6 estrellas, fórmula `Delta = (Bearing + Altitude) − 38°` | **S08** (fase 1) |
| **6B** | ***The Midnight Transit*** (C3) | Campo de 12 estrellas con años luz y "The Six Chords of Distant Light" | **S08** (fase 2) |
| **7A** | ***The Celestial Cipher*** (C4) | Dial concéntrico I–XII × +45/+15/−15/−45 con 24 avistamientos | **S09** |
| **7B** | ***Field Log: The Desert Frontier*** | Cuaderno de campo "Autumn, 1998 — Twenty-eight years before the Call": I. The First Crossing into the Red Sands · II. Astronomy of the Dunes · III. The Three Cairns & The Copper Benchmark; cuadrante de altitud 90° con plomada 30°; panorama del cañón (Watchtower VI, 3 cairns); doble sello (Constellation + Desert); firma *The Cartographer* | Email 5 / transición |

Nota de nomenclatura de código: el builder histórico `build_page04_05.py` llama "Hoja 4/5 · Cara A/B (Páginas 6–9)" a lo que en el diario final son **4A, 5A, 6A y 7B** (`render_face_4a→4A`, `render_face_4b→5A`, `render_face_5a→6A`, `render_face_5b→7B`); `build_constellation_games.py` aún los llama "Hoja C1/C2" (docstring obsoleto: dice crucigrama de "6 términos" cuando son 10). `journal/constellation_games/mockups/game0N_*` son duplicados de prueba. Los nombres de PDF de `Hoja_11_…Clepsidra` / `Hoja_12_…Estela_Polibio` no coinciden con el contenido (Lexicon=11A, Clepsydra=12B, Polybius=17A) — ver C-17 (Parte B).

---

### Estación 01 · The Threshold — ✅
- **Camino/Torre**: Constellation · Torre I (umbral del cosmos). **Hojas**: ninguna (el diario aún no existía). ⚠️ BIB:523 la asigna a "Hoja 1 · Cara A/B" (C-11). **Archivos web**: tarjeta de Hub `HC:1178-1194` (`nodesData[1]`), `web/assets/emails/email-01-parchment(-full).webp`.
- **Historia**: Email 1, 22:22. La Orden invita a Silvia, "alguien petitionó el Umbral" (Carles, sin nombrarlo).
- **Mecánica y solución**: elegir camino por email; respuesta única: `THE CONSTELLATION PATH`. Sin pistas.
- **Recompensa**: Ledger en blanco; Hub; bloque cifrado de la profecía (3 líneas).
- **Field Wire**: no existe aún (lo abre la Est. 09).
- **Flags**: ninguno; la tarjeta es estática "COMPLETED" (`status-done-badge`).
- **Dependencias**: ninguna → desbloquea S02.
- **Verificación**: `web_smoke` §1 solo comprueba que `index.html` carga sin errores. No se testea ningún email.
- **Huecos/conflictos**: C-02 (texto literal), C-11 (hoja), asunto real vs checklist.
- **Fuentes**: BIB:97-167; `emails/general/01-opening-dispatch/`; `assets/general/emails/parchment-email-01.html`; `HC:1178-1194`.

### Estación 02 · Cartographer Arrival — ✅
- **Camino/Torre**: Constellation · "Umbral de la Montaña". **Hojas**: ninguna (⚠️ BIB:524 la pone en "Hoja 1 · Cara B", pero 1B es la carta *The Uncharted Path* que llega con el diario el 11-sep). **Archivos**: tarjeta `HC:1195-1215`; `web/assets/emails/email-02-fragment-1(.webp)`.
- **Historia**: Email 2, 2-sep 22:22. Se presenta **The Cartographer of Distant Light**: "I am the Cartographer. The others (the Oracle in her sands, the Mirror Speaker…) guard what is near. My duty is different: I guard what was set in motion long before we were given names." Anuncia "a journal will find you" ("the Vessel") y "three celestial anchors will test your perception".
- **Mecánica**: ninguna (carta + enlace a la Flower).
- **Recompensa**: Fragment 1; acceso a la Flower. Hub: "Cartographer Fragment 1", "Sacred Astrolabe Lore", "Handwritten Journal Summons — 56-day chronological expedition" (`HC:1205-1209`).
- **Field Wire / flags**: ninguno. **Dependencias**: S01 → S03.
- **Verificación**: ninguna específica.
- **Huecos/conflictos**: C-03 (HTML vs texto enviado), respuesta del 3-sep NO DEFINIDA.
- **Fuentes**: BIB:170-200; `emails/constellation/01-cartographer-dispatch/*`.

### Estación 03 · The Celestial Flower — ✅
- **Camino/Torre**: Constellation · Patio del Observatorio (Torre I). **Hojas**: ninguna (web). **Archivos**: `web/constellation/celestial-flower/index.html` (2680 líneas), `cartographer-illustration.jpg`, `logo-path-constellation.png`; tarjeta `HC:1216-1233`; miniatura `web/assets/thumbnails/celestial_flower_preview.webp`.
- **Historia**: el Cartógrafo abre "el primer archivo del cielo" (Archive of Distant Light). Despertar la flor expone las coordenadas del observatorio (desencadena S04).
- **Mecánica y solución exacta** [CÓDIGO: `…/index.html:1645-1714`]: unir **22 estrellas de Cygnus** arrastrando/tocando en un orden fijo de **25 vuelos**; empieza en **Deneb**. Un solo fallo → "Alignment Fractured · Sky Resets" y **reinicio total** (hay que hacerlo de una vez). Orden:
  - **Mov. I (1-6, "Crown Petals & Core")**: Deneb→Azelfafage→Omicron→Alrisha→Deneb→Omicron→**Sadr**.
  - **Mov. II (7-14, "Western Petals")**: Sadr→Delta Cygni→Fawaris→Iota Cygni→Kappa→Lambda→Mu→Rho→Sadr.
  - **Mov. III (15-22, "Eastern Petals")**: Sadr→Theta→Gienah→Zeta→Aljanah→Nu→Xi→Sigma→Sadr.
  - **Mov. IV (23-25, "Slender Stem & Golden Root")**: Sadr→Eta Cygni→Flower Crown→**Albireo**.
  - Hitos sonoros/hápticos en 6, 14 y 22. **Pista**: botón "Celestial Whisper" de **1 solo uso permanente** (`eclipse_flower_hint_used`; reseteable con `?reset_hint=1`). El *Codex "The Sacred Anatomy of the Flower"* describe los 4 movimientos con los nombres; "The sky will not whisper the next anchor to your hand. Take paper and pen…".
- **Recompensa**: modal "Log 01 · The Deneb Anchor": *"The light you connected left Deneb fifteen hundred years ago…"*; **glifos D y C** (únicos en la profecía); "These keys are solitary; each appears only once in the prophecy of the threshold"; "Awaiting the Next Alignment".
- **Field Wire**: no. **Flags**: `order_flower_completed` (⚠️ el juego arranca en estado **completado** salvo que valga `'false'`: `isFlowerSavedDone = getItem(...) !== 'false'`, línea 2621; para rehacerlo hay que pulsar el botón Reset de la propia página, línea 2558), `eclipse_flower_hint_used`. ⚠️ El Hub enlaza su "↺ Re-trace Constellation" a `celestial-flower/index.html#reset` (`HC:1231`), pero la página **no procesa ese hash** (solo `#confirm-warning`, `#hint-modal`, `#codex*`, `#figure`, `#preview*`): el enlace abre el estado completado sin reiniciar (C-24).
- **Dependencias**: S02 → desbloquea S04 (narrativamente).
- **Verificación**: `web_smoke` §1 (carga) y sección *offline* (`OFFLINE_GAME = "constellation/celestial-flower/index.html"`, `web_smoke.py:2581`). Sin test de jugabilidad.
- **Huecos**: PM:101-103, GRI:35 y `puzzles/constellation/01-celestial-flower/PUZZLE.md` dicen que revela **Y y O**; código/Biblia/checklist dicen **D y C** (C-08). `PUZZLE.md` además fecha la resolución el "2 sep 2026".
- **Fuentes**: BIB:524-525, 559-560; `PUZZLE.md`; `CST/celestial-flower/index.html`.

### Estación 04 · The Observatory Raid / The Severed Sky — ✅
- **Camino/Torre**: Constellation · Torreta Alta (Torre I). **Hojas**: ninguna. **Archivos**: `CST/celestial-flower-2/index.html` (1496 líneas) + `radio-transmission/index.html#transmission-1` + audio `radio-transmission/cartographer_raid.mp3`; tarjeta `HC:1234-1250` (`url: celestial-flower-2`, `replayUrl: radio-transmission#transmission-1`).
- **Historia**: el despertar de la Flor alerta a los **BC Ashes** (sensores); irrumpen, dinamitan las bóvedas y arrancan el **Astrolabio de la Luz Distante**. El Cartógrafo sobrevive en las catacumbas y emite la **Transmisión 1 (22.22 MHz)**.
- **Mecánica**: **no hay puzzle**. La bóveda colapsada ("0/22 ANCHORS · ALTAR SEVERED") se explora con zoom/pan; tocar sin arrastrar lanza una onda de choque (`addShockwave`); "Incident Log #02" (3 tarjetas: The Ambush at Dawn / The Violent Extraction / The Cartographer's Escape & Relay) y tarjeta de baliza "🚨 EMERGENCY CARRIER · 22.22 MHz" que lleva a la transmisión. Botón de pista "Whisper Lost" = 0 usos.
- **Transmisión 1** (00:37; BIB:336-354): *"SILVIA! SILVIA, LISTEN TO ME! I DO NOT HAVE TIME! THEY BROKE IN! … THEY TOOK THE ASTROLABE! I AM IN THE CATACOMBS… I SENT THE LAST CARRIER PIGEON WITH THE RECOVERY PROTOCOLS… FIND IT! RECOVER THE ASTROLABE! … SILVIA, I BELIEVE IN YOU… YOU ARE THE ONLY ONE WHO CAN DO THIS! [C4 VAULT BREACH DETONATION · TRANSMISSION LOST]"*.
- **Recompensa**: Hub: "Observatory Breach Recorded", "Transmission 1 (22.22 MHz)", "The Severed Sky Record" (`HC:1241-1245`). Transición obligatoria al diario físico.
- **Field Wire / flags**: ninguno específico (`cartographer_radio_active_slide` recuerda la diapositiva de la radio).
- **Dependencias**: S03 → S05.
- **Verificación**: `web_smoke` §1 solo carga.
- **Huecos/conflictos**: canal/fecha de entrega **no registrado** (C-12). `docs/ASSETS.md:23` dice que `cartographer_raid.mp3` dura 52 s; el dossier del Hub dice **00:37**; el audio vive en `web/constellation/radio-transmission/` (la Biblia cita `assets/constellation/radio-transmission/audio/…`).
- **Fuentes**: BIB:86, 336-354; LORE:105-112; `puzzles/constellation/02-stolen-astrolabe/PUZZLE.md`.

### Estación 05 · Emergency Radio Relay — ✅
- **Camino/Torre**: Constellation · Acueductos del Sur. **Hojas**: ninguna aún (el diario llega el 11-sep; abre el camino a la **Hoja 4B** "The Planisphere"). **Archivos**: `CST/radio-transmission/index.html#transmission-2`, `cartographer_desert_transmission.mp3`; tarjeta `HC:1251-1265`; `web/assets/thumbnails/radio_cover.webp`.
- **Historia**: el Cartógrafo escapó por el acueducto inferior hacia las dunas del sur y confirma que vive; "the carrier pigeon should be reaching Italy any moment now with my physical journal. Guard it with your life". Los asaltantes no pueden descifrar los engranajes del Astrolabio; él "no puede cartografiar su recuperación solo" → "Work through the stanzas and star charts. Find the coordinates."
- **Mecánica**: solo escuchar (botón "Decrypt Desert Transmission" 19.84 MHz, 01:31). Sin solución. Texto íntegro en BIB:358-379.
- **Recompensa**: "Survivor Beacon Locked (19.84 MHz)", "Transmission 2 Intercepted", "Planisphere Alert: Guidance to unlock the page “The Planisphere”" (`HC:1259-1262`).
- **Field Wire/flags**: ninguno.
- **Dependencias**: S04 (+ llegada del diario 11-sep) → S06.
- **Verificación**: §1 solo carga.
- **Huecos/conflictos**: email dice 142.85 MHz, audio 19.84 MHz (C-13). BIB:527 llama "apertura de Hoja 4B" a lo que en realidad abre el siguiente despacho.
- **Fuentes**: BIB:204-220, 358-379.

### Estación 06 · The Celestial Matrix — ✅
- **Camino/Torre**: Constellation · Torre I (Arena de Resonancia / consola de Terminal C-142). **Hojas**: **4B** *The Planisphere* (+ 4A *The Astrolabe* como lore). **Archivos**: `CST/celestial-matrix/index.html` (3619 líneas), `cartographer_matrix_relief.mp3` (00:26, 25.94 s), `glyph_p.png`, `journal_planisphere_preview.jpg`, carpeta `glyphs/`; tarjeta `HC:1266-1282`.
- **Historia**: tras el robo, la consola de la montaña "ha parpadeado" con energía de respaldo; Silvia debe resolver primero el papel ("do not try to guess the stars blindly"). Phase 3: Transmisión 3 y transición cinemática "Relaying Coordinates to Southern Dunes".
- **Mecánica y solución exacta**:
  - **Papel (4B)**: sopa circular 12×12 (astrolabio con horas romanas XII…XI). **16 palabras**: `CASSIOPEIA BETELGEUSE ALDEBARAN ANDROMEDA PLEIADES SOLSTICE ALIDADE POLARIS ECLIPSE ZENITH ALTAIR SYZYGY SIRIUS ORION NADIR VEGA`. Las 34 letras sobrantes forman la máxima oculta **`THE SKY REMEMBERS WHAT THE EARTH FORGETS`** [CÓDIGO: `BCG:124`; `scripts/journal/tests/test_game_c1.py`]. (Semilla `random.seed(21)`.)
  - **Web, Fase I "Cardinal Anchors"**: teclear 4 estrellas en sus sockets: **Norte (000°) = POLARIS · Este (090°) = ALDEBARAN · Sur (180°) = ALTAIR · Oeste (270°) = VEGA** (`CARDINAL_SOLUTION`, `index.html:2487`). Validación en vivo (mayúsculas/trim) y botón "Engage Cardinal Anchors"; error = sacudida + "CHECK 4 GUIDES".
  - **Fase II "Harmonic Mechanics"** (`MECHANIC_SOLUTION`, `:2494`): *Channel Alpha* "The celestial condition when three heavenly bodies align in an unbroken, straight line" → **SYZYGY**; *Beta* "The highest point in the celestial sphere, situated directly above the crown of the observer" → **ZENITH**; *Gamma* "The rotating brass sighting arm mounted on the back of an astrolabe, used to measure star heights" → **ALIDADE**.
  - **Fase III "Archive Resonance"**: transición animada (telemetría 01/04…04/04, 142.85 MHz) y reproductor de la Transmisión 3. Botón extra de pruebas "VIEW UNLOCKED RELICS & TRANSMISSION (PHASE 3)" y "View All Solved Answers" visibles para cualquier jugador.
  - **Ayuda**: *Cartographer's Field Notes* = glosario de las 16 guías en vocabulario simple (no hay pistas progresivas).
- **Recompensa**: letra **P** (`.letter-hero`); **placa Vector I** (5 ecuaciones): `[K]+[G]=48°` · `[A]+[O]=30′` (Latitud) · `[B]+[P]=38°` · `[E]+[V]=14′` · `[F]+[T]=22″` (Longitud). **Transmisión 3 (142.85 MHz, 00:26)**: *"Silvia! The signal came through… loud and clear! The console held! The raiders are marching south across the dunes toward the sandstone ruins… I've locked the first decrypted glyph onto your screen. Inscribe it into your codex…"* (BIB:383-397). Botón "PURSUE RAIDERS TO THE DUNES" → `zodiac-engine`.
- **Field Wire**: no. **Flags**: `order_matrix_completed` (el juego **abre ya completado** salvo valor `'false'`; `#phase-1` rejuega).
- **Dependencias**: S05 + papel 4B → S07.
- **Verificación**: §1 carga. Nada de jugabilidad.
- **Huecos**: la máxima **THE SKY REMEMBERS WHAT THE EARTH FORGETS** no tiene uso: LPB:130-131 dice que Silvia "volverá a esta sopa de letras más adelante" para extraerla → ⏳ pendiente (H-02). Las otras 9 palabras (BETELGEUSE, SIRIUS, CASSIOPEIA, ANDROMEDA, ORION, PLEIADES, NADIR, SOLSTICE, ECLIPSE) solo sirven de relleno/glosario. LPB:178 dice "Compara con su libreta (Hoja 2)"; en realidad las 5 ecuaciones se anotan en el Ledger.
- **Fuentes**: BIB:224-240, 383-397; LPB:§7; `CST/celestial-matrix/index.html:1925-2330,2487-2498`.

### Estación 07 · The Zodiacal Engine & Outpost Patrol — ✅
- **Camino/Torre**: Constellation · Puesto subterráneo en las estribaciones del desierto. **Hojas**: **5B** *The Zodiacal Engine* (+ 5A lore "Anatomy of the Artifact"). **Archivos**: `CST/zodiac-engine/index.html`, `zodiac.js`, `raycast.js` (1448 líneas), `styles.css`; tarjeta `HC:1283-1299`; Chronicles card-7 `index.html:1838`.
- **Historia**: los BC Ashes se hundieron en un puesto subterráneo del umbral del desierto; el *Central Command Mainframe & Star Atlas* está en cuarentena. Silvia lo reactiva y recupera el cofre que los asaltantes descartaron al aligerar el convoy; las órdenes interceptadas revelan su motivo (4.ª Cámara Prohibida).
- **Mecánica y solución exacta**:
  - **Papel (5B)**: crucigrama de engranajes con **10 palabras**: Across 4 **APOGEE**, 6 **ZENITH**, 7 **SOLSTICE**, 8 **ECLIPTIC**, 9 **HORIZON**; Down 1 **CELESTIAL**, 2 **SEXTANT**, 3 **POLARIS**, 4 **ALIDADE**, 5 **MERIDIAN** [CÓDIGO: `BCG:236-262`]. Siete casillas con círculo numerado 1-7: 1=E (ECLIPTIC), 2=C (CELESTIAL), 3=L (POLARIS), 4=I (ZENITH), 5=P (ECLIPTIC), 6=S (SEXTANT), 7=E (SOLSTICE) → **`ECLIPSE`**.
  - **Fase I web**: 7 casillas de una letra; `MASTER_KEY = 'ECLIPSE'` (`zodiac.js:11`). Error: zumbido y "MISALIGNED TEETH · CHECK THE CIRCLES IN YOUR JOURNAL". Acierto: engranaje bloqueado, tarjeta con **`[O] − [A] = 16`** ("Zodiacal Differential") y baliza 142.85 MHz.
  - **Fase II (3D raycast, 25×25, 640×400)**: sintonizar los 3 obeliscos — ☀ **Sol** (West Wing, 2.5/21.5), ☽ **Luna** (NE, 22.5/3.5), ✦ **Stella** (SE, 22.5/21.5) — abre la **Sanctuary Gate** (12.5/10.5); entrar y pulsar **E** en el **cofre de hierro** (12.5/12.5) — la victoria **no es automática** (`raycast.js:70-75, 907-946`). Radar arqueológico que no dibuja muros; con 3/3 marca el cofre solo en el borde. Controles WASD/flechas/E; táctil con D-pad.
- **Recompensa** (pantalla de victoria): letra **K** ("The secondary cardinal key recovered from the desert outskirts outpost"); `O − A = 16`; **Transmisión 4** (relé escrito; ⚠️ sin audio): *"…they dumped this cache inside these outpost ruins… they know the Astrolabe triangulates the Fourth Forbidden Chamber when aligned with the Three Ancient Towers! But look south… the sky is turning pitch black. A violent sandstorm is brewing…"* + **órdenes interceptadas** `[CLASSIFIED // FORWARD COMMAND · CH 284.10 kHz]` *"The Cartographer believed the stolen Astrolabe was only an observer's lens. He is blind… the dial triangulates the entrance to THE FOURTH FORBIDDEN CHAMBER. Lighten the convoy…"* (texto íntegro BIB:401-413).
- **Field Wire**: no. **Flags**: `order_zodiac_completed` (abre **ya completado** salvo `'false'`; `#3d`, `#victory`, `#completed` para saltos).
- **Dependencias**: S06 → S08.
- **Verificación**: §1 carga. Botones "View Solved State (ECLIPSE)" (título del botón filtra la solución) y "View Recovered Cache & Letter K" visibles a cualquier jugador (C-14).
- **Huecos/conflictos**: C-04 (el email pedía "second letter"). El hallazgo de la `K` conecta con `K+G=48`. `LPB` indica que la tormenta "todavía NO ha llegado" al terminar S07 (presagio solo).
- **Fuentes**: BIB:243-278, 401-413; LPB:§8; `CST/zodiac-engine/*`; `BCG:208-318`.

### Estación 08 · Midnight Calibration & The Shifting Tempest — ✅
- **Camino/Torre**: Constellation · Riscos del campamento (80% constelación / 20% desierto). **Hojas**: **6A** *The Midnight Calibration* y **6B** *The Midnight Transit*. **Archivos**: `CST/midnight-calibration/` → `index.html` (rig, 454 líneas) + `astrolabe.js` (856) → `transmission.html`/`transmission.js` (cinemática 24 s `video/tempest_cinematic_master.mp4` + Transmisión 5A) → `transit.html`/`transit.js` (789; 15 min) → victoria con Transmisión 5B; `storm.js`, `radio.js`, `desert*.{css,js}`, audio `audio/cartographer_tempest_alert.mp3` y `cartographer_tempest_victory.mp3`; tarjeta `HC:1300-1333`; vídeo extra en Archives (`vid1`).
- **Historia**: ventana de **medianoche astronómica** (Hub: `MIDNIGHT_CALIBRATION_TARGET_MS = new Date(2026, 8, 29, 0,0,0)` = **mar 29-sep 00:00 CEST**, `HC:2719`); desde entonces `isStation8Unlocked()` devuelve siempre `true` (`HC:1118`). Hermes usa su **astrolabio de campo de reserva** (réplica; holguras y backlash). Al calibrar Vega, la puerta de la montaña casi abre y estalla **The Shifting Tempest** ("a colossal wall of copper sand and violet lightning"): se pierden los asaltantes; Silvia debe enviar los vectores de tránsito antes de que muera la portadora (15 min). Sin tormenta de arena hasta la S09 (LPB:§8).
- **Mecánica y solución exacta**:
  - **Fase 1 (rig, hoja 6A)**: deslizadores **Alidade** (0-360°, inicia 30°) y **Rete** (0-360°, inicia 0°) con botones micrométricos ±1° y **atascos mecánicos** (umbral aleatorio 35-75° de recorrido grueso; "BACKLASH SLACK ±3°"). Fórmula impresa: **`Delta = (Bearing + Altitude) − 38°`**. Tabla de 6 estrellas guía (`GUIDE_STARS`, `astrolabe.js:10-62`): Polaris alt 30° brg 360° Δ352; **Vega alt 45° brg 90° Δ97**; Arcturus 45°/270°/Δ277; Aldebaran 15°/225°/Δ202; Deneb 15°/45°/Δ22; Altair 15°/180°/Δ157. **Solución: Alidade = 45° y Rete (limbo) = 97°** (Vega) → botón "Collimate Beam & Engage Vault Aperture" (`astrolabe.js:594`); segundo clic → `transmission.html`.
  - **Transmisión 5A** (alerta): *"Your ninety-seven degree Vega calibration was absolute perfection… It is the Shifting Tempest… The electrostatic storm will collapse our radio carrier in fifteen minutes! … we must transmit the nocturnal star transit vectors from Sheet Six, Side B."* (BIB:417-431; 01:04+).
  - **Fase 2 (transit, hoja 6B)**: cuenta atrás **15:00** (`INITIAL_DURATION_MS`), máx. 25:00, tres niveles de color (ámbar >10 min / naranja 5-10 / rojo <5), latido y tictac; **Signal Flare** (+5:00, tope 25:00) reaviva la portadora si se colapsa (no hay derrota). Clues impresas (6B): I Achernar (139 ly) · II "139+721" = **Rigel 860** · III "860−310" = **Betelgeuse 550** · IV "550−485" = **Aldebaran 65** · V **Capella 43** · VI **Polaris 433**. Entradas web (`transit.js:610-621`): **distancia total `2090`** (139+860+550+65+43+433; acepta "2090", "2090 ly"…), **polígono `HEXAGON`** (acepta `hexag…`, `hexág…`, `6-gon`) y **anclajes `ACHERNAR` + `POLARIS`** (cualquier orden). Error = mensaje específico por campo.
  - **Victoria**: Transmisión 5B (*"Two thousand and ninety light-years… the celestial hexagon… anchored between Achernar and Polaris!… All previous maps of the desert are now dead paper… dwells the only ancient soul who can read the shifted sands: The Desert Oracle."*).
- **Recompensa**: Hub: "Vega Meridian Resonance (97°)", "Hexagon Transit Constant (2090 ly)", "Bipolar Stellar Anchors (Achernar & Polaris)"; **no hay letra ni ecuación nueva**; mapa de ruta: "relic-8-text" = "2090 LY · 97°". Revela el nodo 09.
- **Field Wire**: no. **Flags**: `order_midnight_completed`, `seeker_<silvia|carles>_midnight_completed` (default `true` para ambos: `HC:642-663`), `order_station8_unlocked`, `order_station8_unlock_target`. `#victory` → redirige a `transit.html#victory`; `#replay`.
- **Dependencias**: S07 + ventana 29-sep → S09 (Hub: filamento 8→9 y nodo 9 se encienden al completar la 8; `HC:2819-2898`).
- **Verificación**: §1 carga. (Existen `scripts/journal/tests/test_page04_05.py` y `test_page06_07.py` sobre las hojas, no sobre la web.)
- **Huecos/conflictos**: C-15 (28 vs 29 sep). `astrolabe.js:181-686` conserva una "Fase 2" con el mismo temporizador que **no existe ya en `index.html`** (código muerto; la fase 2 vive en `transit.html`) [INFERENCIA].
- **Fuentes**: BIB:417-448, 530; LPB:§9; `CST/midnight-calibration/{astrolabe.js,transit.js}`.

### Estación 09 · The Celestial Cipher — ✅
- **Camino/Torre**: Constellation · Desfiladero Deserti Limen (Torre I); guardián **Hermes**. **Hojas**: **7A** *The Celestial Cipher* (+ **7B** *Field Log: The Desert Frontier* para la fase siguiente). **Archivos**: `CST/celestial-cipher/index.html` (1034 líneas), `cipher.js` (1310), `styles.css`, `transmission.html` (reproductor suelto), `audio/cartographer_sandstorm_emergency.mp3` (82.46 s) + `subtitles.json`, `assets/*.jpg`; tarjeta `HC:1334-1372`; Archives `doc4`.
- **Historia**: Deserti Limen y "The Man Behind the Maps" (la confesión que Hermes grabó en el dial de latón para Aurelia). Al transmitir el voto, **Hermes recupera su nombre tras 55 años** y estalla la gran tormenta roja.
- **Mecánica y solución exacta**:
  - **Papel (7A)**: dial concéntrico (12 ángulos horarios I–XII × 4 anillos de declinación +45°, +15°, −15°, −45°) y *Sighting Log* de **24 coordenadas** en 5 grupos: I "The Seeker's Identity" (3) `(IV,+45)(VII,−15)(II,+15)` = **YOU**; II "The Past Meridian" (4) `(IX,−15)(V,+15)(I,+45)(XI,−45)` = **WERE**; III "The Timeless Stance" (6) `(III,+15)(VIII,+45)(X,−15)(VI,+45)(IV,−15)(XII,−45)` = **ALWAYS**; IV "The Definite Sun" (3) `(I,−15)(VII,+45)(V,−45)` = **THE**; V "The Final Mystery" (8) `(X,+15)(III,−45)(VIII,−15)(VI,−45)(IX,+45)(II,−45)(XI,+15)(XII,+15)` = **TREASURE** [CÓDIGO: `BCG:495-516`]. Cajas de respuesta por palabra: 3+4+6+3+8.
  - **Web — puerta de contraseña** (`cipher.js:90-130`): teclear **`YOU WERE ALWAYS THE TREASURE`** (se ignoran mayúsculas, puntuación y espacios). Error: "✕ The gears do not mesh. Align the 24 sightings from the page “The Celestial Cipher”…". Para Carles hay `Dev Bypass`.
  - **Lectura** (4 capítulos, scroll con atmósfera y farol): I **The Alpine Turret** · II **The Cataclysm** · III **The Ashen Waste** · IV **The Distant Light** ("the confession carved into brass"); termina en "Return to the Present · Transmit the Vow".
  - **Radio modal 142.85 MHz** (Transmisión 6, 01:22; BIB:451-466): *"SILVIA! … THOSE WORDS… YOU SPOKE THE VOW I CARVED INTO THAT BRASS DIAL FIFTY-SIX YEARS AGO!… YOU GAVE ME BACK MY TRUE NAME! … THE GALE IS COLOSSAL—IT IS SEALING THE MOUNTAIN PASS BEHIND YOU! OUR JOURNEY OF MOUNTAIN NUMBERS IS FINISHED! … ONLY THE ANCIENT LANGUAGES OF THE SAND CAN GUIDE YOU!… I WILL BE WAITING FOR YOU AT THE EDGE OF THE SANDS! [ANTENNA MAST TORN DOWN · CARRIER COLLAPSED · RECONNECT IN THE DESERT PATH]"*.
  - **Modal de recompensas** (`index.html:883-1000`): "Sacred Glyphs of the Eclipse Script" **B, G, V, F** + "The Alpine Differential Equations": **Meridian Parallax `K − G = 4 N`**, **Frontier Shift `P − B = 4 E`**, **Solar Amplitude `V − E = 10 S`**, **Polar Resonance `T − F = 10 W`**. Botón único "🌪️ The Storm Has Arrived · Brace for Impact ➔".
- **Recompensa**: glifos **B, G, V, F** (B,G ausentes de la profecía; V,F aparecen 2 veces); 4 ecuaciones → completan los 5 pares fundacionales; voto de Hermes; nombre "Hermes". Hub: "Threshold to Desert Path".
- **Field Wire**: se **abre** aquí: guardia `isWireUnlocked = isCipherCompleted || order_desert_path_unlocked || order_sandstorm_wire_unlocked || ?wire=1 || window.forceWireAlert` (`HC:410-417`). Pasos 0-4 = capítulo de la tormenta (ver §5).
- **Flags** (`cipher.js:104-115, 690-693, 1006-1009, 1052-1064`): `order_cipher_unlocked`, `seeker_<u>_cipher_unlocked`, `order_cipher_completed`, `seeker_<u>_cipher_completed`, `order_sandstorm_triggered`, `order_sandstorm_active`, `seeker_<u>_sandstorm_active`, `order_sandstorm_target_time` (= `1792324800000`), `order_sandstorm_start_time` (si falta = target − 48 h), `order_sandstorm_wire_unlocked`, `order_desert_path_unlocked`, `order_cipher_reward_claimed`. Por defecto el Hub marca S08 y S09 completadas para ambos perfiles (`HC:640-672`).
- **Dependencias**: S08 → Desert Path / Field Wire.
- **Verificación**: §1 carga y sección 2 "Silvia (storm)" abre todas las vistas.
- **Huecos/conflictos**: C-06, C-16 (tormenta 48 h), C-18 (textos de "Sheet NN"). Transmisión 6 dice "fifty-six years ago" mientras otros textos dicen 55. `transmission.html` standalone no está enlazada desde el flujo principal [INFERENCIA].
- **Fuentes**: BIB:280-296, 451-466, 470-531; LPB:§10; `CST/celestial-cipher/*`; `BCG:473-570`.

---

# 5. LA TORMENTA DE ARENA DE 48 H Y LA TRANSICIÓN AL DESERT PATH

## 5.1 Qué dice la Biblia (§5, BIB:470-515)
- Tras la S09 el **Hub Central** (`web/index.html`) queda bloqueado por *The Shifting Tempest — cataclysmic sandstorm lockdown* durante **48 h**, hasta el **dom 18-oct-2026 14:00** (constante `SUNDAY_OCT_18_2026_2PM = 1792324800000`, `HC:638`).
- Arquitectura: clase `body.sandstorm-lockout-active` (scroll bloqueado, Hub desenfocado), overlay `#sandstorm-lockout-overlay` con canvas de **240 partículas** a 60 FPS, líneas CRT, ruido, relámpagos aleatorios cada 8-17 s; sintetizador de viento Web Audio (ruido rosa/blanco de 3 s en bucle, band-pass 380 Hz, Q=2.2, LFO 0.18 Hz) con botón "🔊 Storm Audio: ON / 🔇 Muted"; baliza `142.85 MHz // CARRIER SIGNAL LOST · CRITICAL INTERFERENCE`; título **`CONNECTION FAILURE`**; mensaje *"We cannot establish contact. Signal with the Hub has been completely severed due to the raging sandstorm."*; reloj `[HOURS]:[MINUTES]:[SECONDS]`; barra de progreso "ESTIMATED SIGNAL RE-ACQUISITION WINDOW".
- **Tarjeta del cable de cobre a ≤24 h** (`#storm-emergency-wire-card`): baliza `EMERGENCY COPPER WIRE SIGNAL · 142.85 MHZ`; *"A telegraph key is twitching through the sandstorm! Hermes is trapped under a cliff ledge and needs your guidance from Sheet 7B."*; botón `⚡ Answer Telegraph Line · Guide Hermes ➔` → desactiva la tormenta y abre `#view-field-wire` (The Cliffside Workshop / Ask Hermes).
- Durante la tormenta Silvia podía abrir *The Cipher Ledger* (`#view-cipher`) con botón flotante "🌪️ Return to Storm Signal Alert".
- Sandbox de Carles (`isCarles`, `?dev=1`, local): `Bypass Storm`, `24h Wire Alert`, `Reset 48h`, `Expire Timer`. Parámetros `?storm=1` (fuerza), `?storm=0`/`?bypass=1`, `?wire=1`.

## 5.2 Qué hace realmente el código hoy [CÓDIGO: `SD`, `cipher.js`, `HC`]
1. **Para Silvia la tormenta ya no existe**: `isStormActive()` devuelve `false` siempre que el perfil sea Silvia ("Silvia live: the storm is over; she has reached Watchtower VI", `SD:85`), y en cada carga del Hub se borran `seeker_silvia_sandstorm_active`/`order_sandstorm_active` y se fija `order_sandstorm_wire_unlocked=true`, `order_storm_tester_bypassed=true` (`SD:520-528`; `HC:3470-3478`). El bloqueo descrito en BIB §5 "Estado de Silvia: BLOQUEADA" es histórico.
2. `getStormTargetTime()` fija para Silvia siempre `1792324800000` (dom 18-oct 14:00); Carles puede sobrescribirlo (`DURATION_48H_MS` solo se usa en "Reset 48h").
3. **La tarjeta del cable (≤24 h) aparece desde el primer momento** si `order_sandstorm_wire_unlocked==='true'`, y `cipher.js:1062` ya lo activa al reclamar las recompensas de la S09 → el umbral "24 h" es nominal (`SD:291-296`).
4. Estado guardado de Silvia (`SP:95-96`): `order_sandstorm_start_time = 1792087200000` = **jue 15-oct 20:00 CEST**; `order_sandstorm_target_time = 1792324800000` = dom 18-oct 14:00 → ventana de **66 h**, no 48. La constante antigua `1792260000000` (**sáb 17-oct 20:00**) = start + 48 h está tratada como "legacy" en `SD`.
5. El **Field Wire** pasa a ser el canal: "The Cliffside Workshop" (chat con respuestas prehechas) + pestaña "Ask Hermes" (`FIELD_INQUIRIES`); el botón del chat de la cabecera es un interruptor.

## 5.3 El capítulo de la tormenta en el Field Wire (pasos 0-4) [CÓDIGO: `HC:4479-4585`, constante `EXPEDITION_THREAD`]
Hermes, bajo una repisa de roca cerca de **Outer Watchtower VI**, con un telégrafo improvisado ("old telegraph repeater"). Sin esperas horarias en estos pasos [CÓDIGO: las pausas `WIRE_RESTS` solo existen en los pasos 12 y 20, `HC:7062-7066`; las marchas empiezan después del Dawn].
| Paso | Beat | Opciones de Silvia (ids) | Efecto |
|---|---|---|---|
| **0** | Primer contacto: arena roja "like broken glass", pregunta si hay señal | `choice-0-grounded` ("I'm here. The signal is crystal clear…") · `choice-0-protective` ("Find secure cover…") · `choice-0-cipher` ("Loud and clear. I solved your celestial cipher at the cliff…") | tono warm/protective/analytic; Hermes pregunta cómo llamarse |
| **1** | ¿Qué nombre me das? | `choice-1-name-hermes` ("Hermes — We are companions in this desert…") · `…-cartographer` ("The Cartographer") · `…-order` ("The Cartographer of Distant Light") | guarda `order_cartographer_title`; Hermes pide abrir la página «Field Log: The Desert Frontier» |
| **2** | Refugio (3 secciones de 7B) | `choice-2-wash-flint` (Sección I → pedernal + juníper) · **`choice-2-cairns-compass`** (Sección III → **brújula de latón 1998**, placa gemela de cobre; *la que eligió Silvia*) · `choice-2-lookout-spyglass` (Panorama → lente quemada con sigilo de ceniza) | `item` en la alforja (`order_satchel_expedition_item`) |
| **3** | `isCompassInput`: ¿rumbo de la placa? | `choice-3-bearing-direct` → **112° E** ("112° E // WATCHTOWER VI") | Hermes llega a la puerta de la Watchtower VI |
| **4** | `completed:true` — final | — | Hermes enciende fuego; "When the sandstorm calms down, we will meet at dawn to survey Wadi al-Hajar." |
- Elecciones reales de Silvia: `order_field_wire_choices = [2,0,1,0,…]` → paso 0 "Loud and clear. I solved your celestial cipher…", paso 1 "Hermes", paso 2 "Section III", paso 3 "112° E" (`SP:46`; `docs/SILVIA_PLAYTHROUGH_LOG.md §2`). El título guardado: `order_cartographer_title="Hermes"`.
- **Canon de la placa gemela** (fijado 19-10-2026): la 7B dice que bajo Cairn III está la *primera* placa; Hermes lee el rumbo en la **segunda placa gemela** al pie de la senda de Watchtower VI y recupera su brújula; no llega a Cairn III hasta la Estación 15 (BIB:67-69, 960; DOB:88).
- `HERMES_TONE_MAP` (`HC:5220-5224`) guarda el tono de Silvia (`warm / protective / tactical / analytic`) para que Hermes lo recuerde después.

## 5.4 La transición hasta el Chasm (resumen; detalle en Parte B)
1. **Amanecer ("Dawn")**, claves `order_dawn_step` (0→3) y `order_dawn_choices` (Silvia `[1,1]`): paso 0 "The Great Silence" (¿qué Ley de la Hoja 8A?; eligió Ley 1 la Sombra Meridiana), paso 1 "The Dry River · Wadi al-Hajar" (corazonada del río; eligió "chalk mark every hundred paces"), paso 2 **Cairn I** (juego de apilar piedras; resuelto en 16 movimientos, óptimo 15), paso 3 final: **Sello del Wash River** en la alforja (`order_seal_cairn_1`, `order_cairn1_completed`).
2. **Marcha de 26 h** al North Portal (`order_chasm_march_start` = jue 22-oct 18:00 CEST) → Estación 10 The Whispering Chasm (24-oct, completada 12:51).
3. Hoja 8A *The Desert* ("Of Sun, Silence, and Buried Stone") entra en juego aquí: *Three Laws of the Waste* (Meridian Shadow, Dry Wash, Benchmark Plate).
4. Lema del camino: *«What the wind covers, the sun shall reveal.»*

## 5.5 Aspectos técnicos del Hub durante la tormenta (ya apagados para Silvia)
- Ayudantes: `window.SandstormLockdown.{activate,deactivate,toggle}`; `window.getStormTargetTime`; `window.forceWireAlert`; `sessionStorage 'order_sandstorm_wire_answered'` (responder el telégrafo solo cierra el overlay en esa sesión).
- Cada perfil guarda su propia aventura (`window.EclipseProfiles`, `eclipse_profile_vault_<perfil>`); un perfil sin baúl arranca en el punto canónico (`syncWaypointBaseline`: paso 4 del chat, amanecer 0).

---

# 6. CALENDARIO REAL (TIMELINE) VS ESTADO ACTUAL

## 6.1 Calendario previsto en el plan original (TL:42-84) — SUPERADO
Semanas 0–8 (1-sep → semana final ≈ 20–26 oct; 56 días ≈ 27-oct), 2–3 entregas/semana, "Alfabeto completo en octubre". **No** es el calendario real; ni la duración (56 d) ni las semanas se cumplieron.

## 6.2 Calendario real reconstruido
| Fecha (CEST) | Hito | Evidencia | ¿Entregado a Silvia? |
|---|---|---|---|
| mar 1-sep 22:22 | Email 1 | BIB:99-109; TL:12 | ✅ |
| (1/2-sep) | Silvia responde `THE CONSTELLATION PATH` | BIB:165 | ✅ |
| mié 2-sep 22:22 | Email 2 → Flower (S03). Resuelta el 2-sep | TL:13; PUZZLE.md | ✅ |
| jue 3-sep | "respuesta" de Silvia al Email 2 | BIB:102 | contenido NO DEFINIDO |
| sáb 5-sep 22:22 | Previsto: S04 / "Fragmento 2" | PUZZLE.md; checklist 02; LORE:105 | ❓ sin envío registrado |
| vie 11-sep | Entrega física del diario en Italia (hojas 1–7 al menos) | TL:14 | ✅ (fecha) · método NO DEFINIDO |
| sáb 12-sep 00:xx | Despacho radio · S05 | BIB:103 | ✅ |
| lun 14-sep 22:22 | Email 3 · S06 | BIB:104 | ✅ |
| vie 25-sep | Email 4 · S07 | BIB:105 | ✅ (hora por confirmar) |
| 28/29-sep 00:00 | Ventana S08 (TL: "28 sep"; código: **29 sep**) | HC:2719; TL:18; LPB:§9 | ✅ |
| jue 8-oct 22:22 | Despacho S09 | BIB:106 | ✅ |
| 8–10 oct | Voto + tormenta; Email 5 (sáb 10-oct) | BIB:107,481 | ✅ |
| 15-oct 20:00 | `order_sandstorm_start_time` en el guardado de Silvia | SP:95 | [dato] |
| dom 18-oct 14:00 | Fin de la ventana de tormenta | HC:638 | ✅ |
| 22-oct | Amanecer + Cairn I; 18:00 empieza marcha 26 h | SP; PLAYTHROUGH_LOG | ✅ |
| 24-oct 12:29→ | Chasm (12:35-12:51), Salt Playa, … | PLAYTHROUGH_LOG | ✅ (Parte B) |
| 12-nov 10:51 | Punto canónico: pies del Sun Monolith (S14 no empezada) | SP:1-5 | ✅ (a fecha 12-nov; hoy 16-nov puede haber avanzado: NO VERIFICADO) |
| **vie 18-dic** (WHEN: 18–20 dic) | Cita del ballet | BIB:821 | ⏳ |
| Día final | Cumpleaños 23 + Bóveda | TL:25 | ⏳ fecha NO DEFINIDA |

## 6.3 Qué está entregado y qué no (Parte A)
- **Entregado/jugable ✅**: Estaciones 01–09 completas en web; Hojas 1–7 impresas y en el diario (PDF + `journal/impresion/00_DIARIO_COMPLETO_36_PAGINAS_A5.pdf`); 7 correos; 6 transmisiones de audio (T1, T2, T3, 5A, 5B, 6) más el relé escrito T4; Field Wire pasos 0-4 (tormenta) y Dawn.
- **Defaults de reproducción**: las Estaciones 03, 06 y 07 se abren **ya completadas** en el navegador si no existe su flag a `false`; 08 y 09 se marcan completadas por defecto para ambos perfiles. No hay candados reales de progreso. El avance real de Silvia consta en la nube (`order_*_completed` del Constellation Path ≤ 22-oct, `docs/SILVIA_PLAYTHROUGH_LOG.md §1`); la fecha exacta de resolución de cada estación es NO DEFINIDA salvo la S03 (2-sep, `PUZZLE.md`).
- **Pendiente de toda la partida (otras partes)**: Desert 14–19 (jugables en Hub, Silvia en la 14), Stage 20–28 (20–22 jugables; 23–28 ⏳), Torre I y Bóveda (WHAT) ❓, cartas finales ❓.
- **Entrega física de otras hojas**: Stage 19–26 "que Silvia recibe juntas" (TL:24, `STAGE_PATH_BIBLE`); entrega de 8–18 **NO DEFINIDA en mis fuentes**.

---

# 7. CONFLICTOS, HUECOS Y DATOS TRANSVERSALES

## (a) LISTA DE CONFLICTOS
| ID | Tema | Fuente A | Fuente B | Cuál parece vigente y por qué |
|---|---|---|---|---|
| C-01 | Duración del juego | PM:15, Email 1, `CLAUDE.md`: "~56 días" (→ ~27-oct) | WHEN = 18-dic (108 días desde 1-sep); Email 1 promete "fifty-six days" | La web/estado real manda: el juego dura hasta el 18-dic. Hay que decidir cómo se cierra la promesa de "56 días" (Email 1 y tarjeta de la S02) o reencuadrarla como la fase "cumpleaños". |
| C-02 | Texto literal del Email 1 | BIB:119-157 ("Silvia, At 22:22 tonight…" + ▸ caminos) = borrador OBSOLETO de `01-opening-dispatch.md` | `assets/general/emails/parchment-email-01.html` (imagen enviada: "A word, before the silence returns…") | **El HTML del pergamino** (el correo fue una imagen). Corregir la Biblia. |
| C-03 | Email 2 | BIB:170-199 (enlace a Celestial Flower; asunto `The Cartographer of Distant Light` / `[Dispatch II] · Fragment 1…`) | `emails/constellation/01-cartographer-dispatch/02-cartographer-dispatch.html` (Matrix + Sheet 4B) y `02-SEND-CHECKLIST.md` (reescrito para Matrix) | Biblia/TL (lo enviado). Los archivos del repo fueron reutilizados/sobrescritos; recuperar el texto enviado. |
| C-04 | Clave de la hoja 5B | Email 4 y `03-zodiac-dispatch.md`: "second letter of each word" → `EEOPLEEOCO` (+4 variantes válidas) | `zodiac.js:11,191`: solo `ECLIPSE`; hoja 5B: 7 círculos numerados | Hoja + código (`ECLIPSE`). El email induce a error (BIB:275 lo admite). |
| C-05 | Numeración de despachos | BIB: Email 3 = Matrix (14-sep), Email 4 = Zodiac (25-sep), Email 5 = Emergency | Repo/Hub: carpetas 01-opening, 02-cartographer, 03-zodiac, desert/01; Hub archive "Dispatch III" = Zodiac; checklist 02 = Matrix | Definir una numeración única en la guía (propuesta: por fecha de envío, 7 correos). |
| C-06 | Fecha/hora del Email 5 y tormenta | BIB:107 / TL:20: 10-oct (hora por confirmar) | `emails/desert/…/01-SEND-CHECKLIST.md`: "Sábado 20:00 (a las 24 h del inicio de la tormenta)"; `SD`: constantes legacy sáb 17-oct 20:00 | 10-oct (registro Gmail) para el envío; confirmar hora en Gmail. El checklist describe un plan anterior. |
| C-07 | WHEN = ¿fecha y hora? | `CLAUDE.md §2`, `AGENTS.md`, PM:68, PAC:11: "Fecha y hora" | BIB:821, 890: "18–20 dic, **sin hora**" (decisión Operador, 11-2026; 18A pasa a "day and season" en reimpresión) | Biblia (decisión más reciente). Actualizar AGENTS/CLAUDE/PM. |
| C-08 | Primeras letras reveladas | PM:101-103, GRI:35, `PUZZLE.md`: **Y y O** | Código/BIB/checklist: **D y C** | **D y C** (código + diseño "solitarias"; Y×8 y O×13 no son solitarias). |
| C-09 | Invariante "26 letras al cerrar el Desert" | BIB:539-547 (todas las letras antes de la 19) | `gallery-jt` (J) sigue en Est. 22 (Stage); BIB:545 lo reconoce | Pendiente: mover J a una estación 14–19 (decisión del Operador no ejecutada). |
| C-10 | Ledger "cero valores precargados" | `CLAUDE.md §4.9`, `BIB:167`, `LPB` | `HC:1101-1114`: se siembran O=23, A=7 para Silvia (`order_silvia_oa_ledger_v1`); `SP:120` incluye 14 letras | Decisión explícita del Operador (WE §3); documentar la excepción. |
| C-11 | Hojas de S01/S02 | BIB:523-524: "Hoja 1 · Cara A/B" | `BJ:434-435`: 1A = cubierta, 1B = *The Uncharted Path* (carta que llega el 11-sep); S01/S02 son emails de 1-2 sep | Las S01-S02 no tienen hoja; la Biblia confunde. |
| C-12 | Entrega de la Estación 04 | PUZZLE.md/LORE:105/checklist 02: 5-sep 22:22 | Registro Gmail (BIB:97-109): sin correo el 5-sep | NO DEFINIDO: ¿canal alterno (WhatsApp/Hub)? Preguntar al Operador. |
| C-13 | Frecuencia de la Transmisión 2 | Asunto del email 12-sep: 142.85 MHz | Audio y Hub: 19.84 MHz (BIB:220 lo nota) | 19.84 MHz (audio); el asunto del email es un lapsus/gancho. |
| C-14 | Atajos de solución expuestos | Regla 9 y `hide-solve-shortcuts.js` ocultan "solve all" del Desert a no-admin | En Constellation los botones "View Solved State (ECLIPSE)" (title revela la clave), "View All Solved Answers", "View Recovered Cache & Letter K" son visibles para cualquiera (`zodiac-engine/index.html:101-109`, `celestial-matrix/index.html:2002`) | Sin gatear. Aceptable si el camino ya está completo para Silvia; decidir si se ocultan. |
| C-15 | Fecha de la ventana de la Estación 08 | TL:18 y LPB:§9: lunes **28-sep 00:00** | `HC:2719`: `new Date(2026, 8, 29, 0,0,0)` (= mar **29-sep 00:00**); `SP:109` `1790632800000` = 29-sep 00:00 | Código/guardado: 29-sep 00:00 ("medianoche del 28 al 29"). |
| C-16 | "Tormenta/bloqueo de 48 h" | BIB:481, WE, AGENTS, TL: 48 h, 8–9 oct → 18-oct 14:00 (9-10 días) | `SP:95-96`: 15-oct 20:00 → 18-oct 14:00 (66 h); `cipher.js:1058-1068`: start = target − 48 h; Silvia siempre exenta (`SD`) | La "48 h" es nominal; la ventana efectiva documentada es hasta dom 18-oct 14:00. Para la guía: describir como "ventana de tormenta, nominalmente 48 h". |
| C-17 | Nombres de ficheros de impresión | `journal/impresion/hojas_doble_cara/Hoja_11_…_D3_Clepsidra.pdf`, `Hoja_12_…_D4_Estela_Polibio.pdf` | 11A = Lexicon; 12B = Clepsydra; 17A = Polybius (`BJ:484-490, 514`) | El contenido (BJ) manda; los nombres de PDF están desfasados. (Parte B.) |
| C-18 | Texto de jugador con "Sheet NN" | Regla del Operador: nombrar páginas por título «…» | Emails 3-5, hub-core (Chronicles, `inq-*`) y varios módulos del Constellation usan "Sheet 4 · Side B", "Sheet Seven", etc. | Los emails ya enviados no se reescriben; el Hub tiene pastillas 📖 que mapean `Sheet NN` y títulos entre comillas a su ficha (`HC:5994-6004`). |
| C-19 | Aurelia 1974 / Torre III | `CLAUDE.md §2`, `AGENTS.md`, `GEMINI.md`: "1974: Aurelia sobrevivió y halló refugio en The Stage Tower… dejó su cuaderno" | BIB §12: la encontró el Sirviente en 1971 y es la Oráculo de Torre II desde entonces; STAGE_PATH_BIBLE habla de "Aurelia's Sketchbook" (cartas de 1970–71) | Biblia §12 (visible en Est. 19). La línea de 1974 es una versión antigua; reconciliar o eliminar. |
| C-20 | Estructura del diario | GRI: ~40-45 páginas A5 de bolsillo, 30 oficiales, 15 desde el 11-sep (cuero, anillas, bolsillo zip "Reliquary", 3 ranuras de tarjetas) | Realidad: 26 hojas (52 caras), 1–18 y 19–26 aparte; no hay hojas con ventanas troqueladas/mapas en las págs 09–12 como describe GRI | GRI es el plan del 1-sep; BJ/AGENTS.md describen lo construido. Actualizar o marcar GRI como histórico. |
| C-21 | Máxima del Planisphere | LPB:130-131: Silvia "volverá a esta sopa de letras más adelante" a extraerla | Ningún juego/estación la consume | ⏳ pendiente (H-02). |
| C-22 | Frase del voto | `BIB:43`: "Tú fuiste siempre el tesoro" y 56 años | Wire/Email 5: "fifty-five years since anyone spoke that name" | Compatibles (1970 vs 1971), tener cuidado de no mezclar. |
| C-23 | Glifo de la X en el Chasm / runas M-I-R-A-G-E | BIB §7.A: A, E, G... "solo hoja" | DOB: las 6 runas M-I-R-A-G-E aparecen en objetos del Chasm | Pendiente de verificar en Parte B si se consideran "entrega de glifo". |
| C-24 | Rejugar la Flower desde el Hub | `HC:1231`: `replayUrl …/celestial-flower/index.html#reset` ("↺ Re-trace Constellation") | `celestial-flower/index.html` no maneja `#reset` (usa su botón Reset interno, línea 2558) | El código de la página manda: el enlace del Hub no reinicia el juego. |

## (b) LISTA DE HUECOS (por definir o construir)
- **H-01** Canal y fecha reales de la Estación 04 / Transmisión 1 (¿5-sep? ¿cómo?). Y contenido de la "respuesta del 3-sep" al Email 2.
- **H-02** Uso de la máxima `THE SKY REMEMBERS WHAT THE EARTH FORGETS` (34 letras sobrantes de la 4B). ⏳ prometida en LPB, no diseñada.
- **H-03** Mover **J** a una estación del desierto 14–19 para cumplir el invariante §7.0 (hoy en Est. 22).
- **H-04** **Mecánica final de los 26 valores** (qué se calcula con ellos para abrir la Bóveda/coordenadas/butaca): solo LPB:191-194 ("Fase D") lo insinúa; ❓ sin diseñar.
- **H-05** Fecha del cumpleaños de Silvia / "día final"; la promesa de "56 días" (C-01).
- **H-06** Entrega física: cómo y cuándo llegaron las Hojas 1–7 (11-sep Italia) y 8–18; método "TBD" en SL:108 nunca cerrado en las fuentes.
- **H-07** Hora exacta de los Emails 4 y 5 ("por confirmar").
- **H-08** Archivar en el repo los textos/imágenes de los correos sin fuente: despacho radio 12-sep (`email_cover_ba…`), Email 3 enviado, despacho S09 8-oct.
- **H-09** Futuros correos/cartas: Desert (post-10-oct), Stage, y el final — `emails/desert/README.md` y `emails/stage/README.md` vacíos; ningún email previsto en el resto de la documentación.
- **H-10** Pruebas de jugabilidad del Constellation: el smoke solo carga las páginas (§1) y prueba offline de la Flower; no hay pruebas de las soluciones POLARIS/…, ECLIPSE, 97°/45°, 2090/HEXAGON/ACHERNAR+POLARIS ni de la frase del voto.
- **H-11** `docs/ASSETS.md` y `ES` citan `assets/email-01-parchment.png` (inexistente) y `cartographer_raid.mp3` de 52 s (el Hub dice 00:37).
- **H-12** Transmisión 4 (S07) es solo texto; la Biblia la numera junto a las de audio (T1-T6). Decidir si se graba.
- **H-13** Alinear AGENTS/CLAUDE/GEMINI/PM con la Biblia (WHEN sin hora, línea de Aurelia 1974, glifos D/C).
- **H-14** Documentar el flujo `astrolabe.js` Fase 2 muerta vs `transit.html` (limpieza).
- **H-15** Constellation: textos de jugador con "Sheet 4 · Side B" vs regla de títulos entre comillas (solo afecta a lo nuevo).

## (c) DATOS TRANSVERSALES
- **Frecuencias**: Transmisión 1 = 22.22 MHz · T2 = 19.84 MHz (asunto del email: 142.85) · T3, T4 (relé), T5A/5B, T6 = **142.85 MHz** · órdenes de los raiders = CH 284.10 kHz. Duración (dossier): T1 00:37, T2 01:31, T3 00:26, T6 82.46 s (01:22), T5A ≈01:04+, T5B ≈01:10+.
- **Audios** (`web/constellation/`): `radio-transmission/cartographer_raid.mp3`, `…/cartographer_desert_transmission.mp3`, `celestial-matrix/cartographer_matrix_relief.mp3`, `midnight-calibration/audio/cartographer_tempest_{alert,victory}.mp3`, `celestial-cipher/audio/cartographer_sandstorm_emergency.mp3`; vídeo `midnight-calibration/video/tempest_cinematic_master.mp4` (24 s, 1080p, también `shot1_aperture`, `shot2_wall_of_sand`, `shot3_cartographer`). Hub: "6 recordings" = T1, T2, T3 (siempre) + 5A, 5B (tras S08) + T6 (tras S09) (`HC:2778-2788`).
- **Claves de localStorage del Constellation**: `order_flower_completed`, `eclipse_flower_hint_used`, `cartographer_radio_active_slide`, `order_matrix_completed`, `order_zodiac_completed`, `order_midnight_completed`, `seeker_<u>_midnight_completed`, `order_station8_unlocked`, `order_station8_unlock_target`, `order_cipher_unlocked`, `order_cipher_completed`, `seeker_<u>_cipher_{unlocked,completed}`, `order_sandstorm_{triggered,active,start_time,target_time,wire_unlocked}`, `order_desert_path_unlocked`, `order_cipher_reward_claimed`, `the_eclipse_active_seeker`. Perfiles: `seeker_silvia_*`, `seeker_carles_*`, baúl `eclipse_profile_vault_<perfil>`; nube Supabase (proyecto `aoochekcbugawaurllco`).
- **Ask Hermes (Field Inquiries) disponibles desde que se abre el Wire** (sin `requires`, `HC:5300-5500`): *constellation* — `inq-eclipse-order` (¿Qué es la Orden?), `inq-three-towers`, `inq-true-name` ("A long time ago I lost someone I loved at the Southern Bridge, and I buried my name with her… you gave my name back to me"), `inq-eclipse-script` ("twenty-six glyphs… The numbers hidden behind the letters… You must work those out yourself… I will never hand them to you"), `inq-distant-light`; *astrolabe* — `inq-raiders-astrolabe`, `inq-six-stars` (Aldebaran, Polaris, Vega, Altair, Deneb, Arcturus), `inq-replica-flaws`, `inq-fourth-chamber`, `inq-ledger-how` ("It starts empty on purpose…"). Los demás se desbloquean por estación (`INQUIRY_UNLOCKS`, `HC:5891-5969`, sólo desde la Est. 10).
- **Astrolabio**: nativo 6 estrellas (Ald, Pol, Veg, Alt, Den, Arc; mismas 6 de la Est. 08); el de Hermes es una réplica de latón con holguras (acceso permanente "Brass Astrolabe" en el Hub, `view-astrolabe`, solo modo Carles según `HC:405-407`); 22 estrellas guía en el original restaurado.
- **Motivo de los asaltantes** (S07): triangulan con el Astrolabio la entrada a la 4.ª Cámara Prohibida al alinear las 3 Torres. Hermes "believed it was only an observer's lens".
- **Brújula/rumbos**: placa de Cairn III 112° E (a Outer Watchtower VI; 1998); Al-Qibla 194° SSW / 14° NNE (S12); Cairn III 348° NNW → Sun Monolith; Cairn V 163° SSE; Stele 348° NNW (Parte B).
- **Hoja 7B** datos: línea base 5.420 pasos a Red Ridge; corrección magnética +04°15′; elevación vértice Peak VII 1.240 varas; Polaris a 30°00′N (LPB:§11).
- **Estilo gráfico del diario**: grafito 2B RGB(46,42,38); fuentes `assets/fonts/MarckScript.ttf` (cuerpo), `Fondamento.ttf` (juegos C1-C4); `verify_sheets.py` comprueba colisiones y troquelado.
- **Estado de perfiles**: Silvia y Carles (Carles = tester con panel "Tester controls", `?admin=1|carles=1|tester=1`). El Hub marca S08 y S09 completadas por defecto para ambos.
- **Smoke test** (`scripts/audit/web_smoke.py`, 4905 líneas): §1 `pages` (carga limpia de `index.html` + todas las `constellation/**/*.html`), §2 `views` (6 vistas × 3 perfiles incl. "Silvia (storm)"), `offline` (juega la Flower sin red); resto = Desert/Stage/Hub.
