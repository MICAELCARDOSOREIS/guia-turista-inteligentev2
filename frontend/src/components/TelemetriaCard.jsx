import React from 'react';

export default function TelemetriaCard({ telemetria }) {
  if (!telemetria) return null;

  return (
    <div
      className="card bento-span-12"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        padding: '0.75rem 1.15rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span className="badge badge-success">ASGI 4/4</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
          Telemetria de Concorrência
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.78rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>X-Process-Time: </span>
          <strong className="font-mono" style={{ color: 'var(--accent-secondary)' }}>
            {telemetria.latenciaApi || '<1000ms'}
          </strong>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Tempo Total Front: </span>
          <strong className="font-mono">
            {telemetria.latenciaFront || 'Calculando...'}
          </strong>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Correlation-ID: </span>
          <strong className="font-mono">
            {telemetria.requestId || 'req_auto'}
          </strong>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Escopo: </span>
          <strong className="font-mono">
            {telemetria.usuarioAtivo?.startsWith('google_') ? 'Google OAuth' : 'Visitante (2h)'}
          </strong>
        </div>
      </div>
    </div>
  );
}
