<template>
  <div class="forza-page min-h-screen bg-[#0f1117] text-slate-100">
    <section class="hero-band">
      <img
        src="/downloads/forza-music-overlay/logo.png"
        alt=""
        aria-hidden="true"
        class="hero-logo-watermark"
      >
      <div class="mx-auto grid min-h-[92vh] w-full max-w-7xl grid-cols-1 gap-10 px-5 py-8 md:grid-cols-[minmax(0,1fr)_430px] md:px-8 lg:px-10">
        <div class="flex flex-col justify-center">
          <div class="mb-5 flex flex-wrap items-center gap-3">
            <span class="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase text-cyan-200">
              Windows Utility
            </span>
            <span class="rounded-full border border-slate-500/30 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              v{{ release.version }}
            </span>
          </div>

          <h1 class="max-w-4xl text-4xl font-black leading-[1.04] text-white md:text-6xl">
            Forza 音樂懸浮播放器
          </h1>

          <p class="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            在玩 Forza 時顯示 YouTube Music、Spotify 或 Apple Music 正在播放的歌曲，並用快捷鍵、手把組合鍵控制播放、暫停、下一首、上一首與音量。
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              :href="release.downloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              <Icon name="lucide:external-link" class="h-5 w-5" />
              前往 Google Drive 下載
            </a>
            <a
              href="#updates"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Icon name="lucide:list-restart" class="h-5 w-5" />
              查看更新紀錄
            </a>
          </div>

          <dl class="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div v-for="item in releaseStats" :key="item.label" class="stat-cell">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>

          <div class="sponsor-card mt-6 max-w-2xl">
            <div class="min-w-0">
              <p class="eyebrow text-amber-200">Sponsor</p>
              <h2 class="mt-2 text-xl font-black text-white">支持 Forza Music 持續更新</h2>
              <p class="mt-2 text-sm leading-7 text-slate-300">
                這個工具是免費的。如果工具有幫到你，可以請還在讀碩士的我喝杯咖啡，支持後續修正與新功能。
              </p>
            </div>
            <div class="sponsor-actions">
              <img
                src="/downloads/forza-music-overlay/bmc_qr.png"
                alt="Buy Me a Coffee 贊助 QR Code"
                class="sponsor-qr"
              >
              <a
                :href="sponsorUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="sponsor-button"
              >
                贊助我
              </a>
            </div>
          </div>

          <p class="signature-mark mt-5">Scott Lin 2026</p>
        </div>

        <aside class="flex items-center md:justify-end">
          <div class="download-panel w-full">
            <div class="mb-5 flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-bold text-cyan-200">最新版</p>
                <h2 class="mt-2 text-2xl font-black text-white">v{{ release.version }}</h2>
              </div>
              <div class="rounded-lg bg-cyan-300 p-3 text-slate-950">
                <Icon name="lucide:music-4" class="h-6 w-6" />
              </div>
            </div>

            <div class="space-y-3 text-sm text-slate-300">
              <div class="release-meta-row border-b border-white/10 pb-3">
                <span>檔案</span>
                <span class="release-meta-value font-semibold text-white">{{ release.fileName }}</span>
              </div>
              <div class="release-meta-row border-b border-white/10 pb-3">
                <span>大小</span>
                <span class="release-meta-value font-semibold text-white">{{ release.size }}</span>
              </div>
              <div class="release-meta-row border-b border-white/10 pb-3">
                <span>授權</span>
                <span class="release-meta-value font-semibold text-white">MIT License</span>
              </div>
            </div>

            <div class="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
              <p class="mb-2 text-xs font-bold text-slate-400">下載</p>
              <a
                :href="release.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 break-all text-sm font-bold leading-6 text-cyan-200 hover:text-cyan-100"
              >
                <Icon name="lucide:external-link" class="h-4 w-4 shrink-0" />
                {{ release.fileName }}
              </a>
            </div>

            <div class="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <p class="mb-2 text-xs font-bold text-slate-400">更新快照</p>
              <p class="text-sm leading-6 text-slate-300">
                {{ release.snapshot }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="bg-[#151923] px-5 py-14 md:px-8 lg:px-10">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p class="eyebrow">Overview</p>
          <h2 class="section-title">這個工具做什麼</h2>
          <p class="mt-4 max-w-2xl leading-8 text-slate-300">
            程式透過 Windows 目前媒體工作階段讀取歌曲資訊。登入 YouTube Music、Spotify 或 Apple Music 都在官方服務中完成，工具本身不會要求、保存或讀取帳號密碼。
          </p>
        </div>

        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.title" class="feature-item">
            <Icon :name="feature.icon" class="h-6 w-6 text-cyan-200" />
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="install-section bg-[#f5f7fb] px-5 py-14 text-slate-950 md:px-8 lg:px-10">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <p class="eyebrow text-slate-500">Quick Guide</p>
          <h2 class="section-title text-slate-950">簡易操作教學</h2>
          <div class="install-ready-note mt-4">
            <Icon name="lucide:route" class="h-5 w-5" />
            <p>
              啟動後先選擇音樂服務，進入 Forza 後可用鍵盤或手把控制，不需要切出遊戲。
            </p>
          </div>
          <div class="usage-tutorial mt-4">
            <article
              v-for="(tip, index) in usageTips"
              :key="tip.title"
              class="usage-tip"
              :style="{ '--delay': `${index * 110}ms` }"
            >
              <div class="usage-icon">
                <Icon :name="tip.icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <p class="usage-kbd">{{ tip.keys }}</p>
                <h3>{{ tip.title }}</h3>
                <p>{{ tip.desc }}</p>
              </div>
            </article>
          </div>
        </div>

        <div>
          <p class="eyebrow text-slate-500">Install Flow</p>
          <h3 class="section-title text-slate-950">安裝流程圖像說明</h3>
          <div class="install-ready-note mt-4">
            <Icon name="lucide:route" class="h-5 w-5" />
            <p>
              解壓後可直接點 exe 使用；需要桌面與開始功能表捷徑時，再執行 Install-App.bat。
            </p>
          </div>
          <div class="install-visual mt-4" aria-label="Forza Music Overlay 安裝流程圖像說明">
            <article v-for="item in installFlow" :key="item.title" class="install-card">
              <div class="install-icon">
                <Icon :name="item.icon" class="h-7 w-7" />
              </div>
              <div>
                <p class="text-xs font-black text-cyan-700">{{ item.step }}</p>
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="updates" class="bg-[#0f1117] px-5 py-14 text-slate-100 md:px-8 lg:px-10">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p class="eyebrow">Changelog</p>
            <h2 class="section-title">功能更新紀錄</h2>
          </div>
          <a
            :href="releaseFolderUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-100"
          >
            <Icon name="lucide:folder-open" class="h-4 w-4" />
            所有版本資料夾
          </a>
        </div>

        <div class="divide-y divide-white/10 border-y border-white/10">
          <article v-for="entry in changelog" :key="entry.version" class="update-row">
            <div>
              <p class="text-sm font-bold text-cyan-200">v{{ entry.version }}</p>
              <p class="mt-1 text-sm text-slate-400">{{ entry.date }}</p>
            </div>
            <div>
              <h3 class="text-xl font-black text-white">{{ entry.title }}</h3>
              <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  :href="entry.downloadUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
                >
                  <Icon name="lucide:external-link" class="h-4 w-4" />
                  下載 v{{ entry.version }}
                </a>
                <p class="text-sm text-slate-400">
                  {{ entry.fileName }} · {{ entry.size }}
                </p>
              </div>
              <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                <li v-for="note in entry.notes" :key="note" class="flex gap-2">
                  <Icon name="lucide:check" class="mt-1 h-4 w-4 shrink-0 text-cyan-200" />
                  <span>{{ note }}</span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <footer class="border-t border-white/10 bg-[#0b0d12] px-5 py-7 text-sm text-slate-400 md:px-8 lg:px-10">
      <div class="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row md:items-center">
        <p>Forza Music Overlay 是非官方工具，與 Microsoft、Forza、Spotify、Apple、Google 或 YouTube 無隸屬關係。</p>
        <p>MIT License · Windows 10/11</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  standalone: true,
});

