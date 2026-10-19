#!/usr/bin/env python3
"""
THE ECLIPSE ORDER · STATION 08: THE SHIFTING TEMPEST RADIO MASTER
High-Fidelity Military Transceiver Audio Generator with Cartographer Voice & Atmospheric Storm Foley

Features:
1. Cartographer Dramatic Voice via Google AI Studio Gemini TTS ('Fenrir' voice)
2. Tactical Bandpass Voice Filtering (260Hz - 4000Hz, aggressive compression, warm saturation)
3. Radio Carrier Squelch Chirps & Roger Beeps
4. Realistic Connection Failures & Electrostatic Dropouts
5. Multi-Layer Tempest Foley: Hurricane Wind Gusts, Deep Thunder Rumbles, Lightning Zaps, Flying Sand Shingle
"""

import os
import sys
import json
import base64
import time
import urllib.request
import subprocess

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    KEY_PATH = os.path.expanduser("~/.gemini_api_key")
    if os.path.exists(KEY_PATH):
        with open(KEY_PATH, "r") as f:
            API_KEY = f.read().strip()
    else:
        print("Error: GEMINI_API_KEY environment variable or ~/.gemini_api_key required!", file=sys.stderr)
        sys.exit(1)

BASE_AUDIO_DIR = "web/constellation/midnight-calibration/audio"
STEMS_DIR = os.path.join(BASE_AUDIO_DIR, "stems")
os.makedirs(STEMS_DIR, exist_ok=True)

ALERT_STEMS = [
    ("a1", "Silvia! Silvia, do you copy me? It is the Cartographer."),
    ("a2", "Your ninety-seven degree Vega calibration was absolute perfection—the vault aperture sparked into life!"),
    ("a3", "But the southern mountain pass has just erupted! Look to the horizon!"),
    ("a4", "The barometers plummeted in seconds. It is the Shifting Tempest."),
    ("a5", "A colossal wall of copper sand and violet lightning is tearing across the foothills at terrifying speed!"),
    ("a6", "We have completely lost the raiders' trail! The swirling sands have erased their wagon tracks, their campfires, and every trace into the deep dunes."),
    ("a7", "I am forced into a narrow sandstone crevice to keep from being thrown from the crags!"),
    ("a8", "The electrostatic storm will collapse our radio carrier in fifteen minutes! Before the signal dies, we must transmit the nocturnal star transit vectors from Sheet Six, Side B."),
    ("a9", "Solve the six chords in your journal before darkness takes the wire! Stay safe! Out!")
]

VICTORY_STEMS = [
    ("v1", "Silvia! Signal received loud and clear through the electrostatic gale!"),
    ("v2", "Two thousand and ninety light-years... the celestial hexagon... anchored between Achernar and Polaris! You have done it!"),
    ("v3", "The storm is now raging outside with apocalyptic fury. The winds are shifting entire mountains of sand!"),
    ("v4", "All previous maps of the desert are now dead paper. The crescent dunes have slid miles south, ancient ravines are buried, and the raiders are now as lost and stranded as we are in this shifting sea."),
    ("v5", "We have lost their trail, but we hold the three stellar constants! In the deep desert, beyond the moved dunes, dwells the only ancient soul who can read the shifted sands: The Desert Oracle."),
    ("v6", "When this tempest subsides, we will navigate by these three chords directly to the Oracle's sanctuary."),
    ("v7", "Rest now, Silvia, while the winds blow. The Desert Path awaits us. Stay safe. Out.")
]

MODEL = "gemini-2.5-flash-preview-tts"
VOICE = "Fenrir"

def generate_voice_stem(tag, text):
    wav_out = os.path.join(STEMS_DIR, f"{tag}.wav")
    if os.path.exists(wav_out) and os.path.getsize(wav_out) > 5000:
        print(f"  [CACHE] Stem {tag} exists.")
        return wav_out

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": VOICE
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
    
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                part = data["candidates"][0]["content"]["parts"][0]
                pcm_data = base64.b64decode(part["inlineData"]["data"])
                
                raw_pcm = os.path.join(STEMS_DIR, f"{tag}.pcm")
                with open(raw_pcm, "wb") as f_pcm:
                    f_pcm.write(pcm_data)
                
                subprocess.run([
                    "ffmpeg", "-y",
                    "-f", "s16le", "-ar", "24000", "-ac", "1",
                    "-i", raw_pcm,
                    wav_out
                ], capture_output=True, check=True)
                
                os.remove(raw_pcm)
                print(f"  [OK] Generated {tag}: {text[:40]}...")
                return wav_out
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {tag}: {e}")
            time.sleep(2)
            
    raise RuntimeError(f"Failed to generate {tag}")

