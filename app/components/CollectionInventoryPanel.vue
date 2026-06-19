<template>
  <section ref="panelEl" class="collection-inventory-panel">
    <div class="inventory-panel-header">
      <div class="inventory-panel-copy">
        <p class="inventory-panel-kicker">
          <Icon name="lucide:sparkles" class="w-4 h-4" />
          {{ labels.level }} {{ rareProgress.level }} · {{ rareProgress.points }} pt
        </p>
        <div class="inventory-chip-grid">
          <span class="inventory-chip">
            <Icon name="lucide:sprout" class="w-3.5 h-3.5" />
            {{ labels.seedling }} {{ summary.seedlingCount }}
          </span>
          <span class="inventory-chip">
            <Icon name="lucide:heart" class="w-3.5 h-3.5" />
            {{ labels.preDecor }} {{ summary.preDecorCount }}
          </span>
          <span class="inventory-chip">
            <Icon name="lucide:badge-check" class="w-3.5 h-3.5" />
            {{ labels.decor }} {{ summary.decorCount }}
          </span>
          <span class="inventory-chip">
            <Icon name="lucide:heart-off" class="w-3.5 h-3.5" />
            {{ labels.releaseSummary }} {{ summary.releaseNoDecorCount }}/{{ summary.releaseWithDecorCount }}
          </span>
        </div>
      </div>

      <div class="inventory-panel-actions">
        <button
          type="button"
          class="inventory-action-button inventory-action-button-primary"
          @click.stop="toggleExpanded"
        >
          <Icon :name="isExpanded ? 'lucide:chevron-up' : 'lucide:sliders-horizontal'" class="w-4 h-4" />
          {{ isExpanded ? labels.close : labels.manage }}
        </button>
      </div>
    </div>

    <Transition
      @before-enter="beforeSmoothEnter"
      @enter="smoothEnter"
      @after-enter="afterSmoothTransition"
      @enter-cancelled="afterSmoothTransition"
      @before-leave="beforeSmoothLeave"
      @leave="smoothLeave"
      @after-leave="afterSmoothTransition"
      @leave-cancelled="afterSmoothTransition"
    >
      <div v-if="isExpanded" class="inventory-panel-body">
        <div v-if="summary.hasRareDecor" class="rare-progress-panel">
          <div class="rare-progress-main">
            <div class="rare-progress-copy">
              <p class="rare-progress-title">
                <Icon name="lucide:sparkles" class="w-4 h-4" />
                {{ labels.rarePoints }}
              </p>
              <p class="rare-progress-value">
                Lv. {{ rareProgress.level }}
              </p>
            </div>
            <div class="rare-progress-score">
              <strong>{{ rareProgress.points }}</strong>
              <span>pt</span>
            </div>
          </div>

          <div class="rare-progress-track-row">
            <div
              class="rare-progress-track"
              role="progressbar"
              :aria-valuenow="Math.round(rareProgressPercent)"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <span class="rare-progress-track-fill" :style="rareProgressBarStyle" />
            </div>
            <div class="rare-progress-meta">
              <span v-if="!rareProgress.isCategoryComplete" class="rare-progress-next">
                {{ labels.completeRegularFirst }}
              </span>
              <span v-else-if="rareProgress.pointsToNextRareLevel !== null" class="rare-progress-next">
                {{ labels.nextLevel }} {{ rareProgress.pointsToNextRareLevel }} pt
              </span>
              <span v-else class="rare-progress-next">{{ labels.maxLevel }}</span>
              <button
                type="button"
                class="rare-score-toggle"
                :aria-expanded="showScoreRules"
                @click.stop="showScoreRules = !showScoreRules"
              >
                <Icon :name="showScoreRules ? 'lucide:chevron-up' : 'lucide:circle-help'" class="w-3.5 h-3.5" />
                {{ showScoreRules ? labels.hideScoreRules : labels.scoreQuestion }}
              </button>
            </div>
          </div>

          <Transition
            @before-enter="beforeSmoothEnter"
            @enter="smoothEnter"
            @after-enter="afterSmoothTransition"
            @enter-cancelled="afterSmoothTransition"
            @before-leave="beforeSmoothLeave"
            @leave="smoothLeave"
            @after-leave="afterSmoothTransition"
            @leave-cancelled="afterSmoothTransition"
          >
            <div v-if="showScoreRules" class="rare-rule-grid">
              <div
                v-for="rule in scoreRules"
                :key="rule.id"
                class="rare-rule-card"
              >
                <Icon :name="rule.icon" class="w-3.5 h-3.5" />
                <span>{{ rule.label }}</span>
                <strong>+{{ rule.points }}</strong>
              </div>
            </div>
          </Transition>
        </div>

        <div class="inventory-rows">
          <div
            v-for="row in rows"
            :key="row.variantId"
            class="inventory-row-group"
          >
            <div class="inventory-row-title">
              <span>{{ locale === 'en' ? row.variantNameEn : row.variantName }}</span>
              <span v-if="row.isRare" class="inventory-row-rare">
                <Icon name="lucide:sparkles" class="w-3.5 h-3.5" />
                {{ labels.rare }}
              </span>
            </div>

            <div class="inventory-item-grid">
              <article
                v-for="item in row.items"
                :key="item.id"
                class="inventory-item-cell"
                :class="{ 'inventory-item-cell-mobile-collapsed': isMobileItemCollapsed(item.id) }"
                :data-mobile-inventory-item-id="item.id"
              >
                <div class="inventory-item-title">
                  <div class="inventory-item-main">
                    <span class="inventory-pikmin-badge" :class="pikminBadgeClass(item.pikminType)">
                      <span class="sr-only">{{ t(`pikmin_types_short.${item.pikminType}`) }}</span>
                    </span>
                    <span class="inventory-item-id">{{ t(`pikmin_types.${item.pikminType}`) }}</span>
                  </div>
                  <span
                    v-if="getItemRecordTotal(item) > 0"
                    class="inventory-item-total"
                  >
                    {{ labels.recordTotal }} {{ getItemRecordTotal(item) }}
                  </span>
                </div>

                <div class="inventory-control-stack">
                  <div
                    v-for="control in primaryControls"
                    :key="control.id"
                    class="inventory-control-card"
                    :class="`inventory-control-${control.tone}`"
                  >
                    <div class="inventory-control-copy">
                      <span class="inventory-control-icon">
                        <Icon :name="control.icon" class="w-4 h-4" />
                      </span>
                      <span class="inventory-control-text">
                        <span class="inventory-control-label">{{ control.label }}</span>
                        <span v-if="control.scoreText" class="inventory-control-score">
                          {{ control.scoreText }}
                        </span>
                      </span>
                    </div>

                    <div class="inventory-control-stepper" :aria-label="control.label">
                      <button
                        type="button"
                        class="inventory-stepper-hit inventory-stepper-minus"
                        :aria-label="`${labels.decrease} ${control.label}`"
                        :disabled="getBucketCount(item.id, control.id) === 0"
                        @click.stop="adjust(item.id, control.id, -1)"
                      >
                        <Icon name="lucide:minus" class="w-4 h-4" />
                      </button>
                      <strong class="inventory-stepper-value">
                        {{ getBucketCount(item.id, control.id) }}
                      </strong>
                      <button
                        type="button"
                        class="inventory-stepper-hit inventory-stepper-plus"
                        :aria-label="`${labels.increase} ${control.label}`"
                        @click.stop="adjust(item.id, control.id, 1)"
                      >
                        <Icon name="lucide:plus" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div class="inventory-release-panel">
                  <div class="inventory-release-heading">
                    <span>
                      <Icon name="lucide:send-horizontal" class="w-3.5 h-3.5" />
                      {{ labels.releaseLine }}
                    </span>
                  </div>
                  <div class="inventory-release-grid">
                    <div
                      v-for="control in releaseControls"
                      :key="control.id"
                      class="inventory-control-card inventory-control-compact"
                      :class="`inventory-control-${control.tone}`"
                    >
                      <div class="inventory-control-copy">
                        <span class="inventory-control-icon">
                          <Icon :name="control.icon" class="w-4 h-4" />
                        </span>
                        <span class="inventory-control-text">
                          <span class="inventory-control-label">{{ control.label }}</span>
                          <span class="inventory-control-score">{{ control.scoreText }}</span>
                        </span>
                      </div>

                      <div class="inventory-control-stepper" :aria-label="control.label">
                        <button
                          type="button"
                          class="inventory-stepper-hit inventory-stepper-minus"
                          :aria-label="`${labels.decrease} ${control.label}`"
                          :disabled="getBucketCount(item.id, control.id) === 0"
                          @click.stop="adjust(item.id, control.id, -1)"
                        >
                          <Icon name="lucide:minus" class="w-4 h-4" />
                        </button>
                        <strong class="inventory-stepper-value">
                          {{ getBucketCount(item.id, control.id) }}
                        </strong>
                        <button
                          type="button"
                          class="inventory-stepper-hit inventory-stepper-plus"
                          :aria-label="`${labels.increase} ${control.label}`"
                          @click.stop="adjust(item.id, control.id, 1)"
                        >
                          <Icon name="lucide:plus" class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Transition
                  @before-enter="beforeSmoothEnter"
                  @enter="smoothEnter"
                  @after-enter="afterSmoothTransition"
                  @enter-cancelled="afterSmoothTransition"
                  @before-leave="beforeSmoothLeave"
                  @leave="smoothLeave"
                  @after-leave="afterSmoothTransition"
                  @leave-cancelled="afterSmoothTransition"
                >
                  <button
                    v-if="isMobileItemCollapsed(item.id)"
                    type="button"
                    class="inventory-mobile-collapsed-summary"
                    :aria-label="`${labels.expandColor} ${t('pikmin_types.' + item.pikminType)}`"
                    @click.stop="expandMobileItem(item.id)"
                  >
                    <span>
                      <Icon name="lucide:panel-top-open" class="w-4 h-4" />
                      {{ labels.autoCollapsed }}
                    </span>
                    <strong>{{ labels.expandColor }}</strong>
                  </button>
                </Transition>

                <Transition
                  @before-enter="beforeSmoothEnter"
                  @enter="smoothEnter"
                  @after-enter="afterSmoothTransition"
                  @enter-cancelled="afterSmoothTransition"
                  @before-leave="beforeSmoothLeave"
                  @leave="smoothLeave"
                  @after-leave="afterSmoothTransition"
                  @leave-cancelled="afterSmoothTransition"
                >
                  <div v-if="!isMobileItemCollapsed(item.id)" class="inventory-mobile-control-grid">
                  <div
                    v-for="(control, controlIndex) in mobileControls"
                    :key="control.id"
                    class="inventory-mobile-control-card"
                    :class="[
                      `inventory-control-${control.tone}`,
                      getMobileControlClass(),
                      'mobile-strip-control',
                    ]"
                  >
                    <div class="inventory-mobile-control-head">
                      <span class="inventory-control-icon">
                        <Icon :name="control.icon" class="w-4 h-4" />
                      </span>
                      <span class="inventory-control-text">
                        <span class="inventory-control-label" :title="control.label">
                          {{ control.shortLabel || control.label }}
                        </span>
                        <span v-if="control.scoreText" class="inventory-control-score">{{ control.scoreText }}</span>
                      </span>
                    </div>

                    <div class="inventory-control-stepper" :aria-label="control.label">
                      <button
                        type="button"
                        class="inventory-stepper-hit inventory-stepper-minus"
                        :aria-label="`${labels.decrease} ${control.label}`"
                        :disabled="getBucketCount(item.id, control.id) === 0"
                        @click.stop="adjust(item.id, control.id, -1)"
                      >
                        <Icon name="lucide:minus" class="w-4 h-4" />
                      </button>
                      <strong class="inventory-stepper-value">
                        {{ getBucketCount(item.id, control.id) }}
                      </strong>
                      <button
                        type="button"
                        class="inventory-stepper-hit inventory-stepper-plus"
                        :aria-label="`${labels.increase} ${control.label}`"
                        @click.stop="adjust(item.id, control.id, 1)"
                      >
                        <Icon name="lucide:plus" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  </div>
                </Transition>
              </article>
            </div>
          </div>
        </div>

        <div class="inventory-event-log">
          <button
            type="button"
            class="inventory-event-log-toggle"
            :aria-expanded="showRecentEvents"
            @click.stop="showRecentEvents = !showRecentEvents"
          >
            <span class="inventory-event-log-title">
              <Icon name="lucide:list-restart" class="w-4 h-4" />
              {{ labels.recentEvents }}
            </span>
            <span class="inventory-event-log-summary">
              {{ recentEvents.length }} {{ labels.eventCountUnit }}
              <Icon :name="showRecentEvents ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-3.5 h-3.5" />
            </span>
          </button>

          <Transition
            @before-enter="beforeSmoothEnter"
            @enter="smoothEnter"
            @after-enter="afterSmoothTransition"
            @enter-cancelled="afterSmoothTransition"
            @before-leave="beforeSmoothLeave"
            @leave="smoothLeave"
            @after-leave="afterSmoothTransition"
            @leave-cancelled="afterSmoothTransition"
          >
            <div v-if="showRecentEvents" class="inventory-event-log-body">
              <ol v-if="recentEvents.length > 0" class="inventory-event-list">
                <li v-for="event in recentEvents" :key="event.id">
                  <span>{{ formatEvent(event) }}</span>
                  <time>{{ formatEventTime(event.createdAt) }}</time>
                </li>
              </ol>
              <p v-else class="inventory-event-empty">{{ labels.noEvents }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import {
  PIKMIN_TYPE_COLORS,
  type CollectionEvent,
  type CollectionInventoryBucket,
  type DecorItem,
  type PikminType,
} from '~/types/decor';

const props = defineProps<{
  categoryId: string;
}>();

const { t, locale } = useI18n();
const { getItemsByCategory, getVariant } = useDecorData();
const {
  adjustInventory,
  getInventoryItem,
  getCategoryInventorySummary,
  getRareProgress,
  getRecentCollectionEvents,
  rarePointValues,
} = useCollection();

const isExpanded = ref(false);
const showScoreRules = ref(false);
const showRecentEvents = ref(false);
const panelEl = ref<HTMLElement | null>(null);
const collapsedMobileItems = ref<Set<string>>(new Set());
let mobileAutoCollapseObserver: IntersectionObserver | null = null;
let mobileAutoCollapseFrame: number | null = null;

const smoothTransitionDuration = 280;
const smoothTransitionCss =
  `height ${smoothTransitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1), ` +
  'opacity 180ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1)';
const fastPanelCloseDuration = 180;
const fastPanelCloseCss =
  `height ${fastPanelCloseDuration}ms cubic-bezier(0.4, 0, 0.2, 1), ` +
  'opacity 120ms ease, transform 160ms cubic-bezier(0.4, 0, 0.2, 1)';
const tallPanelAnimationThreshold = 900;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clearSmoothStyles = (element: HTMLElement) => {
  element.style.height = '';
  element.style.opacity = '';
  element.style.overflow = '';
  element.style.transform = '';
  element.style.transition = '';
  element.style.contain = '';
};

const finishOnHeightTransition = (
  element: HTMLElement,
  done: () => void,
  fallbackMs = smoothTransitionDuration + 80,
) => {
  let isDone = false;
  const finish = () => {
    if (isDone) return;
    isDone = true;
    element.removeEventListener('transitionend', onTransitionEnd);
    done();
  };
  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target === element && event.propertyName === 'height') finish();
  };

  element.addEventListener('transitionend', onTransitionEnd);
  window.setTimeout(finish, fallbackMs);
};

