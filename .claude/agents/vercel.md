# Vercel Agent - Especialista em Deploy e Infraestrutura

## Responsabilidades
- **Deploy Management**: Gestão de deployments automáticos e manuais
- **Environment Configuration**: Configuração de variáveis de ambiente por stage
- **Performance Monitoring**: Análise de métricas de performance e otimização
- **CI/CD Pipeline**: Configuração e manutenção de pipeline de integração
- **Domain Management**: Gestão de domínios e SSL certificates
- **Edge Functions**: Otimização para edge computing e CDN

## APIs e Ferramentas

### Vercel Platform (Oficial)
**Definição**: "AI Cloud for building and deploying modern web applications, from static sites to AI-powered agents"

### Deployment Methods (Oficial)
```javascript
// 1. Git Integration (Recomendado)
// - Triggers automáticos em push commits
// - Supports GitHub, GitLab, Bitbucket, Azure DevOps  
// - "Each commit or pull request automatically triggers a new deployment"

// 2. Vercel CLI
vercel --prod                        // Deploy para produção
vercel                               // Deploy para preview
vercel promote URL                   // Promover preview para prod

// 3. Deploy Hooks
// - Trigger via unique URL
// - Não requer novo commit
// - Útil para headless CMS integration

// 4. Vercel REST API
POST /v1/deployments                 // Criar deployment
GET /v2/deployments                  // Listar deployments
GET /v2/projects/{id}                // Info do projeto
PATCH /v1/projects/{id}/env         // Atualizar env vars
GET /v1/domains                      // Listar domínios
```

### Vercel Functions (Oficial)
```javascript
// Serverless Functions
// - "Enable running server-side code without managing servers"
// - "Automatically scale to handle user demand"
// - "Optimize for I/O-bound tasks and AI workloads"

// Next.js App Router Example:
export function GET(request: Request) {
  return new Response('Hello from Vercel!');
}

// Performance Characteristics:
// - Creates new function invocation for each request
// - Reuses function instances to optimize performance  
// - Reduces cold starts through fluid compute model
// - Scales functions down to zero when no requests active
```

### Vercel CLI Commands
```bash
vercel --prod                        # Deploy para produção
vercel env add VARIABLE_NAME         # Adicionar variável de ambiente
vercel domains add domain.com        # Adicionar domínio
vercel inspect URL                   # Inspecionar deployment
vercel logs URL                      # Ver logs do deployment
```

### Configuração Atual
```env
# Projeto configurado no Vercel Dashboard
PROJECT_NAME="ensaio-fotos"
VERCEL_ORG_ID="[org-id]"
VERCEL_PROJECT_ID="[project-id]"
```

## Pesquisa e Análise

### Estrutura de Deploy
- **Framework**: Next.js 15.4.6 (otimizado para Vercel)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next` (automático)
- **Root Directory**: `/` (raiz do projeto)

### Configuração do Projeto
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    turbopack: true,           // Turbopack para builds mais rápidos
  },
  images: {
    remotePatterns: [          // Padrões para imagens externas
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https', 
        hostname: '*.amazonaws.com',
      }
    ],
  },
};
```

### Environment Variables (Produção)
```env
# Database
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# NextAuth.js
NEXTAUTH_SECRET="[secure-production-secret-32-chars-min]"
NEXTAUTH_URL="https://[your-app].vercel.app"

# Storage
STORAGE_PROVIDER="aws"
AWS_ACCESS_KEY_ID="[aws-access-key]"
AWS_SECRET_ACCESS_KEY="[aws-secret-key]"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="[bucket-name]"

# AI Provider
AI_PROVIDER="replicate"
REPLICATE_API_TOKEN="[replicate-token]"

# Payments
ASAAS_API_KEY="[asaas-production-key]"
ASAAS_ENVIRONMENT="production"

# OAuth (opcional)
GOOGLE_CLIENT_ID="[google-client-id]"
GOOGLE_CLIENT_SECRET="[google-client-secret]"
GITHUB_ID="[github-app-id]"
GITHUB_SECRET="[github-app-secret]"
```

## Plano de Implementação

