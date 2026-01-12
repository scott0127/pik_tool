import json

with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("快速驗證關鍵修正:")
print("="*50)

categories_dict = {item['category']['id']: item for item in data['definitions']}

checks = [
    ('golden-airplane', '金色飛機'),
    ('convenience-store', '便利商店'),
    ('supermarket', '超市'),
    ('hair-salon', '美髮院'),
    ('clothes-store', '服飾店'),
    ('park', '公園'),
    ('roadside', '路邊'),
    ('italian', '義式餐廳'),
]

for cat_id, cat_name_zh in checks:
    if cat_id in categories_dict:
        item = categories_dict[cat_id]
        variants = [v['id'] for v in item['variants']]
        print(f"\n{cat_name_zh} ({cat_id}):")
        print(f"  Variants: {', '.join(variants)}")
    else:
        print(f"\n{cat_name_zh} ({cat_id}): ❌ 不存在")

print("\n" + "="*50)
print(f"總分類數: {len(data['definitions'])}")
