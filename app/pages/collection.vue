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
        <p class="text-slate-700 font-semibold mt-1">{{ $t("collection.subtitle") }}</p>
      </div>

      <!-- Quick stats -->
      <div class="bg-white/70 backdrop-blur-md border border-white/70 shadow-md flex items-center gap-4 rounded-2xl px-4 py-2">
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
      class="card relative rounded-3xl p-5 md:p-6 mb-6 z-10 transition-all duration-300"
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
          class="collection-filter-chip px-3 py-1.5 text-emerald-800 text-sm"
        >
          <Icon name="lucide:filter" class="w-3.5 h-3.5" />
          <span>{{ activeFilterCount }}</span>
        </div>
        <button
          @click="isFilterExpanded = true"
          class="collection-soft-button relative flex items-center gap-2 px-4 py-2.5 text-emerald-800 rounded-xl text-sm font-bold transition-all"
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
            class="collection-soft-button flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-800 rounded-lg text-xs font-bold transition-all"
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
            class="bg-emerald-50/70 border border-emerald-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl p-4 gap-4"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-emerald-800 font-bold mr-2">{{
                $t("collection.filters.active_label")
              }}</span>

              <span
                v-if="searchQuery"
                class="collection-filter-chip group px-3 py-1.5 text-emerald-800 text-sm"
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
                class="collection-filter-chip group px-3 py-1.5 text-emerald-800 text-sm"
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
                class="collection-filter-chip group px-3 py-1.5 text-emerald-800 text-sm"
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
                class="collection-filter-chip group px-3 py-1.5 text-emerald-800 text-sm"
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
                class="collection-filter-chip group px-3 py-1.5 text-amber-800 text-sm"
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
                class="collection-filter-chip group px-3 py-1.5 text-purple-800 text-sm"
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
              class="collection-soft-button shrink-0 flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-700 rounded-xl text-sm font-bold transition-all focus:ring-2 focus:ring-red-200 outline-none"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
              {{ $t("collection.filters.clear") }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <section
      v-if="!hasActiveFilters && rareDashboardHasContent"
      class="capture-dashboard"
      aria-labelledby="capture-dashboard-title"
    >
      <div class="capture-dashboard-header">
        <div class="capture-dashboard-heading">
          <span class="capture-dashboard-icon">
            <Icon name="lucide:sparkles" class="w-4 h-4" />
          </span>
          <div>
            <h2 id="capture-dashboard-title">{{ captureDashboardLabels.title }}</h2>
            <p>{{ captureDashboardLabels.subtitle }}</p>
          </div>
        </div>
        <span class="capture-dashboard-badge">
          {{ captureDashboardLabels.badge }}
        </span>
      </div>

      <div class="capture-dashboard-grid rare-dashboard-grid">
        <article class="rare-recommendation-panel">
          <div class="rare-recommendation-panel-head">
            <span>{{ captureDashboardLabels.realCloseTitle }}</span>
            <small>{{ captureDashboardLabels.realCloseDesc }}</small>
          </div>
          <div class="capture-recommendation-list">
            <button
              v-for="recommendation in rareLevelUpRecommendations"
              :key="recommendation.id"
              type="button"
              class="capture-recommendation rare-recommendation-card"
              @click="focusRecommendedCategory(recommendation.categoryId)"
            >
              <span class="capture-recommendation-icon">
                <Icon :name="recommendation.icon" class="w-5 h-5" />
              </span>
              <span class="capture-recommendation-copy">
                <strong>{{ recommendation.name }}</strong>
                <span>Lv. {{ recommendation.level }} · {{ recommendation.points }} pt</span>
              </span>
              <span class="capture-recommendation-metric">
                <strong>{{ recommendation.pointsToNext }}</strong>
                <span>{{ captureDashboardLabels.toNextUnit }}</span>
              </span>
              <span class="capture-recommendation-hint">{{ recommendation.realActionHint }}</span>
              <span class="capture-recommendation-progress" :aria-label="recommendation.progressText">
                <span :style="{ width: recommendation.levelProgressPercent + '%' }" />
              </span>
            </button>
            <p v-if="rareLevelUpRecommendations.length === 0" class="rare-recommendation-empty">
              {{ captureDashboardLabels.noRealClose }}
            </p>
          </div>
        </article>

        <article class="rare-recommendation-panel">
          <div class="rare-recommendation-panel-head">
            <span>{{ captureDashboardLabels.virtualCloseTitle }}</span>
            <small>{{ captureDashboardLabels.virtualCloseDesc }}</small>
          </div>
          <div class="capture-recommendation-list">
            <button
              v-for="recommendation in rareVirtualRecommendations"
              :key="recommendation.id"
              type="button"
              class="capture-recommendation rare-recommendation-card"
              @click="focusRecommendedCategory(recommendation.categoryId)"
            >
              <span class="capture-recommendation-icon capture-recommendation-icon-amber">
                <Icon name="lucide:calculator" class="w-5 h-5" />
              </span>
              <span class="capture-recommendation-copy">
                <strong>{{ recommendation.name }}</strong>
                <span>{{ recommendation.points }} + {{ recommendation.virtualApplied }} pt</span>
              </span>
              <span class="capture-recommendation-metric">
                <strong>{{ recommendation.virtualRemaining }}</strong>
                <span>{{ captureDashboardLabels.afterVirtualUnit }}</span>
              </span>
              <span class="capture-recommendation-hint">{{ recommendation.virtualActionHint }}</span>
              <span class="capture-recommendation-progress" :aria-label="recommendation.virtualProgressText">
                <span :style="{ width: recommendation.virtualProgressPercent + '%' }" />
              </span>
            </button>
            <p v-if="rareVirtualRecommendations.length === 0" class="rare-recommendation-empty">
              {{ captureDashboardLabels.noVirtualClose }}
            </p>
          </div>
        </article>

        <article class="rare-recommendation-panel">
          <div class="rare-recommendation-panel-head">
            <span>{{ captureDashboardLabels.unlockCloseTitle }}</span>
            <small>{{ captureDashboardLabels.unlockCloseDesc }}</small>
          </div>
          <div class="capture-recommendation-list">
            <button
              v-for="recommendation in rareUnlockRecommendations"
              :key="recommendation.id"
              type="button"
              class="capture-recommendation rare-recommendation-card"
              @click="focusRecommendedCategory(recommendation.categoryId)"
            >
              <span class="capture-recommendation-icon">
                <Icon :name="recommendation.icon" class="w-5 h-5" />
              </span>
              <span class="capture-recommendation-copy">
                <strong>{{ recommendation.name }}</strong>
                <span>{{ recommendation.regularCollected }}/{{ recommendation.regularTotal }} {{ captureDashboardLabels.regularUnit }}</span>
              </span>
              <span class="capture-recommendation-metric">
                <strong>{{ recommendation.missingRegular }}</strong>
                <span>{{ captureDashboardLabels.colorGapUnit }}</span>
              </span>
              <span class="rare-missing-colors">
                <span
                  v-for="color in recommendation.missingColors.slice(0, 5)"
                  :key="color"
                  class="rare-color-dot"
                  :class="pikminColorClass(color)"
                >
                  <span class="sr-only">{{ t('pikmin_types.' + color) }}</span>
                </span>
              </span>
              <span class="capture-recommendation-progress" :aria-label="recommendation.regularProgressText">
                <span :style="{ width: recommendation.regularPercent + '%' }" />
              </span>
            </button>
            <p v-if="rareUnlockRecommendations.length === 0" class="rare-recommendation-empty">
              {{ captureDashboardLabels.noUnlockClose }}
            </p>
          </div>
        </article>
      </div>

      <div v-if="selectedRareAnalysis" class="rare-analysis-panel">
        <div class="rare-analysis-toolbar">
          <div>
            <h3>{{ captureDashboardLabels.analysisTitle }}</h3>
            <p>{{ captureDashboardLabels.analysisDesc }}</p>
          </div>
          <select v-model="selectedRareAnalysisCategoryId" class="rare-analysis-select">
            <option
              v-for="option in rareAnalysisOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </select>
        </div>

        <div class="rare-analysis-summary">
          <div class="rare-analysis-stat">
            <span>{{ captureDashboardLabels.statusLabel }}</span>
            <strong>{{ selectedRareAnalysis.statusText }}</strong>
          </div>
          <div class="rare-analysis-stat">
            <span>{{ captureDashboardLabels.scoreLabel }}</span>
            <strong>{{ selectedRareAnalysis.points }} pt</strong>
          </div>
          <div class="rare-analysis-stat">
            <span>{{ captureDashboardLabels.nextLabel }}</span>
            <strong>{{ selectedRareAnalysis.nextText }}</strong>
          </div>
          <div class="rare-analysis-stat">
            <span>{{ captureDashboardLabels.virtualLabel }}</span>
            <strong>{{ selectedRareAnalysis.virtualPoints }} pt</strong>
          </div>
        </div>

        <p class="rare-analysis-action">{{ selectedRareAnalysis.detailAction }}</p>

        <div v-if="selectedRareAnalysis.missingColors.length > 0" class="rare-analysis-missing">
          <span>{{ captureDashboardLabels.missingColorsLabel }}</span>
          <span class="rare-missing-colors">
            <span
              v-for="color in selectedRareAnalysis.missingColors"
              :key="color"
              class="rare-color-dot rare-color-dot-large"
              :class="pikminColorClass(color)"
              :title="t('pikmin_types.' + color)"
            >
              <span class="sr-only">{{ t('pikmin_types.' + color) }}</span>
            </span>
          </span>
        </div>
      </div>
    </section>

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
              class="bg-white/95 border border-white/70 shadow-2xl relative w-full max-h-[85vh] rounded-t-[2.5rem] pointer-events-auto flex flex-col overflow-hidden"
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
                  class="collection-soft-button p-2 text-gray-500 hover:text-gray-700 rounded-full active:scale-90 transition-transform"
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
                  class="collection-soft-button flex-1 py-3.5 text-gray-700 hover:text-red-700 rounded-xl text-sm font-bold transition-all active:scale-95"
                >
                  {{ $t("collection.filters.clear") }}
                </button>
                <button
                  @click="isFilterExpanded = false"
                  class="btn-primary flex-[2] py-3.5 rounded-xl text-sm active:scale-95 flex items-center justify-center gap-2"
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
              class="collection-category-header flex items-center gap-3 sticky top-[120px] z-10 px-4 py-3 rounded-xl cursor-pointer group"
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
                class="collection-collect-button px-3 py-1.5 text-xs rounded-lg flex items-center gap-1"
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
                <CollectionInventoryPanel :category-id="def.category.id" />
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
              class="collection-category-header flex items-center gap-3 sticky top-[120px] z-10 px-4 py-3 rounded-xl cursor-pointer group collection-category-header-special"
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
                class="collection-collect-button px-3 py-1.5 text-xs rounded-lg flex items-center gap-1"
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
  PIKMIN_TYPE_COLORS,
  PIKMIN_TYPE_NAMES,
  type PikminType,
  type DecorItem,
} from "~/types/decor";
import type { CollectionCategoryFilter } from "~/composables/useCollectionFilters";
import { gsap } from "gsap";
import { useParallax } from "~/composables/useParallax";

