import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '0.85rem 1.5rem',
        borderTop: '1px solid var(--line-hairline)',
        background: 'var(--bg-surface)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div>
        <strong>Guia do Turista Brasil</strong> — Microsserviço FastAPI ASGI & React 19
      </div>
      <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
        Maria Clara • Roger Pierre • Antonio Carlos • Micael Cardoso — Prof. Maykol Sampaio
      </div>
    </footer>
  );
}
