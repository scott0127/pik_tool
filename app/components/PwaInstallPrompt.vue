<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="translate-y-[150%] opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-[150%] opacity-0"
  >
    <div 
      v-if="showPrompt" 
      class="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 bg-white/90 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] overflow-hidden"
    >
      <!-- Background elements -->
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none"></div>
      
      <div class="relative z-10 flex gap-4 items-start">
        <!-- Icon -->
        <div class="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center border border-emerald-50 shadow-inner overflow-hidden">
          <img src="/icon.png" alt="App Icon" class="w-full h-full object-cover" />
        </div>
        
        <!-- Content -->
        <div class="flex-1">
          <h3 class="font-bold text-gray-800 text-lg leading-tight mb-1">建立桌面捷徑</h3>
          <p class="text-sm text-gray-600 leading-snug mb-3">
            隨時隨地開啟，享受全螢幕、更快速的無縫體驗！
          </p>
          
          <!-- Actions -->
          <div class="flex gap-2 font-medium text-sm">
            <button 
              @click="dismissPrompt"
              class="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            >
              稍後再說
            </button>
            <button 
              @click="showIosInstructions = true"
              class="px-5 py-2 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors flex-1 text-center flex items-center justify-center gap-1.5"
            >
              <Icon name="lucide:apple" class="w-4 h-4" />
              如何安裝？
            </button>
          </div>
        </div>
      </div>
      
      <!-- iOS Instructions Overlay -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showIosInstructions" class="absolute inset-0 bg-white/95 backdrop-blur-sm p-5 flex flex-col justify-center items-center text-center z-20">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-blue-500 shadow-inner">
            <Icon name="lucide:share" class="w-6 h-6" />
          </div>
          <p class="text-sm text-gray-700 font-medium leading-relaxed mb-4">
            點擊下方工具列的 <strong class="text-blue-600">分享</strong> 按鈕<br>
            然後選擇 <strong class="text-gray-900 border-b-2 border-emerald-400">加入主畫面</strong> 即可！
          </p>
          <button 
            @click="dismissPrompt" 
            class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-bold transition-colors"
          >
            我瞭解了
          </button>
        </div>
      </Transition>

      <!-- Dismiss (X) Button -->
      <button 
        v-if="!showIosInstructions"
        @click="dismissPrompt"
        class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10"
      >
        <Icon name="lucide:x" class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const { showPrompt, dismissPrompt } = usePwaInstall();
const showIosInstructions = ref(false);
</script>
