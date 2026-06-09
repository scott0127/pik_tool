<template>
  <!-- Main container with noise background and Aurora -->
  <div class="min-h-screen pt-20 pb-24 lg:pt-24 lg:pb-8 relative overflow-hidden bg-[#0A0A0A] text-neutral-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-100">
    
    <!-- TasteSkill: Noise Overlay -->
    <div class="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');"></div>
    
    <!-- TasteSkill: Subtle Aurora -->
    <div class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
      
      <!-- Header -->
      <div class="mb-12 text-center sm:text-left gsap-stagger">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 flex items-center justify-center sm:justify-start gap-3">
          <Icon name="mdi:leaf-off" class="text-emerald-500" />
          {{ $t('released.title') }}
        </h1>
        <p class="text-neutral-400 text-lg font-medium">{{ $t('released.subtitle') }}</p>
      </div>

      <!-- Action Bar (Minimalist) -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 gsap-stagger">
        
        <!-- Button: TasteSkill Premium Glass -->
        <button
          @click="openModal()"
          class="group relative w-full sm:w-auto px-7 py-3.5 bg-white text-black rounded-2xl font-bold overflow-hidden transition-transform duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_0_rgb(255,255,255,0.1)]"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <Icon name="line-md:plus" class="w-5 h-5" />
            {{ $t('released.add_record') }}
          </span>
          <div class="absolute inset-0 bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        <!-- Search Bar -->
        <div class="w-full sm:max-w-xs relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon name="line-md:search" class="w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('released.form.search_placeholder')"
            class="w-full pl-11 pr-4 py-3 bg-[#111] border border-neutral-800 rounded-2xl focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 transition-all outline-none text-white placeholder-neutral-600 text-sm shadow-inner"
          />
        </div>
      </div>

      <!-- Stats -->
      <div v-if="getRecordCount() > 0" class="mb-6 text-xs text-neutral-500 font-bold tracking-widest uppercase gsap-stagger">
        {{ $t('released.stats.total').replace('{count}', filteredRecords.length.toString()) }}
      </div>

      <!-- Records Grid -->
      <div v-if="filteredRecords.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div 
          v-for="record in filteredRecords" 
          :key="record.id"
          class="gsap-card bg-[#151515] rounded-[1.5rem] border border-neutral-800/60 p-5 flex flex-col gap-4 group relative hover:border-neutral-600 transition-colors duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
        >
          <!-- Card Content -->
          <div class="flex items-start gap-4">
            <!-- Image Area -->
            <div class="w-16 h-16 shrink-0 bg-[#0A0A0A] rounded-2xl flex items-center justify-center p-2 border border-neutral-800 relative group-hover:border-neutral-600 transition-colors duration-500">
              <img 
                :src="getRecordImageUrl(record.decorItemId) || ''" 
                alt="Decor"
                loading="lazy"
                class="w-full h-full object-contain filter group-hover:contrast-125 transition-all duration-500"
                @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
              />
              <div 
                class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#151515] group-hover:border-[#1c1c1c] transition-colors duration-500 shadow-sm"
                :class="getPikminColorClass(record.decorItemId)"
              ></div>
            </div>

            <!-- Text Info -->
            <div class="flex-1 min-w-0 pt-0.5">
              <h3 class="font-bold text-white truncate text-[15px] tracking-tight">
                {{ record.nickname || getDecorName(record.decorItemId) }}
              </h3>
              <p class="text-[11px] text-neutral-500 truncate mt-0.5 font-semibold tracking-wide uppercase">
                {{ getDecorCategoryName(record.decorItemId) }}
              </p>
              
              <div class="flex flex-wrap gap-2 mt-3">
                <span v-if="record.location" class="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase bg-neutral-900 text-neutral-400 px-2 py-1 rounded-md">
                  <Icon name="lucide:map-pin" class="w-3 h-3" />
                  {{ record.location }}
                </span>
                <span class="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase bg-emerald-950/30 text-emerald-500 border border-emerald-900/40 px-2 py-1 rounded-md">
                  {{ record.releasedAt }}
                </span>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div v-if="record.note" class="mt-2 text-xs text-neutral-500 font-serif italic leading-relaxed bg-[#111] p-3 rounded-xl">
            "{{ record.note }}"
          </div>

          <!-- Actions -->
          <div class="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1">
            <button @click="editRecord(record)" class="p-1.5 text-neutral-500 hover:text-white bg-[#0A0A0A] border border-neutral-800 rounded-lg hover:border-neutral-600 transition-colors">
              <Icon name="lucide:edit-2" class="w-3.5 h-3.5" />
            </button>
            <button @click="confirmDelete(record)" class="p-1.5 text-neutral-500 hover:text-red-400 bg-[#0A0A0A] border border-neutral-800 rounded-lg hover:border-red-900/50 hover:bg-red-950/20 transition-colors">
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="getRecordCount() === 0" class="flex flex-col items-center justify-center py-24 px-4 text-center gsap-stagger">
        <div class="w-20 h-20 mb-8 relative gsap-float">
          <div class="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <div class="relative w-full h-full bg-[#111] rounded-3xl border border-neutral-800 flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-700">
            <Icon name="mdi:leaf" class="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <h3 class="text-2xl font-bold text-white mb-2 tracking-tight">{{ $t('released.empty.title') }}</h3>
        <p class="text-neutral-500 max-w-xs mb-8 text-[13px] leading-relaxed">{{ $t('released.empty.desc') }}</p>
        <button
          @click="openModal()"
          class="px-7 py-3 bg-[#151515] border border-neutral-800 text-white rounded-2xl font-bold hover:bg-[#222] hover:border-neutral-700 transition-all duration-300 text-sm shadow-sm hover:shadow-md"
        >
          {{ $t('released.add_record') }}
        </button>
      </div>

      <!-- Empty Search -->
      <div v-else class="text-center py-24 text-neutral-600 gsap-stagger">
        <Icon name="lucide:search-x" class="w-10 h-10 mx-auto mb-4 opacity-50" />
        <p class="text-sm font-medium">找不到符合「{{ searchQuery }}」的記錄</p>
      </div>

    </div>

    <!-- Sync Status -->
    <div v-if="authStore.isAuthenticated.value" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500" :class="syncStatus === 'idle' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'">
      <div class="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-[#111] text-neutral-300 text-xs rounded-full shadow-2xl font-medium border border-neutral-800">
        <template v-if="syncStatus === 'pending'">
          <Icon name="line-md:loading-twotone-loop" class="w-3.5 h-3.5 text-emerald-500" />
          {{ $t('collection.sync.countdown', { n: syncCountdown }) }}
        </template>
        <template v-else-if="syncStatus === 'syncing'">
          <Icon name="line-md:cloud-upload-outline-loop" class="w-3.5 h-3.5 text-emerald-500" />
          {{ $t('collection.sync.syncing') }}
        </template>
        <template v-else-if="syncStatus === 'success'">
          <Icon name="line-md:confirm-circle" class="w-3.5 h-3.5 text-emerald-500" />
          {{ $t('collection.sync.success') }}
        </template>
        <template v-else-if="syncStatus === 'error'">
          <Icon name="line-md:close-circle" class="w-3.5 h-3.5 text-red-500" />
          {{ $t('collection.sync.error') }}
          <button @click="forceSyncNow" class="ml-2 text-[10px] bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded transition-colors uppercase tracking-wider">
            {{ $t('collection.sync.retry') }}
          </button>
        </template>
      </div>
    </div>

    <!-- TasteSkill Modal w/ GSAP -->
    <Transition
      @enter="onModalEnter"
      @leave="onModalLeave"
      :css="false"
    >
      <div v-if="showModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-0">
        <!-- Backdrop -->
        <div class="modal-bg absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
        
        <!-- Panel -->
        <div class="modal-panel relative bg-[#0A0A0A] border border-neutral-800 w-full max-w-lg rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] overflow-hidden">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-neutral-900">
            <h2 class="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              <Icon name="mdi:leaf-off" class="text-emerald-500 w-5 h-5" />
              {{ isEditing ? $t('released.form.title_edit') : $t('released.form.title_add') }}
            </h2>
            <button @click="closeModal" class="p-1.5 hover:bg-neutral-900 rounded-full transition-colors text-neutral-500 hover:text-white">
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            
            <!-- Step 1 -->
            <div class="mb-8">
              <label class="block text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider">
                {{ $t('released.form.step_1') }} <span class="text-red-500">*</span>
              </label>
              
              <!-- Selected State -->
              <div v-if="selectedItemData" class="flex items-center justify-between bg-[#151515] border border-emerald-900/50 p-4 rounded-2xl mb-3 shadow-inner">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-[#0A0A0A] rounded-xl p-1 border border-neutral-800 relative">
                    <img :src="getImageUrl(selectedItemData.categoryId, selectedItemData.variantId, selectedItemData.pikminType) || ''" class="w-full h-full object-contain" />
                    <div class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#151515]" :class="PIKMIN_TYPE_COLORS[selectedItemData.pikminType]"></div>
                  </div>
                  <div>
                    <div class="font-bold text-white text-[15px]">{{ getVariant(selectedItemData.categoryId, selectedItemData.variantId)?.name }}</div>
                    <div class="text-[11px] font-semibold text-emerald-500 tracking-wide uppercase">{{ getCategory(selectedItemData.categoryId)?.name }}</div>
                  </div>
                </div>
                <button v-if="!isEditing" @click="selectedItemData = null" class="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors">
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>

              <!-- Search State -->
              <div v-else>
                <div class="relative mb-4">
                  <Icon name="line-md:search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    v-model="modalSearchQuery"
                    type="text"
                    :placeholder="$t('released.form.search_placeholder')"
                    class="w-full pl-11 pr-4 py-3 bg-[#111] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-neutral-600 outline-none text-sm text-white placeholder-neutral-600 transition-all"
                  />
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  <div 
                    v-for="item in searchResults" 
                    :key="item.id"
                    @click="selectedItemData = item"
                    class="flex flex-col items-center gap-2 p-3 bg-[#111] border border-neutral-800 rounded-2xl cursor-pointer hover:border-emerald-900 hover:bg-emerald-950/20 transition-all text-center group"
                  >
                    <div class="w-10 h-10 relative">
                      <img :src="getImageUrl(item.categoryId, item.variantId, item.pikminType) || ''" class="w-full h-full object-contain filter group-hover:contrast-125 transition-all" />
                      <div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-[2px] border-[#111] group-hover:border-[#052e16] transition-colors" :class="PIKMIN_TYPE_COLORS[item.pikminType as keyof typeof PIKMIN_TYPE_COLORS]"></div>
                    </div>
                    <span class="text-[11px] font-medium text-neutral-400 line-clamp-1 group-hover:text-white transition-colors">{{ getVariant(item.categoryId, item.variantId)?.name }}</span>
                  </div>
                  <div v-if="searchResults.length === 0 && modalSearchQuery" class="col-span-full text-center text-xs font-medium text-neutral-600 py-6">
                    找不到符合的飾品
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="space-y-5">
              <label class="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                {{ $t('released.form.step_2') }}
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide ml-1">{{ $t('released.form.nickname_label') }}</label>
                  <input v-model="formData.nickname" type="text" :placeholder="$t('released.form.nickname_placeholder')" class="w-full px-4 py-2.5 bg-[#111] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-neutral-600 outline-none text-sm text-white placeholder-neutral-700 transition-all" />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide ml-1">{{ $t('released.form.location_label') }}</label>
                  <input v-model="formData.location" type="text" :placeholder="$t('released.form.location_placeholder')" class="w-full px-4 py-2.5 bg-[#111] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-neutral-600 outline-none text-sm text-white placeholder-neutral-700 transition-all" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide ml-1">{{ $t('released.form.date_label') }}</label>
                <input v-model="formData.releasedAt" type="date" class="w-full px-4 py-2.5 bg-[#111] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-neutral-600 outline-none text-sm text-white transition-all [color-scheme:dark]" />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide ml-1">{{ $t('released.form.note_label') }}</label>
                <textarea v-model="formData.note" :placeholder="$t('released.form.note_placeholder')" rows="2" class="w-full px-4 py-3 bg-[#111] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-neutral-600 outline-none text-sm text-white placeholder-neutral-700 transition-all resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-neutral-900 flex justify-end gap-3 bg-[#050505]">
            <button @click="closeModal" class="px-5 py-2.5 text-[13px] font-bold text-neutral-400 hover:text-white rounded-xl transition-colors">
              {{ $t('released.form.cancel') }}
            </button>
            <button 
              @click="submitForm" 
              :disabled="!selectedItemData"
              class="px-6 py-2.5 text-[13px] font-bold text-black bg-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 active:scale-95 shadow-[0_4px_14px_0_rgb(255,255,255,0.1)]"
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

// Animations (TasteSkill GSAP)
onMounted(async () => {
  loadFromLocal();
  if (authStore.isAuthenticated.value) {
    await loadFromCloud();
  }

  // Initial Stagger Animation
  nextTick(() => {
    gsap.fromTo('.gsap-stagger', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power4.out', delay: 0.1 }
    );
    
    gsap.fromTo('.gsap-card',
      { y: 20, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.3 }
    );

    // Float Animation
    gsap.to('.gsap-float', {
      y: -12,
      rotation: 2,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  });
});

// Modal GSAP Transition Hooks
const onModalEnter = (el: Element, done: () => void) => {
  const bg = el.querySelector('.modal-bg');
  const panel = el.querySelector('.modal-panel');
  
  gsap.set(bg, { opacity: 0 });
  gsap.set(panel, { y: 40, opacity: 0, scale: 0.95 });

  const tl = gsap.timeline({ onComplete: done });
  tl.to(bg, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
    .to(panel, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, 0.1);
};

const onModalLeave = (el: Element, done: () => void) => {
  const bg = el.querySelector('.modal-bg');
  const panel = el.querySelector('.modal-panel');

  const tl = gsap.timeline({ onComplete: done });
  tl.to(panel, { y: 20, opacity: 0, scale: 0.98, duration: 0.3, ease: 'power2.in' }, 0)
    .to(bg, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0.1);
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
/* Minimalist Custom Scrollbar for Dark Mode */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #333;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}
</style>
