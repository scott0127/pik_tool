/**
 * 批量回填 friend_posts 地區標籤
 * 
 * 功能：
 *   1. 讀取 Supabase `friend_posts` 中 regions IS NULL 的所有資料
 *   2. 用關鍵字映射表掃描 message + username 欄位，匹配標準化地區標籤
 *   3. DRY RUN 模式 (預設)：只列出建議，不寫入資料庫
 *   4. COMMIT 模式 (--commit)：批量 UPDATE 到資料庫
 * 
 * 使用方式：
 *   npx tsx scripts/backfill-regions.ts             # DRY RUN (預覽)
 *   npx tsx scripts/backfill-regions.ts --commit     # 實際寫入
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 載入 .env (ESM 相容)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_KEY，請確認 .env 檔案');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const isCommit = process.argv.includes('--commit');

// ============================================================
//  關鍵字 → 標準地區標籤 映射表
//  規則：每個 entry 的 keywords 會以「包含」方式做比對
//  優先順序：越上面的越優先（第一個匹配到就停止）
// ============================================================

interface MappingRule {
  keywords: string[];
  region: string;
}

const KEYWORD_MAP: MappingRule[] = [
  // ──── 台灣 ────
  { keywords: ['基隆', '台北', '新北', '北部', '雙北', '內湖', '信義', '大安', '中山', '板橋', '三重', '汐止', '淡水', '永和', '中和'],
    region: '基隆/雙北' },
  { keywords: ['桃園', '新竹', '苗栗', '竹北', '中壢', '竹科'],
    region: '桃竹苗' },
  { keywords: ['台中', '彰化', '南投', '豐原', '大里', '霧峰', '太平'],
    region: '中彰投' },
  { keywords: ['雲林', '嘉義', '台南', '斗六', '斗南', '虎尾', '永康', '安南', '善化'],
    region: '雲嘉南' },
  { keywords: ['高雄', '屏東', '高屏', '左營', '鳳山', '楠梓', '前鎮', '鼓山', '恆春', '墾丁', '潮州'],
    region: '高屏' },
  { keywords: ['宜蘭', '花蓮', '台東', '東部', '宜花東', '太魯閣', '池上'],
    region: '宜花東' },
  { keywords: ['離島', '金門', '馬祖', '澎湖', '蘭嶼', '綠島', '小琉球'],
    region: '離島' },

  // ──── 亞洲 ────
  { keywords: ['日本', '東京', '大阪', '京都', '北海道', '名古屋', '福岡', '沖繩', '橫濱', '神戶', 'japan', 'tokyo', 'osaka', 'jp'],
    region: '日本 (Japan)' },
  { keywords: ['韓國', '首爾', '釜山', '首爾', '仁川', 'korea', 'seoul', 'kr'],
    region: '韓國 (South Korea)' },
  { keywords: ['香港', '澳門', '港澳', 'hong kong', 'hk', 'macao', 'macau'],
    region: '港澳 (HK/Macao)' },
  { keywords: ['東南亞', '泰國', '曼谷', '越南', '新加坡', '馬來西亞', '印尼', '菲律賓', '柬埔寨', 'sea', 'thailand', 'vietnam', 'singapore', 'malaysia', 'indonesia', 'philippines'],
    region: '東南亞 (SEA)' },
  { keywords: ['中國', '大陸', '北京', '上海', '深圳', '廣州', '成都', '武漢', '杭州', 'china', 'cn'],
    region: '中國 (China)' },

  // ──── 美洲 ────
  { keywords: ['美國', '美東', '美西', '紐約', '洛杉磯', '舊金山', '芝加哥', '西雅圖', '加州', '德州', '佛州', '波士頓', '華盛頓', 'usa', 'us', 'america', 'united states', 'new york', 'california', 'texas', 'la', 'sf', 'nyc', 'seattle', 'chicago'],
    region: '美國 (USA)' },
  { keywords: ['加拿大', '多倫多', '溫哥華', '蒙特婁', 'canada', 'toronto', 'vancouver'],
    region: '加拿大 (Canada)' },
  { keywords: ['巴西', '墨西哥', '阿根廷', '智利', '哥倫比亞', '南美', '中南美', 'brazil', 'mexico', 'argentina', 'latin america'],
    region: '中南美洲 (Latin America)' },

  // ──── 歐洲 ────
  { keywords: ['英國', '倫敦', '曼徹斯特', '蘇格蘭', '威爾斯', 'uk', 'england', 'london', 'britain'],
    region: '英國 (UK)' },
  { keywords: ['法國', '德國', '荷蘭', '比利時', '瑞士', '奧地利', '巴黎', '柏林', '阿姆斯特丹', '西歐', 'france', 'germany', 'netherlands', 'belgium', 'switzerland', 'austria', 'paris', 'berlin', 'western europe'],
    region: '西歐 (Western Europe)' },
  { keywords: ['瑞典', '挪威', '丹麥', '芬蘭', '冰島', '北歐', 'sweden', 'norway', 'denmark', 'finland', 'nordic', 'northern europe'],
    region: '北歐 (Northern Europe)' },
  { keywords: ['義大利', '西班牙', '葡萄牙', '希臘', '南歐', '羅馬', '巴塞隆納', 'italy', 'spain', 'portugal', 'greece', 'rome', 'southern europe'],
    region: '南歐 (Southern Europe)' },
  { keywords: ['波蘭', '捷克', '匈牙利', '羅馬尼亞', '烏克蘭', '東歐', 'poland', 'czech', 'hungary', 'romania', 'eastern europe'],
    region: '東歐 (Eastern Europe)' },

  // ──── 大洋洲 & 其他 ────
  { keywords: ['澳洲', '雪梨', '墨爾本', '布里斯本', 'australia', 'sydney', 'melbourne', 'brisbane', 'au'],
    region: '澳洲 (Australia)' },
  { keywords: ['紐西蘭', '奧克蘭', 'new zealand', 'nz', 'auckland'],
    region: '紐西蘭 (New Zealand)' },
  { keywords: ['非洲', 'africa'],
    region: '非洲 (Africa)' },
  { keywords: ['中東', '阿聯', '杜拜', '沙烏地', '以色列', 'middle east', 'dubai', 'uae', 'saudi', 'israel'],
    region: '中東 (Middle East)' },

  // ──── 台灣的通稱 (放最後，優先度最低) ────
  { keywords: ['台灣', 'taiwan', 'tw'],
    region: '基隆/雙北' }, // 預設歸到雙北，因為台灣最大用戶群
];

// ============================================================
//  主程式
// ============================================================

interface FriendPost {
  id: string;
  username: string;
  message: string | null;
  regions: string[] | null;
  friend_code: string;
  created_at: string;
}

function matchRegion(post: FriendPost): string | null {
  // 把 username 和 message 合併成搜尋文本
  const searchText = [
    post.username || '',
    post.message || ''
  ].join(' ').toLowerCase();

  for (const rule of KEYWORD_MAP) {
    for (const kw of rule.keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        return rule.region;
      }
    }
  }
  return null;
}

async function main() {
  console.log('');
  console.log('🔍 =============================================');
  console.log(`   批量回填 friend_posts 地區標籤`);
  console.log(`   模式: ${isCommit ? '🚀 COMMIT (將寫入資料庫)' : '👀 DRY RUN (只預覽)'}`);
  console.log('   =============================================');
  console.log('');

  // 1. 撈出所有資料，client-side 過濾出沒有地區標籤的
  //    因為 Supabase 可能存 null 或空陣列 {}
  const { data: allPosts, error } = await supabase
    .from('friend_posts')
    .select('id, username, message, regions, friend_code, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ 讀取資料失敗:', error.message);
    process.exit(1);
  }

  // 過濾出「沒有地區標籤」的貼文 (null, 空陣列, 或只有 intent 標籤沒有地區)
  const INTENT_IDS = ['mushroom', 'postcard', 'gift', 'walk', 'overseas'];
  
  const posts = (allPosts || []).filter((p: any) => {
    if (!p.regions || p.regions.length === 0) return true;
    // 如果只有 intent 標籤 (沒有任何地區)，也算沒標註
    const hasRegionTag = p.regions.some((r: string) => !INTENT_IDS.includes(r));
    return !hasRegionTag;
  });

  if (!posts || posts.length === 0) {
    console.log('✅ 沒有需要回填的資料，所有貼文都已有地區標籤！');
    console.log(`   (資料庫共有 ${allPosts?.length || 0} 筆貼文)`);
    return;
  }

  console.log(`📊 找到 ${posts.length} 筆尚未標註地區的貼文\n`);

  // 2. 逐筆比對
  const matched: { post: FriendPost; region: string }[] = [];
  const unmatched: FriendPost[] = [];

  for (const post of posts as FriendPost[]) {
    const region = matchRegion(post);
    if (region) {
      matched.push({ post, region });
    } else {
      unmatched.push(post);
    }
  }

  // 3. 輸出結果
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 可自動標註: ${matched.length} 筆`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const { post, region } of matched) {
    const msg = post.message ? `「${post.message.slice(0, 30)}${post.message.length > 30 ? '...' : ''}」` : '(無留言)';
    console.log(`  🏷️  ${post.username.padEnd(15)} → ${region.padEnd(20)} │ ${msg}`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`❓ 無法自動判斷: ${unmatched.length} 筆 (需手動審查)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const post of unmatched) {
    const msg = post.message ? `「${post.message.slice(0, 40)}${post.message.length > 40 ? '...' : ''}」` : '(無留言)';
    console.log(`  ❔ ${post.username.padEnd(15)} │ code: ${post.friend_code} │ ${msg}`);
  }

  console.log('');

  // 4. 如果是 COMMIT 模式，批量寫入
  if (isCommit && matched.length > 0) {
    console.log('🚀 開始寫入資料庫...\n');

    let successCount = 0;
    let failCount = 0;

    for (const { post, region } of matched) {
      // 保留既有的 intent 標籤，只加上新的地區標籤
      const existingTags = (post.regions || []).filter((r: string) => INTENT_IDS.includes(r));
      const newTags = [...existingTags, region];
      
      const { error: updateError } = await supabase
        .from('friend_posts')
        .update({ regions: newTags })
        .eq('id', post.id);

      if (updateError) {
        console.error(`  ❌ 更新失敗 [${post.username}]: ${updateError.message}`);
        failCount++;
      } else {
        successCount++;
      }
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 完成！成功: ${successCount}  失敗: ${failCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else if (!isCommit && matched.length > 0) {
    console.log('💡 以上為預覽結果。確認無誤請執行：');
    console.log('   npx tsx scripts/backfill-regions.ts --commit');
    console.log('');
  }
}

main().catch(console.error);
