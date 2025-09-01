# 🎯 **INSTRUÇÕES FINAIS - CONFIGURAÇÃO PRODUÇÃO ENSAIO FOTOS**

## 🚀 **COMO USAR OS ARQUIVOS CRIADOS**

### **1. ARQUIVOS PRINCIPAIS CRIADOS**

✅ **`env.production`** - Template de variáveis de ambiente
✅ **`scripts/setup-production-windows.bat`** - Script de setup para Windows
✅ **`scripts/quick-test.bat`** - Script de teste rápido
✅ **`GUIA_CONFIGURACAO_PRODUCAO.md`** - Guia completo de configuração
✅ **`next.config.production.js`** - Configuração otimizada do Next.js
✅ **`ecosystem.config.js`** - Configuração do PM2 (process manager)
✅ **`nginx.production.conf`** - Configuração otimizada do Nginx

---

## ⚡ **CONFIGURAÇÃO RÁPIDA (RECOMENDADO)**

### **PASSO 1: Execute o Script de Setup**
```bash
# No Windows (PowerShell/CMD)
scripts\setup-production-windows.bat
```

**O que o script faz:**
- ✅ Verifica Node.js e npm
- ✅ Cria arquivo .env
- ✅ Instala dependências
- ✅ Gera Prisma client
- ✅ Testa banco de dados
- ✅ Faz build da aplicação
- ✅ Testa health check

### **PASSO 2: Configure as Variáveis Críticas**
Edite o arquivo `.env` criado e configure:

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

### **PASSO 3: Teste a Configuração**
```bash
scripts\quick-test.bat
```

---

## 🔧 **CONFIGURAÇÃO MANUAL (ALTERNATIVA)**

### **1. Criar Arquivo .env**
```bash
# Copie o template
copy env.production .env

# Edite com seus valores
notepad .env
```

### **2. Instalar Dependências**
```bash
npm ci --only=production
```

### **3. Gerar Prisma Client**
```bash
npx prisma generate
```

### **4. Configurar Banco de Dados**
```bash
npx prisma db push
```

### **5. Build da Aplicação**
```bash
npm run build
```

### **6. Testar**
```bash
npm start
# Em outro terminal
curl http://localhost:3000/api/health
```

---

## 🌐 **CONFIGURAÇÃO DE SERVIÇOS EXTERNOS**

### **STORAGE (Escolha um)**

**🔄 AWS S3 (Recomendado para produção)**
1. Crie uma conta AWS
2. Crie um bucket S3
3. Configure IAM user com permissões S3
4. Adicione no .env:
```env
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket_name
```

**☁️ Cloudinary (Alternativa mais simples)**
1. Crie conta em cloudinary.com
2. Obtenha API key e secret
3. Adicione no .env:
```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
```

### **IA PROVIDERS (Escolha um)**

**🤖 Replicate (Recomendado)**
1. Crie conta em replicate.com
2. Obtenha API token
3. Adicione no .env:
```env
AI_PROVIDER=replicate
REPLICATE_API_TOKEN=seu_token
```

**⚡ RunPod (Alternativa)**
1. Crie conta em runpod.io
2. Configure endpoint
3. Adicione no .env:
```env
AI_PROVIDER=runpod
RUNPOD_API_KEY=sua_key
RUNPOD_ENDPOINT_ID=seu_endpoint
```

### **OAUTH PROVIDERS**

**Google OAuth:**
1. Acesse Google Cloud Console
2. Crie projeto e OAuth 2.0 credentials
3. Configure redirect URIs: `https://seudominio.com/api/auth/callback/google`

**GitHub OAuth:**
1. Acesse GitHub Settings > Developer settings > OAuth Apps
2. Crie nova aplicação
3. Configure callback URL: `https://seudominio.com/api/auth/callback/github`

### **SISTEMA DE PAGAMENTOS**

**Asaas (Mercado brasileiro):**
1. Crie conta em asaas.com
2. Obtenha API key
3. Adicione no .env:
```env
ASAAS_API_KEY=sua_api_key
ASAAS_ENVIRONMENT=sandbox  # ou production
```

---

## 🚀 **DEPLOY EM PRODUÇÃO**

### **OPÇÃO 1: Docker (Recomendado)**
```bash
# Configure variáveis no docker-compose.yml
docker-compose up -d
```

### **OPÇÃO 2: PM2 (Process Manager)**
```bash
# Instalar PM2
npm install -g pm2

# Iniciar com configuração
pm2 start ecosystem.config.js --env production

# Monitorar
pm2 monit
```

### **OPÇÃO 3: Deploy Direto**
```bash
npm run build
npm start
```

### **OPÇÃO 4: Nginx + App**
1. Configure o arquivo `nginx.production.conf`
2. Inicie a aplicação: `npm start`
3. Inicie o Nginx com a nova configuração

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

### **Testes Recomendados**
1. **Login/Logout** - Teste autenticação
2. **Upload de arquivos** - Teste storage
3. **Geração de imagens** - Teste IA
4. **Sistema de créditos** - Teste pagamentos
5. **Health check** - Verifique `/api/health`

---

## 🆘 **SOLUÇÃO DE PROBLEMAS COMUNS**

### **"Database connection failed"**
```bash
# Verificar DATABASE_URL no .env
# Verificar se PostgreSQL está rodando
# Testar conexão: npx prisma db push
```

### **"Authentication failed"**
```bash
# Verificar NEXTAUTH_SECRET
# Verificar OAuth credentials
# Verificar NEXTAUTH_URL
```

### **"Storage not working"**
```bash
# Verificar STORAGE_PROVIDER
# Verificar credenciais AWS/Cloudinary
# Verificar permissões de diretórios
```

### **"AI generation failed"**
```bash
# Verificar AI_PROVIDER
# Verificar API tokens
# Verificar webhook URLs
```

---

## 📞 **SUPORTE E MONITORAMENTO**

### **Logs da Aplicação**
```bash
# Ver logs em tempo real
npm start 2>&1 | tee app.log

# Ver logs de erro
findstr "ERROR" app.log
```

### **Health Check Detalhado**
```bash
curl http://localhost:3000/api/health
```

### **Monitoramento com PM2**
```bash
pm2 monit
pm2 logs
pm2 status
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

## 🎉 **PARABÉNS!**

Seu Ensaio Fotos está configurado para produção! Agora você pode:

- ✅ Treinar modelos de IA personalizados
- ✅ Gerar fotos profissionais
- ✅ Gerenciar usuários e assinaturas
- ✅ Monetizar sua plataforma

---

## 📚 **ARQUIVOS DE REFERÊNCIA**

- **`GUIA_CONFIGURACAO_PRODUCAO.md`** - Guia completo
- **`env.production`** - Template de variáveis
- **`next.config.production.js`** - Configuração Next.js
- **`ecosystem.config.js`** - Configuração PM2
- **`nginx.production.conf`** - Configuração Nginx

---

**🚀 Precisa de ajuda? Execute os scripts e consulte o guia completo!**
