import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { asaas } from '@/lib/payments/asaas'
import { updateUserAsaasCustomerId } from '@/lib/db/subscriptions'

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
    const { name, email, cpfCnpj, phone, address } = body

    // Create customer in Asaas
    const customer = await asaas.createCustomer({
      name: name || session.user.name || '',
      email: email || session.user.email || '',
      cpfCnpj,
      phone,
      mobilePhone: phone,
      ...address
    })

    // Update user with Asaas customer ID
    await updateUserAsaasCustomerId(session.user.id, customer.id)

    return NextResponse.json({
      success: true,
      customer
    })

  } catch (error: any) {
    console.error('Error creating Asaas customer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    )
  }
}