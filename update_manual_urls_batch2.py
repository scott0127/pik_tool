#!/usr/bin/env python3
"""
更新手動複製的圖片 URLs - 第二批
"""

import json

# 手動複製的正確 URLs
MANUAL_URLS = {
    'mitten': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/d/da/Decor_Red_Mitten.png/144px-Decor_Red_Mitten.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/7/75/Decor_Yellow_Mitten.png/117px-Decor_Yellow_Mitten.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/3/3d/Decor_White_Mitten.png/115px-Decor_White_Mitten.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/4/4c/Decor_Purple_Mitten.png/104px-Decor_Purple_Mitten.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/3/3f/Decor_Rock_Mitten.png/128px-Decor_Rock_Mitten.png',
    },
    'valentine-sticker': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/3/38/Decor_Red_Valentine_Sticker.png/141px-Decor_Red_Valentine_Sticker.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/1/1a/Decor_Purple_Valentine_Sticker.png/149px-Decor_Purple_Valentine_Sticker.png',
    },
    'reverse-valentine-sticker': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/a/a8/Decor_Red_Reverse_Valentine%27s_Day_Sticker.png/141px-Decor_Red_Reverse_Valentine%27s_Day_Sticker.png',
    },
    'easter-egg': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/5/56/Decor_Red_Easter_Egg.png/131px-Decor_Red_Easter_Egg.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/7/71/Decor_Yellow_Easter_Egg.png/134px-Decor_Yellow_Easter_Egg.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/3/3e/Decor_Blue_Easter_Egg.png/127px-Decor_Blue_Easter_Egg.png',
        'white': 'https://pikmin.wiki.gallery/images/a/a6/Decor_White_Easter_Egg.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/2/26/Decor_Purple_Easter_Egg.png/111px-Decor_Purple_Easter_Egg.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/f/f9/Decor_Rock_Easter_Egg.png/139px-Decor_Rock_Easter_Egg.png',
        'winged': 'https://pikmin.wiki.gallery/images/e/e5/Decor_Winged_Easter_Egg.png',
    },
    'bunny-egg': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/4/4a/Decor_Red_Bunny_Egg.png/146px-Decor_Red_Bunny_Egg.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/c/c8/Decor_Yellow_Bunny_Egg.png/149px-Decor_Yellow_Bunny_Egg.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/1/19/Decor_White_Bunny_Egg.png/122px-Decor_White_Bunny_Egg.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/8/88/Decor_Purple_Bunny_Egg.png/120px-Decor_Purple_Bunny_Egg.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/7/7d/Decor_Rock_Bunny_Egg.png/139px-Decor_Rock_Bunny_Egg.png',
    },
    'sneaker-keychain': {
        'purple': 'https://pikmin.wiki.gallery/images/thumb/2/2f/Decor_Purple_Sneaker_Keychain.png/133px-Decor_Purple_Sneaker_Keychain.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/9/95/Decor_Rock_Sneaker_Keychain.png/135px-Decor_Rock_Sneaker_Keychain.png',
    },
    '3rd-anniversary-cupcake': {
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/1/1b/Decor_Yellow_3rd_Anniversary_Cupcake.png/146px-Decor_Yellow_3rd_Anniversary_Cupcake.png',
        'winged': 'https://pikmin.wiki.gallery/images/thumb/f/f8/Decor_Winged_3rd_Anniversary_Cupcake.png/106px-Decor_Winged_3rd_Anniversary_Cupcake.png',
    },
    'party-popper': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/2/20/Decor_Red_Party_Popper_2025.png/96px-Decor_Red_Party_Popper_2025.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/b/b9/Decor_Yellow_Party_Popper_2025.png/98px-Decor_Yellow_Party_Popper_2025.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/c/c1/Decor_Blue_Party_Popper_2025.png/102px-Decor_Blue_Party_Popper_2025.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/1/19/Decor_White_Party_Popper_2025.png/97px-Decor_White_Party_Popper_2025.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/f/f8/Decor_Purple_Party_Popper_2025.png/108px-Decor_Purple_Party_Popper_2025.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/1/1e/Decor_Rock_Party_Popper_2025.png/125px-Decor_Rock_Party_Popper_2025.png',
        'winged': 'https://pikmin.wiki.gallery/images/thumb/b/bc/Decor_Winged_Party_Popper_2025.png/92px-Decor_Winged_Party_Popper_2025.png',
    },
    'chocolate': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/c/c3/Decor_Red_Chocolate.png/124px-Decor_Red_Chocolate.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/b/bb/Decor_Yellow_Chocolate.png/132px-Decor_Yellow_Chocolate.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/7/75/Decor_Blue_Chocolate.png/123px-Decor_Blue_Chocolate.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/f/f9/Decor_White_Chocolate.png/86px-Decor_White_Chocolate.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/e/e5/Decor_Purple_Chocolate.png/78px-Decor_Purple_Chocolate.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/a/ae/Decor_Rock_Chocolate.png/111px-Decor_Rock_Chocolate.png',
        'winged': 'https://pikmin.wiki.gallery/images/4/4f/Decor_Winged_Chocolate.png',
    },
    '2025-ornament': {
        'blue': 'https://pikmin.wiki.gallery/images/thumb/9/96/Decor_Blue_2025_Ornament.png/126px-Decor_Blue_2025_Ornament.png',
        'ice': 'https://pikmin.wiki.gallery/images/thumb/8/85/Decor_Ice_2025_Ornament.png/150px-Decor_Ice_2025_Ornament.png',
    }
}

def update_manual_urls():
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("更新手動複製的圖片 URLs (第二批)...")
    print("="*70)
    
    updated_count = 0
    total_urls = 0
    
    for item in data['definitions']:
        cat_id = item['category']['id']
        cat_name = item['category']['name']
        
        if cat_id in MANUAL_URLS:
            if item.get('variants') and len(item['variants']) > 0:
                variant = item['variants'][0]
                if 'imageUrls' not in variant:
                    variant['imageUrls'] = {}
                
                # 更新指定的顏色
                for color, url in MANUAL_URLS[cat_id].items():
                    variant['imageUrls'][color] = url
                    total_urls += 1
                
                updated_count += 1
                print(f"  ✅ {cat_id}: {cat_name}")
                print(f"     更新了 {len(MANUAL_URLS[cat_id])} 個顏色")
    
    if updated_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 成功更新了 {updated_count} 個分類，共 {total_urls} 個圖片 URL")
    
    print("="*70)

if __name__ == '__main__':
    update_manual_urls()
    print("\n更新的分類:")
    for i, (cat_id, urls) in enumerate(MANUAL_URLS.items(), 1):
        print(f"  {i}. {cat_id} - {len(urls)} 個顏色")
    print("\n⚠️  注意: 2025年裝飾品包含 ice 顏色（第一次出現）")
