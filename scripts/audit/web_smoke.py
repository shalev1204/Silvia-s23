#!/usr/bin/env python3
"""
Web smoke tests for The Eclipse Order (run before every `wrangler pages deploy web`).

Serves web/ locally with the security headers of web/_headers and drives a real Chromium:
  1. Every page loads with no JavaScript error, no failed request and no CSP violation.
  2. The Hub opens every view as Silvia, as Silvia in the storm, and as Carles.
  3. The Field Wire never offers the Station 12/13 answers before those stations are solved.
  4. The Cipher Ledger only lists the desert equations once their station is solved.

Setup (once):  pip install playwright && python3 -m playwright install chromium
Run:           python3 scripts/audit/web_smoke.py            (exit code 0 = all green)
Options:       --chromium /path/to/chrome   use a specific browser binary
"""

import argparse
import functools
import glob
import http.server
import json
import os
import sys
import threading

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WEB = os.path.join(ROOT, "web")
PORT = 8799
BASE = f"http://127.0.0.1:{PORT}"
VIEWS = ["view-trail", "view-transmissions", "view-archives", "view-chronicles", "view-cipher", "view-field-wire"]

# Seeds a profile once per tab (sessionStorage guard), so reloads keep whatever the page writes
SEED_JS = "(()=>{if(sessionStorage.getItem('__seeded'))return;const s=%s;for(const k in s)localStorage.setItem(k,s[k]);sessionStorage.setItem('__seeded','1')})()"
SILVIA = {"the_eclipse_active_seeker": "Silvia", "order_silvia_live_v4": "done", "order_silvia_live_v3": "done"}
DESERT_BASE = dict(SILVIA, order_dawn_step="3", order_cairn1_completed="true", order_seal_cairn_1="true",
                   order_chasm_march_start="1", order_whispering_chasm_completed="true",
                   order_salt_playa_completed="true", order_field_wire_step="4")

failures = []


def check(ok, label, detail=""):
    print(("  ✓ " if ok else "  ✗ ") + label + (f"  ({detail})" if detail and not ok else ""))
    if not ok:
        failures.append(label)


def read_headers():
    headers = {}
    with open(os.path.join(WEB, "_headers"), encoding="utf-8") as f:
        for line in f:
            if line.startswith(" ") and ":" in line:
                key, value = line.strip().split(":", 1)
                headers[key.strip()] = value.strip()
    return headers


def start_server():
    headers = read_headers()

    class Handler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            for key, value in headers.items():
                self.send_header(key, value)
            super().end_headers()

        def log_message(self, *args):
            pass

        def handle(self):
            try:
                super().handle()
            except (ConnectionResetError, BrokenPipeError):
                pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Handler, directory=WEB))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def new_page(browser, seed=None):
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append("JS error: " + str(e)[:200]))
    page.on("console", lambda m: errors.append("console: " + m.text[:200]) if m.type == "error" else None)
    page.on("response", lambda r: errors.append(f"HTTP {r.status}: {r.url}") if r.status >= 400 else None)
    page.add_init_script("document.addEventListener('securitypolicyviolation', e => console.error('CSP blocked ' + e.violatedDirective + ' ' + e.blockedURI))")
    if seed:
        page.add_init_script(SEED_JS % json.dumps(seed))
    return ctx, page, errors


def test_pages(browser):
    print("\n1. Every page loads cleanly (JS, requests, CSP)")
    pages = ["index.html"] + sorted(os.path.relpath(p, WEB) for p in glob.glob(WEB + "/constellation/**/*.html", recursive=True))
    for rel in pages:
        ctx, page, errors = new_page(browser, SILVIA)
        page.goto(f"{BASE}/{rel}", wait_until="load")
        page.wait_for_timeout(2500)
        page.mouse.click(640, 450)
        page.wait_for_timeout(500)
        check(not errors, rel, "; ".join(sorted(set(errors))[:3]))
        ctx.close()


def test_hub_views(browser):
    print("\n2. Hub views for each profile")
    profiles = {
        "Silvia": SILVIA,
        "Silvia (storm)": dict(SILVIA, seeker_silvia_sandstorm_active="true", order_sandstorm_active="true"),
        "Carles": {"the_eclipse_active_seeker": "Carles"},
    }
    for name, seed in profiles.items():
        ctx, page, errors = new_page(browser, seed)
        page.goto(f"{BASE}/index.html", wait_until="load")
        page.wait_for_timeout(2500)
        for view in VIEWS:
            page.evaluate("v => { const b = document.querySelector(`[data-view=\"${v}\"]`); if (b) b.click(); }", view)
            page.wait_for_timeout(700)
        check(not errors, f"{name}: all views", "; ".join(sorted(set(errors))[:3]))
        ctx.close()


def wire_state(browser, extra):
    ctx, page, errors = new_page(browser, dict(DESERT_BASE, **extra))
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    page.evaluate("document.querySelector('[data-view=\"view-field-wire\"]').click()")
    page.wait_for_timeout(2500)
    info = page.evaluate("""() => ({
        choices: [...document.querySelectorAll('#wire-choices-grid button')].map(b => b.innerText),
        text: document.getElementById('view-field-wire').innerText })""")
    ctx.close()
    return info, errors


def test_wire_gating(browser):
    print("\n3. Field Wire keeps Station 12/13 answers sealed")
    info, errors = wire_state(browser, {})
    check(not info["choices"] and "PHOENIX" not in info["text"], "Salt Playa done, Lexicon not: no PHOENIX, no replies")
    info, errors = wire_state(browser, {"order_desert_lexicon_completed": "true"})
    check(len(info["choices"]) == 3, "Lexicon done: Camp VII debrief opens")
    info, errors = wire_state(browser, {"order_desert_lexicon_completed": "true", "order_field_wire_step": "6"})
    check(not info["choices"] and "XXX" not in info["text"], "Clepsydra not done: no well grid, no key")
    info, errors = wire_state(browser, {"order_desert_lexicon_completed": "true", "order_field_wire_step": "6",
                                        "order_oasis_clepsydra_completed": "true"})
    check(len(info["choices"]) == 3 and not errors, "Clepsydra done: Camp VIII debrief opens", "; ".join(errors[:2]))


def test_ledger_gating(browser):
    print("\n4. Cipher Ledger reveals desert equations only after their station")
    cases = [({}, []), ({"order_desert_lexicon_completed": "true"}, ["stele-rf"]),
             ({"order_desert_lexicon_completed": "true", "order_oasis_clepsydra_completed": "true"}, ["stele-rf", "falcon-pa"])]
    for extra, expected in cases:
        ctx, page, errors = new_page(browser, dict(SILVIA, **extra))
        page.goto(f"{BASE}/index.html", wait_until="load")
        page.wait_for_timeout(2500)
        page.evaluate("document.querySelector('[data-view=\"view-cipher\"]').click()")
        page.wait_for_timeout(600)
        ids = page.evaluate("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id.replace('eq-item-', '')).filter(i => /stele|falcon/.test(i))")
        check(ids == expected and not errors, f"desert equations shown: {expected or 'none'}", f"got {ids}; " + "; ".join(errors[:2]))
        ctx.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--chromium", help="path to a Chromium/Chrome binary (default: Playwright's own)")
    args = parser.parse_args()

    server = start_server()
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.chromium) if args.chromium else p.chromium.launch()
        test_pages(browser)
        test_hub_views(browser)
        test_wire_gating(browser)
        test_ledger_gating(browser)
        browser.close()
    server.shutdown()

    print("\n" + ("✅ ALL GREEN: safe to deploy." if not failures else f"❌ {len(failures)} FAILED: do not deploy yet."))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
