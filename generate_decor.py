#!/usr/bin/env python3
"""
從 scraped_images.json 生成正確的 decor.json
這個腳本會解析圖片名稱來分組飾品，並生成前端需要的資料結構
"""

import json
import re
from collections import OrderedDict
from datetime import datetime

# 載入 scraped_images.json
with open('scraped_images.json', 'r', encoding='utf-8') as f:
    scraped_images = json.load(f)

# 皮克敏類型
PIKMIN_TYPES = ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice']
PIKMIN_TYPE_MAP = {
    'Red': 'red',
    'Yellow': 'yellow', 
    'Blue': 'blue',
    'White': 'white',
    'Purple': 'purple',
    'Rock': 'rock',
    'Winged': 'winged',
    'Ice': 'ice'
}

# 中文名稱對應表
VARIANT_NAME_ZH = {
    'chef_hat': '廚師帽',
    'chef_hat_rare': '稀有廚師帽',
    'coffee_cup': '咖啡杯',
    'coffee_cup_rare': '稀有咖啡杯',
    'macaron': '馬卡龍',
    'donut': '甜甜圈',
    'popcorn_snack': '爆米花',
    'toothbrush': '牙刷',
    'dandelion': '蒲公英',
    'stag_beetle': '鍬形蟲',
    'acorn': '橡實',
    'fishing_lure': '魚餌',
    'fishing_lure_rare': '稀有魚餌',
    'stamp': '郵票',
    'picture_frame': '相框',
    'toy_airplane': '玩具飛機',
    'paper_train': '紙火車',
    'ticket': '車票',
    'gold_ticket': '金車票',
    'shell': '貝殼',
    'burger': '漢堡',
    'bottle_cap': '瓶蓋',
    'banana': '香蕉',
    'banana_rare': '稀有香蕉',
    'mushroom': '蘑菇',
    'snack': '零食',
    'baguette': '法國麵包',
    'baguette_rare': '稀有法國麵包',
    'scissors': '剪刀',
    'scissors_rare': '稀有剪刀',
    'hair_tie': '髮圈',
    'clover': '三葉草',
    'four-leaf_clover': '四葉草',
    'tiny_book': '迷你書',
    'sushi': '壽司',
    'mountain_pin_badge': '山形徽章',
    'ball_keychain': '球形鑰匙圈',
    'theme_park_ticket_1': '遊樂園門票1',
    'theme_park_ticket_2': '遊樂園門票2',
    'bus_papercraft': '紙公車',
    'pizza': '披薩',
    'ramen_keychain': '拉麵鑰匙圈',
    'pasta': '義大利麵',
    'bridge_pin_badge': '橋形徽章',
    'hotel_amenities': '飯店備品',
    'makeup': '化妝品',
    'fortune_1': '大吉',
    'fortune_2': '中吉',
    'fortune_3': '小吉',
    'fortune_4': '末吉',
    'fortune_5': '凶',
    'battery_1': '電池1',
    'battery_2': '電池2',
    'battery_3': '電池3',
    'battery_4': '電池4',
    'battery_5': '電池5',
    'battery_6': '電池6',
    'curry_bowl': '咖哩飯',
    'tool': '工具',
    'college_crest_patch': '校徽',
    'taco': '塔可',
    'laundry_item': '洗衣用品',
    'kimchi': '泡菜',
    'cheese': '起司',
    'coral': '珊瑚',
    'paint': '顏料',
    'afternoon_tea': '下午茶',
    'tiny_instrument': '迷你樂器',
    'surfboard_keychain': '衝浪板鑰匙圈',
    'shaved_ice': '刨冰',
    'mooncake': '月餅',
    'photo_button_badge': '照片徽章',
    'nintendo_consoles_1': '任天堂主機',
    'pacifier': '奶嘴',
    'osechi': '御節料理',
    'lunar_new_year_ornament_1': '農曆新年裝飾1',
    'lunar_new_year_ornament_2': '農曆新年裝飾2',
    'chess_piece_1': '西洋棋1',
    'chess_piece_2': '西洋棋2',
    'fingerboard': '指板',
    'flower_card_1': '花札1',
    'flower_card_2': '花札2',
    'flower_card_3': '花札3',
    'flower_card_4': '花札4',
    'flower_card_5': '花札5',
    'flower_card_6': '花札6',
    'flower_card_7': '花札7',
    'flower_card_8': '花札8',
    'jack-o-lantern': '南瓜燈',
    'halloween_treat': '萬聖節糖果',
    'halloween_light': '萬聖節燈',
    'first_anniversary_snack': '一週年零食',
    '3rd_anniversary_cupcake': '三週年杯子蛋糕',
    '4th_anniversary_flower_box': '四週年花盒',
    '4th_anniversary_snack': '四週年零食',
    'valentine_sticker': '情人節貼紙',
    'reverse_valentines_day_sticker': '白色情人節貼紙',
    'present_sticker_gold': '金色禮物貼紙',
    'chocolate': '巧克力',
    'easter_egg': '復活節彩蛋',
    'bunny_egg': '兔子蛋',
    'ice_cream_1': '冰淇淋1',
    'ice_cream_2': '冰淇淋2',
    'sneaker_keychain': '運動鞋鑰匙圈',
    'puzzle_1': '拼圖1',
    'puzzle_2': '拼圖2',
    'puzzle_3': '拼圖3',
    'puzzle_4': '拼圖4',
    'playing_card_1': '撲克牌1',
    'playing_card_2': '撲克牌2',
    'playing_card_3': '撲克牌3',
    'playing_card_4': '撲克牌4',
    'mahjong_tile_1': '麻將1',
    'mahjong_tile_2': '麻將2',
    'mahjong_tile_3': '麻將3',
    'mahjong_tile_4': '麻將4',
    'mahjong_tile_5': '麻將5',
    'spring_sticker': '春季貼紙',
    'summer_sticker': '夏季貼紙',
    'fall_sticker': '秋季貼紙',
    'winter_sticker': '冬季貼紙',
    'mitten': '手套',
    '2023_glasses': '2023眼鏡',
    '2024_glasses': '2024眼鏡',
    '2025_ornament': '2025裝飾',
    'party_popper_2025': '2025派對彩帶',
    'ball_ornament': '圓形裝飾',
    'koppaite_space_suit': 'Koppaite太空衣',
    'mario_hat': '瑪利歐帽',
    'rio_carnival': '里約嘉年華',
    'calavera': '骷髏頭',
    'rosette': '緞帶花飾',
    'pikmin_badge_1': 'Pikmin徽章1',
    'pikmin_badge_2': 'Pikmin徽章2',
    'pikmin_badge_3': 'Pikmin徽章3',
    'pikmin_badge_4': 'Pikmin徽章4',
    'pikmin_badge_5': 'Pikmin徽章5',
    'pikmin_badge_6': 'Pikmin徽章6',
    'pikmin_badge_7': 'Pikmin徽章7',
    'fairy_lights_1': '彩燈1',
    'fairy_lights_2': '彩燈2',
    'pikmin_4_spaceship': 'Pikmin 4太空船',
    'pikmin_4_toy': 'Pikmin 4玩具',
    'sticker_1': '貼紙A',
    'sticker_2': '貼紙B',
    'sticker_3': '貼紙C',
    'coin': '金幣',
    'coin_rare': '稀有金幣',
    'leaf_hat_1': '葉帽1',
    'leaf_hat_2': '葉帽2',
    'leaf_hat_3': '葉帽3',
    'snow': '雪',
    'golden_toy_airplane': '金色玩具飛機',
}

