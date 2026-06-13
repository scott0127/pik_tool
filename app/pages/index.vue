<template>
  <div ref="homePage" class="min-h-screen relative pb-20 overflow-hidden">
    <div class="home-story-stack relative z-10 pt-4 md:pt-8">
      <section id="story-home" class="home-story-section" data-story-section="home">
        <HomeBentoGrid>
          <!-- 1. Hero -->
          <template #hero>
              <HomeHeroSection />
          </template>

          <!-- 2. Near Complete -->
          <template #near-complete>
             <HomeNearCompleteScroll
                :categories="nearCompleteCategories"
                @select-category="goToCategory"
            />
          </template>

        </HomeBentoGrid>
      </section>

      <section
        id="story-catalog"
        class="home-story-section story-chapter story-chapter-catalog is-clickable"
        data-story-section="catalog"
        role="link"
        tabindex="0"
        @click="goToStoryDestination('catalog')"
        @keydown.enter.prevent="goToStoryDestination('catalog')"
        @keydown.space.prevent="goToStoryDestination('catalog')"
      >
        <div class="story-copy">
          <div class="story-action-badge">
            <span class="story-action-glint" aria-hidden="true"></span>
            <Icon name="lucide:book-open-check" />
            <span>皮克敏圖鑑</span>
            <Icon class="story-action-arrow" name="lucide:arrow-up-right" />
            <span class="story-tap-hint" aria-hidden="true">
              <Icon name="lucide:mouse-pointer-2" />
            </span>
          </div>
          <h2>一眼知道缺哪隻</h2>
        </div>

        <div class="story-visual catalog-visual" aria-label="Catalog feature preview">
          <div class="catalog-browser">
            <div class="catalog-toolbar">
              <span class="catalog-search-pulse" aria-hidden="true"></span>
              <span class="catalog-search-dot"></span>
              <span class="catalog-search-placeholder">搜尋飾品名稱、分類...</span>
              <span class="catalog-search-query">廚師帽</span>
              <span class="catalog-caret"></span>
            </div>
            <div class="catalog-category-row">
              <span class="catalog-category-pill is-active" data-catalog-tab="restaurant">餐廳</span>
              <span class="catalog-category-pill" data-catalog-tab="park">公園</span>
              <span class="catalog-category-pill" data-catalog-tab="station">車站</span>
            </div>
            <div class="catalog-grid-preview">
              <span class="catalog-filter-sweep" aria-hidden="true"></span>
              <div
                v-for="scenario in catalogPreviewScenarios"
                :key="scenario.id"
                class="catalog-preview-set"
                :data-catalog-set="scenario.id"
              >
                <div
                  v-for="item in scenario.items"
                  :key="`${scenario.id}-${item.type}`"
                  class="catalog-preview-card"
                  :data-catalog-card="`${scenario.id}-${item.type}`"
                  :class="[
                    item.collected ? 'is-collected' : 'is-locked',
                    item.unlockDemo && 'is-unlock-demo',
                  ]"
                >
                  <div class="catalog-preview-image">
                    <img :src="item.image" :alt="item.label" loading="lazy">
                  </div>
                  <div class="catalog-preview-state">
                    <Icon class="catalog-preview-lock-icon" name="lucide:lock" />
                    <Icon class="catalog-preview-check-icon" name="lucide:check" />
                  </div>
                  <span class="catalog-preview-badge">{{ item.label }}</span>
                </div>
              </div>
            </div>
            <div class="catalog-progress-stage">
              <div
                v-for="scenario in catalogPreviewScenarios"
                :key="`progress-${scenario.id}`"
                class="catalog-progress-card"
                :data-catalog-progress="scenario.id"
              >
                <span class="catalog-progress-image">
                  <img :src="scenario.progressImage" :alt="scenario.progressTitle" loading="lazy">
                </span>
                <div class="catalog-progress-copy">
                  <strong>{{ scenario.progressTitle }}</strong>
                  <small>{{ getCatalogProgressSubtitle(scenario) }}</small>
                  <span class="catalog-progress-bar">
                    <i :style="{ transform: `scaleX(${getCatalogProgress(scenario)})` }"></i>
                  </span>
                </div>
                <span class="catalog-progress-gift">
                  <Icon name="lucide:gift" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="story-map"
        class="home-story-section story-chapter story-chapter-map is-clickable"
        data-story-section="map"
        role="link"
        tabindex="0"
        @click="goToStoryDestination('map')"
        @keydown.enter.prevent="goToStoryDestination('map')"
        @keydown.space.prevent="goToStoryDestination('map')"
      >
        <div class="story-copy">
          <div class="story-action-badge">
            <span class="story-action-glint" aria-hidden="true"></span>
            <Icon name="lucide:map-pin" />
            <span>飾品地圖</span>
            <Icon class="story-action-arrow" name="lucide:arrow-up-right" />
            <span class="story-tap-hint" aria-hidden="true">
              <Icon name="lucide:mouse-pointer-2" />
            </span>
          </div>
          <h2>找到你想抓的裝飾品皮克敏在哪裡</h2>
        </div>

        <div class="story-visual map-visual" aria-label="Map feature preview">
          <div class="map-discovery">
            <div class="map-scan-stage">
              <div class="map-scan-window">
                <span class="map-osm-layer" aria-hidden="true"></span>
                <span class="map-osm-tint" aria-hidden="true"></span>
                <span class="map-scan-note">
                  <Icon name="lucide:radar" />
                  <span>附近掃描中</span>
                </span>
                <span class="map-scan-beam" aria-hidden="true"></span>
                <span class="map-path-step map-path-step-a">
                  <Icon name="lucide:coffee" />
                </span>
                <span class="map-path-step map-path-step-b">
                  <Icon name="lucide:trees" />
                </span>
                <span class="map-path-step map-path-step-c is-target">
                  <Icon name="lucide:chef-hat" />
                </span>
                <span class="map-found-label">在這裡!</span>
                <span class="map-osm-attribution">© OSM</span>
              </div>

              <div class="map-location-list">
                <div class="map-location-row">
                  <span class="map-location-icon">
                    <Icon name="lucide:trees" />
                  </span>
                  <div>
                    <strong>公園旁步道</strong>
                    <small>這裡有花苗、四葉草</small>
                  </div>
                  <b>50公尺</b>
                </div>
                <div class="map-location-row">
                  <span class="map-location-icon">
                    <Icon name="lucide:coffee" />
                  </span>
                  <div>
                    <strong>車站咖啡亭</strong>
                    <small>這裡有咖啡杯候選</small>
                  </div>
                  <b>75公尺</b>
                </div>
                <div class="map-location-row is-target">
                  <span class="map-location-icon">
                    <Icon name="lucide:chef-hat" />
                  </span>
                  <span class="map-target-preview">
                    <img :src="mapPreviewDecorImage" alt="" loading="lazy">
                  </span>
                  <div>
                    <strong>台北車站餐廳街</strong>
                    <small>在這裡找到餐廳飾品</small>
                  </div>
                  <b class="map-purity-badge">純種</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="story-friends"
        class="home-story-section story-chapter story-chapter-friends is-clickable"
        data-story-section="friends"
        role="link"
        tabindex="0"
        @click="goToStoryDestination('friends')"
        @keydown.enter.prevent="goToStoryDestination('friends')"
        @keydown.space.prevent="goToStoryDestination('friends')"
      >
        <div class="story-copy">
          <div class="story-action-badge">
            <span class="story-action-glint" aria-hidden="true"></span>
            <Icon name="lucide:user-round" />
            <span>皮友</span>
            <Icon class="story-action-arrow" name="lucide:arrow-up-right" />
            <span class="story-tap-hint" aria-hidden="true">
              <Icon name="lucide:mouse-pointer-2" />
            </span>
          </div>
          <h2>交個外國皮友吧</h2>
        </div>

        <div class="story-visual friends-visual" aria-label="Friends feature preview">
          <div class="friend-invite-card">
            <div class="friend-invite-name">
              <strong>海外皮友 A</strong>
              <small>11 小時前</small>
            </div>
            <div class="friend-code-badge">
              <span>•••• 7393 ••••</span>
              <Icon name="lucide:copy" />
            </div>
            <div class="friend-wish-row">
              <span class="friend-wish-chip is-region">海外明信片</span>
              <span class="friend-wish-chip is-postcard">想互送美片</span>
            </div>
            <div class="friend-add-button is-added">
              <Icon class="friend-add-check" name="lucide:check" />
              <span>已送出</span>
            </div>
          </div>

          <div class="friend-stream-stage">
            <div class="friend-stream-row friend-stream-row-top">
              <div
                v-for="friend in friendStreamTopLoop"
                :key="friend.id"
                class="friend-stream-card"
                :class="`is-${friend.variant}`"
              >
                <span class="friend-stream-avatar">{{ friend.initial }}</span>
                <div>
                  <strong>{{ friend.name }}</strong>
                  <small>{{ friend.meta }}</small>
                </div>
                <span class="friend-stream-tag">{{ friend.tag }}</span>
              </div>
            </div>
            <div class="friend-stream-row friend-stream-row-bottom">
              <div
                v-for="friend in friendStreamBottomLoop"
                :key="friend.id"
                class="friend-stream-card"
                :class="`is-${friend.variant}`"
              >
                <span class="friend-stream-avatar">{{ friend.initial }}</span>
                <div>
                  <strong>{{ friend.name }}</strong>
                  <small>{{ friend.meta }}</small>
                </div>
                <span class="friend-stream-tag">{{ friend.tag }}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section
        id="story-release"
        class="home-story-section story-chapter story-chapter-release is-clickable"
        data-story-section="release"
        role="link"
        tabindex="0"
        @click="goToStoryDestination('release')"
        @keydown.enter.prevent="goToStoryDestination('release')"
        @keydown.space.prevent="goToStoryDestination('release')"
      >
        <div class="story-copy">
          <div class="story-action-badge">
            <span class="story-action-glint" aria-hidden="true"></span>
            <Icon name="lucide:leaf" />
            <span>放生回憶</span>
            <Icon class="story-action-arrow" name="lucide:arrow-up-right" />
            <span class="story-tap-hint" aria-hidden="true">
              <Icon name="lucide:mouse-pointer-2" />
            </span>
          </div>
          <h2>重複也能留下故事</h2>
        </div>

        <div class="story-visual release-visual" aria-label="Release feature preview">
          <div class="release-duplicate-stack" aria-hidden="true">
            <span>重複</span>
            <span>重複</span>
            <span>重複</span>
          </div>
          <div class="release-memory-card">
            <div class="release-pikmin-portrait">
              <Icon name="lucide:leaf" />
            </div>
            <div class="release-memory-copy">
              <strong>小紅皮</strong>
              <span>餐廳 · 2026-06-11</span>
              <small>因為我要測試</small>
            </div>
          </div>
          <div class="release-organize-label">
            <Icon name="lucide:archive" />
            <span>整理成一筆回憶</span>
          </div>
          <div class="release-soft-path"></div>
        </div>
      </section>

      <div
        class="home-story-sign"
        :class="{ 'is-peeking': isStoryNavPeeking }"
        aria-hidden="true"
      >
        <span>{{ activeStoryLabel }}</span>
      </div>

      <nav
        ref="storyNav"
        class="home-story-nav"
        :class="{ 'is-peeking': isStoryNavPeeking }"
        aria-label="首頁章節進度"
      >
        <span ref="storyNavPill" class="home-story-nav-pill" aria-hidden="true"></span>
        <button
          v-for="(item, index) in storyNavItems"
          :key="item.id"
          :ref="(el) => setStoryNavButton(el, index)"
          type="button"
          class="home-story-nav-item"
          :class="{ 'is-active': activeStoryIndex === index }"
          @click="scrollToStorySection(item.id)"
        >
          <Icon :name="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Footer Buttons (Pikmin Type, etc) - keeping them simple below for now or integrating better later -->
    </div>

    <!-- Modals (Pikmin Type, etc) -->

    <!-- Pikmin Type Selection Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showPikminModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="showPikminModal = false"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="showPikminModal"
              class="bg-white rounded-[2rem] p-6 shadow-2xl max-w-md w-full relative overflow-hidden"
              @click.stop
            >
                <!-- Decorative background -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full opacity-50 -z-10 pointer-events-none"></div>

              <div class="flex items-center justify-between mb-6 relative z-10">
                <h3 class="text-xl font-extrabold text-gray-900 flex items-center gap-2 drop-shadow-sm">
                  <span class="text-2xl">🌈</span> {{ $t('home.modal.select_type') }}
                </h3>
                <button
                    @click="showPikminModal = false"
                    class="bg-white/30 border border-white/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/50 transition-colors shadow-sm"
                >
                    <Icon name="ion:close" class="text-xl text-gray-800" />
                </button>
              </div>

              <div class="grid grid-cols-4 gap-3 relative z-10">
                <button
                  v-for="type in PIKMIN_TYPES"
                  :key="type"
                  @click="goToPikminType(type)"
                  class="bg-slate-50 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-transparent hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md group"
                >
                  <div
                    class="w-10 h-10 rounded-full shadow-md group-hover:scale-110 transition-transform border-2 border-white/50"
                    :class="PIKMIN_TYPE_COLORS[type]"
                  ></div>
                  <span class="text-[10px] font-extrabold text-gray-600 group-hover:text-emerald-700">{{ $t('pikmin_types.' + type ) }}</span>
                  <span class="text-[10px] font-bold text-gray-600 group-hover:text-emerald-700">{{ getPikminTypePercentage(type) }}%</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PIKMIN_TYPES, PIKMIN_TYPE_NAMES, PIKMIN_TYPE_COLORS, type PikminType } from '~/types/decor';

