import numpy as np
import wave
import subprocess
import os

sr = 44100
total_duration = 92.0
n_samples = int(sr * total_duration)

FOLEY_DIR = "assets/constellation/radio-transmission/audio/stems_desert_v2/foley"
os.makedirs(FOLEY_DIR, exist_ok=True)

FOOTSTEPS_WAV = f"{FOLEY_DIR}/desert_footsteps_walking.wav"
SAND_TOUCH_WAV = f"{FOLEY_DIR}/desert_sand_touch.wav"
WIND_WAV = f"{FOLEY_DIR}/desert_wind_enhanced.wav"

print("--- 1. Generating Desert Sand Walking Footsteps ---")

def make_sand_step(intensity=1.0, sink_drag=0.28):
    step_samples = int(sr * sink_drag)
    t = np.linspace(0, sink_drag, step_samples, endpoint=False)
    
    # 1. Low frequency sand body compaction (subtle deep sand cushion)
    f_thump = np.random.uniform(130, 180)
    thump = np.sin(2 * np.pi * f_thump * t) * np.exp(-t * 22) * 0.55
    
    # 2. Mid-gritty compaction crunch of sand grains under boot
    noise = np.random.normal(0, 1, step_samples)
    env_crunch = (t / 0.04) * np.exp(-t * 18)
    env_crunch = np.clip(env_crunch, 0, 1)
    
    w_narrow = int(sr * 0.00035)
    w_wide = int(sr * 0.0028)
    crunch = (np.convolve(noise, np.ones(w_narrow)/w_narrow, mode='same') - 
              np.convolve(noise, np.ones(w_wide)/w_wide, mode='same'))
    crunch = crunch * env_crunch * 0.85
    
    # 3. Trailing sand grains slipping down the depression
    env_slide = np.exp(-t * 11) * (t / 0.06)
    w_fine = int(sr * 0.00015)
    slide = np.convolve(noise, np.ones(w_fine)/w_fine, mode='same') * env_slide * 0.55
    
    # Micro grain clicks
    for _ in range(4):
        p = np.random.randint(int(step_samples * 0.05), int(step_samples * 0.65))
        crunch[p:min(step_samples, p+15)] += (np.random.random(min(15, step_samples-p)) - 0.5) * 0.7
        
    return (thump + crunch + slide) * intensity

audio_l = np.zeros(n_samples, dtype=np.float32)
audio_r = np.zeros(n_samples, dtype=np.float32)

# Campsite meandering: he takes a few slow, unhurried steps in a circle, pauses, then takes a few more
walk_bursts = [
    # (start_time, num_steps, base_interval)
    (0.6, 4, 1.40),    # ~0.6s to 5.0s: slow steps arriving at radio
    (15.2, 3, 1.50),   # ~15.2s to 18.5s: pacing slowly around the beacon
    (27.5, 4, 1.55),   # ~27.5s to 32.5s: slow wander along dune crest
    (43.5, 3, 1.45),   # ~43.5s to 46.8s: a few steps turning around
    (57.5, 4, 1.55),   # ~57.5s to 62.5s: aimless slow walk in circle
    (70.5, 3, 1.50),   # ~70.5s to 74.0s: wandering slightly out from camp
    (82.5, 3, 1.45),   # ~82.5s to 86.0s: returning to sit by radio
]

total_steps = 0
for burst_st, count, interval in walk_bursts:
    cur_t = burst_st
    for s_idx in range(count):
        step_int = interval + np.random.uniform(-0.10, 0.12)
        intensity = np.random.uniform(0.85, 1.10)
        
        step = make_sand_step(intensity=intensity, sink_drag=0.32)
        st_idx = int(cur_t * sr)
        end_idx = min(n_samples, st_idx + len(step))
        l = end_idx - st_idx
        
        # Panning reflects circular movement around the camp transceiver
        pan = np.sin(total_steps * 1.1) * 0.28
        audio_l[st_idx:end_idx] += step[:l] * 0.5 * (1 - pan)
        audio_r[st_idx:end_idx] += step[:l] * 0.5 * (1 + pan)
        
        cur_t += step_int
        total_steps += 1

stereo_steps = np.vstack([audio_l, audio_r]).T
max_val = np.max(np.abs(stereo_steps))
if max_val > 0:
    stereo_steps = stereo_steps / max_val * 0.90

with wave.open(FOOTSTEPS_WAV, 'w') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((stereo_steps * 32767).astype(np.int16).tobytes())

print(f"Generated {total_steps} slow campsite wander footsteps: {FOOTSTEPS_WAV}")


print("--- 2. Generating Touching and Sifting Sand Foley ---")