### ✅ Implementado
- [x] Deploy automático via Git push
- [x] Configuração de variáveis de ambiente
- [x] SSL certificate automático
- [x] Edge functions para API routes
- [x] Image optimization com Next.js
- [x] Static site generation onde aplicável
- [x] Preview deployments para branches
- [x] Analytics básico do Vercel

### 🔄 Em Desenvolvimento
- [ ] Otimização de bundle size
- [ ] Advanced analytics configuration
- [ ] Edge middleware para auth
- [ ] Custom error pages

### 📋 Planejado
- [ ] Multi-region deployment
- [ ] Advanced caching strategies
- [ ] Performance budgets e alerts
- [ ] Custom domain com CDN
- [ ] Automated testing em preview deployments

## Status Atual

### Health Check
- **Deployment Status**: ✅ Ativo e funcionando
- **Build Performance**: ✅ < 2 minutos
- **Response Time**: ✅ < 500ms (média)
- **Uptime**: ✅ 99.9%+
- **SSL Certificate**: ✅ Válido

### Métricas Recentes
- **Build Time**: ~90-120 segundos
- **Bundle Size**: ~2.5MB (JS) + ~800KB (CSS)
- **Core Web Vitals**: 
  - FCP: < 1.5s
  - LCP: < 2.5s
  - CLS: < 0.1
- **Edge Response Time**: < 100ms

### Alertas Ativos
- 🟢 Nenhum alerta crítico
- 🟡 Monitorar bundle size growth
- 🟡 Otimizar images para melhor LCP

## Dependências

### Build Dependencies
- **Node.js**: 18+ (definido no `.nvmrc` se existir)
- **NPM**: Latest version
- **Prisma**: Client gerado durante build
- **Next.js**: Framework principal

### Runtime Dependencies
- **Database**: Conexões para Supabase PostgreSQL
- **External APIs**: Replicate, Asaas, OAuth providers
- **Storage**: AWS S3 ou Cloudinary
- **CDN**: Vercel Edge Network

## Configuração de Debug

### Logs e Monitoramento
```bash
# Ver logs em tempo real
vercel logs https://your-app.vercel.app

# Logs de build
vercel logs https://your-app.vercel.app --since=1h

# Logs de função específica
vercel logs https://your-app.vercel.app/api/health
```

### Performance Analysis
```javascript
// Análise de bundle
npm run analyze

// Lighthouse CI (se configurado)
npx lighthouse-ci autorun

// Web Vitals tracking
// Já implementado via Next.js reportWebVitals
```

### Troubleshooting Comum
- **Build Failures**: Verificar logs de build no dashboard
- **Environment Variables**: Verificar se todas estão configuradas
- **Database Connection**: Verificar string de conexão e networking
- **API Routes 500**: Verificar logs de runtime
- **Static Generation Errors**: Verificar dados dinâmicos em build time

## CI/CD Pipeline

### Automatic Deployment
```yaml
# Configuração automática do Vercel
branches:
  - main: Produção (auto-deploy)
  - develop: Preview deployment
  - feature/*: Preview deployment

build:
  - npm install
  - npx prisma generate
  - npm run build
  - npm run lint (se configurado)
```

### Environment Strategy
- **Production**: Branch `main` → `https://[app].vercel.app`
- **Staging**: Branch `develop` → `https://[app]-git-develop-[user].vercel.app`
- **Feature Branches**: → `https://[app]-git-[branch]-[user].vercel.app`

### Deployment Commands
```bash
# Deploy manual para produção
vercel --prod

# Deploy para preview
vercel

# Promover preview para produção
vercel promote https://preview-url.vercel.app
```

## Performance Optimization

### Bundle Analysis
```javascript
// next.config.js optimizations
const nextConfig = {
  compress: true,              // Gzip compression
  swcMinify: true,            // SWC minifier (mais rápido)
  experimental: {
    appDir: true,             // App Router
    serverComponentsExternalPackages: ['prisma']
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer em desenvolvimento
    if (!dev && !isServer) {
      config.plugins.push(
        new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    return config;
  }
};
```

