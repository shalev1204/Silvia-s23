#!/usr/bin/env python3
"""
generate_cipher_emergency_radio.py
Generates the Cartographer's emergency radio transmission for Station 09 (The Celestial Cipher).
Voice: Fenrir (Gemini 2.5 TTS) + Howling Sandstorm Wind, Pelting Sand Foley & Radio Bandpass Breakdown.
"""

import os
import sys
import json
import wave
import urllib.request
import base64
import subprocess
import time
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AUDIO_OUT_DIR = os.path.join(PROJECT_ROOT, "web", "constellation", "celestial-cipher", "audio")
TEMP_DIR = os.path.join(PROJECT_ROOT, "web", "constellation", "celestial-cipher", "audio", "stems")
os.makedirs(AUDIO_OUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    key_path = os.path.expanduser("~/.gemini_api_key")
    if os.path.exists(key_path):
        with open(key_path, "r") as f:
            api_key = f.read().strip()
    else:
        raise ValueError("GEMINI_API_KEY environment variable or ~/.gemini_api_key required.")

lines = [
    ("s1", "Silvia! Silvia, can you hear me through the static? The storm is right on top of me out here in the dunes!"),
    ("s2", "Those words... you spoke the vow I carved into that brass dial fifty-six years ago! After a decade of watching the distant light... you gave me back my true name!"),
    ("s3", "I tracked the raiders down into the desert, but this red sandstorm caught me in the open! They fled deeper into the sands with our stolen Astrolabe!"),
    ("s4", "The gale is colossal—it is sealing the mountain pass behind you! Our journey of mountain numbers is finished!"),
    ("s5", "I must find shelter in the canyon ruins before this tempest swallows me whole! When the winds finally die down, you must descend into the desert."),
    ("s6", "Open the next sheet of my journal! Study the Desert Path—down here, mountain equations have no power; only the ancient languages of the sand can guide you!"),
    ("s7", "The sand is ripping my antenna away! The carrier is dying! Once you reach the desert threshold, we will find the Desert Oracle together and recover the Astrolabe!"),
    ("s8", "Hold your ground until the gale clears! I will be waiting for you at the edge of the sands!")
]

voice = "Fenrir"
model = "gemini-2.5-flash-preview-tts"

print(f"1. Generating emergency voice stems with {voice} ({model})...")

stem_wavs = []
stem_durations = []

for tag, text in lines:
    raw_pcm = os.path.join(TEMP_DIR, f"{tag}.pcm")
    wav_path = os.path.join(TEMP_DIR, f"{tag}.wav")
    
    if os.path.exists(wav_path):
        res = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", wav_path
        ], capture_output=True, text=True, check=True)
        dur = float(res.stdout.strip())
        stem_wavs.append(wav_path)
        stem_durations.append(dur)
        print(f"  ✓ Cached {tag} ({dur:.2f}s)")
        continue

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": voice
                    }
                }
            }
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key}
    )
    
    success = False
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                part = data["candidates"][0]["content"]["parts"][0]
                pcm_data = base64.b64decode(part["inlineData"]["data"])
                
                with open(raw_pcm, "wb") as pf:
                    pf.write(pcm_data)
                
                cmd = [
                    "ffmpeg", "-y",
                    "-f", "s16le",
                    "-ar", "24000",
                    "-ac", "1",
                    "-i", raw_pcm,
                    wav_path
                ]
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                
                res = subprocess.run([
                    "ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", wav_path
                ], capture_output=True, text=True, check=True)
                dur = float(res.stdout.strip())
                
                stem_wavs.append(wav_path)
                stem_durations.append(dur)
                print(f"  ✓ {tag} ({dur:.2f}s): {text[:45]}...")
                success = True
                break
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {tag}: {e}")
            time.sleep(1.5)

# 2. Compute exact timestamp breakdown for the synchronized subtitles!
print("\n2. Computing synchronized subtitle timeline...")
timed_lines = []
current_time = 0.8  # initial radio lock squelch

timed_lines.append({
    "time": 0.0,
    "text": "[ 142.85 MHz SHORTWAVE LOCKED · SOUTHERN SANDSTORM OVERRIDE... ]"
})

pause_between_stems = 0.75
for i, (tag, text) in enumerate(lines):
    dur = stem_durations[i]
    timed_lines.append({
        "time": round(current_time, 2),
        "text": f'"{text.upper()}"',
        "dur": round(dur, 2)
    })
    current_time += dur + pause_between_stems

# Final signal collapse tag
timed_lines.append({
    "time": round(current_time, 2),
    "text": "[ ANTENNA MAST TORN DOWN · CARRIER COLLAPSED · RECONNECT IN THE DESERT PATH ]"
})

total_voice_duration = current_time + 3.0
print(f"Total Transmission Duration: {total_voice_duration:.2f} seconds")

# Save subtitle JSON for JS consumption
with open(os.path.join(AUDIO_OUT_DIR, "subtitles.json"), "w") as f:
    json.dump(timed_lines, f, indent=2)

# 3. Concatenate voice stems with precise pauses
concat_list = os.path.join(TEMP_DIR, "concat.txt")
silence_wav = os.path.join(TEMP_DIR, "silence.wav")
initial_silence = os.path.join(TEMP_DIR, "init_silence.wav")

