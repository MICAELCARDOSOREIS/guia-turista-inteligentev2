import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '3rem',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}
    >
      <p>
        <b>Guia do Turista Inteligente v2</b> — Atividade Unidade 2 (FastAPI ASGI & React 19)
      </p>
      <p style={{ marginTop: '0.25rem' }}>
        Equipe: Maria Clara, Roger Pierre, Antonio Carlos e Micael Cardoso • Professor Maykol Sampaio
      </p>
    </footer>
  );
}
