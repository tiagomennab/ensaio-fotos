-- Migração para atualizar os limites de créditos conforme os novos valores dos planos
-- Execute este script no banco de dados para atualizar os usuários existentes

-- Atualizar usuários do plano STARTER que ainda têm limite antigo (10 ou qualquer valor diferente de 500)
UPDATE "User" 
SET "creditsLimit" = 500 
WHERE "plan" = 'STARTER' AND "creditsLimit" != 500;

-- Atualizar usuários do plano PREMIUM que ainda têm limite antigo (100 ou qualquer valor diferente de 1200)
UPDATE "User" 
SET "creditsLimit" = 1200 
WHERE "plan" = 'PREMIUM' AND "creditsLimit" != 1200;

-- Atualizar usuários do plano GOLD que ainda têm limite antigo (500 ou qualquer valor diferente de 2500)
UPDATE "User" 
SET "creditsLimit" = 2500 
WHERE "plan" = 'GOLD' AND "creditsLimit" != 2500;

-- Verificar os resultados da migração
SELECT 
    "plan",
    "creditsLimit",
    COUNT(*) as user_count
FROM "User" 
GROUP BY "plan", "creditsLimit"
ORDER BY "plan", "creditsLimit";