<template>
  <button
    @click="toggleLanguage"
    class="border-2 border-black flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 hover:bg-white text-gray-500 hover:text-emerald-600 transition-all"
    :title="nextLocaleName"
  >
    <Icon name="hugeicons:translate" class="text-xl" />
  </button>
</template>

<script setup lang="ts">
const { locale, setLocale, locales } = useI18n();
const PREFERRED_LOCALE_STORAGE_KEY = 'pikmin-preferred-locale';
const I18N_COOKIE_KEY = 'i18n_redirected';

const currentLocaleText = computed(() => {
  return locale.value === 'zh' ? '中' : 'EN';
});

const nextLocaleName = computed(() => {
  const next = locale.value === 'zh' ? 'en' : 'zh';
  const formatting = (locales.value as any[]).find(l => l.code === next);
  return formatting ? formatting.name : next;
});

const persistLocalePreference = (code: 'zh' | 'en') => {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(PREFERRED_LOCALE_STORAGE_KEY, code);
  } catch {
    // Some privacy modes can block localStorage; the runtime locale still changes.
  }
  document.cookie = `${I18N_COOKIE_KEY}=${code}; path=/; max-age=31536000; SameSite=Lax`;
};

const toggleLanguage = async () => {
  const next: 'zh' | 'en' = locale.value === 'zh' ? 'en' : 'zh';
  await setLocale(next);
  persistLocalePreference(next);
};
</script>
