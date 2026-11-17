"""Audit (part 4): leaving Station 16 with Silvia's real save. Solves Cairn IV for real, then follows the reward,
satchel, Ledger, notebook, Field Wire 19-22, the map and a revisit. Screenshots + a JSON log, no file under web/ is touched.
Usage: python3 scratch/verifications/s16_audit/leave_s16.py OUT_DIR [bridge_choice] [reduced]"""
import os, sys, json, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
BRIDGE = sys.argv[2] if len(sys.argv) > 2 else "hide"
REDUCED = len(sys.argv) > 3 and sys.argv[3] == "reduced"
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
seed = dict(save, **W.SILVIA)
seed["order_cairn4_march_start"] = str(int(time.time() * 1000) - int(18.3 * 3600 * 1000))
seed["order_bridge_spyglass"] = json.dumps({"done": True, "choice": BRIDGE})
LOG = {}
PORT = int(os.environ.get("LEAVE_PORT", "8864")); W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, seed, reduced_motion=REDUCED)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    get = lambda k: js("k => localStorage.getItem(k)", k)
    def shot(n):
        t = time.time()
        try:
            page.screenshot(path=f"{OUT}/{n}.png", timeout=25000)
        except Exception as e:
            LOG.setdefault("shot_fail", []).append([n, str(e)[:120]])
        LOG.setdefault("shot_secs", {})[n] = round(time.time() - t, 1)
        json.dump(LOG, open(f"{OUT}/log.json", "w"), indent=1, ensure_ascii=False)
    page.goto(f"{W.BASE}/index.html?cloud=0", wait_until="load"); page.wait_for_timeout(3000)
    before = js("Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]))")
    LOG["before_relics"] = js("window.getOwnedRelicIds()")
    LOG["satchel_strip_before"] = js("(() => { const w = document.getElementById('satchel-wrap'); return w ? [w.innerText, getComputedStyle(w).display, w.children.length] : null })()")
    # ---- Station 16: wake and sing ----
    js("window.openCairnFourModal()"); page.wait_for_timeout(1500)
    page.fill("#pillars-key-input", "RESOUND"); page.click("#btn-pillars-speak"); page.wait_for_timeout(1200)
    verses = js("window.__cairn4.verses")
    for k, v in enumerate(verses):
        for c in v["calls"]:
            js(f"window.__cairn4.mark('{c['side']}{c['d']}')")
        if k == 2:
            shot("01_before_last_verse")
        js("window.__cairn4.sing()"); page.wait_for_timeout(400 if k < 2 else 50)
    t0 = time.time()
    for at in [0.3, 1.5, 3.5, 6.0, 9.0, 13.0]:
        page.wait_for_timeout(max(0, int((at - (time.time() - t0)) * 1000)))
        shot(f"02_complete_t{at:04.1f}s")
    LOG["item_modal_open"] = js("getComputedStyle(document.getElementById('modal-item-acquired')).display")
    LOG["victory"] = js("""(() => { const v = document.getElementById('pillars-victory'); const r = v.getBoundingClientRect();
        const panel = v.closest('.chasm3d-panel') || v.parentElement; return { text: v.innerText, top: r.top, bottom: r.bottom, h: r.height, inView: r.top >= 0 && r.bottom <= innerHeight,
        panel: panel ? [panel.className, panel.scrollTop, panel.scrollHeight, panel.clientHeight] : null, dispatch: document.getElementById('pillars-dispatch-text').innerText,
        subtitle: (document.getElementById('pillars3d-subtitle')||{}).innerText, focused: document.activeElement && (document.activeElement.id || document.activeElement.className) } })()""")
    LOG["flags_after_complete"] = {k: get(k) for k in ["order_cairn_iv_completed", "order_seal_cairn_4", "order_field_wire_step", "eclipse_cloud_inv_unseen", "order_inventory_relics", "order_journal"]}
    js("document.getElementById('pillars-victory').scrollIntoView({block:'center'})"); page.wait_for_timeout(400)
    shot("03_victory_card")
    # ---- Back to the map ----
    page.click("#btn-pillars-finish"); page.wait_for_timeout(1500)
    LOG["toast"] = js("(document.getElementById('desert-toast-banner') || {}).textContent || ''")
    LOG["view_after_finish"] = js("document.body.getAttribute('data-active-view')")
    LOG["satchel_strip_after"] = js("(() => { const w = document.getElementById('satchel-wrap'); return w ? { text: w.innerText, html: w.innerHTML.slice(0, 2500), shown: getComputedStyle(w).display } : null })()")
    LOG["inv_badge"] = js("[document.getElementById('bsi-badge').textContent, getComputedStyle(document.getElementById('bsi-new-dot')).display]")
    shot("04_after_finish_map")
    js("window.scrollTo(0,0)"); page.wait_for_timeout(300); shot("04b_after_finish_top")
    # ---- Satchel ----
    js("window.openSatchelInventoryModal && window.openSatchelInventoryModal('tuning_pebble')"); page.wait_for_timeout(1200)
    shot("05_satchel_pebble")
    LOG["satchel_text"] = js("(() => { const m = [...document.querySelectorAll('[id^=modal]')].find(e => getComputedStyle(e).display !== 'none'); return m ? [m.id, m.innerText.slice(0, 2500)] : null })()")
    page.keyboard.press("Escape"); page.wait_for_timeout(600)
    js("window.openItemAcquiredModal && window.openItemAcquiredModal({id:'tuning_pebble'})"); page.wait_for_timeout(1200)
    shot("05b_item_card_pebble")
    LOG["item_card_text"] = js("document.getElementById('modal-item-acquired').innerText")
    page.keyboard.press("Escape"); page.wait_for_timeout(600)
    js("(() => { const m = document.getElementById('modal-item-acquired'); if (m && getComputedStyle(m).display !== 'none') { const b = m.querySelector('button'); b && b.click(); } })()"); page.wait_for_timeout(500)
    # ---- Ledger ----
    js("document.querySelector('[data-view=\"view-cipher\"]').click()"); page.wait_for_timeout(1500)
    LOG["ledger_items"] = js("[...document.querySelectorAll('.clue-equation-item')].map(e => [e.id, e.innerText.replace(/\\s+/g,' ').slice(0,160), e.className])")
    LOG["ledger_S_U_W_N"] = js("(() => { const L = JSON.parse(localStorage.getItem('seeker_silvia_cipher_ledger')||'{}'); return [L.S, L.U, L.W, L.N]; })()")
    js("(() => { const e = document.getElementById('eq-item-cairn4-sum'); if (e) e.scrollIntoView({block:'center'}); })()")
    page.wait_for_timeout(500); shot("06_ledger_cairn4")
    LOG["balance"] = js("(() => { const b = document.getElementById('surveyors-balance'); return b ? b.innerText.slice(0, 900) : null })()")
    js("(() => { const b = document.getElementById('surveyors-balance'); if (b) b.scrollIntoView({block:'start'}); })()"); page.wait_for_timeout(500); shot("06b_ledger_balance")
    # ---- Notebook ----
    js("document.querySelector('[data-view=\"view-chronicles\"]').click()"); page.wait_for_timeout(3000)
    LOG["journal_key"] = get("order_journal")
    LOG["notebook_text"] = js("(() => { const h = document.querySelector('.notebook-head'); return h ? h.parentElement.innerText.slice(0, 3500) : null })()")
    js("(() => { const h = document.querySelector('.notebook-head'); if (h) h.scrollIntoView({block:'start'}); })()"); page.wait_for_timeout(600)
    shot("07_notebook")
    LOG["journey"] = js("window.EclipseJourney ? EclipseJourney.profile() : null")
    # ---- Field Wire 19 ----
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(5000)
    LOG["wire_step_open"] = get("order_field_wire_step")
    shot("08_wire19_open")
    LOG["wire19_last"] = js("[...document.querySelectorAll('#wire-messages-stream .chat-bubble')].slice(-3).map(b => b.innerText)")
    LOG["wire19_chips"] = js("[...document.querySelectorAll('.wire-aside-chip')].map(b => b.textContent).slice(-6)")
    LOG["wire19_choices"] = js("[...document.querySelectorAll('#wire-choices-grid button')].map(b => b.innerText)")
    LOG["wire_view_head"] = js("document.getElementById('view-field-wire').innerText.slice(0, 1500)")
    js("(() => { const c = [...document.querySelectorAll('.wire-aside-chip')]; const x = c.find(b => b.textContent.includes('exactly the same rhythm')); x && x.click(); })()"); page.wait_for_timeout(1500)
    shot("09_wire19_ask")
    LOG["wire19_ask_reply"] = js("[...document.querySelectorAll('.wire-aside-reply-inline')].filter(e => !e.hidden).map(e => e.innerText).slice(-1)")
    js("document.querySelector('#wire-choices-grid button').click()"); page.wait_for_timeout(9000)
    LOG["wire_step_after19"] = get("order_field_wire_step")
    shot("10_wire20")
    LOG["wire20_tail"] = js("document.getElementById('wire-messages-stream').innerText.slice(-2500)")
    LOG["rest_btn"] = js("!!document.getElementById('btn-wire-rest')")
    if LOG["rest_btn"]:
        js("document.getElementById('btn-wire-rest').scrollIntoView({block:'center'})"); page.wait_for_timeout(400)
        shot("11_wire20_rest")
        LOG["rest_card"] = js("document.getElementById('btn-wire-rest').closest('div').parentElement.innerText.slice(0, 800)")
        # the map while he rests
        js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(2500)
        js("window.scrollTo(0,0)"); page.wait_for_timeout(300); shot("11b_map_resting")
        LOG["map_text_resting"] = js("document.getElementById('view-trail').innerText.slice(0, 2500)")
        js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(3000)
        js("document.getElementById('btn-wire-rest').click()"); page.wait_for_timeout(7000)
    LOG["wire_step_after_rest"] = get("order_field_wire_step")
    shot("12_wire21")
    LOG["wire21_choices"] = js("[...document.querySelectorAll('#wire-choices-grid button')].map(b => b.innerText)")
    js("document.querySelector('#wire-choices-grid button') && document.querySelector('#wire-choices-grid button').click()"); page.wait_for_timeout(9000)
    LOG["wire_step_after21"] = get("order_field_wire_step"); LOG["cairn5_march_start"] = get("order_cairn5_march_start")
    shot("14_wire22_march")
    LOG["wire22_tail"] = js("document.getElementById('wire-messages-stream').innerText.slice(-1800)")
    LOG["wire_bar"] = js("(() => { const b = document.getElementById('wire-completed-bar'); return b ? b.innerText.slice(0, 800) : null })()")
    js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(3000)
    js("window.scrollTo(0,0)"); page.wait_for_timeout(300)
    shot("15_map_march_s17")
    LOG["map_text_march"] = js("document.getElementById('view-trail').innerText.slice(0, 2500)")
    LOG["s17_open_attempt"] = js("(() => { try { window.selectDesertStation(26); } catch(e) { return 'err ' + e } return (document.getElementById('desert-toast-banner')||{}).textContent })()")
    page.wait_for_timeout(800); shot("16_s17_sealed_toast")
    # ---- Revisit Cairn IV ----
    js("window.openCairnFourModal()"); page.wait_for_timeout(2500)
    shot("17_revisit_cairn4")
    LOG["revisit"] = js("""(() => ({ victory: getComputedStyle(document.getElementById('pillars-victory')).display, game: getComputedStyle(document.getElementById('pillars-game')).display,
        dispatch: document.getElementById('pillars-dispatch-text').innerText, verses: (document.getElementById('pillars3d-verses')||{}).innerText,
        buttons: [...document.querySelectorAll('#modal-cairn-four button')].filter(b => b.offsetParent).map(b => b.innerText.trim()).filter(Boolean) }))()""")
    js("window.closeCairnFourModal()"); page.wait_for_timeout(600)
    page.reload(); page.wait_for_timeout(3500)
    after = js("Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]))")
    LOG["lost_keys"] = [k for k in before if k not in after]
    LOG["changed_keys"] = {k: [before[k][:150], after[k][:150]] for k in before if k in after and before[k] != after[k]}
    LOG["new_keys"] = {k: after[k][:200] for k in after if k not in before}
    LOG["relics_after_reload"] = js("window.getOwnedRelicIds()")
    LOG["errors"] = errors
    b.close()
server.shutdown()
json.dump(LOG, open(f"{OUT}/log.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(LOG, indent=1, ensure_ascii=False)[:24000])
