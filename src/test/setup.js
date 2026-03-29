import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next')

  return {
    ...actual,
    useTranslation: () => ({
      t: (key, options) => options?.defaultValue ?? key,
      i18n: {
        language: 'es',
        resolvedLanguage: 'es',
        changeLanguage: async () => {},
      },
    }),
  }
})

afterEach(() => {
  cleanup()
})
