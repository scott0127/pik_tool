<template>
  <div class="space-y-6 pb-8 relative">
    <!-- Decorative floating elements -->
    <div
      class="absolute top-0 left-0 w-full h-[400px] overflow-hidden pointer-events-none -z-10"
    >
      <div class="deco-leaf deco-leaf-1">
        <Icon name="lucide:leaf" class="w-6 h-6 text-emerald-300/30" />
      </div>
      <div class="deco-leaf deco-leaf-2">
        <Icon name="lucide:flower-2" class="w-5 h-5 text-pink-300/25" />
      </div>
      <div class="deco-leaf deco-leaf-3">
        <Icon name="lucide:sparkles" class="w-4 h-4 text-amber-300/30" />
      </div>
      <div class="deco-leaf deco-leaf-4">
        <Icon name="lucide:leaf" class="w-8 h-8 text-teal-300/20" />
      </div>
      <div class="deco-leaf deco-leaf-5">
        <Icon name="lucide:star" class="w-3 h-3 text-purple-300/25" />
      </div>
    </div>

    <!-- -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1
          class="text-3xl font-extrabold text-gray-800 flex items-center gap-3"
        >
          <span
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200"
          >
            <Icon name="lucide:book-open" class="w-5 h-5 text-white" />
          </span>
          <span class="text-gradient">{{ $t("collection.title") }}</span>
        </h1>
        <p class="readable-on-art text-slate-700 font-semibold mt-1">{{ $t("collection.subtitle") }}</p>
      </div>

      <!-- Quick stats -->
      <div class="liquid-glass-soft liquid-glass-dynamic flex items-center gap-4 rounded-2xl px-4 py-2">
        <div class="text-right">
          <p class="text-xs text-gray-500">
            {{ $t("collection.stats.showing") }}
          </p>
          <p class="text-lg font-bold text-emerald-600">
            {{ filteredItems.length }} {{ $t("collection.stats.items") }}
          </p>
        </div>
        <div class="w-px h-8 bg-gray-200"></div>
        <div class="text-right">
          <p class="text-xs text-gray-500">
            {{ $t("collection.stats.collected") }}
          </p>
          <p class="text-lg font-bold text-emerald-600">{{ collectedCount }}</p>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div
      class="liquid-glass-2026 liquid-glass-readable liquid-glass-dynamic relative rounded-3xl p-5 md:p-6 mb-6 z-10 transition-all duration-300"
    >
      <!-- Background gradients wrapper (clipped) -->
      <div class="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none -z-10">
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 to-teal-50/40 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-50/40 to-pink-50/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"
        ></div>
      </div>

      <!-- Collapsed: compact summary bar -->
      <div
        class="flex items-center gap-3"
        :class="{
          'md:hidden': isFilterExpanded,
          'mb-0': !isFilterExpanded,
          'mb-6 md:mb-0': isFilterExpanded,
        }"
      >
        <div class="flex-1 relative group">
          <SearchBar
            v-model="searchQuery"
            :placeholder="$t('collection.filters.search_placeholder')"
            class="w-full shadow-sm border-gray-200"
          />
        </div>
        <div
          v-if="activeFilterCount > 0"
          class="liquid-glass-chip px-3 py-1.5 text-emerald-800 text-sm"
        >
          <Icon name="lucide:filter" class="w-3.5 h-3.5" />
          <span>{{ activeFilterCount }}</span>
        </div>
        <button
          @click="isFilterExpanded = true"
          class="liquid-glass-soft relative flex items-center gap-2 px-4 py-2.5 text-emerald-800 rounded-xl text-sm font-bold transition-all"
        >
          <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
          <span class="hidden sm:inline">{{
            $t("collection.filters.expand")
          }}</span>
          <Icon name="lucide:chevron-down" class="w-4 h-4" />
          
          <ClientOnly>
            <ThreeFilterHint />
          </ClientOnly>
        </button>
      </div>

      <!-- Expanded: full filter panel -->
      <div v-if="isFilterExpanded" class="hidden md:block space-y-6">
        <!-- Collapse toggle header -->
        <div class="flex items-center justify-between">
          <span
            class="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"
          >
            <Icon
              name="lucide:sliders-horizontal"
              class="w-4 h-4 text-emerald-500"
            />
            {{ $t("collection.filters.title") }}
          </span>
          <button
            @click="isFilterExpanded = false"
            class="liquid-glass-soft flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-800 rounded-lg text-xs font-bold transition-all"
          >
            <Icon name="lucide:chevron-up" class="w-3.5 h-3.5" />
            {{ $t("collection.filters.collapse") }}
          </button>
        </div>

        <div class="flex flex-col lg:flex-row gap-6 lg:items-end">
          <div class="flex-1 w-full relative group">
            <label
              class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
            >
              <Icon name="lucide:search" class="w-4 h-4 text-emerald-500" />
              {{ $t("collection.filters.search_label") }}
            </label>
            <div
              class="relative transition-all duration-300 group-focus-within:ring-4 ring-emerald-500/10 rounded-2xl"
            >
              <SearchBar
                v-model="searchQuery"
                :placeholder="$t('collection.filters.search_placeholder')"
                class="w-full shadow-sm border-gray-200"
              />
            </div>
          </div>

          <div class="w-full lg:w-auto shrink-0">
            <label
              class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
            >
              <Icon
                name="lucide:toggle-left"
                class="w-4 h-4 text-emerald-500"
              />
              {{ $t("collection.filters.status") }}
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in collectionFilters"
                :key="filter.value"
                @click="collectionFilter = filter.value"
                class="category-tag"
                :class="[
                  collectionFilter === filter.value
                    ? 'category-tag-active'
                    : 'category-tag-inactive',
                ]"
              >
                <Icon :name="filter.icon" class="w-4 h-4" />
                <span>{{ filter.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div
          class="h-px w-full bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent"
        ></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label
              class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
            >
              <Icon
                name="lucide:layout-grid"
                class="w-4 h-4 text-emerald-500"
              />
              {{ $t("collection.filters.category_type") }}
            </label>
            <CategoryNav
              :selected="selectedCategoryType"
              @select="selectedCategoryType = $event"
              class="w-full"
            />
          </div>

          <div>
            <label
              class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
            >
              <Icon name="lucide:leaf" class="w-4 h-4 text-emerald-500" />
              {{ $t("collection.filters.pikmin_type") }}
            </label>
            <PikminFilter
              :selected="selectedPikminType"
              @select="selectedPikminType = $event"
              class="w-full"
            />
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 -translate-y-4 scale-95"
        >
          <div
            v-if="hasActiveFilters"
            class="liquid-glass-soft flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl p-4 gap-4"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-emerald-800 font-bold mr-2">{{
                $t("collection.filters.active_label")
              }}</span>

              <span
                v-if="searchQuery"
                class="liquid-glass-chip group px-3 py-1.5 text-emerald-800 text-sm"
              >
                <Icon name="lucide:search" class="w-3.5 h-3.5 opacity-70" />
                {{ searchQuery }}
                <button
                  @click="searchQuery = ''"
                  class="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors ml-1"
                >
                  ×
                </button>
              </span>

              <span
                v-if="selectedCategoryType"
                class="liquid-glass-chip group px-3 py-1.5 text-emerald-800 text-sm"
              >
                <Icon
                  name="lucide:layout-grid"
                  class="w-3.5 h-3.5 opacity-70"
                />
                {{ getCategoryTypeName(selectedCategoryType) }}
                <button
                  @click="selectedCategoryType = null"
                  class="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors ml-1"
                >
                  ×
                </button>
              </span>

              <span
                v-if="selectedPikminType"
                class="liquid-glass-chip group px-3 py-1.5 text-emerald-800 text-sm"
              >
                <Icon name="lucide:leaf" class="w-3.5 h-3.5 opacity-70" />
                {{ selectedPikminType ? PIKMIN_TYPE_NAMES[selectedPikminType] : "" }}
                <button
                  @click="selectedPikminType = null"
                  class="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors ml-1"
                >
                  ×
                </button>
              </span>

              <span
                v-if="collectionFilter !== 'all'"
                class="liquid-glass-chip group px-3 py-1.5 text-emerald-800 text-sm"
              >
                <Icon
                  :name="selectedCollectionFilter?.icon || 'lucide:list'"
                  class="w-3.5 h-3.5 opacity-70"
                />
                {{ selectedCollectionFilter?.label || "" }}
                <button
                  @click="collectionFilter = 'all'"
                  class="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors ml-1"
                >
                  ×
                </button>
              </span>

              <span
                v-if="isLimitedMode"
                class="liquid-glass-chip group px-3 py-1.5 text-amber-800 text-sm"
              >
                <Icon
                  name="lucide:alert-triangle"
                  class="w-3.5 h-3.5 opacity-70"
                />
                {{ $t("collection.filters.limited") }}
                <button
                  @click="isLimitedMode = false"
                  class="w-5 h-5 flex items-center justify-center rounded-full bg-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white transition-colors ml-1"
                >
                  ×
                </button>
              </span>

              <span
                v-if="selectedCategoryId"
                class="liquid-glass-chip group px-3 py-1.5 text-purple-800 text-sm"
              >
                <Icon name="lucide:folder" class="w-3.5 h-3.5 opacity-70" />
                {{ getCategoryName(selectedCategoryId) }}
                <button
                  @click="selectedCategoryId = null"
                  class="w-5 h-5 flex items-center justify-center rounded-full bg-purple-200 text-purple-700 hover:bg-purple-500 hover:text-white transition-colors ml-1"
                >
                  ×
                </button>
              </span>
            </div>

            <button
              @click="clearAllFilters"
              class="liquid-glass-soft shrink-0 flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-700 rounded-xl text-sm font-bold transition-all focus:ring-2 focus:ring-red-200 outline-none"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
              {{ $t("collection.filters.clear") }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ===== Mobile Navigation Drawer (Bottom Sheet with Three.js) ===== -->
    <ClientOnly>
      <Teleport to="body">
        <Transition
          enter-active-class="transition-[transform,opacity] duration-360 ease-[cubic-bezier(0.32,0.72,0,1)]"
          enter-from-class="opacity-0 translate-y-full"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-[transform,opacity] duration-280 ease-[cubic-bezier(0.32,0.72,0,1)]"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-full"
        >
          <div
            v-if="isFilterExpanded"
            class="md:hidden fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none"
          >
            <!-- Backdrop with Three.js -->
            <div
              class="absolute inset-0 bg-gray-900/60 pointer-events-auto transition-opacity"
              @click="isFilterExpanded = false"
            >
              <ThreeSporeBackdrop v-if="!isMobile" class="opacity-80" />
            </div>

            <!-- Bottom Sheet Content -->
            <div
              class="liquid-glass-2026 liquid-glass-readable relative w-full max-h-[85vh] rounded-t-[2.5rem] pointer-events-auto flex flex-col overflow-hidden"
              :class="{ 'liquid-glass-dynamic': !isMobile }"
            >
              <!-- Notch -->
              <div
                class="w-full flex justify-center pt-4 pb-2"
                @click="isFilterExpanded = false"
              >
                <div class="w-12 h-1.5 bg-gray-300/80 rounded-full"></div>
              </div>

              <!-- Header -->
              <div
                class="flex items-center justify-between px-6 pb-4 border-b border-white/60"
              >
                <span
                  class="text-lg font-bold text-gray-800 flex items-center gap-2"
                >
                  <Icon
                    name="lucide:sliders-horizontal"
                    class="w-5 h-5 text-emerald-500"
                  />
                  {{ $t("collection.filters.title") }}
                </span>
                <button
                  @click="isFilterExpanded = false"
                  class="liquid-glass-soft p-2 text-gray-500 hover:text-gray-700 rounded-full active:scale-90 transition-transform"
                >
                  <Icon name="lucide:x" class="w-5 h-5" />
                </button>
              </div>

              <!-- Scrollable Content -->
              <div
                class="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar"
              >
                <!-- Mobile Search -->
                <div class="w-full relative group">
                  <label
                    class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
                  >
                    <Icon
                      name="lucide:search"
                      class="w-4 h-4 text-emerald-500"
                    />
                    {{ $t("collection.filters.search_label") }}
                  </label>
                  <div
                    class="relative transition-all duration-300 focus-within:ring-4 ring-emerald-500/10 rounded-2xl"
                  >
                    <SearchBar
                      v-model="searchQuery"
                      :placeholder="$t('collection.filters.search_placeholder')"
                      class="w-full shadow-sm border-gray-200"
                    />
                  </div>
                </div>

                <!-- Status -->
                <div>
                  <label
                    class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
                  >
                    <Icon
                      name="lucide:toggle-left"
                      class="w-4 h-4 text-emerald-500"
                    />
                    {{ $t("collection.filters.status") }}
                  </label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="filter in collectionFilters"
                      :key="filter.value"
                      @click="collectionFilter = filter.value"
                      class="category-tag"
                      :class="[
                        collectionFilter === filter.value
                          ? 'category-tag-active'
                          : 'category-tag-inactive',
                      ]"
                    >
                      <Icon :name="filter.icon" class="w-4 h-4" />
                      <span>{{ filter.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Category Type -->
                <div>
                  <label
                    class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
                  >
                    <Icon
                      name="lucide:layout-grid"
                      class="w-4 h-4 text-emerald-500"
                    />
                    {{ $t("collection.filters.category_type") }}
                  </label>
                  <CategoryNav
                    :selected="selectedCategoryType"
                    @select="selectedCategoryType = $event"
                    class="w-full"
                  />
                </div>

                <!-- Pikmin Type -->
                <div>
                  <label
                    class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"
                  >
                    <Icon name="lucide:leaf" class="w-4 h-4 text-emerald-500" />
                    {{ $t("collection.filters.pikmin_type") }}
                  </label>
                  <PikminFilter
                    :selected="selectedPikminType"
                    @select="selectedPikminType = $event"
                    class="w-full"
                  />
                </div>
              </div>

              <!-- Footer (Sticky) -->
              <div
                class="p-4 border-t border-white/60 bg-slate-50/95 sm:bg-white/20 sm:backdrop-blur-md flex items-center justify-between gap-4"
              >
                <button
                  @click="clearAllFilters"
                  class="liquid-glass-soft flex-1 py-3.5 text-gray-700 hover:text-red-700 rounded-xl text-sm font-bold transition-all active:scale-95"
                >
                  {{ $t("collection.filters.clear") }}
                </button>
                <button
                  @click="isFilterExpanded = false"
                  class="liquid-glass-button flex-[2] py-3.5 rounded-xl text-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon name="lucide:check" class="w-5 h-5" />
                  顯示 {{ filteredItems.length }} 個結果
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <!-- Results Section -->
    <div>
      <!-- Category Grouped View (when no filters) -->
      <template v-if="!hasActiveFilters">
        <!-- Regular Categories Section -->
        <div class="mb-12">
          <div
            class="collection-section-card flex items-center gap-3 mb-4 px-3 py-3 rounded-3xl"
          >
            <span
              class="collection-section-icon w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md"
            >
              <Icon name="lucide:map-pin" class="w-6 h-6 text-white" />
            </span>
            <div class="flex-1">
              <h2 class="collection-section-title text-2xl font-bold text-emerald-700">
                {{ $t("collection.sections.regular.title") }}
              </h2>
              <p class="collection-section-desc text-sm mt-1">
                {{ $t("collection.sections.regular.desc") }}
              </p>
            </div>
            <div class="collection-section-actions flex items-center gap-1.5">
              <button
                @click="expandAllCategories"
                class="collection-section-action"
                :title="$t('collection.actions.expand_all')"
              >
                <Icon name="lucide:chevrons-down" class="w-4 h-4" />
              </button>
              <button
                @click="collapseAllCategories"
                class="collection-section-action"
                :title="$t('collection.actions.collapse_all')"
              >
                <Icon name="lucide:chevrons-up" class="w-4 h-4" />
              </button>
              <p class="collection-count-pill">
                {{ regularCategoriesCount
                }}{{ $t("collection.sections.count_suffix") }}
              </p>
            </div>
          </div>

          <!-- Info Box -->
          <div
            class="collection-info-card p-4 mb-6 rounded-2xl"
          >
            <div class="flex items-start gap-3">
              <span
                class="collection-info-icon w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <Icon name="lucide:info" class="w-4 h-4 text-emerald-600" />
              </span>
              <div>
                <p class="collection-info-title text-sm font-semibold text-emerald-800 mb-1">
                  {{ $t("collection.info.regular.title") }}
                </p>
                <p class="collection-info-desc text-xs text-emerald-700">
                  {{ $t("collection.info.regular.desc") }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-for="def in regularCategories"
            :key="def.category.id"
            :id="`cat-${def.category.id}`"
            class="mb-6"
          >
            <!-- Category Header (clickable accordion) -->
            <div
              class="collection-category-header liquid-glass-2026 liquid-glass-readable liquid-glass-dynamic flex items-center gap-3 sticky top-[120px] z-10 px-4 py-3 rounded-xl cursor-pointer group"
              @click="toggleCategory(def.category.id)"
            >
              <Icon :name="getCategoryIcon(def.category.icon)" class="text-2xl flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-bold text-gray-800">
                  {{
                    locale === "en" ? def.category.nameEn : def.category.name
                  }}
                </h2>
                <p class="text-xs text-gray-500">
                  {{
                    locale === "en" ? def.category.name : def.category.nameEn
                  }}
                </p>
              </div>
              <button
                @click.stop="
                  handleCollectAll(
                    def.category.id,
                    locale === 'en' ? def.category.nameEn : def.category.name,
                  )
                "
                class="liquid-glass-button px-3 py-1.5 text-xs rounded-lg flex items-center gap-1"
                :title="$t('collection.actions.collect_all_tooltip')"
              >
                <Icon name="lucide:check-check" class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">{{
                  $t("collection.actions.collect_all")
                }}</span>
              </button>
              <div class="text-right flex-shrink-0 w-20">
                <p
                  class="text-sm font-bold"
                  :class="
                    getCategoryProgressPercent(def.category.id) === 100
                      ? 'text-amber-500'
                      : 'text-emerald-600'
                  "
                >
                  {{ getCategoryProgress(def.category.id) }}
                </p>
                <!-- Mini Progress Bar -->
                <div
                  class="h-1.5 w-full bg-gray-200 rounded-full mt-1 overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="
                      getCategoryProgressPercent(def.category.id) === 100
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    "
                    :style="{
                      width: getCategoryProgressPercent(def.category.id) + '%',
                    }"
                  ></div>
                </div>
              </div>
              <Icon
                name="lucide:chevron-down"
                class="w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0"
                :class="isCategoryExpanded(def.category.id) ? 'rotate-180' : ''"
              />
            </div>

            <!-- Collapsible content -->
            <div
              class="collection-category-content-wrapper"
              :class="{ 'is-open': isCategoryExpanded(def.category.id) }"
            >
              <div class="collection-category-content-inner mt-4">
                <DecorGrid
                  :items="getItemsForCategory(def.category.id)"
                  @clear-filters="clearAllFilters"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Special Categories Section -->
        <div
          v-if="specialCategories.length > 0"
          id="special-categories-section"
        >
          <div
            class="collection-section-card collection-section-card-purple flex items-center gap-3 mb-4 px-3 py-3 rounded-3xl"
          >
            <span
              class="collection-section-icon w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-md"
            >
              <Icon name="lucide:star" class="w-6 h-6 text-white" />
            </span>
            <div class="flex-1">
              <h2 class="collection-section-title text-2xl font-bold text-purple-700">
                {{ $t("collection.sections.special.title") }}
              </h2>
              <p class="collection-section-desc text-sm mt-1">
                {{ $t("collection.sections.special.desc") }}
              </p>
            </div>
            <p class="collection-count-pill collection-count-pill-purple">
              {{ specialCategoriesCount
              }}{{ $t("collection.sections.count_suffix") }}
            </p>
          </div>

          <!-- Info Box -->
          <div
            class="collection-info-card collection-info-card-purple p-4 mb-6 rounded-2xl"
          >
            <div class="flex items-start gap-3">
              <span
                class="collection-info-icon w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <Icon name="lucide:sparkles" class="w-4 h-4 text-purple-600" />
              </span>
              <div>
                <p class="collection-info-title text-sm font-semibold text-purple-800 mb-1">
                  {{ $t("collection.info.special.title") }}
                </p>
                <p class="collection-info-desc text-xs text-purple-700">
                  {{ $t("collection.info.special.desc") }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-for="def in specialCategories"
            :key="def.category.id"
            :id="`cat-${def.category.id}`"
            class="mb-6"
          >
            <!-- Category Header (clickable accordion) -->
            <div
              class="collection-category-header liquid-glass-2026 liquid-glass-readable liquid-glass-dynamic flex items-center gap-3 sticky top-[120px] z-10 px-4 py-3 rounded-xl cursor-pointer group"
              @click="toggleCategory(def.category.id)"
            >
              <Icon :name="getCategoryIcon(def.category.icon)" class="text-2xl flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-bold text-gray-800">
                  {{
                    locale === "en" ? def.category.nameEn : def.category.name
                  }}
                </h2>
                <p class="text-xs text-gray-500">
                  {{
                    locale === "en" ? def.category.name : def.category.nameEn
                  }}
                </p>
              </div>
              <button
                @click.stop="
                  handleCollectAll(
                    def.category.id,
                    locale === 'en' ? def.category.nameEn : def.category.name,
                  )
                "
                class="liquid-glass-button px-3 py-1.5 text-xs rounded-lg flex items-center gap-1"
                :title="$t('collection.actions.collect_all_tooltip')"
              >
                <Icon name="lucide:check-check" class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">{{
                  $t("collection.actions.collect_all")
                }}</span>
              </button>
              <div class="text-right flex-shrink-0 w-20">
                <p
                  class="text-sm font-bold"
                  :class="
                    getCategoryProgressPercent(def.category.id) === 100
                      ? 'text-amber-500'
                      : 'text-purple-600'
                  "
                >
                  {{ getCategoryProgress(def.category.id) }}
                </p>
                <!-- Mini Progress Bar -->
                <div
                  class="h-1.5 w-full bg-gray-200 rounded-full mt-1 overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="
                      getCategoryProgressPercent(def.category.id) === 100
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                        : 'bg-gradient-to-r from-purple-400 to-fuchsia-400'
                    "
                    :style="{
                      width: getCategoryProgressPercent(def.category.id) + '%',
                    }"
                  ></div>
                </div>
              </div>
              <Icon
                name="lucide:chevron-down"
                class="w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0"
                :class="isCategoryExpanded(def.category.id) ? 'rotate-180' : ''"
              />
            </div>

            <!-- Collapsible content -->
            <div
              class="collection-category-content-wrapper"
              :class="{ 'is-open': isCategoryExpanded(def.category.id) }"
            >
              <div class="collection-category-content-inner mt-4">
                <DecorGrid
                  :items="getItemsForCategory(def.category.id)"
                  @clear-filters="clearAllFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Flat Grid View (when filters active) -->
      <template v-else>
        <DecorGrid :items="filteredItems" @clear-filters="clearAllFilters" />
      </template>
    </div>

    <!-- Sync Status Bar -->
    <SyncStatusBar />

    <!-- Category Jump Navigation (All screen sizes) -->
    <CategoryJumpNav
      :categories="jumpNavCategories"
      :show-scroll-top="showScrollTop"
      :has-special="specialCategories.length > 0"
      :has-active-filters="hasActiveFilters"
    />
  </div>
