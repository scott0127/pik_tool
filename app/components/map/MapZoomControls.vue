<template>
  <!-- Top-Right: Navigation Controls (Zoom & Location) -->
  <div class="map-navigation-controls absolute flex flex-col z-[999] items-end">
    <!-- UI Control Buttons (Grid/Pin/Pure toggle) - Originally inside Map.vue but could be passed here? 
         Actually, the provided code in Map.vue had these separate. 
         Let's keep them in Map.vue or move them here if they are "navigation"? 
         The plan said "Extract zoom and location buttons". The mode toggles were "UI Control Buttons".
         I'll stick to Zoom and Location here to match the Plan. 
         Wait, checking Map.vue... "UI 控制按鈕組" is the mode toggle. "Navigation Controls" is Zoom & Location.
         Good.
    -->

    <!-- Location Button -->
    <button
      @click="$emit('locate')"
      :disabled="isLocating"
      class="map-nav-button flex items-center justify-center transition-all"
      :title="locationError || $t('map.user_location')"
    >
      <Icon v-if="isLocating" name="lucide:loader-circle" class="h-5 w-5 animate-spin text-emerald-500" />
      <Icon v-else name="lucide:locate-fixed" class="h-5 w-5" :class="locationError ? 'text-red-500' : ''" />
    </button>

    <!-- Scanner Button -->
    <div class="relative group">
      <button
        @click="$emit('toggle-scanner')"
        class="map-nav-button flex items-center justify-center transition-all"
        :class="{ 'is-active': isScannerMode }"
        :aria-pressed="isScannerMode"
        :title="isScannerMode ? '關閉掃描器' : '開啟掃描器'"
      >
        <Icon name="lucide:scan-line" class="h-5 w-5" />
      </button>
      
      <!-- Scanner Tooltip (Left side) -->
      <div class="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[2000] pointer-events-none">
          <div v-if="isScannerMode" class="font-bold text-blue-300">掃描器已開啟</div>
          <div v-else class="font-bold">開啟掃描器</div>
          <div class="text-[10px] text-gray-400 mt-0.5">顯示 120m 範圍</div>
      </div>
    </div>

    <!-- Zoom Indicator / Controls -->
    <div class="map-zoom-status overflow-hidden flex flex-col">
        <!-- Zoom Indicator -->
        <div class="px-2 py-1.5 text-[10px] text-center font-bold text-gray-500 border-b border-gray-100 bg-gray-50">
          Lv.{{ mapZoom }}
        </div>
        <div v-if="!canSearch" class="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold text-center">
          {{ $t('map.zoom_in') }}
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mapZoom: number;
  isLocating: boolean;
  locationError: string | null;
  canSearch: boolean;
  isScannerMode?: boolean;
}>();

defineEmits<{
  (e: 'locate'): void;
  (e: 'toggle-scanner'): void;
}>();
</script>

<style scoped>
.map-navigation-controls {
  top: 4.75rem;
  right: 0.75rem;
  gap: 0.55rem;
}

.map-nav-button,
.map-zoom-status {
  width: 2.75rem;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.94);
  color: rgb(71 85 105);
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.map-nav-button {
  height: 2.75rem;
}

.map-nav-button:hover,
.map-nav-button:focus-visible {
  border-color: rgba(13, 148, 136, 0.42);
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  outline: none;
}

.map-nav-button:active {
  transform: scale(0.96);
}

.map-nav-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.map-nav-button.is-active {
  border-color: rgb(15 118 110);
  background: rgb(15 118 110);
  color: white;
  box-shadow: 0 7px 18px rgba(15, 118, 110, 0.22);
}

.map-zoom-status {
  min-height: 2.25rem;
  border-radius: 0.68rem;
}

.map-zoom-status > div:first-child {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgb(248 250 252 / 0.84);
  color: rgb(71 85 105);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 767px) {
  .map-navigation-controls {
    top: 4.65rem;
    right: 0.7rem;
    gap: 0.48rem;
  }

  .map-nav-button,
  .map-zoom-status {
    width: 2.65rem;
  }

  .map-nav-button {
    height: 2.65rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .map-nav-button {
    transition-duration: 0.01ms;
  }
}
</style>
