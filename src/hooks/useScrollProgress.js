import { useState, useEffect, useCallback } from 'react';

/**
 * useScrollProgress Hook
 * Tracks scroll position and provides normalized progress (0-1)
 *
 * @param {Object} options
 * @param {number} options.sections - Number of virtual sections (default: 4)
 * @param {boolean} options.enabled - Whether scrolling is enabled (default: true)
 * @returns {Object} Scroll state and utilities
 */
export function useScrollProgress({ sections = 4, enabled = true } = {}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  const handleScroll = useCallback(() => {
    if (!enabled) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - windowHeight;

    // Normalized scroll progress (0-1)
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    setScrollProgress(Math.min(Math.max(progress, 0), 1));

    // Current section (0 to sections-1)
    const section = Math.floor(progress * sections);
    setCurrentSection(Math.min(section, sections - 1));

    // Calculate scroll velocity
    const velocity = Math.abs(scrollY - (window.lastScrollY || 0));
    setScrollVelocity(velocity);
    window.lastScrollY = scrollY;
  }, [enabled, sections]);

  useEffect(() => {
    if (!enabled) return;

    // Initial calculation
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      delete window.lastScrollY;
    };
  }, [enabled, handleScroll]);

  // Utility functions
  const getProgressInSection = useCallback(() => {
    const sectionProgress = (scrollProgress * sections) % 1;
    return sectionProgress;
  }, [scrollProgress, sections]);

  const scrollToSection = useCallback((sectionIndex) => {
    const windowHeight = window.innerHeight;
    const targetScroll = (sectionIndex / sections) * (document.documentElement.scrollHeight - windowHeight);

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  }, [sections]);

  return {
    scrollProgress,        // 0-1 overall progress
    currentSection,        // 0 to (sections-1)
    scrollVelocity,        // Scroll speed
    getProgressInSection,  // Progress within current section (0-1)
    scrollToSection,       // Smooth scroll to section
    sections,              // Total number of sections
  };
}

export default useScrollProgress;