</template>

<script setup lang="ts">
import {
  PIKMIN_TYPE_NAMES,
  type PikminType,
  type DecorItem,
} from "~/types/decor";
import type { CollectionCategoryFilter } from "~/composables/useCollectionFilters";
import { gsap } from "gsap";
import { useParallax } from "~/composables/useParallax";

const route = useRoute();
const { t, locale } = useI18n();
const { isCollected, collectAllInCategory, hasPendingChanges } = useCollection();
const {
  getAllDecorItems,
  getDecorDefinitions,
  getItemsByCategoryType,
  searchItems,
  getItemsByCategory,
} = useDecorData();

// Filter state
const searchQuery = ref("");
const selectedCategoryType = ref<CollectionCategoryFilter | null>(null);
const selectedPikminType = ref<PikminType | null>(null);
const collectionFilter = ref<"all" | "collected" | "uncollected">("all");
const showScrollTop = ref(false);

// UX: Collapsible filter panel (default collapsed)
const isFilterExpanded = ref(false);

const { isMobile, isAmbientPaused } = useParallax();
watch(isFilterExpanded, (expanded) => {
  isAmbientPaused.value = expanded;
});

// UX: Accordion - track collapsed categories (default all expanded)
const collapsedCategories = ref<Set<string>>(new Set());
let categoryBulkFrame: number | null = null;
let scrollFrame: number | null = null;

