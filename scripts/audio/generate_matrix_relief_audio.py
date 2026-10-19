#!/usr/bin/env python3
"""
generate_matrix_relief_audio.py
Generates the Cartographer's radio relief message for The Celestial Matrix puzzle victory.
Voice: Fenrir (Gemini 2.5 TTS) + Radio Bandpass & Desert Ambience.
"""

import os
import sys
import json
import urllib.request
import base64
import subprocess
import time

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "web", "constellation", "celestial-matrix")
TEMP_DIR = os.path.join(PROJECT_ROOT, "assets", "constellation", "celestial-matrix", "stems")
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    key_path = os.path.expanduser("~/.gemini_api_key")
    if not os.path.exists(key_path):
        sys.exit("Error: set GEMINI_API_KEY or create ~/.gemini_api_key (never commit it).")
    with open(key_path, "r") as f:
        api_key = f.read().strip()

lines = [
    ("m1", "Silvia! The signal came through... loud and clear! The console held!"),
    ("m2", "The raiders are marching south across the dunes toward the sandstone ruins... now I know where to track the stolen Astrolabe."),
    ("m3", "I've locked the first decrypted glyph onto your screen. Inscribe it into your codex, and turn to the next page of my journal... we're closing in.")
]

voice = "Fenrir"
model = "gemini-2.5-flash-preview-tts"

print(f"Generating victory voice stems with {voice} ({model})...")

stem_wavs = []

for tag, text in lines:
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
                
                raw_pcm = os.path.join(TEMP_DIR, f"{tag}.pcm")
                with open(raw_pcm, "wb") as pf:
                    pf.write(pcm_data)
                
                wav_path = os.path.join(TEMP_DIR, f"{tag}.wav")
                cmd = [
                    "/opt/homebrew/bin/ffmpeg", "-y",
                    "-f", "s16le",
                    "-ar", "24000",
                    "-ac", "1",
                    "-i", raw_pcm,
                    wav_path
                ]
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                stem_wavs.append(wav_path)
                print(f"  ✓ Generated stem: {tag} ({len(pcm_data)} bytes)")
                success = True
                break
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {tag}: {e}")
            time.sleep(1.5)
            
    if not success:
        print(f"Fallback to say command for {tag}...")
        wav_path = os.path.join(TEMP_DIR, f"{tag}.wav")
        subprocess.run(["say", "-v", "Daniel", "-o", wav_path, "--data-format=LEF32@24000", text], check=True)
        stem_wavs.append(wav_path)

# Concatenate stems with 0.7s pauses
concat_list = os.path.join(TEMP_DIR, "concat.txt")
silence_wav = os.path.join(TEMP_DIR, "silence.wav")
subprocess.run([
    "/opt/homebrew/bin/ffmpeg", "-y",
    "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
    "-t", "0.7", silence_wav
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

with open(concat_list, "w") as f:
    for i, w in enumerate(stem_wavs):
        f.write(f"file '{w}'\n")
        if i < len(stem_wavs) - 1:
            f.write(f"file '{silence_wav}'\n")

merged_voice = os.path.join(TEMP_DIR, "voice_merged.wav")
subprocess.run([
    "/opt/homebrew/bin/ffmpeg", "-y",
    "-f", "concat", "-safe", "0", "-i", concat_list,
    "-c", "copy", merged_voice
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

# Master output: apply radio bandpass filter (highpass 300Hz, lowpass 3600Hz) + subtle tape saturation
final_mp3 = os.path.join(OUTPUT_DIR, "cartographer_matrix_relief.mp3")

filter_chain = (
    "highpass=f=280,"
    "lowpass=f=3800,"
    "volume=1.25,"
    "acompressor=threshold=-14dB:ratio=3:attack=15:release=120"
)

subprocess.run([
    "/opt/homebrew/bin/ffmpeg", "-y",
    "-i", merged_voice,
    "-af", filter_chain,
    "-b:a", "192k",
    final_mp3
], check=True)

print(f"\n Master victory audio created: {final_mp3}")

# Check duration
res = subprocess.run([
    "/opt/homebrew/bin/ffprobe", "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    final_mp3
], capture_output=True, text=True, check=True)
print(f" Duration: {float(res.stdout.strip()):.2f} seconds")
