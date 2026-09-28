import subprocess
import os

STEM_DIR = 'assets/constellation/radio-transmission/audio/stems_gemini'
LYRIA_MP3 = 'assets/constellation/radio-transmission/audio/lyria_soundtrack.mp3'
OUT_MP3 = 'web/constellation/radio-transmission/cartographer_raid.mp3'
BACKUP_MP3 = 'assets/constellation/radio-transmission/audio/cartographer_raid.mp3'

# Timing schedule (milliseconds):
# r1: 1000ms  (ends at ~5770ms)
# r2: 6600ms  (ends at ~14210ms)
# r3: 15100ms (ends at ~23070ms)
# r4: 24000ms (ends at ~31690ms)
# r5: 32500ms (ends at ~39230ms)
# r6: 40000ms (ends at ~48330ms)
# r7: 49000ms (ends at ~55250ms)
# r8: 56000ms (ends at ~61450ms)
# Total duration: ~65.0s

filter_complex = '''
[0:a]adelay=1000|1000,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=1.9[v1];
[1:a]adelay=6600|6600,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=1.9[v2];
[2:a]adelay=15100|15100,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=2.0[v3];
[3:a]adelay=24000|24000,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=2.0[v4];
[4:a]adelay=32500|32500,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=1.9[v5];
[5:a]adelay=40000|40000,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=1.9[v6];
[6:a]adelay=49000|49000,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=1.9[v7];
[7:a]adelay=56000|56000,highpass=f=180,lowpass=f=4600,acompressor=threshold=-16dB:ratio=3:attack=10:release=100,volume=1.9[v8];

[8:a]atrim=0:65.0,afade=t=in:ss=0:d=2.5,afade=t=out:st=60.0:d=5.0,volume=0.28[bg_music];

anoisesrc=d=65.0:c=pink:r=44100:a=0.008,highpass=f=280,lowpass=f=4200[static];
sine=f=880:d=0.12,adelay=350|350,volume=0.25[chirp1];
sine=f=1450:d=0.18,adelay=520|520,volume=0.20[chirp2];

sine=f=45:d=6.0,adelay=14800|14800,afade=t=in:ss=0:d=1,afade=t=out:st=4:d=2,volume=0.35[breach_sub];

sine=f=620:d=0.35,adelay=22800|22800,volume=0.15[alarm1];
sine=f=620:d=0.35,adelay=24200|24200,volume=0.12[alarm2];
sine=f=620:d=0.35,adelay=25600|25600,volume=0.10[alarm3];

sine=f=1100:d=0.28,adelay=61800|61800,volume=0.22[rogerbeep];

[v1][v2][v3][v4][v5][v6][v7][v8][bg_music][static][chirp1][chirp2][breach_sub][alarm1][alarm2][alarm3][rogerbeep]amix=inputs=17:duration=longest:dropout_transition=2,atrim=0:65.0,volume=1.5[out]
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
    '-i', LYRIA_MP3,
    '-filter_complex', filter_complex,
    '-map', '[out]',
    '-b:a', '192k',
    OUT_MP3
]

print("Mixing cinematic master with FFmpeg...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg Error:\n", res.stderr)
    exit(1)

# Also copy to asset backup
subprocess.run(['cp', OUT_MP3, BACKUP_MP3], check=True)
size = os.path.getsize(OUT_MP3)
print(f"Master created successfully: {OUT_MP3} ({size} bytes)")