const beforeSmoothEnter = (el: Element) => {
  const element = el as HTMLElement;
  if (prefersReducedMotion()) return;

  element.style.height = '0px';
  element.style.opacity = '0';
  element.style.overflow = 'hidden';
  element.style.transform = 'translateY(-6px)';
};

const smoothEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  if (prefersReducedMotion()) {
    done();
    return;
  }

  const targetHeight = element.scrollHeight;
  element.style.transition = smoothTransitionCss;
  requestAnimationFrame(() => {
    element.style.height = `${targetHeight}px`;
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });
  finishOnHeightTransition(element, done);
};

const beforeSmoothLeave = (el: Element) => {
  const element = el as HTMLElement;
  if (prefersReducedMotion()) return;

  if (element.classList.contains('inventory-panel-body')) {
    disconnectMobileAutoCollapse();
  }

  element.style.height = `${element.scrollHeight}px`;
  element.style.opacity = '1';
  element.style.overflow = 'hidden';
  element.style.transform = 'translateY(0)';
};

const smoothLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  if (prefersReducedMotion()) {
    done();
    return;
  }

  const isTallPanel =
    element.classList.contains('inventory-panel-body') &&
    element.scrollHeight > tallPanelAnimationThreshold;

  if (isTallPanel) {
    element.style.contain = 'layout paint';
  }
  element.style.transition = isTallPanel ? fastPanelCloseCss : smoothTransitionCss;
  requestAnimationFrame(() => {
    element.style.height = '0px';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-6px)';
  });
  finishOnHeightTransition(
    element,
    done,
    (isTallPanel ? fastPanelCloseDuration : smoothTransitionDuration) + 80,
  );
};

