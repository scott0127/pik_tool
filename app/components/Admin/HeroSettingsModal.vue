<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div v-if="isOpen" class="hero-settings-modal" @click.stop>
            
            <!-- Decorative background -->
            <div class="hero-settings-bg-decor"></div>
            
            <!-- Header -->
            <div class="hero-settings-header">
              <h3 class="hero-settings-title">
                <Icon name="lucide:settings" class="text-emerald-500" />
                首頁飾品設定
              </h3>
              <button @click="close" class="hero-settings-close-btn">
                <Icon name="ion:close" class="text-xl text-gray-500" />
              </button>
            </div>

            <div class="hero-settings-body">
              <!-- Row 1 Combobox -->
              <div class="hero-settings-field">
                <label class="hero-settings-label">
                  <span class="hero-settings-label-badge hero-settings-label-badge--pink">上排</span>
                  飾品種類
                </label>
                <div class="hero-settings-combobox" ref="combobox1Ref">
                  <button
                    type="button"
                    class="hero-settings-combobox-trigger"
                    :class="{ 'hero-settings-combobox-trigger--open': dropdown1Open }"
                    @click="toggleDropdown(1)"
                  >
                    <div v-if="selectedOption1" class="hero-settings-combobox-selected">
                      <img v-if="selectedOption1.imageUrl" :src="selectedOption1.imageUrl" :alt="selectedOption1.variantName" class="hero-settings-combobox-thumb" />
                      <div class="hero-settings-combobox-selected-text">
                        <span class="hero-settings-combobox-selected-main">{{ selectedOption1.categoryName }} › {{ selectedOption1.variantName }}</span>
                        <span class="hero-settings-combobox-selected-sub">{{ selectedOption1.categoryNameEn }} · {{ selectedOption1.pikminCount }} 隻</span>
                      </div>
                    </div>
                    <span v-else class="hero-settings-combobox-placeholder">選擇飾品...</span>
                    <Icon name="lucide:chevrons-up-down" class="hero-settings-combobox-chevron" />
                  </button>
                  <!-- Dropdown Panel -->
                  <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 translate-y-1 scale-98"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0 scale-100"
                    leave-to-class="opacity-0 translate-y-1 scale-98"
                  >
                    <div v-if="dropdown1Open" class="hero-settings-dropdown">
                      <div class="hero-settings-search-wrap">
                        <Icon name="lucide:search" class="hero-settings-search-icon" />
                        <input
                          ref="search1Ref"
                          v-model="searchQuery1"
                          type="text"
                          class="hero-settings-search-input"
                          placeholder="搜尋飾品名稱（中文或英文）..."
                          @keydown.escape="closeDropdown(1)"
                          @keydown.down.prevent="moveHighlight(1, 1)"
                          @keydown.up.prevent="moveHighlight(1, -1)"
                          @keydown.enter.prevent="selectHighlighted(1)"
                        />
                        <button v-if="searchQuery1" @click="searchQuery1 = ''" class="hero-settings-search-clear">
                          <Icon name="lucide:x" class="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div class="hero-settings-dropdown-list" ref="list1Ref">
                        <template v-if="filteredOptions1.length === 0">
                          <div class="hero-settings-dropdown-empty">
                            <Icon name="lucide:search-x" class="text-2xl text-gray-300" />
                            <span>找不到「{{ searchQuery1 }}」相關的飾品</span>
                          </div>
                        </template>
                        <template v-for="(group, groupIdx) in groupedFiltered1" :key="group.type">
                          <div class="hero-settings-dropdown-group-header">
                            {{ getCategoryTypeName(group.type) }}
                            <span class="hero-settings-dropdown-group-count">{{ group.options.length }}</span>
                          </div>
                          <button
                            v-for="(opt, optIdx) in group.options"
                            :key="opt.value"
                            type="button"
                            class="hero-settings-dropdown-item"
                            :class="{
                              'hero-settings-dropdown-item--selected': selectedRow1 === opt.value,
                              'hero-settings-dropdown-item--highlighted': highlightIndex1 === getGlobalIndex(groupedFiltered1, groupIdx, optIdx)
                            }"
                            @click="selectOption(1, opt.value)"
                            @mouseenter="highlightIndex1 = getGlobalIndex(groupedFiltered1, groupIdx, optIdx)"
                          >
                            <img v-if="opt.imageUrl" :src="opt.imageUrl" :alt="opt.variantName" class="hero-settings-dropdown-item-img" />
                            <div class="hero-settings-dropdown-item-img hero-settings-dropdown-item-img--placeholder" v-else>
                              <Icon name="lucide:image-off" class="w-4 h-4 text-gray-300" />
                            </div>
                            <div class="hero-settings-dropdown-item-text">
                              <span class="hero-settings-dropdown-item-main">
                                <span class="hero-settings-dropdown-item-cat">{{ opt.categoryName }}</span>
                                <span class="hero-settings-dropdown-item-sep">›</span>
                                {{ opt.variantName }}
                              </span>
                              <span class="hero-settings-dropdown-item-sub">{{ opt.variantNameEn }} · {{ opt.pikminCount }} 隻</span>
                            </div>
                            <Icon v-if="selectedRow1 === opt.value" name="lucide:check" class="hero-settings-dropdown-item-check" />
                          </button>
                        </template>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Row 2 Combobox -->
              <div class="hero-settings-field">
                <label class="hero-settings-label">
                  <span class="hero-settings-label-badge hero-settings-label-badge--indigo">下排</span>
                  飾品種類
                </label>
                <div class="hero-settings-combobox" ref="combobox2Ref">
                  <button
                    type="button"
                    class="hero-settings-combobox-trigger"
                    :class="{ 'hero-settings-combobox-trigger--open': dropdown2Open }"
                    @click="toggleDropdown(2)"
                  >
                    <div v-if="selectedOption2" class="hero-settings-combobox-selected">
                      <img v-if="selectedOption2.imageUrl" :src="selectedOption2.imageUrl" :alt="selectedOption2.variantName" class="hero-settings-combobox-thumb" />
                      <div class="hero-settings-combobox-selected-text">
                        <span class="hero-settings-combobox-selected-main">{{ selectedOption2.categoryName }} › {{ selectedOption2.variantName }}</span>
                        <span class="hero-settings-combobox-selected-sub">{{ selectedOption2.categoryNameEn }} · {{ selectedOption2.pikminCount }} 隻</span>
                      </div>
                    </div>
                    <span v-else class="hero-settings-combobox-placeholder">選擇飾品...</span>
                    <Icon name="lucide:chevrons-up-down" class="hero-settings-combobox-chevron" />
                  </button>
                  <!-- Dropdown Panel -->
                  <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 translate-y-1 scale-98"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0 scale-100"
                    leave-to-class="opacity-0 translate-y-1 scale-98"
                  >
                    <div v-if="dropdown2Open" class="hero-settings-dropdown">
                      <div class="hero-settings-search-wrap">
                        <Icon name="lucide:search" class="hero-settings-search-icon" />
                        <input
                          ref="search2Ref"
                          v-model="searchQuery2"
                          type="text"
                          class="hero-settings-search-input"
                          placeholder="搜尋飾品名稱（中文或英文）..."
                          @keydown.escape="closeDropdown(2)"
                          @keydown.down.prevent="moveHighlight(2, 1)"
                          @keydown.up.prevent="moveHighlight(2, -1)"
                          @keydown.enter.prevent="selectHighlighted(2)"
                        />
                        <button v-if="searchQuery2" @click="searchQuery2 = ''" class="hero-settings-search-clear">
                          <Icon name="lucide:x" class="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div class="hero-settings-dropdown-list" ref="list2Ref">
                        <template v-if="filteredOptions2.length === 0">
                          <div class="hero-settings-dropdown-empty">
                            <Icon name="lucide:search-x" class="text-2xl text-gray-300" />
                            <span>找不到「{{ searchQuery2 }}」相關的飾品</span>
                          </div>
                        </template>
                        <template v-for="(group, groupIdx) in groupedFiltered2" :key="group.type">
                          <div class="hero-settings-dropdown-group-header">
                            {{ getCategoryTypeName(group.type) }}
                            <span class="hero-settings-dropdown-group-count">{{ group.options.length }}</span>
                          </div>
                          <button
                            v-for="(opt, optIdx) in group.options"
                            :key="opt.value"
                            type="button"
                            class="hero-settings-dropdown-item"
                            :class="{
                              'hero-settings-dropdown-item--selected': selectedRow2 === opt.value,
                              'hero-settings-dropdown-item--highlighted': highlightIndex2 === getGlobalIndex(groupedFiltered2, groupIdx, optIdx)
                            }"
                            @click="selectOption(2, opt.value)"
                            @mouseenter="highlightIndex2 = getGlobalIndex(groupedFiltered2, groupIdx, optIdx)"
                          >
                            <img v-if="opt.imageUrl" :src="opt.imageUrl" :alt="opt.variantName" class="hero-settings-dropdown-item-img" />
                            <div class="hero-settings-dropdown-item-img hero-settings-dropdown-item-img--placeholder" v-else>
                              <Icon name="lucide:image-off" class="w-4 h-4 text-gray-300" />
                            </div>
                            <div class="hero-settings-dropdown-item-text">
                              <span class="hero-settings-dropdown-item-main">
                                <span class="hero-settings-dropdown-item-cat">{{ opt.categoryName }}</span>
                                <span class="hero-settings-dropdown-item-sep">›</span>
                                {{ opt.variantName }}
                              </span>
                              <span class="hero-settings-dropdown-item-sub">{{ opt.variantNameEn }} · {{ opt.pikminCount }} 隻</span>
                            </div>
                            <Icon v-if="selectedRow2 === opt.value" name="lucide:check" class="hero-settings-dropdown-item-check" />
                          </button>
                        </template>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="hero-settings-footer">
              <button @click="close" class="hero-settings-btn hero-settings-btn--cancel">
                取消
              </button>
              <button @click="save" :disabled="isConfigLoading" class="hero-settings-btn hero-settings-btn--save">
                <template v-if="isConfigLoading">
                  <Icon name="lucide:loader-2" class="animate-spin" />
                  儲存中...
                </template>
                <template v-else>
                  儲存設定
                </template>
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useDecorData } from '~/composables/useDecorData';
import { useSiteConfig } from '~/composables/useSiteConfig';
import type { DecorCategoryType } from '~/types/decor';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'saved']);

