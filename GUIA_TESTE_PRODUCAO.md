# 🚀 Guia de Teste - Simulação Produção Real

## 📊 Resultados dos Testes Executados

### ✅ Replicate API - SUCESSO
- **Status**: Conexão estabelecida com sucesso
- **Account**: vibephoto (organization plan)
- **Tokens**: Token válido configurado
- **Últimas operações**: 4 predictions encontradas (última: succeeded)
- **Webhooks**: Configurados corretamente (requerem REPLICATE_WEBHOOK_SECRET)

### ⚠️ Asaas Sandbox - CONFIGURADO
- **Status**: API Key sandbox configurada
- **Environment**: Sandbox ativo
- **Webhook Token**: Configurado para segurança
- **Teste**: Webhook funcional (requer ASAAS_API_KEY válida)

## 🔧 Configuração para Ambiente de Produção

### 1. Variáveis de Ambiente Obrigatórias

```env
# PRODUÇÃO - Copie este template para .env.production
NODE_ENV=production
NEXTAUTH_SECRET="sua-chave-secreta-super-forte-256-bits"
NEXTAUTH_URL="https://seu-dominio.vercel.app"

# Database - Supabase Production
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# Storage - AWS S3 Produção
STORAGE_PROVIDER="aws"
AWS_ACCESS_KEY_ID="sua-aws-key"
AWS_SECRET_ACCESS_KEY="sua-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="seu-bucket-producao"

# AI Provider - Replicate Produção
AI_PROVIDER="replicate"
REPLICATE_API_TOKEN="r8_sua_chave_producao"
REPLICATE_WEBHOOK_SECRET="webhook-secret-super-forte"

# Payment - Asaas Produção
ASAAS_API_KEY="$aact_prod_sua_chave_producao"
ASAAS_ENVIRONMENT="production"
ASAAS_WEBHOOK_TOKEN="webhook-token-super-forte"

# OAuth - Produção
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

### 2. Passo a Passo - Configuração Replicate

#### 2.1 Preparar Conta Replicate
```bash
# 1. Acesse: https://replicate.com/account/api-tokens
# 2. Crie um novo token para produção
# 3. Adicione créditos à conta (mínimo $10 recomendado)
# 4. Configure webhook URLs em: https://replicate.com/account/webhooks
```

#### 2.2 URLs de Webhook Replicate (Produção)
```
Training: https://seu-dominio.vercel.app/api/webhooks/training
Generation: https://seu-dominio.vercel.app/api/webhooks/generation
```

#### 2.3 Teste Manual Replicate
```bash
# Execute no seu ambiente:
node scripts/test-replicate-integration.js

# Ou teste específico:
node test-replicate-production.js
```

### 3. Passo a Passo - Configuração Asaas

#### 3.1 Migrar Sandbox → Produção
```bash
# 1. Acesse: https://www.asaas.com/
# 2. Crie conta empresarial
# 3. Complete verificação de identidade
# 4. Gere API Key de produção em: Configurações > API Keys
# 5. Configure webhook em: Configurações > Webhooks
```

#### 3.2 URL de Webhook Asaas (Produção)
```
Webhook URL: https://seu-dominio.vercel.app/api/payments/asaas/webhook
Token de Segurança: [configure um token forte]
```

#### 3.3 Teste Manual Asaas
```bash
# Teste webhook local (sandbox):
node test-webhooks.js asaas-payment 3002

# Simular pagamento real:
curl -X POST https://sandbox.asaas.com/api/v3/payments \
  -H "access_token: sua-api-key-sandbox" \
  -d "customer=cus_teste&value=29.90&dueDate=2025-08-21"
```

## 🧪 Procedimentos de Teste em Produção

### Fase 1: Teste de Conectividade (SEM CUSTOS)
```bash
# 1. Verificar health checks
curl https://seu-dominio.vercel.app/api/health

# 2. Verificar autenticação
curl https://seu-dominio.vercel.app/api/auth/session

# 3. Testar upload de arquivos (local)
# Acessar: https://seu-dominio.vercel.app/models
# Fazer upload de 1 foto de teste
```

### Fase 2: Teste AI com Créditos Mínimos (BAIXO CUSTO)
```bash
# 1. Configurar training com parâmetros mínimos:
# - Resolução: 512x512 (mais barato)
# - Steps: 500 (mínimo)
# - 5-10 fotos apenas

