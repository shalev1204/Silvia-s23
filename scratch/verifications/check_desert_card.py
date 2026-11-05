"""A desert-map pin shows the station card and does not open the game. The card's button does."""
import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright

def check(ok, label, detail=""):
    print(("  ✓ " if ok else "  ✗ ") + label + (("  (" + detail + ")") if detail and not ok else ""))
    return ok

server = W.start_server()
fails = 0
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    now = int(time.time() * 1000)
    cases = [
        ("walking", dict(W.DESERT_BASE, order_desert_lexicon_completed="true", order_oasis_clepsydra_completed="true",
                         order_gates_scene_completed="true", order_monolith_march_hours="12",
                         order_monolith_march_start=str(now - 3600 * 1000), order_field_wire_step="10",
                         order_active_map_path="desert"),
         "The Sun Monolith", False),
        ("done", dict(W.DESERT_BASE, order_desert_lexicon_completed="true", order_oasis_clepsydra_completed="true",
                      order_gates_scene_completed="true", order_sun_monolith_completed="true", order_seal_cairn_2="true",
                      order_field_wire_step="12", order_active_map_path="desert"),
         "The Sun Monolith & Cairn II", True),
    ]
    for name, seed, title, then_open in cases:
        ctx, page, errors = W.new_page(b, seed)
        page.set_viewport_size({"width": 1280, "height": 900})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1500)
        page.evaluate("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(400)
        page.evaluate("window.showDesertMap && window.showDesertMap(false)"); page.wait_for_timeout(4000)
        pin = page.locator('.d3-pin[aria-label="14 · THE SUN MONOLITH"]')
        pin.click()
        page.wait_for_timeout(600)
        modal = page.evaluate("getComputedStyle(document.getElementById('modal-sun-monolith')).display")
        got = page.inner_text("#insp-title")
        ok = modal == "none" and got == title
        fails += not check(ok, name + ": pin shows the card, the game stays shut", "modal=%s title=%s" % (modal, got))
        if then_open and ok:
            page.click("#insp-btn-primary")
            page.wait_for_timeout(800)
            modal2 = page.evaluate("getComputedStyle(document.getElementById('modal-sun-monolith')).display")
            fails += not check(modal2 != "none", "the card's button opens the game", modal2)
        if errors: print("  errors", errors[:2])
        ctx.close()
    b.close()
server.shutdown()
sys.exit(1 if fails else 0)