const cancelCategoryBulkToggle = () => {
  if (categoryBulkFrame !== null) {
    cancelAnimationFrame(categoryBulkFrame);
    categoryBulkFrame = null;
  }
};

const toggleCategory = (categoryId: string) => {
  cancelCategoryBulkToggle();
  requestAnimationFrame(() => {
    const newSet = new Set(collapsedCategories.value);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    collapsedCategories.value = newSet;
  });
};

const isCategoryExpanded = (categoryId: string) =>
  !collapsedCategories.value.has(categoryId);

const updateCategoriesInBatches = (categoryIds: string[], expand: boolean) => {
  cancelCategoryBulkToggle();

  const batchSize = 4;
  let index = 0;
  const nextSet = new Set(collapsedCategories.value);

  const runBatch = () => {
    const end = Math.min(index + batchSize, categoryIds.length);
    for (; index < end; index += 1) {
      const id = categoryIds[index];
      if (expand) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }
    }

    collapsedCategories.value = new Set(nextSet);

    if (index < categoryIds.length) {
      categoryBulkFrame = requestAnimationFrame(runBatch);
    } else {
      categoryBulkFrame = null;
    }
  };

  runBatch();
};

const expandAllCategories = () => {
  const allIds = getDecorDefinitions().map((d) => d.category.id);
  updateCategoriesInBatches(allIds, true);
};

