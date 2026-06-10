<template>
  <div class="min-h-screen pt-20 pb-24 lg:pt-24 lg:pb-8 relative">
    <!-- Background Decor (Matches app style) -->
    <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-300/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
      <!-- Header -->
      <div class="mb-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left gsap-stagger">
        <div class="w-48 h-48 sm:w-56 sm:h-56 shrink-0 relative flex items-center justify-center">
          <div class="absolute inset-0 w-full h-full" style="mask-image: radial-gradient(circle closest-side, black 50%, transparent 100%); -webkit-mask-image: radial-gradient(circle closest-side, black 50%, transparent 100%);">
            <img src="/images/red_pikmin_leaving.png" alt="Red Pikmin leaving" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 opacity-90 mix-blend-multiply" />
          </div>
        </div>
        <div>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-emerald-900 mb-3 drop-shadow-sm">
            {{ $t('released.title') }}
          </h1>
          <p class="text-gray-700 font-medium text-lg max-w-md">{{ $t('released.subtitle') }}</p>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/60 gsap-stagger">
        <button
          @click="openModal()"
          class="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center"
        >
          {{ $t('released.add_record') }}
        </button>

        <div class="w-full sm:max-w-xs relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="line-md:search" class="w-5 h-5 text-gray-500 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('released.form.search_placeholder')"
            class="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-500"
          />
        </div>
      </div>

      <!-- Stats / Counter -->
      <div v-if="getRecordCount() > 0" class="mb-4 text-sm text-gray-600 font-bold tracking-wide gsap-stagger">
        {{ $t('released.stats.total').replace('{count}', filteredRecords.length.toString()) }}
      </div>

      <!-- Records List -->
      <div v-if="filteredRecords.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
        <LiquidGlassCard 
          v-for="record in filteredRecords" 
          :key="record.id"
          :blur-value="12"
          :glass-opacity="0.3"
          :bg-x="bgXSpring"
          :bg-y="bgYSpring"
          :is-draggable="false"
          :magnification="1"
          bg-image=""
          class="gsap-card glass-capsule flex flex-col items-center pt-8 pb-6 px-4 group h-[300px] sm:h-[320px] transition-all"
        >
          <!-- Floor Glow -->
          <div class="capsule-floor"></div>

          <!-- Sparkles -->
          <div class="capsule-sparkle top-1/4 left-1/4" style="animation-delay: 0s"></div>
          <div class="capsule-sparkle top-[30%] right-[20%]" style="animation-delay: 1.2s"></div>
          <div class="capsule-sparkle bottom-1/3 left-[20%]" style="animation-delay: 2.5s"></div>

          <!-- Image -->
          <div class="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 z-10 mb-4 transition-transform duration-700 group-hover:scale-110 pointer-events-none">
            <img 
              :src="getRecordImageUrl(record.decorItemId) || ''" 
              alt="Decor"
              loading="lazy"
              class="w-full h-full object-contain drop-shadow-xl"
              @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
            />
            <!-- Pikmin Type Indicator -->
            <div 
              class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
              :class="getPikminColorClass(record.decorItemId)"
            ></div>
          </div>

          <!-- Info -->
          <div class="z-10 flex-1 flex flex-col items-center text-center w-full mt-auto pointer-events-none">
            <h3 class="font-extrabold text-gray-900 text-base sm:text-lg line-clamp-1 mb-1 drop-shadow-sm">
              {{ record.nickname || getDecorName(record.decorItemId) }}
            </h3>
            <p class="text-[10px] sm:text-xs text-emerald-800 font-bold bg-white/60 backdrop-blur-md px-2 py-0.5 rounded-full mb-3 shadow-sm border border-white/50">
              {{ getDecorCategoryName(record.decorItemId) }}
            </p>
            
            <div class="flex flex-col gap-1.5 w-full items-center">
              <span v-if="record.location" class="inline-flex items-center gap-1 text-[10px] font-bold bg-white/70 text-gray-800 px-2 py-0.5 rounded-full shadow-sm">
                <Icon name="lucide:map-pin" class="w-3 h-3 text-emerald-700" />
                {{ record.location }}
              </span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded-full shadow-sm border border-emerald-200/50">
                <Icon name="lucide:calendar" class="w-3 h-3 text-emerald-700" />
                {{ record.releasedAt }}
              </span>
            </div>
            
            <!-- Note -->
            <div v-if="record.note" class="mt-3 text-[10px] sm:text-xs text-gray-800 bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-lg font-bold w-full line-clamp-2 border border-white/40 shadow-sm leading-tight">
              "{{ record.note }}"
            </div>
          </div>

          <!-- Hover Actions -->
          <div class="absolute inset-0 z-20 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 sm:gap-4" style="border-radius: inherit;">
            <button @click.stop="editRecord(record)" class="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-50 shadow-xl transform hover:scale-110 transition-all border border-emerald-100 cursor-pointer">
              <Icon name="lucide:edit-2" class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button @click.stop="confirmDelete(record)" class="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-xl transform hover:scale-110 transition-all border border-red-100 cursor-pointer">
              <Icon name="lucide:trash-2" class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </LiquidGlassCard>
      </div>

      <!-- Empty State -->
      <div v-else-if="getRecordCount() === 0" class="flex flex-col items-center justify-center py-20 px-4 text-center gsap-stagger">
        <h3 class="text-2xl font-bold text-gray-900 mb-2 drop-shadow-sm">{{ $t('released.empty.title') }}</h3>
        <p class="text-gray-700 font-medium max-w-sm mb-6">{{ $t('released.empty.desc') }}</p>
        <button
          @click="openModal()"
          class="px-6 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-sm"
        >
          {{ $t('released.add_record') }}
        </button>
      </div>

      <!-- Empty Search Results -->
      <div v-else class="text-center py-20 text-gray-600 font-medium gsap-stagger">
        <p>找不到符合「{{ searchQuery }}」的記錄</p>
      </div>

    </div>

    <!-- Sync Status -->
    <div v-if="authStore.isAuthenticated.value" class="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500" :class="syncStatus === 'idle' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'">
      <div class="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md text-gray-800 text-sm rounded-full shadow-lg font-bold border border-gray-200">
        <template v-if="syncStatus === 'pending'">
          <Icon name="line-md:loading-twotone-loop" class="w-4 h-4 text-emerald-600" />
          {{ $t('collection.sync.countdown', { n: syncCountdown }) }}
        </template>
        <template v-else-if="syncStatus === 'syncing'">
          <Icon name="line-md:cloud-upload-outline-loop" class="w-4 h-4 text-emerald-600" />
          {{ $t('collection.sync.syncing') }}
        </template>
        <template v-else-if="syncStatus === 'success'">
          <Icon name="line-md:confirm-circle" class="w-4 h-4 text-emerald-600" />
          {{ $t('collection.sync.success') }}
        </template>
        <template v-else-if="syncStatus === 'error'">
          <Icon name="line-md:close-circle" class="w-4 h-4 text-red-600" />
          {{ $t('collection.sync.error') }}
          <button @click="forceSyncNow" class="ml-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-0.5 rounded transition-colors">
            {{ $t('collection.sync.retry') }}
          </button>
        </template>
      </div>
    </div>

    <!-- Add/Edit Modal with GSAP -->
    <Transition
      @enter="onModalEnter"
      @leave="onModalLeave"
      :css="false"
    >
      <div v-if="showModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div class="modal-bg absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeModal"></div>
        
        <div class="modal-panel relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 class="text-lg font-bold text-gray-900">
              {{ isEditing ? $t('released.form.title_edit') : $t('released.form.title_add') }}
            </h2>
            <button @click="closeModal" class="p-1 hover:bg-gray-200 rounded-lg transition-colors">
              <Icon name="lucide:x" class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
            <!-- Step 1: Select Decor -->
            <div class="mb-6">
              <label class="block text-sm font-bold text-gray-800 mb-2">
                {{ $t('released.form.step_1') }} <span class="text-red-500">*</span>
              </label>
              
              <div v-if="selectedItemData" class="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-white rounded-lg p-1 border border-emerald-100 relative shadow-sm">
                    <img :src="getImageUrl(selectedItemData.categoryId, selectedItemData.variantId, selectedItemData.pikminType) || ''" class="w-full h-full object-contain" />
                    <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm" :class="PIKMIN_TYPE_COLORS[selectedItemData.pikminType]"></div>
                  </div>
                  <div>
                    <div class="font-bold text-gray-900">{{ getVariant(selectedItemData.categoryId, selectedItemData.variantId)?.name }}</div>
                    <div class="text-xs font-medium text-emerald-700">{{ getCategory(selectedItemData.categoryId)?.name }}</div>
                  </div>
                </div>
                <button v-if="!isEditing" @click="selectedItemData = null" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>

              <div v-else>
                <div class="relative mb-3">
                  <Icon name="line-md:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    v-model="modalSearchQuery"
                    type="text"
                    :placeholder="$t('released.form.search_placeholder')"
                    class="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
                  />
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  <div 
                    v-for="item in searchResults" 
                    :key="item.id"
                    @click="selectedItemData = item"
                    class="flex flex-col items-center gap-1 p-2 border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center bg-white shadow-sm"
                  >
                    <div class="w-10 h-10 relative">
                      <img :src="getImageUrl(item.categoryId, item.variantId, item.pikminType) || ''" class="w-full h-full object-contain" />
                      <div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm" :class="PIKMIN_TYPE_COLORS[item.pikminType as keyof typeof PIKMIN_TYPE_COLORS]"></div>
                    </div>
                    <span class="text-[10px] font-bold text-gray-700 line-clamp-1 leading-tight mt-1">{{ getVariant(item.categoryId, item.variantId)?.name }}</span>
                  </div>
                  <div v-if="searchResults.length === 0 && modalSearchQuery" class="col-span-full text-center text-sm font-medium text-gray-500 py-4">
                    找不到符合的飾品
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Details -->
            <div class="space-y-4">
              <label class="block text-sm font-bold text-gray-800 mb-2">
                {{ $t('released.form.step_2') }}
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-600 mb-1 ml-1">{{ $t('released.form.nickname_label') }}</label>
                  <input v-model="formData.nickname" type="text" :placeholder="$t('released.form.nickname_placeholder')" class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-800 placeholder-gray-400" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-600 mb-1 ml-1">{{ $t('released.form.location_label') }}</label>
                  <input v-model="formData.location" type="text" :placeholder="$t('released.form.location_placeholder')" class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-800 placeholder-gray-400" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-600 mb-1 ml-1">{{ $t('released.form.date_label') }}</label>
                <input v-model="formData.releasedAt" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-800" />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-600 mb-1 ml-1">{{ $t('released.form.note_label') }}</label>
                <textarea v-model="formData.note" :placeholder="$t('released.form.note_placeholder')" rows="2" class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-800 placeholder-gray-400 resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
            <button @click="closeModal" class="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
              {{ $t('released.form.cancel') }}
            </button>
            <button 
              @click="submitForm" 
              :disabled="!selectedItemData"
              class="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { gsap } from 'gsap';
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
const bgX = ref(0);
const bgY = ref(0);
// Add useSpring composable state for LiquidGlassCard global parallax
const bgXSpring = useSpring(bgX, { stiffness: 100, damping: 50 });
const bgYSpring = useSpring(bgY, { stiffness: 100, damping: 50 });

