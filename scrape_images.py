"""
Pikmin Wiki Image Scraper
Extracts decor Pikmin image URLs from Pikmin Wiki
"""

import json
import re
import urllib.request
from html.parser import HTMLParser
from urllib.parse import urljoin

class ImageExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = {}
        self.current_section = None
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        # Look for images with 'Decor' in src
        if tag == 'img':
            src = attrs_dict.get('src', '')
            if 'Decor_' in src or 'decor' in src.lower():
                # Extract image info
                self.images[src] = {
                    'src': src,
                    'alt': attrs_dict.get('alt', ''),
                }

def fetch_url(url):
    """Fetch URL content"""
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode('utf-8')

def extract_images_from_wiki():
    """Extract all decor images from Pikmin Wiki"""
    
    urls = [
        'https://www.pikminwiki.com/Decor_Pikmin',
        'https://www.pikminwiki.com/Special_Decor_Pikmin',
    ]
    
    all_images = {}
    
    for url in urls:
        print(f"Fetching: {url}")
        try:
            html = fetch_url(url)
            
            # Use regex to find all image URLs
            # Pattern for wiki gallery images
            patterns = [
                r'src="(https://pikmin\.wiki\.gallery/images/[^"]+)"',
                r'src="(//pikmin\.wiki\.gallery/images/[^"]+)"',
                r'srcset="[^"]*?(https://pikmin\.wiki\.gallery/images/thumb/[^/]+/[^/]+/Decor_[^"]+\.png/\d+px-[^"]+\.png)',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, html, re.IGNORECASE)
                for match in matches:
                    if 'Decor_' in match:
                        # Normalize URL
                        img_url = match if match.startswith('http') else 'https:' + match
                        # Extract decor name
                        name_match = re.search(r'Decor_(\w+)_([^/]+?)(?:\.png|/)', img_url)
                        if name_match:
                            color = name_match.group(1)
                            decor_name = name_match.group(2).replace('_', ' ')
                            key = f"{color}_{decor_name}"
                            if key not in all_images:
                                all_images[key] = img_url
                                print(f"  Found: {key}")
            
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    
    return all_images

def update_decor_json(images):
    """Update decor.json with extracted image URLs"""
    
    json_path = 'c:/Users/scott/OneDrive/Desktop/pikmin/app/data/decor.json'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create a mapping of decor names to URLs
    url_map = {}
    for key, url in images.items():
        # Normalize the key for matching
        normalized = key.lower().replace(' ', '_').replace('-', '_')
        url_map[normalized] = url
    
    updated_count = 0
    
    for definition in data['definitions']:
        category_name = definition['category']['nameEn'].lower().replace(' ', '_')
        
        for variant in definition['variants']:
            variant_name = variant['nameEn'].lower().replace(' ', '_').replace('-', '_')
            
            # Try different color combinations
            for color in ['Red', 'Yellow', 'Blue', 'Purple', 'White', 'Rock', 'Winged']:
                search_keys = [
                    f"{color.lower()}_{variant_name}",
                    f"{color.lower()}_{category_name}",
                    f"{color.lower()}_{category_name}_{variant_name}",
                ]
                
                for search_key in search_keys:
                    if search_key in url_map:
                        variant['imageUrl'] = url_map[search_key]
                        updated_count += 1
                        print(f"Updated: {variant['nameEn']} -> {url_map[search_key][:60]}...")
                        break
                else:
                    continue
                break
    
    # Save updated JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\nUpdated {updated_count} image URLs")
    return updated_count

if __name__ == '__main__':
    print("=== Pikmin Wiki Image Scraper ===\n")
    
    # Extract images
    images = extract_images_from_wiki()
    print(f"\nFound {len(images)} unique decor images\n")
    
    # Save raw image URLs for reference
    with open('c:/Users/scott/OneDrive/Desktop/pikmin/scraped_images.json', 'w', encoding='utf-8') as f:
        json.dump(images, f, ensure_ascii=False, indent=2)
    print("Saved image URLs to scraped_images.json")
    
    # Update decor.json
    update_decor_json(images)
    
    print("\nDone!")
