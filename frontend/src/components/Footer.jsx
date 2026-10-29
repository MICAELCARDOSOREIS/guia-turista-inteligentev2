import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '3rem',
        padding: '1.5rem 1.75rem',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div>
        <strong className="font-display" style={{ color: 'var(--text-primary)' }}>
          Guia do Turista Brasil
        </strong>{' '}
        — Microsserviço FastAPI ASGI & SPA React 19
      </div>
      <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Maria Clara • Roger Pierre • Antonio Carlos • Micael Cardoso — Prof. Maykol Sampaio
      </div>
    </footer>
  );
}
