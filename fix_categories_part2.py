import json

# Load decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 建立 category dict
categories_dict = {}
for item in data['definitions']:
    cat_id = item['category']['id']
    categories_dict[cat_id] = item

print("繼續修正分類錯誤（Part 2）...")
print("="*70)

# 1. 從 clothes-store 移動 clover 到新的 park 分類
print("\n1. 創建 park 分類並移動 clover...")
if 'clothes-store' in categories_dict:
    clothes = categories_dict['clothes-store']
    clover_variants = []
    other_variants = []
    
    for v in clothes['variants']:
        if 'clover' in v['id'].lower():
            clover_variants.append(v)
            print(f"   找到: {v['id']} - {v['name']}")
        else:
            other_variants.append(v)
    
    # 更新 clothes-store
    clothes['variants'] = other_variants
   
    # 創建 park 分類
    if clover_variants:
        categories_dict['park'] = {
            "category": {
                "id": "park",
                "name": "公園",
                "nameEn": "Park",
                "type": "regular",
                "icon": "🍀"
            },
            "variants": clover_variants,
            "availablePikminTypes": ["red", "yellow", "blue", "white", "purple", "rock", "winged"]
        }
        print(f"   ✅ 創建 park 分類，包含 {len(clover_variants)} 個 variants")

# 2. 為 clothes-store 找或確認 hair_tie
print("\n2. 修正 clothes-store...")
if 'clothes-store' in categories_dict:
    clothes = categories_dict['clothes-store']
    current_variants = [v['id'] for v in clothes['variants']]
    print(f"   當前 variants: {current_variants}")
    
    # 檢查是否有 hair_tie
    has_hair_tie = 'hair_tie' in current_variants
    
    if not has_hair_tie:
        # 需要從其他地方找 hair_tie，或許在 hair-salon?
        if 'hair-salon' in categories_dict:
            hair = categories_dict['hair-salon']
            hair_tie_variant = None
            new_hair_variants = []
            
            for v in hair['variants']:
                if v['id'] == 'hair_tie':
                    hair_tie_variant = v
                else:
                    new_hair_variants.append(v)
            
            if hair_tie_variant:
                clothes['variants'] = [hair_tie_variant]
                hair['variants'] = new_hair_variants
                print(f"   ✅ 將 hair_tie 從 hair-salon 移到 clothes-store")
            else:
                print(f"   ⚠️ 未找到 hair_tie variant")
        else:
            print(f"   ⚠️ hair-salon 不存在")
    else:
        # 只保留 hair_tie
        clothes['variants'] = [v for v in clothes['variants'] if v['id'] == 'hair_tie']
        print(f"   ✅ clothes-store 已有 hair_tie")

print("\n" + "="*70)
print("重建 definitions 順序...")

# 重建 definitions 列表
new_definitions = []

# 一般分類順序（包含 park 在正確位置）
regular_order = [
    'restaurant', 'cafe', 'sweetshop', 'movie-theater', 'pharmacy',
    'zoo', 'forest', 'waterside', 'post-office', 'art-gallery',
    'airport', 'station', 'beach', 'burger', 'convenience-store',
    'supermarket', 'bakery', 'hair-salon', 'clothes-store', 'park',  # park 在這
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
# 移除已經合併的分類
cats_to_remove = ['pasta', 'coin']
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

# 驗證修正
print("\n" + "="*70)
print("驗證修正結果...")

# 檢查 park
park = [item for item in new_definitions if item['category']['id'] == 'park']
if park:
    print(f"\n✅ Park: {park[0]['category']['name']}")
    print(f"   Variants: {[v['id'] + ' (' + v['name'] + ')' for v in park[0]['variants']]}")

# 檢查 clothes-store
clothes = [item for item in new_definitions if item['category']['id'] == 'clothes-store']
if clothes:
    print(f"\n✅ Clothes-store: {clothes[0]['category']['name']}")
    print(f"   Variants: {[v['id'] + ' (' + v['name'] + ')' for v in clothes[0]['variants']]}")

# 檢查 golden-airplane
golden = [item for item in new_definitions if item['category']['id'] == 'golden-airplane']
if golden:
    print(f"\n✅ Golden-airplane: {golden[0]['category']['name']}")
    print(f"   Variants: {[v['id'] + ' (' + v['name'] + ')' for v in golden[0]['variants']]}")

# 檢查 convenience-store
conv = [item for item in new_definitions if item['category']['id'] == 'convenience-store']
if conv:
    print(f"\n✅ Convenience-store: {conv[0]['category']['name']}")
    print(f"   Variants: {[v['id'] for v in conv[0]['variants']]}")

# 檢查 supermarket
super_m = [item for item in new_definitions if item['category']['id'] == 'supermarket']
if super_m:
    print(f"\n✅ Supermarket: {super_m[0]['category']['name']}")
    print(f"   Variants: {[v['id'] for v in super_m[0]['variants']]}")

# 檢查 italian
italian = [item for item in new_definitions if item['category']['id'] == 'italian']
if italian:
    print(f"\n✅ Italian: {italian[0]['category']['name']}")
    print(f"   Variants: {[v['id'] for v in italian[0]['variants']]}")

# 檢查 roadside
roadside = [item for item in new_definitions if item['category']['id'] == 'roadside']
if roadside:
    print(f"\n✅ Roadside: {roadside[0]['category']['name']}")
    print(f"   Variants: {[v['id'] for v in roadside[0]['variants']]}")

print("\n" + "="*70)
print("修正完成！")
