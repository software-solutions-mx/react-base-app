import { expect, test } from '@playwright/test'

const MAIN_CONTENT_LABEL_PATTERN =
  /^(contenido principal|main content|contenu principal|conteudo principal)$/i

test('renders base shell with SEO title and main landmark', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Software Solutions/i)
  const mainLandmark = page.getByRole('main')
  await expect(mainLandmark).toHaveCount(1)
  await expect(mainLandmark).toHaveAttribute('aria-label', MAIN_CONTENT_LABEL_PATTERN)
})