const route = useRoute();
const { t, locale } = useI18n();
const {
  collectionState,
  isCollected,
  collectAllInCategory,
  hasPendingChanges,
  getInventoryItem,
  rarePointValues,
} = useCollection();
const {
  getAllDecorItems,
  getDecorDefinitions,
  getItemsByCategoryType,
  searchItems,
  getItemsByCategory,
  getVariant,
} = useDecorData();

// Filter state
const searchQuery = ref("");
const selectedCategoryType = ref<CollectionCategoryFilter | null>(null);
const selectedPikminType = ref<PikminType | null>(null);
const collectionFilter = ref<"all" | "collected" | "uncollected">("all");
const showScrollTop = ref(false);
const selectedRareAnalysisCategoryId = ref<string | null>(null);

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

const decorDefinitions = computed(() => getDecorDefinitions());
const categoryIds = computed(() => decorDefinitions.value.map((d) => d.category.id));

const captureDashboardLabels = computed(() => {
  if (locale.value === "en") {
    return {
      title: "Rare score radar",
      subtitle: "Prioritize each decor subtype closest to a guaranteed rare decor Pikmin.",
      badge: "Rare scoring",
      realCloseTitle: "Closest by score",
      realCloseDesc: "Real points only",
      virtualCloseTitle: "Close with reserves",
      virtualCloseDesc: "Small seedlings + <4-heart Pikmin",
      unlockCloseTitle: "Closest to unlock",
      unlockCloseDesc: "Regular decor gaps",
      analysisTitle: "Subtype analysis",
      analysisDesc: "Pick one subtype and see the next best action.",
      noRealClose: "No unlocked rare-score subtype yet.",
      noVirtualClose: "No reserves can move a subtype closer yet.",
      noUnlockClose: "No rare subtype is close to unlocking.",
      toNextUnit: "to next",
      afterVirtualUnit: "left",
      regularUnit: "regular",
      colorGapUnit: "colors",
      statusLabel: "Status",
      scoreLabel: "Score",
      nextLabel: "Next",
      virtualLabel: "Reserve",
      missingColorsLabel: "Missing colors",
      unlockedStatus: (level: number) => `Lv. ${level}`,
      lockedStatus: (missing: number) => `${missing} colors short`,
      nextText: (points: number) => `${points} pt`,
      noNextText: "Not unlocked",
      realAction: (actions: number) => `Get decor, including huge seedlings, ${actions} more time${actions > 1 ? "s" : ""}`,
      virtualReady: "Using reserves can reach the next level",
      virtualAction: (remaining: number) => `After reserves, still ${remaining} pt short`,
      unlockAction: (colors: string) => `Complete ${colors} first to unlock rare scoring.`,
      analysisUnlockedAction: (actions: number) => `Best move: get decor, including huge seedlings, ${actions} more time${actions > 1 ? "s" : ""}.`,
      analysisVirtualReady: "Best move: convert the tracked reserves; they can reach the next level.",
      analysisVirtualShort: (remaining: number) => `Convert reserves first, then earn ${remaining} more pt.`,
      analysisLockedAction: (colors: string) => `First unlock rare scoring by collecting ${colors}.`,
    };
  }

  return {
    title: "稀有積分雷達",
    subtitle: "依裝飾子種類分開看，優先衝最接近保底稀有的目標。",
    badge: "稀有積分",
    realCloseTitle: "實分快升等",
    realCloseDesc: "只看目前分數",
    virtualCloseTitle: "虛分後接近",
    virtualCloseDesc: "小盆 + 未滿4心",
    unlockCloseTitle: "快解鎖稀有",
    unlockCloseDesc: "普通裝飾缺口",
    analysisTitle: "單一子種類分析",
    analysisDesc: "選一個子種類，看下一步怎麼做。",
    noRealClose: "目前沒有已解鎖稀有積分的子種類。",
    noVirtualClose: "目前沒有可推近升等的子種類庫存。",
    noUnlockClose: "目前沒有接近解鎖的稀有子種類。",
    toNextUnit: "距下級",
    afterVirtualUnit: "虛差",
    regularUnit: "普通",
    colorGapUnit: "缺色",
    statusLabel: "狀態",
    scoreLabel: "實分",
    nextLabel: "下級",
    virtualLabel: "虛分",
    missingColorsLabel: "缺少顏色",
    unlockedStatus: (level: number) => `Lv. ${level}`,
    lockedStatus: (missing: number) => `差 ${missing} 色`,
    nextText: (points: number) => `${points} pt`,
    noNextText: "尚未解鎖",
    realAction: (actions: number) => `拿裝飾(含大盆) ${actions} 次可升級`,
    virtualReady: "轉完虛分可到下一級",
    virtualAction: (remaining: number) => `轉完後還差 ${remaining} pt`,
    unlockAction: (colors: string) => `先補 ${colors}，解鎖後才開始算稀有積分。`,
    analysisUnlockedAction: (actions: number) => `建議：拿裝飾(含大盆) ${actions} 次可升級。`,
    analysisVirtualReady: "建議：先把目前庫存轉成分數，可直接到下一級。",
    analysisVirtualShort: (remaining: number) => `建議：先轉目前庫存，再補 ${remaining} pt。`,
    analysisLockedAction: (colors: string) => `建議：先補齊 ${colors}，才能開始衝稀有積分。`,
  };
});

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
      if (!id) continue;
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
  updateCategoriesInBatches(categoryIds.value, true);
};

