"""S16 audit, part 1: Silvia's save in real mode (no test fast-forward, no all-chapters): chapter strip, typing pace and sound
while she answers the pending march question. Usage: python3 scratch/verifications/s16_audit/part1_real.py OUT_DIR [reduced]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts", "audit")); sys.path.insert(0, HERE)
import web_smoke as W  # noqa: E402
from load_save import save  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
RED = len(sys.argv) > 2 and sys.argv[2] == "reduced"
W.BASE = "http://127.0.0.1:8841"; server = W.start_server(port=8841)
PROBE = """(() => { window.__sfxLog = []; const wrap = () => { const s = window.sfx; if (!s || s.__wrapped) return; s.__wrapped = 1;
   Object.getOwnPropertyNames(Object.getPrototypeOf(s)).concat(Object.keys(s)).forEach(k => { if (typeof s[k] === 'function' && /^play/.test(k)) { const f = s[k].bind(s); s[k] = (...a) => { window.__sfxLog.push([Math.round(performance.now()), k]); return f(...a); }; } }); };
   setInterval(wrap, 200);
   window.__bubbleLog = [];
   const mo = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('chat-bubble-wrap')) {
      const t0 = performance.now(); const el = n; const chk = () => { if (!el.querySelector('.telegraph-cursor')) { window.__bubbleLog.push({ cls: el.className, len: (el.innerText||'').length, start: Math.round(t0), ms: Math.round(performance.now() - t0) }); } else requestAnimationFrame(chk); }; chk(); } })));
   const go = () => { const s = document.getElementById('wire-messages-stream'); if (s) mo.observe(s, { childList: true }); else setTimeout(go, 100); }; go(); })()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save, reduced_motion=RED)
    page.add_init_script("window.__wireFast = false; delete window.__wireAllChapters;")
    page.add_init_script(PROBE)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
    print("unread badge", js("(() => { const b = document.querySelector('#btn-header-messenger, .messenger-badge, .wire-unread-badge'); return b ? b.outerHTML.slice(0,300) : null })()"))
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(3500)
    sfx = "reduced" if RED else "real"
    page.screenshot(path=f"{OUT}/b1_{sfx}_wire_latest.png")
    print("chapter strip:", js("document.getElementById('wire-chapter-strip').innerText.replace(/\\n/g,' | ')"))
    print("visible chapters:", js("[...document.querySelectorAll('#wire-messages-stream > *')].filter(e=>!e.hidden && e.offsetParent).length"), "of", js("document.querySelectorAll('#wire-messages-stream > *').length"))
    print("earlier btn hidden:", js("document.getElementById('btn-wire-earlier').hidden"))
    js("window.__bubbleLog = []; window.__sfxLog = []")
    t0 = time.time()
    page.click('#wire-choices-grid button >> nth=1')
    for i in range(80):
        page.wait_for_timeout(250)
        if i == 4: page.screenshot(path=f"{OUT}/b2_{sfx}_typing.png")
        if js("(window.__bubbleLog||[]).filter(x=>x.cls.includes('incoming')).length") >= 1 and js("getComputedStyle(document.getElementById('messenger-typing-bar')).display === 'none'") and i > 12: break
    print("elapsed", round(time.time() - t0, 1))
    print("bubbles", js("window.__bubbleLog"))
    log = js("window.__sfxLog"); from collections import Counter
    print("sfx", Counter(k for _, k in log))
    page.screenshot(path=f"{OUT}/b3_{sfx}_after_answer.png")
    print("deck", js("({prompt: getComputedStyle(document.getElementById('wire-prompt-box')).display, bar: document.querySelector('.messenger-waypoint-title').textContent})"))
    print("errors:", errors[:8])
    b.close()
server.shutdown()
