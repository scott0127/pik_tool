/**
 * useFriendPostHelpers 單元測試
 * 純函式、不依賴 Nuxt，可直接 import 正式程式碼。
 */
import { describe, it, expect } from 'vitest';
import { useFriendPostHelpers } from '~/composables/useFriendPostHelpers';
import { ALL_INTENT_OPTIONS, FRIEND_INTENTS } from '~/constants/intents';
import { ALL_REGION_OPTIONS, FRIEND_REGIONS } from '~/constants/regions';
import scrapedImages from '~/data/scraped_images.json';

const {
  getPikminAvatar,
  formatFriendCodeValue,
  formatDisplayCode,
  getPostRegions,
  getPostIntents,
  getIntentIcon,
  getIntentLabel,
  getIntentColor,
  getOptionsForCategory,
} = useFriendPostHelpers();

describe('formatFriendCodeValue', () => {
  it('應該把 12 位數字切成 3 組、以空格分隔', () => {
    expect(formatFriendCodeValue('123456789012')).toBe('1234 5678 9012');
  });

  it('應該忽略所有非數字字元', () => {
    expect(formatFriendCodeValue('1234-5678-9012')).toBe('1234 5678 9012');
    expect(formatFriendCodeValue('1234 5678 9012')).toBe('1234 5678 9012');
    expect(formatFriendCodeValue('SW-1234-5678-9012')).toBe('1234 5678 9012');
  });

  it('應該截斷超過 12 位的輸入', () => {
    expect(formatFriendCodeValue('1234567890123456')).toBe('1234 5678 9012');
  });

  it('未滿 12 位時應該保留部分分組（輸入中）', () => {
    expect(formatFriendCodeValue('1234')).toBe('1234');
    expect(formatFriendCodeValue('12345')).toBe('1234 5');
    expect(formatFriendCodeValue('12345678')).toBe('1234 5678');
  });

  it('空字串或純文字應該回傳空字串', () => {
    expect(formatFriendCodeValue('')).toBe('');
    expect(formatFriendCodeValue('abc')).toBe('');
  });

  it('formatDisplayCode 應該與 formatFriendCodeValue 是同一個實作', () => {
    // friends.vue 兩者都有用到，分家了這裡會提醒
    expect(formatDisplayCode).toBe(formatFriendCodeValue);
  });

  it('格式化後的結果再餵回去應該保持穩定（idempotent）', () => {
    const once = formatFriendCodeValue('123456789012');
    expect(formatFriendCodeValue(once)).toBe(once);
  });
});

describe('getPikminAvatar', () => {
  const avatarPool = Object.values(scrapedImages) as string[];

  it('同一個使用者名稱應該永遠得到同一張頭像', () => {
    expect(getPikminAvatar('alwyn')).toBe(getPikminAvatar('alwyn'));
  });

  it('回傳的網址應該來自 scraped_images 清單', () => {
    expect(avatarPool).toContain(getPikminAvatar('alwyn'));
    expect(avatarPool).toContain(getPikminAvatar('另一個玩家'));
  });

  it('不同名稱應該分散到不同頭像（不是全部都回同一張）', () => {
    const names = Array.from({ length: 40 }, (_, i) => `player-${i}`);
    const distinct = new Set(names.map(getPikminAvatar));
    expect(distinct.size).toBeGreaterThan(1);
  });

  it('空字串名稱也不應該爆掉', () => {
    expect(avatarPool).toContain(getPikminAvatar(''));
  });

  it('非 ASCII 名稱也應該落在合法索引內', () => {
    expect(avatarPool).toContain(getPikminAvatar('皮克敏大師🌱'));
  });
});

describe('getPostRegions', () => {
  it('tags 為 null 時應該回傳空陣列', () => {
    expect(getPostRegions(null)).toEqual([]);
  });

  it('應該只保留合法的地區選項', () => {
    const validRegion = ALL_REGION_OPTIONS[0]!;
    expect(getPostRegions([validRegion, 'not-a-region', 'gift'])).toEqual([validRegion]);
  });

  it('應該過濾掉目的標籤（intent 不是地區）', () => {
    expect(getPostRegions(['gift', 'walk'])).toEqual([]);
  });

  it('應該保留多個地區並維持原始順序', () => {
    const [first, second] = ALL_REGION_OPTIONS;
    expect(getPostRegions([second!, 'junk', first!])).toEqual([second, first]);
  });
});

