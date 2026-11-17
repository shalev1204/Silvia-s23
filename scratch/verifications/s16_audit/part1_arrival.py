"""S16 audit, part 1: the moment Hermes reaches Cairn IV with Silvia's save.
mode wire  : the Field Wire is open when the 18 h run out (arrival ~12 s after load)
mode map   : the Grand Desert Map is open, Station 16 card selected, when they run out
mode reopen: she opens the page 1 h after he arrived
Usage: python3 scratch/verifications/s16_audit/part1_arrival.py OUT_DIR wire|map|reopen [answer]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts", "audit")); sys.path.insert(0, HERE)
import web_smoke as W  # noqa: E402
from load_save import save  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT, MODE = sys.argv[1], sys.argv[2]; ANSWER = "answer" in sys.argv[3:]
s = dict(save)
H18 = 18 * 3600 * 1000
if MODE == "reopen": s["order_cairn4_march_start"] = str(int(time.time() * 1000) - H18 - 3600 * 1000)
W.BASE = "http://127.0.0.1:8841"; server = W.start_server(port=8841)
PROBE = """(() => { window.__sfxLog = []; setInterval(() => { const s = window.sfx; if (!s || s.__wrapped) return; s.__wrapped = 1;
   Object.getOwnPropertyNames(Object.getPrototypeOf(s)).concat(Object.keys(s)).forEach(k => { if (typeof s[k] === 'function' && /^play/.test(k)) { const f = s[k].bind(s); s[k] = (...a) => { window.__sfxLog.push(k); return f(...a); }; } }); }, 200); })()"""
DECK = """(() => { const v = el => !!el && getComputedStyle(el).display !== 'none' && !el.hidden; const q = s => document.querySelector(s);
  return { prompt: v(q('#wire-prompt-box')), pills: [...document.querySelectorAll('#wire-choices-grid button')].filter(v).map(b => b.innerText.replace(/\\s+/g,' ')),
    bar: v(q('#wire-completed-bar')), title: (q('.messenger-waypoint-title')||{}).textContent, desc: (q('.messenger-waypoint-desc')||{}).innerText,
    toMap: v(q('#btn-wire-to-map')), telemetry: (q('#messenger-live-telemetry')||{}).textContent, step: localStorage.getItem('order_field_wire_step'),
    marchev18: JSON.parse(localStorage.getItem('order_wire_marchev')||'{}')['18'], unread: localStorage.getItem('order_messenger_unread_count'),
    headerBadge: (q('#btn-header-messenger .messenger-btn-badge, #btn-header-messenger [class*=badge]')||{}).textContent,
    fold: (q('.wire-fold-bar')||{}).innerText }; })()"""
LAST = """[...document.querySelectorAll('#wire-messages-stream > .chat-bubble-wrap')].slice(-4).map(e => e.className.replace('chat-bubble-wrap','').trim() + ' | ' + e.innerText.replace(/\\s+/g,' ').slice(0,260))"""
CARD = """(() => { const c = document.getElementById('insp-march-bar'); const t = document.querySelector('#node-inspector-title, .inspector-title, #insp-title');
  const all = [...document.querySelectorAll('[id^=insp]')].filter(e => e.offsetParent && e.children.length === 0 && e.textContent.trim()).map(e => e.id + '=' + e.textContent.trim().slice(0,160));
  return all; })()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, s)
    page.add_init_script("window.__wireFast = false; delete window.__wireAllChapters;")
    page.add_init_script(PROBE)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(4000)
    if MODE in ("wire", "map"):
        if MODE == "wire":
            js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(3000)
            if ANSWER: page.click('#wire-choices-grid button >> nth=0'); page.wait_for_timeout(6000)
        else:
            js("window.selectMapNode(25, true)"); page.wait_for_timeout(1500)
        js(f"localStorage.setItem('order_cairn4_march_start', String(Date.now() - {H18} + 12000))")
        js("window.__sfxLog = []")
        page.wait_for_timeout(2000); page.screenshot(path=f"{OUT}/d_{MODE}{'_ans' if ANSWER else ''}_before.png")
        print("before:", json.dumps(js(DECK), ensure_ascii=False) if MODE == "wire" else js(CARD))
        page.wait_for_timeout(16000)
    page.screenshot(path=f"{OUT}/d_{MODE}{'_ans' if ANSWER else ''}_after.png")
    print("over:", js("window.isCairnFourMarchOver()"), "sfx:", js("window.__sfxLog"))
    if MODE == "map":
        print("card after:", js(CARD))
        print("HUD:", js("document.querySelector('.desert3d-hud-text').textContent"))
        print("header msg btn:", js("document.getElementById('btn-header-messenger').innerText.replace(/\\s+/g,' ')"), js("localStorage.getItem('order_messenger_unread_count')"))
        print("toasts:", js("[...document.querySelectorAll('[class*=toast]')].filter(e=>e.offsetParent).map(e=>e.innerText.slice(0,200))"))
        js("document.querySelector('.desert3d-hud-status').parentElement.scrollIntoView({block:'center'})"); page.wait_for_timeout(2500)
        page.screenshot(path=f"{OUT}/d_map_after_stage.png")
        print("pin:", js("[...document.querySelectorAll('.d3-marker')].filter(m => /CAIRN IV/.test(m.innerText)).map(m => m.className + ' ' + m.innerText.replace(/\\s+/g,' '))"))
        js("window.scrollTo(0,0)")
    if MODE in ("wire", "reopen"):
        if MODE == "reopen":
            print("header msg btn:", js("document.getElementById('btn-header-messenger').innerText.replace(/\\s+/g,' ')"), js("localStorage.getItem('order_messenger_unread_count')"))
            print("default view:", js("document.body.getAttribute('data-active-view')"))
            print("card:", js(CARD))
            page.screenshot(path=f"{OUT}/d_reopen_home.png")
            js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(4000)
            page.screenshot(path=f"{OUT}/d_reopen_wire.png")
        print("after:", json.dumps(js(DECK), ensure_ascii=False))
        for m in js(LAST): print("   ", m)
    # enter the station from the card
    js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(2500)
    js("window.selectMapNode(25, true)"); page.wait_for_timeout(1200)
    page.screenshot(path=f"{OUT}/d_{MODE}_card_arrived.png")
    print("card arrived:", js(CARD))
    btn = js("(() => { const b = [...document.querySelectorAll('button')].find(b => /WAKE THE SENTRY/i.test(b.innerText) && b.offsetParent); return b ? [b.id, b.disabled, b.innerText] : null })()")
    print("enter btn:", btn)
    if btn and MODE == "reopen":
        js("[...document.querySelectorAll('button')].find(b => /WAKE THE SENTRY/i.test(b.innerText) && b.offsetParent).click()"); page.wait_for_timeout(5000)
        page.screenshot(path=f"{OUT}/d_reopen_enter.png")
        print("open modals:", js("[...document.querySelectorAll('[id^=modal-]')].filter(m => getComputedStyle(m).display !== 'none' && m.offsetParent !== null || m.classList.contains('is-open') || m.classList.contains('active')).map(m => m.id)"))
    print("errors:", errors[:8])
    b.close()
server.shutdown()