# 飾品分類定義 (按遊戲中的順序)
CATEGORY_DEFINITIONS = OrderedDict([
    # 一般地點飾品
    ('restaurant', {'name': '餐廳', 'nameEn': 'Restaurant', 'type': 'regular', 'icon': '🍽️', 'keywords': ['Chef_Hat']}),
    ('cafe', {'name': '咖啡廳', 'nameEn': 'Café', 'type': 'regular', 'icon': '☕', 'keywords': ['Coffee_Cup']}),
    ('sweetshop', {'name': '甜點店', 'nameEn': 'Sweetshop', 'type': 'regular', 'icon': '🍰', 'keywords': ['Macaron', 'Donut']}),
    ('movie-theater', {'name': '電影院', 'nameEn': 'Movie Theater', 'type': 'regular', 'icon': '🎬', 'keywords': ['Popcorn_Snack']}),
    ('pharmacy', {'name': '藥局', 'nameEn': 'Pharmacy', 'type': 'regular', 'icon': '💊', 'keywords': ['Toothbrush']}),
    ('zoo', {'name': '動物園', 'nameEn': 'Zoo', 'type': 'regular', 'icon': '🦁', 'keywords': ['Dandelion']}),
    ('forest', {'name': '森林', 'nameEn': 'Forest', 'type': 'regular', 'icon': '🌲', 'keywords': ['Stag_Beetle', 'Acorn']}),
    ('waterside', {'name': '水邊', 'nameEn': 'Waterside', 'type': 'regular', 'icon': '🌊', 'keywords': ['Fishing_Lure']}),
    ('post-office', {'name': '郵局', 'nameEn': 'Post Office', 'type': 'regular', 'icon': '✉️', 'keywords': ['Stamp']}),
    ('art-gallery', {'name': '美術館', 'nameEn': 'Art Gallery', 'type': 'regular', 'icon': '🎨', 'keywords': ['Picture_Frame']}),
    ('airport', {'name': '機場', 'nameEn': 'Airport', 'type': 'regular', 'icon': '✈️', 'keywords': ['Toy_Airplane']}),
    ('station', {'name': '車站', 'nameEn': 'Station', 'type': 'regular', 'icon': '🚂', 'keywords': ['Paper_Train', 'Ticket', 'Gold_Ticket']}),
    ('beach', {'name': '海灘', 'nameEn': 'Beach', 'type': 'regular', 'icon': '🏖️', 'keywords': ['Shell']}),
    ('burger', {'name': '漢堡店', 'nameEn': 'Hamburger Shop', 'type': 'regular', 'icon': '🍔', 'keywords': ['Burger']}),
    ('convenience-store', {'name': '便利商店', 'nameEn': 'Convenience Store', 'type': 'regular', 'icon': '🏪', 'keywords': ['Bottle_Cap']}),
    ('supermarket', {'name': '超市', 'nameEn': 'Supermarket', 'type': 'regular', 'icon': '🛒', 'keywords': ['Banana', 'Mushroom', 'Snack']}),
    ('bakery', {'name': '麵包店', 'nameEn': 'Bakery', 'type': 'regular', 'icon': '🥐', 'keywords': ['Baguette']}),
    ('hair-salon', {'name': '美髮院', 'nameEn': 'Hair Salon', 'type': 'regular', 'icon': '💇', 'keywords': ['Scissors', 'Hair_Tie']}),
    ('clothes-store', {'name': '服飾店', 'nameEn': 'Clothes Store', 'type': 'regular', 'icon': '👔', 'keywords': ['Clover']}),
    ('park', {'name': '公園', 'nameEn': 'Park', 'type': 'regular', 'icon': '🌳', 'keywords': ['Four-Leaf_Clover', 'Four-Leaf Clover']}),
    ('library', {'name': '圖書館', 'nameEn': 'Library', 'type': 'regular', 'icon': '📚', 'keywords': ['Tiny_Book']}),
    ('sushi', {'name': '壽司店', 'nameEn': 'Sushi Restaurant', 'type': 'regular', 'icon': '🍣', 'keywords': ['Sushi']}),
    ('mountain', {'name': '山', 'nameEn': 'Mountain', 'type': 'regular', 'icon': '⛰️', 'keywords': ['Mountain_Pin_Badge']}),
    ('stadium', {'name': '體育場', 'nameEn': 'Stadium', 'type': 'regular', 'icon': '🏟️', 'keywords': ['Ball_Keychain']}),
    ('theme-park', {'name': '遊樂園', 'nameEn': 'Theme Park', 'type': 'regular', 'icon': '🎢', 'keywords': ['Theme_Park_Ticket']}),
    ('bus-stop', {'name': '公車站', 'nameEn': 'Bus Stop', 'type': 'regular', 'icon': '🚌', 'keywords': ['Bus_Papercraft']}),
    ('italian', {'name': '義大利餐廳', 'nameEn': 'Italian Restaurant', 'type': 'regular', 'icon': '🍕', 'keywords': ['Pizza']}),
    ('ramen', {'name': '拉麵店', 'nameEn': 'Ramen Shop', 'type': 'regular', 'icon': '🥡', 'keywords': ['Ramen_Keychain']}),
    ('pasta', {'name': '義大利麵店', 'nameEn': 'Pasta Restaurant', 'type': 'regular', 'icon': '🍜', 'keywords': ['Pasta']}),
    ('bridge', {'name': '橋', 'nameEn': 'Bridge', 'type': 'regular', 'icon': '🌉', 'keywords': ['Bridge_Pin_Badge']}),
    ('hotel', {'name': '飯店', 'nameEn': 'Hotel', 'type': 'regular', 'icon': '🏨', 'keywords': ['Hotel_Amenities']}),
    ('cosmetics', {'name': '美妝店', 'nameEn': 'Cosmetics Store', 'type': 'regular', 'icon': '💄', 'keywords': ['Makeup']}),
    ('shrine', {'name': '神社', 'nameEn': 'Shrine', 'type': 'regular', 'icon': '⛩️', 'keywords': ['Fortune_']}),
    ('electronics', {'name': '電器行', 'nameEn': 'Electronics Store', 'type': 'regular', 'icon': '🔌', 'keywords': ['Battery']}),
    ('curry', {'name': '咖哩店', 'nameEn': 'Curry Restaurant', 'type': 'regular', 'icon': '🍛', 'keywords': ['Curry_Bowl']}),
    ('hardware', {'name': '五金行', 'nameEn': 'Hardware Store', 'type': 'regular', 'icon': '🔧', 'keywords': ['Tool']}),
    ('university', {'name': '大學', 'nameEn': 'University', 'type': 'regular', 'icon': '🎓', 'keywords': ['College_Crest_Patch']}),
    ('taco', {'name': '墨西哥餐廳', 'nameEn': 'Taco Restaurant', 'type': 'regular', 'icon': '🌮', 'keywords': ['Taco']}),
    ('laundromat', {'name': '洗衣店', 'nameEn': 'Laundromat', 'type': 'regular', 'icon': '🧺', 'keywords': ['Laundry_Item']}),
    ('korean', {'name': '韓式餐廳', 'nameEn': 'Korean Restaurant', 'type': 'regional', 'icon': '🇰🇷', 'keywords': ['Kimchi']}),
    ('cheese', {'name': '起司店', 'nameEn': 'Cheese Shop', 'type': 'regular', 'icon': '🧀', 'keywords': ['Cheese']}),
    ('aquarium', {'name': '水族館', 'nameEn': 'Aquarium', 'type': 'regular', 'icon': '🐠', 'keywords': ['Coral']}),
    ('art-studio', {'name': '藝術工作室', 'nameEn': 'Art Studio', 'type': 'regular', 'icon': '🖌️', 'keywords': ['Paint']}),
    ('afternoon-tea', {'name': '下午茶店', 'nameEn': 'Afternoon Tea', 'type': 'regional', 'icon': '🫖', 'keywords': ['Afternoon_Tea']}),
    ('music-venue', {'name': '音樂場地', 'nameEn': 'Music Venue', 'type': 'regular', 'icon': '🎵', 'keywords': ['Tiny_Instrument']}),
    ('surf-shop', {'name': '衝浪店', 'nameEn': 'Surf Shop', 'type': 'regular', 'icon': '🏄', 'keywords': ['Surfboard_Keychain']}),
    ('shaved-ice', {'name': '刨冰店', 'nameEn': 'Shaved Ice Shop', 'type': 'regional', 'icon': '🍧', 'keywords': ['Shaved_Ice']}),
    ('mooncake', {'name': '月餅店', 'nameEn': 'Mooncake Shop', 'type': 'regional', 'icon': '🥮', 'keywords': ['Mooncake']}),
    ('photo-studio', {'name': '照相館', 'nameEn': 'Photo Studio', 'type': 'regular', 'icon': '📷', 'keywords': ['Photo_Button_Badge']}),
    ('gaming', {'name': '電玩中心', 'nameEn': 'Gaming Center', 'type': 'regular', 'icon': '🎮', 'keywords': ['Nintendo_Consoles']}),
    ('baby', {'name': '嬰兒用品店', 'nameEn': 'Baby Store', 'type': 'regular', 'icon': '👶', 'keywords': ['Pacifier']}),
    ('osechi', {'name': '御節料理店', 'nameEn': 'Osechi Shop', 'type': 'regional', 'icon': '🍱', 'keywords': ['Osechi']}),
    
    # 特殊活動飾品
    ('lunar-new-year', {'name': '農曆新年', 'nameEn': 'Lunar New Year', 'type': 'special', 'icon': '🧧', 'keywords': ['Lunar_New_Year_Ornament']}),
    ('chess', {'name': '西洋棋', 'nameEn': 'Chess', 'type': 'special', 'icon': '♟️', 'keywords': ['Chess_Piece']}),
    ('fingerboard', {'name': '指板', 'nameEn': 'Fingerboard', 'type': 'special', 'icon': '🛹', 'keywords': ['Fingerboard']}),
    ('hanafuda', {'name': '花札', 'nameEn': 'Hanafuda', 'type': 'special', 'icon': '🎴', 'keywords': ['Flower_Card']}),
    ('halloween', {'name': '萬聖節', 'nameEn': 'Halloween', 'type': 'special', 'icon': '🎃', 'keywords': ['Jack-o', 'Halloween_Treat', 'Halloween_Light']}),
    ('anniversary', {'name': '週年紀念', 'nameEn': 'Anniversary', 'type': 'special', 'icon': '🎂', 'keywords': ['Anniversary_Snack', 'Anniversary_Cupcake', 'Anniversary_Flower_Box']}),
    ('valentines', {'name': '情人節', 'nameEn': "Valentine's Day", 'type': 'special', 'icon': '💝', 'keywords': ['Valentine_Sticker', 'Reverse_Valentine', 'Present_Sticker', 'Chocolate']}),
    ('easter', {'name': '復活節', 'nameEn': 'Easter', 'type': 'special', 'icon': '🥚', 'keywords': ['Easter_Egg', 'Bunny_Egg']}),
    ('ice-cream', {'name': '冰淇淋', 'nameEn': 'Ice Cream', 'type': 'special', 'icon': '🍦', 'keywords': ['Ice_Cream', 'Sneaker_Keychain']}),
    ('puzzle', {'name': '拼圖', 'nameEn': 'Puzzle', 'type': 'special', 'icon': '🧩', 'keywords': ['Puzzle_']}),
    ('playing-card', {'name': '撲克牌', 'nameEn': 'Playing Card', 'type': 'special', 'icon': '🃏', 'keywords': ['Playing_Card']}),
    ('mahjong', {'name': '麻將', 'nameEn': 'Mahjong', 'type': 'special', 'icon': '🀄', 'keywords': ['Mahjong_Tile']}),
    ('spring', {'name': '春季', 'nameEn': 'Spring', 'type': 'special', 'icon': '🌸', 'keywords': ['Spring_Sticker']}),
    ('summer', {'name': '夏季', 'nameEn': 'Summer', 'type': 'special', 'icon': '☀️', 'keywords': ['Summer_Sticker']}),
    ('fall', {'name': '秋季', 'nameEn': 'Fall', 'type': 'special', 'icon': '🍂', 'keywords': ['Fall_Sticker']}),
    ('winter', {'name': '冬季', 'nameEn': 'Winter', 'type': 'special', 'icon': '❄️', 'keywords': ['Winter_Sticker', 'Mitten']}),
    ('pikmin4', {'name': 'Pikmin 4', 'nameEn': 'Pikmin 4', 'type': 'special', 'icon': '🚀', 'keywords': ['Pikmin_4_Spaceship', 'Pikmin_4_Toy']}),
    ('new-year', {'name': '新年', 'nameEn': 'New Year', 'type': 'special', 'icon': '🎊', 'keywords': ['2023_Glasses', '2024_Glasses', '2025_Ornament', 'Party_Popper', 'Ball_Ornament']}),
    ('koppaite', {'name': 'Koppaite 太空衣', 'nameEn': 'Koppaite Space Suit', 'type': 'special', 'icon': '👨‍🚀', 'keywords': ['Koppaite_Space_Suit']}),
    ('mario', {'name': '瑪利歐', 'nameEn': 'Mario', 'type': 'special', 'icon': '🍄', 'keywords': ['Mario_Hat']}),
    ('rio-carnival', {'name': '里約嘉年華', 'nameEn': 'Rio Carnival', 'type': 'special', 'icon': '🎭', 'keywords': ['Rio_Carnival']}),
    ('day-of-dead', {'name': '亡靈節', 'nameEn': 'Day of the Dead', 'type': 'special', 'icon': '💀', 'keywords': ['Calavera']}),
    ('rosette', {'name': '緞帶花飾', 'nameEn': 'Rosette', 'type': 'special', 'icon': '🎀', 'keywords': ['Rosette']}),
    ('pikmin-badge', {'name': 'Pikmin 徽章', 'nameEn': 'Pikmin Badge', 'type': 'special', 'icon': '🏅', 'keywords': ['Pikmin_Badge']}),
    ('fairy-lights', {'name': '彩燈', 'nameEn': 'Fairy Lights', 'type': 'special', 'icon': '💡', 'keywords': ['Fairy_Lights']}),
    
    # 路邊飾品
    ('roadside', {'name': '路邊', 'nameEn': 'Roadside', 'type': 'roadside', 'icon': '🏷️', 'keywords': ['Sticker_1', 'Sticker_2', 'Sticker_3']}),
    ('coin', {'name': '金幣', 'nameEn': 'Coin', 'type': 'roadside', 'icon': '🪙', 'keywords': ['Coin']}),
    
    # 天氣飾品  
    ('weather-rain', {'name': '雨天', 'nameEn': 'Rainy Weather', 'type': 'weather', 'icon': '🌧️', 'keywords': ['Leaf_Hat']}),
    ('weather-snow', {'name': '雪天', 'nameEn': 'Snowy Weather', 'type': 'weather', 'icon': '🌨️', 'keywords': ['Snow']}),
    
    # 地區限定
    ('golden-airplane', {'name': '金色飛機', 'nameEn': 'Golden Toy Airplane', 'type': 'regional', 'icon': '✈️', 'keywords': ['Golden_Toy_Airplane']}),
])

