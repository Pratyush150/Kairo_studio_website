'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed')
        setIsLoading(false)
        return
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-hero-gradient">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Welcome to <span className="text-gradient">KAIRO STUDIO</span>
          </h1>
          <p className="text-mid-gray">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
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
          </div>

          {error && (
            <div className="p-4 bg-neon-coral/10 border border-neon-coral rounded-lg">
              <p className="text-sm text-neon-coral">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-mid-gray">
            Don't have an account?{' '}
            <Link href="/signup" className="text-electric-cyan hover:underline">
              Sign up
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
