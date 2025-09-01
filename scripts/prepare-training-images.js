const fs = require('fs');
const path = require('path');
const https = require('https');
const archiver = require('archiver');

// Script para preparar imagens para treinamento FLUX
console.log('📸 PREPARAÇÃO DE IMAGENS PARA TREINAMENTO');
console.log('=========================================\n');

// Configurações
const TRAINING_SETUP = {
  imagesDir: './training-images',     // Diretório das suas imagens
  outputZip: './training-images.zip', // ZIP de saída
  minImages: 10,                      // Mínimo de imagens recomendado
  maxImages: 100,                     // Máximo de imagens para evitar custo alto
  supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  recommendedSize: '512x512 a 1024x1024 pixels'
};

function checkImagesDirectory() {
  console.log('🔍 Verificando diretório de imagens...');
  
  if (!fs.existsSync(TRAINING_SETUP.imagesDir)) {
    console.log('📁 Criando diretório:', TRAINING_SETUP.imagesDir);
    fs.mkdirSync(TRAINING_SETUP.imagesDir, { recursive: true });
    
    console.log('\n📋 INSTRUÇÕES:');
    console.log('================');
    console.log(`1. Adicione suas imagens ao diretório: ${TRAINING_SETUP.imagesDir}`);
    console.log(`2. Use ${TRAINING_SETUP.minImages}-${TRAINING_SETUP.maxImages} imagens para melhor resultado`);
    console.log(`3. Formatos suportados: ${TRAINING_SETUP.supportedFormats.join(', ')}`);
    console.log(`4. Resolução recomendada: ${TRAINING_SETUP.recommendedSize}`);
    console.log('5. Execute este script novamente após adicionar as imagens\n');
    
    console.log('💡 DICAS PARA MELHORES RESULTADOS:');
    console.log('- Use imagens variadas (diferentes ângulos, poses, iluminação)');
    console.log('- Imagens de alta qualidade produzem melhores modelos');
    console.log('- Evite imagens muito similares entre si');
    console.log('- Para pessoas: inclua close-ups e fotos de corpo inteiro');
    
    return false;
  }
  
  return true;
}

function analyzeImages() {
  console.log('📊 Analisando imagens...');
  
  const files = fs.readdirSync(TRAINING_SETUP.imagesDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return TRAINING_SETUP.supportedFormats.includes(ext);
  });
  
  console.log(`📁 Total de arquivos no diretório: ${files.length}`);
  console.log(`🖼️  Imagens válidas encontradas: ${imageFiles.length}`);
  
  if (imageFiles.length === 0) {
    console.log('\n❌ Nenhuma imagem válida encontrada!');
    console.log(`   Formatos suportados: ${TRAINING_SETUP.supportedFormats.join(', ')}`);
    return { valid: false, images: [] };
  }
  
  if (imageFiles.length < TRAINING_SETUP.minImages) {
    console.log(`\n⚠️  Poucas imagens! Recomendado: pelo menos ${TRAINING_SETUP.minImages} imagens`);
    console.log('   Resultado do treinamento pode ser de baixa qualidade');
  }
  
  if (imageFiles.length > TRAINING_SETUP.maxImages) {
    console.log(`\n⚠️  Muitas imagens! Máximo recomendado: ${TRAINING_SETUP.maxImages} imagens`);
    console.log('   Isso aumentará significativamente o custo do treinamento');
  }
  
  // Análise de tamanhos de arquivo
  let totalSize = 0;
  const fileSizes = imageFiles.map(file => {
    const filePath = path.join(TRAINING_SETUP.imagesDir, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
    return { file, size: stats.size };
  });
  
  console.log(`📏 Tamanho total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Verificar arquivos muito grandes ou muito pequenos
  const largFiles = fileSizes.filter(f => f.size > 5 * 1024 * 1024); // > 5MB
  const smallFiles = fileSizes.filter(f => f.size < 50 * 1024); // < 50KB
  
  if (largFiles.length > 0) {
    console.log(`⚠️  Arquivos grandes (>5MB): ${largFiles.length}`);
    largFiles.forEach(f => console.log(`   - ${f.file}: ${(f.size / 1024 / 1024).toFixed(2)}MB`));
  }
  
  if (smallFiles.length > 0) {
    console.log(`⚠️  Arquivos pequenos (<50KB): ${smallFiles.length}`);
    smallFiles.forEach(f => console.log(`   - ${f.file}: ${(f.size / 1024).toFixed(2)}KB`));
  }
  
  return { valid: true, images: imageFiles, totalSize, fileSizes };
}

async function createTrainingZip(imageFiles) {
  console.log('\n📦 Criando arquivo ZIP para treinamento...');
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(TRAINING_SETUP.outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`✅ ZIP criado: ${TRAINING_SETUP.outputZip}`);
      console.log(`📏 Tamanho do ZIP: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve(TRAINING_SETUP.outputZip);
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Adicionar cada imagem ao ZIP
    imageFiles.forEach(file => {
      const filePath = path.join(TRAINING_SETUP.imagesDir, file);
      archive.file(filePath, { name: file });
    });
    
    archive.finalize();
  });
}

