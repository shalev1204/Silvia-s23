import math

nodes = [
    (200, 970),
    (400, 890),
    (630, 810),
    (470, 680),
    (280, 540),
    (510, 440),
    (750, 360),
    (580, 230),
    (810, 140),
    (960, 75)
]

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

segments = []
for i in range(n - 1):
    p1 = nodes[i]
    p2 = nodes[i+1]
    D = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    k = D * 0.36
    cp1 = (round(p1[0] + tangents[i][0] * k, 1), round(p1[1] + tangents[i][1] * k, 1))
    cp2 = (round(p2[0] - tangents[i+1][0] * k, 1), round(p2[1] - tangents[i+1][1] * k, 1))
    segments.append((p1, cp1, cp2, p2))

def bezier_point(p1, cp1, cp2, p2, t):
    x = (1-t)**3 * p1[0] + 3*(1-t)**2 * t * cp1[0] + 3*(1-t)*t**2 * cp2[0] + t**3 * p2[0]
    y = (1-t)**3 * p1[1] + 3*(1-t)**2 * t * cp1[1] + 3*(1-t)*t**2 * cp2[1] + t**3 * p2[1]
    return (round(x, 1), round(y, 1))

print("=== SEGMENTS & WAYPOINTS ===")
for i, (p1, cp1, cp2, p2) in enumerate(segments):
    print(f"\n<!-- Seg {i+1} -> {i+2} -->")
    print(f'd="M {p1[0]} {p1[1]} C {cp1[0]} {cp1[1]}, {cp2[0]} {cp2[1]}, {p2[0]} {p2[1]}"')
    dots = [bezier_point(p1, cp1, cp2, p2, t) for t in [0.25, 0.5, 0.75]]
    for dx, dy in dots:
        print(f'<circle cx="{dx}" cy="{dy}" r="1.5" />')

full_d = f"M {nodes[0][0]} {nodes[0][1]} " + " ".join([f"C {cp1[0]} {cp1[1]}, {cp2[0]} {cp2[1]}, {p2[0]} {p2[1]}" for p1, cp1, cp2, p2 in segments[:8]])
print("\n=== FULL EXPEDITION ROAD D ===")
print(full_d)
