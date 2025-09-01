require('dotenv').config({ path: '.env.local' });

async function getTrainingSchema() {
  try {
    const response = await fetch('https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions/26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2', {
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const versionInfo = await response.json();
      const inputSchema = versionInfo.openapi_schema?.components?.schemas?.Input;
      
      console.log('📋 Parâmetros do modelo de treinamento FLUX:');
      if (inputSchema?.properties) {
        Object.entries(inputSchema.properties).forEach(([param, schema]) => {
          const isRequired = inputSchema.required?.includes(param);
          const type = schema.type || 'object';
          const defaultValue = schema.default !== undefined ? ` (padrão: ${schema.default})` : '';
          console.log(`  ${isRequired ? '✓' : '○'} ${param}: ${type}${defaultValue}`);
          if (schema.description) {
            console.log(`    └─ ${schema.description}`);
          }
        });
      }
      
      console.log('\n📝 Parâmetros obrigatórios:', inputSchema.required || []);
    } else {
      console.error('Erro na resposta:', response.status);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

getTrainingSchema();