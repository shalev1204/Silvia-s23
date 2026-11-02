# AGENTS.md — Protocolo Maestro de Onboarding y Reglas del Proyecto Silvia's 23

> **AUDIENCIA OBLIGATORIA:** Antigravity · Claude Code · Cursor · Gemini · Cualquier LLM asistente.  
> **INVARIANTE:** Este documento se lee automáticamente en el primer prompt de cada sesión. Define el lore canónico, las directrices de diseño renacentista, la arquitectura técnica y las restricciones operativas inmutables del proyecto.

---

## 1. 🚨 PROTOCOLO OBLIGATORIO DE INICIO DE SESIÓN

Antes de responder o realizar cualquier modificación de código, texto o maquetación, **TODO AGENTE DEBE CONSULTAR**:

1. **[`docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md`](docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md)**:
   - **La Biblia Maestra Canónica (Versión 6.0)**: Fuente de verdad absoluta e inmutable.
   - Contiene el 100% de la historia cronológica (1970–2026), todos los emails enviados, las 6 transmisiones de audio literales palabra por palabra, las 9 estaciones iniciales, la arquitectura del bloqueo de 48h del Hub Central por la tormenta de arena roja, las deducciones algebraicas completas de *The Cipher Ledger* y el vocabulario canónico blindado.
2. **[`docs/lore_and_puzzle_bible.md`](docs/lore_and_puzzle_bible.md)**:
   - Biblia de diseño de puzles, astronomía, engranajes y mecánicas.
3. **[`docs/DESERT_ODYSSEY_BIBLE.md`](docs/DESERT_ODYSSEY_BIBLE.md)**:
   - Desert Path (Estaciones 10 a 19, Hojas 08 a 18): travesía por los 5 Cairns, el Monolito Solar y *The Oracle's Horizon*.
4. **[`docs/STAGE_PATH_BIBLE.md`](docs/STAGE_PATH_BIBLE.md)**:
   - Stage Path (Estaciones 20 a 28, Hojas 19 a 26): los 8 fragmentos de espejo, el Espejo Roto Vivo, el Cuaderno de Aurelia y la Torre del Escenario.
5. **[`docs/HANDOFF_STAGE_PATH.md`](docs/HANDOFF_STAGE_PATH.md)**:
   - Estado de entrega, inventario de maquetación de 16 caras A5 y verificación de impresión.
6. **[`docs/REPOSITORY_STRUCTURE.md`](docs/REPOSITORY_STRUCTURE.md)**:
   - Mapa de directorios actualizado con las 26 hojas del diario y herramientas.
7. **[`.agents/rules/user-preferences.md`](.agents/rules/user-preferences.md)**:
   - Estándar estético renacentista, márgenes de troquelado A5 y cero colisiones texto-dibujo.

---

## 2. 📖 RESUMEN EJECUTIVO DEL LORE Y UNIVERSO NARRATIVO

### ¿Qué es Silvia's 23?
Una caza del tesoro inmersiva no lineal de ~56 días creada para el 23.º cumpleaños de **Silvia**.
- **La Protagonista:** Silvia. Extraordinaria resolviendo acertijos y descifrando códigos. Interactúa en **inglés**. Ella es la única y absoluta protagonista que resuelve cada misterio.
- **El Operador / Creador:** Carles. Diseña y programa el ecosistema.
- **La Orden Ficticia:** **The Eclipse Order** (símbolo sagrado: **◐** disco mitad luz / mitad penumbra; contacto sagrado: **22:22**; correo oficial: `theeclipseorder.quest@gmail.com`).
- **El Regalo Final:** **2 entradas de ballet** para Silvia y Carles, ocultas en **The Vault of the Grand Eclipse**, que se abrirá al completar los tres caminos.

### Los Tres Caminos, las Tres Torres y los Tres Misterios
Para revelar la ubicación y fecha del regalo, Silvia debe recorrer los tres caminos obligatorios. Cada camino custodia una de las Tres Antiguas Torres y revela un tercio del secreto final:

