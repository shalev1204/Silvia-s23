# Ecosistema Web · The Eclipse Order

> **Guía maestra de organización web y despliegues en Cloudflare Pages.**  
> Todos los juegos y transmisiones digitales viven dentro de `web/`. El **Hub Central** (`web/index.html`) es el portal único; los juegos de la senda de las Constelaciones tienen su propia carpeta y los juegos del Desert Path viven como módulos dentro del Hub.  
> **Fuente de verdad del lore y los números de estación:** [`CANONICAL_LORE_AND_VOCABULARY_AUDIT.md`](CANONICAL_LORE_AND_VOCABULARY_AUDIT.md) y [`DESERT_ODYSSEY_BIBLE.md`](DESERT_ODYSSEY_BIBLE.md) §5.B.

---

## 1. Estructura de Directorios en `web/`

```text
web/
├── index.html                      ← HUB CENTRAL (~4.000 líneas: solo el HTML de vistas y modales)
├── hub/                            ← CSS y JS del Hub, sin build (<link> y <script src> clásicos: también va por file://)
│   ├── css/                        ← base, temas, vistas, chat… y stations/sNN-*.css
│   └── js/                         ← hub-core.js (vistas, chat, Field Wire, Ledger, tester), profiles.js y stations/sNN-*.js
├── README.md                       ← Índice rápido de la carpeta
├── assets/                         ← Mapas del desierto, miniaturas, fondos, branding y tarjetas de email
│   └── maps/                       ← Cuadrantes NO/NE/SO/SE y mosaico 2×2 (sincronizados desde el diario)
│
├── constellation/                  ← CAMINO: THE CONSTELLATION PATH
│   ├── celestial-flower/           ← Estación 03 · The Celestial Flower (22 estrellas de Cygnus, preservado)
│   ├── celestial-flower-2/         ← Estación 04 · The Severed Sky (bóveda tras el robo del Astrolabio)
│   ├── radio-transmission/         ← Estaciones 04–05 · Radio de emergencia (22.22 / 19.84 / 142.85 MHz)
│   ├── celestial-matrix/           ← Estación 06 · The Celestial Matrix (sopa 12×12, Vector I, glifo P)
│   ├── zodiac-engine/              ← Estación 07 · The Zodiacal Engine & patrulla 3D (motor raycast)
│   ├── midnight-calibration/       ← Estación 08 · Midnight Calibration & The Shifting Tempest
│   └── celestial-cipher/           ← Estación 09 · The Celestial Cipher (el voto de Hermes y la gran tormenta)
│
├── desert/                         ← THE DESERT PATH (sus juegos viven hoy dentro del Hub; ver README)
│
├── shared/
│   ├── navigator.css               ← Cajón deslizante «Order Codex»
│   └── navigator.js                ← Controlador universal de navegación e historial
│
└── stage/
    └── README.md                   ← Reservado para The Mirror Speaker (Stage Path)
```

> Los stems y el foley intermedio (`*.wav`, `*.pcm`) **no se versionan ni se despliegan** (están en `.gitignore`); se regeneran con `scripts/audio/`. Solo se publican los `.mp3` y `.mp4` finales.

---

## 2. Catálogo de Estaciones y Juegos Web

