/**
 * Services Panel
 * 5 service breakdowns with pricing and CTAs
 */

import './ServicesPanel.css';

interface Service {
  id: string;
  name: string;
  tagline: string;
  outcomes: string[];
  deliverables: string[];
  pricing: {
    starting: string;
    note: string;
  };
  cta: {
    text: string;
    action: string;
  };
}

interface ServicesPanelProps {
  services: Service[];
  onAction: (action: string, serviceId?: string) => void;
}

export function ServicesPanel({ services, onAction }: ServicesPanelProps) {
  return (
    <div className="services-panel">
      <header className="services-header">
        <h1>Services — Systems that scale</h1>
        <p>We design and build productized services that fit into your growth funnel. Pick a path. We execute end-to-end.</p>
      </header>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <h2>{service.name}</h2>
              <p className="service-tagline">{service.tagline}</p>
            </div>

            <div className="service-section">
              <h3>Outcomes</h3>
              <ul>
                {service.outcomes.map((outcome, i) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </div>

            <div className="service-section">
              <h3>Deliverables</h3>
              <ul>
                {service.deliverables.map((deliverable, i) => (
                  <li key={i}>{deliverable}</li>
                ))}
              </ul>
            </div>

            <div className="service-pricing">
              <div className="price-starting">{service.pricing.starting}</div>
              <div className="price-note">{service.pricing.note}</div>
            </div>

            <button
              className="service-cta"
              onClick={() => onAction(service.cta.action, service.id)}
            >
              {service.cta.text}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
