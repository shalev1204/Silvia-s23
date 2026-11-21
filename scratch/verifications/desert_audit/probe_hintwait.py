"""A note given early waits for its part of the puzzle: grant while inactive -> hidden; active -> shown within a tick."""
import json, sys
from playwright.sync_api import sync_playwright
from walk_common import Walk, W
W.start_server(port=8918)
with sync_playwright() as p:
    w = Walk(p, sys.argv[1], {}, 8918); js = w.js
    w.open()
    js("""(() => { const a = document.createElement('p'); a.id = 'probe-anchor'; a.textContent = 'x'; document.body.prepend(a);
      window.__on = false; window.__h = window.EclipseHints.define({ id: 'probe-h', station: 'Probe', title: 't', anchor: a, solved: () => false, active: () => window.__on, texts: ['ONE', 'TWO', 'THREE'] });
      window.EclipseHints.grant('probe-h', 1); })()""")
    shown = "(b => b ? getComputedStyle(b).display + ' ' + b.textContent : 'none')(document.querySelector('#probe-anchor + .hint-ladder'))"
    print("granted while inactive:", js(shown))
    js("window.__on = true"); w.wait(5600); print("after it became active:", js(shown))
    js("window.__on = false; window.__h.refresh()"); print("refresh while inactive:", js(shown))
    w.close(); print("errors", w.errors[:3])
