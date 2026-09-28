import json
import subprocess
import os

STEM_DIR = "assets/constellation/radio-transmission/audio/stems_desert"
OUT_MP3 = "web/constellation/radio-transmission/cartographer_desert_transmission.mp3"
BACKUP_MP3 = "assets/constellation/radio-transmission/audio/cartographer_desert_transmission.mp3"

with open(f"{STEM_DIR}/durations.json", "r") as f:
    durations = json.load(f)

# Natural pacing schedule: pauses between sentences for atmospheric breathing & sand shifting
schedule = []
cur_time_ms = 1200 # start at 1.2s after radio tune-in chirp

for i in range(1, 10):
    tag = f"d{i}"
    dur_s = durations[tag]
    dur_ms = int(dur_s * 1000)
    schedule.append({
        "tag": tag,
        "start_ms": cur_time_ms,
        "end_ms": cur_time_ms + dur_ms,
        "dur_ms": dur_ms,
        "dur_s": dur_s
    })
    # Natural pause
    cur_time_ms += dur_ms + 1400

total_dur_s = (cur_time_ms + 1200) / 1000.0

print(f"Total Transmission Duration: {total_dur_s:.2f}s")
for item in schedule:
    print(f"  {item['tag']}: {item['start_ms']/1000.0:.2f}s -> {item['end_ms']/1000.0:.2f}s ({item['dur_s']:.2f}s)")

FOLEY_DIR = f"{STEM_DIR}/foley"
os.makedirs(FOLEY_DIR, exist_ok=True)
WIND_WAV = f"{FOLEY_DIR}/desert_wind.wav"
SAND_WAV = f"{FOLEY_DIR}/sand_trickle.wav"

fade_out_st = total_dur_s - 3.0

# 1. Desert wind: low desert wind whistle shaped for radio microphone bandwidth (260Hz - 2600Hz)
subprocess.run([
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', f'anoisesrc=d={total_dur_s:.2f}:c=pink:r=44100:a=0.06',
    '-af', f'bandpass=f=340:width_type=h:w=220,tremolo=f=0.18:d=0.6,volume=1.1,afade=t=in:ss=0:d=2,afade=t=out:st={fade_out_st:.2f}:d=3',
    WIND_WAV
], check=True)

# 2. Sand trickle foley: soft textured sand trickling inside transceiver mic bandwidth (1400Hz - 3400Hz)
subprocess.run([
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', f'anoisesrc=d={total_dur_s:.2f}:c=pink:r=44100:a=0.04',
    '-af', f'highpass=f=1200,lowpass=f=3400,tremolo=f=1.4:d=0.85,volume=0.35,afade=t=in:ss=0:d=1,afade=t=out:st={fade_out_st:.2f}:d=3',
    SAND_WAV
], check=True)

# EXACT radio vocal filter matching Transmission 1:
# Bandpass 260Hz - 3600Hz, presence peak at 1.8kHz, tactical compression ratio 3.5:1
v_filter = 'highpass=f=260,lowpass=f=3600,equalizer=f=1800:width_type=o:w=1.2:g=3.5,acompressor=threshold=-16dB:ratio=3.5:attack=6:release=75,volume=2.2'

inputs = []
for i in range(1, 10):
    inputs.extend(['-i', f'{STEM_DIR}/d{i}.wav'])

inputs.extend(['-i', WIND_WAV])
inputs.extend(['-i', SAND_WAV])

filter_parts = []
mix_inputs = []

for idx, item in enumerate(schedule):
    st_ms = item['start_ms']
    filter_parts.append(f"[{idx}:a]adelay={st_ms}|{st_ms},{v_filter}[v{idx+1}]")
    mix_inputs.append(f"[v{idx+1}]")

wind_idx = 9
sand_idx = 10

# Desert wind in radio mic
filter_parts.append(f"[{wind_idx}:a]highpass=f=240,lowpass=f=2800,volume=0.22[bg_wind]")
mix_inputs.append("[bg_wind]")

# Sand trickling in radio mic
filter_parts.append(f"[{sand_idx}:a]highpass=f=1200,lowpass=f=3400,volume=0.25[bg_sand]")
mix_inputs.append("[bg_sand]")

# Radio background static floor matching Transmission 1
filter_parts.append(f"anoisesrc=d={total_dur_s}:c=pink:r=44100:a=0.008,highpass=f=300,lowpass=f=3700[static]")
mix_inputs.append("[static]")

