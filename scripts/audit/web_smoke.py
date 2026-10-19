#!/usr/bin/env python3
"""
Web smoke tests for The Eclipse Order (run before every `wrangler pages deploy web`).

Serves web/ locally with the security headers of web/_headers and drives a real Chromium:
  1. Every page loads with no JavaScript error, no failed request and no CSP violation.
  2. The Hub opens every view as Silvia, as Silvia in the storm, and as Carles.
  3. The Field Wire never offers the Station 12/13 answers before those stations are solved.
  4. The Cipher Ledger only lists the desert equations once their station is solved.
  5. Station 14 (The Sun Monolith): gates scene, 12-hour crossing, sigil, walking sun, Seal II, debrief, reload.
  6. Station 15 (The Sandstone Labyrinth): first light, 6-hour walk, sigil, the escape (solved by search), Seal III, debrief.

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
DESERT_DONE = {"order_desert_lexicon_completed": "true", "order_oasis_clepsydra_completed": "true"}
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
             (DESERT_DONE, ["stele-rf", "falcon-pa"]),
             (dict(DESERT_DONE, order_sun_monolith_completed="true"), ["stele-rf", "falcon-pa", "cairn2-df", "cairn2-ct"])]
    for extra, expected in cases:
        ctx, page, errors = new_page(browser, dict(SILVIA, **extra))
        page.goto(f"{BASE}/index.html", wait_until="load")
        page.wait_for_timeout(2500)
        page.evaluate("document.querySelector('[data-view=\"view-cipher\"]').click()")
        page.wait_for_timeout(600)
        ids = page.evaluate("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id.replace('eq-item-', '')).filter(i => /stele|falcon|cairn2/.test(i))")
        check(ids == expected and not errors, f"desert equations shown: {expected or 'none'}", f"got {ids}; " + "; ".join(errors[:2]))
        ctx.close()


def test_sun_monolith(browser):
    print("\n5. Station 14 · The Sun Monolith, end to end")
    seed = dict(DESERT_BASE, **DESERT_DONE, order_field_wire_step="8", order_field_wire_choices="[2,0,1,0,0,0,1,0]")
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-sun-monolith')).display") != "none"
    choices = lambda: js("[...document.querySelectorAll('#wire-choices-grid button')].length")
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def answer_first():
        js("document.querySelector('#wire-choices-grid button').click()")
        page.wait_for_timeout(9000)   # Hermes types his final message

    open_wire()
    check(get("order_field_wire_step") == "9" and choices() == 3 and "He is her Servant" in wire_text(),
          "gates of Tower II: step 9 with 3 replies")
    js("window.selectDesertStation(23)"); page.wait_for_timeout(500)
    check(not modal_open(), "monolith sealed before Hermes sets out")
    open_wire(); answer_first()
    check(get("order_field_wire_step") == "10" and get("order_monolith_march_start"), "reply at the gates starts the 12-hour crossing")
    js("window.selectDesertStation(23)"); page.wait_for_timeout(500)
    check(not modal_open(), "monolith sealed during the crossing")

    js("localStorage.setItem('order_monolith_march_start', String(Date.now() - 13 * 3600 * 1000))")
    js("window.openSunMonolithModal()"); page.wait_for_timeout(500)
    check(modal_open() and "Sealed in stone" in js("document.getElementById('monolith-inscription').innerText"),
          "after 12 h it opens, inscription still sealed")
    check(js("document.querySelector('#monolith-game .monolith-game-inner').inert") is True, "sun controls inert while the stone sleeps")
    for word in ["SUNDAY", "DIALSUN", "SUN DIAL X"]:
        page.fill("#monolith-key-input", word); page.click("#btn-monolith-speak"); page.wait_for_timeout(120)
    check(get("order_monolith_hint") == "true" and get("order_sun_monolith_awake") is None, "3 wrong sigils unlock the hint, stone stays asleep")
    page.fill("#monolith-key-input", " sun-dial "); page.click("#btn-monolith-speak"); page.wait_for_timeout(250)
    check(get("order_sun_monolith_awake") == "true", "forgiving sigil 'sun-dial' wakes the stone")

    feedback = lambda: js("document.getElementById('monolith-mark-feedback').innerText")
    js("window.__sunMonolith.setMinute(660)"); page.click("#btn-monolith-mark")
    check("sand" in feedback(), "11:00 shadow touches only sand")
    js("window.__sunMonolith.setMinute(480)"); page.click("#btn-monolith-mark")
    js("window.__sunMonolith.setMinute(600)"); page.click("#btn-monolith-mark")
    check(get("order_sun_monolith_marks") == "0" and "never names" in feedback(), "an unnamed mark (10:00) puts the marks back to sleep")
    js("window.__sunMonolith.setMinute(720)"); page.click("#btn-monolith-mark")
    check(get("order_sun_monolith_marks") in (None, "0"), "noon before the morning mark is rejected")
    for minute in [480, 720, 900, 990]:
        js(f"window.__sunMonolith.setMinute({minute})"); page.click("#btn-monolith-mark"); page.wait_for_timeout(120)
    check(get("order_sun_monolith_completed") == "true" and get("order_seal_cairn_2") == "true", "four marks in order: Seal of Cairn II granted")
    page.click("#btn-close-monolith"); page.wait_for_timeout(300)

    open_wire()
    check(get("order_field_wire_step") == "11" and choices() == 3 and "Cobalt blue" in wire_text(), "debrief at the niche: step 11 with 3 replies")
    answer_first()
    check(get("order_field_wire_step") == "13" and "SEALS 2 / 5 · [D] + [F] = 24" in wire_text() and choices() == 3,
          "step 12 records Seals 2 / 5, then first light at the Monolith (step 13) opens")

    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(get("order_field_wire_step") == "13" and text.count("He is her Servant") == 1 and "Two seals of five" in text
          and text.count("First light, Silvia") == 1, "reload replays steps 9-13 once each")
    check("Four seals to find" in text and "SEALS 1 / 5 · CROSSING" in text, "replayed crossing keeps the seal count Hermes had at the gates")
    js("window.openSunMonolithModal()"); page.wait_for_timeout(400)
    check(js("document.getElementById('monolith-telem-marks').innerText") == "4 / 4", "monolith restores its solved state")
    check(not errors, "no JS errors during Station 14", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def solve_escape(level, reach):
    """Shortest list of moves (dx, dy) out of the labyrinth, by search over (square, turn mod period).
    Independent of the page's own code: it only reads the level and the torch rule."""
    from collections import deque
    from math import gcd
    cols, rows = level["cols"], level["rows"]
    bits = lambda x, y: int(level["walls"][y][x], 16)
    dirs = {(0, -1): 1, (1, 0): 2, (0, 1): 4, (-1, 0): 8}
    guards = [[tuple(c) for c in g] for g in level["guards"]]
    period = 1
    for g in guards:
        period = period * len(g) // gcd(period, len(g))

    def lit(t):
        out = set()
        for g in guards:
            (x, y), (nx, ny) = g[t % len(g)], g[(t + 1) % len(g)]
            out.add((x, y))
            d = (nx - x, ny - y)
            for _ in range(reach):
                if d not in dirs or bits(x, y) & dirs[d]:
                    break
                x, y = x + d[0], y + d[1]
                out.add((x, y))
        return out

    start, goal = tuple(level["start"]), tuple(level["exit"])
    prev, queue = {(start, 0): None}, deque([(start, 0)])
    while queue:
        (x, y), t = queue.popleft()
        if (x, y) == goal:
            moves, node = [], ((x, y), t)
            while prev[node]:
                before = prev[node]
                moves.append((node[0][0] - before[0][0], node[0][1] - before[0][1]))
                node = before
            return moves[::-1]
        for d in list(dirs) + [(0, 0)]:
            if d != (0, 0) and bits(x, y) & dirs[d]:
                continue
            n = (x + d[0], y + d[1])
            if not (0 <= n[0] < cols and 0 <= n[1] < rows) or n in lit(t) or n in lit((t + 1) % period):
                continue
            state = (n, (t + 1) % period)
            if state not in prev:
                prev[state] = ((x, y), t)
                queue.append(state)
    return None