const { t, locale } = useI18n();

const router = useRouter();
const { getStats } = useCollection();
const { getDecorDefinitions } = useDecorData();
const homePage = ref<HTMLElement | null>(null);
const storyNav = ref<HTMLElement | null>(null);
const storyNavPill = ref<HTMLElement | null>(null);
const storyNavButtons = ref<HTMLElement[]>([]);
const activeStoryIndex = ref(0);
const isStoryNavPeeking = ref(false);
let homeMotionContext: ReturnType<typeof gsap.context> | null = null;
let homeResizeCleanup: (() => void) | null = null;
let storyNavPeekTimer: ReturnType<typeof window.setTimeout> | null = null;
let homeInitRetryTimer: ReturnType<typeof window.setTimeout> | null = null;
let homeInitToken = 0;

// Stats
const stats = computed(() => getStats());

// Modal states
const showPikminModal = ref(false);

// 1. Uncollected Count
const uncollectedCount = computed(() => {
  return stats.value.total - stats.value.collected;
});

// 2. Limited Items Count (regional + special)
const limitedCount = computed(() => {
  const regional = stats.value.byCategoryType['regional']?.total || 0;
  const special = stats.value.byCategoryType['special']?.total || 0;
  return regional + special;
});

const storyNavItems = [
  { id: 'home', label: '總覽', icon: 'lucide:home' },
  { id: 'map', label: '地圖', icon: 'lucide:map-pin' },
  { id: 'catalog', label: '圖鑑', icon: 'lucide:book-open-check' },
  { id: 'friends', label: '皮友', icon: 'lucide:user-round' },
  { id: 'release', label: '回憶', icon: 'lucide:leaf' },
] as const;

const activeStoryLabel = computed(() => storyNavItems[activeStoryIndex.value]?.label ?? storyNavItems[0].label);

const catalogPreviewScenarios = [
  {
    id: 'restaurant',
    query: '廚師帽',
    progressTitle: '廚師帽',
    progressImage: 'https://pikmin.wiki.gallery/images/thumb/3/37/Decor_Blue_Chef_Hat_%28Rare%29.png/61px-Decor_Blue_Chef_Hat_%28Rare%29.png',
    items: [
      {
        type: 'red',
        label: '紅',
        collected: false,
        image: 'https://pikmin.wiki.gallery/images/thumb/5/5e/Decor_Red_Chef_Hat_%28Rare%29.png/63px-Decor_Red_Chef_Hat_%28Rare%29.png',
      },
      {
        type: 'yellow',
        label: '黃',
        collected: false,
        image: 'https://pikmin.wiki.gallery/images/thumb/4/41/Decor_Yellow_Chef_Hat_%28Rare%29.png/51px-Decor_Yellow_Chef_Hat_%28Rare%29.png',
      },
      {
        type: 'blue',
        label: '藍',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/3/37/Decor_Blue_Chef_Hat_%28Rare%29.png/61px-Decor_Blue_Chef_Hat_%28Rare%29.png',
      },
      {
        type: 'white',
        label: '白',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/c/cf/Decor_White_Chef_Hat_%28Rare%29.png/67px-Decor_White_Chef_Hat_%28Rare%29.png',
      },
      {
        type: 'purple',
        label: '紫',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/0/0c/Decor_Purple_Chef_Hat_%28Rare%29.png/51px-Decor_Purple_Chef_Hat_%28Rare%29.png',
      },
      {
        type: 'rock',
        label: '岩',
        collected: false,
        unlockDemo: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/b/bc/Decor_Rock_Chef_Hat_%28Rare%29.png/78px-Decor_Rock_Chef_Hat_%28Rare%29.png',
      },
    ],
  },
  {
    id: 'park',
    query: '四葉草',
    progressTitle: '四葉草',
    progressImage: 'https://pikmin.wiki.gallery/images/thumb/a/a6/Decor_Blue_Clover.png/100px-Decor_Blue_Clover.png',
    items: [
      {
        type: 'red',
        label: '紅',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/5/5e/Decor_Red_Clover.png/100px-Decor_Red_Clover.png',
      },
      {
        type: 'yellow',
        label: '黃',
        collected: false,
        image: 'https://pikmin.wiki.gallery/images/thumb/2/22/Decor_Yellow_Clover.png/100px-Decor_Yellow_Clover.png',
      },
      {
        type: 'blue',
        label: '藍',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/a/a6/Decor_Blue_Clover.png/100px-Decor_Blue_Clover.png',
      },
      {
        type: 'white',
        label: '白',
        collected: false,
        unlockDemo: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/b/b9/Decor_White_Clover.png/100px-Decor_White_Clover.png',
      },
      {
        type: 'purple',
        label: '紫',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/b/b6/Decor_Purple_Clover.png/100px-Decor_Purple_Clover.png',
      },
      {
        type: 'rock',
        label: '岩',
        collected: false,
        image: 'https://pikmin.wiki.gallery/images/thumb/c/c3/Decor_Rock_Clover.png/100px-Decor_Rock_Clover.png',
      },
    ],
  },
  {
    id: 'station',
    query: '紙火車',
    progressTitle: '紙火車',
    progressImage: 'https://pikmin.wiki.gallery/images/thumb/e/e5/Decor_Blue_Paper_Train.png/100px-Decor_Blue_Paper_Train.png',
    items: [
      {
        type: 'red',
        label: '紅',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/5/5e/Decor_Red_Paper_Train.png/100px-Decor_Red_Paper_Train.png',
      },
      {
        type: 'yellow',
        label: '黃',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/b/ba/Decor_Yellow_Paper_Train.png/100px-Decor_Yellow_Paper_Train.png',
      },
      {
        type: 'blue',
        label: '藍',
        collected: false,
        unlockDemo: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/e/e5/Decor_Blue_Paper_Train.png/100px-Decor_Blue_Paper_Train.png',
      },
      {
        type: 'white',
        label: '白',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/7/70/Decor_White_Paper_Train.png/100px-Decor_White_Paper_Train.png',
      },
      {
        type: 'purple',
        label: '紫',
        collected: false,
        image: 'https://pikmin.wiki.gallery/images/thumb/4/41/Decor_Purple_Paper_Train.png/94px-Decor_Purple_Paper_Train.png',
      },
      {
        type: 'rock',
        label: '岩',
        collected: true,
        image: 'https://pikmin.wiki.gallery/images/thumb/d/d4/Decor_Rock_Paper_Train.png/100px-Decor_Rock_Paper_Train.png',
      },
    ],
  },
] as const;

type CatalogScenarioId = (typeof catalogPreviewScenarios)[number]['id'];
type CatalogPreviewScenario = (typeof catalogPreviewScenarios)[number];

const getCatalogMissingCount = (scenario: CatalogPreviewScenario) => (
  scenario.items.filter(item => !item.collected).length
);

const getCatalogProgress = (scenario: CatalogPreviewScenario) => {
  if (!scenario.items.length) return 0;
  return (scenario.items.length - getCatalogMissingCount(scenario)) / scenario.items.length;
};

const getCatalogProgressSubtitle = (scenario: CatalogPreviewScenario) => {
  const missingCount = getCatalogMissingCount(scenario);
  return missingCount === 0 ? '已蒐集完成' : `差 ${missingCount} 個蒐集完成`;
};

