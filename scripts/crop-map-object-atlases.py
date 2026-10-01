"""Crop the two generated map-object atlases without repainting or resampling.

Alpha is retained verbatim; an alpha threshold only finds the trim bounds.
"""
from pathlib import Path
from shutil import copy2
import json

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:/Users/scott/.codex/generated_images/01a0f84f-e099-7752-a4e3-ae02064a1a79")
DESTINATION = ROOT / "public/images/map-objects"
DESTINATION.mkdir(parents=True, exist_ok=True)

ATLASES = [
    {
        "file": "exec-e77a9ead-4671-45b2-b39b-635f623ca35a.png",
        "rows": [
            (["restaurant", "sweetshop", "bakery"], (0, 437), (0, 430, 812, 1254)),
            (["italian", "ramen", "sushi"], (437, 836), (0, 430, 820, 1254)),
            (["curry", "korean", "taco"], (836, 1254), (0, 430, 840, 1254)),
        ],
    },
    {
        "file": "exec-69832909-1eae-4d68-a61c-742f797c6522.png",
        "rows": [
            (["convenience", "supermarket", "cosmetics"], (0, 437), (0, 418, 820, 1254)),
            (["clothing", "electronics", "hardware"], (437, 836), (0, 418, 820, 1254)),
            (["pharmacy", "hair_salon", "laundry"], (836, 1254), (0, 418, 836, 1254)),
        ],
    },
]

report = []
for atlas in ATLASES:
    source = SOURCE / atlas["file"]
    image = Image.open(source).convert("RGBA")
    for ids, (top, bottom), xs in atlas["rows"]:
        for index, category_id in enumerate(ids):
            left, right = xs[index], xs[index + 1]
            piece = image.crop((left, top, right, bottom))
            # Exclude almost invisible atlas specks from the trim calculation.
            bounds = piece.getchannel("A").point(lambda value: 255 if value > 16 else 0).getbbox()
            if bounds is None:
                raise ValueError(f"Empty object cell: {category_id}")
            x0, y0, x1, y1 = bounds
            trim = (max(0, x0 - 8), max(0, y0 - 8), min(piece.width, x1 + 8), min(piece.height, y1 + 8))
            piece = piece.crop(trim)
            target = DESTINATION / f"{category_id}.png"
            if target.exists():
                raise FileExistsError(f"Refusing to replace {target}")
            piece.save(target, optimize=True)
            alpha = piece.getchannel("A")
            assert alpha.getextrema() == (0, 255), f"Missing transparency: {category_id}"
            report.append({"id": category_id, "size": piece.size, "bytes": target.stat().st_size, "alpha_empty_pixels": alpha.histogram()[0], "source": str(source), "atlas_crop": [left, top, right, bottom], "trim": trim})

for category_id, existing_name in [("burger", "burger"), ("cafe", "coffee")]:
    source = ROOT / f"public/images/motion-lab/{existing_name}.png"
    target = DESTINATION / f"{category_id}.png"
    if target.exists():
        raise FileExistsError(f"Refusing to replace {target}")
    copy2(source, target)
    image = Image.open(target)
    report.append({"id": category_id, "size": image.size, "bytes": target.stat().st_size, "source": str(source), "reused": True})

report.sort(key=lambda item: item["id"])
report_path = ROOT / "output/map-object-art/food-retail-alpha-report.json"
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))
