/**
 * Work Panel
 * Case studies grid with modal detail view
 */

import { useState } from 'react';
import './WorkPanel.css';

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  featured: boolean;
  thumbnail: string;
  summary: string;
  metrics: Array<{
    label: string;
    before?: string;
    after?: string;
    change?: string;
    value?: string;
  }>;
}

interface WorkPanelProps {
  content: {
    headline: string;
    intro: string;
  };
  caseStudies: CaseStudy[];
  onViewCase: (caseId: string) => void;
}

export function WorkPanel({ content, caseStudies, onViewCase }: WorkPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const featuredCases = caseStudies.filter(c => c.featured);
  const otherCases = caseStudies.filter(c => !c.featured);

  return (
    <div className="work-panel">
      <header className="work-header">
        <h1>{content.headline}</h1>
        <p>{content.intro}</p>
      </header>

      {/* Featured Case Studies */}
      <section className="cases-section">
        <h2 className="section-title">Featured Projects</h2>
        <div className="cases-grid featured-grid">
          {featuredCases.map((caseStudy) => (
            <div
              key={caseStudy.id}
              className={`case-card featured ${hoveredCard === caseStudy.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(caseStudy.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onViewCase(caseStudy.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onViewCase(caseStudy.id)}
            >
              <div className="case-thumbnail">
                <img src={caseStudy.thumbnail} alt={caseStudy.title} />
                <div className="case-overlay">
                  <span className="view-case-btn">View Case Study →</span>
                </div>
              </div>
              <div className="case-content">
                <div className="case-meta">
                  <span className="case-industry">{caseStudy.industry}</span>
                  {caseStudy.featured && <span className="featured-badge">Featured</span>}
                </div>
                <h3 className="case-title">{caseStudy.title}</h3>
                <p className="case-summary">{caseStudy.summary}</p>
                <div className="case-metrics">
                  {caseStudy.metrics.slice(0, 2).map((metric, i) => (
                    <div key={i} className="metric">
                      <div className="metric-value">
                        {metric.change || metric.value || metric.after}
                      </div>
                      <div className="metric-label">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other Case Studies */}
      {otherCases.length > 0 && (
        <section className="cases-section">
          <h2 className="section-title">More Projects</h2>
          <div className="cases-grid standard-grid">
            {otherCases.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className={`case-card ${hoveredCard === caseStudy.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(caseStudy.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onViewCase(caseStudy.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onViewCase(caseStudy.id)}
              >
                <div className="case-thumbnail">
                  <img src={caseStudy.thumbnail} alt={caseStudy.title} />
                </div>
                <div className="case-content">
                  <span className="case-industry">{caseStudy.industry}</span>
                  <h3 className="case-title">{caseStudy.title}</h3>
                  <p className="case-summary">{caseStudy.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
