<template>
  <div ref="collectionPage" class="collection-page space-y-4 pb-8 relative" :class="{ 'has-album-index': !hasActiveFilters }" :style="collectionMotionStyle" @click="respondToControl">
    <CollectionAlbumCover
      :title="$t('collection.title')"
      :subtitle="$t('collection.subtitle')"
      :total="allDecorItems.length"
      :collected="albumCollectedCount"
      @browse="browseAlbum"
    />

    <!-- Filters Section -->
    <div
      class="collection-filter-panel card relative rounded-3xl p-5 md:p-6 mb-6 z-10 transition-all duration-300"
    >
      <div class="collection-filter-kicker"><span>INDEX / 01</span><span>{{ locale === 'en' ? 'Find your next discovery' : '找到下一個小發現' }}</span></div>
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
          ref="filterEntry"
          @click="isFilterExpanded = true"
          :aria-label="$t('collection.filters.title')"
          :aria-expanded="isFilterExpanded"
          class="collection-filter-open relative flex items-center gap-2 px-4 py-2.5 text-emerald-800 rounded-xl text-sm font-bold transition-all"
        >
          <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
          <span>{{ locale === "en" ? "Filters" : "篩選" }}</span>
          <Icon name="lucide:chevron-down" class="w-4 h-4" />
          
        </button>
      </div>

      <!-- Expanded: full filter panel -->
      <Transition :css="false" @enter="enterPanel" @leave="leavePanel" @enter-cancelled="cancelPanel" @leave-cancelled="cancelPanel">
      <div v-if="isFilterExpanded" class="collection-desktop-filters hidden md:block space-y-6">
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

        <Transition :css="false" @enter="enterPanel" @leave="leavePanel" @enter-cancelled="cancelPanel" @leave-cancelled="cancelPanel">
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
      </Transition>
    </div>

    <div v-if="hasActiveFilters" class="collection-active-summary">
      <p>{{ locale === 'en' ? 'Results' : '搜尋結果' }} <strong>{{ filteredItems.length }}</strong><span>{{ selectedFilterSummary }}</span></p>
      <button type="button" @click="clearAllFilters">{{ locale === 'en' ? 'Reset' : '重設' }} <span aria-hidden="true">×</span></button>
    </div>

    <section
      v-if="!hasActiveFilters && rareDashboardHasContent"
      class="capture-dashboard"
      aria-labelledby="capture-dashboard-title"
    >
      <button type="button" class="capture-dashboard-header" :aria-expanded="isRadarExpanded" aria-controls="collection-radar-content" @click="isRadarExpanded = !isRadarExpanded">
        <div class="capture-dashboard-heading">
          <span class="capture-dashboard-icon">
            <Icon name="lucide:sparkles" class="w-4 h-4" />
          </span>
          <div>
            <h2 id="capture-dashboard-title">{{ captureDashboardLabels.title }}</h2>
            <p>{{ captureDashboardLabels.subtitle }}</p>
          </div>
        </div>
        <span class="capture-dashboard-badge">{{ locale === 'en' ? 'Analysis' : '分析頁籤' }} <span class="radar-chevron" :class="{ 'is-open': isRadarExpanded }" aria-hidden="true">↓</span></span>
      </button>
      <Transition :css="false" @enter="enterPanel" @leave="leavePanel" @enter-cancelled="cancelPanel" @leave-cancelled="cancelPanel">
      <div v-if="isRadarExpanded" id="collection-radar-content" class="collection-radar-content">
      <div
        class="capture-dashboard-grid rare-dashboard-grid"
        :class="{ 'is-score-empty': rareLevelUpRecommendations.length === 0 && rareVirtualRecommendations.length === 0 }"
      >
        <article class="rare-recommendation-panel rare-recommendation-panel-primary">
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
                <span :style="{ transform: `scaleX(${recommendation.levelProgressPercent / 100})` }" />
              </span>
            </button>
            <p v-if="rareLevelUpRecommendations.length === 0" class="rare-recommendation-empty">
              {{ captureDashboardLabels.noRealClose }}
            </p>
          </div>
        </article>

        <article class="rare-recommendation-panel rare-recommendation-panel-virtual">
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
                <span :style="{ transform: `scaleX(${recommendation.virtualProgressPercent / 100})` }" />
              </span>
            </button>
            <p v-if="rareVirtualRecommendations.length === 0" class="rare-recommendation-empty">
              {{ captureDashboardLabels.noVirtualClose }}
            </p>
          </div>
        </article>

        <article class="rare-recommendation-panel rare-recommendation-panel-unlock">
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
                <span :style="{ transform: `scaleX(${recommendation.regularPercent / 100})` }" />
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
      </div>
      </Transition>
    </section>

    <!-- ===== Mobile Navigation Drawer (Bottom Sheet with Three.js) ===== -->
    <ClientOnly>
      <Teleport to="body">
        <Transition :css="false" @enter="enterPanel" @leave="leavePanel" @enter-cancelled="cancelPanel" @leave-cancelled="cancelPanel">
          <div
            v-if="isFilterExpanded"
            class="collection-filter-overlay md:hidden fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none"
            :style="collectionMotionStyle"
            @click="respondToControl"
            @keydown.esc="isFilterExpanded = false"
          >
            <!-- The backdrop fades independently from the sheet. -->
            <div
              class="collection-filter-backdrop absolute inset-0 bg-gray-900/60 pointer-events-auto"
              @click="isFilterExpanded = false"
            >
            </div>

            <!-- Bottom Sheet Content -->
            <div
              ref="filterSheet"
              role="dialog" aria-modal="true" :aria-label="$t('collection.filters.title')" tabindex="-1"
              @keydown="handleFilterKeys"
              class="collection-filter-sheet bg-white/95 border border-white/70 shadow-2xl relative w-full max-h-[85vh] rounded-t-[2.5rem] pointer-events-auto flex flex-col overflow-hidden"
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
                  type="button" :aria-label="locale === 'en' ? 'Close filters' : '關閉篩選'"
                  class="collection-soft-button p-2 text-gray-500 hover:text-gray-700 rounded-full active:scale-90 transition-transform"
                >
                  <Icon name="lucide:x" class="w-5 h-5" />
                </button>
              </div>

              <!-- Scrollable Content -->
              <div
                class="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar"
              >
                <div class="collection-sheet-tabs" aria-hidden="true"><span>01 {{ locale === 'en' ? 'SEARCH' : '搜尋' }}</span><span>02 {{ locale === 'en' ? 'SELECT' : '選取' }}</span><span>03 {{ locale === 'en' ? 'COLLECT' : '收藏' }}</span></div>
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
                  {{ locale === 'en' ? `Show ${filteredItems.length} results` : `顯示 ${filteredItems.length} 個結果` }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <nav class="collection-journal-tabs" :aria-label="locale === 'en' ? 'Collection sections' : '圖鑑分類'">
      <button type="button" :aria-pressed="selectedCategoryType === null" @click="selectedCategoryType = null">{{ locale === 'en' ? 'Full album' : '全部圖鑑' }}</button>
      <button type="button" :aria-pressed="selectedCategoryType === 'regular'" @click="selectedCategoryType = 'regular'">{{ $t('collection.sections.regular.title') }}</button>
      <button type="button" :aria-pressed="selectedCategoryType === 'special'" @click="selectedCategoryType = 'special'">{{ $t('collection.sections.special.title') }}</button>
    </nav>

    <!-- Results Section -->
    <div id="collection-album-results" class="collection-results" tabindex="-1">
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

          <details class="collection-info-card">
            <summary>{{ $t("collection.info.regular.title") }}<span aria-hidden="true">+</span></summary>
            <p class="collection-info-desc">{{ $t("collection.info.regular.desc") }}</p>
          </details>

          <div
            v-for="(def, chapterIndex) in regularCategories"
            :key="def.category.id"
            :id="`cat-${def.category.id}`"
            class="mb-6"
          >
            <div class="collection-category-header" :class="{ 'is-expanded': isCategoryExpanded(def.category.id) }">
              <button type="button" class="collection-category-toggle" :aria-expanded="isCategoryExpanded(def.category.id)" :aria-controls="`category-content-${def.category.id}`" @click="toggleCategory(def.category.id)">
                <span class="collection-chapter-number">{{ String(chapterIndex + 1).padStart(2, '0') }}</span>
                <span class="collection-category-name"><strong>{{ locale === 'en' ? def.category.nameEn : def.category.name }}</strong><small>{{ locale === 'en' ? def.category.name : def.category.nameEn }}</small></span>
                <span class="collection-category-progress"><strong>{{ getCategoryProgress(def.category.id) }}</strong><span class="collection-progress-track"><span class="collection-progress-fill" :style="{ transform: `scaleX(${getCategoryProgressPercent(def.category.id) / 100})` }" /></span></span>
                <span class="collection-category-chevron" aria-hidden="true">↓</span>
              </button>
              <button type="button" class="collection-collect-button" @click="handleCollectAll(def.category.id, locale === 'en' ? def.category.nameEn : def.category.name)" :title="$t('collection.actions.collect_all_tooltip')" :aria-label="$t('collection.actions.collect_all_tooltip')"><Icon name="lucide:check-check" class="w-4 h-4" /></button>
            </div>

            <!-- Collapsible content -->
            <div
              class="collection-category-content-wrapper"
              :id="`category-content-${def.category.id}`"
              :inert="!isCategoryExpanded(def.category.id) || undefined"
              :aria-hidden="!isCategoryExpanded(def.category.id) || undefined"
              :class="{
                'is-open': isCategoryExpanded(def.category.id),
                'is-animating': isCategoryAnimating(def.category.id),
              }"
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

          <details class="collection-info-card">
            <summary>{{ $t("collection.info.special.title") }}<span aria-hidden="true">+</span></summary>
            <p class="collection-info-desc">{{ $t("collection.info.special.desc") }}</p>
          </details>

          <div
            v-for="(def, chapterIndex) in specialCategories"
            :key="def.category.id"
            :id="`cat-${def.category.id}`"
            class="mb-6"
          >
            <div class="collection-category-header collection-category-header-special" :class="{ 'is-expanded': isCategoryExpanded(def.category.id) }">
              <button type="button" class="collection-category-toggle" :aria-expanded="isCategoryExpanded(def.category.id)" :aria-controls="`category-content-${def.category.id}`" @click="toggleCategory(def.category.id)">
                <span class="collection-chapter-number">{{ String(chapterIndex + 1).padStart(2, '0') }}</span>
                <span class="collection-category-name"><strong>{{ locale === 'en' ? def.category.nameEn : def.category.name }}</strong><small>{{ locale === 'en' ? def.category.name : def.category.nameEn }}</small></span>
                <span class="collection-category-progress"><strong>{{ getCategoryProgress(def.category.id) }}</strong><span class="collection-progress-track"><span class="collection-progress-fill" :style="{ transform: `scaleX(${getCategoryProgressPercent(def.category.id) / 100})` }" /></span></span>
                <span class="collection-category-chevron" aria-hidden="true">↓</span>
              </button>
              <button type="button" class="collection-collect-button" @click="handleCollectAll(def.category.id, locale === 'en' ? def.category.nameEn : def.category.name)" :title="$t('collection.actions.collect_all_tooltip')" :aria-label="$t('collection.actions.collect_all_tooltip')"><Icon name="lucide:check-check" class="w-4 h-4" /></button>
            </div>

            <!-- Collapsible content -->
            <div
              class="collection-category-content-wrapper"
              :id="`category-content-${def.category.id}`"
              :inert="!isCategoryExpanded(def.category.id) || undefined"
              :aria-hidden="!isCategoryExpanded(def.category.id) || undefined"
              :class="{
                'is-open': isCategoryExpanded(def.category.id),
                'is-animating': isCategoryAnimating(def.category.id),
              }"
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
import { collectionMotion, collectionMotionStyle, collectionMotionEnabled } from "~/utils/collectionMotion";
import { useParallax } from "~/composables/useParallax";

