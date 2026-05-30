'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const pidx = searchParams.get('pidx')
    const khaltiStatus = searchParams.get('status')

    if (!pidx) {
      setStatus('failed')
      setMessage('No payment information received.')
      return
    }

    if (khaltiStatus === 'User canceled') {
      setStatus('failed')
      setMessage('Payment was cancelled.')
      return
    }

    verifyPayment(pidx)
  }, [searchParams])

  const verifyPayment = async (pidx: string) => {
    try {
      const res = await fetch('/api/khalti/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pidx }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setMessage('Your payment has been confirmed. Your order is being prepared.')
      } else {
        setStatus('failed')
        setMessage(`Payment ${data.status?.toLowerCase() || 'failed'}. Please try again.`)
      }
    } catch (e) {
      setStatus('failed')
      setMessage('Failed to verify payment. Please contact staff.')
    }
  }

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900">Verifying payment...</h1>
          <p className="text-gray-500 text-sm mt-2">Please wait, do not close this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      status === 'success'
        ? 'bg-gradient-to-br from-green-50 to-emerald-100'
        : 'bg-gradient-to-br from-red-50 to-orange-100'
    }`}>
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'success' ? (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => router.push('/menu')}
          className={`w-full py-3 rounded-xl font-semibold text-white ${
            status === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Back to Menu
        </button>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"></div>}>
      <CallbackContent />
    </Suspense>
  )
}