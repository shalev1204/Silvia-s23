# Ecosistema Web · The Eclipse Order

> **Guía maestra de organización web y despliegues en Cloudflare Pages.**  
> Todos los juegos y transmisiones digitales viven dentro de `web/`. El **Hub Central** (`web/index.html`) es el portal único; los juegos de la senda de las Constelaciones tienen su propia carpeta y los juegos del Desert Path viven como módulos dentro del Hub.  
> **Fuente de verdad del lore y los números de estación:** [`CANONICAL_LORE_AND_VOCABULARY_AUDIT.md`](CANONICAL_LORE_AND_VOCABULARY_AUDIT.md) y [`DESERT_ODYSSEY_BIBLE.md`](DESERT_ODYSSEY_BIBLE.md) §5.B.

---

## 1. Estructura de Directorios en `web/`

```text
web/
├── index.html                      ← HUB CENTRAL (≈16.000 líneas, HTML+CSS+JS en un solo archivo)
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
| **14–17** | Sellos de Cairn II a V | 🏜️ Desert | — | ⏳ Pendiente |
| **18** | The Polybius Stele | 🏜️ Desert · Torre II | — | ⏳ Pendiente |
| **19** | The Oracle's Horizon | 🏜️ Desert · Torre II | — | ⏳ Pendiente |
| **--** | The Velvet Stage | 🎭 Stage · Torre III | `web/stage/` | ⏳ Programado |
| **--** | The Vault of the Grand Eclipse | 🗝️ Clímax | — | 🔒 Se abre al alinear las 3 torres |

---

## 3. El Hub Central (`web/index.html`)

**Vistas (`#view-*`):** `trail` (Constellation Trail y Grand Desert Map), `transmissions` (dossier y decodificador), `archives`, `chronicles` (crónicas de la Orden), `cipher` (The Cipher Ledger), `field-wire` (The Cliffside Workshop / *Ask Hermes*) y `astrolabe` (Brass Astrolabe, solo modo Carles).

**Gran Mapa del Desierto:** una única vista con el mosaico 2×2 de los 4 cuadrantes (NO Hoja 8B, NE Hoja 9A, SO Hoja 11B, SE Hoja 12A), sin subpestañas por cuadrante. Las pestañas del mapa se llaman «The Constellation Trail» y «The Grand Desert Map». Marcadores: Estación 10 en el SO; Estación 11 (Salt Playa), Estación 12 (ruinas nómadas) y Torre II en el SE.

**Orden estricto del Desert Path:** Chasm (10) → Salt Playa (11) → Lexicon (12) → Clepsydra (13). Cada modal comprueba que el anterior esté completado; el progreso ya guardado nunca se revoca. Claves de `localStorage`: `order_whispering_chasm_completed`, `order_salt_playa_completed` (y `order_salt_playa_path`), `order_desert_lexicon_completed`, `order_oasis_clepsydra_completed`.

**The Cliffside Workshop (chat con Hermes):** el botón del chat de la cabecera es un interruptor (dentro del Workshop vuelve a la pantalla anterior). Mensajes con burbuja de escritura en vivo, sonido de telégrafo con interruptor 🔊/🔇 (clave `order_chat_sound`), botón «Latest message» y separadores por campamento. Cada «Sheet NN» del chat abre una ficha con miniatura y atajo a su estación. *Ask Hermes* tiene búsqueda, filtros por tema y preguntas que se desbloquean con el progreso del jugador (el modo Carles las ve todas); las respuestas son siempre prehechas.

**Bloqueo por tormenta de arena:** tras la Estación 09 el Hub queda bloqueado 48 h (cuenta atrás en `localStorage`); a las 24 h aparece el telégrafo de cobre. Detalle técnico en la Biblia 6.0, §5.

**Estado del jugador:** `localStorage` (`order_*`, `seeker_silvia_*`, `seeker_carles_*`). Modo desarrollo para Carles con `?dev=1`, `isCarles` o entorno local.

**Regla 9 (cero spoilers numéricos):** ninguna interfaz muestra valores de letras del Cipher Ledger; Silvia los deduce. Las ecuaciones sí se muestran (por ejemplo `[P] - [A] = 14`), nunca sus soluciones.

---

## 4. Acceso y Navegación

- **Cajón «Order Codex»** (`web/shared/navigator.js` y `.css`): esquina superior derecha de todas las páginas; permite volver atrás o saltar de pantalla sin perder progreso.
- **Transición de Fase 3:** en `celestial-matrix`, al completar, un botón abre la cinemática de las dunas y enlaza a la Estación 07.

---

## 5. Notas de Coherencia

- La **Estación 07** (Constellation Path) vive en `web/constellation/zodiac-engine/`. Hasta octubre 2026 estuvo en `web/desert/zodiac-engine/`; se movió para alinear la carpeta con el canon.
- Los juegos del desierto (Estaciones 10–13) son módulos del Hub; si crecen, conviene extraerlos a `web/desert/<juego>/` para aligerar `index.html`.

---

## 6. Despliegue (Cloudflare Pages)

Al subir la carpeta **`web`** completa:
- Cloudflare conserva la estructura de carpetas.
- Cada juego tiene sus assets independientes (sin riesgo de colisión).
- No se suben `*.wav` ni `*.pcm` (ignorados por git); verifique que el despliegue parte del repositorio y no de una copia local con stems.
