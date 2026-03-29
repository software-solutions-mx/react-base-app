import { expect, test } from '@playwright/test'

test('renders base shell with SEO title and main landmark', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Software Solutions/i)
  await expect(page.getByRole('main', { name: /contenido principal/i })).toHaveCount(1)
})
