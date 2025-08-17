# Instruções Pós-Migração

Após aplicar o arquivo `migration_fix_inconsistencies.sql` no seu banco PostgreSQL, siga estes passos:

## 1. Regenerar o Cliente Prisma

```bash
npx prisma generate
```

Este comando irá regenerar o cliente Prisma com os novos modelos e campos adicionados.

## 2. Verificar se a Migração foi Aplicada Corretamente

Execute estas queries no seu banco para verificar:

```sql
-- Verificar novos campos na tabela users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('totalModels', 'totalGenerations', 'totalCreditsUsed', 'lastLoginAt')
ORDER BY column_name;

-- Verificar se a tabela SystemLog foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'SystemLog'
ORDER BY ordinal_position;

-- Verificar índices criados
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('users', 'SystemLog', 'generations')
AND indexname LIKE '%_idx'
ORDER BY tablename, indexname;
```

## 3. Remover Comentários Temporários

Após regenerar o cliente Prisma, você pode remover os comentários `// NOTE: After applying migration...` e os `as any` dos seguintes arquivos:

- `src/app/dashboard/page.tsx`
- `src/app/api/cron/cleanup/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`

## 4. Executar o Job de Limpeza (Opcional)

Para popular os novos campos de estatísticas do usuário, execute:

```bash
curl -X GET "http://localhost:3000/api/cron/cleanup" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Ou aguarde a execução automática do cron job.

## 5. Testar Funcionalidades

Teste as seguintes funcionalidades para garantir que tudo está funcionando:

- ✅ Dashboard carrega estatísticas corretamente
- ✅ Login atualiza o `lastLoginAt`
- ✅ Sistema de logs funciona com SystemLog
- ✅ Métricas de monitoramento mostram contagem de erros
- ✅ Job de limpeza atualiza estatísticas do usuário

## Resumo das Mudanças Aplicadas

### Prisma Schema (`prisma/schema.prisma`):
- ✅ Adicionado modelo `SystemLog`
- ✅ Adicionados campos ao modelo `User`: `totalModels`, `totalGenerations`, `totalCreditsUsed`, `lastLoginAt`
- ✅ Adicionados índices apropriados

### Código Atualizado:
- ✅ `src/lib/monitoring/logger.ts` - Usa SystemLog em vez de UsageLog
- ✅ `src/app/api/monitoring/metrics/route.ts` - Conta erros do SystemLog
- ✅ `src/app/dashboard/page.tsx` - Usa estatísticas do usuário
- ✅ `src/app/api/cron/cleanup/route.ts` - Atualiza estatísticas do usuário
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Registra lastLoginAt
- ✅ `src/lib/analytics/tracker.ts` - Usa campos de assinatura existentes
- ✅ `src/types/index.ts` - Adicionados tipos SystemLog e campos User

### Banco de Dados:
- ✅ Tabela `SystemLog` criada
- ✅ Campos adicionados à tabela `users`
- ✅ Campos adicionados à tabela `generations`
- ✅ Índices criados para performance

Todas as inconsistências entre o schema Prisma e o banco de dados foram resolvidas!
