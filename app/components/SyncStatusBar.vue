<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="isVisible"
      class="fixed z-50 sync-bar-position"
    >
      <!-- Pending: countdown + force upload -->
      <div
        v-if="syncStatus === 'pending'"
        class="sync-bar sync-bar-pending"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-amber-500 text-lg flex-shrink-0 sync-pulse">⏳</span>
          <span class="text-xs sm:text-sm font-medium text-gray-700 truncate">
            {{ $t('collection.sync.countdown', { n: syncCountdown }) }}
          </span>
        </div>
        <button
          @click="handleForceSync"
          class="flex-shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          {{ $t('collection.sync.force_upload') }}
        </button>
      </div>

      <!-- Syncing: spinner + retry info -->
      <div
        v-else-if="syncStatus === 'syncing'"
        class="sync-bar sync-bar-syncing"
      >
        <div class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs sm:text-sm font-medium text-gray-700">
            <template v-if="syncRetryAttempt > 1">
              {{ $t('collection.sync.retrying', { k: syncRetryAttempt, n: 3 }) }}
            </template>
            <template v-else>
              {{ $t('collection.sync.syncing') }}
            </template>
          </span>
        </div>
      </div>

      <!-- Success -->
      <div
        v-else-if="syncStatus === 'success'"
        class="sync-bar sync-bar-success"
      >
        <div class="flex items-center gap-2">
          <span class="text-emerald-500 text-lg flex-shrink-0">✅</span>
          <span class="text-xs sm:text-sm font-medium text-emerald-700">
            {{ $t('collection.sync.success') }}
          </span>
        </div>
      </div>

      <!-- Error: with retry -->
      <div
        v-else-if="syncStatus === 'error'"
        class="sync-bar sync-bar-error"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-red-500 text-lg flex-shrink-0">❌</span>
          <span class="text-xs sm:text-sm font-medium text-red-700 truncate">
            {{ $t('collection.sync.error') }}
          </span>
        </div>
        <button
          @click="handleForceSync"
          class="flex-shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          {{ $t('collection.sync.retry') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { syncStatus, syncCountdown, hasPendingChanges, syncRetryAttempt, forceSync } = useCollection();
const authStore = useAuthStore();

const isVisible = computed(() => {
  return authStore.isAuthenticated.value && syncStatus.value !== 'idle';
});

const handleForceSync = async () => {
  await forceSync();
};
</script>

<style scoped>
.sync-bar-position {
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 2rem);
  max-width: 400px;
}

@media (min-width: 640px) {
  .sync-bar-position {
    left: auto;
    right: 1.5rem;
    transform: none;
    width: auto;
    max-width: none;
  }
}

.sync-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.875rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

@media (min-width: 640px) {
  .sync-bar {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
  }
}

.sync-bar-pending {
  background: rgba(255, 251, 235, 0.92);
  border-color: rgba(245, 158, 11, 0.2);
}

.sync-bar-syncing {
  background: rgba(239, 246, 255, 0.92);
  border-color: rgba(59, 130, 246, 0.2);
}

.sync-bar-success {
  background: rgba(236, 253, 245, 0.92);
  border-color: rgba(16, 185, 129, 0.2);
}

.sync-bar-error {
  background: rgba(254, 242, 242, 0.92);
  border-color: rgba(239, 68, 68, 0.2);
}

@keyframes sync-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.sync-pulse {
  animation: sync-pulse 2s ease-in-out infinite;
}
</style>
