const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const equalIndex = line.indexOf('=')
      if (equalIndex !== -1) {
        const key = line.substring(0, equalIndex).trim()
        const value = line.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
        console.log(`🔧 Loaded: ${key}=${value.substring(0, 10)}...`)
      }
    }
  })
}

async function testReplicateAuth() {
  const token = process.env.REPLICATE_API_TOKEN

  if (!token) {
    console.log('❌ REPLICATE_API_TOKEN não encontrado')
    return
  }

  console.log(`🔑 Token detectado: ${token.substring(0, 10)}...`)

  try {
    // Test with a simple GET request to predictions endpoint
    const response = await fetch('https://api.replicate.com/v1/predictions?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    console.log(`📡 Status da resposta: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Authorization funciona!')
      console.log(`📊 Predictions encontradas: ${data.results?.length || 0}`)
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ Erro na authorization:', errorData)
    }

  } catch (error) {
    console.log('❌ Erro na requisição:', error.message)
  }
}

testReplicateAuth()