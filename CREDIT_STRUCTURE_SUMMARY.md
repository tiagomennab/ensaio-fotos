# 📊 Estrutura de Créditos Aprimorada - VibePhoto

## 🎯 **Objetivo**
Implementar um sistema robusto de pacotes de créditos separado do sistema de assinatura, permitindo que usuários comprem créditos adicionais que não expiram mensalmente.

## 🏗️ **Arquitetura Implementada**

### 1. **Separação de Créditos**
- **Créditos de Assinatura**: Renovam mensalmente, limitados pelo plano
- **Créditos Comprados**: Válidos por 12 meses, não renovam automaticamente
- **Sistema de Prioridade**: Usa créditos de assinatura primeiro, depois créditos comprados

### 2. **Novos Campos no User**
```sql
creditsBalance INTEGER DEFAULT 0           -- Saldo de créditos comprados
asaasCustomerId VARCHAR(255) UNIQUE       -- ID do cliente no Asaas
cpfCnpj VARCHAR(14)                       -- CPF/CNPJ para Asaas
phone VARCHAR(20)                         -- Telefone
mobilePhone VARCHAR(20)                   -- Celular
address VARCHAR(255)                      -- Endereço completo
addressNumber VARCHAR(20)                 -- Número
complement VARCHAR(100)                   -- Complemento
province VARCHAR(100)                     -- Bairro
city VARCHAR(100)                         -- Cidade
state VARCHAR(2)                          -- UF
postalCode VARCHAR(9)                     -- CEP
subscriptionCancelledAt TIMESTAMP         -- Data de cancelamento
nextBillingDate TIMESTAMP                 -- Próxima cobrança
```

### 3. **Novos Modelos**

#### **CreditPackage**
```typescript
{
  id: 'ESSENTIAL' | 'ADVANCED' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'
  name: string
  description: string
  creditAmount: number      // Créditos base
  bonusCredits: number      // Créditos bônus
  price: number            // Preço em BRL
  validityMonths: 12       // Validade
  isActive: boolean
  sortOrder: number
}
```

#### **CreditTransaction**
```typescript
{
  id: string
  userId: string
  type: 'EARNED' | 'SPENT' | 'EXPIRED' | 'REFUNDED'
  source: 'SUBSCRIPTION' | 'PURCHASE' | 'BONUS' | 'GENERATION' | 'TRAINING'
  amount: number           // Positivo = ganho, negativo = gasto
  description: string
  referenceId: string      // ID da geração, modelo, etc
  creditPurchaseId: string // Qual compra foi afetada
  balanceAfter: number     // Saldo total após transação
  createdAt: Date
}
```

## 📦 **Pacotes de Créditos Definidos**

| Pacote | Créditos Base | Bônus | Total | Preço | Validade |
|--------|---------------|-------|--------|-------|----------|
| **Essencial** | 350 | 50 | **400** | R$ 29,90 | 12 meses |
| **Avançado** | 800 | 150 | **950** | R$ 59,90 | 12 meses |
| **Profissional** | 1.700 | 400 | **2.100** | R$ 99,90 | 12 meses |
| **Empresarial** | 3.500 | 900 | **4.400** | R$ 179,90 | 12 meses |
| **Enterprise** | 7.500 | 2.000 | **9.500** | R$ 299,90 | 12 meses |

## 🔧 **Serviços Implementados**

### **CreditPackageService**
- `getAvailablePackages()` - Lista pacotes disponíveis
- `getUserCreditBalance(userId)` - Saldo detalhado do usuário
- `debitCredits(userId, amount, description)` - Debita créditos com prioridade
- `addPurchasedCredits(userId, amount, bonus)` - Adiciona créditos comprados
- `hasEnoughCredits(userId, required)` - Verifica disponibilidade
- `resetSubscriptionCredits(userId)` - Reset mensal da assinatura
- `getUserCreditHistory(userId)` - Histórico de transações

### **APIs Implementadas**
- `GET /api/credit-packages` - Lista pacotes disponíveis
- `POST /api/credit-packages` - Inicia compra de pacote
- `GET /api/credits/balance` - Consulta saldo do usuário

## 💡 **Lógica de Débito de Créditos**

```typescript
// Exemplo: usuário tem 50 créditos de assinatura + 200 comprados
// Precisa de 100 créditos para uma geração

1. Verifica total disponível: 50 + 200 = 250 ✅
2. Debita primeiro da assinatura: 50 créditos
3. Debita restante dos comprados: 50 créditos
4. Resultado: 0 assinatura + 150 comprados = 150 disponíveis
```

## 📁 **Arquivos Criados/Modificados**

### **Novos Arquivos**
- `src/lib/services/credit-package-service.ts` - Serviço principal
- `src/app/api/credit-packages/route.ts` - API de pacotes
- `src/app/api/credits/balance/route.ts` - API de saldo
- `scripts/apply-credit-structure.js` - Script de migração
- `prisma/migrations/*/migration.sql` - Migração SQL

### **Arquivos Modificados**
- `prisma/schema.prisma` - Novos campos e modelos
- Arquivos de webhook do Asaas (correções de valores)

## 🚀 **Próximos Passos**

### **Implementação Completa**
1. **Interface de Compra**
   - Página de pacotes de créditos
   - Checkout integrado com Asaas
   - Confirmação de pagamento

2. **Dashboard de Créditos**
   - Saldo detalhado (assinatura + comprados)
   - Histórico de transações
   - Notificações de expiração

3. **Integração com Geração**
   - Atualizar sistema de débito
   - Mostrar origem dos créditos usados
   - Alertas de saldo baixo

4. **Webhook de Pagamento**
   - Processar confirmação de compra
   - Adicionar créditos ao usuário
   - Notificar por email

### **Exemplo de Interface**

```typescript
// Saldo do usuário na interface
{
  subscriptionCredits: 450,    // Créditos restantes da assinatura
  purchasedCredits: 1200,      // Créditos comprados disponíveis  
  totalCredits: 1650,          // Total disponível para uso
  availableCredits: 1650       // Pode usar agora
}
```

## 📋 **Comandos para Aplicar**

```bash
# 1. Parar servidores de desenvolvimento
# Fechar todos os processos Node.js

# 2. Aplicar estrutura no banco
node scripts/apply-credit-structure.js

# 3. Regenerar Prisma client
npx prisma generate

# 4. Reiniciar desenvolvimento
npm run dev
```

## 🎯 **Benefícios**

1. **Flexibilidade**: Usuários podem comprar créditos quando precisar
2. **Retenção**: Créditos comprados não expiram mensalmente
3. **Upsell**: Oportunidade de venda adicional
4. **Transparência**: Separação clara entre créditos de assinatura e comprados
5. **Escalabilidade**: Sistema preparado para diferentes tipos de pacotes