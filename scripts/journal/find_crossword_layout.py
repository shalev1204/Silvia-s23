words = [
    'SOLSTICE', 'ECLIPTIC', 'ZENITH', 'HORIZON', 'ALIDADE',
    'ALTAIR', 'POLARIS', 'ORION', 'DRACO', 'EQUINOX',
    'MERIDIAN', 'AURORA', 'OCTANT', 'SEXTANT', 'ASTROLABE'
]

# Let's write an exact generator for a compact grid (e.g. 10x10)
# Let's test placing word 1 Across, then matching Down words, then matching Across words
def search():
    for w1 in ['ASTROLABE', 'MERIDIAN', 'SOLSTICE', 'HORIZON', 'ECLIPTIC']:
        # Place w1 Across at row r1, col c1
        r1, c1 = 3, 1
        # Try down words intersecting w1
        for i1, ch1 in enumerate(w1):
            col_d1 = c1 + i1
            for wd1 in words:
                if wd1 == w1: continue
                # find occurences of ch1 in wd1
                for id1, ch_d in enumerate(wd1):
                    if ch_d == ch1:
                        # wd1 starts at row r1 - id1
                        row_start_d1 = r1 - id1
                        if row_start_d1 >= 0 and row_start_d1 + len(wd1) <= 10:
                            # Found valid down word
                            pass

# Let's test a known classic layout:
# ACROSS:
# 1. SOLSTICE (8)
# 4. ZENITH (6)
# 6. ORION (5)
# 7. POLARIS (7)
# DOWN:
# 1. SEXTANT (7)
# 2. ECLIPTIC (8)
# 3. ALTAIR (6)
# 5. HORIZON (7)

# Let's check:
# 1 Across: S O L S T I C E  at (1, 1..8)
# 1 Down:   S E X T A N T    at (1..7, 1) -> intersects at (1, 1) 'S'
# 2 Down:   E C L I P T I C  at (1..8, 7) -> intersects at (1, 7) 'C' (S-O-L-S-T-I-[C]-E)
# Let's verify: In SOLSTICE, index 0 is 'S', index 6 is 'C' (col 1+6 = 7). Intersects ECLIPTIC index 0 'E' -> WAIT!
# SOLSTICE has 'C' at index 6. ECLIPTIC starts with 'E'! They don't match!
# In ECLIPTIC, index 1 is 'C'! So ECLIPTIC starts at row 0: E(r0), C(r1), L(r2), I(r3), P(r4), T(r5), I(r6), C(r7)!
# Then at (1, 7) both have 'C'! PERFECT MATCH!

print("Testing intersection:")
# SOLSTICE at row 1, cols 1..8: S(1,1), O(1,2), L(1,3), S(1,4), T(1,5), I(1,6), C(1,7), E(1,8)
# ECLIPTIC at col 7, rows 0..7: E(0,7), C(1,7), L(2,7), I(3,7), P(4,7), T(5,7), I(6,7), C(7,7)
# Match at (1,7) is 'C'!
# Now at (3,7) is 'I':
# Can an Across word intersect at (3,7) with 'I'?
# ALIDADE has 'I' at index 2: A L I D A D E -> cols 5..11: A(3,5), L(3,6), I(3,7), D(3,8), A(3,9), D(3,10), E(3,11)!
# SEXTANT at col 1, rows 1..7: S(1,1), E(2,1), X(3,1), T(4,1), A(5,1), N(6,1), T(7,1)
# At (5,1) is 'A':
# ALTAIR Across at (5, 1..6): A(5,1), L(5,2), T(5,3), A(5,4), I(5,5), R(5,6)!
# At (5,5) is 'I':
# ORION Down at col 5, rows 3..7: O(3,5), R(4,5), I(5,5), O(6,5), N(7,5)!
# WAIT! At (3,5): ALIDADE has 'A' at index 0! ORION has 'O' at index 0! A vs O conflict at (3,5).