const afterSmoothTransition = (el: Element) => {
  clearSmoothStyles(el as HTMLElement);
};

type InventoryControlTone =
  | 'seedling'
  | 'preDecor'
  | 'decor'
  | 'rare'
  | 'releaseNoDecor'
  | 'releaseWithDecor';

interface InventoryControl {
  id: CollectionInventoryBucket;
  label: string;
  shortLabel?: string;
  icon: string;
  tone: InventoryControlTone;
  scoreText?: string;
}

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
  width: `${rareProgressPercent.value}%`,
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

const mobileControls = computed<InventoryControl[]>(() => [
  ...primaryControls.value,
  ...releaseControls.value,
]);

const toggleExpanded = () => {
  if (isExpanded.value) {
    disconnectMobileAutoCollapse();
    showRecentEvents.value = false;
  }

  isExpanded.value = !isExpanded.value;
};

const getMobileControlClass = (): string => {
  return 'mobile-span-6';
};

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

const isMobileItemCollapsed = (itemId: string): boolean => collapsedMobileItems.value.has(itemId);

const collapseMobileItem = (itemId: string) => {
  if (collapsedMobileItems.value.has(itemId)) return;
  collapsedMobileItems.value = new Set([...collapsedMobileItems.value, itemId]);
};

const expandMobileItem = (itemId: string) => {
  if (!collapsedMobileItems.value.has(itemId)) return;
  const next = new Set(collapsedMobileItems.value);
  next.delete(itemId);
  collapsedMobileItems.value = next;
};

