import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllServices } from '@/lib/services'

export async function generateStaticParams() {
  const services = getAllServices()
  return services.map((service) => ({
    slug: service.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug)

  if (!service) {
    return {
      title: 'Service Not Found — KAIRO STUDIO',
    }
  }

  return {
    title: `${service.title} — KAIRO STUDIO`,
    description: service.description,
  }
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug)

  if (!service) {
    notFound()
  }

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
              <Link href="/about" className="text-off-white hover:text-electric-cyan transition-colors">About</Link>
              <Link href="/contact" className="btn btn-primary text-sm">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6 border-b border-white/10">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/services" className="text-mid-gray hover:text-electric-cyan transition-colors">
              ← Back to Services
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="text-7xl">{service.icon}</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
                {service.title}
              </h1>

              <p className="text-xl md:text-2xl text-mid-gray mb-8">
                {service.description}
              </p>

              <Link href="/contact" className="btn btn-primary text-lg">
                Start a Project
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 gap-6">
              {service.metrics.map((metric, idx) => (
                <div key={idx} className="glass-card p-6">
                  <div className="text-4xl font-bold text-electric-cyan mb-2">
                    {metric.value}
                  </div>
                  <div className="text-mid-gray">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-b border-white/10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">
            What We <span className="text-gradient">Deliver</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {service.features.map((feature, idx) => (
              <div key={idx} className="glass-card p-6 flex items-start gap-4">
                <span className="text-electric-cyan text-xl mt-1">→</span>
                <span className="text-lg text-off-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 px-6 border-b border-white/10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">
            Our <span className="text-gradient">Process</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.process.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Step number */}
                <div className="w-12 h-12 rounded-full bg-electric-cyan/10 border-2 border-electric-cyan flex items-center justify-center text-electric-cyan font-bold mb-4">
                  {idx + 1}
                </div>

                {/* Title */}
                <h3 className="text-xl font-display font-bold mb-3 text-off-white">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-mid-gray">
                  {step.description}
                </p>

                {/* Connector line */}
                {idx < service.process.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-electric-cyan/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 border-b border-white/10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">
            Why Choose <span className="text-gradient">This Service</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {service.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-electric-cyan flex-shrink-0 flex items-center justify-center mt-1">
                  <span className="text-space-purple text-sm">✓</span>
                </div>
                <span className="text-lg text-off-white">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12 space-y-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Ready to get <span className="text-gradient">started</span>?
            </h2>
            <p className="text-xl text-mid-gray">
              Let's discuss your {service.title.toLowerCase()} needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="btn btn-primary text-lg">
                Schedule a Call
              </Link>
              <Link href="/work" className="btn btn-secondary text-lg">
                View Case Studies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
