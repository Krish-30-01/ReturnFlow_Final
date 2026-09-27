import React from 'react';

interface Props { children: React.ReactNode; onNavigateHome: () => void; }
interface State { hasError: boolean; error?: Error; }

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }

  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ReturnFlow Error Boundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: 'var(--brand-navy)', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button className="btn-primary-teal" onClick={() => {
            this.setState({ hasError: false });
            this.props.onNavigateHome();
          }}>
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
