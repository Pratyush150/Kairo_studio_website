import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCaseStudyBySlug, getAllCaseStudies } from '@/lib/case-studies'

export async function generateStaticParams() {
  const studies = getAllCaseStudies()
  return studies.map((study) => ({
    slug: study.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const study = getCaseStudyBySlug(params.slug)
  if (!study) {
    return { title: 'Case Study Not Found — KAIRO STUDIO' }
  }
  return {
    title: `${study.title} — KAIRO STUDIO`,
    description: study.summary,
  }
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const study = getCaseStudyBySlug(params.slug)
  if (!study) notFound()

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
              <Link href="/work" className="text-off-white hover:text-electric-cyan transition-colors">Work</Link>
              <Link href="/contact" className="btn btn-primary text-sm">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 border-b border-white/10">
        <div className="container mx-auto max-w-5xl">
          <Link href="/work" className="text-mid-gray hover:text-electric-cyan transition-colors mb-6 inline-block">
            ← Back to Case Studies
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {study.services.map((service, idx) => (
              <span key={idx} className="text-xs px-3 py-1 rounded-full bg-electric-cyan/10 text-electric-cyan">
                {service}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">{study.title}</h1>
          <p className="text-xl text-mid-gray mb-8">{study.client} • {study.industry}</p>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 px-6 bg-space-purple/50 border-b border-white/10">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-6">
            {study.metrics.map((metric, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-electric-cyan mb-2">{metric.value}</div>
                <div className="text-sm text-mid-gray mb-1">{metric.label}</div>
                <div className="text-xs text-neon-coral">{metric.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="py-16 px-6 border-b border-white/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-display font-bold mb-6">The <span className="text-gradient">Challenge</span></h2>
          <p className="text-lg text-off-white leading-relaxed">{study.challenge}</p>
        </div>
      </section>

      {/* Approach */}
      <section className="py-16 px-6 bg-space-purple/50 border-b border-white/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-display font-bold mb-8">Our <span className="text-gradient">Approach</span></h2>
          <div className="space-y-4">
            {study.approach.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-electric-cyan flex-shrink-0 flex items-center justify-center text-space-purple font-bold">
                  {idx + 1}
                </div>
                <p className="text-lg text-off-white pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 px-6 border-b border-white/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-display font-bold mb-8">The <span className="text-gradient">Results</span></h2>
          <div className="space-y-4">
            {study.results.map((result, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-electric-cyan flex-shrink-0 flex items-center justify-center mt-1">
                  <span className="text-space-purple text-sm">✓</span>
                </div>
                <p className="text-lg text-off-white">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {study.testimonial && (
        <section className="py-16 px-6 bg-space-purple/50">
          <div className="container mx-auto max-w-4xl">
            <div className="glass-card p-12">
              <div className="text-5xl text-electric-cyan mb-6">"</div>
              <p className="text-2xl text-off-white mb-8 leading-relaxed">{study.testimonial.quote}</p>
              <div className="border-t border-white/10 pt-6">
                <div className="font-bold text-off-white">{study.testimonial.author}</div>
                <div className="text-mid-gray">{study.testimonial.role}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12 space-y-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Want <span className="text-gradient">similar results</span>?
            </h2>
            <p className="text-xl text-mid-gray">Let's discuss your project and how we can help.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="btn btn-primary text-lg">Schedule a Call</Link>
              <Link href="/work" className="btn btn-secondary text-lg">More Case Studies</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
