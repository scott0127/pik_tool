import os
import glob
import sys

try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

def remove_white_bg(img_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        r, g, b, a = item
        # Average brightness
        avg = (r + g + b) / 3.0
        if avg > 240:
            # completely transparent for very white
            newData.append((r, g, b, 0))
        elif avg > 200:
            # fade alpha for anti-aliased edges
            alpha = int(255 * (240 - avg) / 40.0)
            newData.append((r, g, b, alpha))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(img_path, "PNG")
    print(f"Processed {img_path}")

directory = r"c:\Users\scott\OneDrive\Desktop\pikmin\public\decor_localimg"
files = glob.glob(os.path.join(directory, "powder-*.png"))
if not files:
    print("No files found!")
for path in files:
    remove_white_bg(path)
print("Done!")
