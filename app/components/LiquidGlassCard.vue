<!--
  LiquidGlassCard.vue
  
  【高效能擬真液態玻璃卡片模組】
  此元件實現了擬真的毛玻璃質感、3D 視差傾斜、色差折射虹彩，
  以及內部與全域背景同步的「液化透鏡放大（True Liquid Lens）」效果。
  
  【重用指南 (How to Reuse)】
  1. 直接導入本元件，並用插槽 (slot) 放入內容即可：
     <LiquidGlassCard :blur-value="20" :glass-opacity="0.15" :bg-x="bgX" :bg-y="bgY">
       <h1>你的內容</h1>
     </LiquidGlassCard>
  
  2. 屬性 (Props) 說明：
     - blurValue: 毛玻璃模糊度 (px)
     - glassOpacity: 玻璃基底白色的不透明度 (0 ~ 1)
     - bgX / bgY: 全域背景此時的視差偏移量 (px)，用於與透鏡放大圖案精準對齊
     - bgImage: 卡片背後的背景圖路徑，用來實現透鏡內部的對齊放大 (預設為 '/bg.png')
     - magnification: 透鏡放大倍率 (預設為 1.15)
     - isDraggable: 是否啟用拖曳功能 (預設為 true)
     - isTiltable: 是否啟用滑鼠懸停 3D 傾斜與折射光澤 (預設為 true)
-->

<template>
  <div
    ref="cardRef"
    :class="[
      'relative overflow-hidden group select-none morph-card liquid-glass-card',
      isMobile ? 'mobile-liquid-glass' : '',
      isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
    ]"
    :style="cardStyle"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @pointerdown="handlePointerDown"
  >
    <!-- 桌機版：保留原本高成本 lens 效果 -->
    <template v-if="!isMobile">
      <!-- 1. 液態透鏡放大層 (True Liquid Lens Magnification Layer) -->
      <div class="absolute inset-0 rounded-[inherit] pointer-events-none -z-10 overflow-hidden bg-white/5">
        <div class="absolute" :style="baseGradientStyle" />
        <div v-if="effectiveBgImage" class="absolute" :style="imageStyle" />
        <div class="absolute" :style="lightOverlayStyle" />
        <div class="absolute inset-0 pointer-events-none" :style="distortionStyle" />
      </div>

      <!-- 2. 精緻折射邊框 -->
      <div class="pointer-events-none absolute inset-0 rounded-[inherit]" :style="refractiveEdgeStyle" />
      
      <!-- 3. 邊緣色差虹彩 -->
      <div class="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 opacity-40 group-hover:opacity-100" :style="iridescenceStyle" />

      <!-- 4. 靜態玻璃基礎漸層 -->
      <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-0 mix-blend-overlay rounded-[inherit]" />
    </template>

    <!-- 手機版：使用 backdrop-filter 低成本玻璃 -->
    <template v-else>
      <div class="mobile-glass-refraction" />
      <div class="mobile-glass-edge" />
      <div class="mobile-glass-noise" />
    </template>
    
    <!-- 5. 內容主容器 (微移視差效果) -->
    <!-- 內容會朝著滑鼠位置產生輕微的正向視差偏移，讓玻璃厚度感更逼真 -->
    <div 
      class="relative z-10 w-full h-full text-white"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSpring } from '~/composables/useSpring'
import { useParallax } from '~/composables/useParallax'

// 定義元件的屬性
interface Props {
  blurValue?: number         // 玻璃模糊半徑 (px)
  glassOpacity?: number | null // 玻璃底色透明度 (0 ~ 1)
  bgX?: number               // 全域背景 X 軸視差偏移 (px)
  bgY?: number               // 全域背景 Y 軸視差偏移 (px)
  bgImage?: string           // 全域背景圖片 URL
  magnification?: number     // 內部放大率
  isDraggable?: boolean      // 是否允許滑鼠拖動
  isTiltable?: boolean       // 是否啟用 3D 懸停傾斜
  bgInset?: number           // 全域背景的 inset 邊界 (px，預設為 0 以對齊滿版背景)
  containerEl?: HTMLElement  // 拖動限制的容器元件（若不傳則預設限制在 parentElement 內）
}

const props = withDefaults(defineProps<Props>(), {
  blurValue: 28,
  glassOpacity: null,
  bgX: 0,
  bgY: 0,
  bgImage: '',
  magnification: 1.15,
  isDraggable: true,
  isTiltable: true,
  bgInset: 100
})

