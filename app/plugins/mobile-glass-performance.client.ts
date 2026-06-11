export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  let media: MediaQueryList | null = null

  const setMobileClass = () => {
    if (!media) return
    document.documentElement.classList.toggle('is-mobile-glass-runtime', media.matches)
  }

  nuxtApp.hook('app:mounted', () => {
    media = window.matchMedia('(max-width: 767px)')

    setMobileClass()

    media.addEventListener('change', setMobileClass)
  })

  nuxtApp.hook('app:beforeUnmount', () => {
    media?.removeEventListener('change', setMobileClass)
  })
})
