// app/constants/regions.ts

export interface RegionGroup {
  label: string;
  options: string[];
}

export const FRIEND_REGIONS: RegionGroup[] = [
  {
    label: '北部地區',
    options: ['基隆市', '台北市', '新北市', '桃園市', '新竹縣', '新竹市', '宜蘭縣'],
  },
  {
    label: '中部地區',
    options: ['苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣'],
  },
  {
    label: '南部地區',
    options: ['嘉義縣', '嘉義市', '台南市', '高雄市', '屏東縣'],
  },
  {
    label: '東部及離島',
    options: ['花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'],
  },
  {
    label: '海外地區',
    options: ['日本', '韓國', '香港/澳門', '東南亞', '北美', '歐洲', '其他海外'],
  }
];

// Flat list for easy validation
export const ALL_REGION_OPTIONS = FRIEND_REGIONS.flatMap(group => group.options);
