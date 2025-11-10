/**
 * Strategy Panel
 * 4-phase process and engagement models
 */

import './StrategyPanel.css';

interface Phase {
  name: string;
  duration: string;
  inputs?: string;
  outputs?: string;
  deliverables: string;
}

interface EngagementModel {
  name: string;
  description: string;
  bestFor: string;
}

interface StrategyPanelProps {
  content: {
    headline: string;
    lead: string;
    phases: Phase[];
    engagementModels: EngagementModel[];
    microcopy: string;
  };
}

export function StrategyPanel({ content }: StrategyPanelProps) {
  return (
    <div className="strategy-panel">
      <header className="strategy-header">
        <h1>{content.headline}</h1>
        <p>{content.lead}</p>
      </header>

      {/* Phases */}
      <section className="phases-section">
        <h2 className="section-title">Our Process</h2>
        <div className="phases-timeline">
          {content.phases.map((phase, index) => (
            <div key={index} className="phase-card">
              <div className="phase-number">{index + 1}</div>
              <div className="phase-content">
                <h3 className="phase-name">{phase.name}</h3>
                <div className="phase-duration">{phase.duration}</div>

                {phase.inputs && (
                  <div className="phase-detail">
                    <strong>Inputs:</strong> {phase.inputs}
                  </div>
                )}

                {phase.outputs && (
                  <div className="phase-detail">
                    <strong>Outputs:</strong> {phase.outputs}
                  </div>
                )}

                <div className="phase-detail">
                  <strong>Deliverables:</strong> {phase.deliverables}
                </div>
              </div>

              {index < content.phases.length - 1 && (
                <div className="phase-connector">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Engagement Models */}
      <section className="engagement-section">
        <h2 className="section-title">Engagement Models</h2>
        <div className="engagement-grid">
          {content.engagementModels.map((model, index) => (
            <div key={index} className="engagement-card">
              <h3 className="engagement-name">{model.name}</h3>
              <p className="engagement-description">{model.description}</p>
              <div className="engagement-bestfor">
                <strong>Best for:</strong> {model.bestFor}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Microcopy */}
      <section className="strategy-footer">
        <p className="strategy-microcopy">{content.microcopy}</p>
      </section>
    </div>
  );
}
