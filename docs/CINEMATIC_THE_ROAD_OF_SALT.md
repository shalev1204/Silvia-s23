# Cinemática «The Road of Salt» (2:40) · guion y prompts para Google AI Studio (Veo)

Documento de producción (24-10-2026). La cinemática resume en 2 min 40 s el tramo del desierto desde la tormenta hasta las Nomad Ruins. Se verá en el juego **mientras Hermes camina las tres horas por las dunas** hacia la Estación 12. El texto que aparece en pantalla y los prompts están en inglés, porque el Hub es solo en inglés.

Todo lo que se ve está en la Biblia Canónica: Hermes, la tormenta roja, Cairn I, la Whispering Chasm, la Oasis Gate, MIRAGE, la Salt Playa, el poste de la Orden con CRYSTAL, el Great Salt Sump, el mojón con la balanza, los jinetes del borde y Camp VII con las tres estelas y Al-Qibla. **No sale Aurelia.** Tampoco se nombra a los BC Ashes: su nombre se descubre después, en el debrief de la Estación 12. No se inventa ningún nombre propio.

---

## 1. Cómo producirla en AI Studio

1. **Modelo.** Veo (la versión más reciente disponible en AI Studio), en modo *image-to-video* siempre que se pueda. Cada clip dura 8 s, en 16:9 y 1080p si está disponible (720p como mínimo). Active el audio generado solo en los planos marcados con 🔊. El resto se monta con la música propia.
2. **Coherencia visual.** Adjunte como imagen de referencia una captura del juego del mismo lugar. En el apartado 5 se indica cuál sirve para cada plano. Repita siempre el bloque **STYLE** y el bloque **HERMES** al principio del prompt. Si un plano sale con otro estilo (fotorrealista, anime), vuelva a generarlo; no lo corrija en el montaje.
3. **Varias tomas por plano.** Genere de 2 a 4 versiones de cada plano y quédese con la mejor. Descarte cualquier toma con texto incrustado, logotipos o manos deformes.
4. **Montaje** (CapCut, DaVinci Resolve o iMovie):
   - Siga el orden de la tabla y recorte cada clip a la duración indicada (casi todos se usan entre 5 y 7 s).
   - Las transiciones van por corte seco. Use fundido solo donde la tabla lo indique.
   - Los rótulos en inglés de la columna «On-screen» van en la tipografía Cinzel, en color crema #fde68a con una sombra suave.
   - Música: un único tema de unos 160 s que crece por fases. Empieza con percusión baja (la tormenta), sigue con laúd y cuerdas (el cañón), pasa a un pad brillante con campanillas (la sal), se tensa con un ostinato (el Sump y los jinetes) y acaba en un silencio largo con una sola nota (Al-Qibla). Use música libre de derechos (por ejemplo, la biblioteca de YouTube Audio Library) o encárguela.
5. **Exportación para el juego.**
   - Formato: MP4 H.264, 1920×1080 a 24 fps, con un bitrate de 4–5 Mbps. Con eso pesa unos 80–100 MB. Haga además una versión de 1280×720 a 2,5 Mbps, que pesa unos 50 MB.
   - Nombre y ubicación: `web/assets/cinematics/road_of_salt_1080.mp4` y `road_of_salt_720.mp4`.
   - Póster: un JPG del plano 20 en `web/assets/cinematics/road_of_salt_poster.jpg`.
   - Subtítulos: un archivo `road_of_salt.en.vtt` con los rótulos y las frases de Hermes de la columna «Voice».
   - Los archivos se copian a esa carpeta y se activan en el manifiesto (apartado 6); no hay que tocar código.

---

## 2. Bloques fijos de los prompts

**STYLE** (al principio de cada prompt):

> Stylized 3D animated film, toon-shaded with soft painterly gradients, like a hand-painted storybook brought to life. Warm gold and rose light, lilac shadows, gentle rim light on every edge, slight film grain. Cinematic 2.39 framing inside 16:9, shallow depth of field, smooth camera motion. No text, no logos, no watermarks.

