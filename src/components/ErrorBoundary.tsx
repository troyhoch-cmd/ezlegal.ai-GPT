import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '../lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: (err: Error, reset: () => void) => ReactNode;
  scope?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void logError(error, {
      category: 'render',
      severity: 'fatal',
      context: { componentStack: info.componentStack, scope: this.props.scope },
    });
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-[60vh] flex items-center justify-center p-6"
        style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-primary)' }}
      >
        <div className="max-w-md w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-md)] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong on this page</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            We logged the problem and the team is notified. You can try again, or head back to the home page.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-teal)] hover:bg-[var(--accent-teal-hover)] text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--surface-muted)] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
