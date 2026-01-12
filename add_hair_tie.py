import json

# Load decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("為 clothes-store 添加 hair_tie variant...")
print("="*70)

# 創建 hair_tie variant
hair_tie_variant = {
    "id": "hair_tie",
    "name": "髮圈",
    "nameEn": "Hair Tie",
    "imageUrl": "https://pikmin.wiki.gallery/images/thumb/9/9a/Decor_Red_Hair_Tie.png/150px-Decor_Red_Hair_Tie.png",
    "imageUrls": {
        "red": "https://pikmin.wiki.gallery/images/thumb/9/9a/Decor_Red_Hair_Tie.png/150px-Decor_Red_Hair_Tie.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/1/12/Decor_Yellow_Hair_Tie.png/150px-Decor_Yellow_Hair_Tie.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/1/1e/Decor_Blue_Hair_Tie.png/150px-Decor_Blue_Hair_Tie.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/e/e2/Decor_White_Hair_Tie.png/150px-Decor_White_Hair_Tie.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/4/4e/Decor_Purple_Hair_Tie.png/150px-Decor_Purple_Hair_Tie.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/9/9b/Decor_Rock_Hair_Tie.png/150px-Decor_Rock_Hair_Tie.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/3/3d/Decor_Winged_Hair_Tie.png/150px-Decor_Winged_Hair_Tie.png"
    }
}

# Find clothes-store and update
found = False
for item in data['definitions']:
    if item['category']['id'] == 'clothes-store':
        item['variants'] = [hair_tie_variant]
        item['availablePikminTypes'] = ["red", "yellow", "blue", "white", "purple", "rock", "winged"]
        found = True
        print(f"✅ 找到 clothes-store")
        print(f"✅ 添加 hair_tie variant")
        print(f"✅ 設定 availablePikminTypes: {item['availablePikminTypes']}")
        break

if not found:
    print("❌ 找不到 clothes-store 分類")
else:
    # 寫回檔案
    with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 已寫回檔案！")
    print(f"\nhair_tie 詳細資訊:")
    print(f"  ID: {hair_tie_variant['id']}")
    print(f"  中文名: {hair_tie_variant['name']}")
    print(f"  英文名: {hair_tie_variant['nameEn']}")
    print(f"  顏色數量: {len(hair_tie_variant['imageUrls'])} 種")
    print(f"  包含顏色: {', '.join(hair_tie_variant['imageUrls'].keys())}")
    print(f"\n  注意: 沒有 ice (冰凍) 皮克敏")
