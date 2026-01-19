<template>
  <ClientOnly>
    <div class="relative h-screen w-full overflow-hidden">
      <!-- 地圖容器 -->
      <div id="map" class="w-full h-full rounded-3xl overflow-hidden shadow-2xl" style="min-height: 100vh;">
        <LMap
          ref="mapRef"
          :zoom="mapZoom"
          :center="mapCenter"
          :use-global-leaflet="false"
          :zoom-control="false"
          @ready="onMapReady"
          @moveend="onMapMoveEnd"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            :max-zoom="19"
          />

          <!-- 使用者位置標記 -->
          <LMarker
            v-if="userLocation"
            :lat-lng="userLocation"
          >
            <LIcon :icon-size="[22, 22]" :icon-anchor="[11, 11]" class-name="user-location-icon">
              <div class="w-5 h-5 rounded-full bg-blue-500 ring-4 ring-blue-200 border-2 border-white shadow-md"></div>
            </LIcon>
            <LPopup>
              <div class="text-xs text-gray-600">{{ $t('map.user_location') }}</div>
            </LPopup>
          </LMarker>
          
          <!-- S2 網格層（網格/單一格模式共用顯示） -->
          <template v-if="canRenderGrid && !isPinMode">
            <LPolygon
              v-for="cell in displayedGridCells"
              :key="cell.cellId"
              :lat-lngs="cell.bounds.map(p => [p.lat, p.lng])"
              :color="getCellStyleWithReports(cell).strokeColor"
              :weight="getCellStyleWithReports(cell).strokeWeight"
              :opacity="getCellStyleWithReports(cell).strokeOpacity"
              :fill-color="getCellStyleWithReports(cell).fillColor"
              :fill-opacity="getCellStyleWithReports(cell).fillOpacity"
            >
              <LPopup v-if="isGridMode">
                <div class="min-w-[200px] p-2">
                  <div class="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <span>🔲</span>
                    <span>S2 Cell L17</span>
                  </div>
                  <div class="text-xs text-gray-500 mb-3 font-mono break-all">
                    {{ cell.cellId }}
                  </div>
                  
                  <div class="space-y-2">
                    <div class="text-xs font-semibold text-gray-700 mb-1">{{$t('map.cell_info.decor_types')}} ({{ getEffectiveDecors(cell).size }}{{$t('map.cell_info.types_unit')}})：</div>
                    <div class="flex flex-wrap gap-1">
                      <!-- Existing Decors -->
                      <span
                        v-for="decorId in Array.from(cell.decorTypes)"
                        :key="decorId"
                        class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs"
                      >
                        <span>{{ getDecorInfo(decorId)?.icon }}</span>
                        <span>{{ getDecorInfo(decorId)?.name }}</span>
                      </span>
                      
                      <!-- Added Decors -->
                      <span
                        v-for="decorId in Array.from(getAddedDecors(cell.cellId))"
                        :key="`added-${decorId}`"
                        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200"
                        :title="$t('map.cell_info.user_reported')"
                      >
                        <span>{{ getDecorInfo(decorId)?.icon }}</span>
                        <span>{{ getDecorInfo(decorId)?.name }}</span>
                        <span class="text-[10px]">👤</span>
                      </span>
                    </div>

                    <div class="mt-2 pt-2 border-t border-gray-200">
                      <!-- Purity Status -->
                      <div class="text-xs text-gray-600 mb-2">
                        <span class="font-medium">{{ getEffectiveDecors(cell).size }}</span> {{ $t('map.cell_info.mixed_types') }}
                        <span v-if="getEffectiveDecors(cell).size === 1" class="text-emerald-600">（{{ $t('map.cell_info.pure') }}）</span>
                        <span v-else-if="getEffectiveDecors(cell).size <= 3" class="text-yellow-600">（{{ $t('map.cell_info.medium') }}）</span>
                        <span v-else class="text-red-600">（{{ $t('map.cell_info.mixed') }}）</span>
                      </div>
                      
                      <!-- Report Actions -->
                      <div class="space-y-1">
                          <!-- Not Pure Warning -->
                          <div v-if="isReported(cell.cellId)" class="w-full bg-purple-50 text-purple-700 font-bold px-2 py-1.5 rounded flex items-center gap-1.5 border border-purple-200 text-xs text-left">
                              <span>⚠️</span>
                              <span>{{ $t('map.report.impure_warning') }}</span>
                          </div>
                           
                           <!-- Report Functions (Only if logged in) -->
                           <div v-if="user" class="grid grid-cols-2 gap-1 pt-1">
                                <!-- Report Pure Error -->
                               <button 
                                  v-if="!isReported(cell.cellId) && cell.decorTypes.size === 1 && getAddedDecors(cell.cellId).size === 0"
                                  @click="confirmReport(cell.cellId)"
                                  class="col-span-2 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 px-2 py-1.5 rounded border border-gray-200 hover:border-red-200 text-xs transition-colors"
                              >
                                  {{ $t('map.report.error_pure') }}
                              </button>
                              
                              <!-- Report Missing Decor -->
                              <button 
                                  @click="openDecorSelector(cell.cellId)"
                                  class="col-span-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 px-2 py-1.5 rounded border border-emerald-200 hover:border-emerald-300 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                              >
                                  <span>➕</span>
                                  <span>{{ $t('map.report.missing') }}</span>
                              </button>
                           </div>
                      </div>
                    </div>
                  </div>
                </div>
              </LPopup>
            </LPolygon>
          </template>

          <!-- 單一格高亮層（只在單一格模式顯示） -->
          <template v-if="canRenderGrid && isSingleMode">
            <LPolygon
              v-for="cell in singleTypeCellsInView"
              :key="`single-${cell.cellId}`"
              :lat-lngs="cell.bounds.map(p => [p.lat, p.lng])"
              :color="getCellStyleWithReports(cell).strokeColor"
              :weight="getCellStyleWithReports(cell).strokeWeight"
              :opacity="getCellStyleWithReports(cell).strokeOpacity"
              :fill-color="getCellStyleWithReports(cell).fillColor"
              :fill-opacity="getCellStyleWithReports(cell).fillOpacity"
              @click="handlePolygonClick(cell)"
            >
              <LPopup>
                <div class="min-w-[160px] p-1">
                  <div class="text-xs text-gray-600 flex items-center gap-2 mb-2">
                    <span class="text-lg">{{ getDecorInfo(Array.from(cell.decorTypes)[0])?.icon }}</span>
                    <span class="font-bold">{{ getDecorInfo(Array.from(cell.decorTypes)[0])?.name }}</span>
                    <span class="text-emerald-600 text-[10px] border border-emerald-200 px-1 rounded bg-emerald-50">{{ $t('map.modes.pure') }}</span>
                  </div>
                  
                  <!-- Report Status / Action -->
                  <div class="text-xs border-t border-gray-100 pt-2 mt-1">
                      <div v-if="isReported(cell.cellId)" class="bg-purple-50 text-purple-700 font-bold px-2 py-1.5 rounded flex items-center gap-1.5 border border-purple-200 mb-1">
                          <span>⚠️</span>
                          <span>{{ $t('map.report.impure_warning') }}</span>
                      </div>
                       <button 
                          v-else-if="user"
                          @click="confirmReport(cell.cellId)"
                          class="w-full bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 font-medium px-2 py-1.5 rounded transition-colors text-center border border-gray-200 hover:border-red-200"
                      >
                          {{ $t('map.report.error_pure') }}
                      </button>
                  </div>
                </div>
              </LPopup>
            </LPolygon>
          </template>

          
          <!-- S2 Cell 內容徽章（高縮放顯示，避免太密） -->
          <template v-if="canRenderGrid && !isPinMode && mapZoom >= 16">
            <template v-for="cell in badgeCells" :key="`badge-${cell.cellId}`">
              <!-- 只顯示有裝飾品或 POI 的格子 (或有回報的) -->
              <LMarker
                v-if="getEffectiveDecors(cell).size > 0 || cell.poiCount > 0"
                :lat-lng="[cell.center.lat, cell.center.lng]"
              >
                <LIcon
                  :icon-size="[0, 0]"
                  class-name="cell-badge-container"
                >
                  <!-- 自定義 HTML 內容 - 確保點擊事件能穿透到下層 LMarker/LPopup -->
                  <div 
                    class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                    style="width: 80px;"
                  >
                    <!-- 飾品圖示群組 (Top) -->
                    <div class="flex items-center justify-center gap-0.5 mb-0.5 bg-white/95 rounded-full px-1.5 py-1 shadow-sm border border-emerald-100 backdrop-blur-sm">
                        <!-- 顯示前 3 個圖示 (No text here) -->
                        <div 
                            v-for="decorId in Array.from(getEffectiveDecors(cell)).slice(0, 3)" 
                            :key="decorId"
                            class="w-4 h-4 flex items-center justify-center"
                        >
                            <span class="text-sm leading-none">
                            {{ getDecorInfo(decorId)?.icon }}
                            </span>
                        </div>
                        <span v-if="getEffectiveDecors(cell).size > 3" class="text-[10px] text-gray-400 leading-none">...</span>
                    </div>
                    
                    <!-- 底部徽章群組 -->
                    <div class="flex items-center gap-1 mt-0.5">
                        <!-- 飾品總數徽章 (Moved Here) -->
                        <div class="bg-gray-800 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                            {{ getEffectiveDecors(cell).size }}{{$t('map.cell_info.types_unit')}}
                        </div>
                    </div>
                  </div>
                </LIcon>
              </LMarker>
            </template>
          </template>
          
          <!-- POI 標記點（Pin Mode 下顯示）-->
          <LMarker
            v-if="isPinMode"
            v-for="poi in fetchedPoints"
            :key="poi.id"
            :lat-lng="[poi.lat, poi.lon]"
          >
            <LIcon :icon-size="[50, 64]" :icon-anchor="[25, 64]" class-name="poi-icon">
              <div class="relative w-[50px] h-[64px] transition-transform hover:scale-110 active:scale-95 origin-bottom">
                <!-- 紅色大頭針形狀 -->
                <svg viewBox="0 0 50 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
                  <path d="M25 0C11.1929 0 0 11.1929 0 25C0 42 17 58 25 64C33 58 50 42 50 25C50 11.1929 38.8071 0 25 0Z" fill="#ef4444"/>
                </svg>
                
                <!-- 白色圓形底圖與圖示 -->
                <div class="absolute top-2 left-1/2 -translate-x-1/2 w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                  <img 
                    v-if="poi.iconUrl" 
                    :src="poi.iconUrl" 
                    :alt="poi.decorName"
                    class="w-[20px] h-[20px] object-contain"
                  />
                  <span v-else class="text-lg leading-none">{{ poi.decorIcon }}</span>
                </div>
              </div>
            </LIcon>
            <LPopup>
              <div class="text-center min-w-[180px] p-1">
                <img 
                  v-if="poi.iconUrl" 
                  :src="poi.iconUrl" 
                  :alt="poi.decorName"
                  class="w-12 h-12 mx-auto mb-2 object-contain"
                />
                <div v-else class="text-4xl mb-2">{{ poi.decorIcon }}</div>
                <div class="font-bold text-gray-800 text-base mb-1">{{ poi.name }}</div>
                <div class="text-sm text-emerald-600 font-medium mb-2">{{ poi.decorName }}</div>
                <div class="text-xs text-gray-400">
                  📍 {{ poi.lat.toFixed(5) }}, {{ poi.lon.toFixed(5) }}
                </div>
              </div>
            </LPopup>
          </LMarker>
        </LMap>
      </div>

      <!-- 側邊/底部控制面板 (響應式) -->
      <MapControlPanel
        v-model:showPanel="showPanel"
        v-model:selectedFilters="selectedFilters"
        :is-loading="isLoading"
        :error="error"
        :decor-rules="decorRules"
        :fetched-points="fetchedPoints"
        :is-mobile="isMobile"
        @select-all="selectAll"
        @clear-all="clearAll"
      />

      <!-- [NEW] Decor Selector Modal -->
      <MapDecorSelector
        v-model="showDecorSelector"
        :cell-id="selectedCellForDecorReport"
        :all-decors="allDecors"
      />

      <!-- Panel Toggle Button (for side panel) -->
      <button
        v-if="!showPanel && !showDecorSelector"
        @click="showPanel = true"
        class="absolute top-3 md:top-4 left-3 md:left-4 bg-white rounded-xl p-2.5 md:p-3 shadow-lg hover:shadow-xl active:scale-95 transition-all z-[1000] border border-gray-200"
        :title="$t('map.panel.show')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
        </svg>
      </button>

      <!-- UI 控制按鈕組 (Mobile-Optimized) -->
      <div class="absolute top-3 md:top-4 right-3 md:right-4 flex flex-row gap-2 z-[1002]">
        <div class="flex h-10 bg-white rounded-xl shadow-lg border border-gray-200 p-1 gap-1">
          <!-- 網格模式按鈕 -->
          <div class="relative group h-full">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'flex items-center gap-1.5 px-3 h-full rounded-lg text-sm font-medium transition-all',
                isGridMode ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span class="hidden md:inline">{{ $t('map.modes.grid') }}</span>
            </button>
            
            <!-- 網格模式 Tooltip -->
             <div class="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[2000] pointer-events-none translate-y-2 group-hover:translate-y-0">
              <div class="font-bold mb-2 text-emerald-300">網格模式 (Grid Mode)</div>
              <div class="flex gap-3 mb-2">
                <div class="w-16 h-16 bg-emerald-900/50 border border-emerald-500/30 rounded grid grid-cols-2 gap-px p-px">
                  <div class="bg-emerald-500/20 flex items-center justify-center text-[10px]">☕</div>
                  <div class="bg-emerald-500/20"></div>
                  <div class="bg-emerald-500/20"></div>
                  <div class="bg-emerald-500/20 flex items-center justify-center text-[10px]">🍔</div>
                </div>
                <div class="flex-1 space-y-1">
                  <p>• 任何縮放：顯示網格</p>
                  <p>• 切換標記模式：顯示大頭針</p>
                </div>
              </div>
              <div class="text-gray-400 text-[10px]">適合：查看飾品分佈與覆蓋率</div>
            </div>
          </div>
          
          <!-- 標記模式按鈕 -->
          <div class="relative group h-full">
            <button
              @click="viewMode = 'pin'"
              :class="[
                'flex items-center gap-1.5 px-3 h-full rounded-lg text-sm font-medium transition-all',
                isPinMode ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="hidden md:inline">{{ $t('map.modes.pin') }}</span>
            </button>
             <!-- 標記模式 Tooltip -->
            <div class="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[2000] pointer-events-none translate-y-2 group-hover:translate-y-0">
              <div class="font-bold mb-2 text-blue-300">標記模式 (Pin Mode)</div>
              <div class="flex gap-3 mb-2">
                <div class="w-16 h-16 bg-blue-900/50 border border-blue-500/30 rounded flex items-center justify-center">
                  <svg viewBox="0 0 50 64" class="w-8 h-8 drop-shadow-lg">
                    <path d="M25 0C11.1929 0 0 11.1929 0 25C0 42 17 58 25 64C33 58 50 42 50 25C50 11.1929 38.8071 0 25 0Z" fill="#ef4444"/>
                    <circle cx="25" cy="25" r="10" fill="white"/>
                  </svg>
                </div>
                <div class="flex-1 space-y-1">
                  <p>• 永遠顯示紅色大頭針</p>
                  <p>• 隱藏所有網格</p>
                </div>
              </div>
              <div class="text-gray-400 text-[10px]">適合：單純尋找地點，畫面清爽</div>
            </div>
          </div>

          <!-- 單一飾品格子提示按鈕（避免干擾，僅在網格模式下顯示） -->
          <div class="relative group h-full">
            <button
              @click="toggleSingleTypeCells"
              class="flex items-center gap-1.5 px-3 h-full rounded-lg text-sm font-medium transition-all"
              :class="isSingleMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'"
            >
              <span class="md:hidden font-bold text-xs">{{ $t('map.modes.pure') }}</span>
              <span class="hidden md:inline">{{ $t('map.modes.pure') }}</span>
            </button>
            
            <!-- Desktop Tooltip (Hover) -->
            <div class="hidden md:block absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[2000] pointer-events-none translate-y-2 group-hover:translate-y-0">
              <div class="font-bold mb-2 text-emerald-300">純種區模式</div>
              <p class="leading-relaxed mb-1">該區域僅包含「單一種」飾品（或路邊），不會混雜其他類型。</p>
              <p class="text-gray-400">適合：精準鎖定特定飾品，排除干擾。</p>
            </div>

            <!-- Mobile Ephemeral Tooltip (Auto-hide) -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div 
                v-if="showPureModeHint" 
                class="md:hidden absolute right-0 top-full mt-2 w-56 bg-gray-900/95 text-white text-xs rounded-xl p-3 shadow-xl z-[2000] backdrop-blur-sm border border-emerald-500/30"
              >
                <div class="flex items-start gap-2">
                  <span class="text-lg">🦄</span>
                  <div>
                    <div class="font-bold text-emerald-300 mb-1">純種區模式</div>
                    <p class="leading-relaxed">此區域僅判定為一種飾品（或路邊），不混雜其他類型，專為精準鎖定設計。</p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      
      <!-- 純種模式常駐說明 (當純種模式開啟時顯示) -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="isSingleMode && !showPureModeHint && showPureModeExplanation"
          class="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-[990] max-w-[65vw] md:max-w-md w-full"
        >
          <div class="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-emerald-200 flex items-start gap-3">
            <div class="bg-emerald-100 p-1.5 rounded-full shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-xs text-gray-700 leading-relaxed">
              <span class="font-bold text-emerald-700 block mb-0.5">純種模式已開啟</span>
              地圖上顯示的每一個格子，都保證<span class="font-bold text-gray-900">只有一種飾品類型</span>（或是路邊貼紙）。
              <br>這代表該區域是 42 種飾品中，剛好只有其中一種的重生點，沒有其他干擾。
            </div>
            <button 
              @click="showPureModeExplanation = false"
              class="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>

      <!-- 地點搜尋欄 & 搜尋區域按鈕 -->
      <MapSearch
        :panel-visible="showPanel"
        :is-loading="isLoading"
        :can-search-area="canSearch"
        :has-selected-filters="selectedFilters.length > 0"
        :is-single-mode="isSingleMode"
        @search-area="handleSearch"
        @fly-to="(lat, lon) => mapRef?.leafletObject?.flyTo([lat, lon], 18)"
      />

      <!-- Top-Right: Navigation Controls (Zoom & Location) -->
      <MapZoomControls
        :map-zoom="mapZoom"
        :is-locating="isLocating"
        :location-error="locationError"
        :can-search="canSearch"
        @locate="goToMyLocation"
      />

      <!-- S2 網格圖例面板（可摺疊）-->
      <MapGridLegend
        :is-grid-mode="isGridMode"
        :is-single-mode="isSingleMode"
      />

      <!-- 搜尋結果提示 -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="showSearchResult"
          class="absolute top-28 md:top-32 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg z-[1000] border border-emerald-200"
        >
          <span class="text-sm text-emerald-600 font-medium">
            🎉 找到 {{ fetchedPoints.length }} 個飾品地點！
            <span v-if="dataSource === 'local'" class="ml-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">📦 本地</span>
            <span v-else-if="dataSource === 'api'" class="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">🌐 API</span>
          </span>
        </div>
      </Transition>

      <!-- 單一格載入提示 -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isSingleMode && (isSingleTypeCellsLoading || isSingleTypeCellsRendering)"
          class="absolute top-16 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md z-[1000] border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2"
        >
          <span class="animate-spin">⏳</span>
          <span>純種區載入中…</span>
        </div>

      </Transition>
      
      <!-- 網格模式縮放過小提示 (Zoom Warning Toast) -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="showGridZoomWarning && isGridMode"
          class="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white rounded-full px-4 py-2 shadow-xl z-[1000] backdrop-blur-sm border border-gray-700 flex items-center gap-2"
        >
          <span class="text-xl">🔍</span>
          <div class="flex flex-col">
            <span class="font-bold text-sm">請放大地圖以顯示網格</span>
            <span class="text-[10px] text-gray-400">目前縮放等級: {{ mapZoom }} (需 ≥ {{ GRID_MIN_ZOOM }})</span>
          </div>
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LPopup, LIcon, LPolygon } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapBounds, POIPoint, GeocodingResult } from '~/types/map';
import type { S2CellData } from '~/types/s2';
import { useDecorRules } from '~/composables/useDecorRules';
import { useLocalFirstPOI } from '~/composables/useLocalFirstPOI';
import { useS2Grid } from '~/composables/useS2Grid';
import { useGeocoding } from '~/composables/useGeocoding';
import { useCellReports } from '~/composables/useCellReports'; // [NEW]
import MapControlPanel from '~/components/map/MapControlPanel.vue';
import MapSearch from '~/components/map/MapSearch.vue';
import MapDecorSelector from '~/components/map/MapDecorSelector.vue';
import MapGridLegend from '~/components/map/MapGridLegend.vue';
import MapZoomControls from '~/components/map/MapZoomControls.vue';