const collapseAllCategories = () => {
  const allIds = categoryIds.value;
  updateCategoriesInBatches(allIds, false);
};

interface CategoryProgress {
  collected: number;
  total: number;
  percent: number;
  text: string;
}

const emptyCategoryProgress: CategoryProgress = {
  collected: 0,
  total: 0,
  percent: 0,
  text: "0/0",
};

// UX: Category progress, cached per render instead of recalculated per binding.
const categoryProgressById = computed(() => {
  const progressById = new Map<string, CategoryProgress>();

  decorDefinitions.value.forEach((def) => {
    const items = getItemsByCategory(def.category.id);
    let collected = 0;

    items.forEach((item) => {
      if (isCollected(item.id)) collected += 1;
    });

    const total = items.length;
    progressById.set(def.category.id, {
      collected,
      total,
      percent: total > 0 ? Math.round((collected / total) * 100) : 0,
      text: `${collected}/${total}`,
    });
  });

  return progressById;
});

const getCategoryProgressData = (categoryId: string): CategoryProgress =>
  categoryProgressById.value.get(categoryId) ?? emptyCategoryProgress;

const getCategoryProgressPercent = (categoryId: string): number => {
  return getCategoryProgressData(categoryId).percent;
};

const isRareDecorItem = (item: DecorItem): boolean => {
  const variant = getVariant(item.categoryId, item.variantId);
  return Boolean(variant?.isRare || item.variantId.toLowerCase().includes("rare"));
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
  return decorDefinitions.value.filter((d) => d.category.type === "regular");
});

