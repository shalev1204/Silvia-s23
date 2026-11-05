"""Skip must not stay on: time a reply after pressing Skip. Run: python3 scratch/verifications/pace_gates.py"""
import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    ctx, page, errors = W.new_page(b, dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles"))
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1200)
    page.evaluate("window.openGatesTowerIIModal()")
    page.wait_for_selector("#gates-log", state="visible"); page.wait_for_timeout(1500)
    page.evaluate("window.__gates.fast()")
    page.wait_for_selector("#gates-choices button", timeout=60000)
    page.click("#choice-greet")
    t = time.time(); page.wait_for_timeout(300)
    page.wait_for_selector("#gates-choices button", timeout=90000)
    print("reply after skipping the intro took %.1f s" % (time.time() - t), "fast flag", page.evaluate("window.__gates.dlg().fast"))
    b.close()
server.shutdown()
