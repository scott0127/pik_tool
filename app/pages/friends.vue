<template>
  <div class="friends-page min-h-screen py-8 px-4">
    <div class="friends-page-shell max-w-6xl mx-auto">
      <!-- Page Header -->
      <header class="friends-page-header mb-8 animate-slide-up">
        <div class="friends-page-heading">
          <span class="friends-page-mark">
            <Icon name="lucide:users-round" class="w-5 h-5" />
          </span>
          <div>
            <h1 class="text-3xl font-extrabold text-slate-900">{{ $t('friends.title') }}</h1>
            <p class="text-slate-500 mt-1">{{ $t('friends.subtitle') }}</p>
          </div>
        </div>
        <div class="friends-page-count" aria-live="polite">
          <span>{{ $t('friends.total_players') }}</span>
          <strong>{{ totalPostCount ?? '—' }}</strong>
        </div>
      </header>

      <!-- Info Banner -->
      <div class="friends-tips-panel p-4 mb-6 animate-slide-up flex items-start gap-3" style="animation-delay: 0.05s;">
        <span class="friends-tips-icon">
          <Icon name="lucide:lightbulb" class="w-4 h-4" />
        </span>
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
      <div v-if="user" class="friend-compose-panel glass rounded-3xl p-6 sm:p-8 mb-10 slide-up relative overflow-visible z-10">
        <div class="relative z-10">
          <div class="friend-compose-heading flex items-center gap-3 mb-8">
            <span class="friend-compose-icon">
              <Icon name="lucide:user-round-plus" class="w-5 h-5" />
            </span>
            <h2 class="text-2xl font-extrabold text-gray-800 tracking-tight">
              {{ $t('friends.form.title') }}
            </h2>
          </div>
          
          <form @submit.prevent="submitPost" class="space-y-7">
            <!-- Basic Info: Name & Code -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name Input -->
              <div class="group">
                <label class="block text-[15px] font-bold text-gray-700 mb-2 ml-1">
                  <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-200"></span>
                    {{ $t('friends.form.label_name') }}
                  </span>
                </label>
                <div class="relative transition-transform duration-300 group-hover:-translate-y-0.5">
                  <input
                    v-model="newPost.username"
                    type="text"
                    required
                    maxlength="20"
                    class="input-field pl-11 text-lg font-bold"
                    :placeholder="$t('friends.form.placeholder_name')"
                  >
                  <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Code Input -->
              <div class="group">
                <label class="block text-[15px] font-bold text-gray-700 mb-2 ml-1">
                  <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-200"></span>
                    {{ $t('friends.form.label_code') }}
                  </span>
                </label>
                <div class="relative transition-transform duration-300 group-hover:-translate-y-0.5">
                  <input
                    v-model="newPost.friendCode"
                    type="tel"
                    required
                    class="input-field pl-11 text-lg font-mono tracking-[0.15em] font-bold transition-all duration-300"
                    :class="isValidFriendCode ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100 bg-emerald-50/40 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'text-gray-700 focus:border-rose-400 focus:ring-rose-100 group-hover:border-rose-200'"
                    placeholder="1234 5678 9012"
                    @input="formatFriendCode"
                  >
                  <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-all duration-300" :class="isValidFriendCode ? 'text-emerald-500 scale-110 drop-shadow-sm' : 'text-gray-400 group-focus-within:text-rose-500'" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
            
            <!-- Intent Selector -->
            <div>
              <div class="flex items-center justify-between mb-3 ml-1">
                <label class="block text-[15px] font-bold text-gray-700">
                  <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-200"></span>
                    交友目的
                    <span class="text-sm font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md ml-1">最多 2 個</span>
                  </span>
                </label>
                <span v-if="newPost.intents.length === 2" class="text-xs text-white font-bold bg-amber-500 px-2.5 py-1 rounded-full pop-in shadow-sm shadow-amber-200">
                  已達上限
                </span>
              </div>
              
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  v-for="intent in FRIEND_INTENTS"
                  :key="intent.id"
                  type="button"
                  @click="toggleIntent(intent.id)"
                  :disabled="!newPost.intents.includes(intent.id) && newPost.intents.length >= 2"
                  class="friend-intent-option relative overflow-hidden group p-3.5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[80px] cursor-pointer active:translate-y-1 active:shadow-inner"
                  :class="[
                    newPost.intents.includes(intent.id) 
                      ? `${intent.colorClass.replace(/bg-\w+-50/, 'bg-white').replace(/border-\w+-200/, 'border-[color:currentColor]').replace(/text-\w+-600/, intent.colorClass.match(/text-\w+-600/)?.[0] || 'text-gray-800')} shadow-md scale-[1.03]`
                      : 'bg-white/80 border-transparent text-gray-500 hover:bg-white hover:border-gray-200 hover:shadow-md disabled:opacity-50 hover:-translate-y-1'
                  ]"
                >
                  <!-- Active Background Glow -->
                  <div v-if="newPost.intents.includes(intent.id)" class="absolute inset-0 opacity-10 bg-currentColor"></div>
                  
                  <span class="text-2xl transition-transform duration-300 group-hover:scale-125 group-active:scale-95 z-10 drop-shadow-sm">{{ intent.icon }}</span>
                  <span class="text-sm font-extrabold tracking-wide z-10">{{ intent.label }}</span>
                </button>
              </div>
              
              <!-- Custom Postcard Input -->
              <div v-if="newPost.intents.includes('postcard')" class="mt-3 slide-up">
                <div class="bg-blue-50 border-2 border-blue-200 p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-inner">
                  <span class="text-[15px] font-extrabold text-blue-800 flex-shrink-0 whitespace-nowrap px-2">我想要 👉</span>
                  <input 
                    v-model="newPost.postcardInput" 
                    type="text" 
                    class="input-field !py-2 !px-4 !bg-white !shadow-sm !rounded-xl !text-blue-900 font-bold placeholder-blue-300 !border-blue-200 focus:!border-blue-400 focus:!ring-blue-100 flex-1 text-center sm:text-left text-lg" 
                    placeholder="台北、火車、郵局..." 
                    maxlength="10"
                  />
                  <span class="text-[15px] font-extrabold text-blue-800 flex-shrink-0 whitespace-nowrap px-2">明信片 💌</span>
                </div>
              </div>
            </div>
            
            <!-- Toggle Advanced Settings (iOS Style) -->
            <div class="pt-4 pb-2">
              <button 
                type="button" 
                @click="showAdvancedSettings = !showAdvancedSettings"
                class="friend-advanced-toggle group flex items-center justify-between w-full p-4 rounded-2xl bg-white/70 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]"
              >
                <div class="flex items-center gap-3.5">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300" :class="showAdvancedSettings ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex flex-col items-start gap-0.5">
                    <span class="text-[15px] font-bold transition-colors duration-300" :class="showAdvancedSettings ? 'text-emerald-600' : 'text-gray-800 group-hover:text-emerald-600'">{{ showAdvancedSettings ? '隱藏進階選項' : '新增常駐地區與留言' }}</span>
                    <span v-show="!showAdvancedSettings" class="text-[12px] font-semibold text-gray-400">完整名片能獲得更精準的媒合</span>
                  </div>
                </div>
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 group-hover:text-emerald-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" :class="showAdvancedSettings ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
            
            <!-- Advanced Settings Container -->
            <div v-show="showAdvancedSettings" class="space-y-7 origin-top transition-all duration-300">
              <div class="w-full h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
              
              <!-- Region Selector -->
            <div>
              <div class="flex items-center justify-between mb-3 ml-1">
                <label class="block text-[15px] font-bold text-gray-700">
                  <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200"></span>
                    常駐地區
                    <span class="text-sm font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md ml-1">最多 2 個</span>
                  </span>
                </label>
                <span v-if="newPost.regions.length === 2" class="text-xs text-white font-bold bg-emerald-500 px-2.5 py-1 rounded-full pop-in shadow-sm shadow-emerald-200">
                  已達上限
                </span>
              </div>
              
              <div class="friend-region-panel bg-gray-50/80 rounded-3xl p-4 sm:p-5 border border-gray-200/60 shadow-inner space-y-5">
                <div v-for="group in FRIEND_REGIONS" :key="group.label" class="w-full">
                  <h4 class="text-xs font-black text-gray-400/80 mb-2.5 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                    <span>{{ group.label }}</span>
                    <span class="h-px bg-gray-200 flex-1 rounded-full"></span>
                  </h4>
                  <div class="flex flex-wrap gap-2.5">
                    <button
                      v-for="region in group.options"
                      :key="region"
                      type="button"
                      @click="toggleRegion(region)"
                      :disabled="!newPost.regions.includes(region) && newPost.regions.length >= 2"
                      class="friend-region-option relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 select-none active:scale-[0.92] flex-grow sm:flex-grow-0 text-center border-2 overflow-hidden group/btn"
                      :class="[
                        newPost.regions.includes(region) 
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] scale-[1.02] active:bg-emerald-600 active:shadow-inner' 
                          : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:shadow-md shadow-sm disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none active:bg-gray-100'
                      ]"
                    >
                      <!-- Sublet click ripple/glow effect overlay -->
                      <div v-show="newPost.regions.includes(region)" class="absolute inset-0 bg-white opacity-0 group-active/btn:opacity-20 transition-opacity"></div>
                      <span class="relative z-10">{{ region }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Textarea -->
            <div class="group">
              <label class="block text-[15px] font-bold text-gray-700 mb-2 ml-1">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-200"></span>
                  想說的話 
                  <span class="text-sm font-normal text-gray-400 ml-1">(選填)</span>
                </span>
              </label>
              <div class="relative transition-transform duration-300 group-hover:-translate-y-0.5">
                <textarea
                  v-model="newPost.message"
                  rows="3"
                  maxlength="100"
                  class="input-field resize-none !px-5 !py-4 font-medium text-[15px]"
                  :placeholder="$t('friends.form.placeholder_message')"
                ></textarea>
                <div class="absolute bottom-3 right-4 text-xs font-black px-2.5 py-1 rounded-lg transition-colors" 
                     :class="newPost.message.length >= 90 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'">
                  {{ newPost.message.length }} / 100
                </div>
              </div>
            </div>
            </div>
            <!-- End of Advanced Settings -->

            <!-- Submit Button -->
            <div class="pt-4 flex justify-end">
              <button
                type="button"
                @click="submitPost"
                :disabled="submitting || !isValidFriendCode || !newPost.username.trim()"
                class="btn-primary w-full sm:w-auto sm:min-w-[240px] !py-4 !text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none"
              >
                <svg v-if="submitting" class="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <template v-else>
                  <span class="tracking-wide">{{ $t('friends.form.submit') }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                  </svg>
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Login Prompt -->
      <div v-else class="friend-login-panel glass rounded-3xl p-8 mb-8 text-center animate-slide-up" style="animation-delay: 0.1s;">
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
      <section
        v-if="recommendedPosts.length > 0"
        class="friend-showcase mb-10 animate-slide-up"
        style="animation-delay: 0.15s;"
        role="region"
        :aria-label="$t('friends.carousel_label')"
        aria-roledescription="carousel"
        @mouseenter="setRecommendationInteraction(true)"
        @mouseleave="setRecommendationInteraction(false)"
        @focusin="setRecommendationInteraction(true)"
        @focusout="handleRecommendationFocusOut"
      >
        <header class="friend-showcase-header">
          <div class="friend-showcase-heading">
            <span class="friend-showcase-mark">
              <Icon name="lucide:sparkles" class="w-4 h-4" />
            </span>
            <div>
              <h2>{{ $t('friends.rec_title') }}</h2>
              <p>{{ $t('friends.rec_update') }}</p>
            </div>
          </div>
          <div class="friend-carousel-controls">
            <button
              type="button"
              class="friend-carousel-control"
              :aria-label="$t('friends.carousel_prev')"
              :title="$t('friends.carousel_prev')"
              @click="scrollRecommendation(-1)"
            >
              <Icon name="lucide:chevron-left" class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="friend-carousel-control"
              :class="{ 'is-active': recommendationAutoplay }"
              :aria-label="recommendationAutoplay ? $t('friends.carousel_pause') : $t('friends.carousel_play')"
              :title="recommendationAutoplay ? $t('friends.carousel_pause') : $t('friends.carousel_play')"
              @click="toggleRecommendationAutoplay"
            >
              <Icon :name="recommendationAutoplay ? 'lucide:pause' : 'lucide:play'" class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="friend-carousel-control"
              :aria-label="$t('friends.carousel_next')"
              :title="$t('friends.carousel_next')"
              @click="scrollRecommendation(1)"
            >
              <Icon name="lucide:chevron-right" class="w-4 h-4" />
            </button>
          </div>
        </header>

        <div
          ref="recommendationTrack"
          class="friend-carousel-track scrollbar-hide"
          aria-live="off"
          @scroll.passive="handleRecommendationScroll"
          @touchstart.passive="pauseRecommendationForTouch"
        >
          <article
            v-for="(post, index) in recommendedPosts"
            :key="`rec-${post.id}`"
            class="friend-recommendation-card group"
            :class="{ 'is-current': activeRecommendationIndex === index }"
          >
            <!-- Header: Avatar + User Info -->
            <div class="flex items-center gap-2.5 mb-3">
              <div class="relative shrink-0">
                <div class="friend-recommendation-avatar">
                  <img :src="getPikminAvatar(post.username)" :alt="post.username" class="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2px] border-white shadow-sm"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-extrabold text-gray-900 text-[14px] truncate leading-tight transition-colors duration-300 group-hover:text-emerald-600">{{ post.username }}</h3>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">{{ formatDate(post.created_at) }}</p>
              </div>
            </div>

            <!-- Friend Code Box (iOS style inset) -->
            <button
              type="button"
              @click="copyCode(post.friend_code)"
              class="friend-recommendation-code group/code"
              :title="$t('friends.copy_tooltip')"
            >
              <span class="font-mono text-[12px] font-extrabold text-emerald-600 tracking-wider pl-1.5 flex-1 text-center group-hover/code:scale-105 transition-transform origin-left">
                {{ formatDisplayCode(post.friend_code) }}
              </span>
              <Icon name="lucide:copy" class="w-3.5 h-3.5 shrink-0" />
            </button>

            <!-- Tags Section -->
            <div class="flex-1 flex flex-col gap-2 mb-3">
              <div v-if="getPostIntents(post.regions).length > 0" class="flex flex-wrap gap-1">
                <span 
                  v-for="intentId in getPostIntents(post.regions)" 
                  :key="`rec-${post.id}-intent-${intentId}`" 
                  class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-sm border border-black/5 transition-transform hover:scale-105 cursor-default"
                  :class="getIntentColor(intentId)"
                >
                  <span class="text-[12px] leading-none drop-shadow-sm">{{ getIntentIcon(intentId) }}</span>
                  <span class="leading-none">{{ getIntentLabel(intentId) }}</span>
                </span>
              </div>
              <div v-if="getPostRegions(post.regions).length > 0" class="flex flex-wrap gap-1">
                <span v-for="region in getPostRegions(post.regions)" :key="`rec-${post.id}-region-${region}`" class="px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200/50 rounded-lg text-[10px] font-extrabold shadow-sm transition-transform hover:scale-105 cursor-default">
                  {{ region.split(' ')[0] }}
                </span>
              </div>
            </div>

            <!-- Message (iOS style bubble) -->
            <div v-if="post.message" class="friend-recommendation-message">
              <p class="text-[11px] text-gray-600 font-bold leading-relaxed line-clamp-2 relative z-10" :title="post.message">{{ post.message }}</p>
            </div>
            
            <div v-else class="flex-1"></div>

            <!-- Action Button -->
            <button
              @click="copyCode(post.friend_code)"
              class="friend-recommendation-action group/btn"
            >
              <span class="group-hover/btn:scale-110 transition-transform">{{ $t('friends.add_friend') }}</span>
              <Icon name="lucide:arrow-up-right" class="w-3.5 h-3.5" />
            </button>
          </article>
        </div>

        <footer class="friend-carousel-footer">
          <div class="friend-carousel-dots" aria-hidden="true">
            <span
              v-for="(_, index) in recommendedPosts"
              :key="`rec-dot-${index}`"
              class="friend-carousel-dot"
              :class="{ 'is-active': activeRecommendationIndex === index }"
            />
          </div>
          <span class="friend-carousel-position">
            {{ activeRecommendationIndex + 1 }} / {{ recommendedPosts.length }}
          </span>
        </footer>
      </section>

      <!-- Posts Section -->
      <section class="friend-directory animate-slide-up" style="animation-delay: 0.2s;">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-3">
            <Icon name="lucide:contact-round" class="h-5 w-5 text-emerald-600" />
            {{ $t('friends.all_players') }}
            <span class="friend-directory-count">
              {{ filteredPostCount ?? '—' }}
            </span>
          </h2>
          
          <!-- Refresh Button -->
          <button
            @click="() => fetchPosts()"
            :disabled="loading"
            class="friend-directory-refresh"
            :title="$t('friends.refresh')"
          >
            <Icon name="lucide:refresh-cw" class="h-4 w-4" :class="{ 'animate-spin': loading }" />
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="friend-filter-panel mb-6 p-4 flex flex-col gap-4">
          <!-- Intents Filter -->
          <div>
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
              <Icon name="lucide:target" class="w-4 h-4 text-emerald-600" /> 目的篩選：
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                @click="clearIntentFilters"
                class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm"
                :class="selectedIntentFilters.length === 0 ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'"
              >
                所有目的
              </button>
              <button
                v-for="intent in FRIEND_INTENTS"
                :key="`filter-intent-${intent.id}`"
                @click="toggleIntentFilter(intent.id)"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1"
                :class="selectedIntentFilters.includes(intent.id) ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'"
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
              <Icon name="lucide:map-pinned" class="w-4 h-4 text-emerald-600" /> 地區篩選：
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
          <button @click="() => fetchPosts()" class="mt-4 text-sm underline hover:text-red-700">{{ $t('friends.retry') }}</button>
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
        <div v-else class="friend-directory-grid">
          <div
            v-for="(post, index) in posts"
            :key="post.id"
            class="friend-directory-card animate-pop-in"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <!-- User Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3.5">
                <div class="relative shrink-0">
                  <div class="friend-directory-avatar">
                    <img :src="getPikminAvatar(post.username)" :alt="post.username" class="w-full h-full object-contain bg-white" loading="lazy" />
                  </div>
                </div>
                <div>
                  <h3 class="font-extrabold text-gray-900 text-base leading-tight">{{ post.username }}</h3>
                  <p class="text-xs font-bold text-gray-400 mt-1">{{ formatDate(post.created_at) }}</p>
                </div>
              </div>
              
              <!-- Friend Code Compact Badge -->
              <button
                type="button"
                @click="copyCode(post.friend_code)"
                class="friend-directory-code group"
                :title="$t('friends.copy_code')"
              >
                 {{ formatDisplayCode(post.friend_code) }}
                 <Icon name="lucide:copy" class="w-3.5 h-3.5" />
              </button>
            </div>
            
            <!-- Tags Row -->
            <div class="flex flex-wrap gap-2 mb-4 pl-1">
              <span 
                v-for="intentId in getPostIntents(post.regions)" 
                :key="`${post.id}-intent-${intentId}`" 
                class="px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm border border-black/5"
                :class="getIntentColor(intentId)"
              >
                <span class="text-[14px] leading-none drop-shadow-sm">{{ getIntentIcon(intentId) }}</span>
                <span>{{ getIntentLabel(intentId) }}</span>
              </span>
              <span v-for="region in getPostRegions(post.regions)" :key="`${post.id}-region-${region}`" class="friend-directory-region">
                <Icon name="lucide:map-pin" class="w-3 h-3" />
                {{ region.split(' ')[0] }}
              </span>
            </div>
            
            <!-- Message Bubble -->
            <p v-if="post.message" class="friend-directory-message">
              {{ post.message }}
            </p>
            <div v-else class="flex-1"></div>
            
            <!-- Delete Button -->
            <div v-if="user && post.user_id === user.id" class="mt-4 pt-4 border-t border-gray-100/50 flex justify-end">
              <button
                @click="deletePost(post.id)"
                class="text-xs font-extrabold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                刪除我的文章
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="posts.length > 0 && hasMorePosts" class="mt-8 flex justify-center animate-slide-up">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="bg-white/80 hover:bg-white text-emerald-600 font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all border border-emerald-100 flex items-center gap-2"
          >
            <svg v-if="loadingMore" class="animate-spin -ml-1 mr-2 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            {{ loadingMore ? $t('friends.loading') : '載入更多好友' }}
          </button>
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
const {
  getPikminAvatar,
  formatFriendCodeValue,
  formatDisplayCode,
  getPostRegions,
  getPostIntents,
  getIntentIcon,
  getIntentLabel,
  getIntentColor,
  getOptionsForCategory,
} = useFriendPostHelpers();

const posts = ref<FriendPost[]>([]);
const totalPostCount = ref<number | null>(null);
const filteredPostCount = ref<number | null>(null);
const loading = ref(false); // 預設不載入，等待 onMounted
const error = ref<string | null>(null);
const submitting = ref(false);
const showCopyToast = ref(false);

// Pagination State
const currentOffset = ref(0);
const hasMorePosts = ref(true);
const loadingMore = ref(false);
const POSTS_PER_PAGE = 20;

// --- Friends Cache (reduce Supabase egress) ---
const FRIENDS_CACHE_KEY = 'pikmin-friends-cache-v2';
const FRIENDS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

interface FriendsCache {
  data: FriendPost[];
  count: number;
  filterSig: string;
  ts: number;
}

const buildFilterSignature = (): string => {
  const parts = [
    ...selectedRegionFilters.value.sort(),
    ...selectedCategories.value.sort(),
    ...selectedIntentFilters.value.sort(),
  ];
  return parts.join('|') || '__all__';
};

const readFriendsCache = (sig: string): FriendsCache | null => {
  if (!import.meta.client) return null;
  try {
    const raw = sessionStorage.getItem(FRIENDS_CACHE_KEY);
    if (!raw) return null;
    const cache: FriendsCache = JSON.parse(raw);
    if (cache.filterSig !== sig) return null;
    if (Date.now() - cache.ts > FRIENDS_CACHE_TTL) return null;
    if (!Number.isFinite(cache.count)) return null;
    return cache;
  } catch { return null; }
};

const writeFriendsCache = (data: FriendPost[], count: number, sig: string) => {
  if (!import.meta.client) return;
  try {
    const cache: FriendsCache = { data, count, filterSig: sig, ts: Date.now() };
    sessionStorage.setItem(FRIENDS_CACHE_KEY, JSON.stringify(cache));
  } catch { /* noop */ }
};

const invalidateFriendsCache = () => {
  if (import.meta.client) sessionStorage.removeItem(FRIENDS_CACHE_KEY);
};

// 導入地區常數
import { FRIEND_REGIONS } from '~/constants/regions';
import { FRIEND_INTENTS } from '~/constants/intents';

const showAdvancedSettings = ref(false);

const newPost = ref({
  username: '',
  friendCode: '',
  message: '',
  regions: [] as string[],
  intents: [] as string[],
  postcardInput: '',
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
  newPost.value.friendCode = formatFriendCodeValue(input.value);
};

// Load posts on mount
onMounted(async () => {
  if (import.meta.client) {
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    recommendationAutoplay.value = !reducedMotionQuery.matches;
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  }

  await Promise.all([fetchPosts(), fetchTotalPostCount()]);
  
  // Pre-fill username from user metadata
  if (user.value) {
    const metadata = user.value.user_metadata || user.value;
    const email = user.value.email || metadata?.email || '';
    newPost.value.username = metadata?.username || metadata?.name || email.split('@')[0] || '';
  }
});

const fetchTotalPostCount = async () => {
  try {
    const { count, error: countError } = await supabase
      .from('friend_posts')
      .select('id', { count: 'exact', head: true });

    if (countError) throw countError;
    totalPostCount.value = count ?? 0;
  } catch (countError) {
    console.error('[Friends] Failed to fetch total count:', countError);
  }
};

const fetchPosts = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    currentOffset.value = 0;
  }
  error.value = null;
  
  try {
    // Check cache for first page (non-loadMore) requests
    if (!isLoadMore) {
      const sig = buildFilterSignature();
      const cached = readFriendsCache(sig);
      if (cached) {
        posts.value = cached.data;
        filteredPostCount.value = cached.count;
        hasMorePosts.value = cached.data.length < cached.count;
        if (import.meta.dev) console.debug('[Friends] Using cached data:', cached.data.length, 'posts');
        loading.value = false;
        return;
      }
    }

    let query = supabase
      .from('friend_posts')
      .select('id,user_id,username,friend_code,message,regions,created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(currentOffset.value, currentOffset.value + POSTS_PER_PAGE - 1);
      
    // 合併篩選邏輯：地區 + 目的
    let targetTags: string[] = [...selectedRegionFilters.value, ...selectedIntentFilters.value];
    
    selectedCategories.value.forEach(cat => {
      const optionsForCat = getOptionsForCategory(cat);
      const hasSpecificSelection = optionsForCat.some(opt => selectedRegionFilters.value.includes(opt));
      if (!hasSpecificSelection) {
        targetTags.push(...optionsForCat);
      }
    });

    targetTags = [...new Set(targetTags)];

    if (targetTags.length > 0) {
      query = query.overlaps('regions', targetTags);
    }

    const { data, error: err, count } = await query;

    if (err) throw err;
    
    if (data) {
      const resultCount = count ?? data.length;
      filteredPostCount.value = resultCount;
      hasMorePosts.value = currentOffset.value + data.length < resultCount;
      
      if (isLoadMore) {
        posts.value.push(...data);
      } else {
        posts.value = data;
        // Save to cache (first page only)
        writeFriendsCache(data, resultCount, buildFilterSignature());
      }
    } else {
      hasMorePosts.value = false;
      filteredPostCount.value = count ?? 0;
      if (!isLoadMore) posts.value = [];
    }
  } catch (e: any) {
    console.error('[Friends] Failed to fetch posts:', e.message);
    error.value = e.message || t('friends.error');
  } finally {
    if (isLoadMore) {
      loadingMore.value = false;
    } else {
      loading.value = false;
    }
  }
};

const loadMore = async () => {
  if (loadingMore.value || !hasMorePosts.value) return;
  currentOffset.value += POSTS_PER_PAGE;
  await fetchPosts(true);
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
    const finalIntents = newPost.value.intents.map(intentId => {
      // 處理客製化明信片
      if (intentId === 'postcard' && newPost.value.postcardInput.trim()) {
        return `postcard:${newPost.value.postcardInput.trim()}`;
      }
      return intentId;
    });

    // 如果有客製化明信片，同時保留 'postcard' base tag 讓搜尋可以 match
    if (newPost.value.intents.includes('postcard') && newPost.value.postcardInput.trim()) {
      if (!finalIntents.includes('postcard')) {
        finalIntents.push('postcard');
      }
    }

    const combinedTags = [...newPost.value.regions, ...finalIntents];
    
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
    newPost.value.postcardInput = '';
    invalidateFriendsCache();
    await Promise.all([fetchPosts(), fetchTotalPostCount()]);
  } catch (e: any) {
    console.error('Failed to submit post:', e);
    alert(`發布失敗：${e.message || '請稍後再試'}`);
  } finally {
    submitting.value = false;
    if (import.meta.dev) console.debug('[Friends] Done, submitting set to false');
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
    invalidateFriendsCache();
    await Promise.all([fetchPosts(), fetchTotalPostCount()]);
  } catch (e) {
    console.error('Failed to delete post:', e);
  }
};

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code.replace(/\s/g, ''));
    showCopyToast.value = true;
    if (copyToastTimer) clearTimeout(copyToastTimer);
    copyToastTimer = setTimeout(() => {
      showCopyToast.value = false;
      copyToastTimer = null;
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
const recommendationTrack = ref<HTMLElement | null>(null);
const activeRecommendationIndex = ref(0);
const recommendationAutoplay = ref(true);
const recommendationInteractionPaused = ref(false);
let recommendTimer: ReturnType<typeof setInterval> | null = null;
let recommendationResumeTimer: ReturnType<typeof setTimeout> | null = null;
let recommendationScrollFrame: number | null = null;
let reducedMotionQuery: MediaQueryList | null = null;
let filterFetchTimer: ReturnType<typeof setTimeout> | null = null;
let copyToastTimer: ReturnType<typeof setTimeout> | null = null;

// Fisher-Yates Shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = newArr[i];
    const swap = newArr[j];
    if (current !== undefined && swap !== undefined) {
      newArr[i] = swap;
      newArr[j] = current;
    }
  }
  return newArr;
};