// Composables
const { decorRules, getDecorRule } = useDecorRules();
const { fetchPOIs, isLoading, error, dataSource, preloadAllRegions } = useLocalFirstPOI();
const { searchLocation, isSearching, searchError } = useGeocoding();
// [NEW] Cell Reports Logic
const { reportedCellIds, fetchReportsForCells, submitReport, isReported, isReportedNotPure, getAddedDecors, hasAddedDecor } = useCellReports();
const user = useSupabaseUser(); // Get user state for UI checks
const { 
  config: s2Config,
  cells: s2Cells,
  isCalculating: isS2Calculating,
  updateConfig: updateS2Config,
  calculateGrid: calculateS2Grid,
  clearGrid: clearS2Grid,
  findCellForPoint,
  getCellIdFromLatLng, // [RESTORED]
  getCellStyle,
  getCellCenter,
  getCellVertices,
} = useS2Grid();

// [NEW] Helper to get effective decor types (Local + Reported)
const getEffectiveDecors = (cell: any) => {
    const localDecors = new Set(cell.decorTypes);
    const addedDecors = getAddedDecors(cell.cellId);
    addedDecors.forEach(d => localDecors.add(d));
    return localDecors;
};

// [NEW] Wrapper for getCellStyle to inject custom styles
const getCellStyleWithReports = (cell: any) => { // Use 'any' or correct type
    // 1. Purple Grid (Not Pure) - Only valid in Pure Mode (Single Mode)
    if (isSingleMode.value && (isReportedNotPure(cell.cellId) || (isReported(cell.cellId) && isReported(cell.cellId) !== true))) { 
         // Note: isReported checks 'not_pure' in old logic, but let's strictly use isReportedNotPure from new composable
         // Actually, isReportedNotPure is what we want.
         return {
            strokeColor: '#9333ea', // Purple-600
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: '#9333ea',
            fillOpacity: 0.2
        };
    }
    
    // 2. Grid Mode - Recalculate color based on effective decors (including reported ones)
    // Even in Single Mode, if we have added decors (making it not pure), we might want to handle it?
    // But user said: "Green is Pure, Purple is Reported Not Pure".
    // So in Single Mode, keep Purple logic.
    
    // In Grid Mode, we update colors based on count.
    const effectiveDecors = getEffectiveDecors(cell);
    if (effectiveDecors.size > cell.decorTypes.size) {
        // We have added decors! Recalculate color based on effective size
        const size = effectiveDecors.size;
        
        // Logic copied/adapted from getCellStyle in useS2Grid (simplified)
        // 1 = Green, 2-3 = Yellow, 4+ = Red
        let color = '#9CA3AF'; // Default Gray
        if (size === 1) color = '#10B981'; // Green
        else if (size <= 3) color = '#F59E0B'; // Yellow
        else color = '#EF4444'; // Red
        
        return {
            strokeColor: color,
            strokeWeight: 1,
            strokeOpacity: 0.5,
            fillColor: color,
            fillOpacity: 0.35
        };
    }

    return getCellStyle(cell);
};

