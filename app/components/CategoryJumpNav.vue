<template>
  <div>
    <!-- Backdrop for Drawer -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isExpanded" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" @click="isExpanded = false"></div>
    </Transition>

    <!-- Slide-out Drawer -->
    <Transition
      :css="false"
      @before-enter="onDrawerBeforeEnter"
      @enter="onDrawerEnter"
      @leave="onDrawerLeave"
    >
      <div v-if="isExpanded" class="category-drawer fixed right-0 top-0 h-[100dvh] w-full max-w-[380px] sm:max-w-[420px] z-50 bg-white/70 backdrop-blur-2xl border-l border-white/80 shadow-2xl flex flex-col overflow-hidden">
        
        <!-- Generated Artistic Background -->
        <div class="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50/80 to-teal-50/80"></div>
        
        <!-- Drawer Header -->
        <div class="category-drawer-header flex items-center justify-between px-6 py-5 border-b border-white/40 bg-white/40 backdrop-blur-md shrink-0 shadow-sm relative z-20">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
              <Icon name="lucide:layout-grid" class="w-4 h-4" />
            </div>
            <h3 class="font-bold text-gray-800 tracking-wide">{{ $t('collection.scroll.categories') || '所有分類' }}</h3>
          </div>
          <button @click="isExpanded = false" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-500 transition-colors">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Drawer Content -->
        <div class="category-drawer-content flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative z-10 space-y-8">
          
          <!-- Regular Categories Grid -->
          <div v-if="regularCategoriesList.length > 0">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100/60 border border-emerald-200/50 px-2 py-1 rounded-md shadow-sm">REG</span>
              <div class="h-px flex-1 bg-gradient-to-r from-emerald-200/50 to-transparent"></div>
            </div>
            
            <div class="grid grid-cols-4 gap-x-2 gap-y-4">
              <button
                v-for="cat in regularCategoriesList"
                :key="cat.id"
                @click="scrollToCategoryAndClose(cat.id)"
                class="category-jump-item group relative flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105"
                :title="cat.name"
              >
                <div class="relative w-12 h-12 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 flex items-center justify-center group-hover:bg-white/90 group-hover:shadow-md group-hover:border-emerald-200 transition-all">
                  <svg class="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="#e5e7eb" stroke-width="2" />
                    <circle 
                      cx="14" cy="14" r="11" fill="none" 
                      :stroke="cat.progress === 100 ? '#f59e0b' : '#00b92f'" 
                      stroke-width="2" 
                      stroke-linecap="round"
                      :stroke-dasharray="69.115"
                      :stroke-dashoffset="69.115 - (69.115 * cat.progress / 100)"
                      class="transition-all duration-500"
                    />
                  </svg>
                  <Icon :name="cat.icon" class="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <span class="text-[10px] text-gray-700 font-medium text-center line-clamp-1 w-full px-1">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <!-- Special Categories Grid -->
          <div v-if="specialCategoriesList.length > 0">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-100/60 border border-purple-200/50 px-2 py-1 rounded-md shadow-sm">SP</span>
              <div class="h-px flex-1 bg-gradient-to-r from-purple-200/50 to-transparent"></div>
            </div>
            
            <div class="grid grid-cols-4 gap-x-2 gap-y-4">
              <button
                v-for="cat in specialCategoriesList"
                :key="cat.id"
                @click="scrollToCategoryAndClose(cat.id)"
                class="category-jump-item group relative flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105"
                :title="cat.name"
              >
                <div class="relative w-12 h-12 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 flex items-center justify-center group-hover:bg-white/90 group-hover:shadow-md group-hover:border-purple-200 transition-all">
                  <svg class="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="#e5e7eb" stroke-width="2" />
                    <circle 
                      cx="14" cy="14" r="11" fill="none" 
                      :stroke="cat.progress === 100 ? '#f59e0b' : '#a855f7'" 
                      stroke-width="2" 
                      stroke-linecap="round"
                      :stroke-dasharray="69.115"
                      :stroke-dashoffset="69.115 - (69.115 * cat.progress / 100)"
                      class="transition-all duration-500"
                    />
                  </svg>
                  <Icon :name="cat.icon" class="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </div>
                <span class="text-[10px] text-gray-700 font-medium text-center line-clamp-1 w-full px-1">{{ cat.name }}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- The Hover Pill (Desktop only, hidden on mobile) -->
    <div v-if="!hasActiveFilters" class="hidden sm:flex fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 items-center justify-end pointer-events-none transition-all duration-500" :class="isExpanded ? 'opacity-0 translate-x-12 pointer-events-none' : 'opacity-100 translate-x-0'">
      
      <!-- Navigation Pill -->
      <div 
        class="group flex flex-col items-end gap-2 bg-white/60 hover:bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-lg hover:shadow-2xl border border-white/80 p-2 transition-all duration-500 ease-out pointer-events-auto"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        
        <!-- Top Button -->
        <button
          @click="scrollToTop"
          class="flex items-center gap-3 w-10 h-10 hover:w-[160px] rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all duration-300 overflow-hidden relative"
          :class="activeSection === 'top' ? 'ring-2 ring-emerald-400 w-[160px]' : ''"
        >
          <div class="w-10 h-10 min-w-[40px] flex items-center justify-center bg-white rounded-full">
            <Icon name="lucide:arrow-up-to-line" class="w-5 h-5" />
          </div>
          <span class="whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                :class="activeSection === 'top' ? 'opacity-100' : ''">
            {{ $t('collection.scroll.top') }}
          </span>
        </button>

        <!-- Connecting Line -->
        <div class="w-px h-8 bg-gradient-to-b from-emerald-200 via-gray-300 to-cyan-200 mr-5 transition-all duration-300" :class="isHovered ? 'h-4' : 'h-8'"></div>

        <!-- Menu Button (Toggle Drawer) -->
        <button
          @click="isExpanded = true"
          class="flex items-center gap-3 w-10 h-10 hover:w-[160px] rounded-full bg-cyan-50 text-cyan-600 shadow-sm border border-cyan-100 hover:border-cyan-300 transition-all duration-300 overflow-hidden relative"
        >
          <div class="w-10 h-10 min-w-[40px] flex items-center justify-center bg-white rounded-full">
            <Icon name="lucide:layout-grid" class="w-5 h-5" />
          </div>
          <span class="whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {{ $t('collection.scroll.categories') || '所有分類' }}
          </span>
        </button>

        <!-- Connecting Line -->
        <div v-if="hasSpecial" class="w-px h-8 bg-gradient-to-b from-cyan-200 via-gray-300 to-purple-200 mr-5 transition-all duration-300" :class="isHovered ? 'h-4' : 'h-8'"></div>

        <!-- Special First Button -->
        <button
          v-if="hasSpecial"
          @click="scrollToSpecialFirst"
          class="flex items-center gap-3 w-10 h-10 hover:w-[160px] rounded-full bg-purple-50 text-purple-600 shadow-sm border border-purple-100 hover:border-purple-300 transition-all duration-300 overflow-hidden relative"
          :class="activeSection === 'special' ? 'ring-2 ring-purple-400 w-[160px]' : ''"
        >
          <div class="w-10 h-10 min-w-[40px] flex items-center justify-center bg-white rounded-full">
            <Icon name="lucide:star" class="w-5 h-5" />
          </div>
          <span class="whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                :class="activeSection === 'special' ? 'opacity-100' : ''">
            {{ $t('collection.scroll.special') }}
          </span>
        </button>

        <!-- Connecting Line -->
        <div v-if="hasSpecial" class="w-px h-8 bg-gradient-to-b from-purple-200 via-gray-300 to-amber-200 mr-5 transition-all duration-300" :class="isHovered ? 'h-4' : 'h-8'"></div>

        <!-- Special Last Button -->
        <button
          v-if="hasSpecial"
          @click="scrollToSpecialLast"
          class="flex items-center gap-3 w-10 h-10 hover:w-[160px] rounded-full bg-amber-50 text-amber-600 shadow-sm border border-amber-100 hover:border-amber-300 transition-all duration-300 overflow-hidden relative"
          :class="activeSection === 'bottom' ? 'ring-2 ring-amber-400 w-[160px]' : ''"
        >
          <div class="w-10 h-10 min-w-[40px] flex items-center justify-center bg-white rounded-full">
            <Icon name="lucide:arrow-down-to-line" class="w-5 h-5" />
          </div>
          <span class="whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
                :class="activeSection === 'bottom' ? 'opacity-100' : ''">
            {{ $t('collection.scroll.bottom') }}
          </span>
        </button>

      </div>
    </div>

    <!-- ===== Mobile Navigation: Glassmorphism Bottom Dock (Option B) ===== -->
    <div 
      v-if="!hasActiveFilters" 
      class="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[360px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      :class="isExpanded ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100 translate-y-0'"
    >
      <!-- Glowing aura (breathing animation) -->
      <div class="absolute inset-[-4px] bg-gradient-to-r from-emerald-400/30 via-cyan-400/30 via-purple-400/30 to-amber-400/30 rounded-[2.5rem] blur-lg animate-pulse" style="animation-duration: 4s;"></div>

      <!-- Dock Container -->
      <div class="relative w-full h-[64px] bg-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2rem] p-1.5 flex items-center">
        
        <!-- Sliding Indicator Pill -->
        <div 
          class="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(25%-3px)] rounded-[1.5rem] bg-white shadow-sm border border-white/80 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          :style="{ transform: 'translateX(' + dockActiveIndex * 100 + '%)' }"
        ></div>

        <!-- Buttons -->
        <!-- 0: Top -->
        <button 
          @click="scrollToTop" 
          class="relative z-10 flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-300 active:scale-90"
          :class="dockActiveIndex === 0 ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <Icon name="lucide:arrow-up-to-line" class="w-5 h-5 transition-transform duration-500 ease-out" :class="dockActiveIndex === 0 ? 'scale-110 -translate-y-[1px]' : 'scale-100'" />
          <span class="text-[10px] font-bold tracking-widest transition-opacity duration-300" :class="dockActiveIndex === 0 ? 'opacity-100' : 'opacity-70'">頂部</span>
        </button>

        <!-- 1: Menu -->
        <button 
          @click="isExpanded = true" 
          class="relative z-10 flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-300 active:scale-90"
          :class="dockActiveIndex === 1 ? 'text-cyan-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <Icon name="lucide:layout-grid" class="w-5 h-5 transition-transform duration-500 ease-out" :class="dockActiveIndex === 1 ? 'scale-110 -translate-y-[1px]' : 'scale-100'" />
          <span class="text-[10px] font-bold tracking-widest transition-opacity duration-300" :class="dockActiveIndex === 1 ? 'opacity-100' : 'opacity-70'">分類</span>
        </button>

        <!-- 2: Special -->
        <button 
          v-if="hasSpecial"
          @click="scrollToSpecialFirst" 
          class="relative z-10 flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-300 active:scale-90"
          :class="dockActiveIndex === 2 ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <Icon name="lucide:star" class="w-5 h-5 transition-transform duration-500 ease-out" :class="dockActiveIndex === 2 ? 'scale-110 -translate-y-[1px]' : 'scale-100'" />
          <span class="text-[10px] font-bold tracking-widest transition-opacity duration-300" :class="dockActiveIndex === 2 ? 'opacity-100' : 'opacity-70'">特殊</span>
        </button>
        <div v-else class="flex-1"></div>

        <!-- 3: Bottom -->
        <button 
          @click="scrollToSpecialLast" 
          class="relative z-10 flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors duration-300 active:scale-90"
          :class="dockActiveIndex === 3 ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <Icon name="lucide:arrow-down-to-line" class="w-5 h-5 transition-transform duration-500 ease-out" :class="dockActiveIndex === 3 ? 'scale-110 -translate-y-[1px]' : 'scale-100'" />
          <span class="text-[10px] font-bold tracking-widest transition-opacity duration-300" :class="dockActiveIndex === 3 ? 'opacity-100' : 'opacity-70'">底部</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';

