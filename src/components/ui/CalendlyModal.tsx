'use client'

import { useEffect } from 'react'

interface CalendlyModalProps {
  isOpen: boolean
  onClose: () => void
  url?: string
}

export default function CalendlyModal({
  isOpen,
  onClose,
  url = 'https://calendly.com/kairo-studio',
}: CalendlyModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-space-purple rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-mid-gray/20 hover:bg-mid-gray/30 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-mid-gray/20">
          <h2 className="text-2xl font-bold">Schedule a Call</h2>
          <p className="text-mid-gray mt-2">Pick a time that works for you</p>
        </div>

        {/* Calendly iframe */}
        <div className="h-[600px] overflow-auto">
          <iframe
            src={`${url}?embed_domain=${typeof window !== 'undefined' ? window.location.hostname : ''}&embed_type=Inline`}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Schedule a meeting"
            className="bg-white"
          />
        </div>
      </div>
    </div>
  )
}
