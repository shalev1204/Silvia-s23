# Estructura del Repositorio · The Eclipse Order

> **Regla de oro de organización:** Todo el repositorio se organiza siguiendo una jerarquía estricta:  
> `Ámbito General / Transversal` → `Caminos (Paths)` → `Juegos / Entregas individuales`.

---

## 1. Mapa General del Repositorio

```text
Silvia's23/
│
├── PROJECT_MASTER.md                ← SSOT: Índice maestro del proyecto
│
├── web/                             ← ECOSISTEMA DIGITAL (Se despliega en Cloudflare Pages)
│   ├── index.html                   ← Pasarela / Redirección automática a la flor
│   ├── README.md                    ← Índice rápido
│   ├── constellation/
│   │   ├── celestial-flower/        ← Juego 1 (Fase 1): The Celestial Flower (original preservado)
│   │   ├── celestial-flower-2/      ← Juego 1 (Fase 2): The Severed Sky (bóveda tras el robo)
│   │   └── radio-transmission/      ← Entrega 2 (Fase 2): The Stolen Astrolabe (Radio 22.22 MHz)
│   ├── desert/                      ← Puzzles y webs futuras de The Oracle
│   └── stage/                       ← Puzzles y webs futuras de The Mirror Speaker
│
├── assets/                          ← RECURSOS MULTIMEDIA (Producción y archivo)
│   ├── README.md
│   ├── general/                     ← Branding Orden, glifos Eclipse Script, fondos, Email 1
│   │   ├── branding/
│   │   ├── glyphs/
│   │   ├── backgrounds/
│   │   └── emails/
│   ├── constellation/               ← Branding camino, audios, retratos del Cartógrafo
│   │   ├── branding/
│   │   ├── celestial-flower/
│   │   └── radio-transmission/
│   ├── desert/                      ← Branding y recursos futuros
│   ├── stage/                       ← Branding y recursos futuros
│   └── archive/
│       └── tests/                   ← Capturas intermedias y tests de geometría
│
├── puzzles/                         ← DISEÑO Y MECÁNICAS DE JUEGO
│   ├── README.md
│   ├── general/
│   │   └── cipher-alphabet/         ← ECLIPSE_SCRIPT.md (Alfabeto y profecía)
│   ├── constellation/
│   │   ├── 01-celestial-flower/     ← PUZZLE.md
│   │   └── 02-stolen-astrolabe/     ← PUZZLE.md
│   ├── desert/
│   └── stage/
│
├── emails/                          ← CORRESPONDENCIA OFICIAL (DISPATCHES)
│   ├── README.md
│   ├── general/
│   │   └── 01-opening-dispatch/     ← Email 1 (1 Sep 22:22)
│   ├── constellation/
│   │   └── 01-cartographer-dispatch/← Email 2 (2 Sep 22:22)
│   ├── desert/
│   └── stage/
│
├── scripts/                         ← HERRAMIENTAS Y SCRIPTS
│   ├── README.md
│   ├── audio/                       ← Generación y mezcla de audios (stems, radio master)
│   │   └── archive/                 ← Borradores antiguos (distress call)
│   ├── glyphs/                      ← Generadores de glifos vectoriales (v1, v2, v3)
│   └── render/                      ← Scripts de renderizado A4 (Chrome headless)
│
└── docs/                            ← DOCUMENTACIÓN Y DISEÑO NARRATIVO
    ├── PROJECT_MASTER.md (en raíz)
    ├── LORE.md                      ← Mito, relaciones, profecía, reglas
    ├── PATHS_AND_CHARACTERS.md      ← Detalle de los 3 caminos y guardianes
    ├── GRIMOIRE.md                  ← Diario de bolsillo físico (11 Sep)
    ├── TIMELINE.md                  ← Calendario general de entregas
    ├── EMAIL_SETUP.md               ← Configuración de Gmail y perfiles
    ├── WEB_ECOSYSTEM.md             ← Catálogo de juegos web y guía Cloudflare
    ├── ASSETS.md                    ← Inventario de archivos multimedia
    └── REPOSITORY_STRUCTURE.md      ← Este documento
```
