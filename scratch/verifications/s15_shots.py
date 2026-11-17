"""Screenshots of Station 15 for a visual check: a find glinting in the dark, the outro film, the reward (0/3 and 3/3).
Usage: python3 scratch/verifications/s15_shots.py OUT_DIR"""
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
server = W.start_server()
seed = dict(W.DESERT_BASE, **W.DESERT_DONE, order_sun_monolith_completed="true", order_sun_monolith_awake="true",
            order_seal_cairn_2="true", order_monolith_gate_seal1="true", order_field_wire_step="14",
            order_field_wire_choices="[2,0,1,0,0,0,1,0,0,0,0,0,0,0]", order_labyrinth_awake="true",
            order_labyrinth_march_start=str(int(time.time() * 1000) - 7 * 3600 * 1000), **W.WIRE_PASSED)
with sync_playwright() as p:
    browser = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(browser, seed)
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    js("localStorage.removeItem('order_labyrinth_cine_outro')")
    js("window.openLabyrinthModal()"); page.wait_for_timeout(1500)
    level, reach = js("window.__labyrinth.level"), js("window.__labyrinth.reach")
    finds = js("window.__labyrinth.finds")
    page.screenshot(path=f"{out}/1_start.png")
    # walk toward the lamp and stop two squares short so its glint shows
    goal = tuple(next(f["at"] for f in finds if f["id"] == "lamp"))
    road = W.solve_escape(level, reach, goal=goal)
    for dx, dy in road[:-2]:
        js(f"window.__labyrinth.step({dx}, {dy})")
    page.wait_for_timeout(1200); page.screenshot(path=f"{out}/2_glint.png")
    for dx, dy in road[-2:]:
        js(f"window.__labyrinth.step({dx}, {dy})")
    page.wait_for_timeout(1500); page.screenshot(path=f"{out}/3_pickup.png")
    if js("getComputedStyle(document.getElementById('modal-item-acquired')).display") == "flex":
        js("window.closeItemAcquiredModal()"); page.wait_for_timeout(400)
    # then on to the exit
    rest = W.solve_escape(level, reach, start=goal, goal=tuple(level["exit"]), t0=len(road))
    for dx, dy in rest:
        js(f"window.__labyrinth.step({dx}, {dy})")
    for i, wait in enumerate([3500, 4500, 5000]):
        page.wait_for_timeout(wait); page.screenshot(path=f"{out}/4_film_{i}.png")
    page.wait_for_timeout(6000); page.screenshot(path=f"{out}/5_reward.png")
    js("(r => r.scrollTop = 1e5)(document.querySelector('#modal-sandstone-labyrinth .chasm3d-reward'))"); page.wait_for_timeout(500)
    page.screenshot(path=f"{out}/5b_reward_bottom.png")
    page.set_viewport_size({"width": 390, "height": 844}); page.wait_for_timeout(800)
    page.screenshot(path=f"{out}/6_reward_mobile.png", full_page=False)
    print("errors:", errors)
    browser.close()
server.shutdown()
