#!/usr/bin/env python3
"""
列出完全沒有照片的分類
"""

import json

filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

print("="*70)
print("完全沒有照片的特殊分類清單")
print("="*70)

no_images = []
has_images = []

for item in data['definitions']:
    if item['category'].get('type') == 'special':
        cat_id = item['category']['id']
        cat_name = item['category']['name']
        cat_name_en = item['category']['nameEn']
        variants = item.get('variants', [])
        
        if not variants or len(variants) == 0:
            no_images.append({
                'id': cat_id,
                'name': cat_name,
                'nameEn': cat_name_en
            })
        else:
            has_images.append(cat_name)

print(f"\n統計:")
print(f"  有照片的分類: {len(has_images)} 個")
print(f"  沒有照片的分類: {len(no_images)} 個")

print(f"\n" + "="*70)
print(f"需要補充照片的分類清單 ({len(no_images)} 個)")
print("="*70)

for i, cat in enumerate(no_images, 1):
    print(f"{i:2d}. {cat['name']} ({cat['nameEn']})")
    print(f"    ID: {cat['id']}")
    print()

print("="*70)
print("注意事項:")
print("- 這些分類需要從 Pikmin Wiki 獲取圖片 URL")
print("- 每個分類可能有多個 variant（不同設計）")
print("- 每個 variant 需要 7-8 種顏色的圖片 URL")
print("="*70)

# 輸出為文字文件
with open('missing_images_list.txt', 'w', encoding='utf-8') as f:
    f.write("需要補充照片的分類清單\n")
    f.write("="*70 + "\n\n")
    for i, cat in enumerate(no_images, 1):
        f.write(f"{i}. {cat['name']} ({cat['nameEn']})\n")
        f.write(f"   ID: {cat['id']}\n\n")

print(f"\n已輸出到 missing_images_list.txt")