const releaseFolderUrl = 'https://drive.google.com/drive/folders/1hOYe4_yibVyoxfvFIVmsJ_a_WcI3eb3i?usp=drive_link';
const release200Url = 'https://drive.google.com/file/d/1JvewwPWzbAtJiVLnLrpoQxB0Mq4S2BVz/view?usp=drive_link';
const release110Url = 'https://drive.google.com/file/d/1DeWTne7p7Ea2SvXwREk13rRArFQD09v0/view?usp=drive_link';
const release100Url = 'https://drive.google.com/file/d/1kHZgtMYKGVgUYxTGhC1w2fBEyROjNbsX/view?usp=drive_link';
const sponsorUrl = 'https://buymeacoffee.com/scott5497';

const release = {
  version: '2.0.0',
  date: '2026-05-27',
  fileName: 'ForzaMusicOverlay-release2.0.zip',
  size: '163.21 MB',
  downloadUrl: release200Url,
  snapshot: '2.0 新增 Apple Music、Liquid Glass / 暗黑主題、懸浮播放器大小調整、縮圖與進度顯示改善，並支援解壓後直接點 exe 使用。',
};

const releaseStats = [
  { label: '版本', value: `v${release.version}` },
  { label: '平台', value: 'Windows' },
  { label: '格式', value: 'ZIP' },
  { label: '更新', value: release.date },
];

