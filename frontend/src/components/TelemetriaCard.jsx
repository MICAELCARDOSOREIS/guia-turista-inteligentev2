import React from 'react';

export default function TelemetriaCard({ telemetria }) {
  if (!telemetria) return null;

  return (
    <div
      className="surface-box font-mono"
      style={{
        padding: '0.65rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.72rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)', display: 'inline-block' }} />
        <strong style={{ color: 'var(--text-main)' }}>ASGI FastAPI Online</strong>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
        <span>API: {telemetria.latenciaApi || '<1000ms'}</span>
        <span>Total: {telemetria.latenciaFront || '--'}</span>
        <span>Req: {telemetria.requestId || 'req_auto'}</span>
      </div>
    </div>
  );
}
