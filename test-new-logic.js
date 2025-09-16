// Simple test to verify our new logic
require('dotenv').config({ path: '.env.local' })

console.log('🧪 Testing webhook logic...')
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)

// Simulate the new logic
const webhookUrl = process.env.NODE_ENV === 'production' 
  ? `${process.env.NEXTAUTH_URL}/api/webhooks/generation`
  : undefined

console.log(`Webhook URL would be: ${webhookUrl || 'undefined (no webhook)'}`)

const hasValidWebhook = process.env.NODE_ENV === 'production' && webhookUrl && webhookUrl.startsWith('https://')

console.log(`Has valid webhook: ${hasValidWebhook}`)

if (hasValidWebhook) {
  console.log('✅ Would configure webhook')
} else if (process.env.NODE_ENV === 'development') {
  console.log('🔄 Development mode: Webhooks disabled (use polling instead)')
} else {
  console.log('⚠️ No valid webhook URL')
}

// Test prediction options structure
const predictionOptions = {
  version: 'test-version',
  input: { prompt: 'test' }
}

if (hasValidWebhook) {
  predictionOptions.webhook = webhookUrl
  predictionOptions.webhook_events_filter = ['start', 'output', 'logs', 'completed']
}

console.log('\n📋 Prediction options that would be sent:')
console.log(JSON.stringify(predictionOptions, null, 2))