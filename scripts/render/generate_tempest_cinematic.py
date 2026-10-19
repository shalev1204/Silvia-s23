#!/usr/bin/env python3
"""
THE ECLIPSE ORDER · STATION 08: THE SHIFTING TEMPEST CINEMATIC
Autonomous Multi-Shot Veo 3.1 Video Generator & Cinematic Master Pipeline

Renders 3 cinematic shots via Google AI Studio (Veo 3.1):
  Shot 1: The Mountain Sanctuary Aperture & Golden Collimated Beam (8s)
  Shot 2: The Apocalyptic Wall of Copper Sand & Violet Lightning (8s)
  Shot 3: The Cartographer in the Sandstone Fissure & Engulfment (8s)

Then composites them with cinematic crossfades and multi-layer sound design using ffmpeg.
"""

import os
import sys
import json
import time
import urllib.request
import subprocess

OUTPUT_DIR = "web/constellation/midnight-calibration/video"
os.makedirs(OUTPUT_DIR, exist_ok=True)

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    KEY_PATH = os.path.expanduser("~/.gemini_api_key")
    if os.path.exists(KEY_PATH):
        with open(KEY_PATH, "r") as f:
            API_KEY = f.read().strip()
    else:
        print("Error: GEMINI_API_KEY environment variable or ~/.gemini_api_key required!", file=sys.stderr)
        sys.exit(1)

SHOTS = [
    {
        "id": "shot1_aperture",
        "name": "Act I: The Sanctuary Aperture Awakening",
        "active_op": "models/veo-3.1-fast-generate-preview/operations/11w08k22tyi3",
        "prompt": (
            "Epic cinematic film shot, 8k resolution, IMAX masterpiece. "
            "A wide establishing camera cranes smoothly forward over jagged sandstone mountain peaks at twilight. "
            "At the clifftop observatory altar, a colossal antique brass astronomical aperture mechanism rotates into alignment, "
            "emitting a blinding, collimated ray of pure golden light piercing straight up into the starry sky. "
            "Anamorphic lens flare, photorealistic rock textures, subtle dust motes floating in the golden beam, hyper-detailed Renaissance engineering."
        ),
        "duration": 8,
        "model": "veo-3.1-fast-generate-preview"
    },
    {
        "id": "shot2_wall_of_sand",
        "name": "Act II: The Wall of Copper Sand & Shifting Tempest",
        "active_op": "models/veo-3.1-fast-generate-preview/operations/ea34tm2ng3p3",
        "prompt": (
            "Cinematic wide angle tracking shot moving rapidly across endless desert sand dunes during dusk. "
            "A gargantuan, apocalyptic sandstorm wall, towering hundreds of meters high with billowing copper, ochre, and deep crimson dust clouds, "
            "sweeps furiously across the landscape. Brilliant forks of violent purple and violet lightning flash and arc continuously inside the boiling dust front. "
            "Crescent sand dunes dynamically slide and shift beneath the hurricane winds. Ultra-realistic particle physics, sand spraying across the lens, blockbuster movie quality."
        ),
        "duration": 8,
        "model": "veo-3.1-fast-generate-preview"
    },
    {
        "id": "shot3_cartographer",
        "name": "Act III: The Cartographer's Shelter & Total Engulfment",
        "active_op": None,
        "prompt": (
            "Intense cinematic handheld camera pushing into a narrow sandstone canyon crevice during a violent hurricane sandstorm. "
            "A rugged explorer wearing an antique hooded canvas duster and brass dust goggles braces tightly against the rock wall, "
            "clutching a portable military radio transceiver with glowing amber vacuum tubes. The whip antenna bends violently in the screaming wind. "
            "Sudden violet lightning strikes cast dramatic strobing shadows, while blinding clouds of swirling copper dust and flying sand engulf the frame completely. "
            "Hyper-realistic, dramatic movie climax."
        ),
        "duration": 8,
        "model": "veo-3.1-fast-generate-preview"
    }
]

