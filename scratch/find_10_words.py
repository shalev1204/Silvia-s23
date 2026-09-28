import sys
import time

WORDS = [
    'SOLSTICE', 'ECLIPTIC', 'MERIDIAN', 'ALIDADE', 'POLARIS',
    'ZENITH', 'EQUINOX', 'HORIZON', 'AZIMUTH', 'ASTROLABE',
    'APOGEE', 'NADIR', 'ZODIAC', 'SEXTANT', 'QUADRANT',
    'SIRIUS', 'CELESTIAL', 'EPICYCLE', 'ORION', 'NEBULA', 'COLURE', 'PERIGEE'
]

# We want 5 Across and 5 Down words.
# We can start with a seed of 2-3 words and add words one by one that intersect an existing word.
def solve():
    t0 = time.time()
    
    # Let's search by placing words:
    # State: list of placed words: (word, r, c, dir) where dir is 'A' or 'D'
    # and grid: dict (r, c) -> char
    
    # We want 5 Across and 5 Down, total 10 words.
    # Check validity:
    # 1. No conflicting characters
    # 2. No adjacent parallel words (i.e. cells immediately before and after a word must be empty)
    # 3. For every cell (r, c) in the grid, the contiguous horizontal run of cells containing (r, c)
    #    must be length 1 OR exactly match an Across word placed there.
    #    Similarly for vertical runs.
    
    def is_valid_grid(placed):
        grid = {}
        for w, r, c, d in placed:
            for i, ch in enumerate(w):
                rr = r if d == 'A' else r + i
                cc = c + i if d == 'A' else c
                if (rr, cc) in grid and grid[(rr, cc)] != ch:
                    return False
                grid[(rr, cc)] = ch
        
        # Check no cell before or after word
        for w, r, c, d in placed:
            if d == 'A':
                if (r, c - 1) in grid or (r, c + len(w)) in grid:
                    return False
            else:
                if (r - 1, c) in grid or (r + len(w), c) in grid:
                    return False
                    
        # Check all runs of length >= 2 in grid match a placed word
        # Horizontal runs:
        rows = set(r for r, c in grid.keys())
        cols = set(c for r, c in grid.keys())
        min_r, max_r = min(rows), max(rows)
        min_c, max_c = min(cols), max(cols)
        
        if max_r - min_r > 13 or max_c - min_c > 13:
            return False
            
        across_words = {(r, c): w for w, r, c, d in placed if d == 'A'}
        down_words = {(r, c): w for w, r, c, d in placed if d == 'D'}
        
        for r in range(min_r, max_r + 1):
            c = min_c
            while c <= max_c:
                if (r, c) in grid:
                    c_start = c
                    run = []
                    while c <= max_c and (r, c) in grid:
                        run.append(grid[(r, c)])
                        c += 1
                    if len(run) > 1:
                        word_str = ''.join(run)
                        if (r, c_start) not in across_words or across_words[(r, c_start)] != word_str:
                            return False
                else:
                    c += 1
                    
        for c in range(min_c, max_c + 1):
            r = min_r
            while r <= max_r:
                if (r, c) in grid:
                    r_start = r
                    run = []
                    while r <= max_r and (r, c) in grid:
                        run.append(grid[(r, c)])
                        r += 1
                    if len(run) > 1:
                        word_str = ''.join(run)
                        if (r_start, c) not in down_words or down_words[(r_start, c)] != word_str:
                            return False
                else:
                    r += 1
        return True

    # Backtracking search:
    # Alternate adding Across and Down, or add Down to intersect Across
    # Target: 5 Across, 5 Down
    
    # Priority words that fit Renaissance astronomy:
    core_across = ['SOLSTICE', 'ECLIPTIC', 'ZENITH', 'HORIZON', 'ASTROLABE', 'AZIMUTH', 'EQUINOX', 'APOGEE', 'ZODIAC', 'QUADRANT']
    core_down = ['MERIDIAN', 'ALIDADE', 'POLARIS', 'CELESTIAL', 'EPICYCLE', 'SIRIUS', 'SEXTANT', 'NADIR', 'COLURE', 'ORION']

    # Let's fix first Across word at (0, 0)
    for first_w in ['SOLSTICE', 'ECLIPTIC', 'ASTROLABE']:
        placed = [(first_w, 0, 0, 'A')]
        
        def dfs(num_a, num_d, used_words):
            if time.time() - t0 > 5.0:
                return None
            if num_a == 5 and num_d == 5:
                return list(placed)
                
            # If we need a Down word (num_d < num_a or num_d < 5):
            if num_d < 5 and (num_d < num_a or num_a == 5):
                # Try to intersect an existing Across word
                # Pick an existing Across word
                for aw, ar, ac, ad in [p for p in placed if p[3] == 'A']:
                    for dw in core_down:
                        if dw in used_words:
                            continue
                        for i_a, ch_a in enumerate(aw):
                            for i_d, ch_d in enumerate(dw):
                                if ch_a == ch_d:
                                    # candidate down word placement
                                    cand = (dw, ar - i_d, ac + i_a, 'D')
                                    placed.append(cand)
                                    if is_valid_grid(placed):
                                        res = dfs(num_a, num_d + 1, used_words | {dw})
                                        if res: return res
                                    placed.pop()
            else:
                # Need an Across word
                for dw, dr, dc, dd in [p for p in placed if p[3] == 'D']:
                    for aw in core_across:
                        if aw in used_words:
                            continue
                        for i_d, ch_d in enumerate(dw):
                            for i_a, ch_a in enumerate(aw):
                                if ch_d == ch_a:
                                    cand = (aw, dr + i_d, dc - i_a, 'A')
                                    placed.append(cand)
                                    if is_valid_grid(placed):
                                        res = dfs(num_a + 1, num_d, used_words | {aw})
                                        if res: return res
                                    placed.pop()
            return None

        sol = dfs(1, 0, {first_w})
        if sol:
            print("FOUND SOLUTION in", round(time.time() - t0, 2), "s:")
            for p in sol:
                print(p)
            return sol

    print("No solution found within limits.")
    return None

if __name__ == '__main__':
    solve()
