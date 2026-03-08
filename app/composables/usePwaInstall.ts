import { ref, onMounted, onUnmounted } from 'vue';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const showPrompt = ref(false);
  const isIos = ref(false);
  const isStandalone = ref(false);

  // Checks if user is on iOS devices (iPhone, iPad, iPod)
  const checkIsIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  // Checks if the app is already installed and running in standalone mode
  const checkIsStandalone = () => {
    // Media query works for both iOS and Android
    const mqStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // iOS specific fallback
    const navStandalone = (window.navigator as any).standalone;
    return mqStandalone || navStandalone;
  };

  const handleBeforeInstallPrompt = (e: Event) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt.value = e as BeforeInstallPromptEvent;
    
    // Check if we haven't already dismissed it recently (optional check)
    const hasDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (!hasDismissed && !isStandalone.value) {
      showPrompt.value = true;
    }
  };

  const checkIosPrompt = () => {
    isIos.value = checkIsIos();
    isStandalone.value = checkIsStandalone();

    // If it's iOS and not standalone, and user hasn't dismissed it, show the prompt manually
    if (isIos.value && !isStandalone.value) {
      const hasDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
      if (!hasDismissed) {
        showPrompt.value = true;
      }
    }
  };

  onMounted(() => {
    // Listen for the native Android/Desktop installation prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initial check for iOS PWA eligibility
    checkIosPrompt();
  });

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  });

  const installPwa = async () => {
    if (!deferredPrompt.value) return;

    // Show the native install prompt
    deferredPrompt.value.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice;
    
    // We no longer need the prompt. Clear it up.
    deferredPrompt.value = null;

    if (outcome === 'accepted') {
      showPrompt.value = false;
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }
  };

  const dismissPrompt = () => {
    showPrompt.value = false;
    // Remember the user's choice for a while
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return {
    showPrompt,
    isIos,
    isStandalone,
    installPwa,
    dismissPrompt
  };
}
