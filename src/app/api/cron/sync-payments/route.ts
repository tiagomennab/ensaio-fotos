import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/monitoring/logger'
import { AsaasClient } from '@/lib/payments/asaas'
import { prisma } from '@/lib/db'

// Payment sync cron job - runs every 30 minutes
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await logger.info('Starting payment sync job')

    const asaas = new AsaasClient()
    let syncResults = {
      payments_synced: 0,
      subscriptions_synced: 0,
      errors: 0
    }

    // Sync pending payments
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        updatedAt: {
          lt: new Date(Date.now() - 5 * 60 * 1000) // Only sync payments older than 5 minutes
        }
      },
      take: 100 // Limit to avoid timeout
    })

    for (const payment of pendingPayments) {
      try {
        if (payment.asaasPaymentId) {
          const asaasPayment = await asaas.getPayment(payment.asaasPaymentId)
          
          if (asaasPayment && asaasPayment.status !== payment.status) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: asaasPayment.status as any,
                updatedAt: new Date()
              }
            })

            // If payment was received, process it
            if (asaasPayment.status === 'RECEIVED' && payment.status !== 'RECEIVED') {
              await processPaymentReceived(payment)
            }

            syncResults.payments_synced++
          }
        }
      } catch (error) {
        await logger.error(`Failed to sync payment ${payment.id}`, error as Error)
        syncResults.errors++
      }
    }

    // Sync active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        updatedAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000) // Only sync subscriptions older than 1 hour
        }
      },
      take: 50
    })

    for (const subscription of activeSubscriptions) {
      try {
        if (subscription.asaasSubscriptionId) {
          const asaasSubscription = await asaas.getSubscription(subscription.asaasSubscriptionId)
          
          if (asaasSubscription && asaasSubscription.status !== subscription.status) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: asaasSubscription.status as any,
                updatedAt: new Date()
              }
            })

            // If subscription was cancelled, downgrade user
            if (asaasSubscription.status === 'INACTIVE') {
              await downgradeUser(subscription.userId)
            }

            syncResults.subscriptions_synced++
          }
        }
      } catch (error) {
        await logger.error(`Failed to sync subscription ${subscription.id}`, error as Error)
        syncResults.errors++
      }
    }

    await logger.info('Payment sync job completed', syncResults)

    return NextResponse.json({
      success: true,
      message: 'Payment sync completed',
      results: syncResults
    })

  } catch (error) {
    await logger.error('Payment sync job failed', error as Error)
    
    return NextResponse.json(
      { error: 'Payment sync failed' },
      { status: 500 }
    )
  }
}

async function processPaymentReceived(payment: any): Promise<void> {
  try {
    // Add credits to user account based on payment
    const creditsToAdd = calculateCreditsFromPayment(payment.amount, payment.plan)
    
    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        credits: {
          increment: creditsToAdd
        }
      }
    })

    // Create credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: payment.userId,
        type: 'CREDIT',
        amount: creditsToAdd,
        description: `Payment received - ${payment.plan} plan`,
        paymentId: payment.id
      }
    })

    // Update user plan if this is a subscription payment
    if (payment.type === 'SUBSCRIPTION') {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: payment.plan
        }
      })
    }

    await logger.info('Processed payment received', {
      paymentId: payment.id,
      userId: payment.userId,
      creditsAdded: creditsToAdd,
      plan: payment.plan
    })

  } catch (error) {
    await logger.error(`Failed to process payment received ${payment.id}`, error as Error)
    throw error
  }
}

async function downgradeUser(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'FREE'
      }
    })

    await logger.info('User downgraded to FREE plan', { userId })

  } catch (error) {
    await logger.error(`Failed to downgrade user ${userId}`, error as Error)
    throw error
  }
}

function calculateCreditsFromPayment(amount: number, plan: string): number {
  const creditRates = {
    'FREE': 0,
    'PREMIUM': 1000, // 1000 credits for premium
    'GOLD': 5000     // 5000 credits for gold
  }

  return creditRates[plan as keyof typeof creditRates] || 0
}