def make_hand_sand_touch(dur=2.4, intensity=1.0):
    n = int(sr * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    out = np.zeros(n, dtype=np.float32)
    
    # Phase 1: Hand scooping / sweeping through fine sand (0 to 0.7s)
    n_sweep = int(sr * 0.70)
    t_sweep = np.linspace(0, 0.70, n_sweep, endpoint=False)
    noise_sweep = np.random.normal(0, 1, n_sweep)
    env_sweep = np.sin(np.pi * (t_sweep / 0.70)) ** 1.3
    w1 = int(sr * 0.00035)
    w2 = int(sr * 0.0022)
    sweep = (np.convolve(noise_sweep, np.ones(w1)/w1, mode='same') - 
             np.convolve(noise_sweep, np.ones(w2)/w2, mode='same'))
    out[:n_sweep] += sweep * env_sweep * 0.80
    
    # Phase 2: Sand trickling and cascading between fingers (0.45s to end)
    tr_st = int(sr * 0.45)
    t_tr = np.linspace(0, dur - 0.45, n - tr_st, endpoint=False)
    env_tr = np.exp(-t_tr * 2.0)
    noise_tr = np.random.normal(0, 1, len(t_tr))
    w_tr = int(sr * 0.00018)
    trickle = np.convolve(noise_tr, np.ones(w_tr)/w_tr, mode='same') * env_tr
    
    # Organic grain clustering
    mod = np.abs(np.sin(t_tr * 16.0) * 0.6 + np.sin(t_tr * 39.0) * 0.4 + 0.3)
    out[tr_st:] += trickle * mod * 0.70
    
    return out * intensity

touch_l = np.zeros(n_samples, dtype=np.float32)
touch_r = np.zeros(n_samples, dtype=np.float32)

# Key moments of touching/sifting sand (especially during footsteps pauses):
touch_events = [
    (5.8, 2.4, 1.0, -0.1),    # Settles after initial steps, touches sand
    (13.0, 2.2, 0.9, 0.15),   # Hand sifting sand during pause
    (24.0, 3.4, 1.25, 0.0),   # Long contemplative trickle: "cold sand, and the stars above"
    (36.0, 2.5, 0.95, -0.12), # Kneeling by radio, sweeping sand off knees
    (51.0, 2.8, 1.0, 0.1),    # Sifting sand during strategic pause
    (65.0, 3.0, 1.1, -0.05),  # Running hand through dune slope
    (77.0, 2.6, 0.95, 0.12),  # Shifting handful of sand
    (86.5, 2.8, 1.05, 0.0),   # Final sand trickle and brush before sign-off
]

for ev_time, ev_dur, ev_int, ev_pan in touch_events:
    ev_sound = make_hand_sand_touch(dur=ev_dur, intensity=ev_int)
    st = int(ev_time * sr)
    ed = min(n_samples, st + len(ev_sound))
    actual = ed - st
    touch_l[st:ed] += ev_sound[:actual] * 0.5 * (1 - ev_pan)
    touch_r[st:ed] += ev_sound[:actual] * 0.5 * (1 + ev_pan)

stereo_touch = np.vstack([touch_l, touch_r]).T
max_t = np.max(np.abs(stereo_touch))
if max_t > 0:
    stereo_touch = stereo_touch / max_t * 0.90

with wave.open(SAND_TOUCH_WAV, 'w') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((stereo_touch * 32767).astype(np.int16).tobytes())

print(f"Generated {len(touch_events)} sand-touching events: {SAND_TOUCH_WAV}")


print("--- 3. Generating Rich Multi-Band Desert Wind ---")

fade_out_st = total_duration - 3.0
subprocess.run([
    '/opt/homebrew/bin/ffmpeg', '-y',
    '-f', 'lavfi', '-i', f'anoisesrc=d={total_duration:.2f}:c=pink:r=44100:a=0.12',
    '-f', 'lavfi', '-i', f'anoisesrc=d={total_duration:.2f}:c=brown:r=44100:a=0.14',
    '-filter_complex',
    f'[0:a]bandpass=f=620:width_type=h:w=340,tremolo=f=0.16:d=0.75,volume=1.2[mid_wind];'
    f'[0:a]highpass=f=1200,lowpass=f=3400,tremolo=f=0.22:d=0.6,volume=0.9[hi_whistle];'
    f'[1:a]lowpass=f=280,tremolo=f=0.12:d=0.5,volume=1.4[deep_hum];'
    f'[mid_wind][hi_whistle][deep_hum]amix=inputs=3:duration=longest,'
    f'afade=t=in:ss=0:d=2.5,afade=t=out:st={fade_out_st:.2f}:d=3.0,volume=4.5[out]',
    '-map', '[out]',
    WIND_WAV
], check=True)

print(f"Generated enhanced multi-band desert wind: {WIND_WAV}")
