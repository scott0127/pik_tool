<template>
  <section class="collection-inventory-panel">
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
          <span v-if="visibleRareCount > 0" class="inventory-chip inventory-chip-rare">
            <Icon name="lucide:sparkles" class="w-3.5 h-3.5" />
            {{ labels.rare }} {{ visibleRareCount }}
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
          @click.stop="isExpanded = !isExpanded"
        >
          <Icon :name="isExpanded ? 'lucide:chevron-up' : 'lucide:sliders-horizontal'" class="w-4 h-4" />
          {{ isExpanded ? labels.close : labels.manage }}
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-220 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isExpanded" class="inventory-panel-body">
        <div v-if="summary.hasRareDecor" class="rare-progress-panel">
          <div class="rare-progress-main">
            <div>
              <p class="rare-progress-title">
                <Icon name="lucide:sparkles" class="w-4 h-4" />
                {{ labels.scoreRules }}
              </p>
              <p class="rare-progress-value">
                {{ labels.currentScore }} Lv. {{ rareProgress.level }} · {{ rareProgress.points }} pt
              </p>
            </div>
            <div class="rare-progress-next">
              <span v-if="rareProgress.pointsToNextRareLevel !== null">
                {{ labels.nextLevel }} {{ rareProgress.pointsToNextRareLevel }}
              </span>
              <span v-else>{{ labels.maxLevel }}</span>
            </div>
          </div>

          <div class="rare-rule-grid">
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
              >
                <div class="inventory-item-title">
                  <div class="inventory-item-main">
                    <span class="inventory-pikmin-badge" :class="pikminBadgeClass(item.pikminType)">
                      {{ t(`pikmin_types_short.${item.pikminType}`) }}
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
                    v-for="control in getPrimaryControls(row.isRare)"
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
              </article>
            </div>
          </div>
        </div>

        <div class="inventory-event-log">
          <div class="inventory-event-log-title">
            <Icon name="lucide:list-restart" class="w-4 h-4" />
            {{ labels.recentEvents }}
          </div>
          <ol v-if="recentEvents.length > 0" class="inventory-event-list">
            <li v-for="event in recentEvents" :key="event.id">
              <span>{{ formatEvent(event) }}</span>
              <time>{{ formatEventTime(event.createdAt) }}</time>
            </li>
          </ol>
          <p v-else class="inventory-event-empty">{{ labels.noEvents }}</p>
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
      releaseSummary: 'Released none/decor',
      manage: 'Manage',
      close: 'Close',
      rarePoints: 'Rare Decor Points',
      scoreRules: 'Rare Decor Point rules',
      currentScore: 'Current',
      nextLevel: 'To next Lv.',
      maxLevel: 'Max tracked',
      recentEvents: 'Recent trace',
      noEvents: 'No trace events yet',
      pluckSeedling: 'Pluck small seedling',
      pluckHugeSeedling: 'Pluck huge seedling',
      giftExpedition: '4-heart gift expedition',
      decorSource: 'Huge seedling or gift',
      releaseLine: 'Released',
      releaseNoDecor: 'Released without decor',
      releaseWithDecor: 'Released with decor',
      releaseNoDecorShort: 'No decor',
      releaseWithDecorShort: 'With decor',
      inventoryOnly: 'Inventory',
      noScore: 'No score',
      recordTotal: 'Records',
      decrease: 'Decrease',
      increase: 'Increase',
    };
  }

  return {
    level: '等級',
    seedling: '小盆栽',
    preDecor: '小盆栽拔苗未滿4心',
    decor: '大盆栽拔苗/滿4心拿裝飾品',
    rare: '已升稀有',
    releaseSummary: '放生 無/有裝飾',
    manage: '管理',
    close: '收合',
    rarePoints: '稀有裝飾點數',
    scoreRules: '稀有裝飾點數規則',
    currentScore: '目前',
    nextLevel: '距下級',
    maxLevel: '已達追蹤上限',
    recentEvents: '近期紀錄',
    noEvents: '尚無紀錄',
    pluckSeedling: '小盆栽拔苗',
    pluckHugeSeedling: '大盆栽拔苗',
    giftExpedition: '滿4心拿裝飾品',
    decorSource: '大盆栽或4心禮物',
    releaseLine: '放生',
    releaseNoDecor: '無裝飾品放生',
    releaseWithDecor: '有裝飾品放生',
    releaseNoDecorShort: '無裝飾',
    releaseWithDecorShort: '有裝飾',
    inventoryOnly: '庫存',
    noScore: '不計分',
    recordTotal: '紀錄',
    decrease: '減少',
    increase: '增加',
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
    icon: 'lucide:sprout',
    tone: 'seedling',
    scoreText: labels.value.inventoryOnly,
  },
  {
    id: 'preDecor',
    label: labels.value.preDecor,
    icon: 'lucide:heart',
    tone: 'preDecor',
    scoreText: pointText(rarePointValues.pluck_seedling),
  },
  {
    id: 'decor',
    label: labels.value.decor,
    icon: 'lucide:badge-check',
    tone: 'decor',
    scoreText: pointText(rarePointValues.gift_expedition),
  },
  {
    id: 'rare',
    label: labels.value.rare,
    icon: 'lucide:sparkles',
    tone: 'rare',
    scoreText: labels.value.noScore,
  },
]);

