<template>
  <div class="min-h-screen pt-20 pb-24 lg:pt-24 lg:pb-8 relative">
    <!-- Background Decor (Matches app style) -->
    <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-300/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
      <!-- Header -->
      <div class="released-hero mb-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left gsap-stagger">
        <div class="w-48 h-48 sm:w-56 sm:h-56 shrink-0 relative flex items-center justify-center">
          <div class="absolute inset-0 w-full h-full" style="mask-image: radial-gradient(circle closest-side, black 50%, transparent 100%); -webkit-mask-image: radial-gradient(circle closest-side, black 50%, transparent 100%);">
            <img src="/images/red_pikmin_leaving.png" alt="Red Pikmin leaving" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 opacity-90 mix-blend-multiply" />
          </div>
        </div>
        <div class="released-hero-copy">
          <h1 class="released-hero-title text-4xl sm:text-5xl font-extrabold mb-3">
            {{ $t('released.title') }}
          </h1>
          <p class="released-hero-subtitle font-bold text-lg max-w-md">{{ $t('released.subtitle') }}</p>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center justify-center mb-8 bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/60 gsap-stagger">
        <button
          @click="openModal()"
          class="w-full px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center"
        >
          {{ $t('released.add_record') }}
        </button>
      </div>

      <!-- Stats / Counter -->
      <div v-if="getRecordCount() > 0" class="mb-4 text-sm text-gray-600 font-bold tracking-wide gsap-stagger">
        {{ $t('released.stats.total').replace('{count}', filteredRecords.length.toString()) }}
      </div>

      <!-- Records List -->
      <div v-if="filteredRecords.length > 0" class="released-record-list mt-8">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="released-record-row gsap-card group"
        >
          <div class="released-record-image glass-frosted-shell">
            <img
              :src="getRecordImageUrl(record.decorItemId) || ''"
              alt="Decor"
              loading="lazy"
              class="relative z-10 h-full w-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
              @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
            >
          </div>

          <div class="released-record-content">
            <div class="released-record-header">
              <div class="released-record-heading">
                <h3
                  class="released-record-title"
                  :title="record.nickname || getDecorName(record.decorItemId)"
                >
                  {{ record.nickname || getDecorName(record.decorItemId) }}
                </h3>
                <div class="released-record-category-row">
                  <span
                    class="released-record-type-dot"
                    :class="getPikminColorClass(record.decorItemId)"
                  />
                  <p
                    class="released-record-category"
                    :title="getDecorCategoryName(record.decorItemId)"
                  >
                    {{ getDecorCategoryName(record.decorItemId) }}
                  </p>
                </div>
              </div>

              <div class="released-record-actions">
                <button
                  @click.stop="editRecord(record)"
                  class="released-record-action text-emerald-700 hover:bg-emerald-100"
                  :title="$t('released.card.edit')"
                >
                  <Icon name="lucide:edit-2" class="h-4 w-4" />
                </button>
                <button
                  @click.stop="confirmDelete(record)"
                  class="released-record-action text-red-600 hover:bg-red-100"
                  :title="$t('released.card.delete')"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="released-record-meta">
              <span class="released-record-chip" :title="record.releasedAt">
                <Icon name="lucide:calendar" class="h-3.5 w-3.5 text-emerald-700" />
                <span class="released-record-chip-text" :title="record.releasedAt">{{ record.releasedAt }}</span>
              </span>
              <span v-if="record.location" class="released-record-chip" :title="record.location">
                <Icon name="lucide:map-pin" class="h-3.5 w-3.5 text-emerald-700" />
                <span class="released-record-chip-text" :title="record.location">{{ record.location }}</span>
              </span>
            </div>

            <div class="released-record-date-art" :title="record.releasedAt">
              <div class="released-record-date-left">
                <span class="released-record-date-month">{{ getReleasedDateParts(record.releasedAt).month }}</span>
                <span class="released-record-date-day">{{ getReleasedDateParts(record.releasedAt).day }}</span>
              </div>
              <span class="released-record-date-divider" />
              <div class="released-record-date-right">
                <span>{{ getReleasedDateParts(record.releasedAt).year }}</span>
                <span>{{ getReleasedDateParts(record.releasedAt).weekday }}</span>
              </div>
            </div>

            <div v-if="record.note" class="released-record-note" :title="record.note">
              <span class="released-record-note-mark">"</span>
              <p class="line-clamp-2">{{ record.note }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="getRecordCount() === 0" class="released-empty-state gsap-stagger">
        <h3 class="text-2xl font-extrabold mb-2">{{ $t('released.empty.title') }}</h3>
        <p class="font-bold max-w-sm mb-6">{{ $t('released.empty.desc') }}</p>
        <button
          @click="openModal()"
          class="px-7 py-3 bg-white border border-emerald-300 text-emerald-700 rounded-xl font-extrabold hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-900/10"
        >
          {{ $t('released.add_record') }}
        </button>
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

    <!-- Cloud Conflict Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="syncConflict"
        class="fixed inset-0 z-[2100] flex items-center justify-center bg-gray-950/45 backdrop-blur-sm p-4"
      >
        <div class="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl">
          <div class="border-b border-emerald-100 bg-emerald-50/80 p-5">
            <div class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <Icon name="lucide:cloud-alert" class="h-5 w-5" />
            </div>
            <h2 class="text-xl font-extrabold text-gray-950">發現雲端與本地資料不同</h2>
            <p class="mt-2 text-sm font-bold leading-6 text-gray-600">
              雲端資料會被視為主要版本。你可以把本地獨有的記錄合併到雲端，或直接拋棄本地資料並使用雲端版本。
            </p>
          </div>

          <div class="space-y-3 p-5">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <p class="text-xs font-black text-gray-500">雲端記錄</p>
                <p class="mt-1 text-2xl font-black text-emerald-700">{{ syncConflict.cloudCount }}</p>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <p class="text-xs font-black text-gray-500">本地記錄</p>
                <p class="mt-1 text-2xl font-black text-gray-900">{{ syncConflict.localCount }}</p>
              </div>
            </div>

            <div class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
              合併時，同一筆 ID 若兩邊內容不同，會保留雲端內容；只有本地獨有的記錄會被加入雲端。
            </div>
          </div>

          <div class="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              :disabled="isResolvingSyncConflict"
              class="rounded-xl px-4 py-2.5 text-sm font-extrabold text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleDiscardLocalConflict"
            >
              拋棄本地
            </button>
            <button
              type="button"
              :disabled="isResolvingSyncConflict"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleMergeCloudConflict"
            >
              <Icon v-if="isResolvingSyncConflict" name="line-md:loading-twotone-loop" class="h-4 w-4" />
              <span>合併並同步</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
                <button
                  @click="clearSelectedItem"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" />
                  <span>重新選擇</span>
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
            <Transition
              @enter="onDetailsEnter"
              @leave="onDetailsLeave"
              :css="false"
            >
              <div v-if="selectedItemData" class="released-details-section space-y-4">
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
            </Transition>
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
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
  syncConflict,
  getRecords, 
  getRecordCount, 
  addRecord, 
  updateRecord, 
  deleteRecord, 
  loadFromLocal, 
  loadFromCloud, 
  forceSyncNow,
  mergeCloudConflict,
  discardLocalConflict,
} = useReleased();
const { searchItems, getCategory, getVariant, getImageUrl, getAllDecorItems } = useDecorData();

