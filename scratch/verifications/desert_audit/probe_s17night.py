"""S17 by night from her save: why the sand around the courtyard looks like day. Usage: python3 probe_s17night.py SAVE.json OUT [PORT]"""
import json, sys
from playwright.sync_api import sync_playwright
from walk_common import Walk, W
st, OUT = json.load(open(sys.argv[1])), sys.argv[2]; PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 8917
W.start_server(port=PORT)
with sync_playwright() as p:
    w = Walk(p, OUT, st, PORT); js = w.js
    w.open(); js("window.openSolsticeModal ? window.openSolsticeModal() : window.selectDesertStation(12)"); w.wait(2500)
    for i in range(60):
        if js("window.__cairn5 && window.__cairn5.cine()"): js("window.__cairn5.skipCine()")
        w.wait(300)
    js("(h => h && (h.hidden = true))(document.getElementById('solstice3d-howto'))"); w.wait(1500)
    w.shot("night")
    print(js("""(() => { const G = window.__cairn5.gfx(); const out = {world: window.__cairn5.world()};
      out.hemi = G.hemi.intensity; out.key = G.key.intensity; out.fog = G.scene ? G.scene.fog.color.getHexString() : null;
      const ms = []; (G.scene || {traverse(){}}).traverse(o => { if (o.isMesh && o.geometry && o.geometry.parameters && o.geometry.parameters.width === 700) ms.push(o.material.type + ' ' + o.material.color.getHexString() + ' em ' + (o.material.emissive ? o.material.emissive.getHexString() : '-')); });
      out.ground = ms; out.keys = Object.keys(G).slice(0, 60); return out; })()"""))
    w.page.fill("#solstice-key-input", "DAYBREAK"); w.page.click("#btn-solstice-speak"); w.wait(4000); w.shot("night_after_sigil")
    js("window.__cairn5.lamp('lit')"); js("window.__cairn5.startDawn()"); w.wait(6000); w.shot("dawn_ray1")
    print("dawn", js("window.__cairn5.world().sky"))
    w.close(); print("errors", w.errors[:4])
