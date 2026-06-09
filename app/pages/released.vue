<template>
  <div class="min-h-screen pt-20 pb-24 lg:pt-24 lg:pb-8 relative">
    <!-- Background Decor (Matches app style) -->
    <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-300/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Header -->
      <div class="mb-8 text-center sm:text-left">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2 flex items-center justify-center sm:justify-start gap-2">
          <Icon name="mdi:leaf-off" class="text-emerald-500" />
          {{ $t('released.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300">{{ $t('released.subtitle') }}</p>
      </div>

      <!-- Action Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/40">
        <button
          @click="openModal()"
          class="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Icon name="line-md:plus" class="w-5 h-5" />
          {{ $t('released.add_record') }}
        </button>

        <div class="w-full sm:max-w-xs relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="line-md:search" class="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('released.form.search_placeholder')"
            class="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <!-- Stats / Counter -->
      <div v-if="getRecordCount() > 0" class="mb-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
        {{ $t('released.stats.total').replace('{count}', filteredRecords.length.toString()) }}
      </div>

      <!-- Records List -->
      <div v-if="filteredRecords.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="record in filteredRecords" 
          :key="record.id"
          class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-4 flex flex-col gap-3 group relative overflow-hidden"
        >
          <!-- Item Info -->
          <div class="flex items-start gap-4">
            <!-- Image -->
            <div class="w-16 h-16 shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center p-1 border border-white/50 dark:border-gray-600/50 shadow-inner relative">
              <img 
                :src="getRecordImageUrl(record.decorItemId) || ''" 
                alt="Decor"
                loading="lazy"
                class="w-full h-full object-contain"
                @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
              />
              <!-- Pikmin Type Indicator -->
              <div 
                class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                :class="getPikminColorClass(record.decorItemId)"
              ></div>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-800 dark:text-gray-100 truncate">
                {{ record.nickname || getDecorName(record.decorItemId) }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {{ getDecorCategoryName(record.decorItemId) }}
              </p>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <span v-if="record.location" class="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  <Icon name="lucide:map-pin" class="w-3 h-3" />
                  {{ record.location }}
                </span>
                <span class="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  <Icon name="lucide:calendar" class="w-3 h-3" />
                  {{ record.releasedAt }}
                </span>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div v-if="record.note" class="mt-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 p-2 rounded-lg italic">
            "{{ record.note }}"
          </div>

          <!-- Actions -->
          <div class="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="editRecord(record)" class="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" :title="$t('released.card.edit')">
              <Icon name="lucide:edit-2" class="w-4 h-4" />
            </button>
            <button @click="confirmDelete(record)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" :title="$t('released.card.delete')">
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="getRecordCount() === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div class="w-24 h-24 mb-6 relative">
          <div class="absolute inset-0 bg-emerald-200/50 dark:bg-emerald-900/50 rounded-full blur-xl"></div>
          <div class="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900 flex items-center justify-center transform rotate-3">
            <Icon name="mdi:leaf" class="w-12 h-12 text-emerald-400" />
          </div>
        </div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ $t('released.empty.title') }}</h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mb-6">{{ $t('released.empty.desc') }}</p>
        <button
          @click="openModal()"
          class="px-6 py-2 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors shadow-sm"
        >
          {{ $t('released.add_record') }}
        </button>
      </div>

      <!-- Empty Search Results -->
      <div v-else class="text-center py-20 text-gray-500 dark:text-gray-400">
        <Icon name="lucide:search-x" class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>找不到符合「{{ searchQuery }}」的記錄</p>
      </div>

    </div>

    <!-- Sync Status -->
    <div v-if="authStore.isAuthenticated.value" class="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500" :class="syncStatus === 'idle' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'">
      <div class="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-md text-white text-sm rounded-full shadow-lg font-medium border border-gray-700/50">
        <template v-if="syncStatus === 'pending'">
          <Icon name="line-md:loading-twotone-loop" class="w-4 h-4 text-emerald-400" />
          {{ $t('collection.sync.countdown', { n: syncCountdown }) }}
        </template>
        <template v-else-if="syncStatus === 'syncing'">
          <Icon name="line-md:cloud-upload-outline-loop" class="w-4 h-4 text-emerald-400" />
          {{ $t('collection.sync.syncing') }}
        </template>
        <template v-else-if="syncStatus === 'success'">
          <Icon name="line-md:confirm-circle" class="w-4 h-4 text-emerald-400" />
          {{ $t('collection.sync.success') }}
        </template>
        <template v-else-if="syncStatus === 'error'">
          <Icon name="line-md:close-circle" class="w-4 h-4 text-red-400" />
          {{ $t('collection.sync.error') }}
          <button @click="forceSyncNow" class="ml-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
            {{ $t('collection.sync.retry') }}
          </button>
        </template>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
        
        <div class="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Icon name="mdi:leaf-off" class="text-emerald-500" />
              {{ isEditing ? $t('released.form.title_edit') : $t('released.form.title_add') }}
            </h2>
            <button @click="closeModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Icon name="lucide:x" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
            <!-- Step 1: Select Decor -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {{ $t('released.form.step_1') }} <span class="text-red-500">*</span>
              </label>
              
              <div v-if="selectedItemData" class="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg p-1 border border-emerald-100 dark:border-emerald-700/50 relative">
                    <img :src="getImageUrl(selectedItemData.categoryId, selectedItemData.variantId, selectedItemData.pikminType) || ''" class="w-full h-full object-contain" />
                    <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800" :class="PIKMIN_TYPE_COLORS[selectedItemData.pikminType]"></div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-800 dark:text-gray-100">{{ getVariant(selectedItemData.categoryId, selectedItemData.variantId)?.name }}</div>
                    <div class="text-xs text-emerald-600 dark:text-emerald-400">{{ getCategory(selectedItemData.categoryId)?.name }}</div>
                  </div>
                </div>
                <button v-if="!isEditing" @click="selectedItemData = null" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>

              <div v-else>
                <div class="relative mb-3">
                  <Icon name="line-md:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="modalSearchQuery"
                    type="text"
                    :placeholder="$t('released.form.search_placeholder')"
                    class="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  <div 
                    v-for="item in searchResults" 
                    :key="item.id"
                    @click="selectedItemData = item"
                    class="flex flex-col items-center gap-1 p-2 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all text-center"
                  >
                    <div class="w-10 h-10 relative">
                      <img :src="getImageUrl(item.categoryId, item.variantId, item.pikminType) || ''" class="w-full h-full object-contain" />
                      <div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-gray-800" :class="PIKMIN_TYPE_COLORS[item.pikminType]"></div>
                    </div>
                    <span class="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 leading-tight mt-1">{{ getVariant(item.categoryId, item.variantId)?.name }}</span>
                  </div>
                  <div v-if="searchResults.length === 0 && modalSearchQuery" class="col-span-full text-center text-sm text-gray-500 py-4">
                    找不到符合的飾品
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Details -->
            <div class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {{ $t('released.form.step_2') }}
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-500 mb-1 ml-1">{{ $t('released.form.nickname_label') }}</label>
                  <input v-model="formData.nickname" type="text" :placeholder="$t('released.form.nickname_placeholder')" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1 ml-1">{{ $t('released.form.location_label') }}</label>
                  <input v-model="formData.location" type="text" :placeholder="$t('released.form.location_placeholder')" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                </div>
              </div>

              <div>
                <label class="block text-xs text-gray-500 mb-1 ml-1">{{ $t('released.form.date_label') }}</label>
                <input v-model="formData.releasedAt" type="date" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
              </div>

              <div>
                <label class="block text-xs text-gray-500 mb-1 ml-1">{{ $t('released.form.note_label') }}</label>
                <textarea v-model="formData.note" :placeholder="$t('released.form.note_placeholder')" rows="2" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
            <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              {{ $t('released.form.cancel') }}
            </button>
            <button 
              @click="submitForm" 
              :disabled="!selectedItemData"
              class="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('released.form.submit') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { DecorItem, ReleasedPikmin } from '~/types/decor';
import { PIKMIN_TYPE_COLORS } from '~/types/decor';

const { t } = useI18n();
const authStore = useAuthStore();
const { showToast } = useToast();
const { 
  releasedState, 
  syncStatus, 
  syncCountdown, 
  getRecords, 
  getRecordCount, 
  addRecord, 
  updateRecord, 
  deleteRecord, 
  loadFromLocal, 
  loadFromCloud, 
  forceSyncNow 
} = useReleased();
const { searchItems, getCategory, getVariant, getImageUrl, getAllDecorItems } = useDecorData();

useHead({
  title: () => t('released.title') + ' | ' + t('app.title'),
});

// Initialization
onMounted(async () => {
  loadFromLocal();
  if (authStore.isAuthenticated.value) {
    await loadFromCloud();
  }
});

// --- Search & Filter ---
const searchQuery = ref('');
const filteredRecords = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const records = getRecords();
  if (!query) return records;
  
  return records.filter(record => {
    const parts = parseDecorItemId(record.decorItemId);
    const catName = getCategory(parts.categoryId || '')?.name?.toLowerCase() || '';
    const varName = getVariant(parts.categoryId || '', parts.variantId || '')?.name?.toLowerCase() || '';
    const nick = (record.nickname || '').toLowerCase();
    const loc = (record.location || '').toLowerCase();
    
    return nick.includes(query) || catName.includes(query) || varName.includes(query) || loc.includes(query);
  });
});