const specialCategories = computed(() => {
  return decorDefinitions.value.filter((d) => d.category.type !== "regular");
});

const regularCategoriesCount = computed(() => regularCategories.value.length);
const specialCategoriesCount = computed(() => specialCategories.value.length);

// CategoryJumpNav data
const jumpNavCategories = computed(() => {
  const allDefs = [...regularCategories.value, ...specialCategories.value];
  return allDefs.map((def) => {
    const progress = getCategoryProgressData(def.category.id);
    return {
      id: def.category.id,
      name: locale.value === "en" ? def.category.nameEn : def.category.name,
      icon: getCategoryIcon(def.category.icon),
      progress: progress.percent,
      progressText: progress.text,
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
  return getCategoryProgressData(categoryId).text;
};

const getCategoryTypeName = (typeId: string): string => {
  if (typeId === "uncollected-regular")
    return t("collection.types.uncollected_regular");
  if (typeId === "anniversary") return t("collection.types.anniversary");
  return t(`decor_types.${typeId}`);
};

const getCategoryName = (categoryId: string): string => {
  const found = decorDefinitions.value.find((d) => d.category.id === categoryId);
  if (!found) return categoryId;
  return locale.value === "en" ? found.category.nameEn : found.category.name;
};

interface RareCategoryInsight {
  id: string;
  categoryId: string;
  baseVariantId: string;
  name: string;
  icon: string;
  regularCollected: number;
  regularTotal: number;
  missingRegular: number;
  missingColors: PikminType[];
  regularPercent: number;
  regularProgressText: string;
  isUnlocked: boolean;
  points: number;
  level: number;
  nextLevelPoints: number | null;
  pointsToNext: number | null;
  levelProgressPercent: number;
  progressText: string;
  virtualPoints: number;
  virtualApplied: number;
  virtualRemaining: number;
  virtualProgressPercent: number;
  virtualProgressText: string;
  realActionHint: string;
  virtualActionHint: string;
  statusText: string;
  nextText: string;
  detailAction: string;
}

type DecorDefinition = ReturnType<typeof getDecorDefinitions>[number];
type DecorVariantDefinition = DecorDefinition["variants"][number];

interface RareVariantGroup {
  id: string;
  categoryId: string;
  baseVariantId: string;
  name: string;
  icon: string;
  regularItems: DecorItem[];
}

const rareLevelStartPoints = (points: number): number => {
  if (points < 800) return 0;
  if (points < 1200) return 800;
  if (points < 3000) return 1200;
  return 3000 + Math.floor((points - 3000) / 5000) * 5000;
};

const rareLevelFromPoints = (points: number, isUnlocked: boolean): number => {
  if (!isUnlocked) return 0;
  if (points < 800) return 1;
  if (points < 1200) return 2;
  if (points < 3000) return 3;
  return 4 + Math.floor((points - 3000) / 5000);
};

const nextRareLevelPoints = (points: number, isUnlocked: boolean): number | null => {
  if (!isUnlocked) return null;
  if (points < 800) return 800;
  if (points < 1200) return 1200;
  if (points < 3000) return 3000;
  return 3000 + (Math.floor((points - 3000) / 5000) + 1) * 5000;
};

const buildRareLevelPercent = (points: number, nextPoints: number | null): number => {
  if (nextPoints === null) return 0;
  const startPoints = rareLevelStartPoints(points);
  const range = nextPoints - startPoints;
  if (range <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(((points - startPoints) / range) * 100)));
};

const isRareVariantDefinition = (variant: DecorVariantDefinition): boolean =>
  Boolean(variant.isRare || variant.id.toLowerCase().includes("rare"));

const getBaseVariantIdForRareScore = (def: DecorDefinition, variantId: string): string => {
  const variant = def.variants.find((candidate) => candidate.id === variantId);
  if (!variant) return variantId;
  if (variant.baseVariantId && def.variants.some((candidate) => candidate.id === variant.baseVariantId)) {
    return variant.baseVariantId;
  }
  if (!isRareVariantDefinition(variant)) return variant.id;

  const rareSuffix = "_rare";
  if (variant.id.toLowerCase().endsWith(rareSuffix)) {
    const baseVariantId = variant.id.slice(0, -rareSuffix.length);
    const baseVariant = def.variants.find((candidate) => candidate.id === baseVariantId);
    if (baseVariant && !isRareVariantDefinition(baseVariant)) {
      return baseVariant.id;
    }
  }

  return variant.id;
};

const rareScoreGroupKey = (categoryId: string, baseVariantId: string): string =>
  `${categoryId}::${baseVariantId}`;

const variantDisplayName = (def: DecorDefinition, variant: DecorVariantDefinition): string => {
  const categoryName = locale.value === "en" ? def.category.nameEn : def.category.name;
  const variantName = locale.value === "en" ? variant.nameEn : variant.name;
  return `${categoryName} · ${variantName}`;
};

const rareVariantGroups = computed<RareVariantGroup[]>(() =>
  decorDefinitions.value.flatMap((def) => {
    if (def.category.type !== "regular") return [];

    const rareBaseVariantIds = new Set(
      def.variants
        .filter(isRareVariantDefinition)
        .map((variant) => getBaseVariantIdForRareScore(def, variant.id)),
    );
    if (rareBaseVariantIds.size === 0) return [];

    const categoryItems = getItemsByCategory(def.category.id);

    return def.variants
      .filter((variant) => !isRareVariantDefinition(variant) && rareBaseVariantIds.has(variant.id))
      .map((variant) => ({
        id: rareScoreGroupKey(def.category.id, variant.id),
        categoryId: def.category.id,
        baseVariantId: variant.id,
        name: variantDisplayName(def, variant),
        icon: getCategoryIcon(def.category.icon),
        regularItems: categoryItems.filter((item) => item.variantId === variant.id),
      }))
      .filter((group) => group.regularItems.length > 0);
  }),
);

const rareGroupCountByCategoryId = computed(() => {
  const counts = new Map<string, number>();
  rareVariantGroups.value.forEach((group) => {
    counts.set(group.categoryId, (counts.get(group.categoryId) ?? 0) + 1);
  });
  return counts;
});

const decorDefinitionByCategoryId = computed(() => {
  const definitions = new Map<string, DecorDefinition>();
  decorDefinitions.value.forEach((def) => {
    definitions.set(def.category.id, def);
  });
  return definitions;
});

const decorItemById = computed(() => {
  const items = new Map<string, DecorItem>();
  getAllDecorItems().forEach((item) => {
    items.set(item.id, item);
  });
  return items;
});

const rarePointsByGroup = computed(() => {
  const pointsByGroup = new Map<string, number>();

  (collectionState.value.details?.events ?? []).forEach((event) => {
    if (
      event.type !== "rare_points_adjustment" ||
      !event.itemId ||
      typeof event.pointsDelta !== "number"
    ) {
      return;
    }

    const item = decorItemById.value.get(event.itemId);
    if (!item) return;

    const def = decorDefinitionByCategoryId.value.get(item.categoryId);
    if (!def || def.category.type !== "regular") return;

    const baseVariantId = getBaseVariantIdForRareScore(def, item.variantId);
    const groupKey = rareScoreGroupKey(item.categoryId, baseVariantId);
    const nextPoints = Math.max(0, (pointsByGroup.get(groupKey) ?? 0) + event.pointsDelta);
    pointsByGroup.set(groupKey, nextPoints);
  });

  return pointsByGroup;
});

const getRarePointsForGroup = (group: RareVariantGroup): number => {
  const groupedPoints = rarePointsByGroup.value.get(group.id);
  if (typeof groupedPoints === "number") return groupedPoints;

  const groupProgress = collectionState.value.details?.rareProgress[group.id];
  if (typeof groupProgress?.points === "number") return Math.max(0, groupProgress.points);

  const categoryHasSingleRareGroup = (rareGroupCountByCategoryId.value.get(group.categoryId) ?? 0) === 1;
  if (!categoryHasSingleRareGroup) return 0;

  const legacyProgress = collectionState.value.details?.rareProgress[group.categoryId];
  return typeof legacyProgress?.points === "number" ? Math.max(0, legacyProgress.points) : 0;
};

const formatMissingColorNames = (colors: PikminType[]): string => {
  const names = colors.slice(0, 3).map((color) => t("pikmin_types." + color));
  if (colors.length > 3) {
    names.push(locale.value === "en" ? `+${colors.length - 3}` : `等 ${colors.length} 色`);
  }
  return names.join(locale.value === "en" ? ", " : "、");
};

const rareCategoryInsights = computed<RareCategoryInsight[]>(() => {
  const labels = captureDashboardLabels.value;

  return rareVariantGroups.value
    .map((group) => {
      const regularItems = group.regularItems;
      const missingItems = regularItems.filter((item) => !isCollected(item.id));
      const regularTotal = regularItems.length;
      const regularCollected = regularTotal - missingItems.length;
      const missingRegular = missingItems.length;
      const missingColors = missingItems.map((item) => item.pikminType);
      const regularPercent = regularTotal > 0 ? Math.round((regularCollected / regularTotal) * 100) : 0;
      const isUnlocked = regularTotal > 0 && missingRegular === 0;
      const points = getRarePointsForGroup(group);
      const level = rareLevelFromPoints(points, isUnlocked);
      const nextLevel = nextRareLevelPoints(points, isUnlocked);
      const pointsToNext = nextLevel === null ? null : Math.max(0, nextLevel - points);
      const levelProgressPercent = buildRareLevelPercent(points, nextLevel);

      let virtualPoints = 0;
      regularItems.forEach((item) => {
        const inventory = getInventoryItem(item.id);
        virtualPoints += inventory.seedlingCount * rarePointValues.pluck_seedling;
        virtualPoints += inventory.preDecorCount * rarePointValues.gift_expedition;
      });

      const virtualApplied = pointsToNext === null ? 0 : Math.min(virtualPoints, pointsToNext);
      const virtualRemaining = pointsToNext === null ? 0 : Math.max(0, pointsToNext - virtualApplied);
      const virtualTargetRange = nextLevel === null ? 0 : nextLevel - rareLevelStartPoints(points);
      const virtualProgressPercent = nextLevel === null || virtualTargetRange <= 0
        ? 0
        : Math.min(100, Math.max(0, Math.round(((points - rareLevelStartPoints(points) + virtualApplied) / virtualTargetRange) * 100)));
      const decorActionsToNext = pointsToNext === null
        ? 0
        : Math.max(1, Math.ceil(pointsToNext / rarePointValues.gift_expedition));
      const missingColorNames = formatMissingColorNames(missingColors);

      return {
        id: group.id,
        categoryId: group.categoryId,
        baseVariantId: group.baseVariantId,
        name: group.name,
        icon: group.icon,
        regularCollected,
        regularTotal,
        missingRegular,
        missingColors,
        regularPercent,
        regularProgressText: `${regularCollected}/${regularTotal}`,
        isUnlocked,
        points,
        level,
        nextLevelPoints: nextLevel,
        pointsToNext,
        levelProgressPercent,
        progressText: nextLevel === null ? labels.noNextText : `${points}/${nextLevel}`,
        virtualPoints,
        virtualApplied,
        virtualRemaining,
        virtualProgressPercent,
        virtualProgressText: nextLevel === null ? labels.noNextText : `${points + virtualApplied}/${nextLevel}`,
        realActionHint: labels.realAction(decorActionsToNext),
        virtualActionHint: virtualRemaining === 0 ? labels.virtualReady : labels.virtualAction(virtualRemaining),
        statusText: isUnlocked ? labels.unlockedStatus(level) : labels.lockedStatus(missingRegular),
        nextText: pointsToNext === null ? labels.noNextText : labels.nextText(pointsToNext),
        detailAction: isUnlocked
          ? virtualApplied > 0
            ? virtualRemaining === 0
              ? labels.analysisVirtualReady
              : labels.analysisVirtualShort(virtualRemaining)
            : labels.analysisUnlockedAction(decorActionsToNext)
          : labels.analysisLockedAction(missingColorNames),
      };
    });
});

const rareLevelUpRecommendations = computed(() =>
  rareCategoryInsights.value
    .filter((item) => item.isUnlocked && item.pointsToNext !== null)
    .sort((a, b) => (a.pointsToNext ?? Infinity) - (b.pointsToNext ?? Infinity) || b.points - a.points)
    .slice(0, 3),
);

const rareVirtualRecommendations = computed(() =>
  rareCategoryInsights.value
    .filter((item) => item.isUnlocked && item.pointsToNext !== null && item.virtualPoints > 0)
    .sort((a, b) =>
      a.virtualRemaining - b.virtualRemaining ||
      b.virtualApplied - a.virtualApplied ||
      (a.pointsToNext ?? Infinity) - (b.pointsToNext ?? Infinity),
    )
    .slice(0, 3),
);

const rareUnlockRecommendations = computed(() =>
  rareCategoryInsights.value
    .filter((item) => !item.isUnlocked && item.missingRegular > 0)
    .sort((a, b) => a.missingRegular - b.missingRegular || b.regularPercent - a.regularPercent)
    .slice(0, 3),
);

const rareAnalysisOptions = computed(() =>
  rareCategoryInsights.value
    .slice()
    .sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
      return (a.pointsToNext ?? Infinity) - (b.pointsToNext ?? Infinity) || a.missingRegular - b.missingRegular;
    })
    .map((item) => ({ id: item.id, name: item.name })),
);

watch(rareAnalysisOptions, (options) => {
  if (options.length === 0) {
    selectedRareAnalysisCategoryId.value = null;
    return;
  }

  if (!selectedRareAnalysisCategoryId.value || !options.some((option) => option.id === selectedRareAnalysisCategoryId.value)) {
    selectedRareAnalysisCategoryId.value = options[0]?.id ?? null;
  }
}, { immediate: true });

const selectedRareAnalysis = computed(() =>
  rareCategoryInsights.value.find((item) => item.id === selectedRareAnalysisCategoryId.value) ?? null,
);

const rareDashboardHasContent = computed(() => rareCategoryInsights.value.length > 0);

const pikminColorClass = (pikminType: PikminType): string => PIKMIN_TYPE_COLORS[pikminType];

const focusRecommendedCategory = async (categoryId: string) => {
  clearAllFilters();
  isFilterExpanded.value = false;

  const nextCollapsed = new Set(collapsedCategories.value);
  nextCollapsed.delete(categoryId);
  collapsedCategories.value = nextCollapsed;

  await nextTick();

  const target = document.getElementById(`cat-${categoryId}`);
  if (!target) return;

  const offset = window.innerWidth < 768 ? 92 : 128;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};

// Handle collect all button click with confirmation
const handleCollectAll = (categoryId: string, categoryName: string) => {
  const items = getItemsByCategory(categoryId);
  let uncollectedCount = 0;
  items.forEach((item) => {
    if (!isCollected(item.id)) uncollectedCount += 1;
  });

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
.capture-dashboard {
  position: relative;
  overflow: hidden;
  padding: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.capture-dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.72rem;
}

.capture-dashboard-heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.capture-dashboard-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  flex: 0 0 auto;
  border: 1px solid rgba(20, 184, 166, 0.18);
  border-radius: 0.85rem;
  background: rgba(204, 251, 241, 0.62);
  color: rgb(13 148 136);
}

.capture-dashboard-heading h2 {
  color: rgb(15 82 73);
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.2;
}

.capture-dashboard-heading p {
  margin-top: 0.12rem;
  color: rgb(71 85 105);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.35;
}

.capture-dashboard-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: max-content;
  padding: 0.34rem 0.62rem;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 999px;
  background: rgba(240, 253, 250, 0.78);
  color: rgb(15 118 110);
  font-size: 0.72rem;
  font-weight: 900;
}

