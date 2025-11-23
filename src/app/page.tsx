'use client'

import { useState } from 'react'
import Link from 'next/link'
import Hero3D from '@/components/layout/Hero3D'
import ContactForm from '@/components/ui/ContactForm'
import CalendlyModal from '@/components/ui/CalendlyModal'

export default function Home() {
  const [showContactForm, setShowContactForm] = useState(false)
  const [showCalendly, setShowCalendly] = useState(false)

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* 3D Background Scene */}
        <Hero3D />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center pointer-events-none">
          <div className="max-w-5xl mx-auto space-y-8 animate-in pointer-events-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm">
              <span className="w-2 h-2 bg-electric-cyan rounded-full animate-pulse" />
              <span>Welcome to the Automation Universe</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              <span className="text-gradient">KAIRO STUDIO</span>
              <br />
              <span className="text-off-white">Automations that move</span>
              <br />
              <span className="text-off-white">your business</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-mid-gray max-w-3xl mx-auto">
              We design marketing systems, AI products and automation stacks that scale revenue.
              Explore the Automation Universe.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button onClick={scrollToContact} className="btn btn-primary text-lg">
                Start the Orbit
              </button>
              <Link href="/work" className="btn btn-secondary text-lg">
                View Case Studies
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-electric-cyan">50+</div>
                <div className="text-sm text-mid-gray">Projects Delivered</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-electric-cyan">42%</div>
                <div className="text-sm text-mid-gray">Avg Cost Reduction</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-electric-cyan">120hrs</div>
                <div className="text-sm text-mid-gray">Avg Time Saved/Month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-mid-gray">Scroll to explore</span>
            <svg
              className="w-6 h-6 text-electric-cyan"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-24 px-6 bg-space-purple/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Explore the <span className="text-gradient">Universe</span>
            </h2>
            <p className="text-xl text-mid-gray">
              Each planet represents a service designed to scale your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Service Cards */}
            {[
              {
                title: 'Automation',
                slug: 'automation',
                tagline: 'Automate repetitive work, ship faster',
                icon: '⚙️',
                color: 'electric-cyan',
              },
              {
                title: 'Marketing',
                slug: 'marketing',
                tagline: 'Data-driven campaigns that convert',
                icon: '📈',
                color: 'neon-coral',
              },
              {
                title: 'SaaS & AI',
                slug: 'saas-ai',
                tagline: 'Ship AI features with production reliability',
                icon: '🤖',
                color: 'electric-cyan',
              },
              {
                title: 'Branding',
                slug: 'branding',
                tagline: 'Design that communicates trust',
                icon: '🎨',
                color: 'neon-coral',
              },
              {
                title: 'Strategy',
                slug: 'strategy',
                tagline: 'Roadmaps tied to metrics',
                icon: '🎯',
                color: 'electric-cyan',
              },
            ].map((service, index) => (
              <Link
                key={index}
                href={`/services/${service.slug}`}
                className="glass-card p-8 hover:border-electric-cyan/50 hover:shadow-lg hover:shadow-electric-cyan/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer group block"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 text-off-white">
                  {service.title}
                </h3>
                <p className="text-mid-gray">
                  {service.tagline}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services" className="btn btn-secondary">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 scroll-mt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Ready to <span className="text-gradient">automate your growth</span>?
            </h2>
            <p className="text-xl text-mid-gray">
              Tell us your challenge — we'll map it to a plan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <ContactForm source="landing-page" />

            {/* Quick Info Card */}
            <div className="space-y-6">
              {/* Schedule Card */}
              <div className="glass-card p-8 space-y-4">
                <div className="w-12 h-12 bg-electric-cyan/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-electric-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Prefer to talk first?</h3>
                  <p className="text-mid-gray mb-4">
                    Schedule a 30-minute discovery call to discuss your needs.
                  </p>
                  <button
                    onClick={() => setShowCalendly(true)}
                    className="btn btn-primary w-full"
                  >
                    Schedule a Call
                  </button>
                </div>
              </div>

              {/* Info Cards */}
              <div className="glass-card p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-electric-cyan flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">Fast Response</h4>
                    <p className="text-sm text-mid-gray">We'll reply within 2 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-electric-cyan flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">No Commitment</h4>
                    <p className="text-sm text-mid-gray">Free consultation, no strings attached</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-electric-cyan flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-1">Privacy First</h4>
                    <p className="text-sm text-mid-gray">Your data is secure and never shared</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendly Modal */}
      <CalendlyModal
        isOpen={showCalendly}
        onClose={() => setShowCalendly(false)}
      />
    </main>
  )
}
