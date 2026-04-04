import React from 'react';

/**
 * ErrorBoundary — catches any render crash in child components
 * and shows the actual error instead of a blank/black screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[EquiLens] Component crash:', error.message);
    console.error(info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          background: '#131313',
          border: '1px solid #FF1744',
          borderRadius: '8px',
          margin: '16px',
          color: '#FF1744'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚠ Render Error — {this.props.name || 'Component'}
          </div>
          <div style={{ fontSize: '13px', color: '#ffffff', marginBottom: '12px' }}>
            {this.state.error?.message}
          </div>
          <pre style={{
            fontSize: '11px', color: '#565555', overflowX: 'auto',
            background: '#0e0e0e', padding: '12px', borderRadius: '4px',
            maxHeight: '200px', overflowY: 'auto'
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '12px', color: '#00E5FF', background: 'transparent',
              border: '1px solid #00E5FF', padding: '6px 14px',
              cursor: 'pointer', borderRadius: '4px', fontSize: '12px'
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
