#!/usr/bin/env python3
"""
根據 Pikmin Wiki 完整列出所有特殊分類
https://www.pikminwiki.com/Special_Decor_Pikmin
"""

import json

# Wiki 上所有特殊裝飾的完整列表（按 Wiki 順序）
WIKI_SPECIAL_DECOR = [
    # 主要特殊裝飾
    {'id': 'mario', 'name': '瑪利歐帽子', 'nameEn': 'Mario Hat', 'icon': '🎮'},
    {'id': 'lunar-new-year', 'name': '農曆新年裝飾', 'nameEn': 'Lunar New Year Ornament', 'icon': '🧧'},
    {'id': 'chess', 'name': '西洋棋', 'nameEn': 'Chess Piece', 'icon': '♟️'},
    {'id': 'fingerboard', 'name': '指板', 'nameEn': 'Fingerboard', 'icon': '🎸'},
    {'id': 'hanafuda', 'name': '花札', 'nameEn': 'Flower Card', 'icon': '🃏'},
    {'id': 'halloween', 'name': '萬聖節', 'nameEn': 'Halloween', 'icon': '🎃'},
    {'id': 'anniversary', 'name': '週年紀念', 'nameEn': 'Anniversary', 'icon': '🎂'},
    {'id': 'koppaite', 'name': 'Koppaite 太空衣', 'nameEn': 'Koppaite Space Suit', 'icon': '🚀'},
    {'id': 'mitten', 'name': '連指手套', 'nameEn': 'Mitten', 'icon': '🧤'},
    {'id': 'new-year', 'name': '新年', 'nameEn': 'New Year', 'icon': '🎆'},  # 包含各年份眼鏡
    {'id': 'valentines', 'name': '情人節', 'nameEn': "Valentine's Day", 'icon': '💝'},
    {'id': 'easter', 'name': '復活節', 'nameEn': 'Easter', 'icon': '🥚'},
    {'id': 'coin', 'name': '禮物貼紙（金）', 'nameEn': 'Present Sticker (Gold)', 'icon': '🎁'},
    {'id': 'sneaker-keychain', 'name': '運動鞋鑰匙圈', 'nameEn': 'Sneaker Keychain', 'icon': '👟'},
    {'id': 'pikmin4', 'name': 'Pikmin 4', 'nameEn': 'Pikmin 4', 'icon': '🎮'},
    {'id': 'mahjong', 'name': '麻將', 'nameEn': 'Mahjong Tile', 'icon': '🀄'},
    {'id': 'ice-cream', 'name': '冰淇淋', 'nameEn': 'Ice Cream', 'icon': '🍦'},
    {'id': 'puzzle', 'name': '拼圖', 'nameEn': 'Puzzle', 'icon': '🧩'},
    {'id': 'spring', 'name': '春季貼紙', 'nameEn': 'Spring Sticker', 'icon': '🌸'},
    {'id': 'summer', 'name': '夏季貼紙', 'nameEn': 'Summer Sticker', 'icon': '☀️'},
    {'id': 'fall', 'name': '秋季貼紙', 'nameEn': 'Fall Sticker', 'icon': '🍂'},
    {'id': 'winter', 'name': '冬季貼紙', 'nameEn': 'Winter Sticker', 'icon': '❄️'},
    {'id': 'playing-card', 'name': '撲克牌', 'nameEn': 'Playing Card', 'icon': '🃏'},
    
    # Cuisines of the World
    {'id': 'cheese', 'name': '起司', 'nameEn': 'Cheese', 'icon': '🧀'},
    {'id': 'afternoon-tea', 'name': '下午茶', 'nameEn': 'Afternoon Tea', 'icon': '🫖'},
    {'id': 'mooncake', 'name': '月餅', 'nameEn': 'Mooncake', 'icon': '🥮'},
    {'id': 'osechi', 'name': '御節料理', 'nameEn': 'Osechi', 'icon': '🍱'},
    
    # Festivals of the World
    {'id': 'rio-carnival', 'name': '里約嘉年華', 'nameEn': 'Rio Carnival', 'icon': '🎭'},
    {'id': 'day-of-dead', 'name': '亡靈節', 'nameEn': 'Day of the Dead', 'icon': '💀'},
    
    # 其他特殊/地區限定
    {'id': 'aquarium', 'name': '水族館', 'nameEn': 'Aquarium', 'icon': '🐠'},
    {'id': 'art-studio', 'name': '藝術工作室', 'nameEn': 'Art Studio', 'icon': '🎨'},
    {'id': 'music-venue', 'name': '音樂場地', 'nameEn': 'Music Venue', 'icon': '🎵'},
    {'id': 'surf-shop', 'name': '衝浪店', 'nameEn': 'Surf Shop', 'icon': '🏄'},
    {'id': 'shaved-ice', 'name': '刨冰', 'nameEn': 'Shaved Ice', 'icon': '🍧'},
    {'id': 'photo-studio', 'name': '照相館', 'nameEn': 'Photo Studio', 'icon': '📸'},
    {'id': 'gaming', 'name': '電玩中心', 'nameEn': 'Gaming Center', 'icon': '🎮'},
    {'id': 'baby', 'name': '嬰兒用品', 'nameEn': 'Baby Store', 'icon': '👶'},
    
    # 最新/額外的特殊裝飾
    {'id': 'rosette', 'name': '緞帶花飾', 'nameEn': 'Rosette', 'icon': '🏵️'},
    {'id': 'chocolate', 'name': '巧克力', 'nameEn': 'Chocolate', 'icon': '🍫'},
    {'id': 'party-popper', 'name': '派對煙火', 'nameEn': 'Party Popper', 'icon': '🎉'},
    {'id': 'nintendo-consoles', 'name': '任天堂主機', 'nameEn': "Nintendo Consoles '80-'95", 'icon': '🎮'},
    {'id': 'fairy-lights', 'name': '彩燈', 'nameEn': 'Fairy Lights', 'icon': '💡'},
    {'id': 'golden-airplane', 'name': '金色飛機玩具', 'nameEn': 'Golden Toy Airplane', 'icon': '✈️'},
]

def check_current_categories():
    """檢查當前 JSON 中的分類"""
    with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    current_special = {}
    for item in data['definitions']:
        if item['category'].get('type') == 'special':
            current_special[item['category']['id']] = item['category']['name']
    
    wiki_ids = {item['id'] for item in WIKI_SPECIAL_DECOR}
    current_ids = set(current_special.keys())
    
    missing = wiki_ids - current_ids
    extra = current_ids - wiki_ids
    
    print("="*70)
    print("特殊分類完整比對")
    print("="*70)
    print(f"\nWiki 官方特殊分類: {len(WIKI_SPECIAL_DECOR)} 個")
    print(f"當前 JSON 特殊分類: {len(current_special)} 個")
    print(f"缺失: {len(missing)} 個")
    print(f"多餘: {len(extra)} 個")
    
    if missing:
        print(f"\n缺失的分類:")
        for cat_id in sorted(missing):
            wiki_item = next(item for item in WIKI_SPECIAL_DECOR if item['id'] == cat_id)
            print(f"  - {cat_id}: {wiki_item['name']} ({wiki_item['nameEn']})")
    
    if extra:
        print(f"\n多餘的分類 (在 JSON 但不在 Wiki):")
        for cat_id in sorted(extra):
            print(f"  - {cat_id}: {current_special[cat_id]}")
    
    return list(missing), list(extra)

if __name__ == '__main__':
    missing, extra = check_current_categories()
    
    print(f"\n" + "="*70)
    print(f"需要添加 {len(missing)} 個分類")
    print("="*70)