| Camino | Torre Antigua | Guardián Canónico | Misterio Revelado | Puzles y Eventos Clave |
|---|---|---|---|---|
| ✨ **Constellation Path** | **Tower I: The Alpine Observatory** | **The Cartographer of Distant Light** | **WHAT**<br>(Las 2 entradas de ballet) | Asalto al observatorio; robo del Astrolabio; despertar de la Flor Celeste; 6 transmisiones de audio; cartas astrales. |
| 🏜️ **Desert Path** | **Tower II: The Sandstone Sanctuary** | **The Oracle**<br>*(guía del desierto sin rostro)* | **WHEN**<br>(Fecha y hora del evento) | Los 5 Cairns; bloqueo de 48h por la gran tormenta de arena roja; el Monolito Solar; el Laberinto de Arenisca; *The Oracle's Horizon*. |
| 🎭 **Stage Path** | **Tower III: The Stage Tower**<br>*(The Mirror Sanctuary)* | **The Mirror Speaker**<br>*(guardiana del reflejo)* | **WHERE**<br>(Ciudad y teatro) | Los 8 fragmentos de espejo; el Espejo Roto Vivo; la Sala de Máscaras; la Linterna Caleidoscópica; el Cuaderno de Aurelia (1974). |

### El Mito de Hermes y Aurelia (El Secreto de la Orden)
- **1970–1971**: En el Alpine Observatory (Tower I), el joven y soberbio astrónomo **Hermes** intentaba forzar los secretos de las bóvedas cósmicas. Su compañera, la artista y astrónoma **Aurelia**, le enseñó que el amor era la única luz verdadera (*"You were always the treasure"*). Hermes le entregó un disco de latón grabado a mano como voto sagrado.
- **El Cataclismo de 1971**: Un violento terremoto partió el puente colgante de granito sobre el abismo de *Deserti Limen*. Aurelia cayó al vacío abrazando el disco para salvar las cartas celestes del incendio.
- **Los 45 años de soledad de « The Cartographer » (1971–2016)**: Creyéndola muerta y consumido por la culpa, Hermes renunció para siempre a su nombre, vistió ropas de nómada alpino y se convirtió en **The Cartographer**. Pasó décadas reconstruyendo el observatorio y buscando los restos de Aurelia sin éxito.
- **La Supervivencia de Aurelia (1974)**: Aurelia no pereció en la caída; sobrevivió en las ruinas del cañón y halló refugio en **The Stage Tower (Tower III)**. Allí investigó el Espejo Roto y dejó su cuaderno manuscrito (*Cuaderno de Aurelia*, Hojas 21B, 23B, 25B del diario) con sus memorias antes de desaparecer en las cumbres.
- **Septiembre 2026**: Silvia despierta *The Celestial Flower*. Fuerzas hostiles asaltan el Alpine Observatory y roban **The Astrolabe of Distant Light**. El Cartógrafo escapa al desierto por el acueducto y envía el diario físico a Italia. Juntos rastrean a los asaltantes, cruzan la tormenta y descifran las Tres Torres para abrir **The Vault of the Grand Eclipse**.

---

## 3. 🛑 VOCABULARIO BLINDADO E INVARIANTES CANÓNICOS

Queda **estrictamente prohibido** utilizar términos no canónicos o derivados erróneos. El linter `scripts/audit/lint_lore_and_vocabulary.py` audita el repositorio antes de cada entrega:

| ❌ Término Prohibido | ✅ Término Canónico Obligatorio | Contexto / Motivo |
|---|---|---|
| *The Sunken Sanctuary* | **The Sandstone Sanctuary** (o *The Sandstone Tower*) | Torre II del desierto. Nunca estuvo sumergida. |
| *The Coastal Amphitheater* / *The Coast* | **The Stage Tower** (o *The Mirror Sanctuary*) | Torre III del Stage Path. No hay costa ni playa marina. |
| *The Hermit* | **The Oracle** | El guardián del desierto es un oráculo sin rostro, no un ermitaño. |
| *The Stage Mistress* | **The Mirror Speaker** | La guardiana del espejo y la simetría. Nunca "Mistress". |

