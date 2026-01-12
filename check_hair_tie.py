import json

# Load decor.json
with open(r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find clothes-store
for idx, item in enumerate(data['definitions']):
    if item['category']['id'] == 'clothes-store':
        print(f"Found clothes-store at index {idx}")
        print(f"Category: {item['category']['name']}")
        print(f"Variants:")
        for v in item['variants']:
            print(f"  - {v['id']}: {v.get('name', 'NO NAME')}")
            if 'imageUrls' in v:
                print(f"    Has imageUrls: {list(v['imageUrls'].keys())}")
            elif 'imageUrl' in v:
                print(f"    Has single imageUrl: {v['imageUrl'][:60]}...")
            else:
                print(f"    NO IMAGE DATA")
        break
