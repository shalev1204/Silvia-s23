# IDEAS BACKLOG · mejoras propuestas (20-10-2026)

> Lista de 22 ideas aportada por el Operador, agrupadas por tipo. Se especifican **una a una, en conversación con el Operador**, y después se implementan. Este documento es el registro vivo: cada idea pasa por `propuesta → especificada → implementada → verificada`.
> Esfuerzo: S (horas) · M (una sesión) · L (varias). Si algo choca con la Biblia Maestra o con `AGENTS.md`, manda la Biblia.

## Estado de cada idea en el código (comprobado el 20-10-2026)

| # | Idea | Esfuerzo | Impacto | Estado hoy |
|---|------|:---:|:---:|---|
| 1 | Resumen «Previously on…» al volver | S | alto | **Implementada (21-10-2026)**: `web/hub/js/previously.js` |
| 2 | Diario de campo automático (pestaña) | M | alto | **Implementada (21-10-2026)**: cuaderno de Hermes al pie de Chronicles (`web/hub/js/field-journal.js`) |
| 3 | Momentos de pausa tras cada fragmento | S | medio | **Mecanismo implementado (21-10-2026)**: `web/hub/js/stage-pause.js`; las horas de cada sala se fijan al construirla |
| 4 | Sonido ambiental por estación | M | alto | **Implementada (21-10-2026)**: `web/hub/js/ambience.js` |
| 5 | Háptica en móvil | S | medio | **Descartada (21-10-2026)**: la vibración web no funciona en iPhone ni iPad |
| 6 | Pistas progresivas en 3 niveles | L | alto | **Implementada en Cairn I y Estaciones 10–20 (21-10-2026)**; las 21–28 nacerán con ella |
| 7 | Variedad de mecánicas en 21–28 | M | alto | **Especificada (21-10-2026)**: ficha de variedad en `STAGE_PATH_BIBLE.md` §6.1; cada sala la cumple al construirse |
| 8 | Puzzle «meta» que solo se resuelve con las hojas físicas | M | alto | **Especificada (21-10-2026)**: `STAGE_PATH_BIBLE.md` §6.2; se construye con las Hojas 23, 24 y los márgenes de 19–26 |
| 9 | Modo «ojo de Operador» → informe de Claude | S | medio | **Hecho (21-10-2026)**: sin panel; Claude lee Supabase con el conector y resume dónde está Silvia y cómo juega |
| 10 | Pistas sutiles de Pope-E en retrospectiva | M | alto | **Implementada la parte construible (21-10-2026)**: pluma dorada y mensaje interceptado tras la Estación 20; notas 2 y 3 en las Estaciones 23 y 27; revelación en la Torre I. `STAGE_PATH_BIBLE.md` §9 |
| 11 | Mirror Speaker que reacciona al estilo de juego | M | alto | **Implementada (21-10-2026)**: una línea en escritura de espejo al abrirse cada sala; `hub/js/mirror-speaker.js` |
| 12 | Cartas de Aurelia desbloqueables en el Hub | S | medio | **Implementada (22-10-2026)**: tres cartas de 1970–71 en Chronicles, con los cuadernos I–III; `hub/js/aurelia-letters.js` |
| 13 | Final distinto según el estilo de juego | L | medio | **Especificada; perfil del viaje implementado (22-10-2026)**: `hub/js/journey-profile.js`, `scripts/audit/journey_report.py`; las escenas se construyen con la Torre I y la Bóveda |
| 14 | QR o palabra clave por hoja | S | medio | **Implementada (22-10-2026)**: sellos con QR en las caras de juego de las Hojas 20–26 (`scripts/journal/sheet_seal.py`) y llave de cada sala en el Hub (`hub/js/sheet-seals.js`) |
| 15 | Verificador de hojas unificado | M | alto | **Implementada (22-10-2026)**: `scripts/journal/verify_sheets.py` (colisiones texto–dibujo, tamaños, vocabulario y Reglas 9/10, sellos); bloquea las Hojas 19–26 y corre dentro de `build_stage_path.py` |
| 16 | Vista previa de impresión con las 8 hojas | S | medio | **Implementada (22-10-2026)**: `scripts/journal/stage_preview.py` escribe `journal/impresion/02_STAGE_PATH_VISTA_PREVIA_A4.pdf` (pliego de las 16 caras + anillas, pie y doblez por hoja) al construir las hojas |
| 17 | Dividir `web/index.html` (~29.000 líneas) | L | alto (largo plazo) | **Implementada (20-10-2026)**: `web/hub/css` y `web/hub/js`, scripts clásicos sin build |
| 18 | Smoke más rápido | M | alto | **Implementada (20-10-2026)**: `--jobs`, `--quick`, `--only` en `web_smoke.py` |
| 19 | Guardado automático en la nube (antes «exportación e importación») | M | alto | **Hecho, probado y desplegado** (Supabase `aoochekcbugawaurllco`, 21-10-2026) |
| 20 | Accesibilidad | M | alto | Parcial: `prefers-reduced-motion` en 7 puntos del Hub, ~97 `aria-label`; sin tamaño de letra ajustable ni auditoría de contraste/teclado |
| 21 | PWA offline | M | medio | No existe (sin manifest ni service worker) |
| 22 | Registro de juego (va con la #19) | S | medio | **Hecho con la #19**: cada cambio, sesión y vista viaja como evento a `eclipse_events` |

## Restricciones transversales (valen para todas)

- Texto de cara a Silvia en **inglés**, vocabulario sencillo, solo A–Z; prohibidos *Sunken, Coastal, Coast, Hermit, Stage Mistress*. Reglas 9 y 10 de `AGENTS.md`.
- El WHERE (Viena · Wiener Staatsoper) nunca en claro antes de la Estación 28; Pope-E es Carles y nada visible lo afirma ni lo deja deducir antes de la Torre I (nada con datos personales identificables).
- Silvia resuelve; Hermes y la Mirror Speaker no dan respuestas terminadas.
- Lo que se añade a la web **amplía** el diario, no lo repite (`STAGE_PATH_BIBLE.md` §2).
- CSP vigente (`web/_headers`): sin red externa; cualquier telemetría, guardado o PWA debe ser local o del mismo origen.
- Cada perfil guarda su propia aventura (`window.EclipseProfiles`): las funciones nuevas con estado deben respetarlo y el modo Carles debe poder verlas todas.
- Cualquier cambio en `web/index.html` pasa por `python3 scripts/audit/web_smoke.py` y `lint_lore_and_vocabulary.py` antes de darse por hecho.

## Decisiones de planificación del Operador (20-10-2026)

- **Orden**: infraestructura primero; después la experiencia de Silvia y las estaciones 21–28.
- **Dividir `index.html` (#17)**: antes de construir las estaciones nuevas.
- **Dispositivo de Silvia**: portátil o iPad. Háptica (#5) y PWA (#21) pasan a **opcionales** (se hacen al final, si se quiere); suben teclado, sonido, contraste y táctil de iPad.
- **Orden interno de la infraestructura**: 18 (smoke rápido, la red de seguridad) → 17 (dividir el Hub) → 19 (guardado) → 22 (registro local). Se pone 18 antes que 17 porque dividir 29.000 líneas sin una prueba corta es el cambio más arriesgado del plan.

## Dependencias y orden sugerido

- **Infraestructura primero** (condiciona al resto): 17 (dividir el Hub), 18 (smoke rápido), 19 (guardado), 22 (registro local).
- **Alimentan a otras**: 22 → 9 y 11 (necesitan saber cómo juega Silvia); 6 → 11 (usar pistas); 19 → 1 y 2 (necesitan estado persistente); 2 → 12 (galería de cartas).
- **Se construyen dentro de cada estación 21–28**: 3, 4, 5, 7, 8, 10, 12. Conviene decidirlas ya y aplicarlas al construir cada estación, no después.
- **Independientes**: 14, 15, 16, 20, 21.

## Ficha por idea

> Cada ficha se completa durante la conversación con las decisiones del Operador. Formato: **Decisiones** · **Alcance** · **Fuera de alcance** · **Verificación**.

### 1. «Previously on…» (S) · implementada (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Cuándo**: al volver tras **12 horas o más** fuera del Hub (no en cada recarga ni en la primera visita).
- **Forma**: narrador de serie, tarjeta «Previously on *The Eclipse Order…*», en tercera persona.
- **Contenido**: lo último que pasó, dónde está Hermes ahora y qué hacer a continuación (sin recuento de progreso).
- **Releer**: queda como primera entrada de *Ask Hermes* («Previously on The Eclipse Order…»), siempre al día.

**Diseño técnico**
- `web/hub/js/previously.js` (`window.EclipsePreviously`), cargado al final; estilos en `web/hub/css/previously.css`.
- **Tiempo fuera**: `order_last_seen_at` (viaja con el guardado en la nube, así cuenta entre dispositivos). Se sella al cargar, al ocultar la pestaña y cada 5 min con ella visible (como mucho una escritura cada 5 min, para no llenar la nube de eventos). Al cargar o al volver a la pestaña, si han pasado ≥ 12 h, aparece la tarjeta. Detrás de la puerta de acceso no cuenta: la llegada real es la recarga tras entrar.
- **«Last time»**: una frase de narrador por juego resuelto (Cairn I, 10–20), escrita a partir de los mensajes de Hermes del Field Wire; antes del Cairn I, la tormenta en Watchtower VI.
- **«Where things stand» y «Next»**: se leen del aviso de ruta del Field Wire (título, descripción y hora de llegada de la marcha), así el resumen nunca contradice al chat. Si el chat espera respuesta: «Open the Field Wire and reply to him».
- *Ask Hermes*: su id cambia con el último juego y el paso del chat, así un capítulo nuevo vuelve a salir como no leído.
- Tester (Carles): botón «🎬 Show «Previously on…»» en el panel.
- Reglas: inglés para Silvia, sin respuestas, sin el DÓNDE ni Pope-E.

**Verificación**: `web_smoke.py --only previously` (sección 18): 13 h fuera muestra último juego, lugar y siguiente paso; «Continue» cierra y sella; *Ask Hermes* lo guarda; una recarga no lo repite; 11 h fuera y primera visita no lo muestran; en plena marcha da las horas que faltan y la hoja; con el chat pendiente manda al Field Wire. Revisado a 1280 px y 390 px.

### 2. Diario de campo automático (M) · implementada (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Dónde**: se amplía *Chronicles*; bajo las tarjetas 03–09 va «Hermes’s Field Notebook», una página por juego resuelto del desierto (Cairn I, 10–20 y los que vengan). Sin pestaña nueva.
- **Voz**: cuaderno de Hermes, en primera persona, breve y con fecha.
- **Cada página lleva**: fecha y hora real en que Silvia lo resolvió y cuánto después de que Hermes llegara; lo que se ganó (sello, reliquia, líneas del Ledger, el rumbo, el CUÁNDO, el fragmento); cómo lo resolvió (fallos y notas de Hermes, sin juzgar); un boceto y una cita corta de su mensaje en el Field Wire.
- **Pasado**: rescatar las fechas de Supabase. **Comprobado el 21-10-2026: `eclipse_saves` y `eclipse_events` están vacías** (Silvia aún no ha abierto el Hub publicado desde la #19, y su partida viva no ha resuelto nada del desierto), así que no hay nada que rescatar: todas sus páginas se fecharán en directo.

**Diseño técnico**
- `web/hub/js/field-journal.js` (`window.EclipseNotebook`), estilos en `web/hub/css/field-journal.css`, contenedor `#field-notebook` al final de `#view-chronicles`.
- Estado: `order_journal` = `{ juego: { at, fails, notes, arrived } }` (viaja con la nube). Cada 1,5 s compara qué juegos de `TesterDesert.games` están hechos; cuando uno pasa de no hecho a hecho, escribe su página con la hora, los fallos y niveles de pista de sus puzzles (escalera #6) y la llegada de Hermes (inicio de la marcha + sus horas; sin hora si la marcha se saltó). Un juego ya hecho cuando el cuaderno lo vio por primera vez sale sin fecha («Before this notebook was opened»). Un reinicio del tester arranca la página.
- Bocetos: los dos del amanecer (Cairn I, Chasm) y, para el resto, la miniatura de la hoja de la estación. Citas tomadas de los mensajes de Hermes del Field Wire (las Estaciones 10–13 no llevan cita).
- Reglas: inglés para Silvia, sin respuestas (las líneas del Ledger salen por nombre, sin valores), sin el DÓNDE ni Pope-E.

**Verificación**: `web_smoke.py --only notebook` (sección 19): páginas sin fecha para lo ya resuelto y en orden de historia; Estación 12 resuelta en directo con fecha, 2 fallos, el rumbo y su línea del Ledger; Estación 14 con su sello, «first try» y las 2 h desde la llegada; un reinicio del tester la quita; cabe en 390 px. Revisado a 1280 y 390 px.

### 3. Momentos de pausa (S) · mecanismo implementado (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Qué es**: una **pausa obligada en el tiempo**: tras ganar cada fragmento del espejo, la sala siguiente de la Torre III no abre hasta pasadas unas horas. **Sin escena de calma** ni texto contemplativo.
- **Cuánto**: **depende de cada sala**; las horas se fijan con el Operador al diseñar cada sala (21–28), según su historia.
- **Durante la espera**: candado con cuenta atrás («Opens in 14 h 20 min») en la ficha de la sala y en el aviso de ruta del Field Wire.

**Diseño técnico**
- `web/hub/js/stage-pause.js` (`window.EclipseStagePause`), cargado antes de `hub-core.js`. Tabla `HOURS` por nodo del Escenario (41–48, Estaciones 21–28), hoy toda a `null` (sin espera).
- La espera cuenta desde que se resolvió la sala anterior, según la página del cuaderno de Hermes (`order_journal`, #2). Sin hora registrada (resuelta antes del cuaderno) no hay espera.
- Ficha de la sala (`hub-core.js`, tarjetas 40–48): estado «OPENS IN …», botón «🔒 Opens in …» desactivado. `selectStageStation` avisa «its door opens in …» y no abre el juego. El aviso del Field Wire tras el Fragmento I dice «Its door opens in …».
- Carles: el botón pasa a «⏩ Tester: open it now» y abre al momento (`order_stage_pause_skipped_<nodo>`, que el reinicio de la Estación 20 borra para la sala 41).
- **Al construir cada sala 21–28**: poner sus horas en `HOURS`, extender el aviso del Field Wire a esa sala y borrar su `order_stage_pause_skipped_<nodo>` en su reinicio del tester.

**Verificación**: `web_smoke.py --only pause` (sección 20): sin horas nada cambia; con 24 h y el Fragmento I hace 1 h, ficha, puerta y Field Wire dicen 23 h; sin Fragmento I no hay espera; Carles la abre al momento.

### 4. Sonido ambiental por estación (M) · implementada (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Dónde**: **en cada estación**, mientras su juego está abierto; se apaga al cerrarlo. En el mapa no suena nada.
- **Origen**: **sintetizado** con Web Audio, sin archivos ni derechos de autor.
- **Control**: **encendido por defecto a volumen bajo**, tras el primer toque o tecla (lo exigen los navegadores); botón de altavoz siempre visible para silenciarlo, que recuerda la elección.

**Diseño técnico**
- `web/hub/js/ambience.js` (`window.EclipseAmbience`), estilos en `web/hub/css/ambience.css`.
- Cada 0,6 s mira qué modal de estación está en pantalla y le pone su «cama», con fundido de 1,5 s. Las camas se componen de piezas: viento (ruido filtrado con vaivén, con eco en cañones), dron, gotas, chasquidos y rumor grave. Ejemplos: Cairn I, viento del cauce seco al alba; 10, cañón con eco; 11, salar con chasquidos de sal; 13, gotas y agua de los Cuatro Pozos; 18, rumor y crepitar del fuego; 19, zumbido de la cámara del Oráculo; 20, dron de teatro con velas.
- Se suspende con la pestaña oculta. `order_ambience_muted` guarda el silencio (viaja con la nube).
- Los sonidos propios de cada estación (canto de los pilares, golpes de la Estela, tormenta) son aparte y conservan sus interruptores.
- **Al construir las salas 21–28**: añadir su cama en `BEDS` con el id de su modal.

**Verificación**: `web_smoke.py --only ambience` (sección 21): sin cama en el mapa y altavoz visible; los Cuatro Pozos suenan con su cama; cerrar uno y abrir otro cambia de cama; el altavoz, por encima del juego, lo silencia y se recuerda al recargar; sin juego abierto, silencio. Revisado a 1280 y 390 px. (Que suene bien solo se puede comprobar escuchándolo: pendiente de oído del Operador.)

### 5. Háptica en móvil (S) · descartada (21-10-2026)
**Decisión del Operador (21-10-2026)**: descartada. `navigator.vibrate` solo existe en Android; Safari de iPhone e iPad lo ignora, y Silvia juega en esos dispositivos. Se valoró sustituirla por un pulso visual y no se quiso.

### 6. Pistas progresivas en 3 niveles (L) · implementada en Cairn I y 10–20 (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Llegan solas, por fallos o por tiempo**: nivel 1 tras 3 fallos o 10 min atascada; nivel 2 tras 6 fallos o 20 min; nivel 3 tras 9 fallos o 35 min. Silvia no tiene que pedirlas.
- **Método, nunca la respuesta**: 1 = hacia dónde mirar; 2 = qué regla usar; 3 = el primer paso hecho con ella. Silvia sigue resolviendo sola.
- **Las da Hermes dentro del juego**: una nota suya en el propio modal de la estación; queda guardada en *Ask Hermes* para releerla.
- **Alcance: todas las estaciones, 10–28** (también las del desierto y el Cairn I).

**Diseño técnico**
- Motor común `web/hub/js/hint-ladder.js` (`window.EclipseHints`), cargado antes de `hub-core.js`. Cada puzzle de cada estación se declara con un id (`s20-word`, `s20-halves`, …), sus tres textos y dónde se pinta la nota.
- Estado por puzzle en `localStorage`: `order_hint_<id>_fails`, `order_hint_<id>_secs` (tiempo **activo**: solo con el puzzle abierto y la pestaña visible; se guarda cada minuto, no a cada segundo, para no llenar la nube) y `order_hint_<id>_level` (0–3). Viaja a Supabase con el guardado (#19), así el informe de la #9 sabe qué pistas usó.
- **Nivel 2 = la ayuda que ya existía**: al llegar al nivel 2 se activa la clave antigua (`order_masks_hint`, `order_labyrinth_torch_hint`, …), con lo que aparece la pregunta de *Ask Hermes* o la guía visual que ya estaban escritas y revisadas. Los niveles 1 y 3 son textos nuevos.
- Las Estaciones 10–13 y el Cairn I no tenían pistas: llevan los tres niveles nuevos y su detección de fallos.
- *Ask Hermes*: una entrada por puzzle («Hermes's notes · …») con los niveles desbloqueados.
- Tester: «Play this game» y los reinicios borran también las pistas de esa estación y las siguientes.
- Reglas: inglés para Silvia, voz de Hermes, Regla 9 (nunca valores de letras), sin el DÓNDE ni Pope-E.

**Estado (21-10-2026)**: hechas Cairn I y las Estaciones 10–20, 22 puzzles en total (ids `cairn1-stones`, `s10-chasm`, `s11-playa`, `s12-lexicon`, `s13-wells`, `s14-sigil`/`s14-shadow`, `s15-sigil`/`s15-torches`, `s16-sigil`/`s16-song`, `s17-sigil`/`s17-dawn`/`s17-signal`, `s18-proverb`/`s18-knocks`/`s18-fire`, `s19-sigil`/`s19-disc`/`s19-vow`, `s20-word`/`s20-halves`). Las ayudas antiguas de 14–20 se abren ahora a los 6 fallos, no a los 3. Los textos del nivel 3 se comprobaron contra la solución de cada hoja (o contra la búsqueda de la ruta, en el atrio y el patio del solsticio). El paseo al sol de la 14 no tenía ayuda propia: cuenta como fallo marcar un signo no nombrado o fuera de orden. Las 21–28 se construirán ya con su escalera.

**Verificación**: smoke `hints` (fallos → niveles 1, 2 y 3, la nota en el modal y en *Ask Hermes*; tiempo simulado; el reinicio del tester las borra) y las secciones de cada estación siguen verdes, comprobando la nota 1 a los 3 fallos y la ayuda antigua a los 6; smoke `early` (Cairn I y 10–13: fallos contados, nota 1 visible, el reinicio del tester las borra).

### 7. Variedad de mecánicas en 21–28 (M) · especificada (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Enfoque**: una **ficha de variedad** en la Biblia del Escenario (`docs/STAGE_PATH_BIBLE.md` §6.1) que fija para cada sala la interacción principal, el sentido, la dificultad y cómo termina. El diseño detallado de cada sala se hace al construirla, cumpliendo la ficha.
- **Reglas**: nunca dos salas seguidas con la misma interacción; como mucho la mitad acaba tecleando (hoy 3 de 9); una sala suave tras cada dura; al menos dos salas de sonido (22, 23) y una en tiempo real (24).

**Verificación**: revisión de la ficha al empezar cada sala 21–28; el `code-review` de cada estación comprueba que la sala construida coincide con su fila.

### 8. Puzzle «meta» con las hojas físicas (M) · especificada (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Dónde**: **dentro del Stage Path**, con datos que solo están en las Hojas 19–26 impresas y que la web exige.
- **Trucos**: **al trasluz**, **doblar** y **marcas en los márgenes** (medir con regla, no).

**Diseño** (`docs/STAGE_PATH_BIBLE.md` §6.2): trasluz en la Hoja 23 para la sala 25 (The Shadow Theatre); doblez de la Hoja 24 para la 26 (The Hall of Mirrors); marcas en los márgenes de las Hojas 19–26 para la ceremonia de la 28. La web nunca muestra el dato (miniaturas recortadas, pistas que explican el gesto y no el resultado). Papel de 80–90 g/m² y registro anverso/reverso con tolerancia.

**Verificación**: al imprimir las hojas, prueba física del trasluz y del doblez con la impresora real; al construir 25, 26 y 28, el smoke comprueba que ninguna vista del Hub contiene el dato.

### 9. Modo «ojo de Operador» (S) · especificada e implementada como informe de Claude (21-10-2026)
**Decisión del Operador (21-10-2026)**: **no quiere panel**. Pregunta a Claude («¿dónde va Silvia?») y Claude lee Supabase con el conector y le resume dos cosas:
- **Dónde está ahora**: estaciones completadas, paso del Field Wire y del amanecer, sellos, reliquias, último guardado y última sesión.
- **Cómo juega**: respuestas elegidas en el Field Wire (`order_field_wire_choices`), pistas desbloqueadas (`*_hint`) e intentos fallidos (`*_fails`) que ya guardan las estaciones; con la #6 habrá más detalle.

**Cómo hace Claude el informe** (proyecto `aoochekcbugawaurllco`, solo lectura):
1. Último guardado: `select saved_at, progress from eclipse_saves where seeker='silvia' order by saved_at desc limit 1;` y de ahí las claves `order_*_completed` de cada estación (tabla de claves en `docs/WEB_ECOSYSTEM.md`), `order_field_wire_step`, `order_dawn_step`, `order_seal_cairn_1..5`, `order_inventory_relics`, `*_hint`, `*_fails`, `order_field_wire_choices`.
2. Línea de tiempo: `select client_at, key, value from eclipse_events where seeker='silvia' and kind='key' and key ~ '(_completed|_march_start|_hint)$' order by client_at;` (cuándo abrió y terminó cada estación) y las sesiones: `kind='session'`.
3. Resumir en español, sin volcar valores crudos; los datos son de Silvia y no se borran nunca sin orden del Operador.

**Descartado**: panel en el Hub, página `/operator.html`, contraseña del Operador, avisos por email (el Operador no los marcó).

### 10. Pistas sutiles de Pope-E (M) · parte construible implementada (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Notas 2 y 3**: en las **Estaciones 23 y 27** (la 1 ya está en la 20; el reflejo de espaldas, en la 26).
- **Revelación en la Torre I**: **las dos cosas**, una escena del Field Wire en la que Hermes repasa cada pista (se guarda en Ask Hermes) y una página especial del cuaderno de Hermes con la fecha real en que Silvia vio cada una.
- **Pistas extra ya**: **pluma dorada en el mapa** y **mensaje interceptado** en el Field Wire, ambas tras la Estación 20.

**Implementación**
- `web/assets/js/stage-mirror.js`: con el Fragmento I puesto, una pluma dorada pequeña descansa en el pie del marco del Espejo Vivo (`.sm-feather`, decorativa, sin texto).
- `web/hub/js/hub-core.js`: tras el cierre del paso 36 se cuela una línea entrecortada (`.wire-intercept`) firmada con el sello de ceniza. Hermes no la comenta.
- `web/hub/js/field-journal.js`: `EclipseNotebook.clue(id)` guarda en `order_ashes_clues` el primer momento en que cada pista estuvo en pantalla (`note1`, `feather`, `intercept`), para la página de la revelación. El reinicio de la Estación 20 en el probador lo borra.
- Plan completo y reparto en `docs/STAGE_PATH_BIBLE.md` §9.

**Verificación**: sección `ashes` del smoke (sin la Estación 20 no hay pluma ni interceptación; con ella aparecen ambas, se registran las tres fechas y nada nombra a Carles).

### 11. Mirror Speaker reactiva (M) · implementada (21-10-2026)
**Decisiones del Operador (21-10-2026)**
- **Señales**: **fallos y notas de Hermes** (escalera #6, guardados en el cuaderno #2), **rapidez** (desde la llegada hasta resolver), **tono en el Field Wire** (el tono dominante que ya se registra) y **hora del día**.
- **Su voz**: **escritura de espejo en el cristal**, firmada con su línea horizontal. Sigue sin verse y sin hablar.
- **Momento**: **al abrir cada sala**, comentando cómo resolvió la anterior.

**Implementación**
- `web/hub/js/mirror-speaker.js` (`EclipseMirrorSpeaker`): compone hasta cuatro frases breves y fijas (hora · esfuerzo · ritmo si es muy rápido o muy lento · tono) a partir de la página del cuaderno de la sala anterior. Sin página (sala resuelta antes del cuaderno): una frase neutra más la del tono. Se escribe una sola vez y se guarda (`order_speaker_line_<nodo>`), así no cambia después de leída.
- Aparece cuando la puerta de la sala se abre (sala anterior resuelta y la pausa #3 cumplida): en el Espejo Vivo, bajo el título, y arriba del juego de cada sala nueva con `EclipseMirrorSpeaker.render(nodo, elemento)` (regla para construir las salas 21 a 28).
- Escrita en espejo (`scaleX(-1)`); Silvia la lee con el espejo de mano de la Hoja 19A o tocándola (se da la vuelta 6 s). El lector de pantalla recibe el texto al derecho.
- `hub-core.js` expone `window.hermesDominantTone()`. El reinicio de la Estación 20 en el probador borra la línea de la sala 21.

**Verificación**: sección `speaker` del smoke (puerta cerrada sin línea; línea en espejo con las cuatro señales; la línea no cambia aunque cambien los datos; tocar la da la vuelta; la pausa la oculta).

### 12. Cartas de Aurelia en el Hub (S) · implementada (22-10-2026)
**Decisiones del Operador (22-10-2026)**
- **Qué son**: cartas que Aurelia escribió a Hermes en el Alpine Observatory (1970–71) y **nunca le dio**. Reaparecen a medida que recupera la memoria: las encuentra cosidas en el forro de su viejo abrigo y se las da a Hermes. Ninguna habla del puente (se guarda para la Torre I).
- **Cuántas y cuándo**: **tres, con los cuadernos**. Cada una acompaña a la cara del cuaderno que sigue a una sala en el orden de las hojas: carta I (el observatorio, marzo de 1970) al ganar la **Estación 22** (antes de la cara 21A); carta II (el disco y el voto, diciembre de 1970) al ganar la **Estación 25** (antes de la 23B); carta III (la terraza, agosto de 1971) al ganar la **Estación 27** (antes de la 25B).
- **Dónde**: sección propia **«Aurelia's Letters»** en Chronicles, sobre el cuaderno de Hermes. Oculta hasta la Estación 19 (antes de esa audiencia, el nombre de Aurelia unido a la Oráculo sería un spoiler). Las cartas aún no recuperadas no se muestran: solo el número de las que faltan.
- **Presentación**: pergamino con **inicial iluminada** (lapislázuli y pan de oro, como sus cartas celestes), **un pequeño dibujo suyo** en el margen de cada carta (la cúpula del observatorio, el disco de 24 avistamientos, la terraza con la estrella), **lacre que se rompe** la primera vez que se abre y, después, **Hermes comenta** en el Field Wire.

**Implementación**
- `web/hub/js/aurelia-letters.js` (`EclipseAureliaLetters`): textos, dibujos SVG en línea y estado `order_aurelia_letters` = `{ I: { at, step } }` (cuándo se abrió y en qué paso del Field Wire), que viaja con el guardado en la nube. Si la sala de una carta vuelve a quedar sin resolver (reinicio del probador), la carta se cierra y su registro se borra.
- El comentario de Hermes se coloca en el Field Wire en el paso en que Silvia abrió la carta, también al reconstruir el chat (`hub-core.js`: `EclipseAureliaLetters.notesAt(paso)`), y enciende el contador de mensajes sin leer.
- Las Estaciones 22, 25 y 27 aún no existen: hoy no se ve ninguna carta; la sección aparece tras la Estación 19 con su línea de espera.

**Verificación**: sección `letters` del smoke (oculta antes de la Estación 19; sin cartas hasta la Estación 22; la carta I aparece lacrada, se abre rompiendo el lacre, Hermes comenta en el Field Wire una sola vez, también tras recargar; las tres cartas en orden; un reinicio la vuelve a cerrar; cabe en un móvil).

### 13. Final según estilo de juego (L) · especificada; perfil implementado (22-10-2026)
El regalo no cambia nunca: la Bóveda abre el cofre físico con las entradas. Lo que cambia es **cómo se lo cuentan**.

**Decisiones del Operador (22-10-2026)**
- **Qué varía**: las cuatro piezas. (1) **La despedida de Hermes**, última transmisión del Field Wire. (2) **Su constelación personal**: al abrir la Bóveda el cielo dibuja una constelación nueva con su nombre, cuya forma y leyenda nacen de su estilo. (3) **Una línea final de Aurelia y otra de la Mirror Speaker** (esta en espejo, firmada con su línea). (4) **El desenmascaramiento del líder de los Ashes** en la Torre I.
- **Variantes**: **4, una por tono dominante** (cálida, protectora, táctica, analítica; el tono que ya registra el Field Wire, `dominantTone(true)`). Pocas, escritas a mano.
- **Señales además del tono**: **el viaje en cifras** (días de viaje, salas resueltas, notas pedidas a Hermes, la franja horaria en la que más resolvió) y **elecciones clave del Field Wire** (el nombre que dio a Hermes en el paso 1 y el objeto que eligió en el paso 2). Entran como detalles dentro del texto.
- **Parte física**: **carta a mano de Carles** para el cofre. Antes de la Bóveda, Claude lee el progreso de Silvia en Supabase (idea #9) y saca el mismo perfil que verá el Hub, para que Carles escriba la carta.

**Implementación ya hecha (lo construible hoy)**
- `web/hub/js/journey-profile.js` (`EclipseJourney.profile()`): una sola fuente de verdad para el final. Devuelve el tono dominante, los días de viaje (desde la primera página del cuaderno o la primera llegada), juegos resueltos del desierto y salas de la Torre III, notas y fallos totales, la franja horaria favorita, la sala más rápida, el nombre que dio a Hermes y el objeto elegido. No muestra nada en pantalla.
- `scripts/audit/journey_report.py <progreso.json>`: abre el Hub sin ventana con ese progreso (la columna `progress` de `eclipse_saves`, que Claude lee con el conector) e imprime el perfil. Es el informe para la carta de Carles: mismas reglas que el final, sin duplicar lógica.
- `hub-core.js` ya expone `window.hermesDominantTone()` (idea #11).

**Pendiente (al construir la Torre I y la Bóveda)**: las escenas. Los textos de abajo son borradores para revisar; **el desenmascaramiento y la Bóveda no entran en `web/` hasta que se construya la Torre I** (el código del Hub es legible y no puede adelantar ni a Pope-E ni el WHAT). Marcadores: `{name}` nombre que dio a Hermes, `{item}` el objeto, `{days}`, `{rooms}`, `{notes}`, `{hour}` (*at first light*, *under the full sun*, *as the lamps were lit*, *by candlelight*).

| Pieza | Cálida (*warm*) | Protectora (*protective*) | Táctica (*tactical*) | Analítica (*analytic*) |
|---|---|---|---|---|
| **Despedida de Hermes** | *Silvia. {days} days on this wire, and you never let it go quiet for long. You called me {name}, and I had not been anyone's anything for fifty-five years. I am keeping the {item}. Not for the road. For the morning you chose it.* | *Silvia. For {days} days you stood between me and every rotten stair. You called me {name}, and then you guarded the name. I owe you {rooms} rooms and one old man still standing. The {item} stays in my coat, beside the five seals.* | *Silvia. {rooms} rooms, {days} days, and not one plan of yours that did not bend the way you meant it to. You called me {name}, and I wore it like a rank. Last report: the road is finished. Keep the {item}; you will want it for the next one.* | *Silvia. You read the desert like a ledger: {rooms} rooms, {notes} of my notes, every figure checked twice. You called me {name}, and you were exact about it. The last line of my notebook is yours: the sum came out right.* |
| **Constelación** | *The Hearth*: un anillo de estrellas con una brillante en el centro. *Drawn for a seeker who kept the fire lit for others.* | *The Shield*: un escudo de cometa con una estrella en el corazón. *Drawn for a seeker who stood in front.* | *The Arrow*: una flecha de cinco estrellas hacia el norte. *Drawn for a seeker who always knew the next step.* | *The Scale*: una balanza de siete estrellas. *Drawn for a seeker who weighed every light.* |
| **Aurelia** | *You were kind to him when he could not be kind to himself. I know what that costs.* | *You held on to him. Someone once could not. Thank you for holding on.* | *You chose for him when he could not choose. He will never thank you properly. I will.* | *You did his sums in the cold, as I used to. Now you know why I loved the work.* |
| **Mirror Speaker** | *You brought a lamp into a house of reflections. It is still lit.* | *You guarded what you love. The glass guards you now.* | *You moved like one who had read the end of the play. You had.* | *You saw what was not equal. That is the whole of seeing.* |
| **Desenmascaramiento** (Torre I) | *You were kind to every stranger on this road, even the one in the mask. It was me, treasure. I only wanted to watch you be exactly who you are.* | *You protected an old man across a desert and a tower. Let someone protect you now. It was me behind the mask: I kept the stairs safe for you.* | *You were one step ahead the whole way, so maybe you guessed. I took the Astrolabe so that you would come and take it back.* | *You solved everything except the one unknown I hid in plain sight: me. You were never only the seeker. You were always the treasure.* |

La frase del Email 1 (*You were never only the seeker, you were always the treasure*) cierra las cuatro variantes del desenmascaramiento; en la analítica ya está dentro.

**Verificación**: sección `journey` del smoke (perfil vacío al empezar; con un viaje sembrado, cifras, franja, nombre y objeto correctos; el tono coincide con `hermesDominantTone()`) y una ejecución de `journey_report.py` con un progreso de prueba.

### 14. QR o palabra clave por hoja (S) · implementada (22-10-2026)
**Decisiones del Operador (22-10-2026)**
- **Para qué**: **llave de la estación**. La sala web no se abre hasta que Silvia escanea el sello de su hoja: prueba que tiene el papel delante y evita saltárselo.
- **Forma**: **QR camuflado en un sello** renacentista: medallón de doble anillo con 24 marcas (como el disco de Aurelia) y el QR en el centro, con su margen limpio. Sin palabra impresa.
- **Hojas**: **solo 19–26**. Llevan sello las caras de juego de las Hojas 20 a 26 (20A, 20B, 21B, 22A, 23A, 24A, 25A, 26A: Estaciones 21 a 28). La Estación 20 (19B) ya estaba abierta antes de los sellos y no lo necesita.

**Implementación**
- `scripts/journal/sheet_seal.py`: un código de 8 letras A–Z por cara (se crea una vez y se guarda en `journal/stage_seals.json`), el QR apunta a `https://the-eclipse-order.pages.dev/?seal=CÓDIGO`. `draw_seal(canvas, cx, cy, r, cara)` dibuja el medallón en la hoja; cada sello se relee con OpenCV antes de aceptarlo. Ejecutado solo, escribe vistas previas en `journal/seals/` e imprime el hash de cada código. Necesita `segno` (`pip install segno`), solo para las hojas.
- `web/hub/js/sheet-seals.js` (`EclipseSheetSeals`): el Hub guarda **solo el hash** (FNV-1a) de cada código en `SEALS[nodo]`, que queda en `null` hasta que se construye la sala y se imprime su hoja (como las horas de las pausas, #3). Al abrir el Hub con `?seal=`, gira la llave (`order_sheet_seal_<nodo>`, viaja con la nube), quita el código de la dirección y lleva a la sala. Un sello escaneado antes de tiempo queda guardado.
- Mientras falta el sello, la ficha de la sala, la puerta y el Field Wire dicen *«opens with the seal on Sheet 20A»*. Va después de la pausa (#3): primero la hora, luego el sello. Carles puede abrirla desde el probador.
- **Salida de emergencia**: si la cámara falla o la hoja no está a mano, la pista de nivel 3 de la sala le pide que escriba a Hermes, y Carles la abre desde el probador.
- **Al construir cada sala 21–28**: dibujar su sello en la cara con `draw_seal` (zona libre, cero colisiones, mínimo 30 mm de diámetro) y pegar su hash en `SEALS`.

**Verificación**: `python3 scripts/journal/sheet_seal.py` (los ocho sellos se leen de vuelta) y sección `seals` del smoke (sin hash no se pide sello; con hash la ficha, la puerta y el Field Wire lo piden; un código bueno por la dirección abre la sala y se borra de la dirección; uno malo avisa; Carles la abre).

### 15. Verificador de hojas (M) · implementada (22-10-2026)
**Decisiones del Operador (22-10-2026)**
- **Qué comprueba**: **colisiones texto–dibujo** (40 px de papel limpio, `.agents/rules/user-preferences.md` §3), **tamaño de letra mínimo** (§4) y **vocabulario y Reglas 9/10**.
- **Qué hojas**: **todas, pero solo bloquean las 19–26**. Las 1–18 ya están impresas: se informan, nunca bloquean.
- **Margen**: **40 px**.
- **Cuándo**: **al construir cada hoja**: `build_stage_path.py` revisa cada cara antes de escribir su PDF y se para si algo falla.

**Implementación**
- `scripts/journal/verify_sheets.py`: mientras se dibuja cada cara vigila `render_pencil_text`, `blit_rgba` y `draw_seal` de todos los constructores, así sabe de cada bloque de texto sus palabras, su tamaño y sus píxeles exactos; todo lo demás es dibujo. Mientras revisa no escribe nada (algunos constructores de las hojas impresas guardan su PDF al dibujar).
- **Colisiones**: ningún trazo (alfa ≥ 60) a menos de 40 px de un bloque; se toleran 12 píxeles sueltos. No cuentan como dibujo los divisores finos bajo los títulos (con sus puntos finales). Una etiqueta **dentro** de un dibujo a propósito (la letra de una máscara, el numeral de un fragmento, un rótulo en su marco: trazos cerca por los cuatro lados) solo tiene que no tocarlos (3 px). En los mapas a sangre (18A) las etiquetas van sobre el dibujo: solo nota. Cada cara con choques deja `journal/verify/<cara>_check.png` con los trazos culpables en rojo (carpeta ignorada por git).
- **Tamaños**: error por debajo de 22 px; nota si el cuerpo dominante de la cara baja de 35 px.
- **Palabras**: las listas prohibidas y de jerga de `lint_lore_and_vocabulary.py`, letras con su valor (Regla 9, «[A] = 5»; las ecuaciones entre letras valen) y letras fuera de A–Z (Regla 10). En las caras de juego 20–26, además, que su sello exista y se lea de vuelta (#14).
- `build_entire_journal.py`: la lista de hojas pasa a `JOURNAL_SHEETS` (nivel de módulo) para que el verificador la recorra.
- El texto dibujado de otra forma (PIL directo) no se ve: el informe dice cuántos bloques vio en cada cara.

**Primera pasada (22-10-2026)**
- **Hoja 19B** tenía tres choques reales, ya corregidos: la flecha de «Its place in the mirror» a 12 px de su rótulo, los numerales del plano del espejo a 18 px (ahora 22) y la letra de las máscaras *moon* a 3 px del sombreado de la frente (bajada 4 px, centrada en su medallón). 19A y 19B pasan limpias.
- **Hojas 1–18 (solo informe)**: 21 caras con texto a menos de 40 px de un trazo (casi todo rótulos de diagramas y grados), 11 con letra bajo 22 px (mínimo 12 px en 9B), 18 con el cuerpo bajo 35 px; ninguna con términos prohibidos ni Reglas 9/10; una palabra de jerga impresa («stereographic», 4A). 12 caras (portada, carta, mapas y algunos juegos de constelación) dibujan el texto de otra forma y no se revisan.

**Verificación**: `python3 scripts/journal/verify_sheets.py` (todas, código de salida 1 si falla una cara 19–26) o `--sheets 19-26`; `python3 scripts/journal/build_stage_path.py` revisa y construye.

### 16. Vista previa de impresión de las 8 hojas (S) · implementada (22-10-2026)
**Decisiones del Operador (22-10-2026)**
- **Qué enseña**: el **pliego de miniaturas** (las 16 caras de las Hojas 19–26 sobre el papel real; las que faltan, como hueco rotulado) y las **marcas de anillas y doblez** sobre cada hoja.
- **Formato**: un **PDF de varias páginas** (A4 apaisado).
- **Imposición**: **A5 sueltas, como ahora**; la vista previa es solo para revisar, no se imprime.
- **Cuándo**: **al construir las hojas**.

**Implementación**
- `scripts/journal/stage_preview.py` escribe `journal/impresion/02_STAGE_PATH_VISTA_PREVIA_A4.pdf`: página 1, el pliego (dos filas de cuatro hojas, cara A y cara B lado a lado, con número y título; las caras sin construir muestran su tipo, su estación y su título provisional de `STAGE_PATH_BIBLE.md` §5). Después, una página por hoja construida con las dos caras grandes y, encima, las zonas del papel rayadas: anillas (cara A X < 165, cara B X > 1583), pie de 75 px y, si la cara se dobla, su línea de doblez con 40 px libres a cada lado. Bajo cada cara, la tinta hallada en anillas y pie (debe ser 0: «Limpia» o «REVISAR»).
- El doblez se declara en `FOLD_LINES` de `build_stage_path.py` (cara → dos puntos); hoy vacío, lo usará la Hoja 24A (#8).
- `build_stage_path.build()` termina regenerando el paquete de impresión 19–26 (`build_impresion_master.build_stage_bundle()`, que antes había que correr a mano) y la vista previa, con las caras ya dibujadas. Solo: `python3 scripts/journal/stage_preview.py`.
- Es un archivo para Carles: no va a `web/` ni a Silvia.
- **Al construir cada hoja 20–26**: añadirla a `STAGE_SHEETS` de `build_stage_path.py` **y** de `build_impresion_master.py` (las dos listas siguen separadas).

**Verificación**: `python3 scripts/journal/build_stage_path.py` (verifica, construye, paquete y vista previa); revisión visual de las dos páginas y de un doblez de prueba (fuera del repositorio).

### 17. Dividir `index.html` (L) · implementada y verificada (20-10-2026)
**Punto de partida**: CSS ~10.200 líneas en un `<style>` (196 comentarios de sección); HTML ~4.000; JS principal ~15.000 en un `<script>`: un núcleo de ~7.900 líneas (una sola clausura) seguido de 16 IIFE ya aisladas (`initGrandDesertMapAndChasm`, `initTesterPanel`, `initSunMonolith` … `initMasksGate`, `initSandstormLockdown`), que se comunican por `window.*`. El Operador abre el Hub por `file://`: no se pueden usar módulos ES.

**Decisiones (20-10-2026)**
- **Sin build**: `<script src>` clásicos y `<link rel="stylesheet">` en el mismo orden que hoy. Funciona igual en `file://` y en Cloudflare; la CSP no cambia (todo del mismo origen).
- **Extracción mecánica**: un archivo JS por cada IIFE aislada y el núcleo entero como `hub-core.js`; el CSS cortado por sus secciones (base, vistas, mapas, una hoja por estación). **Ni una línea de lógica cambia**: al concatenar los archivos en orden sale exactamente el código de hoy (se comprueba con un script).
- **El HTML de vistas y modales se queda en `index.html`** (pasa de ~29.000 a ~4.500 líneas).
- **Carpetas**: `web/hub/css/` y `web/hub/js/` (núcleo, `stations/sNN-nombre.js`, piezas como el tester). `web/assets/js/` sigue con el mapa 3D y el Espejo Vivo.
- **Estaciones nuevas** (21–28): nacen ya como `web/hub/js/stations/sNN-*.js` + `web/hub/css/stations/sNN-*.css`.

**Fuera de alcance**: partir el núcleo de 7.900 líneas (pasada posterior, si hace falta), inyectar el HTML de los modales desde JS, minificar.
**Verificación**: concatenación idéntica al original (JS y CSS); smoke completo en verde con el mismo número de comprobaciones; lint de lore; abrir el Hub por `file://` sin errores en consola.

**Resultado (20-10-2026)**
- `web/index.html`: **29.247 → 4.039 líneas**. 27 hojas en `web/hub/css/` (8 de estación en `stations/`) y 18 scripts en `web/hub/js/` (`hub-core.js` de 7.868 líneas, `profiles.js`, 11 de estación en `stations/` y 5 piezas: mapa del amanecer, alforja y Cairn I, tester, atajos y tormenta). El pequeño script del `<head>` que fija el tema antes de pintar sigue en línea.
- **Prueba de identidad**: al volver a meter cada archivo en línea sale, byte a byte, el `index.html` anterior. Único cambio de texto: 3 `url('./assets/…')` del CSS pasan a `../../assets/…`, porque en una hoja externa la ruta se resuelve desde su carpeta.
- Smoke completo: **206 comprobaciones en verde** (382 s). `lint_lore_and_vocabulary.py` limpio y ahora también revisa `.css` (antes el CSS estaba dentro del HTML y sí se revisaba). Por `file://`: carga sin errores, 30 hojas, perfiles y Espejo Vivo presentes.
- Actualizados `docs/HANDOFF_STAGE_PATH.md` (patrón por estación), `docs/WEB_ECOSYSTEM.md`, `docs/REPOSITORY_STRUCTURE.md` y `web/README.md`.
- Nota: un error en un archivo ya no detiene a los siguientes (antes, un fallo en el núcleo paraba todo el `<script>`).

### 18. Smoke más rápido (M) · implementada y verificada (20-10-2026)
**Decisiones (20-10-2026)**
- **Paralelo por procesos**: cada una de las 14 secciones de `web_smoke.py` corre en su propio proceso con su propio navegador y un único servidor compartido. Opción `--jobs N` (por defecto, los núcleos del Mac). Se mantiene la API síncrona de Playwright y el código de cada sección no cambia.
- **Pasada corta (`--quick`)**, para antes de cada commit: páginas sin errores ni CSP, vistas del Hub, gating del chat y del Ledger, perfiles, *Play this game* del Tester, Espejo Vivo y la última estación construida. Sin los juegos largos del desierto. Objetivo: 1–2 minutos.
- **Selección manual**: `--only` con los nombres de sección (útil al construir una estación).
- **Salida**: el informe de consola de siempre más `smoke_report.json` (por sección: resultado, duración y fallos), ignorado por git.
- **Sin CI**: sigue siendo un script local; el completo se pasa a mano antes de desplegar.

**Fuera de alcance**: reescribir esperas, reintentos automáticos, GitHub Actions.
**Verificación**: el completo en paralelo da el mismo número de comprobaciones y el mismo resultado que en serie; `--quick` en verde; tiempos antes y después anotados aquí.

**Resultado (20-10-2026, Mac de 8 núcleos)**
- Completo: **699 s en serie → 359 s con 2 procesos**, 206 comprobaciones en verde en ambos casos.
- `--quick` (8 secciones, 69 comprobaciones): 259 s con 1 proceso, **190 s con 2**. No llega al objetivo de 1–2 min: lo que pesa son las esperas fijas de cada prueba (ver «Pendiente»).
- **Procesos por defecto: 2.** Con 3, los shaders WebGL del mapa 3D fallan por la carga (falsos rojos); con 4 todo va más lento que en serie.
- **Navegador**: el Chromium de Playwright (instalado el 20-10-2026). Con el Chrome de escritorio, varios a la vez se pueden quedar parados ~15 min; en serie funciona.
- El servidor local ahora acepta una cola de 256 conexiones (la de 5 por defecto rechazaba conexiones con varios navegadores).

**Pendiente (si se quiere bajar de 3 min)**: sustituir las esperas fijas (`wait_for_timeout`, ~136) por esperas por condición en las secciones de `--quick`.

### 19. Guardado automático en la nube (M) · implementada, verificada y desplegada (21-10-2026)
> Sustituye a «exportación e importación»: el Operador no quiere que Silvia descargue ni haga nada (20-10-2026).

**Decisiones del Operador (20-10-2026)**
- **Automático y continuo**: se guarda cada vez que Silvia avanza, aunque sea un solo mensaje del Field Wire. Ella no ve botones ni archivos.
- **En Supabase**, creado y gestionado desde Claude con el conector oficial (MCP). El progreso «llega» a dos sitios: a **Claude**, que lo lee en sesiones futuras con el conector, y a **Carles**, en un panel del Hub (#9).
- **Recuperación sola**: si Silvia entra en un navegador sin partida (dispositivo nuevo o navegador borrado), el Hub descarga su último guardado y sigue donde lo dejó.
- **Seguridad «escritura cerrada, lectura por función»**: desde el navegador solo se puede **añadir** filas; no se puede leer, editar ni borrar las tablas. La recuperación usa una función que devuelve solo el último guardado de un perfil. Claude y Carles leen todo con acceso privado (conector, o clave fuera del repo). Riesgo aceptado: quien encontrara la URL podría añadir filas falsas.

**Diseño técnico**
- Tablas `eclipse_saves` (instantánea completa de la partida: las claves que no son de dispositivo, las mismas que ya separa `EclipseProfiles`) y `eclipse_events` (#22). RLS activado; solo política de `insert` para `anon`, con perfil `silvia`/`carles` y tamaño máximo. Función `eclipse_latest_save(seeker)` (`security definer`) para la recuperación. Poda automática: se conservan las últimas instantáneas de cada perfil.
- SQL versionado en `supabase/migrations/`.
- Cliente `web/hub/js/cloud-save.js` (sin dependencias, `fetch` a la API REST): detecta cada escritura de una clave de partida en `localStorage`, espera 2 s sin cambios y envía la instantánea; si no hay red, reintenta y guarda los eventos pendientes en el dispositivo. Al cerrar la pestaña envía lo pendiente con `keepalive`.
- Configuración pública (URL del proyecto y clave *publishable*, pública por diseño) en `web/hub/js/cloud-config.js`. Ninguna clave privada en el repo.
- CSP (`web/_headers`): `connect-src` se abre solo a la URL del proyecto de Supabase.
- Desactivado en `127.0.0.1`/`localhost` (smoke) salvo `?cloud=1`; el smoke prueba el guardado y la recuperación con la red simulada (Playwright intercepta las llamadas).

**Implementado (20-10-2026)**
- `web/hub/js/cloud-save.js`, cargado el primero en `<head>` tras `cloud-config.js`. Envuelve `localStorage.setItem/removeItem`; las claves de dispositivo (`the_eclipse_*`, `hub_sidebar_collapsed`, `eclipse_profile_vault_*`, `eclipse_cloud_*`) no cuentan.
- Activo solo en `https` sin `?admin`, `?tester`, `?carles` ni `?dev`; `?cloud=1` lo fuerza (smoke) y `?cloud=0` lo apaga. Con `cloud-config.js` vacío está apagado.
- **Nada se envía hasta que el dispositivo ha preguntado una vez a la nube** (`eclipse_cloud_ready_<perfil>`): así un arranque vacío nunca pasa a ser «el último guardado». Si la nube no responde, el Hub funciona igual y reintenta cada 15 s.
- Recuperación: navegador sin partida → aviso «Recovering your journey…» → se escriben las claves del último guardado → recarga. Mientras recarga, el Hub que arranca debajo no puede sobrescribirlas.
- Al cambiar de perfil (`EclipseProfiles.swap`) se envía lo pendiente del perfil que sale y se deja de registrar: el reempaquetado no es progreso.
- Las escrituras hechas desde iframes (juegos de Constellation) no se detectan al momento; entran en la siguiente instantánea.
- Smoke `cloud` (en `--quick`), contra un Supabase falso: 11 comprobaciones verdes. La de cambio de perfil se ha comprobado que falla sin la protección (34 bajas falsas).

**Supabase (20-10-2026)**: proyecto «Silvia's23», ref `aoochekcbugawaurllco` (eu-west-1). Migración `eclipse_cloud_save` aplicada con el conector; `cloud-config.js` lleva la URL y la clave *publishable*; `connect-src` de `web/_headers` abierto solo a esa URL.
- Permisos comprobados con la clave pública: insertar guardados y eventos sí (201); leer, modificar o borrar tablas no (`permission denied`); perfil distinto de silvia/carles rechazado por RLS; la función de poda no es accesible por la API. Único aviso del *advisor*: `eclipse_latest_save` ejecutable por `anon`, que es el diseño elegido.
- Prueba real: el Hub en Chromium como Carles (`?cloud=1`) envió sesión, vista, las claves del arranque y dos instantáneas (la segunda con el cambio, a los 6 s). Las filas de prueba se borraron: la base queda vacía.
- Leer el progreso (Claude, conector): `select * from eclipse_saves where seeker='silvia' order by saved_at desc limit 1;` y `eclipse_events` por `client_at`.

**Desplegado (21-10-2026)**: prueba real desde `the-eclipse-order.pages.dev` como Carles (CORS y CSP correctos, sin errores); filas de prueba borradas. El primer guardado de Silvia llegará la próxima vez que abra el Hub.

**Fuera de alcance**: login real de Supabase, exportar a archivo, avisos por email/Telegram.
**Verificación**: smoke nuevo (guardado tras avanzar, recuperación en navegador vacío, sin red no se pierde nada, Carles no pisa a Silvia); prueba real contra Supabase con el conector; CSP sin bloqueos.

### 20. Accesibilidad (M)
Pendiente de especificar.

### 21. PWA offline (M)
Pendiente de especificar.

### 22. Registro de juego (S) · implementada con la #19
**Decisión del Operador (20-10-2026)**: el registro no se queda en el dispositivo: viaja a Supabase con el guardado (#19) y lo leen Claude (conector) y Carles (panel #9).
**Primera versión, sin tocar las estaciones**: cada cambio de una clave de partida en `localStorage` es un evento (`key`, valor nuevo, hora del dispositivo), más el inicio de cada sesión y la vista abierta. Con eso se reconstruyen cuándo llegó a cada estación, cuánto tardó, qué respondió en el Field Wire y cuándo pidió pistas. Los intentos fallidos que hoy no se guardan se añaden con la #6 (pistas progresivas).