### 🚫 Jerga Técnica Prohibida en Material de Silvia
En todos los textos dirigidos a Silvia (diario manuscrito, interfaces web, pistas, diálogos de personajes), está prohibido el uso de vocabulario astronómico impenetrable:
- En lugar de *Azimuth* $\rightarrow$ usar **bearing**, **heading** o **direction**.
- En lugar de *Mucro* / *Mucrones* $\rightarrow$ usar **star pointer**, **marker** o **star tip**.
- En lugar de *Mater* $\rightarrow$ usar **base plate**, **casing** o **frame**.
- En lugar de *Tympan* $\rightarrow$ usar **horizon plate**, **disc** o **dial**.
- En lugar de *Stereographic* $\rightarrow$ usar **sky plan**, **star map** o **altitude arcs**.

---

## 4. 📐 LAS 11 REGLAS DE ORO DE PRODUCCIÓN DEL OPERADOR (CAPA 2)

Al generar páginas del diario (`scripts/journal/`), puzles web (`web/`) o documentación:

1. **Títulos Claros y Directos**: Sin adjetivos grandilocuentes ni florituras redundantes (ej. *"The Astrolabe"*, nunca *"The Astrolabe of Distant Light"*).
2. **Estética Renacentista de Alta Fidelidad ("Currado")**: Dibujos detallados, elegantes y trabajados al estilo Da Vinci, Kepler y Dürer. Rayado fino (*cross-hatching*), texturas de grafito orgánico, biseles mecánicos, compases y grabados a buril. Prohibidos bocetos infantiles, palotes o geometría simple vacía.
3. **Cero Colisiones Texto–Dibujo (Prioridad Crítica)**: Ningún trazo de dibujo puede tocar el texto manuscrito. Búfer de seguridad obligatorio de **40 a 80 px** entre ilustraciones y bloques de texto.
4. **Troquelado Físico A5 Respetado al 100%**:
   - **Cara A (anverso)**: Margen izquierdo $X < 165$ px con **0 píxeles** de contenido (perforación para anillas).
   - **Cara B (reverso)**: Margen derecho $X > 1583$ px con **0 píxeles** de contenido.
5. **Ergonomía Tipográfica para Papel Físico A5**:
   - Títulos principales: 62–66 px @ 300 DPI.
   - Párrafos de cuerpo y narrativa: 35–38 px.
   - Reglas, notas y descripciones técnicas: 28–33 px.
   - Subtítulos y cotas menores: $\ge 22$ px (nunca tipografías microscópicas).
6. **Vocabulario Accesible ("SIMPLIFICAMOS EL VOCABULARIO")**: Inglés directo, poético, evocador y comprensible. Cero tecnicismos incomprensibles.
7. **Agencia Absoluta de Silvia**: Silvia juega y resuelve; el Cartógrafo, The Oracle y The Mirror Speaker solo ambientan, narran y orientan. Ningún personaje resuelve el enigma por Silvia.
8. **Canon del Astrolabio & Tres Torres**: El Astrolabio físico fue robado; solo descifra nativamente 6 estrellas maestras (`Ald`, `Pol`, `Veg`, `Alt`, `Den`, `Arc`). El diario permite reconstruir/simular las alineaciones celestes restantes. Al alinear las 3 Torres, el Astrolabio abre el 4.º lugar secreto: *The Vault of the Grand Eclipse*.
9. **Cero Datos Numéricos Iniciales (Cripto-Aritmética Sin Spoilers)**: En *The Cipher Ledger*, Silvia comienza con CERO valores precargados. Silvia deduce el valor de cada letra ($P, B, K$, etc.) por álgebra pura mediante las pistas del diario. Prohibido mostrar o precargar soluciones.
10. **Uso Exclusivo del Alfabeto Estándar ($A–Z$) en Fórmulas y Coordenadas**: En todas las interfaces web, fórmulas celestes (Latitude, Longitude, Differential) y pizarras de recompensas, se utilizan SIEMPRE las letras estándar de nuestro alfabeto latino ($K, G, A, O, B, P$, etc.), NUNCA glifos extraños o runas incomprensibles.
11. **Higiene del Repositorio y Cero Scripts Sueltos en la Raíz**: Prohibido crear scripts de prueba (`test_*.py`, `debug_*.py`) o imágenes sueltas en la raíz o en `scripts/journal/`. Todo script experimental o prototipo debe ubicarse obligatoriamente en los subdirectorios de `scratch/` (`maps/`, `hub_tests/`, `verifications/`, `utils/`) o en sesiones temporales de `brain/`.

