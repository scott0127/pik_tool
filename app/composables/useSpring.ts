import { ref, watch, computed, type Ref } from 'vue'

/**
 * useSpring
 * 
 * 輕量化、SSR 安全的彈簧物理數值過渡函數。
 * 藉由 Hooking requestAnimationFrame，在數值改變時套用胡克定律（Hooke's Law）與阻尼力學。
 *
 * @param source 要追蹤的 Vue Ref 數值來源
 * @param config 彈簧物理參數
 *   - stiffness (剛度/彈性系數): 預設 300，數值越高回彈越快
 *   - damping (阻尼/空氣阻力): 預設 30，數值越高越不容易晃動
 * @returns 回傳一個平滑過渡的唯讀或可讀寫 Ref
 */
export function useSpring(source: Ref<number> | (() => number), config = { stiffness: 300, damping: 30 }) {
  const sourceRef = typeof source === 'function' ? computed(source) : source
  const current = ref(sourceRef.value)
  
  let velocity = 0
  let rafId: number | null = null

  const step = () => {
    const target = sourceRef.value
    // F = -k * x
    const force = config.stiffness * (target - current.value)
    // F_damping = -c * v
    const dampingForce = config.damping * velocity
    // a = F + F_damping (假設質量 m = 1)
    const acceleration = force - dampingForce
    
    // 使用 Euler 積分更新速度與位移 (使用標準 60fps 步長約 16.67ms)
    velocity += acceleration * 0.016
    current.value += velocity * 0.016

    // 判斷是否接近靜止狀態，若是則停止動畫，避免無謂消耗 CPU/GPU
    if (Math.abs(target - current.value) < 0.0001 && Math.abs(velocity) < 0.0001) {
      current.value = target
      velocity = 0
      rafId = null
    } else {
      rafId = requestAnimationFrame(step)
    }
  }

  watch(sourceRef, () => {
    // 確保僅在瀏覽器端 (Client-side) 執行 requestAnimationFrame，防止 SSR 報錯
    if (typeof window !== 'undefined' && rafId === null) {
      rafId = requestAnimationFrame(step)
    }
  })

  return current
}
