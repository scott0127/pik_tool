import type { Ref } from 'vue';

const PREFERRED_LOCALE_STORAGE_KEY = 'pikmin-preferred-locale';
const I18N_COOKIE_KEY = 'i18n_redirected';
const DEFAULT_LOCALE = 'zh';

const isSupportedLocale = (value: string | null): value is 'zh' | 'en' =>
  value === 'zh' || value === 'en';

const persistLocaleCookie = (code: 'zh' | 'en') => {
  document.cookie = `${I18N_COOKIE_KEY}=${code}; path=/; max-age=31536000; SameSite=Lax`;
};

export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = nuxtApp.$i18n as {
    locale: Ref<string>;
    setLocale: (locale: string) => Promise<void> | void;
  };

  let storedPreference: string | null = null;
  try {
    storedPreference = localStorage.getItem(PREFERRED_LOCALE_STORAGE_KEY);
  } catch {
    storedPreference = null;
  }

  const preferredLocale = isSupportedLocale(storedPreference) ? storedPreference : DEFAULT_LOCALE;

  if (!isSupportedLocale(storedPreference)) {
    try {
      localStorage.setItem(PREFERRED_LOCALE_STORAGE_KEY, preferredLocale);
    } catch {
      // Some privacy modes can block localStorage; cookie/default locale still applies.
    }
  }

  persistLocaleCookie(preferredLocale);

  if (i18n.locale.value !== preferredLocale) {
    await i18n.setLocale(preferredLocale);
  }
});