---

## 5. 🗺️ ARQUITECTURA TÉCNICA DEL REPOSITORIO

- **Diario Manuscrito A5 (`journal/`)**:
  - 26 Hojas doble cara (52 páginas A5): `page01` a `page26`.
  - Hojas 01 a 18: Constellation Path y Desert Path.
  - Hojas 19 a 26: Stage Path (compiladas mediante `scripts/journal/build_stage_path.py`).
  - Sellos QR criptográficos: `journal/seals/` y `journal/stage_seals.json` (validados por OpenCV en `scripts/journal/sheet_seal.py`).
  - Paquetes de impresión: `journal/impresion/00_DIARIO_COMPLETO_36_PAGINAS_A5.pdf`, `01_STAGE_PATH_HOJAS_19_A_26_A5.pdf`, `02_STAGE_PATH_VISTA_PREVIA_A4.pdf` y `hojas_doble_cara/`.
- **Ecosistema Web (`web/`)**:
  - Hub Central: `web/index.html`, cargado modularmente con CSS en `web/hub/css/` y JavaScript vanilla en `web/hub/js/` (estaciones en `web/hub/js/stations/`). Funciona offline como PWA y mediante protocolo `file://`.
  - Manifiesto offline sincronizado por `python3 scripts/web/offline_list.py` en `web/sw.js`.
- **Herramientas de Soporte (`scripts/`)**:
  - `scripts/audit/`: `lint_lore_and_vocabulary.py`, `web_smoke.py`, `journey_report.py`.
  - `scripts/audio/`: Pipeline de 24 scripts para síntesis de voz Gemini TTS y foley (ver `scripts/audio/README.md`).
  - `scripts/journal/`: Compiladores maestros de páginas, sellos, maquetación y dibujos renacentistas (`stage_drawings.py`).
- **Scratch (`scratch/`)**:
  - `scratch/maps/`: Pruebas de curvas paramétricas SVG y mapas.
  - `scratch/hub_tests/`: Pruebas de integración del Hub, talleres y tormenta roja.
  - `scratch/verifications/`: Verificaciones criptográficas, léxicas y de laberintos.
  - `scratch/utils/`: Utilidades auxiliares de captura y depuración visual.

---

## 6. 🧪 PROTOCOLO DE VERIFICACIÓN OBLIGATORIA (R3)

Antes de dar por concluida cualquier tarea, ejecute los comandos correspondientes y reporte el resultado:
1. **Linter de Lore y Vocabulario Canónico**:
   ```bash
   python3 scripts/audit/lint_lore_and_vocabulary.py
   ```
   *(Debe arrojar 0 términos no canónicos).*
2. **Verificador de Maquetación y Sellos del Diario**:
   ```bash
   python3 scripts/journal/verify_sheets.py --sheets 19-26
   ```
   *(Debe verificar cero colisiones y márgenes de corte).*
3. **Sincronización del Manifiesto Web Offline (si se tocan assets o JS de la web)**:
   ```bash
   python3 scripts/web/offline_list.py
   ```

---

## 7. 🔒 DISCIPLINA DE CONTROL DE VERSIONES (REGLA R4)

- **PROHIBIDO** ejecutar `git commit` o `git push` sin mandato explícito del Operador.
- **PROHIBIDO** abrir Pull Requests, hacer rebase destructivo, `--force` o saltarse hooks pre-commit (`--no-verify`).
- Cuando el Operador ordene realizar un commit, prepare un stage selectivo excluyendo archivos temporales o credenciales y redacte un mensaje claro que explique el *por qué* del cambio.
