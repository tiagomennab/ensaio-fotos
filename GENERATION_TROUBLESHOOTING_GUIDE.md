# Generation Troubleshooting Guide

This guide helps diagnose and fix "Failed to create generation" errors in the VibePhoto application.

## Quick Diagnosis

### 1. Run the Test Script
```bash
node scripts/test-generation.js
```

### 2. Use the Debug Endpoint
```bash
curl -X POST http://localhost:3000/api/debug/generation \
  -H "Content-Type: application/json" \
  -d '{"modelId": "your-model-id"}'
```

### 3. Check Browser Console
Open browser dev tools and look for detailed error messages in the console.

## Common Issues and Solutions

### Authentication Problems

**Symptom:** "Invalid Replicate API token" or 401 errors

**Solutions:**
1. Verify `REPLICATE_API_TOKEN` in `.env.local`:
   ```bash
   echo $REPLICATE_API_TOKEN
   ```
2. Check token validity at [Replicate Account](https://replicate.com/account/api-tokens)
3. Ensure token has proper permissions for model access

**Test:**
```bash
curl -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
     https://api.replicate.com/v1/models/black-forest-labs/flux-schnell
```

### Model URL Issues

**Symptom:** "Model not found" or "Invalid model URL"

**Common Problems:**
- Wrong model URL format
- Model doesn't exist or isn't accessible
- Model isn't ready for inference

**Solutions:**
1. **Check Model URL Format:**
   - Correct: `username/modelname:version_id`
   - Wrong: `https://replicate.com/username/modelname`

2. **Verify Model Exists:**
   ```bash
   # Replace with your actual model URL parts
   curl -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
        https://api.replicate.com/v1/models/vibephoto/model-name/versions/version_id
   ```

3. **Check Model Status:**
   - Model status must be `active` for generation
   - Training must be completed successfully

### Parameter Issues

**Symptom:** "Invalid input parameters" or validation errors

**FLUX Model Parameters:**
```javascript
{
  prompt: "required string",
  width: 1024,              // Must be multiple of 16
  height: 1024,             // Must be multiple of 16
  num_inference_steps: 4,   // FLUX Schnell: 1-8, Dev: 10-50
  guidance_scale: 3.5,      // FLUX optimal: 1.0-5.0
  seed: 123456,             // Optional integer
  num_outputs: 1            // 1-4 for multiple variations
}
```

**Parameter Rules:**
- Width/height must be multiples of 16
- FLUX Schnell works best with 1-8 steps
- FLUX Dev/Pro work better with 10-50 steps
- Guidance scale for FLUX should be lower (1.0-5.0)

### Rate Limiting

**Symptom:** "Rate limit exceeded" or 429 errors

**Solutions:**
1. Check Replicate dashboard for current usage
2. Implement exponential backoff retry logic
3. Consider upgrading Replicate plan
4. Use webhooks instead of polling for status

### Webhook Issues

**Symptom:** Generation starts but never completes

**Solutions:**
1. **Verify Webhook URL:**
   ```bash
   # Your webhook must be HTTPS and publicly accessible
   curl https://your-domain.com/api/webhooks/generation
   ```

2. **Check Webhook Secret:**
   ```env
   REPLICATE_WEBHOOK_SECRET=your-secret-key
   ```

3. **Test Webhook Locally:**
   ```bash
   # Use ngrok for local testing
   ngrok http 3000
   # Update NEXTAUTH_URL to ngrok URL
   ```

### Database Issues

**Symptom:** Generation fails with database errors

**Solutions:**
1. **Check Database Connection:**
   ```bash
   npx prisma db pull
   ```

2. **Verify Model Status:**
   ```sql
   SELECT id, name, status, modelUrl FROM AIModel WHERE userId = 'user-id';
   ```

3. **Check User Credits:**
   ```sql
   SELECT creditsUsed, creditsLimit FROM User WHERE id = 'user-id';
   ```

## Debugging Steps

### 1. Enable Detailed Logging

Add to `.env.local`:
```env
LOG_LEVEL=debug
DEBUG=replicate:*
```

### 2. Monitor Network Requests

1. Open browser dev tools
2. Go to Network tab
3. Try generation
4. Check failed requests for status codes and error messages

### 3. Check Server Logs

```bash
npm run dev
# Look for detailed error messages in console
```

### 4. Test with cURL

```bash
# Test generation API directly
curl -X POST http://localhost:3000/api/generations \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "modelId": "your-model-id",
    "prompt": "test prompt",
    "aspectRatio": "1:1",
    "resolution": "512x512",
    "variations": 1
  }'
```

## Error Code Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| `AUTH_ERROR` | Invalid API token | Check REPLICATE_API_TOKEN |
| `MODEL_NOT_FOUND` | Model doesn't exist | Verify model URL and access |
| `MODEL_NOT_READY` | Model not ready for inference | Wait for training completion |
| `INVALID_INPUT` | Invalid parameters | Check parameter format and values |
| `RATE_LIMIT_ERROR` | Too many requests | Wait or upgrade plan |
| `QUOTA_EXCEEDED` | Account quota reached | Check billing and usage |
| `NETWORK_ERROR` | Connection issues | Check internet and firewall |

## Monitoring and Prevention

### 1. Set Up Health Checks

```javascript
// Check system health
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('System health:', data))
```

### 2. Monitor Generation Status

```javascript
// Poll generation status
const pollStatus = async (generationId) => {
  const response = await fetch(`/api/generations/${generationId}`)
  const data = await response.json()
  
  if (data.generation.status === 'FAILED') {
    console.error('Generation failed:', data.generation.errorMessage)
  }
}
```

### 3. Implement Retry Logic

```javascript
const retryGeneration = async (params, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateImage(params)
      return result
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
}
```

## Production Considerations

### 1. Error Recovery

- Implement automatic credit refunds on failures
- Queue failed generations for retry
- Log all errors for analysis

### 2. Performance Optimization

- Use webhooks instead of polling
- Implement caching for model validation
- Batch multiple generations when possible

### 3. User Experience

- Show detailed error messages to users
- Provide retry buttons for failed generations
- Display estimated completion times

## Getting Help

1. **Check Logs:** Look at browser console and server logs first
2. **Run Tests:** Use the provided test script and debug endpoint
3. **Replicate Dashboard:** Check usage, quotas, and model status
4. **Community:** Replicate Discord or GitHub discussions

## Quick Fixes Checklist

- [ ] Replicate API token is valid and has permissions
- [ ] Model URL format is correct (username/model:version)
- [ ] Model status is 'READY' and accessible
- [ ] Parameters follow FLUX model requirements
- [ ] User has sufficient credits
- [ ] Database connection is working
- [ ] Webhook URL is HTTPS and accessible (production)
- [ ] No rate limiting issues on Replicate account