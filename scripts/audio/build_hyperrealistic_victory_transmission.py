#!/usr/bin/env python3
"""
THE ECLIPSE ORDER · STATION 08: HYPERREALISTIC VICTORY RADIO MASTER
Builds the final cinematic transmission for The Midnight Calibration (The Desert Oracle Dispatch 08-B).
Features:
- Google AI Studio Gemini TTS ('Fenrir') with exhausted, weathered delivery and breathing pauses
- Recycled foley from previous transmissions (breathing, gravel footsteps, rock impacts)
- Apocalyptic storm ambience (violent winds, deep tectonic sand dune rumbles, lightning arcs)
- Tactical transceiver bandpass, tube compression, and RF carrier dropouts
"""

import os
import sys
import json
import base64
import time
import wave
import urllib.request
import subprocess
import numpy as np

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    key_path = os.path.expanduser("~/.gemini_api_key")
    if not os.path.exists(key_path):
        sys.exit("Error: set GEMINI_API_KEY or create ~/.gemini_api_key (never commit it).")
    with open(key_path, "r") as f:
        API_KEY = f.read().strip()

BASE_DIR = "web/constellation/midnight-calibration/audio"
STEMS_DIR = os.path.join(BASE_DIR, "stems_victory_pro")
FOLEY_DIR = os.path.join(BASE_DIR, "foley_gen")
os.makedirs(STEMS_DIR, exist_ok=True)
os.makedirs(FOLEY_DIR, exist_ok=True)

OUT_MP3 = os.path.join(BASE_DIR, "cartographer_tempest_victory.mp3")

# Recycled assets from Station 01 / previous transmissions
RECYCLED_DIR = "assets/constellation/radio-transmission/audio"
FOOTSTEPS_WAV = os.path.join(RECYCLED_DIR, "footsteps_running.wav")
BREATHING_WAV = os.path.join(RECYCLED_DIR, "breathing_running.wav")
IMPACTS_WAV = os.path.join(RECYCLED_DIR, "violent_impacts.wav")

SR = 44100

# 7 Master Dramatic Stems with emotional punctuation for exhausted delivery
VICTORY_LINES = [
    ("v1", "Silvia...! Silvia, do you copy me? The signal... it punched through the electrostatic gale!"),
    ("v2", "Two thousand and ninety light-years... the celestial hexagon... anchored between Achernar and Polaris! By the stars, you have done it!"),
    ("v3", "The storm is tearing the world apart out here! The winds are shifting entire mountains of stone and sand!"),
    ("v4", "All previous maps of the desert are dead paper now. The crescent dunes have slid miles south, ancient ravines are buried, and the raiders are as lost and stranded as we are in this shifting sea."),
    ("v5", "We lost their trail, but we hold the three stellar constants! In the deep desert, beyond the moved dunes, dwells the only ancient soul who can read the shifted sands: The Desert Oracle."),
    ("v6", "When this tempest subsides, we will navigate by your three chords directly to the Oracle's sanctuary!"),
    ("v7", "Record every number in your Ledger, Silvia. Rest now while the winds blow. The Desert Path awaits us. Stay safe. Out.")
]

MODEL = "gemini-2.5-flash-preview-tts"
VOICE = "Fenrir"

