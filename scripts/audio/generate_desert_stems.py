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

STEM_DIR = "assets/constellation/radio-transmission/audio/stems_desert"
os.makedirs(STEM_DIR, exist_ok=True)
OUT_MP3 = "web/constellation/radio-transmission/cartographer_desert_transmission.mp3"
BACKUP_MP3 = "assets/constellation/radio-transmission/audio/cartographer_desert_transmission.mp3"

lines = [
    ("d1", "Silvia... Silvia, do you copy me? It's me."),
    ("d2", "If this signal is reaching your receiver... I made it out alive."),
    ("d3", "When the vault doors buckled, I broke through the lower aqueduct straight into the southern dunes. The observatory... they burned it to the ground. But I survived."),
    ("d4", "I'm out in the deep desert now. Just miles of open silence, cold sand... and the stars above."),
    ("d5", "Listen closely... the carrier pigeon should be reaching Italy any moment now with my physical journal. Guard it with your life."),
    ("d6", "The raiders tore the Astrolabe from the altar, but they cannot decipher its celestial gearings. Without you... without the constellations and ciphers you are solving in the journal, I cannot chart its recovery alone."),
    ("d7", "You're still on the Constellation Path. Work through the stanzas and star charts. Find the coordinates."),
    ("d8", "I'll keep shadowing their trail across the sands, taking field notes and transmitting them to you. Together, we are going to reclaim the Astrolabe and save the Eclipse Order."),
    ("d9", "Rest your eyes when you can, Silvia. The desert night is freezing... but the heavens are watching over us. Stay safe. Out.")
]

voice = "Fenrir"
model = "gemini-2.5-flash-preview-tts"

print(f"Generating {len(lines)} desert voice stems with voice '{voice}' using '{model}'...")

stem_durations = {}

for tag, text in lines:
    pcm_path = f"{STEM_DIR}/{tag}.pcm"
    wav_path = f"{STEM_DIR}/{tag}.wav"
    
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
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                part = data["candidates"][0]["content"]["parts"][0]
                pcm_data = base64.b64decode(part["inlineData"]["data"])
                
                with open(pcm_path, "wb") as f_out:
                    f_out.write(pcm_data)
                
                subprocess.run([
                    '/opt/homebrew/bin/ffmpeg', '-y',
                    '-f', 's16le', '-ar', '24000', '-ac', '1',
                    '-i', pcm_path, wav_path
                ], capture_output=True, check=True)
                
                # Check duration
                res = subprocess.run([
                    '/opt/homebrew/bin/ffprobe', '-i', wav_path,
                    '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'
                ], capture_output=True, text=True, check=True)
                dur = float(res.stdout.strip())
                stem_durations[tag] = dur
                print(f"  [{tag}] {dur:.2f}s: {text[:45]}...")
                success = True
                break
        except Exception as e:
            print(f"  Attempt {attempt+1} error for {tag}: {e}")
            time.sleep(1.5)
            
    if not success:
        print(f"Failed generating stem {tag}")
        exit(1)

print("\nAll desert stems generated successfully!")
print("Stem durations:", stem_durations)

# Save durations to a json file for master mixing
with open(f"{STEM_DIR}/durations.json", "w") as f:
    json.dump(stem_durations, f, indent=2)