useHead({
  title: () => t('released.title') + ' | ' + t('app.title'),
});

let releasedImageShineContext: ReturnType<typeof gsap.context> | null = null;

function setupReleasedImageShimmer() {
  releasedImageShineContext?.revert();
  releasedImageShineContext = null;

  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const targets = gsap.utils.toArray<HTMLElement>('.released-record-image');
  if (!targets.length) return;

  releasedImageShineContext = gsap.context(() => {
    gsap.set(targets, { '--shine-x': '-78%' });
    gsap.to(targets, {
      '--shine-x': '178%',
      duration: 2.65,
      ease: 'sine.inOut',
      repeat: -1,
      repeatDelay: 4.8,
      stagger: {
        each: 0.42,
        from: 'random',
      },
    });
  });
}

onMounted(async () => {
  loadFromLocal();
  if (authStore.isAuthenticated.value) {
    await loadFromCloud();
  }

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

    setupReleasedImageShimmer();
  });
});

onBeforeUnmount(() => {
  releasedImageShineContext?.revert();
});

watch(() => authStore.isAuthenticated.value, async (isAuth, wasAuth) => {
  if (isAuth && !wasAuth) {
    loadFromLocal();
    await loadFromCloud(true);
  }
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

const onDetailsEnter = (el: Element, done: () => void) => {
  const target = el as HTMLElement;
  gsap.set(target, {
    height: 0,
    autoAlpha: 0,
    y: -14,
    overflow: 'hidden',
  });
  gsap.to(target, {
    height: 'auto',
    autoAlpha: 1,
    y: 0,
    duration: 0.46,
    ease: 'power3.out',
    onComplete: () => {
      gsap.set(target, { height: 'auto', overflow: 'visible' });
      done();
    },
  });
};

const onDetailsLeave = (el: Element, done: () => void) => {
  const target = el as HTMLElement;
  gsap.set(target, { overflow: 'hidden' });
  gsap.to(target, {
    height: 0,
    autoAlpha: 0,
    y: -10,
    marginTop: 0,
    duration: 0.28,
    ease: 'power2.inOut',
    onComplete: done,
  });
};

const filteredRecords = computed(() => getRecords());

watch(
  () => filteredRecords.value.map(record => record.id).join('|'),
  () => nextTick(setupReleasedImageShimmer),
  { flush: 'post' }
);

// --- Modal & Form State ---
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const selectedItemData = ref<DecorItem | null>(null);
const modalSearchQuery = ref('');
const searchResults = ref<DecorItem[]>([]);
const isResolvingSyncConflict = ref(false);

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

const clearSelectedItem = () => {
  selectedItemData.value = null;
  modalSearchQuery.value = '';
  searchResults.value = [];
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

const handleMergeCloudConflict = async () => {
  isResolvingSyncConflict.value = true;
  const ok = await mergeCloudConflict();
  isResolvingSyncConflict.value = false;
  showToast({
    message: ok ? '已合併本地獨有記錄並同步到雲端' : '合併同步失敗，請稍後再試',
    type: ok ? 'success' : 'error',
    duration: 2200,
  });
};

const handleDiscardLocalConflict = async () => {
  isResolvingSyncConflict.value = true;
  const ok = await discardLocalConflict();
  isResolvingSyncConflict.value = false;
  showToast({
    message: ok ? '已拋棄本地資料並套用雲端版本' : '套用雲端版本失敗，請稍後再試',
    type: ok ? 'success' : 'error',
    duration: 2200,
  });
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

function getReleasedDateParts(dateText: string) {
  const fallback = {
    month: 'Jun.',
    day: '--',
    year: '----',
    weekday: '---',
  };

  if (!dateText) return fallback;

  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return {
      ...fallback,
      day: dateText.slice(-2) || '--',
      year: dateText.slice(0, 4) || '----',
    };
  }

  return {
    month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date) + '.',
    day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date),
    year: new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date),
    weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date).toUpperCase(),
  };
}
</script>

