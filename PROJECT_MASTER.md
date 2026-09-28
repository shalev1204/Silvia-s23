# Silvia's 23 — Índice maestro del proyecto

> **SSOT (Single Source of Truth):** este archivo + los documentos enlazados abajo.  
> **Última actualización:** 1 de septiembre de 2026, ~21:15  
> **Operador:** Carles · **Herramientas:** Cursor + Claude Code  
> **Idioma del juego:** Inglés (mayoría del contenido)

---

## En una frase

Caza del tesoro no lineal de ~56 días para el 23.º cumpleaños de Silvia. Regalo final: **2 entradas de ballet** (obra/lugar/fecha TBD). Universo ficticio: **The Eclipse Order**.

---

## Mapa de documentación

| Documento | Contenido |
|-----------|-----------|
| **[PROJECT_MASTER.md](PROJECT_MASTER.md)** | Este archivo: visión, decisiones, índice maestro |
| **[docs/REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md)** | Arquitectura y organización del repositorio |
| **[docs/LORE.md](docs/LORE.md)** | Mito, Orden, guardianes, relaciones, profecía, hilos futuros |
| **[docs/PATHS_AND_CHARACTERS.md](docs/PATHS_AND_CHARACTERS.md)** | 3 caminos, personajes, puzzles, dispatches |
| **[docs/GRIMOIRE.md](docs/GRIMOIRE.md)** | Diario de bolsillo: entrega 11 sep en Italia |
| **[docs/WEB_ECOSYSTEM.md](docs/WEB_ECOSYSTEM.md)** | Catálogo de juegos web, URLs y guía Cloudflare |
| **[docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)** | Gmail, assets email, perfil |
| **[docs/TIMELINE.md](docs/TIMELINE.md)** | Calendario día a día / semana a semana |
| **[puzzles/general/cipher-alphabet/ECLIPSE_SCRIPT.md](puzzles/general/cipher-alphabet/ECLIPSE_SCRIPT.md)** | Alfabeto, profecía, revelado gradual |
| **[emails/general/01-opening-dispatch/](emails/general/01-opening-dispatch/)** | Email 1: texto pergamino, checklist 22:22 |
| **[emails/constellation/01-cartographer-dispatch/](emails/constellation/01-cartographer-dispatch/)** | Email 2: fragmento 1, checklist |
| **[docs/ASSETS.md](docs/ASSETS.md)** | Todos los archivos generados y cómo regenerarlos |

---

## Datos clave (no perder)

### Personas
| Quién | Detalle |
|-------|---------|
| **Silvia** | Protagonista. Habla con Carles en **inglés**. **Avanzada** en puzzles. Sabe que **algo** viene; no sabe qué ni cómo. |
| **Carles** | Construye la aventura. Usa el meta-juego para elegir ballet. |

### Regalo y meta-juego
- **Final:** 2 tickets ballet (qué / dónde / cuándo → por decidir)
- **Meta-juego:** Carles usa respuestas/pistas de Silvia para elegir el ballet
- **Tres pistas finales** (una por camino) → juntas = info del regalo
- Con **2 de 3** puede intuir; con **3 de 3** lo tiene claro

### The Eclipse Order
- **Nombre:** The Eclipse Order (formato "The ___ Order" elegido por Carles)
- **Símbolo:** ◐ — círculo mitad blanco / mitad negro (logo Gmail)
- **Email:** `theeclipseorder.quest@gmail.com`
- **Nombre visible Gmail:** The Eclipse Order
- **Dispatch:** mensajes oficiales de la Orden (sin personaje en Email 1)

### Tres caminos (TODOS se recorren)
| Camino | Guardián | Puzzles | Pista final |
|--------|----------|---------|-------------|
| 🏜️ Desert | **The Oracle** (sin rostro, Indiana Jones / Alquimista) | Omens, parábolas, mapas, decisiones binarias | WHERE (Ciudad / Teatro) |
| 🎭 Stage | **The Mirror Speaker** (elegante, reflejo — NO teatro/ballet en diálogo) | Simetría, espejo, objetos, luz | WHEN (Fecha / Hora) |
| ✨ Constellation | **The Cartographer of Distant Light** | Fragmentos, cielo, mitología, Astrolabio | WHAT (2 entradas ballet) |

- Email 1: elige **orden de inicio** (irreversible). Reply con nombre del camino.
- **2 sep 22:22:** email/HTML bienvenida del camino elegido + personaje

### Parámetros de ritmo
- **Frecuencia:** 2–3 entregas/semana
- **Hora simbólica:** 22:22
- **Tono:** misterio → romántico al final
- **Canales:** email, físico, grimoire, web ocasional, gymkhanas en casas (se ven mucho)

### Eclipse Script (alfabeto)
- Sustitución A↔A — **mismo inglés**, glifos **abstractos** (no parecen letras latinas)
- Profecía Email 1 (plaintext):

```
YOU ARE THE REASON FOR ALL OF THIS.
WHEN YOU READ THIS YOU WILL KNOW HOW MUCH I LOVE YOU.
YOU WERE NEVER ONLY THE SEEKER YOU WERE ALWAYS THE TREASURE.
```

