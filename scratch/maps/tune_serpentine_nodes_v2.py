import math

nodes = [
    # 1: Origin / Threshold
    (200, 970),
    # 2: Cartographer Arrival
    (400, 890),   # dx=200, dy=-80 -> 215.4 px
    # 3: Celestial Flower
    (630, 810),   # dx=230, dy=-80 -> 243.5 px
    # 4: Observatory Raid
    (470, 680),   # dx=-160, dy=-130 -> 206.2 px
    # 5: Radio Relay
    (280, 540),   # dx=-190, dy=-140 -> 236.0 px
    # 6: Celestial Matrix
    (510, 440),   # dx=230, dy=-100 -> 250.8 px
    # 7: The Zodiac Engine
    (750, 360),   # dx=240, dy=-80 -> 252.9 px
    # 8: The Midnight Calibration
    (580, 230),   # dx=-170, dy=-130 -> 214.0 px
    # 9: The Celestial Cipher
    (810, 140),   # dx=230, dy=-90 -> 247.0 px
    # Horizon
    (960, 75)     # dx=150, dy=-65 -> 163.5 px
]

print("--- DISTANCES ---")
for i in range(len(nodes) - 1):
    p1 = nodes[i]
    p2 = nodes[i+1]
    dist = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    print(f"Station {i+1} -> {i+2}: dist = {dist:.1f} px  (dx={p2[0]-p1[0]}, dy={p2[1]-p1[1]})")

