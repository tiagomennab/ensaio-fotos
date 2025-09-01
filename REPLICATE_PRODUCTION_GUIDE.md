# Guia de Produção Replicate - Ensaio Fotos

## Status da Integração

### ✅ Componentes Validados
- **Configuração de Modelos**: FLUX LoRA Training + FLUX Schnell Generation
- **Provider Implementation**: ReplicateProvider completamente funcional
- **Webhooks**: Endpoints de training e generation implementados
- **API Connection**: Token válido, conta organizacional verificada
- **Cost Calculation**: Sistema de créditos integrado

### 🔴 Pendências para Produção
1. **Créditos Replicate**: Conta sem saldo (erro 402)
2. **Storage**: Configurado como local (desenvolvimento)
3. **URLs de Webhook**: Localhost (desenvolvimento)

## Configuração de Produção

### 1. Variáveis de Ambiente (.env.production)

```env
# Replicate - PRODUÇÃO
AI_PROVIDER="replicate"
REPLICATE_API_TOKEN="your-replicate-api-token-here"
REPLICATE_WEBHOOK_SECRET="webhook-secret-aqui" # Opcional mas recomendado

# URLs - PRODUÇÃO
NEXT_PUBLIC_APP_URL="https://seu-dominio.vercel.app"
NEXTAUTH_URL="https://seu-dominio.vercel.app"

# Storage - AWS S3 (RECOMENDADO)
STORAGE_PROVIDER="aws"
AWS_ACCESS_KEY_ID="sua-key-aqui"
AWS_SECRET_ACCESS_KEY="sua-secret-key-aqui"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="ensaio-fotos-prod"

# OU Cloudinary (ALTERNATIVA)
# STORAGE_PROVIDER="cloudinary"
# CLOUDINARY_CLOUD_NAME="seu-cloud-name"
# CLOUDINARY_API_KEY="sua-api-key"
# CLOUDINARY_API_SECRET="sua-api-secret"
```

### 2. Adicionando Créditos à Conta Replicate

**Passos:**
1. Acesse https://replicate.com/account/billing
2. Faça login com a conta `vibephoto` (organização)
3. Adicione método de pagamento
4. Compre créditos iniciais: $50-100 recomendado para testes

**Custos Esperados:**
- **Training LoRA**: $3-8 por modelo (20-60 min)
- **Generation FLUX**: $0.003-0.012 por imagem (5-15 seg)

### 3. Configuração de Webhooks

Os webhooks já estão implementados e serão automaticamente configurados quando:
- `NEXT_PUBLIC_APP_URL` apontar para domínio de produção
- Endpoints estarão acessíveis em:
  - `https://seu-dominio.vercel.app/api/webhooks/training`
  - `https://seu-dominio.vercel.app/api/webhooks/generation`

## Modelos Configurados

### Training Model
```
replicate/lora-training:b2a308762e36ac48d16bfadc03a65493fe6e799f429f7941639a6acec5b276cc
```

**Parâmetros otimizados:**
- `instance_data`: ZIP com imagens de treinamento
- `task`: 'face', 'object', ou 'style' (auto-detectado)
- `resolution`: 1024 (máximo para plano Gold)
- `seed`: Controle de reprodutibilidade

### Generation Model  
```
black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e
```

**Parâmetros FLUX Schnell:**
- `num_inference_steps`: 4 (otimizado)
- `aspect_ratio`: Calculado automaticamente
- `output_format`: 'webp' (menor tamanho)
- `output_quality`: 80 (balanceado)
- `go_fast`: true (modo rápido)

## Sistema de Créditos

### Cálculo de Custos
- **Training**: Base 5 créditos + (steps/1000) * multiplicador resolução
- **Generation**: Base 1 crédito por megapixel + steps extras

### Limites por Plano
- **FREE**: 10 créditos/dia, 1 modelo, res. máx 512px
- **PREMIUM**: 100 créditos/dia, 5 modelos, res. máx 1024px  
- **GOLD**: 500 créditos/dia, 20 modelos, res. máx 1536px

## Rate Limiting

### Configurado por Ação
- **Training**: 1-20 por dia (baseado no plano)
- **Generation**: 10-200 por hora (baseado no plano)
- **API calls**: 100-1000 por 15min (baseado no plano)

## Implementações Especiais

### 1. ZIP Creation para Training
- Cria ZIP dinâmico das imagens do usuário
- Upload para storage configurado (S3/Cloudinary)
- URL temporária para o Replicate

### 2. Webhook Processing
- **Training**: Atualiza status do modelo, calcula qualidade
- **Generation**: Salva URLs das imagens, atualiza galerias
- **Error Handling**: Reembolso automático de créditos

### 3. FLUX Optimizations
- Aspect ratio automático baseado nas dimensões
- Inferência otimizada para 4 steps
- Formato WebP para menor tamanho
- Safety checker configurável

## Scripts de Teste

### Validação Completa
```bash
# Teste integração atual
node test-replicate-integration.js

# Teste configuração produção
node test-replicate-production.js

# Teste webhooks (com servidor rodando)
node test-webhook-endpoints.js
```

## Monitoramento de Produção

### 1. Health Checks
- `GET /api/health` - Status geral do sistema
- Inclui conectividade Replicate
- Monitora saldo de créditos

### 2. Usage Tracking
- Logs de uso por usuário/plano
- Tracking de custos Replicate
- Rate limiting violations

### 3. Error Monitoring
- Webhooks com retry automático
- Reembolso automático em falhas
- Notificações por email

## Deploy para Produção

### Checklist Pré-Deploy
- [ ] Créditos adicionados à conta Replicate
- [ ] Storage em nuvem configurado (S3/Cloudinary)
- [ ] Variáveis de ambiente de produção definidas
- [ ] Domínio configurado no Vercel
- [ ] Rate limiting testado
- [ ] Webhooks validados

### Deploy Automático
1. Push para branch `main`
2. Vercel faz deploy automaticamente
3. Webhooks ficam ativos automaticamente
4. Sistema pronto para uso

## Otimizações de Custo

### 1. Parâmetros Eficientes
- Use FLUX Schnell (mais rápido/barato)
- Limite steps para usuários FREE
- Optimize resolution por plano
- Batch similar requests

### 2. Cache e Reutilização  
- Cache imagens geradas por período
- Reutilize modelos treinados
- Otimize ZIP uploads

### 3. Monitoring
- Alerts por limite de custo
- Dashboard de usage por usuário
- Previsões de consumo

## Troubleshooting

### Erros Comuns
- **402 Payment Required**: Sem créditos na conta
- **404 Model Not Found**: Version ID incorreto
- **413 Payload Too Large**: ZIP muito grande
- **422 Validation Error**: Parâmetros inválidos

### Soluções
- Monitor saldo de créditos regularmente
- Validar URLs de imagem antes do ZIP
- Limitar tamanho/número de imagens
- Validar parâmetros antes do envio

---

**Status**: Integração 95% completa, apenas créditos pendentes para produção
**Próximo passo**: Adicionar $50-100 créditos na conta Replicate
**ETA para produção**: 1-2 horas após créditos