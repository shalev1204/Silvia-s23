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
  7. Station 16 (Cairn IV): dusk scene, 18-hour crossing, sigil, the three verses decoded from the calls, Seal IV, relic, debrief.
  8. Station 17 (Arch of the Solstice): the October dawn solved by its own route search, the night signal, Seal V,
     the five-seal ceremony, relic and debrief.

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
    check(get("order_field_wire_step") == "17" and "SEALS 3 / 5 · [W] + [A] = 26" in wire_text() and choices() == 3,
          "step 16 records Seals 3 / 5, then dusk at the hardpan (step 17) opens")
    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(text.count("First light, Silvia") == 1 and text.count("I am out, Silvia") == 1 and "Three seals of five" in text
          and text.count("Dusk, Silvia") == 1, "reload replays steps 13-17 once each")
    check(not errors, "no JS errors during Station 15", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def decode_verse(calls):
    """The fissures a careful listener names for a verse: side of the pillar, and beats from call to echo × 5 paces.
    Built from the call data only, as the test can only see what the page plays."""
    return [c["side"] + str(c["d"]) for c in calls]


def test_cairn_four(browser):
    print("\n7. Station 16 · Cairn IV, the Song of the Pillars, end to end")
    seed = dict(DESERT_BASE, **DESERT_DONE, order_sun_monolith_completed="true", order_seal_cairn_2="true",
                order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
                order_cairn4_sound="off", order_field_wire_step="16",
                order_field_wire_choices="[2,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0]")
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-cairn-four')).display") != "none"
    choices = lambda: js("[...document.querySelectorAll('#wire-choices-grid button')].length")
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def answer_first():
        js("document.querySelector('#wire-choices-grid button').click()")
        page.wait_for_timeout(9000)

    open_wire()
    check(get("order_field_wire_step") == "17" and choices() == 3 and "veiled woman" in wire_text(), "dusk at the hardpan: step 17 with the shepherd and 3 replies")
    js("window.selectDesertStation(25)"); page.wait_for_timeout(500)
    check(not modal_open(), "Cairn IV sealed before Hermes sets out")
    open_wire(); answer_first()
    check(get("order_field_wire_step") == "18" and get("order_cairn4_march_start") and "ACROSS THE HARDPAN TO CAIRN IV (18 H)" in wire_text(),
          "reply at dusk starts the 18-hour crossing")
    js("window.selectDesertStation(25)"); page.wait_for_timeout(500)
    check(not modal_open(), "Cairn IV sealed during the crossing")

    js("localStorage.setItem('order_cairn4_march_start', String(Date.now() - 19 * 3600 * 1000))")
    js("window.openCairnFourModal()"); page.wait_for_timeout(500)
    check(modal_open() and js("document.querySelector('#pillars-game .monolith-game-inner').inert") is True, "after 18 h it opens, the song locked until the sigil")
    for word in ["RESOUNDS", "ROUNDES", "RE SOUN"]:
        page.fill("#pillars-key-input", word); page.click("#btn-pillars-speak"); page.wait_for_timeout(120)
    check(get("order_cairn4_hint") == "true" and get("order_cairn4_awake") is None, "3 wrong sigils unlock the hint, pillars stay mute")
    page.fill("#pillars-key-input", " re-sound "); page.click("#btn-pillars-speak"); page.wait_for_timeout(250)
    check(get("order_cairn4_awake") == "true", "forgiving sigil 're-sound' wakes the pillars")

    verses = js("window.__cairn4.verses")
    letters = js("window.__cairn4.letters")
    words = ["".join(letters[c["side"]][str(c["d"])] for c in v["calls"]) for v in verses]
    check(words == ["SUN", "ECHO", "STONE"], "the verses spell the founders' words", str(words))
    js("window.__cairn4.play()"); page.wait_for_timeout(1500)
    check("playing" in js("document.getElementById('pillars-tape-status').innerText"), "the wind plays verse I on the tape")
    # A wrong verse is refused and counted
    for fid in ["L35", "L45", "R25"]:
        js(f"window.__cairn4.mark('{fid}')")
    js("window.__cairn4.sing()")
    check(get("order_cairn4_verses") is None and "2 of 3" in js("document.getElementById('pillars-song-feedback').innerText"),
          "a wrong verse is refused (2 of 3 echoes rang true)")
    js("document.getElementById('btn-pillars-undo').click(); document.getElementById('btn-pillars-undo').click(); document.getElementById('btn-pillars-undo').click()")
    for i, v in enumerate(verses):
        for fid in decode_verse(v["calls"]):
            js(f"window.__cairn4.mark('{fid}')")
        js("window.__cairn4.sing()"); page.wait_for_timeout(200)
        if i < 2:
            check(get("order_cairn4_verses") == str(i + 1), f"verse {i + 1} rings true")
    check(get("order_cairn_iv_completed") == "true" and get("order_seal_cairn_4") == "true", "three verses sung: Seal of Cairn IV granted")
    check("tuning_pebble" in js("window.getOwnedRelicIds()"), "the Tuning Pebble is in the satchel")
    page.click("#btn-close-pillars"); page.wait_for_timeout(300)

    js("document.querySelector('[data-view=\"view-cipher\"]').click()"); page.wait_for_timeout(500)
    ids = js("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id)")
    check("eq-item-cairn4-sum" in ids and "eq-item-cairn4-diff" in ids, "Ledger shows [S] + [U] = 17 and [S] − [U] = 9")

    open_wire()
    check(get("order_field_wire_step") == "19" and choices() == 3 and "Toward Tower II" in wire_text(), "debrief: step 19 (the code, the pebble, the raiders) with 3 replies")
    answer_first()
    check(get("order_field_wire_step") == "21" and "SEALS 4 / 5 · [S] + [U] = 17" in wire_text() and choices() == 3,
          "step 20 records Seals 4 / 5, then dusk at Cairn IV (step 21) opens")
    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(text.count("Dusk, Silvia") == 1 and text.count("I have not slept") == 1 and "Four seals of five" in text
          and text.count("Dusk again, Silvia") == 1, "reload replays steps 17-21 once each")
    check(not errors, "no JS errors during Station 16", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def dawn_routes(court, col):
    """Every way the ray entering the arch at `col` can reach the altar: {mirror index: 'f' or 'b'}.
    Built only from the courtyard data the page exposes."""
    reflect = {"f": {(0, 1): (-1, 0), (0, -1): (1, 0), (1, 0): (0, -1), (-1, 0): (0, 1)},
               "b": {(0, 1): (1, 0), (0, -1): (-1, 0), (1, 0): (0, 1), (-1, 0): (0, -1)}}
    mirrors = {tuple(c): i for i, c in enumerate(court["mirrors"])}
    pillars = {tuple(c) for c in court["pillars"]}
    altar = tuple(court["altar"])
    out = []

    def go(x, y, d, assign, steps):
        while steps < 200:
            if not (0 <= x < court["cols"] and 0 <= y < court["rows"]):
                return
            if (x, y) == altar:
                out.append(dict(assign))
                return
            if (x, y) in pillars:
                return
            if (x, y) in mirrors:
                i = mirrors[(x, y)]
                if i in assign:
                    d = reflect[assign[i]][d]
                else:
                    for m in "fb":
                        assign[i] = m
                        nd = reflect[m][d]
                        go(x + nd[0], y + nd[1], nd, assign, steps + 1)
                        del assign[i]
                    return
            x, y = x + d[0], y + d[1]
            steps += 1

    go(col, 0, (0, 1), {}, 0)
    return out


def test_solstice_arch(browser):
    print("\n8. Station 17 · The Arch of the Solstice, end to end")
    seed = dict(DESERT_BASE, **DESERT_DONE, order_sun_monolith_completed="true", order_seal_cairn_2="true",
                order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
                order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_sound="off", order_field_wire_step="20",
                order_field_wire_choices="[2,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]")
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-solstice-arch')).display") != "none"
    choices = lambda: js("[...document.querySelectorAll('#wire-choices-grid button')].length")
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def answer_first():
        js("document.querySelector('#wire-choices-grid button').click()")
        page.wait_for_timeout(9000)

    open_wire()
    check(get("order_field_wire_step") == "21" and choices() == 3 and "midsummer" in wire_text(), "dusk at Cairn IV: step 21 (the October sun) with 3 replies")
    js("window.selectDesertStation(26)"); page.wait_for_timeout(500)
    check(not modal_open(), "the Arch sealed before Hermes sets out")
    open_wire(); answer_first()
    check(get("order_field_wire_step") == "22" and get("order_cairn5_march_start") and "EAST TO THE ARCH OF THE SOLSTICE (18 H)" in wire_text(),
          "reply at dusk starts the 18-hour walk")
    js("localStorage.setItem('order_cairn5_march_start', String(Date.now() - 19 * 3600 * 1000))")
    js("window.openSolsticeModal()"); page.wait_for_timeout(500)
    check(modal_open() and js("document.querySelector('#solstice-dawn-game .monolith-game-inner').inert") is True,
          "after 18 h it opens, the courtyard locked until the sigil")
    for word in ["DAYBREAKS", "BREAKDAY", "DAY BRAKE"]:
        page.fill("#solstice-key-input", word); page.click("#btn-solstice-speak"); page.wait_for_timeout(120)
    check(get("order_cairn5_hint") == "true" and get("order_cairn5_awake") is None, "3 wrong sigils unlock the hint, the altar stays closed")
    page.fill("#solstice-key-input", " day-break "); page.click("#btn-solstice-speak"); page.wait_for_timeout(250)
    check(get("order_cairn5_awake") == "true", "forgiving sigil 'day-break' wakes the altar")

    court = js("window.__cairn5.court")
    routes = [dawn_routes(court, col) for col in court["entries"]]
    check(all(len(r) == 1 for r in routes), "every ray of the October dawn has exactly one route", str([len(r) for r in routes]))

    def aim(route):
        current = js("window.__cairn5.mirrors()")
        for i, m in route.items():
            if current[i] != m:
                js(f"window.__cairn5.turn({i})")

    # a dawn that runs out is spent and keeps the mirrors
    js("window.__cairn5.startDawn()"); js("window.__cairn5.expireStep()"); page.wait_for_timeout(300)
    check(not js("window.__cairn5.state().running") and get("order_cairn5_dawn_fails") == "1", "a dawn that runs out is spent")
    js("window.__cairn5.startDawn()")
    for k, r in enumerate(routes):
        aim(r[0])
        page.wait_for_timeout(150)
    st = js("window.__cairn5.state()")
    check(st["dawnDone"] and get("order_cairn5_dawn_done") == "true", "four rays reach the altar: the ring closes its four locks", str(st))

    rounds = js("window.__cairn5.rounds")
    js("window.__cairn5.flash('L')"); js("window.__cairn5.send()")
    check(get("order_cairn5_signal_round") is None and get("order_cairn5_signal_fails") == "1", "a wrong answer to the light is refused")
    for pattern in rounds:
        for p in pattern:
            js(f"window.__cairn5.flash('{p}')")
        js("window.__cairn5.send()"); page.wait_for_timeout(200)
    check(rounds[-1] == "SSSLL" and js("window.__cairn5.state().finale"), "the last signal is the disc's code: three short, two long")
    page.wait_for_timeout(16000)
    check(get("order_arch_solstice_completed") == "true" and get("order_seal_cairn_5") == "true", "the light speaks and goes out: Seal of Cairn V granted")
    page.wait_for_timeout(1200)
    check(js("getComputedStyle(document.getElementById('five-seals-overlay')).display") != "none" and get("order_five_seals_celebrated") == "true",
          "the five seals come home (ceremony)")
    check("signal_mirror" in js("window.getOwnedRelicIds()"), "the Signal Mirror is in the satchel")
    page.click("#btn-five-seals-close"); page.click("#btn-close-solstice"); page.wait_for_timeout(300)

    js("document.querySelector('[data-view=\"view-cipher\"]').click()"); page.wait_for_timeout(500)
    ids = js("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id)")
    check("eq-item-cairn5-yo" in ids and "eq-item-cairn5-lg" in ids, "Ledger shows [Y] − [O] = 2 and [L] + [G] = 23")

    open_wire()
    check(get("order_field_wire_step") == "23" and choices() == 3 and "smoke" in wire_text(), "debrief: step 23 (the light, the smoke) with 3 replies")
    answer_first()
    bar = js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")
    check(get("order_field_wire_step") == "24" and "Seals 5 / 5" in bar, "step 24 shows Seals 5 / 5", bar)
    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(text.count("Dusk again, Silvia") == 1 and text.count("it is dawn again and I have not slept") == 1 and "Five seals of five" in text,
          "reload replays steps 21-24 once each")
    check(not errors, "no JS errors during Station 17", "; ".join(sorted(set(errors))[:3]))
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
        test_cairn_four(browser)
        test_solstice_arch(browser)
        browser.close()
    server.shutdown()

    print("\n" + ("✅ ALL GREEN: safe to deploy." if not failures else f"❌ {len(failures)} FAILED: do not deploy yet."))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
