import React from 'react';
import { getAnalytics } from '../utils/analytics';
import './ErrorBoundary.css';

/**
 * ErrorBoundary Component
 * Catches errors in child components and tracks them
 *
 * Features:
 * - Error tracking with analytics
 * - Fallback UI with recovery options
 * - Error details logging
 * - User-friendly error messages
 * - Retry functionality
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Track error with analytics
    const analytics = getAnalytics();
    analytics.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'unknown',
      errorCount: this.state.errorCount + 1,
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Error info:', errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-container">
            {/* Error Icon */}
            <div className="error-icon" aria-hidden="true">
              ⚠️
            </div>

            {/* Error Message */}
            <h1 className="error-title">
              {this.props.title || 'Something went wrong'}
            </h1>

            <p className="error-message">
              {this.props.message ||
                'An unexpected error occurred. We\'ve logged the details and our team has been notified.'}
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  <code>
                    {this.state.error.toString()}
                    {'\n\n'}
                    {this.state.errorInfo?.componentStack}
                  </code>
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="error-btn error-btn-primary"
                aria-label="Try again"
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="error-btn error-btn-secondary"
                aria-label="Reload page"
              >
                Reload Page
              </button>
            </div>

            {/* Help Text */}
            <p className="error-help">
              If this problem persists, please try refreshing the page or contact support.
            </p>

            {/* Error Count Warning */}
            {this.state.errorCount > 2 && (
              <div className="error-warning" role="status">
                <strong>Multiple errors detected.</strong> Please reload the page.
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
