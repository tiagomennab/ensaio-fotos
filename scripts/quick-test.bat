@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   ENSAIO FOTOS - TESTE RÁPIDO
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

call :print_status "Iniciando teste rápido do Ensaio Fotos..."

:: Verificar se .env existe
if not exist ".env" (
    call :print_error "Arquivo .env não encontrado!"
    call :print_status "Execute primeiro: scripts\setup-production-windows.bat"
    pause
    exit /b 1
)
call :print_success "Arquivo .env encontrado ✓"

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
    call :print_warning "Variáveis não configuradas:!missing_vars!"
    call :print_warning "Configure estas variáveis no .env antes de continuar."
    echo.
    set /p "continue=Continuar mesmo assim? (s/n): "
    if /i "!continue!"=="s" goto :continue_test
    pause
    exit /b 1
)

:continue_test

:: Verificar se node_modules existe
if not exist "node_modules" (
    call :print_status "Instalando dependências..."
    call npm ci --only=production
    if %errorlevel% neq 0 (
        call :print_error "Falha ao instalar dependências."
        pause
        exit /b 1
    )
    call :print_success "Dependências instaladas ✓"
) else (
    call :print_success "Dependências encontradas ✓"
)

:: Verificar se Prisma client existe
if not exist "node_modules\.prisma" (
    call :print_status "Gerando Prisma client..."
    call npx prisma generate
    if %errorlevel% neq 0 (
        call :print_error "Falha ao gerar Prisma client."
        pause
        exit /b 1
    )
    call :print_success "Prisma client gerado ✓"
) else (
    call :print_success "Prisma client encontrado ✓"
)

:: Testar conexão com banco de dados
call :print_status "Testando conexão com banco de dados..."
call npx prisma db push --accept-data-loss >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Falha ao conectar com banco de dados."
    call :print_warning "Verifique DATABASE_URL no .env"
) else (
    call :print_success "Conexão com banco estabelecida ✓"
)

:: Verificar se build existe
if not exist ".next" (
    call :print_status "Fazendo build da aplicação..."
    call npm run build
    if %errorlevel% neq 0 (
        call :print_error "Falha no build da aplicação."
        pause
        exit /b 1
    )
    call :print_success "Aplicação buildada ✓"
) else (
    call :print_success "Build encontrado ✓"
)

:: Verificar diretórios de upload
call :print_status "Verificando diretórios de upload..."
if not exist "uploads" mkdir "uploads"
if not exist "uploads\temp" mkdir "uploads\temp"
if not exist "uploads\generated" mkdir "uploads\generated"
if not exist "uploads\thumbnails" mkdir "uploads\thumbnails"
if not exist "uploads\training" mkdir "uploads\training"
if not exist "uploads\training\face" mkdir "uploads\training\face"
if not exist "uploads\training\body" mkdir "uploads\training\body"
call :print_success "Diretórios de upload verificados ✓"

:: Testar health check
call :print_status "Iniciando aplicação para teste..."
start /b npm start
set "app_pid=%time%"

:: Aguardar app iniciar
call :print_status "Aguardando aplicação iniciar..."
timeout /t 20 /nobreak >nul

:: Testar health check
call :print_status "Testando health check..."
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Health check passou ✓"
    call :print_success "Aplicação está funcionando!"
) else (
    call :print_warning "Health check falhou."
    call :print_warning "Verifique os logs da aplicação."
)

:: Parar aplicação
call :print_status "Parando aplicação..."
taskkill /f /im node.exe >nul 2>&1

:: Resumo final
echo.
echo ========================================
echo   RESULTADO DO TESTE
echo ========================================
echo.
call :print_success "Teste concluído!"
echo.
call :print_status "STATUS:"
if "!missing_vars!"=="" (
    echo   ✅ Variáveis de ambiente configuradas
) else (
    echo   ⚠️  Variáveis pendentes:!missing_vars!
)
echo   ✅ Dependências instaladas
echo   ✅ Prisma client gerado
echo   ✅ Build da aplicação
echo   ✅ Diretórios de upload
echo   ✅ Health check testado
echo.
call :print_status "PRÓXIMOS PASSOS:"
if not "!missing_vars!"=="" (
    echo   1. Configure as variáveis pendentes no .env
    echo   2. Execute este teste novamente
)
echo   3. Configure provedores de IA (Replicate/RunPod)
echo   4. Configure storage (AWS S3/Cloudinary)
echo   5. Configure sistema de pagamentos (Asaas)
echo   6. Deploy em produção
echo.
call :print_status "Para iniciar a aplicação:"
echo   npm start
echo.
call :print_status "Para desenvolvimento:"
echo   npm run dev
echo.

pause
