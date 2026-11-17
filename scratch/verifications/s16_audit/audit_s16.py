"""Audit of Station 16 (Cairn IV) with Silvia's real save, 1440x900. Read-only on web/. Serves the MAIN checkout's web/.
Usage: python3 scratch/verifications/s16_audit/audit_s16.py OUT_DIR [first|reduced|mute]"""
import os, sys, json, time
MAIN = "/Users/carlespujol/Documents/Silvia's23"
sys.path.insert(0, os.path.join(MAIN, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
MODE = sys.argv[2] if len(sys.argv) > 2 else "first"
print("serving", W.WEB)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save["order_cairn4_march_start"] = str(int(time.time() * 1000) - int(18.2 * 3600 * 1000))
# the real first entry: no film / how to play seen yet, spyglass not lived
save["order_cairn4_cine_intro"] = ""
save["order_cairn4_howto"] = ""
if MODE in ("reduced", "mute"):
    save["order_bridge_spyglass"] = '{"done":true,"choice":"hide","seen":["wagons","pillars"]}'
if MODE == "mute":
    save["order_ambience_muted"] = "true"
print("spyglass in save:", save.get("order_bridge_spyglass"), "| s16 keys:", {k: v for k, v in save.items() if "s16" in k or "cairn4" in k})

AUDIO_HOOK = r"""
(() => {
  window.__aud = []; window.__live = new Set(); window.__pans = [];
  const VOICE = [196, 392, 196*3.01, 293.66, 587.32, 293.66*3.01, 1900];
  const isOurs = (f) => VOICE.some((v) => Math.abs(v - f) < 0.5);
  const sv = AudioParam.prototype.setValueAtTime;
  AudioParam.prototype.setValueAtTime = function (v, t) { if (this.__v == null) this.__v = v; return sv.apply(this, arguments); };
  const os = OscillatorNode.prototype.start, ost = OscillatorNode.prototype.stop;
  OscillatorNode.prototype.start = function (when) {
    const f = this.frequency.__v != null ? this.frequency.__v : this.frequency.value;
    if (isOurs(f)) {
      const rec = { f: +f.toFixed(2), type: this.type, when: when || 0, now: this.context.currentTime, state: this.context.state, stop: null };
      window.__aud.push(rec); this.__rec = rec; window.__live.add(this);
      this.addEventListener('ended', () => window.__live.delete(this));
    }
    return os.apply(this, arguments);
  };
  OscillatorNode.prototype.stop = function (when) { if (this.__rec && this.__rec.stop == null) this.__rec.stop = (when || 0); return ost.apply(this, arguments); };
  const csp = BaseAudioContext.prototype.createStereoPanner;
  BaseAudioContext.prototype.createStereoPanner = function () { const p = csp.apply(this, arguments); window.__pans.push(p); return p; };
})();
"""

W.BASE = "http://127.0.0.1:8843"
server = W.start_server(port=8843)
shot_n = [0]


def shot(page, name):
    shot_n[0] += 1
    path = f"{OUT}/{MODE}_{shot_n[0]:02d}_{name}.png"
    page.screenshot(path=path)
    print("  shot", path)
    return path


def voices(aud):
    ticks = sorted(a["when"] for a in aud if a["f"] == 1900)
    if len(ticks) < 2:
        return None
    t0a = ticks[0]; beat = ticks[1] - ticks[0]
    fund = sorted((a for a in aud if a["f"] in (196.0, 293.66) and a["type"] == "sine"), key=lambda a: a["when"])
    return {"ticks": len(ticks), "beat": round(beat, 3),
            "voices": [("L" if a["f"] == 196.0 else "R", round((a["when"] - t0a) / beat, 2), round(((a["stop"] or 0) - a["when"]) / beat, 2)) for a in fund]}


with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save, reduced_motion=(MODE == "reduced"))
    page.add_init_script(AUDIO_HOOK)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    get = lambda k: js("k => localStorage.getItem(k)", k)
    shown = lambda i: js("i => { const e = document.getElementById(i); return !!e && getComputedStyle(e).display !== 'none' }", i)
    text = lambda i: js("i => (document.getElementById(i) || {}).innerText || ''", i)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
    print("seeker", get("the_eclipse_active_seeker"), "march over?", js("window.isCairnFourMarchOver && window.isCairnFourMarchOver()"))
    page.mouse.click(700, 450); page.wait_for_timeout(300)   # a first gesture, like hers
    js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(800)
    js("window.switchMapPath && window.switchMapPath('desert', true)"); page.wait_for_timeout(1200)
    js("window.selectDesertStation(25)"); page.wait_for_timeout(1200)
    print("after selectDesertStation: spy open:", shown("modal-bridge-spyglass"), "| c4 open:", shown("modal-cairn-four"))
    if not shown("modal-bridge-spyglass") and not shown("modal-cairn-four"):
        shot(page, "station_card")
        js("""(() => { const b = [...document.querySelectorAll('button')].find(b => /ENTER|CAIRN IV|PILLARS/i.test(b.textContent) && b.offsetParent && !b.disabled); if (b) { console.log('clicking', b.textContent); b.click(); } })()""")
        page.wait_for_timeout(1500)
        print("after card button: spy open:", shown("modal-bridge-spyglass"), "| c4 open:", shown("modal-cairn-four"))

    if MODE == "first" and shown("modal-bridge-spyglass"):
        js("window.__spyglass.fast()")
        for sid in ["wagons", "oilcloth", "stone", "boulders", "pillars", "tower", "hairpin"]:
            for _ in range(80):
                st = js("window.__spyglass.state()")
                if not st["busy"] and st["stage"] in ("glass", "event", "asking"):
                    break
                js("window.__spyglass.fast()"); page.wait_for_timeout(200)
            js(f"window.__spyglass.discover('{sid}')"); page.wait_for_timeout(300)
        for _ in range(150):
            js("window.__spyglass.fast()")
            st = js("window.__spyglass.state()")
            if st["stage"] == "asking" and not st["busy"]:
                break
            page.wait_for_timeout(200)
        print("spy state", st["stage"])
        js("document.getElementById('spy-choice-hide') && document.getElementById('spy-choice-hide').click()")
        for _ in range(150):
            js("window.__spyglass.fast()")
            if js("window.__spyglass.state()").get("stage") == "done" and shown("spy-finish-card"):
                break
            page.wait_for_timeout(200)
        page.wait_for_timeout(800)
        shot(page, "spy_finish")
        print("finish button:", js("document.getElementById('btn-spy-finish').innerText"), "| hint levels sigil/song:", get("order_hint_s16-sigil_level"), get("order_hint_s16-song_level"))
        page.click("#btn-spy-finish")
        trans, last = [], 0
        for ms in [60, 150, 250, 350, 500, 800, 1200]:
            page.wait_for_timeout(ms - last); last = ms
            trans.append((ms, shown("modal-bridge-spyglass"), shown("modal-cairn-four"), js("document.body.style.position"), js("window.__cairn4.cine()")))
            if ms in (150, 350):
                shot(page, f"handover_{ms}ms")
        print("handover timeline (ms, spy, c4, bodyPos, cine):", trans)

    # --- the opening film
    subs, t0 = [], time.time()
    print("cine active at start:", js("window.__cairn4.cine()"))
    while js("window.__cairn4.cine()") and time.time() - t0 < 25:
        s = js("document.getElementById('pillars3d-subtitle').textContent")
        if not subs or subs[-1] != s:
            subs.append(s)
        shot(page, f"cine_t{round(time.time() - t0, 1)}")
        page.wait_for_timeout(1300)
    print("cine subtitles:", subs, "| lasted", round(time.time() - t0, 1), "s")
    page.wait_for_timeout(600)
    howto = []
    if not js("document.getElementById('pillars3d-howto').hidden"):
        for k in range(4):
            howto.append(js("[...document.querySelectorAll('#pillars3d-howto .chasm3d-howto-page')].find(p => !p.hidden).innerText"))
            shot(page, f"howto_{k + 1}")
            page.click("#btn-pillars-howto-next"); page.wait_for_timeout(350)
    print("howto pages:", json.dumps(howto, ensure_ascii=False))
    print("howto key", get("order_cairn4_howto"), "| focus:", js("document.activeElement && document.activeElement.id"))
    shot(page, "part1_start")
    print("dispatch:", text("pillars-dispatch-text"))
    print("hint notes at start:", js("(document.querySelector('#pillars-key-feedback + .hint-ladder')||{}).innerText"))
    print("panel scroll:", js("(() => { const p = document.querySelector('#modal-cairn-four .chasm3d-panel'); return [p.scrollHeight, p.clientHeight] })()"))

    # --- Part I
    wrong = ["RESOND", "RESOUNDS", "REZOUND", "SOUNDER", "RESUND", "DNUOSER", "RESONND", "RASOUND", "RESOUNT"]
    for n, wd in enumerate(wrong, 1):
        page.fill("#pillars-key-input", wd)
        if n % 2: page.keyboard.press("Enter")
        else: page.click("#btn-pillars-speak")
        page.wait_for_timeout(250)
        if n in (1, 3, 6, 9):
            print(f"after {n} wrong: feedback={text('pillars-key-feedback')!r} level={get('order_hint_s16-sigil_level')} legacy={get('order_cairn4_hint')}")
            print("   notes:", js("(document.querySelector('#pillars-key-feedback + .hint-ladder')||{}).innerText"))
        if n in (1, 9):
            shot(page, f"sigil_wrong_{n}")
    print("input after wrong:", js("document.getElementById('pillars-key-input').value"), "| focus", js("document.activeElement.id"))
    page.fill("#pillars-key-input", "resound"); page.click("#btn-pillars-speak")
    page.wait_for_timeout(400); shot(page, "sigil_right_0.4s")
    page.wait_for_timeout(2000); shot(page, "sigil_right_2.4s")
    print("awake:", get("order_cairn4_awake"), "| feedback:", text("pillars-key-feedback"), "| dispatch:", text("pillars-dispatch-text"))
    print("focus after sigil:", js("document.activeElement.id"))

    # --- Part II: hover all 16 fissures at the default camera
    js("window.__cairn4.gfx().cam.p = null"); page.wait_for_timeout(700)
    shot(page, "part2_default_view")
    aims = {}
    for side in "LR":
        for d in [25, 30, 35, 40, 45, 50, 55, 60]:
            fid = f"{side}{d}"
            a = js(f"window.__cairn4.aimAt('{fid}')")
            page.mouse.move(a["x"], a["y"]); page.wait_for_timeout(120)
            aims[fid] = (round(a["x"]), round(a["y"]), js("document.getElementById('pillars3d-aim').textContent"))
    print("hover map:", json.dumps(aims, ensure_ascii=False))
    print("stage rect", js("(() => { const r = document.getElementById('pillars3d-stage').getBoundingClientRect(); return [r.left, r.top, r.width, r.height] })()"),
          "| tape box", js("(() => { const r = document.querySelector('#modal-cairn-four .pillars3d-tape-box').getBoundingClientRect(); return [r.left, r.top, r.width, r.height] })()"))
    a = js("window.__cairn4.aimAt('R60')"); page.mouse.move(a["x"], a["y"]); page.wait_for_timeout(300); shot(page, "hover_R60")
    page.mouse.move(5, 5)

    # --- verse I
    js("window.__aud.length = 0")
    js("""window.__glow = []; window.__g0 = performance.now(); window.__gi = setInterval(() => { const w = window.__cairn4.world(); window.__glow.push([Math.round(performance.now() - window.__g0), w.glowL, w.glowR, w.waves]); }, 40)""")
    page.click("#btn-pillars-play"); page.wait_for_timeout(300)
    js("""window.__fr = []; (function f(t){ window.__fr.push(t); if (window.__fr.length < 400) requestAnimationFrame(f); })(performance.now())""")
    page.wait_for_timeout(3500); shot(page, "verse1_playing_3s")
    page.wait_for_timeout(4000); shot(page, "verse1_playing_7s")
    print("frame intervals during verse (ms):", js("(() => { const a = window.__fr, d = []; for (let i = 1; i < a.length; i++) d.push(a[i] - a[i-1]); d.sort((x, y) => x - y); return { n: d.length, med: +d[d.length >> 1].toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1), max: +d[d.length - 1].toFixed(1), over50: d.filter(x => x > 50).length } })()"))
    page.wait_for_timeout(1900); shot(page, "verse1_playing_9.6s_echo2")
    page.wait_for_timeout(1050); shot(page, "verse1_playing_10.7s_call3")
    page.wait_for_timeout(6000); shot(page, "verse1_recorded")
    js("clearInterval(window.__gi)")
    g = js("window.__glow")
    peaks = [x for k, x in enumerate(g) if 0 < k < len(g) - 1 and (x[1] > 0.3 or x[2] > 0.3) and (max(x[1], x[2]) >= max(g[k-1][1], g[k-1][2]) and max(x[1], x[2]) > max(g[k+1][1], g[k+1][2]))]
    print("glow peaks (ms since click, L, R, waves):", peaks)
    print("glow max L/R over verse:", max(x[1] for x in g), max(x[2] for x in g), "| hum floor:", min(x[1] for x in g))
    print("audio ctx:", js("(() => { const c = (window.sfx && window.sfx.ctx); return c ? { state: c.state, out: c.outputLatency } : null })()"),
          "| pans:", sorted(set(js("window.__pans.map(p => +p.pan.value.toFixed(2))"))))
    aud = js("window.__aud")
    print("verse I schedule:", voices(aud), "| first osc ctx state:", aud[0]["state"] if aud else None)
    print("tape status:", text("pillars-tape-status"))

    # --- wrong verse by mouse on the cliffs
    js("window.__cairn4.gfx().cam.p = null"); page.wait_for_timeout(500)
    for fid in ["L35", "L45", "R30"]:
        a = js(f"window.__cairn4.aimAt('{fid}')"); page.mouse.click(a["x"], a["y"]); page.wait_for_timeout(500)
    shot(page, "verse1_marked")
    print("slots:", text("pillars-slots"), "| sing disabled:", js("document.getElementById('btn-pillars-sing').disabled"))
    page.click("#btn-pillars-sing"); page.wait_for_timeout(700)
    shot(page, "verse1_sung_wrong")
    print("wrong verse feedback:", text("pillars-song-feedback"))
    a = js("window.__cairn4.aimAt('R25')"); page.mouse.click(a["x"], a["y"]); page.wait_for_timeout(300)
    print("4th mark when full:", text("pillars-song-feedback"))
    # --- test call
    page.click("#btn-pillars-mode-call"); page.wait_for_timeout(200)
    js("window.__aud.length = 0")
    a = js("window.__cairn4.aimAt('L50')"); page.mouse.move(a["x"], a["y"]); page.wait_for_timeout(200)
    print("aim in call mode:", js("document.getElementById('pillars3d-aim').textContent"))
    page.mouse.click(a["x"], a["y"]); page.wait_for_timeout(2600); shot(page, "test_call_L50")
    print("test call schedule:", voices(js("window.__aud")))
    print("mode after test call (mark pressed?):", js("document.getElementById('btn-pillars-mode-mark').getAttribute('aria-pressed')"), "| tape:", text("pillars-tape-status"))
    page.wait_for_timeout(5000)
    print("tape after test call +5s:", text("pillars-tape-status"))

    # --- the song ladder
    for n in range(2, 10):
        page.click("#btn-pillars-sing"); page.wait_for_timeout(150)
        if n in (3, 6, 9):
            print(f"after {n} wrong verses: level={get('order_hint_s16-song_level')} count_hint={get('order_cairn4_count_hint')} | hint line shown: {shown('pillars-hint')}")
            print("   notes:", js("(document.querySelector('#pillars-song-feedback + .hint-ladder')||{}).innerText"))
    page.wait_for_timeout(400)
    shot(page, "song_ladder_3")
    js("document.querySelector('#modal-cairn-four .chasm3d-panel').scrollTop = 99999"); page.wait_for_timeout(300); shot(page, "song_ladder_3_panel_bottom")
    for _ in range(3):
        page.click("#btn-pillars-undo"); page.wait_for_timeout(100)

    # --- verse I true, close during verse II
    for fid in ["L30", "L45", "R25"]:
        js(f"window.__cairn4.mark('{fid}')")
    page.click("#btn-pillars-sing"); page.wait_for_timeout(1200)
    shot(page, "verse1_true")
    print("verse I:", get("order_cairn4_verses"), text("pillars-song-feedback"), "| dispatch:", text("pillars-dispatch-text"))
    page.click("#btn-pillars-play"); page.wait_for_timeout(2500)
    js("window.__cairn4.mark('L55')")
    print("live voice nodes before close:", js("window.__live.size"))
    page.click("#btn-close-pillars"); page.wait_for_timeout(600)
    print("live voice nodes after close:", js("window.__live.size"), "| modal:", shown("modal-cairn-four"), "| body pos:", repr(js("document.body.style.position")))
    page.wait_for_timeout(1000)
    js("window.openCairnFourModal()"); page.wait_for_timeout(1500)
    shot(page, "reopened")
    print("reopened: verse", js("window.__cairn4.verse()"), "| slots", text("pillars-slots"), "| tape", text("pillars-tape-status"), "| dispatch:", text("pillars-dispatch-text"))
    print("cine replays?", js("window.__cairn4.cine()"), "| howto?", not js("document.getElementById('pillars3d-howto').hidden"))
    page.keyboard.press("Escape"); page.wait_for_timeout(500)
    print("Escape closes:", not shown("modal-cairn-four"))
    js("window.openCairnFourModal()"); page.wait_for_timeout(1200)
    js("document.querySelector('#modal-cairn-four .pillars3d-plan-box').open = true"); page.wait_for_timeout(300)
    js("document.querySelector('#modal-cairn-four .chasm3d-panel').scrollTop = 99999"); page.wait_for_timeout(300)
    shot(page, "plan_open")
    for _ in range(4):
        js("document.getElementById('btn-pillars-undo').click()"); page.wait_for_timeout(60)
    js("document.querySelector('#pillars-plan .pillars-fissure[data-id=\"L55\"]').focus()")
    page.keyboard.press("Enter"); page.wait_for_timeout(200)
    print("plan keyboard mark:", text("pillars-slots"))
    for fid in ["L60", "R55", "R60"]:
        js(f"window.__cairn4.mark('{fid}')")
    page.click("#btn-pillars-sing"); page.wait_for_timeout(1500)
    shot(page, "verse2_true")
    print("verse II:", get("order_cairn4_verses"), "| dispatch:", text("pillars-dispatch-text"))
    js("window.__aud.length = 0")
    page.click("#btn-pillars-play"); page.wait_for_timeout(5000); shot(page, "verse3_playing")
    page.wait_for_timeout(8000); shot(page, "verse3_recorded")
    print("verse III schedule:", voices(js("window.__aud")))
    print("tape geometry verse III:", js("(() => { const s = document.getElementById('pillars-tape'); const w = document.getElementById('pillars-tape-wrap'); return { vb: s.getAttribute('viewBox'), w: s.getAttribute('width'), wrapW: w.clientWidth, scrollW: w.scrollWidth } })()"))
    print("console errors:", errors[:8])
    b.close()
server.shutdown()