.capture-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.62rem;
}

.rare-dashboard-grid {
  align-items: stretch;
}

.rare-recommendation-panel {
  display: grid;
  align-content: start;
  gap: 0.56rem;
  min-width: 0;
  padding: 0.62rem;
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.54);
}

.rare-recommendation-panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.55rem;
  min-width: 0;
}

.rare-recommendation-panel-head span {
  color: rgb(30 41 59);
  font-size: 0.84rem;
  font-weight: 950;
  line-height: 1.15;
}

.rare-recommendation-panel-head small {
  color: rgb(100 116 139);
  font-size: 0.66rem;
  font-weight: 800;
  line-height: 1.15;
  text-align: right;
}

.capture-recommendation-list {
  display: grid;
  gap: 0.48rem;
}

.capture-recommendation {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem;
  min-height: 4.35rem;
  padding: 0.68rem 0.72rem 0.82rem;
  overflow: hidden;
  text-align: left;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.rare-recommendation-card {
  min-height: 4.1rem;
  padding-bottom: 1.42rem;
}

.capture-recommendation:hover,
.capture-recommendation:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(20, 184, 166, 0.34);
  background: rgba(240, 253, 250, 0.78);
  box-shadow: 0 12px 22px rgba(15, 118, 110, 0.1);
  outline: none;
}