const handlePolygonClick = (cell: any) => {
  console.log('[Map] Polygon clicked:', cell.cellId, cell);
};

const { t } = useI18n();

// [NEW] Decor Selector Logic
const showDecorSelector = ref(false);
const selectedCellForDecorReport = ref<string | null>(null);
const decorLoading = ref(false);
const allDecors = decorRules;

const openDecorSelector = (cellId: string) => {
    selectedCellForDecorReport.value = cellId;
    showDecorSelector.value = true;
};

const toggleDecorReport = async (decorId: string) => {
    if (!selectedCellForDecorReport.value) return;
    
    const cellId = selectedCellForDecorReport.value;
    
    // Check if already added (optimistic check)
    // Check if already added (optimistic check)
    if (hasAddedDecor(cellId, decorId)) {
        alert(t('map.report.already_reported', '您已經回報過這個飾品了！')); 
        return; 
    }

    try {
        decorLoading.value = true;
        await submitReport(cellId, 'missing_decor', decorId);
        // Don't close immediately, allow multiple selections? Or close for feedback?
        // Let's keep it open for multi-select feel, but maybe show a toast.
    } catch (e: any) {
        alert(t('map.report.report_failed', '回報失敗：') + (e.message || t('map.error_unknown', '未知錯誤')));
    } finally {
        decorLoading.value = false;
    }
};