const handleGlobalMouseMove = (e: MouseEvent) => {
  const xPct = (e.clientX / window.innerWidth) - 0.5;
  const yPct = (e.clientY / window.innerHeight) - 0.5;
  bgX.value = xPct * -30;
  bgY.value = yPct * -30;
};

onMounted(async () => {
  loadFromLocal();
  if (authStore.isAuthenticated.value) {
    await loadFromCloud();
  }

  // Bind global mouse move for liquid glass cards
  window.addEventListener('mousemove', handleGlobalMouseMove);

  // GSAP Initial Stagger Animation
  nextTick(() => {
    gsap.fromTo('.gsap-stagger', 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    );
    
    gsap.fromTo('.gsap-card',
      { y: 15, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out', delay: 0.3 }
    );
  });
});

import { onUnmounted } from 'vue';

onUnmounted(() => {
  window.removeEventListener('mousemove', handleGlobalMouseMove);
});

// Modal GSAP Transition Hooks
const onModalEnter = (el: Element, done: () => void) => {
  const bg = el.querySelector('.modal-bg');
  const panel = el.querySelector('.modal-panel');
  
  if (bg) gsap.set(bg, { opacity: 0 });
  if (panel) gsap.set(panel, { y: 30, opacity: 0, scale: 0.96 });

  const tl = gsap.timeline({ onComplete: done });
  if (bg) tl.to(bg, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
  if (panel) tl.to(panel, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, 0.05);
};

const onModalLeave = (el: Element, done: () => void) => {
  const bg = el.querySelector('.modal-bg');
  const panel = el.querySelector('.modal-panel');

  const tl = gsap.timeline({ onComplete: done });
  if (panel) tl.to(panel, { y: 20, opacity: 0, scale: 0.98, duration: 0.25, ease: 'power2.in' }, 0);
  if (bg) tl.to(bg, { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, 0.05);
};

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

/* Glass Capsule Styles */
.glass-capsule {
  border-radius: 45% 45% 24px 24px / 25% 25% 24px 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 
    inset 0 30px 40px -20px rgba(255, 255, 255, 0.9),
    inset 0 -20px 30px -10px rgba(255, 255, 255, 0.7),
    inset 0 0 20px rgba(255, 255, 255, 0.3),
    0 10px 20px -5px rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
}

.capsule-floor {
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 40px;
  background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  filter: blur(4px);
  z-index: 0;
}

.capsule-sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px 2px white, 0 0 20px 4px rgba(255, 255, 255, 0.8);
  animation: twinkle 3s infinite ease-in-out;
  pointer-events: none;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1.4); }
}
</style>
