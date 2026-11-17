"""Audit (part 4): the Station 15 reward card with Silvia's save, as the reference for Station 16 (decision A-42).
Usage: python3 scratch/verifications/s16_audit/s15_reward_ref.py OUT_DIR"""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
W.BASE = "http://127.0.0.1:8894"; server = W.start_server(port=8894)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, dict(save, **W.SILVIA))
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{W.BASE}/index.html?cloud=0", wait_until="load"); page.wait_for_timeout(3000)
    page.evaluate("window.openLabyrinthModal()"); page.wait_for_timeout(2000)
    page.evaluate("window.__labyrinth.showReward()"); page.wait_for_timeout(600); page.screenshot(path=f"{OUT}/s15_reward_t0.6s.png")
    page.wait_for_timeout(5000); page.screenshot(path=f"{OUT}/s15_reward_t5.6s.png")
    print(errors[:3]); b.close()
server.shutdown()