const collapseAllCategories = () => {
  const allIds = getDecorDefinitions().map((d) => d.category.id);
  updateCategoriesInBatches(allIds, false);
};

// UX: Category progress percentage
const getCategoryProgressPercent = (categoryId: string): number => {
  const items = getItemsByCategory(categoryId);
  if (items.length === 0) return 0;
  const collected = items.filter((item) => isCollected(item.id)).length;
  return Math.round((collected / items.length) * 100);
};

const collectionFilters = computed(() => [
  {
    value: "all" as const,
    label: t("collection.filters.status_all"),
    icon: "lucide:list",
  },
  {
    value: "collected" as const,
    label: t("collection.filters.status_collected"),
    icon: "lucide:check-square",
  },
  {
    value: "uncollected" as const,
    label: t("collection.filters.status_uncollected"),
    icon: "lucide:square",
  },
]);
const selectedCollectionFilter = computed(() =>
  collectionFilters.value.find((filter) => filter.value === collectionFilter.value),
);
const getCategoryIcon = (icon?: string) => icon || "lucide:folder";

// 標記是否為「限定篩選」模式
const isLimitedMode = ref(false);

// 篩選特定類別 ID
const selectedCategoryId = ref<string | null>(null);

// Initialize from query params
onMounted(() => {
  // 處理 type 參數（取得方式）
  if (route.query.type) {
    selectedCategoryType.value = route.query.type as CollectionCategoryFilter;
  }

  // 處理 search 參數
  if (route.query.search) {
    searchQuery.value = route.query.search as string;
  }

  // 處理 status 參數（蒐集狀態）
  if (route.query.status) {
    const status = route.query.status as string;
    if (status === "collected" || status === "uncollected") {
      collectionFilter.value = status;
    }
  }

  // 處理 limited 參數（限定飾品模式）
  if (route.query.limited === "true") {
    isLimitedMode.value = true;
  }

  // 處理 category 參數（特定類別）
  if (route.query.category) {
    selectedCategoryId.value = route.query.category as string;
  }
  if (route.query.pikmin) {
    selectedPikminType.value = route.query.pikmin as PikminType;
  }

  // Scroll listener
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Warn user if they try to leave with unsaved changes
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  cancelCategoryBulkToggle();
  if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasPendingChanges.value) {
    e.preventDefault();
    // Modern browsers ignore custom messages, but returnValue is still needed
    e.returnValue = "";
  }
};