const route = useRoute();
const collectionPage = ref<HTMLElement | null>(null);
const { enterPanel, leavePanel, cancelPanel, refreshResults, respondToControl, revealCategory } = useCollectionMotion(collectionPage);
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
const isRadarExpanded = ref(false);
const filterEntry = ref<HTMLButtonElement | null>(null);
const filterSheet = ref<HTMLElement | null>(null);
const allDecorItems = computed(() => getAllDecorItems());
const albumCollectedCount = computed(() => allDecorItems.value.filter(item => isCollected(item.id)).length);
const selectedFilterSummary = computed(() => [
  selectedCategoryType.value ? getCategoryTypeName(selectedCategoryType.value) : '',
  selectedPikminType.value ? t(`pikmin_types.${selectedPikminType.value}`) : '',
  collectionFilter.value !== 'all' ? collectionFilters.value.find(filter => filter.value === collectionFilter.value)?.label : '',
  isLimitedMode.value ? t('collection.filters.limited') : '',
  selectedCategoryId.value ? getCategoryName(selectedCategoryId.value) : '',
].filter(Boolean).join(' · '));
const browseAlbum = async () => {
  await nextTick();
  const results = document.getElementById('collection-album-results');
  if (!results) return;
  const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 90;
  window.scrollTo({ top: Math.max(0, results.getBoundingClientRect().top + window.scrollY - headerHeight - 12), behavior: collectionMotionEnabled() ? 'smooth' : 'auto' });
  results.focus({ preventScroll: true });
};
const handleFilterKeys = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !filterSheet.value) return;
  const elements = Array.from(filterSheet.value.querySelectorAll<HTMLElement>('button, input, select, [tabindex="0"]')).filter(element => element.getClientRects().length && !element.hasAttribute('disabled'));
  const first = elements[0], last = elements[elements.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && (document.activeElement === first || document.activeElement === filterSheet.value)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
};
let previousBodyOverflow: string | null = null;
const restoreFilterScroll = () => {
  if (previousBodyOverflow === null) return;
  document.body.style.overflow = previousBodyOverflow;
  previousBodyOverflow = null;
};
let mobileFilterQuery: MediaQueryList | null = null;
const syncFilterViewport = async () => {
  if (!import.meta.client) return;
  if (isFilterExpanded.value && (mobileFilterQuery?.matches ?? window.innerWidth < 768)) {
    if (previousBodyOverflow === null) previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    await nextTick();
    if (isFilterExpanded.value && mobileFilterQuery?.matches) filterSheet.value?.focus({ preventScroll: true });
  } else restoreFilterScroll();
};
watch(isFilterExpanded, async (expanded) => {
  await syncFilterViewport();
  if (!expanded && !isFilterExpanded.value) filterEntry.value?.focus({ preventScroll: true });
});
onMounted(() => {
  mobileFilterQuery = window.matchMedia('(max-width: 767px)');
  mobileFilterQuery.addEventListener('change', syncFilterViewport);
});
onBeforeUnmount(() => {
  mobileFilterQuery?.removeEventListener('change', syncFilterViewport);
  restoreFilterScroll();
});

