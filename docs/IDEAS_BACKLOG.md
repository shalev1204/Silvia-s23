# IDEAS BACKLOG · mejoras propuestas (20-10-2026)

> Lista de 22 ideas aportada por el Operador, agrupadas por tipo. Se especifican **una a una, en conversación con el Operador**, y después se implementan. Este documento es el registro vivo: cada idea pasa por `propuesta → especificada → implementada → verificada`.
> Esfuerzo: S (horas) · M (una sesión) · L (varias). Si algo choca con la Biblia Maestra o con `AGENTS.md`, manda la Biblia.

## Estado de cada idea en el código (comprobado el 20-10-2026)

| # | Idea | Esfuerzo | Impacto | Estado hoy |
|---|------|:---:|:---:|---|
| 1 | Resumen «Previously on…» al volver | S | alto | No existe (solo hay 3 menciones sueltas de la palabra) |
| 2 | Diario de campo automático (pestaña) | M | alto | No existe; ya hay vistas `archives` y `chronicles` en el Hub que conviene revisar antes |
| 3 | Momentos de pausa tras cada fragmento | S | medio | No existe |
| 4 | Sonido ambiental por estación | M | alto | Hay Web Audio en varias salas (tormenta, Cairn IV, Estela); no hay bucle ambiental por ruta |
| 5 | Háptica en móvil | S | medio | No existe (`navigator.vibrate`: 0 usos) |
| 6 | Pistas progresivas en 3 niveles | M | alto | Parcial: «pista tras 3 fallos» + *Ask Hermes* en cada estación |
| 7 | Variedad de mecánicas en 21–28 | M | alto | Ya fijado en `STAGE_PATH_BIBLE.md` §6; falta cerrar cada diseño |
| 8 | Puzzle «meta» que solo se resuelve con las hojas físicas | M | alto | No existe (varios juegos web ya se apoyan en la hoja, ninguno exige un dato exclusivo del papel) |
| 9 | Modo «ojo de Operador» | S | medio | Parcial: panel *Tester controls* (saltar, completar, reiniciar); no hay vista de progreso ni atascos de Silvia |
| 10 | Pistas sutiles de Pope-E en retrospectiva | M | alto | Parcial: nota 1 (Estación 20). Plan de pistas en `STAGE_PATH_BIBLE.md` §9 |
| 11 | Mirror Speaker que reacciona al estilo de juego | M | alto | No existe |
| 12 | Cartas de Aurelia desbloqueables en el Hub | S | medio | No existe (los cuadernos I–III son caras 21A, 23B, 25B) |
| 13 | Final distinto según el estilo de juego | L | medio | No existe |
| 14 | QR o palabra clave por hoja | S | medio | No existe |
| 15 | Verificador de hojas unificado | M | alto | Piezas sueltas: prueba de márgenes en cada `build_*.py`, `lint_lore_and_vocabulary.py`; no hay comprobación de colisiones texto-dibujo |
| 16 | Vista previa de impresión con las 8 hojas | S | medio | Parcial: `journal/impresion/01_STAGE_PATH_HOJAS_19_A_26_A5.pdf` |
| 17 | Dividir `web/index.html` (~29.000 líneas) | L | alto (largo plazo) | No existe; el Hub es un único archivo HTML+CSS+JS |
| 18 | Smoke más rápido | M | alto | `web_smoke.py` (1.255 líneas, ~11 min, 206 comprobaciones); sin pasada corta |
| 19 | Guardado automático en la nube (antes «exportación e importación») | M | alto | **Hecho y probado contra Supabase real** (proyecto `aoochekcbugawaurllco`); llega a Silvia con el próximo despliegue |
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

### 1. «Previously on…» (S)
Pendiente de especificar.

### 2. Diario de campo automático (M)
Pendiente de especificar.

### 3. Momentos de pausa (S)
Pendiente de especificar.

### 4. Sonido ambiental por estación (M)
Pendiente de especificar.

### 5. Háptica en móvil (S)
Pendiente de especificar.

### 6. Pistas progresivas en 3 niveles (M)
Pendiente de especificar.

### 7. Variedad de mecánicas en 21–28 (M)
Pendiente de especificar.

### 8. Puzzle meta con las hojas físicas (M)
Pendiente de especificar.

### 9. Modo «ojo de Operador» (S)
Pendiente de especificar.

### 10. Pistas sutiles de Pope-E (M)
Pendiente de especificar.

### 11. Mirror Speaker reactiva (M)
Pendiente de especificar.

### 12. Cartas de Aurelia en el Hub (S)
Pendiente de especificar.

### 13. Final según estilo de juego (L)
Pendiente de especificar.

### 14. QR o palabra clave por hoja (S)
Pendiente de especificar.

### 15. Verificador de hojas (M)
Pendiente de especificar.

### 16. Vista previa de impresión de las 8 hojas (S)
Pendiente de especificar.

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

### 19. Guardado automático en la nube (M) · implementada y verificada (falta desplegar)
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

**Pendiente**: desplegar (`wrangler pages deploy web`) cuando el Operador lo decida; hasta entonces Silvia sigue sin guardado en la nube.

**Fuera de alcance**: login real de Supabase, exportar a archivo, avisos por email/Telegram.
**Verificación**: smoke nuevo (guardado tras avanzar, recuperación en navegador vacío, sin red no se pierde nada, Carles no pisa a Silvia); prueba real contra Supabase con el conector; CSP sin bloqueos.

### 20. Accesibilidad (M)
Pendiente de especificar.

### 21. PWA offline (M)
Pendiente de especificar.

### 22. Registro de juego (S) · implementada con la #19
**Decisión del Operador (20-10-2026)**: el registro no se queda en el dispositivo: viaja a Supabase con el guardado (#19) y lo leen Claude (conector) y Carles (panel #9).
**Primera versión, sin tocar las estaciones**: cada cambio de una clave de partida en `localStorage` es un evento (`key`, valor nuevo, hora del dispositivo), más el inicio de cada sesión y la vista abierta. Con eso se reconstruyen cuándo llegó a cada estación, cuánto tardó, qué respondió en el Field Wire y cuándo pidió pistas. Los intentos fallidos que hoy no se guardan se añaden con la #6 (pistas progresivas).
