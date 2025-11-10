/**
 * Panel View - Complete with all panels
 * Routes all panels dynamically based on morph type
 */

import { useEffect, useRef, useState } from 'react';
import { useSceneStore, sceneAPI } from '../lib/sceneAPI';
import { AboutPanel } from './panels/AboutPanel';
import { ServicesPanel } from './panels/ServicesPanel';
import { WorkPanel } from './panels/WorkPanel';
import { CaseStudyDetail } from './panels/CaseStudyDetail';
import { DemosPanel } from './panels/DemosPanel';
import { ReviewsPanel } from './panels/ReviewsPanel';
import { StrategyPanel } from './panels/StrategyPanel';
import { ContactForm } from './ContactForm';
import gsap from 'gsap';
import './PanelView.css';

interface ContentData {
  site: any;
  morphs: any[];
  services: any[];
  caseStudies: any[];
  demos: any[];
  testimonials: any[];
}

export function PanelView() {
  const { sceneState, panelOpen, panelContent } = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const isVisible = sceneState === 'panel' && panelOpen && panelContent;

  // Debug logging
  useEffect(() => {
    console.log('[PanelView] State changed:', { sceneState, panelOpen, panelContent, isVisible });
  }, [sceneState, panelOpen, panelContent, isVisible]);

  // Load content.json
  useEffect(() => {
    fetch('/content.json')
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load content:', err);
        setLoading(false);
      });
  }, []);

  // Panel animations
  useEffect(() => {
    if (isVisible && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' }
      );

      const children = panelRef.current.querySelectorAll('.panel-section');
      gsap.fromTo(
        children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );

      const announcer = document.getElementById('a11y-announcer');
      if (announcer) {
        const morph = content?.morphs.find((m) => m.id === panelContent);
        if (morph) {
          announcer.textContent = `${morph.name} panel opened`;
        }
      }
    }
  }, [isVisible, panelContent, content]);

  const handleClose = () => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          sceneAPI.closePanel();
          setSelectedCase(null);
        },
      });
    }
  };

  const handleAction = (action: string, data?: any) => {
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        panel: panelContent,
        data: JSON.stringify(data),
      });
    }

    switch (action) {
      case 'openContact':
      case 'requestDemo':
        sceneAPI.openPanel('contact');
        break;
      case 'openDemos':
        sceneAPI.openPanel('demos');
        break;
      case 'openStrategy':
        sceneAPI.openPanel('strategy');
        break;
      case 'launchDemo':
        if (data?.demoUrl) {
          window.open(data.demoUrl, '_blank');
        }
        break;
      default:
        console.log('Action:', action, data);
    }
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCase(caseId);

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'case_view', { slug: caseId });
    }
  };

  const handleCloseCaseStudy = () => {
    setSelectedCase(null);
  };

  const renderPanelContent = () => {
    if (loading || !content) {
      return (
        <div className="panel-loading">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      );
    }

    const morphData = content.morphs.find((m) => m.id === panelContent);
    if (!morphData) return null;

    // Case Study Detail Modal
    if (selectedCase) {
      const caseStudy = content.caseStudies.find((c) => c.id === selectedCase);
      if (caseStudy) {
        return (
          <CaseStudyDetail
            caseStudy={caseStudy}
            onClose={handleCloseCaseStudy}
            onAction={handleAction}
          />
        );
      }
    }

    // Route based on panel content
    switch (panelContent) {
      case 'origin':
        return <AboutPanel content={morphData.content} onAction={handleAction} />;

      case 'work':
        return (
          <WorkPanel
            content={morphData.content}
            caseStudies={content.caseStudies}
            onViewCase={handleViewCase}
          />
        );

      case 'services':
        return <ServicesPanel services={content.services} onAction={handleAction} />;

      case 'demos':
        return (
          <DemosPanel
            content={morphData.content}
            demos={content.demos}
            onAction={handleAction}
          />
        );

      case 'reviews':
        return (
          <ReviewsPanel
            content={morphData.content}
            testimonials={content.testimonials}
          />
        );

      case 'strategy':
        return <StrategyPanel content={morphData.content} />;

      case 'portal':
        return (
          <div className="panel-section">
            <h1 className="panel-headline">{morphData.content.headline}</h1>
            <p className="panel-lead">{morphData.content.lead}</p>
            <ContactForm />
          </div>
        );

      case 'network':
        // Fallback for Collaborate panel
        return (
          <div className="panel-section">
            <h1 className="panel-headline">{morphData.content.headline}</h1>
            <p className="panel-lead">{morphData.content.lead}</p>
            {morphData.content.features && (
              <ul className="panel-list">
                {morphData.content.features.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            )}
            <button className="cta-button cta-primary" onClick={() => handleAction('openContact')}>
              Get in Touch
            </button>
          </div>
        );

      default:
        // Generic fallback
        return (
          <div className="panel-section">
            <h1 className="panel-headline">{morphData.name}</h1>
            <p className="panel-lead">{morphData.short}</p>
            <button className="cta-button cta-primary" onClick={() => handleAction('openContact')}>
              Get in Touch
            </button>
          </div>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="panel-overlay">
      <div ref={panelRef} className="panel">
        <button className="panel-close" onClick={handleClose} aria-label="Close panel">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="panel-content-wrapper">
          {renderPanelContent()}
        </div>
      </div>
    </div>
  );
}
