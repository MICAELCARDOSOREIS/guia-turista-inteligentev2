import React from 'react';

export default function HistoricoViagens({
  viagens,
  roteiroAtual,
  onSelecionar,
  onExcluir,
}) {
  if (!viagens || viagens.length === 0) {
    return (
      <div className="card" style={{ padding: '1rem 1.15rem' }}>
        <div className="font-display" style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.2rem' }}>
          Diário de Bordo
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Suas rotas calculadas aparecem aqui como cartões rápidos.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
        <h3 className="font-display" style={{ fontSize: '0.98rem', fontWeight: 700 }}>
          Diário de Bordo
        </h3>
        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {viagens.length} {viagens.length === 1 ? 'salva' : 'salvas'}
        </span>
      </div>

      {/* Grade de Cartões Compactos (2 por linha em vez de lista) */}
      <div className="saved-trips-grid">
        {viagens.map((v) => {
          const selecionado = roteiroAtual?.id === v.id;
          return (
            <div
              key={v.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.65rem 0.7rem',
                borderRadius: 'var(--radius-sm)',
                background: selecionado ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                border: `1px solid ${selecionado ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                gap: '0.4rem',
              }}
              onClick={() => onSelecionar(v)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.25 }}>
                  {v.origem?.split('-')[0]?.trim()} → {v.destino?.split('-')[0]?.trim()}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExcluir(v.id);
                  }}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    lineHeight: 1,
                    padding: '0 2px',
                  }}
                  title="Remover viagem"
                  aria-label={`Excluir viagem para ${v.destino}`}
                >
                  ×
                </button>
              </div>

              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)' }}>
                {v.rota?.distancia_km} km • R$ {v.custos?.custo_total?.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
