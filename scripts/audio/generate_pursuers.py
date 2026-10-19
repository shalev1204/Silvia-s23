import os
import sys
import json
import urllib.request
import base64
import subprocess

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    key_path = os.path.expanduser("~/.gemini_api_key")
    if not os.path.exists(key_path):
        sys.exit("Error: set GEMINI_API_KEY or create ~/.gemini_api_key (never commit it).")
    with open(key_path, "r") as f:
        api_key = f.read().strip()

OUT_DIR = "assets/constellation/radio-transmission/audio/pursuers"
os.makedirs(OUT_DIR, exist_ok=True)

pursuer_lines = [
    ("pursuer1", "alnilam", "Move, move! Search the lower vaults!"),
    ("pursuer2", "fenrir", "Down that corridor! Don't let him reach the relay!"),
    ("pursuer3", "rasalgethi", "He's in the catacombs! Cut him off!"),
    ("pursuer4", "gacrux", "There he is! Breach that door!")
]

for tag, voice, text in pursuer_lines:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}
        }
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json", "x-goog-api-key": api_key})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            part = data["candidates"][0]["content"]["parts"][0]
            pcm = base64.b64decode(part["inlineData"]["data"])
            pcm_path = f"{OUT_DIR}/{tag}.pcm"
            wav_path = f"{OUT_DIR}/{tag}.wav"
            with open(pcm_path, "wb") as f:
                f.write(pcm)
            # Convert to wav with distant corridor reverb and lowpass
            subprocess.run([
                '/opt/homebrew/bin/ffmpeg', '-y',
                '-f', 's16le', '-ar', '24000', '-ac', '1',
                '-i', pcm_path,
                '-af', 'highpass=f=220,lowpass=f=2400,aecho=0.8:0.85:50|100|180:0.4|0.3|0.2',
                wav_path
            ], capture_output=True, check=True)
            print(f"Pursuer shout generated: {wav_path}")
    except Exception as e:
        print(f"Error {tag}: {e}")
