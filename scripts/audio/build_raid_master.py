import subprocess
import os

AUDIO_DIR = 'assets/constellation/radio-transmission/audio'
processed_mp3 = f'{AUDIO_DIR}/cartographer_raid.mp3'

# Delay calculations:
# r1: 0.8s (ends at ~5.5s)
# r2: 6.2s (ends at ~11.8s)
# r3: 12.5s (ends at ~18.8s)
# r4: 19.5s (ends at ~25.0s)
# r5: 25.8s (ends at ~32.0s)
# r6: 32.8s (ends at ~39.5s)
# r7: 40.2s (ends at ~45.6s)
# r8: 46.2s (ends at ~50.0s)

filter_complex = '''
[0:a]adelay=800|800,highpass=f=260,lowpass=f=3700,volume=2.3[v1];
[1:a]adelay=6200|6200,highpass=f=260,lowpass=f=3700,volume=2.3[v2];
[2:a]adelay=12500|12500,highpass=f=260,lowpass=f=3700,volume=2.3[v3];
[3:a]adelay=19500|19500,highpass=f=260,lowpass=f=3700,volume=2.4[v4];
[4:a]adelay=25800|25800,highpass=f=260,lowpass=f=3700,volume=2.4[v5];
[5:a]adelay=32800|32800,highpass=f=260,lowpass=f=3700,volume=2.4[v6];
[6:a]adelay=40200|40200,highpass=f=260,lowpass=f=3700,volume=2.4[v7];
[7:a]adelay=46200|46200,highpass=f=260,lowpass=f=3700,volume=2.4[v8];

anoisesrc=d=52:c=pink:r=44100:a=0.015,highpass=f=320,lowpass=f=3900[static];
sine=f=880:d=0.15,adelay=300|300,volume=0.3[beep1];
sine=f=1200:d=0.18,adelay=500|500,volume=0.25[beep2];
sine=f=950:d=0.4,adelay=50500|50500,volume=0.3[endbeep];

[v1][v2][v3][v4][v5][v6][v7][v8][static][beep1][beep2][endbeep]amix=inputs=12:duration=longest:dropout_transition=2,atrim=0:52.0,volume=1.7[out]
'''

cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-i', f'{AUDIO_DIR}/stems_raid/r1.aiff',
    '-i', f'{AUDIO_DIR}/stems_raid/r2.aiff',
    '-i', f'{AUDIO_DIR}/stems_raid/r3.aiff',
    '-i', f'{AUDIO_DIR}/stems_raid/r4.aiff',
    '-i', f'{AUDIO_DIR}/stems_raid/r5.aiff',
    '-i', f'{AUDIO_DIR}/stems_raid/r6.aiff',
    '-i', f'{AUDIO_DIR}/stems_raid/r7.aiff',
    '-i', f'{AUDIO_DIR}/stems_raid/r8.aiff',
    '-filter_complex', filter_complex,
    '-map', '[out]',
    '-b:a', '192k',
    processed_mp3
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg Error:", res.stderr)
else:
    print("Master Stolen Astrolabe Audio Created:", os.path.getsize(processed_mp3), "bytes")