// 響應式視窗寬度
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const isMobile = computed(() => windowWidth.value < 768);

// 監聯視窗大小變化
// 監聯視窗大小變化
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// [NEW] Confirm Report Logic
const confirmReport = async (cellId: string) => {
    if (!confirm(t('map.report.confirm_impure', '⚠️ 警告：您確定要回報這個格子並非「純種」嗎？\n\n回報後，所有玩家在地圖上都會看到這個標記。\n請僅在您實際確認過該地點會出現其他飾品時才回報。'))) {
        return;
    }
    
    try {
        await submitReport(cellId);
        alert(t('map.report.thank_you', '感謝您的回報！地圖已更新。'));
    } catch (e: any) {
        alert(t('map.report.report_failed', '回報失敗：') + (e.message || t('map.error_unknown', '未知錯誤')));
    }
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

// 地圖設定 - 預設台北車站，縮放層級 16 (避免 Overpass API 超時)
const mapCenter = ref<[number, number]>([25.0478, 121.5170]); // 台北車站
const mapZoom = ref(16);
const mapRef = ref();
const MIN_ZOOM_FOR_QUERY = 16; // 最小查詢縮放層級

// ⚠️ 重要：使用 shallowRef 避免 Vue 對 Leaflet 物件進行深層響應式監聯
// 這是 Vue + Leaflet 效能優化的關鍵！
let leafletMap: any = null; // 不使用 ref，直接用普通變數

// 狀態管理
const showPanel = ref(true);
const selectedFilters = ref<string[]>(decorRules.slice(0, 42).map(r => r.id)); // 預設只選前三個，避免查詢過重

// 搜尋功能狀態
const searchQuery = ref('');
const searchResults = ref<GeocodingResult[]>([]);
const showSearchResults = ref(false);
const selectedResultIndex = ref(-1);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// 顯示模式（網格 / 標記 / 單一格）
type MapViewMode = 'grid' | 'pin' | 'single';
const viewMode = ref<MapViewMode>('grid');
const isGridMode = computed(() => viewMode.value === 'grid');
const isPinMode = computed(() => viewMode.value === 'pin');
const isSingleMode = computed(() => viewMode.value === 'single');
// S2 Grid L17 visibility: matches user request "zoom > 15" -> zoom >= 16
// S2 Grid L17 visibility: matches user request "zoom > 15" -> zoom >= 16
const canRenderGrid = computed(() => mapZoom.value >= 16);
const badgeCells = computed(() => (isSingleMode.value ? singleTypeCellsInView.value : s2Cells.value));
// Computed property for grid cells to ensure they only render in Grid Mode (not Single Mode residue)
// Computed property for grid cells to ensure they render in both Grid and Single Mode (but not mixed inappropriately)
const displayedGridCells = computed(() => {
  if (isGridMode.value) return s2Cells.value;
  if (isSingleMode.value) return singleTypeCellsInView.value;
  return [];
});
const isModeTransitioning = ref(false);

// Pure Mode Hint State
const showPureModeHint = ref(false);
const showPureModeExplanation = ref(true); // Default enabled, user can close it
let pureModeHintTimer: ReturnType<typeof setTimeout> | null = null;


// Zoom Warning State
const showGridZoomWarning = ref(false);
let gridZoomWarningTimer: ReturnType<typeof setTimeout> | null = null;
const GRID_MIN_ZOOM = 16;

watch(viewMode, (mode) => {
  handleViewModeChange(mode);
});

const handleViewModeChange = async (mode: MapViewMode) => {
  isModeTransitioning.value = true;
  await nextTick();
  
  const gridEnabled = mode !== 'pin';
  updateS2Config({ enabled: gridEnabled });
  
  if (!gridEnabled) {
    clearS2Grid();
  } else if (currentBounds) {
    calculateS2Grid(currentBounds, mapZoom.value);
  }

  isSingleTypeCellsRendering.value = false;
  if (mode === 'single') {
    updateSingleTypeCellsInView();
  } else {
    singleTypeCellsInView.value = [];
  }
  
  isModeTransitioning.value = false;
};

// Removed watch(canRenderGrid) as it used deleted scheduleGridRender

// POI 標記顯示狀態（預設顯示）
const poisVisible = ref(true);

// 定位功能狀態
const isLocating = ref(false);
const locationError = ref<string | null>(null);
const userLocation = ref<[number, number] | null>(null);

// 網格圖例顯示狀態
const showGridLegend = ref(true);

// 拖動關閉面板邏輯 (Mobile)
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isPanelDragging = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return;
  touchStartY.value = e.touches[0].clientY;
  isPanelDragging.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isPanelDragging.value) return;
  touchCurrentY.value = e.touches[0].clientY;
};

