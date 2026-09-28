words = [
    'SOLSTICE', 'ECLIPTIC', 'ZENITH', 'HORIZON', 'ALIDADE',
    'ALTAIR', 'POLARIS', 'ORION', 'DRACO', 'EQUINOX',
    'MERIDIAN', 'AURORA', 'OCTANT', 'SEXTANT', 'ASTROLABE', 'CASSIOPEIA'
]

# We want 6 to 8 words placed on an 11x11 grid with clean spacing
def generate_crossword():
    import itertools
    
    # Let's search over combinations of 3 Across words and 3 Down words
    for ac_words in itertools.permutations(words, 3):
        w_a1, w_a2, w_a3 = ac_words
        # Try rows
        for r1 in range(1, 4):
            for r2 in range(r1 + 2, 7):
                for r3 in range(r2 + 2, 10):
                    for c1 in range(1, 10 - len(w_a1) + 1):
                        for c2 in range(1, 10 - len(w_a2) + 1):
                            for c3 in range(1, 10 - len(w_a3) + 1):
                                # Build across grid
                                g = {}
                                for i, ch in enumerate(w_a1): g[(r1, c1 + i)] = ch
                                for i, ch in enumerate(w_a2): g[(r2, c2 + i)] = ch
                                for i, ch in enumerate(w_a3): g[(r3, c3 + i)] = ch
                                
                                # Now find Down words that intersect at least 2 of the Across words
                                down_matches = []
                                for wd in words:
                                    if wd in ac_words: continue
                                    # try placing wd at each col
                                    for cd in range(1, 11):
                                        for rd in range(0, 11 - len(wd)):
                                            # check if intersects g
                                            intersects = 0
                                            conflict = False
                                            for idx, ch in enumerate(wd):
                                                pos = (rd + idx, cd)
                                                if pos in g:
                                                    if g[pos] == ch:
                                                        intersects += 1
                                                    else:
                                                        conflict = True
                                                        break
                                            if not conflict and intersects >= 2:
                                                down_matches.append((wd, rd, cd, intersects))
                                if len(down_matches) >= 3:
                                    # Check if down matches don't collide with each other
                                    # Pick 3 non-adjacent down words
                                    for d_comb in itertools.combinations(down_matches, 3):
                                        d1, d2, d3 = d_comb
                                        cols = [d1[2], d2[2], d3[2]]
                                        names = [d1[0], d2[0], d3[0]]
                                        if len(set(cols)) == 3 and len(set(names)) == 3:
                                            # Check spacing between cols >= 2
                                            cols_sorted = sorted(cols)
                                            if cols_sorted[1] - cols_sorted[0] >= 2 and cols_sorted[2] - cols_sorted[1] >= 2:
                                                print("FOUND PERFECT CROSSWORD!")
                                                print(f"Across: {w_a1} at ({r1}, {c1}), {w_a2} at ({r2}, {c2}), {w_a3} at ({r3}, {c3})")
                                                print(f"Down: {d1[0]} at ({d1[1]}, {d1[2]}), {d2[0]} at ({d2[1]}, {d2[2]}), {d3[0]} at ({d3[1]}, {d3[2]})")
                                                return (w_a1, r1, c1), (w_a2, r2, c2), (w_a3, r3, c3), d1, d2, d3
    return None

res = generate_crossword()
