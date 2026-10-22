#!/usr/bin/env python3
"""The list of files the Hub keeps for playing without a signal (docs/IDEAS_BACKLOG.md #21).

web/sw.js caches these files when it installs; everything else (the constellation games) is kept the first
time it is opened. The list and its version are written into sw.js between the <offline-list> marks, so any
change to a listed file changes sw.js and the iPad fetches the new version in the background.

    python3 scripts/web/offline_list.py           # rewrite the list in web/sw.js
    python3 scripts/web/offline_list.py --check   # exit 1 if the list is out of date (the smoke runs this)

Run it before every `npx wrangler pages deploy web`.
"""
import hashlib
import json
import os
import re
import sys

WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "web")
WEB = os.path.normpath(WEB)
SW = os.path.join(WEB, "sw.js")
FOLDERS = ["hub", "assets", "shared"]
FILES = ["favicon.ico", "favicon.svg"]
SKIP = (".md", ".txt")
# pictures of the constellation games that the Hub itself shows (its cards, posters and plates)
HUB_REFS = re.compile(r"constellation/[\w./-]+\.(?:jpg|png|webp|svg)")
MARK = re.compile(r"(// <offline-list>.*?\n)(.*?)(\s*// </offline-list>)", re.S)


def files():
    out = [os.path.join(WEB, f) for f in FILES]
    for folder in FOLDERS:
        for root, _, names in os.walk(os.path.join(WEB, folder)):
            out += [os.path.join(root, n) for n in names if not n.startswith(".") and not n.endswith(SKIP)]
    text = ""
    for path in [os.path.join(WEB, "index.html")] + [p for p in out if p.endswith((".js", ".css"))]:
        with open(path, encoding="utf-8", errors="ignore") as f:
            text += f.read()
    out += [os.path.join(WEB, r) for r in sorted(set(HUB_REFS.findall(text))) if os.path.isfile(os.path.join(WEB, r))]
    return sorted(set(out))


def block():
    paths = files()
    digest = hashlib.sha1()
    # the Hub's own page is kept as "./" (the published site redirects index.html there)
    for path in [os.path.join(WEB, "index.html")] + paths:
        digest.update(os.path.relpath(path, WEB).encode())
        with open(path, "rb") as f:
            digest.update(f.read())
    urls = ["./"] + ["./" + os.path.relpath(p, WEB).replace(os.sep, "/") for p in paths]
    size = sum(os.path.getsize(p) for p in paths) + os.path.getsize(os.path.join(WEB, "index.html"))
    return ("var VERSION = '%s';  // %d files, %.1f MB\nvar PRECACHE = %s;"
            % (digest.hexdigest()[:12], len(urls), size / 1e6, json.dumps(urls, indent=2)))


def main():
    with open(SW, encoding="utf-8") as f:
        sw = f.read()
    m = MARK.search(sw)
    if not m:
        sys.exit("web/sw.js has no <offline-list> marks")
    new = block()
    if "--check" in sys.argv:
        if m.group(2).strip() != new:
            print("web/sw.js: the offline list is out of date; run python3 scripts/web/offline_list.py")
            sys.exit(1)
        print("web/sw.js: the offline list is current")
        return
    with open(SW, "w", encoding="utf-8") as f:
        f.write(sw[:m.start(2)] + new + sw[m.end(2):])
    print("web/sw.js: " + new.split("\n")[0])


if __name__ == "__main__":
    main()