<style scoped>
.released-hero-copy {
  position: relative;
  isolation: isolate;
  padding: 0.65rem 0.9rem;
}

.released-hero-copy::before {
  position: absolute;
  inset: -0.55rem -1rem;
  z-index: -1;
  content: "";
  border-radius: 999px;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.36) 46%, transparent 78%);
  filter: blur(10px);
  opacity: 0.96;
  pointer-events: none;
}

.released-hero-title {
  color: #065f46;
  -webkit-text-stroke: 0.018em rgba(240, 253, 244, 0.94);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.95),
    0 0 10px rgba(255, 255, 255, 0.72),
    0 8px 20px rgba(6, 78, 59, 0.28);
}

.released-hero-subtitle {
  color: rgba(30, 41, 59, 0.94);
  -webkit-text-stroke: 0.018em rgba(255, 255, 255, 0.82);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.88),
    0 0 8px rgba(255, 255, 255, 0.68),
    0 4px 12px rgba(15, 23, 42, 0.18);
}

.released-details-section {
  transform-origin: top center;
  will-change: height, opacity, transform;
}

.released-empty-state {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem auto 0;
  max-width: 34rem;
  padding: 2rem 1.25rem;
  text-align: center;
}

.released-empty-state::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: "";
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 2rem;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.86), transparent 52%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.58), rgba(236, 253, 245, 0.34)),
    rgba(255, 255, 255, 0.32);
  box-shadow:
    0 18px 42px rgba(6, 78, 59, 0.18),
    0 1px 12px rgba(255, 255, 255, 0.84) inset;
  backdrop-filter: blur(4px) saturate(1.12);
  -webkit-backdrop-filter: blur(4px) saturate(1.12);
}