def test_sandstone_labyrinth(browser):
    print("\n6. Station 15 · The Sandstone Labyrinth, end to end")
    seed = dict(DESERT_BASE, **DESERT_DONE, order_sun_monolith_completed="true", order_sun_monolith_awake="true",
                order_seal_cairn_2="true", order_monolith_gate_seal1="true",
                order_field_wire_step="12", order_field_wire_choices="[2,0,1,0,0,0,1,0,0,0,0,0]")
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-sandstone-labyrinth')).display") != "none"
    choices = lambda: js("[...document.querySelectorAll('#wire-choices-grid button')].length")
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def answer_first():
        js("document.querySelector('#wire-choices-grid button').click()")
        page.wait_for_timeout(9000)

    open_wire()
    check(get("order_field_wire_step") == "13" and choices() == 3 and "Their north is our south" in wire_text(),
          "first light at the Monolith: step 13 with 3 replies (south-up charts)")
    js("window.selectDesertStation(24)"); page.wait_for_timeout(500)
    check(not modal_open(), "labyrinth sealed before Hermes sets out")
    open_wire(); answer_first()
    check(get("order_field_wire_step") == "14" and get("order_labyrinth_march_start") and "SEALS 2 / 5 · DOWN TO THE SANDSTONE" in wire_text(),
          "reply at first light starts the 6-hour walk")
    js("window.selectDesertStation(24)"); page.wait_for_timeout(500)
    check(not modal_open(), "labyrinth sealed during the walk")

    js("localStorage.setItem('order_labyrinth_march_start', String(Date.now() - 7 * 3600 * 1000))")
    js("window.openLabyrinthModal()"); page.wait_for_timeout(500)
    check(modal_open() and js("document.querySelector('#laby-game .monolith-game-inner').inert") is True,
          "after 6 h it opens, escape locked until the sigil")
    for word in ["WINDROWS", "ROSEWIND", "WIND ROSE X"]:
        page.fill("#laby-key-input", word); page.click("#btn-laby-speak"); page.wait_for_timeout(120)
    check(get("order_labyrinth_hint") == "true" and get("order_labyrinth_awake") is None, "3 wrong sigils unlock the hint, plate stays shut")
    page.fill("#laby-key-input", " wind-rose "); page.click("#btn-laby-speak"); page.wait_for_timeout(250)
    check(get("order_labyrinth_awake") == "true", "forgiving sigil 'wind-rose' opens the copper plate")

    level = js("window.__labyrinth.level")
    reach = js("window.__labyrinth.reach")
    moves = solve_escape(level, reach)
    check(moves is not None and len(moves) >= 45, "the escape is solvable and long", f"{len(moves) if moves else None} moves")

    for _ in range(12):
        js("window.__labyrinth.step(0, 0)")
    st = js("window.__labyrinth.state()")
    check(st["lives"] == 3 and st["moves"] == 12, "holding still at the cairn is safe", str(st))

    # The shortest road that ignores the torches gets Hermes caught
    page.reload(); page.wait_for_timeout(2500)
    js("window.openLabyrinthModal()"); page.wait_for_timeout(400)
    for dx, dy in solve_escape(dict(level, guards=[]), reach):
        js(f"window.__labyrinth.step({dx}, {dy})")
    check(int(get("order_labyrinth_captures") or 0) >= 1, "the road that ignores the torches gets caught",
          f"captures={get('order_labyrinth_captures')}")
    js("""['order_sandstone_labyrinth_completed', 'order_seal_cairn_3', 'order_labyrinth_star_seen', 'order_labyrinth_camp_seen',
          'order_labyrinth_captures', 'order_labyrinth_torch_hint'].forEach(k => localStorage.removeItem(k))""")

    page.reload(); page.wait_for_timeout(2500)
    js("window.openLabyrinthModal()"); page.wait_for_timeout(400)
    for dx, dy in moves:
        js(f"window.__labyrinth.step({dx}, {dy})")
    check(get("order_sandstone_labyrinth_completed") == "true" and get("order_seal_cairn_3") == "true",
          "the verified route escapes: Seal of Cairn III granted")
    check(get("order_labyrinth_star_seen") == "true" and get("order_labyrinth_camp_seen") == "true", "the route passes the gold star and the camp")
    check(js("window.__labyrinth.state().lives") == 3, "the verified route takes no close calls")
    page.click("#btn-close-labyrinth"); page.wait_for_timeout(300)

    js("document.querySelector('[data-view=\"view-cipher\"]').click()"); page.wait_for_timeout(500)
    ids = js("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id)")
    check("eq-item-cairn3-wa" in ids and "eq-item-cairn3-ne" in ids, "Ledger shows [W] + [A] = 26 and [N] − [E] = 9")

    open_wire()
    check(get("order_field_wire_step") == "15" and choices() == 3 and "gold leaf" in wire_text(), "debrief: step 15 with the gold star and 3 replies")
    answer_first()
    bar = js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")
    check(get("order_field_wire_step") == "16" and "Seals 3 / 5" in bar, "step 16 shows Seals 3 / 5", bar)
    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(text.count("First light, Silvia") == 1 and text.count("I am out, Silvia") == 1 and "Three seals of five" in text,
          "reload replays steps 13-16 once each")
    check(not errors, "no JS errors during Station 15", "; ".join(sorted(set(errors))[:3]))
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
        test_sun_monolith(browser)
        test_sandstone_labyrinth(browser)
        browser.close()
    server.shutdown()

    print("\n" + ("✅ ALL GREEN: safe to deploy." if not failures else f"❌ {len(failures)} FAILED: do not deploy yet."))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
