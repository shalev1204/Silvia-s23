"""Station 18: where can a hidden find lie in the burning atrium? For every flagstone: the first turn Hermes can stand on it
alive, and the shortest crossing that passes over it and still reaches the hatch before the Servant's breath runs out.
The rules are those of s18-polybius-stele.js (takeTurn). Usage: python3 finds_solver.py [x,y ...] (to check chosen cells)"""
import sys
from collections import deque
MAP = ['..fffffHf', 'Lff#.ffff', 'Lf#.ff#ff', 'Lff#fffff', 'Lfff#ffff', '..fff.ff.', '.f#fff#.f', '.f.ff....', '.ff.Sffff']
START, HATCH, BURN, BREATH = (4, 8), (7, 0), 3, 15
W, H = 9, 9
cell = lambda x, y: MAP[y][x] if 0 <= x < W and 0 <= y < H else None
ig, q = {}, deque()
for y in range(H):
    for x in range(W):
        if cell(x, y) == 'L': ig[(x, y)] = 0; q.append((x, y))
while q:
    x, y = q.popleft()
    for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0)):
        n = (x + dx, y + dy)
        if cell(*n) == 'f' and n not in ig: ig[n] = ig[(x, y)] + 1; q.append(n)
def burning(p, t):
    c = cell(*p)
    if c == 'L': return True
    if c != 'f': return False
    return p in ig and ig[p] <= t < ig[p] + BURN
def steps(p, t):
    """the turns Hermes can take from (p, t) and stay alive: (next cell, next turn)"""
    for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0), (0, 0)):
        n = (p[0] + dx, p[1] + dy); c = cell(*n)
        if (dx or dy) and (c is None or c in '#L' or (burning(n, t) and burning(n, t + 1))): continue
        if n == HATCH: yield n, t + 1; continue
        if burning(n, t + 1) or t + 1 >= BREATH: continue
        yield n, t + 1
def search(start, t0, goal):
    """shortest way from (start, t0) to goal: (arrival turn, moves) or None"""
    seen = {(start, t0): None}; dq = deque([(start, t0)])
    while dq:
        p, t = dq.popleft()
        if p == goal:
            path, k = [], (p, t)
            while seen[k] is not None: prev = seen[k]; path.append((k[0][0] - prev[0][0], k[0][1] - prev[0][1])); k = prev
            return t, path[::-1]
        if p == HATCH: continue
        for n, nt in steps(p, t):
            if (n, nt) not in seen: seen[(n, nt)] = (p, t); dq.append((n, nt))
    return None
if __name__ == '__main__':
    best = search(START, 0, HATCH)
    print('shortest crossing:', best[0], 'turns')
    chosen = [tuple(int(v) for v in a.split(',')) for a in sys.argv[1:]]
    for y in range(H):
        row = ''
        for x in range(W):
            c = cell(x, y); p = (x, y)
            if c in '#L' or p in (START, HATCH): row += f' {c * 5} '; continue
            a = search(START, 0, p)
            if not a: row += '   ·   '; continue
            b = search(p, a[0], HATCH)
            row += f' {a[0]:>2}>{b[0] if b else "x":<2} '
        print(row)
    print('(each flagstone: first turn he can stand on it + the turn he then reaches the hatch; x = no way on to the hatch in time)')
    for p in chosen:
        a = search(START, 0, p); b = search(p, a[0], HATCH) if a else None
        print(p, cell(*p), 'reach', a and a[0], 'then hatch', b and b[0], 'moves', a and a[1] + (b[1] if b else []))
    if len(chosen) > 1:
        # every find in one crossing?
        from itertools import permutations
        ok = None
        for order in permutations(chosen):
            p, t, moves, good = START, 0, [], True
            for g in list(order) + [HATCH]:
                r = search(p, t, g)
                if not r: good = False; break
                t, m = r; moves += m; p = g
            if good and (ok is None or t < ok[0]): ok = (t, order, moves)
        print('all in one crossing (greedy legs):', ok)

def best_with(finds):
    """exact: the shortest crossing that picks up every find in `finds` on its way (state = cell, turn, what he holds)"""
    full = (1 << len(finds)) - 1
    start = (START, 0, 0); seen = {start: None}; dq = deque([start])
    while dq:
        p, t, m = dq.popleft()
        if p == HATCH:
            if m == full:
                path, k = [], (p, t, m)
                while seen[k] is not None: prev = seen[k]; path.append((k[0][0] - prev[0][0], k[0][1] - prev[0][1])); k = prev
                return t, path[::-1]
            continue
        for n, nt in steps(p, t):
            nm = m | (1 << finds.index(n)) if n in finds else m
            if (n, nt, nm) not in seen: seen[(n, nt, nm)] = (p, t, m); dq.append((n, nt, nm))
    return None
def on_every_shortest(p):
    """is this flagstone on every shortest crossing?"""
    best = search(START, 0, HATCH)[0]
    # count shortest crossings that avoid p
    seen = {(START, 0)}; dq = deque([(START, 0)])
    while dq:
        q, t = dq.popleft()
        if q == HATCH: return False if t == best else True
        for n, nt in steps(q, t):
            if n != p and nt <= best and (n, nt) not in seen: seen.add((n, nt)); dq.append((n, nt))
    return True