const resetRecommendationPosition = () => {
  activeRecommendationIndex.value = 0;
  nextTick(() => {
    recommendationTrack.value?.scrollTo({ left: 0, behavior: 'auto' });
  });
};

const refreshRecommendations = () => {
  // 過濾出有自我介紹(message)的玩家
  const eligiblePosts = posts.value.filter(p => p.message && p.message.trim() !== '');

  // 少量資料保留完整名單；較多資料則沿用批次佇列，避免重複曝光同一批玩家。
  if (eligiblePosts.length <= 10) {
    recommendedPosts.value = shuffleArray(eligiblePosts);
    resetRecommendationPosition();
    return;
  }

  const needed = 10;
  const nextBatch: FriendPost[] = [];

  // 如果 Queue 不夠，進行補充邏輯
  if (recommendationQueue.value.length < needed) {
    // 1. 先把 Queue 剩下的都拿出來
    nextBatch.push(...recommendationQueue.value);
    
    // 2. 產生新的一輪洗牌名單 (基於過濾後的清單)
    const newShuffled = shuffleArray(eligiblePosts);
    
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
  resetRecommendationPosition();
};

const stopRecommendationTimer = () => {
  if (!recommendTimer) return;
  clearInterval(recommendTimer);
  recommendTimer = null;
};

const getRecommendationCards = () => {
  if (!recommendationTrack.value) return [];
  return Array.from(
    recommendationTrack.value.querySelectorAll<HTMLElement>('.friend-recommendation-card'),
  );
};

const scrollRecommendationTo = (index: number, behavior: ScrollBehavior = 'smooth') => {
  const track = recommendationTrack.value;
  const cards = getRecommendationCards();
  if (!track || cards.length === 0) return;

  const safeIndex = Math.min(Math.max(index, 0), cards.length - 1);
  const card = cards[safeIndex];
  if (!card) return;

  activeRecommendationIndex.value = safeIndex;
  track.scrollTo({ left: card.offsetLeft, behavior });
};

const scrollRecommendation = (direction: -1 | 1) => {
  const maxIndex = recommendedPosts.value.length - 1;
  if (maxIndex < 1) return;

  const requestedIndex = activeRecommendationIndex.value + direction;
  if (requestedIndex > maxIndex) {
    const eligibleCount = posts.value.filter(
      post => post.message && post.message.trim() !== '',
    ).length;
    if (eligibleCount > recommendedPosts.value.length) {
      refreshRecommendations();
      return;
    }
  }

  const targetIndex = requestedIndex < 0
    ? maxIndex
    : requestedIndex > maxIndex
      ? 0
      : requestedIndex;
  scrollRecommendationTo(targetIndex);
};

const handleRecommendationScroll = () => {
  if (recommendationScrollFrame !== null) {
    cancelAnimationFrame(recommendationScrollFrame);
  }

  recommendationScrollFrame = requestAnimationFrame(() => {
    recommendationScrollFrame = null;
    const track = recommendationTrack.value;
    const cards = getRecommendationCards();
    if (!track || cards.length === 0) return;

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - track.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    activeRecommendationIndex.value = closestIndex;
  });
};

const startRecommendationTimer = () => {
  stopRecommendationTimer();
  if (
    !recommendationAutoplay.value
    || recommendationInteractionPaused.value
    || recommendedPosts.value.length <= 1
  ) return;

  recommendTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      scrollRecommendation(1);
    }
  }, 10000);
};

