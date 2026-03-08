import { ref, onMounted, computed } from 'vue';

// Global state so it's shared between AppHeader and PwaInstallPrompt
const showPrompt = ref(false); // Used for iOS custom instruction banner
const isIos = ref(false);
const isStandalone = ref(false); 
const listenersAttached = ref(false);
const isMounted = ref(false); // Used to fix SSR hydration mismatch

// Android / Desktop PWA State
const deferredPrompt = ref<any>(null);

export function usePwaInstall() {
  // Only ever show the iOS custom install button if we are on the client, it is iOS, and it is not already installed.
  const canInstallIos = computed(() => isMounted.value && isIos.value && !isStandalone.value);

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

  const triggerIosPrompt = () => {
    showPrompt.value = true;
  };

  // --- Android / Modern Web Logic ---
  const canInstallAndroid = computed(() => isMounted.value && deferredPrompt.value !== null);

  const handleBeforeInstallPrompt = (e: Event) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt.value = e;
  };

  const triggerAndroidPrompt = async () => {
    if (!deferredPrompt.value) return;
    
    // Show the install prompt
    deferredPrompt.value.prompt();
    
    // Wait for the user to respond to the prompt
    await deferredPrompt.value.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt.value = null;
    if (typeof window !== 'undefined') {
      (window as any).deferredPwaPrompt = null;
    }
  };

  onMounted(() => {
    isMounted.value = true;
    // Only attach global listeners once
    if (!listenersAttached.value) {
      listenersAttached.value = true;
      checkIosPrompt();
      
      if (typeof window !== 'undefined') {
        // 從我們在 pwa.client.ts 建立的全域變數中拿取 (如果已經觸發)
        if ((window as any).deferredPwaPrompt) {
          deferredPrompt.value = (window as any).deferredPwaPrompt;
        }

        // 還有可能元件掛載比事件還早，所以還是聽原本的和我們客製的事件
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('pwa-prompt-ready', () => {
          if ((window as any).deferredPwaPrompt) {
            deferredPrompt.value = (window as any).deferredPwaPrompt;
          }
        });

        window.addEventListener('appinstalled', () => {
          deferredPrompt.value = null;
          if (typeof window !== 'undefined') {
            (window as any).deferredPwaPrompt = null;
          }
          isStandalone.value = true;
        });
      }
    }
  });

  const dismissPrompt = () => {
    showPrompt.value = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  return {
    showPrompt,
    isIos,
    isStandalone,
    canInstallIos,
    canInstallAndroid,
    dismissPrompt,
    triggerIosPrompt,
    triggerAndroidPrompt
  };
}
