require('dotenv').config({ path: '.env.local' });
const Replicate = require('replicate');

// Configuração do treinamento real
const TRAINING_CONFIG = {
  apiToken: process.env.REPLICATE_API_TOKEN,
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/training',
  models: {
    training: 'ostris/flux-dev-lora-trainer' // Usar a última versão automaticamente
  }
};

async function startCustomTraining() {
  console.log('🏋️ Iniciando treinamento do seu modelo personalizado...\n');
  
  if (!TRAINING_CONFIG.apiToken) {
    console.error('❌ REPLICATE_API_TOKEN não encontrado nas variáveis de ambiente');
    return;
  }

  const replicate = new Replicate({
    auth: TRAINING_CONFIG.apiToken
  });

  // Parâmetros do treinamento
  const trainingInput = {
    // OBRIGATÓRIO: ZIP com suas imagens (substitua por sua URL)
    input_images: 'https://replicate.delivery/pbxt/IJhMT93w5lxqzNzTLqm0RGQUVvNjkZuSCwZXdWIR3N24XiSIA/training_images.zip',
    
    // OBRIGATÓRIO: Palavra-chave única para ativar seu modelo
    trigger_word: 'MEUMODELO',
    
    // Configurações de treinamento otimizadas
    steps: 800,               // Passos de treinamento (800 = bom custo-benefício)
    lora_rank: 16,           // Complexidade do modelo (16 = equilibrado)
    learning_rate: 0.0004,   // Taxa de aprendizado
    batch_size: 1,           // Tamanho do batch
    resolution: '512,768,1024', // Resoluções suportadas
    
    // Configurações opcionais
    caption_dropout_rate: 0.1,  // Taxa de dropout das legendas
    cache_latents_to_disk: false,
    wandb_project: '',           // Deixe vazio se não usar Weights & Biases
    hf_repo_id: '',             // Deixe vazio se não quiser upload para HuggingFace
    hf_token: '',               // Token do HuggingFace (opcional)
    
    // Configurações avançadas
    gradient_checkpointing: true,
    push_to_hub: false,
    is_intermediate: false
  };

  try {
    console.log('📝 Configuração do treinamento:');
    console.log('=====================================');
    console.log(`🎯 Trigger Word: ${trainingInput.trigger_word}`);
    console.log(`📊 Steps: ${trainingInput.steps}`);
    console.log(`🔧 LoRA Rank: ${trainingInput.lora_rank}`);
    console.log(`⚡ Learning Rate: ${trainingInput.learning_rate}`);
    console.log(`📏 Resoluções: ${trainingInput.resolution}`);
    console.log(`💰 Custo estimado: ~$3-8 USD\n`);

    console.log('🚀 Criando treinamento...');
    
    const training = await replicate.trainings.create({
      model: TRAINING_CONFIG.models.training,
      input: trainingInput,
      webhook: TRAINING_CONFIG.webhookUrl,
      webhook_events_filter: ['start', 'output', 'logs', 'completed']
    });

    console.log('\n✅ Treinamento criado com sucesso!');
    console.log('=====================================');
    console.log(`🆔 ID: ${training.id}`);
    console.log(`📊 Status: ${training.status}`);
    console.log(`🕐 Criado em: ${training.created_at}`);
    console.log(`🌐 URL: https://replicate.com/trainings/${training.id}`);
    
    console.log('\n📋 Próximos passos:');
    console.log('- O treinamento levará aproximadamente 30-60 minutos');
    console.log('- Você receberá notificações via webhook quando completar');
    console.log('- Monitore o progresso em: https://replicate.com/trainings/' + training.id);
    console.log('- Após completar, use a palavra "MEUMODELO" nos prompts para ativar seu estilo');

    return training;

  } catch (error) {
    console.error('\n❌ Erro ao criar treinamento:', error.message);
    
    // Diagnóstico de erros comuns
    if (error.message.includes('insufficient credits')) {
      console.log('\n💳 Solução: Adicione créditos à sua conta Replicate');
      console.log('   👉 https://replicate.com/account/billing');
    } else if (error.message.includes('invalid input')) {
      console.log('\n📋 Solução: Verifique o formato dos parâmetros de entrada');
      console.log('   👉 ZIP deve conter pelo menos 10 imagens');
    } else if (error.message.includes('webhook')) {
      console.log('\n🪝 Solução: Verifique a configuração do webhook');
      console.log('   👉 URL deve ser HTTPS válida');
    }
    
    return null;
  }
}

