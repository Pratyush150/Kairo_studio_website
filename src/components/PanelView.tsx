/**
 * Panel View - Updated to consume content.json
 * Routes all panels dynamically based on morph type
 */

import { useEffect, useRef, useState } from 'react';
import { useSceneStore, sceneAPI } from '../lib/sceneAPI';
import { AboutPanel } from './panels/AboutPanel';
import { ServicesPanel } from './panels/ServicesPanel';
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

  const isVisible = sceneState === 'panel' && panelOpen && panelContent;

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
        },
      });
    }
  };

  const handleAction = (action: string, data?: any) => {
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
        if (data?.url) {
          window.open(data.url, '_blank');
        }
        break;
      default:
        console.log('Action:', action, data);
    }
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

    switch (panelContent) {
      case 'origin':
        return <AboutPanel content={morphData.content} onAction={handleAction} />;
      
      case 'services':
        return <ServicesPanel services={content.services} onAction={handleAction} />;
      
      case 'portal':
        return (
          <div className="panel-section">
            <h1 className="panel-headline">{morphData.content.headline}</h1>
            <p className="panel-lead">{morphData.content.lead}</p>
            <ContactForm />
          </div>
        );
      
      case 'network':
      case 'work':
      case 'demos':
      case 'strategy':
      case 'reviews':
      default:
        // Fallback for panels not yet implemented
        return (
          <div className="panel-section">
            <h1 className="panel-headline">{morphData.content.headline || morphData.name}</h1>
            <p className="panel-lead">{morphData.content.lead || morphData.content.intro || morphData.short}</p>
            <div className="panel-placeholder">
              <p>This panel is currently under development.</p>
              <p>Content loaded from content.json:</p>
              <pre>{JSON.stringify(morphData, null, 2)}</pre>
            </div>
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
