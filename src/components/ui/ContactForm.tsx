'use client'

import { useState, FormEvent } from 'react'

interface ContactFormProps {
  source?: string
  onSuccess?: () => void
}

interface FormData {
  name: string
  email: string
  company: string
  challenge: string
}

interface FormErrors {
  name?: string
  email?: string
  company?: string
  challenge?: string
}

export default function ContactForm({ source = 'landing', onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    challenge: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }

    if (!formData.challenge.trim()) {
      newErrors.challenge = 'Please describe your challenge'
    } else if (formData.challenge.trim().length < 10) {
      newErrors.challenge = 'Please provide more detail (at least 10 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const data = await response.json()

      setSubmitStatus('success')
      setFormData({ name: '', email: '', company: '', challenge: '' })

      if (onSuccess) {
        onSuccess()
      }

      // Track conversion (optional analytics)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'lead_submit', {
          event_category: 'engagement',
          event_label: source,
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="glass-card p-8 text-center space-y-6 animate-in">
        <div className="w-16 h-16 mx-auto bg-electric-cyan/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">We'll be in touch soon</h3>
          <p className="text-mid-gray">
            Thanks for reaching out. We'll review your challenge and get back to you within 2 business days with a suggested approach.
          </p>
        </div>
        <a
          href="https://calendly.com/kairo-studio"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-electric-cyan text-space-purple font-semibold rounded-lg hover:bg-electric-cyan/90 transition-colors"
        >
          Or schedule a call now
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Start the Orbit</h3>
        <p className="text-mid-gray">Tell us your challenge — we'll map it to a plan.</p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-3 bg-space-purple/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.name
              ? 'border-neon-coral focus:ring-neon-coral'
              : 'border-mid-gray/20 focus:ring-electric-cyan'
          }`}
          placeholder="Jane Smith"
        />
        {errors.name && (
          <p className="text-sm text-neon-coral">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full px-4 py-3 bg-space-purple/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.email
              ? 'border-neon-coral focus:ring-neon-coral'
              : 'border-mid-gray/20 focus:ring-electric-cyan'
          }`}
          placeholder="jane@company.com"
        />
        {errors.email && (
          <p className="text-sm text-neon-coral">{errors.email}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <label htmlFor="company" className="block text-sm font-medium">
          Company *
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          className={`w-full px-4 py-3 bg-space-purple/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.company
              ? 'border-neon-coral focus:ring-neon-coral'
              : 'border-mid-gray/20 focus:ring-electric-cyan'
          }`}
          placeholder="Acme Inc"
        />
        {errors.company && (
          <p className="text-sm text-neon-coral">{errors.company}</p>
        )}
      </div>

      {/* Challenge */}
      <div className="space-y-2">
        <label htmlFor="challenge" className="block text-sm font-medium">
          Your Challenge *
        </label>
        <textarea
          id="challenge"
          value={formData.challenge}
          onChange={(e) => handleChange('challenge', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 bg-space-purple/50 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
            errors.challenge
              ? 'border-neon-coral focus:ring-neon-coral'
              : 'border-mid-gray/20 focus:ring-electric-cyan'
          }`}
          placeholder="We need to automate our lead qualification process and integrate it with our CRM..."
        />
        {errors.challenge && (
          <p className="text-sm text-neon-coral">{errors.challenge}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-electric-cyan text-space-purple font-semibold rounded-lg hover:bg-electric-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
      </button>

      {submitStatus === 'error' && (
        <div className="p-4 bg-neon-coral/10 border border-neon-coral rounded-lg">
          <p className="text-sm text-neon-coral">
            Something went wrong. Please try again or email us at contact@kairostudio.com
          </p>
        </div>
      )}

      <p className="text-xs text-mid-gray text-center">
        We'll respond within 2 business days. By submitting, you agree to our privacy policy.
      </p>
    </form>
  )
}
