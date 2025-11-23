import Link from 'next/link'
import { getAllServices } from '@/lib/services'

export const metadata = {
  title: 'Services — KAIRO STUDIO',
  description: 'Explore our automation, marketing, SaaS, branding, and strategy services.',
}

export default function ServicesPage() {
  const services = getAllServices()

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
              <Link href="/services" className="text-electric-cyan font-medium">Services</Link>
              <Link href="/work" className="text-off-white hover:text-electric-cyan transition-colors">Work</Link>
              <Link href="/about" className="text-off-white hover:text-electric-cyan transition-colors">About</Link>
              <Link href="/contact" className="btn btn-primary text-sm">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm mb-6">
            <span className="w-2 h-2 bg-electric-cyan rounded-full animate-pulse" />
            <span>Our Services</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            Explore the <span className="text-gradient">Universe</span>
          </h1>

          <p className="text-xl md:text-2xl text-mid-gray max-w-2xl mx-auto">
            Each service designed to scale your business through automation, data, and intelligent systems.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 px-6 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group glass-card p-8 hover:border-electric-cyan/50 hover:shadow-lg hover:shadow-electric-cyan/20 hover:-translate-y-2 transition-all duration-300"
              >
                {/* Icon */}
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-display font-bold mb-3 text-off-white group-hover:text-gradient transition-colors">
                  {service.title}
                </h2>

                {/* Tagline */}
                <p className="text-mid-gray mb-4">
                  {service.tagline}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-mid-gray flex items-start gap-2">
                      <span className="text-electric-cyan mt-1">→</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-electric-cyan font-medium group-hover:gap-3 transition-all">
                  <span>Learn more</span>
                  <span className="text-xl">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-space-purple/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12 space-y-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Ready to <span className="text-gradient">start your project</span>?
            </h2>
            <p className="text-xl text-mid-gray">
              Tell us your challenge — we'll map it to a solution.
            </p>
            <Link href="/contact" className="btn btn-primary text-lg inline-block">
              Schedule a Call
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
