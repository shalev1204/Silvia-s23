import os
import json
import urllib.request
import base64
import subprocess
import time

key_path = os.path.expanduser("~/.gemini_api_key")
with open(key_path, "r") as f:
    api_key = f.read().strip()

STEM_DIR = "assets/constellation/radio-transmission/audio/stems_gemini"
os.makedirs(STEM_DIR, exist_ok=True)

lines = [
    ("r1", "Silvia! Silvia, can you hear me? The channel is barely holding together..."),
    ("r2", "You did it. The Celestial Flower awakened. You aligned the stars, you proved yourself..."),
    ("r3", "...but the celestial flare was too bright. It gave away my sanctuary. They breached the observatory."),
    ("r4", "I survived... but they broke into the central chamber. They stole the Astrolabe of Distant Light."),
    ("r5", "Without it, the final coordinates cannot be charted. And if they decipher it first, the Order falls."),
    ("r6", "Listen to me: We are going to take it back. You and I. I have encoded the recovery protocols into a physical journal."),
    ("r7", "The journal is already traveling to you in Italy. When it finds your hands, open page one."),
    ("r8", "Keep watch on the deep sky, Silvia. The hunt begins now.")
]

voice = "Fenrir"  # Intense, gravelly, dramatic male voice
model = "gemini-2.5-flash-preview-tts"

print(f"Generating 8 voice stems with {voice} using {model}...")

for tag, text in lines:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
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
        headers={"Content-Type": "application/json"}
    )
    
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
                
                # Get duration
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
        print(f"FAILED to generate {tag}")
        exit(1)

print("\nAll 8 stems generated successfully with Google Gemini TTS!")
