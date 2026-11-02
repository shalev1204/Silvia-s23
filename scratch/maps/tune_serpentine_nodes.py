import math

# Target: 9 stations, Y climbing from ~970 to ~140 in a 1120 x 1100 canvas.
# Distances between consecutive points: ~200 to ~230 px (50% more than 135px).
# Smooth S-curve weaving left and right.

nodes = [
    # 1: Origin / Threshold
    (200, 970),
    # 2: Cartographer Arrival
    (380, 890),   # dist 1->2: dx=180, dy=-80 -> 197 px
    # 3: Celestial Flower
    (570, 820),   # dist 2->3: dx=190, dy=-70 -> 202 px
    # 4: Observatory Raid
    (430, 680),   # dist 3->4: dx=-140, dy=-140 -> 198 px
    # 5: Radio Relay
    (290, 540),   # dist 4->5: dx=-140, dy=-140 -> 198 px
    # 6: Celestial Matrix
    (490, 450),   # dist 5->6: dx=200, dy=-90 -> 219 px
    # 7: The Zodiac Engine
    (700, 370),   # dist 6->7: dx=210, dy=-80 -> 225 px
    # 8: The Midnight Calibration
    (560, 240),   # dist 7->8: dx=-140, dy=-130 -> 191 px
    # 9: The Celestial Cipher
    (760, 150),   # dist 8->9: dx=200, dy=-90 -> 219 px
    # Horizon
    (910, 80)     # dist 9->10: dx=150, dy=-70 -> 165 px
]

print("--- DISTANCES BETWEEN CONSECUTIVE STATIONS ---")
for i in range(len(nodes) - 1):
    p1 = nodes[i]
    p2 = nodes[i+1]
    dist = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    print(f"Station {i+1} -> {i+2}: dist = {dist:.1f} px  (dx={p2[0]-p1[0]}, dy={p2[1]-p1[1]})")

