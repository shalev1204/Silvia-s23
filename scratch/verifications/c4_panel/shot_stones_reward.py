"""Cairn IV: a click on the row of stones marks the fissure; the reward screen after the third verse (Mac and iPad).
Usage: python3 shot_stones_reward.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8891
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_cairn4_march_start": str(int(time.time() * 1000) - 19 * 3600 * 1000), "order_bridge_spyglass": '{"done":true,"choice":"hide"}',
             "order_cairn4_awake": "true", "order_cairn4_cine_intro": "seen", "order_cairn4_howto": "seen", "order_last_seen_at": str(int(time.time() * 1000))})
STONE = """(([side, d]) => { const G = window.__cairn4.gfx(); const v = new G.T.Vector3((side === 'L' ? -1 : 1) * 3.4, 0.06, -d * 0.5).project(G.camera);
  const r = document.getElementById('pillars3d-canvas').getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; })"""
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        page.evaluate("window.openCairnFourModal()"); page.wait_for_timeout(4500)
        page.evaluate("document.querySelectorAll('button').forEach(b => { if (/Continue the story/i.test(b.textContent) && b.offsetParent) b.click(); })"); page.wait_for_timeout(400)
        res = []
        for side, d in (("L", 30), ("L", 45), ("R", 25)):
            pt = page.evaluate(STONE, [side, d]); page.mouse.move(pt["x"], pt["y"]); page.wait_for_timeout(200)
            if side == "L" and d == 30: page.screenshot(path=os.path.join(OUT, f"{tag}_stone_hover.png"))
            page.mouse.click(pt["x"], pt["y"]); page.wait_for_timeout(200)
        print(tag, "slots:", page.evaluate("document.getElementById('pillars-slots').innerText.replace(/\\n/g, ' | ')"))
        page.screenshot(path=os.path.join(OUT, f"{tag}_stones_marked.png"))
        page.evaluate("window.__cairn4.sing()"); page.wait_for_timeout(300)
        for vi in (1, 2):
            for c in page.evaluate("window.__cairn4.verses")[vi]["calls"]:
                page.evaluate(f"window.__cairn4.mark('{c['side']}{c['d']}')")
            page.evaluate("window.__cairn4.sing()"); page.wait_for_timeout(300)
        page.screenshot(path=os.path.join(OUT, f"{tag}_panel_done.png"))
        page.wait_for_timeout(11500)
        print(tag, "reward open:", page.evaluate("window.__cairn4.rewardOpen()"))
        page.wait_for_timeout(6500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_reward_top.png"))
        page.evaluate("document.querySelector('#modal-cairn-four .chasm3d-reward').scrollTop = 9999"); page.wait_for_timeout(300)
        page.screenshot(path=os.path.join(OUT, f"{tag}_reward_bottom.png"))
        page.click("#modal-cairn-four .chasm3d-reward-stay"); page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(OUT, f"{tag}_after_stay.png"))
        print(tag, "errors", errors)
        ctx.close()
    b.close()
