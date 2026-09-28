import subprocess
import os

os.makedirs('assets/audio', exist_ok=True)
processed_mp3 = 'assets/audio/cartographer_distress.mp3'

# Input files:
# 0: c1 (0.8s delay)
# 1: c2 (6.2s delay)
# 2: c3 (12.2s delay)
# 3: c4 (18.2s delay)
# 4: c5 (22.2s delay)
# 5: c6 (29.5s delay)
# 6: c7 (32.0s delay)
# 7: h1 (19.8s delay)
# 8: h2 (29.0s delay)
# 9: fx_alarm (0s delay)
# 10: fx_footsteps (5s delay, volume ducked during voice)
# 11: fx_static (0s delay)
# 12: fx_impact 1 (16.5s delay)
# 13: fx_impact 2 (28.2s delay)
# 14: fx_impact 3 (35.6s delay)
# 15: fx_screech (35.7s delay)

filter_complex = '''
[0:a]adelay=800|800,highpass=f=280,lowpass=f=3600,volume=2.2[v1];
[1:a]adelay=6200|6200,highpass=f=280,lowpass=f=3600,volume=2.2[v2];
[2:a]adelay=12200|12200,highpass=f=280,lowpass=f=3600,volume=2.2[v3];
[3:a]adelay=18200|18200,highpass=f=280,lowpass=f=3600,volume=2.3[v4];
[4:a]adelay=22200|22200,highpass=f=280,lowpass=f=3600,volume=2.3[v5];
[5:a]adelay=29500|29500,highpass=f=280,lowpass=f=3600,volume=2.4[v6];
[6:a]adelay=32000|32000,highpass=f=280,lowpass=f=3600,volume=2.4[v7];

[7:a]adelay=19800|19800,lowpass=f=650,volume=0.8[h1];
[8:a]adelay=28800|28800,lowpass=f=800,volume=1.1[h2];

[9:a]volume=0.15[alarm];
[10:a]adelay=4500|4500,volume=0.35[steps];
[11:a]volume=0.25[static];

[12:a]adelay=16500|16500,volume=1.2[imp1];
[13:a]adelay=28200|28200,volume=1.4[imp2];
[14:a]adelay=35500|35500,volume=2.0[imp3];
[15:a]adelay=35600|35600,volume=1.8[screech];

[v1][v2][v3][v4][v5][v6][v7][h1][h2][alarm][steps][static][imp1][imp2][imp3][screech]amix=inputs=16:duration=longest:dropout_transition=2,atrim=0:37.5,volume=1.8[out]
'''

cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-i', 'assets/audio/stems/c1.aiff',
    '-i', 'assets/audio/stems/c2.aiff',
    '-i', 'assets/audio/stems/c3.aiff',
    '-i', 'assets/audio/stems/c4.aiff',
    '-i', 'assets/audio/stems/c5.aiff',
    '-i', 'assets/audio/stems/c6.aiff',
    '-i', 'assets/audio/stems/c7.aiff',
    '-i', 'assets/audio/stems/h1.aiff',
    '-i', 'assets/audio/stems/h2.aiff',
    '-i', 'assets/audio/stems/fx_alarm.wav',
    '-i', 'assets/audio/stems/fx_footsteps.wav',
    '-i', 'assets/audio/stems/fx_static.wav',
    '-i', 'assets/audio/stems/fx_impact.wav',
    '-i', 'assets/audio/stems/fx_impact.wav',
    '-i', 'assets/audio/stems/fx_impact.wav',
    '-i', 'assets/audio/stems/fx_screech.wav',
    '-filter_complex', filter_complex,
    '-map', '[out]',
    '-b:a', '192k',
    processed_mp3
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg Error:", res.stderr)
else:
    print("Master Distress Audio Created Successfully:", os.path.getsize(processed_mp3), "bytes")
