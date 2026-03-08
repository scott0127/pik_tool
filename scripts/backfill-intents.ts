/**
 * 批量回填 friend_posts 目的標籤 (intents)
 * 
 * 規則：
 *   1. 留言含「菇」→ 加上 mushroom
 *   2. 留言含「明信片」或「信片」→ 加上 postcard
 *   3. 地區為海外 (非台灣) → 加上 overseas
 * 
 * 使用方式：
 *   npx tsx scripts/backfill-intents.ts             # DRY RUN (預覽)
 *   npx tsx scripts/backfill-intents.ts --commit     # 實際寫入
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 缺少環境變數');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const isCommit = process.argv.includes('--commit');

// 台灣地區列表
const TAIWAN_REGIONS = ['基隆/雙北', '桃竹苗', '中彰投', '雲嘉南', '高屏', '宜花東', '離島'];

// 所有 intent ID
const INTENT_IDS = ['mushroom', 'postcard', 'gift', 'walk', 'overseas'];

// 菇相關關鍵字
const MUSHROOM_KEYWORDS = ['菇', '蘑菇', 'mushroom'];
// 明信片相關關鍵字
const POSTCARD_KEYWORDS = ['明信片', '信片', '卡片', 'postcard'];

interface FriendPost {
  id: string;
  username: string;
  message: string | null;
  regions: string[] | null;
}

function detectIntents(post: FriendPost): string[] {
  const text = [post.username || '', post.message || ''].join(' ').toLowerCase();
  const newIntents: string[] = [];

  // 檢查菇
  if (MUSHROOM_KEYWORDS.some(kw => text.includes(kw))) {
    newIntents.push('mushroom');
  }

  // 檢查明信片
  if (POSTCARD_KEYWORDS.some(kw => text.includes(kw))) {
    newIntents.push('postcard');
  }

  // 檢查海外 (地區為非台灣)
  if (post.regions && post.regions.length > 0) {
    const hasOverseasRegion = post.regions.some(r => 
      !TAIWAN_REGIONS.includes(r) && !INTENT_IDS.includes(r)
    );
    if (hasOverseasRegion) {
      newIntents.push('overseas');
    }
  }

  return newIntents;
}

async function main() {
  console.log('');
  console.log('🔍 =============================================');
  console.log(`   批量回填 friend_posts 目的標籤 (intents)`);
  console.log(`   模式: ${isCommit ? '🚀 COMMIT' : '👀 DRY RUN'}`);
  console.log('   =============================================');
  console.log('');

  const { data: allPosts, error } = await supabase
    .from('friend_posts')
    .select('id, username, message, regions')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ 讀取失敗:', error.message);
    process.exit(1);
  }

  console.log(`📊 資料庫共有 ${allPosts?.length || 0} 筆貼文\n`);

  const updates: { post: FriendPost; addIntents: string[]; finalTags: string[] }[] = [];

  for (const post of (allPosts || []) as FriendPost[]) {
    const existingTags = post.regions || [];
    const existingIntents = existingTags.filter(t => INTENT_IDS.includes(t));
    const existingRegions = existingTags.filter(t => !INTENT_IDS.includes(t));

    const detectedIntents = detectIntents(post);

    // 只加入還沒有的 intent
    const newIntents = detectedIntents.filter(i => !existingIntents.includes(i));

    if (newIntents.length > 0) {
      const finalTags = [...existingRegions, ...existingIntents, ...newIntents];
      updates.push({ post, addIntents: newIntents, finalTags });
    }
  }

  if (updates.length === 0) {
    console.log('✅ 沒有需要更新的資料！');
    return;
  }

  // 統計
  const mushroomCount = updates.filter(u => u.addIntents.includes('mushroom')).length;
  const postcardCount = updates.filter(u => u.addIntents.includes('postcard')).length;
  const overseasCount = updates.filter(u => u.addIntents.includes('overseas')).length;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🍄 新增打菇標籤: ${mushroomCount} 筆`);
  console.log(`💌 新增明信片標籤: ${postcardCount} 筆`);
  console.log(`🌍 新增海外標籤: ${overseasCount} 筆`);
  console.log(`📝 總共需更新: ${updates.length} 筆`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 列出前 30 筆預覽
  const preview = updates.slice(0, 30);
  for (const { post, addIntents } of preview) {
    const msg = post.message ? `「${post.message.slice(0, 25)}${post.message.length > 25 ? '...' : ''}」` : '(無留言)';
    const tags = addIntents.map(i => {
      if (i === 'mushroom') return '🍄打菇';
      if (i === 'postcard') return '💌明信片';
      if (i === 'overseas') return '🌍海外';
      return i;
    }).join(', ');
    console.log(`  ${post.username.padEnd(15)} +[${tags}] │ ${msg}`);
  }
  if (updates.length > 30) {
    console.log(`  ... 還有 ${updates.length - 30} 筆`);
  }

  console.log('');

  if (isCommit) {
    console.log('🚀 開始寫入資料庫...\n');
    let ok = 0, fail = 0;

    for (const { post, finalTags } of updates) {
      const { error: err } = await supabase
        .from('friend_posts')
        .update({ regions: finalTags })
        .eq('id', post.id);

      if (err) {
        console.error(`  ❌ [${post.username}]: ${err.message}`);
        fail++;
      } else {
        ok++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 完成！成功: ${ok}  失敗: ${fail}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    console.log('💡 確認無誤請執行：');
    console.log('   npx tsx scripts/backfill-intents.ts --commit');
  }
}

main().catch(console.error);
