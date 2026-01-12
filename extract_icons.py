#!/usr/bin/env python3
"""
從 decor.json 提取正確的 icon 並更新 useDecorRules.ts
"""

import json

# 讀取 decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 提取所有一般分類的 icon
category_icons = {}
for item in data['definitions']:
    if item['category'].get('type') == 'regular':
        cat_id = item['category']['id']
        icon = item['category'].get('icon', '📍')
        category_icons[cat_id] = icon

# ID 映射（處理命名差異）
id_mappings = {
    'convenience-store': 'convenience',
    'sweets': 'sweetshop',
    'hamburger': 'burger',
    'drugstore': 'makeup',
    'clothes-store': 'clothing',
    'hair-salon': 'hair_salon',
    'post-office': 'post_office',
    'art-gallery': 'art_gallery',
    'art-studio': 'art_gallery',
    'movie-theater': 'movie_theater',
    'theme-park': 'theme_park',
    'bus-stop': 'bus_stop',
    'laundromat': 'laundry',
    'appliances': 'electronics',
    'cosmetics': 'cosmetics',
    'hardware': 'hardware',
    'electronics': 'electronics',
}

print("分類 ID 到 Icon 的映射 (用於 useDecorRules.ts):")
print("="*70)

# 按 useDecorRules 的 ID 輸出
for decor_id, rules_id in sorted(id_mappings.items()):
    if decor_id in category_icons:
        print(f"{rules_id:20s} : '{category_icons[decor_id]}'")

# 沒有映射的直接輸出
for cat_id, icon in sorted(category_icons.items()):
    if cat_id not in id_mappings:
        rules_id = cat_id.replace('-', '_')
        print(f"{rules_id:20s} : '{icon}'")

print("="*70)
