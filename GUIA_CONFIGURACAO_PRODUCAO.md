# 🚀 GUIA COMPLETO DE CONFIGURAÇÃO PARA PRODUÇÃO - ENSAIO FOTOS

## 📋 **VISÃO GERAL**

Este guia irá te levar passo a passo para configurar o Ensaio Fotos para funcionar 100% em produção. O app está bem estruturado, mas precisa de configurações externas para funcionar.

## ⚡ **CONFIGURAÇÃO RÁPIDA (RECOMENDADO)**

### **1. Execute o Script Automatizado**
```bash
# No Windows (PowerShell/CMD)
scripts\setup-production-windows.bat

# No Linux/Mac
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

O script irá:
- ✅ Verificar dependências
- ✅ Criar arquivo .env
- ✅ Instalar dependências
- ✅ Gerar Prisma client
- ✅ Fazer build da aplicação
- ✅ Verificar health check

---

## 🔧 **CONFIGURAÇÃO MANUAL PASSO A PASSO**

### **FASE 1: CONFIGURAÇÃO BÁSICA**

#### **1.1 Criar Arquivo .env**
```bash
# Copie o arquivo de exemplo
cp env.production .env

# Edite o arquivo .env com seus valores reais
notepad .env  # Windows
nano .env     # Linux/Mac
```

#### **1.2 Configurar Variáveis Críticas**

**🔐 AUTENTICAÇÃO (OBRIGATÓRIO)**
```env
NEXTAUTH_SECRET=sua_chave_secreta_muito_longa_aqui_mude_para_producao
NEXTAUTH_URL=https://seudominio.com
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret
```

**🗄️ BANCO DE DADOS (OBRIGATÓRIO)**
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/ensaiofotos
```

#### **1.3 Instalar Dependências**
```bash
npm ci --only=production
```

#### **1.4 Gerar Prisma Client**
```bash
npx prisma generate
```

#### **1.5 Configurar Banco de Dados**
```bash
# Criar banco (se não existir)
npx prisma db push

# Ou executar migrações
npx prisma migrate deploy
```

---

### **FASE 2: SERVIÇOS EXTERNOS**

#### **2.1 STORAGE (Escolha um)**

**🔄 AWS S3 (Recomendado para produção)**
```env
STORAGE_PROVIDER=aws
NEXT_PUBLIC_STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=sua_aws_access_key
AWS_SECRET_ACCESS_KEY=sua_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket_name
AWS_CLOUDFRONT_URL=https://seu_cloudfront.net
```

**☁️ Cloudinary (Alternativa mais simples)**
```env
STORAGE_PROVIDER=cloudinary
NEXT_PUBLIC_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
CLOUDINARY_FOLDER=ensaio-fotos
```

**💾 Local (Apenas para desenvolvimento)**
```env
STORAGE_PROVIDER=local
NEXT_PUBLIC_STORAGE_PROVIDER=local
```

#### **2.2 IA PROVIDERS (Escolha um)**

**🤖 Replicate (Recomendado)**
```env
AI_PROVIDER=replicate
NEXT_PUBLIC_AI_PROVIDER=replicate
REPLICATE_API_TOKEN=seu_replicate_token
REPLICATE_WEBHOOK_SECRET=seu_webhook_secret
```

**⚡ RunPod (Alternativa)**
```env
AI_PROVIDER=runpod
NEXT_PUBLIC_AI_PROVIDER=runpod
RUNPOD_API_KEY=sua_runpod_key
RUNPOD_ENDPOINT_ID=seu_endpoint_id
RUNPOD_WEBHOOK_URL=https://seudominio.com/api/webhooks/training
```

**🖥️ Local (Mock - apenas para desenvolvimento)**
```env
AI_PROVIDER=local
NEXT_PUBLIC_AI_PROVIDER=local
```

#### **2.3 SISTEMA DE PAGAMENTOS**

**💳 Asaas (Mercado brasileiro)**
```env
ASAAS_API_KEY=sua_asaas_api_key
ASAAS_ENVIRONMENT=sandbox  # ou production
```

---

### **FASE 3: CONFIGURAÇÕES AVANÇADAS**