const setRecommendationInteraction = (paused: boolean) => {
  recommendationInteractionPaused.value = paused;
  if (paused) {
    stopRecommendationTimer();
  } else {
    startRecommendationTimer();
  }
};

const handleRecommendationFocusOut = (event: FocusEvent) => {
  const section = event.currentTarget as HTMLElement;
  const nextTarget = event.relatedTarget as Node | null;
  if (nextTarget && section.contains(nextTarget)) return;
  setRecommendationInteraction(false);
};

const pauseRecommendationForTouch = () => {
  setRecommendationInteraction(true);
  if (recommendationResumeTimer) clearTimeout(recommendationResumeTimer);
  recommendationResumeTimer = setTimeout(() => {
    recommendationResumeTimer = null;
    setRecommendationInteraction(false);
  }, 8000);
};

const toggleRecommendationAutoplay = () => {
  recommendationAutoplay.value = !recommendationAutoplay.value;
  if (recommendationAutoplay.value) {
    startRecommendationTimer();
  } else {
    stopRecommendationTimer();
  }
};

const handleReducedMotionChange = (event: MediaQueryListEvent) => {
  recommendationAutoplay.value = !event.matches;
  if (event.matches) {
    stopRecommendationTimer();
  } else {
    startRecommendationTimer();
  }
};

