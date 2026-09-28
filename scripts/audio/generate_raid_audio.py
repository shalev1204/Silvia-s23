import subprocess
import os

STEM_DIR = 'assets/constellation/radio-transmission/audio/stems_raid'
os.makedirs(STEM_DIR, exist_ok=True)

lines = [
    ('r1', 'Silvia! Silvia, can you hear me? The channel is barely holding together...'),
    ('r2', 'You did it. The Celestial Flower awakened. You aligned the stars, you proved yourself...'),
    ('r3', '...but the celestial flare was too bright. It gave away my sanctuary. They breached the observatory.'),
    ('r4', 'I survived... but they broke into the central chamber. They stole the Astrolabe of Distant Light.'),
    ('r5', 'Without it, the final coordinates cannot be charted. And if they decipher it first, the Order falls.'),
    ('r6', 'Listen to me: We are going to take it back. You and I. I have encoded the recovery protocols into a physical journal.'),
    ('r7', 'The journal is already traveling to you in Italy. When it finds your hands, open page one.'),
    ('r8', 'Keep watch on the deep sky, Silvia. The hunt begins now.')
]

for tag, text in lines:
    out = f'{STEM_DIR}/{tag}.aiff'
    subprocess.run(['say', '-v', 'Daniel', '-r', '172', '-o', out, text], check=True)

print("Raid voice stems generated successfully.")
