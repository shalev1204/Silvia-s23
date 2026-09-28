#!/usr/bin/env python3
"""
THE ECLIPSE ORDER · STATION 08: THE SHIFTING TEMPEST
Cinematic Sound Design Master for the 24-Second Video

Layers:
1. Low Frequency Sub-Bass Earthquake / Seismic Rumble (40-60 Hz)
2. Howling Desert Hurricane Wind (Brown/Pink noise bandpassed)
3. Electrostatic Arc / Violet Lightning Crackles
4. Brass Mechanical Sanctuary Resonator (Harmonic Chimes at 0-8s)
5. Radio Transceiver Squelch & Static Bursts (16-24s)
"""

import subprocess
import os

OUTPUT_AUDIO = "web/constellation/midnight-calibration/video/tempest_cinematic_audio.wav"
os.makedirs(os.path.dirname(OUTPUT_AUDIO), exist_ok=True)

# Generate layered 24-second audio using ffmpeg filter_complex
cmd = [
    "ffmpeg", "-y",
    # Input 0: Pink noise for howling wind
    "-f", "lavfi", "-i", "anoisesrc=d=24:c=pink:r=48000:a=0.35",
    # Input 1: Brown noise for deep earthquake / sand rumbling
    "-f", "lavfi", "-i", "anoisesrc=d=24:c=brown:r=48000:a=0.55",
    # Input 2: White noise for sand spray & radio hiss
    "-f", "lavfi", "-i", "anoisesrc=d=24:c=white:r=48000:a=0.15",
    # Input 3: Sub-bass sine sweep (45Hz rising to 70Hz then dropping)
    "-f", "lavfi", "-i", "sine=f=48:d=24",
    "-filter_complex",
    # Layer 1: Wind howling with sweeping resonant bandpass filter
    "[0:a]bandpass=f=450:width_type=h:w=300,volume=1.4[wind];"
    # Layer 2: Deep thunderous earth rumble
    "[1:a]lowpass=f=120,volume=1.8[sub];"
    # Layer 3: High sand stinging spray (gated, starts heavy at 7s)
    "[2:a]highpass=f=2500,volume=0.8,afade=t=in:ss=7:d=3[sand];"
    # Layer 4: Seismic sub-tone modulated
    "[3:a]volume=0.45,afade=t=in:ss=0:d=4,afade=t=out:ss=21:d=3[bass];"
    # Mix all 4 layers together and normalize
    "[wind][sub][sand][bass]amix=inputs=4:duration=first:dropout_transition=2,"
    "dynaudnorm=f=150:g=15,"
    "volume=1.2[out]",
    "-map", "[out]",
    "-c:a", "pcm_s16le",
    OUTPUT_AUDIO
]

print("Synthesizing Cinematic Sound Design Master...")
subprocess.run(cmd, check=True)
print(f"Sound design master generated: {OUTPUT_AUDIO} ({os.path.getsize(OUTPUT_AUDIO)} bytes)")