**HERMES** (en cada plano en el que sale):

> Hermes, an elderly cartographer with a short white beard and kind tired eyes, wearing a long deep-blue hooded cloak with thin gold trim, a brown leather satchel across his chest, and a wooden staff topped with a small brass sphere. He moves carefully, like a man who has walked very far.

**NEGATIVE** (si la interfaz lo admite):

> photorealistic, anime, cartoon exaggeration, modern objects, cars, phones, text, subtitles, logo, extra limbs, deformed hands, blurry faces.

---

## 3. Guion por actos

| Acto | Tiempo | Tono | Qué cuenta |
|---|---|---|---|
| I · La tormenta | 0:00–0:24 | Opresivo, rojo | La tormenta roja, la atalaya y el silencio del amanecer |
| II · El cañón | 0:24–0:56 | Misterio, ecos | Cairn I, la Whispering Chasm, las voces y MIRAGE en la Oasis Gate |
| III · La sal | 0:56–1:36 | Asombro, luz | El trípode, las losas de una en una, CRYSTAL y el poste |
| IV · El Sump | 1:36–2:12 | Tensión | El mediodía, el resplandor, Hermes de rodillas, los jinetes y el catalejo |
| V · Las ruinas | 2:12–2:40 | Suspense y calma | El mojón y la balanza, las dunas al atardecer, Camp VII, las estelas y Al-Qibla |

---

## 4. Planos (20 × ~8 s generados; montaje final 2:40)

Cada prompt se escribe así: STYLE + HERMES (si sale) + el texto del plano.