subprocess.run([
    "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
    "-t", "0.8", initial_silence
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

subprocess.run([
    "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
    "-t", str(pause_between_stems), silence_wav
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

with open(concat_list, "w") as f:
    f.write("file 'init_silence.wav'\n")
    for i, w in enumerate(stem_wavs):
        f.write(f"file '{os.path.basename(w)}'\n")
        if i < len(stem_wavs) - 1:
            f.write("file 'silence.wav'\n")

raw_voice_concat = os.path.join(TEMP_DIR, "voice_clean_concat.wav")
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "concat.txt",
    "-c:a", "pcm_s16le", "-ar", "44100", "-ac", "1", raw_voice_concat
], cwd=TEMP_DIR, check=True)

# 4. Synthesize Sandstorm & Radio Soundscape (NumPy)
print("\n3. Synthesizing Sandstorm Foley (Wind, Sand Grains, Radio Static)...")
SR = 44100
n_samples = int(SR * total_voice_duration)
t = np.linspace(0, total_voice_duration, n_samples, endpoint=False)

# A. Fierce Hurricane Desert Wind (Multi-band turbulence)
wind_noise = np.random.normal(0, 1.0, n_samples).astype(np.float32)
# Low roar moving average filter (~150 Hz)
w_low = int(SR / 150)
low_wind = np.convolve(wind_noise, np.ones(w_low, dtype=np.float32)/w_low, mode='same')
# High howling whistle
w_hi = int(SR / 800)
hi_wind = np.convolve(wind_noise, np.ones(w_hi, dtype=np.float32)/w_hi, mode='same') - low_wind

# Wind crescendo: starts strong, becomes an overwhelming tempest by the end
wind_envelope = np.linspace(0.45, 1.25, n_samples) * (
    1.0 + 0.35 * np.sin(2 * np.pi * 0.18 * t) + 0.25 * np.sin(2 * np.pi * 0.08 * t + 1.5)
)
wind_audio = (low_wind * 2.2 + hi_wind * 1.6) * wind_envelope * 0.35

# B. Pelting Sand Grains against Metal Antenna & Goggles
# High-frequency sporadic spikes
sand_audio = np.zeros(n_samples, dtype=np.float32)
n_grains = int(total_voice_duration * 120)  # dense grain strikes
strike_indices = np.random.randint(0, n_samples - 200, n_grains)
grain_kernel = np.sin(2 * np.pi * 4200 * np.linspace(0, 0.003, 130)) * np.exp(-np.linspace(0, 6, 130))
for idx in strike_indices:
    intensity = (idx / n_samples) * 0.4 + 0.1
    sand_audio[idx:idx+130] += grain_kernel.astype(np.float32) * intensity

# C. Radio Static, Squelch & Emergency Carrier
radio_noise = np.random.uniform(-1, 1, n_samples).astype(np.float32)
# Heterodyne carrier tone at 1850 Hz with slight drift
carrier_whistle = np.sin(2 * np.pi * (1850 + 40 * np.sin(0.4 * t)) * t) * 0.02
# Increasing static towards the end (signal collapses)
static_crescendo = np.linspace(0.08, 0.55, n_samples) ** 1.6
radio_audio = (radio_noise * static_crescendo + carrier_whistle) * 0.25

# Save foley wavs
wind_wav = os.path.join(TEMP_DIR, "wind_foley.wav")
sand_wav = os.path.join(TEMP_DIR, "sand_foley.wav")
radio_wav = os.path.join(TEMP_DIR, "radio_foley.wav")

def write_mono(path, arr):
    arr_clipped = np.clip(arr, -0.98, 0.98)
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((arr_clipped * 32767).astype(np.int16).tobytes())

write_mono(wind_wav, wind_audio)
write_mono(sand_wav, sand_audio)
write_mono(radio_wav, radio_audio)

# 5. Master Mix with ffmpeg:
# Voice processed through tactical mil-spec radio bandpass (highpass 320, lowpass 3400) + subtle distortion
# Foley mixed with spatial depth and sudden carrier drop at the end
print("\n4. Mastering Final Radio Broadcast MP3...")
final_mp3 = os.path.join(AUDIO_OUT_DIR, "cartographer_sandstorm_emergency.mp3")

# We apply:
# [0:a] voice: bandpass, telephone radio EQ, compression
# [1:a] wind: volume 0.7
# [2:a] sand: volume 0.5
# [3:a] radio static: volume 0.6
filter_complex = (
    "[0:a]highpass=f=320,lowpass=f=3400,volume=1.45,acompressor=threshold=-12dB:ratio=4:attack=10:release=100[v];"
    "[1:a]volume=0.75[w];"
    "[2:a]volume=0.55[s];"
    "[3:a]volume=0.50[r];"
    "[v][w][s][r]amix=inputs=4:duration=first:dropout_transition=0.5[mix];"
    "[mix]volume=1.2,alimiter=limit=0.95"
)

subprocess.run([
    "ffmpeg", "-y",
    "-i", raw_voice_concat,
    "-i", wind_wav,
    "-i", sand_wav,
    "-i", radio_wav,
    "-filter_complex", filter_complex,
    "-b:a", "192k",
    final_mp3
], check=True)

# Verify duration
res = subprocess.run([
    "ffprobe", "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", final_mp3
], capture_output=True, text=True, check=True)
dur_final = float(res.stdout.strip())
print(f"\n Master emergency broadcast generated: {final_mp3}")
print(f" Exact Duration: {dur_final:.2f}s")