const { getAllVariantOptions, getAllCategories, getDecorDefinitions } = useDecorData();
const { heroFeaturedConfig, isConfigLoading, updateHeroConfig } = useSiteConfig();

// All variant options (flattened)
const allOptions = getAllVariantOptions();

// Category type display names
const CATEGORY_TYPE_NAMES: Record<string, string> = {
  regular: '📍 地點飾品',
  special: '🎉 活動限定',
  roadside: '🛣️ 路邊',
  weather: '🌧️ 天氣相關',
  regional: '🌏 地區限定',
  rare: '✨ 稀有版本',
};

const CATEGORY_TYPE_ORDER: string[] = ['special', 'regular', 'roadside', 'weather', 'regional', 'rare'];

const getCategoryTypeName = (type: string) => CATEGORY_TYPE_NAMES[type] || type;

// Selection state
const selectedRow1 = ref('');
const selectedRow2 = ref('');

// Dropdown state
const dropdown1Open = ref(false);
const dropdown2Open = ref(false);
const searchQuery1 = ref('');
const searchQuery2 = ref('');
const highlightIndex1 = ref(-1);
const highlightIndex2 = ref(-1);

// Refs
const combobox1Ref = ref<HTMLElement | null>(null);
const combobox2Ref = ref<HTMLElement | null>(null);
const search1Ref = ref<HTMLInputElement | null>(null);
const search2Ref = ref<HTMLInputElement | null>(null);
const list1Ref = ref<HTMLElement | null>(null);
const list2Ref = ref<HTMLElement | null>(null);

