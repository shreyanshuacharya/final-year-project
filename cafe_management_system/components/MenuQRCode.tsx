'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

export default function MenuQRCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [menuUrl, setMenuUrl] = useState('')

  useEffect(() => {
    // Get the menu URL (use your actual deployed URL in production)
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/menu`
      : 'https://yoursite.com/menu'
    
    setMenuUrl(url)

    // Generate QR code
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
    }
  }, [])

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'cafeflow-menu-qr.png'
      link.href = url
      link.click()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu QR Code</h2>
      <p className="text-gray-600 mb-6">
        Customers can scan this QR code to access the menu and place orders from their phones.
      </p>

      {/* QR Code Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-white p-6 rounded-xl border-4 border-gray-200 shadow-lg">
          <canvas ref={canvasRef} />
        </div>

        {/* Menu URL */}
        <div className="w-full bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Menu URL:</p>
          <p className="text-sm font-mono text-gray-700 break-all">{menuUrl}</p>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadQRCode}
          className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download QR Code</span>
        </button>

        {/* Instructions */}
        <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Download and print the QR code</li>
            <li>Place it on tables or at the counter</li>
            <li>Customers scan with their phone camera</li>
            <li>They can browse menu and order instantly</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
