# The Eclipse Order · Ecosistema Web

Estructura modular de experiencias web organizadas por **Caminos (Paths)** y **Fases / Juegos**.

## Jerarquía de directorios

```text
web/
├── index.html                                   ← Pasarela / Redirección automática al juego activo (Fase 2)
├── README.md                                    ← Esta guía
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
│   └── radio-transmission/                      ← FASE 2: The Stolen Astrolabe (Radio interactiva 22.22 MHz)
│       ├── index.html
│       └── cartographer_raid.mp3
│
├── desert/                                      ← CAMINO: THE DESERT PATH
│   └── README.md                                ← Reservado para futuros juegos (The Oracle)
│
└── stage/                                       ← CAMINO: THE STAGE PATH
    └── README.md                                ← Reservado para futuros juegos (The Mirror Speaker)
```

## URLs públicas en Cloudflare Pages

- **Enlace raíz:** `https://TU-DOMINIO.pages.dev/` (Redirige a la Fase 2: `celestial-flower-2`).
- **Fase 1 (Recuerdo original):** `https://TU-DOMINIO.pages.dev/constellation/celestial-flower/`
- **Fase 2 (Bóveda sin estrellas):** `https://TU-DOMINIO.pages.dev/constellation/celestial-flower-2/`
- **Fase 2 (Radio de socorro):** `https://TU-DOMINIO.pages.dev/constellation/radio-transmission/`
