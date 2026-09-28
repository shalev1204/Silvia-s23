# Ecosistema Web · The Eclipse Order

> **Guía maestra de organización web y despliegues en Cloudflare Pages.**  
> Todos los juegos y transmisiones digitales viven dentro de la carpeta `web/`, organizados estrictamente por **Caminos (Paths)** y **Juegos individuales**.

---

## 1. Estructura de Directorios en `web/`

```text
web/
├── index.html                                   ← Gateway / Redirección automática al juego activo (Fase 2)
├── README.md                                    ← Índice rápido de la carpeta
│
├── constellation/                               ← CAMINO: THE CONSTELLATION PATH
│   ├── celestial-flower/                        ← FASE 1: The Celestial Flower (Puzzle 22 estrellas original, preservado)
│   │   ├── index.html
│   │   ├── cartographer-illustration.jpg
│   │   └── logo-path-constellation.png
│   │
│   ├── celestial-flower-2/                      ← FASE 2: The Severed Sky (Bóveda tras el robo del Astrolabio)
│   │   ├── index.html
│   │   ├── cartographer-illustration.jpg
│   │   └── logo-path-constellation.png
│   │
│   ├── radio-transmission/                      ← FASE 2: The Stolen Astrolabe (Radio interactiva 22.22 / 142.85 MHz)
│   └── celestial-matrix/                        ← FASE 3: The Celestial Matrix (Calibración cardinal y Vector I)
│
├── desert/                                      ← CAMINO: THE DESERT PATH
│   └── zodiac-engine/                           ← FASE 4: The Zodiacal Engine & 3D Dunes Patrol (Raycast Engine)
│
├── shared/                                      ← COMPONENTES COMPARTIDOS GLOBALES
│   ├── navigator.css                            ← Cajón deslizante del Códice de la Orden
│   └── navigator.js                             ← Controlador universal de navegación e historial
│
└── stage/                                       ← CAMINO: THE STAGE PATH
    └── README.md                                ← Reservado para futuros puzzles (The Mirror Speaker)
```

---

## 2. Catálogo de Juegos y URLs Públicas

| # | Entrega | Camino | Carpeta Local | URL Pública (en Cloudflare Pages) | Estado |
|---|---|---|---|---|---|
| **00** | **The Grand Order Hub & Atlas** | 🧭 Portal Global | `web/index.html` | `https://TU-DOMINIO.pages.dev/` | 🌟 **Portal Central Activo** |
| **01** | **The Celestial Flower** | ✨ Constellation | `web/constellation/celestial-flower/` | `https://TU-DOMINIO.pages.dev/constellation/celestial-flower/` | ✅ **Completado (Histórico)** |
| **02** | **Emergency Radio Relay** | ✨ Constellation | `web/constellation/radio-transmission/` | `https://TU-DOMINIO.pages.dev/constellation/radio-transmission/` | 📻 **Completado (Audio transmisor)** |
| **03** | **The Celestial Matrix** | ✨ Constellation · Torre 1 | `web/constellation/celestial-matrix/` | `https://TU-DOMINIO.pages.dev/constellation/celestial-matrix/` | 🔭 **Calibrado (Glifo P y Vector I)** |
| **04** | **The Zodiacal Engine & 3D Dunes Patrol** | 🏜️ Desert · Torre 2 | `web/desert/zodiac-engine/` | `https://TU-DOMINIO.pages.dev/desert/zodiac-engine/` | 🏜️ **Nueva Quest Activa (Raycast 3D)** |
| **05** | **The Velvet Stage** | 🎭 Stage · Torre 3 | `web/stage/...` | `https://TU-DOMINIO.pages.dev/stage/...` | ⏳ Programado |
| **--** | **The Fourth Secret Realm** | 🗝️ Clímax | `web/...` | *Triangulación de las 3 torres* | 🔒 Bloqueado hasta alinear las 3 torres |

---

## 3. Acceso y Navegación Universal entre Entregas

- **El Gran Hub Central (`web/index.html`):** Portal unificado donde Silvia ve todo su mapa de viaje, las 3 Torres, la bitácora de despachos, las incógnitas de cripto-aritmética resueltas ($P=21, B=17$) y el acceso a cada fase.
- **Cajón Deslizante Universal (`web/shared/navigator.js` & `.css`):** Disponible en la esquina superior derecha de **todas** las páginas (`✦ ORDER CODEX ✦`). Silvia puede abrirlo para volver hacia atrás, saltar de pantalla o consultar sus glifos sin abandonar su progreso.
- **Transición Cinemática de Fase 3:** En `celestial-matrix/index.html`, al completar la Fase 3, el botón de rastreo abre la cinemática de las dunas con video y texto narrativo que la guía a abrir la Hoja 5 del diario físico y enlaza directamente a la Fase 4.
- **The Zodiacal Engine & 3D Dunes Patrol (`web/desert/zodiac-engine/`):** Introduce la Master Key `ECLIPSE` obtenida del crucigrama físico, deduce la ecuación $B=17$ y despierta el motor Raycast 3D para explorar las dunas y ruinas en primera persona.

---

## 4. Instrucciones de Despliegue (Cloudflare Pages)

Al subir la carpeta **`web`** completa a tu proyecto de Cloudflare (vía panel web o terminal):
- Cloudflare conserva exactamente la estructura de carpetas.
- Cada juego cuenta con sus propios assets independientes (imágenes y audios sin riesgo de colisión).
