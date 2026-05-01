<template>
  <div class="h-full flex flex-col pt-2 pb-2 px-1">
    <!-- Header: Simple & Clean (Pikmin Bloom Style) -->
    <div class="flex items-center justify-between mb-4 px-2">
      <div class="flex items-center gap-2">
         <Icon name="lucide:footprints" class="text-emerald-500 transform -rotate-45" />
         <h2 class="text-on-glass text-white-halo text-lg font-black tracking-tight">{{ $t('home.near_complete.title') }}</h2>
      </div>
      <button v-if="categories.length > 3" class="glass-control text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-full transition-all">
        {{ $t('home.near_complete.view_all') }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="categories.length === 0" class="flex-1 flex flex-col items-center justify-center text-center opacity-60">
        <Icon name="lucide:flower-2" class="text-4xl text-emerald-300 mb-2 animate-pulse" />
        <p class="text-sm font-bold text-gray-600">{{ $t('home.near_complete.empty') }}</p>
    </div>

    <!-- List: Expedition Style -->
    <div v-else class="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
      <div 
        v-for="(cat, index) in categories.slice(0, 4)" 
        :key="cat.id"
        @click="$emit('select-category', cat.id)"
        class="glass-surface-readable group relative w-full rounded-2xl p-3 transition-all duration-300 cursor-pointer flex items-center gap-3 hover:-translate-y-0.5"
      >
        <!-- 1. Icon (Rounded Square like game) -->
        <div class="glass-control w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
            <img v-if="cat.icon.startsWith('http')" :src="cat.icon" class="w-10 h-10 object-contain" alt="icon" />
            <Icon v-else :name="cat.icon" class="text-2xl text-gray-700" />
        </div>

        <!-- 2. Progress Info -->
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-end mb-1">
                <span class="text-on-glass font-black text-sm truncate pr-2">{{ cat.name }}</span>
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
        <div class="glass-control w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
             <Icon name="lucide:gift" class="w-4 h-4 text-orange-500" />
        </div>
      </div>
    </div>
  </div>
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

defineProps<{
  categories: NearCompleteCategory[]
}>();

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

.near-badge {
  flex-shrink: 0;
  max-width: 86px;
  color: rgb(0, 133, 35);
  line-height: 1.15;
  text-align: center;
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
