import os
import json
import urllib.request
import base64
import subprocess

key_path = os.path.expanduser("~/.gemini_api_key")
with open(key_path, "r") as f:
    api_key = f.read().strip()

OUT_DIR = "assets/constellation/radio-transmission/audio/pursuers_loud"
os.makedirs(OUT_DIR, exist_ok=True)

shouts = [
    ("shout1", "alnilam", "He's down in the vaults! Kill him!"),
    ("shout2", "gacrux", "Fire! Don't let him reach the comms!"),
    ("shout3", "alnilam", "Blow the hinges! Breach that door now!"),
    ("shout4", "gacrux", "There he is! Get him!")
]

for tag, voice, text in shouts:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent?key={api_key}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}
        }
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            part = data["candidates"][0]["content"]["parts"][0]
            pcm = base64.b64decode(part["inlineData"]["data"])
            pcm_path = f"{OUT_DIR}/{tag}.pcm"
            wav_path = f"{OUT_DIR}/{tag}.wav"
            with open(pcm_path, "wb") as f:
                f.write(pcm)
            # Loud, punchy stone hallway echo (not muffled, clearly audible!)
            subprocess.run([
                '/opt/homebrew/bin/ffmpeg', '-y',
                '-f', 's16le', '-ar', '24000', '-ac', '1',
                '-i', pcm_path,
                '-af', 'highpass=f=250,lowpass=f=3800,aecho=0.8:0.75:35|70:0.35|0.2,volume=1.8',
                wav_path
            ], capture_output=True, check=True)
            print(f"Loud pursuer shout generated: {wav_path}")
    except Exception as e:
        print(f"Error {tag}: {e}")
