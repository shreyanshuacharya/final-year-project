import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, customerName, customerPhone, customerEmail } = await request.json()

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Khalti expects amount in paisa (1 NPR = 100 paisa)
    const amountInPaisa = Math.round(amount * 100)

    const payload = {
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/callback`,
      website_url: process.env.NEXT_PUBLIC_SITE_URL,
      amount: amountInPaisa,
      purchase_order_id: orderId,
      purchase_order_name: `CafeFlow Order ${orderId.slice(0, 8)}`,
      customer_info: {
        name: customerName || 'Customer',
        email: customerEmail || 'customer@cafeflow.com',
        phone: customerPhone || '9800000000',
      },
    }

    const khaltiResponse = await fetch(`${process.env.KHALTI_BASE_URL}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const khaltiData = await khaltiResponse.json()

    if (!khaltiResponse.ok) {
      console.error('Khalti initiate failed:', khaltiData)
      return NextResponse.json({ error: 'Khalti initiation failed', details: khaltiData }, { status: 500 })
    }

    // Save pidx with the order so we can verify later
    await supabase
      .from('orders')
      .update({ payment_pidx: khaltiData.pidx, payment_method: 'khalti' })
      .eq('id', orderId)

    return NextResponse.json({
      payment_url: khaltiData.payment_url,
      pidx: khaltiData.pidx,
    })
  } catch (error: any) {
    console.error('Initiate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}