const handleScroll = () => {
  if (scrollFrame !== null) return;

  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null;
    showScrollTop.value = window.scrollY > 500;
  });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Scroll to special categories section
const scrollToSpecialCategories = () => {
  const specialSection = document.getElementById("special-categories-section");
  if (specialSection) {
    const offset = 100; // 預留 header 高度
    const elementPosition = specialSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

// Separate regular and special categories
const regularCategories = computed(() => {
  return getDecorDefinitions().filter((d) => d.category.type === "regular");
});

const specialCategories = computed(() => {
  return getDecorDefinitions().filter((d) => d.category.type !== "regular");
});

const regularCategoriesCount = computed(() => regularCategories.value.length);
const specialCategoriesCount = computed(() => specialCategories.value.length);

// CategoryJumpNav data
const jumpNavCategories = computed(() => {
  const allDefs = [...regularCategories.value, ...specialCategories.value];
  return allDefs.map((def) => {
    const items = getItemsByCategory(def.category.id);
    const collected = items.filter((item) => isCollected(item.id)).length;
    const total = items.length;
    return {
      id: def.category.id,
      name: locale.value === "en" ? def.category.nameEn : def.category.name,
      icon: getCategoryIcon(def.category.icon),
      progress: total > 0 ? Math.round((collected / total) * 100) : 0,
      progressText: `${collected}/${total}`,
      isSpecial: def.category.type !== "regular",
    };
  });
});

const {
  activeFilterCount,
  hasActiveFilters,
  filteredItems,
  collectedCount,
  clearAllFilters,
} = useCollectionFilters({
  searchQuery,
  selectedCategoryType,
  selectedPikminType,
  collectionFilter,
  isLimitedMode,
  selectedCategoryId,
  isCollected,
  getAllDecorItems,
  getItemsByCategoryType,
  searchItems,
});

const getItemsForCategory = (categoryId: string): DecorItem[] => {
  return getItemsByCategory(categoryId);
};

const getCategoryProgress = (categoryId: string): string => {
  const items = getItemsByCategory(categoryId);
  const collected = items.filter((item) => isCollected(item.id)).length;
  return `${collected}/${items.length}`;
};

const getCategoryTypeName = (typeId: string): string => {
  if (typeId === "uncollected-regular")
    return t("collection.types.uncollected_regular");
  if (typeId === "anniversary") return t("collection.types.anniversary");
  return t(`decor_types.${typeId}`);
};

const getCategoryName = (categoryId: string): string => {
  const definitions = getDecorDefinitions();
  const found = definitions.find((d) => d.category.id === categoryId);
  if (!found) return categoryId;
  return locale.value === "en" ? found.category.nameEn : found.category.name;
};

// Handle collect all button click with confirmation
const handleCollectAll = (categoryId: string, categoryName: string) => {
  const items = getItemsByCategory(categoryId);
  const uncollectedCount = items.filter((item) => !isCollected(item.id)).length;

  if (uncollectedCount === 0) {
    alert(t("collection.alerts.collected_all", { category: categoryName }));
    return;
  }

  const confirmed = confirm(
    t("collection.alerts.confirm_collect_all", {
      category: categoryName,
      count: items.length,
      uncollected: uncollectedCount,
    }),
  );

  if (confirmed) {
    collectAllInCategory(categoryId);
  }
};
</script>

<style scoped>
.collection-section-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 20%, rgba(0, 185, 47, 0.22), transparent 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.2)),
    rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow:
    0 18px 38px rgba(15, 23, 42, 0.14),
    0 1px 14px rgba(255, 255, 255, 0.88) inset,
    0 -16px 32px rgba(0, 133, 35, 0.06) inset;
  backdrop-filter: blur(2px) saturate(1.18);
  -webkit-backdrop-filter: blur(2px) saturate(1.18);
}