const handleTouchEnd = () => {
  if (!isPanelDragging.value) return;
  const distance = touchCurrentY.value - touchStartY.value;
  // 如果向下滑動超過 50px 且有移動，則關閉面板
  if (distance > 50 && touchCurrentY.value !== 0) {
    showPanel.value = false;
  }
  
  // 重置狀態
  isPanelDragging.value = false;
  touchStartY.value = 0;
  touchCurrentY.value = 0;
};

// 單一飾品格（L17）顯示
interface SingleTypeCell {
  cellId: string;
  decorType: string;
  center?: { lat: number; lng: number }; // Added for optimization
}

interface SingleTypeCellView extends SingleTypeCell {
  bounds: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
}

const singleTypeCells = shallowRef<SingleTypeCell[]>([]);
const singleTypeCellsInView = shallowRef<SingleTypeCellView[]>([]);
const isSingleTypeCellsLoading = ref(false);
const isSingleTypeCellsRendering = ref(false);
const SINGLE_TYPE_CELL_LIMIT = 800;
const hasSearched = ref(false);

// Batch rendering variables removed for performance
// Using smart diffing in useS2Grid instead for crash prevention without visual lag

// ⚠️ 使用 shallowRef 來儲存 POI 點位，避免 Vue 對每個點位物件進行深層監聽
const fetchedPoints = shallowRef<POIPoint[]>([]);

// 使用普通物件儲存邊界，不需要響應式
let currentBounds: MapBounds | null = null;

