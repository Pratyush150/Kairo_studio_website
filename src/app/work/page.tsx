import Link from 'next/link'
import { getAllCaseStudies } from '@/lib/case-studies'

export const metadata = {
  title: 'Case Studies — KAIRO STUDIO',
  description: 'See how we help businesses automate, scale, and grow.',
}

export default function WorkPage() {
  const caseStudies = getAllCaseStudies()

  return (
    <main className="min-h-screen bg-space-purple">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold text-gradient">
              KAIRO STUDIO
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-off-white hover:text-electric-cyan transition-colors">Services</Link>
              <Link href="/work" className="text-electric-cyan font-medium">Work</Link>
              <Link href="/about" className="text-off-white hover:text-electric-cyan transition-colors">About</Link>
              <Link href="/contact" className="btn btn-primary text-sm">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            Case <span className="text-gradient">Studies</span>
          </h1>
          <p className="text-xl md:text-2xl text-mid-gray">
            Real results for real businesses. See how we help companies automate, scale, and grow.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-12 px-6 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study) => (
              <Link
                key={study.id}
                href={`/work/${study.slug}`}
                className="group glass-card overflow-hidden hover:border-electric-cyan/50 hover:shadow-lg hover:shadow-electric-cyan/20 hover:-translate-y-2 transition-all duration-300"
              >
                {/* Services Tags */}
                <div className="p-6 pb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {study.services.map((service, idx) => (
                      <span key={idx} className="text-xs px-3 py-1 rounded-full bg-electric-cyan/10 text-electric-cyan">
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Client & Industry */}
                  <div className="text-sm text-mid-gray mb-3">
                    {study.client} • {study.industry}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-display font-bold mb-3 text-off-white group-hover:text-gradient transition-colors">
                    {study.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-mid-gray mb-6 text-sm">
                    {study.summary}
                  </p>

                  {/* Key Metric */}
                  {study.metrics[0] && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="text-2xl font-bold text-electric-cyan">
                        {study.metrics[0].value}
                      </div>
                      <div className="text-xs text-mid-gray">
                        {study.metrics[0].label}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-electric-cyan font-medium text-sm">Read Case Study</span>
                  <span className="text-electric-cyan group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-space-purple/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12 space-y-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Ready for <span className="text-gradient">similar results</span>?
            </h2>
            <p className="text-xl text-mid-gray">
              Let's discuss how we can help your business grow.
            </p>
            <Link href="/contact" className="btn btn-primary text-lg inline-block">
              Start a Project
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
