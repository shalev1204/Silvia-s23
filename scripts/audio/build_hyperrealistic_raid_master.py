import subprocess
import os

STEM_DIR = 'assets/constellation/radio-transmission/audio/stems_pro_achernar'
PURSUER_DIR = 'assets/constellation/radio-transmission/audio/pursuers'
FOOTSTEPS = 'assets/constellation/radio-transmission/audio/footsteps_running.wav'
BREATHING = 'assets/constellation/radio-transmission/audio/breathing_running.wav'
IMPACTS = 'assets/constellation/radio-transmission/audio/violent_impacts.wav'

OUT_MP3 = 'web/constellation/radio-transmission/cartographer_raid.mp3'
BACKUP_MP3 = 'assets/constellation/radio-transmission/audio/cartographer_raid.mp3'

# Master Timeline (total duration ~77.0s):
# r1: 1000ms   (ends ~7170ms)
# r2: 8200ms   (ends ~16610ms)
# pursuer1: 16800ms
# r3: 18000ms  (ends ~26770ms)
# pursuer2: 27000ms
# r4: 28200ms  (ends ~35570ms)
# r5: 36600ms  (ends ~45810ms)
# pursuer3: 46000ms
# r6: 47200ms  (ends ~58290ms)
# r7: 59200ms  (ends ~66450ms)
# pursuer4: 66800ms
# r8: 68000ms  (ends ~75370ms)
# Roger beep: 75700ms
# Total audio length: 77.0s

# Voice filtering: realistic tactical transceiver with presence and body
v_filter = 'highpass=f=200,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3.5:attack=5:release=80,volume=2.2'

filter_complex = f'''
[0:a]adelay=1000|1000,{v_filter}[v1];
[1:a]adelay=8200|8200,{v_filter}[v2];
[2:a]adelay=18000|18000,{v_filter}[v3];
[3:a]adelay=28200|28200,{v_filter}[v4];
[4:a]adelay=36600|36600,{v_filter}[v5];
[5:a]adelay=47200|47200,{v_filter}[v6];
[6:a]adelay=59200|59200,{v_filter}[v7];
[7:a]adelay=68000|68000,{v_filter}[v8];

[8:a]atrim=0:77.0,volume=0.68,highpass=f=120,lowpass=f=4000[fx_footsteps];
[9:a]atrim=0:77.0,volume=0.55,highpass=f=180,lowpass=f=3800[fx_breathing];
[10:a]atrim=0:77.0,volume=0.85[fx_impacts];

[11:a]adelay=16800|16800,volume=0.52[p1];
[12:a]adelay=27000|27000,volume=0.50[p2];
[13:a]adelay=46000|46000,volume=0.48[p3];
[14:a]adelay=66800|66800,volume=0.52[p4];

anoisesrc=d=77.0:c=pink:r=44100:a=0.007,highpass=f=280,lowpass=f=4200[static];
sine=f=880:d=0.10,adelay=350|350,volume=0.25[chirp1];
sine=f=1450:d=0.14,adelay=490|490,volume=0.20[chirp2];
sine=f=1050:d=0.25,adelay=75700|75700,volume=0.22[rogerbeep];

[v1][v2][v3][v4][v5][v6][v7][v8][fx_footsteps][fx_breathing][fx_impacts][p1][p2][p3][p4][static][chirp1][chirp2][rogerbeep]amix=inputs=19:duration=longest:dropout_transition=1,atrim=0:77.0,volume=1.7[out]
'''

cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-i', f'{STEM_DIR}/r1.wav',
    '-i', f'{STEM_DIR}/r2.wav',
    '-i', f'{STEM_DIR}/r3.wav',
    '-i', f'{STEM_DIR}/r4.wav',
    '-i', f'{STEM_DIR}/r5.wav',
    '-i', f'{STEM_DIR}/r6.wav',
    '-i', f'{STEM_DIR}/r7.wav',
    '-i', f'{STEM_DIR}/r8.wav',
    '-i', FOOTSTEPS,
    '-i', BREATHING,
    '-i', IMPACTS,
    '-i', f'{PURSUER_DIR}/pursuer1.wav',
    '-i', f'{PURSUER_DIR}/pursuer2.wav',
    '-i', f'{PURSUER_DIR}/pursuer3.wav',
    '-i', f'{PURSUER_DIR}/pursuer4.wav',
    '-filter_complex', filter_complex,
    '-map', '[out]',
    '-b:a', '192k',
    OUT_MP3
]

print("Mixing 19-track hyper-realistic audio master (NO MUSIC, pure Foley & visceral action)...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg Error:\n", res.stderr)
    exit(1)

# Backup copy
subprocess.run(['cp', OUT_MP3, BACKUP_MP3], check=True)
size = os.path.getsize(OUT_MP3)
print(f"Master created: {OUT_MP3} ({size} bytes)")
