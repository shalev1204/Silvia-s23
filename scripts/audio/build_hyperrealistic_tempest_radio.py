#!/usr/bin/env python3
"""
THE ECLIPSE ORDER · STATION 08: HYPER-REALISTIC TEMPEST RADIO MASTER GENERATOR
Synthesizes professional foley layers (howling wind, rolling thunderclaps, lightning arcs,
pelting sand, tense breathing, radio carrier) and mixes them with the Cartographer's voice
(Fenrir) using tactical mil-spec transceiver bandpass, compression, and realistic connection dropouts.
"""

import os
import json
import wave
import numpy as np
import subprocess

BASE_DIR = "web/constellation/midnight-calibration/audio"
STEMS_DIR = os.path.join(BASE_DIR, "stems")
FOLEY_DIR = os.path.join(BASE_DIR, "foley_gen")
os.makedirs(FOLEY_DIR, exist_ok=True)

SR = 44100

def get_duration(wav_path):
    res = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", wav_path
    ], capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

# --------------------------------------------------------------------------
# 1. FOLEY SYNTHESIS (NumPy)
# --------------------------------------------------------------------------

def synthesize_tempest_foley(total_duration, out_wind, out_thunder, out_lightning, out_sand, out_breathing):
    print(f"Synthesizing high-fidelity Tempest Foley ({total_duration:.1f}s)...")
    n_samples = int(SR * total_duration)
    t = np.linspace(0, total_duration, n_samples, endpoint=False)
    
    # A. Multi-Band Howling Wind with Dynamic Gust Envelopes
    print("  Generating dynamic hurricane wind gusts...")
    wind_left = np.zeros(n_samples, dtype=np.float32)
    wind_right = np.zeros(n_samples, dtype=np.float32)
    
    # Gust modulation: low frequency waves (0.08 to 0.25 Hz)
    gust_lfo = (np.sin(2 * np.pi * 0.12 * t) * 0.35 +
                np.sin(2 * np.pi * 0.05 * t + 1.2) * 0.45 +
                np.sin(2 * np.pi * 0.22 * t + 2.5) * 0.20 + 1.0)
    gust_lfo = np.clip(gust_lfo, 0.2, 1.9)
    
    # White + pink noise for wind
    white = np.random.normal(0, 1.0, n_samples).astype(np.float32)
    
    # Moving average lowpass for deep wind roar (~120-250 Hz)
    w_low = int(SR / 180)
    low_roar = np.convolve(white, np.ones(w_low, dtype=np.float32)/w_low, mode='same')
    
    # Whistling high gusts (~600-1400 Hz)
    w_mid = int(SR / 850)
    mid_whistle = np.convolve(white, np.ones(w_mid, dtype=np.float32)/w_mid, mode='same') - low_roar
    
    # Apply gust envelopes
    wind_audio = (low_roar * 1.8 + mid_whistle * 1.2) * gust_lfo * 0.55
    # Stereo panning
    pan = np.sin(2 * np.pi * 0.07 * t) * 0.25
    wind_left = wind_audio * (0.5 - pan)
    wind_right = wind_audio * (0.5 + pan)
    
    wind_stereo = np.vstack([wind_left, wind_right]).T
    wind_stereo = wind_stereo / (np.max(np.abs(wind_stereo)) + 1e-6) * 0.85
    
    with wave.open(out_wind, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((wind_stereo * 32767).astype(np.int16).tobytes())

    # B. Rolling Thunderclaps & Deep Seismic Rumbles
    print("  Generating rolling thunderclaps and seismic sub-rumble...")
    thunder_audio = np.zeros(n_samples, dtype=np.float32)
    
    # Trigger major thunder events
    thunder_times = [
        # (time_sec, duration_sec, intensity)
        (3.5, 6.0, 0.7),
        (16.5, 7.5, 0.95),
        (28.0, 9.0, 1.2),   # Massive thunder when wall of sand hits
        (42.0, 7.0, 0.85),
        (56.0, 8.5, 1.1),   # Thunder during electrostatic storm alert
        (66.5, 6.5, 0.75)
    ]
    
    for th_t, th_dur, th_int in thunder_times:
        if th_t >= total_duration:
            continue
        th_samples = int(SR * th_dur)
        tt = np.linspace(0, th_dur, th_samples, endpoint=False)
        # Low frequency burst + long decaying rumble
        env = np.exp(-tt * 0.6) * (1.0 - np.exp(-tt * 8.0))
        th_noise = np.random.normal(0, 1.0, th_samples).astype(np.float32)
        w_sub = int(SR / 80)
        sub_body = np.convolve(th_noise, np.ones(w_sub, dtype=np.float32)/w_sub, mode='same')
        # Sub sine thump
        thump = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 1.8) * 0.6
        burst = (sub_body * 2.2 + thump) * env * th_int
        
        st = int(th_t * SR)
        ed = min(n_samples, st + len(burst))
        l = ed - st
        thunder_audio[st:ed] += burst[:l]
        
    thunder_audio = thunder_audio / (np.max(np.abs(thunder_audio)) + 1e-6) * 0.90
    with wave.open(out_thunder, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((thunder_audio * 32767).astype(np.int16).tobytes())

    # C. Violet Lightning Electrical Arcs & Zaps
    print("  Generating violet lightning electrical zaps...")
    lightning_audio = np.zeros(n_samples, dtype=np.float32)
    
    lightning_events = [
        # (time_sec, duration_sec, intensity)
        (15.8, 0.55, 0.8),
        (27.4, 0.85, 1.2),  # Sharp crack right before massive thunder at 28s
        (38.2, 0.45, 0.9),  # Causes radio dropout
        (55.2, 0.70, 1.1),  # Violet lightning arc
        (61.8, 0.50, 0.95)  # Second dropout zap
    ]
    
    for l_t, l_dur, l_int in lightning_events:
        if l_t >= total_duration:
            continue
        l_samples = int(SR * l_dur)
        lt = np.linspace(0, l_dur, l_samples, endpoint=False)
        # Sharp initial impulse + high frequency electrical buzz (800-4000 Hz)
        arc_env = np.exp(-lt * 9.0) * (lt / 0.005)
        arc_env = np.clip(arc_env, 0, 1)
        buzz = (np.sin(2 * np.pi * 1200 * lt) * 0.4 +
                np.sin(2 * np.pi * 2400 * lt) * 0.3 +
                np.random.normal(0, 0.6, l_samples).astype(np.float32))
        zap = buzz * arc_env * l_int
        
        st = int(l_t * SR)
        ed = min(n_samples, st + len(zap))
        l = ed - st
        lightning_audio[st:ed] += zap[:l]
        
    lightning_audio = lightning_audio / (np.max(np.abs(lightning_audio)) + 1e-6) * 0.85
    with wave.open(out_lightning, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((lightning_audio * 32767).astype(np.int16).tobytes())

    # D. Pelting Sand Grains & Abrasive Shingle
    print("  Generating pelting sand and abrasive grain sprays...")
    sand_audio = np.zeros(n_samples, dtype=np.float32)
    
    # Sand spray swells during wind peaks
    sand_noise = np.random.normal(0, 1.0, n_samples).astype(np.float32)
    w_sand = int(SR / 3200) # High-frequency grain noise
    sand_hiss = sand_noise - np.convolve(sand_noise, np.ones(w_sand, dtype=np.float32)/w_sand, mode='same')
    
    # Modulated by gust
    sand_audio = sand_hiss * (gust_lfo ** 1.6) * 0.35
    
    # Random sharp grain bursts hitting the transceiver casing
    for _ in range(int(total_duration * 12)):
        idx = np.random.randint(0, n_samples - 500)
        dur = np.random.randint(150, 450)
        sand_audio[idx:idx+dur] += (np.random.normal(0, 1.0, dur) * np.random.uniform(0.3, 0.8))
        
    sand_audio = sand_audio / (np.max(np.abs(sand_audio)) + 1e-6) * 0.75
    with wave.open(out_sand, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((sand_audio * 32767).astype(np.int16).tobytes())

    # E. Weathered Breathing & Shivering in Crevice
    print("  Generating crevice breathing & shivering foley...")
    breath_audio = np.zeros(n_samples, dtype=np.float32)
    
    # Breathing cycles: inhale (0.8s), exhale (1.2s), shivering flutter
    breath_cycles = [
        # (time_sec, inhale_dur, exhale_dur, intensity)
        (0.8, 0.7, 1.0, 0.6),
        (5.8, 0.8, 1.1, 0.7),
        (13.8, 0.9, 1.3, 0.8),
        (25.8, 0.9, 1.2, 0.85),
        (34.8, 1.0, 1.4, 0.9),
        (46.8, 0.9, 1.3, 0.8),
        (53.8, 0.8, 1.2, 0.75),
        (67.8, 0.8, 1.1, 0.65)
    ]
    
    for b_t, b_in, b_ex, b_int in breath_cycles:
        if b_t >= total_duration:
            continue
        tot_b = b_in + b_ex
        b_samples = int(SR * tot_b)
        bt = np.linspace(0, tot_b, b_samples, endpoint=False)
        # Inhale envelope (filtered pink noise)
        env_in = np.sin(np.pi * (bt / b_in)) * (bt < b_in)
        # Exhale envelope
        env_ex = np.sin(np.pi * ((bt - b_in) / b_ex)) * (bt >= b_in)
        b_noise = np.random.normal(0, 1.0, b_samples).astype(np.float32)
        # Lowpass ~600Hz for mouth breathing
        w_b = int(SR / 600)
        b_filt = np.convolve(b_noise, np.ones(w_b, dtype=np.float32)/w_b, mode='same')
        breath = b_filt * (env_in * 0.7 + env_ex * 0.9) * b_int
        
        st = int(b_t * SR)
        ed = min(n_samples, st + len(breath))
        l = ed - st
        breath_audio[st:ed] += breath[:l]
        
    breath_audio = breath_audio / (np.max(np.abs(breath_audio)) + 1e-6) * 0.65
    with wave.open(out_breathing, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((breath_audio * 32767).astype(np.int16).tobytes())

    print("Foley tracks generated successfully.")


# --------------------------------------------------------------------------
# 2. MASTER MIXER FOR ALERT & VICTORY
# --------------------------------------------------------------------------

def build_alert_master():
    print("\n=======================================================")
    print("  COMPOSITING STATION 08: ALERT RADIO MASTER (72s)")
    print("=======================================================")
    
    alert_lines = [
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
    
    stems = [os.path.join(STEMS_DIR, f"{tag}.wav") for tag, _ in alert_lines]
    durs = [get_duration(s) for s in stems]
    
    # Timeline calculation
    cur_t = 1.0  # start after tuning squelch
    timed_lines = []
    delays_ms = []
    
    for idx, (tag, text) in enumerate(alert_lines):
        timed_lines.append({"t": round(cur_t, 2), "text": text})
        delays_ms.append(int(cur_t * 1000))
        cur_t += durs[idx] + 0.85
        
    total_dur = round(cur_t + 1.8, 1)
    print(f"Total Alert Duration: {total_dur}s")
    
    # Synthesize Foley
    wind_wav = os.path.join(FOLEY_DIR, "alert_wind.wav")
    thunder_wav = os.path.join(FOLEY_DIR, "alert_thunder.wav")
    lightning_wav = os.path.join(FOLEY_DIR, "alert_lightning.wav")
    sand_wav = os.path.join(FOLEY_DIR, "alert_sand.wav")
    breath_wav = os.path.join(FOLEY_DIR, "alert_breathing.wav")
    synthesize_tempest_foley(total_dur, wind_wav, thunder_wav, lightning_wav, sand_wav, breath_wav)
    
    out_mp3 = os.path.join(BASE_DIR, "cartographer_tempest_alert.mp3")
    
    # Mil-Spec Voice Filter: Bandpass (240Hz-3800Hz) + Warm presence + punchy compression
    v_filt = "highpass=f=240,lowpass=f=4000,equalizer=f=240:width_type=o:w=1.2:g=3.8,equalizer=f=2200:width_type=o:w=1.2:g=4.5,acompressor=threshold=-18dB:ratio=4:attack=5:release=70,volume=4.2"
    
    inputs = []
    for s in stems:
        inputs.extend(["-i", s])
    inputs.extend(["-i", wind_wav])
    inputs.extend(["-i", thunder_wav])
    inputs.extend(["-i", lightning_wav])
    inputs.extend(["-i", sand_wav])
    inputs.extend(["-i", breath_wav])
    
    filter_parts = []
    mix_sources = []
    
    for idx, (tag, text) in enumerate(alert_lines):
        d_ms = delays_ms[idx]
        st_sec = timed_lines[idx]["t"]
        
        # Real connection failure / dropout:
        if tag == "a6":
            # Momentary carrier flutter & audio drop when describing lost trail
            d_st = st_sec + 3.2
            d_ed = st_sec + 3.7
            filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt},volume=enable='between(t,{d_st},{d_ed})':volume=0.12[v{idx}];")
        elif tag == "a8":
            # Severe electrostatic dropout during carrier collapse warning
            d_st = st_sec + 4.5
            d_ed = st_sec + 5.1
            filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt},volume=enable='between(t,{d_st},{d_ed})':volume=0.08[v{idx}];")
        else:
            filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt}[v{idx}];")
            
        mix_sources.append(f"[v{idx}]")
        
    f_idx = len(stems)
    # Wind (stereo to stereo)
    filter_parts.append(f"[{f_idx}:a]volume=0.85[wind];")
    mix_sources.append("[wind]")
    # Thunder
    filter_parts.append(f"[{f_idx+1}:a]volume=1.20[thun];")
    mix_sources.append("[thun]")
    # Lightning zaps
    filter_parts.append(f"[{f_idx+2}:a]volume=1.10[zap];")
    mix_sources.append("[zap]")
    # Sand pelting
    filter_parts.append(f"[{f_idx+3}:a]volume=0.75[sand];")
    mix_sources.append("[sand]")
    # Crevice breathing
    filter_parts.append(f"[{f_idx+4}:a]volume=0.65[breath];")
    mix_sources.append("[breath]")
    
    # Squelch chirps at start
    filter_parts.append("sine=f=840:d=0.09,adelay=250|250,volume=0.35[chirp1];")
    mix_sources.append("[chirp1]")
    filter_parts.append("sine=f=1320:d=0.14,adelay=360|360,volume=0.30[chirp2];")
    mix_sources.append("[chirp2]")
    
    # Radio carrier static floor
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.012,highpass=f=280,lowpass=f=4000,volume=1.2[radio_hiss];")
    mix_sources.append("[radio_hiss]")
    
    # Static bursts during connection failures (at dropout times: ~38.4s and ~62.0s)
    filter_parts.append(f"anoisesrc=d={total_dur}:c=white:r=44100:a=0.10,bandpass=f=1900:width_type=h:w=1100,"
                        f"volume=enable='between(t,38.2,39.0)+between(t,61.8,62.6)':volume=3.0:eval=frame[rf_bursts];")
    mix_sources.append("[rf_bursts]")
    
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
        out_mp3
    ]
    
    print("Running FFmpeg alert master mix...")
    subprocess.run(cmd, check=True)
    size_kb = os.path.getsize(out_mp3) / 1024
    print(f"Alert Master Created: {out_mp3} ({size_kb:.1f} KB, {total_dur}s)")
    return timed_lines


def build_victory_master():
    print("\n=======================================================")
    print("  COMPOSITING STATION 08: VICTORY RADIO MASTER (75s)")
    print("=======================================================")
    
    victory_lines = [
        ("v1", "Silvia! Signal received loud and clear through the electrostatic gale!"),
        ("v2", "Two thousand and ninety light-years... the celestial hexagon... anchored between Achernar and Polaris! You have done it!"),
        ("v3", "The storm is now raging outside with apocalyptic fury. The winds are shifting entire mountains of sand!"),
        ("v4", "All previous maps of the desert are now dead paper. The crescent dunes have slid miles south, ancient ravines are buried, and the raiders are now as lost and stranded as we are in this shifting sea."),
        ("v5", "We have lost their trail, but we hold the three stellar constants! In the deep desert, beyond the moved dunes, dwells the only ancient soul who can read the shifted sands: The Desert Oracle."),
        ("v6", "When this tempest subsides, we will navigate by these three chords directly to the Oracle's sanctuary."),
        ("v7", "Rest now, Silvia, while the winds blow. The Desert Path awaits us. Stay safe. Out.")
    ]
    
    stems = [os.path.join(STEMS_DIR, f"{tag}.wav") for tag, _ in victory_lines]
    durs = [get_duration(s) for s in stems]
    
    cur_t = 1.0
    timed_lines = []
    delays_ms = []
    
    for idx, (tag, text) in enumerate(victory_lines):
        timed_lines.append({"t": round(cur_t, 2), "text": text})
        delays_ms.append(int(cur_t * 1000))
        cur_t += durs[idx] + 0.90
        
    total_dur = round(cur_t + 1.8, 1)
    print(f"Total Victory Duration: {total_dur}s")
    
    wind_wav = os.path.join(FOLEY_DIR, "vic_wind.wav")
    thunder_wav = os.path.join(FOLEY_DIR, "vic_thunder.wav")
    lightning_wav = os.path.join(FOLEY_DIR, "vic_lightning.wav")
    sand_wav = os.path.join(FOLEY_DIR, "vic_sand.wav")
    breath_wav = os.path.join(FOLEY_DIR, "vic_breathing.wav")
    synthesize_tempest_foley(total_dur, wind_wav, thunder_wav, lightning_wav, sand_wav, breath_wav)
    
    out_mp3 = os.path.join(BASE_DIR, "cartographer_tempest_victory.mp3")
    
    v_filt = "highpass=f=240,lowpass=f=4000,equalizer=f=240:width_type=o:w=1.2:g=3.8,equalizer=f=2200:width_type=o:w=1.2:g=4.5,acompressor=threshold=-18dB:ratio=4:attack=5:release=70,volume=4.2"
    
    inputs = []
    for s in stems:
        inputs.extend(["-i", s])
    inputs.extend(["-i", wind_wav])
    inputs.extend(["-i", thunder_wav])
    inputs.extend(["-i", lightning_wav])
    inputs.extend(["-i", sand_wav])
    inputs.extend(["-i", breath_wav])
    
    filter_parts = []
    mix_sources = []
    
    for idx, (tag, text) in enumerate(victory_lines):
        d_ms = delays_ms[idx]
        filter_parts.append(f"[{idx}:a]adelay={d_ms}|{d_ms},{v_filt}[v{idx}];")
        mix_sources.append(f"[v{idx}]")
        
    f_idx = len(stems)
    filter_parts.append(f"[{f_idx}:a]volume=0.82[wind];")
    mix_sources.append("[wind]")
    filter_parts.append(f"[{f_idx+1}:a]volume=1.15[thun];")
    mix_sources.append("[thun]")
    filter_parts.append(f"[{f_idx+2}:a]volume=1.05[zap];")
    mix_sources.append("[zap]")
    filter_parts.append(f"[{f_idx+3}:a]volume=0.72[sand];")
    mix_sources.append("[sand]")
    filter_parts.append(f"[{f_idx+4}:a]volume=0.60[breath];")
    mix_sources.append("[breath]")
    
    filter_parts.append("sine=f=840:d=0.09,adelay=250|250,volume=0.35[chirp1];")
    mix_sources.append("[chirp1]")
    filter_parts.append("sine=f=1320:d=0.14,adelay=360|360,volume=0.30[chirp2];")
    mix_sources.append("[chirp2]")
    
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.012,highpass=f=280,lowpass=f=4000,volume=1.2[radio_hiss];")
    mix_sources.append("[radio_hiss]")
    
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
        out_mp3
    ]
    
    print("Running FFmpeg victory master mix...")
    subprocess.run(cmd, check=True)
    size_kb = os.path.getsize(out_mp3) / 1024
    print(f"Victory Master Created: {out_mp3} ({size_kb:.1f} KB, {total_dur}s)")
    return timed_lines

if __name__ == "__main__":
    alert_timestamps = build_alert_master()
    victory_timestamps = build_victory_master()
    
    ts_data = {
        "alert": alert_timestamps,
        "victory": victory_timestamps
    }
    
    ts_file = os.path.join(BASE_DIR, "transmission_timestamps.json")
    with open(ts_file, "w") as f:
        json.dump(ts_data, f, indent=2)
        
    print(f"\nSaved updated timestamps to {ts_file}")
