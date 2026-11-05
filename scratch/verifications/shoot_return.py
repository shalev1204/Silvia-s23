"""The return to the bronze doors (five seals home). Run: python3 scratch/verifications/shoot_return.py [humble bold observer trusted keepers lie]"""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
SC = {
    "humble": ("humble", {"regard": 1}, {}),
    "bold": ("bold", {"regard": 0, "duel": "won"}, {}),
    "observer": ("observer", {"seen": {"arch": True}, "lieHeard": True}, {}),
    "trusted": ("humble", {"regard": 5, "secret": True, "blessing": True, "coin": True, "lieCaught": True}, {}),
    "keepers": ("observer", {"statues": "riddle", "lieHeard": True}, {"order_inventory_relics": json.dumps(["falcon_weight", "ibis_figure"])}),
}
ONLY = sys.argv[1:] or list(SC)
seals = {f"order_seal_cairn_{i}": "true" for i in range(1, 6)}
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for name in ONLY:
        tone, flags, extra = SC[name]
        seed = dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles", order_gates_scene_completed="true", order_gates_path=tone,
                    order_gates_flags=json.dumps(flags), order_oasis_clepsydra_completed="true", **seals, **extra)
        ctx, page, errors = W.new_page(b, seed)
        page.set_viewport_size({"width": 1500, "height": 900})
        page.on("pageerror", lambda e: print("PAGEERROR", e))
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1200)
        page.evaluate("window.openGatesTowerIIModal({mode:'return', onDone:function(){window.__ret=1}})")
        page.wait_for_timeout(2500)
        def safe_skip():
            collect()
            try:
                page.evaluate("window.__gates && window.__gates.fast()")
            except Exception: pass
        def collect():
            if page.is_visible("#iac-btn-collect"): page.click("#iac-btn-collect"); page.wait_for_timeout(400)
        def ids(): return page.eval_on_selector_all("#gates-choices button", "b=>b.map(x=>x.id.replace('choice-',''))")
        def wait_choices():
            for _ in range(120):
                safe_skip()
                if page.is_visible("#iac-btn-collect"): page.click("#iac-btn-collect"); page.wait_for_timeout(300)
                if page.is_visible("#gates-choices button"): return
                page.wait_for_timeout(500)
            raise SystemExit(name + ": choices never appeared")
        wait_choices(); print(name, "menu", ids())
        page.click("#choice-rt_seals"); page.wait_for_timeout(500); wait_choices(); print(name, "menu", ids())
        page.screenshot(path=os.path.join(OUT, f"ret_{name}_sealed.png"))
        if "rt_ask" in ids(): page.click("#choice-rt_ask"); page.wait_for_timeout(500); wait_choices(); collect(); print(name, "menu", ids())
        if "rt_keepers" in ids(): page.click("#choice-rt_keepers"); page.wait_for_timeout(500); wait_choices(); collect(); print(name, "menu", ids())
        collect(); page.click("#choice-rt_open"); page.wait_for_timeout(500)
        for _ in range(120):
            safe_skip()
            if page.is_visible("#iac-btn-collect"): page.click("#iac-btn-collect"); page.wait_for_timeout(300)
            if page.is_visible("#gates-decree-card"): break
            page.wait_for_timeout(500)
        page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(OUT, f"ret_{name}_open.png"))
        print(name, "card", page.inner_text("#gates-decree-card .gates-decree-title"), "|", page.inner_text("#btn-gates-depart"))
        page.click("#btn-gates-depart"); page.wait_for_timeout(600)
        print(name, "state", page.evaluate("[localStorage.order_gates_return, window.__ret, localStorage.order_inventory_relics]"))
        print(name, "errors", sorted(set(errors))[:6])
        ctx.close()
    b.close()
server.shutdown()
