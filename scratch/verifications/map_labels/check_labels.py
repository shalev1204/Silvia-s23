"""Every station name that opens over a pin of the 3D desert map stays inside the map (Mac, iPad, phone), also at the edges.
Usage: python3 check_labels.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8897
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_last_seen_at": str(int(time.time() * 1000))})
JS = """() => {
  const st = document.querySelector('.desert3d-markers').getBoundingClientRect(), out = [];
  document.querySelectorAll('.d3-marker').forEach(m => {
    const l = m.querySelector('.d3-label'); if (!l) return;
    m.classList.add('is-active'); l.style.transition = 'none'; l.style.opacity = '1';
  });
  return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.d3-marker').forEach(m => {
      const l = m.querySelector('.d3-label'); if (!l) return;
      const r = l.getBoundingClientRect(), p = m.getBoundingClientRect();
      const onMap = p.right > st.left && p.left < st.right && p.bottom > st.top && p.top < st.bottom;
      if (!onMap) return;
      out.push({ t: l.textContent.slice(0, 40), out: r.left < st.left - 0.5 || r.right > st.right + 0.5 || r.top < st.top - 0.5 || r.bottom > st.bottom + 0.5,
                 l: Math.round(r.left - st.left), r: Math.round(st.right - r.right), top: Math.round(r.top - st.top), bot: Math.round(st.bottom - r.bottom) });
    });
    res({ n: out.length, bad: out.filter(o => o.out), stage: [Math.round(st.width), Math.round(st.height)] });
  })));
}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad"), (390, 844, "phone")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
        page.evaluate("document.querySelector('[data-view=\"view-trail\"]') && document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(1500)
        page.evaluate("window.switchMapPath && window.switchMapPath('desert', true)"); page.wait_for_timeout(2500)
        page.evaluate("document.querySelector('.desert3d-markers').scrollIntoView({block: 'center'})"); page.wait_for_timeout(1800)
        res = page.evaluate(JS)
        print(tag, res["stage"], "labels on the map:", res["n"], "outside:", len(res["bad"]), res["bad"][:4], "errors", errors[:2])
        page.screenshot(path=os.path.join(OUT, f"{tag}_map_labels.png"))
        # pan the map to every side and check again
        for dx, dy in ((500, 0), (-500, 0), (0, 300), (0, -300)):
            c = page.evaluate("(() => { const r = document.querySelector('.desert3d-markers').getBoundingClientRect(); return [r.left + r.width / 2, Math.max(60, Math.min(innerHeight - 60, r.top + r.height / 2))]; })()")
            page.mouse.move(c[0], c[1]); page.mouse.down(); page.mouse.move(c[0] + dx * 0.4, c[1] + dy * 0.4, steps=8); page.mouse.up(); page.wait_for_timeout(500)
            r2 = page.evaluate(JS)
            print("  after drag", (dx, dy), "labels", r2["n"], "outside", len(r2["bad"]), r2["bad"][:3])
        ctx.close()
    b.close()
