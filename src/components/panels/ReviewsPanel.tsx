/**
 * Reviews Panel
 * Testimonials carousel with ratings
 */

import { useState } from 'react';
import './ReviewsPanel.css';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  rating: number;
  metric?: string;
  logo?: string;
}

interface ReviewsPanelProps {
  content: {
    headline: string;
    intro: string;
  };
  testimonials: Testimonial[];
}

export function ReviewsPanel({ content, testimonials }: ReviewsPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="reviews-panel">
      <header className="reviews-header">
        <h1>{content.headline}</h1>
        <p>{content.intro}</p>
      </header>

      <div className="testimonials-carousel">
        <button className="carousel-btn prev" onClick={handlePrev} aria-label="Previous testimonial">
          ←
        </button>

        <div className="testimonials-track">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`testimonial-card ${index === activeIndex ? 'active' : ''} ${
                index < activeIndex ? 'prev' : ''
              } ${index > activeIndex ? 'next' : ''}`}
            >
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < testimonial.rating ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>

              <blockquote className="testimonial-quote">
                <p>"{testimonial.quote}"</p>
              </blockquote>

              <div className="testimonial-author">
                {testimonial.avatar && (
                  <img src={testimonial.avatar} alt={testimonial.author} className="author-avatar" />
                )}
                <div className="author-info">
                  <div className="author-name">{testimonial.author}</div>
                  <div className="author-role">{testimonial.role}</div>
                  <div className="author-company">{testimonial.company}</div>
                </div>
              </div>

              {testimonial.metric && (
                <div className="testimonial-metric">{testimonial.metric}</div>
              )}

              {testimonial.logo && (
                <img src={testimonial.logo} alt={`${testimonial.company} logo`} className="company-logo" />
              )}
            </div>
          ))}
        </div>

        <button className="carousel-btn next" onClick={handleNext} aria-label="Next testimonial">
          →
        </button>
      </div>

      <div className="carousel-dots">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
