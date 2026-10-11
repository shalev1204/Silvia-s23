# AGENTS.md — Reglas y Preferencias del Proyecto Silvia's 23

Este repositorio contiene el diario manuscrito, puzzles y ecosistema narrativo para el cumpleaños de Silvia.

---

## 🚨 PROTOCOLO OBLIGATORIO DE INICIO DE SESIÓN PARA CUALQUIER AGENTE (MANDATORY ONBOARDING)

Al iniciar una nueva sesión en este repositorio, **TODO AGENTE DE IA (Cursor, Claude Code, Antigravity o cualquier LLM asistente) TIENE LA OBLIGACIÓN ESTRICTA DE LEER Y CONSULTAR** los siguientes documentos antes de planificar, responder o realizar cualquier modificación de código o texto:

1. **[docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md](docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md)**:
   - **La Biblia Maestra Canónica (Versión 6.0)**: Fuente de verdad absoluta e inmutable.
   - Contiene el 100% de la historia cronológica (1970 a la fecha), el registro íntegro de todos los correos enviados, las transcripciones literales (palabra por palabra con marcas de tiempo) de las 6 transmisiones de audio, el desglose de las estaciones 01 a 09, la arquitectura completa del bloqueo de 48h del Hub Central por la gran tormenta de arena, la biblia criptográfica de *The Cipher Ledger* (deducciones algebraicas paso a paso) y el directorio de personajes y lugares.
   - **Invariante**: Queda terminantemente prohibido inventar o alterar nombres propios, lugares o derivas terminológicas (*"Sunken"*, *"Coastal"*, *"Coast"*, *"Hermit"*, *"Stage Mistress"*).
2. **[docs/lore_and_puzzle_bible.md](docs/lore_and_puzzle_bible.md)**:
   - Biblia de diseño de puzzles, astronomía y lore del ecosistema.
3. **[.agents/rules/user-preferences.md](.agents/rules/user-preferences.md)**:
   - Estándar estético renacentista ("currado", Da Vinci/Kepler/Dürer), márgenes obligatorios de troquelado A5 ($X < 165$ px en Cara A y $X > 1583$ px en Cara B), espaciados mínimos y cero colisiones texto-dibujo.
4. **[docs/DESERT_ODYSSEY_BIBLE.md](docs/DESERT_ODYSSEY_BIBLE.md)**:
   - Especificaciones para la continuidad de las Estaciones 10 a 19 (The Desert Path), con la tabla Estación ↔ Juego ↔ Hoja.

---

## Reglas de Trabajo del Operador (Capa 2)

Al generar páginas del diario manuscrito (`scripts/journal/`):
1. **Títulos**: Claros y sin florituras redundantes (ej. *"The Astrolabe"*, no *"The Astrolabe of Distant Light"*).
2. **Estética Renacentista**: Dibujos siempre detallados, trabajados ("currado") y elegantes estilo Da Vinci / Kepler. Quedan prohibidos los esquemas rudimentarios o dibujos tipo palo/geometría básica.
3. **Cero Colisiones**: Verificación obligatoria de que ninguna línea de dibujo toque el texto manuscrito. Margen mínimo de seguridad entre texto e imágenes (mínimo 40–80 px).
4. **Troquelado A5**: 0 píxeles en $X < 165$ px (Cara A) y $X > 1583$ px (Cara B).
5. **Tipografía Grande**: Legible en papel real A5 (títulos 62–66 px, cuerpo 35–38 px, notas 28–33 px).
6. **Vocabulario ("SIMPLIFICAMOS EL VOCABULARIO")**: Inglés directo, accesible y evocador. Prohibidos los tecnicismos astronómicos oscuros, rebuscados o incomprensibles. Silvia debe entender todo con claridad.
7. **Agencia de Silvia (Protagonista)**: Silvia resuelve y juega; el Cartógrafo es solo un narrador atmosférico y guía secundario. El Cartógrafo NUNCA hace el trabajo ni resuelve los acertijos por ella.
8. **Canon de las Tres Torres & Astrolabio**: El Astrolabio físico fue robado (no más juegos tipo Celestial Flower directa por ahora). Solo descifra nativamente 6 estrellas maestras; el resto se apoya en los juegos del diario para simular alineaciones. Al completar todo, el Astrolabio alineará las 3 Antiguas Torres (Tower I: The Alpine Observatory, Tower II: The Sandstone Sanctuary, Tower III: The Stage Tower) para desvelar el 4º lugar secreto final (The Vault of the Grand Eclipse).
9. **Cero Datos Numéricos Iniciales (Cripto-Aritmética Sin Spoilers)**: Silvia comienza con CERO valores numéricos asignados a las letras. Queda prohibido pre-rellenar o mostrar en interfaces datos como $P = 21$ o $B = 17$; Silvia debe deducir el valor de cada letra por sí misma utilizando su Cuaderno de Cifrado (*The Cipher Ledger*) y las pistas del diario.
10. **Uso Exclusivo del Alfabeto Normal en Juegos y Coordenadas**: En todas las interfaces web, fórmulas de coordenadas celestes (Latitude, Longitude, Differential), pizarras de recompensa y pistas cripto-aritméticas, se deben utilizar SIEMPRE las letras estándar de nuestro alfabeto latino ($K, G, A, O, B, P, E, V, F, T$, etc.), NUNCA glifos o símbolos crípticos extraños. El Cuaderno de Cifrado (*The Cipher Ledger*) y todos los juegos deben compartir de forma uniforme esta notación clara para que Silvia deduzca y opere sin ambigüedades.

Consulte siempre la biblia maestra en [CANONICAL_LORE_AND_VOCABULARY_AUDIT.md](docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md) y la guía de diseño en [user-preferences.md](.agents/rules/user-preferences.md).