.released-empty-state h3 {
  color: rgb(15, 23, 42);
  -webkit-text-stroke: 0.018em rgba(255, 255, 255, 0.92);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9),
    0 4px 12px rgba(15, 23, 42, 0.22);
}

.released-empty-state p {
  color: rgba(51, 65, 85, 0.96);
  line-height: 1.7;
  -webkit-text-stroke: 0.012em rgba(255, 255, 255, 0.88);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.78),
    0 3px 10px rgba(15, 23, 42, 0.16);
}

.released-record-list {
  display: grid;
  gap: 1rem;
}

.released-record-row {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: 7.2rem minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
  overflow: hidden;
  min-height: 8.6rem;
  padding: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 1.9rem;
  background:
    radial-gradient(circle at 12% 16%, rgba(255, 255, 255, 0.72), transparent 34%),
    radial-gradient(circle at 88% 18%, rgba(16, 185, 129, 0.12), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.48), rgba(236, 253, 245, 0.22)),
    rgba(255, 255, 255, 0.2);
  box-shadow:
    0 16px 38px rgba(6, 78, 59, 0.14),
    0 1px 14px rgba(255, 255, 255, 0.82) inset;
  backdrop-filter: blur(4px) saturate(1.12);
  -webkit-backdrop-filter: blur(4px) saturate(1.12);
}

.released-record-row::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: "";
  border-radius: inherit;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.22), transparent 48%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent 56%);
  pointer-events: none;
}

.released-record-image,
.released-record-content {
  z-index: 1;
}

.released-record-image {
  position: relative;
  align-self: stretch;
  display: grid;
  width: 7.2rem;
  min-width: 7.2rem;
  min-height: 7.2rem;
  place-items: center;
  overflow: hidden;
  padding: 0.72rem;
  border-radius: 1.75rem;
  background:
    radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.68), transparent 34%),
    radial-gradient(circle at 76% 84%, rgba(16, 185, 129, 0.16), transparent 40%),
    linear-gradient(165deg, #e1f4eb 0%, #c6e7d9 54%, #b9dfcf 100%);
  border: 1px solid rgba(255, 255, 255, 0.66);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.82) inset,
    0 -14px 24px rgba(13, 148, 136, 0.12) inset,
    10px 0 18px rgba(255, 255, 255, 0.24) inset,
    -10px 0 18px rgba(6, 95, 70, 0.08) inset,
    0 14px 22px rgba(6, 78, 59, 0.16),
    0 2px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.released-record-image::before {
  position: absolute;
  inset: 0;
  display: block;
  content: "";
  border-radius: inherit;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.16) 26%, transparent 54%),
    linear-gradient(315deg, transparent 0 54%, rgba(255, 255, 255, 0.18) 72%, rgba(255, 255, 255, 0.5) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.28) inset,
    0 0 28px rgba(255, 255, 255, 0.22) inset;
  pointer-events: none;
}

.released-record-image::after {
  position: absolute;
  top: -38%;
  left: var(--shine-x, -78%);
  display: block;
  width: 78%;
  height: 180%;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent);
  filter: blur(7px);
  opacity: 0.46;
  pointer-events: none;
  transform: rotate(16deg);
}

.released-record-content {
  display: grid;
  min-width: 0;
  grid-template-rows: auto auto 1fr;
  gap: 0.72rem;
  padding: 0.12rem 0 0.08rem;
}