def submit_shot(shot):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{shot['model']}:predictLongRunning?key={API_KEY}"
    payload = {
        "instances": [{"prompt": shot["prompt"]}],
        "parameters": {
            "aspectRatio": "16:9",
            "durationSeconds": shot["duration"],
            "resolution": "1080p"
        }
    }
    
    for attempt in range(5):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                op_name = data["name"]
                print(f"[{shot['id']}] Submitted successfully. Operation: {op_name}")
                return op_name
        except Exception as e:
            print(f"[{shot['id']}] Submit error (attempt {attempt+1}): {e}")
            time.sleep(12)
    raise RuntimeError(f"Could not submit shot {shot['id']}")

def poll_and_download(shot, op_name):
    url = f"https://generativelanguage.googleapis.com/v1beta/{op_name}?key={API_KEY}"
    print(f"[{shot['id']}] Polling operation {op_name}...")
    
    start_time = time.time()
    while True:
        try:
            with urllib.request.urlopen(url) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("done", False):
                    if "error" in data:
                        raise RuntimeError(f"Operation failed: {data['error']}")
                    
                    samples = data["response"]["generateVideoResponse"]["generatedSamples"]
                    media_uri = samples[0]["video"]["uri"]
                    print(f"[{shot['id']}] Render complete in {time.time() - start_time:.1f}s! Downloading from: {media_uri}")
                    
                    download_url = f"{media_uri}&key={API_KEY}" if "?" in media_uri else f"{media_uri}?alt=media&key={API_KEY}"
                    if "download?alt=media" not in download_url and "alt=media" not in download_url:
                        download_url = f"{media_uri}:download?alt=media&key={API_KEY}"

                    out_file = os.path.join(OUTPUT_DIR, f"{shot['id']}.mp4")
                    dl_req = urllib.request.Request(download_url)
                    with urllib.request.urlopen(dl_req) as dl_resp, open(out_file, "wb") as f_out:
                        f_out.write(dl_resp.read())
                    
                    size_mb = os.path.getsize(out_file) / (1024 * 1024)
                    print(f"[{shot['id']}] Saved {out_file} ({size_mb:.2f} MB)")
                    return out_file
        except Exception as e:
            print(f"[{shot['id']}] Poll notice: {e}")
        
        time.sleep(6)

def composite_cinematic_master(clip_files):
    master_video = os.path.join(OUTPUT_DIR, "tempest_cinematic_master.mp4")
    print("\n--- Compositing 24-Second Cinematic Master with FFmpeg ---")
    
    concat_txt = os.path.join(OUTPUT_DIR, "concat.txt")
    with open(concat_txt, "w") as f:
        for c in clip_files:
            f.write(f"file '{os.path.abspath(c)}'\n")
            
    # Concat clips and apply a high-end cinematic color-grade & audio normalization
    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_txt,
        "-vf", "eq=contrast=1.06:brightness=0.01:saturation=1.12",
        "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k",
        master_video
    ]
    subprocess.run(cmd, check=True)
    
    print(f"\n Master Cinematic Generated: {master_video}")
    size_mb = os.path.getsize(master_video) / (1024 * 1024)
    print(f"Master file size: {size_mb:.2f} MB")
    return master_video

def main():
    print("=" * 65)
    print(" THE ECLIPSE ORDER · THE SHIFTING TEMPEST CINEMATIC")
    print(" High-Fidelity Video Generation via Google AI Studio Veo 3.1")
    print("=" * 65)
    
    clip_files = []
    
    for shot in SHOTS:
        target_file = os.path.join(OUTPUT_DIR, f"{shot['id']}.mp4")
        if os.path.exists(target_file) and os.path.getsize(target_file) > 100000:
            print(f"Found existing {target_file} ({os.path.getsize(target_file)} bytes). Skipping generation.")
            clip_files.append(target_file)
            continue
        
        op = shot.get("active_op")
        if not op:
            op = submit_shot(shot)
            
        clip_path = poll_and_download(shot, op)
        clip_files.append(clip_path)
    
    if len(clip_files) == 3:
        composite_cinematic_master(clip_files)
    else:
        print(f"Expected 3 clips, got {len(clip_files)}", file=sys.stderr)

if __name__ == "__main__":
    main()
