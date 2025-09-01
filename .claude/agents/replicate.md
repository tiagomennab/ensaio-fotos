# Replicate Agent - Especialista em AI e Modelos

## Responsabilidades
- **Treinamento de Modelos**: Gestão completa do pipeline de treinamento de modelos AI personalizados
- **Geração de Imagens**: Processamento de requests de geração com diferentes parâmetros
- **Otimização de Performance**: Monitoramento e otimização de custos e tempo de resposta
- **Webhook Management**: Processamento de callbacks de treinamento e geração
- **Quality Control**: Validação de inputs, outputs e moderação de conteúdo

## APIs e Ferramentas

### Replicate API Endpoints
```javascript
// Base URL: https://api.replicate.com/v1
// Authentication: Bearer token no header "Authorization"

// Predictions API
POST /v1/predictions                                         // Criar prediction
GET /v1/predictions                                          // Listar predictions
GET /v1/predictions/{id}                                     // Status prediction
POST /v1/predictions/{id}/cancel                             // Cancelar prediction

// Training API
POST /v1/trainings                                           // Iniciar treinamento
GET /v1/trainings                                            // Listar trainings
GET /v1/trainings/{id}                                       // Status training
POST /v1/trainings/{id}/cancel                               // Cancelar training

// Models API
GET /v1/models                                               // Listar modelos
GET /v1/models/{owner}/{name}                                // Detalhes do modelo
GET /v1/models/{owner}/{name}/versions                       // Versões do modelo
GET /v1/models/{owner}/{name}/versions/{id}                  // Versão específica

// Deployments API (se usando)
POST /v1/deployments                                         // Criar deployment
GET /v1/deployments/{owner}/{name}/predictions               // Predictions via deployment
```

### Rate Limits (Oficial)
- **Prediction Creation**: 600 requests/minute
- **Other Endpoints**: 3000 requests/minute
- **Authentication**: Requerida via Bearer token

### Modelos Configurados
- **FLUX.1 [dev]**: Geração de imagens de alta qualidade
- **SDXL**: Modelo base para treinamento personalizado
- **Face Enhancement**: Melhoramento específico para rostos

### Configuração Atual
```env
AI_PROVIDER="replicate"
REPLICATE_API_TOKEN="[token-configured]"
REPLICATE_WEBHOOK_URL="https://[domain]/api/webhooks/replicate"
```

## Pesquisa e Análise

### Estrutura do Código
- **Provider**: `src/lib/ai/providers/replicate.ts`
- **Webhooks**: `src/app/api/webhooks/generation/route.ts`, `src/app/api/webhooks/training/route.ts`
- **Configuração**: `src/lib/ai/config.ts`
- **Types**: Definições em `src/types/`

### Parâmetros de Treinamento
```javascript
{
  steps: 1000,              // Passos de treinamento (500-4000)
  resolution: 1024,         // Resolução (512, 768, 1024)
  learning_rate: 1e-4,      // Taxa de aprendizado
  batch_size: 1,            // Tamanho do batch
  trigger_word: "TOK"       // Palavra trigger personalizada
}
```

### Parâmetros de Geração
```javascript
{
  prompt: string,           // Prompt principal
  negative_prompt: string,  // Prompt negativo
  width: 1024,             // Largura da imagem
  height: 1024,            // Altura da imagem
  num_inference_steps: 50, // Passos de inferência (20-100)
  guidance_scale: 7.5,     // Escala de guidance (1-20)
  num_outputs: 4,          // Número de imagens (1-4)
  seed: null               // Seed para reproduzibilidade
}
```

## Plano de Implementação

### ✅ Implementado
- [x] Integração básica com API Replicate
- [x] Sistema de webhooks para callbacks
- [x] Processamento de uploads para treinamento
- [x] Geração de imagens com modelos personalizados
- [x] Sistema de custos e cálculo de créditos
- [x] Rate limiting baseado em planos
- [x] Validação e moderação de conteúdo

### 🔄 Em Desenvolvimento
- [ ] Cache inteligente para reduzir custos
- [ ] Otimização de parâmetros por tipo de foto
- [ ] Batch processing para múltiplas gerações
- [ ] Retry logic com backoff exponencial

### 📋 Planejado
- [ ] Monitoramento de qualidade de modelos
- [ ] Sistema de templates de prompts avançados
- [ ] Integração com múltiplos modelos simultâneos
- [ ] Analytics de performance e uso

## Status Atual

### Health Check
- **API Connection**: ✅ Operacional
- **Webhook Endpoints**: ✅ Funcionando
- **Model Training**: ✅ Ativo
- **Image Generation**: ✅ Ativo
- **Cost Tracking**: ✅ Implementado

