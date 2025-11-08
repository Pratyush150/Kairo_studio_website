import pool from '../config/database.js';

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding Kairo Studio database...');

    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE projects, services, demos, content_blocks RESTART IDENTITY CASCADE');

    // Seed Projects - Kairo Studio Case Studies
    await client.query(`
      INSERT INTO projects (slug, title, client_name, description, long_description, tags, results, featured, display_order)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9),
      ($10, $11, $12, $13, $14, $15, $16, $17, $18),
      ($19, $20, $21, $22, $23, $24, $25, $26, $27)
    `, [
      'vellapanti',
      'Vellapanti Digital Ecosystem',
      'Vellapanti',
      'End-to-end digital strategy for a youth-driven entertainment brand. We developed a scalable website, automated social scheduling, and integrated analytics dashboards for content reach tracking.',
      'Complete digital transformation for Vellapanti (vellapanti.co.in), a youth-entertainment brand. We built a scalable web platform, implemented automated social media scheduling systems, and created real-time analytics dashboards to track content performance across multiple channels. The project included custom automation workflows that reduced content publishing time by 60% while increasing engagement by 4x.',
      ['Automation', 'Web Dev', 'Social Growth System', 'Analytics'],
      JSON.stringify({
        engagement: '4x engagement within 3 months',
        efficiency: '60% faster content publishing cycle',
        traffic: '2.3x organic traffic growth'
      }),
      true,
      1,

      'saas-automation',
      'SaaS CRM Automation Suite',
      'SaaS Startup',
      'Developed a CRM automation and performance ad pipeline for a SaaS startup. Reduced ad CAC by 32% with automated retargeting and API-driven lead tracking.',
      'Built end-to-end automation infrastructure for a growing SaaS company including CRM workflow automation, performance advertising pipeline, and real-time lead tracking. Integrated HubSpot, Google Ads API, and custom React dashboards. Implementation of automated retargeting sequences and API-driven lead scoring reduced customer acquisition costs significantly while improving conversion rates across the funnel.',
      ['React', 'Node', 'Zapier', 'Google Ads API', 'HubSpot Integration'],
      JSON.stringify({
        conversion: '+45% MQL-to-SQL conversion rate',
        cac: '32% reduction in ad CAC',
        revenue: '+38% revenue in 2 quarters'
      }),
      true,
      2,

      'ecommerce-automation',
      'E-commerce Automation Suite',
      'D2C Brand',
      'Custom-built automation stack for D2C client — order notifications, abandoned cart recovery, and real-time ad optimization.',
      'Comprehensive automation ecosystem for direct-to-consumer e-commerce brand. Implemented intelligent order notification systems, sophisticated abandoned cart recovery workflows with personalized messaging, and real-time ad performance optimization. The system includes multi-channel integration (email, SMS, push notifications) with 99.9% uptime and successfully recovered 25% of potentially lost revenue through smart retargeting.',
      ['E-commerce Automation', 'Cart Recovery', 'Ad Optimization', 'Shopify'],
      JSON.stringify({
        recovery: 'Recovered 25% lost revenue',
        uptime: '99.9% uptime automation network',
        roi: '3.2x ROI on automation investment'
      }),
      true,
      3
    ]);

    // Seed Services - Kairo Studio 4-Phase Process
    await client.query(`
      INSERT INTO services (phase_number, title, description, features, display_order)
      VALUES
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10),
      ($11, $12, $13, $14, $15),
      ($16, $17, $18, $19, $20)
    `, [
      1,
      'Research & Strategy',
      'Market analysis + competitive insights. We dive deep into your business landscape to understand customer behavior and identify automation opportunities that drive measurable growth.',
      ['Market analysis + competitive insights', 'Customer behavior mapping', 'Automation feasibility analysis', 'KPI design for measurable growth'],
      1,

      2,
      'System Architecture',
      'Workflow automation diagrams and tech stack selection. We design the blueprint for your automation ecosystem, selecting the right tools and architecting scalable systems.',
      ['SaaS architecture design', 'Workflow automation diagrams', 'Stack selection (React, Next.js, Node, Zapier, HubSpot, etc.)', 'Campaign integration planning'],
      2,

      3,
      'Execution & Development',
      'SaaS + Web app development with CRM/marketing automation setup. We build conversion-optimized systems with performance tracking dashboards and seamless integrations.',
      ['SaaS + Web app development', 'CRM/marketing automation setup', 'Performance ad tracking + dashboards', 'Conversion-optimized design implementation'],
      3,

      4,
      'Optimization & Scale',
      'A/B testing, retargeting, SEO, and continuous improvement. We optimize every aspect of your system with custom dashboards and API integrations for sustained growth.',
      ['A/B testing, retargeting, SEO', 'Custom automation dashboards', 'API & third-party integrations', 'Continuous improvement sprints'],
      4
    ]);

    // Seed Demos - Kairo Studio Automation Showcases
    await client.query(`
      INSERT INTO demos (slug, title, description, tags, image_gradient, display_order)
      VALUES
      ($1, $2, $3, $4, $5, $6),
      ($7, $8, $9, $10, $11, $12),
      ($13, $14, $15, $16, $17, $18),
      ($19, $20, $21, $22, $23, $24)
    `, [
      'smart-commerce',
      'Smart Commerce Engine',
      'Automated Shopify + Ads + CRM setup with performance dashboard.',
      ['React', 'Next.js', 'Meta API', 'Zapier', 'GA4'],
      'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(255,107,0,0.1))',
      1,

      'campaign-tracker',
      'Campaign AI Tracker',
      'AI-based ad tracking visualization with live results.',
      ['Node.js', 'TensorFlow.js', 'API Automation'],
      'linear-gradient(135deg, rgba(255,107,0,0.2), rgba(0,204,255,0.1))',
      2,

      'saas-dashboard',
      'SaaS UI System',
      'Prebuilt SaaS dashboard template with role-based access.',
      ['TypeScript', 'React Query', 'Chart.js'],
      'linear-gradient(135deg, rgba(0,204,255,0.2), rgba(0,102,255,0.1))',
      3,

      'performance-monitor',
      'Performance Monitor',
      'Automated report generator for multi-channel marketing.',
      ['Python', 'Airtable', 'Notion API'],
      'linear-gradient(135deg, rgba(255,51,102,0.2), rgba(255,107,0,0.1))',
      4
    ]);

    // Seed Content Blocks - Kairo Studio Info
    await client.query(`
      INSERT INTO content_blocks (section, key, content)
      VALUES
      ($1, $2, $3),
      ($4, $5, $6),
      ($7, $8, $9),
      ($10, $11, $12),
      ($13, $14, $15),
      ($16, $17, $18)
    `, [
      'about',
      'stats',
      JSON.stringify({
        projects: '70+',
        retention: '98%',
        experience: '5+'
      }),

      'about',
      'testimonial1',
      JSON.stringify({
        quote: 'Kairo transformed our manual workflows into a fully automated marketing system — saving 40% of our operational time and doubling lead quality.',
        author: 'Growth Head, D2C Brand'
      }),

      'about',
      'testimonial2',
      JSON.stringify({
        quote: 'Our lead flow doubled after Kairo automated our campaigns.',
        author: 'Founder, Tech Startup'
      }),

      'about',
      'testimonial3',
      JSON.stringify({
        quote: 'They connected every part of our business — marketing, CRM, analytics — into one unified dashboard.',
        author: 'COO, SaaS Company'
      }),

      'contact',
      'info',
      JSON.stringify({
        email: 'support@kairostudio.in',
        phone: '+91 866-884-4178',
        hours: 'Mon-Fri, 9 AM-6 PM IST',
        instagram: '@kairo_studio_official',
        linkedin: 'Kairo Studio'
      }),

      'entry',
      'hero',
      JSON.stringify({
        title: 'Welcome to Kairo Studio',
        tagline: 'Where Strategy Meets Intelligent Automation',
        description: 'Step inside a next-generation digital experience. Kairo Studio isn\'t just a marketing agency — we\'re a technology-driven growth partner. We combine creative strategy, SaaS innovation, and automation engineering to build systems that scale brands effortlessly.'
      })
    ]);

    await client.query('COMMIT');
    console.log('✅ Kairo Studio database seeded successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
