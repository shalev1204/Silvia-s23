"""Wire hours: her history (no hour on record) shows none; a new message keeps the hour it came, across a reload.
Usage: python3 probe_times.py STATE.json [PORT]"""
import json, sys
from playwright.sync_api import sync_playwright
from walk_common import Walk, W
st = json.load(open(sys.argv[1])); PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8914
W.start_server(port=PORT)
times = "[...document.querySelectorAll('#wire-messages-stream .chat-bubble-time')].map(t => t.textContent.trim())"
with sync_playwright() as p:
    w = Walk(p, sys.argv[1].rsplit('/', 1)[0] + "/probe_times", st, PORT)
    w.open(); w.wire(); w.wait(2500)
    t0 = w.js(times); print("history:", len(t0), "with an hour:", [t for t in t0 if t and t != "✓✓"])
    w.answer(0, 12000); t1 = w.js(times); print("after answer:", t1[-4:])
    w.page.reload(); w.wait(3000); w.recap(); w.wire(); w.wait(2500); t2 = w.js(times); print("after reload:", t2[-4:])
    print("same:", t1[-4:] == t2[-4:]); w.close(); print("errors", w.errors[:5])
