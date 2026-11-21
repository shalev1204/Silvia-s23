"""Contact sheets of a walk's screenshots: 6 per sheet (3 x 2), each labelled with its file name.
Usage: python3 contact.py DIR [first-last]  -> DIR/sheet_NN.png"""
import glob, os, sys
from PIL import Image, ImageDraw

d = sys.argv[1]
files = sorted(f for f in glob.glob(os.path.join(d, "[0-9]*.png")))
if len(sys.argv) > 2:
    a, b = (int(x) for x in sys.argv[2].split("-"))
    files = [f for f in files if a <= int(os.path.basename(f).split("_")[0]) <= b]
W_, H_ = 720, 450
for s in range(0, len(files), 6):
    sheet = Image.new("RGB", (W_ * 3, (H_ + 24) * 2), "white")
    dr = ImageDraw.Draw(sheet)
    for k, f in enumerate(files[s:s + 6]):
        im = Image.open(f).convert("RGB"); im.thumbnail((W_, H_))
        x, y = (k % 3) * W_, (k // 3) * (H_ + 24)
        sheet.paste(im, (x, y + 24)); dr.text((x + 6, y + 6), os.path.basename(f), fill="black")
    out = os.path.join(d, "sheet_%02d.png" % (s // 6 + 1)); sheet.save(out); print(out)
