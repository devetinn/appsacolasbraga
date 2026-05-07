'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
}

const COLORS: Record<ToastType, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      role="alert"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${COLORS[type]} animate-in slide-in-from-bottom-4 duration-200`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}
