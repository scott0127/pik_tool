export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  let raf = 0
  let media: MediaQueryList | null = null

  const setMobileClass = () => {
    if (!media) return
    document.documentElement.classList.toggle('is-mobile-glass-runtime', media.matches)
  }

  const updateGlassFlow = () => {
    if (!media?.matches || raf) return

    raf = window.requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--glass-flow-y', `${window.scrollY * -0.018}px`)
      raf = 0
    })
  }

  nuxtApp.hook('app:mounted', () => {
    media = window.matchMedia('(max-width: 767px)')

    setMobileClass()
    updateGlassFlow()

    media.addEventListener('change', setMobileClass)
    window.addEventListener('scroll', updateGlassFlow, { passive: true })
  })

  nuxtApp.hook('app:beforeUnmount', () => {
    media?.removeEventListener('change', setMobileClass)
    window.removeEventListener('scroll', updateGlassFlow)
    if (raf) window.cancelAnimationFrame(raf)
  })
})