// 元件 DOM 參照
const cardRef = ref<HTMLDivElement | null>(null)

// --- 狀態定義 ---
const isHovered = ref(false)
const isDragging = ref(false)

// 拖拽位移值 (X, Y)
const dragX = ref(0)
const dragY = ref(0)

// 滑鼠在卡片內的相對坐標比例 (-0.5 到 0.5)
const mouseX = ref(0)
const mouseY = ref(0)

// 卡片相對於背景原點的偏移與尺寸資訊，用於液態透鏡精準對齊
const rectOffset = ref({ x: 0, y: 0, w: 0, h: 0 })

// 取得全域視差背景狀態與沉浸式切換變數
const { bgXSpring, bgYSpring, bgImage: globalBgImage, isImmersive, immersiveProgress, isMobile, globalGlassOpacity, scrollBgScale, scrollBgY } = useParallax()

const effectiveBgInset = computed(() => {
  return isMobile.value ? 0 : props.bgInset
})

// 計算實際使用的背景偏移與圖檔，無痛向下相容與覆寫
const effectiveBgX = computed(() => {
  if (isMobile.value) return 0
  return props.bgX !== undefined && props.bgX !== 0 ? props.bgX : (bgXSpring?.value ?? 0)
})

const effectiveBgY = computed(() => {
  if (isMobile.value) return 0
  return props.bgY !== undefined && props.bgY !== 0 ? props.bgY : (bgYSpring?.value ?? 0)
})

const effectiveBgImage = computed(() => {
  return props.bgImage || globalBgImage.value
})

const effectiveGlassOpacity = computed(() => {
  const base = globalGlassOpacity.value // 預設 0.2，範圍可調整為 0 ~ 0.8
  if (props.glassOpacity !== null && props.glassOpacity !== undefined) {
    // 依據傳入的 props 與預設的 0.2 比例進行等比縮放，讓全域滑桿可同比例控制所有卡片
    return props.glassOpacity * (base / 0.2)
  }
  return base
})

// --- 彈簧物理學設定 (Spring Physics) ---
// 使用 VueUse 的 useSpring 創造平滑流暢的物理動畫過渡
const springConfig = { stiffness: 300, damping: 30 }
const mouseXSpring = useSpring(mouseX, springConfig)
const mouseYSpring = useSpring(mouseY, springConfig)

// 3D 旋轉角度計算
const rotateX = computed(() => {
  if (!props.isTiltable) return 0
  // 垂直滑鼠移動 (mouseY) 控制 X 軸旋轉（上下傾斜，呈相反方向射光）
  return -mouseYSpring.value * 28 // 傾斜角範圍約 -14deg 到 14deg
})

const rotateY = computed(() => {
  if (!props.isTiltable) return 0
  // 水平滑鼠移動 (mouseX) 控制 Y 軸旋轉（左右傾斜）
  return mouseXSpring.value * 28 // 傾斜角範圍約 -14deg 到 14deg
})

// --- 拖曳事件處理 (Drag Event Handlers) ---
let startX = 0
let startY = 0
let initialDragX = 0
let initialDragY = 0

const handlePointerDown = (e: PointerEvent) => {
  if (!props.isDraggable) return
  
  // 如果點擊到按鈕、輸入框等互動控制項，則不觸發拖曳
  const target = e.target as HTMLElement
  if (target.closest('button, input, select, textarea, canvas, a, [data-no-drag]')) {
    return
  }
  
  isDragging.value = true
  startX = e.clientX
  startY = e.clientY
  initialDragX = dragX.value
  initialDragY = dragY.value
  
  const el = cardRef.value
  if (el) {
    // 捕獲指標以確保滑鼠移出卡片時仍能正常拖曳
    el.setPointerCapture(e.pointerId)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
  }
}

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value || !cardRef.value) return
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  
  let newX = initialDragX + dx
  let newY = initialDragY + dy
  
  // 邊界限制限制 (Bounds Constraints)
  // 若未手動傳入 containerEl，則自動取 parentElement 作為邊界容器
  const container = props.containerEl || cardRef.value.parentElement
  if (container) {
    const containerRect = container.getBoundingClientRect()
    const cardRect = cardRef.value.getBoundingClientRect()
    
    // 計算在未施加當前拖曳位移時，卡片的初始左上角坐標
    const initialLeft = cardRect.left - dragX.value
    const initialTop = cardRect.top - dragY.value
    
    // 邊界極值
    const minX = containerRect.left - initialLeft
    const maxX = containerRect.right - initialLeft - cardRect.width
    const minY = containerRect.top - initialTop
    const maxY = containerRect.bottom - initialTop - cardRect.height
    
    // 限制在容器內
    newX = Math.max(minX, Math.min(maxX, newX))
    newY = Math.max(minY, Math.min(maxY, newY))
  }
  
  dragX.value = newX
  dragY.value = newY
  
  // 拖曳時動態更新卡片位置以防透鏡圖像碎裂
  updateRect()
}

