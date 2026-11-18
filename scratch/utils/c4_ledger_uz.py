"""One-off: Cairn IV's second Ledger line becomes [U] + [Z] = 9 (Operator's choice, 18 Nov 2026). Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) >= 1, (p, a[:60])
        s = s.replace(a, b)
    open(p, 'w').write(s)

R('web/hub/js/hub-core.js', [
    ("name: 'The Falling Echo', expr: 'S − U', l1: 'S', op: '-', l2: 'U', target: 9,", "name: 'The Falling Echo', expr: 'U + Z', l1: 'U', op: '+', l2: 'Z', target: 9,"),
    ("label: 'Ledger: [S] + [U] = 17 · [S] − [U] = 9'", "label: 'Ledger: [U] + [Z] = 9 · [S] + [U] = 17'"),
    ("belong in your Cipher Ledger: [S] + [U] = 17 and [S] − [U] = 9. Two unknowns, two lines: you know the trick.",
     "belong in your Cipher Ledger: [U] + [Z] = 9 and [S] + [U] = 17. Read them in that order: the first gives you U, and U opens S."),
    ("' / 5 · [S] + [U] = 17 · [S] − [U] = 9 RECORDED ✦'", "' / 5 · [S] + [U] = 17 · [U] + [Z] = 9 RECORDED ✦'"),
])
R('web/hub/js/wire-script-bridge.js', [("two lines: [S] + [U] = 17 and [S] − [U] = 9.'", "two lines: [U] + [Z] = 9 and [S] + [U] = 17.'")])
R('web/hub/js/stations/s16-cairn-iv.js', [
    ('<div class="rw-ledger-title">The Line of the Sum</div><div class="rw-eq" aria-label="S plus U equals 17"><i>S</i><u>+</u><i>U</i><u>=</u><b>17</b></div><p>A line for your Cipher Ledger.</p>',
     '<div class="rw-ledger-title">The Falling Echo</div><div class="rw-eq" aria-label="U plus Z equals 9"><i>U</i><u>+</u><i>Z</i><u>=</u><b>9</b></div><p>A line for your Cipher Ledger. Read it first.</p>'),
    ('<div class="rw-ledger-title">The Line of the Difference</div><div class="rw-eq" aria-label="S minus U equals 9"><i>S</i><u>−</u><i>U</i><u>=</u><b>9</b></div>',
     '<div class="rw-ledger-title">The Rising Echo</div><div class="rw-eq" aria-label="S plus U equals 17"><i>S</i><u>+</u><i>U</i><u>=</u><b>17</b></div>'),
])
R('scripts/audit/web_smoke.py', [('"Ledger shows [S] + [U] = 17 and [S] − [U] = 9")', '"Ledger shows [U] + [Z] = 9 and [S] + [U] = 17")')])
R('docs/CANONICAL_LORE_AND_VOCABULARY_AUDIT.md', [
    ("Hermes: *«Two unknowns, two lines: you know the trick.»*",
     "Hermes: *«Read them in that order: the first gives you U, and U opens S.»* (Decisión del Operador, 18-nov-2026: ya no se dan dos líneas sobre la misma pareja de letras.)"),
    ("- **Ecuación 1 (The Rising Echo)**:\n  $$[S] + [U] = 17$$\n- **Ecuación 2 (The Falling Echo)**:\n  $$[S] - [U] = 9$$\n"
     "- **Resolución** (sistema de dos ecuaciones, como en §7.B.1–5):\n  $$2[S] = 17 + 9 = 26 \\implies \\mathbf{S = 13}$$\n  $$[U] = 17 - 13 \\implies \\mathbf{U = 4}$$",
     "- **Ecuación 1 (The Falling Echo)**:\n  $$[U] + [Z] = 9$$\n- **Ecuación 2 (The Rising Echo)**:\n  $$[S] + [U] = 17$$\n"
     "- **Resolución** (encadenada, con $Z = 5$ de la Estación 12):\n  $$[U] = 9 - 5 \\implies \\mathbf{U = 4}$$\n  $$[S] = 17 - 4 \\implies \\mathbf{S = 13}$$"),
])
R('docs/DESERT_ODYSSEY_BIBLE.md', [("$[S] + [U] = 17$ y $[S] - [U] = 9$", "$[U] + [Z] = 9$ y $[S] + [U] = 17$")])
R('docs/GAME_MASTER_GUIDE.md', [("`S+U=17`, `S−U=9` (S16)", "`U+Z=9`, `S+U=17` (S16)")])
R('docs/guide/04_SYSTEMS_AND_DOC_AUDIT.md', [("| cairn4-diff | S − U = 9 | St. 16 | idem | **U=4** | |", "| cairn4-diff | U + Z = 9 | St. 16 | idem | **U=4** | |"),
                                             ("F±T, S±U…)", "F±T…)")])
R('docs/guide/01_FOUNDATIONS_AND_CONSTELLATION.md', [("`S+U=17` + `S−U=9` (Est. 16)", "`U+Z=9` → `S+U=17` (Est. 16)"),
                                                    ("| `cairn4-diff` | `[S]−[U]=9` |", "| `cairn4-diff` | `[U]+[Z]=9` |")])
R('docs/guide/02_DESERT_PATH.md', [
    ("**[S] + [U] = 17**, **[S] − [U] = 9**;", "**[U] + [Z] = 9**, **[S] + [U] = 17**;"),
    ("y **`[S] − [U] = 9`** (\"The Falling Echo\", `cairn4-diff`)", "y **`[U] + [Z] = 9`** (\"The Falling Echo\", `cairn4-diff`)"),
    ("| **S** | 13 | sistema S+U=17, S−U=9 |", "| **S** | 13 | 17 − U(4) |"),
    ("| E16 | `[S] − [U] = 9` (`cairn4-diff`, \"The Falling Echo\") | **U** | 4 | 17 − 13 |", "| E16 | `[U] + [Z] = 9` (`cairn4-diff`, \"The Falling Echo\") | **U** | 4 | 9 − Z(5) |"),
])
print("done")
