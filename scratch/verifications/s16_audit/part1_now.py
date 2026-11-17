"""S16 audit, part 1: Silvia's real save, now (march to Cairn IV under way). Wire, deck, fold bar, map, S16 card.
Usage: python3 scratch/verifications/s16_audit/part1_now.py OUT_DIR [fast]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts", "audit")); sys.path.insert(0, HERE)
import web_smoke as W  # noqa: E402
from load_save import save  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
FAST = len(sys.argv) > 2 and sys.argv[2] == "fast"
W.BASE = "http://127.0.0.1:8841"; server = W.start_server(port=8841)
DUMP = """(() => { const s = document.getElementById('wire-messages-stream'); const out = [];
  s.querySelectorAll(':scope > *').forEach(el => { if (el.offsetParent === null && !el.classList.contains('chat-bubble-wrap')) return;
    const who = (el.querySelector('.chat-sender, .bubble-sender, .chat-bubble-sender') || {}).textContent || el.className;
    const t = (el.querySelector('.chat-bubble-text') || el).innerText; out.push((who||'').trim().slice(0,40) + ' | ' + t.replace(/\\s+/g,' ').trim().slice(0,400)); });
  return out; })()"""
DECK = """(() => { const v = el => !!el && getComputedStyle(el).display !== 'none' && !el.hidden; const q = s => document.querySelector(s);
  return { prompt: v(q('#wire-prompt-box')), promptHead: (q('#wire-prompt-header-text')||{}).textContent,
    pills: [...document.querySelectorAll('#wire-choices-grid button')].map(b => b.innerText.replace(/\\s+/g,' ')),
    bar: v(q('#wire-completed-bar')), title: (q('.messenger-waypoint-title')||{}).textContent, desc: (q('.messenger-waypoint-desc')||{}).innerText,
    toMap: v(q('#btn-wire-to-map')), telemetry: (q('#messenger-live-telemetry')||{}).textContent,
    chapter: (q('#wire-chapter-strip')||{}).innerText, folded: q('#view-field-wire .messenger-reply-deck').classList.contains('is-folded'),
    fold: (q('.wire-fold-bar')||{}).innerText, step: localStorage.getItem('order_field_wire_step'), marchev: localStorage.getItem('order_wire_marchev'),
    unread: localStorage.getItem('order_messenger_unread_count') }; })()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    if not FAST: page.add_init_script("window.__wireFast = false")
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
    page.screenshot(path=f"{OUT}/a0_home.png")
    print("home badge unread", js("localStorage.getItem('order_messenger_unread_count')"))
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(4000)
    page.screenshot(path=f"{OUT}/a1_wire_latest.png")
    print("DECK", json.dumps(js(DECK), indent=1, ensure_ascii=False))
    msgs = js(DUMP)
    print("N msgs", len(msgs))
    for m in msgs[-40:]: print("  ", m)
    # read back: fold
    page.mouse.move(700, 400)
    for _ in range(8): page.mouse.wheel(0, -500); page.wait_for_timeout(150)
    page.wait_for_timeout(800); page.screenshot(path=f"{OUT}/a2_wire_readback_folded.png")
    print("FOLDED", json.dumps(js(DECK), ensure_ascii=False))
    js("document.querySelector('#view-field-wire .wire-fold-bar').click()"); page.wait_for_timeout(1500)
    page.screenshot(path=f"{OUT}/a3_wire_unfolded.png")
    # answer the veiled woman question if pending (pick 0) to see reply pace
    pills = page.query_selector_all('#wire-choices-grid button')
    print("pills", len(pills))
    if pills and not FAST:
        import time; t0 = time.time()
        pills[0].click(); page.wait_for_timeout(2500); page.screenshot(path=f"{OUT}/a4_wire_answer_typing.png")
        for i in range(60):
            if js("!window.__wireBeatsPlayingProbe && document.getElementById('messenger-typing-bar').style.display === 'none' && getComputedStyle(document.getElementById('wire-completed-bar')).display !== 'none'"): break
            page.wait_for_timeout(500)
        print("reply took", round(time.time() - t0, 1), "s")
        page.screenshot(path=f"{OUT}/a5_wire_after_answer.png")
        for m in js(DUMP)[-6:]: print("  AFTER", m)
        print("DECK2", json.dumps(js(DECK), ensure_ascii=False))
    # map
    js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(4000)
    page.screenshot(path=f"{OUT}/a6_map.png")
    print("HUD", js("[...document.querySelectorAll('.desert3d-hud-text')].map(e=>e.textContent)"))
    print("markers", js("[...document.querySelectorAll('.d3-marker')].filter(m=>m.offsetParent).map(m=>m.className+':'+m.innerText.replace(/\\s+/g,' ')).slice(0,40)"))
    js("window.selectMapNode && window.selectMapNode(25, true)"); page.wait_for_timeout(1500)
    page.screenshot(path=f"{OUT}/a7_s16_card.png")
    print("CARD", js("(() => { const c = document.querySelector('#node-inspector, .node-inspector, .inspector-card, #station-inspector'); return c ? c.innerText.slice(0,1200) : document.body.innerText.slice(0,200); })()"))
    print("errors:", errors[:8])
    b.close()
server.shutdown()