| # | Uso | Plano | Prompt (inglés) | On-screen / Voice | Audio |
|---|---|---|---|---|---|
| 1 | 0:00–0:07 | Gran general, dron bajo | A colossal wall of red sand sweeping across a desert plateau at dusk, swallowing rock spires one by one, lightning glowing inside the dust, a tiny stone watchtower on a cliff in the foreground. Slow push-in toward the tower. | On-screen: *THE DESERT FRONTIER* | 🔊 viento grave |
| 2 | 0:07–0:13 | Interior, primer plano | Inside the stone watchtower: Hermes kneels by a small fireplace, the door barred, red dust hissing through the cracks around the door, firelight on his face, he closes his eyes and listens. Static camera, firelight flicker. | Voice: *"Neither traveler nor beast can move until it breaks."* | crepitar |
| 3 | 0:13–0:24 | Amanecer, general | The morning after the storm: a vast silent desert under a pale pink sky, every dune reshaped, the watchtower door opening and Hermes stepping out into perfect stillness, his footprints the only marks on the sand. Slow crane up. | On-screen: *THE GREAT SILENCE* | silencio y una nota |
| 4 | 0:24–0:31 | Medio, cenital parcial | A dry riverbed of grey silt; Hermes lifts a round river stone from a heap of stacked stones and sets it carefully on another heap, three stone foundations on a flat slab, a small hollow glowing faintly beneath. Gentle orbit. | — | piedra contra piedra |
| 5 | 0:31–0:38 | Contrapicado | Two towering red sandstone walls rising almost to touch, a thin blue thread of sky high above, Hermes with a lit lantern entering the narrow gorge, wind streaming past him carrying sand like smoke. Camera follows behind him. | On-screen: *THE WHISPERING CHASM* | 🔊 viento con susurros |
| 6 | 0:38–0:44 | Detalle | Hermes presses his ear to the red canyon wall, eyes closed, as faint glowing ripples of sound travel along the rock toward him. Macro, very shallow focus. | Voice: *"They still point the way to the next cairn."* | susurros |
| 7 | 0:44–0:50 | Montaje rápido | Quick sequence inside the canyon: a small bronze bell on a cairn, an old oil lamp, a bone comb, each resting on a stone cairn in a beam of light, Hermes's hand passing over each without taking it. Fast cuts in camera, warm light. | — | campanilla |
| 8 | 0:50–0:56 | General, atardecer | The mouth of the canyon opening onto an endless white salt plain at sunset, a great X carved high in the rock arch above Hermes, who sits on a warm stone smiling, the gorge behind him glowing purple. Slow pull-back. | On-screen: *MIRAGE* (fundido) | — |
| 9 | 0:56–1:03 | Amanecer, general | First light over a blinding white salt basin of hexagonal slabs, pink sky, an old bleached wooden surveyor's tripod with a red rag tied to it at the edge, Hermes standing beside it looking out. Slow dolly forward over the salt. | On-screen: *THE SALT PLAYA* | 🔊 viento suave, tintineo |
| 10 | 1:03–1:09 | Detalle | Close-up of Hermes's boot hovering over a white salt slab, his staff planted beside it, he leans his weight slowly onto the staff, tiny cracks of light pulse under the crust, then it holds. Slow motion. | Voice: *"Measured footsteps."* | crujido |
| 11 | 1:09–1:16 | Cenital | Top-down view of the salt basin like a living map: a single trail of glowing footprints crossing hexagonal slabs one row at a time, some slabs collapsing into dark brine holes beside the path, a faint gold glow at each safe step. | — | burbujas de salmuera |
| 12 | 1:16–1:23 | Medio | Hermes on a white slab in the middle of the basin, the morning heat shimmering, a pool of clear water appearing ahead of him and dissolving as he looks, revealing dark brine beneath. | — | zumbido de calor |
| 13 | 1:23–1:30 | Detalle | An old stone post of a secret order at the end of the salt, seven brass rings around it; the rings turn one by one with soft clicks and lock into place, a small brass plate swings open. Slow push-in. | On-screen: *CRYSTAL* (letras que aparecen en dorado) | 🔊 clics metálicos |
| 14 | 1:30–1:36 | Transición | The sun climbs fast over the basin, shadows shrinking to nothing, the light turning white-hot, the salt plain beyond the post dropping into a lower basin of pink polygon plates. Time-lapse feeling. | On-screen: *NOON · THE GREAT SALT SUMP* | — |
| 15 | 1:36–1:43 | Desde detrás de Hermes | Behind Hermes at noon, a field of hexagonal salt plates under an overwhelming white glare, every plate looking identical, heat waves rising, distant pink cliffs floating on a mirage. He shades his eyes with his hand. | Voice: *"I will be your eyes."* | 🔊 crepitar de sal |
| 16 | 1:43–1:50 | Primer plano | Hermes kneels and runs a finger along the seam of a salt plate; as he touches it, the glare fades from that plate and its details appear: sharp buckled ridges with salt cubes, cracks meeting in threes like a bird's foot. | — | — |
| 17 | 1:50–1:58 | Telefoto | Far away on the western rim of the salt, a line of eleven camels with veiled riders and one heavy wagon under an oilcloth, dark silhouettes wavering in the heat haze; one rider lifts a spyglass and it flashes twice in the sun. Long lens compression. | — | ostinato |
| 18 | 1:58–2:12 | Medio, cámara lenta | Hermes steps off the last salt plate onto golden sand, knees almost giving way; a squat stone marker stands before him with a dark niche, he unwraps oiled cloth and lifts out a small brass balance with two pans; the beam bears a circle half black, half white. | On-screen: *THE SURVEYOR'S BALANCE* | 🔊 respiración, nota |
| 19 | 2:12–2:24 | General, atardecer | Sunset over rolling dunes; ruins of an old nomad camp of mud-brick walls rise from the sand; three tall carved sandstone steles stand in the center; camels and riders arrive at a cistern and light a fire while Hermes lies flat behind a broken wall, watching. Slow lateral move. | On-screen: *CAMP VII · DUSK* | 🔊 cascabeles de arnés, fuego |
| 20 | 2:24–2:40 | Detalle → general | Moonlight. Close on a bronze sun-compass dial set into a carved stele, its needle frozen; Hermes's hand brushes sand from the carved words around it; the camera rises slowly to reveal the three steles under the stars and the desert beyond. End on stillness. | On-screen: *AL-QIBLA* · *Station 12 · The Desert Lexicon* | una nota sostenida, silencio |

