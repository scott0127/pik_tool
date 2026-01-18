<template>
  <!-- 3D Container -->
  <div 
    ref="heroContainer"
    class="relative h-full w-full p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-visible perspective-1000"
    @mousemove="handleMouseMove"
    @mouseleave="resetTilt"
  >

    <!-- Moving Background Spirits (Organic Blobs) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem]">
        <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-radial from-emerald-300/30 to-transparent blur-[120px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-radial from-teal-300/20 to-transparent blur-[100px] animate-float-slow delay-1000"></div>
        <div class="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-gradient-radial from-lime-200/20 to-transparent blur-[80px] animate-float-slow delay-500"></div>
    </div>

    <!-- Left Content: Title & Text (Floats forward slightly) -->
    <div class="relative z-10 flex-1 text-center md:text-left transition-transform duration-200 ease-out" :style="textStyle">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm hover:scale-105 transition-transform cursor-default">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        {{ $t('hero.badge') }}
      </div>

      <h1 class="text-5xl md:text-7xl font-black text-gray-800 leading-[0.9] mb-6 tracking-tighter drop-shadow-sm">
        {{ $t('hero.title.prefix') }} <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 bg-300% animate-gradient">
          {{ $t('hero.title.suffix') }}
        </span>
      </h1>
      
      <p class="text-gray-600 text-lg md:text-xl max-w-md mx-auto md:mx-0 leading-relaxed font-medium mb-8">
        {{ $t('hero.subtitle.line1') }}<br />
        {{ $t('hero.subtitle.line2') }}
      </p>

       <!-- Interactive Pikmin Spirits (8 Colors) -->
       <div class="flex flex-wrap gap-4 justify-center md:justify-start">
          <div class="flex items-center -space-x-4 p-4 bg-white/30 backdrop-blur-sm rounded-full border border-white/40 shadow-sm hover:scale-105 transition-transform duration-300 cursor-none relative group h-20">
             <div v-for="(pikmin, index) in pikminSpirits" :key="pikmin.type" 
                  class="w-12 h-16 transform transition-all duration-300 hover:scale-125 hover:-translate-y-4 hover:z-20 relative filter drop-shadow-md"
                  :style="{ zIndex: index }">
                  <img :src="pikmin.image" :alt="pikmin.type" class="w-full h-full object-contain" />
             </div>
            
            <!-- Tooltip (appears on hover of container) -->
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-1 rounded-full pointer-events-none whitespace-nowrap">
                {{ $t('hero.tooltip') }}
            </div>
         </div>
      </div>
    </div>

    <!-- Right Content: Floating 3D Stats Core -->
    <div class="relative z-20 w-auto perspective-1000">
        <div 
            class="relative w-72 h-72 md:w-96 md:h-96 transition-transform duration-100 ease-out preserve-3d cursor-pointer"
            :style="cardStyle"
        >
            <!-- 1. Back Glow Layer (Furthest back) -->
            <div class="absolute inset-10 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full blur-[60px] opacity-40 animate-pulse-slow translate-z-[-20px]"></div>

            <!-- 2. The Glass Sphere/Container -->
            <div class="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center translate-z-[0px] ring-1 ring-white/40">
                <div class="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
            </div>

            <!-- 3. Progress Ring (Floating) -->
            <div class="absolute inset-4 translate-z-[20px]">
                <svg class="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                    <!-- Track -->
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.3)" stroke-width="6" fill="none" />
                    <!-- Progress -->
                    <circle cx="50" cy="50" r="40" stroke="url(#progressGradient)" stroke-width="6" fill="none"
                            stroke-linecap="round"
                            :stroke-dasharray="251.2"
                            :stroke-dashoffset="251.2 - (stats.percentage / 100) * 251.2"
                            class="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#34d399" />
                            <stop offset="100%" stop-color="#059669" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <!-- 4. Central Data Core (Furthest forward) -->
            <div class="absolute inset-0 flex flex-col items-center justify-center translate-z-[40px]">
                <div class="w-32 h-32 rounded-full bg-white/80 backdrop-blur-xl shadow-lg flex flex-col items-center justify-center border border-white/60 mb-2">
                    <Icon name="lucide:sprout" class="text-4xl text-emerald-500 mb-1 animate-bounce-gentle" />
                    <span class="text-3xl font-black text-gray-800 tracking-tighter leading-none">{{ stats.percentage }}%</span>
                </div>
                <div class="bg-emerald-100/80 backdrop-blur-md text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full border border-emerald-200/50 shadow-sm mt-4">
                    {{ stats.collected }} {{ $t('hero.collected') }}
                </div>
            </div>

            <!-- 5. Floating Orbs (Decorations) -->
            <div class="absolute top-0 right-10 w-12 h-12 bg-yellow-300 rounded-full blur-md opacity-60 animate-float translate-z-[30px]"></div>
            <div class="absolute bottom-10 left-10 w-8 h-8 bg-pink-400 rounded-full blur-md opacity-50 animate-float delay-700 translate-z-[25px]"></div>

        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const { getStats } = useCollection();
