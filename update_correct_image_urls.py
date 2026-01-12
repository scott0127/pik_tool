#!/usr/bin/env python3
"""
使用從 Pikmin Wiki 實際提取的圖片 URLs 更新 decor.json
"""

import json

# 從 Wiki 提取的實際圖片 URLs (由瀏覽器子代理提取)
WIKI_IMAGE_URLS = {
    "jack-o-lantern": {
        "red": "https://pikmin.wiki.gallery/images/thumb/d/d2/Decor_Red_Jack-o%27-Lantern.png/150px-Decor_Red_Jack-o%27-Lantern.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/3/3e/Decor_Yellow_Jack-o%27-Lantern.png/150px-Decor_Yellow_Jack-o%27-Lantern.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/b/bf/Decor_Blue_Jack-o%27-Lantern.png/150px-Decor_Blue_Jack-o%27-Lantern.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/b/bb/Decor_White_Jack-o%27-Lantern.png/150px-Decor_White_Jack-o%27-Lantern.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/8/84/Decor_Purple_Jack-o%27-Lantern.png/150px-Decor_Purple_Jack-o%27-Lantern.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/a/aa/Decor_Rock_Jack-o%27-Lantern.png/150px-Decor_Rock_Jack-o%27-Lantern.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/1/15/Decor_Winged_Jack-o%27-Lantern.png/150px-Decor_Winged_Jack-o%27-Lantern.png"
    },
    "halloween-treat": {
        "red": "https://pikmin.wiki.gallery/images/thumb/4/4f/Decor_Red_Halloween_Treat.png/150px-Decor_Red_Halloween_Treat.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/e/e7/Decor_Yellow_Halloween_Treat.png/150px-Decor_Yellow_Halloween_Treat.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/e/ee/Decor_Blue_Halloween_Treat.png/150px-Decor_Blue_Halloween_Treat.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/d/de/Decor_White_Halloween_Treat.png/150px-Decor_White_Halloween_Treat.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/7/7c/Decor_Purple_Halloween_Treat.png/150px-Decor_Purple_Halloween_Treat.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/3/37/Decor_Rock_Halloween_Treat.png/150px-Decor_Rock_Halloween_Treat.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/4/48/Decor_Winged_Halloween_Treat.png/150px-Decor_Winged_Halloween_Treat.png"
    },
    "halloween-light": {
        "red": "https://pikmin.wiki.gallery/images/thumb/2/25/Decor_Red_Halloween_Light.png/150px-Decor_Red_Halloween_Light.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/8/84/Decor_Yellow_Halloween_Light.png/150px-Decor_Yellow_Halloween_Light.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/d/d7/Decor_Blue_Halloween_Light.png/150px-Decor_Blue_Halloween_Light.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/2/26/Decor_White_Halloween_Light.png/150px-Decor_White_Halloween_Light.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/0/00/Decor_Purple_Halloween_Light.png/150px-Decor_Purple_Halloween_Light.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/c/ca/Decor_Rock_Halloween_Light.png/150px-Decor_Rock_Halloween_Light.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/b/b7/Decor_Winged_Halloween_Light.png/150px-Decor_Winged_Halloween_Light.png"
    },
    "first-anniversary-snack": {
        "red": "https://pikmin.wiki.gallery/images/thumb/f/f5/Decor_Red_First_Anniversary_Snack.png/150px-Decor_Red_First_Anniversary_Snack.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/6/6f/Decor_Yellow_First_Anniversary_Snack.png/150px-Decor_Yellow_First_Anniversary_Snack.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/c/c4/Decor_Blue_First_Anniversary_Snack.png/150px-Decor_Blue_First_Anniversary_Snack.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/1/1c/Decor_White_First_Anniversary_Snack.png/150px-Decor_White_First_Anniversary_Snack.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/4/46/Decor_Purple_First_Anniversary_Snack.png/150px-Decor_Purple_First_Anniversary_Snack.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/3/34/Decor_Rock_First_Anniversary_Snack.png/150px-Decor_Rock_First_Anniversary_Snack.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/1/13/Decor_Winged_First_Anniversary_Snack.png/150px-Decor_Winged_First_Anniversary_Snack.png"
    },
    "mitten": {
        "red": "https://pikmin.wiki.gallery/images/thumb/d/da/Decor_Red_Mitten.png/150px-Decor_Red_Mitten.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/7/75/Decor_Yellow_Mitten.png/150px-Decor_Yellow_Mitten.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/3/3f/Decor_Blue_Mitten.png/150px-Decor_Blue_Mitten.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/3/3d/Decor_White_Mitten.png/150px-Decor_White_Mitten.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/4/4c/Decor_Purple_Mitten.png/150px-Decor_Purple_Mitten.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/3/3f/Decor_Rock_Mitten.png/150px-Decor_Rock_Mitten.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/1/10/Decor_Winged_Mitten.png/150px-Decor_Winged_Mitten.png"
    },
    "2023-glasses": {
        "red": "https://pikmin.wiki.gallery/images/thumb/4/42/Decor_Red_2023_Glasses.png/150px-Decor_Red_2023_Glasses.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/0/0e/Decor_Yellow_2023_Glasses.png/150px-Decor_Yellow_2023_Glasses.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/e/e2/Decor_Blue_2023_Glasses.png/150px-Decor_Blue_2023_Glasses.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/a/a9/Decor_White_2023_Glasses.png/150px-Decor_White_2023_Glasses.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/8/8a/Decor_Purple_2023_Glasses.png/150px-Decor_Purple_2023_Glasses.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/7/72/Decor_Rock_2023_Glasses.png/150px-Decor_Rock_2023_Glasses.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/a/ad/Decor_Winged_2023_Glasses.png/150px-Decor_Winged_2023_Glasses.png"
    },
    "2024-glasses": {
        "red": "https://pikmin.wiki.gallery/images/thumb/1/1e/Decor_Red_2024_Glasses.png/150px-Decor_Red_2024_Glasses.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/c/cb/Decor_Yellow_2024_Glasses.png/150px-Decor_Yellow_2024_Glasses.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/d/dc/Decor_Blue_2024_Glasses.png/150px-Decor_Blue_2024_Glasses.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/6/63/Decor_White_2024_Glasses.png/150px-Decor_White_2024_Glasses.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/e/eb/Decor_Purple_2024_Glasses.png/150px-Decor_Purple_2024_Glasses.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/9/96/Decor_Rock_2024_Glasses.png/150px-Decor_Rock_2024_Glasses.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/6/64/Decor_Winged_2024_Glasses.png/150px-Decor_Winged_2024_Glasses.png"
    },
    "valentine-sticker": {
        "red": "https://pikmin.wiki.gallery/images/thumb/3/38/Decor_Red_Valentine_Sticker.png/150px-Decor_Red_Valentine_Sticker.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/8/86/Decor_Yellow_Valentine_Sticker.png/150px-Decor_Yellow_Valentine_Sticker.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/c/c9/Decor_Blue_Valentine_Sticker.png/150px-Decor_Blue_Valentine_Sticker.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/a/a2/Decor_White_Valentine_Sticker.png/150px-Decor_White_Valentine_Sticker.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/1/1a/Decor_Purple_Valentine_Sticker.png/150px-Decor_Purple_Valentine_Sticker.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/d/d1/Decor_Rock_Valentine_Sticker.png/150px-Decor_Rock_Valentine_Sticker.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/8/85/Decor_Winged_Valentine_Sticker.png/150px-Decor_Winged_Valentine_Sticker.png"
    },
    "reverse-valentine-sticker": {
        "red": "https://pikmin.wiki.gallery/images/thumb/a/a8/Decor_Red_Reverse_Valentine%27s_Day_Sticker.png/150px-Decor_Red_Reverse_Valentine%27s_Day_Sticker.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/0/0b/Decor_Yellow_Reverse_Valentine%27s_Day_Sticker.png/150px-Decor_Yellow_Reverse_Valentine%27s_Day_Sticker.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/3/38/Decor_Blue_Reverse_Valentine%27s_Day_Sticker.png/150px-Decor_Blue_Reverse_Valentine%27s_Day_Sticker.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/9/9e/Decor_White_Reverse_Valentine%27s_Day_Sticker.png/150px-Decor_White_Reverse_Valentine%27s_Day_Sticker.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/2/24/Decor_Purple_Reverse_Valentine%27s_Day_Sticker.png/150px-Decor_Purple_Reverse_Valentine%27s_Day_Sticker.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/b/b8/Decor_Rock_Reverse_Valentine%27s_Day_Sticker.png/150px-Decor_Rock_Reverse_Valentine%27s_Day_Sticker.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/4/4a/Decor_Winged_Reverse_Valentine%27s_Day_Sticker.png/150px-Decor_Winged_Reverse_Valentine%27s_Day_Sticker.png"
    },
    "easter-egg": {
        "red": "https://pikmin.wiki.gallery/images/thumb/5/56/Decor_Red_Easter_Egg.png/150px-Decor_Red_Easter_Egg.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/7/71/Decor_Yellow_Easter_Egg.png/150px-Decor_Yellow_Easter_Egg.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/3/3e/Decor_Blue_Easter_Egg.png/150px-Decor_Blue_Easter_Egg.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/a/a6/Decor_White_Easter_Egg.png/150px-Decor_White_Easter_Egg.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/2/26/Decor_Purple_Easter_Egg.png/150px-Decor_Purple_Easter_Egg.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/f/f9/Decor_Rock_Easter_Egg.png/150px-Decor_Rock_Easter_Egg.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/e/e5/Decor_Winged_Easter_Egg.png/150px-Decor_Winged_Easter_Egg.png"
    },
    "bunny-egg": {
        "red": "https://pikmin.wiki.gallery/images/thumb/4/4a/Decor_Red_Bunny_Egg.png/150px-Decor_Red_Bunny_Egg.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/c/c8/Decor_Yellow_Bunny_Egg.png/150px-Decor_Yellow_Bunny_Egg.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/2/24/Decor_Blue_Bunny_Egg.png/150px-Decor_Blue_Bunny_Egg.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/1/19/Decor_White_Bunny_Egg.png/150px-Decor_White_Bunny_Egg.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/8/88/Decor_Purple_Bunny_Egg.png/150px-Decor_Purple_Bunny_Egg.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/7/7d/Decor_Rock_Bunny_Egg.png/150px-Decor_Rock_Bunny_Egg.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/6/6a/Decor_Winged_Bunny_Egg.png/150px-Decor_Winged_Bunny_Egg.png"
    },
    "sneaker-keychain": {
        "red": "https://pikmin.wiki.gallery/images/thumb/1/12/Decor_Red_Sneaker_Keychain.png/150px-Decor_Red_Sneaker_Keychain.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/d/d8/Decor_Yellow_Sneaker_Keychain.png/150px-Decor_Yellow_Sneaker_Keychain.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/d/d9/Decor_Blue_Sneaker_Keychain.png/150px-Decor_Blue_Sneaker_Keychain.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/5/5f/Decor_White_Sneaker_Keychain.png/150px-Decor_White_Sneaker_Keychain.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/2/2f/Decor_Purple_Sneaker_Keychain.png/150px-Decor_Purple_Sneaker_Keychain.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/9/95/Decor_Rock_Sneaker_Keychain.png/150px-Decor_Rock_Sneaker_Keychain.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/1/1e/Decor_Winged_Sneaker_Keychain.png/150px-Decor_Winged_Sneaker_Keychain.png"
    },
    "3rd-anniversary-cupcake": {
        "red": "https://pikmin.wiki.gallery/images/thumb/2/2b/Decor_Red_3rd_Anniversary_Cupcake.png/150px-Decor_Red_3rd_Anniversary_Cupcake.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/1/1b/Decor_Yellow_3rd_Anniversary_Cupcake.png/150px-Decor_Yellow_3rd_Anniversary_Cupcake.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/0/03/Decor_Blue_3rd_Anniversary_Cupcake.png/150px-Decor_Blue_3rd_Anniversary_Cupcake.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/5/57/Decor_White_3rd_Anniversary_Cupcake.png/150px-Decor_White_3rd_Anniversary_Cupcake.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/c/c7/Decor_Purple_3rd_Anniversary_Cupcake.png/150px-Decor_Purple_3rd_Anniversary_Cupcake.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/0/05/Decor_Rock_3rd_Anniversary_Cupcake.png/150px-Decor_Rock_3rd_Anniversary_Cupcake.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/f/f8/Decor_Winged_3rd_Anniversary_Cupcake.png/150px-Decor_Winged_3rd_Anniversary_Cupcake.png"
    },
    "party-popper": {
        "red": "https://pikmin.wiki.gallery/images/thumb/2/20/Decor_Red_Party_Popper_2025.png/150px-Decor_Red_Party_Popper_2025.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/b/b9/Decor_Yellow_Party_Popper_2025.png/150px-Decor_Yellow_Party_Popper_2025.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/c/c1/Decor_Blue_Party_Popper_2025.png/150px-Decor_Blue_Party_Popper_2025.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/1/19/Decor_White_Party_Popper_2025.png/150px-Decor_White_Party_Popper_2025.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/f/f8/Decor_Purple_Party_Popper_2025.png/150px-Decor_Purple_Party_Popper_2025.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/1/1e/Decor_Rock_Party_Popper_2025.png/150px-Decor_Rock_Party_Popper_2025.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/b/bc/Decor_Winged_Party_Popper_2025.png/150px-Decor_Winged_Party_Popper_2025.png"
    },
    "chocolate": {
        "red": "https://pikmin.wiki.gallery/images/thumb/c/c3/Decor_Red_Chocolate.png/150px-Decor_Red_Chocolate.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/b/bb/Decor_Yellow_Chocolate.png/150px-Decor_Yellow_Chocolate.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/7/75/Decor_Blue_Chocolate.png/150px-Decor_Blue_Chocolate.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/f/f9/Decor_White_Chocolate.png/150px-Decor_White_Chocolate.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/e/e5/Decor_Purple_Chocolate.png/150px-Decor_Purple_Chocolate.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/a/ae/Decor_Rock_Chocolate.png/150px-Decor_Rock_Chocolate.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/4/4f/Decor_Winged_Chocolate.png/150px-Decor_Winged_Chocolate.png"
    },
    "4th-anniversary-flower-box": {
        "red": "https://pikmin.wiki.gallery/images/thumb/e/ee/Decor_Red_4th_Anniversary_Flower_Box.png/150px-Decor_Red_4th_Anniversary_Flower_Box.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/6/66/Decor_Yellow_4th_Anniversary_Flower_Box.png/150px-Decor_Yellow_4th_Anniversary_Flower_Box.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/e/e9/Decor_Blue_4th_Anniversary_Flower_Box.png/150px-Decor_Blue_4th_Anniversary_Flower_Box.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/a/a9/Decor_White_4th_Anniversary_Flower_Box.png/150px-Decor_White_4th_Anniversary_Flower_Box.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/8/86/Decor_Purple_4th_Anniversary_Flower_Box.png/150px-Decor_Purple_4th_Anniversary_Flower_Box.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/f/f7/Decor_Rock_4th_Anniversary_Flower_Box.png/150px-Decor_Rock_4th_Anniversary_Flower_Box.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/2/24/Decor_Winged_4th_Anniversary_Flower_Box.png/150px-Decor_Winged_4th_Anniversary_Flower_Box.png"
    },
    "4th-anniversary-snack": {
        "red": "https://pikmin.wiki.gallery/images/thumb/7/71/Decor_Red_4th_Anniversary_Snack.png/150px-Decor_Red_4th_Anniversary_Snack.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/8/88/Decor_Yellow_4th_Anniversary_Snack.png/150px-Decor_Yellow_4th_Anniversary_Snack.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/9/98/Decor_Blue_4th_Anniversary_Snack.png/150px-Decor_Blue_4th_Anniversary_Snack.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/2/2c/Decor_White_4th_Anniversary_Snack.png/150px-Decor_White_4th_Anniversary_Snack.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/9/94/Decor_Purple_4th_Anniversary_Snack.png/150px-Decor_Purple_4th_Anniversary_Snack.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/a/af/Decor_Rock_4th_Anniversary_Snack.png/150px-Decor_Rock_4th_Anniversary_Snack.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/2/22/Decor_Winged_4th_Anniversary_Snack.png/150px-Decor_Winged_4th_Anniversary_Snack.png"
    },
    "2025-ornament": {
        "red": "https://pikmin.wiki.gallery/images/thumb/7/73/Decor_Red_2025_Ornament.png/150px-Decor_Red_2025_Ornament.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/3/30/Decor_Yellow_2025_Ornament.png/150px-Decor_Yellow_2025_Ornament.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/9/96/Decor_Blue_2025_Ornament.png/150px-Decor_Blue_2025_Ornament.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/f/ff/Decor_White_2025_Ornament.png/150px-Decor_White_2025_Ornament.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/5/51/Decor_Purple_2025_Ornament.png/150px-Decor_Purple_2025_Ornament.png",
        "rock": "https://pikmin.wiki.gallery/images/thumb/f/f4/Decor_Rock_2025_Ornament.png/150px-Decor_Rock_2025_Ornament.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/4/44/Decor_Winged_2025_Ornament.png/150px-Decor_Winged_2025_Ornament.png"
    },
    "present-sticker-gold": {
        "red": "https://pikmin.wiki.gallery/images/thumb/8/85/Decor_Red_Present_Sticker_%28Gold%29.png/150px-Decor_Red_Present_Sticker_%28Gold%29.png",
        "yellow": "https://pikmin.wiki.gallery/images/thumb/3/35/Decor_Yellow_Present_Sticker_%28Gold%29.png/150px-Decor_Yellow_Present_Sticker_%28Gold%29.png",
        "blue": "https://pikmin.wiki.gallery/images/thumb/e/ee/Decor_Blue_Present_Sticker_%28Gold%29.png/150px-Decor_Blue_Present_Sticker_%28Gold%29.png",
        "white": "https://pikmin.wiki.gallery/images/thumb/3/33/Decor_White_Present_Sticker_%28Gold%29.png/150px-Decor_White_Present_Sticker_%28Gold%29.png",
        "purple": "https://pikmin.wiki.gallery/images/thumb/d/db/Decor_Purple_Present_Sticker_%28Gold%29.png/150px-Decor_Purple_Present_Sticker_%28Gold%29.png",
        "winged": "https://pikmin.wiki.gallery/images/thumb/5/54/Decor_Winged_Present_Sticker_%28Gold%29.png/150px-Decor_Winged_Present_Sticker_%28Gold%29.png"
    }
}