// Helper: convert old category-only value to new format
const normalizeConfigValue = (val: string): string => {
  if (!val) return '';
  // Already new format
  if (val.includes(':')) return val;
  // Old format: find category and use its first variant
  const defs = getDecorDefinitions();
  const def = defs.find(d => d.category.id === val);
  if (def && def.variants.length > 0) {
    return `${def.category.id}:${def.variants[0].id}`;
  }
  return val;
};

// Compute selected option details
const selectedOption1 = computed(() => allOptions.find(o => o.value === selectedRow1.value) || null);
const selectedOption2 = computed(() => allOptions.find(o => o.value === selectedRow2.value) || null);

// Filter options by search query
const filterOptions = (query: string) => {
  if (!query.trim()) return allOptions;
  const q = query.toLowerCase();
  return allOptions.filter(opt =>
    opt.categoryName.toLowerCase().includes(q) ||
    opt.categoryNameEn.toLowerCase().includes(q) ||
    opt.variantName.toLowerCase().includes(q) ||
    opt.variantNameEn.toLowerCase().includes(q) ||
    opt.categoryName.includes(query) ||
    opt.variantName.includes(query)
  );
};

const filteredOptions1 = computed(() => filterOptions(searchQuery1.value));
const filteredOptions2 = computed(() => filterOptions(searchQuery2.value));

