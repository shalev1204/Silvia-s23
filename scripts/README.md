# Scripts · The Eclipse Order

Herramientas automatizadas de generación, renderizado y síntesis:

```text
scripts/
├── audio/
│   ├── generate_raid_audio.py           ← Genera los stems de voz de la transmisión actual
│   ├── build_raid_master.py             ← Mezcla el audio final (radio, telemetría, filtros)
│   └── archive/                         ← Versiones y pruebas previas (distress drafts)
│
├── glyphs/
│   ├── generate-glyphs.py               ← Generador inicial de glifos SVG
│   ├── generate-glyphs-v2.py            ← Generador v2 (refinamiento)
│   └── generate-glyphs-v3.py            ← Generador canónico de los 27 glifos del Eclipse Script
│
└── render/
    ├── export-icons.py                  ← Exporta emblemas de los 3 caminos y de la Orden
    ├── render-parchment.sh              ← Renderiza el pergamino del Email 1 en alta resolución
    └── render-gmail-view.sh             ← Renderiza la vista previa del pergamino para Gmail
```

## Clave de la API de Gemini (scripts de voz y vídeo)

Los scripts de `audio/` y `render/` que llaman a Gemini leen la clave, por este orden, de:

1. la variable de entorno `GEMINI_API_KEY`, o
2. el archivo `~/.gemini_api_key` (fuera del repositorio).

La clave viaja en la cabecera `x-goog-api-key`, nunca en la URL. **Nunca** se escribe en un archivo del repo; `.gitignore` bloquea `.env`, `*api_key*`, `.gemini_api_key` y similares, y el workflow `Secret scan` (gitleaks) revisa cada push.

## Pruebas antes de desplegar la web

Antes de cada `npx wrangler pages deploy web`, ejecuta:

```bash
pip install playwright && python3 -m playwright install chromium   # solo la primera vez
python3 scripts/audit/web_smoke.py
```

Abre la web en un Chromium real con las cabeceras de `web/_headers` y comprueba que:
1. todas las páginas cargan sin errores de JavaScript, sin archivos que fallen y sin bloqueos de la CSP;
2. el Hub abre todas las vistas como Silvia, como Silvia en la tormenta y como Carles;
3. el chat con Hermes no ofrece las respuestas de las Estaciones 12 y 13 antes de resolverlas;
4. el Cipher Ledger solo muestra las ecuaciones del desierto tras su estación;
5. la Estación 14 (The Sun Monolith) funciona de principio a fin: puertas de la Torre II, travesía de 12 h, sigilo, el sol que camina, Sello de Cairn II, balance en el chat y recarga de la página;
6. la Estación 15 (The Sandstone Labyrinth) funciona de principio a fin: amanecer bajo el Monolito, bajada de 6 h, sigilo, la huida (el test la resuelve por su cuenta con una búsqueda sobre casilla × turno y comprueba que la ruta que ignora las antorchas acaba atrapada), Sello de Cairn III, balance y recarga;
7. la Estación 16 (Cairn IV) funciona de principio a fin: anochecer en el *hardpan*, travesía de 18 h, sigilo, los tres versos del canto, Sello de Cairn IV, la reliquia, balance y recarga;
8. la Estación 17 (Arch of the Solstice) funciona de principio a fin: el amanecer de octubre (el test resuelve cada paso con su propia búsqueda de rutas), la señal nocturna, el Sello de Cairn V, la ceremonia de los cinco sellos, la reliquia y el balance;
9. la Estación 18 (The Polybius Stele) funciona de principio a fin: mediodía bajo el Arco, marcha de 6 h, proverbio, los golpes del Sirviente (el test los descifra por su cuenta con la cuadrícula PHOENIX y la Ley del Espejismo Invertido), el atrio en llamas (el test calcula su propia ruta y comprueba que ninguna ruta a tiempo evita la ceniza), la reliquia, el Ledger y el balance;
10. la Estación 19 (The Oracle's Horizon) funciona de principio a fin: escalera interior, sigilo, el disco ajustado al cielo y leído desde el norte (el test lo lee por su cuenta), el WHEN, el voto, el paso al Stage Path, el Ledger y el balance; sin el sello de Cairn I la audiencia espera;
11. cada perfil (Silvia y Carles) conserva su propia aventura;
12. el «Play this game» de Carles deja el mundo en la llegada de cada juego, adelante y atrás;
13. el Stage Path: oculto hasta la Estación 19; después, el Espejo Vivo (salas, teclado, fragmentos y el WHERE solo con el espejo entero);
14. la Estación 20 (The Gate of a Thousand Masks) funciona de principio a fin: la partida de la Torre II, la travesía de 18 h, la palabra de la puerta, las mitades dibujadas a mano con el ratón (con pulso tembloroso), el Fragmento I y el balance con la nota sellada con ceniza (unos 6 minutos en total con 2 procesos; 11–12 en serie).

Si termina con `✅ ALL GREEN`, se puede desplegar; si sale `❌`, no despliegues y revisa la línea marcada con ✗.

Las secciones corren **en paralelo**, una por proceso con su propio navegador (`--jobs N`, por defecto 2; con 3 o más fallan los shaders WebGL del mapa 3D por la carga; `--jobs 1` corre todo en un solo proceso); el informe sale igualmente en orden y termina con los segundos de cada sección. Cada pasada escribe `scripts/audit/smoke_report.json` (ignorado por git) con el resultado, la duración y los fallos de cada sección.

- **Pasada corta antes de cada commit**: `python3 scripts/audit/web_smoke.py --quick` (páginas, vistas, gating del chat y del Ledger, perfiles, Tester, guardado en la nube, pistas progresivas (`hints`, `early`), Espejo Vivo y la última estación construida; sin los juegos largos del desierto). No sustituye al completo antes de desplegar.
- **Solo unas secciones**: `--only s20,mirror` (claves en `SECTIONS`: `pages`, `views`, `wire`, `ledger`, `s14`–`s20`, `profiles`, `tester`, `cloud`, `hints`, `early`, `mirror`). Al construir una estación nueva, añádela a `SECTIONS` y sustituye la última estación de `QUICK`.
- Usa el Chromium de Playwright (`python3 -m playwright install chromium`). El Chrome de escritorio (`--chromium …`) vale en serie (`--jobs 1`), pero en paralelo se puede quedar parado varios minutos.
También conviene pasar `python3 scripts/audit/lint_lore_and_vocabulary.py` (vocabulario y nombres canónicos).