describe('getPostIntents', () => {
  it('tags 為 null 時應該回傳空陣列', () => {
    expect(getPostIntents(null)).toEqual([]);
  });

  it('應該保留合法的 intent id', () => {
    expect(getPostIntents(['gift', 'walk'])).toEqual(['gift', 'walk']);
  });

  it('應該過濾掉未知標籤與地區標籤', () => {
    const region = ALL_REGION_OPTIONS[0]!;
    expect(getPostIntents(['gift', region, 'totally-unknown'])).toEqual(['gift']);
  });

  it('應該保留 legacy 標籤 mushroom / postcard', () => {
    expect(getPostIntents(['mushroom'])).toEqual(['mushroom']);
    expect(getPostIntents(['postcard'])).toEqual(['postcard']);
  });

  it('應該保留動態的 postcard:xxx 標籤', () => {
    expect(getPostIntents(['postcard:櫻花'])).toEqual(['postcard:櫻花']);
  });

  it('同時有 postcard 與 postcard:xxx 時，應該只留下具體的那個', () => {
    // submitPost 會同時寫入兩者，顯示時不該重複
    expect(getPostIntents(['postcard', 'postcard:櫻花'])).toEqual(['postcard:櫻花']);
  });

  it('只有 postcard 沒有動態標籤時，應該保留 postcard', () => {
    expect(getPostIntents(['gift', 'postcard'])).toEqual(['gift', 'postcard']);
  });
});

describe('getIntentIcon', () => {
  it('legacy mushroom 應該回傳 🍄', () => {
    expect(getIntentIcon('mushroom')).toBe('🍄');
  });

  it('postcard 與 postcard:xxx 都應該回傳 💌', () => {
    expect(getIntentIcon('postcard')).toBe('💌');
    expect(getIntentIcon('postcard:櫻花')).toBe('💌');
  });

  it('已知 intent 應該回傳常數表裡的 icon', () => {
    FRIEND_INTENTS.filter(intent => !intent.id.startsWith('postcard')).forEach(intent => {
      expect(getIntentIcon(intent.id)).toBe(intent.icon);
    });
  });

  it('未知 id 應該回傳空字串而不是 undefined', () => {
    expect(getIntentIcon('nope')).toBe('');
  });
});

describe('getIntentLabel', () => {
  it('legacy 標籤應該有對應的中文', () => {
    expect(getIntentLabel('mushroom')).toBe('打蘑菇');
    expect(getIntentLabel('postcard')).toBe('交換明信片');
  });

  it('動態明信片標籤應該帶出使用者輸入的內容', () => {
    expect(getIntentLabel('postcard:櫻花')).toBe('想要 櫻花 明信片');
  });

  it('已知 intent 應該回傳常數表裡的 label', () => {
    FRIEND_INTENTS.filter(intent => intent.id !== 'postcard').forEach(intent => {
      expect(getIntentLabel(intent.id)).toBe(intent.label);
    });
  });

  it('未知 id 應該原樣回傳（不是空字串）', () => {
    expect(getIntentLabel('nope')).toBe('nope');
  });

  it('已知限制：輸入含冒號時只會取到第一段', () => {
    // split(':')[1] 只取第一段；要修的話改用 slice(indexOf(':') + 1)
    expect(getIntentLabel('postcard:A:B')).toBe('想要 A 明信片');
  });
});

describe('getIntentColor', () => {
  it('legacy mushroom 應該有紅色樣式', () => {
    expect(getIntentColor('mushroom')).toContain('red');
  });

  it('動態明信片標籤應該有藍色樣式', () => {
    expect(getIntentColor('postcard:櫻花')).toContain('blue');
  });

  it('已知 intent 應該回傳常數表裡的 colorClass', () => {
    FRIEND_INTENTS.filter(intent => intent.id !== 'mushroom').forEach(intent => {
      expect(getIntentColor(intent.id)).toBe(intent.colorClass);
    });
  });

  it('未知 id 應該回退到灰色樣式', () => {
    expect(getIntentColor('nope')).toBe('bg-gray-100 text-gray-800 border-gray-200');
  });
});

describe('getOptionsForCategory', () => {
  it('已知分類應該回傳該分類的所有選項', () => {
    const group = FRIEND_REGIONS[0]!;
    expect(getOptionsForCategory(group.label)).toEqual(group.options);
  });

  it('未知分類應該回傳空陣列而不是 undefined', () => {
    expect(getOptionsForCategory('火星')).toEqual([]);
  });

  it('每個分類的選項都應該是 ALL_REGION_OPTIONS 的子集合', () => {
    FRIEND_REGIONS.forEach(group => {
      getOptionsForCategory(group.label).forEach(option => {
        expect(ALL_REGION_OPTIONS).toContain(option);
      });
    });
  });
});

describe('常數表本身的完整性', () => {
  it('intent id 不應重複', () => {
    expect(new Set(ALL_INTENT_OPTIONS).size).toBe(ALL_INTENT_OPTIONS.length);
  });

  it('地區選項不應重複（重複會讓 overlaps 篩選出現非預期結果）', () => {
    expect(new Set(ALL_REGION_OPTIONS).size).toBe(ALL_REGION_OPTIONS.length);
  });

  it('每個 intent 都應該有可顯示的 label 與 icon', () => {
    FRIEND_INTENTS.forEach(intent => {
      expect(intent.label.length).toBeGreaterThan(0);
      expect(intent.icon.length).toBeGreaterThan(0);
    });
  });
});