const isMobileAutoCollapseEnabled = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 640px)').matches;

const disconnectMobileAutoCollapse = () => {
  mobileAutoCollapseObserver?.disconnect();
  mobileAutoCollapseObserver = null;
};

const setupMobileAutoCollapse = () => {
  disconnectMobileAutoCollapse();

  if (!isExpanded.value || !isMobileAutoCollapseEnabled()) return;

  const root = panelEl.value;
  if (!root) return;

  const itemCells = root.querySelectorAll<HTMLElement>('[data-mobile-inventory-item-id]');
  if (itemCells.length === 0) return;

  mobileAutoCollapseObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const itemId = (entry.target as HTMLElement).dataset.mobileInventoryItemId;
      if (!itemId || collapsedMobileItems.value.has(itemId)) return;

      const isPastViewportTop = entry.boundingClientRect.bottom < 96;
      if (!entry.isIntersecting && isPastViewportTop && getItemRecordTotalById(itemId) > 0) {
        collapseMobileItem(itemId);
      }
    });
  }, {
    root: null,
    rootMargin: '-88px 0px 0px 0px',
    threshold: 0,
  });

  itemCells.forEach((cell) => mobileAutoCollapseObserver?.observe(cell));
};

const scheduleMobileAutoCollapse = () => {
  if (typeof window === 'undefined') return;
  if (mobileAutoCollapseFrame !== null) cancelAnimationFrame(mobileAutoCollapseFrame);

  mobileAutoCollapseFrame = requestAnimationFrame(async () => {
    mobileAutoCollapseFrame = null;
    await nextTick();
    setupMobileAutoCollapse();
  });
};

