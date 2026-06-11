import { ref, onMounted, onUnmounted } from 'vue'
import { useSpring } from '~/composables/useSpring'

// 全域共享狀態 (Client-only)
const bgX = ref(0)
const bgY = ref(0)
const bgMouseX = ref(0)
const bgMouseY = ref(0)
const bgImage = ref('/img/ambient-glass-sprouts.png')
const isImmersive = ref(false)
const immersiveProgress = ref(0)
const isMobile = ref(false)
const globalGlassOpacity = ref(0.0)
const scrollBgScale = ref(1.16)
const scrollBgY = ref(-10)

let bgXSpring: any = null
let bgYSpring: any = null

let isTracking = false
let listenersCount = 0


const updateBgImage = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
    bgImage.value = '/img/ambient-glass-sprouts.png'
    if (isMobile.value) {
      scrollBgScale.value = 1.25
      scrollBgY.value = 0
    } else {
      scrollBgScale.value = 1.16
      scrollBgY.value = -10
    }
  }
}

const syncBgOffset = () => {
  bgX.value = bgMouseX.value
  bgY.value = bgMouseY.value
}

const handleMouseMove = (e: MouseEvent) => {
  const xPct = (e.clientX / window.innerWidth) - 0.5
  const yPct = (e.clientY / window.innerHeight) - 0.5
  bgMouseX.value = xPct * -24
  bgMouseY.value = yPct * -18
  syncBgOffset()
}

export function useParallax() {
  // 延遲初始化以確保在 Client-side 建立 Spring
  if (!bgXSpring) {
    bgXSpring = useSpring(bgX, { stiffness: 100, damping: 50 })
  }
  if (!bgYSpring) {
    bgYSpring = useSpring(bgY, { stiffness: 100, damping: 50 })
  }

  onMounted(() => {
    listenersCount++
    if (typeof window !== 'undefined') {
      updateBgImage()
      
      // 首次掛載時載入 localStorage 中的沉浸式背景設定，確保同步
      const saved = localStorage.getItem('pikmin-immersive-background')
      if (saved !== null) {
        const enabled = saved === 'true'
        isImmersive.value = enabled
        immersiveProgress.value = enabled ? 1 : 0
      }

      
      if (!isTracking) {
        window.addEventListener('resize', updateBgImage)
        window.addEventListener('mousemove', handleMouseMove)
        isTracking = true
      }
    }
  })

  onUnmounted(() => {
    listenersCount--
    if (listenersCount <= 0 && isTracking && typeof window !== 'undefined') {
      window.removeEventListener('resize', updateBgImage)
      window.removeEventListener('mousemove', handleMouseMove)
      isTracking = false
    }
  })

  return {
    bgX,
    bgY,
    bgXSpring,
    bgYSpring,
    bgImage,
    isImmersive,
    immersiveProgress,
    isMobile,
    globalGlassOpacity,
    scrollBgScale,
    scrollBgY
  }
}
