# Ensaio Fotos - AI Photo Generation SaaS

Uma plataforma completa de geração de fotos com IA que permite aos usuários treinar modelos personalizados e gerar imagens profissionais.

## 🚀 Funcionalidades

### Core Features
- **Treinamento de Modelos IA**: Crie modelos personalizados com suas próprias fotos
- **Geração de Imagens**: Gere fotos profissionais usando prompts personalizados
- **Galeria Inteligente**: Organize e gerencie suas criações
- **Pacotes de Fotos**: Coleções pré-definidas para diferentes estilos
- **Sistema de Créditos**: Modelo freemium com planos GRATUITO/PREMIUM/GOLD

### Tecnologias
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: NextAuth.js (Google, GitHub)
- **Pagamentos**: Integração com Asaas (mercado brasileiro)
- **Armazenamento**: AWS S3, Cloudinary, Local
- **IA**: Replicate, RunPod, Mock Local
- **Segurança**: Rate limiting, content moderation
- **Monitoramento**: Health checks, logging, métricas

## 🏗️ Arquitetura

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Rotas de autenticação
│   ├── admin/             # Painel administrativo
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard do usuário
│   ├── models/            # Gerenciamento de modelos
│   ├── generate/          # Interface de geração
│   ├── gallery/           # Galeria de imagens
│   └── packages/          # Pacotes de fotos
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard específicos
│   └── admin/            # Componentes admin
├── lib/                  # Utilitários e configurações
│   ├── ai/              # Provedores de IA
│   ├── auth/            # Configuração NextAuth
│   ├── credits/         # Sistema de créditos
│   ├── db/              # Configuração Prisma
│   ├── payments/        # Integração Asaas
│   ├── security/        # Segurança e moderação
│   ├── storage/         # Upload de arquivos
│   └── monitoring/      # Logs e métricas
└── prisma/              # Schema e migrações
```

## 🚀 Setup Rápido

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/ensaio-fotos.git
cd ensaio-fotos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Execute em desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🐳 Deploy com Docker

### Docker Compose (Recomendado)
```bash
# Configure as variáveis no docker-compose.yml
docker-compose up -d
```

### Docker Manual
```bash
# Build da imagem
docker build -t ensaio-fotos .

# Execute o container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  ensaio-fotos
```

## ☁️ Deploy na Vercel

1. **Configure o projeto na Vercel**
2. **Adicione as variáveis de ambiente** (ver `.env.example`)
3. **Configure o banco PostgreSQL** (recomendado: Supabase, Railway)
4. **Deploy automático** via Git

## 📊 Monitoramento

### Health Check
- Endpoint: `/api/health`
- Verifica: Database, Storage, AI Providers, Payment

### Métricas
- Endpoint: `/api/monitoring/metrics`
- Suporte a Prometheus: `?format=prometheus`
- Dashboard admin: `/admin/monitoring`

### Logs
- Sistema de logging estruturado
- Integração com Sentry (opcional)
- Cleanup automático de logs antigos

## 🔒 Segurança

### Content Moderation
- Filtro de palavras proibidas
- Detecção de padrões suspeitos
- Histórico de violações
- Bloqueio automático de usuários

### Rate Limiting
- Limites baseados no plano do usuário
- Proteção contra abuso
- Monitoramento de violações

### Dados Sensíveis
- Criptografia de dados sensíveis
- Sanitização de prompts
- Validação rigorosa de entrada

## 💰 Sistema de Pagamentos

### Integração Asaas
- Suporte a PIX, cartão, boleto
- Webhooks automáticos
- Gerenciamento de assinaturas
- Ambiente sandbox/produção

### Planos Disponíveis
- **GRATUITO**: 10 créditos/dia, 1 modelo
- **PREMIUM**: 100 créditos/dia, 5 modelos  
- **GOLD**: 500 créditos/dia, 20 modelos

## 🤖 Provedores de IA

### Suportados
- **Replicate**: Produção recomendada
- **RunPod**: Alternative para produção
- **Local Mock**: Desenvolvimento/teste

### Configuração
```env
AI_PROVIDER="replicate" # replicate, runpod, local
REPLICATE_API_TOKEN="your-token"
RUNPOD_API_KEY="your-key"
```

## 📁 Armazenamento

### Provedores Suportados
- **AWS S3**: Produção recomendada
- **Cloudinary**: Alternative com CDN
- **Local**: Desenvolvimento apenas

### Configuração
```env
STORAGE_PROVIDER="aws" # aws, cloudinary, local
AWS_S3_BUCKET="your-bucket"
CLOUDINARY_CLOUD_NAME="your-cloud"
```

## 🔧 Scripts Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção

# Banco de dados
npm run db:generate  # Gera Prisma client
npm run db:push      # Aplica mudanças ao banco
npm run db:migrate   # Cria nova migração
npm run db:studio    # Interface gráfica do banco

# Produção
npm run setup:prod   # Setup completo de produção
npm run backup:db    # Backup do banco de dados
```

## 🚨 Troubleshooting

### Problemas Comuns

**1. Erro de conexão com banco**
```bash
# Verifique a DATABASE_URL
npx prisma db push --force-reset
```

**2. Problemas com uploads**
```bash
# Verifique permissões da pasta uploads/
chmod 755 uploads/
```

**3. Rate limiting muito restritivo**
```bash
# Ajuste os limites em src/lib/security/rate-limiter.ts
```

**4. Problemas com CORS**
```bash
# Verifique NEXTAUTH_URL no .env
```

## 📈 Roadmap

### v1.1 (Próximas features)
- [ ] Editor de imagens integrado
- [ ] Marketplace de modelos
- [ ] API pública
- [ ] Integração com redes sociais
- [ ] Templates de prompts
- [ ] Análise de qualidade automática

### v1.2 (Melhorias)
- [ ] Cache Redis
- [ ] CDN para imagens
- [ ] Processamento em batch
- [ ] Notificações push
- [ ] Analytics avançados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@ensaiofotos.com
- **Documentação**: [docs.ensaiofotos.com](https://docs.ensaiofotos.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/ensaio-fotos/issues)

---

**Desenvolvido com ❤️ para o mercado brasileiro de IA**