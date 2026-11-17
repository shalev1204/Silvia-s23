"""Load Silvia's SAVE from web/hub/js/story-point.js (same parsing as wire_layout_check.py). Import: from load_save import save"""
import os, json
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
src = open(os.path.join(ROOT, "web", "hub", "js", "story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
if __name__ == "__main__":
    import sys
    keys = sys.argv[1:]
    for k, v in sorted(save.items()):
        if not keys or any(s in k for s in keys):
            print(k, "=", v[:300])
