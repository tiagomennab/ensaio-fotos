import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { asaas, handleAsaasError } from '@/lib/payments/asaas'
import crypto from 'crypto'

interface AsaasWebhookPayload {
  event: string
  payment?: {
    id: string
    customer: string
    value: number
    dueDate: string
    status: string
    billingType: string
    subscription?: string
    externalReference?: string
  }
  subscription?: {
    id: string
    customer: string
    status: string
  }
  dateCreated: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let webhookEvent: any = null

  try {
    // 1. Security validation
    const securityResult = await validateWebhookSecurity(request)
    if (!securityResult.isValid) {
      return NextResponse.json({ error: securityResult.error }, { status: securityResult.status })
    }

    const body: AsaasWebhookPayload = securityResult.body

    // 2. Create idempotency key
    const idempotencyKey = generateIdempotencyKey(body)

    // 3. Check for duplicate processing
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { idempotencyKey }
    })

    if (existingEvent?.processed) {
      console.log('Webhook already processed:', idempotencyKey)
      return NextResponse.json({ status: 'already_processed', eventId: existingEvent.id })
    }

    // 4. Create/update webhook event record
    webhookEvent = await prisma.webhookEvent.upsert({
      where: { idempotencyKey },
      create: {
        event: body.event,
        asaasPaymentId: body.payment?.id,
        asaasSubscriptionId: body.subscription?.id,
        asaasCustomerId: body.payment?.customer || body.subscription?.customer,
        idempotencyKey,
        rawPayload: body,
        processed: false,
        receivedAt: new Date()
      },
      update: {
        retryCount: { increment: 1 },
        lastRetryAt: new Date(),
        rawPayload: body
      }
    })

    // 5. Process the webhook
    const processingResult = await processWebhookEvent(body)

    // 6. Update webhook event status
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processed: processingResult.success,
        processedAt: processingResult.success ? new Date() : null,
        processingError: processingResult.error
      }
    })

    const processingTime = Date.now() - startTime
    console.log(`Webhook processed in ${processingTime}ms:`, {
      event: body.event,
      success: processingResult.success,
      paymentId: body.payment?.id,
      subscriptionId: body.subscription?.id
    })

    if (processingResult.success) {
      return NextResponse.json({ 
        status: 'processed', 
        eventId: webhookEvent.id,
        processingTime 
      })
    } else {
      return NextResponse.json(
        { 
          error: processingResult.error, 
          eventId: webhookEvent.id,
          retryable: processingResult.retryable 
        }, 
        { status: processingResult.retryable ? 422 : 400 }
      )
    }

  } catch (error: any) {
    console.error('Webhook processing failed:', error)

    // Log error to webhook event if it exists
    if (webhookEvent) {
      try {
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processed: false,
            processingError: error.message,
            retryCount: { increment: 1 },
            lastRetryAt: new Date()
          }
        })
      } catch (logError) {
        console.error('Failed to log webhook error:', logError)
      }
    }

    return NextResponse.json(
      { error: 'Internal webhook processing error' },
      { status: 500 }
    )
  }
}

async function validateWebhookSecurity(request: NextRequest): Promise<{
  isValid: boolean
  body?: AsaasWebhookPayload
  error?: string
  status?: number
}> {
  try {
    // Check for Asaas access token
    const asaasWebhookToken = process.env.ASAAS_WEBHOOK_TOKEN
    
    if (asaasWebhookToken) {
      const asaasAccessToken = request.headers.get('asaas-access-token')
      
      if (!asaasAccessToken || asaasAccessToken !== asaasWebhookToken) {
        return { isValid: false, error: 'Invalid access token', status: 401 }
      }
    } else {
      console.warn('ASAAS_WEBHOOK_TOKEN not configured - webhook not secured')
    }

    // Parse and validate body
    const body = await request.json()
    
    if (!body.event) {
      return { isValid: false, error: 'Missing event type', status: 400 }
    }

    // Additional validation for required fields
    if (!body.payment && !body.subscription) {
      return { isValid: false, error: 'Missing payment or subscription data', status: 400 }
    }

    return { isValid: true, body }

  } catch (error) {
    return { isValid: false, error: 'Invalid JSON payload', status: 400 }
  }
}

function generateIdempotencyKey(payload: AsaasWebhookPayload): string {
  // Create a unique key based on event type, payment/subscription ID, and timestamp
  const keyData = {
    event: payload.event,
    paymentId: payload.payment?.id,
    subscriptionId: payload.subscription?.id,
    dateCreated: payload.dateCreated
  }
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex')
}

