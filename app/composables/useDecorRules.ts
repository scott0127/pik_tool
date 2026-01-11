import type { DecorRule } from '~/types/map';

// 基於 Pikmin Bloom Wiki 標準規則 + 台灣 OSM 在地化優化
export const decorRules: DecorRule[] = [
  // 餐飲類
  { id: 'restaurant', name: '餐廳 (一般)', icon: '🍽️', tags: ['amenity=restaurant', 'amenity=food_court', 'cuisine=steak_house', 'cuisine=thai', 'cuisine=vietnamese'] },
  { id: 'cafe', name: '咖啡廳', icon: '☕', tags: ['amenity=cafe', 'cuisine=coffee_shop'] },
  { id: 'sweetshop', name: '甜點店', icon: '🍩', tags: ['shop=pastry', 'shop=confectionery', 'shop=chocolate', 'shop=cake', 'cuisine=ice_cream', 'cuisine=donut', 'shop=ice_cream'] },
  { id: 'bakery', name: '麵包店', icon: '🥖', tags: ['shop=bakery', 'product=bread'] },
  { id: 'burger', name: '漢堡店', icon: '🍔', tags: ['cuisine=burger', 'amenity=fast_food'] },
  { id: 'pizza', name: '披薩店', icon: '🍕', tags: ['cuisine=pizza'] },
  { id: 'italian', name: '義式料理', icon: '🍝', tags: ['cuisine=italian', 'cuisine=mediterranean', 'cuisine=pasta'] },
  { id: 'ramen', name: '拉麵/麵食', icon: '🍜', tags: ['cuisine=ramen', 'cuisine=noodle', 'cuisine=soba', 'cuisine=udon', 'cuisine=chinese'] },
  { id: 'sushi', name: '壽司店', icon: '🍣', tags: ['cuisine=sushi'] },
  { id: 'curry', name: '咖哩店', icon: '🍛', tags: ['cuisine=curry', 'cuisine=indian', 'cuisine=sri_lankan'] },
  { id: 'korean', name: '韓式料理', icon: '🥘', tags: ['cuisine=korean'] },
  { id: 'mexican', name: '墨西哥料理', icon: '🌮', tags: ['cuisine=mexican'] },
  
  // 購物類
  { id: 'convenience', name: '便利商店', icon: '🏪', tags: ['shop=convenience'] },
  { id: 'supermarket', name: '超市', icon: '🍄', tags: ['shop=supermarket', 'shop=greengrocer'] },
  { id: 'makeup', name: '美妝/百貨', icon: '💄', tags: ['shop=department_store', 'shop=cosmetics', 'shop=beauty'] },
  { id: 'clothing', name: '服飾店', icon: '👕', tags: ['shop=clothes', 'shop=shoes', 'shop=fashion', 'shop=boutique'] },
  { id: 'appliance', name: '電器行', icon: '🔋', tags: ['shop=appliance', 'shop=electronics', 'shop=computer', 'shop=mobile_phone'] },
  { id: 'diy', name: 'DIY/五金行', icon: '🛠️', tags: ['shop=doityourself', 'shop=hardware', 'shop=tools'] },
  { id: 'bookstore', name: '書店/圖書館', icon: '📖', tags: ['shop=books', 'amenity=library'] },
  
  // 生活服務類
  { id: 'pharmacy', name: '藥局', icon: '🦷', tags: ['amenity=pharmacy', 'shop=chemist', 'healthcare=pharmacy'] },
  { id: 'hair_salon', name: '理髮廳', icon: '✂️', tags: ['shop=hairdresser'] },
  { id: 'laundry', name: '洗衣店', icon: '🧺', tags: ['shop=laundry', 'shop=dry_cleaning'] },
  { id: 'post_office', name: '郵局', icon: '📮', tags: ['amenity=post_office', 'amenity=post_box'] },
  { id: 'hotel', name: '飯店', icon: '🏨', tags: ['tourism=hotel', 'tourism=motel', 'tourism=hostel', 'tourism=guest_house'] },
  { id: 'university', name: '大學', icon: '🎓', tags: ['amenity=university', 'amenity=college'] },
  
  // 交通類
  { id: 'station', name: '車站', icon: '🎫', tags: ['railway=station', 'building=train_station', 'railway=subway_entrance', 'public_transport=station'] },
  { id: 'bus_stop', name: '公車站', icon: '🚌', tags: ['highway=bus_stop', 'amenity=bus_station', 'public_transport=platform'] },
  { id: 'airport', name: '機場', icon: '✈️', tags: ['aeroway=aerodrome', 'aeroway=terminal', 'aeroway=gate'] },
  { id: 'bridge', name: '橋樑', icon: '🌉', tags: ['bridge=yes', 'man_made=bridge'] },
  
  // 戶外與休閒
  { id: 'park', name: '公園', icon: '🍀', tags: ['leisure=park', 'leisure=garden', 'leisure=playground', 'landuse=village_green'] },
  { id: 'forest', name: '森林', icon: '🐞', tags: ['natural=wood', 'landuse=forest'] },
  { id: 'waterside', name: '水邊', icon: '🎣', tags: ['natural=water', 'natural=wetland', 'waterway=river', 'waterway=stream', 'waterway=canal', 'waterway=drain'] },
  { id: 'beach', name: '海灘', icon: '🐚', tags: ['natural=beach'] },
  { id: 'mountain', name: '山岳', icon: '⛰️', tags: ['natural=peak', 'natural=cliff', 'natural=bare_rock'] },
  { id: 'zoo', name: '動物園', icon: '🦁', tags: ['tourism=zoo', 'tourism=aquarium'] },
  { id: 'theme_park', name: '遊樂園', icon: '🎡', tags: ['tourism=theme_park', 'leisure=water_park'] },
  { id: 'art_gallery', name: '美術館', icon: '🖼️', tags: ['tourism=museum', 'tourism=art_gallery', 'shop=art', 'amenity=arts_centre'] },
  { id: 'stadium', name: '體育場', icon: '⚽', tags: ['leisure=stadium', 'leisure=sports_centre', 'building=stadium'] },
  { id: 'movie_theater', name: '電影院', icon: '🎬', tags: ['amenity=cinema'] },
  { id: 'shrine', name: '神社/寺廟', icon: '⛩️', tags: ['amenity=place_of_worship'] }
];

export function useDecorRules() {
  return {
    decorRules,
    getDecorRule: (id: string) => decorRules.find(rule => rule.id === id),
    getAllCategories: () => decorRules,
  };
}
