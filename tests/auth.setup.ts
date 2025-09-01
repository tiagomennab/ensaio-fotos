import { test, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

test('authenticate (API credentials)', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL || 'lucasamouraa@gmail.com'
  const password = process.env.TEST_USER_PASSWORD || '123456'

  const csrfRes = await page.request.get('/api/auth/csrf')
  const csrfJson = await csrfRes.json()
  const csrfToken = csrfJson?.csrfToken
  if (!csrfToken) throw new Error('CSRF token not found')

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: '/dashboard'
  }).toString()

  const res = await page.request.post('/api/auth/callback/credentials?json=true', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: body
  })

  if (res.status() >= 400) {
    const txt = await res.text()
    throw new Error(`Login failed: ${res.status()} ${txt}`)
  }

  await page.goto('/dashboard')
  await expect(page.getByTestId('site-navbar')).toBeVisible({ timeout: 15000 })
  await page.context().storageState({ path: authFile })
})



