"""Audit (part 4): the Field Wire debrief of Cairn IV at the speed Silvia sees it (no __wireFast, real chapters),
with her save after Station 16. Records when each bubble lands, the chapter label, and a reduced-motion pass of the reward.
Usage: python3 scratch/verifications/s16_audit/wire19_pace.py OUT_DIR"""
import os, sys, json, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
seed = dict(save, **W.SILVIA, order_story_dream_v3="done")
seed["order_cairn4_march_start"] = str(int(time.time() * 1000) - int(18.3 * 3600 * 1000))
seed["order_bridge_spyglass"] = json.dumps({"done": True, "choice": "cross"})
seed.update({"order_cairn4_cine_intro": "seen", "order_cairn4_howto": "seen"})
LOG = {}
W.BASE = "http://127.0.0.1:8874"; server = W.start_server(port=8874)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    # 1) reduced motion: the completion and the reward card
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page(); errors = []
    page.on("pageerror", lambda e: errors.append(str(e)[:200]))
    page.add_init_script(W.SEED_JS % json.dumps(seed))
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html?cloud=0", wait_until="load"); page.wait_for_timeout(3000)
    js("window.openCairnFourModal()"); page.wait_for_timeout(1500)
    page.fill("#pillars-key-input", "RESOUND"); page.click("#btn-pillars-speak"); page.wait_for_timeout(800)
    for v in js("window.__cairn4.verses"):
        for c in v["calls"]:
            js(f"window.__cairn4.mark('{c['side']}{c['d']}')")
        js("window.__cairn4.sing()"); page.wait_for_timeout(300)
    page.wait_for_timeout(1500)
    page.screenshot(path=f"{OUT}/r1_reduced_complete.png")
    LOG["reduced_victory_rect"] = js("(() => { const r = document.getElementById('btn-pillars-finish').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), innerHeight] })()")
    LOG["reduced_errors"] = errors[:]
    ctx.close()
    # 2) normal motion, after a fresh load with Cairn IV done: the Wire at her pace
    seed2 = dict(seed, order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_awake="true", order_cairn4_verses="3")
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page(); errors = []
    page.on("pageerror", lambda e: errors.append(str(e)[:200]))
    page.add_init_script(W.SEED_JS % json.dumps(seed2))
    page.add_init_script("""window.__landed = []; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.querySelector && (n.matches('.chat-bubble, [class*=message]') )) window.__landed.push([Math.round(performance.now()), (n.innerText || '').slice(0, 60)]); }))).observe(document.documentElement, { childList: true, subtree: true });""")
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html?cloud=0", wait_until="load"); page.wait_for_timeout(3000)
    LOG["badge_before_wire"] = js("(() => { const b = document.getElementById('messenger-counter-badge'); return b ? [b.textContent, getComputedStyle(b).display] : null })()")
    page.screenshot(path=f"{OUT}/p0_hub_after_s16.png")
    t0 = js("performance.now()")
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()")
    for k in range(40):
        page.wait_for_timeout(1000)
        if js("document.querySelectorAll('#wire-choices-grid button').length") >= 3:
            break
    LOG["secs_to_choices"] = round((js("performance.now()") - t0) / 1000, 1)
    LOG["landed"] = [x for x in js("window.__landed") if x[0] > t0]
    LOG["chapter_label"] = js("(() => { const h = document.querySelector('#view-field-wire .wire-chapter-bar, #view-field-wire [class*=chapter]'); return h ? h.innerText.slice(0, 200) : null })()")
    page.screenshot(path=f"{OUT}/p1_wire19_live.png")
    LOG["typing_sfx"] = js("!!(window.sfx && (window.sfx.playTypewriter || window.sfx.playTyping || window.sfx.playKeyClick))")
    LOG["bubble_count_step19"] = js("[...document.querySelectorAll('#wire-messages-stream .chat-bubble')].length")
    LOG["errors"] = errors
    ctx.close()
    b.close()
server.shutdown()
json.dump(LOG, open(f"{OUT}/pace.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(LOG, indent=1, ensure_ascii=False))