// --- Modal & Form State ---
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const selectedItemData = ref<DecorItem | null>(null);
const modalSearchQuery = ref('');
const searchResults = ref<DecorItem[]>([]);

const defaultForm = () => ({
  nickname: '',
  location: '',
  releasedAt: new Date().toISOString().split('T')[0] as string,
  note: '',
});
const formData = ref(defaultForm());

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(modalSearchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!val.trim()) {
    searchResults.value = [];
    return;
  }
  searchTimeout = setTimeout(() => {
    // Limit to 20 for performance in modal
    searchResults.value = searchItems(val).slice(0, 20);
  }, 300);
});

const openModal = () => {
  isEditing.value = false;
  editingId.value = null;
  selectedItemData.value = null;
  modalSearchQuery.value = '';
  searchResults.value = [];
  formData.value = defaultForm();
  showModal.value = true;
};

const editRecord = (record: ReleasedPikmin) => {
  isEditing.value = true;
  editingId.value = record.id;
  const parts = parseDecorItemId(record.decorItemId);
  selectedItemData.value = {
    id: record.decorItemId,
    categoryId: parts.categoryId || '',
    variantId: parts.variantId || '',
    pikminType: parts.pikminType,
    available: true,
  };
  modalSearchQuery.value = '';
  searchResults.value = [];
  formData.value = {
    nickname: record.nickname || '',
    location: record.location || '',
    releasedAt: record.releasedAt || new Date().toISOString().split('T')[0] as string,
    note: record.note || '',
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const submitForm = () => {
  if (!selectedItemData.value) return;

  if (isEditing.value && editingId.value) {
    updateRecord(editingId.value, {
      decorItemId: selectedItemData.value.id,
      nickname: formData.value.nickname.trim(),
      location: formData.value.location.trim(),
      releasedAt: formData.value.releasedAt as string,
      note: formData.value.note.trim(),
    });
    showToast(t('released.form.save_success'));
  } else {
    addRecord({
      decorItemId: selectedItemData.value.id,
      nickname: formData.value.nickname.trim(),
      location: formData.value.location.trim(),
      releasedAt: formData.value.releasedAt as string,
      note: formData.value.note.trim(),
    });
    showToast(t('released.form.save_success'));
  }
  closeModal();
};

const confirmDelete = (record: ReleasedPikmin) => {
  if (confirm(t('released.card.delete_confirm'))) {
    deleteRecord(record.id);
    showToast(t('components.toast.removed'));
  }
};

// --- Helpers ---
function parseDecorItemId(decorItemId: string) {
  const parts = decorItemId.split('_');
  const pikminType = parts[parts.length - 1] as any;
  const allItems = getAllDecorItems();
  const item = allItems.find(i => i.id === decorItemId);
  if (item) {
    return { categoryId: item.categoryId, variantId: item.variantId, pikminType: item.pikminType };
  }
  return { categoryId: parts.slice(0, -2).join('_'), variantId: parts[parts.length - 2] || '', pikminType };
}

function getRecordImageUrl(decorItemId: string) {
  const parts = parseDecorItemId(decorItemId);
  return getImageUrl(parts.categoryId || '', parts.variantId || '', parts.pikminType);
}

function getPikminColorClass(decorItemId: string) {
  const parts = parseDecorItemId(decorItemId);
  return PIKMIN_TYPE_COLORS[parts.pikminType as keyof typeof PIKMIN_TYPE_COLORS] || 'bg-gray-500';
}

function getDecorName(decorItemId: string) {
  const parts = parseDecorItemId(decorItemId);
  const variant = getVariant(parts.categoryId || '', parts.variantId || '');
  return variant?.name || parts.variantId || '';
}

function getDecorCategoryName(decorItemId: string) {
  const parts = parseDecorItemId(decorItemId);
  const category = getCategory(parts.categoryId || '');
  return category?.name || parts.categoryId || '';
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}
</style>
