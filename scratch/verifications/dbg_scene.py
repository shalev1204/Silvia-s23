import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
gate = json.dumps({"seen0": True, "reply0": 0, "seen1": True, "reply1": 0, "seen2": True, "reply2": 0, "seen3": True, "reply3": 0, "seen4": True, "reply4": 0})
seed = dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles", order_desert_lexicon_completed="true", order_field_wire_step="6", order_clepsydra_march_start="1", order_clepsydra_march_bypassed="true", order_clepsydra_howto="seen", order_chasm_wire=gate)
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    ctx, page, errors = W.new_page(b, seed)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2000)
    page.evaluate("window.__visions.open()"); page.wait_for_timeout(4000)
    for name, js in [("noterrain", "G.scene.children[1].visible=false"), ("noridge", "G.scene.children[1].visible=true;G.scene.children[2].visible=false;G.scene.children[3].visible=false"), ("skyonly", "G.scene.children[1].visible=false;G.scene.children[2].visible=false;G.scene.children[3].visible=false")]:
        page.evaluate("(()=>{const G=window.__visions.world();" + js + "})()")
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(os.path.dirname(__file__), "shots", "dbg_" + name + ".png"))
    print(page.evaluate("(()=>{const G=window.__visions.world();const m=G.scene.children[0].material;return m.uniforms.uHorizon.value.getHexString()+' '+G.scene.children[2].geometry.attributes.color.array.slice(0,6).join(',')+' '+G.scene.children[2].geometry.attributes.position.array.slice(0,6).join(',')})()"))
    print(errors[:3])
    b.close()
server.shutdown()
