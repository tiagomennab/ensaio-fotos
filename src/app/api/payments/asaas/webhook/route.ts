import { NextRequest, NextResponse } from 'next/server'
import { asaas } from '@/lib/payments/asaas'
import { updateSubscriptionStatus, getUserByAsaasCustomerId, logUsage } from '@/lib/db/subscriptions'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Webhook security validation for Asaas
    let body: any
    const asaasWebhookToken = process.env.ASAAS_WEBHOOK_TOKEN
    
    if (asaasWebhookToken) {
      const asaasAccessToken = request.headers.get('asaas-access-token')
      
      if (!asaasAccessToken || asaasAccessToken !== asaasWebhookToken) {
        console.log('Asaas webhook: Invalid access token')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      body = await request.json()
    } else {
      console.warn('Asaas webhook: No ASAAS_WEBHOOK_TOKEN configured - webhook not secured')
      body = await request.json()
    }

    const { event, payment, subscription } = body

    console.log('Asaas Webhook received:', { 
      event, 
      payment: payment?.id, 
      subscription: subscription?.id,
      timestamp: new Date().toISOString()
    })

    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        await handlePaymentSuccess(payment)
        break

      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(payment)
        break

      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
        await handlePaymentCancelled(payment)
        break

      case 'SUBSCRIPTION_EXPIRED':
        await handleSubscriptionExpired(subscription)
        break

      case 'SUBSCRIPTION_CANCELLED':
        await handleSubscriptionCancelled(subscription)
        break

      case 'SUBSCRIPTION_REACTIVATED':
        await handleSubscriptionReactivated(subscription)
        break

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(payment: any) {
  try {
    // Find user by external reference or customer
    const user = await getUserByAsaasCustomerId(payment.customer)
    
    if (!user) {
      console.error('User not found for payment:', payment.id)
      return
    }

    // Update subscription status to active
    await updateSubscriptionStatus(user.id, 'ACTIVE')

    // Log the payment
    await logUsage({
      userId: user.id,
      action: 'PAYMENT_RECEIVED',
      creditsUsed: 0,
      details: {
        paymentId: payment.id,
        value: payment.value,
        dueDate: payment.dueDate
      }
    })

    console.log('Payment confirmed for user:', user.id)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentOverdue(payment: any) {
  try {
    const user = await getUserByAsaasCustomerId(payment.customer)
    
    if (!user) {
      console.error('User not found for overdue payment:', payment.id)
      return
    }

    // Update subscription status to overdue
    await updateSubscriptionStatus(user.id, 'OVERDUE')

    console.log('Payment overdue for user:', user.id)
  } catch (error) {
    console.error('Error handling payment overdue:', error)
  }
}

async function handlePaymentCancelled(payment: any) {
  try {
    const user = await getUserByAsaasCustomerId(payment.customer)
    
    if (!user) {
      console.error('User not found for cancelled payment:', payment.id)
      return
    }

    // Update subscription status to cancelled
    await updateSubscriptionStatus(user.id, 'CANCELLED')

    console.log('Payment cancelled for user:', user.id)
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

async function handleSubscriptionExpired(subscription: any) {
  try {
    // Get subscription details from Asaas
    const asaasSubscription = await asaas.getSubscription(subscription.id)
    const user = await getUserByAsaasCustomerId(asaasSubscription.customer)
    
    if (!user) {
      console.error('User not found for expired subscription:', subscription.id)
      return
    }

    await updateSubscriptionStatus(user.id, 'EXPIRED')

    console.log('Subscription expired for user:', user.id)
  } catch (error) {
    console.error('Error handling subscription expiration:', error)
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    const asaasSubscription = await asaas.getSubscription(subscription.id)
    const user = await getUserByAsaasCustomerId(asaasSubscription.customer)
    
    if (!user) {
      console.error('User not found for cancelled subscription:', subscription.id)
      return
    }

    await updateSubscriptionStatus(user.id, 'CANCELLED')

    console.log('Subscription cancelled for user:', user.id)
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

async function handleSubscriptionReactivated(subscription: any) {
  try {
    const asaasSubscription = await asaas.getSubscription(subscription.id)
    const user = await getUserByAsaasCustomerId(asaasSubscription.customer)
    
    if (!user) {
      console.error('User not found for reactivated subscription:', subscription.id)
      return
    }

    await updateSubscriptionStatus(user.id, 'ACTIVE')

    console.log('Subscription reactivated for user:', user.id)
  } catch (error) {
    console.error('Error handling subscription reactivation:', error)
  }
}