// SEO
useSeoMeta({
  title: '飾品地點地圖 - Pikmin Bloom 飾品圖鑑',
  description: '互動式地圖顯示 Pikmin Bloom 飾品皮克敏的潛在生成點，幫助你找到想要的飾品！ (非營利・CC BY-SA 4.0)',
  ogTitle: '飾品地點地圖 - Pikmin Bloom 飾品圖鑑',
  ogDescription: '互動式地圖顯示 Pikmin Bloom 飾品皮克敏的潛在生成點，幫助你找到想要的飾品！ (非營利・CC BY-SA 4.0)',
  ogImage: '/og-image.png',
  twitterTitle: '飾品地點地圖 - Pikmin Bloom 飾品圖鑑',
  twitterDescription: '互動式地圖顯示 Pikmin Bloom 飾品皮克敏的潛在生成點，幫助你找到想要的飾品！ (非營利・CC BY-SA 4.0)',
  twitterImage: '/og-image.png',
  twitterCard: 'summary_large_image'
});

// 計算每個規則的數量
const getCountForRule = (ruleId: string) => {
  return fetchedPoints.value.filter(p => p.decorType === ruleId).length;
};

const clearRenderTimer = (timer: ReturnType<typeof setTimeout> | null) => {
  if (timer) clearTimeout(timer);
};

const resetLayers = () => {
  // renderedGridCells and others removed
  renderedPoints.value = [];
};

// Helper functions removed (cloneCellsForRender, scheduleGridRender, renderInBatches)

// 地圖準備完成
const onMapReady = (map: any) => {
  // 不使用 ref 儲存 Leaflet 地圖實例！
  leafletMap = map;
  // 更新邊界
  updateMapBounds();
  
  // 初始化 S2 配置（確保狀態同步）
  updateS2Config({ enabled: !isPinMode.value });
  
  // 如果 S2 網格啟用，初始化網格
  if (!isPinMode.value && currentBounds) {
    calculateS2Grid(currentBounds, mapZoom.value);
  }

  if (isSingleMode.value && !isModeTransitioning.value && hasSearched.value) {
    updateSingleTypeCellsInView();
  }
  // ScheduleGridRender removed
};

// 組件掛載時執行（修復直接進入頁面時地圖不顯示的問題）
onMounted(() => {
  // 預先載入區域資料（Local-First 策略）
  preloadAllRegions();
  
  // 等待 DOM 完全載入後強制重新計算地圖尺寸
  nextTick(() => {
    setTimeout(() => {
      if (leafletMap) {
        leafletMap.invalidateSize();
        console.log('[Map] Forced map resize on mount');
      }
    }, 300);
  });
});


// 地圖互動開始 - 清空網格以避免 DOM 同步錯誤
// Reverted: User found this caused stuttering. Now relying on Smart Diff in useS2Grid.ts to prevent crashes.

// 地圖移動結束 - 只更新邊界，不自動查詢
const onMapMoveEnd = () => {
  updateMapBounds();
  
  // 如果 S2 網格啟用，重新計算網格
  if (!isPinMode.value && currentBounds) {
    calculateS2Grid(currentBounds, mapZoom.value);
    // 如果有 POI 數據，重新關聯
    if (fetchedPoints.value.length > 0) {
      associatePOIsToCells();
    }
    
    // [NEW] Fetch reports for visible cells
    const cellIds = s2Cells.value.map(c => c.cellId);
    if (cellIds.length > 0) {
        fetchReportsForCells(cellIds);
    }
  }

  if (isSingleMode.value && !isModeTransitioning.value) {
    updateSingleTypeCellsInView();
  }
};

