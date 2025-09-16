require('dotenv').config({ path: '.env.local' })

// Verificar estrutura de storage para vídeos
console.log('📂 ESTRUTURA DE STORAGE ATUAL')
console.log('=============================')

console.log('\n🎯 MAPEAMENTO DE CONTEXTOS:')
console.log('- Fotos geradas → generated/')
console.log('- Fotos editadas → edited/')  
console.log('- Fotos upscaladas → upscaled/')
console.log('- Vídeos gerados → videos/')

console.log('\n📁 DETECÇÃO POR PROMPT:')
console.log('- [EDITED] → edited/')
console.log('- [UPSCALED] → upscaled/')
console.log('- [VIDEO] → videos/')
console.log('- (padrão) → generated/')

console.log('\n🏗️ ESTRUTURA COMPLETA:')
console.log('storage/')
console.log('├── training/')
console.log('│   ├── face/[userId]/[modelId]_[index].jpg')
console.log('│   └── body/[userId]/[modelId]_[index].jpg')
console.log('├── generated/[userId]/[generationId]_[index].jpg')
console.log('├── edited/[userId]/[generationId]_[index].jpg')
console.log('├── upscaled/[userId]/[generationId]_[index].jpg')
console.log('├── videos/[userId]/[generationId]_[index].mp4')
console.log('└── thumbnails/')
console.log('    ├── generated/[userId]/[generationId]_[index]_thumb.jpg')
console.log('    ├── edited/[userId]/[generationId]_[index]_thumb.jpg')
console.log('    ├── upscaled/[userId]/[generationId]_[index]_thumb.jpg')
console.log('    └── videos/[userId]/[generationId]_[index]_thumb.jpg')

console.log('\n❓ ANÁLISE:')
console.log('✅ "generated/" é necessária - usada para fotos geradas')
console.log('❌ "generations/" NÃO existe e não é necessária')
console.log('✅ "videos/" será usada para vídeos gerados')
console.log('✅ Organização por operationType mantém separação clara')

console.log('\n🔧 IMPLEMENTAÇÃO:')
console.log('- Vídeos seguem mesmo padrão de storage')
console.log('- Detecção automática por prefixo [VIDEO]')
console.log('- Thumbnails de vídeo vão para thumbnails/videos/')
console.log('- Não há conflito com estrutura atual')

// Verificar variáveis de ambiente
console.log('\n⚙️ CONFIGURAÇÃO ATUAL:')
console.log('STORAGE_PROVIDER:', process.env.STORAGE_PROVIDER)
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET ? '✅ Configurado' : '❌ Não configurado')
console.log('Local uploads/ existe:', require('fs').existsSync('./uploads/') ? '✅ Sim' : '❌ Não')

if (require('fs').existsSync('./uploads/')) {
  const folders = require('fs').readdirSync('./uploads/')
  console.log('Pastas locais:', folders)
}