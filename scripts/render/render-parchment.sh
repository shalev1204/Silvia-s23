#!/bin/bash
# Render A4 parchment @ 300 DPI (2480 × 3508 px)
set -e
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
HTML="file://${DIR}/assets/general/emails/parchment-email-01.html"
OUT="${DIR}/assets/general/emails/email-01-parchment.png"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "Rendering A4 @ 300dpi → ${OUT}"
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --screenshot="$OUT" \
  --window-size=2480,3508 \
  --virtual-time-budget=8000 \
  "$HTML"

ls -lh "$OUT"
echo "Done."
