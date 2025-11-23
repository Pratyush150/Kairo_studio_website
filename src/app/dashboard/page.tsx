'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  projectsCount: number
  automationsCount: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ projectsCount: 0, automationsCount: 0 })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setStats({
            projectsCount: data.user.projectsCount || 0,
            automationsCount: data.user.automationsCount || 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-mid-gray">
          Here's an overview of your automation universe.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-mid-gray mb-1">Projects</p>
              <p className="text-3xl font-bold text-electric-cyan">{stats.projectsCount}</p>
            </div>
            <div className="w-12 h-12 bg-electric-cyan/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/projects" className="text-sm text-electric-cyan hover:underline">
            View all →
          </Link>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-mid-gray mb-1">Automations</p>
              <p className="text-3xl font-bold text-electric-cyan">{stats.automationsCount}</p>
            </div>
            <div className="w-12 h-12 bg-electric-cyan/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/automations" className="text-sm text-electric-cyan hover:underline">
            View all →
          </Link>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-mid-gray mb-1">Account</p>
              <p className="text-lg font-semibold capitalize">{user?.role || 'Client'}</p>
            </div>
            <div className="w-12 h-12 bg-electric-cyan/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/profile" className="text-sm text-electric-cyan hover:underline">
            Edit profile →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="p-6 border border-mid-gray/20 hover:border-electric-cyan rounded-lg transition-colors text-left group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-electric-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-electric-cyan transition-colors">
                  Create New Project
                </h3>
                <p className="text-sm text-mid-gray">
                  Start a new automation or marketing project
                </p>
              </div>
            </div>
          </button>

          <button className="p-6 border border-mid-gray/20 hover:border-electric-cyan rounded-lg transition-colors text-left group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-neon-coral/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-neon-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-electric-cyan transition-colors">
                  Contact Support
                </h3>
                <p className="text-sm text-mid-gray">
                  Get help from our automation experts
                </p>
              </div>
            </div>
          </button>

          <Link href="/services" className="p-6 border border-mid-gray/20 hover:border-electric-cyan rounded-lg transition-colors text-left group block">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-electric-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-electric-cyan transition-colors">
                  Explore Services
                </h3>
                <p className="text-sm text-mid-gray">
                  Browse our automation and marketing services
                </p>
              </div>
            </div>
          </Link>

          <Link href="/work" className="p-6 border border-mid-gray/20 hover:border-electric-cyan rounded-lg transition-colors text-left group block">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-electric-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-electric-cyan transition-colors">
                  Case Studies
                </h3>
                <p className="text-sm text-mid-gray">
                  See how we've helped other businesses
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="glass-card p-8 bg-gradient-to-r from-electric-cyan/10 to-neon-coral/10 border-electric-cyan/30">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-electric-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Ready to automate your growth?</h2>
            <p className="text-mid-gray mb-4">
              Schedule a call with our team to discuss your automation needs and create a customized plan.
            </p>
            <a
              href="https://calendly.com/kairo-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-block"
            >
              Schedule a Call
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
