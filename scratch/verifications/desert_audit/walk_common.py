"""Silvia's own road through what is left of the Desert Path, played from her real save (Supabase, 20 Nov).
Shared pieces for the walk scripts: a server on web/, a page seeded with a state file (her save, then the state each
leg leaves), a log of every line of text that appears (Field Wire, dispatches, subtitles, films, feedback, trays,
toasts), screenshots, page errors, and the state saved at the end of a leg for the next one.
Nothing here pre-seeds films or how-tos as seen: she meets them as they are."""
import json, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402

LOG_JS = r"""
(() => {
  window.__log = []; const last = new Map(); const t0 = Date.now();
  const SEL = '.chat-bubble-wrap, .chat-bubble, [id$="-dispatch-text"], [id$="-subtitle"], [id$="-feedback"], [id$="-voice"], [id$="-status"],'
    + ' .cine-title, .cine-line, .cine-sub, #gates-log, #relic-tray-ask, .rt-reply, .toast, .hub-toast, [class*="toast"], .messenger-waypoint-title,'
    + ' .messenger-waypoint-desc, #iac-title, #iac-desc, [id$="-hint"], .hint-ladder, .chasm3d-reward-card, #desert-farewell, #gates-decree-card,'
    + ' [id$="-where"], [id$="-speaker"], .wire-relic-chip, #five-seals-overlay, [id$="-victory"]';
  function rec(node) {
    const el = node && (node.nodeType === 1 ? node : node.parentElement);
    const box = el && el.closest && el.closest(SEL);
    if (!box) return;
    const key = box.id || (box.className && String(box.className).split(' ')[0]) || box.tagName;
    const txt = (box.innerText || box.textContent || '').replace(/\s+/g, ' ').trim();
    if (!txt || last.get(box) === txt) return;
    last.set(box, txt);
    window.__log.push(((Date.now() - t0) / 1000).toFixed(1) + 's [' + key + '] ' + txt.slice(0, 1200));
  }
  const start = () => new MutationObserver((ms) => ms.forEach((m) => { rec(m.target); m.addedNodes.forEach(rec); }))
    .observe(document.body, { subtree: true, childList: true, characterData: true });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
"""
SEED = "(()=>{if(sessionStorage.getItem('__seeded'))return;const s=%s;localStorage.clear();for(const k in s)localStorage.setItem(k,s[k]);sessionStorage.setItem('__seeded','1')})()"


class Walk:
    def __init__(self, p, out, state, port, vw=1440, vh=900, fast=True):
        self.out = out; os.makedirs(out, exist_ok=True)
        self.errors = []; self.n = 0
        self.b = p.chromium.launch(args=W.CHROMIUM_ARGS)
        self.ctx = self.b.new_context(viewport={"width": vw, "height": vh})
        self.ctx.set_default_timeout(60000)
        self.page = self.ctx.new_page()
        pg = self.page
        pg.on("pageerror", lambda e: self.errors.append("JS error: " + str(e)[:300]))
        pg.on("console", lambda m: self.errors.append("console: " + m.text[:300]) if m.type == "error" else None)
        pg.on("response", lambda r: self.errors.append(f"HTTP {r.status}: {r.url}") if r.status >= 400 else None)
        if fast:
            pg.add_init_script("window.__wireFast = true")
        pg.add_init_script(SEED % json.dumps(state))
        pg.add_init_script(LOG_JS)
        self.base = f"http://127.0.0.1:{port}"
        self.logf = open(os.path.join(out, "log.txt"), "a", encoding="utf-8")

    def js(self, expr, arg=None):
        return self.page.evaluate(expr, arg) if arg is not None else self.page.evaluate(expr)

    def get(self, k):
        return self.js("k => localStorage.getItem(k)", k)

    def wait(self, ms):
        self.page.wait_for_timeout(ms)

    def note(self, msg):
        self.flush(); self.logf.write("\n==== " + msg + "\n"); self.logf.flush(); print("==", msg)

    def flush(self):
        try:
            lines = self.js("(() => { const l = window.__log || []; window.__log = []; return l; })()")
        except Exception:
            lines = []
        for l in lines:
            self.logf.write(l + "\n")
        self.logf.flush()

    def shot(self, name, full=False):
        self.n += 1
        path = os.path.join(self.out, f"{self.n:02d}_{name}.png")
        self.page.screenshot(path=path, full_page=full)
        return path

    def open(self):
        self.page.goto(self.base + "/index.html", wait_until="load"); self.wait(3000)
        self.recap()

    def recap(self, name="recap"):
        """The 'Previously on' card she meets when she comes back: shot, logged, then Continue the story."""
        for _ in range(10):
            if self.js("!!document.querySelector('.previously-overlay')"):
                self.shot(name)
                self.js("document.querySelector('.previously-overlay button').click()"); self.wait(800)
                return True
            self.wait(300)
        return False

    def wire(self):
        self.js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); self.wait(2500)

    def wire_text(self):
        return self.js("document.getElementById('view-field-wire').innerText")

    def choices(self):
        return self.js("[...document.querySelectorAll('#wire-choices-grid button')].map(b => b.innerText.replace(/\\s+/g, ' ').trim())")

    def answer(self, i=0, ms=9000):
        self.js(f"document.querySelectorAll('#wire-choices-grid button')[{i}].click()"); self.wait(ms)

    def save_state(self, path):
        st = self.js("(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; })()")
        json.dump(st, open(path, "w"), indent=1, ensure_ascii=False)
        return st

    def close(self):
        self.flush()
        self.logf.write("\n==== page errors\n" + "\n".join(self.errors) + "\n"); self.logf.close()
        self.ctx.close(); self.b.close()