const friendStreamTop = [
  { id: 'top-a', initial: 'A', name: '海外皮友 A', meta: '亞洲 · 8 小時前', tag: '明信片', variant: 'standard' },
  { id: 'top-b', initial: 'B', name: '旅人 Pikmin', meta: '歐洲 · 想互送', tag: '美片', variant: 'compact' },
  { id: 'top-c', initial: 'C', name: '花苗收藏家', meta: '北美 · 缺花冠', tag: '花苗', variant: 'wide' },
  { id: 'top-d', initial: 'D', name: '蘑菇隊友', meta: '海外 · 每日上線', tag: '打菇', variant: 'standard' },
  { id: 'top-e', initial: 'E', name: '旅途皮友', meta: '日本 · 車站控', tag: '地點', variant: 'compact' },
];

const friendStreamBottom = [
  { id: 'bottom-a', initial: 'F', name: '海外皮友 B', meta: '日本 · 6 小時前', tag: '餐廳', variant: 'mid' },
  { id: 'bottom-b', initial: 'G', name: '旅人夥伴', meta: '海外 · 9 小時前', tag: '蘑菇', variant: 'standard' },
  { id: 'bottom-c', initial: 'H', name: '明信片募集', meta: '歐洲 · 找台灣', tag: '交換', variant: 'wide' },
  { id: 'bottom-d', initial: 'I', name: '活動收藏家', meta: '亞洲 · 花冠 6/8', tag: '活動', variant: 'compact' },
  { id: 'bottom-e', initial: 'J', name: '公園散步團', meta: '海外 · 四葉草', tag: '公園', variant: 'mid' },
];

const friendStreamTopLoop = [
  ...friendStreamTop,
  ...friendStreamTop.map(friend => ({ ...friend, id: `${friend.id}-loop` })),
];

const friendStreamBottomLoop = [
  ...friendStreamBottom,
  ...friendStreamBottom.map(friend => ({ ...friend, id: `${friend.id}-loop` })),
];

const mapPreviewDecorImage = 'https://pikmin.wiki.gallery/images/thumb/5/5e/Decor_Red_Chef_Hat_%28Rare%29.png/63px-Decor_Red_Chef_Hat_%28Rare%29.png';

// 3. Near Complete Categories (70-99% complete)
const nearCompleteCategories = computed(() => {
  const definitions = getDecorDefinitions();
  const results: Array<{
    id: string;
    name: string;
    icon: string;
    collected: number;
    total: number;
    remaining: number;
    percentage: number;
  }> = [];

  definitions.forEach(def => {
    const catStats = stats.value.byCategory[def.category.id];
    if (!catStats || catStats.total === 0) return;

    // Calculate percentage
    const percentage = Math.round((catStats.collected / catStats.total) * 100);
    const remaining = catStats.total - catStats.collected;

    // Find a representative icon (Red Pikmin of the first variant)
    let iconUrl = '';
    if (def.variants.length > 0) {
        const firstVar = def.variants[0];
        // Try Red first, then fallback to any available
        if ((firstVar as any).imageUrls?.['red']) {
            iconUrl = (firstVar as any).imageUrls['red'];
        } else if ((firstVar as any).imageUrl) {
            iconUrl = (firstVar as any).imageUrl;
        }
    }

    // Condition: 70% to 99% collected, and at least 1 remaining
    if (percentage >= 70 && percentage < 100 && remaining > 0) {
      results.push({
        id: def.category.id,
        name: locale.value === 'en' ? def.category.nameEn : def.category.name,
        // If we found an image URL, use it. Otherwise fallback to Notomoji without 'lucide:' prefix
        icon: iconUrl || (def.category.icon || 'fluent-emoji:package'),
        collected: catStats.collected,
        total: catStats.total,
        remaining,
        percentage,
      });
    }
  });

  // Sort by percentage (highest first) and take top 6
  return results.sort((a, b) => b.percentage - a.percentage).slice(0, 6);
});

const getPikminTypePercentage = (type: PikminType): number => {
  const data = stats.value.byPikminType[type];
  if (!data || data.total === 0) return 0;
  return Math.round((data.collected / data.total) * 100);
};

const goToPikminType = (type: PikminType) => {
  showPikminModal.value = false;
  router.push({ path: '/collection', query: { pikmin: type } });
};

const goToCategory = (categoryId: string) => {
  router.push({ path: '/collection', query: { category: categoryId } });
};

const storyDestinations = {
  catalog: '/collection',
  map: '/map',
  friends: '/friends',
  release: '/released',
} as const;

const goToStoryDestination = (id: keyof typeof storyDestinations) => {
  router.push(storyDestinations[id]);
};

onBeforeUpdate(() => {
  storyNavButtons.value = [];
});

const setStoryNavButton = (el: unknown, index: number) => {
  if (typeof HTMLElement !== 'undefined' && el instanceof HTMLElement) {
    storyNavButtons.value[index] = el;
  }
};

const waitForFrame = () => new Promise<void>((resolve) => {
  window.requestAnimationFrame(() => resolve());
});

const waitForFontLayout = async () => {
  const fonts = document.fonts;
  if (!fonts) return;

  await Promise.race([
    fonts.ready.catch(() => undefined),
    new Promise(resolve => window.setTimeout(resolve, 650)),
  ]);
};

