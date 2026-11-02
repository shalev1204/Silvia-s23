# Audio Pipeline & Transceiver Generators · The Eclipse Order

Este directorio contiene las herramientas de síntesis de voz mediante IA (Google AI Studio / Gemini TTS), modelado foley procedimental y post-producción de audio cinematográfico para las **6 transmisiones canónicas del Cartógrafo** y efectos diegéticos de la expedición.

---

## 📻 Mapa de Transmisiones Canónicas y Generadores

### 1. Transmisión 1: The Raid on the Alpine Sanctuary (`cartographer_raid.mp3`)
Simula el asalto al santuario alpino, la brecha de las puertas de hierro, los pasos acelerados en piedra, las órdenes de los asaltantes y la huida del Cartógrafo por el acueducto:
- **`generate_pro_cartographer_stems.py`**: Generación de las frases vocales del Cartógrafo con Gemini TTS (voz Achernar/Fenrir).
- **`generate_loud_pursuers.py`** / **`generate_pursuers.py`**: Generación multivoz de los asaltantes (*"He's in the catacombs! Cut him off!"*).
- **`generate_hard_stone_footsteps.py`** / **`generate_footsteps.py`**: Modelado foley de pasos sobre losas de piedra.
- **`generate_intense_impacts_and_alarm.py`** / **`generate_breathing_and_impacts.py`**: Brechas en el portón, impactos metálicos, fatiga y respiración pesada.
- **`build_hyperrealistic_raid_master.py`**: Masterizador de producción final. Sincroniza la línea temporal con delays precisos, compresión sidechain y filtros de transceiver militar.
- *(Históricos/Bocetos)*: `generate_raid_audio.py` (macOS TTS), `generate_gemini_stems.py`, `build_raid_master.py`, `build_cinematic_master.py`.

---

### 2. Transmisión 2: First Desert Report (`cartographer_desert_transmission.mp3`)
El Cartógrafo escapa hacia las dunas del sur tras la destrucción del observatorio, notificando el envío del diario físico en papel a Italia:
- **`generate_resolute_desert_stems.py`**: Voz grave, serena y determinada del Cartógrafo comunicando la caída del observatorio y el robo del Astrolabio.
- **`generate_desert_foley.py`**: Foley ambiental del desierto (viento nocturno, desplazamiento de dunas, chirridos de radio).
- **`build_desert_master_v2.py`**: Mezclador final que ensambla voz, silencios meditativos y filtrado de radio (`stems_desert_v2`).
- *(Históricos)*: `generate_desert_stems.py`, `build_desert_master.py`.

---

### 3. Transmisiones 5 y 6: The Shifting Tempest & Victory (`alert.mp3`, `victory.mp3`)
Estaciones 08 y 09 (Medianoche en las rocas y el ojo de la tormenta de arena):
- **`generate_tempest_radio_master.py`**: Generador de radio militar de alta fidelidad con efectos de distorsión electrostática y truenos.
- **`build_hyperrealistic_tempest_radio.py`**: Masterizado con cortes de portadora por tormenta de arena e interferencia atmosférica.
- **`build_hyperrealistic_victory_transmission.py`**: Mezcla master de la transmisión de victoria tras el paso del ojo de la tormenta.
- **`mix_alert_and_victory.py`**: Ensamblado de pistas de alerta y resolución para la calibración nocturna (`web/constellation/midnight-calibration/audio`).
- `build_tempest_cinematic_audio.py`: Variante cinematográfica.

---

### 4. Sonidos Diegéticos y Criptográficos
- **`generate_cipher_emergency_radio.py`**: Síntesis de tonos de emergencia y portadora para frecuencias de rescate.
- **`generate_matrix_relief_audio.py`**: Efectos sonoros mecánicos para los engranajes de la matriz de bajorrelieve.

---

### 5. Archivo Histórico (`archive/`)
Bocetos y pruebas preliminares descartadas de las llamadas de auxilio (*distress drafts*):
- `build_distress_master.py`, `generate_distress_audio.py`, `mix_distress_call.py`.

---

## 🔑 Autenticación Gemini TTS
Los scripts que invocan Gemini TTS utilizan la API key provista mediante:
1. Variable de entorno `GEMINI_API_KEY`, o
2. Archivo seguro fuera del repo: `~/.gemini_api_key`.
*Nunca guarde ni comitee credenciales en este directorio.*

