#!/usr/bin/env python3
"""How Silvia played, for Carles's handwritten letter in the chest (docs/IDEAS_BACKLOG.md #13).

Opens the Hub headless with a saved journey and prints EclipseJourney.profile(): the same rules the ending of Tower I
and the Vault will use, so the letter and the screen agree.

Input: a JSON file with the journey, i.e. the `progress` column of the latest row of `eclipse_saves` for Silvia in
Supabase (Claude reads it with the connector and saves it to a file). Nothing is sent anywhere: the cloud save stays
off on the local server.

Run:  python3 scripts/audit/journey_report.py progress.json   (add --json for the raw profile)
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import web_smoke  # noqa: E402  (the smoke's local server and browser helpers)
from playwright.sync_api import sync_playwright  # noqa: E402

TONES = {"warm": "warm (cálida)", "protective": "protective (protectora)", "tactical": "tactical (táctica)", "analytic": "analytic (analítica)"}


def read_profile(progress):
    server = web_smoke.start_server()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            seed = {k: v if isinstance(v, str) else json.dumps(v) for k, v in progress.items()}
            seed = dict(web_smoke.SILVIA, **seed)   # Silvia's profile, past the live-version resets
            ctx, page, errors = web_smoke.new_page(browser, seed)
            page.goto(f"{web_smoke.BASE}/index.html", wait_until="load")
            page.wait_for_timeout(2500)
            profile = page.evaluate("EclipseJourney.profile()")
            ctx.close()
            browser.close()
            return profile
    finally:
        server.shutdown()


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("progress", help="JSON file with Silvia's saved journey (the progress column of eclipse_saves)")
    ap.add_argument("--json", action="store_true", help="print the raw profile")
    args = ap.parse_args()
    with open(args.progress, encoding="utf-8") as f:
        progress = json.load(f)
    if isinstance(progress, dict) and isinstance(progress.get("progress"), dict):
        progress = progress["progress"]
    pr = read_profile(progress)
    if args.json:
        print(json.dumps(pr, indent=2, ensure_ascii=False))
        return
    sw = pr["swiftest"]
    print("Perfil del viaje de Silvia")
    print(f"  Tono dominante:  {TONES.get(pr['tone'], pr['tone'])}")
    print(f"  Días de viaje:   {pr['days']}")
    print(f"  Resuelto:        {pr['desertGames']} juegos del desierto · {pr['stageRooms']} salas de la Torre III")
    print(f"  Notas de Hermes: {pr['notes']} · fallos: {pr['fails']}")
    print(f"  Franja favorita: {pr['hour'] or '—'}")
    print(f"  Más rápida:      {sw['label'] + ' (' + str(sw['minutes']) + ' min)' if sw else '—'}")
    print(f"  Llamó a Hermes:  {pr['name'] or '—'}")
    print(f"  Objeto elegido:  {pr['item'] or '—'}")


if __name__ == "__main__":
    main()