const isStoryNavLayoutReady = () => {
  if (!storyNav.value || !storyNavPill.value) return false;
  if (storyNavButtons.value.length < storyNavItems.length) return false;

  return storyNavItems.every((_, index) => {
    const button = storyNavButtons.value[index];
    if (!button) return false;
    const rect = button.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
};

const moveStoryPill = (index: number, immediate = false) => {
  const nav = storyNav.value;
  const pill = storyNavPill.value;
  const button = storyNavButtons.value[index];
  if (!nav || !pill || !button) return;

  const navRect = nav.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const dotSize = Math.min(buttonRect.width, buttonRect.height) * 0.64;
  const x = buttonRect.left - navRect.left + ((buttonRect.width - dotSize) / 2);
  const y = buttonRect.top - navRect.top + ((buttonRect.height - dotSize) / 2);
  gsap.set(pill, {
    width: dotSize,
    height: dotSize,
  });

  if (immediate) {
    gsap.set(pill, { x, y, scale: 1 });
  } else {
    gsap.killTweensOf(pill);
    gsap.timeline()
      .to(pill, {
        x,
        y,
        scale: 1.2,
        duration: 0.28,
        ease: 'power3.out',
      })
      .to(pill, {
        scale: 1,
        duration: 0.34,
        ease: 'elastic.out(1, 0.72)',
      }, '-=0.1');
  }
};

const setActiveStoryIndex = (index: number, immediate = false) => {
  activeStoryIndex.value = index;
  moveStoryPill(index, immediate);

  if (typeof window !== 'undefined') {
    isStoryNavPeeking.value = true;
    if (storyNavPeekTimer) {
      window.clearTimeout(storyNavPeekTimer);
    }
    storyNavPeekTimer = window.setTimeout(() => {
      isStoryNavPeeking.value = false;
      storyNavPeekTimer = null;
    }, immediate ? 900 : 1250);
  }
};

const scrollToStorySection = (id: string) => {
  const target = document.querySelector<HTMLElement>(`[data-story-section="${id}"]`);
  if (!target) return;

  const offset = window.innerWidth < 768 ? 104 : 92;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
};

const initHomeScrollMotion = () => {
  if (!homePage.value || typeof window === 'undefined') return;

  homeMotionContext?.revert();
  homeResizeCleanup?.();
  homeResizeCleanup = null;
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  homeMotionContext = gsap.context(() => {
    const storySections = storyNavItems
      .map(item => homePage.value?.querySelector<HTMLElement>(`[data-story-section="${item.id}"]`) ?? null)
      .filter((section): section is HTMLElement => Boolean(section));
    const storyChapters = gsap.utils.toArray<HTMLElement>('.story-chapter');

    if (reduceMotion) {
      setActiveStoryIndex(0, true);
      gsap.set([
        '.catalog-progress-card',
        '.map-scan-note',
        '.map-scan-beam',
        '.map-path-step',
        '.map-found-label',
        '.map-location-list',
        '.friend-stream-row',
        '.release-memory-card',
        '.release-organize-label',
      ], { clearProps: 'all' });
      storySections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveStoryIndex(index, true),
          onEnterBack: () => setActiveStoryIndex(index, true),
        });
      });
      return;
    }

    setActiveStoryIndex(0, true);

    storySections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 58%',
        end: 'bottom 58%',
        onEnter: () => setActiveStoryIndex(index),
        onEnterBack: () => setActiveStoryIndex(index),
      });
    });

    const catalogRoot = homePage.value?.querySelector<HTMLElement>('.story-chapter-catalog') ?? null;
    const catalogSets = catalogRoot
      ? gsap.utils.toArray<HTMLElement>(catalogRoot.querySelectorAll('.catalog-preview-set'))
      : [];
    const catalogProgressCards = catalogRoot
      ? gsap.utils.toArray<HTMLElement>(catalogRoot.querySelectorAll('.catalog-progress-card'))
      : [];
    const catalogTabs = catalogRoot
      ? gsap.utils.toArray<HTMLElement>(catalogRoot.querySelectorAll('[data-catalog-tab]'))
      : [];
    const searchPulse = catalogRoot?.querySelector<HTMLElement>('.catalog-search-pulse') ?? null;
    const searchQuery = catalogRoot?.querySelector<HTMLElement>('.catalog-search-query') ?? null;
    const searchPlaceholder = catalogRoot?.querySelector<HTMLElement>('.catalog-search-placeholder') ?? null;
    const filterSweep = catalogRoot?.querySelector<HTMLElement>('.catalog-filter-sweep') ?? null;
    let activeCatalogId: CatalogScenarioId = 'restaurant';

    const getCatalogScenario = (id: CatalogScenarioId) => (
      catalogPreviewScenarios.find(scenario => scenario.id === id) ?? catalogPreviewScenarios[0]
    );

    const getCatalogSet = (id: CatalogScenarioId) => (
      catalogRoot?.querySelector<HTMLElement>(`[data-catalog-set="${id}"]`) ?? null
    );

    const getCatalogProgressCard = (id: CatalogScenarioId) => (
      catalogRoot?.querySelector<HTMLElement>(`[data-catalog-progress="${id}"]`) ?? null
    );

    const getActiveCatalogSet = () => getCatalogSet(activeCatalogId);

    const getActiveCatalogCards = () => {
      const activeSet = getActiveCatalogSet();
      return activeSet ? gsap.utils.toArray<HTMLElement>(activeSet.querySelectorAll('.catalog-preview-card')) : [];
    };

    const getActiveLockedCards = () => (
      getActiveCatalogCards().filter(card => card.classList.contains('is-locked') && !card.classList.contains('is-unlock-demo'))
    );

    const getActiveUnlockCard = () => (
      getActiveCatalogSet()?.querySelector<HTMLElement>('.catalog-preview-card.is-unlock-demo') ?? null
    );

    const resetCatalogCards = () => {
      catalogPreviewScenarios.forEach((scenario) => {
        const set = getCatalogSet(scenario.id);
        scenario.items.forEach((item) => {
          const card = set?.querySelector<HTMLElement>(`[data-catalog-card="${scenario.id}-${item.type}"]`);
          if (!card) return;
          card.classList.toggle('is-collected', item.collected);
          card.classList.toggle('is-locked', !item.collected);
          card.classList.remove('is-just-unlocked');
        });
      });
    };

    const setCatalogTab = (tab: CatalogScenarioId) => {
      catalogTabs.forEach((tabElement) => {
        tabElement.classList.toggle('is-active', tabElement.getAttribute('data-catalog-tab') === tab);
      });
    };

    const setCatalogUnlockDemo = (isUnlocked: boolean) => {
      const unlockCatalogCard = getActiveUnlockCard();
      if (!unlockCatalogCard) return;
      unlockCatalogCard.classList.toggle('is-locked', !isUnlocked);
      unlockCatalogCard.classList.toggle('is-collected', isUnlocked);
      unlockCatalogCard.classList.toggle('is-just-unlocked', isUnlocked);
    };

    const setCatalogScenario = (id: CatalogScenarioId, instant = false) => {
      activeCatalogId = id;
      const scenario = getCatalogScenario(id);
      const activeSet = getCatalogSet(id);
      const activeProgressCard = getCatalogProgressCard(id);
      const activeCards = activeSet
        ? gsap.utils.toArray<HTMLElement>(activeSet.querySelectorAll('.catalog-preview-card'))
        : [];
      setCatalogTab(id);
      resetCatalogCards();
      gsap.set(searchQuery, { textContent: scenario.query });
      gsap.set(searchPlaceholder, { autoAlpha: 0 });
      gsap.set(catalogSets, { autoAlpha: 0, y: 8, scale: 0.985 });
      gsap.set(catalogProgressCards, { autoAlpha: 0, y: 8, scale: 0.985 });
      gsap.set(activeSet, { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(activeProgressCard, { autoAlpha: 1, y: 0, scale: 1 });
      if (!instant && activeSet && activeProgressCard) {
        gsap.fromTo(
          [activeSet, activeProgressCard],
          { y: 10, autoAlpha: 0, scale: 0.985 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.28, stagger: 0.045, ease: 'power2.out' },
        );
        gsap.fromTo(
          activeCards,
          {
            y: 12,
            scale: 0.92,
            rotation: index => (index % 2 === 0 ? -1.6 : 1.6),
            autoAlpha: 0,
          },
          {
            y: 0,
            scale: 1,
            rotation: 0,
            autoAlpha: 1,
            duration: 0.34,
            stagger: { each: 0.045, from: 'center' },
            ease: 'back.out(1.35)',
          },
        );
      }
    };

    const resetCatalogDemo = () => {
      if (!catalogRoot) return;
      setCatalogScenario('restaurant', true);
      gsap.set(searchQuery, { textContent: '', autoAlpha: 1, y: 0 });
      gsap.set(searchPlaceholder, { autoAlpha: 1, y: 0 });
      gsap.set(filterSweep, { xPercent: -140, autoAlpha: 0 });
      gsap.set(searchPulse, { scaleX: 0.15, autoAlpha: 0 });
      catalogSets.forEach((set) => {
        gsap.set(set.querySelectorAll('.catalog-preview-card'), { clearProps: 'transform,opacity,visibility' });
      });
      catalogTabs.forEach(tabElement => {
        gsap.set(tabElement, { clearProps: 'transform' });
      });
    };

    storyChapters.forEach((chapter) => {
      const copyItems = chapter.querySelectorAll('.story-action-badge, .story-copy h2');
      const visual = chapter.querySelector('.story-visual');

      gsap.timeline({
        scrollTrigger: {
          trigger: chapter,
          start: 'top 82%',
          end: 'top 48%',
          toggleActions: 'play none none reverse',
        },
      })
        .fromTo(chapter, { opacity: 0.72, y: 18 }, { opacity: 1, y: 0, duration: 0.56, ease: 'power3.out' })
        .fromTo(copyItems, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.055, duration: 0.5, ease: 'power3.out' }, 0.08)
        .fromTo(chapter.querySelector('.story-action-glint'), { xPercent: -160, opacity: 0 }, { xPercent: 165, opacity: 0.72, duration: 0.74, ease: 'power2.inOut' }, 0.42)
        .fromTo(chapter.querySelector('.story-action-arrow'), { x: 0, y: 0 }, { x: 2, y: -2, duration: 0.22, repeat: 1, yoyo: true, ease: 'power2.out' }, 0.62)
        .fromTo(visual, { scale: 0.97, opacity: 0.72 }, { scale: 1, opacity: 1, duration: 0.58, ease: 'power3.out' }, 0.12);
    });

    if (catalogRoot && searchPulse && searchQuery && searchPlaceholder && filterSweep && catalogSets.length && catalogProgressCards.length) {
      resetCatalogDemo();

      const catalogLoop = gsap.timeline({
        repeat: -1,
        paused: true,
        repeatDelay: 0.12,
        defaults: { ease: 'power2.out' },
      });

      const animateActiveLockedCards = () => {
        gsap.to(getActiveLockedCards(), {
          autoAlpha: 0.5,
          y: 5,
          scale: 0.96,
          stagger: 0.045,
          duration: 0.28,
          ease: 'power2.out',
        });
      };

      const animateActiveUnlock = () => {
        const unlockCatalogCard = getActiveUnlockCard();
        const unlockState = unlockCatalogCard?.querySelector<HTMLElement>('.catalog-preview-state') ?? null;
        if (!unlockCatalogCard || !unlockState) return;
        gsap.timeline()
          .to(unlockCatalogCard, { y: -7, scale: 1.08, duration: 0.24, ease: 'power2.out' })
          .call(() => setCatalogUnlockDemo(true))
          .fromTo(
            unlockState,
            { scale: 0.2, rotate: -40 },
            { scale: 1, rotate: 0, duration: 0.34, ease: 'back.out(1.8)' },
          )
          .to(unlockCatalogCard, { y: 0, scale: 1, duration: 0.28, ease: 'power2.out' }, '<0.12');
      };

      catalogLoop
        .call(resetCatalogDemo)
        .to(searchPulse, { autoAlpha: 1, scaleX: 1, duration: 0.26, ease: 'power2.out' })
        .to(searchPlaceholder, { autoAlpha: 0, duration: 0.12 }, '+=0.08')
        .set(searchQuery, { textContent: '廚' })
        .set(searchQuery, { textContent: '廚師' }, '+=0.12')
        .set(searchQuery, { textContent: '廚師帽' }, '+=0.12')
        .to(searchPulse, { autoAlpha: 0, scaleX: 1.08, duration: 0.22 }, '<0.08')
        .fromTo(
          filterSweep,
          { xPercent: -140, autoAlpha: 0 },
          { xPercent: 210, autoAlpha: 0.62, duration: 0.58, ease: 'none' },
          '+=0.08',
        )
        .call(animateActiveLockedCards, [], '<0.1')
        .to({}, { duration: 0.34 })
        .call(() => setCatalogScenario('park'), [], '+=0.34')
        .to('[data-catalog-tab="park"]', { scale: 1.08, duration: 0.16, yoyo: true, repeat: 1 }, '<')
        .call(animateActiveLockedCards, [], '+=0.12')
        .to({}, { duration: 0.34 })
        .call(() => setCatalogScenario('station'), [], '+=0.32')
        .to('[data-catalog-tab="station"]', { scale: 1.08, duration: 0.16, yoyo: true, repeat: 1 }, '<')
        .call(animateActiveLockedCards, [], '+=0.12')
        .to({}, { duration: 0.34 })
        .call(() => setCatalogScenario('restaurant'), [], '+=0.32')
        .call(animateActiveUnlock, [], '+=0.18')
        .to({}, { duration: 0.86 })
        .to(getActiveCatalogCards(), { autoAlpha: 1, y: 0, scale: 1, stagger: 0.035, duration: 0.24 }, '+=0.12')
        .to([getCatalogSet('restaurant'), getCatalogProgressCard('restaurant')], { autoAlpha: 0.78, y: 4, scale: 0.992, duration: 0.34, ease: 'sine.inOut' }, '+=0.46')
        .to(getActiveCatalogCards(), { autoAlpha: 0.82, y: 3, scale: 0.99, stagger: { each: 0.025, from: 'edges' }, duration: 0.24, ease: 'sine.inOut' }, '<0.04')
        .to(searchQuery, { autoAlpha: 0, y: -3, duration: 0.18, ease: 'power2.in' }, '<0.04')
        .to(searchPlaceholder, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' }, '<0.08')
        .to(filterSweep, { xPercent: 230, autoAlpha: 0, duration: 0.2, ease: 'none' }, '<');

      const resetCatalogLoop = () => {
        catalogLoop.pause(0);
        resetCatalogDemo();
      };

      ScrollTrigger.create({
        trigger: catalogRoot,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => catalogLoop.restart(true),
        onEnterBack: () => catalogLoop.restart(true),
        onLeave: resetCatalogLoop,
        onLeaveBack: resetCatalogLoop,
      });
    }

    const mapRoot = homePage.value?.querySelector<HTMLElement>('.story-chapter-map') ?? null;

    if (mapRoot) {
      const resetMapDemo = () => {
        gsap.set('.map-osm-layer', { x: -8, y: 4, scale: 1.26 });
        gsap.set('.map-scan-note', { y: -8, autoAlpha: 0, scale: 0.96 });
        gsap.set('.map-scan-beam', { xPercent: -120, autoAlpha: 0 });
        gsap.set('.map-path-step', { y: 12, scale: 0.82, autoAlpha: 0.42 });
        gsap.set('.map-location-list', { y: 22, autoAlpha: 0, scale: 0.96 });
        gsap.set('.map-location-row', { x: -16, y: 0, scale: 1, autoAlpha: 0.62 });
        gsap.set('.map-found-label', { y: 10, autoAlpha: 0, scale: 0.94 });
        gsap.set('.map-purity-badge', { scale: 1, autoAlpha: 1 });
      };

      const mapTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      });

      const mapScanBeamLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        yoyo: true,
        defaults: { ease: 'sine.inOut' },
      });

      mapScanBeamLoop
        .fromTo('.map-scan-beam', { xPercent: -120, autoAlpha: 0.36 }, { xPercent: 155, autoAlpha: 0.76, duration: 1.45 })
        .to('.map-scan-beam', { autoAlpha: 0.44, duration: 0.32 }, '>-0.08');

      mapTimeline
        .call(resetMapDemo, [], 0)
        .to('.map-osm-layer', { x: 8, y: -4, scale: 1.18, duration: 1.8, ease: 'sine.inOut' }, 0)
        .to('.map-scan-note', { y: 0, autoAlpha: 1, scale: 1, duration: 0.28 }, 0.06)
        .to('.map-path-step', { y: 0, scale: 1, autoAlpha: 0.82, stagger: 0.08, duration: 0.36 }, 0.28)
        .to('.map-scan-note', { y: -10, autoAlpha: 0, scale: 0.96, duration: 0.28, ease: 'power2.in' }, 0.82)
        .to('.map-location-list', { y: 0, autoAlpha: 1, scale: 1, duration: 0.36, ease: 'power3.out' }, 0.58)
        .to('.map-location-row', { x: 0, autoAlpha: 0.9, stagger: 0.09, duration: 0.32 }, 0.68)
        .to('.map-location-row:not(.is-target), .map-path-step:not(.is-target)', { autoAlpha: 0.42, scale: 0.96, duration: 0.24 }, 1.08)
        .to('.map-location-row.is-target', { autoAlpha: 1, scale: 1.035, y: -2, duration: 0.28, ease: 'power3.out' }, 1.12)
        .to('.map-path-step.is-target', { autoAlpha: 1, scale: 1.18, y: -5, duration: 0.28, ease: 'back.out(1.3)' }, 1.14)
        .to('.map-found-label', { y: 0, autoAlpha: 1, scale: 1, duration: 0.26, ease: 'power3.out' }, 1.26)
        .to('.map-purity-badge', { scale: 1.1, duration: 0.16, yoyo: true, repeat: 1, ease: 'back.out(1.7)' }, 1.44)
        .to('.map-found-label', { scale: 1.035, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }, 1.58);

      const resetMapLoop = () => {
        mapTimeline.pause(0);
        mapScanBeamLoop.pause(0);
        resetMapDemo();
      };

      resetMapDemo();

      ScrollTrigger.create({
        trigger: mapRoot,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => {
          mapTimeline.restart(true);
          mapScanBeamLoop.restart(true);
        },
        onEnterBack: () => {
          mapTimeline.restart(true);
          mapScanBeamLoop.restart(true);
        },
        onLeave: resetMapLoop,
        onLeaveBack: resetMapLoop,
      });
    }

    const friendsRoot = homePage.value?.querySelector<HTMLElement>('.story-chapter-friends') ?? null;
    const friendInviteCard = friendsRoot?.querySelector<HTMLElement>('.friend-invite-card') ?? null;
    const friendAddButton = friendsRoot?.querySelector<HTMLElement>('.friend-add-button') ?? null;
    const friendCodeBadge = friendsRoot?.querySelector<HTMLElement>('.friend-code-badge') ?? null;
    const friendStreamTopRow = friendsRoot?.querySelector<HTMLElement>('.friend-stream-row-top') ?? null;
    const friendStreamBottomRow = friendsRoot?.querySelector<HTMLElement>('.friend-stream-row-bottom') ?? null;
    const friendStreamCards = friendsRoot
      ? gsap.utils.toArray<HTMLElement>(friendsRoot.querySelectorAll('.friend-stream-card'))
      : [];

    const resetFriendsDemo = () => {
      gsap.set(friendInviteCard, { y: 10, autoAlpha: 0.78, scale: 0.992 });
      gsap.set(friendCodeBadge, { scale: 0.98, autoAlpha: 0.9 });
      gsap.set(friendAddButton, { scale: 0.98, autoAlpha: 0.92 });
      gsap.set(friendStreamTopRow, { xPercent: 0, x: 0, autoAlpha: 0.86 });
      gsap.set(friendStreamBottomRow, { xPercent: -50, x: 0, autoAlpha: 0.86 });
      gsap.set(friendStreamCards, { autoAlpha: 0.84, scale: 0.98 });
    };

    if (
      friendsRoot
      && friendInviteCard
      && friendAddButton
      && friendCodeBadge
      && friendStreamTopRow
      && friendStreamBottomRow
      && friendStreamCards.length
    ) {
      resetFriendsDemo();

      const friendsEntrance = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
      });

      const friendsStreamLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        defaults: { ease: 'none' },
      });

      friendsStreamLoop
        .to(friendStreamTopRow, { xPercent: -50, duration: 22 }, 0)
        .fromTo(friendStreamBottomRow, { xPercent: -50 }, { xPercent: 0, duration: 24 }, 0);

      friendsEntrance
        .to(friendInviteCard, { y: 0, autoAlpha: 1, scale: 1, duration: 0.32, ease: 'power3.out' })
        .to(friendCodeBadge, { scale: 1.035, autoAlpha: 1, duration: 0.18, yoyo: true, repeat: 1 }, '+=0.08')
        .to(friendAddButton, { scale: 1.04, autoAlpha: 1, duration: 0.16, yoyo: true, repeat: 1 }, '<0.06')
        .to([friendStreamTopRow, friendStreamBottomRow], { autoAlpha: 1, duration: 0.3, ease: 'sine.out' }, '+=0.04')
        .to(friendStreamCards, { autoAlpha: 1, scale: 1, stagger: { each: 0.025, from: 'center' }, duration: 0.24 }, '<0.08');

      const resetFriendsLoop = () => {
        friendsEntrance.pause(0);
        friendsStreamLoop.pause(0);
        resetFriendsDemo();
      };

      ScrollTrigger.create({
        trigger: friendsRoot,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => {
          friendsEntrance.restart(true);
          friendsStreamLoop.restart(true);
        },
        onEnterBack: () => {
          friendsEntrance.restart(true);
          friendsStreamLoop.restart(true);
        },
        onLeave: resetFriendsLoop,
        onLeaveBack: resetFriendsLoop,
      });
    }

    const releaseTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.story-chapter-release',
        start: 'top 74%',
        end: 'top 28%',
        scrub: 0.75,
      },
    });

    releaseTimeline
      .fromTo('.release-duplicate-stack span', { x: -18, y: 18, opacity: 0, rotate: -4 }, { x: 0, y: 0, opacity: 1, rotate: 0, stagger: 0.06, duration: 0.24, ease: 'power2.out' })
      .to('.release-duplicate-stack span', { x: 48, y: -8, opacity: 0.18, scale: 0.82, stagger: 0.035, duration: 0.22, ease: 'power2.inOut' }, 0.34)
      .fromTo('.release-memory-card', { y: 18, scale: 0.94, opacity: 0.62 }, { y: 0, scale: 1, opacity: 1, duration: 0.28, ease: 'power3.out' }, 0.44)
      .fromTo('.release-soft-path', { scaleX: 0, transformOrigin: 'center' }, { scaleX: 1, duration: 0.22, ease: 'none' }, 0.56)
      .fromTo('.release-organize-label', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }, 0.64);

    const refreshStoryLayout = () => {
      moveStoryPill(activeStoryIndex.value, true);
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    };
    const resizeHandler = () => refreshStoryLayout();
    window.addEventListener('resize', resizeHandler, { passive: true });
    if (document.readyState !== 'complete') {
      window.addEventListener('load', refreshStoryLayout, { once: true });
    }
    homeResizeCleanup = () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('load', refreshStoryLayout);
    };
  }, homePage.value);
};

