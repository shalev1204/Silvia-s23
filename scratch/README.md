# Scratch & Herramientas Auxiliares · The Eclipse Order

Esta carpeta está reservada exclusivamente para **scripts auxiliares, verificaciones de trabajo, pruebas matemáticas y prototipos experimentales**.

---

## 🚨 Reglas de Organización de Scratch

1. **PROHIBIDO colocar scripts de prueba o archivos temporales en la raíz del repositorio**:
   - Todo script experimental (`test_*.py`, `debug_*.py`, `preview_*.py`), boceto o render intermedio debe crearse en los subdirectorios correspondientes de `scratch/` o en carpetas de sesión temporal (`brain/`), **NUNCA en la raíz** ni suelto en `scripts/journal/`.
2. **Criterio de permanencia**:
   - Una vez que la funcionalidad probada en un script de `scratch/` es incorporada a los módulos oficiales (`scripts/journal/`, `web/`, etc.), el archivo de prueba puede eliminarse o mantenerse aquí documentado sin ensuciar el pipeline principal.

---

## Estructura de Subdirectorios

### 1. `scratch/maps/`
Ajustes paramétricos de curvas SVG, senderos serpentinos, mapas de ascenso y geometría procedural:
- `build_perfect_ascending_map.py`, `compute_path_details.py`, `design_meandering_path.py`
- `preview_curve*.html`, `preview_curve_v3.py`, `preview_serpentine_curve*.py`
- `test_generate_smooth_map.py`, `tune_serpentine_nodes*.py`, `update_svg_v*.py`

### 2. `scratch/hub_tests/`
Pruebas de integración, talleres de juego, lógica de desbloqueo, tormenta de arena y borradores de vista:
- `test_full_game9_to_storm_flow.py`, `test_sandstorm_lockout.py`: Verificación de la transición a la tormenta roja de 48h.
- `test_cliffside_workshop.py`, `test_cipher_password_gate.py`, `test_chapter_tabs.py`: Pruebas de componentes de la UI del Hub.
- `test_all_immersive_proposals.py`, `test_novel_fullscreen_and_scroll.py`, `test_workshop_enhancements.py`, etc.
- `hub_dawn_drafts/`: Borradores de estilos y lógica para la interfaz de amanecer en el Hub.

### 3. `scratch/verifications/`
Scripts de verificación criptográfica, análisis léxico y comprobaciones algorítmicas de puzles:
- `chasm_maze_data.json`, `find_10_words.py`, `verify_all_requirements.py`
- `verify_chasm.py`, `verify_desert_incognitas.py`, `verify_lexicon.py`

### 4. `scratch/utils/`
Utilidades auxiliares de depuración y captura visual puntual:
- `capture_seal.py`: Utilidad de captura rápida de sellos.
- `debug_page.py`: Inspección de maquetación y parámetros de página.
- `screenshot_chronicles.py`: Automatización de captura visual de crónicas.