def get_duration(wav_path):
    res = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", wav_path
    ], capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def build_alert_transmission():
    print("\n--- 1. Generating Alert Voice Stems ---")
    stems = []
    durations = []
    for tag, text in ALERT_STEMS:
        w = generate_voice_stem(tag, text)
        d = get_duration(w)
        stems.append(w)
        durations.append(d)
        time.sleep(0.3)

    print("\n--- 2. Mixing Master Alert Radio Transmission ---")
    out_mp3 = os.path.join(BASE_AUDIO_DIR, "cartographer_tempest_alert.mp3")
    
    # Calculate timeline with natural speech pauses and connection dropouts
    # We will build exact timestamps for teletype subtitles
    timestamps = []
    current_time = 1.0  # start after initial squelch chirp
    
    # Voice filter: mil-spec tactical transceiver
    v_filt = "highpass=f=260,lowpass=f=4200,acompressor=threshold=-15dB:ratio=4:attack=5:release=70,volume=2.3"
    
    filter_parts = []
    inputs = []
    
    for idx, stem in enumerate(stems):
        inputs.extend(["-i", stem])
        delay_ms = int(current_time * 1000)
        timestamps.append({"t": round(current_time, 2), "text": ALERT_STEMS[idx][1]})
        
        # In shot 6 (lost raiders trail) and shot 8 (electrostatic storm), simulate violent interference dropout
        if idx == 5:
            # Dropout glitch during sentence
            filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt},volume=enable='between(t,{current_time+2.8},{current_time+3.2})':volume=0.1[v{idx}];")
        elif idx == 7:
            # Radio carrier static sputter
            filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt},volume=enable='between(t,{current_time+3.5},{current_time+3.9})':volume=0.15[v{idx}];")
        else:
            filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt}[v{idx}];")
            
        current_time += durations[idx] + 0.85  # breath and radio gap
    
    total_dur = round(current_time + 2.0, 1)
    
    # Synthesize Foley & Atmosphere Inputs
    # Radio squelch chirps at start (300ms, 450ms)
    filter_parts.append(f"sine=f=820:d=0.08,adelay=250|250,volume=0.3[chirp1];")
    filter_parts.append(f"sine=f=1280:d=0.12,adelay=350|350,volume=0.25[chirp2];")
    
    # Roger beep at end
    roger_time_ms = int((total_dur - 1.2) * 1000)
    filter_parts.append(f"sine=f=1050:d=0.25,adelay={roger_time_ms}|{roger_time_ms},volume=0.28[rogerbeep];")
    
    # Pink noise: Tactical radio carrier hiss + howling storm wind
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.012,highpass=f=300,lowpass=f=3800[radio_hiss];")
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.18,bandpass=f=420:width_type=h:w=260,volume=0.75[storm_wind];")
    
    # Brown noise: Deep mountain earthquake / sand dune rumble
    filter_parts.append(f"anoisesrc=d={total_dur}:c=brown:r=44100:a=0.22,lowpass=f=140,volume=1.1[sub_rumble];")
    
    # Static bursts during connection failures (at 28s and 46s)
    filter_parts.append(f"anoisesrc=d={total_dur}:c=white:r=44100:a=0.08,bandpass=f=1800:width_type=h:w=1200,"
                        f"volume=enable='between(t,29.5,30.3)+between(t,47.0,47.8)':volume=2.2:eval=frame[static_bursts];")
    
    # Lightning crackle at 18s and 37s
    filter_parts.append(f"anoisesrc=d={total_dur}:c=white:r=44100:a=0.12,highpass=f=2200,"
                        f"volume=enable='between(t,18.2,18.6)+between(t,37.1,37.6)':volume=1.8:eval=frame[lightning_zaps];")
    
    # Mix all inputs
    mix_sources = "".join([f"[v{i}]" for i in range(len(stems))]) + "[chirp1][chirp2][rogerbeep][radio_hiss][storm_wind][sub_rumble][static_bursts][lightning_zaps]"
    num_inputs = len(stems) + 8
    
    filter_parts.append(f"{mix_sources}amix=inputs={num_inputs}:duration=first:dropout_transition=1,"
                        f"dynaudnorm=f=120:g=15,"
                        f"volume=1.4[out]")
    
    filter_str = "".join(filter_parts)
    
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_str,
        "-map", "[out]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        out_mp3
    ]
    
    subprocess.run(cmd, check=True)
    print(f"Alert Master Created: {out_mp3} ({os.path.getsize(out_mp3)} bytes, duration ~{total_dur}s)")
    return timestamps

