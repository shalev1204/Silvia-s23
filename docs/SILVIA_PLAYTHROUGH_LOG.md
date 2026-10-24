# Registro de partida de Silvia — respuestas, estadísticas y personalidad

> Para el final del juego (cartas, epílogo, Oráculo, regalo) y para escribir a Hermes y a Aurelia a su medida.
> Fuente: guardado en la nube (Supabase, proyecto `aoochekcbugawaurllco`, seeker `silvia`, tablas `eclipse_saves` y `eclipse_events`) y lo que el Operador contó cuando el dispositivo no sincronizaba.
> Horas en CEST (UTC+2). Los índices (0, 1, 2) son la posición de la respuesta en el código; entre paréntesis, la letra que ve Silvia (A, B, C).
> Cuando avance, añadir una fila por estación o respuesta, y la lectura de personalidad si cambia.

---

## 1. Línea de tiempo

| Fecha y hora | Momento | Fuente |
|---|---|---|
| 1-9-2026, 22:22 | Email 1: entra en The Eclipse Order | Session Log |
| ≤ 22-10 | Constellation Path completo: Cipher, Midnight, Zodiac, Matrix, Flower (`order_*_completed`) | Supabase |
| ≤ 22-10 | Tormenta de arena y Field Wire (4 respuestas, ver §2) | Supabase |
| 22-10 | Amanecer en el desierto (2 respuestas) y Cairn I en 16 movimientos | Operador |
| 22-10, 18:00 | Empieza la marcha de 26 h hacia el North Portal | Operador (sembrado) |
| 24-10, 12:29 | Abre el Field Wire en el North Portal | Supabase |
| 24-10, 12:34 | Responde a Hermes en el North Portal | Supabase |
| 24-10, 12:35–12:51 | Whispering Chasm (con la página del diario como mapa a la vez) | Supabase |
| 24-10, 12:51:46 | Hermes sale por la Oasis Gate: Chasm completado | Supabase |
| 24-10, 12:58 | Responde a Hermes en la Oasis Gate; empieza la noche de 10 h | Supabase |
| 24-10, 21:58 | Primera luz sobre la sal: se abre la Salt Playa | Calculado |

---

## 2. Todas sus respuestas a Hermes

### La tormenta · Field Wire (`order_field_wire_choices` = `[2,0,1,0]`)
| Paso | Eligió | Texto |
|---|---|---|
| 0 · Primer contacto | 2 (C) | «Loud and clear. I solved your celestial cipher at the cliff. The storm won't stop us—what is your situation?» |
| 1 · Cómo llamarlo | 0 (A) | «Hermes — We are companions in this desert, not strangers. Call me Silvia, and I will call you Hermes.» |
| 2 · Refugio | 1 (B) | «Section III: The Three Cairns & The Copper Benchmark. Keep to the wash bed you surveyed in 1998…» |
| 3 · Rumbo | 0 (A) | «…the benchmark plate points 112° East toward Outer Watchtower VI.» (la respuesta exacta) |

### El amanecer · Dawn (`order_dawn_choices` = `[1,1]`)
| Paso | Eligió | Texto |
|---|---|---|
| 0 · The Great Silence | 1 (B) | «Law 1 on the page “The Desert”, the Meridian Shadow: wait for noon and read true north from the shortest shadow.» |
| 1 · The Dry River | 1 (B) | «Go take a look, Hermes, but leave a chalk mark every hundred paces. If it's nothing or looks dangerous, do not touch anything and turn back.» |

### El cañón · Chasm Wire (`order_chasm_wire` = `reply0: 2, reply1: 1`)
| Paso | Eligió | Texto |
|---|---|---|
| North Portal · Before the Descent | 2 (C) 👂 | «What are the voices saying, Hermes? Are they warning us?» |
| Oasis Gate · Dusk | 1 (B) 🐫 | «Those tracks worry me too. No fire tonight, and keep the Seal of Cairn I well hidden.» |
| First Light · The North Edge (`reply2`) | *pendiente* | 🧭 rigurosa (empezar donde dice la página, cumplir la Ley) · 🤝 cuidadosa (despacio, volver si cruje) · 🔭 curiosa (mirar primero el trípode de la Orden) |
| The South Shore · Mid-morning (`reply3`) | *pendiente* | ⚖️ probar ya la balanza en el Ledger · 💧 que Hermes beba primero · 🐫 esconder la balanza y vigilar las dunas |

> Para leer su partida de la Salt Playa en Supabase: `order_playa_walk` (`fails`, `sinks`, `cracks`, `heavy`, `light`, `mirage` — 1 = lo tiene delante, 2 = lo vio y lo esquivó, 3 = lo pisó —, `min`, `water`), `order_hint_s11-playa_level` y `order_playa_howto`.

---

## 3. Estadísticas de juego

| Juego | Resultado |
|---|---|
| **Cairn I** (Wash River) | 16 movimientos (óptimo: 15). Sello de Cairn I en la faltriquera. |
| **Whispering Chasm** | MIRAGE (6/6 runas). ~17 min de juego activo (`order_hint_s10-chasm_secs` = 1010 s) entre las 12:35 y las 12:51. 276 pasos, 17 cruces, **2 giros equivocados** (12:39 y 12:40, los dos al principio), 1 susurro escuchado, pista de nivel 1 (12:44), terminó con 2,75 odres de 3. Al salir, el reloj del cañón marcaba las 12:14 (`min` = 734). Leyó el How to play al entrar. Jugó con la página «The Whispering Chasm» delante como mapa, a la vez que la web. |
| **Cipher Ledger** | En su Ledger web solo ha escrito O = 23 y A = 7. Seguramente lleva el resto en papel. |

---

## 4. Lectura de personalidad (para escribirle el final)

- **Rigurosa y segura.** Su primera palabra a Hermes fue presumir, con razón, de haber resuelto el cifrado. Eligió el rumbo exacto (112°), la ley científica (la Sombra Meridiana) y el refugio documentado (el benchmark de 1998). Va a lo que dicen los datos.
- **Cálida e igualitaria.** Le ofreció tutearse: «companions, not strangers». Para ella, Hermes es un compañero, no un personaje al que servir.
- **Curiosa con red.** No descarta la corazonada de Hermes ni se lanza a ciegas: «ve a mirar, pero deja una marca de tiza cada cien pasos». Explora con método.
- **Le atrae el misterio por sí mismo.** A las puertas del cañón no preguntó por la ruta, sino por las voces: «Are they warning us?». Le interesan la atmósfera y el sentido oculto.
- **Protectora.** En la Oasis Gate su instinto fue cuidar a Hermes y el sello: «No fire tonight». Ve las amenazas (las huellas de los saqueadores) y actúa en consecuencia.
- **Rápida y fina.** Casi óptima en Cairn I y apenas dos errores en el Chasm, ambos al principio, mientras aprendía a orientar el mapa. Después, nada más.

**Cómo usarlo**:
- Darle misterios que escuchar y descifrar, como voces, inscripciones y la voz del Architect.
- Dejar que cuide de Hermes en momentos con peso emocional.
- Reconocer su precisión cuando acierte a la primera.
- En el final, Hermes puede recordarle, con sus propias palabras, «companions, not strangers», la tiza cada cien pasos y «no fire tonight».
