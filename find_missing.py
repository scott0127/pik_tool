#!/usr/bin/env python3
import json

with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

regular = [item['category'] for item in data['definitions'] if item['category'].get('type') == 'regular']
map_rules = ['restaurant','cafe','sweetshop','bakery','burger','pizza','italian','ramen','sushi','curry','korean','mexican','convenience','supermarket','makeup','clothing','appliance','diy','bookstore','pharmacy','hair_salon','laundry','post_office','hotel','university','station','bus_stop','airport','bridge','park','forest','waterside','beach','mountain','zoo','theme_park','art_gallery','stadium','movie_theater','shrine']

mappings = {'convenience-store':'convenience','sweets':'sweetshop','hamburger':'burger','drugstore':'makeup','clothes-store':'clothing','hair-salon':'hair_salon','post-office':'post_office','art-studio':'art_gallery','movie-theater':'movie_theater'}

missing = []
for cat in regular:
    cid = cat['id']
    if cid not in map_rules and mappings.get(cid) not in map_rules:
        missing.append(cat)

print(f"缺少 {len(missing)} 個分類:\n")
for cat in missing:
    print(f"  {cat['id']:25s} - {cat['name']:15s} ({cat.get('nameEn','')})")