.released-record-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.8rem;
}

.released-record-heading {
  min-width: 0;
}

.released-record-title {
  max-width: 100%;
  color: rgb(15, 23, 42);
  overflow: hidden;
  font-size: 1.22rem;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-text-stroke: 0.014em rgba(255, 255, 255, 0.86);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9),
    0 4px 12px rgba(15, 23, 42, 0.16);
  cursor: help;
}

.released-record-category-row {
  display: flex;
  align-items: center;
  gap: 0.48rem;
  min-width: 0;
  max-width: 100%;
  margin-top: 0.36rem;
}

.released-record-type-dot {
  flex: 0 0 auto;
  width: 0.78rem;
  height: 0.78rem;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  box-shadow:
    0 1px 4px rgba(15, 23, 42, 0.16),
    0 0 0 3px rgba(255, 255, 255, 0.32);
}

.released-record-category {
  display: block;
  min-width: 0;
  overflow: hidden;
  color: rgb(4, 120, 87);
  font-size: 0.82rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

.released-record-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.4rem;
}

.released-record-action {
  display: grid;
  width: 2.15rem;
  height: 2.15rem;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 1px 8px rgba(255, 255, 255, 0.7) inset;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.released-record-action:hover {
  transform: translateY(-1px);
}

.released-record-meta {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.55rem;
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.released-record-chip {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  gap: 0.35rem;
  padding: 0.38rem 0.66rem;
  color: rgb(30, 41, 59);
  font-size: 0.8rem;
  font-weight: 900;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.46)),
    rgba(255, 255, 255, 0.42);
  box-shadow:
    0 1px 8px rgba(255, 255, 255, 0.68) inset,
    0 6px 14px rgba(15, 23, 42, 0.08);
}

.released-record-chip:first-child {
  flex: 0 0 auto;
}

.released-record-chip:nth-child(2) {
  flex: 1 1 0;
}

.released-record-chip :deep(svg) {
  flex: 0 0 auto;
}

.released-record-chip-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

.released-record-date-art {
  display: none;
}

.released-record-note {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  align-self: end;
  margin-top: 0.05rem;
  padding: 0.62rem 0.72rem;
  color: rgb(51, 65, 85);
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.5;
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 1.2rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.18)),
    rgba(255, 255, 255, 0.26);
  box-shadow: 0 1px 10px rgba(255, 255, 255, 0.58) inset;
  cursor: help;
}

.released-record-note p {
  min-width: 0;
  overflow-wrap: anywhere;
}

.released-record-note-mark {
  margin-top: -0.2rem;
  color: rgba(4, 120, 87, 0.76);
  font-size: 1.4rem;
  font-weight: 900;
  line-height: 1;
}

@media (max-width: 480px) {
  .released-record-row {
    grid-template-columns: 5.7rem minmax(0, 1fr);
    gap: 0.7rem;
    padding: 0.65rem;
    border-radius: 1.55rem;
  }

  .released-record-image {
    width: 5.7rem;
    min-width: 5.7rem;
    min-height: 6.15rem;
    padding: 0.65rem;
    border-radius: 1.25rem;
  }

  .released-record-content {
    gap: 0.56rem;
  }

  .released-record-header {
    gap: 0.55rem;
  }

  .released-record-title {
    font-size: 1.02rem;
  }

  .released-record-actions {
    gap: 0.3rem;
  }

  .released-record-action {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.75rem;
  }

  .released-record-chip {
    padding: 0.3rem 0.5rem;
    font-size: 0.72rem;
  }

  .released-record-chip:nth-child(2) {
    max-width: none;
  }

  .released-record-note {
    padding: 0.52rem 0.62rem;
    font-size: 0.76rem;
  }
}

