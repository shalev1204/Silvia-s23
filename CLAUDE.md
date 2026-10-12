# CLAUDE.md — Mandatory AI Onboarding & Project Rules

## 🚨 PROTOCOLO OBLIGATORIO DE INICIO DE SESIÓN

Al iniciar una nueva sesión en este repositorio, **TODO AGENTE DE CLAUDE CODE DEBE LEER Y CONSULTAR OBLIGATORIAMENTE** antes de realizar cualquier acción:

1. **[docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md](docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md)**:
   - **La Biblia Maestra Canónica (Versión 6.0)**: Fuente de verdad absoluta e inmutable.
   - Contiene el 100% de la historia cronológica (1970–2026), el registro íntegro de todos los correos enviados, las transcripciones literales completas de las 6 transmisiones de audio, las estaciones 01 a 09, la arquitectura del bloqueo de 48h del Hub Central por la tormenta de arena roja, la biblia criptográfica de *The Cipher Ledger* (deducciones algebraicas paso a paso) y el directorio de personajes y lugares.
   - **Invariante**: Queda terminantemente prohibido inventar o alterar nombres propios, lugares o derivas terminológicas (*"Sunken"*, *"Coastal"*, *"Coast"*, *"Hermit"*, *"Stage Mistress"*).
2. **[AGENTS.md](AGENTS.md)**:
   - Reglas y preferencias del proyecto (Capa 2).
3. **[docs/lore_and_puzzle_bible.md](docs/lore_and_puzzle_bible.md)**:
   - Biblia de diseño de puzzles y astronomía.
4. **[.agents/rules/user-preferences.md](.agents/rules/user-preferences.md)**:
   - Estándar estético renacentista ("currado", Da Vinci/Kepler) y cero colisiones texto-dibujo.

---

## Directrices de Desarrollo
- **Regla 9**: Cero valores numéricos iniciales precargados para Silvia en *The Cipher Ledger*.
- **Regla 10**: Uso exclusivo del alfabeto latino estándar ($A–Z$) en fórmulas y coordenadas celestes.
- **Git**: Regla R4 — No realizar `git commit` ni `git push` salvo orden textual explícita del Operador. **Excepción vigente (orden del Operador):** al terminar cada tarea, el agente hace commit y push automáticamente a la rama de trabajo de la sesión, sin pedir permiso. Solo se commitean los archivos tocados en esa tarea. Nunca PR, nunca force-push, nunca borrar ramas sin orden explícita.