interface CategoryJumpItem {
  id: string;
  name: string;
  icon: string;
  progress: number;
  progressText: string;
  isSpecial: boolean;
}

const props = defineProps<{
  categories: CategoryJumpItem[];
  showScrollTop: boolean;
  hasSpecial: boolean;
  hasActiveFilters: boolean;
}>();

const isExpanded = ref(false);
const isHovered = ref(false);
const activeSection = ref<'top' | 'special' | 'bottom'>('top');

const regularCategoriesList = computed(() => props.categories.filter(c => !c.isSpecial));
const specialCategoriesList = computed(() => props.categories.filter(c => c.isSpecial));

const dockActiveIndex = computed(() => {
  if (isExpanded.value) return 1; // Menu is open
  if (activeSection.value === 'top') return 0;
  if (activeSection.value === 'special') return 2;
  if (activeSection.value === 'bottom') return 3;
  return 0;
});

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const onDrawerBeforeEnter = (el: Element) => {
  if (prefersReducedMotion()) return;

  const drawer = el as HTMLElement;
  const header = drawer.querySelector('.category-drawer-header');
  const content = drawer.querySelector('.category-drawer-content');
  const items = drawer.querySelectorAll('.category-jump-item');

  gsap.set(drawer, {
    xPercent: 104,
    opacity: 0,
    scale: 0.985,
    filter: 'blur(8px)',
    transformOrigin: 'right center',
  });
  gsap.set(header, { y: -12, opacity: 0 });
  gsap.set(content, { opacity: 0 });
  gsap.set(items, { y: 14, opacity: 0, scale: 0.94 });
};

