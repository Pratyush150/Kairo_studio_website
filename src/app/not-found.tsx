import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-hero-gradient">
      <div className="max-w-md w-full text-center">
        <div className="glass-card p-8 space-y-6 animate-in">
          <div className="w-20 h-20 mx-auto bg-electric-cyan/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-6xl font-display font-bold text-gradient mb-2">404</h1>
            <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
            <p className="text-mid-gray mb-6">
              The page you're looking for doesn't exist or has been moved to another orbit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="btn btn-primary flex-1">
              Go Home
            </Link>
            <Link href="/services" className="btn btn-secondary flex-1">
              View Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
