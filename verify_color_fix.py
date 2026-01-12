import json

# Load decor.json to check specific examples
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("="*70)
print("驗證修改效果 - 檢查特定裝飾的顏色數量")
print("="*70)

# Find theme-park category
theme_park = None
for item in data['definitions']:
    if item['category']['id'] == 'theme-park':
        theme_park = item
        break

if theme_park:
    print("\n✅ 主題樂園 (Theme Park) 分類:")
    print(f"   Category ID: {theme_park['category']['id']}")
    print(f"   Available Pikmin Types: {theme_park.get('availablePikminTypes', 'ALL')}")
    print(f"\n   Variants:")
    for variant in theme_park['variants']:
        print(f"\n   📍 {variant['id']}: {variant['name']}")
        if 'imageUrls' in variant:
            colors = list(variant['imageUrls'].keys())
            print(f"      實際有圖片的顏色: {colors}")
            print(f"      顏色數量: {len(colors)}")
            print(f"      ✅ 前端應該只顯示 {len(colors)} 個卡片")
        else:
            print(f"      ⚠️ 只有單一 imageUrl，會使用 availablePikminTypes")

# Find airport category for golden airplane
print("\n" + "="*70)
airport = None
for item in data['definitions']:
    if item['category']['id'] == 'airport':
        airport = item
        break

if airport:
    print("\n✅ 機場 (Airport) 分類:")
    print(f"   Available Pikmin Types: {airport.get('availablePikminTypes', 'ALL')}")
    print(f"\n   Variants:")
    for variant in airport['variants']:
        if 'golden' in variant['id'].lower():
            print(f"\n   📍 {variant['id']}: {variant['name']}")
            if 'imageUrls' in variant:
                colors = list(variant['imageUrls'].keys())
                print(f"      實際有圖片的顏色: {colors}")
                print(f"      顏色數量: {len(colors)}")
                print(f"      ✅ 前端應該只顯示 {len(colors)} 個卡片")

# Find station category for gold ticket
print("\n" + "="*70)
station = None
for item in data['definitions']:
    if item['category']['id'] == 'station':
        station = item
        break

if station:
    print("\n✅ 車站 (Station) 分類:")
    print(f"   Available Pikmin Types: {station.get('availablePikminTypes', 'ALL')}")
    print(f"\n   Variants:")
    for variant in station['variants']:
        if 'gold' in variant['id'].lower():
            print(f"\n   📍 {variant['id']}: {variant['name']}")
            if 'imageUrls' in variant:
                colors = list(variant['imageUrls'].keys())
                print(f"      實際有圖片的顏色: {colors}")
                print(f"      顏色數量: {len(colors)}")
                print(f"      ✅ 前端應該只顯示 {len(colors)} 個卡片")

# Check a normal variant with all colors
print("\n" + "="*70)
restaurant = None
for item in data['definitions']:
    if item['category']['id'] == 'restaurant':
        restaurant = item
        break

if restaurant:
    print("\n✅ 餐廳 (Restaurant) 分類 - 正常範例:")
    print(f"   Available Pikmin Types: {restaurant.get('availablePikminTypes', 'ALL')}")
    print(f"\n   第一個 Variant:")
    variant = restaurant['variants'][0]
    print(f"\n   📍 {variant['id']}: {variant['name']}")
    if 'imageUrls' in variant:
        colors = list(variant['imageUrls'].keys())
        print(f"      實際有圖片的顏色: {colors}")
        print(f"      顏色數量: {len(colors)}")
        print(f"      ✅ 前端應該顯示 {len(colors)} 個卡片")

print("\n" + "="*70)
print("提示: 請在瀏覽器中檢查 http://localhost:3000/collection")
print("      搜尋上述裝飾，確認顯示的卡片數量符合預期")
print("="*70)
