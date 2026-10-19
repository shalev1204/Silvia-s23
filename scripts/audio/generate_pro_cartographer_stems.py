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

STEM_DIR = "assets/constellation/radio-transmission/audio/stems_pro_achernar"
os.makedirs(STEM_DIR, exist_ok=True)

# Punctuation and rhythm engineered for breathless, running, high-adrenaline delivery
lines = [
    ("r1", "Silvia...! Silvia, can you hear me?! The channel... it's barely holding together...!"),
    ("r2", "You did it! The Celestial Flower awakened! You aligned the stars, you proved yourself...!"),
    ("r3", "...but the celestial flare was too bright! It gave away my sanctuary... They breached the observatory!"),
    ("r4", "I survived... but they broke into the central chamber! They stole the Astrolabe of Distant Light!"),
    ("r5", "Without it, the final coordinates cannot be charted! And if they decipher it first... the Order falls!"),
    ("r6", "Listen to me! We are going to take it back! You and I! I encoded the recovery protocols into a physical journal..."),
    ("r7", "The journal is already traveling to you in Italy... When it finds your hands, open page one!"),
    ("r8", "Keep watch on the deep sky, Silvia! The hunt... the hunt begins now!")
]

voice = "achernar"  # Deepest, mature 55-60yo weathered male voice (F0 ~93Hz)
model = "gemini-2.5-pro-preview-tts"

print(f"Generating 8 breathless pro stems with voice '{voice}' on '{model}'...")

for tag, text in lines:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}
        }
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json", "x-goog-api-key": api_key})
    
    success = False
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req) as resp:
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
                
                # Check duration
                dur_res = subprocess.run([
                    '/opt/homebrew/bin/ffmpeg', '-i', wav_out
                ], capture_output=True, text=True)
                dur_str = "unknown"
                for line in dur_res.stderr.split('\n'):
                    if "Duration" in line:
                        dur_str = line.strip()
                
                print(f"  [{tag}] Generated {wav_out} - {dur_str}")
                success = True
                break
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {tag}: {e}")
            time.sleep(1)
            
    if not success:
        print(f"Failed to generate {tag}")
        exit(1)

print("\nAll 8 Pro Achernar stems generated successfully!")
