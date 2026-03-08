<template>
  <div class="min-h-screen py-8 px-4">
    <!-- Background Decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div class="absolute top-32 right-10 text-6xl opacity-10 animate-float">🤝</div>
      <div class="absolute bottom-40 left-20 text-5xl opacity-10 animate-float" style="animation-delay: 1.5s;">🌸</div>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <header class="text-center mb-10 animate-slide-up">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-xl shadow-pink-200 mb-4">
          <span class="text-4xl">🤝</span>
        </div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2">{{ $t('friends.title') }}</h1>
        <p class="text-gray-500">{{ $t('friends.subtitle') }}</p>
      </header>

      <!-- Info Banner -->
      <div class="glass rounded-2xl p-4 mb-6 animate-slide-up flex items-start gap-3" style="animation-delay: 0.05s;">
        <span class="text-xl flex-shrink-0">💡</span>
        <div class="text-sm text-gray-600">
          <p class="font-medium text-gray-700 mb-1">{{ $t('friends.tips.title') }}</p>
          <ul class="space-y-1 text-gray-500">
            <li>• {{ $t('friends.tips.row1') }}</li>
            <li>• {{ $t('friends.tips.row2') }}</li>
            <li>• {{ $t('friends.tips.row3') }}</li>
          </ul>
        </div>
      </div>

      <!-- Post Form (登入用戶) -->
      <div v-if="user" class="glass rounded-3xl p-6 mb-8 animate-slide-up" style="animation-delay: 0.1s;">
        <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
          </svg>
          {{ $t('friends.form.title') }}
        </h2>
        
        <form @submit.prevent="submitPost" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  {{ $t('friends.form.label_name') }}
                </span>
              </label>
              <input
                v-model="newPost.username"
                type="text"
                required
                maxlength="20"
                class="input-field"
                :placeholder="$t('friends.form.placeholder_name')"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {{ $t('friends.form.label_code') }}
                </span>
              </label>
              <input
                v-model="newPost.friendCode"
                type="text"
                required
                class="input-field font-mono tracking-wider"
                placeholder="1234 5678 9012"
                @input="formatFriendCode"
              >
            </div>
          </div>
          
          <!-- Intent Selector (NEW) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.5-3.879l-3-3a1 1 0 011.414-1.414L9 11.586l4.293-4.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                交友目的 (自由選填，最多 2 個)
              </span>
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="intent in FRIEND_INTENTS"
                :key="intent.id"
                type="button"
                @click="toggleIntent(intent.id)"
                :disabled="!newPost.intents.includes(intent.id) && newPost.intents.length >= 2"
                class="px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                :class="[
                  newPost.intents.includes(intent.id) 
                    ? intent.colorClass
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                ]"
              >
                <span>{{ intent.icon }}</span>
                <span>{{ intent.label }}</span>
              </button>
            </div>
            <p v-if="newPost.intents.length === 2" class="text-xs text-amber-500 mt-2 font-medium flex items-center gap-1">
               已達到目的上限 (2 個)
            </p>
          </div>
          
          <!-- Region Selector -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                常駐地區 (自由選填，最多 2 個)
              </span>
            </label>
            <div class="flex flex-wrap gap-2">
              <div v-for="group in FRIEND_REGIONS" :key="group.label" class="w-full mb-1">
                <p class="text-xs font-semibold text-gray-400 mb-1.5 ml-1">{{ group.label }}</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="region in group.options"
                    :key="region"
                    type="button"
                    @click="toggleRegion(region)"
                    :disabled="!newPost.regions.includes(region) && newPost.regions.length >= 2"
                    class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border"
                    :class="[
                      newPost.regions.includes(region) 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                    ]"
                  >
                    {{ region }}
                  </button>
                </div>
              </div>
            </div>
            <p v-if="newPost.regions.length === 2" class="text-xs text-amber-500 mt-2 font-medium flex items-center gap-1">
               已達到地區上限 (2 個)
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                {{ $t('friends.form.label_message') }}
              </span>
            </label>
            <textarea
              v-model="newPost.message"
              rows="2"
              maxlength="100"
              class="input-field resize-none"
              :placeholder="$t('friends.form.placeholder_message')"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1 text-right">{{ newPost.message.length }} / 100</p>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              @click="submitPost"
              :disabled="submitting || !isValidFriendCode"
              class="btn-primary flex items-center gap-2"
            >
              <svg v-if="submitting" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
              </svg>
              <span>{{ submitting ? $t('friends.form.submitting') : $t('friends.form.submit') }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Login Prompt -->
      <div v-else class="glass rounded-3xl p-8 mb-8 text-center animate-slide-up" style="animation-delay: 0.1s;">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-gray-600 mb-4">{{ $t('friends.login_prompt') }}</p>
        <NuxtLink
          to="/auth"
          class="btn-primary inline-flex items-center gap-2"
        >
          <span>{{ $t('auth.login') }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Recommended Friends Section -->
      <section v-if="recommendedPosts.length > 0" class="mb-10 animate-slide-up" style="animation-delay: 0.15s;">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <span class="text-2xl">✨</span>
          {{ $t('friends.rec_title') }}
          <span class="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
            {{ $t('friends.rec_update') }}
          </span>
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            v-for="post in recommendedPosts"
            :key="`rec-${post.id}`"
            class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100 hover:shadow-md transition-all duration-300 group"
          >
            <div class="flex items-center gap-2 mb-2">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                {{ post.username.charAt(0).toUpperCase() }}
              </div>
              <div class="overflow-hidden flex-1">
                <h3 class="font-bold text-gray-800 text-sm truncate">{{ post.username }}</h3>
                <p class="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                  {{ formatDate(post.created_at) }}
                </p>
              </div>
            </div>
            
            <div 
              class="bg-white rounded-lg px-2 py-2 mb-2 border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              @click="copyCode(post.friend_code)"
              :title="$t('friends.copy_tooltip')"
            >
              <p class="font-mono text-xs font-bold text-indigo-600 tracking-wider text-center">
                {{ formatDisplayCode(post.friend_code) }}
              </p>
            </div>

            <div class="flex-1 flex flex-col justify-between">
              <!-- Intent Tags (Small) -->
              <div v-if="getPostIntents(post.regions).length > 0" class="flex flex-wrap gap-1 mb-2">
                <span 
                  v-for="intentId in getPostIntents(post.regions)" 
                  :key="`rec-${post.id}-intent-${intentId}`" 
                  class="px-1.5 py-[2px] rounded text-[10px] font-semibold border flex items-center gap-1 shadow-sm"
                  :class="getIntentColor(intentId)"
                  :title="getIntentLabel(intentId)"
                >
                  <span class="text-[12px] leading-none">{{ getIntentIcon(intentId) }}</span>
                  <span class="leading-none">{{ getIntentLabel(intentId) }}</span>
                </span>
              </div>

              <!-- Region Tags (Small) -->
              <div v-if="getPostRegions(post.regions).length > 0" class="flex flex-wrap gap-1 mb-2">
                <span v-for="region in getPostRegions(post.regions)" :key="`rec-${post.id}-region-${region}`" class="px-1.5 py-[2px] bg-white text-gray-500 border border-gray-200 rounded text-[10px] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {{ region.split(' ')[0] }}
                </span>
              </div>
            </div>

            <!-- User Message (Small and truncated) -->
            <div v-if="post.message" class="mb-2">
              <p class="text-xs text-gray-600 bg-white/70 rounded p-1.5 border border-indigo-50/50 line-clamp-2 leading-relaxed" :title="post.message">
                {{ post.message }}
              </p>
            </div>

            <div class="flex flex-wrap justify-between items-end mt-auto gap-2">
               <button
                @click="copyCode(post.friend_code)"
                class="text-[11px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm transition-colors w-full justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
                複製代碼
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Posts Section -->
      <section class="animate-slide-up" style="animation-delay: 0.2s;">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {{ $t('friends.all_players') }}
            <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              {{ posts.length }}
            </span>
          </h2>
          
          <!-- Refresh Button -->
          <button
            @click="fetchPosts"
            :disabled="loading"
            class="p-2 rounded-xl hover:bg-white/60 transition-colors text-gray-500 hover:text-emerald-600"
            :title="$t('friends.refresh')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{ 'animate-spin': loading }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="mb-6 bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4">
          <!-- Intents Filter -->
          <div>
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
              <span class="text-xl">🎯</span> 目的篩選：
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                @click="clearIntentFilters"
                class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm"
                :class="selectedIntentFilters.length === 0 ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
              >
                所有目的
              </button>
              <button
                v-for="intent in FRIEND_INTENTS"
                :key="`filter-intent-${intent.id}`"
                @click="toggleIntentFilter(intent.id)"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1"
                :class="selectedIntentFilters.includes(intent.id) ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
              >
                <span>{{ intent.icon }}</span>
                <span>{{ intent.label }}</span>
              </button>
            </div>
          </div>

          <div class="w-full h-px bg-gray-200"></div>

          <!-- Regions Filter -->
          <div>
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
              <span class="text-xl">🌍</span> 地區篩選：
            </div>
            <!-- 第一層：大分區 -->
            <div class="flex flex-wrap gap-2">
              <button
                @click="clearRegionFilters"
                class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm"
                :class="selectedCategories.length === 0 && selectedRegionFilters.length === 0 ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
              >
                全球
              </button>
              <button
                v-for="group in FRIEND_REGIONS"
                :key="`cat-${group.label}`"
                @click="toggleCategoryFilter(group.label)"
                class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
                :class="selectedCategories.includes(group.label) ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
              >
                {{ group.label.split(' ')[0] }}
              </button>
            </div>

            <!-- 第二層：具體地區 -->
            <div v-if="selectedCategories.length > 0" class="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 animate-slide-up">
              <div v-for="cat in selectedCategories" :key="`subcat-${cat}`" class="flex flex-wrap gap-2 items-center">
                <span class="text-xs font-bold text-gray-400 mr-1">{{ cat.split(' ')[0] }}:</span>
                <button
                  v-for="region in getOptionsForCategory(cat)"
                  :key="`filter-${region}`"
                  @click="toggleRegionFilter(region)"
                  class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors border"
                  :class="selectedRegionFilters.includes(region) ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
                >
                  {{ region.split(' ')[0] }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="glass rounded-3xl p-6 text-center text-red-600 mb-6 bg-red-50 border border-red-200">
          <p class="font-bold flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ $t('friends.error') }}
          </p>
          <p class="mt-2 text-sm">{{ error }}</p>
          <button @click="fetchPosts" class="mt-4 text-sm underline hover:text-red-700">{{ $t('friends.retry') }}</button>
        </div>

        <!-- Loading -->
        <div v-if="loading && posts.length === 0" class="glass rounded-3xl p-12 text-center">
          <div class="w-16 h-16 mx-auto border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p class="text-gray-500">{{ $t('friends.loading') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="posts.length === 0" class="glass rounded-3xl p-12 text-center">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
            <span class="text-4xl">🌱</span>
          </div>
          <p class="text-gray-500">{{ $t('friends.empty_title') }}</p>
          <p class="text-emerald-600 font-medium mt-1">{{ $t('friends.empty_desc') }}</p>
        </div>

        <!-- Posts Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(post, index) in posts"
            :key="post.id"
            class="glass rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] animate-pop-in"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg text-lg">
                  {{ post.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">{{ post.username }}</h3>
                  <p class="text-xs text-gray-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    {{ formatDate(post.created_at) }}
                  </p>
                </div>
              </div>
              <button
                @click="copyCode(post.friend_code)"
                class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                :title="$t('friends.copy_code')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              </button>
            </div>
            
            <!-- Friend Code Display -->
            <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl px-4 py-3 mb-3 border border-emerald-100">
              <p class="text-lg font-mono font-bold text-emerald-600 tracking-widest text-center select-all">
                {{ formatDisplayCode(post.friend_code) }}
              </p>
            </div>
            
            <!-- Intent Tags -->
            <div v-if="getPostIntents(post.regions).length > 0" class="flex flex-wrap gap-1.5 mb-2">
              <span 
                v-for="intentId in getPostIntents(post.regions)" 
                :key="`${post.id}-intent-${intentId}`" 
                class="px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 border"
                :class="getIntentColor(intentId)"
              >
                <span>{{ getIntentIcon(intentId) }}</span>
                <span>{{ getIntentLabel(intentId) }}</span>
              </span>
            </div>

            <!-- Region Tags -->
            <div v-if="getPostRegions(post.regions).length > 0" class="flex flex-wrap gap-1.5 mb-3">
              <span v-for="region in getPostRegions(post.regions)" :key="`${post.id}-region-${region}`" class="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded text-xs font-bold">
                📍 {{ region.split(' ')[0] }}
              </span>
            </div>
            
            <p v-if="post.message" class="text-gray-600 text-sm leading-relaxed bg-white/50 rounded-lg p-3">
              {{ post.message }}
            </p>
            
            <!-- Delete Button -->
            <div v-if="user && post.user_id === user.id" class="mt-3 pt-3 border-t border-gray-100">
              <button
                @click="deletePost(post.id)"
                class="text-xs text-red-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ $t('friends.delete') }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Copy Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div
          v-if="showCopyToast"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-2 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          {{ $t('friends.toast_copied') }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'

interface FriendPost {
  id: string;
  user_id: string;
  username: string;
  friend_code: string;
  message: string | null;
  regions: string[] | null;
  created_at: string;
}

const supabase = useSupabaseClient();
const authStore = useAuthStore();
const { t } = useI18n();
const user = computed(() => authStore.user.value);

const posts = ref<FriendPost[]>([]);
const loading = ref(false); // 預設不載入，等待 onMounted
const error = ref<string | null>(null);
const submitting = ref(false);
const showCopyToast = ref(false);

// 導入地區常數
import { FRIEND_REGIONS, ALL_REGION_OPTIONS } from '~/constants/regions';
import { FRIEND_INTENTS, ALL_INTENT_OPTIONS } from '~/constants/intents';

const newPost = ref({
  username: '',
  friendCode: '',
  message: '',
  regions: [] as string[],
  intents: [] as string[],
});

// 切換選擇目的
const toggleIntent = (intentId: string) => {
  const idx = newPost.value.intents.indexOf(intentId);
  if (idx > -1) {
    newPost.value.intents.splice(idx, 1);
  } else if (newPost.value.intents.length < 2) {
    newPost.value.intents.push(intentId);
  }
};

// 切換選擇地區
const toggleRegion = (region: string) => {
  const idx = newPost.value.regions.indexOf(region);
  if (idx > -1) {
    newPost.value.regions.splice(idx, 1);
  } else if (newPost.value.regions.length < 3) {
    newPost.value.regions.push(region);
  }
};

// 驗證好友代碼格式 (12位數字)
const isValidFriendCode = computed(() => {
  const digits = newPost.value.friendCode.replace(/\D/g, '');
  return digits.length === 12;
});

// 格式化輸入的好友代碼
const formatFriendCode = (e: Event) => {
  const input = e.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, ''); // 只保留數字
  if (value.length > 12) value = value.slice(0, 12);
  
  // 格式化為 XXXX XXXX XXXX
  const parts = [];
  for (let i = 0; i < value.length; i += 4) {
    parts.push(value.slice(i, i + 4));
  }
  newPost.value.friendCode = parts.join(' ');
};

// 顯示格式化的代碼
const formatDisplayCode = (code: string) => {
  if (!code) return '';
  const digits = code.replace(/\D/g, '');
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
};

// Load posts on mount
onMounted(async () => {
  await fetchPosts();
  
  // Pre-fill username from user metadata
  if (user.value) {
    const metadata = user.value.user_metadata || user.value;
    const email = user.value.email || metadata?.email || '';
    newPost.value.username = metadata?.username || metadata?.name || email.split('@')[0] || '';
  }
});

const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 取得 Supabase 設定 (從現有的 Nuxt Client 提取)
    const sbUrl = (supabase as any).supabaseUrl || (supabase as any).auth?.url;
    const sbKey = (supabase as any).supabaseKey || (supabase as any).auth?.headers?.['apikey'];

    if (!sbUrl || !sbKey) {
      throw new Error('無法取得 Supabase 連線設定');
    }

    // 建立一個獨立的 Client 來繞過 Nuxt 模組可能的狀態死鎖
    const manualClient = createClient(sbUrl, sbKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    // 使用手動 Client 查詢
    let query = manualClient
      .from('friend_posts')
      .select('*')
      .order('created_at', { ascending: false });
      
    // 合併篩選邏輯：地區 + 目的
    // 因為在資料庫中我們把 regions 和 intents 都存在同一個叫做 `regions` 的字串陣列欄位裡，
    // 所以查尋條件都可以合併在一起做 overlaps。
    let targetTags: string[] = [...selectedRegionFilters.value, ...selectedIntentFilters.value];
    
    // 把只有選大類、沒選細項的大類地區全部加入
    selectedCategories.value.forEach(cat => {
      const optionsForCat = getOptionsForCategory(cat);
      // 如果這個大類的細項都沒有被選，代表使用者想要整個大類
      const hasSpecificSelection = optionsForCat.some(opt => selectedRegionFilters.value.includes(opt));
      if (!hasSpecificSelection) {
        targetTags.push(...optionsForCat);
      }
    });

    // 去重複
    targetTags = [...new Set(targetTags)];

    if (targetTags.length > 0) {
      // 在 Supabase 中尋找 regions 陣列中包含 targetTags 任何一個的 post
      query = query.overlaps('regions', targetTags);
    }

    const { data, error: err } = await query;

    if (err) throw err;
    posts.value = data || [];
  } catch (e: any) {
    console.error('[Friends] Failed to fetch posts:', e.message);
    error.value = e.message || t('friends.error');
  } finally {
    loading.value = false;
  }
};

const submitPost = async () => {
  // user 可能是 JWT payload，id 在 sub 或 id 欄位
  const userId = user.value?.id || user.value?.sub;
  
  if (!userId) {
    alert(t('friends.alerts.login_first'));
    return;
  }
  if (!isValidFriendCode.value) {
    alert(t('friends.alerts.invalid_code'));
    return;
  }
  if (!newPost.value.username.trim()) {
    alert(t('friends.alerts.enter_name'));
    return;
  }
  
  submitting.value = true;
  
  try {
    // 儲存時移除空格
    const cleanCode = newPost.value.friendCode.replace(/\s/g, '');
    
    // 使用 session 中的 user id
    const { data: sessionData } = await supabase.auth.getSession();
    const actualUserId = sessionData?.session?.user?.id;
    if (!actualUserId) {
      throw new Error('No authenticated session found');
    }
    
    // 為了不更動後端資料庫架構，我們將 intents 和 regions 結合存在 `regions` 欄位中
    const combinedTags = [...newPost.value.regions, ...newPost.value.intents];
    
    const { data, error } = await supabase.from('friend_posts').insert({
      user_id: actualUserId,
      username: newPost.value.username.trim(),
      friend_code: cleanCode,
      message: newPost.value.message.trim() || null,
      regions: combinedTags.length > 0 ? combinedTags : null,
    }).select();
    
    if (error) {
      throw error;
    }
    
    // Reset form and refresh
    newPost.value.message = '';
    newPost.value.regions = [];
    newPost.value.intents = [];
    await fetchPosts();
  } catch (e: any) {
    console.error('Failed to submit post:', e);
    alert(`發布失敗：${e.message || '請稍後再試'}`);
  } finally {
    submitting.value = false;
    console.log('[Friends] Done, submitting set to false');
  }
};

const deletePost = async (postId: string) => {
  if (!confirm(t('friends.alerts.confirm_delete'))) return;
  
  try {
    const { error } = await supabase
      .from('friend_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    await fetchPosts();
  } catch (e) {
    console.error('Failed to delete post:', e);
  }
};

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code.replace(/\s/g, ''));
    showCopyToast.value = true;
    setTimeout(() => {
      showCopyToast.value = false;
    }, 2000);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return t('time.just_now');
  if (minutes < 60) return t('time.min_ago', { n: minutes });
  if (hours < 24) return t('time.hour_ago', { n: hours });
  if (days < 7) return t('time.day_ago', { n: days });
  
  return date.toLocaleDateString('zh-TW');
};

// --- Recommendation Logic ---
const recommendedPosts = ref<FriendPost[]>([]);
const recommendationQueue = ref<FriendPost[]>([]);
let recommendTimer: any = null;

// Fisher-Yates Shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const refreshRecommendations = () => {
  // 不論有沒有篩選，少於或等於10個直接全秀(打亂排列)，不輪播
  if (posts.value.length <= 10) {
    recommendedPosts.value = shuffleArray(posts.value);
    return;
  }

  const needed = 10;
  const nextBatch: FriendPost[] = [];

  // 如果 Queue 不夠，進行補充邏輯
  if (recommendationQueue.value.length < needed) {
    // 1. 先把 Queue 剩下的都拿出來
    nextBatch.push(...recommendationQueue.value);
    
    // 2. 產生新的一輪洗牌名單 (基於過濾後的清單)
    const newShuffled = shuffleArray(posts.value);
    
    // 3. 計算還缺多少
    const remainingNeeded = needed - nextBatch.length;
    
    // 從新名單取剩下的數量
    const fill = newShuffled.slice(0, remainingNeeded);
    nextBatch.push(...fill);
    
    // 剩下的放回 Queue
    recommendationQueue.value = newShuffled.slice(remainingNeeded);
  } else {
    // Queue 足夠，直接切 10 個
    const batch = recommendationQueue.value.slice(0, needed);
    nextBatch.push(...batch);
    // 更新 Queue (移除已取出的)
    recommendationQueue.value = recommendationQueue.value.slice(needed);
  }

  recommendedPosts.value = nextBatch;
};

const startRecommendationTimer = () => {
  if (recommendTimer) clearInterval(recommendTimer);
  // 首次執行
  refreshRecommendations();
  // 每 10 秒刷新
  recommendTimer = setInterval(refreshRecommendations, 10000);
};

// 監聽 posts 變更，重新建立 Queue
watch(posts, (newPosts) => {
  if (newPosts.length > 0) {
    // 推薦系統應該基於全部使用者，所以如果目前沒有篩選條件，就更新推薦
    if (selectedCategories.value.length === 0 && selectedRegionFilters.value.length === 0) {
      recommendationQueue.value = shuffleArray(newPosts);
      startRecommendationTimer();
    }
  }
});

const selectedCategories = ref<string[]>([]);
const selectedRegionFilters = ref<string[]>([]);
const selectedIntentFilters = ref<string[]>([]);

// Helper Functions for separating regions and intents on display
const getPostRegions = (tags: string[] | null) => {
  if (!tags) return [];
  return tags.filter(tag => ALL_REGION_OPTIONS.includes(tag));
};

const getPostIntents = (tags: string[] | null) => {
  if (!tags) return [];
  return tags.filter(tag => ALL_INTENT_OPTIONS.includes(tag));
};

const getIntentObj = (id: string) => FRIEND_INTENTS.find(i => i.id === id);
const getIntentIcon = (id: string) => getIntentObj(id)?.icon || '';
const getIntentLabel = (id: string) => getIntentObj(id)?.label || id;
const getIntentColor = (id: string) => getIntentObj(id)?.colorClass || 'bg-gray-100 text-gray-800 border-gray-200';

const getOptionsForCategory = (label: string) => {
  return FRIEND_REGIONS.find(g => g.label === label)?.options || [];
};

const toggleCategoryFilter = (cat: string) => {
  const idx = selectedCategories.value.indexOf(cat);
  if (idx > -1) {
    selectedCategories.value.splice(idx, 1);
    // 移除該分類下已選的細項
    const options = getOptionsForCategory(cat);
    selectedRegionFilters.value = selectedRegionFilters.value.filter(r => !options.includes(r));
  } else {
    selectedCategories.value.push(cat);
  }
};

const toggleRegionFilter = (region: string) => {
  const idx = selectedRegionFilters.value.indexOf(region);
  if (idx > -1) {
    selectedRegionFilters.value.splice(idx, 1);
  } else {
    selectedRegionFilters.value.push(region);
  }
};

const toggleIntentFilter = (intentId: string) => {
  const idx = selectedIntentFilters.value.indexOf(intentId);
  if (idx > -1) {
    selectedIntentFilters.value.splice(idx, 1);
  } else {
    selectedIntentFilters.value.push(intentId);
  }
};

const clearRegionFilters = () => {
  selectedCategories.value = [];
  selectedRegionFilters.value = [];
};

const clearIntentFilters = () => {
  selectedIntentFilters.value = [];
};

const clearAllFilters = () => {
  clearRegionFilters();
  clearIntentFilters();
};

// 當選擇的地區或分區改變時，重新 fetch
watch([selectedRegionFilters, selectedCategories, selectedIntentFilters], () => {
  fetchPosts();
}, { deep: true });

onUnmounted(() => {
  if (recommendTimer) clearInterval(recommendTimer);
});
</script>
