"""S16 audit, part 1: Hermes reaches Cairn IV while the Grand Desert Map is open (card selected after the clock was moved),
then she presses the card's button. Usage: python3 scratch/verifications/s16_audit/part1_arrival_map.py OUT_DIR"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts", "audit")); sys.path.insert(0, HERE)
import web_smoke as W  # noqa: E402
from load_save import save  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]
W.BASE = "http://127.0.0.1:8841"; server = W.start_server(port=8841)
H18 = 18 * 3600 * 1000
CARD = "[...document.querySelectorAll('[id^=insp]')].filter(e => e.offsetParent && e.children.length === 0 && e.textContent.trim()).map(e => e.id + '=' + e.textContent.trim().slice(0,90))"
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.add_init_script("window.__wireFast = false; delete window.__wireAllChapters;")
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(4000)
    js(f"localStorage.setItem('order_cairn4_march_start', String(Date.now() - {H18} + 10000))")
    js("window.selectMapNode(25, true)"); page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT}/e_map_countdown.png")
    print("before:", js(CARD))
    page.wait_for_timeout(13000)
    page.screenshot(path=f"{OUT}/e_map_at_zero.png")
    print("after:", js(CARD))
    print("HUD:", js("document.querySelector('.desert3d-hud-text').textContent"))
    print("btns:", js("[...document.querySelectorAll('#view-trail button, #view-trail a')].filter(b => b.offsetParent && /SENTRY|WAY/i.test(b.innerText)).map(b => [b.tagName, b.id, b.className, b.disabled, b.innerText])"))
    js("[...document.querySelectorAll('#view-trail button, #view-trail a')].find(b => b.offsetParent && /WAKE THE SENTRY/i.test(b.innerText)).click()"); page.wait_for_timeout(6000)
    page.screenshot(path=f"{OUT}/e_enter_spyglass.png")
    print("modals:", js("[...document.querySelectorAll('[id^=modal-]')].filter(m => m.getBoundingClientRect().width > 0 && getComputedStyle(m).visibility !== 'hidden' && getComputedStyle(m).display !== 'none').map(m => m.id)"))
    print("spy text:", js("(document.getElementById('modal-bridge-spyglass')||{}).innerText ? document.getElementById('modal-bridge-spyglass').innerText.replace(/\\s+/g,' ').slice(0,900) : null"))
    page.wait_for_timeout(8000)
    page.screenshot(path=f"{OUT}/e_enter_spyglass_2.png")
    print("spy text 2:", js("document.getElementById('modal-bridge-spyglass').innerText.replace(/\\s+/g,' ').slice(0,1500)"))
    print("errors:", errors[:8])
    b.close()
server.shutdown()
