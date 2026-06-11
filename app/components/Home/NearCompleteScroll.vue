<template>
  <LiquidGlassCard
    :blur-value="16"
    :glass-opacity="0.15"
    :bg-x="bgX"
    :bg-y="bgY"
    :bg-image="bgImage"
    :magnification="1.05"
    :is-draggable="false"
    class="near-complete-card h-full w-full rounded-[2.5rem] p-6 relative overflow-hidden"
  >
    <div class="near-complete-content">

      <!-- Header: Simple & Clean (Pikmin Bloom Style) -->
      <div class="near-complete-header">
        <div class="flex items-center gap-2 min-w-0">
           <Icon name="lucide:footprints" class="text-emerald-500 transform -rotate-45 shrink-0" />
           <h2 class="glass-text-plain text-gray-900 text-lg font-black tracking-tight drop-shadow-sm truncate">{{ $t('home.near_complete.title') }}</h2>
        </div>
        <button v-if="categories.length > 3" class="near-complete-button text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-full transition-all shadow-sm">
          {{ $t('home.near_complete.view_all') }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="flex-1 flex flex-col items-center justify-center text-center opacity-60 relative z-10">
          <Icon name="lucide:flower-2" class="text-4xl text-emerald-300 mb-2 animate-pulse" />
          <p class="glass-text-plain text-sm font-bold text-gray-700">{{ $t('home.near_complete.empty') }}</p>
      </div>

      <!-- List: Expedition Style -->
      <div v-else class="near-complete-list custom-scrollbar">
        <div 
          v-for="(cat, index) in categories.slice(0, 4)" 
          :key="cat.id"
          @click="$emit('select-category', cat.id)"
          class="near-complete-item group relative w-full rounded-2xl p-3 transition-all duration-300 cursor-pointer flex items-center gap-3 hover:-translate-y-0.5"
        >
          <!-- 1. Icon (Rounded Square like game) -->
          <div class="near-complete-icon w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
              <img v-if="cat.icon.startsWith('http')" :src="cat.icon" class="w-10 h-10 object-contain" alt="icon" />
              <Icon v-else :name="cat.icon" class="text-2xl text-gray-800" />
          </div>

          <!-- 2. Progress Info -->
          <div class="near-complete-info">
              <div class="near-complete-title-row">
                  <span class="near-complete-name glass-text-plain text-gray-900 font-black text-sm drop-shadow-sm">{{ cat.name }}</span>
                  <span class="near-badge text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      {{ $t('home.near_complete.remaining', { n: cat.remaining }) }}
                  </span>
              </div>

              <!-- Flower Path Progress Bar -->
              <div class="near-progress-track relative h-2.5 w-full rounded-full overflow-hidden">
                  <!-- Fill -->
                  <div class="near-progress-fill absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                       :style="{ width: `${cat.percentage}%` }">
                       <!-- Flower Pattern overlay -->
                       <div class="absolute inset-0 w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=')]"></div>
                  </div>
              </div>
          </div>

          <!-- 3. Goal (Gift) -->
          <div class="near-complete-gift w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform shadow-sm">
               <Icon name="lucide:gift" class="w-4 h-4 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  </LiquidGlassCard>
</template>

<script setup lang="ts">
// Interfaces can be moved to a shared type file later if needed
interface NearCompleteCategory {
  id: string;
  name: string;
  icon: string;
  collected: number;
  total: number;
  remaining: number;
  percentage: number;
}

interface Props {
  categories: NearCompleteCategory[];
}

const props = defineProps<Props>();

const { bgXSpring: bgX, bgYSpring: bgY, bgImage } = useParallax();

defineEmits(['select-category']);

const pikminColors = [
    'bg-red-500', 'bg-yellow-400', 'bg-blue-500', 'bg-purple-600', 
    'bg-slate-100', 'bg-pink-400', 'bg-slate-600', 'bg-cyan-300'
];

const getPikminColorClass = (index: number) => {
    return pikminColors[(index - 1) % pikminColors.length];
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 185, 47, 0.2);
  border-radius: 20px;
}

.near-complete-card {
  isolation: isolate;
}

.near-complete-content {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 1rem;
}

.near-complete-header {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-inline: 0.5rem;
}

.near-complete-list {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding: 0.12rem 0.5rem 0.25rem 0;
}

.near-complete-info {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
  gap: 0.35rem;
}

.near-complete-title-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.near-complete-name {
  display: block;
  min-width: 0;
  overflow: hidden;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.near-complete-button,
.near-complete-icon,
.near-complete-item,
.near-complete-gift {
  border: 1px solid rgba(255, 255, 255, 0.64);
  background: rgba(255, 255, 255, 0.34);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 10px 20px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(8px) saturate(1.1);
  -webkit-backdrop-filter: blur(8px) saturate(1.1);
}

.near-complete-button:hover,
.near-complete-item:hover {
  background: rgba(255, 255, 255, 0.48);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.78) inset,
    0 16px 28px rgba(15, 23, 42, 0.12);
}

.near-complete-card :where(h2, p, span):not([class*="text-emerald"]):not(.near-badge) {
  -webkit-text-fill-color: currentColor;
  -webkit-text-stroke: 0;
  paint-order: normal;
  text-shadow:
    0 1px 2px rgba(255, 255, 255, 0.86),
    0 7px 16px rgba(15, 23, 42, 0.16);
}

.near-badge {
  justify-self: end;
  flex-shrink: 0;
  max-width: 7.25rem;
  overflow: hidden;
  color: rgb(0, 133, 35);
  line-height: 1.15;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.78);
  background: rgba(214, 255, 224, 0.62);
  box-shadow:
    0 6px 16px rgba(0, 133, 35, 0.16),
    0 1px 0 rgba(255, 255, 255, 0.82) inset;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.72);
}

.near-progress-track {
  border: 1px solid rgba(255, 255, 255, 0.74);
  background: rgba(15, 23, 42, 0.18);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.64) inset,
    0 5px 12px rgba(15, 23, 42, 0.18) inset;
}

.near-progress-fill {
  background: linear-gradient(90deg, rgba(0, 185, 47, 0.95), rgba(43, 234, 93, 0.98));
  box-shadow:
    0 0 10px rgba(0, 185, 47, 0.36),
    0 1px 0 rgba(255, 255, 255, 0.58) inset;
}
</style>
