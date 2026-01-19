<template>
  <!-- Top-Right: Navigation Controls (Zoom & Location) -->
  <div class="absolute top-16 md:top-20 right-3 md:right-4 flex flex-col gap-3 z-[999] items-end">
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
      class="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-100 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all"
      :title="locationError || $t('map.user_location')"
    >
      <svg v-if="isLocating" class="animate-spin h-6 w-6 text-emerald-500" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="locationError ? 'text-red-500' : 'text-gray-700'" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
      </svg>
    </button>

    <!-- Scanner Button -->
    <div class="relative group">
     <button
        @click="$emit('toggle-scanner')"
        class="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-100 transition-all active:scale-95"
        :class="isScannerMode ? 'bg-blue-600 border-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'"
        :title="isScannerMode ? '關閉掃描器' : '開啟掃描器'"
      >
        <span class="text-xl">📡</span>
      </button>
      
      <!-- Scanner Tooltip (Left side) -->
      <div class="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[2000] pointer-events-none">
          <div v-if="isScannerMode" class="font-bold text-blue-300">掃描器已開啟</div>
          <div v-else class="font-bold">開啟掃描器</div>
          <div class="text-[10px] text-gray-400 mt-0.5">顯示 120m 範圍</div>
      </div>
    </div>

    <!-- Zoom Indicator / Controls -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
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