.collection-section-card::before {
  position: absolute;
  inset: 0;
  content: "";
  border-radius: inherit;
  pointer-events: none;
  padding: 1px;
  background:
    linear-gradient(
      120deg,
      rgba(16, 185, 129, 0.9),
      rgba(45, 212, 191, 0.62) 32%,
      rgba(255, 255, 255, 0.76) 64%,
      rgba(16, 185, 129, 0.38)
    );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.9;
}

.collection-section-card::after {
  position: absolute;
  inset: 0;
  content: "";
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(circle at 6% 50%, rgba(16, 185, 129, 0.22), transparent 28%),
    linear-gradient(
      90deg,
      rgba(16, 185, 129, 0.16),
      transparent 22%,
      transparent 78%,
      rgba(20, 184, 166, 0.14)
    );
  opacity: 0.8;
}

.collection-section-card > * {
  position: relative;
  z-index: 1;
}

.collection-section-card-purple {
  background:
    radial-gradient(circle at 12% 20%, rgba(168, 85, 247, 0.2), transparent 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.2)),
    rgba(255, 255, 255, 0.2);
}

.collection-section-card-purple::before {
  background:
    linear-gradient(
      120deg,
      rgba(168, 85, 247, 0.92),
      rgba(217, 70, 239, 0.62) 34%,
      rgba(255, 255, 255, 0.76) 64%,
      rgba(236, 72, 153, 0.34)
    );
}

