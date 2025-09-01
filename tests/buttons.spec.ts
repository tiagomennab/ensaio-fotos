import { test, expect } from '@playwright/test'

const ROUTES = [
  '/dashboard',
  '/models',
  '/generate',
  '/gallery',
  '/packages',
  '/billing/upgrade',
]

const DANGEROUS_BUTTON_REGEX = /(delete|remover|excluir|cancel|cancelar|unsubscribe|unlock|desbloquear|pay|pagar|confirm|confirmar)/i

async function loginUI(page) {
  const email = process.env.TEST_USER_EMAIL || 'lucasamouraa@gmail.com'
  const password = process.env.TEST_USER_PASSWORD || '123456'
  // Faz login via NextAuth credentials usando a API para evitar cliques em OAuth
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

  // Agora a sessão está no contexto; navega para uma página autenticada
  await page.goto('/dashboard', { waitUntil: 'load' })
  await expect(page.getByTestId('site-navbar')).toBeVisible({ timeout: 20000 })
}

test.describe('Smoke de botões pós-login (produção)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUI(page)
    await expect(page.getByTestId('site-navbar')).toBeVisible()
  })

  test('Varre botões visíveis e valida que a UI não quebra', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'load' })
      await expect(page.getByTestId('site-navbar')).toBeVisible()

      const buttons = await page
        .getByRole('button')
        .filter({ hasNotText: DANGEROUS_BUTTON_REGEX })
        .elementHandles()

      const maxToTest = Math.min(buttons.length, 10)

      for (let i = 0; i < maxToTest; i++) {
        const beforeURL = page.url()
        const btn = buttons[i]
        const label = (await btn.innerText().catch(() => '')) || '<sem label>'
        const box = await btn.boundingBox()
        if (!box) continue

        await btn.click().catch(() => {})
        const maybeNavigated = (await page.url()) !== beforeURL
        await expect(page.getByTestId('site-navbar')).toBeVisible()

        test.info().attachments.push({
          name: `btn@${route}@${i}::${label}`.slice(0, 100),
          contentType: 'text/plain',
          body: Buffer.from(`clicked: ${label} | navigated=${maybeNavigated}`),
        })
      }

      // Valida alguns links não perigosos
      const links = await page.getByRole('link').elementHandles()
      const maxLinks = Math.min(links.length, 6)
      for (let j = 0; j < maxLinks; j++) {
        const l = links[j]
        const href = await l.getAttribute('href')
        if (!href || href.startsWith('#')) continue
        await l.click().catch(() => {})
        await expect(page.getByTestId('site-navbar')).toBeVisible()
        await page.goto(route, { waitUntil: 'load' })
      }
    }
  })
})