def get_variant_name(key):
    """從 key 中提取變體名稱"""
    # 移除皮克敏類型前綴
    for ptype in PIKMIN_TYPE_MAP.keys():
        if key.startswith(f"{ptype}_"):
            key = key[len(ptype)+1:]
            break
    
    # 處理 URL 編碼
    key = key.replace('%28', '(').replace('%29', ')').replace('%27', "'")
    
    # 移除數字後綴用於分組（但保留用於 variant id）
    return key

def get_base_variant_name(key):
    """取得基本變體名稱（不含數字後綴）"""
    name = get_variant_name(key)
    # 移除結尾的數字
    match = re.match(r'^(.+?)_?(\d+)?$', name)
    if match:
        return match.group(1)
    return name

def parse_scraped_images():
    """解析 scraped_images.json 並分類"""
    # 過濾掉非飾品的圖片
    skip_keys = ['Pikmin_website_image', 'Sorting_Trick_Roadside.jpg', 'Missorted_Pair.jpg']
    
    # 收集所有飾品
    decor_items = {}
    
    for key, url in scraped_images.items():
        if key in skip_keys:
            continue
        
        # 解析皮克敏類型和變體名稱
        pikmin_type = None
        variant_key = key
        
        for ptype, ptype_lower in PIKMIN_TYPE_MAP.items():
            if key.startswith(f"{ptype}_"):
                pikmin_type = ptype_lower
                variant_key = key[len(ptype)+1:]
                break
        
        if not pikmin_type:
            # 可能是特殊項目，如 Pikmin_Badge
            if 'Pikmin_Badge' in key:
                pikmin_type = 'special'
                variant_key = key
            else:
                continue
        
        # 處理 URL 編碼
        variant_key = variant_key.replace('%28', '(').replace('%29', ')').replace('%27', "'")
        
        # 決定分類
        category_id = None
        for cat_id, cat_def in CATEGORY_DEFINITIONS.items():
            for keyword in cat_def['keywords']:
                if keyword.lower() in key.lower():
                    category_id = cat_id
                    break
            if category_id:
                break
        
        if not category_id:
            print(f"Warning: No category found for {key}")
            continue
        
        # 取得基本變體名稱
        base_variant = get_base_variant_name(key)
        
        # 檢查是否是稀有版本
        is_rare = '(Rare)' in key
        
        # 建立唯一的變體 ID
        variant_id = variant_key.replace(' ', '_').replace('(', '').replace(')', '').replace("'", '').lower()
        
        # 收集資料
        if category_id not in decor_items:
            decor_items[category_id] = {}
        
        if variant_id not in decor_items[category_id]:
            decor_items[category_id][variant_id] = {
                'name': variant_key.replace('_', ' '),
                'is_rare': is_rare,
                'image_urls': {}
            }
        
        if pikmin_type != 'special':
            decor_items[category_id][variant_id]['image_urls'][pikmin_type] = url
    
    return decor_items

