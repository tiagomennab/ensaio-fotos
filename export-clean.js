const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

// Função para criar backup limpo do código (apenas essencial)
async function exportCleanCode() {
  const projectRoot = __dirname
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
  const outputPath = path.join(projectRoot, `ensaio-fotos-clean-${timestamp}.zip`)

  console.log('🧹 Iniciando export LIMPO do código...')
  console.log('📁 Pasta do projeto:', projectRoot)
  console.log('📦 Arquivo de saída:', outputPath)

  // Criar stream de saída
  const output = fs.createWriteStream(outputPath)
  const archive = archiver('zip', {
    zlib: { level: 9 } // Máxima compressão
  })

  // Event listeners
  output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2)
    console.log(`✅ Backup LIMPO criado com sucesso!`)
    console.log(`📦 Arquivo: ${path.basename(outputPath)}`)
    console.log(`📏 Tamanho: ${sizeInMB} MB`)
    console.log(`📍 Local: ${outputPath}`)
  })

  output.on('error', (err) => {
    console.error('❌ Erro ao criar arquivo:', err)
  })

  archive.on('error', (err) => {
    console.error('❌ Erro no archiver:', err)
    throw err
  })

  // Conectar archive ao output
  archive.pipe(output)

  console.log('📂 Adicionando apenas arquivos essenciais...')

  // Pastas e arquivos essenciais
  const essentialPaths = [
    // Arquivos de configuração
    'package.json',
    'package-lock.json',
    'next.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    'postcss.config.js',
    '.env.example',
    'README.md',
    'CLAUDE.md',

    // Prisma
    'prisma/schema.prisma',

    // Source code
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx',
    'src/**/*.css',

    // Public assets (apenas os necessários)
    'public/examples/**/*.jpg',
    'public/examples/**/*.png',
    'public/examples/**/*.svg',

    // App structure
    'src/app/**',
    'src/components/**',
    'src/lib/**',
    'src/hooks/**',
    'src/types/**',
    'src/middleware.ts'
  ]

  // Adicionar cada caminho essencial
  for (const essentialPath of essentialPaths) {
    if (essentialPath.includes('*')) {
      // Usar glob para padrões
      archive.glob(essentialPath, {
        cwd: projectRoot,
        ignore: [
          'node_modules/**',
          '.next/**',
          '.git/**',
          '*.log',
          '.env.local',
          '.env',
          'uploads/**',
          'temp_video.mp4',
          '*.zip',
          'dev-server.log',
          'nul',
          '.vscode/**',
          '.playwright-mcp/**',
          'tsconfig.tsbuildinfo',
          '**/*.js.map',
          'scripts/debug-*',
          'scripts/test-*',
          'scripts/check-*',
          'scripts/fix-*',
          'scripts/verify-*',
          'scripts/recover-*',
          'scripts/create-*',
          'scripts/migrate-*',
          'scripts/apply-*',
          'add-*.js',
          'check-*.js',
          'create-*.js',
          'debug-*.js',
          'fix-*.js',
          'migrate-*.js',
          'recover-*.js',
          'sync-*.js',
          'test-*.js',
          'verify-*.js'
        ]
      })
    } else {
      // Adicionar arquivo específico
      const filePath = path.join(projectRoot, essentialPath)
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: essentialPath })
        console.log(`✅ ${essentialPath}`)
      }
    }
  }

  // Finalizar o archive
  console.log('🔄 Finalizando compactação limpa...')
  await archive.finalize()
}

// Executar export
exportCleanCode().catch(err => {
  console.error('❌ Erro durante export limpo:', err)
  process.exit(1)
})