const cancelHomeMotionInit = () => {
  homeInitToken += 1;

  if (homeInitRetryTimer) {
    window.clearTimeout(homeInitRetryTimer);
    homeInitRetryTimer = null;
  }
};

const scheduleHomeScrollMotion = async (attempt = 0, token = ++homeInitToken) => {
  if (typeof window === 'undefined') return;

  await nextTick();
  await waitForFrame();
  await waitForFrame();
  await waitForFontLayout();

  if (token !== homeInitToken) return;

  if (!homePage.value) {
    if (attempt < 10) {
      homeInitRetryTimer = window.setTimeout(() => {
        void scheduleHomeScrollMotion(attempt + 1, token);
      }, 80);
    }
    return;
  }

  if (!isStoryNavLayoutReady() && attempt < 10) {
    homeInitRetryTimer = window.setTimeout(() => {
      void scheduleHomeScrollMotion(attempt + 1, token);
    }, 80);
    return;
  }

  initHomeScrollMotion();

  window.requestAnimationFrame(() => {
    if (token !== homeInitToken) return;
    moveStoryPill(activeStoryIndex.value, true);
    ScrollTrigger.refresh();
    ScrollTrigger.update();
  });
};

onMounted(async () => {
  await scheduleHomeScrollMotion();
});

onUnmounted(() => {
  cancelHomeMotionInit();

  if (storyNavPeekTimer) {
    window.clearTimeout(storyNavPeekTimer);
    storyNavPeekTimer = null;
  }
  homeResizeCleanup?.();
  homeResizeCleanup = null;
  homeMotionContext?.revert();
  homeMotionContext = null;
});
</script>

<style scoped>
.home-story-stack {
  display: flex;
  flex-direction: column;
}

.home-story-section {
  position: relative;
  scroll-margin-top: 6rem;
}

#story-home {
  order: 1;
}

#story-map {
  order: 2;
}

#story-catalog {
  order: 3;
}

#story-friends {
  order: 4;
}

#story-release {
  order: 5;
}

.story-chapter {
  display: grid;
  width: min(100% - 2.7rem, 34rem);
  min-height: 23rem;
  margin: 1.45rem auto 0;
  padding: 1.65rem;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.68);
  border-radius: 2.15rem;
  background:
    radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.62), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.48), rgba(218, 247, 229, 0.48)),
    rgba(236, 253, 245, 0.56);
  box-shadow:
    0 16px 30px rgba(15, 118, 88, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.82) inset;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.story-chapter.is-clickable {
  cursor: pointer;
  transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
}

.story-chapter.is-clickable:hover {
  border-color: rgba(16, 185, 129, 0.54);
  box-shadow:
    0 18px 34px rgba(15, 118, 88, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.86) inset;
  transform: translateY(-1px);
}