// 監聽 posts 變更，重新建立 Queue
watch(posts, (newPosts) => {
  if (newPosts.length > 0) {
    // 推薦系統應該基於全部使用者，所以如果目前沒有篩選條件，就更新推薦
    if (
      selectedCategories.value.length === 0
      && selectedRegionFilters.value.length === 0
      && selectedIntentFilters.value.length === 0
    ) {
      const eligiblePosts = newPosts.filter(p => p.message && p.message.trim() !== '');
      recommendationQueue.value = shuffleArray(eligiblePosts);
      refreshRecommendations();
      startRecommendationTimer();
    }
  }
});

const selectedCategories = ref<string[]>([]);
const selectedRegionFilters = ref<string[]>([]);
const selectedIntentFilters = ref<string[]>([]);

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
  if (filterFetchTimer) clearTimeout(filterFetchTimer);
  // Invalidate cache so the new filter combination goes to Supabase
  invalidateFriendsCache();
  filterFetchTimer = setTimeout(() => {
    fetchPosts();
  }, 800);
}, { deep: true });

onUnmounted(() => {
  stopRecommendationTimer();
  if (recommendationResumeTimer) {
    clearTimeout(recommendationResumeTimer);
    recommendationResumeTimer = null;
  }
  if (recommendationScrollFrame !== null) {
    cancelAnimationFrame(recommendationScrollFrame);
    recommendationScrollFrame = null;
  }
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange);
  reducedMotionQuery = null;
  if (filterFetchTimer) {
    clearTimeout(filterFetchTimer);
    filterFetchTimer = null;
  }
  if (copyToastTimer) {
    clearTimeout(copyToastTimer);
    copyToastTimer = null;
  }
});
</script>

