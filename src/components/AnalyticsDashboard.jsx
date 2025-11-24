import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../utils/analytics';
import './AnalyticsDashboard.css';

/**
 * AnalyticsDashboard Component
 * Simple dashboard to view analytics data in development
 *
 * Features:
 * - Real-time event log
 * - Session summary
 * - Event filtering
 * - Export functionality
 * - Toggle with 'A' key
 */
export default function AnalyticsDashboard({ visible = false }) {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(true);

  const analytics = getAnalytics();

  // Update events every 2 seconds
  useEffect(() => {
    if (!visible) return;

    const updateData = () => {
      const sessionData = analytics.getSessionSummary();
      setEvents(sessionData.events || []);
      setSummary(sessionData);
    };

    updateData();
    const interval = setInterval(updateData, 2000);

    return () => clearInterval(interval);
  }, [visible, analytics]);

  if (!visible) return null;

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.name.includes(filter));

  const eventTypes = [...new Set(events.map(e => e.name))];

  const handleExport = () => {
    const dataStr = JSON.stringify(summary, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Clear all analytics data?')) {
      analytics.clearSession();
      setEvents([]);
      setSummary(null);
    }
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <h3 className="analytics-title">Analytics Dashboard</h3>
        <div className="analytics-controls">
          <button
            onClick={() => setExpanded(!expanded)}
            className="analytics-btn"
            aria-label={expanded ? 'Collapse dashboard' : 'Expand dashboard'}
          >
            {expanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="analytics-content">
          {/* Summary */}
          {summary && (
            <div className="analytics-summary">
              <div className="summary-item">
                <span className="summary-label">Events:</span>
                <span className="summary-value">{summary.eventCount}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Session:</span>
                <span className="summary-value">
                  {Math.round(summary.sessionDuration / 1000)}s
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Engagement:</span>
                <span className="summary-value">
                  {Math.round(summary.totalEngagementTime / 1000)}s
                </span>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="analytics-filter">
            <label htmlFor="event-filter" className="filter-label">
              Filter:
            </label>
            <select
              id="event-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events ({events.length})</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type} ({events.filter(e => e.name === type).length})
                </option>
              ))}
            </select>
          </div>

          {/* Event Log */}
          <div className="analytics-events">
            <div className="events-header">
              <span>Recent Events ({filteredEvents.length})</span>
            </div>
            <div className="events-list">
              {filteredEvents.length === 0 ? (
                <div className="events-empty">No events yet</div>
              ) : (
                filteredEvents.slice(-20).reverse().map((event, idx) => (
                  <div key={idx} className="event-item">
                    <div className="event-name">{event.name}</div>
                    <div className="event-time">
                      {new Date(event.properties.timestamp).toLocaleTimeString()}
                    </div>
                    <details className="event-details">
                      <summary>Details</summary>
                      <pre className="event-properties">
                        {JSON.stringify(event.properties, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="analytics-actions">
            <button onClick={handleExport} className="analytics-btn-action">
              Export JSON
            </button>
            <button onClick={handleClear} className="analytics-btn-action analytics-btn-danger">
              Clear Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
