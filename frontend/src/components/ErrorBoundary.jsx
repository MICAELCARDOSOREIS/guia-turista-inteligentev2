import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ margin: '2rem auto', maxWidth: 600, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-danger)', marginBottom: '0.5rem' }}>
            Ops! Algo inesperado aconteceu na interface.
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'Falha na renderização de componentes.'}
          </p>
          <button
            className="btn-primary"
            style={{ width: 'auto' }}
            onClick={() => window.location.reload()}
          >
            Recarregar Aplicação
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