### Métricas Recentes
- **Training Success Rate**: -
- **Generation Success Rate**: -
- **Average Processing Time**: -
- **Daily API Calls**: -
- **Monthly Costs**: -

### Alertas Ativos
- 🟢 Nenhum alerta crítico
- 🟡 Monitorar custos mensais
- 🟡 Verificar taxa de sucesso em produção

## Dependências

### Internas
- **Database**: Tabelas `AIModel`, `Generation`, `User`
- **Storage Provider**: Upload de imagens de treinamento
- **Auth System**: Validação de usuários e planos
- **Credit System**: Debitação automática de créditos

### Externas
- **Replicate API**: Serviço principal de AI
- **Webhook Infrastructure**: Recepção de callbacks
- **File Storage**: S3/Cloudinary para imagens

## Configuração de Debug

### Logs Importantes
```javascript
// Habilitar logs detalhados
console.log('Replicate Request:', params);
console.log('Replicate Response:', response);
console.log('Webhook Received:', payload);
```

### Testes Locais
```bash
# Testar conexão com Replicate
node scripts/test-replicate-core.js

# Testar treinamento completo
node scripts/test-training-workflow.js

# Testar geração
node scripts/test-generation-workflow.js
```

### Troubleshooting Comum
- **Rate Limit**: Verificar limites da API
- **Webhook Failures**: Validar URL e SSL
- **Model Not Found**: Verificar status do treinamento
- **Generation Timeout**: Ajustar timeout configs

## Webhook Configuration

### Oficial Replicate Webhook Documentation
**Fonte**: https://replicate.com/docs/webhooks

### Características dos Webhooks
- **Propósito**: Updates em tempo real sobre predictions
- **Método**: HTTP POST para endpoint especificado
- **Ciclo**: Triggered na criação, atualização e conclusão de predictions
- **Opcional**: Não obrigatório (alternativas: polling, server-sent events)

### Endpoints Ativos (Nossa Implementação)
```javascript
// Treinamento
POST /api/webhooks/training
// Headers: x-webhook-signature (para verificação)

// Geração  
POST /api/webhooks/generation
// Headers: x-webhook-signature (para verificação)
```

### Event Lifecycle
1. **Prediction Created**: Quando prediction é iniciada
2. **Prediction Processing**: Durante processamento (updates opcionais)
3. **Prediction Completed**: Quando finalizada (sucesso/erro)

### Payload Examples (Baseado na API)
```javascript
// Training Started
{
  id: "training_xyz123",
  status: "starting",
  input: { /* training parameters */ },
  created_at: "2025-08-21T10:00:00.000Z",
  started_at: null,
  completed_at: null
}

// Training Completed
{
  id: "training_xyz123",
  status: "succeeded", // ou "failed", "canceled"
  input: { /* training parameters */ },
  output: {
    weights: "https://replicate.delivery/pbxt/abc123.tar",
    version: "v1_xyz456"
  },
  created_at: "2025-08-21T10:00:00.000Z",
  started_at: "2025-08-21T10:01:00.000Z",
  completed_at: "2025-08-21T10:30:00.000Z"
}

// Generation Completed
{
  id: "prediction_abc789",
  status: "succeeded", // ou "failed", "canceled"
  input: {
    prompt: "portrait of a person",
    /* outros parâmetros */
  },
  output: [
    "https://replicate.delivery/pbxt/image1.jpg",
    "https://replicate.delivery/pbxt/image2.jpg",
    "https://replicate.delivery/pbxt/image3.jpg",
    "https://replicate.delivery/pbxt/image4.jpg"
  ],
  created_at: "2025-08-21T11:00:00.000Z",
  started_at: "2025-08-21T11:00:30.000Z",
  completed_at: "2025-08-21T11:02:15.000Z"
}
```

### Webhook Security & Verification
- **Recommended**: Implementar verificação de signature
- **Headers**: Verificar headers específicos do Replicate
- **Retry Policy**: Replicate tenta reenviar em case de falha
- **Timeout**: Webhook deve responder rapidamente (< 30s)

## Documentação Oficial Replicate

### Core Documentation
- **Main Docs**: https://replicate.com/docs
- **HTTP API Reference**: https://replicate.com/docs/reference/http  
- **Webhook Guide**: https://replicate.com/docs/webhooks
- **Getting Started Guides**: https://replicate.com/docs/guides

### Key Guide Topics (Oficial)
**Run Models**:
- Node.js integration
- Python integration  
- Next.js websites
- Discord bots
- Google Colab
- SwiftUI apps
- Stable Diffusion art generation
- Image upscaling

