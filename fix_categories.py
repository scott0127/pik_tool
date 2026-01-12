import json
import copy

# Load decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data =json.load(f)

# 建立 category dict
categories_dict = {}
variants_to_move = []  # 需要移動的 variants

for item in data['definitions']:
    cat_id = item['category']['id']
    categories_dict[cat_id] = item

print("開始修正分類錯誤...")
print("="*70)

# 1. 處理金色玩具飛機 - 從 airport 移到新的 golden-airplane 特殊分類
print("\n1. 處理金色玩具飛機...")
if 'airport' in categories_dict:
    airport = categories_dict['airport']
    golden_airplane = None
    new_variants = []
    
    for variant in airport['variants']:
        if 'golden' in variant['id'].lower():
            golden_airplane = variant
            print(f"   找到金色飛機: {variant['id']}")
        else:
            new_variants.append(variant)
    
    if golden_airplane:
        # 更新 airport 的 variants
        airport['variants'] = new_variants
        
        # 創建新的 golden-airplane 分類
        categories_dict['golden-airplane'] = {
            "category": {
                "id": "golden-airplane",
                "name": "金色飛機玩具",
                "nameEn": "Golden Toy Airplane",
                "type": "special",
                "icon": "✈️"
            },
            "variants": [golden_airplane],
            "availablePikminTypes": ["yellow"]
        }
        print(f"   ✅ 創建新分類 golden-airplane")

# 2. 便利商店 - 找到 snack 並加入
print("\n2. 修正便利商店...")
if 'convenience-store' in categories_dict:
    conv = categories_dict['convenience-store']
    has_snack = any(v['id'] == 'snack' for v in conv['variants'])
    
    if not has_snack:
        # 從 supermarket 找 snack
        if 'supermarket' in categories_dict:
            supermarket = categories_dict['supermarket']
            snack_variant = None
            new_super_variants = []
            
            for v in supermarket['variants']:
                if v['id'] == 'snack':
                    snack_variant = v
                else:
                    new_super_variants.append(v)
            
            if snack_variant:
                conv['variants'].append(snack_variant)
                supermarket['variants'] = new_super_variants
                print(f"   ✅ 將 snack 從超市移到便利商店")

# 3. 超市 - 只保留 banana_rare, banana, mushroom
print("\n3. 修正超市...")
if 'supermarket' in categories_dict:
    supermarket = categories_dict['supermarket']
    allowed_variants = ['banana_rare', 'banana', 'mushroom']
    new_variants = [v for v in supermarket['variants'] if v['id'] in allowed_variants]
    removed = [v['id'] for v in supermarket['variants'] if v['id'] not in allowed_variants]
    
    supermarket['variants'] = new_variants
    print(f"   ✅ 保留: {[v['id'] for v in new_variants]}")
    print(f"   ✅ 移除: {removed}")

#4. 美髮院 - 只保留 scissors_rare, scissors
print("\n4. 修正美髮院...")
if 'hair-salon' in categories_dict:
    hair_salon = categories_dict['hair-salon']
    allowed_variants = ['scissors_rare', 'scissors']
    new_variants = [v for v in hair_salon['variants'] if v['id'] in allowed_variants]
    removed = [v['id'] for v in hair_salon['variants'] if v['id'] not in allowed_variants]
    
    hair_salon['variants'] = new_variants
    print(f"   ✅ 保留: {[v['id'] for v in new_variants]}")
    if removed:
        print(f"   ✅ 移除: {removed}")

# 5. 服飾店 - 改為 hair_tie
print("\n5. 修正服飾店...")
if 'clothes-store' in categories_dict:
    clothes = categories_dict['clothes-store']
    # 檢查是否有 hair_tie
    has_hair_tie = any(v['id'] == 'hair_tie' for v in clothes['variants'])
    
    if not has_hair_tie:
        # 可能需要從其他地方找或創建
        print(f"   當前 variants: {[v['id'] for v in clothes['variants']]}")
        print(f"   ⚠️ 需要手動檢查 hair_tie variant")
    else:
        # 只保留 hair_tie
        new_variants = [v for v in clothes['variants'] if v['id'] == 'hair_tie']
        clothes['variants'] = new_variants
        print(f"   ✅ 只保留 hair_tie")

