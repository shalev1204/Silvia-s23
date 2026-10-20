# The Eclipse Order · Web Ecosystem

Web experiences organised by **Paths** and **Stations**. Full catalogue, status and deployment notes: [`docs/WEB_ECOSYSTEM.md`](../docs/WEB_ECOSYSTEM.md).

## Directory layout

```text
web/
├── index.html                 ← CENTRAL HUB: map, transmissions, Cipher Ledger, telegraph and the Desert Path games
├── assets/                    ← Desert maps (maps/), thumbnails, backgrounds and branding
├── constellation/             ← THE CONSTELLATION PATH
│   ├── celestial-flower/      ← Station 03
│   ├── celestial-flower-2/    ← Station 04 (The Severed Sky)
│   ├── radio-transmission/    ← Stations 04–05 (radio)
│   ├── celestial-matrix/      ← Station 06
│   ├── zodiac-engine/         ← Station 07
│   ├── midnight-calibration/  ← Station 08
│   └── celestial-cipher/      ← Station 09
├── hub/                       ← The Hub's CSS and JS (core + one file per station)
├── desert/                    ← Reserved: THE DESERT PATH (currently inside the Hub)
├── shared/                    ← navigator.js / navigator.css (the "Order Codex" drawer)
└── stage/                     ← Reserved: The Mirror Speaker
```

## Notes

- The Hub's own CSS and JS live in `hub/css/` and `hub/js/` (one file per station in `stations/`), loaded as plain `<link>` and `<script src>` tags so the Hub also opens from `file://`. The Desert and Stage Path games (Stations 10 to 20) keep their modals in `index.html`.
- Intermediate audio stems (`*.wav`, `*.pcm`) are neither versioned nor deployed.
- Public routes: `https://YOUR-DOMAIN.pages.dev/` (Hub) and `https://YOUR-DOMAIN.pages.dev/constellation/<game>/`.