const stats = computed(() => getStats());

// Tilt Logic
const heroContainer = ref<HTMLElement | null>(null);
const tiltX = ref(0);
const tiltY = ref(0);

const pikminSpirits = [
    { type: 'red', image: 'https://pikmin.wiki.gallery/images/thumb/a/a7/Decor_Red_Chef_Hat.png/63px-Decor_Red_Chef_Hat.png' },
    { type: 'yellow', image: 'https://pikmin.wiki.gallery/images/thumb/3/33/Decor_Yellow_Chef_Hat.png/51px-Decor_Yellow_Chef_Hat.png' },
    { type: 'blue', image: 'https://pikmin.wiki.gallery/images/thumb/e/ef/Decor_Blue_Chef_Hat.png/61px-Decor_Blue_Chef_Hat.png' },
    { type: 'purple', image: 'https://pikmin.wiki.gallery/images/thumb/6/66/Decor_Purple_Chef_Hat.png/51px-Decor_Purple_Chef_Hat.png' },
    { type: 'white', image: 'https://pikmin.wiki.gallery/images/thumb/9/93/Decor_White_Chef_Hat.png/67px-Decor_White_Chef_Hat.png' },
    { type: 'rock', image: 'https://pikmin.wiki.gallery/images/thumb/7/79/Decor_Rock_Chef_Hat.png/78px-Decor_Rock_Chef_Hat.png' },
    { type: 'winged', image: 'https://pikmin.wiki.gallery/images/thumb/7/74/Decor_Winged_Chef_Hat.png/63px-Decor_Winged_Chef_Hat.png' },
    { type: 'ice', image: 'https://pikmin.wiki.gallery/images/thumb/5/58/Decor_Ice_Chef_Hat.png/55px-Decor_Ice_Chef_Hat.png' }
];

const handleMouseMove = (e: MouseEvent) => {
    if (!heroContainer.value) return;
    const rect = heroContainer.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 15 degrees)
    tiltX.value = ((y - centerY) / centerY) * -10; 
    tiltY.value = ((x - centerX) / centerX) * 10;
};

const resetTilt = () => {
    tiltX.value = 0;
    tiltY.value = 0;
};

const cardStyle = computed(() => ({
    transform: `rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg)`,
}));

const textStyle = computed(() => ({
    transform: `translateX(${tiltY.value * 0.5}px) translateY(${tiltX.value * 0.5}px)`,
}));

</script>

<style scoped>
.perspective-1000 {
    perspective: 1000px;
}
.preserve-3d {
    transform-style: preserve-3d;
}
.translate-z-\[-20px\] { transform: translateZ(-20px); }
.translate-z-\[0px\] { transform: translateZ(0px); }
.translate-z-\[20px\] { transform: translateZ(20px); }
.translate-z-\[25px\] { transform: translateZ(25px); }
.translate-z-\[30px\] { transform: translateZ(30px); }
.translate-z-\[40px\] { transform: translateZ(40px); }

/* Custom Keyframes if not in global css */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
.animate-float {
    animation: float 4s ease-in-out infinite;
}
.animate-bounce-gentle {
    animation: float 2s ease-in-out infinite;
}
</style>

