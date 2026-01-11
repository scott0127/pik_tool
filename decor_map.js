// decorRules.ts
// 基於 Pikmin Bloom Wiki 標準規則 + 台灣 OSM 在地化優化

export interface DecorRule {
    id: string;
    name: string;
    icon: string;
    tags: string[]; // Overpass API 查詢用的 key=value
}

export const decorRules: DecorRule[] = [
    // ==========================================
    // 🔴 餐飲類 (Food & Drink)
    // ==========================================
    {
        id: 'restaurant',
        name: '餐廳 (一般)',
        icon: '🍽️',
        tags: [
            'amenity=restaurant',
            'amenity=food_court',
            'cuisine=steak_house',
            'cuisine=thai',
            'cuisine=vietnamese'
        ]
    },
    {
        id: 'cafe',
        name: '咖啡廳',
        icon: '☕',
        tags: [
            'amenity=cafe',
            'cuisine=coffee_shop' // 常見變體
        ]
    },
    {
        id: 'sweetshop',
        name: '甜點店',
        icon: '🍩',
        tags: [
            'shop=pastry',
            'shop=confectionery',
            'shop=chocolate',
            'shop=cake',
            'cuisine=ice_cream',
            'cuisine=donut',
            'shop=ice_cream'
        ]
    },
    {
        id: 'bakery',
        name: '麵包店',
        icon: '🥖',
        tags: [
            'shop=bakery',
            'product=bread'
        ]
    },
    {
        id: 'burger',
        name: '漢堡店',
        icon: '🍔',
        tags: [
            'cuisine=burger',
            'amenity=fast_food' // Wiki 規則：速食店通常歸類於此 (雖偶有例外)
        ]
    },
    {
        id: 'pizza',
        name: '披薩店',
        icon: '🍕',
        tags: [
            'cuisine=pizza'
        ]
    },
    {
        id: 'italian',
        name: '義式料理',
        icon: '🍝',
        tags: [
            'cuisine=italian',
            'cuisine=mediterranean', // Wiki 規則
            'cuisine=pasta'
        ]
    },
    {
        id: 'ramen',
        name: '拉麵/麵食',
        icon: '🍜',
        tags: [
            'cuisine=ramen',
            'cuisine=noodle', // Wiki 規則
            'cuisine=soba',   // Wiki 規則
            'cuisine=udon',   // Wiki 規則
            'cuisine=chinese' // Wiki 規則：中式料理在遊戲中常被歸類為麵食飾品
        ]
    },
    {
        id: 'sushi',
        name: '壽司店',
        icon: '🍣',
        tags: [
            'cuisine=sushi'
        ]
    },
    {
        id: 'curry',
        name: '咖哩店',
        icon: '🍛',
        tags: [
            'cuisine=curry',
            'cuisine=indian',      // Wiki 規則
            'cuisine=sri_lankan'   // Wiki 規則
        ]
    },
    {
        id: 'korean',
        name: '韓式料理',
        icon: '🥘',
        tags: [
            'cuisine=korean'
        ]
    },
    {
        id: 'mexican',
        name: '墨西哥料理',
        icon: '🌮',
        tags: [
            'cuisine=mexican'
        ]
    },

    // ==========================================
    // 🛍️ 購物類 (Shopping)
    // ==========================================
    {
        id: 'convenience',
        name: '便利商店',
        icon: '🏪',
        tags: [
            'shop=convenience'
        ]
    },
    {
        id: 'supermarket',
        name: '超市',
        icon: '🍄',
        tags: [
            'shop=supermarket',
            'shop=greengrocer' // 台灣常見：蔬果行
        ]
    },
    {
        id: 'makeup',
        name: '美妝/百貨',
        icon: '💄',
        tags: [
            'shop=department_store', // Wiki 規則：百貨公司歸類於美妝
            'shop=cosmetics',
            'shop=beauty' // 有時也會算入
        ]
    },
    {
        id: 'clothing',
        name: '服飾店',
        icon: '👕',
        tags: [
            'shop=clothes',
            'shop=shoes', // Wiki 規則
            'shop=fashion',
            'shop=boutique'
        ]
    },
    {
        id: 'appliance',
        name: '電器行',
        icon: '🔋',
        tags: [
            'shop=appliance',     // Wiki 規則
            'shop=electronics',   // Wiki 規則
            'shop=computer',      // Wiki 規則
            'shop=mobile_phone'   // 台灣常見：通訊行
        ]
    },
    {
        id: 'diy',
        name: 'DIY/五金行',
        icon: '🛠️',
        tags: [
            'shop=doityourself',
            'shop=hardware',
            'shop=tools' // 補充
        ]
    },
    {
        id: 'bookstore',
        name: '書店/圖書館',
        icon: '📖',
        tags: [
            'shop=books',
            'amenity=library'
        ]
    },

    // ==========================================
    // 💈 生活服務類 (Service)
    // ==========================================
    {
        id: 'pharmacy',
        name: '藥局',
        icon: '🦷',
        tags: [
            'amenity=pharmacy',
            'shop=chemist',
            'healthcare=pharmacy'
        ]
    },
    {
        id: 'hair_salon',
        name: '理髮廳',
        icon: '✂️',
        tags: [
            'shop=hairdresser'
        ]
    },
    {
        id: 'laundry',
        name: '洗衣店',
        icon: '🧺',
        tags: [
            'shop=laundry',
            'shop=dry_cleaning'
        ]
    },
    {
        id: 'post_office',
        name: '郵局',
        icon: '📮',
        tags: [
            'amenity=post_office',
            'amenity=post_box' // ⚠️ 重要：台灣路邊郵筒是重要來源
        ]
    },
    {
        id: 'hotel',
        name: '飯店',
        icon: '🏨',
        tags: [
            'tourism=hotel',
            'tourism=motel',
            'tourism=hostel',
            'tourism=guest_house'
        ]
    },
    {
        id: 'university',
        name: '大學',
        icon: '🎓',
        tags: [
            'amenity=university',
            'amenity=college'
        ]
    },

    // ==========================================
    // 🚆 交通類 (Transport)
    // ==========================================
    {
        id: 'station',
        name: '車站',
        icon: '🎫',
        tags: [
            'railway=station',
            'building=train_station', // Wiki 規則
            'railway=subway_entrance', // ⚠️ 重要：台灣捷運出口
            'public_transport=station'
        ]
    },
    {
        id: 'bus_stop',
        name: '公車站',
        icon: '🚌',
        tags: [
            'highway=bus_stop',
            'amenity=bus_station',
            'public_transport=platform'
        ]
    },
    {
        id: 'airport',
        name: '機場',
        icon: '✈️',
        tags: [
            'aeroway=aerodrome',
            'aeroway=terminal',
            'aeroway=gate'
        ]
    },
    {
        id: 'bridge',
        name: '橋樑',
        icon: '🌉',
        tags: [
            'bridge=yes',
            'man_made=bridge'
        ]
    },

    // ==========================================
    // 🌳 戶外與休閒 (Nature & Leisure)
    // ==========================================
    {
        id: 'park',
        name: '公園',
        icon: '🍀',
        tags: [
            'leisure=park',
            'leisure=garden', // 常見補充
            'leisure=playground',
            'landuse=village_green'
        ]
    },
    {
        id: 'forest',
        name: '森林',
        icon: '🐞',
        tags: [
            'natural=wood',
            'landuse=forest'
        ]
    },
    {
        id: 'waterside',
        name: '水邊',
        icon: '🎣',
        tags: [
            'natural=water',
            'natural=wetland',
            'waterway=river',
            'waterway=stream',
            'waterway=canal',
            'waterway=drain' // 台灣市區大排
        ]
    },
    {
        id: 'beach',
        name: '海灘',
        icon: '🐚',
        tags: [
            'natural=beach'
        ]
    },
    {
        id: 'mountain',
        name: '山岳',
        icon: '⛰️',
        tags: [
            'natural=peak',
            'natural=cliff',
            'natural=bare_rock'
        ]
    },
    {
        id: 'zoo',
        name: '動物園',
        icon: '🦁',
        tags: [
            'tourism=zoo',
            'tourism=aquarium' // 台灣水族館 (Xpark等) 通常算此類
        ]
    },
    {
        id: 'theme_park',
        name: '遊樂園',
        icon: '🎡',
        tags: [
            'tourism=theme_park',
            'leisure=water_park'
        ]
    },
    {
        id: 'art_gallery',
        name: '美術館',
        icon: '🖼️',
        tags: [
            'tourism=museum',
            'tourism=art_gallery',
            'shop=art', // Wiki 規則
            'amenity=arts_centre'
        ]
    },
    {
        id: 'stadium',
        name: '體育場',
        icon: '⚽',
        tags: [
            'leisure=stadium',
            'leisure=sports_centre',
            'building=stadium'
        ]
    },
    {
        id: 'shrine',
        name: '神社/寺廟 (日本限定)',
        icon: '⛩️',
        tags: [
            'amenity=place_of_worship'
            // ⚠️ 備註：在台灣，這個標籤通常不會生成「神社」飾品，而是大花或無飾品。
            // 但為了符合你的 Wiki 清單完整性，我將其保留。
        ]
    }
];