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
      <div v-if="user" class="glass rounded-3xl p-6 sm:p-8 mb-10 slide-up relative overflow-visible z-10">
        <!-- Decorative Elements -->
        <div class="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full blur-2xl opacity-40 pointer-events-none float"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-yellow-200 to-orange-300 rounded-full blur-2xl opacity-30 pointer-events-none float-delayed"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-8">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg shadow-emerald-200/50 transform -rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
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
                  class="relative overflow-hidden group p-3.5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[80px] cursor-pointer active:translate-y-1 active:shadow-inner"
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
                class="group flex items-center justify-between w-full p-4 rounded-2xl bg-white/70 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]"
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
              
              <div class="bg-gray-50/80 rounded-3xl p-4 sm:p-5 border border-gray-200/60 shadow-inner space-y-5">
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
                      class="relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 select-none active:scale-[0.92] flex-grow sm:flex-grow-0 text-center border-2 overflow-hidden group/btn"
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
        
        <!-- Mobile Swipe Hint -->
        <p class="text-[12px] font-bold text-emerald-500 mb-3 md:hidden flex items-center gap-1.5 animate-pulse ml-1 opacity-80">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          向右滑動卡片查看更多
        </p>

        <div class="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-4 px-1 -mx-1 scrollbar-hide py-2">
          <div
            v-for="post in recommendedPosts"
            :key="`rec-${post.id}`"
            class="snap-start shrink-0 w-[240px] relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[24px] p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group flex flex-col"
          >
            <!-- Header: Avatar + User Info -->
            <div class="flex items-center gap-2.5 mb-3">
              <div class="relative shrink-0">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-50 to-teal-50 p-0.5 shadow-sm border border-emerald-100/50 group-hover:shadow-md transition-shadow duration-300">
                  <img :src="getPikminAvatar(post.username)" :alt="post.username" class="w-full h-full object-contain bg-white rounded-full group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500" loading="lazy" />
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2px] border-white shadow-sm"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-extrabold text-gray-900 text-[14px] truncate leading-tight transition-colors duration-300 group-hover:text-emerald-600">{{ post.username }}</h3>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">{{ formatDate(post.created_at) }}</p>
              </div>
            </div>

            <!-- Friend Code Box (iOS style inset) -->
            <div 
              @click="copyCode(post.friend_code)"
              class="bg-gray-50/90 rounded-[14px] p-2 mb-3 flex items-center justify-between cursor-pointer active:scale-95 transition-transform group/code shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-gray-200/50"
              :title="$t('friends.copy_tooltip')"
            >
              <span class="font-mono text-[12px] font-extrabold text-emerald-600 tracking-wider pl-1.5 flex-1 text-center group-hover/code:scale-105 transition-transform origin-left">
                {{ formatDisplayCode(post.friend_code) }}
              </span>
              <div class="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-400 group-hover/code:text-emerald-600 group-hover/code:shadow transition-all shrink-0 group-hover/code:rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
              </div>
            </div>

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
            <div v-if="post.message" class="bg-emerald-50/60 rounded-[14px] p-2.5 mb-3 border border-emerald-100/50 relative group-hover:bg-emerald-100/50 transition-colors">
              <div class="absolute -top-1 left-4 w-2 h-2 bg-emerald-50/60 rotate-45 border-l border-t border-emerald-100/50 group-hover:bg-emerald-100/50 transition-colors"></div>
              <p class="text-[11px] text-gray-600 font-bold leading-relaxed line-clamp-2 relative z-10" :title="post.message">{{ post.message }}</p>
            </div>
            
            <div v-else class="flex-1"></div>

            <!-- Action Button -->
            <button
              @click="copyCode(post.friend_code)"
              class="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-[14px] py-2.5 text-[12px] font-extrabold transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.25)] active:scale-95 flex items-center justify-center gap-1.5 mt-auto group/btn"
            >
              <span class="group-hover/btn:scale-110 transition-transform">加為好友</span>
            </button>
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
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            v-for="(post, index) in posts"
            :key="post.id"
            class="bg-white/80 backdrop-blur-xl rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-white/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 animate-pop-in flex flex-col"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <!-- User Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3.5">
                <div class="relative shrink-0">
                  <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-50 to-teal-50 p-0.5 shadow-sm border border-emerald-100/50">
                    <img :src="getPikminAvatar(post.username)" :alt="post.username" class="w-full h-full object-contain bg-white rounded-full" loading="lazy" />
                  </div>
                </div>
                <div>
                  <h3 class="font-extrabold text-gray-900 text-base leading-tight">{{ post.username }}</h3>
                  <p class="text-xs font-bold text-gray-400 mt-1">{{ formatDate(post.created_at) }}</p>
                </div>
              </div>
              
              <!-- Friend Code Compact Badge -->
              <div 
                @click="copyCode(post.friend_code)"
                class="bg-emerald-50/80 text-emerald-600 px-3 py-1.5 rounded-[12px] font-mono text-[13px] font-extrabold tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-emerald-200/50 cursor-pointer active:scale-95 transition-transform flex items-center gap-1.5 group shrink-0"
                :title="$t('friends.copy_code')"
              >
                 {{ formatDisplayCode(post.friend_code) }}
                 <svg class="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
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
              <span v-for="region in getPostRegions(post.regions)" :key="`${post.id}-region-${region}`" class="px-2.5 py-1 bg-gray-100/80 text-gray-500 rounded-xl text-xs font-extrabold shadow-sm border border-black/5">
                📍 {{ region.split(' ')[0] }}
              </span>
            </div>
            
            <!-- Message Bubble -->
            <p v-if="post.message" class="bg-gray-50/80 text-gray-600 text-[13px] font-bold leading-relaxed rounded-2xl p-3.5 border border-gray-100/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
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

