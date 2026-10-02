import re
from playwright.sync_api import sync_playwright

pts = [
    (120, 660),  # 1: Threshold
    (240, 590),  # 2: Cartographer Arrival
    (330, 480),  # 3: Celestial Flower
    (440, 530),  # 4: Observatory Raid
    (560, 420),  # 5: Radio Relay
    (680, 470),  # 6: Celestial Matrix
    (800, 370),  # 7: The Zodiac Engine
    (905, 260),  # 8: The Midnight Calibration
    (995, 150),  # 9: The Celestial Cipher
    (1065, 80)   # 10: Horizon
]

# Compute smooth unit tangents
import math
n = len(pts)
tangents = []
for i in range(n):
    if i == 0:
        tx = pts[1][0] - pts[0][0]
        ty = pts[1][1] - pts[0][1]
    elif i == n - 1:
        tx = pts[n-1][0] - pts[n-2][0]
        ty = pts[n-1][1] - pts[n-2][1]
    else:
        tx = pts[i+1][0] - pts[i-1][0]
        ty = pts[i+1][1] - pts[i-1][1]
    L = math.sqrt(tx*tx + ty*ty)
    tangents.append((tx / L, ty / L))

segments = []
for i in range(n - 1):
    p1 = pts[i]
    p2 = pts[i+1]
    D = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    k = D * 0.36
    cp1 = (round(p1[0] + tangents[i][0] * k, 1), round(p1[1] + tangents[i][1] * k, 1))
    cp2 = (round(p2[0] - tangents[i+1][0] * k, 1), round(p2[1] - tangents[i+1][1] * k, 1))
    segments.append((p1, cp1, cp2, p2))

full_road_d = f"M {pts[0][0]} {pts[0][1]} " + " ".join([f"C {cp1[0]} {cp1[1]}, {cp2[0]} {cp2[1]}, {p2[0]} {p2[1]}" for p1, cp1, cp2, p2 in segments[:8]])

print("Road casing full d:")
print(full_road_d)

for idx, (p1, cp1, cp2, p2) in enumerate(segments):
    print(f"Seg {idx+1}->{idx+2}: d=\"M {p1[0]} {p1[1]} C {cp1[0]} {cp1[1]}, {cp2[0]} {cp2[1]}, {p2[0]} {p2[1]}\"")
