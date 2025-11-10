import { useEffect, useRef } from 'react';
import { useSceneStore } from '../lib/sceneAPI';
import gsap from 'gsap';
import './Preloader.css';

export function Preloader() {
  const { sceneState, loadingProgress } = useSceneStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const isVisible = sceneState === 'loading' || sceneState === 'singularity';

  useEffect(() => {
    if (circleRef.current) {
      const circumference = 2 * Math.PI * 45; // radius = 45
      const offset = circumference - (loadingProgress / 100) * circumference;
      gsap.to(circleRef.current, {
        strokeDashoffset: offset,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [loadingProgress]);

  useEffect(() => {
    if (!isVisible && containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onStart: () => {
          if (containerRef.current) {
            containerRef.current.style.pointerEvents = 'none';
          }
        },
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
        },
      });
    }
  }, [isVisible]);

  // Don't render at all once loading is complete and fade out is done
  if (!isVisible && loadingProgress === 100) {
    return null;
  }

  return (
    <div ref={containerRef} className="preloader">
      <div className="preloader-content">
        {/* Rotating particle rings */}
        <div className="particle-ring ring-1" />
        <div className="particle-ring ring-2" />
        <div className="particle-ring ring-3" />

        {/* Logo circle */}
        <div className="logo-container">
          <svg width="120" height="120" className="progress-ring">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#A854FF" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="rgba(181, 195, 255, 0.1)"
              strokeWidth="2"
            />
            <circle
              ref={circleRef}
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45}`}
              transform="rotate(-90 60 60)"
              className="progress-circle"
            />
          </svg>

          {/* Kairo logo placeholder - will be replaced with actual SVG */}
          <div className="kairo-logo">
            <div className="logo-glow" />
            <span className="logo-text">K</span>
          </div>
        </div>

        {/* Loading text */}
        <div className="loading-text">
          <p className="initializing-text">Initializing Kairoverse...</p>
          <p className="progress-text" ref={progressRef}>
            {Math.round(loadingProgress)}%
          </p>
        </div>
      </div>

      {/* Background gradient */}
      <div className="preloader-bg" />
    </div>
  );
}
