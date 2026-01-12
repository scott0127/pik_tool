import json

# Load decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("檢查和修正分類 type...")
print("="*70)

# 用戶指定的一般分類 ID（從用戶提供的列表）
REGULAR_CATEGORIES = [
    'restaurant', 'cafe', 'sweetshop', 'movie-theater', 'pharmacy',
    'zoo', 'forest', 'waterside', 'post-office', 'art-gallery',
    'airport', 'station', 'beach', 'burger', 'convenience-store',
    'supermarket', 'bakery', 'hair-salon', 'clothes-store', 'park',
    'library', 'roadside', 'sushi', 'mountain', 'stadium',
    'weather-rain', 'weather-snow',  # 天氣也是一般分類
    'theme-park', 'bus-stop', 'italian', 'ramen', 'bridge',
    'hotel', 'cosmetics', 'shrine', 'electronics', 'curry',
    'hardware', 'university', 'taco', 'laundromat', 'korean'
]

changed = []
not_found = []

for cat_id in REGULAR_CATEGORIES:
    found = False
    for item in data['definitions']:
        if item['category']['id'] == cat_id:
            found = True
            current_type = item['category'].get('type', 'NO TYPE')
            if current_type != 'regular':
                item['category']['type'] = 'regular'
                changed.append(f"{cat_id}: {current_type} -> regular")
                print(f"  ✅ 修正 {cat_id}: {current_type} -> regular")
            break
    
    if not found:
        not_found.append(cat_id)
        print(f"  ⚠️ 找不到: {cat_id}")

# 所有不在 REGULAR_CATEGORIES 中的應該是 special
for item in data['definitions']:
    cat_id = item['category']['id']
    if cat_id not in REGULAR_CATEGORIES:
        current_type = item['category'].get('type', 'NO TYPE')
        if current_type != 'special':
            item['category']['type'] = 'special'
            changed.append(f"{cat_id}: {current_type} -> special")
            print(f"  ✅ 修正 {cat_id}: {current_type} -> special")

if changed:
    # 寫回檔案
    with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 已修正 {len(changed)} 個分類")
else:
    print(f"\n✅ 所有分類的 type 都已正確")

if not_found:
    print(f"\n⚠️ 以下分類在 JSON 中找不到: {not_found}")

# 統計
regular_count = len([item for item in data['definitions'] if item['category'].get('type') == 'regular'])
special_count = len([item for item in data['definitions'] if item['category'].get('type') == 'special'])

print(f"\n最終統計:")
print(f"  一般分類: {regular_count}")
print(f"  特殊分類: {special_count}")
print(f"  總計: {len(data['definitions'])}")
