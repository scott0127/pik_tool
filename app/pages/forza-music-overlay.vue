<template>
  <div class="forza-page min-h-screen bg-[#0f1117] text-slate-100">
    <section class="hero-band">
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
            在玩 Forza 時顯示 YouTube Music 或 Spotify 正在播放的歌曲，並用快捷鍵控制播放、暫停、下一首、上一首與音量。
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
            程式透過 Windows 目前媒體工作階段讀取歌曲資訊。登入 YouTube Music 或 Spotify 都在官方服務中完成，工具本身不會要求、保存或讀取帳號密碼。
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
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p class="eyebrow text-slate-500">Install</p>
          <h2 class="section-title text-slate-950">安裝方式</h2>
          <ol class="mt-6 space-y-4">
            <li v-for="step in installSteps" :key="step" class="install-step">
              <span>{{ installSteps.indexOf(step) + 1 }}</span>
              <p>{{ step }}</p>
            </li>
          </ol>
        </div>

        <figure class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <img
            src="/downloads/forza-music-overlay/Install-Guide.png"
            alt="Forza Music Overlay 安裝教學"
            class="h-full w-full object-cover"
          >
        </figure>
      </div>
    </section>

    <section id="updates" class="bg-[#0f1117] px-5 py-14 text-slate-100 md:px-8 lg:px-10">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p class="eyebrow">Changelog</p>
            <h2 class="section-title">專案更新紀錄</h2>
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
        <p>Forza Music Overlay 是非官方工具，與 Microsoft、Forza、Spotify、Google 或 YouTube 無隸屬關係。</p>
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
const release110Url = 'https://drive.google.com/file/d/1DeWTne7p7Ea2SvXwREk13rRArFQD09v0/view?usp=drive_link';
const release100Url = 'https://drive.google.com/file/d/1kHZgtMYKGVgUYxTGhC1w2fBEyROjNbsX/view?usp=drive_link';

const release = {
  version: '1.1.0',
  date: '2026-05-26',
  fileName: 'ForzaMusicOverlay1.1.zip',
  size: '43.5 MB',
  downloadUrl: release110Url,
  snapshot: '新增 Spotify 支援；目前可顯示 YouTube Music 與 Spotify 的播放資訊，並延續遊戲內手把與鍵盤操作。',
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
    desc: '在遊戲中顯示目前歌曲、播放狀態與服務來源。',
  },
  {
    icon: 'lucide:keyboard',
    title: '全域快捷鍵',
    desc: '支援播放、暫停、下一首、上一首、音量與顯示切換。',
  },
  {
    icon: 'lucide:gamepad-2',
    title: '手把組合鍵',
    desc: '支援 LB + A / B / X 控制播放、下一首與上一首。',
  },
  {
    icon: 'lucide:shield-check',
    title: '不保存登入資料',
    desc: '只讀 Windows 媒體工作階段，不處理音樂服務帳密。',
  },
];

const installSteps = [
  '從 Google Drive 下載並解壓縮 ForzaMusicOverlay1.1.zip。',
  '打開 ForzaMusicOverlay 資料夾。',
  '雙擊 Install-App.bat 建立桌面與開始功能表捷徑。',
  '從捷徑啟動 Forza 音樂懸浮播放器。',
  '第一次使用時依照畫面指引開啟 YouTube Music 或 Spotify，播放任一歌曲後重新檢查。',
];

const changelog = [
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

.install-step {
  align-items: flex-start;
  display: flex;
  gap: 14px;
}

.install-step span {
  align-items: center;
  background: rgb(15 23 42);
  border-radius: 8px;
  color: white;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 900;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.install-step p {
  color: rgb(51 65 85);
  line-height: 1.8;
  padding-top: 1px;
}

.update-row {
  display: grid;
  gap: 24px;
  grid-template-columns: 180px minmax(0, 1fr);
  padding: 28px 0;
}

@media (max-width: 768px) {
  .feature-grid,
  .update-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
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
