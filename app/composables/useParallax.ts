import { ref, onMounted, onUnmounted } from 'vue'
import { useSpring } from '~/composables/useSpring'

// 全域共享狀態 (Client-only)
const bgX = ref(0)
const bgY = ref(0)
const bgImage = ref('/img/pc_background_extended.png')

let bgXSpring: any = null
let bgYSpring: any = null

let isTracking = false
let listenersCount = 0

const updateBgImage = () => {
  if (typeof window !== 'undefined') {
    bgImage.value = window.innerWidth >= 768 ? '/img/pc_background_extended.png' : '/img/ambient-glass-sprouts.png'
  }
}

const handleMouseMove = (e: MouseEvent) => {
  const xPct = (e.clientX / window.innerWidth) - 0.5
  const yPct = (e.clientY / window.innerHeight) - 0.5
  bgX.value = xPct * -30
  bgY.value = yPct * -30
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
    if (!isTracking && typeof window !== 'undefined') {
      updateBgImage()
      window.addEventListener('resize', updateBgImage)
      window.addEventListener('mousemove', handleMouseMove)
      isTracking = true
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
    bgImage
  }
}
