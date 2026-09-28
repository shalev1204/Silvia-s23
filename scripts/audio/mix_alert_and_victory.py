#!/usr/bin/env python3
"""
THE ECLIPSE ORDER · STATION 08: RADIO TRANSMISSION MASTER MIXER
Composites the Cartographer Voice Stems (Gemini TTS Fenrir), Radio Squelch,
Atmospheric Storm Wind, Thunderclaps, Static Crackles & Connection Dropouts
"""

import os
import json
import subprocess

BASE_DIR = "web/constellation/midnight-calibration/audio"
STEMS_DIR = os.path.join(BASE_DIR, "stems")

ALERT_LINES = [
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

VICTORY_LINES = [
    ("v1", "Silvia! Signal received loud and clear through the electrostatic gale!"),
    ("v2", "Two thousand and ninety light-years... the celestial hexagon... anchored between Achernar and Polaris! You have done it!"),
    ("v3", "The storm is now raging outside with apocalyptic fury. The winds are shifting entire mountains of sand!"),
    ("v4", "All previous maps of the desert are now dead paper. The crescent dunes have slid miles south, ancient ravines are buried, and the raiders are now as lost and stranded as we are in this shifting sea."),
    ("v5", "We have lost their trail, but we hold the three stellar constants! In the deep desert, beyond the moved dunes, dwells the only ancient soul who can read the shifted sands: The Desert Oracle."),
    ("v6", "When this tempest subsides, we will navigate by these three chords directly to the Oracle's sanctuary."),
    ("v7", "Rest now, Silvia, while the winds blow. The Desert Path awaits us. Stay safe. Out.")
]

def get_duration(wav_path):
    res = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", wav_path
    ], capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def mix_alert():
    out_mp3 = os.path.join(BASE_DIR, "cartographer_tempest_alert.mp3")
    print(f"\n--- Mixing Alert Master: {out_mp3} ---")
    
    stems = [os.path.join(STEMS_DIR, f"{tag}.wav") for tag, _ in ALERT_LINES]
    durs = [get_duration(s) for s in stems]
    
    current_time = 1.0  # Start after initial radio squelch
    timestamps = []
    inputs = []
    filter_parts = []
    
    # Tactical radio voice filter: tight bandpass + warm analog presence + compression
    v_filt = "highpass=f=240,lowpass=f=4400,acompressor=threshold=-15dB:ratio=4:attack=5:release=70,volume=2.6"
    
    for idx, (tag, text) in enumerate(ALERT_LINES):
        inputs.extend(["-i", stems[idx]])
        delay_ms = int(current_time * 1000)
        timestamps.append({"t": round(current_time, 2), "text": text})
        
        # Connection failures and signal glitches:
        if tag == "a6":
            # Momentary carrier stutter when shouting through gale
            drop_start = current_time + 3.0
            drop_end = current_time + 3.4
            filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt},volume=enable='between(t,{drop_start},{drop_end})':volume=0.15[v{idx}];")
        elif tag == "a8":
            # Electrostatic signal drop
            drop_start = current_time + 4.2
            drop_end = current_time + 4.7
            filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt},volume=enable='between(t,{drop_start},{drop_end})':volume=0.1[v{idx}];")
        else:
            filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt}[v{idx}];")
            
        current_time += durs[idx] + 0.85  # Breath / radio pause between lines
    
    total_dur = round(current_time + 1.8, 1)
    
    # Squelch chirps at start
    filter_parts.append(f"sine=f=840:d=0.08,adelay=250|250,volume=0.25[chirp1];")
    filter_parts.append(f"sine=f=1320:d=0.12,adelay=350|350,volume=0.22[chirp2];")
    
    # Roger beep at end
    roger_ms = int((total_dur - 1.2) * 1000)
    filter_parts.append(f"sine=f=1050:d=0.25,adelay={roger_ms}|{roger_ms},volume=0.28[rogerbeep];")
    
    # Constant background tactical radio hiss
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.012,highpass=f=280,lowpass=f=4200[radio_hiss];")
    
    # Howling desert storm wind (bandpassed pink noise)
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.18,bandpass=f=440:width_type=h:w=280,volume=0.85[storm_wind];")
    
    # Deep seismic thunder and shifting sand dunes (brown noise)
    filter_parts.append(f"anoisesrc=d={total_dur}:c=brown:r=44100:a=0.22,lowpass=f=120,volume=1.2[sub_rumble];")
    
    # Electrostatic static bursts during dropouts
    filter_parts.append(f"anoisesrc=d={total_dur}:c=white:r=44100:a=0.09,bandpass=f=1600:width_type=h:w=900,"
                        f"volume=enable='between(t,30.5,31.4)+between(t,48.0,48.8)':volume=2.2:eval=frame[static_bursts];")
    
    # Lightning strikes (distant sharp zaps)
    filter_parts.append(f"anoisesrc=d={total_dur}:c=white:r=44100:a=0.12,highpass=f=2000,"
                        f"volume=enable='between(t,14.5,15.0)+between(t,38.2,38.8)':volume=1.8:eval=frame[lightning_zaps];")
    
    # Combine all voices and atmospheric layers
    voice_sources = "".join([f"[v{i}]" for i in range(len(ALERT_LINES))])
    atm_sources = "[chirp1][chirp2][rogerbeep][radio_hiss][storm_wind][sub_rumble][static_bursts][lightning_zaps]"
    all_sources = voice_sources + atm_sources
    num_inputs = len(ALERT_LINES) + 8
    
    # KEY: duration=longest ensures the whole track renders
    filter_parts.append(f"{all_sources}amix=inputs={num_inputs}:duration=longest:dropout_transition=2,"
                        f"atrim=0:{total_dur},"
                        f"dynaudnorm=f=120:g=15,"
                        f"volume=1.5[out]")
    
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
    size_kb = os.path.getsize(out_mp3) / 1024
    print(f"Alert Master Mixed! Duration: {total_dur}s, Size: {size_kb:.1f} KB")
    return timestamps

