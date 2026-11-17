#!/usr/bin/env python3
"""Regenerates GEMINI.md, .cursorrules and .cursor/rules/canonical-lore.mdc from CLAUDE.md.

CLAUDE.md is the only origin: each copy keeps its own header (everything before the first '---' line) and takes the body of
CLAUDE.md from there on, with the audience phrase of the onboarding adapted. Run from the repo root:  python3 scratch/utils/sync_agent_rules.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEP = "\n---\n"


def split_header(text):
    """(header, body): the header is everything before the first '---' on its own line (and after any front matter)."""
    front = ""
    if text.startswith("---\n"):
        end = text.index("\n---\n", 4) + 5
        front, text = text[:end], text[end:]
    i = text.index(SEP)
    return front + text[:i], text[i:]


def main():
    _, body = split_header((ROOT / "CLAUDE.md").read_text(encoding="utf-8"))
    targets = {
        "GEMINI.md": "GEMINI / ANTIGRAVITY",
        ".cursorrules": "CURSOR AI",
        ".cursor/rules/canonical-lore.mdc": "CURSOR AI",
    }
    for rel, audience in targets.items():
        path = ROOT / rel
        header, _ = split_header(path.read_text(encoding="utf-8"))
        new_body = body.replace("TODO AGENTE DE CLAUDE CODE DEBE CONSULTAR", f"TODO AGENTE DE {audience} DEBE CONSULTAR")
        path.write_text(header + new_body, encoding="utf-8")
        print("synced", rel)


if __name__ == "__main__":
    main()