# 6. 補上 park 分類
print("\n6. 檢查 park 分類...")
if 'park' not in categories_dict:
    # 需要創建 park 分類，但需要找到 clover 和 four_leaf_clover variants
    print("   ⚠️ park 分類不存在，需要創建並找到 clover variants")
else:
    print(f"   ✅ park 已存在，variants: {[v['id'] for v in categories_dict['park']['variants']]}")

# 7. 路邊 - 補上 coin_rare 和 coin
print("\n7. 修正路邊...")
if 'roadside' in categories_dict:
    roadside = categories_dict['roadside']
    current_variants = {v['id'] for v in roadside['variants']}
    print(f"   當前 variants: {list(current_variants)}")
    
    # 檢查 coin 分類
    if 'coin' in categories_dict:
        coin_cat = categories_dict['coin']
        print(f"   發現 coin 分類，variants: {[v['id'] for v in coin_cat['variants']]}")
        # 應該將 coin 的 variants 移到 roadside
        for v in coin_cat['variants']:
            if v['id'] not in current_variants:
                roadside['variants'].append(v)
                print(f"   ✅ 將 {v['id']} 從 coin 移到 roadside")

# 8. 義式餐廳 - 補上 pizza 和 pasta
print("\n8. 修正義式餐廳...")
if 'italian' in categories_dict:
    italian = categories_dict['italian']
    current_variants = {v['id'] for v in italian['variants']}
    print(f"   當前 variants: {list(current_variants)}")
    
    # 檢查 pasta 分類
    if 'pasta' in categories_dict:
        pasta_cat = categories_dict['pasta']
        print(f"   發現 pasta 分類，variants: {[v['id'] for v in pasta_cat['variants']]}")
        # 將 pasta 分類的 variants 移到 italian
        for v in pasta_cat['variants']:
            if v['id'] not in current_variants:
                italian['variants'].append(v)
                print(f"   ✅ 將 {v['id']} 從 pasta 移到 italian")

print("\n" + "="*70)
print("修正完成！準備寫回檔案...")

# 重建 definitions 列表
new_definitions = []

# 一般分類順序
regular_order = [
    'restaurant', 'cafe', 'sweetshop', 'movie-theater', 'pharmacy',
    'zoo', 'forest', 'waterside', 'post-office', 'art-gallery',
    'airport', 'station', 'beach', 'burger', 'convenience-store',
    'supermarket', 'bakery', 'hair-salon', 'clothes-store', 'park',
    'library', 'roadside', 'sushi', 'mountain', 'stadium',
    'theme-park', 'bus-stop', 'italian', 'ramen', 'bridge',
    'hotel', 'cosmetics', 'shrine', 'electronics', 'curry',
    'hardware', 'university', 'taco', 'laundromat', 'korean'
]

# 先加入一般分類
for cat_id in regular_order:
    if cat_id in categories_dict:
        new_definitions.append(categories_dict[cat_id])

# 再加入特殊分類
special_cats = [cat_id for cat_id in categories_dict.keys() if cat_id not in regular_order]
# 移除不需要的分類
cats_to_remove = ['pasta', 'coin']  # 這些已經合併到其他分類
special_cats = [c for c in special_cats if c not in cats_to_remove]

for cat_id in sorted(special_cats):
    new_definitions.append(categories_dict[cat_id])

data['definitions'] = new_definitions

# 寫回檔案
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ 已寫回檔案！")
print(f"總分類數: {len(new_definitions)}")
print(f"一般分類: {len([c for c in new_definitions if c['category']['type'] == 'regular'])}")
print(f"特殊分類: {len([c for c in new_definitions if c['category']['type'] != 'regular'])}")
