# Guía de Voz, Tono, Personalidad y Lore Canónico

Esta guía establece las directrices narrativas, la construcción de personajes, las reglas de vocabulario y los principios criptográficos que rigen todas las comunicaciones, páginas del diario y juegos del ecosistema de Silvia.

---

## 1. La Regla de Oro: La Agencia de Silvia como Heroína Activa

> [!IMPORTANT]
> **Silvia resuelve, Silvia juega.** Silvia es la protagonista intelectual indiscutible de toda la odisea.
> - El Cartógrafo **NUNCA** resuelve un acertijo por ella.
> - El Cartógrafo **NUNCA** le entrega respuestas terminadas o deducciones cerradas.
> - Los personajes secundarios (The Oracle, The Mirror Speaker) son guardianes de portales que la desafían y reconocen su valía; no son salvadores ni tutores condescendientes.
> - Toda victoria, coordenada descifrada y deducción algebraica debe pertenecerle legítimamente a Silvia.

---

## 2. Personalidad y Voces de los Personajes

### 2.1. El Cartógrafo (The Cartographer)
- **Arquetipo**: El erudito fugitivo, leal custodio del conocimiento astronómico, exhausto físicamente pero con una mente brillante y perseverante.
- **Tono**:
  - Íntimo, reflexivo, poético pero con los pies en la tierra.
  - Siente una profunda admiración y respeto por la agudeza mental de Silvia.
  - Se expresa con una calidez solemne: no es ni un profesor severo ni un narrador cómico. Sus cartas transmiten la fatiga del exilio, el polvo en la garganta y la esperanza en las estrellas.
- **Frase modelo**:
  > *"The wind carries away the dust of our path, Silvia, but the stars hold their ground. Take your astrolabe in hand; the sky will answer only to those who dare to measure it."*

### 2.2. The Oracle (Guardián del Desierto — Torre II)
- **Arquetipo**: El centinela atemporal de las dunas rojas y del Santuario de Arenisca.
- **Tono**:
  - Severo, seco, enigmático y parco en palabras.
  - No habla por hablar: cada frase es una sentencia sobre el tiempo, la paciencia y los estratos geológicos.
- **Frase modelo**:
  > *"The sand forgets all footprints before twilight. Only that which is carved into stone survives the scouring winds. Prove your sight, wanderer."*

### 2.3. The Mirror Speaker (La Voz del Escenario — Torre III / Stage Path)
- **Arquetipo**: El maestro de la perspectiva, la acústica teatral y las ilusiones ópticas.
- **Tono**:
  - Teatral, elegante, perspicaz y sutilmente irónico.
  - Habla en términos de telones, reflejos, ecos y máscaras, empujando a Silvia a mirar detrás de las apariencias.
- **Frase modelo**:
  > *"Every mirror tells two stories: the face that peers into the glass, and the depth waiting behind the silver. Do not trust what is illuminated; look for where the shadow turns."*

### 2.4. Hermes (El Halcón Mensajero)
- **Arquetipo**: El mensajero silencioso, vínculo vital entre las cumbres alpinas y el desierto.
- **Tratamiento**:
  - Hermes no habla. Es un animal herido en el asalto a la Torre I, leal y resistente, que transporta cilindros de cuero y plumas codificadas. Su presencia aporta fragilidad y urgencia a la narrativa.

---

## 3. La Tríada Canónica de Revelaciones

La narrativa de la búsqueda sigue una arquitectura de revelación en tres actos coordinados:

| Acto | Revelación Clave | Ubicación Canónica | Estado y Significado |
| :---: | :---: | :---: | :--- |
| **I** | **EL "WHEN"** (Cuándo) | **Hoja 18 (Cara A/B)** | **Ya entregado**. Reveló la fecha astronómica del encuentro: el solsticio y la conjunción del Gran Eclipse. |
| **II** | **EL "WHERE"** (Dónde) | **The Stage Path (Torre III)** | **En curso**. Desvelará las coordenadas geográficas exactas de convergencia y la ubicación del tercer santuario. |
| **III** | **EL "WHAT"** (Qué) | **Constellation Path Final** | **Clímax Absoluto**. La Bóveda del Gran Eclipse desvelará el regalo físico real: **las 2 entradas de ballet** para Silvia y Carles. |

---

## 4. Política de Vocabulario: "SIMPLIFICAMOS EL VOCABULARIO"

Para que Silvia disfrute de la lectura sin frustraciones ni barreras lingüísticas, se aplica una política estricta de simplificación léxica en inglés:

### 4.1. Términos Terminantemente Prohibidos (Invariantes Canónicos)
Queda terminantemente prohibido utilizar los siguientes términos erróneos o no canónicos (auditados en `scripts/audit/lint_lore_and_vocabulary.py`):
- ❌ `Sunken`
- ❌ `Coastal` / `Coast`
- ❌ `Hermit`
- ❌ `Stage Mistress`

### 4.2. Glosario de Reemplazos Accesibles
| Tecnicismo Complejo (Evitar) | Término Canónico Accesible (Usar) |
| :--- | :--- |
| *Azimuth* | **`bearing`**, **`heading`**, **`direction`** |
| *Cipher* / *Cryptogram* | **`code`**, **`alphabet`**, **`symbol`** |
| *Mucro* / *Mucrones* | **`pointer`**, **`marker`**, **`star tip`** |
| *Tympan* / *Tympanum* | **`face`**, **`plate`** |
| *Rete* (aislado) | **`star rete`**, **`star web`** |
| *Alidade* (aislado) | **`sight rule`**, **`sighting arm`** |
| *Volvelle* | **`rotating wheel`**, **`paper disc`** |

---

## 5. Reglas Criptográficas y Notación Uniforme

### 5.1. Uso Exclusivo del Alfabeto Latino Normal
En todas las interfaces digitales, acertijos manuscritos, tablas de coordenadas astronómicas y pizarras de solución:
- **SIEMPRE** se utilizan letras estándar del alfabeto latino ($K, G, A, O, B, P, E, V, F, T$, etc.).
- **NUNCA** se muestran glifos crípticos ininteligibles o caracteres extraños que impidan a Silvia leer y operar con soltura.

### 5.2. Cero Valores Numéricos Iniciales (Cripto-Aritmética Sin Spoilers)
- Silvia inicia la aventura con **CERO valores numéricos pre-asignados**.
- Queda prohibido mostrar valores pre-rellenados como $P = 21$ o $B = 17$ en interfaces web o pistas del diario.
- Silvia debe deducir cada valor por sí misma mediante su cuaderno de deducción (*The Cipher Ledger*), encontrando igualdades y relaciones algebraicas a través de las pistas descubiertas en cada estación.
