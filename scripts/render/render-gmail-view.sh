#!/bin/bash
# Render Gmail Dispatch View with Cosmic Backdrop (2980 × 4008 px)
set -e
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
HTML="file://${DIR}/assets/general/emails/parchment-email-01-gmail.html"
OUT="${DIR}/assets/general/emails/email-01-gmail-view.png"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "Rendering Gmail View → ${OUT}"
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --screenshot="$OUT" \
  --window-size=2980,4008 \
  --virtual-time-budget=8000 \
  "$HTML"

ls -lh "$OUT"
echo "Done."