const handlePointerUp = (e: PointerEvent) => {
  isDragging.value = false
  const el = cardRef.value
  if (el) {
    try {
      el.releasePointerCapture(e.pointerId)
    } catch (err) {}
    el.removeEventListener('pointermove', handlePointerMove)
    el.removeEventListener('pointerup', handlePointerUp)
    el.removeEventListener('pointercancel', handlePointerUp)
  }
  updateRect()
}

// --- 滑鼠懸停傾斜處理 (Hover Tilt Handlers) ---
const handleMouseMove = (e: MouseEvent) => {
  if (!props.isTiltable || !cardRef.value) return
  isHovered.value = true
  
  const rect = cardRef.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  
  // 計算滑鼠相對於卡片中心的偏移百分比
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  
  const xPct = mX / width - 0.5   // -0.5 到 0.5
  const yPct = mY / height - 0.5  // -0.5 到 0.5
  
  mouseX.value = xPct
  mouseY.value = yPct
}

const handleMouseEnter = () => {
  isHovered.value = true
  updateRect()
}

const handleMouseLeave = () => {
  isHovered.value = false
  // 滑鼠移開時歸零，卡片平滑彈回水平狀態
  mouseX.value = 0
  mouseY.value = 0
}

// --- 卡片絕對坐標更新 (Lens Alignment Calculation) ---
// 卡片相對於視窗背景的左上角坐標。
// 為了與全域背景無縫對齊，放大層的 left / top 位置必須動態抵消卡片自身的拖動與頁面捲動位移。
const updateRect = () => {
  if (cardRef.value) {
    const rect = cardRef.value.getBoundingClientRect()
    // +effectiveBgInset.value 是因為全域背景可能有視差邊界餘裕，例如 inset-[-100px]
    rectOffset.value = {
      x: rect.left - dragX.value + effectiveBgInset.value,
      y: rect.top - dragY.value + effectiveBgInset.value,
      w: rect.width,
      h: rect.height
    }
  }
}