.story-chapter.is-clickable:focus-visible {
  outline: 3px solid rgba(0, 170, 136, 0.28);
  outline-offset: 4px;
}

.story-chapter-catalog {
  background:
    radial-gradient(circle at 88% 18%, rgba(255, 255, 255, 0.7), transparent 32%),
    linear-gradient(140deg, rgba(240, 253, 244, 0.8), rgba(220, 252, 231, 0.48));
}

.story-chapter-map {
  background:
    radial-gradient(circle at 72% 18%, rgba(167, 243, 208, 0.68), transparent 34%),
    linear-gradient(140deg, rgba(236, 253, 245, 0.76), rgba(187, 247, 208, 0.5));
}

.story-chapter-friends {
  background:
    radial-gradient(circle at 82% 20%, rgba(219, 234, 254, 0.65), transparent 35%),
    linear-gradient(140deg, rgba(240, 253, 244, 0.72), rgba(224, 242, 254, 0.46));
}

.story-chapter-release {
  margin-bottom: 7rem;
  background:
    radial-gradient(circle at 86% 22%, rgba(254, 243, 199, 0.54), transparent 36%),
    linear-gradient(140deg, rgba(240, 253, 244, 0.78), rgba(236, 253, 245, 0.52));
}

.story-copy {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 0.68rem;
  align-content: start;
  max-width: 28rem;
}

.story-action-badge {
  position: relative;
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  overflow: hidden;
  padding: 0.46rem 0.7rem 0.46rem 0.76rem;
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  box-shadow: 0 8px 15px rgba(15, 118, 88, 0.08);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  pointer-events: none;
  transition: background 220ms ease, box-shadow 220ms ease, transform 220ms ease;
}

.story-action-badge :deep(svg) {
  position: relative;
  z-index: 1;
  width: 1rem;
  height: 1rem;
}

.story-action-badge > span:not(.story-action-glint):not(.story-tap-hint) {
  position: relative;
  z-index: 1;
}

.story-action-glint {
  position: absolute;
  inset: -45% auto -45% 0;
  z-index: 0;
  width: 34%;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.86), transparent);
  filter: blur(5px);
  opacity: 0;
  pointer-events: none;
}

.story-action-arrow {
  opacity: 0.72;
  transition: opacity 220ms ease, transform 220ms ease;
}

.story-tap-hint {
  position: relative;
  z-index: 1;
  display: grid;
  width: 1.4rem;
  height: 1.4rem;
  place-items: center;
  margin-left: 0.04rem;
  color: #008c72;
}

.story-tap-hint::before {
  position: absolute;
  inset: 0.22rem;
  border: 1px solid rgba(0, 170, 136, 0.32);
  border-radius: 999px;
  content: '';
  animation: story-tap-ripple 2.2s ease-out infinite;
}

.story-tap-hint :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
  animation: story-tap-finger 2.2s ease-in-out infinite;
}

.story-copy h2 {
  color: #182231;
  font-size: clamp(1.52rem, 6.6vw, 2.2rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0;
}

.story-copy p {
  max-width: 28rem;
  color: #64748b;
  font-size: 0.98rem;
  font-weight: 750;
  line-height: 1.7;
}

.story-chapter.is-clickable:hover .story-action-badge {
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 22px rgba(0, 140, 114, 0.16);
  transform: translateY(-1px);
}

.story-chapter.is-clickable:hover .story-action-arrow {
  opacity: 1;
  transform: translate(2px, -2px);
}

@keyframes story-tap-finger {
  0%,
  58%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  68% {
    transform: translate(-2px, 2px) scale(0.88);
  }
  78% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes story-tap-ripple {
  0%,
  58% {
    opacity: 0;
    transform: scale(0.7);
  }
  68% {
    opacity: 0.55;
    transform: scale(0.86);
  }
  100% {
    opacity: 0;
    transform: scale(1.65);
  }
}

.story-visual {
  position: relative;
  z-index: 1;
  min-height: 11rem;
  margin-top: 1.35rem;
}

.catalog-browser,
.map-discovery,
.friends-visual,
.release-visual {
  position: relative;
  min-height: 12rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 1.65rem;
  background: rgba(255, 255, 255, 0.42);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.75) inset;
}

.catalog-browser {
  display: grid;
  gap: 0.8rem;
  padding: 0.9rem;
}

.catalog-toolbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.7rem;
  padding: 0 0.85rem;
  color: #64748b;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.74);
  font-weight: 850;
  isolation: isolate;
  transform-origin: center;
  transition: transform 220ms ease;
  will-change: transform;
}

.catalog-search-pulse {
  position: absolute;
  inset: 0;
  z-index: -1;
  border: 1px solid rgba(0, 170, 136, 0.2);
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(236, 253, 245, 0.18), rgba(255, 255, 255, 0.72), rgba(209, 250, 229, 0.26));
  opacity: 0;
  transform: scaleX(0.15);
  transform-origin: left center;
  will-change: transform, opacity;
}

.catalog-search-dot {
  flex: 0 0 auto;
  width: 0.85rem;
  height: 0.85rem;
  border: 3px solid #00aa88;
  border-radius: 999px;
}

.catalog-search-placeholder,
.catalog-search-query {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catalog-search-placeholder {
  color: #64748b;
}

.catalog-search-query {
  position: absolute;
  left: 2.25rem;
  color: #172033;
  font-weight: 950;
}

.catalog-category-row {
  display: flex;
  gap: 0.5rem;
  overflow: hidden;
}

.catalog-category-pill {
  padding: 0.38rem 0.75rem;
  color: #64748b;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
  font-size: 0.78rem;
  font-weight: 900;
  white-space: nowrap;
  transform-origin: center;
  will-change: transform;
}

.catalog-category-pill.is-active {
  color: #047857;
  background: rgba(209, 250, 229, 0.88);
}

.catalog-grid-preview {
  position: relative;
  min-height: 15.4rem;
  overflow: hidden;
  border-radius: 1.05rem;
}

.catalog-preview-set {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity;
}

.catalog-preview-set[data-catalog-set="restaurant"] {
  opacity: 1;
  visibility: visible;
}

.catalog-filter-sweep {
  position: absolute;
  inset: -10% auto -10% 0;
  z-index: 3;
  width: 28%;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.76), transparent);
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}

.catalog-preview-card {
  position: relative;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 7.45rem;
  align-items: stretch;
  justify-items: stretch;
  gap: 0.2rem;
  overflow: hidden;
  padding: 0.52rem 0.42rem 0.46rem;
  color: #64748b;
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.72);
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.05);
  font-weight: 950;
  transform-origin: center;
  will-change: transform, opacity;
}

.catalog-preview-card.is-collected {
  color: #064e3b;
  border-color: rgba(34, 197, 94, 0.36);
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.72), transparent 38%),
    rgba(220, 252, 231, 0.72);
}

.catalog-preview-card.is-locked {
  color: #94a3b8;
  background: rgba(248, 250, 252, 0.62);
}

.catalog-preview-card.is-just-unlocked {
  border-color: rgba(16, 185, 129, 0.72);
  box-shadow:
    0 0 0 2px rgba(16, 185, 129, 0.13),
    0 12px 22px rgba(16, 185, 129, 0.14);
}

.catalog-preview-image {
  position: relative;
  display: grid;
  width: 100%;
  min-width: 0;
  height: 5.35rem;
  place-items: center;
  overflow: hidden;
  border-radius: 0.9rem;
  background:
    radial-gradient(circle at 50% 74%, rgba(16, 185, 129, 0.14), transparent 40%),
    rgba(255, 255, 255, 0.5);
}

.catalog-preview-image img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 7px 7px rgba(15, 23, 42, 0.16));
  transition: filter 240ms ease, opacity 240ms ease, transform 240ms ease;
}

.catalog-preview-card.is-locked .catalog-preview-image img {
  filter: grayscale(72%) saturate(0.34) opacity(0.38);
}

.catalog-preview-state {
  position: absolute;
  top: 0.42rem;
  right: 0.42rem;
  display: grid;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  color: #94a3b8;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 5px 10px rgba(15, 23, 42, 0.07);
  font-size: 0.82rem;
  will-change: transform;
}

.catalog-preview-card.is-collected .catalog-preview-state {
  color: #047857;
}

.catalog-preview-check-icon {
  display: none;
}

.catalog-preview-card.is-collected .catalog-preview-lock-icon {
  display: none;
}

.catalog-preview-card.is-collected .catalog-preview-check-icon {
  display: block;
}

.catalog-preview-badge {
  position: relative;
  justify-self: end;
  align-self: end;
  z-index: 2;
  min-width: 1.42rem;
  padding: 0.12rem 0.34rem;
  text-align: center;
  border-radius: 0.48rem;
  background: rgba(255, 255, 255, 0.78);
  font-size: 0.78rem;
  line-height: 1.25;
}

.catalog-caret {
  width: 2px;
  height: 1rem;
  margin-left: auto;
  border-radius: 999px;
  background: rgba(0, 140, 114, 0.52);
}

.catalog-progress-stage {
  position: relative;
  min-height: 4.25rem;
  overflow: hidden;
  border-radius: 1.2rem;
}

.catalog-progress-card {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.72rem;
  padding: 0.62rem 0.74rem;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 1.18rem;
  background: rgba(255, 255, 255, 0.7);
  box-shadow:
    0 10px 18px rgba(15, 118, 88, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.82) inset;
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity;
}

.catalog-progress-card[data-catalog-progress="restaurant"] {
  opacity: 1;
  visibility: visible;
}

.catalog-progress-image,
.catalog-progress-gift {
  display: grid;
  place-items: center;
}

.catalog-progress-image {
  position: relative;
  width: 2.75rem;
  height: 2.75rem;
  overflow: hidden;
  border-radius: 0.9rem;
  background:
    radial-gradient(circle at 50% 76%, rgba(16, 185, 129, 0.18), transparent 42%),
    rgba(236, 253, 245, 0.92);
}

.catalog-progress-image img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 7px 8px rgba(15, 23, 42, 0.14));
}

.catalog-progress-copy {
  min-width: 0;
}

.catalog-progress-copy strong,
.catalog-progress-copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catalog-progress-copy strong {
  color: #172033;
  font-size: 0.88rem;
  font-weight: 950;
}

.catalog-progress-copy small {
  color: #008c72;
  font-size: 0.66rem;
  font-weight: 950;
}

.catalog-progress-bar {
  display: block;
  height: 0.32rem;
  margin-top: 0.24rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.14);
}

.catalog-progress-bar i {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #00aa88, #a3e635);
  transform-origin: left center;
}