const adjust = (itemId: string, bucket: CollectionInventoryBucket, delta: number) => {
  adjustInventory(itemId, bucket, delta);
};

const pikminBadgeClass = (pikminType: PikminType) => {
  return PIKMIN_TYPE_COLORS[pikminType];
};

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

watch(isExpanded, (expanded) => {
  showRecentEvents.value = false;

  if (!expanded) {
    disconnectMobileAutoCollapse();
    return;
  }

  collapsedMobileItems.value = new Set();
  scheduleMobileAutoCollapse();
}, { flush: 'post' });

watch(rows, () => {
  if (isExpanded.value) scheduleMobileAutoCollapse();
}, { flush: 'post' });

onMounted(() => {
  window.addEventListener('resize', scheduleMobileAutoCollapse, { passive: true });
  if (isExpanded.value) scheduleMobileAutoCollapse();
});

onUnmounted(() => {
  disconnectMobileAutoCollapse();
  if (mobileAutoCollapseFrame !== null) cancelAnimationFrame(mobileAutoCollapseFrame);
  window.removeEventListener('resize', scheduleMobileAutoCollapse);
});
</script>

<style scoped>
.collection-inventory-panel {
  margin-bottom: 1rem;
  padding: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
}

.inventory-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.inventory-panel-copy {
  min-width: 0;
  flex: 1;
}

.inventory-panel-kicker,
.rare-progress-title,
.inventory-event-log-title {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgb(15 118 110);
  font-size: 0.82rem;
  font-weight: 800;
}

.inventory-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.55rem;
}

.inventory-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 1.75rem;
  padding: 0.25rem 0.55rem;
  border: 1px solid rgba(20, 184, 166, 0.16);
  border-radius: 999px;
  background: rgba(240, 253, 250, 0.74);
  color: rgb(15 82 73);
  font-size: 0.76rem;
  font-weight: 800;
}

.inventory-chip-rare {
  border-color: rgba(245, 158, 11, 0.24);
  background: rgba(255, 251, 235, 0.82);
  color: rgb(146 64 14);
}

.inventory-panel-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.inventory-action-button,
.rare-rule-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 2.1rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.78);
  color: rgb(51 65 85);
  font-size: 0.78rem;
  font-weight: 800;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}

.inventory-action-button:not(:disabled):hover {
  transform: translateY(-1px);
  border-color: rgba(20, 184, 166, 0.42);
  background: rgba(240, 253, 250, 0.9);
}

.inventory-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.inventory-action-button-primary {
  color: white;
  border-color: transparent;
  background: linear-gradient(135deg, rgb(16 185 129), rgb(13 148 136));
  box-shadow: 0 8px 18px rgba(13, 148, 136, 0.2);
}

.inventory-action-button-primary:not(:disabled):hover,
.inventory-action-button-primary:not(:disabled):focus-visible {
  color: white;
  border-color: rgba(255, 255, 255, 0.78);
  background: linear-gradient(135deg, rgb(5 150 105), rgb(15 118 110));
  box-shadow: 0 10px 22px rgba(13, 148, 136, 0.3);
}

.inventory-action-button-primary:not(:disabled):active {
  transform: translateY(0);
  background: linear-gradient(135deg, rgb(4 120 87), rgb(17 94 89));
}

.inventory-panel-body {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.85rem;
  transform-origin: top;
  will-change: height, opacity, transform;
}

.rare-progress-panel {
  display: grid;
  gap: 0.5rem;
  padding: 0.62rem 0.7rem;
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 0.78rem;
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.72), rgba(255, 247, 237, 0.58));
}

.rare-progress-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
}

.rare-progress-title {
  color: rgb(146 64 14);
  font-size: 0.78rem;
}

.rare-progress-value {
  margin-top: 0.05rem;
  color: rgb(154 52 18);
  font-size: 0.86rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.rare-progress-score {
  display: inline-flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 0.12rem;
  color: rgb(120 53 15);
  font-variant-numeric: tabular-nums;
}

.rare-progress-score strong {
  font-size: 1.08rem;
  line-height: 1;
}

.rare-progress-score span {
  font-size: 0.66rem;
  font-weight: 900;
}

.rare-progress-track-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
}

.rare-progress-track {
  overflow: hidden;
  height: 0.38rem;
  border-radius: 999px;
  background: rgba(254, 215, 170, 0.58);
  box-shadow: inset 0 1px 2px rgba(146, 64, 14, 0.08);
}

.rare-progress-track-fill {
  display: block;
  height: 100%;
  min-width: 0.2rem;
  border-radius: inherit;
  background: linear-gradient(90deg, rgb(245 158 11), rgb(217 119 6));
  transition: width 220ms ease;
}