<style scoped>
.friends-page {
  color: rgb(30 41 59);
}

.friends-page-shell {
  width: 100%;
}

.friends-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.25rem 0.15rem;
}

.friends-page-heading {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.friends-page-heading h1 {
  letter-spacing: 0;
  line-height: 1.15;
}

.friends-page-heading p {
  max-width: 34rem;
  line-height: 1.55;
}

.friends-page-mark,
.friend-compose-icon,
.friend-showcase-mark,
.friends-tips-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: rgb(15 118 110);
  background: rgb(240 253 250);
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.friends-page-mark {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  color: white;
  background: rgb(15 118 110);
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.16);
}

.friends-page-count {
  display: grid;
  grid-template-columns: auto auto;
  align-items: baseline;
  gap: 0.55rem;
  padding: 0.58rem 0.72rem;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.78);
  color: rgb(100 116 139);
  font-size: 0.72rem;
  font-weight: 750;
  white-space: nowrap;
}

.friends-page-count strong {
  color: rgb(15 118 110);
  font-size: 1rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.friends-tips-panel {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.8rem;
  background: rgba(248, 250, 252, 0.72);
  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.035);
}

.friends-tips-panel p,
.friends-tips-panel li {
  line-height: 1.55;
}

.friends-tips-panel li + li {
  margin-top: 0.18rem;
}

