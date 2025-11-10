/**
 * Case Study Detail Modal
 * Full case study template with all sections
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CaseStudyDetail.css';

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  thumbnail: string;
  summary: string;
  problem: string;
  solution: string;
  approach: string[];
  tech: string[];
  metrics: Array<{
    label: string;
    before?: string;
    after?: string;
    change?: string;
    value?: string;
    description?: string;
    period?: string;
  }>;
  timeline: string;
  team: Array<{ role: string; count: number }>;
  testimonial?: {
    quote: string;
    author: string;
    company: string;
    avatar?: string;
  };
  learnings?: string;
  nextSteps?: string;
  assets?: {
    screenshots?: string[];
    video?: string;
    diagram?: string;
  };
  cta?: {
    text: string;
    action: string;
  };
}

interface CaseStudyDetailProps {
  caseStudy: CaseStudy;
  onClose: () => void;
  onAction: (action: string) => void;
}

export function CaseStudyDetail({ caseStudy, onClose, onAction }: CaseStudyDetailProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="case-study-modal-overlay" onClick={handleClose}>
      <div
        ref={modalRef}
        className="case-study-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close" onClick={handleClose} aria-label="Close case study">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="modal-content">
          {/* Hero */}
          <header className="case-hero">
            <div className="case-hero-meta">
              <span className="case-industry-tag">{caseStudy.industry}</span>
              <span className="case-timeline">{caseStudy.timeline}</span>
            </div>
            <h1 className="case-hero-title">{caseStudy.title}</h1>
            <p className="case-hero-summary">{caseStudy.summary}</p>

            {/* Key Metrics */}
            <div className="case-key-metrics">
              {caseStudy.metrics.slice(0, 3).map((metric, i) => (
                <div key={i} className="key-metric">
                  <div className="key-metric-value">
                    {metric.change || metric.value || metric.after}
                  </div>
                  <div className="key-metric-label">{metric.label}</div>
                </div>
              ))}
            </div>
          </header>

          {/* Screenshot/Visual */}
          {caseStudy.assets?.screenshots && caseStudy.assets.screenshots[0] && (
            <div className="case-visual">
              <img src={caseStudy.assets.screenshots[0]} alt={`${caseStudy.title} screenshot`} />
            </div>
          )}

          {/* Problem */}
          <section className="case-section">
            <h2 className="case-section-title">Challenge</h2>
            <p className="case-section-text">{caseStudy.problem}</p>
          </section>

          {/* Solution */}
          <section className="case-section">
            <h2 className="case-section-title">Solution</h2>
            <p className="case-section-text">{caseStudy.solution}</p>
          </section>

          {/* Approach */}
          <section className="case-section">
            <h2 className="case-section-title">Approach</h2>
            <ol className="case-approach-list">
              {caseStudy.approach.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>

          {/* Architecture Diagram */}
          {caseStudy.assets?.diagram && (
            <section className="case-section">
              <h2 className="case-section-title">Architecture</h2>
              <div className="case-diagram">
                <img src={caseStudy.assets.diagram} alt="System architecture" />
              </div>
            </section>
          )}

          {/* Results */}
          <section className="case-section case-results">
            <h2 className="case-section-title">Results</h2>
            <div className="results-grid">
              {caseStudy.metrics.map((metric, i) => (
                <div key={i} className="result-card">
                  <div className="result-label">{metric.label}</div>
                  {metric.before && metric.after && (
                    <div className="result-comparison">
                      <div className="result-before">
                        <span className="result-tag">Before</span>
                        <span className="result-value">{metric.before}</span>
                      </div>
                      <div className="result-arrow">→</div>
                      <div className="result-after">
                        <span className="result-tag">After</span>
                        <span className="result-value">{metric.after}</span>
                      </div>
                    </div>
                  )}
                  {metric.change && (
                    <div className="result-change">{metric.change}</div>
                  )}
                  {metric.period && (
                    <div className="result-period">{metric.period}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section className="case-section">
            <h2 className="case-section-title">Technology Stack</h2>
            <div className="tech-stack">
              {caseStudy.tech.map((tech, i) => (
                <span key={i} className="tech-badge">{tech}</span>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className="case-section">
            <h2 className="case-section-title">Team</h2>
            <div className="team-composition">
              {caseStudy.team.map((member, i) => (
                <div key={i} className="team-member">
                  <span className="team-count">{member.count}×</span>
                  <span className="team-role">{member.role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonial */}
          {caseStudy.testimonial && (
            <section className="case-section case-testimonial">
              <blockquote className="testimonial-quote">
                <svg className="quote-icon" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h8V14h-4c0-2.2 1.8-4 4-4V8z"/>
                </svg>
                <p>{caseStudy.testimonial.quote}</p>
                <footer>
                  <cite>
                    <strong>{caseStudy.testimonial.author}</strong>
                    <span>{caseStudy.testimonial.company}</span>
                  </cite>
                </footer>
              </blockquote>
            </section>
          )}

          {/* Learnings */}
          {caseStudy.learnings && (
            <section className="case-section">
              <h2 className="case-section-title">Key Learnings</h2>
              <p className="case-section-text">{caseStudy.learnings}</p>
            </section>
          )}

          {/* Next Steps */}
          {caseStudy.nextSteps && (
            <section className="case-section">
              <h2 className="case-section-title">Next Steps</h2>
              <p className="case-section-text">{caseStudy.nextSteps}</p>
            </section>
          )}

          {/* CTA */}
          {caseStudy.cta && (
            <section className="case-cta">
              <button
                className="case-cta-btn"
                onClick={() => onAction(caseStudy.cta!.action)}
              >
                {caseStudy.cta.text}
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