const features = [
  {
    icon: 'lucide:badge-info',
    title: '播放資訊懸浮顯示',
    desc: '在遊戲中顯示目前歌曲、縮圖、播放狀態、進度與服務來源。',
  },
  {
    icon: 'lucide:keyboard',
    title: '全域快捷鍵',
    desc: '支援播放、暫停、下一首、上一首、音量與顯示切換。',
  },
  {
    icon: 'lucide:gamepad-2',
    title: '手把組合鍵',
    desc: '支援 LB + A / B / X / 上 / 下控制播放、切歌與音量。',
  },
  {
    icon: 'lucide:sparkles',
    title: '雙主題介面',
    desc: '支援暗黑模式與 Liquid Glass，並可調整左上角懸浮播放器大小。',
  },
  {
    icon: 'lucide:shield-check',
    title: '不保存登入資料',
    desc: '只讀 Windows 媒體工作階段，不處理音樂服務帳密。',
  },
];

const usageTips = [
  {
    icon: 'lucide:scan',
    keys: '60% - 100%',
    title: '調整懸浮大小',
    desc: '在主介面的大小滑桿調整左上角懸浮播放器比例，畫面太擋或太小都能微調。',
  },
  {
    icon: 'lucide:move',
    keys: 'Ctrl + Alt + P',
    title: '拖曳調整位置',
    desc: '按下調整懸浮位置後拖曳播放器，放到順眼的位置再回到遊戲。',
  },
  {
    icon: 'lucide:gamepad-2',
    keys: 'LB + A',
    title: '播放 / 暫停',
    desc: '遊戲中按住 LB 再按 A，就能播放或暫停目前歌曲。',
  },
  {
    icon: 'lucide:skip-forward',
    keys: 'LB + B / LB + X',
    title: '下一首 / 上一首',
    desc: 'LB + B 切到下一首，LB + X 回到上一首，不需要離開 Forza。',
  },
  {
    icon: 'lucide:volume-2',
    keys: 'LB + ↑ / ↓',
    title: '調整音量',
    desc: 'LB + 上鍵調高音量，LB + 下鍵調低音量。',
  },
  {
    icon: 'lucide:monitor-up',
    keys: 'Ctrl + Alt + Home',
    title: '顯示 / 隱藏播放器',
    desc: '想暫時收起左上角懸浮播放器時，可以用快捷鍵快速切換。',
  },
];

const installFlow = [
  {
    step: 'STEP 1',
    icon: 'lucide:download',
    title: '下載 ZIP',
    desc: '從 Google Drive 下載 release2.0 壓縮檔。',
  },
  {
    step: 'STEP 2',
    icon: 'lucide:archive',
    title: '解壓縮',
    desc: '完整解壓縮資料夾，不要直接在 ZIP 內執行。',
  },
  {
    step: 'STEP 3',
    icon: 'lucide:mouse-pointer-click',
    title: '直接點 exe',
    desc: '雙擊 ForzaMusicOverlay.exe 就能開始使用。',
  },
  {
    step: 'OPTION',
    icon: 'lucide:badge-plus',
    title: '建立捷徑',
    desc: '需要桌面捷徑時再執行 Install-App.bat。',
  },
];

