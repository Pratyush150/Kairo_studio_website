export interface Service {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  color: string
  icon: string
  features: string[]
  benefits: string[]
  process: {
    title: string
    description: string
  }[]
  metrics: {
    label: string
    value: string
  }[]
}

export const services: Service[] = [
  {
    id: 'automation',
    slug: 'automation',
    title: 'Automation Solutions',
    tagline: 'Automate repetitive work, ship faster',
    description: 'Build reliable workflows that reduce manual hours and increase throughput. We design automation systems that handle repetitive tasks reliably, freeing your team for high-value work.',
    color: '#00E5FF',
    icon: '⚙️',
    features: [
      'Workflow automation & orchestration',
      'API integration & data pipelines',
      'Process optimization & monitoring',
      'Custom automation tools',
      'Zapier/Make advanced flows',
      'Internal tool development'
    ],
    benefits: [
      'Reduce operational costs by 40-60%',
      'Eliminate manual data entry',
      'Increase processing speed by 10x',
      'Reduce human error to near-zero',
      'Scale operations without scaling headcount'
    ],
    process: [
      {
        title: 'Audit',
        description: 'We map your current workflows and identify automation opportunities with the highest ROI.'
      },
      {
        title: 'Design',
        description: 'We design automated systems that integrate seamlessly with your existing tools and processes.'
      },
      {
        title: 'Build',
        description: 'We build and deploy automation workflows with monitoring, error handling, and logging.'
      },
      {
        title: 'Optimize',
        description: 'We continuously monitor and optimize your automations for maximum efficiency and reliability.'
      }
    ],
    metrics: [
      { label: 'Avg Time Saved', value: '120hrs/month' },
      { label: 'Cost Reduction', value: '42%' },
      { label: 'Error Rate', value: '<0.1%' }
    ]
  },
  {
    id: 'marketing',
    slug: 'marketing',
    title: 'Marketing Systems',
    tagline: 'Data-driven campaigns that convert',
    description: 'From creative to paid, we run growth like engineering. Build marketing systems that scale revenue predictably.',
    color: '#FF6B6B',
    icon: '📈',
    features: [
      'Performance marketing (Google, Meta, LinkedIn)',
      'Marketing automation & CRM',
      'Analytics & attribution modeling',
      'Landing page optimization',
      'Email & SMS campaigns',
      'Content & SEO strategy'
    ],
    benefits: [
      'Lower customer acquisition cost',
      'Increase conversion rates by 2-3x',
      'Full attribution visibility',
      'Predictable, scalable growth',
      'Data-driven decision making'
    ],
    process: [
      {
        title: 'Audit',
        description: 'We analyze your current marketing performance and identify growth opportunities.'
      },
      {
        title: 'Strategy',
        description: 'We design a data-driven marketing strategy with clear KPIs and attribution.'
      },
      {
        title: 'Execute',
        description: 'We launch and manage campaigns across channels with continuous optimization.'
      },
      {
        title: 'Scale',
        description: 'We scale winning campaigns and double down on what works.'
      }
    ],
    metrics: [
      { label: 'Avg CAC Reduction', value: '35%' },
      { label: 'Conversion Lift', value: '2.5x' },
      { label: 'ROAS', value: '4.2x' }
    ]
  },
  {
    id: 'saas',
    slug: 'saas-ai',
    title: 'SaaS & AI Products',
    tagline: 'Ship AI features with production reliability',
    description: 'Build and ship AI-enabled features and SaaS products that users love. From MVP to scale.',
    color: '#00E5FF',
    icon: '🤖',
    features: [
      'AI/ML feature development',
      'SaaS product development',
      'API & backend architecture',
      'Frontend web apps (React, Next.js)',
      'Mobile apps (React Native)',
      'Database design & optimization'
    ],
    benefits: [
      'Ship features 3x faster',
      'Production-ready code',
      'Scalable architecture',
      'AI/ML expertise',
      'Full-stack capabilities'
    ],
    process: [
      {
        title: 'Discovery',
        description: 'We understand your product vision, users, and technical requirements.'
      },
      {
        title: 'Architecture',
        description: 'We design scalable systems with clean APIs and maintainable code.'
      },
      {
        title: 'Build',
        description: 'We ship features iteratively with continuous testing and deployment.'
      },
      {
        title: 'Scale',
        description: 'We optimize for performance, reliability, and cost as you grow.'
      }
    ],
    metrics: [
      { label: 'Ship Speed', value: '3x faster' },
      { label: 'Uptime', value: '99.9%' },
      { label: 'User Satisfaction', value: '4.8/5' }
    ]
  },
  {
    id: 'branding',
    slug: 'branding',
    title: 'Brand Design',
    tagline: 'Design that communicates trust, instantly',
    description: 'Visual identity systems that differentiate and build trust. From logo to full brand systems.',
    color: '#FF6B6B',
    icon: '🎨',
    features: [
      'Visual identity & logo design',
      'Brand guidelines & systems',
      'Website & UI design',
      'Marketing collateral',
      'Presentation decks',
      'Social media assets'
    ],
    benefits: [
      'Stand out from competitors',
      'Build instant credibility',
      'Increase conversion rates',
      'Consistent brand experience',
      'Professional appearance'
    ],
    process: [
      {
        title: 'Research',
        description: 'We understand your brand positioning, audience, and competitive landscape.'
      },
      {
        title: 'Concept',
        description: 'We develop visual concepts that align with your brand strategy.'
      },
      {
        title: 'Design',
        description: 'We create comprehensive brand assets and guidelines.'
      },
      {
        title: 'Deliver',
        description: 'We deliver all assets in production-ready formats with documentation.'
      }
    ],
    metrics: [
      { label: 'Brand Recall', value: '+65%' },
      { label: 'Trust Score', value: '+40%' },
      { label: 'Conversion Lift', value: '+25%' }
    ]
  },
  {
    id: 'strategy',
    slug: 'strategy',
    title: 'Strategic Consulting',
    tagline: 'Roadmaps tied to metrics',
    description: 'Operational strategy and execution roadmaps that deliver measurable results.',
    color: '#00E5FF',
    icon: '🎯',
    features: [
      'Business strategy & planning',
      'Operational efficiency audits',
      'Technology roadmaps',
      'Go-to-market strategy',
      'Metrics & KPI frameworks',
      'Process documentation'
    ],
    benefits: [
      'Clear execution roadmap',
      'Data-driven decisions',
      'Aligned team & stakeholders',
      'Measurable outcomes',
      'Reduced operational friction'
    ],
    process: [
      {
        title: 'Assess',
        description: 'We audit your current operations, technology, and market position.'
      },
      {
        title: 'Strategize',
        description: 'We develop strategic recommendations with clear priorities and timelines.'
      },
      {
        title: 'Plan',
        description: 'We create detailed execution roadmaps with milestones and success metrics.'
      },
      {
        title: 'Support',
        description: 'We support execution and adjust strategy based on results.'
      }
    ],
    metrics: [
      { label: 'Execution Speed', value: '+50%' },
      { label: 'Cost Efficiency', value: '+35%' },
      { label: 'Goal Achievement', value: '92%' }
    ]
  }
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(service => service.slug === slug)
}

export function getAllServices(): Service[] {
  return services
}
