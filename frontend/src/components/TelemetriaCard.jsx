import React from 'react';

export default function TelemetriaCard({ telemetria }) {
  if (!telemetria) return null;

  return (
    <div className="telemetry-statusbar">
      <div>
        <span>STATUS ASGI: 4/4 PROVEDORES ATIVOS</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
        <span>X-Process-Time: {telemetria.latenciaApi || '<1000ms'}</span>
        <span>Tempo Front: {telemetria.latenciaFront || '--'}</span>
        <span>Req-ID: {telemetria.requestId || 'req_auto'}</span>
        <span>
          Sessão: {telemetria.usuarioAtivo?.startsWith('google_') ? 'Google OAuth' : 'Visitante (2h)'}
        </span>
      </div>
    </div>
  );
}
