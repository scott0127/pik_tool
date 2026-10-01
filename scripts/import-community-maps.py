"""Import KML files downloaded using the public My Maps export UI.

Usage: python scripts/import-community-maps.py C:/Users/scott/Downloads
No network access; keeps attribution and community claims separate from verification.
"""
import collections
import hashlib
import html
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = {'k': 'http://www.opengis.net/kml/2.2'}
THREAD = 'https://www.threads.com/@liwanghong7/post/DXOldesEzz9'
SOURCES = [
    ('north', '北北基', '北北基皮克敏純點 非官方.kml', '皮過敏', '1WP20rJXLx3hCRGcTW3VYC3sgiFfzspQ'),
    ('tainan', '台南市', '台南皮克敏純點地圖（非官方）.kml', '皮過敏', '1amVJy0dH_bx5OKZLmK2BlCu5tL_m6VY'),
    ('kaohsiung', '高雄市', 'pikmin bloom皮克敏高雄純點（非官方）.kml', '超夢夢', '1fSVDMfwRDAdn-eMBsEtgivzC71o-Ojk'),
]
ALIASES = {
    'restaurant': ['餐廳', '廚師'], 'cafe': ['咖啡杯', '咖啡'],
    'sweetshop': ['甜點'], 'bakery': ['法國麵包', '麵包'], 'burger': ['漢堡'],
    'italian': ['義式餐廳', '披薩'], 'ramen': ['拉麵'], 'sushi': ['壽司'],
    'curry': ['咖哩'], 'korean': ['韓國泡菜', '泡菜'], 'taco': ['塔可餅'],
    'convenience': ['便利商店', '便利店'], 'supermarket': ['超市'],
    'cosmetics': ['化妝品'], 'clothing': ['服裝店', '服飾店'],
    'electronics': ['電池', '仙女燈'], 'hardware': ['工具', '五金行'],
    'library': ['圖書館', '迷你書'], 'stationery': ['文具', '鉛筆'],
    'pharmacy': ['牙刷', '藥局'], 'hair_salon': ['美容院', '剪刀'],
    'laundry': ['洗衣店'], 'post_office': ['郵局', '郵票'], 'hotel': ['飯店'],
    'university': ['大學', '學院'], 'station': ['電車'], 'bus_stop': ['公車'],
    'airport': ['飛機', '機場'], 'bridge': ['橋樑', '橋梁'],
    'park': ['幸運草', '公園'], 'forest': ['森林'], 'waterside': ['水邊'],
    'beach': ['海灘', '貝殼', '沙灘', '海岸'], 'mountain': ['山丘'],
    'zoo': ['動物園'], 'theme_park': ['主題樂園', '遊樂園'],
    'art_gallery': ['美術館', '畫框'], 'stadium': ['體育館'],
    'movie_theater': ['電影院'], 'roadside': ['路邊'],
}


def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value or ''))).strip()


def categories(text):
    # Longest match wins, so "義式餐廳" doesn't also become "餐廳".
    found = set()
    for term, category in sorted(((t, c) for c, ts in ALIASES.items() for t in ts), key=lambda x: -len(x[0])):
        if term in text:
            found.add(category)
            text = text.replace(term, '')
    return sorted(found)