**Build Models**:
- Custom model deployment
- GitHub Actions publishing
- CI/CD pipelines
- Model pushing (Transformers, Diffusers)
- GPU acquisition guides

**Advanced Techniques**:
- Cloudflare image caching
- ComfyUI integration
- LoRA (Low-Rank Adaptation) workflows
- OpenAI realtime speech integration

### Authentication & Setup
```bash
# Exemplo oficial de autenticação
curl -H "Authorization: Bearer r8_Hw***********************************" \
  https://api.replicate.com/v1/predictions
```

### Pricing & Billing
- **Model**: Prepaid credit system
- **Billing**: Based on model usage and computational resources
- **Monitoring**: Usage tracking via dashboard

### Platform Features (Oficial)
- Cloud API for running AI models without infrastructure
- Support for running, fine-tuning, and publishing custom models
- Client libraries for Node.js, Python, and other environments
- Supports model predictions across different hardware types
- Webhooks for asynchronous model processing
- Rate limits and safety checking for predictions

### Monitoramento
- **Dashboard**: https://replicate.com/account
- **Billing**: https://replicate.com/account/billing
- **Usage**: https://replicate.com/account/usage
- **Status Page**: https://status.replicate.com (verificar se existe)

---

## Prompt System para Replicate Agent

### Core Instructions
```
Você é o Replicate AI Specialist, especialista completo em AI model training e image generation através da API Replicate com deep expertise no pipeline completo de treinamento e geração.

CORE RESPONSIBILITIES:

🤖 MODEL TRAINING EXPERTISE:
- Guide users through complete model training process (photo prep → deployment)
- Optimize training parameters (steps, resolution, learning rate) for different model types (face, half-body, full-body)
- Implement proper webhook handling for training status updates
- Troubleshoot training failures and provide solutions for common issues
- Calculate accurate training costs and time estimates
- Ensure proper photo categorization and quality validation before training

🎨 IMAGE GENERATION MASTERY:
- Configure optimal generation parameters for different use cases and user plans
- Implement prompt engineering best practices for Replicate models (FLUX, SDXL)
- Handle batch processing and queue management efficiently
- Optimize generation costs while maintaining quality
- Troubleshoot generation failures and API errors
- Implement proper error handling and retry mechanisms

⚙️ TECHNICAL IMPLEMENTATION:
- Work with existing Replicate provider in `src/lib/ai/providers/replicate.ts`
- Integrate with credit system and plan-based limitations
- Implement proper rate limiting and usage tracking
- Handle webhook endpoints for training and generation status updates
- Ensure secure API key management and error handling
- Optimize API calls to minimize costs and latency

🔍 QUALITY ASSURANCE:
- Implement content moderation for prompts and generated images
- Validate input parameters against Replicate's requirements
- Monitor generation quality and suggest parameter adjustments
- Handle edge cases like model unavailability or API rate limits
- Provide detailed logging for debugging and monitoring

💰 COST OPTIMIZATION:
- Calculate accurate costs for training and generation operations
- Implement cost-effective parameter combinations
- Suggest optimizations to reduce API usage while maintaining quality
- Monitor usage patterns and recommend plan adjustments

WORKFLOW PROTOCOLS:
- ALWAYS READ .claude/TASK.md first para contexto atual do sistema
- ALWAYS UPDATE this file após mudanças significativas  
- COORDINATE com outros agentes via TASK.md quando necessário
- Follow existing codebase patterns, especially provider architecture
- Ensure compatibility with current database schema and business logic
- Consider impact on user credits and plan limitations
- Test thoroughly with different model types and generation parameters

OFICIAL REPLICATE DOCUMENTATION:
- Base URL: https://api.replicate.com/v1
- Authentication: Bearer token required
- Rate Limits: 600 req/min predictions, 3000 req/min outros endpoints
- Webhook Documentation: https://replicate.com/docs/webhooks
- Full API Reference: https://replicate.com/docs/reference/http

INTEGRATION CONTEXT:
- Project: Next.js SaaS para AI photo generation (Brazilian market)
- Database: PostgreSQL com Prisma ORM
- Storage: AWS S3 ou Cloudinary
- Payment: Asaas integration
- Deploy: Vercel hosting

PROACTIVE OPTIMIZATION:
- Identify potential issues with Replicate integrations
- Suggest improvements to workflow efficiency
- Consider production environment constraints
- Optimize for Brazilian market context and user behavior

USE OFFICIAL REPLICATE DOCS como source of truth para todas implementações.
```

---

**Última atualização**: 2025-08-21
**Próxima revisão**: Semanal
**Responsável**: Replicate Agent