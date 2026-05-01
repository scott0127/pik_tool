<template>
  <div
    class="decor-field-marker relative select-none"
    :style="markerStyle"
    :title="titleText"
  >
    <div class="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 bg-emerald-400/90 shadow-[0_2px_9px_rgba(6,78,59,0.35)]" />
    <div class="absolute left-1/2 top-1/2 h-7 w-px -translate-x-1/2 -translate-y-[103%] bg-gradient-to-t from-emerald-400/45 to-transparent" />

    <div
      class="liquid-glass-shell absolute left-1/2 top-1/2 flex w-[124px] -translate-x-1/2 -translate-y-[82%] items-center gap-1.5 overflow-hidden rounded-[20px] border p-1.5"
      :class="markerClass"
    >
      <div class="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.92)_0,rgba(255,255,255,0.32)_24%,transparent_46%),radial-gradient(circle_at_86%_82%,rgba(45,212,191,0.34)_0,transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_48%,rgba(20,184,166,0.16))]" />
      <div class="pointer-events-none absolute inset-x-3 top-1 h-px bg-white/95 shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
      <div class="pointer-events-none absolute -left-8 -top-10 h-24 w-12 rotate-[30deg] bg-white/34 blur-[1px]" />
      <div class="pointer-events-none absolute -right-5 bottom-0 h-12 w-16 rounded-full bg-cyan-200/26 blur-md" />

      <div
        class="liquid-glass-count relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border-2"
        :class="countClass"
      >
        <div class="pointer-events-none absolute inset-0 rounded-[15px] bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.96)_0,rgba(255,255,255,0.48)_30%,transparent_58%),linear-gradient(145deg,rgba(255,255,255,0.22),rgba(20,184,166,0.14))]" />
        <div class="pointer-events-none absolute inset-x-1.5 top-1 h-px bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
        <div class="absolute -top-1 -right-0.5 h-3 w-4 rotate-[-18deg] rounded-[100%_0] bg-emerald-300/90 shadow-sm" />
        <div class="absolute left-2 top-1.5 h-2 w-5 rounded-full bg-white/72 blur-[1px]" />
        <span class="relative text-[24px] font-black leading-none text-emerald-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">{{ count }}</span>
      </div>

      <div class="relative min-w-0 flex-1">
        <div class="mb-1 flex items-center gap-1">
          <span
            class="liquid-glass-pill inline-flex min-w-[30px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-1.5 py-[2px] text-[10px] font-black leading-none tracking-normal"
            :class="statusClass"
          >
            {{ statusLabel }}
          </span>
          <span
            v-if="overflowCount > 0"
            class="liquid-glass-pill inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/80 px-1.5 py-[2px] text-[10px] font-black leading-none text-emerald-950"
          >
            +{{ overflowCount }}
          </span>
        </div>

        <div class="flex items-center gap-1">
          <div
            v-for="item in iconItems"
            :key="item.id"
            class="liquid-glass-icon flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/80"
            :title="item.name || item.id"
          >
            <Icon
              v-if="item.iconName"
              :name="item.iconName"
              class="h-3.5 w-3.5"
            />
            <span v-else class="text-[10px] leading-none">{{ item.icon || "?" }}</span>
          </div>
        </div>

        <div
          class="relative mt-1 h-3 max-w-[66px] overflow-hidden whitespace-nowrap text-[10px] font-black leading-none tracking-normal text-emerald-950 [text-shadow:0_1px_0_rgba(255,255,255,0.95),0_0_7px_rgba(255,255,255,0.85)]"
          :title="carouselTitle"
        >
          <span v-if="carouselLabels.length <= 1" class="block truncate">
            {{ carouselLabels[0] || summaryLabel }}
          </span>
          <span
            v-else
            class="decor-name-track block"
            :style="{
              animationDuration: carouselDuration,
              animationTimingFunction: carouselTiming,
              '--label-count': carouselLabels.length,
            }"
          >
            <span
              v-for="(label, index) in carouselLabels"
              :key="`${label}-${index}`"
              class="block h-3 truncate"
            >
              {{ label }}
            </span>
          </span>
        </div>
      </div>
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
  },
);

const safeItems = computed(() => props.items || []);
const iconItems = computed(() => safeItems.value.slice(0, Math.min(props.maxDisplay, 3)));
const overflowCount = computed(() => Math.max(0, props.count - iconItems.value.length));

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
  if (props.isReported) return "border-violet-100/90 text-violet-950";
  if (props.count <= 1) return "border-emerald-100/90 text-emerald-950";
  if (props.count <= 3) return "border-amber-100/90 text-amber-950";
  return "border-rose-100/90 text-rose-950";
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

