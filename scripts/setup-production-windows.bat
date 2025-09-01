@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   ENSAIO FOTOS - SETUP PRODUÇÃO
echo ========================================
echo.

:: Cores para output
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:: Função para print colorido
:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_success
echo %BLUE%[SUCCESS]%NC% %~1
goto :eof

call :print_status "Iniciando configuração de produção para Ensaio Fotos..."

:: Verificar se Node.js está instalado
call :print_status "Verificando Node.js..."
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Node.js não está instalado. Instale Node.js 18+ primeiro."
    pause
    exit /b 1
)
call :print_success "Node.js encontrado ✓"

:: Verificar se npm está instalado
call :print_status "Verificando npm..."
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "npm não está instalado."
    pause
    exit /b 1
)
call :print_success "npm encontrado ✓"

:: Verificar se o arquivo .env existe
if not exist ".env" (
    call :print_warning "Arquivo .env não encontrado. Copiando de env.production..."
    if exist "env.production" (
        copy "env.production" ".env" >nul
        call :print_success "Arquivo .env criado ✓"
    ) else (
        call :print_error "Arquivo env.production não encontrado. Crie o arquivo .env manualmente."
        pause
        exit /b 1
    )
) else (
    call :print_success "Arquivo .env encontrado ✓"
)

:: Instalar dependências
call :print_status "Instalando dependências..."
call npm ci --only=production
if %errorlevel% neq 0 (
    call :print_error "Falha ao instalar dependências."
    pause
    exit /b 1
)
call :print_success "Dependências instaladas ✓"

:: Gerar Prisma client
call :print_status "Gerando Prisma client..."
call npx prisma generate
if %errorlevel% neq 0 (
    call :print_error "Falha ao gerar Prisma client."
    pause
    exit /b 1
)
call :print_success "Prisma client gerado ✓"

:: Verificar conexão com banco de dados
call :print_status "Verificando conexão com banco de dados..."
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    call :print_warning "Falha ao conectar com banco de dados. Verifique DATABASE_URL no .env"
    call :print_warning "Você pode pular esta etapa e configurar o banco depois."
    set /p "skip_db=Continuar sem banco de dados? (s/n): "
    if /i "!skip_db!"=="s" goto :skip_db
    pause
    exit /b 1
)
call :print_success "Conexão com banco de dados estabelecida ✓"

:skip_db

:: Executar migrações se existirem
if exist "prisma\migrations" (
    call :print_status "Executando migrações..."
    call npx prisma migrate deploy
    if %errorlevel% neq 0 (
        call :print_warning "Falha ao executar migrações. Verifique o banco de dados."
    ) else (
        call :print_success "Migrações executadas ✓"
    )
)

:: Verificar variáveis críticas
call :print_status "Verificando variáveis críticas..."
set "missing_vars="

:: Verificar NEXTAUTH_SECRET
findstr /c:"NEXTAUTH_SECRET=sua_chave_secreta" .env >nul
if %errorlevel% equ 0 (
    set "missing_vars=!missing_vars! NEXTAUTH_SECRET"
)

:: Verificar NEXTAUTH_URL
findstr /c:"NEXTAUTH_URL=https://seudominio.com" .env >nul
if %errorlevel% equ 0 (
    set "missing_vars=!missing_vars! NEXTAUTH_URL"
)

:: Verificar GOOGLE_CLIENT_ID
findstr /c:"GOOGLE_CLIENT_ID=seu_google_client_id" .env >nul
if %errorlevel% equ 0 (
    set "missing_vars=!missing_vars! GOOGLE_CLIENT_ID"
)

:: Verificar GITHUB_CLIENT_ID
findstr /c:"GITHUB_CLIENT_ID=seu_github_client_id" .env >nul
if %errorlevel% equ 0 (
    set "missing_vars=!missing_vars! GITHUB_CLIENT_ID"
)

if not "!missing_vars!"=="" (
    call :print_warning "As seguintes variáveis precisam ser configuradas:!missing_vars!"
    call :print_warning "Edite o arquivo .env com seus valores reais antes de continuar."
    echo.
    set /p "continue=Continuar mesmo assim? (s/n): "
    if /i "!continue!"=="s" goto :continue_setup
    pause
    exit /b 1
)

:continue_setup

:: Build da aplicação
call :print_status "Fazendo build da aplicação..."
call npm run build
if %errorlevel% neq 0 (
    call :print_error "Falha no build da aplicação."
    pause
    exit /b 1
)
call :print_success "Aplicação buildada ✓"

:: Criar diretórios necessários
call :print_status "Criando diretórios necessários..."
if not exist "uploads" mkdir "uploads"
if not exist "uploads\temp" mkdir "uploads\temp"
if not exist "uploads\generated" mkdir "uploads\generated"
if not exist "uploads\thumbnails" mkdir "uploads\thumbnails"
if not exist "uploads\training" mkdir "uploads\training"
if not exist "uploads\training\face" mkdir "uploads\training\face"
if not exist "uploads\training\body" mkdir "uploads\training\body"
call :print_success "Diretórios criados ✓"

:: Verificar health check
call :print_status "Iniciando verificação de saúde..."
start /b npm start
set "app_pid=%time%"

:: Aguardar app iniciar
timeout /t 15 /nobreak >nul

:: Testar health check
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Health check passou ✓"
) else (
    call :print_warning "Health check falhou. A aplicação pode não estar funcionando corretamente."
)

:: Parar aplicação
taskkill /f /im node.exe >nul 2>&1

:: Resumo final
echo.
echo ========================================
echo   CONFIGURAÇÃO CONCLUÍDA!
echo ========================================
echo.
call :print_success "Setup de produção concluído com sucesso!"
echo.
call :print_status "PRÓXIMOS PASSOS:"
echo   1. Edite o arquivo .env com seus valores reais
echo   2. Configure o banco de dados PostgreSQL
echo   3. Configure os provedores de IA (Replicate/RunPod)
echo   4. Configure o storage (AWS S3/Cloudinary)
echo   5. Configure os OAuth providers (Google/GitHub)
echo   6. Configure o sistema de pagamentos (Asaas)
echo.
call :print_status "Para iniciar em produção:"
echo   npm start
echo.
call :print_status "Para desenvolvimento:"
echo   npm run dev
echo.
call :print_warning "IMPORTANTE: Configure todas as variáveis no .env antes de usar em produção!"
echo.

pause
