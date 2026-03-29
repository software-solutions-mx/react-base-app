import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useLocale() {
  const { i18n } = useTranslation()

  const changeLocale = useCallback(
    async (locale) => {
      await i18n.changeLanguage(locale)
      document.documentElement.lang = locale
    },
    [i18n],
  )

  return {
    locale: i18n.resolvedLanguage ?? i18n.language,
    changeLocale,
    isRTL: ['ar', 'he', 'fa'].includes(i18n.language),
  }
}