.rare-progress-meta {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
}

.rare-progress-next {
  color: rgb(146 64 14);
  font-size: 0.68rem;
  font-weight: 900;
  white-space: nowrap;
}

.rare-score-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  min-height: 1.72rem;
  padding: 0.26rem 0.5rem;
  border: 1px solid rgba(245, 158, 11, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: rgb(146 64 14);
  font-size: 0.68rem;
  font-weight: 900;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.rare-score-toggle:hover,
.rare-score-toggle:focus-visible {
  border-color: rgba(245, 158, 11, 0.42);
  background: rgba(254, 243, 199, 0.8);
}

.rare-score-toggle:active {
  transform: scale(0.98);
}

.rare-rule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: 0.5rem;
  transform-origin: top;
  will-change: height, opacity, transform;
}

.rare-rule-card {
  justify-content: space-between;
  min-height: 2.35rem;
  text-align: left;
}

.rare-rule-card span {
  min-width: 0;
  flex: 1;
}

.rare-rule-card strong {
  color: rgb(146 64 14);
  font-size: 0.8rem;
}

.inventory-rows {
  display: grid;
  gap: 0.78rem;
}

.inventory-row-group {
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  padding-top: 0.78rem;
}

.inventory-row-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.58rem;
  color: rgb(30 41 59);
  font-size: 0.92rem;
  font-weight: 900;
}

.inventory-row-rare {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: rgb(146 64 14);
  font-size: 0.72rem;
}

.inventory-item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  align-items: start;
  gap: 0.65rem;
}

.inventory-item-cell {
  min-width: 0;
  padding: 0.68rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 0.82rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 252, 0.76));
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.inventory-item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  margin-bottom: 0.56rem;
}

.inventory-item-main {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.inventory-pikmin-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.72rem;
  height: 0.72rem;
  border: 2px solid rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08), 0 2px 5px rgba(15, 23, 42, 0.12);
}

.inventory-item-id {
  min-width: 0;
  overflow: hidden;
  color: rgb(51 65 85);
  font-size: 0.78rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inventory-item-total {
  flex: 0 0 auto;
  padding: 0.18rem 0.42rem;
  border: 1px solid rgba(20, 184, 166, 0.18);
  border-radius: 999px;
  background: rgba(240, 253, 250, 0.78);
  color: rgb(15 118 110);
  font-size: 0.68rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.inventory-control-stack {
  display: grid;
  gap: 0.5rem;
}

.inventory-control-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  min-height: 3.15rem;
  padding: 0.48rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.78);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.inventory-control-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
}

.inventory-control-copy {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.inventory-control-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 2rem;
  width: 2rem;
  height: 2rem;
  border-radius: 0.65rem;
  background: rgba(241, 245, 249, 0.86);
  color: rgb(100 116 139);
}

.inventory-control-text {
  display: grid;
  gap: 0.14rem;
  min-width: 0;
}

.inventory-control-label {
  color: rgb(51 65 85);
  font-size: 0.76rem;
  font-weight: 900;
  line-height: 1.2;
  text-wrap: balance;
}

.inventory-control-score {
  width: max-content;
  max-width: 100%;
  padding: 0.12rem 0.36rem;
  border-radius: 0.45rem;
  background: rgba(241, 245, 249, 0.82);
  color: rgb(100 116 139);
  font-size: 0.64rem;
  font-weight: 900;
  line-height: 1.1;
}

.inventory-control-stepper {
  display: grid;
  grid-template-columns: 2.45rem 2.65rem 2.45rem;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.inventory-stepper-hit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.45rem;
  min-height: 2.5rem;
  color: rgb(51 65 85);
  transition: background 150ms ease, color 150ms ease, transform 150ms ease;
}

.inventory-stepper-hit:not(:disabled):hover,
.inventory-stepper-hit:not(:disabled):focus-visible {
  color: rgb(15 118 110);
  background: rgba(204, 251, 241, 0.78);
}

.inventory-stepper-hit:not(:disabled):active {
  transform: scale(0.96);
}

.inventory-stepper-hit:focus-visible {
  outline: 2px solid rgba(20, 184, 166, 0.5);
  outline-offset: -2px;
}

.inventory-stepper-hit:disabled {
  cursor: not-allowed;
  color: rgb(203 213 225);
  background: rgba(248, 250, 252, 0.66);
}

.inventory-stepper-minus {
  border-right: 1px solid rgba(148, 163, 184, 0.18);
}

.inventory-stepper-plus {
  border-left: 1px solid rgba(148, 163, 184, 0.18);
}

