'use client'

import { Component, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-hero-gradient">
          <div className="max-w-md w-full text-center">
            <div className="glass-card p-8 space-y-6">
              <div className="w-16 h-16 mx-auto bg-neon-coral/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neon-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-mid-gray mb-4">
                  We're sorry, but something unexpected happened. Our team has been notified.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left mb-4">
                    <summary className="text-sm text-mid-gray cursor-pointer hover:text-electric-cyan">
                      Error details (development only)
                    </summary>
                    <pre className="mt-2 p-4 bg-space-purple/50 rounded text-xs overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="btn btn-secondary flex-1"
                >
                  Try Again
                </button>
                <Link href="/" className="btn btn-primary flex-1">
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
