import json
import subprocess
import os

STEM_DIR = "assets/constellation/radio-transmission/audio/stems_desert_v2"
OUT_MP3 = "web/constellation/radio-transmission/cartographer_desert_transmission.mp3"
BACKUP_MP3 = "assets/constellation/radio-transmission/audio/cartographer_desert_transmission.mp3"

with open(f"{STEM_DIR}/durations.json", "r") as f:
    durations = json.load(f)

# Stem order & corresponding text breakdown
stems_order = [
    ("d1", '"SILVIA. SILVIA, DO YOU COPY ME? IT IS ME."'),
    ("d2", '"IF THIS SIGNAL IS REACHING YOUR RECEIVER... I MADE IT OUT ALIVE."'),
    ("d3_a", '"WHEN THE VAULT DOORS BUCKLED, I BROKE THROUGH THE LOWER AQUEDUCT INTO THE SOUTHERN DUNES."'),
    ("d3_b", '"THE OBSERVATORY... THEY BURNED IT TO THE GROUND. BUT I SURVIVED."'),
    ("d4", '"I AM OUT IN THE DEEP DESERT NOW. MILES OF OPEN SILENCE, COLD SAND, AND THE STARS ABOVE."'),
    ("d5_a", '"LISTEN CLOSELY. THE CARRIER PIGEON SHOULD BE REACHING ITALY ANY MOMENT NOW WITH MY PHYSICAL JOURNAL."'),
    ("d5_b", '"GUARD IT WITH YOUR LIFE."'),
    ("d6_a", '"THE RAIDERS TORE THE ASTROLABE FROM THE ALTAR, BUT THEY CANNOT DECIPHER ITS CELESTIAL GEARINGS."'),
    ("d6_b", '"WITHOUT THE CONSTELLATIONS AND CIPHERS YOU ARE SOLVING IN THE JOURNAL, I CANNOT CHART ITS RECOVERY ALONE."'),
    ("d7", '"WORK THROUGH THE STANZAS AND STAR CHARTS. FIND THE COORDINATES."'),
    ("d8_a", '"I WILL KEEP SHADOWING THEIR TRAIL ACROSS THE SANDS, TAKING FIELD NOTES AND TRANSMITTING THEM TO YOU."'),
    ("d8_b", '"TOGETHER, WE ARE GOING TO RECLAIM THE ASTROLABE AND SAVE THE ECLIPSE ORDER."'),
    ("d9_a", '"REST YOUR EYES WHEN YOU CAN, SILVIA. THE DESERT NIGHT IS FREEZING..."'),
    ("d9_b", '"...BUT THE HEAVENS ARE WATCHING OVER US. STAY SAFE. OUT."')
]

schedule = []
cur_time_ms = 1200  # Start at 1.2s after radio tune-in chirp

# Define pauses: short pause between closely linked sub-clauses, longer pause between separate thoughts
for tag, text in stems_order:
    dur_s = durations[tag]
    dur_ms = int(dur_s * 1000)
    schedule.append({
        "tag": tag,
        "text": text,
        "start_ms": cur_time_ms,
        "end_ms": cur_time_ms + dur_ms,
        "dur_ms": dur_ms,
        "dur_s": dur_s
    })
    
    # Adaptive pause
    if tag.endswith("_a"):
        cur_time_ms += dur_ms + 600   # Brief breath pause between split clauses
    else:
        cur_time_ms += dur_ms + 1300  # Full pause between independent statements

total_dur_s = (cur_time_ms + 1000) / 1000.0

print(f"Total Transmission Duration: {total_dur_s:.2f}s across {len(schedule)} phrases")

FOLEY_DIR = f"{STEM_DIR}/foley"
FOOTSTEPS_WAV = f"{FOLEY_DIR}/desert_footsteps_walking.wav"
SAND_TOUCH_WAV = f"{FOLEY_DIR}/desert_sand_touch.wav"
WIND_WAV = f"{FOLEY_DIR}/desert_wind_enhanced.wav"

# Vocal Filter: Tactical Military Transceiver (identical bandpass 260-3600Hz, plus low-mid masculine warmth and punchy compression)
v_filter = 'highpass=f=250,lowpass=f=3600,equalizer=f=220:width_type=o:w=1.2:g=3.0,equalizer=f=1800:width_type=o:w=1.2:g=3.5,acompressor=threshold=-16dB:ratio=3.5:attack=6:release=75,volume=3.6'