.inventory-stepper-value {
  color: rgb(15 23 42);
  font-size: 1rem;
  font-weight: 950;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.inventory-control-seedling {
  border-color: rgba(20, 184, 166, 0.18);
}

.inventory-control-seedling .inventory-control-icon,
.inventory-control-seedling .inventory-control-score {
  color: rgb(15 118 110);
  background: rgba(204, 251, 241, 0.72);
}

.inventory-control-preDecor {
  border-color: rgba(14, 165, 233, 0.18);
}

.inventory-control-preDecor .inventory-control-icon,
.inventory-control-preDecor .inventory-control-score {
  color: rgb(3 105 161);
  background: rgba(224, 242, 254, 0.84);
}

.inventory-control-decor {
  border-color: rgba(16, 185, 129, 0.2);
}

.inventory-control-decor .inventory-control-icon,
.inventory-control-decor .inventory-control-score {
  color: rgb(4 120 87);
  background: rgba(209, 250, 229, 0.82);
}

.inventory-control-rare {
  border-color: rgba(245, 158, 11, 0.22);
}

.inventory-control-rare .inventory-control-icon,
.inventory-control-rare .inventory-control-score {
  color: rgb(146 64 14);
  background: rgba(254, 243, 199, 0.9);
}

.inventory-release-panel {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.65rem;
  padding-top: 0.65rem;
  border-top: 1px dashed rgba(148, 163, 184, 0.28);
}

.inventory-release-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: rgb(71 85 105);
  font-size: 0.72rem;
  font-weight: 900;
}

.inventory-release-heading span {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
}

.inventory-release-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.inventory-control-compact {
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: 0.48rem;
}

.inventory-control-compact .inventory-control-stepper {
  grid-template-columns: 2.45rem minmax(2rem, 1fr) 2.45rem;
}

.inventory-control-releaseNoDecor {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(248, 250, 252, 0.74);
}

.inventory-control-releaseNoDecor .inventory-control-icon,
.inventory-control-releaseNoDecor .inventory-control-score {
  color: rgb(71 85 105);
  background: rgba(226, 232, 240, 0.84);
}

.inventory-control-releaseWithDecor {
  border-color: rgba(20, 184, 166, 0.2);
  background: rgba(240, 253, 250, 0.55);
}

.inventory-control-releaseWithDecor .inventory-control-icon,
.inventory-control-releaseWithDecor .inventory-control-score {
  color: rgb(15 118 110);
  background: rgba(204, 251, 241, 0.78);
}

.inventory-mobile-control-grid {
  display: none;
}

.inventory-mobile-collapsed-summary {
  display: none;
}

