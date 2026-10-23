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
     the five-seal ceremony, relic and debrief; a reload during the finale cannot strand the station.
  9. Station 18 (The Polybius Stele): noon scene, 6-hour walk, proverb, the knocks decoded here from the grid and
     the Law of the Inverted Mirage, the burning atrium solved by its own search, relic, Ledger and debrief.
 10. Station 19 (The Oracle's Horizon): the inner stair, sigil, the disc set by the sky and read from the north,
     the WHEN, the vow, the passage to the Stage Path, Ledger and debrief; without Cairn I the audience waits.
 11. Each seeker keeps their own adventure when the profile changes (Carles and Silvia).
 12. Carles's "Play this game" puts the world at the arrival of any game, forward or back, and opens it.
 13. The Stage Path: hidden until Station 19, then the Living Mirror (rooms, keyboard, fragments, the WHERE when whole).
 14. Station 20 (The Gate of a Thousand Masks): departure, 18-hour crossing, word, drawing by hand, Fragment I, debrief.
 15. Cloud save (against a fake Supabase): snapshot and events on every change, recovery in an empty browser,
     nothing sent while the cloud is unreachable or on a local copy, a profile switch is not reported as progress.
 16. Hint ladder: hints climb with time on screen (not off it), stay in Ask Hermes, and a tester reset clears them.
 17. Early hints: Stations 10 to 13 and Cairn I count their misses and show Hermes's first note after three.
 18. «Previously on…»: after 12 hours away the recap tells the last thing, where things stand and what next; Ask Hermes keeps it.
 19. Hermes's Field Notebook: a dated page per solved game (misses, notes, time since arrival, rewards); resets tear it out.
 20. Stage Path pauses: after a fragment the next room says when it opens, on its card, at its door and on the Field Wire.
 21. Ambient sound: a synthesized bed per station game, silence on the map, a speaker that mutes it and remembers.
 22. The clues of the Ashes: after Station 20 a gilded feather on the Living Mirror, a line from an unknown sender on the
     Field Wire, and the notebook keeps when each was first seen.
 23. The Mirror Speaker: once a room's door opens, a line in mirror writing answers how Silvia solved the room before
     (hour, misses and notes, pace, tone on the wire); it is kept, turns round on a tap, and waits out a pause.
 24. Aurelia's Letters: three letters of 1970 and 1971 in Chronicles, one with each sketchbook; a wax seal to break and
     Hermes's answer on the Field Wire at the step where she read it.
 25. The journey profile for the ending: tone, days on the road, rooms, notes, favourite hour, the name she gave Hermes
     and the object she chose (scripts/audit/journey_report.py prints it for Silvia's saved journey).
 26. The seals of the Stage Path sheets: the QR on each game face is the key of its room; the card, the door and the
     Field Wire ask for it, a scanned code opens the room and leaves the address, a wrong one is refused.
 27. Accessibility: in every view and station window, the keyboard reaches all the mouse can click and shows where it
     is, text contrast is WCAG AA (read against the painted parchment), the windows hold and return the focus and close
     on Escape, and on a touch screen every control answers a finger within 44 px.
 28. Offline: the first visit keeps the whole Hub, a game is kept once opened, and with the server down and no signal
     the Hub opens every view and the game plays; a new version waits and comes in the next time the Hub is opened;
     the cloud save keeps a change on the device and sends it when the signal returns.

Setup (once):  pip install -r scripts/requirements.txt && python3 -m playwright install chromium
Run:           python3 scripts/audit/web_smoke.py            (exit code 0 = all green)
Options:       --chromium /path/to/chrome   use a specific browser binary
               --quick                      short pass before each commit (no long desert games)
               --only s20,mirror            run only these sections (keys in SECTIONS)
               --jobs N                     sections run in parallel, one browser per process (default 2; more chokes)
Each run writes scripts/audit/smoke_report.json (per section: result, seconds, failures); git ignores it.
"""

import argparse
import concurrent.futures
import contextlib
import datetime
import functools
import glob
import http.server
import io
import json
import multiprocessing
import os
import sys
import threading
import time
import traceback

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


def start_server(port=PORT, override=None):
    """Serves web/; `override` maps a path to the bytes served instead (the offline section's next version)."""
    headers = read_headers()

    class Handler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            body = (override or {}).get(self.path.split("?")[0])
            if body is None:
                return super().do_GET()
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

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

    class Server(http.server.ThreadingHTTPServer):
        request_queue_size = 256  # the default backlog of 5 refuses connections when several browsers load at once

    server = Server(("127.0.0.1", port), functools.partial(Handler, directory=WEB))
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
    check(get("order_hint_s14-sigil_level") == "1" and get("order_monolith_hint") is None
          and "note 1 of 3" in js("document.querySelector('#monolith-key-feedback + .hint-ladder').textContent"),
          "3 wrong sigils: Hermes's first note under the Monolith")
    for word in ["SUNDAY", "DIALSUN", "SUN DIAL X"]:
        page.fill("#monolith-key-input", word); page.click("#btn-monolith-speak"); page.wait_for_timeout(120)
    check(get("order_monolith_hint") == "true" and get("order_sun_monolith_awake") is None, "6 wrong sigils unlock the older hint, stone stays asleep")
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
    js("window.__sunMonolith.setMinute(720)"); page.click("#btn-monolith-mark")
    check(get("order_hint_s14-shadow_level") == "1" and get("order_hint_s14-shadow_fails") == "3"
          and "note 1 of 3" in js("document.querySelector('#monolith-mark-feedback + .hint-ladder').textContent"),
          "3 wrong marks (sand does not count): Hermes's first note under the dial")
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
    check(get("order_hint_s15-sigil_level") == "1" and get("order_labyrinth_hint") is None
          and "note 1 of 3" in js("document.querySelector('#laby-key-feedback + .hint-ladder').textContent"),
          "3 wrong sigils: Hermes's first note under the copper plate")
    for word in ["WINDROWS", "ROSEWIND", "WIND ROSE X"]:
        page.fill("#laby-key-input", word); page.click("#btn-laby-speak"); page.wait_for_timeout(120)
    check(get("order_labyrinth_hint") == "true" and get("order_labyrinth_awake") is None, "6 wrong sigils unlock the older hint, plate stays shut")
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
    check(get("order_hint_s15-torches_fails") == get("order_labyrinth_captures"), "every close call climbs Hermes's notes on the torches")
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
    check(get("order_hint_s16-sigil_level") == "1" and get("order_cairn4_hint") is None
          and "note 1 of 3" in js("document.querySelector('#pillars-key-feedback + .hint-ladder').textContent"),
          "3 wrong sigils: Hermes's first note under the pillars")
    for word in ["RESOUNDS", "ROUNDES", "RE SOUN"]:
        page.fill("#pillars-key-input", word); page.click("#btn-pillars-speak"); page.wait_for_timeout(120)
    check(get("order_cairn4_hint") == "true" and get("order_cairn4_awake") is None, "6 wrong sigils unlock the older hint, pillars stay mute")
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
    for _ in range(5):
        js("window.__cairn4.sing()")
    check(get("order_cairn4_count_hint") == "true" and get("order_hint_s16-song_level") == "2"
          and js("getComputedStyle(document.getElementById('pillars-hint')).display") != "none",
          "6 wrong verses: Hermes numbers the beats on the tape")
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
    check(get("order_hint_s17-sigil_level") == "1" and get("order_cairn5_hint") is None
          and "note 1 of 3" in js("document.querySelector('#solstice-key-feedback + .hint-ladder').textContent"),
          "3 wrong sigils: Hermes's first note under the altar")
    for word in ["DAYBREAKS", "BREAKDAY", "DAY BRAKE"]:
        page.fill("#solstice-key-input", word); page.click("#btn-solstice-speak"); page.wait_for_timeout(120)
    check(get("order_cairn5_hint") == "true" and get("order_cairn5_awake") is None, "6 wrong sigils unlock the older hint, the altar stays closed")
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
    def spend(n):
        for _ in range(n):
            js("window.__cairn5.startDawn()"); js("window.__cairn5.expireStep()"); page.wait_for_timeout(150)
    spend(2)
    check(get("order_hint_s17-dawn_level") == "1" and get("order_cairn5_dawn_hint") is None, "3 spent dawns: Hermes's first note, the rays not yet slower")
    spend(3)
    for _ in range(20):   # the note is drawn on the next frame: slower when the machine is busy
        if "45 seconds" in js("document.getElementById('solstice-hint').textContent"):
            break
        page.wait_for_timeout(150)
    check(get("order_cairn5_dawn_hint") == "true" and "45 seconds" in js("document.getElementById('solstice-hint').textContent"),
          "6 spent dawns: each ray waits 45 seconds")
    js("window.__cairn5.startDawn()")
    for k, r in enumerate(routes):
        aim(r[0])
        page.wait_for_timeout(150)
    st = js("window.__cairn5.state()")
    check(st["dawnDone"] and get("order_cairn5_dawn_done") == "true", "four rays reach the altar: the ring closes its four locks", str(st))

    rounds = js("window.__cairn5.rounds")
    js("window.__cairn5.flash('L')"); js("window.__cairn5.send()")
    check(get("order_cairn5_signal_round") is None and get("order_cairn5_signal_fails") == "1", "a wrong answer to the light is refused")
    for _ in range(5):
        js("window.__cairn5.flash('L')"); js("window.__cairn5.send()")
    check(get("order_cairn5_signal_hint") == "true" and get("order_hint_s17-signal_level") == "2", "6 wrong answers: Hermes writes the pattern in his log")
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
    check(get("order_field_wire_step") == "25" and "SEALS 5 / 5 · [Y] − [O] = 2" in wire_text() and choices() == 3,
          "step 24 records Seals 5 / 5, and noon under the Arch (step 25) follows with 3 replies")
    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(text.count("Dusk again, Silvia") == 1 and text.count("it is dawn again and I have not slept") == 1 and "Five seals of five" in text
          and text.count("I meant to leave at dawn") == 1, "reload replays steps 21-25 once each")
    check(not errors, "no JS errors during Station 17", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    # A reload in the middle of the finale (last signal answered, light still speaking) finishes the station
    stuck = dict(seed, order_cairn5_awake="true", order_cairn5_dawn_done="true", order_cairn5_signal_round="4",
                 order_cairn5_march_bypassed="true", order_field_wire_step="22")
    ctx, page, errors = new_page(browser, stuck)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    check(page.evaluate("localStorage.getItem('order_arch_solstice_completed')") == "true" and not errors,
          "a reload during the finale finishes the station instead of stranding it", "; ".join(errors[:2]))
    ctx.close()


def atrium_search(atrium):
    """Every fact about the burning atrium, worked out from its map alone (independent of the page's code):
    the shortest crossing, and whether every crossing in time walks on ash. Fire: a fuel flagstone catches
    at its distance from the library through fuel, burns for `burn` turns, then is ash."""
    from collections import deque
    rows, burn, limit = atrium["map"], atrium["burn"], atrium["breath"]
    H, W = len(rows), len(rows[0])
    cell = lambda x, y: rows[y][x] if 0 <= x < W and 0 <= y < H else None
    ig, queue = {}, deque()
    for y in range(H):
        for x in range(W):
            if cell(x, y) == "L":
                ig[(x, y)] = 0
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0)):
            n = (x + dx, y + dy)
            if cell(*n) == "f" and n not in ig:
                ig[n] = ig[(x, y)] + 1
                queue.append(n)
    burning = lambda p, t: cell(*p) == "L" or (cell(*p) == "f" and p in ig and ig[p] <= t < ig[p] + burn)
    ash = lambda p, t: cell(*p) == "f" and p in ig and t >= ig[p] + burn
    ok = lambda p: cell(*p) not in (None, "#", "L")
    start, goal = tuple(atrium["start"]), tuple(atrium["hatch"])
    steps = ((0, -1), (1, 0), (0, 1), (-1, 0), (0, 0))
    # shortest crossing, with the moves
    prev, queue = {(start, 0): None}, deque([(start, 0)])
    best = None
    while queue:
        p, t = queue.popleft()
        if p == goal:
            best, node = [], (p, t)
            while prev[node]:
                b = prev[node]
                best.append((node[0][0] - b[0][0], node[0][1] - b[0][1]))
                node = b
            best.reverse()
            break
        if t >= limit:
            continue
        for dx, dy in steps:
            n = (p[0] + dx, p[1] + dy)
            if ok(n) and not burning(n, t + 1) and (n, t + 1) not in prev:
                prev[(n, t + 1)] = (p, t)
                queue.append((n, t + 1))
    # is there any crossing in time that never steps on ash? (search over square × turn, ash forbidden)
    seen, queue, dodge = {(start, 0)}, deque([(start, 0)]), False
    while queue:
        p, t = queue.popleft()
        if p == goal:
            dodge = True
            break
        if t >= limit:
            continue
        for dx, dy in steps:
            n = (p[0] + dx, p[1] + dy)
            if ok(n) and not burning(n, t + 1) and not ash(n, t + 1) and (n, t + 1) not in seen:
                seen.add((n, t + 1))
                queue.append((n, t + 1))
    return best, dodge


def test_polybius_stele(browser):
    print("\n9. Station 18 · The Polybius Stele (Tower II in flames), end to end")
    seed = dict(DESERT_BASE, **DESERT_DONE, order_sun_monolith_completed="true", order_seal_cairn_2="true",
                order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
                order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_sound="off",
                order_arch_solstice_completed="true", order_seal_cairn_5="true", order_five_seals_celebrated="true",
                order_cairn5_seals_at_altar="5", order_stele_sound="off", order_field_wire_step="24",
                order_field_wire_choices="[2,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]")
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-polybius-stele')).display") != "none"
    choices = lambda: js("[...document.querySelectorAll('#wire-choices-grid button')].length")
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def answer_first():
        js("document.querySelector('#wire-choices-grid button').click()")
        page.wait_for_timeout(9000)

    open_wire()
    check(get("order_field_wire_step") == "25" and choices() == 3 and "black tree" in wire_text(), "noon under the Arch: step 25 (the smoke) with 3 replies")
    js("window.selectDesertStation(13)"); page.wait_for_timeout(500)
    check(not modal_open(), "Tower II sealed before Hermes sets out")
    open_wire(); answer_first()
    check(get("order_field_wire_step") == "26" and get("order_stele_march_start") and "TO TOWER II, TOWARD THE SMOKE (6 H)" in wire_text(),
          "reply at noon starts the 6-hour walk")
    js("window.selectDesertStation(13)"); page.wait_for_timeout(500)
    check(not modal_open(), "still sealed while Hermes walks")
    js("localStorage.setItem('order_stele_march_start', String(Date.now() - 7 * 3600 * 1000))")
    js("window.openSteleModal()"); page.wait_for_timeout(500)
    check(modal_open() and js("document.querySelector('#stele-knock-game .monolith-game-inner').inert") is True
          and js("document.querySelector('#stele-fire-game .monolith-game-inner').inert") is True,
          "after 6 h it opens, the knocks and the atrium locked until the proverb")
    wrong = ["STARS GUIDE THOSE WHO SEEK", "STARS GUIDE THOSE WHO SEEK TRUTHS", "GUIDE STARS THOSE WHO SEEK TRUTH"]
    for words in wrong:
        page.fill("#stele-key-input", words); page.click("#btn-stele-speak"); page.wait_for_timeout(120)
    check(get("order_hint_s18-proverb_level") == "1" and get("order_stele_hint") is None
          and "note 1 of 3" in js("document.querySelector('#stele-key-feedback + .hint-ladder').textContent"),
          "3 wrong proverbs: Hermes's first note under the stele")
    for words in wrong:
        page.fill("#stele-key-input", words); page.click("#btn-stele-speak"); page.wait_for_timeout(120)
    check(get("order_stele_hint") == "true" and get("order_stele_awake") is None, "6 wrong proverbs unlock the older hint, the stele stays still")
    page.fill("#stele-key-input", "stars, guide those who seek truth!"); page.click("#btn-stele-speak"); page.wait_for_timeout(300)
    check(get("order_stele_awake") == "true" and "348" in js("document.getElementById('stele-telem-proverb').innerText"),
          "the proverb (any case and punctuation) turns the stele: 348° NNW")

    # The knocks, decoded here from the grid of Sheet 17A and the Law of the Inverted Mirage
    grid = js("window.__stele.grid")
    stanzas = js("window.__stele.stanzas")
    check(grid == "PHOENIXABCDFGKLMQRSTUVWYZ" and [s["word"] for s in stanzas] == ["WHO", "SEEK", "WELL", "ASH"],
          "the grid of the stele (PHOENIX, no J) and the four stanzas")

    def knocks(word, moon):
        out = []
        for ch in word:
            k = grid.index(ch)
            row, col = k // 5 + 1, k % 5 + 1
            out += [col, row] if moon else [row, col]
        return out

    check(js("window.__stele.knocksOf('ASH', true)") == knocks("ASH", True) == [3, 2, 4, 4, 2, 1],
          "the page knocks ASH as the mirage says: column first in an even stanza")
    page.wait_for_timeout(1800)
    check(js("window.__stele.state().playing") is True, "the Servant starts knocking as soon as the stele turns")
    for _ in range(40):
        if not js("window.__stele.state().playing"):
            break
        page.wait_for_timeout(500)
    tape = js("[...document.querySelectorAll('#stele-tape .stele-group')].map(g => g.children.length)")
    check(tape == knocks("WHO", False), "every knock of WHO is chalked on the floor (5·3 1·2 1·3)", str(tape))
    js("window.__stele.read('LID')")
    check(get("order_stele_knock_fails") == "1" and "other reading" in js("document.getElementById('stele-knock-feedback').innerText"),
          "reading stanza I through the mirage (LID) is refused with a pointer to the law")
    js("window.__stele.read('who')")
    check(js("window.__stele.state().knocks") == 1 and js("getComputedStyle(document.getElementById('stele-reply-panel')).display") != "none",
          "WHO understood: now it is Silvia's stanza")
    js(f"window.__stele.answer({json.dumps(knocks('SEEK', False))})")
    check(js("window.__stele.state().knocks") == 1 and "not in the order" in js("document.getElementById('stele-knock-feedback').innerText"),
          "SEEK knocked without the mirage is not understood")
    js(f"window.__stele.answer({json.dumps(knocks('HERMES', True))})")
    check(js("window.__stele.state().knocks") == 1 and get("order_hint_s18-knocks_level") == "1" and get("order_stele_knock_hint") is None,
          "a third miss (his name): Hermes's first note, not yet the law")
    # the real knock pad: Knock, Pause, Knock... then Send
    js("window.__stele.stop()")
    for i, count in enumerate(knocks("SEEK", True)):
        for _ in range(count):
            page.click("#btn-stele-knock")
        page.click("#btn-stele-pause")
    page.click("#btn-stele-send")
    for _ in range(40):
        if js("window.__stele.state().knocks") == 2:
            break
        page.wait_for_timeout(500)
    check(js("window.__stele.state().knocks") == 2, "SEEK knocked on the pad, column first: Hermes knocks it, and he understood")
    js("window.__stele.stop()")
    page.wait_for_timeout(2500)
    check(js("window.__stele.state().playing") is True, "the Servant knocks WELL on his own")
    js("window.__stele.read('WELL')")   # read before he has finished: the next stanza still starts by itself
    for _ in range(12):   # ASH starts 1.6 s later (polled: a busy machine can delay the timer)
        page.wait_for_timeout(400)
        if js("window.__stele.state().playing"):
            break
    check(js("window.__stele.state().playing") is True and js("document.querySelectorAll('#stele-tape .stele-group').length") <= 6,
          "WELL read early: the old knocks stop and ASH starts on its own")
    js("window.__stele.stop()")
    js("window.__stele.read('FSI')")
    check(js("window.__stele.state().knocks") == 3 and get("order_stele_knock_fails") == "4", "WELL read; ASH read without the mirage (FSI) is refused")
    js("window.__stele.read('ASK')"); js("window.__stele.read('ASP')")
    check(get("order_stele_knock_hint") == "true" and get("order_hint_s18-knocks_level") == "2", "6 misses copy the law beside the stone")
    js("window.__stele.read('ash')")
    st = js("window.__stele.state()")
    check(st["knocks"] == 4 and st["run"] == {"x": 4, "y": 8, "t": 0} and js("document.querySelector('#stele-fire-game .monolith-game-inner').inert") is False,
          "ASH: the burning atrium opens, Hermes at the side door")

    # The burning atrium, solved by its own search
    atrium = js("window.__stele.atrium")
    moves, dodge = atrium_search(atrium)
    check(moves is not None and len(moves) == 13 and atrium["breath"] == 15, "the shortest crossing takes 13 turns; the Servant holds on for 15",
          str(len(moves) if moves else None))
    check(not dodge, "no crossing in time avoids the ash")
    run = lambda: js("window.__stele.state().run")
    # waiting at the side door forever: the Servant runs out of breath
    for _ in range(15):
        js("window.__stele.move(0, 0)")
    check(run() == {"x": 4, "y": 8, "t": 0} and get("order_stele_fire_fails") == "1" and "Too slow" in js("document.getElementById('stele-move-feedback').innerText"),
          "holding still for 15 turns: too slow, back to the side door")
    # three steps north and a pause: the flagstone to the west is burning now and next turn, so it is refused
    for d in ((0, -1), (0, -1), (0, -1), (0, 0)):
        js(f"window.__stele.move({d[0]}, {d[1]})")
    js("window.__stele.move(-1, 0)")
    check(run() == {"x": 4, "y": 5, "t": 4} and "burning" in js("document.getElementById('stele-move-feedback').innerText"),
          "a burning flagstone cannot be entered")
    js("window.__stele.move(0, 0)")
    check(run()["t"] == 0 and get("order_stele_fire_fails") == "2", "standing on the mats as the fire arrives: caught")
    def caught():   # one step north, then wait on the mats until the fire takes Hermes
        js("window.__stele.move(0, -1)")
        for _ in range(6):
            js("window.__stele.move(0, 0)")
    caught()
    check(get("order_stele_fire_fails") == "3" and get("order_hint_s18-fire_level") == "1" and get("order_stele_fire_hint") is None,
          "three failed crossings: Hermes's first note, the flagstones not yet numbered")
    for _ in range(3):
        caught()
    check(get("order_stele_fire_fails") == "6" and get("order_stele_fire_hint") == "true" and js("[...document.querySelectorAll('#stele-atrium text')].length") > 10,
          "six failed crossings: every flagstone shows when it catches")
    for dx, dy in moves:
        js(f"window.__stele.move({dx}, {dy})")
    page.wait_for_timeout(500)
    check(get("order_polybius_stele_completed") == "true", "the searched route reaches the hatch: the Servant is alive")
    check("servant_key" in js("window.getOwnedRelicIds()"), "the Servant's Key is in the satchel")
    check(js("getComputedStyle(document.getElementById('stele-victory')).display") != "none", "the victory card shows")
    page.click("#btn-close-stele"); page.wait_for_timeout(300)

    js("document.querySelector('[data-view=\"view-cipher\"]').click()"); page.wait_for_timeout(500)
    ids = js("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id)")
    check("eq-item-stele-hu" in ids and "eq-item-stele-mt" in ids, "Ledger shows [H] − [U] = 16 and [M] + [T] = 25")

    open_wire()
    text = wire_text()
    check(get("order_field_wire_step") == "27" and choices() == 3 and "edge of the sky with a disc in her arms" in text,
          "debrief: step 27 (the Servant's words) with 3 replies")
    answer_first()
    check(get("order_field_wire_step") == "29" and "[H] − [U] = 16" in wire_text() and "with the five seals, she will receive you" in wire_text()
          and choices() == 3 and "mint tea" in wire_text(), "step 28: the equations, the key, then dawn at the inner stair (step 29)")
    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(text.count("I meant to leave at dawn") == 1 and text.count("he is alive. He is sitting next to me") == 1 and text.count("mint tea") == 1,
          "reload replays steps 25-29 once each")
    check(not errors, "no JS errors during Station 18", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


ORACLE_SEED_EXTRA = dict(order_sun_monolith_completed="true", order_seal_cairn_2="true",
                         order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
                         order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_sound="off",
                         order_arch_solstice_completed="true", order_seal_cairn_5="true", order_five_seals_celebrated="true",
                         order_cairn5_seals_at_altar="5", order_polybius_stele_completed="true", order_stele_awake="true",
                         order_stele_knocks="4", order_stele_march_start="1", order_stele_seals_at_well="5",
                         order_field_wire_step="28", order_field_wire_choices=json.dumps([2, 0, 1, 0] + [0] * 24))


def test_oracle_horizon(browser):
    print("\n10. Station 19 · The Oracle's Horizon, end to end")
    seed = dict(DESERT_BASE, **DESERT_DONE, **ORACLE_SEED_EXTRA)
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-oracle-horizon')).display") != "none"
    choices = lambda: js("[...document.querySelectorAll('#wire-choices-grid button')].length")
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")
    feedback = lambda node: js(f"document.getElementById('{node}').innerText")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def answer_first():
        js("document.querySelector('#wire-choices-grid button').click()")
        page.wait_for_timeout(9000)

    open_wire()
    check(get("order_field_wire_step") == "29" and choices() == 3 and "mint tea" in wire_text(), "dawn at the inner stair: step 29 with 3 replies")
    js("window.selectDesertStation(14)"); page.wait_for_timeout(500)
    check(not modal_open(), "the Oracle's door stays shut before Silvia answers")
    open_wire(); answer_first()
    bar = js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")
    check(get("order_field_wire_step") == "30" and "DOWN THE INNER STAIR" in wire_text() and "Station 19 Awaits" in bar,
          "the answer sends Hermes down the stair: Station 19 awaits", bar)
    js("window.openOracleModal()"); page.wait_for_timeout(500)
    check(modal_open() and js("document.querySelector('#oracle-disc-game .monolith-game-inner').inert") is True
          and js("document.querySelector('#oracle-vow-game .monolith-game-inner').inert") is True,
          "the chamber opens, the disc and the vow locked until the sigil")
    for word in ["OVERTURN", "OVERTUREE", "ORACLE"]:
        page.fill("#oracle-key-input", word); page.click("#btn-oracle-speak"); page.wait_for_timeout(120)
    check(get("order_hint_s19-sigil_level") == "1" and get("order_oracle_hint") is None, "3 wrong sigils bring Hermes's first note")
    for word in ["OVERTURN", "OVERTUREE", "ORACLE"]:
        page.fill("#oracle-key-input", word); page.click("#btn-oracle-speak"); page.wait_for_timeout(120)
    check(get("order_oracle_hint") == "true" and get("order_oracle_awake") is None, "6 wrong sigils open the Ask Hermes hint, the door stays shut")
    page.fill("#oracle-key-input", " over-ture "); page.click("#btn-oracle-speak"); page.wait_for_timeout(250)
    check(get("order_oracle_awake") == "true", "forgiving sigil 'over-ture' opens the inner chamber")

    # The disc, set by the sky the page draws: before dawn on 20 October at 30° N, Aldebaran stands in the west
    # (azimuth about 264°), Capella in the north-west (about 310°) and Polaris in the north
    sky = js("document.getElementById('oracle-sky').getAttribute('aria-label')")
    check("Aldebaran to the west" in sky and "Capella to the north-west" in sky and "Polaris to the north" in sky,
          "the sky card says where the three stars stand")
    sky_spoke = {"Aldebaran": 6, "Capella": 7, "Polaris": 0}
    stars = js("window.__oracle.stars")
    check(js("getComputedStyle(document.getElementById('oracle-read-panel')).display") == "none", "the disc cannot be read while it is crooked")
    for ring, star in enumerate(stars):
        while (star["spoke"] + js("window.__oracle.rot()")[ring]) % 8 != sky_spoke[star["name"]]:
            js(f"window.__oracle.turn({ring}, 1)")
    reading = "".join(js(f"window.__oracle.letterAt({ring}, {k})") for k in range(8) for ring in range(3))
    check(js("window.__oracle.rot()") == [0, 0, 0] and reading == "DECEMBEREIGHTEENTOTWENTY",
          "three stars set to the sky: read from the north, rim to heart, the disc says DECEMBER EIGHTEEN TO TWENTY")
    check(js("getComputedStyle(document.getElementById('oracle-read-panel')).display") != "none", "the shining disc can be read")
    js("window.__oracle.read('DECEMBER EIGHTEEN')")
    check(get("order_oracle_when_read") is None and get("order_oracle_read_fails") == "1", "half the reading is refused")
    for wrong in ["december 2018 2020", "18 december 2020"]:
        js(f"window.__oracle.read('{wrong}')")
    check(get("order_oracle_when_read") is None, "years are not days: 2018 / 2020 are refused")
    js("window.__oracle.read('the eighteenth to the twentieth of December')")
    check(get("order_oracle_when_read") == "true" and "18 – 20 DECEMBER" in js("document.getElementById('oracle-telem-when').innerText"),
          "the WHEN read in Hermes's own words is accepted: 18 – 20 December")

    # The vow, from the words she half remembers
    tiles = js("window.__oracle.tiles")
    say = lambda words: [js(f"window.__oracle.say({tiles.index(w)})") for w in words]
    say(["YOU", "WERE", "NEVER", "ONLY", "THE", "SEEKER"]); js("window.__oracle.vow()")
    check("first half" in feedback("oracle-vow-feedback") and get("order_oracle_horizon_completed") is None,
          "the prophecy's first half is not the vow")
    for words in (["THE", "TREASURE", "YOU", "WERE", "ALWAYS"], ["YOU", "WERE", "ALWAYS", "THE"]) * 2 + (["YOU"],):
        say(words); js("window.__oracle.vow()")
    check(get("order_oracle_vow_hint") == "true", "six wrong vows open the hint")
    say(["YOU", "WERE", "ALWAYS", "THE", "TREASURE"]); js("window.__oracle.vow()")
    page.wait_for_timeout(400)
    check(get("order_oracle_horizon_completed") == "true" and "Aurelia" in feedback("oracle-dispatch-text"),
          "the vow is said: the veil comes off")
    check("gilded_star" in js("window.getOwnedRelicIds()"), "the Gilded Star is in the satchel")
    page.click("#btn-oracle-finish"); page.wait_for_timeout(1200)
    check(js("getComputedStyle(document.getElementById('stage-passage-overlay')).display") != "none" and get("order_stage_passage_seen") == "true",
          "from the desert to the stage: the passage plays once")
    page.click("#btn-stage-passage-close"); page.wait_for_timeout(400)
    check(js("getComputedStyle(document.getElementById('btn-tab-path-stage')).display") != "none", "Path III · The Stage Tower appears on the map")

    js("document.querySelector('[data-view=\"view-cipher\"]').click()"); page.wait_for_timeout(500)
    ids = js("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id)")
    check("eq-item-oracle-zd" in ids and "eq-item-oracle-ie" in ids, "Ledger shows [Z] + [D] = 23 and [I] + [E] = 12")

    open_wire()
    check(get("order_field_wire_step") == "31" and choices() == 3 and "She did not die in 1971" in wire_text(),
          "debrief: step 31 (Aurelia) with 3 replies")
    answer_first()
    bar = js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")
    check(get("order_field_wire_step") == "33" and "THE DESERT PATH IS COMPLETE" in wire_text() and "[Z] + [D] = 23" in wire_text()
          and "Sheet 19A" in wire_text() and choices() == 3,
          "step 32 closes the Desert Path, and the morning of departure for Tower III follows (step 33)", bar)
    page.reload(); page.wait_for_timeout(2500); open_wire()
    text = wire_text()
    check(text.count("mint tea") == 1 and text.count("She did not die in 1971") == 1 and text.count("A whole day at the Sanctuary") == 1, "reload replays steps 29-33 once each")
    check(not errors, "no JS errors during Station 19", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    # Without the Seal of Cairn I, the Oracle receives no one
    four = dict(seed, order_cairn1_completed="false", order_cairn1_bypassed="true", order_stele_seals_at_well="4")
    four.pop("order_seal_cairn_1", None)
    ctx, page, errors = new_page(browser, four)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    page.evaluate("document.querySelector('[data-view=\"view-field-wire\"]').click()")
    page.wait_for_timeout(2200)
    bar = page.evaluate("document.querySelector('.messenger-waypoint-desc')?.innerText || ''")
    page.evaluate("window.openOracleModal()"); page.wait_for_timeout(400)
    shut = page.evaluate("getComputedStyle(document.getElementById('modal-oracle-horizon')).display") == "none"
    check(page.evaluate("localStorage.getItem('order_field_wire_step')") == "28" and "five seals" in bar and shut,
          "with four seals the audience waits for Cairn I", bar)
    servant = page.evaluate("getComputedStyle(document.getElementById('modal-servant-cairn-check')).display") != "none"
    check(servant, "knocking at the Oracle's door, the Servant offers the way back to Cairn I")
    page.click("#btn-servant-retrace"); page.wait_for_timeout(900)
    check(page.evaluate("getComputedStyle(document.getElementById('modal-cairn-one')).display") != "none"
          and page.evaluate("localStorage.getItem('order_cairn1_bypassed')") is None, "retracing opens Cairn I")
    page.evaluate("window.closeCairnOneModal ? window.closeCairnOneModal() : document.getElementById('modal-cairn-one').style.display = 'none'")
    page.evaluate("localStorage.setItem('order_cairn1_completed', 'true'); window.grantCairnSeal(1)")   # as if Silvia solved it
    page.wait_for_timeout(1500)
    page.evaluate("document.getElementById('btn-five-seals-close') && document.getElementById('btn-five-seals-close').click()")
    page.reload(); page.wait_for_timeout(2500)   # back to the Workshop later (its header button toggles, so start from a fresh page)
    page.evaluate("document.querySelector('[data-view=\"view-field-wire\"]').click()")
    page.wait_for_timeout(2500)
    check(page.evaluate("localStorage.getItem('order_field_wire_step')") == "29" and not errors,
          "with the fifth seal home the wire goes on to the inner stair", "; ".join(errors[:2]))
    ctx.close()


def login(page, name):
    page.click("#btn-seeker-switch")
    page.wait_for_timeout(300)
    page.fill("#gate-username", name)
    page.fill("#gate-password", name)
    page.keyboard.press("Enter")
    page.wait_for_timeout(3000)


def test_profiles(browser):
    print("\n11. Each seeker keeps their own adventure")
    ctx, page, errors = new_page(browser, {"the_eclipse_active_seeker": "Carles"})
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    seals = lambda: sum(1 for i in range(1, 6) if get(f"order_seal_cairn_{i}") == "true")
    page.evaluate("TesterDesert.completeUpTo('s16')")
    page.reload()
    page.wait_for_timeout(2500)
    check(seals() == 4, "Carles reaches Cairn IV with the tester")
    login(page, "Silvia")
    check(get("the_eclipse_active_seeker") == "Silvia" and seals() == 0 and get("order_field_wire_step") == "4"
          and "tuning_pebble" not in page.evaluate("window.getOwnedRelicIds()"),
          "Silvia does not inherit Carles's seals, inventory or chat")
    page.evaluate("localStorage.setItem('order_dawn_step', '1')")
    login(page, "Carles")
    check(seals() == 4 and get("order_cairn_iv_completed") == "true" and get("order_dawn_step") == "3",
          "Carles's adventure comes back untouched")
    login(page, "Silvia")
    check(get("order_dawn_step") == "1" and seals() == 0, "Silvia's own progress comes back")
    check(not errors, "no JS errors while switching seekers", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


PLAY_JS = """gid => {
    const i = TesterDesert.games.findIndex(g => g.id === gid);
    document.querySelectorAll('#tester-rows .tester-row')[i].querySelector('.tester-btn-play').click();
}"""
WORLD_JS = """() => ({
    seals: [1, 2, 3, 4, 5].filter(i => localStorage.getItem('order_seal_cairn_' + i) === 'true').length,
    relics: window.getOwnedRelicIds(),
    open: [...document.querySelectorAll('[id^=modal-]')].filter(m => getComputedStyle(m).display !== 'none').map(m => m.id)
})"""


def test_tester_play(browser):
    print("\n12. Carles's tester: Play any game, forward and back")
    modals = {"cairn1": "modal-cairn-one", "s14": "modal-sun-monolith", "s15": "modal-sandstone-labyrinth",
              "s16": "modal-cairn-four", "s17": "modal-solstice-arch", "s18": "modal-polybius-stele", "s19": "modal-oracle-horizon",
              "s20": "modal-masks-gate", "s21": "modal-camera-obscura", "s22": "modal-whispering-gallery"}
    seals_before = {"cairn1": 0, "chasm": 1, "playa": 1, "lexicon": 1, "clepsydra": 1, "s14": 1, "s15": 2, "s16": 3, "s17": 4, "s18": 5, "s19": 5, "s20": 5, "s21": 5, "s22": 5}
    ctx, page, errors = new_page(browser, {"the_eclipse_active_seeker": "Carles"})
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    for gid in ["s22", "s21", "s20", "s19", "s18", "s17", "s14", "cairn1", "s16", "clepsydra"]:
        page.evaluate("document.getElementById('tester-panel').open = true")
        page.evaluate(PLAY_JS, gid)
        page.wait_for_timeout(600)
        page.wait_for_load_state("load")
        page.wait_for_timeout(3200)
        st = page.evaluate(WORLD_JS)
        opened = modals[gid] in st["open"] if gid in modals else bool(st["open"])
        clean = (gid in ("s20", "s21", "s22") or "gilded_star" not in st["relics"]) and (gid in ("s19", "s20", "s21", "s22") or "servant_key" not in st["relics"]) and (gid in ("s17", "s18", "s19", "s20", "s21", "s22") or ("tuning_pebble" not in st["relics"] and "signal_mirror" not in st["relics"]))
        check(st["seals"] == seals_before[gid] and opened and clean, f"Play {gid}: the world is at its arrival and the game opens",
              f"seals {st['seals']}, open {st['open']}, relics {st['relics']}")
    check(not errors, "no JS errors while jumping between games", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


STAGE_FLAGS = ["order_masks_gate_completed", "order_camera_obscura_completed", "order_whispering_gallery_completed",
               "order_automaton_orchestra_completed", "order_fly_tower_completed", "order_shadow_theatre_completed",
               "order_hall_of_mirrors_completed", "order_kaleidoscope_lantern_completed", "order_mirror_stage_completed"]
MIRROR_JS = """() => ({
    path: document.documentElement.dataset.mapPath,
    tab: !!document.getElementById('btn-tab-path-stage').offsetParent,
    shown: !!document.getElementById('stage-map-canvas-wrap').offsetParent,
    shards: document.querySelectorAll('.stage-mirror-svg .sm-shard').length,
    set: document.querySelectorAll('.stage-mirror-svg .sm-shard.is-set').length,
    next: document.querySelector('.stage-mirror-svg .sm-shard.is-next')?.dataset.node || null,
    canvas: document.querySelector('.stage-mirror-kaleido')?.width || 0,
    cartouche: document.querySelector('.stage-mirror-svg .sm-cartouche')?.textContent || '',
    complete: !!document.querySelector('.stage-mirror.is-complete'),
    title: document.getElementById('insp-title').textContent,
    text: document.getElementById('view-trail').innerText })"""


def stage_page(browser, extra):
    seed = {**DESERT_BASE, **DESERT_DONE, **ORACLE_SEED_EXTRA, "order_field_wire_step": "32", **extra}
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    return ctx, page, errors


def test_stage_mirror(browser):
    print("\n13. The Stage Path: the Living Mirror of Tower III")
    ctx, page, errors = stage_page(browser, {})
    st = page.evaluate(MIRROR_JS)
    check(not st["tab"] and st["path"] != "stage" and not st["shown"], "before the Oracle's Horizon the Stage stays hidden", str(st)[:160])
    ctx.close()

    ctx, page, errors = stage_page(browser, {"order_oracle_horizon_completed": "true"})
    st = page.evaluate(MIRROR_JS)
    check(st["tab"] and st["path"] == "stage" and st["shown"] and st["shards"] == 9 and st["set"] == 0 and st["canvas"] > 0,
          "after Station 19 the curtain rises on the broken mirror", str(st)[:160])
    check(st["next"] == "40" and st["title"] == "The Gate of a Thousand Masks", "the lantern waits at Fragment I, Station 20")
    check("STAATSOPER" not in st["text"] and "Vienna" not in st["text"] and "VIENNA" not in st["text"],
          "the WHERE is never written while the mirror is broken")
    page.click(".stage-mirror-ribbon .sm-room:nth-child(4)"); page.wait_for_timeout(400)
    check(page.evaluate(MIRROR_JS)["title"] == "The Automaton Orchestra", "the ribbon opens any room's card")
    page.focus(".stage-mirror-svg .sm-shard[data-node='46']"); page.keyboard.press("Enter"); page.wait_for_timeout(400)
    check(page.evaluate(MIRROR_JS)["title"] == "The Hall of Mirrors", "a fragment opens its room from the keyboard")
    page.click("#btn-tab-path-desert"); page.wait_for_timeout(600)
    st = page.evaluate(MIRROR_JS)
    check(st["path"] == "desert" and not st["shown"], "the desert path still opens, without the mirror")
    page.click("#btn-tab-path-stage"); page.wait_for_timeout(600)
    check(page.evaluate(MIRROR_JS)["shown"], "and the stage comes back")
    check(not errors, "no JS errors on the stage", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    ctx, page, errors = stage_page(browser, {"order_oracle_horizon_completed": "true", **{f: "true" for f in STAGE_FLAGS[:4]}})
    st = page.evaluate(MIRROR_JS)
    check(st["set"] == 4 and st["next"] == "44" and not st["complete"], "four fragments set, the lantern moves to Station 24", str(st)[:160])
    ctx.close()

    ctx, page, errors = stage_page(browser, {"order_oracle_horizon_completed": "true", **{f: "true" for f in STAGE_FLAGS}})
    st = page.evaluate(MIRROR_JS)
    check(st["set"] == 9 and st["complete"] and st["cartouche"] == "WIENER STAATSOPER · VIENNA",
          "the whole mirror reflects the WHERE", str(st)[:160])
    check(not errors, "no JS errors with the mirror whole", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def test_masks_gate(browser):
    print("\n14. Station 20 · The Gate of a Thousand Masks, end to end")
    seed = {**DESERT_BASE, **DESERT_DONE, **ORACLE_SEED_EXTRA, "order_oracle_horizon_completed": "true",
            "order_field_wire_step": "32", "order_field_wire_choices": json.dumps([2, 0, 1, 0] + [0] * 28)}
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-masks-gate')).display") != "none"
    choices = lambda: js("[...document.querySelectorAll('#wire-choices-grid button')].length")
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")
    feedback = lambda node: js(f"document.getElementById('{node}').innerText")
    bar = lambda: js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def answer_first():
        js("document.querySelector('#wire-choices-grid button').click()")
        page.wait_for_timeout(9000)

    open_wire()
    check(get("order_field_wire_step") == "33" and choices() == 3 and "Sheet 19A" in wire_text(),
          "the Stage Path begins on the wire: step 33, the letter and the new sheets, 3 replies")
    js("window.selectStageStation(40)"); page.wait_for_timeout(500)
    check(not modal_open(), "the gate stays out of reach before Silvia answers")
    open_wire(); answer_first()
    check(get("order_field_wire_step") == "34" and get("order_masks_march_start") is not None and "Third Tower" in bar(),
          "the answer starts the 18-hour crossing to Tower III", bar())
    js("window.selectStageStation(40)"); page.wait_for_timeout(500)
    check(not modal_open() and "CROSSING THE PLATEAU" in js("document.getElementById('view-trail').innerText"),
          "while they walk, the card counts the hours and the gate stays shut")
    js("localStorage.setItem('order_masks_march_bypassed', 'true')")
    js("window.selectStageStation(40)"); page.wait_for_timeout(500)
    check(modal_open() and js("document.querySelector('#masks-draw-game .monolith-game-inner').inert") is True,
          "they arrive: the gate opens its modal, the drawing locked until the word")
    notes = lambda anchor: js(f"(() => {{ const b = document.getElementById('{anchor}').nextElementSibling; return b && b.classList.contains('hint-ladder') && b.offsetParent ? b.querySelectorAll('.hint-ladder-note').length : 0; }})()")

    def wrong_words(n):
        for k in range(n):
            page.fill("#masks-key-input", ["SILVIA", "MASKS", "SILVERS"][k % 3]); page.click("#btn-masks-speak"); page.wait_for_timeout(100)
    wrong_words(3)
    check(notes("masks-key-feedback") == 1 and get("order_masks_hint") is None and get("order_masks_gate_awake") is None,
          "3 wrong words: Hermes's first note appears under the word, the gate stays shut")
    wrong_words(3)
    check(notes("masks-key-feedback") == 2 and get("order_masks_hint") == "true", "6 wrong words: the second note opens the Ask Hermes answer")
    wrong_words(3)
    check(notes("masks-key-feedback") == 3 and "Top left" in js("document.getElementById('masks-key-feedback').nextElementSibling.innerText"),
          "9 wrong words: the third note does the first two masks with her, never the word")
    page.fill("#masks-key-input", " sil-ver "); page.click("#btn-masks-speak"); page.wait_for_timeout(250)
    check(get("order_masks_gate_awake") == "true" and notes("masks-key-feedback") == 0, "the word SILVER, typed loosely, opens the gate and the notes go")

    js("window.__masks.drawHalf()"); page.click("#btn-masks-hold"); page.wait_for_timeout(150)
    check("missing" in feedback("masks-draw-feedback") and js("window.__masks.carved()") == 0, "an outline without its eye is refused")
    js("window.__masks.drawWrong()"); page.click("#btn-masks-hold"); page.wait_for_timeout(150)
    check(js("window.__masks.carved()") == 0, "the carved half drawn again on its own side is refused")
    page.click("#btn-masks-clear"); page.click("#btn-masks-hold"); page.wait_for_timeout(150)
    check(notes("masks-draw-feedback") == 1 and js("getComputedStyle(document.getElementById('masks-help-row')).display") == "none",
          "after three tries Hermes's first note appears, the guide not yet")
    for _ in range(3):
        page.click("#btn-masks-hold"); page.wait_for_timeout(120)
    check(get("order_masks_draw_hint") == "true" and js("getComputedStyle(document.getElementById('masks-help-row')).display") != "none",
          "after six tries the guide appears, and the Mirror Speaker offers to carve it")

    # A shaking hand: the true half drawn by the real mouse, each point off by a few units
    box = page.locator("#masks-canvas").bounding_box()
    w, h = js("window.__masks.size")
    for k, stroke in enumerate(js("window.__masks.targets()")):
        pts = [(box["x"] + (x + 5 * ((i * 7 + k) % 3 - 1)) * box["width"] / w, box["y"] + (y + 5 * ((i * 5 + k) % 3 - 1)) * box["height"] / h)
               for i, (x, y) in enumerate(stroke)]
        page.mouse.move(*pts[0]); page.mouse.down()
        for q in pts[1:]:
            page.mouse.move(*q, steps=2)
        page.mouse.up()
    page.click("#btn-masks-hold"); page.wait_for_timeout(1700)
    check(js("window.__masks.carved()") == 1 and get("order_masks_draw_fails") == "0", "a shaking hand, drawn with the mouse, makes the first mask whole")
    # The second mask drawn with the keyboard alone: the arrows walk the pen along each line, Space puts it down and lifts it
    page.focus("#masks-canvas")
    page.keyboard.press("ArrowRight")   # the pen appears
    pen = js("window.__masks.pen()")

    def walk(x, y):
        while abs(x - pen[0]) > 1 or abs(y - pen[1]) > 1:
            horizontal = abs(x - pen[0]) >= abs(y - pen[1])
            gap = x - pen[0] if horizontal else y - pen[1]
            step = 4 if abs(gap) >= 4 else 1
            page.keyboard.press(("Shift+" if step == 1 else "") + (("ArrowRight" if gap > 0 else "ArrowLeft") if horizontal else ("ArrowDown" if gap > 0 else "ArrowUp")))
            if horizontal:
                pen[0] += step if gap > 0 else -step
            else:
                pen[1] += step if gap > 0 else -step
    for stroke in js("window.__masks.targets()"):
        walk(*stroke[0]); page.keyboard.press("Space")
        for x, y in stroke[1::2] + [stroke[-1]]:
            walk(x, y)
        page.keyboard.press("Space")
    check(js("window.__masks.strokes()") == len(js("window.__masks.targets()")) and js("window.__masks.pen()") == pen,
          "the arrow keys walk the pen and Space draws each line")
    # during the reveal the mask that was just closed is the one shown, not the next one
    page.click("#btn-masks-hold"); page.wait_for_timeout(250)
    check(get("order_masks_carved") == "2" and "Mask 2 of 3" in js("document.getElementById('masks-draw-count').innerText")
          and "weeping mask" in js("document.getElementById('masks-canvas').getAttribute('aria-label')"),
          "drawn with the keyboard alone, the second mask is made whole; while it closes the screen still shows it")
    page.wait_for_timeout(1500)
    # the last mask is saved at once: a reload in the middle of its reveal cannot strand the station
    js("window.__masks.drawTrue()"); page.click("#btn-masks-hold"); page.wait_for_timeout(150)
    check(get("order_masks_gate_completed") == "true", "the third mask is saved the moment it closes")
    page.reload(); page.wait_for_timeout(2500)
    js("window.selectStageStation(40)"); page.wait_for_timeout(500)
    check(modal_open() and js("getComputedStyle(document.getElementById('masks-victory')).display") != "none",
          "a reload in the middle of the last reveal still ends with the gate open")
    js("localStorage.setItem('order_masks_gate_completed', 'x'); localStorage.setItem('order_masks_carved', '3')")
    page.reload(); page.wait_for_timeout(2500)
    js("window.selectStageStation(40)"); page.wait_for_timeout(500)
    js("window.__masks.drawTrue()"); page.click("#btn-masks-hold"); page.wait_for_timeout(1700)
    check(get("order_masks_gate_completed") == "true", "a save of 3 masks without the done flag can still be finished")
    page.wait_for_timeout(1000)
    check(get("order_masks_gate_completed") == "true" and js("getComputedStyle(document.getElementById('masks-victory')).display") != "none"
          and js("document.querySelectorAll('#masks-fragment-svg path').length") > 3,
          "three masks whole: the gate is open and Fragment I is drawn")
    page.click("#btn-masks-finish-station"); page.wait_for_timeout(900)
    st = js("""() => ({ path: document.documentElement.dataset.mapPath, set: document.querySelectorAll('.sm-shard.is-set').length,
        fresh: document.querySelectorAll('.sm-shard.is-new').length })""")
    check(st["path"] == "stage" and st["set"] == 1 and st["fresh"] == 1, "Fragment I flashes into the Living Mirror", str(st))

    open_wire()
    check(get("order_field_wire_step") == "35" and choices() == 3 and "sealed with ash" in wire_text(),
          "debrief: step 35, the reflection, Fragment I and the note sealed with ash")
    answer_first()
    check(get("order_field_wire_step") == "36" and "FRAGMENT I SET" in wire_text() and "Fragment I Is Set" in bar(),
          "the night behind the gate closes the wire: Fragment I set, 1 of 9", bar())
    page.reload(); page.wait_for_timeout(2500)
    js("window.selectStageStation(40)"); page.wait_for_timeout(500)
    check(modal_open() and js("getComputedStyle(document.getElementById('masks-victory')).display") != "none",
          "after a reload the gate stays open")
    check(not errors, "no JS errors at the gate", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def test_hint_ladder(browser):
    print("\n16. Hints climb by time too, wait off screen, live on in Ask Hermes and go with a tester reset")
    ctx, page, errors = new_page(browser, {"the_eclipse_active_seeker": "Carles", "order_hint_s20-word_secs": "596"})
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    js = page.evaluate
    get = lambda key: js("k => localStorage.getItem(k)", key)
    notes = lambda: js("(() => { const b = document.getElementById('masks-key-feedback').nextElementSibling; return b && b.classList.contains('hint-ladder') && b.offsetParent ? b.querySelectorAll('.hint-ladder-note').length : 0; })()")
    js("window.openMasksModal()")
    page.wait_for_timeout(6500)
    check(notes() == 1 and get("order_hint_s20-word_level") == "1", "ten minutes stuck on the word bring Hermes's first note")
    js("window.closeMasksModal()")
    # 20 min = 1200 s. At most one 5 s tick lands while the modal fades out; 20 s more on screen would cross it
    js("localStorage.setItem('order_hint_s20-word_secs', '1185')")
    page.wait_for_timeout(20000)
    check(get("order_hint_s20-word_level") == "1", "time with the puzzle closed does not count")
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(1500)
    js("document.getElementById('tab-wire-inquiries').click()"); page.wait_for_timeout(600)
    grid = js("document.getElementById('inquiries-questions-grid').innerText")
    check("notes · Station 20, the word of the gate" in grid and "the missing halves" not in grid,
          "Ask Hermes keeps the notes she has unlocked, and only those")
    js("TesterDesert.replayFrom('s20')")
    check(get("order_hint_s20-word_level") is None and get("order_hint_s20-word_secs") is None, "a tester reset of Station 20 forgets its hints")
    check(not errors, "no JS errors with the hint ladder", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def test_early_hints(browser):
    print("\n17. Early hints: Stations 10 to 13 and Cairn I count their misses into Hermes's notes")
    ctx, page, errors = new_page(browser, {"the_eclipse_active_seeker": "Carles"})
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    js = page.evaluate
    get = lambda key: js("k => localStorage.getItem(k)", key)
    note = lambda modal, sel: js(f"(() => {{ const a = document.querySelector('#{modal} {sel}'); const b = a && a.nextElementSibling;"
                                 " return b && b.classList.contains('hint-ladder') && b.offsetParent ? b.textContent : ''; })()")

    js("window.openCairnOneModal()"); page.wait_for_timeout(400)
    peg = lambda i: page.click(f"#cairn1-pegs .c1-peg >> nth={i}")
    peg(0); peg(1); peg(0)   # the smallest stone to the middle, then lift the second
    for _ in range(3):
        peg(1)               # the second stone on the smallest: refused
    check(get("order_hint_cairn1-stones_fails") == "3" and "note 1 of 3" in note("modal-cairn-one", ".chasm-cairns-keypad-box"),
          "Cairn I: three stones set on smaller ones bring the first note")
    js("window.closeCairnOneModal()"); page.wait_for_timeout(300)

    js("window.openWhisperingChasmModal()"); page.wait_for_timeout(400)
    for letter in "TKI":     # two trap markers, one out of order
        js(f"window.handleChasmCairnClick('{letter}')")
    check(get("order_hint_s10-chasm_level") == "1" and "note 1 of 3" in note("modal-whispering-chasm", ".chasm-cairns-keypad-box"),
          "Station 10: trap and skipped markers bring the first note")
    js("window.closeWhisperingChasmModal()"); page.wait_for_timeout(300)

    js("window.openSaltPlayaModal()"); page.wait_for_timeout(400)
    for _ in range(3):
        page.click('#playa-board .playa-slab[data-r="0"][data-c="0"]')
    check(get("order_hint_s11-playa_level") == "1" and "note 1 of 3" in note("modal-salt-playa", "#playa-board"),
          "Station 11: three refused strides bring the first note")
    js("window.closeSaltPlayaModal()"); page.wait_for_timeout(300)

    js("window.openDesertLexiconModal()"); page.wait_for_timeout(400)
    for _ in range(3):
        page.fill("#lexicon-word-input", "WRONG"); page.click("#btn-carve-word")
    page.fill("#lexicon-word-input", ""); page.click("#btn-carve-word")   # an empty carve is not a miss
    check(get("order_hint_s12-lexicon_fails") == "3" and "note 1 of 3" in note("modal-desert-lexicon", ".lexicon-stele-input-bar"),
          "Station 12: three refused words bring the first note")
    js("window.closeDesertLexiconModal()"); page.wait_for_timeout(300)

    js("window.openOasisClepsydraModal()"); page.wait_for_timeout(400)
    for _ in range(3):
        page.fill("#clepsydra-key-input", "XX"); page.click("#btn-clepsydra-engage")
    check(get("order_hint_s13-wells_level") == "1" and "note 1 of 3" in note("modal-oasis-clepsydra", "#btn-clepsydra-engage"),
          "Station 13: three refused keys bring the first note")
    js("window.closeOasisClepsydraModal()"); page.wait_for_timeout(300)

    js("TesterDesert.replayFrom('cairn1')")
    check(all(get(f"order_hint_{i}_level") is None for i in ["cairn1-stones", "s10-chasm", "s11-playa", "s12-lexicon", "s13-wells"]),
          "a tester replay from Cairn I forgets all five")
    check(not errors, "no JS errors with the early hints", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


PREVIOUSLY_JS = """() => { const o = document.querySelector('.previously-overlay');
    return o ? [...o.querySelectorAll('.previously-section')].map(s => s.innerText.replace(/\\s+/g, ' ')).join(' | ') : ''; }"""


def test_previously(browser):
    print("\n18. «Previously on…» after 12 hours away: last time, where things stand, next, and Ask Hermes")
    hours_ago = lambda h: str(int(time.time() * 1000) - h * 3600 * 1000)

    def recap(extra, wait=3000):
        ctx, page, errors = new_page(browser, dict(DESERT_BASE, **extra))
        page.goto(f"{BASE}/index.html", wait_until="load")
        page.wait_for_timeout(wait)
        return ctx, page, errors, page.evaluate(PREVIOUSLY_JS)

    ctx, page, errors, text = recap({"order_last_seen_at": hours_ago(13)})
    check("Salt Playa" in text.split("|")[0] and "Salt Playa Crossed" in text and "Station 12 · Sheet 11A" in text.split("|")[-1],
          "13 hours away: the Salt Playa last time, the Nomad Ruins next", text[:240])
    page.click(".previously-continue"); page.wait_for_timeout(300)
    seen = int(page.evaluate("localStorage.getItem('order_last_seen_at')") or 0)
    check(not page.evaluate(PREVIOUSLY_JS) and time.time() * 1000 - seen < 60000, "Continue closes it, and the visit is stamped")
    page.evaluate("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(1500)
    page.evaluate("document.getElementById('tab-wire-inquiries').click()"); page.wait_for_timeout(600)
    page.click("#inquiries-questions-grid .messenger-faq-chip >> nth=0"); page.wait_for_timeout(4000)
    stream = page.evaluate("document.getElementById('wire-inquiries-stream') ? document.getElementById('wire-inquiries-stream').innerText : ''")
    check("Previously on The Eclipse Order" in stream and "Station 12" in stream, "Ask Hermes keeps the recap at the top of the list", stream[-200:])
    page.reload(wait_until="load"); page.wait_for_timeout(3000)
    check(not page.evaluate(PREVIOUSLY_JS), "a reload straight after does not show it again")
    check(not errors, "no JS errors with the recap", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    ctx, page, errors, text = recap({"order_last_seen_at": hours_ago(11)})
    check(not text, "11 hours away: no recap")
    ctx.close()
    ctx, page, errors, text = recap({})
    check(not text and page.evaluate("!!localStorage.getItem('order_last_seen_at')"), "the very first visit: no recap, only the stamp")
    ctx.close()

    ctx, page, errors, text = recap(dict(DESERT_DONE, order_field_wire_step="10", order_monolith_march_start=hours_ago(1),
                                         order_last_seen_at=hours_ago(20)))
    check("Four Wells" in text.split("|")[0] and ("He arrives in 10 h 5" in text or "He arrives in 11 h 00" in text) and "Keep Sheet 13B close" in text.split("|")[-1],
          "on the crossing to the Sun Monolith: the hours left and the sheet to keep close", text[:240])
    ctx.close()

    ctx, page, errors, text = recap({"order_desert_lexicon_completed": "true", "order_last_seen_at": hours_ago(30)})
    check("Camp VII" in text.split("|")[0] and "Open the Field Wire" in text, "Hermes waiting on the wire: answer him", text[:240])
    check(not errors, "no JS errors on the walk or the wire", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


NOTEBOOK_JS = """() => [...document.querySelectorAll('#field-notebook .notebook-page')].map(p => ({
    id: p.dataset.game, text: p.textContent.replace(/\\s+/g, ' ') }))"""


def test_notebook(browser):
    print("\n19. Hermes's Field Notebook in Chronicles: a dated page the moment a game is solved")
    hours_ago = lambda h: str(int(time.time() * 1000) - h * 3600 * 1000)
    ctx, page, errors = new_page(browser, dict(DESERT_BASE, **{"order_hint_s12-lexicon_fails": "2",
                                 "order_monolith_march_start": hours_ago(14)}))
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    js = page.evaluate
    js("document.querySelector('[data-view=\"view-chronicles\"]').click()"); page.wait_for_timeout(600)
    pages = js(NOTEBOOK_JS)
    check([p["id"] for p in pages] == ["cairn1", "chasm", "playa"] and all("Before this notebook was opened" in p["text"] for p in pages),
          "games solved before the notebook: undated pages, in story order", str([p["id"] for p in pages]))

    js("localStorage.setItem('order_desert_lexicon_completed', 'true')"); page.wait_for_timeout(2500)
    lex = next((p["text"] for p in js(NOTEBOOK_JS) if p["id"] == "lexicon"), "")
    entry = js("JSON.parse(localStorage.getItem('order_journal') || '{}').lexicon") or {}
    check(entry.get("fails") == 2 and time.time() * 1000 - entry.get("at", 0) < 60000 and "after 2 misses" in lex
          and "The Al-Qibla bearing" in lex and "Stargazer Proportion" in lex and "Before this notebook" not in lex,
          "Station 12 solved now: dated page, two misses, the bearing and its Ledger line", lex[:200])

    js("['order_oasis_clepsydra_completed', 'order_sun_monolith_completed', 'order_seal_cairn_2'].forEach(k => localStorage.setItem(k, 'true'))"); page.wait_for_timeout(2500)
    mono = next((p["text"] for p in js(NOTEBOOK_JS) if p["id"] == "s14"), "")
    check("Seal of Cairn II" in mono and "first try" in mono and ("1 h 59 min after I got there" in mono or "2 h after I got there" in mono),
          "Station 14: the seal, the first try, and the two hours since Hermes arrived", mono[:240])

    js("TesterDesert.replayFrom('s14')"); page.wait_for_timeout(2500)
    ids = [p["id"] for p in js(NOTEBOOK_JS)]
    check("s14" not in ids and "clepsydra" in ids and "s14" not in (js("localStorage.getItem('order_journal')") or ""),
          "a tester replay tears the Station 14 page out", str(ids))
    page.set_viewport_size({"width": 390, "height": 800}); page.wait_for_timeout(400)
    check(js("document.documentElement.scrollWidth") <= 390, "the notebook fits a phone")
    check(not errors, "no JS errors with the notebook", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


PAUSE_JS = """() => { const t = (s) => (s || '').replace(/\\u00a0/g, ' ').toLowerCase();
    return { status: t(document.getElementById('insp-status').textContent), btn: t(document.getElementById('insp-btn-primary').textContent),
             toast: t((document.getElementById('desert-toast-banner') || {}).textContent) }; }"""


def test_stage_pause(browser):
    print("\n20. Pauses on the Stage Path: after a fragment, the next room opens at its own hour")
    journal = json.dumps({"s22": {"at": int(time.time() * 1000) - 3600 * 1000, "fails": 0, "notes": 0, "arrived": None}})
    seed = {"order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true", "order_camera_obscura_completed": "true", "order_whispering_gallery_completed": "true", "order_field_wire_step": "44",
            "order_journal": journal}
    ctx, page, errors = stage_page(browser, seed)
    js = page.evaluate
    room = lambda: (page.click(".stage-mirror-ribbon .sm-room:nth-child(4)"), page.wait_for_timeout(400), js(PAUSE_JS))[2]
    check("not yet" in room()["status"], "with no hours set for the room, nothing changes")
    js("EclipseStagePause.HOURS[43] = 24")
    st = room()
    check("opens in 23 h" in st["status"] and "opens in 23 h" in st["btn"], "a 24-hour pause, one hour after Fragment III: the door opens in 23 h", str(st))
    js("selectStageStation(43)"); page.wait_for_timeout(300)
    check("opens in 23 h" in js(PAUSE_JS)["toast"], "knocking on the room tells her when it opens")
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2000)
    wire = js("document.querySelector('#wire-completed-bar .messenger-waypoint-desc').textContent.replace(/\\u00a0/g, ' ')")
    check("Its door opens in 23 h" in wire, "the Field Wire says the same", wire)
    js("TesterDesert.replayFrom('s22')")
    check(js("EclipseStagePause.remaining(43)") == 0, "with Fragment III gone there is nothing to wait for")
    check(not errors, "no JS errors with the pause", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    ctx, page, errors = stage_page(browser, dict(seed, the_eclipse_active_seeker="Carles"))
    js = page.evaluate
    js("EclipseStagePause.HOURS[43] = 24; switchMapPath('stage', false)"); page.wait_for_timeout(600)
    page.click(".stage-mirror-ribbon .sm-room:nth-child(4)"); page.wait_for_timeout(400)
    st = js(PAUSE_JS)
    page.click("#insp-btn-primary"); page.wait_for_timeout(300)
    check("tester: open it now" in st["btn"] and js("EclipseStagePause.remaining(43)") == 0,
          "Carles can open the room at once", str(st))
    ctx.close()


def test_ambience(browser):
    print("\n21. Ambient sound: each station game has its own bed, it stops on close, and the speaker mutes it")
    ctx, page, errors = new_page(browser, dict(DESERT_BASE, **DESERT_DONE))
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    js = page.evaluate
    state = lambda: js("EclipseAmbience.state()")
    check(state()["bed"] is None and js("document.getElementById('ambience-toggle').getClientRects().length > 0"), "on the map: no bed, the speaker is on screen")
    page.mouse.click(5, 5)   # the first gesture lets the browser play sound
    js("window.openOasisClepsydraModal()"); page.wait_for_timeout(1500)
    st = state()
    check(st["bed"] == "four wells" and st["running"] and not st["muted"], "the Four Wells play their own bed", str(st))
    js("window.closeOasisClepsydraModal()"); page.wait_for_timeout(1500)
    js("window.openSaltPlayaModal()"); page.wait_for_timeout(1500)
    check(state()["bed"] == "salt flat", "closing one game and opening another changes the bed", str(state()))
    page.click("#ambience-toggle"); page.wait_for_timeout(300)
    check(state()["muted"] and js("localStorage.getItem('order_ambience_muted')") == "true", "the speaker, above the game, mutes it")
    js("window.closeSaltPlayaModal()")
    # the window fades for 220 ms and the bed follows on its next 600 ms look: slower when the machine is busy
    for _ in range(30):
        page.wait_for_timeout(200)
        if state()["bed"] is None:
            break
    check(state()["bed"] is None, "with no game open there is silence")
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    check(state()["muted"] and js("document.getElementById('ambience-toggle').getAttribute('aria-pressed')") == "true", "the choice is remembered")
    check(not errors, "no JS errors with the ambient sound", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


ASHES_JS = """(() => ({
  feather: !!document.querySelector('.stage-mirror-svg .sm-feather'),
  intercepts: [...document.querySelectorAll('#view-field-wire .wire-intercept')].map(e => e.textContent),
  clues: JSON.parse(localStorage.getItem('order_ashes_clues') || '{}')
}))()"""


def test_ashes(browser):
    print("\n22. The clues of the Ashes: after Station 20, a gilded feather on the mirror and a line slipping onto the wire")
    ctx, page, errors = stage_page(browser, {"order_oracle_horizon_completed": "true"})
    js = page.evaluate
    js("switchMapPath('stage', false)"); page.wait_for_timeout(600)
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2200)
    st = js(ASHES_JS)
    check(not st["feather"] and not st["intercepts"] and not st["clues"], "before the gate: no feather, no stranger on the wire", str(st))
    ctx.close()

    # Live: Silvia answers the Station 20 debrief, Hermes closes the night, and the static slips in after him
    seed = {"order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true", "order_field_wire_step": "35",
            "order_field_wire_choices": json.dumps([2, 0, 1, 0] + [0] * 31)}
    ctx, page, errors = stage_page(browser, seed)
    js = page.evaluate
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2200)
    check(not js(ASHES_JS)["intercepts"], "while the debrief waits for her answer, the line is quiet")
    js("document.querySelector('#wire-choices-grid button').click()"); page.wait_for_timeout(12500)
    st = js(ASHES_JS)
    text = " ".join(st["intercepts"])
    check(len(st["intercepts"]) == 1 and "the treasure" in text, "after step 36 one broken line arrives, calling her the treasure", text[:90])
    check(not any(w in text.lower() for w in ("carles", "pope", "seeker")), "it never names its sender nor calls her the seeker")
    js("switchMapPath('stage', false)"); page.wait_for_timeout(600)
    st = js(ASHES_JS)
    check(st["feather"], "a gilded feather lies on the sill of the Living Mirror")
    check(all(k in st["clues"] for k in ("note1", "feather", "intercept")), "the notebook keeps when she first saw each clue", str(st["clues"]))
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2200)
    check(len(js(ASHES_JS)["intercepts"]) == 1, "after a reload the line is still there, once")
    js("TesterDesert.replayFrom('s20')")
    check(js("localStorage.getItem('order_ashes_clues')") is None, "replaying Station 20 forgets the clues")
    check(not errors, "no JS errors with the clues", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


SPEAKER_JS = """(() => { const box = document.querySelector('.stage-mirror-speaker'), w = box && box.querySelector('.mirror-speaker-words');
  return { shown: !!box && !box.hidden, text: w ? w.textContent : '', flip: w ? getComputedStyle(w).transform : '',
           read: !!document.querySelector('.mirror-speaker-line.is-read') }; })()"""


def test_speaker(browser):
    print("\n23. The Mirror Speaker: a line in mirror writing at the next room, answering how Silvia played the one before")
    ctx, page, errors = stage_page(browser, {"order_oracle_horizon_completed": "true"})
    page.evaluate("switchMapPath('stage', false)"); page.wait_for_timeout(600)
    check(not page.evaluate(SPEAKER_JS)["shown"], "while the first door is shut the glass is silent")
    ctx.close()

    # Fragment I won yesterday at 08:30 local (so the 3-hour pause is over at any hour of the run), ten minutes after
    # arriving, with seven misses and no notes
    at = (datetime.datetime.now() - datetime.timedelta(days=1)).replace(hour=8, minute=30, second=0, microsecond=0)
    at_ms = int(at.timestamp() * 1000)
    page_s20 = {"at": at_ms, "fails": 7, "notes": 0, "arrived": at_ms - 10 * 60000}
    seed = {"order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true", "order_field_wire_step": "36",
            "order_journal": json.dumps({"s20": page_s20})}
    ctx, page, errors = stage_page(browser, seed)
    js = page.evaluate
    js("switchMapPath('stage', false)"); page.wait_for_timeout(800)
    st = js(SPEAKER_JS)
    check(st["shown"] and st["text"].startswith("You came with the first light. The glass tested you hard. You did not break. And swiftly.")
          and any(t in st["text"] for t in ("warmth", "guard", "plans bend", "reason opens")),
          "at the Camera Obscura she reads her hour, her misses, her pace and her tone", st["text"])
    check(st["flip"].startswith("matrix(-1"), "the line is written in mirror writing", st["flip"])
    check(not any(w in st["text"].lower() for w in ("carles", "pope", "seeker", "silvia")), "the Speaker names no one")
    js("localStorage.setItem('order_journal', JSON.stringify({s20: {at: Date.now(), fails: 0, notes: 0, arrived: null}}))")
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    js("switchMapPath('stage', false)"); page.wait_for_timeout(800)
    check(js(SPEAKER_JS)["text"] == st["text"], "once written, the line never changes")
    page.click(".mirror-speaker-line"); page.wait_for_timeout(900)
    st = js(SPEAKER_JS)
    check(st["read"] and st["flip"] in ("none", "matrix(1, 0, 0, 1, 0, 0)"), "a tap turns it round to be read", st["flip"])
    js("TesterDesert.replayFrom('s20')")
    check(js("localStorage.getItem('order_speaker_line_41')") is None, "replaying Station 20 wipes the glass")
    check(not errors, "no JS errors with the Speaker", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    # A pause: the door is not open yet, so nothing is written (the hours are set after load here, so forget the line the load wrote)
    seed["order_journal"] = json.dumps({"s20": dict(page_s20, at=int(time.time() * 1000) - 3600 * 1000)})
    ctx, page, errors = stage_page(browser, seed)
    js = page.evaluate
    js("EclipseStagePause.HOURS[41] = 24; localStorage.removeItem('order_speaker_line_41'); switchMapPath('stage', false); StageMirror.refresh()"); page.wait_for_timeout(800)
    check(not js(SPEAKER_JS)["shown"] and js("localStorage.getItem('order_speaker_line_41')") is None,
          "during a pause the glass waits with the door")
    ctx.close()


LETTERS_JS = """(() => { const box = document.getElementById('aurelia-letters');
  return { shown: !!box && !box.hidden, wait: (box && !box.querySelector('.letters-wait').hidden) ? box.querySelector('.letters-wait').textContent : '',
           letters: [...document.querySelectorAll('.aurelia-letter')].map(a => ({ id: a.dataset.letter, sealed: a.classList.contains('is-sealed'), text: a.textContent })),
           wire: [...document.querySelectorAll('#view-field-wire .chat-bubble')].map(b => b.textContent).filter(t => /her letter|second letter|Three short, a pause/.test(t)).length }; })()"""


def test_letters(browser):
    print("\n24. Aurelia's Letters: three letters of 1970 and 1971 in Chronicles, one with each sketchbook")
    chron = lambda page: (page.evaluate("document.querySelector('[data-view=\"view-chronicles\"]').click()"), page.wait_for_timeout(500))
    ctx, page, errors = stage_page(browser, {})
    check(not page.evaluate(LETTERS_JS)["shown"], "before the audience with the Oracle the section stays hidden")
    ctx.close()

    seed = {"order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true", "order_field_wire_step": "36"}
    ctx, page, errors = stage_page(browser, seed)
    js = page.evaluate
    chron(page)
    st = js(LETTERS_JS)
    check(st["shown"] and not st["letters"] and "one letter at a time" in st["wait"], "after Station 19 the section waits, empty", str(st)[:120])
    js("['order_camera_obscura_completed', 'order_whispering_gallery_completed'].forEach(k => localStorage.setItem(k, 'true'))")
    page.wait_for_timeout(1800)
    st = js(LETTERS_JS)
    check([l["id"] for l in st["letters"]] == ["I"] and st["letters"][0]["sealed"] and "March 1970" not in st["letters"][0]["text"]
          and "2 more letters" in st["wait"], "Station 22 brings Letter I, sealed and unread", str(st)[:160])
    page.click(".aurelia-letter[data-letter='I'] .letter-envelope"); page.wait_for_timeout(1300)
    st = js(LETTERS_JS)
    text = st["letters"][0]["text"]
    check(not st["letters"][0]["sealed"] and "March 1970" in text and "Hermes," in text and "A." in text,
          "breaking the seal opens it: date, Hermes, her initial", text[:80])
    check(js("!!document.querySelector('.aurelia-letter .letter-initial') && !!document.querySelector('.aurelia-letter .letter-sketch svg')"),
          "an illuminated initial and her sketch in the margin")
    check(not any(w in text.lower() for w in ("bridge", "pope", "carles", "seeker")), "the letter never speaks of the bridge")
    rec = json.loads(js("localStorage.getItem('order_aurelia_letters')") or "{}")
    check(rec.get("I", {}).get("step") == 36 and js("localStorage.getItem('order_messenger_unread_count')") == "1",
          "the Field Wire gets a new message, kept at the step where she read it", str(rec))
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2200)
    check(js(LETTERS_JS)["wire"] == 1, "Hermes answers the letter on the wire, once")
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2200)
    check(js(LETTERS_JS)["wire"] == 1, "after a reload his answer is still there, once")
    chron(page)
    check(not js(LETTERS_JS)["letters"][0]["sealed"], "an opened letter stays open")
    js("['order_automaton_orchestra_completed', 'order_fly_tower_completed', 'order_shadow_theatre_completed', 'order_hall_of_mirrors_completed', 'order_kaleidoscope_lantern_completed'].forEach(k => localStorage.setItem(k, 'true'))")
    page.wait_for_timeout(1800)
    st = js(LETTERS_JS)
    check([l["id"] for l in st["letters"]] == ["I", "II", "III"] and not st["wait"], "Stations 25 and 27 bring Letters II and III, in order", str([l["id"] for l in st["letters"]]))
    page.set_viewport_size({"width": 390, "height": 800}); page.wait_for_timeout(400)
    check(js("document.documentElement.scrollWidth") <= 390, "the letters fit a phone")
    js("localStorage.removeItem('order_whispering_gallery_completed')"); page.wait_for_timeout(1800)
    st = js(LETTERS_JS)
    check("I" not in [l["id"] for l in st["letters"]] and "I" not in (js("localStorage.getItem('order_aurelia_letters')") or ""),
          "unsolving Station 22 closes Letter I again", str([l["id"] for l in st["letters"]]))
    check(not errors, "no JS errors with the letters", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def test_journey(browser):
    print("\n25. The journey profile for the ending: tone, days, rooms, notes, favourite hour, the name and the object she chose")
    ctx, page, errors = new_page(browser, {"the_eclipse_active_seeker": "Silvia"})
    page.goto(f"{BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    pr = page.evaluate("EclipseJourney.profile()")
    check(pr["days"] == 0 and pr["rooms"] == 0 and pr["notes"] == 0 and pr["hour"] is None and pr["swiftest"] is None,
          "at the start the journey is empty", str(pr))
    ctx.close()

    day = lambda d, h, m=0: int(datetime.datetime.now().replace(hour=h, minute=m, second=0, microsecond=0).timestamp() * 1000) - d * 86400000
    journal = {"s14": {"at": day(2, 8), "fails": 2, "notes": 1, "arrived": day(2, 7, 50)},
               "s19": {"at": day(0, 21), "fails": 0, "notes": 0, "arrived": None},
               "s20": {"at": day(0, 20, 30), "fails": 0, "notes": 2, "arrived": day(0, 19)}}
    seed = {"order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true", "order_field_wire_step": "36",
            "order_journal": json.dumps(journal), "order_field_wire_choices": json.dumps([0, 1, 1, 0] + [0] * 31),
            "order_satchel_expedition_item": json.dumps({"id": "surveyor_compass", "name": "1998 Brass Surveyor's Compass"})}
    ctx, page, errors = stage_page(browser, seed)
    pr = page.evaluate("EclipseJourney.profile()")
    check(pr["days"] == 3 and pr["notes"] == 3 and pr["fails"] == 2, "three days on the road, three notes, two misses", str(pr))
    check(pr["stageRooms"] == 1 and pr["rooms"] == pr["desertGames"] + 1
          and pr["desertGames"] == page.evaluate("TesterDesert.games.filter(g => g.id !== 's20' && TesterDesert.isDone(g.id)).length"),
          "the desert games and the rooms of Tower III add up, Station 20 counted once", str(pr))
    check(pr["hour"] == "lamplight" and pr["swiftest"] and pr["swiftest"]["id"] == "s14" and pr["swiftest"]["minutes"] == 10,
          "her favourite hour is lamplight, her swiftest room the Sun Monolith", str(pr))
    check(pr["name"] == "The Cartographer" and pr["item"] == "1998 Brass Surveyor's Compass", "the name she gave Hermes and the object she chose", str(pr))
    check(pr["tone"] == page.evaluate("hermesDominantTone()") and pr["tone"] in ("warm", "protective", "tactical", "analytic"), "the tone is the Field Wire's")
    check(not errors, "no JS errors with the journey profile", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def test_seals(browser):
    print("\n26. The seals of the Stage Path sheets: a QR on each game face is the key of its room")
    seed = {"order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true", "order_camera_obscura_completed": "true", "order_whispering_gallery_completed": "true", "order_field_wire_step": "44"}
    toast = "(document.getElementById('desert-toast-banner') || {}).textContent || ''"
    ctx, page, errors = stage_page(browser, seed)
    js = page.evaluate
    room = lambda: (page.click(".stage-mirror-ribbon .sm-room:nth-child(4)"), page.wait_for_timeout(400), js(PAUSE_JS))[2]
    check("seal" not in room()["status"], "with no seal set for the room, nothing changes")
    js("EclipseSheetSeals.SEALS[43] = EclipseSheetSeals.hash('TESTSEAL')")
    st = room()
    check("seal of sheet 21b" in st["status"] and "scan the seal on sheet 21b" in st["btn"], "the room asks for the seal of Sheet 21B", str(st))
    js("selectStageStation(43)"); page.wait_for_timeout(300)
    check("seal on Sheet 21B" in js(toast), "knocking on the door asks for the seal", js(toast))
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2000)
    wire = js("document.querySelector('#wire-completed-bar .messenger-waypoint-desc').textContent.replace(/\\u00a0/g, ' ')")
    check("seal on Sheet 21B" in wire, "the Field Wire says the same", wire)
    check(js("EclipseSheetSeals.accept('nobody')") is None and js("EclipseSheetSeals.accept('testseal')") == 43
          and js("localStorage.getItem('order_sheet_seal_43')") == "true", "only the right code turns the key")
    js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(800)
    js("switchMapPath('stage', false)"); page.wait_for_timeout(600)
    check("seal" not in room()["status"], "with its seal turned the room is back to its own state")
    check(not errors, "no JS errors with the seals", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    # Scanning the QR: the Hub opens with ?seal=CODE (the hash is set before the page's load event, as a built room would have it)
    ctx, page, errors = new_page(browser, {**DESERT_BASE, **DESERT_DONE, **ORACLE_SEED_EXTRA, **seed})
    page.add_init_script("document.addEventListener('DOMContentLoaded', () => { EclipseSheetSeals.SEALS[43] = EclipseSheetSeals.hash('TESTSEAL'); })")
    page.goto(f"{BASE}/index.html?seal=TESTSEAL", wait_until="load"); page.wait_for_timeout(2500)
    js = page.evaluate
    check(js("localStorage.getItem('order_sheet_seal_43')") == "true" and "seal" not in js("location.search"),
          "scanning the seal turns the key and leaves no code in the address", js("location.href"))
    check("Sheet 21B turns" in js(toast), "the Hub says which seal turned", js(toast))
    page.goto(f"{BASE}/index.html?seal=WRONGONE", wait_until="load"); page.wait_for_timeout(2500)
    check("belongs to no door" in js(toast) and "seal" not in js("location.search"), "a wrong seal is refused", js(toast))
    ctx.close()

    ctx, page, errors = stage_page(browser, dict(seed, the_eclipse_active_seeker="Carles"))
    js = page.evaluate
    js("EclipseSheetSeals.SEALS[43] = EclipseSheetSeals.hash('TESTSEAL'); switchMapPath('stage', false)"); page.wait_for_timeout(600)
    page.click(".stage-mirror-ribbon .sm-room:nth-child(4)"); page.wait_for_timeout(400)
    st = js(PAUSE_JS)
    page.click("#insp-btn-primary"); page.wait_for_timeout(300)
    check("tester: open it now" in st["btn"] and js("localStorage.getItem('order_sheet_seal_43')") == "true", "Carles can open the room at once", str(st))
    ctx.close()


# ---- 27. Accessibility (#20) ----
A11Y_MODALS = [("openWhisperingChasmModal", "modal-whispering-chasm"), ("openCairnOneModal", "modal-cairn-one"),
               ("openSaltPlayaModal", "modal-salt-playa"), ("openDesertLexiconModal", "modal-desert-lexicon"),
               ("openOasisClepsydraModal", "modal-oasis-clepsydra"), ("openSunMonolithModal", "modal-sun-monolith"),
               ("openLabyrinthModal", "modal-sandstone-labyrinth"), ("openCairnFourModal", "modal-cairn-four"),
               ("openSolsticeModal", "modal-solstice-arch"), ("openSteleModal", "modal-polybius-stele"),
               ("openOracleModal", "modal-oracle-horizon"), ("selectStageStation(40); void", "modal-masks-gate"), ("openCameraObscuraModal", "modal-camera-obscura"),
               ("openWhisperingGalleryModal", "modal-whispering-gallery"),
               ("openSatchelInventoryModal", "modal-satchel-inventory"), ("openServantCairnCheckModal", "modal-servant-cairn-check")]
# Every station played, the gate of Station 20 reached: all the windows can open
A11Y_SEED = {**DESERT_BASE, **DESERT_DONE, **ORACLE_SEED_EXTRA, "order_oracle_horizon_completed": "true", "order_field_wire_step": "34",
             "order_field_wire_choices": json.dumps([2, 0, 1, 0] + [0] * 30), "order_masks_march_start": "1",
             "order_masks_march_bypassed": "true", "order_masks_gate_completed": "true", "order_stage_pause_skipped_41": "true",
             "order_sheet_seal_41": "true", "order_camera_obscura_completed": "true", "order_stage_pause_skipped_42": "true",
             "order_sheet_seal_42": "true"}
A11Y_FOCUSABLE = ('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),'
                  'textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')
# The controls in a part of the page: what the mouse can click but the keyboard cannot reach, and every control
A11Y_CONTROLS_JS = """([root, FOC]) => {
  const base = document.querySelector(root || 'body');
  const shown = el => { if (!el.getClientRects().length) return false; for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false; } return true; };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const hidden = el => el.closest('[inert],[aria-hidden="true"]');
  const mouseOnly = [];
  base.querySelectorAll('*').forEach(el => {
    if (hidden(el) || el.closest('[disabled]') || !shown(el)) return;   // a disabled button is shut for the mouse too
    if (getComputedStyle(el).cursor !== 'pointer' && !el.hasAttribute('onclick')) return;
    if (el.matches(FOC) || el.closest(FOC) || el.closest('label')) return;
    const up = el.parentElement;
    if (up && getComputedStyle(up).cursor === 'pointer' && !up.matches(FOC)) return;   // only the outermost
    mouseOnly.push(name(el) + ' «' + (el.textContent || '').trim().slice(0, 24) + '»');
  });
  const controls = [...base.querySelectorAll(FOC)].filter(el => !hidden(el) && shown(el)).map(name);
  return { mouseOnly, controls };
}"""
# Where the keyboard is: the look of each control with and without focus (outline, shadow, border, background, size)
A11Y_RING_JS = """([root, FOC]) => {
  const base = document.querySelector(root || 'body');
  const shown = el => { if (!el.getClientRects().length) return false; const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return false; for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false; } return true; };
  const look = el => { const s = getComputedStyle(el); return [s.outlineStyle !== 'none' ? 'ring' : '',   // its width may still be growing (transitions)
    s.boxShadow, s.borderColor, s.backgroundColor, s.transform, s.color, s.textDecorationLine].join('|'); };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const unseen = [];
  [...base.querySelectorAll(FOC)].filter(el => !el.closest('[inert],[aria-hidden="true"]') && shown(el)).slice(0, 80).forEach(el => {
    el.blur(); const off = look(el); el.focus({ preventScroll: true });
    if (document.activeElement !== el) return;
    // the SVG pieces show focus on their drawing; a child that changes counts
    const kids = [...el.querySelectorAll('*')].slice(0, 6);
    const changed = look(el) !== off || (el instanceof SVGElement && kids.length);
    if (!changed) unseen.push(name(el));
  });
  document.activeElement && document.activeElement.blur && document.activeElement.blur();
  return unseen;
}"""
# A finger's reach: four points 21 px around the centre of each control must land on it (or on another control)
A11Y_TOUCH_JS = """([root, FOC]) => {
  const base = document.querySelector(root || 'body');
  const shown = el => { if (!el.getClientRects().length) return false; for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false; } return true; };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const small = [];
  [...base.querySelectorAll(FOC)].filter(el => !el.closest('[inert],[aria-hidden="true"]') && shown(el)).forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width >= 44 && r.height >= 44) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx < 22 || cy < 22 || cx > innerWidth - 22 || cy > innerHeight - 22) return;   // off screen: not checked
    const miss = [[-21, 0], [21, 0], [0, -21], [0, 21]].some(([dx, dy]) => {
      const hit = document.elementFromPoint(cx + dx, cy + dy);
      return !hit || !(el.contains(hit) || hit.closest(FOC));
    });
    if (miss) small.push(name(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  return small;
}"""
A11Y_TEXTS_JS = """(root) => {
  const base = document.querySelector(root || 'body');
  const shown = el => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const s = getComputedStyle(e);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false; } return true; };
  const parse = c => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  const out = [], seen = new Set(), w = document.createTreeWalker(base, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode, txt = t.textContent.trim();
    if (!/[A-Za-z0-9]/.test(txt)) continue;                                  // words and numbers, not ornaments
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION'].includes(el.tagName) || !shown(el) || el.closest('[disabled],[aria-disabled="true"],[aria-hidden="true"]')) continue;
    const range = document.createRange(); range.selectNodeContents(t);
    const r = range.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) continue;
    const top = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, r.top + r.height / 2));
    if (top && !el.contains(top) && !top.contains(el)) continue;              // under something else
    const s = getComputedStyle(el);
    const fg = parse(s.webkitTextFillColor) && parse(s.webkitTextFillColor)[3] > 0 ? parse(s.webkitTextFillColor) : parse(s.color);
    if (!fg || fg[3] === 0) continue;
    let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    out.push({ el: name(el), text: txt.slice(0, 30), fg: [fg[0], fg[1], fg[2], fg[3] * op], size: parseFloat(s.fontSize), bold: parseInt(s.fontWeight, 10) >= 700,
               box: [Math.max(0, r.left), Math.max(0, r.top), Math.min(innerWidth, r.right), Math.min(innerHeight, r.bottom)] });
  }
  return out;
}"""
A11Y_HIDE_TEXT = "*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}"


def low_contrast(page, root=None):
    """Text under WCAG AA (4.5:1, 3:1 when large) against what is really painted behind it: the parchments are
    pictures, so the background is read from a screenshot taken with every letter made transparent."""
    import numpy as np
    from PIL import Image
    texts = page.evaluate(A11Y_TEXTS_JS, root)
    if not texts:
        return []
    tag = page.add_style_tag(content=A11Y_HIDE_TEXT)
    page.wait_for_timeout(60)
    shot = np.asarray(Image.open(io.BytesIO(page.screenshot(animations="disabled"))).convert("RGB"), float)
    tag.evaluate("el => el.remove()")
    k = shot.shape[1] / page.viewport_size["width"]
    lum = lambda c: float(np.dot([0.2126, 0.7152, 0.0722], np.where(c / 255 <= 0.03928, c / 255 / 12.92, ((c / 255 + 0.055) / 1.055) ** 2.4)))
    bad = []
    for t in texts:
        x0, y0, x1, y1 = [int(round(v * k)) for v in t["box"]]
        patch = shot[y0:y1, x0:x1].reshape(-1, 3)
        if not len(patch):
            continue
        bg = np.median(patch, axis=0)
        fg = np.asarray(t["fg"][:3], float) * t["fg"][3] + bg * (1 - t["fg"][3])
        ratio = (max(lum(fg), lum(bg)) + 0.05) / (min(lum(fg), lum(bg)) + 0.05)
        if ratio < (3 if t["size"] >= 24 or (t["bold"] and t["size"] >= 18.66) else 4.5):
            bad.append("%s «%s» %.2f:1" % (t["el"], t["text"], ratio))
    return bad


# A station window pushed wider than the screen, or scrolling sideways (the content does not fit its columns)
A11Y_WIDE_JS = """(id) => {
  const m = document.getElementById(id), vw = document.documentElement.clientWidth, out = [];
  [m, ...m.querySelectorAll('*')].forEach(e => {
    if (!e.getClientRects().length) return;
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    if ((s.overflowX === 'auto' || s.overflowX === 'scroll') && e.scrollWidth > e.clientWidth + 2)
      out.push('scrolls sideways: ' + (e.id || e.className) + ' ' + e.scrollWidth + '>' + e.clientWidth);
    else if (r.width && r.right > vw + 1) out.push('past the screen: ' + (e.id || e.className));
  });
  return out.slice(0, 2); }"""
# Words of the path cards cut off by the card's edge
A11Y_CARDS_JS = """() => [...document.querySelectorAll('.map-path-tab-btn')].flatMap(b => { const r = b.getBoundingClientRect();
  return [...b.querySelectorAll('.path-tab-body *, .path-tab-state')].filter(e => { const q = e.getBoundingClientRect();
    return q.width && e.textContent.trim() && (q.right > r.right + 0.5 || q.bottom > r.bottom + 0.5 || e.scrollWidth > e.clientWidth + 1); })
    .map(e => b.id + ' cuts "' + e.textContent.trim().slice(0, 30) + '"'); })"""


def a11y_wide(page, fn, mid):
    page.evaluate("v => { const b = document.querySelector(`[data-view='${v}']`); if (b) b.click(); }", "view-trail")
    page.wait_for_timeout(600)
    page.evaluate(f"window.{fn}()" if fn.startswith("open") else f"window.{fn} 0")
    page.wait_for_timeout(900)
    out = page.evaluate(A11Y_WIDE_JS, mid)
    page.keyboard.press("Escape"); page.wait_for_timeout(400)
    page.evaluate(f"document.getElementById('{mid}').style.display = 'none'")
    return out


def test_a11y(browser):
    print("\n27. Accessibility: keyboard, contrast and touch in every view and station window")
    fmt = lambda items: "; ".join(sorted(set(items))[:4]) + (" …" if len(set(items)) > 4 else "")
    open_view = lambda page, v: (page.evaluate("v => document.querySelector(`[data-view='${v}']`).click()", v), page.wait_for_timeout(900))

    # the views, at the start of the desert and with every station played
    for label, seed in (("desert", DESERT_BASE), ("every station", A11Y_SEED)):
        ctx, page, errors = new_page(browser, seed)
        page.goto(f"{BASE}/index.html", wait_until="load")
        page.wait_for_timeout(2500)
        page.keyboard.press("Tab")   # from here on, focus is the keyboard's (:focus-visible)
        mouse, ring, dim = [], [], []
        for view in VIEWS:
            open_view(page, view)
            mouse += [view + ": " + m for m in page.evaluate(A11Y_CONTROLS_JS, [None, A11Y_FOCUSABLE])["mouseOnly"]]
            ring += [view + ": " + m for m in page.evaluate(A11Y_RING_JS, ["#" + view, A11Y_FOCUSABLE])]
            dim += [view + ": " + m for m in low_contrast(page)]
        check(not mouse, f"{label}: everything the mouse can click, the keyboard can reach", fmt(mouse))
        check(not ring, f"{label}: every control shows when it has the keyboard's focus", fmt(ring))
        check(not dim, f"{label}: text contrast is at least WCAG AA", fmt(dim))
        if label == "desert":
            open_view(page, "view-archives")
            page.focus(".archive-item-card:not(.active)"); page.keyboard.press("Enter"); page.wait_for_timeout(400)
            check(page.evaluate("document.activeElement.classList.contains('active')"), "Enter opens an archive card, as a click does")
        check(not errors, f"{label}: no JS errors", fmt(errors))
        ctx.close()

    # the station windows: focus goes in, stays in, Escape closes, focus comes back
    ctx, page, errors = new_page(browser, A11Y_SEED)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    trapped, closing, back, mouse, dim, ring = [], [], [], [], [], []
    for fn, mid in A11Y_MODALS:
        open_view(page, "view-trail")
        page.focus("[data-view=\"view-trail\"]")
        page.keyboard.press("Shift+Tab"); page.keyboard.press("Tab")   # the keyboard is on the Trail tab
        page.evaluate(f"window.{fn}()" if fn.startswith("open") else f"window.{fn} 0")
        page.wait_for_timeout(1200)
        inside = f"document.getElementById('{mid}').contains(document.activeElement)"
        if not page.evaluate(inside):
            trapped.append(mid + " (focus not inside)")
        for _ in range(30):
            page.keyboard.press("Tab")
            if not page.evaluate(inside):
                trapped.append(mid); break
        mouse += [mid + ": " + m for m in page.evaluate(A11Y_CONTROLS_JS, ["#" + mid, A11Y_FOCUSABLE])["mouseOnly"]]
        ring += [mid + ": " + m for m in page.evaluate(A11Y_RING_JS, ["#" + mid, A11Y_FOCUSABLE])]
        dim += [mid + ": " + m for m in low_contrast(page, "#" + mid)]
        page.keyboard.press("Escape")
        page.wait_for_timeout(700)
        if page.evaluate(f"getComputedStyle(document.getElementById('{mid}')).display") != "none":
            closing.append(mid)
            page.evaluate(f"document.getElementById('{mid}').style.display = 'none'")
        elif page.evaluate("document.activeElement && document.activeElement.getAttribute('data-view')") != "view-trail":
            back.append(mid)
    check(not trapped, f"the {len(A11Y_MODALS)} station windows take the focus and keep Tab inside", fmt(trapped))
    check(not closing, "Escape closes every station window", fmt(closing))
    check(not back, "closing one gives the focus back to where it was", fmt(back))
    check(not mouse, "inside them, everything the mouse can click, the keyboard can reach", fmt(mouse))
    check(not ring, "inside them, every control shows its focus", fmt(ring))
    check(not dim, "inside them, text contrast is at least WCAG AA", fmt(dim))
    check(not errors, "no JS errors in the station windows", fmt(errors))
    ctx.close()

    # the iPad: a finger, not a mouse
    ctx = browser.new_context(viewport={"width": 1180, "height": 820}, has_touch=True)
    page = ctx.new_page()
    page.add_init_script(SEED_JS % json.dumps(A11Y_SEED))
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    check(page.evaluate("matchMedia('(pointer: coarse)').matches && getComputedStyle(document.documentElement).touchAction === 'manipulation'"),
          "on a touch screen a double tap does not zoom the page")
    small = []
    for view in VIEWS:
        open_view(page, view)
        small += [view + ": " + m for m in page.evaluate(A11Y_TOUCH_JS, [None, A11Y_FOCUSABLE])]
    for fn, mid in A11Y_MODALS:
        open_view(page, "view-trail")
        page.evaluate(f"window.{fn}()" if fn.startswith("open") else f"window.{fn} 0")
        page.wait_for_timeout(1000)
        small += [mid + ": " + m for m in page.evaluate(A11Y_TOUCH_JS, ["#" + mid, A11Y_FOCUSABLE])]
        page.keyboard.press("Escape"); page.wait_for_timeout(500)
        page.evaluate(f"document.getElementById('{mid}').style.display = 'none'")
    check(not small, "every control can be touched within 44 px of its centre", fmt(small))
    wide = [mid + ": " + m for fn, mid in A11Y_MODALS[:14] for m in a11y_wide(page, fn, mid)]
    open_view(page, "view-trail")
    wide += page.evaluate(A11Y_CARDS_JS)
    check(not wide, "on the iPad no station window spills sideways and the path cards show all their words", fmt(wide))
    ctx.close()


CLOUD_JS = f"window.ECLIPSE_CLOUD = {{ url: '{BASE}/__cloud', key: 'smoke-key' }};"  # same origin: CSP 'self'


def cloud_page(browser, seed, query="?cloud=1", saved=None, fail_rpc=False, down=None):
    """The Hub with cloud-config.js pointed at a fake Supabase that records every call (none while down["v"])."""
    ctx, page, errors = new_page(browser, seed)
    calls = []

    def fake_cloud(route):
        req = route.request
        if down and down["v"]:
            return route.abort("internetdisconnected")
        path = req.url.split("/rest/v1/", 1)[-1]
        calls.append({"path": path, "body": json.loads(req.post_data or "null"), "key": req.headers.get("apikey")})
        if path == "rpc/eclipse_latest_save":
            if fail_rpc:
                return route.fulfill(status=503, body="")
            body = json.dumps({"saved_at": "2026-10-20T10:00:00Z", "progress": saved} if saved else None)
            return route.fulfill(status=200, content_type="application/json", body=body)
        route.fulfill(status=201, body="")

    page.route("**/hub/js/cloud-config.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=CLOUD_JS))
    page.route("**/__cloud/rest/v1/**", fake_cloud)
    page.goto(f"{BASE}/index.html{query}", wait_until="load")
    return ctx, page, errors, calls


def test_cloud_save(browser):
    print("\n15. Cloud save: every advance reaches the cloud, an empty browser gets the journey back")
    saves = lambda calls: [c["body"] for c in calls if c["path"] == "eclipse_saves"]
    events = lambda calls: [e for c in calls if c["path"] == "eclipse_events" for e in c["body"]]

    ctx, page, errors, calls = cloud_page(browser, DESERT_BASE)
    page.wait_for_timeout(4500)
    first = saves(calls)
    check(calls and calls[0]["path"] == "rpc/eclipse_latest_save" and calls[0]["key"] == "smoke-key",
          "the device asks the cloud before it sends anything", str([c["path"] for c in calls][:3]))
    check(first and first[-1]["seeker"] == "silvia" and first[-1]["progress"].get("order_field_wire_step") == "4"
          and "the_eclipse_active_seeker" not in first[-1]["progress"],
          "the whole journey goes up as one snapshot, without the device settings")
    page.evaluate("localStorage.setItem('order_dawn_step', '2')")
    page.wait_for_timeout(3000)
    ev = events(calls)
    check(len(saves(calls)) > len(first) and saves(calls)[-1]["progress"].get("order_dawn_step") == "2",
          "a single new step is saved within seconds")
    check(any(e["kind"] == "key" and e["key"] == "order_dawn_step" and e["value"] == "2" for e in ev)
          and any(e["kind"] == "session" for e in ev) and any(e["kind"] == "view" for e in ev),
          "the change, the session and the open view arrive as events", str(ev[-3:]))
    check(not errors, "no JS errors with the cloud on", "; ".join(sorted(set(errors))[:3]))
    ctx.close()

    # A new browser: only the seeker is known. The latest save comes back before the Hub is played
    ctx, page, errors, calls = cloud_page(browser, {"the_eclipse_active_seeker": "Silvia"}, saved=DESERT_BASE)
    page.wait_for_timeout(6000)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    check(get("order_field_wire_step") == "4" and get("order_whispering_chasm_completed") == "true"
          and get("eclipse_cloud_ready_silvia") == "1",
          "an empty browser recovers Silvia's journey on its own")
    rpc = [c for c in calls if c["path"] == "rpc/eclipse_latest_save"]
    check(len(rpc) == 1 and saves(calls) and saves(calls)[0]["progress"].get("order_field_wire_step") == "4",
          "after the reload it asks no more and saves the recovered journey, not an empty start")
    check(not page.evaluate("[...document.querySelectorAll('[role=status]')].some(e => /Recovering/.test(e.textContent))"),
          "the recovery notice is gone")
    ctx.close()

    # The cloud does not answer: nothing may be sent, or an empty start could hide the real save
    ctx, page, errors, calls = cloud_page(browser, {"the_eclipse_active_seeker": "Silvia"}, fail_rpc=True)
    page.wait_for_timeout(4500)
    check(not saves(calls) and page.evaluate("document.body.innerText.indexOf('Recovering') < 0"),
          "if the cloud is down the Hub still opens and sends nothing")
    ctx.close()

    # Off unless asked: http(s) only on the published site, never on the smoke's local server
    ctx, page, errors, calls = cloud_page(browser, DESERT_BASE, query="")
    page.wait_for_timeout(3000)
    page.evaluate("localStorage.setItem('order_dawn_step', '2')")
    page.wait_for_timeout(2500)
    check(not calls and page.evaluate("!window.EclipseCloud.state.enabled"), "a local copy of the Hub never writes to the cloud")
    ctx.close()

    # Carles switching to Silvia on the same device: the repacking is not reported as progress
    # (a device where Silvia has played before: her vault and her cloud check are already there)
    ctx, page, errors, calls = cloud_page(browser, {"the_eclipse_active_seeker": "Carles", "order_dawn_step": "3",
                                                    "eclipse_profile_vault_silvia": json.dumps(DESERT_BASE),
                                                    "eclipse_cloud_ready_silvia": "1", "eclipse_cloud_ready_carles": "1"})
    page.wait_for_timeout(4000)
    switched_at = page.evaluate("new Date().toISOString()")
    login(page, "Silvia")
    page.wait_for_timeout(3500)
    removed = [e for e in events(calls) if e["seeker"] == "carles" and e.get("removed") and e["client_at"] >= switched_at]
    check(not removed and all(s["seeker"] == "silvia" for s in saves(calls)[-1:]),
          "a profile switch sends no false removals and the next save is Silvia's", f"{len(removed)} removals")
    ctx.close()


OFFLINE_PORT = PORT - 2   # its own origin and server: the worker is registered there only, and the server can go down
OFFLINE_BASE = f"http://127.0.0.1:{OFFLINE_PORT}"
OFFLINE_GAME = "constellation/celestial-flower/index.html"


def until(page, expr, seconds):
    """Polls a page expression (wait_for_function evaluates through eval, which the CSP blocks)."""
    end = time.time() + seconds
    while time.time() < end:
        try:
            if page.evaluate(expr):
                return True
        except Exception:
            pass   # the page is reloading
        page.wait_for_timeout(300)
    return False


def sw_cache(page):
    return page.evaluate("""async () => {
      const out = {};
      for (const name of await caches.keys()) out[name] = (await (await caches.open(name)).keys()).map(r => r.url);
      return out;
    }""")


def test_offline(browser):
    print("\n28. Offline: the Hub plays without a signal and the journey waits for it")
    import re
    import subprocess
    r = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "web", "offline_list.py"), "--check"],
                       capture_output=True, text=True)
    check(r.returncode == 0, "the offline list in web/sw.js is current", (r.stdout + r.stderr).strip())
    with open(os.path.join(WEB, "sw.js"), encoding="utf-8") as f:
        sw = f.read()
    listed = json.loads(re.search(r"var PRECACHE = (\[.*?\]);", sw, re.S).group(1))

    override = {}
    server = start_server(OFFLINE_PORT, override)
    ctx, page, errors = new_page(browser, DESERT_BASE)
    failed = []
    page.on("requestfailed", lambda q: failed.append(q.url) if q.url.startswith(OFFLINE_BASE) else None)
    page.goto(f"{OFFLINE_BASE}/index.html?sw=1", wait_until="load")
    until(page, "navigator.serviceWorker.controller !== null", 90)
    kept = sw_cache(page)
    hub = [n for n in kept if n.startswith("eclipse-hub-")]
    check(len(hub) == 1 and len(kept[hub[0]]) == len(listed),
          "the first visit keeps the whole Hub", f"{[(n, len(v)) for n, v in kept.items()]} of {len(listed)}")
    page.goto(f"{OFFLINE_BASE}/{OFFLINE_GAME}", wait_until="load")
    page.wait_for_timeout(2500)
    check(any(OFFLINE_GAME.rsplit("/", 1)[0] in u for u in sw_cache(page).get("eclipse-visited", [])),
          "a constellation game is kept the first time it is opened")

    # No signal at all: the site's server is down and the browser is offline
    server.shutdown(); server.server_close()
    ctx.set_offline(True)
    errors.clear(); failed.clear()
    page.goto(f"{OFFLINE_BASE}/index.html?sw=1", wait_until="load")
    page.wait_for_timeout(2500)
    for view in VIEWS:
        page.evaluate("v => { const b = document.querySelector(`[data-view='${v}']`); if (b) b.click(); }", view)
        page.wait_for_timeout(900)
    pics = page.evaluate("[...document.images].filter(i => i.complete && i.currentSrc.startsWith(location.origin) && !i.naturalWidth).map(i => i.currentSrc)")
    js = [e for e in errors if "Failed to load resource" not in e]
    check(page.evaluate("!!document.querySelector('[data-view]') && !!window.EclipseCloud") and not failed and not pics and not js,
          "without a signal the Hub opens every view with all its pictures", "; ".join((failed + pics + js)[:3]))
    check(page.evaluate("[...document.querySelectorAll('.offline-notice')].some(n => n.getClientRects().length && /journey is kept/.test(n.textContent))"),
          "a notice says the journey is kept on the device")
    failed.clear()
    page.goto(f"{OFFLINE_BASE}/{OFFLINE_GAME}", wait_until="load")
    page.wait_for_timeout(2000)
    check(not failed and page.evaluate("document.body.innerText.trim().length > 0"),
          "a game opened before plays again without a signal", "; ".join(failed[:3]))

    # The signal returns with a new version: it waits, and comes in the next time the Hub is opened
    server = start_server(OFFLINE_PORT, override)
    ctx.set_offline(False)
    override["/sw.js"] = re.sub(r"var VERSION = '\w+'", "var VERSION = 'smokenext'", sw).encode()
    page.goto(f"{OFFLINE_BASE}/index.html?sw=1", wait_until="load")
    page.wait_for_timeout(9000)   # past the opening: what is found now waits
    page.evaluate("window.__stay = 1; navigator.serviceWorker.getRegistration().then(r => r.update())")
    until(page, "navigator.serviceWorker.getRegistration().then(r => !!(r && r.waiting))", 90)
    page.wait_for_timeout(1000)
    check(page.evaluate("window.__stay === 1"),
          "a new version never reloads an open Hub")
    page.goto(f"{OFFLINE_BASE}/index.html?sw=1", wait_until="load")
    until(page, "sessionStorage.getItem('eclipse_sw_reloaded') !== null", 30)
    page.wait_for_load_state("load")
    page.wait_for_timeout(1500)
    kept = sw_cache(page)
    check([n for n in kept if n.startswith("eclipse-hub-")] == ["eclipse-hub-smokenext"] and kept.get("eclipse-visited"),
          "opening the Hub lets the new version in, drops the old one and keeps the visited games", str(list(kept)))
    ctx.close()
    server.shutdown(); server.server_close()

    # The cloud save without a signal: the change waits on the device and goes up when the signal returns
    down = {"v": False}
    ctx, page, errors, calls = cloud_page(browser, DESERT_BASE, down=down)
    page.wait_for_timeout(4500)
    down["v"] = True
    ctx.set_offline(True)
    page.evaluate("localStorage.setItem('order_dawn_step', '2')")
    page.wait_for_timeout(3500)
    queued = page.evaluate("JSON.parse(localStorage.getItem('eclipse_cloud_queue') || '[]').some(e => e.key === 'order_dawn_step')")
    sent = lambda: [c["body"] for c in calls if c["path"] == "eclipse_saves" and c["body"]["progress"].get("order_dawn_step") == "2"]
    check(queued and not sent() and page.evaluate("!!document.querySelector('.offline-notice')"),
          "without a signal the change waits on the device, with the notice")
    down["v"] = False
    ctx.set_offline(False)
    page.wait_for_timeout(5000)
    check(sent() and any(e.get("key") == "order_dawn_step" for c in calls if c["path"] == "eclipse_events" for e in c["body"])
          and not page.evaluate("!!document.querySelector('.offline-notice')"),
          "when the signal returns it reaches the cloud and the notice goes")
    check(not [e for e in errors if "Failed to load resource" not in e and "internetdisconnected" not in e.lower()],
          "no JS errors offline", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def test_camera_obscura(browser):
    print("\n29. Station 21 · The Camera Obscura, from the pause and the seal to Fragment II")
    now_ms = int(time.time() * 1000)
    with open(os.path.join(ROOT, "journal", "stage_seals.json"), encoding="utf-8") as f:
        printed_code = json.load(f)["20A"]["code"]   # the code of the seal printed on Sheet 20A
    seed = {**DESERT_BASE, **DESERT_DONE, **ORACLE_SEED_EXTRA, "order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true",
            "order_masks_gate_awake": "true", "order_masks_carved": "3", "order_masks_march_bypassed": "true",
            "order_field_wire_step": "36", "order_field_wire_choices": json.dumps([2, 0, 1, 0] + [0] * 32),
            "order_journal": json.dumps({"s20": {"at": now_ms - 3600 * 1000, "fails": 0, "notes": 0}})}
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-camera-obscura')).display") != "none"
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")
    bar = lambda: js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")
    bar_desc = lambda: js("document.querySelector('.messenger-waypoint-desc')?.innerText || ''")
    card = lambda: js("document.getElementById('view-trail').innerText")
    notes = lambda: js("(() => { const b = document.getElementById('camera-feedback').nextElementSibling; return b && b.classList.contains('hint-ladder') && b.offsetParent ? b.querySelectorAll('.hint-ladder-note').length : 0; })()")

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    # 1 hour into the 3-hour pause: the door is shut and the chat says when it opens
    open_wire()
    check("Fragment I Is Set" in bar() and "opens in" in bar_desc() and get("order_field_wire_step") == "36", "the pause after Fragment I keeps the chat at its bar, with the hours left", bar_desc())
    js("window.selectStageStation(41)"); page.wait_for_timeout(500)
    check(not modal_open() and "OPENS IN" in card(), "the card says when the door opens and the room stays shut")

    # the pause is over: the seal of Sheet 20A is the key
    js("localStorage.setItem('order_journal', JSON.stringify({s20: {at: %d, fails: 0, notes: 0}}))" % (now_ms - 4 * 3600 * 1000))
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    open_wire()
    check("seal on Sheet 20A" in bar_desc() and get("order_field_wire_step") == "36", "after the pause the chat asks for the seal of Sheet 20A", bar_desc())
    js("window.selectStageStation(41)"); page.wait_for_timeout(500)
    check(not modal_open() and "SEAL OF SHEET 20A" in card(), "the card asks for the seal and the room stays shut")
    check(js("EclipseSheetSeals.accept('nobody')") is None and js("EclipseSheetSeals.accept(%s)" % json.dumps(printed_code)) == 41,
          "only the code printed on the sheet turns the key")

    # the key is in: Hermes writes from the head of the stair
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    open_wire()
    check(get("order_field_wire_step") == "37" and "Sheet 20A" in wire_text() and js("document.querySelectorAll('#wire-choices-grid button').length") == 3,
          "with the seal turned the chat reaches step 37: the stair, Sheet 20A and 3 replies")
    js("document.querySelector('#wire-choices-grid button').click()"); page.wait_for_timeout(9000)
    check(get("order_field_wire_step") == "38" and "Station 21 Awaits" in bar() and "DARK ROOM" in wire_text(),
          "the answer takes him down to the dark room, and the bar waits for Station 21", bar())

    # the room: the picture starts upside down and blurred, and only a sharp picture can be pointed at
    js("window.selectStageStation(41)"); page.wait_for_timeout(500)
    check(modal_open() and js("window.__camera.angle()") == 180 and not js("window.__camera.sharp()")
          and js("document.getElementById('camera-city').style.filter").startswith("blur"), "the dark room opens with the city upside down and blurred")
    check(js("document.querySelectorAll('#camera-city .camera-spot').length") == 11 and js("document.querySelectorAll('#camera-city .camera-smoke').length") == 9,
          "eleven places can be pointed at and three chimneys smoke on the wall")
    js("window.__camera.pick('house_d')"); page.wait_for_timeout(200)
    check(get("order_camera_obscura_completed") is None and "blurred" in js("document.getElementById('camera-feedback').innerText") and js("window.__camera.fails()") == 0,
          "pointing at a blurred picture does nothing and costs no miss")

    # the lens ring: the keyboard, then a drag
    page.focus("#camera-ring")
    page.keyboard.press("Home")
    check(js("window.__camera.angle()") == 0 and js("window.__camera.sharp()") and js("document.getElementById('camera-ring').getAttribute('aria-valuetext')") == "upright and sharp",
          "Home stands the picture upright and sharp")
    page.keyboard.press("End"); page.keyboard.press("PageDown"); page.keyboard.press("ArrowLeft")
    check(js("window.__camera.angle()") == 130, "End, Page Down and the left arrow turn the ring by 45 and 5 degrees", str(js("window.__camera.angle()")))
    box = page.locator("#camera-ring").bounding_box()
    cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
    page.mouse.move(cx + 40, cy); page.mouse.down(); page.mouse.move(cx + 30, cy - 30, steps=4); page.mouse.move(cx, cy - 46, steps=4); page.mouse.up()
    check(js("window.__camera.sharp()") and js("document.getElementById('camera-city').classList.contains('is-sharp')"), "dragging the ring up to its mark brings the city upright and sharp", str(js("window.__camera.angle()")))

    # wrong places, then the right one
    js("window.__camera.pick('windmill')"); page.wait_for_timeout(100)
    check("exactly as it was" in js("document.getElementById('camera-feedback').innerText") and js("window.__camera.fails()") == 1, "a place that did not change is refused")
    js("window.__camera.pick('tower')"); page.wait_for_timeout(100)
    check("new flag" in js("document.getElementById('camera-feedback').innerText") and js("window.__camera.found()") == ["flag"],
          "a place that changed but hides nobody is named as one of the four changes")
    js("window.__camera.pick('market')"); page.wait_for_timeout(300)
    check(js("document.getElementById('camera-telem-found').innerText") == "[ 2 / 4 ]" and notes() == 1 and get("order_camera_obscura_completed") is None,
          "three misses: two changes seen and Hermes's first note appears under the wall")
    js("window.__camera.pick('house_c'); window.__camera.pick('gate'); window.__camera.pick('bridge')"); page.wait_for_timeout(300)
    check(notes() == 2 and js("window.__camera.fails()") == 6, "six misses: the second note")
    page.focus("#camera-city .camera-spot[data-place='house_d']")
    page.keyboard.press("Enter"); page.wait_for_timeout(500)
    check(get("order_camera_obscura_completed") == "true" and js("document.getElementById('camera-telem-found').innerText") == "4 / 4 ✓"
          and js("document.getElementById('camera-victory').style.display") != "none" and js("window.__camera.angle()") == 0,
          "the keyboard points at the narrow house: the hideout is found, four changes seen")
    check(js("document.getElementById('camera-fragment-svg').childNodes.length") > 3 and "Fragment II" in js("document.getElementById('camera-victory').innerText"),
          "Fragment II is drawn in the victory card")
    page.click("#btn-camera-finish-station"); page.wait_for_timeout(1200)
    st = js(MIRROR_JS)
    check(not modal_open() and st["set"] == 2 and st["next"] == "42", "closing the room sets Fragment II and the mirror points at the Whispering Gallery", str(st)[:160])

    # the debrief on the wire, and the next door
    open_wire()
    check(get("order_field_wire_step") == "39" and "Fragment II is in my hands" in wire_text(), "the chat reaches the Station 21 debrief")
    js("document.querySelector('#wire-choices-grid button').click()"); page.wait_for_timeout(9000)
    check(get("order_field_wire_step") == "40" and "FRAGMENT II SET" in wire_text() and "Fragment II Is Set" in bar(), "the debrief ends at step 40 with Fragment II set", bar())
    check("Whispering Gallery" in bar_desc(), "the bar names the next room", bar_desc())
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    js("window.selectStageStation(41)"); page.wait_for_timeout(500)
    check(modal_open() and js("window.__camera.angle()") == 0 and js("document.getElementById('camera-victory').style.display") != "none",
          "after a reload the room is still solved and upright")
    ctx.close()

    # the tester: Play this game lands where Hermes reaches the room
    ctx, page, errors = new_page(browser, {**seed, "the_eclipse_active_seeker": "Carles"})
    page.goto(f"{BASE}/index.html?tester=1", wait_until="load")
    page.wait_for_timeout(2500)
    node = page.evaluate("window.TesterDesert.jumpTo('s21')")
    check(node == 41 and page.evaluate("localStorage.getItem('order_field_wire_step')") == "38"
          and page.evaluate("localStorage.getItem('order_masks_gate_completed')") == "true"
          and page.evaluate("localStorage.getItem('order_camera_obscura_completed')") is None,
          "the tester's Play this game: Station 20 done, Station 21 open, the chat at step 38")
    check(not errors, "no JS errors in the dark room", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


def test_whispering_gallery(browser):
    print("\n30. Station 22 · The Whispering Gallery, from the pause and the seal to Fragment III and [J] × 2 = [T]")
    now_ms = int(time.time() * 1000)
    with open(os.path.join(ROOT, "journal", "stage_seals.json"), encoding="utf-8") as f:
        printed_code = json.load(f)["20B"]["code"]   # the code of the seal printed on Sheet 20B
    seed = {**DESERT_BASE, **DESERT_DONE, **ORACLE_SEED_EXTRA, "order_oracle_horizon_completed": "true", "order_masks_gate_completed": "true",
            "order_masks_gate_awake": "true", "order_masks_carved": "3", "order_masks_march_bypassed": "true",
            "order_camera_obscura_completed": "true", "order_sheet_seal_41": "true",
            "order_field_wire_step": "40", "order_field_wire_choices": json.dumps([2, 0, 1, 0] + [0] * 36),
            "order_journal": json.dumps({"s21": {"at": now_ms - 3600 * 1000, "fails": 0, "notes": 0}})}
    ctx, page, errors = new_page(browser, seed)
    page.goto(f"{BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2500)
    get = lambda key: page.evaluate("k => localStorage.getItem(k)", key)
    js = page.evaluate
    modal_open = lambda: js("getComputedStyle(document.getElementById('modal-whispering-gallery')).display") != "none"
    wire_text = lambda: js("document.getElementById('view-field-wire').innerText")
    bar = lambda: js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")
    bar_desc = lambda: js("document.querySelector('.messenger-waypoint-desc')?.innerText || ''")
    card = lambda: js("document.getElementById('view-trail').innerText")
    text = lambda i: js("document.getElementById('%s').innerText" % i)
    shown = lambda i: js("getComputedStyle(document.getElementById('%s')).display" % i) != "none"

    def open_wire():
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
        page.wait_for_timeout(2200)

    def wait_tune():
        for _ in range(40):
            if not js("window.__gallery.playing()"):
                return
            page.wait_for_timeout(250)

    # 1 hour into the 6-hour pause: the door is shut and the chat says when it opens
    open_wire()
    check("Fragment II Is Set" in bar() and "opens in 5 h" in bar_desc().replace("\u00a0", " ") and get("order_field_wire_step") == "40", "the 6-hour pause after Fragment II keeps the chat at its bar", bar_desc())
    js("window.selectStageStation(42)"); page.wait_for_timeout(500)
    check(not modal_open() and "OPENS IN" in card(), "the card says when the door opens and the room stays shut")

    # the pause is over: the seal of Sheet 20B is the key
    js("localStorage.setItem('order_journal', JSON.stringify({s21: {at: %d, fails: 0, notes: 0}}))" % (now_ms - 7 * 3600 * 1000))
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    open_wire()
    check("seal on Sheet 20B" in bar_desc() and get("order_field_wire_step") == "40", "after the pause the chat asks for the seal of Sheet 20B", bar_desc())
    js("window.selectStageStation(42)"); page.wait_for_timeout(500)
    check(not modal_open() and "SEAL OF SHEET 20B" in card(), "the card asks for the seal and the room stays shut")
    check(js("EclipseSheetSeals.accept('nobody')") is None and js("EclipseSheetSeals.accept(%s)" % json.dumps(printed_code)) == 42,
          "only the code printed on Sheet 20B turns the key")

    # the key is in: Hermes writes from the head of the second stair
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    open_wire()
    check(get("order_field_wire_step") == "41" and "Sheet 20B" in wire_text() and js("document.querySelectorAll('#wire-choices-grid button').length") == 3,
          "with the seal turned the chat reaches step 41: the second stair, Sheet 20B and 3 replies")
    js("document.querySelector('#wire-choices-grid button').click()"); page.wait_for_timeout(9000)
    check(get("order_field_wire_step") == "42" and "Station 22 Awaits" in bar() and "THE GALLERY" in wire_text(),
          "the answer takes him down to the gallery, and the bar waits for Station 22", bar())

    # the room: Hermes at the door, nothing heard, the bells hidden
    js("window.selectStageStation(42)"); page.wait_for_timeout(500)
    check(modal_open() and js("window.__gallery.pos()") == [0, -3.5] and not shown("gallery-bells-card") and "No whisper reaches here" in text("gallery-heard"),
          "the gallery opens with Hermes at the door, hearing nothing, and no bells yet")
    check(js("document.querySelectorAll('#gallery-plan .gallery-column').length") == 17 and js("document.querySelectorAll('#gallery-plan circle[class*=focus]').length") == 0,
          "the plan draws the seventeen columns and does not mark the pins")
    page.click("#btn-gallery-listen"); page.wait_for_timeout(200)
    check("Nothing reaches him" in text("gallery-focus-feedback") and get("order_hint_s22-focus_fails") == "1", "listening at the door is a miss")

    # the keyboard walks him: up to the middle, then west, where the whisper starts to come through from the left
    page.focus("#gallery-plan")
    for _ in range(7):
        page.keyboard.press("ArrowUp")
    check(js("window.__gallery.pos()") == [0, 0] and "in the middle" in text("gallery-where") and js("window.__gallery.clarity()") == 0,
          "seven steps north: the middle of the gallery, still silent", text("gallery-where"))
    for _ in range(4):
        page.keyboard.press("ArrowLeft")
    check(js("window.__gallery.pos()") == [-2, 0] and "from your left" in text("gallery-heard") and 0 < js("window.__gallery.clarity()") < 1,
          "two varas west the whisper comes through, faint, from the left", text("gallery-heard")[:90])
    page.keyboard.press("Enter"); page.wait_for_timeout(200)
    check(not js("window.__gallery.atFocus()") and "slip away" in text("gallery-focus-feedback"), "close is not enough: words that slip away")
    check(js("window.__gallery.moveTo(3, 0)") is False and "Ash, very close" in text("gallery-focus-feedback") and js("window.__gallery.pos()") == [-2, 0],
          "Hermes will not walk into the raiders at the east pin")
    page.focus("#gallery-plan")
    page.keyboard.press("ArrowLeft"); page.keyboard.press("ArrowLeft")
    check(js("window.__gallery.pos()") == [-3, 0] and "Clear as a bell" in text("gallery-heard"), "three varas west, on the long axis: clear as a bell", text("gallery-heard")[:80])
    page.keyboard.press("Enter"); page.wait_for_timeout(300)
    check(js("window.__gallery.atFocus()") and get("order_whispering_gallery_focus") == "true" and shown("gallery-bells-card")
          and "She will come" in text("gallery-heard") and "WEST PIN" in text("gallery-telem-focus"),
          "at the west pin every word arrives, and the bells of the niche appear")
    page.wait_for_timeout(1600); wait_tune()
    check(not js("window.__gallery.playing()") and js("document.querySelectorAll('#gallery-bells .gallery-bell').length") == 5, "the tune has played: five bells wait")

    # the tune note for note is what the raiders did; a wrong one is refused; the mirror opens the niche
    js("window.__gallery.tune.forEach(b => window.__gallery.strike(b))"); page.wait_for_timeout(300)
    check("Note for note" in text("gallery-echo-feedback") and get("order_whispering_gallery_completed") is None and get("order_hint_s22-echo_fails") == "1",
          "playing it note for note leaves the niche shut, as it did for the raiders")
    js("[0, 0, 0, 0, 0, 0].forEach(b => window.__gallery.strike(b))"); page.wait_for_timeout(300)
    check("stays shut" in text("gallery-echo-feedback") and get("order_hint_s22-echo_fails") == "2", "a wrong tune is refused")
    page.wait_for_timeout(800)
    for b in js("window.__gallery.mirror"):
        page.click("#gallery-bells .gallery-bell:nth-child(%d)" % (b + 1))
        page.wait_for_timeout(120)
    page.wait_for_timeout(900)
    check(get("order_whispering_gallery_completed") == "true" and shown("gallery-victory") and "OPEN" in text("gallery-telem-niche"),
          "the tune played back from its last bell to its first opens the niche")
    check(js("document.getElementById('gallery-fragment-svg').childNodes.length") > 3 and "[J] × 2 = [T]" in text("gallery-victory"),
          "Fragment III and the line of the niche are in the victory card")
    page.click("#btn-gallery-finish-station"); page.wait_for_timeout(1200)
    st = js(MIRROR_JS)
    check(not modal_open() and st["set"] == 3 and st["next"] == "43", "closing the room sets Fragment III and the mirror points at the Automaton Orchestra", str(st)[:160])
    js("document.querySelector('[data-view=\"view-cipher\"]').click()"); page.wait_for_timeout(500)
    ids = js("[...document.querySelectorAll('.clue-equation-item')].map(e => e.id)")
    check("eq-item-gallery-jt" in ids, "the Ledger shows [J] × 2 = [T]")

    # the debrief on the wire, and the next door
    open_wire()
    check(get("order_field_wire_step") == "43" and "Fragment III is in my scarf" in wire_text(), "the chat reaches the Station 22 debrief")
    js("document.querySelector('#wire-choices-grid button').click()"); page.wait_for_timeout(9000)
    check(get("order_field_wire_step") == "44" and "FRAGMENT III SET" in wire_text() and "Fragment III Is Set" in bar(), "the debrief ends at step 44 with Fragment III set", bar())
    check("Automaton Orchestra" in bar_desc(), "the bar names the next room", bar_desc())
    page.reload(wait_until="load"); page.wait_for_timeout(2500)
    js("window.selectStageStation(42)"); page.wait_for_timeout(500)
    check(modal_open() and js("window.__gallery.pos()") == [-3, 0] and shown("gallery-victory") and not shown("gallery-bells-card"),
          "after a reload the room is still solved, Hermes on the west pin")
    ctx.close()

    # without sound every whisper is written and every bell glows
    ctx, page, errors2 = new_page(browser, {**seed, "order_ambience_muted": "true", "order_stage_pause_skipped_42": "true", "order_sheet_seal_42": "true",
                                             "order_whispering_gallery_focus": "true", "order_field_wire_step": "42"})
    page.goto(f"{BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("window.selectStageStation(42)"); page.wait_for_timeout(500)
    page.click("#btn-gallery-again"); page.wait_for_timeout(250)
    rang = 0
    for _ in range(16):
        rang = max(rang, page.evaluate("document.querySelectorAll('#gallery-bells .gallery-bell.is-ringing').length"))
        page.wait_for_timeout(200)
    check("sound is off" in page.evaluate("document.getElementById('gallery-sound').innerText") and rang == 1,
          "with the speaker off the room says so, and each bell of the tune glows as it rings")
    errors += errors2
    ctx.close()

    # the tester: Play this game lands where Hermes reaches the room
    ctx, page, errors3 = new_page(browser, {**seed, "the_eclipse_active_seeker": "Carles"})
    page.goto(f"{BASE}/index.html?tester=1", wait_until="load")
    page.wait_for_timeout(2500)
    node = page.evaluate("window.TesterDesert.jumpTo('s22')")
    check(node == 42 and page.evaluate("localStorage.getItem('order_field_wire_step')") == "42"
          and page.evaluate("localStorage.getItem('order_camera_obscura_completed')") == "true"
          and page.evaluate("localStorage.getItem('order_whispering_gallery_completed')") is None,
          "the tester's Play this game: Station 21 done, Station 22 open, the chat at step 42")
    errors += errors3
    check(not errors, "no JS errors in the gallery", "; ".join(sorted(set(errors))[:3]))
    ctx.close()


SECTIONS = {
    "pages": test_pages, "views": test_hub_views, "wire": test_wire_gating, "ledger": test_ledger_gating,
    "s14": test_sun_monolith, "s15": test_sandstone_labyrinth, "s16": test_cairn_four, "s17": test_solstice_arch,
    "s18": test_polybius_stele, "s19": test_oracle_horizon, "profiles": test_profiles, "tester": test_tester_play,
    "mirror": test_stage_mirror, "s20": test_masks_gate, "cloud": test_cloud_save,
    "hints": test_hint_ladder, "early": test_early_hints, "previously": test_previously,
    "notebook": test_notebook, "pause": test_stage_pause, "ashes": test_ashes,
    "ambience": test_ambience, "speaker": test_speaker, "letters": test_letters,
    "journey": test_journey, "seals": test_seals, "a11y": test_a11y, "offline": test_offline,
    "camera": test_camera_obscura, "gallery": test_whispering_gallery,
}
# The short pass skips the long desert games; keep the newest built station at the end of this list
QUICK = ["pages", "views", "wire", "ledger", "profiles", "tester", "cloud", "hints", "early", "previously", "notebook", "pause", "ambience", "ashes", "speaker", "letters", "journey", "seals", "a11y", "offline", "mirror", "gallery"]
REPORT = os.path.join(ROOT, "scripts", "audit", "smoke_report.json")


def run_section(key, chromium):
    """Runs one section in its own process and browser; the shared server lives in the parent."""
    out, start = io.StringIO(), time.time()
    failures.clear()  # a pool worker may run several sections one after another
    with contextlib.redirect_stdout(out):
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(executable_path=chromium) if chromium else p.chromium.launch()
                SECTIONS[key](browser)
                browser.close()
        except Exception:
            check(False, f"{key}: section crashed", traceback.format_exc(limit=3).strip().splitlines()[-1])
    text = out.getvalue()
    return {"section": key, "ok": not failures, "seconds": round(time.time() - start, 1),
            "checks": sum(line.startswith(("  ✓", "  ✗")) for line in text.splitlines()),
            "failures": list(failures), "output": text}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--chromium", help="path to a Chromium/Chrome binary (default: Playwright's own)")
    parser.add_argument("--quick", action="store_true", help="short pass: " + ", ".join(QUICK))
    parser.add_argument("--only", help="comma-separated section keys: " + ", ".join(SECTIONS))
    # Measured on the Operator's Mac (8 cores, Playwright's Chromium, 20-10-2026): --quick takes 259 s with 1 job,
    # 190 s with 2; with 3 the 3D map's WebGL shaders fail under load, and the desktop Chrome can stall for minutes
    parser.add_argument("--jobs", type=int, default=2, help="sections run at the same time (default 2; 1 = in this process)")
    args = parser.parse_args()

    keys = args.only.split(",") if args.only else QUICK if args.quick else list(SECTIONS)
    unknown = [k for k in keys if k not in SECTIONS]
    if unknown:
        parser.error(f"unknown section(s) {', '.join(unknown)}; choose from {', '.join(SECTIONS)}")

    server, start = start_server(), time.time()
    results = []
    if args.jobs <= 1:  # in this process, one section after another
        for key in keys:
            result = run_section(key, args.chromium)
            print(result["output"], end="", flush=True)
            results.append(result)
    else:
        with concurrent.futures.ProcessPoolExecutor(max_workers=args.jobs,
                                                    mp_context=multiprocessing.get_context("spawn")) as pool:
            futures = [pool.submit(run_section, key, args.chromium) for key in keys]
            for future in futures:  # printed in section order, whatever order they finish in
                result = future.result()
                print(result["output"], end="", flush=True)
                results.append(result)
    server.shutdown()

    failed = [f"{r['section']}: {f}" for r in results for f in r["failures"]]
    total = round(time.time() - start, 1)
    print("\nSeconds per section: " + " · ".join(f"{r['section']} {r['seconds']}" for r in results) + f" · total {total}")
    with open(REPORT, "w", encoding="utf-8") as f:
        json.dump({"ok": not failed, "seconds": total, "checks": sum(r["checks"] for r in results),
                   "sections": [{k: v for k, v in r.items() if k != "output"} for r in results]}, f, indent=2)
    partial = len(keys) < len(SECTIONS)
    if failed:
        print(f"\n❌ {len(failed)} FAILED: do not deploy yet.")
    else:
        print("\n✅ ALL GREEN" + (f" ({len(keys)} of {len(SECTIONS)} sections): run the full smoke before deploying."
                                  if partial else ": safe to deploy."))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
