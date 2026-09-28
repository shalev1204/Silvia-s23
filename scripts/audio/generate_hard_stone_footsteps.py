import numpy as np
import wave

sr = 44100
total_duration = 34.0
n_samples = int(sr * total_duration)

audio_l = np.zeros(n_samples, dtype=np.float32)
audio_r = np.zeros(n_samples, dtype=np.float32)

# Hard stone floor footstep synthesizer
def make_hard_stone_step(heel_f=160, slap_f=2200):
    dur = 0.09
    samples = int(sr * dur)
    t = np.linspace(0, dur, samples)
    
    # 1. Hard solid heel impact on rock (sharp attack, fast decay)
    heel = np.sin(2 * np.pi * heel_f * np.exp(-t * 60) * t) * np.exp(-t * 120)
    
    # 2. Hard leather sole slap on solid stone slab (very sharp transient, no gravel/sand)
    slap = np.sin(2 * np.pi * slap_f * t) * np.exp(-t * 160) * 0.7
    
    # 3. Stone floor acoustic resonance & slap-back reflection (hard boundary reflection at ~18ms)
    refl_time = 0.018
    refl_samples = int(sr * refl_time)
    step = heel + slap
    
    out = np.zeros(samples + refl_samples, dtype=np.float32)
    out[:samples] += step
    # Acoustic bounce off stone wall
    out[refl_samples:refl_samples+samples] += step * 0.42
    
    return out

# Generate hard running sequence on stone: cadence ~165 steps/min (every 0.36s)
cur = 0.4
step_i = 0

while cur < total_duration - 1.0:
    # Slightly faster during chase peaks
    if 8.0 <= cur <= 16.0 or 22.0 <= cur <= 30.0:
        dt = np.random.uniform(0.32, 0.35)  # desperate sprint
    else:
        dt = np.random.uniform(0.35, 0.38)
        
    step = make_hard_stone_step(heel_f=np.random.uniform(145, 175), slap_f=np.random.uniform(2000, 2600))
    s_idx = int(cur * sr)
    e_idx = min(n_samples, s_idx + len(step))
    actual = e_idx - s_idx
    
    pan = -0.2 if (step_i % 2 == 0) else 0.2
    gl = 0.5 * (1 - pan)
    gr = 0.5 * (1 + pan)
    
    audio_l[s_idx:e_idx] += step[:actual] * gl
    audio_r[s_idx:e_idx] += step[:actual] * gr
    
    cur += dt
    step_i += 1

stereo = np.vstack([audio_l, audio_r]).T
stereo = stereo / np.max(np.abs(stereo)) * 0.90

out_wav = 'assets/constellation/radio-transmission/audio/footsteps_hard_stone.wav'
with wave.open(out_wav, 'w') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((stereo * 32767).astype(np.int16).tobytes())

print(f"Generated {step_i} hard stone footsteps: {out_wav}")
