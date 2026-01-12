import json

with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("="*70)
print("最終驗證報告")
print("="*70)

issues = []

for item in data['definitions']:
    cat_id = item['category']['id']
    cat_name = item['category']['name']
    variants = [v['id'] for v in item['variants']]
    
    # 1. 金色玩具飛機
    if cat_id == 'golden-airplane':
        print(f"\n✅ 1. 金色玩具飛機 - 獨立特殊分類")
        print(f"   Category: {cat_name}")
        print(f"   Type: {item['category']['type']}")
        print(f"   Variants: {variants}")
        if item['category']['type'] != 'special':
            issues.append("金色玩具飛機應該是 special 類型")
    
    # 2. 便利商店
    elif cat_id == 'convenience-store':
        print(f"\n✅ 2. 便利商店")
        print(f"   Variants: {variants}")
        has_bottle_cap = any('bottle_cap' in v for v in variants)
        has_snack = 'snack' in variants
        if not has_bottle_cap:
            issues.append("便利商店缺少 bottle_cap")
        if not has_snack:
            issues.append("便利商店缺少 snack")
        print(f"   有 Bottle Cap: {has_bottle_cap}")
        print(f"   有 Snack: {has_snack}")
    
    # 3. 超市
    elif cat_id == 'supermarket':
        print(f"\n✅ 3. 超市")
        print(f"   Variants: {variants}")
        allowed = ['banana_rare', 'banana', 'mushroom']
        extra = [v for v in variants if v not in allowed]
        missing = [v for v in allowed if v not in variants]
        if extra:
            issues.append(f"超市有多餘的 variants: {extra}")
        if missing:
            issues.append(f"超市缺少 variants: {missing}")
        print(f"   符合要求: {len(extra) == 0 and len(missing) == 0}")
    
    # 4. 美髮院
    elif cat_id == 'hair-salon':
        print(f"\n✅ 4. 美髮院")
        print(f"   Variants: {variants}")
        allowed = ['scissors_rare', 'scissors']
        extra = [v for v in variants if v not in allowed]
        if extra:
            issues.append(f"美髮院有多餘的 variants: {extra}")
        print(f"   符合要求: {len(extra) == 0}")
    
    # 5. 服飾店
    elif cat_id == 'clothes-store':
        print(f"\n✅ 5. 服飾店")
        print(f"   Variants: {variants}")
        if 'hair_tie' not in variants:
            issues.append("服飾店缺少 hair_tie")
        if len(variants) > 1:
            issues.append(f"服飾店應該只有 hair_tie，但有: {variants}")
        print(f"   符合要求: {'hair_tie' in variants and len(variants) == 1}")
    
    # 6. 公園
    elif cat_id == 'park':
        print(f"\n✅ 6. 公園")
        print(f"   Variants: {variants}")
        has_clover = any('clover' in v for v in variants)
        if not has_clover:
            issues.append("公園缺少 clover variants")
        print(f"   有 Clover: {has_clover}")
    
    # 7. 路邊
    elif cat_id == 'roadside':
        print(f"\n✅ 7. 路邊")
        print(f"   Variants: {variants}")
        has_coin = any('coin' in v for v in variants)
        has_sticker = any('sticker' in v for v in variants)
        if not has_coin:
            issues.append("路邊缺少 coin variants")
        if not has_sticker:
            issues.append("路邊缺少 sticker")
        print(f"   有 Coin: {has_coin}")
        print(f"   有 Sticker: {has_sticker}")
    
    # 8. 義式餐廳
    elif cat_id == 'italian':
        print(f"\n✅ 8. 義式餐廳")
        print(f"   Variants: {variants}")
        has_pizza = 'pizza' in variants
        has_pasta = 'pasta' in variants
        if not has_pizza:
            issues.append("義式餐廳缺少 pizza")
        if not has_pasta:
            issues.append("義式餐廳缺少 pasta")
        print(f"   有 Pizza: {has_pizza}")
        print(f"   有 Pasta: {has_pasta}")

# 檢查不應該存在的分類
all_cat_ids = [item['category']['id'] for item in data['definitions']]
shouldnt_exist = ['pasta', 'coin']  # 這些應該已經被合併
for cat_id in shouldnt_exist:
    if cat_id in all_cat_ids:
        issues.append(f"分類 {cat_id} 不應該獨立存在")

print("\n" + "="*70)
print("總結")
print("="*70)
print(f"總分類數: {len(data['definitions'])}")
print(f"一般分類: {len([item for item in data['definitions'] if item['category']['type'] == 'regular'])}")
print(f"特殊分類: {len([item for item in data['definitions'] if item['category'].get('type') != 'regular'])}")

if issues:
    print(f"\n⚠️ 發現 {len(issues)} 個問題:")
    for i, issue in enumerate(issues, 1):
        print(f"   {i}. {issue}")
else:
    print(f"\n✅ 所有檢查通過！")

print("\n" + "="*70)
