import random

words = [
    'POLARIS', 'CASSIOPEIA', 'ALTAIR', 'VEGA', 'ORION',
    'ZENITH', 'ALIDADE', 'NADIR', 'SYZYGY', 'ECLIPSE'
]
hidden_msg = "THESKYREMEMBERSWHATTHEEARTHFORGETS" # 34 letters

def solve_grid(rows=12, cols=12):
    dirs = [(0, 1), (1, 0), (1, 1), (0, -1), (-1, 0), (1, -1)]
    for seed in range(1000):
        random.seed(seed)
        grid = [['' for _ in range(cols)] for _ in range(rows)]
        is_word = [[False for _ in range(cols)] for _ in range(rows)]
        success = True
        
        # Sort words descending
        for w in sorted(words, key=len, reverse=True):
            valid_pos = []
            for dr, dc in dirs:
                for r in range(rows):
                    for c in range(cols):
                        er = r + dr * (len(w) - 1)
                        ec = c + dc * (len(w) - 1)
                        if 0 <= er < rows and 0 <= ec < cols:
                            ok = True
                            for i, ch in enumerate(w):
                                gr, gc = r + dr * i, c + dc * i
                                if grid[gr][gc] != '' and grid[gr][gc] != ch:
                                    ok = False
                                    break
                            if ok:
                                valid_pos.append((r, c, dr, dc))
            if not valid_pos:
                success = False
                break
            # Pick random valid pos
            r, c, dr, dc = random.choice(valid_pos)
            for i, ch in enumerate(w):
                grid[r + dr * i][c + dc * i] = ch
                is_word[r + dr * i][c + dc * i] = True
                
        if success:
            empty = [(r, c) for r in range(rows) for c in range(cols) if not is_word[r][c]]
            if len(empty) >= len(hidden_msg):
                print(f"Found solution at seed {seed}! Empty cells: {len(empty)}")
                return seed, grid, is_word, empty
    return None

res = solve_grid()
assert res is not None
seed, grid, is_w, empty = res
print("Seed:", seed)
