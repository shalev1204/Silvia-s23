"""Station 18, the fixes of the audit: the empty fields, the breath on a phone, the turn at the hatch,
the numbers after repeated losses, the keyboard, the reward's count, and the station reopened when done.
Usage: python3 minor_s18.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8887
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_last_seen_at": str(int(time.time() * 1000)), "order_cairn_iv_completed": "true", "order_seal_cairn_4": "true",
             "order_arch_solstice_completed": "true", "order_seal_cairn_5": "true", "order_field_wire_step": "26"})
ok = True
def check(cond, msg):
    global ok
    print(("PASS " if cond else "FAIL ") + msg); ok = ok and bool(cond)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (390, 844, "phone")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        fb = lambda id_: js(f"(document.getElementById('{id_}')||{{}}).textContent") or ""
        js("window.openSteleModal()"); page.wait_for_timeout(1500)
        js("document.getElementById('btn-stele-howto-skip') && document.getElementById('btn-stele-howto-skip').click()")
        for fid in ('stele-key-input', 'stele-word-input'):
          fits = js("""(() => { const i = document.getElementById('""" + fid + """'); const c = document.createElement('canvas').getContext('2d');
            const cs = getComputedStyle(i, '::placeholder'); c.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
            const w = c.measureText(i.placeholder.toUpperCase()).width + i.placeholder.length * parseFloat(cs.letterSpacing || 0);
            return [Math.round(w), i.clientWidth - 24]; })()""")
          check(fits[0] <= fits[1], f"{tag}: the hint of {fid} fits its field ({fits[0]} <= {fits[1]})")
        page.screenshot(path=os.path.join(OUT, f"{tag}_01_fields.png"))
        page.fill("#stele-key-input", "STARS GUIDE THOSE WHO SEEK TRUTH"); page.click("#btn-stele-speak"); page.wait_for_timeout(300)
        for w in ("WHO", "SEEK", "WELL", "ASH"):
            js("window.__stele.stop()")
            if w == "SEEK": js(f"window.__stele.answer({json.dumps(js(chr(119)+'indow.__stele.knocksOf(' + repr(w) + ', true)'))})")
            else: js(f"window.__stele.read('{w}')")
        page.wait_for_timeout(800); js("window.__stele.settle()")
        # the keyboard moves Hermes
        t0 = js("window.__stele.state()")["run"]["t"]
        page.keyboard.press("ArrowUp"); page.wait_for_timeout(200)
        check(js("window.__stele.state()")["run"]["t"] == t0 + 1, f"{tag}: the arrow key takes a turn")
        # six losses: the flagstones show the turn they catch
        for _ in range(6):
            for _ in range(16):
                r = js("window.__stele.state()")["run"]
                if r["t"] == 0 and _ > 0: break
                js("window.__stele.move(0, 0)")
            js("window.__stele.settle()")
        js("window.__stele.frames(10)")
        check(js("window.__stele.world()")["numbers"] > 0, f"{tag}: after six losses the flagstones show their numbers ({js('window.__stele.world()')['numbers']})")
        page.wait_for_timeout(5000)
        page.screenshot(path=os.path.join(OUT, f"{tag}_02_breath_numbers.png"))
        if tag == "phone":
            bb = js("(()=>{const a=document.getElementById('stele3d-breath').getBoundingClientRect(),m=document.getElementById('stele3d-map-wrap').getBoundingClientRect();return [a.right,m.left];})()")
            check(bb[0] <= bb[1], f"phone: the breath ends before the map ({bb[0]:.0f} <= {bb[1]:.0f})")
        best, _ = W.atrium_search(js("window.__stele.atrium"))
        js("window.__stele.restart()")
        for dx, dy in best: js(f"window.__stele.move({dx}, {dy})")
        page.wait_for_timeout(300)
        st = js("window.__stele.state()")
        check(fb("stele-turn-label") == f"Turn {st['run']['t']}", f"{tag}: at the hatch the label shows the last turn ({fb('stele-turn-label')} / t={st['run']['t']})")
        page.screenshot(path=os.path.join(OUT, f"{tag}_03_hatch.png"))
        js("document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]').click()")
        for _ in range(60):
            if js("window.__stele.cine()"): js("window.__stele.skipCine()")
            if js("window.__stele.rewardOpen()"): break
            page.wait_for_timeout(500)
        page.wait_for_timeout(2500)
        stat = js("[...document.querySelectorAll('.drw-stats span, [class*=stats] span')].map(s=>s.parentNode.textContent).join(' | ')")
        check("1 times" not in stat, f"{tag}: reward count reads well ({stat})")
        page.screenshot(path=os.path.join(OUT, f"{tag}_04_reward.png"))
        js("window.closeSteleModal()"); page.wait_for_timeout(600)
        js("window.openSteleModal()"); page.wait_for_timeout(1500)
        check("Field Wire" in fb("stele-dispatch-text"), f"{tag}: reopened when done, Hermes points to the Field Wire")
        check(not js("document.getElementById('stele3d-subtitle').classList.contains('is-on')"), f"{tag}: no stale line on the scene")
        page.screenshot(path=os.path.join(OUT, f"{tag}_05_reopened.png"))
        check(not errors, f"{tag}: no page errors {errors[:3]}")
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
