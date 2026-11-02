import math

# Target: 9 stations + 1 horizon end
# Width = 1120, Height = 1100
# Distances between consecutive points: ~200 - 230 px
# Smooth ascending S-curves, well-distributed across X (180 to 940) and Y (980 to 140)

# Let's propose candidate node positions:
nodes = [
    # Node 1: Valley Foothills / The Threshold (Bottom Center-Left)
    (240, 980),
    
    # Node 2: Cartographer Arrival (Sweeping right across the lower valley)
    (430, 900),
    
    # Node 3: Celestial Flower (Curving upwards and right into the pine slopes)
    (630, 840),
    
    # Node 4: Observatory Raid (Winding up and back towards center-left across the chasm)
    (480, 710),
    
    # Node 5: Radio Relay (Climbing the central rock needle pinnacle)
    (340, 570),
    
    # Node 6: Celestial Matrix (Sweeping gracefully right into the Sunken Planisphere arena)
    (540, 470),
    
    # Node 7: The Zodiac Engine (Climbing right to the sandstone mesa outpost)
    (740, 390),
    
    # Node 8: The Midnight Calibration (Curving upwards and back towards center for Tempest Mesa)
    (590, 260),
    
    # Node 9: The Celestial Cipher (Ascending towards upper right to the Desert Gateway)
    (780, 160),
    
    # Horizon Trail: Trails off into the starry sky
    (910, 90)
]

print("--- DISTANCES BETWEEN CONSECUTIVE STATIONS ---")
for i in range(len(nodes) - 1):
    p1 = nodes[i]
    p2 = nodes[i+1]
    dist = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    print(f"Station {i+1} -> {i+2}: dist = {dist:.1f} px  (dx={p2[0]-p1[0]}, dy={p2[1]-p1[1]})")

# Calculate smooth unit tangents for Catmull-Rom style cubic beziers
n = len(nodes)
tangents = []
for i in range(n):
    if i == 0:
        tx = nodes[1][0] - nodes[0][0]
        ty = nodes[1][1] - nodes[0][1]
    elif i == n - 1:
        tx = nodes[n-1][0] - nodes[n-2][0]
        ty = nodes[n-1][1] - nodes[n-2][1]
    else:
        tx = nodes[i+1][0] - nodes[i-1][0]
        ty = nodes[i+1][1] - nodes[i-1][1]
    L = math.sqrt(tx*tx + ty*ty)
    tangents.append((tx / L, ty / L))

print("\n--- SMOOTH BEZIER SEGMENTS ---")
segments = []
for i in range(n - 1):
    p1 = nodes[i]
    p2 = nodes[i+1]
    D = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    k = D * 0.38
    cp1 = (round(p1[0] + tangents[i][0] * k, 1), round(p1[1] + tangents[i][1] * k, 1))
    cp2 = (round(p2[0] - tangents[i+1][0] * k, 1), round(p2[1] - tangents[i+1][1] * k, 1))
    segments.append((p1, cp1, cp2, p2))
    print(f"Seg {i+1}->{i+2}: M {p1[0]} {p1[1]} C {cp1[0]} {cp1[1]}, {cp2[0]} {cp2[1]}, {p2[0]} {p2[1]}")