.catalog-progress-gift {
  width: 2.45rem;
  height: 2.45rem;
  color: #f97316;
  border: 1px solid rgba(251, 146, 60, 0.24);
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.9);
  box-shadow: 0 8px 15px rgba(251, 146, 60, 0.1);
}

.catalog-progress-gift :deep(svg) {
  width: 1.08rem;
  height: 1.08rem;
}

.map-discovery {
  display: grid;
  min-height: 20.4rem;
  padding: 0.85rem;
  background:
    radial-gradient(circle at 88% 16%, rgba(255, 255, 255, 0.86), transparent 30%),
    radial-gradient(circle at 18% 82%, rgba(134, 239, 172, 0.28), transparent 30%),
    linear-gradient(135deg, rgba(240, 253, 244, 0.66), rgba(209, 250, 229, 0.46));
}

.map-scan-stage {
  position: relative;
  display: grid;
  gap: 0.72rem;
  min-height: 17.8rem;
  padding: 0;
  overflow: hidden;
  border-radius: 1.45rem;
  background:
    radial-gradient(circle at 80% 16%, rgba(255, 255, 255, 0.72), transparent 32%),
    linear-gradient(135deg, rgba(236, 253, 245, 0.58), rgba(209, 250, 229, 0.38));
}

.map-scan-note {
  position: absolute;
  top: 0.86rem;
  left: 0.86rem;
  z-index: 7;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.36rem 0.58rem;
  color: #007f68;
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 18px rgba(15, 118, 88, 0.1);
  font-size: 0.72rem;
  font-weight: 950;
  white-space: nowrap;
  will-change: transform, opacity;
}

.map-location-icon,
.map-path-step,
.map-target-preview {
  display: grid;
  place-items: center;
}

.map-scan-note :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
}

.map-location-row strong,
.map-location-row small {
  display: block;
  min-width: 0;
}

.map-scan-window {
  position: relative;
  min-height: 13.8rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 1.42rem;
  background: #d1fae5;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 12px 22px rgba(15, 118, 88, 0.08);
}

.map-scan-window::before,
.map-scan-window::after {
  position: absolute;
  inset: 0;
  content: '';
  pointer-events: none;
}

.map-scan-window::before {
  z-index: 2;
  background:
    linear-gradient(84deg, transparent 0 18%, rgba(255, 255, 255, 0.84) 18% 20%, transparent 20% 100%),
    linear-gradient(96deg, transparent 0 42%, rgba(255, 255, 255, 0.78) 42% 44%, transparent 44% 100%),
    linear-gradient(12deg, transparent 0 34%, rgba(255, 255, 255, 0.86) 34% 37%, transparent 37% 100%),
    linear-gradient(-11deg, transparent 0 61%, rgba(255, 255, 255, 0.74) 61% 64%, transparent 64% 100%),
    linear-gradient(0deg, transparent 0 30%, rgba(255, 255, 255, 0.76) 30% 32%, transparent 32% 100%),
    linear-gradient(0deg, transparent 0 70%, rgba(255, 255, 255, 0.7) 70% 72%, transparent 72% 100%);
  opacity: 0.9;
}

.map-scan-window::after {
  z-index: 3;
  background:
    radial-gradient(circle at 50% 55%, transparent 0 22%, rgba(255, 255, 255, 0.34) 22% 23%, transparent 23% 42%),
    radial-gradient(circle at 88% 88%, rgba(125, 211, 252, 0.34), transparent 18%),
    linear-gradient(135deg, rgba(236, 253, 245, 0.46), rgba(209, 250, 229, 0.28));
}

.map-osm-layer,
.map-osm-tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.map-osm-layer {
  z-index: 0;
  background:
    url('https://tile.openstreetmap.org/16/54889/28055.png') center / cover no-repeat;
  opacity: 0.26;
  filter: saturate(0.35) contrast(0.84) brightness(1.18);
  transform: scale(1.28);
}

.map-osm-tint {
  z-index: 1;
  background:
    radial-gradient(circle at 52% 52%, rgba(255, 255, 255, 0.42), transparent 31%),
    radial-gradient(circle at 88% 18%, rgba(236, 253, 245, 0.76), transparent 26%),
    linear-gradient(135deg, rgba(220, 252, 231, 0.82), rgba(0, 170, 136, 0.18));
}

.map-osm-attribution {
  position: absolute;
  right: 0.42rem;
  bottom: 0.32rem;
  z-index: 4;
  color: rgba(15, 118, 88, 0.62);
  font-size: 0.48rem;
  font-weight: 800;
  pointer-events: none;
}

.map-scan-beam {
  position: absolute;
  inset: -18% auto -18% 0;
  z-index: 4;
  width: 38%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.84), rgba(52, 211, 153, 0.2), transparent);
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}

.map-path-step {
  position: absolute;
  z-index: 5;
  width: 2.75rem;
  height: 2.75rem;
  color: #008c72;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 10px 18px rgba(15, 118, 88, 0.11);
  font-size: 1.2rem;
}

.map-path-step-a {
  top: 6.15rem;
  left: 3.8rem;
}

.map-path-step-b {
  bottom: 1.7rem;
  left: 1.8rem;
}

.map-path-step-c {
  top: calc(50% - 1.58rem);
  left: calc(51% - 1.58rem);
  width: 3.35rem;
  height: 3.35rem;
  color: #fff;
  border-radius: 1.08rem;
  background: linear-gradient(135deg, #00aa88, #00c853);
  box-shadow: 0 14px 22px rgba(0, 170, 136, 0.22);
}

.map-path-step-c::after {
  position: absolute;
  bottom: -0.32rem;
  left: 50%;
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 0 0 0.18rem 0;
  background: #00b876;
  content: '';
  transform: translateX(-50%) rotate(45deg);
}

.map-found-label {
  position: absolute;
  z-index: 6;
  top: calc(50% - 2.65rem);
  left: calc(51% + 1.4rem);
  padding: 0.48rem 0.78rem;
  color: #047857;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 18px rgba(15, 118, 88, 0.12);
  font-size: 0.88rem;
  font-weight: 950;
  opacity: 0;
  white-space: nowrap;
  will-change: transform, opacity;
}

.map-found-label::before {
  position: absolute;
  left: 0.3rem;
  bottom: -0.2rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 0 0 0.18rem 0;
  background: rgba(255, 255, 255, 0.88);
  content: '';
  transform: rotate(45deg);
}

.map-location-list {
  position: relative;
  z-index: 9;
  display: grid;
  gap: 0.44rem;
  width: calc(100% - 1rem);
  margin: -2.1rem auto 0;
  padding: 0.52rem;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 1.22rem;
  background: rgba(255, 255, 255, 0.68);
  box-shadow:
    0 16px 28px rgba(15, 118, 88, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.84) inset;
}

.map-location-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.52rem;
  padding: 0.48rem 0.52rem;
  border: 1px solid transparent;
  border-radius: 0.92rem;
  background: rgba(255, 255, 255, 0.46);
  box-shadow: 0 7px 14px rgba(15, 118, 88, 0.04);
}

.map-location-row.is-target {
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  border-color: rgba(0, 170, 136, 0.2);
  background: rgba(236, 253, 245, 0.9);
  box-shadow: 0 10px 18px rgba(15, 118, 88, 0.08);
}

.map-location-icon {
  width: 1.85rem;
  height: 1.85rem;
  color: #008c72;
  border-radius: 0.72rem;
  background: rgba(255, 255, 255, 0.72);
}

.map-location-row strong {
  overflow: hidden;
  color: #182231;
  font-size: 0.76rem;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-location-row small {
  overflow: hidden;
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-location-row b {
  color: #008c72;
  font-size: 0.78rem;
  font-weight: 950;
  text-align: right;
  white-space: nowrap;
}

.map-purity-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
  padding: 0.2rem 0.5rem 0.22rem;
  overflow: hidden;
  color: #007a66 !important;
  border: 1px solid rgba(16, 185, 129, 0.34);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(209, 250, 229, 0.9)),
    rgba(236, 253, 245, 0.94);
  box-shadow:
    0 8px 16px rgba(15, 118, 88, 0.13),
    0 0 0 3px rgba(16, 185, 129, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
  isolation: isolate;
  will-change: transform, opacity;
}

.map-purity-badge::after {
  position: absolute;
  inset: 0.08rem;
  border-radius: inherit;
  background:
    radial-gradient(circle at 28% 28%, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(105deg, transparent 0 38%, rgba(255, 255, 255, 0.82) 46%, transparent 56% 100%);
  content: '';
  opacity: 0.72;
  transform: translateX(-24%);
  pointer-events: none;
  z-index: -1;
}

.map-target-preview {
  position: relative;
  width: 2.35rem;
  height: 2.35rem;
  overflow: hidden;
  border-radius: 0.78rem;
  background:
    radial-gradient(circle at 50% 72%, rgba(16, 185, 129, 0.16), transparent 42%),
    #dcfce7;
}

.map-target-preview img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 7px 8px rgba(15, 23, 42, 0.18));
}

.friends-visual {
  display: grid;
  align-content: start;
  gap: 0.72rem;
  min-height: 17.6rem;
  padding: 0.9rem;
}

.friend-invite-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.62rem 0.75rem;
  padding: 0.82rem 0.86rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow:
    0 12px 22px rgba(15, 118, 88, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.86) inset;
  will-change: transform, opacity;
}

.friend-invite-name,
.friend-stream-card div {
  min-width: 0;
}

.friend-invite-name strong,
.friend-invite-name small,
.friend-stream-card strong,
.friend-stream-card small {
  display: block;
}

.friend-invite-name strong {
  overflow: hidden;
  color: #172033;
  font-size: 0.96rem;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-invite-name small {
  color: #7a8799;
  font-size: 0.78rem;
  font-weight: 850;
}

.friend-code-badge {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 0.38rem;
  min-width: 0;
  max-width: 100%;
  padding: 0.38rem 0.58rem;
  color: #008c72;
  border: 1px solid rgba(16, 185, 129, 0.24);
  border-radius: 0.86rem;
  background: rgba(236, 253, 245, 0.82);
  box-shadow: 0 7px 12px rgba(15, 118, 88, 0.06);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  white-space: nowrap;
  will-change: transform, opacity;
}

.friend-code-badge :deep(svg) {
  width: 0.88rem;
  height: 0.88rem;
  flex: 0 0 auto;
}

.friend-wish-row {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  padding-right: 5.8rem;
}

.friend-wish-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  font-size: 0.66rem;
  font-weight: 950;
  white-space: nowrap;
}