const carouselLabels = computed(() => {
  const labels = safeItems.value
    .map((item) => item.name || item.id)
    .filter((name): name is string => Boolean(name));

  if (labels.length > 0) return labels.slice(0, 6);
  return [summaryLabel.value];
});

const carouselDuration = computed(() => `${Math.max(carouselLabels.value.length, 1) * 1.7}s`);
const carouselTiming = computed(() => `steps(${Math.max(carouselLabels.value.length - 1, 1)}, end)`);

const carouselTitle = computed(() => carouselLabels.value.join(" / "));

const titleText = computed(() => {
  const names = safeItems.value.map((item) => item.name || item.id).join(" / ");
  return names ? `${statusLabel.value}: ${names}` : statusLabel.value;
});
</script>

<style scoped>
.liquid-glass-shell {
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.42), rgb(255 255 255 / 0.16) 42%, rgb(255 255 255 / 0.28)),
    color-mix(in srgb, white 26%, transparent);
  border-color: rgb(255 255 255 / 0.78);
  box-shadow:
    0 14px 24px rgb(6 78 59 / 0.18),
    0 2px 10px rgb(255 255 255 / 0.62) inset,
    0 -14px 22px rgb(15 118 110 / 0.12) inset,
    0 0 0 1px rgb(255 255 255 / 0.28) inset;
  backdrop-filter: blur(10px) saturate(1.9) contrast(1.08);
  -webkit-backdrop-filter: blur(10px) saturate(1.9) contrast(1.08);
}

.liquid-glass-shell::after {
  position: absolute;
  inset: 1px;
  pointer-events: none;
  content: "";
  border-radius: 19px;
  border: 1px solid rgb(255 255 255 / 0.36);
  box-shadow:
    5px 0 14px rgb(45 212 191 / 0.16) inset,
    -5px 0 14px rgb(59 130 246 / 0.1) inset;
}

.liquid-glass-count,
.liquid-glass-pill,
.liquid-glass-icon {
  background:
    radial-gradient(circle at 25% 18%, rgb(255 255 255 / 0.92), rgb(255 255 255 / 0.44) 34%, transparent 72%),
    linear-gradient(135deg, rgb(255 255 255 / 0.64), rgb(255 255 255 / 0.3));
  box-shadow:
    0 1px 8px rgb(255 255 255 / 0.72) inset,
    0 -5px 10px rgb(20 184 166 / 0.08) inset,
    0 3px 8px rgb(6 78 59 / 0.14);
  backdrop-filter: blur(8px) saturate(1.75);
  -webkit-backdrop-filter: blur(8px) saturate(1.75);
}

.liquid-glass-count {
  background:
    radial-gradient(circle at 22% 12%, rgb(255 255 255 / 0.72), rgb(255 255 255 / 0.22) 38%, transparent 64%),
    linear-gradient(135deg, rgb(255 255 255 / 0.36), rgb(255 255 255 / 0.12) 46%, rgb(20 184 166 / 0.18));
  box-shadow:
    0 8px 16px rgb(6 78 59 / 0.16),
    0 1px 12px rgb(255 255 255 / 0.84) inset,
    0 -10px 14px rgb(14 165 233 / 0.1) inset,
    0 0 0 1px rgb(255 255 255 / 0.34) inset;
  backdrop-filter: blur(9px) saturate(1.95) contrast(1.08);
  -webkit-backdrop-filter: blur(9px) saturate(1.95) contrast(1.08);
}

.liquid-glass-count::after {
  position: absolute;
  inset: 1px;
  pointer-events: none;
  content: "";
  border-radius: 14px;
  border: 1px solid rgb(255 255 255 / 0.42);
  box-shadow:
    3px 0 9px rgb(45 212 191 / 0.16) inset,
    -3px 0 9px rgb(59 130 246 / 0.1) inset;
}

.decor-name-track {
  animation-name: decor-name-track;
  animation-iteration-count: infinite;
}

@keyframes decor-name-track {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(calc((1 - var(--label-count)) * 0.75rem));
  }
}

@media (prefers-reduced-motion: reduce) {
  .decor-name-track {
    transform: none;
    animation: none;
  }

  .decor-name-track > span:not(:first-child) {
    display: none;
  }
}
</style>
