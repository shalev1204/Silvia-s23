# Guía de Diseño y Creación de Juegos Web y Hub Central

Esta guía define las directrices arquitectónicas, estéticas y de interacción para cualquier puzzle interactivo, estación o vista web desarrollada dentro del ecosistema digital de Silvia (*The Eclipse Order*).

---

## 1. Filosofía Estética Web: El Observatorio Digital

La experiencia web transporta a Silvia a los archivos interactivos de la Orden del Eclipse. No es una web corporativa ni un juego de arcade convencional; es un **artefacto astronómico interactivo** caracterizado por:
- **Atmósfera Nocturna y Solemne (Dark Mode Astronómico)**: Fondos oscuros de azul profundo casi negro (`#070b12`), con nebulosas y estrellas de bajo contraste que permiten concentrarse en los mecanismos.
- **Marcos de Latón y Cristal Ahumado (Glassmorphism & Brass Frames)**: Paneles con fondos semitransparentes (`rgba(13, 20, 32, 0.85)`), desenfoque de fondo (*backdrop-filter: blur(12px)*), bordes dorados tenues y esquinas decoradas con biseles ornamentales de latón antiguo.
- **Sensación Táctil Mecánica**: Los botones, diales, conmutadores y cursores emulan instrumentos de latón del siglo XVII y XVIII combinados con resonancias lumínicas celestes.

---

## 2. Tokens de Diseño y Paleta Canónica

Todo juego web debe utilizar de forma consistente las siguientes variables CSS globales definidas en el sistema:

### 2.1. Paleta de Colores
```css
:root {
  /* Tonos Dorados de la Orden (Latón y Sol) */
  --order-gold: #e5b967;
  --order-gold-bright: #ffd885;
  --order-gold-dim: rgba(229, 185, 103, 0.4);
  --order-gold-glow: rgba(229, 185, 103, 0.18);

  /* Acento Celeste y de Vacío (Cian / Esmeralda Místico) */
  --order-cyan: #4fe3c1;
  --order-cyan-glow: rgba(79, 227, 193, 0.25);

  /* Fondos y Sombras de Profundidad */
  --order-bg: #070b12;
  --order-bg-card: rgba(13, 20, 32, 0.88);
  --order-bg-elevated: rgba(18, 28, 44, 0.95);
  --order-border: rgba(197, 155, 76, 0.35);
  --order-border-subtle: rgba(229, 185, 103, 0.15);

  /* Pergamino y Tipografía */
  --order-parchment: #f4ece0;
  --order-parchment-dim: #9aa8be;
  --order-parchment-faint: rgba(244, 236, 224, 0.45);

  /* Alertas y Bloqueo de Tormenta */
  --order-crimson: #d14949;
  --order-amber: #e69538;
}
```

### 2.2. Tipografías Canónicas (Google Fonts)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=JetBrains+Mono:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

| Rol Tipográfico | Familia de Fuente | Pesos | Uso |
| :--- | :--- | :--- | :--- |
| **Titulares Emblemáticos** | `'Cinzel Decorative', cursive` | 700 | Título del juego, sellos, nombres de estaciones. |
| **Títulos y Botones** | `'Cinzel', serif` | 600, 700 | Encabezados de tarjetas, etiquetas de control, menús. |
| **Narrativa y Lectura** | `'Newsreader', serif` o `'Lora'`| 400, 500, Italic | Prólogos, cartas del Cartógrafo, instrucciones. |
| **Criptografía y Coordenadas** | `'JetBrains Mono', monospace` | 500, 700 | Coordenadas celestes, valores deducidos, celdas de cifrado. |

---

## 3. Arquitectura Estándar de un Juego Web

