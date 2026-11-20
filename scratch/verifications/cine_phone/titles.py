"""The films of Stations 17, 18 and 19 on a phone and on a Mac: the title card, the line of the film and Skip never overlap.
Usage: python3 titles.py OUT_DIR [PORT]"""
import os, sys, time, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8891
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
now = int(time.time() * 1000)
base = dict(W.DESERT_BASE, **W.DESERT_DONE, order_sun_monolith_completed="true", order_seal_cairn_2="true",
            order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
            order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_sound="off")
S17 = dict(base, order_field_wire_step="22", order_cairn5_march_start=str(now - 19 * 3600 * 1000), order_cairn5_cine_intro="")
S18 = dict(base, order_arch_solstice_completed="true", order_seal_cairn_5="true", order_field_wire_step="26", order_stele_cine_intro="")
S19 = dict(base, **W.ORACLE_SEED_EXTRA)
S19.update({"order_field_wire_step": "30", "order_gates_return": json.dumps({"done": True, "sealed": True}), "order_oracle_cine_intro": ""})
CASES = (("s17", S17, "window.openSolsticeModal()", "#modal-solstice-arch", ""),
         ("s18", S18, "window.openSteleModal()", "#modal-polybius-stele", "?tester=1"),
         ("s19", S19, "window.openOracleModal()", "#modal-oracle-horizon", ""))
RECTS = """(m => { const q = (s) => { const e = document.querySelector(m + ' ' + s); if (!e) return null;
  const st = getComputedStyle(e); if (st.opacity === '0' || st.visibility === 'hidden' || e.closest('[hidden]')) return null;
  let r = e.getBoundingClientRect(); if (/STRONG|SMALL/.test(e.tagName) && e.firstChild) { const g = document.createRange(); g.selectNodeContents(e); r = g.getBoundingClientRect(); }
  return r.width ? [r.left, r.top, r.right, r.bottom] : null; };
  return { title: q('.cine-title.is-on strong'), kicker: q('.cine-title.is-on small'), line: q('.chasm3d-subtitle.is-on'), skip: q('.cine-skip'),
           stage: q('.chasm3d-stage'), cine: !!document.querySelector(m + ' .chasm3d-cine:not([hidden])') }; })"""
hit = lambda a, b: a and b and a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]
ok = True
def check(cond, msg):
    global ok
    print(("PASS " if cond else "FAIL ") + msg); ok = ok and bool(cond)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((390, 844, "phone"), (360, 740, "small_phone"), (1440, 900, "mac")):
        for name, seed, opener, m, q in CASES:
            ctx, page, errors = W.new_page(b, seed)
            page.set_viewport_size({"width": vw, "height": vh})
            page.goto(f"{W.BASE}/index.html{q}", wait_until="load"); page.wait_for_timeout(2500)
            page.evaluate(opener)
            bad, seen, title_seen = [], 0, False
            for k in range(36):
                page.wait_for_timeout(350)
                r = page.evaluate(RECTS + f"('{m}')")
                if not r["cine"]: break
                seen += 1
                if r["title"]:
                    title_seen = True
                    if k % 3 == 0: page.screenshot(path=os.path.join(OUT, f"{tag}_{name}_{k:02d}.png"))
                for a, c in (("title", "line"), ("kicker", "line"), ("title", "skip"), ("line", "skip")):
                    if hit(r[a], r[c]): bad.append(f"{a}/{c}@{k}")
                st = r["stage"]
                if r["title"] and st and (r["title"][0] < st[0] - 1 or r["title"][2] > st[2] + 1): bad.append(f"title-off-stage@{k}")
            check(seen > 3 and title_seen, f"{tag} {name}: the film played with its title ({seen} samples)")
            check(not bad, f"{tag} {name}: title, line and Skip never overlap {sorted(set(x.split('@')[0] for x in bad))}")
            check(not errors, f"{tag} {name}: no page errors {errors[:2]}")
            ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
