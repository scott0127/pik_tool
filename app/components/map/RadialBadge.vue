<template>
  <div
    class="decor-field-marker relative select-none"
    :style="markerStyle"
    :title="titleText"
  >
    <div class="decor-badge-anchor" />
    <div class="decor-badge-stem" />

    <div
      class="decor-badge-shell absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[88%] items-center"
      :class="[markerClass, { 'is-compact': compact }]"
    >
      <div
        class="decor-badge-count relative flex shrink-0 items-center justify-center border-2"
        :class="countClass"
      >
        <span>{{ count }}</span>
      </div>

      <div class="decor-badge-content relative min-w-0 flex-1">
        <div class="decor-badge-icons flex items-center">
          <div
            v-for="item in iconItems"
            :key="item.id"
            class="decor-badge-icon flex shrink-0 items-center justify-center"
            :title="item.name || item.id"
          >
            <Icon
              v-if="item.iconName"
              :name="item.iconName"
              class="h-4 w-4"
            />
            <span v-else class="text-[11px] leading-none">{{ item.icon || "?" }}</span>
          </div>
        </div>

        <span class="decor-badge-label block truncate">{{ summaryLabel }}</span>
      </div>

      <span class="decor-badge-state" :class="statusClass">{{ statusLabel }}</span>
      <span v-if="addedCount > 0" class="decor-badge-report">+{{ addedCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface RadialItem {
  id: string;
  name?: string;
  iconName?: string;
  icon?: string;
}

const props = withDefaults(
  defineProps<{
    items: RadialItem[];
    count: number;
    poiCount?: number;
    addedCount?: number;
    isReported?: boolean;
    centerTitle?: string;
    size?: number;
    maxDisplay?: number;
    singleLabel?: string;
    compact?: boolean;
  }>(),
  {
    items: () => [],
    poiCount: 0,
    addedCount: 0,
    isReported: false,
    centerTitle: "飾品類型",
    size: 104,
    maxDisplay: 3,
    singleLabel: "純種",
    compact: false,
  },
);

const safeItems = computed(() => props.items || []);
const iconItems = computed(() => safeItems.value.slice(0, Math.min(props.maxDisplay, 3)));

const markerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${Math.round(props.size * 0.84)}px`,
}));

const statusLabel = computed(() => {
  if (props.isReported) return "已回報";
  if (props.count <= 1) return "純種";
  if (props.count <= 3) return "混合";
  return "複雜";
});

const statusClass = computed(() => {
  if (props.isReported) return "is-reported border-sky-100/90 text-sky-800";
  if (props.count <= 1) return "is-pure border-emerald-100/90 text-emerald-800";
  if (props.count <= 3) return "is-mixed border-amber-100/90 text-amber-800";
  return "is-complex border-violet-100/90 text-violet-800";
});

const markerClass = computed(() => {
  if (props.isReported) return "border-violet-100/80";
  if (props.count <= 1) return "border-emerald-100/80";
  if (props.count <= 3) return "border-amber-100/80";
  return "border-rose-100/80";
});

const countClass = computed(() => {
  if (props.isReported) return "border-violet-200/95";
  if (props.count <= 1) return "border-emerald-200/95";
  if (props.count <= 3) return "border-amber-200/95";
  return "border-rose-200/95";
});

const summaryLabel = computed(() => {
  const names = safeItems.value.map((item) => item.name || item.id).filter(Boolean);
  if (names.length === 0) {
    if (props.addedCount > 0) return `${props.addedCount} 回報`;
    if (props.poiCount > 0) return `${props.poiCount} POI`;
    return props.singleLabel;
  }
  if (props.count <= 2) return names.slice(0, 2).join(" / ");
  return names[0];
});

const titleText = computed(() => {
  const names = safeItems.value.map((item) => item.name || item.id).join(" / ");
  return names ? `${statusLabel.value}: ${names}` : statusLabel.value;
});
</script>

<style scoped>
.decor-badge-anchor {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.58rem;
  height: 0.58rem;
  border: 2px solid rgba(255, 255, 255, 0.96);
  border-radius: 999px;
  background: rgb(20 184 166);
  box-shadow: 0 2px 9px rgba(15, 118, 110, 0.34);
  transform: translate(-50%, -50%);
}

.decor-badge-stem {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 1.35rem;
  background: linear-gradient(to top, rgba(20, 184, 166, 0.5), transparent);
  transform: translate(-50%, -103%);
}

.decor-badge-shell {
  width: 6.7rem;
  min-height: 3rem;
  gap: 0.38rem;
  padding: 0.35rem 0.38rem;
  overflow: visible;
  border-width: 1px;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.18),
    0 1px 0 rgba(255, 255, 255, 0.94) inset;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transform-origin: 50% 100%;
  transition:
    width 160ms ease,
    min-height 160ms ease,
    padding 160ms ease,
    border-radius 160ms ease;
}

.decor-badge-shell::after {
  position: absolute;
  inset: 1px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(255, 255, 255, 0.56);
  border-radius: 0.78rem;
}

.decor-badge-count {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.68rem;
  background: rgb(240 253 250);
  color: rgb(6 78 59);
  box-shadow:
    0 4px 10px rgba(15, 118, 110, 0.13),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.decor-badge-count > span {
  position: relative;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.9);
}

.decor-badge-count::after {
  position: absolute;
  inset: 1px;
  pointer-events: none;
  content: "";
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 0.6rem;
}

.decor-badge-content {
  display: grid;
  align-content: center;
  gap: 0.18rem;
}

.decor-badge-icons {
  gap: 0.18rem;
}

.decor-badge-icon {
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.42rem;
  background: rgb(248 250 252);
}

.decor-badge-label {
  max-width: 3.45rem;
  color: rgb(51 65 85);
  font-size: 0.58rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0;
}

.decor-badge-state,
.decor-badge-report {
  position: absolute;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.05rem;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 0.38rem;
  background: rgb(255 255 255);
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.14);
  font-size: 0.52rem;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.decor-badge-state {
  top: -0.48rem;
  right: 0.38rem;
  padding-inline: 0.36rem;
}

.decor-badge-report {
  right: -0.3rem;
  bottom: -0.28rem;
  min-width: 1.05rem;
  padding-inline: 0.24rem;
  color: rgb(124 58 237);
}

.decor-badge-shell.is-compact {
  width: 2.75rem;
  min-height: 2.75rem;
  justify-content: center;
  gap: 0;
  padding: 0.2rem;
  border-radius: 0.82rem;
}

.decor-badge-shell.is-compact::after {
  border-radius: 0.74rem;
}

.decor-badge-shell.is-compact .decor-badge-content,
.decor-badge-shell.is-compact .decor-badge-report {
  display: none;
}

.decor-badge-shell.is-compact .decor-badge-count {
  width: 2.18rem;
  height: 2.18rem;
}

.decor-badge-shell.is-compact .decor-badge-count > span {
  font-size: 1.02rem;
}

.decor-badge-shell.is-compact .decor-badge-state {
  top: -0.19rem;
  right: -0.19rem;
  width: 0.68rem;
  min-width: 0.68rem;
  height: 0.68rem;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0.12rem 0.3rem rgba(15, 23, 42, 0.16);
  font-size: 0;
}

.decor-badge-shell.is-compact .decor-badge-state.is-reported {
  color: #0284c7;
}

.decor-badge-shell.is-compact .decor-badge-state.is-pure {
  color: #059669;
}

.decor-badge-shell.is-compact .decor-badge-state.is-mixed {
  color: #d97706;
}

.decor-badge-shell.is-compact .decor-badge-state.is-complex {
  color: #7c3aed;
}

@media (prefers-reduced-motion: reduce) {
  .decor-badge-shell {
    transition-duration: 0.01ms;
  }
}
</style>