def generate_decor_json(decor_items):
    """生成 decor.json 格式"""
    definitions = []
    
    for cat_id, cat_def in CATEGORY_DEFINITIONS.items():
        if cat_id not in decor_items:
            continue
        
        variants = []
        available_types = set()
        
        for var_id, var_data in decor_items[cat_id].items():
            image_urls = var_data['image_urls']
            
            if not image_urls:
                continue
            
            # 更新可用的皮克敏類型
            available_types.update(image_urls.keys())
            
            variant = {
                'id': var_id,
                'name': var_data['name'],
                'nameEn': var_data['name'],
                'imageUrl': list(image_urls.values())[0] if image_urls else '',
                'imageUrls': image_urls
            }
            
            if var_data['is_rare']:
                variant['isRare'] = True
            
            variants.append(variant)
        
        if not variants:
            continue
        
        # 按順序排序皮克敏類型
        ordered_types = [t for t in PIKMIN_TYPES if t in available_types]
        
        definition = {
            'category': {
                'id': cat_id,
                'name': cat_def['name'],
                'nameEn': cat_def['nameEn'],
                'type': cat_def['type'],
                'icon': cat_def['icon']
            },
            'variants': variants,
            'availablePikminTypes': ordered_types
        }
        
        definitions.append(definition)
    
    decor_json = {
        'version': 8,
        'lastUpdated': datetime.now().strftime('%Y-%m-%d'),
        'source': 'Generated from scraped_images.json',
        'definitions': definitions
    }
    
    return decor_json

def main():
    print("解析 scraped_images.json...")
    decor_items = parse_scraped_images()
    
    print(f"找到 {len(decor_items)} 個分類")
    
    print("生成 decor.json...")
    decor_json = generate_decor_json(decor_items)
    
    print(f"生成 {len(decor_json['definitions'])} 個定義")
    
    # 寫入檔案
    output_path = 'app/data/decor_new.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(decor_json, f, ensure_ascii=False, indent=2)
    
    print(f"已儲存到 {output_path}")
    
    # 顯示統計
    total_variants = sum(len(d['variants']) for d in decor_json['definitions'])
    print(f"\n統計:")
    print(f"  分類數: {len(decor_json['definitions'])}")
    print(f"  變體數: {total_variants}")

if __name__ == '__main__':
    main()