| Estación | Entrega | Camino | Ubicación local | Estado |
|:---:|---|---|---|---|
| **00** | The Grand Order Hub & Atlas | Portal global | `web/index.html` | 🌟 Activo (con bloqueo de tormenta) |
| **03** | The Celestial Flower | ✨ Constellation | `web/constellation/celestial-flower/` | ✅ Completado |
| **04** | The Observatory Raid / The Severed Sky | ✨ Constellation | `radio-transmission/` + `celestial-flower-2/` | ✅ Completado |
| **05** | Emergency Radio Relay | ✨ Constellation | `web/constellation/radio-transmission/` | ✅ Completado |
| **06** | The Celestial Matrix | ✨ Constellation · Torre I | `web/constellation/celestial-matrix/` | ✅ Completado (glifo P, Vector I) |
| **07** | The Zodiacal Engine & 3D Outpost Patrol | ✨ Constellation | `web/constellation/zodiac-engine/` | ✅ Completado (glifo K) |
| **08** | Midnight Calibration & The Shifting Tempest | ✨ Constellation | `web/constellation/midnight-calibration/` | ✅ Completado |
| **09** | The Celestial Cipher | ✨ Constellation | `web/constellation/celestial-cipher/` | ✅ Completado (clímax y tormenta) |
| **10** | The Whispering Chasm | 🏜️ Desert | Modal dentro del Hub | ✅ Implementado |
| **11** | The Salt Playa | 🏜️ Desert | Modal dentro del Hub | ✅ Implementado |
| **12** | The Desert Lexicon & Al-Qibla | 🏜️ Desert | Modal dentro del Hub | ✅ Implementado |
| **13** | The Oasis Clepsydra | 🏜️ Desert | Modal dentro del Hub | ✅ Implementado |
| **14** | The Sun Monolith & Cairn II | 🏜️ Desert | Modal dentro del Hub | ✅ Implementado |
| **15** | The Sandstone Labyrinth & Cairn III | 🏜️ Desert | Modal dentro del Hub | ✅ Implementado |
| **16** | Cairn IV · Sentry of the Canyon (The Song of the Pillars) | 🏜️ Desert | Modal dentro del Hub (con sonido) | ✅ Implementado |
| **17** | Arch of the Solstice & Cairn V (The Autumn Dawn · The Night Signal) | 🏜️ Desert | Modal dentro del Hub | ✅ Implementado |
| **18** | The Polybius Stele · Tower II in Flames (The Knocks in the Stone · The Burning Atrium) | 🏜️ Desert · Torre II | Modal dentro del Hub (con sonido) | ✅ Implementado |
| **19** | The Oracle's Horizon (The Disc of 24 Sightings · The Vow) | 🏜️ Desert · Torre II | Modal dentro del Hub | ✅ Implementado (WHEN: 18–20 dic) |
| **20** | The Gate of a Thousand Masks (The Word of the Gate · The Missing Halves) | 🎭 Stage · Torre III | Modal dentro del Hub | ✅ Implementado (Fragmento I) |
| **21–28** | The Velvet Stage: Camera Obscura → Stage of the Mirror Speaker | 🎭 Stage · Torre III | Modales dentro del Hub | ⏳ Programado (`docs/STAGE_PATH_BIBLE.md`) |
| **--** | The Vault of the Grand Eclipse | 🗝️ Clímax | — | 🔒 Se abre al alinear las 3 torres |

---

## 3. El Hub Central (`web/index.html`)

**Vistas (`#view-*`):** `trail` (Constellation Trail y Grand Desert Map), `transmissions` (dossier y decodificador), `archives`, `chronicles` (crónicas de la Orden), `cipher` (The Cipher Ledger), `field-wire` (The Cliffside Workshop / *Ask Hermes*) y `astrolabe` (Brass Astrolabe, solo modo Carles).

**Gran Mapa del Desierto:** una única vista con el mosaico 2×2 de los 4 cuadrantes (NO Hoja 8B, NE Hoja 9A, SO Hoja 11B, SE Hoja 12A), sin subpestañas por cuadrante. Las pestañas del mapa se llaman «The Constellation Trail» y «The Grand Desert Map». Marcadores: Estación 10 en el SO; Estación 11 (Salt Playa), Estación 12 (ruinas nómadas) y Torre II en el SE.

