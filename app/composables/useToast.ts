export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

// Global toast state
const toastQueue = ref<ToastOptions[]>([]);
const currentToast = ref<ToastOptions | null>(null);
const isShowing = ref(false);

export function useToast() {
  const showToast = (options: ToastOptions | string) => {
    const toastOptions: ToastOptions = typeof options === 'string' 
      ? { message: options, type: 'info', duration: 1500 }
      : { type: 'info', duration: 1500, ...options };
    
    toastQueue.value.push(toastOptions);
    
    if (!isShowing.value) {
      processQueue();
    }
  };

  const processQueue = () => {
    if (toastQueue.value.length === 0) {
      isShowing.value = false;
      currentToast.value = null;
      return;
    }

    isShowing.value = true;
    const toast = toastQueue.value.shift()!;
    
    // Set new toast (this will trigger Toast component's watch)
    currentToast.value = { ...toast }; // Create new object to ensure reactivity

    setTimeout(() => {
      currentToast.value = null; // Clear before processing next
      setTimeout(() => {
        processQueue();
      }, 50); // Small delay to allow transition
    }, toast.duration! + 300); // Add 300ms for transition
  };

  // Convenience methods
  const success = (message: string, duration?: number) => {
    showToast({ message, type: 'success', duration });
  };

  const error = (message: string, duration?: number) => {
    showToast({ message, type: 'error', duration });
  };

  const info = (message: string, duration?: number) => {
    showToast({ message, type: 'info', duration });
  };

  const warning = (message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration });
  };

  return {
    showToast,
    success,
    error,
    info,
    warning,
    currentToast: readonly(currentToast),
    isShowing: readonly(isShowing)
  };
}
