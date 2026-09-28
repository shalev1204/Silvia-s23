import numpy as np
import subprocess
import os

OUT_WAV = 'assets/constellation/radio-transmission/audio/footsteps_running.wav'
os.makedirs(os.path.dirname(OUT_WAV), exist_ok=True)

sr = 44100
total_duration = 65.0
n_samples = int(sr * total_duration)

audio_left = np.zeros(n_samples, dtype=np.float32)
audio_right = np.zeros(n_samples, dtype=np.float32)

# Footstep generator
def make_single_step(heel_freq=110, crunch_intensity=1.0):
    # Duration ~60ms
    dur = 0.075
    step_samples = int(sr * dur)
    t = np.linspace(0, dur, step_samples, endpoint=False)
    
    # 1. Low frequency heel thump
    decay = np.exp(-t * 90)
    thump = np.sin(2 * np.pi * heel_freq * t) * decay * 0.7
    
    # 2. Gravel / sole crunch (shaped noise)
    noise = np.random.normal(0, 1, step_samples)
    # Filter with envelope
    env = (t / 0.01) * np.exp(-t * 60)
    env = np.clip(env, 0, 1)
    
    # Simple bandpass by difference
    crunch = np.convolve(noise, np.ones(5)/5, mode='same') - np.convolve(noise, np.ones(25)/25, mode='same')
    crunch = crunch * env * 0.45 * crunch_intensity
    
    # 3. Add random micro-pebble ticks
    for _ in range(3):
        pos = np.random.randint(int(step_samples * 0.1), int(step_samples * 0.7))
        if pos < step_samples:
            crunch[pos:min(step_samples, pos+10)] += (np.random.random(min(10, step_samples-pos)) - 0.5) * 0.8
            
    step = thump + crunch
    return step

# Cadence schedule:
# 0s - 39s: running hard (interval ~0.37s)
# 39s - 48s: brief stumble & heavy walking/skid while catching breath (interval ~0.55s)
# 48s - 65s: sprinting desperately again (interval ~0.35s)

current_time = 0.8
step_idx = 0

while current_time < total_duration - 1.5:
    if 39.0 <= current_time <= 47.5:
        # Pacing slows slightly during "Listen to me! We are going to take it back!"
        interval = np.random.uniform(0.52, 0.60)
        intensity = 0.75
    else:
        # Full sprint
        interval = np.random.uniform(0.35, 0.39)
        intensity = 1.05
        
    freq = np.random.uniform(95, 125)
    step = make_single_step(heel_freq=freq, crunch_intensity=intensity)
    
    start_idx = int(current_time * sr)
    end_idx = min(n_samples, start_idx + len(step))
    actual_len = end_idx - start_idx
    
    # Alternating pan
    pan = -0.15 if (step_idx % 2 == 0) else 0.15
    gain_l = 0.5 * (1 - pan)
    gain_r = 0.5 * (1 + pan)
    
    audio_left[start_idx:end_idx] += step[:actual_len] * gain_l
    audio_right[start_idx:end_idx] += step[:actual_len] * gain_r
    
    current_time += interval
    step_idx += 1

# Add slight stone vault echo/reverb using convolution
stereo = np.vstack([audio_left, audio_right]).T
# Normalize
max_val = np.max(np.abs(stereo))
if max_val > 0:
    stereo = stereo / max_val * 0.85

import wave
with wave.open(OUT_WAV, 'w') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((stereo * 32767).astype(np.int16).tobytes())

print(f"Generated realistic running footsteps: {OUT_WAV} ({step_idx} steps)")
