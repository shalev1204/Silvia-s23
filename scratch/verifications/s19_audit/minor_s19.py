"""Station 19, the fixes of the audit: her name stays hidden until the veil, the vow's words never run under its buttons,
a short screen is brought to the vow when the WHEN is read, and the reward's counts read well; Mac, small laptop and phone.
Usage: python3 minor_s19.py OUT_DIR [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8884
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
save = dict(W.DESERT_BASE, **W.DESERT_DONE, **W.ORACLE_SEED_EXTRA)
save.update({"order_field_wire_step": "30", "order_gates_return": json.dumps({"done": True, "sealed": True}),
             "order_oracle_key": "turned", "order_oracle_lamp": "lit", "order_oracle_awake": "true", "order_oracle_disc": "000",
             "order_oracle_disc_turns": "1", "order_oracle_howto": "seen", "order_oracle_cine_intro": "seen"})
ok = True
def check(cond, msg):
    global ok
    print(("PASS " if cond else "FAIL ") + msg); ok = ok and bool(cond)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1280, 720, "small"), (390, 844, "phone")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        js("window.openOracleModal()"); page.wait_for_timeout(2500)
        js("""window.__subs = []; new MutationObserver(() => window.__subs.push(document.getElementById('oracle3d-subtitle').textContent))
              .observe(document.getElementById('oracle3d-subtitle'), { childList: true, characterData: true, subtree: true });""")
        js("['banana','cold','dread'].forEach(w => window.__oracle.word(w))")   # three wrong words: she adds a line
        js("window.__oracle.word('fear')"); js("window.__oracle.weigh(17)"); js("window.__oracle.weigh(18)"); page.wait_for_timeout(300)
        js("window.__oracle.word('lux')"); js("window.__oracle.expireLight()"); js("window.__oracle.moon()")
        js("window.__oracle.weigh(20)"); page.wait_for_timeout(300)
        js("window.__oracle.word('era')"); js("window.__oracle.weigh(12)")
        page.wait_for_timeout(2500)
        subs = js("window.__subs")
        check(subs and not any("Aurelia" in s for s in subs), f"{tag}: no line before the veil calls her Aurelia ({len(subs)} lines)")
        inview = js("""(() => { const v = document.getElementById('oracle-tiles').getBoundingClientRect(); return v.top >= 0 && v.bottom <= innerHeight; })()""")
        check(inview, f"{tag}: once the WHEN is read, the words of the vow are on the screen")
        rects = js("""(() => { const t = document.getElementById('oracle-tiles').getBoundingClientRect(), r = document.querySelector('#oracle-vow-game .pillars-row').getBoundingClientRect(),
                     last = [...document.querySelectorAll('#oracle-tiles button')].pop().getBoundingClientRect(), peb = document.getElementById('btn-oracle-pebble');
                     return [Math.round(last.bottom), Math.round(r.top), peb && !peb.hidden ? Math.round(peb.getBoundingClientRect().height) : 0]; })()""")
        check(rects[0] <= rects[1] and rects[2] <= 60, f"{tag}: the last word ends above the buttons ({rects[0]} <= {rects[1]}), the satchel button is {rects[2]} px tall")
        page.screenshot(path=os.path.join(OUT, f"{tag}_01_vow.png"))
        tiles = js("window.__oracle.tiles")
        for w in ["YOU", "WERE", "ALWAYS", "THE", "TREASURE"]: js(f"window.__oracle.say({tiles.index(w)})")
        js("window.__oracle.vow()")
        for _ in range(60):
            if js("window.__oracle.cine()"): js("window.__oracle.skipCine()")
            if js("window.__oracle.rewardOpen()"): break
            page.wait_for_timeout(500)
        page.wait_for_timeout(1500)
        stat = js("[...document.querySelectorAll('.oracle-reward .drw-stats > div, .oracle-reward [class*=stats] > div')].map(d => d.textContent).join(' | ')")
        check("1unsettled weighing" in stat and "1turn of" in stat and "1try at the vow" in stat and "1sigil try" in stat, f"{tag}: the reward's counts read well ({stat})")
        page.screenshot(path=os.path.join(OUT, f"{tag}_02_reward.png"))
        check(not errors, f"{tag}: no page errors {errors[:3]}")
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