**Orden estricto del Desert Path:** Chasm (10) → Salt Playa (11) → Lexicon (12) → Clepsydra (13) → Sun Monolith (14, tras la escena de las puertas de la Torre II y 12 h de travesía en el Field Wire) → Sandstone Labyrinth (15, tras el amanecer bajo el Monolito y 6 h de bajada) → Cairn IV (16, tras el anochecer en el *hardpan* y 18 h de travesía) → Arch of the Solstice (17, tras el anochecer en Cairn IV y 18 h de travesía) → Polybius Stele (18, tras el mediodía bajo el Arco y 6 h de marcha hacia la Torre II en llamas) → The Oracle's Horizon (19, al amanecer, con los cinco sellos; sin travesía). Al terminar aparece la tarjeta sellada del Path III (The Stage Tower). Cada modal comprueba que el anterior esté completado; el progreso ya guardado nunca se revoca. Claves de `localStorage`: `order_whispering_chasm_completed`, `order_salt_playa_completed` (y `order_salt_playa_path`), `order_desert_lexicon_completed`, `order_oasis_clepsydra_completed`, `order_monolith_march_start`, `order_sun_monolith_completed` (y `order_sun_monolith_awake`, `order_sun_monolith_marks`, `order_monolith_hint`, `order_seal_cairn_2`), `order_labyrinth_march_start`, `order_sandstone_labyrinth_completed` (y `order_labyrinth_awake`, `order_labyrinth_captures`, `order_labyrinth_torch_hint`, `order_seal_cairn_3`), `order_cairn4_march_start`, `order_cairn_iv_completed` (y `order_cairn4_awake`, `order_cairn4_verses`, `order_cairn4_count_hint`, `order_cairn4_sound`, `order_seal_cairn_4`; reliquia `tuning_pebble`), `order_cairn5_march_start`, `order_arch_solstice_completed` (y `order_cairn5_awake`, `order_cairn5_mirrors`, `order_cairn5_dawn_done`, `order_cairn5_signal_round`, `order_seal_cairn_5`; reliquia `signal_mirror`; ceremonia `order_five_seals_celebrated`), `order_stele_march_start`, `order_polybius_stele_completed` (y `order_stele_awake`, `order_stele_knocks`, `order_stele_knock_hint`, `order_stele_fire_hint`, `order_stele_sound`, `order_stele_seals_at_well`; reliquia `servant_key`), `order_oracle_stair_start`, `order_oracle_horizon_completed` (y `order_oracle_awake`, `order_oracle_disc`, `order_oracle_when_read`, `order_oracle_disc_hint`, `order_oracle_vow_hint`, `order_stage_passage_seen`; reliquia `gilded_star`).

**Stage Path (Path III · The Velvet Stage):** aparece al terminar la Estación 19. Su mapa es **el Espejo Vivo** (`web/assets/js/stage-mirror.js`, geometría generada por `scripts/journal/stage_mirror.py` en `web/assets/js/stage-mirror-data.js`): un espejo veneciano roto en 9 fragmentos (I–IX, uno por estación, nodos 40–48) sobre un caleidoscopio que gira (arrastre o flechas; respeta `prefers-reduced-motion`). Cada fragmento y la cinta de salas abren su sala (`window.selectStageStation(node)`; cada sala construida registra `window.STAGE_OPENERS[node]` y su ficha en `window.STAGE_CARDS[node]`). El WHERE solo se escribe cuando el espejo está completo (en el código está guardado al revés). Field Wire: paso 33 (partida de la Torre II, 18 h de travesía), 34 (en camino), 35 (balance de la Estación 20 y la nota sellada con ceniza), 36 (cierre). Claves: `order_masks_march_start`, `order_masks_gate_completed` (y `order_masks_gate_awake`, `order_masks_carved`, `order_masks_hint`, `order_masks_draw_hint`), `order_stage_mirror_seen` (máscara de bits de los fragmentos ya vistos destellar).

**The Cliffside Workshop (chat con Hermes):** el botón del chat de la cabecera es un interruptor (dentro del Workshop vuelve a la pantalla anterior). Mensajes con burbuja de escritura en vivo, sonido de telégrafo con interruptor 🔊/🔇 (clave `order_chat_sound`) y separadores por campamento. Cada «Sheet NN» del chat abre una ficha con miniatura y atajo a su estación. *Ask Hermes* tiene búsqueda, filtros por tema y preguntas que se desbloquean con el progreso del jugador (el modo Carles las ve todas); las respuestas son siempre prehechas. En el desierto, el Field Wire espera a que cada estación (12, 13) esté resuelta antes de abrir su conversación de balance (Camp VII tras la 12, Camp VIII tras la 13, el nicho de Cairn II tras la 14, la huida del laberinto tras la 15, el canto de Cairn IV tras la 16, la luz de la Torre II tras la 17).

