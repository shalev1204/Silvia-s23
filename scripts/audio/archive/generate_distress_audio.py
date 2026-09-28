import subprocess
import os

os.makedirs('assets/audio/stems', exist_ok=True)

# 1. Generate Voice Stems for Cartographer (Daniel, urgent/altered)
cartographer_lines = [
    ('c1', 'Silvia! Silvia, can you hear me? The signal is breaking apart...'),
    ('c2', 'You did it. The Celestial Flower awakened. You aligned the stars, you proved yourself...'),
    ('c3', '...but they saw it! The bloom was too bright. They traced the frequency back to the observatory!'),
    ('c4', 'They are inside the perimeter! They breached the lower vault!'),
    ('c5', 'Listen to me! If they take me, the Constellation Path does not end. You have to find where they—'),
    ('c6', 'No! They found the relay room!'),
    ('c7', 'Silvia, remember the root! Albireo... look into the—')
]

for tag, text in cartographer_lines:
    out = f'assets/audio/stems/{tag}.aiff'
    subprocess.run(['say', '-v', 'Daniel', '-r', '175', '-o', out, text], check=True)

# 2. Generate Hostile Distant Voices (Fred & Ralph, muffled down the hall)
hostile_lines = [
    ('h1', 'Down the hall! Check the sub-levels!'),
    ('h2', 'Breach the door! Cut the frequency now!')
]

for tag, text in hostile_lines:
    out = f'assets/audio/stems/{tag}.aiff'
    subprocess.run(['say', '-v', 'Fred', '-r', '180', '-o', out, text], check=True)

print("All voice stems generated successfully.")
