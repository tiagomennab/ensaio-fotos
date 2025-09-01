import { test, expect } from '@playwright/test'

const routes = [
  { path: '/', label: 'home' },
  { path: '/gallery', label: 'gallery' },
]

test.describe('Global navigation bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('site-navbar')).toBeVisible()
  })

  test('navbar is sticky and visible on load', async ({ page }) => {
    const navbar = page.getByTestId('site-navbar')
    await expect(navbar).toBeVisible()
    await page.mouse.wheel(0, 2000)
    await expect(navbar).toBeVisible()
  })

  test('primary links navigate across pages', async ({ page }) => {
    const clickLink = async (href: string) => {
      await page.locator(`nav a[href="${href}"]`).first().click()
      await expect(page).toHaveURL(new RegExp(`${href}$`))
      await expect(page.getByTestId('site-navbar')).toBeVisible()
    }

    await clickLink('/gallery')
    await clickLink('/packages')
    await clickLink('/generate')
    await clickLink('/models')
  })
})


