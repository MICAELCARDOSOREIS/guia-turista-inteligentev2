import React from 'react';

export default function TelemetriaCard({ telemetria }) {
  if (!telemetria) return null;

  return (
    <div
      className="card"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px dashed var(--border-color)',
        padding: '0.85rem 1.25rem',
        marginTop: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
          ⚡ TELEMETRIA EM TEMPO REAL & DIAGNÓSTICO ASGI
        </span>
        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
          Provedores: 4/4 Ativos
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Latência API (X-Process-Time):</span>
          <div style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>
            {telemetria.latenciaApi || '<1000ms'}
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Tempo Total Front-End:</span>
          <div style={{ fontWeight: 700 }}>
            {telemetria.latenciaFront || 'Calculando...'}
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Correlation-ID:</span>
          <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>
            {telemetria.requestId || 'req_auto'}
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Sessão Ativa:</span>
          <div style={{ fontWeight: 600 }}>
            {telemetria.usuarioAtivo?.startsWith('google_')
              ? 'Google Autenticado'
              : 'Visitante Volátil'}
          </div>
        </div>
      </div>
    </div>
  );
}