.capture-recommendation:active {
  transform: translateY(0) scale(0.995);
}

.capture-recommendation-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.45rem;
  height: 2.45rem;
  border-radius: 0.9rem;
  background: rgba(236, 253, 245, 0.9);
  color: rgb(13 148 136);
}

.capture-recommendation-icon-amber {
  color: rgb(180 83 9);
  background: rgba(254, 243, 199, 0.9);
}

.capture-recommendation-copy {
  display: grid;
  gap: 0.12rem;
  min-width: 0;
}

.capture-recommendation-copy strong {
  overflow: hidden;
  color: rgb(30 41 59);
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.capture-recommendation-copy span {
  color: rgb(100 116 139);
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
}

.capture-recommendation-metric {
  display: grid;
  justify-items: end;
  gap: 0.05rem;
  color: rgb(15 82 73);
  font-variant-numeric: tabular-nums;
}

.capture-recommendation-metric strong {
  font-size: 1.08rem;
  font-weight: 950;
  line-height: 1;
}

.capture-recommendation-metric span {
  color: rgb(71 85 105);
  font-size: 0.64rem;
  font-weight: 900;
  line-height: 1;
}

.capture-recommendation-hint {
  grid-column: 2 / -1;
  min-width: 0;
  overflow: hidden;
  color: rgb(71 85 105);
  font-size: 0.66rem;
  font-weight: 850;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rare-recommendation-empty {
  min-height: 4.1rem;
  display: grid;
  place-items: center;
  padding: 0.72rem;
  border: 1px dashed rgba(148, 163, 184, 0.34);
  border-radius: 0.9rem;
  color: rgb(100 116 139);
  background: rgba(255, 255, 255, 0.54);
  font-size: 0.74rem;
  font-weight: 800;
  text-align: center;
}

.rare-missing-colors {
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
  min-width: 0;
}

.rare-recommendation-card .rare-missing-colors {
  grid-column: 2 / -1;
}

.rare-color-dot {
  width: 0.78rem;
  height: 0.78rem;
  flex: 0 0 auto;
  border: 2px solid rgba(255, 255, 255, 0.96);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.08),
    0 2px 5px rgba(15, 23, 42, 0.12);
}

.rare-color-dot-large {
  width: 1rem;
  height: 1rem;
}

.capture-recommendation-progress {
  position: absolute;
  right: 0.7rem;
  bottom: 0.42rem;
  left: 0.7rem;
  height: 0.22rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(203, 213, 225, 0.45);
}

.capture-recommendation-progress span {
  display: block;
  height: 100%;
  min-width: 0.25rem;
  border-radius: inherit;
  background: linear-gradient(90deg, rgb(20 184 166), rgb(16 185 129));
  transition: width 260ms ease;
}

.rare-analysis-panel {
  display: grid;
  gap: 0.72rem;
  margin-top: 0.72rem;
  padding: 0.72rem;
  border: 1px solid rgba(20, 184, 166, 0.16);
  border-radius: 1rem;
  background: rgba(240, 253, 250, 0.56);
}

.rare-analysis-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
}

