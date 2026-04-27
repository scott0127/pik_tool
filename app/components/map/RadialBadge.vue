<template>
  <div 
    class="radial-badge relative pointer-events-none select-none group/badge"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <!-- 單一種類 (包含完全沒有資料時的預設狀態) -->
    <template v-if="safeItems.length <= 1">
      <div 
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/95 rounded-full pl-1.5 pr-2.5 py-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-200 backdrop-blur-md pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
        style="z-index: 20;"
      >
        <div class="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100">
          <Icon v-if="safeItems[0]?.iconName" :name="safeItems[0].iconName" class="w-4 h-4 drop-shadow-sm text-slate-600" />
          <span v-else class="text-[13px] font-bold leading-none text-slate-600">{{ safeItems[0]?.icon || '?' }}</span>
        </div>
        <span class="text-xs font-bold text-slate-700 whitespace-nowrap">{{ singleLabel }}</span>
      </div>
    </template>

    <!-- 多種類：組件環狀設計 (支援2~7種) -->
    <template v-else>
      <!-- 底層 SVG 彩色環形背景：強制 z-index: 0 -->
      <svg 
        viewBox="0 0 200 200" 
        class="absolute inset-0 w-full h-full drop-shadow-md"
        style="z-index: 0;"
      >
        <!-- 定義漸層：根據選擇的色盤動態生成 -->
        <defs>
          <linearGradient 
            v-for="(grad, index) in gradients" 
            :id="`grad-${index}`" 
            :key="`def-${index}`" 
            x1="0%" y1="0%" x2="100%" y2="100%"
          >
            <stop offset="0%" :stop-color="grad.start" />
            <stop offset="100%" :stop-color="grad.end" />
          </linearGradient>
        </defs>

        <!-- 繪製 1~N 的漸層水滴軌道 -->
        <path
          v-for="(item, index) in displayItems"
          :key="`bg-${index}`"
          fill="none"
          :stroke="`url(#grad-${index % gradients.length})`"
          stroke-width="28"
          stroke-linecap="round"
          :d="getRingArc(index)"
          class="transition-all duration-500"
        />

        <!-- 【水滴交疊魔法修正】只畫 0.1 度的極短起點，完美覆蓋尾巴，且不會吃掉第二種顏色 -->
        <path
          v-if="displayItems.length > 0"
          fill="none"
          :stroke="gradients[0].start"
          stroke-width="28"
          stroke-linecap="round"
          :d="getRingArc(0, true)"
          class="pointer-events-none transition-all duration-500"
        />
      </svg>

      <!-- 中間大圓圈 (核心資訊)：強制 z-index: 10 -->
      <div 
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[48%] h-[48%] bg-white rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center text-center border-[1.5px] border-slate-50 pointer-events-auto cursor-pointer"
        style="z-index: 10;"
      >
        <span 
          class="tracking-widest text-slate-400 font-bold mb-[2px] scale-90"
          :style="{ fontSize: `${size * 0.08}px` }"
        >
          種類
        </span>
        <div 
          class="font-black text-slate-800 leading-none" 
          :style="{ fontSize: `${size * 0.24}px` }"
        >
          {{ count }}
        </div>
      </div>

      <!-- 圓環上的節點：動態綁定 borderColor 使其與底下軌道同色 -->
      <div
        v-for="(item, index) in displayItems"
        :key="`node-${index}`"
        class="absolute w-[30%] h-[30%] bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.15)] flex items-center justify-center border-[2px] pointer-events-auto cursor-pointer transition-transform duration-200 hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
        :style="getNodeStyle(index)"
      >
        <!-- 內層微底色，增加琺瑯徽章質感 -->
        <div class="w-full h-full rounded-full bg-slate-50/80 flex items-center justify-center">
          <Icon v-if="item.iconName" :name="item.iconName" class="text-slate-600 drop-shadow-sm" :style="{ width: '55%', height: '55%' }" />
          <span v-else class="leading-none text-slate-700 font-bold" style="font-size: 11px">{{ item.icon || '?' }}</span>
        </div>
      </div>
      
      <!-- 溢出指示 (+N)：優化質感版 -->
      <div 
        v-if="count > N"
        class="absolute left-1/2 -translate-x-1/2 pointer-events-auto cursor-default hover:scale-105 transition-transform"
        :style="{ bottom: '-6px', zIndex: 30 }"
      >
        <span class="text-[10px] text-slate-600 font-black bg-white/95 backdrop-blur-sm rounded-full px-2 py-[2px] shadow-[0_2px_6px_rgba(0,0,0,0.15)] border border-slate-200 whitespace-nowrap leading-none flex items-center">
          +{{ count - N }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface RadialItem {
  id: string;
  iconName?: string;
  icon?: string;
}

const props = withDefaults(defineProps<{
  items: RadialItem[];
  count: number;
  size?: number;
  maxDisplay?: number;
  singleLabel?: string;
}>(), {
  items: () => [], 
  size: 90,
  maxDisplay: 7, 
  singleLabel: '單一',
});

// ==========================================
// 🎨 色盤設定庫 (Palette Library)
// ==========================================
const palettes = {
  // 1. 現代地圖風 (Modern) - 推薦！高飽和度，地圖辨識度極佳
  modern: [
    { start: '#2DD4BF', end: '#0D9488' }, // Teal (水鴨綠)
    { start: '#60A5FA', end: '#2563EB' }, // Blue (亮藍)
    { start: '#A78BFA', end: '#7C3AED' }, // Violet (紫)
    { start: '#FB7185', end: '#E11D48' }, // Rose (玫瑰紅)
    { start: '#FB923C', end: '#EA580C' }, // Orange (橘)
    { start: '#FBBF24', end: '#D97706' }, // Amber (琥珀黃)
    { start: '#34D399', end: '#059669' }, // Emerald (翠綠)
  ],
  // 2. 馬卡龍粉彩 (Macaron) - 柔和可愛，適合淺色系底圖
  macaron: [
    { start: '#99F6E4', end: '#2DD4BF' }, // 薄荷
    { start: '#BAE6FD', end: '#38BDF8' }, // 寶寶藍
    { start: '#E9D5FF', end: '#C084FC' }, // 薰衣草紫
    { start: '#FBCFE8', end: '#F472B6' }, // 櫻花粉
    { start: '#FED7AA', end: '#FB923C' }, // 蜜桃橘
    { start: '#FEF08A', end: '#FACC15' }, // 奶油黃
    { start: '#A7F3D0', end: '#34D399' }, // 淺草綠
  ],
  // 3. 海洋冷色調 (Ocean) - 專業、科技感、數據導向
  ocean: [
    { start: '#67E8F9', end: '#06B6D4' }, // Cyan
    { start: '#38BDF8', end: '#0284C7' }, // Light Blue
    { start: '#60A5FA', end: '#2563EB' }, // Blue
    { start: '#818CF8', end: '#4F46E5' }, // Indigo
    { start: '#A78BFA', end: '#7C3AED' }, // Violet
    { start: '#C084FC', end: '#9333EA' }, // Purple
    { start: '#E879F9', end: '#C026D3' }, // Fuchsia
  ],
  // 4. 經典復古 (Classic) - 原圖萃取的莫蘭迪色系
  classic: [
    { start: '#8BC6C6', end: '#588383' }, // 水藍 
    { start: '#7DC6B6', end: '#4E7E73' }, // 灰綠 
    { start: '#FDF1C8', end: '#D4BE7B' }, // 淺黃 
    { start: '#FFE1D0', end: '#D4A48D' }, // 粉橘 
    { start: '#FFAE6A', end: '#C77631' }, // 橘色 
    { start: '#DD6954', end: '#9A3F2E' }, // 紅棕 
    { start: '#3B4E60', end: '#1C2833' }, // 藏青 
  ],
  // 5. 皮克敏 (Pikmin) - 降低明度的大地自然色調 🌱
  pikmin: [
    { start: '#C55A5A', end: '#993D3D' }, // 🔴 磚紅色 (紅皮克敏 - 戰鬥)
    { start: '#D6A649', end: '#A87B22' }, // 🟡 芥末黃 (黃皮克敏 - 耐電)
    { start: '#5783B8', end: '#305A8C' }, // 🔵 湖水藍 (藍皮克敏 - 水棲)
    { start: '#8A62A8', end: '#5C387A' }, // 🟣 葡萄紫 (紫皮克敏 - 力量)
    { start: '#C76B8E', end: '#964162' }, // 🌸 玫瑰粉 (粉皮克敏 - 飛行)
    { start: '#66A7AD', end: '#39787D' }, // 🧊 冰川青 (冰皮克敏 - 結冰)
    { start: '#807C78', end: '#524E4A' }, // 🪨 岩石灰 (岩皮克敏 - 堅硬)
  ]
};

// 💡 在這裡切換色盤！(modern, macaron, ocean, classic, pikmin)
const gradients = palettes.macaron;

// ==========================================

const safeItems = computed(() => props.items || []);
const displayItems = computed(() => safeItems.value.slice(0, props.maxDisplay));
const N = computed(() => displayItems.value.length);

// 產生完美精準的 SVG arc path
const getRingArc = (index: number, isMagic = false) => {
  const currentN = N.value <= 1 ? 2 : N.value;
  const angleStep = 360 / currentN;
  
  const startAngle = -90 + index * angleStep;
  const endAngle = isMagic ? startAngle + 0.1 : startAngle + angleStep - 0.5; 
  
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cx = 100, cy = 100, r = 76;
  
  const x1 = cx + Math.cos(toRad(startAngle)) * r;
  const y1 = cy + Math.sin(toRad(startAngle)) * r;
  const x2 = cx + Math.cos(toRad(endAngle)) * r;
  const y2 = cy + Math.sin(toRad(endAngle)) * r;
  
  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
  
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
};

// 動態注入 borderColor 
const getNodeStyle = (index: number) => {
  const orbitRadius = 38; 
  const currentN = N.value <= 1 ? 2 : N.value;
  const angleStep = 360 / currentN;
  const angle = (-90 + index * angleStep) * (Math.PI / 180);
  
  const x = 50 + orbitRadius * Math.cos(angle);
  const y = 50 + orbitRadius * Math.sin(angle);
  
  const trackColor = gradients[index % gradients.length].start;
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 20, 
    borderColor: trackColor, 
  };
};
</script>