// Group filtered options by category type
interface OptionGroup {
  type: string;
  options: typeof allOptions;
}

const groupOptions = (options: typeof allOptions): OptionGroup[] => {
  const groups = new Map<string, typeof allOptions>();
  options.forEach(opt => {
    const existing = groups.get(opt.categoryType) || [];
    existing.push(opt);
    groups.set(opt.categoryType, existing);
  });
  // Sort groups by defined order
  return CATEGORY_TYPE_ORDER
    .filter(type => groups.has(type))
    .map(type => ({ type, options: groups.get(type)! }));
};

const groupedFiltered1 = computed(() => groupOptions(filteredOptions1.value));
const groupedFiltered2 = computed(() => groupOptions(filteredOptions2.value));

// Get global flat index from grouped structure
const getGlobalIndex = (groups: OptionGroup[], groupIdx: number, optIdx: number): number => {
  let idx = 0;
  for (let g = 0; g < groupIdx; g++) {
    idx += groups[g].options.length;
  }
  return idx + optIdx;
};

// Flatten grouped options for keyboard navigation
const flattenGrouped = (groups: OptionGroup[]) => {
  return groups.flatMap(g => g.options);
};

// Dropdown toggle
const toggleDropdown = async (row: 1 | 2) => {
  if (row === 1) {
    dropdown1Open.value = !dropdown1Open.value;
    dropdown2Open.value = false;
    if (dropdown1Open.value) {
      searchQuery1.value = '';
      highlightIndex1.value = -1;
      await nextTick();
      search1Ref.value?.focus();
    }
  } else {
    dropdown2Open.value = !dropdown2Open.value;
    dropdown1Open.value = false;
    if (dropdown2Open.value) {
      searchQuery2.value = '';
      highlightIndex2.value = -1;
      await nextTick();
      search2Ref.value?.focus();
    }
  }
};

const closeDropdown = (row: 1 | 2) => {
  if (row === 1) dropdown1Open.value = false;
  else dropdown2Open.value = false;
};

const selectOption = (row: 1 | 2, value: string) => {
  if (row === 1) {
    selectedRow1.value = value;
    dropdown1Open.value = false;
  } else {
    selectedRow2.value = value;
    dropdown2Open.value = false;
  }
};