.inventory-event-log {
  padding-top: 0.85rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.inventory-event-log-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  min-height: 2.35rem;
  padding: 0.42rem 0.55rem;
  border: 1px solid rgba(20, 184, 166, 0.14);
  border-radius: 0.72rem;
  background: rgba(240, 253, 250, 0.52);
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.inventory-event-log-toggle:hover,
.inventory-event-log-toggle:focus-visible {
  border-color: rgba(20, 184, 166, 0.26);
  background: rgba(240, 253, 250, 0.82);
  outline: none;
}

.inventory-event-log-toggle:active {
  transform: scale(0.995);
}

.inventory-event-log-summary {
  display: inline-flex;
  align-items: center;
  gap: 0.26rem;
  flex: 0 0 auto;
  color: rgb(71 85 105);
  font-size: 0.72rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.inventory-event-log-body {
  transform-origin: top;
  will-change: height, opacity, transform;
}

.inventory-event-list {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.inventory-event-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: rgb(71 85 105);
  font-size: 0.75rem;
  font-weight: 700;
}

.inventory-event-list time {
  flex: 0 0 auto;
  color: rgb(148 163 184);
  font-size: 0.7rem;
}

.inventory-event-empty {
  margin-top: 0.5rem;
  color: rgb(148 163 184);
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .inventory-panel-header {
    align-items: stretch;
    flex-direction: column;
  }

  .inventory-panel-actions {
    justify-content: flex-start;
  }

  .inventory-item-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .inventory-item-cell {
    transition:
      border-color 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease;
  }

  .inventory-item-cell-mobile-collapsed {
    border-color: rgba(20, 184, 166, 0.22);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(240, 253, 250, 0.66));
    box-shadow: 0 6px 14px rgba(15, 118, 110, 0.05);
  }

  .inventory-item-title {
    align-items: flex-start;
    margin-bottom: 0.46rem;
  }

  .rare-progress-panel {
    gap: 0.42rem;
    padding: 0.54rem 0.62rem;
  }

  .rare-progress-track-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.34rem;
  }

  .rare-progress-meta {
    justify-content: space-between;
  }

  .rare-progress-next {
    font-size: 0.66rem;
  }

  .inventory-control-stack,
  .inventory-release-panel {
    display: none;
  }

  .inventory-mobile-control-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.42rem;
    transform-origin: top;
  }

  .inventory-mobile-collapsed-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    width: 100%;
    min-height: 2.72rem;
    padding: 0.5rem 0.58rem;
    border: 1px solid rgba(20, 184, 166, 0.18);
    border-radius: 0.76rem;
    background: rgba(240, 253, 250, 0.78);
    color: rgb(15 82 73);
    font-size: 0.76rem;
    font-weight: 900;
    transform-origin: top;
  }

  .inventory-mobile-collapsed-summary span {
    display: inline-flex;
    align-items: center;
    gap: 0.34rem;
    min-width: 0;
  }

  .inventory-mobile-collapsed-summary strong {
    flex: 0 0 auto;
    padding: 0.28rem 0.54rem;
    border: 1px solid rgba(20, 184, 166, 0.26);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.88);
    color: rgb(13 148 136);
    font-size: 0.72rem;
    font-weight: 950;
  }

  .inventory-mobile-control-card {
    display: grid;
    grid-template-rows: minmax(2.15rem, 1fr) auto;
    gap: 0.34rem;
    min-width: 0;
    min-height: 5.62rem;
    padding: 0.36rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 0.72rem;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  .mobile-span-6 {
    grid-column: span 6;
  }

  .mobile-span-3 {
    grid-column: span 3;
  }

  .mobile-span-2 {
    grid-column: span 2;
  }

  .inventory-mobile-control-head {
    display: grid;
    grid-template-columns: 1.42rem minmax(0, 1fr);
    align-items: center;
    gap: 0.28rem;
    min-width: 0;
  }

  .inventory-mobile-control-card .inventory-control-icon {
    width: 1.42rem;
    height: 1.42rem;
    flex-basis: 1.42rem;
    border-radius: 0.48rem;
  }

  .inventory-mobile-control-card .inventory-control-text {
    gap: 0.16rem;
  }

  .inventory-mobile-control-card .inventory-control-label {
    display: -webkit-box;
    overflow: hidden;
    min-height: 1.42rem;
    font-size: 0.68rem;
    line-height: 1.12;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .inventory-mobile-control-card .inventory-control-score {
    justify-self: start;
    padding: 0.08rem 0.28rem;
    border-radius: 999px;
    font-size: 0.56rem;
  }

  .inventory-mobile-control-card.mobile-strip-control {
    grid-template-columns: minmax(0, 1fr) minmax(6.45rem, 38%);
    grid-template-rows: auto;
    align-items: center;
    gap: 0.48rem;
    min-height: 3.62rem;
    padding: 0.42rem 0.5rem;
    border-radius: 0.78rem;
  }

  .mobile-strip-control .inventory-mobile-control-head {
    grid-template-columns: 2.14rem minmax(0, 1fr);
    gap: 0.52rem;
  }

  .mobile-strip-control .inventory-control-icon {
    width: 2.14rem;
    height: 2.14rem;
    flex-basis: 2.14rem;
    border-radius: 50%;
  }

  .mobile-strip-control .inventory-control-label {
    min-height: 0;
    font-size: 0.82rem;
    line-height: 1.15;
  }

  .mobile-strip-control .inventory-control-score {
    margin-top: 0.06rem;
    font-size: 0.58rem;
  }

  .mobile-strip-control .inventory-control-stepper {
    grid-template-columns: 1.94rem minmax(1.7rem, 1fr) 1.94rem;
  }

  .mobile-strip-control .inventory-stepper-hit {
    min-width: 1.94rem;
    min-height: 2.04rem;
  }

  .inventory-mobile-control-card.mobile-span-2 .inventory-mobile-control-head {
    grid-template-columns: 1.32rem minmax(0, 1fr);
    gap: 0.24rem;
  }

  .inventory-mobile-control-card.mobile-span-2 .inventory-control-icon {
    width: 1.32rem;
    height: 1.32rem;
    flex-basis: 1.32rem;
  }

  .inventory-mobile-control-card.mobile-span-2 .inventory-control-label {
    min-height: 1.52rem;
    font-size: 0.64rem;
  }

  .inventory-control-card {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
  }

  .inventory-control-stepper {
    grid-template-columns: 1.82rem minmax(1.35rem, 1fr) 1.82rem;
    width: 100%;
    border-radius: 0.65rem;
  }

  .inventory-stepper-hit {
    min-width: 1.82rem;
    min-height: 2.1rem;
  }

  .inventory-stepper-value {
    font-size: 0.9rem;
  }
}

@media (max-width: 380px) {
  .inventory-mobile-control-grid {
    gap: 0.36rem;
  }

  .inventory-mobile-control-card {
    min-height: 5.5rem;
    padding: 0.34rem;
  }

  .inventory-mobile-control-card.mobile-strip-control {
    grid-template-columns: minmax(0, 1fr) minmax(5.9rem, 36%);
    min-height: 3.48rem;
    padding: 0.38rem 0.44rem;
  }

  .mobile-strip-control .inventory-mobile-control-head {
    grid-template-columns: 1.98rem minmax(0, 1fr);
    gap: 0.42rem;
  }

  .mobile-strip-control .inventory-control-icon {
    width: 1.98rem;
    height: 1.98rem;
    flex-basis: 1.98rem;
  }

  .mobile-strip-control .inventory-control-label {
    font-size: 0.76rem;
  }

  .inventory-mobile-control-card .inventory-control-label {
    font-size: 0.62rem;
  }

  .inventory-control-stepper {
    grid-template-columns: 1.7rem minmax(1.25rem, 1fr) 1.7rem;
  }

  .inventory-stepper-hit {
    min-width: 1.7rem;
  }
}
</style>