const releaseControls = computed<InventoryControl[]>(() => [
  {
    id: 'releaseNoDecor',
    label: labels.value.releaseNoDecorShort,
    icon: 'lucide:heart-off',
    tone: 'releaseNoDecor',
    scoreText: pointText(rarePointValues.release_no_decor),
  },
  {
    id: 'releaseWithDecor',
    label: labels.value.releaseWithDecorShort,
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

const summary = computed(() => getCategoryInventorySummary(props.categoryId));
const rareProgress = computed(() => getRareProgress(props.categoryId));
const recentEvents = computed(() => getRecentCollectionEvents(8, props.categoryId));

const isRareDecorItem = (item: DecorItem): boolean => {
  const variant = getVariant(item.categoryId, item.variantId);
  return Boolean(variant?.isRare || item.variantId.toLowerCase().includes('rare'));
};

const visibleRareCount = computed(() => {
  return getItemsByCategory(props.categoryId).reduce((total, item) => {
    if (isRareDecorItem(item)) return total;
    return total + getInventoryItem(item.id).rareCount;
  }, 0);
});

const getPrimaryControls = (isRareRow: boolean): InventoryControl[] => {
  if (!isRareRow) return primaryControls.value;
  return primaryControls.value.filter(control => control.id !== 'rare');
};

const rows = computed(() => {
  const groups = new Map<string, {
    variantId: string;
    variantName: string;
    variantNameEn: string;
    isRare: boolean;
    items: DecorItem[];
  }>();

  getItemsByCategory(props.categoryId).forEach((item) => {
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

const getItemRecordTotal = (item: DecorItem): number => {
  const inventory = getInventoryItem(item.id);
  return (
    inventory.seedlingCount +
    inventory.preDecorCount +
    inventory.decorCount +
    (isRareDecorItem(item) ? 0 : inventory.rareCount) +
    inventory.releaseNoDecorCount +
    inventory.releaseWithDecorCount
  );
};

const adjust = (itemId: string, bucket: CollectionInventoryBucket, delta: number) => {
  adjustInventory(itemId, bucket, delta);
};

const pikminBadgeClass = (pikminType: PikminType) => {
  const textClass = pikminType === 'white' || pikminType === 'yellow' ? 'text-gray-800' : 'text-white';
  return `${PIKMIN_TYPE_COLORS[pikminType]} ${textClass}`;
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
  gap: 1rem;
  margin-top: 1rem;
}

.rare-progress-panel {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 0.85rem;
  background: rgba(255, 251, 235, 0.64);
}

.rare-progress-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.rare-progress-title {
  color: rgb(146 64 14);
}

.rare-progress-value {
  margin-top: 0.15rem;
  color: rgb(120 53 15);
  font-weight: 900;
}

.rare-progress-next {
  color: rgb(146 64 14);
  font-size: 0.78rem;
  font-weight: 800;
}

.rare-rule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: 0.5rem;
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
  gap: 0.95rem;
}

.inventory-row-group {
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  padding-top: 0.85rem;
}

.inventory-row-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.7rem;
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
  gap: 0.75rem;
}

.inventory-item-cell {
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 0.85rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 252, 0.76));
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.inventory-item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  margin-bottom: 0.7rem;
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
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 900;
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

.inventory-event-log {
  padding-top: 0.85rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
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
  .inventory-panel-header,
  .rare-progress-main {
    align-items: stretch;
    flex-direction: column;
  }

  .inventory-panel-actions {
    justify-content: flex-start;
  }

  .inventory-item-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .inventory-item-title {
    align-items: flex-start;
  }

  .inventory-control-card {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
  }

  .inventory-control-stepper {
    grid-template-columns: 3rem minmax(2rem, 1fr) 3rem;
    width: 100%;
  }

  .inventory-stepper-hit {
    min-width: 3rem;
  }

  .inventory-release-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