// Pagination State
const currentOffset = ref(0);
const hasMorePosts = ref(true);
const loadingMore = ref(false);
const POSTS_PER_PAGE = 20;

// 導入地區常數
import { FRIEND_REGIONS, ALL_REGION_OPTIONS } from '~/constants/regions';
import { FRIEND_INTENTS, ALL_INTENT_OPTIONS } from '~/constants/intents';
import scrapedImages from '../../scraped_images.json';

// 皮克敏頭像：從 scraped_images.json 取得所有圖片 URL
const PIKMIN_AVATAR_URLS = Object.values(scrapedImages) as string[];

// 根據 username 產生一個穩定的 hash 對應到固定的皮克敏圖片
function getPikminAvatar(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) - hash + username.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PIKMIN_AVATAR_URLS.length;
  return PIKMIN_AVATAR_URLS[index];
}

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

const fetchPosts = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    currentOffset.value = 0;
  }
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
      .order('created_at', { ascending: false })
      .range(currentOffset.value, currentOffset.value + POSTS_PER_PAGE - 1); // 每次拉取 20 筆
      
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

    const { data, error: err } = await query;

    if (err) throw err;
    
    if (data) {
      // 判斷是否還有下一頁
      hasMorePosts.value = data.length === POSTS_PER_PAGE;
      
      if (isLoadMore) {
        posts.value.push(...data);
      } else {
        posts.value = data;
      }
    } else {
      hasMorePosts.value = false;
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
  // 過濾出有自我介紹(message)的玩家
  const eligiblePosts = posts.value.filter(p => p.message && p.message.trim() !== '');

  // 不論有沒有篩選，少於或等於10個直接全秀(打亂排列)，不輪播
  if (eligiblePosts.length <= 10) {
    recommendedPosts.value = shuffleArray(eligiblePosts);
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
      const eligiblePosts = newPosts.filter(p => p.message && p.message.trim() !== '');
      recommendationQueue.value = shuffleArray(eligiblePosts);
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
  const validTags = tags.filter(tag => 
    ALL_INTENT_OPTIONS.includes(tag) || 
    ['mushroom', 'postcard'].includes(tag) || // Legacy support
    tag.startsWith('postcard:')
  );
  
  // Deduplicate base 'postcard' if 'postcard:xxx' exists
  const hasDynamicPostcard = validTags.some(t => t.startsWith('postcard:'));
  return validTags.filter(t => {
    if (t === 'postcard' && hasDynamicPostcard) return false;
    return true;
  });
};

const getIntentObj = (id: string) => FRIEND_INTENTS.find(i => i.id === id);

const getIntentIcon = (id: string) => {
  if (id === 'mushroom') return '🍄';
  if (id.startsWith('postcard')) return '💌';
  return getIntentObj(id)?.icon || '';
};

const getIntentLabel = (id: string) => {
  if (id === 'mushroom') return '打蘑菇';
  if (id === 'postcard') return '交換明信片';
  if (id.startsWith('postcard:')) {
    const value = id.split(':')[1];
    return `想要 ${value} 明信片`;
  }
  return getIntentObj(id)?.label || id;
};

const getIntentColor = (id: string) => {
  if (id === 'mushroom') return 'bg-red-50 text-red-600 border-red-200';
  if (id.startsWith('postcard:')) return 'bg-blue-50 text-blue-600 border-blue-200 bg-opacity-70 backdrop-blur-sm shadow-sm';
  return getIntentObj(id)?.colorClass || 'bg-gray-100 text-gray-800 border-gray-200';
};

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
