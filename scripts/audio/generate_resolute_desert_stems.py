import os
import sys
import json
import urllib.request
import base64
import subprocess
import time

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    key_path = os.path.expanduser("~/.gemini_api_key")
    if not os.path.exists(key_path):
        sys.exit("Error: set GEMINI_API_KEY or create ~/.gemini_api_key (never commit it).")
    with open(key_path, "r") as f:
        api_key = f.read().strip()

STEM_DIR = "assets/constellation/radio-transmission/audio/stems_desert_v2"
os.makedirs(STEM_DIR, exist_ok=True)

# Pacing and text engineered for firm, resolute, mature masculine Cartographer delivery
stems_data = [
    ("d1", "Silvia. Silvia, do you copy me? It is me."),
    ("d2", "If this signal is reaching your receiver, I made it out alive."),
    ("d3_a", "When the vault doors buckled, I broke through the lower aqueduct into the southern dunes."),
    ("d3_b", "The observatory... they burned it to the ground. But I survived."),
    ("d4", "I am out in the deep desert now. Miles of open silence, cold sand, and the stars above."),
    ("d5_a", "Listen closely. The carrier pigeon should be reaching Italy any moment now with my physical journal."),
    ("d5_b", "Guard it with your life."),
    ("d6_a", "The raiders tore the Astrolabe from the altar, but they cannot decipher its celestial gearings."),
    ("d6_b", "Without the constellations and ciphers you are solving in the journal, I cannot chart its recovery alone."),
    ("d7", "Work through the stanzas and star charts. Find the coordinates."),
    ("d8_a", "I will keep shadowing their trail across the sands, taking field notes and transmitting them to you."),
    ("d8_b", "Together, we are going to reclaim the Astrolabe and save the Eclipse Order."),
    ("d9_a", "Rest your eyes when you can, Silvia. The desert night is freezing..."),
    ("d9_b", "...but the heavens are watching over us. Stay safe. Out.")
]

voice = "Fenrir"
model = "gemini-2.5-flash-preview-tts"

durations = {}

print(f"Generating {len(stems_data)} resolute Cartographer stems with voice '{voice}'...")

for tag, text in stems_data:
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
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json", "x-goog-api-key": api_key})
    
    success = False
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                part = data["candidates"][0]["content"]["parts"][0]
                pcm_data = base64.b64decode(part["inlineData"]["data"])
                
                raw_pcm = f"{STEM_DIR}/{tag}.pcm"
                wav_out = f"{STEM_DIR}/{tag}.wav"
                with open(raw_pcm, "wb") as f_out:
                    f_out.write(pcm_data)
                
                subprocess.run([
                    '/opt/homebrew/bin/ffmpeg', '-y',
                    '-f', 's16le', '-ar', '24000', '-ac', '1',
                    '-i', raw_pcm, wav_out
                ], capture_output=True, check=True)
                
                res = subprocess.run([
                    '/opt/homebrew/bin/ffprobe', '-i', wav_out,
                    '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'
                ], capture_output=True, text=True, check=True)
                dur = float(res.stdout.strip())
                durations[tag] = dur
                print(f"  [OK] {tag} ({dur:.2f}s): {text[:45]}...")
                success = True
                break
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {tag}: {e}")
            time.sleep(1.5)
            
    if not success:
        print(f"FATAL: failed to generate {tag}")
        exit(1)
    time.sleep(0.4)

with open(f"{STEM_DIR}/durations.json", "w") as f:
    json.dump(durations, f, indent=2)

print("All stems generated successfully!")