**Bloqueo por tormenta de arena:** tras la Estación 09 el Hub queda bloqueado 48 h (cuenta atrás en `localStorage`); a las 24 h aparece el telégrafo de cobre. Para Silvia la tormenta ya terminó: la ventana de 48 h acabó el **domingo 18 de octubre de 2026 a las 14:00** (constante `SUNDAY_OCT_18_2026_2PM`). Detalle técnico en la Biblia 6.0, §5.

**Estado del jugador:** `localStorage` (`order_*`, `seeker_silvia_*`, `seeker_carles_*`). **Cada perfil guarda su propia aventura**: al cambiar de perfil (Switch Seeker), todo el progreso del perfil que sale se guarda en su baúl (`eclipse_profile_vault_<perfil>`) y se restaura el del que entra; solo se quedan los ajustes del dispositivo (`the_eclipse_active_seeker`, `the_eclipse_gate_ok_at`, `hub_sidebar_collapsed`). Un perfil sin baúl empieza en el punto canónico (`syncWaypointBaseline`: paso 4 del chat, amanecer 0). Código en `window.EclipseProfiles` (script del portal). El navegador de Silvia nunca cambia de perfil, así que a ella no le afecta. Panel **Tester controls** (solo Carles): en cada juego, **▶ Play this game** deja el mundo en la llegada a ese juego (todo lo anterior completado con sus recompensas, ese juego y los siguientes sin resolver, sellos, reliquias e inventario coherentes, sin viaje que esperar) y lo abre; se puede pulsar adelante y atrás tantas veces como se quiera. También **⏩ Complete up to here**, **⏭ Skip every walk**, **⏩ Complete every built game** y **↺ Replay the whole desert**. Para Carles, los botones del mapa nunca esperan a un viaje. Modo tester (todas las estaciones abiertas, `window.isAdminTester`): `?admin=1`, `?carles=1`, `?tester=1` o el perfil Carles; `?dev=1` solo afecta al sandbox de la tormenta. El Cipher Ledger de Silvia se siembra una sola vez con O y A porque ella ya los había deducido (decisión del Operador; clave `order_silvia_oa_ledger_v1`).

**Regla 9 (cero spoilers numéricos):** ninguna interfaz muestra valores de letras del Cipher Ledger; Silvia los deduce. Las ecuaciones sí se muestran (por ejemplo `[P] - [A] = 14`), nunca sus soluciones.

---

## 4. Acceso y Navegación

- **Cajón «Order Codex»** (`web/shared/navigator.js` y `.css`): esquina superior derecha de todas las páginas; permite volver atrás o saltar de pantalla sin perder progreso.
- **Transición de Fase 3:** en `celestial-matrix`, al completar, un botón abre la cinemática de las dunas y enlaza a la Estación 07.

---

## 5. Notas de Coherencia

- La **Estación 07** (Constellation Path) vive en `web/constellation/zodiac-engine/`. Hasta octubre 2026 estuvo en `web/desert/zodiac-engine/`; se movió para alinear la carpeta con el canon.
- Los juegos del Desert y del Stage Path (Estaciones 10–20) son módulos del Hub: su JS y CSS están en `web/hub/js/stations/` y `web/hub/css/stations/`, y su modal en `index.html`. Las estaciones nuevas siguen ese mismo patrón.

---

## 6. Despliegue (Cloudflare Pages)

> **Antes de desplegar**: `python3 scripts/audit/web_smoke.py` debe terminar en `✅ ALL GREEN` (ver `scripts/README.md`).

Al subir la carpeta **`web`** completa:
- Cloudflare conserva la estructura de carpetas.
- Cada juego tiene sus assets independientes (sin riesgo de colisión).
- No se suben `*.wav` ni `*.pcm` (ignorados por git); verifique que el despliegue parte del repositorio y no de una copia local con stems.
