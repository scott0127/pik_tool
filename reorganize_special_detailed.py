#!/usr/bin/env python3
"""
特殊分類詳細重組
根據用戶要求進行大規模分類調整
"""

import json
import copy

def reorganize_categories():
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("開始特殊分類詳細重組...")
    print("="*70)
    
    # 建立索引
    categories_dict = {}
    for item in data['definitions']:
        categories_dict[item['category']['id']] = item
    
    changes = []
    
    # 1. 拆分萬聖節為 3 個分類
    print("\n1. 拆分萬聖節...")
    if 'halloween' in categories_dict:
        halloween = categories_dict['halloween']
        # 創建 3 個新分類
        categories_dict['jack-o-lantern'] = {
            'category': {'id': 'jack-o-lantern', 'name': '南瓜燈', 'nameEn': "Jack-o'-Lantern", 'type': 'special', 'icon': '🎃'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        categories_dict['halloween-treat'] = {
            'category': {'id': 'halloween-treat', 'name': '萬聖節糖果', 'nameEn': 'Halloween Treat', 'type': 'special', 'icon': '🍬'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        categories_dict['halloween-light'] = {
            'category': {'id': 'halloween-light', 'name': '萬聖節燈光', 'nameEn': 'Halloween Light', 'type': 'special', 'icon': '🔦'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        del categories_dict['halloween']
        changes.append("拆分 halloween 為 3 個分類")
        print("  ✅ 拆分為：南瓜燈、萬聖節糖果、萬聖節燈光")
    
    # 2. 添加一週年紀念零食
    print("\n2. 添加一週年紀念零食...")
    if 'first-anniversary-snack' not in categories_dict:
        categories_dict['first-anniversary-snack'] = {
            'category': {'id': 'first-anniversary-snack', 'name': '一週年紀念零食', 'nameEn': 'First Anniversary Snack', 'type': 'special', 'icon': '🎂'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        changes.append("添加 first-anniversary-snack")
        print("  ✅ 添加一週年紀念零食")
    
    # 3. 拆分眼鏡為 2023 和 2024
    print("\n3. 拆分眼鏡...")
    if 'new-year' in categories_dict:
        categories_dict['2023-glasses'] = {
            'category': {'id': '2023-glasses', 'name': '2023年眼鏡', 'nameEn': '2023 Glasses', 'type': 'special', 'icon': '🕶️'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        categories_dict['2024-glasses'] = {
            'category': {'id': '2024-glasses', 'name': '2024年眼鏡', 'nameEn': '2024 Glasses', 'type': 'special', 'icon': '🕶️'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        del categories_dict['new-year']
        changes.append("拆分 new-year 為 2023-glasses 和 2024-glasses")
        print("  ✅ 拆分為：2023年眼鏡、2024年眼鏡")
    
    # 4. 重組情人節
    print("\n4. 重組情人節...")
    if 'valentines' in categories_dict:
        categories_dict['valentine-sticker'] = {
            'category': {'id': 'valentine-sticker', 'name': '情人節貼紙', 'nameEn': "Valentine's Day Sticker", 'type': 'special', 'icon': '💝'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        categories_dict['reverse-valentine-sticker'] = {
            'category': {'id': 'reverse-valentine-sticker', 'name': '反向情人節貼紙', 'nameEn': "Reverse Valentine's Day Sticker", 'type': 'special', 'icon': '💙'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        del categories_dict['valentines']
        changes.append("拆分 valentines")
        print("  ✅ 拆分為：情人節貼紙、反向情人節貼紙")
    
    # coin 改名為 present-sticker-gold
    if 'coin' in categories_dict:
        coin_data = categories_dict['coin']
        coin_data['category']['id'] = 'present-sticker-gold'
        coin_data['category']['name'] = '禮物貼紙（金色）'
        coin_data['category']['nameEn'] = 'Present Sticker (Gold)'
        categories_dict['present-sticker-gold'] = coin_data
        del categories_dict['coin']
        changes.append("coin 改名為 present-sticker-gold")
        print("  ✅ coin → 禮物貼紙（金色）")
    
    # 5. 拆分復活節
    print("\n5. 拆分復活節...")
    if 'easter' in categories_dict:
        categories_dict['easter-egg'] = {
            'category': {'id': 'easter-egg', 'name': '復活節彩蛋', 'nameEn': 'Easter Egg', 'type': 'special', 'icon': '🥚'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        categories_dict['bunny-egg'] = {
            'category': {'id': 'bunny-egg', 'name': '兔子蛋', 'nameEn': 'Bunny Egg', 'type': 'special', 'icon': '🐰'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        del categories_dict['easter']
        changes.append("拆分 easter")
        print("  ✅ 拆分為：復活節彩蛋、兔子蛋")
    
    # 6. 季節貼紙改名
    print("\n6. 季節貼紙改名...")
    season_renames = [
        ('spring', '春季貼紙', 'Spring Sticker'),
        ('summer', '夏季貼紙', 'Summer Sticker'),
        ('fall', '秋季貼紙', 'Fall Sticker'),
        ('winter', '冬季貼紙', 'Winter Sticker')
    ]
    for old_id, new_name, new_name_en in season_renames:
        if old_id in categories_dict:
            categories_dict[old_id]['category']['name'] = new_name
            categories_dict[old_id]['category']['nameEn'] = new_name_en
            print(f"  ✅ {old_id} → {new_name}")
    
    # 7. 派對煙火改名
    print("\n7. 派對煙火改名...")
    if 'party-popper' in categories_dict:
        categories_dict['party-popper']['category']['name'] = '派對禮炮 2025'
        categories_dict['party-popper']['category']['nameEn'] = 'Party Popper 2025'
        print("  ✅ party-popper → 派對禮炮 2025")
    
    # 8. 音樂場地改名
    print("\n8. 音樂場地改名...")
    if 'music-venue' in categories_dict:
        categories_dict['music-venue']['category']['name'] = '小型樂器'
        categories_dict['music-venue']['category']['nameEn'] = 'Tiny Instrument'
        print("  ✅ music-venue → 小型樂器")
    
    # 9. 合併電玩中心到任天堂主機
    print("\n9. 合併電玩中心...")
    if 'gaming' in categories_dict and 'nintendo-consoles' in categories_dict:
        # 將 gaming 的 variants 移到 nintendo-consoles
        gaming_variants = categories_dict['gaming'].get('variants', [])
        if gaming_variants:
            categories_dict['nintendo-consoles'].setdefault('variants', []).extend(gaming_variants)
        del categories_dict['gaming']
        changes.append("合併 gaming 到 nintendo-consoles")
        print("  ✅ 電玩中心內容移到任天堂主機")
    
    # 10. 添加三週年紀念紙杯蛋糕
    print("\n10. 添加三週年紀念紙杯蛋糕...")
    if '3rd-anniversary-cupcake' not in categories_dict:
        categories_dict['3rd-anniversary-cupcake'] = {
            'category': {'id': '3rd-anniversary-cupcake', 'name': '三週年紀念紙杯蛋糕', 'nameEn': '3rd Anniversary Cupcake', 'type': 'special', 'icon': '🧁'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        print("  ✅ 添加三週年紀念紙杯蛋糕")
    
    # 11. 添加四週年相關
    print("\n11. 添加四週年相關...")
    if '4th-anniversary-flower-box' not in categories_dict:
        categories_dict['4th-anniversary-flower-box'] = {
            'category': {'id': '4th-anniversary-flower-box', 'name': '四週年紀念花盒', 'nameEn': '4th Anniversary Flower Box', 'type': 'special', 'icon': '💐'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        print("  ✅ 添加四週年紀念花盒")
    
    if '4th-anniversary-snack' not in categories_dict:
        categories_dict['4th-anniversary-snack'] = {
            'category': {'id': '4th-anniversary-snack', 'name': '四週年紀念零食', 'nameEn': '4th Anniversary Snack', 'type': 'special', 'icon': '🍿'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        print("  ✅ 添加四週年紀念零食")
    
    # 12. 添加 2025 年裝飾品
    print("\n12. 添加 2025 年裝飾品...")
    if '2025-ornament' not in categories_dict:
        categories_dict['2025-ornament'] = {
            'category': {'id': '2025-ornament', 'name': '2025年裝飾品', 'nameEn': '2025 Ornament', 'type': 'special', 'icon': '🎄'},
            'variants': [], 'availablePikminTypes': ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']
        }
        print("  ✅ 添加2025年裝飾品")
    
    # 重建 definitions（按照新的順序）
    print("\n13. 重新排序...")
    
    # 新的順序
    new_special_order = [
        'mario', 'lunar-new-year', 'chess', 'fingerboard', 'hanafuda',
        'jack-o-lantern', 'halloween-treat', 'halloween-light',  # 萬聖節3個
        'first-anniversary-snack', 'anniversary', 'koppaite', 'mitten',
        '2023-glasses', '2024-glasses',  # 眼鏡2個
        'valentine-sticker', 'reverse-valentine-sticker', 'present-sticker-gold',  # 情人節3個
        'easter-egg', 'bunny-egg',  # 復活節2個
        'sneaker-keychain', 'pikmin4', 'mahjong', 'ice-cream', 'puzzle',
        'spring', 'summer', 'fall', 'winter',  # 季節貼紙
        'playing-card', 'cheese', 'aquarium', 'art-studio', 'rosette',
        '3rd-anniversary-cupcake',  # 三週年
        'party-popper',  # 派對禮炮
        'chocolate', 'rio-carnival', 'afternoon-tea', 'nintendo-consoles',
        'music-venue', 'surf-shop', 'shaved-ice', 'mooncake', 'photo-studio',
        'day-of-dead',
        '4th-anniversary-flower-box', '4th-anniversary-snack', '2025-ornament',  # 四週年和2025
        'baby', 'osechi', 'golden-airplane', 'fairy-lights'
    ]
    
    # 分離一般分類
    regular_defs = [item for item in data['definitions'] if item['category'].get('type') == 'regular']
    
    # 按新順序排列特殊分類
    special_defs = []
    for cat_id in new_special_order:
        if cat_id in categories_dict:
            special_defs.append(categories_dict[cat_id])
    
    # 加入任何遺漏的特殊分類
    existing_special_ids = {item['category']['id'] for item in special_defs}
    for cat_id, cat_data in categories_dict.items():
        if cat_data['category'].get('type') == 'special' and cat_id not in existing_special_ids:
            special_defs.append(cat_data)
            print(f"  ⚠️  額外的特殊分類: {cat_id}")
    
    data['definitions'] = regular_defs + special_defs
    
    # 寫回檔案
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完成重組")
    print(f"總分類數: {len(data['definitions'])}")
    print(f"  - 一般分類: {len(regular_defs)}")
    print(f"  - 特殊分類: {len(special_defs)}")
    print(f"\n完成的變更: {len(changes)} 項")
    for change in changes:
        print(f"  • {change}")
    print("="*70)

if __name__ == '__main__':
    reorganize_categories()
