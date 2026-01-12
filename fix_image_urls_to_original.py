#!/usr/bin/env python3
"""
將圖片 URLs 修改為使用原始圖片（而不是特定尺寸的縮圖）
這樣前端可以通過 CSS 控制大小，不會因為 px 值問題導致圖片無法載入
"""

import json
import re

def convert_to_original_url(thumb_url):
    """
    將縮圖 URL 轉換為原始圖片 URL
    輸入: https://pikmin.wiki.gallery/images/thumb/d/d2/Decor_Red_Jack-o%27-Lantern.png/150px-Decor_Red_Jack-o%27-Lantern.png
    輸出: https://pikmin.wiki.gallery/images/d/d2/Decor_Red_Jack-o%27-Lantern.png
    """
    # 移除 /thumb/ 和 /XXpx- 部分
    # 模式: .../thumb/hash/filename/XXpx-filename -> .../hash/filename
    pattern = r'(https://pikmin\.wiki\.gallery/images)/thumb/([^/]+/[^/]+)/\d+px-(.+)'
    match = re.match(pattern, thumb_url)
    
    if match:
        base_url = match.group(1)
        hash_and_file = match.group(2)
        return f"{base_url}/{hash_and_file}"
    
    # 如果不匹配模式，返回原 URL
    return thumb_url

def update_to_original_urls():
    """將所有圖片 URLs 更新為原始圖片"""
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("將縮圖 URLs 轉換為原始圖片 URLs...")
    print("="*70)
    
    updated_count = 0
    url_count = 0
    
    for item in data['definitions']:
        cat_id = item['category']['id']
        cat_name = item['category']['name']
        
        if item.get('variants'):
            for variant in item['variants']:
                if variant.get('imageUrls'):
                    has_updates = False
                    for color, url in variant['imageUrls'].items():
                        if '/thumb/' in url:
                            original_url = convert_to_original_url(url)
                            variant['imageUrls'][color] = original_url
                            url_count += 1
                            has_updates = True
                    
                    if has_updates:
                        updated_count += 1
                        print(f"  ✅ 更新 {cat_id}: {cat_name}")
    
    if updated_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 成功更新了 {updated_count} 個分類")
        print(f"✅ 共轉換了 {url_count} 個圖片 URL")
        print("\n使用原始圖片的好處:")
        print("  - 不受特定 px 尺寸限制")
        print("  - 更好的圖片品質")
        print("  - 前端通過 Tailwind CSS 統一控制顯示大小")
    else:
        print(f"\n⚠️  沒有找到需要更新的 URL")
    
    print("="*70)
    
    return updated_count

if __name__ == '__main__':
    count = update_to_original_urls()
    print(f"\n總共更新了 {count} 個分類的圖片 URLs")
    print("\n範例轉換:")
    print("  之前: .../thumb/d/d2/Decor_Red_Jack-o%27-Lantern.png/150px-Decor_Red_Jack-o%27-Lantern.png")
    print("  之後: .../d/d2/Decor_Red_Jack-o%27-Lantern.png")