.friend-wish-chip.is-region {
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.24);
  box-shadow: 0 6px 12px rgba(15, 118, 88, 0.06);
}

.friend-wish-chip.is-postcard {
  color: #2563eb;
  border: 1px solid rgba(96, 165, 250, 0.28);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.06);
}

.friend-add-button {
  position: absolute;
  right: 0.7rem;
  bottom: 0.72rem;
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.38rem 0.58rem;
  overflow: hidden;
  color: #fff;
  border-radius: 999px;
  background: linear-gradient(135deg, #00aa88, #00c853);
  box-shadow: 0 10px 18px rgba(0, 170, 136, 0.22);
  font-size: 0.68rem;
  font-weight: 950;
  pointer-events: none;
  transform-origin: center;
  will-change: transform, opacity;
}

.friend-add-button :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
}

.friend-add-check {
  display: block;
}

.friend-stream-stage {
  position: relative;
  display: grid;
  gap: 0.56rem;
  min-height: 11.4rem;
  padding: 0.58rem 0;
  overflow: hidden;
}

.friend-stream-stage::before {
  position: absolute;
  inset: 0.18rem 0.35rem auto;
  height: 5.9rem;
  border: 1px solid rgba(255, 255, 255, 0.64);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at 76% 16%, rgba(224, 242, 254, 0.4), transparent 38%),
    rgba(255, 255, 255, 0.38);
  box-shadow: 0 12px 22px rgba(15, 118, 88, 0.06);
  content: '';
  pointer-events: none;
}

.friend-stream-row {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0;
  width: max-content;
  will-change: transform;
}

.friend-stream-row-bottom {
  justify-self: end;
}

.friend-stream-card {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: auto minmax(5.6rem, 1fr) auto;
  align-items: center;
  gap: 0.48rem;
  width: 13.4rem;
  margin-right: 0.48rem;
  padding: 0.5rem 0.58rem;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 16px rgba(15, 118, 88, 0.06);
  will-change: transform, opacity;
}

.friend-stream-card.is-compact {
  width: 12.4rem;
}

.friend-stream-card.is-wide {
  width: 14.15rem;
}

.friend-stream-card.is-mid {
  width: 12.85rem;
}

.friend-stream-avatar {
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #00aa88, #22c55e);
  font-weight: 950;
}

.friend-stream-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.74rem;
  font-size: 0.82rem;
}

.friend-stream-card.is-compact .friend-stream-avatar {
  background: linear-gradient(135deg, #14b8a6, #22c55e);
}

.friend-stream-card.is-wide .friend-stream-avatar {
  background: linear-gradient(135deg, #10b981, #84cc16);
}

.friend-stream-card.is-mid .friend-stream-avatar {
  background: linear-gradient(135deg, #0ea5e9, #10b981);
}

.friend-stream-card strong {
  overflow: hidden;
  color: #172033;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-stream-card strong {
  font-size: 0.74rem;
}

.friend-stream-card small {
  overflow: hidden;
  color: #64748b;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-stream-card small {
  font-size: 0.62rem;
}

.friend-stream-tag {
  padding: 0.22rem 0.38rem;
  color: #047857;
  border-radius: 999px;
  background: rgba(220, 252, 231, 0.82);
  font-size: 0.58rem;
  font-weight: 950;
  white-space: nowrap;
}

.friend-stream-card.is-compact .friend-stream-tag {
  color: #2563eb;
  background: rgba(219, 234, 254, 0.86);
}

.friend-stream-card.is-wide .friend-stream-tag,
.friend-stream-card.is-mid .friend-stream-tag {
  color: #c2410c;
  background: rgba(255, 237, 213, 0.88);
}

.release-visual {
  display: grid;
  place-items: center;
  padding: 1rem;
}

.release-duplicate-stack {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
  display: grid;
  gap: 0.35rem;
}

.release-duplicate-stack span {
  display: inline-flex;
  width: fit-content;
  padding: 0.34rem 0.72rem;
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 16px rgba(15, 118, 88, 0.08);
  font-size: 0.78rem;
  font-weight: 900;
}

.release-memory-card {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 4.8rem minmax(0, 1fr);
  gap: 0.9rem;
  width: 100%;
  align-items: center;
  padding: 0.9rem;
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 14px 24px rgba(15, 118, 88, 0.12);
}

.release-pikmin-portrait {
  display: grid;
  height: 5.8rem;
  place-items: center;
  color: #047857;
  border-radius: 1.15rem;
  background: linear-gradient(180deg, #dcfce7, #a7f3d0);
  font-size: 2rem;
}

.release-memory-copy {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.release-memory-copy strong {
  color: #172033;
  font-size: 1.25rem;
  font-weight: 950;
}

.release-memory-copy span,
.release-memory-copy small {
  overflow: hidden;
  color: #64748b;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.release-soft-path {
  position: absolute;
  width: 76%;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.34), transparent);
  transform: translateY(4.8rem);
}

.release-organize-label {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.45rem 0.75rem;
  color: #047857;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 8px 16px rgba(15, 118, 88, 0.1);
  font-size: 0.78rem;
  font-weight: 900;
  opacity: 0;
}

.home-story-sign {
  position: fixed;
  top: 50%;
  left: 0;
  z-index: 44;
  display: flex;
  align-items: center;
  min-width: 4.8rem;
  height: 2.35rem;
  padding: 0 0.86rem 0 1.05rem;
  color: #047857;
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-left: 0;
  border-radius: 0 999px 999px 0;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 14px rgba(15, 118, 88, 0.1);
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  opacity: 0;
  pointer-events: none;
  transform: translate(-102%, -50%);
  transition: opacity 240ms ease, transform 340ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}

.home-story-sign span {
  display: block;
  -webkit-font-smoothing: antialiased;
  transform: translateZ(0);
}

.home-story-sign::after {
  width: 0.42rem;
  height: 0.42rem;
  margin-left: 0.48rem;
  border-radius: 999px;
  background: #00aa88;
  box-shadow: 0 0 0 0.22rem rgba(0, 170, 136, 0.12);
  content: '';
}

.home-story-sign.is-peeking {
  opacity: 1;
  transform: translate(0, -50%);
}

.home-story-nav {
  position: fixed;
  top: 50%;
  right: max(0rem, env(safe-area-inset-right));
  z-index: 45;
  display: grid;
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 0.08rem;
  width: 2.5rem;
  padding: 0.2rem 0.18rem;
  border: 0;
  border-radius: 999px 0 0 999px;
  background: transparent;
  box-shadow: none;
  opacity: 0.58;
  transform: translate(1.3rem, -50%);
  transition: opacity 260ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-story-nav::before {
  position: absolute;
  top: 0.72rem;
  right: 0.72rem;
  bottom: 0.72rem;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, transparent, rgba(0, 140, 114, 0.34), transparent);
  content: '';
}

.home-story-nav.is-peeking,
.home-story-nav:hover,
.home-story-nav:focus-within {
  opacity: 1;
  transform: translate(0, -50%);
}

.home-story-nav-pill {
  position: absolute;
  top: 0;
  left: 0;
  width: 1.72rem;
  height: 1.72rem;
  border: 2px solid rgba(255, 255, 255, 0.82);
  border-radius: 999px;
  background: linear-gradient(135deg, #00aa88, #00c853);
  box-shadow: 0 5px 10px rgba(0, 170, 136, 0.18);
  pointer-events: none;
}

.home-story-nav-pill::before,
.home-story-nav-pill::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.22rem;
  height: 0.22rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  content: '';
  opacity: 0;
  transform: translate(-50%, -50%);
}

.home-story-nav.is-peeking .home-story-nav-pill::before {
  animation: story-dot-spark-a 720ms ease-out both;
}

.home-story-nav.is-peeking .home-story-nav-pill::after {
  animation: story-dot-spark-b 720ms 80ms ease-out both;
}

.home-story-nav-item {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  min-height: 2.22rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  color: rgba(15, 118, 110, 0.56);
  border-radius: 1.05rem;
  font-size: 0.58rem;
  font-weight: 900;
  transition: color 220ms ease, opacity 220ms ease, transform 220ms ease;
}

.home-story-nav-item :deep(svg) {
  width: 0.92rem;
  height: 0.92rem;
}

.home-story-nav-item span {
  display: none;
}

.home-story-nav-item.is-active {
  color: #fff;
  transform: scale(1.04);
}

@keyframes story-dot-spark-a {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }
  32% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate(-1.15rem, -1rem) scale(1);
  }
}

@keyframes story-dot-spark-b {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }
  32% {
    opacity: 0.75;
  }
  100% {
    opacity: 0;
    transform: translate(-1rem, 0.9rem) scale(0.9);
  }
}

@media (max-width: 767px) {
  .story-chapter {
    min-height: 24rem;
    padding: 1.35rem;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  .story-copy {
    gap: 0.68rem;
  }

  .home-story-nav {
    top: 58%;
  }
}

@media (min-width: 768px) {
  .story-chapter {
    grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr);
    align-items: center;
    width: min(100% - 3rem, 72rem);
    min-height: 25rem;
    margin: 2rem auto 0;
    padding: 2rem;
    gap: 2rem;
  }

  .story-visual {
    margin-top: 0;
  }

  .story-chapter-release {
    margin-bottom: 8rem;
  }

  .home-story-nav {
    right: max(0.35rem, env(safe-area-inset-right));
    width: 2.85rem;
    padding: 0.24rem 0.2rem;
    transform: translate(1.1rem, -50%);
  }

  .home-story-nav-item {
    min-height: 2.5rem;
    font-size: 0.64rem;
  }

  .home-story-nav-item :deep(svg) {
    width: 1.18rem;
    height: 1.18rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .story-chapter,
  .story-visual,
  .home-story-nav-pill,
  .home-story-nav-pill::before,
  .home-story-nav-pill::after,
  .home-story-sign,
  .story-action-badge,
  .story-action-arrow,
  .story-tap-hint::before,
  .story-tap-hint :deep(svg),
  .home-story-nav-item,
  .home-story-nav-item span {
    animation: none;
    transition: none;
  }

  .map-scan-beam,
  .map-path-step,
  .map-found-label,
  .map-location-list,
  .map-purity-badge {
    opacity: 1;
    transform: none;
  }

  .map-purity-badge::after {
    transform: none;
  }

  .catalog-progress-card,
  .release-organize-label {
    opacity: 1;
  }

  .catalog-progress-bar i,
  .release-soft-path {
    transform: scaleX(1);
  }
}
</style>