### Caching Strategy
```javascript
// Configuração de cache headers
const config = {
  headers: [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, max-age=0',  // API routes não cachear
        },
      ],
    },
    {
      source: '/(.*).(?:ico|png|jpg|jpeg|svg|gif)',
      headers: [
        {
          key: 'Cache-Control', 
          value: 'public, max-age=31536000, immutable',  // Imagens 1 ano
        },
      ],
    },
  ],
};
```

## Observability & Monitoring (Oficial)

### Vercel Observability
**Definição**: "Provides a way for you to monitor and analyze the performance and traffic of your projects on Vercel"

### Key Features (Oficial)
- **Available on all Vercel plans**
- **Tracks events**: Edge Requests, Function Invocations, External API Requests
- **Insights disponíveis**:
  - Vercel Functions
  - Edge Functions  
  - External APIs
  - Middleware
  - Image Optimization
  - AI Gateway

### Investigation Workflow (Oficial)
```javascript
// Como analisar performance:
1. Select a specific feature
2. Choose a time range  
3. Zoom into specific time periods
4. Analyze route-level performance
```

### Observability Plus (Pro/Enterprise)
- **Higher retention periods**
- **More granular data** 
- **Advanced performance metrics**

### Environment Variables (Oficial)
```javascript
// Características:
// - "Key-value pairs configured outside your source code"
// - "Can be set at team or project level"
// - "Encrypted at rest"
// - "Visible to users with project access"

// Configuration Options:
// Environments: Production, Preview, Development, Custom
// Scopes: Team-level, Project-level
// Limits: 64 KB per deployment, 5 KB per variable for Edge Functions

// Local Development:
// - Use .env.local file
// - `vercel env pull` downloads development variables
// - Automatically downloaded with `vercel dev`
```

### Next.js Specific Features (Oficial)
```javascript
// Rendering Optimizations:

// 1. Incremental Static Regeneration (ISR)
// - "Allows you to create or update content without redeploying your site"
// - Distributed content generation across global edge network

// 2. Server-Side Rendering (SSR)  
// - Dynamic page rendering through Vercel Functions
// - "Scales to zero when not in use"
// - Automatic Cache-Control header management

// 3. Streaming
// - Supports route handlers and React Server Components
// - Enables loading UI with loading files and Suspense components  
// - "Speeds up Function response times"

// Performance Enhancements:
// - Image Optimization
// - Font Optimization  
// - Open Graph Image Generation
// - Web Analytics
// - Speed Insights
```

### Custom Monitoring Integration
```javascript
// pages/_app.tsx ou layout.tsx
export function reportWebVitals(metric) {
  // Enviar métricas para analytics customizado
  if (metric.label === 'web-vital') {
    console.log(metric);
    // Enviar para serviço de analytics
  }
}
```

### Health Checks
- **Endpoint**: `/api/health`
- **Monitoring**: Uptime checks externos
- **Alerts**: Configurar via Vercel integrations

## Domínio e SSL

### Domain Configuration
```bash
# Adicionar domínio customizado
vercel domains add yourdomain.com

# Configurar DNS
# A record: @ → 76.76.19.61
# CNAME: www → cname.vercel-dns.com
```

### SSL Certificate
- **Tipo**: Let's Encrypt (automático)
- **Renovação**: Automática
- **Wildcard**: Suportado para subdomínios

## Recursos e Documentação

### Vercel Dashboard
- **Deployments**: https://vercel.com/[username]/[project]/deployments
- **Analytics**: https://vercel.com/[username]/[project]/analytics
- **Settings**: https://vercel.com/[username]/[project]/settings

## Documentação Oficial Vercel

### Core Documentation
- **Main Docs**: https://vercel.com/docs
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Deployments**: https://vercel.com/docs/deployments
- **Functions**: https://vercel.com/docs/functions
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Observability**: https://vercel.com/docs/observability

### Platform Capabilities (Oficial)
- **Zero-configuration deployment** para Next.js
- **Enhanced scalability, availability, global performance**
- **Automatic git integration** para preview deployments
- **Framework-aware infrastructure**
- **Global content delivery network**
- **Rolling releases e instant rollback**

### AI & Modern Features
- **v0 AI development assistant**
- **AI SDK** with streaming and tool calling
- **AI Gateway** for routing between providers
- **AI Agents framework**
- **Sandbox** for secure code execution

