const fs = require('fs')
const path = require('path')

async function fixVideoQualityReferences() {
  console.log('🔧 Corrigindo referências a VideoQuality UPPERCASE...')
  
  // Lista de arquivos para corrigir
  const filesToFix = [
    'src/components/gallery/video-modal.tsx',
    'src/components/gallery/video-gallery.tsx'
  ]
  
  let totalChanges = 0
  
  for (const filePath of filesToFix) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`)
      continue
    }
    
    console.log(`\n📝 Corrigindo: ${filePath}`)
    
    let content = fs.readFileSync(filePath, 'utf8')
    let changes = 0
    
    // Substituições específicas
    const replacements = [
      // Tipos TypeScript
      { from: "'STANDARD' | 'PRO'", to: "'standard' | 'pro'" },
      { from: '"STANDARD" | "PRO"', to: '"standard" | "pro"' },
      
      // Valores em arrays/objetos
      { from: "value: 'STANDARD'", to: "value: 'standard'" },
      { from: "value: 'PRO'", to: "value: 'pro'" },
      { from: 'value: "STANDARD"', to: 'value: "standard"' },
      { from: 'value: "PRO"', to: 'value: "pro"' },
      
      // Comparações e atribuições
      { from: "quality === 'STANDARD'", to: "quality === 'standard'" },
      { from: "quality === 'PRO'", to: "quality === 'pro'" },
      { from: 'quality === "STANDARD"', to: 'quality === "standard"' },
      { from: 'quality === "PRO"', to: 'quality === "pro"' },
      
      // Defaults e atribuições
      { from: "quality: 'STANDARD'", to: "quality: 'standard'" },
      { from: "quality: 'PRO'", to: "quality: 'pro'" },
      { from: 'quality: "STANDARD"', to: 'quality: "standard"' },
      { from: 'quality: "PRO"', to: 'quality: "pro"' },
      
      // Cases em switch
      { from: "case 'STANDARD':", to: "case 'standard':" },
      { from: "case 'PRO':", to: "case 'pro':" },
      { from: 'case "STANDARD":', to: 'case "standard":' },
      { from: 'case "PRO":', to: 'case "pro":' }
    ]
    
    for (const replacement of replacements) {
      const beforeLength = content.length
      content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replacement.to)
      const afterLength = content.length
      
      if (beforeLength !== afterLength) {
        const occurrences = (beforeLength - afterLength) / (replacement.from.length - replacement.to.length)
        if (occurrences > 0) {
          console.log(`  ✅ ${replacement.from} → ${replacement.to} (${occurrences} ocorrências)`)
          changes += occurrences
        }
      }
    }
    
    // Escrever arquivo modificado
    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`  💾 Arquivo salvo com ${changes} mudanças`)
      totalChanges += changes
    } else {
      console.log(`  ➖ Nenhuma mudança necessária`)
    }
  }
  
  console.log(`\n📊 RESUMO:`)
  console.log(`✅ Total de mudanças: ${totalChanges}`)
  
  if (totalChanges > 0) {
    console.log('\n🎉 CORREÇÕES CONCLUÍDAS!')
    console.log('✅ Todas as referências a VideoQuality foram convertidas para lowercase')
    console.log('✅ A criação de vídeos deve funcionar agora')
  } else {
    console.log('\n✅ Todos os arquivos já estavam corretos!')
  }
  
  return totalChanges > 0
}

// Executar se chamado diretamente
if (require.main === module) {
  fixVideoQualityReferences().then(hasChanges => {
    if (hasChanges) {
      console.log('\n🚀 SUCESSO! Tente criar um vídeo novamente.')
    } else {
      console.log('\n👍 Tudo já estava correto.')
    }
  }).catch(console.error)
}

module.exports = { fixVideoQualityReferences }