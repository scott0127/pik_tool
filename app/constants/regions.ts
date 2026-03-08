// app/constants/regions.ts

export interface RegionGroup {
  label: string;
  options: string[];
}

export const FRIEND_REGIONS: RegionGroup[] = [
  {
    label: '台灣 (Taiwan)',
    options: ['基隆/雙北', '桃竹苗', '中彰投', '雲嘉南', '高屏', '宜花東', '離島'],
  },
  {
    label: '亞洲 (Asia)',
    options: ['日本 (Japan)', '韓國 (South Korea)', '港澳 (HK/Macao)', '東南亞 (SEA)', '中國 (China)', '其他亞洲 (Other Asia)'],
  },
  {
    label: '美洲 (Americas)',
    options: ['美國 (USA)', '加拿大 (Canada)', '中南美洲 (Latin America)'],
  },
  {
    label: '歐洲 (Europe)',
    options: ['英國 (UK)', '西歐 (Western Europe)', '北歐 (Northern Europe)', '南歐 (Southern Europe)', '東歐 (Eastern Europe)'],
  },
  {
    label: '大洋洲 & 其他',
    options: ['澳洲 (Australia)', '紐西蘭 (New Zealand)', '非洲 (Africa)', '中東 (Middle East)', '其他 (Others)'],
  }
];

// Flat list for easy validation
export const ALL_REGION_OPTIONS = FRIEND_REGIONS.flatMap(group => group.options);
