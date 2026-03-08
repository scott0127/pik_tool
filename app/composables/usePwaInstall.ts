import { ref, onMounted, computed } from 'vue';

// Global state so it's shared between AppHeader and PwaInstallPrompt
const showPrompt = ref(false);
const isIos = ref(false);
const isStandalone = ref(false); 
const listenersAttached = ref(false);
const isMounted = ref(false); // Used to fix SSR hydration mismatch

export function usePwaInstall() {
  // Only ever show the install button if we are on the client, it is iOS, and it is not already installed.
  const canInstall = computed(() => isMounted.value && isIos.value && !isStandalone.value);

  // Checks if user is on iOS devices (iPhone, iPad, iPod)
  const checkIsIos = () => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  // Checks if the app is already installed and running in standalone mode
  const checkIsStandalone = () => {
    if (typeof window === 'undefined') return false;
    const mqStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const navStandalone = (window.navigator as any).standalone;
    return mqStandalone || navStandalone;
  };

  const checkIosPrompt = () => {
    isStandalone.value = checkIsStandalone();
    isIos.value = checkIsIos();

    // If it's iOS and not standalone, and user hasn't dismissed it, show the prompt manually
    if (isIos.value && !isStandalone.value) {
      const hasDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
      if (!hasDismissed) {
        showPrompt.value = true;
      }
    }
  };

  onMounted(() => {
    isMounted.value = true;
    // Only attach global listeners once
    if (!listenersAttached.value) {
      listenersAttached.value = true;
      checkIosPrompt();
    }
  });

  const dismissPrompt = () => {
    showPrompt.value = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  const triggerPrompt = () => {
    showPrompt.value = true;
  };

  return {
    showPrompt,
    isIos,
    isStandalone,
    canInstall,
    dismissPrompt,
    triggerPrompt
  };
}