---

## 5. Referencias del juego para el modo image-to-video

Las capturas limpias (sin interfaz, 1280×720) están en `docs/cinematic_refs/`. Se generaron desde el propio juego, con el estilo exacto del Hub. Están hechas en una partida de prueba: en `r18_playa_south_shore.jpg` y `r25_lexicon_hearth_name.jpg` puede verse algo de confeti arriba, que hay que descartar si el modelo lo copia.

| Archivo | Plano que ilustra |
|---|---|
| `r09_playa_edge_tripod.jpg` | 9 (el borde norte, visto desde el cielo) |
| `r11_playa_sky_trail.jpg` | 11 (el rastro de huellas sobre las losas) |
| `r13_playa_post_console.jpg` | 13 (Hermes llega a la última fila, ante el poste de la Orden) |
| `r15_playa_sump_glare.jpg` | 14–15 (el Sump a mediodía, tres placas en el resplandor) |
| `r16_playa_sump_signs.jpg` | 16 (las señales aparecen sobre las placas) |
| `r17_playa_sump_midway.jpg` | 17 (la caravana en el borde oeste, la orilla delante) |
| `r18_playa_south_shore.jpg` | 18 (la orilla sur con el mojón y la balanza) |

| Planos | Captura |
|---|---|
| 1–3 | La atalaya y la tormenta: el mapa del desierto en el Hub (vista Desert) con la tormenta activa |
| 4 | El juego de Cairn I (las piedras del río) |
| 5–8 | El juego 3D de la Whispering Chasm (dentro del cañón y la salida a la Oasis Gate) |
| 9–13 | La Salt Playa, fase I: el borde norte con el trípode, la vista cenital y el poste de la Orden |
| 14–18 | La Salt Playa, fase II: el Sump detrás de Hermes, las placas con resplandor, la caravana del borde y la orilla sur con el mojón |
| 19–20 | El Lexicon ya es un juego 3D («The Steles of Camp VII»): use `r19_lexicon_steles_night.jpg` (las tres estelas), `r20_lexicon_dial_sigil.jpg` y `r20b_lexicon_dial_locked.jpg` (el dial de bronce) |

---

## 6. Integración en el juego

**Estado (25-10-2026): el reproductor ya está construido y dormido.** No hace falta tocar código cuando lleguen los vídeos:

1. Copie los archivos a `web/assets/cinematics/` con los nombres de `manifest.json` (`road_of_salt_1080.mp4`, `road_of_salt_720.mp4`, `road_of_salt_poster.jpg`, `road_of_salt.en.vtt`, y los de `night_of_steles_*` para la Parte 2).
2. En `web/assets/cinematics/manifest.json` ponga `"available": true` en la película que ya exista.
3. Ejecute `python3 scripts/web/offline_list.py` y despliegue. Los vídeos, pósters y subtítulos quedan **fuera** de la precarga offline; solo `manifest.json` entra en ella.

Hasta que una película figure como disponible no se muestra ningún botón en ningún sitio. Está en `web/hub/js/cinematic.js` y `web/hub/css/cinematic.css`, con la sección de humo `cinematic`.

Dónde aparece el botón:

- **«The Road of Salt»**: en la barra del Field Wire «Through the Dunes · To the Nomad Ruins», en la tarjeta sellada de la Estación 12 mientras Hermes camina, y como *Watch again* en la tarjeta de la Estación 11 terminada.
- **«The Night of the Steles»** (Parte 2): en la tarjeta de la Estación 12 terminada y junto al botón de volver al mapa en la tarjeta de victoria del Lexicon.

El reproductor (descripción de lo que ya hace):