inputs = []
for tag, _ in stems_order:
    inputs.extend(['-i', f'{STEM_DIR}/{tag}.wav'])

inputs.extend(['-i', WIND_WAV])
inputs.extend(['-i', FOOTSTEPS_WAV])
inputs.extend(['-i', SAND_TOUCH_WAV])

filter_parts = []
mix_inputs = []

for idx, item in enumerate(schedule):
    st_ms = item['start_ms']
    filter_parts.append(f"[{idx}:a]adelay={st_ms}|{st_ms},{v_filter}[v{idx+1}]")
    mix_inputs.append(f"[v{idx+1}]")

wind_idx = len(stems_order)
steps_idx = len(stems_order) + 1
touch_idx = len(stems_order) + 2

# 1. Background Foley: Soft noticeable desert wind with gentle gusts
filter_parts.append(f"[{wind_idx}:a]highpass=f=160,lowpass=f=3400,volume=0.75[bg_wind]")
mix_inputs.append("[bg_wind]")

# 2. Background Foley: Walking through sand (sinking boots and crunching grains)
filter_parts.append(f"[{steps_idx}:a]highpass=f=120,lowpass=f=3800,volume=0.95[bg_steps]")
mix_inputs.append("[bg_steps]")

# 3. Background Foley: Touching and sifting sand (hand scooping and grains cascading)
filter_parts.append(f"[{touch_idx}:a]highpass=f=350,lowpass=f=4200,volume=1.05[bg_touch]")
mix_inputs.append("[bg_touch]")

# Radio background static floor
filter_parts.append(f"anoisesrc=d={total_dur_s}:c=pink:r=44100:a=0.007,highpass=f=300,lowpass=f=3600[static]")
mix_inputs.append("[static]")

# Opening chirp
filter_parts.append("sine=f=880:d=0.12,adelay=350|350,volume=0.28[chirp1]")
mix_inputs.append("[chirp1]")
filter_parts.append("sine=f=1350:d=0.15,adelay=480|480,volume=0.22[chirp2]")
mix_inputs.append("[chirp2]")

# Roger beep
end_beep_ms = int((total_dur_s - 1.0) * 1000)
filter_parts.append(f"sine=f=1050:d=0.25,adelay={end_beep_ms}|{end_beep_ms},volume=0.26[rogerbeep]")
mix_inputs.append("[rogerbeep]")

all_mix = "".join(mix_inputs)
num_inputs = len(mix_inputs)

# Mix with loud gain compensation (+14dB boost matching Transmission 1 mean volume of -19.8 dB)
filter_parts.append(f"{all_mix}amix=inputs={num_inputs}:duration=longest:dropout_transition=1,atrim=0:{total_dur_s:.2f},highpass=f=240,lowpass=f=3600,volume=4.8,alimiter=limit=0.96[out]")

filter_complex_str = ";\n".join(filter_parts)

cmd = ['/opt/homebrew/bin/ffmpeg', '-y'] + inputs + [
    '-filter_complex', filter_complex_str,
    '-map', '[out]',
    '-b:a', '192k',
    OUT_MP3
]

print("Mixing master with matched radio volume and resolute vocal character...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg Error:\n", res.stderr)
    exit(1)

subprocess.run(['cp', OUT_MP3, BACKUP_MP3], check=True)
size = os.path.getsize(OUT_MP3)
print(f"Master created: {OUT_MP3} ({size} bytes, duration {total_dur_s:.2f}s)")

# Export fine-grained subtitle lines (phrase by phrase)
timed_lines = [
    {"time": 0.0, "text": "[ FREQUENCY LOCKED · SOUTHERN DUNES OUTPOST RELAY... ]"}
]

for item in schedule:
    timed_lines.append({
        "time": round(item['start_ms'] / 1000.0, 2),
        "text": item['text']
    })

timed_lines.append({
    "time": round((schedule[-1]['end_ms'] + 400) / 1000.0, 2),
    "text": "✦ CARRIER STANDBY · DECODE JOURNAL PUZZLES TO REACH THE DESERT ✦"
})

with open(f"{STEM_DIR}/timed_lines.json", "w") as f:
    json.dump(timed_lines, f, indent=2)

print("\nTIMED_LINES_02 Count:", len(timed_lines))
for line in timed_lines:
    print(f"  {line['time']}s: {line['text']}")