# Opening tune-in chirp
filter_parts.append("sine=f=880:d=0.12,adelay=350|350,volume=0.24[chirp1]")
mix_inputs.append("[chirp1]")
filter_parts.append("sine=f=1350:d=0.15,adelay=480|480,volume=0.19[chirp2]")
mix_inputs.append("[chirp2]")

# Ending roger beep
end_beep_ms = int((total_dur_s - 1.2) * 1000)
filter_parts.append(f"sine=f=1050:d=0.25,adelay={end_beep_ms}|{end_beep_ms},volume=0.22[rogerbeep]")
mix_inputs.append("[rogerbeep]")

all_mix = "".join(mix_inputs)
num_inputs = len(mix_inputs)

# Mix and apply final tactical transceiver cabinet shaping: steep highpass 240Hz, lowpass 3600Hz
filter_parts.append(f"{all_mix}amix=inputs={num_inputs}:duration=longest:dropout_transition=1,atrim=0:{total_dur_s:.2f},highpass=f=250,lowpass=f=3600,volume=1.75[out]")

filter_complex_str = ";\n".join(filter_parts)

cmd = ['/opt/homebrew/bin/ffmpeg', '-y'] + inputs + [
    '-filter_complex', filter_complex_str,
    '-map', '[out]',
    '-b:a', '192k',
    OUT_MP3
]

print("Mixing Desert Transmission Master with matched radio transceiver filter...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg Error:\n", res.stderr)
    exit(1)

subprocess.run(['cp', OUT_MP3, BACKUP_MP3], check=True)
size = os.path.getsize(OUT_MP3)
print(f"Master created: {OUT_MP3} ({size} bytes, duration {total_dur_s:.2f}s)")

# Export subtitle timed lines with exact uppercase formatting matching Transmission 1
texts = [
    '"SILVIA... SILVIA, DO YOU COPY ME? IT\'S ME."',
    '"IF THIS SIGNAL IS REACHING YOUR RECEIVER... I MADE IT OUT ALIVE."',
    '"WHEN THE VAULT DOORS BUCKLED, I BROKE THROUGH THE LOWER AQUEDUCT STRAIGHT INTO THE SOUTHERN DUNES. THE OBSERVATORY... THEY BURNED IT TO THE GROUND. BUT I SURVIVED."',
    '"I\'M OUT IN THE DEEP DESERT NOW. JUST MILES OF OPEN SILENCE, COLD SAND... AND THE STARS ABOVE."',
    '"LISTEN CLOSELY... THE CARRIER PIGEON SHOULD BE REACHING ITALY ANY MOMENT NOW WITH MY PHYSICAL JOURNAL. GUARD IT WITH YOUR LIFE."',
    '"THE RAIDERS TORE THE ASTROLABE FROM THE ALTAR, BUT THEY CANNOT DECIPHER ITS CELESTIAL GEARINGS. WITHOUT YOU... WITHOUT THE CONSTELLATIONS AND CIPHERS YOU ARE SOLVING IN THE JOURNAL, I CANNOT CHART ITS RECOVERY ALONE."',
    '"WORK THROUGH THE STANZAS AND STAR CHARTS. FIND THE COORDINATES."',
    '"I\'LL KEEP SHADOWING THEIR TRAIL ACROSS THE SANDS, TAKING FIELD NOTES AND TRANSMITTING THEM TO YOU. TOGETHER, WE ARE GOING TO RECLAIM THE ASTROLABE AND SAVE THE ECLIPSE ORDER."',
    '"REST YOUR EYES WHEN YOU CAN, SILVIA. THE DESERT NIGHT IS FREEZING... BUT THE HEAVENS ARE WATCHING OVER US. STAY SAFE. OUT."'
]

timed_lines = [
    {"time": 0.0, "text": "[ FREQUENCY LOCKED · SOUTHERN DUNES OUTPOST RELAY... ]"}
]

for idx, item in enumerate(schedule):
    t_start = round(item['start_ms'] / 1000.0, 2)
    timed_lines.append({
        "time": t_start,
        "text": texts[idx]
    })

timed_lines.append({
    "time": round((schedule[-1]['end_ms'] + 500) / 1000.0, 2),
    "text": "✦ CARRIER STANDBY · DECODE JOURNAL PUZZLES TO REACH THE DESERT ✦"
})

with open(f"{STEM_DIR}/timed_lines.json", "w") as f:
    json.dump(timed_lines, f, indent=2)

print("\nExported TIMED_LINES for web integration:")
print(json.dumps(timed_lines, indent=2))
