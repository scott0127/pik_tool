export default defineNuxtPlugin(() => {
  const CHECK_INTERVAL_MS = 5 * 60 * 1000
  const VERSION_STORAGE_KEY = 'pikmin-app-version'
  const RELOAD_LOCK_KEY = 'pikmin-app-version-reload-lock'
  const RELOAD_LOCK_MS = 30 * 1000

  const getReloadLock = () => {
    const raw = localStorage.getItem(RELOAD_LOCK_KEY)
    if (!raw) return 0

    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const setReloadLock = () => {
    localStorage.setItem(RELOAD_LOCK_KEY, String(Date.now()))
  }

  const shouldAvoidReloadLoop = () => {
    const lastReloadAt = getReloadLock()
    return Date.now() - lastReloadAt < RELOAD_LOCK_MS
  }

  const fetchLatestVersion = async (): Promise<string | null> => {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      })

      if (!response.ok) return null

      const data: unknown = await response.json()
      const version = typeof data === 'object' && data !== null ? (data as { version?: unknown }).version : null

      if (!version || typeof version !== 'string') return null

      return version
    } catch (error) {
      console.warn('[VersionCheck] Failed to fetch version.json', error)
      return null
    }
  }

  const checkVersion = async () => {
    if (!import.meta.client) return

    const latestVersion = await fetchLatestVersion()
    if (!latestVersion) return

    const currentVersion = localStorage.getItem(VERSION_STORAGE_KEY)

    if (!currentVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, latestVersion)
      return
    }

    if (currentVersion === latestVersion) return
    if (shouldAvoidReloadLoop()) return

    localStorage.setItem(VERSION_STORAGE_KEY, latestVersion)
    setReloadLock()

    console.info('[VersionCheck] New version detected. Reloading...', {
      currentVersion,
      latestVersion,
    })

    window.location.reload()
  }

  const onVisibilityChange = () => {
    if (!document.hidden) {
      void checkVersion()
    }
  }

  void checkVersion()
  window.addEventListener('focus', checkVersion)
  document.addEventListener('visibilitychange', onVisibilityChange)
  const intervalId = window.setInterval(checkVersion, CHECK_INTERVAL_MS)

  onNuxtReady(() => {
    window.addEventListener('beforeunload', () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', checkVersion)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }, { once: true })
  })
})