const changelog = [
  {
    version: '2.0.0',
    date: '2026-05-27',
    fileName: 'ForzaMusicOverlay-release2.0.zip',
    size: '163.21 MB',
    downloadUrl: release200Url,
    title: '音樂服務、介面與安裝體驗大更新',
    notes: [
      '新增 Apple Music 支援，現在可顯示 YouTube Music、Spotify 與 Apple Music 的播放資訊。',
      '新增 Liquid Glass 與暗黑模式，控制台與懸浮播放器都有更完整的視覺風格。',
      '新增懸浮播放器大小調整，左上角顯示可以在 60% 到 100% 之間縮放。',
      '改善歌曲縮圖、播放進度與切歌時的顯示銜接。',
      '新增更清楚的手把組合鍵說明，支援播放/暫停、切歌與音量調整。',
      '改善使用者安裝流程，解壓後可直接點 ForzaMusicOverlay.exe 使用。',
      '修正關閉主視窗後懸浮播放器可能殘留的問題。',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-05-26',
    fileName: 'ForzaMusicOverlay1.1.zip',
    size: '43.5 MB',
    downloadUrl: release110Url,
    title: '新增 Spotify 支援',
    notes: [
      '支援 YouTube Music 與 Spotify 播放資訊顯示。',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-05-26',
    fileName: 'ForzaMusicOverlay1.0.zip',
    size: '35.2 MB',
    downloadUrl: release100Url,
    title: '初始版本',
    notes: [
      '支援 YouTube Music 播放資訊顯示在 Forza Horizon 6 之上。',
      '支援手把與鍵盤，在遊戲內切換歌曲與操作。',
      '支援懸浮播放器位置調整與本機設定保存。',
    ],
  },
];

useSeoMeta({
  title: 'Forza 音樂懸浮播放器',
  description: 'Forza Music Overlay 下載頁、專案更新紀錄與 Windows 安裝說明。',
  ogTitle: 'Forza 音樂懸浮播放器',
  ogDescription: 'Forza Music Overlay 下載頁、專案更新紀錄與 Windows 安裝說明。',
});
</script>

<style scoped>
.forza-page {
  font-family: Inter, "Noto Sans TC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hero-band {
  background:
    linear-gradient(135deg, rgba(14, 165, 233, 0.18), transparent 38%),
    radial-gradient(circle at 82% 22%, rgba(34, 197, 94, 0.18), transparent 30%),
    linear-gradient(180deg, #111827 0%, #0f1117 100%);
  overflow: hidden;
  position: relative;
}

.hero-band > div {
  position: relative;
  z-index: 1;
}

.hero-logo-watermark {
  bottom: -8%;
  filter: saturate(0.92) contrast(1.05);
  left: -4%;
  max-width: 620px;
  opacity: 0.08;
  pointer-events: none;
  position: absolute;
  right: auto;
  transform: rotate(-6deg);
  width: min(46vw, 620px);
}

.signature-mark {
  align-items: center;
  border: 1px solid rgba(103, 232, 249, 0.28);
  border-radius: 999px;
  color: rgb(165 243 252);
  display: inline-flex;
  font-size: 13px;
  font-weight: 900;
  justify-content: center;
  padding: 8px 14px;
  width: fit-content;
  background: rgba(8, 47, 73, 0.32);
  box-shadow: 0 10px 34px rgba(8, 145, 178, 0.14);
}

.download-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.78);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  padding: 24px;
}

.release-meta-row {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.release-meta-value {
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

.stat-cell {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 14px;
}

.stat-cell dt {
  color: rgb(148 163 184);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.stat-cell dd {
  color: white;
  font-size: 16px;
  font-weight: 900;
  margin-top: 4px;
}

.sponsor-card {
  align-items: center;
  border: 1px solid rgba(251, 191, 36, 0.24);
  border-radius: 8px;
  background:
    radial-gradient(circle at 86% 42%, rgba(251, 191, 36, 0.16), transparent 28%),
    rgba(255, 255, 255, 0.055);
  box-shadow: 0 18px 54px rgba(0, 0, 0, 0.22);
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 18px;
}

.sponsor-actions {
  align-items: center;
  display: flex;
  gap: 12px;
}

.sponsor-qr {
  background: white;
  border-radius: 8px;
  height: 86px;
  object-fit: contain;
  padding: 5px;
  width: 86px;
}

.sponsor-button {
  align-items: center;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
  border-radius: 999px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  color: rgb(15 23 42);
  display: inline-flex;
  font-size: 14px;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  padding: 0 18px;
  text-decoration: none;
  white-space: nowrap;
}

.sponsor-button:hover,
.sponsor-button:focus-visible {
  background: white;
}

.eyebrow {
  color: rgb(103 232 249);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.section-title {
  color: white;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.05;
  margin-top: 10px;
}

.install-section .eyebrow {
  color: rgb(100 116 139);
}

.install-section .section-title {
  color: rgb(15 23 42);
}

.feature-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.feature-item {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 18px;
}

.feature-item h3 {
  color: white;
  font-size: 16px;
  font-weight: 900;
  margin-top: 14px;
}

.feature-item p {
  color: rgb(203 213 225);
  font-size: 14px;
  line-height: 1.7;
  margin-top: 8px;
}

.usage-tutorial {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.usage-tip {
  align-items: flex-start;
  animation: usageFloatIn 0.7s ease both;
  animation-delay: var(--delay);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.72)),
    radial-gradient(circle at 16% 20%, rgba(103, 232, 249, 0.18), transparent 34%);
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 8px;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 14px;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 128px;
  padding: 16px;
  position: relative;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.usage-tip::after {
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.42), transparent);
  content: "";
  height: 1px;
  left: 16px;
  opacity: 0.5;
  position: absolute;
  right: 16px;
  top: 0;
}

.usage-tip:hover {
  border-color: rgba(14, 165, 233, 0.36);
  box-shadow: 0 22px 54px rgba(14, 165, 233, 0.12);
  transform: translateY(-2px);
}

.usage-icon {
  align-items: center;
  background: rgb(15 23 42);
  border-radius: 8px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.18);
  color: rgb(103 232 249);
  display: inline-flex;
  height: 42px;
  justify-content: center;
  position: relative;
  width: 42px;
}

.usage-icon::after {
  animation: guidePulse 2.4s ease-in-out infinite;
  border: 1px solid rgba(103, 232, 249, 0.36);
  border-radius: inherit;
  content: "";
  inset: -5px;
  position: absolute;
}

.usage-kbd {
  color: rgb(8 145 178);
  font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.usage-tip h3 {
  color: rgb(15 23 42);
  font-size: 18px;
  font-weight: 900;
  margin-top: 5px;
}

.usage-tip p:last-child {
  color: rgb(71 85 105);
  font-size: 14px;
  line-height: 1.65;
  margin-top: 7px;
}

.install-visual {
  align-items: stretch;
  display: grid;
  gap: 14px;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.install-card {
  align-items: flex-start;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.88));
  border: 1px solid rgb(226 232 240);
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.09);
  display: flex;
  gap: 14px;
  height: 100%;
  min-height: 166px;
  padding: 18px;
}

.install-icon {
  align-items: center;
  background: rgb(15 23 42);
  border-radius: 8px;
  color: rgb(103 232 249);
  display: inline-flex;
  flex: 0 0 auto;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.install-card h3 {
  color: rgb(15 23 42);
  font-size: 18px;
  font-weight: 900;
  margin-top: 6px;
}

.install-card p:last-child {
  color: rgb(71 85 105);
  font-size: 14px;
  line-height: 1.7;
  margin-top: 8px;
}

.install-ready-note {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(255, 255, 255, 0.8));
  border: 1px solid rgba(14, 165, 233, 0.18);
  border-radius: 8px;
  color: rgb(15 23 42);
  display: flex;
  gap: 12px;
  padding: 16px 18px;
}

.install-ready-note svg {
  color: rgb(8 145 178);
  flex: 0 0 auto;
}

.install-ready-note p {
  color: rgb(51 65 85);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.7;
}

.update-row {
  display: grid;
  gap: 24px;
  grid-template-columns: 180px minmax(0, 1fr);
  padding: 28px 0;
}

@keyframes usageFloatIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes guidePulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.96);
  }

  50% {
    opacity: 0.95;
    transform: scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .usage-tip,
  .usage-icon::after {
    animation: none;
  }

  .usage-tip:hover {
    transform: none;
  }
}

@media (max-width: 768px) {
  .hero-logo-watermark {
    bottom: 10%;
    left: -30%;
    opacity: 0.06;
    width: 78vw;
  }

  .sponsor-card {
    grid-template-columns: 1fr;
  }

  .feature-grid,
  .install-visual,
  .usage-tutorial,
  .update-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .sponsor-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .release-meta-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .release-meta-value {
    text-align: left;
  }
}

@media (min-width: 768px) {
  .section-title {
    font-size: 3rem;
  }
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 3.25rem;
  }
}
</style>
