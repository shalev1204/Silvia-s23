# Assets · Inventario Completo

> Todos los archivos generados y cómo regenerarlos, estructurados por Caminos y Ámbito General.

---

## 1. General (The Eclipse Order)

| Archivo | Descripción | Regenerar / Fuente |
|---------|-------------|-------------------|
| `assets/general/branding/order-profile-picture.png` | Foto de perfil Gmail (◐ mitad blanco / mitad negro) | Exportado desde `order-profile-symbol.svg` |
| `assets/general/branding/order-profile-symbol.svg` | Logo vectorial oficial ◐ | Vectorial maestro |
| `assets/general/branding/logo-the-eclipse-order.*` | Emblema heráldico de la Orden | `python3 scripts/render/export-icons.py` |
| `assets/general/glyphs/ecl-a.svg` … `ecl-z.svg`, `ecl-dot.svg` | 27 glifos vectoriales del Eclipse Script | `python3 scripts/glyphs/generate-glyphs-v3.py` |
| `assets/general/backgrounds/desert-dunes-illustrated.png` | Fondo de dunas del desierto | Ilustración de archivo |
| `assets/general/emails/email-01-parchment.png` | Pergamino final Email 1 (A4 300dpi, 2480×3508 px) | `./scripts/render/render-parchment.sh` |
| `assets/general/emails/parchment-email-01.html` | Código fuente HTML del pergamino | Plantilla de renderizado |
| `assets/general/emails/email-01-gmail-view.png` | Vista previa con marco cósmico | `./scripts/render/render-gmail-view.sh` |

---

## 2. Constellation Path

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `assets/constellation/branding/logo-path-constellation.*` | Emblema heráldico del Constellation Path | Web, tarjetas y correos |
| `assets/constellation/celestial-flower/cartographer-illustration.jpg` | Retrato del Cartógrafo de la Luz Distante | Modal de revelación de la flor |
| `assets/constellation/celestial-flower/email-02-fragment-1.png` | Tarjeta visual de navegación del Email 2 | Cuerpo de Email 2 |
| `assets/constellation/celestial-flower/card-fragment-01.html` | Plantilla HTML de la tarjeta | Renderizado visual |
| `assets/constellation/radio-transmission/audio/cartographer_raid.mp3` | Master de radio (52s, voz Daniel + telemetría) | `python3 scripts/audio/build_raid_master.py` |
| `assets/constellation/radio-transmission/audio/stems_raid/` | Stems de voz sintetizados (r1 a r8) | `python3 scripts/audio/generate_raid_audio.py` |

---

## 3. Desert Path & Stage Path

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `assets/desert/branding/logo-path-desert.*` | Emblema heráldico de The Oracle | Web, cartas y correos futuros |
| `assets/stage/branding/logo-path-stage.*` | Emblema heráldico de The Mirror Speaker | Web, cartas y correos futuros |

---

## 4. Archivo de Pruebas

- **`assets/archive/tests/`**: Almacena las capturas de verificación, pruebas intermedias de dispositivos y tests de geometría generados durante el desarrollo (fuera del flujo de producción).
