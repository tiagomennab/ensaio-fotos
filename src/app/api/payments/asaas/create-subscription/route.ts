import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { asaas, getPlanPrice, getNextDueDate } from '@/lib/payments/asaas'
import { createSubscription } from '@/lib/db/subscriptions'
import { Plan } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      customerId, 
      plan, 
      cycle = 'MONTHLY',
      billingType = 'CREDIT_CARD',
      creditCard,
      creditCardHolderInfo 
    } = body

    if (!customerId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const planPrice = getPlanPrice(plan as 'PREMIUM' | 'GOLD', cycle)
    const nextDueDate = getNextDueDate(cycle)

    // Create subscription in Asaas
    const subscriptionData = {
      customer: customerId,
      billingType,
      value: planPrice,
      nextDueDate,
      cycle,
      description: `Plano ${plan} - Ensaio Fotos AI`,
      externalReference: `user_${session.user.id}_plan_${plan}`,
      ...(creditCard && { creditCard }),
      ...(creditCardHolderInfo && { creditCardHolderInfo })
    }

    const subscription = await asaas.createSubscription(subscriptionData)

    // Update user subscription in database
    const currentPeriodStart = new Date()
    const currentPeriodEnd = new Date(nextDueDate)

    await createSubscription({
      userId: session.user.id,
      asaasCustomerId: customerId,
      asaasSubscriptionId: subscription.id,
      plan: plan as Plan,
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        nextDueDate: subscription.nextDueDate,
        value: subscription.value,
        paymentLink: subscription.paymentLink || null
      }
    })

  } catch (error: any) {
    console.error('Error creating Asaas subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}