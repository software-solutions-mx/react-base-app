import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { IS_DEV, TRANSLATION_URL } from '../config/env'
import { DEFAULT_LOCALE, getLocaleMeta } from './locales'
import { NAMESPACES, SUPPORTED_LOCALES } from './types'

i18n
  .use(LanguageDetector)
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    nonExplicitSupportedLngs: true,

    ns: [NAMESPACES.common],
    defaultNS: NAMESPACES.common,
    partialBundledLanguages: true,

    backend: {
      loadPath: TRANSLATION_URL,
      customHeaders: () => ({
        'Accept-Language': i18n.language,
      }),
      requestOptions: {
        cache: 'default',
        credentials: 'same-origin',
      },
    },

    detection: {
      order: ['navigator', 'htmlTag'],
      caches: [],
    },

    react: {
      useSuspense: true,
    },

    interpolation: {
      escapeValue: false,
    },

    saveMissing: IS_DEV,
    missingKeyHandler: (lngs, ns, key) => {
      const localeList = Array.isArray(lngs) ? lngs.join(', ') : String(lngs)
      console.warn(`[i18n] Missing key: ${ns}:${key} (${localeList})`)
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = getLocaleMeta(lng).htmlLang
})

export default i18n
