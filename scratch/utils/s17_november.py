"""One-off: the Wire runs in real time, so Hermes's October becomes November (Operator's choice, 18 Nov 2026). Run from the repo root."""
def R(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:60], s.count(a))
        s = s.replace(a, b)
    open(p, 'w').write(s)

R('web/hub/js/wire-script-bridge.js', [
    ("for the longest day of the year. It is October, Silvia.'", "for the longest day of the year. It is November, Silvia.'"),
    ("we can aim them for October.'", "we can aim them for November.'"),
    ("// ---- 21 · Dusk at Cairn IV: the midsummer line, and an October sun ----", "// ---- 21 · Dusk at Cairn IV: the midsummer line, and a November sun ----"),
])
R('web/hub/js/hub-core.js', [
    ("for the longest day of the year. We are in October.", "for the longest day of the year. We are in November."),
    ('we can aim them for October."', 'we can aim them for November."'),
    ("mirrors for an October dawn and the brass ring", "mirrors for a November dawn and the brass ring"),
    ('title: "How do I aim the mirrors for an October dawn?"', 'title: "How do I aim the mirrors for a November dawn?"'),
    ('of Sheet 16B: Hermes arrives in October.', 'of Sheet 16B: Hermes arrives in November.'),
    ('// dusk at Cairn IV: the October sun', '// dusk at Cairn IV: the November sun'),
])
R('web/hub/js/stations/s17-solstice-arch.js', [
    ('"How do I aim the mirrors for an October dawn?"', '"How do I aim the mirrors for a November dawn?"'),
    ('On the fourth ray of an October dawn', 'On the fourth ray of a November dawn'),
    ('In October the sun rises further south', 'In November the sun rises further south'),
    ('// Part II (web only), The Autumn Dawn: in October', '// Part II (web only), The Autumn Dawn: in November'),
    ('each step of the October dawn', 'each step of the November dawn'),
    ('where the October rays come in', 'where the November rays come in'),
])
R('web/hub/js/field-journal.js', [("An October sun in a courtyard built for June", "A November sun in a courtyard built for June")])
R('web/index.html', [
    ('<summary>The Courtyard in October</summary>', '<summary>The Courtyard in November</summary>'),
    ('In October the sun rises further south, and its ray', 'In November the sun rises further south, and its ray'),
    ('in October the ray misses the altar', 'in November the ray misses the altar'),
])
print("done")

