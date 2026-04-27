import type { DecorRule } from '~/types/map';

// 基於 Pikmin Bloom Wiki 標準規則 + 台灣 OSM 在地化優化
// 完整 42 個一般分類，OSM 標籤經 Wiki 驗證
export const decorRules: DecorRule[] = [
  // 餐飲類 (Food & Dining)
  { id: 'restaurant', name: '餐廳', icon: '🍽️', iconName: 'noto:fork-and-knife-with-plate', tags: ['amenity=restaurant'] },
  { id: 'cafe', name: '咖啡廳', icon: '☕', iconName: 'noto:hot-beverage', tags: ['amenity=cafe'] },
  { id: 'sweetshop', name: '甜點店', icon: '🍰', iconName: 'noto:shortcake', tags: ['shop=pastry', 'shop=confectionery', 'shop=chocolate'] },
  { id: 'bakery', name: '麵包店', icon: '🥐', iconName: 'noto:croissant', tags: ['shop=bakery'] },
  { id: 'burger', name: '漢堡店', icon: '🍔', iconName: 'noto:hamburger', tags: ['amenity=fast_food', 'cuisine=burger'] },
  { id: 'italian', name: '義式餐廳', icon: '🍕', iconName: 'noto:pizza', tags: ['cuisine=pizza', 'cuisine=italian', 'cuisine=mediterranean', 'cuisine=pasta'] },
  { id: 'ramen', name: '拉麵店', icon: '🥡', iconName: 'noto:steaming-bowl', tags: ['cuisine=ramen', 'cuisine=noodle', 'cuisine=chinese', 'cuisine=udon', 'cuisine=soba'] },
  { id: 'sushi', name: '壽司店', icon: '🍣', iconName: 'noto:sushi', tags: ['cuisine=sushi'] },
  { id: 'curry', name: '咖哩餐廳', icon: '🍛', iconName: 'noto:curry-rice', tags: ['cuisine=curry', 'cuisine=indian', 'cuisine=sri_lankan'] },
  { id: 'korean', name: '韓式餐廳', icon: '🇰🇷', iconName: 'noto:pot-of-food', tags: ['cuisine=korean'] },
  { id: 'taco', name: '墨西哥餐廳', icon: '🌮', iconName: 'noto:taco', tags: ['cuisine=mexican'] },
  
  // 購物類 (Shopping)
  { id: 'convenience', name: '便利商店', icon: '🏪', iconName: 'noto:convenience-store', tags: ['shop=convenience'] },
  { id: 'supermarket', name: '超市', icon: '🛒', iconName: 'noto:shopping-cart', tags: ['shop=supermarket', 'shop=greengrocer'] },
  { id: 'cosmetics', name: '化妝品商店', icon: '💄', iconName: 'noto:lipstick', tags: ['shop=department_store', 'shop=cosmetics', 'shop=beauty'] },
  { id: 'clothing', name: '服飾店', icon: '👔', iconName: 'noto:necktie', tags: ['shop=clothes', 'shop=shoes', 'shop=fashion'] },
  { id: 'electronics', name: '電器行', icon: '🔌', iconName: 'noto:electric-plug', tags: ['shop=appliance', 'shop=electronics', 'shop=computer', 'shop=mobile_phone'] },
  { id: 'hardware', name: '五金行', icon: '🔧', iconName: 'noto:wrench', tags: ['shop=doityourself', 'shop=hardware', 'shop=tools'] },
  { id: 'library', name: '圖書館／書店', icon: '📚', iconName: 'noto:books', tags: ['amenity=library', 'shop=books'] },
  
  // 生活服務類 (Services)
  { id: 'pharmacy', name: '藥局', icon: '💊', iconName: 'noto:pill', tags: ['amenity=pharmacy', 'shop=chemist', 'healthcare=pharmacy'] },
  { id: 'hair_salon', name: '美髮院', icon: '💇', iconName: 'noto:barber-pole', tags: ['shop=hairdresser'] },
  { id: 'laundry', name: '自主洗衣店&乾洗店', icon: '🧺', iconName: 'noto:basket', tags: ['shop=laundry', 'shop=dry_cleaning'] },
  { id: 'post_office', name: '郵局', icon: '✉️', iconName: 'noto:envelope', tags: ['amenity=post_office', 'amenity=post_box'] },
  { id: 'hotel', name: '飯店', icon: '🏨', iconName: 'noto:hotel', tags: ['tourism=hotel', 'tourism=motel', 'tourism=hostel', 'tourism=guest_house'] },
  { id: 'university', name: '大學&學院', icon: '🎓', iconName: 'noto:graduation-cap', tags: ['amenity=university', 'amenity=college', 'building=university'] },
  
  // 交通類 (Transportation)
  { id: 'station', name: '車站', icon: '🚂', iconName: 'noto:station', tags: ['railway=station', 'building=train_station', 'railway=subway_entrance', 'public_transport=station'] },
  { id: 'bus_stop', name: '公車站', icon: '🚌', iconName: 'noto:bus', tags: ['highway=bus_stop', 'amenity=bus_station', 'public_transport=platform'] },
  { id: 'airport', name: '機場', icon: '✈️', iconName: 'noto:airplane', tags: ['aeroway=aerodrome', 'aeroway=terminal', 'aeroway=gate'] },
  { id: 'bridge', name: '橋樑', icon: '🌉', iconName: 'noto:bridge-at-night', tags: ['bridge=yes', 'man_made=bridge'] },
  
  // 戶外與休閒 (Outdoor & Leisure)
  { id: 'park', name: '公園', icon: '🍀', iconName: 'noto:four-leaf-clover', tags: ['leisure=park', 'leisure=garden', 'leisure=playground', 'landuse=village_green'] },
  { id: 'forest', name: '森林', icon: '🌲', iconName: 'noto:evergreen-tree', tags: ['natural=wood', 'landuse=forest'] },
  { id: 'waterside', name: '水邊', icon: '🌊', iconName: 'noto:water-wave', tags: ['natural=water', 'natural=wetland', 'waterway=river', 'waterway=stream', 'waterway=canal'] },
  { id: 'beach', name: '海邊', icon: '🏖️', iconName: 'noto:beach-with-umbrella', tags: ['natural=beach'] },
  { id: 'mountain', name: '山丘', icon: '⛰️', iconName: 'noto:mountain', tags: ['natural=peak', 'natural=cliff', 'natural=bare_rock'] },
  { id: 'zoo', name: '動物園', icon: '🦁', iconName: 'noto:lion', tags: ['tourism=zoo', 'tourism=aquarium'] },
  { id: 'theme_park', name: '主題樂園', icon: '🎢', iconName: 'noto:roller-coaster', tags: ['tourism=theme_park', 'leisure=water_park'] },
  { id: 'art_gallery', name: '美術館', icon: '🎨', iconName: 'noto:artist-palette', tags: ['tourism=museum', 'tourism=gallery', 'shop=art', 'amenity=arts_centre'] },
  { id: 'stadium', name: '體育館', icon: '🏟️', iconName: 'noto:stadium', tags: ['leisure=stadium', 'leisure=sports_centre', 'building=stadium'] },
  { id: 'movie_theater', name: '電影院', icon: '🎬', iconName: 'noto:clapper-board', tags: ['amenity=cinema'] },
  { id: 'shrine', name: '神社', icon: '⛩️', iconName: 'noto:shinto-shrine', tags: ['amenity=place_of_worship'], region: 'JP' },
  
  // 特殊分類 (Special)
  { id: 'roadside', name: '路邊', icon: '🏷️', iconName: 'noto:label', tags: [] }, // Roadside 無特定 OSM 標籤
  { id: 'weather_rain', name: '雨天', icon: '🌧️', iconName: 'noto:cloud-with-rain', tags: [] }, // Weather 類不適用 OSM 標籤
  { id: 'weather_snow', name: '下雪', icon: '🌨️', iconName: 'noto:cloud-with-snow', tags: [] } // Weather 類不適用 OSM 標籤
];

export function useDecorRules() {
  return {
    decorRules,
    getDecorRule: (id: string) => decorRules.find(rule => rule.id === id),
    getAllCategories: () => decorRules,
  };
}