// 更新地圖邊界和縮放層級
const updateMapBounds = () => {
  if (!leafletMap) return;
  
  // 同步縮放層級
  const newZoom = leafletMap.getZoom();
  mapZoom.value = newZoom;
  
  // Check for grid visibility warning
  if (isGridMode.value && newZoom < GRID_MIN_ZOOM) {
    showGridZoomWarning.value = true;
    if (gridZoomWarningTimer) clearTimeout(gridZoomWarningTimer);
    gridZoomWarningTimer = setTimeout(() => {
      showGridZoomWarning.value = false;
    }, 4000);
  } else {
    showGridZoomWarning.value = false;
  }
  
  const bounds = leafletMap.getBounds();
  // 使用普通物件，不需要響應式
  currentBounds = {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
  
  // Directly update S2 grid if needed
  if (!isPinMode.value) {
    // Grid update is handled by reactivity of s2Cells in calculateS2Grid
  }
};

const shouldShowSingleTypeCells = computed(() => {
  return isSingleMode.value;
});

const loadSingleTypeCells = async () => {
  if (singleTypeCells.value.length > 0 || isSingleTypeCellsLoading.value) return;

  isSingleTypeCellsLoading.value = true;
  try {
    const response = await fetch('/data/regions/taiwan_main_island/s2_l17_single.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();

    // [Fix] Filter out JP-only decors (e.g. Shrine) for Taiwan
    // We strictly filter out any rule with region='JP'.
    const jpOnlyDecors = new Set(decorRules.filter(r => r.region === 'JP').map(r => r.id));

    // Optimize: Pre-calculate center coordinates to avoid repetitive S2 calculations during filtering
    singleTypeCells.value = (data.cells || [])
      .filter((cell: any) => !jpOnlyDecors.has(cell.decorType))
      .map((cell: any) => ({
      ...cell,
      center: getCellCenter(cell.cellId)
    }));
  } catch (err) {
    console.warn('[Map] 無法載入單一飾品格資料', err);
  } finally {
    isSingleTypeCellsLoading.value = false;
  }
};

const isCellIntersectingBounds = (cellId: string, bounds: MapBounds): boolean => {
  const vertices = getCellVertices(cellId);
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  vertices.forEach(p => {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  });
  return !(minLat > bounds.north || maxLat < bounds.south || minLng > bounds.east || maxLng < bounds.west);
};

// Fast check using pre-calculated center
const isCellCenterInBounds = (center: { lat: number, lng: number }, bounds: MapBounds): boolean => {
    // Add a small buffer (approx 100m) to catch cells partially in view
    // 0.001 degrees is roughly 111m
    const buffer = 0.001; 
    return center.lat <= bounds.north + buffer &&
           center.lat >= bounds.south - buffer &&
           center.lng <= bounds.east + buffer &&
           center.lng >= bounds.west - buffer;
};

const updateSingleTypeCellsInView = () => {
  if (!shouldShowSingleTypeCells.value || !currentBounds || singleTypeCells.value.length === 0) {
    singleTypeCellsInView.value = [];
    return;
  }

  const filtered = singleTypeCells.value
    .filter(cell => cell.center ? isCellCenterInBounds(cell.center, currentBounds!) : isCellIntersectingBounds(cell.cellId, currentBounds!))
    .slice(0, SINGLE_TYPE_CELL_LIMIT)
    .map(cell => ({
      ...cell,
      bounds: getCellVertices(cell.cellId),
      center: getCellCenter(cell.cellId),
      decorTypes: new Set([cell.decorType]), // Add decorTypes Set for getCellStyle compatibility
      poiCount: 1, 
      priority: 'high'
    })) as S2CellData[]; // Cast to S2CellData to satisfy type requirements

  singleTypeCellsInView.value = filtered;
  singleTypeCellsInView.value = filtered;
  
  // renderInBatches logic removed - using direct assignment to singleTypeCellsInView
};

const toggleSingleTypeCells = async () => {
  viewMode.value = isSingleMode.value ? 'grid' : 'single';
  if (viewMode.value === 'single') {
    // Show ephemeral hint on mobile
    if (isMobile.value) {
      showPureModeHint.value = true;
      if (pureModeHintTimer) clearTimeout(pureModeHintTimer);
      pureModeHintTimer = setTimeout(() => {
        showPureModeHint.value = false;
      }, 3000);
    }
    // Always show persistent banner when entering mode (unless user closed it previously in this session? 
    // Let's reset it to true for better discovery every time they enter mode)
    showPureModeExplanation.value = true;
    
    await loadSingleTypeCells();
  } else {
    showPureModeHint.value = false;
  }
  updateSingleTypeCellsInView();
};

// Replaced by direct usage of s2Cells in template
// watch(s2Cells... removed

// Replaced by direct usage of fetchedPoints in template
// watch(fetchedPoints... removed


// 是否可以搜尋
const canSearch = computed(() => mapZoom.value >= MIN_ZOOM_FOR_QUERY);

// 搜尋結果提示
const showSearchResult = ref(false);
const currentAttempt = ref(0);
let searchResultTimer: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;

// 載入訊息
const loadingMessage = computed(() => {
  const attempt = currentAttempt.value;
  if (attempt <= 2) return t('map.loading_messages.msg1', '皮克敏正在努力挖掘...');
  if (attempt <= 4) return t('map.loading_messages.msg2', '皮克敏覺得小累...');
  if (attempt === 5) return t('map.loading_messages.msg3', '皮克敏快找到了...');
  return t('map.loading_messages.msg4', '皮克敏真的快找到了...');
});

// 手動搜尋
const handleSearch = async () => {
  if (!currentBounds) {
    console.log('[Map] No bounds yet');
    return;
  }
  
  if (!canSearch.value) {
    console.log(`[Map] Zoom level ${mapZoom.value} is too low, need at least ${MIN_ZOOM_FOR_QUERY}`);
    return;
  }
  
  if (selectedFilters.value.length === 0) {
    return;
  }

  // 取消之前的請求
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  currentAttempt.value = 0;
  hasSearched.value = true;

  console.log('[Map] Searching POIs...', { bounds: currentBounds, filters: selectedFilters.value.length });
  
  try {
    const selectedRules = decorRules.filter(r => selectedFilters.value.includes(r.id));
    
    const points = await fetchPOIs(
      currentBounds, 
      selectedRules, 
      abortController.signal
    );
    
    console.log('[Map] Received', points.length, 'points');
    
    // 使用 shallowRef，直接賦值整個陣列來觸發更新
    fetchedPoints.value = Object.freeze(points) as POIPoint[];
    
    // 如果非標記模式，關聯 POI 到 Cell
    if (!isPinMode.value) {
      associatePOIsToCells();
    }
    
    // 顯示搜尋結果提示
    showSearchResult.value = true;
    if (searchResultTimer) clearTimeout(searchResultTimer);
    searchResultTimer = setTimeout(() => {
      showSearchResult.value = false;
    }, 3000);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('[Map] Search aborted');
    } else {
      console.error('[Map] Search failed:', err);
    }
  } finally {
    abortController = null;
    currentAttempt.value = 0;
    if (isSingleMode.value) {
      scheduleSingleTypeCellsUpdate();
    }
  }
};

// 全選
const selectAll = () => {
  selectedFilters.value = decorRules.map(r => r.id);
};

// 清除全部
const clearAll = () => {
  selectedFilters.value = [];
};

// 將 POI 與 S2 Cell 關聯
const associatePOIsToCells = () => {
  if (!s2Cells.value || s2Cells.value.length === 0) {
    // console.log('[S2Grid] No cells to associate');
    return;
  }
  
  // console.log(`[S2Grid] Associating ${fetchedPoints.value.length} POIs to ${s2Cells.value.length} cells`);
  
  // 重置所有 Cell 的數據
  s2Cells.value.forEach(cell => {
    cell.decorTypes.clear();
    cell.poiCount = 0;
    cell.priority = 'none';
  });
  
  let matchCount = 0;
  
  // 對每個 POI，找到其所屬的 Cell
  const cellMap = new Map(s2Cells.value.map(cell => [cell.cellId, cell]));
  fetchedPoints.value.forEach((poi, index) => {
    const cellId = getCellIdFromLatLng(poi.lat, poi.lon);
    const cell = cellMap.get(cellId);
    
    if (cell) {
      // 將飾品類型添加到 Cell
      cell.decorTypes.add(poi.decorType);
      cell.poiCount++;
      matchCount++;
      
      // 更新優先級
      if (cell.decorTypes.size === 1) {
        cell.priority = 'high';
      } else if (cell.decorTypes.size <= 3) {
        cell.priority = 'medium';
      } else {
        cell.priority = 'low';
      }
    }
  });
  
  // No need to schedule render, s2Cells is reactive
};

// 計算網格中央飾品圖示的位置
const getCellIconPosition = (cell: S2CellData, iconIndex: number, totalIcons: number): [number, number] => {
  // 使用 cell 中心點作為基準
  const centerLat = cell.center.lat;
  const centerLng = cell.center.lng;
  
  // 如果只有一個圖示，直接放在中央
  if (totalIcons === 1) {
    return [centerLat, centerLng];
  }
  
  // 多個圖示時，水平排列在中央
  // Cell bounds: [SW, NW, NE, SE]
  const sw = cell.bounds[0];
  const ne = cell.bounds[2];
  const cellWidth = ne.lng - sw.lng;
  
  // 計算偏移量（讓圖示均勻分布在中央區域）
  const spacing = cellWidth * 0.25; // 每個圖示間距為 cell 寬度的 25%
  const totalSpan = spacing * (totalIcons - 1);
  const startOffset = -totalSpan / 2;
  
  return [
    centerLat,
    centerLng + startOffset + (iconIndex * spacing)
  ];
};

// 根據 zoom 級別獲取圖示大小
const getIconSize = (): [number, number] => {
  const zoom = mapZoom.value;
  if (zoom >= 19) return [56, 56];
  if (zoom >= 18) return [48, 48];
  if (zoom >= 17) return [42, 42];
  if (zoom >= 16) return [32, 32];
  return [24, 24];
};

// 獲取圖示大小的 CSS class
const getIconSizeClass = (): string => {
  const zoom = mapZoom.value;
  if (zoom >= 18) return 'size-xl';
  if (zoom >= 17) return 'size-lg';
  if (zoom >= 16) return 'size-md';
  if (zoom >= 15) return 'size-sm';
  return 'size-xs';
};

// 獲取飾品資訊
const getDecorInfo = (decorId: string) => {
  return getDecorRule(decorId);
};

// 定位到使用者當前位置
const goToMyLocation = () => {
  // 檢查瀏覽器是否支援 Geolocation API
  if (!navigator.geolocation) {
    locationError.value = t('map.location.not_supported', '您的瀏覽器不支援定位功能');
    console.error('[Map] Geolocation is not supported by this browser');
    return;
  }

  isLocating.value = true;
  locationError.value = null;

  navigator.geolocation.getCurrentPosition(
    // 成功回調
    (position) => {
      const { latitude, longitude } = position.coords;
      userLocation.value = [latitude, longitude];
      
      console.log(`[Map] Got user location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      
      if (leafletMap) {
        // 移動地圖到使用者位置，並設定適當的縮放等級
        leafletMap.setView([latitude, longitude], Math.max(mapZoom.value, 16), {
          animate: true,
          duration: 1,
        });
      }
      
      isLocating.value = false;
    },
    // 錯誤回調
    (error) => {
      isLocating.value = false;
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = t('map.location.permission_denied', '定位權限被拒絕，請在瀏覽器設定中允許定位');
          break;
        case error.POSITION_UNAVAILABLE:
          locationError.value = t('map.location.unavailable', '無法取得位置資訊');
          break;
        case error.TIMEOUT:
          locationError.value = t('map.location.timeout', '定位請求超時，請重試');
          break;
        default:
          locationError.value = t('map.location.unknown_error', '發生未知錯誤');
          break;
      }
      
      console.error('[Map] Geolocation error:', error.message);
      
      // 5 秒後清除錯誤狀態
      setTimeout(() => {
        locationError.value = null;
      }, 5000);
    },
    // 選項
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 允許使用 1 分鐘內的快取位置
    }
  );
};

// 地點搜尋功能
const handleSearchInput = () => {
  // 清除之前的計時器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  // 如果輸入為空，清空結果
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showSearchResults.value = false;
    selectedResultIndex.value = -1;
    return;
  }

  // 500ms 延遲後執行搜尋
  searchDebounceTimer = setTimeout(async () => {
    const results = await searchLocation(searchQuery.value);
    searchResults.value = results;
    showSearchResults.value = true;
    selectedResultIndex.value = -1;
  }, 500);
};

const handleSearchFocus = () => {
  if (searchResults.value.length > 0) {
    showSearchResults.value = true;
  }
};

const handleSearchKeydown = (e: KeyboardEvent) => {
  if (!showSearchResults.value) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedResultIndex.value = Math.min(selectedResultIndex.value + 1, searchResults.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedResultIndex.value = Math.max(selectedResultIndex.value - 1, -1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedResultIndex.value >= 0) {
      selectSearchResult(searchResults.value[selectedResultIndex.value]!);
    } else if (searchResults.value.length > 0) {
      selectSearchResult(searchResults.value[0]!);
    }
  } else if (e.key === 'Escape') {
    showSearchResults.value = false;
    selectedResultIndex.value = -1;
  }
};

const selectSearchResult = (result: GeocodingResult) => {
  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);

  if (leafletMap) {
    // 移動地圖到選定的位置
    leafletMap.setView([lat, lon], 17, {
      animate: true,
      duration: 1,
    });
  }

  // 關閉搜尋結果
  showSearchResults.value = false;
  selectedResultIndex.value = -1;

  console.log(`[Map] Navigated to: ${result.display_name}`);
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
  selectedResultIndex.value = -1;
};

// 從完整地址中提取主要地點名稱（第一部分）
const getLocationName = (fullName: string): string => {
  return fullName.split(',')[0] || fullName;
};

// 點擊外部關閉搜尋結果
if (typeof window !== 'undefined') {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      showSearchResults.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
}

// 清理
onUnmounted(() => {
  if (abortController) {
    abortController.abort();
  }
  if (searchResultTimer) {
    clearTimeout(searchResultTimer);
  }
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  window.removeEventListener('resize', updateWindowWidth);
  leafletMap = null;
});
</script>

<style scoped>
.poi-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(16, 185, 129, 0.5);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.poi-marker:hover {
  transform: scale(1.25);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(16, 185, 129, 0.7);
  z-index: 1000 !important;
}

.poi-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.poi-icon-emoji {
  font-size: 28px;
  line-height: 1;
}

/* 自訂捲軸樣式 */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 185, 129, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(16, 185, 129, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(16, 185, 129, 0.5);
}

/* POI 標記樣式（Zoom < 17 時使用）*/
.poi-marker {
  width: 52px;
  height: 52px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(16, 185, 129, 0.5);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.poi-marker:hover {
  transform: scale(1.25);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(16, 185, 129, 0.7);
  z-index: 1000 !important;
}

.poi-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.poi-icon-emoji {
  font-size: 28px;
  line-height: 1;
}

/* Cell 飾品圖示樣式 */
.decor-icon-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(16, 185, 129, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.decor-icon-container:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(16, 185, 129, 0.5);
  z-index: 1000 !important;
}

.decor-icon-img {
  object-fit: contain;
}

.decor-icon-emoji {
  line-height: 1;
}

/* 響應式圖示大小 */
.size-xl .decor-icon-img { width: 36px; height: 36px; }
.size-xl .decor-icon-emoji { font-size: 32px; }

.size-lg .decor-icon-img { width: 30px; height: 30px; }
.size-lg .decor-icon-emoji { font-size: 26px; }

.size-md .decor-icon-img { width: 24px; height: 24px; }
.size-md .decor-icon-emoji { font-size: 20px; }

.size-sm .decor-icon-img { width: 18px; height: 18px; }
.size-sm .decor-icon-emoji { font-size: 14px; }

.size-xs .decor-icon-img { width: 14px; height: 14px; }
.size-xs .decor-icon-emoji { font-size: 11px; }
</style>