// 監聽視窗縮放與滾動以即時重新計算對齊坐標
onMounted(() => {
  updateRect()
  setTimeout(updateRect, 100)
  window.addEventListener('resize', updateRect)
  // 手機版不要每張卡各自監聽 scroll，改用全域 CSS variable
  if (!isMobile.value) {
    window.addEventListener('scroll', updateRect, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateRect)
  if (!isMobile.value) {
    window.removeEventListener('scroll', updateRect)
  }
})

// --- 樣式計算屬性 (Style Computeds) ---

// 1. 卡片主體樣式：結合拖曳平移、3D 旋轉與懸停縮放
const cardStyle = computed(() => {
  const scale = isDragging.value ? 0.98 : (isHovered.value ? 1.02 : 1)
  const zIdx = isDragging.value ? 30 : (isHovered.value ? 20 : 10)
  
  const baseStyles: any = {
    transform: `translate3d(${dragX.value}px, ${dragY.value}px, 0) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(${scale})`,
    zIndex: zIdx,
    transition: isDragging.value ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s'
  }

  // 桌機版：套用 3D perspective 與玻璃外觀
  // 手機版：由 .mobile-liquid-glass CSS 類別處理，不能用 preserve-3d 否則 backdrop-filter 會失效
  if (!isMobile.value) {
    baseStyles.transformPerspective = '1000px'
    baseStyles.transformStyle = 'preserve-3d'
    baseStyles.background = `rgba(255, 255, 255, ${effectiveGlassOpacity.value * 0.4})`
    baseStyles.border = '1.5px solid rgba(255, 255, 255, 0.42)'
    baseStyles.boxShadow = 'inset 0 1.5px 3px rgba(255, 255, 255, 0.45), inset 0 -1px 2px rgba(255, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.45)'
  }

  return baseStyles
})

// 2. 共享透鏡樣式（定位、變形與濾鏡基礎）
const sharedLensStyle = computed(() => {
  const leftVal = -rectOffset.value.x - dragX.value
  const topVal = -rectOffset.value.y - dragY.value
  
  const originX = dragX.value + rectOffset.value.x + rectOffset.value.w / 2
  const originY = dragY.value + rectOffset.value.y + rectOffset.value.h / 2

  const tx = effectiveBgX.value
  const ty = effectiveBgY.value + scrollBgY.value

  return {
    width: `calc(100vw + ${effectiveBgInset.value * 2}px)`,
    height: `calc(100vh + ${effectiveBgInset.value * 2}px)`,
    left: `${leftVal}px`,
    top: `${topVal}px`,
    transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scrollBgScale.value * props.magnification})`,
    transformOrigin: `${originX}px ${originY}px`,
    filter: `saturate(160%) brightness(1.1) contrast(1.05)`,
  }
})

// (A) 漸層底層樣式 (對應全域底色漸層 .ambient-base)
const baseGradientStyle = computed(() => {
  let gradientStr = ''
  if (isImmersive.value) {
    gradientStr = 'radial-gradient(circle at 50% 0%, rgb(255 255 255 / 0.42), transparent 30%), linear-gradient(160deg, #082f25 0%, #0f513c 46%, #082f49 100%)'
  } else {
    if (isMobile.value) {
      gradientStr = 'radial-gradient(circle at 18% 10%, rgb(255 255 255 / 0.18), transparent 24%), radial-gradient(circle at 82% 18%, rgb(186 230 253 / 0.08), transparent 28%), linear-gradient(160deg, #d6eee4 0%, #bad8cd 44%, #94b5ab 100%)'
    } else {
      gradientStr = 'radial-gradient(circle at 18% 14%, rgb(255 255 255 / 0.14), transparent 24%), radial-gradient(circle at 86% 8%, rgb(186 230 253 / 0.1), transparent 30%), linear-gradient(160deg, #cfe8dc 0%, #adcbbf 48%, #8eafa4 100%)'
    }
  }

  return {
    ...sharedLensStyle.value,
    backgroundImage: gradientStr,
  }
})

// (B) 圖片層樣式 (對應全域底圖 .ambient-cute，可隨進度淡入淡出並精確對齊 position)
const imageStyle = computed(() => {
  return {
    ...sharedLensStyle.value,
    backgroundImage: `url('${effectiveBgImage.value}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    opacity: 1 - immersiveProgress.value,
  }
})

// (C) 頂層光暈樣式 (對應全域光暈層 .ambient-light)
const lightOverlayStyle = computed(() => {
  const rawX = rectOffset.value.x - effectiveBgInset.value
  const rawY = rectOffset.value.y - effectiveBgInset.value
  
  const leftVal = -rawX - dragX.value
  const topVal = -rawY - dragY.value
  
  const originX = dragX.value + rawX + rectOffset.value.w / 2
  const originY = dragY.value + rawY + rectOffset.value.h / 2

  let gradientStr = ''
  if (isImmersive.value) {
    gradientStr = 'linear-gradient(180deg, rgb(255 255 255 / 0.2), rgb(240 253 244 / 0.52) 36%, rgb(240 253 244 / 0.76)), radial-gradient(circle at 50% 0%, rgb(255 255 255 / 0.48), transparent 26%)'
  } else {
    gradientStr = 'linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.03) 46%, rgb(255 255 255 / 0.12)), radial-gradient(ellipse at 50% -10%, rgb(255 255 255 / 0.18), transparent 44%)'
  }

  return {
    width: '100vw',
    height: '100vh',
    left: `${leftVal}px`,
    top: `${topVal}px`,
    transform: `scale(${props.magnification})`,
    transformOrigin: `${originX}px ${originY}px`,
    backgroundImage: gradientStr,
    filter: 'saturate(160%) brightness(1.1) contrast(1.05)',
    opacity: isImmersive.value ? 1 : (1 - immersiveProgress.value * 0.32),
  }
})

