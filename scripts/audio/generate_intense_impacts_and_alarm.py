import numpy as np
import wave
import os

sr = 44100
total_duration = 34.0
n_samples = int(sr * total_duration)

OUT_IMPACTS = 'assets/constellation/radio-transmission/audio/intense_action_impacts.wav'
OUT_ALARM = 'assets/constellation/radio-transmission/audio/facility_alarm.wav'
OUT_BREATH = 'assets/constellation/radio-transmission/audio/hard_running_breathing.wav'

# 1. Action Impacts
impacts = np.zeros(n_samples, dtype=np.float32)

def make_explosion_breach(time_sec):
    dur = 2.5
    samples = int(sr * dur)
    t = np.linspace(0, dur, samples)
    # Sub bass shockwave
    sub = np.sin(2 * np.pi * 45 * np.exp(-t * 8) * t) * np.exp(-t * 5)
    # Violent white noise debris burst
    noise = np.random.normal(0, 1, samples) * np.exp(-t * 15)
    # Crumbling stone rubble
    rubble = np.convolve(noise, np.ones(30)/30, mode='same') * np.exp(-t * 4) * 0.8
    # Metal screech/clang
    metal = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 25) * 0.4 + np.sin(2 * np.pi * 880 * t) * np.exp(-t * 35) * 0.3
    
    boom = (sub * 0.9 + noise * 0.7 + rubble * 0.6 + metal * 0.5)
    s = int(time_sec * sr)
    e = min(n_samples, s + samples)
    impacts[s:e] += boom[:e-s]

def make_gunshot_ricochet(time_sec):
    dur = 1.0
    samples = int(sr * dur)
    t = np.linspace(0, dur, samples)
    # Sharp crack
    crack = np.random.normal(0, 1, samples) * np.exp(-t * 90)
    # Whine ricochet
    whine_f = 2800 - 1500 * t
    ricochet = np.sin(2 * np.pi * whine_f * t) * np.exp(-t * 12) * 0.4
    s = int(time_sec * sr)
    e = min(n_samples, s + samples)
    impacts[s:e] += (crack * 0.9 + ricochet * 0.5)[:e-s]

def make_door_slam(time_sec):
    dur = 1.8
    samples = int(sr * dur)
    t = np.linspace(0, dur, samples)
    thud = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 18)
    clang = np.sin(2 * np.pi * 260 * t) * np.exp(-t * 22) * 0.7 + np.sin(2 * np.pi * 680 * t) * np.exp(-t * 30) * 0.5
    door = thud + clang
    s = int(time_sec * sr)
    e = min(n_samples, s + samples)
    impacts[s:e] += door[:e-s]

# Add impacts at key dramatic beats:
make_explosion_breach(4.5)    # Sanctuary breached!
make_gunshot_ricochet(11.2)   # Ricochet!
make_gunshot_ricochet(11.8)   # Double shot!
make_door_slam(22.8)          # Blast door slammed shut!
make_door_slam(24.2)          # Pounding on the door!
make_door_slam(25.4)          # Second pound!
make_explosion_breach(28.8)   # Final charge blowout that cuts transmission!

impacts = impacts / np.max(np.abs(impacts)) * 0.92
with wave.open(OUT_IMPACTS, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((impacts * 32767).astype(np.int16).tobytes())
print(f"Generated action impacts: {OUT_IMPACTS}")

# 2. Facility Warning Alarm (Two-tone emergency klaxon echoing in background)
alarm = np.zeros(n_samples, dtype=np.float32)
# Alarm active from t=4.5s to t=30.0s
for t_alarm in np.arange(4.8, 30.0, 1.4):
    dur = 0.55
    samples = int(sr * dur)
    t = np.linspace(0, dur, samples)
    tone = np.sin(2 * np.pi * 750 * t) * 0.5 + np.sin(2 * np.pi * 920 * t) * 0.4
    env = np.sin(t / dur * np.pi)
    s = int(t_alarm * sr)
    e = min(n_samples, s + samples)
    alarm[s:e] += (tone * env)[:e-s] * 0.35

with wave.open(OUT_ALARM, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((alarm * 32767).astype(np.int16).tobytes())
print(f"Generated facility alarm: {OUT_ALARM}")

# 3. Hard Sprinting Breathing (Continuous fast, desperate panting)
breath = np.zeros(n_samples, dtype=np.float32)
t_b = 0.2
while t_b < total_duration - 0.8:
    dur_in = np.random.uniform(0.24, 0.30)
    dur_ex = np.random.uniform(0.32, 0.40)
    s_in = int(sr * dur_in)
    s_ex = int(sr * dur_ex)
    
    t1 = np.linspace(0, 1, s_in)
    t2 = np.linspace(0, 1, s_ex)
    
    # Sharp gasping inhale
    in_noise = np.random.normal(0, 1, s_in)
    in_env = np.sin(t1 * np.pi) ** 2
    in_wave = (np.convolve(in_noise, np.ones(6)/6, mode='same') - np.convolve(in_noise, np.ones(24)/24, mode='same')) * in_env * 0.6
    
    # Raspy heavy exhale
    ex_noise = np.random.normal(0, 1, s_ex)
    ex_env = np.sin(t2 * np.pi) * np.exp(-t2 * 2.0)
    ex_wave = (np.convolve(ex_noise, np.ones(10)/10, mode='same') - np.convolve(ex_noise, np.ones(40)/40, mode='same')) * ex_env * 0.7
    
    idx = int(t_b * sr)
    if idx + s_in < n_samples:
        breath[idx:idx+s_in] += in_wave
    idx += s_in + int(sr * 0.05)
    if idx + s_ex < n_samples:
        breath[idx:idx+s_ex] += ex_wave
        
    t_b += dur_in + dur_ex + np.random.uniform(0.12, 0.22)

breath = breath / np.max(np.abs(breath)) * 0.85
with wave.open(OUT_BREATH, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((breath * 32767).astype(np.int16).tobytes())
print(f"Generated hard running breathing: {OUT_BREATH}")