def build_victory_transmission():
    print("\n--- 3. Generating Victory Voice Stems ---")
    stems = []
    durations = []
    for tag, text in VICTORY_STEMS:
        w = generate_voice_stem(tag, text)
        d = get_duration(w)
        stems.append(w)
        durations.append(d)
        time.sleep(0.3)

    print("\n--- 4. Mixing Master Victory Radio Transmission ---")
    out_mp3 = os.path.join(BASE_AUDIO_DIR, "cartographer_tempest_victory.mp3")
    
    timestamps = []
    current_time = 1.0
    v_filt = "highpass=f=260,lowpass=f=4200,acompressor=threshold=-15dB:ratio=4:attack=5:release=70,volume=2.3"
    
    filter_parts = []
    inputs = []
    
    for idx, stem in enumerate(stems):
        inputs.extend(["-i", stem])
        delay_ms = int(current_time * 1000)
        timestamps.append({"t": round(current_time, 2), "text": VICTORY_STEMS[idx][1]})
        filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt}[v{idx}];")
        current_time += durations[idx] + 0.9
        
    total_dur = round(current_time + 2.0, 1)
    
    filter_parts.append(f"sine=f=820:d=0.08,adelay=250|250,volume=0.3[chirp1];")
    filter_parts.append(f"sine=f=1280:d=0.12,adelay=350|350,volume=0.25[chirp2];")
    
    roger_time_ms = int((total_dur - 1.2) * 1000)
    filter_parts.append(f"sine=f=1050:d=0.25,adelay={roger_time_ms}|{roger_time_ms},volume=0.28[rogerbeep];")
    
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.010,highpass=f=300,lowpass=f=3800[radio_hiss];")
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.15,bandpass=f=450:width_type=h:w=280,volume=0.65[storm_wind];")
    filter_parts.append(f"anoisesrc=d={total_dur}:c=brown:r=44100:a=0.18,lowpass=f=140,volume=0.9[sub_rumble];")
    
    mix_sources = "".join([f"[v{i}]" for i in range(len(stems))]) + "[chirp1][chirp2][rogerbeep][radio_hiss][storm_wind][sub_rumble]"
    num_inputs = len(stems) + 6
    
    filter_parts.append(f"{mix_sources}amix=inputs={num_inputs}:duration=first:dropout_transition=1,"
                        f"dynaudnorm=f=120:g=15,"
                        f"volume=1.4[out]")
                        
    filter_str = "".join(filter_parts)
    
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_str,
        "-map", "[out]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        out_mp3
    ]
    subprocess.run(cmd, check=True)
    print(f"Victory Master Created: {out_mp3} ({os.path.getsize(out_mp3)} bytes, duration ~{total_dur}s)")
    return timestamps

def main():
    print("=" * 65)
    print(" THE ECLIPSE ORDER · THE SHIFTING TEMPEST RADIO MASTER")
    print(" Google AI Studio Gemini TTS ('Fenrir') & Tactical Transceiver Mixing")
    print("=" * 65)
    
    alert_timestamps = build_alert_transmission()
    victory_timestamps = build_victory_transmission()
    
    ts_data = {
        "alert": alert_timestamps,
        "victory": victory_timestamps
    }
    
    out_json = os.path.join(BASE_AUDIO_DIR, "transmission_timestamps.json")
    with open(out_json, "w") as f:
        json.dump(ts_data, f, indent=2)
    print(f"\nTimestamps exported to {out_json}")

if __name__ == "__main__":
    main()
