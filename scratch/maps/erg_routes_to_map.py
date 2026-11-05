"""Turn the pixel roads of the screenshot into journal-map coordinates by inverting the 3D camera (relief included)."""
import os, sys, json, time
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
px = json.load(open(os.path.join(ROOT, "scratch/maps/erg_routes_px.json")))
SW, SH = 1024, 797
XS = list(range(0, 1921, 24)); YS = list(range(150, 2101, 24))
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    now = int(time.time() * 1000)
    seed = dict(W.DESERT_BASE, order_desert_lexicon_completed="true", order_oasis_clepsydra_completed="true", order_gates_scene_completed="true",
                order_monolith_march_start=str(now - 3600 * 1000), order_active_map_path="desert", order_field_wire_step="10")
    ctx, page, errors = W.new_page(b, seed)
    page.set_viewport_size({"width": SW + 700, "height": SH + 500})
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1500)
    page.evaluate("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(500)
    page.evaluate("window.showDesertMap && window.showDesertMap(false)"); page.wait_for_timeout(3500)
    page.evaluate(f"(() => {{ const s = document.getElementById('desert3d-stage'); s.style.width = '{SW}px'; s.style.height = '{SH}px'; s.style.flex = 'none'; s.style.aspectRatio = 'auto'; window.dispatchEvent(new Event('resize')); }})()")
    page.wait_for_timeout(2500)
    grid = page.evaluate("([xs, ys]) => ys.map(y => xs.map(x => { const q = window.Desert3D.project(x, y); return [q.x, q.y]; }))", [XS, YS])
    anchors = {k: page.evaluate(f"window.Desert3D.project({x},{y})") for k, (x, y) in {"mono": (1262, 430), "lab": (1640, 770), "cairn1": (538, 1203), "gates": (1560, 1660)}.items()}
    b.close()
server.shutdown()
G = np.array(grid)                                   # [row=y][col=x][2]
user = {"mono": (540, 88), "lab": (815, 315), "cairn1": (15, 570)}
A = np.array([[anchors[k]["x"], 1, 0] for k in user] + [[anchors[k]["y"], 0, 1] for k in user], float)
# user = s * mine + t  (same scale in x and y)
rows = []; rhs = []
for k, (ux, uy) in user.items():
    rows.append([anchors[k]["x"], 1, 0]); rhs.append(ux)
    rows.append([anchors[k]["y"], 0, 1]); rhs.append(uy)
sol, *_ = np.linalg.lstsq(np.array(rows, float), np.array(rhs, float), rcond=None)
s, tx, ty = sol
print("scale", s, "offset", tx, ty)
for k, (ux, uy) in user.items():
    print(k, "fit", s * anchors[k]["x"] + tx, s * anchors[k]["y"] + ty, "want", ux, uy)
print("gates lands at", s * anchors["gates"]["x"] + tx, s * anchors["gates"]["y"] + ty)
def to_mine(u):  # user px -> my stage px
    return ((u[0] - tx) / s, (u[1] - ty) / s)
flat = G.reshape(-1, 2)
def invert(u):
    m = np.array(to_mine(u))
    i = int(np.argmin(((flat - m) ** 2).sum(1)))
    r, c = divmod(i, len(XS))
    # local affine from neighbours
    for _ in range(4):
        r0, r1 = max(r - 1, 0), min(r + 1, len(YS) - 1); c0, c1 = max(c - 1, 0), min(c + 1, len(XS) - 1)
        Jx = (G[r, c1] - G[r, c0]) / (XS[c1] - XS[c0]); Jy = (G[r1, c] - G[r0, c]) / (YS[r1] - YS[r0])
        J = np.array([Jx, Jy]).T
        d = np.linalg.solve(J, m - G[r, c])
        x, y = XS[c] + d[0], YS[r] + d[1]
        break
    return float(x), float(y)
def resample(path, step):
    pts = np.array(path, float); out = [pts[0]]; acc = 0
    for a, b2 in zip(pts[:-1], pts[1:]):
        acc += np.hypot(*(b2 - a))
        if acc >= step: out.append(b2); acc = 0
    out.append(pts[-1]); return np.array(out)
def smooth(a, k=2):
    out = a.copy()
    for i in range(len(a)):
        lo, hi = max(0, i - k), min(len(a), i + k + 1); out[i] = a[lo:hi].mean(0)
    out[0], out[-1] = a[0], a[-1]; return out
green = px["green"][::-1]                       # bottom -> monolith
def with_tail(own, top_pt):
    g = np.array(green); j = int(np.argmin(((g - np.array(top_pt)) ** 2).sum(1)))
    return own + [tuple(p) for p in green[j:]]
roads = {
    "fast": with_tail(px["red"][::-1], px["red"][0]),
    "mid": with_tail(px["blue"][::-1], px["blue"][0]),
    "long": green,
}
out = {}
for k, path in roads.items():
    rs = smooth(resample(path, 14), 2)
    mp = [invert(tuple(u)) for u in rs]
    mp = smooth(np.array(mp), 1)
    mp = resample(mp, 42)
    out[k] = [[round(float(x)), round(float(y))] for x, y in mp]
    print(k, len(out[k]), out[k][0], out[k][-1])
json.dump(out, open(os.path.join(ROOT, "scratch/maps/erg_routes_map.json"), "w"))
