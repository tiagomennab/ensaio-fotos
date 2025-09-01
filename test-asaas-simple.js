// Teste simples da API do Asaas
require('dotenv').config({path: '.env.local'});

async function testAsaasConnection() {
  const apiKey = process.env.ASAAS_API_KEY;
  console.log('🔑 API Key carregada:', apiKey ? 'Sim' : 'Não');
  console.log('🌍 Ambiente:', process.env.ASAAS_ENVIRONMENT);
  
  if (!apiKey) {
    console.error('❌ ASAAS_API_KEY não encontrada no .env.local');
    return;
  }

  try {
    console.log('\n🚀 Testando conexão com Asaas...');
    
    // Teste básico - listar clientes (não precisa de webhook)
    const response = await fetch('https://sandbox.asaas.com/api/v3/customers?limit=1', {
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      }
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão com Asaas funcionando!');
      console.log('📋 Total de clientes encontrados:', data.totalCount || 0);
    } else {
      const errorData = await response.text();
      console.log('❌ Erro na API:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

testAsaasConnection();