Todo juego en `web/` debe seguir una estructura de 4 fases para garantizar una experiencia inmersiva:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MODAL DE BIENVENIDA / ENIGMA                             │
│    - Contexto narrativo del Cartógrafo (1-2 párrafos breves)│
│    - Instrucciones claras ("SIMPLIFICAMOS EL VOCABULARIO")  │
│    - Botón de apertura: "EXAMINAR MECANISMO"                │
├─────────────────────────────────────────────────────────────┤
│ 2. CABECERA Y UNIVERSAL NAVIGATOR                           │
│    - Botón de retorno al Hub Central (esquina superior izq) │
│    - Indicador de Estación (ej. "ESTACIÓN 14 · THE FIVE CAIRNS")│
│    - Botón de pista o cuaderno si Silvia se atasca          │
├─────────────────────────────────────────────────────────────┤
│ 3. ÁREA DE INTERACCIÓN CENTRAL                              │
│    - Mecanismo interactivo (rueda, dial, matriz, tablero)   │
│    - Feedback háptico y sonoro en cada interacción          │
│    - Entrada de datos mediante alfabeto latino ($A..Z$)     │
├─────────────────────────────────────────────────────────────┤
│ 4. PIZARRA DE VICTORIA Y REVELACIÓN                         │
│    - Efecto de iluminación dorada y sonido armónico         │
│    - Pizarra con Coordenadas Obtenidas ($LAT / LONG$)       │
│    - Registro automático en localStorage                    │
│    - Botón: "CONTINUAR LA EXPEDICIÓN"                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Principios de Interacción y Sonido Procedural

### 4.1. Animaciones y Micro-Interacciones
- **Transiciones fluidas**: Los estados de `hover` y `active` deben utilizar transiciones suaves (`transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Brillo Celestes**: Los elementos interactivos ganan un sutil resplandor dorado (`box-shadow: 0 0 20px var(--order-gold-glow)`) al interactuar con ellos.
- **Animaciones CSS Ligeras**: Giros continuos de aros astrolábicos a baja velocidad (30s–60s por vuelta) para dar vida a la pantalla sin saturar la CPU.

### 4.2. Audio Procedural Sintético (Web Audio API)
Para evitar la carga de archivos pesados y asegurar compatibilidad instantánea en cualquier navegador móvil o de escritorio, los juegos utilizan **síntesis de sonido procedural** con osciladores de Web Audio:
- **Clic Mecánico**: Impulso corto de ruido blanco filtrado con filtro paso-banda (duración 15ms) simulando un engranaje de latón.
- **Tono Resonante de Selección**: Onda sinusoidal suave a 440–550 Hz con caída exponencial rápida (duración 80ms).
- **Campana / Armónico de Victoria**: Acorde celestial de frecuencias justas (ej. $528\text{ Hz}$, $660\text{ Hz}$, $792\text{ Hz}$) con reverb y decaimiento de 1.8 segundos.

---

## 5. Integración con el Universal Navigator y Persistencia

### 5.1. Enlaces Compartidos
Todo juego debe incluir en el `<head>` y en el `<body>`:
```html
<link rel="stylesheet" href="../../shared/navigator.css">
<!-- ... antes de cerrar el body: ... -->
<script src="../../shared/navigator.js"></script>
```

### 5.2. Persistencia en `localStorage`
Para que el progreso de Silvia se refleje en el Hub Central y en el *Order Codex*, el juego debe guardar su estado con el formato estándar:
```javascript
function saveStationCompletion(stationId, solutionData) {
  const progressKey = `silvia_station_${stationId}_completed`;
  const dataKey = `silvia_station_${stationId}_data`;
  
  localStorage.setItem(progressKey, "true");
  localStorage.setItem(dataKey, JSON.stringify({
    timestamp: new Date().toISOString(),
    solvedLetter: solutionData.letter,
    coordinates: solutionData.coordinates
  }));

  // Notificar al sistema global si está incrustado
  window.dispatchEvent(new CustomEvent('stationSolved', { 
    detail: { stationId, solutionData } 
  }));
}
```

---

## 6. Checklist de Calidad para un Nuevo Juego Web
- [ ] ¿Los textos en inglés utilizan vocabulario directo y comprensible?
- [ ] ¿El diseño es 100% responsivo en iPhone, iPad y pantallas grandes?
- [ ] ¿Las coordenadas y pistas usan letras latinas estándar ($K, G, A, O...$), nunca símbolos incomprensibles?
- [ ] ¿Los botones e interactivos tienen estados de `:focus` y `:hover` claros?
- [ ] ¿El botón de retorno al Hub funciona sin recargas fallidas?
- [ ] ¿Se emiten sonidos al interactuar y al ganar?