.friends-tips-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.62rem;
}

.friend-compose-panel,
.friend-login-panel {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.065);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.friend-compose-icon {
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 0.72rem;
}

.friend-compose-heading h2 {
  letter-spacing: 0;
}

.friend-intent-option,
.friend-advanced-toggle,
.friend-region-panel,
.friend-region-option {
  border-radius: 0.72rem;
}

.friend-intent-option {
  min-height: 4.6rem;
}

.friend-intent-option > span:last-child,
.friend-region-option {
  line-height: 1.3;
}

.friend-advanced-toggle {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.friend-region-panel {
  background: rgb(248 250 252 / 0.78);
  box-shadow: none;
}

.friend-showcase {
  padding-block: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.22);
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
}

.friend-showcase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.friend-showcase-heading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.friend-showcase-mark {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.68rem;
}

.friend-showcase-heading h2 {
  color: rgb(30 41 59);
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.3;
}

.friend-showcase-heading p {
  margin-top: 0.12rem;
  color: rgb(100 116 139);
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.4;
}

.friend-carousel-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
}

.friend-carousel-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 0.62rem;
  background: rgba(255, 255, 255, 0.9);
  color: rgb(71 85 105);
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.friend-carousel-control:hover,
.friend-carousel-control:focus-visible,
.friend-carousel-control.is-active {
  border-color: rgba(20, 184, 166, 0.42);
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  outline: none;
}