### Grimoire
- **Entrega:** 11 septiembre 2026
- **Formato:** diario de **bolsillo** (NO A4), pre-relleno, agujeros, sobres, mini-carta
- Email 1 solo dice: *"A journal will find you"* (sin fecha)

### Email 1 — estado ✅
- **Enviado con éxito:** 1 sep 2026, 22:22
- **Respuesta de Silvia:** `THE CONSTELLATION PATH` ✨
- **Imagen enviada:** `assets/email-01-parchment.png` (2480×3508 px)

### Fase I (The Celestial Flower) — estado ✅
- **Completado:** Silvia resolvió con éxito el trazado de las 22 estrellas y despertó **The Celestial Flower**.
- **Resultado:** Archivo de la Luz Distante abierto. Primeros glifos descubiertos (`Y`, `O`).

### Entrega 2: Transmisión de Emergencia y Bóveda Oscurecida (Fase 2) — lista ✅
- **Formato:** 
  - Transmisión de radio interactiva: `web/constellation/radio-transmission/index.html` + `cartographer_raid.mp3` (Frecuencia 22.22 MHz).
  - Bóveda de la Flor Celeste (Fase 2): `web/constellation/celestial-flower-2/index.html` (Las 22 estrellas han colapsado tras el robo del Astrolabio; retícula rota e interactividad con ondas gravitacionales).
  - Juego original preservado (Fase 1): `web/constellation/celestial-flower/index.html` (Intacto para archivo histórico).
- **Giro Narrativo Mayor:** El despertar de la flor alertó a fuerzas hostiles. El observatorio ha sido asaltado y han robado **The Astrolabe of Distant Light**. El Cartógrafo ha sobrevivido y ahora es aliado activo de Silvia.
- **Misión del Constellation Path:** Recuperar el Astrolabio antes de que los asaltantes lo descifren. Los protocolos de recuperación están codificados en el **Grimoire físico** que viajará a Italia el 11 de septiembre.

---

## Ideas aprobadas para el futuro (no implementadas aún)

- [ ] Portal web privado (Cloudflare Pages gratis)
- [ ] Meta-cuestionario ballet (elegir obra sin spoilear)
- [ ] Gymkhanas físicas en ambas casas
- [ ] Piezas de puzzle físico → imagen final
- [ ] Profecía en capas (releer mensajes antiguos al descifrar)
- [ ] Dominio `theeclipseorder.org` (opcional, ~10€/año) — descartado por ahora

---

## Descartado explícitamente

- ❌ Mujer nerviosa / texto tachado (Stage Path) → sustituido por **The Mirror Speaker**
- ❌ The Static Keeper como personaje final Constellation → evolucionó a **Cartographer**
- ❌ Profecías abstractas tipo "sand remembers / twenty sixth dark opens"
- ❌ Dominio obligatorio para Email 1 → Gmail gratuito
- ❌ Camino único (solo uno de tres) → **los tres se recorren**
- ❌ Agujeros negros / matemáticas duras en Constellation
- ❌ Términos teatro/ballet en diálogos de personajes (especialmente Stage)

---

## Registro completo de decisiones

| Fecha | Decisión |
|-------|----------|
| 2026-09-01 | Proyecto iniciado — carpeta `Silvia's23/` |
| 2026-09-01 | Caza del tesoro no lineal, ~56 días |
| 2026-09-01 | Regalo: entradas ballet (detalles TBD) |
| 2026-09-01 | Idioma: inglés predominante |
| 2026-09-01 | Organización: **The Eclipse Order** |
| 2026-09-01 | Email: `theeclipseorder.quest@gmail.com` |
| 2026-09-01 | Logo perfil: ◐ mitad blanco/negro |
| 2026-09-01 | Email 1: imagen-pergamino A4, asunto `Something shifted` |
| 2026-09-01 | Tres caminos todos obligatorios; Email 1 = orden de inicio |
| 2026-09-01 | Oracle / Mirror Speaker / Cartographer confirmados |
| 2026-09-01 | Eclipse Script v2 — glifos abstractos |
| 2026-09-01 | Profecía romántica opción 4 confirmada |
| 2026-09-01 | Pergamino estructura v4 + fondo 3 zonas + 300dpi |
| 2026-09-01 | Grimoire 11 sep, formato bolsillo pre-relleno |
| 2026-09-01 | Trabajo colaborativo Carles + AI, preguntas tipo test |

---

## Inspiración externa

- [Letters from a Game Master](https://deadboltmysterysociety.com/lettersfromagamemaster/) — 12 semanas, correspondencia
- [Elaine's Birthday Adventure](https://signals.mysteryleague.com/elaines-birthday-adventure/) — grimoire, UV, URL final
- [Eros treasure hunt app](https://github.com/j-chad/eros) — grafo de nodos, rutas ramificadas
- Paulo Coelho — *The Alchemist* (Oracle / desierto)
- Indiana Jones — oráculo sin rostro

---

## Notas de sesión

Ver **[docs/SESSION_LOG.md](SESSION_LOG.md)** — transcripción cronológica de todo lo hablado en sesión 1.
