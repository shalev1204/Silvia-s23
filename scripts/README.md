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
4. el Cipher Ledger solo muestra las ecuaciones del desierto tras su estación.

Si termina con `✅ ALL GREEN`, se puede desplegar; si sale `❌`, no despliegues y revisa la línea marcada con ✗.
También conviene pasar `python3 scripts/audit/lint_lore_and_vocabulary.py` (vocabulario y nombres canónicos).