// 3. 邊緣折射樣式：動態調整內陰影偏移
const refractiveEdgeStyle = computed(() => {
  // 將滑鼠的相對坐標 (-0.5 到 0.5) 映射成內陰影的位移 (px)
  const x1 = -mouseXSpring.value * 12
  const y1 = -mouseYSpring.value * 12
  const x2 = mouseXSpring.value * 8
  const y2 = mouseYSpring.value * 8
  
  return {
    boxShadow: `inset ${x1}px ${y1}px 12px rgba(255, 255, 255, 0.35), inset ${x2}px ${y2}px 8px rgba(255, 255, 255, 0.12)`,
    zIndex: 1,
  }
})

// 4. 虹彩效果樣式：滑鼠移動時，彩色漸層跟著平移
const iridescenceStyle = computed(() => {
  // 滑鼠在 -0.5 時，背景位置在 100%；滑鼠在 0.5 時，背景位置在 0%
  const posX = (0.5 - mouseXSpring.value) * 100
  const posY = (0.5 - mouseYSpring.value) * 100
  
  return {
    background: 'linear-gradient(135deg, rgba(255,100,100,0.15) 0%, rgba(255,255,100,0.05) 25%, rgba(100,255,100,0.15) 50%, rgba(100,255,255,0.05) 75%, rgba(100,100,255,0.15) 100%)',
    backgroundSize: '300% 300%',
    backgroundPosition: `${posX}% ${posY}%`,
    mixBlendMode: 'color-dodge' as const,
    maskImage: 'radial-gradient(ellipse at center, transparent 55%, black 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 55%, black 100%)',
    zIndex: 2,
  }
})

// 5. 邊緣扭曲衰減
const distortionStyle = computed(() => {
  return {
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.1)',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    maskImage: 'radial-gradient(ellipse at center, transparent 70%, black 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 70%, black 100%)',
  }
})

// 6. 內容文字視差微移
const contentStyle = computed(() => {
  const xOffset = mouseXSpring.value * 20 // -10px 到 10px
  const yOffset = mouseYSpring.value * 20 // -10px 到 10px
  return {
    transform: `translate3d(${xOffset}px, ${yOffset}px, 0)`,
  }
})
</script>

<style scoped>
/* 為了讓 3D tilt 在 Chrome & Safari 上運作流暢，開啟硬體加速 */
.liquid-glass-card {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

/* =========================================================
   Mobile Fallback: High Performance Liquid Glass
   用 backdrop-filter 取代全螢幕 lens texture
   ========================================================= */

.mobile-liquid-glass {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  contain: paint;

  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18),
      rgba(255, 255, 255, 0.06) 38%,
      rgba(255, 255, 255, 0.02)
    );

  border: 1px solid rgba(255, 255, 255, 0.3);

  backdrop-filter: blur(10px) saturate(130%);
  -webkit-backdrop-filter: blur(10px) saturate(130%);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08),
    0 12px 28px rgba(0, 0, 0, 0.12);

  transform: translateZ(0);
}

/* 折射高光層：用靜態漸層模擬厚玻璃光線彎折 */
.mobile-glass-refraction {
  position: absolute;
  inset: -20%;
  z-index: 1;
  pointer-events: none;

  background:
    radial-gradient(
      circle at 22% 18%,
      rgba(255, 255, 255, 0.35),
      rgba(255, 255, 255, 0.08) 18%,
      transparent 42%
    ),
    radial-gradient(
      circle at 86% 72%,
      rgba(255, 255, 255, 0.18),
      transparent 36%
    ),
    linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.18) 42%,
      transparent 62%
    );

  opacity: 0.35;
  mix-blend-mode: screen;
  /* 綁定全域 CSS variable，滑動時光斑會上下流動 */
  transform: translate3d(0, var(--glass-flow-y, 0px), 0) rotate(-4deg);
}

/* 邊緣厚玻璃感 */
.mobile-glass-edge {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  border-radius: inherit;

  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.5),
    inset -1px -1px 0 rgba(255, 255, 255, 0.12),
    inset 0 0 18px rgba(255, 255, 255, 0.1);
}

/* 微材質雜訊層 */
.mobile-glass-noise {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: 0.08;

  background-image:
    radial-gradient(rgba(255, 255, 255, 0.35) 0.5px, transparent 0.5px);
  background-size: 5px 5px;

  mix-blend-mode: overlay;
}
</style>
