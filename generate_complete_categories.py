#!/usr/bin/env python3
"""
從 Wiki 數據和 decor.json 創建完整的 42 個分類清單
"""

import json

# 讀取 decor.json 獲取中文名稱
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

regular_categories = {
    item['category']['id']: {
        'name': item['category']['name'],
        'nameEn': item['category'].get('nameEn', ''),
        'icon': item['category'].get('icon', '📍')
    }
    for item in data['definitions'] 
    if item['category'].get('type') == 'regular'
}

# Wiki OSM 標籤映射（從提供的表格數據）
wiki_osm_tags = {
    'restaurant': ['amenity=restaurant'],
    'cafe': ['amenity=cafe'],
    'sweetshop': ['shop=pastry'],
    'sweets': ['shop=pastry'],  # alias
    'movie-theater': ['amenity=cinema'],
    'pharmacy': ['amenity=pharmacy'],
    'zoo': ['tourism=zoo'],
    'forest': ['natural=wood', 'landuse=forest'],
    'waterside': ['natural=water'],
    'post-office': ['amenity=post_office'],
    'art-gallery': ['shop=art'],
    'art-studio': ['shop=art'],  # alias
    'airport': ['aeroway=aerodrome'],
    'station': ['railway=station', 'building=train_station'],
    'beach': ['natural=beach'],
    'hamburger': ['amenity=fast_food'],
    'convenience-store': ['shop=convenience'],
    'supermarket': ['shop=supermarket'],
    'bakery': ['shop=bakery'],
    'hair-salon': ['shop=hairdresser'],
    'clothes-store': ['shop=clothes', 'shop=shoes'],
    'park': ['leisure=park'],
    'library': ['amenity=library', 'shop=books'],
    'sushi': ['cuisine=sushi'],
    'mountain': ['natural=peak'],
    'stadium': ['leisure=stadium'],
    'theme-park': ['tourism=theme_park'],
    'bus-stop': ['highway=bus_stop'],
    'italian': ['cuisine=pizza', 'cuisine=mediterranean'],
    'ramen': ['cuisine=chinese', 'cuisine=noodle', 'cuisine=ramen', 'cuisine=udon', 'cuisine=soba'],
    'bridge': ['bridge=yes'],
    'hotel': ['tourism=hotel'],
    'drugstore': ['shop=department_store'],
    'shrine': ['amenity=place_of_worship'],
    'appliances': ['shop=appliance', 'shop=computer', 'shop=electronics'],
    'curry': ['cuisine=curry', 'cuisine=indian', 'cuisine=sri_lankan'],
    'diy': ['shop=doityourself', 'shop=hardware'],
    'university': ['amenity=university', 'amenity=college'],
    'mexican': ['cuisine=mexican'],
    'laundromat': ['shop=laundry', 'shop=dry_cleaning'],
    'korean': ['cuisine=korean'],
}

print("="*80)
print("完整 42 個一般分類清單（含 OSM 標籤）")
print("="*80)
print()

# ID 映射（處理命名差異）
id_mappings = {
    'convenience-store': 'convenience',
    'sweets': 'sweetshop',
    'hamburger': 'burger',
    'drugstore': 'makeup',
    'clothes-store': 'clothing',
    'hair-salon': 'hair_salon',
    'post-office': 'post_office',
    'art-studio': 'art_gallery',
    'art-gallery': 'art_gallery',
    'movie-theater': 'movie_theater',
    'theme-park': 'theme_park',
    'bus-stop': 'bus_stop',
    'laundromat': 'laundry',
    'appliances': 'appliance',
}

result_categories = []

for cat_id, cat_data in sorted(regular_categories.items()):
    # 獲取 OSM 標籤
    osm_tags = wiki_osm_tags.get(cat_id, [])
    if not osm_tags and cat_id in id_mappings:
        # 嘗試使用映射的 ID
        osm_tags = wiki_osm_tags.get(id_mappings.get(cat_id, ''), [])
    
    # 生成 useDecorRules 的 ID（使用映射）
    rules_id = id_mappings.get(cat_id, cat_id.replace('-', '_'))
    
    result_categories.append({
        'id': rules_id,
        'decor_json_id': cat_id,
        'name': cat_data['name'],
        'nameEn': cat_data['nameEn'],
        'icon': cat_data['icon'],
        'tags': osm_tags
    })
    
    tags_str = ', '.join([f"'{tag}'" for tag in osm_tags]) if osm_tags else '[]'
    print(f"  {{ id: '{rules_id}', name: '{cat_data['name']}', icon: '{cat_data['icon']}', tags: [{tags_str}] }},")

print()
print(f"總計: {len(result_categories)} 個分類")
print("="*80)

# 儲存為 JSON 供後續使用
with open('complete_categories.json', 'w', encoding='utf-8') as f:
    json.dump(result_categories, f, ensure_ascii=False, indent=2)
    
print("\n已儲存到 complete_categories.json")
