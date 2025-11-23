'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  company: string | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }

        const data = await response.json()
        setUser(data.user)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-purple">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-cyan/20 border-t-electric-cyan rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mid-gray">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-space-purple">
      {/* Header */}
      <header className="border-b border-mid-gray/20 bg-space-purple/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-display font-bold">
                <span className="text-gradient">KAIRO STUDIO</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm hover:text-electric-cyan transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/projects" className="text-sm hover:text-electric-cyan transition-colors">
                  Projects
                </Link>
                <Link href="/dashboard/automations" className="text-sm hover:text-electric-cyan transition-colors">
                  Automations
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name || user?.email}</p>
                <p className="text-xs text-mid-gray">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm border border-mid-gray/20 hover:border-electric-cyan rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