const onDrawerEnter = (el: Element, done: () => void) => {
  if (prefersReducedMotion()) {
    done();
    return;
  }

  const drawer = el as HTMLElement;
  const header = drawer.querySelector('.category-drawer-header');
  const content = drawer.querySelector('.category-drawer-content');
  const items = drawer.querySelectorAll('.category-jump-item');

  const tl = gsap.timeline({ onComplete: done });
  tl.to(drawer, {
    xPercent: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    duration: 0.56,
    ease: 'expo.out',
  })
    .to(header, {
      y: 0,
      opacity: 1,
      duration: 0.28,
      ease: 'power2.out',
    }, 0.12)
    .to(content, {
      opacity: 1,
      duration: 0.22,
      ease: 'power1.out',
    }, 0.16)
    .to(items, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.34,
      ease: 'back.out(1.35)',
      stagger: {
        each: 0.018,
        from: 'start',
      },
    }, 0.22);
};

const onDrawerLeave = (el: Element, done: () => void) => {
  if (prefersReducedMotion()) {
    done();
    return;
  }

  const drawer = el as HTMLElement;
  const header = drawer.querySelector('.category-drawer-header');
  const content = drawer.querySelector('.category-drawer-content');

  const tl = gsap.timeline({ onComplete: done });
  tl.to(content, {
    x: 18,
    opacity: 0,
    scale: 0.985,
    duration: 0.22,
    ease: 'power2.inOut',
  }, 0)
    .to(header, {
      x: 12,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.inOut',
    }, 0.03)
    .to(drawer, {
      xPercent: 104,
      opacity: 0,
      scale: 0.985,
      duration: 0.44,
      ease: 'expo.inOut',
    }, 0.08);
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const scrollToCategory = (categoryId: string, offset: number, behavior: ScrollBehavior) => {
  const el = document.getElementById(`cat-${categoryId}`);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior });
  return true;
};