.rare-analysis-toolbar h3 {
  color: rgb(15 82 73);
  font-size: 0.92rem;
  font-weight: 950;
  line-height: 1.2;
}

.rare-analysis-toolbar p {
  margin-top: 0.12rem;
  color: rgb(71 85 105);
  font-size: 0.72rem;
  font-weight: 800;
}

.rare-analysis-select {
  min-width: 10rem;
  max-width: 14rem;
  padding: 0.48rem 0.62rem;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  color: rgb(30 41 59);
  font-size: 0.78rem;
  font-weight: 850;
}

.rare-analysis-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.rare-analysis-stat {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
  padding: 0.52rem 0.58rem;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.68);
}

.rare-analysis-stat span {
  color: rgb(100 116 139);
  font-size: 0.66rem;
  font-weight: 850;
}

.rare-analysis-stat strong {
  overflow: hidden;
  color: rgb(15 82 73);
  font-size: 0.86rem;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.rare-analysis-action {
  padding: 0.58rem 0.66rem;
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.68);
  color: rgb(51 65 85);
  font-size: 0.78rem;
  font-weight: 850;
  line-height: 1.45;
}

.rare-analysis-missing {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.48rem;
  color: rgb(71 85 105);
  font-size: 0.72rem;
  font-weight: 850;
}