async function processWebhookEvent(payload: AsaasWebhookPayload): Promise<{
  success: boolean
  error?: string
  retryable?: boolean
}> {
  try {
    switch (payload.event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        return await handlePaymentSuccess(payload.payment!)
        
      case 'PAYMENT_OVERDUE':
        return await handlePaymentOverdue(payload.payment!)
        
      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
        return await handlePaymentCancelled(payload.payment!)
        
      case 'SUBSCRIPTION_EXPIRED':
        return await handleSubscriptionExpired(payload.subscription!)
        
      case 'SUBSCRIPTION_CANCELLED':
        return await handleSubscriptionCancelled(payload.subscription!)
        
      case 'SUBSCRIPTION_REACTIVATED':
        return await handleSubscriptionReactivated(payload.subscription!)

      default:
        console.log('Unhandled webhook event:', payload.event)
        return { success: true } // Don't retry unknown events
    }
    
  } catch (error: any) {
    console.error(`Error processing ${payload.event}:`, error)
    
    // Determine if error is retryable
    const isRetryable = !error.message?.includes('not found') && 
                       !error.message?.includes('invalid') &&
                       !error.message?.includes('duplicate')
    
    return { 
      success: false, 
      error: error.message, 
      retryable: isRetryable 
    }
  }
}

async function handlePaymentSuccess(payment: AsaasWebhookPayload['payment']): Promise<{
  success: boolean
  error?: string
  retryable?: boolean
}> {
  if (!payment) {
    return { success: false, error: 'Missing payment data', retryable: false }
  }

  try {
    // Find user by Asaas customer ID
    const user = await prisma.user.findUnique({
      where: { asaasCustomerId: payment.customer },
      select: { 
        id: true, 
        plan: true, 
        subscriptionId: true,
        creditsBalance: true
      }
    })

    if (!user) {
      console.error('User not found for payment:', payment.id, 'customer:', payment.customer)
      return { success: false, error: 'User not found', retryable: false }
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        asaasPaymentId: payment.id,
        userId: user.id,
        type: payment.subscription ? 'SUBSCRIPTION' : 'CREDIT_PURCHASE',
        status: 'CONFIRMED',
        billingType: payment.billingType as any,
        value: payment.value,
        description: `Payment confirmed - ${payment.billingType}`,
        dueDate: new Date(payment.dueDate),
        confirmedDate: new Date(),
        subscriptionId: payment.subscription,
        externalReference: payment.externalReference
      }
    })

    // Update user subscription status if it's a subscription payment
    if (payment.subscription) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndsAt: null // Clear any previous end date
        }
      })

      // Update credits limit based on plan
      const creditsLimit = getPlanCreditsLimit(user.plan as any)
      await prisma.user.update({
        where: { id: user.id },
        data: { creditsLimit }
      })
    } else {
      // Handle credit purchase - extract credits from external reference or description
      const creditAmount = extractCreditAmount(payment.externalReference)
      if (creditAmount > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            creditsBalance: { increment: creditAmount }
          }
        })

        // Create credit purchase record
        await prisma.creditPurchase.create({
          data: {
            userId: user.id,
            asaasPaymentId: payment.id,
            packageName: `Pacote de ${creditAmount} créditos`,
            creditAmount,
            value: payment.value,
            status: 'CONFIRMED',
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            confirmedAt: new Date()
          }
        })
      }
    }

    // Log the payment confirmation
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        action: 'PAYMENT_CONFIRMED',
        creditsUsed: 0,
        details: {
          paymentId: payment.id,
          value: payment.value,
          billingType: payment.billingType,
          subscription: payment.subscription
        }
      }
    })

    console.log('Payment confirmed successfully:', payment.id)
    return { success: true }

  } catch (error: any) {
    console.error('Error handling payment success:', error)
    return { 
      success: false, 
      error: error.message, 
      retryable: !error.message?.includes('Unique constraint') 
    }
  }
}

async function handlePaymentOverdue(payment: AsaasWebhookPayload['payment']): Promise<{
  success: boolean
  error?: string
  retryable?: boolean
}> {
  if (!payment) {
    return { success: false, error: 'Missing payment data', retryable: false }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { asaasCustomerId: payment.customer },
      select: { id: true }
    })

    if (!user) {
      return { success: false, error: 'User not found', retryable: false }
    }

    // Update payment record
    await prisma.payment.upsert({
      where: { asaasPaymentId: payment.id },
      create: {
        asaasPaymentId: payment.id,
        userId: user.id,
        type: payment.subscription ? 'SUBSCRIPTION' : 'CREDIT_PURCHASE',
        status: 'OVERDUE',
        billingType: payment.billingType as any,
        value: payment.value,
        description: `Payment overdue - ${payment.billingType}`,
        dueDate: new Date(payment.dueDate),
        overdueDate: new Date(),
        subscriptionId: payment.subscription,
        externalReference: payment.externalReference
      },
      update: {
        status: 'OVERDUE',
        overdueDate: new Date()
      }
    })

    // Update user subscription status if it's a subscription payment
    if (payment.subscription) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'OVERDUE' }
      })
    }

    console.log('Payment marked as overdue:', payment.id)
    return { success: true }

  } catch (error: any) {
    console.error('Error handling payment overdue:', error)
    return { success: false, error: error.message, retryable: true }
  }
}

