import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-bg-dark px-6">
          <p
            className="font-mono text-danger"
            style={{ fontSize: '0.85rem', letterSpacing: '2px' }}
          >
            {'// runtime_error'}
          </p>
          <h1
            className="mt-4 font-heading text-text-primary"
            style={{ fontWeight: 800, fontSize: '1.5rem' }}
          >
            Something went wrong
          </h1>
          <p className="mt-2 font-body text-text-secondary" style={{ fontSize: '0.95rem' }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 font-heading cursor-pointer border-none uppercase text-bg-dark"
            style={{
              backgroundColor: '#00ff88',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '2px',
              padding: '12px 24px',
              borderRadius: 6,
            }}
          >
            Reload
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
