import json
import copy

# Load decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 從圖片中看到的特殊分類（特殊分類包含地區限定、活動限定等）
SPECIAL_CATEGORIES = [
    'fingerboard',  # 指板
    'hanafuda',     # 花札  
    'chess',        # 西洋棋
    'coin',         # 金幣 (禮物貼紙)
    'rosette',     # 緞帶花飾
    'anniversary',  # 週年紀念
    'valentines',   # 情人節
    'easter',       # 復活節
    'halloween',    # 萬聖節
    'lunar-new-year', # 農曆新年
    'new-year',     # 新年
    'spring',       # 春季
    'summer',       # 夏季
    'fall',         # 秋季
    'winter',       # 冬季
    'ice-cream',    # 冰淇淋
    'puzzle',       # 拼圖
    'playing-card', # 撲克牌
    'mahjong',      # 麻將
    'pikmin4',      # Pikmin 4
    'koppaite',     # Koppaite 太空衣
    'mario',        # 瑪利歐
    'weather-rain', # 雨天
    'weather-snow', # 下雪
    'golden-airplane', # 金色玩具飛機 (新增特殊分類)
    # 其他地區限定
    'cheese',       # 起司店
    'aquarium',     # 水族館
    'art-studio',   # 藝術工作室
    'afternoon-tea',# 下午茶店
    'music-venue',  # 音樂場地
    'surf-shop',    # 衝浪店
    'shaved-ice',   # 刨冰店
    'mooncake',     # 月餅店
    'photo-studio', # 照相館
    'gaming',       # 電玩中心
    'baby',         # 嬰兒用品店
    'osechi',       # 御節料理店
    'rio-carnival', # 里約嘉年華
    'day-of-dead',  # 亡靈節
    'fairy-lights', # 彩燈
]

# 一般分類（按照遊戲順序）
REGULAR_CATEGORIES = [
    'restaurant', 'cafe', 'sweetshop', 'movie-theater', 'pharmacy',
    'zoo', 'forest', 'waterside', 'post-office', 'art-gallery',
    'airport', 'station', 'beach', 'burger', 'convenience-store',
    'supermarket', 'bakery', 'hair-salon', 'clothes-store', 'park',
    'library', 'roadside', 'sushi', 'mountain', 'stadium',
    'theme-park', 'bus-stop', 'italian', 'ramen', 'bridge',
    'hotel', 'cosmetics', 'shrine', 'electronics', 'curry',
    'hardware', 'university', 'taco', 'laundromat', 'korean'
]

print("開始檢查和修正分類...")
print("="*70)

# 建立 category dict
categories_dict = {}
for item in data['definitions']:
    cat_id = item['category']['id']
    categories_dict[cat_id] = item

# 1. 檢查 convenience-store
print("\n1. 檢查便利商店...")
if 'convenience-store' in categories_dict:
    variants = categories_dict['convenience-store']['variants']
    variant_ids = [v['id'] for v in variants]
    print(f"   當前 variants: {variant_ids}")
    has_bottle_cap = any('bottle_cap' in v['id'] for v in variants)
    has_snack = any(v['id'] == 'snack' for v in variants)
    print(f"   有 Bottle Cap: {has_bottle_cap}")
    print(f"   有 Snack: {has_snack}")
    
# 2. 檢查 supermarket
print("\n2. 檢查超市...")
if 'supermarket' in categories_dict:
    variants = categories_dict['supermarket']['variants']
    variant_ids = [v['id'] for v in variants]
    print(f"   當前 variants: {variant_ids}")
    should_keep = ['banana_rare', 'banana', 'mushroom']
    print(f"   應該保留: {should_keep}")
    to_remove = [v for v in variant_ids if v not in should_keep]
    print(f"   需要移除: {to_remove}")

# 3. 檢查 hair-salon
print("\n3. 檢查美髮院...")
if 'hair-salon' in categories_dict:
    variants = categories_dict['hair-salon']['variants']
    variant_ids = [v['id'] for v in variants]
    print(f"   當前 variants: {variant_ids}")
    
# 4. 檢查 clothes-store
print("\n4. 檢查服飾店...")
if 'clothes-store' in categories_dict:
    variants = categories_dict['clothes-store']['variants']
    variant_ids = [v['id'] for v in variants]
    print(f"   當前 variants: {variant_ids}")

# 5. 檢查 park
print("\n5. 檢查 park 分類...")
if 'park' in categories_dict:
    print("   ✅ Park 分類已存在")
    variants = categories_dict['park']['variants']
    variant_ids = [v['id'] for v in variants]
    print(f"   當前 variants: {variant_ids}")
else:
    print("   ❌ Park 分類不存在，需要創建")

# 6. 檢查 roadside
print("\n6. 檢查路邊...")
if 'roadside' in categories_dict:
    variants = categories_dict['roadside']['variants']
    variant_ids = [v['id'] for v in variants]
    print(f"   當前 variants: {variant_ids}")

# 7. 檢查 italian
print("\n7. 檢查義式餐廳...")
if 'italian' in categories_dict:
    variants = categories_dict['italian']['variants']
    variant_ids = [v['id'] for v in variants]
    print(f"   當前 variants: {variant_ids}")

# 8. 檢查 airport (金色飛機)
print("\n8. 檢查機場（金色飛機）...")
if 'airport' in categories_dict:
    variants = categories_dict['airport']['variants']
    for v in variants:
        if 'golden' in v['id'].lower():
            print(f"   找到金色飛機: {v['id']} - {v['name']}")

# 9. 列出所有不在清單中的分類
print("\n9. 檢查需要移除的分類...")
all_valid_categories = set(REGULAR_CATEGORIES + SPECIAL_CATEGORIES)
current_categories = set(categories_dict.keys())
to_remove_cats = current_categories - all_valid_categories
if to_remove_cats:
    print(f"   需要移除的分類: {sorted(to_remove_cats)}")
else:
    print("   ✅ 沒有需要移除的分類")

print("\n" + "="*70)
print("檢查完成！")
