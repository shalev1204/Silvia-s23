"""Contact sheet of the road relics. Run: python3 scratch/verifications/shoot_relics.py"""
import os
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
names = ["red_cord", "servant_coin", "ibis_figure", "statue_seal"]
html = "<body style='margin:0;background:#0c1220;display:flex;align-items:center;justify-content:center;gap:20px;padding:20px'>" + "".join(f"<div style='border:1px solid #d4af37;border-radius:12px;padding:10px;background:rgba(212,175,55,0.05)'><img src=\"file://{ROOT}/web/assets/items/item_{n}.png\" width=320 height=320 style='object-fit:contain'></div>" for n in names)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 360}); open("/tmp/relics.html","w").write(html); pg.goto("file:///tmp/relics.html"); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(os.path.dirname(__file__), "shots", "relics.png")); b.close()