- **Capa propia** sobre el Hub, con el póster, los controles del navegador, los subtítulos activados por defecto, Escape y la ✕ para cerrar, foco atrapado y devuelto al botón. Elige el 720p en pantallas de menos de 760 px o con `navigator.connection.saveData`. Si Silvia tiene el sonido ambiental del Hub silenciado, el vídeo empieza silenciado; si no, el ambiente descansa mientras suena el vídeo y vuelve al cerrarlo.
- **Peso.** Los archivos no entran en la precarga offline del service worker (`scripts/web/offline_list.py` ignora `assets/cinematics/` salvo el manifiesto): pesarían más que todo el juego, que ocupa 31 MB. Se descargan en streaming al pulsar *play*. Sin conexión, el botón dice *available when you are online*.
- **Medición.** Un indicador `order_cinematic_<id>_seen` registra si se vio hasta el final (`road_of_salt`, `night_of_steles`). No guarda nada más. Al terminar se emite el evento `cinematic:seen`.

---

## 7. Parte 2 propuesta: «The Night of the Steles» (≈ 1:10, para después del Lexicon)

El Lexicon ahora tiene su propio clímax (la campanada de Al-Qibla, la fuga por los muros y el nombre en el hogar), que esta cinemática no cuenta. Proponemos una segunda pieza corta que se vería al terminar la Estación 12 y enlazaría con el paso final del chat («past midnight at Camp VII»). Mismo STYLE, mismo HERMES y misma música de fondo, ahora más grave. Se genera igual que la primera (8 s por plano, se recorta a 6–7 s).

| # | Uso | Plano | Prompt (inglés) | On-screen / Voice | Referencia |
|---|---|---|---|---|---|
| 21 | 0:00–0:07 | General, luna | Moonlit nomad camp: three tall carved sandstone steles in a ring of broken mud-brick walls, a fire burning low by a dry cistern, a sleeper rolled in a blanket and a guard walking a slow round with a torch past the stones. Slow lateral move. | On-screen: *CAMP VII · MIDNIGHT* | `r19_lexicon_steles_night.jpg` |
| 22 | 0:07–0:14 | Primer plano | Hermes crouched at the foot of a stele with a small brush, sweeping sand out of carved grooves so that a crossword of words appears; in the background the torch light drifts away. | Voice: *"Watch where he is before every move."* | `r19b_lexicon_steles_clean.jpg` |
| 23 | 0:14–0:22 | Detalle | A bronze sun-compass dial set into a tall stele; seven small windows turn and click into the letters P H O E N I X, and the needle spins free like a weathervane, then locks pointing south-south-west. | On-screen: *PHOENIX* · *194° SSW* | `r20_lexicon_dial_sigil.jpg`, `r20b_lexicon_dial_locked.jpg` |
| 24 | 0:22–0:30 | Medio | The needle locks and the whole dial rings like a great bell across the camp; the sleeping man sits bolt upright, the guard turns with his torch raised, shouting. Hermes freezes in the shadow of the stele. | Sound: una campanada larga | `r21_lexicon_ambush.jpg` |
| 25 | 0:30–0:45 | Persecución, cámara baja | Hermes runs through seven rows of crumbling brick walls with three doorways each, a carved letter over every lintel; torchlight flickers closer behind him; he chooses one doorway after another without looking back. | Voice: *"One letter for each wall, in order."* | `r22_lexicon_walls.jpg` |
| 26 | 0:45–0:55 | Detalle | Hermes folded into a dark niche under a fallen lintel, holding his breath; two torches and two pairs of boots pass along the passage a few steps away. | — | `r23_lexicon_niche.jpg` |
| 27 | 0:55–1:03 | General | Moonlit desert: the riders mount their camels and gallop away south, a banner opening in the wind, a bird with its wings up rising out of three flames. | — | — |
| 28 | 1:03–1:10 | Cenital → detalle | The cold hearth; Hermes kneels beside a flat dark stone where a knife has cut a bird of fire, the words BC ASHES and an arrow marked 194. Slow push-in, then hold. | On-screen: *THE BC ASHES* | `r24_lexicon_hearth_unread.jpg`, `r25_lexicon_hearth_name.jpg` |

La integración sería la misma que la de la primera cinemática (apartado 6), con su botón junto al premio del Lexicon y el indicador `order_cinematic_night_of_steles_seen`.
