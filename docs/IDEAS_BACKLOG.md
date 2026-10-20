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
| 19 | Guardado con exportación e importación | S | alto | No existe export/import; sí hay baúl por perfil en `localStorage` (`eclipse_profile_vault_<perfil>`) |
| 20 | Accesibilidad | M | alto | Parcial: `prefers-reduced-motion` en 7 puntos del Hub, ~97 `aria-label`; sin tamaño de letra ajustable ni auditoría de contraste/teclado |
| 21 | PWA offline | M | medio | No existe (sin manifest ni service worker) |
| 22 | Telemetría local sin red | S | medio | Las «telemetry» actuales son pastillas de interfaz de cada juego, no un registro; la CSP ya fija `connect-src 'self'` |

## Restricciones transversales (valen para todas)

- Texto de cara a Silvia en **inglés**, vocabulario sencillo, solo A–Z; prohibidos *Sunken, Coastal, Coast, Hermit, Stage Mistress*. Reglas 9 y 10 de `AGENTS.md`.
- El WHERE (Viena · Wiener Staatsoper) nunca en claro antes de la Estación 28; Pope-E es Carles y nada visible lo afirma ni lo deja deducir antes de la Torre I (nada con datos personales identificables).
- Silvia resuelve; Hermes y la Mirror Speaker no dan respuestas terminadas.
- Lo que se añade a la web **amplía** el diario, no lo repite (`STAGE_PATH_BIBLE.md` §2).
- CSP vigente (`web/_headers`): sin red externa; cualquier telemetría, guardado o PWA debe ser local o del mismo origen.
- Cada perfil guarda su propia aventura (`window.EclipseProfiles`): las funciones nuevas con estado deben respetarlo y el modo Carles debe poder verlas todas.
- Cualquier cambio en `web/index.html` pasa por `python3 scripts/audit/web_smoke.py` y `lint_lore_and_vocabulary.py` antes de darse por hecho.

## Dependencias y orden sugerido (a confirmar con el Operador)

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

### 17. Dividir `index.html` (L)
Pendiente de especificar.

### 18. Smoke más rápido (M)
Pendiente de especificar.

### 19. Guardado con exportación e importación (S)
Pendiente de especificar.

### 20. Accesibilidad (M)
Pendiente de especificar.

### 21. PWA offline (M)
Pendiente de especificar.

### 22. Telemetría local (S)
Pendiente de especificar.