.collection-section-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.collection-section-card::before {
  display: none;
}

.collection-section-card::after {
  display: none;
}

.collection-section-card > * {
  position: relative;
  z-index: 1;
}

.collection-section-card-purple {
  background: rgba(255, 255, 255, 0.72);
}

.collection-section-card-purple::before {
  display: none;
}

.collection-section-card-purple::after {
  display: none;
}

.collection-section-icon {
  box-shadow:
    0 12px 24px rgba(0, 133, 35, 0.22),
    0 1px 8px rgba(255, 255, 255, 0.5) inset;
}

.collection-section-title {
  paint-order: normal;
  text-shadow: none;
}

.collection-section-desc,
.collection-section-count,
.collection-info-desc {
  paint-order: normal;
  text-shadow: none;
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
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(240, 253, 250, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.collection-category-header-special {
  background: linear-gradient(135deg, rgba(250, 245, 255, 0.95), rgba(253, 242, 248, 0.9));
}

.collection-info-card {
  background: rgba(236, 253, 245, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.76);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.collection-info-card-purple {
  background: rgba(250, 245, 255, 0.74);
}

.collection-info-icon {
  background: rgba(255, 255, 255, 0.54);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow: 0 1px 10px rgba(255, 255, 255, 0.78) inset;
}

.collection-info-title {
  letter-spacing: 0.01em;
  paint-order: normal;
  text-shadow: none;
}

.collection-filter-chip,
.collection-soft-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.collection-soft-button:hover {
  background: rgba(236, 253, 245, 0.9);
  border-color: rgba(110, 231, 183, 0.7);
}

.collection-collect-button {
  color: white;
  background: linear-gradient(135deg, var(--brand-green), var(--brand-green-dark));
  box-shadow: 0 8px 16px rgba(0, 170, 136, 0.18);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.collection-collect-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 170, 136, 0.24);
}

@media (max-width: 1024px) {
  .capture-dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .capture-dashboard {
    padding: 0.78rem;
    border-radius: 1.05rem;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .capture-dashboard-header {
    align-items: flex-start;
    margin-bottom: 0.6rem;
  }

  .capture-dashboard-heading {
    gap: 0.55rem;
  }

  .capture-dashboard-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.75rem;
  }

  .capture-dashboard-heading h2 {
    font-size: 0.95rem;
  }

  .capture-dashboard-heading p {
    font-size: 0.72rem;
  }

  .capture-dashboard-badge {
    padding: 0.3rem 0.5rem;
    font-size: 0.68rem;
  }

  .capture-dashboard-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .rare-recommendation-panel {
    padding: 0.52rem;
    border-radius: 0.9rem;
  }

  .rare-recommendation-panel-head {
    align-items: flex-start;
  }

  .rare-recommendation-panel-head span {
    font-size: 0.8rem;
  }

  .rare-recommendation-panel-head small {
    max-width: 8rem;
    font-size: 0.62rem;
  }

  .capture-recommendation {
    min-height: 3.8rem;
    padding: 0.58rem 0.62rem 0.74rem;
    border-radius: 0.9rem;
  }

  .capture-recommendation-icon {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.78rem;
  }

  .capture-recommendation-copy strong {
    font-size: 0.84rem;
  }

  .capture-recommendation-copy span {
    font-size: 0.68rem;
  }

  .capture-recommendation-hint {
    font-size: 0.62rem;
  }

  .rare-analysis-panel {
    padding: 0.58rem;
    border-radius: 0.9rem;
  }

  .rare-analysis-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 0.5rem;
  }

  .rare-analysis-select {
    width: 100%;
    max-width: none;
  }

  .rare-analysis-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.42rem;
  }

  .rare-analysis-stat {
    padding: 0.48rem 0.52rem;
  }

  .rare-analysis-stat strong {
    font-size: 0.8rem;
  }

  .collection-category-header {
    width: calc(100% - 16px);
    margin-inline: auto;
    gap: 0.65rem;
    padding: 0.8rem 0.85rem;
  }

  .collection-category-header :deep(.collection-collect-button),
  .collection-category-header .collection-collect-button {
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

