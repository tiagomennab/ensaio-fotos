const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

// Função para criar backup do código
async function exportCode() {
  const projectRoot = __dirname
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
  const outputPath = path.join(projectRoot, `ensaio-fotos-backup-${timestamp}.zip`)

  console.log('🚀 Iniciando export do código...')
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
    console.log(`✅ Backup criado com sucesso!`)
    console.log(`📦 Arquivo: ${path.basename(outputPath)}`)
    console.log(`📏 Tamanho: ${sizeInMB} MB`)
    console.log(`📍 Local: ${outputPath}`)
  })

  output.on('error', (err) => {
    console.error('❌ Erro ao criar arquivo:', err)
  })

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('⚠️ Warning:', err)
    } else {
      throw err
    }
  })

  archive.on('error', (err) => {
    console.error('❌ Erro no archiver:', err)
    throw err
  })

  // Conectar archive ao output
  archive.pipe(output)

  // Adicionar todos os arquivos, exceto pastas/arquivos que devem ser ignorados
  const ignorePatterns = [
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
    'tsconfig.tsbuildinfo'
  ]

  console.log('📂 Adicionando arquivos ao ZIP...')

  // Adicionar arquivos do código fonte
  archive.glob('**/*', {
    cwd: projectRoot,
    ignore: ignorePatterns,
    dot: false // Não incluir arquivos ocultos
  })

  // Adicionar arquivos importantes da raiz
  const importantFiles = [
    'package.json',
    'package-lock.json',
    'next.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    'prisma/schema.prisma',
    '.env.example',
    'README.md',
    'CLAUDE.md'
  ]

  importantFiles.forEach(file => {
    const filePath = path.join(projectRoot, file)
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file })
      console.log(`✅ ${file}`)
    }
  })

  // Finalizar o archive
  console.log('🔄 Finalizando compactação...')
  await archive.finalize()
}

// Executar export
exportCode().catch(err => {
  console.error('❌ Erro durante export:', err)
  process.exit(1)
})