const scrollToCategoryStable = (categoryId: string, offset = 130) => {
  const checkpoints = [0, 160, 420, 760];

  checkpoints.forEach((delay, index) => {
    window.setTimeout(() => {
      scrollToCategory(categoryId, offset, index === 0 ? 'smooth' : 'auto');
    }, delay);
  });
};

const scrollToSpecialFirst = () => {
  const firstCategory = specialCategoriesList.value[0];
  if (firstCategory) {
    scrollToCategoryStable(firstCategory.id, 100);
  }
};

const scrollToSpecialLast = () => {
  const lastCategory = specialCategoriesList.value[specialCategoriesList.value.length - 1];
  if (lastCategory) {
    scrollToCategoryStable(lastCategory.id, 100);
  } else {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
};

const scrollToCategoryAndClose = (categoryId: string) => {
  isExpanded.value = false;
  setTimeout(() => {
    scrollToCategoryStable(categoryId, 130);
  }, 150); // slight delay to allow drawer close animation to start
};

// Scroll tracking to update active section
onMounted(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    if (scrollY < 300) {
      activeSection.value = 'top';
      return;
    }

    if (maxScroll > 0 && scrollY >= maxScroll - 200) {
      activeSection.value = 'bottom';
      return;
    }

    const firstCategory = specialCategoriesList.value[0];
    if (firstCategory) {
      const firstId = firstCategory.id;
      const el = document.getElementById(`cat-${firstId}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          activeSection.value = 'special';
        } else {
          activeSection.value = 'top';
        }
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
  });
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-emerald-200/50 rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-emerald-300/80;
}
</style>
