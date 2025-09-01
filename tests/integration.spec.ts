import { test, expect } from '@playwright/test'

async function loginUI(page) {
  await page.goto('/auth/signin')
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
  await page.getByLabel(/password|senha/i).fill(process.env.TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: /sign in|entrar|login/i }).click()
  await expect(page).toHaveURL(/dashboard|models|generate|gallery/i, { timeout: 20000 })
}

test.describe('Integração Asaas/Replicate (pós-login)', () => {
  test('Asaas: registrar webhook, criar cliente e assinatura (sandbox)', async ({ page, request }) => {
    test.skip(!process.env.ASAAS_API_KEY, 'ASAAS_API_KEY não definido')

    await loginUI(page)

    // Registrar webhook
    const reg = await request.post('/api/payments/asaas/register-webhook')
    expect([200]).toContain(reg.status())

    // Criar cliente
    const cust = await request.post('/api/payments/asaas/create-customer', {
      data: {
        name: 'Playwright QA',
        email: `qa+${Date.now()}@example.com`,
        cpfCnpj: '12345678909',
        phone: '11999999999'
      }
    })
    expect([200]).toContain(cust.status())
    const cjson = await cust.json()
    const customerId = cjson?.customer?.id
    test.skip(!customerId, 'Asaas customerId ausente na resposta')

    // Criar assinatura sandbox (cartão teste)
    const sub = await request.post('/api/payments/asaas/create-subscription', {
      data: {
        customerId,
        plan: 'PREMIUM',
        cycle: 'MONTHLY',
        billingType: 'CREDIT_CARD',
        creditCard: { holderName: 'QA Tester', number: '4111111111111111', expiryMonth: '12', expiryYear: '2030', ccv: '123' },
        creditCardHolderInfo: { name: 'QA Tester', email: `qa+${Date.now()}@example.com`, cpfCnpj: '12345678909', postalCode: '01311000', addressNumber: '100', phone: '11999999999' }
      }
    })
    expect([200]).toContain(sub.status())
  })

  test('Replicate: tentar treino/geração (se houver modelo READY)', async ({ page, request }) => {
    test.skip(!process.env.REPLICATE_API_TOKEN, 'REPLICATE_API_TOKEN não definido')

    await loginUI(page)

    // Buscar modelos do usuário
    const modelsRes = await request.get('/api/models')
    expect([200]).toContain(modelsRes.status())
    const models = await modelsRes.json()
    const ready = (models?.data || []).find((m: any) => m.status === 'READY')

    test.skip(!ready, 'Nenhum modelo READY para geração')

    // Disparar geração simples
    const gen = await request.post('/api/ai/generate', {
      data: { modelId: ready.id, prompt: 'professional headshot, soft light', variations: 1 }
    })
    expect([200]).toContain(gen.status())
  })
})


