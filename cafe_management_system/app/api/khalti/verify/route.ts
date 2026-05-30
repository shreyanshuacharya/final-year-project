import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { pidx } = await request.json()
    if (!pidx) return NextResponse.json({ error: 'Missing pidx' }, { status: 400 })

    const lookupResponse = await fetch(`${process.env.KHALTI_BASE_URL}/epayment/lookup/`, {
      method: 'POST',
      headers: {
        'Authorization': `key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    })

    const data = await lookupResponse.json()
    const supabase = await createClient()

    if (data.status === 'Completed') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_transaction_id: data.transaction_id,
        })
        .eq('payment_pidx', pidx)

      return NextResponse.json({ success: true, status: 'paid', data })
    } else {
      await supabase
        .from('orders')
        .update({ payment_status: data.status.toLowerCase() })
        .eq('payment_pidx', pidx)

      return NextResponse.json({ success: false, status: data.status, data })
    }
  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}