// Keyboard navigation
const moveHighlight = (row: 1 | 2, dir: 1 | -1) => {
  const grouped = row === 1 ? groupedFiltered1.value : groupedFiltered2.value;
  const flat = flattenGrouped(grouped);
  const currentIdx = row === 1 ? highlightIndex1.value : highlightIndex2.value;
  let newIdx = currentIdx + dir;
  if (newIdx < 0) newIdx = flat.length - 1;
  if (newIdx >= flat.length) newIdx = 0;
  if (row === 1) highlightIndex1.value = newIdx;
  else highlightIndex2.value = newIdx;

  // Scroll highlighted item into view
  nextTick(() => {
    const listRef = row === 1 ? list1Ref.value : list2Ref.value;
    if (listRef) {
      const items = listRef.querySelectorAll('.hero-settings-dropdown-item');
      items[newIdx]?.scrollIntoView({ block: 'nearest' });
    }
  });
};

const selectHighlighted = (row: 1 | 2) => {
  const grouped = row === 1 ? groupedFiltered1.value : groupedFiltered2.value;
  const flat = flattenGrouped(grouped);
  const idx = row === 1 ? highlightIndex1.value : highlightIndex2.value;
  if (idx >= 0 && idx < flat.length) {
    selectOption(row, flat[idx].value);
  }
};

// Click outside handler
const handleClickOutside = (e: MouseEvent) => {
  if (combobox1Ref.value && !combobox1Ref.value.contains(e.target as Node)) {
    dropdown1Open.value = false;
  }
  if (combobox2Ref.value && !combobox2Ref.value.contains(e.target as Node)) {
    dropdown2Open.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Sync when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    const defaultRow1 = 'reverse-valentine-sticker:reverse-valentine-sticker';
    const defaultRow2 = '彩色粉末-世界節慶:彩色粉末-世界節慶';

    if (heroFeaturedConfig.value) {
      selectedRow1.value = normalizeConfigValue(heroFeaturedConfig.value.row1 || defaultRow1);
      selectedRow2.value = normalizeConfigValue(heroFeaturedConfig.value.row2 || defaultRow2);
    } else {
      selectedRow1.value = defaultRow1;
      selectedRow2.value = defaultRow2;
    }

    // Reset dropdown state
    dropdown1Open.value = false;
    dropdown2Open.value = false;
    searchQuery1.value = '';
    searchQuery2.value = '';
  }
});

const close = () => {
  emit('close');
};

const save = async () => {
  if (!selectedRow1.value || !selectedRow2.value) return;
  const success = await updateHeroConfig(selectedRow1.value, selectedRow2.value);
  if (success) {
    emit('saved');
    close();
  }
};
</script>

<style scoped>
/* ── Modal Container ── */
.hero-settings-modal {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem 2rem 2rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.03);
  max-width: 32rem;
  width: 100%;
  position: relative;
  overflow: visible;
  transform: translateZ(0);
}

.hero-settings-bg-decor {
  position: absolute;
  top: 0;
  right: 0;
  width: 8rem;
  height: 8rem;
  background: linear-gradient(to bottom left, rgba(167, 243, 208, 0.5), transparent);
  border-bottom-left-radius: 100%;
  opacity: 0.5;
  z-index: -1;
  pointer-events: none;
}

/* ── Header ── */
.hero-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.hero-settings-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero-settings-close-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  border: none;
  cursor: pointer;
}
.hero-settings-close-btn:hover {
  background: #e5e7eb;
}

/* ── Body ── */
.hero-settings-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-settings-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
}