.collection-section-card-purple::after {
  background:
    radial-gradient(circle at 6% 50%, rgba(168, 85, 247, 0.22), transparent 28%),
    linear-gradient(
      90deg,
      rgba(168, 85, 247, 0.16),
      transparent 22%,
      transparent 78%,
      rgba(236, 72, 153, 0.14)
    );
}

.collection-section-icon {
  box-shadow:
    0 12px 24px rgba(0, 133, 35, 0.22),
    0 1px 8px rgba(255, 255, 255, 0.5) inset;
}

.collection-section-title {
  -webkit-text-stroke: 0;
  paint-order: normal;
  text-shadow:
    0 0 1px rgba(255, 255, 255, 0.92),
    0 0 5px rgba(255, 255, 255, 0.58),
    0 1px 0 rgba(255, 255, 255, 0.72),
    0 2px 7px rgba(15, 23, 42, 0.16);
}

.collection-section-desc,
.collection-section-count,
.collection-info-desc {
  -webkit-text-stroke: 0;
  paint-order: normal;
  text-shadow:
    0 0 1px rgba(255, 255, 255, 0.88),
    0 0 4px rgba(255, 255, 255, 0.46),
    0 1px 0 rgba(255, 255, 255, 0.62);
}

.collection-section-actions {
  padding: 4px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 1px 10px rgba(255, 255, 255, 0.78) inset;
}

