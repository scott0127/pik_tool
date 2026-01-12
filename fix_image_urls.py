#!/usr/bin/env python3
"""
修正圖片 URLs - 使用正確的 pikmin.wiki.gallery 域名和路徑
"""

import json

# 正確的圖片 URL 映射（從 Wiki 實際提取）
# 格式: category_id -> {color: url}
CORRECT_IMAGE_URLS = {
    'jack-o-lantern': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/d/d2/Decor_Red_Jack-o%27-Lantern.png/150px-Decor_Red_Jack-o%27-Lantern.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/0/00/Decor_Yellow_Jack-o%27-Lantern.png/150px-Decor_Yellow_Jack-o%27-Lantern.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/5/57/Decor_Blue_Jack-o%27-Lantern.png/150px-Decor_Blue_Jack-o%27-Lantern.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/3/36/Decor_White_Jack-o%27-Lantern.png/150px-Decor_White_Jack-o%27-Lantern.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/9/97/Decor_Purple_Jack-o%27-Lantern.png/150px-Decor_Purple_Jack-o%27-Lantern.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/e/e1/Decor_Rock_Jack-o%27-Lantern.png/150px-Decor_Rock_Jack-o%27-Lantern.png',
        'winged': 'https://pikmin.wiki.gallery/images/thumb/a/a7/Decor_Winged_Jack-o%27-Lantern.png/150px-Decor_Winged_Jack-o%27-Lantern.png'
    },
    'halloween-treat': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/1/13/Decor_Red_Halloween_Treat.png/150px-Decor_Red_Halloween_Treat.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/6/68/Decor_Yellow_Halloween_Treat.png/150px-Decor_Yellow_Halloween_Treat.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/d/d3/Decor_Blue_Halloween_Treat.png/150px-Decor_Blue_Halloween_Treat.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/2/29/Decor_White_Halloween_Treat.png/150px-Decor_White_Halloween_Treat.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/3/3a/Decor_Purple_Halloween_Treat.png/150px-Decor_Purple_Halloween_Treat.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/6/60/Decor_Rock_Halloween_Treat.png/150px-Decor_Rock_Halloween_Treat.png',
        'winged': 'https://pikmin.wiki.gallery/images/thumb/c/c5/Decor_Winged_Halloween_Treat.png/150px-Decor_Winged_Halloween_Treat.png'
    },
    'halloween-light': {
        'red': 'https://pikmin.wiki.gallery/images/thumb/c/c4/Decor_Red_Halloween_Light.png/150px-Decor_Red_Halloween_Light.png',
        'yellow': 'https://pikmin.wiki.gallery/images/thumb/9/9c/Decor_Yellow_Halloween_Light.png/150px-Decor_Yellow_Halloween_Light.png',
        'blue': 'https://pikmin.wiki.gallery/images/thumb/9/96/Decor_Blue_Halloween_Light.png/150px-Decor_Blue_Halloween_Light.png',
        'white': 'https://pikmin.wiki.gallery/images/thumb/4/47/Decor_White_Halloween_Light.png/150px-Decor_White_Halloween_Light.png',
        'purple': 'https://pikmin.wiki.gallery/images/thumb/f/f1/Decor_Purple_Halloween_Light.png/150px-Decor_Purple_Halloween_Light.png',
        'rock': 'https://pikmin.wiki.gallery/images/thumb/a/aa/Decor_Rock_Halloween_Light.png/150px-Decor_Rock_Halloween_Light.png',
        'winged': 'https://pikmin.wiki.gallery/images/thumb/b/b5/Decor_Winged_Halloween_Light.png/150px-Decor_Winged_Halloween_Light.png'
    },
    # ... 其他分類會從瀏覽器提取
}

def fix_image_urls():
    """修正所有圖片 URLs"""
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("修正圖片 URLs...")
    print("="*70)
    
    fixed_count = 0
    
    for item in data['definitions']:
        cat_id = item['category']['id']
        
        if cat_id in CORRECT_IMAGE_URLS and item.get('variants'):
            for variant in item['variants']:
                if 'imageUrls' in variant:
                    variant['imageUrls'] = CORRECT_IMAGE_URLS[cat_id]
                    fixed_count += 1
                    print(f"  ✅ 修正 {cat_id}")
                    break
    
    if fixed_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 修正了 {fixed_count} 個分類的圖片 URLs")
    
    print("="*70)
    print("注意: 只修正了測試的 3 個分類")
    print("需要從瀏覽器提取其他分類的完整 URLs")

if __name__ == '__main__':
    fix_image_urls()
