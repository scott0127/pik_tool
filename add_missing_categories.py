#!/usr/bin/env python3
"""
添加缺失的特殊分類到 decor.json
"""

import json
import copy

# 缺失的特殊分類定義
MISSING_CATEGORIES = [
    {
        'id': 'mitten',
        'name': '連指手套',
        'nameEn': 'Mitten',
        'icon': '🧤',
        'type': 'special'
    },
    {
        'id': 'sneaker-keychain',
        'name': '運動鞋鑰匙圈',
        'nameEn': 'Sneaker Keychain',
        'icon': '👟',
        'type': 'special'
    },
    {
        'id': 'chocolate',
        'name': '巧克力',
        'nameEn': 'Chocolate',
        'icon': '🍫',
        'type': 'special'
    },
    {
        'id': 'party-popper',
        'name': '派對煙火',
        'nameEn': 'Party Popper',
        'icon': '🎉',
        'type': 'special'
    },
    {
        'id': 'nintendo-consoles',
        'name': '任天堂主機',
        'nameEn': "Nintendo Consoles '80-'95",
        'icon': '🎮',
        'type': 'special'
    },
    {
        'id': 'fairy-lights',
        'name': '彩燈',
        'nameEn': 'Fairy Lights',
        'icon': '💡',
        'type': 'special'
    },
    {
        'id': 'day-of-dead',
        'name': '亡靈節',
        'nameEn': 'Day of the Dead (Calavera)',
        'icon': '💀',
        'type': 'special'
    },
]

def add_missing_categories():
    """添加缺失的分類"""
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("添加缺失的特殊分類...")
    print("="*70)
    
    # 獲取現有的 category IDs
    existing_ids = {item['category']['id'] for item in data['definitions']}
    
    added_count = 0
    
    for cat in MISSING_CATEGORIES:
        if cat['id'] not in existing_ids:
            # 創建新的 category definition
            new_definition = {
                "category": {
                    "id": cat['id'],
                    "name": cat['name'],
                    "nameEn": cat['nameEn'],
                    "type": cat['type'],
                    "icon": cat['icon']
                },
                "variants": [],  # 暫時沒有 variants，需要後續補充
                "availablePikminTypes": ["red", "yellow", "blue", "white", "purple", "rock", "winged"]
            }
            
            # 添加到 definitions
            data['definitions'].append(new_definition)
            added_count += 1
            
            print(f"  ✅ 添加: {cat['id']} - {cat['name']} ({cat['nameEn']})")
        else:
            print(f"  ⏭️  跳過: {cat['id']} - 已存在")
    
    if added_count > 0:
        # 寫回檔案
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 成功添加 {added_count} 個分類")
        print(f"總特殊分類數: {len([d for d in data['definitions'] if d['category'].get('type') == 'special'])}")
    else:
        print(f"\n⏭️  沒有需要添加的分類")
    
    print("\n" + "="*70)
    print("注意: 新添加的分類目前沒有 variants")
    print("需要後續補充圖片 URL 和 variant 資料")
    print("="*70)

if __name__ == '__main__':
    add_missing_categories()
