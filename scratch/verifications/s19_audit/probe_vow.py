"""Where the vow's words and buttons sit once the WHEN is read (Station 19). Usage: python3 probe_vow.py OUT_DIR"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; PORT = 8885
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
save = dict(W.DESERT_BASE, **W.DESERT_DONE, **W.ORACLE_SEED_EXTRA)
save.update({"order_field_wire_step": "30", "order_gates_return": json.dumps({"done": True, "sealed": True}),
             "order_oracle_key": "turned", "order_oracle_lamp": "lit", "order_oracle_awake": "true", "order_oracle_disc": "0,0,0",
             "order_oracle_when_read": "true", "order_oracle_weigh_step": "3", "order_oracle_howto": "seen"})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("window.openOracleModal()"); page.wait_for_timeout(4000)
    print(page.evaluate("""(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), getComputedStyle(e).display, getComputedStyle(e).position]; };
      return { tiles: r('#oracle-tiles'), row: r('#oracle-vow-game .pillars-row'), unsay: r('#btn-oracle-unsay'), tile0: r('#oracle-tiles button'), inner: r('#oracle-vow-game .monolith-game-inner'), game: r('#oracle-vow-game'),
        tilesCss: getComputedStyle(document.getElementById('oracle-tiles')).cssText.length, tilesH: document.getElementById('oracle-tiles').style.cssText, n: document.querySelectorAll('#oracle-tiles button').length,
        locked: document.getElementById('oracle-vow-game').className }; })()"""))
    page.locator('#oracle-vow-game').scroll_into_view_if_needed(); page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(OUT, "vow.png"))
    print(errors[:3]); b.close()