function generateTrainingConfig(imageFiles) {
  console.log('\n⚙️ Configuração recomendada para treinamento:');
  console.log('===========================================');
  
  const imageCount = imageFiles.length;
  let recommendedSteps = 1000;
  let recommendedLR = 0.0004;
  let recommendedRank = 16;
  
  // Ajustar parâmetros baseado no número de imagens
  if (imageCount < 15) {
    recommendedSteps = 800;
    recommendedLR = 0.0005;
  } else if (imageCount > 50) {
    recommendedSteps = 1200;
    recommendedLR = 0.0003;
    recommendedRank = 32;
  }
  
  const config = {
    input_images: TRAINING_SETUP.outputZip,
    trigger_word: 'MEUMODELO', // Altere para algo único
    steps: recommendedSteps,
    lora_rank: recommendedRank,
    learning_rate: recommendedLR,
    batch_size: 1,
    resolution: '512,768,1024'
  };
  
  console.log(JSON.stringify(config, null, 2));
  
  // Estimativa de custo
  const estimatedCost = Math.max(3, Math.min(15, imageCount * 0.15 + (recommendedSteps / 1000) * 2));
  console.log(`\n💰 Custo estimado: $${estimatedCost.toFixed(2)} USD`);
  console.log(`⏱️  Tempo estimado: ${Math.ceil(recommendedSteps / 20 + imageCount * 2)} minutos`);
  
  return config;
}

async function prepareTrainingData() {
  try {
    // Verificar diretório
    if (!checkImagesDirectory()) {
      return;
    }
    
    // Analisar imagens
    const analysis = analyzeImages();
    if (!analysis.valid) {
      return;
    }
    
    // Criar ZIP
    await createTrainingZip(analysis.images);
    
    // Gerar configuração
    const config = generateTrainingConfig(analysis.images);
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('==================');
    console.log('1. Faça upload do ZIP para um serviço como:');
    console.log('   - Replicate File Upload: https://replicate.com/');
    console.log('   - Google Drive, Dropbox, ou similar');
    console.log('2. Obtenha a URL pública do arquivo ZIP');
    console.log('3. Use a configuração acima no script de treinamento');
    console.log('4. Execute: node scripts/test-real-training.js');
    
    console.log('\n💡 LEMBRE-SE:');
    console.log('- Altere o trigger_word para algo único');
    console.log('- Teste diferentes valores de steps/learning_rate se necessário');
    console.log('- Monitore o treinamento em: https://replicate.com/trainings/');
    
  } catch (error) {
    console.error('\n❌ Erro durante preparação:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  prepareTrainingData().catch(console.error);
}

module.exports = {
  prepareTrainingData,
  checkImagesDirectory,
  analyzeImages,
  createTrainingZip,
  generateTrainingConfig
};