def update_image_urls():
    """更新 decor.json 中的圖片 URLs"""
    filepath = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("更新圖片 URLs...")
    print("="*70)
    
    updated_count = 0
    
    for item in data['definitions']:
        cat_id = item['category']['id']
        cat_name = item['category']['name']
        
        if cat_id in WIKI_IMAGE_URLS:
            # 如果已有 variants，更新圖片 URLs
            if item.get('variants') and len(item['variants']) > 0:
                item['variants'][0]['imageUrls'] = WIKI_IMAGE_URLS[cat_id]
                updated_count += 1
                print(f"  ✅ 更新 {cat_id}: {cat_name} ({len(WIKI_IMAGE_URLS[cat_id])} 種顏色)")
            else:
                # 如果沒有 variants，創建一個
                variant = {
                    'id': cat_id.replace('-', '_'),
                    'name': cat_name,
                    'nameEn': item['category']['nameEn'],
                    'imageUrls': WIKI_IMAGE_URLS[cat_id]
                }
                item['variants'] = [variant]
                updated_count += 1
                print(f"  ✅ 新增 {cat_id}: {cat_name} ({len(WIKI_IMAGE_URLS[cat_id])} 種顏色)")
    
    if updated_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ 成功更新了 {updated_count} 個分類的圖片 URLs")
    else:
        print(f"\n⚠️  沒有找到需要更新的分類")
    
    print("="*70)
    
    return updated_count

if __name__ == '__main__':
    count = update_image_urls()
    print(f"\n總共更新了 {count} 個分類")
    print("\n圖片來源: Pikmin Wiki (pikmin.wiki.gallery)")
    print("圖片尺寸: 150px thumbnails")
