"""Pull the three hand-drawn roads (red 9 h, blue 12 h, green 14 h) out of the Operator's screenshot as pixel polylines."""
import json, sys, collections
import numpy as np, cv2
SRC = sys.argv[1]
im = cv2.imread(SRC)            # BGR
b, g, r = [im[:, :, i].astype(int) for i in range(3)]
masks = {
    "red": (r > 190) & (g < 90) & (b < 70),
    "green": (g > 200) & (r < 90) & (b < 90),
    "blue": (b > 215) & (r < 70) & (g < 110),
}
def thin(m):
    m = (m.astype(np.uint8) * 255)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    try:
        return cv2.ximgproc.thinning(m) > 0
    except Exception:
        pass
    # Zhang-Suen
    img = (m > 0).astype(np.uint8)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            P = np.pad(img, 1)
            p2, p3, p4, p5, p6, p7, p8, p9 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:], P[2:, 2:], P[2:, 1:-1], P[2:, :-2], P[1:-1, :-2], P[:-2, :-2]
            nb = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
            seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
            trans = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(int) for i in range(8))
            if step == 0: c = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else: c = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            rm = (img == 1) & (nb >= 2) & (nb <= 6) & (trans == 1) & c
            if rm.any(): img[rm] = 0; changed = True
    return img > 0
def trace(sk):
    ys, xs = np.nonzero(sk)
    pts = set(zip(xs.tolist(), ys.tolist()))
    def nbrs(p):
        x, y = p
        return [(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx or dy) and (x + dx, y + dy) in pts]
    def bfs(s):
        d = {s: 0}; q = collections.deque([s]); prev = {}
        while q:
            u = q.popleft()
            for v in nbrs(u):
                if v not in d: d[v] = d[u] + 1; prev[v] = u; q.append(v)
        far = max(d, key=d.get)
        return far, prev
    a, _ = bfs(next(iter(pts)))
    b2, prev = bfs(a)
    path = [b2]
    while path[-1] != a: path.append(prev[path[-1]])
    return path[::-1]
out = {}
for k, m in masks.items():
    sk = thin(m)
    path = trace(sk)
    print(k, "mask px", int(m.sum()), "skeleton", int(sk.sum()), "path", len(path), path[0], path[-1])
    out[k] = path
json.dump(out, open("scratch/maps/erg_routes_px.json", "w"))
vis = im.copy()
col = {"red": (0, 0, 255), "green": (0, 255, 0), "blue": (255, 0, 0)}
for k, path in out.items():
    for (x, y) in path: cv2.circle(vis, (x, y), 1, (255, 255, 255), -1)
cv2.imwrite("scratch/maps/erg_routes_trace.png", vis)
