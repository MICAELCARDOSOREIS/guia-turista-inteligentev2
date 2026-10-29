import React from 'react';

export default function RoteiroResult({
  roteiro,
  textoGuiaStream,
  streamingGuia,
  onAlternarVisita,
}) {
  if (!roteiro) return null;

  const { clima, atrativos_sugeridos, gastronomia_sugerida, atrativos_visitados, guia } = roteiro;
  const visitadosSet = new Set(atrativos_visitados || []);
  const textoExibicao = textoGuiaStream || guia;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
      {/* Banner Meteorológico */}
      {clima && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
            borderColor: 'var(--accent-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                CLIMA NO DESTINO
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.2rem 0' }}>
                ☀️ {clima.temperatura}°C — {clima.condicao}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Sensação térmica de {clima.sensacao_termica}°C • Umidade: {clima.umidade}% • Vento: {clima.velocidade_vento} km/h
              </p>
            </div>
            <div style={{ fontSize: '2.5rem' }}>🌊</div>
          </div>
        </div>
      )}

      {/* Guia com Streaming SSE */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            🧭 Guia do Viajante Inteligente
          </h3>
          {streamingGuia && (
            <span className="badge badge-warning" style={{ animation: 'pulse 1.5s infinite' }}>
              📡 Streaming SSE Ativo...
            </span>
          )}
        </div>

        <div
          style={{
            lineHeight: 1.7,
            fontSize: '0.95rem',
            whiteSpace: 'pre-wrap',
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {textoExibicao}
          {streamingGuia && <span style={{ display: 'inline-block', width: 8, height: 16, background: 'var(--accent-primary)', marginLeft: 4, verticalAlign: 'middle' }}></span>}
        </div>
      </div>

      {/* Catálogo de Atrativos & Gastronomia com Marcação de Visitas */}
      {atrativos_sugeridos && atrativos_sugeridos.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            📍 Pontos Turísticos & Check-in de Visitas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {atrativos_sugeridos.map((atrativo) => {
              const visitado = visitadosSet.has(atrativo);
              return (
                <div
                  key={atrativo}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${visitado ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: visitado ? 600 : 400, textDecoration: visitado ? 'line-through' : 'none' }}>
                    {atrativo}
                  </span>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      background: visitado ? 'var(--accent-secondary)' : 'transparent',
                      color: visitado ? '#ffffff' : 'var(--text-primary)',
                      borderColor: visitado ? 'var(--accent-secondary)' : 'var(--border-color)',
                    }}
                    onClick={() => onAlternarVisita(atrativo, !visitado)}
                  >
                    {visitado ? '✓ Visitado' : 'Marcar'}
                  </button>
                </div>
              );
            })}
          </div>

          {gastronomia_sugerida && gastronomia_sugerida.length > 0 && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                🍤 Sabores Emblemáticos:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                {gastronomia_sugerida.map((prato) => (
                  <span key={prato} className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                    {prato}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
