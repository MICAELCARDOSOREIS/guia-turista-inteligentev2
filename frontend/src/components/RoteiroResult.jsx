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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
      {/* Condição Climática no Destino */}
      {clima && (
        <div
          className="card"
          style={{
            background:
              'linear-gradient(125deg, rgba(224, 159, 62, 0.14) 0%, rgba(46, 196, 182, 0.1) 100%)',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                 Boletim Meteorológico no Destino ({roteiro.destino})
              </span>
              <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.2rem 0' }}>
                {clima.temperatura}°C — {clima.condicao}
              </h3>
              <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Sensação: {clima.sensacao_termica}°C • Umidade: {clima.umidade}% • Vento: {clima.velocidade_vento} km/h
              </p>
            </div>
            <span className="badge badge-info">Open-Meteo Live</span>
          </div>
        </div>
      )}

      {/* Caderno de Campo — Guia em Streaming SSE */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Caderno de Campo & Roteiro Cultural
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Narrativa gerada sob medida para {roteiro.destino}
            </span>
          </div>
          {streamingGuia ? (
            <span className="badge badge-warning">
              Transmitindo via SSE...
            </span>
          ) : (
            <span className="badge badge-success">
              Roteiro Completo
            </span>
          )}
        </div>

        <div className="editorial-guide-body">
          {textoExibicao}
          {streamingGuia && (
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 16,
                background: 'var(--accent-primary)',
                marginLeft: 5,
                verticalAlign: 'middle',
              }}
            />
          )}
        </div>
      </div>

      {/* Catálogo de Atrativos & Gastronomia com Passaporte de Visitas */}
      {atrativos_sugeridos && atrativos_sugeridos.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Pontos de Interesse & Passaporte de Visitas
            </h3>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {visitadosSet.size} de {atrativos_sugeridos.length} visitados
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }}>
            {atrativos_sugeridos.map((atrativo) => {
              const visitado = visitadosSet.has(atrativo);
              return (
                <div
                  key={atrativo}
                  style={{
                    background: visitado ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                    border: `1px solid ${visitado ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.8rem 0.95rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: visitado ? 600 : 500,
                      color: visitado ? 'var(--accent-secondary)' : 'var(--text-primary)',
                    }}
                  >
                    {atrativo}
                  </span>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.65rem',
                      background: visitado ? 'var(--accent-secondary)' : 'transparent',
                      color: visitado ? '#071318' : 'var(--text-primary)',
                      borderColor: visitado ? 'var(--accent-secondary)' : 'var(--border-strong)',
                    }}
                    onClick={() => onAlternarVisita(atrativo, !visitado)}
                  >
                    {visitado ? '✓ Visitado' : 'Marcar visita'}
                  </button>
                </div>
              );
            })}
          </div>

          {gastronomia_sugerida && gastronomia_sugerida.length > 0 && (
            <div style={{ marginTop: '1.15rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.9rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Gastronomia regional recomendada:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.5rem' }}>
                {gastronomia_sugerida.map((prato) => (
                  <span key={prato} className="badge badge-info">
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