def generate_voice_stems():
    print(f"\n1. Generating {len(VICTORY_LINES)} exhausted Cartographer stems via Google AI Studio ({MODEL}, Voice: {VOICE})...")
    stem_durations = {}
    
    for tag, text in VICTORY_LINES:
        pcm_path = os.path.join(STEMS_DIR, f"{tag}.pcm")
        wav_path = os.path.join(STEMS_DIR, f"{tag}.wav")
        
        if os.path.exists(wav_path) and os.path.getsize(wav_path) > 5000:
            res = subprocess.run([
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", wav_path
            ], capture_output=True, text=True, check=True)
            dur = float(res.stdout.strip())
            stem_durations[tag] = dur
            print(f"  [CACHE] Stem {tag} ({dur:.2f}s): {text[:55]}...")
            continue
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
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
            headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY}
        )
        
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=25) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    part = data["candidates"][0]["content"]["parts"][0]
                    pcm_data = base64.b64decode(part["inlineData"]["data"])
                    
                    with open(pcm_path, "wb") as f_out:
                        f_out.write(pcm_data)
                    
                    # Convert raw 24kHz PCM to 44.1kHz WAV
                    subprocess.run([
                        "ffmpeg", "-y",
                        "-f", "s16le", "-ar", "24000", "-ac", "1",
                        "-i", pcm_path,
                        "-ar", str(SR),
                        wav_path
                    ], capture_output=True, check=True)
                    
                    res = subprocess.run([
                        "ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", wav_path
                    ], capture_output=True, text=True, check=True)
                    
                    dur = float(res.stdout.strip())
                    stem_durations[tag] = dur
                    print(f"  ✓ [{tag}] ({dur:.2f}s): {text[:55]}...")
                    break
            except Exception as e:
                print(f"  Attempt {attempt+1} failed for {tag}: {e}")
                time.sleep(2)
        else:
            print(f"ERROR: Failed to generate stem {tag}")
            sys.exit(1)
            
    return stem_durations