async function monitorTraining(trainingId) {
  console.log(`\n👀 Monitorando treinamento: ${trainingId}`);
  console.log('=====================================');
  
  const replicate = new Replicate({
    auth: TRAINING_CONFIG.apiToken
  });

  const maxChecks = 60; // Máximo de 60 verificações (30 minutos)
  let checks = 0;
  
  while (checks < maxChecks) {
    try {
      const training = await replicate.trainings.get(trainingId);
      
      console.log(`📊 Check ${checks + 1}: ${training.status}`);
      
      if (training.logs) {
        const logLines = training.logs.split('\n').slice(-3); // Últimas 3 linhas
        logLines.forEach(line => {
          if (line.trim()) {
            console.log(`📝 ${line.trim()}`);
          }
        });
      }
      
      if (training.status === 'succeeded') {
        console.log('\n🎉 Treinamento completado com sucesso!');
        if (training.output) {
          console.log('📦 Modelo treinado:');
          console.log(JSON.stringify(training.output, null, 2));
          
          console.log('\n🎯 Como usar seu modelo:');
          console.log('1. Use a palavra "MEUMODELO" nos seus prompts');
          console.log('2. Exemplo: "MEUMODELO person in a beautiful garden"');
          console.log('3. Configure o modelo na aplicação usando a URL do output');
        }
        return training;
      } else if (training.status === 'failed') {
        console.log('\n❌ Treinamento falhou');
        if (training.error) {
          console.log(`🚨 Erro: ${training.error}`);
        }
        return training;
      } else if (training.status === 'canceled') {
        console.log('\n🛑 Treinamento foi cancelado');
        return training;
      }
      
      // Aguardar antes da próxima verificação
      checks++;
      if (checks < maxChecks) {
        console.log('⏳ Aguardando 30 segundos...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    } catch (error) {
      console.error('❌ Falha ao obter status:', error.message);
      break;
    }
  }
  
  console.log('⏰ Timeout de monitoramento atingido');
  console.log('👉 Continue monitorando em: https://replicate.com/trainings/' + trainingId);
  return null;
}

async function runCustomTraining() {
  console.log('🎯 TREINAMENTO DE MODELO PERSONALIZADO');
  console.log('=====================================\n');
  
  // Verificar se quer continuar
  console.log('⚠️  IMPORTANTE:');
  console.log('- Este treinamento consumirá créditos reais (~$3-8 USD)');
  console.log('- Substitua a URL das imagens pelas suas próprias imagens');
  console.log('- O treinamento levará 30-60 minutos para completar\n');
  
  // Para teste real, descomente as linhas abaixo
  // const training = await startCustomTraining();
  // if (training) {
  //   await monitorTraining(training.id);
  // }
  
  console.log('💡 Para executar o treinamento real:');
  console.log('1. Prepare um ZIP com suas imagens (mínimo 10 imagens)');
  console.log('2. Faça upload do ZIP para um serviço como Replicate File Upload');
  console.log('3. Substitua a URL do input_images no script');
  console.log('4. Descomente as linhas de execução no final do script');
  console.log('5. Execute: node scripts/test-real-training.js');
}

// Executar se chamado diretamente
if (require.main === module) {
  runCustomTraining().catch(console.error);
}

module.exports = {
  startCustomTraining,
  monitorTraining,
  runCustomTraining
};