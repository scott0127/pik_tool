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

const currentLocaleText = computed(() => {
  return locale.value === 'zh' ? '中' : 'EN';
});

const nextLocaleName = computed(() => {
  const next = locale.value === 'zh' ? 'en' : 'zh';
  const formatting = (locales.value as any[]).find(l => l.code === next);
  return formatting ? formatting.name : next;
});

const toggleLanguage = () => {
  const next = locale.value === 'zh' ? 'en' : 'zh';
  setLocale(next);
};
</script>
