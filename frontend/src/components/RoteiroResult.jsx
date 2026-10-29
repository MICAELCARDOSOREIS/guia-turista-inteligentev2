import React from 'react';

export default function RoteiroResult({
  roteiro,
  textoGuiaStream,
  streamingGuia,
  onAlternarVisita,
}) {
  if (!roteiro) return null;

  const { atrativos_sugeridos, gastronomia_sugerida, atrativos_visitados, guia } = roteiro;
  const visitadosSet = new Set(atrativos_visitados || []);
  const textoExibicao = textoGuiaStream || guia;

  return (
    <>
      {/* 4. BLOCO ESQUERDO INFERIOR (7 colunas): Caderno de Campo em Streaming SSE */}
      <div className="card bento-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Caderno de Campo & Roteiro Cultural
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Itinerário narrativo transmitido em tempo real para {roteiro.destino}
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

      {/* 5. BLOCO DIREITO INFERIOR (5 colunas): Passaporte de Visitas + Gastronomia em Grade */}
      <div className="card bento-span-5" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Passaporte de Atrativos
            </h3>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
              {visitadosSet.size}/{atrativos_sugeridos?.length || 0} visitados
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.6rem' }}>
            {atrativos_sugeridos?.map((atrativo) => {
              const visitado = visitadosSet.has(atrativo);
              return (
                <button
                  key={atrativo}
                  type="button"
                  onClick={() => onAlternarVisita(atrativo, !visitado)}
                  style={{
                    background: visitado ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                    border: `1px solid ${visitado ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.45rem',
                    textAlign: 'left',
                    minHeight: '78px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: visitado ? 'var(--accent-secondary)' : 'var(--text-primary)',
                      lineHeight: 1.25,
                    }}
                  >
                    {atrativo}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.68rem',
                      color: visitado ? 'var(--accent-secondary)' : 'var(--text-muted)',
                    }}
                  >
                    {visitado ? '✓ CARIMBADO' : '+ CARIMBAR VISITA'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {gastronomia_sugerida && gastronomia_sugerida.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
              Sabores Regionais Indispensáveis
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.45rem' }}>
              {gastronomia_sugerida.map((prato) => (
                <div
                  key={prato}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                  }}
                >
                  {prato}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