const { isAmbientPaused } = useParallax();
watch(isFilterExpanded, (expanded) => {
  isAmbientPaused.value = expanded;
});

// UX: Accordion - track collapsed categories (default all expanded)
const collapsedCategories = ref<Set<string>>(new Set());
const animatingCategories = ref<Set<string>>(new Set());
const categoryAnimationTimers = new Map<string, number>();
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

const markCategoriesAnimating = (categoryIds: string[]) => {
  const nextAnimating = new Set(animatingCategories.value);

  for (const categoryId of categoryIds) {
    const category = document.getElementById(`cat-${categoryId}`);
    const header = category?.querySelector('.collection-category-header');
    if (!header || !collectionMotionEnabled()) continue;
    const bounds = header.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) continue;
    const currentTimer = categoryAnimationTimers.get(categoryId);
    if (currentTimer !== undefined) {
      window.clearTimeout(currentTimer);
    }

    nextAnimating.add(categoryId);
    const timer = window.setTimeout(() => {
      categoryAnimationTimers.delete(categoryId);
      if (!animatingCategories.value.has(categoryId)) return;

      const remaining = new Set(animatingCategories.value);
      remaining.delete(categoryId);
      animatingCategories.value = remaining;
    }, collectionMotion.settle * 1000);
    categoryAnimationTimers.set(categoryId, timer);
  }

  animatingCategories.value = nextAnimating;
};

