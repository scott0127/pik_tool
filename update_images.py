"""
Fix image URLs - use original scraped URLs without size modification
"""
import json

# Load scraped images
with open('c:/Users/scott/OneDrive/Desktop/pikmin/scraped_images.json', 'r', encoding='utf-8') as f:
    scraped = json.load(f)

# Load current decor.json
json_path = 'c:/Users/scott/OneDrive/Desktop/pikmin/app/data/decor.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Create lookup by normalizing keys - keep multiple formats
url_map = {}
for key, url in scraped.items():
    # Multiple normalization strategies
    normalized = key.lower().replace(' ', '_').replace('-', '_').replace("'", '').replace('%27', '').replace('%28', '').replace('%29', '')
    url_map[normalized] = url

print(f"Loaded {len(url_map)} URL mappings")

# Pikmin colors
pikmin_colors = ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged']

# Mapping of variant English names to wiki image names
variant_name_map = {
    'chef hat': 'chef_hat',
    'coffee cup': 'coffee_cup',
    'macaron': 'macaron',
    'donut': 'donut',
    'popcorn': 'popcorn_snack',
    'toothbrush': 'toothbrush',
    'dandelion': 'dandelion',
    'stag beetle': 'stag_beetle',
    'acorn': 'acorn',
    'fishing lure': 'fishing_lure',
    'stamp': 'stamp',
    'picture frame': 'picture_frame',
    'paper airplane': 'toy_airplane',
    'ticket': 'ticket',
    'shell': 'shell',
    'burger': 'burger',
    'bottle cap': 'bottle_cap',
    'snack': 'snack',
    'banana': 'banana',
    'mushroom': 'mushroom',
    'baguette': 'baguette',
    'scissors': 'scissors',
    'hair tie': 'hair_tie',
    'clover': 'clover',
    'four-leaf clover': 'four_leaf_clover',
    'picture book': 'tiny_book',
    'coin': 'coin',
    'sushi': 'sushi',
    'mountain badge': 'mountain_pin_badge',
    'helmet': 'ball_keychain',
    'amusement ride': 'theme_park_ticket',
    'bus ticket': 'bus_papercraft',
    'pizza slice': 'pizza',
    'gyoza': 'curry_bowl',
    'ramen': 'ramen_keychain',
    'suspension bridge': 'bridge_pin_badge',
    'amenity': 'hotel_amenities',
    'lipstick': 'makeup',
    'fortune': 'fortune',
    'mini t-shirt': 'clover',
    'zoo badge': 'stag_beetle',
    'sticker': 'sticker',
    'easter egg': 'easter_egg',
    'playing card': 'playing_card',
    'mahjong tile': 'mahjong_tile',
    'sneaker keychain': 'sneaker_keychain',
    'fingerboard': 'fingerboard',
    'ice cream': 'ice_cream',
    'puzzle': 'puzzle',
    'cheese': 'cheese',
    'coral': 'coral',
    'paint': 'paint',
}

total_updated = 0

for definition in data['definitions']:
    for variant in definition['variants']:
        variant_name_original = variant['nameEn']
        variant_name = variant_name_original.lower().replace('-', ' ')
        mapped_name = variant_name_map.get(variant_name, variant_name.replace(' ', '_'))
        
        image_urls = {}
        
        for color in pikmin_colors:
            # Try different search patterns
            search_keys = [
                f"{color}_{mapped_name}",
                f"{color}_{variant_name.replace(' ', '_')}",
            ]
            
            found_url = None
            for search_key in search_keys:
                if search_key in url_map:
                    # Use original URL as-is (no size modification)
                    found_url = url_map[search_key]
                    break
            
            if found_url:
                image_urls[color] = found_url
                total_updated += 1
        
        if image_urls:
            variant['imageUrls'] = image_urls

# Save
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {total_updated} image URLs (using original sizes)")
