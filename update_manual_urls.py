#!/usr/bin/env python3
"""
更新手動複製的圖片 URLs
"""

import json

# 手動複製的正確 URLs
MANUAL_URLS = {
    'jack-o-lantern': {
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/3/3e/Decor_Yellow_Jack-o%27-Lantern.png/142px-Decor_Yellow_Jack-o%27-Lantern.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/b/bf/Decor_Blue_Jack-o%27-Lantern.png/117px-Decor_Blue_Jack-o%27-Lantern.png',
        'white': 'https://pikmin.wiki.gallery/images/b/bb/Decor_White_Jack-o%27-Lantern.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/8/84/Decor_Purple_Jack-o%27-Lantern.png/114px-Decor_Purple_Jack-o%27-Lantern.png',
        'winged': 'https://pikmin.wiki.gallery/images/thumb/1/15/Decor_Winged_Jack-o%27-Lantern.png/148px-Decor_Winged_Jack-o%27-Lantern.png',
    },
    'halloween-light': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/2/25/Decor_Red_Halloween_Light.png/124px-Decor_Red_Halloween_Light.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/8/84/Decor_Yellow_Halloween_Light.png/121px-Decor_Yellow_Halloween_Light.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/d/d7/Decor_Blue_Halloween_Light.png/99px-Decor_Blue_Halloween_Light.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/2/26/Decor_White_Halloween_Light.png/126px-Decor_White_Halloween_Light.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/0/00/Decor_Purple_Halloween_Light.png/136px-Decor_Purple_Halloween_Light.png',
        'winged': 'https://pikmin.wiki.gallery/images/thumb/b/b7/Decor_Winged_Halloween_Light.png/127px-Decor_Winged_Halloween_Light.png',
    }
}

def update_manual_urls():
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("更新手動複製的圖片 URLs...")
    print("="*70)
    
    updated_count = 0
    
    for item in data['definitions']:
        cat_id = item['category']['id']
        cat_name = item['category']['name']
        
        if cat_id in MANUAL_URLS:
            if item.get('variants') and len(item['variants']) > 0:
                variant = item['variants'][0]
                if 'imageUrls' in variant:
                    # 更新指定的顏色
                    for color, url in MANUAL_URLS[cat_id].items():
                        variant['imageUrls'][color] = url
                    updated_count += 1
                    print(f"  ✅ {cat_id}: {cat_name}")
                    print(f"     更新了 {len(MANUAL_URLS[cat_id])} 個顏色")
    
    if updated_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 成功更新了 {updated_count} 個分類")
    
    print("="*70)

if __name__ == '__main__':
    update_manual_urls()
    print("\n更新的分類:")
    print("  1. 南瓜燈 (Jack-o'-Lantern) - 5 個顏色")
    print("  2. 萬聖節燈光 (Halloween Light) - 6 個顏色")
