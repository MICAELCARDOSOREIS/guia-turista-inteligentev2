import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '0.5rem 0.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}
    >
      <span>Guia do Turista Inteligente • FastAPI ASGI & React 19</span>
      <span>Maria Clara • Roger Pierre • Antonio Carlos • Micael Cardoso</span>
    </footer>
  );
}
