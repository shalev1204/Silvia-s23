import numpy as np
import wave
import os

sr = 44100
total_duration = 65.0
n_samples = int(sr * total_duration)

BREATH_WAV = 'assets/constellation/radio-transmission/audio/breathing_running.wav'
IMPACTS_WAV = 'assets/constellation/radio-transmission/audio/violent_impacts.wav'

# 1. Synthesize Ragged Breathing Track
breath_audio = np.zeros(n_samples, dtype=np.float32)

t_cur = 0.5
while t_cur < total_duration - 1.0:
    # Inhale duration ~0.4s, Exhale ~0.55s
    # Inhale: rising noise filtered around 900-1800Hz
    inhale_dur = np.random.uniform(0.35, 0.45)
    in_samples = int(sr * inhale_dur)
    t_in = np.linspace(0, 1, in_samples)
    env_in = (np.sin(t_in * np.pi * 0.5) ** 2) * np.exp(- (1 - t_in) * 2)
    noise_in = np.random.normal(0, 1, in_samples)
    # Bandpass filter
    filt_in = np.convolve(noise_in, np.ones(8)/8, mode='same') - np.convolve(noise_in, np.ones(32)/32, mode='same')
    inhale = filt_in * env_in * np.random.uniform(0.35, 0.55)
    
    # Exhale: falling raspy noise filtered around 500-1200Hz
    exhale_dur = np.random.uniform(0.50, 0.65)
    ex_samples = int(sr * exhale_dur)
    t_ex = np.linspace(0, 1, ex_samples)
    env_ex = (np.sin(t_ex * np.pi) ** 1.5) * np.exp(-t_ex * 2.5)
    noise_ex = np.random.normal(0, 1, ex_samples)
    filt_ex = np.convolve(noise_ex, np.ones(12)/12, mode='same') - np.convolve(noise_ex, np.ones(60)/60, mode='same')
    # Add deep vocal rasp
    rasp = np.sin(2 * np.pi * 85 * np.linspace(0, exhale_dur, ex_samples)) * filt_ex * 0.3
    exhale = (filt_ex + rasp) * env_ex * np.random.uniform(0.40, 0.60)
    
    # Place inhale
    idx1 = int(t_cur * sr)
    idx2 = min(n_samples, idx1 + in_samples)
    breath_audio[idx1:idx2] += inhale[:idx2-idx1]
    
    # Place exhale shortly after
    t_cur += inhale_dur + np.random.uniform(0.04, 0.08)
    idx3 = int(t_cur * sr)
    idx4 = min(n_samples, idx3 + ex_samples)
    breath_audio[idx3:idx4] += exhale[:idx4-idx3]
    
    # Next breath cycle
    t_cur += exhale_dur + np.random.uniform(0.10, 0.25)

# Normalize breathing
max_b = np.max(np.abs(breath_audio))
if max_b > 0:
    breath_audio = breath_audio / max_b * 0.75

with wave.open(BREATH_WAV, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((breath_audio * 32767).astype(np.int16).tobytes())

print(f"Generated breathing track: {BREATH_WAV}")

# 2. Synthesize Violent Impacts & Blows Track ("Golpes")
impacts_audio = np.zeros(n_samples, dtype=np.float32)

def add_impact(time_sec, freq=65, decay_rate=15, crunch=1.0):
    dur = 2.0
    samples = int(sr * dur)
    t = np.linspace(0, dur, samples)
    # Heavy low-frequency punch
    low = np.sin(2 * np.pi * freq * (1 + 0.5 * np.exp(-t * 20)) * t) * np.exp(-t * decay_rate)
    # Metal clang / sharp transient
    transient = np.random.normal(0, 1, samples) * np.exp(-t * 80)
    metal = np.sin(2 * np.pi * 380 * t) * np.exp(-t * 30) * 0.5 + np.sin(2 * np.pi * 740 * t) * np.exp(-t * 45) * 0.3
    impact = (low * 0.8 + transient * 0.6 * crunch + metal * 0.4)
    
    s_idx = int(time_sec * sr)
    e_idx = min(n_samples, s_idx + samples)
    impacts_audio[s_idx:e_idx] += impact[:e_idx-s_idx]

# Heavy hits & blows at key dramatic moments:
add_impact(14.5, freq=50, decay_rate=8, crunch=1.5)   # Sanctuary gate breached!
add_impact(15.2, freq=75, decay_rate=12, crunch=1.2)  # Secondary explosion / door crash
add_impact(23.2, freq=45, decay_rate=6, crunch=1.8)   # Altar smashed / Astrolabe torn
add_impact(34.8, freq=85, decay_rate=20, crunch=1.4)  # Gunshot / kinetic slug ricochet
add_impact(48.2, freq=60, decay_rate=10, crunch=1.3)  # Heavy blast door slammed shut behind him
add_impact(55.5, freq=90, decay_rate=25, crunch=1.2)  # Distant shot

# Normalize impacts
max_i = np.max(np.abs(impacts_audio))
if max_i > 0:
    impacts_audio = impacts_audio / max_i * 0.85

with wave.open(IMPACTS_WAV, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes((impacts_audio * 32767).astype(np.int16).tobytes())

print(f"Generated impacts track: {IMPACTS_WAV}")
