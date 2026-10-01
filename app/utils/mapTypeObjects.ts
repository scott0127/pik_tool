export type MapTypeObjectFamily = 'courier' | 'cafe' | 'orbit' | 'pocket' | 'book' | 'garden';

export interface MapTypeObject {
  family: MapTypeObjectFamily;
  image: string;
  accent: string;
  motif?: string;
  label: string;
  description: string;
}

// Accent colours belong to the small paper objects. Selected buttons keep the header green.
const mapTypeObjects: Record<string, Omit<MapTypeObject, 'image'>> = {
  restaurant: { family: 'courier', accent: '#C39A63', motif: 'serve', label: '餐廳', description: '皮克敏把餐盤送到邊框，放好後離開。' },
  cafe: { family: 'cafe', accent: '#B48468', motif: 'steam', label: '咖啡廳', description: '托盤滑入，咖啡落在杯墊上，熱氣緩緩升起。' },
  sweetshop: { family: 'courier', accent: '#C29199', motif: 'serve', label: '甜點店', description: '皮克敏帶來一塊蛋糕，輕放在邊框上。' },
  bakery: { family: 'cafe', accent: '#C39A63', motif: 'bake', label: '麵包店', description: '烤盤滑入，剛出爐的可頌落定，暖氣輕散。' },
  burger: { family: 'courier', accent: '#C39A63', motif: 'serve', label: '漢堡店', description: '皮克敏捧著漢堡走來，留下漢堡再走出畫面。' },
  italian: { family: 'orbit', accent: '#C39A63', motif: 'serve', label: '義式餐廳', description: '披薩沿著按鈕邊框滑入，輕轉後停在角落。' },
  ramen: { family: 'cafe', accent: '#B48468', motif: 'steam', label: '拉麵店', description: '麵碗跟著托盤入席，落定後浮起細緻熱氣。' },
  sushi: { family: 'orbit', accent: '#C29199', motif: 'serve', label: '壽司店', description: '壽司沿邊框滑來，輕輕停在小餐墊上。' },
  curry: { family: 'cafe', accent: '#C39A63', motif: 'steam', label: '咖哩餐廳', description: '咖哩餐盤滑入邊框，落定後散出暖暖熱氣。' },
  korean: { family: 'cafe', accent: '#B48468', motif: 'steam', label: '韓式餐廳', description: '料理鍋隨托盤上桌，細緻熱氣為餐點添溫度。' },
  taco: { family: 'courier', accent: '#C39A63', motif: 'serve', label: '墨西哥餐廳', description: '皮克敏送來塔可，交接後把餐點留在邊框。' },
  convenience: { family: 'pocket', accent: '#97A681', motif: 'pack', label: '便利商店', description: '小紙袋張開，便利商店的小物從袋口探出。' },
  supermarket: { family: 'courier', accent: '#97A681', motif: 'pack', label: '超市', description: '皮克敏帶來採買的小物，放在邊框後離開。' },
  cosmetics: { family: 'orbit', accent: '#C29199', motif: 'sparkle', label: '化妝品商店', description: '小巧化妝品滑過邊框，旋正後留下一點光澤。' },
  clothing: { family: 'pocket', accent: '#8EADB2', motif: 'pack', label: '服飾店', description: '紙袋打開，摺好的衣物從袋口展露。' },
  electronics: { family: 'orbit', accent: '#8EADB2', motif: 'power', label: '電器行', description: '小電器沿邊框滑入，接著亮起使用中的提示。' },
  hardware: { family: 'orbit', accent: '#8EADB2', motif: 'tool', label: '五金行', description: '工具滑到邊框上，輕轉一下後定位。' },
  library: { family: 'book', accent: '#C39A63', motif: 'page', label: '圖書館／書店', description: '小書封面打開，內頁依序展開，書籤最後落定。' },
  stationery: { family: 'pocket', accent: '#C39A63', motif: 'write', label: '文具店', description: '紙袋展開，鉛筆從袋口探出，停在書寫位置。' },
  pharmacy: { family: 'pocket', accent: '#C29199', motif: 'care', label: '藥局', description: '小藥袋開口，藥品紙片露出並留在邊框。' },
  hair_salon: { family: 'orbit', accent: '#C29199', motif: 'snip', label: '美髮院', description: '美髮小物沿邊框入席，轉正後輕巧定位。' },
  laundry: { family: 'orbit', accent: '#8EADB2', motif: 'wash', label: '自主洗衣店&乾洗店', description: '洗衣小物滑入邊框，旋轉收束後穩穩停下。' },
  post_office: { family: 'pocket', accent: '#C29199', motif: 'mail', label: '郵局', description: '紙袋張開，一封信從袋口探出，留作這一站的紀念。' },
  hotel: { family: 'pocket', accent: '#C39A63', motif: 'stay', label: '飯店', description: '小口袋打開，房間鑰匙從袋口滑出。' },
  university: { family: 'book', accent: '#8EADB2', motif: 'study', label: '大學&學院', description: '紙頁如課本般展開，學院小物跟著露出。' },
  station: { family: 'orbit', accent: '#8EADB2', motif: 'ride', label: '車站', description: '迷你列車沿著邊框行進，在角落緩緩停靠。' },
  bus_stop: { family: 'orbit', accent: '#C39A63', motif: 'ride', label: '公車站', description: '小公車沿按鈕邊框開來，減速後停在站位。' },
  airport: { family: 'orbit', accent: '#8EADB2', motif: 'flight', label: '機場', description: '小飛機沿邊框掠過，微微傾斜後落在角落。' },
  bridge: { family: 'orbit', accent: '#97A681', motif: 'cross', label: '橋樑', description: '小橋紙片沿邊框滑入，水平展開後定在角落。' },
  park: { family: 'garden', accent: '#97A681', motif: 'grow', label: '公園', description: '種子落定，綠意逐層展開，四葉草長在邊框上。' },
  forest: { family: 'garden', accent: '#97A681', motif: 'grow', label: '森林', description: '小種子安穩落下，枝葉依序舒展。' },
  waterside: { family: 'garden', accent: '#8EADB2', motif: 'water', label: '水邊', description: '水邊小物落定，一圈柔和水波從底部展開。' },
  beach: { family: 'garden', accent: '#C39A63', motif: 'water', label: '海邊', description: '貝殼隨小浪露出，細緻水波退到邊框上。' },
  mountain: { family: 'garden', accent: '#97A681', motif: 'mountain', label: '山丘', description: '山丘紙片逐層升起，前後層次落在邊框上。' },
  zoo: { family: 'courier', accent: '#C39A63', motif: 'discover', label: '動物園', description: '皮克敏送來動物園的小紀念，放好後離開。' },
  theme_park: { family: 'orbit', accent: '#C29199', motif: 'ride', label: '主題樂園', description: '樂園小物沿邊框轉入，輕旋後停在角落。' },
  art_gallery: { family: 'book', accent: '#C29199', motif: 'page', label: '美術館', description: '紙頁展開如一冊展覽目錄，畫作最後露出。' },
  stadium: { family: 'orbit', accent: '#8EADB2', motif: 'play', label: '體育館', description: '球沿著邊框滾入，輕輕彈一下後停穩。' },
  movie_theater: { family: 'pocket', accent: '#C39A63', motif: 'watch', label: '電影院', description: '小紙袋打開，爆米花從袋口浮出。' },
  shrine: { family: 'orbit', accent: '#C29199', motif: 'charm', label: '神社', description: '小御守沿邊框滑入，輕擺後停穩。' },
  roadside: { family: 'pocket', accent: '#97A681', motif: 'discover', label: '路邊', description: '紙袋開口，小貼紙露出，留住偶遇的這一站。' },
  weather_rain: { family: 'garden', accent: '#8EADB2', motif: 'rain', label: '雨天', description: '小傘露出，雨滴依序落下，最後留下一圈漣漪。' },
  weather_snow: { family: 'garden', accent: '#8EADB2', motif: 'snow', label: '下雪', description: '雪花層層展開，細小雪片緩緩落在邊框。' },
};

export function getMapTypeObject(id: string): MapTypeObject {
  const objectId = Object.hasOwn(mapTypeObjects, id) ? id : 'roadside';
  const object = mapTypeObjects[objectId]!;
  return { ...object, image: `/images/map-objects/${objectId}.webp` };
}