@media (min-width: 640px) {
  .released-hero-copy {
    padding: 0.5rem 0.25rem;
  }

  .released-record-list {
    gap: 1.35rem;
  }

  .released-record-row {
    grid-template-columns: minmax(10.5rem, 12rem) minmax(0, 1fr);
    gap: 2rem;
    min-height: 15.5rem;
    padding: 1.85rem;
    border-radius: 2.45rem;
    background:
      radial-gradient(circle at 13% 16%, rgba(255, 255, 255, 0.86), transparent 32%),
      radial-gradient(circle at 86% 24%, rgba(187, 247, 208, 0.36), transparent 34%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(236, 253, 245, 0.26)),
      rgba(255, 255, 255, 0.22);
    box-shadow:
      0 22px 54px rgba(6, 78, 59, 0.16),
      0 1px 18px rgba(255, 255, 255, 0.86) inset;
  }

  .released-record-image {
    width: 100%;
    min-width: 0;
    min-height: 12.8rem;
    padding: 1rem;
    border-radius: 2.1rem;
  }

  .released-record-content {
    align-self: center;
    grid-template-rows: auto auto auto 1fr;
    gap: 1.05rem;
  }

  .released-record-header {
    gap: 1.25rem;
  }

  .released-record-title {
    font-size: clamp(2.05rem, 4.2vw, 3.05rem);
    letter-spacing: 0;
  }

  .released-record-category {
    font-size: 1.05rem;
  }

  .released-record-category-row {
    margin-top: 0.72rem;
    gap: 0.62rem;
  }

  .released-record-type-dot {
    width: 0.9rem;
    height: 0.9rem;
  }

  .released-record-actions {
    gap: 0.75rem;
  }

  .released-record-action {
    width: 3.05rem;
    height: 3.05rem;
    border-radius: 1.35rem;
    background: rgba(255, 255, 255, 0.66);
    box-shadow:
      0 1px 10px rgba(255, 255, 255, 0.78) inset,
      0 10px 20px rgba(15, 23, 42, 0.08);
  }

  .released-record-meta {
    gap: 1rem;
  }

  .released-record-meta .released-record-chip:first-child {
    display: none;
  }

  .released-record-date-art {
    position: relative;
    display: grid;
    grid-template-columns: minmax(5.4rem, auto) auto minmax(4.6rem, auto);
    align-items: center;
    justify-content: start;
    gap: 1.1rem;
    width: min(100%, 21rem);
    min-height: 5rem;
    color: rgb(15, 23, 42);
  }

  .released-record-date-art::before {
    position: absolute;
    left: 0.1rem;
    right: 0.5rem;
    bottom: 0.28rem;
    height: 1px;
    content: "";
    background: repeating-linear-gradient(
      90deg,
      rgba(22, 163, 74, 0.48) 0 8px,
      transparent 8px 16px
    );
  }

  .released-record-date-left {
    display: grid;
    justify-items: center;
    color: rgb(22, 163, 74);
    line-height: 1;
  }

  .released-record-date-month {
    font-family: "Brush Script MT", "Segoe Script", cursive;
    font-size: 1.55rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    transform: rotate(-5deg);
  }

  .released-record-date-day {
    margin-top: -0.2rem;
    font-size: 3.35rem;
    font-weight: 900;
    letter-spacing: 0;
  }

  .released-record-date-divider {
    width: 1px;
    height: 3.9rem;
    background: linear-gradient(180deg, transparent, rgba(22, 163, 74, 0.46), transparent);
  }

  .released-record-date-right {
    display: grid;
    gap: 0.28rem;
    color: rgb(30, 41, 59);
    font-size: 1.25rem;
    font-weight: 900;
    letter-spacing: 0.03em;
  }

  .released-record-date-right span:last-child {
    color: rgb(82, 153, 54);
    font-size: 1.1rem;
  }

  .released-record-chip {
    gap: 0.58rem;
    padding: 0.72rem 1.05rem;
    font-size: 1.05rem;
    box-shadow:
      0 1px 10px rgba(255, 255, 255, 0.72) inset,
      0 10px 20px rgba(15, 23, 42, 0.1);
  }

  .released-record-chip:nth-child(2) {
    max-width: none;
  }

  .released-record-note {
    min-height: 4.3rem;
    padding: 0.98rem 1.22rem;
    gap: 0.7rem;
    font-size: 1.02rem;
    border-radius: 1.55rem;
  }

  .released-record-note-mark {
    margin-top: -0.35rem;
    font-size: 2.8rem;
  }
}

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

</style>