.friend-carousel-control:active {
  transform: scale(0.96);
}

.friend-carousel-track {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: clamp(15.5rem, 28vw, 18rem);
  gap: 0.7rem;
  overflow-x: auto;
  padding: 0.25rem 0.1rem 0.6rem;
  scroll-behavior: smooth;
  scroll-padding-inline: 0.1rem;
  scroll-snap-type: x mandatory;
  overscroll-behavior-inline: contain;
}

.friend-recommendation-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 19.25rem;
  padding: 0.85rem;
  overflow: hidden;
  scroll-snap-align: start;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 0.78rem;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.045);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.friend-recommendation-card:hover,
.friend-recommendation-card:focus-within,
.friend-recommendation-card.is-current {
  border-color: rgba(20, 184, 166, 0.38);
  box-shadow: 0 8px 22px rgba(15, 118, 110, 0.085);
}

.friend-recommendation-card:hover {
  transform: translateY(-1px);
}

.friend-recommendation-card:active {
  transform: scale(0.995);
}

.friend-recommendation-card h3 {
  line-height: 1.35;
}

.friend-recommendation-avatar,
.friend-directory-avatar {
  overflow: hidden;
  border: 1px solid rgba(20, 184, 166, 0.18);
  background: rgb(248 250 252);
}

.friend-recommendation-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.68rem;
}

.friend-recommendation-code {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
  margin-bottom: 0.72rem;
  padding: 0.5rem 0.62rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.62rem;
  background: rgb(248 250 252);
  color: rgb(15 118 110);
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.friend-recommendation-code:hover,
.friend-recommendation-code:focus-visible {
  border-color: rgba(20, 184, 166, 0.4);
  background: rgb(240 253 250);
  outline: none;
}

.friend-recommendation-code span,
.friend-directory-code {
  letter-spacing: 0;
}

.friend-recommendation-message {
  margin-bottom: 0.72rem;
  padding: 0.65rem 0.7rem;
  border-left: 2px solid rgb(45 212 191);
  background: rgb(248 250 252);
  line-height: 1.55;
}

.friend-recommendation-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0.35rem;
  margin-top: auto;
  padding: 0.62rem 0.7rem;
  border-radius: 0.62rem;
  background: rgb(15 118 110);
  color: white;
  font-size: 0.75rem;
  font-weight: 850;
  box-shadow: 0 5px 12px rgba(15, 118, 110, 0.16);
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.friend-recommendation-action:hover,
.friend-recommendation-action:focus-visible {
  background: rgb(13 148 136);
  outline: none;
}

.friend-recommendation-action:active {
  transform: scale(0.98);
}

.friend-carousel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 1.25rem;
  margin-top: 0.2rem;
}

