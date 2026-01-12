#!/usr/bin/env python3
"""
分析和比對 decor.json 中的特殊分類與 Pikmin Wiki 官方列表
"""

import json
from typing import Set, Dict, List

# 從 Pikmin Wiki 整理的官方特殊分類列表
# https://www.pikminwiki.com/Special_Decor_Pikmin

WIKI_SPECIAL_CATEGORIES = {
    # Mario Hat
    'mario': 'Mario Hat',
    
    # Lunar New Year
    'lunar-new-year': 'Lunar New Year Ornament',
    
    # Chess Piece
    'chess': 'Chess Piece',
    
    # Fingerboard
    'fingerboard': 'Fingerboard',
    
    # Flower Card (Hanafuda)
    'hanafuda': 'Flower Card',
    
    # Halloween
    'halloween': 'Jack-o\'-Lantern / Halloween Treat / Halloween Light',
    
    # Anniversary
    'anniversary': 'First Anniversary Snack / 3rd Anniversary Cupcake / 4th Anniversary Snack / 4th Anniversary Flower Box',
    
    # Koppaite Space Suit
    'koppaite': 'Koppaite Space Suit',
    
    # Mitten
    'mitten': 'Mitten',
    
    # Glasses (2023, 2024)
    '2023-glasses': '2023 Glasses',
    '2024-glasses': '2024 Glasses',
    
    # Valentine's Day
    'valentines': 'Valentine Sticker / Reverse Valentine Sticker',
    
    # Easter
    'easter': 'Easter Egg / Bunny Egg',
    
    # Present Sticker (Gold)
    'coin': 'Present Sticker (Gold)',
    
    # Sneaker Keychain
    'sneaker-keychain': 'Sneaker Keychain',
    
    # Pikmin 4
    'pikmin4': 'Pikmin 4 Spaceship / Pikmin 4 Toy',
    
    # Mahjong Tile
    'mahjong': 'Mahjong Tile',
    
    # Ice Cream
    'ice-cream': 'Ice Cream',
    
    # Puzzle
    'puzzle': 'Puzzle',
    
    # Seasonal Stickers
    'spring': 'Spring Sticker',
    'summer': 'Summer Sticker',
    'fall': 'Fall Sticker',
    'winter': 'Winter Sticker',
    
    # Playing Card
    'playing-card': 'Playing Card',
    
    # Cuisines of the World
    'cheese': 'Cheese',
    'afternoon-tea': 'Afternoon Tea',
    'mooncake': 'Mooncake',
    'osechi': 'Osechi',
    
    # Festivals of the World
    'rio-carnival': 'Rio Carnival',
    'day-of-dead': 'Calavera (Day of the Dead)',
    
    # Regional/Special
    'aquarium': 'Coral (Aquarium)',
    'art-studio': 'Paint (Art Studio)',
    'music-venue': 'Tiny Instrument',
    'surf-shop': 'Surfboard Keychain',
    'shaved-ice': 'Shaved Ice',
    'photo-studio': 'Photo Button Badge',
    'gaming': 'Gaming',
    'baby': 'Pacifier (Baby)',
    
    # Rosette
    'rosette': 'Rosette',
    
    # Ball Ornament
    'ball-ornament': 'Ball Ornament (2025 Ornament)',
    
    # Party Popper
    'party-popper-2025': 'Party Popper 2025',
    
    # Chocolate
    'chocolate': 'Chocolate',
    
    # Nintendo Consoles
    'nintendo-consoles': 'Nintendo Consoles \'80-\'95',
    
    # Fairy Lights
    'fairy-lights': 'Fairy Lights',
    
    # Golden Toy Airplane
    'golden-airplane': 'Golden Toy Airplane',
    
    # New Year glasses/ornaments
    'new-year': '2025 Glasses / 2026 Glasses / Ball Ornament',
}

def analyze_decor_json(filepath: str):
    """分析 decor.json 中的特殊分類"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    current_special = {}
    current_regular = {}
    
    for item in data['definitions']:
        cat_id = item['category']['id']
        cat_name = item['category']['name']
        cat_type = item['category'].get('type', 'NO TYPE')
        
        if cat_type == 'special':
            current_special[cat_id] = cat_name
        elif cat_type == 'regular':
            current_regular[cat_id] = cat_name
    
    return current_special, current_regular

def compare_categories():
    """比對當前分類與 Wiki 分類"""
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    current_special, current_regular = analyze_decor_json(filepath)
    
    print("="*80)
    print("特殊分類驗證報告")
    print("="*80)
    
    # Wiki 中的特殊分類
    wiki_ids = set(WIKI_SPECIAL_CATEGORIES.keys())
    # 當前 JSON 中的特殊分類
    current_ids = set(current_special.keys())
    
    # 找出缺失的分類
    missing = wiki_ids - current_ids
    # 找出多餘的分類（JSON 有但 Wiki 沒有）
    extra = current_ids - wiki_ids
    # 共同的分類
    common = wiki_ids & current_ids
    
    print(f"\n📊 統計:")
    print(f"  Wiki 官方特殊分類數: {len(wiki_ids)}")
    print(f"  當前 JSON 特殊分類數: {len(current_ids)}")
    print(f"  匹配的分類數: {len(common)}")
    print(f"  缺失的分類數: {len(missing)}")
    print(f"  多餘的分類數: {len(extra)}")
    
    if missing:
        print(f"\n❌ 缺失的特殊分類 ({len(missing)} 個):")
        for cat_id in sorted(missing):
            print(f"  - {cat_id}: {WIKI_SPECIAL_CATEGORIES[cat_id]}")
    
    if extra:
        print(f"\n⚠️  多餘的分類 ({len(extra)} 個):")
        print("  (這些分類在 JSON 中標記為 special，但不在 Wiki 的特殊分類列表中)")
        for cat_id in sorted(extra):
            cat_name = current_special[cat_id]
            print(f"  - {cat_id}: {cat_name}")
    
    if not missing and not extra:
        print(f"\n✅ 完美！所有特殊分類都匹配")
    
    # 檢查是否有應該是 regular 但誤標為 special 的
    print(f"\n" + "="*80)
    print("建議:")
    print("="*80)
    
    if missing:
        print(f"\n需要添加的分類:")
        for cat_id in sorted(missing):
            print(f"  □ {cat_id}: {WIKI_SPECIAL_CATEGORIES[cat_id]}")
    
    if extra:
        print(f"\n需要檢查的分類（可能需要改為 regular 或移除）:")
        for cat_id in sorted(extra):
            print(f"  □ {cat_id}: {current_special[cat_id]}")

if __name__ == '__main__':
    compare_categories()