def main():
    downloads = Path(sys.argv[1])
    dest = ROOT / 'app/data/community-spots.json'
    data = json.loads(dest.read_text(encoding='utf-8'))
    # Re-running replaces only this importer’s records, preserving earlier research.
    data['spots'] = [s for s in data['spots'] if not s.get('sourceId', '').startswith('threads-map-')]
    seen = {}
    sources, audit, skipped = [], [], []
    for key, region, filename, author, mid in SOURCES:
        path = downloads / filename
        raw = path.read_bytes()
        root = ET.fromstring(raw)
        source_id = 'threads-map-' + key
        url = 'https://www.google.com/maps/d/viewer?mid=' + mid
        title = root.findtext('k:Document/k:name', '', NS)
        sources.append({'id': source_id, 'title': title, 'author': author, 'url': url,
                        'discoveredVia': THREAD, 'reviewedAt': '2026-10-01'})
        imported = duplicates = 0
        placemarks = root.findall('.//k:Placemark', NS)
        for point in placemarks:
            label = plain(point.findtext('k:name', '', NS))
            detail = plain(point.findtext('k:description', '', NS))
            coord = point.findtext('k:Point/k:coordinates', '', NS).strip().split(',')
            prefix = re.split(r'[（(]', label)[0]
            mixed = bool(re.search(r'非純點|[2-9二三四五六七八九十]選[1-9一二三四五六七八九]|分之', label))
            ids = categories(label + ' ' + detail) if mixed else categories(prefix)
            if not ids or len(coord) < 2:
                skipped.append({'sourceId': source_id, 'label': label, 'reason': 'missing category or point coordinate'})
                continue
            lng, lat = map(float, coord[:2])
            if not (20 <= lat <= 27 and 118 <= lng <= 123):
                skipped.append({'sourceId': source_id, 'label': label, 'reason': 'outside Taiwan coordinate bounds'})
                continue
            mixed = mixed or len(ids) > 1
            status = 'mixed' if mixed else 'reported_pure' if '純點' in label else 'unverified'
            identity = (round(lat, 6), round(lng, 6), tuple(ids))
            if identity in seen:
                existing = seen[identity]
                # Conflicting duplicate claims remain unverified rather than being promoted.
                if existing['status'] != status:
                    existing['status'] = 'unverified'
                    existing['caution'] = '同座標的來源標註不一致，請查看原地圖並現場確認。'
                if url != existing['sourceUrl']:
                    existing.setdefault('corroboratingUrls', []).append(url)
                duplicates += 1
                continue
            digest = hashlib.sha256(f'{lat:.6f},{lng:.6f}:{",".join(ids)}'.encode()).hexdigest()[:14]
            date = re.search(r'(?<!\d)(0?[1-9]|1[0-2])\s+[ /]?\s*(0?[1-9]|[12]\d|3[01])(?!\d)', label)
            if not date:
                date = re.search(r'(?<!\d)(0[1-9]|1[0-2])([0-2]\d|3[01])(?!\d)', label)
            confirmation = f'{int(date[1]):02d}/{int(date[2]):02d}（年份未註明）' if date else ''
            name = re.sub(r'\s*\d.*$', '', prefix).strip() or label
            spot = {'id': f'community-map-{digest}', 'city': region,
                    'name': f'{name} · {lat:.5f}, {lng:.5f}', 'decorIds': ids,
                    'standingHint': detail or '依原地圖標記座標定位；實際掃描站位仍需在現場確認。',
                    'searchQuery': f'{lat:.7f},{lng:.7f}', 'lat': lat, 'lng': lng,
                    'sourceUrl': url, 'sourceDate': '', 'confirmationDate': confirmation,
                    'status': status, 'caution': label, 'evidence': 'community-map',
                    'sourceId': source_id, 'sourceLabel': label}
            seen[identity] = spot
            data['spots'].append(spot)
            imported += 1
        audit.append({'sourceId': source_id, 'filename': filename, 'sha256': hashlib.sha256(raw).hexdigest(),
                      'rawPoints': len(placemarks), 'imported': imported, 'duplicates': duplicates})
    data.update(schemaVersion=2, sourceReviewedAt='2026-10-01', sources=sources,
                verification='Public Threads-linked My Maps KML exports reviewed. Community claims are not in-game field verification; coordinates may have 5–10m error. MM/DD confirmation dates have unspecified years.')
    dest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    report = {'reviewedAt': '2026-10-01', 'discoveredVia': THREAD, 'sources': audit, 'skipped': skipped,
              'totalRecords': len(data['spots']), 'statusCounts': dict(collections.Counter(s['status'] for s in data['spots']))}
    (ROOT / 'docs/community-map-import-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