.friend-carousel-dots {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
}

.friend-carousel-dot {
  width: 0.45rem;
  height: 0.45rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgb(203 213 225);
  transition:
    width 180ms ease,
    background 180ms ease;
}

.friend-carousel-dot.is-active {
  width: 1.15rem;
  background: rgb(15 118 110);
}

.friend-carousel-position {
  color: rgb(100 116 139);
  font-size: 0.68rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.friend-directory-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  padding: 0.24rem 0.45rem;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 0.55rem;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  font-size: 0.75rem;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
}

.friend-directory-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.8);
  color: rgb(100 116 139);
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.friend-directory-refresh:hover,
.friend-directory-refresh:focus-visible {
  border-color: rgba(20, 184, 166, 0.38);
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  outline: none;
}

.friend-filter-panel {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035);
}

.friend-filter-panel > div {
  display: grid;
  gap: 0.55rem;
}

.friend-filter-panel > div > div:first-child {
  margin-bottom: 0;
  line-height: 1.45;
}

.friend-filter-panel button {
  min-height: 2.15rem;
  border-radius: 0.68rem;
  line-height: 1.25;
  white-space: nowrap;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease,
    transform 120ms ease;
}

.friend-filter-panel button:hover,
.friend-filter-panel button:focus-visible {
  transform: translateY(-1px);
  outline: none;
}

.friend-filter-panel button:active {
  transform: scale(0.97);
}

.friend-directory-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.friend-directory-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 0.78rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.friend-directory-card:hover,
.friend-directory-card:focus-within {
  transform: translateY(-1px);
  border-color: rgba(20, 184, 166, 0.34);
  box-shadow: 0 9px 22px rgba(15, 118, 110, 0.07);
}

.friend-directory-card > .flex:first-child > .flex {
  min-width: 0;
}

.friend-directory-card > .flex:first-child > .flex > div:last-child {
  min-width: 0;
}

.friend-directory-card h3 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-directory-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
}

.friend-directory-code {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  flex: 0 0 auto;
  padding: 0.44rem 0.55rem;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 0.58rem;
  background: rgb(240 253 250);
  color: rgb(15 118 110);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 850;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.friend-directory-code:hover,
.friend-directory-code:focus-visible {
  border-color: rgba(15, 118, 110, 0.42);
  background: rgb(204 251 241);
  outline: none;
}

.friend-directory-region {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.48rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.52rem;
  background: rgb(248 250 252);
  color: rgb(100 116 139);
  font-size: 0.7rem;
  font-weight: 800;
}

.friend-directory-message {
  padding: 0.72rem 0.8rem;
  border-left: 2px solid rgb(45 212 191);
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.62;
}

@media (max-width: 767px) {
  .friends-page {
    padding-inline: 0.85rem;
  }

  .friends-page-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .friends-page-heading {
    align-items: flex-start;
    gap: 0.72rem;
  }

  .friends-page-mark {
    width: 2.55rem;
    height: 2.55rem;
  }

  .friends-page-heading h1 {
    font-size: 1.65rem;
  }

  .friends-page-heading p {
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .friends-page-count {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.08rem;
    min-width: 4.55rem;
    padding: 0.52rem 0.58rem;
  }

  .friends-page-count span {
    font-size: 0.66rem;
  }

  .friends-page-count strong {
    font-size: 1.08rem;
  }

  .friends-tips-panel {
    padding: 0.85rem;
  }

  .friend-compose-panel {
    padding: 1rem;
  }

  .friend-compose-heading {
    margin-bottom: 1.3rem;
  }

  .friend-compose-heading h2 {
    font-size: 1.25rem;
  }

  .friend-showcase-header {
    align-items: flex-start;
  }

  .friend-carousel-track {
    grid-auto-columns: min(82vw, 17rem);
    gap: 0.6rem;
  }

  .friend-recommendation-card {
    min-height: 18.5rem;
  }

  .friend-directory-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .friend-directory-card {
    padding: 0.9rem;
  }

  .friend-directory-card > .flex:first-child {
    gap: 0.55rem;
  }

  .friend-directory-avatar {
    width: 2.65rem;
    height: 2.65rem;
  }

  .friend-directory-code {
    padding: 0.4rem 0.45rem;
    font-size: 0.66rem;
  }

  .friend-filter-panel {
    gap: 0.9rem;
    padding: 0.85rem;
  }

  .friend-filter-panel > div {
    gap: 0.48rem;
  }

  .friend-filter-panel .flex.flex-wrap {
    gap: 0.42rem;
  }

  .friend-filter-panel button {
    min-height: 2.05rem;
    padding: 0.42rem 0.72rem;
    font-size: 0.78rem;
  }
}

@media (max-width: 390px) {
  .friends-page {
    padding-inline: 0.72rem;
  }

  .friend-carousel-controls {
    gap: 0.25rem;
  }

  .friend-carousel-control {
    width: 2.1rem;
    height: 2.1rem;
  }

  .friend-directory-code {
    font-size: 0.62rem;
  }

  .friends-page-heading h1 {
    font-size: 1.5rem;
  }

  .friends-page-heading p {
    font-size: 0.77rem;
  }

  .friends-page-count {
    min-width: 4.25rem;
    padding-inline: 0.45rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .friend-carousel-track {
    scroll-behavior: auto;
  }

  .friend-recommendation-card,
  .friend-directory-card,
  .friend-carousel-control,
  .friend-carousel-dot {
    transition-duration: 0.01ms;
  }
}
</style>
