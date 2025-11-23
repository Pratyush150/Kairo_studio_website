'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsLoading(true)

    // Client-side validation
    const newErrors: string[] = []

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match')
    }

    if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          company: formData.company,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors(data.errors || [data.message])
        setIsLoading(false)
        return
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setErrors(['An error occurred. Please try again.'])
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-hero-gradient">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Join <span className="text-gradient">KAIRO STUDIO</span>
          </h1>
          <p className="text-mid-gray">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-space-purple/50 border border-mid-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-cyan"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-space-purple/50 border border-mid-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-cyan"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium">
              Company (Optional)
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-3 bg-space-purple/50 border border-mid-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-cyan"
              placeholder="Acme Inc"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-space-purple/50 border border-mid-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-cyan"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-mid-gray">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-space-purple/50 border border-mid-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-cyan"
              placeholder="••••••••"
              required
            />
          </div>

          {errors.length > 0 && (
            <div className="p-4 bg-neon-coral/10 border border-neon-coral rounded-lg">
              <ul className="text-sm text-neon-coral list-disc list-inside">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-mid-gray">
            Already have an account?{' '}
            <Link href="/login" className="text-electric-cyan hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-sm text-mid-gray">
            <Link href="/" className="hover:text-electric-cyan">
              ← Back to home
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