def synthesize_raging_storm(total_duration, out_wind, out_thunder, out_sand):
    print(f"\n2. Synthesizing raging storm foley ({total_duration:.1f}s)...")
    n_samples = int(SR * total_duration)
    t = np.linspace(0, total_duration, n_samples, endpoint=False)
    
    # A. Violent Howling Gale
    print("  Synthesizing howling desert hurricane wind...")
    white = np.random.normal(0, 1.0, n_samples).astype(np.float32)
    
    # Multi-layered wind: deep sub rumble + howling whistling mid frequencies
    w_low = int(SR / 140)
    low_roar = np.convolve(white, np.ones(w_low, dtype=np.float32) / w_low, mode='same')
    
    w_mid = int(SR / 750)
    mid_whistle = np.convolve(white, np.ones(w_mid, dtype=np.float32) / w_mid, mode='same') - low_roar
    
    # Dramatic wind gust envelope
    gust_env = (np.sin(2 * np.pi * 0.08 * t) * 0.4 +
                np.sin(2 * np.pi * 0.18 * t + 1.5) * 0.35 +
                np.sin(2 * np.pi * 0.03 * t + 3.0) * 0.25 + 1.0)
    gust_env = np.clip(gust_env, 0.3, 2.0)
    
    wind = (low_roar * 2.2 + mid_whistle * 1.6) * gust_env * 0.45
    # Stereo panning
    pan = np.sin(2 * np.pi * 0.06 * t) * 0.3
    wind_l = wind * (0.5 - pan)
    wind_r = wind * (0.5 + pan)
    stereo_wind = np.vstack([wind_l, wind_r]).T
    stereo_wind = stereo_wind / (np.max(np.abs(stereo_wind)) + 1e-6) * 0.88
    
    with wave.open(out_wind, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((stereo_wind * 32767).astype(np.int16).tobytes())
        
    # B. Tectonic Sand Dune Rumbles & Thunder
    print("  Synthesizing tectonic dune shifts and distant thunder...")
    thunder = np.zeros(n_samples, dtype=np.float32)
    events = [
        (2.5, 7.0, 0.8),
        (15.0, 9.0, 1.1),  # Dune collapse
        (28.0, 10.0, 1.3), # Sand mountains shifting
        (45.0, 8.5, 0.95),
        (60.0, 9.0, 0.85)
    ]
    for ev_t, ev_dur, ev_amp in events:
        if ev_t >= total_duration:
            continue
        ev_samples = int(SR * ev_dur)
        tt = np.linspace(0, ev_dur, ev_samples, endpoint=False)
        env = np.exp(-tt * 0.45) * (1.0 - np.exp(-tt * 6.0))
        noise = np.random.normal(0, 1.0, ev_samples).astype(np.float32)
        w_sub = int(SR / 65)
        sub_body = np.convolve(noise, np.ones(w_sub, dtype=np.float32) / w_sub, mode='same')
        st_idx = int(ev_t * SR)
        end_idx = min(n_samples, st_idx + ev_samples)
        valid_len = end_idx - st_idx
        thunder[st_idx:end_idx] += sub_body[:valid_len] * env[:valid_len] * ev_amp * 2.8
        
    thunder = thunder / (np.max(np.abs(thunder)) + 1e-6) * 0.82
    with wave.open(out_thunder, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((thunder * 32767).astype(np.int16).tobytes())
        
    # C. Sand Grains Pelting against the Fissure Rock
    print("  Synthesizing sand shingle pelting against rock...")
    sand = np.random.normal(0, 1.0, n_samples).astype(np.float32)
    # High frequency hiss and clicks (3500-9000 Hz)
    w_sand = int(SR / 4200)
    sand_high = sand - np.convolve(sand, np.ones(w_sand, dtype=np.float32) / w_sand, mode='same')
    sand_grain = sand_high * (np.sin(2 * np.pi * 0.15 * t) * 0.4 + 0.6) * 0.28
    sand_grain = np.clip(sand_grain, -0.9, 0.9)
    with wave.open(out_sand, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((sand_grain * 32767).astype(np.int16).tobytes())

def mix_master(stem_durations):
    print("\n3. Compositing Multi-Layer Master with Recycled Foley & Mil-Spec RF Transceiver...")
    
    stems = [os.path.join(STEMS_DIR, f"{tag}.wav") for tag, _ in VICTORY_LINES]
    
    # Calculate timeline with natural breath/gasp gaps between lines
    cur_t = 1.2 # Initial squelch buffer
    delays_ms = []
    timed_lines = []
    
    for tag, text in VICTORY_LINES:
        dur = stem_durations[tag]
        delays_ms.append(int(cur_t * 1000))
        timed_lines.append({"t": round(cur_t, 2), "dur": round(dur, 2), "text": text})
        cur_t += dur + 1.15 # breathing gap
        
    total_dur = round(cur_t + 2.2, 1)
    print(f"  Calculated Master Length: {total_dur}s")
    
    # Storm foley paths
    out_wind = os.path.join(FOLEY_DIR, "master_vic_wind.wav")
    out_thun = os.path.join(FOLEY_DIR, "master_vic_thun.wav")
    out_sand = os.path.join(FOLEY_DIR, "master_vic_sand.wav")
    synthesize_raging_storm(total_dur, out_wind, out_thun, out_sand)
    
    # Tactical Mil-Spec Transceiver Voice Filter:
    # 260Hz highpass, 4200Hz lowpass, warm presence boost at 2.4kHz, aggressive dynamic compression
    v_filt = "highpass=f=260,lowpass=f=4200,equalizer=f=2400:width_type=o:w=1.2:g=4.2,acompressor=threshold=-16dB:ratio=4:attack=5:release=70,volume=3.8"
    
    inputs = []
    for s in stems:
        inputs.extend(["-i", s])
        
    # Foley inputs
    inputs.extend(["-i", out_wind])        # idx 7
    inputs.extend(["-i", out_thun])        # idx 8
    inputs.extend(["-i", out_sand])        # idx 9
    
    # Recycled real audio inputs
    inputs.extend(["-i", BREATHING_WAV])   # idx 10
    inputs.extend(["-i", IMPACTS_WAV])     # idx 11
    inputs.extend(["-i", FOOTSTEPS_WAV])   # idx 12
    
    filter_parts = []
    mix_sources = []
    
    # Apply delay, voice filter, and REALISTIC RADIO CONNECTION FAILURES
    for idx, (tag, text) in enumerate(VICTORY_LINES):
        d_ms = delays_ms[idx]
        st_sec = d_ms / 1000.0
        
        # Connection dropouts at high-stress moments:
        if tag == "v3":
            # Glitch during "shifting entire mountains"
            d_st = st_sec + 2.8
            d_ed = st_sec + 3.4
            filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt},volume=enable='between(t,{d_st},{d_ed})':volume=0.12[v{idx}];")
        elif tag == "v4":
            # Severe electrostatic dropout during "dead paper now"
            d_st = st_sec + 1.8
            d_ed = st_sec + 2.4
            filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt},volume=enable='between(t,{d_st},{d_ed})':volume=0.08[v{idx}];")
        elif tag == "v5":
            # Signal stutter
            d_st = st_sec + 4.2
            d_ed = st_sec + 4.6
            filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt},volume=enable='between(t,{d_st},{d_ed})':volume=0.15[v{idx}];")
        else:
            filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt}[v{idx}];")
            
        mix_sources.append(f"[v{idx}]")
        
    f_idx = len(stems)
    # Storm wind
    filter_parts.append(f"[{f_idx}:a]volume=0.92[wind];")
    mix_sources.append("[wind]")
    # Tectonic thunder / dune rumbles
    filter_parts.append(f"[{f_idx+1}:a]volume=1.25[thun];")
    mix_sources.append("[thun]")
    # Sand shingle pelting
    filter_parts.append(f"[{f_idx+2}:a]volume=0.78[sand];")
    mix_sources.append("[sand]")
    
    # Recycled real human breathing (re-timed and layered)
    filter_parts.append(f"[{f_idx+3}:a]atrim=0:{total_dur},volume=0.72,highpass=f=200,lowpass=f=3600[recycled_breath];")
    mix_sources.append("[recycled_breath]")
    
    # Recycled stone impacts / shelter thuds
    filter_parts.append(f"[{f_idx+4}:a]atrim=0:{total_dur},volume=0.65,adelay=4000|4000[recycled_impacts];")
    mix_sources.append("[recycled_impacts]")
    
    # Squelch tones at start (heterodyne burst)
    filter_parts.append("sine=f=880:d=0.09,adelay=250|250,volume=0.35[chirp1];")
    mix_sources.append("[chirp1]")
    filter_parts.append("sine=f=1450:d=0.14,adelay=360|360,volume=0.30[chirp2];")
    mix_sources.append("[chirp2]")
    
    # Background RF static carrier hiss
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.014,highpass=f=260,lowpass=f=4200,volume=1.35[rf_hiss];")
    mix_sources.append("[rf_hiss]")
    
    # Electrostatic static bursts during dropouts
    filter_parts.append(f"anoisesrc=d={total_dur}:c=white:r=44100:a=0.12,bandpass=f=1800:width_type=h:w=1000,"
                        f"volume=enable='between(t,18.0,18.8)+between(t,29.5,30.3)+between(t,51.0,51.6)':volume=3.2:eval=frame[rf_dropouts];")
    mix_sources.append("[rf_dropouts]")
    
    # Roger beep at end
    roger_ms = int((total_dur - 1.2) * 1000)
    filter_parts.append(f"sine=f=1050:d=0.25,adelay={roger_ms}|{roger_ms},volume=0.32[rogerbeep];")
    mix_sources.append("[rogerbeep]")
    
    all_mix = "".join(mix_sources)
    num_inputs = len(mix_sources)
    
    filter_parts.append(f"{all_mix}amix=inputs={num_inputs}:duration=longest:dropout_transition=2,"
                        f"atrim=0:{total_dur},"
                        f"volume=4.8,"
                        f"alimiter=limit=0.96[out]")
                        
    filter_str = "".join(filter_parts)
    
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_str,
        "-map", "[out]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        OUT_MP3
    ]
    
    print("  Running FFmpeg multi-track composite master...")
    subprocess.run(cmd, check=True)
    
    size_kb = os.path.getsize(OUT_MP3) / 1024
    print(f"\n✓ Master Victory Transmission Created: {OUT_MP3}")
    print(f"  Total Duration: {total_dur}s, File Size: {size_kb:.1f} KB")
    
    # Save timestamps for web synchronizer
    ts_file = os.path.join(BASE_DIR, "victory_timestamps.json")
    with open(ts_file, "w") as f:
        json.dump(timed_lines, f, indent=2)
    print(f"✓ Saved precise teletype timestamps to {ts_file}")
    
    return timed_lines

def main():
    durations = generate_voice_stems()
    timed_lines = mix_master(durations)
    print("\n=======================================================")
    print("  STATION 08 VICTORY TRANSMISSION FULLY COMPILED!")
    print("=======================================================")

if __name__ == "__main__":
    main()
