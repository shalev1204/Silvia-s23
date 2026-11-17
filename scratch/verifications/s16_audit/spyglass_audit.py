"""Audit of "The Spyglass on the Natural Bridge" (s15c-bridge-spyglass.js) with Silvia's real save (story-point.js), arrived at Cairn IV.
Serves the main checkout's web/ (MAIN below). Usage: python3 spyglass_audit.py OUT_DIR SCENARIO [SCENARIO...]
Scenarios: real (normal speed, map card, cross), trail (fast, close midway + reopen), hide (fast, reduced motion), nogl, keys"""
import os, sys, json, time
MAIN = os.environ.get("SPY_MAIN", "/Users/carlespujol/Documents/Silvia's23")
sys.path.insert(0, os.path.join(MAIN, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SCEN = sys.argv[2:] or ["real"]
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
SAVE = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
PORT = int(os.environ.get("SPY_PORT", "8842"))
W.BASE = f"http://127.0.0.1:{PORT}"
server = W.start_server(port=PORT)

PERF_JS = """
window.__lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (e) {}
"""


def seed(arrived=True):
    s = dict(SAVE)
    s["the_eclipse_active_seeker"] = "Silvia"
    s["order_story_dream_v3"] = "done"
    if arrived:
        s["order_cairn4_march_start"] = str(int(time.time() * 1000) - 18 * 3600 * 1000 - 5 * 60 * 1000)
    return s


def page_for(b, reduced=False, nogl=False):
    ctx, page, errors = W.new_page(b, seed(), reduced_motion=reduced, cine_seen=False)
    page.set_viewport_size({"width": 1440, "height": 900})
    page.route("**/*supabase.co/**", lambda r: r.abort())
    page.add_init_script(PERF_JS)
    if nogl:
        page.add_init_script("HTMLCanvasElement.prototype.getContext = (function (g) { return function (t, o) { if (/webgl/.test(t)) return null; return g.call(this, t, o); }; })(HTMLCanvasElement.prototype.getContext)")
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove())")
    return ctx, page, errors


def H(page):
    js = page.evaluate
    o = {}
    o["st"] = lambda: js("window.__spyglass.state()")
    o["saved"] = lambda: json.loads(js("localStorage.getItem('order_bridge_spyglass') || '{}'"))
    o["amb"] = lambda: js("window.EclipseAmbience ? window.EclipseAmbience.state() : null")
    o["mission"] = lambda: js("document.getElementById('spy-mission-text').textContent")
    o["sub"] = lambda: js("document.getElementById('spy-subtitle').textContent")
    o["log"] = lambda: js("document.getElementById('spy-log').innerText")
    o["chips"] = lambda: js("[...document.querySelectorAll('#spy-sights .spy-chip')].map(c => c.textContent)")
    o["modals"] = lambda: js("[...document.querySelectorAll('.chasm-modal-backdrop, [role=dialog]')].filter(m => m.style.display && m.style.display !== 'none' && m.getClientRects().length).map(m => m.id || m.className)")
    return o


def settle(page, stages, limit=90, seen=None, fast=True):
    js = page.evaluate
    for _ in range(limit * 5):
        if fast:
            js("window.__spyglass.fast()")
        st = js("window.__spyglass.state()")
        if st["stage"] in stages and not st["busy"] and (seen is None or seen in st["seen"]):
            return st
        page.wait_for_timeout(200)
    return js("window.__spyglass.state()")


def wait_until(page, cond, tries=160, ms=500):
    for _ in range(tries):
        if cond():
            return True
        page.wait_for_timeout(ms)
    return False


def fps(page, ms=4000):
    return page.evaluate("""ms => new Promise(res => { let n = 0, worst = 0, last = performance.now(); const t0 = last;
      function f(now) { n++; worst = Math.max(worst, now - last); last = now; if (now - t0 < ms) requestAnimationFrame(f); else res({ fps: Math.round(n * 1000 / (now - t0)), worstFrameMs: Math.round(worst) }); }
      requestAnimationFrame(f); })""", ms)


def drag(page, dx, dy, steps=25):
    page.mouse.move(470, 450); page.mouse.down()
    for k in range(1, steps + 1):
        page.mouse.move(470 + dx * k / steps, 450 + dy * k / steps); page.wait_for_timeout(16)
    page.mouse.up()


def shot(page, name):
    page.screenshot(path=os.path.join(OUT, name + ".png"))


def report(tag, **kw):
    print(f"[{tag}] " + json.dumps(kw, default=str)[:1800], flush=True)


def run_real(b):
    """Normal speed, opened from the map card; mouse drags; hint; choose 'cross'; hand over to Cairn IV."""
    ctx, page, errors = page_for(b)
    h = H(page); js = page.evaluate
    js("window.selectMapNode(25)"); page.wait_for_timeout(800)
    report("card", title=js("document.getElementById('insp-title').innerText"), btn=js("document.getElementById('insp-btn-primary').innerText"), status=js("document.getElementById('insp-status').innerText"))
    shot(page, "real_00_map_card")
    t0 = time.time()
    page.click("#insp-btn-primary"); page.wait_for_timeout(1200)
    report("open", modals=h["modals"](), st=h["st"](), amb=h["amb"]())
    shot(page, "real_01_intro_card")
    page.wait_for_timeout(5000); shot(page, "real_02_intro_shot_print")
    page.wait_for_timeout(9000); shot(page, "real_03_intro_terraces")
    wait_until(page, lambda: (lambda s: s["stage"] == "glass" and not s["busy"])(h["st"]()), 240)
    report("intro_done", seconds=round(time.time() - t0, 1), st=h["st"](), sub=h["sub"](), hint_hidden=js("document.getElementById('btn-spy-hint').hidden"))
    page.wait_for_timeout(1200); shot(page, "real_04_glass_first_view")
    report("fps_idle_glass", **fps(page, 3000))
    b0 = h["st"]()["bearing"]
    drag(page, -300, 0); page.wait_for_timeout(400)
    report("drag", bearing_before=b0, bearing_after=h["st"]()["bearing"], pitch=h["st"]()["pitch"])
    shot(page, "real_05_after_drag")
    page.click("#btn-spy-hint"); page.wait_for_timeout(700)
    report("hint1", sub=h["sub"](), arrow=js("!document.getElementById('spy-arrow').hidden"), chips=h["chips"]())
    shot(page, "real_06_hint1_arrow")
    page.click("#btn-spy-hint"); page.wait_for_timeout(3500)
    report("hint2", sub=h["sub"](), st=h["st"]())
    shot(page, "real_07_hint2_swing")
    wait_until(page, lambda: len(h["st"]()["seen"]) > 0, 60)
    page.wait_for_timeout(600); shot(page, "real_08_first_found")
    wait_until(page, lambda: not h["st"]()["busy"], 80)
    report("found1", st=h["st"](), log_tail=h["log"]()[-400:], count=js("document.getElementById('spy-sights-count').textContent"))
    js("window.__spyglass.aim('oilcloth', false)"); page.wait_for_timeout(1800)
    report("too_far", note=js("document.getElementById('spy-note').textContent"))
    shot(page, "real_09_too_far_note")
    page.click("#btn-spy-in"); page.wait_for_timeout(500)
    wait_until(page, lambda: (lambda s: "oilcloth" in s["seen"] and not s["busy"])(h["st"]()), 80)
    shot(page, "real_10_oilcloth")
    for sid in ["boulders", "pillars", "stone"]:
        js("s => window.__spyglass.aim(s, true)", sid); page.wait_for_timeout(1500)
        if sid == "boulders":
            shot(page, "real_11_boulders_vertigo")
        wait_until(page, lambda: (lambda s: sid in s["seen"] and not s["busy"])(h["st"]()), 120)
        report("found_" + sid, stage=h["st"]()["stage"], seen=h["st"]()["seen"], song=js("localStorage.getItem('order_hint_s16-song_level')"), mission=h["mission"]())
    wait_until(page, lambda: (lambda s: s["stage"] == "event" and not s["busy"])(h["st"]()), 80)
    report("event", st=h["st"](), mission=h["mission"](), chips=h["chips"](), arrow=js("!document.getElementById('spy-arrow').hidden"))
    shot(page, "real_12_event_shout")
    js("window.__spyglass.aim('tower', true)")
    wait_until(page, lambda: (lambda s: "tower" in s["seen"] and not s["busy"])(h["st"]()), 80)
    page.wait_for_timeout(500)
    report("tower_during_event", stage=h["st"]()["stage"], mission=h["mission"](), arrow=js("!document.getElementById('spy-arrow').hidden"), chips=h["chips"]())
    shot(page, "real_13_after_tower_during_event")
    js("window.__spyglass.aim('hairpin', true)")
    wait_until(page, lambda: (lambda s: s["stage"] == "asking" and not s["busy"])(h["st"]()), 160)
    page.wait_for_timeout(1200)
    report("asking", st=h["st"](), mission=h["mission"](), choices=js("[...document.querySelectorAll('#spy-choices button')].map(b => b.innerText)"), focus=js("document.activeElement && document.activeElement.id"))
    shot(page, "real_14_choice")
    page.click("#spy-choice-cross"); page.wait_for_timeout(4000); shot(page, "real_15_cross_mid")
    page.wait_for_timeout(5000); shot(page, "real_16_cross_far")
    wait_until(page, lambda: h["st"]()["stage"] == "done", 200)
    page.wait_for_timeout(1000)
    report("done", st=h["st"](), saved=h["saved"](), body=js("document.getElementById('spy-finish-body').textContent"), btn=js("document.getElementById('btn-spy-finish').innerText"),
           focus=js("document.activeElement && document.activeElement.id"), amb=h["amb"](), total_s=round(time.time() - t0, 1),
           hints={k: js("k => localStorage.getItem(k)", k) for k in ["order_hint_s16-song_level", "order_hint_s16-sigil_level"]})
    shot(page, "real_17_finish_card")
    page.click("#btn-spy-finish"); page.wait_for_timeout(600)
    report("handover_600ms", modals=h["modals"](), amb=h["amb"]())
    page.wait_for_timeout(2500)
    report("handover_3s", modals=h["modals"](), amb=h["amb"](), focus=js("document.activeElement && (document.activeElement.id || document.activeElement.className)"))
    shot(page, "real_18_cairn_iv_after_handover")
    page.wait_for_timeout(6000); shot(page, "real_19_cairn_iv_6s")
    report("perf", longtasks=js("window.__lt.filter(t => t[1] > 120).slice(-30)"), n_long=js("window.__lt.length"))
    report("errors", errors=sorted(set(errors))[:10])
    ctx.close()


def run_trail(b):
    """Fast; close midway with ✕ (glass, two found) and with Esc; reopen; then 'trail'."""
    ctx, page, errors = page_for(b)
    h = H(page); js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(600)
    settle(page, ["glass"]); page.wait_for_timeout(800)
    for sid in ["wagons", "oilcloth"]:
        js("s => window.__spyglass.aim(s, true)", sid); settle(page, ["glass"], 30, sid)
    report("before_close", st=h["st"](), saved=h["saved"]())
    page.click("#btn-close-spy"); page.wait_for_timeout(900)
    report("after_close", modals=h["modals"](), saved=h["saved"](), amb=h["amb"](), scrollY=js("scrollY"), gameopen=js("window.__eclipseGameOpen"))
    shot(page, "trail_01_after_close_midway")
    js("window.openCairnFourModal()"); page.wait_for_timeout(800)
    report("reopen", st=h["st"](), chips=h["chips"](), count=js("document.getElementById('spy-sights-count').textContent"))
    shot(page, "trail_02_reopen")
    page.keyboard.press("Escape"); page.wait_for_timeout(800)
    report("esc_intro", modals=h["modals"](), stage=h["st"]()["stage"])
    js("window.openCairnFourModal()"); page.wait_for_timeout(600)
    settle(page, ["glass"]); page.wait_for_timeout(800)
    for sid in ["wagons", "oilcloth", "stone", "boulders", "tower"]:
        js("s => window.__spyglass.aim(s, true)", sid); settle(page, ["glass", "event"], 30, sid)
    st = settle(page, ["event"], 40)
    report("event_without_pillars", st=st, saved=h["saved"]())
    js("window.__spyglass.aim('hairpin', true)"); settle(page, ["asking"], 90)
    page.keyboard.press("Escape"); page.wait_for_timeout(800)
    report("esc_at_choice", modals=h["modals"](), saved=h["saved"]())
    js("window.openCairnFourModal()"); page.wait_for_timeout(600)
    report("reopen_after_choice_close", st=h["st"]())
    settle(page, ["glass"]); page.wait_for_timeout(800)
    for sid in ["wagons", "oilcloth", "stone", "boulders", "tower"]:
        js("s => window.__spyglass.aim(s, true)", sid); settle(page, ["glass", "event"], 30, sid)
    settle(page, ["event"], 40)
    js("window.__spyglass.aim('hairpin', true)"); settle(page, ["asking"], 90)
    js("window.__spyglass.slow()")
    page.click("#spy-choice-trail"); page.wait_for_timeout(5000); shot(page, "trail_03_trail_mid")
    page.wait_for_timeout(5000); shot(page, "trail_04_trail_fooled")
    st = settle(page, ["done"], 120); page.wait_for_timeout(800)
    report("done", st=st, saved=h["saved"](), body=js("document.getElementById('spy-finish-body').textContent"),
           hints={k: js("k => localStorage.getItem(k)", k) for k in ["order_hint_s16-song_level", "order_hint_s16-sigil_level"]})
    shot(page, "trail_05_finish")
    page.click("#btn-close-spy"); page.wait_for_timeout(1800)
    report("close_x_after_done", modals=h["modals"]())
    shot(page, "trail_06_after_x_on_finish")
    report("errors", errors=sorted(set(errors))[:10])
    ctx.close()


def run_hide(b):
    """Reduced motion; fast; 'hide'."""
    ctx, page, errors = page_for(b, reduced=True)
    h = H(page); js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(600)
    settle(page, ["glass"]); page.wait_for_timeout(600)
    js("window.__spyglass.aim('wagons', false)")
    js("window.__spyglass.fx('vertigo')")
    fovs = []
    for _ in range(10):
        fovs.append(js("window.__spyglass.state().fov")); page.wait_for_timeout(150)
    report("reduced_vertigo_fov_samples", fovs=fovs, filter=js("document.getElementById('spy-canvas').style.filter"),
           flashAnim=js("getComputedStyle(document.querySelector('.spy-lens .sl-ring')).animationName"), foundAnim=js("getComputedStyle(document.getElementById('spy-found')).animationName"))
    for sid in ["wagons", "oilcloth", "stone", "pillars", "boulders"]:
        js("s => window.__spyglass.aim(s, true)", sid); settle(page, ["glass", "event"], 30, sid)
    report("after_finds", flashAnim=js("getComputedStyle(document.querySelector('.spy-lens .sl-ring')).animationName"), foundAnim=js("getComputedStyle(document.getElementById('spy-found')).animationName"))
    settle(page, ["event"], 40)
    js("window.__spyglass.aim('hairpin', true)"); settle(page, ["asking"], 90)
    js("window.__spyglass.slow()")
    page.click("#spy-choice-hide"); page.wait_for_timeout(3000); shot(page, "hide_01_under_lip")
    page.wait_for_timeout(4000); shot(page, "hide_02_boots")
    st = settle(page, ["done"], 120); page.wait_for_timeout(600)
    report("done", st=st, saved=h["saved"](), body=js("document.getElementById('spy-finish-body').textContent"),
           hints={k: js("k => localStorage.getItem(k)", k) for k in ["order_hint_s16-song_level", "order_hint_s16-sigil_level"]})
    shot(page, "hide_03_finish")
    page.click("#btn-spy-finish"); page.wait_for_timeout(2500)
    report("handover", modals=h["modals"](), amb=h["amb"]())
    shot(page, "hide_04_cairn_iv")
    report("errors", errors=sorted(set(errors))[:10])
    ctx.close()


def run_nogl(b):
    ctx, page, errors = page_for(b, nogl=True)
    h = H(page); js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(800)
    report("open", st=h["st"](), modals=h["modals"](), saved=h["saved"]())
    st = settle(page, ["glass"]); page.wait_for_timeout(500)
    report("glass", st=st, chips=h["chips"](), sub=h["sub"](), hint_hidden=js("document.getElementById('btn-spy-hint').hidden"))
    shot(page, "nogl_01_list")
    report("errors", errors=sorted(set(errors))[:10])
    ctx.close()


def run_sweep(b):
    """What the lens shows around the gorge at the first draw: the first view, then turns of ~24° with the arrow keys."""
    ctx, page, errors = page_for(b)
    h = H(page); js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(600)
    settle(page, ["glass"]); page.wait_for_timeout(1500)
    js("window.__spyglass.slow()")
    js("document.getElementById('spy-stage').focus()")
    shot(page, "sweep_00_first")
    for n in range(1, 8):
        for _ in range(10):
            page.keyboard.press("ArrowRight")
        page.wait_for_timeout(1400)
        s = h["st"]()
        shot(page, f"sweep_{n:02d}_b{s['bearing']}_p{int(s['pitch'])}")
    # the terraces shot of the intro, settled
    js("window.__spyglass.lower()"); page.wait_for_timeout(1200)
    js("window.__spyglass.test().shot([36, 26, -46], [134, -44, 226], 30, 0.55, true)"); page.wait_for_timeout(1500)
    shot(page, "sweep_90_terraces_settled")
    report("errors", errors=sorted(set(errors))[:10])
    ctx.close()


def run_logscroll(b):
    """Is the end of the conversation in view when the choices and the finish card appear?"""
    ctx, page, errors = page_for(b)
    js = page.evaluate
    gap = lambda: js("(l => ({ hiddenBelowPx: Math.round(l.scrollHeight - l.scrollTop - l.clientHeight), logH: l.clientHeight, last: (l.innerText.trim().split('\\n').pop() || '').slice(0, 80) }))(document.getElementById('spy-log'))")
    js("window.openCairnFourModal()"); page.wait_for_timeout(600)
    settle(page, ["glass"]); page.wait_for_timeout(800)
    for sid in ["wagons", "oilcloth", "stone", "boulders", "tower"]:
        js("s => window.__spyglass.aim(s, true)", sid); settle(page, ["glass", "event"], 30, sid)
    settle(page, ["event"], 40)
    js("window.__spyglass.aim('hairpin', true)"); settle(page, ["asking"], 90); page.wait_for_timeout(800)
    report("asking_log", **gap())
    page.click("#spy-choice-cross"); settle(page, ["done"], 120); page.wait_for_timeout(800)
    report("done_log", **gap())
    ctx.close()


def run_keys(b):
    """Keyboard only: can she reach the lens, move it, zoom, tab around?"""
    ctx, page, errors = page_for(b)
    h = H(page); js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(600)
    settle(page, ["glass"]); page.wait_for_timeout(900)
    js("window.__spyglass.slow()")
    report("focus_at_glass", focus=js("document.activeElement && (document.activeElement.id || document.activeElement.className)"))
    b0 = h["st"]()["bearing"]
    for _ in range(10):
        page.keyboard.press("ArrowLeft")
    page.keyboard.press("+"); page.wait_for_timeout(600)
    report("keys", before=b0, after=h["st"]()["bearing"], zoom=h["st"]()["zoom"])
    order = []
    for _ in range(14):
        page.keyboard.press("Tab"); order.append(js("(e => e ? (e.id || e.className || e.tagName) : null)(document.activeElement)"))
    report("tab_order", order=order)
    page.mouse.move(470, 450); page.mouse.wheel(0, -200); page.wait_for_timeout(400)
    report("wheel", zoom=h["st"]()["zoom"], scrollY=js("scrollY"))
    report("errors", errors=sorted(set(errors))[:10])
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for s in SCEN:
        print("=== scenario", s, flush=True)
        try:
            globals()["run_" + s](b)
        except Exception as e:
            print("SCENARIO FAILED", s, repr(e)[:600], flush=True)
    b.close()
server.shutdown()
