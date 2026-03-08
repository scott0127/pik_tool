export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      (window as any).deferredPwaPrompt = e;
      // Dispatch a custom event in case components are already mounted
      window.dispatchEvent(new Event('pwa-prompt-ready'));
    });
  }
});