#### **3.1 MONITORAMENTO**
```env
MONITORING_TOKEN=seu_token_monitoramento
CRON_SECRET=seu_secret_cron
SENTRY_DSN=sua_sentry_dsn  # Opcional
```

#### **3.2 SEGURANÇA**
```env
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_RATE_LIMIT=10
AUTH_RATE_LIMIT=5
```

#### **3.3 CACHE E PERFORMANCE**
```env
REDIS_URL=redis://localhost:6379
```

---

## 🧪 **TESTANDO A CONFIGURAÇÃO**

### **1. Build da Aplicação**
```bash
npm run build
```

### **2. Testar Health Check**
```bash
npm start
# Em outro terminal
curl http://localhost:3000/api/health
```

### **3. Verificar Funcionalidades**
- ✅ Login/Logout
- ✅ Upload de arquivos
- ✅ Geração de imagens (se IA configurado)
- ✅ Sistema de créditos

---

## 🚀 **DEPLOY EM PRODUÇÃO**

### **OPÇÃO 1: Docker (Recomendado)**
```bash
# Configurar variáveis no docker-compose.yml
docker-compose up -d
```

### **OPÇÃO 2: Deploy Direto**
```bash
npm run build
npm start
```

### **OPÇÃO 3: Vercel/Netlify**
```bash
# Configurar variáveis no painel
# Fazer deploy automático
```

---

## 🔍 **VERIFICAÇÃO FINAL**

### **Checklist de Produção**
- [ ] Arquivo .env configurado
- [ ] Banco de dados funcionando
- [ ] Storage configurado
- [ ] IA providers funcionando
- [ ] OAuth providers funcionando
- [ ] Sistema de pagamentos funcionando
- [ ] Health check passando
- [ ] SSL/HTTPS configurado
- [ ] Monitoramento ativo
- [ ] Backup configurado

---

## 🆘 **SOLUÇÃO DE PROBLEMAS**

### **Problema: "Database connection failed"**
```bash
# Verificar DATABASE_URL no .env
# Verificar se PostgreSQL está rodando
# Testar conexão manualmente
npx prisma db push
```

### **Problema: "Authentication failed"**
```bash
# Verificar NEXTAUTH_SECRET
# Verificar OAuth credentials
# Verificar NEXTAUTH_URL
```

### **Problema: "Storage not working"**
```bash
# Verificar STORAGE_PROVIDER
# Verificar credenciais AWS/Cloudinary
# Verificar permissões de diretórios
```

### **Problema: "AI generation failed"**
```bash
# Verificar AI_PROVIDER
# Verificar API tokens
# Verificar webhook URLs
```

---

## 📞 **SUPORTE**

### **Logs da Aplicação**
```bash
# Ver logs em tempo real
npm start 2>&1 | tee app.log

# Ver logs de erro
tail -f app.log | grep ERROR
```

### **Health Check Detalhado**
```bash
curl http://localhost:3000/api/health | jq
```

### **Verificar Variáveis de Ambiente**
```bash
# No Node.js
console.log(process.env.NEXTAUTH_SECRET)
console.log(process.env.DATABASE_URL)
```

---

## 🎯 **PRÓXIMOS PASSOS APÓS CONFIGURAÇÃO**

1. **Configurar domínio e SSL**
2. **Configurar CDN para imagens**
3. **Configurar backup automático**
4. **Configurar monitoramento avançado**
5. **Configurar CI/CD pipeline**
6. **Configurar analytics**
7. **Configurar email marketing**
8. **Configurar suporte ao cliente**

---

## 💡 **DICAS IMPORTANTES**

- 🔒 **NUNCA** commite o arquivo .env no Git
- 🔑 Use chaves secretas fortes e únicas
- 📊 Monitore o uso de recursos
- 🚨 Configure alertas para falhas
- 💾 Faça backup regular do banco
- 🔄 Mantenha dependências atualizadas
- 🧪 Teste em staging antes de produção

---

**🎉 Parabéns! Seu Ensaio Fotos está configurado para produção!**

Agora você pode:
- Treinar modelos de IA personalizados
- Gerar fotos profissionais
- Gerenciar usuários e assinaturas
- Monetizar sua plataforma

**Precisa de ajuda com alguma configuração específica?** Consulte a documentação ou entre em contato com o suporte.
