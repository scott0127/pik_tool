<template>
  <section ref="panelEl" class="collection-inventory-panel" :class="{ 'is-expanded': isExpanded }">
    <div class="inventory-entry">
      <div class="inventory-panel-header">
        <div class="inventory-panel-copy">
          <p class="inventory-panel-kicker">{{ copy.journal }}</p>
          <h3 class="inventory-panel-title">{{ summary.hasRareDecor ? copy.title : copy.inventory }}</h3>
          <p class="inventory-panel-description">{{ summary.hasRareDecor ? copy.description : copy.inventoryDescription }}</p>
        </div>
        <CollectionToolMotion kind="journal" :active="!isExpanded" class="inventory-journal-motion" />
      </div>
      <p v-if="summary.hasRareDecor" class="inventory-summary-score"><span>Lv. <strong>{{ rareProgress.level }}</strong></span><span class="inventory-summary-divider" aria-hidden="true" /> <span><strong>{{ number(rareProgress.points) }}</strong> pt</span></p>
      <div class="inventory-entry-actions">
        <button type="button" class="inventory-action-button inventory-action-button-primary" :aria-expanded="isExpanded" :aria-controls="bodyId" @click.stop="isExpanded = !isExpanded">
          <CollectionParticleBorder :active="!isExpanded" on-dark />
          <span>{{ isExpanded ? copy.collapse : hasRecords ? copy.update : copy.start }}</span><span class="inventory-action-knob"><Icon :name="isExpanded ? 'lucide:chevron-up' : hasRecords ? 'lucide:arrow-down-right' : 'lucide:plus'" class="w-4 h-4" /></span>
        </button>
        <CollectionGuideButton topic="inventory" @start="isExpanded = true" />
      </div>
      <dl v-if="!isExpanded" class="inventory-summary-grid">
        <div><dt>{{ labels.seedlingShort }}</dt><dd>{{ summary.seedlingCount }}</dd></div>
        <div><dt>{{ labels.preDecorShort }}</dt><dd>{{ summary.preDecorCount }}</dd></div>
        <div><dt>{{ copy.decorSummary }}</dt><dd>{{ summary.decorCount }}</dd></div>
        <div><dt>{{ labels.releaseLine }}</dt><dd>{{ summary.releaseNoDecorCount }} <span>/</span> {{ summary.releaseWithDecorCount }}</dd></div>
      </dl>
      <p v-if="!isExpanded" class="inventory-entry-note">{{ hasRecords ? copy.releaseLegend : copy.emptyHint }}</p>
    </div>
    <Transition :css="false" @enter="enterPaper" @leave="leavePaper" @enter-cancelled="cancelPaper" @leave-cancelled="cancelPaper">
      <div v-if="isExpanded" :id="bodyId" class="inventory-panel-body">
        <div v-if="summary.hasRareDecor" class="rare-progress-panel">
          <div class="rare-progress-main">
            <div><p class="rare-progress-title">{{ labels.rarePoints }}</p><p class="rare-progress-level">Lv. <strong>{{ rareProgress.level }}</strong></p></div>
            <div class="rare-progress-score"><strong class="inventory-score-number">{{ number(rareProgress.points) }}</strong><span>pt</span><span class="inventory-score-delta" :class="{ 'is-negative': lastPointsDelta < 0 }" aria-hidden="true">{{ lastPointsDelta > 0 ? '+' : '' }}{{ lastPointsDelta }} pt</span></div>
          </div>
          <div class="rare-progress-track" role="progressbar" :aria-label="labels.rarePoints" :aria-valuenow="Math.round(rareProgressPercent)" aria-valuemin="0" aria-valuemax="100">
            <span class="rare-progress-track-fill" :style="rareProgressBarStyle" />
          </div>
          <div class="rare-progress-meta">
            <span v-if="!rareProgress.isCategoryComplete">{{ labels.completeRegularFirst }}</span>
            <span v-else-if="rareProgress.pointsToNextRareLevel !== null">{{ labels.nextLevel }} <strong>{{ number(rareProgress.pointsToNextRareLevel) }}</strong> pt</span>
            <span v-else>{{ labels.maxLevel }}</span>
            <button type="button" class="rare-score-toggle" :aria-expanded="showScoreRules" :aria-controls="rulesId" @click.stop="showScoreRules = !showScoreRules">{{ showScoreRules ? labels.hideScoreRules : copy.rules }}<span aria-hidden="true">{{ showScoreRules ? '−' : '+' }}</span></button>
          </div>
          <Transition :css="false" @enter="enterPaper" @leave="leavePaper" @enter-cancelled="cancelPaper" @leave-cancelled="cancelPaper">
            <dl v-if="showScoreRules" :id="rulesId" class="rare-rule-grid">
              <div v-for="rule in scoreRules" :key="rule.id"><dt>{{ rule.label }}</dt><dd>+{{ rule.points }} <small>pt</small></dd></div>
            </dl>
          </Transition>
        </div>
        <div v-if="rows.length" class="inventory-editor">
          <div class="inventory-editor-heading">
            <label v-if="rows.length > 1" :for="variantSelectId">{{ copy.series }}</label>
            <h3 v-else>{{ locale === 'en' ? activeRow?.variantNameEn : activeRow?.variantName }}</h3>
            <select v-if="rows.length > 1" :id="variantSelectId" v-model="selectedVariant" class="inventory-variant-select">
              <option v-for="row in rows" :key="row.variantId" :value="row.variantId">{{ locale === 'en' ? row.variantNameEn : row.variantName }}</option>
            </select>
          </div>
          <p class="inventory-color-hint">{{ copy.chooseColor }}</p>
          <div class="inventory-color-tabs" role="group" :aria-label="copy.chooseColor">
            <button v-for="item in activeRow?.items" :key="item.id" type="button" :aria-pressed="activeItem?.id === item.id" class="inventory-color-tab" :class="{ 'is-active': activeItem?.id === item.id }" @click.stop="selectColor(item.id)">
              <span class="inventory-pikmin-dot" :class="pikminBadgeClass(item.pikminType)" aria-hidden="true" />
              <span>{{ t('pikmin_types_short.' + item.pikminType) }}</span><small>{{ getItemRecordTotal(item) }}</small>
            </button>
          </div>
          <div v-if="activeItem" class="inventory-selected-sheet">
            <div class="inventory-selected-heading">
              <img v-if="activeImage && !imageFailed" :src="activeImage" alt="" class="inventory-selected-image" loading="lazy" decoding="async" referrerpolicy="no-referrer" @error="imageFailed = true" />
              <div><small>{{ copy.editing }}</small><h4>{{ t('pikmin_types.' + activeItem.pikminType) }}</h4></div>
              <span class="inventory-item-total">{{ labels.recordTotal }} <strong>{{ getItemRecordTotal(activeItem) }}</strong></span>
            </div>
            <div class="inventory-control-stack">
              <div v-for="(control, index) in allControls" :key="control.id" class="inventory-control-row" :class="{ 'is-release': index === primaryControls.length }">
                <div class="inventory-control-copy"><span class="inventory-control-index">{{ String(index + 1).padStart(2, '0') }}</span><span><span class="inventory-control-label">{{ control.shortLabel || control.label }}</span><small class="inventory-control-description">{{ control.description }}</small></span><span class="inventory-control-score">{{ control.scoreText }}</span></div>
                <div class="inventory-control-stepper" role="group" :aria-label="`${t('pikmin_types.' + activeItem.pikminType)} · ${control.label}`">
                  <button type="button" class="inventory-stepper-hit inventory-stepper-minus" :aria-label="`${labels.decrease} ${control.label}`" :disabled="getBucketCount(activeItem.id, control.id) === 0" @click.stop="adjust(activeItem.id, control.id, -1, $event)"><span aria-hidden="true">−</span></button>
                  <strong class="inventory-stepper-value">{{ getBucketCount(activeItem.id, control.id) }}</strong>
                  <button type="button" class="inventory-stepper-hit inventory-stepper-plus" :aria-label="`${labels.increase} ${control.label}`" @click.stop="adjust(activeItem.id, control.id, 1, $event)"><span aria-hidden="true">+</span></button>
                </div>
              </div>
            </div>
            <p class="inventory-save-note">{{ copy.saved }}</p>
            <p class="sr-only" role="status" aria-live="polite">{{ feedbackText }}</p>
          </div>
        </div>
        <div class="inventory-event-log">
          <button type="button" class="inventory-event-log-toggle" :aria-expanded="showRecentEvents" :aria-controls="eventsId" @click.stop="showRecentEvents = !showRecentEvents"><span>{{ labels.recentEvents }}</span><span>{{ recentEvents.length }} {{ labels.eventCountUnit }} <span aria-hidden="true">{{ showRecentEvents ? '−' : '+' }}</span></span></button>
          <Transition :css="false" @enter="enterPaper" @leave="leavePaper" @enter-cancelled="cancelPaper" @leave-cancelled="cancelPaper">
            <div v-if="showRecentEvents" :id="eventsId" class="inventory-event-log-body">
              <ol v-if="recentEvents.length"><li v-for="event in recentEvents" :key="event.id"><span>{{ formatEvent(event) }}</span><time>{{ formatEventTime(event.createdAt) }}</time></li></ol>
              <p v-else>{{ labels.noEvents }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { PIKMIN_TYPE_COLORS, type CollectionEvent, type CollectionInventoryBucket, type DecorItem, type PikminType } from '~/types/decor';
const props = defineProps<{ categoryId: string }>();
const { t, locale } = useI18n();
const { getItemsByCategory, getVariant, getImageUrl } = useDecorData();
const { adjustInventory, getInventoryItem, getCategoryInventorySummary, getRareProgress, getRecentCollectionEvents, rarePointValues } = useCollection();
const isExpanded = ref(false);
const showScoreRules = ref(false);
const showRecentEvents = ref(false);
const panelEl = ref<HTMLElement | null>(null);
const selectedVariant = ref('');
const selectedItemId = ref('');
const imageFailed = ref(false);
const lastPointsDelta = ref(0);
const feedbackText = ref('');
const instanceId = useId();
const bodyId = `inventory-body-${instanceId}`;
const rulesId = `inventory-rules-${instanceId}`;
const eventsId = `inventory-events-${instanceId}`;
const variantSelectId = `inventory-variant-${instanceId}`;
type InventoryControlTone = 'seedling' | 'preDecor' | 'decor' | 'rare' | 'releaseNoDecor' | 'releaseWithDecor';
interface InventoryControl { id: CollectionInventoryBucket; label: string; shortLabel?: string; icon: string; tone: InventoryControlTone; scoreText?: string; }
const labels = computed(() => {
  if (locale.value === 'en') {
    return {
      level: 'Level',
      seedling: 'Small seedlings',
      preDecor: 'Small seedling plucked, <4 hearts',
      decor: 'Huge seedling / 4-heart decor',
      rare: 'Rare upgraded',
      seedlingShort: 'Seedling',
      preDecorShort: '<4 hearts',
      decorShort: 'Get decor',
      rareShort: 'Rare',
      releaseSummary: 'Released none/decor',
      manage: 'Manage',
      close: 'Close',
      rarePoints: 'Rare Decor Points',
      scoreRules: 'Rare Decor Point rules',
      scoreQuestion: 'Scoring?',
      hideScoreRules: 'Hide rules',
      currentScore: 'Current',
      nextLevel: 'To next Lv.',
      completeRegularFirst: 'Complete regular decor first',
      maxLevel: 'Max tracked',
      recentEvents: 'Recent trace',
      noEvents: 'No trace events yet',
      eventCountUnit: 'records',
      pluckSeedling: 'Pluck small seedling',
      pluckHugeSeedling: 'Pluck huge seedling',
      giftExpedition: '4-heart gift expedition',
      decorSource: 'Huge seedling or gift',
      releaseLine: 'Released',
      releaseNoDecor: 'Released without decor',
      releaseWithDecor: 'Released with decor',
      releaseNoDecorShort: 'Release plain',
      releaseWithDecorShort: 'Release decor',
      inventoryOnly: 'Inventory',
      noScore: 'No score',
      recordTotal: 'Records',
      decrease: 'Decrease',
      increase: 'Increase',
      autoCollapsed: 'Auto-collapsed',
      expandColor: 'Expand',
    };
  }

  return {
    level: '等級',
    seedling: '小盆栽',
    preDecor: '小盆栽拔苗未滿4心',
    decor: '大盆栽拔苗/滿4心拿裝飾品',
    rare: '已升稀有',
    seedlingShort: '小盆栽',
    preDecorShort: '未滿4心',
    decorShort: '拿裝飾(含大盆)',
    rareShort: '已升稀有',
    releaseSummary: '放生 無/有裝飾',
    manage: '管理',
    close: '收合',
    rarePoints: '稀有裝飾點數',
    scoreRules: '稀有裝飾點數規則',
    scoreQuestion: '計分？',
    hideScoreRules: '收合規則',
    currentScore: '目前',
    nextLevel: '距下級',
    completeRegularFirst: '先集滿普通裝飾',
    maxLevel: '已達追蹤上限',
    recentEvents: '近期紀錄',
    noEvents: '尚無紀錄',
    eventCountUnit: '筆',
    pluckSeedling: '小盆栽拔苗',
    pluckHugeSeedling: '大盆栽拔苗',
    giftExpedition: '滿4心拿裝飾品',
    decorSource: '大盆栽或4心禮物',
    releaseLine: '放生',
    releaseNoDecor: '無裝飾品放生',
    releaseWithDecor: '有裝飾品放生',
    releaseNoDecorShort: '無裝放生',
    releaseWithDecorShort: '有裝放生',
    inventoryOnly: '庫存',
    noScore: '不計分',
    recordTotal: '紀錄',
    decrease: '減少',
    increase: '增加',
    autoCollapsed: '已自動收合',
    expandColor: '展開',
  };
});

const inventoryBuckets = computed<Array<{ id: CollectionInventoryBucket; label: string }>>(() => [
  { id: 'seedling', label: labels.value.seedling },
  { id: 'preDecor', label: labels.value.preDecor },
  { id: 'decor', label: labels.value.decor },
  { id: 'rare', label: labels.value.rare },
]);

const pointText = (points: number) => `+${points} pt`;

const primaryControls = computed<InventoryControl[]>(() => [
  {
    id: 'seedling',
    label: labels.value.seedling,
    shortLabel: labels.value.seedlingShort,
    icon: 'lucide:sprout',
    tone: 'seedling',
    scoreText: labels.value.inventoryOnly,
  },
  {
    id: 'preDecor',
    label: labels.value.preDecor,
    shortLabel: labels.value.preDecorShort,
    icon: 'lucide:heart',
    tone: 'preDecor',
    scoreText: pointText(rarePointValues.pluck_seedling),
  },
  {
    id: 'decor',
    label: labels.value.decor,
    shortLabel: labels.value.decorShort,
    icon: 'lucide:badge-check',
    tone: 'decor',
    scoreText: pointText(rarePointValues.gift_expedition),
  },
]);

const releaseControls = computed<InventoryControl[]>(() => [
  {
    id: 'releaseNoDecor',
    label: labels.value.releaseNoDecor,
    shortLabel: labels.value.releaseNoDecorShort,
    icon: 'lucide:heart-off',
    tone: 'releaseNoDecor',
    scoreText: pointText(rarePointValues.release_no_decor),
  },
  {
    id: 'releaseWithDecor',
    label: labels.value.releaseWithDecor,
    shortLabel: labels.value.releaseWithDecorShort,
    icon: 'lucide:badge-minus',
    tone: 'releaseWithDecor',
    scoreText: pointText(rarePointValues.release_with_decor),
  },
]);

const scoreRules = computed<Array<{ id: string; label: string; icon: string; points: number }>>(() => [
  {
    id: 'pluck_seedling',
    label: labels.value.pluckSeedling,
    icon: 'lucide:sprout',
    points: rarePointValues.pluck_seedling,
  },
  {
    id: 'pluck_huge_seedling',
    label: labels.value.pluckHugeSeedling,
    icon: 'lucide:tree-pine',
    points: rarePointValues.pluck_huge_seedling,
  },
  {
    id: 'gift_expedition',
    label: labels.value.giftExpedition,
    icon: 'lucide:gift',
    points: rarePointValues.gift_expedition,
  },
  {
    id: 'release_no_decor',
    label: labels.value.releaseNoDecor,
    icon: 'lucide:heart-off',
    points: rarePointValues.release_no_decor,
  },
  {
    id: 'release_with_decor',
    label: labels.value.releaseWithDecor,
    icon: 'lucide:badge-minus',
    points: rarePointValues.release_with_decor,
  },
]);

const pikminOrder: PikminType[] = ['red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice'];

const rareProgress = computed(() => getRareProgress(props.categoryId));
const recentEvents = computed(() => getRecentCollectionEvents(8, props.categoryId));

const getRareLevelStartPoints = (points: number): number => {
  if (points < 800) return 0;
  if (points < 1200) return 800;
  if (points < 3000) return 1200;
  return 3000 + Math.floor((points - 3000) / 5000) * 5000;
};

const rareProgressPercent = computed(() => {
  const progress = rareProgress.value;
  if (!progress.isCategoryComplete) return 0;
  if (progress.nextRareLevelPoints === null) return 100;

  const startPoints = getRareLevelStartPoints(progress.points);
  const targetPoints = progress.nextRareLevelPoints;
  const range = targetPoints - startPoints;
  if (range <= 0) return 0;

  return Math.min(100, Math.max(0, ((progress.points - startPoints) / range) * 100));
});

const rareProgressBarStyle = computed(() => ({
  transform: `scaleX(${rareProgressPercent.value / 100})`,
}));

const isRareDecorItem = (item: DecorItem): boolean => {
  const variant = getVariant(item.categoryId, item.variantId);
  return Boolean(variant?.isRare || item.variantId.toLowerCase().includes('rare'));
};

const ordinaryItems = computed(() =>
  getItemsByCategory(props.categoryId).filter(item => !isRareDecorItem(item)),
);

const summary = computed(() => {
  const base = getCategoryInventorySummary(props.categoryId);
  const ordinarySummary = ordinaryItems.value.reduce(
    (totals, item) => {
      const inventory = getInventoryItem(item.id);
      totals.seedlingCount += inventory.seedlingCount;
      totals.preDecorCount += inventory.preDecorCount;
      totals.decorCount += inventory.decorCount;
      totals.releaseNoDecorCount += inventory.releaseNoDecorCount;
      totals.releaseWithDecorCount += inventory.releaseWithDecorCount;
      return totals;
    },
    {
      seedlingCount: 0,
      preDecorCount: 0,
      decorCount: 0,
      releaseNoDecorCount: 0,
      releaseWithDecorCount: 0,
    },
  );

  return {
    ...base,
    ...ordinarySummary,
    rareCount: 0,
    totalItems: ordinaryItems.value.length,
  };
});


const rows = computed(() => {
  const groups = new Map<string, {
    variantId: string;
    variantName: string;
    variantNameEn: string;
    isRare: boolean;
    items: DecorItem[];
  }>();

  ordinaryItems.value.forEach((item) => {
    const variant = getVariant(item.categoryId, item.variantId);
    if (!groups.has(item.variantId)) {
      groups.set(item.variantId, {
        variantId: item.variantId,
        variantName: variant?.name ?? item.variantId,
        variantNameEn: variant?.nameEn ?? item.variantId,
        isRare: isRareDecorItem(item),
        items: [],
      });
    }
    groups.get(item.variantId)!.items.push(item);
  });

  return Array.from(groups.values()).map(row => ({
    ...row,
    items: row.items.sort(
      (a, b) => pikminOrder.indexOf(a.pikminType) - pikminOrder.indexOf(b.pikminType),
    ),
  }));
});

const getBucketCount = (itemId: string, bucket: CollectionInventoryBucket): number => {
  const inventory = getInventoryItem(itemId);
  if (bucket === 'seedling') return inventory.seedlingCount;
  if (bucket === 'preDecor') return inventory.preDecorCount;
  if (bucket === 'decor') return inventory.decorCount;
  if (bucket === 'rare') return inventory.rareCount;
  if (bucket === 'releaseNoDecor') return inventory.releaseNoDecorCount;
  return inventory.releaseWithDecorCount;
};

const getItemRecordTotalById = (itemId: string): number => {
  const inventory = getInventoryItem(itemId);
  return (
    inventory.seedlingCount +
    inventory.preDecorCount +
    inventory.decorCount +
    inventory.releaseNoDecorCount +
    inventory.releaseWithDecorCount
  );
};

const getItemRecordTotal = (item: DecorItem): number => getItemRecordTotalById(item.id);


const formatEventTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const bucketLabel = (bucket?: CollectionInventoryBucket): string => {
  if (bucket === 'releaseNoDecor') return labels.value.releaseNoDecor;
  if (bucket === 'releaseWithDecor') return labels.value.releaseWithDecor;
  return inventoryBuckets.value.find(item => item.id === bucket)?.label ?? '';
};

const formatEvent = (event: CollectionEvent): string => {
  if (event.type === 'inventory_adjustment') {
    const delta = event.delta ?? 0;
    const sign = delta > 0 ? '+' : '';
    return `${bucketLabel(event.bucket)} ${sign}${delta}`;
  }

  if (event.type === 'rare_points_adjustment') {
    const delta = event.pointsDelta ?? 0;
    const sign = delta > 0 ? '+' : '';
    return `${labels.value.rarePoints} ${sign}${delta}`;
  }

  return event.note ?? event.type;
};


const copy = computed(() => locale.value === 'en' ? {
  journal: 'GROWTH JOURNAL', title: 'Inventory & points', inventory: 'Inventory records', rules: 'Point guide',
  description: 'Log plucking, decor and releases to track your rare progress.',
  inventoryDescription: 'Keep track of seedlings, decor and releases by color.',
  start: 'Start recording', update: 'Update records', collapse: 'Collapse', decorSummary: 'With decor',
  emptyHint: 'Start with the seedlings you already have.', releaseLegend: 'Released: without decor / with decor',
  series: 'Series', chooseColor: 'Choose a color to edit', editing: 'Editing', saved: 'Changes save automatically',
  releaseOrder: 'plain / decor', seedlingDesc: 'Still growing', preDecorDesc: 'Plucked, under 4 hearts',
  decorDesc: 'Huge seedling or 4-heart gift', releasePlainDesc: 'Without a decor', releaseDecorDesc: 'With a decor',
} : {
  journal: '成長手帳', title: '庫存與積分紀錄', inventory: '庫存紀錄', rules: '計分方式',
  description: '記下拔苗、拿裝飾與放生，追蹤稀有進度。',
  inventoryDescription: '依顏色記下小盆栽、拿裝飾與放生的數量。',
  start: '開始記錄', update: '更新紀錄', collapse: '收合', decorSummary: '已拿裝飾',
  emptyHint: '從你現有的小盆栽開始記。', releaseLegend: '放生數量：無飾品 / 有飾品',
  series: '飾品系列', chooseColor: '選一個顏色，記錄它的成長', editing: '正在記錄', saved: '調整後自動儲存',
  releaseOrder: '無飾品 / 有飾品', seedlingDesc: '尚未拔苗', preDecorDesc: '小盆栽拔苗，尚未滿 4 心',
  decorDesc: '大盆栽拔苗或滿 4 心禮物', releasePlainDesc: '未取得飾品', releaseDecorDesc: '已取得飾品',
});
const hasRecords = computed(() => summary.value.seedlingCount + summary.value.preDecorCount + summary.value.decorCount + summary.value.releaseNoDecorCount + summary.value.releaseWithDecorCount > 0 || rareProgress.value.points > 0);
const allControls = computed(() => [...primaryControls.value, ...releaseControls.value].map((control, index) => ({
  ...control, description: [copy.value.seedlingDesc, copy.value.preDecorDesc, copy.value.decorDesc, copy.value.releasePlainDesc, copy.value.releaseDecorDesc][index],
})));
const activeRow = computed(() => rows.value.find(row => row.variantId === selectedVariant.value) || rows.value[0]);
const activeItem = computed(() => activeRow.value?.items.find(item => item.id === selectedItemId.value) || activeRow.value?.items[0]);
const activeImage = computed(() => activeItem.value ? getImageUrl(activeItem.value.categoryId, activeItem.value.variantId, activeItem.value.pikminType) : '');
const number = (value: number) => value.toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-TW');
const pikminBadgeClass = (type: PikminType) => PIKMIN_TYPE_COLORS[type];
let motionQuery: MediaQueryList | undefined;
let disposed = false;
let feedbackVersion = 0;
let feedbackContext: gsap.Context | undefined;
let colorContext: gsap.Context | undefined;
const transitions = new Map<HTMLElement, gsap.core.Timeline>();
const motionAllowed = () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clearFeedback = () => { feedbackContext?.revert(); feedbackContext = undefined; };
const clearColor = () => { colorContext?.revert(); colorContext = undefined; };
const interruptedPaperHeight = new WeakMap<HTMLElement, number>();
const paperLayers = (element: HTMLElement) => element.querySelectorAll('.rare-progress-panel, .inventory-color-tabs, .inventory-selected-heading, .inventory-control-row');
const cancelPaper = (el: Element) => {
  const element = el as HTMLElement;
  if (transitions.has(element)) interruptedPaperHeight.set(element, element.getBoundingClientRect().height);
  transitions.get(element)?.kill();
  transitions.delete(element);
  gsap.set(element, { clearProps: 'height,opacity,overflow,transform' });
  gsap.set(paperLayers(element), { clearProps: 'transform,opacity' });
};
const animatePaper = (el: Element, done: () => void, opening: boolean) => {
  const element = el as HTMLElement;
  transitions.get(element)?.kill();
  if (!motionAllowed()) { cancelPaper(el); done(); return; }
  const height = element.scrollHeight;
  const interruptedHeight = interruptedPaperHeight.get(element);
  interruptedPaperHeight.delete(element);
  const current = interruptedHeight ?? element.getBoundingClientRect().height;
  gsap.set(element, { overflow: 'hidden', height: opening ? (interruptedHeight ?? 0) : current });
  const timeline = gsap.timeline({ onComplete: () => {
    transitions.delete(element);
    gsap.set(element, { clearProps: 'height,opacity,overflow,transform' });
    done();
  } });
  transitions.set(element, timeline);
  timeline.to(element, { height: opening ? height : 0, opacity: opening ? 1 : 0, duration: opening ? .32 : .22, ease: 'power2.inOut' }, 0);
  if (opening) {
    timeline.fromTo(element, { opacity: .35 }, { opacity: 1, duration: .22 }, 0);
    const layers = paperLayers(element);
    if (layers.length) timeline.fromTo(layers, { y: 7, opacity: .35 }, { y: 0, opacity: 1, duration: .25, stagger: .018, clearProps: 'transform,opacity', ease: 'power2.out' }, .07);
  }
};
const enterPaper = (el: Element, done: () => void) => animatePaper(el, done, true);
const leavePaper = (el: Element, done: () => void) => animatePaper(el, done, false);
const selectColor = (id: string) => { selectedItemId.value = id; };
watch(() => activeItem.value?.id, async () => {
  const version = ++feedbackVersion;
  clearFeedback(); clearColor(); imageFailed.value = false;
  await nextTick();
  if (disposed || version !== feedbackVersion || !panelEl.value || !motionAllowed()) return;
  colorContext = gsap.context(() => {
    gsap.fromTo('.inventory-selected-heading, .inventory-control-row', { y: 5, opacity: .6 }, { y: 0, opacity: 1, duration: .22, stagger: .015, clearProps: 'transform,opacity', ease: 'power2.out' });
  }, panelEl.value);
});
const adjust = async (itemId: string, bucket: CollectionInventoryBucket, delta: number, event: MouseEvent) => {
  const root = panelEl.value;
  const button = event.currentTarget as HTMLElement;
  const value = button.parentElement?.querySelector('.inventory-stepper-value');
  const previousCount = getBucketCount(itemId, bucket);
  const previousPoints = rareProgress.value.points;
  const version = ++feedbackVersion;
  clearFeedback(); clearColor();
  adjustInventory(itemId, bucket, delta);
  lastPointsDelta.value = rareProgress.value.points - previousPoints;
  feedbackText.value = `${t('pikmin_types.' + (activeItem.value?.pikminType || 'red'))} · ${bucketLabel(bucket)} ${getBucketCount(itemId, bucket)} · ${rareProgress.value.points} pt`;
  await nextTick();
  if (disposed || version !== feedbackVersion || !root || previousCount === getBucketCount(itemId, bucket) || !motionAllowed()) return;
  feedbackContext = gsap.context(() => {
    const timeline = gsap.timeline();
    if (value) timeline.fromTo(value, { y: delta > 0 ? 5 : -5, opacity: .5 }, { y: 0, opacity: 1, duration: .22, clearProps: 'transform,opacity', ease: 'power2.out' }, 0);
    timeline.fromTo(button, { scale: .91 }, { scale: 1, duration: .22, clearProps: 'transform', ease: 'back.out(1.4)' }, 0);
    if (lastPointsDelta.value) {
      timeline.fromTo('.inventory-score-number', { y: 3 }, { y: 0, duration: .28, clearProps: 'transform' }, .02);
      timeline.fromTo('.inventory-score-delta', { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: .18 }, 0)
        .to('.inventory-score-delta', { y: -5, opacity: 0, duration: .2, clearProps: 'transform,opacity' }, .75);
    }
  }, root);
};
watch(isExpanded, expanded => { if (!expanded) { ++feedbackVersion; clearFeedback(); clearColor(); showRecentEvents.value = false; } });
const stopForReducedMotion = () => {
  if (!motionQuery?.matches) return;
  ++feedbackVersion; clearFeedback(); clearColor();
  for (const timeline of [...transitions.values()]) timeline.progress(1);
};
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', stopForReducedMotion);
});
onBeforeUnmount(() => {
  disposed = true; ++feedbackVersion; clearFeedback(); clearColor();
  for (const timeline of transitions.values()) timeline.kill();
  transitions.clear(); motionQuery?.removeEventListener('change', stopForReducedMotion);
});
</script>

