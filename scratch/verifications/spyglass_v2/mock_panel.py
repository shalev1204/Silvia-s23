"""Mock-ups (not the game's code) of three ways to lay out "What the glass has found" and the question to Hermes,
injected into the live Spyglass scene for screenshots. Usage: python3 mock_panel.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8865
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})

CSS = """
.mk-hide { display: none !important; }
/* A: medallions */
.mkA-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 8px; }
.mkA-med { aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; font-size: 1.15rem; border: 1px solid rgba(212,168,83,.3); background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.06), rgba(0,0,0,.25)); color: #6d5e48; font-family: Cinzel, Georgia, serif; }
.mkA-med.on { border-color: #d4a853; background: radial-gradient(circle at 35% 30%, rgba(255,226,150,.35), rgba(212,168,83,.12)); box-shadow: 0 0 8px rgba(255,200,110,.25); }
.mkA-last { margin-top: 7px; font: italic .82rem Georgia, serif; color: #e6d6c2; } .mkA-last b { color: #fde68a; font-style: normal; font-weight: 600; }
.mk-ask { position: absolute; z-index: 30; display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; cursor: pointer;
  font: 600 .8rem Cinzel, Georgia, serif; letter-spacing: .08em; color: #fde68a; background: rgba(24,16,10,.82); border: 1px solid rgba(212,168,83,.6); box-shadow: 0 4px 14px rgba(0,0,0,.45); }
/* B: short chips in a grid, Hermes on his own row */
.mkB-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }
.mkB-chip { padding: 4px 6px; border-radius: 6px; text-align: center; white-space: nowrap; font: .78rem Inter, system-ui, sans-serif; border: 1px solid rgba(212,168,83,.25); color: #7d6d55; background: rgba(255,255,255,.02); }
.mkB-chip.on { color: #fde68a; border-color: #d4a853; background: rgba(212,168,83,.14); }
.mkB-ask { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(120,160,255,.45); background: rgba(40,70,150,.22); cursor: pointer; }
.mkB-ask .ic { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #1d2f63; border: 1px solid #9db4ff; }
.mkB-ask .t { font: 600 .8rem Cinzel, Georgia, serif; letter-spacing: .07em; color: #dfe8ff; } .mkB-ask .s { font: italic .74rem Georgia, serif; color: #a9b8dc; }
/* C: one line of beads, opens to the list */
.mkC-line { display: flex; align-items: center; gap: 10px; }
.mkC-beads { display: flex; gap: 5px; flex: 1; }
.mkC-b { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: .8rem; border: 1px solid rgba(212,168,83,.3); color: #6d5e48; }
.mkC-b.on { border-color: #d4a853; background: rgba(212,168,83,.2); }
.mkC-more { font: .74rem Inter, system-ui, sans-serif; color: #d4a853; cursor: pointer; white-space: nowrap; }
.mkC-list { margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 3px 12px; font: .78rem Inter, system-ui, sans-serif; color: #7d6d55; }
.mkC-list .on { color: #fde68a; }
"""

SIGHTS = [("wagons", "🛞", "Wagon", "The wedged wagon"), ("oilcloth", "🔥", "Oilcloth", "The mark on the oilcloth"), ("hairpin", "👣", "Four men", "Four men on foot"),
          ("stone", "◐", "Stone 980", "Survey stone 980"), ("boulders", "🪨", "Boulders", "The boulders of 1971"), ("tower", "🏛️", "Tower II", "Tower II, far away"), ("pillars", "🎶", "Pillars", "The pillars of Cairn IV")]

JS = """([opt, sights, found]) => {
  document.querySelectorAll('.mk-x').forEach(e => e.remove());
  const tr = document.querySelector('.spy-tracker'), head = tr.querySelector('.spy-tracker-head'), chips = document.getElementById('spy-sights'), hb = document.getElementById('btn-spy-hint');
  [chips, hb].forEach(e => e.classList.add('mk-hide')); head.classList.remove('mk-hide'); tr.style.border = '';
  const stage = document.getElementById('spy-stage'); const n = found.length;
  const add = (parent, html, before) => { const d = document.createElement('div'); d.className = 'mk-x'; d.innerHTML = html; before ? parent.insertBefore(d, before) : parent.appendChild(d); return d; };
  if (opt === 'A') {
    add(tr, '<div class="mkA-row">' + sights.map(s => `<div class="mkA-med ${found.includes(s[0]) ? 'on' : ''}" title="${s[3]}">${found.includes(s[0]) ? s[1] : '?'}</div>`).join('') + '</div>'
      + '<div class="mkA-last">Last found: <b>🔥 The mark on the oilcloth</b></div>');
    const a = add(stage, '<button class="mk-ask" style="left:50%;transform:translateX(-50%);bottom:88px">🧭 Ask Hermes where to look</button>');
    a.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:30'; a.firstChild.style.pointerEvents = 'auto';
  }
  if (opt === 'B') {
    head.firstElementChild.textContent = '🔭 FOUND';
    add(tr, '<div class="mkB-grid">' + sights.map(s => `<div class="mkB-chip ${found.includes(s[0]) ? 'on' : ''}" title="${s[3]}">${found.includes(s[0]) ? s[1] + ' ' + s[2] : '?'}</div>`).join('') + '</div>');
    add(tr.parentNode, '<div class="mkB-ask"><span class="ic">🧭</span><span><div class="t">Ask Hermes where to look</div><div class="s">He names a place. Ask again and he turns the glass for you.</div></span></div>', tr.nextSibling);
  }
  if (opt === 'C' || opt === 'C2') {
    head.classList.add('mk-hide');
    add(tr, '<div class="mkC-line"><span style="font:600 .7rem Cinzel,Georgia,serif;letter-spacing:.13em;color:#d4a853">🔭 FOUND ' + n + ' / 7</span><div class="mkC-beads">'
      + sights.map(s => `<span class="mkC-b ${found.includes(s[0]) ? 'on' : ''}">${found.includes(s[0]) ? s[1] : ''}</span>`).join('') + '</div><span class="mkC-more">' + (opt === 'C2' ? 'hide ▴' : 'names ▾') + '</span></div>'
      + (opt === 'C2' ? '<div class="mkC-list">' + sights.map(s => `<span class="${found.includes(s[0]) ? 'on' : ''}">${found.includes(s[0]) ? s[1] + ' ' + s[3] : '· · ·'}</span>`).join('') + '</div>' : ''));
    const a = add(stage, '<button class="mk-ask" style="right:22px;bottom:22px">🧭 Where should I look?</button>');
    a.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:30'; a.firstChild.style.pointerEvents = 'auto';
  }
}"""

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS); ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": 1440, "height": 900}); page.route("**/*supabase.co/**", lambda r: r.abort())
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove()); window.__spyglass.fast(); window.openBridgeSpyglassModal()")
    def wait_glass():
        for _ in range(300):
            st = page.evaluate("window.__spyglass.state()")
            if st["stage"] == "glass" and not st["busy"]: return st
            page.wait_for_timeout(200)
    wait_glass()
    for sid in ["wagons", "oilcloth", "stone"]:
        page.evaluate(f"window.__spyglass.discover('{sid}')"); wait_glass()
    page.evaluate("window.__spyglass.slow()"); page.evaluate("window.__spyglass.aim('wagons', false)"); page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT, "now.png"))
    page.add_style_tag(content=CSS)
    found = ["wagons", "oilcloth", "stone"]
    for opt in ["A", "B", "C", "C2"]:
        page.evaluate(JS, [opt, [list(s) for s in SIGHTS], found]); page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(OUT, f"opt{opt}.png"))
    print("errors", errors); b.close()