# 2. Executar training de teste:
# Acessar dashboard → Treinar Modelo → Upload mínimo

# 3. Aguardar webhook de conclusão (monitoring logs)
```

### Fase 3: Teste de Pagamentos (SANDBOX FIRST)
```bash
# 1. Testar fluxo completo no sandbox:
# - Cadastro de usuário
# - Upgrade de plano
# - Webhook de confirmação

# 2. Verificar logs do Asaas sandbox:
# https://sandbox.asaas.com/api/v3/payments

# 3. Validar atualização de créditos na aplicação
```

## 📊 Monitoramento e Logs

### Replicate - Onde Verificar
- **Dashboard**: https://replicate.com/account
- **API Logs**: Histórico de trainings/predictions
- **Webhook Logs**: Status das notificações
- **Billing**: Uso de créditos em tempo real

### Asaas - Onde Verificar
- **Sandbox**: https://sandbox.asaas.com/
- **Produção**: https://www.asaas.com/
- **Webhook Logs**: Configurações > Webhooks > Logs
- **Transações**: Relatórios > Vendas

### Aplicação - Endpoints de Monitoring
```bash
# Health check geral
GET https://seu-dominio.vercel.app/api/health

# Métricas do sistema (admin)
GET https://seu-dominio.vercel.app/api/monitoring/metrics

# Logs de segurança (admin)
GET https://seu-dominio.vercel.app/admin/security
```

## 🚨 Checklist Pré-Produção

### ✅ Segurança
- [ ] NEXTAUTH_SECRET gerado com 256 bits
- [ ] Webhook secrets configurados
- [ ] API Keys de produção (não sandbox)
- [ ] CORS configurado para domínio real
- [ ] Rate limiting ativo

### ✅ Infraestrutura
- [ ] Database migração completa
- [ ] S3 bucket criado e configurado
- [ ] CDN configurado (opcional)
- [ ] Monitoramento ativo
- [ ] Backup automático DB

### ✅ Providers
- [ ] Replicate: Créditos adicionados
- [ ] Asaas: Conta verificada
- [ ] OAuth: Apps configurados
- [ ] Storage: Permissões corretas

### ✅ Testes Finais
- [ ] Health check respondendo
- [ ] Login funcionando
- [ ] Upload de arquivos OK
- [ ] Training teste (baixo custo)
- [ ] Generation teste (baixo custo)
- [ ] Webhook recebimento OK
- [ ] Pagamento sandbox OK

## 🔥 Scripts de Teste Rápido

### Teste Completo Automatizado
```bash
# Execute este comando para teste full:
npm run test:production

# Ou individual:
node scripts/test-replicate-integration.js
node test-webhooks.js asaas-payment 3002
node test-webhooks.js replicate-training 3002
```

### Simulação de Carga (Opcional)
```bash
# Teste múltiplas requisições simultâneas:
node scripts/load-test.js

# Teste webhook stress:
for i in {1..10}; do
  node test-webhooks.js asaas-payment 3002 &
done
```

## 💡 Dicas de Produção

1. **Custos**: Inicie com créditos mínimos para validar
2. **Monitoring**: Configure alertas para falhas de webhook
3. **Backup**: Execute backup DB antes de deploy
4. **Rollback**: Mantenha versão anterior pronta
5. **Logs**: Ative logging detalhado nas primeiras 48h

## 🆘 Troubleshooting Comum

### Replicate Falhas
```bash
# Erro 401: Token inválido
# Verificar: REPLICATE_API_TOKEN

# Erro 402: Sem créditos
# Solução: Adicionar créditos na conta

# Webhook timeout: REPLICATE_WEBHOOK_SECRET incorreto
# Verificar: Secret nos settings do Replicate
```

### Asaas Falhas
```bash
# Erro 401: API Key inválida
# Verificar: ASAAS_API_KEY e ASAAS_ENVIRONMENT

# Webhook 403: Token incorreto
# Verificar: ASAAS_WEBHOOK_TOKEN

# Payments failed: Conta não verificada
# Solução: Completar verificação no Asaas
```

---

**🎯 Próximo Passo**: Execute os testes fase por fase para validar cada componente antes do lançamento completo.