#!/usr/bin/env python3
"""
按照 Wiki 官方順序重新排列特殊分類
"""

import json

# Wiki 官方順序（從用戶提供的列表）
# 格式：(category_id, 中文名, variant標記)
WIKI_ORDER = [
    ('mario', '瑪利歐帽子'),
    ('lunar-new-year', '農曆新年飾品'),
    ('chess', '國際象棋棋子'),
    ('fingerboard', '指板'),
    ('hanafuda', '花卡'),
    ('halloween', '萬聖節'),  # 包含南瓜燈、糖果、燈光
    ('anniversary', '週年紀念'),  # 包含多個週年紀念
    ('koppaite', '科派特太空服'),
    ('mitten', '手套'),
    ('new-year', '新年眼鏡'),  # 包含 2023, 2024
    ('valentines', '情人節'),  # 包含情人節和反向情人節
    ('coin', '禮品貼紙（金色）'),
    ('easter', '復活節'),  # 包含復活節彩蛋和兔子蛋
    ('sneaker-keychain', '運動鞋鑰匙扣'),
    ('pikmin4', 'Pikmin 4'),  # 包含太空船和玩具
    ('mahjong', '麻將牌'),
    ('ice-cream', '冰淇淋'),
    ('puzzle', '拼圖'),
    ('spring', '春季貼紙'),
    ('summer', '夏季貼紙'),
    ('fall', '秋季貼紙'),
    ('winter', '冬季貼紙'),
    ('playing-card', '紙牌'),
    ('cheese', '起司'),
    ('aquarium', '珊瑚'),  # 水族館
    ('art-studio', '畫'),  # 藝術工作室
    ('rosette', '玫瑰花結'),
    ('ball-ornament', '球形裝飾品'),  # 可能需要添加
    ('party-popper', '派對禮炮 2025'),
    ('chocolate', '巧克力'),
    ('rio-carnival', '里約狂歡節'),
    ('afternoon-tea', '下午茶'),
    ('nintendo-consoles', '任天堂遊戲機'),
    ('music-venue', '微型儀器'),  # 音樂場地
    ('surf-shop', '衝浪板鑰匙扣'),
    ('shaved-ice', '刨冰'),
    ('mooncake', '月餅'),
    ('photo-studio', '照片徽章'),
    ('day-of-dead', '卡拉維拉'),
    ('gaming', '遊戲中心'),  # 可能缺少，需要確認
    ('baby', '安撫奶嘴'),  # 嬰兒用品
    ('osechi', '御節'),
    ('golden-airplane', '金色玩具飛機'),
    ('fairy-lights', '彩燈'),  # 需要確認位置
]

def reorder_special_categories():
    """重新排序特殊分類"""
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("按照 Wiki 順序重新排列特殊分類...")
    print("="*70)
    
    # 分離一般分類和特殊分類
    regular_defs = []
    special_defs = {}
    
    for item in data['definitions']:
        if item['category'].get('type') == 'regular':
            regular_defs.append(item)
        else:
            special_defs[item['category']['id']] = item
    
    print(f"一般分類: {len(regular_defs)} 個")
    print(f"特殊分類: {len(special_defs)} 個")
    
    # 按照 Wiki 順序重新排列特殊分類
    ordered_special = []
    missing_in_wiki = []
    missing_in_json = []
    
    for cat_id, cat_name in WIKI_ORDER:
        if cat_id in special_defs:
            ordered_special.append(special_defs[cat_id])
            print(f"  ✅ {cat_id}: {cat_name}")
        else:
            missing_in_json.append(f"{cat_id}: {cat_name}")
            print(f"  ⚠️  缺少: {cat_id}: {cat_name}")
    
    # 檢查是否有 JSON 中有但 Wiki 順序中沒有的
    wiki_ids = {cat_id for cat_id, _ in WIKI_ORDER}
    for cat_id in special_defs:
        if cat_id not in wiki_ids:
            missing_in_wiki.append(f"{cat_id}: {special_defs[cat_id]['category']['name']}")
    
    # 重建 definitions（一般分類在前，特殊分類在後）
    data['definitions'] = regular_defs + ordered_special
    
    # 將 Wiki 中有但 JSON 沒有的加到最後
    if missing_in_wiki:
        print(f"\n⚠️  以下分類在 JSON 中但不在 Wiki 順序中，將放在最後:")
        for item in missing_in_wiki:
            print(f"  - {item}")
            cat_id = item.split(':')[0]
            data['definitions'].append(special_defs[cat_id])
    
    # 寫回檔案
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完成重新排序")
    print(f"總分類數: {len(data['definitions'])}")
    print(f"  - 一般分類: {len(regular_defs)}")
    print(f"  - 特殊分類: {len(ordered_special) + len(missing_in_wiki)}")
    
    if missing_in_json:
        print(f"\n⚠️  Wiki 中有但 JSON 缺少的分類 ({len(missing_in_json)} 個):")
        for item in missing_in_json:
            print(f"  - {item}")
    
    print("="*70)

if __name__ == '__main__':
    reorder_special_categories()
