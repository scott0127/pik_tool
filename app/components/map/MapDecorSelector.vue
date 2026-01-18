<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div 
      v-if="modelValue"
      class="absolute inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
            <div class="flex items-center gap-2">
            <span class="text-2xl">➕</span>
            <div>
              <h3 class="font-bold text-gray-800">{{ $t('map.report.title') }}</h3>
              <p class="text-xs text-gray-500">{{ $t('map.report.subtitle') }}</p>
            </div>
          </div>
          <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- List -->
        <div class="overflow-y-auto p-4 grid grid-cols-4 gap-2">
          <button
            v-for="decor in allDecors"
            :key="decor.id"
            @click="toggleDecorReport(decor.id)"
            :disabled="loading"
            :class="[
              'flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center h-24',
              hasAddedDecor(cellId!, decor.id)
                ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200 cursor-default opacity-50'
                : 'bg-gray-50 border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md'
            ]"
          >
            <div class="text-3xl mb-1">{{ decor.icon }}</div>
            <div class="text-xs text-gray-700 font-medium leading-tight line-clamp-2">
                {{ $t('decor_types.' + decor.id) }}
            </div>
            <div v-if="hasAddedDecor(cellId!, decor.id)" class="text-[10px] text-emerald-700 font-bold mt-1">
                {{ $t('map.report.reported') }}
            </div>
          </button>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
            {{ $t('map.report.footer') }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useCellReports } from '~/composables/useCellReports';
import type { DecorRule } from '~/types/map';

const props = defineProps<{
  modelValue: boolean;
  cellId: string | null;
  allDecors: DecorRule[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

// We can perform reports here directly, or emit "report" event.
// Since the original code did it inline, doing it here encapsulates it well.
const { submitReport, hasAddedDecor } = useCellReports();
const { t } = useI18n();
const loading = ref(false);

const toggleDecorReport = async (decorId: string) => {
    if (!props.cellId) return;
    
    // Check if already added (optimistic check)
    if (hasAddedDecor(props.cellId, decorId)) {
        alert(t('map.report.already_reported', '您已經回報過這個飾品了！')); 
        return; 
    }

    try {
        loading.value = true;
        await submitReport(props.cellId, 'missing_decor', decorId);
        // Keep open for multi-select
    } catch (e: any) {
        alert(t('map.report.report_failed', '回報失敗：') + (e.message || t('map.error_unknown', '未知錯誤')));
    } finally {
        loading.value = false;
    }
};
</script>
