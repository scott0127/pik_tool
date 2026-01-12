#!/usr/bin/env python3
"""
比較 decor.json 的一般分類和 useDecorRules 的規則
找出缺少的分類
"""

import json

# 讀取 decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 提取所有一般分類
regular_categories = [
    item['category'] for item in data['definitions'] 
    if item['category'].get('type') == 'regular'
]

print(f"📊 decor.json 一般分類總數: {len(regular_categories)}")
print("\n" + "="*70)
print("所有一般分類:")
print("="*70)

regular_ids = []
for i, cat in enumerate(regular_categories, 1):
    cat_id = cat['id']
    cat_name = cat['name']
    cat_name_en = cat.get('nameEn', '')
    regular_ids.append(cat_id)
    print(f"{i:2d}. {cat_id:30s} - {cat_name:15s} ({cat_name_en})")

print("\n" + "="*70)

# useDecorRules 中的規則（手動列出）
map_rules = [
    'restaurant', 'cafe', 'sweetshop', 'bakery', 'burger', 'pizza', 
    'italian', 'ramen', 'sushi', 'curry', 'korean', 'mexican',
    'convenience', 'supermarket', 'makeup', 'clothing', 'appliance', 
    'diy', 'bookstore', 'pharmacy', 'hair_salon', 'laundry', 
    'post_office', 'hotel', 'university', 'station', 'bus_stop', 
    'airport', 'bridge', 'park', 'forest', 'waterside', 'beach', 
    'mountain', 'zoo', 'theme_park', 'art_gallery', 'stadium', 
    'movie_theater', 'shrine'
]

print(f"🗺️  useDecorRules 規則總數: {len(map_rules)}")
print("\n" + "="*70)

# 嘗試匹配（考慮 ID 可能不完全一致）
# 創建可能的映射
possible_mappings = {
    'convenience-store': 'convenience',
    'sweets': 'sweetshop',
    'hamburger': 'burger',
    'drugstore': 'makeup',
    'clothes-store': 'clothing',
    'hair-salon': 'hair_salon',
    'post-office': 'post_office',
    'art-studio': 'art_gallery',
    'movie-theater': 'movie_theater',
}

# 找出 decor.json 中有但 map 中沒有的
missing_in_map = []
for cat_id in regular_ids:
    # 檢查直接匹配
    if cat_id in map_rules:
        continue
    # 檢查映射
    if cat_id in possible_mappings and possible_mappings[cat_id] in map_rules:
        continue
    # 都沒匹配到
    missing_in_map.append(cat_id)

print("❌ decor.json 中有但 useDecorRules 中缺少的分類:")
print("="*70)
if missing_in_map:
    for cat_id in missing_in_map:
        cat = next(c for c in regular_categories if c['id'] == cat_id)
        print(f"  - {cat_id:30s} : {cat['name']} ({cat.get('nameEn', '')})")
    print(f"\n總共缺少: {len(missing_in_map)} 個分類")
else:
    print("  沒有缺少的分類！")

print("\n" + "="*70)
print("🔍 可能需要添加到 useDecorRules 的分類:")
print("="*70)

for cat_id in missing_in_map:
    cat = next(c for c in regular_categories if c['id'] == cat_id)
    icon = cat.get('icon', '📍')
    name = cat['name']
    name_en = cat.get('nameEn', '')
    
    # 建議 OSM 標籤
    suggested_tags = []
    if 'cheese' in cat_id:
        suggested_tags = ['shop=cheese', 'cuisine=cheese']
    elif 'fish' in cat_id:
        suggested_tags = ['shop=seafood', 'cuisine=seafood']
    elif 'french' in cat_id:
        suggested_tags = ['cuisine=french']
    elif 'gaming' in cat_id or 'game' in cat_id:
        suggested_tags = ['shop=video_games', 'leisure=amusement_arcade']
    elif 'aquarium' in cat_id:
        suggested_tags = ['tourism=aquarium']
    
    print(f"\n  {{ id: '{cat_id}', name: '{name}', icon: '{icon}', tags: {suggested_tags} }},")
