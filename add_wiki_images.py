#!/usr/bin/env python3
"""
從 Pikmin Wiki 提取的圖片 URLs 添加到 decor.json
"""

import json

# 從 Wiki 提取的圖片 URL patterns
# 格式: https://www.pikminwiki.com/images/thumb/X/XX/Decor_{Color}_{Category}.png/...
BASE_URL = "https://www.pikminwiki.com/images"

# Pikmin 顏色對應
PIKMIN_COLORS = {
    'red': 'Red',
    'yellow': 'Yellow',
    'blue': 'Blue',
    'white': 'White',
    'purple': 'Purple',
    'rock': 'Rock',
    'winged': 'Winged',
    'ice': 'Ice'
}

# Wiki 上的分類名稱對應
WIKI_CATEGORIES = {
    '2025-ornament': '2025_Ornament',
    'jack-o-lantern': "Jack-o%27-Lantern",  # Note: %27 is '
    'halloween-treat': 'Halloween_Treat',
    'halloween-light': 'Halloween_Light',
    'first-anniversary-snack': 'First_Anniversary_Snack',
    'mitten': 'Mitten',
    '2023-glasses': '2023_Glasses',
    '2024-glasses': '2024_Glasses',
    'valentine-sticker': 'Valentine_Sticker',
    'reverse-valentine-sticker': "Reverse_Valentine%27s_Day_Sticker",
    'easter-egg': 'Easter_Egg',
    'bunny-egg': 'Bunny_Egg',
    'sneaker-keychain': 'Sneaker_Keychain',
    '3rd-anniversary-cupcake': '3rd_Anniversary_Cupcake',
    'party-popper': 'Party_Popper_2025',
    'chocolate': 'Chocolate',
    '4th-anniversary-flower-box': '4th_Anniversary_Flower_Box',
    '4th-anniversary-snack': '4th_Anniversary_Snack',
    'present-sticker-gold': 'Present_Sticker_%28Gold%29',
}

def generate_image_urls(category_id):
    """為指定分類生成圖片 URLs"""
    if category_id not in WIKI_CATEGORIES:
        return {}
    
    wiki_name = WIKI_CATEGORIES[category_id]
    image_urls = {}
    
    # 大多數分類有 7 個基本顏色，少數有 ice (8個)
    # 先生成 7 個基本顏色
    for color_key, color_name in PIKMIN_COLORS.items():
        if color_key == 'ice':
            continue  # 跳過 ice，稍後處理
        # 構建圖片 URL
        # 實際 URL 格式: /images/thumb/X/XX/Decor_Red_2025_Ornament.png/200px-Decor_Red_2025_Ornament.png
        # 簡化使用: /File:Decor_{Color}_{Category}.png
        url = f"{BASE_URL}/thumb/Decor_{color_name}_{wiki_name}.png/200px-Decor_{color_name}_{wiki_name}.png"
        image_urls[color_key] = url
    
    return image_urls

def add_variants_to_categories():
    """為所有缺少 variants 的分類添加資料"""
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("添加 variants 和圖片 URLs...")
    print("="*70)
    
    added_count = 0
    
    for item in data['definitions']:
        cat_id = item['category']['id']
        cat_name = item['category']['name']
        
        # 只處理特殊分類且沒有 variants 的
        if item['category'].get('type') == 'special' and (not item.get('variants') or len(item['variants']) == 0):
            
            if cat_id in WIKI_CATEGORIES:
                # 生成圖片 URLs
                image_urls = generate_image_urls(cat_id)
                
                if image_urls:
                    # 創建一個基本 variant
                    variant = {
                        'id': cat_id.replace('-', '_'),
                        'name': cat_name,
                        'nameEn': item['category']['nameEn'],
                        'imageUrls': image_urls
                    }
                    
                    item['variants'] = [variant]
                    added_count += 1
                    
                    print(f"  ✅ {cat_id}: {cat_name}")
                    print(f"     添加了 {len(image_urls)} 個顏色的圖片")
                else:
                    print(f"  ⚠️  {cat_id}: 無法生成圖片 URLs")
            else:
                print(f"  ⏭️  {cat_id}: {cat_name} (不在 Wiki 映射中)")
    
    if added_count > 0:
        # 寫回檔案
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 成功為 {added_count} 個分類添加 variants 和圖片")
    else:
        print(f"\n⏭️  沒有需要添加的分類")
    
    print("="*70)
    
    return added_count

if __name__ == '__main__':
    count = add_variants_to_categories()
    print(f"\n總共添加了 {count} 個分類的圖片資料")
    print("\n注意:")
    print("- 圖片 URLs 使用 Wiki 的標準格式")
    print("- 每個分類目前只有一個 variant")
    print("- 如果某些分類有多個 variant 設計，需要手動添加")