async function handlePaymentCancelled(payment: AsaasWebhookPayload['payment']): Promise<{
  success: boolean
  error?: string
  retryable?: boolean
}> {
  if (!payment) {
    return { success: false, error: 'Missing payment data', retryable: false }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { asaasCustomerId: payment.customer },
      select: { id: true }
    })

    if (!user) {
      return { success: false, error: 'User not found', retryable: false }
    }

    // Update payment status
    await prisma.payment.upsert({
      where: { asaasPaymentId: payment.id },
      create: {
        asaasPaymentId: payment.id,
        userId: user.id,
        type: payment.subscription ? 'SUBSCRIPTION' : 'CREDIT_PURCHASE',
        status: payment.status === 'REFUNDED' ? 'REFUNDED' : 'CANCELLED',
        billingType: payment.billingType as any,
        value: payment.value,
        description: `Payment ${payment.status.toLowerCase()} - ${payment.billingType}`,
        dueDate: new Date(payment.dueDate),
        subscriptionId: payment.subscription,
        externalReference: payment.externalReference
      },
      update: {
        status: payment.status === 'REFUNDED' ? 'REFUNDED' : 'CANCELLED'
      }
    })

    // Handle subscription cancellation
    if (payment.subscription) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'CANCELLED' }
      })
    }

    console.log('Payment cancelled/refunded:', payment.id)
    return { success: true }

  } catch (error: any) {
    console.error('Error handling payment cancellation:', error)
    return { success: false, error: error.message, retryable: true }
  }
}

async function handleSubscriptionExpired(subscription: AsaasWebhookPayload['subscription']): Promise<{
  success: boolean
  error?: string
  retryable?: boolean
}> {
  if (!subscription) {
    return { success: false, error: 'Missing subscription data', retryable: false }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { asaasCustomerId: subscription.customer },
      select: { id: true }
    })

    if (!user) {
      return { success: false, error: 'User not found', retryable: false }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'EXPIRED',
        subscriptionEndsAt: new Date(),
        plan: 'STARTER', // Downgrade to starter plan
        creditsLimit: 500 // Reset to starter plan limit
      }
    })

    console.log('Subscription expired:', subscription.id)
    return { success: true }

  } catch (error: any) {
    console.error('Error handling subscription expiration:', error)
    return { success: false, error: error.message, retryable: true }
  }
}

async function handleSubscriptionCancelled(subscription: AsaasWebhookPayload['subscription']): Promise<{
  success: boolean
  error?: string
  retryable?: boolean
}> {
  if (!subscription) {
    return { success: false, error: 'Missing subscription data', retryable: false }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { asaasCustomerId: subscription.customer },
      select: { id: true }
    })

    if (!user) {
      return { success: false, error: 'User not found', retryable: false }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'CANCELLED' }
    })

    console.log('Subscription cancelled:', subscription.id)
    return { success: true }

  } catch (error: any) {
    console.error('Error handling subscription cancellation:', error)
    return { success: false, error: error.message, retryable: true }
  }
}

async function handleSubscriptionReactivated(subscription: AsaasWebhookPayload['subscription']): Promise<{
  success: boolean
  error?: string
  retryable?: boolean
}> {
  if (!subscription) {
    return { success: false, error: 'Missing subscription data', retryable: false }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { asaasCustomerId: subscription.customer },
      select: { id: true, plan: true }
    })

    if (!user) {
      return { success: false, error: 'User not found', retryable: false }
    }

    // Update subscription status and restore credits limit
    const creditsLimit = getPlanCreditsLimit(user.plan as any)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionEndsAt: null,
        creditsLimit
      }
    })

    console.log('Subscription reactivated:', subscription.id)
    return { success: true }

  } catch (error: any) {
    console.error('Error handling subscription reactivation:', error)
    return { success: false, error: error.message, retryable: true }
  }
}

// Helper functions
function getPlanCreditsLimit(plan: 'STARTER' | 'PREMIUM' | 'GOLD'): number {
  switch (plan) {
    case 'STARTER': return 500
    case 'PREMIUM': return 1200
    case 'GOLD': return 2500
    default: return 10
  }
}

function extractCreditAmount(externalReference?: string): number {
  if (!externalReference) return 0
  
  // Extract credit amount from external reference like "credits-100" or "package-300"
  const match = externalReference.match(/(?:credits?|package)-(\d+)/i)
  return match ? parseInt(match[1]) : 0
}