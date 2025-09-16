# 🔗 Guia de Configuração do Webhook Replicate

Este guia mostra como configurar o webhook unificado do Replicate para receber notificações instantâneas de todos os jobs (geração, treinamento, upscale).

## 🎯 URL do Webhook

Configure **uma única URL** no Replicate para todos os tipos de job:

```
https://seu-dominio.vercel.app/api/webhooks/replicate
```

## 🔧 Configuração no Replicate

### 1. **Via Dashboard Web**

1. Acesse [replicate.com/account/webhooks](https://replicate.com/account/webhooks)
2. Clique em "Add webhook"
3. Configure:
   - **URL**: `https://seu-dominio.vercel.app/api/webhooks/replicate`
   - **Events**: Selecione todos
     - `predictions.start`
     - `predictions.output` 
     - `predictions.logs`
     - `predictions.completed`
   - **Secret**: Gere um secret seguro
4. Clique em "Create webhook"

### 2. **Via API (Recomendado)**

```bash
curl -X POST https://api.replicate.com/v1/webhooks \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-dominio.vercel.app/api/webhooks/replicate",
    "events": ["start", "output", "logs", "completed"]
  }'
```

### 3. **Via SDK JavaScript/Python**

```javascript
// JavaScript/Node.js
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

await replicate.webhooks.default.create({
  url: "https://seu-dominio.vercel.app/api/webhooks/replicate",
  events: ["start", "output", "logs", "completed"]
})
```

```python
# Python
import replicate

replicate.webhooks.create(
  url="https://seu-dominio.vercel.app/api/webhooks/replicate",
  events=["start", "output", "logs", "completed"]
)
```

## 🔐 Variáveis de Ambiente

Configure no Vercel (ou seu host):

```bash
# Obrigatório para webhooks seguros
REPLICATE_WEBHOOK_SECRET=seu_webhook_secret_aqui

# Já existente
REPLICATE_API_TOKEN=seu_token_aqui
```

## 🎭 Como Funciona

### **1. Detecção Automática de Job**
O webhook unificado detecta automaticamente o tipo de job:

```
Job ID recebido → Busca no banco:
├── Generation (prompt normal) → Processa como geração
├── Generation (prompt [UPSCALED]) → Processa como upscale  
└── AIModel → Processa como treinamento
```

### **2. Fluxo de Webhook**

```
Replicate Job Status Change
        ↓
POST /api/webhooks/replicate
        ↓
Detectar tipo de job automaticamente
        ↓
Processar e atualizar banco
        ↓ 
Broadcast via WebSocket
        ↓
Frontend atualiza instantaneamente
```

### **3. Eventos Suportados**

| Evento Replicate | Status Final | Ação |
|------------------|--------------|------|
| `start` | `PROCESSING` | Atualiza status |
| `processing` | `PROCESSING` | Mantém status |
| `succeeded` | `COMPLETED` | Baixa e armazena imagens |
| `failed` | `FAILED` | Refund de créditos |
| `canceled` | `CANCELLED` | Refund de créditos |

## 🚀 Testando o Webhook

### **1. Teste Manual**

```bash
curl -X POST https://seu-dominio.vercel.app/api/webhooks/replicate \
  -H "Content-Type: application/json" \
  -H "webhook-signature: sha256=sua_assinatura" \
  -d '{
    "id": "test-job-id",
    "status": "succeeded",
    "output": ["https://exemplo.com/imagem.jpg"]
  }'
```

### **2. Verificar Logs**

No Vercel Dashboard > Functions > Logs, procure por:

```
🔔 Unified Replicate webhook received
🎯 Detected job type: generation for job abc123
✅ Webhook processed in 250ms
```

### **3. Testar WebSocket**

No browser console da galeria:

```javascript
// Deve mostrar conexão ativa
console.log('Connection status: webhook-driven system active')
```

## 🔍 Debugging

### **Problemas Comuns**

1. **Webhook não recebe eventos**
   - Verificar URL está correta e acessível
   - Verificar se webhook foi criado no Replicate
   - Verificar logs do Vercel

2. **Signature validation failed**
   - Verificar `REPLICATE_WEBHOOK_SECRET` está configurado
   - Verificar secret no Replicate coincide

3. **Jobs não são encontrados**
   - Verificar se jobs foram criados via sua aplicação
   - Verificar jobId no banco de dados

### **Logs de Debug**

```bash
# Ver logs do webhook
vercel logs --app=seu-app | grep "webhook"

# Ver logs do WebSocket
vercel logs --app=seu-app | grep "SSE"
```

## 📊 Monitoramento

### **Endpoint de Status**

```bash
GET https://seu-dominio.vercel.app/api/health
```

Retorna:
```json
{
  "status": "healthy",
  "webhook": "configured",
  "websocket": "active",
  "connections": 5
}
```

### **Métricas no Console**

Na galeria, verifique o console do browser:

```
✅ SSE connection opened - event-driven system active
📡 Server info: {pollingDisabled: true, webhookEnabled: true}
📥 SSE event received: generation_status_changed
```

## 🎉 Validação Final

Para confirmar que tudo está funcionando:

1. ✅ **Webhook configurado** no Replicate
2. ✅ **Secret configurado** no Vercel 
3. ✅ **WebSocket conectado** na galeria
4. ✅ **Jobs atualizando** automaticamente
5. ✅ **Zero polling** - apenas eventos

### **Teste End-to-End**

1. Gerar uma imagem
2. Verificar logs do webhook
3. Verificar atualização automática na galeria
4. Fazer upscale 
5. Verificar notificação instantânea

**Sistema completamente event-driven funcionando! 🚀**

## 📚 Documentação Adicional

- [Replicate Webhooks Documentation](https://replicate.com/docs/topics/webhooks)
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Vercel Functions](https://vercel.com/docs/functions)