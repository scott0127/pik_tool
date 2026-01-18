<template>
  <div class="h-full flex flex-col pt-2 pb-2 px-1">
    <!-- Header: Simple & Clean (Pikmin Bloom Style) -->
    <div class="flex items-center justify-between mb-4 px-2">
      <div class="flex items-center gap-2">
         <Icon name="lucide:footprints" class="text-emerald-500 transform -rotate-45" />
         <h2 class="text-lg font-black text-gray-800 tracking-tight">{{ $t('home.near_complete.title') }}</h2>
      </div>
      <button v-if="categories.length > 3" class="text-xs font-bold text-emerald-600 bg-white/40 hover:bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm">
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
        class="group relative w-full bg-white/40 hover:bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-white/50 hover:border-emerald-200 transition-all duration-300 cursor-pointer flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      >
        <!-- 1. Icon (Rounded Square like game) -->
        <div class="w-12 h-12 rounded-xl bg-white/80 shadow-inner border border-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
            <img v-if="cat.icon.startsWith('http')" :src="cat.icon" class="w-10 h-10 object-contain" alt="icon" />
            <Icon v-else :name="cat.icon" class="text-2xl text-gray-700" />
        </div>

        <!-- 2. Progress Info -->
        <div class="flex-1 min-w-0">
            <div class="flex justify-between items-end mb-1">
                <span class="font-bold text-gray-800 text-sm truncate">{{ cat.name }}</span>
                <span class="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded-md">
                    {{ $t('home.near_complete.remaining', { n: cat.remaining }) }}
                </span>
            </div>

            <!-- Flower Path Progress Bar -->
            <div class="relative h-2.5 w-full bg-white/50 rounded-full border border-white/30 overflow-hidden">
                <!-- Fill -->
                <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-300 to-lime-400 rounded-full transition-all duration-1000 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-lime-500"
                     :style="{ width: `${cat.percentage}%` }">
                     <!-- Flower Pattern overlay -->
                     <div class="absolute inset-0 w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=')]"></div>
                </div>
            </div>
        </div>

        <!-- 3. Goal (Gift) -->
        <div class="w-8 h-8 rounded-full bg-orange-100/80 border border-white shadow-sm flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
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
  background-color: rgba(16, 185, 129, 0.2);
  border-radius: 20px;
}
</style>
