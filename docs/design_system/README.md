# The Eclipse Order — Design System & Creation Bible

Este directorio contiene las guías maestras, especificaciones técnicas, pautas de arte, tono y plantillas ejecutables para la creación de futuras páginas del diario manuscrito, puzzles y módulos web de la experiencia de Silvia.

---

## 🧭 Índice de Guías Especializadas

1. **[01_JOURNAL_STYLE_AND_ART_GUIDE.md](./01_JOURNAL_STYLE_AND_ART_GUIDE.md)**
   - Estándar estético renacentista (Da Vinci / Kepler / Escher / Piranesi / Serlio).
   - Especificaciones para el **Stage Path (Fase 3)**: tramoya teatral barroca, óptica veneciana y perspectiva escénica.
   - Especificaciones milimétricas para papel físico A5 (1748 × 2480 px @ 300 DPI).
   - Invariantes de troquelado (Cara A: $X < 165$ px = 0; Cara B: $X > 1583$ px = 0).
   - Buffer anti-colisión texto–dibujo (mínimo 40–80 px).
   - Tipografía manuscrita, jerarquías de escala y pautado renacentista.
   - Pipeline de producción: bocetos IA → AlphaEngine → PageComposer → PDF 1:1 + Mockup.

2. **[02_WEB_GAMES_AND_HUB_GUIDE.md](./02_WEB_GAMES_AND_HUB_GUIDE.md)**
   - Sistema de diseño web: estética dark mode celestial, marcos de latón (*brass frames*), glassmorphism.
   - Tokens de diseño: paleta de colores HSL/Hex, tipografías editoriales (`Cinzel`, `Newsreader`, `JetBrains Mono`).
   - Micro-animaciones, interacción táctil/escritorio y Web Audio API procedural.
   - Integración con el Universal Navigator, el Order Codex y persistencia de progreso (`localStorage`).
   - Estructura de un puzzle web: modal introductorio, área de manipulación, resolución y pizarra de recompensa.

3. **[03_VOICE_TONE_AND_LORE_GUIDE.md](./03_VOICE_TONE_AND_LORE_GUIDE.md)**
   - Tono, personalidad y voces: El Cartógrafo, The Oracle, The Mirror Speaker, Hermes.
   - Regla inquebrantable de la Agencia de Silvia: Silvia es la heroína que resuelve; el Cartógrafo es un cronista y guía secundario.
   - La tríada de revelaciones del misterio: **WHEN** (Hoja 18) → **WHERE** (Stage Path) → **WHAT** (Constellation Path / Bóveda final).
   - Vocabulario y glosario canónico ("SIMPLIFICAMOS EL VOCABULARIO").
   - Reglas criptográficas: uso exclusivo de letras latinas ($K, G, A, O...$) y cero valores numéricos revelados de inicio.

---

## 🛠️ Plantillas de Código Ejecutables (Boilerplates)

Para arrancar un nuevo elemento sin empezar desde cero, use las plantillas listas para duplicar:

- **Diario Manuscrito**: `scripts/journal/templates/template_new_sheet.py`
  - Script en Python con verificación estricta de troquelado, composición fotorrealista sobre papel real y exportación de PDF vectorial A5 y JPG mockup.
- **Juegos Web del Hub**: `web/templates/game_boilerplate/`
  - `index.html`: Estructura semántica con marcos de latón y modales atmosféricos.
  - `styles.css`: Estilos visuales listos con el sistema de tokens del Hub.
  - `game.js`: Lógica de juego con Web Audio sintético, persistencia y eventos del Hub.