<style scoped>
.collection-inventory-panel { margin: 1rem 0 1.25rem; padding: 1rem; border: 1px solid #cfe7d8; border-radius: 1.15rem; background: #fbfcf6; color: #24463d; box-shadow: 0 3px 0 #e8eee0, 0 8px 20px #254d3510; }
.inventory-entry { position: relative; isolation: isolate; overflow: hidden; margin: -1rem; padding: 1rem; border-radius: inherit; background: radial-gradient(ellipse at 100% 0, #d8f3ddc9, transparent 62%), linear-gradient(125deg, #fffef8, #f4f9ef); }
.inventory-entry > :not(:first-child) { position: relative; z-index: 1; }
.inventory-panel-header { display: grid; grid-template-columns: minmax(0,1fr) 64px; align-items: center; gap: .65rem; }
.inventory-panel-copy { min-width: 0; }
.inventory-panel-kicker { color: #56826a; font-size: .6rem; font-weight: 700; letter-spacing: .12em; }
.inventory-panel-title { margin-top: .25rem; color: #214d3d; font-size: 1rem; font-weight: 800; line-height: 1.45; letter-spacing: -.02em; }
.inventory-panel-description { max-width: 30rem; margin-top: .3rem; color: #627b68; font-size: .72rem; line-height: 1.65; }
.inventory-journal-motion { width: 64px; height: 64px; }
.inventory-summary-score { display: inline-flex; align-items: center; gap: .6rem; margin-top: .7rem; padding: .28rem .5rem; border: 1px solid #dbe9d7; border-radius: .4rem; background: #ffffffb3; color: #57816b; font-size: .72rem; font-variant-numeric: tabular-nums; }
.inventory-summary-score strong { font-weight: 800; }
.inventory-summary-divider { height: .75rem; width: 1px; background: #c7ddc8; }
.inventory-entry-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-top: .7rem; }
.inventory-action-button { position: relative; isolation: isolate; overflow: hidden; display: inline-flex; align-items: center; justify-content: space-between; gap: .65rem; min-height: 44px; flex: 1 1 110px; padding: .4rem .45rem .4rem .85rem; border-radius: 999px; border: 1px solid #0aab75; background: linear-gradient(110deg, #059669, #10b981 65%, #20ca91); color: white; font-size: .78rem; font-weight: 750; box-shadow: inset 0 1px 0 #ffffff40, 0 2px 0 #079b6c; }
.inventory-action-button > span:not(.collection-particle-border) { position: relative; }
.inventory-action-knob { display: grid; place-items: center; flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; background: #f2fff9; color: #07966c; box-shadow: 0 1px 4px #03543b30; }
.inventory-summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); margin-top: .85rem; gap: .35rem; }
.inventory-summary-grid > div { min-width: 0; padding: .5rem .35rem; border: 1px solid #e0ead7; border-radius: .5rem; background: #fffef9bd; }
.inventory-summary-grid dt { min-height: 1.5em; color: #6f826e; font-size: .62rem; line-height: 1.5; }
.inventory-summary-grid dd { margin-top: .2rem; color: #2d654b; font-size: 1rem; font-weight: 750; line-height: 1.25; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.inventory-summary-grid dd span { font-size: .75rem; color: #94a18f; }
.inventory-entry-note { margin-top: .5rem; color: #748572; font-size: .62rem; line-height: 1.55; }
.inventory-panel-body { min-width: 0; margin-top: 2rem; }
.rare-progress-panel { position: relative; padding: 1rem; border: 1px solid #dfdfcf; border-radius: .75rem; background: #fffdf5; box-shadow: 0 3px 0 #e8e9de; }
.rare-progress-panel::before { content: ''; position: absolute; top: -.22rem; right: 1rem; width: 2rem; height: .45rem; background: #f0cdb9; border-radius: 1px; transform: rotate(-3deg); }
.rare-progress-main { display: flex; align-items: flex-end; justify-content: space-between; gap: .65rem; }
.rare-progress-title { font-size: .73rem; color: #748478; font-weight: 650; }.rare-progress-level { margin-top: .2rem; font-size: .82rem; color: #3a5c4a; }.rare-progress-level strong { font-size: 1.45rem; font-weight: 800; }
.rare-progress-score { position: relative; display: flex; gap: .25rem; align-items: baseline; font-variant-numeric: tabular-nums; }.rare-progress-score > strong { font-size: clamp(1.55rem, 6vw, 2rem); font-weight: 800; line-height: 1; letter-spacing: -.03em; }.rare-progress-score > span { font-size: .72rem; color: #6a8072; }
.rare-progress-score .inventory-score-delta { position: absolute; bottom: 2rem; right: 0; padding: .2rem .35rem; border-radius: .25rem; background: #e0f5e9; color: #07835c; font-size: .68rem; font-weight: 700; opacity: 0; white-space: nowrap; }.inventory-score-delta.is-negative { background: #f9e9df; color: #9a5841; }
.rare-progress-track { height: 6px; margin-top: .85rem; border-radius: 6px; background: #e7ecdf; overflow: hidden; }.rare-progress-track-fill { display: block; width: 100%; height: 100%; transform-origin: left center; border-radius: inherit; background: #10b981; transition: transform .3s cubic-bezier(.22,1,.36,1); }
.rare-progress-meta { display: flex; justify-content: space-between; align-items: center; gap: .5rem; margin-top: .5rem; font-size: .69rem; color: #718072; }.rare-progress-meta > span { line-height: 1.6; }.rare-score-toggle { display: inline-flex; gap: .45rem; align-items: center; min-height: 44px; flex-shrink: 0; color: #07835c; font-weight: 700; font-size: .71rem; }.rare-score-toggle > span { font-size: 1rem; }
.rare-rule-grid { border-top: 1px dashed #d9dfd1; }.rare-rule-grid > div { display: flex; gap: .5rem; justify-content: space-between; padding: .55rem 0; font-size: .75rem; }.rare-rule-grid dt { min-width: 0; color: #617669; }.rare-rule-grid dd { flex-shrink: 0; font-weight: 750; font-variant-numeric: tabular-nums; }.rare-rule-grid small { font-size: .65rem; font-weight: 500; }
.inventory-editor { margin-top: 1.25rem; }.inventory-editor-heading { display: flex; align-items: center; justify-content: space-between; gap: .7rem; font-size: .86rem; font-weight: 750; }.inventory-variant-select { min-width: 0; max-width: 70%; min-height: 44px; padding: .5rem; border: 1px solid #dce1d3; border-radius: .5rem; background: #fffdf6; font-size: 16px; color: #24463d; }
.inventory-color-hint { margin: .35rem 0 .7rem; color: #778478; font-size: .7rem; }
.inventory-color-tabs { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: .4rem; }.inventory-color-tab { display: flex; align-items: center; justify-content: center; gap: .3rem; min-width: 0; min-height: 44px; padding: .4rem .2rem; border: 1px solid #dce1d5; border-radius: .45rem; background: #fffdf6; font-size: .76rem; font-weight: 650; }.inventory-color-tab small { font-size: .64rem; color: #869282; font-variant-numeric: tabular-nums; }.inventory-color-tab.is-active { background: #10b981; color: #fff; border-color: #10b981; }.inventory-color-tab.is-active small { color: #fff; opacity: .8; }
.inventory-pikmin-dot { display: inline-block; width: .65rem; height: .65rem; border: 1px solid #ffffffc9; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 1px #24463d15; }
.inventory-selected-sheet { margin-top: .7rem; border: 1px solid #dfe2d6; border-radius: .65rem; background: #fffdf8; overflow: hidden; }
.inventory-selected-heading { display: flex; gap: .6rem; align-items: center; padding: .7rem .8rem; border-bottom: 1px solid #e1e5db; background: #f6f6ed; }.inventory-selected-image { width: 2.35rem; height: 3.4rem; object-fit: contain; }.inventory-selected-heading small { color: #819080; font-size: .63rem; }.inventory-selected-heading h4 { font-size: .85rem; font-weight: 750; }.inventory-item-total { margin-left: auto; font-size: .65rem; color: #7b897b; white-space: nowrap; }.inventory-item-total strong { margin-left: .15rem; color: #2e5a46; }
.inventory-control-row { display: flex; align-items: center; justify-content: space-between; gap: .45rem; min-height: 72px; padding: .6rem .65rem; border-bottom: 1px solid #eceee5; }.inventory-control-row.is-release { border-top: 1px dashed #d6dece; margin-top: .2rem; }.inventory-control-copy { display: flex; gap: .5rem; align-items: center; flex: 1; min-width: 0; flex-wrap: wrap; }.inventory-control-index { color: #a0aa96; font: 500 .6rem ui-monospace,monospace; }.inventory-control-label { display: block; font-size: .8rem; font-weight: 700; line-height: 1.5; }.inventory-control-description { display: block; margin-top: .05rem; font-size: .62rem; color: #869081; line-height: 1.5; }.inventory-control-score { margin-left: 1.35rem; flex-basis: 100%; color: #07835c; font-size: .65rem; font-weight: 650; font-variant-numeric: tabular-nums; }
.inventory-control-stepper { display: grid; grid-template-columns: 44px minmax(2.25rem,auto) 44px; flex-shrink: 0; align-items: center; border: 1px solid #dbe3d5; border-radius: .5rem; background: #fffef9; font-variant-numeric: tabular-nums; overflow: hidden; }.inventory-stepper-hit { display: grid; place-items: center; min-width: 44px; min-height: 44px; color: #476853; font-size: 1.4rem; touch-action: manipulation; }.inventory-stepper-plus { background: #10b981; color: #fff; }.inventory-stepper-hit:disabled { color: #c5cfbe; background: #f7f8f1; }.inventory-stepper-value { padding-inline: .15rem; text-align: center; color: #284c3c; font-size: 1rem; }
.inventory-save-note { padding: .6rem; color: #859080; font-size: .65rem; text-align: right; }
.inventory-event-log { margin-top: .75rem; border-top: 1px solid #dce1d4; }.inventory-event-log-toggle { display: flex; align-items: center; justify-content: space-between; gap: .7rem; width: 100%; min-height: 44px; font-size: .74rem; font-weight: 650; }.inventory-event-log-toggle > span:last-child { color: #87927f; font-size: .65rem; }.inventory-event-log-body { color: #7a8777; font-size: .7rem; }.inventory-event-log-body li { display: flex; justify-content: space-between; gap: .5rem; padding: .55rem 0; border-top: 1px dashed #e1e5d8; }.inventory-event-log-body time { flex-shrink: 0; font-variant-numeric: tabular-nums; font-size: .65rem; }.inventory-event-log-body > p { padding-block: .8rem; }
button { -webkit-tap-highlight-color: transparent; }button:not(:disabled):active { transform: translateY(1px); }button:focus-visible,select:focus-visible { outline: 3px solid #10b981; outline-offset: 3px; }
@media (max-width: 360px) { .collection-inventory-panel { padding: .7rem; }.inventory-entry { margin: -.7rem; padding: .7rem; }.inventory-panel-header { gap: .35rem; grid-template-columns: minmax(0,1fr) 56px; }.inventory-journal-motion { width: 56px; height: 56px; }.inventory-panel-title { font-size: .94rem; }.inventory-summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }.inventory-summary-grid > div { display: flex; align-items: center; justify-content: space-between; gap: .3rem; padding: .45rem; }.inventory-summary-grid dd { margin-top: 0; }.inventory-control-row { padding-inline: .45rem; }.inventory-control-index { display: none; }.inventory-control-copy { gap: .15rem; }.inventory-control-score { margin-left: 0; }.inventory-control-description { max-width: 8rem; font-size: .6rem; }.inventory-control-stepper { grid-template-columns: 44px minmax(1.5rem,auto) 44px; }.inventory-color-tab { gap: .22rem; }.rare-progress-panel { padding: .8rem; } }
@media (min-width: 768px) { .inventory-panel-header { grid-template-columns: minmax(0,1fr) 76px; }.inventory-journal-motion { width: 76px; height: 76px; }.inventory-entry-actions { max-width: 25rem; }.inventory-color-tabs { grid-template-columns: repeat(8,minmax(0,1fr)); }.inventory-editor { max-width: 44rem; }.inventory-control-copy { flex-wrap: nowrap; }.inventory-control-score { flex-basis: auto; margin-left: auto; margin-right: 1rem; }.inventory-control-row { padding-inline: 1rem; }.inventory-summary-grid { max-width: 35rem; }.rare-progress-panel { max-width: 44rem; } }
@media (prefers-reduced-motion: reduce) { *,::before,::after { transition: none !important; } }
</style>
