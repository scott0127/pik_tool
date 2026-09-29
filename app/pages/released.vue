<template>
  <div class="released-page min-h-screen pt-20 pb-24 lg:pt-24">
    <main class="released-shell mx-auto max-w-6xl px-4 sm:px-6">
      <header class="manor-hero gsap-stagger">
        <div class="manor-hero-copy">
          <span class="manor-eyebrow">{{ $t('released.manor.eyebrow') }}</span>
          <h1 class="released-hero-title">{{ $t('released.title') }}</h1>
          <p class="released-hero-subtitle">{{ $t('released.subtitle') }}</p>
          <p class="manor-intro">{{ $t('released.manor.intro') }}</p>
          <div class="manor-hero-actions">
            <button type="button" class="manor-add-button" @click="openModal()">
              <Icon name="lucide:plus" class="h-5 w-5" />
              {{ $t('released.add_record') }}
            </button>
            <div class="manor-count" :aria-label="$t('released.stats.total', { count: filteredRecords.length })">
              <strong>{{ filteredRecords.length }}</strong>
              <span>{{ $t('released.manor.count') }}</span>
            </div>
          </div>
        </div>

        <div class="manor-scene">
          <div class="manor-sun" aria-hidden="true" />
          <div class="manor-cloud manor-cloud-one" aria-hidden="true" />
          <div class="manor-cloud manor-cloud-two" aria-hidden="true" />
          <div class="manor-hill manor-hill-back" aria-hidden="true" />
          <div class="manor-hill manor-hill-middle" aria-hidden="true" />
          <div class="manor-house" aria-hidden="true">
            <div class="manor-house-roof" />
            <div class="manor-house-body">
              <span class="manor-house-window manor-house-window-left" />
              <span class="manor-house-window manor-house-window-right" />
              <span class="manor-house-door" />
            </div>
          </div>
          <div class="manor-tree manor-tree-left" aria-hidden="true"><span /><span /><span /></div>
          <div class="manor-tree manor-tree-right" aria-hidden="true"><span /><span /><span /></div>
          <div class="manor-hill manor-hill-front" aria-hidden="true" />
          <div class="manor-path" aria-hidden="true" />
          <div class="manor-flowers manor-flowers-left" aria-hidden="true" />
          <div class="manor-flowers manor-flowers-right" aria-hidden="true" />
          <button
            v-for="(record, index) in filteredRecords.slice(0, 5)"
            :key="record.id"
            type="button"
            class="manor-guest"
            :class="'manor-guest-' + index"
            :aria-label="$t('released.manor.find_record', { name: record.nickname || getDecorName(record.decorItemId) })"
            @click="scrollToRecord(record.id)"
          >
            <img :src="getRecordImageUrl(record.decorItemId) || ''" :alt="record.nickname || getDecorName(record.decorItemId)" loading="lazy" />
            <span>{{ record.nickname || getDecorName(record.decorItemId) }}</span>
          </button>
        </div>
      </header>

      <section class="manor-ledger" aria-labelledby="manor-ledger-title">
        <div class="manor-ledger-heading gsap-stagger">
          <div>
            <span class="manor-section-label">{{ $t('released.manor.section_label') }}</span>
            <h2 id="manor-ledger-title">{{ $t('released.manor.section_title') }}</h2>
          </div>
          <p>{{ $t('released.stats.total', { count: filteredRecords.length }) }}</p>
        </div>

      <div v-if="filteredRecords.length > 0" class="released-record-list">
        <article
          v-for="(record, index) in filteredRecords"
          :key="record.id"
          :id="'released-record-' + record.id"
          class="released-record-row gsap-card group"
        >
          <div class="released-record-image">
            <div class="plot-hill plot-hill-back" aria-hidden="true" />
            <div class="plot-hill plot-hill-front" aria-hidden="true" />
            <div class="plot-fence" aria-hidden="true" />
            <img
              :src="getRecordImageUrl(record.decorItemId) || ''"
              :alt="record.nickname || getDecorName(record.decorItemId)"
              loading="lazy"
              class="plot-pikmin"
              @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; }"
            >
            <div class="plot-ground" aria-hidden="true" />
            <span class="plot-flower plot-flower-left" aria-hidden="true" />
            <span class="plot-flower plot-flower-right" aria-hidden="true" />
          </div>

          <div class="released-record-content">
            <span class="released-record-number">{{ String(index + 1).padStart(2, '0') }} / {{ $t('released.manor.record') }}</span>
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
                  type="button"
                  @click.stop="editRecord(record)"
                  class="released-record-action"
                  :title="$t('released.card.edit')"
                  :aria-label="$t('released.card.edit')"
                >
                  <Icon name="lucide:edit-2" class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  @click.stop="confirmDelete(record)"
                  class="released-record-action released-record-action-delete"
                  :title="$t('released.card.delete')"
                  :aria-label="$t('released.card.delete')"
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
        </article>
      </div>

        <div v-else class="released-empty-state gsap-stagger">
          <div class="empty-sprout" aria-hidden="true"><span /><span /></div>
          <h3>{{ $t('released.empty.title') }}</h3>
          <p>{{ $t('released.empty.desc') }}</p>
          <button type="button" class="manor-add-button" @click="openModal()">
            <Icon name="lucide:plus" class="h-5 w-5" />
            {{ $t('released.add_record') }}
          </button>
        </div>
      </section>
    </main>

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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { gsap } from 'gsap';
import type { DecorItem, ReleasedPikmin } from '~/types/decor';
import { PIKMIN_TYPE_COLORS } from '~/types/decor';

const { t } = useI18n();
const authStore = useAuthStore();
const { showToast } = useToast();
const { 
  syncStatus, 
  syncCountdown, 
  syncConflict,
  getRecords, 
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

onMounted(async () => {
  loadFromLocal();
  if (authStore.isAuthenticated.value) {
    await loadFromCloud();
  }

  // GSAP Initial Stagger Animation
  nextTick(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

function scrollToRecord(id: string) {
  document.getElementById('released-record-' + id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'center',
  });
}

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

<style scoped src="../assets/css/released-manor.css"></style>
