import subprocess
import os

os.makedirs('assets/audio', exist_ok=True)

# Generate synthesized Foley sound effects using FFmpeg synth filters:

# 1. Distant Observatory Alarm (pulsing 2-tone klaxon for 36s, faint volume)
alarm_cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', 'sine=f=680:d=38',
    '-f', 'lavfi', '-i', 'sine=f=510:d=38',
    '-filter_complex', '[0:a][1:a]amix=inputs=2,tremolo=f=1.8:d=0.9,lowpass=f=1200,volume=0.08[out]',
    '-map', '[out]', 'assets/audio/stems/fx_alarm.wav'
]
subprocess.run(alarm_cmd, check=True)

# 2. Footsteps Foley (synthesized rhythmic low thuds)
footsteps_cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', 'anoisesrc=d=38:c=brown:r=44100:a=0.3',
    '-filter_complex', '[0:a]lowpass=f=220,volume=2.5,tremolo=f=3.2:d=0.95[out]',
    '-map', '[out]', 'assets/audio/stems/fx_footsteps.wav'
]
subprocess.run(footsteps_cmd, check=True)

# 3. Metallic Impacts / Door Breaches (synthesized heavy crashes)
# Door kick at 16s, heavy smash at 27.5s, final breach at 34s
crash_cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', 'anoisesrc=d=0.4:c=white:r=44100:a=0.9',
    '-f', 'lavfi', '-i', 'sine=f=95:d=0.6',
    '-filter_complex', '[0:a]lowpass=f=1800,volume=1.8[n];[1:a]volume=2.0[s];[n][s]amix=inputs=2[out]',
    '-map', '[out]', 'assets/audio/stems/fx_impact.wav'
]
subprocess.run(crash_cmd, check=True)

# 4. Final Violent Screech & Disconnect Tone (at 34.5s)
screech_cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', 'sine=f=1450:d=0.45',
    '-f', 'lavfi', '-i', 'anoisesrc=d=0.45:c=white:r=44100:a=0.8',
    '-filter_complex', '[0:a][1:a]amix=inputs=2,volume=1.5[out]',
    '-map', '[out]', 'assets/audio/stems/fx_screech.wav'
]
subprocess.run(screech_cmd, check=True)

# 5. Radio Static Bed (38s)
static_cmd = [
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', 'anoisesrc=d=38:c=pink:r=44100:a=0.03',
    '-filter_complex', '[0:a]highpass=f=350,lowpass=f=3800,volume=0.35[out]',
    '-map', '[out]', 'assets/audio/stems/fx_static.wav'
]
subprocess.run(static_cmd, check=True)

print("Synthesized Foley effects generated.")