.collection-section-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: rgb(6 95 70 / 0.82);
  border-radius: 12px;
  transition: all 180ms ease;
}

.collection-section-action:hover {
  color: rgb(4 120 87);
  background: rgba(255, 255, 255, 0.58);
  transform: translateY(-1px);
}

.collection-count-pill {
  min-width: max-content;
  padding: 7px 10px;
  color: rgb(6 95 70);
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1;
  border-radius: 999px;
  background: rgba(214, 255, 224, 0.68);
  border: 1px solid rgba(115, 255, 150, 0.82);
  box-shadow:
    0 6px 14px rgba(0, 133, 35, 0.08),
    0 1px 8px rgba(255, 255, 255, 0.78) inset;
}

.collection-count-pill-purple {
  color: rgb(107 33 168);
  background: rgba(250, 245, 255, 0.7);
  border-color: rgba(216, 180, 254, 0.78);
}

.collection-category-header {
  width: 100%;
}

.collection-info-card {
  background:
    linear-gradient(135deg, rgba(236, 253, 245, 0.5), rgba(255, 255, 255, 0.18)),
    rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.76);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.1),
    0 1px 12px rgba(255, 255, 255, 0.78) inset;
  backdrop-filter: blur(2px) saturate(1.16);
  -webkit-backdrop-filter: blur(2px) saturate(1.16);
}

.collection-info-card-purple {
  background:
    linear-gradient(135deg, rgba(250, 245, 255, 0.52), rgba(255, 255, 255, 0.18)),
    rgba(255, 255, 255, 0.2);
}

.collection-info-icon {
  background: rgba(255, 255, 255, 0.54);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow: 0 1px 10px rgba(255, 255, 255, 0.78) inset;
}

.collection-info-title {
  letter-spacing: 0.01em;
  -webkit-text-stroke: 0;
  paint-order: normal;
  text-shadow:
    0 0 1px rgba(255, 255, 255, 0.88),
    0 0 4px rgba(255, 255, 255, 0.46),
    0 1px 0 rgba(255, 255, 255, 0.62);
}

@media (max-width: 640px) {
  .collection-category-header {
    width: calc(100% - 16px);
    margin-inline: auto;
    gap: 0.65rem;
    padding: 0.8rem 0.85rem;
  }

  .collection-category-header :deep(.liquid-glass-button),
  .collection-category-header .liquid-glass-button {
    width: 2.1rem;
    height: 2.1rem;
    flex: 0 0 auto;
    justify-content: center;
    padding: 0;
  }

  .collection-category-header .text-right {
    width: 3.55rem;
  }

  .collection-section-card {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    align-items: center;
    column-gap: 12px;
    row-gap: 10px;
    padding: 16px 14px;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .liquid-glass-2026 {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .collection-section-icon {
    width: 48px;
    height: 48px;
  }

  .collection-section-title {
    font-size: 1.45rem;
    line-height: 1.1;
  }

  .collection-section-actions {
    position: static;
    grid-column: 2;
    justify-self: start;
    max-width: 100%;
  }

  .collection-section-desc {
    max-width: none;
  }
}

/* Floating decorative elements */
.deco-leaf {
  position: absolute;
  animation: deco-float 8s ease-in-out infinite;
}

.deco-leaf-1 {
  top: 20px;
  left: 8%;
  animation-delay: 0s;
  animation-duration: 7s;
}

.deco-leaf-2 {
  top: 60px;
  right: 15%;
  animation-delay: 1.5s;
  animation-duration: 9s;
}

.deco-leaf-3 {
  top: 100px;
  left: 25%;
  animation-delay: 3s;
  animation-duration: 6s;
}

.deco-leaf-4 {
  top: 40px;
  right: 30%;
  animation-delay: 2s;
  animation-duration: 10s;
}

.deco-leaf-5 {
  top: 120px;
  left: 60%;
  animation-delay: 4s;
  animation-duration: 8s;
}

@keyframes deco-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-12px) rotate(8deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-6px) rotate(-5deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-15px) rotate(3deg);
    opacity: 1;
  }
}

/* Accordion CSS Grid height animation */
.collection-category-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  will-change: grid-template-rows;
  transition: grid-template-rows 320ms cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
}

.collection-category-content-wrapper.is-open {
  grid-template-rows: 1fr;
}

.collection-category-content-inner {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-8px);
  will-change: transform, opacity;
  transition: opacity 240ms ease, transform 320ms cubic-bezier(0.25, 1, 0.5, 1);
}

.collection-category-content-wrapper.is-open .collection-category-content-inner {
  opacity: 1;
  transform: translateY(0);
}
</style>