.hero-settings-label-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 0.375rem;
  color: white;
  letter-spacing: 0.04em;
}
.hero-settings-label-badge--pink {
  background: linear-gradient(135deg, #ec4899, #f472b6);
}
.hero-settings-label-badge--indigo {
  background: linear-gradient(135deg, #6366f1, #818cf8);
}

/* ── Combobox Trigger ── */
.hero-settings-combobox {
  position: relative;
}

.hero-settings-combobox-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 3.25rem;
  text-align: left;
}
.hero-settings-combobox-trigger:hover {
  border-color: #d1d5db;
  background: #f3f4f6;
}
.hero-settings-combobox-trigger--open {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
  background: white;
}

.hero-settings-combobox-selected {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}

.hero-settings-combobox-thumb {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  border-radius: 0.375rem;
  background: white;
  border: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.hero-settings-combobox-selected-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.hero-settings-combobox-selected-main {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hero-settings-combobox-selected-sub {
  font-size: 0.7rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-settings-combobox-placeholder {
  color: #9ca3af;
  font-size: 0.875rem;
}

.hero-settings-combobox-chevron {
  flex-shrink: 0;
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
}

/* ── Dropdown Panel ── */
.hero-settings-dropdown {
  position: absolute;
  top: calc(100% + 0.375rem);
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.875rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* ── Search ── */
.hero-settings-search-wrap {
  position: relative;
  padding: 0.625rem;
  border-bottom: 1px solid #f3f4f6;
}
.hero-settings-search-icon {
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
}
.hero-settings-search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s;
}
.hero-settings-search-input:focus {
  border-color: #10b981;
  background: white;
}
.hero-settings-search-input::placeholder {
  color: #c4c4c4;
}
.hero-settings-search-clear {
  position: absolute;
  right: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.hero-settings-search-clear:hover {
  background: #e5e7eb;
  color: #4b5563;
}

/* ── Dropdown List ── */
.hero-settings-dropdown-list {
  max-height: 17rem;
  overflow-y: auto;
  padding: 0.375rem;
  scroll-behavior: smooth;
}
.hero-settings-dropdown-list::-webkit-scrollbar {
  width: 5px;
}
.hero-settings-dropdown-list::-webkit-scrollbar-track {
  background: transparent;
}
.hero-settings-dropdown-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 999px;
}

/* ── Group Header ── */
.hero-settings-dropdown-group-header {
  font-size: 0.7rem;
  font-weight: 700;
  color: #6b7280;
  padding: 0.5rem 0.625rem 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  user-select: none;
}
.hero-settings-dropdown-group-count {
  font-size: 0.625rem;
  background: #f3f4f6;
  color: #9ca3af;
  padding: 0.0625rem 0.375rem;
  border-radius: 999px;
  font-weight: 600;
}

/* ── Dropdown Item ── */
.hero-settings-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.1s;
  text-align: left;
}
.hero-settings-dropdown-item:hover,
.hero-settings-dropdown-item--highlighted {
  background: #f0fdf4;
}
.hero-settings-dropdown-item--selected {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}
.hero-settings-dropdown-item--selected:hover {
  background: #d1fae5;
}

.hero-settings-dropdown-item-img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  border-radius: 0.375rem;
  background: white;
  border: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.hero-settings-dropdown-item-img--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-settings-dropdown-item-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.hero-settings-dropdown-item-main {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hero-settings-dropdown-item-cat {
  color: #6b7280;
  font-weight: 500;
}
.hero-settings-dropdown-item-sep {
  color: #d1d5db;
  margin: 0 0.25rem;
  font-weight: 400;
}
.hero-settings-dropdown-item-sub {
  font-size: 0.6875rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-settings-dropdown-item-check {
  flex-shrink: 0;
  color: #10b981;
  width: 1rem;
  height: 1rem;
}

/* ── Empty State ── */
.hero-settings-dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: #9ca3af;
  font-size: 0.8125rem;
}

/* ── Footer ── */
.hero-settings-footer {
  margin-top: 2rem;
  display: flex;
  gap: 0.75rem;
}

.hero-settings-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.15s;
}
.hero-settings-btn--cancel {
  background: #f3f4f6;
  color: #4b5563;
}
.hero-settings-btn--cancel:hover {
  background: #e5e7eb;
}
.hero-settings-btn--save {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
.hero-settings-btn--save:hover {
  background: #059669;
}
.hero-settings-btn--save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Scale utility (used in transitions) ── */
.scale-98 {
  transform: scale(0.98);
}

/* ── Responsive ── */
@media (min-width: 640px) {
  .hero-settings-modal {
    padding: 2rem;
  }
  .hero-settings-title {
    font-size: 1.375rem;
  }
}
</style>
