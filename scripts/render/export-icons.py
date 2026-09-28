#!/usr/bin/env python3
"""
Export independent high-res PNG and SVG logos for:
- The Eclipse Order
- The Desert Path
- The Stage Path
- The Constellation Path
"""

import os
import subprocess

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
ICONS_DIR = os.path.join(ASSETS_DIR, "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

ICONS = {
    "logo-the-eclipse-order": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2b2"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#5a3805"/>
    </linearGradient>
    <radialGradient id="shadow" cx="65%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#2a1a0d"/>
      <stop offset="100%" stop-color="#0a0502"/>
    </radialGradient>
  </defs>
  <!-- Outer Astrolabe Ring -->
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold)" stroke-width="10"/>
  <circle cx="256" cy="256" r="218" fill="none" stroke="url(#gold)" stroke-width="3" stroke-dasharray="12 12"/>
  <circle cx="256" cy="256" r="185" fill="none" stroke="url(#gold)" stroke-width="5"/>
  <!-- Cardinal ticks -->
  <line x1="256" y1="20" x2="256" y2="52" stroke="url(#gold)" stroke-width="8"/>
  <line x1="256" y1="460" x2="256" y2="492" stroke="url(#gold)" stroke-width="8"/>
  <line x1="20" y1="256" x2="52" y2="256" stroke="url(#gold)" stroke-width="8"/>
  <line x1="460" y1="256" x2="492" y2="256" stroke="url(#gold)" stroke-width="8"/>
  <!-- Diagonal ticks -->
  <line x1="89" y1="89" x2="112" y2="112" stroke="url(#gold)" stroke-width="6"/>
  <line x1="400" y1="400" x2="423" y2="423" stroke="url(#gold)" stroke-width="6"/>
  <line x1="89" y1="423" x2="112" y2="400" stroke="url(#gold)" stroke-width="6"/>
  <line x1="400" y1="112" x2="423" y2="89" stroke="url(#gold)" stroke-width="6"/>
  <!-- Eclipse Disk (Half Light, Half Dark) -->
  <circle cx="256" cy="256" r="160" fill="#faf3e0" stroke="url(#gold)" stroke-width="6"/>
  <path d="M 256,96 A 160 160 0 0 1 256,416 Z" fill="url(#shadow)"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="url(#gold)" stroke-width="8"/>
  <line x1="256" y1="92" x2="256" y2="420" stroke="url(#gold)" stroke-width="6"/>
</svg>''',

    "logo-path-desert": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2b2"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#5a3805"/>
    </linearGradient>
  </defs>
  <!-- Outer Astro Ring -->
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold)" stroke-width="10"/>
  <circle cx="256" cy="256" r="218" fill="none" stroke="url(#gold)" stroke-width="4" stroke-dasharray="16 16"/>
  <circle cx="256" cy="256" r="185" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <!-- Sun & Rays -->
  <circle cx="256" cy="160" r="56" fill="#c89855" stroke="url(#gold)" stroke-width="8"/>
  <line x1="256" y1="64" x2="256" y2="88" stroke="url(#gold)" stroke-width="8"/>
  <line x1="256" y1="232" x2="256" y2="256" stroke="url(#gold)" stroke-width="8"/>
  <line x1="160" y1="160" x2="184" y2="160" stroke="url(#gold)" stroke-width="8"/>
  <line x1="328" y1="160" x2="352" y2="160" stroke="url(#gold)" stroke-width="8"/>
  <!-- Desert Dunes -->
  <path d="M 80,384 Q 180,256 280,352 Q 380,288 432,384" fill="none" stroke="url(#gold)" stroke-width="18" stroke-linecap="round"/>
</svg>''',

    "logo-path-stage": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2b2"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#5a3805"/>
    </linearGradient>
  </defs>
  <!-- Outer Ring -->
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold)" stroke-width="10"/>
  <circle cx="256" cy="256" r="218" fill="none" stroke="url(#gold)" stroke-width="3" stroke-dasharray="12 12"/>
  <!-- Curated Mirror Portal -->
  <rect x="120" y="80" width="272" height="352" rx="136" fill="none" stroke="url(#gold)" stroke-width="16"/>
  <line x1="256" y1="80" x2="256" y2="432" stroke="url(#gold)" stroke-width="8" stroke-dasharray="14 14"/>
  <circle cx="256" cy="256" r="48" fill="#dfc060" stroke="url(#gold)" stroke-width="8"/>
  <path d="M 176,192 Q 256,144 336,192" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
  <path d="M 176,320 Q 256,368 336,320" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
</svg>''',

    "logo-path-constellation": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2b2"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#5a3805"/>
    </linearGradient>
  </defs>
  <!-- Outer Astrolabe Ring -->
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold)" stroke-width="10"/>
  <circle cx="256" cy="256" r="218" fill="none" stroke="url(#gold)" stroke-width="4" stroke-dasharray="14 14"/>
  <circle cx="256" cy="256" r="185" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <!-- Stellar Triangle -->
  <line x1="256" y1="140" x2="140" y2="330" stroke="url(#gold)" stroke-width="12"/>
  <line x1="256" y1="140" x2="372" y2="330" stroke="url(#gold)" stroke-width="12"/>
  <line x1="140" y1="330" x2="372" y2="330" stroke="url(#gold)" stroke-width="12"/>
  <!-- Major Constellation Stars -->
  <circle cx="256" cy="140" r="24" fill="url(#gold)"/>
  <circle cx="140" cy="330" r="24" fill="url(#gold)"/>
  <circle cx="372" cy="330" r="24" fill="url(#gold)"/>
  <circle cx="256" cy="265" r="10" fill="url(#gold)"/>
</svg>''',
}

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def export_all():
    html_content = '''<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>body{margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:512px;height:512px;overflow:hidden;}</style>
    </head><body><div id="container"></div></body></html>'''
    
    html_path = os.path.join(ICONS_DIR, "render_helper.html")
    with open(html_path, "w") as f:
        f.write(html_content)

    for name, svg in ICONS.items():
        # Save SVG in assets/icons/ and assets/
        svg_file = os.path.join(ICONS_DIR, f"{name}.svg")
        with open(svg_file, "w") as f:
            f.write(svg)
        
        # Also write to assets/ for convenience
        with open(os.path.join(ASSETS_DIR, f"{name}.svg"), "w") as f:
            f.write(svg)

        # Render HTML page for Chrome screenshot
        item_html = f'''<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>body{{margin:0;background:transparent;width:512px;height:512px;overflow:hidden;display:flex;align-items:center;justify-content:center;}}</style>
        </head><body>{svg}</body></html>'''
        item_html_file = os.path.join(ICONS_DIR, f"{name}.html")
        with open(item_html_file, "w") as f:
            f.write(item_html)

        png_file = os.path.join(ICONS_DIR, f"{name}.png")
        png_root_file = os.path.join(ASSETS_DIR, f"{name}.png")

        cmd = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--screenshot={png_file}",
            "--window-size=512,512",
            "--default-background-color=00000000",
            f"file://{item_html_file}"
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        # copy to assets/ root as well
        with open(png_file, "rb") as rf:
            data = rf.read()
        with open(png_root_file, "wb") as wf:
            wf.write(data)

        print(f"Generated {png_file} and {png_root_file}")

if __name__ == "__main__":
    export_all()