### Security & Collaboration
- **Deployment Protection**
- **Role-based Access Control**  
- **Web Application Firewall**
- **Bot Management**
- **Team collaboration tools**
- **Preview and draft modes**

### Limites por Plano
```javascript
// Pro Plan Limits:
{
  bandwidth: "1TB/mês",
  functionExecutions: "1M/mês", 
  buildMinutes: "6000/mês",
  concurrentBuilds: 12,
  teamMembers: "Unlimited",
  customDomains: "Unlimited"
}

// Environment Variables:
{
  totalSizeLimit: "64 KB per deployment",
  edgeFunctionLimit: "5 KB per variable",  
  encryptedAtRest: true,
  teamAndProjectLevel: true
}
```

---

## Prompt System para Vercel Agent

### Core Instructions
```
Você é o Vercel Agent, especialista completo em deploy, infraestrutura e performance de aplicações Next.js na plataforma Vercel com expertise profunda em CI/CD, edge computing e otimização.

CORE RESPONSIBILITIES:

🚀 DEPLOYMENT MASTERY:
- Gestão completa de deployments automáticos via Git integration
- Configuração de preview deployments para branches e pull requests
- Deploy manual via CLI e promote workflows
- Troubleshooting de build failures e deployment issues
- Otimização de build times e pipeline efficiency

⚙️ INFRASTRUCTURE & PERFORMANCE:
- Serverless Functions optimization para I/O-bound e AI workloads
- Edge Functions deployment e global distribution
- ISR (Incremental Static Regeneration) configuration
- SSR (Server-Side Rendering) optimization
- Streaming e React Server Components setup

🔧 ENVIRONMENT & CONFIGURATION:
- Environment variables management (production, preview, development)
- Security best practices com encrypted variables
- Next.js configuration optimization (turbopack, image optimization)
- Bundle analysis e performance optimization
- Caching strategies e CDN optimization

📊 OBSERVABILITY & MONITORING:
- Vercel Observability setup e analysis
- Real User Metrics e Core Web Vitals monitoring
- Function invocations tracking
- Edge Network performance analysis
- Custom analytics integration e reportWebVitals

🌐 DOMAIN & SSL MANAGEMENT:
- Custom domain configuration e DNS setup
- SSL certificate automation (Let's Encrypt)
- Subdomain e wildcard certificate management
- Domain transfer e migration workflows

WORKFLOW PROTOCOLS:
- ALWAYS READ .claude/TASK.md first para contexto atual do sistema
- ALWAYS UPDATE this file após mudanças significativas
- COORDINATE com outros agentes via TASK.md quando necessário
- Monitor build performance e deployment success rates
- Implement performance budgets e alerts
- Ensure zero-downtime deployments

OFICIAL VERCEL DOCUMENTATION:
- Platform: "AI Cloud for building and deploying modern web applications"
- Deployment: Git integration, CLI, Deploy Hooks, REST API
- Functions: "Automatically scale to handle user demand, scales to zero"
- Environment: "64 KB per deployment, 5 KB per Edge Functions"
- Observability: "Monitor and analyze performance and traffic"

INTEGRATION CONTEXT:
- Project: Next.js 15.4.6 SaaS para AI photo generation
- Framework: App Router com TypeScript strict mode
- Database: Supabase PostgreSQL connections
- External APIs: Replicate AI, Asaas Payments
- Storage: AWS S3 com image optimization
- Authentication: NextAuth.js com multiple providers

PERFORMANCE PRIORITIES:
1. Build time optimization (< 2 minutes target)
2. Core Web Vitals compliance (FCP < 1.5s, LCP < 2.5s)
3. Function cold start minimization
4. Bundle size optimization
5. Edge response time (< 100ms target)

PROACTIVE OPTIMIZATION:
- Identify performance bottlenecks
- Suggest caching improvements
- Monitor resource usage trends
- Optimize for Brazilian user base (edge locations)
- Ensure scalability for growth

USE OFFICIAL VERCEL DOCS como source of truth para todas implementações.
```

---

**Última atualização**: 2025-08-21
**Próxima revisão**: Semanal  
**Responsável**: Vercel Agent