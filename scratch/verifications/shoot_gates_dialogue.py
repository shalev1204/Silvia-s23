"""Three different roads through the Gates of Tower II. Run: python3 scratch/verifications/shoot_gates_dialogue.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
seed = dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles")
server = W.start_server()
FIN = "document.getAnimations().forEach(a=>{try{a.finish()}catch(e){}})"
ROADS = {
    "humble": ["greet", "name", "diary", "seal", "where", "goal", "lie_catch", "blessing", "go"],
    "bold": ["demand", "t6", "t12", "name", "oil", "seal", "where", "go"],
    "observer": ["study", "look_staff", "look_fire", "look_done", "name", "seal", "where", "go"],
    "proven": ["demand", "t8", "name", "seal", "where", "go"],
    "duelwin": ["demand", "duel_open", "duel_yes", "dl_fire", "d1_4", "dl_tracks", "d2_2", "dl_arch", "d3_b", "dp_oracle", "name", "seal", "where", "go"],
    "duelloss": ["demand", "duel_open", "duel_yes", "d1_3", "d2_1", "d3_a", "t6", "t12", "t8", "name", "seal", "where", "go"],
    "statues": ["study", "look_arch", "look_statues", "look_done", "name", "statue_read", "sr_fj", "sr_fi", "seal", "where", "goal", "lie_catch", "go"],
}
ONLY = sys.argv[1:] or list(ROADS)
def collect(page):
    if page.is_visible("#iac-btn-collect"): page.click("#iac-btn-collect"); page.wait_for_timeout(300)
def skip(page):
    collect(page)
    try:
        page.evaluate("window.__gates && window.__gates.fast()")
    except Exception: pass
def ids(page): return page.eval_on_selector_all("#gates-choices button", "b=>b.map(x=>x.id.replace('choice-',''))")
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for road, seq in [(r, ROADS[r]) for r in ONLY]:
        ctx, page, errors = W.new_page(b, seed)
        page.set_viewport_size({"width": 1500, "height": 900})
        page.on("pageerror", lambda e: print("PAGEERROR", e))
        page.goto(f"{W.BASE}/index.html", wait_until="load")
        page.wait_for_timeout(1200)
        page.evaluate("window.openGatesTowerIIModal()")
        page.wait_for_timeout(2500); page.evaluate(FIN)
        for c in seq:
            collect(page)
            skip(page)
            page.wait_for_selector("#gates-choices button", timeout=90000)
            page.wait_for_timeout(300)
            avail = ids(page)
            print(road, "|", c, "in", avail)
            if c not in avail: print("  !! missing", c); break
            page.click("#choice-" + c)
            page.wait_for_timeout(500)
            collect(page)
            skip(page)
            page.wait_for_timeout(600)
            for _ in range(40):
                collect(page)
                if page.is_visible("#gates-choices button"): break
                page.wait_for_timeout(500)
        page.wait_for_selector("#gates-decree-card", state="visible", timeout=90000)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(OUT, f"r_{road}.png"))
        print(road, "flags", page.evaluate("[localStorage.order_gates_scene_completed, localStorage.order_gates_path, localStorage.order_gates_flags, localStorage.order_monolith_march_hours, localStorage.order_inventory_relics]"))
        print(road, "errors", sorted(set(errors))[:6])
        ctx.close()
    b.close()
server.shutdown()