def mix_victory():
    out_mp3 = os.path.join(BASE_DIR, "cartographer_tempest_victory.mp3")
    print(f"\n--- Mixing Victory Master: {out_mp3} ---")
    
    stems = [os.path.join(STEMS_DIR, f"{tag}.wav") for tag, _ in VICTORY_LINES]
    durs = [get_duration(s) for s in stems]
    
    current_time = 1.0
    timestamps = []
    inputs = []
    filter_parts = []
    v_filt = "highpass=f=240,lowpass=f=4400,acompressor=threshold=-15dB:ratio=4:attack=5:release=70,volume=2.6"
    
    for idx, (tag, text) in enumerate(VICTORY_LINES):
        inputs.extend(["-i", stems[idx]])
        delay_ms = int(current_time * 1000)
        timestamps.append({"t": round(current_time, 2), "text": text})
        filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},{v_filt}[v{idx}];")
        current_time += durs[idx] + 0.9
        
    total_dur = round(current_time + 1.8, 1)
    
    filter_parts.append(f"sine=f=840:d=0.08,adelay=250|250,volume=0.25[chirp1];")
    filter_parts.append(f"sine=f=1320:d=0.12,adelay=350|350,volume=0.22[chirp2];")
    
    roger_ms = int((total_dur - 1.2) * 1000)
    filter_parts.append(f"sine=f=1050:d=0.25,adelay={roger_ms}|{roger_ms},volume=0.28[rogerbeep];")
    
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.010,highpass=f=280,lowpass=f=4200[radio_hiss];")
    filter_parts.append(f"anoisesrc=d={total_dur}:c=pink:r=44100:a=0.15,bandpass=f=440:width_type=h:w=260,volume=0.75[storm_wind];")
    filter_parts.append(f"anoisesrc=d={total_dur}:c=brown:r=44100:a=0.18,lowpass=f=120,volume=0.95[sub_rumble];")
    
    voice_sources = "".join([f"[v{i}]" for i in range(len(VICTORY_LINES))])
    atm_sources = "[chirp1][chirp2][rogerbeep][radio_hiss][storm_wind][sub_rumble]"
    all_sources = voice_sources + atm_sources
    num_inputs = len(VICTORY_LINES) + 6
    
    filter_parts.append(f"{all_sources}amix=inputs={num_inputs}:duration=longest:dropout_transition=2,"
                        f"atrim=0:{total_dur},"
                        f"dynaudnorm=f=120:g=15,"
                        f"volume=1.5[out]")
                        
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
    size_kb = os.path.getsize(out_mp3) / 1024
    print(f"Victory Master Mixed! Duration: {total_dur}s, Size: {size_kb:.1f} KB")
    return timestamps

def main():
    alert_ts = mix_alert()
    victory_ts = mix_victory()
    
    out_json = os.path.join(BASE_DIR, "transmission_timestamps.json")
    with open(out_json, "w") as f:
        json.dump({"alert": alert_ts, "victory": victory_ts}, f, indent=2)
    print(f"\nSaved exact subtitle timestamps to {out_json}")

if __name__ == "__main__":
    main()
