import React from 'react';

export default function TelemetriaCard({ telemetria }) {
  if (!telemetria) return null;

  return (
    <div
      className="card"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-strong)',
        padding: '0.95rem 1.25rem',
        marginTop: '1.1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
          Diagnóstico de Telemetria ASGI & Concorrência
        </span>
        <span className="badge badge-success">
          Provedores: 4/4 Operacionais
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.65rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Latência API (X-Process-Time)</span>
          <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '0.1rem' }}>
            {telemetria.latenciaApi || '<1000ms'}
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Tempo Total Front-End</span>
          <div className="font-mono" style={{ fontWeight: 700, marginTop: '0.1rem' }}>
            {telemetria.latenciaFront || 'Calculando...'}
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Correlation ID</span>
          <div className="font-mono" style={{ fontWeight: 600, marginTop: '0.1rem' }}>
            {telemetria.requestId || 'req_auto'}
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>Escopo de Sessão</span>
          <div className="font-mono" style={{ fontWeight: 600, marginTop: '0.1rem' }}>
            {telemetria.usuarioAtivo?.startsWith('google_')
              ? 'Google OAuth 2.0'
              : 'Visitante (TTL 2h)'}
          </div>
        </div>
      </div>
    </div>
  );
}