const toggleCategory = async (categoryId: string) => {
  cancelCategoryBulkToggle();
  markCategoriesAnimating([categoryId]);
  const newSet = new Set(collapsedCategories.value);
  if (newSet.has(categoryId)) newSet.delete(categoryId);
  else newSet.add(categoryId);
  collapsedCategories.value = newSet;
  await nextTick();
  if (isCategoryExpanded(categoryId) && animatingCategories.value.has(categoryId)) {
    const category = document.getElementById(`cat-${categoryId}`);
    if (category) revealCategory(category);
  }
};

const isCategoryExpanded = (categoryId: string) =>
  !collapsedCategories.value.has(categoryId);

const isCategoryAnimating = (categoryId: string) =>
  animatingCategories.value.has(categoryId);

const updateCategoriesInBatches = (categoryIds: string[], expand: boolean) => {
  cancelCategoryBulkToggle();

  const batchSize = 4;
  let index = 0;
  const nextSet = new Set(collapsedCategories.value);

  const runBatch = () => {
    const end = Math.min(index + batchSize, categoryIds.length);
    const changedIds: string[] = [];
    for (; index < end; index += 1) {
      const id = categoryIds[index];
      if (!id) continue;
      const isExpanded = !nextSet.has(id);
      if (isExpanded !== expand) {
        changedIds.push(id);
      }
      if (expand) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }
    }

    if (changedIds.length > 0) {
      markCategoriesAnimating(changedIds);
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
  isAmbientPaused.value = false;
  cancelCategoryBulkToggle();
  for (const timer of categoryAnimationTimers.values()) {
    window.clearTimeout(timer);
  }
  categoryAnimationTimers.clear();
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

watch([searchQuery, selectedCategoryType, selectedPikminType, collectionFilter, isLimitedMode, selectedCategoryId], refreshResults, { flush: 'post' });

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
  width: 100%;
  transform-origin: left center;
  border-radius: inherit;
  background: linear-gradient(90deg, rgb(20 184 166), rgb(16 185 129));
  transition: transform var(--collection-motion-enter) var(--collection-motion-ease);
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

/* Album styles are scoped to this page and its teleported filter paper. */
.collection-page, .collection-filter-overlay { --album-green: #10b981; --album-ink: #234c40; --album-muted: #718779; --album-line: #d6e2d5; --album-paper: #fffcf3; color: var(--album-ink); }
.collection-page { padding-bottom: 5rem; }
@media (min-width: 640px) { .collection-page.has-album-index { padding-right: 6.6rem; } }
.collection-filter-panel { border: 1px solid var(--album-line); border-radius: 1.1rem; padding: 1rem; background: var(--album-paper); box-shadow: 0 4px 0 #dce6d7, 0 14px 30px #234c400a; }
.collection-filter-kicker { display: flex; justify-content: space-between; gap: .6rem; margin-bottom: .8rem; color: var(--album-muted); font-size: .68rem; font-weight: 700; }
.collection-filter-kicker span:first-child { letter-spacing: .1em; font-family: ui-monospace, monospace; }
.collection-filter-panel :deep(.input-field), .collection-filter-sheet :deep(.input-field) { min-height: 48px; border: 1px solid #dce5db; border-radius: .7rem; background: #f5f7ed; box-shadow: inset 0 2px 3px #234c4005; font-size: 16px; color: var(--album-ink); }
.collection-filter-open { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; flex-shrink: 0; min-height: 48px; padding: .65rem .8rem; border-radius: .7rem; border: 1px solid #10b981; background: #10b981; color: #fff; font-size: .85rem; font-weight: 800; box-shadow: 0 3px 0 #078966; }
.collection-filter-open:active { transform: translateY(2px); box-shadow: 0 1px 0 #078966; }
.collection-filter-panel .collection-filter-chip { display: none; }
.collection-filter-panel :deep(button:focus-visible), .collection-filter-sheet :deep(button:focus-visible), .collection-category-toggle:focus-visible, .collection-collect-button:focus-visible, .capture-dashboard-header:focus-visible { outline: 3px solid #10b981; outline-offset: 3px; }
.collection-desktop-filters { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--album-line); }
.collection-active-summary { display: flex; align-items: center; justify-content: space-between; gap: .8rem; padding: .4rem .2rem; }
.collection-active-summary p { min-width: 0; font-size: .85rem; }
.collection-active-summary strong { margin-inline: .35rem; color: #078966; }
.collection-active-summary p > span { display: block; margin-top: .3rem; font-size: .74rem; color: var(--album-muted); }
.collection-active-summary button { flex-shrink: 0; min-height: 44px; color: #078966; font-size: .8rem; font-weight: 700; }
.collection-active-summary button span { padding-left: .5rem; }
.collection-soft-button, .collection-filter-chip { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-height: 44px; border: 1px solid var(--album-line); background: #f5f7ed; color: var(--album-ink); border-radius: .65rem; font-weight: 700; }
.collection-page :deep(.category-tag), .collection-filter-overlay :deep(.category-tag), .collection-page :deep(.filter-chip), .collection-filter-overlay :deep(.filter-chip) { min-height: 44px; box-shadow: none; backdrop-filter: none; border-radius: .65rem; }
.collection-page :deep(.category-tag-active), .collection-filter-overlay :deep(.category-tag-active), .collection-page :deep(.filter-chip-active), .collection-filter-overlay :deep(.filter-chip-active) { background: #10b981 !important; border-color: #10b981 !important; color: #fff !important; }
.collection-page :deep(.category-tag-inactive), .collection-filter-overlay :deep(.category-tag-inactive), .collection-page :deep(.filter-chip-inactive), .collection-filter-overlay :deep(.filter-chip-inactive) { background: #f5f7ed; color: var(--album-ink); border-color: var(--album-line); }
.collection-filter-overlay { perspective: 1200px; }
.collection-filter-backdrop { background: #152e27a8; }
.collection-filter-sheet { max-height: 88dvh; border: 1px solid #d2ddce; border-radius: 1.4rem 1.4rem 0 0; background: #fffcf3; box-shadow: 0 -5px 0 #e7e9db, 0 -10px 0 #bac9b2, 0 -24px 55px #172f2726; transform-origin: bottom center; }
.collection-filter-sheet > div:first-child { padding-top: .8rem; padding-bottom: .5rem; }
.collection-filter-sheet > div:first-child > div { background: #bac9b2; height: 4px; }
.collection-filter-sheet > div:nth-child(2) { padding: .25rem 1.2rem .75rem; border-bottom: 1px solid var(--album-line); }
.collection-filter-sheet > div:nth-child(3) { padding: 1rem 1.2rem; overscroll-behavior: contain; }
.collection-filter-sheet .text-gray-800, .collection-filter-sheet .text-gray-600 { color: var(--album-ink); }
.collection-filter-sheet > div:last-child { padding: .85rem 1rem calc(.85rem + env(safe-area-inset-bottom)); background: #f0f4e9; border-top: 1px solid var(--album-line); }
.collection-filter-sheet .btn-primary { background: #10b981; color: #fff; box-shadow: 0 3px 0 #078966; }
.collection-sheet-tabs { display: flex; justify-content: space-between; padding: .2rem 0 .8rem; border-bottom: 1px dashed #d6e2d5; color: #7b8e75; font-size: .66rem; letter-spacing: .06em; font-weight: 700; }
.capture-dashboard { padding: 0; border: 1px solid var(--album-line); border-radius: .9rem; background: #f8f8ed; box-shadow: 0 3px 0 #dce6d7; backdrop-filter: none; -webkit-backdrop-filter: none; }
.capture-dashboard-header { display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; gap: .5rem; padding: .85rem 1rem; margin: 0; }
.capture-dashboard-heading { gap: .7rem; }
.capture-dashboard-heading h2 { font-size: .95rem; color: var(--album-ink); }
.capture-dashboard-heading p { display: none; }
.capture-dashboard-icon { border: 1px solid #c9dac7; border-radius: .5rem; background: #eaf0df; color: #718779; box-shadow: none; }
.capture-dashboard-badge { gap: .6rem; min-width: auto; padding: .4rem 0; border: 0; background: transparent; color: #718779; font-size: .7rem; }
.radar-chevron { display: inline-block; transition: transform .25s; font-size: 1rem; }
.radar-chevron.is-open { transform: rotate(180deg); }
.collection-radar-content { border-top: 1px solid var(--album-line); }
.capture-dashboard-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; }
.rare-recommendation-panel { padding: 1rem; border: 0; border-radius: 0; background: transparent; }
.rare-recommendation-panel + .rare-recommendation-panel { border-left: 1px solid var(--album-line); }
.capture-recommendation { background: #fffcf3; border-color: var(--album-line); box-shadow: 0 3px 0 #dce6d7; }
.capture-recommendation-icon { border-radius: .6rem; background: #e8f3e8; color: #078966; }
.capture-recommendation-progress { background: #dce6d7; }
.capture-recommendation-progress > span { background: #10b981; }
.rare-analysis-panel { border: 0; border-top: 1px solid var(--album-line); border-radius: 0; background: #f0f4e9; }
.rare-analysis-stat, .rare-analysis-action, .rare-analysis-select { background: #fffcf3; border-color: var(--album-line); }
.collection-results { outline: none; perspective: 1200px; }
.collection-section-card { position: relative; display: flex; align-items: center; gap: .8rem; padding: 1rem .2rem; margin-bottom: .3rem; border: 0; border-bottom: 1px solid #b8d0be; border-radius: 0; background: transparent; box-shadow: none; }
.collection-section-icon { flex-shrink: 0; width: 42px; height: 42px; border-radius: .55rem; background: #10b981; color: #fff; box-shadow: 0 3px 0 #078966; }
.collection-section-card-purple .collection-section-icon { background: #10b981; }
.collection-section-title { font-size: 1.4rem; color: var(--album-ink); letter-spacing: -.025em; }
.collection-section-desc { color: #718779; font-size: .75rem; }
.collection-section-actions { display: flex; align-items: center; gap: .25rem; flex-shrink: 0; }
.collection-section-action { display: grid; place-items: center; width: 44px; height: 44px; color: #078966; border: 1px solid var(--album-line); border-radius: .6rem; background: #fffcf3; }
.collection-count-pill { padding: .55rem .6rem; border: 1px solid var(--album-line); border-radius: .6rem; background: #e9f0df; color: #718779; font-size: .72rem; font-weight: 700; white-space: nowrap; }
.collection-info-card { padding: .2rem .2rem; margin-bottom: .5rem; background: none; border: 0; box-shadow: none; }
.collection-info-card summary { display: flex; align-items: center; justify-content: space-between; min-height: 44px; list-style: none; color: #718779; font-size: .75rem; cursor: pointer; }
.collection-info-card summary::-webkit-details-marker { display: none; }
.collection-info-card summary > span { font-size: 1.1rem; transition: transform .2s; }
.collection-info-card[open] summary > span { transform: rotate(45deg); }
.collection-info-card .collection-info-desc { padding: .25rem 0 .75rem; }
.collection-info-icon { display: none; }
.collection-info-title { color: #527561; font-size: .75rem; }
.collection-info-desc { color: #718779; font-size: .75rem; line-height: 1.6; }
.collection-category-header { position: sticky; top: 104px; z-index: 9; display: flex; gap: .3rem; align-items: center; width: 100%; padding: .25rem .5rem .25rem .25rem; border: 1px solid var(--album-line); border-left: 5px solid #10b981; border-radius: .65rem .9rem .9rem .65rem; background: #fffcf3; box-shadow: 0 4px 0 #dce6d7, 0 9px 16px #234c4008; }
.collection-category-toggle { flex: 1; min-width: 0; display: flex; gap: .7rem; align-items: center; min-height: 64px; text-align: left; padding: .45rem; }
.collection-chapter-number { flex-shrink: 0; width: 2rem; align-self: center; color: #91a489; font: 500 .85rem ui-monospace, monospace; }
.collection-category-name { flex: 1; min-width: 0; }
.collection-category-name strong { display: block; color: var(--album-ink); font-size: 1rem; font-weight: 800; line-height: 1.4; overflow-wrap: anywhere; }
.collection-category-name small { display: block; color: #8b9b85; font-size: .68rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.collection-category-progress { width: 3.1rem; flex-shrink: 0; }
.collection-category-progress strong { display: block; text-align: right; color: #078966; font-size: .78rem; font-variant-numeric: tabular-nums; }
.collection-progress-track { display: block; height: 3px; margin-top: .4rem; border-radius: 3px; background: #dce6d7; overflow: hidden; }
.collection-progress-fill { display: block; height: 100%; background: #10b981; }
.collection-category-chevron { flex-shrink: 0; color: #7b937b; font-size: 1.1rem; transition: transform .3s; }
.is-expanded .collection-category-chevron { transform: rotate(180deg); }
.collection-collect-button { display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 1px solid #10b981; border-radius: .65rem; background: #10b981; color: #fff; box-shadow: 0 3px 0 #078966; }
.collection-collect-button:active { transform: translateY(2px); box-shadow: 0 1px 0 #078966; }
.collection-category-content-inner { padding: .2rem .1rem .6rem; }
@media (max-width: 767px) {
  .collection-page { margin-inline: 0; padding: 0 1rem 5rem; }
  .collection-section-card { flex-wrap: wrap; gap: .7rem; }
  .collection-section-card > .flex-1 { flex-basis: calc(100% - 60px); }
  .collection-section-actions { width: 100%; justify-content: flex-end; padding-top: .1rem; }
  .collection-category-header { top: 91px; }
  .collection-category-toggle { gap: .45rem; min-height: 61px; }
  .collection-chapter-number { width: 1.5rem; font-size: .72rem; }
  .collection-category-name strong { font-size: .92rem; }
  .collection-category-name small { font-size: .62rem; }
  .capture-dashboard-grid { grid-template-columns: 1fr; }
  .rare-recommendation-panel + .rare-recommendation-panel { border-left: 0; border-top: 1px solid var(--album-line); }
  .rare-analysis-toolbar { flex-direction: column; align-items: stretch; }
  .rare-analysis-select { width: 100%; max-width: none; }
  .rare-analysis-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 360px) {
  .collection-page { padding-inline: .75rem; }
  .collection-filter-panel { padding: .8rem; }
  .collection-filter-kicker { font-size: .6rem; }
  .collection-filter-open { padding: .65rem; }
  .collection-filter-open > .iconify:last-child { display: none; }
  .collection-category-toggle { gap: .35rem; padding: .4rem .25rem; }
  .collection-chapter-number { width: 1.2rem; }
  .collection-category-progress { width: 2.7rem; }
}

/* Collection journal: planar specimens, quiet paper edges, touch-first tabs. */
.collection-page { --album-paper: #fffdf7; --album-line: #e0e3d7; --album-muted: #7c897b; background: #f8faf2; border-radius: 1rem; }
.collection-filter-panel { border: 0; padding: 0; background: transparent; box-shadow: none; }
.collection-filter-kicker { display: none; }
.collection-filter-panel :deep(.input-field) { background: #fffdf8; border-color: #e2e4d9; box-shadow: 0 2px 6px #324c3110; border-radius: .85rem; }
.collection-filter-open { box-shadow: 0 2px 0 #079b6c; border-radius: .85rem; }
.collection-journal-tabs { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: .25rem; position: relative; margin-bottom: -1rem!important; z-index: 2; padding-inline: .45rem; }
.collection-journal-tabs button { min-height: 48px; padding: .55rem .25rem; border: 1px solid #e0e3d7; border-bottom: 0; border-radius: .8rem .8rem 0 0; background: #f0f3e9; color: #73816d; font-size: .8rem; font-weight: 700; }
.collection-journal-tabs button[aria-pressed="true"] { background: #10b981; border-color: #10b981; color: #fff; }
.collection-journal-tabs button:focus-visible { outline: 3px solid #07835c; outline-offset: 2px; }
.collection-results { position: relative; margin-top: 1rem; padding: .8rem; border: 1px solid #e0e3d7; border-radius: 1rem; background: #fffdf7; box-shadow: 0 3px 0 #e8ecdf; }
.capture-dashboard { background: #f7f8ef; box-shadow: none; border-color: #e1e4d7; }
.collection-section-card { flex-wrap: nowrap; gap: .5rem; padding: .4rem 0 .75rem; margin-bottom: .2rem; border-color: #e0e3d7; }
.collection-section-icon { display: none; }.collection-section-card > .flex-1 { flex-basis: auto; min-width: 0; }
.collection-section-title { font-size: 1.25rem; font-weight: 800; }.collection-section-desc { font-size: .72rem; }
.collection-section-actions { width: auto; padding-top: 0; gap: .2rem; }
.collection-section-action { width: 38px; min-height: 44px; border: 0; background: transparent; }
.collection-count-pill { padding: .35rem .3rem; border: 0; border-radius: .3rem; background: none; font-size: .65rem; color: #7e8d7a; }
.collection-category-header { padding: .1rem 0; border: 0; border-bottom: 1px solid #e0e4d7; border-radius: 0; background: #fffdf7; box-shadow: none; }
.collection-category-toggle { min-height: 58px; gap: .5rem; padding: .35rem 0; }
.collection-chapter-number { align-self: stretch; display: flex; align-items: center; justify-content: center; width: 1.8rem; color: #92a286; font-size: .73rem; }
.collection-category-name strong { font-size: .9rem; }.collection-category-name small { color: #99a38f; font-size: .6rem; }
.collection-category-progress strong { font-weight: 600; font-size: .75rem; }.collection-category-progress { width: 3.4rem; }.collection-progress-track { height: 2px; }
.collection-collect-button { width: 40px; min-height: 44px; border-radius: .55rem; box-shadow: 0 2px 0 #079b6c; }
.collection-category-header-special .collection-chapter-number { color: #be8c72; }
.collection-category-content-inner { padding: 0 0 .65rem; }
@media(max-width:767px) { .collection-section-desc { display: none; }.collection-results { padding: .75rem; }.collection-section-title { font-size: 1.15rem; } }
@media(max-width:360px) { .collection-results { padding: .6rem; }.collection-section-title { font-size: 1rem; }.collection-section-actions { gap: 0; }.collection-section-action { width: 32px; }.collection-chapter-number { width: 1.3rem; }.collection-category-name strong { font-size: .82rem; }.collection-journal-tabs button { font-size: .73rem; } }
@media(min-width:768px) { .collection-results { padding: 1.4rem; }.collection-journal-tabs { max-width: 34rem; }.collection-section-title { font-size: 1.65rem; }.collection-category-toggle { min-height: 68px; }.collection-category-name strong { font-size: 1.05rem; } }

/* Accordion CSS Grid height animation */
.collection-category-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
}

.collection-category-content-wrapper.is-animating {
  transition: grid-template-rows var(--collection-motion-enter) var(--collection-motion-ease);
}

.collection-category-content-wrapper.is-open {
  grid-template-rows: 1fr;
}

.collection-category-content-inner {
  min-height: 0;
  overflow: hidden;
}

.collection-page-ambient .deco-leaf {
  animation: none;
}

.collection-progress-fill {
  width: 100%;
  transform-origin: left center;
  transition: transform var(--collection-motion-enter) var(--collection-motion-ease);
}

.collection-page :deep(button),
.collection-filter-overlay :deep(button),
.collection-category-header {
  transition-duration: var(--collection-motion-fast);
  transition-timing-function: var(--collection-motion-ease);
}

.collection-page :deep(.category-tag),
.collection-page :deep(.filter-chip),
.collection-page :deep(.pikmin-filter-btn),
.collection-filter-overlay :deep(.category-tag),
.collection-filter-overlay :deep(.filter-chip),
.collection-filter-overlay :deep(.pikmin-filter-btn) {
  transition-property: background-color, border-color, color, box-shadow;
}

@media (prefers-reduced-motion: reduce) {
  .collection-page :deep(*),
  .collection-filter-overlay :deep(*) {
    animation: none !important;
    transition-duration: 0s !important;
    scroll-behavior: auto !important;
  }
}


</style>
