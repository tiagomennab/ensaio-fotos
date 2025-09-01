# 🔗 GUIA DE CONFIGURAÇÃO DE WEBHOOKS

## 📋 Visão Geral

Este guia explica como configurar completamente os webhooks para a aplicação Ensaio Fotos, incluindo webhooks do Replicate (IA) e Asaas (pagamentos).

---

## 🤖 WEBHOOKS REPLICATE (IA)

### URLs dos Webhooks

**Desenvolvimento:**
- Training: `http://localhost:3002/api/webhooks/training`
- Generation: `http://localhost:3002/api/webhooks/generation`

**Produção:**
- Training: `https://[your-domain]/api/webhooks/training`
- Generation: `https://[your-domain]/api/webhooks/generation`

### Configuração no Replicate

1. **Acesse:** [Replicate Dashboard](https://replicate.com/account)
2. **Vá para:** Settings → Webhooks
3. **Adicione os endpoints:**
   - URL: `https://[your-domain]/api/webhooks/training`
   - Events: `start`, `output`, `logs`, `completed`
   - Secret: Gere um secret seguro

### Variáveis de Ambiente

```env
# Token da API (já configurado)
REPLICATE_API_TOKEN="r8_aKGAAxZyfvl2nur07hL7zZ7C60Mt12v4LzkhG"

# Secret para validação de webhooks
REPLICATE_WEBHOOK_SECRET="your-secure-webhook-secret-here"
```

### Eventos Suportados

- `starting`: Treinamento/geração iniciado
- `processing`: Em processamento
- `succeeded`: Concluído com sucesso
- `failed`: Falhou
- `canceled`: Cancelado

---

## 💳 WEBHOOKS ASAAS (PAGAMENTOS)

### URLs dos Webhooks

**Desenvolvimento:**
- Webhook: `http://localhost:3002/api/payments/asaas/webhook`

**Produção:**
- Webhook: `https://[your-domain]/api/payments/asaas/webhook`

### Configuração no Asaas

1. **Acesse:** [Asaas Dashboard](https://sandbox.asaas.com) (ou produção)
2. **Vá para:** Integrações → Webhooks
3. **Configure:**
   - URL: `https://[your-domain]/api/payments/asaas/webhook`
   - Token: Gere um token seguro
   - Eventos: Todos relacionados a pagamentos

### Variáveis de Ambiente

```env
# API Key (já configurado)
ASAAS_API_KEY="$aact_hmlg_..."
ASAAS_ENVIRONMENT="sandbox"

# Token para validação de webhooks
ASAAS_WEBHOOK_TOKEN="your-secure-webhook-token-here"
```

### Eventos Suportados

- `PAYMENT_CONFIRMED`: Pagamento confirmado
- `PAYMENT_RECEIVED`: Pagamento recebido
- `PAYMENT_OVERDUE`: Pagamento em atraso
- `PAYMENT_DELETED`: Pagamento deletado
- `PAYMENT_REFUNDED`: Pagamento estornado
- `SUBSCRIPTION_EXPIRED`: Assinatura expirada
- `SUBSCRIPTION_CANCELLED`: Assinatura cancelada
- `SUBSCRIPTION_REACTIVATED`: Assinatura reativada

---

## 🛡️ SEGURANÇA DOS WEBHOOKS

### Replicate - Verificação HMAC-SHA256

```javascript
function verifyWebhookSignature(body, signature, secret) {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex')
  
  const expectedSignature = `sha256=${computedSignature}`
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

**Headers esperados:**
- `webhook-signature`: Assinatura HMAC-SHA256

### Asaas - Verificação por Token

```javascript
const asaasAccessToken = request.headers.get('asaas-access-token')
if (asaasAccessToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Headers esperados:**
- `asaas-access-token`: Token configurado no Asaas

---

## 🧪 TESTANDO WEBHOOKS

### Script de Teste Incluído

Use o script `test-webhooks.js` para testar localmente:

```bash
# Testar webhook de treinamento
node test-webhooks.js replicate-training 3002

# Testar webhook de geração
node test-webhooks.js replicate-generation 3002

# Testar webhook de pagamento
node test-webhooks.js asaas-payment 3002
```

### Testando com cURL

**Webhook Replicate Training:**
```bash
curl -X POST http://localhost:3002/api/webhooks/training \
  -H "Content-Type: application/json" \
  -H "webhook-signature: sha256=..." \
  -d '{
    "id": "test-job-123",
    "status": "succeeded",
    "output": {
      "weights": "https://example.com/model.tar"
    }
  }'
```

**Webhook Asaas:**
```bash
curl -X POST http://localhost:3002/api/payments/asaas/webhook \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: your-token" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pay_123",
      "customer": "cus_123",
      "value": 29.90
    }
  }'
```

---

## 📊 MONITORAMENTO E LOGS

### Logs dos Webhooks

Os webhooks geram logs detalhados para debug:

```javascript
console.log('Training webhook processed for model ${model.id}: ${payload.status}')
console.log('Asaas Webhook received:', { event, payment: payment?.id, timestamp })
```

### Verificação de Status

**Health Check:**
```bash
curl http://localhost:3002/api/health
```

**Monitoring Metrics:**
```bash
curl http://localhost:3002/api/monitoring/metrics
```

---

## 🚀 CONFIGURAÇÃO PARA PRODUÇÃO

### 1. Domínio e HTTPS

- Configure um domínio público com HTTPS
- Use certificado SSL válido
- Certifique-se de que as URLs são acessíveis externamente

### 2. Secrets de Produção

Gere secrets seguros para produção:

```bash
# Gerar secret para Replicate
openssl rand -hex 32

# Gerar token para Asaas
openssl rand -hex 16
```

### 3. Configuração no Vercel

Adicione as variáveis de ambiente no Vercel Dashboard:

```env
REPLICATE_WEBHOOK_SECRET="[secret-seguro-produção]"
ASAAS_WEBHOOK_TOKEN="[token-seguro-produção]"
ASAAS_API_KEY="[key-produção-asaas]"
ASAAS_ENVIRONMENT="production"
```

### 4. Configuração External Services

**No Replicate:**
- URL: `https://[seu-dominio]/api/webhooks/training`
- Secret: Use o secret configurado no Vercel

**No Asaas Produção:**
- URL: `https://[seu-dominio]/api/payments/asaas/webhook`
- Token: Use o token configurado no Vercel

---

## ❗ TROUBLESHOOTING

### Problemas Comuns

**Webhook não recebe chamadas:**
1. Verifique se a URL está acessível externamente
2. Confirme se o HTTPS está funcionando
3. Verifique os logs do provedor (Replicate/Asaas)

**Erro 401 Unauthorized:**
1. Verifique se os secrets/tokens estão corretos
2. Confirme se os headers estão sendo enviados
3. Verifique se as variáveis de ambiente estão configuradas

**Webhook recebe mas não processa:**
1. Verifique os logs da aplicação
2. Confirme se o payload está no formato esperado
3. Verifique se os IDs dos jobs/pagamentos existem no banco

### Debug Mode

Para debug detalhado, adicione no `.env.local`:

```env
LOG_LEVEL="debug"
DEBUG="webhook:*"
```

---

## 📞 SUPORTE

Para problemas específicos:

1. **Replicate:** [Docs](https://replicate.com/docs/webhooks)
2. **Asaas:** [Docs](https://docs.asaas.com/docs/webhooks)
3. **Logs da aplicação:** Verifique console/Vercel logs

---

**Última atualização:** 20/08/2025
**Versão:** 1.0