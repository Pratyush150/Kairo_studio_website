export interface CaseStudy {
  id: string
  slug: string
  title: string
  client: string
  industry: string
  summary: string
  heroImage: string
  services: string[]
  challenge: string
  approach: string[]
  results: string[]
  metrics: {
    label: string
    value: string
    change: string
  }[]
  testimonial?: {
    quote: string
    author: string
    role: string
  }
  featured: boolean
}

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'acme-automation',
    title: 'Automating Lead Processing for 3x Growth',
    client: 'Acme Corp',
    industry: 'B2B SaaS',
    summary: 'How we cut lead processing time by 85% and reduced cost per lead by 42%',
    heroImage: '/images/case-studies/acme.jpg',
    services: ['Automation', 'Marketing'],
    challenge: 'Acme Corp was spending 120+ hours per month manually processing leads from multiple sources. Their sales team was overwhelmed with data entry, qualification, and routing tasks, leading to slow response times and lost opportunities.',
    approach: [
      'Audited their entire lead workflow across 8 different sources',
      'Built automated lead capture and enrichment system',
      'Implemented intelligent lead scoring and routing',
      'Created real-time dashboards for sales team visibility',
      'Integrated with their CRM and marketing automation platform'
    ],
    results: [
      'Reduced manual processing time from 120hrs/month to 18hrs/month',
      'Lead response time improved from 4 hours to 5 minutes',
      'Cost per lead decreased by 42%',
      'Sales team productivity increased by 3x',
      'Lead-to-opportunity conversion rate increased from 12% to 28%'
    ],
    metrics: [
      { label: 'Time Saved', value: '102hrs/month', change: '+85%' },
      { label: 'Cost Reduction', value: '$12K/month', change: '-42%' },
      { label: 'Response Time', value: '5 minutes', change: '-95%' },
      { label: 'Conversion Rate', value: '28%', change: '+133%' }
    ],
    testimonial: {
      quote: 'KAIRO transformed our lead process completely. What used to take days now happens in minutes, and our sales team can focus on actually selling instead of data entry.',
      author: 'Sarah Chen',
      role: 'VP of Sales, Acme Corp'
    },
    featured: true
  },
  {
    id: '2',
    slug: 'techstart-marketing',
    title: 'Scaling Paid Marketing from $50K to $500K/mo',
    client: 'TechStart',
    industry: 'E-commerce',
    summary: 'Data-driven marketing system that achieved 4.2x ROAS at scale',
    heroImage: '/images/case-studies/techstart.jpg',
    services: ['Marketing', 'Strategy'],
    challenge: 'TechStart wanted to scale their paid marketing beyond $50K/month but was hitting performance walls. Their CAC was increasing, ROAS was declining, and they lacked clear attribution.',
    approach: [
      'Implemented comprehensive attribution modeling',
      'Rebuilt campaign structure for better performance',
      'Created automated bidding strategies',
      'Developed creative testing framework',
      'Built real-time dashboards for decision making'
    ],
    results: [
      'Scaled monthly spend from $50K to $500K while maintaining profitability',
      'Improved ROAS from 2.8x to 4.2x',
      'Reduced CAC by 35% despite increased spend',
      'Increased customer LTV by 60% through better targeting',
      'Achieved full attribution visibility across all channels'
    ],
    metrics: [
      { label: 'Monthly Spend', value: '$500K', change: '+900%' },
      { label: 'ROAS', value: '4.2x', change: '+50%' },
      { label: 'CAC Reduction', value: '$45', change: '-35%' },
      { label: 'Revenue Growth', value: '+320%', change: 'YoY' }
    ],
    testimonial: {
      quote: 'The level of sophistication KAIRO brought to our marketing was game-changing. We finally have confidence in our numbers and can scale profitably.',
      author: 'Mike Rodriguez',
      role: 'CEO, TechStart'
    },
    featured: true
  },
  {
    id: '3',
    slug: 'proptech-saas',
    title: 'Building an AI-Powered Property Analytics Platform',
    client: 'PropTech Solutions',
    industry: 'Real Estate Tech',
    summary: 'From concept to $200K ARR in 6 months with AI features',
    heroImage: '/images/case-studies/proptech.jpg',
    services: ['SaaS & AI', 'Branding'],
    challenge: 'PropTech had a vision for an AI-powered property analytics platform but no technical team. They needed to ship an MVP quickly to validate the market and secure funding.',
    approach: [
      'Conducted product discovery and market research',
      'Designed scalable cloud architecture',
      'Built AI models for property valuation and insights',
      'Developed full-stack web application',
      'Created brand identity and marketing site',
      'Implemented payment and subscription system'
    ],
    results: [
      'Shipped MVP in 12 weeks (vs 6 months typical)',
      'Achieved product-market fit with 4.8/5 user rating',
      'Reached $200K ARR within 6 months of launch',
      'Secured $2M seed funding',
      '99.9% uptime and sub-200ms API response times'
    ],
    metrics: [
      { label: 'Time to Market', value: '12 weeks', change: '-50%' },
      { label: 'ARR', value: '$200K', change: '6 months' },
      { label: 'User Rating', value: '4.8/5', change: '200+ reviews' },
      { label: 'Uptime', value: '99.9%', change: 'SLA met' }
    ],
    testimonial: {
      quote: 'KAIRO didn\'t just build our product—they helped us validate our entire business model. The quality and speed were beyond our expectations.',
      author: 'David Park',
      role: 'Founder, PropTech Solutions'
    },
    featured: true
  }
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(study => study.slug === slug)
}

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return caseStudies.filter(study => study.featured)
}
