/**
 * About Panel
 * Origin morph content with animated counters
 */

import { useCounter } from '../../hooks/useCounter';
import './AboutPanel.css';

interface StatCounter {
  label: string;
  value: number;
  suffix?: string;
}

interface Pillar {
  title: string;
  description: string;
}

interface AboutContent {
  headline: string;
  lead: string;
  pillars: Pillar[];
  stats: StatCounter[];
  teamBio: string;
  cta: {
    primary: {
      text: string;
      action: string;
    };
    secondary: {
      text: string;
      action: string;
    };
  };
}

interface AboutPanelProps {
  content: AboutContent;
  onAction: (action: string) => void;
}

function StatCounter({ label, value, suffix = '' }: StatCounter) {
  const { formattedCount, ref } = useCounter({
    end: value,
    duration: 800,
    suffix,
    threshold: 0.6,
  });

  return (
    <div className="stat-counter" ref={ref}>
      <div className="stat-value">{formattedCount}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function AboutPanel({ content, onAction }: AboutPanelProps) {
  return (
    <div className="about-panel">
      {/* Header */}
      <header className="panel-header">
        <h1 className="panel-headline">{content.headline}</h1>
        <p className="panel-lead">{content.lead}</p>
      </header>

      {/* Three Pillars */}
      <section className="pillars-section">
        <h2 className="section-title">Our Approach</h2>
        <div className="pillars-grid">
          {content.pillars.map((pillar, index) => (
            <div key={index} className="pillar-card">
              <div className="pillar-number">0{index + 1}</div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-description">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {content.stats.map((stat, index) => (
            <StatCounter key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Team Bio */}
      <section className="team-section">
        <blockquote className="team-bio">
          <svg className="quote-icon" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
            <path d="M10 8c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8z"/>
          </svg>
          <p>{content.teamBio}</p>
        </blockquote>
      </section>

      {/* CTAs */}
      <section className="cta-section">
        <button
          className="cta-button cta-primary"
          onClick={() => onAction(content.cta.primary.action)}
        >
          {content.cta.primary.text}
        </button>
        <button
          className="cta-button cta-secondary"
          onClick={() => onAction(content.cta.secondary.action)}
        >
          {content.cta.secondary.text}
        </button>
      </section>
    </div>
  );
}
